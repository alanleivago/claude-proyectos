// sets/floor30b.js — ep16 "Stuck On Floor 30… Part 2". Mundo del ep6 (pieces/zombie-06-floor30/engine/sets/floor30.js): torre de 34 pisos,
// apartamento 3012 con la banera de 40 gal, la comoda contra la puerta, el telefono al 18 %, el vecino del 3011 (caja de dialogo RE, sin voz).
// Nuevo: calle con niebla espesa, autos y podio del lobby (el cazador entra), balcones en la fachada (el de abajo del 3012), puerta 3012 con
// bisagra + cadena, pasillo alto con la puerta STAIRS, hueco de escalera (escena aparte) con anillos de sonido que suben, nota bajo la puerta (FILE),
// maquina de escribir DAY 3, First Aid Spray en la comoda, hierba verde. Gramatica del ep15 (zombie-15-lasttrain3/engine/sets/lasttrain3.js):
// placas 1 OPEN / 2 STAY QUIET, rebobinado glitch, decision RE3 en negativo con el cazador golpeando la puerta. Tiempos: cues.json.
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { paintScared } from './avaface.js';
import { makeSpray } from './respray.js';

export async function shots({ L, TL, youDied, hud }) {
  window.__hud = hud;
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.02, 2600);
  const FY = 29 * 2.9;
  const A = (x, y, z) => V(x, y + FY, z);
  const look = (c, p, t) => { c.up.set(0, 1, 0); c.position.copy(p); c.lookAt(t); c.updateProjectionMatrix(); };
  const lk = (c, p, t) => look(c, A(...p), A(...t));
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const PO = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 };
  const cr = (keys, t) => {   // Catmull-Rom por tiempo: keys [[t, x, y, z], ...]
    if (t <= keys[0][0]) return V(keys[0][1], keys[0][2], keys[0][3]);
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const k = (j) => keys[Math.max(0, Math.min(keys.length - 1, j))], [a, b, c, d] = [k(i - 1), k(i), k(i + 1), k(i + 2)];
    const u = Math.min(1, (t - b[0]) / (c[0] - b[0])), u2 = u * u, u3 = u2 * u;
    const f = (j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3);
    return V(f(1), f(2), f(3));
  };
  const crA = (keys, t) => cr(keys, t).add(V(0, FY, 0));
  const mergeBoxes = (list, m, parent) => {
    const P = [], N = [], U = [];
    for (const [w, h, d, x, y, z, ry = 0, rx = 0] of list) { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); U.push(...g.attributes.uv.array); g.dispose(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    const o = new THREE.Mesh(g, m); parent.add(o); return o; };
  const vign = (k) => (lt, dt, a, o) => { const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LW * 0.36, LW / 2, LH * 0.5, LH * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH); };
  const glowTex = (r, g, b) => L.cvs(32, 32, (c) => { const gg = c.createRadialGradient(16, 16, 0, 16, 16, 16); gg.addColorStop(0, `rgba(${r},${g},${b},1)`); gg.addColorStop(0.4, `rgba(${r},${g},${b},0.45)`); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(0, 0, 32, 32); });
  const addGlow = (tex, col) => L.basic(tex, col, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });

  // ================= texturas pintadas (ep6) =================
  const R = L.rng(606);
  const noiseTex = (w, h, base, amp, seed, extra) => L.cvs(w, h, (c) => { const r = L.rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (r() - 0.5) * amp; px(c, x, y, `rgb(${base[0] + n},${base[1] + n},${base[2] + n})`); } if (extra) extra(c, r); });
  const tWallp = noiseTex(32, 32, [150, 142, 120], 14, 1, (c, r) => {
    for (let x = 0; x < 32; x += 8) { px(c, x, 0, 'rgba(110,96,70,0.5)', 1, 32); px(c, x + 4, 0, 'rgba(180,170,140,0.35)', 1, 32); }
    for (let k = 0; k < 8; k++) { c.fillStyle = `rgba(90,74,50,${0.12 + r() * 0.12})`; c.beginPath(); c.ellipse(r() * 32, r() * 32, 2 + r() * 5, 3 + r() * 7, 0, 0, 7); c.fill(); } });
  const tFloor = L.cvs(32, 32, (c) => { const r = L.rng(2); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.6 + (y >> 3) * 2.1) + r() * 8; px(c, x, y, `rgb(${112 + n},${76 + n * 0.7},${48 + n * 0.5})`); } for (let y = 0; y < 32; y += 8) px(c, 0, y, '#3e2816', 32, 1); for (let y = 0; y < 32; y += 8) px(c, ((y / 8) % 2) * 16 + 7, y, '#3e2816', 1, 8); });
  const tCeil = noiseTex(16, 16, [168, 164, 152], 10, 3);
  const tTile = L.cvs(32, 32, (c) => { px(c, 0, 0, '#cfd6d2', 32, 32); for (let i = 0; i < 32; i += 8) { px(c, i, 0, '#8a948e', 1, 32); px(c, 0, i, '#8a948e', 32, 1); } c.fillStyle = 'rgba(90,80,50,0.25)'; for (let k = 0; k < 16; k++) c.fillRect(R() * 32, R() * 32, 1 + R() * 3, 1 + R() * 4); });
  const tCarpet = noiseTex(32, 32, [96, 40, 36], 16, 4, (c) => { for (let y = 0; y < 32; y += 4) px(c, 0, y, 'rgba(60,20,18,0.5)', 32, 1); });
  const tHallW = noiseTex(32, 32, [120, 128, 112], 12, 5, (c) => { px(c, 0, 20, '#5a5040', 32, 1); px(c, 0, 21, '#8a7a60', 32, 2); });
  const tConc = noiseTex(32, 32, [70, 72, 78], 14, 6);
  const tAsph = noiseTex(32, 32, [34, 34, 38], 10, 7, (c, r) => { for (let k = 0; k < 12; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(10,10,12,0.5)', 1 + r() * 4 | 0, 1); });
  const tWood = L.cvs(32, 32, (c) => { const r = L.rng(8); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.8 + Math.sin(y * 0.4) * 2.5) + r() * 7; px(c, x, y, `rgb(${96 + n},${58 + n * 0.6},${32 + n * 0.4})`); } });
  const tFabric = noiseTex(16, 16, [70, 84, 104], 14, 9, (c) => { for (let x = 0; x < 16; x += 3) px(c, x, 0, 'rgba(30,40,60,0.4)', 1, 16); });
  const tCounter = noiseTex(16, 16, [196, 190, 172], 10, 10, (c) => px(c, 0, 0, '#8a8270', 16, 1));
  const tCab = L.cvs(32, 32, (c) => { const r = L.rng(11); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 8; px(c, x, y, `rgb(${168 + n},${150 + n},${116 + n})`); } px(c, 15, 0, '#6a5a40', 1, 32); px(c, 0, 0, '#6a5a40', 32, 1); px(c, 0, 31, '#6a5a40', 32, 1); px(c, 11, 14, '#c8c8c0', 2, 5); px(c, 19, 14, '#c8c8c0', 2, 5); });
  const tSide = noiseTex(32, 32, [118, 118, 112], 16, 15, (c, r) => { for (let y = 0; y < 32; y += 8) px(c, 0, y, '#5a5a56', 32, 1); for (let x = 0; x < 32; x += 8) px(c, x, 0, '#6a6a64', 1, 32); for (let k = 0; k < 10; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(30,30,28,0.4)', 2, 1); });
  const bloodImg = await L.img('tex/blood_drops.png');

  const WIN_LIT = ['#f2c878', '#e8b060', '#f6dca0', '#d8e0f0', '#ffd890'];
  const cityTex = (cols, rows, lit, seed, hole = null) => L.cvs(cols * 8, rows * 8, (c) => {
    const r = L.rng(seed); px(c, 0, 0, '#3a3c44', cols * 8, rows * 8);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * 8, y = j * 8, n = r() * 10; px(c, x, y, `rgb(${58 + n},${60 + n},${68 + n})`, 8, 8); px(c, x, y + 7, '#2a2c32', 8, 1);
      if (hole && hole[0] === i && hole[1] === j) { c.clearRect(x + 1, y + 1, 6, 5); continue; }
      const on = r() < lit; px(c, x + 1, y + 1, on ? WIN_LIT[Math.floor(r() * WIN_LIT.length)] : (r() < 0.5 ? '#141c30' : '#1c2438'), 6, 5);
      if (on && r() < 0.5) px(c, x + 1 + Math.floor(r() * 4), y + 1, 'rgba(60,40,30,0.5)', 2, 5);
      px(c, x + 4, y + 1, 'rgba(20,20,24,0.6)', 1, 5);
    } });

  // ================= mundo exterior =================
  const scene = new THREE.Scene(); const SKY = 0x0c1426; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(0x2a3448, 160, 1500);
  const hemi = new THREE.HemisphereLight(0x8aa0d0, 0x2a2a34, 1.2); scene.add(hemi);
  const setFog = (near, far, col) => { scene.fog.near = near; scene.fog.far = far; scene.fog.color.set(col); };
  // nota 10: el plano del suelo de 5 km era un solo quad con el snap PS1: el redondeo de sus vertices lejanos inclinaba el plano y tapaba el piso del lobby
  // por cuadros. Ahora va subdividido, sin snap y 2 cm mas abajo
  { const gm = new THREE.MeshLambertMaterial({ map: L.rep(tAsph, 600, 600), color: 0x9a9aa0 }); const g0 = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000, 80, 80), gm); g0.rotation.x = -Math.PI / 2; g0.position.set(0, -0.02, 900); scene.add(g0); }
  const TW = 27, TH = 34 * 2.9, TD = 20;
  const facadeT = cityTex(9, 34, 0.3, 3012, [4, 33 - 29]);
  const facade = L.plane(TW, TH, L.basic(facadeT, 0xffffff, { alphaTest: 0.5 }), 0, TH / 2, 0, scene); facade.renderOrder = 1;
  const sideT = cityTex(7, 34, 0.3, 77);
  L.plane(TD, TH, L.basic(sideT), TW / 2, TH / 2, -TD / 2, scene, Math.PI / 2); L.plane(TD, TH, L.basic(sideT), -TW / 2, TH / 2, -TD / 2, scene, -Math.PI / 2);
  L.plane(TW, TD, lam(tConc), 0, TH, -TD / 2, scene, 0, -Math.PI / 2);
  // balcones (bahias 1, 4, 7): losa + baranda; en la bahia 4 solo hasta el piso 28 (el balcon de abajo del 3012)
  { const sl = [], rl = []; for (const bay of [1, 4, 7]) for (let f = 2; f < 34; f++) { if (bay === 4 && f >= 29) continue; const x = -TW / 2 + 3 * (bay + 0.5), y = f * 2.9;
      sl.push([2.5, 0.14, 1.0, x, y + 0.07, 0.5]); rl.push([2.5, 0.05, 0.05, x, y + 1.02, 0.98]); rl.push([0.05, 0.05, 1.0, x - 1.23, y + 1.02, 0.5]); rl.push([0.05, 0.05, 1.0, x + 1.23, y + 1.02, 0.5]);
      for (let k = 0; k < 9; k++) rl.push([0.03, 0.88, 0.03, x - 1.2 + k * 0.3, y + 0.58, 0.97]); for (const s of [-1, 1]) for (let k = 0; k < 3; k++) rl.push([0.03, 0.88, 0.03, x + s * 1.22, y + 0.58, 0.2 + k * 0.3]); }
    mergeBoxes(sl, lam(tConc, 0xa0a0a6), scene); mergeBoxes(rl, lam(null, 0x2a2c30), scene); }
  // balcon de abajo del 3012: planta y silla (detalle para la opcion 2)
  { const bx = 0, by = 28 * 2.9 + 0.14; B(0.45, 0.45, 0.45, lam(null, 0x5a3a24), bx + 0.8, by + 0.225, 0.45, scene); B(0.5, 0.06, 0.5, lam(null, 0x8a6a40), bx - 0.6, by + 0.45, 0.5, scene); B(0.06, 0.45, 0.06, lam(null, 0x3a2a1a), bx - 0.6, by + 0.22, 0.5, scene); L.mesh(new THREE.SphereGeometry(0.32, 7, 5), lam(null, 0x2e6a2a), bx + 0.8, by + 0.7, 0.45, scene); }
  const balL = new THREE.PointLight(0xc8d4ff, 0, 7, 1.2); balL.position.set(0.6, 28 * 2.9 + 2.0, 2.0); scene.add(balL);
  // ciudad (el apagon del ep6: quedan pocas luces de generadores)
  const blocks = [];
  { const r = L.rng(99), tex = [0, 1, 2, 3].map((k) => cityTex(6, 40, 0.22, 300 + k));
    const spots = [];
    for (let gx = -22; gx <= 22; gx++) for (let gz = -3; gz <= 40; gz++) {
      if (Math.abs(gx) > 8 + gz * 0.9) continue;
      const x = gx * 34 + (r() - 0.5) * 8, z = gz * 34 + (r() - 0.5) * 8;
      if (Math.abs(x) < 26 && z > -32 && z < 22) continue;
      if (z > 22 && z < 40 && Math.abs(x) < 60) { spots.push([x, z + 6]); continue; }
      spots.push([x, z]);
    }
    const g = new THREE.Group(); scene.add(g); const mats = [];
    for (const [x, z] of spots) {
      const w = 10 + r() * 14, d = 10 + r() * 14, h = 12 + r() * r() * (z > 400 ? 190 : z > 120 ? 140 : 70);
      const t = L.rep(tex[Math.floor(r() * 4)], w / 18, h / 116); const m = L.basic(t, 0x9a9aa0); mats.push(m);
      B(w, h, d, m, x, h / 2, z, g);
    }
    blocks.push(g);
  }
  L.mesh(new THREE.CircleGeometry(9, 12), L.basic(null, 0xe8ecf4, { fog: false }), -60, 210, 400, scene).lookAt(0, 90, 0);
  // ---------- calle: vereda, cordon, lineas, autos abandonados, farolas (casi todas apagadas), hidrante, bolsas, charcos ----------
  const street = new THREE.Group(); scene.add(street);
  B(80, 0.16, 6, lam(L.rep(tSide, 40, 3)), 0, 0.08, 10, street); B(80, 0.18, 0.2, lam(null, 0x8a8a84), 0, 0.09, 13.05, street);
  B(80, 0.16, 5, lam(L.rep(tSide, 40, 3)), 0, 0.08, 28.5, street); B(80, 0.18, 0.2, lam(null, 0x8a8a84), 0, 0.09, 25.95, street);
  { const ln = []; for (let x = -40; x < 40; x += 4) ln.push([2.0, 0.01, 0.14, x, 0.012, 19.5]); mergeBoxes(ln, L.basic(null, 0xb8a050, PO), street); }
  for (const [x, z, r2] of [[-6, 17, 1.4], [4.5, 21.5, 0.9], [-1, 23.6, 1.1], [9, 16.2, 0.8]]) { const p = L.mesh(new THREE.CircleGeometry(r2, 10), L.basic(null, 0x1a2230, { transparent: true, opacity: 0.6, depthWrite: false, ...PO }), x, 0.03, z, street); p.rotation.x = -Math.PI / 2; p.scale.y = 0.6; p.renderOrder = 2; }
  const loadCar = async (file, col, len) => {
    const m = await prop(file), g = new THREE.Group(); g.add(m); m.rotation.y = Math.PI; m.updateMatrixWorld(true);
    let bb = new THREE.Box3().setFromObject(m); const k = len / (bb.max.z - bb.min.z); m.scale.multiplyScalar(k); m.updateMatrixWorld(true); bb = new THREE.Box3().setFromObject(m); m.position.y = -bb.min.y;
    m.traverse((o) => { if (!o.isMesh) return; const nm = o.material.name || ''; if (/blue/i.test(nm)) o.material = lam(null, col); if (/headlight/i.test(nm)) o.material = lam(null, 0x9a9a90); if (/tail/i.test(nm)) o.material = L.basic(null, 0x6a0c0c); });
    return g; };
  for (const [f, col, len, x, z, ry] of [['car_a', 0x2e4e86, 4.3, -9.5, 15.0, Math.PI / 2], ['car_b', 0x6a2420, 4.0, 6.5, 15.2, Math.PI / 2 + 0.08], ['car_a', 0x8a8a84, 4.3, 14.5, 15.1, Math.PI / 2], ['car_b', 0x2a5a3a, 4.0, -3.0, 22.8, -Math.PI / 2 + 0.3], ['car_a', 0xc8a020, 4.3, 3.5, 23.6, -Math.PI / 2], ['car_b', 0x4a4a52, 4.0, -16, 23.4, -Math.PI / 2], ['car_a', 0x6a2420, 4.3, 22, 17.5, 0.6]]) {
    const g = await loadCar(f, col, len); g.position.set(x, 0, z); g.rotation.y = ry; street.add(g); }
  const lampPost = (x, z, on) => { B(0.14, 6.0, 0.14, lam(null, 0x2a2c30), x, 3.0, z, street); B(1.2, 0.1, 0.12, lam(null, 0x2a2c30), x + 0.55, 6.0, z, street); B(0.5, 0.14, 0.3, on ? L.emissive(L.basic(null, 0xffd890), 0.8) : lam(null, 0x3a3a38), x + 1.05, 5.92, z, street); };
  lampPost(-14, 12.6, false); lampPost(12, 12.6, false); lampPost(-2, 26.4, false); lampPost(24, 26.4, true);
  const farLamp = new THREE.PointLight(0xffd890, 6, 18, 1.3); farLamp.position.set(25, 5.5, 26); scene.add(farLamp);
  { const hyd = new THREE.Group(); hyd.position.set(-4.6, 0.16, 12.4); street.add(hyd); L.mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.6, 8), lam(null, 0xc02818), 0, 0.3, 0, hyd); L.mesh(new THREE.SphereGeometry(0.14, 8, 4, 0, 6.3, 0, 1.6), lam(null, 0xc02818), 0, 0.6, 0, hyd); B(0.4, 0.08, 0.08, lam(null, 0xa02010), 0, 0.42, 0, hyd); }
  for (const [x, z, s] of [[5.6, 12.2, 0.5], [6.1, 12.4, 0.4], [5.9, 11.8, 0.35], [-8.0, 12.3, 0.45]]) L.mesh(new THREE.SphereGeometry(s, 6, 4), lam(null, 0x141416), x, 0.16 + s * 0.6, z, street);
  // ---------- podio del lobby (delante de la fachada): vidrio con puertas rotas, buzones, ascensores OUT OF ORDER, puerta STAIRS ----------
  const lobby = new THREE.Group(); scene.add(lobby);
  const LX0 = -7, LX1 = 7, LZ1 = 7, LH2 = 4.2;
  const tLobFl = L.cvs(32, 32, (c) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) px(c, x * 8, y * 8, (x + y) % 2 ? '#c8c2b0' : '#4a4640', 8, 8); const r = L.rng(31); for (let k = 0; k < 40; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(30,26,20,0.35)', 1 + r() * 3 | 0, 1); });
  const tLobW = noiseTex(32, 32, [150, 138, 112], 12, 32, (c) => { px(c, 0, 26, '#5a4a36', 32, 6); px(c, 0, 25, '#8a7a60', 32, 1); });
  const mLobW = lam(L.rep(tLobW, 4, 1));
  B(LX1 - LX0, 0.06, LZ1, lam(L.rep(tLobFl, 7, 3.5)), 0, 0.17, LZ1 / 2, lobby);
  B(LX1 - LX0 + 0.4, 0.3, LZ1 + 0.4, lam(tConc, 0x7a7a80), 0, LH2 + 0.15, LZ1 / 2, lobby);   // techo/losa
  B(0.2, LH2, LZ1, mLobW, LX0, LH2 / 2, LZ1 / 2, lobby); B(0.2, LH2, LZ1, mLobW, LX1, LH2 / 2, LZ1 / 2, lobby); B(LX1 - LX0, LH2, 0.2, mLobW, 0, LH2 / 2, 0.15, lobby);
  L.plane(LX1 - LX0, LZ1, lam(L.rep(tCeil, 6, 3)), 0, LH2 - 0.01, LZ1 / 2, lobby, 0, Math.PI / 2);
  // frente de vidrio: marcos + vidrio; puerta doble en x [-1.2, 1.2]: una hoja abierta hacia adentro, la otra rota (sin vidrio)
  const mFr = lam(null, 0x22242a), mGl = L.basic(null, 0x6a88a8, { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  for (const x of [-7, -4.6, -2.3, -1.2, 1.2, 2.3, 4.6, 7]) B(0.12, LH2, 0.14, mFr, x, LH2 / 2, LZ1, lobby);
  B(14, 0.14, 0.14, mFr, 0, LH2 - 0.07, LZ1, lobby); B(14, 0.14, 0.14, mFr, 0, 0.3, LZ1, lobby); B(14, 0.1, 0.14, mFr, 0, 2.95, LZ1, lobby);
  for (const [x0, x1] of [[-7, -1.2], [1.2, 7]]) L.plane(x1 - x0, LH2 - 0.4, mGl, (x0 + x1) / 2, LH2 / 2 + 0.1, LZ1, lobby);
  const leafL = new THREE.Group(); leafL.position.set(-1.2, 0, LZ1); lobby.add(leafL); B(1.15, 2.8, 0.05, mFr, 0.58, 1.55, 0, leafL); L.plane(1.0, 2.5, mGl, 0.58, 1.6, 0.01, leafL); leafL.rotation.y = -1.25;
  const leafR = new THREE.Group(); leafR.position.set(1.2, 0, LZ1); lobby.add(leafR); { const fr = lam(null, 0x22242a); B(0.08, 2.8, 0.06, fr, -0.06, 1.55, 0, leafR); B(0.08, 2.8, 0.06, fr, -1.1, 1.55, 0, leafR); B(1.1, 0.08, 0.06, fr, -0.58, 2.92, 0, leafR); B(1.1, 0.08, 0.06, fr, -0.58, 0.2, 0, leafR); } leafR.rotation.y = 0.18;
  { const sh = []; const r = L.rng(5); for (let k = 0; k < 26; k++) sh.push([0.05 + r() * 0.16, 0.012, 0.04 + r() * 0.12, 0.6 + r() * 1.8 - 1.2, 0.2, LZ1 - 1.6 + r() * 2.8, r() * 3]); mergeBoxes(sh, L.basic(null, 0x8ab0d0), lobby); }   // vidrios rotos en el piso
  L.plane(3.0, 0.5, L.basic(L.cvs(64, 12, (c) => { px(c, 0, 0, '#1a1a1e', 64, 12); c.fillStyle = '#c8a850'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MERCY TOWER', 32, 6.5); })), 0, LH2 + 0.15, LZ1 + 0.22, lobby);
  // interior: buzones (pared derecha), ascensores (fondo), puerta STAIRS (fondo, izquierda), banco y maceta
  const tMail = L.cvs(32, 32, (c) => { px(c, 0, 0, '#8a7a4a', 32, 32); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { px(c, x * 8 + 1, y * 8 + 1, '#b8a060', 6, 6); px(c, x * 8 + 2, y * 8 + 4, '#2a2418', 4, 1); } });
  L.plane(2.4, 1.4, lam(tMail), LX1 - 0.11, 1.5, 3.4, lobby, -Math.PI / 2);
  const tElev = L.cvs(32, 48, (c) => { px(c, 0, 0, '#8a9098', 32, 48); px(c, 15, 0, '#3a3e44', 2, 48); const r = L.rng(8); for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 48 | 0, 'rgba(255,255,255,0.15)', 1, 3); });
  const tOOO = L.cvs(40, 16, (c) => { px(c, 0, 0, '#f0e8d0', 40, 16); c.fillStyle = '#b01010'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OUT OF', 20, 5); c.fillText('ORDER', 20, 11); });
  for (const x of [2.0, 4.3]) { B(1.5, 2.6, 0.1, lam(null, 0x5a5e66), x, 1.47, 0.28, lobby); L.plane(1.2, 2.3, lam(tElev), x, 1.35, 0.34, lobby); L.plane(0.42, 0.17, lam(tOOO, 0xffffff, PO), x + 0.1, 1.45, 0.36, lobby, 0, 0); B(0.1, 0.2, 0.04, lam(null, 0x2a2a2a), x + 0.9, 1.3, 0.3, lobby); }
  const SDX = -3.55, SDW = 1.2, SDH = 2.75;   // puerta STAIRS: bisagra en x = SDX, hoja hasta SDX + SDW
  B(0.1, SDH + 0.1, 0.16, mFr, SDX - 0.05, (SDH + 0.1) / 2 + 0.17, 0.3, lobby); B(0.1, SDH + 0.1, 0.16, mFr, SDX + SDW + 0.05, (SDH + 0.1) / 2 + 0.17, 0.3, lobby); B(SDW + 0.2, 0.1, 0.16, mFr, SDX + SDW / 2, SDH + 0.22, 0.3, lobby);
  L.plane(SDW, SDH, L.basic(null, 0x020203), SDX + SDW / 2, SDH / 2 + 0.17, 0.27, lobby);   // detras de la puerta: oscuridad (la escalera)
  const tSD = L.cvs(16, 32, (c) => { px(c, 0, 0, '#6a1e18', 16, 32); px(c, 0, 0, '#8a2a20', 16, 1); px(c, 2, 4, '#c8c8c0', 12, 6); px(c, 3, 5, '#20242c', 10, 4); px(c, 1, 15, '#2a2a2a', 14, 1); });
  const stairLeaf = new THREE.Group(); stairLeaf.position.set(SDX, 0.17, 0.3); lobby.add(stairLeaf); B(SDW, SDH, 0.06, lam(tSD), SDW / 2, SDH / 2, 0, stairLeaf); B(0.5, 0.05, 0.06, lam(null, 0xc8c8c0), SDW - 0.35, 1.05, 0.06, stairLeaf);
  const tStairsS = L.cvs(48, 16, (c) => { px(c, 0, 0, '#e8e2cc', 48, 16); c.fillStyle = '#141414'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STAIRS', 24, 8.5); });
  const tExit = L.cvs(24, 10, (c) => { px(c, 0, 0, '#0a2a10', 24, 10); c.fillStyle = '#40ff60'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.fillText('EXIT', 12, 8); });
  L.plane(0.8, 0.27, lam(tStairsS), SDX + SDW / 2, SDH + 0.55, 0.26, lobby); L.plane(0.5, 0.2, L.emissive(L.basic(tExit), 1), SDX + SDW / 2, SDH + 0.9, 0.26, lobby);
  B(1.8, 0.45, 0.45, lam(tWood), -5.6, 0.4, 3.6, lobby); L.mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 8), lam(null, 0x8a4a2a), 5.8, 0.42, 6.1, lobby); L.mesh(new THREE.SphereGeometry(0.5, 7, 5), lam(null, 0x2e5a2a), 5.8, 1.05, 6.1, lobby);
  const lobLs = [new THREE.PointLight(0xffd8a0, 7, 9, 1.3), new THREE.PointLight(0xffd8a0, 5, 8, 1.3)]; lobLs[0].position.set(0.5, 3.6, 4.5); lobLs[1].position.set(-3.2, 3.6, 2.0); lobLs.forEach((l) => lobby.add(l));
  const lobPanels = [B(1.2, 0.05, 0.5, L.emissive(L.basic(null, 0xfff0d0), 0.8), 0.5, LH2 - 0.04, 4.5, lobby), B(1.2, 0.05, 0.5, L.emissive(L.basic(null, 0xfff0d0), 0.8), -3.2, LH2 - 0.04, 2.0, lobby)];
  const emergL = new THREE.PointLight(0xff3020, 0, 6, 1.4); emergL.position.set(SDX + 0.6, 3.6, 0.8); lobby.add(emergL);
  const lobFlick = (t) => { const f = Math.floor(t * 3), r = L.rng(4400 + f)(); const k = r > 0.85 ? 0.72 : 1; lobLs[0].intensity = 7 * k; lobPanels[0].material.color.setScalar(k > 0.5 ? 1 : 0.4); };

  // ================= el apartamento 3012 (ep6, local: suelo y = 0, fachada z = 0, interior z < 0) =================
  const apt = new THREE.Group(); apt.position.y = FY; scene.add(apt);
  const HH = 2.6, XL = -3.2, XR = 3.2, ZB = -5.0, XB = -5.7;
  const mWall = lam(L.rep(tWallp, 3, 1.3)), mTrim = lam(null, 0x4a3420);
  const wall = (x0, z0, x1, z1, y0 = 0, y1 = HH, m = mWall, g = apt) => { const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.01) return; const w = B(0.1, y1 - y0, len, m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, g); w.rotation.y = Math.atan2(x1 - x0, z1 - z0); if (y0 === 0) { const s = B(0.13, 0.1, len, mTrim, (x0 + x1) / 2, 0.05, (z0 + z1) / 2, g); s.rotation.y = w.rotation.y; } };
  L.plane(XR - XL, -ZB, lam(L.rep(tFloor, 5, 4)), 0, 0.002, ZB / 2, apt, 0, -Math.PI / 2);
  L.plane(XR - XL, -ZB, lam(L.rep(tCeil, 4, 4)), 0, HH, ZB / 2, apt, 0, Math.PI / 2);
  wall(XL, -0.12, -1.0, -0.12); wall(1.0, -0.12, XR, -0.12); wall(-1.0, -0.12, 1.0, -0.12, 0, 0.8); wall(-1.0, -0.12, 1.0, -0.12, 2.2, HH);
  const mFrame = lam(null, 0xd8d8d0);
  for (const x of [-1.0, 1.0]) B(0.06, 1.4, 0.12, mFrame, x, 1.5, -0.08, apt);
  for (const y of [0.8, 2.2]) B(2.06, 0.06, 0.14, mFrame, 0, y, -0.08, apt);
  B(2.1, 0.04, 0.24, mFrame, 0, 0.8, -0.2, apt);
  L.plane(2.0, 1.4, L.basic(null, 0x9ab8e0, { transparent: true, opacity: 0.1, depthWrite: false }), 0, 1.5, -0.04, apt);
  wall(XL, -0.12, XL, -2.1); wall(XL, -3.1, XL, ZB); wall(XL, -2.1, XL, -3.1, 2.1, HH);
  wall(XR, -0.12, XR, ZB);
  wall(XL, ZB, -2.27, ZB); wall(-1.33, ZB, XR, ZB); wall(-2.27, ZB, -1.33, ZB, 2.08, HH);
  const tCurt = noiseTex(16, 32, [150, 120, 90], 12, 12, (c) => { for (let x = 0; x < 16; x += 4) px(c, x, 0, 'rgba(70,50,30,0.5)', 1, 32); });
  for (const s of [-1, 1]) B(0.45, 1.9, 0.05, lam(tCurt), s * 1.25, 1.45, -0.22, apt);
  const mFab = lam(tFabric), mWd = lam(tWood);
  const sofa = new THREE.Group(); apt.add(sofa); sofa.position.set(0.5, 0, -3.9);
  B(2.0, 0.42, 0.85, mFab, 0, 0.21, 0, sofa); B(2.0, 0.5, 0.2, mFab, 0, 0.62, -0.33, sofa); for (const s of [-1, 1]) B(0.2, 0.62, 0.85, mFab, s * 1.0, 0.31, 0, sofa);
  for (const s of [-0.48, 0.48]) B(0.9, 0.12, 0.62, lam(tFabric, 0xb8c0d0), s, 0.48, 0.06, sofa);
  const table = new THREE.Group(); apt.add(table); table.position.set(0.5, 0, -2.6);
  B(1.1, 0.05, 0.6, mWd, 0, 0.42, 0, table); for (const [x, z] of [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]]) B(0.05, 0.4, 0.05, mWd, x, 0.2, z, table);
  L.plane(2.4, 1.7, lam(noiseTex(16, 16, [120, 46, 40], 18, 13, (c) => { px(c, 1, 1, '#c8a060', 14, 1); px(c, 1, 14, '#c8a060', 14, 1); px(c, 1, 1, '#c8a060', 1, 14); px(c, 14, 1, '#c8a060', 1, 14); }), 0xffffff, PO), 0.5, 0.022, -2.9, apt, 0, -Math.PI / 2);
  const shelf = new THREE.Group(); apt.add(shelf); shelf.position.set(-2.95, 0, -1.2); shelf.rotation.y = Math.PI / 2;
  B(1.0, 1.8, 0.35, mWd, 0, 0.9, 0, shelf); for (let i = 0; i < 4; i++) for (let k = 0; k < 7; k++) B(0.06, 0.24 + R() * 0.06, 0.22, lam(null, [0x8a2a20, 0x2a4a7a, 0xc8a050, 0x3a6a3a][(i + k) % 4]), -0.36 + k * 0.11, 0.3 + i * 0.42, 0.05, shelf);
  const lampP = new THREE.Group(); apt.add(lampP); lampP.position.set(2.0, 0, -4.5);
  B(0.04, 1.5, 0.04, lam(null, 0x2a2a2a), 0, 0.75, 0, lampP); const shade = L.mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.3, 8), L.basic(null, 0x5a5448), 0, 1.6, 0, lampP); void shade;
  const mCt = lam(tCounter), mCab = lam(L.rep(tCab, 2, 1));
  B(0.62, 0.86, 2.2, mCab, XR - 0.31, 0.43, -2.0, apt); B(0.66, 0.05, 2.24, mCt, XR - 0.33, 0.885, -2.0, apt);
  B(0.36, 0.7, 2.2, mCab, XR - 0.18, 1.85, -2.0, apt);
  B(0.42, 0.02, 0.5, lam(null, 0x6a6e72), XR - 0.33, 0.9, -1.6, apt);
  { const chrome = lam(null, 0xc8ccd0), tapG = new THREE.Group(); apt.add(tapG); tapG.position.set(XR - 0.08, 0.91, -1.6); B(0.04, 0.26, 0.04, chrome, 0, 0.13, 0, tapG); B(0.24, 0.035, 0.035, chrome, -0.12, 0.26, 0, tapG); }
  const fridge = await prop('fridge'); fridge.position.set(XR - 0.4, 0, -3.65); fridge.rotation.y = -Math.PI / 2; apt.add(fridge);
  // luces: el apagon sigue (ep6); lampara a pilas en la mesa baja + luna por la ventana
  const lantern = await prop('lantern'); lantern.position.set(0.15, 0.445, -2.75); apt.add(lantern);
  const lanternL = new THREE.PointLight(0xffd8a0, 5.5, 6.5, 1.3); lanternL.position.set(0.15, 0.85, -2.75); apt.add(lanternL);
  const lanternGlow = L.mesh(new THREE.SphereGeometry(0.05, 6, 4), L.emissive(L.basic(null, 0xfff0c8), 0.8), 0.15, 0.62, -2.75, apt); void lanternGlow;
  const moonL = new THREE.PointLight(0x7a96d8, 6, 12, 0.8); moonL.position.set(0, 1.9, -0.6); apt.add(moonL);
  const bathL = new THREE.PointLight(0x9ab0e0, 1.6, 5, 1.3); bathL.position.set(-4.5, 2.2, -2.6); apt.add(bathL);
  // ---------- la puerta 3012: marco fijo + hoja con bisagra (x = -2.25) que abre hacia adentro; mirilla, cerrojo, cadena ----------
  const tDoor = L.cvs(32, 64, (c) => { const r = L.rng(14); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 8 + 6 * Math.sin(y * 0.5); px(c, x, y, `rgb(${118 + n},${78 + n * 0.6},${46 + n * 0.4})`); }
    for (const [x, y, w, h] of [[4, 4, 24, 24], [4, 34, 24, 26]]) { px(c, x, y, '#5a3a20', w, 1); px(c, x, y, '#5a3a20', 1, h); px(c, x, y + h - 1, '#c89a68', w, 1); px(c, x + w - 1, y, '#c89a68', 1, h); } });
  const numPlate = (num) => L.cvs(64, 22, (c) => { px(c, 0, 0, '#c8a850', 64, 22); px(c, 2, 2, '#1e180c', 60, 18); c.fillStyle = '#f0dc90'; c.font = 'bold 17px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(num, 32, 12); });
  const mkDoor = (num) => { const g = new THREE.Group(); const md = lam(tDoor); B(0.9, 2.05, 0.05, md, 0.45, 1.025, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), lam(null, 0xd8b860), 0.8, 1.0, 0, g).rotation.x = Math.PI / 2;
    L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), lam(null, 0x101010), 0.45, 1.58, 0, g).rotation.x = Math.PI / 2;
    if (num) L.plane(0.2, 0.075, L.basic(numPlate(num)), 0.45, 1.78, -0.03, g, Math.PI);
    const frame = lam(null, 0x3a2614); B(0.06, 2.1, 0.14, frame, -0.03, 1.05, 0, g); B(0.06, 2.1, 0.14, frame, 0.93, 1.05, 0, g); B(1.02, 0.06, 0.14, frame, 0.45, 2.1, 0, g);
    return g; };
  const d12 = new THREE.Group(); d12.position.set(-2.25, 0, ZB); apt.add(d12);
  { const frame = lam(null, 0x3a2614); B(0.06, 2.1, 0.14, frame, -0.03, 1.05, 0, d12); B(0.06, 2.1, 0.14, frame, 0.93, 1.05, 0, d12); B(1.02, 0.06, 0.14, frame, 0.45, 2.1, 0, d12); }
  const leaf12 = new THREE.Group(); d12.add(leaf12);
  B(0.9, 2.05, 0.05, lam(tDoor), 0.45, 1.025, 0, leaf12);
  L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), lam(null, 0xd8b860), 0.8, 1.0, 0, leaf12).rotation.x = Math.PI / 2;
  L.mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.08, 6), lam(null, 0x101010), 0.45, 1.58, 0, leaf12).rotation.x = Math.PI / 2;
  B(0.08, 0.05, 0.05, lam(null, 0xb8a050), 0.8, 1.18, 0.04, leaf12);
  L.plane(0.2, 0.075, L.basic(numPlate('3012')), 0.45, 1.78, -0.03, leaf12, Math.PI);
  // cadena: riel en el marco (pared, x ~ -1.27) y eslabones hasta la placa de la hoja (x 0.78 de la hoja)
  const mChain = lam(null, 0xd0c070); B(0.14, 0.035, 0.03, mChain, 1.05 - 0.02, 1.42, 0.08, d12);
  B(0.06, 0.05, 0.02, mChain, 0.74, 1.42, 0.035, leaf12);
  const links = []; for (let i = 0; i < 9; i++) links.push(B(0.022, 0.022, 0.035, mChain, 0, 0, 0, apt));
  const chainA = () => leaf12.localToWorld(V(0.74, 1.42, 0.05)), chainB = () => d12.localToWorld(V(1.0, 1.42, 0.09));
  const setChain = (swing) => { apt.updateMatrixWorld(true); const b = apt.worldToLocal(chainB()); let a = apt.worldToLocal(chainA());
    if (leaf12.rotation.y < -0.06) { links.forEach((m, i) => { m.position.copy(b).add(V(0, -0.03 - i * 0.03, 0.01)); m.rotation.set(0, (i % 2) * 1.57, 0); }); return; }
    links.forEach((m, i) => { const u = (i + 0.5) / links.length; m.position.copy(a).lerp(b, u); m.position.y -= 0.07 * Math.sin(Math.PI * u) * (1 - 0.7 * Math.abs(swing)); m.position.z += 0.03 * swing * Math.sin(Math.PI * u); m.rotation.set(0, 0, (i % 2) * 1.57 + swing * 0.6); }); };
  // rendija bajo la puerta: luz del pasillo, sombra de pies y (cuando esta el cazador) luz verde
  const gapCv = document.createElement('canvas'); gapCv.width = 32; gapCv.height = 2; const gapTex = L.canvasTex(gapCv);
  L.plane(0.86, 0.025, L.basic(gapTex), -1.8, 0.0125, ZB + 0.035, apt);
  const drawGap = (on, feet, green = 0) => { const c = gapCv.getContext('2d'); px(c, 0, 0, on ? '#c8b088' : '#2a2418', 32, 2); if (green > 0) px(c, 0, 0, `rgba(90,255,110,${0.7 * green})`, 32, 2); for (const f of feet) px(c, Math.round(f * 32) - 3, 0, '#0a0806', 6, 2); gapTex.needsUpdate = true; };
  const gapGlow = L.plane(1.2, 0.5, addGlow(glowTex(90, 255, 110), 0x5aff6a), -1.8, 0.03, ZB + 0.25, apt, 0, -Math.PI / 2); gapGlow.material.opacity = 0;
  gapGlow.material.transparent = true;
  const planks = []; { const plankG = await prop('plank'); for (const [y, rz] of [[1.35, 0.18], [1.75, -0.16]]) { const p = plankG.clone(); p.position.set(-1.8, y, ZB + 0.06); p.rotation.z = rz; planks.push(p); } }
  // la comoda del ep6 contra la puerta + First Aid Spray encima
  const dresser = await prop('dresser'); apt.add(dresser);
  dresser.updateMatrixWorld(true); const DBB = new THREE.Box3().setFromObject(dresser); const DTOP = DBB.max.y, DDEP = DBB.max.z - DBB.min.z;
  const spray = makeSpray(L); dresser.add(spray); spray.position.set(0.3, DTOP + 0.002, (DBB.min.z + DBB.max.z) / 2 + 0.03); spray.rotation.y = 0.5;
  // hierba verde en la repisa de la ventana
  const herb = new THREE.Group(); herb.position.set(0.68, 0.82, -0.22); apt.add(herb);
  { const tLeaf = L.cvs(16, 16, (c) => { c.fillStyle = '#2e8a2a'; c.beginPath(); c.ellipse(8, 9, 4, 7, 0, 0, 7); c.fill(); px(c, 8, 3, '#1a5a18', 1, 12); px(c, 6, 6, '#5ac04a', 1, 2); px(c, 10, 9, '#5ac04a', 1, 2); });
    const tPot = L.cvs(16, 16, (c) => { px(c, 0, 0, '#b0603a', 16, 16); px(c, 0, 0, '#d07a4a', 16, 3); px(c, 0, 13, '#7a3e22', 16, 3); });
    L.mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.15, 8), lam(tPot), 0, 0.075, 0, herb); L.mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8), lam(null, 0x3a2614), 0, 0.145, 0, herb);
    for (let k = 0; k < 9; k++) { const lf = L.plane(0.09, 0.15, lam(tLeaf, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide }), Math.cos(k * 2.4) * 0.035, 0.2 + (k % 3) * 0.035, Math.sin(k * 2.4) * 0.035, herb, k * 0.9, -0.35); lf.rotation.order = 'YXZ'; } }
  // maquina de escribir verde (sala de guardado) sobre la encimera
  const tw = new THREE.Group(); apt.add(tw); tw.position.set(XR - 0.36, 0.91, -2.75); tw.rotation.y = -Math.PI / 2;
  const mG = lam(L.cvs(16, 16, (cx) => { const r = L.rng(81); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 14 - 7; px(cx, x, y, `rgb(${52 + n},${86 + n},${64 + n})`); } })), mK = lam(null, 0x161616), mKey = lam(null, 0xe8e2d0);
  B(0.42, 0.1, 0.3, mG, 0, 0.05, 0, tw); B(0.42, 0.08, 0.12, mG, 0, 0.13, -0.08, tw);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) { const kk = B(0.022, 0.012, 0.022, mKey, -0.14 + k * 0.031 + (r % 2) * 0.01, 0.105 + r * 0.012, 0.11 - r * 0.03, tw); kk.userData.key = r * 10 + k; }
  { const plat = L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.46, 8), mK, 0, 0.2, -0.1, tw); plat.rotation.z = Math.PI / 2; }
  const pcv = document.createElement('canvas'); pcv.width = 96; pcv.height = 128; const pt = L.canvasTex(pcv); { const cx = pcv.getContext('2d'); cx.fillStyle = '#ece6d6'; cx.fillRect(0, 0, 96, 128); cx.fillStyle = '#c8c0ac'; for (let y = 0; y < 128; y += 9) cx.fillRect(0, y, 96, 1); pt.needsUpdate = true; }
  const paper = L.plane(0.24, 0.32, L.basic(pt), 0, 0.33, -0.1, tw, 0, -0.25);
  // mesa baja: cuaderno, telefono, latas (ep6)
  const nb = await prop('notebook'); nb.position.set(0.62, 0.445, -2.6); apt.add(nb);
  const cans = await prop('cans_stack'); cans.position.set(0.85, 0.445, -2.45); cans.rotation.y = 0.4; cans.scale.setScalar(0.9); apt.add(cans);
  // pasillo alto (3,0 m, el cazador mide 2,6) con la puerta STAIRS al fondo izquierdo
  const hall = new THREE.Group(); apt.add(hall); const HZ = -7.0, HHH = 3.0;
  L.plane(16, 2.0, lam(L.rep(tCarpet, 12, 1.8)), -1, 0.003, (ZB + HZ) / 2, hall, 0, -Math.PI / 2);
  L.plane(16, 2.0, lam(L.rep(tCeil, 8, 1)), -1, HHH, (ZB + HZ) / 2, hall, 0, Math.PI / 2);
  const mHW = lam(L.rep(tHallW, 6, 1.2));
  B(16, HHH, 0.1, mHW, -1, HHH / 2, HZ - 0.05, hall); B(6.5, HHH, 0.1, mHW, -5.55, HHH / 2, ZB - 0.07, hall); B(7.9, HHH, 0.1, mHW, 2.6, HHH / 2, ZB - 0.07, hall); B(1.1, HHH - 2.08, 0.1, mHW, -1.8, (HHH + 2.08) / 2, ZB - 0.07, hall);
  B(0.1, HHH, 2.1, mHW, -9.0, HHH / 2, (ZB + HZ) / 2, hall); B(0.1, HHH, 2.1, mHW, 7.0, HHH / 2, (ZB + HZ) / 2, hall);
  const door3011 = mkDoor('3011'); door3011.position.set(-1.33, 0, HZ + 0.02); door3011.rotation.y = Math.PI; hall.add(door3011);
  const door3010 = mkDoor('3010'); door3010.position.set(-5.4, 0, ZB - 0.08); hall.add(door3010);
  const door3013 = mkDoor('3013'); door3013.position.set(3.4, 0, ZB - 0.08); hall.add(door3013);
  const door3009 = mkDoor('3009'); door3009.position.set(-4.6, 0, HZ + 0.02); door3009.rotation.y = Math.PI; hall.add(door3009);
  // puerta STAIRS en la pared del fondo (x = -8.95), con EXIT verde
  const hStair = new THREE.Group(); hStair.position.set(-8.93, 0, -6.0); hStair.rotation.y = Math.PI / 2; hall.add(hStair);
  B(1.1, 2.6, 0.05, lam(tSD), 0, 1.3, 0, hStair); L.plane(0.6, 0.2, lam(tStairsS), 0, 2.78, 0.03, hStair); L.plane(0.4, 0.16, L.emissive(L.basic(tExit), 1), 0, 2.93, 0.03, hStair);
  const hallL = new THREE.PointLight(0xffe0b0, 2.0, 4.6, 1.6); hallL.position.set(-1.8, 2.7, -5.8); hall.add(hallL);
  const hallL2 = new THREE.PointLight(0xffe0b0, 1.0, 5, 1.5); hallL2.position.set(3.0, 2.7, -5.8); hall.add(hallL2);
  const hallEm = new THREE.PointLight(0x40ff60, 0.9, 3.5, 1.5); hallEm.position.set(-8.5, 2.8, -5.8); hall.add(hallEm);
  for (const x of [-1.8, 3.0, -5.6]) L.mesh(new THREE.BoxGeometry(0.4, 0.05, 0.25), x === -5.6 ? lam(null, 0x3a3a38) : L.emissive(L.basic(null, 0xfff0d0), 0.8), x, HHH - 0.03, -5.8, hall);
  // bano (ep6) con la banera llena (40 gal) y el balde
  const bath = new THREE.Group(); apt.add(bath);
  const mTileW = lam(L.rep(tTile, 4, 3));
  for (const [x0, z0, x1, z1] of [[XB, -1.0, XB, -4.4], [XB, -4.4, XL - 0.06, -4.4], [XB, -1.0, XL - 0.06, -1.0]]) wall(x0, z0, x1, z1, 0, HH, mTileW, bath);
  L.plane(2.5, 3.4, lam(L.rep(tTile, 6, 8), 0xb8c0c8), (XB + XL) / 2, 0.004, -2.7, bath, 0, -Math.PI / 2);
  L.plane(2.5, 3.4, lam(tCeil), (XB + XL) / 2, HH, -2.7, bath, 0, Math.PI / 2);
  const tub = await prop('bathtub'); tub.position.set(XB + 0.4, 0, -2.7); tub.rotation.y = Math.PI / 2; bath.add(tub);
  const bucket = await prop('bucket'); bucket.position.set(-4.55, 0, -1.45); bucket.rotation.y = 0.3; bath.add(bucket);
  B(0.5, 0.15, 0.4, lam(null, 0xeceae2), -4.6, 0.8, -4.18, bath); B(0.6, 0.7, 0.02, L.basic(null, 0x5a6a78), -4.6, 1.55, -4.38, bath);
  { const mWater = L.basic(null, 0x5a90c8, { transparent: true, opacity: 0.78, depthWrite: false }); const tw2 = L.plane(1.18, 0.52, mWater, 0.04, 0.46, 0.01, tub, 0, -Math.PI / 2); void tw2;
    const bw = L.mesh(new THREE.CircleGeometry(0.135, 10), mWater, 0, 0.32, 0, bucket); bw.rotation.x = -Math.PI / 2; }

  // ================= Ava =================
  const ch = L.hero(); apt.add(ch.root); paintScared(ch);
  const AVA = (x, z, yaw) => { ch.root.position.set(x, 0, z); ch.root.rotation.y = yaw; };

  // ================= el vecino del 3011 (ep6: civil sospechoso con capucha) + brazo mordido =================
  const cityG = await L.loadModel('models/city-zombie.glb');
  cityG.scene.traverse((o) => {
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  const shirtT = L.cvs(32, 64, (c) => { const r = L.rng(3011);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 8 - 4; px(c, x, y, `rgb(${34 + n},${40 + n},${54 + n})`); }
    for (let x = 0; x < 32; x += 16) px(c, x + 7, 0, '#22283a', 1, 32);
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 8 - 4; px(c, x, y, `rgb(${42 + n},${42 + n},${46 + n})`); }
    px(c, 0, 52, '#2e2e32', 32, 6); for (let x = 2; x < 32; x += 8) px(c, x, 36, '#bfbfc4', 1, 6); });
  shirtT.wrapS = THREE.RepeatWrapping;
  const skinT = L.rep(L.cvs(16, 16, (c) => { const r = L.rng(33); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 10 - 5; px(c, x, y, `rgb(${222 + n},${164 + n},${126 + n})`); } }), 1, 1);
  const WOUNDS = [[0.055, 1.52, 0.04, 0.05, 1], [0.03, 1.47, 0.08, 0.03, 0.8], [-0.52, 1.43, 0.0, 0.07, 1], [-0.62, 1.42, 0.03, 0.04, 0.9], [-0.4, 1.44, 0.04, 0.03, 0.7],
    [0.07, 1.3, 0.13, 0.055, 0.85], [-0.05, 1.17, 0.13, 0.035, 0.7], [0.1, 1.05, 0.12, 0.03, 0.6], [0.05, 1.64, 0.09, 0.02, 0.9], [-0.05, 1.6, 0.09, 0.015, 0.8]];
  const lamC = (map, col = 0xffffff, extra = {}) => new THREE.MeshLambertMaterial({ map, color: col, ...extra });   // ep16 (Vera): personajes sin wobble
  const nb3011 = L.ps1Clone(cityG.scene, { wobble: false }); const nbMats = []; const skinM = [];
  nb3011.traverse((o) => { if (!o.isMesh) return; const n = o.material.name || '';
    if (n.includes('Outfit')) { o.visible = false; o.userData.hide = true; return; }   // nota 5: la ropa rota del zombi fuera; la ropa va pintada sobre el cuerpo
    if (n.includes('Body')) { const g = o.geometry, P = g.attributes.position, col = new Float32Array(P.count * 3), r = L.rng(41);
      for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), nz = (r() - 0.5) * 0.04; let c;
        if (y > 1.5 || Math.abs(x) > 0.7) c = [0.86, 0.64, 0.5];                 // cabeza, cuello y manos: piel
        else if (y > 0.93) c = y < 1.06 ? [0.15, 0.15, 0.17] : [0.2, 0.21, 0.23];   // sudadera gris carbon (bolsillo canguro mas oscuro), manga larga
        else if (y > 0.09) c = [0.13, 0.16, 0.24];                                 // vaqueros oscuros
        else c = [0.14, 0.1, 0.08];                                                // zapatillas
        for (const [bx, by, bz, br, bk] of WOUNDS) { const d = Math.hypot(x - bx, y - by, (P.getZ(i) - bz) * 0.7); if (d < br) { const k = (1 - d / br) ** 0.6 * bk; c = c.map((v, j) => L.lerp(v, [0.36, 0.03, 0.03][j], k)); } }   // nota 11: heridas (cuello, antebrazo, mejilla) y manchas de sangre
        col.set([c[0] + nz, c[1] + nz, c[2] + nz].map((v) => Math.max(0, v) ** 2.2), i * 3); }   // sRGB -> lineal
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); o.material = lamC(null, 0xffffff, { vertexColors: true }); skinM.push(o.material); }
    else o.material = lamC(null, 0x2a1e18);
    nbMats.push(o.material); });
  const nbW = new THREE.Group(); nbW.add(nb3011); hall.add(nbW);
  { nb3011.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(nb3011), k = 1.82 / (bb.max.y - bb.min.y); nb3011.scale.multiplyScalar(k); nb3011.position.y = -bb.min.y * k; }
  const nbMix = new THREE.AnimationMixer(nb3011); const clipN = (n) => { const a = nbMix.clipAction(THREE.AnimationClip.findByName(cityG.animations, n)); a.play(); a.setEffectiveWeight(0); return a; };
  const nbIdle = clipN('Zombie_Idle2'), nbAtk = clipN('Zombie_Attack');
  let nbHip = null; nb3011.traverse((o) => { if (!nbHip && o.isSkinnedMesh) nbHip = o.skeleton.bones[0]; }); const nbHip0 = nbHip.position.clone();
  const nbBone = (re) => { let b = null; nb3011.traverse((o) => { if (!b && re.test(o.name)) b = o; }); return b; };
  const nbHead = nbBone(/Head$/), nbTop = nbBone(/HeadTop_End$/), nbHandR = nbBone(/RightHand$/), nbFore = nbBone(/RightForeArm$/);
  // nota 11: orientacion de la gorra desde el hueso de la cabeza (el clip de ataque gira el cuerpo): adelante/arriba del bind pose en el espacio del hueso
  nbW.updateMatrixWorld(true); const qH0 = nbHead.getWorldQuaternion(new THREE.Quaternion()).invert(), qR0 = nbW.getWorldQuaternion(new THREE.Quaternion());
  const HFWD = V(0, 0, 1).applyQuaternion(qR0).applyQuaternion(qH0), HUP = V(0, 1, 0).applyQuaternion(qR0).applyQuaternion(qH0);
  // nota 5: gorra de lona con visera (no casco) + pelo corto en la nuca; la visera deja los ojos en sombra (civil ambiguo)
  // nota 11: gorra de 6 paneles con costuras, boton arriba, visera curva (no casco); pelo corto en la nuca
  const tCap = L.cvs(48, 16, (c) => { const r = L.rng(77); for (let y = 0; y < 16; y++) for (let x = 0; x < 48; x++) { const n = r() * 12 - 6; px(c, x, y, `rgb(${58 + n},${64 + n},${46 + n})`); }
    for (let x = 0; x < 48; x += 8) { px(c, x, 0, '#2a2e1e', 1, 16); px(c, x + 1, 0, 'rgba(120,128,96,0.6)', 1, 16); } px(c, 0, 14, '#2a2e1e', 48, 2); });
  const mHood = lamC(L.nearest(tCap)), mBrim = lamC(null, 0x3e4430, { side: THREE.DoubleSide }), hood = new THREE.Group();
  L.mesh(new THREE.SphereGeometry(0.108, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), mHood, 0, 0, 0, hood).scale.set(1, 0.92, 1.1);
  L.mesh(new THREE.SphereGeometry(0.014, 6, 4), lamC(null, 0x3a3e2a), 0, 0.098, 0, hood);   // boton
  { const g = new THREE.CircleGeometry(0.105, 12, 0, Math.PI); g.rotateX(-Math.PI / 2); g.scale(1, 1, -0.95); const P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); P.setY(i, -2.2 * x * x - 0.25 * Math.max(0, z)); } g.computeVertexNormals();
    const brim = new THREE.Mesh(g, mBrim); brim.position.set(0, 0.006, 0.08); hood.add(brim); }   // visera curva hacia abajo en los lados
  L.mesh(new THREE.SphereGeometry(0.1, 10, 4, Math.PI * 0.6, Math.PI * 0.8, Math.PI * 0.5, Math.PI * 0.2), lamC(null, 0x3a2a1e, { side: THREE.DoubleSide }), 0, 0.0, -0.005, hood).scale.set(1.02, 1, 1.05);   // pelo corto en la nuca, pegado a la cabeza
  const tShade = L.cvs(8, 16, (c) => { const g = c.createLinearGradient(0, 0, 0, 16); g.addColorStop(0, 'rgba(0,0,0,0.95)'); g.addColorStop(0.6, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 8, 16); });
  // (la placa de sombra sobre los ojos se veia como un bloque negro: fuera; la visera ya da sombra)
  const eyesW = { visible: false };   // nota 6: sin esferas de ojos (sobresalian); la revelacion = piel palida
  // venda empapada sobre la mordida del antebrazo (textura real de sangre sobre gasa crema)
  const tBand = L.cvs(64, 32, (c) => { px(c, 0, 0, '#d8d2c0', 64, 32); for (let y = 0; y < 32; y += 4) px(c, 0, y, '#bcb6a2', 64, 1); c.globalAlpha = 0.95; c.drawImage(bloodImg, 0, 0, bloodImg.width, bloodImg.height, 6, 2, 52, 28); c.globalAlpha = 1;
    c.fillStyle = 'rgba(90,6,6,0.85)'; for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(20 + k * 4, 12 + Math.sin(k) * 2, 1.4, 2.2, 0, 0, 7); c.fill(); } for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(22 + k * 4, 21 + Math.cos(k) * 2, 1.3, 2, 0, 0, 7); c.fill(); } });
  const bandage = L.mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.2, 8, 1, true), lamC(tBand, 0xffffff, { side: THREE.DoubleSide }), 0, 0, 0, null);
  hall.add(hood); hall.add(bandage);
  nbMats.push(mHood, bandage.material); nbMats.forEach((m) => { m.userData.base = m.color.clone(); });
  const poseNb = ({ t = 0, vis = 1, walk = 0, atk = -1, eyes = false } = {}) => {
    nbIdle.setEffectiveWeight(atk >= 0 ? 0 : 1); nbAtk.setEffectiveWeight(atk >= 0 ? 1 : 0);
    nbIdle.time = walk ? (t * 0.9) % nbIdle.getClip().duration : 0.4; if (atk >= 0) nbAtk.time = Math.min(nbAtk.getClip().duration - 0.01, atk);
    nbMix.update(0); nbHip.position.x = nbHip0.x; nbHip.position.z = nbHip0.z;
    nbW.updateMatrixWorld(true); hall.updateMatrixWorld(true);
    if (nbHead && nbTop) { const a = nbHead.getWorldPosition(V()), b = nbTop.getWorldPosition(V()), up = b.clone().sub(a).normalize(); const hp = hall.worldToLocal(b.clone().addScaledVector(up, -0.075)); hood.position.copy(hp);
      const qh = nbHead.getWorldQuaternion(new THREE.Quaternion()), f = HFWD.clone().applyQuaternion(qh), u2 = HUP.clone().applyQuaternion(qh).normalize(); f.addScaledVector(u2, -f.dot(u2)).normalize();
      const xA = V().crossVectors(u2, f).normalize(); hood.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, u2, f)); void up; }
    if (nbFore && nbHandR) { const a = hall.worldToLocal(nbFore.getWorldPosition(V())), b = hall.worldToLocal(nbHandR.getWorldPosition(V())); bandage.position.copy(a).lerp(b, 0.62); const d = b.clone().sub(a).normalize(); bandage.quaternion.setFromUnitVectors(V(0, 1, 0), d); }
    nbW.visible = hood.visible = bandage.visible = true;
    nbMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(vis)); if (eyes) skinM.forEach((m) => m.color.setRGB(0.8 * vis, 0.9 * vis, 0.84 * vis)); };
  const nbOff = () => { nbW.visible = hood.visible = bandage.visible = false; };

  // ================= el cazador (makeStalker del largo 3 / ep15) =================
  const SG = await L.loadModel('models/stalker_ps1.glb'); const CRS = -1;
  const ST = (() => {
    const root = L.ps1Clone(SG.scene, { wobble: false }); const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = 2.6 / (bb.max.y - bb.min.y); root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const bn = {}; root.traverse((o) => { if (o.isBone) bn[o.name] = o; }); const q0 = {}; for (const [n, b] of Object.entries(bn)) q0[n] = b.quaternion.clone(); const hp0 = bn.hips ? bn.hips.position.clone() : null;
    // nota 12: la luz verde iluminaba medio torso (PointLight de 1,8 m + halo de 0,5 m en el centro del pecho). Ahora solo el dispositivo hexagonal
    // (lado derecho del pecho visto de frente): luz puntual tenue de 0,3 m y un brillo chico que mira a camara
    root.updateMatrixWorld(true); const DEV = V(Number(L.QS.get('gx') ?? 0.2), Number(L.QS.get('gy') ?? 1.97), Number(L.QS.get('gz') ?? 0.38));
    const devL = bn.chest ? bn.chest.worldToLocal(DEV.clone()) : DEV.clone();
    const boxL = new THREE.PointLight(0x5aff6a, 0.35, 0.3, 2); if (bn.chest) { bn.chest.add(boxL); boxL.position.copy(devL); }
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(90, 255, 110), color: 0x6aff7a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); if (bn.chest) { bn.chest.add(glow); glow.position.copy(devL); glow.scale.setScalar(0.11 / root.scale.x); }
    function pose({ ph = 0, w = 0, tilt = 0, grip = 0, duck = 0, pitch = 0, yawHead = 0, t = 0, crouch = 0, reach = 0, roll = 0 } = {}) {
      for (const [n, b] of Object.entries(bn)) b.quaternion.copy(q0[n]); if (hp0) bn.hips.position.copy(hp0);
      const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
      const Rr = (n, ax, a) => { const b = bn[n]; if (b) b.rotateOnAxis(ax, a); }, X = V(1, 0, 0), Y = V(0, 1, 0), Z = V(0, 0, 1);
      Rr('thighL', X, -0.42 * s * w); Rr('thighR', X, 0.42 * s * w); Rr('shinL', X, 0.5 * Math.max(0, -c) * w); Rr('shinR', X, 0.5 * Math.max(0, c) * w);
      if (hp0) bn.hips.position.y = hp0.y - (0.035 * Math.abs(s) * w + 0.62 * crouch) / root.scale.x;
      Rr('thighL', X, CRS * 1.25 * crouch); Rr('thighR', X, CRS * 1.25 * crouch); Rr('shinL', X, -CRS * 1.9 * crouch); Rr('shinR', X, -CRS * 1.9 * crouch); Rr('spine', X, 0.45 * crouch); Rr('upperarmL', X, -CRS * 1.1 * reach); Rr('upperarmR', X, -CRS * 1.1 * reach);
      Rr('spine', Z, 0.05 * s * w); Rr('chest', X, 0.18 * duck + 0.04); Rr('spine', X, 0.35 * duck); Rr('chest', Y, -0.06 * s * w);
      Rr('upperarmL', X, 0.16 * s * w); Rr('upperarmR', X, -0.16 * s * w); Rr('forearmL', X, -0.25); Rr('forearmR', X, -0.25);
      if (roll) { Rr('chest', Z, roll * 0.16 * s); Rr('spine', Y, roll * 0.1 * s); Rr('upperarmL', Z, -roll * 0.1 * Math.max(0, s)); Rr('upperarmR', Z, roll * 0.1 * Math.max(0, -s)); Rr('hips', Z, -roll * 0.06 * s); if (hp0) bn.hips.position.y -= roll * 0.03 * Math.abs(c) / root.scale.x; }
      Rr('neck', X, -0.2 * duck - pitch * 0.4); Rr('head', Z, tilt); Rr('head', X, -pitch * 0.6); Rr('head', Y, yawHead);
      for (const sd of ['L', 'R']) { const sg = sd === 'L' ? -1 : 1; Rr('fingers' + sd, Z, sg * 1.5 * grip); Rr('fingers' + sd, X, 0.6 * grip); Rr('thumb' + sd, Z, -sg * 0.9 * grip); Rr('hand' + sd, Z, sg * 0.35 * grip); }
      boxL.intensity = 0.22 + 0.13 * (Math.floor(t * 2.5) % 2); glow.material.opacity = 0.35 + 0.15 * (Math.floor(t * 2.5) % 2);
    }
    return { wrap, root, bn, pose, boxL, glow };
  })();
  const gMats = []; ST.root.traverse((o) => { if (o.isMesh && o !== ST.glow) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.userData.base = m.color.clone(); gMats.push(m); }); });
  let gClipCur = null; const gClip = (pl) => { if (pl === gClipCur) return; gClipCur = pl; gMats.forEach((m) => { m.clippingPlanes = pl ? [pl] : null; m.needsUpdate = true; }); };
  const faceLs = new Map(); const faceL = (sc) => { if (!faceLs.has(sc)) { const l = new THREE.PointLight(0xdfe6ff, 0, 2.4, 1.4); sc.add(l); faceLs.set(sc, l); } return faceLs.get(sc); };
  const STRIDE = 2.0;
  /** el cazador en una escena: pies en (x, y, z) del mundo, yaw (0 = mira a +z); o = pose + {face, clip, dark (0..1 lo oscuro)} */
  const stalk = (sc, x, z, yaw, o = {}, y = 0) => { if (ST.wrap.parent !== sc) sc.add(ST.wrap); ST.wrap.visible = true; ST.wrap.position.set(x, y, z); ST.wrap.rotation.set(0, yaw, 0); ST.pose(o); ST.root.updateMatrixWorld(true); gClip(o.clip || null);
    const lit = 1 - (o.dark || 0); gMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(lit));
    const h = ST.bn.head.getWorldPosition(V()); const fl = faceL(sc); fl.intensity = o.face || 0; fl.position.copy(h).add(V(Math.sin(yaw), -0.05, Math.cos(yaw)).multiplyScalar(0.6)); return h; };
  const stOff = () => { ST.wrap.visible = false; for (const l of faceLs.values()) l.intensity = 0; };
  faceL(scene);

  // ================= hueco de escalera (escena aparte): pisos 18..31, dos tramos por piso alrededor de un pozo; numeros pintados =================
  const sS = new THREE.Scene(); sS.background = new THREE.Color(0x020203); sS.fog = new THREE.Fog(0x050608, 6, 26);
  const hemS = new THREE.HemisphereLight(0x8890a8, 0x2a2420, 0.55); sS.add(hemS); faceL(sS);
  const F0 = 18, NF = 14, FH = 2.9, WX = 1.8, WZ = 2.7, FLW = 1.2, SX0 = 0.5;   // tramo A: x [0.5, 1.7] sube de z 1.5 a -1.1; tramo B: x [-1.7, -0.5] sube de z -1.1 a 1.5
  const yF = (f) => (f - F0) * FH;
  const tStep = noiseTex(16, 16, [96, 96, 98], 14, 70, (c) => px(c, 0, 0, '#c8a820', 16, 2));
  const tShaft = noiseTex(32, 32, [92, 96, 92], 14, 71, (c, r) => { px(c, 0, 20, '#3a5a48', 32, 12); for (let k = 0; k < 14; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(20,20,18,0.4)', 1, 2 + r() * 4 | 0); });
  { const st = [], ld = [], rl = [], pst = [];
    for (let f = F0; f < F0 + NF; f++) { const y0 = yF(f);
      ld.push([2 * WX, 0.18, 1.2, 0, y0 - 0.09, 2.1]); ld.push([2 * WX, 0.18, 1.6, 0, y0 + FH / 2 - 0.09, -1.9]);
      for (let k = 0; k < 9; k++) { const h = (k + 1) * FH / 18; st.push([FLW, 0.17, 0.3, SX0 + FLW / 2, y0 + h - 0.085, 1.5 - (k + 0.5) * (2.6 / 9)]); st.push([FLW, 0.17, 0.3, -SX0 - FLW / 2, y0 + FH / 2 + h - 0.085, -1.1 + (k + 0.5) * (2.6 / 9)]); }
      st.push([FLW, 0.12, 2.9, SX0 + FLW / 2, y0 + FH / 4 - 0.25, 0.2, 0, Math.atan2(FH / 2, 2.6)]); st.push([FLW, 0.12, 2.9, -SX0 - FLW / 2, y0 + FH * 0.75 - 0.25, 0.2, 0, -Math.atan2(FH / 2, 2.6)]);
      const ang = Math.atan2(FH / 2, 2.6), len = Math.hypot(FH / 2, 2.6);
      rl.push([0.05, 0.05, len, SX0, y0 + FH / 4 + 0.95, 0.2, 0, ang]); rl.push([0.05, 0.05, len, -SX0, y0 + FH * 0.75 + 0.95, 0.2, 0, -ang]);
      for (let k = 0; k < 4; k++) { const u = k / 3; pst.push([0.04, 0.95, 0.04, SX0, y0 + u * FH / 2 + 0.47, 1.5 - u * 2.6]); pst.push([0.04, 0.95, 0.04, -SX0, y0 + FH / 2 + u * FH / 2 + 0.47, -1.1 + u * 2.6]); }
      rl.push([2 * SX0, 0.05, 0.05, 0, y0 + FH / 2 + 0.95, -1.1]); rl.push([2 * SX0, 0.05, 0.05, 0, y0 + 0.95, 1.5]); }
    mergeBoxes(st, lam(tStep, 0xb0b0b4), sS); mergeBoxes(ld, lam(L.rep(tStep, 2, 1), 0x9a9aa0), sS); mergeBoxes(rl, lam(null, 0xb8a020), sS); mergeBoxes(pst, lam(null, 0x8a7a20), sS); }
  const H0 = yF(F0) - 1, H1 = yF(F0 + NF) + 1, mShaft = lam(L.rep(tShaft, 2, NF));
  B(0.1, H1 - H0, 2 * WZ, mShaft, -WX - 0.05, (H0 + H1) / 2, 0, sS); B(0.1, H1 - H0, 2 * WZ, mShaft, WX + 0.05, (H0 + H1) / 2, 0, sS); B(2 * WX, H1 - H0, 0.1, mShaft, 0, (H0 + H1) / 2, WZ + 0.05, sS); B(2 * WX, H1 - H0, 0.1, mShaft, 0, (H0 + H1) / 2, -WZ - 0.05, sS);
  const sLamps = [];
  for (let f = F0; f < F0 + NF; f++) { const y0 = yF(f);
    L.plane(0.9, 0.55, lam(L.cvs(32, 20, (c) => { px(c, 0, 0, '#d8d0b0', 32, 20); c.fillStyle = '#1a1a18'; c.font = 'bold 15px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(f + 1), 16, 11); }), 0xffffff, PO), -1.0, y0 + 1.75, WZ - 0.01, sS, Math.PI);
    B(1.0, 2.1, 0.05, lam(tSD), 0.9, y0 + 1.05, WZ - 0.03, sS);
    const on = (f + 1) % 2 === 0 || f + 1 === 27;
    L.mesh(new THREE.BoxGeometry(0.25, 0.12, 0.08), on ? L.emissive(L.basic(null, 0xfff0c8), 0.8) : lam(null, 0x3a3a38), 1.5, y0 + 2.4, WZ - 0.05, sS);
    if (on) { const l = new THREE.PointLight(0xffe8c0, 2.6, 5.5, 1.5); l.position.set(1.2, y0 + 2.2, WZ - 0.4); sS.add(l); sLamps.push(l); }
  }
  // anillos de sonido en el pozo (aditivos): cada paso del cazador lanza uno que sube piso a piso
  const tRing = L.cvs(32, 32, (c) => { c.strokeStyle = 'rgba(160,230,255,1)'; c.lineWidth = 3; c.strokeRect(3, 3, 26, 26); c.strokeStyle = 'rgba(160,230,255,0.35)'; c.lineWidth = 6; c.strokeRect(3, 3, 26, 26); });
  const shaftFill = new THREE.PointLight(0xc8d0e0, 0, 6, 1.4); sS.add(shaftFill);
  const rings = []; for (let i = 0; i < 14; i++) { const m = L.plane(1, 1, L.basic(tRing, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide }), 0, 0, 0, sS, 0, -Math.PI / 2); m.visible = false; rings.push(m); }
  const footprints = []; { const tFp = L.cvs(16, 32, (c) => { c.fillStyle = 'rgba(10,12,14,0.7)'; c.beginPath(); c.ellipse(8, 20, 5, 10, 0, 0, 7); c.fill(); for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(3 + k * 2.6, 6 - Math.abs(k - 1.5), 1.6, 0, 7); c.fill(); } });
    for (let i = 0; i < 6; i++) { const m = L.plane(0.22, 0.42, L.basic(tFp, 0xffffff, { transparent: true, depthWrite: false, ...PO }), 0, 0, 0, sS, 0, -Math.PI / 2); m.renderOrder = 3; m.visible = false; footprints.push(m); } }

  // ================= telefono POV (ep6) =================
  const ph1 = await prop('phone'); scene.add(ph1); ph1.visible = false;
  let ph1Rect = null;
  const placePhone = (c, k) => {
    ph1.visible = k > 0; if (!ph1.visible) { ph1Rect = null; return; }
    const fwd = V(); c.getWorldDirection(fwd); const right = V().crossVectors(fwd, V(0, 1, 0)).normalize(), upv = V().crossVectors(right, fwd).normalize();
    const pos = c.position.clone().add(fwd.clone().multiplyScalar(0.34)).add(upv.clone().multiplyScalar(0.02 - 0.3 * (1 - k)));
    ph1.position.copy(pos).add(upv.clone().multiplyScalar(-0.075)); ph1.quaternion.copy(c.quaternion); ph1.updateMatrixWorld(true);
    const corners = [V(-0.034, 0.003, 0.005), V(0.034, 0.147, 0.005)].map((v) => ph1.localToWorld(v.clone()));
    const a = L.toScreen(c, corners[0].x, corners[0].y, corners[0].z), b = L.toScreen(c, corners[1].x, corners[1].y, corners[1].z);
    ph1Rect = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])];
  };

  // ================= estado =================
  const state = ({ hero = true, nb = false, dresserX = -1.0, doorA = 0, hallLit = 0.6, lantern: ln = 1, gapGreen = 0, feet = [] } = {}) => {
    stOff(); gClip(null); nbOff(); if (nb) nbW.visible = true;
    ch.root.visible = hero; lanternL.intensity = 5.5 * ln; hallL.intensity = 2.0 * hallLit; hallL2.intensity = 1.0 * hallLit;
    dresser.position.set(dresserX, 0, ZB + 0.02 + DDEP / 2); dresser.rotation.y = 0; notePaper.visible = false; stairLeaf.rotation.y = 0; footprints.forEach((m) => { m.visible = false; }); balL.intensity = 0;
    leaf12.rotation.y = -doorA; setChain(0); drawGap(true, feet, gapGreen); gapGlow.material.opacity = 0.55 * gapGreen; ph1.visible = false; ph1Rect = null;
    setFog(160, 1500, 0x101a30); hemi.intensity = 1.1;
  };
  const out = {};
  const RED = '#ff5a4a', WHITE = '#f0f0f0', YEL = '#ffd23f';
  const plate = (c, x, y, txt, col, k = 1) => {
    const w = Math.round((textWidth(txt, 2) + 18) * k), h = Math.round(26 * k), x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
    c.fillStyle = 'rgba(4,8,18,0.88)'; c.fillRect(x0, y0, w, h); px(c, x0, y0, col, w, 2); px(c, x0, y0 + h - 2, col, w, 2); px(c, x0, y0, col, 2, h); px(c, x0 + w - 2, y0, col, 2, h);
    bitText(c, txt, x, y, 2, col, { outline: '#000000' });
  };
  const POPK = (dt) => dt < 0 ? 0 : dt < 0.07 ? 0.7 : dt < 0.14 ? 1.08 : 1;
  const pin = (o, txt, col, t0 = -1, t = 0) => plate(o.tctx, LW / 2 + 52, 26, txt, col, t0 < 0 ? 1 : POPK(t - t0));
  const dtag = (o, camera, p3, txt, col, lx, ly, t, tw) => { if (t < tw - 0.05) return; const c = o.tctx, [x, y] = L.toScreen(camera, p3.x, p3.y, p3.z);
    const wd = textWidth(txt, 1) + 10, k = Math.min(1, (t - tw + 0.05) / 0.15), n = Math.max(1, Math.round(Math.hypot(x - lx, y - ly)));
    for (let i = 0; i <= n * k; i++) { const u = i / n; px(c, Math.round(lx + (x - lx) * u), Math.round(ly + (y - ly) * u), col, 1, 1); }
    px(c, x - 2, y - 2, col, 4, 4); c.fillStyle = 'rgba(4,8,18,0.9)'; c.fillRect(lx - wd / 2, ly - 8, wd, 16); c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(Math.round(lx - wd / 2) + 0.5, ly - 7.5, Math.round(wd) - 1, 15);
    bitText(c, txt, lx, ly, 1, col, { outline: null }); };
  const dialog = (o, who, s, n) => { const cx = o.tctx, x = 20, y = 456, w = 320, h = 54;
    cx.fillStyle = 'rgba(6,8,16,0.9)'; cx.fillRect(x, y, w, h); cx.strokeStyle = '#8a90a8'; cx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    left(cx, who, x + 8, y - 8, 1, '#ff7b2e'); left(cx, s.slice(0, n), x + 10, y + 27, 1, '#e8e8f0'); };
  const sh = (id, fov, upd, ov, sc = scene, extra = {}) => { const c = cam(fov); out[id] = { scene: sc, camera: c, update(lt, t) { upd(lt, t, c); }, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); if (ov) ov(lt, o, c, T[id] + lt); }, ...extra }; return out[id]; };
  const idle = (sp = 0.5) => [L.seg('idle', -99, { loop: true, speed: sp })];

  // ================= 01 APERTURA (nota 1 del usuario: sin la caminata por la calle): la grua del ep6 arranca abajo en la fachada y sube a la ventana del 3012 =================
  sh('01_crane', 55, (lt, t, c) => { state({}); lobFlick(t); AVA(0, -0.75, 0); ch.pose(lt, idle(0.5), [[-99, 'half', 'neutral']]);
      const D = T['01b_window'], k = 0.85, u = lt + 0.12;
      const cp = cr([[0, 1.6, 2.6, 24], [0.9 * k, 2.2, 22, 25], [1.7 * k, 1.0, 55, 14], [2.6 * k, 0.3, FY + 1.5, 4.0], [D + 2, 0.1, FY + 1.5, 1.5]], u);
      const tg = cr([[0, 0.2, 4.5, 0], [0.9 * k, 0, 44, 0], [1.7 * k, 0, FY - 8, 0], [2.6 * k, 0, FY + 1.35, -0.6], [D + 2, 0, FY + 1.36, -0.75]], u);
      const kf = L.clamp01((cp.y - 2) / 50); setFog(L.lerp(3.5, 160, kf * kf), L.lerp(34, 1500, kf), kf < 0.5 ? 0x252d3c : 0x101a30); hemi.intensity = L.lerp(0.55, 1.1, kf);
      look(c, cp, tg); if (u > 2.6 * k) ch.lookAt(c, ease(2.6 * k, 2.6 * k + 0.4, u), 30); });
  // 01b dentro del 3012: sobre el hombro de Ava en la ventana, la calle 30 pisos abajo en la niebla (el resplandor del lobby); en "tonight" mira a camara (HUD de golpe)
  sh('01b_window', 48, (lt, t, c) => { state({}); lobFlick(t); AVA(0.05, -0.62, 0.12);
      ch.pose(lt, idle(0.5), [[-99, 'half', mouthAt(t, 'neutral')], [W.tonight - T['01b_window'] - 0.2, 'scared', mouthAt(t, 'frown')]]);
      lk(c, [-0.55 + 0.04 * lt, 1.72, -1.75 + 0.06 * lt], [0.55, 0.2, 2.6]); const kl = ease(W.tonight - 0.3, W.tonight + 0.3, t); if (kl > 0) ch.lookAt(c, 0.9 * kl, 40); });
  // 01c "something big just walked into the building": dentro del lobby, el cazador camina hasta la puerta STAIRS y la empuja
  const gLob = (t) => (t - T['01c_inlobby'] + 0.1) / (T['02_knock'] - 0.5 - T['01c_inlobby'] + 0.1);
  const LOB0 = V(-2.35, 0.2, 2.55), LOB1 = V(SDX + 0.55, 0.2, 1.05);
  sh('01c_inlobby', 46, (lt, t, c) => { state({ hero: false }); setFog(6, 60, 0x252d3c); hemi.intensity = 0.55; lobFlick(t); emergL.intensity = 2.5 * (Math.floor(t * 2) % 2);
      const u = L.clamp01(gLob(t)), p = LOB0.clone().lerp(LOB1, u), yaw = Math.atan2(LOB1.x - LOB0.x, LOB1.z - LOB0.z);   // nota 2: lento (0,7 m/s), pasos de 1,6 m atados a la distancia
      const push = ease(T['02_knock'] - 0.75, T['02_knock'] - 0.2, t); stairLeaf.rotation.y = 1.2 * push;
      stalk(scene, p.x, p.z, yaw, { ph: u * LOB0.distanceTo(LOB1) / 1.6, w: 0.8 * (1 - 0.7 * push), roll: 1 - push, grip: 0.55 + 0.45 * Math.sin(t * 2.6), reach: 0.35 * push, duck: 0.28 + 0.1 * push, pitch: -0.12, t, face: 1.6 }, 0.2);
      look(c, V(2.2, 1.0, 3.6 - 0.1 * lt), V(-2.6, 1.75, 1.6)); },
    (lt, o, c, t) => { dtag(o, c, V(SDX + SDW / 2, SDH + 0.6, 0.3), 'STAIRS', YEL, 120, 170, t, W.building - 0.2); });

  // ================= rama 1 OPEN =================
  // 02 "Last time, someone knocked on 3012": la puerta barricada desde adentro; tres golpes (solo se mueve la hoja); Ava mira la puerta
  const knockA = (t, t0) => { let a = 0; for (const k of [0, 0.28, 0.56]) { const u = t - t0 - k; if (u > 0 && u < 0.25) a += 0.012 * Math.sin(u / 0.25 * Math.PI); } return a; };
  sh('02_knock', 46, (lt, t, c) => { state({}); AVA(-0.7, -3.35, Math.PI - 0.35); leaf12.rotation.y = knockA(t, W.knocked - 0.05); setChain(leaf12.rotation.y * 30);
      ch.pose(lt, idle(0.5), [[-99, 'scared', mouthAt(t, 'neutral')]]);
      lk(c, [0.65 - 0.05 * lt, 1.55, -1.75 - 0.08 * lt], [-1.6, 1.15, -4.6]); },
    (lt, o, c, t) => { pin(o, '1 OPEN', RED, T['02_knock'], t); dtag(o, c, A(-1.8, 1.78, ZB + 0.05), '3012', YEL, 250, 180, t, W.n3012 - 0.05); });
  // 02a "Some of you said open it.": de frente junto a la puerta barricada; Ava duda, mira a camara
  sh('02a_some', 44, (lt, t, c) => { state({}); AVA(-0.95, -3.75, Math.PI + 0.55); ch.pose(lt, idle(0.5), [[-99, 'scared', mouthAt(t, 'neutral')], [0.5, 'half', mouthAt(t, 'neutral')]]);
      lk(c, [0.05 + 0.04 * lt, 1.5, -2.55 + 0.06 * lt], [-1.15, 1.25, -4.0]); ch.lookAt(c, 0.8, 35); },
    (lt, o) => pin(o, '1 OPEN', RED));
  // 02b "So you move the dresser": Ava aparta la comoda (push_heavy hacia atras), la camara orbita
  // nota 4: Ava empuja la comoda de costado (hacia +x) desde su lado izquierdo: manos en el canto, el cuerpo fuera del mueble; los pies avanzan con la comoda
  sh('02b_dresser', 50, (lt, t, c) => { const D = T['02c_open'] - T['02b_dresser'], k = ease(0.3, D - 0.05, lt); state({ dresserX: L.lerp(-1.0, 0.15, k) });
      AVA(dresser.position.x - 0.55 - PUSHD, dresser.position.z, Math.PI / 2); ch.pose(lt, [L.seg('push_heavy', 0, { speed: 0.9 })], [[-99, 'angry', mouthAt(t, 'frown')]]);
      lk(c, [0.35 - 0.1 * lt, 1.55, -2.55], [dresser.position.x - 0.45, 0.85, -4.75]); },
    (lt, o) => pin(o, '1 OPEN', RED));
  // 02c "and open the door": gira el cerrojo y abre; el vecino del 3011 en el pasillo (capucha, ojos en sombra), el brazo derecho escondido
  sh('02c_open', 48, (lt, t, c) => { const kd = ease(0.35, 1.1, lt); state({ dresserX: 0.15, doorA: 1.25 * kd, nb: true, hallLit: 0.55 });
      AVA(-1.32, -4.1, Math.PI - 0.15); ch.pose(lt, [L.seg('turn_key', 0, { speed: 1.2 }), L.seg('idle', 0.75, { loop: true, fade: 0.25, speed: 0.5 })], [[-99, 'half', 'neutral'], [1.0, 'surprised', 'neutral']]);
      nbW.position.set(-1.72, 0, -5.55); nbW.rotation.y = 0.0; poseNb({ t, vis: 0.6 + 0.4 * kd });
      lk(c, [-0.75, 1.62, -3.15], [-1.85, 1.35, -5.4]); },
    (lt, o, c, t) => { pin(o, '1 OPEN', RED); if (lt > 1.0) dialog(o, '3011', 'THANK YOU... I JUST NEED WATER.', Math.floor((lt - 1.0) * 34)); });
  // 02d "and his arm is bitten": su brazo entra a la luz: la venda empapada y la mordida (textura real); ojos lechosos bajo la capucha
  sh('02d_arm', 40, (lt, t, c) => { state({ dresserX: 0.15, doorA: 1.25, nb: true, hallLit: 0.55, hero: false });
      nbW.position.set(-1.72, 0, -5.45 + 0.1 * ease(0, 0.8, lt)); nbW.rotation.y = 0.0; poseNb({ t, vis: 1, atk: 0.12 + 0.25 * ease(0, 1.2, lt), eyes: t > W.bitten - 0.1 });
            const bw = bandage.getWorldPosition(V()); look(c, bw.clone().add(V(0.42, 0.28, 0.72)), bw.clone().add(V(0, 0.08, 0))); },
    (lt, o, c, t) => { pin(o, '1 OPEN', RED); dtag(o, c, bandage.getWorldPosition(V()), 'BITE', '#ff4030', 250, 190, t, W.bitten - 0.05); });
  // 02e se abalanza hacia Ava (Zombie_Attack), desde atras de ella
  sh('02e_lunge', 44, (lt, t, c) => { const k = ease(0, 0.7, lt); state({ dresserX: 0.15, doorA: 1.25, nb: true, hallLit: 0.55 });
      nbW.position.set(-1.72, 0, -5.4 + 0.9 * k); nbW.rotation.y = Math.PI / 2; poseNb({ t, vis: 1, atk: 0.4 + lt * 1.1, eyes: true });
      AVA(-1.45, -3.6, Math.PI - 0.1); ch.pose(lt, idle(0.4), [[-99, 'shocked', 'gasp']]);
      lk(c, [-0.75, 1.62, -2.75], [-1.75, 1.35, -5.0]); },
    (lt, o) => pin(o, '1 OPEN', RED));
  // 03 "Oh, fudge": de frente; el vecino encima, por detras de su hombro
  sh('03_fudge', 40, (lt, t, c) => { state({ dresserX: 0.15, doorA: 1.25, nb: true, hallLit: 0.55 });
      AVA(-1.6, -3.7, 0.15); ch.pose(lt, idle(0.4), [[-99, 'scared', mouthAt(t, 'neutral')]]);
      nbW.position.set(-1.85, 0, -4.55 + 0.25 * ease(0, 1.0, lt)); nbW.rotation.y = Math.PI / 2 + 0.15; poseNb({ t, vis: 1, atk: 0.9 + lt * 0.5, eyes: true });
      lk(c, [-1.45 + 0.02 * lt, 1.55, -2.35 - 0.08 * lt], [-1.62, 1.5, -3.75]); ch.lookAt(c, 1, 35); },
    (lt, o) => pin(o, '1 OPEN', RED));
  // 04 rebobinado: glitch sobre YOU DIED y la rama OPEN hacia atras con capa VHS (ep15)
  const REV = ['02_knock', '02a_some', '02b_dresser', '02c_open', '02d_arm', '02e_lunge', '03_fudge'];
  { const c = cam(46), G0 = 0.35;
    out['04_rewind'] = { scene, camera: c, update(lt) {
      const t0s = REV.map((id) => T[id]), tA = T['02_knock'] + 0.1, tB = T['03c_died'] - 0.05, D = T['05_quiet'] - T['04_rewind'];
      const u = lt < G0 ? 0 : L.clamp01((lt - G0) / (D - G0 - 0.03)); const tb = lt < G0 ? tB : tB - (tB - tA) * u;
      let k = 0; while (k < REV.length - 1 && tb >= t0s[k + 1]) k++;
      const s = out[REV[k]]; s.update(tb - t0s[k], tb); out['04_rewind'].scene = s.scene;
      c.position.copy(s.camera.position); c.quaternion.copy(s.camera.quaternion); c.fov = s.camera.fov; c.updateProjectionMatrix();
    }, overlay(lt, dt, a, o) {
      const cx = o.tctx, f = Math.floor(lt * 30);
      if (lt < G0) {
        cx.fillStyle = 'rgba(150,0,0,0.55)'; cx.fillRect(0, 0, LW, LH); cx.fillStyle = 'rgba(20,0,0,0.78)'; cx.fillRect(0, 0, LW, LH);
        youDied(o, 3); const r = L.rng(1000 + f);
        for (let k = 0; k < 9; k++) { const y = r() * LH | 0, h = 4 + r() * 26 | 0, dx = Math.round((r() - 0.5) * 60); const im = cx.getImageData(0, y, LW, h); cx.putImageData(im, dx, y); }
        for (let k = 0; k < 5; k++) { const cols = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff', '#000000']; cx.fillStyle = cols[(r() * 5) | 0]; cx.globalAlpha = 0.5; cx.fillRect(0, r() * LH | 0, LW, 1 + r() * 4 | 0); cx.globalAlpha = 1; }
        return;
      }
      cx.fillStyle = 'rgba(40,20,90,0.18)'; cx.fillRect(0, 0, LW, LH); const r = L.rng(2000 + f);
      for (let y = 0; y < LH; y += 3) { cx.fillStyle = 'rgba(0,0,0,0.12)'; cx.fillRect(0, y, LW, 1); }
      const by = LH - ((lt * 520) % (LH + 80));
      for (let k = 0; k < 40; k++) { cx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.5})`; cx.fillRect(r() * LW | 0, by + r() * 26 | 0, 2 + r() * 14 | 0, 1); }
      cx.fillStyle = 'rgba(255,255,255,0.08)'; cx.fillRect(0, by, LW, 26);
      for (let k = 0; k < 3; k++) { const y = r() * LH | 0, im = cx.getImageData(0, y, LW, 6); cx.putImageData(im, Math.round((r() - 0.5) * 10), y); }
      left(cx, 'REW', 52, 56, 2, '#f4f4f4', { outline: '#000000' });
      for (const x0 of [20, 34]) for (let k = 0; k < 9; k++) px(cx, x0 + k, 56 - k * 0.8 | 0, '#f4f4f4', 1, Math.max(1, Math.round(k * 1.6)));
      left(cx, 'SP', 22, 600, 2, '#f4f4f4', { outline: '#000000' }); left(cx, `0:00:${String(Math.max(0, Math.round(19 - (lt - G0) * 20))).padStart(2, '0')}`, 210, 600, 2, '#f4f4f4', { outline: '#000000' });
    } };
  }

  // ================= rama 2 STAY QUIET =================
  // 05 "Most of you said stay quiet. So you wait": Ava sentada en el piso de espaldas al sofa, mira a camara; la comoda contra la puerta detras
  sh('05_quiet', 44, (lt, t, c) => { state({}); AVA(-0.55, -3.3, 0.45); ch.root.position.y = 0.0;
      ch.pose(lt, [L.seg('sit_floor', -99, { from: 0.9, speed: 0.05 })], [[-99, 'half', mouthAt(t, 'neutral')], [W.wait - T['05_quiet'], 'scared', mouthAt(t, 'neutral')]]);
      lk(c, [0.35 - 0.05 * lt, 1.1, -1.65 - 0.09 * lt], [-0.95, 0.7, -3.6]); ch.lookAt(c, 0.85, 35); },
    (lt, o) => pin(o, '2 STAY QUIET', WHITE, T['05_quiet'], T['05_quiet'] + lt));
  // 05b "and a note slides under the door": camara al ras del piso; la hoja sale por la rendija junto a la comoda
  const notePaper = L.plane(0.16, 0.22, lam(L.cvs(16, 22, (c) => { px(c, 0, 0, '#e6dcc0', 16, 22); px(c, 2, 4, '#3a3028', 11, 1); px(c, 2, 7, '#3a3028', 9, 1); px(c, 2, 10, '#8a1810', 12, 1); }), 0xffffff, PO), 0, 0.006, 0, apt, 0, -Math.PI / 2); notePaper.visible = false; notePaper.renderOrder = 2;
  sh('05b_note', 52, (lt, t, c) => { state({ hero: false, feet: lt < 0.9 ? [0.18, 0.34] : [] }); const k = ease(0.15, 1.1, lt); notePaper.visible = true; notePaper.position.set(-2.13, 0.006, ZB + 0.02 + 0.32 * k); notePaper.rotation.z = 0.2 * k;
      lk(c, [-2.75, 0.3, -3.85], [-2.05, 0.03, ZB + 0.25]); },
    (lt, o) => pin(o, '2 STAY QUIET', WHITE));
  // 05c FILE: la nota, palabra a palabra con la voz
  { const fs = new THREE.Scene(); fs.background = new THREE.Color(0x000000); const fc = cam(45);
    const PXL = 40, PYT = 96, PWd = 280, PHd = 300, R2 = L.rng(404);
    const paper2 = (() => { const cv = document.createElement('canvas'); cv.width = PWd; cv.height = PHd; const c = cv.getContext('2d'), img = c.createImageData(PWd, PHd); const r = L.rng(7);
      for (let y = 0; y < PHd; y++) for (let x = 0; x < PWd; x++) { const i = (y * PWd + x) * 4, e = Math.min(x, y, PWd - 1 - x, PHd - 1 - y), edge = e < 8 ? (8 - e) * 5 : 0, n = (r() - 0.5) * 14, fold = Math.abs(y - PHd / 2) < 1 ? -22 : 0;
        img.data[i] = 226 + n - edge + fold; img.data[i + 1] = 216 + n - edge * 1.2 + fold; img.data[i + 2] = 184 + n - edge * 1.6 + fold; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0); c.fillStyle = 'rgba(110,70,30,0.18)'; c.beginPath(); c.arc(220, 250, 22, 0, 6.3); c.fill(); for (let k = 0; k < 30; k++) { c.fillStyle = 'rgba(60,40,20,0.15)'; c.fillRect(R2() * PWd, R2() * PHd, 2, 1); } return cv; })();
    const HAND = '"Segoe Print", "Comic Sans MS", "Marker Felt", cursive';
    const WORDS = [['THE', 'stairs5', 0], ['STAIRS.', 'stairs5', 0], ["IT'S", 'its5', 1], ['COMING', 'coming', 1], ['UP.', 'up5', 1]];
    out['05c_file'] = { scene: fs, camera: fc, update() {}, overlay(lt, dt, a, o) {
      const c = o.tctx, t = T['05c_file'] + lt;
      px(c, 14, 30, '#2c3040', 332, 22); px(c, 14, 30, '#7a8094', 332, 1); px(c, 18, 34, '#04060e', 324, 14);
      bitText(c, 'FILE', 40, 41, 1, '#9cf09c', { outline: null }); bitText(c, 'UNDER THE DOOR', 270, 41, 1, '#c8ccd8', { outline: null });
      const Y = PYT + Math.round(6 * (1 - ease(0, 0.3, lt)));
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(PXL + 4, Y + 4, PWd, PHd); c.drawImage(paper2, PXL, Y);
      let fsz = 30; c.font = `bold ${fsz}px ${HAND}`; while (fsz > 14 && Math.max(c.measureText("THE STAIRS. ").width, c.measureText("IT'S COMING UP. ").width) > PWd - 50) { fsz--; c.font = `bold ${fsz}px ${HAND}`; } c.textAlign = 'left'; c.textBaseline = 'alphabetic';   // nota 7: margenes de 25 px
      const lines = [[], []]; WORDS.forEach((w) => lines[w[2]].push(w));
      lines.forEach((ln, li) => { let x = PXL + 22; const y = Y + 110 + li * 70; for (const [w, key] of ln) { const tw = (W[key] ?? 0) - 0.05; if (t >= tw) { c.fillStyle = key === 'coming' || key === 'up5' ? '#8a1208' : '#1e1a30'; c.fillText(w, x, y); } x += c.measureText(w + ' ').width; } });
      if (t > W.up5 + 0.2) { c.strokeStyle = '#8a1208'; c.lineWidth = 3; c.beginPath(); c.moveTo(PXL + 24, Y + 194); c.lineTo(PXL + PWd - 30, Y + 191); c.stroke(); }
      pin(o, '2 STAY QUIET', WHITE);
    } };
  }
  // 06 "Your phone's at eighteen percent. Airplane mode...": POV, el telefono sube DERECHO y nivelado; 18 % rojo; modo avion ON y +HOURS
  const drawPhone = (o, t) => { if (!ph1Rect) return; const c = o.tctx, [x, y, w, h] = ph1Rect; const air = t >= W.airplane - 0.05;
    px(c, x, y, '#05070c', w, h); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#16203c'); g.addColorStop(1, '#05070c'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = '#e8e8e8'; c.font = 'bold 9px monospace'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('12:41', x + 6, y + 9);
    if (air) { c.fillStyle = '#ffb030'; c.font = 'bold 10px monospace'; c.fillText('✈', x + w - 40, y + 9); } else { for (let i = 0; i < 4; i++) px(c, x + w - 42 + i * 4, y + 12 - i * 2, '#e8e8e8', 3, 2 + i * 2); }
    px(c, x + w - 22, y + 5, '#e0e0e0', 14, 8); px(c, x + w - 21, y + 6, '#05070c', 12, 6); px(c, x + w - 21, y + 6, '#ff3020', 3, 6); px(c, x + w - 8, y + 7, '#e0e0e0', 2, 4);
    bitText(c, '18%', x + w / 2, y + h * 0.3, 3, '#ff4030', { outline: '#000' });
    px(c, x + w / 2 - 28, y + h * 0.3 + 22, '#e0e0e0', 56, 22); px(c, x + w / 2 - 26, y + h * 0.3 + 24, '#05070c', 52, 18); px(c, x + w / 2 - 26, y + h * 0.3 + 24, '#ff3020', 9, 18); px(c, x + w / 2 + 28, y + h * 0.3 + 29, '#e0e0e0', 3, 8);
    const ry = y + h * 0.66; c.fillStyle = 'rgba(40,46,60,0.95)'; c.fillRect(x + 6, ry, w - 12, 26); c.fillStyle = '#e8e8ec'; c.font = 'bold 8px monospace'; c.textAlign = 'left'; c.fillText('Airplane Mode', x + 11, ry + 13);
    const tk = ease(W.airplane - 0.05, W.airplane + 0.15, t); px(c, x + w - 34, ry + 7, tk > 0.5 ? '#3ad84a' : '#5a5e6a', 22, 12); px(c, Math.round(x + w - 33 + 10 * tk), ry + 8, '#ffffff', 10, 10);
    if (t >= W.hours - 0.05) { const k = POPK(t - W.hours + 0.05); bitText(c, '+ HOURS', x + w / 2, y + h * 0.3 + 60 - 3 * (1 - k), 2, '#62f05a', { outline: '#000' }); } };
  sh('06_phone', 50, (lt, t, c) => { state({}); ch.root.visible = false; const k = ease(0.05, 0.4, lt);
      const p = A(-0.4 + 0.01 * Math.sin(lt * 0.7), 1.05 + 0.005 * Math.sin(lt * 1.1), -3.0), tg = A(-0.55, 0.35, -4.4); look(c, p, tg); placePhone(c, k); },
    (lt, o, c, t) => { drawPhone(o, t); pin(o, '2 STAY QUIET', WHITE); });
  // 06a "Airplane mode...": mas cerca, el telefono llena el cuadro (mismo POV, nivelado)
  sh('06a_air', 38, (lt, t, c) => { state({}); ch.root.visible = false;
      const p = A(-0.42 + 0.008 * Math.sin(lt * 0.7), 1.0, -3.05), tg = A(-0.8, 0.3, -4.5); look(c, p, tg); placePhone(c, 1); },
    (lt, o, c, t) => { drawPhone(o, t); pin(o, '2 STAY QUIET', WHITE); });
  // 06b (···): la maquina de escribir: DAY 3 / FLOOR 30 / 3012 — PROGRESS SAVED
  { const L1 = 'DAY 3', L2 = 'FLOOR 30 - 3012', TOT = L1.length + L2.length; let lastN = -1;
    sh('06b_save', 40, (lt, t, c) => { state({}); ch.root.visible = false; const n = Math.max(0, Math.min(TOT, Math.floor((lt - 0.05) * 17)));
        if (n !== lastN) { lastN = n; const cx = pcv.getContext('2d'); cx.fillStyle = '#ece6d6'; cx.fillRect(0, 0, 96, 128); cx.fillStyle = '#c8c0ac'; for (let y = 0; y < 128; y += 9) cx.fillRect(0, y, 96, 1);
          cx.fillStyle = '#1a1a1a'; cx.font = 'bold 14px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'top';
          cx.fillText(L1.slice(0, n), 8, 14); cx.font = 'bold 9px "Courier New", monospace'; cx.fillText(L2.slice(0, Math.max(0, n - L1.length)), 6, 42); pt.needsUpdate = true; }
        tw.children.forEach((k) => { if (k.userData.key !== undefined) k.position.y = 0.105 + Math.floor(k.userData.key / 10) * 0.012 - (k.userData.key === (n * 7) % 40 && n < TOT ? 0.006 : 0); });
        paper.position.y = 0.33 + 0.004 * Math.floor(n / 9); const wp = tw.localToWorld(V(0, 0.28, 0));
        look(c, wp.clone().add(V(-0.55 - 0.03 * lt, 0.32, 0.38 + 0.02 * lt)), wp); },
      (lt, o, c, t) => { const ts = T['06b_save'] + TOT / 17 + 0.1; if (t > ts) { const cx = o.tctx; cx.globalAlpha = ease(ts, ts + 0.2, t); bitText(cx, 'PROGRESS SAVED', LW / 2, 470, 2, '#9cd4ff', { outline: '#000' }); bitText(cx, 'INK RIBBON x1', LW / 2, 492, 1, '#c8c8d0', { outline: '#000' }); cx.globalAlpha = 1; } pin(o, '2 STAY QUIET', WHITE); });
  }
  // ---------- hueco de escalera: el cazador sube (tramos A/B), los anillos de sonido suben piso a piso ----------
  // posicion en la escalera por "progreso" p (pisos, continuo): cada piso = tramo A + descanso + tramo B + descanso
  const stairPos = (p) => { const f = Math.floor(p), u = p - f, y0 = yF(f);
    if (u < 0.4) { const k = u / 0.4; return [V(SX0 + FLW / 2, y0 + k * FH / 2, 1.5 - k * 2.6), Math.PI, 1]; }
    if (u < 0.5) { const k = (u - 0.4) / 0.1; return [V(L.lerp(SX0 + FLW / 2, -SX0 - FLW / 2, k), y0 + FH / 2, -1.9), Math.PI + Math.PI * k * 0.999 + Math.PI / 2 * Math.sin(Math.PI * k) * 0, 0]; }
    if (u < 0.9) { const k = (u - 0.5) / 0.4; return [V(-SX0 - FLW / 2, y0 + FH / 2 + k * FH / 2, -1.1 + k * 2.6), 0, 1]; }
    const k = (u - 0.9) / 0.1; return [V(L.lerp(-SX0 - FLW / 2, SX0 + FLW / 2, k), y0 + FH, 2.1), Math.PI * k, 0]; };
  const P_T0 = T['07_shaft'], P_START = 27.35, P_RATE = 0.22;   // pisos por segundo (lento y pesado)
  const gProg = (t) => P_START + P_RATE * Math.max(0, t - P_T0);
  const stepT = 1 / 1.1;   // un paso por ~0,9 s
  const setRings = (t, focus) => { const p0 = gProg(t);
    rings.forEach((m, i) => { const birth = P_T0 - 1.2 + i * stepT * 0.62, age = t - birth; const life = 2.6; const born = age > 0 && age < life;
      m.visible = born; if (!born) return; const by = stairPos(gProg(birth))[0].y + 0.4, y = by + age * 5.5; m.position.set(0, y, 0.2); m.scale.set(0.9 + 0.1 * age, 2.4 + 0.1 * age, 1); m.material.opacity = (1 - age / life) * 0.22 * focus; void p0; }); };
  const climb = (t, o = {}) => { const p = gProg(t), [pos, yaw, onFlight] = stairPos(p); const ph = (t - P_T0) * 0.55; return stalk(sS, pos.x, pos.z, yaw, { ph, w: 1, grip: 0.3, duck: 0.12, t, face: 1.4, ...o }, pos.y - 0.04 * onFlight); };
  // 07 "Then footsteps in the stairwell": desde el descanso del piso 30 mirando abajo por el pozo; el cazador, muy abajo, sube; la luz verde
  sh('07_shaft', 60, (lt, t, c) => { shaftFill.intensity = 0; setRings(t, 1); footprints.forEach((m) => { m.visible = false; }); climb(t);
      const y30 = yF(30 - 1); look(c, V(0.25, y30 + 1.5, 1.1), V(0.6, y30 - 9, 0.0)); shaftFill.position.set(0.3, ST.wrap.position.y + 2.6, ST.wrap.position.z + 0.3); shaftFill.intensity = 9; },
    (lt, o, c, t) => { dtag(o, c, ST.bn.chest.getWorldPosition(V()), 'FLOOR ' + Math.floor(gProg(t) + 1), '#ff4030', 270, 470, t, T['07_shaft'] + 0.35); pin(o, '2 STAY QUIET', WHITE); }, sS);
  // 07b "heavy and bare": los pies descalzos cruzan el descanso mojado, dejan huellas (camara al ras)
  sh('07b_feet', 34, (lt, t, c) => { setRings(t, 0); const f = Math.floor(gProg(T['07b_feet'])), y0 = yF(f) + FH / 2;   // el piso del plano queda fijo (antes saltaba de piso a mitad del plano)
      const [pos] = stairPos(f + 0.45); footprints.forEach((m, i) => { const x = L.lerp(1.6, 0.4, i / 5); m.visible = i < 2 + Math.floor(lt * 2.2); m.position.set(x + (i % 2 ? 0.12 : -0.12), y0 + 0.012, -1.9 + (i % 2 ? 0.15 : -0.15)); m.rotation.z = Math.PI / 2; });
      const k = ease(0, T['07c_carry'] - T['07b_feet'], lt); const x = L.lerp(1.45, 0.25, k); stalk(sS, x, -1.95, -Math.PI / 2, { ph: (1.45 - x) / 1.6, w: 0.8, roll: 1, grip: 0.4, t, face: 0.6 }, y0);
      shaftFill.position.set(x - 0.7, y0 + 0.35, -1.5); shaftFill.intensity = 7; look(c, V(-1.75, y0 + 0.3, -1.72), V(x - 0.05, y0 + 0.14, -1.95)); void pos; },
    (lt, o) => pin(o, '2 STAY QUIET', WHITE), sS);
  // 07c "In a stairwell, sound carries up floor after floor": dentro del pozo mirando arriba; los anillos suben hasta el 30
  sh('07c_carry', 56, (lt, t, c) => { setRings(t, 1); footprints.forEach((m) => { m.visible = false; }); stOff();
      shaftFill.intensity = 0; const yc = yF(26) + 0.6 + 0.25 * lt; look(c, V(0.0, yc, 0.95), V(0.0, yc + 12, 0.05)); },
    (lt, o, c, t) => { const fl = Math.min(30, 28 + Math.floor((t - T['07c_carry']) * 1.2)); dtag(o, c, V(-1.0, yF(fl - 1) + 1.75, WZ), 'F' + fl, '#4fd6ff', 270, 140, t, T['07c_carry'] + 0.2); if (t > W.sound - 0.05) { const cx = o.tctx; bitText(cx, 'SOUND', 80, 470, 2, '#4fd6ff', { outline: '#000' }); for (let k = 0; k < 3; k++) { const yy = 446 - ((t * 40 + k * 10) % 30); px(cx, 76 - k * 0, yy, '#4fd6ff', 8, 2); } } pin(o, '2 STAY QUIET', WHITE); }, sS);
  // 08 "Through the peephole": Ava se inclina sobre la comoda hacia la mirilla (de espaldas, 3/4)
  sh('08_peep', 42, (lt, t, c) => { state({ feet: [] }); AVA(-1.86, ZB + 0.3, Math.PI); ch.pose(lt, [L.seg('peek', 0, { speed: 0.7 }), L.seg('peek', 1.0, { from: 0.7, speed: 0 })], [[-99, 'scared', 'neutral']]);
      lk(c, [-0.55 - 0.04 * lt, 1.75, -3.55 - 0.03 * lt], [-1.85, 1.5, ZB + 0.15]); },
    (lt, o) => pin(o, '2 STAY QUIET', WHITE));
  // 08b mirilla (ojo de pez): el cazador sale de lo oscuro del pasillo (primero la luz verde) y se planta frente a la puerta
  const HALLZ = -6.45;
  const gHall = (t) => ease(T['08b_fish'] - 0.1, W.reaches + 0.35, t);
  sh('08b_fish', 128, (lt, t, c) => { state({ hero: false, hallLit: 0.75 }); const u = gHall(t), x = L.lerp(-4.0, -1.75, u), turn = ease(W.reaches + 0.1, W.floor8 + 0.5, t);
      const hp = A(0, 0, 0); void hp; stalk(scene, x, HALLZ + 0.1 * turn, Math.PI / 2 - Math.PI / 2 * turn, { ph: (x + 4.0) / STRIDE, w: 1 - turn, grip: 0.35, duck: 0.3 + 0.35 * turn, pitch: -0.35 * turn, t, face: 1.2 + 1.2 * turn, dark: 0.85 * (1 - ease(-3.6, -2.3, x)) }, FY);
      look(c, A(-1.8, 1.58, ZB - 0.13), A(-1.8, 1.82, -7.0)); },
    (lt, o, c, t) => { const cx = o.tctx, R0 = 158, cxp = LW / 2, cyp = 300; cx.save(); cx.beginPath(); cx.rect(0, 0, LW, LH); cx.moveTo(cxp + R0, cyp); cx.arc(cxp, cyp, R0, 0, Math.PI * 2, true); cx.fillStyle = '#000'; cx.fill('evenodd'); cx.restore();
      const g = cx.createRadialGradient(cxp, cyp, R0 * 0.55, cxp, cyp, R0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); cx.fillStyle = g; cx.beginPath(); cx.arc(cxp, cyp, R0, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(160,200,255,0.25)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(cxp, cyp, R0 - 2, 0, 7); cx.stroke(); pin(o, '2 STAY QUIET', WHITE); });
  // 08c el primer golpe en la puerta, desde adentro: solo la hoja y la cadena; la comoda se corre; luz verde por la rendija
  const HITS = [0.0, 1.5, 2.3, 3.1, 3.9, 4.7, 5.5, 6.3];
  const give = (u) => u < 0 ? 0 : u < 0.1 ? u / 0.1 : Math.exp(-(u - 0.1) * 6) * Math.cos((u - 0.1) * 20);
  const pound = (ts, hits) => { let gv = 0, n = 0; for (const h of hits) { const u = ts - h; if (u >= 0) { n++; gv += give(u); } } leaf12.rotation.y = -0.035 * Math.max(-0.4, gv); setChain(gv);
    dresser.position.z = ZB + 0.02 + DDEP / 2 + 0.03 * n + 0.012 * Math.max(0, gv); return n; };
  const PUSHD = 0.42;
  const P1 = T['08c_pound'] + 0.35;
  sh('08c_pound', 44, (lt, t, c) => { state({ gapGreen: 1, feet: [0.38, 0.6] }); AVA(-0.8, -3.2, Math.PI - 0.45); ch.pose(lt, idle(0.45), [[-99, 'scared', 'neutral']]); pound(t - P1, [0]);
      lk(c, [0.55, 1.5, -1.85], [-1.55, 1.1, -4.7]); },
    (lt, o) => pin(o, '2 STAY QUIET', WHITE));

  // ================= 09 DECISION (gramatica RE3 del ep15 / STALKER.md): corte seco -> destello 0,5 -> NEGATIVO sin texto 2,5 -> parpadeo + destello ->
  // NEGATIVO con las opciones 2,4 -> parpadeo + destello -> color con el mismo encuadre: caja azul en la opcion que nombra la voz, menu vivo en 4 angulos,
  // COMMENT 1 OR 2 + FOLLOW FOR MORE!. El cazador golpea la puerta 3012 todo el tiempo (camara lenta x0,5, congelado en los negativos):
  // solo tiemblan la hoja y la cadena, la comoda se corre un poco con cada golpe. Ava y la camara quietas. =================
  const DZD = { flash1: [0, 0.5], neg1: [0.5, 1.7], blink1: [1.7, 2.2], neg2: [2.2, 3.8], blink2: [3.8, 4.3] };   // nota 8: negativos mas cortos (1,2 s y 1,6 s)
  const CB = 4.3;
  const storyT = (lt) => lt < 1.7 ? 0.25 + 0.02 * lt : lt < CB ? 1.6 + 0.02 * (lt - 1.7) : 1.75 + 0.5 * (lt - CB);
  const hitReal = (h) => h < 0.3 ? 0.0 : h < 1.7 ? 1.95 : CB + (h - 1.75) / 0.5;
  window.DEC_HITS = HITS.map(hitReal);
  const ANG = [CB, 5.9, 7.5, 9.1, 10.9]; const angOf = (lt) => { let k = 0; for (let i = 0; i < ANG.length; i++) if (lt >= ANG[i]) k = i; return [0, 1, 2, 3, 0][k]; };   // angulos vivos tras volver el color
  { const c = cam(40);
    out['09_choice'] = { scene, camera: c, invert: (lt) => (lt >= 0.12 && lt < CB - 0.25) ? 1 : 0,
      update(lt, t) {
        const ts = storyT(lt); state({ gapGreen: 1, feet: [0.38, 0.6] }); pound(ts, HITS);
        const kA = angOf(lt);
        AVA(-0.35, -3.25, Math.PI - 0.62); const at = lt < CB ? (lt < 1.7 ? 0.2 : 1.1) : 1.1 + 0.5 * (lt - CB); ch.pose(at, idle(0.5), [[-99, 'scared', 'neutral']]);
        if (kA === 0) lk(c, [1.4, 2.3, -0.4 - 0.05 * Math.max(0, lt - CB)], [-1.45, 0.65, -4.6]);
        else if (kA === 1) lk(c, [-3.45, 1.55, -1.35], [-5.3, 0.45, -2.75]);                      // la banera (opcion 1)
        else if (kA === 2) { look(c, V(1.3, FY + 1.9, 1.6), V(0.0, 28 * 2.9 + 0.4, 0.4)); balL.intensity = 7; }                           // por la ventana: el balcon de abajo (opcion 2)
        else { lk(c, [-1.0, 1.42, -4.35], [-0.35, 1.68, -3.25]); ch.lookAt(c, 0.8, 35); }            // Ava de frente, la puerta detras
      },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['09_choice'] + lt, inn = (k) => lt >= DZD[k][0] && lt < DZD[k][1];
        vign(0.4)(lt, dt, a, o); cx.fillStyle = '#c4c4c0'; cx.fillRect(0, 0, LW, 26); cx.fillRect(0, LH - 26, LW, 26);
        const normal = lt >= CB, DK = '#141414';
        if (lt >= 2.2 && !normal) { cx.font = 'bold 15px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillStyle = DK; cx.fillText('1.  HIDE IN THE TUB', 40, 100); cx.fillText('2.  CLIMB TO THE', 40, 138); cx.fillText('    BALCONY BELOW', 40, 160); }
        if (normal) {
          const kp = L.clamp01((lt - CB) / 0.2), PX = 18, PY = 44, PW = 324, PH = 150;
          cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH); px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
          cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
          bitText(cx, 'WHAT DO YOU DO?', LW / 2, PY + 24, 2, '#ececec', { outline: '#000000' });
          const sel = t >= W.two9 - 0.05 ? 1 : t >= W.one9 - 0.05 ? 0 : 1;
          [['1. HIDE IN THE TUB', RED], ['2. CLIMB TO THE', WHITE, 'BALCONY BELOW']].forEach(([str, col, s2], i) => { const y = PY + 56 + i * 38;
            if (i === sel) { cx.fillStyle = 'rgba(40,90,220,0.55)'; cx.fillRect(PX + 12, y - 15, PW - 24, s2 ? 44 : 30); cx.strokeStyle = '#7ab0ff'; cx.lineWidth = 2; cx.strokeRect(PX + 12.5, y - 14.5, PW - 25, s2 ? 43 : 29); cx.lineWidth = 1; }
            left(cx, str, 40, y, 2, i === sel ? col : '#8a8a8a', { outline: '#000000' }); if (s2) left(cx, s2, 72, y + 22, 2, i === sel ? col : '#8a8a8a', { outline: '#000000' }); });
          if (t >= W.comment) { const bq = Math.round(3 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, 548 + bq, 2, '#ffd23f', { outline: '#000000' }); }
          if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, 590, 2, '#ececec', { outline: '#000000' });
          const kA = angOf(lt), cm = out['09_choice'].camera;
          if (kA === 0) { dtag(o, cm, A(-3.2, 1.0, -2.6), '1 TUB', RED, 70, 300, t, T['09_choice'] + CB + 0.2); dtag(o, cm, A(0.7, 1.2, -0.15), '2 BALCONY', WHITE, 280, 320, t, T['09_choice'] + CB + 0.4); }
          if (kA === 1) dtag(o, cm, A(-5.3, 0.5, -2.7), '1 TUB', RED, 250, 300, t, T['09_choice'] + ANG[1]);
          if (kA === 2) dtag(o, cm, V(0, 28 * 2.9 + 0.6, 0.6), '2 BALCONY', WHITE, 250, 300, t, T['09_choice'] + ANG[2]);
        }
        const ramp = (a0, a1) => Math.sin(Math.PI * L.clamp01((lt - a0) / (a1 - a0)));
        let w = 0, bk = 0; if (inn('flash1')) w = ramp(0, 0.5); if (inn('blink1')) { bk = lt < 1.95 ? ramp(1.7, 2.2) * 1.6 : 0; w = lt >= 1.95 ? ramp(1.95, 2.45) : 0; } if (inn('blink2')) { bk = lt < 4.05 ? ramp(3.8, 4.3) * 1.6 : 0; w = lt >= 4.05 ? ramp(4.05, 4.55) * 0.8 : 0; }
        if (bk > 0) { cx.fillStyle = `rgba(0,0,0,${Math.min(1, bk)})`; cx.fillRect(0, 0, LW, LH); } if (w > 0) { cx.fillStyle = `rgba(255,255,255,${0.9 * w})`; cx.fillRect(0, 0, LW, LH); } } };
  }

  // ep16 (Vera film mode): planos donde la camara lleva un objeto pegado (telefono POV) o es fija (mirilla, FILE, rebobinado, negativo congelado)
  for (const id of ['06_phone', '06a_air']) out[id].noStep = out[id].noSway = true;
  for (const id of ['08b_fish', '05c_file', '04_rewind', '09_choice', '07b_feet']) out[id].noSway = true;
  out['04_rewind'].noStep = true;
  // DOF de los primeros planos (Vera: 50 mm, foco en la cabeza, rango 0,2 m, max 2,6 px a 270 -> 3,5 px a 360)
  const headOf = () => ch.bone.getObjectByName('Head').getWorldPosition(V());
  const dofTo = (id, fn, range = 0.2) => { out[id].dof = () => ({ focus: out[id].camera.position.distanceTo(fn()), range, max: 3.5 }); };
  dofTo('03_fudge', headOf); dofTo('01b_window', headOf, 0.4); dofTo('02d_arm', () => bandage.getWorldPosition(V()), 0.15); dofTo('06b_save', () => tw.localToWorld(V(0, 0.2, 0)), 0.15); dofTo('07b_feet', () => ST.wrap.position.clone(), 0.3); dofTo('02a_some', headOf, 0.3);
  // ---------- portada vertical (?thumb), estilo de miniatura anterior al poster (vuelve desde 2026-11-19; ep14/ep15 thumb_v1): Ava en la pose aprobada
  // (3/4, pistola negra a dos manos, rodillas flexionadas) en el lobby de MERCY TOWER, el cazador detras con los dientes a la luz, HUD real FLOOR 30 · Danger
  // arriba al ~48 % del ancho. Misma disposicion que lasttrain3.js (?thumb) girada 90 grados para que entre en el lobby ----------
  if (L.QS.has('thumb')) {
    window.GUN_SIZE = 0.32; window.WORDS_OVERRIDE = []; const TP = await import('../thumb_post.js'); await TP.init();
    scene.add(ch.root);
    const c = cam(Number(L.QS.get('tfov') ?? 42)), AX = 2.6, AZ = 3.4, FL = 0.2, Y0 = Math.PI / 2;
    const P = (dx, dz) => [AX + dz, AZ - dx];   // offsets del ep15 (atras = -z) girados: atras = -x
    out['01_crane'] = { scene, camera: c, gamma: 0.8, hard: true, noStep: true, noSway: true, update() { const t = 1;
        state({ hero: true }); setFog(9, 60, 0x252d3c); hemi.intensity = 0.7; lobLs[0].intensity = 7; lobLs[1].intensity = 5; emergL.intensity = 1.2;
        const [hx, hz] = P(-1.45, -2.55); stalk(scene, hx, hz, 0.3 + Y0, { grip: 0.7, pitch: -0.05, tilt: 0.15, reach: 0.3, t, face: 4.5 }, FL);
        ch.root.position.set(AX, FL, AZ); ch.pose(0, L.still('pistol_ready', 1.0), [[-99, 'angry', 'neutral']]);
        const k1 = P(0.75, 1.3), f1 = P(-0.65, 1.5);
        TP.apply({ scene }, 0, { clip: 'pistol_ready', ct: 0.4, local: true, face: ['angry', 'frown'], gun: true, elbowR: [-0.24, 1.08, 0.14], aimR: [-0.06, 1.2, 0.4], elbowL: [0.22, 1.06, 0.16], aimL: [-0.02, 1.18, 0.36], gunDir: [0, 0.04, 1],
          legIK: { drop: 0.12, R: [-0.25, 0.12], L: [0.26, -0.05], knee: [0.1, 0, 1] }, pos: [AX, AZ], posY: FL, yaw: Number(L.QS.get('ty') ?? 0.95) + Y0, key: [k1[0], FL + 1.5, k1[1], '#fff4e4', 5, 6], fill: [f1[0], FL + 1.7, f1[1], '#ffffff', 2, 6], gunColor: 0x141414 });
        const cp = P(0.85, 3.8), tg = P(-0.5, -1.7); look(c, V(cp[0], FL + 0.85, cp[1]), V(tg[0], FL + 1.65, tg[1])); },
      overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const cx = o.tctx; cx.save(); cx.translate(Math.round(LW * 0.48 - 67), -14); window.__hud(o, 99, 'DANGER'); cx.restore(); } };
  }
  // ---------- poster vertical (?poster&layer=bg|ava|hud), GUIA §7 (receta del ep15: review/poster_layers.sh + review/poster.py): el cazador enorme arriba
  // en el lobby de MERCY TOWER (set del episodio), Ava al centro de frente con la pistola negra baja, zombis a los lados, luna fria ----------
  if (L.QS.has('poster')) {
    window.GUN_SIZE = 0.3; window.WORDS_OVERRIDE = []; const TP = await import('../thumb_post.js'); await TP.init();
    scene.add(ch.root);   // Ava pasa del apartamento al mundo (lobby)
    const layer = L.QS.get('layer') || 'bg', c = cam(Number(L.QS.get('pfov') ?? 58)), PX0 = 0.4, PZ0 = 5.2, FL = 0.2;
    const zG = await L.loadModel('models/thin-zombie.glb');
    const moonP = new THREE.DirectionalLight(0x8fb0ff, 1.6); moonP.position.set(PX0 - 3, 9, PZ0 + 4); moonP.target.position.set(PX0, 0, PZ0); scene.add(moonP, moonP.target); moonP.visible = false;
    const rimG = new THREE.PointLight(0xb8d0ff, 0, 9, 1.2); scene.add(rimG);
    const zs = []; for (const [dx, dz, ry, tt] of [[-1.15, -1.6, 0.35, 0.3], [-1.9, -2.6, 0.25, 1.1], [1.25, -1.8, -0.3, 0.7], [2.0, -2.8, -0.2, 1.5]]) {
      const z = L.ps1Clone(zG.scene); scene.add(z); const bb = new THREE.Box3().setFromObject(z); z.scale.multiplyScalar(1.75 / (bb.max.y - bb.min.y)); z.position.set(PX0 + dx, FL, PZ0 + dz); z.rotation.y = ry; z.traverse((o) => { if (o.isMesh) [].concat(o.material).forEach((m) => m.color && m.color.multiplyScalar(0.4)); });
      const mx = new THREE.AnimationMixer(z), ac = mx.clipAction(THREE.AnimationClip.findByName(zG.animations, 'idle')); ac.play(); ac.time = tt; mx.update(0); z.visible = false; zs.push(z); }
    const hs = new THREE.Scene(); hs.background = new THREE.Color(0x000000);
    out['01_crane'] = { scene: layer === 'hud' ? hs : scene, camera: c, gamma: 0.8, hard: true, noStep: true, noSway: true, update() { const t = 1;
        if (layer === 'hud') { c.position.set(0, 0, 5); c.lookAt(0, 0, 0); return; }
        state({ hero: layer === 'ava' }); setFog(4, 30, 0x252d3c); hemi.color.set(0x6f86c0); hemi.groundColor.set(0x101418); hemi.intensity = 0.55; lobLs.forEach((q) => { q.intensity = 1.2; }); emergL.intensity = 0;
        for (const o of lobby.children) if (o.isMesh && o.position.y > LH2 - 0.3) o.visible = false;   // el techo del lobby fuera: la cabeza del cazador se pierde en la niebla
        moonP.visible = true; zs.forEach((z) => { z.visible = layer === 'bg'; });
        stalk(scene, PX0 + 0.1, PZ0 - 3.2, 0, { grip: 0.6, pitch: -0.42, duck: 0.25, reach: 0.25, tilt: 0.08, t: 0.1, face: 0 }, FL); ST.wrap.scale.setScalar(Number(L.QS.get('gs') ?? 2.0)); ST.root.updateMatrixWorld(true);
        const hh = ST.bn.head.getWorldPosition(V()); const fl = faceL(scene); fl.intensity = 6; fl.distance = 4; fl.position.copy(hh).add(V(0.3, -0.45, 1.5)); rimG.intensity = 9; rimG.position.copy(hh).add(V(-1.2, 1.2, -1.8));
        ST.wrap.visible = layer === 'bg';
        ch.root.position.set(PX0, FL, PZ0); ch.root.rotation.y = 0; ch.root.visible = layer === 'ava';
        if (layer === 'ava') { ch.pose(0, L.still('idle', 0.4), [[-99, 'angry', 'neutral']]);
          TP.apply({ scene }, 0, { clip: 'idle', ct: 0.4, local: true, face: ['angry', 'neutral'], gun: true, elbowR: [-0.3, 1.0, -0.02], aimR: [-0.33, 0.8, 0.12], gunDir: [0.3, -0.85, 0.42], gunUp: [-1, 0, 0.25],
            pos: [PX0, PZ0], posY: FL, yaw: Number(L.QS.get('ty') ?? 0.22), key: [PX0 + 0.9, FL + 1.7, PZ0 + 2.0, '#e8eeff', 4, 6], fill: [PX0 - 1.0, FL + 1.2, PZ0 + 1.6, '#9fb4e8', 2, 6], rim: [PX0 - 0.4, FL + 2.2, PZ0 - 1.4, '#cfe0ff', 6, 4], gunColor: 0x1c1c20, isolate: true, headYaw: Number(L.QS.get('hy') ?? 0) }); }
        look(c, V(PX0 + 0.05, FL + 1.1, PZ0 + 1.7), V(PX0, FL + Number(L.QS.get('ly') ?? 3.1), PZ0 - 5.5)); },
      overlay(lt, dt, a, o) { if (layer !== 'hud') return; const cx = o.tctx; cx.save(); cx.translate(Math.round(LW / 2 - 59 - 8), 640 - 66 - 34 - 44); window.__hud(o, 99, 'DANGER'); cx.restore(); } };
  }
  // ?prop=<clave>&clean=1: primeros planos de los objetos nuevos para el storyboard (sin HUD ni subtitulos)
  const PROP = L.QS.get('prop');
  if (PROP) {
    const propL = new THREE.PointLight(0xe8ecf4, 0, 9, 1.0); apt.add(propL);
    const PC = {
      door: (c) => { lk(c, [-1.2, 1.5, -3.6], [-1.8, 1.2, ZB]); },
      spray: (c) => { const p = spray.getWorldPosition(V()); look(c, p.clone().add(V(0.35, 0.25, 0.45)), p.clone().add(V(0, 0.08, 0))); },
      herb: (c) => { const p = herb.getWorldPosition(V()); look(c, p.clone().add(V(-0.35, 0.3, -0.5)), p.clone().add(V(0, 0.15, 0))); },
      typewriter: (c) => { const p = tw.localToWorld(V(0, 0.2, 0)); look(c, p.clone().add(V(-0.6, 0.35, 0.3)), p); },
      balcony: (c) => look(c, V(4.5, 28 * 2.9 + 3.2, 7.0), V(0, 28 * 2.9 + 0.8, 0.3)),
      lobby: (c) => look(c, V(4.0, 1.6, 15.0), V(0, 2.0, 5.0)),
      hunter: (c) => { const h = ST.bn.head.getWorldPosition(V()); look(c, h.clone().add(V(0.4, -0.15, 1.35)), h.clone().add(V(0, -0.08, 0))); },
      hunterfull: (c) => { const h = ST.bn.head.getWorldPosition(V()); look(c, h.clone().add(V(0.6, -1.0, 3.6)), h.clone().add(V(0, -1.15, 0))); },
    };
    const base = PROP.startsWith('hunter') ? '01c_inlobby' : PROP === 'balcony' || PROP === 'lobby' ? '01b_window' : '05_quiet';
    for (const [id, sh0] of Object.entries(out)) { const u = sh0.update; sh0.update = (lt, t) => { if (id !== base) { u(lt, t); return; } u(lt, t);
      if (PROP === 'hunter' || PROP === 'hunterfull') { stalk(scene, -1.0, 4.0, 0.35, { grip: 0.5, t, face: 2.5 }, 0.2); }
      if (PC[PROP]) { PC[PROP](sh0.camera); sh0.camera.fov = 50; sh0.camera.updateProjectionMatrix(); propL.position.copy(apt.worldToLocal(sh0.camera.position.clone())).add(V(0, 0.4, 0)); propL.intensity = 4; setFog(40, 600, 0x101a30); } }; }
  }
  return out;
}
