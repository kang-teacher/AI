/* 1단원: 인공지능의 개념 */
function initAI() {
  runAll(initNest, initNestSorter, initFeatures, initFlow, initRule, initPerceptron);
}

function initNest() {
  const INFO = {
    ai: { t: '🤖 인공지능 (AI)', d: '컴퓨터를 통해 <b>인지, 학습, 추론</b> 등 인간의 지적 능력을 구현하는 기술이에요. 사람이 규칙을 직접 넣어 준 프로그램도 넓게 보면 인공지능이에요.', ex: ['체스 두는 컴퓨터', '음성 비서', '게임 속 NPC', '길 찾기'] },
    ml: { t: '📈 기계학습 (머신러닝)', d: '컴퓨터가 <b>데이터를 기반으로 학습</b>하여 문제를 해결하는 기술이에요. 사람이 규칙을 일일이 알려 주지 않아도 데이터 속 규칙(패턴)을 스스로 찾아내요.', ex: ['스팸 메일 거르기', '집값 예측', '쇼핑 추천', '손님 그룹 나누기'] },
    dl: { t: '🧠 딥러닝', d: '<b>여러 층의 깊은 인공신경망</b>을 기반으로 학습하는 기계학습 기술이에요. 사진·소리·글처럼 복잡한 데이터에서 특징을 스스로 뽑아내요.', ex: ['얼굴 인식', 'YOLO 객체 인식', '번역기', '자율주행', '생성형 AI 챗봇'] },
  };
  $$('#nestSvg .nest-c').forEach((c) => c.addEventListener('click', (e) => {
    e.stopPropagation();
    const inf = INFO[c.dataset.k];
    $$('#nestSvg .nest-c').forEach((x) => x.classList.toggle('on', x === c));
    $('#nestInfo').innerHTML = `<h3>${inf.t}</h3><p>${inf.d}</p><div class="ex">${inf.ex.map((x) => `<span>${x}</span>`).join('')}</div>`;
  }));
}
function initNestSorter() {
  makeSorter($('#nestSorter').closest('.card'), [
    ['♟️ 사람이 넣은 규칙대로 두는 옛날 체스 프로그램', 'ai'], ['🌡️ "30도가 넘으면 에어컨 켜기" 스마트홈', 'ai'], ['👾 정해진 길로만 움직이는 게임 몬스터', 'ai'],
    ['📧 신고된 메일로 배운 스팸 필터', 'ml'], ['🏠 과거 거래 기록으로 배운 집값 예측', 'ml'], ['🛒 구매 기록으로 손님을 묶는 쇼핑몰', 'ml'],
    ['📸 수백만 장 사진으로 배운 얼굴 인식', 'dl'], ['🌐 깊은 신경망으로 만든 번역기', 'dl'], ['🎨 글을 그림으로 바꿔 주는 그림 생성 AI', 'dl'],
  ], '세 개념의 포함 관계를 잘 이해했어요.');
}

