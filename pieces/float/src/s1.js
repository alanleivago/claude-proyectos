// =====================================================================
//  S1 — the sea in section. 100 px = 1 m. A cube sinks; the same steel as a tray floats; cargo; a ship; the load line.
// =====================================================================
const PX = 100, SY = 880, FLOOR = 1480;                  // px per metre, the water surface, the sea floor
const RHO_S = 7850, RHO_W = 1025;                        // kg/m³: steel, seawater
const TRAY = { w: 8, h: 1.125 };                         // the same 1 m³ of steel as a 1 cm plate: 8 x 8 m base + walls (64 + 36 = 100 m²)
const draftOf = (cargo) => (RHO_S + cargo) / (RHO_W * TRAY.w * TRAY.w);   // metres
const CARGO_MAX = RHO_W * TRAY.w * TRAY.w * TRAY.h - RHO_S;              // ≈ 65,950 kg
const STEEL = '#9aa5b1', STEEL_D = '#5d6772', WATER = '#163a5c';

function wave(x) { return SY + Math.sin(x / 90 + TT * 1.6) * 5 + Math.sin(x / 37 - TT * 2.3) * 2; }
function drawWater(a = 1) {
  ctx.save(); ctx.globalAlpha = a * 0.62; ctx.fillStyle = WATER; ctx.beginPath(); ctx.moveTo(-200, FLOOR + 400);
  for (let x = -200; x <= W + 200; x += 20) ctx.lineTo(x, wave(x)); ctx.lineTo(W + 200, FLOOR + 400); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = BP.azure; ctx.lineWidth = 4; ctx.beginPath();
  for (let x = -200; x <= W + 200; x += 20) x === -200 ? ctx.moveTo(x, wave(x)) : ctx.lineTo(x, wave(x)); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#0d1a26'; ctx.fillRect(-200, FLOOR, W + 400, 600); ctx.strokeStyle = BP.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-200, FLOOR); ctx.lineTo(W + 200, FLOOR); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 30; i++) { const R = RNG('fleck', i), x = R.r(0, W), y = R.r(SY + 40, FLOOR - 20) - mod(TT * R.r(6, 16), 300); bpDot(x, y, R.r(1.5, 3), BP.azure, a * 0.25); }
}
function steelBox(x, y, w, h, a = 1) {   // x, y = centre
  ctx.save(); ctx.globalAlpha = a; const g = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
  g.addColorStop(0, '#c3ccd5'); g.addColorStop(1, STEEL_D); ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.strokeStyle = '#dfe5eb'; ctx.lineWidth = 2.5; ctx.strokeRect(x - w / 2, y - h / 2, w, h); ctx.restore();
}
// the tray in section: base and two walls, thickness t px; f = 0 a flat plate, 1 folded
function trayShape(cx, base, w, h, t, f, a = 1) {   // base = y of the tray's underside; f = 0 a flat plate, 1 folded
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = STEEL; ctx.strokeStyle = '#dfe5eb'; ctx.lineWidth = 2;
  ctx.fillRect(cx - w / 2, base - t, w, t); ctx.strokeRect(cx - w / 2, base - t, w, t);
  [[cx - w / 2, lerp(Math.PI, 1.5 * Math.PI, f)], [cx + w / 2, lerp(0, -0.5 * Math.PI, f)]].forEach(([px, ang]) => {
    ctx.save(); ctx.translate(px, base - t / 2); ctx.rotate(ang); ctx.fillRect(0, -t / 2, h, t); ctx.strokeRect(0, -t / 2, h, t); ctx.restore();
  });
  ctx.restore();
}
function arrow(x, y0, y1, c, w, a, label, side = 1) {
  if (a <= 0) return;
  const d = Math.sign(y1 - y0) || 1;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - d * 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 18, y1 - d * 30); ctx.lineTo(x + 18, y1 - d * 30); ctx.closePath(); ctx.fill(); ctx.restore();
  if (label) OV(() => bpText(label, x + side * 30, (y0 + y1) / 2 + 12, 40, c, { font: BP.mono, weight: 700, align: side > 0 ? 'left' : 'right', alpha: a }));
}
// a container ship in side view; d = draft in px (how deep the keel sits below SY); boxes = how many containers on deck
function drawShip(cx, d, a, boxes = 0, sc = 1) {
  const L = 860, Hh = 170, keel = SY + d + Math.sin(TT * 1.4 + cx) * 5, deck = keel - Hh;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, SY); ctx.scale(sc, sc); ctx.translate(-cx, -SY);
  ctx.beginPath(); ctx.moveTo(cx - L / 2, deck); ctx.lineTo(cx + L / 2 - 40, deck); ctx.lineTo(cx + L / 2 + 30, deck - 20);
  ctx.lineTo(cx + L / 2 - 30, keel); ctx.lineTo(cx - L / 2 + 30, keel); ctx.lineTo(cx - L / 2, keel - 40); ctx.closePath();
  ctx.fillStyle = '#1c2530'; ctx.fill(); ctx.strokeStyle = '#dfe5eb'; ctx.lineWidth = 3; ctx.stroke();
  // the bridge and funnel at the stern
  ctx.fillStyle = '#e4e3dc'; ctx.fillRect(cx - L / 2 + 30, deck - 130, 110, 130); ctx.fillStyle = BP.magenta; ctx.fillRect(cx - L / 2 + 60, deck - 175, 40, 45);
  ctx.fillStyle = BP.yellow; for (let i = 0; i < 3; i++) ctx.fillRect(cx - L / 2 + 44 + i * 30, deck - 112, 18, 12);
  // containers
  const cols = ['#1fffa9', '#ffd426', '#e50673', '#5797e7', '#9f6bff'];
  for (let k = 0; k < boxes; k++) { const col = k % 12, row = Math.floor(k / 12); const R = RNG('box', k);
    ctx.fillStyle = cols[Math.floor(R.f() * 5)]; ctx.globalAlpha = a * 0.95; ctx.fillRect(cx - L / 2 + 160 + col * 52, deck - 34 - row * 34, 48, 30); }
  ctx.restore();
  return { keel, deck, L };
}

