/* 3단원: 데이터 다루기 */
function initData() {
  runAll(initSteps, initOrder, initCollect, initSurveyTable, initColSorter, initStructTable, initStructSorter, initFormTabs, initPix, initTxt, initWave,
    initAttrCards, initDiceHeight, initAttrQuiz, initTarget, initBiasStages, initBias, initReveal, initDetective, initFill, initScale, initEncode,
    initCharts, initChartSorter, initCorr, initKeyFeat);
}

/* ---------- 공유 데이터: 우리 반 건강 데이터 ---------- */
const FRUITS = ['🍎 사과', '🍌 바나나', '🍓 딸기', '🍇 포도', '🍊 귤'];
const BLOODS = ['A', 'B', 'O', 'AB'];
function classData() {
  const r = seeded(21), out = [];
  const bw = [0.34, 0.27, 0.28, 0.11], pickBlood = () => { let u = r(), i = 0; while (u > bw[i] && i < 3) { u -= bw[i]; i++; } return BLOODS[i]; };
  for (let i = 0; i < 30; i++) {
    const h = +clamp(166 + 7.5 * gauss(r), 150, 186).toFixed(1);
    out.push({ ban: (i % 3) + 1, h, w: +clamp(h - 108 + 6 * gauss(r), 40, 90).toFixed(1), ex: Math.round(clamp(35 + 16 * gauss(r), 0, 90)), fruit: FRUITS[Math.floor(r() ** 1.3 * 5)], blood: pickBlood() });
  }
  Object.assign(out[7], { h: 158.0, w: 92.0 }); // 산점도 이상치
  out[10].ex = 175; out[10].ban = 2; // 상자그림 이상치
  return out.concat(store.get('survey', []).map((s) => ({ ...s, star: true })));
}

/* ---------- 3-0 문제 해결 5단계 ---------- */
const STEPS = [
  { ic: '🎯', t: '문제 정의 및 데이터 수집', d: '기계학습으로 해결할 수 있는 문제인지 판단하고 문제를 정의해요. 그리고 문제 해결에 필요한 <b>많은 양의 양질의 데이터</b>를 모아요.', go: '3-1' },
  { ic: '🧹', t: '데이터 전처리 및 핵심 속성 추출', d: '비어 있거나 이상한 데이터를 확인하고 문제 해결에 맞는 형태로 다듬어요(전처리). 데이터를 여러 관점에서 살펴보며 <b>핵심 속성</b>과 <b>불필요한 속성</b>을 구분해요.', go: '3-5' },
  { ic: '🧠', t: '기계학습 알고리즘 선정', d: '알고리즘은 종류가 많아요. 문제의 특성(정답이 있나? 숫자를 맞히나, 종류를 맞히나?)을 생각해서 알맞은 알고리즘을 골라요.', go: '4-0', ch: 'ml' },
  { ic: '🏋️', t: '모델 학습 및 평가', d: '데이터를 <b>훈련 데이터와 테스트 데이터</b>로 나눈 뒤 학습시켜요. 테스트 데이터로 새 데이터에서의 성능을 평가하고, 결과가 나쁘면 원인을 찾아 개선해요.', go: '4-4', ch: 'ml' },
  { ic: '🚀', t: '모델 활용', d: '평가 결과가 좋으면 웹·모바일 서비스로 <b>배포</b>해요. 배포한 뒤에도 잘 동작하는지 계속 <b>모니터링</b>하고, 필요하면 다시 학습시켜요.' },
];
const STEP_EX = {
  pet: ['고양이와 강아지를 사진으로 구분할 수 있을까? → "사진 속 동물이 고양이인지 강아지인지 맞히기"로 정의하고, 이름표가 붙은 고양이·강아지 사진을 수천 장 모아요.', '흐릿하거나 동물이 없는 사진은 빼고, 사진 크기를 똑같이 맞추고, 고양이와 강아지 사진 수가 비슷한지 확인해요.', '정답(고양이/강아지)이 있고 종류를 맞히는 문제 → 지도학습의 <b>분류</b>, 사진이니까 딥러닝(신경망)이 잘 맞아요.', '사진의 80%로 학습, 20%로 테스트해서 정확도·재현율을 확인해요.', '사진을 올리면 판단해 주는 앱으로 배포하고, 틀린 사례를 모아 다시 학습해요.'],
  ice: ['날씨로 내일 아이스크림 판매량을 예측할 수 있을까? → 과거 날짜별 기온·요일·판매량 기록을 모아요.', '판매량이 빈 날(결측치), 기계 고장으로 9999개가 찍힌 날(이상치)을 처리하고, 기온·요일처럼 판매량과 관계 깊은 속성을 골라요.', '정답(판매량)이 있고 숫자를 맞히는 문제 → 지도학습의 <b>예측(회귀)</b>, 예: 선형 회귀.', '지난 2년으로 학습, 최근 2달로 테스트해서 평균 오차가 몇 개인지 확인해요.', '매일 아침 주문량을 추천해 주는 프로그램으로 쓰고, 새 판매 기록으로 계속 다시 학습해요.'],
  spam: ['스팸 메일을 자동으로 거를 수 있을까? → "메일이 스팸인지 정상인지 맞히기"로 정의하고 사람들이 스팸 신고한 메일과 정상 메일을 모아요.', '메일 글을 단어 개수 같은 숫자로 바꾸고(정형화), "무료", "당첨" 같은 핵심 단어를 찾아요.', '정답(스팸/정상)이 있고 종류를 맞히는 문제 → 지도학습의 <b>분류</b>.', '테스트 메일로 정밀도·재현율을 확인해요. 정상 메일을 스팸으로 보내면 큰일이니까요!', '메일 서비스에 넣고, 사용자의 "스팸 아님" 신고를 모아 계속 고쳐 나가요.'],
};
function initSteps() {
  const box = $('#steps5'); let cur = 0, ex = 'pet';
  box.innerHTML = STEPS.map((s, i) => `<button data-i="${i}"><span class="n">${i + 1}</span>${s.ic}<br>${s.t}</button>`).join('');
  const show = () => {
    $$('button', box).forEach((b, i) => b.classList.toggle('on', i === cur));
    const s = STEPS[cur], link = s.go ? `<p><a class="btn btn-ghost btn-sm" href="#${s.ch || 'data'}/${s.go}">${s.go} 마당에서 자세히 →</a></p>` : '';
    $('#stepInfo').innerHTML = `<h3>${s.ic} ${cur + 1}단계. ${s.t}</h3><p>${s.d}</p><div class="box"><b>예시</b> · ${STEP_EX[ex][cur]}</div>${link}`;
  };
  $$('button', box).forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.i; show(); }));
  segBind('#stepEx', (b) => { ex = b.dataset.e; show(); });
  show();
}

function initOrder() {
  const ANS = ['🎯 문제 정의하기', '📥 데이터 수집하기', '🧹 결측치·이상치 처리하기', '🔑 핵심 속성 고르기', '🧠 알고리즘 고르기', '✂️ 훈련/테스트 데이터 나누기', '🏋️ 모델 학습시키기', '📝 테스트 데이터로 평가하기', '🚀 앱으로 배포하기', '👀 모니터링하며 다시 학습하기'];
  const pool = $('#orderPool'), line = $('#orderLine'), msg = $('#orderMsg');
  const card = (t) => { const b = document.createElement('button'); b.className = 'order-card'; b.textContent = t; b.addEventListener('click', () => { b.classList.remove('right', 'wrong'); (b.parentNode === pool ? line : pool).appendChild(b); }); return b; };
  const reset = () => { pool.innerHTML = ''; line.innerHTML = ''; msg.textContent = ''; msg.className = 'result-msg'; shuffle(ANS).forEach((t) => pool.appendChild(card(t))); };
  $('#orderCheck').addEventListener('click', () => {
    const cs = $$('.order-card', line);
    if (cs.length < ANS.length) { msg.textContent = `카드 ${ANS.length - cs.length}장을 더 세워 주세요.`; msg.className = 'result-msg bad'; return; }
    let ok = 0; cs.forEach((c, i) => { const r = c.textContent === ANS[i]; c.classList.toggle('right', r); c.classList.toggle('wrong', !r); ok += r; });
    msg.textContent = ok === ANS.length ? '🎉 완벽해요! 이 순서가 기계학습 문제 해결 과정이에요.' : `${ok} / ${ANS.length}개가 제자리예요. 빨간 카드를 눌러 빼고 다시 세워 보세요.`;
    msg.className = 'result-msg ' + (ok === ANS.length ? 'good' : 'bad');
    if (ok === ANS.length) confetti(60);
  });
  $('#orderReset').addEventListener('click', reset);
  reset();
}

