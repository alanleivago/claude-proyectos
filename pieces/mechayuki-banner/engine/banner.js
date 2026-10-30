// banner.js — YouTube banner for MECHAYUKI (2560x1440): the Mega Man Legends 2 STATUS screen, adapted to the channel.
// Same approach as pieces/zombie-02-window/engine/banner.js: 3D bits (the v1 Mechayuki portrait, the item icons) are
// rendered small with the episode engine (shots.js copy -> digger-03-lock assets), the menu is drawn on a 640x360 2D
// canvas and the whole thing is scaled x4 nearest (PS1 pixel). YouTube zones at 640x360:
//   TV = everything; desktop = band y 127-233 (full width); tablet = x 88-552 of that band;
//   mobile / safe zone (1546x423) = x 127-513, y 127-233  -> name, face, handle and tagline live here.
// Output: window.OUT = { mechayuki_banner_2560x1440, parts } (dataURL). Render: node banner.mjs <outdir> [query]
import { loadAll, LIB } from './shots.js';
import { G, NARROW, textWidth, bitText } from './pixfont.js';
await loadAll();
const { THREE, zero, basic, lam, box, mesh, cvs, model, fridgeWhole } = LIB;
const QS = new URLSearchParams(location.search);
const V2 = QS.get('layout') === '2';   // v2 (2026-10-29): items + SUBSCRIBE! in the safe zone
const W = 640, H = 360, K = 4;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.outputColorSpace = THREE.SRGBColorSpace;
function grab(scene, cam, w, h) {
  renderer.setSize(w, h, false); renderer.setClearColor(0x000000, 0); renderer.render(scene, cam);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(renderer.domElement, 0, 0); return cv;
}
function lights(scene) {
  scene.add(new THREE.HemisphereLight(0xf2f4ff, 0x9aa0b4, 2.1));
  const s = new THREE.DirectionalLight(0xfff4e6, 1.3); s.position.set(-2, 4, 5); scene.add(s);
}

// ---------- portrait: Mechayuki v1 (original body), smirk with the half-closed eye ----------
const PW = 64, PH = 86;
const pS = new THREE.Scene(); lights(pS);
const ch = zero(); pS.add(ch.root);
ch.root.rotation.y = Number(QS.get('pry') ?? 0.3);
ch.pose(0, [{ clip: QS.get('clip') ?? 'smirk_pose', at: -10, from: Number(QS.get('at') ?? 99), speed: 0 }], [[-99, QS.get('eyes') ?? 'smirk', QS.get('mouth') ?? 'smirk']]);
ch.root.updateMatrixWorld(true);
const headBone = ch.bone.getObjectByName(QS.get('bone') ?? 'Head');
if (!headBone) { const n = []; ch.bone.traverse((o) => { if (o.isBone) n.push(o.name); }); console.log('bones: ' + n.join(',')); }
const head = V(); headBone.getWorldPosition(head);
const camP = new THREE.PerspectiveCamera(Number(QS.get('pfov') ?? 17), PW / PH, 0.05, 20);
camP.position.set(head.x + Number(QS.get('pcx') ?? 0.05), head.y + Number(QS.get('pcy') ?? 0.1), head.z + Number(QS.get('pd') ?? 1.45));
camP.lookAt(head.x, head.y + Number(QS.get('ply') ?? 0.08), head.z); camP.updateMatrixWorld();
const portrait = grab(pS, camP, PW, PH);

