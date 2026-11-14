/* 4단원: 머신러닝의 유형 */
function initML() {
  runAll(initTypeTree, initFlip, initSupTable, initLabelFruits, initRegClsSorter, initSLR, initMLR, initKNN, initDTree,
    initSplit, initErrMetrics, initSpam, initFit, initGroup, initKMeans, initBasket, initCycle, initHunt, initRL, initBandit,
    initCmpTable, initTypeSorter);
}

/* --- 4-0 종류 지도 --- */
function initTypeTree() {
  const C = { sup: 'var(--blue)', uns: 'var(--purple)', rl: 'var(--orange)' };
  const INFO = {
    ml: { c: 'var(--green)', h: '📈 머신러닝 (기계학습)', d: '컴퓨터가 데이터를 기반으로 학습하여 문제를 해결하는 기술이에요.<br><b>무엇으로 배우느냐</b>에 따라 지도학습, 비지도학습, 강화학습으로 나눠요.', a: '공부법이 다른 세 학생: 정답지가 있는 학생, 정답지 없이 스스로 정리하는 학생, 직접 해 보며 점수를 받는 학생' },
    sup: { c: C.sup, h: '👩‍🏫 지도학습', d: '문제(입력 데이터)와 정답(레이블)을 <b>함께</b> 학습해서 문제와 정답 사이의 관계를 이해해요.', a: '📘 정답이 있는 문제집으로 공부하기', ex: ['사진 + "고양이"', '메일 + "스팸"', '공부 시간 + 점수'], go: '4-1' },
    reg: { c: C.sup, h: '📏 예측(회귀)', d: '레이블이 <b>연속적인 값(숫자)</b>일 때 미래의 값을 예측해요. 대표 알고리즘: 단순 선형 회귀, 다중 선형 회귀', a: '🔢 "몇 점일까? 몇 분 걸릴까?"', ex: ['시험 점수', '집값', '도착 예정 시간'], go: '4-2' },
    cls: { c: C.sup, h: '🏷️ 분류', d: '레이블이 몇 가지 <b>범주(종류)</b>일 때, 입력이 어떤 범주에 속하는지 예측해요. 대표 알고리즘: K-최근접 이웃, 의사결정트리', a: '🗳️ "강아지일까, 고양이일까?"', ex: ['스팸/정상', '손글씨 숫자 0~9', '동물 종류'], go: '4-3' },
    uns: { c: C.uns, h: '🧩 비지도학습', d: '정답(레이블) <b>없이</b> 입력 데이터만으로 학습해요. 데이터에서 패턴을 추출해 어떤 특성이 있는지 알아내요.', a: '🧺 정답 없이 빨래를 "비슷한 것끼리" 개어 보기', ex: ['고객 그룹 나누기', 'CCTV 관리 구역', '같이 팔리는 물건'], go: '4-5' },
    clu: { c: C.uns, h: '🫧 군집', d: '데이터를 <b>비슷한 특성을 가진 여러 그룹</b>으로 나눠요. 대표 알고리즘: K-평균, 군집 수는 엘보우 방법으로 정해요.', a: '🍭 사탕을 비슷한 것끼리 나눠 담기', ex: ['K-평균', '엘보우 방법'], go: '4-5' },
    rl: { c: C.rl, h: '🎮 강화학습', d: '에이전트가 환경과 상호작용하며 얻은 <b>보상</b>을 바탕으로 학습하고, <b>더 큰 보상</b>을 받는 행동을 골라요.', a: '🐶 "앉아!" 훈련: 잘하면 간식', ex: ['알파고', '로봇 걷기', '자율주행'], go: '4-6' },
    rlgame: { c: C.rl, h: '🤖 시행착오로 배우기', d: '처음엔 엉망이지만 해 볼수록 보상이 큰 행동을 더 자주 고르게 돼요.', a: '🚲 넘어지며 자전거 배우기', ex: ['보상', '탐험과 활용', '정책'], go: '4-6' },
  };
  const box = $('#typeInfo');
  const show = (k) => {
    const i = INFO[k];
    $$('#typeTree .tree-node').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
    box.style.setProperty('--info-c', i.c);
    box.innerHTML = `<h3>${i.h}</h3><p>${i.d}</p><div class="analogy">💬 비유: ${i.a}</div>${i.ex ? `<div class="ex">${i.ex.map((x) => `<span>${x}</span>`).join('')}</div>` : ''}${i.go ? `<p style="margin-top:10px"><a class="btn btn-ghost btn-sm" href="#ml/${i.go}">${i.go} 마당으로 가기 →</a></p>` : ''}`;
  };
  $$('#typeTree .tree-node').forEach((b) => b.addEventListener('click', () => show(b.dataset.k)));
  show('ml');
}

function initFlip() { $$('.flip').forEach((f) => f.addEventListener('click', () => f.classList.toggle('on'))); }

/* --- 4-1 지도학습 --- */
const FRUIT = { a: { e: '🍎', n: '사과' }, b: { e: '🍌', n: '바나나' }, g: { e: '🍇', n: '포도' } };
function initSupTable() {
  const rows = [['빨강', 8, 200, 'a'], ['노랑', 19, 120, 'b'], ['보라', 2, 5, 'g'], ['빨강', 9, 230, 'a'], ['노랑', 17, 110, 'b'], ['초록', 9, 210, 'a'], ['보라', 2.5, 6, 'g'], ['노랑', 7, 60, '?']];
  $('#supTable').innerHTML = `<tr><th class="feat-col">색</th><th class="feat-col">길이(cm)</th><th class="feat-col">무게(g)</th><th class="label-col">레이블: 과일 이름</th></tr>` +
    rows.map((r) => `<tr><td class="feat-col">${r[0]}</td><td class="feat-col num">${r[1]}</td><td class="feat-col num">${r[2]}</td><td class="label-col">${r[3] === '?' ? '❓ (예측해야 할 새 데이터)' : FRUIT[r[3]].e + ' ' + FRUIT[r[3]].n}</td></tr>`).join('');
}

function initLabelFruits() {
  const HUE = { 빨강: 0, 초록: 1.2, 노랑: 2, 보라: 5 };
  const train = [['a', '빨강', 8], ['b', '노랑', 18], ['g', '보라', 2], ['a', '빨강', 9], ['g', '보라', 2.4], ['b', '노랑', 20], ['a', '초록', 8.5], ['b', '노랑', 16], ['g', '보라', 1.8], ['a', '빨강', 7.5], ['g', '보라', 2.6], ['b', '노랑', 19]];
  const test = [['a', '빨강', 8.2], ['b', '노랑', 17], ['g', '보라', 2.2], ['a', '초록', 9], ['b', '노랑', 19.5], ['g', '보라', 1.9]];
  const ORDER = [null, 'a', 'b', 'g'];
  let labels, t0, timer;
  const grid = $('#lfGrid');
  const render = () => {
    grid.innerHTML = train.map(([k, c, l], i) => `<button class="lf" data-i="${i}"><span class="big-emoji">${FRUIT[k].e}</span><small>${c} · ${l}cm</small><b>${labels[i] ? FRUIT[labels[i]].e + ' ' + FRUIT[labels[i]].n : '이름표 없음'}</b></button>`).join('');
    $$('.lf', grid).forEach((b) => b.addEventListener('click', () => {
      if (!t0) { t0 = Date.now(); timer = setInterval(() => { $('#lfTime').textContent = Math.round((Date.now() - t0) / 1000) + '초'; }, 500); }
      const i = +b.dataset.i; labels[i] = ORDER[(ORDER.indexOf(labels[i]) + 1) % ORDER.length]; render();
    }));
    $('#lfCount').textContent = `${labels.filter(Boolean).length} / 12`;
  };
  const reset = () => { labels = Array(12).fill(null); t0 = 0; clearInterval(timer); $('#lfTime').textContent = '0초'; $('#lfResult').textContent = '아직 학습 전이에요.'; render(); };
  const dist = (a, b) => Math.hypot((HUE[a[1]] - HUE[b[1]]) * 4, a[2] - b[2]);
  $('#lfTrain').addEventListener('click', () => {
    const n = labels.filter(Boolean).length;
    if (n < 12) { toast(`이름표를 ${12 - n}개 더 붙여 주세요!`); return; }
    clearInterval(timer);
    const wrongLab = labels.filter((l, i) => l !== train[i][0]).length;
    let right = 0;
    const out = test.map((t) => {
      let bi = 0; train.forEach((r, i) => { if (dist(r, t) < dist(train[bi], t)) bi = i; });
      const p = labels[bi], ok = p === t[0]; if (ok) right++;
      return `<li>${FRUIT[t[0]].e} <small>${t[1]} · ${t[2]}cm</small> → AI: <b>${FRUIT[p].e} ${FRUIT[p].n}</b> ${ok ? '⭕' : '❌'} <small class="muted">(가장 닮은 ${bi + 1}번 과일의 이름표를 따라감)</small></li>`;
    });
    $('#lfResult').innerHTML = `<b>새 과일 ${right} / ${test.length}개 정답</b><ul class="ex-list plain">${out.join('')}</ul>` +
      (wrongLab ? `<p class="warn-text">⚠️ 틀린 이름표가 ${wrongLab}개 있었어요. 틀린 레이블을 배운 AI는 비슷한 과일도 틀려요.</p>` : '<p>🎉 이름표가 모두 정확했어요. 정확한 레이블 = 똑똑한 AI!</p>');
    if (right === test.length) confetti(50);
  });
  $('#lfReset').addEventListener('click', reset);
  reset();
}

function initRegClsSorter() {
  makeSorter($('#rcSorter').closest('.card'), [
    ['🌡️ 내일 최고 기온', 'reg'], ['🏠 아파트 가격', 'reg'], ['🚗 도착 예정 시간', 'reg'], ['📝 기말고사 점수', 'reg'], ['🍦 오늘 아이스크림 판매량', 'reg'],
    ['📧 스팸 메일 / 정상 메일', 'cls'], ['🩸 혈액형 맞히기', 'cls'], ['✍️ 손글씨 숫자 0~9', 'cls'], ['🐾 사진 속 동물 종류', 'cls'], ['😊 댓글 긍정 / 부정', 'cls'],
  ], '회귀와 분류를 정확히 구분했어요.');
}

