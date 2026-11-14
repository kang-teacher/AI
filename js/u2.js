/* 2단원: 탐색 */
function initSearch() {
  runAll(initRiver1, initTreeSearch, initMaze, initPuzzle8);
}

/* 작은 우선순위 큐 (이진 힙) */
class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(v, p) { const a = this.a; a.push([p, v]); let i = a.length - 1; while (i) { const j = (i - 1) >> 1; if (a[j][0] <= a[i][0]) break; [a[i], a[j]] = [a[j], a[i]]; i = j; } }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } }
    return top[1];
  }
}

/* ---------- 강 건너기 엔진 ---------- */
const FARMER = '👨‍🌾';
const RIVER_ITEMS = { wolf: ['🐺', '늑대'], goat: ['🐐', '염소'], cab: ['🥬', '양배추'], dog: ['🐶', '강아지'], cat: ['🐱', '고양이'], mouse: ['🐭', '쥐'], cheese: ['🧀', '치즈'], hen: ['🐔', '닭'], corn: ['🌽', '옥수수'], fish: ['🐟', '생선'] };
const RIVER_BASIC = { items: ['wolf', 'goat', 'cab'], rules: [['wolf', 'goat'], ['goat', 'cab']], cap: 1 };
function riverModel(P) {
  const n = P.items.length, F = 1 << n, GOAL = (1 << (n + 1)) - 1;
  const R = P.rules.map(([a, b]) => [P.items.indexOf(a), P.items.indexOf(b)]).filter(([a, b]) => a >= 0 && b >= 0);
  const side = (s, i) => (s >> i) & 1, fside = (s) => (s & F ? 1 : 0);
  const broken = (s) => R.find(([a, b]) => side(s, a) === side(s, b) && side(s, a) !== fside(s));
  const moves = (s) => {
    const f = fside(s), here = P.items.map((_, i) => i).filter((i) => side(s, i) === f), out = [];
    const rec = (k, pick) => { if (k === here.length) { if (pick.length <= P.cap) out.push(pick); return; } rec(k + 1, pick); if (pick.length < P.cap) rec(k + 1, [...pick, here[k]]); };
    rec(0, []);
    return out.map((pick) => ({ pick, to: pick.reduce((t, i) => t ^ (1 << i), s ^ F) }));
  };
  const next = (s) => moves(s).filter((m) => !broken(m.to));
  const bfs = (from = 0) => {
    const prev = new Map([[from, null]]), q = [from];
    while (q.length) { const s = q.shift(); if (s === GOAL) break; for (const m of next(s)) if (!prev.has(m.to)) { prev.set(m.to, { s, pick: m.pick }); q.push(m.to); } }
    if (!prev.has(GOAL)) return { ok: false, seen: prev.size };
    const path = []; for (let s = GOAL; prev.get(s); s = prev.get(s).s) path.unshift({ from: prev.get(s).s, to: s, pick: prev.get(s).pick });
    return { ok: true, path, seen: prev.size };
  };
  const label = (s, bank) => [fside(s) === bank ? FARMER : '', ...P.items.filter((_, i) => side(s, i) === bank).map((k) => RIVER_ITEMS[k][0])].join('') || '∅';
  const ruleText = ([a, b]) => `${RIVER_ITEMS[P.items[a]][0]}가 ${RIVER_ITEMS[P.items[b]][0]}를 먹어요`;
  return { P, n, F, GOAL, side, fside, broken, next, bfs, label, ruleText };
}
function makeRiver(root, P, { onState } = {}) {
  const M = riverModel(P);
  root.innerHTML = `<div class="river"><div class="bank" data-b="0"></div><div class="water"><div class="boat l"></div></div><div class="bank" data-b="1"></div></div>
    <div class="btn-row"><button class="btn btn-primary" data-act="go">🛶 건너기</button><button class="btn btn-ghost" data-act="undo">↩️ 한 번 되돌리기</button><button class="btn btn-ghost" data-act="reset">처음부터</button><button class="btn btn-ghost" data-act="hint">💡 힌트</button></div>
    <p class="river-msg"></p><div class="state-log"></div>`;
  let s = 0, boat = [], hist = [0], dead = false;
  const msg = $('.river-msg', root), log = $('.state-log', root);
  const say = (t, c = '') => { msg.innerHTML = t; msg.className = 'river-msg ' + c; };
  const tok = (k, i, where) => `<button class="token" data-i="${i}" data-w="${where}">${RIVER_ITEMS[k][0]}<small>${RIVER_ITEMS[k][1]}</small></button>`;
  const render = () => {
    const f = M.fside(s);
    $$('.bank', root).forEach((b) => { const bank = +b.dataset.b; b.innerHTML = P.items.map((k, i) => (M.side(s, i) === bank && !boat.includes(i) ? tok(k, i, 'bank') : '')).join(''); });
    const bt = $('.boat', root); bt.className = 'boat ' + (f ? 'r' : 'l');
    bt.innerHTML = `<span class="token" style="cursor:default">${FARMER}<small>농부</small></span>` + boat.map((i) => tok(P.items[i], i, 'boat')).join('');
    $$('.token[data-i]', root).forEach((t) => {
      const i = +t.dataset.i;
      if (t.dataset.w === 'bank' && M.side(s, i) !== f) t.disabled = true;
      t.addEventListener('click', () => {
        if (dead) return;
        if (t.dataset.w === 'boat') boat = boat.filter((x) => x !== i);
        else if (boat.length >= P.cap) { say(`배에는 농부 말고 ${P.cap}개까지만 탈 수 있어요.`, 'bad'); return; }
        else boat.push(i);
        say(''); render();
      });
    });
    log.innerHTML = '<b>지나온 상태</b> ' + hist.map((h, k) => `<span class="${k === hist.length - 1 && dead ? 'bad' : ''}">${M.label(h, 0)} | ${M.label(h, 1)}</span>`).join('<span class="ar">→</span>');
    $('[data-act="go"]', root).disabled = dead;
    onState && onState(s, hist, dead);
  };
  const set = (t, viaMap) => {
    s = t; boat = []; hist.push(s); const b = M.broken(s);
    dead = !!b;
    if (b) say(`😱 ${M.ruleText(b)}! 되돌리거나 처음부터 다시 해요.`, 'bad');
    else if (s === M.GOAL) { say(`🎉 성공! ${hist.length - 1}번 만에 모두 건넜어요.${hist.length - 1 === M.bfs().path.length ? ' 가장 짧은 방법이에요!' : ` (가장 짧은 방법은 ${M.bfs().path.length}번)`}`, 'good'); confetti(80); }
    else say(viaMap ? '지도에서 이동했어요.' : '');
    render();
  };
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
    if (a === 'go') { let t = s ^ M.F; boat.forEach((i) => { t ^= 1 << i; }); set(t); }
    if (a === 'undo' && hist.length > 1) { hist.pop(); s = hist[hist.length - 1]; boat = []; dead = !!M.broken(s); say(''); render(); }
    if (a === 'reset') { s = 0; boat = []; hist = [0]; dead = false; say(''); render(); }
    if (a === 'hint') {
      if (dead) { say('먼저 되돌리기를 눌러요.', 'bad'); return; }
      const r = M.bfs(s);
      if (!r.ok) say('🤔 여기서는 목표에 갈 수 없어요. 이 문제는 풀 수 없는 문제예요.', 'bad');
      else if (!r.path.length) say('이미 목표 상태예요!', 'good');
      else { const p = r.path[0].pick; say(`💡 농부가 ${p.length ? p.map((i) => RIVER_ITEMS[P.items[i]][0]).join('') + '와(과) 함께' : '혼자'} 건너 보세요. (남은 최소 횟수 ${r.path.length}번)`); }
    }
  });
  render();
  return { M, get state() { return s; }, set: (t) => set(t, true) };
}

