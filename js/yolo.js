/* 5-4 YOLO의 원리, 5-5 YOLO 코드 뜯어보기 (YOLO 객체인식 교실의 활동을 가져와 다듬음) */

/* SVG 장면(scene.js)을 캔버스에 그릴 수 있는 이미지로 바꾸기 (640×400 기준) */
let _sceneImg = null;
function sceneImage() {
  if (_sceneImg) return _sceneImg;
  _sceneImg = new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">${sceneBase()}</svg>`);
  });
  return _sceneImg;
}
const YOBJS = Object.entries(SCENE_BOX).map(([name, [x, y, w, h, , color]]) => ({ name, x, y, w, h, color, ko: { person: '사람', dog: '강아지', car: '자동차' }[name] }));

function initYOLO() {
  sceneImage().then((img) => runAll(() => initYGrid(img), () => initYConf(img), () => initYIoU(img), () => initNmsStep(img), () => initNmsAll(img)));
  runAll(initYCode, initYSound);
}

/* 후보 상자 만들기: 물체마다 확실한 상자 1개 + 겹친 상자 여러 개 + 엉뚱한 곳의 약한 상자 (매번 같은 결과) */
function makeCandidates() {
  const r = seeded(7), rr = (a, b) => a + r() * (b - a), out = [];
  YOBJS.forEach((o) => {
    out.push({ ...o, conf: rr(.88, .96) });
    for (let k = 0; k < 7; k++) {
      const j = .12;
      out.push({ name: o.name, color: o.color, x: o.x + rr(-j, j) * o.w, y: o.y + rr(-j, j) * o.h, w: o.w * rr(.8, 1.2), h: o.h * rr(.8, 1.2), conf: rr(.3, .85) });
    }
  });
  for (let k = 0; k < 14; k++) {
    const o = YOBJS[k % 3], w = rr(50, 160), h = rr(40, 130);
    out.push({ name: o.name, color: o.color, x: rr(0, 640 - w), y: rr(0, 400 - h), w, h, conf: rr(.02, .28) });
  }
  return out;
}
function nms(boxes, th) {
  const out = [];
  boxes.slice().sort((a, b) => b.conf - a.conf).forEach((c) => { if (!out.some((k) => k.name === c.name && iou(k, c) > th)) out.push(c); });
  return out;
}
function drawCands(ctx, img, list, withLabel) {
  const cv = ctx.canvas, sx = cv.width / 640, sy = cv.height / 400;
  ctx.drawImage(img, 0, 0, cv.width, cv.height);
  list.slice().sort((a, b) => a.conf - b.conf).forEach((c) => {
    ctx.globalAlpha = .35 + c.conf * .65;
    drawBox(ctx, c.x * sx, c.y * sy, c.w * sx, c.h * sy, c.color, withLabel ? `${c.name} ${c.conf.toFixed(2)}` : '', 2);
  });
  ctx.globalAlpha = 1;
}

