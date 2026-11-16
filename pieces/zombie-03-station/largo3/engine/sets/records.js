// sets/records.js — the corridor outside RECORDS (chapter 1:35 AM): Marla behind the frosted-glass door, only a silhouette
// that moves with her voice (takes v2, v3b, v7). Shots: 48h_records (fixed low down the corridor, light under the door, Ava
// stops on "whispers"), 48i_door_talk (over Ava's shoulder at the glass on Marla's lines <-> frontal on Ava's lines, she
// looks at camera), 48j_trade (floor level: two candy bars slide under the door on "candy", a folded note slides back on
// "sheet", RE trade box), 48k_radio_warn (slow push-in to the glass, the silhouette comes close + palm on the glass on
// "radio"), 48l_gone (fixed high corner inside the empty records room, door open, note "WENT FOR THE ROOF. — M." on "gone").
// World: corridor x [-1, 1], z [-7, 3], ceiling 2.7. RECORDS door in the left wall x = -1, hinge at z = -1.05, leaf to
// z = -1.95 (opens into the room, toward -x). Records room x [-4.6, -1], z [-3.6, 0.6].
import { kit, walker, bitText, textWidth } from './r2kit.js';
import { SHhand } from './screens.js';

const MARLA = ['v2', 'v3b', 'v7'];
function RCtimes(ctx) {
  const { T, at } = ctx;
  const r = {
    t48h: T['48h_records'], t48i: T['48i_door_talk'], t48j: T['48j_trade'], t48k: T['48k_radio_warn'], t48l: T['48l_gone'], end48l: T['card_c0150'],
    whispers: at('v1', 'whispers'), v2: at('v2', 0), v3: at('v3', 0), v3b: at('v3b', 0), v4: at('v4', 0), nine: at('v3', 'nine'), blame: at('v4', 'blame'),
    candy: at('v4', 'candy'), trade: at('v4', 'trade'), sheet: at('v5', 'sheet'), slides: at('v5', 'slides'), radio: at('v7', 'radio'), whatever: at('v7', 0),
    open: at('v8', 'open'), marla: at('v8', 'marla'), gone: at('v8', 'gone'),
  };
  r.walk48h = walker([[0.25, 1.2], [-0.15, -1.42]], r.whispers - 3.1, 1.0);
  // 48l: hand on the handle (push48l), the leaf starts to swing (contact48l), she walks in through the middle of the opening
  r.push48l = r.open - 1.45; r.contact48l = r.push48l + 0.4;
  r.walk48l = walker([[-0.62, -1.56], [-1.47, -1.56]], r.contact48l + 0.05, 0.5);   // slow, cautious steps behind the leaf
  r.candy2 = r.candy + 0.32;
  return r;
}

