// sets/basement.js — the station basement: a US tank water heater (40 GAL) and a portable gas generator in the corner.
// Shots: 34_heater (low fixed corner, flashlight finds the heater, 40 GAL on "forty"), 36_smile (Ava frontal by the heater,
// slow push-in, smiles at camera on "smile"), 45_generator (push-in on the generator, KILLS MORE THAN ZOMBIES on "kills"),
// 46_co (CO diagram over the basement: cloud, red X's on basement / garage / door, CO: NO SMELL, NO COLOR, darkens on
// "sleepy"), 61_gen_on (generator RUNNING: only the generator shakes, exhaust smoke, bulb on). Contract: SETS.md.
// World: basement x [-3, 3], z [-3, 3], ceiling 2.4 (joists); stairs down along the right wall (x 2.2..3, from z = 3 to 0.4);
// heater against the back wall at (1.15, -2.45); generator in the back-left corner at (-2.2, -2.2); bare bulb at (0, 2.1, -0.6).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { kit } from './r2kit.js';

const STEP_PH = [0.12, 0.60];   // walk clip foot contacts (s in its 1.0 s cycle)
function walkSteps(at, speed, t0, t1) { const out = [], x0 = (t0 - at) * speed, x1 = (t1 - at) * speed; for (let n = Math.floor(x0) - 1; n <= Math.ceil(x1); n++) for (const c of STEP_PH) { const xx = n + c; if (xx >= x0 && xx < x1) out.push(+(at + xx / speed).toFixed(3)); } return out; }
const W34 = { go: -0.6, stop: 1.15, speed: 0.9 };   // 34: Ava walks off the stairs toward the heater (s from the shot start)

function BStimes(ctx) {
  const { T, at } = ctx;
  return {
    t34: T['34_heater'], t36: T['36_smile'], t45: T['45_generator'], t46: T['46_co'], t61: T['61_gen_on'],
    heater: at('w7', 'heater'), forty: at('w7', 'forty'),
    smile: at('w10', 'smile'), tonight: at('w9', 'tonight'),
    gen: at('p2', 'generator'), kills: at('p3', 'kills'), zombies: at('p3', 'zombies'),
    never: at('p4', 'never'), basement: at('p4', 'basement'), garage: at('p4', 'garage'), door: at('p4', 'door'),
    carbon: at('p4', 'carbon'), smell: at('p4', 'smell'), color: at('p4', 'color'), sleepy: at('p5', 'sleepy'), wake: at('p5', 'wake'),
    gen61: at('l4', 'generator'), started: at('l4', 'started'),
  };
}

