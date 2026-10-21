// =====================================================================
//  SCENES — Alcibiades, black-figure experiment (amphora-bf). World 1080x1920, on 2s, wiggle on 3s.
//  Everything in strict profile; people move only left or right, like puppets on a vase frieze.
//  The picture lives between the friezes (y 234..1599), feet on BF_FLOOR. Added white = Athens, added red = Sparta, gold = Persia.
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const shotU = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const shotNow = () => IDS[Math.max(0, TB.findIndex((t, i) => TT >= t - 1e-6 && (i + 1 >= TB.length || TT < TB[i + 1] - 1e-6)))];
const FLIPS = () => [[VW('hook', 'sparta') - 0.18, 'lambda'], [VW('hook', 'persia') - 0.18, 'disc'], [VW('hook', 'athens', 2) - 0.18, 'owl']];
const FL = BF_FLOOR;
// named poses (joint angles; see bfWalkPose for the walk)
const POSE = {
  point: { ua1: 1.55, el1: 0.05 }, raise: { ua1: 2.7, el1: 0.15 }, offer: { ua1: 1.2, el1: 0.35, ua2: 1.05, el2: 0.4 },
  sit: { th1: 1.45, kn1: 1.45, th2: 1.35, kn2: 1.35, drop: 205 }, kneel: { th1: 1.45, kn1: 1.45, th2: 0.1, kn2: 1.75, drop: 215 },
};
const P = (...ps) => Object.assign({}, BF_REST, ...ps);

// ---- captions: chunks at sentence ends (and at a comma inside a long sentence), always low in the picture
function capChunks(id) {
  const L = VL(id), ws = L.text.split(/\s+/), out = [[]];
  const left = (i) => { let n = 0; for (let j = i + 1; j < ws.length; j++) { n++; if (/[.:?]$/.test(ws[j])) break; } return n; };
  ws.forEach((w, i) => {
    out[out.length - 1].push({ w, t: L.words[i] ? L.words[i].t0 : L.t0 });
    const cur = out[out.length - 1];
    if (i < ws.length - 1 && (/[.:?]$/.test(w) || (/,$/.test(w) && cur.length >= 6 && left(i) >= 4))) out.push([]);
  });
  return out;
}
const CAPS = {};
function drawCaptions() {
  const id = shotNow();
  if (id === 'sign' || !VL(id)) return;
  const ch = CAPS[id] || (CAPS[id] = capChunks(id)), end = SUBEND(id);
  for (let k = 0; k < ch.length; k++) {
    const t0 = ch[k][0].t - 0.12, t1 = k + 1 < ch.length ? ch[k + 1][0].t - 0.14 : end;
    if (TT < t0 || TT >= t1) continue;
    const a = fadeOut(t1 - 0.16, 0.16);
    bfOverlay(() => bfCaption(ch[k], { yLast: 1450, size: 78, maxW: 800, a }));
  }
}

// ---- the camera: a frieze is read sideways, so it pans horizontally (and pushes a little)
function setCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 - c.z * c.cx, H / 2 - c.z * c.cy); }
function panCam(id, x0, x1, z0 = 1, z1 = 1.04, cy = 960) {
  const u = EZ.io(shotU(id));
  return { cx: lerp(x0, x1, u) + 6 * Math.sin(TT * 0.4), cy: cy + 4 * Math.sin(TT * 0.33), z: lerp(z0, z1, u) };
}
// a figure walking from xa to xb between t0 and t1 (then standing); returns x and the pose
function walker(xa, xb, t0, t1, o = {}) {
  const u = clamp((TT - t0) / Math.max(0.01, t1 - t0)), x = lerp(xa, xb, o.ease ? EZ.io(u) : u), moving = u > 0 && u < 1;
  const ph = (TT - t0) * (o.rate ?? 6.5) + (o.ph ?? 0);
  return { x, pose: moving ? bfWalkPose(ph, 1, o.run ?? 0) : P(o.rest || {}), moving };
}
const blend = (a, b, u) => { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = lerp(a[k] ?? BF_REST[k] ?? 0, b[k] ?? BF_REST[k] ?? 0, u); return o; };