export function sfx(ctx) {
  const r = RCtimes(ctx), out = [];
  out.push([r.t48h, 'corridor_room_tone'], ...r.walk48h.steps('step_walk', r.t48h, r.t48i), [r.whispers, 'whisper_breath']);
  // 48i: Marla's breath against the glass before each of her lines, a soft tap when she leans on it
  out.push([r.v2 - 0.25, 'whisper_breath'], [r.v3b - 0.25, 'whisper_breath'], [r.v3b + 0.1, 'frosted_glass_tap']);
  // 48j: candy bars slide under the door, the folded note comes back
  out.push([r.candy - 0.3, 'wrapper_crinkle'], [r.candy, 'candy_slide'], [r.candy2, 'candy_slide'], [r.candy + 0.05, 'label'],
    [r.sheet, 'paper_slide'], [r.sheet + 0.05, 'label'], [r.sheet + 0.7, 'paper_unfold']);
  // 48k: she comes to the glass, palm on it on "radio"
  out.push([r.whatever - 0.3, 'whisper_breath'], [r.radio, 'frosted_glass_tap'], [r.radio + 0.02, 'tension_sting']);
  // 48l
  out.push([r.t48l, 'empty_room_tone'], [r.push48l + 0.3, 'door_handle'], [r.contact48l, 'door_creak_slow'], ...r.walk48l.steps('step_walk', r.t48l, r.end48l), [r.gone, 'label']);
  return out.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L, TL } = ctx;
  const K = kit(ctx, { mute: MARLA }), { THREE, LW, LH, V, px, rgb, B, cyl, lam, basic, DS, mouthAt, cam, look, vignette, label, pop } = K;
  const r = RCtimes(ctx);
  const marlaSpans = MARLA.map((id) => [ctx.at(id, 0) - 0.05, ctx.endOf(id, -1) + 0.05]);
  const marlaTalk = (t) => { if (!marlaSpans.some(([a, b]) => t >= a && t <= b)) return 0; const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 1 : c === 'O' ? 0.7 : 0; };

  // ---------- textures ----------
  const tWall = L.rep(L.cvs(64, 64, (c) => {   // cream plaster over dark-wood wainscot
    const rr = L.rng(4101);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const n = rr() * 10 - 5;
      if (y < 38) px(c, x, y, rgb(214 + n, 204 + n, 176 + n)); else { const g = Math.sin(x * 0.7 + Math.sin(y * 0.2) * 2) * 8; px(c, x, y, rgb(106 + g + n, 70 + g * 0.6 + n, 42 + n)); } }
    px(c, 0, 37, '#4a2e18', 64, 2); for (let x = 0; x < 64; x += 16) px(c, x, 40, '#5a3a20', 1, 24);
  }), 4, 1);
  const tFloor = L.rep(K.tTile(4102, '#b8b098', '#8a8a7a'), 2, 10);
  const tGlowStrip = L.cvs(16, 16, (c) => { const g = c.createLinearGradient(0, 0, 16, 0); g.addColorStop(0, 'rgba(255,214,140,0.95)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const tPlateR = L.cvs(64, 16, (c) => { c.fillStyle = '#2a2a2a'; c.fillRect(0, 0, 64, 16); c.fillStyle = '#d8c070'; c.fillRect(1, 1, 62, 14); c.fillStyle = '#1a1a1a'; c.font = 'bold 9px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RECORDS', 32, 8); });
  const tBoard = L.cvs(48, 32, (c) => { const rr = L.rng(4103); for (let y = 0; y < 32; y++) for (let x = 0; x < 48; x++) px(c, x, y, rgb(170 + rr() * 30, 120 + rr() * 20, 70));
    px(c, 0, 0, '#4a2e18', 48, 2); px(c, 0, 30, '#4a2e18', 48, 2); for (const [x, y, w, h] of [[4, 4, 12, 15], [19, 6, 11, 10], [33, 4, 11, 14], [20, 18, 13, 10]]) { px(c, x, y, '#f0ece0', w, h); px(c, x + w / 2, y, '#c02020', 2, 2); for (let yy = y + 4; yy < y + h - 1; yy += 2) px(c, x + 1, yy, '#8a8a8a', w - 3, 1); }
    c.fillStyle = '#c01818'; c.font = 'bold 5px Tahoma'; c.fillText('MISSING', 5, 9); });
  const tCab = L.cvs(32, 64, (c) => { const rr = L.rng(4104); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = rr() * 8 - 4; px(c, x, y, rgb(120 + n, 128 + n, 120 + n)); }
    for (let k = 0; k < 4; k++) { px(c, 1, k * 16, '#4a524a', 30, 1); px(c, 12, k * 16 + 6, '#d8d8d0', 8, 2); px(c, 11, k * 16 + 3, '#f0ece0', 10, 3); } });
  const tBox = L.cvs(32, 32, (c) => { const rr = L.rng(4105); for (let i = 0; i < 1024; i++) px(c, i % 32, i >> 5, rgb(176 + rr() * 16, 140 + rr() * 12, 96)); px(c, 0, 9, '#8a6a40', 32, 1); px(c, 6, 14, '#f0ece0', 20, 8); c.fillStyle = '#202020'; c.font = 'bold 5px Tahoma'; c.fillText('1997', 9, 20); });
  const tNote = L.cvs(32, 24, (c) => { c.fillStyle = '#f2eee2'; c.fillRect(0, 0, 32, 24); c.fillStyle = '#20307a'; c.font = 'bold 5px Tahoma'; c.fillText('WENT FOR', 2, 7); c.fillText('THE ROOF.', 2, 14); c.fillText('— M.', 14, 21); px(c, 0, 12, 'rgba(0,0,0,0.12)', 32, 1); });
  const tWrap = L.cvs(24, 12, (c) => { c.fillStyle = '#6a2a12'; c.fillRect(0, 0, 24, 12); c.fillStyle = '#e8c040'; c.fillRect(0, 4, 24, 4); c.fillStyle = '#6a2a12'; c.font = 'bold 4px Tahoma'; c.fillText('NUTTY', 6, 8); });
  const tPaper = L.cvs(128, 96, (c) => { c.fillStyle = '#ece4cc'; c.fillRect(0, 0, 128, 96); c.fillStyle = '#b8b098'; c.fillRect(63, 0, 2, 96);   // fold
    c.translate(0, 96); c.rotate(-Math.PI / 2);   // text runs along -z so it reads left->right from the floor camera of 48j
    c.fillStyle = 'rgba(70,90,150,0.4)'; for (let y = 30; y < 128; y += 26) c.fillRect(4, y, 88, 2);
    SHhand(c, 'Sgt.', 12, 52, 4.2, '#1e2a78', 1, 31, 4); SHhand(c, 'Harlan', 8, 104, 3.4, '#1e2a78', 1, 32, 4); });
  // frosted window: redrawn per frame (warm room light + Marla's blurred silhouette + RECORDS lettering)
  const fcv = document.createElement('canvas'); fcv.width = 48; fcv.height = 64; const fc = fcv.getContext('2d');
  const tFrost = L.canvasTex(fcv);
  const fNoise = (() => { const rr = L.rng(4106), a = []; for (let i = 0; i < 400; i++) a.push([rr() * 48 | 0, rr() * 64 | 0, rr() < 0.5]); return a; })();
  function drawFrost(t, { present = 1, near = 0, palm = 0, sway = 0 } = {}) {
    const c = fc; c.filter = 'none';
    const g = c.createRadialGradient(24, 40, 4, 24, 36, 44); g.addColorStop(0, '#fff2d0'); g.addColorStop(1, '#d8b888'); c.fillStyle = g; c.fillRect(0, 0, 48, 64);
    if (present > 0) {
      const talk = marlaTalk(t), s = 1 + near * 0.9, cx = 24 + sway * 4 + Math.sin(t * 1.3) * 1.2, cy = 34 - near * 4 + talk * 0.8;
      c.filter = `blur(${(2.6 - near * 1.6).toFixed(2)}px)`; c.globalAlpha = present * (0.55 + 0.35 * near);
      c.fillStyle = '#2a2018';
      c.beginPath(); c.ellipse(cx + talk * 0.6, cy - 12 * s, 6.5 * s, 8 * s, 0.05 * talk, 0, 7); c.fill();              // head
      c.beginPath(); c.ellipse(cx - 2 * s, cy - 15 * s, 8 * s, 6 * s, 0, 0, 7); c.fill();                              // hair bun side
      c.beginPath(); c.moveTo(cx - 16 * s, 64); c.quadraticCurveTo(cx - 15 * s, cy - 2 * s, cx, cy - 3 * s); c.quadraticCurveTo(cx + 15 * s, cy - 2 * s, cx + 16 * s, 64); c.fill();   // shoulders
      c.filter = 'none'; c.globalAlpha = 1;
    }
    if (palm > 0) {   // palm pressed on the glass: sharp and dark where it touches
      c.globalAlpha = palm; c.fillStyle = '#3a2c1e';
      c.beginPath(); c.ellipse(33, 30, 5, 6, 0.2, 0, 7); c.fill();
      for (const [dx, dy, l] of [[-4, -6, 6], [-1.5, -8, 8], [1.2, -8, 8], [3.6, -6.5, 7], [6, -1, 5]]) { c.save(); c.translate(33 + dx, 30 + dy); c.rotate(dx * 0.06); c.fillRect(-0.9, -l, 1.9, l); c.restore(); }
      c.globalAlpha = 1;
    }
    for (const [x, y, w] of fNoise) { c.fillStyle = w ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)'; c.fillRect(x, y, 1, 1); }
    c.fillStyle = '#1a1208'; c.font = 'bold 7px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RECORDS', 24, 10);   // painted letters
    c.fillStyle = '#c8a040'; c.fillRect(8, 15, 32, 1);
    tFrost.needsUpdate = true;
  }

  // ---------- corridor ----------
  const BG = 0x14161a;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 8, 16);
  scene.add(new THREE.HemisphereLight(0xe0e4ec, 0x5a5040, 1.55));
  const HH = 2.7, Z0 = 3, Z1 = -7, ZM = (Z0 + Z1) / 2, LEN = Z0 - Z1;
  const DZ0 = -1.95, DZ1 = -1.05, DH = 2.1, DZC = (DZ0 + DZ1) / 2;
  const mW = lam(tWall);
  L.plane(2, LEN, lam(tFloor), 0, 0, ZM, scene, 0, -Math.PI / 2);
  L.plane(2, LEN, lam(null, 0xb8b4a8), 0, HH, ZM, scene, 0, Math.PI / 2);
  L.plane(LEN, HH, mW, 1, HH / 2, ZM, scene, -Math.PI / 2);
  const lw = (z0, z1, y0, y1) => L.plane(Math.abs(z1 - z0), y1 - y0, y0 > 0 ? lam(null, 0xd6ccb0) : lam(L.rep(tWall, Math.abs(z1 - z0) / 2.5, 1)), -1, (y0 + y1) / 2, (z0 + z1) / 2, scene, Math.PI / 2, 0);
  lw(DZ1, Z0, 0, HH); lw(Z1, DZ0, 0, HH); lw(DZ0, DZ1, DH, HH);
  L.plane(2, HH, lam(null, 0x8a8478), 0, HH / 2, Z1, scene); L.plane(2, HH, lam(null, 0x8a8478), 0, HH / 2, Z0, scene, Math.PI);
  for (const z of [1.6, -1.6, -4.8]) { K.fluor(scene, 0, HH - 0.03, z, 0.3, 1.2); const p = new THREE.PointLight(0xf0f2ff, 3.0, 6, 1.2); p.position.set(0, 2.4, z); scene.add(p); }
  // door frame, RECORDS plate on the wall, light strip under the door, board + water fountain opposite
  const mFr = lam(K.tWood(4107, '#5a3a22'));
  B(0.12, DH + 0.08, 0.07, mFr, -1, (DH + 0.08) / 2, DZ0 - 0.035, scene); B(0.12, DH + 0.08, 0.07, mFr, -1, (DH + 0.08) / 2, DZ1 + 0.035, scene); B(0.12, 0.08, DZ1 - DZ0 + 0.14, mFr, -1, DH + 0.04, DZC, scene);
  L.plane(0.42, 0.1, lam(tPlateR), -0.99, 1.62, DZ1 + 0.38, scene, Math.PI / 2);
  const strip = L.plane(0.6, DZ1 - DZ0 - 0.06, basic(tGlowStrip, 0xffe8b0, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), -0.7, 0.004, DZC, scene, 0, -Math.PI / 2);
  L.plane(0.9, 0.6, lam(tBoard), 0.99, 1.5, -2.4, scene, -Math.PI / 2);
  { B(0.36, 0.3, 0.3, lam(K.tMetal(4108, '#b8bcc0')), 0.84, 0.9, 0.2, scene); B(0.1, 0.75, 0.12, lam(null, 0x8a8e92), 0.9, 0.38, 0.2, scene); }
  // ---------- records room ----------
  const RX0 = -4.6, RZ0 = -3.6, RZ1 = 0.6;
  { const m = lam(L.rep(K.tBlock(4109, '#8a7a5e', '#d8ccb0', 26), 2, 1.4));
    L.plane(RZ1 - RZ0, HH, m, RX0, HH / 2, (RZ0 + RZ1) / 2, scene, Math.PI / 2);
    L.plane(-1 - RX0, HH, m, (RX0 - 1) / 2, HH / 2, RZ0, scene); L.plane(-1 - RX0, HH, m, (RX0 - 1) / 2, HH / 2, RZ1, scene, Math.PI);
    L.plane(-1 - RX0, RZ1 - RZ0, lam(L.rep(K.tTile(4110, '#a89878', '#7a6a58'), 3, 3)), (RX0 - 1) / 2, 0.001, (RZ0 + RZ1) / 2, scene, 0, -Math.PI / 2);
    L.plane(-1 - RX0, RZ1 - RZ0, lam(null, 0xb0a890), (RX0 - 1) / 2, HH, (RZ0 + RZ1) / 2, scene, 0, Math.PI / 2); }
  // inner face of the corridor wall, around the door hole
  { const m = lam(L.rep(K.tBlock(4109, '#8a7a5e', '#d8ccb0', 26), 1, 1.4));
    const iw = (z0, z1, y0, y1) => L.plane(z1 - z0, y1 - y0, m, -1.01, (y0 + y1) / 2, (z0 + z1) / 2, scene, -Math.PI / 2);
    iw(RZ0, DZ0, 0, HH); iw(DZ1, RZ1, 0, HH); iw(DZ0, DZ1, DH, HH); }
  { const lamp = new THREE.PointLight(0xffc888, 5, 5, 1.2); lamp.position.set(-3.2, 1.4, -2.4); scene.add(lamp); const doorL = new THREE.PointLight(0xffd8a0, 3, 2.5, 1.3); doorL.position.set(-1.5, 0.5, DZC); scene.add(doorL); }
  for (let k = 0; k < 4; k++) { const g = B(0.5, 1.35, 0.62, lam(tCab), RX0 + 0.32, 0.675, -3.1 + k * 0.62 + 0.1, scene); g.rotation.y = Math.PI / 2; }
  for (const [x, z, ry, h] of [[-2.0, -3.25, 0.2, 0], [-2.35, -3.3, -0.1, 0], [-2.15, -3.25, 0.1, 0.32], [-1.45, 0.3, 0.4, 0]]) { const b = B(0.4, 0.32, 0.32, lam(tBox), x, 0.16 + h, z, scene); b.rotation.y = ry; }
  // desk + lamp + chair pushed back + the note
  const DESK = V(-3.25, 0, -1.7);
  B(0.7, 0.04, 1.3, lam(K.tWood(4111, '#7a5232')), DESK.x, 0.76, DESK.z, scene); B(0.66, 0.72, 0.04, lam(K.tWood(4111, '#6a4428')), DESK.x, 0.37, DESK.z - 0.62, scene); B(0.66, 0.72, 0.04, lam(K.tWood(4111, '#6a4428')), DESK.x, 0.37, DESK.z + 0.62, scene);
  { cyl(0.07, 0.08, 0.02, 8, lam(null, 0x2a5a2a), DESK.x - 0.15, 0.79, DESK.z - 0.45, scene); cyl(0.008, 0.008, 0.3, 4, lam(null, 0xb8a050), DESK.x - 0.15, 0.94, DESK.z - 0.45, scene); cyl(0.04, 0.09, 0.1, 8, lam(null, 0x2a5a2a), DESK.x - 0.1, 1.08, DESK.z - 0.45, scene); L.mesh(new THREE.SphereGeometry(0.03, 6, 4), basic(null, 0xfff0c0), DESK.x - 0.1, 1.04, DESK.z - 0.45, scene); }
  for (let k = 0; k < 4; k++) B(0.24, 0.02, 0.3, lam(null, 0xece8dc), DESK.x - 0.1 + k * 0.02, 0.79 + k * 0.02, DESK.z + 0.35, scene).rotation.y = k * 0.2;
  const NOTE = V(DESK.x + 0.12, 0.783, DESK.z - 0.05);
  L.plane(0.2, 0.15, lam(tNote), NOTE.x, NOTE.y, NOTE.z, scene, 0, -Math.PI / 2).rotation.z = Math.PI / 2 + 0.2;
  { const g = new THREE.Group(); g.position.set(DESK.x + 0.75, 0, DESK.z + 0.35); g.rotation.y = -1.0; scene.add(g); const m = lam(null, 0x3a3a40);
    B(0.44, 0.06, 0.44, m, 0, 0.46, 0, g); B(0.44, 0.45, 0.05, m, 0, 0.75, -0.2, g); cyl(0.025, 0.025, 0.42, 5, lam(null, 0x8a8a8a), 0, 0.22, 0, g); }
  // ---------- the door (hinge at z = DZ1, leaf toward -z; opens into the room) ----------
  const hinge = new THREE.Group(); hinge.position.set(-1, 0, DZ1 - 0.02); scene.add(hinge);
  const leafW = DZ1 - DZ0 - 0.04;
  { const mD = lam(K.tWood(4112, '#8a5a32')), mE = lam(null, 0x6a4428);
    B(0.045, 0.98, leafW, mD, 0, 0.5, -leafW / 2, hinge); B(0.045, DH - 1.88, leafW, mD, 0, DH - 0.11, -leafW / 2, hinge);
    B(0.045, 0.9, 0.12, mD, 0, 1.43, -0.06, hinge); B(0.045, 0.9, 0.12, mD, 0, 1.43, -leafW + 0.06, hinge);
    L.plane(leafW - 0.24, 0.9, basic(tFrost, 0xffffff, { side: DS }), 0, 1.43, -leafW / 2, hinge, Math.PI / 2);
    B(0.06, 0.03, 0.12, lam(null, 0xc8b060), 0.04, 1.0, -leafW + 0.1, hinge); B(0.06, 0.03, 0.12, lam(null, 0xc8b060), -0.04, 1.0, -leafW + 0.1, hinge);
    void mE; }
  // ---------- props that move ----------
  const bars = [0, 1].map(() => { const g = new THREE.Group(); scene.add(g); B(0.16, 0.02, 0.06, [lam(null, 0x4a1a0a), lam(null, 0x4a1a0a), basic(tWrap), lam(null, 0x4a1a0a), lam(null, 0x4a1a0a), lam(null, 0x4a1a0a)], 0, 0.008, 0, g); return g; });
  const paper = new THREE.Group(); scene.add(paper); B(0.24, 0.006, 0.18, [lam(null, 0xd8d4c8), lam(null, 0xd8d4c8), lam(tPaper), lam(null, 0xd8d4c8), lam(null, 0xd8d4c8), lam(null, 0xd8d4c8)], 0, 0.004, 0, paper);

  // ---------- Ava ----------
  const ch = L.hero(); scene.add(ch.root);
  const AVD = V(-0.38, 0, -1.48);   // her spot facing the door
  // procedural right-arm reach (hand on the door handle): elbow bend solved for the distance, upper arm swung onto the
  // target, twisted so the elbow hangs down. unreach() BEFORE ch.pose (the mixer skips bones whose clip value is unchanged).
  const RC = (() => {
    const UA = ch.bone.getObjectByName('UpperArmR'), FA = ch.bone.getObjectByName('ForearmR'), HD = ch.bone.getObjectByName('HandR');
    const rUA = UA.quaternion.clone(), rFA = FA.quaternion.clone(), rHD = HD.quaternion.clone();
    const X = V(1, 0, 0), q = new THREE.Quaternion();
    let saved = null;
    const wp = (o) => o.getWorldPosition(V());
    const swingUA = (R) => { const qw = UA.getWorldQuaternion(new THREE.Quaternion()), pw = UA.parent.getWorldQuaternion(new THREE.Quaternion()); UA.quaternion.copy(pw.invert().multiply(R.multiply(qw))); UA.updateMatrixWorld(true); };
    return {
      unreach() { if (saved) { UA.quaternion.copy(saved[0]); FA.quaternion.copy(saved[1]); HD.quaternion.copy(saved[2]); saved = null; } },
      reach(target, w = 1) {
        if (w <= 0) return;
        saved = [UA.quaternion.clone(), FA.quaternion.clone(), HD.quaternion.clone()];
        ch.root.updateMatrixWorld(true);
        UA.quaternion.copy(rUA); HD.quaternion.copy(rHD); UA.updateMatrixWorld(true);
        const sh = wp(UA), want = target.distanceTo(sh);
        let best = 0, be = 1e9;
        for (let i = 0; i <= 40; i++) { const b = -2.2 + i * 0.06; FA.quaternion.copy(rFA).multiply(q.setFromAxisAngle(X, b)); UA.updateMatrixWorld(true); const e = Math.abs(wp(HD).distanceTo(sh) - want); if (e < be) { be = e; best = b; } }
        FA.quaternion.copy(rFA).multiply(q.setFromAxisAngle(X, best)); UA.updateMatrixWorld(true);
        const dir = target.clone().sub(sh).normalize();
        swingUA(new THREE.Quaternion().setFromUnitVectors(wp(HD).sub(sh).normalize(), dir));
        // twist about the shoulder->target axis: elbow as low as possible
        let bt = 0, by = 1e9; const base = UA.quaternion.clone();
        for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; UA.quaternion.copy(base); swingUA(new THREE.Quaternion().setFromAxisAngle(dir, a)); const y = wp(FA).y; if (y < by) { by = y; bt = a; } }
        UA.quaternion.copy(base); swingUA(new THREE.Quaternion().setFromAxisAngle(dir, bt));
        if (w < 1) { UA.quaternion.slerpQuaternions(saved[0], UA.quaternion.clone(), w); FA.quaternion.slerpQuaternions(saved[1], FA.quaternion.clone(), w); HD.quaternion.slerpQuaternions(saved[2], HD.quaternion.clone(), w); }
        ch.root.updateMatrixWorld(true);
      },
    };
  })();
  const reset = () => { RC.unreach(); ch.root.visible = true; hinge.rotation.y = 0; strip.visible = true; for (const b of bars) b.visible = false; paper.visible = false; };
  const out = {};

  // ---- 48h: fixed LOW angle down the corridor; Ava walks toward camera past the light under the door, stops on "whispers"
  {
    const c = cam(44);
    out['48h_records'] = { scene, camera: c, update(lt, t) {
      reset(); drawFrost(t, { present: 0.7 });
      const w = r.walk48h, p = w.at(t), ts = w.t1 - r.t48h;
      const turn = L.smooth((t - w.t1) / 0.45);
      ch.root.position.set(p.x, 0, p.z); ch.root.rotation.y = w.at(w.t0 + 0.01).yaw + turn * (-Math.PI / 2 - w.at(w.t0 + 0.01).yaw) * 0.85;
      ch.pose(lt, [w.seg(r.t48h), L.seg('idle', ts, { fade: 0.25, loop: true })], [[-99, 'open', mouthAt(t, 'neutral')], [ts, 'surprised', mouthAt(t, 'neutral')], [ts + 0.7, 'sad', mouthAt(t, 'neutral')]]);
      look(c, V(0.62, 0.32, -4.9), V(-0.35, 0.95, 0.4));
    }, overlay: (lt, dt, a, o) => vignette(o, 0.42) };
  }

  // ---- 48i: over the shoulder at the glass on Marla's lines (v2, v3b) <-> frontal by the door on Ava's lines (v3, v4)
  {
    const cO = cam(40), cF = cam(40);
    const shot = { scene, camera: cO, update(lt, t) {
      reset();
      const front = (t >= r.v3 - 0.08 && t < r.v3b - 0.08) || t >= r.v4 - 0.08;
      drawFrost(t, { present: 1, near: t >= r.v3b - 0.08 && t < r.v4 ? 0.3 : 0.12, sway: Math.sin(t * 0.7) });
      ch.root.position.copy(AVD); ch.root.rotation.y = -Math.PI / 2;
      const tn = r.nine - r.t48i, tb = r.blame - r.t48i, t3 = r.v3 - r.t48i, t4 = r.v4 - r.t48i;
      ch.pose(lt, [L.seg('idle', -9, { loop: true }), L.seg('talk_gesture', t3, { fade: 0.25, loop: true }), L.seg('shrug', tn - 0.3, { fade: 0.2 }), L.seg('idle', r.v3b - r.t48i - 0.1, { fade: 0.3, loop: true }),
        L.seg('talk_gesture', t4, { fade: 0.25, loop: true }), L.seg('shrug', tb - 0.35, { fade: 0.2 })],
        // Marla whispers in fear -> Ava worried and attentive (sad eyes, frown); her own lines serious, eyes open; only a
        // small reassuring smile on the lighter bit ("so you trade, the old way"). Never closed eyes here.
        [[-99, 'sad', mouthAt(t, 'frown')], [t3, 'open', mouthAt(t, 'neutral')], [tn, 'sad', mouthAt(t, 'neutral')], [r.v3b - r.t48i, 'sad', mouthAt(t, 'frown')],
          [t4, 'open', mouthAt(t, 'neutral')], [tb, 'sad', mouthAt(t, 'neutral')], [r.trade - r.t48i, 'open', mouthAt(t, 'smile')]]);
      this.camera = front ? cF : cO;
      if (front) { look(cF, V(-0.82, 1.42, -2.5), V(-0.36, 1.42, -1.42)); ch.lookAt(cF, 1, 45); }
      else { const near = t >= r.v3b - 0.08 ? L.smooth((t - r.v3b) / 4) : 0; look(cO, V(0.42, 1.66, -2.3).lerp(V(0.15, 1.62, -2.1), near), V(-1.0, 1.4, -1.45)); }
    }, overlay: (lt, dt, a, o) => vignette(o, 0.4) };
    out['48i_door_talk'] = shot;
  }

  // ---- 48j: floor level; two candy bars slide under the door on "candy", a folded note slides back on "sheet"; RE trade box
  {
    const c = cam(42);
    out['48j_trade'] = { scene, camera: c, update(lt, t) {
      reset(); drawFrost(t, { present: 1, near: 0.1 });
      ch.root.position.set(-0.3, 0, -1.25); ch.root.rotation.y = -Math.PI / 2;
      const tk = r.candy - r.t48j - 1.4;
      ch.pose(lt, [L.seg('idle', -9, { loop: true }), L.seg('kneel', tk, { fade: 0.2 })], [[-99, 'open', mouthAt(t, 'neutral')], [r.sheet - r.t48j + 0.3, 'open', mouthAt(t, 'smile')]]);
      [r.candy, r.candy2].forEach((tc, i) => { const b = bars[i], u = (t - tc + 0.35) / 0.55; b.visible = u > -0.6 && u < 1.05;
        const x = -0.62 - 0.62 * L.smooth(u); b.position.set(x, 0, DZC + 0.1 - i * 0.18); b.rotation.y = 0.3 - i * 0.5; });
      { const u = L.smooth((t - r.sheet) / 0.7); paper.visible = t > r.sheet - 0.05; paper.position.set(-1.12 + 0.68 * u, 0, DZC - 0.15 * u - 0.05); paper.rotation.y = 0.4 - 0.25 * u; }
      look(c, V(0.1, 0.2, -2.2), V(-0.95, 0.05, -1.5));
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.45);
      // RE trade box (right side, clear of the candy / paper on the floor and of the caption): CANDY BAR x2 -> NOTE
      const k1 = pop(lt, r.candy - r.t48j, 0.12), k2 = pop(lt, r.sheet - r.t48j, 0.12), k3 = pop(lt, r.sheet + 0.7 - r.t48j, 0.15); if (k1 <= 0) return;
      const cx = o.tctx, X = 398, Y = 86, W = 232, H = 198, prevS = cx.imageSmoothingEnabled; cx.imageSmoothingEnabled = false;
      cx.save(); cx.globalAlpha = k1;
      cx.fillStyle = 'rgba(4,6,14,0.92)'; cx.fillRect(X, Y, W, H);
      cx.fillStyle = '#8a90a8'; cx.fillRect(X, Y, W, 1); cx.fillRect(X, Y, 1, H); cx.fillStyle = '#22242c'; cx.fillRect(X, Y + H - 1, W, 1); cx.fillRect(X + W - 1, Y, 1, H);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(X + 3.5, Y + 3.5, W - 7, H - 7);
      cx.fillStyle = '#141c4a'; cx.fillRect(X + 5, Y + 5, W - 10, 18); bitText(cx, 'TRADE', X + W / 2, Y + 14, 2, '#9cf09c', { outline: null });
      const slot = (sx, sy, sw, sh, on) => { cx.fillStyle = on ? '#16203c' : '#0a0e1a'; cx.fillRect(sx, sy, sw, sh); cx.strokeStyle = on ? '#e8d070' : '#3a3e52'; cx.lineWidth = 1; cx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1); };
      // give: two candy bars (pixel icon)
      slot(X + 10, Y + 30, 132, 52, true);
      for (const [dx, dy] of [[0, 0], [10, 18]]) { const bx = X + 28 + dx, by = Y + 38 + dy;
        cx.fillStyle = '#000000'; cx.fillRect(bx - 1, by - 1, 82, 18); cx.fillStyle = '#c8c0b0'; cx.fillRect(bx, by + 1, 5, 14); cx.fillRect(bx + 75, by + 1, 5, 14);
        cx.fillStyle = '#6a2a12'; cx.fillRect(bx + 5, by, 70, 16); cx.fillStyle = '#e8c040'; cx.fillRect(bx + 5, by + 5, 70, 6); cx.fillStyle = '#8a3a1a'; cx.fillRect(bx + 5, by, 70, 2);
        bitText(cx, 'NUTTY', bx + 40, by + 8, 1, '#5a1a08', { outline: null }); }
      bitText(cx, 'CANDY', X + 188, Y + 46, 2, '#ececec', { outline: '#000000' }); bitText(cx, 'BAR x2', X + 188, Y + 66, 2, '#ececec', { outline: '#000000' });
      // arrow (lights up when the note comes back)
      { const ac = k2 > 0 ? '#e8d070' : '#3a3e52', ax = X + 76, ay = Y + 87; cx.fillStyle = ac; cx.fillRect(ax - 3, ay, 7, 6); for (let i = 0; i < 8; i++) cx.fillRect(ax - 8 + i, ay + 6 + i, 17 - 2 * i, 1); }
      // get: the note (folded on 'sheet', opens on the unfold sound) — hand-lettered, readable
      const nx = X + 10, ny = Y + 104, nw = 132, nh = 86; slot(nx, ny, nw, nh, k2 > 0);
      if (k2 > 0) {
        const fw = Math.round(60 + (nw - 12 - 60) * k3), fx = nx + Math.round((nw - fw) / 2), fy = ny + 6, fh = nh - 12;
        cx.fillStyle = '#000000'; cx.fillRect(fx + 2, fy + 2, fw, fh); cx.fillStyle = '#ece4cc'; cx.fillRect(fx, fy, fw, fh);
        cx.fillStyle = 'rgba(70,90,150,0.35)'; for (let yy = fy + 23; yy < fy + fh - 4; yy += 20) cx.fillRect(fx + 3, yy, fw - 6, 1);
        if (k3 < 1) { cx.fillStyle = '#b8b098'; cx.fillRect(fx + fw - 2, fy, 2, fh); SHhand(cx, 'Sgt.', fx + 8, fy + 22, 2.4, '#1e2a78', 1, 31, 2); SHhand(cx, 'Harlan', fx + 5, fy + 42, 2.2, '#1e2a78', 1, 32, 2); }
        else { cx.fillStyle = 'rgba(0,0,0,0.18)'; cx.fillRect(fx + fw / 2, fy, 1, fh);
          SHhand(cx, 'Set the', fx + 7, fy + 21, 2.4, '#1e2a78', 1, 33, 2); SHhand(cx, 'evidence', fx + 7, fy + 41, 2.4, '#1e2a78', 1, 34, 2); SHhand(cx, 'locker...', fx + 7, fy + 61, 2.4, '#1e2a78', 1, 35, 2); }
      }
      if (k2 > 0) { bitText(cx, "SGT'S", X + 188, Y + 136, 2, '#c8ccd8', { outline: '#000000' }); bitText(cx, 'NOTE', X + 188, Y + 156, 2, '#8cff5a', { outline: '#000000' }); }
      else bitText(cx, '???', X + 188, Y + 146, 2, '#5a5e70', { outline: '#000000' });
      cx.restore(); cx.imageSmoothingEnabled = prevS;
    } };
  }

  // ---- 48k: slow push-in to the frosted glass; on "radio" the silhouette is right at the glass, palm pressed on it
  {
    const c = cam(40);
    out['48k_radio_warn'] = { scene, camera: c, update(lt, t) {
      reset(); ch.root.visible = false;
      const tr = r.radio - r.t48k, near = L.smooth((t - r.whatever + 0.4) / (r.radio - r.whatever + 0.4));
      drawFrost(t, { present: 1, near: 0.1 + 0.85 * near, palm: L.smooth((lt - tr) / 0.08) });
      const u = L.smooth(lt / (r.t48l - r.t48k));
      look(c, V(0.65, 1.5, -1.5).lerp(V(-0.35, 1.45, -1.5), u), V(-1.0, 1.44, -1.5));
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5, 0.22) };
  }

  // ---- 48l: fixed high corner inside the empty records room (back-left, the open leaf never between camera and doorway);
  // her shadow on the frosted glass, hand on the handle, the leaf swings in, she walks in through the middle of the opening
  // (z = -1.6, 0.45 m clear of the open leaf), note label on "gone"
  {
    const c = cam(46);
    const HANDLE = V(0.07, 1.0, -leafW + 0.1);   // corridor-side lever, hinge space
    out['48l_gone'] = { scene, camera: c, update(lt, t) {
      reset(); strip.visible = false;
      const ang = 1.75 * L.smooth((t - r.contact48l) / 1.3);
      hinge.rotation.y = ang;
      drawFrost(t, { present: ang < 0.05 ? 0.45 * L.smooth((t - r.push48l + 0.7) / 0.5) : 0, near: 0.25 });
      const w = r.walk48l, p = w.at(t), ts = w.t1 - r.t48l;
      ch.root.position.set(p.x, 0, p.z); ch.root.rotation.y = -Math.PI / 2;
      ch.pose(lt, [L.seg('idle', -9, { loop: true }), w.seg(r.t48l, { fade: 0.2 }), L.seg('look_around', ts, { fade: 0.25 })], [[-99, 'open', mouthAt(t, 'neutral')], [r.gone - r.t48l, 'sad', mouthAt(t, 'frown')]]);
      // right hand on the lever from push48l, follows it while she steps in with the swinging leaf, lets go at ~0.5 rad
      const wr = Math.min(L.smooth((t - r.push48l) / 0.35), 1 - L.smooth((t - r.contact48l - 0.4) / 0.25));
      if (wr > 0) { hinge.updateMatrixWorld(true); RC.reach(hinge.localToWorld(HANDLE.clone()), wr); }
      look(c, V(-4.3, 2.35, -3.35), V(-1.9, 0.85, -1.25));
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.4);
      const k = pop(lt, r.gone - r.t48l);
      if (k > 0) { const [x, y] = L.toScreen(o.camera, NOTE.x, NOTE.y, NOTE.z); label(o, 'WENT FOR THE ROOF.\n— M.', 470, 96, '#ffd23f', [x, y], k, 2); }
    } };
  }
  return out;
}