export function sfx(ctx) {
  const r = BStimes(ctx), out = [];
  // 34: flashlight on, beam finds the heater, label on "forty", the heater ticks
  for (const t of walkSteps(r.t34 + W34.go, W34.speed, r.t34, r.t34 + W34.stop)) out.push([t, 'step_walk']);
  out.push([r.t34 + 0.05, 'flashlight_click'], [r.t34 + 0.1, 'basement_drip'], [r.heater, 'pipe_tick'], [r.forty, 'label_pop']);
  // 36: smile sting (soft)
  out.push([r.smile, 'soft_chime']);
  // 45: label on "kills" (CAUTION)
  out.push([r.kills, 'label_pop_danger']);
  // 46: CO cloud spreads, three red X stamps, CO lines, the picture dims on "sleepy"
  out.push([r.never, 'gas_hiss'], [r.basement, 'x_stamp'], [r.garage, 'x_stamp'], [r.door, 'x_stamp'],
    [r.carbon, 'label_pop'], [r.smell, 'label_pop'], [r.color, 'label_pop'], [r.sleepy, 'low_drone_fade']);
  // 61: the generator is running (loop from the cut), bulb buzzes on, the frame rattles on the concrete
  out.push([r.t61, 'generator_loop'], [r.t61 + 0.1, 'bulb_on'], [r.t61 + 0.12, 'bulb_buzz'], [r.t61 + 0.4, 'generator_rattle']);
  return out.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L, TL } = ctx;
  const { THREE, LW, LH } = L;
  const r = BStimes(ctx);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (a, b, c) => `rgb(${Math.max(0, Math.min(255, a | 0))},${Math.max(0, Math.min(255, b | 0))},${Math.max(0, Math.min(255, c | 0))})`;
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const DS = THREE.DoubleSide;
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.02, 40);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const vignette = (o, k = 0.45, r0 = 0.3) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * r0, LW / 2, LH * 0.45, LH * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  function Bline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 3000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  /** RE label box; xMark draws a red X box on its left */
  function Blabel(o, text, cx, cy, col, tgt, k = 1, sc = 1, { xMark = false, fg = '#f4f4f4' } = {}) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n'), lh = sc === 2 ? 17 : 13;
    const tw = Math.max(...lines.map((s) => textWidth(s, sc))), xw = xMark ? 18 : 0;
    const w = Math.round(tw + 12 + xw), h = lines.length * lh + 9, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', fg, k);
    if (tgt) { Bline(c, x + w / 2, y + h - 1, tgt[0], tgt[1], bc); c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    if (xMark) { const s = Math.round(10 + 6 * (1 - Math.min(1, k * 1.5))), xc = x + 11, yc = y + h / 2; const xr = mixHex('#000000', '#ff3020', k);
      for (let i = -s / 2; i <= s / 2; i++) { c.fillStyle = xr; c.fillRect(Math.round(xc + i) - 1, Math.round(yc + i) - 1, 3, 3); c.fillRect(Math.round(xc + i) - 1, Math.round(yc - i) - 1, 3, 3); } }
    lines.forEach((s, i) => bitText(c, s, x + xw + (w - xw) / 2, y + 5 + Math.round(lh / 2) + i * lh, sc, fc, { outline: null }));
  }

  // ---------- textures ----------
  const tConcrete = L.cvs(64, 64, (c, w, h) => {
    const rr = L.rng(1101);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 16 - 8 + 6 * Math.sin(x * 0.15 + y * 0.09); px(c, x, y, rgb(112 + n, 110 + n, 102 + n)); }
    for (let k = 0; k < 7; k++) { c.fillStyle = 'rgba(50,46,38,0.25)'; c.beginPath(); c.ellipse(rr() * 64, rr() * 64, 4 + rr() * 9, 3 + rr() * 6, rr() * 3, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(40,38,34,0.6)'; c.beginPath(); c.moveTo(10, 0); c.lineTo(16, 20); c.lineTo(12, 40); c.stroke();
  });
  const tCMU = L.cvs(64, 64, (c, w, h) => {   // unpainted grey concrete block, damp at the bottom
    const rr = L.rng(1102);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const row = y >> 3, mort = (y % 8 === 0) || ((x + (row & 1) * 16) % 32 === 0), n = rr() * 16 - 8, k = mort ? 0.72 : 1, damp = y > 50 ? 0.82 : 1;
      px(c, x, y, rgb((126 + n) * k * damp, (124 + n) * k * damp, (114 + n) * k * damp));
    }
    for (let k = 0; k < 4; k++) px(c, rr() * 60 | 0, 50 + (rr() * 10 | 0), 'rgba(220,220,210,0.5)', 3, 1);   // efflorescence
  });
  const tWood = (seed, a, b2) => L.cvs(32, 64, (c, w, h) => {
    const rr = L.rng(seed), A = hexRGB(a), Bc = hexRGB(b2);
    for (let x = 0; x < w; x++) { const g = rr(); for (let y = 0; y < h; y++) { const k = Math.min(1, Math.max(0, g * 0.5 + 0.35 * Math.sin(y * 0.25 + x * 0.9 + g * 6) + rr() * 0.2)); px(c, x, y, rgb(A[0] + (Bc[0] - A[0]) * k, A[1] + (Bc[1] - A[1]) * k, A[2] + (Bc[2] - A[2]) * k)); } }
  });
  const tMetal = (seed, base) => L.cvs(32, 32, (c, w, h) => {
    const rr = L.rng(seed), A = hexRGB(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 14 - 7; px(c, x, y, rgb(A[0] + n, A[1] + n, A[2] + n)); }
    for (let k = 0; k < 6; k++) px(c, rr() * 30 | 0, rr() * 30 | 0, '#c8ccd0', 1 + (rr() * 4 | 0), 1);
    for (let k = 0; k < 5; k++) px(c, rr() * 30 | 0, rr() * 30 | 0, '#7a4a2a', 1, 1);
  });
  // water heater skin: off-white enamel jacket, data plate, yellow EnergyGuide sticker, brand stripe, "40 GAL"
  const tHeater = L.cvs(64, 64, (c, w, h) => {
    const rr = L.rng(1103);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const sh = 0.86 + 0.14 * Math.cos((x / w - 0.5) * 3.0), n = rr() * 6 - 3; px(c, x, y, rgb((222 + n) * sh, (214 + n) * sh, (192 + n) * sh)); }
    px(c, 0, 4, '#2a4a8a', w, 3);                                        // brand band
    // yellow EnergyGuide sticker
    px(c, 24, 12, '#e8c838', 16, 20); px(c, 25, 13, '#1a1a1a', 14, 2); px(c, 26, 17, '#1a1a1a', 10, 1); px(c, 26, 19, '#1a1a1a', 12, 1);
    px(c, 26, 22, '#f8f0c0', 12, 5); px(c, 27, 23, '#c82020', 8, 3); px(c, 26, 28, '#1a1a1a', 8, 1);
    // data plate (silver) with "40 GAL"
    px(c, 22, 34, '#b8bcc0', 20, 12); px(c, 22, 34, '#e0e4e8', 20, 1);
    c.fillStyle = '#1a1a1a'; c.font = 'bold 7px Tahoma, Verdana, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('40 GAL', 32, 39);
    px(c, 24, 43, '#4a4e52', 16, 1);
    // rust drip + scuffs near the bottom
    px(c, 40, 50, '#9a5a2a', 1, 12); px(c, 41, 58, '#8a4a20', 1, 6); for (let k = 0; k < 8; k++) px(c, rr() * 64 | 0, 54 + (rr() * 8 | 0), '#a09a88', 2, 1);
  });
  const tGas = L.cvs(16, 16, (c) => { c.fillStyle = '#2a2a2a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#c82020'; c.fillRect(3, 3, 10, 4); c.fillStyle = '#d8d8d0'; c.fillRect(4, 9, 8, 4); c.fillStyle = '#1a1a1a'; c.fillRect(7, 10, 2, 2); });
  const tAccess = L.cvs(16, 16, (c) => { c.fillStyle = '#b8b0a0'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#1a1612'; c.fillRect(3, 3, 10, 10); c.fillStyle = '#ff8a2a'; c.fillRect(6, 10, 4, 2); c.fillStyle = '#3a8aff'; c.fillRect(6, 11, 4, 1); });
  // generator textures: yellow frame paint, red tank with logo, control panel with outlets
  const tTank = L.cvs(32, 16, (c) => { c.fillStyle = '#d82a1a'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#f04a30'; c.fillRect(0, 0, 32, 2); c.fillStyle = '#8a1a10'; c.fillRect(0, 14, 32, 2);
    // short brand "3500W" in 3x5 pixel blocks (crisp at nearest filtering, fits the 32 px tank face)
    const G5 = { '3': ['111', '001', '111', '001', '111'], '5': ['111', '100', '111', '001', '111'], '0': ['111', '101', '101', '101', '111'], 'W': ['10001', '10001', '10101', '10101', '01010'] };
    c.fillStyle = '#f8f0d8'; let gx = 5; for (const ch of '3500W') { const g = G5[ch]; g.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '1') c.fillRect(gx + x, 5 + y, 1, 1); }); gx += g[0].length + 1; } });
  const tPanel = L.cvs(32, 16, (c) => { c.fillStyle = '#1e1e20'; c.fillRect(0, 0, 32, 16); for (const x of [3, 12]) { c.fillStyle = '#d8d4c8'; c.fillRect(x, 4, 7, 7); c.fillStyle = '#1a1a1a'; c.fillRect(x + 2, 6, 1, 3); c.fillRect(x + 4, 6, 1, 3); c.fillRect(x + 3, 9, 1, 1); }
    c.fillStyle = '#c8c8c0'; c.fillRect(22, 3, 7, 4); c.fillStyle = '#c82020'; c.fillRect(23, 9, 5, 5); c.fillStyle = '#e8e4d8'; c.fillRect(2, 1, 12, 1); });
  const tWarn = L.cvs(32, 16, (c) => { c.fillStyle = '#f0c020'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 15, 32, 1);
    c.beginPath(); c.moveTo(6, 2); c.lineTo(11, 12); c.lineTo(1, 12); c.fill(); c.fillStyle = '#f0c020'; c.fillRect(5, 6, 2, 3); c.fillStyle = '#1a1a1a'; c.font = 'bold 5px Tahoma'; c.textAlign = 'left'; c.fillText('DANGER', 13, 6); c.fillText('CO', 13, 12); });
  const tGlow = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const tPuff = L.cvs(32, 32, (c) => { const rr = L.rng(1110); for (let k = 0; k < 9; k++) { const x = 8 + rr() * 16, y = 8 + rr() * 16, rd = 5 + rr() * 6; const g = c.createRadialGradient(x, y, 0, x, y, rd); g.addColorStop(0, 'rgba(200,200,196,0.55)'); g.addColorStop(1, 'rgba(180,180,176,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); } });
  const tShelf = L.cvs(32, 32, (c) => { const rr = L.rng(1111); c.fillStyle = '#5a4a36'; c.fillRect(0, 0, 32, 32); for (let k = 0; k < 6; k++) { c.fillStyle = ['#8a7a5a', '#a89a78', '#6a5a40', '#c0b090'][k % 4]; const x = (k % 3) * 11, y = k < 3 ? 2 : 17; c.fillRect(x, y, 10, 13); c.fillStyle = '#2a2a2a'; c.fillRect(x + 2, y + 4, 6, 1); } void rr; });

  // ---------- the basement ----------
  const BG = 0x07090c;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 5, 12);
  const hemi = new THREE.HemisphereLight(0x8a96b8, 0x40382c, 1.15); scene.add(hemi);
  const stairL = new THREE.PointLight(0x9ab0e0, 3.5, 5, 1.2); stairL.position.set(2.6, 2.3, 2.6); scene.add(stairL);   // light from the stair door
  const bulbL = new THREE.PointLight(0xffc070, 0, 7, 1.1); bulbL.position.set(0, 2.0, -0.7); scene.add(bulbL);
  const fill = new THREE.PointLight(0xc8d0ff, 1.6, 6, 1.2); fill.position.set(0.5, 1.6, 1.5); scene.add(fill);
  const RX = 3, RZ = 3, HH = 2.4;
  const mW = lam(L.rep(tCMU, 4, 2));
  L.plane(2 * RX, HH, mW, 0, HH / 2, -RZ, scene); L.plane(2 * RZ, HH, mW, -RX, HH / 2, 0, scene, Math.PI / 2);
  L.plane(2 * RZ, HH, mW, RX, HH / 2, 0, scene, -Math.PI / 2); L.plane(2 * RX, HH, mW, 0, HH / 2, RZ, scene, Math.PI);
  L.plane(2 * RX, 2 * RZ, lam(L.rep(tConcrete, 3, 3)), 0, 0, 0, scene, 0, -Math.PI / 2);
  L.plane(2 * RX, 2 * RZ, lam(L.rep(tWood(1104, '#6a5038', '#3a2a1a'), 6, 1)), 0, HH, 0, scene, 0, Math.PI / 2);   // subfloor boards
  const mJoist = lam(tWood(1105, '#8a6a48', '#5a4028'));
  for (let x = -2.7; x <= 2.7; x += 0.6) B(0.06, 0.22, 2 * RZ, mJoist, x, HH - 0.11, 0, scene);
  // copper + black iron pipes along the ceiling
  const mCu = lam(null, 0xb8743a), mFe = lam(null, 0x2a2a2a);
  { const p = cyl(0.018, 0.018, 6, 6, mCu, 0, HH - 0.27, -2.6, scene); p.rotation.z = Math.PI / 2; const q = cyl(0.022, 0.022, 6, 6, mFe, 0, HH - 0.3, -2.75, scene); q.rotation.z = Math.PI / 2; }
  // a riser of black iron + copper pipes with a red gate valve in the front-left corner (foreground of the low corner camera)
  { const p1 = cyl(0.035, 0.035, HH, 8, mFe, -0.85, HH / 2, 1.05, scene); void p1; cyl(0.022, 0.022, HH, 6, mCu, -0.72, HH / 2, 1.12, scene);
    const v = cyl(0.06, 0.06, 0.03, 8, lam(null, 0xb81e10), -0.85, 1.05, 1.13, scene); v.rotation.x = Math.PI / 2; cyl(0.045, 0.045, 0.1, 8, lam(null, 0x8a6a2a), -0.85, 1.05, 1.08, scene).rotation.x = Math.PI / 2;
    for (const y of [0.4, 1.7]) { const c = cyl(0.045, 0.045, 0.06, 8, mFe, -0.85, y, 1.05, scene); void c; } }
  // stairs down along the right wall (open wooden treads + stringers + rail)
  { const mT = lam(tWood(1106, '#9a7a52', '#6a4e30')), n = 12;
    for (let i = 0; i < n; i++) { const y = HH - (i + 1) * (HH / (n + 0.5)), z = 0.45 + (n - i) * 0.21; B(0.85, 0.04, 0.26, mT, 2.55, y, z, scene); }
    for (const x of [2.13, 2.97]) { const s = B(0.05, 0.25, 3.3, mT, x, 1.2, 1.75, scene); s.rotation.x = Math.atan2(HH, 2.6) - 0.06; }
    const rail = B(0.04, 0.04, 3.2, lam(null, 0x3a3a3a), 2.12, 2.0, 1.75, scene); rail.rotation.x = Math.atan2(HH, 2.6) - 0.06; }
  // shelving with boxes + paint cans on the left wall, an old furnace duct, a mop sink
  { const g = new THREE.Group(); g.position.set(-RX + 0.25, 0, 0.3); scene.add(g); const mS = lam(tMetal(1107, '#6a6e70'));
    for (const [dx, dz] of [[-0.18, -0.7], [-0.18, 0.7], [0.18, -0.7], [0.18, 0.7]]) B(0.035, 1.9, 0.035, mS, dx, 0.95, dz, g);
    for (let k = 0; k < 4; k++) { B(0.4, 0.025, 1.44, mS, 0, 0.15 + k * 0.55, 0, g); if (k < 3) L.plane(1.3, 0.34, lam(tShelf), 0.12, 0.33 + k * 0.55, 0, g, Math.PI / 2); }
    for (let k = 0; k < 3; k++) cyl(0.08, 0.08, 0.18, 8, lam(null, [0x8a8a8a, 0x5a6a8a, 0xb8b0a0][k]), 0.05, 1.89, -0.4 + k * 0.3, g); }
  // bare bulb + pull chain
  const bulbMat = L.basic(null, 0x6a5a40);
  { const g = new THREE.Group(); g.position.set(0, 0, -0.7); scene.add(g);
    cyl(0.04, 0.04, 0.05, 8, lam(null, 0xd8d4c8), 0, HH - 0.25, 0, g);
    L.mesh(new THREE.SphereGeometry(0.045, 8, 6), bulbMat, 0, HH - 0.33, 0, g);
    cyl(0.003, 0.003, 0.5, 3, lam(null, 0x8a8a84), 0.03, HH - 0.5, 0, g); }
  const bulbGlow = L.plane(0.7, 0.7, L.basic(tGlow, 0xffd890, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }), 0, HH - 0.33, -0.7, scene);

  // ---- WATER HEATER (40-gal gas tank type): jacket, top + flue + water lines, T&P valve + discharge pipe, gas valve,
  // burner access panel, brass drain valve, legs-free base pan
  const HX = 1.15, HZ = -2.45, HR = 0.28, HHt = 1.45;
  const heater = new THREE.Group(); heater.position.set(HX, 0, HZ); scene.add(heater);
  { const mJ = lam(tHeater), mTop = lam(null, 0xd8d0b8);
    const body = cyl(HR, HR, HHt, 14, [mJ, mTop, mTop], 0, 0.04 + HHt / 2, 0, heater); body.rotation.y = Math.PI;   // sticker + data plate (texture centre) to the front (+z)
    cyl(HR + 0.06, HR + 0.06, 0.04, 14, lam(null, 0x9a9a92), 0, 0.02, 0, heater);                              // drain pan
    cyl(0.05, 0.05, 0.25, 8, lam(null, 0x9a9a9a), 0, 0.04 + HHt + 0.12, 0, heater);                            // draft hood
    cyl(0.1, 0.06, 0.05, 8, lam(null, 0x9a9a9a), 0, 0.04 + HHt + 0.27, 0, heater);
    cyl(0.055, 0.055, HH - HHt - 0.35, 8, lam(null, 0x8a8a8a), 0, (0.04 + HHt + 0.3 + HH) / 2, 0, heater);     // flue up to the ceiling
    for (const [x, col] of [[-0.13, 0x3a6ad8], [0.13, 0xd83a2a]]) {                                           // cold / hot copper lines
      cyl(0.018, 0.018, HH - HHt - 0.05, 6, mCu, x, (0.04 + HHt + HH) / 2, -0.05, heater);
      cyl(0.03, 0.03, 0.04, 6, lam(null, col), x, 0.04 + HHt + 0.18, -0.05, heater);                          // shut-off handle
    }
    // T&P valve on the side near the top + discharge pipe down to 15 cm above the floor
    const tp = new THREE.Group(); tp.position.set(HR + 0.02, 0.04 + HHt - 0.12, 0.05); heater.add(tp);
    B(0.06, 0.05, 0.05, lam(null, 0xb08a3a), 0.02, 0, 0, tp); B(0.04, 0.012, 0.02, lam(null, 0x2a2a2a), 0.03, 0.035, 0, tp);
    cyl(0.017, 0.017, HHt - 0.3, 6, mCu, 0.07, -(HHt - 0.3) / 2, 0, tp);
    // gas control valve (black box + red knob) and the gas pipe, access panel below
    B(0.12, 0.12, 0.06, lam(tGas), 0, 0.4, HR + 0.02, heater);
    { const gp = cyl(0.014, 0.014, 0.9, 6, lam(null, 0x2a2a2a), -0.12, 0.4, HR + 0.03, heater); gp.rotation.z = Math.PI / 2; gp.position.x = -0.5; }
    L.plane(0.14, 0.12, lam(tAccess), 0, 0.17, HR + 0.006, heater);
    // brass drain valve at the bottom front
    { const dv = cyl(0.014, 0.014, 0.07, 6, lam(null, 0xc8a040), 0.1, 0.13, HR + 0.03, heater); dv.rotation.x = Math.PI / 2; cyl(0.02, 0.02, 0.02, 6, lam(null, 0xc8a040), 0.1, 0.13, HR + 0.07, heater).rotation.x = Math.PI / 2; }
  }

  // ---- PORTABLE GENERATOR: black tube frame, red tank w/ cap, grey engine, alternator, panel w/ outlets, muffler,
  // pull-cord T-handle, wheels, a gas can beside it
  const GX = -2.15, GZ = -2.1;
  const genBase = new THREE.Group(); genBase.position.set(GX, 0, GZ); genBase.rotation.y = 0.65; scene.add(genBase);
  const gen = new THREE.Group(); genBase.add(gen);   // the part that vibrates
  { const mF = lam(null, 0x1e1e20), mE = lam(tMetal(1108, '#7a7e82')), mA = lam(tMetal(1109, '#3a3e44'));
    const W = 0.62, D = 0.46, Hh = 0.5;
    for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) cyl(0.016, 0.016, Hh, 6, mF, x, Hh / 2 + 0.05, z, gen);
    for (const y of [0.06, Hh + 0.05]) { for (const z of [-D / 2, D / 2]) B(W, 0.03, 0.03, mF, 0, y, z, gen); for (const x of [-W / 2, W / 2]) B(0.03, 0.03, D, mF, x, y, 0, gen); }
    const tk = B(0.5, 0.15, 0.32, [lam(null, 0xb81e10), lam(null, 0xb81e10), lam(null, 0xd82a1a), lam(null, 0x8a1608), lam(tTank), lam(tTank)], -0.02, Hh + 0.13, 0, gen); void tk;
    cyl(0.04, 0.04, 0.03, 8, lam(null, 0x1a1a1a), 0.12, Hh + 0.22, 0.05, gen);                                 // fuel cap
    cyl(0.015, 0.015, 0.012, 8, lam(null, 0xe0e0e0), -0.15, Hh + 0.21, 0.08, gen);                             // fuel gauge
    B(0.26, 0.24, 0.26, mE, -0.12, 0.25, 0, gen);                                                             // engine block
    cyl(0.12, 0.12, 0.05, 10, lam(null, 0x4a4e52), -0.12, 0.25, 0.155, gen).rotation.x = Math.PI / 2;          // recoil starter cover
    const ac = cyl(0.11, 0.11, 0.24, 10, mA, 0.17, 0.22, 0, gen); ac.rotation.z = Math.PI / 2;                 // alternator
    B(0.18, 0.12, 0.02, lam(tPanel), 0.17, 0.28, D / 2 + 0.002, gen);                                         // control panel
    B(0.14, 0.05, 0.005, lam(tWarn), -0.12, 0.42, D / 2 - 0.01, gen);                                          // CO danger sticker
    const mu = cyl(0.05, 0.05, 0.2, 8, lam(null, 0x5a5048), -0.25, 0.42, -0.12, gen); mu.rotation.x = Math.PI / 2;   // muffler (rear)
    B(0.07, 0.03, 0.02, lam(null, 0x1a1a1a), -0.12, 0.25, 0.19, gen);                                          // pull-cord T-handle
    cyl(0.004, 0.004, 0.03, 3, lam(null, 0xd8d8d0), -0.12, 0.25, 0.175, gen).rotation.x = Math.PI / 2;
    for (const z of [-D / 2 - 0.03, D / 2 + 0.03]) { const wh = cyl(0.08, 0.08, 0.05, 10, lam(null, 0x141414), -W / 2 + 0.02, 0.08, z, genBase); wh.rotation.x = Math.PI / 2; }
  }
  const EXH = new THREE.Vector3(-0.25, 0.42, -0.24);   // muffler outlet (gen space)
  // gas can
  { const g = new THREE.Group(); g.position.set(-1.4, 0, -2.6); g.rotation.y = 0.3; scene.add(g);
    B(0.3, 0.3, 0.16, lam(null, 0xc81e10), 0, 0.15, 0, g); B(0.18, 0.03, 0.04, lam(null, 0x1a1a1a), 0, 0.33, 0, g); const sp = cyl(0.015, 0.015, 0.12, 6, lam(null, 0xd8c020), 0.13, 0.33, 0, g); sp.rotation.z = -0.8; }
  // extension cord from the generator across the floor (orange)
  { const mC = lam(null, 0xe0701a); const pts = [V(GX + 0.3, 0.02, GZ + 0.3), V(-1.2, 0.02, -1.4), V(-0.4, 0.02, -1.6), V(0.2, 0.02, -2.2), V(0.6, 0.02, -2.9)];
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], m = B(0.022, 0.018, a.distanceTo(b), mC, (a.x + b.x) / 2, 0.012, (a.z + b.z) / 2, scene); m.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); } }
  // smoke puffs (exhaust) — sprites placed per frame
  const puffs = []; for (let i = 0; i < 14; i++) { const p = L.plane(0.3, 0.3, L.basic(tPuff, 0xffffff, { transparent: true, depthWrite: false, opacity: 0 }), 0, -9, 0, scene); puffs.push(p); }
  const smoke = (on, lt, c) => {
    genBase.updateMatrixWorld(true);
    const ex = gen.localToWorld(EXH.clone()), back = V(0, 0, -1).applyQuaternion(genBase.quaternion);
    puffs.forEach((p, i) => {
      if (!on) { p.visible = false; return; }
      const life = 2.2, u = (((lt + i * life / puffs.length) % life) + life) % life / life;
      p.visible = true; p.position.copy(ex).addScaledVector(back, 0.1 + u * 0.7).add(V(0.15 * Math.sin(i * 2.3), 0.15 + u * 1.1, 0.12 * Math.cos(i * 1.7)));
      p.scale.setScalar(0.4 + u * 2.2); p.lookAt(c.position); p.material.opacity = 0.5 * Math.sin(Math.PI * u);
    });
  };

  // ---- practical light for the shots without Ava: a battery camping lantern she left on the floor by the generator
  const LANT = V(-0.95, 0, -2.45);
  const lantern = new THREE.Group(); lantern.position.copy(LANT); scene.add(lantern);
  const lantL = new THREE.PointLight(0xffe6b0, 0, 4.5, 1.2); lantL.position.set(LANT.x + 0.05, 0.3, LANT.z + 0.12); scene.add(lantL);
  { const mG = lam(null, 0x2a4a2a), mK = lam(null, 0x1a1a1a);
    cyl(0.07, 0.075, 0.06, 10, mG, 0, 0.03, 0, lantern); cyl(0.055, 0.055, 0.13, 10, L.basic(null, 0xfff2c8), 0, 0.125, 0, lantern);
    for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; B(0.01, 0.13, 0.01, mK, Math.cos(a) * 0.058, 0.125, Math.sin(a) * 0.058, lantern); }
    cyl(0.065, 0.07, 0.035, 10, mG, 0, 0.207, 0, lantern);
    const h = L.mesh(new THREE.TorusGeometry(0.045, 0.005, 4, 10, Math.PI), mK, 0, 0.225, 0, lantern); void h; }
  const lantGlow = L.plane(0.4, 0.4, L.basic(tGlow, 0xffe0a0, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 }), LANT.x, 0.13, LANT.z, scene);
  const lanternOn = (on, c) => { lantern.visible = on; lantGlow.visible = on; lantL.intensity = on ? 7 : 0; if (on) lantGlow.lookAt(c.position); };

  // ---- Ava + flashlight (r2kit: the beam always leaves the lens of the torch in her hand, along its axis)
  const ch = L.hero(); scene.add(ch.root);
  const K = kit(ctx), FL = K.flashlight(ch, scene);
  const reset = () => { FL.unaim(); FL.show(); lanternOn(false); gen.position.set(0, 0, 0); gen.rotation.set(0, 0, 0); bulbL.intensity = 0; bulbMat.color.setHex(0x6a5a40); bulbGlow.material.opacity = 0; ch.root.visible = true; smoke(false); hemi.intensity = 1.15; };
  const noAva = () => { ch.root.visible = false; FL.hide(); };
  const out = {};

  // ======================================================================================================
  // 34_heater: FIXED low corner shot; Ava at the foot of the stairs, her flashlight finds the heater on "heater";
  // label 40 GAL on "forty"
  // ======================================================================================================
  {
    const c34 = cam(48);
    out['34_heater'] = { scene, camera: c34, update(lt, t) {
      reset();
      // she comes off the stairs and crosses to the heater, stops, the beam finds it (fixed low corner, pipes in the foreground)
      const A0 = V(2.45, 0, 0.7), A1 = V(1.75, 0, -0.35), u = L.clamp01((lt - W34.go) / (W34.stop - W34.go)), walking = lt < W34.stop;
      ch.root.position.copy(A0.clone().lerp(A1, u));
      const yw = Math.atan2(A1.x - A0.x, A1.z - A0.z), yh = Math.atan2(HX - 1.75, HZ + 0.35);
      ch.root.rotation.y = yw + (yh - yw) * L.smooth((lt - W34.stop + 0.1) / 0.35);
      ch.pose(lt, [L.seg('walk', W34.go, { loop: true, speed: W34.speed }), L.seg('idle', W34.stop, { from: 0.3, fade: 0.25 })], [[-99, 'open', mouthAt(t, 'neutral')]]);
      void walking;
      // low fixed corner, clear of the pipe riser: the heater left of centre, Ava coming off the stairs on the right
      look(c34, V(-0.35, 0.6, 2.35), V(1.45, 0.95, -1.15));
      // the torch in her right hand lights the floor ahead, then she raises it to the heater on "heater"
      const k = L.smooth((lt - (r.heater - r.t34) + 0.6) / 0.7);
      const tg = ch.root.position.clone().add(V(-0.45, 0, -0.9)).lerp(V(HX, 0.75, HZ + HR), k);
      FL.aim(tg, 1); FL.on(lt > 0.05, c34, tg, 1, true, 16);
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.5);
      const tf = r.forty - r.t34, k = L.clamp01((lt - tf) / 0.1);
      if (k > 0) { const p = L.toScreen(c34, HX, 0.04 + HHt * (1 - 42 / 64), HZ + HR); Blabel(o, '40 GAL', p[0] - 120, p[1] - 60, '#ffd23f', p, k, 2); }
    } };
  }

  // ======================================================================================================
  // 36_smile: Ava frontal next to the heater, slow push-in, looks at camera; happy eyes + smile on "smile"
  // ======================================================================================================
  {
    const c36 = cam(38);
    out['36_smile'] = { scene, camera: c36, update(lt, t) {
      reset();
      ch.root.position.set(HX - 0.62, 0, HZ + 0.55); ch.root.rotation.y = 0.15;
      const ts = r.smile - r.t36;
      const faces = [[-99, 'half', 'neutral'], [ts - 0.05, 'happy', 'smile'], [ts + 0.5, 'happy', 'smileOpen'], [ts + 1.2, 'happy', 'smile']];
      ch.pose(lt, [L.seg('idle', -9, { loop: true }), L.seg('hands_on_hips', ts - 0.2, { fade: 0.25 })], faces.map(([tt, e, m]) => [tt, e, mouthAt(r.t36 + Math.max(0, tt), m)]));
      const u = L.smooth(lt / (r.t61 > 0 ? (r.smile - r.t36 + 1.2) : 3));
      look(c36, V(HX - 0.45, 1.42, 0.55).lerp(V(HX - 0.5, 1.45, -0.35), u), V(HX - 0.55, 1.2, HZ + 0.4));
      ch.lookAt(c36, 1, 40);
      // her torch stays on, held low and pointed at the floor in front of her (light from the lens, no spot from nowhere)
      { const tg = V(HX - 0.95, 0, HZ + 1.45); FL.aim(tg, 1); FL.on(true, c36, tg, 0.7, false, 12); }
      // mouth follows the voice while she talks (frontal shot)
    }, overlay: (lt, dt, a, o) => vignette(o, 0.42) };
  }

  // ======================================================================================================
  // 45_generator: slow push-in on the generator in the corner; KILLS MORE THAN ZOMBIES on "kills"
  // ======================================================================================================
  {
    const c45 = cam(44);
    out['45_generator'] = { scene, camera: c45, update(lt) {
      reset(); noAva();
      const u = L.smooth(lt / (r.t46 - r.t45));
      look(c45, V(-0.4, 1.5, 0.2).lerp(V(-1.35, 0.95, -1.2), u), V(GX, 0.35, GZ));
      lanternOn(true, c45);
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.5);
      const tk = r.kills - r.t45, k = L.clamp01((lt - tk) / 0.1);
      if (k > 0) { const p = L.toScreen(c45, GX, 0.6, GZ); Blabel(o, 'KILLS MORE THAN\nZOMBIES', Math.min(520, p[0] + 190), Math.max(110, p[1] - 90), '#ff4030', p, k, 2); }
    } };
  }

  // ======================================================================================================
  // 46_co: the same basement as a diagram: CO cloud grows from the generator; red X labels on their words;
  // CO: NO SMELL, NO COLOR; on "sleepy" the picture darkens
  // ======================================================================================================
  {
    const c46 = cam(56);
    const X1 = [r.basement, 'NOT IN THE BASEMENT'], X2 = [r.garage, 'NOT IN THE GARAGE'], X3 = [r.door, 'NOT WITH THE DOOR OPEN'];
    out['46_co'] = { scene, camera: c46, update(lt) {
      reset(); noAva(); lanternOn(true, c46);
      look(c46, V(1.6, 2.05, 2.3), V(-0.8, 0.4, -1.4));
      const run = lt > r.never - r.t46 - 0.2;
      // the generator in the diagram is running (it vibrates: it is the "hit" object of this shot)
      if (run) { gen.position.x = 0.004 * Math.sin(lt * 157); gen.position.z = 0.003 * Math.sin(lt * 131 + 1); }
      smoke(run, lt, c46);
      bulbL.intensity = run ? 5 : 0; bulbMat.color.setHex(run ? 0xfff0c0 : 0x6a5a40); bulbGlow.material.opacity = run ? 0.8 : 0; bulbGlow.lookAt(c46.position);
    }, overlay: (lt, dt, a, o) => {
      const c = o.tctx, t0 = r.t46, tn = r.never - t0;
      // CO cloud: pale violet-grey blobs spreading from the generator over the floor, layered
      const g0 = L.toScreen(c46, GX, 0.5, GZ), R = L.rng(4646);
      const grow = L.smooth((lt - tn) / 6.0);
      if (grow > 0) for (let i = 0; i < 26; i++) {
        const ang = R() * Math.PI * 2, dist = (0.2 + R() * 0.8) * 360 * grow, x = g0[0] + Math.cos(ang) * dist * 1.1 + 6 * Math.sin(lt * 0.8 + i), y = g0[1] + Math.sin(ang) * dist * 0.35 - 20 * grow + 4 * Math.cos(lt * 0.6 + i);
        const rad = (20 + R() * 40) * (0.4 + grow);
        const gg = c.createRadialGradient(x, y, 0, x, y, rad); gg.addColorStop(0, `rgba(186,170,206,${0.28 * grow})`); gg.addColorStop(1, 'rgba(160,150,190,0)'); c.fillStyle = gg; c.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
      }
      if (grow > 0.05) { const k = L.clamp01((lt - tn - 0.4) / 0.2); Blabel(o, 'CO', g0[0] + 10, g0[1] - 70, '#b8a8e0', [g0[0], g0[1] - 20], k, 2); }
      vignette(o, 0.5);
      // three red-X rules, stacked at the right
      [X1, X2, X3].forEach(([tw, s], i) => { const k = L.clamp01((lt - (tw - t0)) / 0.1); Blabel(o, s, 486, 100 + i * 34, '#ff4030', null, k, 2, { xMark: true }); });
      // CO: NO SMELL, NO COLOR (word by word), above the caption zone
      const kC = L.clamp01((lt - (r.carbon - t0)) / 0.1), kS = L.clamp01((lt - (r.smell - t0)) / 0.1), kN = L.clamp01((lt - (r.color - t0)) / 0.1);
      if (kC > 0) { const txt = 'CO:' + (kS > 0 ? ' NO SMELL,' : '') + (kN > 0 ? ' NO COLOR' : ''); Blabel(o, txt, 400, 236, '#b8a8e0', null, Math.min(1, kC), 2); }
      // sleepy: the picture darkens and the vignette closes in
      const d = L.smooth((lt - (r.sleepy - t0)) / 1.6);
      if (d > 0) { c.fillStyle = `rgba(0,0,0,${0.62 * d})`; c.fillRect(0, 0, LW, LH); vignette(o, 0.9 * d, 0.3 - 0.2 * d); }
    } };
  }

  // ======================================================================================================
  // 61_gen_on: the generator RUNNING (only the generator vibrates), exhaust smoke, the bare bulb is on
  // ======================================================================================================
  {
    const c61 = cam(44);
    out['61_gen_on'] = { scene, camera: c61, update(lt) {
      reset(); noAva(); lanternOn(true, c61);
      gen.position.x = 0.005 * Math.sin(lt * 157); gen.position.z = 0.004 * Math.sin(lt * 131 + 1); gen.position.y = 0.002 * Math.sin(lt * 113);   // engine vibration
      gen.rotation.z = 0.004 * Math.sin(lt * 97);
      const on = lt > 0.1 ? (lt < 0.25 ? (Math.floor(lt * 30) % 2) : 1) : 0;   // bulb flickers on
      bulbL.intensity = 6 * on; bulbMat.color.setHex(on ? 0xfff0c0 : 0x6a5a40); bulbGlow.material.opacity = 0.85 * on;
      hemi.intensity = 1.0 + 0.3 * on;
      const u = L.smooth(lt / 4.4);
      look(c61, V(0.3, 0.9, -0.4).lerp(V(0.0, 0.85, -0.75), u), V(GX + 0.1, 0.45, GZ));
      bulbGlow.lookAt(c61.position);
      smoke(true, lt, c61);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.45) };
  }
  return out;
}