function sceneFloat() {
  const tShape = VL('shape').t0, tPush = VL('push').t0, tSolid = VL('solid').t0, tCube = VL('cube').t0, tRoll = VL('roll').t0, tEq = B0('equal');
  // ---- the cube: falls and sinks (open); lifted and lowered (push..solid); sinks (cube); rises and rolls (roll)
  let cx = 330, cy;
  if (TT < tPush - 0.3) { cy = TT < 1.2 ? lerp(420, SY - 50, EZ.i2(seg(TT, 0.2, 1.2))) : lerp(SY + 10, FLOOR - 50, EZ.o2(seg(TT, 1.2, 5.0))); }
  else if (TT < tSolid) { const u = EZ.io(seg(TT, tPush - 0.3, tPush + 1.0)); cx = lerp(330, 540, u); cy = lerp(FLOOR - 50, SY + 0, u); if (TT > VW('back', 'pushes')) cy = lerp(SY, SY + 140, EZ.io(seg(TT, VW('back', 'pushes'), VL('arch').t1))); }
  else if (TT < tCube + 0.4) { cx = 540; cy = lerp(SY + 140, SY + 300, EZ.io(seg(TT, tSolid, tSolid + 1))); }
  else if (TT < tRoll) { cx = 540; cy = lerp(SY + 300, FLOOR - 50, EZ.i2(seg(TT, tCube + 0.4, VW('cube', 'bottom') + 0.2))); }
  else { cx = 540; cy = lerp(FLOOR - 50, 560, EZ.io(seg(TT, tRoll - 0.2, tRoll + 0.8))); }
  const flat = EZ.io(seg(TT, VW('roll', 'roll') - 0.1, VW('roll', 'plate') + 0.3)), fold = EZ.io(seg(TT, VW('roll', 'fold') - 0.1, VW('roll', 'tray') + 0.4));
  const showCube = TT < HIT && TT < tEq;
  // ---- the tray: lands on the hit, floats, takes cargo
  const cargo = CARGO_MAX * 0.995 * EZ.io(seg(TT, VW('cargo', 'carry') - 0.1, VL('cargo').t1 + 0.3));
  const dr = draftOf(cargo) * PX, land = TT < HIT ? 0 : 1, bob = TT >= HIT ? springMove(HIT, -40, 0, SPRING.playful) : 0;
  const trayBase = TT < HIT ? lerp(560 + 6, SY - 1, EZ.i2(seg(TT, HIT - 0.5, HIT))) : SY + dr + bob + Math.sin(TT * 1.5) * 3 * seg(TT, HIT + 0.8, HIT + 1.6);
  const trayA = TT < HIT ? 1 : fadeOut(tEq + 0.3, 0.5);
  // ---- the ship
  const shipA = fadeIn(tEq, 0.6), boxes = Math.round(lerp(12, 48, EZ.io(seg(TT, VW('lower', 'load') - 0.2, VL('lower').t1))));
  const shipD = lerp(70, 118, EZ.io(seg(TT, VW('lower', 'load') - 0.2, VL('lower').t1)));

  // drawing: things in the water first, then the water over them, then the labels
  if (TT < tShape + 3) drawShip(760 + 200 * EZ.i2(seg(TT, tShape + 1.5, tShape + 3)), 60, fadeOut(tShape + 2.5, 0.6) * 0.95, 12, 0.42);
  if (showCube && TT < tRoll + 0.2) {
    steelBox(cx, cy, PX, PX);
    if (cy > SY + 20) for (let i = 0; i < 14; i++) { const R = RNG('bubble', i), ph = mod(TT * R.r(0.5, 0.9) + R.f(), 1), by = cy - 40 - ph * 300; if (by > SY + 10) bpDot(cx + R.r(-40, 40) + Math.sin(TT * 3 + i) * 6, by, R.r(3, 7), '#bfe3ff', 0.5 * (1 - ph)); }
  }
  if (TT >= tRoll - 0.2 && TT < tEq + 1) {
    const w = TRAY.w * PX, h = TRAY.h * PX, t = 6;
    if (flat < 1 && TT < VW('roll', 'plate') + 0.3) { const ww = lerp(PX, w + 2 * h, flat), hh = lerp(PX, t, flat); steelBox(540, TT < HIT ? cy + (1 - flat) * 0 : cy, ww, hh); }
    else trayShape(540, TT < HIT ? cy + 50 : trayBase, w, h, t, fold, trayA);
    // cargo boxes inside the tray
    if (cargo > 0) { const n = Math.round(22 * cargo / CARGO_MAX); for (let k = 0; k < n; k++) { const col = k % 11, row = Math.floor(k / 11); const R = RNG('cg', k);
      ctx.save(); ctx.globalAlpha = trayA; ctx.fillStyle = ['#ffd426', '#e50673', '#5797e7', '#1fffa9'][Math.floor(R.f() * 4)]; ctx.fillRect(540 - w / 2 + 12 + col * 70, trayBase - 6 - 48 - row * 50, 62, 44); ctx.restore(); } }
  }
  if (shipA > 0) drawShip(540, shipD, shipA, boxes);
  drawWater(1);
  // displaced water (mint) under the floating tray, the air inside
  if (TT >= HIT && trayA > 0) {
    const w = TRAY.w * PX, u = fadeIn(VL('air').t0 - 0.1, 0.4) * trayA;
    ctx.save(); ctx.globalAlpha = u * 0.55; ctx.fillStyle = BP.mint; ctx.fillRect(540 - w / 2, SY, w, Math.max(2, trayBase - SY)); ctx.restore();
    OV(() => { bpText('air', 540, trayBase - 50, 56, BP.text, { italic: true, alpha: u * fadeOut(VW('cargo', 'carry'), 0.3) }); });
    const da = fadeIn(VL('floats').t0, 0.3) * trayA;
    if (da > 0) OV(() => { line(540 + w / 2 + 40, SY, 540 + w / 2 + 40, trayBase, BP.yellow, 4, da); bpText(`${(draftOf(cargo) * 100).toFixed(0)} cm deep`, 540, SY + 150, 60, BP.yellow, { font: BP.mono, weight: 700, alpha: da }); });
    const ca = fadeIn(VW('cargo', 'carry') - 0.1, 0.3) * trayA;
    if (ca > 0) OV(() => bpText(`cargo ${Math.round(cargo / 1000)} t`, 540, 430, 80, BP.yellow, { font: BP.mono, weight: 700, alpha: ca, glow: 14 }));
  }
  // the cube's forces and numbers
  const fa = win(tSolid - 0.1, VL('cube').t1, 0.3) * (showCube ? 1 : 0);
  arrow(cx, cy, cy + 7.85 * 30, BP.magenta, 9, fa, '7,850 kg', 1);
  arrow(cx, cy, cy - 1.025 * 30 - 20, BP.mint, 9, fa, '1,025 kg', -1);
  const pa = win(VW('push', 'push') - 0.2, VL('back').t0, 0.3);
  if (pa > 0 && showCube) { ctx.save(); ctx.globalAlpha = pa * 0.6; ctx.fillStyle = BP.mint; const sub = clamp(cy + 50 - SY, 0, PX); ctx.fillRect(cx + 90, SY - sub, PX, sub); ctx.restore(); OV(() => bpText('pushed aside', cx + 140, SY - 120, 36, BP.mint, { font: BP.mono, alpha: pa })); }
  const ba = win(VW('back', 'pushes') - 0.2, VL('arch').t1 + 0.3, 0.3);
  arrow(cx, cy, cy - 230, BP.mint, 10, ba * (showCube ? 1 : 0), 'buoyancy', -1);
  // the ship's forces and the load line
  if (shipA > 0) {
    const s = { keel: SY + shipD }, ea = win(VW('equal', 'weighs') - 0.4, VL('lower').t0, 0.3) * shipA;
    arrow(400, s.keel - 90, s.keel + 200, BP.magenta, 10, ea, 'weight', -1); arrow(680, s.keel + 200, s.keel - 90, BP.mint, 10, ea, 'buoyancy', 1);
    const la = fadeIn(VW('line', 'line') - 0.1, 0.4) * shipA * fadeOut(VL('end').t0 + 1.2, 0.4);
    if (la > 0) { const px = 700, py = SY - 20; ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = BP.yellow; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(px, py, 36, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 56, py); ctx.lineTo(px + 56, py); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px + 80, py - 30); ctx.lineTo(px + 80, py + 30); ctx.moveTo(px + 80, py - 10); ctx.lineTo(px + 120, py - 10); ctx.stroke(); ctx.restore();
      OV(() => bpText('load line', px, py + 100, 44, BP.yellow, { font: BP.mono, weight: 700, alpha: la })); }
    const aa = fadeIn(VW('end', 'air', 1) - 0.4, 0.5) * shipA;
    if (aa > 0) { ctx.save(); ctx.globalAlpha = aa * (0.35 + 0.15 * Math.sin(TT * 4)); ctx.fillStyle = BP.mint; ctx.fillRect(540 - 380, SY + shipD - 150, 760, 140); ctx.restore(); OV(() => bpText('air', 540, SY + shipD - 60, 64, BP.mint, { italic: true, alpha: aa, glow: 16 })); }
  }
  // captions and tags
  OV(() => { const ta = win(0.3, VW('shape', 'shape') - 0.55, 0.3); bpText('How does steel float?', 540, 400, 72, BP.mint, { italic: true, alpha: ta }); });
  caption([{ t: "it's the shape", c: BP.mint, i: true }], win(VW('shape', 'shape') - 0.2, VL('push').t0), 400, 84);
  topTag("ARCHIMEDES' PRINCIPLE", win(VL('arch').t0 - 0.1, B0('solid') + 0.2));
  caption([{ t: 'steel ≈ 8× heavier than water', c: BP.text, i: true }], win(VW('solid', 'steel') - 0.2, VL('cube').t0), 400, 60);
  caption([{ t: 'same steel', c: BP.yellow }, { t: 'a hollow tray', c: BP.text, i: true }], win(VW('roll', 'same') - 0.2, HIT - 0.1), 380, 64);
  caption([{ t: 'the more cargo, the lower it sits', c: BP.yellow, i: true }], win(VW('lower', 'more') - 0.2, VL('line').t0), 400, 56);
  caption([{ t: "It's floating on air.", c: BP.mint, i: true }], fadeIn(VW('end', 'floating', 2) - 0.2, 0.4), 400, 72);
  // the signature
  const tS = VL('end').t1 + 0.1, sa = fadeIn(tS, 0.2);
  if (sa > 0) OV(() => {
    ctx.save(); ctx.font = `700 72px ${BP.mono}`; const w1 = ctx.measureText('Bit').width, w = ctx.measureText('Bitstory').width; ctx.restore();
    const n = Math.round(8 * seg(TT, tS, tS + 0.6)), xs = 540 - w / 2;
    bpText('Bit'.slice(0, n), xs, 1482, 72, BP.mint, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n > 3) bpText('story'.slice(0, n - 3), xs + w1, 1482, 72, BP.magenta, { font: BP.mono, weight: 700, align: 'left', alpha: sa, glow: 18 });
    if (n < 8 || Math.floor(TT * 2.5) % 2) { ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = BP.text; ctx.font = `700 72px ${BP.mono}`; const cw = ctx.measureText('Bitstory'.slice(0, n)).width; ctx.fillRect(xs + cw + 6, 1426, 30, 64); ctx.restore(); }
  });
}