/* ---------- 3-1 데이터 수집 ---------- */
function initCollect() {
  const opt = (a) => a.map((v) => `<option>${v}</option>`).join('');
  makeFeatureCards($('#collectCards'), [
    { k: 'sv', icon: '📝', t: '설문조사', sub: '사람에게 직접 묻기', html: `<p>사람들에게 질문해서 의견이나 정보를 모아요. 알고 싶은 내용을 <b>직접</b> 물을 수 있지만, 응답자가 한쪽에 쏠리거나 솔직하지 않게 답하면 데이터가 치우칠 수 있어요.</p>
      <div class="mini"><b>✋ 우리 반 건강 설문에 응답해 보세요</b><div class="inline-form" style="margin-top:8px">
        <label>반<select id="svBan">${opt([1, 2, 3])}</select></label><label>키(cm)<input type="number" id="svH" min="120" max="210" step="0.1" value="165"></label>
        <label>몸무게(kg)<input type="number" id="svW" min="25" max="150" step="0.1" value="55"></label><label>하루 운동(분)<input type="number" id="svEx" min="0" max="300" value="30"></label>
        <label>좋아하는 과일<select id="svFruit">${opt(FRUITS)}</select></label><label>혈액형<select id="svBlood">${opt(BLOODS)}</select></label>
        <button class="btn btn-primary btn-sm" id="svSubmit">응답 제출</button></div></div>` },
    { k: 'se', icon: '📡', t: '센서', sub: '기계가 자동으로 재기', html: `<p>온도·빛·소리·움직임·위치를 재는 센서는 사람 없이도 <b>자동으로, 계속</b> 데이터를 모아요. 스마트워치, 자동차, 공장 기계에 센서가 가득해요.</p>
      <div class="mini"><b>🖐️ 움직임 센서 체험</b>: 아래 칸 안에서 마우스나 손가락을 움직여 보세요. 0.1초마다 속도를 재서 기록해요.
        <div id="sensBox" style="margin-top:8px;height:110px;border-radius:12px;background:var(--blue-soft);display:grid;place-items:center;touch-action:none;cursor:crosshair">여기서 움직여요</div>
        <canvas id="sensCv" width="600" height="90" class="wide-canvas" style="margin-top:8px"></canvas>
        <div class="wave-nums" id="sensNums"></div></div>` },
    { k: 'fi', icon: '📁', t: '공개된 데이터 파일', sub: '이미 모아 둔 데이터', html: `<p>정부·기관·연구자가 모아서 공개한 파일(CSV, 엑셀 등)을 내려받아요. 예: <span class="chip">공공데이터포털</span> <span class="chip">통계청(KOSIS)</span> <span class="chip">캐글(Kaggle)</span></p>
      <div class="mini"><b>📄 CSV 파일 들여다보기</b>: CSV는 쉼표(,)로 칸을 나눈 글자 파일이에요.
        <div class="code-block" style="margin-top:8px">날짜,지역,최고기온,강수량\n2024-07-01,서울,31.2,0\n2024-07-01,부산,28.7,3.5\n2024-07-02,서울,29.8,12.0\n2024-07-02,부산,27.1,0.5</div>
        <button class="btn btn-ghost btn-sm" id="csvRead">📊 표로 읽어 들이기</button><div id="csvOut" style="margin-top:8px"></div></div>` },
    { k: 'api', icon: '🔌', t: '오픈 API', sub: '프로그램으로 요청하기', html: `<p>API는 프로그램끼리 데이터를 주고받는 창구예요. 정해진 주소로 <b>요청</b>하면 서버가 최신 데이터를 <b>응답</b>으로 보내 줘요. 날씨, 미세먼지, 버스 도착 정보처럼 계속 바뀌는 데이터를 받을 때 좋아요.</p>
      <div class="mini"><b>🌦️ 날씨 API 흉내 내기</b> <small class="muted">(실제 서버가 아닌 연습용 예시예요)</small>
        <div class="inline-form" style="margin-top:8px"><label>도시<select id="apiCity">${opt(['서울', '부산', '대구', '광주', '제주'])}</select></label><button class="btn btn-primary btn-sm" id="apiGo">📤 요청 보내기</button></div>
        <div id="apiOut" style="margin-top:8px"></div></div>` },
  ], { onShow: bindCollect, first: 'sv' });
}
function bindCollect(k, panel) {
  if (k === 'sv') $('#svSubmit', panel).addEventListener('click', () => {
    const v = (id) => $('#' + id, panel).value, h = +v('svH'), w = +v('svW'), ex = +v('svEx');
    if (!(h > 0 && w > 0 && ex >= 0)) { toast('숫자를 바르게 넣어 주세요'); return; }
    const s = store.get('survey', []); s.push({ ban: +v('svBan'), h, w, ex, fruit: v('svFruit'), blood: v('svBlood') }); store.set('survey', s);
    renderSurvey(); toast('✅ 응답이 우리 반 건강 데이터에 추가됐어요'); document.dispatchEvent(new Event('surveychange'));
  });
  if (k === 'se') {
    const box = $('#sensBox', panel), cv = $('#sensCv', panel), ctx = cv.getContext('2d'), log = [];
    let last = null, cur = null, dist = 0;
    box.addEventListener('pointermove', (e) => { const p = { x: e.clientX, y: e.clientY }; if (last) dist += Math.hypot(p.x - last.x, p.y - last.y); last = p; cur = p; });
    box.addEventListener('pointerleave', () => { last = null; });
    const tick = setInterval(() => {
      if (!cv.isConnected) { clearInterval(tick); return; }
      log.push(Math.round(dist)); dist = 0; if (log.length > 60) log.shift();
      ctx.clearRect(0, 0, cv.width, cv.height);
      const m = Math.max(50, ...log);
      ctx.strokeStyle = cssVar('--blue'); ctx.lineWidth = 2; ctx.beginPath();
      log.forEach((v, i) => { const x = i * cv.width / 59, y = cv.height - 6 - v / m * (cv.height - 12); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      $('#sensNums', panel).textContent = '최근 기록: ' + log.slice(-15).join(', ');
    }, 100);
  }
  if (k === 'fi') $('#csvRead', panel).addEventListener('click', () => {
    const lines = $('.code-block', panel).textContent.trim().split('\n').map((l) => l.split(','));
    $('#csvOut', panel).innerHTML = `<div class="dtable-wrap"><table class="dtable"><tr>${lines[0].map((c) => `<th>${c}</th>`).join('')}</tr>${lines.slice(1).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div><p class="hint">글자 파일이 행과 열이 있는 표(정형 데이터)가 됐어요.</p>`;
  });
  if (k === 'api') $('#apiGo', panel).addEventListener('click', () => {
    const city = $('#apiCity', panel).value, r = seeded([...city].reduce((s, c) => s + c.charCodeAt(0), 0) + new Date().getHours());
    const d = { city, time: new Date().toTimeString().slice(0, 5), temp: +(15 + r() * 15).toFixed(1), humidity: Math.round(40 + r() * 50), pm10: Math.round(10 + r() * 80), sky: ['맑음', '구름 많음', '흐림', '비'][Math.floor(r() * 4)] };
    $('#apiOut', panel).innerHTML = `<div class="code-block">📤 요청: GET https://api.example.kr/weather?city=${city}\n📥 응답:\n${JSON.stringify(d, null, 2)}</div><p class="hint">프로그램은 이 응답을 받아 바로 표에 한 줄로 저장할 수 있어요. 몇 분 뒤 다시 요청하면 새 값이 와요.</p>`;
  });
}

function renderSurvey() {
  const all = classData(), base = all.filter((d) => !d.star), mine = all.filter((d) => d.star);
  const row = (d, i) => `<tr${d.star ? ' class="hl"' : ''}><td>${d.star ? '⭐' : i + 1}</td><td>${d.ban}반</td><td class="num">${d.h}</td><td class="num">${d.w}</td><td class="num">${d.ex}</td><td>${d.fruit}</td><td>${d.blood}</td></tr>`;
  $('#surveyTable').innerHTML = `<tr><th>번호</th><th>반</th><th>키(cm)</th><th>몸무게(kg)</th><th>하루 운동(분)</th><th>좋아하는 과일</th><th>혈액형</th></tr>${base.slice(0, 6).map(row).join('')}<tr><td colspan="7" class="muted">… ${base.length - 6}명 더 있어요</td></tr>${mine.map(row).join('')}`;
}
function initSurveyTable() {
  renderSurvey();
  $('#surveyClear').addEventListener('click', () => { store.set('survey', []); renderSurvey(); document.dispatchEvent(new Event('surveychange')); toast('내가 넣은 응답을 지웠어요'); });
}

function initColSorter() {
  makeSorter($('#colSorter').closest('.card'), [
    ['🙋 친구들에게 좋아하는 급식 메뉴 묻기', 'sv'], ['📝 수업 만족도 온라인 설문', 'sv'], ['🗳️ 동아리 선호도 조사', 'sv'],
    ['🌡️ 교실 온도계가 10분마다 자동 기록', 'se'], ['⌚ 스마트워치의 걸음 수·심박수', 'se'], ['🚗 자율주행차의 카메라·라이다', 'se'],
    ['📁 공공데이터포털에서 CSV 내려받기', 'fi'], ['🏆 캐글(Kaggle)의 타이타닉 승객 데이터', 'fi'], ['📈 통계청 인구 통계 엑셀 파일', 'fi'],
    ['🌦️ 날씨 앱이 기상청 서버에 실시간 요청', 'api'], ['🚌 버스 도착 정보를 프로그램으로 받아오기', 'api'], ['😷 미세먼지 농도를 코드로 받아오기', 'api'],
  ], '수집 방법을 모두 맞혔어요.');
}

/* ---------- 3-2 정형·비정형 ---------- */
function initStructTable() {
  const cols = ['이름', '반', '키(cm)', '몸무게(kg)', '혈액형'];
  const rows = [['하늘', '1반', 165.2, 55.1, 'A'], ['바다', '2반', 171.8, 63.4, 'O'], ['구름', '1반', 158.4, 48.0, 'B'], ['별', '3반', 176.0, 70.2, 'AB'], ['나무', '2반', 162.5, 51.7, 'A']];
  const t = $('#structTable');
  t.innerHTML = `<tr>${cols.map((c, j) => `<th data-c="${j}">${c}</th>`).join('')}</tr>` + rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="click" data-r="${i}" data-c="${j}">${v}</td>`).join('')}</tr>`).join('');
  const hl = (r, c) => $$('td, th', t).forEach((el) => el.classList.toggle('hl', el.dataset.r === String(r) || el.dataset.c === String(c)));
  t.addEventListener('pointerover', (e) => { const td = e.target.closest('td'); if (td) hl(td.dataset.r, td.dataset.c); });
  t.addEventListener('pointerleave', () => hl(-1, -1));
  t.addEventListener('click', (e) => {
    const td = e.target.closest('td'); if (!td) return; const r = +td.dataset.r, c = +td.dataset.c;
    hl(r, c);
    $('#structInfo').innerHTML = `가로 줄(<b>행</b>) = <b>${rows[r][0]}</b>의 데이터 한 개 · 세로 줄(<b>열</b>) = <b>${cols[c]}</b> 속성 → 이 칸의 값은 <b>${rows[r][c]}</b>`;
  });
}
function initStructSorter() {
  makeSorter($('#structSorter').closest('.card'), [
    ['📊 학생 성적 엑셀 파일', 's'], ['🧾 편의점 판매 기록 CSV', 's'], ['🗄️ 도서관 대출 데이터베이스', 's'], ['🌡️ 시간별 기온 표', 's'], ['🚉 지하철 승하차 인원 표', 's'],
    ['📸 휴대폰으로 찍은 사진', 'u'], ['🎙️ 수업 녹음 파일', 'u'], ['🎬 유튜브 영상', 'u'], ['💬 이모티콘 섞인 SNS 글', 'u'], ['✉️ 손으로 쓴 편지 스캔', 'u'],
  ], '정형과 비정형을 잘 구분했어요.');
}
function initFormTabs() {
  segBind('#formTabs', (b) => $$('.form-pane').forEach((p) => { p.hidden = p.dataset.t !== b.dataset.t; }));
}
function initPix() {
  const cv = $('#pixCanvas'), ctx = cv.getContext('2d'), N = 16;
  let last = null;
  const clear = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); };
  const grid = () => {
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data, s = cv.width / N, out = [];
    for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
      let sum = 0; for (let y = gy * s; y < (gy + 1) * s; y += 2) for (let x = gx * s; x < (gx + 1) * s; x += 2) sum += 255 - d[(y * cv.width + x) * 4];
      out.push(Math.round(sum / ((s / 2) ** 2) / 255 * 9));
    }
    $('#pixNums').innerHTML = out.map((v) => `<span style="background:rgba(0,0,0,${v / 9 * 0.85});color:${v > 4 ? '#fff' : 'var(--ink-2)'}">${v}</span>`).join('');
  };
  const line = (a, b) => { ctx.strokeStyle = '#111'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
  onDrag(cv, { down: (p) => { last = p; line(p, p); }, move: (p) => { line(last, p); last = p; }, up: () => { last = null; grid(); } });
  const sample = () => {
    clear(); ctx.strokeStyle = '#111'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(128, 128, 90, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(128, 140, 50, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#111'; [[95, 100], [161, 100]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill(); });
    grid();
  };
  $('#pixClear').addEventListener('click', () => { clear(); grid(); });
  $('#pixSample').addEventListener('click', sample);
  sample();
}
function initTxt() {
  const go = () => {
    const words = $('#txtIn').value.trim().split(/\s+/).filter(Boolean), c = new Map();
    words.forEach((w) => c.set(w, (c.get(w) || 0) + 1));
    const list = [...c].sort((a, b) => b[1] - a[1]);
    $('#txtOut').innerHTML = list.length ? `<tr><th>단어(속성)</th>${list.map(([w]) => `<th>${esc(w)}</th>`).join('')}</tr><tr><th>나온 횟수</th>${list.map(([, n]) => `<td class="num${n > 1 ? ' hl' : ''}">${n}</td>`).join('')}</tr>` : '<tr><td>글을 써 주세요</td></tr>';
  };
  $('#txtIn').addEventListener('input', go); go();
}
function initWave() {
  const cv = $('#waveCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const draw = () => {
    const f = +$('#waveF').value, A = +$('#waveA').value;
    $('#waveFVal').textContent = f; $('#waveAVal').textContent = A;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = cssVar('--line'); ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    const y = (t) => H / 2 - A / 10 * (H / 2 - 12) * Math.sin(2 * Math.PI * f * t);
    ctx.strokeStyle = cssVar('--blue'); ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = 0; x <= W; x++) { const yy = y(x / W); x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
    const nums = [];
    ctx.fillStyle = cssVar('--red');
    for (let i = 0; i < 32; i++) { const t = (i + .5) / 32, yy = y(t); ctx.beginPath(); ctx.arc(t * W, yy, 4, 0, Math.PI * 2); ctx.fill(); nums.push(Math.round(A * 10 * Math.sin(2 * Math.PI * f * t))); }
    $('#waveNums').textContent = nums.join(', ');
  };
  ['waveF', 'waveA'].forEach((id) => $('#' + id).addEventListener('input', draw));
  $('#wavePlay').addEventListener('click', () => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = 130 * +$('#waveF').value; g.gain.value = +$('#waveA').value / 10 * 0.25;
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.6); o.onended = () => ac.close();
    } catch (e) { toast('이 브라우저에서는 소리를 낼 수 없어요'); }
  });
  draw(); document.addEventListener('themechange', draw);
}

