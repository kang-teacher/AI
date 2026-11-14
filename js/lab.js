/* 6단원: 진짜 데이터로 머신러닝 실습 (데이터 → 전처리 → 나누기 → 학습 → 평가 → 예측) */
const LAB_META = {
  penguin: {
    icon: '🐧', name: '펭귄', sub: '344마리 · 7개 속성', desc: '남극 파머 군도의 세 섬에서 연구자들이 직접 잰 펭귄 344마리의 기록이에요. 비어 있는 값(결측치)과 범주형 속성(섬, 성별)이 있어서 전처리 연습에 딱 좋아요.',
    cols: [['종', 'cat'], ['섬', 'cat'], ['부리 길이(mm)', 'num'], ['부리 깊이(mm)', 'num'], ['날개 길이(mm)', 'num'], ['몸무게(g)', 'num'], ['성별', 'cat']],
    targets: [[0, 'cls', '🐧 펭귄 종 맞히기'], [5, 'reg', '⚖️ 몸무게 예측하기']],
  },
  iris: {
    icon: '🌸', name: '붓꽃', sub: '150송이 · 5개 속성', desc: '1936년에 붓꽃 세 품종을 50송이씩 재서 기록한 아주 유명한 데이터예요. 비어 있는 값이 없는 깨끗한 데이터예요.',
    cols: [['꽃받침 길이(cm)', 'num'], ['꽃받침 너비(cm)', 'num'], ['꽃잎 길이(cm)', 'num'], ['꽃잎 너비(cm)', 'num'], ['품종', 'cat']],
    targets: [[4, 'cls', '🌸 품종 맞히기'], [2, 'reg', '📏 꽃잎 길이 예측하기']],
  },
  car: {
    icon: '🚗', name: '자동차 연비', sub: '398대 · 8개 속성', desc: '1970~1982년에 나온 자동차 398대의 기록이에요. 마력이 빠진 차가 6대 있어요. 단위는 km/L, kg, cc로 바꿨어요. (가속 시간: 시속 0 → 약 96km까지 걸린 시간)',
    cols: [['연비(km/L)', 'num'], ['실린더 수', 'num'], ['배기량(cc)', 'num'], ['마력', 'num'], ['무게(kg)', 'num'], ['가속 시간(초)', 'num'], ['연식(년)', 'num'], ['생산지', 'cat']],
    targets: [[0, 'reg', '⛽ 연비 예측하기'], [7, 'cls', '🌏 생산지 맞히기']],
  },
};
const LAB_MODELS = {
  cls: [
    { k: 'knn', icon: '👥', t: 'K-최근접 이웃', hp: ['이웃 수 K', 1, 25, 5], d: '새 데이터와 <b>가장 가까운 K개</b>의 훈련 데이터를 찾아 다수결로 정해요. K가 너무 작으면 훈련 데이터를 외우고(과대적합), 너무 크면 대충 판단해요(과소적합).' },
    { k: 'tree', icon: '🌳', t: '의사결정트리', hp: ['최대 깊이', 1, 10, 3], d: '"부리 길이가 42mm보다 긴가?" 같은 <b>예/아니요 질문</b>을 이어 가며 나눠요. 깊이가 깊을수록 질문이 많아져 훈련 데이터를 외우기 쉬워요.' },
    { k: 'logit', icon: '⚡', t: '로지스틱 회귀', hp: ['학습 횟수', 5, 400, 150], d: '속성마다 <b>가중치</b>를 곱해 더하고 각 클래스일 확률을 계산해요. 퍼셉트론처럼 틀린 만큼 가중치를 고쳐 가며 배워요. (학습이 잘 되도록 안에서 값의 범위를 맞춰요)' },
  ],
  reg: [
    { k: 'linear', icon: '📈', t: '선형 회귀', hp: null, d: '속성마다 가중치를 곱해 더한 <b>직선(평면)</b>으로 예측해요. 오차의 제곱이 가장 작아지는 가중치를 계산으로 찾아요.' },
    { k: 'knn', icon: '👥', t: 'K-최근접 이웃 회귀', hp: ['이웃 수 K', 1, 25, 5], d: '가장 가까운 K개 훈련 데이터의 값을 <b>평균</b>내서 예측해요.' },
    { k: 'tree', icon: '🌳', t: '의사결정트리 회귀', hp: ['최대 깊이', 1, 10, 4], d: '질문으로 데이터를 나눈 뒤, 마지막 칸에 모인 데이터의 <b>평균</b>으로 예측해요.' },
  ],
};
const LAB_COLORS = ['#3b6fe0', '#f07a1a', '#22a06b', '#e9468b', '#7b55d9'];

