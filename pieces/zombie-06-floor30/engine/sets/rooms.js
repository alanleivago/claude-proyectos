// sets/rooms.js — ep3 police station interiors (lights off: warm lamp / flashlight + blue window light):
// 05_radio (desk radio close-up + RE FILE panel with the 3 rules), 07_armory (empty armory, Ava with a flashlight, shrug),
// 09_cooler (Ava next to the office water cooler, push-in to the jug, "1 GALLON / DAY"), 12_save (save room: green
// typewriter, item box, herb, YES/NO prompt + typed sheet). Contract: SETS.md. Own prefix: R*. Text lands on its word.
import { reText as bitText, reWidth as textWidth } from '../refont.js';

// word times (global s, engine/timeline.json) used by the shots AND by ROOMS_SFX
const W05 = { t0: 9.35, radio: 9.54, seven: 10.7, lights: 11.36, gate: 11.92, open: 12.36, end: 13.5 };
const W07 = { t0: 15.3, armory: 16.32, end: 17.2 };
const W09 = { t0: 21.0, water: 23.7, gallon: 24.87, day: 25.25, end: 25.75 };
const W12 = { t0: 34.2, save: 34.55, day: 35.49, time: 36.97, end: 38.6 };
// 07: she walks in from lt 0 (walk clip from 0: foot contacts every 0.5 s), stops, shrugs (peak = clip f11)
const R07_STOP = 0.86, R07_SHRUG = 0.8;
// 09: pistol reload (clip 'reload', 60 f: mag out f8, mag in f30, slide racked f36-42) from the shot start
const R09_RELOAD = W09.t0;
// 12: save prompt -> YES -> typed sheet (one key per letter)
const R12 = { yes: 35.18, close: 35.34, sheet: 35.4, kDt: 0.075, ink: 37.72, inkDt: 0.055 };
const R12_LINES = [['DAY 1 — ', W12.day, R12.kDt], ['2:47 AM', W12.time, R12.kDt], ['POLICE STATION', R12.ink, R12.inkDt]];
const R12_KEYS = R12_LINES.flatMap(([s, t, d]) => [...s].map((ch, i) => [t + i * d, ch]));   // [time, char]

export const ROOMS_SFX = [
  // 05 radio
  [W05.t0, 'radio_static'], [W05.t0 + 0.05, 'radio_beep'], [W05.radio, 'file_open'],
  [W05.seven, 'label_pop'], [W05.lights, 'label_pop'], [W05.gate, 'label_pop'], [W05.open, 'label_pop'],
  // 07 armory
  [W07.t0, 'flashlight_click'], [W07.t0, 'footstep'], [W07.t0 + 0.5, 'footstep'], [W07.t0 + R07_STOP, 'footstep'],
  [W07.t0 + R07_SHRUG + 0.33, 'cloth_shrug'],
  // 09 cooler
  [R09_RELOAD + 7 / 30, 'mag_out'], [R09_RELOAD + 29 / 30, 'mag_in'], [R09_RELOAD + 39 / 30, 'slide_rack'],
  [W09.water, 'cooler_glug'], [W09.water + 0.45, 'cooler_glug'], [W09.gallon, 'label_pop'],
  // 12 save room
  [W12.save, 'menu_open'], [R12.yes, 'menu_select'], [R12.sheet, 'paper'],
  ...R12_KEYS.filter(([, ch]) => ch !== ' ').map(([t]) => [Math.round(t * 1000) / 1000, 'type_key']),
  [R12.ink - 0.14, 'type_return'], [Math.round((R12.ink + 14 * R12.inkDt + 0.05) * 1000) / 1000, 'save_chime'],
];