/* ---------- 3-3 데이터 속성 ---------- */
function initAttrCards() {
  const root = $('#attrCards');
  root.insertAdjacentHTML('beforebegin', `<div class="grid2" style="margin-bottom:14px">
    <div class="def blue" style="margin:0"><b>범주형 데이터</b> (종류) → 각 범주의 <b>빈도, 분포, 상관 관계</b>를 분석해요. 맞히려는 값(종속 변수)이 범주형이면 주로 <b>분류</b> 학습을 해요.</div>
    <div class="def orange" style="margin:0"><b>수치형 데이터</b> (숫자) → <b>평균, 분산, 상관관계</b>를 분석해요. 맞히려는 값이 수치형이면 주로 <b>회귀</b> 학습을 해요.</div></div>`);
  makeFeatureCards(root, [
    { k: 'nom', icon: '🏷️', t: '명목형', sub: '범주형 · 이름표', html: '<p>분류나 카테고리를 나타내요. 값은 서로 다른 범주일 뿐, <b>순서나 크기가 없어요</b>.</p><p class="ex"><span>성별</span> <span>혈액형</span> <span>직업</span> <span>지역</span></p><div class="mini">🤔 "A형 &lt; B형"일까요? → 비교할 수 없어요! 이름이 다를 뿐이에요.</div>' },
    { k: 'ord', icon: '🥇', t: '순서형', sub: '범주형 · 등급', html: '<p>범주가 서로 다르지만 <b>순서나 등급</b>이 있어요.</p><p class="ex"><span>학점 A·B·C</span> <span>만족도</span> <span>선호도</span></p><div class="mini">🤔 "매우 만족 &gt; 만족 &gt; 보통" 순서는 있어요. 하지만 \'매우 만족\'과 \'만족\'의 차이가 \'만족\'과 \'보통\'의 차이와 똑같다고 말할 수는 없어요.</div>' },
    { k: 'dis', icon: '🎲', t: '이산형', sub: '수치형 · 셀 수 있음', html: '<p><b>셀 수 있는</b> 값이에요. 주로 정수나 자연수로 나타내요.</p><p class="ex"><span>학년</span> <span>나이</span> <span>주사위 눈</span> <span>인구수</span></p><div class="mini">🤔 주사위 눈 2.5, 인구 300.7명은 없어요.</div>' },
    { k: 'con', icon: '📏', t: '연속형', sub: '수치형 · 잴 수 있음', html: '<p>측정할 수 있는 <b>무한히 많은 값</b>을 가지고 소수점 아래 값도 가능해요. 두 값 사이에 무수히 많은 값이 있어요.</p><p class="ex"><span>키</span> <span>몸무게</span> <span>온도</span></p><div class="mini">🤔 키 165cm와 166cm 사이에도 165.5, 165.55, 165.555 …</div>' },
  ], { first: 'nom' });
}
function initDiceHeight() {
  const faces = '⚀⚁⚂⚃⚄⚅';
  const d = () => { const v = +$('#diceR').value; $('#diceVal').textContent = v; $('#diceFace').textContent = faces[v - 1]; };
  const h = () => { const v = +$('#heightR').value; $('#heightVal').textContent = v.toFixed(2) + 'cm'; $('#heightBar').style.width = (v - 150) / 40 * 100 + '%'; };
  $('#diceR').addEventListener('input', d); $('#heightR').addEventListener('input', h); d(); h();
}
const ATTR_COLS = [
  ['학년', 'dis', [1, 2, 3, 2]], ['혈액형', 'nom', ['A', 'O', 'B', 'AB']], ['키(cm)', 'con', [165.2, 171.8, 158.4, 176.0]], ['급식 만족도', 'ord', ['만족', '매우 만족', '보통', '불만']],
  ['사는 지역', 'nom', ['서울', '부산', '광주', '대전']], ['몸무게(kg)', 'con', [55.1, 63.4, 48.0, 70.2]], ['형제 수', 'dis', [1, 0, 2, 1]], ['학점', 'ord', ['A', 'B', 'A', 'C']], ['체온(℃)', 'con', [36.5, 36.8, 37.1, 36.4]],
];
const ATTR_NAME = { nom: '명목형', ord: '순서형', dis: '이산형', con: '연속형' };
function initAttrQuiz() {
  const t = $('#attrQuiz'), sel = `<select><option value="">고르기</option>${Object.entries(ATTR_NAME).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>`;
  t.innerHTML = `<tr>${ATTR_COLS.map((c) => `<th>${c[0]}</th>`).join('')}</tr><tr>${ATTR_COLS.map(() => `<td>${sel}</td>`).join('')}</tr>` + [0, 1, 2, 3].map((i) => `<tr>${ATTR_COLS.map((c) => `<td>${c[2][i]}</td>`).join('')}</tr>`).join('');
  $('#attrCheck').addEventListener('click', () => {
    const ss = $$('select', t); let ok = 0;
    ss.forEach((s, j) => { const r = s.value === ATTR_COLS[j][1]; ok += r; s.parentNode.classList.toggle('found', r); s.parentNode.classList.toggle('miss', !r && !!s.value); });
    const m = $('#attrMsg');
    m.textContent = ok === ss.length ? '🎉 모두 맞혔어요!' : `${ok} / ${ss.length}개 정답. 빨간 칸을 다시 생각해 보세요. (힌트: 순서가 있나? 셀 수 있나? 소수점이 가능한가?)`;
    m.className = 'result-msg ' + (ok === ss.length ? 'good' : 'bad');
    if (ok === ss.length) confetti(50);
  });
}
function initTarget() {
  const cd = classData(), r = seeded(5);
  const T = [
    { n: '🩸 혈액형', type: 'nom', vals: cd.map((d) => d.blood) },
    { n: '🍎 좋아하는 과일', type: 'nom', vals: cd.map((d) => d.fruit) },
    { n: '😊 급식 만족도', type: 'ord', vals: Array.from({ length: 30 }, () => ['매우 만족', '만족', '보통', '불만'][Math.floor(r() ** 1.4 * 4)]), order: ['매우 만족', '만족', '보통', '불만'] },
    { n: '📏 키(cm)', type: 'con', vals: cd.map((d) => d.h) },
    { n: '⚖️ 몸무게(kg)', type: 'con', vals: cd.map((d) => d.w) },
    { n: '👫 형제 수', type: 'dis', vals: Array.from({ length: 30 }, () => Math.floor(r() ** 1.8 * 4)) },
  ];
  const pick = $('#targetPick');
  pick.innerHTML = T.map((t, i) => `<button class="chip" data-i="${i}">${t.n}</button>`).join('');
  const show = (i) => {
    const t = T[i], cat = t.type === 'nom' || t.type === 'ord';
    $$('button', pick).forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
    if (cat) {
      const keys = t.order || [...new Set(t.vals)].sort();
      $('#targetAnalysis').innerHTML = `<h4>📊 범주형 → 빈도·분포 분석</h4>${barsHTML(keys.map((k) => ({ n: k, v: t.vals.filter((v) => v === k).length })), { unit: '명' })}<p class="hint">가장 많은 범주(최빈값)는 <b>${mode(t.vals)}</b>. 평균은 구할 수 없어요.</p>`;
    } else {
      const v = t.vals;
      $('#targetAnalysis').innerHTML = `<h4>🔢 수치형 → 평균·분산 분석</h4><div class="stats"><div><span>평균</span><b>${fmt(mean(v))}</b></div><div><span>분산</span><b>${fmt(variance(v))}</b></div></div><div class="stats"><div><span>가장 작은 값</span><b>${Math.min(...v)}</b></div><div><span>가장 큰 값</span><b>${Math.max(...v)}</b></div></div>`;
    }
    $('#targetMsg').innerHTML = `<h4>🎯 ${t.n}을(를) 맞히고 싶다면?</h4><p>이 속성은 <b>${cat ? '범주형' : '수치형'} (${ATTR_NAME[t.type]})</b>이에요.</p><p class="verdict ${cat ? 'good' : 'mid'}">→ ${cat ? '🏷️ 분류' : '📏 회귀(예측)'} 학습</p><p class="hint">${cat ? '정해진 몇 가지 중 하나를 고르는 문제이기 때문이에요.' : '연속적인 숫자 값을 맞히는 문제이기 때문이에요.'}</p>`;
  };
  $$('button', pick).forEach((b) => b.addEventListener('click', () => show(+b.dataset.i)));
  show(0);
}

