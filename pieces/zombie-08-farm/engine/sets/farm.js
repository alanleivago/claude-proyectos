// sets/farm.js — ep8 LARGO "AVA: The Last Farm — Day 1": every exterior of the farm (one shared world, the time of day is set
// per shot in update()) + the highway jam of the fake ending (its own small scene). Contract: ../SETS.md (copy of the ep3 long).
// World (m): house at the origin facing +z (porch z 4..6.4), barn west (-20,-4) with its big sliding door on the EAST wall
// (x=-14, facing the house), silo (-30,-14), well (9,7) + hand pump, shed (13,-3), pen between house and barn, pasture east
// (x 20..60), pond behind the barn (-24,-27), gravel road south to the gate at z=70, corn all around.
// Props: photo->lowpoly GLBs (objects/): pickup, generator, jerrycan, bucket, handpump, padlock, chain, haybale(_round), feedsack.
// Animals: Quaternius cow (CC0), Poly by Google hen + rooster (CC-BY, rigged for this video), Ribbon (sets/dog.js).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { loadDog } from './dog.js';
import { paintScared } from './avaface.js';
import { addFarmDetail } from './farmdetail.js';

export async function shots(ctx) {
  const { L, TL, T, at, endOf, youDied } = ctx;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (a, b, c) => `rgb(${Math.max(0, Math.min(255, a | 0))},${Math.max(0, Math.min(255, b | 0))},${Math.max(0, Math.min(255, c | 0))})`;
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const basic = (t, col = 0xffffff, extra) => L.basic(t, col, extra);
  const DS = THREE.DoubleSide;
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const noiseTex = (w, h, base, amp, seed, extra) => L.cvs(w, h, (c) => { const r = L.rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (r() - 0.5) * amp; px(c, x, y, rgb(base[0] + n, base[1] + n, base[2] + n * 0.6)); } if (extra) extra(c, r, w, h); });
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const mouthAt = (t, base = 'neutral') => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const W = (take, k = 0) => at(take, k);

  // ================= textures =================
  const tGrass = noiseTex(64, 64, [92, 124, 52], 34, 1, (c, r) => { for (let k = 0; k < 160; k++) px(c, r() * 64 | 0, r() * 64 | 0, r() < 0.5 ? '#6e8a3a' : '#a4a85a', 1, 2); });
  tGrass.wrapS = tGrass.wrapT = THREE.RepeatWrapping;
  const tDirt = noiseTex(64, 64, [128, 104, 74], 30, 2, (c, r) => { for (let k = 0; k < 120; k++) px(c, r() * 64 | 0, r() * 64 | 0, r() < 0.5 ? '#8a6e4c' : '#a88c66', 2, 1); });
  const tGravel = noiseTex(64, 64, [150, 142, 128], 50, 3, (c, r) => { for (let k = 0; k < 260; k++) px(c, r() * 64 | 0, r() * 64 | 0, ['#6e6a62', '#c8c0b0', '#8a8478', '#a09888'][k % 4], 2, 2); });
  const tBarn = L.cvs(64, 64, (c) => { const r = L.rng(4); for (let x = 0; x < 64; x++) { const b = Math.floor(x / 8), sh = (b % 2 ? -10 : 6) + (r() - 0.5) * 8; for (let y = 0; y < 64; y++) px(c, x, y, rgb(150 + sh + (r() - 0.5) * 16, 34 + sh * 0.3 + (r() - 0.5) * 8, 28 + (r() - 0.5) * 8)); if (x % 8 === 0) for (let y = 0; y < 64; y++) px(c, x, y, '#4a0e0a'); }
    for (let k = 0; k < 30; k++) px(c, r() * 64 | 0, r() * 64 | 0, '#7a2a22', 1, 3 + (r() * 5 | 0)); });
  const tTrim = noiseTex(16, 16, [226, 222, 208], 16, 5);
  const tRoof = L.cvs(64, 64, (c) => { const r = L.rng(6); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const rib = x % 8 < 2 ? 22 : 0; px(c, x, y, rgb(84 + rib + (r() - 0.5) * 12, 86 + rib + (r() - 0.5) * 12, 90 + rib + (r() - 0.5) * 12)); }
    for (let k = 0; k < 40; k++) px(c, r() * 64 | 0, r() * 64 | 0, '#7a4a2a', 2, 1 + (r() * 4 | 0)); });   // tin roof with rust
  const tSiding = L.cvs(64, 64, (c) => { const r = L.rng(7); for (let y = 0; y < 64; y++) { const sh = y % 6 === 5 ? -40 : y % 6 === 0 ? 10 : 0; for (let x = 0; x < 64; x++) px(c, x, y, rgb(222 + sh + (r() - 0.5) * 10, 216 + sh + (r() - 0.5) * 10, 196 + sh + (r() - 0.5) * 10)); }
    for (let k = 0; k < 20; k++) px(c, r() * 64 | 0, r() * 64 | 0, '#a8a090', 3, 1); });
  const tShingle = L.cvs(64, 64, (c) => { const r = L.rng(8); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const row = Math.floor(y / 5), off = row % 2 ? 4 : 0, edge = y % 5 === 4 || (x + off) % 8 === 0; px(c, x, y, edge ? '#2a2422' : rgb(78 + (r() - 0.5) * 18 + (row % 3) * 4, 64 + (r() - 0.5) * 14, 60 + (r() - 0.5) * 12)); } });
  const tWood = L.cvs(32, 32, (c) => { const r = L.rng(9); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const g = Math.sin(x * 0.9 + Math.sin(y * 0.3) * 2) * 10; px(c, x, y, rgb(134 + g + (r() - 0.5) * 14, 100 + g * 0.8 + (r() - 0.5) * 10, 66 + (r() - 0.5) * 8)); } for (let y = 0; y < 32; y += 8) px(c, 0, y, '#4a3420', 32, 1); });
  const tGreyWood = L.cvs(32, 32, (c) => { const r = L.rng(10); for (let x = 0; x < 32; x++) { const b = (Math.floor(x / 8) % 2) * 6; for (let y = 0; y < 32; y++) px(c, x, y, rgb(122 + b + (r() - 0.5) * 8, 116 + b + (r() - 0.5) * 8, 104 + b + (r() - 0.5) * 7)); if (x % 8 === 0) for (let y = 0; y < 32; y++) px(c, x, y, '#6e6a60'); } });
  const tStone = L.cvs(32, 32, (c) => { const r = L.rng(11); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const row = Math.floor(y / 6), off = row % 2 ? 5 : 0, m = y % 6 === 0 || (x + off) % 10 === 0; px(c, x, y, m ? '#4a4640' : rgb(140 + (r() - 0.5) * 30, 132 + (r() - 0.5) * 30, 120 + (r() - 0.5) * 26)); } });
  const tMetal = noiseTex(32, 32, [150, 156, 160], 26, 12, (c, r) => { for (let y = 0; y < 32; y += 4) px(c, 0, y, '#8a9096', 32, 1); for (let k = 0; k < 12; k++) px(c, r() * 32 | 0, r() * 32 | 0, '#8a5a3a', 2, 2); });
  const tSilo = L.cvs(32, 64, (c) => { const r = L.rng(13); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const band = y % 8 === 0 ? -30 : 0, rib = x % 4 === 0 ? 14 : 0; px(c, x, y, rgb(168 + band + rib + (r() - 0.5) * 14, 170 + band + rib + (r() - 0.5) * 14, 172 + band + rib + (r() - 0.5) * 12)); } for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 64 | 0, '#8a6a4a', 1, 2 + (r() * 6 | 0)); });
  const tCorn = L.cvs(32, 64, (c) => { const r = L.rng(14); c.clearRect(0, 0, 32, 64);
    for (let y = 6; y < 64; y++) px(c, 15, y, '#5a7a28', 2, 1);
    for (let k = 0; k < 9; k++) { const y0 = 10 + k * 6, dir = k % 2 ? 1 : -1; for (let s = 0; s < 12; s++) { const x = 16 + dir * s, y = y0 - s * 0.45 + (s * s) * 0.05; px(c, x, y | 0, s > 9 ? '#a8a24a' : r() < 0.3 ? '#7a9a3a' : '#5e8a2c', 1, 2); } }
    px(c, 14, 2, '#c8b060', 4, 6); for (let k = 0; k < 6; k++) px(c, 13 + k, 0 + (k % 2), '#d8c070', 1, 3);   // tassel
    px(c, 17, 30, '#d8c870', 3, 7); px(c, 17, 29, '#8aa040', 3, 2); });
  const tWater = noiseTex(32, 32, [70, 104, 120], 14, 15, (c, r) => { for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 32 | 0, '#9ab8c8', 3, 1); });
  const tLeaf = noiseTex(32, 32, [60, 92, 44], 40, 16, (c, r) => { for (let k = 0; k < 60; k++) px(c, r() * 32 | 0, r() * 32 | 0, r() < 0.5 ? '#3a5a2a' : '#7aa04a', 2, 2); });
  const tBark = noiseTex(16, 32, [88, 66, 48], 26, 17);
  const winTex = (lit, curtain = 0) => L.cvs(32, 48, (c) => { px(c, 0, 0, '#e8e4d8', 32, 48); const g = lit ? ['#f4d68a', '#e8b860'] : ['#3a4a5a', '#5a6e80'];
    for (const [x, y] of [[3, 3], [17, 3], [3, 25], [17, 25]]) { px(c, x, y, g[0], 12, 20); px(c, x + 1, y + 1, g[1], 4, 8); if (curtain) { px(c, x, y, curtain, 12, 20); for (let k = 0; k < 12; k += 3) px(c, x + k, y, '#00000022', 1, 20); } }
    px(c, 0, 0, '#6a6458', 32, 1); px(c, 0, 47, '#6a6458', 32, 1); });
  const tWinDark = winTex(false), tWinLit = winTex(true), tWinCurt = winTex(false, '#7a3a2a'), tWinCurtLit = winTex(true, '#b05a3a');
  const tDoor = L.cvs(32, 64, (c) => { const r = L.rng(18); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(98 + (r() - 0.5) * 12, 46 + (r() - 0.5) * 8, 30)); for (const [x, y] of [[4, 4], [18, 4], [4, 34], [18, 34]]) { px(c, x, y, '#5a2a18', 10, 26); px(c, x + 1, y + 1, '#8a4a30', 8, 24); } px(c, 26, 33, '#d8b040', 3, 3); });
  // sky gradients per time of day
  const SKY = {
    dawn: ['#f0b880', '#e8c8a0', '#8aa0c8', '#3a5a9a'], day: ['#d8e8f0', '#b0d0ec', '#78a8dc', '#4a7ec4'], noon: ['#e8f0f4', '#c0dcf0', '#80b4e4', '#5088cc'],
    dusk: ['#f08a4a', '#d86a4a', '#7a4a7a', '#2a2a5a'], sunset: ['#ffb060', '#f08850', '#a05a6a', '#3a3060'], night: ['#1a2440', '#121a32', '#0a1024', '#05081a'],
  };
  const skyTex = {}; for (const [k, g] of Object.entries(SKY)) skyTex[k] = L.cvs(4, 64, (c) => { const gr = c.createLinearGradient(0, 64, 0, 0); g.forEach((col, i) => gr.addColorStop(i / 3, col)); c.fillStyle = gr; c.fillRect(0, 0, 4, 64);
    if (k === 'night') { const r = L.rng(19); for (let i = 0; i < 18; i++) px(c, r() * 4 | 0, 20 + r() * 44 | 0, '#c8d0e8'); } });
  const LIGHT = {   // [sun colour, sun intensity, sun dir, ambient colour, ambient, fog colour, fog near, far]
    dawn: [0xffc890, 2.0, [30, 18, 40], 0xb8a8c0, 1.1, 0xd8b898, 60, 260], day: [0xfff4e0, 2.4, [20, 40, 30], 0xc8d4e0, 1.25, 0xc0d4e4, 80, 320],
    noon: [0xffffff, 2.6, [5, 60, 10], 0xd0d8e0, 1.3, 0xd0e0ec, 80, 320], dusk: [0xff9a60, 1.6, [-40, 12, 20], 0x8a7090, 0.95, 0x9a6a6a, 50, 220],
    sunset: [0xffa860, 2.0, [-40, 10, 30], 0xa88070, 1.05, 0xc88a6a, 50, 240], night: [0x7a94e0, 1.2, [10, 30, 20], 0x2c3a6c, 0.95, 0x0a1226, 28, 150],
  };

  // ================= world =================
  const scene = new THREE.Scene();
  const sky = L.mesh(new THREE.SphereGeometry(400, 16, 10), basic(skyTex.day, 0xffffff, { side: THREE.BackSide, fog: false, depthWrite: false }), 0, 0, 0, scene);
  const sun = new THREE.DirectionalLight(0xffffff, 2); scene.add(sun); const amb = new THREE.AmbientLight(0xffffff, 1); scene.add(amb);
  scene.fog = new THREE.Fog(0xc0d4e4, 80, 320);
  let DETAIL = null;
  const setTod = (k) => { if (DETAIL) DETAIL.setTod(k); const [sc, si, sd, ac, ai, fc, fn, ff] = LIGHT[k]; sun.color.set(sc); sun.intensity = si; sun.position.set(...sd); amb.color.set(ac); amb.intensity = ai; scene.fog.color.set(fc); scene.fog.near = fn; scene.fog.far = ff; sky.material.map = skyTex[k]; sky.material.needsUpdate = true; };
  // ground: grass everywhere, dirt yard, gravel road
  const GROUND = L.plane(800, 800, lam(L.rep(tGrass, 200, 200)), 0, 0, 0, scene, 0, -Math.PI / 2); GROUND.renderOrder = -2;
  { const y = L.mesh(new THREE.CircleGeometry(15, 20), lam((() => { const t = L.rep(tDirt, 8, 8); t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; return t; })(), 0xffffff, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 }), 2, 0.03, 12, scene); y.rotation.x = -Math.PI / 2; y.renderOrder = -1; }
  for (const [l, z] of [[52, 45], [60, 100]]) { const r = L.plane(4.2, l, lam((() => { const t = L.rep(tGravel, 2, l / 2); t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; return t; })(), 0xffffff, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 }), 0, 0.05, z, scene, 0, -Math.PI / 2); r.renderOrder = -1; }
  // ---- house: two floors, clapboard, shingle gable roof (ridge along x), porch on the front
  const house = new THREE.Group(); scene.add(house);
  const mSide = lam(L.rep(tSiding, 4, 3)), mTrim = lam(tTrim), mShing = lam(L.rep(tShingle, 6, 3), 0xffffff, { side: DS });
  B(10, 6.0, 8, mSide, 0, 3.0, 0, house);
  { const sh = new THREE.Shape(); sh.moveTo(-4.3, 0); sh.lineTo(4.3, 0); sh.lineTo(0, 2.6); sh.lineTo(-4.3, 0);   // gable ends
    for (const x of [-5.0, 5.0]) { const g = L.mesh(new THREE.ShapeGeometry(sh), lam(L.rep(tSiding, 3, 1), 0xffffff, { side: DS }), x, 6.0, 0, house); g.rotation.y = Math.PI / 2; }
    const sl = Math.hypot(4.6, 2.75); for (const s of [-1, 1]) { const r = L.plane(11.0, sl, mShing, 0, 6.0 + 1.37, s * 2.25, house, 0, 0); r.rotation.x = -s * (Math.PI / 2 - Math.atan2(4.6, 2.75)); r.rotation.order = 'YXZ'; }
    B(11.0, 0.18, 0.22, lam(null, 0x3a3230), 0, 8.62, 0, house); }
  B(0.7, 2.0, 0.7, lam(tStone), -3.4, 8.2, -1, house);   // chimney
  const WIN = [];   // windows: [mesh, wall] (lit/curtain per shot)
  const win = (x, y, z, ry) => { const m = L.plane(1.0, 1.5, basic(tWinDark), x, y, z, house, ry); WIN.push(m); B(1.2, 0.1, 0.12, mTrim, x, y - 0.8, z, house).rotation.y = ry; return m; };
  for (const x of [-3.3, -1.6, 1.6, 3.3]) win(x, 4.6, 4.02, 0);
  for (const x of [-3.3, 2.4]) win(x, 1.9, 4.02, 0);
  for (const z of [-2, 2]) { win(5.02, 1.9, z, Math.PI / 2); win(5.02, 4.6, z, Math.PI / 2); win(-5.02, 1.9, z, -Math.PI / 2); win(-5.02, 4.6, z, -Math.PI / 2); }
  const WEST_BED = win(-5.02, 4.6, -2, -Math.PI / 2);   // bedroom window that looks at the barn (end chapter)
  L.plane(1.0, 2.1, lam(tDoor), 0, 1.55, 4.02, house); B(1.25, 0.12, 0.1, mTrim, 0, 2.66, 4.05, house);
  // porch
  B(9.0, 0.5, 2.6, lam(L.rep(tWood, 6, 2)), 0, 0.25, 5.3, house);
  for (const x of [-4.3, -1.6, 1.6, 4.3]) B(0.16, 2.6, 0.16, mTrim, x, 1.8, 6.45, house);
  B(9.2, 0.14, 2.9, lam(L.rep(tShingle, 6, 2)), 0, 3.15, 5.35, house).rotation.x = 0.12;
  for (let i = 0; i < 3; i++) B(2.0, 0.17, 0.32, lam(tWood), 0, 0.085 + i * 0.17, 6.9 - i * 0.3, house);
  for (const x of [-4.3, 4.3]) for (const s of [-1, 1]) {} // (rail posts above)
  B(3.0, 0.08, 0.06, mTrim, -2.95, 1.25, 6.45, house); B(3.0, 0.08, 0.06, mTrim, 2.95, 1.25, 6.45, house);
  for (let k = 0; k < 11; k++) { B(0.05, 0.75, 0.05, mTrim, -4.25 + k * 0.27, 0.88, 6.45, house); B(0.05, 0.75, 0.05, mTrim, 1.65 + k * 0.27, 0.88, 6.45, house); }
  // ---- barn (gambrel roof), big sliding door on the east wall facing the house
  const barn = new THREE.Group(); barn.position.set(-20, 0, -4); scene.add(barn);
  const mBarn = lam(L.rep(tBarn, 4, 2), 0xffffff, { side: DS });
  { const bx = B(12, 5.0, 16, mBarn, 0, 2.5, 0, barn); const inv = basic(null, 0x000000, { visible: false }); bx.material = [inv, mBarn, mBarn, mBarn, mBarn, mBarn];   // east face (+x) open: rebuilt around the door opening
    const mE = lam(L.rep(tBarn, 1.5, 2), 0xffffff, { side: DS }); B(0.1, 5.0, 5.9, mE, 5.95, 2.5, -5.05, barn); B(0.1, 5.0, 5.9, mE, 5.95, 2.5, 5.05, barn); B(0.1, 1.0, 4.2, mE, 5.95, 4.5, 0, barn); }
  { const sh = new THREE.Shape(); sh.moveTo(-6, 0); sh.lineTo(6, 0); sh.lineTo(4.4, 2.6); sh.lineTo(0, 4.0); sh.lineTo(-4.4, 2.6); sh.lineTo(-6, 0);
    for (const z of [-8.0, 8.0]) { L.mesh(new THREE.ShapeGeometry(sh), lam(L.rep(tBarn, 3, 1), 0xffffff, { side: DS }), 0, 5.0, z, barn); }
    const mR = lam(L.rep(tRoof, 6, 2), 0xb8b8b8, { side: DS });
    for (const s of [-1, 1]) { const a = L.plane(17, Math.hypot(1.6, 2.6), mR, s * 5.2, 6.3, 0, barn); a.rotation.set(-Math.PI / 2, 0, 0); a.rotation.order = 'ZXY'; a.rotation.z = 0; a.rotation.y = 0;
      a.rotation.set(0, s * Math.PI / 2, 0); a.rotateX(-(Math.PI / 2 - Math.atan2(2.6, 1.6)));
      const b = L.plane(17, Math.hypot(4.4, 1.4), mR, s * 2.2, 8.3, 0, barn); b.rotation.set(0, s * Math.PI / 2, 0); b.rotateX(-(Math.PI / 2 - Math.atan2(1.4, 4.4))); } }
  // white X trim on the east wall + hay loft door
  const mWhite = lam(tTrim);
  B(0.12, 5.0, 0.2, mWhite, 6.02, 2.5, -8, barn); B(0.12, 5.0, 0.2, mWhite, 6.02, 2.5, 8, barn); B(0.12, 0.2, 16, mWhite, 6.02, 5.0, 0, barn);
  B(0.06, 1.6, 1.6, lam(L.rep(tBarn, 1, 1), 0xd8d8d8), 6.04, 6.4, 0, barn);
  const doorG = []; { const tD = L.cvs(32, 32, (c) => { const r = L.rng(20); for (let x = 0; x < 32; x++) for (let y = 0; y < 32; y++) px(c, x, y, rgb(142 + (x % 6 === 0 ? -50 : 0) + (r() - 0.5) * 14, 32 + (r() - 0.5) * 8, 26)); for (let k = 0; k < 32; k++) { px(c, k, k, '#e8e4d8', 2, 1); px(c, 31 - k, k, '#e8e4d8', 2, 1); } px(c, 0, 0, '#e8e4d8', 32, 2); px(c, 0, 30, '#e8e4d8', 32, 2); px(c, 0, 0, '#e8e4d8', 2, 32); px(c, 30, 0, '#e8e4d8', 2, 32); });
    for (const s of [-1, 1]) { const d = B(0.1, 4.0, 2.1, lam(tD), 6.12, 2.0, s * 1.05, barn); doorG.push(d); } }
  B(0.08, 0.1, 6.6, lam(tMetal, 0x606060), 6.16, 4.08, 0, barn);   // door track
  const barnDark = B(11.7, 4.9, 15.7, basic(null, 0x040303, { side: THREE.BackSide }), 0, 2.5, 0, barn); L.plane(11.6, 15.6, basic(null, 0x050404), 0, 0.07, 0, barn, 0, -Math.PI / 2);   // the dark inside (seen only through the door gap)
  // silo
  const silo = new THREE.Group(); silo.position.set(-30, 0, -14); scene.add(silo);
  cyl(3, 3, 14, 12, lam(L.rep(tSilo, 4, 2)), 0, 7, 0, silo); L.mesh(new THREE.SphereGeometry(3.05, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam(tMetal, 0xb8b8c0), 0, 14, 0, silo);
  // well: stone ring + little wooden roof, hand pump beside it (photo prop)
  const well = new THREE.Group(); well.position.set(9, 0, 7); scene.add(well);
  cyl(0.85, 0.9, 0.85, 12, lam(L.rep(tStone, 3, 1)), 0, 0.42, 0, well); L.mesh(new THREE.CircleGeometry(0.72, 12), basic(null, 0x0a0806), 0, 0.84, 0, well).rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) B(0.1, 1.6, 0.1, lam(tWood), s * 0.8, 1.4, 0, well);
  { const r = L.plane(2.1, 1.1, lam(L.rep(tShingle, 2, 1), 0xffffff, { side: DS }), 0, 2.3, 0.35, well); r.rotation.x = -0.9; const r2 = L.plane(2.1, 1.1, lam(L.rep(tShingle, 2, 1), 0xffffff, { side: DS }), 0, 2.3, -0.35, well); r2.rotation.x = 0.9; }
  cyl(0.05, 0.05, 1.7, 6, lam(tWood), 0, 1.75, 0, well).rotation.z = Math.PI / 2;
  const pump = await prop('handpump'); pump.position.set(10.4, 0, 7.4); pump.rotation.y = -0.5; scene.add(pump);
  // well cutaway (26): casing pipe down to the submersible pump, only in that shot
  const cut = new THREE.Group(); cut.position.set(9, 0, 7); scene.add(cut); cut.visible = false;
  { cyl(0.09, 0.09, 30, 8, lam(tMetal, 0x9aa0a8), 0, -15, 0, cut); const pm = cyl(0.11, 0.11, 1.2, 8, lam(null, 0x3a6ad0), 0, -29, 0, cut);
    const soil = L.plane(6, 32, lam(L.rep(noiseTex(32, 32, [110, 84, 58], 30, 21), 3, 16), 0xffffff, { side: DS }), 0, -16, 0.05, cut); soil.renderOrder = -1;
    const wt = L.plane(6, 8, basic(null, 0x3a6aa0, { transparent: true, opacity: 0.55 }), 0, -27, 0.06, cut); cut.userData = { pm }; }
  // shed (generator) — door open toward +z
  const shed = new THREE.Group(); shed.position.set(13, 0, -3); scene.add(shed);
  const mShed = lam(L.rep(tGreyWood, 1.5, 1), 0xffffff, { side: DS });
  B(4, 2.6, 0.1, mShed, 0, 1.3, -1.5, shed); B(0.1, 2.6, 3, mShed, -2, 1.3, 0, shed); B(0.1, 2.6, 3, mShed, 2, 1.3, 0, shed);
  B(1.3, 2.6, 0.1, mShed, -1.35, 1.3, 1.5, shed); B(1.3, 2.6, 0.1, mShed, 1.35, 1.3, 1.5, shed);
  B(4.4, 0.12, 3.6, lam(L.rep(tRoof, 2, 2)), 0, 2.75, 0, shed).rotation.x = 0.08;
  L.plane(4, 3, lam(L.rep(tDirt, 2, 2), 0x9a8a7a), 0, 0.02, 0, shed, 0, -Math.PI / 2);
  const gen = await prop('generator'); const genG = new THREE.Group(); genG.add(gen); scene.add(genG); genG.position.set(13, 0, -3.3);
  const can = await prop('jerrycan'); can.position.set(14.3, 0, -3.8); scene.add(can);
  const can2 = await prop('jerrycan'); can2.position.set(14.0, 0, -3.95); can2.rotation.y = 0.4; scene.add(can2);
  const exh = []; { const m = basic(null, 0x8a8a8a, { transparent: true, opacity: 0.45, depthWrite: false }); for (let i = 0; i < 8; i++) exh.push(B(0.12, 0.12, 0.12, m, 0, -9, 0, scene)); }
  const cord = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(), V()]), new THREE.LineBasicMaterial({ color: 0x202020 })); scene.add(cord); cord.visible = false;
  // fences: pen between house and barn, pasture east, front fence line at the gate
  const mPost = lam(tWood, 0xb09070);
  const fence = (x0, z0, x1, z1, h = 1.3) => { const l = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(l / 2.5)), a = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i <= n; i++) B(0.14, h + 0.1, 0.14, mPost, x0 + (x1 - x0) * i / n, (h + 0.1) / 2, z0 + (z1 - z0) * i / n, scene);
    for (const y of [h * 0.45, h * 0.9]) { const r = B(0.06, 0.12, l, mPost, (x0 + x1) / 2, y, (z0 + z1) / 2, scene); r.rotation.y = a; } };
  fence(-13, -2, -13, 10); fence(-13, 10, -6.5, 10); fence(-6.5, 10, -6.5, 6.5); fence(-13, -2, -6.5, -2); fence(-6.5, -2, -6.5, 1.5);
  fence(20, -22, 20, 24); fence(20, 24, 62, 24); fence(20, -22, 62, -22); fence(62, -22, 62, 24);
  fence(-60, 70, -2.6, 70); fence(2.6, 70, 60, 70);
  // stock tanks (troughs)
  const trough = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); const t = cyl(0.8, 0.8, 0.6, 12, lam(L.rep(tMetal, 3, 1), 0xd0d4d8, { side: DS }), 0, 0.3, 0, g); t.scale.z = 0.55; const w = L.mesh(new THREE.CircleGeometry(0.76, 12), lam(tWater), 0, 0.5, 0, g); w.rotation.x = -Math.PI / 2; w.scale.y = 0.55; scene.add(g); return { g, w }; };
  const TR1 = trough(-9.5, 4), TR2 = trough(24, 2);
  // pond behind the barn
  { const p = L.mesh(new THREE.CircleGeometry(7, 16), lam(L.rep(tWater, 4, 4), 0xc8d8e8), -24, 0.03, -27, scene); p.rotation.x = -Math.PI / 2; p.scale.y = 0.7;
    const r = L.mesh(new THREE.RingGeometry(6.8, 7.6, 16), lam(tDirt), -24, 0.025, -27, scene); r.rotation.x = -Math.PI / 2; }
  // gate (metal tube farm gate, two leaves) + its posts
  const gateG = new THREE.Group(); gateG.position.set(0, 0, 70); scene.add(gateG);
  const mGate = lam(tMetal, 0xa8b0b8);
  for (const s of [-1, 1]) B(0.22, 1.7, 0.22, lam(tWood, 0x8a6a4a), s * 2.4, 0.85, 0, gateG);
  const leaves = []; for (const s of [-1, 1]) { const lf = new THREE.Group(); lf.position.set(s * 2.3, 0, 0); gateG.add(lf);
    for (let k = 0; k < 5; k++) B(2.25, 0.05, 0.05, mGate, -s * 1.12, 0.3 + k * 0.25, 0, lf); for (const x of [0.05, 1.12, 2.2]) B(0.05, 1.1, 0.05, mGate, -s * x, 0.82, 0, lf); B(0.05, 1.4, 0.05, mGate, -s * 1.12, 0.85, 0, lf).rotation.z = s * 0.68; leaves.push(lf); }
  const chain = await prop('chain'); scene.add(chain); chain.visible = false;
  const lock = await prop('padlock'); scene.add(lock); lock.visible = false; const shackle = lock.getObjectByName('shackle');
  const chain2 = chain.clone(true); scene.add(chain2); chain2.visible = false;
  lock.position.set(0.0, 0.70, 69.93); lock.rotation.set(0, 0, 0.12); lock.scale.setScalar(1.4);
  // the chain wraps the two end bars where the leaves meet: loop 1 low/front-back, loop 2 a little higher (two turns)
  const putChain = (t, t1, t2) => { for (const [o, ta, y] of [[chain, t1, 0.80], [chain2, t2, 0.87]]) { o.visible = t > ta; if (!o.visible) continue; const k = Math.min(1, (t - ta) / 0.5);
      o.position.set(0, y, 70.0); o.rotation.set(0, Math.PI / 2 * (1 - k) + (y > 0.85 ? 0.2 : -0.2), 0); o.scale.set(0.42 + 0.0 * k, 1.2, 1.2); } };
  // coop by the porch, hay, feed, buckets
  const coop = await prop('coop'); { const bb = new THREE.Box3().setFromObject(coop), k = 2.2 / (bb.max.x - bb.min.x); coop.scale.setScalar(k); coop.position.set(8.2, -bb.min.y * k, 2.6); coop.rotation.y = -Math.PI / 2; scene.add(coop); }
  for (const [x, z, r] of [[-16.5, 5.5, 0.2], [-16.5, 6.5, 0], [-15.4, 6.0, 0.4]]) { const h = await prop('haybale'); h.position.set(x, 0, z); h.rotation.y = r; scene.add(h); }
  { const h = await prop('haybale'); h.position.set(-16.2, 0.44, 6.0); scene.add(h); }
  for (const [x, z] of [[-12.5, 14], [-10.8, 15.2]]) { const h = await prop('haybale_round'); h.position.set(x, 0, z); h.rotation.y = 0.6; scene.add(h); }
  for (const [x, z, r] of [[-13.5, 4.8, 0.3], [-13.2, 5.4, -0.2]]) { const f = await prop('feedsack'); f.position.set(x, 0, z); f.rotation.y = r; scene.add(f); }
  for (const [x, z] of [[8.0, 6.2], [10.0, 6.0]]) { const b = await prop('bucket'); b.position.set(x, 0, z); scene.add(b); }
  // trees (low poly) around the house
  const tree = (x, z, h) => { cyl(0.2, 0.3, h * 0.45, 6, lam(tBark), x, h * 0.22, z, scene); const c = L.mesh(new THREE.IcosahedronGeometry(h * 0.33, 0), lam(L.rep(tLeaf, 2, 2)), x, h * 0.62, z, scene); c.scale.y = 1.2; };
  // (ep8 detail pass: the trees are now card trees in farmdetail.js)
  // corn (instanced crossed planes), fields around the farm
  { const g1 = new THREE.PlaneGeometry(1.3, 2.6), g2 = g1.clone(); g2.rotateY(Math.PI / 2); g1.translate(0, 1.3, 0); g2.translate(0, 1.3, 0);
    const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js'); const geo = mergeGeometries([g1, g2]);
    const tCornM = tCorn.clone(); tCornM.minFilter = THREE.NearestMipmapLinearFilter; tCornM.generateMipmaps = true; tCornM.needsUpdate = true;
    const mC = L.lam(tCornM, 0xffffff, { side: DS, alphaTest: 0.5 });
    const fields = [[-90, -8, 22, 110], [8, 90, 28, 110], [-90, -36, -16, 22], [-80, 90, -110, -38], [66, 120, -60, 28]];
    const pts = []; const r = L.rng(22);
    for (const [x0, x1, z0, z1] of fields) for (let x = x0; x < x1; x += 0.85) for (let z = z0; z < z1; z += 0.68) { if (Math.abs(x) < 4 && z > 18) continue; pts.push([x + (r() - 0.5) * 0.35, z + (r() - 0.5) * 0.35, 0.72 + r() * 0.55 + 0.12 * Math.sin(x * 0.21 + z * 0.13), r() * 6]); }
    const im = new THREE.InstancedMesh(geo, mC, pts.length); const M = new THREE.Matrix4(), q = new THREE.Quaternion(), s = V(1, 1, 1), p = V();
    pts.forEach(([x, z, k, a], i) => { q.setFromAxisAngle(V(0, 1, 0), a); s.set(k, k, k); p.set(x, 0, z); M.compose(p, q, s); im.setMatrixAt(i, M); });
    im.frustumCulled = false; scene.add(im); }
  // the pickup (photo->lowpoly), parked in the yard; later sideways behind the gate
  const truck = await prop('pickup'); const truckG = new THREE.Group(); truckG.add(truck); scene.add(truckG);
  const TRUCK_YARD = [5.5, 14.5, 0.35], TRUCK_GATE = [0, 66.5, Math.PI / 2];
  const putTruck = (p) => { truckG.position.set(p[0], 0, p[1]); truckG.rotation.y = p[2]; };

  DETAIL = await addFarmDetail(L, scene, { grassRep: L.rep(tGrass, 225, 225), ground: GROUND, barn, barnDoors: doorG, house, windows: WIN });
  // v4: every tiled texture of the static world minifies with mipmaps (nearest inside a level): no sparkle when the camera moves
  scene.traverse((o) => { if (!o.isMesh) return; for (const m of [].concat(o.material)) { const t = m && m.map; if (!t || t.userData.mip) continue; if (t.repeat.x * t.repeat.y >= 2 || o.isInstancedMesh) { t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; t.userData.mip = 1; } } });
  // ================= animals =================
  const animal = (glb, h, axisLen = 'y') => { const root = L.ps1Clone(glb.scene); const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y); root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), acts = {}; const act = (n) => acts[n] || (acts[n] = (() => { const c = THREE.AnimationClip.findByName(glb.animations, n) || glb.animations.find((a) => a.name.endsWith('|' + n) || a.name.includes('|' + n + '|')); const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); return a; })());
    scene.add(wrap); wrap.visible = false;
    return { wrap, root, set(t, clip) { for (const a of Object.values(acts)) a.setEffectiveWeight(0); const a = act(clip), d = a.getClip().duration; a.setEffectiveWeight(1); a.time = ((t % d) + d) % d; mixer.update(0); } }; };
  const cowG = await L.loadModel('models/cow.glb'), henG = await L.loadModel('models/chicken.glb'), roosG = await L.loadModel('models/rooster.glb');
  const COWCOL = [[0x6a4028, 0xe8dcc8], [0x1a1614, 0xf0ece4], [0x8a5a34, 0xf4ece0], [0x2a2420, 0xd8ccb8], [0xc8b8a0, 0xf4f0e8], [0x5a3420, 0x2a2018]];
  const COWS = []; for (let i = 0; i < 12; i++) { const c = animal(cowG, 1.45); const [a, b] = COWCOL[i % COWCOL.length];
    c.root.traverse((o) => { if (!o.isMesh) return; o.material = [].concat(o.material).map((m) => { const n = m.name; if (n === 'Main' || n === 'Main_Light') { m = m.clone(); m.color.set(n === 'Main' ? a : b); } return m; }); if (o.material.length === 1) o.material = o.material[0]; });
    COWS.push(c); }
  const HENS = []; for (let i = 0; i < 14; i++) HENS.push(animal(henG, 0.42)); const ROOSTER = animal(roosG, 0.55);
  const dog = await loadDog(L); scene.add(dog.root); dog.root.visible = false;
  // herd layouts: pasture (morning), pen + troughs (from chapter 5), pond (36)
  const R = L.rng(40);
  const PASTURE = COWS.map((_, i) => [26 + (i % 4) * 7 + R() * 3, -14 + Math.floor(i / 4) * 11 + R() * 4, R() * 6.28, R() * 6]);
  const PEN = COWS.map((_, i) => [-11.8 + (i % 3) * 2.15, -0.4 + Math.floor(i / 3) * 2.75, (R() - 0.5) * 0.5 + (i % 2 ? Math.PI : 0), R() * 6]);
  const POND = COWS.map((_, i) => { const a = -0.6 + i * 0.5; return [-24 + Math.cos(a) * 8.2, -27 + Math.sin(a) * 6.0, Math.atan2(-Math.cos(a), -Math.sin(a)), R() * 6]; });
  const YARD = HENS.map((_, i) => [1 + (i % 5) * 1.3 + R() * 0.8, 9 + Math.floor(i / 5) * 1.4 + R() * 0.8, R() * 6.28, R() * 3]);
  const COOP = HENS.map((_, i) => [6.6 + (i % 4) * 0.55 + R() * 0.3, 4.2 + Math.floor(i / 4) * 0.55 + R() * 0.3, R() * 6.28, R() * 3]);
  // cows face +z in the Quaternius rig? measured on the stills: the head points to -z in the model -> yaw + PI
  const COW_YAW0 = Math.PI;
  const placeCows = (lay, t, clip = 'Eating', override) => COWS.forEach((c, i) => { const p = lay[i]; c.wrap.visible = true; c.wrap.position.set(p[0], 0, p[1]); c.wrap.rotation.y = p[2] + COW_YAW0; c.set(t + p[3], clip); if (override) override(c, i, t); });
  const placeHens = (lay, t, clip = 'Peck') => { HENS.forEach((h, i) => { const p = lay[i]; h.wrap.visible = true; h.wrap.position.set(p[0], 0, p[1]); h.wrap.rotation.y = p[2]; h.set(t + p[3], i % 3 === 0 ? 'Idle' : clip); });
    ROOSTER.wrap.visible = true; ROOSTER.wrap.position.set(lay[0][0] - 1.2, 0, lay[0][1] + 0.6); ROOSTER.wrap.rotation.y = 0.8; ROOSTER.set(t, 'Idle'); };

  // ================= zombies (thin zombie, ep3 model) =================
  const zSrc = await L.loadModel('models/thin-zombie.glb'); const zTex = await L.loadTex('tex/thin_zombie.png', 256); zTex.flipY = false; zTex.needsUpdate = true;
  const EYES = { visible: false }; const XENO = await L.loadModel('models/monster_xeno.glb');
  // v5 (user: the alien looked cute): Xenomorph by Slaan (CC-BY 3.0), near-black, hunched, long limbs + tail, only a cold rim light
  // and two faint eyes ON its head (found from the mesh: the snout tip is the most forward point above the shoulders)
  const MON = (() => { const g = new THREE.Group(), r = L.ps1Clone(XENO.scene); r.traverse((o) => { if (o.isMesh) o.material = L.lam(null, 0x0b0b0e, { side: DS }); });
    g.add(r); r.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(r), k = 1.95 / (bb.max.y - bb.min.y); r.scale.multiplyScalar(k); r.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(r); r.position.y = -b2.min.y; r.position.z = -(b2.max.z + b2.min.z) / 2 * 0.0; r.updateMatrixWorld(true);
    let tip = null; const v = V(), hY = (b2.max.y - b2.min.y);
    r.traverse((o) => { if (!o.isMesh) return; const P = o.geometry.attributes.position; for (let n = 0; n < P.count; n++) { v.fromBufferAttribute(P, n); o.localToWorld(v); const y = v.y - b2.min.y;
      if (y > hY * 0.62 && (!tip || v.z < tip.z)) tip = v.clone(); } });
    console.warn('XENO tip', tip.x.toFixed(2), tip.y.toFixed(2), tip.z.toFixed(2), 'bb', b2.min.y.toFixed(2), b2.max.y.toFixed(2), b2.min.z.toFixed(2), b2.max.z.toFixed(2), b2.min.x.toFixed(2), b2.max.x.toFixed(2));
    const eyeM = L.basic(null, 0xb8d070, { fog: false }); const eyes = new THREE.Group(); g.add(eyes);
    const EYEOFF = window.EYEOFF || [0, 0.21, 0.36];
    if (window.EYEDBG) { [[0, 0.0, 0.05, 0xff0000], [0, 0.12, 0.15, 0x00ff00], [0, 0.25, 0.3, 0x0000ff], [0, 0.35, 0.5, 0xffff00]].forEach(([ox, oy, oz, c]) => { for (const dx of [-0.07, 0.07]) L.mesh(new THREE.SphereGeometry(0.035, 5, 4), L.basic(null, c, { fog: false }), tip.x + ox + dx, tip.y + oy, tip.z + oz, eyes); }); }
    else for (const dx of [-0.07, 0.07]) L.mesh(new THREE.SphereGeometry(0.03, 5, 4), eyeM, tip.x + EYEOFF[0] + dx, tip.y + EYEOFF[1], tip.z + EYEOFF[2], eyes);
    scene.add(g); g.visible = false; return { wrap: g, eyes }; })();
  const rimL = new THREE.PointLight(0x7090c8, 0, 5, 1.2); rimL.position.set(-19.2, 2.3, -4.2); scene.add(rimL);
  const tentG = await L.loadModel('models/monster_tentacle.glb'); const TENT = [0, 1, 2].map(() => { const t = animal(tentG, 1.4); t.root.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) m.color.setScalar(0.035); }); return t; });
  const ZOM = []; for (let i = 0; i < 6; i++) { const z = animal(zSrc, 1.75 + (i % 3) * 0.04); z.root.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) { m.map = zTex; m.color.set([0xffffff, 0xd8dcc8, 0xc8c0b8][i % 3]); m.needsUpdate = true; } }); ZOM.push(z); }

  // ================= Ava =================
  const ch = L.hero(); scene.add(ch.root); paintScared(ch); ch.root.visible = false;
  const mug = new THREE.Group(); { cyl(0.048, 0.042, 0.105, 8, lam(null, 0xf0ece0), 0, 0, 0, mug); cyl(0.049, 0.049, 0.025, 8, lam(null, 0xc8321e), 0, 0.02, 0, mug); L.mesh(new THREE.CircleGeometry(0.044, 8), lam(null, 0x3a2010), 0, 0.051, 0, mug).rotation.x = -Math.PI / 2; const h = L.mesh(new THREE.TorusGeometry(0.03, 0.009, 4, 8), lam(null, 0xf0ece0), 0.055, 0, 0, mug); h.rotation.y = Math.PI / 2; }
  scene.add(mug); mug.visible = false;
  const placeMug = () => { ch.root.updateMatrixWorld(true); const h = ch.hand('R'); const p = h.localToWorld(V(...(window.MUGOFF || [-0.5, 0.6, 0]))); mug.position.copy(p); mug.rotation.set(0, ch.root.rotation.y + Math.PI / 2, 0); mug.visible = true; };
  const AVA = (x, z, yaw, y = 0) => { ch.root.visible = true; ch.root.position.set(x, y, z); ch.root.rotation.y = yaw; };

  // ================= shot helpers =================
  const DYN = [...COWS.map((c) => c.wrap), ...HENS.map((h) => h.wrap), ROOSTER.wrap, ...ZOM.map((z) => z.wrap), dog.root, ch.root];
  function reset(tod) {
    setTod(tod); rimL.intensity = 0; MON.wrap.visible = false; TENT.forEach((x) => x.wrap.visible = false); for (const o of DYN) o.visible = false; mug.visible = false; cut.visible = false; cord.visible = false; chain.visible = false; chain2.visible = false; lock.visible = false;
    for (const e of exh) e.position.y = -9; genG.position.set(13, 0, -3.3); genG.rotation.set(0, 0, 0); gen.position.set(0, 0, 0);
    putTruck(TRUCK_YARD); leaves[0].rotation.y = -1.3; leaves[1].rotation.y = 1.3; doorG[0].position.z = -1.05; doorG[1].position.z = 1.05;
    const night = tod === 'night'; for (const w of WIN) w.material.map = night ? tWinCurt : tWinDark; WEST_BED.material.map = night ? tWinCurt : tWinDark;
  }
  const mkCam = (fov = 40) => new THREE.PerspectiveCamera(fov, LW / LH, 0.3, 900);   // v4: near 0.3 (z-fight of the ground layers at 0.05)
  const look = (c, p, tg) => { c.position.copy(p); c.lookAt(tg); c.updateMatrixWorld(); };
  const lerpV = (a, b, k) => V(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
  // label: RE font in a dark box, pops on its word (tw global), optional pointer to a world point
  function tag(o, cam, lt, t0, tw, text, sx, sy, col = '#ffffff', world = null, hold = 99) {
    const t = t0 + lt; if (t < tw || t > tw + hold) return;
    const k = Math.min(1, (t - tw) / 0.12), c = o.tctx, w = textWidth(text, 2) + 14, h = 22;
    let x = sx, y = sy;
    if (world) { const [wx, wy] = L.toScreen(cam, ...world); if (x == null) { x = wx; y = wy - 30; } c.fillStyle = col; c.fillRect(Math.min(wx, x), wy, 1, 1);
      c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(wx + 0.5, wy + 0.5); c.lineTo(x + 0.5, y + h / 2 + 0.5); c.stroke(); c.fillRect(wx - 1, wy - 1, 3, 3); }
    c.globalAlpha = k; c.fillStyle = 'rgba(6,8,14,0.82)'; c.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), w, h); c.fillStyle = col; c.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), w, 1); c.fillRect(Math.round(x - w / 2), Math.round(y + h / 2) - 1, w, 1);
    bitText(c, text, x, y, 2, col, { outline: null }); c.globalAlpha = 1;
  }
  const out = {};
  // generic shot: tod, camera path [p0, t0, p1, t1] lerped over the shot (ease), plus per-shot setup in fn(lt, t, cam)
  function S(id, tod, camA, camB, fov, fn, ov, dur = 6) {
    const cam = mkCam(fov);
    out[id] = { scene, camera: cam, update(lt, t) { reset(tod); const k = L.smooth(lt / dur); look(cam, lerpV(camA[0], camB[0], k), lerpV(camA[1], camB[1], k)); if (fn) fn(lt, t, cam); },
      overlay: ov ? (lt, dt, a, o) => ov(lt, o, cam) : undefined };
    return out[id];
  }
  const poseAva = (lt, segs, faces, cam, lookCam = true) => { ch.pose(lt, segs, faces); if (lookCam && cam) ch.lookAt(cam, 1, 40); };
  const talk = (t, base) => mouthAt(t, base);
  const D = (id) => { const ids = Object.keys(T); const i = ids.indexOf(id); return i >= 0 && i + 1 < ids.length ? T[ids[i + 1]] - T[id] : 6; };   // shot length (s)

  // ----------------- 1. THE ALERT -----------------
  S('03_crane', 'dawn', [[34, 26, 44], [0, 2, 0]], [[20, 18, 34], [-4, 2, -2]], 42, (lt, t) => { placeCows(PASTURE, t); placeHens(YARD, t); },
    (lt, o, cam) => tag(o, cam, lt, T['03_crane'], W('h3', 'forty'), '40 MI TO TOWN', 500, 60, '#ffd23f'), D('03_crane'));
  S('04_porch', 'dawn', [[1.1, 1.8, 9.8], [0, 1.4, 6.0]], [[0.9, 1.75, 9.2], [0, 1.4, 6.0]], 36, (lt, t, cam) => { AVA(0, 6.0, 0, 0.5);
    ch.pose(lt, [L.seg('smug', 0, { speed: 0.6 })], [[-99, t > W('h4', 'best') ? 'wink' : 'open', talk(t, 'smile')]]); ch.lookAt(cam, 1, 40);
    placeHens(YARD, t); }, null, D('04_porch'));
  S('05_assets', 'dawn', [[16, 2.2, 18], [8, 1.2, 6]], [[-2, 2.4, 20], [-12, 1.6, 2]], 46, (lt, t) => { placeCows(PEN.map((p, i) => i < 4 ? [p[0] + 1, p[1] + 2, p[2], p[3]] : PASTURE[i]), t); placeHens(YARD, t);
    dog.root.visible = true; dog.root.position.set(2.5, 0, 8); dog.root.rotation.y = 0.6; dog.update(lt, 'stand', { wag: 0.8 }); },
    (lt, o, cam) => { const t0 = T['05_assets']; tag(o, cam, lt, t0, W('h5', 'well'), 'WELL', null, null, '#4fd6ff', [9, 2.4, 7]); tag(o, cam, lt, t0, W('h5', 'barn'), 'FEED', null, null, '#8cff5a', [-14, 4, -2]);
      tag(o, cam, lt, t0, W('h5', 'twelve'), 'COWS x12', null, null, '#ffd23f', [-10, 1.6, 2]); tag(o, cam, lt, t0, W('h5', 'chickens'), 'CHICKENS', null, null, '#ffd23f', [3, 0.6, 9.5]); tag(o, cam, lt, t0, W('h5', 'dog'), 'DOG x1', null, null, '#8cff5a', [2.5, 0.9, 8]); }, D('05_assets'));
  S('06_dog', 'dawn', [[3.6, 0.75, 10.6], [2.5, 0.55, 8]], [[3.3, 0.68, 9.9], [2.5, 0.55, 8]], 36, (lt, t, cam) => { dog.root.visible = true; dog.root.position.set(2.5, 0, 8); dog.root.rotation.y = 0.4; dog.update(lt, 'stare', { look: cam.position, wag: 0.9 }); placeHens(YARD, t); }, null, D('06_dog'));
  S('07_mistake', 'dawn', [[1, 1.6, 22], [5.5, 1.0, 14.5]], [[3, 1.3, 19], [5.5, 1.0, 14.5]], 36, (lt, t) => { placeHens(YARD, t); }, null, D('07_mistake'));
  S('08_coffee', 'dawn', [[-1.3, 1.75, 10.6], [0.6, 1.45, 5.6]], [[-1.1, 1.72, 10.1], [0.8, 1.45, 5.8]], 38, (lt, t, cam) => {
    const k = ease(0, 2.4, lt); AVA(0.0 + k * 1.2, 4.75 + k * 1.1, 0.5, 0.5); mug.visible = true;
    poseAva(lt, k < 1 ? [L.seg('walk', 0, { loop: true })] : [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'open', talk(t)]], cam, k >= 1); placeMug(); placeHens(YARD, t); }, null, D('08_coffee'));
  S('09_tour', 'dawn', [[30, 16, 30], [-6, 3, -2]], [[-6, 20, 40], [-10, 3, -6]], 44, (lt, t) => { placeCows(PASTURE, t); placeHens(YARD, t); },
    (lt, o, cam) => { const t0 = T['09_tour']; tag(o, cam, lt, t0, W('a2', 'house'), 'HOUSE', null, null, '#ffffff', [0, 7, 0]); tag(o, cam, lt, t0, W('a2', 'barn'), 'RED BARN', null, null, '#ff4030', [-20, 8, -4]);
      tag(o, cam, lt, t0, W('a2', 'well'), 'WELL', null, null, '#4fd6ff', [9, 2.4, 7]); tag(o, cam, lt, t0, W('a2', 'silo'), 'SILO', null, null, '#ffffff', [-30, 14, -14]); tag(o, cam, lt, t0, W('a2', 'two'), '200 ACRES', null, null, '#ffd23f', [30, 3, 50]); }, D('09_tour'));
  S('11_labels', 'day', [[22, 9, 30], [0, 1.5, 4]], [[18, 8, 27], [0, 1.5, 4]], 46, (lt, t) => { placeCows(PASTURE, t); placeHens(YARD, t); },
    (lt, o, cam) => { const t0 = T['11_labels']; [['water', 'WATER', '#4fd6ff', [9, 1.5, 7]], ['food', 'FOOD', '#8cff5a', [0, 4, 0]], ['fuel', 'FUEL', '#ff7b2e', [13, 1.5, -3]], ['tools', 'TOOLS', '#ffffff', [-14, 3, -4]], ['land', 'LAND', '#ffd23f', [30, 1, 40]]]
      .forEach(([w, s, c, p]) => tag(o, cam, lt, t0, W('a4', w), s, null, null, c, p)); }, D('11_labels'));
  S('12_listen', 'dawn', [[0.5, 1.75, 8.4], [0, 1.6, 6.0]], [[0.4, 1.72, 8.0], [0, 1.6, 6.0]], 34, (lt, t, cam) => { AVA(0, 6.0, 0, 0.5); mug.visible = true;
    poseAva(lt, [L.seg('drink', 0.3, { speed: 0.5 })], [[-99, t > W('a5', 'listen') ? 'relaxed' : 'open', talk(t)]], cam); placeMug(); }, null, D('12_listen'));
  S('13_chickens', 'dawn', [[0.2, 0.4, 14.8], [2.2, 0.32, 9.6]], [[0.8, 0.4, 14.4], [2.4, 0.32, 9.6]], 40, (lt, t) => { placeHens(YARD, t); ROOSTER.set(lt, lt > 1.0 ? 'Crow' : 'Idle'); }, null, D('13_chickens'));
  // ----------------- 2. DON'T GO TO TOWN -----------------
  S('14_truck', 'day', [[-1.6, 2.6, 3.2], [5.5, 1.0, 14.5]], [[-1.4, 2.5, 3.6], [5.5, 1.0, 14.5]], 44, (lt, t, cam) => { AVA(-0.4, 5.6, 0.45, 0.5); poseAva(lt, [L.seg('think', 0, { speed: 0.6 })], [[-99, 'open', talk(t)]], cam, false); placeHens(YARD, t); }, null, D('14_truck'));
  S('20_nope', 'day', [[1.0, 1.8, 9.8], [0, 1.4, 6.0]], [[0.9, 1.76, 9.4], [0, 1.4, 6.0]], 36, (lt, t, cam) => { AVA(0, 6.0, 0, 0.5); poseAva(lt, [L.seg('shake_head', 0, { speed: 0.9 })], [[-99, 'half', talk(t, 'frown')], [1.4, 'wink', talk(t, 'smile')]], cam); }, null, D('20_nope'));
  S('23_distance', 'day', [[0, 140, 60], [0, 0, 0]], [[0, 190, 40], [0, 0, 0]], 50, (lt, t) => { placeCows(PASTURE, t); scene.fog.near = 400; scene.fog.far = 2000; },
    (lt, o, cam) => { const t0 = T['23_distance']; if (t0 + lt < W('b11', 'two')) return; const c = o.tctx, [cx, cy] = L.toScreen(cam, 0, 0, 0), [ex] = L.toScreen(cam, 120, 0, 0), r = Math.abs(ex - cx);
      c.strokeStyle = '#ffd23f'; c.setLineDash([4, 3]); c.beginPath(); c.ellipse(cx, cy, r, r * 0.8, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); tag(o, cam, lt, t0, W('b11', 'two'), '2 MI TO ANYONE', cx, cy - r * 0.8 - 14, '#ffd23f'); }, D('23_distance'));
  S('24_stays', 'day', [[10, 2.2, 22], [3, 1.0, 10]], [[9.5, 2.1, 21], [2, 1.0, 9]], 42, (lt, t, cam) => { const k = ease(0, 3.5, lt); AVA(4.0 - k * 3.6, 12.0 - k * 5.0, Math.PI + 0.6, 0); poseAva(lt, [L.seg('walk', 0, { loop: true })], [[-99, 'open', 'neutral']], cam, false); placeHens(YARD, t); }, null, D('24_stays'));
  // ----------------- 3. THE WATER CLOCK -----------------
  S('35_cows', 'day', [[-4.0, 2.2, 9.5], [-9.5, 0.8, 3.5]], [[-4.6, 2.0, 8.4], [-9.5, 0.8, 3.5]], 44, (lt, t) => { placeCows(PEN.map((p, i) => i < 4 ? [-9.5 + Math.cos(i * 1.57 + 0.4) * 2.7, 4 + Math.sin(i * 1.57 + 0.4) * 2.7, Math.atan2(-Math.cos(i * 1.57 + 0.4), -Math.sin(i * 1.57 + 0.4)), p[3]] : [p[0], p[1] < 6 ? p[1] - 99 : p[1], p[2], p[3]]), t, 'Eating'); },
    (lt, o, cam) => { const t0 = T['35_cows']; tag(o, cam, lt, t0, W('w14', 'ten'), '10–20 GAL / DAY', 470, 70, '#4fd6ff'); tag(o, cam, lt, t0, W('w14', 'twelve'), 'x12 COWS', 470, 100, '#ffd23f');
      const t = t0 + lt, ts = W('w15', 0); if (t > ts) { const c = o.tctx, k = Math.max(0, 1 - (t - ts) / 2.6), x = 380, y = 130; c.fillStyle = 'rgba(6,8,14,0.85)'; c.fillRect(x, y, 180, 20); c.fillStyle = '#2a86d8'; c.fillRect(x + 2, y + 2, 176 * k, 16);
        bitText(c, `${Math.round(110 * k)} GAL`, x + 90, y + 10, 2, '#ffffff', { outline: '#000' }); tag(o, cam, lt, t0, W('w15', 'half'), 'GONE IN HALF A DAY', 470, 166, '#ff4030'); } }, D('35_cows'));
  S('36_pond', 'day', [[-10, 3.0, -16], [-24, 0.5, -27]], [[-11, 2.6, -17.5], [-24, 0.5, -27]], 44, (lt, t) => { placeCows(POND, t, 'Eating'); },
    (lt, o, cam) => tag(o, cam, lt, T['36_pond'], W('w16', 'pond'), 'POND = COWS', 470, 60, '#4fd6ff'), D('36_pond'));
  // ----------------- 4. THE GENERATOR -----------------
  S('38_shed', 'day', [[13, 1.6, 6], [13, 0.6, -3]], [[13, 1.3, 3.6], [13, 0.5, -3]], 38, null, (lt, o, cam) => tag(o, cam, lt, T['38_shed'], W('g1', 'diesel'), 'DIESEL GENERATOR', null, null, '#ff7b2e', [13, 0.7, -3.3]), D('38_shed'));
  const pullShot = (id, onAt, offAt) => S(id, 'day', [[13.8, 1.7, 4.6], [11.4, 0.6, 0.4]], [[13.6, 1.65, 4.3], [11.4, 0.6, 0.4]], 40, (lt, t, cam) => {
    genG.position.set(11.3, 0, 0.4); genG.rotation.y = -Math.PI / 2; AVA(11.25, 1.25, Math.PI); const pull = W('g2', 'cord'); const segs = id === '39_pull' ? [L.seg('pull_chain', pull - T[id] - 0.5, {})] : [L.seg('idle', -99, { loop: true, speed: 0.5 })];
    poseAva(lt, segs, [[-99, 'open', talk(t)]], cam, false);
    const run = (onAt != null && t > onAt && (offAt == null || t < offAt)); if (run) { const q = L.q15(lt); gen.position.set(Math.sin(q * 90) * 0.006, Math.abs(Math.sin(q * 70)) * 0.005, 0);
      exh.forEach((e, i) => { const u = ((q * 0.8 + i / exh.length) % 1); e.position.set(11.95 + u * 0.9, 0.45 + u * 0.6, 0.4 + Math.sin(i) * 0.1); e.scale.setScalar(0.6 + u * 2); }); } }, null, D(id));
  pullShot('39_pull', null, null); pullShot('40_loud', -1, null); pullShot('43_off', -1, W('g9', 'shut'));
  out['43_off'].update = ((u) => (lt, t) => { u(lt, t); })(out['43_off'].update);
  S('42_corn', 'day', [[6.0, 1.7, 19.0], [11, 1.3, 29.6]], [[6.4, 1.7, 19.8], [11, 1.3, 29.6]], 30, (lt, t) => { const z = ZOM[0]; z.wrap.visible = true; const k = ease(0.8, 3.0, lt); z.wrap.position.set(11, -1.75 + 1.75 * k, 29.6); z.wrap.rotation.y = Math.PI; z.set(lt, k < 1 ? 'idle' : 'walk'); },
    null, D('42_corn'));
  S('44_20ft', 'day', [[17.5, 5.5, 3.5], [8.2, 0.8, 0.2]], [[17.0, 5.3, 3.2], [8.2, 0.8, 0.2]], 46, (lt, t) => { genG.position.set(11.3, 0, 0.4); genG.rotation.y = -Math.PI / 2; },
    (lt, o, cam) => { const t0 = T['44_20ft'], t = t0 + lt, c = o.tctx;
      tag(o, cam, lt, t0, W('g10', 'outside'), 'OUTSIDE ONLY', 470, 50, '#8cff5a'); tag(o, cam, lt, t0, W('g10', 'never'), 'NOT HOUSE / GARAGE / BARN / PORCH', 430, 80, '#ff4030');
      if (t > W('g11', 'twenty')) { const [ax, ay] = L.toScreen(cam, 11.3, 0.3, 0.4), [bx, by] = L.toScreen(cam, 5.05, 1.5, 0); c.strokeStyle = '#ffd23f'; c.setLineDash([3, 2]); c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.setLineDash([]); tag(o, cam, lt, t0, W('g11', 'twenty'), '20 FT', (ax + bx) / 2, (ay + by) / 2 - 16, '#ffd23f'); }
      if (t > W('g11', 'exhaust')) { const [ex, ey] = L.toScreen(cam, 11.95, 0.4, 0.4), [fx, fy] = L.toScreen(cam, 13.2, 0.6, 0.4); c.strokeStyle = '#ff7b2e'; c.beginPath(); c.moveTo(ex, ey); c.lineTo(fx, fy); c.stroke(); c.fillStyle = '#ff7b2e'; c.fillRect(fx - 2, fy - 2, 5, 5); tag(o, cam, lt, T['44_20ft'], W('g11', 'exhaust'), 'EXHAUST AWAY', fx + 40, fy - 14, '#ff7b2e'); }
      tag(o, cam, lt, t0, W('g11', 'carbon'), 'CO: NO COLOR, NO SMELL', 470, 300 - 30, '#ff4030'); }, D('44_20ft'));
  S('45_noon', 'noon', [[18, 3.5, 6], [12, 0.6, 0]], [[17, 3.2, 5], [12, 0.6, 0]], 44, (lt, t) => { genG.position.set(11.3, 0, 0.4); genG.rotation.y = -Math.PI / 2; const q = L.q15(lt); gen.position.set(Math.sin(q * 90) * 0.006, 0, 0); placeCows(PEN, t); },
    (lt, o, cam) => { const t0 = T['45_noon']; tag(o, cam, lt, t0, W('g13', 'twenty'), '12:00 — 20 MIN', 500, 50, '#ffd23f'); tag(o, cam, lt, t0, W('g13', 'never'), 'NEVER AFTER DARK', 500, 80, '#ff4030'); }, D('45_noon'));
  S('46_night', 'night', [[30, 12, 40], [0, 2, 0]], [[28, 11, 37], [0, 2, 0]], 46, (lt, t) => { placeCows(PEN, t, 'Idle'); },
    (lt, o, cam) => { const c = o.tctx, [cx, cy] = L.toScreen(cam, 11.3, 0.5, 0.4); if (T['46_night'] + lt < W('g14', 'sound')) return; for (let k = 0; k < 5; k++) { const r = ((lt * 40 + k * 30) % 150) + 10; c.strokeStyle = `rgba(255,123,46,${1 - r / 160})`; c.beginPath(); c.ellipse(cx, cy, r * 1.4, r * 0.35, 0, Math.PI, Math.PI * 2); c.stroke(); } }, D('46_night'));
  S('47_deal', 'day', [[1.0, 1.8, 9.8], [0, 1.4, 6.0]], [[0.9, 1.76, 9.4], [0, 1.4, 6.0]], 36, (lt, t, cam) => { AVA(0, 6.0, 0, 0.5); poseAva(lt, [L.seg('nod', 0, {})], [[-99, 'open', talk(t, 'smile')]], cam); }, null, D('47_deal'));
  // ----------------- 5. NOISY ANIMALS -----------------
  S('48_moo', 'day', [[18, 2.0, 2], [30, 1, -2]], [[18.5, 1.9, 1], [30, 1, -2]], 42, (lt, t) => { placeCows(PASTURE, t, 'Idle'); placeHens(YARD, t); },
    (lt, o, cam) => { const t0 = T['48_moo']; tag(o, cam, lt, t0, W('n2', 'twelve'), 'MOO!', 320, 70, '#ffffff', null, W('n2', 'chickens') - W('n2', 'twelve')); tag(o, cam, lt, t0, W('n2', 'chickens'), 'CLUCK!', 320, 70, '#ffd23f', null, W('n2', 'rooster') - W('n2', 'chickens')); tag(o, cam, lt, t0, W('n2', 'five'), '5:00 AM', 520, 60, '#ffd23f'); }, D('48_moo'));
  S('49_herd', 'day', [[0, 6, 18], [-9, 1, 4]], [[-2, 5.5, 16], [-9, 1, 4]], 44, (lt, t, cam) => { const k = ease(0, 4, lt);
    placeCows(PEN.map((p, i) => [p[0] + (1 - k) * (8 + i), p[1] + (1 - k) * 6, -Math.PI / 2, p[3]]), t, k < 1 ? 'Walk' : 'Eating'); placeHens(COOP, t);
    AVA(-4.5 + (1 - k) * 4, 6 - (1 - k) * 2, -Math.PI / 2); poseAva(lt, [L.seg(k < 1 ? 'walk' : 'point', 0, { loop: k < 1 })], [[-99, 'open', talk(t)]], cam, false); },
    (lt, o, cam) => { const t0 = T['49_herd']; tag(o, cam, lt, t0, W('n4', 'pen'), 'PEN', null, null, '#8cff5a', [-10, 1.5, 9]); tag(o, cam, lt, t0, W('n4', 'coop'), 'COOP', null, null, '#8cff5a', [8.2, 1.8, 2.6]); }, D('49_herd'));
  S('50_alarm', 'dusk', [[4, 0.6, 9], [7.5, 0.4, 4.5]], [[4.5, 0.6, 8.4], [7.5, 0.4, 4.5]], 40, (lt, t) => { placeHens(COOP, t, 'Idle'); },
    (lt, o, cam) => { const t = T['50_alarm'] + lt; if (t < W('n5b', 'chicken')) return; const c = o.tctx; for (const h of HENS.slice(0, 6)) { const [x, y] = L.toScreen(cam, h.wrap.position.x, 0.6, h.wrap.position.z); c.fillStyle = '#ff4030'; c.fillRect(x - 1, y - 10, 2, 5); c.fillRect(x - 5, y - 8, 2, 3); c.fillRect(x + 3, y - 8, 2, 3); }
    }, D('50_alarm'));
  S('51_steps', 'day', [[2, 12, 16], [-4, 0, 4]], [[1.6, 11, 15], [-4, 0, 4]], 46, (lt, t) => { placeCows(PEN, t); placeHens(COOP, t); },
    (lt, o, cam) => { const t0 = T['51_steps']; tag(o, cam, lt, t0, W('n5c', 'thirty'), '30 STEPS', null, null, '#8cff5a', [-6.5, 1, 4]); tag(o, cam, lt, t0, W('n5c', 'half'), 'NOT 0.5 MI', 520, 60, '#ff4030'); }, D('51_steps'));
  S('52_ribbon', 'day', [[3.4, 1.2, 12.5], [1, 0.6, 7.5]], [[3.1, 1.1, 12.0], [1, 0.6, 7.5]], 40, (lt, t, cam) => { const k = ease(0, 1.6, lt); dog.root.visible = true; dog.root.position.set(5 - 3 * k, 0, 13 - 4.0 * k); dog.root.rotation.y = Math.PI + 0.6; dog.update(lt, k < 1 ? 'walk' : 'stand', { speed: 2, wag: 1 });
    AVA(0.6, 6.8, 0.5); poseAva(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'happy', talk(t, 'smile')]], cam, false); },
    null, D('52_ribbon'));
  // ----------------- 6. LOCK THE GATE -----------------
  S('55_walk_gate', 'day', [[1.8, 1.7, 76], [0, 1.0, 58]], [[1.6, 1.65, 75], [0, 1.0, 62]], 40, (lt, t, cam) => { const k = Math.min(1, lt / 6); AVA(0.3, 56 + k * 9, 0); poseAva(lt, [L.seg('walk', 0, { loop: true })], [[-99, 'open', 'neutral']], cam, false); }, null, D('55_walk_gate'));
  S('56_gate', 'day', [[3.5, 1.6, 63], [0, 0.9, 70]], [[3.0, 1.5, 64], [0, 0.9, 70]], 42, (lt, t, cam) => { AVA(0.5, 67.5, Math.PI * 0.95); poseAva(lt, [L.seg('hands_on_hips', 0, { speed: 0.6 })], [[-99, 'open', talk(t)]], cam, false); },
    (lt, o, cam) => tag(o, cam, lt, T['56_gate'], W('l2', 'wide'), 'WIDE OPEN', null, null, '#ff4030', [0, 1.2, 70]), D('56_gate'));
  S('57_block', 'day', [[9, 3, 60], [0, 0.8, 67]], [[8.5, 2.8, 60.8], [0, 0.8, 67]], 42, (lt, t) => { leaves[0].rotation.y = 0; leaves[1].rotation.y = 0; const k = ease(0, 2.5, lt); putTruck([TRUCK_GATE[0] - 8 * (1 - k), TRUCK_GATE[1] - 4 * (1 - k), TRUCK_GATE[2] - 0.7 * (1 - k)]); }, null, D('57_block'));
  S('58_chain', 'day', [[0.42, 1.02, 69.35], [0, 0.82, 70]], [[0.36, 1.0, 69.45], [0, 0.82, 70]], 36, (lt, t, cam) => { leaves[0].rotation.y = 0; leaves[1].rotation.y = 0; putTruck(TRUCK_GATE);
    const t1 = W('l3', 'wrap'), t2 = W('l3', 'twice'), tc = W('l3', 'click'); putChain(t, t1, t2); lock.visible = t > W('l3', 'lock') - 0.1; if (shackle) shackle.position.y = t < tc ? 0.035 : 0; },
    null, D('58_chain'));
  S('59_stops', 'day', [[6, 2.2, 78], [0, 0.8, 70]], [[5.5, 2.1, 77], [0, 0.8, 70]], 40, (lt, t) => { leaves[0].rotation.y = 0; leaves[1].rotation.y = 0; putTruck(TRUCK_GATE); putChain(1e9, 0, 0); lock.visible = true; if (shackle) shackle.position.y = 0; },
    (lt, o, cam) => { const t0 = T['59_stops']; tag(o, cam, lt, t0, W('l4', 'stops'), 'STOPS CARS', 470, 60, '#8cff5a'); tag(o, cam, lt, t0, W('l4', 'slows'), 'SLOWS WALKERS', 470, 90, '#ffd23f'); }, D('59_stops'));
  S('61_curtains', 'dusk', [[14, 3.5, 22], [0, 3, 2]], [[13, 3.3, 20.5], [0, 3, 2]], 40, (lt, t) => { for (const w of WIN) w.material.map = tWinCurt; WIN[3].material.map = T['61_curtains'] + lt < W('l7b', 'one') ? tWinCurt : tWinCurtLit; placeCows(PEN, t, 'Idle'); },
    (lt, o, cam) => tag(o, cam, lt, T['61_curtains'], W('l7b', 'one'), 'SEEN FOR MILES', null, null, '#ff4030', [3.3, 4.6, 4.05]), D('61_curtains'));
  S('62_locked', 'sunset', [[40, 22, 60], [0, 2, 10]], [[34, 20, 56], [-2, 2, 8]], 44, (lt, t) => { leaves[0].rotation.y = 0; leaves[1].rotation.y = 0; putTruck(TRUCK_GATE); placeCows(PEN, t, 'Idle'); placeHens(COOP, t, 'Idle'); }, null, D('62_locked'));
  // ----------------- detail pass: new lines (w16b, n9b) -----------------
  S('36b_field', 'day', [[-6.2, 2.8, 12.5], [-11.5, 0.9, -1.5]], [[-6.6, 2.7, 11.8], [-12.0, 0.9, -2.5]], 44, (lt, t, cam) => { const k = ease(0.6, 6, lt);
    placeCows(PEN.map((p, i) => [p[0] - k * (3 + i * 0.4), p[1] - k * (4 + i * 0.6), Math.PI + 0.6, p[3]]), t, 'Walk'); AVA(-5.9, 3.9, -Math.PI / 2 - 0.3); poseAva(lt, [L.seg('point', 0, {})], [[-99, 'open', talk(t)]], cam, false); }, null, D('36b_field'));
  S('54b_evening', 'sunset', [[18, 7, 22], [-2, 1.5, 2]], [[15, 6.5, 19], [-3, 1.5, 2]], 44, (lt, t) => { placeCows(PEN, t, 'Idle'); placeHens(COOP, t, 'Idle'); dog.root.visible = true; dog.root.position.set(1.5, 0.5, 5.6); dog.root.rotation.y = 0.5; dog.update(lt, 'sleepy_wag', { wag: 0.5 }); }, null, D('54b_evening'));
  // ----------------- 8. SOMETHING IN THE BARN -----------------
  const ajar = (k) => { doorG[1].position.z = 1.05 + 0.7 * k; };
  S('69_window', 'night', [[-3.7, 4.75, -1.2], [-14, 2, -4]], [[-3.8, 4.72, -1.35], [-14, 2.0, -4]], 40, (lt, t) => { ajar(1); placeCows(PEN, t, 'Idle');
    dog.root.visible = true; dog.root.position.set(-4.45, 3.95, -1.75); dog.root.rotation.y = -Math.PI / 2; dog.update(lt, 'growl', { growl: 1, look: V(-14, 2, -4) }); },
    (lt, o) => { const c = o.tctx; c.fillStyle = '#0a0806'; c.fillRect(0, 0, 70, LH); c.fillRect(LW - 70, 0, 70, LH); c.fillRect(0, 0, LW, 26); c.fillRect(0, LH - 26, LW, 26); c.fillRect(LW / 2 - 3, 0, 6, LH); }, D('69_window'));
  S('70_sunset', 'sunset', [[-8, 1.8, -0.5], [-14, 1.8, -4]], [[-8.4, 1.75, -0.8], [-14, 1.8, -4]], 40, (lt, t, cam) => { const k = ease(0.1, 1.1, lt); doorG[1].position.z = 1.05 + 0.6 * (1 - k);
    AVA(-13.35, -1.75 + 0.6 * (1 - k), -Math.PI / 2 - 0.3); poseAva(lt, [L.seg('push_door', 0.0, {})], [[-99, 'open', 'neutral']], cam, false); },
    (lt, o) => { const c = o.tctx; c.fillStyle = 'rgba(255,180,90,0.10)'; c.fillRect(0, 0, LW, LH); }, D('70_sunset'));
  S('71_ajar', 'night', [[-3.5, 1.8, -1.6], [-14, 2.0, -3.8]], [[-6.5, 1.75, -2.6], [-14, 2.0, -3.8]], 44, (lt, t) => { ajar(1); }, null, D('71_ajar'));
  S('72_moving', 'night', [[-11.4, 1.6, -3.2], [-14.6, 1.4, -3.7]], [[-11.8, 1.6, -3.3], [-14.6, 1.4, -3.7]], 40, (lt, t) => { ajar(1);
    // slow, creepy: it leans out of the dark a few cm at a time, the head dips, it stops, the tail end sways (no quick moves)
    const q = L.q15(lt), crawl = L.smooth((q % 3.2) / 3.2) * 0.12 + Math.floor(q / 3.2) * 0.12; MON.wrap.visible = true; rimL.intensity = 2.6;
    MON.wrap.position.set(-17.6 + crawl, 0, -3.85 + Math.sin(q * 0.35) * 0.08); MON.wrap.rotation.set(Math.sin(q * 0.5) * 0.04, -Math.PI / 2 + Math.sin(q * 0.3) * 0.08, 0);
    MON.eyes.visible = q > 0.6;
    TENT.forEach((x, i) => { x.wrap.visible = true; x.wrap.position.set(-15.2 - i * 0.5, 0, -3.95 + (i - 1) * 0.55); x.wrap.rotation.set(0, Math.PI / 2 + (i - 1) * 0.5, 0); x.set(lt * 0.7 + i * 0.9, i === 1 ? 'Tentacle_Poke' : 'Tentacle_Idle'); }); },
    null, D('72_moving'));

  // ----------------- 74: end card — rotating clone of the real barn + SHOULD I GO TO THE BARN? 1 / 2 + COMMENT + SUBSCRIBE! -----------------
  { const s3 = new THREE.Scene(); s3.background = new THREE.Color(0x05060c); s3.add(new THREE.AmbientLight(0x8a90b0, 1.0)); const kl = new THREE.DirectionalLight(0xfff0e0, 2.2); kl.position.set(20, 30, 25); s3.add(kl);
    const mini = barn.clone(true); mini.position.set(0, 0, 0); const piv = new THREE.Group(); piv.add(mini); s3.add(piv); piv.position.set(0, 0, 0);
    mini.traverse((o) => { if (o.isMesh && o.material && o.material.side !== undefined) {} });
    const cam3 = new THREE.PerspectiveCamera(30, LW / LH, 1, 300); cam3.position.set(0, 10, 66); cam3.lookAt(0, -6.5, 0);
    const tw = (k, w) => at(k, w), endX8 = endOf('x8', -1);
    const panel = (c, x, y, w, h) => { c.fillStyle = 'rgba(4,8,18,0.88)'; c.fillRect(x, y, w, h); c.fillStyle = '#8a90a8'; c.fillRect(x, y, w, 1); c.fillRect(x, y, 1, h); c.fillStyle = '#2a2e3e'; c.fillRect(x, y + h - 1, w, 1); c.fillRect(x + w - 1, y, 1, h); c.strokeStyle = '#3a3e52'; c.strokeRect(x + 3.5, y + 3.5, w - 7, h - 7); };
    out['74_end'] = { scene: s3, camera: cam3, update(lt) { mini.rotation.y = -0.9 + lt * 0.35; },
      overlay(lt, dt, a, o) { const c = o.tctx, t = T['74_end'] + lt;
        const Q = [['should', 'SHOULD'], ['you', 'I GO'], ['go', ''], ['the', 'TO THE'], ['barn', 'BARN?']];
        panel(c, 150, 150, 340, 128);
        const q = Q.filter(([w]) => t >= tw('x7', w)).map((x) => x[1]).filter(Boolean).join(' ');
        if (q) bitText(c, q, LW / 2, 172, 2, '#ececec', { outline: '#000000' });
        const opt = [['one', '1. GO IN RIGHT NOW', '#ff6040'], ['two', '2. WAIT FOR MORNING', '#8cff5a']];
        opt.forEach(([w, s_, col], i) => { if (t < tw('x8', w)) return; const sel = (t >= tw('x8', 'two')) ? 1 : 0; bitText(c, s_, LW / 2, 204 + i * 26, 2, col, { outline: '#000000' });
          if (i === sel && Math.floor(t * 4) % 2 === 0) { c.fillStyle = '#ffe048'; for (let k = 0; k < 8; k++) c.fillRect(LW / 2 - textWidth(s_, 2) / 2 - 18 + k, 197 + i * 26 + k, 1, 15 - 2 * k); } });
        if (t >= tw('x8', 'comment')) { const b = Math.round(3 * Math.abs(Math.sin((t - tw('x8', 'comment')) * 5))); bitText(c, 'COMMENT 1 OR 2', LW / 2, 262 - b, 2, '#ffd23f', { outline: '#000000' }); }
        if (t >= endX8 + 0.6) { const k = Math.min(1, (t - endX8 - 0.6) / 0.15); bitText(c, 'SUBSCRIBE!', LW / 2, 318, 4, k < 1 ? '#a8201a' : '#ff4030', { outline: '#000000' }); } } }; }

  // ----------------- highway jam (18, 19): own scene -----------------
  { const s2 = new THREE.Scene(); s2.background = new THREE.Color(0x9ab4d0); s2.fog = new THREE.Fog(0x9ab4d0, 30, 200); s2.add(new THREE.AmbientLight(0xd0d8e0, 1.3)); const dl = new THREE.DirectionalLight(0xfff0d8, 2.2); dl.position.set(20, 40, 10); s2.add(dl);
    L.plane(400, 400, lam(L.rep(tGrass, 100, 100), 0xb8b090), 0, -0.02, 0, s2, 0, -Math.PI / 2);
    const tAsph = noiseTex(32, 32, [70, 70, 74], 18, 30); L.plane(14, 400, lam(L.rep(tAsph, 4, 100)), 0, 0, 0, s2, 0, -Math.PI / 2);
    for (let z = -200; z < 200; z += 6) L.plane(0.15, 3, basic(null, 0xe8d860), 0, 0.01, z, s2, 0, -Math.PI / 2);
    const carCol = [0x8a2a24, 0x2a4a8a, 0xd8d8d0, 0x3a3a3a, 0x6a7a5a, 0xa8a090, 0x1a1a24];
    const carTex = carCol.map((col) => { const h = '#' + col.toString(16).padStart(6, '0'); return L.cvs(32, 16, (c) => { px(c, 0, 0, h, 32, 16); px(c, 0, 0, '#ffffff22', 32, 2); px(c, 10, 2, '#00000044', 1, 12); px(c, 21, 2, '#00000044', 1, 12); px(c, 12, 7, '#c8c8c8', 3, 1); px(c, 23, 7, '#c8c8c8', 3, 1); px(c, 0, 13, '#1a1a1a', 32, 3); }); });
    const tGlass = L.cvs(32, 8, (c) => { px(c, 0, 0, '#2a3440', 32, 8); px(c, 3, 1, '#8aa0b8', 8, 2); px(c, 18, 1, '#6a8098', 6, 2); px(c, 15, 0, '#1a1a1a', 2, 8); });
    const mkCar = (x, z, i) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI; const m = lam(carTex[i % carCol.length]); B(1.8, 0.7, 4.4, m, 0, 0.6, 0, g); B(1.6, 0.55, 2.2, lam(tGlass), 0, 1.2, -0.2, g); B(1.62, 0.06, 2.22, m, 0, 1.49, -0.2, g);
      for (const [wx, wz] of [[-0.8, 1.4], [0.8, 1.4], [-0.8, -1.4], [0.8, -1.4]]) { const w = cyl(0.33, 0.33, 0.22, 8, lam(null, 0x141414), wx, 0.33, wz, g); w.rotation.z = Math.PI / 2; }
      B(1.5, 0.12, 0.05, basic(null, 0xd02018), 0, 0.75, -2.22, g); s2.add(g); };
    let i = 0; for (let z = -150; z < 100; z += 6.0) { if (Math.abs(z - 12) > 4) mkCar(-1.8, z + (i % 3) * 0.6, i); i++; mkCar(1.8, z + 2 + (i % 2), i++); mkCar(5.4, z + 1, i++); }
    // ---- v5: the cab from INSIDE, rebuilt (user: head through the roof, zombies facing away). Cab group: +z = forward (world -z),
    // +x = driver side (world -x). Roof at 2.0 m, bench cushion at 0.83 m, wheel at chest height; window DOWN on her side.
    const cab = new THREE.Group(); cab.position.set(-1.8, 0, 11.45); cab.rotation.y = Math.PI; s2.add(cab);
    const red = lam(L.rep(noiseTex(16, 16, [150, 36, 30], 22, 61), 2, 2)), dark = lam(null, 0x2a2826), vin = lam(L.rep(noiseTex(16, 16, [96, 70, 52], 18, 62), 2, 2));
    const head = lam(L.rep(noiseTex(16, 16, [168, 160, 146], 10, 63), 3, 2), 0xffffff, { side: DS });
    const tDash = L.cvs(64, 16, (c) => { px(c, 0, 0, '#2a2624', 64, 16); for (const x of [12, 26]) { px(c, x - 5, 3, '#0a0a0a', 11, 10); px(c, x - 4, 4, '#d8d0a0', 9, 8); px(c, x, 6, '#c82a1a', 1, 4); } px(c, 40, 5, '#1a1a1a', 18, 6); px(c, 42, 7, '#6ad86a', 4, 2); px(c, 50, 7, '#d8a040', 3, 2); });
    B(1.9, 0.08, 2.0, dark, 0, 0.5, 0, cab);                                                  // floor (top 0.54)
    B(1.7, 0.22, 0.55, vin, 0, 0.72, -0.15, cab); B(1.7, 0.7, 0.16, vin, 0, 1.15, -0.48, cab); // bench (cushion top 0.83) + back
    for (let i = 0; i < 5; i++) B(1.7, 0.02, 0.17, lam(null, 0x6a4a34), 0, 0.84, -0.38 + i * 0.12, cab);   // seat seams
    B(1.85, 0.36, 0.42, lam(tDash), 0, 1.14, 0.72, cab); B(1.85, 0.06, 0.55, dark, 0, 1.34, 0.66, cab);    // dashboard
    { const col = cyl(0.03, 0.03, 0.42, 6, dark, 0.38, 1.13, 0.52, cab); col.rotation.x = 1.05; const wh = L.mesh(new THREE.TorusGeometry(0.19, 0.022, 5, 14), lam(null, 0x1a1a1a), 0.38, 1.27, 0.4, cab); wh.rotation.x = 0.45;
      for (const a of [0, 2.1, 4.2]) { const sp = B(0.02, 0.17, 0.02, dark, 0.38, 1.27, 0.4, cab); sp.rotation.set(0.45, 0, a); } }
    for (const s of [-1, 1]) B(0.08, 0.66, 2.0, red, s * 0.94, 0.88, 0, cab);           // door panels below the window line (1.21)
    B(0.1, 0.05, 2.0, dark, 0.94, 1.23, 0, cab); B(0.1, 0.05, 2.0, dark, -0.94, 1.23, 0, cab);   // window sills (rubber)
    for (const s of [-1, 1]) { B(0.07, 0.8, 0.07, red, s * 0.92, 1.6, 0.86, cab); B(0.07, 0.8, 0.07, red, s * 0.92, 1.6, -0.6, cab); }   // A + B pillars
    B(1.95, 0.07, 1.6, red, 0, 2.02, 0.12, cab); B(1.85, 0.03, 1.5, head, 0, 1.98, 0.12, cab);   // roof + headliner (Ava's head ~1.75)
    B(1.9, 0.08, 0.08, red, 0, 1.22, -0.6, cab); B(1.9, 0.08, 0.08, red, 0, 1.98, -0.6, cab);   // rear window frame (open: the jam behind)
    B(1.9, 0.08, 0.06, red, 0, 1.22, 0.9, cab); B(1.9, 0.06, 0.06, red, 0, 1.98, 0.86, cab);    // windshield frame
    const wsGlass = L.plane(1.78, 0.74, basic(null, 0xb8cce0, { transparent: true, opacity: 0.07, depthWrite: false, side: DS }), 0, 1.6, 0.88, cab);
    const wsCrack = L.plane(0.5, 0.36, basic(L.cvs(32, 24, (c) => { c.clearRect(0, 0, 32, 24); c.strokeStyle = '#e8f0f8'; c.lineWidth = 1; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(16, 12); const a = k * 0.9; c.lineTo(16 + Math.cos(a) * 15, 12 + Math.sin(a) * 11); c.stroke(); } c.beginPath(); c.arc(16, 12, 5, 0, 6.3); c.stroke(); }), 0xffffff, { transparent: true, depthWrite: false, side: DS }), -0.45, 1.62, 0.87, cab); wsCrack.visible = false;
    L.plane(1.5, 0.7, basic(null, 0x9ab4c8, { transparent: true, opacity: 0.12, depthWrite: false, side: DS }), -0.94, 1.6, 0.13, cab, Math.PI / 2);   // passenger glass
    B(1.9, 0.5, 1.8, red, 0, 0.85, 1.8, cab); B(1.95, 0.2, 2.6, red, 0, 0.5, -1.95, cab);    // hood ahead + bed behind
    const mirror = B(0.22, 0.07, 0.03, lam(null, 0x1a1a1a), 0, 1.9, 0.78, cab);
    const ch2 = L.hero(); s2.add(ch2.root); paintScared(ch2);
    const zs = []; for (let k = 0; k < 4; k++) { const z = animal(zSrc, 1.78 + (k % 2) * 0.05); scene.remove(z.wrap); s2.add(z.wrap); z.root.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) { m.map = zTex; m.needsUpdate = true; } }); zs.push(z); }
    const cam2 = mkCam(50); cam2.near = 0.05; cam2.updateProjectionMatrix();
    const CW = (x, y, z) => cab.localToWorld(V(x, y, z));
    const SEAT = { hipY: 0.9, kneeL: [0.12, 0.9, 0.42], kneeR: [-0.12, 0.9, 0.42], footL: [0.13, 0.56, 0.56], footR: [-0.13, 0.56, 0.56],
      elbowL: [0.25, 1.06, 0.18], elbowR: [-0.25, 1.06, 0.18], handL: [0.17, 1.28, 0.42], handR: [-0.17, 1.28, 0.42] };
    // zombies of the fake ending: two at HER open window (faces in, arms reaching through), one at the windshield corner, one behind
    const ZP = [[1.2, 0.12, -Math.PI / 2], [1.24, -0.42, -Math.PI / 2 - 0.25], [1.15, 0.8, -2.03], [1.55, -0.95, -Math.PI / 2 + 0.3]];
    const jam = (id, died) => { out[id] = { scene: s2, camera: cam2, update(lt, t) {
        cab.updateMatrixWorld(true);
        if (!died) look(cam2, CW(0.2 + lt * 0.008, 1.74, 0.98), CW(0.38, 1.33, -0.1));      // 18: through the windshield, from the hood
        else look(cam2, CW(-0.28, 1.62, 0.72), CW(0.66, 1.45, -0.08));                             // 19: from the passenger seat, her window behind her
        const p = CW(0.38, 0, -0.12); ch2.root.position.set(p.x, 0, p.z); ch2.root.rotation.y = Math.PI;
        const ttap = Math.floor(lt * 2.5) % 2, scare = died ? ease(0.15, 0.45, lt) : 0;
        ch2.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, died ? 'scared' : 'half', died ? 'gasp' : mouthAt(t, 'frown')]]);
        const sp = { ...SEAT }; if (!died) sp.handR = [-0.17, 1.28 + (ttap ? 0.025 : 0), 0.42];
        else { sp.handL = [0.2, 1.36 + 0.1 * scare, 0.3 - 0.15 * scare]; sp.elbowL = [0.28, 1.12, 0.1]; }   // she pulls back from the window
        ch2.bend(sp);
        const look2 = died ? CW(0.4 + 1.2 * scare, 1.5, 0.05) : (Math.floor(lt / 2.2) % 3 === 1 ? CW(0, 1.9, 0.78) : CW(0.3, 1.4, 6));
        ch2.lookAt({ position: look2 }, 1, 70);
        wsGlass.visible = false; wsCrack.visible = died && lt > 1.0; wsGlass.position.y = 1.6 + (died && Math.floor(lt * 6) % 4 === 0 ? 0.004 : 0);
        zs.forEach((z, k) => { z.wrap.visible = died; if (!died) return; const [x, zz, yaw] = ZP[k], kk = ease(0, 0.6 + k * 0.15, lt);
          const q = CW(x + (1 - kk) * 0.9 * Math.sign(x || 1), 0, zz); z.wrap.position.set(q.x, 0, q.z);
          z.wrap.rotation.y = yaw + cab.rotation.y; z.set(lt * 1.2 + k * 0.37, kk < 1 ? 'walk' : 'attack1_l'); });
      }, overlay: died ? (lt, dt, a, o) => { const tD = W('b7', -1) - T[id] + 0.25; if (lt > tD) { const c = o.tctx; c.fillStyle = 'rgba(0,0,0,0.80)'; c.fillRect(0, 0, LW, LH); c.fillStyle = 'rgba(150,0,0,0.28)'; c.fillRect(0, 0, LW, LH); youDied(o, lt - tD); } } : undefined };
      if (died) out[id].nohud = false; };
    jam('18_jam', false); jam('19_died', true); }

  return out;
}

