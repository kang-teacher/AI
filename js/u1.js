/* 1단원: 인공지능의 개념 */
function initAI() {
  runAll(initNest, initFeatures, initFlow, initRule, initPerceptron);
}

function initNest() {
  $$('#nestSvg .nest-c').forEach((c) => c.addEventListener('click', (e) => {
    e.stopPropagation();
    $$('#nestSvg .nest-c').forEach((x) => x.classList.toggle('on', x === c));
    $$('#nestInfo .def').forEach((d) => { d.style.opacity = d.dataset.k === c.dataset.k ? 1 : 0.35; });
  }));
}

/* --- 1-1 인공지능의 특성 --- */
function initFeatures() {
  makeFeatureCards($('#featCards'), [
    { k: 'big', icon: '📚', t: '빅데이터', sub: '엄청 많은 데이터', html: `<p>인공지능은 <b>대규모의 데이터</b>를 바탕으로 학습해요. 데이터는 <b>센서</b>로 직접 얻기도 하고, <b>사람이 정리한 데이터</b>를 쓰기도 해요.</p>
      <div class="mini"><b>🔎 이 데이터는 어떻게 얻었을까?</b><div id="bigQ" style="margin-top:6px"></div></div>` },
    { k: 'rec', icon: '👁️', t: '인식', sub: '상황 해석하기', html: `<p>센서를 이용해 <b>이미지, 소리, 온도</b> 등 상황 정보를 해석해요. 사람의 눈·귀·피부가 하는 일을 카메라·마이크·온도 센서가 해요.</p>
      <div class="mini"><b>🏠 스마트홈 AI가 센서 값을 해석해요</b>
        <label class="slider-label">🌡️ 온도 <input type="range" id="recT" min="-5" max="38" value="29"> <b id="recTV">29℃</b></label>
        <label class="slider-label">💡 밝기 <input type="range" id="recL" min="0" max="100" value="20"> <b id="recLV">20</b></label>
        <label class="slider-label">🔊 소리 <input type="range" id="recS" min="0" max="100" value="70"> <b id="recSV">70</b></label>
        <p class="predict" id="recOut"></p></div>` },
    { k: 'learn', icon: '📖', t: '학습', sub: '규칙 찾아내기', html: `<p>데이터 속에서 <b>일정한 규칙을 찾아내는</b> 것을 학습이라고 해요. <b>다양하고 많은 데이터</b>를 학습할수록 정확도가 높아져요.</p>
      <div class="mini"><b>🕵️ 숨겨진 규칙 찾기</b>: 컴퓨터가 (공부 시간 → 점수) 데이터를 보고 규칙을 찾아요. 실제 규칙은 비밀! 데이터를 더 보여 줄수록 어떻게 되나요?
        <div class="btn-row"><button class="btn btn-primary btn-sm" id="learnMore">📥 데이터 5개 더 주기</button><button class="btn btn-ghost btn-sm" id="learnReset">처음부터</button></div>
        <div class="stats"><div><span>본 데이터</span><b id="learnN">0개</b></div><div><span>찾은 규칙</span><b id="learnRule" style="font-size:1rem">-</b></div></div>
        <div id="learnBar"></div><p class="hint" id="learnMsg"></p></div>` },
    { k: 'inf', icon: '🔎', t: '추론', sub: '새 정보 만들기', html: `<p>인간의 <b>논리적 추론 과정</b>을 흉내 내요. 이미 알고 있는 정보를 이용해 <b>새로운 정보</b>를 만들어 내요.</p>
      <div class="mini"><b>🧩 아는 것 → 새로 알게 된 것</b>
        <div class="grid2" style="margin-top:8px"><div><small class="muted">규칙</small><ul id="infRules" style="margin:4px 0;padding-left:18px"></ul></div><div><small class="muted">알고 있는 사실</small><div class="chips" id="infFacts"></div></div></div>
        <div class="btn-row"><button class="btn btn-primary btn-sm" id="infStep">🔎 한 단계 추론하기</button><button class="btn btn-ghost btn-sm" id="infReset">처음으로</button></div><p class="hint" id="infMsg"></p></div>` },
    { k: 'pred', icon: '🔮', t: '예측', sub: '새 데이터의 결과', html: `<p>학습한 알고리즘을 바탕으로 <b>새로운 데이터에 대한 결과를 예측</b>해요. 처음 보는 날씨, 처음 보는 사진이어도 답을 내놓아요.</p>
      <div class="mini"><b>🍦 아이스크림 가게 AI</b>: 지난 여름 기록으로 "기온이 1℃ 오를 때마다 약 12개 더 팔린다"는 규칙을 배웠어요.
        <label class="slider-label">내일 기온 <input type="range" id="predT" min="10" max="38" value="30"> <b id="predTV">30℃</b></label>
        <p class="predict" id="predOut"></p></div>` },
  ], { onShow: bindFeature, first: 'big' });
}
function bindFeature(k, p) {
  if (k === 'big') {
    const Q = [['⌚ 스마트워치가 잰 심박수', 'se'], ['📖 사람이 정리한 국어사전', 'hu'], ['🚗 자동차 카메라 영상', 'se'], ['🏷️ 사람이 이름표를 붙인 사진 모음', 'hu'], ['🌡️ 기상청 관측소 온도 기록', 'se'], ['📊 학교에서 정리한 성적표', 'hu']];
    $('#bigQ', p).innerHTML = Q.map(([t], i) => `<div class="btn-row" style="margin:4px 0;align-items:center" data-i="${i}"><span style="flex:1;min-width:180px">${t}</span><button class="chip" data-a="se">📡 센서</button><button class="chip" data-a="hu">🧑‍💼 사람이 정리</button></div>`).join('');
    $$('#bigQ [data-i]', p).forEach((row) => $$('button', row).forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.a === Q[+row.dataset.i][1];
      $$('button', row).forEach((x) => x.classList.toggle('on', x === b));
      b.textContent = (ok ? '✅ ' : '❌ ') + b.textContent.replace(/^[✅❌] /, '');
    })));
  }
  if (k === 'rec') {
    const go = () => {
      const t = +$('#recT', p).value, l = +$('#recL', p).value, s = +$('#recS', p).value;
      $('#recTV', p).textContent = t + '℃'; $('#recLV', p).textContent = l; $('#recSV', p).textContent = s;
      const o = [];
      o.push(t >= 28 ? '🥵 덥다 → 에어컨 켜기' : t <= 16 ? '🥶 춥다 → 난방 켜기' : '😊 온도 적당');
      o.push(l < 30 ? '🌙 어둡다 → 조명 켜기' : '☀️ 충분히 밝다');
      o.push(s > 80 ? '🚨 아주 큰 소리 → 무슨 일인지 확인' : s > 50 ? '🗣️ 사람이 있다' : '🤫 조용하다');
      $('#recOut', p).innerHTML = o.join('<br>');
    };
    ['recT', 'recL', 'recS'].forEach((id) => $('#' + id, p).addEventListener('input', go)); go();
  }
  if (k === 'learn') {
    let pts = [], r = seeded(Date.now() % 1000);
    const go = () => {
      $('#learnN', p).textContent = pts.length + '개';
      if (pts.length < 2) { $('#learnRule', p).textContent = '-'; $('#learnBar', p).innerHTML = ''; $('#learnMsg', p).textContent = '데이터를 보여 주세요.'; return; }
      const [b, a] = leastSquares(pts.map((q) => [q.x]), pts.map((q) => q.y));
      $('#learnRule', p).textContent = `점수 ≈ ${fmt(a)} × 시간 + ${fmt(b)}`;
      const err = mean([0, 2, 4, 6, 8, 10].map((x) => Math.abs(a * x + b - (8 * x + 20))));
      const acc = clamp(100 - err * 4, 0, 100);
      $('#learnBar', p).innerHTML = barsHTML([{ n: '새 데이터 예측 정확도', v: acc }], { max: 100, unit: '%' });
      $('#learnMsg', p).innerHTML = pts.length >= 30 ? `🎉 비밀 규칙은 <b>점수 = 8 × 시간 + 20</b>이었어요. 데이터가 많을수록 진짜 규칙에 가까워져요!` : '데이터를 더 보여 주면 규칙이 어떻게 바뀔까요?';
    };
    $('#learnMore', p).addEventListener('click', () => { for (let i = 0; i < 5; i++) { const x = r() * 10; pts.push({ x, y: 8 * x + 20 + 14 * gauss(r) }); } go(); });
    $('#learnReset', p).addEventListener('click', () => { pts = []; r = seeded(Date.now() % 1000); go(); });
    go();
  }
  if (k === 'inf') {
    const R = [['☔ 비가 온다', '💧 땅이 젖는다'], ['💧 땅이 젖는다', '⚠️ 길이 미끄럽다'], ['⚠️ 길이 미끄럽다', '🚶 천천히 걸어야 한다'], ['☔ 비가 온다', '☂️ 우산이 필요하다']];
    let facts;
    const reset = () => { facts = ['☔ 비가 온다']; render(); $('#infMsg', p).textContent = '규칙과 사실을 연결해서 새로운 사실을 만들어 봐요.'; };
    const render = () => {
      $('#infRules', p).innerHTML = R.map(([a, b]) => `<li>${a} → ${b}</li>`).join('');
      $('#infFacts', p).innerHTML = facts.map((f, i) => `<span class="chip${i ? ' on' : ''}">${f}</span>`).join('');
    };
    $('#infStep', p).addEventListener('click', () => {
      const r = R.find(([a, b]) => facts.includes(a) && !facts.includes(b));
      if (!r) { $('#infMsg', p).textContent = '더 이상 새로 알 수 있는 사실이 없어요. 처음엔 "비가 온다"만 알았는데 4가지를 새로 알아냈어요!'; return; }
      facts.push(r[1]); render(); $('#infMsg', p).innerHTML = `"${r[0]}"이고, 규칙 "${r[0]} → ${r[1]}"이 있으니 <b>"${r[1]}"</b>를 새로 알게 됐어요.`;
    });
    $('#infReset', p).addEventListener('click', reset); reset();
  }
  if (k === 'pred') {
    const go = () => { const t = +$('#predT', p).value; $('#predTV', p).textContent = t + '℃'; const n = Math.max(0, Math.round(12 * t - 150)); $('#predOut', p).textContent = `🔮 예측 판매량: 약 ${n}개 → ${n > 250 ? '아이스크림을 넉넉히 준비하세요!' : n > 100 ? '평소만큼 준비하세요.' : '조금만 준비해도 돼요.'}`; };
    $('#predT', p).addEventListener('input', go); go();
  }
}

