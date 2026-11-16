// sets/rooms.js — LARGO 16:9 police station interiors (lights off: flashlight / one warm lamp + blue window light):
// armory: 24_armory (fixed high corner, Ava walks in with the flashlight between EMPTY racks and lockers), 25_armory_bad
// (frontal, she shrugs and looks at camera on "someone found it first"), 29_rule_two (pistol on the armory table, push-in,
// RULE 2 on "two" + GUN = LAST RESORT on "last"); office: 30_water (Ava by the water cooler, reload, push-in to the blue
// 5-gal jug on "water"), 31_fema (fixed high side angle, 1 GALLON / DAY on "gallon", she drinks, FEMA on "FEMA's");
// save room: 49_save_room (fixed high corner, Ava comes in through the door to the typewriter; frontal angle on s2, she
// presents it with a wink), 50_save (RE "Will you save your game?" > YES, typed sheet DAY 1 — 2:47 AM / POLICE STATION).
// Contract: SETS.md. Every time is anchored to a word inside RX() (shared by shots() and sfx()).
import { reText as bitText, reWidth as textWidth } from '../refont.js';

// foot contacts of the 'walk' clip (1.0 s cycle): left foot down at clip 0.12 s, right foot at 0.60 s (measured on the rig)
const STEP_PH = [0.12, 0.60];
/** global times of every foot contact while the walk clip plays: seg starts at `at` (global) with `from`/`speed`, window [t0, t1) */
export function walkSteps(at, speed, t0, t1, from = 0) {
  const out = [], x0 = from + (t0 - at) * speed, x1 = from + (t1 - at) * speed;
  for (let n = Math.floor(x0) - 1; n <= Math.ceil(x1); n++) for (const c of STEP_PH) { const xx = n + c; if (xx >= x0 && xx < x1) out.push(at + (xx - from) / speed); }
  return out.sort((a, b) => a - b);
}

function RX(ctx) {
  const { T, at, CUTS, words } = ctx;
  const end = (id) => { const i = CUTS.findIndex((c) => c[0] === id); return CUTS[i + 1] ? CUTS[i + 1][1] : T[id] + 6; };
  const o = {};
  o.s24 = T['24_armory']; o.e24 = end('24_armory'); o.armory = at('m2', 'armory');
  o.s25 = T['25_armory_bad']; o.e25 = end('25_armory_bad'); o.bad = at('m3', 'bad'); o.someone = at('m4', 'someone'); o.first25 = at('m4', 'first');
  o.s25b = T['25b_lockers']; o.e25b = end('25b_lockers');
  { const w = words('m4b'), emp = w.filter((q) => /^empty/i.test(q[0])); o.empty1 = emp[0][1]; o.empty2 = emp[1][1]; }
  o.check = at('m4b', 'check'); o.one25b = at('m4b', 'one'); o.half = at('m4b', 'half'); o.sandwich = at('m4b', 'sandwich');
  o.s29 = T['29_rule_two']; o.e29 = end('29_rule_two'); o.two = at('m9', 'two'); o.last = at('m10', 'last');
  o.s30 = T['30_water']; o.e30 = end('30_water'); o.water = at('w2', 'water');
  o.s31 = T['31_fema']; o.e31 = end('31_fema'); o.gallon = at('w3', 'gallon'); o.day31 = at('w3', 'day'); o.drink = at('w3', 'drink'); o.fema = at('w3', 'fema');
  o.s49 = T['49_save_room']; o.e49 = end('49_save_room'); o.typewriter = at('s1', 'typewriter'); o.s2 = at('s2', 0); o.exactly = at('s3', 'exactly'); o.this49 = at('s3', 'this');
  o.s50 = T['50_save']; o.e50 = end('50_save'); o.save = at('s4', 'save'); o.game = at('s4', 'game'); o.day = at('s4', 'day'); o.two50 = at('s5', 'two'); o.police = at('s5', 'police');
  // derived actions (global s)
  o.walk24 = { go: o.s24 + 0.05, stop: o.s24 + 1.85 };            // Ava walks in, stops
  o.shrug25 = o.someone - 0.15;
  // 25b: Ava walks down the locker row and opens three doors: fully open ON "empty", "empty", "half"
  o.open1 = o.empty1 - 0.1; o.open2 = o.empty2 - 0.1; o.open3 = o.half - 0.12;
  o.lk = [   // [walk start, walk end, walk speed] between lockers (global s)
    [o.s25b - 0.4, o.open1 - 0.32, 1.0], [o.open1 + 0.16, o.open2 - 0.26, 1.3], [o.open2 + 0.14, o.open3 - 0.26, 1.5]];
  o.cut25b = o.open3 + 0.08;   // RE cut to the high angle over the third locker
  o.set29 = o.s29 + 0.32;                                            // the pistol touches the table
  o.reload30 = o.s30 + 0.1;                                          // clip 'reload': mag out f8, mag in f30, slide f36-42
  o.drink31 = o.drink - 0.35;
  o.door49 = o.s49 + 0.25; o.walk49 = { go: o.s49 + 0.75, mid: o.s49 + 2.15, stop: o.s49 + 3.6 };
  o.yes = o.game - 0.05; o.close = o.yes + 0.16; o.sheet = o.yes + 0.22;
  o.lines = [['DAY 1 — ', o.day, 0.075], ['2:47 AM', o.two50, 0.075], ['POLICE STATION', o.police, 0.055]];
  o.keys = o.lines.flatMap(([s, t, d]) => [...s].map((ch, i) => [t + i * d, ch]));
  o.ret = o.police - 0.14;
  return o;
}

