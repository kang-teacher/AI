/* ===== 6-2 파이썬 코드 실습: 노트북처럼 코드를 보고 브라우저에서 바로 실행 ===== */
const PY_DS = {
  penguin: { icon: '🐧', name: '펭귄', sub: '종 분류 (+ 몸무게 회귀)' },
  iris: { icon: '🌸', name: '붓꽃', sub: '품종 분류 (+ 꽃잎 길이 회귀)' },
  car: { icon: '🚗', name: '자동차 연비', sub: '연비 회귀 (+ 생산지 분류)' },
};
const PY_REPO = 'https://colab.research.google.com/github/kang-teacher/AI/blob/main/py/';

function pyMd(src) {
  const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const lines = src.split('\n');
  let html = '', i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^#{1,3} /.test(l)) { const n = l.match(/^#+/)[0].length; html += `<h${n + 2}>${inline(l.replace(/^#+ /, ''))}</h${n + 2}>`; i++; continue; }
    if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++; }
      const cells = (r) => r.split('|').slice(1, -1).map((c) => c.trim());
      html += '<div class="dtable-wrap"><table class="dtable"><tr>' + cells(rows[0]).map((c) => `<th>${inline(c)}</th>`).join('') + '</tr>' +
        rows.slice(2).map((r) => '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</table></div>';
      continue;
    }
    if (l.startsWith('- ')) {
      html += '<ul>';
      while (i < lines.length && lines[i].startsWith('- ')) { html += `<li>${inline(lines[i].slice(2))}</li>`; i++; }
      html += '</ul>';
      continue;
    }
    if (l.trim()) html += `<p>${inline(l)}</p>`;
    i++;
  }
  return html;
}

