// sets/room.js — ep2 interior: ONE room with a window (wallpaper, white wooden frame, dirty glass, sill, radiator, worn planks).
// Shots 01 02 03 04 10 12 15; every update() sets the whole state (glass, boards, plywood, screws, brace, zombie, Ava + props).
// World: wall face z=0 (room at +z), window opening x in [-0.6, 0.6], y in [0.9, 2.05], floor y=0. Prefix: none needed (own module).
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// Zombie hits on the window (global s) = impact frames of thin-zombie 'attack2' (right swing at clip 0.30 s, left at 0.83 s,
// loop 1.667 s) with each shot's clip offset: 01 clip = 0.4 + 0.9 lt, 02 = 1.2 + 0.9 lt, 03 = 2.0 + 0.9 lt; 04 = arm-through-gap
// punches. The window (sash, glass, boards, plywood) jolts on each; mix.py can put glass/board bangs on them.
export const WIN_HITS = [0.48, 1.74, 3.15, 3.74, 5.00, 5.96, 7.21, 7.70, 8.15, 8.60, 9.00];

export async function shots({ L, TL }) {
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (r, g, b) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const WT = (w) => (TL.words.find((x) => x[0] === w) || [0, 99])[1];
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };

  const FOG = 0xd2d6d8;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(FOG); scene.fog = new THREE.Fog(FOG, 3.2, 11);
  scene.add(new THREE.HemisphereLight(0xffe8d0, 0x5a4434, 1.25));
  const key = new THREE.DirectionalLight(0xffdcb4, 1.0); key.position.set(1.8, 3.2, 3.2); scene.add(key);
  const day = new THREE.PointLight(0xdce8ff, 2.2, 3.5, 1.2); day.position.set(0, 1.5, 0.6); scene.add(day);   // daylight from the window

  // ---------- textures ----------
  const tWall = L.cvs(64, 64, (c, w, h) => {   // cream wallpaper, brown medallions + scrolls, water stains (ep1 rooms.js)
    c.fillStyle = '#cdb994'; c.fillRect(0, 0, w, h);
    const r = L.rng(9); for (let i = 0; i < 300; i++) { c.fillStyle = r() < 0.5 ? '#bfa983' : '#d6c4a0'; c.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1); }
    c.strokeStyle = '#7d5c3a'; c.lineWidth = 1.4;
    for (const [x, y] of [[16, 18], [48, 50]]) {
      c.beginPath(); c.ellipse(x, y, 6, 7, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fillStyle = '#7d5c3a'; c.fill();
      c.beginPath(); c.moveTo(x - 9, y + 9); c.quadraticCurveTo(x - 12, y + 2, x - 7, y - 2); c.stroke();
      c.beginPath(); c.moveTo(x + 9, y - 9); c.quadraticCurveTo(x + 12, y - 2, x + 7, y + 2); c.stroke();
    }
    c.fillStyle = '#6f8a5a'; for (const [x, y] of [[40, 14], [8, 46], [30, 34]]) c.fillRect(x, y, 2, 2);
  });
  const tFloor = L.cvs(64, 64, (c, w, h) => {   // worn planks: 8 px boards, staggered joints, scuffs, nail dots
    const r = L.rng(14);
    for (let b = 0; b < 8; b++) {
      const base = 0.8 + r() * 0.3, joint = Math.floor(r() * 64);
      for (let y = 0; y < h; y++) for (let x = b * 8; x < b * 8 + 8; x++) {
        const g = Math.sin(y * 0.35 + x * 1.7 + b) * 0.06, n = r() * 0.1, edge = x % 8 === 0 || y === joint ? 0.55 : 1;
        const worn = (x > 20 && x < 44) ? 0.12 : 0;   // traffic path: lighter, greyer
        const k = (base + g + n) * edge;
        px(c, x, y, rgb((122 + worn * 120) * k, (78 + worn * 100) * k, (46 + worn * 80) * k));
      }
      px(c, b * 8 + 2, (joint + 3) % 64, '#2a1a10'); px(c, b * 8 + 6, (joint + 3) % 64, '#2a1a10');
    }
  });
  const tFrame = L.cvs(16, 64, (c, w, h) => {   // white painted wood, chipped (brown wood shows)
    const r = L.rng(5);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14; px(c, x, y, rgb(214 + n, 210 + n, 198 + n)); }
    for (let k = 0; k < 14; k++) px(c, Math.floor(r() * 14), Math.floor(r() * 62), r() < 0.6 ? '#8a6a48' : '#a8a090', 1 + Math.floor(r() * 2), 1 + Math.floor(r() * 3));
    for (let y = 0; y < h; y += 1) if (r() < 0.2) px(c, 0, y, '#9a968a');
  });
  const tGlass = L.cvs(32, 32, (c, w, h) => {   // dirty glass: grime gradient + streaks (the bloody handprint is a decal: tex/handprint.png)
    const r = L.rng(17);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 0.5 + (y / h) * 0.35 + r() * 0.15; px(c, x, y, rgb(150 * k + 60, 160 * k + 60, 150 * k + 50)); }
    for (let k = 0; k < 6; k++) { const x = Math.floor(r() * 30); for (let y = 0; y < 10 + r() * 14; y++) px(c, x, 4 + y, '#9a9a88'); }
  });
  const tBoard = L.cvs(64, 16, (c, w, h) => {   // weathered grey-white plank, grain, knots
    const r = L.rng(23);
    for (let y = 0; y < h; y++) { const k0 = 0.85 + r() * 0.2; for (let x = 0; x < w; x++) { const k = k0 * (0.92 + 0.1 * Math.sin(x * 0.4 + y * 1.3 + r())); px(c, x, y, rgb(196 * k, 188 * k, 172 * k)); } }
    for (let k = 0; k < 3; k++) { const x = 6 + Math.floor(r() * 52), y = 3 + Math.floor(r() * 9); px(c, x - 1, y, '#6a5a44', 3, 2); px(c, x, y, '#3a2a1c'); }
    px(c, 0, 0, '#8a8274', w, 1); px(c, 0, h - 1, '#6e665a', w, 1);
  });
  const tPly = L.cvs(64, 64, (c, w, h) => {   // plywood: orange-tan, wide grain swirls, darker sanded edge, a stamp
    const r = L.rng(29);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const s = Math.sin((x * 0.18 + Math.sin(y * 0.09) * 3.0 + Math.sin(y * 0.031 + x * 0.02) * 6.0)) * 0.08, n = r() * 0.06;
      const k = 0.95 + s + n; px(c, x, y, rgb(196 * k, 132 * k, 72 * k));
    }
    for (let k = 0; k < 3; k++) { const x = 8 + Math.floor(r() * 48), y = 8 + Math.floor(r() * 48); c.strokeStyle = '#8a5428'; c.beginPath(); c.ellipse(x, y, 3, 2, 0.3, 0, 7); c.stroke(); }
    c.fillStyle = 'rgba(70,40,20,0.35)'; c.fillRect(0, 0, w, 2); c.fillRect(0, h - 2, w, 2); c.fillRect(0, 0, 2, h); c.fillRect(w - 2, 0, 2, h);
    c.fillStyle = 'rgba(40,60,120,0.55)'; c.fillRect(40, 46, 14, 7); c.fillStyle = 'rgba(196,132,72,0.9)'; c.fillRect(42, 48, 10, 3);
  });
  const t2x4 = L.cvs(8, 64, (c, w, h) => {   // spruce 2x4: pale yellow, grain lines
    const r = L.rng(31);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 0.9 + r() * 0.1 - (((x * 3 + Math.floor(y / 9)) % 5) === 0 ? 0.12 : 0); px(c, x, y, rgb(222 * k, 188 * k, 128 * k)); }
    px(c, 2, 30, '#7a5a30', 3, 2);
  });
  const tWood = L.cvs(16, 64, (c, w, h) => {
    const r = L.rng(3);
    for (let x = 0; x < w; x++) { const g = r() * 26 - 13; for (let y = 0; y < h; y++) { const n = g + r() * 8 + (Math.sin(y * 0.3 + x) > 0.85 ? -18 : 0); px(c, x, y, rgb(120 + n, 70 + n * 0.7, 36 + n * 0.3)); } }
  });
  const tOut = L.cvs(64, 32, (c, w, h) => {   // foggy yard: pale sky, dark tree line, posts
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e2e6e8'); g.addColorStop(0.6, '#c6ccce'); g.addColorStop(1, '#8a8e86'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x++) { const t = 15 + Math.round(2 * Math.sin(x * 0.7) + 2 * Math.sin(x * 2.1)); px(c, x, t, '#9aa09e', 1, 22 - t); }
    for (const x of [6, 21, 37, 52]) px(c, x, 12, '#6e6a62', 2, 20);
    px(c, 0, 22, '#7a786e', w, 1);
  });
  const tGrass = L.cvs(32, 32, (c, w, h) => { const r = L.rng(41); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 24 - 12; px(c, x, y, rgb(96 + n, 100 + n, 78 + n)); } });
  const tRad = L.cvs(32, 16, (c, w, h) => { for (let x = 0; x < w; x++) { const k = x % 4 === 0 ? 0.6 : x % 4 === 1 ? 1.05 : 0.9; for (let y = 0; y < h; y++) px(c, x, y, rgb(196 * k, 190 * k, 178 * k)); } for (let k = 0; k < 6; k++) px(c, (k * 11) % 30, (k * 5) % 14, '#8a5a3a', 2, 1); });
  // drill: yellow body with vents + logo strip; hammer handle: wood with black rubber grip
  const tDrill = L.cvs(32, 16, (c, w, h) => {
    px(c, 0, 0, '#e8b818', w, h); px(c, 0, 0, '#f8d040', w, 3); px(c, 0, h - 3, '#a88010', w, 3);
    for (let x = 4; x < 12; x += 2) px(c, x, 5, '#2a2a2a', 1, 5);
    px(c, 16, 6, '#1a1a1a', 12, 4); px(c, 17, 7, '#e8e8e0', 3, 2); px(c, 21, 7, '#e8e8e0', 2, 2); px(c, 24, 7, '#e8e8e0', 3, 2);
  });
  const tHandle = L.cvs(8, 32, (c, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(c, x, y, y < 13 ? ((y % 3) ? '#1e1e20' : '#38383a') : rgb(170 - x * 4, 110 - x * 3, 60)); });

  // ---------- materials ----------
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mFrame = lam(L.rep(tFrame, 1, 1)), mWood = lam(tWood), mDark = lam(null, 0x1a1a1c), mNail = lam(null, 0x3a3836);
  const mBoard = lam(tBoard), mPly = lam(tPly), m2x4 = lam(L.rep(t2x4, 1, 3)), mSteel = lam(null, 0x9aa0a6);

  // ---------- room shell ----------
  const X0 = -0.6, X1 = 0.6, Y0 = 0.9, Y1 = 2.05, WTH = 0.15;
  const WP = 0.62;
  const wallPart = (x0, x1, y0, y1) => {
    const w = x1 - x0, h = y1 - y0, g = new THREE.PlaneGeometry(w, h);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + uv.getX(i) * w) / WP, (y0 + uv.getY(i) * h) / WP);
    return L.mesh(g, lam(L.rep(tWall, 1, 1)), (x0 + x1) / 2, (y0 + y1) / 2, 0, scene);
  };
  wallPart(-3.2, X0, 0, 2.8); wallPart(X1, 3.2, 0, 2.8); wallPart(X0, X1, 0, Y0); wallPart(X0, X1, Y1, 2.8);
  L.plane(4.5, 2.8, lam(L.rep(tWall, 4.5 / WP, 2.8 / WP)), -2.2, 1.4, 2.1, scene, Math.PI / 2);   // left side wall
  L.plane(4.5, 2.8, lam(L.rep(tWall, 4.5 / WP, 2.8 / WP)), 2.6, 1.4, 2.1, scene, -Math.PI / 2);
  L.plane(6, 6, lam(L.rep(tFloor, 6 / 1.0, 6 / 1.0)), 0, 0, 2.9, scene, 0, -Math.PI / 2);
  L.plane(6, 6, lam(null, 0x3a3028), 0, 2.8, 2.9, scene, 0, Math.PI / 2);
  B(6.4, 0.09, 0.02, mWood, 0, 0.045, 0.01, scene);   // skirting
  // reveal (wall thickness) around the opening, white frame + mullion + transom on the outer side, sill inside
  B(0.02, Y1 - Y0, WTH, mFrame, X0 - 0.01, (Y0 + Y1) / 2, -WTH / 2, scene); B(0.02, Y1 - Y0, WTH, mFrame, X1 + 0.01, (Y0 + Y1) / 2, -WTH / 2, scene);
  B(X1 - X0 + 0.04, 0.02, WTH, mFrame, 0, Y1 + 0.01, -WTH / 2, scene);
  const sash = new THREE.Group(); sash.position.z = -0.1; scene.add(sash);
  B(0.06, Y1 - Y0, 0.05, mFrame, X0 + 0.03, (Y0 + Y1) / 2, 0, sash); B(0.06, Y1 - Y0, 0.05, mFrame, X1 - 0.03, (Y0 + Y1) / 2, 0, sash);
  B(X1 - X0, 0.06, 0.05, mFrame, 0, Y1 - 0.03, 0, sash); B(X1 - X0, 0.07, 0.05, mFrame, 0, Y0 + 0.035, 0, sash);
  B(0.05, Y1 - Y0, 0.05, mFrame, 0, (Y0 + Y1) / 2, 0, sash); B(X1 - X0, 0.045, 0.05, mFrame, 0, 1.72, 0, sash);
  B(0.03, 0.08, 0.03, lam(null, 0xb8a050), 0.05, 1.4, 0.035, sash);   // latch
  // casing on the wall face + deep sill (windowboard) inside
  B(0.08, Y1 - Y0 + 0.16, 0.022, mFrame, X0 - 0.04, (Y0 + Y1) / 2 + 0.04, 0.011, scene); B(0.08, Y1 - Y0 + 0.16, 0.022, mFrame, X1 + 0.04, (Y0 + Y1) / 2 + 0.04, 0.011, scene);
  B(X1 - X0 + 0.16, 0.08, 0.022, mFrame, 0, Y1 + 0.04, 0.011, scene);
  B(X1 - X0 + 0.26, 0.035, WTH + 0.1, mFrame, 0, Y0 - 0.017, -WTH / 2 + 0.05, scene);
  B(X1 - X0 + 0.1, 0.06, 0.02, mFrame, 0, Y0 - 0.065, 0.011, scene);
  // glass (intact) + broken shards
  const glass = L.plane(X1 - X0 - 0.06, Y1 - Y0 - 0.06, L.basic(tGlass, 0xffffff, { transparent: true, opacity: 0.42, depthWrite: false }), 0, (Y0 + Y1) / 2, -0.1, scene);
  const shards = new THREE.Group(); scene.add(shards);
  const win = new THREE.Group(); scene.add(win);   // everything that jolts on WIN_HITS (filled at the end)
  // bloody handprint decal (tex/handprint.png, Flow) on the room side of the glass, where the zombie's hands hit
  const tPrint = await L.loadTex('tex/handprint.png', 128);
  const mPrint = L.basic(tPrint, 0xffffff, { alphaTest: 0.4, side: THREE.DoubleSide });
  const print = L.plane(0.27, 0.27, mPrint, 0.26, 1.42, -0.094, scene); print.rotation.z = -0.25;
  { const sm = L.basic(tGlass, 0xffffff, { transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
    const tri = (pts) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p[0], p[1], -0.1]), 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2)); L.mesh(g, sm, 0, 0, 0, shards); };
    tri([[X0 + 0.06, Y1 - 0.06], [X0 + 0.32, Y1 - 0.06], [X0 + 0.06, Y1 - 0.4]]); tri([[X1 - 0.06, Y0 + 0.07], [X1 - 0.06, Y0 + 0.45], [X1 - 0.25, Y0 + 0.07]]);
    tri([[0.025, Y1 - 0.06], [0.22, Y1 - 0.06], [0.025, 1.78]]); tri([[-0.025, Y0 + 0.07], [-0.025, Y0 + 0.3], [-0.2, Y0 + 0.07]]); }
  // outside: foggy yard
  L.plane(14, 6, L.basic(L.rep(tOut, 3, 1)), 0, 2.2, -6.5, scene);
  L.plane(14, 7, lam(L.rep(tGrass, 14, 7)), 0, -0.02, -3.2, scene, 0, -Math.PI / 2);
  for (const [x, z] of [[-1.6, -2.4], [1.4, -3.0], [-0.4, -4.2], [2.5, -1.8]]) B(0.1, 1.3, 0.1, lam(tWood, 0x8a8478), x, 0.65, z, scene);
  B(5, 0.06, 0.04, lam(tWood, 0x8a8478), 0.4, 1.0, -2.7, scene);

  // ---------- furniture & detail ----------
  { // cast-iron radiator under the window
    const rad = new THREE.Group(); rad.position.set(0, 0.12, 0.08); scene.add(rad);
    const mr = lam(L.rep(tRad, 1, 1));
    for (let k = 0; k < 9; k++) B(0.07, 0.5, 0.09, mr, -0.4 + k * 0.1, 0.27, 0, rad);
    B(0.92, 0.04, 0.05, mr, 0, 0.04, 0, rad); B(0.92, 0.04, 0.05, mr, 0, 0.5, 0, rad);
    cyl(0.015, 0.015, 0.12, 6, mSteel, 0.48, -0.04, 0, rad);
  }
  { // dresser with jars + lamp (left of the window), framed picture + shelf (right)
    const dr = new THREE.Group(); dr.position.set(-1.25, 0, 0.26); scene.add(dr);
    const mD = lam(tWood, 0x8a6a50);
    B(0.8, 0.85, 0.48, mD, 0, 0.425, 0, dr);
    for (let k = 0; k < 3; k++) { B(0.72, 0.22, 0.01, lam(tWood, 0xa07a58), 0, 0.15 + k * 0.26, 0.245, dr); B(0.1, 0.02, 0.02, mSteel, 0, 0.18 + k * 0.26, 0.255, dr); }
    const r = L.rng(51);
    for (let j = 0; j < 3; j++) { const jh = 0.1 + r() * 0.08; cyl(0.045, 0.045, jh, 7, lam(null, [0x9ab070, 0xc0a060, 0x8a3a2a][j]), -0.22 + j * 0.13, 0.85 + jh / 2, 0.05, dr); }
    cyl(0.06, 0.08, 0.04, 8, lam(null, 0x3a3a3c), 0.25, 0.87, 0, dr); cyl(0.012, 0.012, 0.3, 5, mSteel, 0.25, 1.02, 0, dr);
    cyl(0.07, 0.14, 0.16, 8, lam(null, 0xe8d8a8), 0.25, 1.22, 0, dr);
    const pic = new THREE.Group(); pic.position.set(1.3, 1.55, 0.015); scene.add(pic);
    B(0.42, 0.52, 0.02, lam(tWood, 0x6a4a30), 0, 0, 0, pic);
    L.plane(0.34, 0.44, lam(L.cvs(16, 20, (c) => { const g = c.createLinearGradient(0, 0, 0, 20); g.addColorStop(0, '#9ab0c0'); g.addColorStop(1, '#6a7a50'); c.fillStyle = g; c.fillRect(0, 0, 16, 20); px(c, 3, 9, '#3a4a2a', 10, 2); px(c, 6, 5, '#e8d090', 3, 3); })), 0, 0, 0.011, pic);
    const sh = new THREE.Group(); sh.position.set(1.35, 0, 0.2); scene.add(sh);
    for (let k = 0; k < 2; k++) B(0.7, 0.03, 0.34, lam(tWood, 0x6a4a34), 0, 0.5 + k * 0.4, 0, sh);
    B(0.03, 1.0, 0.34, lam(tWood, 0x6a4a34), -0.34, 0.5, 0, sh); B(0.03, 1.0, 0.34, lam(tWood, 0x6a4a34), 0.34, 0.5, 0, sh);
    const bookCols = [0x6a2018, 0x1e3a5a, 0x2e4a24, 0x7a5a20, 0x4a2a40];
    for (let k = 0; k < 2; k++) { let x = -0.3; while (x < 0.28) { const bw = 0.03 + r() * 0.03, bh = 0.18 + r() * 0.1; B(bw, bh, 0.24, lam(null, bookCols[Math.floor(r() * 5)]), x + bw / 2, 0.515 + k * 0.4 + bh / 2, 0, sh); x += bw + 0.006; } }
  }
  // blue couch (ep1 rooms.js Rcouch, no guitar): seats face -z (toward the window), back at +z
  const SW = 2.0, SD = 0.88, BACK_TOP = 0.9;
  const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const weave = (c, w, h, r, base) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) for (let x = (y & 1); x < w; x += 2) { c.fillStyle = r() < 0.5 ? 'rgba(10,20,60,0.22)' : 'rgba(120,150,220,0.12)'; c.fillRect(x, y, 1, 1); }
    for (let k = 0; k < w * h / 24; k++) { c.fillStyle = 'rgba(8,14,40,0.35)'; c.fillRect(r() * w | 0, r() * h | 0, 1, 1); }
  };
  void hex;
  const tSeat = L.cvs(64, 32, (c) => { const r = L.rng(41); weave(c, 64, 32, r, '#2c56a8');
    const g = c.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(0,0,30,0.35)'); c.fillStyle = g; c.fillRect(0, 0, 64, 32);
    c.fillStyle = '#16306a'; c.fillRect(0, 0, 64, 1); c.fillRect(0, 31, 64, 1); c.fillRect(0, 0, 1, 32); c.fillRect(63, 0, 1, 32);
    c.fillStyle = '#5a82d0'; for (let x = 2; x < 62; x += 3) { c.fillRect(x, 2, 1, 1); c.fillRect(x, 29, 1, 1); } });
  const tBack = L.cvs(64, 32, (c) => { const r = L.rng(42); weave(c, 64, 32, r, '#2a50a0');
    for (const bx of [10, 32, 54]) for (const by of [9, 22]) { c.fillStyle = 'rgba(6,14,44,0.55)'; c.fillRect(bx - 4, by, 9, 1); c.fillRect(bx, by - 4, 1, 9); c.fillStyle = '#132a5e'; c.fillRect(bx - 1, by - 1, 3, 3); c.fillStyle = '#5c86d6'; c.fillRect(bx - 1, by - 1, 1, 1); }
    c.fillStyle = '#16306a'; c.fillRect(0, 0, 64, 1); c.fillRect(0, 31, 64, 1); });
  const tArm = L.cvs(32, 32, (c) => { const r = L.rng(43); weave(c, 32, 32, r, '#2a52a2');
    c.fillStyle = 'rgba(160,190,250,0.22)'; c.fillRect(0, 0, 32, 6); c.fillStyle = '#16306a'; c.fillRect(0, 7, 32, 1); c.fillStyle = 'rgba(0,0,30,0.35)'; c.fillRect(0, 24, 32, 8); });
  const tBase = L.cvs(64, 16, (c) => { const r = L.rng(44); weave(c, 64, 16, r, '#1f4088'); c.fillStyle = '#10265a'; c.fillRect(0, 0, 64, 2); c.fillStyle = 'rgba(0,0,20,0.4)'; c.fillRect(0, 10, 64, 6);
    c.fillStyle = '#3a64b8'; for (let x = 0; x < 64; x += 4) c.fillRect(x, 13, 2, 3); });
  const couch = new THREE.Group(); scene.add(couch);
  { const g = couch, fSeat = lam(tSeat), fBack = lam(tBack), fArm = lam(tArm), fBase = lam(L.rep(tBase, 2, 1)), leg = lam(null, 0x2a1a10);
    B(SW, 0.26, SD, fBase, 0, 0.21, 0, g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(0.06, 0.08, 0.06, leg, sx * (SW / 2 - 0.08), 0.04, sz * (SD / 2 - 0.08), g);
    B(SW / 2 - 0.2, 0.12, SD - 0.24, fSeat, -(SW / 4 - 0.1), 0.4, -0.1, g); B(SW / 2 - 0.2, 0.12, SD - 0.24, fSeat, SW / 4 - 0.1, 0.4, -0.1, g);
    B(SW, 0.3, 0.12, fBase, 0, 0.5, SD / 2 - 0.06, g);
    for (const k of [-1, 0, 1]) { const cu = B(SW / 3 - 0.16, 0.34, 0.16, fBack, k * (SW / 3 - 0.13), BACK_TOP - 0.22, SD / 2 - 0.15, g); cu.rotation.x = -0.12; }
    B(SW - 0.36, 0.06, 0.2, fArm, 0, BACK_TOP - 0.03, SD / 2 - 0.1, g);
    for (const sx of [-1, 1]) { B(0.2, 0.3, SD, fArm, sx * (SW / 2 - 0.1), 0.49, 0, g); const roll = B(0.24, 0.08, SD + 0.02, fArm, sx * (SW / 2 - 0.1), 0.66, 0, g); roll.rotation.z = sx * 0.12; }
    const pil = B(0.4, 0.12, 0.34, fBack, SW / 2 - 0.42, 0.55, 0.12, g); pil.rotation.set(0.5, 0.6, 0.2); }

  // ---------- boards (3, gaps between) ----------
  const BZ = 0.035;   // board centre z (on the casing)
  const BOARDS = [{ y: 1.42, rz: -0.025 }, { y: 1.77, rz: 0.035 }, { y: 1.08, rz: 0.03 }];   // nailing order in 02
  const boards = BOARDS.map((d) => {
    const g = new THREE.Group(); g.position.set(-0.7, d.y, BZ); scene.add(g);   // pivot = left nail (drops on 'twice')
    const b = B(1.55, 0.16, 0.026, mBoard, 0.7, 0, 0, g); void b;
    for (const x of [0.04, 0.12, 1.3, 1.38]) { cyl(0.008, 0.008, 0.008, 6, mNail, x, 0.035 * (x < 1 ? 1 : -1), 0.016, g).rotation.x = Math.PI / 2; }
    return { g, d };
  });
  { const bp = L.plane(0.12, 0.12, mPrint, 1.05, 0.0, 0.0135, boards[1].g); bp.rotation.z = 0.4; }
  // ---------- plywood sheet + screws ----------
  const PLY = { x0: -0.72, x1: 0.72, y0: 0.78, y1: 2.17, z: 0.03, t: 0.018 };
  const ply = B(PLY.x1 - PLY.x0, PLY.y1 - PLY.y0, PLY.t, mPly, 0, (PLY.y0 + PLY.y1) / 2, PLY.z, scene);
  const PFZ = PLY.z + PLY.t / 2;   // plywood front face
  const screws = [];
  const mScrew = lam(null, 0xc8c4b8);
  const addScrew = (x, y) => { const s = cyl(0.009, 0.007, 0.006, 8, mScrew, x, y, PFZ + 0.003, scene); s.rotation.x = Math.PI / 2; B(0.011, 0.002, 0.002, mDark, 0, 0.0035, 0, s); screws.push(s); return s; };
  for (let y = PLY.y0 + 0.06; y < PLY.y1 - 0.02; y += 0.305) { addScrew(PLY.x0 + 0.05, y); addScrew(PLY.x1 - 0.05, y); }
  for (let x = PLY.x0 + 0.05 + 0.305; x < PLY.x1 - 0.1; x += 0.305) addScrew(x, PLY.y1 - 0.06);
  const NBASE = screws.length;

  // ---------- 2x4 brace: origin at the TOP end, runs along -Y ----------
  function makeBrace(len) {
    const g = new THREE.Group();
    B(0.09, len, 0.04, m2x4, 0, -len / 2, 0, g);
    for (const yy of [-0.04, -len + 0.05]) cyl(0.007, 0.007, 0.006, 6, mNail, 0, yy, 0.021, g).rotation.x = Math.PI / 2;
    return g;
  }

  // ---------- props held by Ava ----------
  function makeHammer() {   // origin = grip point, handle along +Y, striking face toward +Z
    const g = new THREE.Group();
    B(0.028, 0.32, 0.022, lam(L.rep(tHandle, 1, 1)), 0, 0.06, 0, g);
    B(0.032, 0.03, 0.03, mDark, 0, -0.09, 0, g);
    const head = new THREE.Group(); head.position.set(0, 0.23, 0); g.add(head);
    B(0.036, 0.04, 0.11, mSteel, 0, 0, 0.01, head);
    cyl(0.022, 0.022, 0.03, 8, lam(null, 0xb8bec4), 0, 0, 0.075, head).rotation.x = Math.PI / 2;   // face
    const cl = B(0.03, 0.022, 0.08, mSteel, 0, 0.012, -0.075, head); cl.rotation.x = -0.5;              // claw
    return g;
  }
  function makeDrill() {   // origin = grip point, grip along +Y, bit toward +Z
    const g = new THREE.Group(), mY = lam(tDrill), mB = lam(null, 0x1c1c1e);
    const grip = B(0.038, 0.12, 0.05, mB, 0, -0.005, 0, g); grip.rotation.x = 0.15;
    B(0.06, 0.09, 0.2, [mY, mY, mY, mY, mY, mY], 0, 0.1, 0.03, g);
    B(0.05, 0.06, 0.05, mB, 0, 0.1, -0.08, g);   // motor cap with vents
    B(0.07, 0.05, 0.1, mB, 0, -0.09, 0.012, g); B(0.072, 0.012, 0.102, lam(null, 0xe8b818), 0, -0.065, 0.012, g);   // battery
    B(0.012, 0.022, 0.018, lam(null, 0xd03020), 0, 0.045, 0.032, g);   // trigger
    const ch = new THREE.Group(); ch.position.set(0, 0.1, 0.13); g.add(ch);
    cyl(0.022, 0.016, 0.05, 8, mB, 0, 0, 0.025, ch).rotation.x = Math.PI / 2;
    cyl(0.013, 0.01, 0.03, 6, mSteel, 0, 0, 0.065, ch).rotation.x = Math.PI / 2;
    const bit = cyl(0.004, 0.004, 0.07, 5, lam(null, 0xd8dce0), 0, 0, 0.11, ch); bit.rotation.x = Math.PI / 2;
    return { g, chuck: ch, tipLocal: V(0, 0.1, 0.13 + 0.145) };
  }

  // ---------- Ava ----------
  const ch = L.hero(); scene.add(ch.root);
  const palmOf = (side, d = 0.78) => ch.hand(side).localToWorld(V(0, d, 0));
  const setPose = (rotY, clip, x) => { ch.root.position.set(0, 0, 0); ch.root.rotation.y = rotY; ch.pose(0, L.still(clip, x)); ch.root.updateMatrixWorld(true); };
  const fixIn = (prop, side, mW) => { ch.hand(side).add(prop); ch.hand(side).matrixWorld.clone().invert().multiply(mW).decompose(prop.position, prop.quaternion, prop.scale); };
  const basis = (x, y, z) => new THREE.Matrix4().makeBasis(x, y, z);
  // hammer: at the strike frame (hammer f8) the handle stands up from the fist, the face points at the wall (-z)
  const hammer = makeHammer();
  setPose(Math.PI, 'hammer', 7 / 30);
  const HIT = palmOf('R');
  { const up = V(0, 1, 0.12).normalize(), f = V(0, 0, -1), x = up.clone().cross(f).normalize(), f2 = x.clone().cross(up).normalize();
    fixIn(hammer, 'R', basis(x, up, f2).setPosition(HIT)); }
  hammer.updateMatrixWorld(true);
  const HAMMER_FACE_Z = hammer.localToWorld(V(0, 0.23, 0.09)).z;   // face z with the root at the origin
  // drill: at drill f1 the grip stands up in the fist, the bit points at the wall
  const drill = makeDrill();
  setPose(Math.PI, 'drill', 0);
  { const p = palmOf('R'); fixIn(drill.g, 'R', basis(V(-1, 0, 0), V(0, 1, 0), V(0, 0, -1)).setPosition(p)); }
  drill.g.updateMatrixWorld(true);
  const DRILL_TIP0 = drill.g.localToWorld(drill.tipLocal.clone());   // root at origin, facing -z
  // pistol (ep1 hall.js): grip in the right fist, muzzle forward-down; reload slide/mag parts
  const RL = {};
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
  // brace (15): ep1 wedge method — final push_heavy pose, L palm holds the brace top against the plywood, foot on the floor
  const PUSH = ['push_heavy', 0.7];
  setPose(Math.PI, ...PUSH);
  const hL0 = palmOf('L', 0.75);
  // top high on the sheet (1.55 m), foot on the floor ~1.2 m back; her L palm presses the brace where it passes her palm height
  const BT = V(-0.12, 1.55, PFZ + 0.022), BFOOT = V(-0.42, 0, PFZ + 1.22), BLEN = BT.distanceTo(BFOOT);
  const sP = (BT.y - hL0.y) / BT.y, PP = BT.clone().lerp(BFOOT, sP);     // point on the brace at palm height
  const BRACE_ROOT = V(PP.x - hL0.x + 0.03, 0, PP.z + 0.045 - hL0.z);
  const braceQ = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), BFOOT.clone().sub(BT).normalize());
  const braceQ0 = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), V(-0.15, -1, 0.35).normalize());   // held more upright before
  const braceWorld = makeBrace(BLEN); scene.add(braceWorld); braceWorld.position.copy(BT); braceWorld.quaternion.copy(braceQ);
  const cleat = B(0.2, 0.04, 0.09, m2x4, BFOOT.x, 0.02, BFOOT.z + 0.07, scene);   // floor cleat stopping the foot
  const braceHand = new THREE.Group();

  // ---------- zombies ----------
  window.__fx.renderer.localClippingEnabled = true;
  async function zombie(name, { h = 1.8, tex = null, clipZ = -0.11 } = {}) {
    const g = await L.loadModel(`models/${name}.glb`);
    const root = L.ps1Clone(g.scene);
    if (tex) { const t = await L.loadTex(tex, 256); t.flipY = false; t.needsUpdate = true; root.traverse((o) => { if (o.isMesh) { o.material.map = t; o.material.color.set(0xffffff); o.material.needsUpdate = true; } }); }
    const planes = [new THREE.Plane(V(0, 0, -1), clipZ)];   // nothing of the zombie enters the room (clips z > clipZ)
    root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.clippingPlanes = planes; }); });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), acts = {};
    const act = (n) => acts[n] || (acts[n] = (() => { const a = mixer.clipAction(THREE.AnimationClip.findByName(g.animations, n)); a.play(); a.setEffectiveWeight(0); return a; })());
    let hip = null; root.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; });
    const hip0 = hip.position.clone();
    scene.add(wrap);
    return { wrap, plane: planes[0], pose(list) { for (const a of Object.values(acts)) a.setEffectiveWeight(0); for (const [n, t, w] of list) { const a = act(n), d = a.getClip().duration; a.time = ((t % d) + d) % d; a.setEffectiveWeight(w); } mixer.update(0); hip.position.copy(hip0); } };
  }
  const zA = await zombie('thin-zombie', { h: 1.78, tex: 'tex/thin_zombie.png' });
  const zB = await zombie('city-zombie', { h: 1.8 });
  let zHandR = null; zA.wrap.traverse((o) => { if (/^hand.?R$/.test(o.name)) zHandR = o; });
  void SkeletonUtils;

  // ---------- state ----------
  function setState({ glassOn = false, nBoards = 0, drop = 0, plyOn = false, nScrews = 0, brace = null, zombie = null, arm = false, prop = null, hero = true, couchAt = null } = {}) {
    glass.visible = glassOn; shards.visible = !glassOn && !plyOn;
    boards.forEach((b, i) => { b.g.visible = i < nBoards && !plyOn; b.g.rotation.z = b.d.rz; b.g.position.set(-0.7, b.d.y, BZ); });
    if (drop) { const b = boards[2]; b.g.rotation.z = b.d.rz - 0.16 * drop; }
    ply.visible = plyOn; screws.forEach((s, i) => { s.visible = plyOn && i < nScrews; });
    braceWorld.visible = brace === 'world'; cleat.visible = brace === 'world' || brace === 'hand'; braceHand.visible = brace === 'hand';
    zA.wrap.visible = zombie === 'A' || arm; zB.wrap.visible = zombie === 'B'; zA.plane.constant = arm ? 5 : -0.11;
    print.visible = glassOn; win.position.set(0, 0, 0); win.rotation.set(0, 0, 0);
    ch.root.visible = hero; pistol.visible = prop === 'pistol'; hammer.visible = prop === 'hammer'; drill.g.visible = prop === 'drill';
    couch.visible = !!couchAt; if (couchAt) { couch.position.set(couchAt[0], 0, couchAt[1]); couch.rotation.y = couchAt[2] || 0; }
    ch.root.rotation.set(0, 0, 0);
  }
  // zombie hits on the boards (global s): only the boards move, never Ava or the camera
  function rattle(t, k) {
    let a = 0;
    for (const t0 of WIN_HITS) { const d = t - t0; if (d >= 0 && d < 0.5) a += Math.exp(-d * 10) * Math.cos(d * 60); }
    win.position.z = 0.006 * k * a; win.rotation.z = 0.003 * k * a;   // the whole window (sash, glass, boards, plywood) jolts; Ava/camera never
    boards.forEach((b, i) => { b.g.position.z = BZ + 0.012 * k * a * (i === 0 ? 1 : 0.6); b.g.rotation.z += 0.006 * k * a * (i % 2 ? -1 : 1); });
    return a;
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 40);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const vignette = (o, k = 0.45) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.28, LW / 2, LH * 0.45, LH * 0.64);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  const ov = (k) => (lt, dt, a, o) => vignette(o, k);
  const out = {};

  // 01 (0-2.3): medium frontal, Ava with the pistol (reload) in front of the window, a zombie pressed to the glass behind her
  { const c = cam(50);
    out['01_hero'] = { scene, camera: c, overlay: ov(0.4), update(lt, t) {
      setState({ glassOn: true, zombie: 'A', prop: 'pistol' }); rattle(t, 1);
      zA.wrap.position.set(0.32, 0, -0.42); zA.wrap.rotation.y = -0.15; zA.pose([['attack2', 0.4 + lt * 0.9, 1]]);
      ch.root.position.set(-0.2, 0, 0.8);
      ch.pose(lt, [L.seg('reload', 0)], [[-99, lt > 1.62 && lt < 1.76 ? 'blink' : lt > 0.27 && lt < 1.45 ? 'angry' : lt > 1.9 ? 'wink' : 'open', mouthAt(t, lt > 1.9 ? 'smile' : 'neutral')]]);
      reloadProps(lt);
      look(c, V(0.05, 1.32, 2.75 - lt * 0.04), V(0.0, 1.22, 0)); ch.lookAt(c, 1, 40);
    } };
  }
  // 02 (2.3-5.4): 3/4 back, she nails the boards (one goes up on each other hit), on "movies" the hammer goes up high
  const t02 = 2.3, HAM_X = -0.12, HAM_Z = BZ + 0.013 - HAMMER_FACE_Z;
  const tMovie = WT('movies') - t02 - 0.15;
  { const c = cam(50);
    out['02_nail'] = { scene, camera: c, overlay: ov(0.45), update(lt, t) {
      const hit = (k) => 7 / 30 + 0.4 * k;   // hammer strikes (hammer loop: f8, f20, f32)
      const n = lt < hit(0) ? 0 : lt < hit(2) ? 1 : lt < hit(4) ? 2 : 3;
      setState({ glassOn: true, nBoards: n, zombie: 'A', prop: 'hammer' }); rattle(t, 1);
      zA.wrap.position.set(0.25, 0, -0.42); zA.wrap.rotation.y = -0.1; zA.pose([['attack2', 1.2 + lt * 0.9, 1]]);
      ch.root.position.set(HAM_X, 0, HAM_Z); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('hammer', 0, { loop: true }), L.seg('hammer_high', tMovie, { fade: 0.1 })], [[-99, lt > tMovie + 0.15 ? 'happy' : 'angry', mouthAt(t, lt > tMovie ? 'smileOpen' : 'neutral')]]);
      look(c, V(-1.45, 1.55, 2.25), V(0.0, 1.3, 0.2));
    } };
  }
  // 03 (5.4-7.4): frontal, boarded window, zombie in the gaps; hands on hips, looks at camera; on "twice" the low board gives
  const t03 = 5.4, tTwice = WT('twice') - t03;
  { const c = cam(48);
    out['03_fail'] = { scene, camera: c, overlay: ov(0.45), update(lt, t) {
      const d = L.smooth((lt - tTwice) / 0.12);
      setState({ nBoards: 3, drop: d, zombie: 'A' }); rattle(t, 1);
      zA.wrap.position.set(0.05, 0, -0.38); zA.wrap.rotation.y = 0.05; zA.pose([['attack2', 2.0 + lt * 0.9, 1]]);
      ch.root.position.set(0.12, 0, 0.85);
      const eyes = lt > tTwice + 0.05 && lt < tTwice + 0.8 ? 'surprised' : lt > 0.9 && lt < 1.0 ? 'blink' : 'open';
      ch.pose(lt, [L.seg('hands_on_hips', 0, { from: 0.4, speed: 0.6 })], [[-99, eyes, mouthAt(t, lt > tTwice + 0.05 ? 'gasp' : 'smile')]]);
      look(c, V(0.05, 1.33, 2.65 - lt * 0.05), V(0.04, 1.25, 0)); ch.lookAt(c, 1, 40);
    } };
  }
  // 04 (7.4-9.3): side close-up, the zombie arm pushes through the gap toward Ava, grabbing; boards shake; PlayStation X prompt
  const t04 = 7.4;
  { const c = cam(46);
    out['04_hand'] = { scene, camera: c, update(lt, t) {
      setState({ nBoards: 3, drop: 1, zombie: null, arm: true });
      rattle(t, 1.6);
      // the real thin-zombie right behind the boards: attack2 held around its right-arm swing (clip 0.25-0.30 s = hand
      // passes from the gap to full reach), punched forward on each hit in WIN_HITS; clipping off so the arm enters the room
      let p = 0; for (const h of WIN_HITS) { const d = t - h; p = Math.max(p, Math.exp(-((d / 0.14) ** 2))); }
      zA.wrap.position.set(0, 0, 0); zA.wrap.rotation.y = 0.35;
      zA.pose([['attack2', 0.275 + 0.012 * p + 0.003 * Math.sin(lt * 9), 1]]);
      { zA.wrap.updateMatrixWorld(true); const hp = zHandR.getWorldPosition(V());   // place the body so the hand sits in the gap, reaching at Ava
        zA.wrap.position.copy(V(0.22, 1.32 + 0.03 * Math.sin(lt * 6), 0.12 + 0.18 * p + 0.03 * Math.sin(lt * 4.3)).sub(hp)); }
      ch.root.position.set(0.42, 0, 0.9); ch.root.rotation.y = -2.62;
      ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 0.3 })], [[-99, lt < 0.15 ? 'surprised' : 'shocked', mouthAt(t, 'gasp')]]);
      look(c, V(-0.8, 1.32, 1.2), V(0.32, 1.36, 0.55));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45);
      const c = o.tctx, s = 1 + 0.08 * Math.sin(lt * 10) * (lt > 0.3 ? 1 : 0), x = Math.round(LW * 0.5), y = Math.round(LH * 0.35), R = Math.round(17 * s);
      if (lt < 0.25) return;
      c.fillStyle = 'rgba(20,30,60,0.55)'; c.beginPath(); c.arc(x + 1, y + 2, R + 2, 0, 7); c.fill();
      c.fillStyle = '#e8ecf4'; c.beginPath(); c.arc(x, y, R + 2, 0, 7); c.fill();
      c.fillStyle = '#1c2a5a'; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
      c.fillStyle = '#e8ecf4'; c.beginPath(); c.arc(x, y, R - 3, 0, 7); c.fill();
      c.strokeStyle = '#3a6ae0'; c.lineWidth = 4; c.lineCap = 'square'; const k = Math.round(R * 0.42);
      c.beginPath(); c.moveTo(x - k, y - k); c.lineTo(x + k, y + k); c.moveTo(x + k, y - k); c.lineTo(x - k, y + k); c.stroke();
    } };
  }
  // 10 (25.55-28.15): over her shoulder, she drives screws into the plywood with a yellow drill on "screws", "nails", "twelve"
  const t10 = 25.55, DRILLS = [WT('screws'), WT('nails'), WT('twelve')].map((w) => w - t10);
  const DROW_Y = 0.78 + 0.06 + 0.305 * 2;   // the row she is screwing (left edge column height)
  { const c = cam(50);
    // root for each drilling: the bit tip lands on the sheet at x = -0.36 + 0.305 k
    const rootFor = (k) => V(-0.36 + 0.305 * k - DRILL_TIP0.x, 0, PFZ + 0.01 - DRILL_TIP0.z);
    out['10_drill'] = { scene, camera: c, overlay: ov(0.45), update(lt, t) {
      let k = 0; for (let i = 0; i < 3; i++) if (lt > DRILLS[i] - 0.35) k = i;
      const prev = rootFor(Math.max(0, k - 1)), cur = rootFor(k), mv = L.smooth((lt - (DRILLS[k] - 0.35)) / 0.25);
      const done = DRILLS.filter((d) => lt > d + 0.25).length;
      setState({ plyOn: true, nScrews: NBASE, prop: 'drill' });
      // drilled screws in this row (inside the sheet): the ones driven appear as she finishes each
      for (let i = 0; i < 3; i++) { const s = rowScrews[i]; s.visible = i < done || (i === done && lt > DRILLS[i]); if (s.visible) { const dz = i === done ? (1 - L.smooth((lt - DRILLS[i]) / 0.25)) * 0.03 : 0; s.position.z = PFZ + 0.003 + dz; s.rotation.y = lt * 30; } }
      ch.root.position.copy(k === 0 ? cur : prev.clone().lerp(cur, mv)); ch.root.rotation.y = Math.PI;
      const spinning = DRILLS.some((d) => lt > d - 0.05 && lt < d + 0.4);
      drill.chuck.rotation.z = spinning ? lt * 60 : 0;
      ch.pose(lt, [L.seg('drill', 0, { loop: true, speed: spinning ? 1 : 0.3 })], [[-99, 'angry', mouthAt(t, 'neutral')]]);
      look(c, V(0.95, 1.6, 1.75), V(-0.15, 1.3, 0.15));
    } };
  }
  // drilled row: heights match the bit tip (DRILL_TIP0.y), x = the three stops
  const rowScrews = [0, 1, 2].map((k) => addScrew(-0.36 + 0.305 * k, DRILL_TIP0.y));
  // 12 (35.6-37.1): profile, she looks at the covered window, nods on "outside"
  const t12 = 35.6;
  { const c = cam(46);
    out['12_look'] = { scene, camera: c, overlay: ov(0.45), update(lt, t) {
      setState({ plyOn: true, nScrews: NBASE });
      for (const s of rowScrews) { s.visible = true; s.position.z = PFZ + 0.003; }
      ch.root.position.set(0.55, 0, 1.0); ch.root.rotation.y = Math.atan2(-0.55, -1.0);
      const tN = WT('outside') - t12 - 0.25;
      ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 0.5 }), L.seg('nod', tN, { fade: 0.15 })], [[-99, lt > 0.55 && lt < 0.65 ? 'blink' : 'open', mouthAt(t, 'neutral')]]);
      look(c, V(-0.85, 1.48, 1.8), V(0.42, 1.37, 0.75));
    } };
  }
  // 15 (40.9-44.6): 3/4 back over the blue couch; she sets the 2x4 brace on "brace", taps the sheet on "door"
  const t15 = 40.9, tBrace = WT('brace') - t15, tDoor = WT('door') - t15;
  { const c = cam(50);
    out['15_brace'] = { scene, camera: c, overlay: ov(0.45), update(lt, t) {
      const placed = lt > tBrace + 0.05;
      setState({ plyOn: true, nScrews: NBASE, brace: 'world', couchAt: [-0.3, 2.55, 0] });
      for (const s of rowScrews) { s.visible = true; s.position.z = PFZ + 0.003; }
      // the brace stands upright against the sheet, then on "brace" its top slides down and the foot kicks back into the cleat
      const kb = L.smooth((lt - (tBrace - 0.4)) / 0.4);
      braceWorld.position.copy(V(BT.x, 1.83, PFZ + 0.03).lerp(BT, kb)); braceWorld.quaternion.copy(braceQ0).slerp(braceQ, kb);
      const step = L.smooth((lt - (tDoor - 0.35)) / 0.25);
      ch.root.position.copy(BRACE_ROOT).add(V(0.1 * step, 0, -0.06 * step)); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg(PUSH[0], 0, { from: 0.1, speed: 0.12 }), L.seg(PUSH[0], tBrace - 0.4, { from: 0.4, speed: 0.75 }), L.seg(PUSH[0], tBrace, { from: PUSH[1], speed: 0 }),
        L.seg('knock', tDoor - 0.3, { fade: 0.25 })], [[-99, placed ? 'happy' : 'angry', mouthAt(t, placed ? 'smile' : 'neutral')]]);
      look(c, V(0.7, 1.8, 3.75), V(0.0, 0.85, 0.4));
    } };
  }
  for (const o of [sash, glass, shards, print, ply, ...boards.map((b) => b.g), ...screws]) win.attach(o);
  return out;
}
