// sets/house.js — ep8 LARGO "The Last Farm": the farmhouse interiors (one scene, rooms side by side on x):
// kitchen x=0 (window to the yard, sink, fridge, table, wall clock, key hook), bathroom x=12 (tub filling), basement x=24
// (water heater), front hall x=36 (front door + screws, Ribbon's bed), bedroom x=48 (west window to the barn, night).
// Contract: ../SETS.md. Times anchored to words inside shots(). Props: bathtub/bucket/water/notebook/phone (photo->lowpoly).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { loadDog } from './dog.js';
import { paintScared } from './avaface.js';

export async function shots(ctx) {
  const { L, TL, T, at } = ctx;
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
  const W = (take, k = 0) => at(take, k);
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const mouthAt = (t, base = 'neutral') => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const noiseTex = (w, h, base, amp, seed, extra) => L.cvs(w, h, (c) => { const r = L.rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (r() - 0.5) * amp; px(c, x, y, rgb(base[0] + n, base[1] + n, base[2] + n)); } if (extra) extra(c, r, w, h); });

  // ---------- textures ----------
  const tPaper = L.cvs(32, 32, (c) => { const r = L.rng(1); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(214 + (r() - 0.5) * 8, 196 + (r() - 0.5) * 8, 150 + (r() - 0.5) * 8)); for (let x = 0; x < 32; x += 8) for (let y = 0; y < 32; y++) px(c, x + 3, y, y % 4 < 2 ? '#a86a4a' : '#c8a070'); for (let y = 4; y < 32; y += 8) for (let x = 0; x < 32; x += 8) { px(c, x, y, '#6a8a4a', 2, 2); } });
  const tLino = L.cvs(32, 32, (c) => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, ((x >> 3) + (y >> 3)) % 2 ? '#d8d0c0' : '#8a3a2e'); });
  const tFloor = L.cvs(32, 32, (c) => { const r = L.rng(2); for (let y = 0; y < 32; y++) { const b = Math.floor(y / 4); for (let x = 0; x < 32; x++) px(c, x, y, y % 4 === 3 ? '#4a2e1a' : rgb(132 + (b % 3) * 10 + (r() - 0.5) * 12, 88 + (b % 3) * 6 + (r() - 0.5) * 10, 54)); } });
  const tTile = L.cvs(32, 32, (c) => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, x % 8 === 0 || y % 8 === 0 ? '#9aa4a8' : '#e0e8ec'); });
  const tConc = noiseTex(32, 32, [128, 126, 120], 26, 3, (c, r) => { for (let k = 0; k < 14; k++) px(c, r() * 32 | 0, r() * 32 | 0, '#6e6a62', 3, 1); for (let y = 0; y < 32; y += 10) px(c, 0, y, '#8a8880', 32, 1); });
  const tCab = L.cvs(32, 32, (c) => { const r = L.rng(4); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(150 + (r() - 0.5) * 12, 104 + (r() - 0.5) * 10, 60)); for (const x0 of [2, 17]) { px(c, x0, 2, '#6a4422', 13, 28); px(c, x0 + 1, 3, '#a8784a', 11, 26); px(c, x0 + (x0 < 10 ? 10 : 2), 15, '#d8c890', 2, 3); } });
  const tCounter = noiseTex(16, 16, [226, 218, 196], 14, 5);
  const tWood = L.cvs(32, 32, (c) => { const r = L.rng(6); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const g = Math.sin(x * 0.7 + Math.sin(y * 0.2) * 3) * 12; px(c, x, y, rgb(140 + g + (r() - 0.5) * 10, 96 + g * 0.7, 58)); } });
  const tDoor = L.cvs(32, 64, (c) => { const r = L.rng(7); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(104 + (r() - 0.5) * 12, 54 + (r() - 0.5) * 8, 32)); for (const [x, y] of [[4, 4], [18, 4], [4, 34], [18, 34]]) { px(c, x, y, '#5a2a18', 10, 26); px(c, x + 1, y + 1, '#8a4a30', 8, 24); } });
  const tYard = L.cvs(64, 48, (c) => { const g = c.createLinearGradient(0, 0, 0, 30); g.addColorStop(0, '#f0c090'); g.addColorStop(1, '#f8e0b8'); c.fillStyle = g; c.fillRect(0, 0, 64, 30); px(c, 0, 26, '#7a9a4a', 64, 22); px(c, 6, 14, '#a8302a', 20, 14); px(c, 6, 12, '#6a6a70', 20, 3); px(c, 34, 8, '#c8c8c8', 6, 20); for (let x = 0; x < 64; x += 3) px(c, x, 24, '#c8b060', 2, 3); });
  const tDusk = L.cvs(64, 48, (c) => { const g = c.createLinearGradient(0, 0, 0, 30); g.addColorStop(0, '#6a4a7a'); g.addColorStop(1, '#e88a5a'); c.fillStyle = g; c.fillRect(0, 0, 64, 30); px(c, 0, 26, '#3a4a2a', 64, 22); px(c, 6, 14, '#6a2a2a', 20, 14); px(c, 6, 12, '#3a3a40', 20, 3); });
  const tNight = L.cvs(64, 48, (c) => { px(c, 0, 0, '#0c1428', 64, 48); px(c, 0, 30, '#141e18', 64, 18); px(c, 8, 16, '#3a1410', 28, 16); px(c, 8, 13, '#24242c', 28, 4); px(c, 34, 18, '#05040a', 3, 14); px(c, 50, 6, '#d8dce8', 4, 4); for (const [x, y] of [[20, 4], [44, 10], [58, 3], [12, 8]]) px(c, x, y, '#a8b0c8'); });
  const tFridge = L.cvs(16, 32, (c) => { px(c, 0, 0, '#e8e4d8', 16, 32); px(c, 0, 11, '#a8a498', 16, 1); px(c, 13, 3, '#9a968a', 1, 6); px(c, 13, 14, '#9a968a', 1, 10); px(c, 3, 3, '#d84030', 3, 3); px(c, 7, 4, '#3a7ad8', 2, 2); });
  const tHeater = L.cvs(32, 32, (c) => { px(c, 0, 0, '#e8e8e0', 32, 32); px(c, 0, 0, '#c8c8c0', 32, 2); px(c, 8, 10, '#e0c020', 16, 10); px(c, 9, 11, '#202020', 14, 8); });
  const tBed = noiseTex(32, 32, [170, 60, 54], 18, 8, (c) => { for (let y = 0; y < 32; y += 8) for (let x = 0; x < 32; x += 8) px(c, x, y, '#e8d8c0', 4, 4); });

  // ---------- scene ----------
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0808);
  const amb = new THREE.AmbientLight(0xfff0e0, 1.25); scene.add(amb);
  const room = (x0, w, d, h, mWall, mFloor) => { const g = new THREE.Group(); g.position.x = x0; scene.add(g);
    L.plane(w, d, mFloor, 0, 0, 0, g, 0, -Math.PI / 2); L.plane(w, d, lam(null, 0xd8d0c0), 0, h, 0, g, 0, Math.PI / 2);
    L.plane(w, h, mWall, 0, h / 2, -d / 2, g); L.plane(d, h, mWall, -w / 2, h / 2, 0, g, Math.PI / 2); L.plane(d, h, mWall, w / 2, h / 2, 0, g, -Math.PI / 2); L.plane(w, h, mWall, 0, h / 2, d / 2, g, Math.PI);
    B(w, 0.12, 0.04, lam(tWood, 0x8a6a4a), 0, 0.06, -d / 2 + 0.02, g); return g; };
  const mPaper = lam(L.rep(tPaper, 6, 3), 0xffffff, { side: DS });
  // KITCHEN (x=0): back wall z=-2 has the window + sink, left wall x=-3 the fridge, the table in the middle
  const K = room(0, 6, 4.4, 2.7, mPaper, lam(L.rep(tLino, 6, 4)));
  const kwin = L.plane(1.3, 1.0, basic(tYard), 0.4, 1.65, -2.18, K); B(1.5, 0.08, 0.1, lam(null, 0xe8e4d8), 0.4, 1.1, -2.15, K); B(1.5, 0.08, 0.06, lam(null, 0xe8e4d8), 0.4, 2.18, -2.17, K); B(0.06, 1.0, 0.06, lam(null, 0xe8e4d8), 0.4, 1.65, -2.16, K);
  B(3.4, 0.9, 0.62, lam(L.rep(tCab, 4, 1)), 0.4, 0.45, -1.88, K); B(3.5, 0.06, 0.66, lam(tCounter), 0.4, 0.93, -1.88, K);
  B(0.6, 0.06, 0.4, basic(null, 0x8a9098), 0.4, 0.94, -1.88, K); const faucet = cyl(0.015, 0.015, 0.25, 6, lam(null, 0xc8c8d0), 0.4, 1.06, -2.1, K);
  const stream = B(0.02, 0.18, 0.02, basic(null, 0x9ac8f0, { transparent: true, opacity: 0.8 }), 0.4, 1.0, -1.98, K); stream.visible = false;
  B(3.4, 0.7, 0.36, lam(L.rep(tCab, 4, 1)), 0.4, 2.2, -2.02, K);
  const fridge = B(0.8, 1.75, 0.7, lam(tFridge), -2.55, 0.875, -1.7, K);
  const fridgeLight = B(0.02, 0.02, 0.02, basic(null, 0xffffff), -2.55, 1.2, -1.34, K);
  B(1.6, 0.06, 0.95, lam(tWood), 0.3, 0.76, 0.3, K); for (const [x, z] of [[-0.42, -0.1], [1.02, -0.1], [-0.42, 0.7], [1.02, 0.7]]) B(0.06, 0.73, 0.06, lam(tWood), x, 0.37, z, K);
  for (const [x, z] of [[-0.35, 1.2], [0.75, 1.02]]) { B(0.45, 0.05, 0.45, lam(tWood), x, 0.46, z, K); B(0.45, 0.6, 0.05, lam(tWood), x, 0.78, z + 0.22, K); }
  // wall clock (hands move) + key hook with the truck keys, door frame on the right wall
  const clk = new THREE.Group(); clk.position.set(2.1, 2.05, -2.18); K.add(clk); L.mesh(new THREE.CircleGeometry(0.22, 12), basic(L.cvs(32, 32, (c) => { px(c, 0, 0, '#f4f0e4', 32, 32); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; px(c, 16 + Math.sin(a) * 13 | 0, 16 - Math.cos(a) * 13 | 0, '#202020', 2, 2); } })), 0, 0, 0.01, clk);
  const hH = B(0.012, 0.11, 0.01, basic(null, 0x101010), 0, 0, 0.03, clk), hM = B(0.01, 0.17, 0.01, basic(null, 0x101010), 0, 0, 0.035, clk); hH.geometry.translate(0, 0.05, 0); hM.geometry.translate(0, 0.08, 0);
  const setClock = (h, m) => { hM.rotation.z = -m / 60 * Math.PI * 2; hH.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; };
  const hook = new THREE.Group(); hook.position.set(2.96, 1.5, 0.9); K.add(hook); B(0.04, 0.12, 0.5, lam(tWood), 0, 0, 0, hook); for (const z of [-0.15, 0, 0.15]) B(0.08, 0.02, 0.02, lam(null, 0x9a8a40), -0.04, -0.02, z, hook);
  { const ring = L.mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 8), lam(null, 0xc8c8c8), -0.08, -0.06, 0, hook); ring.rotation.y = Math.PI / 2;
    const tKey = L.cvs(8, 24, (c) => { c.clearRect(0, 0, 8, 24); px(c, 1, 0, '#2a2a2a', 6, 8); px(c, 3, 8, '#c8c8c0', 2, 16); for (let y = 11; y < 23; y += 3) px(c, 5, y, '#c8c8c0', 2, 2); px(c, 2, 2, '#5a5a5a', 4, 3); });
    const tKey2 = L.cvs(8, 24, (c) => { c.clearRect(0, 0, 8, 24); px(c, 1, 0, '#b8a050', 6, 7); px(c, 3, 7, '#d8c870', 2, 15); for (let y = 10; y < 21; y += 3) px(c, 1, y, '#d8c870', 2, 2); });
    const k1 = L.plane(0.028, 0.085, lam(tKey, 0xffffff, { side: DS, alphaTest: 0.5 }), -0.085, -0.115, 0.012, hook, Math.PI / 2); k1.rotation.z = 0.15;
    const k2 = L.plane(0.024, 0.075, lam(tKey2, 0xffffff, { side: DS, alphaTest: 0.5 }), -0.087, -0.105, -0.015, hook, Math.PI / 2); k2.rotation.z = -0.25;
    L.plane(0.04, 0.03, lam(L.cvs(8, 6, (c) => { px(c, 0, 0, '#c82a1a', 8, 6); px(c, 1, 1, '#ffffff', 6, 1); }), 0xffffff, { side: DS }), -0.086, -0.16, 0.03, hook, Math.PI / 2); }
  L.plane(1.0, 2.1, lam(tDoor), 2.98, 1.05, -0.4, K, -Math.PI / 2);
  // jugs + buckets on the kitchen floor (31), filled one by one
  const water = await prop('water'), bucket = await prop('bucket');
  const JUGS = []; for (let i = 0; i < 10; i++) { const j = water.clone(true); j.position.set(-1.9 + (i % 5) * 0.32, 0, 1.05 + Math.floor(i / 5) * 0.32); K.add(j); JUGS.push(j); }
  const BUCKS = []; for (let i = 0; i < 4; i++) { const b = bucket.clone(true); b.position.set(-0.3 + (i % 2) * 0.4, 0, 1.0 + Math.floor(i / 2) * 0.4); K.add(b); BUCKS.push(b); }
  const kLight = new THREE.PointLight(0xffe8c0, 4, 7, 1.3); kLight.position.set(0.3, 2.4, 0); K.add(kLight);
  const bulb = L.mesh(new THREE.SphereGeometry(0.09, 6, 4), basic(null, 0xfff4d0), 0.3, 2.55, 0, K);
  const notebook = await prop('notebook'); notebook.position.set(0.72, 0.79, 0.58); notebook.rotation.y = 0.15; K.add(notebook);
  const phone = await prop('phone');
  // BATHROOM (x=12)
  const BA = room(12, 3.2, 3.0, 2.5, lam(L.rep(tTile, 4, 3), 0xffffff, { side: DS }), lam(L.rep(tTile, 3, 3), 0xd0d8dc));
  const tub = await prop('bathtub'); { const bb = new THREE.Box3().setFromObject(tub); tub.position.set(0, 0, -0.95); BA.add(tub); }
  const tubW = L.plane(1.45, 0.62, lam(noiseTex(16, 16, [110, 160, 200], 20, 9), 0xffffff, { transparent: true, opacity: 0.85 }), 0, 0.12, -0.95, BA, 0, -Math.PI / 2);
  const tubStream = B(0.025, 0.35, 0.025, basic(null, 0xa8d0f0, { transparent: true, opacity: 0.8 }), -0.62, 0.42, -0.95, BA);
  const bLight = new THREE.PointLight(0xfff4e0, 4, 6, 1.3); bLight.position.set(0, 2.3, 0); BA.add(bLight);
  // BASEMENT (x=24): concrete, the water heater, stairs
  const BS = room(24, 4, 4, 2.3, lam(L.rep(tConc, 3, 2), 0xffffff, { side: DS }), lam(L.rep(tConc, 3, 3), 0x9a9890));
  const heater = cyl(0.3, 0.3, 1.5, 10, lam(L.rep(tHeater, 2, 1)), 0.6, 0.75, -1.4, BS); cyl(0.04, 0.04, 0.6, 6, lam(null, 0xb87a4a), 0.6, 1.8, -1.4, BS);
  for (let i = 0; i < 8; i++) B(0.9, 0.06, 0.28, lam(tWood), -1.3, 0.25 + i * 0.26, 1.5 - i * 0.26, BS);
  const sLight = new THREE.PointLight(0xffe0b0, 3, 5, 1.4); sLight.position.set(0, 2.1, 0); BS.add(sLight); L.mesh(new THREE.SphereGeometry(0.06, 6, 4), basic(null, 0xfff0c0), 0, 2.15, 0, BS);
  // FRONT HALL (x=36): front door (screws in the strike plate), Ribbon's bed
  const H = room(36, 3.4, 3.0, 2.6, mPaper, lam(L.rep(tFloor, 3, 3)));
  const door = L.plane(0.95, 2.05, lam(tDoor), 0, 1.03, -1.48, H); B(1.1, 0.1, 0.06, lam(null, 0xe8e4d8), 0, 2.1, -1.47, H);
  for (const s of [-1, 1]) B(0.08, 2.1, 0.06, lam(null, 0xe8e4d8), s * 0.52, 1.05, -1.47, H);
  const plate = B(0.035, 0.2, 0.012, lam(null, 0xc8b060), 0.505, 1.0, -1.44, H); const knob = L.mesh(new THREE.SphereGeometry(0.035, 6, 4), lam(null, 0xd8b850), 0.38, 1.0, -1.42, H);
  const screws = [], shafts = []; for (const y of [0.93, 1.07]) { const sc = cyl(0.009, 0.009, 0.006, 8, lam(null, 0xd8d8d8), 0.505, y, -1.43, H); sc.rotation.x = Math.PI / 2; screws.push(sc);
    const sh = cyl(0.0045, 0.002, 0.076, 6, basic(null, 0xe8ecf0, { depthTest: false, transparent: true }), 0.505, y, -1.47 - 0.038, H); sh.rotation.x = Math.PI / 2; sh.renderOrder = 6; shafts.push(sh); }
  const studG = B(0.09, 2.4, 0.04, basic(null, 0x6aff5a, { transparent: true, opacity: 0.25, depthTest: false }), 0.6, 1.2, -1.5, H); studG.visible = false; studG.renderOrder = 4;
  const bed = new THREE.Group(); bed.position.set(-1.0, 0, -0.6); H.add(bed); { const r = cyl(0.45, 0.48, 0.16, 10, lam(tBed), 0, 0.08, 0, bed); r.scale.z = 0.75; const i = cyl(0.36, 0.36, 0.06, 10, lam(null, 0xe8d8c0), 0, 0.15, 0, bed); i.scale.z = 0.75; }
  const hwin = L.plane(0.8, 0.9, basic(tYard), -1.69, 1.5, 0.5, H, Math.PI / 2);
  const hLight = new THREE.PointLight(0xffe0b0, 3, 6, 1.4); hLight.position.set(0, 2.3, 0); H.add(hLight);
  // BEDROOM (x=48), night: west window looking at the barn
  const BR = room(48, 3.6, 3.4, 2.5, lam(L.rep(tPaper, 4, 3), 0x8a8aa8, { side: DS }), lam(L.rep(tFloor, 3, 3), 0x6a6a80));
  const bwin = L.plane(1.0, 1.1, basic(tNight), 0, 1.45, -1.69, BR); B(1.15, 0.08, 0.12, lam(null, 0xb8b4a8), 0, 0.88, -1.66, BR); B(0.05, 1.1, 0.05, lam(null, 0xb8b4a8), 0, 1.45, -1.67, BR);
  for (const s of [-1, 1]) L.plane(0.4, 1.4, lam(null, 0x6a2a20, { side: DS }), s * 0.72, 1.45, -1.62, BR);
  B(1.4, 0.45, 2.0, lam(tBed), 1.0, 0.22, 0.5, BR); B(1.4, 0.7, 0.08, lam(tWood), 1.0, 0.6, -0.5, BR);
  const moon = new THREE.DirectionalLight(0x8aa0e0, 1.2); moon.position.set(48, 3, 4); moon.target.position.set(48, 1, -1); scene.add(moon); scene.add(moon.target);

  // ---------- ep8 detail pass: dressing, dirt and corner AO in every room ----------
  { const tAO = L.cvs(4, 16, (c) => { const g = c.createLinearGradient(0, 16, 0, 0); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 4, 16); });
    const tCor = L.cvs(16, 4, (c) => { const g = c.createLinearGradient(0, 0, 16, 0); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 4); });
    const tDirt = L.cvs(32, 32, (c) => { c.clearRect(0, 0, 32, 32); const r = L.rng(51); for (let k = 0; k < 90; k++) { const a = r() * 6.3, d = Math.sqrt(r()) * 14; px(c, 16 + Math.cos(a) * d, 16 + Math.sin(a) * d, r() < 0.5 ? 'rgba(70,50,30,0.35)' : 'rgba(40,30,20,0.3)', 2, 2); } });
    const mAO = (rep) => basic(L.rep(tAO, rep, 1), 0xffffff, { transparent: true, depthWrite: false, side: DS }), mC = basic(tCor, 0xffffff, { transparent: true, depthWrite: false, side: DS });
    const aoRoom = (g, w, d, h) => { for (const [x, z, l, ry] of [[0, -d / 2 + 0.01, w, 0], [0, d / 2 - 0.01, w, Math.PI], [-w / 2 + 0.01, 0, d, Math.PI / 2], [w / 2 - 0.01, 0, d, -Math.PI / 2]]) { const p = L.plane(l, 0.6, mAO(Math.round(l)), x, 0.3, z, g, ry); p.renderOrder = 2; }
      for (const [x, z, ry, fl] of [[-w / 2 + 0.01, -d / 2 + 0.2, Math.PI / 2, 1], [w / 2 - 0.01, -d / 2 + 0.2, -Math.PI / 2, -1], [-w / 2 + 0.2, -d / 2 + 0.01, 0, 1], [w / 2 - 0.2, -d / 2 + 0.01, 0, -1]]) { const p = L.plane(0.4, h, mC, x, h / 2, z, g, ry); p.renderOrder = 2; p.scale.x = fl; } };
    aoRoom(K, 6, 4.4, 2.7); aoRoom(BA, 3.2, 3.0, 2.5); aoRoom(BS, 4, 4, 2.3); aoRoom(H, 3.4, 3.0, 2.6); aoRoom(BR, 3.6, 3.4, 2.5);
    const dirt = (g, x, z, s) => { const p = L.plane(s, s, basic(tDirt, 0xffffff, { transparent: true, depthWrite: false }), x, 0.006, z, g, 0, -Math.PI / 2); p.renderOrder = 1; };
    for (const [x, z, s] of [[-1.2, 1.6, 1.2], [2.4, 0.2, 1.4], [0.4, -1.4, 0.9], [-2.4, -0.8, 1.0]]) dirt(K, x, z, s);
    for (const [x, z, s] of [[0.6, 0.6, 1.3], [-0.8, -0.4, 1.0]]) dirt(H, x, z, s); dirt(BS, 0.5, 0.6, 1.8); dirt(BS, -0.8, -0.8, 1.4);
    // pictures, calendar, shelves with jars, curtains, rug, lamp shades
    const paint = (seed, sky, land) => L.cvs(24, 18, (c) => { const r = L.rng(seed); px(c, 0, 0, sky, 24, 11); px(c, 0, 11, land, 24, 7); px(c, 4 + r() * 10 | 0, 6, '#8a2a20', 6, 5); px(c, 4 + r() * 10 | 0, 4, '#5a4a40', 7, 2); px(c, 17, 3, '#f0e0a0', 3, 3); });
    const frame = (g, x, y, z, ry, w, h, t) => { const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = ry; g.add(f); B(w + 0.08, h + 0.08, 0.03, lam(tWood, 0x6a4a2a), 0, 0, 0, f); L.plane(w, h, lam(t), 0, 0, 0.017, f); };
    frame(K, -1.3, 1.85, -2.18, 0, 0.5, 0.38, paint(1, '#a8c8e0', '#7a9a4a')); frame(K, 2.97, 1.85, 1.5, -Math.PI / 2, 0.36, 0.48, paint(2, '#e8c8a0', '#8a7a4a'));
    frame(H, 0.9, 1.7, -1.47, 0, 0.45, 0.34, paint(3, '#c8d8e8', '#6a8a3a')); frame(BR, -1.78, 1.6, 0.4, Math.PI / 2, 0.5, 0.36, paint(4, '#6a7aa0', '#3a4a3a'));
    const cal = L.cvs(16, 24, (c) => { px(c, 0, 0, '#f4f0e8', 16, 24); px(c, 0, 0, '#c82a1a', 16, 5); for (let i = 0; i < 20; i++) px(c, 1 + (i % 5) * 3, 7 + Math.floor(i / 5) * 4, i === 3 ? '#c82a1a' : '#6a6a6a', 2, 2); px(c, 3, 1, '#ffffff', 10, 2); });
    L.plane(0.3, 0.45, lam(cal), -2.0, 1.7, -2.18, K);
    const shelf = (g, x, y, z, ry, w, seed) => { const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = ry; g.add(s); B(w, 0.04, 0.22, lam(tWood), 0, 0, 0, s); const r = L.rng(seed);
      for (let k = 0; k < Math.floor(w / 0.16); k++) { const col = [0xc8a040, 0x8a3a2a, 0x4a7a3a, 0xe8e0c8, 0x3a5a8a, 0xb86a3a][k % 6], hh = 0.1 + r() * 0.12; cyl(0.045, 0.045, hh, 7, lam(null, col), -w / 2 + 0.1 + k * 0.16, 0.02 + hh / 2, 0, s); if (r() < 0.5) cyl(0.047, 0.047, 0.02, 7, lam(null, 0xb0b0b0), -w / 2 + 0.1 + k * 0.16, 0.03 + hh, 0, s); } };
    shelf(K, -2.88, 1.55, 0.6, Math.PI / 2, 1.2, 1); shelf(K, -2.88, 1.95, 0.6, Math.PI / 2, 1.2, 2); shelf(BS, 1.88, 0.7, 0.8, -Math.PI / 2, 1.4, 4);
    { const tJar = L.cvs(16, 16, (c) => { px(c, 0, 0, '#e8962a', 16, 16); for (let k = 0; k < 10; k++) px(c, (k * 5) % 16, (k * 7) % 12, '#f4b84a', 2, 2); px(c, 0, 5, '#f0e8d0', 16, 6); px(c, 2, 7, '#8a3a1a', 12, 1); px(c, 4, 9, '#6a6a6a', 8, 1); });
      const s2 = new THREE.Group(); s2.position.set(1.88, 1.2, 0.8); s2.rotation.y = -Math.PI / 2; BS.add(s2); B(1.4, 0.04, 0.24, lam(tWood), 0, 0, 0, s2);
      for (let k = 0; k < 8; k++) { cyl(0.05, 0.05, 0.16, 8, lam(tJar), -0.6 + k * 0.17, 0.1, 0, s2); cyl(0.052, 0.052, 0.025, 8, lam(null, 0xc8b060), -0.6 + k * 0.17, 0.19, 0, s2); }
      B(1.4, 0.04, 0.24, lam(tWood), 0, 0.42, 0, s2); for (let k = 0; k < 7; k++) cyl(0.05, 0.05, 0.16, 8, lam(tJar), -0.55 + k * 0.18, 0.52, 0, s2); } shelf(BA, 1.48, 1.4, 0.4, -Math.PI / 2, 0.7, 5);
    const tCheck = L.cvs(16, 16, (c) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(c, x, y, ((x >> 2) + (y >> 2)) % 2 ? '#e8e0d0' : '#b83a2a'); });
    for (const s_ of [-1, 1]) L.plane(0.42, 1.15, lam(tCheck, 0xffffff, { side: DS }), 0.4 + s_ * 0.7, 1.62, -2.12, K);
    B(1.7, 0.04, 0.04, lam(null, 0x6a4a2a), 0.4, 2.22, -2.12, K);
    const tRug = L.cvs(32, 20, (c) => { px(c, 0, 0, '#6a2a3a', 32, 20); px(c, 2, 2, '#c8a060', 28, 16); px(c, 4, 4, '#3a4a6a', 24, 12); for (let x = 6; x < 26; x += 4) px(c, x, 8, '#c8a060', 2, 4); });
    L.plane(2.2, 1.5, lam(tRug), 0.3, 0.008, 0.35, K, 0, -Math.PI / 2); L.plane(1.2, 0.8, lam(tRug), 0, 0.008, 0.4, H, 0, -Math.PI / 2);
    L.plane(0.9, 0.5, lam(L.cvs(8, 8, (c) => px(c, 0, 0, '#7ab0c8', 8, 8))), 0, 0.01, -0.2, BA, 0, -Math.PI / 2);
    L.mesh(new THREE.ConeGeometry(0.22, 0.18, 8, 1, true), lam(null, 0x2a5a3a, { side: DS }), 0.3, 2.6, 0, K); B(0.01, 0.12, 0.01, lam(null, 0x202020), 0.3, 2.66, 0, K);
    // bathroom: mirror, towel
    B(0.6, 0.8, 0.03, lam(null, 0x8a8a90), -0.9, 1.6, -1.48, BA); L.plane(0.52, 0.72, basic(L.cvs(8, 8, (c) => { px(c, 0, 0, '#a8c0d0', 8, 8); px(c, 1, 1, '#d8e8f0', 2, 5); })), -0.9, 1.6, -1.46, BA);
    L.plane(0.4, 0.7, lam(L.cvs(8, 16, (c) => { px(c, 0, 0, '#d8a83a', 8, 16); for (let y = 2; y < 16; y += 5) px(c, 0, y, '#b8882a', 8, 1); }), 0xffffff, { side: DS }), 1.58, 1.1, -0.6, BA, -Math.PI / 2);
    // hall: coat hooks with a coat, boots
    B(0.6, 0.06, 0.04, lam(tWood), -1.0, 1.75, -1.47, H); L.plane(0.4, 0.8, lam(L.cvs(8, 16, (c) => { px(c, 1, 0, '#5a3a24', 6, 16); px(c, 0, 4, '#5a3a24', 8, 10); px(c, 3, 2, '#3a2416', 2, 12); }), 0xffffff, { side: DS }), -1.15, 1.38, -1.45, H);
    for (const x of [1.0, 1.2]) B(0.12, 0.25, 0.26, lam(null, 0x3a2a1a), x, 0.125, -1.25, H);
    // bedroom: nightstand + lamp
    B(0.45, 0.55, 0.4, lam(tWood), 1.9, 0.27, -0.9, BR); cyl(0.05, 0.07, 0.25, 6, lam(null, 0xd8c8a0), 1.9, 0.68, -0.9, BR); L.mesh(new THREE.ConeGeometry(0.16, 0.18, 8, 1, true), lam(null, 0xe8d8b0, { side: DS }), 1.9, 0.86, -0.9, BR); }
  // ---------- characters ----------
  const ch = L.hero(); scene.add(ch.root); paintScared(ch);
  L.holdIn(ch, phone, 'R', [0, 0.85, 0.2], [0, 0, 0]); phone.visible = false;
  const pen = B(0.008, 0.12, 0.008, lam(null, 0x2040a0), 0, 0, 0, ch.hand('R')); pen.scale.setScalar(1 / L.S); pen.position.set(0, 0.85, 0); pen.visible = false;
  const dog = await loadDog(L); scene.add(dog.root); dog.root.visible = false;
  const hen = L.ps1Clone((await L.loadModel('models/chicken.glb')).scene); scene.add(hen); hen.visible = false;
  const AVA = (x, z, yaw, y = 0) => { ch.root.visible = true; ch.root.position.set(x, y, z); ch.root.rotation.y = yaw; };

  // ---------- helpers ----------
  const mkCam = (fov = 42) => new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 80);
  const look = (c, p, tg) => { c.position.copy(p); c.lookAt(tg); c.updateMatrixWorld(); };
  const lerpV = (a, b, k) => V(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
  function reset() { ch.root.visible = false; phone.visible = false; pen.visible = false; dog.root.visible = false; hen.visible = false; stream.visible = false; studG.visible = false; shafts.forEach((x) => x.visible = false);
    kLight.intensity = 4; bulb.visible = true; amb.intensity = 1.25; kwin.material.map = tYard; setClock(7, 5); tubW.position.y = 0.12; tubStream.visible = false; fridgeLight.visible = true;
    JUGS.forEach((j) => j.visible = true); BUCKS.forEach((b) => b.visible = true); }
  function tag(o, cam, lt, t0, tw, text, x, y, col = '#ffffff', world = null, hold = 99) {
    const t = t0 + lt; if (t < tw || t > tw + hold) return; const c = o.tctx, w = textWidth(text, 2) + 14, h = 22;
    if (world) { const [wx, wy] = L.toScreen(cam, ...world); c.strokeStyle = col; c.beginPath(); c.moveTo(wx + 0.5, wy + 0.5); c.lineTo(x + 0.5, y + 0.5); c.stroke(); c.fillStyle = col; c.fillRect(wx - 1, wy - 1, 3, 3); }
    c.fillStyle = 'rgba(6,8,14,0.82)'; c.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), w, h); c.fillStyle = col; c.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), w, 1); c.fillRect(Math.round(x - w / 2), Math.round(y + h / 2) - 1, w, 1);
    bitText(c, text, x, y, 2, col, { outline: null }); }
  // gallons meter (RE-style bar on the right): value rolls from a to b between t0 and t1
  function meter(o, t, a, b, t0, t1, plus) { const c = o.tctx, k = ease(t0, t1, t), v = Math.round(a + (b - a) * k), x = 476, y = 40, h = 170;
    c.fillStyle = 'rgba(6,8,14,0.85)'; c.fillRect(x, y, 140, h + 44); c.fillStyle = '#4fd6ff'; c.fillRect(x, y, 140, 1);
    bitText(c, 'WATER', x + 70, y + 12, 2, '#4fd6ff', { outline: null }); const bh = Math.round(h * 0.75 * v / 110);
    c.fillStyle = '#0e2030'; c.fillRect(x + 50, y + 26, 40, h - 14); c.fillStyle = '#2a86d8'; c.fillRect(x + 50, y + 26 + h - 14 - bh, 40, bh);
    bitText(c, `${v} GAL`, x + 70, y + h + 26, 2, '#ffffff', { outline: null }); if (plus && t > t0) bitText(c, plus, x + 112, y + 60, 2, '#8cff5a', { outline: null }); }
  const out = {};
  function S(id, camA, camB, fov, fn, ov, durK = 1) { const cam = mkCam(fov); const ids = Object.keys(T); const i = ids.indexOf(id); const dur = i + 1 < ids.length ? T[ids[i + 1]] - T[id] : 6;
    out[id] = { scene, camera: cam, update(lt, t) { reset(); const k = L.smooth(lt / (dur * durK)); look(cam, lerpV(camA[0], camB[0], k), lerpV(camA[1], camB[1], k)); if (fn) fn(lt, t, cam, dur); }, overlay: ov ? (lt, dt, a, o) => ov(lt, o, cam, T[id] + lt) : undefined }; }

  // 01: kitchen at dawn, Ava at the window with the phone; the phone buzzes on "goes off"
  S('01_kitchen', [[1.6, 1.55, 1.4], [0.3, 1.45, -1.4]], [[1.4, 1.5, 1.1], [0.3, 1.45, -1.4]], 44, (lt, t, cam) => { AVA(0.1, -1.1, Math.PI * 0.8); phone.visible = true;
    const buzz = t > W('h1', 'goes') && t < W('h1', 'goes') + 0.8; phone.rotation.z = buzz ? Math.sin(lt * 90) * 0.08 : 0; ch.pose(lt, [L.seg('phone_look', 0, { speed: 0.6 })], [[-99, buzz ? 'surprised' : 'half', 'neutral']]); setClock(6, 42); });
  // 15: keys on the hook (close), labels
  S('15_keys', [[2.0, 1.5, 1.35], [2.95, 1.4, 0.9]], [[2.1, 1.48, 1.25], [2.95, 1.4, 0.9]], 40, null, (lt, o, cam, t) => { tag(o, cam, lt, T['15_keys'], W('b2', 'keys'), 'TRUCK KEYS', 160, 80, '#ff7b2e', [2.88, 1.38, 0.9]); tag(o, cam, lt, T['15_keys'], W('b2', 'half'), 'HALF A TANK', 470, 60, '#ffd23f'); tag(o, cam, lt, T['15_keys'], W('b2', 'forty'), 'TOWN: 40 MIN', 470, 90, '#ff4030'); });
  // 25: Ava at the sink, water runs
  S('25_sink', [[1.6, 1.6, 0.6], [0.4, 1.1, -1.9]], [[1.5, 1.58, 0.4], [0.4, 1.1, -1.9]], 44, (lt, t, cam) => { AVA(0.4, -1.3, Math.PI); stream.visible = true; ch.pose(lt, [L.seg('pour', 0, { speed: 0.5 })], [[-99, 'open', mouthAt(t)]]); });
  // 30: bathtub filling (+40)
  S('30_tub', [[12.9, 1.9, 0.9], [12, 0.3, -0.95]], [[12.8, 1.8, 0.7], [12, 0.3, -0.95]], 46, (lt, t, cam, dur) => { tubStream.visible = true; tubW.position.y = 0.12 + 0.32 * ease(0, dur, lt); },
    (lt, o, cam, t) => meter(o, t, 0, 40, W('w8', 'forty') - 0.5, W('w8', 'forty') + 0.6, '+40'));
  // 31: jugs and buckets (+30)
  S('31_jugs', [[0.6, 1.7, 2.05], [-0.8, 0.15, 1.2]], [[0.55, 1.68, 2.0], [-0.8, 0.15, 1.2]], 58, (lt, t) => { const t0 = W('w9', 'ten'); JUGS.forEach((j, i) => j.visible = t > t0 + i * 0.18); BUCKS.forEach((b, i) => b.visible = t > W('w9', 'four') + i * 0.25); },
    (lt, o, cam, t) => meter(o, t, 40, 70, W('w9', 'ten'), W('w9', 'thirty') + 0.3, '+30'));
  // 32: basement water heater (+40), callback to the police station
  S('32_heater', [[25.6, 1.4, 0.9], [24.6, 0.9, -1.4]], [[25.4, 1.35, 0.6], [24.6, 0.9, -1.4]], 44, null, (lt, o, cam, t) => { meter(o, t, 70, 110, W('w10', 'another'), W('w10', 'forty') + 0.5, '+40'); tag(o, cam, lt, T['32_heater'], W('w10', 'heater'), 'WATER HEATER', 210, 60, '#4fd6ff', [24.6, 1.2, -1.1]); });
  // 37: lights flicker at 7:51, the fridge goes quiet
  S('37_flicker', [[2.4, 1.7, 1.8], [-0.8, 1.3, -1.5]], [[2.3, 1.68, 1.7], [-0.8, 1.3, -1.5]], 48, (lt, t) => { setClock(7, 51); const tf = W('w17', 'flicker'), tq = W('w18', 'quiet');
    const on = t < tf || (t < tq && Math.floor((t - tf) * 7) % 3 !== 1 && (t - tf) < 1.3); kLight.intensity = on ? 4 : 0; bulb.visible = on; fridgeLight.visible = t < tq; amb.intensity = on ? 1.25 : 0.85; },
    (lt, o, cam, t) => { tag(o, cam, lt, T['37_flicker'], W('w17', 'seven'), '7:51 AM', 520, 50, '#ffd23f'); if (t > W('w18', 'quiet')) tag(o, cam, lt, T['37_flicker'], W('w18', 'quiet'), 'NO POWER', 520, 80, '#ff4030'); });
  // 54: Ribbon's bed by the front door; she barks at a hen at the window (gag)
  S('54_bed', [[37.2, 1.4, 1.2], [35.4, 0.5, -0.4]], [[37.0, 1.35, 1.0], [35.4, 0.5, -0.4]], 46, (lt, t) => { dog.root.visible = true; dog.root.position.set(35.0, 0, -0.6); dog.root.rotation.y = 0.2;
    const gag = W('n9', 'chickens'); if (t < gag - 0.3) dog.update(lt, 'sleepy_wag', { wag: 0.6 }); else { dog.update(lt, 'growl', { growl: 0.6, look: V(34.3, 1.4, 0.5) }); dog.root.rotation.y = -1.2; hen.visible = true; hen.position.set(34.25, 1.05, 0.5); hen.rotation.y = Math.PI / 2; } },
    (lt, o, cam) => { tag(o, cam, lt, T['54_bed'], W('n8', 'alarm'), 'ALARM: ON', 500, 50, '#8cff5a'); });
  // 60: front door, screws through the strike plate into the stud (callback ep1)
  S('60_door', [[36.95, 1.12, -0.85], [36.48, 1.0, -1.45]], [[36.9, 1.1, -0.95], [36.48, 1.0, -1.45]], 38, (lt, t) => { studG.visible = t > W('l6', 'stud'); screws.forEach((s, i) => s.visible = t > W('l6', 'three') + i * 0.4); shafts.forEach((s, i) => s.visible = t > W('l6', 'stud') - 0.2 + i * 0.15); },
    (lt, o, cam) => { const t0 = T['60_door']; tag(o, cam, lt, t0, W('l6', 'three'), '3" SCREWS', 230, 110, '#ffd23f', [36.505, 1.0, -1.43]); tag(o, cam, lt, t0, W('l6', 'stud'), 'INTO THE STUD', 470, 90, '#8cff5a', [36.6, 1.5, -1.5]); tag(o, cam, lt, t0, W('l6', 'same'), 'SAME AS EP. 1', 470, 300 - 40, '#ffffff'); });
  // 63: at the kitchen table, writing it all down
  S('63_table', [[2.2, 1.45, 1.6], [0.7, 0.85, 0.75]], [[2.1, 1.42, 1.45], [0.7, 0.85, 0.75]], 44, (lt, t, cam) => { kwin.material.map = tDusk; kLight.intensity = 5; AVA(0.75, 1.0, Math.PI); pen.visible = true;
    // v4: SEATED on the chair (bend IK on top of idle), right hand writes on the notebook, left hand holds the page
    ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.4 })], [[-99, 'half', mouthAt(t)]]); const wr = Math.sin(lt * 9) * 0.02, wz = Math.sin(lt * 2.3) * 0.015;
    ch.bend({ hipY: 0.56, kneeL: [0.12, 0.56, 0.42], kneeR: [-0.12, 0.56, 0.42], footL: [0.13, 0.04, 0.5], footR: [-0.13, 0.04, 0.5],
      elbowR: [-0.2, 0.86, 0.14], handR: [-0.06 + wr, 0.83, 0.42 + wz], elbowL: [0.22, 0.86, 0.14], handL: [0.12, 0.82, 0.4] }); });
  // 66: Ava turns the key in the back door, then sits
  S('66_sit', [[1.4, 1.6, 1.8], [2.9, 1.2, -0.4]], [[1.3, 1.55, 1.6], [2.9, 1.2, -0.4]], 44, (lt, t, cam) => { kwin.material.map = tDusk; AVA(2.5, -0.4, Math.PI / 2); const a1 = W('i9b', 'lock') - T['66_sit'], a2 = W('i9b', 'twice') - T['66_sit'], a3 = W('i9b', 'sit') - T['66_sit'];
    ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.4 }), L.seg('turn_key', a1 - 0.3, { fade: 0.2 }), L.seg('push_door', a2 - 0.2, { fade: 0.2 }), L.seg('idle', a3, { loop: true, speed: 0.4, fade: 0.3 })], [[-99, 'open', mouthAt(t)], [a3, 'relaxed', mouthAt(t, 'smile')]]); });
  // 68: night, Ribbon at the bedroom window, Ava gets up
  S('68_wake', [[46.6, 1.55, 1.0], [48.2, 0.9, -1.3]], [[46.7, 1.5, 0.85], [48.2, 0.9, -1.3]], 46, (lt, t, cam) => { amb.intensity = 0.55;
    dog.root.visible = true; dog.root.position.set(48.0, 0, -1.25); dog.root.rotation.y = Math.PI; dog.update(lt, 'stare', { look: V(48, 1.5, -3) });
    AVA(47.3, 0.4, Math.PI - 0.35); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.4 })], [[-99, 'half', mouthAt(t)]]); });
  // 10b: the basement shelves, grandma's canned peaches (a3b)
  S('10b_cellar', [[24.75, 1.45, 0.7], [25.88, 1.3, 0.8]], [[24.9, 1.42, 0.72], [25.88, 1.3, 0.8]], 44, null, (lt, o, cam) => tag(o, cam, lt, T['10b_cellar'], W('a3b', 'peaches'), 'CANNED PEACHES', 200, 70, '#ffd23f', [25.88, 1.3, 0.8]));
  // 69b: dark bedroom, Ava walks slowly to the window next to Ribbon (x2c)
  S('69b_go', [[49.6, 1.55, 1.3], [48.2, 1.1, -1.2]], [[49.5, 1.52, 1.15], [48.2, 1.1, -1.2]], 46, (lt, t, cam, dur) => { amb.intensity = 0.55; const k = ease(0.3, Math.min(dur, 3.5), lt);
    dog.root.visible = true; dog.root.position.set(47.75, 0, -1.25); dog.root.rotation.y = Math.PI; dog.update(lt, 'growl', { growl: 0.5, look: V(47.8, 1.5, -3) });
    AVA(46.9 + 1.55 * k, 0.9 - 1.6 * k, Math.PI - 0.6); ch.pose(lt, [L.seg(k < 1 ? 'walk' : 'idle', 0, { loop: true, speed: k < 1 ? 0.6 : 0.4 })], [[-99, 'half', 'neutral']]); });
  // 73: "Oh, fudge." frontal, scared eyes, the normal open mouth (never happy)
  S('73_fudge', [[48.2, 1.55, -0.2], [48.0, 1.5, -1.25]], [[48.2, 1.55, -0.32], [48.0, 1.5, -1.25]], 34, (lt, t, cam) => { amb.intensity = 0.7;
    AVA(48.0, -1.25, 0); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.3 })], [[-99, 'scared', 'talkA'], [W('x6', -1) - T['73_fudge'] + 0.05, 'scared', 'talkO']]); ch.lookAt(cam, 1, 30); });

  // dark interiors are lifted like the other 3D shots (film.js gamma); nothing else to do
  return out;
}