export function sfx(ctx) {   // every visible action -> one event at its frame (global s); names mapped in ../../audio/scripts/mix8.py
  const { T, at } = ctx, W = (k, w = 0) => at(k, w), E = [], p = (t, n) => E.push([t, n]);
  const steps = (t0, t1, dt = 0.5, n = 'step_walk') => { for (let t = t0; t < t1; t += dt) p(t, n); };
  p(T['03_crane'] + 1.2, 'cow_moo_far'); p(T['04_porch'] + 0.2, 'porch_creak'); p(W('h4', 'best'), 'cute_wink');
  for (const w of ['well', 'barn', 'twelve', 'chickens', 'dog']) p(W('h5', w), 'label'); p(W('h5', 'twelve') + 0.1, 'cow_moo_far'); p(W('h5', 'chickens') + 0.1, 'chicken_cluck_short'); p(W('h5', 'dog') + 0.15, 'dog_bark');
  p(T['06_dog'] + 0.5, 'collar_jingle'); p(W('h6', 'save'), 'dog_bark'); p(W('h7', 'mistake'), 'sting_low');
  steps(T['08_coffee'] + 0.1, T['08_coffee'] + 2.4, 0.5, 'step_wood'); p(T['08_coffee'] + 3.0, 'coffee_sip');
  for (const w of ['house', 'barn', 'well', 'silo', 'two']) p(W('a2', w), 'label');
  for (const w of ['water', 'food', 'fuel', 'tools', 'land']) p(W('a4', w), 'label');
  p(W('a6', 'chickens'), 'chicken_cluck'); p(T['13_chickens'] + 1.0, 'rooster');
  p(W('b11', 'two'), 'label'); steps(T['24_stays'], T['24_stays'] + 3.5, 0.5, 'step_gravel'); p(W('b8', 0), 'cloth_shrug');
  for (const w of ['ten', 'twelve']) p(W('w14', w), 'label'); p(W('w15', 'half'), 'label_pop_danger'); p(T['35_cows'] + 0.4, 'cow_moo'); p(T['35_cows'] + 1.2, 'water_slosh');
  p(W('w16', 'pond'), 'label'); p(T['36_pond'] + 1.0, 'cow_moo_far');
  p(T['38_shed'] + 0.2, 'door_creak'); p(W('g1', 'diesel'), 'label');
  const run0 = W('g3', 0) - 0.15, run1 = W('g9', 'shut'); p(W('g2', 'pull') + 0.1, 'generator_pull'); p(run0, 'generator_start'); for (let t = run0 + 0.6; t < run1; t += 2.4) p(t, 'generator_loop'); p(run1, 'generator_stop');
  p(W('g7', 'plenty'), 'corn_rustle'); p(W('g8', 'heard'), 'zombie_moan_far'); p(W('g8', 'heard') + 1.1, 'zombie_groan_far');
  for (const [k, w] of [['g10', 'outside'], ['g10', 'never'], ['g11', 'twenty'], ['g11', 'carbon']]) p(W(k, w), 'label');
  for (let t = T['45_noon']; t < T['45_noon'] + 6; t += 2.4) p(t, 'generator_loop_far'); for (const w of ['twenty', 'never']) p(W('g13', w), 'label');
  p(W('g14', 'sound'), 'sound_ring'); p(W('g14', 'sound') + 0.9, 'sound_ring'); p(W('g15', 0) + 0.3, 'cloth_point');
  p(W('n2', 'twelve'), 'cow_moo'); p(W('n2', 'chickens'), 'chicken_cluck'); p(W('n2', 'rooster'), 'rooster');
  p(T['49_herd'], 'hooves'); p(T['49_herd'] + 2.0, 'cow_moo'); steps(T['49_herd'], T['49_herd'] + 4, 0.5, 'step_gravel'); for (const w of ['pen', 'coop']) p(W('n4', w), 'label');
  p(W('n5b', 'chicken'), 'chicken_alarm'); p(W('n5b', 'alarm'), 'label_pop_danger'); for (const w of ['thirty', 'half']) p(W('n5c', w), 'label');
  p(T['52_ribbon'], 'dog_paws'); p(T['52_ribbon'] + 1.7, 'dog_bark'); p(W('n6', 'ribbon'), 'label');
  steps(T['55_walk_gate'] + 0.1, T['55_walk_gate'] + 6, 0.5, 'step_gravel'); p(W('l2', 'wide'), 'label_pop_danger'); p(T['56_gate'] + 0.3, 'gate_creak');
  p(T['57_block'] + 0.1, 'truck_idle'); p(T['57_block'] + 2.4, 'truck_brake');
  p(W('l3', 'wrap'), 'chain_rattle'); p(W('l3', 'twice'), 'chain_rattle'); p(W('l3', 'lock'), 'padlock_handle'); p(W('l3', 'click'), 'padlock_click');
  for (const w of ['stops', 'slows']) p(W('l4', w), 'label'); p(W('l7b', 'one'), 'light_switch_on'); p(W('l7b', 'one') + 0.1, 'label_pop_danger'); p(T['62_locked'] + 1.5, 'cow_moo_far');
  for (let k = 0; k < 4; k++) p(T['69_window'] + 0.15 + k * 1.6, 'dog_growl_big'); p(T['70_sunset'] + 0.4, 'barn_door'); p(W('x4', 'crack'), 'tension_sting'); p(T['71_ajar'] + 0.3, 'owl');
  p(T['72_moving'] + 0.2, 'hay_rustle'); p(W('x5', 'moving'), 'creature_breath_far');
  p(T['18_jam'], 'traffic_jam'); p(T['18_jam'] + 1.2, 'car_horn'); p(T['19_died'] + 0.1, 'zombie_groan'); p(T['19_died'] + 0.5, 'zombie_growl'); p(W('b7', -1) + 0.25, 'you_died_sting');
  p(T['36b_field'] + 0.4, 'gate_creak'); p(T['36b_field'] + 1.0, 'hooves'); p(T['36b_field'] + 2.5, 'cow_moo'); p(T['54b_evening'] + 0.6, 'cow_moo_far'); p(T['54b_evening'] + 1.8, 'chicken_cluck_short');
  return E.filter((e) => Number.isFinite(e[0]));
}