/* ---------- 3-4 데이터 편향 ---------- */
function initBiasStages() {
  makeFeatureCards($('#biasStages'), [
    { k: 'c', icon: '📥', t: '수집 단계', sub: '데이터 모으기', html: '<ul><li>밝은 피부색 얼굴 사진 위주로 모은 얼굴 인식 AI → 어두운 피부색에서 오류가 많아요.</li><li>낮에 찍은 도로 사진만 모은 자율주행 AI → 밤이나 눈 오는 날에 약해요.</li><li>인터넷 설문은 인터넷을 자주 쓰는 사람의 의견만 모여요.</li></ul>' },
    { k: 'p', icon: '🧹', t: '전처리 단계', sub: '다듬기·레이블 달기', html: '<ul><li>레이블을 다는 사람의 고정관념이 들어가요. (예: "의사" 사진에는 남자, "간호사" 사진에는 여자만 붙이기)</li><li>결측치가 많은 그룹을 통째로 지우면 그 그룹이 데이터에서 사라져요.</li></ul>' },
    { k: 'l', icon: '🏋️', t: '학습 단계', sub: '모델 만들기', html: '<ul><li>많은 쪽만 맞혀도 정확도가 높게 나오니 모델이 적은 쪽을 무시하게 돼요. (아래 실험!)</li><li>전체 정확도 하나만 보면 특정 그룹에서 성능이 나쁜 것을 놓쳐요.</li></ul>' },
    { k: 'u', icon: '🚀', t: '활용 단계', sub: '실제로 쓰기', html: '<ul><li>다른 나라 데이터로 학습한 모델을 우리나라에서 쓰면 잘 안 맞을 수 있어요.</li><li>추천 AI가 좋아할 만한 것만 보여 주면, 그 기록이 다시 학습되어 쏠림이 점점 커져요(필터 버블).</li></ul>' },
  ], { first: 'c' });
  $('#biasStages').insertAdjacentHTML('beforeend', '<div class="box" style="margin-top:12px"><b>🛡️ 편향을 줄이려면?</b> 여러 그룹에서 고르게 모으기 · 클래스 수 맞추기(오버/언더 샘플링) · 그룹별 성능을 따로 확인하기 · 사용 중에도 계속 점검하기</div>');
}
function initBias() {
  const cv = $('#biasCanvas'), ctx = cv.getContext('2d');
  const P = plotFrame(cv, { x0: 0, x1: 1, y0: 0, y1: 1, xl: '귀가 처진 정도 →', yl: '↑ 코 길이', xt: 4, yt: 4, fx: () => '', fy: () => '' });
  const mk = (seed, cx, cy, n) => { const r = seeded(seed); return Array.from({ length: n }, () => ({ x: clamp(cx + 0.15 * gauss(r), 0.02, 0.98), y: clamp(cy + 0.15 * gauss(r), 0.02, 0.98) })); };
  const dogPool = mk(31, 0.62, 0.62, 200), catPool = mk(32, 0.38, 0.38, 200);
  const testD = mk(41, 0.62, 0.62, 50), testC = mk(42, 0.38, 0.38, 50);
  const N = 120, K = 7; let mode = 'raw';
  const knn = (train, p) => { const ds = train.map((t) => [(t.x - p.x) ** 2 + (t.y - p.y) ** 2, t.c]).sort((a, b) => a[0] - b[0]).slice(0, K); return ds.filter((d) => d[1] === 1).length > K / 2 ? 1 : 0; };
  const draw = () => {
    const ratio = +$('#biasR').value / 100; $('#biasVal').textContent = Math.round(ratio * 100) + '%';
    const nd = Math.round(N * ratio), nc = N - nd;
    let dogs = dogPool.slice(0, nd).map((p) => ({ ...p, c: 1 })), cats = catPool.slice(0, nc).map((p) => ({ ...p, c: 0 })), ghost = [];
    if (mode === 'over' && nc < nd) { const r = seeded(7); const extra = Array.from({ length: nd - nc }, (_, i) => { const s = cats[i % nc]; return { x: clamp(s.x + 0.03 * gauss(r), 0, 1), y: clamp(s.y + 0.03 * gauss(r), 0, 1), c: 0, aug: true }; }); cats = cats.concat(extra); }
    if (mode === 'under' && nc < nd) { ghost = dogs.slice(nc); dogs = dogs.slice(0, nc); }
    const train = dogs.concat(cats);
    ctx.clearRect(0, 0, P.W, P.H);
    const s = 10;
    for (let px = 46; px < P.W - 16; px += s) for (let py = 16; py < P.H - 40; py += s) {
      const c = knn(train, { x: P.ix(px + s / 2), y: P.iy(py + s / 2) });
      ctx.fillStyle = c ? 'rgba(240,122,26,.16)' : 'rgba(123,85,217,.16)'; ctx.fillRect(px, py, s, s);
    }
    P.axes();
    const dot = (p, col, hollow, alpha = 1) => { ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(P.px(p.x), P.py(p.y), 5, 0, Math.PI * 2); if (hollow) { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); } ctx.globalAlpha = 1; };
    const OR = cssVar('--orange'), PU = cssVar('--purple');
    ghost.forEach((p) => dot(p, OR, false, 0.15));
    dogs.forEach((p) => dot(p, OR)); cats.forEach((p) => dot(p, PU, p.aug));
    ctx.font = '14px "Noto Sans KR"'; ctx.fillStyle = OR; ctx.fillText('● 🐶 강아지', 60, 34); ctx.fillStyle = PU; ctx.fillText('● 🐱 고양이', 160, 34);
    const accD = testD.filter((p) => knn(train, p) === 1).length / testD.length, accC = testC.filter((p) => knn(train, p) === 0).length / testC.length;
    $('#biasNd').textContent = dogs.length; $('#biasNc').textContent = cats.length; $('#biasCost').textContent = train.length;
    $('#biasBars').innerHTML = `<p class="hint" style="margin:0">테스트(강아지 50장 + 고양이 50장) 결과</p>` + barsHTML([{ n: '🐶 맞힌 비율', v: accD * 100, c: OR }, { n: '🐱 맞힌 비율', v: accC * 100, c: PU }, { n: '전체 정확도', v: (accD + accC) / 2 * 100 }], { max: 100, unit: '%' });
    let msg;
    if (mode === 'raw' && ratio >= 0.8) msg = `😿 학습 데이터의 ${Math.round(ratio * 100)}%가 강아지라서, 모델이 웬만하면 "강아지"라고 해요. 고양이는 ${Math.round(accC * 100)}%만 맞혀요!`;
    else if (mode === 'raw') msg = ratio <= 0.6 ? '⚖️ 두 동물이 고르게 있으면 둘 다 비슷하게 잘 맞혀요.' : '조금 쏠렸어요. 비율을 더 올려 보거나 샘플링을 해 보세요.';
    else if (mode === 'over') msg = `⬆️ 고양이 데이터를 복사·증강해서 ${cats.length}개로 늘렸어요. 고양이 정답률이 올랐죠? 대신 학습 데이터가 ${train.length}개로 늘어 계산량이 커졌어요.`;
    else msg = `⬇️ 강아지를 고양이 수(${nc}개)에 맞춰 줄였어요. 계산량은 ${train.length}개로 줄었지만, 버린 강아지 ${ghost.length}개의 정보는 잃어버렸어요.`;
    $('#biasMsg').textContent = msg;
  };
  $('#biasR').addEventListener('input', draw);
  segBind('#biasMode', (b) => { mode = b.dataset.m; draw(); });
  draw(); document.addEventListener('themechange', draw);
}
function initReveal() {
  $$('.reveal-table td.hide').forEach((td) => td.addEventListener('click', () => td.classList.remove('hide')));
}