export async function shots({ L, TL }) {
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (r, g, b) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const voiceAmp = (t) => { let s = 0; for (let k = 0; k < 3; k++) { const c = TL.mouth[Math.floor(t * 15 + 1e-6) - k]; s += c === 'A' ? 1 : c === 'O' ? 0.8 : 0.08; } return s / 3; };
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const fadeIn = (lt, t0, d = 0.12) => L.clamp01((lt - t0) / d);
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.02, 40);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const vignette = (o, k = 0.45) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.28, LW / 2, LH * 0.45, LH * 0.64);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };

  // ---------- diagram labels (ep2 diagrams.js) ----------
  const LHT = 13, PXL = 6, PYL = 5;
  function Rline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 2000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function Rlabel(o, text, cx, cy, col, tgt, at = [0.5, 0], k = 1, { dot = true, fg = '#f4f4f4', sc = 1 } = {}) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n'), lh = sc === 2 ? 17 : LHT;
    const tw = Math.max(...lines.map((s) => textWidth(s, sc)));
    const w = Math.round(tw + 2 * PXL), h = lines.length * lh + 2 * PYL - 1, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', fg, k);
    if (tgt) {
      const ax = x + at[0] * (w - 1), ay = y + at[1] * (h - 1);
      Rline(c, ax, ay, tgt[0], tgt[1], bc);
      if (dot) { c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + PYL + Math.round(lh / 2) + i * lh, sc, fc, { outline: null }));
  }

  // ---------- shared textures ----------
  const tBlock = (seed, lo, hi, split = 40) => L.cvs(64, 64, (c, w, h) => {   // painted cinder block: lower colour / upper colour
    const r = L.rng(seed), A = hexRGB(lo), Bc = hexRGB(hi);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const col = y >= split ? A : Bc, row = y >> 3, mort = (y % 8 === 0) || ((x + (row & 1) * 16) % 32 === 0), n = r() * 14 - 7;
      const k = mort ? 0.72 : 1; px(c, x, y, rgb((col[0] + n) * k, (col[1] + n) * k, (col[2] + n) * k));
    }
    px(c, 0, split - 1, '#2a2a26', w, 1);
  });
  const tLino = L.cvs(64, 64, (c, w, h) => {   // station linoleum: 2x2 tiles, scuffs
    const r = L.rng(61);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dark = ((x >> 5) + (y >> 5)) & 1, n = r() * 12 - 6, edge = x % 32 === 0 || y % 32 === 0 ? 0.7 : 1;
      const b = dark ? [92, 96, 90] : [150, 150, 138]; px(c, x, y, rgb((b[0] + n) * edge, (b[1] + n) * edge, (b[2] + n) * edge));
    }
    for (let k = 0; k < 10; k++) px(c, r() * 60 | 0, r() * 62 | 0, 'rgba(40,40,36,0.5)', 3 + (r() * 6 | 0), 1);
  });
  const tWood = (seed, a, b2) => L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(seed), A = hexRGB(a), Bc = hexRGB(b2);
    for (let x = 0; x < w; x++) { const g = r(); for (let y = 0; y < h; y++) { const k = Math.min(1, Math.max(0, g * 0.5 + 0.35 * Math.sin(y * 0.25 + x * 0.9 + g * 6) + r() * 0.2)); px(c, x, y, rgb(A[0] + (Bc[0] - A[0]) * k, A[1] + (Bc[1] - A[1]) * k, A[2] + (Bc[2] - A[2]) * k)); } }
  });
  const tMetal = (seed, base) => L.cvs(32, 32, (c, w, h) => {   // painted steel, scratches + rust specks
    const r = L.rng(seed), A = hexRGB(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 16 - 8; px(c, x, y, rgb(A[0] + n, A[1] + n, A[2] + n)); }
    for (let k = 0; k < 6; k++) px(c, r() * 30 | 0, r() * 30 | 0, '#d0d4d8', 1 + (r() * 4 | 0), 1);
    for (let k = 0; k < 5; k++) px(c, r() * 30 | 0, r() * 30 | 0, '#7a4a2a', 1, 1);
  });
  const tBlinds = L.cvs(32, 64, (c, w, h) => {   // night window through blinds: blue light slats, dark gaps, a street-lamp glow
    const g = c.createRadialGradient(22, 18, 2, 22, 18, 40); g.addColorStop(0, '#9ac0ff'); g.addColorStop(0.4, '#4a72c0'); g.addColorStop(1, '#16264a');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { px(c, 0, y, 'rgba(8,12,24,0.85)', w, 2); px(c, 0, y + 2, 'rgba(255,255,255,0.10)', w, 1); }
    px(c, 15, 0, '#0a0e18', 2, h);
  });

  // ---------- RE herb pot (ep2 diagrams.js) ----------
  const tLeaf = L.cvs(32, 32, (c) => {
    const rr = L.rng(77);
    for (let k = 0; k < 7; k++) { const x = 4 + rr() * 24, y = 4 + rr() * 16, w = 5 + rr() * 4, hh = 8 + rr() * 6, a = (rr() - 0.5) * 0.9;
      c.fillStyle = '#1c5a1a'; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2 + 1, hh / 2 + 1, a, 0, 7); c.fill();
      c.fillStyle = '#3aa035'; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2, hh / 2, a, 0, 7); c.fill(); }
    c.fillStyle = '#3a5a20'; for (let k = 0; k < 5; k++) c.fillRect(8 + k * 4, 22, 2, 10);
  });
  function Rherb(parent, x, y, z, s = 1.6) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
    const mp = lam(null, 0x9a5a34);
    cyl(0.05, 0.036, 0.07, 8, mp, 0, 0.035, 0, g); cyl(0.054, 0.054, 0.012, 8, mp, 0, 0.068, 0, g);
    cyl(0.046, 0.046, 0.004, 8, lam(null, 0x3a2414), 0, 0.072, 0, g);
    const lm = lam(tLeaf, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide });
    for (let k = 0; k < 3; k++) L.plane(0.13, 0.13, lm, 0, 0.13, 0, g, k * Math.PI / 3);
    return g;
  }
  // ammo box (ep2 diagrams.js tAmmo)
  const tAmmo = L.cvs(32, 32, (c) => { c.fillStyle = '#5a1e14'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#d8b040'; c.fillRect(0, 10, 32, 6);
    c.fillStyle = '#1a0a06'; c.fillRect(3, 19, 26, 10);
    for (let x = 5; x < 28; x += 4) { c.fillStyle = '#d8a840'; c.fillRect(x, 21, 2, 6); c.fillStyle = '#f0d070'; c.fillRect(x, 21, 2, 2); }
    c.fillStyle = '#f0e8d0'; c.fillRect(4, 4, 18, 2); c.fillRect(4, 7, 10, 1); });
  const Rammo = (parent, x, y, z, s = 1) => {
    const f = [lam(null, 0x4a160e), lam(null, 0x3a120a), lam(null, 0x6a2216), lam(null, 0x200806), lam(tAmmo), lam(null, 0x2a0c08)];
    return L.mesh(new THREE.BoxGeometry(0.11 * s, 0.05 * s, 0.07 * s), f, x, y + 0.025 * s, z, parent);
  };

  const out = {};

  // ======================================================================================================
  // 05_radio (9.35-13.5): close-up of the police radio on the desk; RE FILE panel on the right with the rules
  // ======================================================================================================
  {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070d); scene.fog = new THREE.Fog(0x05070d, 2.0, 5);
    scene.add(new THREE.HemisphereLight(0x8090c0, 0x302418, 0.75));
    const lamp = new THREE.PointLight(0xffb060, 3.2, 2.4, 1.3); lamp.position.set(-0.55, 1.15, 0.35); scene.add(lamp);   // desk lamp (off frame left)
    const blue = new THREE.DirectionalLight(0x6a90ff, 1.1); blue.position.set(0.6, 1.6, -1.5); scene.add(blue);         // window behind
    const DY = 0.76;
    // desk: dark varnished wood, papers, blotter
    const desk = B(1.8, 0.04, 1.0, lam(L.rep(tWood(71, '#5a3420', '#2e180c'), 4, 2)), 0, DY - 0.02, 0, scene);
    desk.rotation.y = 0; B(1.8, 0.03, 0.02, lam(null, 0x2a160a), 0, DY - 0.05, 0.5, scene);
    L.plane(0.5, 0.34, lam(null, 0x2e3e2a), 0.12, DY + 0.001, 0.12, scene, 0, -Math.PI / 2);   // green blotter
    const tPaper = L.cvs(32, 40, (c) => { c.fillStyle = '#d8d2c0'; c.fillRect(0, 0, 32, 40); c.fillStyle = '#6a6458'; for (let y = 6; y < 36; y += 3) c.fillRect(3, y, 14 + ((y * 7) % 12), 1); c.fillStyle = '#20305a'; c.fillRect(3, 2, 12, 2); });
    const pa = L.plane(0.21, 0.27, lam(tPaper), -0.3, DY + 0.003, 0.2, scene, 0, -Math.PI / 2); pa.rotation.z = 0.3;
    const pb = L.plane(0.21, 0.27, lam(tPaper, 0xc8c0b0), 0.36, DY + 0.002, 0.26, scene, 0, -Math.PI / 2); pb.rotation.z = -0.5;
    // coffee mug + pencil cup
    { const mm = lam(null, 0xd8d4c8); cyl(0.04, 0.036, 0.1, 9, mm, 0.33, DY + 0.05, -0.02, scene); cyl(0.034, 0.034, 0.002, 9, lam(null, 0x2a1408), 0.33, DY + 0.098, -0.02, scene);
      const hd = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.008, 4, 8), mm); hd.position.set(0.375, DY + 0.055, -0.02); scene.add(hd);
      L.plane(0.05, 0.03, lam(L.cvs(8, 4, (c) => { c.fillStyle = '#1a2a6a'; c.fillRect(0, 0, 8, 4); c.fillStyle = '#e8c840'; c.fillRect(2, 1, 4, 2); })), 0.33, DY + 0.06, 0.0205, scene);
      cyl(0.03, 0.03, 0.09, 8, lam(null, 0x3a3a40), -0.36, DY + 0.045, -0.12, scene);
      for (let k = 0; k < 3; k++) { const p = cyl(0.004, 0.004, 0.16, 5, lam(null, [0xe8c020, 0xc03020, 0x2050c0][k]), -0.36 + (k - 1) * 0.012, DY + 0.12, -0.12, scene); p.rotation.z = (k - 1) * 0.2; } }
    // back wall: painted block + window with blinds (blue night light), corkboard
    L.plane(4, 2.4, lam(L.rep(tBlock(62, '#4a5a4a', '#a8a490', 26), 6, 3.6)), 0, 1.2, -0.75, scene);
    L.plane(0.7, 0.9, L.basic(L.rep(tBlinds, 1, 1)), 0.45, 1.55, -0.74, scene);
    for (const [w, h, x, y] of [[0.78, 0.05, 0.45, 2.02], [0.78, 0.05, 0.45, 1.08], [0.05, 0.98, 0.07, 1.55], [0.05, 0.98, 0.83, 1.55]]) B(w, h, 0.04, lam(null, 0x9a9a92), x, y, -0.73, scene);
    { const cb = L.cvs(32, 24, (c) => { c.fillStyle = '#8a6a40'; c.fillRect(0, 0, 32, 24); const r = L.rng(5); for (let k = 0; k < 6; k++) { c.fillStyle = ['#e8e4d8', '#e8d880', '#d8e8f0'][k % 3]; c.fillRect(r() * 24 | 0, r() * 18 | 0, 6, 5); c.fillStyle = '#c02020'; c.fillRect(0, 0, 0, 0); } c.fillStyle = '#4a3018'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 23, 32, 1); });
      L.plane(0.6, 0.45, lam(cb), -0.55, 1.45, -0.74, scene); }
    // ---- the radio (base station): body 0.24 x 0.09 x 0.2, origin = bottom centre front
    const RW = 0.24, RH = 0.09, RD = 0.2, radio = new THREE.Group(); radio.position.set(0.05, DY, 0.02); radio.rotation.y = 0.22; scene.add(radio);
    const tFace = L.cvs(96, 36, (c, w, h) => {   // front face: speaker grille left, dial window right (drawn on top), labels
      px(c, 0, 0, '#2c2e32', w, h); px(c, 0, 0, '#45484e', w, 2); px(c, 0, h - 2, '#141518', w, 2);
      px(c, 4, 4, '#18191c', 40, 28);
      for (let y = 6; y < 31; y += 3) for (let x = 6; x < 43; x += 3) px(c, x, y, '#050506', 2, 2);   // grille holes
      px(c, 4, 4, '#55585e', 40, 1);
      px(c, 50, 25, '#d8d8d0', 10, 1); px(c, 64, 25, '#d8d8d0', 6, 1); px(c, 76, 25, '#d8d8d0', 12, 1);   // knob captions
      px(c, 50, 3, '#c8c8c0', 18, 2);   // brand strip
    });
    const tSide = tMetal(73, '#3a3c40');
    const mBody = lam(tSide), mFace = lam(tFace);
    B(RW, RH, RD, [mBody, mBody, mBody, mBody, mFace, mBody], 0, RH / 2, -RD / 2, radio);
    B(RW + 0.012, 0.012, RD + 0.01, lam(null, 0x1e1f22), 0, RH + 0.003, -RD / 2, radio);   // top lip
    for (const sx of [-1, 1]) B(0.02, 0.012, 0.02, lam(null, 0x101012), sx * (RW / 2 - 0.02), -0.004, -0.03, radio);   // feet
    // dynamic dial window (green LCD): frequency + voice waveform + VU LEDs
    const lcdCv = document.createElement('canvas'); lcdCv.width = 48; lcdCv.height = 18;
    const lcdTex = L.canvasTex(lcdCv), lc = lcdCv.getContext('2d');
    const lcd = L.plane(0.095, 0.036, L.basic(lcdTex), 0.045, 0.058, 0.0012, radio);
    B(0.103, 0.044, 0.004, lam(null, 0x111214), 0.045, 0.058, -0.0025, radio);   // bezel
    function drawLcd(t) {
      const a = voiceAmp(t), q = L.q15(t);
      lc.fillStyle = '#1e5a26'; lc.fillRect(0, 0, 48, 18); lc.fillStyle = '#2a7a34'; lc.fillRect(0, 0, 48, 1);
      lc.fillStyle = '#9cff8a'; lc.font = 'bold 7px monospace'; lc.textBaseline = 'top'; lc.fillText('155.47', 2, 1);
      lc.fillStyle = '#6ae070'; lc.fillRect(36, 2, 2, 5); lc.fillRect(40, 3, 2, 4); lc.fillRect(44, 1, 2, 6);   // signal bars
      // waveform: sine bundle scaled by the voice amplitude
      lc.fillStyle = '#c8ffb0';
      let prev = 12;
      for (let x = 1; x < 47; x++) {
        const v = Math.sin(x * 0.9 + q * 23) * 0.6 + Math.sin(x * 2.3 - q * 31) * 0.4, y = Math.round(12.5 + v * (0.6 + 4.2 * a));
        const lo = Math.min(y, prev), hi = Math.max(y, prev); lc.fillRect(x, lo, 1, hi - lo + 1); prev = y;
      }
      lcdTex.needsUpdate = true;
    }
    // knobs + channel buttons
    const mKnob = lam(null, 0x18181a), mCap = lam(null, 0xb8b8b0);
    for (const [x, r] of [[0.0, 0.011], [0.032, 0.009], [0.07, 0.012]]) { const k = cyl(r, r, 0.014, 8, mKnob, x + 0.005, 0.02, 0.007, radio); k.rotation.x = Math.PI / 2; const p = B(0.002, r * 0.9, 0.002, mCap, x + 0.005, 0.02 + r * 0.45, 0.0145, radio); void p; }
    // red power LED (blinks) + its glow
    const led = B(0.008, 0.008, 0.004, L.basic(null, 0xff2a1a), -0.075, 0.078, 0.002, radio);
    const glowTex = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,80,50,0.9)'); g.addColorStop(1, 'rgba(255,40,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
    const glow = L.plane(0.04, 0.04, L.basic(glowTex, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), -0.075, 0.078, 0.006, radio);
    // TX green LED (lights while she talks)
    const tx = B(0.006, 0.006, 0.004, L.basic(null, 0x40ff50), -0.06, 0.078, 0.002, radio);
    // antenna (whip with a ball) on the back right
    cyl(0.007, 0.009, 0.02, 6, mKnob, 0.09, RH + 0.01, -0.17, radio);
    const ant = cyl(0.0025, 0.004, 0.36, 5, lam(null, 0x2a2a2c), 0.09, RH + 0.19, -0.17, radio); ant.rotation.z = -0.12; ant.rotation.x = -0.08;
    cyl(0.006, 0.006, 0.01, 6, lam(null, 0x1a1a1a), 0.09 + 0.02, RH + 0.37, -0.185, radio);
    // hand mic on its hook (left side) + coiled cord
    { const mic = new THREE.Group(); mic.position.set(-RW / 2 - 0.035, 0.06, -0.04); mic.rotation.z = 0.15; radio.add(mic);
      B(0.04, 0.07, 0.025, lam(null, 0x1a1a1c), 0, 0, 0, mic); B(0.03, 0.035, 0.002, lam(L.cvs(8, 8, (c) => { c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#3a3a3a'; for (let y = 1; y < 8; y += 2) c.fillRect(1, y, 6, 1); })), 0, 0.012, 0.0135, mic);
      B(0.012, 0.016, 0.006, lam(null, 0x4a4a4c), -0.022, -0.005, 0, mic);   // PTT
      const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push(V(-RW / 2 - 0.035 + 0.05 * Math.sin(u * 3), 0.025 - 0.02 * u + 0.008 * Math.sin(u * 60), -0.04 - 0.1 * u + 0.008 * Math.cos(u * 60))); }
      const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.003, 4), lam(null, 0x101012)); radio.add(cord); }
    const c05 = cam(38);
    const tR = W05.radio - W05.t0, tSev = W05.seven - W05.t0, tRules = [W05.lights, W05.gate, W05.open].map((x) => x - W05.t0);
    out['05_radio'] = { scene, camera: c05, update(lt, t) {
      const k = L.smooth(lt / 4.15);
      look(c05, V(0.03 - 0.01 * k, 1.1 - 0.02 * k, 0.8 - 0.08 * k), V(0.06, 0.93, -0.08));
      drawLcd(t);
      const blink = Math.floor(L.q15(lt) * 2.5) % 2 === 0;
      led.material.color.set(blink ? 0xff2a1a : 0x6a1008); glow.visible = blink;
      tx.material.color.set(voiceAmp(t) > 0.4 ? 0x60ff60 : 0x1a4a1c);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.5);
      const c = o.tctx, open = L.smooth((lt - tR) / 0.16);
      if (open <= 0) return;
      // RE FILE panel (dark navy paper, blue double frame), slides in from the right on "radio"
      const X = Math.round(146 + (1 - open) * 220), Y = 120, Wd = 206, Hd = 272;
      c.fillStyle = 'rgba(6,10,26,0.93)'; c.fillRect(X, Y, Wd, Hd);
      c.fillStyle = 'rgba(40,60,120,0.18)'; for (let y = Y + 3; y < Y + Hd - 3; y += 2) c.fillRect(X + 2, y, Wd - 4, 1);
      c.fillStyle = '#5a7ad8'; c.fillRect(X, Y, Wd, 1); c.fillRect(X, Y + Hd - 1, Wd, 1); c.fillRect(X, Y, 1, Hd); c.fillRect(X + Wd - 1, Y, 1, Hd);
      c.fillStyle = '#26386e'; c.fillRect(X + 3, Y + 3, Wd - 6, 1); c.fillRect(X + 3, Y + Hd - 4, Wd - 6, 1); c.fillRect(X + 3, Y + 3, 1, Hd - 6); c.fillRect(X + Wd - 4, Y + 3, 1, Hd - 6);
      // FILE tab
      c.fillStyle = '#26386e'; c.fillRect(X + 8, Y - 15, 52, 16); c.fillStyle = '#5a7ad8'; c.fillRect(X + 8, Y - 15, 52, 1); c.fillRect(X + 8, Y - 15, 1, 15); c.fillRect(X + 59, Y - 15, 1, 15);
      bitText(c, 'FILE', X + 34, Y - 7, 2, '#e8ecff', { outline: null });
      const cx = X + Wd / 2, L1 = (s, y, col, sc = 1, k = 1) => { if (k > 0) bitText(c, s, cx, y, sc, mixHex('#06091a', col, k), { outline: null }); };
      const left = (s, y, col, k) => { if (k <= 0) return; const w = textWidth(s, 2); bitText(c, s, X + 14 + w / 2, y, 2, mixHex('#06091a', col, k), { outline: null }); };
      L1('EMERGENCY', Y + 20, '#ff5a40', 2, fadeIn(lt, tR + 0.08)); L1('BROADCAST', Y + 38, '#ff5a40', 2, fadeIn(lt, tR + 0.08));
      c.fillStyle = mixHex('#06091a', '#5a7ad8', fadeIn(lt, tR + 0.08)); c.fillRect(X + 12, Y + 52, Wd - 24, 1);
      // "HELP ARRIVES / IN 7 DAYS" on "seven" (white flash on landing)
      const ks = fadeIn(lt, tSev, 0.08);
      L1('HELP ARRIVES', Y + 68, '#e8ecff', 2, ks);
      if (ks > 0) { const fl = lt - tSev < 0.1; L1('IN 7 DAYS', Y + 98, fl ? '#ffffff' : '#ffe048', 3, ks); }
      c.fillStyle = mixHex('#06091a', '#5a7ad8', ks); c.fillRect(X + 12, Y + 122, Wd - 24, 1);
      if (ks > 0) L1('RULES', Y + 136, '#9aa8d8', 1, ks);
      // the rules, one per word
      ['1. LIGHTS OFF', '2. GATE LOCKED', '3. OPEN FOR NO ONE'].forEach((s, i) => {
        const kr = fadeIn(lt, tRules[i], 0.06); if (kr <= 0) return;
        const y = Y + 164 + i * 36, fl = lt - tRules[i] < 0.1;
        if (fl) { c.fillStyle = 'rgba(120,150,255,0.35)'; c.fillRect(X + 5, y - 12, Wd - 10, 24); }
        left(s, y, fl ? '#ffffff' : '#e8ecff', kr);
        c.fillStyle = mixHex('#06091a', '#ff4a34', kr); c.fillRect(X + 6, y - 3, 4, 6);   // red bullet
      });
    } };
  }

  // ======================================================================================================
  // 07_armory (15.3-17.2): empty armory, Ava walks in with a flashlight, stops and shrugs at camera
  // ======================================================================================================
  {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x04060a); scene.fog = new THREE.Fog(0x04060a, 3.5, 9);
    scene.add(new THREE.HemisphereLight(0x7080b0, 0x2a2420, 0.7));
    const corridor = new THREE.PointLight(0x5a80ff, 3.0, 4, 1.2); corridor.position.set(0, 1.8, -3.2); scene.add(corridor);   // blue light from the corridor
    const fill = new THREE.PointLight(0xffc890, 0.9, 5, 1.5); fill.position.set(0.4, 1.7, 1.6); scene.add(fill);               // faint warm fill
    const torch = new THREE.SpotLight(0xfff0c8, 9, 7, 0.42, 0.45, 1.2); scene.add(torch); scene.add(torch.target);
    const ZB = -2.2, XW = 1.75, HH = 2.7;
    const mWall = lam(L.rep(tBlock(64, '#5e6e5c', '#b0ac96', 30), 2.4, 1.6));
    // walls: back (with doorway x [-0.48, 0.48], y < 2.1), sides, floor, ceiling
    const wall = (x0, x1, y0, y1) => L.plane(x1 - x0, y1 - y0, mWall, (x0 + x1) / 2, (y0 + y1) / 2, ZB, scene);
    wall(-XW, -0.48, 0, HH); wall(0.48, XW, 0, HH); wall(-0.48, 0.48, 2.1, HH);
    L.plane(5, HH, mWall, -XW, HH / 2, 0, scene, Math.PI / 2); L.plane(5, HH, mWall, XW, HH / 2, 0, scene, -Math.PI / 2);
    L.plane(3.6, 5, lam(L.rep(tLino, 3.6, 5)), 0, 0, 0.3, scene, 0, -Math.PI / 2);
    L.plane(3.6, 5, lam(null, 0x1a1a1c), 0, HH, 0.3, scene, 0, Math.PI / 2);
    // door frame + open steel door + dark corridor
    const mFr = lam(tMetal(81, '#4a5048'));
    B(0.08, 2.14, 0.14, mFr, -0.52, 1.07, ZB, scene); B(0.08, 2.14, 0.14, mFr, 0.52, 1.07, ZB, scene); B(1.12, 0.08, 0.14, mFr, 0, 2.14, ZB, scene);
    { const d = B(0.94, 2.06, 0.05, lam(tMetal(82, '#55604e')), 0.47, 1.03, 0, null); const g = new THREE.Group(); g.position.set(-0.47, 0, ZB - 0.04); g.rotation.y = 1.9; g.add(d); scene.add(g); }
    L.plane(3, 3, lam(L.rep(tLino, 3, 3)), 0, 0.001, ZB - 1.5, scene, 0, -Math.PI / 2);
    L.plane(3, 2.6, lam(L.rep(tBlock(65, '#3e4a40', '#6e6c60', 30), 2, 1.6)), 0, 1.3, ZB - 2.8, scene);
    // stencil sign over the door
    L.plane(0.9, 0.18, lam(L.cvs(48, 10, (c) => { c.fillStyle = '#c8b030'; c.fillRect(0, 0, 48, 10); c.fillStyle = '#141414'; c.font = 'bold 8px monospace'; c.textBaseline = 'top'; c.fillText('ARMORY', 9, 1); c.fillRect(0, 0, 48, 1); c.fillRect(0, 9, 48, 1); })), 0, 2.38, ZB + 0.01, scene);
    // unlit fluorescent fixture
    B(1.2, 0.06, 0.24, lam(null, 0x8a8a84), 0, HH - 0.04, -0.6, scene); B(1.1, 0.02, 0.18, lam(null, 0xbcbcb4), 0, HH - 0.075, -0.6, scene);
    // empty gun racks on the back wall (left and right of the door): wooden back, slotted bottom rest, top bar with notches, chain
    const mRack = lam(tWood(83, '#6a4428', '#3a2010'));
    for (const sx of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(sx * 1.12, 0, ZB + 0.12); scene.add(g);
      B(1.0, 1.5, 0.04, mRack, 0, 1.15, -0.08, g);
      B(1.0, 0.12, 0.2, mRack, 0, 0.5, 0.0, g);
      for (let k = 0; k < 6; k++) B(0.05, 0.13, 0.21, lam(null, 0x1a0e06), -0.4 + k * 0.16, 0.51, 0.0, g);   // butt slots
      B(1.0, 0.06, 0.14, mRack, 0, 1.62, -0.02, g);
      for (let k = 0; k < 6; k++) B(0.04, 0.065, 0.15, lam(null, 0x140a04), -0.4 + k * 0.16, 1.62, -0.01, g);   // barrel notches
      const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push(V(-0.48 + 0.96 * u, 1.5 - 0.12 * Math.sin(u * Math.PI), 0.07)); }
      for (let i = 0; i < 12; i++) { const m = B(0.05, 0.018, 0.018, lam(null, 0x8a8a8a), (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2, 0.07, g); m.rotation.z = Math.atan2(pts[i + 1].y - pts[i].y, pts[i + 1].x - pts[i].x); m.rotation.x = i % 2 ? 0 : Math.PI / 2; }
      B(0.08, 0.1, 0.03, lam(null, 0x9a8a40), -0.48, 1.5, 0.07, g);   // padlock
    }
    // lockers along the left wall (one door open, empty)
    const tLock = L.cvs(16, 64, (c, w, h) => { const r = L.rng(85); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 12 - 6; px(c, x, y, rgb(98 + n, 112 + n, 104 + n)); }
      for (const y0 of [5, 52]) for (let y = y0; y < y0 + 7; y += 2) px(c, 3, y, '#1a1e1c', 10, 1);
      px(c, 12, 28, '#c8c8c0', 2, 6); px(c, 0, 0, '#4a5450', 1, h); px(c, 0, 0, '#c0c8c0', w, 1); px(c, 5, 15, '#d8d8c8', 6, 3); });
    const mLock = lam(tLock), mLockS = lam(null, 0x56645c), mIn = lam(null, 0x2a302c);
    for (let k = 0; k < 4; k++) {
      const z = -1.6 + k * 0.42, g = new THREE.Group(); g.position.set(-XW + 0.26, 0, z); scene.add(g);
      B(0.5, 1.9, 0.4, [mLockS, mLockS, mLockS, mLockS, mLockS, mLockS], 0, 0.97, 0, g);
      if (k === 2) {
        B(0.44, 1.8, 0.38, mIn, 0.02, 0.97, 0, g);   // dark empty inside
        B(0.42, 0.02, 0.36, mLockS, 0.04, 1.55, 0, g);   // shelf
        const d = B(0.02, 1.84, 0.38, mLock, 0, 0.97, 0.19, null); const h = new THREE.Group(); h.position.set(0.26, 0, -0.19 + 0.0); g.add(h); h.rotation.y = -1.25; h.add(d); d.position.set(0, 0.97, 0.19); d.rotation.y = Math.PI / 2;
      } else { const d = L.plane(0.38, 1.84, mLock, 0.252, 0.97, 0, g, Math.PI / 2); void d; }
    }
    // empty steel shelving on the right wall with ONE lone ammo box
    const mShelf = lam(tMetal(86, '#7a7e80'));
    { const g = new THREE.Group(); g.position.set(XW - 0.3, 0, -0.9); scene.add(g);
      for (const [dx, dz] of [[-0.18, -0.6], [-0.18, 0.6], [0.18, -0.6], [0.18, 0.6]]) B(0.035, 2.0, 0.035, mShelf, dx, 1.0, dz, g);
      for (let k = 0; k < 5; k++) { B(0.4, 0.025, 1.24, mShelf, 0, 0.12 + k * 0.44, 0, g); B(0.02, 0.05, 1.24, mShelf, -0.2, 0.15 + k * 0.44, 0, g); }
      // dust outlines where boxes used to be
      const dust = lam(L.cvs(16, 16, (c) => { c.fillStyle = '#8a8e8e'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#5a5e5e'; c.fillRect(2, 2, 12, 12); }));
      for (const [k, z] of [[1, -0.35], [2, 0.3], [3, -0.1], [2, -0.4]]) L.plane(0.22, 0.18, dust, 0, 0.135 + k * 0.44, z, g, 0, -Math.PI / 2);
      const ab = Rammo(g, -0.02, 0.133 + 2 * 0.44, -0.05, 1.3); ab.rotation.y = Math.PI / 2 + 0.25;
    }
    const AMMO = V(XW - 0.32, 0.133 + 2 * 0.44 + 0.03, -0.95);
    // a toppled empty crate + a spent cartridge on the floor
    { const cr = B(0.5, 0.3, 0.36, lam(tWood(87, '#9a7448', '#5a3e20')), 0.9, 0.15, 0.6, scene); cr.rotation.y = 0.4; B(0.5, 0.02, 0.36, lam(null, 0x2a1a0c), 0.9, 0.305, 0.6, scene).rotation.y = 0.4; }
    // ---- Ava + flashlight
    const ch = L.hero(); scene.add(ch.root);
    const fl = new THREE.Group();
    { const mB = lam(null, 0x1a1a1c); const b = cyl(0.016, 0.016, 0.13, 8, mB, 0, 0, 0, fl); b.rotation.z = Math.PI / 2;
      const h = cyl(0.026, 0.018, 0.05, 8, mB, 0.08, 0, 0, fl); h.rotation.z = Math.PI / 2;
      const lens = cyl(0.022, 0.022, 0.004, 8, L.basic(null, 0xfff6c0), 0.106, 0, 0, fl); lens.rotation.z = Math.PI / 2; }
    L.holdIn(ch, fl, 'R', [0, 0.7, 0.25], [0, 0, 0]);
    const lensGlow = L.plane(0.05, 0.05, L.basic(L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); }), 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0, 0, scene);
    const c07 = cam(50);
    const Z0 = -2.55, Z1 = -0.85;
    out['07_armory'] = { scene, camera: c07, update(lt, t) {
      // walk in (decelerating), stop, shrug at camera on "armory"
      const u = L.clamp01(lt / R07_STOP), z = Z0 + (Z1 - Z0) * (u * (2 - u) * 0.35 + u * 0.65);
      ch.root.position.set(0.05, 0, z); ch.root.rotation.y = 0;
      const tw = W07.armory - W07.t0;
      const eyes = lt < 0.25 ? 'open' : lt < R07_SHRUG + 0.3 ? 'half' : lt > tw + 0.45 ? 'wink' : 'relaxed';
      ch.pose(lt, [L.seg('walk', 0, { loop: true }), L.seg('shrug', R07_SHRUG, { fade: 0.2 })], [[-99, eyes, mouthAt(t, lt > R07_SHRUG ? 'smile' : 'neutral')]]);
      const k = L.smooth((lt - 0.9) / 1.0);
      look(c07, V(0.12, 1.42 - 0.04 * k, 1.75 - 0.35 * k), V(0.04, 1.1 + 0.03 * k, -1.1));
      ch.lookAt(c07, L.smooth((lt - 0.55) / 0.3), 40);
      // flashlight beam: from the lens, sweeping the lockers -> the shelves, landing on the lone ammo box on "armory"
      ch.root.updateMatrixWorld(true);
      const lp = fl.localToWorld(V(0.11, 0, 0));
      const on = lt > 0.03;
      torch.visible = on; lensGlow.visible = on;
      torch.position.copy(lp);
      const sweep = L.smooth(lt / 1.1);
      torch.target.position.copy(V(-1.6, 0.9, -1.2).lerp(AMMO, sweep));
      lensGlow.position.copy(lp); lensGlow.lookAt(c07.position);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5) };
  }

  // ======================================================================================================
  // 09_cooler (21.0-25.75): Ava next to the office water cooler; push-in to the jug on "water"; "1 GALLON / DAY" on "gallon"
  // ======================================================================================================
  {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070d); scene.fog = new THREE.Fog(0x05070d, 3.5, 9);
    scene.add(new THREE.HemisphereLight(0x8090c0, 0x2a2420, 0.8));
    const win = new THREE.DirectionalLight(0x6a90ff, 1.3); win.position.set(-1.5, 2.0, 1.0); scene.add(win);   // blue window light from the left
    const lamp = new THREE.PointLight(0xffb870, 2.6, 4, 1.3); lamp.position.set(1.3, 1.5, 1.2); scene.add(lamp);   // desk lamp right
    const mWall = lam(L.rep(tBlock(91, '#4e5e50', '#aaa690', 28), 3, 2.0));
    L.plane(5, 2.7, mWall, 0, 1.35, -0.5, scene);
    L.plane(5, 4, lam(L.rep(tLino, 5, 4)), 0, 0, 1.4, scene, 0, -Math.PI / 2);
    L.plane(4, 2.7, mWall, -1.9, 1.35, 1.4, scene, Math.PI / 2);
    // blinds window on the side wall (left) + bulletin board + "CITY POLICE" notice, clock
    L.plane(1.0, 1.0, L.basic(L.rep(tBlinds, 1, 1)), -1.89, 1.55, 0.6, scene, Math.PI / 2);
    { const bb = L.cvs(48, 32, (c) => { c.fillStyle = '#8a6a40'; c.fillRect(0, 0, 48, 32); const r = L.rng(92);
        for (let k = 0; k < 8; k++) { c.fillStyle = ['#e8e4d8', '#e8d880', '#f0f0f0', '#d8e8f0'][k % 4]; const x = r() * 40 | 0, y = r() * 24 | 0; c.fillRect(x, y, 8, 7); c.fillStyle = '#5a5a5a'; c.fillRect(x + 1, y + 2, 6, 1); c.fillRect(x + 1, y + 4, 4, 1); c.fillStyle = '#c02020'; c.fillRect(x + 3, y, 2, 1); }
        c.fillStyle = '#4a3018'; c.fillRect(0, 0, 48, 1); c.fillRect(0, 31, 48, 1); c.fillRect(0, 0, 1, 32); c.fillRect(47, 0, 1, 32); });
      L.plane(0.9, 0.6, lam(bb), -0.75, 1.55, -0.49, scene);
      const ck = L.cvs(16, 16, (c) => { c.fillStyle = '#f0ece0'; c.beginPath(); c.arc(8, 8, 7.5, 0, 7); c.fill(); c.strokeStyle = '#1a1a1a'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#1a1a1a'; c.fillRect(8, 3, 1, 5); c.fillRect(8, 8, 4, 1); });
      L.plane(0.26, 0.26, lam(ck, 0xffffff, { alphaTest: 0.5 }), 0.75, 2.15, -0.49, scene); }
    // filing cabinet (right) with the desk lamp on it
    { const g = new THREE.Group(); g.position.set(1.05, 0, -0.2); scene.add(g); const mC = lam(tMetal(93, '#6e7470'));
      B(0.46, 1.3, 0.55, mC, 0, 0.65, 0, g); for (let k = 0; k < 4; k++) { B(0.42, 0.3, 0.01, lam(null, 0x7a807a), 0, 0.17 + k * 0.32, 0.28, g); B(0.12, 0.02, 0.02, lam(null, 0xc8c8c0), 0, 0.27 + k * 0.32, 0.29, g); B(0.08, 0.04, 0.005, lam(null, 0xe8e4d4), 0, 0.22 + k * 0.32, 0.288, g); }
      cyl(0.06, 0.07, 0.03, 8, lam(null, 0x2a4a2a), 0.05, 1.315, 0, g); cyl(0.01, 0.01, 0.3, 5, lam(null, 0xb09040), 0.05, 1.47, 0, g);
      const sh = cyl(0.07, 0.11, 0.1, 8, lam(null, 0x2a6a3a, { side: THREE.DoubleSide }), 0.05, 1.62, 0.03, g); sh.rotation.x = 0.3;
      const bulb = L.mesh(new THREE.SphereGeometry(0.03, 6, 4), L.basic(null, 0xfff0c0), 0.05, 1.575, 0.045, g); void bulb; }
    // ---- water cooler: grey base cabinet, white top, two taps, drip tray, blue 5-gal jug, cup holder
    const CX = 0.36, cooler = new THREE.Group(); cooler.position.set(CX, 0, -0.12); scene.add(cooler);
    const tCab = L.cvs(32, 64, (c, w, h) => { const r = L.rng(94); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5; px(c, x, y, y < 22 ? rgb(226 + n, 228 + n, 226 + n) : rgb(150 + n, 154 + n, 156 + n)); }
      px(c, 6, 4, '#3a3e44', 20, 14); px(c, 7, 5, '#5a6068', 18, 12);   // tap recess
      px(c, 0, 22, '#6a6e72', w, 1); for (let y = 50; y < 62; y += 2) px(c, 6, y, '#2a2c30', 20, 1);   // vent
      px(c, 9, 26, '#e8e8e4', 14, 4); px(c, 10, 27, '#3a6ac8', 5, 2); px(c, 17, 27, '#c83a3a', 5, 2); });
    const mCab = lam(tCab), mCabS = lam(null, 0xbcbfc0), mTop = lam(null, 0xe4e6e4);
    B(0.32, 0.92, 0.32, [mCabS, mCabS, mTop, mCabS, mCab, mCabS], 0, 0.46, 0, cooler);
    B(0.34, 0.04, 0.34, mTop, 0, 0.94, 0, cooler);
    cyl(0.07, 0.09, 0.05, 8, lam(null, 0xd0d4d6), 0, 0.985, 0, cooler);   // jug collar
    for (const [x, col] of [[-0.05, 0x2a5ad0], [0.05, 0xd03a2a]]) { B(0.03, 0.03, 0.04, lam(null, col), x, 0.79, 0.175, cooler); B(0.012, 0.025, 0.012, lam(null, 0xdedede), x, 0.765, 0.19, cooler); }
    B(0.2, 0.02, 0.08, lam(null, 0x3a3e44), 0, 0.69, 0.19, cooler);   // drip tray
    // cup dispenser on the side
    cyl(0.032, 0.032, 0.22, 8, lam(null, 0xd8dcd8), 0.2, 0.62, 0.05, cooler); cyl(0.034, 0.03, 0.03, 8, L.basic(null, 0xf4f4f0), 0.2, 0.495, 0.05, cooler);
    // jug: translucent blue body + darker water inside, ridges, neck down into the collar
    const jug = new THREE.Group(); jug.position.set(0, 1.0, 0); cooler.add(jug);
    const tJug = L.cvs(32, 32, (c, w, h) => { for (let y = 0; y < h; y++) { const k = 0.85 + 0.15 * Math.sin(y * 0.8); px(c, 0, y, rgb(80 * k, 150 * k, 230 * k), w, 1); }
      for (const y of [6, 13, 20, 27]) px(c, 0, y, 'rgba(220,240,255,0.7)', w, 1);
      px(c, 6, 0, 'rgba(255,255,255,0.55)', 2, h); px(c, 9, 0, 'rgba(255,255,255,0.25)', 1, h);
      c.fillStyle = '#e8f0ff'; c.fillRect(14, 10, 12, 8); c.fillStyle = '#2a4a9a'; c.fillRect(15, 12, 10, 1); c.fillRect(15, 14, 7, 1); });
    const mJug = L.lam(tJug, 0xffffff, { transparent: true, opacity: 0.78 });
    const body = cyl(0.135, 0.135, 0.36, 12, mJug, 0, 0.27, 0, jug); void body;
    cyl(0.135, 0.06, 0.07, 12, mJug, 0, 0.065, 0, jug);   // shoulder (upside down: neck at the bottom)
    cyl(0.135, 0.12, 0.04, 12, mJug, 0, 0.47, 0, jug);    // bottom (up)
    cyl(0.04, 0.04, 0.05, 8, lam(null, 0x4a7ad0), 0, 0.01, 0, jug);
    const water = cyl(0.12, 0.12, 0.3, 10, L.basic(null, 0x1e5ab8, { transparent: true, opacity: 0.55, depthWrite: false }), 0, 0.22, 0, jug);
    const bubbles = [];
    for (let i = 0; i < 9; i++) { const b = L.mesh(new THREE.SphereGeometry(0.012 + (i % 3) * 0.006, 5, 4), L.basic(null, 0xd8f0ff, { transparent: true, opacity: 0.85 }), 0, 0, 0, jug); bubbles.push(b); }
    // ---- Ava, frontal, on the cooler's left
    const ch = L.hero(); scene.add(ch.root);
    // pistol (ep2 room.js 01_hero): grip in the right fist, slide racks with the reload frames
    const RL = {};
    const fixIn = (prop, side, mW) => { ch.hand(side).add(prop); ch.hand(side).matrixWorld.clone().invert().multiply(mW).decompose(prop.position, prop.quaternion, prop.scale); };
    const pg = await L.loadModel('models/pistol-retro.glb');
    const pistolRaw = L.ps1Clone(pg.scene, { lit: true });
    const pistol = new THREE.Group(); pistol.add(pistolRaw);
    { const b = new THREE.Box3().setFromObject(pistolRaw), s = b.getSize(V()), k = 0.2 / Math.max(s.x, s.y, s.z); pistolRaw.scale.multiplyScalar(k); const b2 = new THREE.Box3().setFromObject(pistolRaw), c = b2.getCenter(V()); pistolRaw.position.sub(c); }
    {
      pistol.updateMatrixWorld(true);
      const part = (n) => new THREE.Box3().setFromObject(pistol.getObjectByName(n)).getCenter(V());
      const mag = part('Pistol_magazine'), slide = part('Pistol_toppart'), m0 = pistol.getObjectByName('Pistol_magazine').matrixWorld;
      const fwdG = V(-1, 0, 0).transformDirection(m0), upG = V(0, 0, -1).transformDirection(m0);
      const grip = mag.clone().lerp(slide, 0.22);
      const loc = (o, p0, d) => { const a0 = o.parent.worldToLocal(p0.clone()), a1 = o.parent.worldToLocal(p0.clone().add(d)); return a1.sub(a0); };
      const so = pistol.getObjectByName('Pistol_toppart');
      RL.slide = so; RL.slide0 = so.position.clone(); RL.slideD = loc(so, slide, fwdG.clone().multiplyScalar(-0.035));
      ch.root.position.set(0.3, 0, 0.62); ch.root.rotation.y = 0; ch.pose(0, L.still('pistol_ready', 0.4)); ch.root.updateMatrixWorld(true);
      const fwdW = V(-0.75, -0.5, 0.75).normalize(), upW = V(0, 1, 0).sub(fwdW.clone().multiplyScalar(fwdW.y)).normalize();
      const bas = (f, u) => new THREE.Matrix4().makeBasis(f, u, f.clone().cross(u));
      const q = new THREE.Quaternion().setFromRotationMatrix(bas(fwdW, upW).multiply(bas(fwdG, upG).transpose()));
      const palm = ch.hand('R').localToWorld(V(0, 0.55, 0.15));
      fixIn(pistol, 'R', new THREE.Matrix4().compose(palm.clone().sub(grip.clone().applyQuaternion(q)), q, V(1, 1, 1)));
    }
    function reloadProps(lt) {   // frames of 'reload' (build_anim.py A_reload): slide racks f36-42
      const f = L.q15(lt) * 30 + 1, k = f < 36 ? 0 : f < 40 ? (f - 36) / 4 : f < 42 ? 1 - (f - 40) / 2 : 0;
      RL.slide.position.copy(RL.slide0).addScaledVector(RL.slideD, Math.max(0, k));
    }
    const tRel = R09_RELOAD - W09.t0;
    const c09 = cam(46);
    const tWat = W09.water - W09.t0, tGal = W09.gallon - W09.t0, tDay = W09.day - W09.t0;
    out['09_cooler'] = { scene, camera: c09, update(lt, t) {
      ch.root.position.set(-0.36, 0, 0.12); ch.root.rotation.y = 0.12;
      const eyes = lt > tRel + 0.27 && lt < tRel + 1.45 ? 'angry' : lt > 1.62 && lt < 1.72 ? 'blink' : lt > tWat - 0.1 && lt < tWat + 0.6 ? 'surprised' : lt > tDay ? 'wink' : lt > tGal ? 'happy' : 'open';
      ch.pose(lt, [L.seg('reload', tRel), L.seg('pistol_ready', tRel + 1.95, { from: 0.4, speed: 0.3, fade: 0.2 }), L.seg('hands_on_hips', tWat - 0.3, { fade: 0.25 })],
        [[-99, eyes, mouthAt(t, lt > tWat ? 'smile' : 'neutral')]]);
      // medium frontal -> push-in to the jug on "water" (smooth, no shake)
      const k = L.smooth((lt - (tWat - 0.05)) / 0.9), drift = lt * 0.02;
      const p = V(-0.04, 1.28, 2.6 - drift).lerp(V(0.02, 1.34, 1.85), k), tg = V(-0.04, 1.06, 0).lerp(V(0.04, 1.2, -0.1), k);
      look(c09, p, tg);
      ch.lookAt(c09, 1, 40);
      reloadProps(lt - tRel);
      // glug: bubbles rise in the jug after "water" (and a second burst)
      for (let i = 0; i < bubbles.length; i++) {
        const st = tWat + 0.05 + (i % 5) * 0.07 + (i >= 5 ? 0.42 : 0), u = (lt - st) / 0.55;
        const b = bubbles[i]; b.visible = u > 0 && u < 1;
        if (b.visible) b.position.set(0.04 * Math.sin(i * 2.1 + u * 4), 0.05 + 0.4 * u, 0.04 * Math.cos(i * 1.7) + 0.02);
      }
      water.scale.y = 1 - 0.04 * L.smooth((lt - tWat) / 1.2);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45);
      if (lt < tGal) return;
      const k = fadeIn(lt, tGal, 0.08), p = L.toScreen(c09, CX, 1.42, 0.02);
      Rlabel(o, '1 GALLON / DAY', Math.min(282, p[0] + 10), p[1] - 92, '#5ab4ff', p, [0.5, 1], k, { sc: 2 });
      if (lt > tGal + 0.1) Rlabel(o, 'PER PERSON  (FEMA)', Math.min(282, p[0] + 10), p[1] - 66, '#9ab0c8', null, [0.5, 0], fadeIn(lt, tGal + 0.1));
    } };
  }

  // ======================================================================================================
  // 12_save (34.2-38.6): RE save room — green typewriter, item box, herb, one warm lamp; Ava types. YES/NO + typed sheet
  // ======================================================================================================
  {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070504); scene.fog = new THREE.Fog(0x070504, 3.2, 8);
    scene.add(new THREE.HemisphereLight(0x8090b0, 0x2a2018, 0.55));
    const lampL = new THREE.PointLight(0xffa850, 4.5, 3.6, 1.2); lampL.position.set(0.55, 1.25, 0.45); scene.add(lampL);   // the only lamp
    const blue = new THREE.DirectionalLight(0x5a7ae0, 0.6); blue.position.set(-2, 2, 1); scene.add(blue);
    const TY = 0.78;   // table height
    // room: wood panelling below, dark green wallpaper above, plank floor
    const tPanel = L.cvs(32, 64, (c, w, h) => { const r = L.rng(101);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 12 - 6, top = y < 30;
        px(c, x, y, top ? rgb(40 + n, 62 + n, 48 + n) : rgb(96 + n + 10 * Math.sin(x * 0.7 + y * 0.08), 58 + n, 32 + n)); }
      for (let y = 4; y < 28; y += 8) for (let x = (y % 16 ? 4 : 12); x < w; x += 16) { px(c, x, y, '#5a7a50', 2, 2); }
      px(c, 0, 30, '#3a2010', w, 2); px(c, 0, 32, '#7a4a28', w, 1); px(c, 15, 34, '#4a2a14', 1, 30); px(c, 0, 62, '#2a160a', w, 2); });
    const mW = lam(L.rep(tPanel, 4, 1)); L.plane(4, 2.6, mW, 0, 1.3, -0.9, scene);
    L.plane(4, 2.6, lam(L.rep(tPanel, 4, 1)), -1.6, 1.3, 0.6, scene, Math.PI / 2); L.plane(4, 2.6, lam(L.rep(tPanel, 4, 1)), 1.6, 1.3, 0.6, scene, -Math.PI / 2);
    L.plane(3.2, 3.2, lam(L.rep(tWood(102, '#6a4226', '#3a2010'), 6, 2)), 0, 0, 0.6, scene, 0, -Math.PI / 2);
    // painting on the wall
    { const g = new THREE.Group(); g.position.set(-0.75, 1.75, -0.88); scene.add(g); B(0.55, 0.42, 0.03, lam(null, 0x7a5a20), 0, 0, 0, g);
      L.plane(0.45, 0.32, lam(L.cvs(24, 16, (c) => { const gr = c.createLinearGradient(0, 0, 0, 16); gr.addColorStop(0, '#2a3a5a'); gr.addColorStop(1, '#4a3a20'); c.fillStyle = gr; c.fillRect(0, 0, 24, 16); c.fillStyle = '#1a1a10'; c.fillRect(2, 10, 20, 6); c.fillStyle = '#c8b070'; c.fillRect(16, 3, 3, 3); })), 0, 0, 0.016, g); }
    // table
    const mT = lam(tWood(103, '#7a4a28', '#4a2812'));
    B(1.2, 0.05, 0.62, mT, 0, TY - 0.025, 0.25, scene);
    B(1.16, TY - 0.05, 0.03, mT, 0, (TY - 0.05) / 2, 0.54, scene); for (const x of [-0.57, 0.57]) B(0.04, TY - 0.05, 0.6, mT, x, (TY - 0.05) / 2, 0.25, scene);
    for (const x of [-0.3, 0.3]) { B(0.4, 0.14, 0.01, lam(tWood(106, '#8a5a32', '#5a3418')), x, TY - 0.14, 0.556, scene); B(0.06, 0.015, 0.012, lam(null, 0xc8a040), x, TY - 0.14, 0.565, scene); }   // drawers
    // ---- green typewriter (origin: table top centre, keys toward +z)
    const tw = new THREE.Group(); tw.position.set(-0.02, TY, 0.36); tw.rotation.y = Math.PI; scene.add(tw);   // keys toward Ava (-z), carriage/paper toward the camera
    const tKeys = L.cvs(48, 16, (c) => { c.fillStyle = '#1c2a20'; c.fillRect(0, 0, 48, 16);
      for (let row = 0; row < 4; row++) for (let k = 0; k < 11 - (row === 3 ? 7 : 0); k++) { const x = 2 + row + k * 4 + (row === 3 ? 14 : 0), y = 1 + row * 4; c.fillStyle = '#e8e4d4'; c.fillRect(x, y, row === 3 ? 14 : 3, 3); c.fillStyle = '#5a5a50'; c.fillRect(x, y + 2, row === 3 ? 14 : 3, 1); } });
    const mG = lam(tMetal(104, '#3e6e4a')), mGd = lam(null, 0x24402c), mBlk = lam(null, 0x141414), mChr = lam(null, 0xc8c8c0);
    B(0.36, 0.07, 0.26, mG, 0, 0.035, -0.02, tw);                         // base
    const deck = B(0.34, 0.012, 0.13, [mGd, mGd, lam(tKeys), mGd, mGd, mGd], 0, 0.07, 0.04, tw); deck.rotation.x = 0.28;   // keyboard
    B(0.36, 0.06, 0.1, mG, 0, 0.1, -0.09, tw);                            // body behind the keys
    B(0.12, 0.03, 0.06, mBlk, 0, 0.115, -0.03, tw);                        // type-bar basket
    const carriage = new THREE.Group(); carriage.position.set(0, 0.15, -0.1); tw.add(carriage);
    { const pl = cyl(0.025, 0.025, 0.42, 10, mBlk, 0, 0, 0, carriage); pl.rotation.z = Math.PI / 2;   // platen
      for (const s of [-1, 1]) { const k = cyl(0.03, 0.03, 0.02, 8, mBlk, s * 0.22, 0, 0, carriage); k.rotation.z = Math.PI / 2; }
      B(0.44, 0.012, 0.03, mChr, 0, 0.02, 0.03, carriage);                    // paper bail
      const lev = B(0.09, 0.012, 0.012, mChr, -0.26, 0.03, 0.02, carriage); lev.rotation.z = 0.4;   // return lever
      const ppr = L.plane(0.15, 0.17, L.basic(L.cvs(16, 16, (c) => { c.fillStyle = '#ece8dc'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#3a3a3a'; c.fillRect(2, 13, 9, 1); c.fillRect(2, 14, 6, 1); }), 0xd8d4c8, { side: THREE.DoubleSide }), 0, 0.1, -0.03, carriage); ppr.rotation.x = -0.32; void ppr; }
    for (const s of [-1, 1]) { const sp = cyl(0.03, 0.03, 0.012, 10, lam(null, 0x2a1a1a), s * 0.1, 0.132, -0.02, tw); void sp; }   // ribbon spools
    // the ink ribbons next to it (x2)
    for (let i = 0; i < 2; i++) { const r = B(0.06, 0.02, 0.04, lam(null, 0x202024), 0.32 + i * 0.07, TY + 0.01, 0.42, scene); r.rotation.y = 0.2 * i; B(0.036, 0.004, 0.024, lam(null, 0xd8d8d0), 0.32 + i * 0.07, TY + 0.021, 0.42, scene).rotation.y = 0.2 * i; }
    // lamp (green banker's lamp) on the table right
    { const g = new THREE.Group(); g.position.set(0.45, TY, 0.18); scene.add(g); const mBr = lam(null, 0xb09040);
      cyl(0.06, 0.07, 0.02, 8, mBr, 0, 0.01, 0, g); cyl(0.008, 0.008, 0.3, 5, mBr, 0, 0.16, 0, g);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.07, 10, 1, true), L.lam(null, 0x2a7a40, { side: THREE.DoubleSide })); sh.position.set(0, 0.32, 0.02); scene.add(sh); g.add(sh);
      L.mesh(new THREE.SphereGeometry(0.025, 6, 4), L.basic(null, 0xffe8b0), 0, 0.3, 0.02, g); }
    // herb pot on the table left, item box (chest) on the floor at the left
    Rherb(scene, 0.5, TY, 0.46, 1.4);
    { const g = new THREE.Group(); g.position.set(0.98, 0, 0.62); g.rotation.y = -0.55; scene.add(g);
      const tChest = tWood(105, '#8a5a30', '#4a2a12'), mCh = lam(L.rep(tChest, 2, 1)), mBand = lam(null, 0x4a4a46);
      B(0.7, 0.4, 0.42, mCh, 0, 0.2, 0, g);
      const lid = L.mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.7, 8, 1, false, 0, Math.PI), mCh, 0, 0.4, 0, g); lid.rotation.z = Math.PI / 2; lid.rotation.y = Math.PI / 2; lid.rotation.set(0, 0, Math.PI / 2); lid.scale.set(1, 1, 0.6);
      for (const x of [-0.28, 0, 0.28]) { B(0.04, 0.41, 0.43, mBand, x, 0.2, 0, g); }
      B(0.08, 0.1, 0.02, lam(null, 0xc8a040), 0, 0.36, 0.22, g); }
    // ---- Ava behind the table, typing, looking at camera
    const ch = L.hero(); scene.add(ch.root); ch.shadow.visible = false;
    const TYPE = (hit) => [L.seg('push_door', -99, { from: hit ? 0.26 : 0.32, speed: 0 })];
    ch.root.position.set(0, 0, 0); ch.pose(0, TYPE(false)); ch.root.updateMatrixWorld(true);
    const hMid = ch.hand('L').localToWorld(V(0, 0.6, 0)).add(ch.hand('R').localToWorld(V(0, 0.6, 0))).multiplyScalar(0.5);
    const SEAT = V(-0.02, TY + 0.1, 0.3).sub(hMid); SEAT.x = -0.02;
    tw.position.x = SEAT.x + hMid.x;   // typewriter centred under her hands
    { const g = new THREE.Group(); g.position.set(SEAT.x, 0, SEAT.z - 0.1); scene.add(g); const mC = lam(tWood(107, '#5a3418', '#2a160a'));
      const sy = 0.95 + SEAT.y - 0.12; B(0.44, 0.04, 0.42, mC, 0, sy, 0, g);
      for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) B(0.035, sy, 0.035, mC, x, sy / 2, z, g);
      for (const x of [-0.19, 0.19]) B(0.035, 0.55, 0.035, mC, x, sy + 0.27, -0.2, g);
      B(0.42, 0.14, 0.025, mC, 0, sy + 0.45, -0.2, g); B(0.42, 0.04, 0.025, mC, 0, sy + 0.24, -0.2, g); }
    const c12 = cam(44);
    const typed = (t) => { let n = 0; for (const [tk] of R12_KEYS) if (t >= tk) n++; return n; };
    out['12_save'] = { scene, camera: c12, update(lt, t) {
      ch.root.position.copy(SEAT); ch.root.rotation.y = 0;
      // typing: the hands bob a frame per key (catch_object = both hands low in front)
      const n = typed(t), lastK = n ? R12_KEYS[n - 1][0] : -9, hit = t - lastK < 0.05;
      const tDay = W12.day - W12.t0, tTime = W12.time - W12.t0;
      const eyes = lt > 0.6 && lt < 0.7 ? 'blink' : lt > tDay + 0.1 && lt < tDay + 0.6 ? 'wink' : lt > tTime + 0.1 ? 'happy' : 'open';
      ch.pose(lt, TYPE(hit), [[-99, eyes, mouthAt(t, 'smile')]]);
      const k = lt / 4.4;
      look(c12, V(1.4 - 0.06 * k, 1.82 - 0.04 * k, 2.05 - 0.1 * k), V(0.22, 0.9, 0.1));
      ch.lookAt(c12, 1, 40);
      // carriage moves one step left per key; returns before the third line
      const line = t >= R12.ink - 0.14 ? 2 : 0, col = line === 2 ? R12_KEYS.filter(([tk], i) => i >= 15 && t >= tk).length : Math.min(n, 15);
      carriage.position.x = 0.06 - col * 0.008;
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.5);
      const c = o.tctx, t = W12.t0 + lt;
      // RE prompt on "save": "Will you save your game?" > YES  NO
      if (t >= W12.save && t < R12.close) {
        const kk = L.clamp01((t - W12.save) / 0.1), X = 150, Y = 118, Wd = 202, Hd = 58;
        c.fillStyle = `rgba(0,0,0,${0.82 * kk})`; c.fillRect(X, Y, Wd, Hd);
        c.fillStyle = mixHex('#000000', '#6a6a72', kk); c.fillRect(X, Y, Wd, 1); c.fillRect(X, Y + Hd - 1, Wd, 1);
        bitText(c, 'Will you save your game?', X + Wd / 2, Y + 18, 2, mixHex('#000000', '#ececec', kk), { outline: null });
        const sel = t >= R12.yes, blink = sel ? Math.floor((t - R12.yes) * 20) % 2 === 0 : true;
        bitText(c, 'YES', X + Wd / 2 - 34, Y + 41, 2, sel && !blink ? '#7a7a7a' : mixHex('#000000', '#ffffff', kk), { outline: null });
        bitText(c, 'NO', X + Wd / 2 + 38, Y + 41, 2, mixHex('#000000', '#8a8a8a', kk), { outline: null });
        if (blink) bitText(c, '>', X + Wd / 2 - 64, Y + 41, 2, '#ffe048', { outline: null });
      }
      // typed sheet (Courier, one key per letter)
      if (t >= R12.sheet) {
        const u = L.smooth((t - R12.sheet) / 0.15), X = 166, Wd = 186, Hd = 78, Y = Math.round(118 - (1 - u) * 30);
        c.globalAlpha = u;
        c.fillStyle = '#e4dcc4'; c.fillRect(X, Y, Wd, Hd);
        c.fillStyle = 'rgba(120,100,70,0.18)'; for (let y = Y + 6; y < Y + Hd; y += 9) c.fillRect(X + 4, y, Wd - 8, 1);
        c.fillStyle = '#b8ac90'; c.fillRect(X, Y + Hd - 2, Wd, 2); c.fillRect(X + Wd - 2, Y, 2, Hd);
        c.fillStyle = '#c84a3a'; c.fillRect(X + 18, Y, 1, Hd);   // margin line
        c.globalAlpha = 1;
        c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#1e1a16';
        c.font = 'bold 15px "Courier New", monospace';
        const shown = (i) => { const [s, t0, d] = R12_LINES[i]; return s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - t0) / d + 1e-6) + 1))); };
        const l1 = (t >= R12_LINES[0][1] ? shown(0) : '') + (t >= R12_LINES[1][1] ? shown(1) : '');
        c.fillText(l1, X + 24, Y + 24);
        if (t >= R12_LINES[2][1]) { c.font = 'bold 15px "Courier New", monospace'; c.fillText(shown(2), X + 24, Y + 52); }
        // caret
        if (Math.floor(t * 4) % 2 === 0) { const w = c.measureText(t >= R12_LINES[2][1] ? shown(2) : l1).width; c.fillRect(X + 25 + w, t >= R12_LINES[2][1] ? Y + 59 : Y + 31, 8, 2); }
        c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      }
    } };
  }

  return out;
}