export function sfx(ctx) {
  const { T, at } = ctx, W = (k, w = 0) => at(k, w), E = [], p = (t, n) => E.push([t, n]);
  p(W('h1', 'goes'), 'phone_vibrate'); p(W('b2', 'keys'), 'keys_jingle'); for (const w of ['keys', 'half', 'forty']) p(W('b2', w), 'label');
  p(T['25_sink'] + 0.3, 'tap_run'); p(T['30_tub'] + 0.1, 'tub_fill'); p(W('w8', 'forty'), 'counter_tick');
  for (let i = 0; i < 10; i++) p(W('w9', 'ten') + i * 0.18, 'item_pop'); for (let i = 0; i < 4; i++) p(W('w9', 'four') + i * 0.25, 'bucket_set'); p(W('w9', 'ten'), 'jug_fill');
  p(W('w10', 'heater'), 'label'); p(W('w10', 'another'), 'counter_tick'); p(T['32_heater'] + 0.5, 'pipe_tick');
  p(W('w17', 'seven'), 'label'); p(W('w17', 'flicker'), 'power_flicker'); p(W('w18', 'quiet'), 'power_down_hum'); p(W('w18', 'quiet') + 0.1, 'label_pop_danger');
  p(T['54_bed'] + 0.2, 'dog_sleep_breath'); p(W('n8', 'alarm'), 'label'); p(W('n9', 'chickens') - 0.3, 'chicken_cluck_short'); p(W('n9', 'chickens') - 0.1, 'dog_bark');
  p(W('l6', 'three'), 'drill'); p(W('l6', 'three') + 0.4, 'drill'); p(W('l6', 'three'), 'label'); p(W('l6', 'stud'), 'label'); p(W('l6', 'same'), 'label');
  p(T['63_table'] + 0.4, 'pen_scribble'); p(T['63_table'] + 2.2, 'pen_scribble'); p(T['66_sit'] + 0.5, 'key_insert'); p(T['66_sit'] + 0.9, 'key_turn');
  p(T['68_wake'] + 0.3, 'dog_growl_low'); p(T['73_fudge'] + 0.05, 'sting_low');
  p(W('a3b', 'peaches'), 'label'); for (let t = T['69b_go'] + 0.4; t < T['69b_go'] + 3.4; t += 0.8) p(t, 'step_wood_soft'); p(T['69b_go'] + 1.0, 'dog_growl_low');
  return E.filter((e) => Number.isFinite(e[0]));
}