/* --- 4-2 단순 선형 회귀: 내가 끄는 직선 vs 컴퓨터 --- */
function initSLR() {
  const cv = $('#slrCanvas');
  const P = plotFrame(cv, { x0: 0, x1: 10, y0: 0, y1: 100, xl: '공부 시간(시간) →', yl: '↑ 점수', xt: 10, yt: 4 });
  let pts, mine = { y1: 30, y9: 60 }, com = null, drag = null, anim = null;
  const fMine = (x) => mine.y1 + (mine.y9 - mine.y1) * (x - 1) / 8;
  const mae = (f) => mean(pts.map((p) => Math.abs(p.y - f(p.x))));
  const newData = () => { const r = seeded(Date.now() % 1000); pts = Array.from({ length: 14 }, () => { const x = 0.5 + r() * 9; return { x, y: clamp(28 + x * 6.5 + gauss(r) * 7, 3, 98) }; }); com = null; };
  function draw() {
    const { ctx, W, H } = P; ctx.clearRect(0, 0, W, H); P.axes();
    ctx.save(); ctx.beginPath(); ctx.rect(46, 16, W - 62, H - 56); ctx.clip();
    ctx.strokeStyle = 'rgba(226,72,61,.65)'; ctx.lineWidth = 2;
    pts.forEach((p) => { ctx.beginPath(); ctx.moveTo(P.px(p.x), P.py(p.y)); ctx.lineTo(P.px(p.x), P.py(fMine(p.x))); ctx.stroke(); });
    ctx.strokeStyle = cssVar('--blue'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(P.px(0), P.py(fMine(0))); ctx.lineTo(P.px(10), P.py(fMine(10))); ctx.stroke();
    if (com) { ctx.strokeStyle = cssVar('--orange'); ctx.setLineDash([10, 7]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(P.px(0), P.py(com.b)); ctx.lineTo(P.px(10), P.py(com.b + com.a * 10)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
    pts.forEach((p) => { ctx.beginPath(); ctx.arc(P.px(p.x), P.py(p.y), 7, 0, Math.PI * 2); ctx.fillStyle = cssVar('--green'); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); });
    [[1, mine.y1], [9, mine.y9]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(P.px(x), P.py(y), 11, 0, Math.PI * 2); ctx.fillStyle = cssVar('--blue'); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); });
    ctx.font = '13px "Noto Sans KR"'; ctx.fillStyle = cssVar('--blue'); ctx.fillText('🙋 내 직선 (손잡이를 끌어요)', 56, 34);
    if (com) { ctx.fillStyle = cssVar('--orange'); ctx.fillText('💻 컴퓨터 직선', 56, 54); }
    $('#slrMine').textContent = fmt(mae(fMine)) + '점';
    $('#slrCom').textContent = com ? fmt(mae((x) => com.b + com.a * x)) + '점' : '-';
    if (com && com.done) {
      const x = +$('#slrX').value, y = clamp(com.b + com.a * x, 0, 100);
      $('#slrPred').innerHTML = `${x}시간 공부하면 약 <b>${Math.round(y)}점</b> (식: 점수 = ${fmt(com.a)} × 시간 + ${fmt(com.b)})`;
    }
  }
  onDrag(cv, {
    down: (p) => {
      const h = [[1, 'y1'], [9, 'y9']].find(([x, k]) => Math.hypot(p.x - P.px(x), p.y - P.py(mine[k])) < 22);
      if (h) { drag = h[1]; return; }
      if (P.inside(p)) { pts.push({ x: P.ix(p.x), y: P.iy(p.y) }); if (com) com.done = false; draw(); }
    },
    move: (p) => { if (drag) { mine[drag] = clamp(P.iy(p.y), -20, 120); draw(); } },
    up: () => { drag = null; },
  });
  $('#slrTrain').addEventListener('click', () => {
    cancelAnimationFrame(anim);
    let a = 0, b = 50, ep = 0; com = { a, b };
    const xs = pts.map((p) => p.x / 10), ys = pts.map((p) => p.y / 100);
    let A = 0, B = .5;
    const loop = () => {
      for (let k = 0; k < 4; k++) { let ga = 0, gb = 0; xs.forEach((x, i) => { const e = A * x + B - ys[i]; ga += e * x; gb += e; }); A -= .9 * ga / xs.length; B -= .9 * gb / xs.length; }
      com = { a: A * 10, b: B * 100 }; ep++; draw();
      if (ep < 150) anim = requestAnimationFrame(loop); else { com.done = true; draw(); toast(`학습 완료! 평균 오차 ${fmt(mae((x) => com.b + com.a * x))}점`); }
    };
    loop();
  });
  $('#slrNew').addEventListener('click', () => { cancelAnimationFrame(anim); newData(); $('#slrPred').textContent = '컴퓨터 학습을 먼저 해 주세요'; draw(); });
  $('#slrX').addEventListener('input', (e) => { $('#slrXVal').textContent = e.target.value + '시간'; draw(); });
  newData(); draw();
  document.addEventListener('themechange', draw);
}

/* --- 4-2 다중 선형 회귀: 내비게이션 도착 시간 --- */
function initMLR() {
  const cv = $('#mlrCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const r = seeded(7);
  const data = Array.from({ length: 32 }, () => { const d = 1 + r() * 19, s = Math.round(r() * 15); return { d, s, t: 3 + 1.6 * d + 1.3 * s + gauss(r) * 1.6 }; });
  const c1 = leastSquares(data.map((p) => [p.d]), data.map((p) => p.t));
  const c2 = leastSquares(data.map((p) => [p.d, p.s]), data.map((p) => p.t));
  const f1 = (d) => c1[0] + c1[1] * d, f2 = (d, s) => c2[0] + c2[1] * d + c2[2] * s;
  const err1 = mean(data.map((p) => Math.abs(p.t - f1(p.d)))), err2 = mean(data.map((p) => Math.abs(p.t - f2(p.d, p.s))));
  let mode = 1, yaw = -0.7, dragX = null;
  const T1 = 60;
  function draw2D() {
    const P = plotFrame(cv, { x0: 0, x1: 20, y0: 0, y1: T1, xl: '거리(km) →', yl: '↑ 걸린 시간(분)', xt: 4, yt: 6 });
    ctx.clearRect(0, 0, W, H); P.axes();
    ctx.strokeStyle = 'rgba(226,72,61,.6)'; ctx.lineWidth = 2;
    data.forEach((p) => { ctx.beginPath(); ctx.moveTo(P.px(p.d), P.py(p.t)); ctx.lineTo(P.px(p.d), P.py(f1(p.d))); ctx.stroke(); });
    ctx.strokeStyle = cssVar('--blue'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(P.px(0), P.py(f1(0))); ctx.lineTo(P.px(20), P.py(f1(20))); ctx.stroke();
    data.forEach((p) => { ctx.beginPath(); ctx.arc(P.px(p.d), P.py(p.t), 7, 0, Math.PI * 2); ctx.fillStyle = `hsl(${140 - p.s * 9},70%,45%)`; ctx.fill(); });
    ctx.font = '12px "Noto Sans KR"'; ctx.fillStyle = cssVar('--muted'); ctx.fillText('점 색: 초록 = 신호등 적음, 빨강 = 신호등 많음', 56, 34);
  }
  function draw3D() {
    ctx.clearRect(0, 0, W, H);
    const pitch = 0.5, S = 13, cx = W / 2, cy = H * 0.68;
    const proj = (d, s, t) => { // d: 0~20 → x, s: 0~15 → y(깊이), t → 높이
      const x = (d - 10) * 1, y = (s - 7.5) * 1.33, z = t * 0.26;
      const xr = x * Math.cos(yaw) - y * Math.sin(yaw), yr = x * Math.sin(yaw) + y * Math.cos(yaw);
      return [cx + xr * S, cy - z * S + yr * S * Math.sin(pitch) * 0.9, yr];
    };
    const line = (a, b, col, w = 1) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
    // 바닥 격자
    for (let d = 0; d <= 20; d += 5) line(proj(d, 0, 0), proj(d, 15, 0), cssVar('--line'));
    for (let s = 0; s <= 15; s += 5) line(proj(0, s, 0), proj(20, s, 0), cssVar('--line'));
    // 평면
    ctx.globalAlpha = .28; ctx.fillStyle = cssVar('--blue'); ctx.beginPath();
    [[0, 0], [20, 0], [20, 15], [0, 15]].forEach(([d, s], i) => { const p = proj(d, s, f2(d, s)); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    for (let d = 0; d <= 20; d += 5) line(proj(d, 0, f2(d, 0)), proj(d, 15, f2(d, 15)), cssVar('--blue'), 1.5);
    for (let s = 0; s <= 15; s += 5) line(proj(0, s, f2(0, s)), proj(20, s, f2(20, s)), cssVar('--blue'), 1.5);
    // 점 + 오차
    const pts = data.map((p) => ({ p, a: proj(p.d, p.s, p.t), b: proj(p.d, p.s, f2(p.d, p.s)) })).sort((u, v) => v.a[2] - u.a[2]);
    pts.forEach(({ p, a, b }) => { line(a, b, 'rgba(226,72,61,.7)', 2); ctx.beginPath(); ctx.arc(a[0], a[1], 6, 0, Math.PI * 2); ctx.fillStyle = `hsl(${140 - p.s * 9},70%,45%)`; ctx.fill(); });
    // 축 이름
    ctx.fillStyle = cssVar('--ink-2'); ctx.font = '13px "Noto Sans KR"';
    const ax = proj(21.5, 0, 0), ay = proj(0, 17, 0), az = proj(0, 0, 62);
    ctx.fillText('거리 →', ax[0], ax[1]); ctx.fillText('신호등 →', ay[0], ay[1]); ctx.fillText('↑ 시간', az[0] - 20, az[1]);
    line(proj(0, 0, 0), proj(0, 0, 60), cssVar('--muted'));
  }
  function draw() {
    mode === 1 ? draw2D() : draw3D();
    $('#mlrErr').textContent = fmt(mode === 1 ? err1 : err2) + '분';
    $('#mlrHint').textContent = mode === 1 ? '점 색을 보세요. 같은 거리라도 신호등이 많은(빨간) 점이 더 오래 걸려요. 직선 하나로는 이 차이를 설명할 수 없어요.' : '그래프를 좌우로 끌어 돌려 보세요. 속성이 2개면 직선 대신 평면이 데이터를 지나가요.';
    $('#mlrFormula').innerHTML = mode === 1 ? `시간 = <b>${fmt(c1[1], 2)}</b> × 거리 + ${fmt(c1[0])}` : `시간 = <b>${fmt(c2[1], 2)}</b> × 거리 + <b>${fmt(c2[2], 2)}</b> × 신호등 + ${fmt(c2[0])}`;
    const d = +$('#mlrD').value, s = +$('#mlrS').value;
    $('#mlrPred').innerHTML = mode === 1 ? `예상 도착 시간: <b>${Math.round(f1(d))}분</b> <small class="muted">(신호등은 모름)</small>` : `예상 도착 시간: <b>${Math.round(f2(d, s))}분</b>`;
  }
  $$('#mlrMode button').forEach((b) => b.addEventListener('click', () => { mode = +b.dataset.m; $$('#mlrMode button').forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
  onDrag(cv, { down: (p) => { dragX = p.x; }, move: (p) => { if (mode === 2 && dragX != null) { yaw += (p.x - dragX) / 160; dragX = p.x; draw(); } }, up: () => { dragX = null; } });
  ['mlrD', 'mlrS'].forEach((id) => $('#' + id).addEventListener('input', () => { $('#mlrDVal').textContent = $('#mlrD').value + 'km'; $('#mlrSVal').textContent = $('#mlrS').value + '개'; draw(); }));
  draw();
  document.addEventListener('themechange', draw);
}

/* --- 4-3 K-최근접 이웃 --- */
function initKNN() {
  const cv = $('#knnCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const COL = ['#e2483d', '#3b6fe0'], NAME = ['빨강', '파랑'];
  let pts = [], q = null, addMode = 'q', map = false;
  const newData = () => {
    pts = [];
    for (let i = 0; i < 18; i++) pts.push({ x: clamp(200 + gauss() * 75, 15, W - 15), y: clamp(160 + gauss() * 70, 15, H - 15), c: 0 });
    for (let i = 0; i < 18; i++) pts.push({ x: clamp(420 + gauss() * 75, 15, W - 15), y: clamp(270 + gauss() * 70, 15, H - 15), c: 1 });
    q = { x: 310, y: 215 };
  };
  const K = () => +$('#knnK').value;
  const classify = (x, y, k) => {
    const nb = pts.map((p) => ({ p, d: Math.hypot(p.x - x, p.y - y) })).sort((a, b) => a.d - b.d).slice(0, k);
    const v = [0, 0]; nb.forEach((n) => v[n.p.c]++);
    return { nb, v, c: v[0] === v[1] ? -1 : v[0] > v[1] ? 0 : 1 };
  };
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (map) {
      const st = 12;
      for (let x = 0; x < W; x += st) for (let y = 0; y < H; y += st) {
        const c = classify(x + st / 2, y + st / 2, K()).c;
        ctx.fillStyle = c < 0 ? 'rgba(150,150,150,.25)' : c ? 'rgba(59,111,224,.16)' : 'rgba(226,72,61,.16)'; ctx.fillRect(x, y, st, st);
      }
    }
    const res = q && classify(q.x, q.y, K());
    if (res) {
      const R = res.nb[res.nb.length - 1].d;
      ctx.setLineDash([6, 6]); ctx.strokeStyle = cssVar('--muted'); ctx.beginPath(); ctx.arc(q.x, q.y, R + 9, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      res.nb.forEach((n) => { ctx.strokeStyle = COL[n.p.c]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(n.p.x, n.p.y); ctx.stroke(); });
    }
    pts.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fillStyle = COL[p.c]; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); });
    if (res) {
      res.nb.forEach((n) => { ctx.beginPath(); ctx.arc(n.p.x, n.p.y, 12, 0, Math.PI * 2); ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 2; ctx.stroke(); });
      ctx.beginPath(); ctx.arc(q.x, q.y, 14, 0, Math.PI * 2); ctx.fillStyle = res.c < 0 ? '#9aa5a0' : COL[res.c]; ctx.fill(); ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', q.x, q.y + 1); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      $('#knnVote').innerHTML = `가까운 이웃 ${K()}개: 🔴 ${res.v[0]}표, 🔵 ${res.v[1]}표<br>` + (res.c < 0 ? '<b>⚖️ 동점이라 정할 수 없어요!</b> K를 홀수로 바꿔 보세요.' : `→ 새 데이터는 <b style="color:${COL[res.c]}">${NAME[res.c]}</b>으로 분류해요.`);
    }
  }
  onDrag(cv, { down: (p) => { if (addMode === 'q') q = p; else pts.push({ x: p.x, y: p.y, c: +addMode }); draw(); }, move: (p) => { if (addMode === 'q') { q = p; draw(); } } });
  $('#knnK').addEventListener('input', (e) => { $('#knnKVal').textContent = e.target.value; draw(); });
  $$('#knnAdd button').forEach((b) => b.addEventListener('click', () => { addMode = b.dataset.c; $$('#knnAdd button').forEach((x) => x.classList.toggle('on', x === b)); }));
  $('#knnMap').addEventListener('click', () => { map = !map; $('#knnMap').textContent = map ? '🗺️ 색칠 끄기' : '🗺️ 전체 영역 색칠'; draw(); });
  $('#knnNew').addEventListener('click', () => { newData(); draw(); });
  newData(); draw();
  document.addEventListener('themechange', draw);
}

/* --- 4-3 의사결정트리 만들기 --- */
function initDTree() {
  const QS = [['legs', '다리가 4개인가요?'], ['egg', '알을 낳나요?'], ['fly', '날 수 있나요?'], ['fur', '털이 있나요?'], ['beak', '부리가 있나요?']];
  const A = [
    { n: '도마뱀', e: '🦎', legs: 1, egg: 1, fly: 0, fur: 0, beak: 0 },
    { n: '호랑이', e: '🐯', legs: 1, egg: 0, fly: 0, fur: 1, beak: 0 },
    { n: '독수리', e: '🦅', legs: 0, egg: 1, fly: 1, fur: 0, beak: 1 },
    { n: '펭귄', e: '🐧', legs: 0, egg: 1, fly: 0, fur: 0, beak: 1 },
  ];
  const TEST = [
    { n: '악어', e: '🐊', legs: 1, egg: 1, fly: 0, fur: 0, beak: 0 },
    { n: '고양이', e: '🐱', legs: 1, egg: 0, fly: 0, fur: 1, beak: 0 },
    { n: '참새', e: '🐦', legs: 0, egg: 1, fly: 1, fur: 0, beak: 1 },
    { n: '타조', e: '🦤', legs: 0, egg: 1, fly: 0, fur: 0, beak: 1 },
  ];
  const tag = (a) => `<span class="chip">${a.e} ${a.n}</span>`;
  $('#dtAnimals').innerHTML = A.map((a) => `<span class="chip">${a.e} ${a.n} <small class="muted">${QS.map(([k, q]) => (a[k] ? q.replace(/가요\?|나요\?|있나요\?|인가요\?/, '').trim() : '')).filter(Boolean).join(', ') || ''}</small></span>`).join('');
  let root;
  const reset = () => { root = { items: A.slice(), q: null }; render(); };
  const complete = (n) => n.items.length <= 1 || (n.q && complete(n.yes) && complete(n.no));
  const depth = (n) => (!n.q ? 0 : 1 + Math.max(depth(n.yes), depth(n.no)));
  const count = (n) => (!n.q ? 0 : 1 + count(n.yes) + count(n.no));
  const nodeHTML = (n, path, used) => {
    if (n.items.length === 1) return `<span class="dt-node leaf">${tag(n.items[0])}</span>`;
    if (!n.q) {
      const opts = QS.filter(([k]) => !used.includes(k)).map(([k, q]) => {
        const y = n.items.filter((a) => a[k]).length, ok = y > 0 && y < n.items.length;
        return `<option value="${k}" ${ok ? '' : 'disabled'}>${q}${ok ? '' : ' (나눠지지 않음)'}</option>`;
      }).join('');
      return `<span class="dt-node mixed">${n.items.map(tag).join('')} <select data-path="${path}"><option value="">질문 고르기 ▾</option>${opts}</select></span>`;
    }
    const q = QS.find(([k]) => k === n.q)[1];
    return `<span class="dt-node">❓ <b>${q}</b> <button class="btn btn-ghost btn-sm" data-undo="${path}" title="이 질문 지우기">↺</button></span>
      <ul><li><span class="dt-branch">예 →</span>${nodeHTML(n.yes, path + 'y', [...used, n.q])}</li><li><span class="dt-branch">아니요 →</span>${nodeHTML(n.no, path + 'n', [...used, n.q])}</li></ul>`;
  };
  const at = (path) => [...path].reduce((n, c) => (c === 'y' ? n.yes : n.no), root);
  function render() {
    $('#dtTree').innerHTML = `<ul><li>${nodeHTML(root, '', [])}</li></ul>`;
    $$('#dtTree select').forEach((s) => s.addEventListener('change', () => {
      const n = at(s.dataset.path); if (!s.value) return;
      n.q = s.value; n.yes = { items: n.items.filter((a) => a[n.q]), q: null }; n.no = { items: n.items.filter((a) => !a[n.q]), q: null }; render();
    }));
    $$('#dtTree [data-undo]').forEach((b) => b.addEventListener('click', () => { const n = at(b.dataset.undo); n.q = null; delete n.yes; delete n.no; render(); }));
    const done = complete(root);
    $('#dtDepth').textContent = done ? depth(root) : '-';
    $('#dtCount').textContent = done ? count(root) : '-';
    $('#dtTest').innerHTML = TEST.map((t, i) => `<button class="chip" data-t="${i}" ${done ? '' : 'disabled'}>${t.e} ${t.n}</button>`).join('');
    $$('#dtTest button').forEach((b) => b.addEventListener('click', () => {
      const t = TEST[+b.dataset.t]; let n = root; const steps = [];
      while (n.q) { const q = QS.find(([k]) => k === n.q)[1], yes = !!t[n.q]; steps.push(`${q} → <b>${yes ? '예' : '아니요'}</b>`); n = yes ? n.yes : n.no; }
      $('#dtPath').hidden = false;
      $('#dtPath').innerHTML = `<b>${t.e} ${t.n}</b>: ${steps.join(' → ')}<br>➡ 도착한 잎: ${tag(n.items[0])} 와 <b>같은 무리</b>로 분류돼요.`;
    }));
    if (done && !render.cele) { render.cele = true; toast(`🌳 트리 완성! 질문 ${count(root)}개, 깊이 ${depth(root)}`); }
    if (!done) render.cele = false;
  }
  $('#dtReset').addEventListener('click', reset);
  reset();
}

/* --- 4-4 훈련/테스트 나누기 --- */
function initSplit() {
  const N = 20, r = seeded(3), order = shuffle(Array.from({ length: N }, (_, i) => i)).map((i) => i), icons = Array.from({ length: N }, (_, i) => '📄');
  const upd = () => {
    const p = +$('#splitR').value, nt = Math.round(N * p / 100);
    $('#splitVal').textContent = p + '%';
    $('#splitBar').innerHTML = `<span class="sp-train" style="width:${p}%">훈련 ${p}%</span><span class="sp-test" style="width:${100 - p}%">${100 - p >= 10 ? '테스트 ' + (100 - p) + '%' : ''}</span>`;
    $('#splitDots').innerHTML = order.map((i, k) => `<span class="mail" style="background:${k < nt ? 'var(--blue-soft)' : 'var(--yellow-soft)'}">${icons[i]} ${k < nt ? '훈련' : '테스트'}</span>`).join('');
    $('#splitMsg').innerHTML = p < 60 ? '⚠️ 훈련 데이터가 너무 적으면 모델이 <b>충분히 배우지 못해요.</b>' : p > 90 ? '⚠️ 테스트 데이터가 너무 적으면 몇 문제만으로 평가하는 셈이라 <b>평가 결과를 믿기 어려워요.</b>' : `👍 훈련 ${nt}개로 배우고, 처음 보는 테스트 ${N - nt}개로 실력을 평가해요. 테스트 데이터는 학습에 절대 쓰지 않아요!`;
  };
  $('#splitR').addEventListener('input', upd); upd();
}

/* --- 4-4 MAE vs MSE --- */
function initErrMetrics() {
  const cv = $('#errCanvas');
  const P = plotFrame(cv, { x0: 0, x1: 10, y0: 0, y1: 10, xl: 'x →', yl: '↑ y', xt: 5, yt: 5 });
  const f = (x) => 0.6 * x + 2;
  const base = [[1, 3.4], [2.5, 2.8], [4, 5.2], [5.5, 4.9], [7, 7.0], [8.5, 6.4]];
  let pts = base.map(([x, y]) => ({ x, y })), drag = null;
  function draw() {
    const { ctx, W, H } = P; ctx.clearRect(0, 0, W, H); P.axes();
    ctx.strokeStyle = cssVar('--blue'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P.px(0), P.py(f(0))); ctx.lineTo(P.px(10), P.py(f(10))); ctx.stroke();
    pts.forEach((p, i) => {
      ctx.strokeStyle = cssVar('--red'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P.px(p.x), P.py(p.y)); ctx.lineTo(P.px(p.x), P.py(f(p.x))); ctx.stroke();
      ctx.beginPath(); ctx.arc(P.px(p.x), P.py(p.y), 10, 0, Math.PI * 2); ctx.fillStyle = cssVar('--green'); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, P.px(p.x), P.py(p.y)); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    });
    const e = pts.map((p) => p.y - f(p.x));
    $('#errTable').innerHTML = `<tr><th>점</th><th>오차</th><th>|오차|</th><th>오차²</th></tr>` + e.map((v, i) => `<tr><td>${i + 1}</td><td class="num">${fmt(v, 2)}</td><td class="num">${fmt(Math.abs(v), 2)}</td><td class="num">${fmt(v * v, 2)}</td></tr>`).join('') +
      `<tr class="hl"><td>평균</td><td></td><td class="num">${fmt(mean(e.map(Math.abs)), 2)}</td><td class="num">${fmt(mean(e.map((v) => v * v)), 2)}</td></tr>`;
    $('#maeVal').textContent = fmt(mean(e.map(Math.abs)), 2); $('#mseVal').textContent = fmt(mean(e.map((v) => v * v)), 2);
  }
  onDrag(cv, { down: (p) => { drag = pts.findIndex((q) => Math.hypot(P.px(q.x) - p.x, P.py(q.y) - p.y) < 20); if (drag < 0) drag = null; }, move: (p) => { if (drag != null) { pts[drag].y = clamp(P.iy(p.y), 0, 10); draw(); } }, up: () => { drag = null; } });
  $('#errOut').addEventListener('click', () => {
    if ($('#errOut').dataset.on) { pts = base.map(([x, y]) => ({ x, y })); delete $('#errOut').dataset.on; $('#errOut').textContent = '😱 점 하나 멀리 보내기'; }
    else { pts[4].y = 9.9; pts[4].x = 7; $('#errOut').dataset.on = 1; $('#errOut').textContent = '↺ 원래대로'; toast('오차가 3배쯤 커지면 MAE는 조금, MSE는 훨씬 많이 커져요!'); }
    draw();
  });
  draw(); document.addEventListener('themechange', draw);
}

/* --- 4-4 혼동행렬 · 정확도 · 정밀도 · 재현율 · F1 --- */
function initSpam() {
  const MAILS = [
    ['🎁 당첨! 상품 받기', 96, 1], ['💰 대출 즉시 승인', 91, 1], ['🔥 오늘만 90% 할인', 84, 1], ['📢 무료 쿠폰 도착', 78, 1], ['🎰 지금 클릭하면 현금', 72, 1], ['💊 기적의 다이어트', 63, 1], ['📦 택배 주소 확인 요망', 55, 1], ['👋 오랜만이야~', 38, 1],
    ['🛍️ 쇼핑몰 주문 완료', 66, 0], ['🏫 학교 가정통신문', 12, 0], ['📚 숙제 제출 안내', 8, 0], ['👨‍👩‍👧 엄마: 저녁 뭐 먹을래', 5, 0], ['⚽ 동아리 모임 공지', 18, 0], ['🧾 휴대폰 요금 안내', 47, 0], ['🎫 공연 예매 확인', 52, 0],
    ['🏥 병원 예약 알림', 22, 0], ['💌 친구 생일 초대', 15, 0], ['📰 뉴스레터 구독', 41, 0], ['🔑 비밀번호 변경 알림', 33, 0], ['📷 사진 공유했어요', 27, 0],
  ];
  let focus = null;
  const upd = () => {
    const t = +$('#spamT').value; $('#spamTVal').textContent = t + '점';
    const cell = (m) => { const p = m[1] >= t ? 1 : 0; return p && m[2] ? 'tp' : p && !m[2] ? 'fp' : !p && m[2] ? 'fn' : 'tn'; };
    const c = { tp: 0, fp: 0, fn: 0, tn: 0 }; MAILS.forEach((m) => c[cell(m)]++);
    $('#mailList').innerHTML = MAILS.slice().sort((a, b) => b[1] - a[1]).map((m) => `<span class="mail ${m[2] ? 'spam' : ''} ${m[1] >= t ? 'pred' : ''} ${focus && cell(m) !== focus ? 'dim' : ''}">${m[0]} <small>${m[1]}</small></span>`).join('');
    const C = (k, lab) => `<div class="c ${k} ${focus === k ? 'on' : ''}" data-k="${k}">${c[k]}<small>${lab}</small></div>`;
    $('#cm').innerHTML = `<div></div><div class="h">예측: 스팸</div><div class="h">예측: 정상</div>
      <div class="h">실제<br>스팸</div>${C('tp', '맞게 잡음')}${C('fn', '놓침')}
      <div class="h">실제<br>정상</div>${C('fp', '잘못 잡음')}${C('tn', '맞게 통과')}`;
    $$('#cm .c').forEach((d) => d.addEventListener('click', () => { focus = focus === d.dataset.k ? null : d.dataset.k; upd(); }));
    const acc = (c.tp + c.tn) / 20, pre = c.tp + c.fp ? c.tp / (c.tp + c.fp) : 0, rec = c.tp / (c.tp + c.fn), f1 = pre + rec ? 2 * pre * rec / (pre + rec) : 0;
    $('#metricBars').innerHTML = barsHTML([
      { n: '정확도', v: acc, label: fmt(acc, 2) }, { n: '정밀도', v: pre, label: fmt(pre, 2), c: 'var(--purple)' }, { n: '재현율', v: rec, label: fmt(rec, 2), c: 'var(--orange)' }, { n: 'F1', v: f1, label: fmt(f1, 2), c: 'var(--blue)' },
    ], { max: 1 });
    $('#metricExplain').innerHTML = `<b>정확도</b> = 맞힌 것 ÷ 전체 = (${c.tp}+${c.tn}) ÷ 20<br><b>정밀도</b> = 진짜 스팸 ÷ 스팸이라고 한 것 = ${c.tp} ÷ ${c.tp + c.fp}<br><b>재현율</b> = 찾아낸 스팸 ÷ 진짜 스팸 = ${c.tp} ÷ ${c.tp + c.fn}<br><b>F1 스코어</b> = 정밀도와 재현율의 조화 평균 (둘 다 높아야 높아요)<br><small class="muted">모두 1에 가까울수록 좋은 모델이에요. 기준을 올리면 정밀도↑ 재현율↓, 내리면 반대예요.</small>`;
  };
  $('#spamT').addEventListener('input', upd); upd();
}

/* --- 4-4 과소적합 · 적합 · 과대적합 --- */
function initFit() {
  const cv = $('#fitCanvas');
  const P = plotFrame(cv, { x0: -1, x1: 1, y0: -1.8, y1: 1.8, xl: '입력 →', yl: '↑ 값', xt: 4, yt: 4, fx: () => '', fy: () => '' });
  const truth = (x) => Math.sin(2.6 * x) + 0.3 * x;
  let tr, te, seed = 11;
  const gen = () => { const r = seeded(seed); tr = Array.from({ length: 11 }, (_, i) => { const x = -0.95 + i * 1.9 / 10 + (r() - .5) * .08; return { x, y: truth(x) + gauss(r) * .22 }; }); te = Array.from({ length: 12 }, () => { const x = -1 + r() * 2; return { x, y: truth(x) + gauss(r) * .22 }; }); };
  const fitPoly = (deg) => leastSquares(tr.map((p) => Array.from({ length: deg }, (_, k) => p.x ** (k + 1))), tr.map((p) => p.y), 1e-9);
  const ev = (c, x) => c.reduce((s, a, k) => s + a * x ** k, 0);
  const mse = (c, d) => mean(d.map((p) => (p.y - ev(c, p.x)) ** 2));
  function draw() {
    const deg = +$('#fitDeg').value, c = fitPoly(deg);
    const { ctx, W, H } = P; ctx.clearRect(0, 0, W, H); P.axes();
    ctx.save(); ctx.beginPath(); ctx.rect(46, 16, W - 62, H - 56); ctx.clip();
    ctx.strokeStyle = cssVar('--green'); ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const x = -1 + i / 150, y = ev(c, x); i ? ctx.lineTo(P.px(x), P.py(y)) : ctx.moveTo(P.px(x), P.py(y)); }
    ctx.stroke(); ctx.restore();
    tr.forEach((p) => { ctx.beginPath(); ctx.arc(P.px(p.x), P.py(p.y), 7, 0, Math.PI * 2); ctx.fillStyle = cssVar('--blue'); ctx.fill(); });
    te.forEach((p) => { ctx.beginPath(); ctx.rect(P.px(p.x) - 6, P.py(p.y) - 6, 12, 12); ctx.fillStyle = cssVar('--orange'); ctx.fill(); });
    const a = mse(c, tr), b = mse(c, te);
    $('#fitDegVal').textContent = deg;
    $('#fitBars').innerHTML = barsHTML([{ n: '🔵 훈련 오차', v: a, label: fmt(a, 3), c: 'var(--blue)' }, { n: '🟠 테스트 오차', v: b, label: fmt(b, 3), c: 'var(--orange)' }], { max: Math.max(.6, a, Math.min(b, 2)) });
    const v = deg <= 2 ? ['과소적합 😴', 'bad', '곡선이 너무 단순해서 훈련 데이터조차 잘 못 맞혀요. 두 오차가 모두 커요.'] : b > a * 2.2 && deg >= 7 ? ['과대적합 🤓', 'bad', '훈련 데이터는 거의 다 맞히지만(외워 버림), 처음 보는 테스트 데이터 오차는 커졌어요.'] : ['적합 😊', 'good', '훈련 오차와 테스트 오차가 모두 작아요. 새 데이터도 잘 맞혀요.'];
    $('#fitVerdict').textContent = v[0]; $('#fitVerdict').className = 'verdict ' + v[1]; $('#fitDesc').textContent = v[2];
  }
  $('#fitDeg').addEventListener('input', draw);
  $('#fitNew').addEventListener('click', () => { seed = Math.floor(Math.random() * 1e6); gen(); draw(); });
  gen(); draw(); document.addEventListener('themechange', draw);
}

/* --- 4-5 내 마음대로 묶어 보기 --- */
function initGroup() {
  const ITEMS = [];
  [['빨강', '🔴', '🟥'], ['파랑', '🔵', '🟦'], ['노랑', '🟡', '🟨']].forEach(([c, o, s]) => [['원', o], ['네모', s]].forEach(([sh, e]) => ['큰', '작은'].forEach((sz) => ITEMS.push({ c, sh, sz, e }))));
  const order = shuffle(ITEMS.map((_, i) => i));
  let pick = 0; const g = Array(12).fill(-1);
  const GC = ['var(--blue)', 'var(--pink)', 'var(--orange)'];
  const render = () => {
    $('#grpItems').innerHTML = order.map((i) => `<button class="chip" data-i="${i}" style="font-size:${ITEMS[i].sz === '큰' ? 2.2 : 1.2}rem;${g[i] >= 0 ? `outline:3px solid ${GC[g[i]]};` : ''}">${ITEMS[i].e}${g[i] >= 0 ? `<small style="font-size:.7rem">${'ABC'[g[i]]}</small>` : ''}</button>`).join('');
    $$('#grpItems button').forEach((b) => b.addEventListener('click', () => { g[+b.dataset.i] = pick; render(); }));
  };
  $$('#grpPick button').forEach((b) => b.addEventListener('click', () => { pick = +b.dataset.g; $$('#grpPick button').forEach((x) => x.classList.toggle('on', x === b)); }));
  $('#grpDone').addEventListener('click', () => {
    if (g.includes(-1)) { toast('아직 묶지 않은 도형이 있어요'); return; }
    const by = (k) => { const vals = [...new Set(ITEMS.map((it) => it[k]))]; return ITEMS.map((it) => vals.indexOf(it[k])); };
    const agree = (lab) => { // 묶음 이름이 달라도 같은 묶음인지 비교: 같은 묶음 쌍이 일치하는 비율
      let same = 0, tot = 0; for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { tot++; if ((g[i] === g[j]) === (lab[i] === lab[j])) same++; } return Math.round(same / tot * 100);
    };
    const R = [['색깔', 'c'], ['모양', 'sh'], ['크기', 'sz']].map(([n, k]) => ({ n, a: agree(by(k)), groups: [...new Set(ITEMS.map((it) => it[k]))].map((v) => `${v}: ${ITEMS.filter((it) => it[k] === v).map((it) => it.e).join('')}`) }));
    const best = R.slice().sort((a, b) => b.a - a.a)[0];
    $('#grpResult').hidden = false;
    $('#grpResult').innerHTML = `<p>내 묶음은 <b>${best.n}</b> 기준과 가장 비슷해요 (${best.a}% 일치).</p><ul class="ex-list plain">${R.map((r) => `<li><b>${r.n} 기준</b> (일치 ${r.a}%): ${r.groups.join(' / ')}</li>`).join('')}</ul><p>🤔 어느 것이 정답일까요? <b>모두 맞는 묶음이에요.</b> 정답(레이블)이 없으니 기준에 따라 결과가 달라지고, 결과를 <b>해석하는 사람</b>의 생각이 들어가요.</p>`;
  });
  render();
}

/* --- 4-5 K-평균: CCTV 관리 구역 + 엘보우 --- */
let KM = null;
function kmeansRun(pts, k, tries = 8) {
  let best = null;
  for (let t = 0; t < tries; t++) {
    let c = shuffle(pts).slice(0, k).map((p) => ({ x: p.x, y: p.y })), a = [];
    for (let it = 0; it < 50; it++) {
      a = pts.map((p) => { let bi = 0, bd = Infinity; c.forEach((q, i) => { const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi; });
      const nc = c.map((q, i) => { const m = pts.filter((_, j) => a[j] === i); return m.length ? { x: mean(m.map((p) => p.x)), y: mean(m.map((p) => p.y)) } : q; });
      const moved = nc.some((q, i) => Math.hypot(q.x - c[i].x, q.y - c[i].y) > .01); c = nc; if (!moved) break;
    }
    const sse = pts.reduce((s, p, j) => s + (p.x - c[a[j]].x) ** 2 + (p.y - c[a[j]].y) ** 2, 0);
    if (!best || sse < best.sse) best = { c, a, sse };
  }
  return best;
}
function initKMeans() {
  const cv = $('#kmCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const COL = ['#3b6fe0', '#e9468b', '#f07a1a', '#22a06b', '#7b55d9', '#00a3b4'];
  let pts = [], cents = null, assign = [], phase = 'seed', iter = 0, auto = null;
  KM = { get pts() { return pts; }, setK: (k) => { $('#kmK').value = k; $('#kmKVal').textContent = k; stopAuto(); seed(); runAuto(250); } };
  const msg = (h, step) => { $('#kmMsg').innerHTML = h; $$('#kmSteps li').forEach((li, i) => li.classList.toggle('on', i === step)); };
  const makeData = () => {
    const towns = [[150, 120], [470, 110], [330, 300], [120, 330], [540, 320]].slice(0, Math.floor(rand(3, 6)));
    pts = []; towns.forEach(([cx, cy]) => { const n = Math.floor(rand(8, 13)); for (let i = 0; i < n; i++) pts.push({ x: clamp(cx + gauss() * 42, 16, W - 16), y: clamp(cy + gauss() * 38, 16, H - 16) }); });
    cents = null; assign = []; phase = 'seed'; iter = 0;
    msg('CCTV 📹가 설치된 위치예요. 아직 어느 센터가 관리할지 정해지지 않았어요. <b>①</b>을 눌러 보세요.', -1);
    document.dispatchEvent(new Event('kmdata'));
  };
  function seed() {
    const k = +$('#kmK').value;
    cents = shuffle(pts).slice(0, k).map((p) => ({ x: p.x, y: p.y })); assign = []; phase = 'assign'; iter = 0;
    msg(`① CCTV 중 ${k}개를 무작위로 골라 ⭐ 중심점(관리 센터 후보)으로 정했어요.`, 0);
  }
  function step() {
    if (!cents) { seed(); return true; }
    if (phase === 'done') { msg('✅ 중심점이 더 이상 바뀌지 않아요. <b>관리 구역 나누기 완료!</b> K를 바꿔 다시 해 보세요.', 3); return false; }
    if (phase === 'assign') {
      let changed = 0;
      assign = pts.map((p, j) => { let bi = 0, bd = Infinity; cents.forEach((c, i) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; bi = i; } }); if (assign[j] !== bi) changed++; return bi; });
      iter++;
      if (!changed && iter > 1) { phase = 'done'; msg(`④ ${iter - 1}번 반복 후 더 이상 바뀌지 않아요. <b>완료!</b> 정답을 알려 주지 않았는데도 가까운 CCTV끼리 묶였죠?`, 3); confetti(40); return false; }
      msg(`② [${iter}회차] 각 CCTV를 가장 가까운 ⭐의 색으로 칠했어요. (${changed}개 바뀜)`, 1); phase = 'move';
    } else {
      cents = cents.map((c, i) => { const m = pts.filter((_, j) => assign[j] === i); return m.length ? { x: mean(m.map((p) => p.x)), y: mean(m.map((p) => p.y)) } : c; });
      msg(`③ [${iter}회차] 각 ⭐을 자기 색 CCTV들의 <b>한가운데(평균 위치)</b>로 옮겼어요. 다시 ②로!`, 2); phase = 'assign';
    }
    return true;
  }
  function drawMap() {
    ctx.fillStyle = cssVar('--surface-2'); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(78,162,216,.35)'; ctx.beginPath(); ctx.moveTo(0, 230); ctx.bezierCurveTo(200, 180, 380, 270, W, 210); ctx.lineTo(W, 245); ctx.bezierCurveTo(380, 305, 200, 215, 0, 265); ctx.fill();
    ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 10; ctx.lineCap = 'round';
    [[[40, 0], [60, H]], [[300, 0], [280, H]], [[0, 60], [W, 80]], [[0, 380], [W, 370]], [[520, 0], [560, H]]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H); drawMap();
    if (cents && assign.length) pts.forEach((p, j) => { const c = cents[assign[j]]; ctx.strokeStyle = COL[assign[j]]; ctx.globalAlpha = .35; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(c.x, c.y); ctx.stroke(); ctx.globalAlpha = 1; });
    pts.forEach((p, j) => { ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fillStyle = assign.length ? COL[assign[j]] : '#9aa5a0'; ctx.fill(); ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('📹', p.x, p.y + 1); });
    if (cents) cents.forEach((c, i) => {
      ctx.save(); ctx.translate(c.x, c.y); ctx.fillStyle = COL[i]; ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 3;
      ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 21, t = k * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(t) * r, Math.sin(t) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }
  const stopAuto = () => { clearInterval(auto); auto = null; $('#kmAuto').textContent = '⏩ 끝까지 자동'; };
  const runAuto = (ms = 600) => { $('#kmAuto').textContent = '⏸ 멈추기'; auto = setInterval(() => { const go = step(); draw(); if (!go) stopAuto(); }, ms); };
  $('#kmData').addEventListener('click', () => { stopAuto(); makeData(); draw(); });
  $('#kmSeed').addEventListener('click', () => { stopAuto(); seed(); draw(); });
  $('#kmStep').addEventListener('click', () => { stopAuto(); step(); draw(); });
  $('#kmAuto').addEventListener('click', () => { if (auto) { stopAuto(); return; } if (!cents || phase === 'done') seed(); runAuto(); });
  $('#kmK').addEventListener('input', (e) => { $('#kmKVal').textContent = e.target.value; stopAuto(); cents = null; assign = []; phase = 'seed'; msg('K가 바뀌었어요. <b>①</b>부터 다시 해 보세요.', -1); draw(); });
  onDrag(cv, { down: (p) => { pts.push({ x: p.x, y: p.y }); if (phase === 'done') phase = 'assign'; draw(); document.dispatchEvent(new Event('kmdata')); } });
  makeData(); draw();
  document.addEventListener('themechange', draw);
  initElbow();
}
function initElbow() {
  const cv = $('#elbowCanvas');
  let sse = [];
  const P = () => plotFrame(cv, { x0: .5, x1: 8.5, y0: 0, y1: Math.max(...sse) * 1.08 || 1, xl: '군집 수 K →', yl: '↑ 오차(거리²의 합)', xt: 8, yt: 4, fx: (v) => (Math.abs(v - Math.round(v)) < .01 ? Math.round(v) : ''), fy: (v) => fmt(v / 1000, 0) + 'k' });
  let chosen = null;
  const elbowK = () => { let bk = 2, bv = -Infinity; for (let k = 2; k <= 7; k++) { const v = (sse[k - 2] - sse[k - 1]) - (sse[k - 1] - sse[k]); if (v > bv) { bv = v; bk = k; } } return bk; };
  const calc = () => { sse = Array.from({ length: 8 }, (_, i) => kmeansRun(KM.pts, i + 1, 6).sse); chosen = null; draw(); $('#elbowMsg').textContent = '그래프가 확 꺾이는 점을 찾아 눌러 보세요.'; };
  function draw() {
    const p = P(), { ctx, W, H } = p; ctx.clearRect(0, 0, W, H); p.axes();
    ctx.strokeStyle = cssVar('--purple'); ctx.lineWidth = 3; ctx.beginPath(); sse.forEach((v, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, p.px(i + 1), p.py(v))); ctx.stroke();
    sse.forEach((v, i) => { ctx.beginPath(); ctx.arc(p.px(i + 1), p.py(v), chosen === i + 1 ? 12 : 8, 0, Math.PI * 2); ctx.fillStyle = chosen === i + 1 ? cssVar('--orange') : cssVar('--purple'); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); });
  }
  onDrag(cv, { down: (pt) => {
    const p = P(); let bi = -1, bd = 40; sse.forEach((v, i) => { const d = Math.hypot(p.px(i + 1) - pt.x, p.py(v) - pt.y); if (d < bd) { bd = d; bi = i; } });
    if (bi < 0) return; chosen = bi + 1; draw();
    const ek = elbowK(), gain = (k) => (k < 8 ? Math.round((1 - sse[k] / sse[k - 1]) * 100) : 0);
    $('#elbowMsg').innerHTML = `K = <b>${chosen}</b>을 골랐어요. 여기서 하나 더 늘리면 오차가 ${gain(chosen)}%만 줄어요.<br>` + (Math.abs(chosen - ek) <= 0 ? '👍 그래프가 꺾이는 팔꿈치 지점이에요! 지도에서 구역이 나뉘는 걸 보세요.' : `🤔 팔꿈치는 K = ${ek} 근처로 보여요. 그래도 군집 수는 목적에 맞게 사람이 정해요.`);
    if (chosen >= 2 && chosen <= 6) KM.setK(chosen);
  } });
  $('#elbowRe').addEventListener('click', calc);
  document.addEventListener('kmdata', () => { clearTimeout(calc.t); calc.t = setTimeout(calc, 300); });
  document.addEventListener('themechange', draw);
  calc();
}

/* --- 4-5 장바구니 --- */
function initBasket() {
  const IT = { b: '🍞 빵', m: '🥛 우유', r: '🍜 라면', e: '🥚 계란', c: '🥤 콜라', h: '🍫 초콜릿' };
  const R = ['bm', 'bmh', 're', 'rec', 'bm', 'ch', 'bme', 're', 'bmc', 'rh'];
  let sel = [];
  const render = () => {
    $('#basketPick').innerHTML = Object.entries(IT).map(([k, v]) => `<button class="chip ${sel.includes(k) ? 'on' : ''}" data-k="${k}">${v}</button>`).join('') + ' <button class="btn btn-ghost btn-sm" id="basketBest">🔍 가장 많이 같이 팔린 짝 찾기</button>';
    $$('#basketPick .chip').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.k; sel = sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k].slice(-2); render(); }));
    $('#basketBest').addEventListener('click', () => {
      const ks = Object.keys(IT), pairs = [];
      ks.forEach((a, i) => ks.slice(i + 1).forEach((b) => pairs.push({ a, b, n: R.filter((r) => r.includes(a) && r.includes(b)).length })));
      pairs.sort((x, y) => y.n - x.n); sel = [pairs[0].a, pairs[0].b]; render();
      $('#basketMsg').innerHTML += `<br>🏆 1위: ${IT[pairs[0].a]} + ${IT[pairs[0].b]} (${pairs[0].n}장), 2위: ${IT[pairs[1].a]} + ${IT[pairs[1].b]} (${pairs[1].n}장) → 두 물건을 가까이 진열하면 좋겠죠?`;
    });
    $('#basketList').innerHTML = R.map((r, i) => `<span class="mail ${sel.length === 2 && sel.every((k) => r.includes(k)) ? 'pred' : ''}">🧾${i + 1} ${[...r].map((k) => IT[k].split(' ')[0]).join('')}</span>`).join('');
    const n = sel.length === 2 ? R.filter((r) => sel.every((k) => r.includes(k))).length : null;
    $('#basketMsg').innerHTML = n === null ? '물건 두 개를 골라 보세요.' : `${IT[sel[0]]} + ${IT[sel[1]]}: 10장 중 <b>${n}장</b>에서 함께 샀어요.`;
  };
  render();
}

/* --- 4-6 강화학습 구성 요소 --- */
function initCycle() {
  const EX = {
    maze: { agent: '🤖 미로 속 로봇', env: '🧱 미로', state: '지금 서 있는 칸', action: '위·아래·왼쪽·오른쪽으로 한 칸', reward: '🍪 +10, 🔥 −10, 한 걸음 −1', policy: '"이 칸에서는 오른쪽이 좋다" 같은 행동 규칙' },
    vac: { agent: '🧹 로봇 청소기', env: '🏠 우리 집 거실', state: '청소기 위치, 먼지 센서 값, 배터리', action: '앞으로 가기, 회전, 충전하러 가기', reward: '먼지 흡입 +, 벽에 부딪힘 −, 배터리 방전 −−', policy: '먼지가 많은 쪽으로, 배터리가 적으면 충전기로' },
    go: { agent: '⚫ 바둑 AI', env: '⬜ 바둑판과 상대', state: '지금 바둑판 위 돌의 배치', action: '돌을 놓을 자리 고르기', reward: '이기면 +1, 지면 −1', policy: '이 배치에서 이길 확률이 가장 높은 자리' },
    game: { agent: '🕹️ 게임 캐릭터', env: '🎮 게임 맵', state: '화면, 체력, 남은 시간', action: '점프, 달리기, 공격', reward: '코인 +, 적에게 맞음 −, 스테이지 클리어 ++', policy: '적이 오면 점프, 코인이 보이면 달리기' },
  };
  const DESC = { agent: '<b>에이전트</b>: 학습하고 행동하는 주체예요.', env: '<b>환경</b>: 에이전트가 놓인 세상이에요. 에이전트의 행동에 반응해요.', state: '<b>상태</b>: 지금 에이전트가 처한 상황이에요.', action: '<b>행동</b>: 에이전트가 상태를 보고 고르는 선택이에요.', reward: '<b>보상</b>: 행동의 결과로 환경이 주는 점수예요. 좋은 행동 +, 나쁜 행동 −', policy: '<b>정책</b>: 상태마다 어떤 행동을 할지 정한 전략이에요. 강화학습은 <b>보상의 합이 가장 커지는 정책</b>을 찾는 과정이에요.' };
  let ex = 'maze', on = 'agent';
  const box = (k, x, y, w, h, fill, label, sub) => `<g class="cn ${on === k ? 'on' : ''}" data-k="${k}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}"/><text x="${x + w / 2}" y="${y + h / 2 - (sub ? 6 : -5)}" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">${label}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 16}" text-anchor="middle" font-size="12" fill="#fff">${sub}</text>` : ''}</g>`;
  const render = () => {
    const E = EX[ex];
    $('#cycleSvg').innerHTML = `<defs><marker id="cyA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7d8a83"/></marker></defs>
      <path d="M150 120 C 200 40, 360 40, 410 120" stroke="#7d8a83" stroke-width="4" fill="none" marker-end="url(#cyA)"/>
      <path d="M410 245 C 360 330, 200 330, 150 245" stroke="#7d8a83" stroke-width="4" fill="none" marker-end="url(#cyA)"/>
      ${box('agent', 20, 120, 160, 125, '#f07a1a', '에이전트', E.agent.split(' ')[0])}
      ${box('policy', 45, 205, 110, 30, '#b85a10', '정책', '')}
      ${box('env', 380, 120, 160, 125, '#22a06b', '환경', E.env.split(' ')[0])}
      ${box('action', 220, 22, 120, 44, '#3b6fe0', '행동', '')}
      ${box('state', 175, 292, 100, 44, '#7b55d9', '상태', '')}
      ${box('reward', 285, 292, 100, 44, '#e9468b', '보상', '')}`;
    $$('#cycleSvg .cn').forEach((g) => g.addEventListener('click', () => { on = g.dataset.k; render(); }));
    $('#cycleInfo').style.setProperty('--info-c', 'var(--orange)');
    $('#cycleInfo').innerHTML = `<p>${DESC[on]}</p><p>👉 이 예시에서는: <b>${E[on]}</b></p><p class="hint">에이전트가 <b>행동</b>하면, 환경은 바뀐 <b>상태</b>와 <b>보상</b>을 돌려줘요. 이 고리를 수없이 돌면서 배워요. 그림의 상자를 눌러 보세요.</p>`;
  };
  $$('#rlEx button').forEach((b) => b.addEventListener('click', () => { ex = b.dataset.e; $$('#rlEx button').forEach((x) => x.classList.toggle('on', x === b)); render(); }));
  render();
}

/* --- 4-6 내가 에이전트: 보물 찾기 --- */
function initHunt() {
  const N = 5, MV = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  let map, me, score, round, seen, over, history;
  const newMap = () => {
    const cells = shuffle(Array.from({ length: N * N }, (_, i) => i).filter((i) => i !== (N - 1) * N));
    map = Array(N * N).fill('.'); map[cells[0]] = 'T'; cells.slice(1, 5).forEach((i) => (map[i] = 'X'));
    seen = {}; round = 0; history = []; start();
  };
  const start = () => { me = { x: 0, y: N - 1 }; score = 0; over = false; round++; render(); $('#huntLog').textContent = round > 1 ? '지난 판에 알게 된 칸이 보여요. 이번엔 더 빨리 찾을 수 있을까요?' : '출발! 방향 버튼을 눌러 보세요.'; };
  const render = () => {
    $('#hunt').innerHTML = Array.from({ length: N * N }, (_, i) => {
      const x = i % N, y = Math.floor(i / N), s = seen[i], isMe = me.x === x && me.y === y;
      return `<div class="${s !== undefined ? 'seen' : ''} ${isMe ? 'me' : ''}">${isMe ? '🧑' : s !== undefined ? (map[i] === 'T' ? '💎' : map[i] === 'X' ? '🕳️' : '') : '❔'}${s !== undefined ? `<small>${s > 0 ? '+' : ''}${s}</small>` : ''}</div>`;
    }).join('');
    $('#huntScore').textContent = score; $('#huntRound').textContent = round;
  };
  const move = (d) => {
    if (over) { toast('이번 판은 끝났어요. 다시 해 보세요!'); return; }
    const nx = me.x + MV[d][0], ny = me.y + MV[d][1];
    if (nx < 0 || ny < 0 || nx >= N || ny >= N) { score -= 1; $('#huntLog').textContent = '벽이에요! 보상 −1'; render(); return; }
    me = { x: nx, y: ny }; const i = ny * N + nx, c = map[i];
    const r = c === 'T' ? 10 : c === 'X' ? -5 : -1; score += r; seen[i] = r;
    $('#huntLog').textContent = c === 'T' ? `💎 보물 발견! 보상 +10 → 이번 판 점수 ${score}` : c === 'X' ? '🕳️ 함정! 보상 −5' : '아무것도 없어요. 보상 −1';
    if (c === 'T') { over = true; history.push(score); $('#huntLog').textContent += ` | 지금까지 점수: ${history.join(' → ')}`; if (history.length > 1 && score > history[history.length - 2]) $('#huntLog').textContent += ' 📈 경험이 쌓여 점수가 올랐어요!'; confetti(30); }
    render();
  };
  $$('#huntPad button').forEach((b) => b.addEventListener('click', () => move(+b.dataset.d)));
  $('#huntAgain').addEventListener('click', start);
  $('#huntNew').addEventListener('click', newMap);
  newMap();
}

/* --- 4-6 로봇 미로 (Q-러닝) + 보상 설계 --- */
function initRL() {
  const cv = $('#rlCanvas'), ctx = cv.getContext('2d'), COLS = 6, ROWS = 4, S = cv.width / COLS;
  const MAP = ['.....G', '..F.F.', '.W....', 'S..F..'];
  const START = { x: 0, y: 3 };
  const cell = (x, y) => MAP[y][x];
  const MOVES = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  let Q, eps, history, bot, trail, anim = null, RW = { G: 10, F: -10, S: -1 };
  const reset = () => { Q = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => [0, 0, 0, 0])); eps = .5; history = []; bot = { ...START }; trail = []; $('#rlEp').textContent = 0; $('#rlSteps').textContent = '-'; };
  const act = (s, explore) => {
    if (explore && Math.random() < eps) return Math.floor(Math.random() * 4);
    const q = Q[s.y][s.x], m = Math.max(...q), best = q.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0);
    return best[Math.floor(Math.random() * best.length)];
  };
  const move = (s, a) => {
    const nx = s.x + MOVES[a][0], ny = s.y + MOVES[a][1];
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || cell(nx, ny) === 'W') return { s, r: RW.S - 1, end: false };
    const c = cell(nx, ny);
    return { s: { x: nx, y: ny }, r: c === 'G' ? RW.G : c === 'F' ? RW.F : RW.S, end: c === 'G' || (c === 'F' && RW.F < 0) };
  };
  const learn = (s, a, r, n, end) => { const target = r + (end ? 0 : .9 * Math.max(...Q[n.y][n.x])); Q[s.y][s.x][a] += .5 * (target - Q[s.y][s.x][a]); };
  const runEp = (record) => {
    let s = { ...START }, steps = 0, end = false; const path = [s];
    while (!end && steps < 60) { const a = act(s, true), m = move(s, a); learn(s, a, m.r, m.s, m.end); s = m.s; end = m.end; steps++; if (record) path.push(s); }
    history.push({ steps, win: cell(s.x, s.y) === 'G' }); eps = Math.max(.05, eps * .97);
    return { steps, path, res: cell(s.x, s.y) };
  };
  function draw() {
    const maxQ = Math.max(1, ...Q.flat().map((q) => Math.max(...q)));
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const c = cell(x, y), v = Math.max(...Q[y][x]);
      ctx.fillStyle = c === 'W' ? '#5b6168' : cssVar('--surface'); ctx.fillRect(x * S, y * S, S, S);
      if (c === '.' || c === 'S') { ctx.fillStyle = `rgba(34,160,107,${clamp(v / maxQ, 0, 1) * .55})`; ctx.fillRect(x * S, y * S, S, S); }
      ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 2; ctx.strokeRect(x * S, y * S, S, S);
      ctx.font = '44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (c === 'G') ctx.fillText('🍪', x * S + S / 2, y * S + S / 2);
      if (c === 'F') ctx.fillText('🔥', x * S + S / 2, y * S + S / 2);
      if (c === 'W') ctx.fillText('🧱', x * S + S / 2, y * S + S / 2);
      if (c === 'S') { ctx.font = '14px "Noto Sans KR"'; ctx.fillStyle = cssVar('--muted'); ctx.fillText('출발', x * S + S / 2, y * S + S - 14); }
    }
    if (trail.length > 1) { ctx.strokeStyle = cssVar('--orange'); ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.globalAlpha = .7; ctx.beginPath(); trail.forEach((p, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, p.x * S + S / 2, p.y * S + S / 2)); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.font = '48px sans-serif'; ctx.fillText('🤖', bot.x * S + S / 2, bot.y * S + S / 2 + 2);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const c = $('#rlChart'), g = c.getContext('2d'), w = c.width, h = c.height;
    g.clearRect(0, 0, w, h); g.fillStyle = cssVar('--muted'); g.font = '11px "Noto Sans KR"'; g.fillText('판마다 걸린 걸음 수 (낮을수록 잘함)', 6, 13);
    if (history.length > 1) { const n = history.length, mx = Math.max(...history.map((d) => d.steps)); g.strokeStyle = cssVar('--orange'); g.lineWidth = 2; g.beginPath(); history.forEach((d, i) => { const x = 6 + i / (n - 1) * (w - 12), y = h - 6 - d.steps / mx * (h - 26); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
  }
  const stop = () => { clearInterval(anim); anim = null; };
  const play = (path, ms, after) => { stop(); let i = 0; trail = [path[0]]; anim = setInterval(() => { bot = path[i]; trail = path.slice(0, i + 1); draw(); if (++i >= path.length) { stop(); after && after(); } }, ms); };
  $('#rlOne').addEventListener('click', () => {
    const { steps, path, res } = runEp(true);
    $('#rlEp').textContent = history.length; $('#rlSteps').textContent = steps;
    play(path, 110, () => toast(res === 'G' ? `🍪 쿠키 도착! (${steps}걸음)` : res === 'F' ? `🔥 불! 보상 ${RW.F}` : '😵 길을 잃었어요'));
  });
  $('#rlMany').addEventListener('click', () => { stop(); let last = 0; for (let i = 0; i < 100; i++) last = runEp(false).steps; bot = { ...START }; trail = []; $('#rlEp').textContent = history.length; $('#rlSteps').textContent = last; draw(); toast('100판 연습 완료! ⭐ 최선의 길을 눌러 보세요'); });
  $('#rlBest').addEventListener('click', () => {
    let s = { ...START }, path = [s], seen = new Set(), end = false;
    while (!end && path.length < 30 && !seen.has(s.x + ',' + s.y)) { seen.add(s.x + ',' + s.y); const m = move(s, act(s, false)); s = m.s; end = m.end; path.push(s); }
    const res = cell(s.x, s.y);
    play(path, 220, () => toast(res === 'G' ? `⭐ ${path.length - 1}걸음 만에 쿠키 도착!` : res === 'F' ? '🔥 불로 가는 길을 배웠어요. 보상 설계를 확인해 보세요!' : '아직 길을 다 못 배웠어요. 더 연습시켜 보세요!'));
  });
  $('#rlReset').addEventListener('click', () => { stop(); reset(); draw(); });
  $('#rwApply').addEventListener('click', () => {
    RW = { G: +$('#rwG').value || 0, F: +$('#rwF').value || 0, S: +$('#rwS').value || 0 };
    stop(); reset(); draw();
    toast(RW.S >= 0 ? '한 걸음 벌점이 없어요. 로봇이 서두를 이유가 있을까요?' : RW.F >= 0 ? '불이 벌점이 아니에요! 로봇이 불을 피할까요?' : '새 보상으로 다시 연습해 보세요');
  });
  reset(); draw();
  document.addEventListener('themechange', draw);
}

/* --- 4-6 슬롯머신: 탐험과 활용 --- */
function initBandit() {
  let probs, left, win, counts;
  const reset = () => {
    probs = shuffle([.25, .45, .75]); left = 20; win = 0; counts = [[0, 0], [0, 0], [0, 0]];
    render(); $('#slotMsg').textContent = '기계를 눌러 당겨 보세요.';
  };
  const render = (hit = -1, ok) => {
    $('#slots').innerHTML = probs.map((_, i) => `<button class="slot ${hit === i ? (ok ? 'win' : 'lose') : ''}" data-i="${i}"><div class="big-emoji">🎰</div><b>${'ABC'[i]}</b><small>${counts[i][0]}번 중 ${counts[i][1]}번 당첨</small>${left === 0 ? `<br><small>진짜 확률 ${probs[i] * 100}%</small>` : ''}</button>`).join('');
    $$('#slots .slot').forEach((b) => b.addEventListener('click', () => pull(+b.dataset.i)));
    $('#slotLeft').textContent = left; $('#slotWin').textContent = win;
  };
  const pull = (i) => {
    if (!left) { toast('기회를 다 썼어요. 새 게임!'); return; }
    const ok = Math.random() < probs[i]; left--; counts[i][0]++; if (ok) { counts[i][1]++; win++; }
    render(i, ok);
    if (!left) {
      const best = probs.indexOf(Math.max(...probs));
      $('#slotMsg').innerHTML = `끝! <b>${win}번</b> 당첨. 가장 좋은 기계는 <b>${'ABC'[best]}</b>(${probs[best] * 100}%)였어요. 처음엔 여러 기계를 <b>탐험</b>하고, 좋은 기계를 찾은 뒤엔 그 기계를 <b>활용</b>하는 게 좋았겠죠?`;
    } else $('#slotMsg').textContent = ok ? '🎉 당첨!' : '꽝…';
  };
  $('#slotReset').addEventListener('click', reset);
  reset();

  // ε-탐욕 시뮬레이션
  const P = [.25, .45, .75];
  const sim = (eps) => {
    const r = seeded(Math.round(eps * 1000) + 5); let tot = 0;
    for (let run = 0; run < 50; run++) {
      const n = [0, 0, 0], v = [0, 0, 0];
      for (let t = 0; t < 500; t++) {
        let a;
        if (r() < eps) a = Math.floor(r() * 3); else { const m = Math.max(...v), best = [0, 1, 2].filter((i) => v[i] === m); a = best[Math.floor(r() * best.length)]; }
        const rew = r() < P[a] ? 1 : 0; n[a]++; v[a] += (rew - v[a]) / n[a]; tot += rew;
      }
    }
    return tot / 50 / 500;
  };
  const res = Array.from({ length: 21 }, (_, i) => sim(i * .05));
  const cv = $('#banditChart');
  const draw = () => {
    const e = +$('#epsR').value / 100; $('#epsVal').textContent = Math.round(e * 100) + '%';
    const p = plotFrame(cv, { x0: 0, x1: 1, y0: .3, y1: .8, xl: '탐험 비율 →', yl: '↑ 평균 당첨률', xt: 10, yt: 5, fx: (v) => Math.round(v * 100) + '%', fy: (v) => Math.round(v * 100) + '%' }), { ctx, W, H } = p;
    ctx.clearRect(0, 0, W, H); p.axes();
    ctx.strokeStyle = cssVar('--orange'); ctx.lineWidth = 3; ctx.beginPath(); res.forEach((v, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, p.px(i * .05), p.py(v))); ctx.stroke();
    const k = Math.round(e / .05); ctx.beginPath(); ctx.arc(p.px(k * .05), p.py(res[k]), 9, 0, Math.PI * 2); ctx.fillStyle = cssVar('--blue'); ctx.fill();
    ctx.setLineDash([5, 5]); ctx.strokeStyle = cssVar('--muted'); ctx.beginPath(); ctx.moveTo(p.px(0), p.py(.75)); ctx.lineTo(p.px(1), p.py(.75)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "Noto Sans KR"'; ctx.fillText('가장 좋은 기계만 당겼을 때 75%', p.px(.55), p.py(.75) - 6);
    $('#banditMsg').innerHTML = `탐험 ${Math.round(e * 100)}% → 평균 당첨률 <b>${Math.round(res[k] * 100)}%</b>. ` + (e === 0 ? '탐험을 전혀 안 하면 처음 운 좋게 당첨된 기계에 갇힐 수 있어요.' : e >= .5 ? '탐험이 너무 많으면 좋은 기계를 알고도 자꾸 다른 기계를 당겨요.' : '이 실험에서는 조금만 탐험하고 나머지는 활용할 때 결과가 좋아요.');
  };
  $('#epsR').addEventListener('input', draw); draw();
  document.addEventListener('themechange', draw);
}

/* --- 4-7 정리 --- */
function initCmpTable() {
  const rows = [
    ['학습 데이터', '입력 데이터 + 레이블(정답)', '입력 데이터만', '환경과 상호작용하며 얻은 경험'],
    ['배우는 것', '문제와 정답 사이의 관계', '데이터 속 숨은 패턴, 특성', '보상을 가장 크게 하는 행동'],
    ['대표 문제', '예측(회귀), 분류', '군집', '게임, 로봇 제어'],
    ['대표 알고리즘', '단순·다중 선형 회귀, K-최근접 이웃, 의사결정트리', 'K-평균 (+ 엘보우 방법)', 'Q-러닝 (미로 로봇)'],
    ['장점', '성능 평가가 쉽고 알고리즘이 많음', '레이블이 필요 없고 숨은 패턴 발견', '레이블 없이 데이터를 스스로 만듦'],
    ['단점', '레이블에 시간·비용, 레이블 오류', '성능 평가가 어렵고 해석이 주관적', '보상 함수 설계, 환경 구현이 어려움'],
    ['사례', '스팸 필터, 집값 예측, 동물 사진 분류', 'CCTV 구역, 고객 그룹, 장바구니 분석', '알파고, 자율주행, 로봇 걷기'],
  ];
  $('#cmpTable').innerHTML = `<tr><th></th><th>👩‍🏫 지도학습</th><th>🧩 비지도학습</th><th>🎮 강화학습</th></tr>` + rows.map((r) => `<tr><th>${r[0]}</th>${r.slice(1).map((c) => `<td class="hide">${c}</td>`).join('')}</tr>`).join('');
  $$('#cmpTable td').forEach((td) => td.addEventListener('click', () => td.classList.remove('hide')));
}
function initTypeSorter() {
  makeSorter($('#typeSorter').closest('.card'), [
    ['🌡️ 내일 기온 예측', 'reg'], ['🏠 아파트 가격 예측', 'reg'], ['🚗 내비 도착 시간', 'reg'],
    ['📧 스팸 메일 걸러내기', 'cls'], ['✍️ 손글씨 숫자 알아보기', 'cls'], ['🐾 사진 속 동물 종류', 'cls'],
    ['📹 CCTV 관리 구역 나누기', 'clu'], ['🛍️ 비슷한 고객 묶기', 'clu'], ['📰 내용이 비슷한 뉴스끼리 묶기', 'clu'],
    ['⚫ 바둑 AI', 'rl'], ['🦿 로봇 걷기 연습', 'rl'], ['🕹️ 게임 스스로 깨기', 'rl'],
  ], '머신러닝 유형 박사네요.');
}
