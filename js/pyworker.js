/* 브라우저 안에서 파이썬(Pyodide)을 돌리는 작업자. 화면이 멈추지 않도록 따로 실행해요. */
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
let py = null;
let ready = null;

function say(type, extra) { self.postMessage(Object.assign({ type }, extra)); }

async function init(base, cdn) {
  say('status', { text: '파이썬을 내려받는 중… (1/3)' });
  importScripts(cdn + 'pyodide.js');
  py = await loadPyodide({ indexURL: cdn });
  say('status', { text: '라이브러리를 내려받는 중… pandas, scikit-learn, matplotlib (2/3)' });
  await py.loadPackage(['micropip', 'pandas', 'scikit-learn', 'matplotlib']);
  say('status', { text: 'seaborn을 설치하는 중… (3/3)' });
  const micropip = py.pyimport('micropip');
  await micropip.install('seaborn');
  const runner = await (await fetch(base + 'py/runner.py')).text();
  py.runPython(runner);
  for (const f of ['penguins', 'iris', 'mpg']) {
    const csv = await (await fetch(base + 'data/' + f + '.csv')).text();
    py.FS.writeFile(f + '.csv', csv);
  }
}

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      if (!ready) ready = init(m.base, m.cdn || PYODIDE);
      await ready;
      say('ready');
    } else if (m.type === 'run') {
      await ready;
      const out = py.globals.get('run_cell')(m.code);
      say('result', { id: m.id, out: JSON.parse(out) });
    } else if (m.type === 'reset') {
      await ready;
      py.runPython("G.clear(); G['__name__'] = '__main__'");
      say('reset');
    }
  } catch (err) {
    ready = null;
    say('fail', { id: m.id, text: String(err && err.message || err) });
  }
};