export function sfx(ctx) {
  const x = RX(ctx), ev = [], r3 = (t) => Math.round(t * 1000) / 1000, push = (t, n) => ev.push([r3(t), n]);
  // 24: flashlight on as she steps in, a step at every foot contact of the walk clip
  push(x.s24 + 0.03, 'flashlight_click');
  for (const t of walkSteps(x.walk24.go, 1, x.s24, Math.min(x.e24, x.walk24.stop))) push(t, 'step_walk');
  push(x.armory - 0.1, 'locker_creak');
  // 25
  push(x.shrug25 + 0.05, 'cloth_shrug');
  // 25b: steps between the lockers, handle clack, the door flies open and bounces (metal), sandwich label
  for (const [a, b, sp] of x.lk) for (const t of walkSteps(a, sp, Math.max(a, x.s25b), b)) push(t, 'step_walk');
  for (const t of [x.open1, x.open2, x.open3]) { push(t - 0.06, 'locker_handle'); push(t, 'locker_open'); push(t + 0.13, 'locker_bounce'); }
  push(x.empty1, 'label'); push(x.empty2, 'label'); push(x.sandwich, 'label');
  // 29
  push(x.set29, 'pistol_set_down'); push(x.two, 'label');
  // 30
  push(x.reload30 + 7 / 30, 'mag_out'); push(x.reload30 + 29 / 30, 'mag_in'); push(x.reload30 + 39 / 30, 'slide_rack');
  push(x.water, 'jug_glug'); push(x.water + 0.45, 'jug_glug');
  // 31
  push(x.gallon, 'label'); push(x.drink31 + 0.35, 'gulp'); push(x.fema, 'label'); push(x.fema, 'stamp');
  // 49
  push(x.door49, 'door_open'); for (const t of walkSteps(x.walk49.go, 0.85, x.walk49.go, x.walk49.stop)) push(t, 'step_walk');
  push(x.door49 + 1.2, 'door_close'); push(x.exactly, 'cloth_present');
  // 50
  push(x.save, 'menu_open'); push(x.yes, 'menu_select'); push(x.sheet, 'paper');
  for (const [t, ch] of x.keys) if (ch !== ' ') push(t, 'type_key');
  push(x.ret, 'type_return'); push(x.police + 14 * 0.055 + 0.05, 'save_chime');
  return ev.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L, TL } = ctx;
  const x = RX(ctx);
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

  // ---------- black pistol (models/pistol-retro.glb retextured): dark gunmetal slide with rear serrations + ejection port, lighter
  // machined edges, checkered grip with screws, front/rear sights as extra meshes. UVs are re-projected per face: sides -> side
  // view (z, y), top/bottom -> top strip (z, x), muzzle/rear faces -> a dark column. Model space: muzzle -z, grip +z, y up.
  const GZ0 = -0.248, GZ1 = 0.257, GY0 = -0.178, GY1 = 0.130, GX = 0.03;
  const gcx = (z) => (z - GZ0) / (GZ1 - GZ0) * 128, gcy = (y) => 16 + (GY1 - y) / (GY1 - GY0) * 80;
  const tGun = L.cvs(128, 96, (c, w, h) => {
    const r = L.rng(4401), n = (b, k = 10) => { const v = r() * k - k / 2; return rgb(b[0] + v, b[1] + v, b[2] + v); };
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) px(c, xx, y, n([26, 27, 30], 8));                 // frame / default: near-black
    const S0 = Math.round(gcy(0.130)), S1 = Math.round(gcy(0.059)), Z0 = Math.round(gcx(-0.224)), Z1 = Math.round(gcx(0.243));
    for (let y = S0; y < S1; y++) for (let xx = Z0; xx < Z1; xx++) px(c, xx, y, n([40, 42, 46], 8));             // slide: dark gunmetal
    px(c, Z0, S0, '#8a9098', Z1 - Z0, 1); px(c, Z0, S0 + 1, '#5a5e66', Z1 - Z0, 1);                              // top edge highlight
    px(c, Z0, S1 - 1, '#6a6e76', Z1 - Z0, 1);                                                                       // slide/frame line
    px(c, Z0, S0, '#7a7e86', 1, S1 - S0); px(c, Z1 - 1, S0, '#5a5e66', 1, S1 - S0);                               // muzzle / rear edges
    for (let xx = Z1 - 26; xx < Z1 - 3; xx += 2) { px(c, xx, S0 + 3, '#0c0c0e', 1, S1 - S0 - 6); px(c, xx + 1, S0 + 3, '#5a5e66', 1, S1 - S0 - 6); }   // rear serrations
    for (let xx = Z0 + 4; xx < Z0 + 14; xx += 2) { px(c, xx, S0 + 4, '#101012', 1, S1 - S0 - 9); px(c, xx + 1, S0 + 4, '#4a4e56', 1, S1 - S0 - 9); }   // front serrations
    const ep = Math.round(gcx(0.03)); px(c, ep, S0 + 3, '#4a4e56', 18, 7); px(c, ep + 1, S0 + 4, '#0a0a0c', 16, 5); px(c, ep + 3, S0 + 6, '#7a6a3a', 6, 2);   // ejection port + brass
    for (let k = 0; k < 9; k++) px(c, Z0 + 18 + k * 3, S1 - 6, '#5a5e64', 2, 1);                                  // roll-marked text
    const F1 = Math.round(gcy(0.02)); px(c, Z0 + 2, S1, '#3a3c40', Math.round(gcx(0.1)) - Z0 - 2, 1);           // frame top edge, dust cover rail
    for (let xx = Z0 + 8; xx < Math.round(gcx(-0.02)); xx += 4) px(c, xx, S1 + 3, '#0a0a0c', 2, F1 - S1 - 5);   // accessory rail slots
    const G0 = Math.round(gcx(0.1)), G1 = Math.round(gcx(0.25)), GT = Math.round(gcy(0.0)), GB = Math.round(gcy(-0.165));
    for (let y = GT; y < GB; y++) for (let xx = G0; xx < G1; xx++) px(c, xx, y, ((xx + y) >> 1) % 2 === ((xx - y + 400) >> 1) % 2 ? '#141416' : '#34363a');   // checkered grip
    px(c, G0, GT, '#5a5e66', G1 - G0, 1); px(c, G0, GT, '#4a4e56', 1, GB - GT); px(c, G1 - 1, GT, '#4a4e56', 1, GB - GT);
    for (const [zz, yy] of [[0.13, -0.025], [0.2, -0.14]]) { px(c, Math.round(gcx(zz)), Math.round(gcy(yy)), '#9aa0a8', 2, 2); }   // grip screws
    px(c, G0 - 2, GB, '#6a6e76', G1 - G0 + 4, h - GB);                                                            // magazine base plate
    px(c, Math.round(gcx(0.05)), Math.round(gcy(0.03)), '#8a9098', 3, 2);                                         // slide stop / takedown pin
    for (let xx = 0; xx < w; xx++) for (let y = 0; y < 12; y++) px(c, xx, y, n([44, 46, 50], 6));                // top strip
    px(c, 0, 0, '#8a9098', w, 1); px(c, 0, 11, '#8a9098', w, 1); px(c, 0, 5, '#1a1a1c', w, 2);                   // top: bright side edges, centre groove
    for (let xx = 100; xx < 124; xx += 2) px(c, xx, 1, '#141416', 1, 10);
    px(c, 0, 12, '#0c0c0e', w, 4);                                                                                // muzzle / rear faces
  });
  async function blackPistol() {
    const g = await L.loadModel('models/pistol-retro.glb'), root = L.ps1Clone(g.scene, { lit: true }), mat = lam(tGun, 0xffffff, { side: THREE.DoubleSide });
    root.updateMatrixWorld(true); const inv = root.matrixWorld.clone().invert();
    root.traverse((o) => {
      if (!o.isMesh) return; const geo = o.geometry.clone(), P = geo.attributes.position, N = geo.attributes.normal, uv = new Float32Array(P.count * 2);
      const m = inv.clone().multiply(o.matrixWorld), nm = new THREE.Matrix3().getNormalMatrix(m), v = V(0, 0, 0), nv = V(0, 0, 0);
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(m); nv.fromBufferAttribute(N, i).applyMatrix3(nm).normalize();
        let cx = gcx(v.z), cy;
        if (Math.abs(nv.y) > 0.7) cy = Math.min(11.5, Math.max(0.5, (v.x + GX) / (2 * GX) * 12));
        else if (Math.abs(nv.z) > 0.7) cy = 14;
        else cy = gcy(v.y);
        uv[i * 2] = cx / 128; uv[i * 2 + 1] = 1 - cy / 96;
      }
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); o.geometry = geo; o.material = mat;
    });
    const sm = lam(null, 0x111114), dot = L.basic(null, 0xe8e8e0);
    B(0.009, 0.016, 0.014, sm, 0, GY1 + 0.008, -0.205, root); B(0.004, 0.004, 0.002, dot, 0, GY1 + 0.011, -0.197, root);   // front sight + white dot
    for (const sx of [-1, 1]) { B(0.009, 0.015, 0.012, sm, sx * 0.0095, GY1 + 0.0075, 0.222, root); B(0.003, 0.003, 0.002, dot, sx * 0.0095, GY1 + 0.01, 0.2155, root); }   // rear sight (notch) + dots
    return root;
  }

  const out = {};

  // ======================================================================================================
  // ARMORY (24, 25, 29): empty racks + lockers, Ava with a flashlight; a steel table at the front left for the pistol
  // ======================================================================================================
  {
    // LIT like the approved short's rooms: one working overhead fluorescent (cool white) + lifted shadows; the flashlight is an accent
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c1016); scene.fog = new THREE.Fog(0x0c1016, 6, 13);
    scene.add(new THREE.HemisphereLight(0xc8d4e8, 0x5a5448, 1.55));
    const tube = new THREE.PointLight(0xeef4ff, 9, 7, 1.0); tube.position.set(0, 2.45, -0.6); scene.add(tube);                 // the fluorescent fixture
    const tube2 = new THREE.PointLight(0xeef4ff, 4, 6, 1.0); tube2.position.set(0, 2.4, 1.2); scene.add(tube2);
    const corridor = new THREE.PointLight(0x7a98ff, 3.0, 4, 1.2); corridor.position.set(0, 1.8, -3.2); scene.add(corridor);   // blue light from the corridor
    const fill = new THREE.PointLight(0xffd8b0, 2.2, 6, 1.2); fill.position.set(0.4, 1.7, 1.6); scene.add(fill);               // warm fill
    const torch = new THREE.SpotLight(0xfff0c8, 5, 7, 0.42, 0.45, 1.2); scene.add(torch); scene.add(torch.target);
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
    // lit fluorescent fixture (housing + glowing diffuser)
    B(1.2, 0.06, 0.24, lam(null, 0x8a8a84), 0, HH - 0.04, -0.6, scene); B(1.1, 0.02, 0.18, L.basic(null, 0xf4f8ff), 0, HH - 0.075, -0.6, scene);
    B(1.2, 0.06, 0.24, lam(null, 0x8a8a84), 0, HH - 0.04, 1.2, scene); B(1.1, 0.02, 0.18, L.basic(null, 0xf4f8ff), 0, HH - 0.075, 1.2, scene);
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
    // steel table (front left) with the pistol, a 15-round box and the empty magazine pouch
    const mTab = lam(tMetal(88, '#5e6466')), TT = 0.8, TAB = V(-0.85, 0, 0.55);
    B(1.1, 0.04, 0.62, mTab, TAB.x, TT - 0.02, TAB.z, scene);
    for (const [dx, dz] of [[-0.52, -0.28], [0.52, -0.28], [-0.52, 0.28], [0.52, 0.28]]) B(0.04, TT - 0.04, 0.04, mTab, TAB.x + dx, (TT - 0.04) / 2, TAB.z + dz, scene);
    L.plane(1.0, 0.55, lam(L.cvs(16, 16, (c) => { c.fillStyle = '#4a5052'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#3a4042'; for (let i = 0; i < 16; i += 4) c.fillRect(0, i, 16, 1); })), TAB.x, TT + 0.001, TAB.z, scene, 0, -Math.PI / 2);
    const gunRaw = await blackPistol();
    const gun = new THREE.Group(), gunFlat = new THREE.Group(); gunFlat.add(gunRaw); gun.add(gunFlat); scene.add(gun);
    { const b = new THREE.Box3().setFromObject(gunRaw), s = b.getSize(V()), k = 0.2 / Math.max(s.x, s.y, s.z); gunRaw.scale.multiplyScalar(k);
      if (s.x < s.z) gunFlat.rotation.z = Math.PI / 2; else gunFlat.rotation.x = Math.PI / 2;   // lay it on its side (thinnest axis up)
      gunFlat.updateMatrixWorld(true); const b2 = new THREE.Box3().setFromObject(gunFlat); gunFlat.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2); }
    const GUN = V(TAB.x + 0.08, TT, TAB.z + 0.02);
    const ammo = Rammo(scene, TAB.x - 0.24, TT, TAB.z - 0.08, 1.4); ammo.rotation.y = 0.5;
    for (let i = 0; i < 3; i++) { const b = cyl(0.0045, 0.0045, 0.022, 6, lam(null, 0xd8a840), TAB.x - 0.08 + i * 0.03, TT + 0.005, TAB.z + 0.16 + (i % 2) * 0.02, scene); b.rotation.z = Math.PI / 2; b.rotation.y = i * 0.7; }
    const c24 = cam(46), c25 = cam(40), c29 = cam(38);
    const A0 = V(0.05, 0, -3.0), A1 = V(0.0, 0, -1.95), A2 = V(-0.55, 0, -0.75);
    const setTorch = (camera, tgt) => {
      ch.root.updateMatrixWorld(true);
      const lp = fl.localToWorld(V(0.11, 0, 0));
      torch.visible = true; lensGlow.visible = true; torch.position.copy(lp); torch.target.position.copy(tgt); lensGlow.position.copy(lp); lensGlow.lookAt(camera.position);
    };
    out['24_armory'] = { scene, camera: c24, update(lt, t) {
      ch.root.visible = true; gun.visible = true; gun.position.copy(GUN); gun.rotation.set(0, 0.5, 0);
      const { go, stop } = x.walk24, u = L.clamp01((t - go) / (stop - go)), ue = u * (2 - u) * 0.3 + u * 0.7;
      const p = ue < 0.45 ? A0.clone().lerp(A1, ue / 0.45) : A1.clone().lerp(A2, (ue - 0.45) / 0.55);
      const d = (ue < 0.45 ? A1.clone().sub(A0) : A2.clone().sub(A1));
      ch.root.position.copy(p); ch.root.rotation.y = Math.atan2(d.x, d.z);
      ch.pose(lt, [L.seg('walk', 0, { loop: true }), L.seg('look_around', stop - x.s24, { fade: 0.25, speed: 0.9 })], [[-99, 'open', 'neutral'], [stop - x.s24 + 0.2, 'half', mouthAt(t, 'frown')]]);
      look(c24, V(1.42, 2.42, 1.85), V(-0.25, 0.75, -1.4));
      // the beam sweeps the lockers -> lands on the empty rifle rack on "armory"
      const k = L.smooth((t - x.s24) / Math.max(0.3, x.armory - x.s24));
      setTorch(c24, V(-1.4, 1.1, -1.2).lerp(V(-1.1, 1.15, -2.05), k));
    }, overlay: (lt, dt, a, o) => vignette(o, 0.3) };
    out['25_armory_bad'] = { scene, camera: c25, update(lt, t) {
      ch.root.visible = true; gun.visible = true;
      ch.root.position.set(0.05, 0, -0.95); ch.root.rotation.y = 0;
      const ts = x.shrug25 - x.s25 - 11 / 30;   // clip 'shrug' peaks on frame 11
      const eyes = t < x.someone - 0.3 ? 'sad' : t > x.first25 - 0.05 ? 'wink' : 'relaxed';
      ch.pose(lt, [L.seg('idle', -9), L.seg('shrug', ts, { fade: 0.2 })], [[-99, eyes, mouthAt(t, t < x.someone ? 'frown' : 'smile')]]);
      const k = L.smooth(lt / (x.e25 - x.s25));
      look(c25, V(0.08, 1.36, 0.85 - 0.25 * k), V(0.05, 1.2, -1.5));
      ch.lookAt(c25, 1, 40);
      setTorch(c25, V(0.4, 0.0, 0.4));
    }, overlay: (lt, dt, a, o) => vignette(o, 0.3) };
    out['29_rule_two'] = { scene, camera: c29, update(lt, t) {
      ch.root.visible = false; lensGlow.visible = false;
      // the pistol is set down (lands at set29 with a tiny settle), then a slow push-in
      const u = L.clamp01((t - x.s29) / (x.set29 - x.s29));
      gun.visible = true; gun.position.copy(GUN).add(V(0.05 * (1 - u), 0.09 * (1 - u) * (1 - u), 0)); gun.rotation.set(0, 0.5, 0.25 * (1 - u));
      torch.visible = true; torch.position.set(TAB.x + 0.9, 1.7, TAB.z + 1.1); torch.target.position.copy(GUN);
      const k = L.smooth((t - x.s29) / (x.e29 - x.s29));
      look(c29, V(TAB.x + 0.62, 1.32, TAB.z + 0.95).lerp(V(TAB.x + 0.3, 1.0, TAB.z + 0.42), k), V(GUN.x - 0.02, TT + 0.02, GUN.z));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.3);
      const t = x.s29 + lt, p = L.toScreen(c29, GUN.x, TT + 0.03, GUN.z);
      // one box, rule + its text together from "two" (the cut comes before "last")
      if (t >= x.two) Rlabel(o, 'MY RULE 2: GUN = LAST RESORT', 380, 104, '#ff4030', p, [0.5, 1], fadeIn(t, x.two, 0.06), { sc: 2, fg: t - x.two < 0.08 ? '#ffffff' : '#f4f4f4' });
    } };
  }


  // ======================================================================================================
  // LOCKER ROW (25b): armory locker corridor under a working fluorescent; FIXED low camera at the end of the row, Ava walks
  // toward it opening the lockers one by one ('empty' x2: the metal doors fly open and bounce), then a RE cut to a high angle
  // over the third locker: half a sandwich on the shelf (label on 'sandwich'), she glances at camera.
  // World: lockers along the left wall (fronts at x = -0.5, centres every 0.4 m along z), corridor x [-0.5, 1.1].
  // ======================================================================================================
  {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c1016); scene.fog = new THREE.Fog(0x0c1016, 6, 14);
    scene.add(new THREE.HemisphereLight(0xc8d4e8, 0x5a5448, 1.5));
    for (const z of [-3.2, -1.4, 0.4]) { const l = new THREE.PointLight(0xeef4ff, 5, 5, 1.0); l.position.set(0.3, 2.35, z); scene.add(l); }
    const XL = -0.5, XR = 1.1, HH = 2.6;
    const mWall = lam(L.rep(tBlock(66, '#5e6e5c', '#b0ac96', 30), 2.4, 1.6));
    L.plane(7, HH, mWall, XR, HH / 2, -1.5, scene, -Math.PI / 2);
    L.plane(7, HH, mWall, XL - 0.46, HH / 2, -1.5, scene, Math.PI / 2);
    L.plane(1.6, HH, mWall, 0.3, HH / 2, -5.0, scene);
    L.plane(1.6, 7, lam(L.rep(tLino, 1.6, 7)), 0.3, 0, -1.5, scene, 0, -Math.PI / 2);
    L.plane(2.2, 7, lam(null, 0x2a2c30), 0.3, HH, -1.5, scene, 0, Math.PI / 2);
    for (const z of [-3.2, -1.4, 0.4]) { B(0.24, 0.06, 1.2, lam(null, 0x8a8a84), 0.3, HH - 0.03, z, scene); B(0.18, 0.02, 1.1, L.basic(null, 0xf4f8ff), 0.3, HH - 0.07, z, scene); }
    // right wall: notice board + fire extinguisher + a bench
    L.plane(0.7, 0.5, lam(L.cvs(32, 24, (c) => { c.fillStyle = '#8a6a40'; c.fillRect(0, 0, 32, 24); const r = L.rng(67); for (let k = 0; k < 6; k++) { c.fillStyle = ['#e8e4d8', '#e8d880', '#f0f0f0'][k % 3]; c.fillRect(r() * 26 | 0, r() * 18 | 0, 6, 5); } })), XR - 0.01, 1.5, -2.6, scene, -Math.PI / 2);
    cyl(0.07, 0.07, 0.45, 8, lam(null, 0xc81e14), XR - 0.1, 0.55, -0.9, scene); cyl(0.03, 0.03, 0.06, 6, lam(null, 0x1a1a1a), XR - 0.1, 0.8, -0.9, scene);
    { const mb = lam(tWood(68, '#8a6a40', '#5a3e20')); B(0.32, 0.04, 1.4, mb, XR - 0.2, 0.44, -3.4, scene); for (const z of [-4.0, -2.8]) B(0.28, 0.42, 0.04, lam(null, 0x3a3e40), XR - 0.2, 0.21, z, scene); }
    // the lockers: steel boxes, louvred doors on hinges (z- edge), three of them open on cue
    const tLk = L.cvs(16, 64, (c, w, h) => { const r = L.rng(69); for (let y = 0; y < h; y++) for (let x2 = 0; x2 < w; x2++) { const n = r() * 12 - 6; px(c, x2, y, rgb(84 + n, 104 + n, 128 + n)); }
      for (const y0 of [5, 52]) for (let y = y0; y < y0 + 7; y += 2) px(c, 3, y, '#141a22', 10, 1);
      px(c, 12, 28, '#d0d0c8', 2, 7); px(c, 0, 0, '#3a4652', 1, h); px(c, 0, 0, '#b8c4d0', w, 1); px(c, 4, 14, '#e8e4d4', 7, 3); px(c, 5, 15, '#3a3a3a', 4, 1); });
    const tLkIn = L.cvs(16, 64, (c, w, h) => { const r = L.rng(70); for (let y = 0; y < h; y++) for (let x2 = 0; x2 < w; x2++) { const n = r() * 10 - 5; px(c, x2, y, rgb(150 + n, 158 + n, 166 + n)); }
      px(c, 0, 0, '#5a646e', 2, h); px(c, w - 2, 0, '#5a646e', 2, h); px(c, 3, 12, '#d8e4ec', 9, 7); px(c, 4, 13, '#8aa4bc', 7, 5);   // little mirror
      px(c, 4, 26, '#e8c040', 8, 6); px(c, 5, 27, '#c03020', 3, 3); px(c, 2, 40, '#3a4048', 12, 1); });
    const mLkS = lam(null, 0x4e6278), mIn = lam(null, 0x1e2428), DEP = 0.46, LH2 = 1.9, LW2 = 0.4;
    const ZC = [-4.2, -3.8, -3.4, -3.0, -2.6, -2.2, -1.8, -1.4, -1.0, -0.6, -0.2];
    const OPEN = { 4: 'open1', 5: 'open2', 7: 'open3' }, doors = {};
    ZC.forEach((z, i) => {
      const g = new THREE.Group(); g.position.set(XL - DEP / 2, 0, z); scene.add(g);
      B(DEP, 0.12, LW2, mLkS, 0, 0.06, 0, g); B(DEP, 0.04, LW2, mLkS, 0, LH2 + 0.02, 0, g);                       // plinth + top
      B(DEP, LH2, 0.012, mLkS, 0, LH2 / 2, -LW2 / 2 + 0.006, g); B(0.012, LH2, LW2, mIn, -DEP / 2, LH2 / 2, 0, g);   // side + back
      B(DEP - 0.03, 0.012, LW2 - 0.02, mLkS, 0, 1.45, 0, g);                                                       // shelf
      B(0.02, 0.012, 0.3, lam(null, 0x8a8a84), -DEP / 2 + 0.05, 1.32, 0, g);                                       // coat hook rail
      const h = new THREE.Group(); h.position.set(DEP / 2, 0, LW2 / 2); g.add(h);   // hinge on the camera-side edge: the door swings out toward the lens
      B(0.018, LH2 - 0.16, LW2 - 0.01, [lam(tLk), lam(tLkIn), mLkS, mLkS, mLkS, mLkS], 0.009, 0.12 + (LH2 - 0.16) / 2, -LW2 / 2, h);
      if (OPEN[i]) doors[OPEN[i]] = h;
    });
    { const g = new THREE.Group(); g.position.set(XL - DEP / 2, 0, 0.2); scene.add(g); B(DEP, LH2, LW2, mLkS, 0, LH2 / 2, 0, g); }
    // half a sandwich on the third open locker's shelf: two white bread triangles, ham + lettuce, wax paper
    const SW = V(XL - 0.2, 1.456, -1.4);
    { const g = new THREE.Group(); g.position.copy(SW); g.rotation.y = 0.5; scene.add(g);
      L.plane(0.2, 0.16, lam(null, 0xe8e2c8, { side: THREE.DoubleSide }), 0, 0.003, 0, g, 0, -Math.PI / 2);
      const tri = (y, h2, col) => { const m = cyl(0.07, 0.07, h2, 3, lam(null, col), 0, y, 0, g); m.rotation.y = 0.3; return m; };
      tri(0.012, 0.018, 0xe8d8a8); tri(0.026, 0.008, 0xd87a7a); tri(0.032, 0.006, 0x6ab03a); tri(0.044, 0.018, 0xe8d8a8);
      const crust = cyl(0.074, 0.074, 0.003, 3, lam(null, 0xa86a2a), 0, 0.054, 0, g); crust.rotation.y = 0.3; }
    // ---- Ava
    const ch = L.hero(); scene.add(ch.root);
    const cA = cam(42), cB = cam(46);
    const XS = XL + 0.6, SPOT = [ZC[4], ZC[5], ZC[7]];
    const PTH = [V(XS + 0.05, 0, -4.6), V(XS, 0, SPOT[0]), V(XS, 0, SPOT[1]), V(XS, 0, SPOT[2])];
    const swing = (t, t0) => {   // the metal door flies open, slams its stop and bounces back a little
      const u = t - t0; if (u <= 0) return 0;
      if (u < 0.13) return 2.05 * L.smooth(u / 0.13);
      const v = u - 0.13; return 1.78 + 0.27 * Math.exp(-7 * v) * Math.cos(v * 22);
    };
    out['25b_lockers'] = { scene, camera: cA, update(lt, t) {
      const B2 = t >= x.cut25b; out['25b_lockers'].camera = B2 ? cB : cA;
      for (const k of ['open1', 'open2', 'open3']) doors[k].rotation.y = -swing(t, x[k]);
      // where is she: walking segment i, or standing at locker i
      let p = PTH[0].clone(), walking = false, seg = 0;
      for (let i = 0; i < 3; i++) { const [a, b] = x.lk[i];
        if (t >= a && t < b) { p = PTH[i].clone().lerp(PTH[i + 1], L.clamp01((t - a) / (b - a))); walking = true; seg = i; break; }
        if (t >= b) { p = PTH[i + 1].clone(); seg = i; } }
      ch.root.position.copy(p);
      // facing: down the corridor (+z) while walking, turns to the locker (-x) to open it
      const atL = !walking && t >= x.lk[0][1];
      ch.root.rotation.y = atL ? -Math.PI / 2 * L.smooth((t - x.lk[seg][1]) / 0.14) : 0;
      const segs = [L.seg('walk', x.lk[0][0] - x.s25b, { loop: true })];
      [[x.open1, 1], [x.open2, 2], [x.open3, null]].forEach(([to, nx]) => {
        segs.push(L.seg('turn_key', to - 0.3 - x.s25b, { from: 0.25, speed: 1.8, fade: 0.1 }));
        if (nx) segs.push(L.seg('walk', x.lk[nx][0] - x.s25b, { loop: true, speed: x.lk[nx][2], fade: 0.08 }));
      });
      segs.push(L.seg('hands_on_hips', x.sandwich - 0.25 - x.s25b, { fade: 0.25 }));
      const eyes = t < x.empty1 ? 'open' : t < x.one25b ? (t - x.empty2 > 0 && t - x.empty2 < 0.3 ? 'sad' : 'half') : t < x.sandwich ? 'surprised' : 'happy';
      ch.pose(lt, segs, [[-99, eyes, mouthAt(t, t >= x.sandwich ? 'smile' : 'neutral')]]);
      look(cA, V(0.62, 0.42, 1.25), V(-0.25, 1.05, -2.6));
      look(cB, V(0.8, 2.25, -1.78), V(XL - 0.1, 1.3, -1.38));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.3);
      const t = x.s25b + lt;
      if (t < x.cut25b) {
        [[x.empty1, ZC[4], -40], [x.empty2, ZC[5], 40]].forEach(([te, z, dx]) => { if (t >= te) { const p = L.toScreen(cA, XL - 0.2, 1.2, z); Rlabel(o, 'EMPTY', p[0] + dx, Math.max(96, p[1] - 80), '#ff4030', [p[0], p[1]], [0.5, 1], fadeIn(t, te, 0.06), { fg: t - te < 0.08 ? '#ffffff' : '#f4f4f4' }); } });
      } else if (t >= x.sandwich) {
        const p = L.toScreen(cB, SW.x, SW.y + 0.04, SW.z);
        Rlabel(o, 'HALF A SANDWICH', 470, 112, '#8cff5a', p, [0.5, 1], fadeIn(t, x.sandwich, 0.06), { sc: 2, fg: t - x.sandwich < 0.08 ? '#ffffff' : '#f4f4f4' });
      }
    } };
  }

  // ======================================================================================================
  // OFFICE WATER COOLER (30, 31)
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
    const pistolRaw = await blackPistol();
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
    const cup = new THREE.Group();
    { cyl(0.032, 0.024, 0.08, 8, L.basic(null, 0xf4f4f0), 0, 0, 0, cup); cyl(0.028, 0.028, 0.002, 8, L.basic(null, 0x5a9ae8), 0, 0.035, 0, cup); }
    L.holdIn(ch, cup, 'L', [0, 0.75, 0.25], [0, 0, 0]);
    const c30 = cam(46), c30b = cam(40), c31 = cam(42);
    const glug = (lt, tW) => {
      for (let i = 0; i < bubbles.length; i++) {
        const st = tW + 0.05 + (i % 5) * 0.07 + (i >= 5 ? 0.42 : 0), u = (lt - st) / 0.55, b = bubbles[i]; b.visible = u > 0 && u < 1;
        if (b.visible) b.position.set(0.04 * Math.sin(i * 2.1 + u * 4), 0.05 + 0.4 * u, 0.04 * Math.cos(i * 1.7) + 0.02);
      }
    };
    out['30_water'] = { scene, camera: c30, update(lt, t) {
      ch.root.position.set(-0.36, 0, 0.12); ch.root.rotation.y = 0.12; pistol.visible = true; cup.visible = false;
      const tRel = x.reload30 - x.s30, tWat = x.water - x.s30;
      const eyes = lt > tRel + 0.27 && lt < tRel + 1.45 ? 'angry' : lt > tWat - 0.1 && lt < tWat + 0.6 ? 'surprised' : lt > tWat + 0.6 ? 'happy' : lt > 1.9 && lt < 2.0 ? 'blink' : 'open';
      ch.pose(lt, [L.seg('reload', tRel), L.seg('pistol_ready', tRel + 1.95, { from: 0.4, speed: 0.3, fade: 0.2 }), L.seg('hands_on_hips', tWat - 0.3, { fade: 0.25 })],
        [[-99, eyes, mouthAt(t, lt > tWat ? 'smile' : 'neutral')]]);
      // RE fixed high corner (the desk lamp on the cabinet in the foreground) while she reloads; on "water" a hard cut to a
      // low angle on the blue jug with a slow creep; she looks at the lens, happy
      const jugCut = lt >= tWat - 0.05; out['30_water'].camera = jugCut ? c30b : c30;
      look(c30, V(1.62, 2.05, 0.72), V(-0.3, 0.95, 0.05));
      const k = L.smooth((lt - (tWat - 0.05)) / 1.6);
      look(c30b, V(1.05, 0.62, 1.75).lerp(V(0.95, 0.68, 1.5), k), V(0.02, 1.22, -0.1));
      if (jugCut) ch.lookAt(c30b, L.smooth((lt - tWat - 0.1) / 0.3), 40);
      reloadProps(lt - tRel);
      glug(lt, tWat); water.scale.y = 1 - 0.03 * L.smooth((lt - tWat) / 1.2);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.45) };
    out['31_fema'] = { scene, camera: c31, update(lt, t) {
      ch.root.position.set(-0.36, 0, 0.12); ch.root.rotation.y = 0.35; pistol.visible = false;
      const tD = x.drink31 - x.s31; cup.visible = lt > tD - 0.6;
      const eyes = lt > tD && lt < tD + 0.9 ? 'happy' : (x.fema - x.s31 < lt) ? 'wink' : lt > 2.6 && lt < 2.7 ? 'blink' : 'open';
      ch.pose(lt, [L.seg('hands_on_hips', -9), L.seg('drink', tD, { fade: 0.25 }), L.seg('hands_on_hips', tD + 1.6, { fade: 0.3 })], [[-99, eyes, mouthAt(t, 'smile')]]);
      const k = L.smooth(lt / (x.e31 - x.s31));
      look(c31, V(1.45 - 0.1 * k, 2.2 - 0.08 * k, 1.85 - 0.15 * k), V(0.02, 1.0, -0.05));
      ch.lookAt(c31, lt > x.fema - x.s31 - 0.3 ? 1 : 0, 40);
      glug(lt, tD - 0.5); water.scale.y = 0.97 - 0.02 * L.smooth((lt - tD + 0.5) / 1.0);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45);
      const t = x.s31 + lt, p = L.toScreen(c31, CX, 1.42, -0.12);
      if (t >= x.gallon) {
        Rlabel(o, '1 GALLON / DAY', 470, 112, '#5ab4ff', p, [0, 1], fadeIn(t, x.gallon, 0.06), { sc: 2, fg: t - x.gallon < 0.08 ? '#ffffff' : '#f4f4f4' });
        if (t >= x.day31 + 0.15) Rlabel(o, 'PER PERSON', 470, 140, '#9ab0c8', null, [0.5, 0], fadeIn(t, x.day31 + 0.15));
      }
      if (t >= x.fema) {   // FEMA stamp: blue plate, white letters, lands big then settles
        const c = o.tctx, u = L.clamp01((t - x.fema) / 0.12), s = 1 + 0.6 * (1 - u), w = Math.round(92 * s), h = Math.round(34 * s), cx = 470, cy = 182;
        c.fillStyle = '#0d2a6a'; c.fillRect(cx - w / 2, cy - h / 2, w, h); c.fillStyle = '#e8ecff'; c.fillRect(cx - w / 2, cy - h / 2, w, 1); c.fillRect(cx - w / 2, cy + h / 2 - 1, w, 1); c.fillRect(cx - w / 2, cy - h / 2, 1, h); c.fillRect(cx + w / 2 - 1, cy - h / 2, 1, h);
        bitText(c, 'FEMA', cx, cy, u < 1 ? 3 : 2, '#ffffff', { outline: null });
      }
    } };
  }

  // ======================================================================================================
  // SAVE ROOM (49, 50): typewriter, item box, herb, one warm lamp; a door on the left wall
  // ======================================================================================================
  {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070504); scene.fog = new THREE.Fog(0x070504, 3.6, 9);
    scene.add(new THREE.HemisphereLight(0x8a90a8, 0x3a2a1c, 0.5));
    const lampL = new THREE.PointLight(0xffa850, 6.5, 4.6, 1.15); lampL.position.set(0.5, 1.2, 0.35); scene.add(lampL);   // the desk lamp: the room's main light
    const blue = new THREE.DirectionalLight(0x5a7ae0, 0.45); blue.position.set(-2, 2, 1); scene.add(blue);
    const TY = 0.78;   // table height
    // ---- code-drawn textures (PS1: 32-64 px, nearest)
    const grain = (c, x0, y0, w, h, A, Bc, seed, vert = true) => {   // wood grain: wavy streaks + a knot
      const r = L.rng(seed), ph = r() * 6, a1 = hexRGB(A), b1 = hexRGB(Bc);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = vert ? x : y, v = vert ? y : x;
        const k = Math.min(1, Math.max(0, 0.5 + 0.38 * Math.sin(u * 1.3 + Math.sin(v * 0.11 + ph) * 2.4 + ph) + (r() - 0.5) * 0.28));
        px(c, x0 + x, y0 + y, rgb(a1[0] + (b1[0] - a1[0]) * k, a1[1] + (b1[1] - a1[1]) * k, a1[2] + (b1[2] - a1[2]) * k)); }
      if (w * h > 300) { const kx = x0 + 2 + (r() * (w - 4) | 0), ky = y0 + 2 + (r() * (h - 4) | 0); px(c, kx, ky, rgb(b1[0] * 0.7, b1[1] * 0.7, b1[2] * 0.7), 2, 3); }
    };
    const tWains = L.cvs(64, 64, (c, w, h) => {   // raised-panel wainscot: stiles/rails (cross grain) + bevelled panel
      grain(c, 0, 0, w, h, '#7a4824', '#40200c', 1101, false);
      grain(c, 0, 0, 6, h, '#7a4824', '#40200c', 1102, true); grain(c, w - 6, 0, 6, h, '#7a4824', '#40200c', 1103, true);
      grain(c, 10, 10, w - 20, h - 22, '#8a5630', '#4a260e', 1104, true);
      px(c, 9, 9, '#a8743e', w - 18, 1); px(c, 9, 9, '#a8743e', 1, h - 20); px(c, 9, h - 12, '#2a1406', w - 18, 1); px(c, w - 10, 9, '#2a1406', 1, h - 20);
      px(c, 12, 12, 'rgba(255,220,160,0.18)', w - 24, 1); px(c, 0, 0, '#2a1406', w, 1); px(c, 0, 0, '#2a1406', 1, h);
      for (const [x, y] of [[3, 3], [w - 4, 3], [3, h - 4], [w - 4, h - 4]]) px(c, x, y, '#1a0c04');   // pegs
      const r = L.rng(1105); for (let k = 0; k < 6; k++) px(c, r() * w | 0, r() * h | 0, 'rgba(20,10,4,0.5)', 1 + (r() * 4 | 0), 1);   // scratches
    });
    const tPaper = L.cvs(32, 32, (c, w, h) => {   // dark green striped wallpaper, gold motifs, ageing
      const r = L.rng(1110);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 8 - 4, st = (x % 16) < 8; px(c, x, y, st ? rgb(44 + n, 70 + n, 52 + n) : rgb(34 + n, 56 + n, 42 + n)); }
      for (const [x, y] of [[4, 4], [12, 20], [4, 20], [12, 4]]) { const g = (x % 16) < 8 ? '#9a8a4a' : '#6a6034'; px(c, x - 1, y, g, 3, 1); px(c, x, y - 1, g, 1, 3); px(c, x - 2, y - 2, g); px(c, x + 2, y - 2, g); px(c, x - 2, y + 2, g); px(c, x + 2, y + 2, g); }
      for (let x = 0; x < w; x += 8) px(c, x, 0, 'rgba(10,20,14,0.4)', 1, h);
      for (let k = 0; k < 14; k++) px(c, r() * w | 0, r() * h | 0, 'rgba(30,24,10,0.35)', 2, 2);
    });
    const tStain = L.cvs(32, 64, (c, w, h) => {   // water stain running down from the ceiling (decal)
      for (let y = 0; y < h; y++) { const k = 1 - y / h, half = 6 + 5 * Math.sin(y * 0.2) * k; c.fillStyle = `rgba(40,30,12,${(0.42 * k).toFixed(3)})`; c.fillRect(Math.round(16 - half), y, Math.round(half * 2), 1); }
      c.fillStyle = 'rgba(70,52,20,0.5)'; for (let y = 2; y < 40; y += 3) c.fillRect(15 + Math.round(4 * Math.sin(y * 0.3)), y, 2, 1);
    });
    const tFloor = L.cvs(64, 64, (c, w, h) => {   // worn plank floor: 8 planks, staggered end joints, nails, gaps
      for (let p = 0; p < 8; p++) {
        const j = (p * 23) % 64, sh = [['#7a4a26', '#3e200c'], ['#6a3e1e', '#36190a'], ['#82502a', '#44240e']][p % 3];
        grain(c, p * 8, 0, 8, h, sh[0], sh[1], 1120 + p, true);
        px(c, p * 8, 0, '#1a0c04', 1, h); px(c, p * 8 + 1, j, '#1a0c04', 7, 1);
        px(c, p * 8 + 2, (j + 2) % 64, '#c0b0a0'); px(c, p * 8 + 5, (j + 2) % 64, '#c0b0a0'); px(c, p * 8 + 2, (j + 62) % 64, '#a09080'); px(c, p * 8 + 5, (j + 62) % 64, '#a09080');
      }
      const r = L.rng(1130); for (let k = 0; k < 30; k++) px(c, r() * w | 0, r() * h | 0, 'rgba(210,180,140,0.18)', 1 + (r() * 5 | 0), 1);   // wear scuffs
    });
    const tWear = L.cvs(64, 64, (c, w, h) => {   // worn path (scuffed varnish) as a soft decal
      const r = L.rng(1131);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.hypot((x - 32) / 32, (y - 32) / 32); const a = Math.max(0, 1 - d) * (0.25 + r() * 0.2); if (a > 0.02) { c.fillStyle = `rgba(200,160,110,${a.toFixed(2)})`; c.fillRect(x, y, 1, 1); } }
    });
    const tCeil = L.cvs(32, 32, (c, w, h) => {   // acoustic ceiling tiles, one stained
      const r = L.rng(1140);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5; px(c, x, y, rgb(150 + n, 144 + n, 128 + n)); if (r() < 0.12) px(c, x, y, '#7a7464'); }
      px(c, 0, 0, '#4a463e', w, 1); px(c, 0, 0, '#4a463e', 1, h); px(c, 0, 16, '#5a564e', w, 1); px(c, 16, 0, '#5a564e', 1, h);
      for (let y = 18; y < 30; y++) for (let x = 18; x < 30; x++) if (Math.hypot(x - 24, y - 24) < 5 + r()) px(c, x, y, 'rgba(110,84,40,0.45)');
    });
    const tRug = L.cvs(64, 48, (c, w, h) => {   // worn persian rug: border bands, medallion, fringe
      const r = L.rng(1150);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7; px(c, x, y, rgb(118 + n, 30 + n * 0.4, 28 + n * 0.4)); }
      c.fillStyle = '#1e2a4a'; c.fillRect(3, 3, w - 6, 5); c.fillRect(3, h - 8, w - 6, 5); c.fillRect(3, 3, 5, h - 6); c.fillRect(w - 8, 3, 5, h - 6);
      c.fillStyle = '#c8a050'; for (let x = 4; x < w - 4; x += 3) { c.fillRect(x, 5, 1, 1); c.fillRect(x, h - 6, 1, 1); } for (let y = 4; y < h - 4; y += 3) { c.fillRect(5, y, 1, 1); c.fillRect(w - 6, y, 1, 1); }
      c.fillStyle = '#d8b868'; c.fillRect(10, 10, w - 20, 1); c.fillRect(10, h - 11, w - 20, 1); c.fillRect(10, 10, 1, h - 20); c.fillRect(w - 11, 10, 1, h - 20);
      for (let y = -10; y <= 10; y++) for (let x = -16; x <= 16; x++) { const d = Math.abs(x) / 16 + Math.abs(y) / 10; if (d < 1) px(c, 32 + x, 24 + y, d < 0.35 ? '#d8b060' : d < 0.6 ? '#1e2a4a' : d < 0.8 ? '#e0d0b0' : '#5a1410'); }
      for (const [x, y] of [[14, 14], [w - 15, 14], [14, h - 15], [w - 15, h - 15]]) { px(c, x - 2, y, '#1e2a4a', 5, 1); px(c, x, y - 2, '#1e2a4a', 1, 5); }
      for (let x = 0; x < w; x += 2) { px(c, x, 0, '#d8ccb0', 1, 2); px(c, x, h - 2, '#d8ccb0', 1, 2); }
      for (let k = 0; k < 90; k++) { const x = 20 + r() * 26 | 0, y = 14 + r() * 22 | 0; px(c, x, y, 'rgba(230,200,170,0.22)'); }   // threadbare where she stands
    });
    const mBase = lam(tWood(1160, '#3a1c0a', '#24100a')), mRail = lam(tWood(1161, '#6a3a1a', '#3a1c0a'));
    // walls: wainscot (0..1.0) + chair rail + wallpaper (1.0..2.6) + baseboard + crown moulding; the left wall leaves the door gap
    const trim = (w, cx, cz, ry, d, hh, y, m) => { const n = V(Math.sin(ry), 0, Math.cos(ry)), o = B(w, hh, d, m, cx + n.x * d / 2, y, cz + n.z * d / 2, scene); o.rotation.y = ry; return o; };
    const wall = (w, cx, cz, ry, wains = true) => {
      if (wains) { L.plane(w, 1.0, lam(L.rep(tWains, w / 0.8, 1)), cx, 0.5, cz, scene, ry); trim(w, cx, cz, ry, 0.03, 0.14, 0.07, mBase); trim(w, cx, cz, ry, 0.04, 0.05, 1.0, mRail); L.plane(w, 1.6, lam(L.rep(tPaper, w / 0.5, 1.6 / 0.5)), cx, 1.8, cz, scene, ry); }
      trim(w, cx, cz, ry, 0.05, 0.08, 2.56, mRail);
    };
    wall(3.2, 0, -0.9, 0); wall(3.6, 1.6, 0.9, -Math.PI / 2);
    wall(2.4, -1.6, 1.25, Math.PI / 2);                                                       // left wall in front of the door
    wall(0.96, -1.6, -0.42, Math.PI / 2, false); L.plane(0.96, 0.46, lam(L.rep(tPaper, 0.96 / 0.5, 0.46 / 0.5)), -1.6, 2.37, -0.42, scene, Math.PI / 2);   // over the door
    L.plane(1.6, 2.4, L.basic(tStain, 0xffffff, { transparent: true, depthWrite: false }), 1.2, 1.4, -0.885, scene);
    // floor + worn path + rug, ceiling + dead light fixture
    L.plane(3.2, 3.6, lam(L.rep(tFloor, 4, 4.5)), 0, 0, 0.9, scene, 0, -Math.PI / 2);
    { const wp = L.plane(1.0, 2.6, L.basic(tWear, 0xffffff, { transparent: true, depthWrite: false }), -0.9, 0.002, -0.2, scene, 0, -Math.PI / 2); wp.rotation.z = 1.25; }
    L.plane(1.7, 1.25, lam(tRug), -0.05, 0.004, 0.42, scene, 0, -Math.PI / 2);
    L.plane(3.2, 3.6, lam(L.rep(tCeil, 5, 6)), 0, 2.6, 0.9, scene, 0, Math.PI / 2);
    { const g = new THREE.Group(); g.position.set(0.1, 2.6, 0.5); scene.add(g);
      B(1.24, 0.08, 0.34, lam(null, 0x9a968a), 0, -0.04, 0, g);
      L.plane(1.16, 0.28, lam(L.cvs(32, 8, (c) => { c.fillStyle = '#5a5a56'; c.fillRect(0, 0, 32, 8); c.fillStyle = '#2a2a2a'; c.fillRect(1, 2, 30, 1); c.fillRect(1, 5, 30, 1); c.fillStyle = '#1a1a1a'; for (const x of [6, 13, 21, 25]) c.fillRect(x, 3, 1, 1); c.fillStyle = '#7a7a72'; c.fillRect(0, 0, 32, 1); c.fillRect(20, 4, 9, 4); c.fillStyle = '#3a3a36'; c.fillRect(22, 5, 5, 2); })), 0, -0.081, 0, g, 0, Math.PI / 2);   // dead tubes, dead flies, a missing diffuser panel
      for (const sx of [-0.5, 0.5]) B(0.02, 0.02, 0.36, lam(null, 0x6a665e), sx, -0.085, 0, g);
      for (let k = 0; k < 6; k++) B(0.008, 0.03, 0.008, lam(null, 0x8a8a80), 0.45, -0.1 - k * 0.032, 0.1, g);   // pull chain
    }
    // framed picture (gilt frame, a landscape, brass plate)
    { const g = new THREE.Group(); g.position.set(-0.78, 1.72, -0.885); scene.add(g); const mF = lam(tWood(1170, '#b08a3a', '#5a4010')), mFd = lam(null, 0x3a2a10);
      B(0.62, 0.06, 0.04, mF, 0, 0.23, 0, g); B(0.62, 0.06, 0.04, mF, 0, -0.23, 0, g); B(0.06, 0.52, 0.04, mF, -0.28, 0, 0, g); B(0.06, 0.52, 0.04, mF, 0.28, 0, 0, g);
      B(0.5, 0.4, 0.012, mFd, 0, 0, -0.012, g);
      L.plane(0.5, 0.4, lam(L.cvs(40, 32, (c) => { const gr = c.createLinearGradient(0, 0, 0, 18); gr.addColorStop(0, '#2a3a6a'); gr.addColorStop(1, '#c08a4a'); c.fillStyle = gr; c.fillRect(0, 0, 40, 18);
        c.fillStyle = '#4a4a5a'; c.beginPath(); c.moveTo(0, 18); c.lineTo(10, 8); c.lineTo(18, 14); c.lineTo(28, 5); c.lineTo(40, 16); c.lineTo(40, 18); c.fill();
        c.fillStyle = '#d8d8e0'; c.beginPath(); c.moveTo(26, 7); c.lineTo(28, 5); c.lineTo(30, 7); c.fill();
        c.fillStyle = '#2a4a5a'; c.fillRect(0, 18, 40, 5); c.fillStyle = '#6a8a9a'; for (let x = 2; x < 40; x += 5) c.fillRect(x, 19 + (x % 3), 3, 1);
        c.fillStyle = '#2a3a1a'; c.fillRect(0, 23, 40, 9); c.fillStyle = '#1a2a10'; for (let x = 0; x < 40; x += 4) c.fillRect(x, 21 + (x % 3), 3, 4);
        c.fillStyle = '#f0e0a0'; c.fillRect(33, 3, 3, 3); })), 0, 0, 0.022, g);
      B(0.08, 0.02, 0.01, lam(null, 0xc8a850), 0, -0.235, 0.025, g); }
    // wall clock on the left wall, stopped at 2:47 (the save time)
    { const g = new THREE.Group(); g.position.set(-1.585, 1.98, 1.55); g.rotation.y = Math.PI / 2; scene.add(g);
      const fc = L.cvs(32, 32, (c) => { c.fillStyle = '#3a2410'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#e8e0c8'; c.beginPath(); c.arc(16, 16, 13, 0, 7); c.fill();
        c.fillStyle = '#2a2420'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, big = k % 3 === 0; c.fillRect(Math.round(16 + Math.sin(a) * 11) - (big ? 1 : 0), Math.round(16 - Math.cos(a) * 11) - (big ? 1 : 0), big ? 2 : 1, big ? 2 : 1); }
        c.strokeStyle = '#1a1410'; c.lineWidth = 2; const ha = (2 + 47 / 60) / 12 * Math.PI * 2, ma = 47 / 60 * Math.PI * 2;
        c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.sin(ha) * 6, 16 - Math.cos(ha) * 6); c.stroke(); c.lineWidth = 1; c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.sin(ma) * 10, 16 - Math.cos(ma) * 10); c.stroke(); });
      const cl = cyl(0.15, 0.15, 0.04, 14, [lam(null, 0x4a2c14), lam(fc), lam(null, 0x2a1a0a)], 0, 0, 0.02, g); cl.rotation.x = Math.PI / 2; }
    // cork notice board on the left wall (pinned notes, a station floor plan)
    { const g = new THREE.Group(); g.position.set(-1.585, 1.45, 0.72); g.rotation.y = Math.PI / 2; scene.add(g);
      B(0.78, 0.56, 0.02, lam(tWood(1180, '#5a3418', '#2e180a')), 0, 0, 0, g);
      L.plane(0.7, 0.48, lam(L.cvs(32, 24, (c) => { const r = L.rng(1181); for (let y = 0; y < 24; y++) for (let x = 0; x < 32; x++) { const n = r() * 30 - 15; c.fillStyle = rgb(170 + n, 120 + n, 70 + n); c.fillRect(x, y, 1, 1); } })), 0, 0, 0.011, g);
      const notes = [[-0.22, 0.08, 0.16, 0.2, '#ece6d0', 0.08], [0.0, 0.1, 0.14, 0.12, '#f0e080', -0.1], [0.2, 0.04, 0.2, 0.26, '#d8e4f0', 0.04], [-0.05, -0.12, 0.18, 0.12, '#ece6d0', -0.05]];
      notes.forEach(([x, y, w, h, col, rz], i) => { const m = L.plane(w, h, lam(L.cvs(16, 16, (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = '#4a4a50'; for (let k = 2; k < 14; k += 3) c.fillRect(2, k, 6 + ((k * 7 + i * 3) % 7), 1); if (i === 2) { c.fillStyle = '#3a5a8a'; c.fillRect(2, 2, 12, 1); c.fillRect(2, 2, 1, 12); c.fillRect(8, 2, 1, 8); c.fillRect(2, 9, 12, 1); } })), x, y, 0.014 + i * 0.001, g); m.rotation.z = rz;
        L.mesh(new THREE.SphereGeometry(0.012, 5, 3), lam(null, [0xc82020, 0x2050c8, 0x20a040, 0xe0c020][i]), x, y + h / 2 - 0.02, 0.02, g); });
    }
    // filing cabinet (back wall, right of the desk) + wall shelves with binders and archive boxes above it
    { const tCab = L.cvs(32, 64, (c, w, h) => { const r = L.rng(1190);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 12 - 6; px(c, x, y, rgb(96 + n, 104 + n, 92 + n)); }
        for (let d = 0; d < 3; d++) { const y0 = 2 + d * 21; px(c, 1, y0, '#c0c8b8', w - 2, 1); px(c, 1, y0 + 19, '#3a4038', w - 2, 1); px(c, 1, y0, '#c0c8b8', 1, 19); px(c, w - 2, y0, '#3a4038', 1, 19);
          px(c, 11, y0 + 4, '#2a2e28', 10, 6); px(c, 12, y0 + 5, '#e8e0c8', 8, 4); px(c, 13, y0 + 6, '#5a5a5a', 6, 1); px(c, 9, y0 + 12, '#d8dcd0', 14, 2); px(c, 9, y0 + 14, '#2a2e28', 14, 1); px(c, 15, y0 + 16, '#c8b040', 2, 2); }
        for (let k = 0; k < 8; k++) px(c, r() * 30 | 0, r() * 62 | 0, '#5a4030', 1 + (r() * 2 | 0), 1); for (let k = 0; k < 5; k++) px(c, r() * 30 | 0, r() * 62 | 0, '#d0d4c8', 3, 1); });
      const mS = lam(null, 0x5e6658);
      B(0.42, 1.0, 0.42, [mS, mS, lam(null, 0x6a7264), mS, lam(tCab), mS], 0.56, 0.5, -0.68, scene);
      const spineT = {}, spine = (col) => spineT[col] || (spineT[col] = L.cvs(8, 32, (c) => { c.fillStyle = '#' + col.toString(16).padStart(6, '0'); c.fillRect(0, 0, 8, 32); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(0, 0, 1, 32); c.fillStyle = '#e8e4d8'; c.fillRect(1, 5, 6, 9); c.fillStyle = '#3a3a3a'; c.fillRect(2, 7, 4, 1); c.fillRect(2, 9, 3, 1); c.fillStyle = 'rgba(0,0,0,0.6)'; c.beginPath(); c.arc(4, 24, 2, 0, 7); c.fill(); }));
      const binder = (w, h, d, col, x, y, z) => { const m0 = lam(null, col); return B(w, h, d, [m0, m0, m0, m0, lam(spine(col)), m0], x, y, z, scene); };
      const mSh = lam(tWood(1191, '#6a3e1e', '#3a1e0a'));
      for (const y of [1.45, 1.84]) { B(1.12, 0.025, 0.22, mSh, 0.8, y, -0.79, scene); for (const xx of [0.32, 1.28]) B(0.02, 0.14, 0.16, lam(null, 0x2a2a28), xx, y - 0.08, -0.82, scene); }
      [0x1c3a6a, 0x6a1c1c, 0x1c4a2a, 0x1c3a6a, 0x2a2a2a, 0x6a5a1c, 0x6a1c1c, 0x1c3a6a].forEach((col, i) => binder(0.055, 0.28, 0.2, col, 0.3 + i * 0.062, 1.462 + 0.14, -0.78));
      const lean = binder(0.055, 0.28, 0.2, 0x2a2a2a, 0.86, 1.462 + 0.135, -0.78); lean.rotation.z = -0.32;
      const tBox = L.cvs(32, 32, (c) => { c.fillStyle = '#a07a4a'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#8a643a'; c.fillRect(0, 0, 32, 2); c.fillRect(0, 30, 32, 2); c.fillStyle = '#c8b890'; c.fillRect(13, 0, 6, 32); c.fillStyle = '#1a1a1a'; c.fillRect(4, 12, 8, 2); c.fillRect(4, 16, 6, 2); c.fillRect(21, 13, 7, 2); c.fillStyle = '#e8e0cc'; c.fillRect(20, 20, 9, 6); });
      const mBx = lam(null, 0x8a643a);
      for (const [xx, w] of [[0.48, 0.34], [0.9, 0.3]]) B(w, 0.22, 0.2, [mBx, mBx, lam(null, 0x9a744a), mBx, lam(tBox), mBx], xx, 1.852 + 0.11, -0.79, scene);
      for (let i = 0; i < 3; i++) binder(0.05, 0.24, 0.18, [0x1c4a2a, 0x6a1c1c, 0x1c3a6a][i], 1.12 + i * 0.056, 1.852 + 0.12, -0.79);
      cyl(0.04, 0.04, 0.05, 10, [lam(null, 0x8a2a1a), lam(L.cvs(8, 8, (c) => { c.fillStyle = '#c8a040'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#5a1a10'; c.fillRect(2, 2, 4, 4); })), lam(null, 0x3a1a10)], 1.27, 1.477 + 0.025, -0.76, scene);   // ink ribbon tin
    }
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
    { const mCap = [lam(null, 0x2a2a28), lam(L.cvs(8, 8, (c) => { c.fillStyle = '#e8e4d4'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#9a968a'; c.fillRect(0, 6, 8, 2); c.fillStyle = '#2a2a2a'; c.fillRect(3, 2, 2, 3); })), lam(null, 0x1a1a1a)], mRim = lam(null, 0xb8b8b0);
      [10, 10, 9, 8].forEach((n, row) => { for (let k = 0; k < n; k++) { const xx = -0.135 + row * 0.008 + k * 0.03, zz = -0.048 + row * 0.027;
        cyl(0.0105, 0.0105, 0.004, 8, mRim, xx, 0.008, zz, deck); cyl(0.009, 0.009, 0.008, 8, mCap, xx, 0.014, zz, deck); } });
      B(0.17, 0.008, 0.014, [mRim, mRim, lam(null, 0xe0dccc), mRim, mRim, mRim], 0.0, 0.012, 0.06, deck);   // space bar
      for (let k = 0; k < 15; k++) { const a = -1.25 + k * 2.5 / 14, bar = B(0.003, 0.003, 0.05, lam(null, 0x2a2a2a), Math.sin(a) * 0.035, 0.13, -0.04 + Math.cos(a) * 0.03, tw); bar.rotation.y = a; }   // type bars
      B(0.36, 0.008, 0.008, mChr, 0, 0.13, -0.135, tw); B(0.04, 0.02, 0.02, lam(null, 0xc8a040), 0, 0.09, 0.022, tw);   // carriage rail, brass badge
    }
    const carriage = new THREE.Group(); carriage.position.set(0, 0.15, -0.1); tw.add(carriage);
    { const pl = cyl(0.025, 0.025, 0.42, 10, mBlk, 0, 0, 0, carriage); pl.rotation.z = Math.PI / 2;   // platen
      for (const s of [-1, 1]) { const k = cyl(0.03, 0.03, 0.02, 8, mBlk, s * 0.22, 0, 0, carriage); k.rotation.z = Math.PI / 2; }
      B(0.44, 0.012, 0.03, mChr, 0, 0.02, 0.03, carriage);                    // paper bail
      const lev = B(0.09, 0.012, 0.012, mChr, -0.26, 0.03, 0.02, carriage); lev.rotation.z = 0.4;   // return lever
      const ppr = L.plane(0.15, 0.17, L.basic(L.cvs(32, 32, (c) => { c.fillStyle = '#ece8dc'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#d8d0bc'; c.fillRect(31, 0, 1, 32); c.fillStyle = '#3a3a3a';
        for (let y = 4; y < 30; y += 3) { let xx = 3; while (xx < 28) { const wl = 2 + ((xx * 7 + y * 3) % 5); if (xx + wl > 28) break; c.fillRect(xx, y, wl, 1); xx += wl + 1; } } }), 0xd8d4c8, { side: THREE.DoubleSide }), 0, 0.1, -0.03, carriage); ppr.rotation.x = -0.32;
      const rest = B(0.2, 0.004, 0.08, mChr, 0, 0.05, -0.05, carriage); rest.rotation.x = -0.6; }
    for (const s of [-1, 1]) { const sp = cyl(0.03, 0.03, 0.012, 10, lam(null, 0x2a1a1a), s * 0.1, 0.132, -0.02, tw); void sp; }   // ribbon spools
    // the ink ribbons next to it (x2)
    for (let i = 0; i < 2; i++) { const r = B(0.06, 0.02, 0.04, lam(null, 0x202024), 0.32 + i * 0.07, TY + 0.01, 0.42, scene); r.rotation.y = 0.2 * i; B(0.036, 0.004, 0.024, lam(null, 0xd8d8d0), 0.32 + i * 0.07, TY + 0.021, 0.42, scene).rotation.y = 0.2 * i; }
    // lamp (green banker's lamp) on the table right
    { const g = new THREE.Group(); g.position.set(0.45, TY, 0.18); scene.add(g); const mBr = lam(null, 0xb09040);
      cyl(0.06, 0.07, 0.02, 8, mBr, 0, 0.01, 0, g); cyl(0.008, 0.008, 0.3, 5, mBr, 0, 0.16, 0, g);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.07, 10, 1, true), L.lam(null, 0x2a7a40, { side: THREE.DoubleSide })); sh.position.set(0, 0.32, 0.02); scene.add(sh); g.add(sh);
      L.mesh(new THREE.SphereGeometry(0.025, 6, 4), L.basic(null, 0xffe8b0), 0, 0.3, 0.02, g);
      B(0.004, 0.06, 0.004, mBr, 0.03, 0.27, 0.03, g); L.mesh(new THREE.SphereGeometry(0.006, 4, 3), mBr, 0.03, 0.24, 0.03, g); }   // pull chain
    const pool = new THREE.SpotLight(0xffb060, 7, 2.6, 1.05, 0.7, 1.2); pool.position.set(0.45, TY + 0.3, 0.2); pool.target.position.set(0.2, TY, 0.32); scene.add(pool); scene.add(pool.target);
    { const tPool = L.cvs(32, 32, (c) => { const gr = c.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,200,120,0.55)'); gr.addColorStop(0.55, 'rgba(255,170,80,0.22)'); gr.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = gr; c.fillRect(0, 0, 32, 32); });
      L.plane(0.95, 0.7, new THREE.MeshBasicMaterial({ map: tPool, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0.3, TY + 0.003, 0.3, scene, 0, -Math.PI / 2);
      L.plane(1.3, 1.0, new THREE.MeshBasicMaterial({ map: tPool, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }), 0.45, 1.25, -0.885, scene); }   // warm glow on the wall behind
    // desk clutter: report stack, pen, chipped mug, a red ink-ribbon box
    { const tRep = L.cvs(16, 16, (c) => { c.fillStyle = '#e4dcc4'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#5a5a5a'; for (let y = 3; y < 15; y += 2) c.fillRect(2, y, 8 + (y * 5 % 5), 1); c.fillStyle = '#8a2a20'; c.fillRect(2, 1, 6, 1); });
      for (let i = 0; i < 4; i++) { const pp = L.plane(0.2, 0.26, lam(tRep), -0.38 + i * 0.006, TY + 0.003 + i * 0.002, 0.38 - i * 0.004, scene, 0, -Math.PI / 2); pp.rotation.z = 0.15 - i * 0.07; }
      const pen = cyl(0.004, 0.004, 0.13, 6, lam(null, 0x1a1a3a), -0.3, TY + 0.012, 0.25, scene); pen.rotation.set(0, 0.6, Math.PI / 2);
      cyl(0.035, 0.03, 0.09, 10, [lam(L.cvs(16, 8, (c) => { c.fillStyle = '#e8e4dc'; c.fillRect(0, 0, 16, 8); c.fillStyle = '#2a4a8a'; c.fillRect(0, 2, 16, 2); c.fillStyle = '#b8b0a0'; c.fillRect(5, 0, 1, 1); })), lam(null, 0x2a1408), lam(null, 0xd8d4cc)], -0.46, TY + 0.045, 0.16, scene);
      const hd = L.mesh(new THREE.TorusGeometry(0.022, 0.006, 4, 8), lam(null, 0xe8e4dc), -0.497, TY + 0.05, 0.16, scene); hd.rotation.y = Math.PI / 2; }
    // herb pot on the table left, item box (chest) on the floor at the left
    Rherb(scene, 0.5, TY + 0.008, 0.46, 1.4); cyl(0.085, 0.07, 0.008, 10, lam(null, 0x8a4a2a), 0.5, TY + 0.004, 0.46, scene);   // herb + clay saucer
    { const g = new THREE.Group(); g.position.set(1.2, 0, -0.54); g.rotation.y = -0.35; scene.add(g);
      const tChest = L.cvs(32, 32, (c, w, h) => { const r = L.rng(105); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7, k = 0.5 + 0.4 * Math.sin(x * 0.4 + Math.sin(y * 0.3) * 2); c.fillStyle = rgb(120 * k + 40 + n, 76 * k + 22 + n, 36 * k + 10 + n); c.fillRect(x, y, 1, 1); }
        c.fillStyle = '#2a1408'; for (let y = 0; y < h; y += 8) c.fillRect(0, y, w, 1); });   // horizontal planks
      const tIron = L.cvs(8, 32, (c) => { c.fillStyle = '#3a3a38'; c.fillRect(0, 0, 8, 32); c.fillStyle = '#5a5a56'; c.fillRect(0, 0, 1, 32); c.fillStyle = '#1a1a1a'; c.fillRect(7, 0, 1, 32); for (let y = 3; y < 32; y += 8) { c.fillStyle = '#9a9890'; c.fillRect(3, y, 2, 2); c.fillStyle = '#1a1a18'; c.fillRect(4, y + 1, 1, 1); } c.fillStyle = 'rgba(120,60,30,0.6)'; c.fillRect(2, 18, 2, 3); });
      const mCh = lam(L.rep(tChest, 2, 1.2)), mIr = lam(tIron), mIrD = lam(null, 0x2a2a28), mBr = lam(null, 0xb89040);
      B(0.7, 0.4, 0.42, mCh, 0, 0.2, 0, g);
      const lid = L.mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.7, 8, 1, false, 0, Math.PI), mCh, 0, 0.4, 0, g); lid.rotation.set(0, 0, Math.PI / 2); lid.scale.set(1, 1, 0.6);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {   // L-shaped iron corner brackets
        B(0.09, 0.42, 0.012, mIr, sx * 0.31, 0.2, sz * 0.216, g); B(0.012, 0.42, 0.09, mIr, sx * 0.356, 0.2, sz * 0.17, g);
        B(0.1, 0.012, 0.1, mIrD, sx * 0.3, 0.004, sz * 0.17, g); }
      for (const x of [-0.17, 0.17]) { B(0.035, 0.405, 0.43, mIrD, x, 0.2, 0, g); const bnd = L.mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.035, 8, 1, true, 0, Math.PI), mIrD, x, 0.4, 0, g); bnd.rotation.set(0, 0, Math.PI / 2); bnd.scale.set(1, 1, 0.6);
        for (let k = 0; k < 4; k++) L.mesh(new THREE.SphereGeometry(0.008, 4, 3), mBr, x, 0.06 + k * 0.1, 0.218, g); }
      for (const sx of [-1, 1]) { const cap = L.mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8, 1, false, 0, Math.PI), mIr, sx * 0.33, 0.4, 0, g); cap.rotation.set(0, 0, Math.PI / 2); cap.scale.set(1, 1, 0.6);   // lid end caps
        B(0.02, 0.03, 0.14, mIrD, sx * 0.37, 0.3, 0, g); B(0.02, 0.06, 0.02, mIrD, sx * 0.37, 0.27, 0.06, g); B(0.02, 0.06, 0.02, mIrD, sx * 0.37, 0.27, -0.06, g); }   // side handles
      B(0.7, 0.03, 0.43, mIrD, 0, 0.395, 0, g);   // lid seam
      L.plane(0.1, 0.12, lam(L.cvs(8, 10, (c) => { c.fillStyle = '#c8a040'; c.fillRect(0, 0, 8, 10); c.fillStyle = '#e8d070'; c.fillRect(0, 0, 8, 1); c.fillStyle = '#6a4a10'; c.fillRect(0, 9, 8, 1); c.fillStyle = '#100a04'; c.fillRect(3, 3, 2, 2); c.fillRect(3, 5, 2, 3); })), 0, 0.34, 0.223, g); }
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
    // the door Ava comes in through (left wall, hinged on its back edge, swings into the room)
    const DZ49 = -0.42;
    L.plane(0.86, 2.06, L.basic(null, 0x080605), -1.595, 1.03, DZ49, scene, Math.PI / 2);
    const mDf = lam(tWood(108, '#5a3418', '#2e180a'));
    B(0.08, 2.14, 0.08, mDf, -1.58, 1.07, DZ49 - 0.47, scene); B(0.08, 2.14, 0.08, mDf, -1.58, 1.07, DZ49 + 0.47, scene); B(0.08, 0.08, 1.02, mDf, -1.58, 2.14, DZ49, scene);
    const dHinge = new THREE.Group(); dHinge.position.set(-1.58, 0, DZ49 - 0.43); scene.add(dHinge);
    { const d = B(0.04, 2.02, 0.84, lam(tWood(109, '#7a4a28', '#4a2812')), 0, 1.02, 0.42, dHinge); void d; B(0.06, 0.04, 0.04, lam(null, 0xc8a040), 0.04, 1.0, 0.76, dHinge); }
    const c49 = cam(46), c49b = cam(40), c50 = cam(44);
    const P49 = [V(-2.2, 0, DZ49), V(-1.0, 0, DZ49), V(SEAT.x, 0, SEAT.z)];
    const typed = (t) => { let n = 0; for (const [tk] of x.keys) if (t >= tk) n++; return n; };
    out['49_save_room'] = { scene, camera: c49, update(lt, t) {
      const front = t >= x.s2;   // RE cut to the frontal angle when she reaches the typewriter and talks to us
      out['49_save_room'].camera = front ? c49b : c49;
      const { go, mid, stop } = x.walk49;
      let p, d;
      if (t < mid) { const u = L.clamp01((t - go) / (mid - go)); p = P49[0].clone().lerp(P49[1], u); d = P49[1].clone().sub(P49[0]); }
      else { const u = L.clamp01((t - mid) / (stop - mid)); p = P49[1].clone().lerp(P49[2], u); d = P49[2].clone().sub(P49[1]); }
      const arrived = t >= stop;
      ch.root.position.copy(p); ch.root.rotation.y = Math.atan2(d.x, d.z) * (arrived ? 1 - L.smooth((t - stop) / 0.4) : 1);   // turns to face the room
      dHinge.rotation.y = 1.35 * L.smooth((t - x.door49) / 0.5) * (1 - L.smooth((t - x.door49 - 1.2) / 0.5));
      const tp = x.exactly - x.s49 - 0.2;
      const eyes = t > x.this49 - 0.05 ? 'wink' : front ? 'happy' : arrived && t < stop + 0.4 ? 'open' : 'open';
      ch.pose(lt, [L.seg('walk', go - x.s49, { loop: true, speed: 0.85 }), L.seg('idle', stop - x.s49, { fade: 0.3 }), L.seg('present', tp, { fade: 0.25 })],
        [[-99, eyes, mouthAt(t, front ? 'smile' : 'neutral')]]);
      look(c49, V(1.3, 2.45, 2.45), V(-0.6, 0.75, -0.35));
      const kb = L.smooth((t - x.s2) / (x.e49 - x.s2));
      look(c49b, V(0.12, 1.42, 1.8 - 0.3 * kb), V(0.0, 1.2, 0.0));
      if (front) ch.lookAt(c49b, 1, 40);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5) };
    out['50_save'] = { scene, camera: c50, update(lt, t) {
      ch.root.position.copy(SEAT); ch.root.rotation.y = 0; dHinge.rotation.y = 0;
      const n = typed(t), lastK = n ? x.keys[n - 1][0] : -9, hit = t - lastK < 0.05;
      const eyes = t > x.save + 0.4 && t < x.save + 0.5 ? 'blink' : t > x.day + 0.1 && t < x.day + 0.6 ? 'wink' : t > x.two50 + 0.1 ? 'happy' : 'open';
      ch.pose(lt, TYPE(hit), [[-99, eyes, mouthAt(t, 'smile')]]);
      const k = L.smooth(lt / (x.e50 - x.s50));
      look(c50, V(1.35 - 0.1 * k, 1.8 - 0.06 * k, 2.0 - 0.15 * k), V(0.62, 0.98, 0.1));
      ch.lookAt(c50, 1, 40);
      const nL = x.lines[0][0].length + x.lines[1][0].length, line2 = t >= x.ret, col = line2 ? x.keys.filter(([tk], i) => i >= nL && t >= tk).length : Math.min(n, nL);
      carriage.position.x = 0.06 - col * 0.008;
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.5);
      const c = o.tctx, t = x.s50 + lt;
      // RE prompt on "save": "Will you save your game?" > YES  NO
      if (t >= x.save && t < x.close) {
        const kk = L.clamp01((t - x.save) / 0.1), Wd = 210, Hd = 58, X = 452 - Wd / 2, Y = 116;
        c.fillStyle = `rgba(0,0,0,${0.82 * kk})`; c.fillRect(X, Y, Wd, Hd);
        c.fillStyle = mixHex('#000000', '#6a6a72', kk); c.fillRect(X, Y, Wd, 1); c.fillRect(X, Y + Hd - 1, Wd, 1);
        bitText(c, 'Will you save your game?', X + Wd / 2, Y + 18, 2, mixHex('#000000', '#ececec', kk), { outline: null });
        const sel = t >= x.yes, blink = sel ? Math.floor((t - x.yes) * 20) % 2 === 0 : true;
        bitText(c, 'YES', X + Wd / 2 - 34, Y + 41, 2, sel && !blink ? '#7a7a7a' : mixHex('#000000', '#ffffff', kk), { outline: null });
        bitText(c, 'NO', X + Wd / 2 + 38, Y + 41, 2, mixHex('#000000', '#8a8a8a', kk), { outline: null });
        if (blink) bitText(c, '>', X + Wd / 2 - 64, Y + 41, 2, '#ffe048', { outline: null });
      }
      // typed sheet (Courier, one key per letter)
      if (t >= x.sheet) {
        const u = L.smooth((t - x.sheet) / 0.15), Wd = 210, Hd = 80, X = 452 - Wd / 2, Y = Math.round(112 - (1 - u) * 30);
        c.globalAlpha = u;
        c.fillStyle = '#e4dcc4'; c.fillRect(X, Y, Wd, Hd);
        c.fillStyle = 'rgba(120,100,70,0.18)'; for (let y = Y + 6; y < Y + Hd; y += 9) c.fillRect(X + 4, y, Wd - 8, 1);
        c.fillStyle = '#b8ac90'; c.fillRect(X, Y + Hd - 2, Wd, 2); c.fillRect(X + Wd - 2, Y, 2, Hd);
        c.fillStyle = '#c84a3a'; c.fillRect(X + 18, Y, 1, Hd);
        c.globalAlpha = 1;
        c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#1e1a16'; c.font = 'bold 15px "Courier New", monospace';
        const shown = (i) => { const [s, t0, d] = x.lines[i]; return t < t0 ? '' : s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - t0) / d + 1e-6) + 1))); };
        const l1 = shown(0) + shown(1), l2 = shown(2);
        c.fillText(l1, X + 26, Y + 25);
        if (l2) c.fillText(l2, X + 26, Y + 53);
        if (Math.floor(t * 4) % 2 === 0) { const w = c.measureText(l2 || l1).width; c.fillRect(X + 27 + w, l2 ? Y + 60 : Y + 32, 8, 2); }
        c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      }
    } };
  }

  return out;
}