// ---------- item icons: the episode artifacts + her tools, low poly, 3/4 from above ----------
function modernToilet() {   // = digger-02/03 film.js modernToilet (lid up)
  const g = new THREE.Group(), por = lam(null, 0xf6f4ee, { side: THREE.DoubleSide }), por2 = lam(null, 0xe8e6e0);
  const ped = mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.24, 10), por, 0, 0.12, 0.05, g); ped.scale.z = 1.25;
  const bowl = mesh(new THREE.LatheGeometry([[0.05, 0], [0.13, 0.05], [0.185, 0.12], [0.2, 0.17], [0.19, 0.175]].map(([r, y]) => new THREE.Vector2(r, y)), 14), por, 0, 0.23, 0.08, g); bowl.scale.z = 1.3;
  const water = mesh(new THREE.CircleGeometry(0.135, 14), basic(null, 0x3c9ce8), 0, 0.33, 0.08, g); water.rotation.x = -Math.PI / 2; water.scale.y = 1.3;
  const seat = mesh(new THREE.TorusGeometry(0.17, 0.028, 4, 16), por2, 0, 0.41, 0.08, g); seat.rotation.x = Math.PI / 2; seat.scale.y = 1.3;
  const lid = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.025, 14), por2, 0, 0.62, -0.1, g); lid.scale.z = 1.25; lid.rotation.x = -1.45;
  box(0.44, 0.36, 0.17, por, 0, 0.6, -0.2, g); box(0.47, 0.04, 0.2, por2, 0, 0.8, -0.2, g);
  box(0.06, 0.02, 0.03, basic(null, 0xb8bcc4), -0.16, 0.73, -0.1, g);
  return g;
}
const PADTEX = cvs(32, 32, (c) => {   // = digger-03 film.js PADTEX (rusty brass body, embossed plate)
  c.fillStyle = '#9a6a3a'; c.fillRect(0, 0, 32, 32);
  c.fillStyle = '#b8864a'; c.fillRect(0, 0, 32, 3); c.fillStyle = '#d8b070'; c.fillRect(4, 4, 24, 2);
  c.fillStyle = '#7a4a24'; c.fillRect(0, 28, 32, 4);
  const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  for (const [x, y, w, h] of [[2, 18, 5, 3], [24, 9, 4, 5], [12, 25, 7, 2], [27, 21, 3, 4], [6, 10, 2, 2]]) r(x, y, w, h, '#6a3a1c');
  r(9, 12, 14, 8, '#5a3a1c'); r(10, 13, 12, 6, '#c8a050'); r(11, 14, 10, 1, '#f0d890');
  for (let x = 11; x < 21; x += 3) r(x, 16, 2, 2, '#7a5a2a');
});
function padlockKey() {   // = digger-03 padlock + a steel key leaning on it
  const g = new THREE.Group();
  const sh = new THREE.Shape(); const Wd = 0.075, Hd = 0.06, rr = 0.018;
  sh.moveTo(-Wd + rr, -Hd); sh.lineTo(Wd - rr, -Hd); sh.quadraticCurveTo(Wd, -Hd, Wd, -Hd + rr); sh.lineTo(Wd, Hd - rr); sh.quadraticCurveTo(Wd, Hd, Wd - rr, Hd);
  sh.lineTo(-Wd + rr, Hd); sh.quadraticCurveTo(-Wd, Hd, -Wd, Hd - rr); sh.lineTo(-Wd, -Hd + rr); sh.quadraticCurveTo(-Wd, -Hd, -Wd + rr, -Hd);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.007, bevelSegments: 1, curveSegments: 3 });
  geo.translate(0, 0, -0.02); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + Wd) / (2 * Wd), (uv.getY(i) + Hd) / (2 * Hd));
  const body = mesh(geo, lam(PADTEX, 0xffffff), 0, Hd + 0.01, 0, g); body.material.flatShading = true;
  const steel = lam(null, 0xc8ccd4); steel.flatShading = true;
  mesh(new THREE.TorusGeometry(0.045, 0.011, 5, 10, Math.PI), steel, 0, 2 * Hd + 0.06, 0, g);
  for (const x of [-0.045, 0.045]) mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.06, 6), steel, x, 2 * Hd + 0.035, 0, g);
  mesh(new THREE.CircleGeometry(0.012, 8), basic(null, 0x0c0c0c), 0, 0.045, 0.029, g);
  box(0.008, 0.022, 0.002, basic(null, 0x0c0c0c), 0, 0.03, 0.029, g);
  box(0.004, 0.06, 0.001, basic(null, 0xfff4d0), -0.05, 0.08, 0.03, g);
  const key = new THREE.Group(); g.add(key); key.position.set(0.11, 0.04, 0.05); key.rotation.set(0, -0.3, 0.9);
  const km = lam(null, 0xe0c060); km.flatShading = true;
  const bow = mesh(new THREE.TorusGeometry(0.028, 0.01, 4, 10), km, 0, 0.11, 0, key);
  box(0.014, 0.1, 0.012, km, 0, 0.04, 0, key); box(0.026, 0.012, 0.012, km, 0.013, 0.0, 0, key); box(0.02, 0.012, 0.012, km, 0.01, 0.022, 0, key);
  bow.rotation.y = 0;
  return g;
}
function detectorIcon() {   // the homemade metal detector of ep03: pole, yellow coil, red control box, antenna, LED
  const g = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.9, 6), lam(null, 0x6a6e78), 0, 0.5, 0, g);
  const coil = new THREE.Group(); coil.position.set(0, 0.05, 0.0); g.add(coil);
  const ring = mesh(new THREE.TorusGeometry(0.12, 0.022, 4, 14), lam(null, 0x2a2e38), 0, 0, 0, coil); ring.rotation.x = Math.PI / 2;
  const disc = mesh(new THREE.CircleGeometry(0.11, 12), basic(null, 0xe8c040, { side: THREE.DoubleSide }), 0, 0.004, 0, coil); disc.rotation.x = -Math.PI / 2;
  box(0.08, 0.06, 0.11, lam(null, 0xc83030), 0, 0.72, 0.04, g);
  mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.22, 4), lam(null, 0x9aa0aa), 0.02, 0.86, 0.04, g).rotation.z = 0.25;
  mesh(new THREE.SphereGeometry(0.016, 6, 4), basic(null, 0x40ff60), -0.008, 0.97, 0.04, g);
  box(0.03, 0.12, 0.03, lam(null, 0x2a2e38), 0, 0.96, -0.02, g);   // grip
  g.rotation.z = -0.5; return g;
}
function iconShot(obj, w, h, { yaw = 0.6, tilt = 0.45, pad = 1.0, lift = 0 } = {}) {
  const sc = new THREE.Scene(); lights(sc); const piv = new THREE.Group(); piv.add(obj); sc.add(piv); piv.rotation.y = yaw; piv.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(piv), c = b.getCenter(V()), r = b.getSize(V()).length() / 2 * pad;
  const cam = new THREE.OrthographicCamera(-r * w / h, r * w / h, r, -r, 0.01, 50);
  cam.position.set(c.x, c.y + lift + 6 * Math.sin(tilt), c.z + 6 * Math.cos(tilt)); cam.lookAt(c.x, c.y + lift, c.z); cam.updateMatrixWorld();
  return grab(sc, cam, w, h);
}
const IW = 60, IH = 52;
const shovel = model('shovel', 1.0); shovel.rotation.z = 0.7;
const IW2 = 48, IH2 = 35;
const ITEMS2 = V2 ? [
  ['FRIDGE', '001', iconShot(fridgeWhole(), IW2, IH2, { yaw: 0.5, pad: 0.86 })],
  ['TOILET', '002', iconShot(modernToilet(), IW2, IH2, { yaw: 0.6, pad: 0.76 })],
  ['PADLOCK', '003', iconShot(padlockKey(), IW2, IH2, { yaw: 0.25, tilt: 0.25, pad: 0.72 })],
  ['SHOVEL', 'TOOL', iconShot((() => { const m = model('shovel', 1.0); m.rotation.z = 1.05; return m; })(), IW2, IH2, { yaw: 0.3, tilt: 0.3, pad: 0.5 })],
  ['DETECTOR', 'TOOL', iconShot((() => { const d = detectorIcon(); d.rotation.z = -1.0; return d; })(), IW2, IH2, { yaw: 0.3, tilt: 0.3, pad: 0.5 })],
] : [];
const ITEMS = [
  ['FRIDGE', '001', iconShot(fridgeWhole(), IW, IH, { yaw: 0.5, pad: 0.82 })],
  ['TOILET', '002', iconShot(modernToilet(), IW, IH, { yaw: 0.6, pad: 0.82 })],
  ['PADLOCK', '003', iconShot(padlockKey(), IW, IH, { yaw: 0.25, tilt: 0.25, pad: 0.8 })],
  ['SHOVEL', 'TOOL', iconShot(shovel, IW, IH, { yaw: 0.3, tilt: 0.3, pad: 0.62 })],
  ['DETECTOR', 'TOOL', iconShot(detectorIcon(), IW, IH, { yaw: 0.3, tilt: 0.3, pad: 0.62 })],
];

