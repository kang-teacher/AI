/* 5단원: 딥러닝 */
function initDL() {
  runAll(initNeuron, initPicnic, initGate, initLayerCards, initNN, initXor, initDlTabs, initVision, initSpeech, initLM, initMelody);
}

/* --- 5-1 생체 신경 vs 인공신경 --- */
function initNeuron() {
  const svg = $('#neuronSvg');
  const INFO = {
    den: '🌿 <b>가지돌기</b>: 다른 신경세포에서 오는 자극을 받아요. → 인공신경의 <b>입력(x)</b>',
    body: '⚪ <b>신경세포체</b>: 받은 자극을 모아요. 자극이 충분히 크면(임계치를 넘으면) 신호를 내보내요. → 인공신경의 <b>합(Σ)과 임계치</b>',
    axon: '➖ <b>축삭돌기</b>: 만들어진 신호를 다음 신경세포로 전달해요. → 인공신경의 <b>출력(y)</b>',
    syn: '🔗 <b>시냅스</b>: 신경세포끼리 연결된 곳이에요. 연결이 강할수록 신호가 잘 전달돼요. → 인공신경의 <b>가중치(w)</b>',
    x: '🔢 <b>입력 x</b>: 데이터가 들어오는 곳 (예: 날씨가 맑으면 1, 아니면 0)',
    w: '⚖️ <b>가중치 w</b>: 각 입력이 얼마나 중요한지 나타내는 숫자예요. 학습은 바로 이 가중치를 알맞게 바꾸는 과정이에요.',
    sum: 'Σ <b>가중합</b>: 입력 × 가중치를 모두 더해요. (x₁w₁ + x₂w₂ + x₃w₃)',
    th: '🚧 <b>임계치</b>: 가중합이 이 값을 넘으면 1(신호를 보냄), 넘지 못하면 0(보내지 않음)을 내보내요.',
    out: '📤 <b>출력 y</b>: 결과(0 또는 1)를 다음 인공신경으로 전달해요.',
  };
  const g = (k, inner) => `<g class="cn" data-k="${k}" style="cursor:pointer">${inner}</g>`;
  const T = (x, y, t, s = 14) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${s}" font-family="Noto Sans KR" fill="currentColor">${t}</text>`;
  svg.innerHTML = `<g style="color:var(--ink)">
    ${T(200, 24, '🧬 생체 신경', 16)}${T(660, 24, '🤖 인공신경 (퍼셉트론)', 16)}
    ${g('den', `<path d="M60 90 L120 140 M50 150 L120 150 M60 210 L120 160 M80 70 L100 110 M40 120 L80 135" stroke="#7b55d9" stroke-width="6" stroke-linecap="round" fill="none"/>${T(70, 250, '가지돌기')}`)}
    ${g('body', `<circle cx="150" cy="150" r="38" fill="#e9d9ff" stroke="#7b55d9" stroke-width="4"/><circle cx="150" cy="150" r="12" fill="#7b55d9"/>${T(150, 215, '세포체')}`)}
    ${g('axon', `<path d="M188 150 H330" stroke="#7b55d9" stroke-width="8" stroke-linecap="round"/>${T(260, 135, '축삭돌기')}`)}
    ${g('syn', `<path d="M330 150 L360 120 M330 150 L362 150 M330 150 L360 180" stroke="#7b55d9" stroke-width="5" stroke-linecap="round"/><circle cx="366" cy="118" r="7" fill="#f5b82e"/><circle cx="368" cy="150" r="7" fill="#f5b82e"/><circle cx="366" cy="182" r="7" fill="#f5b82e"/>${T(368, 215, '시냅스')}`)}
    <line x1="430" y1="40" x2="430" y2="270" stroke="var(--line)" stroke-dasharray="6 6"/>
    ${g('x', [70, 150, 230].map((y, i) => `<circle cx="490" cy="${y}" r="22" fill="#fff4d6" stroke="#f5b82e" stroke-width="3"/>${T(490, y + 5, 'x' + '₁₂₃'[i])}`).join('') + T(490, 280, '입력'))}
    ${g('w', [70, 150, 230].map((y, i) => `<line x1="512" y1="${y}" x2="618" y2="150" stroke="#3b6fe0" stroke-width="${3 + i}"/>${T(560, (y + 150) / 2 - 6, 'w' + '₁₂₃'[i], 13)}`).join(''))}
    ${g('sum', `<circle cx="650" cy="150" r="32" fill="#dce8ff" stroke="#3b6fe0" stroke-width="3"/>${T(650, 158, 'Σ', 24)}${T(650, 215, '가중합')}`)}
    ${g('th', `<rect x="702" y="122" width="70" height="56" rx="10" fill="#ffe3e0" stroke="#e2483a" stroke-width="3"/><path d="M714 165 H735 V135 H760" stroke="#e2483a" stroke-width="3" fill="none"/>${T(737, 215, '임계치')}`)}
    ${g('out', `<path d="M772 150 H850" stroke="#22a06b" stroke-width="6"/><path d="M850 140 L866 150 L850 160z" fill="#22a06b"/>${T(830, 135, 'y (0/1)')}${T(830, 215, '출력')}`)}
  </g>`;
  $$('.cn', svg).forEach((c) => c.addEventListener('click', () => {
    $$('.cn', svg).forEach((x) => { x.style.opacity = x === c ? 1 : 0.4; });
    $('#neuronInfo').innerHTML = INFO[c.dataset.k];
  }));
}

