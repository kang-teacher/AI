/* 페이지 이동(단원 + 마당), 진도, 첫 화면 */
const CHAPTERS = [
  { id: 'home', emoji: '🏠', short: '시작' },
  { id: 'ai', emoji: '🤖', short: 'AI 개념', desc: '인공지능 ⊃ 기계학습 ⊃ 딥러닝, 인공지능의 특성, 규칙 vs 학습' },
  { id: 'search', emoji: '🧭', short: '탐색', desc: '상태 공간, 강 건너기, 깊이·너비 우선, 휴리스틱과 A*, 8-퍼즐' },
  { id: 'data', emoji: '📊', short: '데이터', desc: '문제 해결 과정, 수집·종류·속성, 편향, 전처리, 시각화와 핵심 속성' },
  { id: 'ml', emoji: '📈', short: '머신러닝 유형', desc: '지도·비지도·강화학습, 회귀·분류, 모델 평가와 적합도, K-평균' },
  { id: 'dl', emoji: '🧠', short: '딥러닝', desc: '퍼셉트론과 임계치, 입력·은닉·출력층, 딥러닝의 활용 분야' },
  { id: 'lab', emoji: '🧪', short: '실습', desc: '펭귄·붓꽃·자동차 연비 진짜 데이터로 전처리 → 학습 → 평가 → 예측, 파이썬 코드로도 실행' },
];

/* 각 단원 안의 마당(소단원) 목록은 HTML의 .sub[data-sub][data-title]에서 읽어요 */
function subsOf(ch) { return $$(`.chapter[data-ch="${ch}"] .sub`).map((s) => ({ id: s.dataset.sub, title: s.dataset.title })); }

/* 이동 순서: 단원과 마당을 한 줄로 펼친 목록 (home, ai, search, data/0, data/1, ...) */
function pageList() {
  const out = [];
  CHAPTERS.forEach((c) => {
    const subs = subsOf(c.id);
    if (subs.length) subs.forEach((s) => out.push({ ch: c.id, sub: s.id, title: s.title }));
    else out.push({ ch: c.id, sub: null, title: $(`.chapter[data-ch="${c.id}"]`).dataset.title });
  });
  return out;
}

function initNav() {
  const nav = $('#chapnav');
  nav.innerHTML = CHAPTERS.map((c, i) => `<a href="#${c.id}" data-id="${c.id}">${c.emoji} ${i ? i + '. ' + c.short : '시작'}<span class="ck"></span></a>`).join('');
  $('#chapterCards').innerHTML = CHAPTERS.slice(1).map((c, i) => {
    const title = $(`.chapter[data-ch="${c.id}"]`).dataset.title;
    const n = subsOf(c.id).length;
    return `<a class="chapter-card" href="#${c.id}" data-id="${c.id}"><span class="cc-done"></span><div class="cc-emoji">${c.emoji}</div><h3>${i + 1}. ${title}</h3><p>${c.desc}</p>${n ? `<small class="cc-subs">마당 ${n}개</small>` : ''}</a>`;
  }).join('');

  // 마당 탭 만들기
  $$('.chapter').forEach((sec) => {
    const subs = subsOf(sec.dataset.ch);
    const bar = $('.subnav', sec);
    if (!bar || !subs.length) return;
    bar.innerHTML = subs.map((s) => `<a href="#${sec.dataset.ch}/${s.id}" data-sub="${s.id}"><span class="sn-id">${s.id}</span>${s.title}<i class="sn-ck"></i></a>`).join('');
  });

  const pages = pageList();
  const parse = () => {
    let [ch, sub] = location.hash.slice(1).split('/');
    if (!CHAPTERS.some((c) => c.id === ch)) ch = 'home';
    const subs = subsOf(ch);
    if (subs.length && !subs.some((s) => s.id === sub)) sub = store.get('lastSub:' + ch, subs[0].id);
    if (!subs.length) sub = null;
    return { ch, sub };
  };
  const go = () => {
    const { ch, sub } = parse();
    $$('.chapter').forEach((s) => s.classList.toggle('on', s.dataset.ch === ch));
    $$('a', nav).forEach((a) => a.classList.toggle('on', a.dataset.id === ch));
    $('.on', nav)?.scrollIntoView({ inline: 'center', block: 'nearest' });
    const sec = $(`.chapter[data-ch="${ch}"]`);
    if (sub) {
      $$('.sub', sec).forEach((s) => s.classList.toggle('on', s.dataset.sub === sub));
      $$('.subnav a', sec).forEach((a) => a.classList.toggle('on', a.dataset.sub === sub));
      $('.subnav a.on', sec)?.scrollIntoView({ inline: 'center', block: 'nearest' });
      store.set('lastSub:' + ch, sub);
    }
    const idx = pages.findIndex((p) => p.ch === ch && p.sub === sub);
    $('#progressFill').style.width = (idx / (pages.length - 1)) * 100 + '%';
    $('#prevBtn').disabled = idx === 0;
    $('#nextBtn').disabled = idx === pages.length - 1;
    const chTitle = sec.dataset.title;
    $('#pagerTitle').textContent = sub ? `${chTitle} · ${sub} ${pages[idx].title}` : chTitle;
    window.scrollTo({ top: sub && go.lastCh === ch ? Math.min(window.scrollY, sec.offsetTop) : 0, behavior: 'instant' });
    go.lastCh = ch;
    const key = sub ? ch + '/' + sub : ch;
    const seen = store.get('seen', []);
    if (!seen.includes(key)) { seen.push(key); store.set('seen', seen); }
    markDone();
    document.dispatchEvent(new CustomEvent('chapter', { detail: { ch, sub } }));
  };
  const step = (d) => {
    const { ch, sub } = parse();
    const idx = pages.findIndex((p) => p.ch === ch && p.sub === sub);
    const p = pages[clamp(idx + d, 0, pages.length - 1)];
    location.hash = p.sub ? `${p.ch}/${p.sub}` : p.ch;
  };
  $('#prevBtn').addEventListener('click', () => step(-1));
  $('#nextBtn').addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight' && e.altKey) step(1);
    if (e.key === 'ArrowLeft' && e.altKey) step(-1);
  });
  window.addEventListener('hashchange', go);
  document.addEventListener('progress', markDone);
  go();
}