// ---------- 2D: palette + drawing kit (MML2 status menu) ----------
const P = {
  bg: '#6b6fd6', pat: '#5d61c7', patHi: '#7a7ee2', mint: '#a8e6a8', mintHi: '#dcfad4', mintLo: '#78bf86', teal: '#1f4a52',
  bar: '#2e4a55', barHi: '#5c8892', barLo: '#142a30', orange: '#f08a28', red: '#d8303a', redHi: '#ff8a78', redLo: '#6a0c16',
  purple: '#2a1f55', purpleHi: '#5a4aa0', green: '#4cd060', greenLo: '#14602a', greenHi: '#d4ffd0', ink: '#141838',
  gold: '#f6c832', goldHi: '#fff0a0', goldLo: '#7a4a08', slot: '#244049', slotLn: '#2f5560',
};
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
c.imageSmoothingEnabled = false;
const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const px = (x, y, col) => R(Math.round(x), Math.round(y), 1, 1, col);
// chamfered shape, row by row (crisp 45-degree stairs, no anti-aliasing)
function cham(x, y, w, h, k, col) { c.fillStyle = col; for (let r = 0; r < h; r++) { const i = Math.max(0, k - r, k - (h - 1 - r)); c.fillRect(x + i, y + r, w - 2 * i, 1); } }
function panel(x, y, w, h, { k = 7, b = 3, fill = P.mint, ticks = 'bottom', shadow = true } = {}) {
  if (shadow) cham(x + 3, y + 3, w, h, k, 'rgba(24,20,90,0.45)');
  cham(x, y, w, h, k, P.teal);
  const ix = x + b, iy = y + b, iw = w - 2 * b, ih = h - 2 * b, ik = Math.max(1, k - 2);
  cham(ix, iy, iw, ih, ik, P.mintHi); cham(ix + 1, iy + 1, iw - 1, ih - 1, ik, P.mintLo); cham(ix + 1, iy + 1, iw - 2, ih - 2, ik, fill);
  if (ticks === 'bottom') for (let t = 0; t < 8; t++) R(x + w - k - 8 - t * 5, y + h - b - 5, 2, 3, P.orange);
  if (ticks === 'left') for (let t = 0; t < 6; t++) R(x + b + 2, y + k + 5 + t * 5, 3, 2, P.orange);
  if (ticks === 'top') for (let t = 0; t < 8; t++) R(x + k + 8 + t * 5, y + b + 2, 2, 3, P.orange);
}
function bar(x, y, w, h, { col = P.bar, hi = P.barHi, lo = P.barLo, slope = 0.55, notch = true } = {}) {   // dark teal bar, pointed + notched ends
  const m = (h - 1) / 2;
  for (let r = 0; r < h; r++) { const i = Math.round(Math.abs(r - m) * slope); R(x + i, y + r, w - 2 * i, 1, r === 0 ? hi : r === h - 1 ? lo : col); }
  if (notch) for (const nx of [x + Math.round(m * slope) + 3, x + w - Math.round(m * slope) - 5]) R(nx, y + 2, 2, h - 4, lo);   // the notches
}
function disc(cx, cy, r, col) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.8) R(cx + x, cy + y, 1, 1, col); }
function rivet(cx, cy, r = 3) { disc(cx, cy, r + 1, P.greenLo); disc(cx, cy, r, P.green); px(cx - 1, cy - 1, P.greenHi); }
function boltCircle(cx, cy, r = 7) {   // the green bolt heads either side of STATUS
  disc(cx + 1, cy + 2, r + 1, 'rgba(20,16,80,0.5)'); disc(cx, cy, r + 1, P.ink); disc(cx, cy, r, P.greenLo); disc(cx, cy, r - 1, P.green);
  R(cx - r + 2, cy - 1, 2 * r - 3, 2, P.greenLo);   // screwdriver slot
  px(cx - r + 3, cy - r + 3, P.greenHi); px(cx - r + 4, cy - r + 3, P.greenHi); px(cx - r + 3, cy - r + 4, P.greenHi);
}
function zcoin(cx, cy, r = 6) {
  disc(cx, cy, r + 1, P.goldLo); disc(cx, cy, r, P.gold); disc(cx + 1, cy + 1, r - 2, '#e0a820'); disc(cx, cy, r - 2, P.gold);
  bitText(c, 'Z', cx + 1, cy + 1, 1, P.goldLo, { outline: null }); px(cx - r + 2, cy - r + 2, P.goldHi);
}
// chunky title font: the 5x7 glyphs with columns 0/2/4 doubled (2-px verticals, 1-px horizontals) -> 8 wide
const BOLDW = [2, 1, 2, 1, 2];
function boldGlyph(ch) {
  const g = G[ch] || G['?'], cols = NARROW[ch] ? [1, 2, 3] : [0, 1, 2, 3, 4], cells = []; let x = 0;
  for (const col of cols) { const wd = BOLDW[col]; for (let r = 0; r < 7; r++) if (g[r][col] === '#') for (let k = 0; k < wd; k++) cells.push([x + k, r]); x += wd; }
  return { cells, w: x };
}
const boldWidth = (s, sc) => { let w = 0; for (const ch of s.toUpperCase()) w += (boldGlyph(ch).w + 1) * sc; return w - sc; };
function bold(s, x, y, sc, fg, { outline = P.ink, ow = 1, shadow = null, fg2 = null, align = 'center', gap = 0 } = {}) {
  s = s.toUpperCase(); const w = boldWidth(s, sc) + gap * (s.length - 1); const X = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x), Y = Math.round(y - 7 * sc / 2);
  const cells = []; let cx = X;
  for (const ch of s) { const g = boldGlyph(ch); for (const [gx, gy] of g.cells) cells.push([cx + gx * sc, Y + gy * sc, gy]); cx += (g.w + 1) * sc + gap; }
  if (shadow) { c.fillStyle = shadow; for (const [a, b] of cells) c.fillRect(a - ow + sc, b - ow + sc, sc + 2 * ow, sc + 2 * ow); }
  if (outline) { c.fillStyle = outline; for (const [a, b] of cells) c.fillRect(a - ow, b - ow, sc + 2 * ow, sc + 2 * ow); }
  for (const [a, b, gy] of cells) { c.fillStyle = fg2 && gy >= 4 ? fg2 : fg; c.fillRect(a, b, sc, sc); }
  return [X, Y, w, 7 * sc];
}
const text = (s, x, y, sc, fg, o = {}) => bitText(c, s, x + (o.align === 'left' ? textWidth(s, sc) / 2 : 0), y, sc, fg, { outline: null, ...o });