/* ---------- 3-5 결측치·이상치 ---------- */
function initDetective() {
  const cols = ['번호', '이름', '나이', '키(cm)', '몸무게(kg)', '혈액형', '전화번호'];
  const rows = [
    [1, '김하늘', 17, 165.2, 55, 'A', '010-1234-5678'], [2, '이바다', 16, '', 62, 'O', '010-2345-6789'], [3, '박구름', -5, 158.4, 48, 'B', '010-3456-7890'],
    [4, '최별', 17, 999, 70, 'AB', '010-4567-8901'], [5, '정나무', 18, 172.5, '', 'A', '010-5678-9012'], [6, '강바위', 17, 220, 110, 'O', '010-6789-0123'],
    [7, '조햇살', 16, 161.0, 52, '', '010-7890-1234'], [8, '윤달', 17, 168.3, 58, 'B', '010'], [9, '장산', 18, '', 66, 'A', '010-9012-3456'], [10, '임들', 17, 175.1, 64, 'O', ''],
  ];
  const OUT = { '2,2': '나이가 음수(−5)예요. 잘못 기록된 이상치!', '3,3': '키 999cm? 165.0을 잘못 입력했나 봐요. 잘못 기록된 이상치!', '5,3': '키 220cm는 실제로 있을 수도 있지만 일반적인 범위를 크게 벗어난 특수한 상황이라 이상치예요. 지울지 말지 신중하게!', '7,6': '전화번호가 세 자리뿐이에요. 잘못 기록된 이상치!' };
  const t = $('#detTable'); let miss = 0, out = 0, wrong = 0;
  const totalMiss = rows.flat().filter((v) => v === '').length, totalOut = Object.keys(OUT).length;
  const upd = () => { $('#detMiss').textContent = `${miss} / ${totalMiss}`; $('#detOut').textContent = `${out} / ${totalOut}`; $('#detWrong').textContent = wrong; };
  t.innerHTML = `<tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>` + rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="click${j > 1 ? ' num' : ''}" data-k="${i},${j}">${v}</td>`).join('')}</tr>`).join('');
  const reveal = (td, show) => {
    const k = td.dataset.k, [i, j] = k.split(',').map(Number), v = rows[i][j];
    if (td.classList.contains('found')) return;
    if (v === '') { td.classList.add('miss', 'found'); td.textContent = '❓'; if (!show) { miss++; $('#detMsg').textContent = `🔍 결측치 발견! ${rows[i][1]}의 '${cols[j]}' 값이 비어 있어요.`; } }
    else if (OUT[k]) { td.classList.add('out', 'found'); if (!show) { out++; $('#detMsg').textContent = '🚨 ' + OUT[k]; } }
    else if (!show) { wrong++; td.animate([{ background: 'var(--surface-2)' }, { background: 'transparent' }], 500); $('#detMsg').textContent = `${v}은(는) 정상적인 값이에요.`; }
    upd();
    if (!show && miss === totalMiss && out === totalOut) { $('#detMsg').textContent = '🎉 모두 찾았어요! 이제 이 값들을 어떻게 처리할지 아래에서 정해 봐요.'; confetti(60); }
  };
  t.addEventListener('click', (e) => { const td = e.target.closest('td'); if (td) reveal(td, false); });
  $('#detShow').addEventListener('click', () => { $$('td', t).forEach((td) => reveal(td, true)); $('#detMsg').textContent = '빨간 칸 = 결측치, 주황 칸 = 이상치예요.'; });
  upd();
}
function initFill() {
  const H = [165, 158, null, 172, 168, 999, 161, 168, null, 175], B = ['A', 'O', null, 'B', 'A', 'AB', 'A', null, 'O', 'B'];
  let mn = 'none', mc = 'none';
  const chips = (vals, filled, del) => vals.map((v, i) => del[i] ? `<span class="chip" style="opacity:.35;text-decoration:line-through">${v ?? '빈칸'}</span>` : filled[i] ? `<span class="chip on">${filled[i]}</span>` : `<span class="chip"${v == null ? ' style="background:#fde8e6;color:#9b1c12"' : ''}>${v ?? '❓'}</span>`).join('');
  const num = () => {
    const outMiss = $('#fillOut').checked, vals = H.map((v) => (outMiss && v === 999 ? null : v)), known = vals.filter((v) => v != null);
    const fills = { mean: +mean(known).toFixed(1), median: median(known), mode: mode(known) };
    const filled = vals.map((v) => (v == null && fills[mn] != null ? fills[mn] : null)), del = vals.map((v) => mn === 'del' && v == null);
    $('#fillNumVals').innerHTML = chips(H.map((v, i) => (outMiss && v === 999 ? '999→빈칸' : vals[i])), filled, del);
    const res = vals.map((v, i) => filled[i] ?? v).filter((v, i) => v != null && !del[i]);
    $('#fillNumStats').innerHTML = `<div class="stats"><div><span>데이터 개수</span><b>${res.length}</b></div><div><span>평균</span><b>${fmt(mean(known))}</b></div><div><span>중앙값</span><b>${fmt(median(known))}</b></div><div><span>최빈값</span><b>${mode(known)}</b></div></div><p class="hint" style="margin:0">평균·중앙값·최빈값은 빈칸을 뺀 값으로 계산했어요.</p>`;
    const msgs = {
      none: '빈칸이 있으면 이대로는 학습에 쓰기 어려워요. 처리 방법을 골라 보세요.',
      del: `데이터가 10개 → ${res.length}개로 줄었어요. 전체 데이터가 <b>충분하고</b> 지워도 문제가 없을 때 써요.`,
      mean: !outMiss ? `빈칸이 <b>${fills.mean}cm</b>로 채워졌어요?! 이상치 999 때문에 평균이 크게 흔들렸어요. 이상치를 먼저 처리하거나 중앙값을 써 보세요.` : `평균 ${fills.mean}cm로 채웠어요. 이상치를 먼저 처리하니 그럴듯한 값이 됐어요.`,
      median: `가운데 값 <b>${fills.median}cm</b>로 채웠어요. 중앙값은 999 같은 이상치가 있어도 거의 흔들리지 않아요.`,
      mode: `가장 자주 나온 값 <b>${fills.mode}cm</b>로 채웠어요. 키처럼 연속형 값에서는 같은 값이 잘 안 나와서 최빈값이 덜 어울릴 수 있어요.`,
    };
    $('#fillNumMsg').innerHTML = msgs[mn];
  };
  const cat = () => {
    const known = B.filter((v) => v != null), md = mode(known);
    const filled = B.map((v) => (v == null && mc === 'mode' ? md : null)), del = B.map((v) => mc === 'del' && v == null);
    $('#fillCatVals').innerHTML = chips(B, filled, del);
    $('#fillCatStats').innerHTML = barsHTML(BLOODS.map((b) => ({ n: b, v: B.map((v, i) => filled[i] ?? v).filter((v) => v === b).length })), { unit: '명' });
    const msgs = { none: '빈칸 2개가 있어요.', del: `빈칸이 있는 2명을 지웠어요. 데이터가 ${10 - 2}개가 됐어요.`, mean: '🙅 혈액형은 <b>범주형</b>이라 평균을 낼 수 없어요! (A + O ÷ 2 = ?)', median: '🙅 혈액형은 순서가 없는 <b>명목형</b>이라 크기 순으로 줄 세울 수 없어서 중앙값도 없어요.', mode: `가장 많은 <b>${md}형</b>으로 채웠어요. 범주형 데이터는 최빈값으로 대체하는 경우가 많아요.` };
    $('#fillCatMsg').innerHTML = msgs[mc];
  };
  segBind('#fillNum', (b) => { mn = b.dataset.m; num(); });
  segBind('#fillCat', (b) => { mc = b.dataset.m; cat(); });
  $('#fillOut').addEventListener('change', num);
  num(); cat();
}