function initPicnic() {
  const IN = [['☀️', '날씨가 맑다', 3], ['👫', '친구도 간다', 2], ['📚', '숙제를 다 했다', 1]];
  const x = [1, 0, 1];
  $('#pcInputs').innerHTML = IN.map(([ic, t, w], i) => `<div class="box" style="margin-bottom:8px"><div class="btn-row" style="margin:0;align-items:center"><button class="btn btn-ghost btn-sm" data-i="${i}">${ic} ${t}: <b>${x[i]}</b></button></div><label class="slider-label" style="margin:6px 0 0">가중치 w${'₁₂₃'[i]} <input type="range" min="0" max="5" step="0.5" value="${w}" data-w="${i}"> <b>${w}</b></label></div>`).join('');
  const go = () => {
    const w = $$('#pcInputs [data-w]').map((r) => +r.value), th = +$('#pcTh').value;
    $$('#pcInputs [data-w]').forEach((r) => { r.nextElementSibling.textContent = r.value; });
    $$('#pcInputs [data-i]').forEach((b) => { const i = +b.dataset.i; b.innerHTML = `${IN[i][0]} ${IN[i][1]}: <b>${x[i]}</b>`; b.classList.toggle('btn-primary', !!x[i]); b.classList.toggle('btn-ghost', !x[i]); });
    $('#pcThV').textContent = th;
    const s = x.reduce((a, v, i) => a + v * w[i], 0), fire = s > th;
    $('#pcCalc').textContent = `가중합 = ${x.map((v, i) => `${v}×${w[i]}`).join(' + ')}\n       = ${s}\n${s} ${fire ? '>' : '≤'} 임계치 ${th}  →  출력 ${fire ? 1 : 0}`;
    $('#pcOut').innerHTML = fire ? '⚡ 신호 발사! 🧺 소풍 간다' : '💤 신호 없음… 🏠 집에 있는다';
    $('#pcOut').style.background = fire ? 'var(--green-soft)' : 'var(--surface-2)';
  };
  $$('#pcInputs [data-i]').forEach((b) => b.addEventListener('click', () => { x[+b.dataset.i] ^= 1; go(); }));
  $$('#pcInputs [data-w]').forEach((r) => r.addEventListener('input', go));
  $('#pcTh').addEventListener('input', go); go();
}