// ---------- background: lavender with a diagonal pattern of faint machine parts ----------
R(0, 0, W, H, P.bg);
function gear(cx, cy, r, col) {
  for (let y = -r - 2; y <= r + 2; y++) for (let x = -r - 2; x <= r + 2; x++) {
    const d = Math.hypot(x, y), a = Math.atan2(y, x);
    if ((d <= r - 1 && d >= r * 0.38) || (d <= r + 1.6 && d > r - 1.5 && Math.cos(8 * a) > 0.25)) R(cx + x, cy + y, 1, 1, col);
  }
}
function hexBolt(cx, cy, r, col) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const ax = Math.abs(x), ay = Math.abs(y);
    if (Math.max(ax * 0.866 + ay * 0.5, ay) <= r * 0.87 && Math.hypot(x, y) > r * 0.36) R(cx + x, cy + y, 1, 1, col);
  }
}
function wrench(cx, cy, len, col) {   // diagonal, open jaw top-right, ring bottom-left
  for (let t = -len; t <= len; t++) R(Math.round(cx + t * 0.707), Math.round(cy - t * 0.707), 2, 2, col);
  const jx = cx + len * 0.707 + 2, jy = cy - len * 0.707 - 2, rx = cx - len * 0.707 - 1, ry = cy + len * 0.707 + 1;
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) {
    const d = Math.hypot(x, y);
    if (d <= 4.2 && d >= 1.8 && !(x - y > 1.5 && x + y > -2 && x + y < 2.5)) R(Math.round(jx + x), Math.round(jy + y), 1, 1, col);
    if (d <= 3.4 && d >= 1.5) R(Math.round(rx + x), Math.round(ry + y), 1, 1, col);
  }
}
for (let j = -1; j < H / 26 + 1; j++) for (let i = -1; i < W / 52 + 1; i++) {
  const x = i * 52 + (j % 2 ? 26 : 0) + 8, y = j * 26 + 10, k = ((i + j * 2) % 3 + 3) % 3;
  if (k === 0) gear(x, y, 6, P.pat); else if (k === 1) hexBolt(x, y, 5, P.pat); else wrench(x, y, 6, P.pat);
}
// faint diagonal light bands (the menu's sheen)
for (let y = 0; y < H; y++) for (let b = -H; b < W; b += 96) R(b + y * 0.5 | 0, y, 3, 1, 'rgba(255,255,255,0.05)');