/* ---------- 3-6 스케일링·인코딩 ---------- */
function initScale() {
  const ids = ['scAh', 'scAs', 'scBh', 'scBs'];
  const go = () => {
    const [ah, as, bh, bs] = ids.map((id) => +$('#' + id).value);
    ids.forEach((id) => { $('#' + id + 'V').textContent = $('#' + id).value + (id.endsWith('h') ? 'cm' : '시간'); });
    const sh = (h) => (h - 150) / 40, ss = (s) => (s - 5) / 4;
    const rh = (ah - bh) ** 2, rs = (as - bs) ** 2, nh = (sh(ah) - sh(bh)) ** 2, ns = (ss(as) - ss(bs)) ** 2;
    const pct = (a, b) => (a + b ? a / (a + b) * 100 : 50);
    $('#scFormula').textContent = `키'  = (키 − 150) ÷ (190 − 150)\n수면' = (수면 − 5) ÷ (9 − 5)\n\nA: 키' ${fmt(sh(ah), 2)}, 수면' ${fmt(ss(as), 2)}\nB: 키' ${fmt(sh(bh), 2)}, 수면' ${fmt(ss(bs), 2)}`;
    const H = cssVar('--blue'), S = cssVar('--purple');
    $('#scOut').innerHTML = `<div class="box"><h4>😵 스케일링 전 · 거리 ${fmt(Math.sqrt(rh + rs), 2)}</h4>${barsHTML([{ n: '키 차이 영향', v: pct(rh, rs), c: H }, { n: '수면 차이 영향', v: pct(rs, rh), c: S }], { max: 100, unit: '%' })}</div>
      <div class="box" style="margin-top:10px"><h4>😊 0~1 스케일링 후 · 거리 ${fmt(Math.sqrt(nh + ns), 2)}</h4>${barsHTML([{ n: '키 차이 영향', v: pct(nh, ns), c: H }, { n: '수면 차이 영향', v: pct(ns, nh), c: S }], { max: 100, unit: '%' })}</div>
      <p class="hint">수면 시간은 범위 끝에서 끝(5→9시간)까지 달라도 숫자로는 4밖에 안 돼서, 스케일링 전에는 키 몇 cm 차이에 묻혀 버려요. 범위를 0~1로 맞추면 두 속성이 공평하게 비교돼요.</p>`;
  };
  ids.forEach((id) => $('#' + id).addEventListener('input', go)); go();
}
function initEncode() {
  const DEF = ['사과', '바나나', '딸기'];
  let fr = DEF.slice(), m = 'label';
  const go = () => {
    const t = $('#encTable');
    if (m === 'label') {
      t.innerHTML = `<tr><th>과일</th><th class="label-col">레이블 인코딩</th></tr>${fr.map((f, i) => `<tr><td>${esc(f)}</td><td class="num label-col">${i + 1}</td></tr>`).join('')}`;
      const [a, b, c] = fr;
      $('#encMsg').innerHTML = `<div class="warn">⚠️ 모델이 숫자를 보고 엉뚱한 패턴을 배울 수 있어요!</div><ul><li>${esc(c)}(3)는 ${esc(a)}(1)보다 <b>3배</b> 크다?</li><li>${esc(b)}(2)는 ${esc(a)}(1)보다 <b>2배</b> 크다?</li><li>(${esc(a)} + ${esc(c)}) ÷ 2 = (1 + 3) ÷ 2 = 2 = <b>${esc(b)}</b>?! 🤯</li></ul><p class="hint">과일처럼 순서가 없는 <b>명목형</b>에는 위험해요. 하지만 '1학년, 2학년, 3학년'처럼 순서가 있는 값에는 레이블 인코딩도 괜찮아요.</p>`;
    } else {
      t.innerHTML = `<tr><th>과일</th>${fr.map((f) => `<th class="feat-col">${esc(f)}?</th>`).join('')}</tr>${fr.map((f, i) => `<tr><td>${esc(f)}</td>${fr.map((_, j) => `<td class="num${i === j ? ' hl' : ''}">${i === j ? 1 : 0}</td>`).join('')}</tr>`).join('')}`;
      $('#encMsg').innerHTML = `<div class="def" style="margin-top:0">🔥 <b>원핫 인코딩</b>: 종류마다 열을 하나씩 만들고, 해당하는 칸만 <b>1</b>, 나머지는 <b>0</b>으로 적어요.</div><ul><li>어느 과일이 더 크다는 <b>순서·크기가 없어요</b>.</li><li>모든 과일 사이의 거리가 똑같아요 (√2 ≈ 1.41).</li><li>대신 종류가 많아지면 <b>열도 많아져요</b>: 지금 ${fr.length}종류 → ${fr.length}개 열</li></ul><p class="hint">새 과일을 추가해서 열이 어떻게 늘어나는지 보세요.</p>`;
    }
  };
  segBind('#encMode', (b) => { m = b.dataset.m; go(); });
  $('#encAdd').addEventListener('click', () => {
    const v = $('#encNew').value.trim();
    if (!v) return; if (fr.includes(v)) { toast('이미 있는 과일이에요'); return; } if (fr.length >= 8) { toast('8종류까지만 넣을 수 있어요'); return; }
    fr.push(v); $('#encNew').value = ''; go();
  });
  $('#encNew').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#encAdd').click(); });
  $('#encReset').addEventListener('click', () => { fr = DEF.slice(); go(); });
  go();
}