function sceneStage() {
  bpGround();
  sceneFloat();
  const fl = 1 - seg(TT, HIT, HIT + 0.3);
  if (fl > 0 && fl < 1) OV(() => { ctx.save(); ctx.globalAlpha = 0.4 * fl * fl; ctx.fillStyle = BP.mint; ctx.fillRect(-100, 0, W + 200, H); ctx.restore(); });
}
function pieceCam(era, t) {
  const hold = (t0, t1, amt) => amt * EZ.io(seg(t, t0, t1)) * (1 - EZ.io(seg(t, t1, t1 + 0.6)));
  const cubeOn = EZ.io(seg(t, VL('push').t0 - 0.2, VL('push').t0 + 1.2)) * (1 - EZ.io(seg(t, VL('cube').t0 + 0.3, VL('cube').t0 + 1.4)));
  const z = 1 + 0.9 * cubeOn + hold(0.4, VL('shape').t0, 0.1) + hold(VL('air').t0, VL('floats').t0 - 0.3, 0.08) + hold(VL('equal').t0 - 0.2, B0('lower'), 0.1) - hold(VL('end').t0, DURATION, 0.08) + hold(VL('floats').t0 - 0.3, VW('cargo', 'carry'), 0.25) + hold(VW('line', 'line') - 0.3, VL('end').t0 + 0.6, 0.35) + 0.01 * Math.sin(t * 0.4);
  const fx = t > VW('line', 'line') - 0.4 && t < VL('end').t0 + 1.2 ? 700 : 540, fy = t > VL('floats').t0 - 0.4 && t < VW('cargo', 'carry') + 0.6 ? SY : 900;
  const fy2 = lerp(fy, SY + 120, cubeOn);
  return camOf({ z, p: [fx, fy2], to: [540, 900] });
}
window.SFX_CUES = (() => {
  const C = [], add = (id, t, pan = 0) => C.push({ id, t: +t.toFixed(3), pan });
  add('splash', 1.2, -0.3); add('gurgle', 1.4, -0.3);
  add('lift', VL('push').t0 - 0.3); add('push', VW('back', 'pushes') - 0.1); add('arch', VL('arch').t0);
  add('thud', VW('solid', 'sinks')); add('sink', VL('cube').t0 + 0.4); add('bottom', VW('cube', 'bottom') + 0.2);
  add('rise', VL('roll').t0 - 0.2); add('bend', VW('roll', 'roll') - 0.1); add('bend', VW('roll', 'fold') - 0.1);
  add('hit', HIT);
  add('draft', VL('floats').t0);
  for (let k = 0; k < 22; k++) add('box', lerp(VW('cargo', 'carry') - 0.1, VL('cargo').t1 + 0.3, k / 22), (k % 11 - 5) * 0.08);
  add('scale', VW('equal', 'weighs') - 0.4);
  for (let k = 0; k < 8; k++) add('box', lerp(VW('lower', 'load') - 0.2, VL('lower').t1, k / 8), (k % 5 - 2) * 0.1);
  add('mark', VW('line', 'line') - 0.1); add('air', VW('end', 'air', 1) - 0.4);
  const tS = VL('end').t1 + 0.1; for (let i = 0; i < 8; i++) add('key' + i, tS + (i + 0.5) * 0.6 / 8, -0.2 + i * 0.05);
  return C.sort((a, b) => a.t - b.t);
})();