// ================= safe zone (mobile + everything): x 127-513, y 127-233 =================
const SX = 131, SY = 130, SR = 509, SB = 230;

// portrait panel (right of the safe zone), with the vertical energy capsule
{ const w = 96, x = SR - w, y = SY, h = SB - SY;
  panel(x, y, w, h, { k: 8, ticks: 'left' });
  const fx = x + 9, fy = y + 7;
  R(fx - 2, fy - 2, PW + 4, PH + 4, P.teal);
  { const g = c.createLinearGradient(0, fy, 0, fy + PH); g.addColorStop(0, '#b8e8f0'); g.addColorStop(1, '#5c9cc8'); c.fillStyle = g; c.fillRect(fx, fy, PW, PH); }
  for (let yy = fy + 3; yy < fy + PH; yy += 6) R(fx, yy, PW, 1, 'rgba(255,255,255,0.18)');
  c.drawImage(portrait, fx, fy);
  R(fx, fy, PW, 1, 'rgba(255,255,255,0.35)');
  // energy capsule
  const ex = fx + PW + 5, ey = fy, eh = PH, ew = 11;
  cham(ex - 1, ey - 1, ew + 2, eh + 2, 4, P.teal); cham(ex, ey, ew, eh, 3, '#0e2228');
  const segs = 12; for (let s = 0; s < segs; s++) { const sy = ey + eh - 5 - (s + 1) * ((eh - 10) / segs); const on = s < 11; R(ex + 2, Math.round(sy) + 1, ew - 4, Math.round((eh - 10) / segs) - 1, on ? (s > 8 ? '#a8ff9a' : P.green) : '#1e3a40'); }
  R(ex + 2, ey + 4, 1, eh - 8, 'rgba(255,255,255,0.25)'); }