// =====================================================================
//  sets, in black-figure
// =====================================================================
function bfTemple(x, y, w, h, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  bfFill([[x - w / 2 - 14, y], [x + w / 2 + 14, y], [x + w / 2 + 14, y - 16], [x - w / 2 - 14, y - 16]], BF.black, { key: 'tps' + x });
  const n = o.cols ?? 8;
  for (let i = 0; i < n; i++) { const cx = x - w / 2 + 10 + i * (w - 20) / (n - 1); bfFill([[cx - 8, y - 16], [cx + 8, y - 16], [cx + 7, y - h], [cx - 7, y - h]], BF.black, { key: 'tpc' + i + x }); bfInc([[cx - 2, y - 20], [cx - 2, y - h + 6]], { w: 1.2, key: 'tpf' + i + x }); }
  bfFill([[x - w / 2 - 8, y - h], [x + w / 2 + 8, y - h], [x + w / 2 + 8, y - h - 18], [x - w / 2 - 8, y - h - 18]], BF.black, { key: 'tpa' + x });
  bfFill([[x - w / 2 - 14, y - h - 18], [x + w / 2 + 14, y - h - 18], [x, y - h - 18 - h * 0.3]], BF.black, { key: 'tpp' + x });
  bfInc([[x - w / 2, y - h - 8], [x + w / 2, y - h - 8]], { w: 1.6, key: 'tpl' + x }); bfInc([[x - w / 2 + 10, y - h - 24], [x, y - h - 12 - h * 0.26], [x + w / 2 - 10, y - h - 24]], { w: 1.4, key: 'tpq' + x });
  ctx.restore();
}
function bfCity(x0, x1, y, h, key, o = {}) {   // walls with towers and crenels, houses and a temple above
  const R = RNG('city', key);
  for (let x = x0; x < x1; x += R.r(70, 120)) { const hh = h * R.r(0.5, 0.9), ww = R.r(60, 100); bfFill([[x, y], [x + ww, y], [x + ww, y - hh], [x + ww / 2, y - hh - 30], [x, y - hh]], BF.black, { key: key + 'h' + x }); bfFill([[x + ww * 0.3, y - hh * 0.6], [x + ww * 0.5, y - hh * 0.6], [x + ww * 0.5, y - hh * 0.4], [x + ww * 0.3, y - hh * 0.4]], BF.inc, { key: key + 'w' + x, a: 0.8, sep: 0 }); }
  bfFill([[x0, y + 2], [x1, y + 2], [x1, y - h * 0.45], [x0, y - h * 0.45]], BF.black, { key: key + 'wall' });
  for (let x = x0; x < x1; x += 40) bfFill([[x, y - h * 0.45], [x + 22, y - h * 0.45], [x + 22, y - h * 0.45 - 20], [x, y - h * 0.45 - 20]], BF.black, { key: key + 'cr' + x, raw: true, sep: 0 });
  for (let x = x0 + 60; x < x1; x += 260) { bfFill([[x, y], [x + 70, y], [x + 70, y - h * 0.75], [x, y - h * 0.75]], BF.black, { key: key + 't' + x }); bfLine(x + 10, y - h * 0.5, x + 60, y - h * 0.5, { w: 1.6, key: key + 'tl' + x }); }
  bfInc([[x0, y - h * 0.3], [x1, y - h * 0.3]], { w: 1.4, key: key + 'cl' });
  if (o.temple) bfTemple(o.temple, y - h * 0.45 - 20, 200, 80);
}
function bfWaveBand(y, key, a = 1) {   // the sea: rows of black running waves (the vase's scroll pattern) on the orange
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = BF.black; ctx.lineCap = 'round';
  for (let r = 0; r < 6; r++) {
    const yy = y + r * 48, step = 62 + r * 6, off = mod(-TT * (30 + r * 8) + r * 23, step); ctx.lineWidth = 4 + r * 0.6;
    ctx.beginPath();
    for (let x = -300 - off; x < 1400; x += step) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + step * 0.3, yy - 26, x + step * 0.55, yy - 8); ctx.quadraticCurveTo(x + step * 0.45, yy + 2, x + step * 0.36, yy - 6); ctx.moveTo(x + step * 0.55, yy - 8); ctx.quadraticCurveTo(x + step * 0.8, yy + 6, x + step, yy); }
    ctx.stroke();
  }
  ctx.fillStyle = BF.black; ctx.fillRect(-300, y - 4, 1700, 5);
  ctx.restore();
}
function bfShip(x, y, s, o = {}) {
  const k = o.key ?? 'shp' + (x | 0), heave = 5 * Math.sin(TT * 1.4 + x * 0.01);
  ctx.save(); ctx.translate(x, y + heave); ctx.scale(s * (o.dir ?? 1), s);
  const sw = Math.sin(TT * 3.2 + (o.ph ?? 0));
  for (let i = 0; i < 14; i++) { const ox = -280 + i * 40, a = 0.6 + sw * 0.35; ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox - Math.cos(a) * 60, 10 + Math.sin(a) * 120); ctx.stroke(); }
  bfFill([[-430, -150], [-400, -80], [-330, -50], [360, -50], [430, -30], [500, 10], [380, 20], [-300, 20], [-380, -20], [-450, -120]], BF.black, { key: k + 'h' });
  bfInc([[-320, -30], [380, -30]], { key: k + 'w' }); for (let i = 0; i < 14; i++) bfDot(-280 + i * 40, -10, 5, BF.inc);
  bfInc(ellipsePts(330, -30, 14, 8, 0, 12), { closed: true, key: k + 'e' }); bfDot(334, -30, 4, BF.inc);
  for (let i = 0; i < 9; i++) bfHeadMini(-230 + i * 58, -70 + 3 * Math.sin(TT * 3.2 + i), 0.36, k + 'r' + i);
  ctx.fillStyle = BF.black; ctx.fillRect(14, -520, 10, 480); ctx.fillRect(-170, -505, 380, 9);
  const bil = 20 * Math.sin(TT * 1.7 + x * 0.01);
  bfFill([[-166, -496], [206, -496], [214 + bil * 0.3, -330], [204, -170], [-160, -170], [-170 + bil * 0.3, -330]], o.sail ?? BF.white, { key: k + 's' });
  for (let i = 1; i < 6; i++) bfInc([[-160 + i * 62, -490], [-160 + i * 62 + bil * 0.2, -176]], { c: BF.black, w: 1.6, a: 0.5, key: k + 'sl' + i });
  if (o.emblem !== false) bfShield(20, -330, 80, o.emblem ?? 'owl', { key: k + 'em' });
  if (o.garland) for (let i = 0; i < 10; i++) bfFill(ellipsePts(-260 + i * 64, -56, 12, 6, 0.4, 8), i % 2 ? BF.white : BF.red, { key: k + 'g' + i, raw: true });
  ctx.restore();
}
function bfHeadMini(x, y, s, k, dir = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); bfHead({ head: 'curls' }, k); ctx.restore(); }
function bfLabel(str, x, y, size = 40, c = BF.white) { ctx.save(); ctx.font = `${size}px ${BF_CAPS}`; ctx.textAlign = 'center'; ctx.letterSpacing = '5px'; ctx.fillStyle = c; ctx.fillText(str, x, y); ctx.restore(); }
function bfMoon(x, y, r) { ctx.save(); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.85, 0, TAU, true); ctx.fill('evenodd'); ctx.restore(); }
function bfStars(n, key) { for (let i = 0; i < n; i++) { const R = RNG('st', key, i), tw = 0.5 + 0.5 * Math.sin(TT * 3 + i); star4(R.r(40, 1040), R.r(300, 700), 7 * tw + 3, BF.black); } }
// a throne (klismos-like): curved legs, a seat, a back
function bfThrone(x, y, dir = 1, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  bfFill([[-120, -280], [130, -280], [130, -250], [-120, -250]], BF.black, { key: 'thS' });
  bfFill([[-110, -250], [-90, -250], [-130, 0], [-150, 0]], BF.black, { key: 'thL1' }); bfFill([[100, -250], [120, -250], [150, 0], [130, 0]], BF.black, { key: 'thL2' });
  bfFill([[-120, -280], [-100, -280], [-150, -600], [-180, -610]], BF.black, { key: 'thB' });
  bfInc([[-110, -266], [120, -266]], { w: 1.6, key: 'thl' }); for (let i = 0; i < 5; i++) bfDot(-80 + i * 45, -265, 4, BF.inc);
  ctx.restore();
}
function bfHerm(x, y, s, broken, k) {
  bfFill([[x - 44 * s, y], [x + 44 * s, y], [x + 38 * s, y - 330 * s], [x - 38 * s, y - 330 * s]], BF.black, { key: k + 'p' });
  bfFill([[x - 60 * s, y], [x + 60 * s, y], [x + 60 * s, y - 20 * s], [x - 60 * s, y - 20 * s]], BF.black, { key: k + 'b' });
  for (const d of [-1, 1]) bfFill([[x + d * 38 * s, y - 250 * s], [x + d * 62 * s, y - 248 * s], [x + d * 62 * s, y - 230 * s], [x + d * 38 * s, y - 232 * s]], BF.black, { key: k + 'a' + d });
  bfInc([[x - 30 * s, y - 40 * s], [x + 30 * s, y - 40 * s]], { w: 1.6, key: k + 'l1' }); bfInc([[x, y - 60 * s], [x, y - 300 * s]], { w: 1.2, a: 0.5, key: k + 'l2' });
  const f = EZ.i2(broken), hx = x + f * 130 * s, hy = y - 330 * s + f * 330 * s - 10 * s;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(f * 2.4); ctx.scale(s * 1.1, s * 1.1); bfHead({ head: 'curls', beard: true }, k + 'hd'); ctx.restore();
  if (broken > 0 && broken < 1) for (let i = 0; i < 8; i++) { const R = RNG('chip', k, i), u = broken; bfDot(x + R.r(-1, 1) * 140 * u, y - 330 * s + (R.r(-120, 20) * u + 600 * u * u) * s, 6 * s, BF.black); }
}
function bfFlames(x, y, w, h, k, key) {
  if (k <= 0) return;
  const n = Math.max(3, Math.round(w / 70));
  for (const [c, sc] of [[BF.black, 1], [BF.red, 0.7], [BF.gold, 0.4]]) for (let i = 0; i < n; i++) {
    const R = RNG('fl', key, i, B), bx = x - w / 2 + (i + 0.5) * w / n, hh = h * k * sc * R.r(0.6, 1.1), ww = w / n * 0.7 * sc, lean = R.r(-0.3, 0.3) * hh;
    bfFill([[bx - ww, y], [bx - ww * 0.8, y - hh * 0.35], [bx - ww * 0.2 + lean * 0.4, y - hh * 0.55], [bx - ww * 0.5 + lean * 0.7, y - hh * 0.8], [bx + lean, y - hh], [bx + ww * 0.3 + lean * 0.5, y - hh * 0.6], [bx + ww * 0.9, y - hh * 0.4], [bx + ww, y]], c, { key: 'flm' + key + i + sc + B, sep: c === BF.black ? 4.5 : 0 });
  }
}
function bfSmoke(x, y, k, key, n = 6) { if (k <= 0) return; const L = [], Rr = [], H = 560; for (let j = 0; j <= 24; j++) { const u = j / 24, wv = Math.sin(u * 7 - TT * 2.2 + x * 0.01) * 40 * u, cx = x + wv + u * 80, r = lerp(26, 90, u) * (0.8 + 0.2 * Math.sin(u * 13 + TT * 3)); L.push([cx - r, y - u * H * k]); Rr.push([cx + r, y - u * H * k]); } const Q = [...L, ...Rr.reverse()]; bfFill(Q, BF.black, { key: 'smk' + key, raw: true, a: 0.92 }); for (let j = 0; j < 4; j++) { const u = 0.2 + j * 0.18; bfInc(arcPts(x + u * 80, y - u * H * k, lerp(26, 90, u) * 0.6, 3.6, 5.8, 8), { w: 1.4, raw: true }); } }
// a painted board (pinax) on a stand: the Greek world in black, red arrows drawn on as they are named
const MAPB = {
  sicily: [[12.4, 38.1], [13.3, 38.2], [14.5, 38.05], [15.6, 38.3], [15.1, 37.3], [15.3, 36.9], [15.1, 36.65], [14.3, 36.8], [12.9, 37.6], [12.4, 37.8]],
  italy: [[13.6, 41.2], [14.2, 41.0], [14.9, 40.4], [15.7, 39.9], [15.8, 39.0], [15.65, 38.2], [15.7, 37.95], [16.1, 38.0], [16.55, 38.45], [17.15, 39.0], [17.1, 39.4], [16.5, 39.7], [16.9, 40.4], [17.4, 40.5], [18.0, 40.3], [18.5, 40.1], [18.4, 39.8], [18.55, 40.2], [18.0, 40.65], [17.3, 40.9], [16.4, 41.2]],
  greece: [[19.4, 41.0], [19.5, 40.9], [19.3, 40.4], [20.0, 39.7], [20.7, 39.0], [21.1, 38.5], [21.6, 38.35], [22.4, 38.35], [22.9, 38.2], [22.95, 37.95], [23.2, 38.0], [23.6, 37.95], [24.0, 37.65], [24.05, 38.1], [23.7, 38.35], [23.0, 38.8], [22.8, 39.0], [23.0, 39.3], [22.6, 40.0], [22.9, 40.6], [23.6, 40.3], [24.0, 40.8], [24.2, 41.0]],
  pelop: [[21.4, 38.2], [21.1, 37.85], [21.6, 37.6], [21.7, 36.8], [22.1, 36.9], [22.4, 36.45], [22.6, 36.85], [23.0, 36.45], [23.2, 36.6], [22.75, 37.5], [23.1, 37.6], [23.3, 37.4], [23.5, 37.6], [23.0, 37.95], [22.4, 38.15], [21.8, 38.3]],
  euboea: [[22.8, 38.95], [23.6, 38.7], [24.6, 38.0], [24.3, 38.0], [23.3, 38.5]],
};
const ROUGH = {};
function bfRough(P, key, lv = 3) {
  if (ROUGH[key]) return ROUGH[key];
  let Q = P; const R = RNG('rough', key);
  for (let l = 0; l < lv; l++) { const N = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], d = dist(a, b), nx = (a[1] - b[1]) / (d || 1), ny = (b[0] - a[0]) / (d || 1), o = R.n(d * 0.14); N.push(a, [(a[0] + b[0]) / 2 + nx * o, (a[1] + b[1]) / 2 + ny * o]); } Q = N; }
  return (ROUGH[key] = Q);
}
function bfBoard(x, y, w, h, arrows) {
  bfFill([[x - 10, y + h + 40], [x + 10, y + h + 40], [x + 6, FL], [x - 6, FL]], BF.black, { key: 'bstand' });
  bfFill([[x - w / 2 - 14, y - 14], [x + w / 2 + 14, y - 14], [x + w / 2 + 14, y + h + 14], [x - w / 2 - 14, y + h + 14]], BF.black, { key: 'bframe' });
  bfFill([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x - w / 2, y + h]], BF.ground, { key: 'bface', sep: 0 });
  const mx = (lon) => x - w / 2 + (lon - 12) / 13 * w, my = (lat) => y + (41.2 - lat) / 5 * h;
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, y, w, h); ctx.clip();
  for (const [nm, pts] of Object.entries(MAPB)) { const Q = bfRough(pts.map(([a, b]) => [mx(a), my(b)]), 'b' + nm, 2); bfFill(Q, BF.black, { key: 'bm' + nm, raw: true }); bfInc(Q.map(([a, b]) => [a, b]), { closed: true, w: 1.2, a: 0.6, raw: true }); }
  ctx.restore();
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const wx = x - w / 2 + 30 + i * 80 + (r % 2) * 40, wy = y + h * 0.75 + r * 18; bfInc([[wx, wy], [wx + 14, wy - 6], [wx + 28, wy]], { c: BF.black, w: 2, key: 'bw' + r + i }); }
  arrows.forEach(([lon0, lat0, lon1, lat1, u], i) => { if (u <= 0) return; const A = [mx(lon0), my(lat0)], Bp = [mx(lon1), my(lat1)], Cp = [(A[0] + Bp[0]) / 2, Math.min(A[1], Bp[1]) - 50 - i * 20];
    const pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20 * EZ.io(u); pts.push([(1 - t) ** 2 * A[0] + 2 * (1 - t) * t * Cp[0] + t * t * Bp[0], (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * Cp[1] + t * t * Bp[1]]); }
    ctx.save(); ctx.strokeStyle = BF.red; ctx.lineWidth = 9; ctx.lineCap = 'round'; trace(pts, false); ctx.stroke(); const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], an = Math.atan2(ey - py, ex - px); ctx.fillStyle = BF.red; ctx.beginPath(); ctx.moveTo(ex + Math.cos(an) * 18, ey + Math.sin(an) * 18); ctx.lineTo(ex + Math.cos(an + 2.5) * 22, ey + Math.sin(an + 2.5) * 22); ctx.lineTo(ex + Math.cos(an - 2.5) * 22, ey + Math.sin(an - 2.5) * 22); ctx.fill(); ctx.restore(); });
  return { mx, my };
}

