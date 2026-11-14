// sets/saferoom.js — ep7 "AVA: The Safe Room" (3a de la serie puerta/ventana: ep1 = puerta, ep2 = ventana).
// UNA casa de una planta en corte (sin techo, como el mapa de RE): living (3 ventanas + 2 puertas, la puerta acolchada "13"
// del ep1 es la de entrada; W1 es la ventana con tablas del ep2), cocina, pasillo, BANO (cuarto seguro: una puerta, sin
// ventanas, en el medio de la casa, con su armario de ropa blanca), vestidor, lavadero y dormitorio.
// Mundo: suelo y = 0, paredes de 2,6 m, casa x [-5, 7], z [-4, 5] (+z = sur, hacia la camara del corte). Prefijo propio: S*.
// Props foto->lowpoly (objects/tools/build_ep7.py): chest kit spray bandage water flashlight battery charger (+ radio, can,
// cans_stack, bathtub, fridge, dresser, plank, crt, table_lamp de episodios anteriores). Cada update() fija TODO el estado.
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { makeSpray } from './respray.js';

export async function shots({ L, TL }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.02, 400);
  const look = (c, p, t) => { c.up.set(0, 1, 0); c.position.copy(p); c.lookAt(t); c.updateProjectionMatrix(); };
  const cr = (keys, t) => {   // Catmull-Rom por tiempo: keys [[t, x, y, z], ...]
    if (t <= keys[0][0]) return V(keys[0][1], keys[0][2], keys[0][3]);
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const k = (j) => keys[Math.max(0, Math.min(keys.length - 1, j))], [a, b, c, d] = [k(i - 1), k(i), k(i + 1), k(i + 2)];
    const u = Math.min(1, (t - b[0]) / (c[0] - b[0])), u2 = u * u, u3 = u2 * u;
    const f = (j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3);
    return V(f(1), f(2), f(3));
  };
  const vign = (k) => (lt, dt, a, o) => { const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LW * 0.36, LW / 2, LH * 0.5, LH * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH); };
  /** etiqueta de diagrama (cajita con borde de 1 px + linea fina al punto 3D) */
  const tag = (o, camera, p3, x, y, txt, col, k = 1, sc = 2) => {
    if (k <= 0) return; const c = o.tctx, [qx, qy] = L.toScreen(camera, p3.x, p3.y, p3.z), w = textWidth(txt, sc) + 12, h = 9 * sc + 6;
    c.globalAlpha = Math.min(1, k); c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(qx + 0.5, qy + 0.5); c.lineTo(x + 0.5, y + 0.5); c.stroke();
    px(c, qx - 1, qy - 1, col, 3, 3);
    c.fillStyle = 'rgba(4,8,16,0.86)'; c.fillRect(x - w / 2, y - h / 2, w, h); c.strokeRect(x - w / 2 + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
    bitText(c, txt, x, y, sc, col, { outline: null }); c.globalAlpha = 1;
  };
  const box2 = (o, x, y, lines, col, k = 1, sc = 2) => {   // caja de texto sin linea
    if (k <= 0) return; const c = o.tctx, w = Math.max(...lines.map((s) => textWidth(s, sc))) + 16, h = lines.length * (9 * sc + 4) + 8;
    c.globalAlpha = Math.min(1, k); c.fillStyle = 'rgba(4,8,16,0.88)'; c.fillRect(x - w / 2, y - h / 2, w, h); c.strokeStyle = col; c.strokeRect(x - w / 2 + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
    lines.forEach((s, i) => bitText(c, s, x, y - h / 2 + 4 + (9 * sc + 4) * i + (9 * sc) / 2 + 2, sc, i === 0 ? col : '#e8e8ec', { outline: null })); c.globalAlpha = 1;
  };
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);

  // ================= texturas pintadas (32-64 px, nearest) =================
  const noiseTex = (w, h, base, amp, seed, extra) => L.cvs(w, h, (c) => { const r = L.rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (r() - 0.5) * amp; px(c, x, y, `rgb(${base[0] + n},${base[1] + n},${base[2] + n})`); } if (extra) extra(c, r); });
  const tWall = L.cvs(48, 48, (c, w, h) => {   // papel pintado del ep1 (medallon oscuro)
    const r = L.rng(5);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5; px(c, x, y, `rgb(${176 + n},${162 + n},${136 + n})`); }
    c.strokeStyle = '#6e5a48'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(24, 24, 7.2, 9, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(24, 24, 3.2, 4, 0, 0, 7); c.stroke(); px(c, 23, 23, '#4a3628', 2, 2);
    for (const [dx, dy] of [[0, -12], [0, 12], [-10, 0], [10, 0]]) { c.beginPath(); c.arc(24 + dx, 24 + dy, 2, 0, 7); c.stroke(); }
    c.strokeStyle = '#9a8670'; c.lineWidth = 1; for (const [x, y] of [[0, 0], [48, 0], [0, 48], [48, 48]]) { c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x, y - 5); c.lineTo(x + 4, y); c.lineTo(x, y + 5); c.closePath(); c.stroke(); }
  });
  const tWall2 = noiseTex(32, 32, [150, 160, 140], 12, 41, (c) => { for (let x = 0; x < 32; x += 8) px(c, x, 0, 'rgba(90,100,80,0.45)', 1, 32); });   // pasillo/vestidor: verde grisaceo con rayas
  const tTile = L.cvs(32, 32, (c) => { const r = L.rng(7); px(c, 0, 0, '#d6dcd8', 32, 32); for (let k = 0; k < 40; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(120,130,125,0.25)', 1 + (r() * 2 | 0), 1); for (let i = 0; i < 32; i += 8) { px(c, i, 0, '#8e9894', 1, 32); px(c, 0, i, '#8e9894', 32, 1); } c.fillStyle = 'rgba(110,90,50,0.18)'; for (let k = 0; k < 6; k++) c.fillRect(r() * 32, 24 + r() * 8, 2, 1 + r() * 6); });
  const tTileB = L.cvs(32, 32, (c) => { px(c, 0, 0, '#5a8aa0', 32, 32); for (let i = 0; i < 32; i += 8) { px(c, i, 0, '#2e4a58', 1, 32); px(c, 0, i, '#2e4a58', 32, 1); } });   // franja azul del bano
  const tFloorTile = L.cvs(32, 32, (c) => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, ((x >> 3) + (y >> 3)) % 2 ? '#e2e0d8' : '#2c3036'); px(c, 0, 0, 'rgba(0,0,0,0)', 0, 0); });   // damero blanco/negro
  const tParq = L.cvs(64, 64, (c) => {   // parquet en espiga (ep1)
    const r = L.rng(11);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const dir = (Math.floor((x + 64 - y) / 8)) & 1, plank = dir ? Math.floor((x + y) / 8) : Math.floor((x - y + 64) / 8), t = [0.95, 0.8, 1.08, 0.88, 1.0, 0.75][((plank * 7) % 6 + 6) % 6];
      const seam = ((dir ? (x - y + 64) : (x + y)) % 16 === 0) || ((dir ? x + y : x - y + 64) % 8 === 0), s = (seam ? 0.55 : 1) * t * (0.92 + r() * 0.12);
      px(c, x, y, `rgb(${(132 * s) | 0},${(74 * s) | 0},${(36 * s) | 0})`);
    }
  });
  const tLino = noiseTex(32, 32, [170, 160, 120], 12, 12, (c) => { for (let i = 0; i < 32; i += 16) { px(c, i, 0, '#8a7a50', 1, 32); px(c, 0, i, '#8a7a50', 32, 1); } });
  const tCarpet = noiseTex(32, 32, [92, 54, 50], 16, 13, (c) => { for (let y = 0; y < 32; y += 4) px(c, 0, y, 'rgba(50,20,18,0.4)', 32, 1); });
  const tCarpetB = noiseTex(32, 32, [70, 84, 112], 14, 14);
  const tWood = L.cvs(32, 32, (c) => { const r = L.rng(8); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.8 + Math.sin(y * 0.4) * 2.5) + r() * 7; px(c, x, y, `rgb(${110 + n},${66 + n * 0.6},${34 + n * 0.4})`); } });
  const tGrass = noiseTex(32, 32, [34, 46, 30], 16, 15);
  const tCap = noiseTex(16, 16, [196, 190, 176], 10, 16);   // canto cortado de la pared (yeso)
  const tDoorP = L.cvs(32, 64, (c) => {   // puerta de paneles pintada de crema (bano, pasillo, armario)
    const r = L.rng(17); px(c, 0, 0, '#d8ccb0', 32, 64); for (let k = 0; k < 60; k++) px(c, r() * 32 | 0, r() * 64 | 0, 'rgba(120,100,70,0.25)', 1, 1);
    for (const [x, y, w, h] of [[4, 4, 24, 24], [4, 34, 24, 26]]) { px(c, x, y, '#a89a7c', w, 1); px(c, x, y, '#a89a7c', 1, h); px(c, x, y + h - 1, '#f0e8d4', w, 1); px(c, x + w - 1, y, '#f0e8d4', 1, h); }
    px(c, 0, 62, 'rgba(60,40,20,0.4)', 32, 2);
  });
  const DW = 96, DH = 216;   // la puerta acolchada "13" del ep1 (cuero capitone, tachuelas de laton)
  const tPad = L.cvs(DW, DH, (c) => {
    const Bd = 8, r = L.rng(9);
    for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
      let col; if (x < Bd || x >= DW - Bd || y < Bd || y >= DH - Bd) { const n = r() * 10; col = [70 + n, 40 + n * 0.6, 26]; }
      else { const a = ((x - Bd) / 12 + (y - Bd) / 16) % 1, b = (((x - Bd) / 12 - (y - Bd) / 16) % 1 + 1) % 1, s = Math.min(a, 1 - a) * Math.min(b, 1 - b) * 4, lit = (a < 0.5 ? 0.12 : -0.05) + (b < 0.5 ? 0.1 : -0.04), k = 0.45 + 0.7 * Math.sqrt(s) + lit + r() * 0.06; col = [84 * k, 48 * k, 32 * k]; }
      px(c, x, y, `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`);
    }
    for (let m = -12; m < 24; m++) for (let n = -12; n < 24; n++) { const x = Bd + 6 * (m + n), y = Bd + 8 * (m - n); if (x > Bd + 1 && x < DW - Bd - 1 && y > Bd + 1 && y < DH - Bd - 1) { px(c, x - 1, y - 1, '#2a160c', 3, 3); px(c, x, y, '#e8c060'); } }
    px(c, 40, 54, '#c09848', 16, 11); c.fillStyle = '#3a2a10'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('13', 48, 60);
  });
  const tGlass = L.cvs(32, 32, (c) => { const g = c.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, 'rgba(90,110,140,0.55)'); g.addColorStop(1, 'rgba(60,70,60,0.75)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); const r = L.rng(18); for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(160,150,120,0.5)', 1, 1 + (r() * 4 | 0)); });
  const tPlank = await L.loadTex('tex/plank.png', 128).catch(() => null);
  const tSheet = noiseTex(16, 16, [226, 222, 210], 8, 19);
  const tBlanket = noiseTex(32, 32, [150, 40, 40], 16, 20, (c) => { for (let x = 0; x < 32; x += 8) px(c, x, 0, 'rgba(240,220,160,0.5)', 2, 32); });
  const tCouch = noiseTex(16, 16, [58, 78, 128], 16, 21, (c) => { for (let x = 0; x < 16; x += 4) px(c, x, 0, 'rgba(30,40,70,0.35)', 1, 16); });
  const tRug = L.cvs(32, 32, (c) => { px(c, 0, 0, '#7a2a24', 32, 32); for (let k = 0; k < 4; k++) { c.strokeStyle = ['#d8b060', '#2a3a6a', '#e8d8b0', '#2a3a6a'][k]; c.strokeRect(2 + k * 3 + 0.5, 2 + k * 3 + 0.5, 27 - k * 6, 27 - k * 6); } px(c, 14, 10, '#d8b060', 4, 12); px(c, 10, 14, '#d8b060', 12, 4); });
  const tShelf = noiseTex(16, 16, [120, 96, 70], 10, 22);
  const tBlood = await L.loadTex('tex/blood_drops.png', 96);

  // ================= materiales con repeticion por tamano (UV del cubo 0..1 por cara) =================
  const mc = new Map();
  const rm = (tex, rx, ry, col = 0xffffff, kind = 'lam') => { const k = `${tex.uuid}|${rx.toFixed(1)}|${ry.toFixed(1)}|${col}|${kind}`; if (!mc.has(k)) mc.set(k, (kind === 'lam' ? lam : L.basic)(L.rep(tex, Math.max(0.2, rx), Math.max(0.2, ry)), col)); return mc.get(k); };
  const mCap = lam(tCap, 0xe8e0d0), mDark = lam(null, 0x141416), mWhite = lam(null, 0xf0eee6), mSteel = lam(null, 0xb8bcc0), mBrass = lam(null, 0xd0a850);
  const WP = 0.62, TP = 0.6;   // tamano del dibujo del papel / azulejo (m)
  const SKIN = { liv: tWall, kit: tLino, hall: tWall2, bath: tTile, clo: tWall2, bed: tWall, lau: tTile, out: null };

  // ================= mundo =================
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0f1e); scene.fog = new THREE.Fog(0x0a0f1e, 30, 90);
  const amb = new THREE.AmbientLight(0xffe6c8, 0.75); scene.add(amb);
  const hemi = new THREE.HemisphereLight(0xb0c0e0, 0x403428, 0.7); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.9); sun.position.set(4, 12, 8); scene.add(sun);
  L.plane(200, 200, rm(tGrass, 80, 80, 0x6a7a62), 1, -0.06, 0.5, scene, 0, -Math.PI / 2);
  const WH = 2.6, WT = 0.12;
  // paredes: [eje ('x' = pared a z fija que corre en x | 'z'), fijo, a0, a1, lado-, lado+, huecos [[centro, ancho, y0, y1, id]]]
  const DOOR = (c, w, id) => [c, w, 0, 2.05, id], WIN = (c, w, id) => [c, w, 0.9, 2.0, id];
  const WALLS = [
    ['x', -4, -5, 7, 'out', 'kit', [WIN(-2.5, 1.1, 'wK'), WIN(5.6, 1.1, 'wB1')]],
    ['x', 5, -5, 7, 'liv', 'out', [WIN(-3.6, 1.1, 'W3'), DOOR(-1.4, 0.9, 'D1'), WIN(5.6, 1.1, 'wB2')]],
    ['z', -5, -4, 5, 'out', 'liv', [WIN(-1.7, 1.1, 'wK2'), WIN(1.8, 1.1, 'W1'), WIN(3.8, 1.1, 'W2')]],
    ['z', 7, -4, 5, 'bed', 'out', [WIN(-1.5, 1.1, 'wB3'), WIN(2.5, 1.1, 'wB4')]],
    ['x', 0.6, -5, 0, 'kit', 'liv', []],
    ['z', 0, -4, 5, 'liv', 'hall', [DOOR(2.6, 0.9, 'D2'), DOOR(-1.5, 0.9, 'dK')]],
    ['z', 1.5, -4, 5, 'hall', 'bath', [DOOR(-2.6, 0.8, 'dL'), DOOR(0.5, 0.9, 'BD'), DOOR(3.6, 0.8, 'dC')]],
    ['z', 4.3, -4, 5, 'bath', 'bed', [DOOR(3.6, 0.8, 'dBed')]],
    ['x', -1.2, 1.5, 4.3, 'lau', 'bath', []],
    ['x', 2.2, 1.5, 4.3, 'bath', 'clo', []],
    ['x', 4.95, 0, 1.5, 'hall', 'hall', []], ['x', -3.95, 0, 1.5, 'hall', 'hall', []],
    // armario de ropa blanca DENTRO del bano: x [3.4, 4.3], z [-1.2, -0.5], puerta en su cara sur (z = -0.5)
    ['z', 3.4, -1.2, -0.5, 'bath', 'bath', []], ['x', -0.5, 3.4, 4.3, 'bath', 'bath', [DOOR(3.85, 0.62, 'CD')]],
  ];
  // lado por tramo: los costados de cada tramo dicen de que cuarto es (papel / azulejo) segun la coordenada
  const sideOf = (axis, fixed, a, s) => {
    if (s === 'bath' && axis === 'z' && fixed === 1.5 && (a < -1.2 || a > 2.2)) return a < -1.2 ? 'lau' : 'clo';
    if (s === 'bath' && axis === 'z' && fixed === 4.3 && a > 2.2) return 'clo';
    if (s === 'bath' && axis === 'z' && fixed === 4.3 && a < -1.2) return 'lau';
    if (s === 'out' && axis === 'x' && fixed === -4 && a > 0) return a < 1.5 ? 'hall' : a < 4.3 ? 'lau' : 'bed';
    if (s === 'kit' && axis === 'x' && fixed === -4 && a > 0) return a < 1.5 ? 'hall' : a < 4.3 ? 'lau' : 'bed';
    if (s === 'liv' && axis === 'x' && fixed === 5 && a > 0) return a < 1.5 ? 'hall' : a < 4.3 ? 'clo' : 'bed';
    if (s === 'liv' && axis === 'z' && fixed === 0 && a < 0.6) return 'kit';
    if (s === 'out' && axis === 'z' && fixed === -5) return 'out';
    if (s === 'liv' && axis === 'z' && fixed === -5 && a < 0.6) return 'kit';
    return s;
  };
  const wallMat = (room, len, h, a0) => {
    const tx = SKIN[room]; if (!tx) return lam(null, 0x8a8478);
    const per = room === 'bath' || room === 'lau' ? TP : WP; return rm(tx, len / per, h / per);
  };
  const wallGroup = new THREE.Group(); scene.add(wallGroup);
  const segs = [];
  const seg = (axis, fixed, a0, a1, y0, y1, sN, sP) => {
    const len = a1 - a0, h = y1 - y0; if (len < 0.01 || h < 0.01) return;
    const mid = (a0 + a1) / 2, rN = sideOf(axis, fixed, mid, sN), rP = sideOf(axis, fixed, mid, sP);
    const mN = wallMat(rN, len, h), mP = wallMat(rP, len, h);
    // orden de caras de BoxGeometry: +x -x +y -y +z -z
    const m = axis === 'x' ? [mCap, mCap, mCap, mCap, mP, mN] : [mP, mN, mCap, mCap, mCap, mCap];
    const o = axis === 'x' ? B(len, h, WT, m, mid, (y0 + y1) / 2, fixed, wallGroup) : B(WT, h, len, m, fixed, (y0 + y1) / 2, mid, wallGroup);
    segs.push(o); return o;
  };
  const holes = {};
  for (const [axis, fixed, a0, a1, sN, sP, hs] of WALLS) {
    const H2 = [...hs].sort((p, q) => p[0] - q[0]); let a = a0;
    for (const [c, w, y0, y1, id] of H2) {
      seg(axis, fixed, a, c - w / 2, 0, WH, sN, sP);
      if (y0 > 0) seg(axis, fixed, c - w / 2, c + w / 2, 0, y0, sN, sP);
      seg(axis, fixed, c - w / 2, c + w / 2, y1, WH, sN, sP);
      holes[id] = { axis, fixed, c, w, y0, y1 }; a = c + w / 2;
    }
    seg(axis, fixed, a, a1, 0, WH, sN, sP);
  }
  // zocalos de madera oscura en los cuartos con papel
  // suelos por cuarto
  const ROOMS = { LIVING: [-5, 0, 0.6, 5, tParq, 0.9], KITCHEN: [-5, 0, -4, 0.6, tLino, 0.6], HALL: [0, 1.5, -4, 5, tCarpet, 0.7], BATH: [1.5, 4.3, -1.2, 2.2, tFloorTile, 0.5],
    CLOSET: [1.5, 4.3, 2.2, 5, tWood, 0.8], LAUNDRY: [1.5, 4.3, -4, -1.2, tLino, 0.6], BEDROOM: [4.3, 7, -4, 5, tCarpetB, 0.8] };
  const floors = {};
  for (const [n, [x0, x1, z0, z1, tx, s]] of Object.entries(ROOMS)) { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil((x1 - x0) / 0.4), Math.ceil((z1 - z0) / 0.4)); floors[n] = L.mesh(g, rm(tx, (x1 - x0) / s, (z1 - z0) / s), (x0 + x1) / 2, 0.001, (z0 + z1) / 2, scene); floors[n].rotation.x = -Math.PI / 2; }   // suelo subdividido: con el snap PS1 un quad grande que cruza el plano cercano desaparecia (parpadeo)
  // techo del bano y del pasillo (solo en los planos de adentro; en el corte no hay techo)
  const ceilings = [L.plane(2.8, 3.4, lam(null, 0xe0dcd0), 2.9, WH, 0.5, scene, 0, Math.PI / 2), L.plane(1.5, 9, lam(null, 0xd8d4c8), 0.75, WH, 0.5, scene, 0, Math.PI / 2), L.plane(5, 4.4, lam(null, 0xd8d4c8), -2.5, WH, 2.8, scene, 0, Math.PI / 2)];
  // franja de azulejo azul en el bano (a 1,2 m) y zocalos
  for (const [x0, x1, z, ry] of [[1.56, 4.24, -1.13, 0], [1.56, 3.34, 2.13, Math.PI]]) L.plane(x1 - x0, 0.12, rm(tTileB, (x1 - x0) / 0.3, 0.4), (x0 + x1) / 2, 1.2, z, scene, ry);

  // ================= ventanas (marco blanco de madera, vidrio sucio, alfeizar) + destello rojo =================
  const mFrame = lam(null, 0xe8e4da), mSill = lam(tWood, 0xd8c8b0);
  const flashes = {};
  const mkFlash = (id, w, h) => { const m = L.basic(null, 0xff2010, { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }); m.blending = THREE.AdditiveBlending; flashes[id] = m; return m; };
  const winGroups = {};
  for (const [id, hl] of Object.entries(holes)) {
    const { axis, fixed, c, w, y0, y1 } = hl; const g = new THREE.Group(); scene.add(g); winGroups[id] = g;
    if (axis === 'x') g.position.set(c, 0, fixed); else { g.position.set(fixed, 0, c); g.rotation.y = Math.PI / 2; }
    const h = y1 - y0, ym = (y0 + y1) / 2;
    if (y0 > 0) {   // ventana: marco + parteluz + vidrio + alfeizar
      B(w, 0.06, WT + 0.02, mFrame, 0, y0 + 0.03, 0, g); B(w, 0.06, WT + 0.02, mFrame, 0, y1 - 0.03, 0, g); B(0.06, h, WT + 0.02, mFrame, -w / 2 + 0.03, ym, 0, g); B(0.06, h, WT + 0.02, mFrame, w / 2 - 0.03, ym, 0, g);
      B(0.04, h, 0.05, mFrame, 0, ym, 0, g); B(w, 0.04, 0.05, mFrame, 0, y0 + h * 0.62, 0, g);
      L.plane(w - 0.08, h - 0.08, L.basic(tGlass, 0xffffff, { transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }), 0, ym, 0, g);
      B(w + 0.16, 0.04, 0.2, mSill, 0, y0 - 0.02, 0, g);
    } else {   // marco de puerta (contramarco de madera)
      B(0.08, 2.12, WT + 0.04, lam(tWood, 0xc89870), -w / 2 - 0.04, 1.06, 0, g); B(0.08, 2.12, WT + 0.04, lam(tWood, 0xc89870), w / 2 + 0.04, 1.06, 0, g); B(w + 0.16, 0.08, WT + 0.04, lam(tWood, 0xc89870), 0, 2.09, 0, g);
    }
    const f = L.plane(w, h, mkFlash(id), 0, ym, 0.0, g); f.renderOrder = 5;
    const f2 = L.plane(w + 0.3, 0.06, mkFlash(id + '_t'), 0, WH + 0.02, 0, g, 0, -Math.PI / 2); f2.material = flashes[id]; f2.scale.set(1, 3, 1);   // el canto de arriba tambien se tine (visible desde la grua)
  }
  // reflejo rojo en el piso, delante de cada hueco del living (el destello se lee desde la grua del plano 02)
  for (const [id, dx, dz] of [['W1', 0.5, 0], ['W2', 0.5, 0], ['W3', 0, -0.5], ['D1', 0, -0.5], ['D2', -0.5, 0]]) {
    const hl = holes[id], x = hl.axis === 'x' ? hl.c : hl.fixed, z = hl.axis === 'x' ? hl.fixed : hl.c;
    const gl = L.plane(hl.axis === 'x' ? hl.w + 0.2 : 0.9, hl.axis === 'x' ? 0.9 : hl.w + 0.2, flashes[id], x + dx, 0.02, z + dz, scene, 0, -Math.PI / 2); gl.renderOrder = 6;
    for (const s2 of [-1, 1]) { const fr = hl.axis === 'x' ? B(0.07, hl.y1 - hl.y0 + 0.1, 0.16, flashes[id], hl.c + s2 * (hl.w / 2 + 0.04), (hl.y0 + hl.y1) / 2, hl.fixed, scene) : B(0.16, hl.y1 - hl.y0 + 0.1, 0.07, flashes[id], hl.fixed, (hl.y0 + hl.y1) / 2, hl.c + s2 * (hl.w / 2 + 0.04), scene); fr.renderOrder = 6; }
  }
  // hojas de puerta (pivote en la bisagra, lado -w/2)
  const leaves = {};
  const leaf = (id, tex, open = 0) => {
    const hl = holes[id], g = new THREE.Group(); winGroups[id].add(g); g.position.set(-hl.w / 2, 0, 0);
    const mF = tex === 'pad' ? lam(tPad) : lam(tDoorP), mE = lam(null, tex === 'pad' ? 0x3a2016 : 0xb8ac90);
    const lf = B(hl.w, 2.04, 0.045, [mE, mE, mE, mE, mF, mF], hl.w / 2, 1.02, 0, g);
    const hdl = new THREE.Group(); g.add(hdl); hdl.position.set(hl.w - 0.09, 0.98, 0);
    for (const s of [1, -1]) { B(0.04, 0.12, 0.01, mSteel, 0, 0, s * 0.028, hdl); B(0.11, 0.02, 0.02, mSteel, -0.05, 0.02, s * 0.05, hdl); B(0.02, 0.02, 0.04, mSteel, 0, 0.02, s * 0.035, hdl); }
    leaves[id] = { g, lf, hdl, open }; g.rotation.y = open; return leaves[id];
  };
  leaf('D1', 'pad'); leaf('D2', 'p'); leaf('BD', 'p'); leaf('CD', 'p'); leaf('dL', 'p', -1.2); leaf('dC', 'p', -1.3); leaf('dBed', 'p', 1.2); leaf('dK', 'p', 1.4);
  // bisagras y cerradero de la puerta del bano (planos 05)
  const bd = holes.BD; const strike = B(0.004, 0.16, 0.028, mBrass, 0, 0, 0, scene);   // se ubica abajo (lado de la manija, canto del marco)

  // ================= muebles =================
  const furn = new THREE.Group(); scene.add(furn);
  const place = async (n, x, z, ry = 0, s = 1, y = 0, parent = furn) => { const o = await prop(n); o.position.set(x, y, z); o.rotation.y = ry; o.scale.multiplyScalar(s); parent.add(o); return o; };
  // living: sofa azul del ep1, alfombra, tele CRT, lampara, cuadro
  { const mC = lam(tCouch), g = new THREE.Group(); furn.add(g); g.position.set(-3.0, 0, 1.15);
    B(2.0, 0.42, 0.85, mC, 0, 0.21, 0, g); B(2.0, 0.5, 0.2, mC, 0, 0.66, -0.33, g); B(0.18, 0.62, 0.85, mC, -1.0, 0.31, 0, g); B(0.18, 0.62, 0.85, mC, 1.0, 0.31, 0, g);
    for (const x of [-0.5, 0.5]) B(0.95, 0.12, 0.7, lam(tCouch, 0xd0d8ff), x, 0.48, 0.05, g);
    L.plane(2.6, 1.8, lam(tRug), -2.6, 0.006, 3.0, furn, 0, -Math.PI / 2);
    B(1.1, 0.5, 0.45, lam(tWood), -2.6, 0.25, 4.65, furn); await place('crt', -2.6, 4.65, Math.PI, 1, 0.5);
    await place('table_lamp', -4.55, 1.0, 0, 1, 0); await place('side_table', -0.6, 4.4, Math.PI, 1);
    await place('painting_a', -4.93, 2.8, Math.PI / 2, 1, 1.5); }
  // cocina: encimera, heladera, mesa
  { B(3.6, 0.9, 0.6, lam(tShelf, 0xe8dcc0), -3.0, 0.45, -3.65, furn); B(3.6, 0.04, 0.64, lam(null, 0x9a9488), -3.0, 0.92, -3.65, furn); B(3.6, 0.6, 0.35, lam(tShelf, 0xe8dcc0), -3.0, 1.9, -3.8, furn);
    await place('fridge', -0.65, -3.55, 0, 1); B(1.2, 0.05, 0.8, lam(tWood), -2.6, 0.75, -1.4, furn); for (const [x, z] of [[-3.1, -1.75], [-2.1, -1.05], [-3.1, -1.05], [-2.1, -1.75]]) B(0.05, 0.75, 0.05, lam(tWood), x, 0.375, z, furn);
    await place('cans_stack', -3.8, -3.6, 0, 1, 0.94); }
  // bano (cuarto seguro): banera, lavabo con espejo, inodoro, toallero
  const tub = await place('bathtub', 2.35, 1.78, Math.PI, 1);
  { B(0.55, 0.85, 0.45, lam(null, 0xe8e6e0), 2.1, 0.425, -0.95, furn); B(0.5, 0.06, 0.42, mWhite, 2.1, 0.86, -0.95, furn); B(0.5, 0.6, 0.02, L.basic(null, 0x8a9aa8), 2.1, 1.6, -1.13, furn);
    B(0.56, 0.66, 0.03, lam(tWood, 0xb08860), 2.1, 1.6, -1.15, furn); B(0.4, 0.4, 0.55, mWhite, 2.9, 0.2, -0.9, furn); B(0.42, 0.45, 0.18, mWhite, 2.9, 0.62, -1.1, furn);
    B(0.6, 0.02, 0.02, mSteel, 1.6, 1.1, 0.0, furn); }
  // vestidor: estantes con ropa; lavadero: lavarropas; dormitorio: cama + comoda
  { for (const z of [2.45, 4.75]) for (const y of [0.4, 1.0, 1.6]) { B(2.4, 0.03, 0.4, lam(tShelf), 2.9, y, z, furn); for (let k = 0; k < 5; k++) B(0.36, 0.22, 0.32, lam(null, [0x4a6a9a, 0xa04040, 0xd8d0b8, 0x3a5a3a, 0x7a6a9a][(k + y * 3) % 5 | 0]), 1.95 + k * 0.48, y + 0.13, z, furn); }
    B(0.6, 0.85, 0.6, mWhite, 2.2, 0.425, -3.6, furn); B(0.6, 0.85, 0.6, mWhite, 2.9, 0.425, -3.6, furn); B(0.28, 0.28, 0.02, lam(null, 0x2a3a4a), 2.2, 0.55, -3.29, furn);
    B(1.6, 0.45, 2.1, lam(tSheet), 5.7, 0.225, -2.6, furn); B(1.64, 0.1, 1.5, lam(tBlanket), 5.7, 0.5, -2.3, furn); B(1.6, 0.9, 0.08, lam(tWood), 5.7, 0.45, -3.66, furn);
    await place('dresser', 6.7, 2.0, -Math.PI / 2, 1); }
  // tablones apoyados (la barricada de las ventanas del ep2) en el bano: uno con el clavo que corta la mano
  const mPlank = tPlank ? lam(tPlank) : lam(tWood);
  const plankG = new THREE.Group(); scene.add(plankG); plankG.position.set(4.18, 0, 1.75); plankG.rotation.set(0, 0, 0.22);
  B(0.03, 1.4, 0.12, mPlank, 0, 0.7, 0, plankG); B(0.03, 1.3, 0.12, mPlank, -0.04, 0.65, -0.16, plankG);
  const nail = L.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.07, 4), mSteel, -0.03, 0.62, 0.02, plankG); nail.rotation.z = Math.PI / 2;

  // ================= W1 = la ventana del ep2: tablones clavados + zombi detras (thin-zombie) =================
  const w1 = winGroups.W1; const boards = [];
  for (const [y, rz] of [[1.15, 0.12], [1.5, -0.1], [1.82, 0.06]]) { const b = B(1.3, 0.12, 0.025, mPlank, 0, y, 0.09, w1); b.rotation.z = rz; boards.push(b); }
  window.__fx.renderer.localClippingEnabled = true;
  const zg = await L.loadModel('models/thin-zombie.glb'); const zr = L.ps1Clone(zg.scene);
  { const t = await L.loadTex('tex/thin_zombie.png', 256); t.flipY = false; t.needsUpdate = true; zr.traverse((o) => { if (o.isMesh) { o.material.map = t; o.material.color.set(0xffffff); o.material.needsUpdate = true; } }); }
  const zPlane = new THREE.Plane(V(-1, 0, 0), -5.08); zr.traverse((o) => { if (o.isMesh) o.material.clippingPlanes = [zPlane]; });
  const zW = new THREE.Group(); zW.add(zr); scene.add(zW); zr.updateMatrixWorld(true);
  { const bb = new THREE.Box3().setFromObject(zr), k = 1.8 / (bb.max.y - bb.min.y); zr.scale.multiplyScalar(k); zr.position.y = -bb.min.y * k; }
  zW.position.set(-5.42, 0, 1.8); zW.rotation.y = Math.PI / 2;   // mira hacia +x (hacia la casa)
  const zMix = new THREE.AnimationMixer(zr); const zAtt = zMix.clipAction(THREE.AnimationClip.findByName(zg.animations, 'attack2')); zAtt.play();
  let zHip = null; zr.traverse((o) => { if (!zHip && o.isSkinnedMesh) zHip = o.skeleton.bones[0]; }); const zHip0 = zHip.position.clone();
  const poseZ = (t) => { zAtt.time = t % zAtt.getClip().duration; zMix.update(0); zHip.position.copy(zHip0); };
  const zLight = new THREE.PointLight(0x9ab0ff, 4, 4, 1.5); zLight.position.set(-6.0, 2.2, 1.8); scene.add(zLight);

  // ================= zombis afuera en la grua de apertura: empujan y golpean puertas y ventanas =================
  const ZOUT = [];
  const mkZ = async (name, tex, h, clip, x, z, ry, phase) => {
    const g = await L.loadModel(`models/${name}.glb`), r = L.ps1Clone(g.scene);
    if (tex) { const tt = await L.loadTex(tex, 256); tt.flipY = false; tt.needsUpdate = true; r.traverse((o) => { if (o.isMesh) { o.material.map = tt; o.material.color.set(0xffffff); o.material.needsUpdate = true; } }); }
    const w = new THREE.Group(); w.add(r); scene.add(w); r.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(r), k = h / (bb.max.y - bb.min.y); r.scale.multiplyScalar(k); r.position.y = -bb.min.y * k;
    w.position.set(x, 0, z); w.rotation.y = ry; const mx = new THREE.AnimationMixer(r), act = mx.clipAction(THREE.AnimationClip.findByName(g.animations, clip)); act.play();
    let hip = null; r.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; }); const hip0 = hip.position.clone();
    const z1 = { w, pose(t) { act.time = ((t + phase) % act.getClip().duration + act.getClip().duration) % act.getClip().duration; mx.update(0); hip.position.copy(hip0); } }; w.visible = false; ZOUT.push(z1); return z1;
  };
  // puerta de entrada D1 (sur, x -1.4): dos golpeando; ventana W3; ventanas W2 (oeste), cocina (norte) y dormitorio (este)
  await mkZ('thin-zombie', 'tex/thin_zombie.png', 1.78, 'attack2', -1.55, 5.42, Math.PI, 0.30 - 0.5);
  await mkZ('city-zombie', null, 1.8, 'Zombie_Attack', -1.05, 5.55, Math.PI + 0.25, 0.4);
  await mkZ('thin-zombie', 'tex/thin_zombie.png', 1.76, 'attack1_r', -3.6, 5.45, Math.PI, 0.7);
  await mkZ('city-zombie', null, 1.82, 'Zombie_Attack2', -5.45, 3.8, Math.PI / 2, 0.2);
  await mkZ('thin-zombie', 'tex/thin_zombie.png', 1.8, 'attack1_l', -2.5, -4.45, 0, 1.1);
  await mkZ('city-zombie', null, 1.78, 'Zombie_Attack', 7.45, 2.5, -Math.PI / 2, 0.9);
  await mkZ('thin-zombie', 'tex/thin_zombie.png', 1.77, 'attack2', 7.45, -1.5, -Math.PI / 2, 0.55);
  // ================= props de la historia =================
  const chest = await place('chest', 3.92, 0.75, -Math.PI / 2, 1, 0, scene); const chLid = chest.getObjectByName('chest_lid');
  const kit = await prop('kit'); scene.add(kit); kit.position.set(3.55, 0, 1.45); kit.rotation.y = -2.3; const kitLid = kit.getObjectByName('kit_lid');
  const spray = makeSpray(L), bandage = await prop('bandage'); scene.add(spray, bandage);
  const radio = await prop('radio'), water = await prop('water'), flash = await prop('flashlight'), can = await prop('can'), charger = await prop('charger');
  { const tg = [[water, 3.62, 0.52, 0], [radio, 3.4, 0.95, -1.4], [flash, 3.55, 1.15, 0.3], [can, 3.3, 0.6, 0], [charger, 3.25, 0.82, 0.2]]; for (const [o, x, z, r] of tg) { o.position.set(x, 0, z); o.rotation.y = r; scene.add(o); } }
  const loose = [water, radio, flash, can, charger];
  // taladro amarillo (codigo) y barra 2x4
  // taladro del ep2 (pieces/zombie-02-window/engine/sets/room.js makeDrill): origen = punto de agarre, mango en +Y, broca hacia +Z
  const tDrill = L.cvs(32, 16, (c, w, h) => { px(c, 0, 0, '#e8b818', w, h); px(c, 0, 0, '#f8d040', w, 3); px(c, 0, h - 3, '#a88010', w, 3); for (let x = 4; x < 12; x += 2) px(c, x, 5, '#2a2a2a', 1, 5); px(c, 16, 6, '#1a1a1a', 12, 4); px(c, 17, 7, '#e8e8e0', 3, 2); px(c, 21, 7, '#e8e8e0', 2, 2); px(c, 24, 7, '#e8e8e0', 3, 2); });
  const cylD = (rt, rb, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(rt, rb, h, n), m, x, y, z, p);
  function makeDrill() { const g = new THREE.Group(), mY = lam(tDrill), mB = lam(null, 0x1c1c1e);
    const grip = B(0.038, 0.12, 0.05, mB, 0, -0.005, 0, g); grip.rotation.x = 0.15; B(0.06, 0.09, 0.2, mY, 0, 0.1, 0.03, g); B(0.05, 0.06, 0.05, mB, 0, 0.1, -0.08, g);
    B(0.07, 0.05, 0.1, mB, 0, -0.09, 0.012, g); B(0.072, 0.012, 0.102, lam(null, 0xe8b818), 0, -0.065, 0.012, g); B(0.012, 0.022, 0.018, lam(null, 0xd03020), 0, 0.045, 0.032, g);
    const chk = new THREE.Group(); chk.position.set(0, 0.1, 0.13); g.add(chk); cylD(0.022, 0.016, 0.05, 8, mB, 0, 0, 0.025, chk).rotation.x = Math.PI / 2; cylD(0.013, 0.01, 0.03, 6, mSteel, 0, 0, 0.065, chk).rotation.x = Math.PI / 2;
    cylD(0.004, 0.004, 0.07, 5, lam(null, 0xd8dce0), 0, 0, 0.11, chk).rotation.x = Math.PI / 2; return { g, chuck: chk, tipLocal: V(0, 0.1, 0.13 + 0.145) }; }
  const DR = makeDrill(), drill = DR.g;
  const bar = B(0.045, 1.25, 0.09, lam(tWood, 0xd8b080), 0, 0, 0, scene);
  const screw = new THREE.Group(); { const th = L.cvs(4, 16, (c) => { for (let y = 0; y < 16; y++) px(c, 0, y, y % 2 ? '#8a8e94' : '#d8dce0', 4, 1); }); L.mesh(new THREE.CylinderGeometry(0.0035, 0.002, 0.076, 6), lam(th), 0, 0, 0, screw); L.mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.003, 8), mSteel, 0, 0.038, 0, screw); }
  scene.add(screw);
  const bitL = L.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.4, 4), mSteel, 0, -9, 0, scene); bitL.visible = false;
  const studG = B(0.089, 2.4, 0.038, L.basic(null, 0x6aff5a, { transparent: true, opacity: 0.2, depthWrite: false, depthTest: false }), holes.BD.fixed, 1.2, holes.BD.c - holes.BD.w / 2 - 0.07, scene); studG.visible = false; studG.renderOrder = 4;   // 2x4 real (1.5 x 3.5 in) detras del marco
  const studE = new THREE.LineSegments(new THREE.EdgesGeometry(studG.geometry), new THREE.LineBasicMaterial({ color: 0x8cff5a, transparent: true, depthTest: false })); studG.add(studE); studE.renderOrder = 5;
  const bloodDecal = L.plane(0.32, 0.22, L.basic(tBlood, 0xffffff, { transparent: true, depthWrite: false }), 3.45, 0.004, 1.0, scene, 0, -Math.PI / 2); bloodDecal.renderOrder = 3;
  const handBlood = new THREE.Sprite(new THREE.SpriteMaterial({ map: tBlood, transparent: true, depthWrite: false, depthTest: false })); handBlood.visible = false; scene.add(handBlood);
  const mist = []; { const m = L.basic(null, 0xe8f4ff, { transparent: true, opacity: 0.7, depthWrite: false }); for (let i = 0; i < 18; i++) mist.push(B(0.012, 0.012, 0.012, m, 0, -9, 0, scene)); }
  const drops = []; { const m = new THREE.SpriteMaterial({ map: tBlood, transparent: true, depthWrite: false }); for (let i = 0; i < 4; i++) { const sp = new THREE.Sprite(m); sp.scale.set(0.06, 0.045, 1); sp.position.y = -9; scene.add(sp); drops.push(sp); } }
  const wrap = L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 8, 1, true), lam(L.rep(tSheet, 2, 1), 0xf4f0e4, { side: THREE.DoubleSide }), 0, -9, 0, scene);

  // luces de los cuartos (calidas) + luz del bano
  const bathL = new THREE.PointLight(0xfff0d0, 6, 6, 1.4); bathL.position.set(2.9, 2.4, 0.4); scene.add(bathL);
  const hallL = new THREE.PointLight(0xffe0b0, 4, 6, 1.4); hallL.position.set(0.75, 2.4, 1.5); scene.add(hallL);
  const livL = new THREE.PointLight(0xffd8a0, 6, 8, 1.3); livL.position.set(-2.5, 2.4, 2.8); scene.add(livL);

  // ================= Ava =================
  const ch = L.hero(); scene.add(ch.root);
  // cara 'scared' (celda 13 de ojos: ojos muy abiertos de reojo + cejas de preocupacion) — copia del trabajo del atlas del ep5.
  // Solo el atlas de la cara: el modelo y el resto de las texturas de Ava NO se tocan (regla del usuario, ep5).
  ch.root.traverse((o) => {
    if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m.map || m.map.userData.v3 || m.name !== 'face_eyes') return;
      const im = m.map.image, W2 = im.width, H2 = im.height, k = W2 / 2048, ky = H2 / 128, cell = 128 * k;
      const cv = document.createElement('canvas'); cv.width = W2; cv.height = H2; const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
      const SRC = 9 * cell, C13 = 13 * cell;
      const st = document.createElement('canvas'); st.width = Math.round(64 * k); st.height = H2; const s2 = st.getContext('2d', { willReadFrequently: true });
      s2.drawImage(cv, SRC + 86 * k, 0, 42 * k, H2, 0, 0, 42 * k, H2); s2.drawImage(cv, SRC, 0, 22 * k, H2, 42 * k, 0, 22 * k, H2);
      const DX = -2.5;
      for (const cx of [16, 47]) {
        const x0 = Math.round((cx - 10) * k), y0 = Math.round(76 * ky), w = Math.round(20 * k), h = Math.round(13 * ky);
        const d = s2.getImageData(x0, y0, w, h), P = d.data, lum = (i) => (P[i] + P[i + 1] + P[i + 2]) / 3;
        let sx = 0, sy = 0, n = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (lum(i) > 190 && Math.abs(P[i] - P[i + 2]) < 40) { sx += x; sy += y; n++; } }
        if (!n) continue; const ex = sx / n, ey = sy / n, rx = 5.5 * k, ry = 3.6 * ky;
        const pup = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (((x - ex) / rx) ** 2 + ((y - ey) / ry) ** 2 < 1 && lum(i) < 110) pup.push([x, y, P[i], P[i + 1], P[i + 2]]); }
        for (const [x, y] of pup) { const i = (y * w + x) * 4; P[i] = 236; P[i + 1] = 232; P[i + 2] = 228; }
        for (const [x, y, r, g, b] of pup) { const xx = Math.round(x + DX * k); if (xx < 0 || xx >= w || ((xx - ex) / (rx * 1.15)) ** 2 + ((y - ey) / ry) ** 2 >= 1) continue; const i = (y * w + xx) * 4; P[i] = r; P[i + 1] = g; P[i + 2] = b; }
        s2.putImageData(d, x0, y0);
      }
      s2.strokeStyle = '#4a2c18'; s2.lineWidth = 1.6 * k; s2.lineCap = 'round';
      for (const [cx, inner] of [[16, 1], [47, -1]]) { s2.beginPath(); s2.moveTo((cx - 7 * inner) * k, 92 * ky); s2.lineTo((cx + 6 * inner) * k, 95.5 * ky); s2.stroke(); }
      c.drawImage(cv, SRC, 0, cell, H2, C13, 0, cell, H2);
      c.clearRect(C13 + 86 * k, 0, 42 * k, H2); c.drawImage(st, 0, 0, 42 * k, H2, C13 + 86 * k, 0, 42 * k, H2);
      c.clearRect(C13, 0, 22 * k, H2); c.drawImage(st, 42 * k, 0, 22 * k, H2, C13, 0, 22 * k, H2);
      m.map.image = cv; m.map.userData.v3 = 1; m.map.needsUpdate = true;
    });
  });
  const AVA = (x, z, yaw) => { ch.root.position.set(x, 0, z); ch.root.rotation.y = yaw; };
  { const palmOf = (side, d = 0.78) => ch.hand(side).localToWorld(V(0, d, 0)), basis = (x, y, z) => new THREE.Matrix4().makeBasis(x, y, z);
    ch.root.position.set(0, 0, 0); ch.root.rotation.y = Math.PI; ch.pose(0, L.still('drill', 0)); ch.root.updateMatrixWorld(true);
    const p = palmOf('R'), mW = basis(V(-1, 0, 0), V(0, 1, 0), V(0, 0, -1)).setPosition(p); ch.hand('R').add(drill); ch.hand('R').matrixWorld.clone().invert().multiply(mW).decompose(drill.position, drill.quaternion, drill.scale);
    drill.updateMatrixWorld(true); var DRILL_TIP0 = drill.localToWorld(DR.tipLocal.clone()); drill.visible = false; }   // punta con Ava en el origen mirando a -z
  const handW = (side) => ch.hand(side).getWorldPosition(V());
  // prop en la mano: sigue al hueso cada cuadro (posicion/rotacion en mundo)
  const inHand = (o, side, off = [0, 0, 0], rot = [0, 0, 0]) => { const h = ch.hand(side); ch.root.updateMatrixWorld(true); const q = new THREE.Quaternion(); h.getWorldQuaternion(q);
    o.position.copy(h.localToWorld(V(...off).divideScalar(L.S))); o.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot))); o.visible = true; };

  // ================= estado =================
  const LOOSE0 = loose.map((o) => o.position.clone());
  const state = ({ cut = 0, ceil = false, flashK = {}, lid = 0, packed = 0, kitOpen = 0, bloodK = 0, barOn = false, drillOn = false, screwK = -1, sprayOn = false, wrapK = 0, closet = 0, boardShake = 0, zOn = false } = {}) => {
    ceilings.forEach((c) => { c.visible = ceil; });
    for (const [id, m] of Object.entries(flashes)) m.opacity = flashK[id.replace(/_t$/, '')] ?? 0;
    chLid.rotation.x = -1.75 * lid; kitLid.rotation.x = -1.9 * kitOpen;
    loose.forEach((o, i) => { o.visible = i >= packed; o.position.copy(LOOSE0[i]); });
    bloodDecal.material.opacity = bloodK; bloodDecal.visible = bloodK > 0;
    bar.visible = barOn; drill.visible = drillOn; screw.visible = screwK >= 0; spray.visible = sprayOn; bandage.visible = false; wrap.visible = wrapK > 0;
    handBlood.visible = false; bitL.visible = false; leaves.BD.g.visible = true; studG.visible = false; mist.forEach((m) => { m.position.y = -9; }); drops.forEach((m) => { m.position.y = -9; });
    leaves.CD.g.rotation.set(0, 0, 0); leaves.CD.g.position.set(-holes.CD.w / 2, 0, 0); leaves.CD.hdl.rotation.set(0, 0, 0);
    if (closet) { leaves.CD.g.rotation.y = closet; }
    w1.position.set(holes.W1.fixed, 0, holes.W1.c); w1.rotation.set(0, Math.PI / 2, 0);
    if (boardShake) { w1.position.x += 0.01 * boardShake; boards.forEach((b, i) => { b.position.z = 0.09 + 0.012 * boardShake * (i % 2 ? 1 : -1); }); }
    zW.visible = zOn; zLight.intensity = zOn ? 4 : 0; ZOUT.forEach((z) => { z.w.visible = false; });
    ch.root.visible = true;
  };
  const out = {};
  const hitK = (t, hits, dur = 0.22) => { let k = 0; for (const h of hits) { const d = t - h; if (d >= 0 && d < dur) k = Math.max(k, (1 - d / dur) * Math.cos(d * 60)); } return k; };

  // RE map labels (cuartos) sobre la grua y el plano
  const ROOMLAB = { LIVING: [-3.7, 4.0], KITCHEN: [-2.5, -1.7], BATH: [2.9, 0.4], CLOSET: [2.9, 3.6], LAUNDRY: [2.9, -2.6], BEDROOM: [5.65, 0.5], HALL: [0.75, 0.0] };
  const roomLabels = (o, c, k, only = null, cols = {}) => { for (const [n, [x, z]] of Object.entries(ROOMLAB)) { if (only && !only.includes(n)) continue; const [sx, sy] = L.toScreen(c, x, 0.3, z); if (sx < -40 || sx > LW + 40) continue; o.tctx.globalAlpha = k; bitText(o.tctx, n, sx, sy, n === 'HALL' ? 1 : 2, cols[n] || '#f0f0e8', { outline: '#000000' }); o.tctx.globalAlpha = 1; } };

  // ---------- 01 (0-4.05) grua sobre la casa en corte, Ava en el pasillo mirando a camara; carteles de cuarto en "house" ----------
  { const c = cam(50), D = T['02_living'];
    out['01_crane'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = lt; roomLabels(o, c, ease(W.house - 0.3, W.house + 0.2, t) * (1 - ease(W.one - 0.1, W.one + 0.4, t) * 0.6), ['LIVING', 'KITCHEN', 'BATH', 'CLOSET']); },
      update(lt) {
        state({ zOn: true }); AVA(0.75, 1.2, 0.25); poseZ(0.3 + lt); ZOUT.forEach((z) => { z.w.visible = true; z.pose(lt); });
        { const k = hitK(lt, W.crane_hits, 0.22); const d1 = leaves.D1; d1.g.rotation.y = 0.04 * Math.abs(k); d1.hdl.rotation.z = 0.3 * k; }   // solo la puerta de entrada cede y rebota
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('think', W.one - 0.6, { fade: 0.3 })], [[-99, 'open', 'neutral'], [W.house + 0.3, 'half', mouthAt(lt, 'neutral')], [W.one - 0.4, 'open', mouthAt(lt, 'neutral')]].map((f) => [f[0], f[1], f[0] > W.house ? mouthAt(lt, 'neutral') : f[2]]));
        const p = cr([[0, -1.6, 2.6, 9.6], [0.9, -1.2, 6.0, 12.0], [2.0, 1.0, 22, 14.5], [3.3, 1.0, 17, 11.0], [4.6, 0.9, 6.5, 5.6], [D, 0.8, 2.7, 3.4]], lt), tg = cr([[0, -1.3, 1.0, 5.2], [0.9, -1.0, 0.5, 4.6], [2.0, 1.0, 0, 0.6], [3.3, 0.9, 0, 0.7], [4.6, 0.75, 1.0, 1.2], [D, 0.75, 1.45, 1.2]], lt);   // v4: arranca en los zombis de la puerta de entrada, sube a la casa entera rodeada, baja a Ava
        look(c, p, tg); ch.lookAt(c, 1, 40);
      } };
  }
  // ---------- 02 (4.05-8.51) el living desde arriba: 3 ventanas + 2 puertas destellan en rojo, Ava manos en la cadera ----------
  { const c = cam(64), D = T['03_window'] - T['02_living'];
    const FL = [['W1', W.three2], ['W2', W.three2 + 0.26], ['W3', W.three2 + 0.52], ['D1', W.two2], ['D2', W.two2 + 0.28]];
    out['02_living'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['02_living'] + lt;
        roomLabels(o, c, ease(W.living - 0.1, W.living + 0.2, t), ['LIVING'], { LIVING: '#ff9a4a' });
        const nW = FL.slice(0, 3).filter(([, t0]) => t >= t0).length, nD = FL.slice(3).filter(([, t0]) => t >= t0).length;
        if (nW) box2(o, 260, 150, [`WINDOWS x${nW}`], '#ff4030', 1, 2); if (nD) box2(o, 260, 182, [`DOORS x${nD}`], '#ff4030', 1, 2);
      }, update(lt, t) {
        const fk = {}; for (const [id, t0] of FL) { const d = t - t0; fk[id] = d < 0 ? 0 : d < 0.12 ? 0.9 : 0.35 + 0.25 * Math.max(0, Math.cos((d - 0.12) * 9)); }
        state({ flashK: fk }); AVA(-2.4, 2.9, 0.15);
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('hands_on_hips', W.biggest - T['02_living'] - 0.4, { fade: 0.25 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.biggest - T['02_living'], 'happy', mouthAt(t, 'smile')], [W.three2 - T['02_living'], 'open', mouthAt(t, 'neutral')]]);
        look(c, cr([[0, -2.6, 9.4, 8.0], [D, -2.7, 9.0, 7.7]], lt), cr([[0, -2.7, 0, 2.7], [D, -2.7, 0, 2.8]], lt)); ch.lookAt(c, 1, 40);
      } };
  }
  // ---------- 03 (8.51-10.42) la ventana del ep2 (W1 con tablones), el zombi golpea: SOLO tiembla la ventana ----------
  { const c = cam(50); const HITS = [W.window3 - 0.05, W.door3 - 0.05, W.them3 + 0.05, W.them3 + 0.45];
    out['03_window'] = { scene, camera: c, overlay: vign(0.45), update(lt, t) {
      state({ boardShake: hitK(t, HITS), zOn: true }); AVA(-3.6, 1.2, -1.2);
      ch.pose(lt, [L.seg('idle', -99, { loop: true })], [[-99, 'shocked', 'gasp']]); ch.root.visible = false;
      poseZ(0.18 + 0.85 * lt);
      look(c, cr([[0, -2.7, 1.45, 3.1], [2.0, -3.0, 1.45, 2.85]], lt), V(-5.0, 1.4, 1.8));
    } };
  }
  // ---------- 04b (17.76-21.3) dentro del bano: Ava a camara; READY.GOV ----------
  { const c = cam(52);
    out['04_bath'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['04_bath'] + lt;
        box2(o, LW / 2, 150, ['READY.GOV', 'INTERIOR ROOM', 'FEW OR NO WINDOWS'], '#8cff5a', ease(W.ready - 0.1, W.ready + 0.15, t), 2);
      }, update(lt, t) {
        state({ ceil: true }); AVA(2.75, 0.25, 0.35);
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('nod', W.possible - T['04_bath'] - 0.3, { fade: 0.2 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.ready - T['04_bath'], 'happy', mouthAt(t, 'smile')], [W.few - T['04_bath'], 'open', mouthAt(t, 'neutral')]]);
        look(c, cr([[0, 2.0, 1.55, 2.0], [3.6, 2.2, 1.5, 1.85]], lt), cr([[0, 3.2, 1.15, -0.4], [3.6, 3.1, 1.15, -0.5]], lt)); ch.lookAt(c, 1, 40);
      } };
  }
  // ---------- 05 (21.3-23.48) Ava ante la puerta del bano (desde adentro) con el taladro ----------
  const setStrike = () => { strike.position.set(bd.fixed + 0.04, 0.98, bd.c - bd.w / 2 - 0.002); strike.rotation.set(0, 0, 0); };   // cerradero del lado de la manija
  { const c = cam(50);
    out['05_door'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({ ceil: true, drillOn: true }); setStrike();
      // Ava mira a la puerta (-x); la punta de la broca (DRILL_TIP0, medida mirando a -z) cae sobre la hoja junto a la manija
      const tx = DRILL_TIP0.x, tz = DRILL_TIP0.z; AVA(bd.fixed + 0.06 + 0.03 - tz, bd.c - 0.3 + tx, -Math.PI / 2);
      const spin = t > W.lasttime - 0.1; DR.chuck.rotation.z = spin ? lt * 60 : 0;
      ch.pose(lt, [L.seg('drill', -99, { loop: true, speed: spin ? 1 : 0.3 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.lasttime - T['05_door'], 'wink', mouthAt(t, 'smile')]]);
      look(c, cr([[0, 2.45, 1.45, -0.9], [2.2, 2.35, 1.42, -0.8]], lt), V(1.95, 1.15, 0.25));
      if (lt > 0.4) ch.lookAt(c, 0.8, 35);
    } };
  }
  // ---------- 05b (23.48-25.52) primer plano: tornillo de 3" entra en el cerradero y muerde el montante ----------
  { const c = cam(40);
    out['05_screw'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const t = T['05_screw'] + lt;
        tag(o, c, V(bd.fixed, 1.03, bd.c - bd.w / 2 + 0.03), 250, 170, '3-INCH SCREWS', '#ffd23f', ease(W.inch - 0.1, W.inch + 0.15, t));
        tag(o, c, V(bd.fixed, 1.35, bd.c - bd.w / 2 - 0.07), 100, 330, 'THE STUD', '#8cff5a', ease(W.stud - 0.1, W.stud + 0.15, t));
      }, update(lt, t) {
        state({ ceil: true }); setStrike(); ch.root.visible = false; leaves.BD.g.visible = false;   // sin hoja: se ve el cerradero en el marco
        const k = ease(W.screws - 0.25, W.stud + 0.05, t), z0 = bd.c - bd.w / 2;
        strike.position.set(bd.fixed, 1.0, z0 + 0.002); screw.visible = true; screw.position.set(bd.fixed, 1.03, z0 + 0.045 - 0.07 * k); screw.rotation.set(Math.PI / 2, 0, 0); screw.rotateY(k * 50);
        bitL.visible = true; bitL.position.set(bd.fixed, 1.03, screw.position.z + 0.038 + 0.2); bitL.rotation.set(Math.PI / 2, 0, 0); bitL.rotateY(k * 50);   // solo la broca entra al cuadro (el taladro queda en la mano, fuera de cuadro)
        studG.visible = t > W.stud - 0.1; { const k = ease(W.stud - 0.1, W.stud + 0.2, t); studG.material.opacity = 0.07 * k; studE.material.opacity = 0.9 * k; }
        look(c, cr([[0, 1.95, 1.2, 0.62], [2.0, 1.9, 1.18, 0.56]], lt), V(bd.fixed, 1.02, z0 + 0.06));
      } };
  }
  // ---------- 05c (25.52-27.04) la barra bajo la manija, Ava la encaja (lado del bano) ----------
  { const c = cam(50);
    out['05_bar'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['05_bar'] + lt;
        tag(o, c, V(bd.fixed + 0.06, 0.98, bd.c - 0.36), 250, 190, 'BAR UNDER THE HANDLE', '#ff7b2e', ease(W.bar - 0.1, W.bar + 0.15, t));
      }, update(lt, t) {
        state({ ceil: true, barOn: true }); setStrike();
        const k = ease(0.1, W.bar - T['05_bar'] + 0.1, lt), top = V(bd.fixed + 0.07, 0.95, bd.c - 0.36), foot = V(bd.fixed + 0.95 - 0.12 * k, 0.0, bd.c - 0.36);
        const mid = top.clone().add(foot).multiplyScalar(0.5); bar.position.copy(mid); bar.quaternion.setFromUnitVectors(V(0, 1, 0), top.clone().sub(foot).normalize()); bar.scale.y = top.distanceTo(foot) / 1.25;
        AVA(bd.fixed + 0.62, bd.c + 0.05, -Math.PI / 2 + 0.3);
        ch.pose(lt, [L.seg('kneel', -99, { from: 0.8, speed: 0.4 })], [[-99, 'open', mouthAt(t, 'neutral')]]);
        look(c, cr([[0, 2.35, 1.3, 1.55], [1.6, 2.3, 1.28, 1.5]], lt), V(1.85, 0.6, 0.05));
      } };
  }
  // ---------- 05d (27.04-28.09) "You already know how": Ava a camara, guino ----------
  { const c = cam(42);
    out['05_know'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({ ceil: true, barOn: true }); setStrike(); AVA(2.5, 0.4, -0.6);
      ch.pose(lt, [L.seg('hands_on_hips', -99, { from: 0.5, speed: 0.3 })], [[-99, 'open', mouthAt(t, 'smile')], [W.know - T['05_know'], 'wink', mouthAt(t, 'smile')]]);
      look(c, V(2.25, 1.5, 1.75), V(2.55, 1.3, 0.3)); ch.lookAt(c, 1, 40);
    } };
  }
  // ---------- 07 (36.08-40.79) Ava arrodillada llenando el baul; se corta con el clavo del tablon ----------
  { const c = cam(48);
    out['07_pack'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const t = T['07_pack'] + lt;
        if (t > W.cut - 0.05 && t < W.cut + 0.15) { o.tctx.fillStyle = 'rgba(200,0,0,0.35)'; o.tctx.fillRect(0, 0, LW, LH); }
        tag(o, c, handW('L'), 110, 250, 'CUT ON A NAIL', '#ff4030', ease(W.nail - 0.1, W.nail + 0.15, t));
      }, update(lt, t) {
        const cutK = t >= W.cut ? 1 : 0;
        state({ ceil: true, lid: 1, packed: 3, bloodK: ease(W.cut + 0.3, W.bleeding + 0.3, t) });
        AVA(3.15, 0.85, Math.PI / 2 + 0.25);
        ch.pose(lt, [L.seg('kneel', -99, { from: 0.9, speed: 0 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.cut - T['07_pack'], 'shocked', 'gasp'], [W.cut - T['07_pack'] + 0.6, 'sad', mouthAt(t, 'frown')]]);
        if (cutK) { const hp = handW('L'); handBlood.visible = true; handBlood.position.copy(hp).add(V(0, 0.02, 0)); handBlood.scale.set(0.09, 0.065, 1); drops.forEach((d, i) => { const ph = ((t - W.cut) * 1.4 + i * 0.2) % 1; d.position.set(hp.x + 0.01 * i - 0.02, hp.y - ph * hp.y, hp.z); }); }
        look(c, cr([[0, 4.1, 1.4, -0.3], [W.cut - T['07_pack'], 4.05, 1.3, -0.2], [4.7, 3.95, 1.2, -0.1]], lt), V(3.3, 0.55, 1.05));
      } };
  }
  // ---------- 07b (40.79-42.98) primer plano: spray en la mano cortada, venda ----------
  { const c = cam(40);
    out['07_spray'] = { scene, camera: c, overlay: vign(0.35), update(lt, t) {
      state({ ceil: true, lid: 1, packed: 3, bloodK: 1, kitOpen: 1, sprayOn: t < W.bandage + 0.1, wrapK: t >= W.bandage ? 1 : 0 });
      AVA(2.7, 0.55, 0.9);
      ch.pose(lt, [L.seg('hold_up_object', -99, { from: 0.7, speed: 0 })], [[-99, 'sad', mouthAt(t, 'neutral')]]);
      const hl = handW('L'), hr = handW('R');
      spray.visible = t < W.bandage + 0.1; spray.position.copy(hr).add(V(0, -0.11, 0.02)); spray.rotation.set(0, 0.9, -0.35);   // de pie en la mano, la boquilla apunta a la mano cortada
      if (t >= W.spray && t < W.bandage) mist.forEach((m, i) => { const ph = ((t - W.spray) * 2.2 + i / mist.length) % 1, d = hl.clone().sub(hr); m.position.copy(hr).addScaledVector(d, ph).add(V(Math.sin(i * 7) * 0.03 * ph, Math.cos(i * 5) * 0.03 * ph, 0)); });
      if (t >= W.bandage) { wrap.position.copy(hl); wrap.scale.setScalar(ease(W.bandage, W.bandage + 0.3, t) * 1.3 + 0.1); }
      if (t < W.bandage) { handBlood.visible = true; handBlood.position.copy(hl).add(V(0, 0.02, 0)); handBlood.scale.set(0.08, 0.06, 1); }
      look(c, V(3.95, 1.45, 1.75), V(2.75, 1.05, 0.55)); ch.lookAt(c, 0.6, 30);
    } };
  }
  // ---------- 08b (48.61-51.98) "Congratulations... you have a safe room": Ava a camara, el armario detras ----------
  const congratsCam = (c, lt) => look(c, cr([[0, 2.55, 1.5, 1.95], [3.4, 2.6, 1.48, 1.75]], lt), V(3.0, 1.25, -0.5));
  { const c = cam(50);
    out['08_congrats'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({ ceil: true, barOn: true, lid: 0, packed: 5 }); setStrike(); AVA(2.7, 0.35, 0.2);
      ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('cheer', W.safe - T['08_congrats'] - 0.3, { fade: 0.25 })], [[-99, 'happy', mouthAt(t, 'smile')], [W.safe - T['08_congrats'], 'wink', mouthAt(t, 'smileOpen')]]);
      congratsCam(c, lt); ch.lookAt(c, 1, 40);
    } };
  }
  // ---------- 09 (51.98-53.99) golpes DENTRO del armario del bano: solo tiembla la puerta del armario (y su manija) ----------
  { const c = cam(46);
    out['09_knock'] = { scene, camera: c, overlay: vign(0.45), update(lt, t) {
      state({ ceil: true, barOn: true, packed: 5 }); setStrike(); AVA(2.85, 0.75, Math.PI + 0.3);
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'open', 'neutral']]);
      const k = hitK(t, W.knocks, 0.2); leaves.CD.g.rotation.y = -0.05 * k; leaves.CD.hdl.rotation.z = 0.35 * k;
      bathL.intensity = 6 - 2.5 * ease(0, 1.2, lt);
      look(c, cr([[0, 2.0, 1.75, 2.1], [2.0, 2.2, 1.7, 1.95]], lt), cr([[0, 3.7, 1.0, -0.5], [2.0, 3.8, 1.0, -0.5]], lt));
    } };
  }
  // ---------- 09b (53.99-55.59) "Oh, fudge": primer plano, ojos de miedo, boca normal abierta; la puerta del armario sigue temblando ----------
  { const c = cam(38);
    out['09_fudge'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ ceil: true, barOn: true, packed: 5 }); AVA(2.85, 0.75, 0.35);
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'scared', 'talkA'], [W.fudge + 1.0 - T['09_fudge'], 'scared', 'talkO']]);   // boca normal abierta toda la frase
      const k = hitK(t, [T['09_fudge'] + 0.05, T['09_fudge'] + 1.1], 0.2); leaves.CD.g.rotation.y = -0.018 * k; leaves.CD.hdl.rotation.z = 0.25 * k;
      bathL.intensity = 3.5;
      look(c, V(2.35, 1.5, 1.85), V(2.95, 1.45, 0.7)); ch.lookAt(c, 1, 40);
    } };
  }
  // ---------- 04 (12.13-17.76) plano de la casa desde arriba (diagrama): el living tachado, el bano en verde ----------
  { const c = new THREE.OrthographicCamera(-6.6, 6.6, 6.6 * LH / LW, -6.6 * LH / LW, 0.1, 80); c.position.set(1, 40, 1.5); c.up.set(0, 0, -1); c.lookAt(1, 0, 1.5); c.updateProjectionMatrix();
    const rect = (o, [x0, x1, z0, z1], fill, stroke, dash = null, lw = 2) => { const cx = o.tctx, [ax, ay] = L.toScreen(c, x0, 0, z0), [bx, by] = L.toScreen(c, x1, 0, z1);
      if (fill) { cx.fillStyle = fill; cx.fillRect(ax, ay, bx - ax, by - ay); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw; cx.setLineDash(dash || []); cx.strokeRect(ax + 1, ay + 1, bx - ax - 2, by - ay - 2); cx.setLineDash([]); } return [ax, ay, bx, by]; };
    const R = (n) => ROOMS[n].slice(0, 4);
    out['04_plan'] = { scene, camera: c, overlay(lt, dt, a, o) {
        const cx = o.tctx, t = T['04_plan'] + lt;
        cx.fillStyle = 'rgba(6,14,40,0.55)'; cx.fillRect(0, 0, LW, LH); cx.fillStyle = 'rgba(90,140,220,0.10)'; for (let x = 0; x < LW; x += 12) cx.fillRect(x, 0, 1, LH); for (let y = 0; y < LH; y += 12) cx.fillRect(0, y, LW, 1);
        bitText(cx, 'MAP', LW / 2, 112, 3, '#e8e8ec', { outline: '#000' });
        // el living: tachado (3 ventanas, 2 puertas)
        const kL = ease(W.small - 0.2, W.small + 0.1, t); if (kL > 0) { cx.globalAlpha = kL; const [ax, ay, bx, by] = rect(o, R('LIVING'), 'rgba(200,30,20,0.25)', '#ff4030'); cx.strokeStyle = '#ff4030'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(ax + 6, ay + 6); cx.lineTo(bx - 6, by - 6); cx.moveTo(bx - 6, ay + 6); cx.lineTo(ax + 6, by - 6); cx.stroke(); cx.globalAlpha = 1; }
        const kD = ease(W.onedoor - 0.05, W.onedoor + 0.15, t), [dx, dy] = L.toScreen(c, holes.BD.fixed, 0, holes.BD.c);
        if (kD > 0) { cx.globalAlpha = kD; cx.strokeStyle = '#8cff5a'; cx.lineWidth = 2; cx.beginPath(); cx.arc(dx, dy, 10 + 2 * Math.sin(t * 8), 0, 7); cx.stroke(); cx.globalAlpha = 1; tag(o, c, V(holes.BD.fixed, 0, holes.BD.c), 300, 330, '1 DOOR', '#8cff5a', kD); }
        if (t > W.nowin) tag(o, c, V(3.5, 0, 0.4), 290, 268, '0 WINDOWS', '#8cff5a', ease(W.nowin, W.nowin + 0.15, t));
        const kM = ease(W.middle - 0.1, W.middle + 0.2, t); if (kM > 0) { const [mx, my] = L.toScreen(c, 2.9, 0, 0.5); cx.globalAlpha = kM; cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2;
          for (const [ex, ey] of [[L.toScreen(c, -5.6, 0, 0.5)], [L.toScreen(c, 7.6, 0, 0.5)], [L.toScreen(c, 2.9, 0, -4.6)], [L.toScreen(c, 2.9, 0, 5.6)]].map((v) => v[0])) { const k2 = 0.55 + 0.1 * Math.sin(t * 6); cx.beginPath(); cx.moveTo(ex, ey); cx.lineTo(ex + (mx - ex) * k2, ey + (my - ey) * k2); cx.stroke(); }
          cx.globalAlpha = 1; }
        const kB = ease(W.bathroom - 0.1, W.bathroom + 0.15, t); if (kB > 0) { cx.globalAlpha = kB; rect(o, R('BATH'), `rgba(60,220,60,${0.35 + 0.1 * Math.sin(t * 6)})`, '#8cff5a'); cx.globalAlpha = 1; }
        const kC = ease(W.closet - 0.1, W.closet + 0.15, t); if (kC > 0) { cx.globalAlpha = kC; rect(o, R('CLOSET'), 'rgba(60,220,60,0.15)', '#8cff5a', [4, 3]); cx.globalAlpha = 1; }
        roomLabels(o, c, 1, null, { LIVING: kL > 0.5 ? '#ff7060' : '#f0f0e8', BATH: kB > 0.5 ? '#c8ffb0' : '#f0f0e8' });
        if (kB > 0.5) { const [bx, by] = L.toScreen(c, 2.9, 0, 1.2); bitText(cx, 'SAFE ROOM', bx, by, 1, '#8cff5a', { outline: '#000' }); }
      }, update(lt) { state({}); ch.root.visible = false; const z = 1 + 0.04 * lt; c.zoom = z; c.updateProjectionMatrix(); } };
  }
  // ---------- 08 (46.43-48.61) maquina de escribir (verde, de sala de guardado) sobre el baul cerrado: "DAY 3 - SAFE ROOM SECURED." ----------
  { const c = cam(40), tw = new THREE.Group(); scene.add(tw); tw.position.set(3.78, 0.53, 0.75); tw.rotation.y = -Math.PI / 2 + 0.25;
    const mG = lam(L.cvs(16, 16, (cx) => { const r = L.rng(81); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 14 - 7; px(cx, x, y, `rgb(${52 + n},${86 + n},${64 + n})`); } })), mK = lam(null, 0x161616), mKey = lam(null, 0xe8e2d0);
    B(0.42, 0.1, 0.3, mG, 0, 0.05, 0, tw); B(0.42, 0.08, 0.12, mG, 0, 0.13, -0.08, tw);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) { const kk = B(0.022, 0.012, 0.022, mKey, -0.14 + k * 0.031 + (r % 2) * 0.01, 0.105 + r * 0.012, 0.11 - r * 0.03, tw); kk.userData.key = r * 10 + k; }
    const plat = L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.46, 8), mK, 0, 0.2, -0.1, tw); plat.rotation.z = Math.PI / 2;
    const pcv = document.createElement('canvas'); pcv.width = 96; pcv.height = 128; const pt = new THREE.CanvasTexture(pcv); L.nearest(pt); pt.colorSpace = THREE.SRGBColorSpace;
    const paper = L.plane(0.24, 0.32, L.basic(pt), 0, 0.33, -0.1, tw, 0, -0.25); tw.visible = false;
    const L1 = 'DAY 3', L2 = 'SAFE ROOM', L3 = 'SECURED.', TOT = L1.length + L2.length + L3.length; let lastN = -1;
    out['08_save'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['08_save'] + lt;
        if (t > W.save) { const cx = o.tctx; cx.globalAlpha = ease(W.save, W.save + 0.2, t); bitText(cx, 'PROGRESS SAVED', LW / 2, 470, 2, '#9cd4ff', { outline: '#000' }); bitText(cx, 'INK RIBBON x2', LW / 2, 492, 1, '#c8c8d0', { outline: '#000' }); cx.globalAlpha = 1; }
      }, update(lt, t) {
        state({ ceil: true, barOn: true, packed: 5 }); setStrike(); ch.root.visible = false; tw.visible = true;
        const n = Math.max(0, Math.min(TOT, Math.floor((t - W.day + 0.05) * 9)));
        if (n !== lastN) { lastN = n; const cx = pcv.getContext('2d'); cx.fillStyle = '#ece6d6'; cx.fillRect(0, 0, 96, 128); cx.fillStyle = '#c8c0ac'; for (let y = 0; y < 128; y += 9) cx.fillRect(0, y, 96, 1);
          cx.fillStyle = '#1a1a1a'; cx.font = 'bold 12px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'top';
          cx.fillText(L1.slice(0, n), 10, 14); cx.fillText(L2.slice(0, Math.max(0, n - L1.length)), 10, 40); cx.fillStyle = '#a01010'; cx.fillText(L3.slice(0, Math.max(0, n - L1.length - L2.length)), 10, 56); pt.needsUpdate = true; }
        tw.children.forEach((k) => { if (k.userData.key !== undefined) k.position.y = 0.105 + Math.floor(k.userData.key / 10) * 0.012 - (k.userData.key === (n * 7) % 40 && n < TOT ? 0.006 : 0); });
        paper.position.y = 0.33 + 0.004 * Math.floor(n / 9);
        const wp = tw.localToWorld(V(0, 0.2, 0));
        look(c, cr([[0, 2.95, 1.25, 1.35], [2.2, 3.05, 1.2, 1.25]], lt), wp);
      } };
  }
  return out;
}