function initLab() {
  const L = { ds: 'penguin', t: 0, kind: 'cls', feats: new Set(), miss: 'drop', out: 'keep', enc: 'onehot', scale: 'minmax', ratio: 0.8, seed: 7, model: 'knn', hp: {}, M: null };
  const meta = () => LAB_META[L.ds], rows = () => DATASETS[L.ds].rows, isNum = (c) => meta().cols[c][1] === 'num';
  const cname = (c) => meta().cols[c][0];
  const iqr = (vals) => { const s = vals.slice().sort((a, b) => a - b), q = (p) => { const i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); }, q1 = q(0.25), q3 = q(0.75); return [q1 - 1.5 * (q3 - q1), q3 + 1.5 * (q3 - q1)]; };
  const fmtV = (v) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : fmt(v, 2)) : v);

  /* --- 1단계 --- */
  $('#lbDs').innerHTML = Object.entries(LAB_META).map(([k, m]) => `<button class="feat" data-k="${k}"><span class="feat-ic">${m.icon}</span><b>${m.name}</b><small>${m.sub}</small></button>`).join('');
  $$('#lbDs .feat').forEach((b) => b.addEventListener('click', () => setDs(b.dataset.k)));
  function setDs(k) {
    L.ds = k; $$('#lbDs .feat').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
    $('#lbDsDesc').textContent = meta().desc;
    $('#lbTarget').innerHTML = meta().targets.map(([c, kind, lab]) => `<button class="chip" data-c="${c}">${lab} <span class="tag">${kind === 'cls' ? '분류' : '회귀'}</span></button>`).join('');
    $$('#lbTarget button').forEach((b) => b.addEventListener('click', () => setTarget(+b.dataset.c)));
    setTarget(meta().targets[0][0]);
  }
  function setTarget(c) {
    L.t = c; L.kind = meta().targets.find((x) => x[0] === c)[1];
    $$('#lbTarget button').forEach((b) => b.classList.toggle('on', +b.dataset.c === c));
    L.feats = new Set(meta().cols.map((_, i) => i).filter((i) => i !== c));
    L.model = LAB_MODELS[L.kind][0].k; L.hp = {};
    $('#lbTask').innerHTML = L.kind === 'cls'
      ? `맞힐 값 <b>${cname(c)}</b>은(는) 범주형이에요 → 정해진 종류 중 하나를 고르는 <b>🏷️ 분류</b> 문제`
      : `맞힐 값 <b>${cname(c)}</b>은(는) 수치형이에요 → 연속적인 숫자를 맞히는 <b>📏 회귀</b> 문제`;
    renderExplore(); renderModels(); refresh();
  }

  /* --- 2단계 --- */
  function renderExplore() {
    const R = rows(), cols = meta().cols, missRows = R.filter((r) => r.some((v) => v == null)).length;
    const tv = R.map((r) => r[L.t]).filter((v) => v != null);
    const tInfo = L.kind === 'cls' ? [...new Set(tv)].sort().map((k) => `${k} ${tv.filter((v) => v === k).length}`).join(' · ') : `평균 ${fmt(mean(tv))}, ${fmt(Math.min(...tv))} ~ ${fmt(Math.max(...tv))}`;
    $('#lbOverview').innerHTML = `<div><span>데이터(행)</span><b>${R.length}</b></div><div><span>속성(열)</span><b>${cols.length}</b></div><div><span>빈 값이 있는 행</span><b>${missRows}</b></div><div style="flex:3"><span>🎯 ${cname(L.t)}</span><b style="font-size:.95rem">${tInfo}</b></div>`;
    $('#lbHead').innerHTML = `<tr>${cols.map(([n], i) => `<th class="${i === L.t ? 'label-col' : ''}">${i === L.t ? '🎯 ' : ''}${n}</th>`).join('')}</tr>` + R.slice(0, 8).map((r) => `<tr>${r.map((v, i) => `<td class="${v == null ? 'miss' : ''}${i === L.t ? ' label-col' : ''}">${v == null ? '비어 있음' : fmtV(v)}</td>`).join('')}</tr>`).join('');
    $('#lbCols').innerHTML = `<tr><th>속성</th><th>종류</th><th>결측치</th><th>이상치(상자그림 기준)</th><th>값</th></tr>` + cols.map(([n, ty], i) => {
      const v = R.map((r) => r[i]).filter((x) => x != null), miss = R.length - v.length;
      let out = '-', range;
      if (ty === 'num') { const [lo, hi] = iqr(v); out = v.filter((x) => x < lo || x > hi).length; range = `${fmtV(Math.min(...v))} ~ ${fmtV(Math.max(...v))}`; }
      else range = [...new Set(v)].sort().join(', ');
      return `<tr${i === L.t ? ' class="hl"' : ''}><td>${i === L.t ? '🎯 ' : ''}${n}</td><td>${ty === 'num' ? '수치형' : '범주형'}</td><td class="${miss ? 'miss' : ''}">${miss}</td><td class="${out ? 'out' : ''}">${out}</td><td style="white-space:normal">${range}</td></tr>`;
    }).join('');
    const nums = cols.map((c, i) => i).filter((i) => isNum(i) && i !== L.t);
    const opt = nums.map((i) => `<option value="${i}">${cname(i)}</option>`).join('');
    $('#lbX').innerHTML = opt; $('#lbY').innerHTML = opt;
    $('#lbX').value = nums[0]; $('#lbY').value = nums[1] ?? nums[0];
    drawScatter();
  }
  function drawScatter() {
    const cv = $('#lbScatter'), xi = +$('#lbX').value, yi = +$('#lbY').value;
    const R = rows().filter((r) => r[xi] != null && r[yi] != null && r[L.t] != null);
    const xs = R.map((r) => r[xi]), ys = R.map((r) => r[yi]), px = (Math.max(...xs) - Math.min(...xs)) * 0.05 || 1, py = (Math.max(...ys) - Math.min(...ys)) * 0.05 || 1;
    const P = plotFrame(cv, { x0: Math.min(...xs) - px, x1: Math.max(...xs) + px, y0: Math.min(...ys) - py, y1: Math.max(...ys) + py, xl: cname(xi) + ' →', yl: '↑ ' + cname(yi), pad: [56, 16, 22, 40], fx: (v) => fmt(v, 1), fy: (v) => fmt(v, 1) });
    P.ctx.clearRect(0, 0, P.W, P.H); P.axes();
    let color;
    if (L.kind === 'cls') { const cl = [...new Set(R.map((r) => r[L.t]))].sort(); color = (r) => LAB_COLORS[cl.indexOf(r[L.t]) % 5]; $('#lbLegend').innerHTML = cl.map((c, i) => `<span><i style="background:${LAB_COLORS[i % 5]}"></i>${c}</span>`).join(''); }
    else { const tv = R.map((r) => r[L.t]), lo = Math.min(...tv), hi = Math.max(...tv); color = (r) => `hsl(${220 - (r[L.t] - lo) / (hi - lo || 1) * 200},75%,50%)`; $('#lbLegend').innerHTML = `<span><i style="background:hsl(220,75%,50%)"></i>${cname(L.t)} 작음 (${fmtV(lo)})</span><span><i style="background:hsl(20,75%,50%)"></i>큼 (${fmtV(hi)})</span>`; }
    R.forEach((r) => { P.ctx.globalAlpha = 0.75; P.ctx.fillStyle = color(r); P.ctx.beginPath(); P.ctx.arc(P.px(r[xi]), P.py(r[yi]), 4.5, 0, Math.PI * 2); P.ctx.fill(); });
    P.ctx.globalAlpha = 1;
  }
  ['lbX', 'lbY'].forEach((id) => $('#' + id).addEventListener('change', drawScatter));

  /* --- 3단계: 전처리 --- */
  function clean() {
    const used = [...L.feats, L.t], R0 = rows();
    let R = R0.filter((r) => r[L.t] != null);
    const noTarget = R0.length - R.length;
    const stat = {};
    used.forEach((c) => { const v = R.map((r) => r[c]).filter((x) => x != null); stat[c] = isNum(c) ? mean(v) : mode(v); });
    let missRows = 0, filled = 0;
    if (L.miss === 'drop') { const before = R.length; R = R.filter((r) => used.every((c) => r[c] != null)); missRows = before - R.length; }
    else R = R.map((r) => r.map((v, c) => { if (v == null && used.includes(c)) { filled++; return isNum(c) ? +stat[c].toFixed(1) : stat[c]; } return v; }));
    const numUsed = used.filter((c) => isNum(c)), bounds = {};
    numUsed.forEach((c) => { bounds[c] = iqr(R.map((r) => r[c]).filter((x) => x != null)); });
    const isOut = (r) => numUsed.some((c) => r[c] != null && (r[c] < bounds[c][0] || r[c] > bounds[c][1]));
    const outRows = R.filter(isOut).length;
    if (L.out === 'drop') R = R.filter((r) => !isOut(r));
    return { R, noTarget, missRows, filled, outRows, stat };
  }
  function makeEncoder(train, all) {
    const parts = [];
    [...L.feats].sort((a, b) => a - b).forEach((c) => {
      if (isNum(c)) { const v = train.map((r) => r[c]); parts.push({ c, type: 'num', names: [cname(c)], min: Math.min(...v), max: Math.max(...v) }); }
      else {
        const cats = [...new Set(all.map((r) => r[c]))].sort();
        if (L.enc === 'onehot') parts.push({ c, type: 'onehot', cats, names: cats.map((k) => `${cname(c)}=${k}`) });
        else parts.push({ c, type: 'label', cats, names: [`${cname(c)}(번호)`], min: 0, max: cats.length - 1 });
      }
    });
    const sc = (p, v) => (L.scale === 'minmax' ? (p.max > p.min ? (v - p.min) / (p.max - p.min) : 0) : v);
    const tf = (r) => parts.flatMap((p) => (p.type === 'num' ? [sc(p, r[p.c])] : p.type === 'label' ? [sc(p, Math.max(0, p.cats.indexOf(r[p.c])))] : p.cats.map((k) => (r[p.c] === k ? 1 : 0))));
    return { parts, names: parts.flatMap((p) => p.names), tf };
  }
  function pipeline() {
    const C = clean(), r = seeded(L.seed), idx = C.R.map((_, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const ntr = Math.round(C.R.length * L.ratio), tr = idx.slice(0, ntr).map((i) => C.R[i]), te = idx.slice(ntr).map((i) => C.R[i]);
    const E = makeEncoder(tr, C.R), classes = L.kind === 'cls' ? [...new Set(C.R.map((x) => x[L.t]))].sort() : null;
    const ty = (x) => (L.kind === 'cls' ? classes.indexOf(x[L.t]) : x[L.t]);
    return { C, tr, te, E, classes, Xtr: tr.map(E.tf), ytr: tr.map(ty), Xte: te.map(E.tf), yte: te.map(ty) };
  }
  function renderPrep(Pp) {
    const { C } = Pp;
    $('#lbMissMsg').innerHTML = L.miss === 'drop' ? `빈 값이 있는 <b>${C.missRows}행</b>을 지웠어요.${C.missRows ? '' : ' (고른 속성에는 빈 값이 없어요)'}` : `빈 칸 <b>${C.filled}개</b>를 채웠어요. 수치형은 평균값, 범주형은 최빈값으로요.`;
    if (C.noTarget) $('#lbMissMsg').innerHTML += ` 맞힐 값이 비어 있는 ${C.noTarget}행은 정답을 알 수 없어서 항상 빼요.`;
    $('#lbOutMsg').innerHTML = `상자그림 기준으로 범위를 벗어난 값이 있는 행: <b>${C.outRows}행</b>${L.out === 'drop' ? ' → 지웠어요' : ''}. 실제 데이터의 이상치는 틀린 값이 아니라 진짜 특이한 경우일 수도 있어서 신중하게 정해요.`;
    const cats = [...L.feats].filter((c) => !isNum(c));
    $('#lbEncMsg').innerHTML = cats.length ? (L.enc === 'onehot' ? `${cats.map(cname).join(', ')}을(를) 종류마다 0/1 열로 바꿨어요.` : `${cats.map(cname).join(', ')}을(를) 0, 1, 2… 번호로 바꿨어요. 순서가 없는 값이라 모델이 엉뚱한 크기 관계를 배울 수 있어요.`) : '고른 속성에 범주형이 없어요.';
    const R = rows(), tNum = isNum(L.t);
    $('#lbFeat').innerHTML = meta().cols.map((c, i) => i).filter((i) => i !== L.t).map((i) => {
      let r = '';
      if (tNum && isNum(i)) { const ok = R.filter((x) => x[i] != null && x[L.t] != null); r = ` (${fmt(corr(ok.map((x) => x[i]), ok.map((x) => x[L.t])), 2)})`; }
      return `<button class="chip${L.feats.has(i) ? ' on' : ''}" data-c="${i}">${cname(i)}${r}</button>`;
    }).join('');
    $$('#lbFeat button').forEach((b) => b.addEventListener('click', () => { const c = +b.dataset.c; if (L.feats.has(c)) { if (L.feats.size === 1) { toast('속성을 하나 이상 남겨 주세요'); return; } L.feats.delete(c); } else L.feats.add(c); refresh(); }));
    $('#lbPrep').innerHTML = `전처리 결과: <b>${C.R.length}행</b> × 입력 <b>${Pp.E.names.length}열</b> + 맞힐 값 1열`;
    const show = Pp.tr.slice(0, 5);
    $('#lbMatrix').innerHTML = `<tr>${Pp.E.names.map((n) => `<th class="feat-col">${n}</th>`).join('')}<th class="label-col">🎯 ${cname(L.t)}</th></tr>` + show.map((r, i) => `<tr>${Pp.Xtr[i].map((v) => `<td class="num">${fmt(v, 2)}</td>`).join('')}<td class="label-col">${fmtV(r[L.t])}</td></tr>`).join('');
  }

  /* --- 4단계 --- */
  function renderSplit(Pp) {
    const a = Pp.tr.length, b = Pp.te.length, p = Math.round(L.ratio * 100);
    $('#lbRatioV').textContent = p + '%';
    $('#lbSplitBar').innerHTML = `<span class="sp-train" style="flex:none;width:${p}%">훈련 ${a}개</span><span class="sp-test" style="flex:none;width:${100 - p}%">테스트 ${b}개</span>`;
  }
  $('#lbRatio').addEventListener('input', () => { L.ratio = +$('#lbRatio').value / 100; refresh(); });
  $('#lbShuffle').addEventListener('click', () => { L.seed = Math.floor(Math.random() * 1e6); refresh(); toast('데이터를 새로 섞어서 나눴어요'); });
  [['lbMiss', 'miss'], ['lbOut', 'out'], ['lbEnc', 'enc'], ['lbScale', 'scale']].forEach(([id, k]) => segBind('#' + id, (b) => { L[k] = b.dataset.v; refresh(); }));

  /* --- 5단계: 모델 --- */
  const curModel = () => LAB_MODELS[L.kind].find((m) => m.k === L.model);
  const hpOf = (m) => (m.hp ? (L.hp[m.k] ?? m.hp[3]) : null);
  function renderModels() {
    $('#lbModels').innerHTML = LAB_MODELS[L.kind].map((m) => `<button class="feat${m.k === L.model ? ' on' : ''}" data-k="${m.k}"><span class="feat-ic">${m.icon}</span><b>${m.t}</b></button>`).join('');
    $$('#lbModels .feat').forEach((b) => b.addEventListener('click', () => { L.model = b.dataset.k; renderModels(); invalidate(); }));
    const m = curModel();
    $('#lbModelInfo').innerHTML = m.d;
    $('#lbHpWrap').hidden = !m.hp;
    if (m.hp) { const r = $('#lbHp'); r.min = m.hp[1]; r.max = m.hp[2]; r.step = 1; r.value = hpOf(m); $('#lbHpName').textContent = m.hp[0]; $('#lbHpV').textContent = r.value; }
  }
  $('#lbHp').addEventListener('input', () => { L.hp[L.model] = +$('#lbHp').value; $('#lbHpV').textContent = $('#lbHp').value; invalidate(); });

  function fitModel(kind, k, hp, X, y, nC) {
    if (k === 'knn') return knnModel(X, y, hp, kind === 'cls');
    if (k === 'tree') return treeModel(X, y, hp, kind === 'cls', nC);
    if (k === 'logit') return logitModel(X, y, nC, hp);
    const w = leastSquares(X, y, 1e-3); return { predict: (x) => ({ v: w[0] + x.reduce((s, v, i) => s + v * w[i + 1], 0) }) };
  }
  const score = (M, X, y, kind) => {
    const p = X.map((x) => M.predict(x).v);
    if (kind === 'cls') return { p, acc: p.filter((v, i) => v === y[i]).length / (y.length || 1) };
    return { p, mae: mean(p.map((v, i) => Math.abs(v - y[i]))), mse: mean(p.map((v, i) => (v - y[i]) ** 2)) };
  };
  let Pp = null;
  function train() {
    const m = curModel();
    if (Pp.tr.length < 5 || !Pp.te.length) { toast('데이터가 너무 적어요'); return; }
    const M = fitModel(L.kind, m.k, hpOf(m), Pp.Xtr, Pp.ytr, Pp.classes?.length);
    L.M = { M, m, hp: hpOf(m), Pp, tr: score(M, Pp.Xtr, Pp.ytr, L.kind), te: score(M, Pp.Xte, Pp.yte, L.kind) };
    renderEval(); renderForm(); $('#lbPredict').disabled = false; $('#lbPredOut').textContent = '값을 넣고 예측하기를 눌러 보세요';
  }
  $('#lbTrain').addEventListener('click', () => { train(); $('#lbEval').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#lbCompare').addEventListener('click', () => {
    const rowsH = LAB_MODELS[L.kind].map((m) => {
      const M = fitModel(L.kind, m.k, hpOf(m), Pp.Xtr, Pp.ytr, Pp.classes?.length), a = score(M, Pp.Xtr, Pp.ytr, L.kind), b = score(M, Pp.Xte, Pp.yte, L.kind);
      const hp = m.hp ? `${m.hp[0]} ${hpOf(m)}` : '-';
      return L.kind === 'cls' ? [m, hp, a.acc, b.acc] : [m, hp, a.mae, b.mae];
    });
    const best = L.kind === 'cls' ? Math.max(...rowsH.map((r) => r[3])) : Math.min(...rowsH.map((r) => r[3]));
    const f = (v) => (L.kind === 'cls' ? fmt(v * 100, 1) + '%' : fmt(v, 2));
    $('#lbCompareT').innerHTML = `<tr><th>모델</th><th>하이퍼파라미터</th><th>훈련 ${L.kind === 'cls' ? '정확도' : '평균 절대 오차'}</th><th>테스트 ${L.kind === 'cls' ? '정확도' : '평균 절대 오차'}</th></tr>` + rowsH.map(([m, hp, a, b]) => `<tr${b === best ? ' class="hl"' : ''}><td>${m.icon} ${m.t}</td><td>${hp}</td><td class="num">${f(a)}</td><td class="num">${f(b)}${b === best ? ' 🏆' : ''}</td></tr>`).join('');
    $('#lbCompareWrap').hidden = false;
  });

  /* --- 6단계: 평가 --- */
  function renderEval() {
    const { M: _M, m, tr, te, Pp: P } = L.M, el = $('#lbEval');
    if (L.kind === 'cls') {
      const C = P.classes, n = C.length, cm = Array.from({ length: n }, () => Array(n).fill(0));
      P.yte.forEach((a, i) => cm[a][te.p[i]]++);
      const base = Math.max(...C.map((_, k) => P.yte.filter((v) => v === k).length)) / P.yte.length;
      const gap = tr.acc - te.acc;
      const verdict = gap > 0.08 ? ['bad', '🤔 훈련 데이터는 잘 맞히는데 테스트 데이터는 덜 맞혀요. <b>과대적합</b>일 수 있어요. K를 키우거나 깊이를 줄여 보세요.'] : te.acc < base + 0.1 ? ['mid', '😐 가장 많은 종류로 다 찍는 것과 별 차이가 없어요. <b>과소적합</b>이에요. 속성이나 모델을 바꿔 보세요.'] : ['good', '👍 훈련과 테스트 성능이 비슷하게 좋아요. <b>적합</b>하게 학습했어요.'];
      const per = C.map((c, k) => { const tp = cm[k][k], fp = C.reduce((s, _, j) => s + (j !== k ? cm[j][k] : 0), 0), fn = cm[k].reduce((s, v, j) => s + (j !== k ? v : 0), 0); const pr = tp + fp ? tp / (tp + fp) : 0, rc = tp + fn ? tp / (tp + fn) : 0; return [c, pr, rc, pr + rc ? 2 * pr * rc / (pr + rc) : 0]; });
      el.innerHTML = `<div class="stats"><div><span>훈련 정확도</span><b>${fmt(tr.acc * 100, 1)}%</b></div><div><span>테스트 정확도</span><b>${fmt(te.acc * 100, 1)}%</b></div><div><span>모두 한 종류로 찍으면</span><b>${fmt(base * 100, 1)}%</b></div></div>
        <p class="verdict ${verdict[0]}">${verdict[1]}</p>
        <div class="grid2"><div><h4>혼동행렬 (테스트 데이터 ${P.yte.length}개)</h4><div class="dtable-wrap"><table class="dtable"><tr><th>실제 ↓ / 예측 →</th>${C.map((c) => `<th>${c}</th>`).join('')}</tr>${cm.map((r, i) => `<tr><th>${C[i]}</th>${r.map((v, j) => `<td class="num" style="${i === j ? 'background:var(--green-soft);font-weight:900' : v ? 'background:#fde8e6;color:#9b1c12' : ''}">${v}</td>`).join('')}</tr>`).join('')}</table></div><p class="hint">초록 칸(대각선)이 맞힌 개수, 빨간 칸이 틀린 개수예요.</p></div>
        <div><h4>종류별 정밀도·재현율·F1</h4><div class="dtable-wrap"><table class="dtable"><tr><th>종류</th><th>정밀도</th><th>재현율</th><th>F1</th></tr>${per.map(([c, a, b, f]) => `<tr><td>${c}</td><td class="num">${fmt(a * 100, 0)}%</td><td class="num">${fmt(b * 100, 0)}%</td><td class="num">${fmt(f * 100, 0)}%</td></tr>`).join('')}</table></div><p class="hint">정밀도: 그 종류라고 한 것 중 맞은 비율 · 재현율: 실제 그 종류 중 찾아낸 비율</p></div></div>`;
    } else {
      const baseMae = mean(P.yte.map((v) => Math.abs(v - mean(P.ytr))));
      const verdict = te.mae > tr.mae * 1.5 && te.mae - tr.mae > baseMae * 0.1 ? ['bad', '🤔 훈련 데이터 오차보다 테스트 오차가 훨씬 커요. <b>과대적합</b>일 수 있어요.'] : te.mae > baseMae * 0.75 ? ['mid', '😐 평균값 하나로 다 예측하는 것과 별 차이가 없어요. <b>과소적합</b>이에요.'] : ['good', '👍 훈련과 테스트 오차가 비슷하게 작아요. <b>적합</b>하게 학습했어요.'];
      el.innerHTML = `<div class="stats"><div><span>훈련 평균 절대 오차</span><b>${fmt(tr.mae, 2)}</b></div><div><span>테스트 평균 절대 오차</span><b>${fmt(te.mae, 2)}</b></div><div><span>테스트 평균 제곱 오차</span><b>${fmt(te.mse, 1)}</b></div><div><span>평균값으로만 예측하면</span><b>${fmt(baseMae, 2)}</b></div></div>
        <p class="verdict ${verdict[0]}">${verdict[1]}</p><p class="hint">평균 절대 오차(MAE): 예측이 실제와 평균 얼마나 차이 나는지 (단위: ${cname(L.t)}) · 평균 제곱 오차(MSE): 오차를 제곱해 평균낸 값 (큰 오차를 더 무겁게 봐요)</p>
        <canvas id="lbRegCv" width="560" height="380" class="lab-canvas"></canvas><p class="hint">점이 대각선(예측 = 실제)에 가까울수록 잘 맞힌 거예요.</p>`;
      const cv = $('#lbRegCv'), all = P.yte.concat(te.p), lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.05 || 1;
      const F = plotFrame(cv, { x0: lo - pad, x1: hi + pad, y0: lo - pad, y1: hi + pad, xl: '실제 값 →', yl: '↑ 예측 값', pad: [56, 16, 22, 40], fx: (v) => fmt(v, 1), fy: (v) => fmt(v, 1) });
      F.axes(); F.ctx.strokeStyle = cssVar('--muted'); F.ctx.setLineDash([6, 6]); F.ctx.beginPath(); F.ctx.moveTo(F.px(lo - pad), F.py(lo - pad)); F.ctx.lineTo(F.px(hi + pad), F.py(hi + pad)); F.ctx.stroke(); F.ctx.setLineDash([]);
      P.yte.forEach((a, i) => { F.ctx.fillStyle = cssVar('--blue'); F.ctx.globalAlpha = 0.7; F.ctx.beginPath(); F.ctx.arc(F.px(a), F.py(te.p[i]), 4.5, 0, Math.PI * 2); F.ctx.fill(); });
      F.ctx.globalAlpha = 1;
    }
    el.insertAdjacentHTML('afterbegin', `<p class="hint" style="margin-top:0">${m.icon} <b>${m.t}</b>${m.hp ? ` (${m.hp[0]} ${L.M.hp})` : ''} · 훈련 ${L.M.Pp.tr.length}개로 학습, 테스트 ${L.M.Pp.te.length}개로 평가</p>`);
  }

  /* --- 7단계: 예측 --- */
  function renderForm() {
    const R = L.M.Pp.C.R;
    $('#lbForm').innerHTML = [...L.feats].sort((a, b) => a - b).map((c) => {
      const v = R.map((r) => r[c]);
      if (isNum(c)) return `<label>${cname(c)}<input type="number" data-c="${c}" value="${fmtV(median(v))}" step="any"></label>`;
      return `<label>${cname(c)}<select data-c="${c}">${[...new Set(v)].sort().map((k) => `<option>${k}</option>`).join('')}</select></label>`;
    }).join('');
  }
  $('#lbPredict').addEventListener('click', () => {
    if (!L.M) return;
    const r = Array(meta().cols.length).fill(null);
    $$('#lbForm [data-c]').forEach((el) => { const c = +el.dataset.c; r[c] = isNum(c) ? +el.value : el.value; });
    const out = L.M.M.predict(L.M.Pp.E.tf(r));
    $('#lbPredOut').innerHTML = L.kind === 'cls' ? `🔮 예측: <b>${L.M.Pp.classes[out.v]}</b>${out.note ? ` <small>(${out.note})</small>` : ''}` : `🔮 예측한 ${cname(L.t)}: <b>${fmt(out.v, 2)}</b>`;
  });

  function invalidate() {
    if (L.M) { L.M = null; $('#lbEval').innerHTML = '<p class="muted">설정이 바뀌었어요. 5단계에서 다시 학습시켜 주세요.</p>'; $('#lbPredict').disabled = true; $('#lbPredOut').textContent = '먼저 모델을 학습시켜 주세요'; }
    $('#lbCompareWrap').hidden = true;
  }
  function refresh() { Pp = pipeline(); renderPrep(Pp); renderSplit(Pp); invalidate(); }
  document.addEventListener('themechange', () => { drawScatter(); if (L.M) renderEval(); });
  setDs('penguin');
}

/* ---------- 실습용 모델들 ---------- */
function knnModel(X, y, k, cls) {
  return {
    predict(x) {
      const d = X.map((r, i) => [r.reduce((s, v, j) => s + (v - x[j]) ** 2, 0), y[i]]).sort((a, b) => a[0] - b[0]).slice(0, k);
      if (!cls) return { v: mean(d.map((e) => e[1])) };
      const c = new Map(); d.forEach(([, v]) => c.set(v, (c.get(v) || 0) + 1));
      let best = d[0][1], n = 0; c.forEach((m, v) => { if (m > n) { n = m; best = v; } });
      return { v: best, note: `가까운 이웃 ${d.length}개 중 ${n}개` };
    },
  };
}
function treeModel(X, y, depth, cls, nC) {
  const leaf = (idx) => {
    if (!cls) return { v: mean(idx.map((i) => y[i])) };
    const c = Array(nC).fill(0); idx.forEach((i) => c[y[i]]++); const v = c.indexOf(Math.max(...c));
    return { v, note: `같은 칸 훈련 데이터 ${idx.length}개 중 ${c[v]}개` };
  };
  const imp = (idx) => {
    if (!idx.length) return 0;
    if (cls) { const c = Array(nC).fill(0); idx.forEach((i) => c[y[i]]++); return idx.length * (1 - c.reduce((s, v) => s + (v / idx.length) ** 2, 0)); }
    const m = mean(idx.map((i) => y[i])); return idx.reduce((s, i) => s + (y[i] - m) ** 2, 0);
  };
  const grow = (idx, d) => {
    const here = imp(idx);
    if (d >= depth || idx.length < 4 || here < 1e-9) return { leaf: leaf(idx) };
    let best = null;
    for (let f = 0; f < (X[0]?.length || 0); f++) {
      const vals = [...new Set(idx.map((i) => X[i][f]))].sort((a, b) => a - b);
      if (vals.length < 2) continue;
      let th = vals.slice(1).map((v, i) => (v + vals[i]) / 2);
      if (th.length > 24) th = Array.from({ length: 24 }, (_, i) => th[Math.floor(i * th.length / 24)]);
      for (const t of th) {
        const L = [], R = []; idx.forEach((i) => (X[i][f] <= t ? L : R).push(i));
        if (!L.length || !R.length) continue;
        const s = imp(L) + imp(R);
        if (!best || s < best.s) best = { s, f, t, L, R };
      }
    }
    if (!best || best.s >= here - 1e-9) return { leaf: leaf(idx) };
    return { f: best.f, t: best.t, l: grow(best.L, d + 1), r: grow(best.R, d + 1) };
  };
  const root = grow(X.map((_, i) => i), 0);
  return { predict(x) { let n = root; while (!n.leaf) n = x[n.f] <= n.t ? n.l : n.r; return n.leaf; } };
}
function logitModel(X, y, nC, epochs) {
  const d = X[0].length, mu = Array.from({ length: d }, (_, j) => mean(X.map((r) => r[j]))), sd = mu.map((m, j) => Math.sqrt(mean(X.map((r) => (r[j] - m) ** 2))) || 1);
  const Z = X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j]));
  const W = Array.from({ length: nC }, () => Array(d + 1).fill(0));
  const prob = (z) => { const s = W.map((w) => w[0] + z.reduce((a, v, j) => a + v * w[j + 1], 0)), m = Math.max(...s), e = s.map((v) => Math.exp(v - m)), t = e.reduce((a, b) => a + b, 0); return e.map((v) => v / t); };
  for (let ep = 0; ep < epochs; ep++) {
    const G = W.map(() => Array(d + 1).fill(0));
    Z.forEach((z, i) => { const p = prob(z); p.forEach((pk, k) => { const g = pk - (y[i] === k ? 1 : 0); G[k][0] += g; z.forEach((v, j) => { G[k][j + 1] += g * v; }); }); });
    W.forEach((w, k) => w.forEach((_, j) => { w[j] -= 0.5 * (G[k][j] / Z.length + (j ? 0.001 * w[j] : 0)); }));
  }
  return { predict(x) { const p = prob(x.map((v, j) => (v - mu[j]) / sd[j])), v = p.indexOf(Math.max(...p)); return { v, note: `확률 ${Math.round(p[v] * 100)}%` }; } };
}
