// sets/ext.js — LARGO 16:9 exteriors (one night city world shared by every exterior shot):
// 01_ext_open (low push-in on the facade, rain, 3 zombies crossing, abandoned patrol car, lightning on "city"),
// 07_ext_car (Ava's own car out of gas two blocks down the avenue, hazards blinking, fuel gauge EMPTY on "gas", the station the
// only lit building far away), 08_ext_lights (fixed low angle from the sidewalk, lights on inside, Ava runs up the steps),
// 28_dinner_bell (sound rings leave the facade, zombies turn their heads, DINNER BELL on "bell"), 64_city (high wide city,
// the antenna broadcasts rings, zombies from every street walk to the station), 68_final_ext (mirror of 01: same camera,
// every light on, the horde at the door). Contract: SETS.md. Times are anchored to words inside the functions.
// World: station facade at z=-9 facing +z (body back to z=-26, antenna on the roof), front street z -4.4..7.6 along x,
// avenue x -6..6 running +z (T junction), side streets x=±40, cross streets z=40 / z=78.
import { reText as bitText, reWidth as textWidth } from '../refont.js';

// ---------- word anchors (global s) shared by shots() and sfx() ----------
const STEP_PH = [0.12, 0.60];   // walk clip foot contacts (s in its 1.0 s cycle)
function walkSteps(at, speed, t0, t1) { const out = [], x0 = (t0 - at) * speed, x1 = (t1 - at) * speed; for (let n = Math.floor(x0) - 1; n <= Math.ceil(x1); n++) for (const c of STEP_PH) { const xx = n + c; if (xx >= x0 && xx < x1) out.push(at + xx / speed); } return out; }

// ---------- 08: Ava's path to the door (shared by shots() and sfx()) ----------
// The left leaf is hinged at x=-1.01 on the door plane z=-8.98 and swings INWARD (rotation.y = +theta); its handle (pull bar,
// leaf-local x 0.87, y 2.2) is gripped on the outside face. Ava walks x=-0.41 (in the 1 m opening), right hand on the handle.
const HINGE08 = [-1.01, -8.98];
const leaf08 = (r, lt) => { const u = Math.min(1, Math.max(0, (lt - r.tc) / 0.85)); return 1.48 * u * u * (3 - 2 * u); };
const handle08 = (th) => [HINGE08[0] + 0.87 * Math.cos(th) + 0.1 * Math.sin(th), HINGE08[1] - 0.87 * Math.sin(th) + 0.1 * Math.cos(th)];
const KN08 = (r) => [[-0.3, -1.6, -3.9], [r.steps, 0.4, -5.75], [r.top, -0.12, -8.05], [r.tc, -0.41, -8.4]];
function path08(r, lt) {   // body root (x, z) on the ground
  const K = KN08(r);
  if (lt <= K[0][0]) return [K[0][1], K[0][2]];
  if (lt < r.tc) {
    let i = 0; while (lt > K[i + 1][0]) i++;
    let u = (lt - K[i][0]) / (K[i + 1][0] - K[i][0]); if (i === 2) u = 1 - (1 - u) * (1 - u);   // last stretch: decelerate into the handle
    return [K[i][1] + (K[i + 1][1] - K[i][1]) * u, K[i][2] + (K[i + 1][2] - K[i][2]) * u];
  }
  const rel = r.tc + 0.6, zc = (l) => handle08(leaf08(r, l))[1] + 0.48;   // in contact: she stays an arm's length behind the handle
  if (lt <= rel) return [-0.41, zc(lt)];
  const z0 = zc(rel), v0 = (zc(rel) - zc(rel - 0.02)) / 0.02, T = Math.max(0.2, r.D + 0.1 - rel), zF = -9.62, s = Math.min(1, (lt - rel) / T);   // released: Hermite ease into the vestibule
  const h00 = 2 * s ** 3 - 3 * s * s + 1, h10 = s ** 3 - 2 * s * s + s, h01 = -2 * s ** 3 + 3 * s * s;
  return [-0.41, h00 * z0 + h10 * v0 * T + h01 * zF];
}
function phase08(r) {   // walk-clip phase = integral of body speed / 1.25 m/s (fixed 1/60 s steps: deterministic), foot contacts
  const dt = 1 / 60, ph = [], steps = []; let acc = 0;
  for (let i = 0, lt = -0.6; lt < r.D + 0.2; i++, lt = -0.6 + i * dt) {
    const a = path08(r, lt - 0.01), b = path08(r, lt + 0.01), v = Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.02;
    const rate = Math.min(2.1, Math.max(0.35, v / 1.25)), nx = acc + rate * dt;
    for (let n = Math.floor(acc) - 1; n <= Math.ceil(nx); n++) for (const c of STEP_PH) { const k = n + c; if (k > acc && k <= nx && lt >= 0 && lt < r.D) steps.push([lt, k]); }
    ph.push(acc); acc = nx;
  }
  return { steps, at: (lt) => ph[Math.max(0, Math.min(ph.length - 1, Math.round((lt + 0.6) / dt)))] };
}

function X(ctx) {
  const { T, at, CUTS } = ctx;
  const end = (id) => { const i = CUTS.findIndex((c) => c[0] === id); return CUTS[i + 1] ? CUTS[i + 1][1] : T[id] + 6; };
  const o = {};
  o.s01 = T['01_ext_open']; o.e01 = end('01_ext_open'); o.city01 = at('h1', 'city');
  o.s07 = T['07_ext_car']; o.e07 = end('07_ext_car'); o.gas = at('a1', 'gas'); o.gasPre = at('a1', 'of'); o.two07 = at('a1', 'two'); o.away = at('a1', 'away');
  o.s08 = T['08_ext_lights']; o.e08 = end('08_ext_lights'); o.lights = at('a2', 'lights'); o.this08 = at('a2', 'this');
  o.s28 = T['28_dinner_bell']; o.e28 = end('28_dinner_bell'); o.fire = at('m8', 'fire'); o.bell = at('m8', 'bell'); o.block = at('m8', 'block');
  o.s64 = T['64_city']; o.e64 = end('64_city'); o.message = at('l7', 'message'); o.calling = at('l7', 'calling');
  o.s68 = T['68_final_ext']; o.e68 = end('68_final_ext'); o.city68 = at('f3', 'city');
  // 08: Ava runs in from the street, up the steps, grabs the left glass leaf's handle at tc (push frame), pushes it open
  // and walks through the opening (path08 / leaf08 below; everything in lt from the shot start)
  { const D = o.e08 - o.s08, tc = Math.min(2.13, D - 1.06);
    o.r08 = { D, tc, steps: tc - 1.18, top: tc - 0.28 };
    o.cut08 = o.s08 + o.r08.steps - 0.12;   // RE cut: low sidewalk angle -> high angle from the portico as she hits the steps
    o.ph08 = phase08(o.r08); }
  // 28: rings every 0.42 s from "fire"; three zombies in the street
  o.rings28 = [0, 1, 2, 3, 4, 5].map((i) => o.fire + i * 0.42);
  // 64: broadcast pulses every 0.85 s from the shot start + 0.3
  o.rings64 = []; for (let t = o.s64 + 0.3; t < o.e64; t += 0.85) o.rings64.push(t);
  // 68: zombies bang the glass
  o.bangs68 = []; for (let t = o.s68 + 0.4; t < o.e68 - 0.2; t += 0.62) o.bangs68.push(t);
  return o;
}