/* --- ① 격자 --- */
function initYGrid(img) {
  const cv = $('#gridCanvas'), ctx = cv.getContext('2d');
  let S = 7, hover = null;
  const draw = () => {
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    const gw = cv.width / S, gh = cv.height / S;
    YOBJS.forEach((o) => {
      const c = Math.floor((o.x + o.w / 2) / gw), r = Math.floor((o.y + o.h / 2) / gh);
      ctx.fillStyle = o.color; ctx.globalAlpha = .35; ctx.fillRect(c * gw, r * gh, gw, gh); ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5;
    for (let k = 1; k < S; k++) { ctx.beginPath(); ctx.moveTo(k * gw, 0); ctx.lineTo(k * gw, cv.height); ctx.moveTo(0, k * gh); ctx.lineTo(cv.width, k * gh); ctx.stroke(); }
    if (hover) {
      const c = Math.floor(hover.x / gw), r = Math.floor(hover.y / gh);
      const owner = YOBJS.find((o) => Math.floor((o.x + o.w / 2) / gw) === c && Math.floor((o.y + o.h / 2) / gh) === r);
      ctx.strokeStyle = '#f5b82e'; ctx.lineWidth = 4; ctx.strokeRect(c * gw, r * gh, gw, gh);
      if (owner) drawBox(ctx, owner.x, owner.y, owner.w, owner.h, owner.color, `${owner.name} 0.9`, 3);
      const inside = YOBJS.filter((o) => o !== owner && (c + 1) * gw > o.x && c * gw < o.x + o.w && (r + 1) * gh > o.y && r * gh < o.y + o.h);
      $('#cellInfo').innerHTML = owner
        ? `<b>칸 (${r + 1}행, ${c + 1}열)</b> → <b style="color:${owner.color}">${owner.ko}</b>의 중심점이 이 칸에 있어요! 이 칸이 ${owner.ko}를 책임져요.<br>예측: <code>x=${((owner.x + owner.w / 2) / 640).toFixed(2)} y=${((owner.y + owner.h / 2) / 400).toFixed(2)} w=${(owner.w / 640).toFixed(2)} h=${(owner.h / 400).toFixed(2)}</code> · 확신도 <code>0.9</code> · 클래스 <code>${owner.name}</code>`
        : inside.length
          ? `<b>칸 (${r + 1}행, ${c + 1}열)</b> → <b>${inside.map((o) => o.ko).join(', ')}</b>의 몸 일부가 걸쳐 있지만 <b>중심점은 없어요</b>. 그래서 이 칸은 그 물체를 책임지지 않아요. 확신도 ≈ <code>0.0</code>`
          : `<b>칸 (${r + 1}행, ${c + 1}열)</b> → 물체의 중심점이 없어요. 확신도 ≈ <code>0.0</code> (아무것도 없음)`;
    }
    YOBJS.forEach((o) => {
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = o.color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
    });
  };
  onDrag(cv, { hover: (p) => { hover = p; draw(); }, down: (p) => { hover = p; draw(); }, move: (p) => { hover = p; draw(); } });
  $('#gridS').addEventListener('input', (e) => { S = +e.target.value; $('#gridSVal').textContent = `${S} × ${S}`; $('#gridCells').textContent = S * S; draw(); });
  draw();
}

/* --- ② 확신도 기준 --- */
function initYConf(img) {
  const ctx = $('#confCanvas').getContext('2d'), cands = makeCandidates();
  $('#confAll').textContent = cands.length;
  const draw = () => {
    const th = +$('#confTh').value, keep = cands.filter((c) => c.conf >= th);
    $('#confThVal').textContent = th.toFixed(2); $('#confCount').textContent = keep.length;
    drawCands(ctx, img, keep, keep.length <= 8);
  };
  $('#confTh').addEventListener('input', draw);
  draw();
}

/* --- ③ IoU 놀이터 (한 칸 = 20px, 넓이를 칸 수로 셈) --- */
function initYIoU(img) {
  const cv = $('#iouCanvas'), ctx = cv.getContext('2d'), U = 20;
  const gt = { x: 200, y: 120, w: 180, h: 160 };
  const pr = { x: 280, y: 180, w: 180, h: 140 };
  const MISSIONS = [
    { t: 'IoU를 0.70 이상으로 만들어 보세요!', ok: (v) => v >= .7 },
    { t: 'IoU를 0.90 이상으로! (거의 완벽하게)', ok: (v) => v >= .9 },
    { t: '두 상자가 전혀 겹치지 않게 (IoU = 0)', ok: (v) => v === 0 },
    { t: 'IoU를 정확히 0.50으로 맞춰 보세요 (겹친 넓이 = 합친 넓이의 절반)', ok: (v) => Math.abs(v - .5) < 1e-9 },
    { t: '주황 상자를 초록 상자 안에 쏙 넣되 IoU는 0.5 미만으로', ok: (v) => v > 0 && v < .5 && pr.x >= gt.x && pr.y >= gt.y && pr.x + pr.w <= gt.x + gt.w && pr.y + pr.h <= gt.y + gt.h },
  ];
  let mi = 0, cleared = false, drag = null;
  const snap = (v) => Math.round(v / U) * U;
  const draw = () => {
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = 'rgba(31,42,36,.12)'; ctx.lineWidth = 1;
    for (let x = U; x < cv.width; x += U) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke(); }
    for (let y = U; y < cv.height; y += U) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke(); }
    const x1 = Math.max(gt.x, pr.x), y1 = Math.max(gt.y, pr.y), x2 = Math.min(gt.x + gt.w, pr.x + pr.w), y2 = Math.min(gt.y + gt.h, pr.y + pr.h);
    ctx.fillStyle = 'rgba(59,111,224,.18)'; ctx.fillRect(gt.x, gt.y, gt.w, gt.h); ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
    if (x2 > x1 && y2 > y1) { ctx.fillStyle = 'rgba(123,85,217,.55)'; ctx.fillRect(x1, y1, x2 - x1, y2 - y1); }
    drawBox(ctx, gt.x, gt.y, gt.w, gt.h, '#22a06b', '정답', 3);
    drawBox(ctx, pr.x, pr.y, pr.w, pr.h, '#f07a1a', '예측', 3);
    [gt, pr].forEach((b, k) => [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].forEach(([x, y]) => {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = k ? '#f07a1a' : '#22a06b'; ctx.lineWidth = 2;
      ctx.fillRect(x - 6, y - 6, 12, 12); ctx.strokeRect(x - 6, y - 6, 12, 12);
    }));
    const A = (gt.w / U) * (gt.h / U), B = (pr.w / U) * (pr.h / U);
    const iw = Math.max(0, x2 - x1) / U, ih = Math.max(0, y2 - y1) / U, I = iw * ih, Un = A + B - I, v = Un ? I / Un : 0;
    $('#iouA').textContent = `${gt.w / U} × ${gt.h / U} = ${A}`;
    $('#iouB').textContent = `${pr.w / U} × ${pr.h / U} = ${B}`;
    $('#iouI').textContent = I ? `${iw} × ${ih} = ${I}` : '0';
    $('#iouU').textContent = `${A} + ${B} − ${I} = ${Un}`;
    $('#iouVal').textContent = `${I} / ${Un} ≈ ${v.toFixed(2)}`;
    $('#iouMeter').style.width = v * 100 + '%';
    const m = $('#iouMsg');
    if (v >= .9) { m.textContent = '🎯 거의 완벽해요!'; m.className = 'result-msg good'; }
    else if (v >= .5) { m.textContent = '✅ IoU ≥ 0.5 → 보통 "제대로 찾았다"고 인정해요'; m.className = 'result-msg good'; }
    else if (v > 0) { m.textContent = '⚠️ IoU < 0.5 → 위치가 많이 빗나갔어요'; m.className = 'result-msg bad'; }
    else { m.textContent = '❌ 전혀 겹치지 않아요'; m.className = 'result-msg bad'; }
    if (!cleared && MISSIONS[mi].ok(v) && !drag) { cleared = true; toast('🎯 미션 성공!'); confetti(50); $('#iouMission').textContent = '✅ ' + MISSIONS[mi].t; }
    return v;
  };
  const hit = (p) => {
    for (const b of [pr, gt]) {
      const cs = [['tl', b.x, b.y], ['tr', b.x + b.w, b.y], ['bl', b.x, b.y + b.h], ['br', b.x + b.w, b.y + b.h]];
      for (const [k, x, y] of cs) if (Math.abs(p.x - x) < 14 && Math.abs(p.y - y) < 14) return { b, k };
    }
    for (const b of [pr, gt]) if (p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) return { b, k: 'move' };
    return null;
  };
  onDrag(cv, {
    down: (p) => { drag = hit(p); if (drag) { drag.sx = p.x; drag.sy = p.y; drag.o = { ...drag.b }; } },
    move: (p) => {
      if (!drag) return;
      const { b, k, o } = drag, dx = snap(p.x - drag.sx), dy = snap(p.y - drag.sy), W = cv.width, H = cv.height;
      if (k === 'move') { b.x = clamp(o.x + dx, 0, W - o.w); b.y = clamp(o.y + dy, 0, H - o.h); }
      else {
        let x1 = o.x, y1 = o.y, x2 = o.x + o.w, y2 = o.y + o.h;
        if (k[1] === 'l') x1 = clamp(o.x + dx, 0, x2 - U); else x2 = clamp(x2 + dx, x1 + U, W);
        if (k[0] === 't') y1 = clamp(o.y + dy, 0, y2 - U); else y2 = clamp(y2 + dy, y1 + U, H);
        Object.assign(b, { x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
      }
      draw();
    },
    up: () => { drag = null; draw(); },
    hover: (p) => { const h = p && hit(p); cv.style.cursor = !h ? 'default' : h.k === 'move' ? 'move' : 'nwse-resize'; },
  });
  $('#iouShuffle').addEventListener('click', () => { mi = (mi + 1) % MISSIONS.length; cleared = false; $('#iouMission').textContent = MISSIONS[mi].t; draw(); });
  draw();
}

/* --- ④ NMS 한 단계씩 --- */
function initNmsStep(img) {
  const cv = $('#nmsStepCanvas'), ctx = cv.getContext('2d'), CONF = 0.25;
  const BOX = [
    { id: 'A', conf: .91, x: 268, y: 228, w: 175, h: 104 },
    { id: 'B', conf: .83, x: 284, y: 238, w: 168, h: 98 },
    { id: 'C', conf: .72, x: 250, y: 216, w: 182, h: 118 },
    { id: 'D', conf: .58, x: 300, y: 242, w: 150, h: 94 },
    { id: 'E', conf: .34, x: 392, y: 236, w: 92, h: 84 },
    { id: 'F', conf: .12, x: 150, y: 250, w: 110, h: 86 },
  ];
  const COL = { A: '#e2483d', B: '#3b6fe0', C: '#7b55d9', D: '#e9468b', E: '#f07a1a', F: '#8a8f98' };
  let steps = [], si = 0;
  const build = () => {
    const th = +$('#nsIou').value, st = {}, ious = {};
    BOX.forEach((b) => { st[b.id] = '대기'; });
    steps = [{ st: { ...st }, ious: {}, msg: `강아지 하나에 후보 상자가 <b>${BOX.length}개</b> 나왔어요. <b>👣 다음 단계</b>를 눌러 NMS를 따라가 보세요.` }];
    const low = BOX.filter((b) => b.conf < CONF);
    low.forEach((b) => { st[b.id] = '삭제 (확신도 부족)'; });
    steps.push({ st: { ...st }, ious: {}, msg: `<b>1단계</b>: 확신도가 ${CONF}보다 낮은 상자 <b>${low.map((b) => b.id).join(', ')}</b>를 버렸어요.`, sorted: false });
    steps.push({ st: { ...st }, ious: {}, msg: '<b>2단계</b>: 남은 상자를 확신도가 높은 순서로 줄 세웠어요. (표의 순서)', sorted: true });
    let round = 0;
    for (;;) {
      const rest = BOX.filter((b) => st[b.id] === '대기').sort((a, b) => b.conf - a.conf);
      if (!rest.length) break;
      round++;
      const top = rest[0]; st[top.id] = '✅ 남김';
      steps.push({ st: { ...st }, ious: { ...ious }, msg: `<b>${round}번째 고르기</b>: 남은 상자 중 확신도가 가장 높은 <b>${top.id} (${top.conf.toFixed(2)})</b>를 남겨요.`, sorted: true, cur: top.id });
      const others = rest.slice(1);
      if (!others.length) break;
      const del = [];
      others.forEach((b) => { const v = iou(top, b); ious[b.id] = `${top.id}와 ${v.toFixed(2)}`; if (v > th) { st[b.id] = '❌ 삭제 (많이 겹침)'; del.push(b.id); } });
      steps.push({ st: { ...st }, ious: { ...ious }, msg: `<b>${top.id}</b>와 나머지 상자의 IoU를 계산했어요. IoU가 기준 ${th.toFixed(2)}보다 큰 ${del.length ? `<b>${del.join(', ')}</b>를 지웠어요` : '상자가 없어서 아무것도 지우지 않았어요'}.${others.length > del.length ? ' 남은 상자가 있으니 다시 골라요.' : ''}`, sorted: true, cur: top.id });
    }
    const kept = BOX.filter((b) => st[b.id] === '✅ 남김').map((b) => b.id);
    steps.push({ st: { ...st }, ious: { ...ious }, msg: `🎉 끝! 남은 상자는 <b>${kept.join(', ')}</b> (${kept.length}개)예요.${kept.length > 1 ? ' 강아지는 하나인데 상자가 두 개 남았네요. IoU 기준을 낮추면 어떻게 될까요?' : ' 강아지 하나에 상자 하나만 남았어요.'}`, sorted: true, done: true });
    si = 0; show();
  };
  const show = () => {
    const s = steps[si];
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    BOX.forEach((b) => {
      const v = s.st[b.id];
      if (v.startsWith('삭제') || v.startsWith('❌')) { ctx.globalAlpha = .18; ctx.setLineDash([6, 5]); }
      drawBox(ctx, b.x, b.y, b.w, b.h, COL[b.id], `${b.id} ${b.conf.toFixed(2)}`, b.id === s.cur ? 5 : v === '✅ 남김' ? 4 : 2);
      ctx.globalAlpha = 1; ctx.setLineDash([]);
    });
    const rows = s.sorted ? BOX.slice().sort((a, b) => b.conf - a.conf) : BOX;
    $('#nsTable').innerHTML = '<tr><th>상자</th><th>확신도</th><th>남긴 상자와의 IoU</th><th>상태</th></tr>' + rows.map((b) => {
      const v = s.st[b.id], del = v.includes('삭제');
      return `<tr class="${b.id === s.cur ? 'hl' : ''}${del ? ' del' : ''}"><td><b style="color:${COL[b.id]}">${b.id}</b></td><td class="num">${b.conf.toFixed(2)}</td><td class="num">${s.ious[b.id] || '-'}</td><td>${v}</td></tr>`;
    }).join('');
    $('#nsMsg').innerHTML = s.msg;
    $('#nsStep').disabled = !!s.done; $('#nsAll').disabled = !!s.done;
  };
  $('#nsStep').addEventListener('click', () => { if (si < steps.length - 1) { si++; show(); } });
  $('#nsAll').addEventListener('click', () => { si = steps.length - 1; show(); });
  $('#nsReset').addEventListener('click', build);
  $('#nsIou').addEventListener('input', (e) => { $('#nsIouVal').textContent = (+e.target.value).toFixed(2); build(); });
  build();
}

/* --- 모두 합쳐 보기: 확신도 기준 + NMS --- */
function initNmsAll(img) {
  const ctx = $('#nmsCanvas').getContext('2d'), cands = makeCandidates();
  const draw = () => {
    const conf = +$('#nmsConf').value, on = $('#nmsOn').checked, th = +$('#nmsIou').value;
    $('#nmsConfVal').textContent = conf.toFixed(2); $('#nmsIouVal').textContent = th.toFixed(2);
    let keep = cands.filter((c) => c.conf >= conf);
    if (on) keep = nms(keep, th);
    drawCands(ctx, img, keep, on || keep.length < 6);
    $('#nmsCount').textContent = keep.length;
    const m = $('#nmsMsg');
    const perObj = YOBJS.map((o) => keep.filter((k) => k.name === o.name && iou(k, o) >= .5).length);
    if (keep.length === 3 && perObj.every((n) => n === 1)) { m.textContent = '🎉 물체마다 상자 하나씩! 성공이에요.'; m.className = 'result-msg good'; }
    else if (perObj.some((n) => n === 0)) { m.textContent = '⚠️ 못 찾은 물체가 있어요. 확신도 기준이 너무 높아요.'; m.className = 'result-msg bad'; }
    else if (!on) { m.textContent = '한 물체에 상자가 여러 개 겹쳐 있어요. NMS를 켜 보세요.'; m.className = 'result-msg'; }
    else { m.textContent = '아직 필요 없는 상자가 남아 있어요. 기준을 바꿔 보세요.'; m.className = 'result-msg'; }
  };
  ['#nmsConf', '#nmsOn', '#nmsIou'].forEach((s) => $(s).addEventListener('input', draw));
  draw();
}

/* --- 5-5 코드 한 줄씩 뜯어보기 --- */
const YOLO_CODE = `from ultralytics import YOLO
import cv2
from playsound import playsound
import threading
import time

# Load the YOLO model and set target classes
model = YOLO('yolov8s-world.pt')
model.set_classes(["dog", "cat"])

cap = cv2.VideoCapture(0)

last_sound_time = 0

def play_sound_dog():
    playsound('dog.mp3')

def play_sound_cat():
    playsound('cat.mp3')

while cap.isOpened():
    success, image = cap.read()
    if not success:
        continue

    results = model.predict(image, device='cpu', save=True)

    for result in results:
        result_ploted = results[0].plot()
        cv2.imshow('img', result_ploted)

        if 0 in result.boxes.cls.tolist():
            current_time = time.time()
            if current_time - last_sound_time >= 1:
                sound_thread = threading.Thread(target=play_sound_dog)
                sound_thread.start()
                last_sound_time = current_time

        if 1 in result.boxes.cls.tolist():
            current_time = time.time()
            if current_time - last_sound_time >= 1:
                sound_thread = threading.Thread(target=play_sound_cat)
                sound_thread.start()
                last_sound_time = current_time

    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()`;

const YOLO_NOTE = {
  1: 'Ultralytics 라이브러리에서 <b>YOLO</b>를 가져와요. 이 한 줄로 YOLO 모델을 쓸 준비가 끝나요.',
  2: '<b>OpenCV</b>(cv2): 카메라·영상을 읽고, 결과 사진을 창에 보여 주는 라이브러리예요.',
  3: '<b>playsound</b>: mp3 같은 소리 파일을 재생하는 함수예요. 소리가 <b>끝날 때까지 프로그램을 기다리게(멈추게)</b> 해요. 그래서 아래에서 threading을 함께 써요.',
  4: '<b>threading</b>: 여러 일을 동시에 하게 해 주는 라이브러리예요. 소리 재생을 따로 일하는 일꾼(<b>스레드</b>)에게 맡길 때 써요.',
  5: '<b>time</b>: 지금 시각을 잴 때 써요. 소리를 1초에 한 번만 틀도록 시간을 재요.',
  7: '<b>주석</b>: <code>#</code> 뒤의 글은 실행되지 않는 설명이에요. "YOLO 모델을 불러오고 찾을 클래스를 정한다"는 뜻이에요.',
  8: '학습이 끝난 모델 파일(<b>.pt</b>)을 불러와요. <b>yolov8s-world.pt</b>는 <b>YOLO-World</b> 모델(s = small 크기)이에요. YOLO-World는 찾을 물체를 <b>단어로</b> 정할 수 있어요.',
  9: '⭐ 찾을 물체를 <b>"dog"(강아지)</b>와 <b>"cat"(고양이)</b> 두 가지로 정해요. 적은 순서대로 <b>0번 = dog, 1번 = cat</b>이라는 클래스 번호가 붙어요. 단어만 바꾸면 다시 학습시키지 않아도 다른 물체를 찾아요.',
  11: '카메라를 켜요. <b>0</b>은 컴퓨터에 달린 첫 번째(내장) 카메라예요. 숫자 대신 <code>\'dogcatmove.mp4\'</code>처럼 파일 이름을 넣으면 영상 파일을 읽어요.',
  13: '마지막으로 소리를 튼 <b>시각</b>을 기억하는 변수예요. 처음에는 0으로 두어서 첫 번째 소리는 바로 날 수 있어요.',
  15: '<b>함수 정의</b>: 강아지 소리를 내는 일을 <code>play_sound_dog</code>라는 이름으로 묶어 둬요. 나중에 스레드(일꾼)에게 이 함수를 맡겨요.',
  16: '<code>dog.mp3</code> 파일을 재생해요. 소리 파일은 코드 파일과 <b>같은 폴더</b>에 있어야 해요.',
  18: '고양이 소리를 내는 일을 <code>play_sound_cat</code>이라는 이름으로 묶어 둬요.',
  19: '<code>cat.mp3</code> 파일을 재생해요.',
  21: '카메라가 켜져 있는 동안 <b>계속 반복</b>해요. 영상은 사진(<b>프레임</b>)이 빠르게 이어진 것이라서, 한 번 반복할 때마다 사진 한 장을 검사해요.',
  22: '카메라에서 사진 한 장(<b>image</b>)을 읽어요. <b>success</b>에는 잘 읽었는지(True/False)가 들어가요.',
  23: '사진을 읽지 못했다면…',
  24: '이번 사진은 건너뛰고 <b>다음 반복</b>으로 넘어가요.',
  26: '⭐ 핵심! 사진을 YOLO에 넣어 <b>예측</b>해요. <b>device=\'cpu\'</b>는 그래픽카드(GPU) 없이 CPU로 계산하라는 뜻이고, <b>save=True</b>는 상자를 그린 결과 사진을 <code>runs/detect</code> 폴더 안에 저장하라는 뜻이에요. <b>conf</b>를 적지 않았으니 확신도 기본값 <b>0.25</b>보다 낮은 상자는 버려지고, <b>NMS</b>로 겹친 상자도 자동으로 정리된 결과가 <b>results</b>에 담겨요.',
  28: '결과를 하나씩 꺼내요. 사진을 한 장 넣었으니 <b>results</b> 안에는 결과가 <b>1개</b> 있어요.',
  29: '원래 사진 위에 <b>상자, 클래스 이름, 확신도</b>를 그린 새 사진을 만들어요. 사진이 한 장이라 <code>results[0]</code>은 위의 <code>result</code>와 같은 결과예요. (<code>result_ploted</code>는 변수 이름일 뿐이라 철자가 달라도 괜찮아요.)',
  30: "<b>'img'</b>라는 이름의 창에 상자를 그린 사진을 보여 줘요.",
  32: '<code>result.boxes.cls</code>에는 찾은 상자들의 <b>클래스 번호</b>가 들어 있어요. <code>.tolist()</code>로 파이썬 리스트(예: <code>[0.0, 1.0]</code>)로 바꾼 뒤, 그 안에 <b>0(dog)</b>이 있는지 확인해요. 즉 "강아지를 찾았나?"예요.',
  33: '지금 시각을 재요. <code>time.time()</code>은 1970년 1월 1일부터 지금까지 흐른 시간을 <b>초</b>로 알려 줘요.',
  34: '지금 시각 − 마지막으로 소리를 튼 시각이 <b>1초 이상</b>일 때만 소리를 틀어요. 이 조건이 없으면 강아지가 보이는 동안 사진마다(1초에 여러 번) 소리를 틀려고 해요.',
  35: '소리를 틀 <b>일꾼(스레드)</b>을 만들어요. <code>target</code>에는 맡길 함수 이름을 적어요. 괄호 없이 <code>play_sound_dog</code>라고 적어야 "이 함수를 맡긴다"는 뜻이 돼요.',
  36: '일꾼을 <b>출발</b>시켜요. 소리는 일꾼이 따로 재생하고, 반복문은 기다리지 않고 바로 다음 줄로 넘어가요. 그래서 소리가 나는 동안에도 <b>영상이 멈추지 않아요</b>.',
  37: '마지막으로 소리를 튼 시각을 <b>지금 시각</b>으로 바꿔 적어요. 이제 1초가 지나야 다시 소리가 나요.',
  39: '찾은 상자의 클래스 번호 중에 <b>1(cat)</b>이 있는지 확인해요. 즉 "고양이를 찾았나?"예요.',
  40: '지금 시각을 재요.',
  41: '마지막으로 소리를 튼 지 1초 이상 지났는지 확인해요. ⚠️ 강아지와 <b>같은 변수</b> <code>last_sound_time</code>을 쓰기 때문에, 바로 위에서 강아지 소리를 틀었다면 이 조건은 거짓이 돼요.',
  42: '고양이 소리를 틀 일꾼(스레드)을 만들어요.',
  43: '일꾼을 출발시켜 <code>cat.mp3</code>를 따로 재생해요.',
  44: '마지막으로 소리를 튼 시각을 지금 시각으로 바꿔 적어요.',
  46: '1ms(0.001초) 동안 키보드 입력을 기다리면서 창 화면을 새로 그려요. <kbd>q</kbd>를 누르면…',
  47: '반복을 멈추고 while 문을 빠져나가요.',
  49: '다 쓴 카메라를 꺼서 돌려줘요.',
  50: 'OpenCV로 연 창을 <b>모두 닫아요</b>.',
};

function initYCode() {
  const lines = YOLO_CODE.split('\n'), pre = $('#codeExplore');
  pre.innerHTML = lines.map((c, i) => `<span class="ln ${c.trim() ? '' : 'blank'}" data-i="${i}"><span class="lno">${i + 1}</span>${highlightPy(c) || ' '}</span>`).join('');
  $$('.ln', pre).forEach((l) => l.addEventListener('click', () => {
    const i = +l.dataset.i, c = lines[i], e = YOLO_NOTE[i + 1]; if (!c.trim() || !e) return;
    $$('.ln', pre).forEach((x) => x.classList.toggle('on', x === l));
    $('#codeNote').innerHTML = `<h4>${i + 1}번 줄: ${esc(c.trim())}</h4><p>${e}</p>`;
  }));
}

/* --- 소리 재생 시뮬레이션 --- */
function initYSound() {
  const cv = $('#soundCanvas'), ctx = cv.getContext('2d');
  const T = 120, SND = 30, PH = [12, 95]; // 4초(120프레임), 소리 1초, 강아지가 보이는 구간
  let mode = 'naive', anim = null;
  const DESC = {
    naive: '❌ <b>playsound()</b>는 소리가 끝날 때까지 프로그램을 <b>멈춰 세워요.</b> 그래서 강아지가 보이는 동안 영상이 뚝뚝 끊기고, 소리만 계속 반복돼요.',
    smart: '✅ <b>threading</b>으로 소리를 따로 재생하니 영상은 멈추지 않아요. <b>time</b>으로 마지막 재생 후 1초가 지났을 때만 다시 재생해서 소리가 겹치지 않아요.',
  };
  const sim = () => {
    const frames = [], sounds = [];
    if (mode === 'naive') {
      let t = 0;
      while (t < T) { frames.push(t); const ph = t >= PH[0] && t <= PH[1]; t++; if (ph) { sounds.push(t); t += SND; } }
    } else {
      let last = -1e9;
      for (let t = 0; t < T; t++) { frames.push(t); if (t >= PH[0] && t <= PH[1] && t - last >= SND) { sounds.push(t); last = t; } }
    }
    return { frames, sounds };
  };
  const draw = (upto = T) => {
    const { frames, sounds } = sim(), W = cv.width, L = 140, R = 20, fw = (W - L - R) / T;
    ctx.clearRect(0, 0, W, cv.height);
    ctx.font = '700 14px "Noto Sans KR"'; ctx.fillStyle = cssVar('--ink');
    ctx.fillText('📷 처리한 사진', 8, 58); ctx.fillText('🔊 소리', 8, 128); ctx.fillText('🐶 강아지', 8, 188);
    ctx.fillStyle = cssVar('--yellow-soft'); ctx.fillRect(L + PH[0] * fw, 170, (PH[1] - PH[0]) * fw, 26);
    ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "Noto Sans KR"'; ctx.fillText('화면에 강아지가 보이는 구간', L + PH[0] * fw + 6, 188);
    frames.filter((t) => t < upto).forEach((t) => {
      ctx.fillStyle = t >= PH[0] && t <= PH[1] ? '#22a06b' : cssVar('--line');
      ctx.fillRect(L + t * fw, 36, Math.max(fw - 1, 1), 34);
    });
    sounds.filter((s) => s < upto).forEach((s, i) => {
      const w = Math.min(SND, upto - s, T - s) * fw;
      ctx.fillStyle = i % 2 ? '#f07a1a' : '#e9468b'; ctx.globalAlpha = .85;
      roundRect(ctx, L + s * fw, 104, w, 34, 6); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.font = '700 12px "Noto Sans KR"'; if (w > 50) ctx.fillText('dog.mp3', L + s * fw + 6, 126);
    });
    if (mode === 'naive') sounds.filter((s) => s < upto).forEach((s) => {
      ctx.fillStyle = 'rgba(226,72,61,.15)'; ctx.fillRect(L + s * fw, 36, Math.min(SND, T - s) * fw, 34);
      ctx.fillStyle = '#e2483d'; ctx.font = '700 11px "Noto Sans KR"'; if (Math.min(SND, T - s) * fw > 46) ctx.fillText('영상 멈춤', L + s * fw + 6, 58);
    });
    ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(L + upto * fw, 26); ctx.lineTo(L + upto * fw, 200); ctx.stroke();
    ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "JetBrains Mono"';
    for (let s = 0; s <= 4; s++) ctx.fillText(s + 's', L + s * 30 * fw - 6, 20);
    const nF = frames.filter((t) => t < upto).length, nS = sounds.filter((s) => s < upto).length;
    $('#soundDesc').innerHTML = `${DESC[mode]}<br><b>처리한 사진 ${nF}장 · 소리 ${nS}번</b>`;
  };
  $$('#soundMode button').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.m; $$('#soundMode button').forEach((x) => x.classList.toggle('on', x === b)); cancelAnimationFrame(anim); draw();
  }));
  $('#soundPlay').addEventListener('click', () => {
    cancelAnimationFrame(anim);
    const t0 = performance.now();
    const step = (now) => { const u = Math.min(T, (now - t0) / 4000 * T); draw(u); if (u < T) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  });
  draw();
  document.addEventListener('themechange', () => draw());
}
