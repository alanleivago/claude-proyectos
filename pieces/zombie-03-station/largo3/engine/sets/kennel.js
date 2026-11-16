// sets/kennel.js — the K-9 kennel room of the station (chapter 11:30 PM): RIBBON, the German shepherd (sets/dog.js).
// Shots: 38_k9_open (door opens toward camera, Ava push_door + flashlight), 39_ribbon (Ribbon half asleep wagging, slow
// push-in, Ava kneels), 40_tag (collar tag RIBBON on "Ribbon"), 43_growl (Ribbon up, ears up, growling at the door; Ava
// still behind). Contract: SETS.md. All times from word anchors (ctx.at / ctx.words), computed inside shots()/sfx().
// World: room x [-2.5, 2.5], z [-2.5, 2.5], ceiling 2.8; the door is in the front wall z = +2.5 at x = 1.3 (opens inward,
// toward -z); chain-link kennel run in the back-left corner x [-2.45, -0.3], z [-2.45, -0.5], gate on its front (open).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { loadDog } from './dog.js';
import { kit } from './r2kit.js';

// ---------- word anchors (global s) shared by shots() and sfx() ----------
function K9times(ctx) {
  const { T, at, words, CUTS } = ctx;
  const k2 = words('k2'), open2 = k2.filter((w) => w[0].startsWith('open')).pop()[1];   // 2nd "open" ("You open it")
  const r = {
    t38: T['38_k9_open'], t39: T['39_ribbon'], t40: T['40_tag'], t40b: T['40b_ball'], t43: T['43_growl'],
    vest: at('k5b', 'vest'), ball: at('k5b', 'ball'), zero: at('k5b', 'zero'), open5b: at('k5b', 'open'), candy: at('k5b', 'candy'),
    open: open2,                     // the door starts to swing on "open"
    kneel: at('k4', 0),              // Ava kneels on "a German shepherd"
    waiting: at('k4', 'waiting'),
    ribbon: at('k5', 'ribbon'), tag: at('k5', 'tag'),
    growls: at('k8', 'growls'), listen: at('k9', 'listen'),
  };
  r.contact = r.open - 0.02;         // door leaf starts moving
  r.push = r.contact - 0.26;         // push_door clip: palm hits the door at clip 0.26 s
  r.walk38 = r.push + 0.75;          // she walks in after the push (walk clip at 0.7x)
  r.e38 = r.t39; r.e40b = (() => { const i = CUTS.findIndex((c) => c[0] === '40b_ball'); return CUTS[i + 1] ? CUTS[i + 1][1] : r.t40b + 5; })();
  r.lift = r.candy - 0.12;           // 40b: Ribbon's head comes up on "candy"
  r.unwrap = r.open5b - 0.15;        // Ava holds up / opens the candy bar on "open"
  return r;
}
const WAG_HZ = 1.4, WAG_HZ_HAPPY = 2.4;
const STEP_PH = [0.12, 0.60];   // walk clip foot contacts (s in its 1.0 s cycle)
function walkSteps(at, speed, t0, t1) { const out = [], x0 = (t0 - at) * speed, x1 = (t1 - at) * speed; for (let n = Math.floor(x0) - 1; n <= Math.ceil(x1); n++) for (const c of STEP_PH) { const xx = n + c; if (xx >= x0 && xx < x1) out.push(+(at + xx / speed).toFixed(3)); } return out; }