function markDone() {
  const seen = store.get('seen', []);
  CHAPTERS.slice(1).forEach((c) => {
    const subs = subsOf(c.id);
    const quizKeys = $$(`.chapter[data-ch="${c.id}"] .quiz[data-quiz]`).map((q) => q.dataset.quiz);
    const done = quizKeys.filter((k) => store.get('quiz:' + k, null) !== null).length;
    const seenN = subs.length ? subs.filter((s) => seen.includes(c.id + '/' + s.id)).length : seen.includes(c.id) ? 1 : 0;
    let label = '';
    if (quizKeys.length && done === quizKeys.length) label = '✔ 퀴즈 완료';
    else if (subs.length && seenN) label = `👀 ${seenN} / ${subs.length} 마당`;
    else if (seenN) label = '👀 봤어요';
    const card = $(`.chapter-card[data-id="${c.id}"] .cc-done`); if (card) card.textContent = label;
    const ck = $(`#chapnav a[data-id="${c.id}"] .ck`); if (ck) ck.textContent = quizKeys.length && done === quizKeys.length ? '✔' : '';
    subs.forEach((s) => {
      const el = $(`.chapter[data-ch="${c.id}"] .subnav a[data-sub="${s.id}"] .sn-ck`);
      if (el) el.textContent = seen.includes(c.id + '/' + s.id) ? '✓' : '';
    });
  });
}

function initTheme() {
  const root = document.documentElement;
  const saved = store.get('theme', null);
  if (saved) root.dataset.theme = saved;
  $('#themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
    document.dispatchEvent(new Event('themechange'));
  });
}

/* 첫 화면: 데이터 점들이 신경망을 지나 답이 되는 애니메이션 */
function initHero() {
  const cv = $('#heroCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  let visible = true;
  whenVisible(cv, (v) => { visible = v; });
  const L = [4, 6, 6, 3];
  const N = L.map((n, li) => Array.from({ length: n }, (_, k) => ({ x: 70 + li * (W - 140) / (L.length - 1), y: 60 + (k + .5) * (H - 120) / n })));
  const icons = ['📷', '🎤', '🌡️', '📄'], outs = ['🐱', '🚗', '🌧️'];
  const t0 = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible || !$('.chapter[data-ch="home"]').classList.contains('on')) return;
    const t = ((now - t0) / 1000) % 5;
    ctx.clearRect(0, 0, W, H);
    for (let li = 0; li < N.length - 1; li++) for (const a of N[li]) for (const b of N[li + 1]) {
      const act = t > li * .9 && t < li * .9 + 1.4;
      ctx.strokeStyle = act ? cssVar('--yellow') : cssVar('--line'); ctx.globalAlpha = act ? .9 : .8; ctx.lineWidth = act ? 1.8 : 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      if (t > li * .9 && t < li * .9 + .9) {
        const f = (t - li * .9) / .9;
        ctx.globalAlpha = 1; ctx.fillStyle = cssVar('--orange');
        ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 2.6, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    N.forEach((col, li) => col.forEach((p, k) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, li === 0 || li === 3 ? 20 : 11, 0, Math.PI * 2);
      ctx.fillStyle = li === 0 ? cssVar('--yellow-soft') : li === 3 ? cssVar('--blue-soft') : cssVar('--green-2');
      ctx.fill();
      ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (li === 0) ctx.fillText(icons[k], p.x, p.y + 1);
      if (li === 3) { ctx.globalAlpha = t > 2.8 ? 1 : .25; ctx.fillText(outs[k], p.x, p.y + 1); ctx.globalAlpha = 1; }
    }));
    ctx.fillStyle = cssVar('--muted'); ctx.font = '13px "Noto Sans KR"';
    ['데이터', '학습', '학습', '판단·예측'].forEach((s, li) => ctx.fillText(s, N[li][0].x, 24));
  };
  requestAnimationFrame(frame);
}

document.addEventListener('DOMContentLoaded', () => {
  // 한 활동에 문제가 생겨도 나머지 활동은 동작하도록 따로따로 실행
  const inits = [initTheme, initNav, initHero];
  ['initAI', 'initSearch', 'initData', 'initML', 'initDL', 'initLab', 'initPyLab', 'initQuizzes'].forEach((n) => { if (typeof window[n] === 'function') inits.push(window[n]); });
  inits.forEach((fn) => { try { fn(); } catch (e) { console.error(fn.name, e); } });
});