export function sfx(ctx) {
  const x = X(ctx), ev = [];
  const r3 = (t) => Math.round(t * 1000) / 1000, push = (t, n) => ev.push([r3(t), n]);
  // 01
  push(x.s01 + 0.25, 'zombie_moan'); push(x.city01, 'thunder_crack'); push(x.s01 + 2.1, 'zombie_moan');
  // 07
  for (const d of [0.35, 1.2, 2.05, 3.1, 4.05]) if (x.s07 + d < x.e07) push(x.s07 + d, 'car_tick');   // only inside the shot
  push(x.gasPre, 'gauge_needle'); push(x.gas, 'label'); push(x.gas + 0.05, 'fuel_warning_ding'); push(x.two07 - 0.15, 'cloth_point');
  // 08: run footsteps (2 per 0.5 s clip cycle / speed), stone on the steps, door push
  { const r = x.r08; for (const [lt, k] of x.ph08.steps) push(x.s08 + lt, lt < r.tc - 0.1 ? 'step_run' : 'step_walk'); push(x.s08 + r.tc, 'door_glass_push'); }
  // 28
  push(x.fire, 'gunshot_distant'); for (const t of x.rings28) push(t, 'sound_ring');
  push(x.fire + 0.5, 'zombie_growl'); push(x.fire + 0.9, 'zombie_growl'); push(x.bell, 'label'); push(x.bell, 'dinner_bell_ding'); push(x.block - 0.2, 'zombie_moan');
  // 64
  for (const t of x.rings64) push(t, 'radio_pulse'); push(x.s64 + 0.2, 'horde_moan_far'); push(x.calling, 'horde_moan_far');
  // 68
  push(x.s68 + 0.1, 'horde_moan'); push(x.city68, 'thunder_crack'); for (const t of x.bangs68) push(t, 'glass_bang');
  return ev.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L } = ctx;
  const { THREE, LW, LH } = L;
  const x = X(ctx);
  const V = (a, b, c) => new THREE.Vector3(a, b, c);
  const px = (c, a, b, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(a, b, w, h); };
  const rgb = (r, g, b) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const out = {};

  const NIGHT = 0x1c2638;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(NIGHT); scene.fog = new THREE.Fog(NIGHT, 18, 60);
  const hemi = new THREE.HemisphereLight(0x8ea4c8, 0x2c2a30, 1.7); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xa8bce0, 0.9); moon.position.set(4, 8, 6); scene.add(moon);

  // ---------------- textures (PS1, nearest, painted in code) ----------------
  const skyT = L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(301);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const k = y / h, n = r() * 6 - 3; px(c, xx, y, rgb(14 + 46 * k * k + n, 20 + 46 * k * k + n, 36 + 46 * k * k + n)); }
    for (let k = 0; k < 18; k++) { const cx = r() * w, cy = r() * h * 0.7, rx = 3 + r() * 7; for (let xx = -rx; xx < rx; xx++) px(c, (cx + xx + w) % w | 0, cy | 0, 'rgba(70,82,104,0.45)', 1, 1 + (r() * 2 | 0)); }
  });
  const brickT = L.cvs(64, 64, (c, w, h) => {
    const r = L.rng(302); px(c, 0, 0, '#3e3a38', w, h);
    for (let row = 0; row < 16; row++) for (let b = -1; b < 8; b++) { const xx = b * 8 + (row % 2 ? 4 : 0), n = r() * 26 - 13; px(c, xx + 1, row * 4 + 1, rgb(122 + n, 64 + n * 0.6, 50 + n * 0.5), 7, 3); }
    for (let k = 0; k < 8; k++) { const xx = r() * w | 0; for (let y = 0; y < h; y++) if (r() < 0.8) px(c, xx, y, 'rgba(20,20,28,0.25)'); }
  });
  const stoneT = L.cvs(32, 32, (c, w, h) => {
    const r = L.rng(303);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 16 - 8; px(c, xx, y, rgb(170 + n, 164 + n, 150 + n)); }
    for (let y = 0; y < h; y += 8) px(c, 0, y, '#7e786c', w, 1);
    for (let y = 0; y < h; y += 8) px(c, (y / 8) % 2 ? 4 : 20, y, '#7e786c', 1, 8);
    for (let k = 0; k < 6; k++) { const xx = r() * w | 0; for (let y = r() * 8 | 0; y < h; y++) if (r() < 0.6) px(c, xx, y, 'rgba(60,58,64,0.3)'); }
  });
  const colT = L.cvs(16, 64, (c, w, h) => {
    const r = L.rng(304);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 10 - 5 + (xx % 4 === 0 ? -34 : xx % 4 === 2 ? 12 : 0); px(c, xx, y, rgb(184 + n, 178 + n, 164 + n)); }
  });
  const stepT = L.cvs(32, 8, (c, w, h) => { const r = L.rng(305); for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 14 - 7 + (y < 2 ? 34 : 0); px(c, xx, y, rgb(150 + n, 146 + n, 136 + n)); } });
  const asphaltT = L.cvs(64, 64, (c, w, h) => {
    const r = L.rng(306);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 16 - 8; px(c, xx, y, rgb(46 + n, 50 + n, 58 + n)); }
    for (let k = 0; k < 6; k++) {   // puddles = lighter, bluer patches (static, no flicker)
      const cx = r() * w, cy = r() * h, rx = 5 + r() * 9, ry = 2 + r() * 4;
      for (let y = -ry; y <= ry; y++) for (let xx = -rx; xx <= rx; xx++) { const e = (xx * xx) / (rx * rx) + (y * y) / (ry * ry); if (e < 1) px(c, (cx + xx + w) % w | 0, (cy + y + h) % h | 0, e < 0.45 ? '#74849c' : '#5a6678'); }
    }
    c.strokeStyle = '#30323a'; c.lineWidth = 1;
    for (let k = 0; k < 5; k++) { c.beginPath(); let xx = r() * w, y = r() * h; c.moveTo(xx, y); for (let s = 0; s < 4; s++) { xx += r() * 10 - 5; y += r() * 10 - 5; c.lineTo(xx, y); } c.stroke(); }
  });
  const walkT = L.cvs(32, 32, (c, w, h) => { const r = L.rng(307); for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 14 - 7; px(c, xx, y, rgb(104 + n, 106 + n, 112 + n)); } px(c, 0, 0, '#5a5c64', w, 1); px(c, 0, 0, '#5a5c64', 1, h); px(c, 0, 16, '#5a5c64', w, 1); px(c, 16, 0, '#5a5c64', 1, h); });
  // glass doors: dim (green emergency EXIT glow) / lit (warm lobby lights on)
  const glassT = (lit) => L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(308);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const n = r() * 6 - 3, g = Math.max(0, 1 - Math.hypot(xx - 16, y - 6) / 22);
      px(c, xx, y, lit ? rgb(196 + n + 30 * g, 170 + n + 20 * g, 112 + n) : rgb(18 + n + 30 * g, 34 + n + 70 * g, 40 + n + 40 * g));
    }
    for (let y = 46; y < h; y++) for (let xx = 0; xx < w; xx++) if (((xx >> 2) + (y >> 2)) % 2) px(c, xx, y, lit ? 'rgba(90,70,40,0.25)' : 'rgba(90,130,120,0.18)');
    px(c, 2, 26, lit ? 'rgba(80,50,26,0.75)' : 'rgba(10,16,20,0.6)', 28, 12);   // reception desk
    px(c, 11, 2, '#2a6a3a', 10, 5); px(c, 12, 3, '#9af0a8', 8, 3);                // EXIT sign
  });
  const winT = (lit, seed) => L.cvs(16, 24, (c, w, h) => {
    const r = L.rng(seed);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 8 - 4; px(c, xx, y, lit ? rgb(232 + n, 196 + n - y, 116 + n - y * 1.5) : rgb(22 + n, 30 + n + y * 0.6, 44 + n + y)); }
    if (lit) { px(c, 2, 14, 'rgba(90,60,30,0.6)', 5, 10); px(c, 10, 12, 'rgba(90,60,30,0.5)', 4, 12); }   // furniture silhouettes
    px(c, 0, 0, '#2a2a2c', w, 1); px(c, 0, h - 1, '#2a2a2c', w, 1); px(c, 0, 0, '#2a2a2c', 1, h); px(c, w - 1, 0, '#2a2a2c', 1, h);
    px(c, 7, 0, '#2a2a2c', 2, h); px(c, 0, 11, '#2a2a2c', w, 2);
    if (!lit) for (let y = 0; y < h; y++) { const xx = 12 - y * 0.5; if (xx > 0) px(c, xx | 0, y, 'rgba(110,130,160,0.35)'); }
  });
  const signT = L.cvs(128, 16, (c, w, h) => {
    px(c, 0, 0, '#3a3834', w, h); px(c, 0, 0, '#5a5650', w, 1); px(c, 0, h - 1, '#24221e', w, 1);
    c.font = 'bold 13px "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#141210'; c.fillText('CITY  POLICE', 65, 9.5); c.fillStyle = '#e8dcb8'; c.fillText('CITY  POLICE', 64, 8.5);
  });
  // dark city facades: 4 bays x 4 floors per tile, windows dark with a static sky glint
  const bldT = (seed, wall) => L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(seed), A = hexRGB(wall);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 12 - 6; px(c, xx, y, rgb(A[0] + n, A[1] + n, A[2] + n)); }
    for (let f = 0; f < 4; f++) for (let b = 0; b < 4; b++) {
      const wx = b * 8 + 2, wy = f * 16 + 4;
      px(c, wx, wy, r() < 0.15 ? '#0a0c12' : '#1a2232', 4, 8); px(c, wx, wy, 'rgba(120,140,170,0.35)', 1, 8);
      px(c, wx - 1, wy + 8, 'rgba(0,0,0,0.35)', 6, 1);
    }
    for (let k = 0; k < 5; k++) { const xx = r() * w | 0; for (let y = 0; y < h; y++) if (r() < 0.7) px(c, xx, y, 'rgba(10,10,16,0.18)'); }
  });
  const BLD = [bldT(501, '#5a5048'), bldT(502, '#4a4e56'), bldT(503, '#6a5a4a'), bldT(504, '#3e4248')];

  // ---------------- sky ----------------
  L.plane(420, 160, L.basic(skyT, 0xffffff, { fog: false }), 0, 50, -140, scene);

  // ---------------- the station ----------------
  const FZ = -9;
  const brick = L.lam(L.rep(brickT, 3, 3)), stone = L.lam(L.rep(stoneT, 6, 3)), stoneS = L.lam(L.rep(stoneT, 2, 2));
  const wins = [];   // {dark, lit, tier}: lit when tier <= light level (0 dim, 1 lights on, 2 every light)
  const addWin = (w, h, xx, y, z, ry, tier, seed) => {
    const d = L.plane(w, h, L.basic(winT(false, seed)), xx, y, z, scene, ry);
    const l = L.plane(w, h, L.basic(winT(true, seed + 1000), 0xffffff, { fog: false }), xx, y, z, scene, ry);
    wins.push({ d, l, tier });
  };
  for (const s of [-1, 1]) {   // brick wings
    L.box(5.2, 8.2, 1, brick, s * 5.9, 4.1, FZ - 0.5, scene);
    L.box(5.4, 0.9, 1.1, stoneS, s * 5.9, 0.45, FZ - 0.45, scene);
    L.box(5.5, 0.35, 1.2, stoneS, s * 5.9, 8.3, FZ - 0.45, scene);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const wx = s * (4.2 + i * 1.5), y = 2.6 + j * 3.0;
      const tier = (i === 1 && j === 1 && s > 0) ? 0 : ((i + j + (s > 0 ? 1 : 0)) % 2 === 0 ? 1 : 2);
      addWin(0.8, 1.4, wx, y, FZ + 0.02, 0, tier, 320 + i * 7 + j * 3 + (s > 0 ? 50 : 0));
      L.box(1.0, 0.16, 0.12, stoneS, wx, y + 0.8, FZ + 0.06, scene);
      L.box(0.96, 0.1, 0.16, stoneS, wx, y - 0.74, FZ + 0.08, scene);
    }
  }
  // body of the building (for the high city view) + side windows
  const BZ0 = FZ - 1, BZ1 = -26;
  L.box(17.6, 8.1, BZ0 - BZ1, brick, 0, 4.05, (BZ0 + BZ1) / 2, scene);
  L.box(17.9, 0.3, BZ0 - BZ1 + 0.3, stoneS, 0, 8.25, (BZ0 + BZ1) / 2, scene);
  L.box(17.0, 0.05, BZ0 - BZ1 - 0.6, L.lam(null, 0x2a2c32), 0, 8.42, (BZ0 + BZ1) / 2, scene);   // tar roof
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++)
    addWin(0.8, 1.4, s * 8.82, 2.6 + j * 3, BZ0 - 1.8 - i * 3.1, s * Math.PI / 2, (i + j) % 3 === 0 ? 1 : 2, 600 + i * 5 + j + (s > 0 ? 40 : 0));
  // central stone block + portico
  // central stone block, built around the doorway (x +-1.64, y 1.0..4.22) so the opened leaf shows a real vestibule
  { const sb = (w, h, xx, y) => L.box(w, h, 1, L.lam(L.rep(stoneT, 6 * w / 6.6, 3 * h / 8.6)), xx, y, FZ - 0.5, scene);
    sb(1.66, 8.6, -2.47, 4.3); sb(1.66, 8.6, 2.47, 4.3); sb(3.28, 4.38, 0, 6.41); sb(3.28, 1.0, 0, 0.5); }
  for (let i = 0; i < 2; i++) addWin(0.8, 1.2, -1.4 + i * 2.8, 7.4, FZ + 0.02, 0, 2, 380 + i);
  L.box(7.4, 1.0, 1.2, stoneS, 0, 0.5, -8.6, scene);   // landing (top y=1.0, z -9.2..-8.0)
  const stepM = L.lam(L.rep(stepT, 6, 1));
  for (let i = 0; i < 5; i++) L.box(7.0, 0.2 * (i + 1), 0.42, stepM, 0, 0.1 * (i + 1), -5.9 - i * 0.42 - 0.21, scene);
  const colM = L.lam(L.rep(colT, 2, 1));
  for (const cx of [-2.75, -1.55, 1.55, 2.75]) {
    L.mesh(new THREE.CylinderGeometry(0.24, 0.27, 4.2, 8), colM, cx, 3.1, -7.95, scene);
    L.box(0.66, 0.2, 0.66, stoneS, cx, 1.1, -7.95, scene); L.box(0.7, 0.24, 0.7, stoneS, cx, 5.3, -7.95, scene);
  }
  L.box(7.2, 1.1, 1.6, stone, 0, 5.95, -8.25, scene);
  L.plane(5.4, 0.68, L.basic(signT, 0xd8d4c8), 0, 5.95, -7.44, scene);
  L.box(7.6, 0.18, 1.8, stoneS, 0, 6.58, -8.25, scene);
  { const sh = new THREE.Shape(); sh.moveTo(-3.7, 0); sh.lineTo(3.7, 0); sh.lineTo(0, 1.35); sh.lineTo(-3.7, 0);
    L.mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.4, bevelEnabled: false }), L.lam(L.rep(stoneT, 0.25, 0.4)), 0, 6.67, -8.95, scene);
    L.mesh(new THREE.CircleGeometry(0.34, 10), L.lam(null, 0x8a7a50), 0, 7.15, -7.53, scene);
    L.mesh(new THREE.CircleGeometry(0.24, 5), L.lam(null, 0x4a4030), 0, 7.15, -7.52, scene); }
  L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 5), L.lam(null, 0x9a9aa0), 3.75, 8.5, -8.2, scene);
  // radio antenna on the roof: lattice mast, crossbars, red beacon (blinks, deterministic)
  const ANT = V(4.5, 8.4, -18), ANT_H = 12;
  { const mA = L.lam(null, 0x8a8e94);
    for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [0, 0.4]]) { const m = L.mesh(new THREE.CylinderGeometry(0.04, 0.06, ANT_H, 4), mA, ANT.x + dx * 0.6, ANT.y + ANT_H / 2, ANT.z + dz * 0.6, scene); m.rotation.set(dz * 0.03, 0, -dx * 0.03); }
    for (let k = 1; k < 12; k++) { const r = 0.32 * (1 - k / 14); L.mesh(new THREE.TorusGeometry(r, 0.025, 3, 3), mA, ANT.x, ANT.y + k, ANT.z, scene).rotation.x = Math.PI / 2; }
    for (const [h, w] of [[4, 1.6], [7.5, 1.1]]) { L.box(w, 0.06, 0.06, mA, ANT.x, ANT.y + h, ANT.z, scene); L.box(0.12, 0.5, 0.08, L.lam(null, 0xd8d8d0), ANT.x - w / 2, ANT.y + h - 0.2, ANT.z, scene); L.box(0.12, 0.5, 0.08, L.lam(null, 0xd8d8d0), ANT.x + w / 2, ANT.y + h - 0.2, ANT.z, scene); } }
  const beacon = L.mesh(new THREE.SphereGeometry(0.16, 6, 4), L.basic(null, 0xff3020, { fog: false }), ANT.x, ANT.y + ANT_H + 0.1, ANT.z, scene);
  const haloT = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,220,150,0.9)'); g.addColorStop(0.3, 'rgba(255,190,110,0.35)'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  haloT.minFilter = haloT.magFilter = THREE.LinearFilter;
  const beaconHalo = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: haloT, color: 0xff4030, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  beaconHalo.position.copy(beacon.position); scene.add(beaconHalo);

  // ---- front doors: two glass leaves (left one opens inward for 08) + side lights + transom ----
  const gDim = L.basic(glassT(false)), gLit = L.basic(glassT(true), 0xffffff, { fog: false }), frame = L.lam(null, 0x6a6e74);
  const DZ = FZ + 0.02, DY = 1.0, glassMeshes = [];
  const doorGrp = new THREE.Group(); scene.add(doorGrp);   // shakes when the horde bangs it (68)
  const leafL = new THREE.Group(); leafL.position.set(-1.01, 0, DZ); doorGrp.add(leafL);
  glassMeshes.push(L.plane(0.98, 2.5, gDim, 0.49, DY + 1.25, 0, leafL));
  { const chrome = L.lam(null, 0xb0b4b8), stile = L.lam(null, 0x5a5e64);   // the leaf's own aluminium stiles/rails + a pull bar on BOTH faces
    L.box(0.05, 2.5, 0.05, stile, 0.03, DY + 1.25, 0, leafL); L.box(0.05, 2.5, 0.05, stile, 0.955, DY + 1.25, 0, leafL);
    L.box(0.98, 0.16, 0.05, stile, 0.49, DY + 0.08, 0, leafL); L.box(0.98, 0.05, 0.05, stile, 0.49, DY + 2.48, 0, leafL);
    for (const sz of [1, -1]) { L.box(0.04, 0.42, 0.04, chrome, 0.87, DY + 1.2, sz * 0.075, leafL); for (const dy of [-0.17, 0.17]) L.box(0.03, 0.03, 0.06, chrome, 0.87, DY + 1.2 + dy, sz * 0.04, leafL); } }
  glassMeshes.push(L.plane(0.98, 2.5, gDim, 0.52, DY + 1.25, DZ, doorGrp)); L.box(0.06, 0.4, 0.06, L.lam(null, 0xb0b4b8), 0.14, DY + 1.2, DZ + 0.06, doorGrp);
  for (const gx of [-1.32, 1.32]) glassMeshes.push(L.plane(0.52, 2.5, gDim, gx, DY + 1.25, DZ, doorGrp));
  glassMeshes.push(L.plane(3.1, 0.6, gDim, 0, DY + 2.85, DZ, doorGrp));
  for (const fx of [-1.6, -1.04, 0, 1.04, 1.6]) L.box(0.08, 3.2, 0.1, frame, fx, DY + 1.6, DZ + 0.04, doorGrp);
  for (const y of [0.04, 2.52, 3.18]) L.box(3.28, 0.08, 0.1, frame, 0, DY + y, DZ + 0.04, doorGrp);
  // vestibule behind the doors (z -8.98..-9.97, lit warm): lino floor, side walls, ceiling, lobby back wall with the reception desk
  { const vT = L.cvs(64, 64, (c, w, h) => { const r = L.rng(311);
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = r() * 8 - 4; px(c, xx, y, y < 40 ? rgb(196 + n, 176 + n, 136 + n) : rgb(120 + n, 92 + n, 60 + n)); }
      px(c, 0, 40, '#5a4028', w, 2); px(c, 6, 30, '#6a4a2c', 40, 18); px(c, 6, 30, '#9a7448', 40, 2); px(c, 10, 22, '#2a2a2e', 8, 6); px(c, 11, 23, '#7ad0e8', 6, 4);   // desk + monitor
      px(c, 50, 8, '#d8d0b8', 10, 14); for (let k = 0; k < 4; k++) px(c, 51, 10 + k * 3, '#6a6458', 7, 1);   // notice
      px(c, 26, 4, '#2a6a3a', 12, 5); px(c, 27, 5, '#9af0a8', 10, 3); });
    const vM = L.lam(null, 0xb8a888), vZ0 = DZ - 0.02, vZ1 = -9.99;
    L.plane(3.28, 3.22, L.lam(vT), 0, DY + 1.61, vZ1, scene);
    L.plane(3.28, vZ0 - vZ1, L.lam(L.rep(walkT, 3, 1), 0xd8c8a8), 0, DY + 0.004, (vZ0 + vZ1) / 2, scene, 0, -Math.PI / 2);
    L.plane(3.28, vZ0 - vZ1, L.lam(null, 0x8a8070), 0, DY + 3.2, (vZ0 + vZ1) / 2, scene, 0, Math.PI / 2);
    for (const sx of [-1, 1]) L.plane(vZ0 - vZ1, 3.22, vM, sx * 1.64, DY + 1.61, (vZ0 + vZ1) / 2, scene, -sx * Math.PI / 2);
    const vl = new THREE.PointLight(0xffc880, 5, 4, 1.2); vl.position.set(0, DY + 2.9, -9.5); scene.add(vl); }
  const doorLight = new THREE.PointLight(0x6ad890, 6, 7, 1.4); doorLight.position.set(0, 2.0, -8.2); scene.add(doorLight);

  // ---------------- streets ----------------
  L.plane(260, 260, L.lam(L.rep(asphaltT, 80, 80)), 0, 0, 30, scene, 0, -Math.PI / 2);
  const walkM = L.lam(L.rep(walkT, 2, 2)), curbM = L.lam(null, 0x8a8a88), lineM = L.lam(null, 0xb8a050);
  // blocks = raised sidewalk plinths [x0, x1, z0, z1]; buildings inside
  const BLOCKS = [[-34, 34, -46, -4.4], [46, 74, -46, -4.4], [-74, -46, -46, -4.4],
    [6, 34, 7.6, 34], [-34, -6, 7.6, 34], [46, 74, 7.6, 34], [-74, -46, 7.6, 34],
    [6, 34, 46, 72], [-34, -6, 46, 72], [46, 74, 46, 72], [-74, -46, 46, 72], [6, 34, 84, 110], [-34, -6, 84, 110]];
  for (const [x0, x1, z0, z1] of BLOCKS) {
    const w = x1 - x0, d = z1 - z0; const b = L.box(w, 0.14, d, L.lam(L.rep(walkT, w / 2, d / 2)), (x0 + x1) / 2, 0.07, (z0 + z1) / 2, scene); void b;
    L.box(w + 0.1, 0.15, 0.12, curbM, (x0 + x1) / 2, 0.075, z1, scene); L.box(w + 0.1, 0.15, 0.12, curbM, (x0 + x1) / 2, 0.075, z0, scene);
  }
  void walkM;
  for (let lx = -70; lx < 70; lx += 2.2) L.plane(1.1, 0.1, lineM, lx, 0.012, 1.6, scene, 0, -Math.PI / 2);   // front street centre line
  for (let lz = 10; lz < 110; lz += 2.2) L.plane(0.1, 1.1, lineM, 0, 0.012, lz, scene, 0, -Math.PI / 2);   // avenue centre line
  for (let cx = -3; cx <= 3; cx += 0.8) L.plane(0.42, 2.2, L.lam(null, 0x9a9c9e), cx, 0.011, -3.0, scene, 0, -Math.PI / 2);
  // city buildings (dark: the power is out; the station is the only lit building)
  const bR = L.rng(777);
  const building = (cx, cz, w, d, h, k) => {
    const t = BLD[k % BLD.length], m = L.lam(L.rep(t, Math.max(1, Math.round(w / 8)), h / 14)), md = L.lam(L.rep(t, Math.max(1, Math.round(d / 8)), h / 14)), roof = L.lam(null, 0x22252c);
    L.box(w, h, d, [md, md, roof, roof, m, m], cx, h / 2 + 0.14, cz, scene);
    L.box(w + 0.3, 0.4, d + 0.3, L.lam(null, 0x3a3c40), cx, h + 0.34, cz, scene);
    if (bR() < 0.5) L.box(1.6, 1.2, 1.6, L.lam(null, 0x30333a), cx + (bR() - 0.5) * w * 0.5, h + 0.9, cz + (bR() - 0.5) * d * 0.5, scene);   // roof hut / water tank
  };
  for (const [x0, x1, z0, z1] of BLOCKS) {
    if (x0 === -34 && z1 === -4.4) {   // station block: the station in the middle, two buildings each side, one behind
      for (const s of [-1, 1]) { building(s * 14.5, -14, 7.4, 16, 11 + bR() * 5, 1 + (s > 0)); building(s * 25.5, -16, 12, 20, 15 + bR() * 7, 2 + (s > 0)); }
      building(0, -38, 30, 12, 18, 3); continue;
    }
    const n = 3, w = (x1 - x0 - 2) / n;
    for (let i = 0; i < n; i++) {
      const fr = bR() < 0.5;
      building(x0 + 1 + w * (i + 0.5), (z0 + z1) / 2 + (fr ? -3 : 3), w - 0.6, (z1 - z0) - 8, 7 + bR() * 9, (i + (x0 > 0 ? 1 : 0)) | 0);
    }
  }
  // street lamps: the two in front of the station are lit (sodium) — the rest of the city is dark
  const reflT = L.cvs(16, 64, (c, w, h) => {
    const r = L.rng(310);
    for (let y = 0; y < h; y++) { const k = Math.pow(1 - y / h, 1.3); for (let xx = 0; xx < w; xx++) { const e = 1 - Math.abs(xx - 7.5) / 8, a = (0.35 + 0.65 * k) * e * (r() < 0.25 ? 0.3 : 1); c.fillStyle = `rgba(255,${190 + r() * 40 | 0},120,${Math.min(1, a * 1.2)})`; c.fillRect(xx, y, 1, 1); } }
  });
  const lampM = L.lam(null, 0x2a3230), haloM = new THREE.MeshBasicMaterial({ map: haloT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const reflM = new THREE.MeshBasicMaterial({ map: reflT, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
  const lampPost = (lx, lz, s, lit) => {
    L.mesh(new THREE.CylinderGeometry(0.07, 0.1, 4.6, 6), lampM, lx, 2.3, lz, scene);
    L.box(0.9, 0.08, 0.08, lampM, lx + s * 0.42, 4.55, lz, scene); L.box(0.42, 0.18, 0.26, lampM, lx + s * 0.85, 4.5, lz, scene);
    L.box(0.3, 0.05, 0.18, L.basic(null, lit ? 0xffe0a0 : 0x3a3c40), lx + s * 0.85, 4.39, lz, scene);
    if (!lit) return;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), haloM); halo.position.set(lx + s * 0.85, 4.35, lz + 0.2); scene.add(halo);
    const pl = new THREE.PointLight(0xffb870, 22, 11, 1.3); pl.position.set(lx + s * 0.85, 4.2, lz); scene.add(pl);
    const rf = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 8), reflM); rf.rotation.x = -Math.PI / 2; rf.position.set(lx + s, 0.03, lz + 5.1); scene.add(rf);
  };
  lampPost(-3.25, -5.0, 1, true); lampPost(3.25, -5.0, -1, true);
  for (let lz = 12; lz < 105; lz += 14) { lampPost(-6.6, lz, 1, false); lampPost(6.6, lz + 7, -1, false); }
  const reflG = new THREE.MeshBasicMaterial({ map: reflT, color: 0x40ff90, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
  const doorRefl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 6), reflG); doorRefl.rotation.x = -Math.PI / 2; doorRefl.position.set(0, 0.02, -0.5); scene.add(doorRefl);

  // ---------------- cars: Kenney "Car Kit" 3.1 police.glb (CC0, models/police-kenney.LICENSE.txt) ----------------
  const carG = await L.loadModel('models/police-kenney.glb');
  const pal = await L.img('models/Textures/colormap.png');
  const paint = (cells) => { const t = L.cvs(64, 32, (c) => { c.imageSmoothingEnabled = true; c.drawImage(pal, 0, 0, 64, 32); for (const [cx, cy, col] of cells) px(c, cx * 8, cy * 8, col, 8, 8); }); t.flipY = false; t.needsUpdate = true; return t; };
  const palPolice = paint([[0, 3, '#1c2a36'], [2, 3, '#1a2440'], [3, 3, '#4a1414'], [3, 2, '#1a1b1f'], [2, 2, '#101012']]);
  const palCivil = paint([[0, 3, '#22323e'], [3, 2, '#4a1a16'], [6, 2, '#7a2a22'], [2, 2, '#101012'], [1, 3, '#e8e0b0']]);   // maroon sedan
  const palTrim = paint([[3, 2, '#141416'], [2, 2, '#101012']]);
  function carBody(civil) {
    const body = L.ps1Clone(carG.scene);
    body.traverse((o) => {
      if (!o.isMesh) return;
      const isBody = o.name === 'body' || o.parent?.name === 'body';
      if (civil && isBody) {   // civilian: drop the light bar (every triangle above the roof, y > 1.005 in model units)
        const g = o.geometry.clone(), p = g.attributes.position, idx = g.index.array, keep = [];
        for (let i = 0; i < idx.length; i += 3) { let my = -9; for (let k = 0; k < 3; k++) my = Math.max(my, p.getY(idx[i + k])); if (my <= 1.005) keep.push(idx[i], idx[i + 1], idx[i + 2]); }
        g.setIndex(keep); o.geometry = g;
      }
      for (const m of [].concat(o.material)) { m.map = civil ? (isBody ? palCivil : palTrim) : palPolice; m.needsUpdate = true; }
    });
    const grp = new THREE.Group(); grp.add(body);
    const bb = new THREE.Box3().setFromObject(body);
    const SX = 1.85 / (bb.max.x - bb.min.x), SY = (civil ? 1.4 : 1.45) / (bb.max.y - bb.min.y), SZ = 4.8 / (bb.max.z - bb.min.z);
    body.scale.set(SX, SY, SZ); body.position.set(-(bb.max.x + bb.min.x) / 2 * SX, -bb.min.y * SY, -(bb.max.z + bb.min.z) / 2 * SZ);
    return grp;
  }
  // abandoned patrol car (black & white, light bar off, driver door open)
  const car = carBody(false); car.position.set(-1.6, 0, -1.9); car.rotation.y = -0.75; scene.add(car);
  { const W = 1.85 / 2, wht = L.lam(null, 0xd8dade), blk = L.lam(null, 0x141518), gls = L.basic(null, 0x1c2a36);
    L.plane(1.0, 0.82, L.basic(null, 0x0a0c10), W + 0.015, 0.84, 0.62, car, Math.PI / 2);
    const doorT = L.cvs(64, 16, (c, w, h) => { px(c, 0, 0, '#dcdee2', w, h); c.font = 'bold 13px Arial, sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillStyle = '#121418'; c.fillText('POLICE', 32, 8.5, 60); });
    L.plane(1.05, 0.26, L.lam(doorT), W + 0.016, 0.62, -0.75, car, Math.PI / 2);
    const hinge = new THREE.Group(); hinge.position.set(W, 0, 1.15); hinge.rotation.y = -0.8; car.add(hinge);
    L.box(0.07, 0.48, 1.0, wht, 0.03, 0.62, -0.5, hinge); L.box(0.05, 0.36, 0.9, gls, 0.03, 1.05, -0.48, hinge); L.box(0.08, 0.04, 1.0, blk, 0.03, 1.24, -0.5, hinge);
    const dome = new THREE.PointLight(0xffe6b0, 1.6, 2.5, 1.5); dome.position.set(0.2, 1.1, 0); car.add(dome); }
  // Ava's own car: out of gas two blocks down the avenue, nose into the right curb, hood up a crack (no steam: it is out of fuel, not overheating)
  const myCar = carBody(true); myCar.position.set(3.7, 0, 60); myCar.rotation.y = Math.PI - 0.42; scene.add(myCar);
  const tailM = L.basic(null, 0xff2a1a);   // hazard tail lights (blink with the dash warning)
  const tails = [-0.62, 0.62].map((tx) => L.box(0.28, 0.12, 0.04, tailM, tx, 0.72, -2.42, myCar));
  const steamT = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(220,226,234,0.9)'); g.addColorStop(0.6, 'rgba(200,206,216,0.45)'); g.addColorStop(1, 'rgba(200,206,216,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const steam = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: steamT, transparent: true, depthWrite: false, opacity: 0.5 })); scene.add(m); steam.push(m); }
  const HOOD = myCar.localToWorld(V(0, 1.05, 1.5));

  // ---------------- zombies (ep2 outside.js Hzombie, with walk / idle / attack + head turn) ----------------
  const src = { city: [await L.loadModel('models/city-zombie.glb'), ['Walking', 'Zombie_Idle', 'Zombie_Attack']], thin: [await L.loadModel('models/thin-zombie.glb'), ['walk', 'idle', 'attack1_l']] };
  const thinTex = await L.loadTex('tex/thin_zombie.png', 256); thinTex.flipY = false; thinTex.needsUpdate = true;
  const zTex = L.cvs(32, 64, (c) => {
    const r = L.rng(31);
    for (let y = 0; y < 32; y++) for (let xx = 0; xx < 32; xx++) { const sx = xx % 8 < 2, sy = y % 8 < 2, th = xx % 8 === 5 || y % 8 === 5; const col = sx && sy ? [60, 10, 10] : sx || sy ? [110, 18, 16] : th ? [210, 110, 90] : [176, 38, 30]; const n = r() * 16 - 8; px(c, xx, y, rgb(col[0] + n, col[1] + n / 2, col[2] + n / 2)); }
    for (let y = 32; y < 64; y++) for (let xx = 0; xx < 32; xx++) { const n = r() * 18 - 9 + (xx % 16 === 0 ? -18 : 0); px(c, xx, y, rgb(58 + n, 84 + n, 138 + n)); }
    for (let k = 0; k < 7; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), '#5a0a08', 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 3));
  });
  zTex.wrapS = THREE.RepeatWrapping; zTex.wrapT = THREE.ClampToEdgeWrapping;
  const skinT = L.cvs(32, 32, (c) => { const r = L.rng(33); for (let y = 0; y < 32; y++) for (let xx = 0; xx < 32; xx++) { const n = r() * 20 - 10; px(c, xx, y, rgb(138 + n, 150 + n, 152 + n)); } for (let k = 0; k < 14; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), r() < 0.5 ? '#6a7064' : '#7a1210', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3)); });
  src.city[0].scene.traverse((o) => {
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) { const a = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (a * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (a + z) * 4; uv[i * 2 + 1] = y * 4; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  const YAX = V(0, 1, 0);
  function Hzombie(kind, h, tint) {
    const [g, clips] = src[kind];
    const root = L.ps1Clone(g.scene);
    if (kind === 'city') root.traverse((o) => { if (!o.isMesh) return; const n = o.material.name || ''; o.material = n.includes('Outfit') ? L.lam(zTex) : n.includes('Body') ? L.lam(skinT) : L.lam(null, 0x8a2a20); o.material.side = THREE.DoubleSide; });
    root.traverse((o) => { if (!o.isMesh) return; for (const m of [].concat(o.material)) { if (kind === 'thin') m.map = thinTex; m.color.multiply(new THREE.Color(tint)); m.needsUpdate = true; } });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root);
    const acts = clips.map((n) => { const c = THREE.AnimationClip.findByName(g.animations, n); const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); return a; });
    let hip = null, head = null; root.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; if (o.isBone && !head && /head$/i.test(o.name)) head = o; });
    const hip0 = hip.position.clone();
    scene.add(wrap); wrap.visible = false;
    const mats = []; root.traverse((o) => { if (o.isMesh) mats.push(...[].concat(o.material)); });
    return { wrap, acts, glow(k) { for (const m of mats) if (m.emissive) m.emissive.setScalar(k); }, set(t, which = 0, headYaw = 0) {
      acts.forEach((a, i) => a.setEffectiveWeight(i === which ? 1 : 0));
      const d = acts[which].getClip().duration; acts[which].time = ((t % d) + d) % d; mixer.update(0);
      hip.position.x = hip0.x; hip.position.z = hip0.z;
      if (head && headYaw) { wrap.updateMatrixWorld(true); const qw = head.getWorldQuaternion(new THREE.Quaternion()), pw = head.parent.getWorldQuaternion(new THREE.Quaternion());
        head.quaternion.copy(pw.invert().multiply(new THREE.Quaternion().setFromAxisAngle(YAX, headYaw).multiply(qw))); }
    } };
  }
  const POOL = []; { const tints = [0xffffff, 0xe8ecf0, 0xa8c0e0, 0xd0c8c0, 0xc0d0c8]; for (let i = 0; i < 40; i++) POOL.push(Hzombie(i % 3 === 1 ? 'thin' : 'city', 1.74 + (i * 37 % 13) / 100, tints[i % 5])); }
  const yAt = (z, xx = 0) => {   // ground height: road 0, sidewalk 0.14, steps, landing 1.0
    if (Math.abs(xx) < 3.5 && z < -5.9) return z < -8.0 ? 1.0 : Math.min(1.0, 0.2 * Math.ceil((-5.9 - z) / 0.42));
    if (z < -4.4 && z > -46) return 0.14;
    return 0;
  };
  const hideAll = () => { for (const z of POOL) { z.wrap.visible = false; z.glow(0); } };
  // place zombie i: position, heading (rad, 0 = +z), anim time, clip, head yaw
  const putZ = (i, px_, pz, yaw, t, which = 0, headYaw = 0) => { const z = POOL[i]; z.wrap.visible = true; z.wrap.position.set(px_, yAt(pz, px_), pz); z.wrap.rotation.y = yaw; z.set(t, which, headYaw); };

  // ---------------- Ava (07, 08) ----------------
  const ch = L.hero(); scene.add(ch.root); ch.root.visible = false;
  const mouthAt = (t, base) => { const c = ctx.TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };

  // ---------------- sound rings (28: vertical, from the doors; 64: horizontal, from the antenna) ----------------
  const ringM = () => new THREE.MeshBasicMaterial({ color: 0xffb040, transparent: true, opacity: 0.8, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const RINGS = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), ringM()); m.visible = false; scene.add(m); RINGS.push(m); }
  const hideRings = () => { for (const r of RINGS) r.visible = false; };

  // ---------------- light states ----------------
  function lights(level, t) {
    for (const w of wins) { const on = w.tier <= level; w.l.visible = on; w.d.visible = !on; }
    for (const g of glassMeshes) g.material = level >= 1 ? gLit : gDim;
    doorLight.color.set(level >= 1 ? 0xffc070 : 0x6ad890); doorLight.intensity = level >= 2 ? 16 : level >= 1 ? 11 : 6; doorLight.distance = level >= 1 ? 11 : 7;
    reflG.color.set(level >= 1 ? 0xffb060 : 0x40ff90); reflG.opacity = level >= 1 ? 0.4 : 0.22;
    const bl = Math.floor(t * 1.2) % 2 === 0; beacon.material.color.set(bl ? 0xff3020 : 0x401010); beaconHalo.visible = bl;
  }
  function reset(level, t, fogNear = 18, fogFar = 60) {
    hideAll(); hideRings(); ch.root.visible = false; abRestore(); for (const s of steam) s.visible = false;
    lights(level, t); scene.fog.near = fogNear; scene.fog.far = fogFar; leafL.rotation.y = 0; doorGrp.position.set(0, 0, 0);
    hemi.intensity = 1.7; moon.intensity = 0.9;
  }
  const flashK = (t, t0) => { const F = [[t0, 0.07, 1], [t0 + 0.12, 0.06, 0.7]]; let k = 0; for (const [a, d, s] of F) if (t >= a && t < a + d) k = Math.max(k, s); else if (t >= a + d && t < a + d + 0.12) k = Math.max(k, s * 0.35 * (1 - (t - a - d) / 0.12)); return k; };
  const flash = (t, t0) => { const fk = flashK(t, t0); hemi.intensity = 1.7 + 5 * fk; moon.intensity = 0.9 + 4 * fk; return fk; };

  // ---------------- rain (fx canvas): streaks fall straight DOWN (tiny wind slant), splashes on the ground ----------------
  const drops = []; { const r = L.rng(400); for (let i = 0; i < 300; i++) drops.push({ x: r() * (LW + 20) - 10, y: r() * LH, sp: 560 + r() * 240, len: 7 + (r() * 9 | 0), col: r() < 0.3 ? '#a4b4c8' : r() < 0.7 ? '#7a8aa0' : '#5c6a80' }); }
  const splash = []; { const r = L.rng(401); for (let i = 0; i < 46; i++) splash.push({ x: r() * LW | 0, y: LH * 0.72 + r() * LH * 0.28 | 0, ph: r() }); }
  const bolt = []; { const r = L.rng(402); let bx = 470, by = 0; bolt.push([bx, by]); while (by < 120) { bx += r() * 18 - 10; by += 8 + r() * 12; bolt.push([bx | 0, by | 0]); } }
  const rainFx = (n = 300, len = 1, bolt0 = null, splashes = true) => ({ draw(c, t) {
    c.clearRect(0, 0, LW, LH);
    const fk = bolt0 == null ? 0 : flashK(t, bolt0);
    if (fk > 0.6) { c.strokeStyle = '#eef4ff'; c.lineWidth = 2; c.beginPath(); bolt.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.stroke(); }
    for (let i = 0; i < n; i++) {
      const d = drops[i], y = ((d.y + t * d.sp) % (LH + 30)) - 15, xx = d.x - y * 0.03, l = d.len * len;
      c.strokeStyle = fk > 0.3 ? '#dfe8f4' : d.col; c.lineWidth = 1;
      c.beginPath(); c.moveTo(Math.round(xx), Math.round(y)); c.lineTo(Math.round(xx - l * 0.03), Math.round(y + l)); c.stroke();
    }
    if (splashes) for (const s of splash) { const k = (t * 3 + s.ph) % 1; if (k < 0.25) { c.fillStyle = '#9aaabe'; c.fillRect(s.x - 1, s.y, 1, 1); c.fillRect(s.x + 1, s.y, 1, 1); c.fillRect(s.x, s.y - 1, 1, 1); } }
  } });
  const vignette = (o, k = 0.42) => { const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.3, LW / 2, LH * 0.45, LH * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH); };
  const flashOverlay = (o, t, t0) => { const fk = flashK(t, t0); if (fk > 0) { o.tctx.fillStyle = `rgba(220,230,255,${0.22 * fk})`; o.tctx.fillRect(0, 0, LW, LH); } };

  // ---------- labels (rooms.js Rlabel) ----------
  function Rline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; c.fillStyle = col;
    for (let n = 0; n < 2000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function Rlabel(o, text, cx, cy, col, tgt, at = [0.5, 0], k = 1, { fg = '#f4f4f4', sc = 1 } = {}) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n'), lh = sc === 2 ? 17 : 13;
    const tw = Math.max(...lines.map((s) => textWidth(s, sc))), w = Math.round(tw + 12), h = lines.length * lh + 9, xx = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', fg, k);
    if (tgt) { Rline(c, xx + at[0] * (w - 1), y + at[1] * (h - 1), tgt[0], tgt[1], bc); c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    c.fillStyle = '#0d0d12'; c.fillRect(xx, y, w, h);
    c.fillStyle = bc; c.fillRect(xx, y, w, 1); c.fillRect(xx, y + h - 1, w, 1); c.fillRect(xx, y, 1, h); c.fillRect(xx + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + 5 + Math.round(lh / 2) + i * lh, sc, fc, { outline: null }));
  }
  const pop = (lt, t0) => (lt < t0 ? 0 : lt - t0 < 0.07 ? 0.6 : 1);

  // =====================================================================================
  // 01_ext_open / 68_final_ext: the same low camera, the same push-in (68 just lasts longer)
  // =====================================================================================
  const cam01 = new THREE.PerspectiveCamera(42, LW / LH, 0.05, 260);
  const C0 = V(0.5, 0.62, 11.2), CDIR = V(-0.02, 0.012, -1).normalize(), TGT = V(0.0, 3.3, -8);
  const push = (lt) => 0.42 * lt * lt / (lt + 1.2);   // eases in, then a slow constant creep (m)
  const camOpen = (lt) => { cam01.position.copy(C0).addScaledVector(CDIR, push(lt)); cam01.lookAt(TGT); cam01.updateMatrixWorld(); };
  const Z01 = [[0, -3.2, 3.6, 1, 0.45, 0.1], [1, 2.8, -1.0, -1, 0.4, 0.5], [2, 4.2, -4.9, -1, 0.36, 0.75]];
  out['01_ext_open'] = {
    scene, camera: cam01,
    update(lt, t) {
      reset(0, t); camOpen(lt); flash(t, x.city01);
      for (const [i, z0, zz, dir, sp, ph] of Z01) putZ(i, z0 + dir * lt * sp, zz, dir * (Math.PI / 2 - 0.45), ph * 2 + lt * sp * 1.9);
    },
    fx: rainFx(300, 1, x.city01),
    overlay(lt, d, a, o) { vignette(o); flashOverlay(o, x.s01 + lt, x.city01); },
  };
  // 68: horde at the door (backs to camera, pressing the glass), more crossing the street toward it, every light on
  const HORDE = []; { const r = L.rng(68); for (let i = 0; i < 26; i++) { const row = Math.floor(i / 7); HORDE.push([-2.6 + (i % 7) * 0.86 + (r() - 0.5) * 0.4, -8.6 + row * 0.75 + (r() - 0.5) * 0.25, (r() - 0.5) * 0.5, r() * 3, row === 0 ? 2 : r() < 0.4 ? 2 : 1]); } }
  out['68_final_ext'] = {
    scene, camera: cam01,
    update(lt, t) {
      reset(2, t); camOpen(lt); flash(t, x.city68);
      HORDE.forEach(([hx, hz, yaw, ph, which], i) => putZ(i, hx, hz, Math.PI + yaw, ph + lt, which));
      const n0 = HORDE.length;
      [[-9, 2.6, 1], [8.5, 0.4, -1], [-12, -1.2, 1], [11, 3.8, -1], [-6, 5.2, 1], [14, -2.2, -1]].forEach(([sx, sz, dir], k) => {   // stragglers converge on the steps
        const p = V(sx + dir * lt * 0.6, 0, sz - lt * 0.15), yaw = Math.atan2(-p.x, -6 - p.z);
        putZ(n0 + k, p.x, p.z, yaw, k * 0.7 + lt * 1.1);
      });
      // the doors shake on each bang (only the doors)
      let sh = 0; for (const b of x.bangs68) { const u = t - b; if (u >= 0 && u < 0.18) sh = Math.max(sh, 1 - u / 0.18); }
      doorGrp.position.set(0.018 * sh * (Math.floor(t * 30) % 2 ? 1 : -1), 0, 0);
    },
    fx: rainFx(300, 1, x.city68),
    overlay(lt, d, a, o) { vignette(o); flashOverlay(o, x.s68 + lt, x.city68); },
  };

  // =====================================================================================
  // 07_ext_car: Ava's car two blocks away; the station far at the end of the avenue is the only light
  // =====================================================================================
  const cam07 = new THREE.PerspectiveCamera(38, LW / LH, 0.05, 260);
  const AVA07 = myCar.localToWorld(V(1.3, 0, 0.7));
  const dome07 = new THREE.PointLight(0xffd8a0, 5, 7, 1.2); dome07.position.copy(myCar.localToWorld(V(0.3, 1.25, 0.3))); scene.add(dome07);
  out['07_ext_car'] = {
    scene, camera: cam07,
    update(lt, t) {
      reset(1, t, 45, 160);
      const k = L.smooth(lt / (x.e07 - x.s07));
      cam07.position.set(0.9 - 0.1 * k, 1.3, 67.5 - 1.2 * k); cam07.lookAt(1.4, 2.2, 0); cam07.updateMatrixWorld();
      const blink = Math.floor((t - x.gasPre) * 2.4) % 2 === 0 && t >= x.gasPre; tailM.color.set(blink ? 0xff8a2a : 0x5a1a10); void tails;
      // Ava next to the car: looks around, points at the station on "two blocks"
      ch.root.visible = true; ch.root.position.copy(AVA07); ch.root.rotation.y = Math.PI + 0.12;
      const tp = x.two07 - x.s07 - 0.2;
      ch.pose(lt, [L.seg('look_around', -0.4, { speed: 0.8 }), L.seg('point', tp, { fade: 0.25 })], null);
      // two zombies far down the avenue, near the station
      putZ(0, -2.5 + lt * 0.3, 18, Math.PI / 2, lt * 0.8); putZ(1, 3.5 - lt * 0.25, 24, -Math.PI / 2, 0.6 + lt * 0.8);
    },
    fx: rainFx(260, 1),
    overlay(lt, d, a, o) {
      vignette(o, 0.4);
      const t = x.s07 + lt; if (t < x.gasPre) return;
      // dashboard fuel gauge inset (left, under the HUD): needle sinks to E, amber low-fuel light, EMPTY on "gas"
      const c = o.tctx, cx = 96, cy = 190, R = 46, k = L.smooth((t - x.gasPre) / 0.12);
      c.globalAlpha = k;
      c.fillStyle = '#0c0d10'; c.beginPath(); c.arc(cx, cy, R + 5, 0, 7); c.fill();
      c.fillStyle = '#5a5e66'; c.beginPath(); c.arc(cx, cy, R + 3, 0, 7); c.fill();
      c.fillStyle = '#101418'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
      const ang = (f) => Math.PI * (1.25 - 0.5 * f) + Math.PI * 0.0;   // f 0 = E (left), 1 = F (right) on the upper arc
      for (let i = 0; i <= 8; i++) { const a2 = Math.PI + (i / 8) * Math.PI, r0 = i % 4 ? R - 8 : R - 13; c.strokeStyle = i === 0 ? '#ff4030' : '#d8dce4'; c.lineWidth = i % 4 ? 1 : 2; c.beginPath(); c.moveTo(cx + Math.cos(a2) * r0, cy + Math.sin(a2) * r0); c.lineTo(cx + Math.cos(a2) * (R - 3), cy + Math.sin(a2) * (R - 3)); c.stroke(); }
      void ang;
      bitText(c, 'E', cx - R + 14, cy + 6, 1, '#ff5040', { outline: null }); bitText(c, 'F', cx + R - 14, cy + 6, 1, '#d8dce4', { outline: null });
      bitText(c, 'FUEL', cx, cy + 22, 1, '#9aa0aa', { outline: null });
      const f = 0.14 * (1 - L.smooth((t - x.gasPre) / Math.max(0.1, x.gas - x.gasPre))), na = Math.PI + f * Math.PI;
      c.strokeStyle = '#ff5a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(na) * (R - 6), cy + Math.sin(na) * (R - 6)); c.stroke();
      c.fillStyle = '#2a2c30'; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill();
      const lamp = t >= x.gas && Math.floor((t - x.gas) * 2.4) % 2 === 0;   // low-fuel lamp (pump icon)
      c.fillStyle = lamp ? '#ffb020' : '#3a2a10'; c.fillRect(cx - 6, cy - 22, 9, 11); c.fillRect(cx + 3, cy - 19, 3, 2); c.fillRect(cx + 5, cy - 19, 2, 7);
      c.globalAlpha = 1;
      if (t >= x.gas) Rlabel(o, 'EMPTY', cx, cy + R + 22, '#ff4030', null, [0.5, 0], 1, { sc: 2, fg: pop(t, x.gas) < 1 ? '#ffffff' : '#ff6a50' });
    },
  };

  // =====================================================================================
  // 08_ext_lights: fixed low angle from the sidewalk, lights on inside; Ava runs across the frame and up the steps
  // =====================================================================================
  const cam08 = new THREE.PerspectiveCamera(44, LW / LH, 0.05, 200);
  cam08.position.set(4.3, 0.55, -1.6); cam08.lookAt(-0.3, 2.1, -8.4); cam08.updateMatrixWorld();
  const cam08b = new THREE.PerspectiveCamera(46, LW / LH, 0.05, 200);   // high corner angle from under the portico: the steps AND the glass doors
  cam08b.position.set(3.3, 4.6, -3.9); cam08b.lookAt(-0.5, 1.3, -8.6); cam08b.updateMatrixWorld();
  // procedural layer on top of the walk clip: right-arm two-bone IK to the door handle + a lean into the push.
  // The mixer only rewrites a bone when its value changes, so the touched bones are restored before every pose (like lib lookAt).
  const AB = Object.fromEntries([['ua', 'UpperArmR'], ['fa', 'ForearmR'], ['hd', 'HandR'], ['chest', 'Chest'], ['ual', 'UpperArmL']].map(([k, n]) => [k, ch.bone.getObjectByName(n)]));
  let abSaved = null;
  const abRestore = () => { if (abSaved) for (const [b, q] of abSaved) b.quaternion.copy(q); abSaved = null; };
  const abSave = () => { abSaved = Object.values(AB).map((b) => [b, b.quaternion.clone()]); };
  const rotW = (b, R) => { const qw = b.getWorldQuaternion(new THREE.Quaternion()), pw = b.parent.getWorldQuaternion(new THREE.Quaternion()); b.quaternion.copy(pw.invert().multiply(R).multiply(qw)); b.updateMatrixWorld(true); };
  const PALM = V(0, 0.6, 0), palm = () => AB.hd.localToWorld(PALM.clone());
  function armIK(T, side) {
    const Sp = AB.ua.getWorldPosition(V()), E = AB.fa.getWorldPosition(V()), W = palm();
    const a = Sp.distanceTo(E), b = E.distanceTo(W), d = Math.min(a + b - 1e-3, Math.max(Math.abs(a - b) + 1e-3, Sp.distanceTo(T)));
    const u1 = Sp.clone().sub(E).normalize(), u2 = W.clone().sub(E).normalize(), cl = (v) => Math.min(1, Math.max(-1, v));
    const cur = Math.acos(cl(u1.dot(u2))), des = Math.acos(cl((a * a + b * b - d * d) / (2 * a * b)));
    let n = u2.clone().cross(u1); if (n.lengthSq() < 1e-8) n = side.clone(); n.normalize();
    rotW(AB.fa, new THREE.Quaternion().setFromAxisAngle(n, cur - des));
    rotW(AB.ua, new THREE.Quaternion().setFromUnitVectors(palm().sub(Sp).normalize(), T.clone().sub(Sp).normalize()));
  }
  const DBG08 = L.QS.has('dbg08');
  out['08_ext_lights'] = {
    scene, camera: cam08,
    update(lt, t) {
      reset(1, t); abRestore();
      const r = x.r08; out['08_ext_lights'].camera = t >= x.cut08 ? cam08b : cam08;
      const [px0, pz0] = path08(r, lt), ang = (a, b, k) => a + ((((b - a) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * k;
      // heading: along the path, settling to straight at the door (-z) over the last 0.3 s of the approach
      const pa = path08(r, Math.min(lt, r.tc - 0.32) - 0.15), pb = path08(r, Math.min(lt, r.tc - 0.32) + 0.15);
      const yaw = ang(Math.atan2(pb[0] - pa[0], pb[1] - pa[1]), Math.PI, L.smooth((lt - r.tc + 0.32) / 0.3));
      ch.root.visible = true; ch.root.position.set(px0, yAt(pz0, px0), pz0); ch.root.rotation.y = yaw;
      const th = leaf08(r, lt); leafL.rotation.y = th;
      ch.pose(lt, [L.seg('walk', -99, { from: x.ph08.at(L.q15(lt)), speed: 0, loop: true })], null);
      // reach (in over 0.3 s, hand lands on the handle at tc = push frame), hold while pushing, let go as the leaf swings on
      const w = L.smooth((lt - r.tc + 0.3) / 0.3) * (1 - L.smooth((lt - r.tc - 0.5) / 0.3));
      abSave();
      const tuck = L.smooth((lt - r.tc + 0.2) / 0.4);   // through the opening the free (left) arm swings closer to the body: clears the leaf
      if (tuck > 0) { ch.root.updateMatrixWorld(true); rotW(AB.ual, new THREE.Quaternion().setFromAxisAngle(V(Math.sin(yaw), 0, Math.cos(yaw)), -0.25 * tuck)); }
      if (w > 0) {
        ch.root.updateMatrixWorld(true);
        const fwd = V(Math.sin(yaw), 0, Math.cos(yaw)), side = V(0, 1, 0).cross(fwd).normalize();
        rotW(AB.chest, new THREE.Quaternion().setFromAxisAngle(side, 0.2 * w));   // lean into the push
        leafL.updateMatrixWorld(true);
        const H = leafL.localToWorld(V(0.87, DY + 1.2, 0.11)), T = palm().lerp(H, w);
        armIK(T, side);
        if (DBG08) console.warn(`dbg08 lt=${lt.toFixed(3)} th=${th.toFixed(2)} w=${w.toFixed(2)} miss=${palm().distanceTo(T).toFixed(3)} body=(${px0.toFixed(2)},${pz0.toFixed(2)})`);
      }
      if (DBG08) {   // body-vs-leaf clearance: chest/pelvis/shoulders/elbows vs the leaf slab (local x 0..0.98, |z| < 0.04)
        ch.root.updateMatrixWorld(true); leafL.updateMatrixWorld(true); const inv = leafL.matrixWorld.clone().invert(); let worst = 9, who = '';
        for (const n of ['Chest', 'Pelvis', 'Neck', 'Head', 'UpperArmL', 'UpperArmR', 'ForearmL', 'ForearmR', 'ThighL', 'ThighR', 'CalfL', 'CalfR', 'FootL', 'FootR', 'HandL', 'PalmL']) {
          const q = (n === 'PalmL' ? ch.hand('L').localToWorld(PALM.clone()) : ch.bone.getObjectByName(n).getWorldPosition(V())).applyMatrix4(inv); if (q.x < -0.05 || q.x > 1.03) continue; const dd = Math.abs(q.z); if (dd < worst) { worst = dd; who = n; } }
        let mull = 9; for (const n of ['UpperArmR', 'ForearmR', 'HandR', 'PalmR', 'Chest', 'ThighR', 'CalfR', 'FootR']) { const q = n === 'PalmR' ? palm() : ch.bone.getObjectByName(n).getWorldPosition(V()); if (Math.abs(q.z - DZ) < 0.12) mull = Math.min(mull, -0.04 - q.x); }
        console.warn(`dbg08 clear lt=${lt.toFixed(3)} th=${th.toFixed(2)} min=${worst.toFixed(3)} ${who} mullion=${mull.toFixed(3)}`);
      }
      // two zombies far left down the front street, drawn by the light
      putZ(0, -14 + lt * 0.4, 0.8, Math.PI / 2 - 0.3, lt); putZ(1, -17 + lt * 0.35, 3.2, Math.PI / 2 - 0.2, 0.7 + lt);
    },
    fx: rainFx(300, 1),
    overlay(lt, d, a, o) { vignette(o, 0.4); },
  };

  // =====================================================================================
  // 28_dinner_bell: a shot inside -> sound rings leave the facade; every zombie in the street snaps its head round
  // =====================================================================================
  const cam28 = new THREE.PerspectiveCamera(42, LW / LH, 0.05, 220);
  const RC28 = V(0, 2.4, -8.6);
  // EXACTLY three zombies in the street (the voice just said "three of them outside"): idle, turned away from the station
  const Z28 = [[-4.6, -0.6, 2.3, 0.3], [2.4, 3.2, -2.2, 1.1], [5.6, -1.0, 1.7, 2.0]].map(([zx, zz, off, ph]) => [zx, zz, Math.atan2(RC28.x - zx, RC28.z - zz) + off, ph]);
  const MUZ = V(4.2, 5.6, -8.95);   // the window where the shot flashes
  const muzzle = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: haloT, color: 0xfff0a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); muzzle.position.copy(MUZ).add(V(0, 0, 0.1)); muzzle.visible = false; scene.add(muzzle);
  out['28_dinner_bell'] = {
    scene, camera: cam28,
    update(lt, t) {
      reset(0, t, 24, 80);
      const k = L.smooth(lt / (x.e28 - x.s28));
      cam28.position.set(-7.2 + 0.6 * k, 4.4 - 0.3 * k, 10.5 - 1.4 * k); cam28.lookAt(0.8, 2.3, -6); cam28.updateMatrixWorld();
      muzzle.visible = t >= x.fire && t < x.fire + 0.07;
      // rings: billboarded toward the camera, centred on the doors
      x.rings28.forEach((t0, i) => { const u = (t - t0) / 1.5, m = RINGS[i]; if (u < 0 || u > 1) return; m.visible = true; m.material.color.set(0xffa040); m.position.copy(RC28); m.quaternion.copy(cam28.quaternion); m.scale.setScalar(0.6 + 17 * u); m.material.opacity = 0.85 * (1 - u); });
      // zombies: idle facing anywhere; when the first ring reaches them, the head snaps round, then the body follows and walks
      Z28.forEach(([zx, zz, yaw0, ph], i) => {
        const dist = Math.hypot(zx - RC28.x, zz - RC28.z), hit = x.fire + dist / 17 * 1.5 * 0.6;
        const want = Math.atan2(RC28.x - zx, RC28.z - zz);
        let dy = ((want - yaw0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        const hk = L.smooth((t - hit) / 0.14), bk = L.smooth((t - hit - 0.55) / 0.7);
        const yaw = yaw0 + dy * bk, headYaw = L.clamp01(Math.abs(dy) / 1.4) * Math.sign(dy) * 1.2 * hk * (1 - bk);
        const walkT = Math.max(0, t - hit - 0.9), wk = walkT > 0;
        const p = V(zx, 0, zz).add(V(Math.sin(want), 0, Math.cos(want)).multiplyScalar(walkT * 0.5));
        putZ(i, p.x, p.z, yaw, ph + (wk ? walkT * 1.1 : lt), wk ? 0 : 1, headYaw);
      });
    },
    fx: rainFx(260, 0.8),
    overlay(lt, d, a, o) {
      vignette(o, 0.38);
      const t = x.s28 + lt; if (t < x.bell) return;
      const p = L.toScreen(cam28, RC28.x, RC28.y + 0.4, RC28.z);
      Rlabel(o, 'DINNER BELL', Math.max(200, Math.min(500, p[0] + 80)), 112, '#ff5030', p, [0.5, 1], 1, { sc: 2, fg: pop(t, x.bell) < 1 ? '#ffffff' : '#ffe0d8' });
    },
  };

  // =====================================================================================
  // 64_city: high wide view; the station's antenna broadcasts; zombies from every street converge on it
  // =====================================================================================
  const cam64 = new THREE.PerspectiveCamera(40, LW / LH, 0.5, 400);
  const Z64 = []; { const r = L.rng(64);
    for (let i = 0; i < 40; i++) {
      const lane = [0, 1, 0, 2, 0, 4, 0, 1, 0, 2][i % 10]; let p0, d;
      if (lane === 0) { p0 = V(-4 + r() * 8, 0, 10 + r() * 50); d = V(0, 0, -1); }              // the avenue
      else if (lane === 1) { p0 = V(-8 - r() * 30, 0, -2 + r() * 8); d = V(1, 0, 0); }        // front street, west
      else if (lane === 2) { p0 = V(8 + r() * 30, 0, -2 + r() * 8); d = V(-1, 0, 0); }        // front street, east
      else if (lane === 3) { p0 = V((r() < 0.5 ? -40 : 40) + (r() - 0.5) * 6, 0, 10 + r() * 60); d = V(0, 0, -1); }   // side streets
      else { p0 = V(-30 + r() * 60, 0, 36 + r() * 8); d = V(0, 0, 0); }                         // cross street -> avenue
      Z64.push([p0, d, 0.9 + r() * 0.5, r() * 3]);
    } }
  out['64_city'] = {
    scene, camera: cam64,
    update(lt, t) {
      reset(1, t, 110, 260);
      const k = L.smooth(lt / (x.e64 - x.s64));
      cam64.position.set(5 - 1 * k, 27 - 3 * k, 62 - 8 * k); cam64.lookAt(0, 2, -7); cam64.updateMatrixWorld();
      // broadcast rings: flat, expanding over the rooftops from the antenna top, pale radio blue
      x.rings64.forEach((t0, i) => { const m = RINGS[i % RINGS.length], u = (t - t0) / 2.6; if (u < 0 || u > 1) return; m.visible = true; m.material.color.set(0x7ad4ff); m.position.set(ANT.x, ANT.y + ANT_H - 0.5 - u * 3, ANT.z); m.rotation.set(-Math.PI / 2, 0, 0); m.scale.setScalar(1 + 46 * u); m.material.opacity = 0.85 * (1 - u) * (1 - u); });
      Z64.forEach(([p0, d, sp, ph], i) => {
        let p = p0.clone(), dir = d.clone();
        if (dir.lengthSq() === 0) { dir = V(-Math.sign(p0.x || 1), 0, 0); }   // cross street: walk to the avenue, then up it
        p.addScaledVector(dir, lt * sp);
        if (d.lengthSq() === 0 && Math.abs(p.x) < 2) { p.x = Math.sign(p0.x) * 1.5; }
        putZ(i, p.x, p.z, Math.atan2(dir.x, dir.z), ph + lt * sp * 1.6); POOL[i].glow(0.22);
      });
    },
    fx: rainFx(160, 0.6, null, false),
    overlay(lt, d, a, o) { vignette(o, 0.35); },
  };

  return out;
}
