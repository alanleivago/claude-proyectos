// sets/breakroom.js — the station break room (chapter 11:05 PM, food): two lit snack vending machines, counter with the
// coffee maker (OFF, unplugged), table and chairs. Shots: 36b_breakroom (fixed high through the doorway -> fixed high
// back-right corner when Ava crosses into the room; she taps the glass on "tempered"), 36c_vending (low 3/4 angle beside
// the machine: towel over the glass, chair hit on "chair" cracks only the glass,
// 2nd hit on "glass" -> the glass gives way; wink at camera on "in"), 36f_coffee (coffee maker OFF in the foreground,
// Ava behind with the empty mug, sad/cute face at camera on "hurts"). Contract: SETS.md.
// World: room x [-3, 3], z [-2.2, 2.2], ceiling 2.7. Machines against the back wall (front faces at z = -1.35) at x = -0.55
// (red, SNACKS) and x = 0.55 (blue, CHIPS & CANDY). Doorway in the front wall z = 2.2, x [-2.2, -1.2]. Counter on the left
// wall (x -3..-2.4), coffee maker at (-2.68, 0.92, -0.35).
import { kit, walker } from './r2kit.js';

function BRtimes(ctx) {
  const { T, at } = ctx;
  const r = {
    t36b: T['36b_breakroom'], t36c: T['36c_vending'], t36f: T['36f_coffee'], end36b: T['36c_vending'], end36f: T['card_c1130'] ?? T['36f_coffee'] + 4.4,
    vending: at('fo1', 'vending'), glass1: at('fo1', 'glass'), tempered: at('fo1', 'tempered'),
    chair: at('fo2', 'chair'), towel: at('fo2', 'towel'), glass2: at('fo2', 'glass'), in: at('fo2', 'in'),
    off: at('fo6', 'off'), honestly: at('fo6', 'honestly'), hurts: at('fo6', 'hurts'), zombies: at('fo6', 'zombies'),
  };
  // 36b walk: already walking at the cut (she enters through the door), stops in front of the red machine
  r.walk = walker([[-1.72, 2.55], [-1.45, 1.35], [-0.52, -0.62]], r.t36b - 0.45, 1.4);
  r.cutB = r.t36b + 1.25;            // corner camera once she is inside (past the door frame)
  r.knock = r.tempered - 0.29;       // knock clip: knuckles hit the glass at clip 0.29 and 0.50
  // 36c: hammer clip impact at clip 0.30
  r.hit1 = r.chair; r.hit2 = r.glass2;
  return r;
}