function initPyLab() {
  const root = $('#pyNb');
  if (!root) return;
  const S = { ds: 'penguin', nb: null, cache: {}, worker: null, ready: false, loading: false, ran: new Set(), queue: Promise.resolve(), pending: {}, seq: 0 };
  const status = (t, cls) => { const el = $('#pyStatus'); el.textContent = t; el.className = 'py-status' + (cls ? ' ' + cls : ''); };
  const base = new URL('.', location.href).href;

  $('#pyDs').innerHTML = Object.entries(PY_DS).map(([k, m]) => `<button class="feat" data-k="${k}"><span class="feat-ic">${m.icon}</span><b>${m.name}</b><small>${m.sub}</small></button>`).join('');
  $$('#pyDs .feat').forEach((b) => b.addEventListener('click', () => load(b.dataset.k)));

  function renderOut(el, o, saved) {
    let h = '';
    if (saved) h += '<div class="py-saved">📄 미리 실행해 둔 결과</div>';
    if (o.stdout) h += `<pre class="${o.err ? 'py-err' : ''}">${esc(o.stdout)}</pre>`;
    if (o.html) h += `<div class="dtable-wrap py-df">${o.html}</div>`;
    else if (o.text) h += `<pre>${esc(o.text)}</pre>`;
    (o.imgs || []).forEach((im) => { h += `<img alt="그래프" src="data:image/png;base64,${im}">`; });
    el.innerHTML = h;
    el.hidden = !h;
  }

  function render() {
    const nb = S.nb;
    let n = 0;
    root.innerHTML = nb.cells.map((c, i) => {
      if (c.t === 'md') return `<div class="py-md">${pyMd(c.s)}</div>`;
      if (c.t === 'colab') return `<div class="py-cell py-colab"><div class="py-gut"><span class="py-tag">Colab 전용</span></div><pre class="py-code-ro">${esc(c.s)}</pre></div>`;
      n++;
      return `<div class="py-cell" data-i="${i}"><div class="py-gut"><button class="py-run" title="이 셀 실행">▶</button><span class="py-n">[ ]</span></div>
        <div class="py-main"><textarea class="py-code" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(c.s)}</textarea><div class="py-out" hidden></div></div></div>`;
    }).join('');
    $$('.py-code', root).forEach((ta) => { fit(ta); ta.addEventListener('input', () => fit(ta)); ta.addEventListener('keydown', key); });
    $$('.py-cell[data-i] .py-run', root).forEach((b) => b.addEventListener('click', () => runUpTo(+b.closest('.py-cell').dataset.i)));
  }
  function fit(ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; }
  function key(e) {
    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) { e.preventDefault(); runUpTo(+e.target.closest('.py-cell').dataset.i); }
    if (e.key === 'Tab') { e.preventDefault(); const t = e.target, p = t.selectionStart; t.setRangeText('    ', p, t.selectionEnd, 'end'); }
  }

  async function load(k) {
    S.ds = k;
    $$('#pyDs .feat').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
    $('#pyColab').href = PY_REPO + k + '.ipynb';
    $('#pyDown').href = 'py/' + k + '.ipynb';
    $('#pyDown').setAttribute('download', k + '.ipynb');
    if (!S.cache[k]) {
      root.innerHTML = '<p class="muted">노트북을 불러오는 중…</p>';
      try { S.cache[k] = await (await fetch('py/' + k + '.json')).json(); } catch (e) { root.innerHTML = '<p class="muted">노트북 파일을 불러오지 못했어요. 새로고침해 보세요.</p>'; return; }
    }
    if (S.ds !== k) return;
    S.nb = S.cache[k];
    render();
    if (S.ready) await reset(true);
  }

  function ensureWorker() {
    if (S.ready) return Promise.resolve();
    if (S.loading) return S.loading;
    S.loading = new Promise((res, rej) => {
      try { S.worker = new Worker('js/pyworker.js?v=3'); } catch (e) { rej(e); return; }
      S.worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'status') status(m.text, 'busy');
        else if (m.type === 'ready') { S.ready = true; status('✅ 파이썬 준비 완료! 셀을 실행하거나 코드를 고쳐 보세요. (Shift+Enter로도 실행돼요)', 'ok'); res(); }
        else if (m.type === 'result' || m.type === 'reset') { const f = S.pending[m.id ?? 'reset']; if (f) { delete S.pending[m.id ?? 'reset']; f.res(m.out); } }
        else if (m.type === 'fail') {
          if (!S.ready) { rej(new Error(m.text)); return; }
          const f = S.pending[m.id]; if (f) { delete S.pending[m.id]; f.rej(new Error(m.text)); }
        }
      };
      S.worker.onerror = (e) => rej(new Error(e.message || '작업자 오류'));
      S.worker.postMessage({ type: 'init', base, cdn: window.PY_CDN });
    }).catch((e) => {
      S.loading = false;
      if (S.worker) S.worker.terminate();
      S.worker = null;
      status('⚠️ 파이썬을 불러오지 못했어요(인터넷 연결이나 학교 방화벽 문제일 수 있어요). 미리 실행해 둔 결과를 대신 보여 줄게요. Colab에서 열면 직접 실행할 수 있어요. (' + String(e && e.message || e).slice(0, 120) + ')', 'bad');
      showSaved();
      throw e;
    });
    return S.loading;
  }

  function call(type, code) {
    const id = type === 'reset' ? 'reset' : ++S.seq;
    return new Promise((res, rej) => { S.pending[id] = { res, rej }; S.worker.postMessage({ type, id, code }); });
  }

  async function runOne(i) {
    const cell = $(`.py-cell[data-i="${i}"]`, root);
    if (!cell) return;
    const out = $('.py-out', cell), n = $('.py-n', cell);
    n.textContent = '[*]';
    cell.classList.add('running');
    try {
      const o = await call('run', $('.py-code', cell).value);
      renderOut(out, o);
      if (o.err) { S.ran.delete(i); n.textContent = '[!]'; throw new Error('cell error'); }
      S.ran.add(i);
      n.textContent = `[${S.ran.size}]`;
    } finally { cell.classList.remove('running'); }
  }

  function runUpTo(i, all) {
    S.queue = S.queue.then(async () => {
      try { await ensureWorker(); } catch (e) { return; }
      const idx = S.nb.cells.map((c, j) => (c.t === 'code' ? j : -1)).filter((j) => j >= 0 && (all ? true : j <= i));
      const todo = idx.filter((j) => j === i || all || !S.ran.has(j));
      if (todo.length > 1 && !all) status(`앞의 셀부터 차례로 실행하는 중… (${todo.length}개)`, 'busy');
      for (const j of todo) {
        try { await runOne(j); } catch (e) { status('⚠️ 오류가 난 셀이 있어요. 빨간 글씨를 읽고 코드를 고쳐 보세요.', 'bad'); return; }
      }
      status('✅ 실행 완료! 코드를 고쳐서 다시 실행해 봐요. (Shift+Enter로도 실행돼요)', 'ok');
    });
    return S.queue;
  }

  async function reset(silent) {
    S.ran.clear();
    $$('.py-cell[data-i]', root).forEach((c) => { $('.py-n', c).textContent = '[ ]'; const o = $('.py-out', c); o.hidden = true; o.innerHTML = ''; });
    if (S.ready) { await call('reset'); if (!silent) status('↺ 변수를 모두 지웠어요. 처음 셀부터 다시 실행해 보세요.', 'ok'); }
  }

  function showSaved() {
    S.nb.cells.forEach((c, i) => {
      if (c.t !== 'code') return;
      const cell = $(`.py-cell[data-i="${i}"]`, root);
      if (cell) renderOut($('.py-out', cell), c.out, true);
    });
  }

  $('#pyRunAll').addEventListener('click', () => { reset(true).then(() => runUpTo(-1, true)); });
  $('#pyReset').addEventListener('click', () => { S.queue = S.queue.then(() => reset()); });
  $('#pySaved').addEventListener('click', showSaved);
  load('penguin');
}