function initRiver1() {
  const svg = $('#space1');
  let game;
  const M = riverModel(RIVER_BASIC), all = Array.from({ length: 1 << (M.n + 1) }, (_, i) => i), safe = all.filter((s) => !M.broken(s));
  const depth = new Map([[0, 0]]), q = [0];
  while (q.length) { const s = q.shift(); M.next(s).forEach((m) => { if (!depth.has(m.to)) { depth.set(m.to, depth.get(s) + 1); q.push(m.to); } }); }
  const layers = []; safe.forEach((s) => { const d = depth.get(s) ?? 0; (layers[d] = layers[d] || []).push(s); });
  const pos = new Map(); layers.forEach((L, d) => L.forEach((s, k) => pos.set(s, [60 + d * (780 / (layers.length - 1)), 180 + (k - (L.length - 1) / 2) * 120])));
  const draw = (cur, hist) => {
    const seen = new Set(hist);
    let h = '';
    safe.forEach((s) => M.next(s).forEach((m) => { if (m.to > s) { const [x1, y1] = pos.get(s), [x2, y2] = pos.get(m.to); h += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line)" stroke-width="3"/>`; } }));
    safe.forEach((s) => {
      const [x, y] = pos.get(s), isCur = s === cur;
      const fill = s === 0 ? 'var(--blue-soft)' : s === M.GOAL ? 'var(--green-soft)' : seen.has(s) ? 'var(--yellow-soft)' : 'var(--surface)';
      h += `<g class="sn" data-s="${s}" style="cursor:pointer"><rect x="${x - 52}" y="${y - 30}" width="104" height="60" rx="14" fill="${fill}" stroke="${isCur ? 'var(--orange)' : 'var(--line)'}" stroke-width="${isCur ? 5 : 2}"/>
        <text x="${x}" y="${y - 6}" text-anchor="middle" font-size="15">${M.label(s, 0)}</text><text x="${x}" y="${y + 16}" text-anchor="middle" font-size="11" fill="var(--muted)">건너편 ${M.label(s, 1)}</text></g>`;
    });
    h += `<text x="60" y="${pos.get(0)[1] - 42}" text-anchor="middle" font-size="13" fill="var(--blue)" font-weight="700">초기 상태</text><text x="${pos.get(M.GOAL)[0]}" y="${pos.get(M.GOAL)[1] - 42}" text-anchor="middle" font-size="13" fill="var(--green)" font-weight="700">목표 상태</text>`;
    svg.innerHTML = h;
    $$('.sn', svg).forEach((g) => g.addEventListener('click', () => {
      const t = +g.dataset.s;
      if (M.next(game.state).some((m) => m.to === t)) game.set(t); else toast('지금 상태와 선으로 이어진 상태만 갈 수 있어요');
    }));
  };
  game = makeRiver($('#rv1'), RIVER_BASIC, { onState: (s, hist) => draw(s, hist) });
  $('#rvCount').addEventListener('click', () => {
    let simple = 0, shortest = 0; const sl = M.bfs().path.length;
    const dfs = (s, seen, d) => { if (s === M.GOAL) { simple++; if (d === sl) shortest++; return; } M.next(s).forEach((m) => { if (!seen.has(m.to)) { seen.add(m.to); dfs(m.to, seen, d + 1); seen.delete(m.to); } }); };
    dfs(0, new Set([0]), 0);
    $('#rvCountOut').innerHTML = `<div class="stats"><div><span>모든 상태</span><b>${all.length}가지</b></div><div><span>안전한 상태</span><b>${safe.length}가지</b></div><div><span>가장 짧은 방법</span><b>${sl}번</b></div><div><span>가장 짧은 풀이 수</span><b>${shortest}가지</b></div><div><span>같은 상태를 다시 안 가는 풀이</span><b>${simple}가지</b></div></div>
      <p class="hint">4명(농부·늑대·염소·양배추)이 각각 왼쪽 또는 오른쪽에 있을 수 있으니 2×2×2×2 = ${all.length}가지 상태가 있어요. 그중 누가 누구를 먹는 ${all.length - safe.length}가지를 빼면 ${safe.length}가지만 남아요. 이 안에서 초기 상태부터 목표 상태까지 가는 길을 찾는 것이 바로 <b>탐색</b>이에요.</p>`;
  });
}

/* ---------- 2-2 깊이 우선 vs 너비 우선 ---------- */
function initTreeSearch() {
  const L = 'ABCDEFGHIJKLMNO'.split(''), kids = (i) => (2 * i + 1 < 15 ? [2 * i + 1, 2 * i + 2] : []);
  const pos = L.map((_, i) => { const d = Math.floor(Math.log2(i + 1)), k = i + 1 - 2 ** d; return [800 * (k + 0.5) / 2 ** d, 40 + d * 75]; });
  let algo = 'dfs', goal = 12, ds, visited, found, timer = null;
  $('#tsGoal').innerHTML = L.map((l, i) => `<button class="chip${i === goal ? ' on' : ''}" data-i="${i}">${l}</button>`).join('');
  const reset = () => { clearInterval(timer); timer = null; ds = [0]; visited = []; found = false; render(); $('#tsMsg').textContent = `${algo === 'dfs' ? '깊이 우선' : '너비 우선'} 탐색으로 ${L[goal]}을(를) 찾아요. "한 걸음"을 눌러 보세요.`; };
  const render = () => {
    let h = '';
    L.forEach((_, i) => kids(i).forEach((c) => { h += `<line x1="${pos[i][0]}" y1="${pos[i][1]}" x2="${pos[c][0]}" y2="${pos[c][1]}" stroke="var(--line)" stroke-width="2"/>`; }));
    L.forEach((l, i) => {
      const vi = visited.indexOf(i), inDs = ds.includes(i), cur = visited[visited.length - 1] === i;
      const fill = i === goal ? (found ? 'var(--green)' : 'var(--red)') : vi >= 0 ? 'var(--yellow)' : inDs ? 'var(--blue-soft)' : 'var(--surface)';
      h += `<circle cx="${pos[i][0]}" cy="${pos[i][1]}" r="20" fill="${fill}" stroke="${cur ? 'var(--orange)' : 'var(--line)'}" stroke-width="${cur ? 5 : 2}"/><text x="${pos[i][0]}" y="${pos[i][1] + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="${i === goal ? '#fff' : 'var(--ink)'}">${l}</text>`;
      if (vi >= 0) h += `<text x="${pos[i][0] + 22}" y="${pos[i][1] - 14}" font-size="12" font-weight="700" fill="var(--orange)">${vi + 1}</text>`;
    });
    $('#treeSvg').innerHTML = h;
    $('#dsName').textContent = algo === 'dfs' ? '📚 스택 (위쪽부터 꺼내요 →)' : '🚶 큐 (앞쪽부터 꺼내요 →)';
    const order = algo === 'dfs' ? ds.slice().reverse() : ds;
    $('#dsBox').innerHTML = order.length ? order.map((i, k) => `<span class="chip${k === 0 ? ' on' : ''}">${L[i]}</span>`).join('') : '<span class="muted">비었어요</span>';
    $('#visitOrder').innerHTML = visited.map((i) => `<span class="chip">${L[i]}</span>`).join('<span class="ar">→</span>') || '<span class="muted">아직 없어요</span>';
  };
  const step = () => {
    if (found || !ds.length) return false;
    const i = algo === 'dfs' ? ds.pop() : ds.shift();
    visited.push(i);
    if (i === goal) { found = true; render(); $('#tsMsg').innerHTML = `🎉 ${L[goal]}을(를) 찾았어요! 방문한 노드 <b>${visited.length}개</b>. 다른 탐색 방법이나 목표로도 해 보세요.`; return false; }
    const c = kids(i); if (algo === 'dfs') ds.push(...c.slice().reverse()); else ds.push(...c);
    render(); $('#tsMsg').innerHTML = `${L[i]}을(를) 방문했어요. ${c.length ? `자식 ${c.map((x) => L[x]).join(', ')}을(를) ${algo === 'dfs' ? '스택에 쌓았어요' : '큐 뒤에 줄 세웠어요'}.` : '더 내려갈 곳이 없어요.'}`;
    return true;
  };
  $('#tsStep').addEventListener('click', step);
  $('#tsAuto').addEventListener('click', () => { if (timer) return; timer = setInterval(() => { if (!step()) { clearInterval(timer); timer = null; } }, 450); });
  $('#tsReset').addEventListener('click', reset);
  segBind('#tsAlgo', (b) => { algo = b.dataset.a; reset(); });
  $$('#tsGoal button').forEach((b) => b.addEventListener('click', () => { goal = +b.dataset.i; $$('#tsGoal button').forEach((x) => x.classList.toggle('on', x === b)); reset(); }));
  reset();
}

/* ---------- 2-3 미로 탐색 경주 ---------- */
const MZ = { W: 15, H: 9, S: [0, 4], G: [14, 4] };
function mazeSearch(walls, kind) {
  const { W, H, S, G } = MZ, key = (x, y) => y * W + x, h = (x, y) => Math.abs(x - G[0]) + Math.abs(y - G[1]);
  const prev = new Map([[key(...S), -1]]), g = new Map([[key(...S), 0]]), order = [], closed = new Set();
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  let open; const pushO = (x, y, p) => { if (kind === 'dfs') open.push([x, y]); else if (kind === 'bfs') open.push([x, y]); else open.push([x, y], p); };
  open = kind === 'dfs' || kind === 'bfs' ? [] : new Heap();
  pushO(...S, kind === 'greedy' ? h(...S) : h(...S));
  let t = 0;
  while (kind === 'dfs' || kind === 'bfs' ? open.length : open.size) {
    const [x, y] = kind === 'dfs' ? open.pop() : kind === 'bfs' ? open.shift() : open.pop();
    const k = key(x, y);
    if (closed.has(k)) continue; closed.add(k); order.push(k);
    if (x === G[0] && y === G[1]) break;
    for (const [dx, dy] of kind === 'dfs' ? DIRS.slice().reverse() : DIRS) {
      const nx = x + dx, ny = y + dy, nk = key(nx, ny);
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.has(nk) || closed.has(nk)) continue;
      const ng = g.get(k) + 1;
      if (kind === 'astar') { if (g.has(nk) && g.get(nk) <= ng) continue; g.set(nk, ng); prev.set(nk, k); pushO(nx, ny, (ng + h(nx, ny)) * 1000 + h(nx, ny) * 10 + (t++ % 10) / 100); }
      else if (kind === 'greedy') { if (prev.has(nk)) continue; prev.set(nk, k); pushO(nx, ny, h(nx, ny) * 1000 + t++ / 1000); }
      else if (kind === 'bfs') { if (prev.has(nk)) continue; prev.set(nk, k); g.set(nk, ng); pushO(nx, ny); }
      else { prev.set(nk, k); pushO(nx, ny); }
    }
  }
  const gk = key(...G); if (!closed.has(gk)) return { order, path: null };
  const path = []; for (let k = gk; k !== -1; k = prev.get(k)) path.unshift(k);
  return { order, path };
}
function initMaze() {
  const { W, H, S, G } = MZ, ed = $('#mazeEd'), ectx = ed.getContext('2d'), cs = ed.width / W;
  let walls = new Set(), paint = null, anim = null;
  const key = (x, y) => y * W + x;
  const ALG = [['dfs', '⬇️ 깊이 우선', '맹목적'], ['bfs', '↔️ 너비 우선', '맹목적'], ['greedy', '🏃 최상 우선', '정보 이용'], ['astar', '⭐ A*', '정보 이용']];
  $('#raceGrid').innerHTML = ALG.map(([k, n, t]) => `<div><h4>${n} <span class="tag">${t}</span></h4><canvas width="300" height="180" data-a="${k}"></canvas><div class="meta" data-m="${k}">-</div></div>`).join('');
  const drawGrid = (ctx, size, visited = [], path = null, upto = Infinity) => {
    const c = size; ctx.clearRect(0, 0, W * c, H * c);
    ctx.fillStyle = cssVar('--surface'); ctx.fillRect(0, 0, W * c, H * c);
    const vs = visited.slice(0, upto);
    vs.forEach((k, i) => { ctx.fillStyle = cssVar('--blue-soft'); ctx.globalAlpha = 0.5 + 0.5 * (i / Math.max(1, vs.length)); ctx.fillRect((k % W) * c, Math.floor(k / W) * c, c, c); });
    ctx.globalAlpha = 1;
    if (path) { ctx.fillStyle = cssVar('--yellow'); path.forEach((k) => ctx.fillRect((k % W) * c + c * 0.2, Math.floor(k / W) * c + c * 0.2, c * 0.6, c * 0.6)); }
    walls.forEach((k) => { ctx.fillStyle = cssVar('--ink-2'); ctx.fillRect((k % W) * c, Math.floor(k / W) * c, c, c); });
    ctx.fillStyle = '#22a06b'; ctx.fillRect(S[0] * c + 2, S[1] * c + 2, c - 4, c - 4);
    ctx.fillStyle = '#e2483a'; ctx.fillRect(G[0] * c + 2, G[1] * c + 2, c - 4, c - 4);
    ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 1;
    for (let x = 0; x <= W; x++) { ctx.beginPath(); ctx.moveTo(x * c, 0); ctx.lineTo(x * c, H * c); ctx.stroke(); }
    for (let y = 0; y <= H; y++) { ctx.beginPath(); ctx.moveTo(0, y * c); ctx.lineTo(W * c, y * c); ctx.stroke(); }
  };
  const drawEd = () => drawGrid(ectx, cs);
  const clearRace = () => { cancelAnimationFrame(anim); $$('#raceGrid canvas').forEach((c) => drawGrid(c.getContext('2d'), c.width / W)); $$('#raceGrid .meta').forEach((m) => { m.textContent = '-'; }); $('#raceMsg').textContent = ''; };
  const hasPath = () => !!mazeSearch(walls, 'bfs').path;
  const random = () => { const r = Math.random; do { walls = new Set(); for (let i = 0; i < W * H; i++) if (r() < 0.3) walls.add(i); walls.delete(key(...S)); walls.delete(key(...G)); } while (!hasPath()); drawEd(); clearRace(); };
  const trap = () => { walls = new Set(); for (let y = 1; y <= 7; y++) walls.add(key(11, y)); for (let x = 7; x <= 11; x++) { walls.add(key(x, 1)); walls.add(key(x, 7)); } drawEd(); clearRace(); };
  const cell = (p) => [Math.floor(p.x / cs), Math.floor(p.y / cs)];
  const toggle = (p) => { const [x, y] = cell(p); if (x < 0 || y < 0 || x >= W || y >= H) return; const k = key(x, y); if (k === key(...S) || k === key(...G)) return; if (paint === null) paint = !walls.has(k); paint ? walls.add(k) : walls.delete(k); drawEd(); };
  onDrag(ed, { down: (p) => { paint = null; toggle(p); clearRace(); }, move: toggle, up: () => { paint = null; } });
  $('#mazeRand').addEventListener('click', random);
  $('#mazeClear').addEventListener('click', () => { walls = new Set(); drawEd(); clearRace(); });
  $('#mazeTrap').addEventListener('click', trap);
  $('#raceGo').addEventListener('click', () => {
    cancelAnimationFrame(anim);
    const R = Object.fromEntries(ALG.map(([k]) => [k, mazeSearch(walls, k)]));
    if (!R.bfs.path) { $('#raceMsg').textContent = '🧱 출발에서 도착까지 길이 없어요! 벽을 조금 없애 주세요.'; return; }
    let k = 0; const maxN = Math.max(...Object.values(R).map((r) => r.order.length));
    const frame = () => {
      k += 1;
      ALG.forEach(([a]) => {
        const c = $(`#raceGrid canvas[data-a="${a}"]`), r = R[a], done = k >= r.order.length;
        drawGrid(c.getContext('2d'), c.width / W, r.order, done ? r.path : null, k);
        $(`#raceGrid [data-m="${a}"]`).innerHTML = done ? `방문한 칸 <b>${r.order.length}</b> · 찾은 길 <b>${r.path.length - 1}</b>칸${r.path.length === R.bfs.path.length ? ' ✅ 최단' : ' 🔄 돌아감'}` : `탐색 중… ${k}칸`;
      });
      if (k < maxN) anim = requestAnimationFrame(frame);
      else {
        const best = ALG.map(([a, n]) => [n, R[a].order.length]).sort((x, y) => x[1] - y[1])[0];
        $('#raceMsg').innerHTML = `🏆 가장 적은 칸을 살펴본 탐색: <b>${best[0]}</b> (${best[1]}칸). 너비 우선과 A*는 항상 최단 길을 찾지만, A*는 휴리스틱 덕분에 더 적게 살펴봐요. 최상 우선은 빠르지만 돌아가는 길을 찾을 때가 있어요.`;
      }
    };
    frame();
  });
  document.addEventListener('themechange', () => { drawEd(); clearRace(); });
  random();
}

/* ---------- 2-4 8-퍼즐 ---------- */
const P8_GOAL = '123456780';
const p8Next = (s) => { const z = s.indexOf('0'), x = z % 3, y = (z / 3) | 0, out = []; [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < 3 && ny < 3) { const j = ny * 3 + nx, a = s.split(''); [a[z], a[j]] = [a[j], a[z]]; out.push(a.join('')); } }); return out; };
const p8Solvable = (s) => { const a = s.replace('0', '').split('').map(Number); let inv = 0; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (a[i] > a[j]) inv++; return inv % 2 === 0; };
const p8H1 = (s) => [...s].filter((c, i) => c !== '0' && c !== P8_GOAL[i]).length;
const p8H2 = (s) => [...s].reduce((t, c, i) => (c === '0' ? t : t + Math.abs((i % 3) - ((+c - 1) % 3)) + Math.abs(((i / 3) | 0) - (((+c - 1) / 3) | 0))), 0);
function p8Solve(start, kind, limit = 200000) {
  const t0 = performance.now(), prev = new Map([[start, null]]), g = new Map([[start, 0]]), closed = new Set();
  const h = kind === 'h1' ? p8H1 : kind === 'h2' ? p8H2 : () => 0;
  const q = kind === 'bfs' ? [start] : new Heap(); if (kind !== 'bfs') q.push(start, h(start));
  let head = 0, n = 0;
  while (kind === 'bfs' ? head < q.length : q.size) {
    const s = kind === 'bfs' ? q[head++] : q.pop();
    if (closed.has(s)) continue; closed.add(s); n++;
    if (s === P8_GOAL || n > limit) break;
    for (const t of p8Next(s)) {
      const ng = g.get(s) + 1;
      if (kind === 'bfs') { if (!prev.has(t)) { prev.set(t, s); g.set(t, ng); q.push(t); } }
      else if (!g.has(t) || ng < g.get(t)) { g.set(t, ng); prev.set(t, s); q.push(t, ng + h(t)); }
    }
  }
  if (!closed.has(P8_GOAL)) return { n, path: null, ms: performance.now() - t0 };
  const path = []; for (let s = P8_GOAL; s; s = prev.get(s)) path.unshift(s);
  return { n, path, ms: performance.now() - t0 };
}
function initPuzzle8() {
  let s = P8_GOAL, moves = 0, sol = null, timer = null;
  const board = $('#p8');
  const render = () => {
    board.innerHTML = [...s].map((c, i) => `<button data-i="${i}" class="${c === '0' ? 'empty' : c === P8_GOAL[i] ? 'ok' : ''}">${c === '0' ? '' : c}</button>`).join('');
    $('#p8Moves').textContent = moves;
  };
  const setS = (t, keepSol) => { s = t; if (!keepSol) { sol = null; $('#p8Show').disabled = true; $('#p8Table').innerHTML = ''; } render(); };
  board.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || timer) return;
    const i = +b.dataset.i, z = s.indexOf('0');
    if (Math.abs((i % 3) - (z % 3)) + Math.abs(((i / 3) | 0) - ((z / 3) | 0)) !== 1) return;
    const a = s.split(''); [a[i], a[z]] = [a[z], a[i]]; moves++; setS(a.join(''));
    if (s === P8_GOAL) { toast(`🎉 ${moves}번 만에 맞췄어요!`); confetti(70); }
  });
  $('#p8Mix').addEventListener('input', () => { $('#p8MixV').textContent = $('#p8Mix').value; });
  $('#p8Shuffle').addEventListener('click', () => {
    let t = P8_GOAL, last = null; const n = +$('#p8Mix').value;
    for (let i = 0; i < n; i++) { const c = p8Next(t).filter((x) => x !== last); last = t; t = c[Math.floor(Math.random() * c.length)]; }
    moves = 0; setS(t); $('#p8Msg').textContent = `목표 상태에서 ${n}번 무작위로 밀어서 섞었어요. 그래서 반드시 풀 수 있어요.`;
  });
  $('#p8Goal').addEventListener('click', () => { moves = 0; setS(P8_GOAL); $('#p8Msg').textContent = ''; });
  $('#p8Copy').addEventListener('click', () => { $('#p8Code').value = s; $('#p8Msg').innerHTML = `지금 퍼즐 코드: <b>${s}</b> (왼쪽 위부터 한 줄씩 읽은 숫자, 0은 빈칸)`; });
  $('#p8Load').addEventListener('click', () => {
    const c = $('#p8Code').value.trim();
    if (!/^[0-8]{9}$/.test(c) || new Set(c).size !== 9) { $('#p8Msg').textContent = '0~8을 한 번씩만 써서 9자리로 넣어 주세요.'; return; }
    moves = 0; setS(c);
    $('#p8Msg').innerHTML = p8Solvable(c) ? '✅ 불러왔어요. 이 퍼즐은 풀 수 있어요!' : '❌ 이 퍼즐은 <b>절대 풀 수 없어요</b>. 8-퍼즐의 배치 중 딱 절반은 아무리 밀어도 목표 상태에 닿지 못해요. (숫자의 순서가 뒤집힌 쌍의 개수가 홀수이기 때문이에요)';
  });
  $('#p8Solve').addEventListener('click', () => {
    if (!p8Solvable(s)) { $('#p8Table').innerHTML = '<tr><td>이 퍼즐은 풀 수 없어요. 섞기를 눌러 새 퍼즐을 만들어 주세요.</td></tr>'; return; }
    $('#p8Table').innerHTML = '<tr><td>탐색 중…</td></tr>';
    setTimeout(() => {
      const R = [['↔️ 너비 우선 (맹목적)', p8Solve(s, 'bfs')], ['⭐ A* + h₁ (틀린 칸 수)', p8Solve(s, 'h1')], ['⭐ A* + h₂ (맨해튼 거리)', p8Solve(s, 'h2')]];
      const m = Math.max(...R.map((r) => r[1].n));
      $('#p8Table').innerHTML = `<tr><th>탐색 방법</th><th>살펴본 상태 수</th><th style="min-width:160px"></th><th>풀이 길이</th><th>걸린 시간</th></tr>` + R.map(([n, r]) => `<tr><td>${n}</td><td class="num">${r.n.toLocaleString()}</td><td><div class="bar-track" style="height:14px"><div class="bar-fill" style="width:${r.n / m * 100}%"></div></div></td><td class="num">${r.path ? r.path.length - 1 + '번' : '못 찾음'}</td><td class="num">${fmt(r.ms, 0)}ms</td></tr>`).join('');
      sol = R[2][1].path; $('#p8Show').disabled = !sol;
    }, 30);
  });
  $('#p8Show').addEventListener('click', () => {
    if (!sol || timer) return; let i = 0; const path = sol;
    timer = setInterval(() => { setS(path[i], true); if (++i >= path.length) { clearInterval(timer); timer = null; toast(`${path.length - 1}번 만에 풀었어요!`); } }, 420);
  });
  render();
}