/* --- 1-2 인공지능의 특성 6가지 --- */
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
    { k: 'solve', icon: '🧩', t: '문제 해결', sub: '복잡한 문제 풀기', html: `<p>학습한 데이터와 알고리즘을 바탕으로 <b>복잡한 문제를 해결</b>해요. 다양한 분야에 응용할 수 있어요.</p>
      <div class="grid3" style="margin-top:8px">
        <div class="box"><h4>🗺️ 최적 경로 찾기</h4><p>내비게이션이 막히는 길을 피해 가장 빠른 길을 찾아요.</p><a class="btn btn-ghost btn-sm" href="#search">2단원 탐색에서 직접 →</a></div>
        <div class="box"><h4>🩺 의료 진단 지원</h4><p>X-ray·CT 사진에서 의심되는 부분을 찾아 의사의 판단을 도와요. 최종 판단은 의사가 해요.</p></div>
        <div class="box"><h4>💹 금융 시장 분석</h4><p>수많은 거래 기록에서 패턴을 찾아 위험을 알리거나, 평소와 다른 이상 거래(카드 도용)를 잡아내요.</p></div>
      </div>` },
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
    rule: { in1: '규칙<small>"몸무게가 5kg보다 무거우면 강아지"</small>', in2: '데이터<small>새 동물 한 마리</small>', out: '답<small>"강아지"</small>', d: '사람이 규칙을 직접 생각해서 프로그램으로 적어야 해요. 그런데 강아지와 고양이를 구분하는 규칙을 빠짐없이 적을 수 있을까요? 🤔 아래 체험 ①에서 직접 해 봐요.', hl: 1 },
    ml: { in1: '데이터<small>강아지·고양이 수천 마리의 특징</small>', in2: '답(레이블)<small>"이건 강아지, 이건 고양이"</small>', out: '규칙(모델)<small>컴퓨터가 스스로 찾은 판단 기준</small>', d: '데이터와 정답을 잔뜩 보여 주면 컴퓨터가 <b>규칙을 스스로 찾아내요</b>. 이렇게 만든 규칙 덩어리를 <b>모델</b>이라고 해요. 체험 ②에서 직접 학습시켜 봐요.', hl: 0 },
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
  const A = [
    ['🐕 치와와', 1, 2.5, 1], ['🐩 푸들', 1, 6, 0], ['🐶 비글', 1, 11, 0], ['🦮 리트리버', 1, 30, 0], ['🐕 시바견', 1, 9, 1], ['🌭 닥스훈트', 1, 8, 0],
    ['🐱 코리안숏헤어', 0, 4.5, 1], ['🦁 메인쿤', 0, 9, 1], ['🐱 스코티시폴드', 0, 4, 0], ['😺 페르시안', 0, 5, 1], ['🐾 아기 고양이', 0, 1, 1], ['😸 뚱냥이', 0, 7.5, 1],
  ];
  const go = () => {
    const t = +$('#ruleT').value, ear = $('#ruleEar').checked;
    $('#ruleTVal').textContent = t + 'kg';
    let ok = 0;
    $('#ruleAnimals').innerHTML = A.map(([n, dog, w, up]) => {
      const say = ear && up ? 0 : w > t ? 1 : 0, right = say === dog; ok += right;
      return `<span class="chip" style="border-color:${right ? 'var(--green)' : 'var(--red)'};${right ? '' : 'background:#fde8e6;color:#9b1c12'}">${n} ${w}kg${up ? ' 👂' : ''} → ${say ? '🐶' : '🐱'} ${right ? '✅' : '❌'}</span>`;
    }).join('');
    $('#ruleAcc').textContent = `${ok} / 12`;
    $('#ruleMsg').innerHTML = ok >= 10 ? '규칙을 하나 더 넣으니 나아졌어요. 그래도 치와와·시바견처럼 <b>예외</b>가 남아요. 세상의 모든 강아지·고양이를 규칙으로 다 설명할 수 있을까요? 😵 → 그래서 <b>데이터로 규칙을 스스로 찾는</b> 머신러닝이 필요해요!'
      : ok >= 9 ? '몸무게 하나로는 이게 최선이에요. 작은 강아지(치와와)와 큰 고양이(메인쿤) 같은 <b>예외</b>가 있거든요. 규칙을 하나 더 넣어 볼까요?'
        : '기준을 바꿔서 더 많이 맞혀 보세요. (👂 = 귀가 쫑긋 서 있음)';
  };
  $('#ruleT').addEventListener('input', go); $('#ruleEar').addEventListener('change', go); go();
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
    ctx.fillStyle = cssVar('--muted'); ctx.font = '13px "Noto Sans KR"'; ctx.fillText('귀 길이 →', W - 80, H - PAD + 22);
    ctx.save(); ctx.translate(16, 90); ctx.rotate(-Math.PI / 2); ctx.fillText('몸무게 →', 0, 0); ctx.restore();
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
    for (let i = 0; i < 12; i++) pts.push({ x: rand(0.5, 0.92), y: rand(0.45, 0.9), c: 1 });
    for (let i = 0; i < 12; i++) pts.push({ x: rand(0.08, 0.5), y: rand(0.08, 0.5), c: -1 });
    draw();
  });
  $('#percClear').addEventListener('click', () => { pts = []; epoch = 0; trained = false; training = false; $('#percTrain').textContent = '▶ 학습 시작'; draw(); });
  draw(); document.addEventListener('themechange', draw);
}
