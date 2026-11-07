/* 여러 활동을 따로따로 실행 (하나가 실패해도 나머지는 동작) */
function runAll(...fns) { fns.forEach((fn) => { try { fn(); } catch (e) { console.error(fn.name, e); } }); }

/* 숫자 도우미 */
const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const median = (a) => { const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const mode = (a) => { const c = new Map(); a.forEach((v) => c.set(v, (c.get(v) || 0) + 1)); let best = null, n = -1; c.forEach((k, v) => { if (k > n) { n = k; best = v; } }); return best; };
const variance = (a) => { const m = mean(a); return mean(a.map((v) => (v - m) ** 2)); };
const corr = (x, y) => { const mx = mean(x), my = mean(y); let sxy = 0, sx = 0, sy = 0; x.forEach((v, i) => { sxy += (v - mx) * (y[i] - my); sx += (v - mx) ** 2; sy += (y[i] - my) ** 2; }); return sx && sy ? sxy / Math.sqrt(sx * sy) : 0; };
const fmt = (v, d = 1) => (Number.isFinite(v) ? (+v.toFixed(d)).toString() : '-');
/* 시드가 있는 난수 (같은 예시 데이터가 늘 똑같이 나오도록) */
function seeded(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function gauss(r = Math.random) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

/* 연립방정식 풀기 (가우스 소거) - 최소제곱 회귀에 사용 */
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) continue;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => (Math.abs(r[i]) < 1e-12 ? 0 : r[n] / r[i]));
}
/* 최소제곱: X(행마다 특성 배열), y → [절편, 계수...] */
function leastSquares(X, y, ridge = 1e-6) {
  const rows = X.map((r) => [1, ...r]), d = rows[0].length;
  const A = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0) + (i === j && i ? ridge : 0)));
  const b = Array.from({ length: d }, (_, i) => rows.reduce((s, r, k) => s + r[i] * y[k], 0));
  return solve(A, b);
}

/* 막대 그래프 HTML (값 배열 → 가로 막대) */
function barsHTML(items, { max, unit = '', color } = {}) {
  const m = max ?? Math.max(1e-9, ...items.map((it) => it.v));
  return `<div class="bars">${items.map((it) => `<div class="bar-row"><span class="bn">${it.n}</span><div class="bar-track"><div class="bar-fill" style="width:${clamp(it.v / m * 100, 0, 100)}%;${it.c || color ? `background:${it.c || color}` : ''}"></div></div><span class="bv">${it.label ?? fmt(it.v) + unit}</span></div>`).join('')}</div>`;
}

/* 펼쳐 보는 카드 묶음: [{k, icon, t, sub, html}] → 버튼 격자 + 설명 칸 */
function makeFeatureCards(root, items, { onShow, first } = {}) {
  root.innerHTML = `<div class="feat-grid">${items.map((it) => `<button class="feat" data-k="${it.k}"><span class="feat-ic">${it.icon}</span><b>${it.t}</b>${it.sub ? `<small>${it.sub}</small>` : ''}</button>`).join('')}</div><div class="feat-panel" hidden></div>`;
  const panel = $('.feat-panel', root);
  const show = (k) => {
    const it = items.find((x) => x.k === k);
    $$('.feat', root).forEach((b) => b.classList.toggle('on', b.dataset.k === k));
    panel.hidden = false;
    panel.innerHTML = `<h3>${it.icon} ${it.t}</h3>${it.html}`;
    onShow && onShow(k, panel);
  };
  $$('.feat', root).forEach((b) => b.addEventListener('click', () => show(b.dataset.k)));
  if (first) show(first);
  return show;
}

/* 캔버스 축 그리기 도우미: 데이터 좌표 ↔ 픽셀 */
function plotFrame(cv, { x0, x1, y0, y1, pad = [46, 16, 16, 40], xl = '', yl = '', xt = 5, yt = 5, fx = (v) => fmt(v, 0), fy = (v) => fmt(v, 0) }) {
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, [L, R, T, B] = pad;
  const px = (x) => L + (x - x0) / (x1 - x0) * (W - L - R), py = (y) => H - B - (y - y0) / (y1 - y0) * (H - T - B);
  const ix = (p) => x0 + (p - L) / (W - L - R) * (x1 - x0), iy = (p) => y0 + (H - B - p) / (H - T - B) * (y1 - y0);
  const axes = () => {
    ctx.save();
    ctx.strokeStyle = cssVar('--line'); ctx.fillStyle = cssVar('--muted'); ctx.lineWidth = 1; ctx.font = '12px "JetBrains Mono", monospace';
    for (let i = 0; i <= xt; i++) { const v = x0 + (x1 - x0) * i / xt, X = px(v); ctx.beginPath(); ctx.moveTo(X, T); ctx.lineTo(X, H - B); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(fx(v), X, H - B + 16); }
    for (let i = 0; i <= yt; i++) { const v = y0 + (y1 - y0) * i / yt, Y = py(v); ctx.beginPath(); ctx.moveTo(L, Y); ctx.lineTo(W - R, Y); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fy(v), L - 6, Y + 4); }
    ctx.font = '13px "Noto Sans KR"'; ctx.textAlign = 'right'; ctx.fillText(xl, W - R, H - 6);
    ctx.textAlign = 'left'; ctx.fillText(yl, 4, T - 2 > 10 ? T - 2 : 12);
    ctx.restore();
  };
  return { ctx, W, H, px, py, ix, iy, axes, inside: (p) => p.x >= L && p.x <= W - R && p.y >= T && p.y <= H - B };
}
/* 버튼 묶음(.seg, .tabs) 하나만 켜기: cb(button) */
function segBind(sel, cb) {
  const bs = $$(sel + ' button');
  bs.forEach((b) => b.addEventListener('click', () => { bs.forEach((x) => x.classList.toggle('on', x === b)); cb(b); }));
  return bs;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