/* --- 1-3 기존 프로그래밍 vs 머신러닝 --- */
function initFlow() {
  const FLOW = {
    rule: { in1: '규칙<small>"‘당첨’이 들어 있으면 스팸"</small>', in2: '데이터<small>새 문자 한 통</small>', out: '답<small>"스팸"</small>', d: '사람이 규칙을 직접 생각해서 프로그램으로 적어야 해요. 그런데 스팸을 거르는 규칙을 빠짐없이 적을 수 있을까요? 🤔 아래 체험 ①에서 직접 해 봐요.', hl: 1 },
    ml: { in1: '데이터<small>문자 수만 통</small>', in2: '답(레이블)<small>"이건 스팸, 이건 정상"</small>', out: '규칙(모델)<small>컴퓨터가 스스로 찾은 판단 기준</small>', d: '데이터와 정답을 잔뜩 보여 주면 컴퓨터가 <b>규칙을 스스로 찾아내요</b>. 이렇게 만든 규칙 덩어리를 <b>모델</b>이라고 해요. 체험 ②에서 직접 학습시켜 봐요.', hl: 0 },
  };
  const set = (m) => {
    const f = FLOW[m];
    $('#flowIn1').innerHTML = f.in1; $('#flowIn2').innerHTML = f.in2; $('#flowOut').innerHTML = f.out; $('#flowDesc').innerHTML = f.d;
    $('#flowIn1').classList.toggle('hl-box', f.hl === 1); $('#flowOut').classList.toggle('hl-box', m === 'ml');
    $$('#progToggle button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  };
  $$('#progToggle button').forEach((b) => b.addEventListener('click', () => set(b.dataset.mode)));
  set('rule');
}
function initRule() {
  const MAILS = [
    ['[Web발신] 축하합니다! 이벤트 당첨! 상품 받으러 가기 ▶ bit.ly/xx', 1],
    ['무료 쿠폰 지급 완료~ 지금 바로 클릭하세요', 1],
    ['(광고) 최저 금리 대출 즉시 승인! 상담 문의', 1],
    ['엄마 나 폰 고장나서 친구 폰으로 연락해. 급하게 문화상품권 좀 사 줄 수 있어?', 1],
    ['고객님 택배 주소가 잘못되었습니다. 주소 확인: hxxp://deli-ver.kr', 1],
    ['ㄷH출 가능 ㅇr무나 승인 ㄱr능', 1],
    ['내일 수학 수행평가 있대. 계산기 꼭 챙겨!', 0],
    ['[학교] 시립도서관 무료 진로 특강 안내입니다. 신청은 담임 선생님께', 0],
    ['우리 반 공모전 당첨됐대!! 선생님이 축하한다고 하셨어 🎉', 0],
    ['주문하신 상품이 발송되었습니다. 택배 조회는 앱에서 확인하세요', 0],
    ['이번 주 토요일 동아리 모임 3시로 바뀌었어', 0],
    ['할머니 생신이라 저녁에 다 같이 외식하자~ 일찍 와', 0],
  ];
  const words = ['당첨', '무료', '클릭', '대출', '급하게', '택배', '이벤트', '쿠폰'], on = new Set(['당첨', '무료']);
  const go = () => {
    $('#ruleWords').innerHTML = words.map((w) => `<button class="chip${on.has(w) ? ' on' : ''}" data-w="${esc(w)}">"${esc(w)}" → 스팸</button>`).join('');
    $$('#ruleWords button').forEach((b) => b.addEventListener('click', () => { const w = b.dataset.w; if (on.has(w)) on.delete(w); else on.add(w); go(); }));
    let ok = 0, missed = 0, wrong = 0;
    $('#ruleMails').innerHTML = MAILS.map(([t, spam]) => {
      const hit = [...on].filter((w) => t.includes(w)), say = hit.length > 0, right = say === !!spam;
      ok += right; if (spam && !say) missed++; if (!spam && say) wrong++;
      return `<div class="mail rule-mail" style="border-color:${right ? 'var(--green)' : 'var(--red)'}"><span class="tag">${spam ? '😈 실제 스팸' : '😊 실제 정상'}</span><span class="rm-t">${esc(t)}</span><b>${say ? '🚫 막음' : '📥 통과'} ${right ? '✅' : '❌'}${hit.length ? `<small class="muted"> ("${hit.map(esc).join('", "')}")</small>` : ''}</b></div>`;
    }).join('');
    $('#ruleAcc').textContent = `${ok} / 12`; $('#ruleMissed').textContent = missed; $('#ruleWrong').textContent = wrong;
    $('#ruleMsg').innerHTML = ok === 12 ? '😲 12개를 모두 맞혔어요! 하지만 내일 새로운 스팸이 오면 이 규칙이 통할까요? 사람이 규칙을 계속 고쳐야 해요.'
      : wrong && missed ? '😵 규칙을 넣으면 정상 문자까지 막히고, 빼면 스팸이 통과해요. 글자를 바꾼 스팸("ㄷH출")이나 수상한 단어가 없는 사기 문자도 있어요. 이런 <b>예외</b>를 사람이 모두 규칙으로 적기는 너무 어려워요. → 그래서 스팸과 정상 문자를 잔뜩 보여 주고 <b>규칙을 스스로 찾게 하는</b> 기계학습을 써요!'
        : wrong ? '🙁 정상 문자까지 막혔어요! 도서관 "무료" 특강, 공모전 "당첨"처럼 같은 단어가 정상 문자에도 나와요.'
          : missed ? '🤔 아직 통과한 스팸이 있어요. 어떤 단어를 규칙에 넣으면 막을 수 있을까요? 새 단어를 추가해 봐도 돼요.' : '';
  };
  $('#ruleAdd').addEventListener('click', () => { const w = $('#ruleNew').value.trim(); if (!w) return; if (!words.includes(w)) words.push(w); on.add(w); $('#ruleNew').value = ''; go(); });
  $('#ruleNew').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#ruleAdd').click(); });
  go();
}

/* --- 퍼셉트론(로지스틱 회귀) 학습 체험: YOLO 사이트에서 가져와 다듬음 --- */
function initPerceptron() {
  const cv = $('#percCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height, PAD = 40;
  let pts = [], cls = 1, w = [0, 0, 0], epoch = 0, training = false, trained = false, hoverP = null;
  const toPx = (x, y) => [PAD + x * (W - PAD * 1.5), H - PAD - y * (H - PAD * 1.5)];
  const fromPx = (px, py) => [(px - PAD) / (W - PAD * 1.5), (H - PAD - py) / (H - PAD * 1.5)];
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const pred = (x, y) => sig(w[0] * x + w[1] * y + w[2]);
  const acc = () => (pts.length ? pts.filter((p) => (pred(p.x, p.y) > 0.5 ? 1 : -1) === p.c).length / pts.length : 0);
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const A = cssVar('--c-a'), B = cssVar('--c-b');
    if (epoch > 0) {
      const step = 12;
      for (let px = PAD; px < W; px += step) for (let py = 0; py < H - PAD; py += step) {
        const [x, y] = fromPx(px + step / 2, py + step / 2), q = pred(x, y);
        ctx.fillStyle = q > 0.5 ? A : B; ctx.globalAlpha = Math.abs(q - 0.5) * 0.35; ctx.fillRect(px, py, step, step);
      }
      ctx.globalAlpha = 1;
      if (Math.abs(w[1]) > 1e-6) {
        const [ax, ay] = toPx(0, -w[2] / w[1]), [bx, by] = toPx(1, -(w[0] + w[2]) / w[1]);
        ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    ctx.strokeStyle = cssVar('--muted'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PAD, 10); ctx.lineTo(PAD, H - PAD); ctx.lineTo(W - 10, H - PAD); ctx.stroke();
    ctx.fillStyle = cssVar('--muted'); ctx.font = '13px "Noto Sans KR"'; ctx.textAlign = 'right'; ctx.fillText('주둥이가 긴 정도 →', W - 10, H - PAD + 22); ctx.textAlign = 'left';
    ctx.save(); ctx.translate(16, H - PAD); ctx.rotate(-Math.PI / 2); ctx.fillText('눈동자가 세로로 가는 정도 →', 0, 0); ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '22px sans-serif';
    for (const p of pts) {
      const [px, py] = toPx(p.x, p.y);
      ctx.fillStyle = p.c === 1 ? A : B; ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(p.c === 1 ? '🐶' : '🐱', px, py + 1);
      if (epoch > 0 && (pred(p.x, p.y) > 0.5 ? 1 : -1) !== p.c) { ctx.strokeStyle = '#e2483d'; ctx.lineWidth = 3; ctx.stroke(); }
    }
    if (!pts.length) { ctx.font = '16px "Noto Sans KR"'; ctx.fillStyle = cssVar('--muted'); ctx.fillText('여기를 클릭해서 데이터를 찍어 보세요', W / 2, H / 2); }
    if (hoverP && trained) {
      const [x, y] = fromPx(hoverP.x, hoverP.y), q = pred(x, y);
      const lab = q > 0.5 ? `🐶 강아지 ${(q * 100).toFixed(0)}%` : `🐱 고양이 ${((1 - q) * 100).toFixed(0)}%`;
      ctx.font = '700 14px "Noto Sans KR"'; ctx.textAlign = 'left';
      const tw = ctx.measureText(lab).width + 16, bx = Math.min(hoverP.x + 12, W - tw - 4);
      ctx.fillStyle = cssVar('--ink'); roundRect(ctx, bx, hoverP.y - 34, tw, 26, 8); ctx.fill();
      ctx.fillStyle = cssVar('--bg'); ctx.fillText(lab, bx + 8, hoverP.y - 21);
      ctx.beginPath(); ctx.arc(hoverP.x, hoverP.y, 5, 0, Math.PI * 2); ctx.fillStyle = cssVar('--ink'); ctx.fill();
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    $('#percEpoch').textContent = epoch; $('#percAcc').textContent = epoch ? Math.round(acc() * 100) + '%' : '-';
  }
  function trainStep() {
    const lr = 1.2, n = pts.length;
    for (let it = 0; it < 4; it++) {
      const g = [0, 0, 0];
      for (const p of pts) { const e = pred(p.x, p.y) - (p.c === 1 ? 1 : 0); g[0] += e * p.x; g[1] += e * p.y; g[2] += e; }
      for (let k = 0; k < 3; k++) w[k] -= lr * g[k] / n;
    }
    epoch++;
  }
  function loop() {
    if (!training) return;
    trainStep(); draw();
    if (epoch >= 150 || (acc() === 1 && epoch > 30)) {
      training = false; trained = true; $('#percTrain').textContent = '▶ 다시 학습';
      toast(acc() === 1 ? '학습 완료! 모든 데이터를 정확히 나눴어요 🎉' : `학습 완료! 정확도 ${Math.round(acc() * 100)}%`); draw(); return;
    }
    requestAnimationFrame(loop);
  }
  onDrag(cv, {
    down: (p) => { const [x, y] = fromPx(p.x, p.y); if (x < 0 || x > 1 || y < 0 || y > 1) return; pts.push({ x, y, c: cls }); draw(); },
    hover: (p) => { hoverP = p; if (trained) draw(); },
  });
  segBind('#percClass', (b) => { cls = +b.dataset.c; });
  $('#percTrain').addEventListener('click', () => {
    if (pts.length < 2 || !pts.some((p) => p.c === 1) || !pts.some((p) => p.c === -1)) { toast('강아지와 고양이 데이터를 둘 다 찍어 주세요!'); return; }
    w = [rand(-1, 1), rand(-1, 1), 0]; epoch = 0; trained = false; training = true; $('#percTrain').textContent = '학습 중…'; loop();
  });
  $('#percRandom').addEventListener('click', () => {
    pts = []; epoch = 0; trained = false;
    for (let i = 0; i < 12; i++) pts.push({ x: rand(0.48, 0.92), y: rand(0.08, 0.5), c: 1 });
    for (let i = 0; i < 12; i++) pts.push({ x: rand(0.08, 0.5), y: rand(0.48, 0.92), c: -1 });
    draw();
  });
  $('#percClear').addEventListener('click', () => { pts = []; epoch = 0; trained = false; training = false; $('#percTrain').textContent = '▶ 학습 시작'; draw(); });
  draw(); document.addEventListener('themechange', draw);
}