// title: MECHAYUKI with the green bolts (= STATUS)
if (!V2) {
const TX0 = SX, TX1 = SR - 100;   // left block
{ const sc = 3, w = boldWidth('MECHAYUKI', sc) + 8, cx = Math.round((TX0 + TX1) / 2), cy = SY + 15;
  bold('MECHAYUKI', cx, cy, sc, '#ffffff', { outline: P.ink, ow: 2, shadow: 'rgba(20,16,80,0.55)', fg2: '#e2e6ff', gap: 1 });
  boltCircle(Math.round(cx - w / 2) - 11, cy, 6); boltCircle(Math.round(cx + w / 2) + 11, cy, 6); }
// location bar (= Location)
{ const y = SY + 32, h = 19; bar(TX0 + 2, y, TX1 - TX0 - 4, h);
  cham(TX0 + 10, y + 3, 58, h - 6, 3, P.mint); text('LOCATION', TX0 + 39, y + h / 2, 1, P.teal);
  text('EARTH, YEAR 3127', TX0 + 74, y + h / 2 + 1, 2, '#ffffff', { align: 'left', outline: P.barLo }); }
// handle bar
{ const y = SY + 55, h = 19; bar(TX0 + 2, y, TX1 - TX0 - 4, h, { col: '#24404a' });
  bold('@MECHAYUKI', Math.round((TX0 + TX1) / 2), y + h / 2 + 1, 2, '#ffffff', { outline: P.barLo, ow: 1 });
  zcoin(TX0 + 22, y + h / 2); zcoin(TX1 - 22, y + h / 2); }
// tagline box (= the description box)
{ const y = SY + 78, h = SB - SY - 78, x = TX0 + 2, w = TX1 - TX0 - 4;
  cham(x, y, w, h, 3, P.purpleHi); cham(x + 1, y + 1, w - 2, h - 2, 3, P.purple);
  for (const [rx, ry] of [[x + 5, y + 5], [x + w - 6, y + 5], [x + 5, y + h - 6], [x + w - 6, y + h - 6]]) rivet(rx, ry, 2);
  text('DIGGING UP HUMANITY', x + w / 2, y + h / 2 + 1, 2, '#f4f0ff', { outline: '#0c0820' }); }
}

// ================= desktop band sides (y 127-233) =================
// left: the vertical menu, ARTIFACTS selected (red tab + cursor)
{ const x = 8, y = SY - 2, w = 112, h = SB - SY + 4;
  panel(x, y, w, h, { k: 7, ticks: 'bottom' });
  ['ARTIFACTS', 'HUMANS', 'BODY', 'HISTORY', 'FOLLOW'].forEach((s, i) => {
    const by = y + 7 + i * 18, on = i === 0;
    bar(x + 8, by, w - 16, 15, on ? { col: P.red, hi: P.redHi, lo: P.redLo } : {});
    bold(s, x + w / 2 + 2, by + 8, 1, '#ffffff', { outline: on ? P.redLo : P.barLo });
  });
  // cursor (white hand-arrow) pointing at ARTIFACTS
  const ax = x + 1, ay = y + 14; c.fillStyle = P.ink; for (let i = 0; i < 6; i++) c.fillRect(ax + i - 1, ay - 6 + i - 1, 3, 13 - 2 * i + 2);
  c.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) c.fillRect(ax + i, ay - 5 + i, 1, 11 - 2 * i); }
// right: artifacts counter (Z coins) + the dig timer
{ const x = 520, y = SY - 2, w = 112, h = SB - SY + 4;
  panel(x, y, w, h, { k: 7, ticks: 'top' });
  bold('ARTIFACTS', x + w / 2, y + 18, 1, P.teal, { outline: null });
  bar(x + 6, y + 26, w - 12, 21); zcoin(x + 19, y + 36); zcoin(x + w - 19, y + 36);
  bold('003', x + w / 2, y + 37, 2, '#ffe060', { outline: P.barLo });
  bold('NEXT DIG', x + w / 2, y + 60, 1, P.teal, { outline: null });
  bar(x + 8, y + 68, w - 16, 21);
  bold('DIGGING', x + w / 2 - 8, y + 79, 1, '#9cf09c', { outline: P.barLo });
  for (let d = 0; d < 3; d++) R(x + w / 2 + 28 + d * 4, y + 81, 2, 2, d < 2 ? '#9cf09c' : '#3a6a50');
  // progress pips
  for (let p = 0; p < 10; p++) R(x + 16 + p * 8, y + 95, 6, 3, p < 6 ? P.orange : '#5a8a74'); }

// ================= TV only: top (y < 127) =================
{ // STATUS homage, top-left
  const sc = 3, cx = 104, cy = 22, w = boldWidth('STATUS', sc);
  bold('STATUS', cx, cy, sc, '#ffffff', { outline: P.ink, ow: 2, shadow: 'rgba(20,16,80,0.55)', fg2: '#e2e6ff' });
  boltCircle(cx - w / 2 - 13, cy, 7); boltCircle(cx + w / 2 + 13, cy, 7); }
{ // stats panel
  const x = 12, y = 40, w = 184, h = 76;
  panel(x, y, w, h, { k: 7, ticks: 'top' });
  [['TYPE', 'ANDROID'], ['JOB', 'DIGGER'], ['ERA', '3127 AD']].forEach(([a, b], i) => {
    const ry = y + 8 + i * 18; text(a, x + 12, ry + 7, 1, P.teal, { align: 'left' });
    bar(x + 52, ry, w - 62, 15); text(b, x + 52 + (w - 62) / 2, ry + 8, 1, '#ffffff', { outline: P.barLo });
  });
  text('LIFE', x + 12, y + h - 11, 1, P.teal, { align: 'left' });
  for (let s = 0; s < 14; s++) R(x + 52 + s * 9, y + h - 15, 7, 8, s < 12 ? P.green : '#3a6a50'); }