function initGate() {
  const X = [[0, 0], [0, 1], [1, 0], [1, 1]], T = { and: [0, 0, 0, 1], or: [0, 1, 1, 1], xor: [0, 1, 1, 0] };
  let g = 'and', w, th, n, ptr, last, timer = null;
  const out = (x) => (x[0] * w[0] + x[1] * w[1] > th ? 1 : 0);
  const reset = () => { w = [0, 0]; th = 0; n = 0; ptr = 0; last = -1; clearInterval(timer); timer = null; render(); $('#gMsg').textContent = '가중치와 임계치가 모두 0에서 시작해요.'; };
  const render = () => {
    const t = T[g]; let ok = 0;
    $('#gateTable').innerHTML = `<tr><th>입력 x₁</th><th>입력 x₂</th><th class="label-col">정답</th><th>퍼셉트론 출력</th></tr>` + X.map((x, i) => { const y = out(x), r = y === t[i]; ok += r; return `<tr${i === last ? ' class="hl"' : ''}><td>${x[0]}</td><td>${x[1]}</td><td class="label-col">${t[i]}</td><td>${y} ${r ? '✅' : '❌'}</td></tr>`; }).join('');
    $('#gW1').textContent = fmt(w[0]); $('#gW2').textContent = fmt(w[1]); $('#gTh').textContent = fmt(th); $('#gN').textContent = n; $('#gAcc').textContent = `${ok} / 4`;
    return ok;
  };
  const step = () => {
    const t = T[g];
    for (let k = 0; k < 4; k++) {
      const i = (ptr + k) % 4, y = out(X[i]);
      if (y !== t[i]) {
        const d = 0.5 * (t[i] - y);
        w[0] += d * X[i][0]; w[1] += d * X[i][1]; th -= d; n++; ptr = (i + 1) % 4; last = i;
        const ok = render();
        $('#gMsg').innerHTML = `입력 (${X[i]})에서 정답은 ${t[i]}인데 ${y}이라고 틀렸어요 → ${d > 0 ? '가중치 ↑, 임계치 ↓' : '가중치 ↓, 임계치 ↑'} 로 고쳤어요.` + (ok === 4 ? ' <b>🎉 이제 4개 모두 맞혀요! 학습 완료!</b>' : '');
        if (g === 'xor' && n >= 24) { $('#gMsg').innerHTML = '😵 24번을 고쳐도 XOR은 4개를 모두 맞히지 못해요. 퍼셉트론 하나는 <b>직선 하나</b>로만 나눌 수 있기 때문이에요. → <a href="#dl/5-2">5-2 마당에서 은닉층으로 해결해 봐요</a>'; return false; }
        return ok < 4;
      }
    }
    last = -1; render(); $('#gMsg').innerHTML = '🎉 모두 맞혔어요. 더 고칠 것이 없어요!'; return false;
  };
  $('#gStep').addEventListener('click', step);
  $('#gAuto').addEventListener('click', () => { if (timer) return; timer = setInterval(() => { if (!step()) { clearInterval(timer); timer = null; } }, 350); });
  $('#gReset').addEventListener('click', reset);
  segBind('#gateSel', (b) => { g = b.dataset.g; reset(); });
  reset();
}