export function sfx(ctx) {
  const r = K9times(ctx), out = [];
  // 38 door
  out.push([r.push + 0.1, 'door_handle'], [r.contact, 'door_open'], [r.contact + 0.05, 'door_creak'], [r.contact + 0.12, 'flashlight_click']);
  out.push([r.contact + 0.5, 'dog_tail_rustle']);
  for (const t of walkSteps(r.walk38, 0.7, r.walk38, r.e38)) out.push([t, 'step_walk']);
  // 39: tail thumps on the blanket at every end of the wag, Ava kneels, happy whine on "waiting"
  for (let t = r.t39 + 0.5 / (2 * WAG_HZ); t < r.t40; t += 1 / (2 * WAG_HZ)) out.push([+t.toFixed(3), 'tail_thump']);
  out.push([r.kneel + 0.55, 'kneel_cloth'], [r.waiting, 'dog_whine']);
  // 40: tag jingle when it turns to camera, label on "Ribbon"; tail still thumping
  out.push([r.ribbon - 0.5, 'collar_jingle'], [r.ribbon, 'label_pop']);
  for (let t = r.t40 + 0.5 / (2 * WAG_HZ); t < r.ribbon + 0.9; t += 1 / (2 * WAG_HZ)) out.push([+t.toFixed(3), 'tail_thump']);
  // 40b: vest label, the ball squeaks in her teeth on "ball", head up + happy tail thumps from "candy", wrapper crinkle on "open"
  out.push([r.vest, 'label_pop'], [r.ball - 0.05, 'ball_squeak'], [r.ball, 'label_pop'], [r.ball + 0.55, 'ball_squeak'], [r.unwrap, 'wrapper_crinkle'], [r.lift, 'dog_collar_jingle']);
  for (let t = r.lift + 0.15 + 0.5 / (2 * WAG_HZ_HAPPY); t < r.e40b; t += 1 / (2 * WAG_HZ_HAPPY)) out.push([+t.toFixed(3), 'tail_thump']);
  // 43: she is up (claws on concrete), growl swelling on "growls", low rumble on "listen"
  out.push([r.t43 + 0.05, 'dog_claws_concrete'], [r.growls - 0.35, 'dog_growl'], [r.listen, 'dog_growl_low']);
  return out.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L, TL } = ctx;
  const { THREE, LW, LH } = L;
  const r = K9times(ctx);
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
  const vignette = (o, k = 0.45) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.3, LW / 2, LH * 0.45, LH * 0.7);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  // RE-style label (rooms.js Rlabel)
  function Kline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 2000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function Klabel(o, text, cx, cy, col, tgt, k = 1, sc = 1) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n'), lh = sc === 2 ? 17 : 13;
    const tw = Math.max(...lines.map((s) => textWidth(s, sc)));
    const w = Math.round(tw + 12), h = lines.length * lh + 9, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', '#f4f4f4', k);
    if (tgt) { Kline(c, cx, y + h - 1, tgt[0], tgt[1], bc); c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + 5 + Math.round(lh / 2) + i * lh, sc, fc, { outline: null }));
  }

  // ---------- textures (drawn in code, 16-64 px, nearest) ----------
  const tConcrete = L.cvs(64, 64, (c, w, h) => {   // sealed grey concrete, trowel marks, stains, joint
    const rr = L.rng(901);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 14 - 7 + 5 * Math.sin(x * 0.21 + y * 0.07); px(c, x, y, rgb(128 + n, 126 + n, 118 + n)); }
    for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(70,64,52,0.22)'; c.beginPath(); c.ellipse(rr() * 64, rr() * 64, 4 + rr() * 8, 3 + rr() * 5, rr() * 3, 0, 7); c.fill(); }
    px(c, 0, 0, '#66645c', w, 1); px(c, 0, 0, '#66645c', 1, h);
  });
  const tBlock = (seed, lo, hi, split) => L.cvs(64, 64, (c, w, h) => {   // painted cinder block, two-tone
    const rr = L.rng(seed), A = hexRGB(lo), Bc = hexRGB(hi);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const col = y >= split ? A : Bc, row = y >> 3, mort = (y % 8 === 0) || ((x + (row & 1) * 16) % 32 === 0), n = rr() * 12 - 6, k = mort ? 0.74 : 1;
      px(c, x, y, rgb((col[0] + n) * k, (col[1] + n) * k, (col[2] + n) * k));
    }
    px(c, 0, split - 1, '#2a2a26', w, 1);
  });
  const tMetal = (seed, base) => L.cvs(32, 32, (c, w, h) => {
    const rr = L.rng(seed), A = hexRGB(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 14 - 7; px(c, x, y, rgb(A[0] + n, A[1] + n, A[2] + n)); }
    for (let k = 0; k < 6; k++) px(c, rr() * 30 | 0, rr() * 30 | 0, '#c8ccd0', 1 + (rr() * 4 | 0), 1);
    for (let k = 0; k < 6; k++) px(c, rr() * 30 | 0, rr() * 30 | 0, '#7a4a2a', 1, 1);
  });
  const tChain = L.cvs(16, 16, (c) => {   // chain-link diamond mesh (alpha), galvanised
    for (let i = 0; i < 16; i++) { px(c, i, i % 16, '#d0d4d0'); px(c, i, (16 - i) % 16, '#a0a6a0'); px(c, i, (i + 8) % 16, '#d0d4d0'); px(c, i, (24 - i) % 16, '#a0a6a0'); }
  });
  const tStraw = L.cvs(32, 16, (c) => {   // loose straw strands (alpha)
    const rr = L.rng(907);
    for (let k = 0; k < 70; k++) { const x = rr() * 32, y = rr() * 16, a = (rr() - 0.5) * 1.2, l = 3 + rr() * 6; c.strokeStyle = ['#d8b860', '#b8963c', '#e8d080', '#9a7a30'][k % 4]; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.4); c.stroke(); }
  });
  const tBlanket = L.cvs(32, 32, (c, w, h) => {   // old army-green wool blanket, stripes, dog hair
    const rr = L.rng(908);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 16 - 8; px(c, x, y, rgb(84 + n, 92 + n, 62 + n)); }
    px(c, 0, 5, '#3a3e2a', w, 2); px(c, 0, 26, '#3a3e2a', w, 2);
    for (let k = 0; k < 20; k++) px(c, rr() * 32 | 0, rr() * 32 | 0, '#b8904c', 2, 1);
  });
  const tSign = L.cvs(64, 32, (c) => {   // K-9 UNIT sign (police blue, white letters, gold star)
    c.fillStyle = '#1a2a6a'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#e8e8e0'; c.fillRect(1, 1, 62, 1); c.fillRect(1, 30, 62, 1);
    c.fillStyle = '#f0f0e8'; c.font = 'bold 15px Tahoma, Verdana, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K-9', 38, 13);
    c.font = 'bold 7px Tahoma, Verdana, sans-serif'; c.fillText('UNIT', 38, 25);
    c.fillStyle = '#d8b040'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? 4 : 9; c.lineTo(12 + Math.cos(a) * rad, 16 + Math.sin(a) * rad); } c.fill();
  });
  const tDoor = L.cvs(32, 64, (c, w, h) => {   // steel door, grey-green, kick plate, wired window, K-9 plate, claw scratches
    const rr = L.rng(909);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 10 - 5; px(c, x, y, rgb(86 + n, 98 + n, 90 + n)); }
    px(c, 0, 56, '#9aa0a0', w, 8); for (let x = 2; x < w; x += 4) px(c, x, 57, '#6a7070', 1, 6);
    px(c, 10, 10, '#14181c', 12, 14); for (let k = 0; k < 14; k += 3) { px(c, 10, 10 + k, '#5a6068', 12, 1); px(c, 10 + k, 10, '#5a6068', 1, 14); }
    px(c, 3, 33, '#c8c8c0', 3, 2); px(c, 9, 27, '#1a2a6a', 14, 5); px(c, 10, 28, '#e8e8e0', 12, 1); px(c, 10, 30, '#e8e8e0', 8, 1);
    for (let k = 0; k < 7; k++) px(c, 18 + k, 44 + (k & 1), '#c0c8c0', 1, 5);
  });
  const tDrain = L.cvs(16, 16, (c) => { c.fillStyle = '#3a3a36'; c.beginPath(); c.arc(8, 8, 7.5, 0, 7); c.fill(); c.fillStyle = '#121210'; for (let k = 0; k < 5; k++) c.fillRect(3, 3 + k * 2.4, 10, 1); c.strokeStyle = '#6a6a62'; c.beginPath(); c.arc(8, 8, 7, 0, 7); c.stroke(); });
  const tGlow = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const tBeam = L.cvs(16, 32, (c) => { for (let y = 0; y < 32; y++) { const a = 0.3 * (y / 32); const g = c.createLinearGradient(0, 0, 16, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, `rgba(255,244,210,${a})`); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, y, 16, 1); } });

  // ---------- the room ----------
  const BG = 0x0a0d12;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 6, 14);
  scene.add(new THREE.HemisphereLight(0x8a98c0, 0x4a4234, 1.35));
  { const f = new THREE.PointLight(0xffd8a8, 2.5, 3, 1.2); f.position.set(-0.9, 1.2, -0.6); scene.add(f); }   // warm fill over the run
  const bulb = new THREE.PointLight(0xffc888, 6, 6, 1.1); bulb.position.set(-0.6, 2.45, -0.6); scene.add(bulb);      // caged ceiling bulb (warm)
  const hallL = new THREE.PointLight(0x8aa8ff, 0, 5, 1.2); hallL.position.set(1.3, 1.9, 3.3); scene.add(hallL);    // corridor light through the door
  const torch = new THREE.SpotLight(0xfff0c8, 0, 8, 0.38, 0.5, 1.1); scene.add(torch, torch.target);
  const RW = 2.5, HH = 2.8;
  const mWall = lam(L.rep(tBlock(911, '#4e6250', '#c4bea4', 22), 3, 2.2));
  L.plane(2 * RW, HH, mWall, 0, HH / 2, -RW, scene);
  L.plane(2 * RW, HH, mWall, -RW, HH / 2, 0, scene, Math.PI / 2);
  L.plane(2 * RW, HH, mWall, RW, HH / 2, 0, scene, -Math.PI / 2);
  const DX0 = 0.82, DX1 = 1.78, DH = 2.1;   // doorway in the front wall
  const fw = (x0, x1, y0, y1) => L.plane(x1 - x0, y1 - y0, mWall, (x0 + x1) / 2, (y0 + y1) / 2, RW, scene, Math.PI);
  fw(-RW, DX0, 0, HH); fw(DX1, RW, 0, HH); fw(DX0, DX1, DH, HH);
  L.plane(2 * RW, 2 * RW, lam(L.rep(tConcrete, 3, 3)), 0, 0, 0, scene, 0, -Math.PI / 2);
  L.plane(2 * RW, 2 * RW, lam(null, 0x2a2c2e), 0, HH, 0, scene, 0, Math.PI / 2);
  // floor drain + wet patch, coiled hose on the right wall
  L.plane(0.22, 0.22, lam(tDrain, 0xffffff, { alphaTest: 0.5 }), 0.2, 0.004, 0.3, scene, 0, -Math.PI / 2);
  { const wet = L.plane(1.0, 0.7, L.basic(null, 0x10141a, { transparent: true, opacity: 0.35, depthWrite: false }), 0.25, 0.003, 0.35, scene, 0, -Math.PI / 2); wet.rotation.z = 0.4; }
  { const g = new THREE.Group(); g.position.set(RW - 0.02, 0, 0.6); scene.add(g); const mh = lam(null, 0x2a5a2a);
    cyl(0.05, 0.05, 0.06, 8, lam(null, 0x8a8a84), -0.03, 1.1, 0, g).rotation.z = Math.PI / 2;
    for (let k = 0; k < 6; k++) { const t = L.mesh(new THREE.TorusGeometry(0.16, 0.018, 4, 10), mh, -0.05 - k * 0.012, 1.0, 0, g); t.rotation.y = Math.PI / 2; }
    cyl(0.015, 0.015, 0.3, 6, lam(null, 0xb08a3a), -0.06, 0.72, 0.1, g); }
  for (const [x, z, ry] of [[0, -RW + 0.01, 0], [-RW + 0.01, 0, Math.PI / 2], [RW - 0.01, 0, -Math.PI / 2]]) L.plane(5, 0.12, lam(null, 0x3a3a34), x, 0.06, z, scene, ry);
  { const g = new THREE.Group(); g.position.copy(bulb.position); scene.add(g);
    cyl(0.012, 0.012, 0.33, 4, lam(null, 0x2a2a2a), 0, 0.18, 0, g);
    L.mesh(new THREE.SphereGeometry(0.05, 6, 4), L.basic(null, 0xfff2c0), 0, 0.0, 0, g);
    L.mesh(new THREE.SphereGeometry(0.085, 6, 4), L.basic(null, 0x2a2a2a, { wireframe: true }), 0, 0, 0, g); }
  // K-9 sign, leash on a hook, food sack, supply cabinet
  L.plane(0.7, 0.35, lam(tSign), 0.55, 1.85, -RW + 0.02, scene);
  { const g = new THREE.Group(); g.position.set(1.35, 0, -RW + 0.03); scene.add(g);
    B(0.04, 0.03, 0.06, lam(null, 0x8a8a84), 0, 1.62, 0.03, g);
    const mL = lam(null, 0x2a1a10); const pts = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(V(0.1 * Math.sin(u * Math.PI * 2) * (1 - u * 0.3), 1.6 - 0.62 * Math.sin(u * Math.PI) - 0.1 * u, 0.04)); }
    for (let i = 0; i < 16; i++) { const a = pts[i], b = pts[i + 1], m = B(0.016, a.distanceTo(b) + 0.01, 0.008, mL, (a.x + b.x) / 2, (a.y + b.y) / 2, 0.04, g); m.rotation.z = -Math.atan2(b.x - a.x, b.y - a.y); }
    B(0.03, 0.05, 0.02, lam(null, 0xb0b0a8), 0.0, 0.95, 0.05, g);
    const tSack = L.cvs(32, 32, (c) => { c.fillStyle = '#c8b890'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#a02a1a'; c.fillRect(0, 4, 32, 9); c.fillStyle = '#f0e8d0'; c.font = 'bold 7px Tahoma'; c.textAlign = 'center'; c.fillText('K-9 CHOW', 16, 11); c.fillStyle = '#6a5a3a'; c.fillRect(6, 18, 20, 2); c.fillRect(6, 22, 14, 2); c.fillStyle = '#8a7a50'; c.fillRect(0, 30, 32, 2); });
    const ms = lam(null, 0xb8a880); const sk = B(0.42, 0.55, 0.22, [ms, ms, lam(null, 0xa89870), ms, lam(tSack), ms], 0.4, 0.275, 0.16, g); sk.rotation.z = -0.06; }
  { const g = new THREE.Group(); g.position.set(2.15, 0, -1.6); g.rotation.y = -Math.PI / 2; scene.add(g);
    B(0.6, 1.8, 0.45, lam(tMetal(912, '#6a7470')), 0, 0.9, 0, g);
    B(0.02, 1.7, 0.01, lam(null, 0x2a2e2c), 0, 0.9, 0.23, g); B(0.03, 0.12, 0.02, lam(null, 0xc8c8c0), 0.06, 1.0, 0.235, g); }

  // ---- the kennel run: galvanised posts + chain-link panels; gate on the front, swung open
  const KX0 = -2.45, KX1 = -0.3, KZ0 = -2.45, KZ1 = -0.5, KH = 1.8;
  const mPost = lam(null, 0xa8aca8);
  const panel = (x0, z0, x1, z1, y0 = 0.04, h = KH, parent = scene) => {
    const len = Math.hypot(x1 - x0, z1 - z0), t = L.rep(tChain, len / 0.1, h / 0.1);
    const p = L.plane(len, h, lam(t, 0xffffff, { alphaTest: 0.5, side: DS }), (x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2, parent, -Math.atan2(z1 - z0, x1 - x0));
    for (const yy of [y0 + h, y0 + 0.02]) { const bar = B(len, 0.03, 0.03, mPost, (x0 + x1) / 2, yy, (z0 + z1) / 2, parent); bar.rotation.y = -Math.atan2(z1 - z0, x1 - x0); }
    return p;
  };
  for (const [x, z] of [[KX0, KZ1], [KX1, KZ1], [KX1, KZ0], [-1.35, KZ1], [KX1, -1.5]]) cyl(0.025, 0.025, KH + 0.06, 6, mPost, x, (KH + 0.06) / 2, z, scene);
  panel(KX1, KZ1, KX1, KZ0);
  panel(KX0, KZ1, -1.35, KZ1);
  const gate = new THREE.Group(); gate.position.set(-1.35, 0, KZ1); scene.add(gate);   // hinge at x -1.35
  panel(0, 0, 1.0, 0, 0.06, KH - 0.04, gate); B(0.06, 0.03, 0.03, lam(null, 0x8a8a84), 0.98, 1.0, 0, gate);
  B(KX1 - KX0, 0.04, KZ1 - KZ0, lam(L.rep(tConcrete, 1.5, 1.5), 0xd8d4c8), (KX0 + KX1) / 2, 0.02, (KZ0 + KZ1) / 2, scene);
  const BED = V(-1.45, 0.045, -1.55);
  { const bl = L.plane(1.25, 0.95, lam(tBlanket, 0xffffff, { side: DS }), BED.x, BED.y + 0.004, BED.z, scene, 0, -Math.PI / 2); bl.rotation.z = 0.12;
    const roll = cyl(0.07, 0.07, 1.1, 7, lam(tBlanket), BED.x - 0.05, BED.y + 0.06, BED.z - 0.55, scene); roll.rotation.z = Math.PI / 2; roll.rotation.y = 0.12;
    const mS = lam(tStraw, 0xffffff, { alphaTest: 0.4, side: DS }), rr = L.rng(913);
    const straw = (x, y, z, w) => { const s = L.plane(w, w * 0.4, mS, x, y, z, scene); s.rotation.set(-Math.PI / 2 + (rr() - 0.5) * 0.5, 0, rr() * 3.14); };
    for (let k = 0; k < 34; k++) straw(KX0 + 0.15 + rr() * (KX1 - KX0 - 0.3), 0.05 + rr() * 0.02, KZ0 + 0.15 + rr() * (KZ1 - KZ0 - 0.3), 0.3 + rr() * 0.25);
    for (let k = 0; k < 10; k++) straw(-0.2 + rr() * 1.2, 0.006, -1.0 + rr() * 1.6, 0.25);
  }
  const bowl = (x, z, fill) => { const g = new THREE.Group(); g.position.set(x, 0.0, z); scene.add(g); const mB = lam(tMetal(914, '#b8bcc0'));
    cyl(0.12, 0.09, 0.07, 10, mB, 0, 0.035, 0, g); cyl(0.125, 0.125, 0.012, 10, mB, 0, 0.07, 0, g);
    cyl(0.105, 0.105, 0.005, 10, fill === 'water' ? L.basic(null, 0x3a5a7a) : lam(L.cvs(8, 8, (c) => { const rr = L.rng(915); for (let i = 0; i < 64; i++) px(c, i % 8, i >> 3, ['#6a3a1a', '#8a5226', '#4a2810'][rr() * 3 | 0]); })), 0, 0.06, 0, g); return g; };
  bowl(-0.05, -0.75, 'food'); bowl(0.25, -0.95, 'water');
  // corridor outside the door
  L.plane(1.4, 2.0, lam(L.rep(tConcrete, 1, 1.4), 0xb0b8c8), 1.3, 0.001, RW + 1.0, scene, 0, -Math.PI / 2);
  L.plane(2.6, 2.6, lam(L.rep(tBlock(916, '#4a5a6a', '#9aa6b0', 22), 2, 1.6)), 1.3, 1.3, RW + 1.9, scene, Math.PI);
  // door frame + leaf (hinge at x = DX1, opens inward to -z)
  const mFr = lam(tMetal(917, '#4a5048'));
  B(0.07, DH + 0.06, 0.16, mFr, DX0 - 0.035, (DH + 0.06) / 2, RW, scene); B(0.07, DH + 0.06, 0.16, mFr, DX1 + 0.035, (DH + 0.06) / 2, RW, scene); B(DX1 - DX0 + 0.14, 0.07, 0.16, mFr, (DX0 + DX1) / 2, DH + 0.035, RW, scene);
  const doorHinge = new THREE.Group(); doorHinge.position.set(DX1, 0, RW - 0.03); scene.add(doorHinge);
  { const w = DX1 - DX0, mE = lam(null, 0x56605a);
    B(w, DH - 0.02, 0.045, [mE, mE, mE, mE, lam(tDoor), lam(tDoor)], -w / 2, DH / 2, 0, doorHinge);
    B(0.12, 0.03, 0.05, lam(null, 0xc8c8c0), -w + 0.1, 1.0, -0.04, doorHinge); }

  // ---- Ava with the flashlight (rooms.js 07_armory)
  const ch = L.hero(); scene.add(ch.root);
  const fl = new THREE.Group();
  { const mB = lam(null, 0x1a1a1c); cyl(0.016, 0.016, 0.13, 8, mB, 0, 0, 0, fl).rotation.z = Math.PI / 2;
    cyl(0.026, 0.018, 0.05, 8, mB, 0.08, 0, 0, fl).rotation.z = Math.PI / 2;
    cyl(0.022, 0.022, 0.004, 8, L.basic(null, 0xfff6c0), 0.106, 0, 0, fl).rotation.z = Math.PI / 2; }
  L.holdIn(ch, fl, 'R', [0, 0.7, 0.25], [0, 0, 0]);
  const lensGlow = L.plane(0.07, 0.07, L.basic(tGlow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0, 0, scene);
  const beam = L.mesh(new THREE.ConeGeometry(0.5, 3.0, 12, 1, true), L.basic(tBeam, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: DS }), 0, 0, 0, scene);
  // 39: the cells-style torch (r2kit): arm aimed at the target, light + a NARROW cone out of the lens in her hand
  const FL = kit(ctx).flashlight(ch, scene); FL.hide();
  const narrowBeam = (rw = 0.32, len = 0.62) => {   // shrink the kit cone (0.55 x 3.4 m) to a slim beam from the lens
    if (!FL.beam.visible) return; FL.beam.scale.set(rw, len, rw);
    const d = V(0, -1, 0).applyQuaternion(FL.beam.quaternion); FL.beam.position.copy(FL.lensGlow.position).addScaledVector(d, 1.7 * len);
  };
  const beamOn = (on, c, target, k = 1, cone = true) => {
    ch.root.updateMatrixWorld(true);
    const lp = fl.localToWorld(V(0.11, 0, 0));
    torch.intensity = on ? 14 * k : 0; torch.position.copy(lp); torch.target.position.copy(target);
    lensGlow.visible = on; lensGlow.position.copy(lp); lensGlow.lookAt(c.position);
    beam.visible = on && cone && k > 0.05;
    if (beam.visible) { const d = target.clone().sub(lp).normalize(); beam.position.copy(lp).addScaledVector(d, 1.5); beam.quaternion.setFromUnitVectors(V(0, -1, 0), d); beam.material.opacity = k; }
  };

  // ---- Ribbon
  const dog = await loadDog(L); scene.add(dog.root);
  // K-9 vest now comes with every loadDog() (dog.vest); chewed tennis ball (placed per frame between the front paws); candy bar
  // in Ava's left hand (40b)
  const vest = dog.vest;
  const tBall = L.cvs(16, 16, (c) => { const rr = L.rng(932); for (let i = 0; i < 256; i++) { const n = rr() * 26 - 13; px(c, i % 16, i >> 4, rgb(214 + n, 244 + n * 0.4, 40 + n)); }
    c.strokeStyle = '#f0f0e0'; c.beginPath(); c.moveTo(0, 5); c.bezierCurveTo(5, 0, 11, 16, 16, 11); c.stroke(); px(c, 9, 7, '#9aa83a', 3, 2); px(c, 3, 11, '#a8b848', 2, 2); });
  // bright yellow-green, unlit so it never sinks into the straw; sits just in front of her paws, in frame (40b)
  const BALL_R = 0.06, ball = L.mesh(new THREE.SphereGeometry(BALL_R, 8, 6), L.basic(tBall), 0, -9, 0, scene);
  const placeBall = (lt) => { dog.root.updateMatrixWorld(true); ball.position.copy(dog.root.localToWorld(V(0.02, BALL_R, 0.66))); ball.rotation.set(0.4, lt * 0.2, 0.2); ball.visible = true; };
  const candy = new THREE.Group();
  { const tW = L.cvs(16, 8, (c) => { c.fillStyle = '#7a1e14'; c.fillRect(0, 0, 16, 8); c.fillStyle = '#f0d040'; c.fillRect(3, 2, 10, 4); c.fillStyle = '#7a1e14'; c.fillRect(5, 3, 6, 2); });
    L.mesh(new THREE.BoxGeometry(0.11, 0.02, 0.035), [lam(null, 0x7a1e14), lam(null, 0x7a1e14), lam(tW), lam(tW), lam(null, 0x7a1e14), lam(null, 0x7a1e14)], 0, 0, 0, candy);
    L.mesh(new THREE.BoxGeometry(0.03, 0.021, 0.033), lam(null, 0x4a2a14), 0.065, 0, 0, candy); }   // the bitten-open chocolate end
  L.holdIn(ch, candy, 'L', [0, 0.75, 0.2], [0, 0, Math.PI / 2]); candy.visible = false;
  const DOOR = V(1.3, 0.9, RW);
  const reset = () => { FL.unaim(); FL.hide(); fl.visible = true; candy.visible = false; ball.position.copy(BED).add(V(0.45, BALL_R, 0.5)); doorHinge.rotation.y = 0; hallL.intensity = 0; gate.rotation.y = -1.25; ch.root.visible = true; dog.root.visible = true; };
  const out = {};

  // 38_k9_open: from inside the run, the door swings toward camera on "open"; Ava pushes it, flashlight cuts in
  {
    const c38 = cam(46);
    out['38_k9_open'] = { scene, camera: c38, update(lt, t) {
      reset();
      const tc = r.contact - r.t38, tp = r.push - r.t38;
      const k = L.smooth((lt - tc) / 0.55);
      doorHinge.rotation.y = -1.45 * k;
      hallL.intensity = 7 * L.smooth((lt - tc) / 0.25);
      const z = RW + 0.55 - 0.45 * L.smooth((lt - tc - 0.2) / 0.8);
      ch.root.position.set(1.22, 0, z); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('idle', -9), L.seg('push_door', tp, { fade: 0.1 }), L.seg('walk', tp + 0.75, { loop: true, speed: 0.7, fade: 0.2 })], [[-99, 'open', mouthAt(t, 'neutral')]]);
      dog.root.position.copy(BED); dog.root.rotation.y = 0.55;
      dog.update(lt, 'sleepy_wag', { from: 'sleep', k: (lt - tc - 0.2) / 0.6, wag: L.smooth((lt - tc - 0.3) / 0.4) * 0.8, look: V(1.2, 1.5, RW) });
      look(c38, V(-2.2, 0.9, -2.35), V(0.9, 0.75, 2.2));
      beamOn(lt > tc + 0.1, c38, V(-0.9, 0.3, -1.2).lerp(BED, L.smooth((lt - tc - 0.2) / 0.8)), L.smooth((lt - tc - 0.08) / 0.2));
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5) };
  }

  // 39_ribbon: Ribbon half asleep on her blanket, tail sweeping; slow push-in; Ava kneels by the gate on "a German shepherd"
  {
    const c39 = cam(42);
    out['39_ribbon'] = { scene, camera: c39, update(lt, t) {
      reset(); doorHinge.rotation.y = -1.45; hallL.intensity = 7;
      dog.root.position.copy(BED); dog.root.rotation.y = 0.55;
      const AV = V(-0.75, 0, -1.85);   // she kneels at Ribbon's side, inside the run (profile to camera)
      ch.root.position.copy(AV); ch.root.rotation.y = Math.atan2(BED.x - AV.x, BED.z + 0.1 - AV.z);
      const tk = r.kneel - r.t39;
      ch.pose(lt, [L.seg('idle', -9, { loop: true }), L.seg('kneel', tk, { fade: 0.15 })], [[-99, lt > tk + 1 ? 'happy' : 'open', mouthAt(t, lt > tk + 0.6 ? 'smile' : 'neutral')]]);
      ch.root.updateMatrixWorld(true);
      const hp = ch.bone.getObjectByName('Head').getWorldPosition(V());
      dog.update(lt, 'sleepy_wag', { wag: 0.9, wagHz: WAG_HZ, look: hp.lerp(V(-0.4, 0.8, 0.4), 0.5) });
      placeBall(lt);
      // slow push-in from outside the run, through the side chain link; framed to keep Ava's head in (she stands, then kneels)
      const u = L.smooth(lt / (r.t40 - r.t39));
      look(c39, V(0.6, 1.62, 0.85).lerp(V(0.15, 1.32, 0.1), u), V(-1.15, 0.62, -1.72).lerp(V(-1.18, 0.38, -1.72), u));   // dog whole in frame (paws + ball)
      beamOn(false, c39, BED);
      const tg = BED.clone().add(V(0.15, 0.15, 0.25)); fl.visible = false; FL.show(); FL.aim(tg, 1); FL.on(true, c39, tg, 0.7, true, 14); narrowBeam();
    }, overlay: (lt, dt, a, o) => vignette(o, 0.42) };
  }

  // 40_tag: close-up of the collar; the brass tag turns to camera + flashlight glint on "Ribbon"; tail keeps wagging
  {
    const c40 = cam(30);
    const tagPos = () => dog.tag.localToWorld(V(0, -0.028, 0.004));
    out['40_tag'] = { scene, camera: c40, update(lt, t) {
      reset(); doorHinge.rotation.y = -1.45; hallL.intensity = 7;
      dog.root.position.copy(BED); dog.root.rotation.y = 0.55;
      ch.root.position.set(-0.75, 0, -1.85); ch.root.rotation.y = Math.atan2(BED.x + 0.75, BED.z + 0.1 + 1.85);
      ch.pose(lt, L.still('kneel', 1.46), [[-99, 'happy', 'smile']]);
      const tr = r.ribbon - r.t40;
      dog.update(lt, 'sleepy_wag', { wag: 0.9, wagHz: WAG_HZ, headUp: 0.7 }); placeBall(lt);
      const tw = L.smooth((lt - (tr - 0.55)) / 0.4);
      dog.tag.rotation.z = 0.5 * (1 - tw) * Math.sin(lt * 7); dog.tag.rotation.x = 0.7 * (1 - tw);
      dog.root.updateMatrixWorld(true);
      const tp = tagPos();
      const dir = V(0.35, -0.05, 1).applyQuaternion(dog.root.quaternion).normalize();
      const dist = 0.55 - 0.2 * L.smooth(lt / Math.max(0.5, tr + 0.3));
      look(c40, tp.clone().addScaledVector(dir, dist), tp.clone().add(V(0, 0.03, 0)));
      beamOn(true, c40, tp, 0.3, false);
      torch.intensity = 5 + 12 * Math.max(0, 1 - Math.abs(lt - tr) / 0.3);
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.55);
      const tr = r.ribbon - r.t40, k = L.clamp01((lt - tr) / 0.1);
      if (k > 0) { const [x, y] = L.toScreen(c40, ...tagPos().toArray()); Klabel(o, 'RIBBON', 500, 120, '#8cff5a', [x + 24, y - 10], k, 2); }
    } };
  }


  // 40b_ball: Ribbon in her K-9 vest with a chewed tennis ball between the paws; FIXED low angle from outside the run through the
  // chain link; labels K-9 VEST on "vest" and TENNIS BALL on "ball"; zero interest in Ava... until "candy": the head comes up
  // and the tail goes, toward Ava and her candy bar
  {
    const c40b = cam(40);
    out['40b_ball'] = { scene, camera: c40b, update(lt, t) {
      reset(); doorHinge.rotation.y = -1.45; hallL.intensity = 7;
      dog.root.position.copy(BED); dog.root.rotation.y = 0.55;
      const AV = V(-0.7, 0, -1.0);   // kneeling at the run's edge, the candy bar appears in her hand on "open"
      ch.root.position.copy(AV); ch.root.rotation.y = Math.atan2(BED.x - AV.x, BED.z - AV.z);
      const tu = r.unwrap - r.t40b; candy.visible = lt >= tu;
      ch.pose(lt, L.still('kneel', 1.46), [[-99, 'half', mouthAt(t, 'neutral')], [r.zero - r.t40b, 'sad', mouthAt(t, 'frown')], [tu + 0.3, 'happy', mouthAt(t, 'smile')]]);
      if (lt >= tu) { const k = L.smooth((lt - tu) / 0.25); candy.position.y = 0.75 + 0.25 * k; }
      const up = L.smooth((t - r.lift) / 0.35);
      ch.root.updateMatrixWorld(true);
      const cp = candy.getWorldPosition(V());
      // before: head low over the ball, looking away from Ava; after "candy": head up toward the candy, fast happy wag
      dog.update(lt, 'sleepy_wag', { headUp: -0.15 + 0.75 * up, wag: 0.25 + 0.75 * up, wagHz: up > 0.5 ? WAG_HZ_HAPPY : WAG_HZ,
        look: V(-2.2, 0.1, -0.6).lerp(cp, up) });
      placeBall(lt, t);
      look(c40b, V(-2.3, 1.0, 0.75), V(-1.12, 0.5, -1.45));
      beamOn(true, c40b, BED.clone().add(V(0.1, 0.2, 0.2)), 0.35, false);
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.35);
      const t = r.t40b + lt;
      if (t >= r.vest) { dog.root.updateMatrixWorld(true); const p = L.toScreen(c40b, ...vest.localToWorld(V(0, 0.68, 0.08)).toArray()); Klabel(o, 'K-9 VEST', 330, 104, '#4fd6ff', p, L.clamp01((t - r.vest) / 0.1), 2); }
      if (t >= r.ball) { const p = L.toScreen(c40b, ...ball.position.toArray()); Klabel(o, 'TENNIS BALL', 200, 232, '#ffd23f', [p[0], p[1]], L.clamp01((t - r.ball) / 0.1), 2); }
    } };
  }

  // 43_growl: Ribbon on her feet, ears up, lips back, growling at the shut door; Ava behind her, still
  {
    const c43 = cam(40);
    out['43_growl'] = { scene, camera: c43, update(lt, t) {
      reset(); doorHinge.rotation.y = 0; hallL.intensity = 0;
      const DP = V(-0.35, 0, 0.15); dog.root.position.copy(DP); dog.root.rotation.y = Math.atan2(DOOR.x - DP.x, DOOR.z - DP.z);
      const tg = r.growls - r.t43;
      dog.update(lt, 'growl', { from: 'stare', k: (lt - (tg - 0.45)) / 0.45, look: DOOR, growl: L.smooth((lt - tg + 0.3) / 0.3) });
      ch.root.position.set(0.3, 0, -0.8); ch.root.rotation.y = Math.atan2(DOOR.x - 0.3, DOOR.z + 0.8);
      ch.pose(lt, L.still('idle', 0.4), [[-99, 'open', mouthAt(t, 'neutral')]]);
      look(c43, V(-1.8, 0.85, 1.45).lerp(V(-1.55, 0.8, 1.2), L.smooth(lt / 3.5)), V(0.0, 0.65, -0.25));
      beamOn(true, c43, DOOR.clone().add(V(-0.2, 0.0, 0)), 0.45);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5) };
  }
  return out;
}