// =====================================================================
//  the beats
// =====================================================================
function sceneHook() {
  // he marches along the frieze; at every betrayal he turns round and his shield's device changes
  setCam(panCam('hook', 540, 560, 1.0, 1.05));
  ctx.save(); ctx.globalAlpha = 0.9; bfCity(-200, 1300, 1330, 170, 'hkc', { temple: 820 }); ctx.restore();
  let dir = 1, emb = 'owl', sx = 1;
  FLIPS().forEach(([t, e], i) => { const u = clamp((TT - t) / 0.36); if (u > 0) { sx = Math.cos(Math.PI * EZ.io(u)); if (u >= 0.5) { emb = e; dir = i % 2 ? 1 : -1; } } });
  const w = bfWalkPose(TT * 6.2, Math.abs(sx) > 0.6 ? 1 : 0.3);
  bfFigure(540, FL, dir, { s: 1.12, kind: 'hoplite', head: 'helmet', beard: true, pose: w, shield: emb, spear: true, key: 'hk' });
}
function scenePericles() {
  const soc = TT >= SUB('socrates');
  setCam(soc ? panCam('socrates', 560, 680, 1.0, 1.03) : panCam('pericles', 420, 540, 1.0, 1.03));
  bfTemple(800, 760, 340, 130);
  ctx.fillStyle = BF.black; ctx.beginPath(); ctx.moveTo(-300, 780); for (let x = -300; x <= 1400; x += 40) ctx.lineTo(x, 780 - 40 * Math.sin(Math.PI * clamp((x + 100) / 1300))); ctx.lineTo(1400, 800); ctx.lineTo(-300, 800); ctx.fill();
  const reach = EZ.o2(clamp((TT - SUB('pericles') - 1.6) / 0.8));
  bfFigure(250, FL, 1, { s: 1.0, kind: 'himation', head: 'helmet', beard: true, nod: true, key: 'per', pose: P({ ua1: lerp(0.1, 1.05, reach), el1: lerp(0.2, 0.5, reach), ua2: 0.25, el2: 1.0 }), spear: true });
  const b = walker(900, 560, SUB('pericles'), SUB('pericles') + 1.8, { ease: true });
  bfFigure(b.x, FL, -1, { s: 0.86, kind: 'chiton', head: 'curls', strap: BF.white, key: 'boy', pose: b.pose });
  ctx.save(); ctx.globalAlpha = fadeIn(VW('pericles', 'pericles') - 0.05, 0.3); bfLabel('PERICLES', 330, 470); ctx.restore();
  if (soc) {
    const s2 = walker(1350, 900, SUB('socrates'), SUB('socrates') + 1.6, { ease: true, rate: 5 });
    bfFigure(s2.x, FL, -1, { s: 0.95, kind: 'himation', head: 'bald', beard: true, nod: true, key: 'soc', pose: { ...s2.pose, ua1: 0.5, el1: 0.6 }, hold: (wr) => { ctx.fillStyle = BF.black; ctx.fillRect(wr[0] - 4, wr[1] - 30, 9, 560); } });
    ctx.save(); ctx.globalAlpha = fadeIn(VW('socrates', "socrates'") - 0.05, 0.3); bfLabel('SOCRATES', 900, 480); ctx.restore();
    const w1 = fadeIn(VW('socrates', 'wealthy') - 0.05, 0.3);
    for (let i = 0; i < 6; i++) { const a = clamp(w1 * 6 - i); if (a > 0) { const cx = 470 + i * 40, cy = FL - 14 - (1 - EZ.back(a)) * 60; bfDot(cx, cy, 16, BF.gold); bfInc(ellipsePts(cx, cy, 10, 10, 0, 12), { closed: true, c: BF.black, w: 1.4, key: 'cn' + i }); } }
  }
}
function sceneSicily() {
  setCam(panCam('sicily', 520, 580, 1.0, 1.04));
  bfTemple(860, 700, 240, 90, { a: 0.9 });
  // the Assembly on the right, facing left; he speaks from the platform at left
  const tc = VW('sicily', 'conquest') - 0.3;
  const R = RNG('asm');
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
    const x = 560 + i * 150 + r * 75, up = clamp((TT - tc - i * 0.1 - r * 0.15) / 0.5);
    const hd = ['curls', 'bald', 'curls', 'helmet'][(i + r) % 4];
    bfFigure(x, FL - r * 30, -1, { s: r ? 0.82 : 0.9, kind: 'himation', head: hd, beard: (i + r) % 2 === 0, nod: true, key: 'as' + r + i, pose: blend(P({ ua1: 0.3, el1: 0.9 }), POSE.raise, up) });
  }
  bfFill([[60, FL], [420, FL], [400, FL - 170], [80, FL - 170]], BF.black, { key: 'bema' }); for (let i = 0; i < 3; i++) bfInc([[80, FL - 40 - i * 45], [400, FL - 40 - i * 45]], { w: 1.6, key: 'bml' + i });
  const arm = EZ.o2(clamp((TT - VW('sicily', 'sold')) / 0.6));
  bfFigure(250, FL - 170, 1, { s: 0.9, kind: 'chiton', head: 'curls', strap: BF.white, key: 'alS', pose: blend(BF_REST, { ua1: 1.9 + 0.15 * Math.sin(TT * 3), el1: 0.2 }, arm) });
  const dr = fadeIn(VW('sicily', 'sicily') - 0.2, 0.5);
  if (dr > 0) { ctx.save(); ctx.globalAlpha = dr; const Q = bfRough(MAPB.sicily.map(([a, b]) => [700 + (a - 14) * 120, 470 + (38.3 - b) * 150]), 'skys', 3); bfFill(Q, BF.black, { key: 'skys', raw: true }); bfInc(Q, { closed: true, w: 1.6, raw: true }); for (let i = 0; i < 4; i++) bfInc([[600 + i * 60, 520], [610 + i * 60, 506], [620 + i * 60, 520]], { w: 1.6 }); bfLabel('SICILY', 700, 380, 34); ctx.restore(); }
}
function sceneFleet() {
  setCam(panCam('fleet', 520, 600, 1.0, 1.03));
  bfCity(-300, 300, 1150, 160, 'fc', { temple: 0 });
  const more = fadeIn(VW('fleet', 'fleet') - 0.25, 0.5);
  if (more > 0) { ctx.save(); ctx.globalAlpha = more; bfShip(900 + TT * 8, 1150, 0.4, { key: 's2', ph: 1 }); bfShip(1250 + TT * 8, 1190, 0.45, { key: 's3', ph: 2 }); ctx.restore(); }
  bfWaveBand(1360, 'fw');
  const x = 430 + (TT - SUB('fleet')) * 50;
  bfShip(x, 1350, 0.8, { key: 's1' });
  bfFigure(x - 270, 1310, 1, { s: 0.3, kind: 'chiton', head: 'curls', strap: BF.white, key: 'cmd', pose: P({ ua1: 2.2, el1: 0.3 }) });
}
function sceneHerms() {
  const tSm = VW('herms', 'smashed') - 0.05, tBl = VW('herms', 'blame') - 0.3;
  if (TT < tBl) {
    const sh = TT > tSm ? Math.exp(-(TT - tSm) * 6) * 10 : 0;
    const c = panCam('herms', 480, 620, 1.0, 1.05); setCam({ ...c, cx: c.cx + sh * Math.sin(TT * 80) });
    bfMoon(860, 450, 50); bfStars(9, 'hs');
    for (let i = 0; i < 3; i++) bfHerm(300 + i * 300, FL, 1.0, clamp((TT - tSm - i * 0.3) / 0.8), 'hm' + i);
    // a cloaked man with a hammer walks along the row and strikes
    const v = walker(-200, 120, SUB('herms') + 0.3, tSm - 0.2, { rate: 5 }), sw = clamp((TT - tSm + 0.3) / 0.3), back = TT > tSm + 0.2 ? clamp((TT - tSm - 0.2) / 0.3) : 0;
    const vx = v.x + clamp((TT - tSm) / 1.0) * 600;
    bfFigure(vx, FL, 1, { s: 0.95, kind: 'himation', head: 'bald', key: 'vand', pose: TT < tSm - 0.2 ? v.pose : P({ ua1: lerp(2.8, 1.4, sw) + back * 1.2, el1: 0.1 }), hold: (wr, an) => { ctx.save(); ctx.translate(wr[0], wr[1]); ctx.rotate(-an); ctx.fillStyle = BF.black; ctx.fillRect(-5, 0, 10, 150); ctx.fillRect(-30, 140, 60, 36); ctx.restore(); } });
  } else {
    setCam(panCam('herms', 540, 540, 1.0, 1.06));
    bfMoon(860, 450, 50);
    bfFigure(540, FL, 1, { s: 1.0, kind: 'chiton', head: 'curls', strap: BF.white, key: 'alH', pose: P({ ua1: -0.3, el1: 1.8, ua2: 0.2, el2: 1.6 }), headTilt: 0.12 });
    [[150, 1, 0], [-20, 1, 0.15], [930, -1, 0.1], [1110, -1, 0.25]].forEach(([x, d, dt], i) => { const u = EZ.back(clamp((TT - tBl - dt) / 0.4)); bfFigure(x, FL, d, { s: 0.92, kind: 'himation', head: ['bald', 'curls', 'curls', 'bald'][i], beard: true, key: 'acc' + i, pose: blend(BF_REST, POSE.point, u) }); });
  }
}
function sceneFlee() {
  const tSp = VW('flee', 'enemy') - 0.15;
  if (TT < tSp) {   // he slips away in a small boat, rowing right across the sea
    setCam(panCam('flee', 420, 760, 1.0, 1.0));
    bfMoon(200, 420, 40);
    bfCity(-400, 100, 1250, 150, 'thu');
    ctx.save(); ctx.globalAlpha = 0.85; bfShip(-100 + (TT - SUB('flee')) * 20, 1230, 0.35, { key: 'big', emblem: 'owl' }); ctx.restore();
    bfWaveBand(1400, 'flw');
    const bx = 300 + (TT - SUB('flee')) * 110;
    bfShipMiniBoat(bx, 1395);
    bfFigure(bx - 10, 1360, 1, { s: 0.45, kind: 'chiton', head: 'curls', strap: BF.white, key: 'row', pose: P({ th1: 1.3, kn1: 1.3, th2: 1.2, kn2: 1.2, drop: 205, ua1: 1.2 + 0.4 * Math.sin(TT * 4), el1: 0.3, ua2: 1.2 + 0.4 * Math.sin(TT * 4), el2: 0.3 }) });
  } else {   // Sparta: the file of red cloaks; he steps in among them and his strap turns red
    setCam(panCam('flee', 540, 600, 1.0, 1.03));
    bfTemple(560, 900, 480, 230);
    for (let i = 0; i < 3; i++) bfFigure(120 + i * 230, FL, 1, { s: 1.0, kind: 'hoplite', head: 'helmet', beard: true, crestC: BF.red, cloak: BF.red, pose: bfWalkPose(TT * 6 + i * 0.7, 0.8), shield: 'lambda', spear: true, key: 'sp' + i });
    const red = clamp((TT - VW('flee', 'sparta') + 0.1) / 0.5), a = walker(1250, 850, tSp, tSp + 1.2, { ease: true });
    bfFigure(a.x, FL, -1, { s: 0.98, kind: 'chiton', head: 'curls', strap: mixHex('#efe2c8', '#9a2b1f', red), cloak: red > 0.5 ? BF.red : undefined, key: 'alSp', pose: a.pose });
  }
}
function bfShipMiniBoat(x, y) { bfFill([[x - 120, y - 40], [x + 140, y - 40], [x + 110, y + 10], [x - 100, y + 10]], BF.black, { key: 'boat' }); ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 10, y - 80); ctx.lineTo(x - 60 - 40 * Math.sin(TT * 4), y + 40); ctx.stroke(); }
function sceneAdvice() {
  setCam(panCam('advice', 520, 560, 1.0, 1.05));
  // a Spartan elder seated at left, the painted board in the middle, he points at it from the right
  bfThrone(200, FL, 1, 0.95);
  bfFigure(220, FL, 1, { s: 0.95, kind: 'himation', head: 'crown', beard: true, robeC: BF.black, key: 'eph', pose: P(POSE.sit, { ua1: 1.0, el1: 0.8 }), nod: true });
  const tSy = VW('advice', 'syracuse') - 0.3, tFo = VW('advice', 'fort') - 0.3;
  const m = bfBoard(560, 620, 470, 330, [[22.4, 37.1, 15.3, 37.1, clamp((TT - tSy) / 1.2)], [22.4, 37.1, 23.8, 38.3, clamp((TT - tFo) / 1.0)]]);
  if (TT > tFo + 1.0) { const p = EZ.back(clamp((TT - tFo - 1.0) / 0.3)), fx = m.mx(23.8), fy = m.my(38.3); bfFill([[fx - 22 * p, fy], [fx + 22 * p, fy], [fx + 22 * p, fy - 30 * p], [fx - 22 * p, fy - 30 * p]], BF.red, { key: 'fortp' }); }
  ctx.save(); ctx.globalAlpha = fadeIn(tSy, 0.3); bfLabel('SYRACUSE', m.mx(15.3), m.my(37.1) + 46, 22); ctx.restore();
  ctx.save(); ctx.globalAlpha = fadeIn(tFo + 0.8, 0.3); bfLabel('DECELEA', m.mx(23.8), m.my(38.3) - 44, 22); ctx.restore();
  bfLabel('SPARTA', m.mx(22.4), m.my(37.1) + 46, 22, BF.red);
  const pt = 0.12 * Math.sin(TT * 5);
  bfFigure(900, FL, -1, { s: 0.95, kind: 'chiton', head: 'curls', strap: BF.red, cloak: BF.red, key: 'alA', pose: P(POSE.point, { ua1: 1.85 + pt }) });
}
function sceneQueen() {
  setCam(panCam('queen', 520, 580, 1.0, 1.05));
  const tW = VW('queen', 'wife') - 0.3, tK = VW('queen', 'king') + 0.05, fall = EZ.i2(clamp((TT - tK) / 0.5));
  bfThrone(180, FL, 1, 0.95);
  bfFigure(200, FL, 1, { s: 0.95, kind: 'himation', head: 'curls', beard: true, key: 'agis', pose: P(POSE.sit, { ua1: 0.9, el1: 1.0 }), hold: (wr) => { ctx.fillStyle = BF.black; ctx.fillRect(wr[0] - 4, wr[1] - 300, 9, 560); } });
  // the king's crown slides off as she turns away
  const cx = 230 + fall * 120, cy = FL - 205 - 500 * 0.95 + fall * 520;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(fall * 2); bfFill([[-50, 0], [-54, -50], [-30, -20], [-10, -60], [10, -22], [32, -56], [34, 0]], BF.gold, { key: 'kcr' }); ctx.restore();
  const q = walker(520, 700, tW, tW + 1.4, { ease: true, rate: 5 });
  bfFigure(q.x, FL, 1, { s: 0.92, kind: 'robe', head: 'veil', key: 'tim', pose: P(q.pose, { ua1: 0.9, el1: 0.3 }), robeC: BF.black, trim: BF.red });
  const a = walker(1250, 900, SUB('queen') + 0.2, tW, { ease: true });
  bfFigure(a.x + (TT > tW ? (q.x - 520) : 0), FL, -1, { s: 0.98, kind: 'chiton', head: 'curls', strap: BF.red, key: 'alQ', pose: TT > tW ? P(q.pose, { ua1: 1.1, el1: 0.2 }) : a.pose });
  ctx.save(); ctx.globalAlpha = fadeIn(SUB('queen') + 0.3, 0.3); bfLabel('KING AGIS', 220, 520, 34); ctx.restore();
  ctx.save(); ctx.globalAlpha = fadeIn(tW + 0.2, 0.3); bfLabel('TIMAEA', q.x, 560, 34); ctx.restore();
}
function scenePersia() {
  // the chase: Spartans run after him; the camera runs with them until the Persian gate
  const tRun = VW('persia', 'ran') - 0.4, run = (TT - SUB('persia'));
  const cx = 540 + run * 160;
  setCam({ cx, cy: 960, z: 1.0 });
  bfCity(-300, 900, 1250, 150, 'spc');
  // the Persian gate: columns with bull capitals, the winged disc in gold
  const gx = 1500; bfFill([[gx - 260, FL], [gx + 300, FL], [gx + 300, FL - 40], [gx - 260, FL - 40]], BF.black, { key: 'gst' });
  for (let i = 0; i < 4; i++) { const x = gx - 200 + i * 150; bfFill([[x - 16, FL - 40], [x + 16, FL - 40], [x + 14, 820], [x - 14, 820]], BF.black, { key: 'gc' + i }); bfFill([[x - 50, 820], [x + 50, 820], [x + 40, 780], [x - 40, 780]], BF.black, { key: 'gcap' + i }); }
  bfFill([[gx - 260, 780], [gx + 300, 780], [gx + 300, 740], [gx - 260, 740]], BF.black, { key: 'gar' });
  bfShield(gx + 20, 640, 90, 'disc', { key: 'gds' });
  const ax = 760 + run * 175;
  bfFigure(ax, FL, 1, { s: 0.95, kind: 'chiton', head: 'curls', strap: TT > tRun + 1 ? BF.gold : BF.red, key: 'alP', pose: bfWalkPose(run * 9, 1, 1) });
  for (let i = 0; i < 2; i++) bfFigure(ax - 420 - i * 260 + Math.max(0, run - 1.5) * -60, FL, 1, { s: 0.95, kind: 'hoplite', head: 'helmet', crestC: BF.red, cloak: BF.red, beard: true, key: 'ch' + i, pose: bfWalkPose(run * 9 + i, 1, 1), spear: true });
  if (TT > VW('persia', 'persia') - 0.2) { ctx.save(); ctx.globalAlpha = fadeIn(VW('persia', 'persia') - 0.2, 0.3); bfLabel('PERSIA', cx, 520, 50, BF.gold); ctx.restore(); }
}
function sceneGold() {
  setCam(panCam('gold', 520, 560, 1.0, 1.05));
  // the satrap enthroned at right, facing left; he stands at left with the balance; a purse swings over the Athenian pan
  bfThrone(900, FL, -1, 1.0);
  bfFigure(880, FL, -1, { s: 1.0, kind: 'robe', head: 'tiara', beard: true, trim: BF.gold, robeC: BF.black, key: 'sat', pose: P(POSE.sit, { ua1: 1.4, el1: 0.3 }), nod: true });
  const tilt = 0.25 * Math.sin((TT - VW('gold', 'played')) * 2.4) * fadeIn(VW('gold', 'played') - 0.2, 0.4);
  const bx = 470, by = 760, L = 230, ends = [-1, 1].map((d) => [bx + d * L * Math.cos(tilt), by + d * L * Math.sin(tilt)]);
  bfFill([[bx - 6, by], [bx + 6, by], [bx + 6, FL - 300], [bx - 6, FL - 300]], BF.black, { key: 'bpo' });
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...ends[0]); ctx.lineTo(...ends[1]); ctx.stroke(); ctx.restore(); bfDot(bx, by, 12, BF.black);
  ends.forEach(([ex, ey], i) => { const py = ey + 180; ctx.strokeStyle = BF.black; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 60, py); ctx.moveTo(ex, ey); ctx.lineTo(ex + 60, py); ctx.stroke();
    bfFill([[ex - 80, py], [ex + 80, py], [ex + 54, py + 24], [ex - 54, py + 24]], BF.black, { key: 'pan' + i });
    bfFigure(ex, py, 1, { s: 0.2, kind: 'hoplite', head: 'helmet', shield: i ? 'lambda' : 'owl', crestC: i ? BF.red : BF.black, key: 'mini' + i }); });
  bfFigure(250, FL, 1, { s: 0.9, kind: 'chiton', head: 'curls', strap: BF.gold, key: 'alG', pose: P({ ua1: 2.0, el1: 0.35 }) });
  const gd = fadeIn(VW('gold', 'dangled') - 0.2, 0.4);
  if (gd > 0) { const [ex, ey] = ends[0], sw = 0.25 * Math.sin(TT * 2.2), top = [ex + 20, 400], len = lerp(80, 300, EZ.o3(gd)), px = top[0] + Math.sin(sw) * len, py = top[1] + Math.cos(sw) * len;
    ctx.strokeStyle = BF.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...top); ctx.lineTo(px, py); ctx.stroke();
    bfFill([[px - 34, py + 8], [px - 44, py + 50], [px - 26, py + 78], [px + 26, py + 78], [px + 44, py + 50], [px + 34, py + 8], [px + 12, py], [px - 12, py]], BF.gold, { key: 'purse' });
    bfInc([[px - 30, py + 14], [px + 30, py + 14]], { c: BF.black, w: 2, key: 'pursel' }); }
}
function sceneGeneral() {
  setCam(panCam('general', 520, 580, 1.0, 1.04));
  const tGen = VW('general', 'made') - 0.2, lose = 1 - fadeIn(tGen, 0.8) * 0.6;
  for (let i = 0; i < 3; i++) bfSmoke(200 + i * 350, 900, lose, 'gs' + i, 6);
  bfTemple(860, 700, 240, 90, { a: 0.9 });
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
    const x = 560 + i * 150 + r * 75, up = clamp((TT - tGen - i * 0.08 - r * 0.12) / 0.5), wave = up > 0.9 ? 0.2 * Math.sin(TT * 7 + i) : 0;
    bfFigure(x, FL - r * 30, -1, { s: r ? 0.82 : 0.9, kind: 'himation', head: ['curls', 'bald', 'helmet', 'curls'][(i + r) % 4], beard: (i + r) % 2 === 1, key: 'as2' + r + i, pose: blend(P({ ua1: 0.2, el1: 1.0 }), { ua1: 2.7 + wave, el1: 0.1 }, up), headTilt: -0.1 * (1 - up) });
  }
  bfFill([[60, FL], [420, FL], [400, FL - 170], [80, FL - 170]], BF.black, { key: 'bema2' });
  const gen = fadeIn(tGen + 0.2, 0.5);
  bfFigure(250, FL - 170, 1, { s: 0.92, kind: 'hoplite', head: gen > 0.5 ? 'helmet' : 'curls', beard: gen > 0.5, strap: BF.white, key: 'alGn', shield: gen > 0.5 ? 'owl' : undefined, spear: gen > 0.5, pose: P({ ua1: 0.3 }) });
}
function sceneHero() {
  setCam(panCam('hero', 480, 620, 1.0, 1.03));
  const bt = [VW('hero', 'battle'), VW('hero', 'after'), VW('hero', 'battle', 2)];
  bt.forEach((t, i) => { const p = EZ.back(clamp((TT - t + 0.05) / 0.3)); if (p <= 0) return; const x = 300 + i * 260, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    for (let j = 0; j < 14; j++) { const d = j < 7 ? -1 : 1, aa = Math.PI / 2 + d * (0.35 + (j % 7) * 0.32); bfFill(ellipsePts(Math.cos(aa) * 70, Math.sin(aa) * 70, 18, 8, aa + d * 1.2, 10), BF.black, { key: 'lr' + i + j, raw: true }); }
    bfShield(0, 0, 40, 'lambda', { key: 'trp' + i }); ctx.restore(); });
  // the harbour: a quay at right with people waving; the ship comes in with garlands
  bfFill([[700, 1250], [1400, 1250], [1400, 1380], [700, 1380]], BF.black, { key: 'quay' });
  bfTemple(1050, 1250, 260, 100);
  const tH = VW('hero', 'home') - 0.4;
  for (let i = 0; i < 4; i++) { const up = clamp((TT - tH - i * 0.1) / 0.4), wv = 0.25 * Math.sin(TT * 7 + i); bfFigure(760 + i * 100, 1250, -1, { s: 0.42, kind: 'himation', head: i % 2 ? 'curls' : 'veil', key: 'qp' + i, pose: blend(BF_REST, { ua1: 2.6 + wv, el1: 0.2 }, up) }); }
  bfWaveBand(1400, 'hw');
  const x = springMove(SUB('hero'), 100, 420, SPRING.heavy);
  bfShip(x, 1390, 0.75, { key: 'hs', garland: true });
  bfFigure(x - 250, 1352, 1, { s: 0.3, kind: 'hoplite', head: 'helmet', key: 'hcm', pose: P({ ua1: 2.5, el1: 0.2 }) });
}
function sceneFire() {
  setCam(panCam('fire', 520, 560, 1.0, 1.06));
  const tSet = VW('fire', 'fire') - 0.3, tOut = VW('fire', 'ran') - 0.15, tArr = VW('fire', 'shot') - 0.25, burn = clamp((TT - tSet) / 1.5);
  bfMoon(900, 420, 44);
  bfSmoke(680, 800, burn, 'fs', 7);
  // the house
  const hx = 700;
  bfFill([[hx - 230, FL], [hx + 230, FL], [hx + 230, FL - 300], [hx - 230, FL - 300]], BF.black, { key: 'hw' });
  bfFill([[hx - 270, FL - 290], [hx + 270, FL - 290], [hx, FL - 450]], BF.black, { key: 'hr' });
  for (let i = 0; i < 6; i++) bfInc([[hx - 220, FL - 40 - i * 45], [hx + 220, FL - 40 - i * 45]], { w: 1.3, key: 'hbl' + i });
  bfFill([[hx - 60, FL], [hx + 60, FL], [hx + 60, FL - 190], [hx - 60, FL - 190]], burn > 0 ? BF.gold : BF.ground, { key: 'hd', sep: 0 });
  bfFlames(hx, FL - 300, 520, 360 * (0.5 + burn * 0.5), burn, 'roof');
  bfFlames(hx - 160, FL, 150, 220, burn * 0.8, 'f1'); bfFlames(hx + 170, FL, 150, 250, burn * 0.8, 'f2');
  // he bursts out of the door, dagger high, running left; two archers kneel at left and shoot; he falls
  const out = clamp((TT - tOut) / 1.0), fall = EZ.i2(clamp((TT - tArr - 0.7) / 0.5));
  if (TT > tOut) bfFigure(lerp(hx, 420, EZ.o2(out)), FL, -1, { s: 0.9, kind: 'chiton', head: 'curls', key: 'alF', pose: fall > 0 ? P({ ua1: 2.0, el1: 0.4, th1: 0.5, kn1: 0.8 }) : P(bfWalkPose(TT * 9, 1, 1), { ua1: 2.6, el1: 0.3 }), rot: -fall * 1.45, hold: (wr, an) => { ctx.save(); ctx.translate(wr[0], wr[1]); ctx.rotate(-an + Math.PI); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(0, 110); ctx.fill(); ctx.restore(); } });
  for (let i = 0; i < 2; i++) { const show = fadeIn(tArr - 0.6, 0.3); if (show <= 0) continue; const x = 60 + i * 120;
    ctx.save(); ctx.globalAlpha = show; bfFigure(x, FL, 1, { s: 0.75, kind: 'chiton', head: 'tiara', beard: true, key: 'arc' + i, pose: P(POSE.kneel, { ua1: 1.6, el1: 0.0, ua2: 1.55, el2: 0.5 }) });
    ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 230, FL - 450, 90, -1.2, 1.2); ctx.stroke(); ctx.restore(); }
  for (let i = 0; i < 8; i++) { const t0 = tArr + i * 0.13, u = clamp((TT - t0) / 0.35); if (u <= 0 || u >= 1) continue; const R = RNG('arw', i), x0 = 320, y0 = FL - 450 + R.r(-30, 30), x1 = lerp(hx, 420, EZ.o2(out)), y1 = FL - 500 + R.r(-80, 80), x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 40;
    ctx.strokeStyle = BF.black; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 70, y); ctx.lineTo(x, y); ctx.stroke(); bfFill([[x + 16, y], [x, y - 8], [x, y + 8]], BF.black, { raw: true, sep: 0 }); }
}
function sceneName() {
  // a great profile head, like the reference's close-ups; the name in white capitals; three shields
  setCam(panCam('name', 540, 540, 1.06, 1.0));
  ctx.save(); ctx.translate(460, 1250); ctx.scale(4.2, 4.2);
  bfFill([[-60, 80], [-20, 30], [40, 30], [90, 120], [-90, 120]], BF.black, { key: 'bust' });
  bfHead({ head: 'wreath' }, 'big');
  bfInc([[-40, 70], [60, 110]], { c: BF.white, w: 3, key: 'bstrap' });
  ctx.restore();
  [['owl', 200, 1470], ['lambda', 540, 1470], ['disc', 880, 1470]].forEach(([e, x, y], i) => { const p = EZ.back(clamp((TT - (VW('name', 'switched') + i * 0.35)) / 0.35)); if (p > 0) bfShield(x, y, 95 * p, e, { key: 'ns' + i }); });
  const nm = 'ALCIBIADES', k = clamp((TT - VW('name', 'alcibiades') + 0.1) / 0.9);
  if (k > 0) bfOverlay(() => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `96px ${BF_CAPS}`; ctx.textAlign = 'left'; ctx.letterSpacing = '6px';
    const full = ctx.measureText(nm).width, x0 = 540 - full / 2, n = Math.ceil(k * nm.length); ctx.shadowColor = 'rgba(20,6,10,0.8)'; ctx.shadowBlur = 12; ctx.fillStyle = BF.white; ctx.fillText(nm.slice(0, n), x0, 420); ctx.restore(); });
}
function sceneSign() {
  setCam({ cx: 540, cy: 960, z: 1 });
  const k = springMove(SIGN_T, 0, 1, SPRING.heavy), bob = 10 * Math.sin((TT - SIGN_T) * 1.6), sz = 460 * k;
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(540, 760 + bob); ctx.rotate(0.03 * Math.sin((TT - SIGN_T) * 1.2)); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  bfOverlay(() => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = EZ.o2(clamp((TT - SIGN_T - 0.4) / 0.8)); bfLogo('AMPHORUS', 540, 1180, 100); ctx.restore(); });
}
function bfLogo(str, x, y, size) {
  ctx.save(); ctx.font = `${size}px ${BF_CAPS}`; ctx.textAlign = 'center'; ctx.letterSpacing = size * 0.12 + 'px';
  const w = ctx.measureText(str).width;
  ctx.fillStyle = 'rgba(30,10,5,0.6)'; ctx.fillText(str, x + 4, y + 6);
  const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.1); g.addColorStop(0, '#f6dd94'); g.addColorStop(0.45, '#d6a64a'); g.addColorStop(0.55, '#a8761f'); g.addColorStop(1, '#e3bd68');
  ctx.fillStyle = g; ctx.fillText(str, x, y); ctx.lineWidth = 2; ctx.strokeStyle = '#3a2208'; ctx.strokeText(str, x, y);
  const sx = x - w / 2 + mod((TT - SIGN_T) * 0.6, 1.6) * w, s = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
  s.addColorStop(0, 'rgba(255,250,220,0)'); s.addColorStop(0.5, 'rgba(255,250,220,0.8)'); s.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = s; ctx.fillText(str, x, y); ctx.restore();
}

const SCENES = { hook: sceneHook, pericles: scenePericles, socrates: scenePericles, sicily: sceneSicily, fleet: sceneFleet, herms: sceneHerms, flee: sceneFlee, advice: sceneAdvice, queen: sceneQueen, persia: scenePersia, gold: sceneGold, general: sceneGeneral, hero: sceneHero, fire: sceneFire, name: sceneName, sign: sceneSign };
function sceneStage() {
  bfGround();
  const id = shotNow();
  ctx.save(); SCENES[id](); ctx.restore();
  bfWear(0.3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bfOverlay(() => bfFrame());
  drawCaptions();
}