export function sfx(ctx) {
  const r = BRtimes(ctx), out = [];
  out.push([r.t36b, 'vending_hum_loop'], [r.t36b + 0.02, 'fluorescent_buzz_loop']);
  out.push(...r.walk.steps('step_walk', r.t36b, r.knock));
  out.push([r.knock + 0.29, 'glass_tap'], [r.knock + 0.50, 'glass_tap'], [r.tempered + 0.02, 'label']);
  // 36c
  out.push([r.t36c, 'vending_hum_loop'], [r.t36c + 0.05, 'towel_rustle'], [r.hit1 - 0.16, 'chair_swoosh'], [r.hit1, 'chair_hit'], [r.hit1 + 0.01, 'vending_glass_crack'],
    [r.towel, 'towel_rustle'], [r.hit2 - 0.16, 'chair_swoosh'], [r.hit2, 'chair_hit'], [r.hit2 + 0.01, 'vending_glass_break'], [r.hit2 + 0.35, 'glass_shards_fall'],
    [r.hit2 + 0.5, 'towel_drop'], [r.hit2 + 0.62, 'chair_set_down'], [r.in, 'cute_wink']);
  // 36f
  out.push([r.t36f, 'fridge_hum_loop'], [r.t36f + 0.3, 'mug_handle'], [r.hurts, 'sad_sting']);
  return out.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L } = ctx;
  const K = kit(ctx), { THREE, V, px, rgb, hexRGB, B, cyl, lam, basic, DS, mouthAt, cam, look, vignette, label, pop } = K;
  const r = BRtimes(ctx);

  // ---------- textures ----------
  const tWall = L.rep(K.tBlock(2101, '#5e7a68', '#d8d2bc', 26), 4, 2.4);
  const tFloor = L.rep(K.tTile(2102, '#c8c0a8', '#8e9088'), 5, 4);
  const WRAP = [['#6a2a12', '#e8c040', 'NUTTY'], ['#1a1a1a', '#e83020', 'MAX'], ['#3a1a0e', '#f0e8d8', 'COCO'], ['#c82020', '#ffffff', 'KRUNCH'],
    ['#e8d030', '#7a2a10', 'BAR'], ['#2a4ab0', '#ffffff', 'NOUGAT'], ['#3a8a3a', '#f0e070', 'MINT'], ['#7a3ab0', '#ffe0f0', 'GUMMY']];
  const tWrap = WRAP.map(([bg, fg, s], i) => L.cvs(24, 32, (c) => {
    const rr = L.rng(2110 + i); c.fillStyle = bg; c.fillRect(0, 0, 24, 32);
    c.fillStyle = fg; c.fillRect(0, 11, 24, 9); c.fillStyle = bg; c.font = 'bold 7px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 12, 16);
    c.fillStyle = fg; c.fillRect(3, 24, 18, 2); c.fillRect(6, 4, 12, 3);
    for (let k = 0; k < 6; k++) px(c, rr() * 22 | 0, rr() * 30 | 0, 'rgba(255,255,255,0.25)', 1, 2);   // crinkle highlights
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, 0, 24, 1); c.fillRect(0, 31, 24, 1);
  }));
  const CHIPS = [['#f0c020', '#c02018', 'CHIPS'], ['#2a6ad0', '#f0f0f0', 'SALT'], ['#c02818', '#f0d040', 'BBQ'], ['#28a048', '#f0f0e0', 'SOUR'], ['#e87818', '#5a1a0a', 'CHEEZ']];
  const tChips = CHIPS.map(([bg, fg, s], i) => L.cvs(24, 36, (c) => {
    const g = c.createLinearGradient(0, 0, 24, 0); g.addColorStop(0, bg); g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.55, bg); g.addColorStop(1, bg);
    c.fillStyle = bg; c.fillRect(0, 0, 24, 36); c.globalAlpha = 0.25; c.fillStyle = g; c.fillRect(0, 0, 24, 36); c.globalAlpha = 1;
    c.fillStyle = fg; c.font = 'bold 7px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 12, 9);
    c.fillStyle = '#f0c868'; c.beginPath(); c.ellipse(12, 23, 7, 6, 0, 0, 7); c.fill(); c.fillStyle = '#d89838'; c.fillRect(8, 22, 3, 2); c.fillRect(13, 25, 3, 2);
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = 0; x < 24; x += 2) { c.fillRect(x, 0, 1, 2); c.fillRect(x, 34, 1, 2); }
  }));
  const tPanel = (brand, col) => L.cvs(32, 96, (c) => {   // right-hand keypad panel
    const rr = L.rng(2120); for (let y = 0; y < 96; y++) for (let x = 0; x < 32; x++) { const n = rr() * 8 - 4; px(c, x, y, rgb(52 + n, 54 + n, 60 + n)); }
    px(c, 4, 6, '#051a08', 24, 9); c.fillStyle = '#3aff5a'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$1.25', 16, 11);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { px(c, 5 + i * 8, 20 + j * 7, '#d8d8d0', 6, 5); px(c, 5 + i * 8, 24 + j * 7, '#8a8a84', 6, 1); }
    px(c, 12, 50, '#c8ccd0', 8, 6); px(c, 15, 51, '#101010', 2, 4);                                // coin slot
    px(c, 6, 59, '#101010', 20, 4); px(c, 8, 60, '#3aff5a', 2, 2); px(c, 22, 60, '#3aff5a', 2, 2);   // bill acceptor
    px(c, 10, 70, '#202020', 12, 7); px(c, 11, 71, '#8a8a84', 10, 1);                               // coin return
    c.save(); c.translate(16, 88); c.fillStyle = col; c.fillRect(-14, -6, 28, 12); c.fillStyle = '#ffffff'; c.font = 'bold 8px Tahoma'; c.fillText(brand, 0, 1); c.restore();
  });
  const tPrice = L.cvs(64, 4, (c) => { c.fillStyle = '#f0f0e8'; c.fillRect(0, 0, 64, 4); c.fillStyle = '#202020'; for (let i = 0; i < 5; i++) { c.fillRect(i * 13 + 3, 1, 4, 2); } });
  const tTowel = L.cvs(32, 40, (c) => {   // light-blue terry towel, white stripes, loops
    const rr = L.rng(2130);
    for (let y = 0; y < 40; y++) for (let x = 0; x < 32; x++) { const n = rr() * 22 - 11; const st = (y > 5 && y < 8) || (y > 31 && y < 34); px(c, x, y, st ? rgb(236 + n / 2, 236 + n / 2, 230) : rgb(30 + n, 104 + n, 150 + n)); }
    px(c, 0, 38, '#e8e8e0', 32, 2);
  });
  const tCrack = L.cvs(128, 128, (c) => {   // spider-web crack around the impact (alpha)
    // drawn twice: a dark under-line (reads over the bright lit interior), then the white fracture line on top
    for (const [col, o, lw] of [['rgba(20,26,34,0.75)', 1, 2], ['rgba(235,245,255,0.95)', 0, 1]]) {
      const rr = L.rng(2131), cx = 64 + o, cy = 64 + o;
      c.strokeStyle = col; c.lineWidth = lw;
      const rays = [];
      for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283 + rr() * 0.35, l = 30 + rr() * 34; let x = cx, y = cy; const p = [[x, y]]; c.beginPath(); c.moveTo(x, y);
        for (let s = 1; s <= 6; s++) { const d = l * s / 6; x = cx + Math.cos(a + (rr() - 0.5) * 0.25) * d; y = cy + Math.sin(a + (rr() - 0.5) * 0.25) * d; c.lineTo(x, y); p.push([x, y]); } c.stroke(); rays.push(p); }
      for (const ring of [2, 4]) { c.beginPath(); rays.forEach((p, i) => { const q = p[Math.min(ring, p.length - 1)]; i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.stroke(); }
      if (o) continue;
      c.fillStyle = 'rgba(240,250,255,0.85)'; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 0; k < 40; k++) c.fillRect(cx - 9 + rr() * 18, cy - 9 + rr() * 18, 1, 1);
    }
  });
  const tGlassRef = L.cvs(32, 64, (c) => { c.fillStyle = 'rgba(200,220,255,0.10)'; c.fillRect(0, 0, 32, 64); c.fillStyle = 'rgba(255,255,255,0.22)'; for (let y = 0; y < 64; y++) { c.fillRect(4 + y * 0.25, y, 2, 1); c.fillRect(14 + y * 0.25, y, 1, 1); } });
  const tBoard = L.cvs(48, 32, (c) => {   // cork notice board
    const rr = L.rng(2140); for (let y = 0; y < 32; y++) for (let x = 0; x < 48; x++) px(c, x, y, rgb(170 + rr() * 30, 120 + rr() * 20, 70));
    px(c, 0, 0, '#5a3a1a', 48, 2); px(c, 0, 30, '#5a3a1a', 48, 2); px(c, 0, 0, '#5a3a1a', 2, 32); px(c, 46, 0, '#5a3a1a', 2, 32);
    for (const [x, y, w, h, col] of [[5, 5, 12, 14, '#f0f0e8'], [20, 4, 10, 8, '#f0e070'], [33, 6, 10, 13, '#e8f0ff'], [19, 15, 12, 12, '#f0f0e8']]) { px(c, x, y, col, w, h); px(c, x + w / 2 - 1, y, '#c02020', 2, 2); for (let yy = y + 4; yy < y + h - 1; yy += 2) px(c, x + 1, yy, '#8a8a8a', w - 3, 1); }
  });
  const tClock = L.cvs(32, 32, (c) => { c.fillStyle = '#202020'; c.beginPath(); c.arc(16, 16, 15.5, 0, 7); c.fill(); c.fillStyle = '#f4f2ea'; c.beginPath(); c.arc(16, 16, 13.5, 0, 7); c.fill(); c.fillStyle = '#202020'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; c.fillRect(16 + Math.cos(a) * 11 - 0.5, 16 + Math.sin(a) * 11 - 0.5, 1.5, 1.5); }
    c.strokeStyle = '#101010'; c.lineWidth = 2; c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.cos(-Math.PI / 2 + 11 / 12 * 6.283) * 7, 16 + Math.sin(-Math.PI / 2 + 11 / 12 * 6.283) * 7); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.cos(-Math.PI / 2 + 0.083 * 6.283) * 11, 16 + Math.sin(-Math.PI / 2 + 0.083 * 6.283) * 11); c.stroke(); });
  const tMug = L.cvs(32, 16, (c) => { c.fillStyle = '#f0ece0'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#1a2a6a'; c.font = 'bold 5px Tahoma'; c.textAlign = 'center'; c.fillText("WORLD'S", 16, 5); c.fillText('OKAYEST', 16, 10); c.fillText('COP', 16, 15); });
  const tSticky = L.cvs(16, 16, (c) => { c.fillStyle = '#f4e44a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#d8c838'; c.fillRect(0, 0, 16, 2); c.fillStyle = '#c01818'; c.font = 'bold 6px Tahoma'; c.textAlign = 'center'; c.fillText('RULE', 8, 8); c.fillText('3 :(', 8, 14); });

  // ---------- the room ----------
  const BG = 0x1a1c20;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 9, 18);
  scene.add(new THREE.HemisphereLight(0xe8ecf0, 0x6a6458, 1.9));
  { const d = new THREE.DirectionalLight(0xfff4e0, 0.7); d.position.set(1, 3, 2); scene.add(d); }
  const RX = 3, RZ = 2.2, HH = 2.7;
  const mWall = lam(tWall);
  L.plane(2 * RX, HH, mWall, 0, HH / 2, -RZ, scene);
  L.plane(2 * RZ, HH, mWall, -RX, HH / 2, 0, scene, Math.PI / 2);
  L.plane(2 * RZ, HH, mWall, RX, HH / 2, 0, scene, -Math.PI / 2);
  const DX0 = -2.2, DX1 = -1.2, DH = 2.12;
  const fw = (x0, x1, y0, y1) => L.plane(x1 - x0, y1 - y0, mWall, (x0 + x1) / 2, (y0 + y1) / 2, RZ, scene, Math.PI);
  fw(-RX, DX0, 0, HH); fw(DX1, RX, 0, HH); fw(DX0, DX1, DH, HH);
  L.plane(2 * RX, 2 * RZ, lam(tFloor), 0, 0, 0, scene, 0, -Math.PI / 2);
  L.plane(2 * RX, 2 * RZ, lam(L.rep(K.tConcrete(2103, [200, 200, 192]), 3, 2)), 0, HH, 0, scene, 0, Math.PI / 2);
  for (const [x, z, ry, l] of [[0, -RZ + 0.01, 0, 6], [-RX + 0.01, 0, Math.PI / 2, 4.4], [RX - 0.01, 0, -Math.PI / 2, 4.4]]) L.plane(l, 0.1, lam(null, 0x2a2e2a), x, 0.05, z, scene, ry);
  K.fluor(scene, -0.6, HH - 0.03, -0.4, 0.32, 1.25, Math.PI / 2); K.fluor(scene, 1.4, HH - 0.03, 0.8, 0.32, 1.25, Math.PI / 2);
  { const p = new THREE.PointLight(0xf4f6ff, 5, 6, 1.1); p.position.set(-0.6, 2.4, -0.4); scene.add(p); const q = new THREE.PointLight(0xf4f6ff, 4, 6, 1.1); q.position.set(1.4, 2.4, 0.8); scene.add(q); }
  // hall outside the doorway (36b camera stands there)
  L.plane(1.8, 3.0, lam(L.rep(K.tTile(2104, '#a8a8a0', '#7a7c78'), 2, 3)), (DX0 + DX1) / 2, 0.001, RZ + 1.5, scene, 0, -Math.PI / 2);
  L.plane(3.0, HH, lam(L.rep(K.tBlock(2105, '#4a5a6a', '#b8bec4', 26), 2, 2.4)), DX0 - 0.2, HH / 2, RZ + 1.5, scene, Math.PI / 2);
  L.plane(3.0, HH, lam(L.rep(K.tBlock(2105, '#4a5a6a', '#b8bec4', 26), 2, 2.4)), DX1 + 0.6, HH / 2, RZ + 1.5, scene, -Math.PI / 2);
  // door frame + open leaf against the inner front wall
  const mFr = lam(K.tMetal(2106, '#6a6e72'));
  B(0.07, DH + 0.06, 0.18, mFr, DX0 - 0.035, (DH + 0.06) / 2, RZ, scene); B(0.07, DH + 0.06, 0.18, mFr, DX1 + 0.035, (DH + 0.06) / 2, RZ, scene); B(DX1 - DX0 + 0.14, 0.07, 0.18, mFr, (DX0 + DX1) / 2, DH + 0.035, RZ, scene);
  { const lf = B(0.98, DH - 0.02, 0.045, lam(K.tWood(2107, '#9a7048')), 0, DH / 2, 0, scene); lf.position.set(DX0 - 0.03, DH / 2, RZ - 0.5); lf.rotation.y = Math.PI / 2;
    const sign = L.plane(0.4, 0.12, lam(L.cvs(32, 8, (c) => { c.fillStyle = '#1a2a6a'; c.fillRect(0, 0, 32, 8); c.fillStyle = '#fff'; c.font = 'bold 6px Tahoma'; c.textAlign = 'center'; c.fillText('BREAK ROOM', 16, 6); })), 0, 0, 0, scene);
    sign.visible = false; }

  // ---------- vending machines ----------
  const VM_Z = -1.75, FRONT = 0.4;   // local: front face at z = +0.4
  const products = [], coils = [];
  function vm(x, col, brand, seed, rowsKind, empty = []) {
    const g = new THREE.Group(); g.position.set(x, 0, VM_Z); scene.add(g);
    const mC = lam(K.tMetal(seed, '#' + col.toString(16).padStart(6, '0'))), mD = lam(null, 0x18181c);
    const W = 0.96, H = 1.86, D = 0.8;
    B(0.05, H, D, mC, -W / 2 + 0.025, H / 2, 0, g); B(0.05, H, D, mC, W / 2 - 0.025, H / 2, 0, g);       // sides
    B(W, 0.08, D, mC, 0, H - 0.04, 0, g); B(W, 0.12, D, mD, 0, 0.06, 0, g);                              // top, plinth
    B(W, H, 0.03, mC, 0, H / 2, -D / 2 + 0.015, g);                                                     // back
    // front frame around the window x [-0.43, 0.17], y [0.52, 1.76]
    const WX0 = -0.43, WX1 = 0.17, WY0 = 0.52, WY1 = 1.76;
    B(W, H - WY1 - 0.0, 0.04, mC, 0, (WY1 + H) / 2, FRONT - 0.02, g);
    B(W, WY0 - 0.12, 0.04, mC, 0, (WY0 + 0.12) / 2, FRONT - 0.02, g);
    B(WX0 + W / 2, WY1 - WY0, 0.04, mC, (-W / 2 + WX0) / 2, (WY0 + WY1) / 2, FRONT - 0.02, g);
    B(W / 2 - WX1, WY1 - WY0, 0.05, [mC, mC, mC, mC, lam(tPanel(brand, '#' + col.toString(16).padStart(6, '0'))), mC], (WX1 + W / 2) / 2, (WY0 + WY1) / 2, FRONT - 0.02, g);
    B(0.5, 0.16, 0.05, mD, -0.14, 0.32, FRONT - 0.01, g); B(0.46, 0.02, 0.02, lam(null, 0x6a6a6a), -0.14, 0.4, FRONT + 0.015, g);   // delivery flap
    const hdr = L.plane(0.86, 0.07, basic(L.cvs(64, 8, (c) => { c.fillStyle = '#' + col.toString(16).padStart(6, '0'); c.fillRect(0, 0, 64, 8); c.fillStyle = '#ffffff'; c.font = 'bold 7px Tahoma'; c.textAlign = 'center'; c.fillText(brand, 32, 7); })), 0, 1.81, FRONT + 0.001, g);
    hdr.scale.y = 1;
    // lit interior: bright back panel + coils + products (unlit materials: the machine is lit from inside)
    L.plane(WX1 - WX0, WY1 - WY0, basic(null, 0xe8eef0), (WX0 + WX1) / 2, (WY0 + WY1) / 2, -D / 2 + 0.035, g);
    L.plane(0.02, WY1 - WY0, basic(null, 0xffffff), WX0 + 0.015, (WY0 + WY1) / 2, FRONT - 0.05, g, Math.PI / 2);   // tube along the left edge
    const mCoil = basic(null, 0xb8bcc4), mTray = basic(null, 0x6a6e78);
    const coilGeo = (() => {
      const pts = []; const turns = 6, n = 72; for (let i = 0; i <= n; i++) { const u = i / n, a = u * turns * 6.283; pts.push(V(Math.cos(a) * 0.045, Math.sin(a) * 0.045, -0.3 + u * 0.62)); }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, 0.006, 3, false);
    })();
    const rowsY = [0.6, 0.83, 1.06, 1.29, 1.52], cols = [-0.37, -0.25, -0.13, -0.01, 0.11];
    const rr = L.rng(seed + 5);
    rowsY.forEach((y, j) => {
      B(WX1 - WX0, 0.012, 0.22, mTray, (WX0 + WX1) / 2, y - 0.006, -0.22, g);
      L.plane(WX1 - WX0, 0.02, basic(tPrice), (WX0 + WX1) / 2, y + 0.006, 0.105, g);
      const kind = rowsKind[j];
      cols.forEach((cx, i) => {
        const emp = empty.some(([a, b]) => a === j && b === i);
        if (!(emp && j === 1 && i === 2)) coils.push(L.mesh(coilGeo, mCoil, cx, y + 0.05, 0, g));
        if (emp) return;
        const tx = kind === 'chips' ? tChips[(i + j + (rr() * 5 | 0)) % tChips.length] : tWrap[(i * 3 + j + (rr() * 8 | 0)) % tWrap.length];
        const m = basic(tx), mBk = basic(tx, 0x9a9a9a), mS = basic(null, kind === 'chips' ? 0x9a8a4a : 0x5a3a2a);
        const nItems = kind === 'chips' ? 3 : 5;
        for (let k = 0; k < nItems; k++) {
          const zz = 0.27 - k * (kind === 'chips' ? 0.14 : 0.105);
          const it = kind === 'chips' ? B(0.105, 0.17, 0.05, [mS, mS, mS, mS, m, mBk], cx, y + 0.09, zz, g) : B(0.1, 0.13, 0.025, [mS, mS, mS, mS, m, mBk], cx, y + 0.068, zz, g);
          it.rotation.x = -0.08; it.rotation.z = (rr() - 0.5) * 0.08; products.push(it);
        }
      });
    });
    // glass (faint reflection streaks, static) + crack layer
    const glass = L.plane(WX1 - WX0, WY1 - WY0, basic(tGlassRef, 0xffffff, { transparent: true, depthWrite: false, side: DS }), (WX0 + WX1) / 2, (WY0 + WY1) / 2, FRONT - 0.004, g);
    const light = new THREE.PointLight(0xe8f2ff, 3.2, 3.2, 1.2); light.position.set(-0.1, 1.15, FRONT + 0.6); g.add(light);
    return { g, glass, WX0, WX1, WY0, WY1 };
  }
  const VM1 = vm(-0.55, 0x9a1c18, 'SNACKS', 2150, ['chips', 'candy', 'candy', 'candy', 'chips'], [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2]]);
  const VM2 = vm(0.55, 0x1c2c6a, 'CHIPS & CANDY', 2160, ['candy', 'chips', 'candy', 'chips', 'candy']);
  const crack = L.plane(0.62, 0.62, basic(tCrack, 0xffffff, { transparent: true, depthWrite: false, side: DS }), 0, 0, 0, VM1.g);
  const IMP = V(-0.3, 1.12, FRONT - 0.002);   // impact point, VM1 local (in front of the empty column x = -0.25)
  crack.position.copy(IMP);
  // towel: tucked over the top of the window frame, hanging over the impact area
  const towelGeo = new THREE.PlaneGeometry(0.24, 0.72, 4, 9);
  const towelBase = towelGeo.attributes.position.array.slice();
  const towel = L.mesh(towelGeo, lam(tTowel, 0xffffff, { side: DS }), -0.31, 1.4, FRONT + 0.012, VM1.g);
  const towelFold = B(0.24, 0.03, 0.09, lam(tTowel), -0.31, VM1.WY1 + 0.01, FRONT - 0.02, VM1.g);
  function towelShape(push, drop) {   // push: bulge at the impact (m), drop: slide down after the break (m)
    const p = towelGeo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = towelBase[i * 3], y = towelBase[i * 3 + 1]; const d = Math.hypot(x - (IMP.x + 0.31), y - (IMP.y - 1.4));
      p.setXYZ(i, x, y - drop * (1 + 0.3 * Math.sin(x * 9)), 0.006 * Math.sin(x * 26 + y * 7) - push * Math.max(0, 1 - d / 0.2) + drop * 0.25); }   // falls outward, never into the lens
    p.needsUpdate = true; towelFold.visible = drop <= 0;
  }
  // shards for the break (fall inside the machine, toward the camera)
  const shards = [];
  { const rr = L.rng(2170), mG = basic(null, 0xd8e8f4, { transparent: true, opacity: 0.45, side: DS, depthWrite: false });
    for (let k = 0; k < 14; k++) { const s = 0.04 + rr() * 0.06; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, s, rr() * s * 0.5, 0, rr() * s, s * (0.8 + rr() * 0.6), 0], 3));
      const m = L.mesh(geo, mG, 0, 0, 0, VM1.g); m.userData = { x: VM1.WX0 + 0.04 + rr() * 0.5, y: VM1.WY0 + 0.15 + rr() * 1.0, vz: -0.2 - rr() * 0.5, vy: 0.2 * rr(), rx: (rr() - 0.5) * 9, rz: (rr() - 0.5) * 9 }; m.visible = false; shards.push(m); } }

  // ---------- counter, coffee maker, fridge, table + chairs ----------
  const mLam = lam(L.cvs(16, 16, (c) => { const rr = L.rng(2180); for (let i = 0; i < 256; i++) px(c, i % 16, i >> 4, rgb(196 + rr() * 16, 196 + rr() * 16, 188 + rr() * 12)); }));
  const mCab = lam(K.tWood(2181, '#8a6a46'));
  B(0.6, 0.88, 2.6, mCab, -RX + 0.3, 0.44, -0.3, scene); B(0.64, 0.04, 2.64, mLam, -RX + 0.32, 0.9, -0.3, scene);
  for (let k = 0; k < 4; k++) { B(0.01, 0.7, 0.6, lam(null, 0x4a3a28), -RX + 0.605, 0.42, -1.45 + k * 0.65, scene); B(0.02, 0.1, 0.02, lam(null, 0xc8c8c0), -RX + 0.615, 0.72, -1.25 + k * 0.65, scene); }
  B(0.36, 0.04, 0.42, lam(null, 0x9aa0a4), -RX + 0.3, 0.915, 0.65, scene); B(0.3, 0.02, 0.36, lam(null, 0x3a3e40), -RX + 0.3, 0.925, 0.65, scene);   // sink
  cyl(0.012, 0.012, 0.22, 6, lam(null, 0xc8ccd0), -RX + 0.1, 1.03, 0.65, scene);
  { const mw = B(0.45, 0.27, 0.34, lam(null, 0xe8e6e0), -RX + 0.25, 1.06, -1.2, scene); B(0.02, 0.2, 0.26, basic(null, 0x101418), -RX + 0.48, 1.06, -1.25, scene); void mw; }
  // the coffee maker (drip, black), OFF: switch light dark, carafe empty, cord unplugged with the plug on the counter
  const CM = V(-2.64, 0.92, -0.62);
  const coffee = new THREE.Group(); coffee.position.copy(CM); coffee.rotation.y = Math.PI / 2 + 0.75; scene.add(coffee);
  { const mK = lam(K.tMetal(2182, '#26262a')), mK2 = lam(null, 0x141416);
    B(0.22, 0.03, 0.26, mK, 0, 0.015, 0.02, coffee);                 // base plate
    B(0.22, 0.36, 0.1, mK, 0, 0.18, -0.09, coffee);                  // tower (back)
    B(0.22, 0.09, 0.26, mK, 0, 0.33, 0.02, coffee);                  // head / filter basket
    cyl(0.07, 0.07, 0.01, 12, lam(null, 0x3a3a3a), 0, 0.034, 0.05, coffee);   // warmer plate (cold)
    const carafe = cyl(0.07, 0.065, 0.13, 10, basic(null, 0xb8c8d0, { transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.105, 0.05, coffee);
    void carafe; B(0.15, 0.03, 0.15, mK2, 0, 0.175, 0.05, coffee); B(0.02, 0.07, 0.03, mK2, 0.09, 0.12, 0.05, coffee);   // lid + handle
    B(0.05, 0.03, 0.01, lam(null, 0x3a0a08), 0.06, 0.045, 0.152, coffee);   // OFF switch (dark red, light off)
    L.plane(0.03, 0.012, basic(L.cvs(8, 4, (c) => { c.fillStyle = '#202020'; c.fillRect(0, 0, 8, 4); c.fillStyle = '#e8e8e8'; c.font = 'bold 4px monospace'; c.fillText('OFF', 1, 4); })), -0.05, 0.045, 0.151, coffee);
    L.plane(0.07, 0.07, lam(tSticky, 0xffffff, { side: DS }), 0, 0.2, -0.039, coffee, 0).rotation.set(0, 0, 0.08);   // sticky note on the tower front
    const cord = []; for (let i = 0; i <= 8; i++) cord.push(V(-0.09 - i * 0.025, 0.01 + Math.max(0, 0.12 - i * 0.02), -0.14 + Math.sin(i * 0.8) * 0.03));
    L.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cord), 16, 0.005, 3), mK2, 0, 0, 0, coffee);
    B(0.03, 0.02, 0.04, lam(null, 0x101010), -0.3, 0.012, -0.12, coffee); B(0.005, 0.004, 0.02, lam(null, 0xc8c8a0), -0.3, 0.012, -0.15, coffee);
    // empty coffee bag + mugs on the counter next to it
    B(0.08, 0.14, 0.05, lam(L.cvs(8, 16, (c) => { c.fillStyle = '#8a2a1a'; c.fillRect(0, 0, 8, 16); c.fillStyle = '#e8d8b0'; c.fillRect(1, 5, 6, 5); })), 0.22, 0.07, -0.05, coffee).rotation.y = 0.3;
  }
  { const g = new THREE.Group(); g.position.set(2.55, 0, -1.75); scene.add(g); const mF = lam(K.tMetal(2183, '#e4e2dc'));   // fridge
    B(0.7, 1.75, 0.68, mF, 0, 0.875, 0, g); B(0.7, 0.01, 0.01, lam(null, 0x8a8a84), 0, 1.25, 0.345, g); B(0.03, 0.4, 0.03, lam(null, 0xa8a8a0), -0.28, 1.0, 0.36, g); B(0.03, 0.25, 0.03, lam(null, 0xa8a8a0), -0.28, 1.45, 0.36, g); }
  L.plane(0.9, 0.6, lam(tBoard), RX - 0.01, 1.55, 0.6, scene, -Math.PI / 2);
  L.plane(0.32, 0.32, lam(tClock, 0xffffff, { alphaTest: 0.5 }), 0.0, 2.25, -RZ + 0.01, scene);
  const mChairS = lam(null, 0xc86a28), mLeg = lam(null, 0xb8bcc0);
  function chair(parent) {   // plastic shell chair: front +z, seat at 0.45
    const g = new THREE.Group(); parent.add(g);
    B(0.42, 0.04, 0.4, mChairS, 0, 0.45, 0, g); const bk = B(0.42, 0.36, 0.04, mChairS, 0, 0.67, -0.2, g); bk.rotation.x = -0.1;
    for (const [x, z] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) cyl(0.012, 0.012, 0.45, 5, mLeg, x, 0.225, z, g);
    return g;
  }
  { const T0 = V(1.55, 0, 0.45); B(1.2, 0.04, 0.8, lam(K.tWood(2184, '#c8b090')), T0.x, 0.74, T0.z, scene);
    for (const [x, z] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) cyl(0.02, 0.02, 0.72, 5, mLeg, T0.x + x, 0.36, T0.z + z, scene);
    for (const [x, z, ry] of [[-0.3, -0.62, 0], [0.4, 0.68, Math.PI], [0.85, -0.05, -Math.PI / 2]]) { const c = chair(scene); c.position.set(T0.x + x, 0, T0.z + z); c.rotation.y = ry; }
    B(0.14, 0.02, 0.1, basic(tChips[2]), T0.x - 0.2, 0.77, T0.z + 0.1, scene).rotation.y = 0.5; }
  // the chair Ava swings (grip = top of the backrest at the origin of `heldChair`, legs along the swing direction)
  const heldChair = new THREE.Group(); scene.add(heldChair);
  { const inner = chair(heldChair); inner.position.set(0, -0.86, 0.22); }
  const SH = V(-0.18, 1.38, 0);   // right shoulder in Ava's local space (she faces +z; her right hand is at -x)

  // ---------- Ava ----------
  const ch = L.hero(); scene.add(ch.root);
  const mug = new THREE.Group(); { const m = cyl(0.04, 0.036, 0.1, 10, lam(tMug), 0, 0, 0, mug); void m; const h = L.mesh(new THREE.TorusGeometry(0.03, 0.008, 4, 8), lam(null, 0xf0ece0), 0.045, 0, 0, mug); h.rotation.y = 0; }
  L.holdIn(ch, mug, 'R', [0, 0.8, 0.3], [0, 0, 0]);
  const AV36c = V(-0.5, 0, -0.52);
  const IMPW = () => { VM1.g.updateMatrixWorld(true); return VM1.g.localToWorld(IMP.clone()); };
  const GLASS_Z = VM_Z + FRONT + 0.03, CHAIR_LEN = 0.9;
  const placeChair = () => {
    ch.root.updateMatrixWorld(true);
    const hp = ch.hand('R').getWorldPosition(V()), sp = ch.root.localToWorld(SH.clone());
    const up = hp.clone().sub(sp).normalize(), aim = IMPW().sub(hp).normalize();
    const u = L.smooth((hp.y - 1.26) / 0.3);
    const d = aim.clone().lerp(up, u).normalize();
    const tipZ = hp.z + d.z * CHAIR_LEN, over = GLASS_Z - tipZ;   // she faces -z: tip must stay at z >= GLASS_Z
    const pos = hp.clone(); if (over > 0 && d.z < -0.05) pos.addScaledVector(d, -over / -d.z);
    heldChair.position.copy(pos); heldChair.quaternion.setFromUnitVectors(V(0, -1, 0), d);
    heldChair.rotateY(Math.PI / 2); heldChair.updateMatrixWorld(true);
  };
  const reset = () => {
    ch.root.visible = true; heldChair.visible = false; mug.visible = false; crack.visible = false; VM1.glass.visible = true;
    towel.visible = false; towelFold.visible = false; for (const s of shards) s.visible = false; towelShape(0, 0);
    VM1.glass.material.opacity = 1; crack.scale.set(1, 1, 1); towel.scale.set(1, 1, 1); for (const k of coils) k.visible = true;
  };
  const out = {};

  // ---- 36b_breakroom: A = high, through the doorway from the hall (frame in the foreground); B = high back-right corner
  {
    const cA = cam(44), cB = cam(46);
    out['36b_breakroom'] = { scene, camera: cA, update(lt, t) {
      reset();
      const w = r.walk, p = w.at(t), tk = r.knock - r.t36b;
      ch.root.position.set(p.x, 0, p.z);
      ch.root.rotation.y = p.moving ? p.yaw : p.yaw + L.smooth((t - w.t1) / 0.3) * (Math.PI - p.yaw);
      ch.pose(lt, [w.seg(r.t36b), L.seg('idle', w.t1 - r.t36b, { fade: 0.2, loop: true }), L.seg('knock', tk, { fade: 0.12 })],
        [[-99, 'open', mouthAt(t, 'neutral')], [tk + 0.2, 'happy', mouthAt(t, 'smile')]]);
      const B2 = t >= r.cutB;
      this.camera = B2 ? cB : cA;
      if (!B2) look(cA, V(-1.62, 2.3, 3.55), V(-0.55, 0.85, -1.0));
      else look(cB, V(2.6, 2.45, 1.25), V(-0.75, 0.95, -1.0));
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.35);
      const k = pop(lt, r.tempered - r.t36b);
      if (k > 0) { const [x, y] = L.toScreen(o.camera, -0.55 + (VM1.WX0 + VM1.WX1) / 2, 1.45, VM_Z + FRONT); label(o, 'NOT TEMPERED', 250, 104, '#ff4030', [x, y], k); }
    } };
  }

  // ---- 36c_vending: low 3/4 angle beside the red machine: towel over the glass, the crack spreads on the pane where the chair hits
  {
    const c36 = cam(50);
    out['36c_vending'] = { scene, camera: c36, update(lt, t) {
      reset();
      const h1 = r.hit1 - r.t36c, h2 = r.hit2 - r.t36c, tin = r.in - r.t36c;
      ch.root.position.copy(AV36c); ch.root.rotation.y = Math.PI;
      const down = h2 + 0.45;   // she lowers the chair after the glass gives
      ch.pose(lt, [L.seg('hammer', h1 - 0.30), L.seg('hammer', h1 + 0.12, { from: 0.42, speed: 0 , fade: 0.0 }), L.seg('hammer', h2 - 0.30, { fade: 0.1 }), L.seg('idle', down, { fade: 0.25, loop: true })],
        [[-99, 'angry', mouthAt(t, 'neutral')], [h1, 'blink', 'gasp'], [h1 + 0.15, 'angry', mouthAt(t, 'neutral')], [h2, 'blink', 'gasp'], [h2 + 0.2, 'surprised', mouthAt(t, 'smileOpen')], [tin, 'wink', mouthAt(t, 'smileOpen')]]);
      if (lt > down - 0.05) ch.lookAt(c36, L.smooth((lt - down) / 0.3), 40);
      if (lt < down) { heldChair.visible = true; placeChair(); }
      // glass: cracks on hit 1, gives way on hit 2; the machine glass alone rattles
      const rat = K.rattle(lt, [h1, h2], 0.006, 0.4);
      VM1.glass.position.x = (VM1.WX0 + VM1.WX1) / 2 + rat;
      crack.visible = lt >= h1 && lt < h2; crack.position.x = IMP.x + rat;
      { const g = 0.35 + 0.65 * L.smooth((lt - h1) / 0.09) + 0.25 * L.smooth((lt - h1 - 0.6) / 1.2); crack.scale.set(g, g, 1); }   // spreads from the hit
      VM1.glass.visible = lt < h2;
      towel.visible = true;
      towelShape(Math.max(0, 0.05 * (1 - Math.abs(lt - h1) / 0.12)) + Math.max(0, 0.05 * (1 - Math.abs(lt - h2) / 0.12)), lt > h2 ? 0.5 * Math.min(1, ((lt - h2) / 0.45) ** 2) : 0);
      if (lt > h2 + 0.06) towel.visible = false;   // slides off out of frame (it would fill the lens this close)
      for (const s of shards) { const u = s.userData, e = lt - h2; s.visible = e >= 0 && e < 1.2;
        if (s.visible) { s.position.set(u.x, Math.max(VM1.WY0 - 0.02, u.y + u.vy * e - 2.6 * e * e), FRONT - 0.01 + u.vz * e * 0.5); s.rotation.set(u.rx * e * 0.3, 0, u.rz * e * 0.3); } }
      // low 3/4 angle from beside the machine: the towel on the glass, the crack spreading on the pane, Ava swinging
      look(c36, V(-2.25, 1.05, 0.35), V(-0.62, 1.2, -0.95));
      for (const s of shards) s.scale.setScalar(0.8);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.45) };
  }

  // ---- 36f_coffee: coffee maker OFF in the foreground (over-object), Ava behind with the empty mug, sad face on "hurts"
  {
    const c36f = cam(42);
    out['36f_coffee'] = { scene, camera: c36f, update(lt, t) {
      reset(); mug.visible = true;
      const AV = V(-2.0, 0, 0.85);
      ch.root.position.copy(AV); ch.root.rotation.y = Math.PI - 0.35;
      const th = r.hurts - r.t36f, to = r.off - r.t36f, thon = r.honestly - r.t36f;
      ch.pose(lt, [L.seg('hold_up_object', 0.0, { from: 0.25 }), L.seg('hold_up_object', 1.2, { from: 0.8, speed: 0 })],
        [[-99, 'open', mouthAt(t, 'neutral')], [to, 'half', mouthAt(t, 'frown')], [thon, 'relaxed', mouthAt(t, 'frown')], [th, 'sad', mouthAt(t, 'frown')]]);
      const u = L.smooth(lt / (r.end36f - r.t36f));
      look(c36f, V(-2.12, 1.16, -1.5).lerp(V(-2.12, 1.15, -1.32), u), V(-2.25, 1.02, 0.6));
      ch.lookAt(c36f, 1, 40);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.4) };
  }
  return out;
}