/* --- 5-2 인공신경망 --- */
function initLayerCards() {
  makeFeatureCards($('#layerCards'), [
    { k: 'in', icon: '📥', t: '입력층', sub: '데이터를 받아요', html: '<p>데이터를 입력받는 층이에요. 사진이라면 픽셀 하나하나의 밝기 숫자가, 소리라면 떨림의 숫자가 들어와요.</p>' },
    { k: 'hid', icon: '🌀', t: '은닉층', sub: '입력과 출력 사이', html: '<p>입력층과 출력층 사이에 있는 층이에요. 밖에서는 보이지 않아서 \'숨은(은닉)\' 층이라고 불러요. 앞쪽 은닉층은 선·모서리 같은 단순한 특징을, 뒤쪽 은닉층은 눈·귀·얼굴 같은 복잡한 특징을 찾아요.</p><p><b>은닉층이 여러 겹 = 깊다(Deep)</b> → 딥러닝!</p>' },
    { k: 'out', icon: '📤', t: '출력층', sub: '결과를 내놓아요', html: '<p>최종 결과를 출력하는 층이에요. "고양이일 확률 97%, 강아지일 확률 3%"처럼 답을 내놓아요.</p>' },
  ], { first: 'hid' });
}
function initNN() {
  const nn = $('#nnCanvas'), ctx = nn.getContext('2d');
  let layers = 3, firing = false, t0 = 0;
  const FEAT = ['선·모서리', '모양·질감', '눈·귀·코', '얼굴 전체', '몸 형태', '종합 판단'];
  const nodes = () => { const L = [5, ...Array(layers).fill(6), 2]; return L.map((n, li) => Array.from({ length: n }, (_, k) => ({ x: 70 + li * (nn.width - 140) / (L.length - 1), y: 50 + (k + 0.5) * (nn.height - 90) / n }))); };
  function draw(now = 0) {
    const N = nodes(), NH = nn.height;
    ctx.clearRect(0, 0, nn.width, NH);
    const phase = firing ? (now - t0) / 450 : -1;
    for (let li = 0; li < N.length - 1; li++) {
      const act = phase >= li && phase < li + 1.6;
      for (const a of N[li]) for (const b of N[li + 1]) {
        ctx.strokeStyle = act ? cssVar('--yellow') : cssVar('--line'); ctx.lineWidth = act ? 1.6 : 1; ctx.globalAlpha = act ? 0.9 : 0.7;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if (firing && phase >= li && phase < li + 1) { const f = phase - li; ctx.fillStyle = cssVar('--orange'); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 2.5, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    ctx.globalAlpha = 1;
    N.forEach((col, li) => {
      const isIn = li === 0, isOut = li === N.length - 1, lit = firing && phase >= li;
      col.forEach((p, k) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, isOut ? 16 : 12, 0, Math.PI * 2);
        ctx.fillStyle = isIn ? cssVar('--yellow') : isOut ? cssVar('--blue') : cssVar('--green-2');
        ctx.globalAlpha = lit || !firing ? 1 : 0.35; ctx.fill(); ctx.globalAlpha = 1;
        if (isOut) { const done = firing && phase >= li + 0.3; ctx.fillStyle = cssVar('--ink'); ctx.font = '700 13px "Noto Sans KR"'; ctx.textAlign = 'left'; ctx.fillText(k === 0 ? `🐱 ${done ? '97%' : '?'}` : `🐶 ${done ? '3%' : '?'}`, p.x + 22, p.y + 5); }
      });
      ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "Noto Sans KR"'; ctx.textAlign = 'center';
      ctx.fillText(isIn ? '입력층' : isOut ? '출력층' : `은닉층 ${li}`, col[0].x, 24);
      if (!isIn && !isOut) ctx.fillText(FEAT[Math.min(li - 1, FEAT.length - 1)], col[0].x, NH - 12);
      if (isIn) ctx.fillText('픽셀', col[0].x, NH - 12);
    });
    if (firing) { if (phase < N.length + 0.5) requestAnimationFrame(draw); else { firing = false; draw(); } }
  }
  $('#nnLayers').addEventListener('input', (e) => { layers = +e.target.value; $('#nnLayersVal').textContent = layers; firing = false; draw(); });
  $('#nnFire').addEventListener('click', () => { firing = true; t0 = performance.now(); requestAnimationFrame(draw); });
  draw(); document.addEventListener('themechange', () => draw());
}
function initXor() {
  let a = 0, b = 0;
  const go = () => {
    const h1 = a + b > 0.5 ? 1 : 0, h2 = -a - b > -1.5 ? 1 : 0, y = h1 + h2 > 1.5 ? 1 : 0;
    const node = (x, yy, v, t) => `<circle cx="${x}" cy="${yy}" r="26" fill="${v ? '#22a06b' : 'var(--surface-2)'}" stroke="var(--line)" stroke-width="2"/><text x="${x}" y="${yy + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="${v ? '#fff' : 'var(--ink)'}">${t}=${v}</text>`;
    const ln = (x1, y1, x2, y2, t, on) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? '#f5b82e' : 'var(--line)'}" stroke-width="${on ? 4 : 2}"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" text-anchor="middle" font-size="12" fill="var(--muted)">${t}</text>`;
    $('#xorSvg').innerHTML = ln(80, 70, 230, 70, '+1', a) + ln(80, 70, 230, 190, '−1', a) + ln(80, 190, 230, 70, '+1', b) + ln(80, 190, 230, 190, '−1', b) + ln(230, 70, 380, 130, '+1', h1) + ln(230, 190, 380, 130, '+1', h2) +
      node(80, 70, a, 'A') + node(80, 190, b, 'B') + node(230, 70, h1, 'OR') + node(230, 190, h2, 'NAND') + node(380, 130, y, 'Y') +
      ['입력층', '은닉층', '출력층'].map((t, i) => `<text x="${80 + i * 150}" y="248" text-anchor="middle" font-size="13" fill="var(--muted)">${t}</text>`).join('');
    $('#xA').textContent = `입력 A = ${a}`; $('#xB').textContent = `입력 B = ${b}`;
    $('#xorCalc').textContent = `은닉 OR  : ${a} + ${b} = ${a + b} > 0.5 ? → ${h1}\n은닉 NAND: −${a} − ${b} = ${-a - b} > −1.5 ? → ${h2}\n출력     : ${h1} + ${h2} = ${h1 + h2} > 1.5 ? → ${y}`;
    $('#xorOut').textContent = `A=${a}, B=${b} → XOR 결과 ${y} ${y === (a ^ b) ? '✅ 정답!' : ''}`;
  };
  $('#xA').addEventListener('click', () => { a ^= 1; go(); }); $('#xB').addEventListener('click', () => { b ^= 1; go(); }); go();
}

/* --- 5-3 활용 분야 --- */
function initDlTabs() { segBind('#dlTabs', (b) => $$('.dl-pane').forEach((p) => { p.hidden = p.dataset.t !== b.dataset.t; })); }
function initVision() {
  const INFO = {
    cls: { h: '🏷️ 분류 (Image Classification)', d: '이미지 속 <b>하나의 대상을 구분</b>해요. "이 사진은 무엇인가?"에 답 하나(와 확률)만 알려 주고, 위치는 알려 주지 않아요.', ex: ['사진 속 동물 종류 맞히기', '불량품/정상품 판정', 'X-ray 사진의 이상 여부'] },
    det: { h: '📦 객체 탐지 (Object Detection)', d: '이미지 속 <b>여러 사물을 상자로 구별</b>하고 각각 무엇인지 알아봐요. YOLO가 대표적인 객체 탐지 모델이에요.', ex: ['자율주행차의 보행자·차량 찾기', 'CCTV 위험 상황 감지', '차량 번호판 인식'] },
    seg: { h: '🎨 분할 (Segmentation)', d: '상자 대신 <b>픽셀 하나하나</b>까지 어느 물체에 속하는지 칠해요. 물체의 정확한 모양과 넓이를 알 수 있어요.', ex: ['사진 배경 지우기', 'MRI에서 종양 크기 재기', '위성 사진의 숲·도시 넓이'] },
    pose: { h: '🦴 특징점 추출 (Keypoint Detection)', d: '이미지 속 <b>특징이 되는 점</b>(관절, 눈·코·입)의 위치를 찾아요. 사람의 자세나 표정을 분석할 수 있어요.', ex: ['운동 자세 교정', '얼굴 필터·아바타', '손동작 인식'] },
  };
  const svg = $('#taskSvg');
  const set = (t) => { renderScene(svg, t); const i = INFO[t]; $('#taskInfo').innerHTML = `<h3>${i.h}</h3><p>${i.d}</p><h4>활용 사례</h4><ul class="ex-list">${i.ex.map((x) => `<li>${x}</li>`).join('')}</ul>`; };
  segBind('#taskTabs', (b) => set(b.dataset.t)); set('cls');
}
function initSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  $('#sttGo').addEventListener('click', () => {
    if (!SR) { $('#sttOut').textContent = '이 브라우저는 음성 인식을 지원하지 않아요. 크롬이나 엣지에서 열어 보세요.'; return; }
    const r = new SR(); r.lang = 'ko-KR'; r.interimResults = true;
    $('#sttGo').disabled = true; $('#sttOut').textContent = '👂 듣는 중… 말해 보세요';
    r.onresult = (e) => { $('#sttOut').textContent = '📝 ' + [...e.results].map((x) => x[0].transcript).join(''); };
    r.onerror = (e) => { $('#sttOut').textContent = e.error === 'not-allowed' ? '마이크 사용을 허용해 주세요.' : '인식하지 못했어요. 다시 해 볼까요?'; };
    r.onend = () => { $('#sttGo').disabled = false; };
    r.start();
  });
  $('#ttsGo').addEventListener('click', () => {
    if (!window.speechSynthesis) { $('#ttsMsg').textContent = '이 브라우저는 음성 합성을 지원하지 않아요.'; return; }
    const u = new SpeechSynthesisUtterance($('#ttsIn').value); u.lang = 'ko-KR'; speechSynthesis.cancel(); speechSynthesis.speak(u);
    $('#ttsMsg').textContent = '🔈 읽는 중… (소리가 안 나면 컴퓨터 볼륨을 확인하세요)';
  });
}
function initLM() {
  const C = ['나는 오늘 학교에 간다', '나는 오늘 급식이 맛있다', '나는 내일 학교에 간다', '친구는 오늘 도서관에 간다', '친구는 내일 급식이 기대된다', '오늘 급식이 맛있다', '나는 친구와 도서관에 간다'];
  const next = new Map();
  C.forEach((s) => { const w = ['<시작>', ...s.split(' '), '<끝>']; for (let i = 0; i < w.length - 1; i++) { const m = next.get(w[i]) || new Map(); m.set(w[i + 1], (m.get(w[i + 1]) || 0) + 1); next.set(w[i], m); } });
  $('#lmCorpus').textContent = '📚 학습한 문장\n' + C.join('\n');
  let words = [];
  const cands = () => { const m = next.get(words.length ? words[words.length - 1] : '<시작>'); const tot = [...m.values()].reduce((a, b) => a + b, 0); return [...m].map(([w, c]) => ({ w, p: c / tot })).sort((a, b) => b.p - a.p); };
  const render = () => {
    const done = words[words.length - 1] === '<끝>';
    $('#lmText').textContent = words.length ? words.filter((w) => w !== '<끝>').join(' ') + (done ? '.' : ' …') : '첫 단어를 골라 보세요';
    if (done) { $('#lmNext').innerHTML = '<p class="hint">문장이 끝났어요! 학습한 문장에 없던 새 문장이 만들어졌나요?</p>'; return; }
    const cs = cands();
    $('#lmNext').innerHTML = `<p class="hint" style="margin:0 0 6px">다음 단어 후보와 확률 (눌러서 고르기)</p>${barsHTML(cs.map((c) => ({ n: c.w === '<끝>' ? '(문장 끝)' : c.w, v: c.p * 100 })), { max: 100, unit: '%' })}`;
    $$('#lmNext .bar-row').forEach((row, i) => { row.style.cursor = 'pointer'; row.addEventListener('click', () => { words.push(cs[i].w); render(); }); });
  };
  $('#lmAuto').addEventListener('click', () => {
    let guard = 0;
    while (words[words.length - 1] !== '<끝>' && guard++ < 20) { const cs = cands(); let u = Math.random(), i = 0; while (u > cs[i].p && i < cs.length - 1) { u -= cs[i].p; i++; } words.push(cs[i].w); }
    render();
  });
  $('#lmReset').addEventListener('click', () => { words = []; render(); });
  render();
}
function initMelody() {
  const NAME = { C: '도', D: '레', E: '미', F: '파', G: '솔', A: '라' }, FREQ = { C: 262, D: 294, E: 330, F: 349, G: 392, A: 440 };
  const SONG = 'GGAAGGE GGEED GGAAGGE GEDEC'.replace(/ /g, '').split('');
  const tr = {}; SONG.forEach((n, i) => { if (i < SONG.length - 1) (tr[n] = tr[n] || []).push(SONG[i + 1]); });
  let mel = [];
  const play = (notes) => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      notes.forEach((n, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.38; o.type = 'triangle'; o.frequency.value = FREQ[n]; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.36); });
      setTimeout(() => ac.close(), notes.length * 380 + 400);
    } catch (e) { toast('이 브라우저에서는 소리를 낼 수 없어요'); }
  };
  const show = (notes, title) => { $('#melNotes').innerHTML = `<span class="tag">${title}</span>` + notes.map((n) => `<span class="chip">${NAME[n]}</span>`).join(''); };
  $('#melOrig').addEventListener('click', () => { show(SONG, '원래 곡'); play(SONG); });
  $('#melNew').addEventListener('click', () => {
    mel = ['G']; while (mel.length < 15) { const opts = tr[mel[mel.length - 1]] || ['G']; mel.push(opts[Math.floor(Math.random() * opts.length)]); }
    mel.push('C'); show(mel, '새 멜로디');
  });
  $('#melPlay').addEventListener('click', () => { if (!mel.length) $('#melNew').click(); play(mel); });
}