/* ---------- 3-7 시각화 ---------- */
function quart(a) { const s = a.slice().sort((x, y) => x - y), q = (p) => { const i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); }; return [q(0.25), q(0.5), q(0.75)]; }
function initCharts() {
  const cv = $('#chartCanvas'), ctx = cv.getContext('2d');
  let kind = 'bar', barKey = 'fruit';
  const DESC = {
    bar: '<h3>📊 막대그래프</h3><p><b>범주형</b> 데이터의 각 범주가 가진 값의 크기를 <b>막대의 길이</b>로 나타내요. 여러 종류의 크기를 비교할 때 좋아요.</p>',
    hist: '<h3>📶 히스토그램</h3><p><b>수치형</b> 데이터를 일정한 <b>구간</b>으로 나누고, 각 구간에 속한 데이터 수를 막대 높이로 나타내요. 데이터의 <b>분포</b>를 볼 수 있어요.</p><p class="hint">막대그래프와 비슷해 보이지만 <b>y축이 빈도(개수)</b>이고 막대 사이에 틈이 없어요. 구간 개수를 바꿔 보세요.</p>',
    scatter: '<h3>✨ 산점도</h3><p>두 변수의 관계를 <b>점</b>으로 나타내요. 두 변수의 <b>상관관계</b>를 보는 데 쓰고, 무리에서 멀리 떨어진 <b>이상치</b>를 찾기에도 좋아요.</p>',
    box: '<h3>📦 상자그림</h3><p>최솟값·최댓값과 <b>사분위수</b>(25%, 50%=중앙값, 75%)를 상자와 선으로 나타내요. 데이터의 <b>분포</b>와 <b>이상치</b>(점)를 한눈에 볼 수 있어요.</p><p class="hint">상자 = 가운데 50%의 학생, 굵은 선 = 중앙값, 수염 밖의 점 = 이상치</p>',
  };
  const draw = () => {
    const D = classData(), W = cv.width, H = cv.height, blue = cssVar('--blue'), ink = cssVar('--ink-2');
    ctx.clearRect(0, 0, W, H);
    $('#chartDesc').innerHTML = DESC[kind];
    $('#binWrap').hidden = kind !== 'hist'; $('#barCol').hidden = kind !== 'bar';
    ctx.font = '13px "Noto Sans KR"';
    if (kind === 'bar') {
      const keys = barKey === 'fruit' ? FRUITS : BLOODS, cnt = keys.map((k) => D.filter((d) => d[barKey] === k).length), m = Math.max(...cnt) + 1;
      const P = plotFrame(cv, { x0: 0, x1: keys.length, y0: 0, y1: m, xt: 1, yt: Math.min(m, 6), yl: '↑ 학생 수(명)', fx: () => '' }); P.axes();
      const cols = ['--red', '--yellow', '--purple', '--blue', '--orange'];
      keys.forEach((k, i) => { const x = P.px(i + 0.18), w = P.px(i + 0.82) - x; ctx.fillStyle = cssVar(cols[i % 5]); ctx.fillRect(x, P.py(cnt[i]), w, P.py(0) - P.py(cnt[i])); ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(k, x + w / 2, H - 22); ctx.fillText(cnt[i] + '명', x + w / 2, P.py(cnt[i]) - 6); });
    } else if (kind === 'hist') {
      const nb = +$('#histBins').value; $('#histBinsVal').textContent = nb;
      const hs = D.map((d) => d.h), lo = Math.floor(Math.min(...hs)), hi = Math.ceil(Math.max(...hs)) + 0.01, bw = (hi - lo) / nb;
      const cnt = Array(nb).fill(0); hs.forEach((h) => cnt[Math.min(nb - 1, Math.floor((h - lo) / bw))]++);
      const m = Math.max(...cnt) + 1;
      const P = plotFrame(cv, { x0: lo, x1: hi, y0: 0, y1: m, xt: nb, yt: Math.min(m, 6), xl: '키(cm) →', yl: '↑ 빈도(명)', fx: (v) => fmt(v, 0) }); P.axes();
      cnt.forEach((c, i) => { const x0 = P.px(lo + i * bw), x1 = P.px(lo + (i + 1) * bw); ctx.fillStyle = blue; ctx.globalAlpha = .8; ctx.fillRect(x0, P.py(c), x1 - x0, P.py(0) - P.py(c)); ctx.globalAlpha = 1; ctx.strokeStyle = cssVar('--surface'); ctx.strokeRect(x0, P.py(c), x1 - x0, P.py(0) - P.py(c)); if (c) { ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(c, (x0 + x1) / 2, P.py(c) - 5); } });
    } else if (kind === 'scatter') {
      const P = plotFrame(cv, { x0: 145, x1: 195, y0: 30, y1: 110, xt: 5, yt: 4, xl: '키(cm) →', yl: '↑ 몸무게(kg)' }); P.axes();
      const c = leastSquares(D.map((d) => [d.h]), D.map((d) => d.w)), res = D.map((d) => d.w - c[0] - c[1] * d.h), sd = Math.sqrt(mean(res.map((r) => r * r)));
      ctx.strokeStyle = cssVar('--muted'); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(P.px(145), P.py(c[0] + c[1] * 145)); ctx.lineTo(P.px(195), P.py(c[0] + c[1] * 195)); ctx.stroke(); ctx.setLineDash([]);
      D.forEach((d, i) => {
        const x = P.px(d.h), y = P.py(d.w), odd = Math.abs(res[i]) > 2.5 * sd;
        if (d.star) { ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⭐', x, y); ctx.textBaseline = 'alphabetic'; ctx.font = '13px "Noto Sans KR"'; return; }
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = odd ? cssVar('--red') : blue; ctx.fill();
        if (odd) { ctx.fillStyle = cssVar('--red'); ctx.textAlign = 'left'; ctx.fillText('← 이상치일까?', x + 10, y + 4); }
      });
      ctx.fillStyle = ink; ctx.textAlign = 'right'; ctx.fillText(`상관계수 r = ${fmt(corr(D.map((d) => d.h), D.map((d) => d.w)), 2)} (키가 클수록 몸무게도 무거운 편)`, W - 20, 30);
    } else {
      const groups = [1, 2, 3].map((b) => D.filter((d) => d.ban === b).map((d) => d.ex)), mx = Math.max(100, ...groups.flat()) + 10;
      const P = plotFrame(cv, { x0: 0, x1: 3, y0: 0, y1: mx, xt: 1, yt: 5, yl: '↑ 하루 운동 시간(분)', fx: () => '' }); P.axes();
      groups.forEach((g, i) => {
        if (!g.length) return;
        const [q1, q2, q3] = quart(g), iqr = q3 - q1, inn = g.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr), lo = Math.min(...inn), hi = Math.max(...inn);
        const cx = P.px(i + 0.5), bw = 70;
        ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, P.py(lo)); ctx.lineTo(cx, P.py(q1)); ctx.moveTo(cx, P.py(q3)); ctx.lineTo(cx, P.py(hi)); ctx.moveTo(cx - 18, P.py(lo)); ctx.lineTo(cx + 18, P.py(lo)); ctx.moveTo(cx - 18, P.py(hi)); ctx.lineTo(cx + 18, P.py(hi)); ctx.stroke();
        ctx.fillStyle = cssVar('--green-soft'); ctx.fillRect(cx - bw / 2, P.py(q3), bw, P.py(q1) - P.py(q3)); ctx.strokeRect(cx - bw / 2, P.py(q3), bw, P.py(q1) - P.py(q3));
        ctx.lineWidth = 3.5; ctx.strokeStyle = cssVar('--green'); ctx.beginPath(); ctx.moveTo(cx - bw / 2, P.py(q2)); ctx.lineTo(cx + bw / 2, P.py(q2)); ctx.stroke(); ctx.lineWidth = 1;
        g.filter((v) => !inn.includes(v)).forEach((v) => { ctx.fillStyle = cssVar('--red'); ctx.beginPath(); ctx.arc(cx, P.py(v), 6, 0, Math.PI * 2); ctx.fill(); ctx.textAlign = 'left'; ctx.fillText(`이상치 ${v}분`, cx + 10, P.py(v) + 4); });
        ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(`${i + 1}반 (중앙값 ${fmt(q2, 0)}분)`, cx, H - 22);
      });
    }
  };
  segBind('#chartTabs', (b) => { kind = b.dataset.c; draw(); });
  segBind('#barCol', (b) => { barKey = b.dataset.k; draw(); });
  $('#histBins').addEventListener('input', draw);
  document.addEventListener('surveychange', draw);
  document.addEventListener('themechange', draw);
  draw();
}
function initChartSorter() {
  makeSorter($('#chartSorter').closest('.card'), [
    ['🍎 반 친구들이 좋아하는 과일별 인원 비교', 'bar'], ['🏫 반별 한 달 독서량 합계 비교', 'bar'], ['🩸 혈액형별 학생 수', 'bar'],
    ['📏 우리 학년 키가 어느 구간에 많이 몰려 있는지', 'hist'], ['⏰ 등교 시각이 몇 분대에 몰리는지', 'hist'], ['📝 시험 점수 분포 (10점 단위 구간)', 'hist'],
    ['📚 공부 시간과 성적의 관계', 'scatter'], ['🌡️ 기온과 아이스크림 판매량의 관계', 'scatter'], ['👟 키와 신발 크기의 관계', 'scatter'],
    ['📦 세 반의 수학 점수 분포를 한눈에 비교', 'box'], ['🏃 반별 100m 기록의 중앙값과 사분위수', 'box'], ['💰 용돈 분포에서 튀는 값(이상치) 찾기', 'box'],
  ], '상황에 맞는 그래프를 잘 골랐어요.');
}
function initCorr() {
  const cv = $('#corrCanvas'), P = plotFrame(cv, { x0: 0, x1: 10, y0: 0, y1: 10, xt: 5, yt: 5, xl: 'x →', yl: '↑ y' }), ctx = P.ctx;
  let pts = [], drag = -1;
  const preset = (k) => {
    const r = seeded({ pos: 3, neg: 4, none: 5 }[k] || 1);
    pts = k === 'clear' ? [] : Array.from({ length: 20 }, () => { const x = 1 + r() * 8; const y = k === 'pos' ? 1 + x * 0.8 + 1.1 * gauss(r) : k === 'neg' ? 9 - x * 0.8 + 1.1 * gauss(r) : 1 + r() * 8; return { x, y: clamp(y, 0.3, 9.7) }; });
    draw();
  };
  const draw = () => {
    ctx.clearRect(0, 0, P.W, P.H); P.axes();
    if (pts.length >= 3) {
      const c = leastSquares(pts.map((p) => [p.x]), pts.map((p) => p.y));
      ctx.strokeStyle = cssVar('--muted'); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(P.px(0), P.py(c[0])); ctx.lineTo(P.px(10), P.py(c[0] + c[1] * 10)); ctx.stroke(); ctx.setLineDash([]);
    }
    pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(P.px(p.x), P.py(p.y), 7, 0, Math.PI * 2); ctx.fillStyle = i === drag ? cssVar('--orange') : cssVar('--purple'); ctx.fill(); });
    const r = pts.length >= 3 ? corr(pts.map((p) => p.x), pts.map((p) => p.y)) : NaN;
    $('#corrR').textContent = Number.isFinite(r) ? r.toFixed(2) : '-';
    const a = Math.abs(r), v = $('#corrVerdict');
    if (!Number.isFinite(r)) { v.textContent = '점을 3개 이상 찍어 주세요'; v.className = 'verdict'; }
    else { v.textContent = (a >= 0.7 ? '강한 ' : a >= 0.3 ? '약한 ' : '') + (a < 0.3 ? '☁️ 상관관계가 거의 없어요' : r > 0 ? '📈 양의 상관관계' : '📉 음의 상관관계'); v.className = 'verdict ' + (a >= 0.7 ? 'good' : a >= 0.3 ? 'mid' : 'bad'); }
  };
  onDrag(cv, {
    down: (p) => {
      if (!P.inside(p)) return;
      drag = pts.findIndex((q) => Math.hypot(P.px(q.x) - p.x, P.py(q.y) - p.y) < 14);
      if (drag < 0) { pts.push({ x: P.ix(p.x), y: P.iy(p.y) }); drag = pts.length - 1; }
      draw();
    },
    move: (p) => { if (drag < 0) return; pts[drag] = { x: clamp(P.ix(p.x), 0, 10), y: clamp(P.iy(p.y), 0, 10) }; draw(); },
    up: () => { drag = -1; draw(); },
  });
  $$('[data-p]', cv.closest('.card')).forEach((b) => b.addEventListener('click', () => preset(b.dataset.p)));
  document.addEventListener('themechange', draw);
  preset('pos');
}
function initKeyFeat() {
  const r = seeded(11), D = [];
  for (let i = 0; i < 80; i++) {
    const h = clamp(158 + 16 * gauss(r), 125, 190), bmi = clamp(21 + 3.8 * gauss(r), 15, 33), w = bmi * (h / 100) ** 2, ex = clamp(40 + 22 * gauss(r), 0, 120);
    D.push({ h, w, ex, no: (i % 30) + 1, lucky: 1 + Math.floor(r() * 100), bmi, fat: -4 + 1.35 * bmi - 0.07 * ex + 1.3 * gauss(r) });
  }
  const tr = D.slice(0, 16), te = D.slice(16);
  const F = { h: '📏 키', w: '⚖️ 몸무게', ex: '🏃 운동 시간', no: '🔢 출석번호', lucky: '🍀 좋아하는 숫자', bmi: '🆕 BMI' };
  let hasBMI = false; const on = new Set(['h', 'w']); let best = Infinity;
  const keys = () => Object.keys(F).filter((k) => k !== 'bmi' || hasBMI);
  const matrix = () => {
    const ks = [...keys(), 'fat'], nm = { ...F, fat: '🎯 체지방률' };
    const cell = (v) => `<td class="num" style="background:${v >= 0 ? `rgba(34,160,107,${Math.abs(v) * 0.6})` : `rgba(226,72,58,${Math.abs(v) * 0.6})`}">${v.toFixed(2)}</td>`;
    $('#corrMatrix').innerHTML = `<tr><th></th>${ks.map((k) => `<th>${nm[k]}</th>`).join('')}</tr>` + ks.map((a) => `<tr><th>${nm[a]}</th>${ks.map((b) => cell(corr(D.map((d) => d[a]), D.map((d) => d[b])))).join('')}</tr>`).join('');
  };
  const train = () => {
    $('#featPick').innerHTML = keys().map((k) => `<button class="chip${on.has(k) ? ' on' : ''}" data-k="${k}">${F[k]}</button>`).join('');
    $$('#featPick button').forEach((b) => b.addEventListener('click', () => { on.has(b.dataset.k) ? on.delete(b.dataset.k) : on.add(b.dataset.k); train(); }));
    const s = [...on];
    $('#featN').textContent = s.length;
    if (!s.length) { $('#featErr').textContent = '-'; $('#featMsg').textContent = '속성을 하나 이상 골라 주세요.'; return; }
    const c = leastSquares(tr.map((d) => s.map((k) => d[k])), tr.map((d) => d.fat));
    const e = mean(te.map((d) => Math.abs(c[0] + s.reduce((a, k, j) => a + c[j + 1] * d[k], 0) - d.fat)));
    best = Math.min(best, e);
    $('#featErr').textContent = fmt(e, 2) + '%p'; $('#featBest').textContent = fmt(best, 2) + '%p';
    const useless = s.filter((k) => k === 'no' || k === 'lucky');
    let msg;
    if (useless.length && s.length === useless.length) msg = '😵 출석번호나 좋아하는 숫자는 체지방률과 상관이 거의 없어서 예측이 엉망이에요.';
    else if (useless.length) msg = `🤔 ${useless.map((k) => F[k]).join(', ')}은(는) 상관계수가 0에 가까운 불필요한 속성이에요. 빼면 오차가 어떻게 되는지 보세요.`;
    else if (on.has('bmi') && on.has('ex')) msg = '🏆 BMI + 운동 시간! 핵심 속성만 골라 쓰니 적은 속성으로도 오차가 가장 작아요.';
    else if (on.has('bmi')) msg = '👍 새로 만든 BMI 속성이 체지방률과 상관계수가 가장 높아요. 다른 핵심 속성도 하나 더 골라 볼까요?';
    else if (!hasBMI) msg = '키와 몸무게를 따로 쓰는 것보다 좋은 방법이 있을까요? 아래 버튼으로 새 속성을 만들어 보세요.';
    else msg = '상관계수 표에서 🎯 체지방률과 숫자가 큰 속성을 찾아보세요.';
    $('#featMsg').textContent = msg;
  };
  $('#addBMI').addEventListener('click', () => { if (hasBMI) return; hasBMI = true; $('#addBMI').disabled = true; $('#addBMI').textContent = '✅ BMI 속성을 만들었어요'; matrix(); train(); toast('🆕 BMI 열이 추가됐어요'); });
  matrix(); train();
}