if (!V2) { // ITEMS: the inventory, artifacts 001-003 + her tools
  const x = 210, y = 8, w = 420, h = 110;
  panel(x, y, w, h, { k: 8, ticks: 'left' });
  bar(x + 10, y + 7, 92, 15, { col: P.bar }); bold('ITEMS', x + 56, y + 15, 1, '#ffffff', { outline: P.barLo });
  text('ARTIFACTS + TOOLS', x + w - 14 - textWidth('ARTIFACTS + TOOLS', 1) / 2, y + 15, 1, P.teal);
  const sw = 72, sh = 62, gap = (w - 20 - 5 * sw) / 4;
  ITEMS.forEach(([name, tag, img], i) => {
    const sx = Math.round(x + 10 + i * (sw + gap)), sy = y + 27;
    cham(sx, sy, sw, sh, 4, P.teal); cham(sx + 2, sy + 2, sw - 4, sh - 4, 3, P.slot);
    for (let gx = sx + 8; gx < sx + sw - 4; gx += 8) R(gx, sy + 3, 1, sh - 6, P.slotLn);
    for (let gy = sy + 8; gy < sy + sh - 4; gy += 8) R(sx + 3, gy, sw - 6, 1, P.slotLn);
    c.drawImage(img, sx + (sw - IW) / 2, sy + sh - IH - 3);
    text(tag, sx + 5, sy + 8, 1, tag === 'TOOL' ? '#9cf09c' : '#ffd060', { align: 'left', outline: P.barLo });
    text(name, sx + sw / 2, y + h - 12, 1, P.teal);
  }); }

// ================= TV only: bottom (y > 233) =================
if (!V2) { // description box: dark purple, green rivets
  const x = 24, y = 243, w = 592, h = 74;
  cham(x + 3, y + 3, w, h, 5, 'rgba(24,20,90,0.45)'); cham(x, y, w, h, 5, P.teal); cham(x + 3, y + 3, w - 6, h - 6, 4, P.purpleHi); cham(x + 4, y + 4, w - 8, h - 8, 4, P.purple);
  for (const [rx, ry] of [[x + 10, y + 10], [x + w - 11, y + 10], [x + 10, y + h - 11], [x + w - 11, y + h - 11]]) rivet(rx, ry, 3);
  text('AN ANDROID FROM THE FAR FUTURE.', x + w / 2, y + 17, 2, '#ffffff', { outline: '#0c0820' });
  text('SHE DIGS UP HUMAN ARTIFACTS', x + w / 2, y + 37, 2, '#d4ccff', { outline: '#0c0820' });
  text('AND REBUILDS THEM FROM SCRATCH.', x + w / 2, y + 56, 2, '#d4ccff', { outline: '#0c0820' }); }
{ // footer: controls hint
  const y = 326, h = 17; bar(24, y, 592, h);
  zcoin(44, y + 8); text('SUBSCRIBE', 56, y + 9, 1, '#ffffff', { align: 'left', outline: P.barLo });
  text('THE NEXT ARTIFACT IS BEING DUG UP...', 320, y + 9, 1, '#9cf09c', { outline: P.barLo });
  bold('@MECHAYUKI', 600, y + 9, 1, '#ffe060', { outline: P.barLo, align: 'right' }); }


// ================= v2 layout =================
if (V2) {
  // ---- safe zone, left block (x 131-409): name / 5 item slots / SUBSCRIBE! + handle ----
  const TX0 = SX, TX1 = SR - 100;
  { const sc = 3, w = boldWidth('MECHAYUKI', sc) + 8, cx = Math.round((TX0 + TX1) / 2), cy = SY + 12;
    bold('MECHAYUKI', cx, cy, sc, '#ffffff', { outline: P.ink, ow: 2, shadow: 'rgba(20,16,80,0.55)', fg2: '#e2e6ff', gap: 1 });
    boltCircle(Math.round(cx - w / 2) - 11, cy, 6); boltCircle(Math.round(cx + w / 2) + 11, cy, 6); }
  { const sw = 52, sh = 46, n = ITEMS2.length, gap = Math.floor((TX1 - TX0 - n * sw) / (n - 1)), y = SY + 27;
    ITEMS2.forEach(([name, tag, img], i) => {
      const sx = TX0 + i * (sw + gap) + Math.floor((TX1 - TX0 - n * sw - (n - 1) * gap) / 2);
      cham(sx, y, sw, sh, 4, P.teal); cham(sx + 2, y + 2, sw - 4, sh - 4, 3, '#4a7c86');
      for (let gx = sx + 7; gx < sx + sw - 3; gx += 7) R(gx, y + 3, 1, sh - 12, '#568a94');
      for (let gy = y + 7; gy < y + sh - 9; gy += 7) R(sx + 3, gy, sw - 6, 1, '#568a94');
      c.save(); c.beginPath(); c.rect(sx + 2, y + 2, sw - 4, sh - 11); c.clip(); c.drawImage(img, sx + (sw - IW2) / 2, y + 2); c.restore();
      R(sx + 3, y + sh - 10, sw - 6, 8, tag === 'TOOL' ? '#143022' : '#3a2408');
      text(tag, sx + sw / 2, y + sh - 6, 1, tag === 'TOOL' ? '#9cf09c' : '#ffd060');
    }); }
  { const y = SY + 76, h = 22, mid = TX0 + 136;
    bar(TX0, y, mid - TX0 - 2, h, { col: P.red, hi: P.redHi, lo: P.redLo, notch: false });
    text('SUBSCRIBE!', (TX0 + mid - 2) / 2, y + h / 2 + 1, 2, '#ffffff', { outline: P.redLo });
    bar(mid + 2, y, TX1 - mid - 2, h, { notch: false });
    text('@MECHAYUKI', (mid + 2 + TX1) / 2, y + h / 2 + 1, 2, '#ffe060', { outline: P.barLo }); }
  // ---- TV top-right: the description box with the tagline ----
  { const x = 210, y = 8, w = 420, h = 110;
    cham(x + 3, y + 3, w, h, 6, 'rgba(24,20,90,0.45)'); cham(x, y, w, h, 6, P.teal); cham(x + 3, y + 3, w - 6, h - 6, 5, P.purpleHi); cham(x + 4, y + 4, w - 8, h - 8, 5, P.purple);
    for (const [rx, ry] of [[x + 10, y + 10], [x + w - 11, y + 10], [x + 10, y + h - 11], [x + w - 11, y + h - 11]]) rivet(rx, ry, 3);
    bold('DIGGING UP HUMANITY', x + w / 2, y + 22, 2, '#ffe060', { outline: '#0c0820' });
    text('AN ANDROID FROM THE FAR FUTURE.', x + w / 2, y + 48, 2, '#ffffff', { outline: '#0c0820' });
    text('SHE DIGS UP HUMAN ARTIFACTS', x + w / 2, y + 67, 2, '#d4ccff', { outline: '#0c0820' });
    text('AND REBUILDS THEM FROM SCRATCH.', x + w / 2, y + 86, 2, '#d4ccff', { outline: '#0c0820' }); }
  // ---- TV bottom: location + the item list with names ----
  { const x = 24, y = 243, w = 592, h = 74;
    panel(x, y, w, h, { k: 8, ticks: 'left' });
    bar(x + 14, y + 8, w - 28, 19);
    cham(x + 24, y + 11, 58, 13, 3, P.mint); text('LOCATION', x + 53, y + 17, 1, P.teal);
    text('EARTH, YEAR 3127 - DIG SITE 07', x + 92, y + 18, 2, '#ffffff', { align: 'left', outline: P.barLo });
    bar(x + 14, y + 39, 92, 19); bold('ITEMS', x + 60, y + 49, 1, '#ffffff', { outline: P.barLo });
    const cw = (w - 128) / ITEMS2.length;
    ITEMS2.forEach(([n, t], i) => {
      const cx = Math.round(x + 114 + cw * (i + 0.5));
      if (i) R(Math.round(x + 114 + cw * i), y + 38, 1, 22, P.mintLo);
      text(t, cx, y + 43, 1, t === 'TOOL' ? '#1c6a2a' : '#a8500a');
      bold(n, cx, y + 55, 1, P.teal, { outline: null });
    }); }
}

// ---------- out x4 + faint scanline (one dark row per low-res row, like the episodes) ----------
function up(src, k, scan = 0.94) {
  const o = document.createElement('canvas'); o.width = src.width * k; o.height = src.height * k; const g = o.getContext('2d');
  g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, o.width, o.height);
  if (scan < 1) { g.fillStyle = `rgba(0,0,0,${1 - scan})`; for (let y = k - 1; y < o.height; y += k) g.fillRect(0, y, o.width, 1); }
  return o;
}
const parts = document.createElement('canvas'); parts.width = PW + 5 * IW + 6; parts.height = Math.max(PH, IH);
{ const g = parts.getContext('2d'); g.fillStyle = '#6b6fd6'; g.fillRect(0, 0, parts.width, parts.height); g.drawImage(portrait, 0, 0); ITEMS.forEach(([, , im], i) => g.drawImage(im, PW + 6 + i * IW, 0)); }
window.OUT = V2 ? { mechayuki_banner_v2_2560x1440: up(cv, K).toDataURL('image/png') } : { mechayuki_banner_2560x1440: up(cv, K).toDataURL('image/png'), parts: up(parts, 4, 1).toDataURL('image/png') };
window.READY = true;
