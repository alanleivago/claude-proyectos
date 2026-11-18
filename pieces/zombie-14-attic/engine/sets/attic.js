// sets/attic.js — ep14 "The Attic (Stairs, Part 2)": la casa del ep10 (sets/stairs.js copiado tal cual) + desvan con escotilla,
// techo, exterior de noche con vecinos, ventana al pie de la escalera que estalla y el gigante (makeStalker del largo 3).
// --- abajo, el mundo del ep10 ---
// sets/stairs.js — ep10 "AVA: The Stairs" (4a de la serie de la casa: ep1 puerta, ep2 ventana, ep7 cuarto seguro).
// La MISMA casa del ep1/ep7 en corte (papel, parquet, sofa azul, puerta acolchada "13") con un PRIMER PISO nuevo y la escalera
// en el pasillo (ensanchado a x [-0.6, 1.5]): 14 escalones de z 4.0 (abajo, junto a D2) a z 0.7 (arriba, rellano).
// Barricadas: sofa volcado + comoda abajo, puerta de canto + estanteria (foto Flow) arriba; escalera de cuerda (codigo) en la ventana UW.
// Cada update() fija TODO el estado. Tiempos: cues.json (voz/build_cues.py).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { makeSpray } from './respray.js';
import { paintScared } from './avaface.js';
export async function shots({ L, TL }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.1, 400);
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


  const UY = 2.72, ZB = 3.4, ZT = 0.1, NST = 14, SX0 = -0.54, SX1 = 1.44, SXM = (SX0 + SX1) / 2, SW = SX1 - SX0;   // escalera: 14 escalones de z 4.0 (abajo) a z 0.7 (arriba)
  const RISE = UY / NST, RUN = (ZB - ZT) / NST;
  const stairY = (z) => L.clamp01((ZB - z) / (ZB - ZT)) * UY;
  const PO = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 };   // ep9: capas sobre el suelo sin parpadeo

  // ================= mundo =================
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0f1e); scene.fog = new THREE.Fog(0x0a0f1e, 30, 90);
  const amb = new THREE.AmbientLight(0xffe6c8, 0.75); scene.add(amb);
  const hemi = new THREE.HemisphereLight(0xb0c0e0, 0x403428, 0.7); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xb8c8f0, 0.8);   // ep14: luna sun.position.set(4, 12, 8); scene.add(sun);
  { const g = new THREE.PlaneGeometry(200, 200, 100, 100); const o = L.mesh(g, rm(tGrass, 80, 80, 0x6a7a62), 1, -0.06, 0.5, scene); o.rotation.x = -Math.PI / 2; }   // pasto subdividido (sin parpadeo con el snap PS1)
  const WH = 2.6, WT = 0.12;
  const DOOR = (c, w, id) => [c, w, 0, 2.05, id], WIN = (c, w, id) => [c, w, 0.9, 2.0, id];
  // planta baja (ep7) con el pasillo ensanchado a x [-0.6, 1.5] para la escalera; puerta trasera D3 en la cocina; D2 (living -> pasillo) al pie de la escalera
  const WALLS = [
    ['x', -4, -5, 7, 'out', 'kit', [WIN(-2.5, 1.1, 'wK'), WIN(5.6, 1.1, 'wB1')], 0],
    ['x', 5, -5, 7, 'liv', 'out', [WIN(-3.6, 1.1, 'W3'), DOOR(-1.6, 0.9, 'D1'), [0.45, 1.4, 0.45, 2.35, 'WS'], WIN(5.6, 1.1, 'wB2')], 0],   // ep14: ventana WS al pie de la escalera (por ahi entra el gigante)
    ['z', -5, -4, 5, 'out', 'liv', [DOOR(-2.85, 0.9, 'D3'), WIN(-1.7, 1.0, 'wK2'), WIN(1.8, 1.1, 'W1'), WIN(3.8, 1.1, 'W2')], 0],
    ['z', 7, -4, 5, 'bed', 'out', [WIN(-1.5, 1.1, 'wB3'), WIN(2.5, 1.1, 'wB4')], 0],
    ['x', 0.6, -5, -0.6, 'kit', 'liv', [], 0],
    ['z', -0.6, -4, 5, 'liv', 'hall', [DOOR(4.2, 0.9, 'D2'), DOOR(-1.5, 0.9, 'dK')], 0],
    ['z', 1.5, -4, 5, 'hall', 'bath', [DOOR(-2.6, 0.8, 'dL'), DOOR(-0.4, 0.9, 'BD')], 0],
    ['z', 4.3, -4, 5, 'bath', 'bed', [DOOR(3.6, 0.8, 'dBed')], 0],
    ['x', -1.2, 1.5, 4.3, 'lau', 'bath', [], 0],
    ['x', 2.2, 1.5, 4.3, 'bath', 'clo', [], 0],
    // primer piso (y = UY): rellano x [-0.6, 2.6] z [-1.6, 0.7], dormitorio de arriba x [1.5, 7] z [0.7, 5] con la ventana de escape UW, bano 2, cuarto de guardar al norte
    ['x', -4, -0.6, 7, 'out', 'u_sto', [WIN(4.5, 1.1, 'uN')], UY],
    ['x', 5, -0.6, 7, 'u_well', 'out', [WIN(4.2, 1.0, 'UW')], UY],
    ['z', -0.6, -4, 5, 'out', 'u_land', [WIN(2.9, 0.9, 'uWw')], UY],
    ['z', 7, -4, 5, 'u_bed', 'out', [WIN(-0.45, 0.9, 'uE'), WIN(3.0, 1.0, 'uE2')], UY],
    ['z', 1.5, 0.1, 5, 'u_well', 'u_bed', [], UY],
    ['x', 0.1, 1.5, 7, 'u_land', 'u_bed', [DOOR(2.05, 0.8, 'UD')], UY],
    ['z', 2.6, -1.6, 0.1, 'u_land', 'u_bath', [DOOR(-0.75, 0.8, 'UBD')], UY],
    ['x', -1.6, -0.6, 7, 'u_sto', 'u_land', [DOOR(0.45, 0.8, 'USD')], UY],
  ];
  const tWallU = noiseTex(32, 32, [168, 150, 170], 10, 43, (c) => { for (let x = 0; x < 32; x += 8) { px(c, x, 0, 'rgba(110,80,120,0.35)', 2, 32); } for (let y = 4; y < 32; y += 8) for (let x = 4; x < 32; x += 8) px(c, x, y, 'rgba(240,220,230,0.6)', 2, 2); });   // papel de arriba: malva con rombitos
  const SKIN = { liv: tWall, kit: tLino, hall: tWall2, bath: tTile, clo: tWall2, bed: tWall, lau: tTile, out: null, u_land: tWallU, u_bed: tWall, u_bath: tTile, u_sto: tWall2, u_well: tWall2 };
  const sideOf = (axis, fixed, a, s, y0) => {
    if (y0 > 0) {
      if (s === 'u_well' && axis === 'x' && fixed === 5 && a > 1.5) return 'u_bed';
      if (s === 'out' && axis === 'z' && fixed === -0.6) return 'out';
      if (s === 'u_land' && axis === 'z' && fixed === -0.6) return a < -1.6 ? 'u_sto' : a > 0.1 ? 'u_well' : 'u_land';
      if (s === 'u_bed' && axis === 'z' && fixed === 7) return a < -1.6 ? 'u_sto' : a < 0.1 ? 'u_bath' : 'u_bed';
      if (s === 'u_land' && axis === 'x' && fixed === 0.1 && a > 2.6) return 'u_bath';
      if (s === 'u_land' && axis === 'x' && fixed === -1.6 && a > 2.6) return 'u_bath';
      return s;
    }
    if (s === 'bath' && axis === 'z' && fixed === 1.5 && (a < -1.2 || a > 2.2)) return a < -1.2 ? 'lau' : 'clo';
    if (s === 'bath' && axis === 'z' && fixed === 4.3 && a > 2.2) return 'clo';
    if (s === 'bath' && axis === 'z' && fixed === 4.3 && a < -1.2) return 'lau';
    if (s === 'out' && axis === 'x' && fixed === -4 && a > 0) return a < 1.5 ? 'hall' : a < 4.3 ? 'lau' : 'bed';
    if (s === 'kit' && axis === 'x' && fixed === -4 && a > -0.6) return a < 1.5 ? 'hall' : a < 4.3 ? 'lau' : 'bed';
    if (s === 'liv' && axis === 'x' && fixed === 5 && a > -0.6) return a < 1.5 ? 'hall' : a < 4.3 ? 'clo' : 'bed';
    if (s === 'liv' && axis === 'z' && fixed === -0.6 && a < 0.6) return 'kit';
    if (s === 'liv' && axis === 'z' && fixed === -5 && a < 0.6) return 'kit';
    return s;
  };
  const tSiding = L.cvs(32, 32, (c) => { const r = L.rng(61); for (let y = 0; y < 32; y++) { const b = y % 8, k = b === 0 ? 0.62 : b === 1 ? 1.12 : 1 - b * 0.012; for (let x = 0; x < 32; x++) { const n = (r() - 0.5) * 10; px(c, x, y, `rgb(${(178 * k + n) | 0},${(170 * k + n) | 0},${(150 * k + n) | 0})`); } } for (let k = 0; k < 6; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(70,60,40,0.35)', 1, 2 + (r() * 4 | 0)); });   // v1: tablas de madera pintada por fuera (no gris liso)
  const wallMat = (room, len, h) => { const tx = SKIN[room]; if (!tx) return rm(tSiding, len / 1.0, h / 1.0); const per = room === 'bath' || room === 'lau' || room === 'u_bath' ? TP : WP; return rm(tx, len / per, h / per); };
  const wallGroup = new THREE.Group(); scene.add(wallGroup); const upCut = []; const upGroup = new THREE.Group(); scene.add(upGroup);
  const seg = (axis, fixed, a0, a1, y0, y1, sN, sP, base) => {
    const len = a1 - a0, h = y1 - y0; if (len < 0.01 || h < 0.01) return;
    const mid = (a0 + a1) / 2, rN = sideOf(axis, fixed, mid, sN, base), rP = sideOf(axis, fixed, mid, sP, base);
    const mN = wallMat(rN, len, h), mP = wallMat(rP, len, h), m = axis === 'x' ? [mCap, mCap, mCap, mCap, mP, mN] : [mP, mN, mCap, mCap, mCap, mCap];
    const par = base > 0 ? upGroup : wallGroup;
    const o = axis === 'x' ? B(len, h, WT, m, mid, base + (y0 + y1) / 2, fixed, par) : B(WT, h, len, m, fixed, base + (y0 + y1) / 2, mid, par);
    if (base > 0 && ((axis === 'z' && fixed === -0.6) || (axis === 'x' && fixed === 5))) upCut.push(o);   // 09d: corte de la pared de arriba (vista RE en corte)
    return o;
  };
  const holes = {};
  for (const [axis, fixed, a0, a1, sN, sP, hs, base] of WALLS) {
    const H2 = [...hs].sort((p, q) => p[0] - q[0]); let a = a0;
    for (const [c, w, y0, y1, id] of H2) {
      seg(axis, fixed, a, c - w / 2, 0, WH, sN, sP, base);
      if (y0 > 0) seg(axis, fixed, c - w / 2, c + w / 2, 0, y0, sN, sP, base);
      seg(axis, fixed, c - w / 2, c + w / 2, y1, WH, sN, sP, base);
      holes[id] = { axis, fixed, c, w, y0, y1, base }; a = c + w / 2;
    }
    seg(axis, fixed, a, a1, 0, WH, sN, sP, base);
  }
  // suelos (subdivididos) y losa del primer piso (el hueco de la escalera queda abierto)
  const ROOMS = { LIVING: [-5, -0.6, 0.6, 5, tParq, 0.9], KITCHEN: [-5, -0.6, -4, 0.6, tLino, 0.6], HALL: [-0.6, 1.5, -4, 5, tCarpet, 0.7], BATH: [1.5, 4.3, -1.2, 2.2, tFloorTile, 0.5],
    CLOSET: [1.5, 4.3, 2.2, 5, tWood, 0.8], LAUNDRY: [1.5, 4.3, -4, -1.2, tLino, 0.6], BEDROOM: [4.3, 7, -4, 5, tCarpetB, 0.8] };
  const tCarpetU = noiseTex(32, 32, [120, 46, 52], 14, 44, (c) => { for (let y = 0; y < 32; y += 8) px(c, 0, y, 'rgba(200,160,90,0.35)', 32, 1); });
  const UROOMS = { LANDING: [-0.6, 2.6, -1.6, 0.1, tCarpetU, 0.7], 'BEDROOM 2': [1.5, 7, 0.1, 5, tParq, 0.9], 'BATH 2': [2.6, 7, -1.6, 0.1, tFloorTile, 0.5], STORAGE: [-0.6, 7, -4, -1.6, tWood, 0.8] };
  const floorP = (x0, x1, z0, z1, tx, s, y, par) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil((x1 - x0) / 0.4), Math.ceil((z1 - z0) / 0.4)); const o = L.mesh(g, rm(tx, (x1 - x0) / s, (z1 - z0) / s), (x0 + x1) / 2, y, (z0 + z1) / 2, par); o.rotation.x = -Math.PI / 2; return o; };
  for (const [x0, x1, z0, z1, tx, s] of Object.values(ROOMS)) floorP(x0, x1, z0, z1, tx, s, 0.001, scene);
  for (const [x0, x1, z0, z1, tx, s] of Object.values(UROOMS)) floorP(x0, x1, z0, z1, tx, s, UY + 0.001, upGroup);
  const mCeil = lam(null, 0xe0dcd0);
  for (const [x0, x1, z0, z1] of [[-0.6, 7, -4, 0.1], [1.5, 7, 0.1, 5]]) B(x1 - x0, 0.12, z1 - z0, [mCap, mCap, mCap, mCeil, mCap, mCap], (x0 + x1) / 2, UY - 0.06 - 0.035, (z0 + z1) / 2, upGroup);   // losa (v1: tapa 3,5 cm bajo el piso, sin z-fight) (cara de abajo = cielo raso)
  // barandilla del hueco del lado del rellano no hace falta: ahi va la barricada (puerta de canto)

  // ================= escalera (abierta: huellas + contrahuellas + zancas), de madera =================
  const tTread = L.cvs(32, 16, (c) => { const r = L.rng(51); for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) { const n = 9 * Math.sin(x * 0.6 + y * 0.3) + r() * 8; px(c, x, y, `rgb(${118 + n},${70 + n * 0.6},${36 + n * 0.4})`); } px(c, 0, 0, '#d8b080', 32, 1); px(c, 0, 15, '#4a2a14', 32, 1); });
  const tRiser = L.cvs(16, 16, (c) => { px(c, 0, 0, '#e4ddca', 16, 16); px(c, 0, 15, '#a8a090', 16, 1); const r = L.rng(52); for (let k = 0; k < 10; k++) px(c, r() * 16 | 0, r() * 16 | 0, 'rgba(120,110,90,0.3)', 1, 1); });
  const mTread = lam(L.rep(tTread, 3, 1)), mRiser = lam(L.rep(tRiser, 6, 1)), mStr = lam(tWood, 0x8a5a34);
  const stairG = new THREE.Group(); scene.add(stairG);
  for (let i = 0; i < NST; i++) {
    const y = (i + 1) * RISE, z0 = ZB - i * RUN;
    B(SW, 0.04, RUN + 0.03, mTread, SXM, y - 0.02, z0 - RUN / 2 + 0.015, stairG);
    B(SW - 0.02, RISE - 0.05, 0.02, mRiser, SXM, y - 0.045 - (RISE - 0.05) / 2, z0 - 0.005, stairG);   // v1: la contrahuella termina bajo la huella (sin z-fight)
  }
  for (const x of [SX0 + 0.03, SX1 - 0.03]) { const len = Math.hypot(ZB - ZT, UY), sg = B(0.05, 0.3, len + 0.2, mStr, x, UY / 2 - 0.1, (ZB + ZT) / 2, stairG); sg.rotation.x = Math.atan2(UY, ZB - ZT); }
  // pasamanos del lado de la pared del dormitorio (x 1.44)
  { const len = Math.hypot(ZB - ZT, UY), hr = B(0.05, 0.05, len, lam(tWood, 0x6a3a1c), SX1 - 0.08, UY / 2 + 0.9, (ZB + ZT) / 2, stairG); hr.rotation.x = Math.atan2(UY, ZB - ZT); }

  // ================= ventanas, destellos rojos, hojas de puerta =================
  const mFrame = lam(null, 0xe8e4da), mSill = lam(tWood, 0xd8c8b0);
  const flashes = {};
  const mkFlash = (id) => { const m = L.basic(null, 0xff2010, { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }); m.blending = THREE.AdditiveBlending; flashes[id] = m; return m; };
  const winGroups = {}, glass = {};
  for (const [id, hl] of Object.entries(holes)) {
    const { axis, fixed, c, w, y0, y1, base } = hl; const g = new THREE.Group(); scene.add(g); winGroups[id] = g;
    if (axis === 'x') g.position.set(c, base, fixed); else { g.position.set(fixed, base, c); g.rotation.y = Math.PI / 2; }
    const h = y1 - y0, ym = (y0 + y1) / 2;
    if (y0 > 0) {
      B(w, 0.06, WT + 0.02, mFrame, 0, y0 + 0.03, 0, g); B(w, 0.06, WT + 0.02, mFrame, 0, y1 - 0.03, 0, g); B(0.06, h, WT + 0.02, mFrame, -w / 2 + 0.03, ym, 0, g); B(0.06, h, WT + 0.02, mFrame, w / 2 - 0.03, ym, 0, g);
      const sash = new THREE.Group(); g.add(sash); B(0.04, h, 0.05, mFrame, 0, ym, 0, sash); B(w, 0.04, 0.05, mFrame, 0, y0 + h * 0.62, 0, sash);
      glass[id] = { sash, pane: L.plane(w - 0.08, h - 0.08, L.basic(tGlass, 0xffffff, { transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }), 0, ym, 0, sash) };
      B(w + 0.16, 0.04, 0.2, mSill, 0, y0 - 0.02, 0, g);
    } else {
      B(0.08, 2.12, WT + 0.04, lam(tWood, 0xc89870), -w / 2 - 0.04, 1.06, 0, g); B(0.08, 2.12, WT + 0.04, lam(tWood, 0xc89870), w / 2 + 0.04, 1.06, 0, g); B(w + 0.16, 0.08, WT + 0.04, lam(tWood, 0xc89870), 0, 2.09, 0, g);
    }
    const f = L.plane(w, h, mkFlash(id), 0, ym, 0.0, g); f.renderOrder = 5;
    const f2 = L.plane(w + 0.3, 0.06, flashes[id], 0, WH + 0.02, 0, g, 0, -Math.PI / 2); f2.scale.set(1, 3, 1); f2.renderOrder = 5;
  }
  for (const [id, dx, dz] of [['W1', 0.5, 0], ['W2', 0.5, 0], ['W3', 0, -0.5], ['D1', 0, -0.5], ['wK', 0, 0.5], ['wK2', 0.5, 0], ['D3', 0.5, 0]]) {
    const hl = holes[id], x = hl.axis === 'x' ? hl.c : hl.fixed, z = hl.axis === 'x' ? hl.fixed : hl.c;
    const gl = L.plane(hl.axis === 'x' ? hl.w + 0.2 : 0.9, hl.axis === 'x' ? 0.9 : hl.w + 0.2, L.basic(null, 0xff2010, { transparent: true, opacity: 0, depthWrite: false, ...PO }), x + dx, 0.02, z + dz, scene, 0, -Math.PI / 2); gl.renderOrder = 6;
    gl.material.blending = THREE.AdditiveBlending; flashes[id + '_floor'] = gl.material;
  }
  const leaves = {};
  const leaf = (id, tex, open = 0) => {
    const hl = holes[id], g = new THREE.Group(); winGroups[id].add(g); g.position.set(-hl.w / 2, 0, 0);
    const mF = tex === 'pad' ? lam(tPad) : lam(tDoorP), mE = lam(null, tex === 'pad' ? 0x3a2016 : 0xb8ac90);
    const lf = B(hl.w, 2.04, 0.045, [mE, mE, mE, mE, mF, mF], hl.w / 2, 1.02, 0, g);
    const hdl = new THREE.Group(); g.add(hdl); hdl.position.set(hl.w - 0.09, 0.98, 0);
    for (const s of [1, -1]) { B(0.04, 0.12, 0.01, mSteel, 0, 0, s * 0.028, hdl); B(0.11, 0.02, 0.02, mSteel, -0.05, 0.02, s * 0.05, hdl); B(0.02, 0.02, 0.04, mSteel, 0, 0.02, s * 0.035, hdl); }
    leaves[id] = { g, lf, hdl, open }; g.rotation.y = open; return leaves[id];
  };
  leaf('D1', 'pad'); leaf('D2', 'p', 1.35); leaf('D3', 'p'); leaf('BD', 'p', -1.2); leaf('dL', 'p', -1.2); leaf('dBed', 'p', 1.2); leaf('dK', 'p', 1.4); leaf('UD', 'p', 1.3); leaf('UBD', 'p', 1.2); leaf('USD', 'p', 1.2);

  // ================= muebles =================
  const furn = new THREE.Group(); scene.add(furn);
  const place = async (n, x, z, ry = 0, s = 1, y = 0, parent = furn) => { const o = await prop(n); o.position.set(x, y, z); o.rotation.y = ry; o.scale.multiplyScalar(s); parent.add(o); return o; };
  // sofa azul del ep1: en el living (planos 01-04) o volcado al pie de la escalera (05+)
  const sofa = new THREE.Group(); scene.add(sofa);
  { const mC = lam(tCouch); B(1.9, 0.42, 0.85, mC, 0, 0.21, 0, sofa); B(1.9, 0.5, 0.2, mC, 0, 0.66, -0.33, sofa); B(0.16, 0.62, 0.85, mC, -0.95, 0.31, 0, sofa); B(0.16, 0.62, 0.85, mC, 0.95, 0.31, 0, sofa);
    for (const x of [-0.47, 0.47]) B(0.9, 0.12, 0.7, lam(tCouch, 0xd0d8ff), x, 0.48, 0.05, sofa);
    B(1.9, 0.02, 0.85, lam(null, 0x2a2420), 0, 0.005, 0, sofa); for (const x of [-0.85, 0.85]) for (const z of [-0.35, 0.35]) B(0.06, 0.06, 0.06, lam(tWood), x, -0.03, z, sofa); }
  const SOFA_HOME = [-3.0, 0, 1.15, 0];
  L.plane(2.6, 1.8, lam(tRug, 0xffffff, PO), -2.6, 0.006, 3.0, furn, 0, -Math.PI / 2);
  B(1.1, 0.5, 0.45, lam(tWood), -2.6, 0.25, 4.65, furn); await place('crt', -2.6, 4.65, Math.PI, 1, 0.5);
  await place('table_lamp', -4.55, 1.0, 0, 1, 0); await place('side_table', -1.1, 1.0, 0, 1);
  await place('painting_a', -4.93, 2.8, Math.PI / 2, 1, 1.5);
  // cocina
  B(3.6, 0.9, 0.6, lam(tShelf, 0xe8dcc0), -3.0, 0.45, -3.65, furn); B(3.6, 0.04, 0.64, lam(null, 0x9a9488), -3.0, 0.92, -3.65, furn); B(3.6, 0.6, 0.35, lam(tShelf, 0xe8dcc0), -3.0, 1.9, -3.8, furn);
  await place('fridge', -1.2, -3.55, 0, 1); B(1.2, 0.05, 0.8, lam(tWood), -2.6, 0.75, -1.4, furn); for (const [x, z] of [[-3.1, -1.75], [-2.1, -1.05], [-3.1, -1.05], [-2.1, -1.75]]) B(0.05, 0.75, 0.05, lam(tWood), x, 0.375, z, furn);
  await place('cans_stack', -3.8, -3.6, 0, 1, 0.94);
  // bano (el cuarto seguro del ep7) y resto de la planta baja
  await place('bathtub', 2.35, 1.78, Math.PI, 1);
  B(0.55, 0.85, 0.45, lam(null, 0xe8e6e0), 2.1, 0.425, -0.95, furn); B(0.4, 0.4, 0.55, mWhite, 2.9, 0.2, -0.9, furn); B(0.42, 0.45, 0.18, mWhite, 2.9, 0.62, -1.1, furn);
  for (const z of [2.45, 4.75]) for (const y of [0.4, 1.0, 1.6]) { B(2.4, 0.03, 0.4, lam(tShelf), 2.9, y, z, furn); for (let k = 0; k < 5; k++) B(0.36, 0.22, 0.32, lam(null, [0x4a6a9a, 0xa04040, 0xd8d0b8, 0x3a5a3a, 0x7a6a9a][(k + y * 3) % 5 | 0]), 1.95 + k * 0.48, y + 0.13, z, furn); }
  B(0.6, 0.85, 0.6, mWhite, 2.2, 0.425, -3.6, furn); B(0.6, 0.85, 0.6, mWhite, 2.9, 0.425, -3.6, furn);
  B(1.6, 0.45, 2.1, lam(tSheet), 5.7, 0.225, -2.6, furn); B(1.64, 0.1, 1.5, lam(tBlanket), 5.7, 0.5, -2.3, furn); B(1.6, 0.9, 0.08, lam(tWood), 5.7, 0.45, -3.66, furn);
  // primer piso: cama, mesita, lampara; cajas en el cuarto de guardar; bano 2
  B(1.5, 0.45, 2.0, lam(tSheet), 5.9, UY + 0.225, 2.6, upGroup); B(1.54, 0.1, 1.4, lam(tBlanket, 0x8090c0), 5.9, UY + 0.5, 2.9, upGroup); B(1.5, 1.0, 0.08, lam(tWood), 5.9, UY + 0.5, 1.56, upGroup); B(0.5, 0.12, 0.3, mWhite, 5.9, UY + 0.52, 1.85, upGroup);
  await place('side_table', 6.75, 4.4, -Math.PI / 2, 1, UY, upGroup); await place('table_lamp', 6.75, 4.4, 0, 1, UY + 0.55, upGroup);
  await place('painting_b', 1.57, 3.0, Math.PI / 2, 1, UY + 1.5, upGroup);
  for (const [x, z, s] of [[0.2, -3.5, 0.6], [0.9, -3.4, 0.5], [0.4, -2.8, 0.45], [5.5, -3.3, 0.7], [6.3, -3.4, 0.5]]) B(s, s * 0.8, s, lam(tShelf, 0xc8a878), x, UY + s * 0.4, z, upGroup);
  B(0.4, 0.4, 0.55, mWhite, 3.2, UY + 0.2, -0.3, upGroup); B(1.5, 0.5, 0.7, mWhite, 5.8, UY + 0.25, -1.1, upGroup);

  // ================= barricada de abajo: sofa volcado + comoda del dormitorio encima =================
  const dresser = await prop('dresser'); scene.add(dresser);   // 1.1 x 0.95 x 0.48, frente +z
  const SOFA_BAR = [SXM, 0.44, 3.97];
  const setSofa = (k) => {   // k 0 = en su lugar al pie de la escalera (parado), 1 = volcado contra los escalones
    sofa.position.set(SXM, 0.44 * k, ZB + 0.45 - 0.03 * k); sofa.rotation.set(Math.PI / 2 * k, 0, 0);
    if (k === 0) { sofa.position.set(SXM, 0, ZB + 0.5); }
  };
  const setDresser = (k, y0 = 0) => { dresser.position.set(SXM - 0.1, 0.88 + (1 - k) * 0.9, ZB + 0.38); dresser.rotation.set(0, 0, 0); dresser.visible = k > 0; };
  // ================= barricada de arriba: puerta de canto atornillada + estanteria pesada =================
  const topDoor = new THREE.Group(); scene.add(topDoor);
  { const mF = lam(tDoorP), mE = lam(null, 0xb8ac90); const d = B(SW - 0.02, 0.8, 0.045, [mE, mE, mE, mE, mF, mF], 0, 0.4, 0, topDoor); d.rotation.set(0, 0, 0);
    // la puerta de canto: textura de paneles girada (es una hoja acostada)
    d.material = [mE, mE, mE, mE, lam(L.cvs(64, 32, (c) => { const im = tDoorP.image; c.save(); c.translate(64, 0); c.rotate(Math.PI / 2); c.drawImage(im, 0, 0, 32, 64); c.restore(); })), lam(L.cvs(64, 32, (c) => { const im = tDoorP.image; c.save(); c.translate(64, 0); c.rotate(Math.PI / 2); c.drawImage(im, 0, 0, 32, 64); c.restore(); }))];
    for (const s of [-1, 1]) { B(0.06, 1.3, 0.06, lam(tWood, 0x9a7048), s * (SW / 2 - 0.05), 0.65, -0.06, topDoor); }   // listones atornillados a las paredes
  }
  topDoor.position.set(SXM, UY, ZT - 0.08);
  const topScrews = []; for (const [x, y] of [[-(SW / 2 - 0.05), 0.3], [-(SW / 2 - 0.05), 1.1], [SW / 2 - 0.05, 0.3], [SW / 2 - 0.05, 1.1]]) { const sh = L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8), mSteel, x, y, -0.093, topDoor); sh.rotation.x = Math.PI / 2; topScrews.push(sh); }
  const tShelfF = await L.loadTex('tex/ep10/shelf_front.png', 128);
  const shelf = new THREE.Group(); scene.add(shelf);
  { const SHW = 1.0, SHH = SHW * 1.36, mW = lam(tWood, 0x5a3a24); B(SHW, SHH, 0.38, [mW, mW, mW, mW, lam(null, 0x3a2414), lam(tShelfF, 0xffffff, { alphaTest: 0.5 })], 0, SHH / 2, 0, shelf); }   // frente = foto (mira a -z), dorso contra la puerta
  const setShelf = (k) => { shelf.position.set(SX0 + 0.62, UY, -0.75 + (ZT - 0.08 - 0.25 + 0.75) * k); };
  // ================= escalera de escape de cuerda (codigo): dos cuerdas + peldanos + ganchos sobre el alfeizar de UW =================
  const tRope = L.cvs(4, 16, (c) => { for (let y = 0; y < 16; y++) px(c, 0, y, y % 4 < 2 ? '#d8c08a' : '#a88c58', 4, 1); });
  const mRope = lam(L.rep(tRope, 1, 20)), mRung = lam(tWood, 0xc8a070), mHook = lam(null, 0x2a2a2e);
  const makeLadder = (len) => { const g = new THREE.Group(), ropes = [], rungs = [];
    for (const x of [-0.18, 0.18]) { const r = B(0.025, 1, 0.025, mRope, x, -0.5, 0, g); ropes.push(r); B(0.04, 0.05, 0.28, mHook, x, 0.02, -0.12, g); B(0.04, 0.16, 0.04, mHook, x, -0.06, -0.26, g); }
    for (let i = 0; i < Math.floor(len / 0.3); i++) { const r = L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 6), mRung, 0, -0.3 - i * 0.3, 0.0, g); r.rotation.z = Math.PI / 2; rungs.push(r); }
    return { g, set(u) { const L0 = len * u; ropes.forEach((r) => { r.scale.y = Math.max(0.01, L0); r.position.y = -L0 / 2; }); rungs.forEach((r) => { r.visible = -r.position.y <= L0 + 0.01; }); } }; };
  const uw = holes.UW, LADH = UY + uw.y0 - 0.05;
  const ladder = makeLadder(LADH); scene.add(ladder.g); ladder.g.position.set(uw.c, UY + uw.y0, uw.fixed + 0.14);
  const ladderRoll = new THREE.Group(); scene.add(ladderRoll); { for (let i = 0; i < 4; i++) { const r = L.mesh(new THREE.CylinderGeometry(0.06 + i * 0.02, 0.06 + i * 0.02, 0.44, 8, 1, true), lam(L.rep(tRope, 3, 1), 0xffffff, { side: THREE.DoubleSide }), 0, 0, 0, ladderRoll); r.rotation.z = Math.PI / 2; } }

  // ================= props de la historia (arriba) =================
  const water = await prop('water'), radio = await prop('radio'), spray = makeSpray(L);
  const tBpF = await L.loadTex('tex/ep10/backpack_front.png', 112), tBpS = await L.loadTex('tex/ep10/backpack_side.png', 112);
  const backpack = new THREE.Group();
  { const w = 0.32, h = w * 1.42, d = 0.18, mS = lam(tBpS), mF = lam(tBpF, 0xffffff, { alphaTest: 0.5 }), mT = lam(null, 0x56602e);
    B(w * 0.96, h * 0.94, d, [mS, mS, mT, mT, mF, mS], 0, h * 0.47, 0, backpack); B(w * 0.8, h * 0.4, 0.06, mF, 0, h * 0.25, d / 2 + 0.03, backpack).material = lam(L.cvs(8, 8, (c) => px(c, 0, 0, '#5c6834', 8, 8)));
    for (const x of [-0.09, 0.09]) B(0.04, h * 0.8, 0.02, lam(null, 0x3a2a1a), x, h * 0.5, -d / 2 - 0.01, backpack); }
  scene.add(water, radio, spray, backpack);
  const ITEMPOS = [[water, 1.0, -0.2, -1.2, 1], [backpack, 1.0, -0.55, -1.4, 1], [radio, 1.0, -0.9, -1.6, 1], [spray, 1.05, -1.2, -1.0, 1.6]];
  const setItems = (n) => ITEMPOS.forEach(([o, x, z, r, s], i) => { o.visible = i < n; o.position.set(x, UY, z); o.rotation.set(0, r, 0); o.scale.setScalar(s); });
  // maquina de escribir verde (sala de guardado) sobre la mesita del rellano
  await place('side_table', -0.22, -1.25, 0, 1, UY, upGroup);   // ep14: la escotilla va donde estaba la mesita
  const tw = new THREE.Group(); scene.add(tw); tw.position.set(-0.22, UY + 0.55, -1.25); tw.rotation.y = 0.5;
  const mG = lam(L.cvs(16, 16, (cx) => { const r = L.rng(81); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 14 - 7; px(cx, x, y, `rgb(${52 + n},${86 + n},${64 + n})`); } })), mK = lam(null, 0x161616), mKey = lam(null, 0xe8e2d0);
  B(0.42, 0.1, 0.3, mG, 0, 0.05, 0, tw); B(0.42, 0.08, 0.12, mG, 0, 0.13, -0.08, tw);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) { const kk = B(0.022, 0.012, 0.022, mKey, -0.14 + k * 0.031 + (r % 2) * 0.01, 0.105 + r * 0.012, 0.11 - r * 0.03, tw); kk.userData.key = r * 10 + k; }
  { const plat = L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.46, 8), mK, 0, 0.2, -0.1, tw); plat.rotation.z = Math.PI / 2; }
  const pcv = document.createElement('canvas'); pcv.width = 96; pcv.height = 128; const pt = new THREE.CanvasTexture(pcv); L.nearest(pt); pt.colorSpace = THREE.SRGBColorSpace;
  const paper = L.plane(0.24, 0.32, L.basic(pt), 0, 0.33, -0.1, tw, 0, -0.25);

  // ================= taladro del ep2 + tornillo de 3" del ep1 =================
  const tDrill = L.cvs(32, 16, (c, w, h) => { px(c, 0, 0, '#e8b818', w, h); px(c, 0, 0, '#f8d040', w, 3); px(c, 0, h - 3, '#a88010', w, 3); for (let x = 4; x < 12; x += 2) px(c, x, 5, '#2a2a2a', 1, 5); px(c, 16, 6, '#1a1a1a', 12, 4); px(c, 17, 7, '#e8e8e0', 3, 2); px(c, 21, 7, '#e8e8e0', 2, 2); px(c, 24, 7, '#e8e8e0', 3, 2); });
  const cylD = (rt, rb, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(rt, rb, h, n), m, x, y, z, p);
  function makeDrill() { const g = new THREE.Group(), mY = lam(tDrill), mB = lam(null, 0x1c1c1e);
    const grip = B(0.038, 0.12, 0.05, mB, 0, -0.005, 0, g); grip.rotation.x = 0.15; B(0.06, 0.09, 0.2, mY, 0, 0.1, 0.03, g); B(0.05, 0.06, 0.05, mB, 0, 0.1, -0.08, g);
    B(0.07, 0.05, 0.1, mB, 0, -0.09, 0.012, g); B(0.072, 0.012, 0.102, lam(null, 0xe8b818), 0, -0.065, 0.012, g); B(0.012, 0.022, 0.018, lam(null, 0xd03020), 0, 0.045, 0.032, g);
    const chk = new THREE.Group(); chk.position.set(0, 0.1, 0.13); g.add(chk); cylD(0.022, 0.016, 0.05, 8, mB, 0, 0, 0.025, chk).rotation.x = Math.PI / 2; cylD(0.013, 0.01, 0.03, 6, mSteel, 0, 0, 0.065, chk).rotation.x = Math.PI / 2;
    cylD(0.004, 0.004, 0.07, 5, lam(null, 0xd8dce0), 0, 0, 0.11, chk).rotation.x = Math.PI / 2; return { g, chuck: chk, tipLocal: V(0, 0.1, 0.13 + 0.145) }; }
  const DR = makeDrill(), drill = DR.g;
  const screw = new THREE.Group(); { const th = L.cvs(4, 16, (c) => { for (let y = 0; y < 16; y++) px(c, 0, y, y % 2 ? '#8a8e94' : '#d8dce0', 4, 1); }); L.mesh(new THREE.CylinderGeometry(0.0035, 0.002, 0.076, 6), lam(th), 0, 0, 0, screw); L.mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.003, 8), mSteel, 0, 0.038, 0, screw); }
  scene.add(screw);
  const bracket = new THREE.Group(); scene.add(bracket); B(0.05, 0.16, 0.005, mSteel, 0, 0.0, 0, bracket); B(0.05, 0.005, 0.1, mSteel, 0, -0.08, -0.05, bracket); bracket.position.set(SXM + 0.25, 0.95, ZB + 0.625);
  const bitL = L.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.4, 4), mSteel, 0, -9, 0, scene); bitL.visible = false;

  // ================= zombis =================
  const ZS = [];
  const mkZ = async (name, tex, h, clips, x, z, ry) => {
    const g = await L.loadModel(`models/${name}.glb`), r = L.ps1Clone(g.scene);
    if (tex) { const tt = await L.loadTex(tex, 256); tt.flipY = false; tt.needsUpdate = true; r.traverse((o) => { if (o.isMesh) { o.material.map = tt; o.material.color.set(0xffffff); o.material.needsUpdate = true; } }); }
    const w = new THREE.Group(); w.add(r); scene.add(w); r.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(r), k = h / (bb.max.y - bb.min.y); r.scale.multiplyScalar(k); r.position.y = -bb.min.y * k;
    w.position.set(x, 0, z); w.rotation.y = ry; const mx = new THREE.AnimationMixer(r), acts = {};
    for (const c of clips) { acts[c] = mx.clipAction(THREE.AnimationClip.findByName(g.animations, c)); acts[c].play(); acts[c].setEffectiveWeight(0); }
    let hip = null; r.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; }); const hip0 = hip.position.clone();
    const z1 = { w, home: [x, z, ry], pose(clip, t, { loop = true, root = false } = {}) { for (const a of Object.values(acts)) a.setEffectiveWeight(0); const a = acts[clip], d = a.getClip().duration; a.setEffectiveWeight(1); a.time = loop ? ((t % d) + d) % d : Math.min(d - 1e-3, Math.max(0, t)); mx.update(0); if (!root) hip.position.copy(hip0); } };
    w.visible = false; ZS.push(z1); return z1;
  };
  const TZ = 'tex/thin_zombie.png';
  // fuera de la puerta de entrada D1 (sur, x -1.6), mirando a la puerta (-z)
  const zA = await mkZ('thin-zombie', TZ, 1.78, ['attack2', 'walk', 'dead1'], -1.75, 5.42, Math.PI);
  const zB = await mkZ('city-zombie', null, 1.8, ['Zombie_Attack', 'Walking'], -1.25, 5.55, Math.PI + 0.25);
  const zC = await mkZ('thin-zombie', TZ, 1.76, ['attack1_r', 'walk'], -2.3, 5.6, Math.PI);
  const zD = await mkZ('city-zombie', null, 1.82, ['Zombie_Attack2', 'Walking'], -5.45, 3.8, Math.PI / 2);
  const zE = await mkZ('thin-zombie', TZ, 1.8, ['attack1_l'], -2.5, -4.45, 0);
  const zF = await mkZ('city-zombie', null, 1.78, ['Zombie_Attack'], 7.45, 2.5, -Math.PI / 2);
  const zOut = [zA, zB, zC, zD, zE, zF];
  // luces
  const livL = new THREE.PointLight(0xffd8a0, 6, 8, 1.3); livL.position.set(-2.5, 2.4, 2.8); scene.add(livL);
  const hallL = new THREE.PointLight(0xffe0b0, 5, 7, 1.4); hallL.position.set(0.45, 2.3, 4.2); scene.add(hallL);
  const upL = new THREE.PointLight(0xffe6c0, 6, 7, 1.3); upL.position.set(0.9, UY + 2.3, -0.6); scene.add(upL);
  const bedL = new THREE.PointLight(0xffe0b8, 5, 7, 1.3); bedL.position.set(4.2, UY + 2.3, 2.8); scene.add(bedL);
  const doorGlow = L.plane(0.9, 0.05, L.basic(null, 0xffe0a0, { transparent: true, opacity: 0, depthWrite: false, ...PO }), holes.D1.c, 0.012, 4.92, scene, 0, -Math.PI / 2);   // luz bajo la puerta (09)
  const feetShadow = []; for (const dx of [-0.12, 0.1]) { const f = L.plane(0.1, 0.06, L.basic(null, 0x000000, { transparent: true, opacity: 0, depthWrite: false, ...PO }), holes.D1.c + dx, 0.014, 4.93, scene, 0, -Math.PI / 2); feetShadow.push(f); }

  // ================= Ava =================
  const ch = L.hero(); scene.add(ch.root); paintScared(ch);
  const AVA = (x, z, yaw, y = 0) => { ch.root.position.set(x, y, z); ch.root.rotation.y = yaw; };
  let DRILL_TIP0;
  { const palmOf = (side, d = 0.78) => ch.hand(side).localToWorld(V(0, d, 0)), basis = (x, y, z) => new THREE.Matrix4().makeBasis(x, y, z);
    ch.root.position.set(0, 0, 0); ch.root.rotation.y = Math.PI; ch.pose(0, L.still('drill', 0)); ch.root.updateMatrixWorld(true);
    const p = palmOf('R'), mW = basis(V(-1, 0, 0), V(0, 1, 0), V(0, 0, -1)).setPosition(p); ch.hand('R').add(drill); ch.hand('R').matrixWorld.clone().invert().multiply(mW).decompose(drill.position, drill.quaternion, drill.scale);
    drill.updateMatrixWorld(true); DRILL_TIP0 = drill.localToWorld(DR.tipLocal.clone()); drill.visible = false; }   // punta con Ava en el origen mirando a -z
  const handW = (side) => ch.hand(side).getWorldPosition(V());

  // ================= estado =================
  const state = ({ flashK = {}, sofaK = -1, dresserK = 0, topDoorOn = false, screwsK = 0, shelfK = -1, items = 0, ladderK = -1, sash = 0, d1 = 0, drillOn = false, zOut: zo = false, glowK = 0, up = true, twOn = true } = {}) => {
    for (const [id, m] of Object.entries(flashes)) m.opacity = flashK[id.replace(/_floor$/, '')] ?? 0;
    if (sofaK < 0) { sofa.position.set(SOFA_HOME[0], 0, SOFA_HOME[2]); sofa.rotation.set(0, 0, 0); } else setSofa(sofaK);
    setDresser(dresserK); topDoor.visible = topDoorOn; topScrews.forEach((s, i) => { s.visible = screwsK > i / 4; });
    shelf.visible = shelfK >= 0; if (shelfK >= 0) setShelf(shelfK);
    setItems(items); ladder.g.visible = ladderK > 0; ladder.set(Math.max(0, ladderK)); ladderRoll.visible = false;
    glass.UW.sash.position.y = 0.55 * sash; glass.UW.sash.visible = true;
    leaves.D1.g.rotation.y = d1; leaves.D1.hdl.rotation.z = 0;
    drill.visible = drillOn; screw.visible = false; bracket.visible = sofaK >= 1 && dresserK > 0; bitL.visible = false;
    zOut.forEach((z) => { z.w.visible = false; z.w.position.set(z.home[0], 0, z.home[1]); z.w.rotation.set(0, z.home[2], 0); }); if (zo) zOut.forEach((z) => { z.w.visible = true; });
    doorGlow.material.opacity = 0.7 * glowK; feetShadow.forEach((f) => { f.material.opacity = 0.85 * glowK; });
    upGroup.visible = up; tw.visible = twOn; ch.root.visible = true; upCut.forEach((o) => { o.visible = true; }); Object.values(winGroups).forEach((g) => { g.visible = true; });
  };
  const out = {};
  const hitK = (t, hits, dur = 0.22) => { let k = 0; for (const h of hits) { const d = t - h; if (d >= 0 && d < dur) k = Math.max(k, (1 - d / dur) * Math.cos(d * 60)); } return k; };
  const ROOMLAB = { LIVING: [-3.7, 4.0, 0], KITCHEN: [-2.5, -1.7, 0] };
  const label3 = (o, c, x, y, z, s, k, col = '#f0f0e8', sc = 2) => { const [sx, sy] = L.toScreen(c, x, y, z); o.tctx.globalAlpha = k; bitText(o.tctx, s, sx, sy, sc, col, { outline: '#000000' }); o.tctx.globalAlpha = 1; };


  // =====================================================================================================================
  // EP14: desvan (losa con escotilla + escalera plegable), techo a dos aguas, exterior nocturno con vecinos, el gigante.
  // =====================================================================================================================
  const AY = UY + WH + 0.08, HX0 = 1.3, HX1 = 2.3, HZ0 = -1.25, HZ1 = -0.55, HZC = (HZ0 + HZ1) / 2;
  const RX0 = -0.6, RX1 = 7, RZ0 = -4, RZ1 = 5, RXM = (RX0 + RX1) / 2, RHALF = (RX1 - RX0) / 2, RH = 2.6, RA = Math.atan2(RH, RHALF);
  const roofY = (x) => AY + RH * (1 - Math.abs(x - RXM) / RHALF);
  const attic = new THREE.Group(); scene.add(attic);
  const tIns = L.cvs(32, 32, (c) => { const r = L.rng(301); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = (r() - 0.5) * 34; px(c, x, y, `rgb(${214 + n},${150 + n * 0.8},${150 + n * 0.8})`); } for (let k = 0; k < 40; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(255,220,220,0.6)', 2, 1); px(c, 0, 0, '#7a5a3a', 3, 32); px(c, 3, 0, '#4a3420', 1, 32); });   // fibra de vidrio rosa entre vigas
  const tPly = L.cvs(32, 32, (c) => { const r = L.rng(302); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 8 * Math.sin(y * 0.9 + Math.sin(x * 0.2) * 2) + r() * 8; px(c, x, y, `rgb(${168 + n},${132 + n * 0.8},${88 + n * 0.6})`); } px(c, 0, 15, '#5a3e20', 32, 1); px(c, 0, 31, '#5a3e20', 32, 1); for (const [x, y] of [[3, 3], [28, 3], [3, 19], [28, 19]]) px(c, x, y, '#3a3a3a', 1, 1); });
  const tSheath = L.cvs(32, 32, (c) => { const r = L.rng(303); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 9 * Math.sin(x * 0.5 + y * 0.05) + r() * 10; px(c, x, y, `rgb(${120 + n},${86 + n * 0.7},${54 + n * 0.5})`); } for (let x = 0; x < 32; x += 8) px(c, x, 0, '#3a2414', 1, 32); for (let k = 0; k < 5; k++) px(c, r() * 32 | 0, r() * 32 | 0, '#2a1a0c', 2, 2); });
  const tShingle = L.cvs(32, 32, (c) => { const r = L.rng(304); for (let y = 0; y < 32; y++) { const row = y >> 3; for (let x = 0; x < 32; x++) { const tab = ((x + (row % 2) * 4) >> 3); const n = (r() - 0.5) * 14 + ((tab * 7 + row * 3) % 5) * 4; const edge = (y % 8) === 7 ? 0.55 : 1; px(c, x, y, `rgb(${(58 + n) * edge | 0},${(56 + n) * edge | 0},${(60 + n) * edge | 0})`); } } for (let k = 0; k < 8; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(90,110,80,0.6)', 2, 1); });
  const mInsT = (w, d) => rm(tIns, w / 0.6, d / 1.2), mCeil2 = lam(null, 0xdedad0);
  const slabS = [];
  for (const [x0, x1, z0, z1] of [[RX0, RX1, RZ0, HZ0], [RX0, RX1, HZ1, 0.1], [RX0, RX1, 0.1, RZ1], [RX0, HX0, HZ0, HZ1], [HX1, RX1, HZ0, HZ1]]) {
    const w = x1 - x0, d = z1 - z0; const sb = B(w, 0.08, d, [mCap, mCap, mInsT(w, d), mCeil2, mCap, mCap], (x0 + x1) / 2, AY - 0.04, (z0 + z1) / 2, attic); if (z0 === 0.1) slabS.push(sb); }
  // tablas de paso (contrachapado) y vigas a la vista
  const floorBoard = (x0, x1, z0, z1) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil((x1 - x0) / 0.4), Math.ceil((z1 - z0) / 0.4)); const o = L.mesh(g, rm(tPly, (x1 - x0) / 1.2, (z1 - z0) / 1.2, 0xffffff, 'lam'), (x0 + x1) / 2, AY + 0.025, (z0 + z1) / 2, attic); o.rotation.x = -Math.PI / 2; o.material.polygonOffset = true; o.material.polygonOffsetFactor = -2; o.material.polygonOffsetUnits = -6; return o; };
  floorBoard(2.45, 5.4, -2.8, 3.6); floorBoard(1.15, 2.45, -0.45, 0.4); floorBoard(1.15, 2.45, -2.1, -1.35);
  for (const x of [-0.3, 0.3, 0.9, 5.75, 6.35]) B(0.06, 0.05, RZ1 - RZ0 - 0.2, lam(tWood, 0x8a6a44), x, AY + 0.025, (RZ0 + RZ1) / 2, attic);
  // techo: dos faldones (tejas afuera, tablas adentro), cabios, cumbrera, hastiales
  const LR = (RHALF + 0.4) / Math.cos(RA), roof = {};
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); scene.add(g); roof[s] = g; g.position.set(RXM, AY + RH + 0.07, (RZ0 + RZ1) / 2); g.rotation.z = -s * RA;
    B(LR, 0.1, RZ1 - RZ0 + 0.7, [mCap, mCap, rm(tShingle, LR / 0.8, (RZ1 - RZ0 + 0.7) / 0.8), rm(tSheath, LR / 1.0, (RZ1 - RZ0) / 1.0), mCap, mCap], s * LR / 2, 0, 0, g);
    for (let z = RZ0 + 0.3; z < RZ1; z += 0.6) B(LR - 0.4, 0.14, 0.05, lam(tWood, 0x7a5434), s * (LR / 2 - 0.1), -0.12, z - (RZ0 + RZ1) / 2, g);   // cabios
  }
  B(0.12, 0.18, RZ1 - RZ0, lam(tWood, 0x6a4628), RXM, AY + RH - 0.12, (RZ0 + RZ1) / 2, attic);   // cumbrera
  for (const z of [-2.5, -0.1, 2.3]) B(RHALF * 1.1, 0.05, 0.12, lam(tWood, 0x7a5434), RXM, AY + RH * 0.55, z, attic);   // tirantes
  const tri = new THREE.Shape(); tri.moveTo(-RHALF, 0); tri.lineTo(RHALF, 0); tri.lineTo(0, RH + 0.02); tri.closePath();
  const triUV = (geo) => { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + RHALF) / 1.0, p.getY(i) / 1.0); uv.needsUpdate = true; return geo; };
  const gables = {};
  for (const [z, sgn] of [[RZ1, 1], [RZ0, -1]]) {
    const gg = new THREE.Group(); scene.add(gg); gables[z] = gg;
    const out = L.mesh(triUV(new THREE.ShapeGeometry(tri)), lam(L.rep(tSiding, 1, 1)), RXM, AY - 0.08, z + sgn * 0.065, gg); if (sgn < 0) out.rotation.y = Math.PI;
    const inn = L.mesh(triUV(new THREE.ShapeGeometry(tri)), lam(L.rep(tSheath, 1, 1)), RXM, AY - 0.08, z - sgn * 0.0, gg); if (sgn > 0) inn.rotation.y = Math.PI;
    // rejilla de ventilacion (listones) en el hastial
    const vent = new THREE.Group(); gg.add(vent); vent.position.set(RXM, AY + 1.25, z + sgn * 0.07); if (sgn < 0) vent.rotation.y = Math.PI;
    B(0.7, 0.6, 0.04, lam(null, 0x101418), 0, 0, -0.02, vent); for (let k = 0; k < 5; k++) { const sl = B(0.66, 0.06, 0.04, lam(null, 0xe8e4da), 0, -0.24 + k * 0.12, 0.01, vent); sl.rotation.x = 0.6; }
    B(0.78, 0.05, 0.06, lam(null, 0xe8e4da), 0, 0.32, 0, vent); B(0.78, 0.05, 0.06, lam(null, 0xe8e4da), 0, -0.32, 0, vent);
  }
  // rayos de luna por la rejilla sur (cono aditivo tenue) + molduras exteriores
  const moonShaft = L.mesh(new THREE.ConeGeometry(0.5, 3.2, 8, 1, true), L.basic(null, 0x9ab4ff, { transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }), RXM, AY + 0.9, RZ1 - 1.5, attic); moonShaft.rotation.x = -1.2;
  for (const [x0, x1, z0, z1] of [[RX0 - 0.05, RX1 + 0.05, RZ1 + 0.04, RZ1 + 0.1], [RX0 - 0.05, RX1 + 0.05, RZ0 - 0.1, RZ0 - 0.04], [RX0 - 0.1, RX0 - 0.04, RZ0, RZ1], [RX1 + 0.04, RX1 + 0.1, RZ0, RZ1]]) B(x1 - x0, 0.14, z1 - z0, lam(null, 0xe8e4da), (x0 + x1) / 2, UY + WH + 0.02, (z0 + z1) / 2, attic);
  // techo de la planta baja (living/cocina, una sola planta)
  const lowRoof = new THREE.Group(); scene.add(lowRoof);
  { const len = Math.hypot(4.8, 0.7), r = B(len, 0.1, RZ1 - RZ0 + 0.6, [mCap, mCap, rm(tShingle, len / 0.8, 12), lam(null, 0xdedad0), mCap, mCap], -2.85, WH + 0.38, (RZ0 + RZ1) / 2, lowRoof); r.rotation.z = Math.atan2(0.7, 4.8); }
  // escotilla: marco, tapa abisagrada (queda ABIERTA colgando) y escalera plegable de madera
  const mTrim = lam(null, 0xece8de);
  for (const [w, d, x, z] of [[HX1 - HX0 + 0.12, 0.06, (HX0 + HX1) / 2, HZ0 - 0.03], [HX1 - HX0 + 0.12, 0.06, (HX0 + HX1) / 2, HZ1 + 0.03], [0.06, HZ1 - HZ0, HX0 - 0.03, HZC], [0.06, HZ1 - HZ0, HX1 + 0.03, HZC]]) B(w, 0.03, d, mTrim, x, UY + WH - 0.015, z, attic);
  const hatch = new THREE.Group(); scene.add(hatch); hatch.position.set(HX0, UY + WH - 0.01, HZ0);   // v2: bisagra en el borde largo sur: la tapa abierta cuelga al costado de la escalera (no la atraviesa Ava)
  { const tP = L.cvs(16, 16, (c) => { px(c, 0, 0, '#e4e0d4', 16, 16); px(c, 0, 0, '#c8c0b0', 16, 1); px(c, 0, 15, '#a8a090', 16, 1); });
    B(HX1 - HX0 - 0.02, 0.03, HZ1 - HZ0 - 0.02, lam(tP), (HX1 - HX0) / 2, 0, (HZ1 - HZ0) / 2, hatch); const cord = new THREE.Group(); hatch.add(cord); hatch.userData.cord = cord; B(0.02, 0.5, 0.01, lam(null, 0xd8d0b8), HX1 - HX0 - 0.1, -0.25, (HZ1 - HZ0) / 2, cord); B(0.04, 0.05, 0.04, lam(null, 0xd0a850), HX1 - HX0 - 0.1, -0.52, (HZ1 - HZ0) / 2, cord); }   // cordon con tirador
  const LX0 = 1.45, LXT = HX1 - 0.07, TANL = (LXT - LX0) / (WH + 0.02), LX = (y) => LX0 + (y - UY) * TANL, RY = (k) => UY + 0.28 + 0.3 * k;
  const atLad = new THREE.Group(); scene.add(atLad);
  { const len = (WH + 0.05) / Math.cos(Math.atan(TANL)), mR = lam(tWood, 0xb08858);
    for (const dz of [-0.23, 0.23]) { const r = B(0.05, len, 0.07, mR, (LX0 + LXT) / 2, UY + (WH + 0.02) / 2, HZC + dz, atLad); r.rotation.z = -Math.atan(TANL); }
    for (let k = 0; k < 8; k++) { const y = RY(k); B(0.09, 0.03, 0.44, mR, LX(y), y - 0.02, HZC, atLad); } }
  // utileria del desvan: colchon (se desenrolla), agua, spray, hierba verde, linterna, baul, cajas, maleta
  const tTick = L.cvs(32, 32, (c) => { for (let x = 0; x < 32; x++) px(c, x, 0, (x % 6) < 2 ? '#5a74a8' : '#e6e2d6', 1, 32); const r = L.rng(305); for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(120,100,60,0.25)', 2, 2); for (let y = 6; y < 32; y += 12) for (let x = 6; x < 32; x += 12) px(c, x, y, '#3a4a70', 2, 2); });
  const matt = new THREE.Group(); scene.add(matt); { const mT = lam(L.rep(tTick, 2, 4)), mS = lam(L.rep(tTick, 4, 1)); B(0.95, 0.17, 1.9, [mS, mS, mT, mT, mS, mS], 0, 0.085, 0, matt); B(0.55, 0.1, 0.32, lam(tSheet), 0, 0.2, -0.72, matt); }
  const mattRoll = new THREE.Group(); scene.add(mattRoll); { const r = L.mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.95, 10), lam(L.rep(tTick, 3, 1)), 0, 0.22, 0, mattRoll); r.rotation.z = Math.PI / 2; for (const x of [-0.3, 0.3]) { const st = L.mesh(new THREE.TorusGeometry(0.225, 0.015, 4, 10), lam(null, 0x6a3a1c), x, 0.22, 0, mattRoll); st.rotation.y = Math.PI / 2; } }
  const MATT = V(3.7, AY + 0.03, 1.0);
  const jugs = []; for (let i = 0; i < 2; i++) { const j = await prop('water'); scene.add(j); jugs.push(j); }
  const atSpray = makeSpray(L); scene.add(atSpray); atSpray.scale.setScalar(1.6);
  const tLeaf = L.cvs(16, 16, (c) => { c.fillStyle = '#2e8a2a'; c.beginPath(); c.ellipse(8, 9, 4, 7, 0, 0, 7); c.fill(); px(c, 8, 3, '#1a5a18', 1, 12); px(c, 6, 6, '#5ac04a', 1, 2); px(c, 10, 9, '#5ac04a', 1, 2); });
  const herb = new THREE.Group(); scene.add(herb);
  { const tPot = L.cvs(16, 16, (c) => { px(c, 0, 0, '#b0603a', 16, 16); px(c, 0, 0, '#d07a4a', 16, 3); px(c, 0, 13, '#7a3e22', 16, 3); });
    L.mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.2, 8), lam(tPot), 0, 0.1, 0, herb); L.mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.02, 8), lam(null, 0x3a2614), 0, 0.19, 0, herb);
    for (let k = 0; k < 7; k++) { const lf = L.plane(0.12, 0.2, lam(tLeaf, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide }), Math.cos(k * 2.4) * 0.04, 0.28 + (k % 3) * 0.04, Math.sin(k * 2.4) * 0.04, herb, k * 0.9, -0.35); lf.rotation.order = 'YXZ'; } }
  const atChest = await prop('chest'); scene.add(atChest); atChest.position.set(5.2, AY + 0.02, -2.2); atChest.rotation.y = -Math.PI / 2;
  const tCard = L.cvs(16, 16, (c) => { px(c, 0, 0, '#b08a5a', 16, 16); px(c, 0, 7, '#d8c890', 16, 2); px(c, 3, 3, '#5a4028', 5, 1); });
  for (const [x, z, s, y0] of [[5.6, 2.6, 0.55, 0], [5.6, 2.6, 0.4, 0.44], [5.3, 3.4, 0.5, 0], [1.0, 2.4, 0.5, 0], [1.1, 3.1, 0.42, 0], [5.9, -0.6, 0.45, 0]]) { const bx = B(s, s * 0.8, s, lam(tCard), x, AY + y0 + s * 0.4, z, attic); bx.rotation.y = x * 1.7; }
  { const su = B(0.6, 0.18, 0.42, lam(null, 0x6a2e24), 4.9, AY + 0.09, 3.3, attic); su.rotation.y = 0.4; B(0.12, 0.03, 0.03, lam(null, 0x2a1a10), 4.9, AY + 0.2, 3.3, attic).rotation.y = 0.4; }
  const atTorch = await prop('flashlight'); scene.add(atTorch);
  // charco de luz de linterna (mismo recurso que el largo 3: raycast + disco aditivo)
  const tPoolX = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,246,214,1)'); g.addColorStop(0.55, 'rgba(255,238,196,0.55)'); g.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const mkPool = (skip) => { const pool = L.mesh(new THREE.CircleGeometry(1, 20), L.basic(tPoolX, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), 0, 0, 0, scene); pool.renderOrder = 5; pool.visible = false;
    const rc = new THREE.Raycaster(), N3 = new THREE.Matrix3(), shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    const fn = (lp, d, k) => { const own = new Set(); skip.forEach((r) => r.traverse((o) => own.add(o))); const cand = []; scene.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh && o !== pool && !own.has(o) && !(o.material && (o.material.transparent || o.material.blending === THREE.AdditiveBlending)) && shown(o)) cand.push(o); });
      rc.set(lp, d); rc.near = 0.08; rc.far = 14; const hit = rc.intersectObjects(cand, false)[0]; if (!hit || !hit.face || k <= 0) { pool.visible = false; return; }
      const n = hit.face.normal.clone().applyMatrix3(N3.getNormalMatrix(hit.object.matrixWorld)).normalize(); if (n.dot(d) > 0) n.negate(); const r = Math.max(0.18, hit.distance * 0.32);
      pool.visible = true; pool.position.copy(hit.point).addScaledVector(n, 0.012); pool.lookAt(hit.point.clone().add(n)); pool.scale.set(r, r, 1); pool.material.opacity = Math.min(0.55, k * 0.65 / (1 + 0.03 * hit.distance * hit.distance)); };
    fn.pool = pool; return fn; };
  // linterna en la mano derecha de Ava (haz = SpotLight + cono tenue + charco)
  const handTorch = await prop('flashlight'); L.holdIn(ch, handTorch, 'R', [0, 0.75, 0.22], [0, 0, Math.PI / 2]); handTorch.visible = false;
  const hBeam = new THREE.SpotLight(0xfff0d0, 0, 9, 0.42, 0.5, 1.3); handTorch.add(hBeam); hBeam.position.set(0.1, 0, 0); const hTgt = new THREE.Object3D(); hTgt.position.set(3, 0, 0); handTorch.add(hTgt); hBeam.target = hTgt;
  const handPool = mkPool([ch.root]), atPool = mkPool([ch.root]);
  const torchOn = (on, k = 1) => { handTorch.visible = on; hBeam.intensity = on ? 9 * k : 0; if (!on) { handPool(V(), V(0, -1, 0), 0); return; } ch.root.updateMatrixWorld(true); const lp = handTorch.localToWorld(V(0.11, 0, 0)); handPool(lp, handTorch.localToWorld(V(1.11, 0, 0)).sub(lp).normalize(), k); };
  const atBeam = new THREE.SpotLight(0xfff0d0, 0, 7, 0.45, 0.5, 1.3); scene.add(atBeam, atBeam.target);
  const atticGlow = new THREE.PointLight(0xffd8a8, 0, 4.5, 1.4); scene.add(atticGlow);
  const keyL = new THREE.PointLight(0xb8c8ff, 0, 6, 1.3); scene.add(keyL);   // luz de relleno de luna para planos del gigante
  const atticOn = (k = 1) => {   // linterna apoyada en el colchon, apuntando al piso (regla: nunca hacia la ventana)
    atTorch.visible = true; atTorch.position.set(MATT.x + 0.62, AY + 0.06, MATT.z + 0.55); atTorch.rotation.set(0, -2.3, -0.32); atTorch.updateMatrixWorld(true);
    const lp = atTorch.localToWorld(V(0.11, 0, 0)), d = atTorch.localToWorld(V(1.11, 0, 0)).sub(lp).normalize();
    atBeam.position.copy(lp); atBeam.target.position.copy(lp.clone().addScaledVector(d, 2)); atBeam.intensity = 8 * k; atPool(lp, d, k); atticGlow.position.set(MATT.x + 0.3, AY + 0.9, MATT.z); atticGlow.intensity = 2.2 * k; };
  // manta sobre la ventana de arriba UW (cae desde la barra en "blanket")
  const uwh = holes.UW, blanket = new THREE.Group(); scene.add(blanket); blanket.position.set(uwh.c, UY + uwh.y1 + 0.2, uwh.fixed - 0.1);
  { const tB2 = L.cvs(32, 32, (c) => { const r = L.rng(306); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const fold = 12 * Math.sin(x * 0.7); const n = (r() - 0.5) * 12 + fold; px(c, x, y, `rgb(${120 + n},${34 + n * 0.3},${30 + n * 0.3})`); } for (let y = 4; y < 32; y += 10) px(c, 0, y, 'rgba(240,210,150,0.55)', 32, 2); });
    const g = new THREE.PlaneGeometry(1.5, 1.6, 8, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, -0.035 * Math.cos(p.getX(i) * 9)); g.computeVertexNormals();
    const m = L.mesh(g, lam(tB2, 0xffffff, { side: THREE.DoubleSide }), 0, -0.8, 0, blanket); m.rotation.y = Math.PI; blanket.userData.m = m;
    L.mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.7, 6), mSteel, 0, 0, 0.02, blanket).rotation.z = Math.PI / 2; }
  const setBlanket = (k) => { blanket.visible = k > 0; const s = Math.max(0.02, k); blanket.userData.m.scale.y = s; blanket.userData.m.position.y = -0.8 * s; };

  // ---------------- exterior nocturno: calle, vereda, cerca, arboles, buzon, autos, casas vecinas, luna y estrellas ----------------
  const ext = new THREE.Group(); scene.add(ext);
  const tAsph = noiseTex(32, 32, [44, 44, 48], 12, 310, (c, r) => { for (let k = 0; k < 10; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(20,20,22,0.8)', 3, 1); });
  const tConc = noiseTex(32, 32, [128, 126, 120], 12, 311, (c) => { px(c, 0, 0, '#6a6862', 32, 1); px(c, 0, 0, '#6a6862', 1, 32); });
  const flat = (x0, x1, z0, z1, mat, y) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil((x1 - x0) / 2), Math.ceil((z1 - z0) / 2)); const o = L.mesh(g, mat, (x0 + x1) / 2, y, (z0 + z1) / 2, ext); o.rotation.x = -Math.PI / 2; return o; };
  flat(-80, 80, 9.4, 15.4, rm(tAsph, 40, 2), -0.03); flat(-80, 80, 6.9, 8.9, rm(tConc, 80, 1), 0.02); B(160, 0.14, 0.15, lam(null, 0x9a9890), 0, 0.0, 9.0, ext);
  flat(-80, 80, 15.9, 17.9, rm(tConc, 80, 1), 0.02); B(160, 0.14, 0.15, lam(null, 0x9a9890), 0, 0.0, 15.75, ext);
  for (let x = -78; x < 80; x += 4) B(1.8, 0.005, 0.12, L.basic(null, 0xb89a3a), x, -0.02, 12.4, ext);   // linea amarilla
  flat(holes.D1.c - 0.5, holes.D1.c + 0.5, 5.05, 6.9, rm(tConc, 1, 2), 0.015);   // caminito a la puerta
  const tPick = L.cvs(8, 16, (c) => { px(c, 0, 0, '#d8d4c8', 8, 16); px(c, 0, 0, '#a8a498', 1, 16); });
  for (let x = -5.2; x < 7.4; x += 0.22) if (Math.abs(x - holes.D1.c) > 0.6) { const p = B(0.08, 0.8, 0.03, lam(tPick), x, 0.4, 6.6, ext); p.rotation.z = 0; }
  B(12.6, 0.06, 0.04, lam(null, 0xd8d4c8), 1.1, 0.55, 6.62, ext); B(12.6, 0.06, 0.04, lam(null, 0xd8d4c8), 1.1, 0.25, 6.62, ext);
  { const mb = new THREE.Group(); ext.add(mb); mb.position.set(2.6, 0, 7.4); B(0.06, 1.0, 0.06, lam(tWood), 0, 0.5, 0, mb); B(0.22, 0.24, 0.46, lam(null, 0x2a3a5a), 0, 1.1, 0, mb); B(0.04, 0.12, 0.02, lam(null, 0xc02020), 0.13, 1.2, 0.1, mb); }
  const tBark = noiseTex(8, 16, [70, 52, 36], 18, 312), tLeafs = noiseTex(16, 16, [32, 62, 34], 22, 313);
  const tree = (x, z, s = 1) => { const g = new THREE.Group(); ext.add(g); g.position.set(x, 0, z); g.scale.setScalar(s); L.mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.2, 6), lam(tBark), 0, 1.1, 0, g); for (const [y, r] of [[2.4, 1.5], [3.4, 1.2], [4.3, 0.8]]) L.mesh(new THREE.ConeGeometry(r, 1.6, 7), lam(tLeafs), 0, y, 0, g); return g; };
  for (const [x, z, s] of [[-7.5, 7.8, 1.2], [8.2, 7.6, 1.0], [-14, -6, 1.4], [16, -7, 1.3], [-22, 8, 1.1], [20, -6, 1.2], [-6, 18.6, 1.0], [6, 18.6, 1.1], [-30, -2, 1.5], [30, 0, 1.4], [0, -9, 1.6]]) tree(x, z, s);
  const bush = (x, z, s) => { const o = L.mesh(new THREE.IcosahedronGeometry(0.5, 0), lam(tLeafs, 0x8aa880), x, 0.3 * s, z, ext); o.scale.set(s, s * 0.7, s); };
  for (const [x, z, s] of [[-4.2, 5.5, 1], [-3.0, 5.45, 0.8], [1.6, 5.5, 0.9], [3.2, 5.5, 1.1], [5.0, 5.45, 0.9], [6.4, 5.5, 1]]) bush(x, z, s);
  // casas vecinas (cajas con tablas, techo a dos aguas, ventanas oscuras/una encendida, puerta)
  const tWinD = L.cvs(16, 16, (c) => { px(c, 0, 0, '#d8d4c8', 16, 16); px(c, 2, 2, '#141a26', 12, 12); px(c, 7, 2, '#d8d4c8', 2, 12); px(c, 2, 7, '#d8d4c8', 12, 2); });
  const mkHouse = (cx, cz, w, d, h, rh, col, ry = 0) => { const g = new THREE.Group(); ext.add(g); g.position.set(cx, 0, cz); g.rotation.y = ry;
    B(w, h, d, rm(tSiding, w / 1.0, h / 1.0, col), 0, h / 2, 0, g); const a = Math.atan2(rh, w / 2), lr = (w / 2 + 0.35) / Math.cos(a);
    for (const s of [-1, 1]) { const rg = new THREE.Group(); g.add(rg); rg.position.set(0, h + rh + 0.06, 0); rg.rotation.z = -s * a; B(lr, 0.1, d + 0.6, [mCap, mCap, rm(tShingle, lr / 0.8, d / 0.8, 0xb0b0b8), mCap, mCap, mCap], s * lr / 2, 0, 0, rg); }
    const tr2 = new THREE.Shape(); tr2.moveTo(-w / 2, 0); tr2.lineTo(w / 2, 0); tr2.lineTo(0, rh); tr2.closePath();
    for (const s of [-1, 1]) { const m = L.mesh(new THREE.ShapeGeometry(tr2), lam(null, col), 0, h, s * (d / 2 + 0.005), g); if (s < 0) m.rotation.y = Math.PI; }
    for (const s of [-1, 1]) for (const x of [-w * 0.3, w * 0.3]) L.plane(0.9, 1.0, lam(tWinD), x, 1.5, s * (d / 2 + 0.01), g, s < 0 ? Math.PI : 0);
    B(0.9, 2.0, 0.06, lam(tDoorP), 0, 1.0, d / 2 + 0.03, g); return g; };
  const NEIGH = mkHouse(12.4, 0.6, 7.2, 8.6, 2.9, 2.1, 0xc8b8a0);   // el vecino de al lado (su techo: la opcion 2)
  for (const [x, z, w, d, col, ry] of [[-12.6, 0.4, 7, 8.4, 0xa8b8c0, 0], [-25, 0, 8, 9, 0xb8a890, 0], [25, 0.5, 7.5, 8.5, 0x9aa8b8, 0], [-13, 24, 7.5, 8, 0xc0b090, Math.PI], [0, 24.5, 8, 8.5, 0xa8b0a0, Math.PI], [13.5, 24, 7, 8, 0xc8c0b0, Math.PI],
    [-26, 24, 7.5, 8.5, 0xb0a8a0, Math.PI], [26, 24, 7, 8, 0xa0a8b0, Math.PI], [-13, -16, 7, 8, 0xb0b0a0, 0], [0, -17, 8, 8, 0xc0b8a8, 0], [13, -16, 7, 8, 0xa8a8b8, 0], [-38, 0, 8, 9, 0xb8b0a0, 0], [38, 0, 8, 9, 0xa8b0b8, 0]]) mkHouse(x, z, w, d, 2.8, 2.0, col, ry);
  const cars = []; for (const [f, col, x, z, ry] of [['car_a', 0x6a7a8a, -6.5, 10.6, Math.PI / 2], ['car_b', 0x7a2a22, 9.5, 14.2, -Math.PI / 2 + 0.1]]) { const m = await prop(f), g = new THREE.Group(); g.add(m); m.rotation.y = Math.PI; m.updateMatrixWorld(true); let bb = new THREE.Box3().setFromObject(m); const k = 4.2 / (bb.max.z - bb.min.z); m.scale.multiplyScalar(k); m.updateMatrixWorld(true); bb = new THREE.Box3().setFromObject(m); m.position.y = -bb.min.y; m.traverse((o) => { if (o.isMesh && /blue/i.test(o.material.name || '')) o.material = lam(null, col); }); g.position.set(x, 0, z); g.rotation.y = ry; ext.add(g); cars.push(g); }
  for (const x of [-18, 0, 18]) { const p = new THREE.Group(); ext.add(p); p.position.set(x + 4, 0, 8.6); L.mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), lam(null, 0x3a3e44), 0, 2.1, 0, p); B(0.08, 0.08, 1.0, lam(null, 0x3a3e44), 0, 4.15, 0.45, p); B(0.3, 0.12, 0.45, lam(null, 0x2a2e34), 0, 4.08, 0.9, p); }   // farolas apagadas (sin luz)
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#f4f0e0'); g.addColorStop(0.42, '#e8e4d0'); g.addColorStop(0.5, 'rgba(200,210,255,0.35)'); g.addColorStop(1, 'rgba(120,140,220,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); px(c, 12, 11, 'rgba(160,160,150,0.7)', 3, 2); px(c, 18, 17, 'rgba(160,160,150,0.7)', 2, 2); }), fog: false, depthWrite: false })); moon.scale.set(14, 14, 1); moon.position.set(-30, 48, -120); scene.add(moon);
  { const N = 260, g = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), r = L.rng(320); for (let i = 0; i < N; i++) { const a = r() * Math.PI * 2, e = 0.12 + r() * 1.2, R = 150; pos.set([Math.cos(a) * Math.cos(e) * R, 10 + Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R], i * 3); } g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 1.0, sizeAttenuation: false, fog: false }))); }
  scene.fog = new THREE.Fog(0x0a0f1e, 40, 130);
  // anillos de sonido grave (09)
  const rings = []; for (let i = 0; i < 3; i++) { const r = L.mesh(new THREE.RingGeometry(0.92, 1, 48), L.basic(null, 0xff7b2e, { transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 1.5, 0.3, 0.5, scene); r.rotation.x = -Math.PI / 2; r.renderOrder = 7; rings.push(r); }
  // llama chiquita en la rejilla del desvan (04, "one small flame")
  const tFl = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.3, 'rgba(255,190,90,0.9)'); g.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: tFl, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); flame.position.set(uwh.c, UY + 1.45, uwh.fixed + 0.12); scene.add(flame);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tFl, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); scene.add(halo);

  // ---------------- la ventana WS estalla hacia adentro: vidrio + marco en pedazos ----------------
  const ws = holes.WS, wsG = winGroups.WS, deb = [];
  { const mG2 = L.basic(tGlass, 0xffffff, { transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }), mFr = lam(null, 0xe8e4da), r = L.rng(330);
    for (let i = 0; i < 26; i++) { const isG = i < 16, s = 0.08 + r() * 0.18; const m = isG ? L.plane(s, s * (0.6 + r()), mG2, 0, -9, 0, scene) : B(0.05, 0.05 + r() * 0.4, 0.05, mFr, 0, -9, 0, scene); m.userData = { a: r() * 6.28, sp: 1.2 + r() * 2.4, up: r() * 1.8, dx: (r() - 0.5) * 1.6, spin: r() * 9, y0: ws.y0 + r() * (ws.y1 - ws.y0), x0: ws.c + (r() - 0.5) * ws.w }; deb.push(m); } }
  const blastWS = (t, t0) => { const on = t >= t0, u = Math.max(0, t - t0);
    wsG.children.forEach((o) => { if (o.userData.sill) return; o.visible = !on; });
    deb.forEach((m) => { const d = m.userData; if (!on) { m.visible = false; return; } m.visible = true; const uu = Math.min(u, 1.1); const y = Math.max(0.02, d.y0 + d.up * uu - 4.9 * uu * uu);
      m.position.set(d.x0 + d.dx * uu, y, ws.fixed - 0.05 - d.sp * uu); m.rotation.set(d.spin * uu + d.a, d.a, d.spin * uu * 0.6); if (y <= 0.021) m.rotation.set(-Math.PI / 2, d.a, 0); }); };
  wsG.children.forEach((o) => { if (o.position.y < ws.y0 + 0.01 && o.geometry && o.geometry.parameters && o.geometry.parameters.depth === 0.2) o.userData.sill = true; });

  // ---------------- el gigante (makeStalker del largo 3, mismo rig de 19 huesos) ----------------
  const SG = await L.loadModel('models/stalker_ps1.glb'); const CR = -1;
  function makeStalker() {
    const root = L.ps1Clone(SG.scene); const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = 2.6 / (bb.max.y - bb.min.y); root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k; scene.add(wrap);
    const bn = {}; root.traverse((o) => { if (o.isBone) bn[o.name] = o; }); const q0 = {}; for (const [n, b] of Object.entries(bn)) q0[n] = b.quaternion.clone(); const hp0 = bn.hips ? bn.hips.position.clone() : null;
    const boxL = new THREE.PointLight(0x5aff6a, 0.6, 1.6, 1.5); if (bn.chest) { bn.chest.add(boxL); boxL.position.set(0, 0.2 / root.scale.x, 0.3 / root.scale.x); }
    function pose({ ph = 0, w = 0, tilt = 0, grip = 0, duck = 0, pitch = 0, yawHead = 0, t = 0, crouch = 0, reach = 0 } = {}) {
      for (const [n, b] of Object.entries(bn)) b.quaternion.copy(q0[n]); if (hp0) bn.hips.position.copy(hp0);
      const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
      const R = (n, ax, a) => { const b = bn[n]; if (b) b.rotateOnAxis(ax, a); }, X = V(1, 0, 0), Y = V(0, 1, 0), Z = V(0, 0, 1);
      R('thighL', X, -0.42 * s * w); R('thighR', X, 0.42 * s * w); R('shinL', X, 0.5 * Math.max(0, -c) * w); R('shinR', X, 0.5 * Math.max(0, c) * w);
      if (hp0) bn.hips.position.y = hp0.y - (0.035 * Math.abs(s) * w + 0.62 * crouch) / root.scale.x;
      R('thighL', X, CR * 1.25 * crouch); R('thighR', X, CR * 1.25 * crouch); R('shinL', X, -CR * 1.9 * crouch); R('shinR', X, -CR * 1.9 * crouch); R('spine', X, 0.45 * crouch); R('upperarmL', X, -CR * 1.1 * reach); R('upperarmR', X, -CR * 1.1 * reach);
      R('spine', Z, 0.05 * s * w); R('chest', X, 0.18 * duck + 0.04); R('spine', X, 0.35 * duck); R('chest', Y, -0.06 * s * w);
      R('upperarmL', X, 0.16 * s * w); R('upperarmR', X, -0.16 * s * w); R('forearmL', X, -0.25); R('forearmR', X, -0.25);
      R('neck', X, -0.2 * duck - pitch * 0.4); R('head', Z, tilt); R('head', X, -pitch * 0.6); R('head', Y, yawHead);
      for (const sd of ['L', 'R']) { const sg = sd === 'L' ? -1 : 1; R('fingers' + sd, Z, sg * 1.5 * grip); R('fingers' + sd, X, 0.6 * grip); R('thumb' + sd, Z, -sg * 0.9 * grip); R('hand' + sd, Z, sg * 0.35 * grip); }
      boxL.intensity = 0.5 + 0.35 * (Math.floor(t * 2.5) % 2);
    }
    return { wrap, root, bn, pose, boxL };
  }
  const ST = makeStalker(); ST.wrap.visible = false;
  const stalk = (x, z, yaw, o = {}, y = 0) => { ST.wrap.visible = true; ST.wrap.position.set(x, y, z); ST.wrap.rotation.set(0, yaw, 0); ST.pose(o); ST.root.updateMatrixWorld(true); };
  const GX = SXM - 0.05, GZ = 4.7;   // donde aterriza: entre la ventana y el sofa volcado

  // ---------------- IK de 2 huesos para subir la escalera del desvan (como climbDown del largo 3, pero subiendo y con escalera inclinada) ----------------
  const IKQ = new THREE.Quaternion(), IKUNDO = [];
  const ikUndo = () => { while (IKUNDO.length) { const [b, q] = IKUNDO.pop(); b.quaternion.copy(q); } };
  const mkLimb = (root, up, lo, en) => { root.updateMatrixWorld(true); const U = root.getObjectByName(up), Lo = root.getObjectByName(lo), E = root.getObjectByName(en);
    const pu = U.getWorldPosition(V()), pl = Lo.getWorldPosition(V()), pe = E.getWorldPosition(V());
    return { U, Lo, loL: U.worldToLocal(pl.clone()), enL: Lo.worldToLocal(pe.clone()), l1: pu.distanceTo(pl), l2: pl.distanceTo(pe) }; };
  const turnTo = (b, endL, want) => { const bp = b.getWorldPosition(V()), cur = b.localToWorld(endL.clone()).sub(bp).normalize(), w = want.clone().sub(bp).normalize();
    const R = new THREE.Quaternion().setFromUnitVectors(cur, w), qw = b.getWorldQuaternion(new THREE.Quaternion()), pw = b.parent.getWorldQuaternion(IKQ).invert(); b.quaternion.copy(pw.multiply(R.multiply(qw))); b.updateMatrixWorld(true); };
  const solve = (lb, tgt, pole) => { IKUNDO.push([lb.U, lb.U.quaternion.clone()], [lb.Lo, lb.Lo.quaternion.clone()]);
    const a = lb.U.getWorldPosition(V()), d = tgt.clone().sub(a), dist = Math.max(Math.abs(lb.l1 - lb.l2) + 0.01, Math.min(lb.l1 + lb.l2 - 0.003, d.length())), dir = d.normalize();
    const ca = (lb.l1 * lb.l1 + dist * dist - lb.l2 * lb.l2) / (2 * lb.l1 * dist), sa = Math.sqrt(Math.max(0, 1 - ca * ca)), pl = pole.clone().sub(a); pl.addScaledVector(dir, -pl.dot(dir)).normalize();
    turnTo(lb.U, lb.loL, a.clone().addScaledVector(dir, lb.l1 * ca).addScaledVector(pl, lb.l1 * sa)); turnTo(lb.Lo, lb.enL, a.clone().addScaledVector(dir, dist)); };
  ch.root.position.set(0, 0, 0); ch.root.rotation.set(0, 0, 0); ch.pose(0, L.still('idle', 0.3)); ch.root.updateMatrixWorld(true);
  const LIMBS = { fl: mkLimb(ch.bone, 'ThighL', 'CalfL', 'FootL'), fr: mkLimb(ch.bone, 'ThighR', 'CalfR', 'FootR'), hl: mkLimb(ch.bone, 'UpperArmL', 'ForearmL', 'HandL'), hr: mkLimb(ch.bone, 'UpperArmR', 'ForearmR', 'HandR') };
  const stepf = (u) => { const n = Math.floor(u), f = u - n; return [n + L.smooth(L.clamp01((f - 0.5) / 0.5)), (f > 0.5) ? Math.sin(Math.PI * (f - 0.5) / 0.5) : 0]; };
  /** Ava subiendo de cara a la escalera (mira a +x): s = peldanos subidos; manos en los peldanos 4-5 por encima de los pies */
  // v5 (usuario: la subida se veia fea): subida real. s = peldanos subidos (continuo). Cada pie apoya en un peldano y queda quieto
  // mientras el otro sube 2 peldanos (pie contrario a la mano que sube); las manos agarran el peldano 4-5 por encima.
  // El cuerpo sube parejo, inclinado hacia la escalera, siguiendo su pendiente. pull 0..1 = al final apoya las manos en el piso del
  // desvan (borde de la escotilla) y se impulsa hacia arriba por el hueco (la tapa queda abierta).
  const CLIMB = { S0: 0.6, RATE: 1 / 0.44, SEND: 6.1 };
  const climbS = (lt) => Math.min(CLIMB.S0 + CLIMB.RATE * lt, CLIMB.SEND), climbPull = (lt) => L.smooth((lt - (CLIMB.SEND - CLIMB.S0) / CLIMB.RATE) / 0.8);
  const CLIMB_STEPS = () => { const o = []; for (let k = Math.ceil(CLIMB.S0 + 1e-3); k <= Math.floor(CLIMB.SEND); k++) o.push((k - CLIMB.S0) / CLIMB.RATE); return o; };   // un pie apoya en cada s entero
  const climbUp = (s, pull = 0) => {
    const sb = s + 0.95 * pull * 2.2;                                   // al impulsarse el cuerpo sigue subiendo ~2 peldanos
    const wy = RY(-1) + 0.04 + 0.3 * sb, hipX = LX(Math.min(AY, wy + 0.95));
    const wx = hipX - 0.36 + 0.18 * pull;
    ch.root.position.set(wx, wy, HZC); ch.root.rotation.set(0, Math.PI / 2, 0); ch.root.rotateOnAxis(V(1, 0, 0), 0.16 + 0.2 * pull); ch.root.updateMatrixWorld(true);
    for (const [lb, side, isH, base, o] of [[LIMBS.fl, 1, false, -1, 0], [LIMBS.fr, -1, false, 0, 1], [LIMBS.hr, -1, true, 4, 0], [LIMBS.hl, 1, true, 5, 1]]) {
      const [st, lift] = stepf((sb + o) / 2), k = Math.min(isH ? 7 : 8, base + 2 * st), y = RY(k) + (isH ? 0.025 : 0.07) + (isH ? 0.05 : 0.08) * lift;
      const zz = HZC - side * (isH ? 0.19 : 0.13);                       // +x local de Ava = -z del mundo
      let tgt = V(LX(y) - (isH ? 0.02 : 0.11) - 0.1 * lift, y, zz);
      if (isH && pull > 0) tgt.lerp(V(HX1 + 0.12, AY + 0.07, HZC - side * 0.24), L.smooth(pull * 1.6 - (side > 0 ? 0.3 : 0)));   // manos al piso del desvan
      const pole = isH ? V(wx - 0.6, y - 0.4, zz - side * 0.6) : V(wx + 1.2, y + 0.3, zz);
      solve(lb, tgt, pole); } };
  // ---------------- estado ep14 ----------------
  const BAR = { sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: 0 };
  const cutWalls = [];
  for (const o of [...wallGroup.children, ...upGroup.children]) if (o.isMesh && o.geometry.parameters && (o.position.z > 4.85 && o.geometry.parameters.depth === WT)) cutWalls.push(o);
  const cutWins = Object.entries(holes).filter(([, h]) => h.axis === 'x' && h.fixed === 5).map(([id]) => winGroups[id]);
  attic.children.forEach((o) => { if (o.position.z > 0.15 && o.position.y < AY + 1.0) o.userData.south = true; });   // tablas/vigas al sur de la escotilla (se ocultan en el corte)
  const S14 = (o = {}) => {
    const { hatchK = 0, roofOn = true, attOn = true, matK = -1, props = false, torch = false, blanketK = 0, flameK = 0, burst = 99, t = 0, cut = false, lights = 'night', extOn = true, glowK = 0, knocks = null } = o;
    ikUndo(); state({ ...BAR, glowK, ...(o.base || {}) });
    leaves.UBD.g.rotation.y = 0; leaves.USD.g.rotation.y = 0.6;
    hatch.rotation.x = Math.PI / 2 * hatchK; hatch.userData.cord.visible = hatchK < 0.5; atLad.visible = hatchK > 0.98;
    roof[-1].visible = roofOn; roof[1].visible = roofOn; lowRoof.visible = roofOn && !cut; gables[RZ1].visible = !cut; gables[RZ0].visible = true; attic.visible = attOn;
    matt.visible = matK >= 1; mattRoll.visible = matK >= 0 && matK < 1; matt.position.copy(MATT); mattRoll.position.copy(MATT).add(V(0, 0, -0.75));
    if (matK > 0 && matK < 1) { mattRoll.visible = false; matt.visible = true; matt.scale.set(1, 1, Math.max(0.12, matK)); matt.position.copy(MATT).add(V(0, 0, -0.95 * (1 - matK))); } else matt.scale.set(1, 1, 1);
    jugs.forEach((j, i) => { j.visible = props; j.position.set(4.55 + i * 0.28, AY + 0.03, 0.15 + i * 0.1); j.rotation.y = 0.3 + i; });
    atSpray.visible = props; atSpray.position.set(4.5, AY + 0.03, 1.75); atSpray.rotation.y = -0.6; herb.visible = props; herb.position.set(4.62, AY + 0.03, 2.25);
    atTorch.visible = false; atBeam.intensity = 0; atPool(V(), V(0, -1, 0), 0); atticGlow.intensity = 0; if (torch) atticOn(1);
    setBlanket(blanketK); flame.visible = flameK > 0; halo.visible = flameK > 0; flame.scale.setScalar(0.1 + 0.05 * flameK); halo.scale.setScalar(1.8 * flameK); halo.position.copy(flame.position);
    rings.forEach((r) => { r.material.opacity = 0; });
    blastWS(t, burst); ST.wrap.visible = false; handTorch.visible = false; hBeam.intensity = 0; handPool(V(), V(0, -1, 0), 0);
    cutWalls.forEach((w) => { w.visible = !cut; }); slabS.forEach((b) => { b.visible = !cut; }); attic.children.forEach((o) => { if (o.userData.south) o.visible = !cut; }); cutWins.forEach((g) => { g.visible = !cut; }); if (cut) wsG.visible = false; else wsG.visible = true;
    ext.visible = extOn; moon.visible = extOn;
    if (lights === 'night') { livL.intensity = 0.6; hallL.intensity = 0.8; upL.intensity = 1.6; bedL.intensity = 1.2; amb.intensity = 0.55; hemi.intensity = 0.55; sun.intensity = 0.7; }
    else if (lights === 'out') { livL.intensity = 0; hallL.intensity = 0; upL.intensity = 0; bedL.intensity = 0; amb.intensity = 0.5; hemi.intensity = 0.6; sun.intensity = 0.9; }
    ch.root.visible = false; ch.root.rotation.set(0, 0, 0); keyL.intensity = 0;
  };
  const knockShake = (t, hits, amp = 0.015) => { const k = hitK(t, hits, 0.16); leaves.D1.g.rotation.y = amp * Math.abs(k); };
  const avaAt = (x, z, yaw, y = 0) => { ch.root.visible = true; AVA(x, z, yaw, y); };
  const FB = (k) => W[k] ?? 0;

  // ===================================================== PLANOS =====================================================
  const sh = (id, fov, upd, ov) => { const c = cam(fov); out[id] = { scene, camera: c, update(lt, t) { upd(lt, t, c); }, overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); if (ov) ov(lt, o, c, T[id] + lt); } }; return out[id]; };
  // 01 gancho: la casa de noche desde la calle; Ava en la ventana de arriba con la linterna; grua hacia el techo (el desvan)
  sh('01_hook', 46, (lt, t, c) => { S14({ t, base: { ladderK: 1, sash: 0 } }); avaAt(uwh.c, uwh.fixed - 0.55, Math.PI * 0.95, UY);
      ch.pose(lt, [L.seg('look_around', -99, { from: 0.2, speed: 0.6 })], [[-99, 'scared', 'neutral']]); torchOn(true, 0.8);
      const D = T['01b_attic']; look(c, cr([[0, 7.0, 2.0, 17.5], [D, 4.6, 4.6, 14.0]], lt), cr([[0, uwh.c, UY + 1.2, 5.0], [D, RXM, AY + 1.0, RZ1]], lt)); },
    (lt, o, c, t) => { void lt; void o; void c; void t; });
  // 01a la casa en corte (pared sur fuera): cuartos abajo, el rellano, y arriba de todo el desvan a oscuras
  sh('01a_room', 34, (lt, t, c) => { S14({ t, cut: true, lights: 'night' }); avaAt(1.0, -0.8, 0.2, UY); ch.pose(lt, [L.seg('look_around', -99, { from: 0.4, speed: 0.6 })], [[-99, 'scared', 'neutral']]); torchOn(true, 0.8);
      look(c, cr([[0, 1.6, 3.2, 17.5], [3, 1.6, 4.4, 16.6]], lt), cr([[0, 1.6, 3.2, 0], [3, 1.6, 4.3, 0]], lt)); },
    (lt, o, c, t) => { const k = ease(W.checks - 0.1, W.checks + 0.15, t); tag(o, c, V(3.4, AY + 0.9, 0.5), 250, 120, 'NOBODY CHECKS', '#ff7b2e', k); });
  // 01b la escotilla en el techo del rellano: Ava la mira desde abajo (HUD de golpe)
  sh('01b_attic', 52, (lt, t, c) => { S14({ t, lights: 'night' }); avaAt(1.0, -0.42, 1.9, UY);
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.attic - T['01b_attic'] + 0.2, 'surprised', 'neutral']]);
      look(c, cr([[0, 2.3, UY + 1.43, -1.1], [3, 2.22, UY + 1.45, -1.05]], lt), V(1.0, UY + 1.33, -0.42));
      const k = ease(W.attic + 0.15, W.attic + 0.5, t); ch.lookAt({ position: c.position.clone().lerp(V((HX0 + HX1) / 2, UY + WH, HZC), k) }, 1, 55); },
    (lt, o, c, t) => { tag(o, c, V((HX0 + HX1) / 2, UY + WH, HZC), 200, 130, 'THE ATTIC', '#ffd23f', ease(W.attic - 0.1, W.attic + 0.12, t)); });
  // 02 recap ep10: golpes educados en la puerta de entrada, luz y sombra de pies bajo la puerta
  sh('02_recap', 48, (lt, t, c) => { S14({ t, glowK: 1, lights: 'night' }); livL.intensity = 1.0; knockShake(t, [W.knocked - 0.05, W.knocked + 0.18, W.knocked + 0.42, W.begged, W.begged + 0.25]);
      look(c, cr([[0, holes.D1.c - 0.2, 1.2, 2.6], [3, holes.D1.c - 0.15, 1.15, 2.95]], lt), V(holes.D1.c, 0.9, 5.0)); },
    (lt, o) => { box2(o, LW / 2, 330, ['LAST TIME'], '#ffd23f', ease(0, 0.2, lt), 2); });
  // 02b la votacion: Ava arriba detras de la barricada + el menu del ep10 con STAY QUIET elegido
  sh('02b_vote', 50, (lt, t, c) => { S14({ t, glowK: 1 }); avaAt(1.05, ZT - 0.35, 0.15, UY);
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.quiet1 - T['02b_vote'], 'happy', mouthAt(t, 'smile')]]);
      look(c, cr([[0, 0.9, UY + 1.45, ZT + 1.9], [3, 0.95, UY + 1.5, ZT + 1.7]], lt), V(1.0, UY + 1.55, ZT - 0.4)); ch.lookAt(c, 0.8, 35); },
    (lt, o, c, t) => { const cx = o.tctx, k = ease(T['02b_vote'], T['02b_vote'] + 0.2, t); if (k <= 0) return; cx.globalAlpha = k;
      cx.fillStyle = 'rgba(4,8,18,0.86)'; cx.fillRect(40, 120, 280, 104); px(cx, 40, 120, '#8a90a8', 280, 1); px(cx, 40, 223, '#2a2e3e', 280, 1);
      bitText(cx, 'MOST OF YOU SAID:', LW / 2, 138, 1, '#c8c8d0', { outline: '#000' }); bitText(cx, '1. LET THEM IN', LW / 2, 166, 2, '#6a6a6a', { outline: '#000' });
      const on = t >= W.quiet1 - 0.05; bitText(cx, '2. STAY QUIET', LW / 2, 198, 2, on ? '#4fd6ff' : '#8a8a8a', { outline: '#000' }); if (on) for (let i = 0; i < 8; i++) px(cx, 70 + i, 190 + i, '#ffe048', 1, 17 - 2 * i); cx.globalAlpha = 1; });
  // 02c sobre el hombro: la escalera bloqueada abajo y la puerta de entrada que todavia golpean
  sh('02c_quiet', 60, (lt, t, c) => { S14({ t, glowK: 1, attOn: false, roofOn: false }); livL.intensity = 1.6; upCut.forEach((w) => { w.visible = false; }); for (const id of ['uWw', 'UW']) winGroups[id].visible = false;
      knockShake(t, [T['02c_quiet'] + 0.3, T['02c_quiet'] + 0.55]); avaAt(1.05, ZT - 0.35, 0.1, UY); ch.pose(lt, [L.seg('peek', -99, { from: 0.0, speed: 0.5 })], [[-99, 'scared', 'neutral']]);
      look(c, cr([[0, 1.0, UY + 3.1, ZT - 1.45], [2, 0.95, UY + 3.05, ZT - 1.35]], lt), V(-1.1, 0.4, 4.4)); });
  // 02d el ultimo golpe y silencio: la luz bajo la puerta se apaga, la sombra de los pies se va
  sh('02d_stops', 44, (lt, t, c) => { const g = 1 - ease(W.stops, W.stops + 0.9, t); S14({ t, glowK: g, lights: 'night' }); livL.intensity = 0.9; knockShake(t, [T['02d_stops'] + 0.15]);
      feetShadow.forEach((f, i) => { f.position.x = holes.D1.c + (i ? 0.1 : -0.12) + 0.4 * ease(W.stops - 0.2, W.stops + 0.9, t); });
      look(c, cr([[0, holes.D1.c + 0.05, 0.9, 3.2], [4, holes.D1.c + 0.05, 0.75, 3.7]], lt), V(holes.D1.c, 0.4, 5.0)); });
  // 03 silencio: Ava en el rellano a camara, medidor de decibeles (60 hablar / 30 susurro)
  const meter = (o, t, which) => { const cx = o.tctx, X = 306, Y0 = 400, Hm = 170;
    cx.fillStyle = 'rgba(4,8,16,0.86)'; cx.fillRect(X - 44, Y0 - Hm - 34, 88, Hm + 68); cx.strokeStyle = '#8a90a8'; cx.strokeRect(X - 43.5, Y0 - Hm - 33.5, 87, Hm + 67);
    bitText(cx, 'dB', X, Y0 - Hm - 20, 1, '#c8c8d0', { outline: null });
    for (let d = 0; d <= 80; d += 20) { const y = Y0 - d / 80 * Hm; px(cx, X - 38, y, '#5a6070', 6, 1); bitText(cx, String(d), X - 26, y, 1, '#8a90a8', { outline: null }); }
    const bar = (x, db, col, k, lab, row = 0) => { const h = db / 80 * Hm * k; px(cx, x, Y0 - h, col, 14, h); if (k > 0.98) bitText(cx, lab, X, Y0 + 10 + row * 11, 1, col, { outline: null }); };
    bar(X - 8, 60, '#ff4030', ease(W.sixty - 0.15, W.sixty + 0.35, t), 'TALK'); if (which > 0) bar(X + 14, 30, '#62f05a', ease(W.thirty - 0.15, W.thirty + 0.35, t), 'WHISPER', 1); };
  sh('03_db', 40, (lt, t, c) => { S14({ t }); avaAt(1.0, -0.9, 0.2, UY); ch.pose(lt, [L.seg('talk_gesture', -99, { from: 0.2, speed: 0.6 })], [[-99, 'open', mouthAt(t, 'neutral')]]);
      look(c, cr([[0, 1.15, UY + 1.4, 1.25], [4, 1.13, UY + 1.38, 1.1]], lt), V(1.08, UY + 1.05, -0.9)); ch.lookAt(c, 1, 40); },
    (lt, o, c, t) => { meter(o, t, 0); });
  sh('03b_whisper', 34, (lt, t, c) => { S14({ t }); avaAt(1.0, -0.9, 0.2, UY); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'half', mouthAt(t, 'neutral')]]);
      look(c, cr([[0, 1.12, UY + 1.5, 0.55], [3, 1.1, UY + 1.48, 0.45]], lt), V(1.04, UY + 1.36, -0.9)); ch.lookAt(c, 1, 40); },
    (lt, o, c, t) => { meter(o, t, 1); });
  // 03c respiracion (silencio): Ava sentada contra la pared del rellano, mano en la boca
  sh('03c_breath', 44, (lt, t, c) => { S14({ t }); avaAt(2.25, -1.3, -1.34, UY); ch.pose(lt, L.still('kneel', 0.6), [[-99, 'half', mouthAt(t, 'neutral')], [W.dont - T['03c_breath'], 'sad', mouthAt(t, 'neutral')], [W.dont - T['03c_breath'] + 1.6, 'scared', 'neutral']]);
      look(c, cr([[0, 0.5, UY + 1.05, -0.95], [3, 0.6, UY + 1.0, -1.0]], lt), V(2.25, UY + 0.65, -1.3)); ch.lookAt(c, 1, 45); });
  // 04 la luz: el barrio a oscuras desde lejos; en "flame" aparece una llamita en la ventana de arriba
  sh('04_flame', 40, (lt, t, c) => { S14({ t, lights: 'out', flameK: ease(W.flame - 0.1, W.flame + 0.25, t), base: { sash: 0 } });
      look(c, cr([[0, 46, 1.8, 14.6], [5, 42, 1.85, 14.2]], lt), V(2.5, 3.6, 3.5)); },
    (lt, o, c, t) => { const k = ease(W.flame, W.flame + 0.2, t); if (k > 0) tag(o, c, flame.position, 250, 190, 'ONE SMALL FLAME', '#ff7b2e', k); });
  // 04a desde la calle lejana (detras de un zombi): 1+ MILE
  sh('04a_mile', 30, (lt, t, c) => { S14({ t, lights: 'out', flameK: 1, base: { sash: 0 } }); const z = zOut[0]; z.w.visible = true; z.w.position.set(33, 0, 12.2); z.w.rotation.y = -Math.PI / 2 - 0.25; z.pose('walk', 0.4);
      look(c, cr([[0, 35.6, 1.6, 12.9], [3, 35.2, 1.62, 12.8]], lt), V(2.5, 3.4, 3)); },
    (lt, o, c, t) => { const k = ease(W.mile - 0.15, W.mile + 0.15, t); if (k <= 0) return; const cx = o.tctx, [fx, fy] = L.toScreen(c, flame.position.x, flame.position.y, flame.position.z); cx.globalAlpha = k; cx.strokeStyle = '#ff4030'; cx.setLineDash([3, 3]); cx.beginPath(); cx.moveTo(fx, fy + 6); cx.lineTo(150, 312); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1; box2(o, 150, 300, ['1+ MILE'], '#ff4030', k, 3); });
  // 04b la manta sobre la ventana de arriba (cae de la barra en "blanket")
  sh('04b_blanket', 46, (lt, t, c) => { const k = ease(W.blanket - 0.15, W.blanket + 0.45, t); S14({ t, blanketK: 0.02 + 0.98 * k });
      avaAt(uwh.c - 0.15, uwh.fixed - 0.55, 0.15, UY); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 }), L.seg('pull_chain', W.blanket - T['04b_blanket'] - 0.35, { fade: 0.2 })], [[-99, 'open', mouthAt(t, 'neutral')]]);
      look(c, cr([[0, uwh.c - 2.2, UY + 1.55, uwh.fixed - 3.2], [3, uwh.c - 2.0, UY + 1.5, uwh.fixed - 3.0]], lt), V(uwh.c, UY + 1.2, uwh.fixed - 0.4)); },
    (lt, o, c, t) => { tag(o, c, V(uwh.c + 0.5, UY + 1.6, uwh.fixed - 0.12), 270, 160, 'BLANKET', '#ff7b2e', ease(W.blanket, W.blanket + 0.2, t)); });
  // 04c la linterna apunta al piso: charco de luz en el parquet (regla del Dia 3)
  sh('04c_flash', 44, (lt, t, c) => { S14({ t, blanketK: 1, lights: 'out' }); upL.intensity = 0.4; bedL.intensity = 0.3;
      avaAt(3.4, 3.4, Math.PI * 0.85, UY); ch.pose(lt, L.still('idle', 0.3), [[-99, 'half', mouthAt(t, 'neutral')]]); torchOn(true, 1);
      look(c, cr([[0, 2.0, UY + 1.75, 0.9], [3, 2.1, UY + 1.7, 1.05]], lt), V(3.25, UY + 0.75, 3.1)); ch.lookAt(c, 0.8, 35); },
    (lt, o, c, t) => { if (handPool.pool.visible) tag(o, c, handPool.pool.position, 110, 470, 'AT THE FLOOR', '#ffd23f', ease(W.floor4 - 0.1, W.floor4 + 0.15, t)); });
  // 05 maquina de escribir: DAY 5 / UPSTAIRS / LIGHTS OUT.
  { const L1 = 'DAY 5', L2 = 'HOUSE - 2F', L3 = 'LIGHTS OUT.', TOT = L1.length + L2.length + L3.length; let lastN = -1;
    sh('05_save', 40, (lt, t, c) => { S14({ t }); const n = Math.max(0, Math.min(TOT, Math.floor((t - W.day5 + 0.05) * 14)));
        if (n !== lastN) { lastN = n; const cx = pcv.getContext('2d'); cx.fillStyle = '#ece6d6'; cx.fillRect(0, 0, 96, 128); cx.fillStyle = '#c8c0ac'; for (let y = 0; y < 128; y += 9) cx.fillRect(0, y, 96, 1);
          cx.fillStyle = '#1a1a1a'; cx.font = 'bold 12px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'top';
          cx.fillText(L1.slice(0, n), 8, 14); cx.font = 'bold 10px "Courier New", monospace'; cx.fillText(L2.slice(0, Math.max(0, n - L1.length)), 8, 40); cx.fillStyle = '#a01010'; cx.font = 'bold 11px "Courier New", monospace'; cx.fillText(L3.slice(0, Math.max(0, n - L1.length - L2.length)), 6, 56); pt.needsUpdate = true; }
        tw.children.forEach((k) => { if (k.userData.key !== undefined) k.position.y = 0.105 + Math.floor(k.userData.key / 10) * 0.012 - (k.userData.key === (n * 7) % 40 && n < TOT ? 0.006 : 0); });
        paper.position.y = 0.33 + 0.004 * Math.floor(n / 9); const wp = tw.localToWorld(V(0, 0.3, 0));
        look(c, cr([[0, wp.x + 0.42, UY + 1.2, wp.z + 0.62], [2.5, wp.x + 0.36, UY + 1.17, wp.z + 0.66]], lt), wp); },
      (lt, o, c, t) => { const ts = Math.max(W.save, W.day5 + TOT / 14 + 0.1); if (t > ts) { const cx = o.tctx; cx.globalAlpha = ease(ts, ts + 0.2, t); bitText(cx, 'PROGRESS SAVED', LW / 2, 470, 2, '#9cd4ff', { outline: '#000' }); bitText(cx, 'INK RIBBON x1', LW / 2, 492, 1, '#c8c8d0', { outline: '#000' }); cx.globalAlpha = 1; } });
  }
  // 06 subir al desvan: escotilla abierta, Ava sube la escalera plegable (IK: manos y pies en los peldanos)
  sh('06_climb', 56, (lt, t, c) => { S14({ t, hatchK: 1 }); ch.root.visible = true; ch.pose(0, L.still('idle', 0.3), [[-99, 'half', 'neutral']]);
      climbUp(climbS(lt), climbPull(lt));
      upGroup.children.forEach((o) => { if (o.isMesh && Math.abs(o.position.z - 0.1) < 0.12 && o.position.x > 1.0 && o.position.x < 3.4) o.visible = false; if (o.isMesh && Math.abs(o.position.x - 1.5) < 0.12 && o.position.z > 0.0) o.visible = false; }); winGroups.UD.visible = false; topDoor.visible = false; shelf.visible = false;   // pared del dormitorio 2 y barricada de arriba fuera de cuadro (vista de costado, en corte)
      mattRoll.visible = true; mattRoll.position.set(1.05, UY, -1.42); mattRoll.rotation.y = 0.0; jugs[0].visible = true; jugs[0].position.set(1.0, UY, -0.62); jugs[0].rotation.y = 0.4;
      const hy = ch.root.position.y; look(c, cr([[0, 1.0, UY + 1.15, 2.35], [3.2, 1.1, UY + 1.6, 2.25]], lt), V(1.65, Math.min(UY + 1.6, UY + 0.75 + 0.4 * (hy - UY)), -0.9)); },
    (lt, o, c, t) => { tag(o, c, V(1.0, UY + 0.35, -0.62), 80, 330, 'WATER', '#4fd6ff', ease(W.water6 - 0.05, W.water6 + 0.12, t)); tag(o, c, V(1.05, UY + 0.4, -1.42), 270, 330, 'MATTRESS', '#62f05a', ease(W.mattress - 0.05, W.mattress + 0.12, t)); });
  // 06b el desvan: el piso de tablas roba calor (flechas), Ava desenrolla el colchon
  sh('06b_attic', 46, (lt, t, c) => { const mk = ease(W.floor6 + 0.2, W.never + 0.3, t); S14({ t, hatchK: 1, matK: mk, props: true, torch: true }); atTorch.visible = true;
      avaAt(MATT.x - 0.05, MATT.z - 1.55, 0, AY); ch.pose(lt, [L.seg('scoop_kneel', -99, { from: 0.2, speed: 0.45 })], [[-99, 'open', mouthAt(t, 'neutral')]]);
      look(c, cr([[0, 2.25, AY + 1.35, 2.9], [4, 2.35, AY + 1.3, 2.75]], lt), V(3.7, AY + 0.45, 0.2)); ch.lookAt(c, 0.8, 35); },
    (lt, o, c, t) => { const k = ease(W.floor6 - 0.1, W.floor6 + 0.2, t); if (k > 0) { const cx = o.tctx; cx.globalAlpha = k; for (let i = 0; i < 4; i++) { const p = V(2.8 + i * 0.45, AY + 0.05, 2.2 - i * 0.2), [sx, sy] = L.toScreen(c, p.x, p.y, p.z), off = ((lt * 30 + i * 9) % 24); for (let y = 0; y < 18; y += 2) px(cx, sx, sy - 30 + off + y, '#ff7b2e', 2, 1); px(cx, sx - 3, sy + off - 10, '#ff7b2e', 8, 2); px(cx, sx - 2, sy + off - 8, '#ff7b2e', 6, 2); } cx.globalAlpha = 1; }
      tag(o, c, V(3.2, AY + 0.03, 2.4), 110, 470, 'BARE BOARDS', '#4fd6ff', k); });
  // 06c a dormir en el colchon (y la pausa): linterna al piso, spray, hierba, agua
  sh('06c_sleep', 44, (lt, t, c) => { S14({ t, hatchK: 1, matK: 1, props: true, torch: true }); avaAt(MATT.x, MATT.z - 0.1, Math.PI, AY + 0.17); ch.pose(lt, L.still('sit_floor', 0.9), [[-99, 'half', mouthAt(t, 'neutral')]]);
      look(c, cr([[0, 2.4, AY + 1.25, -0.9], [4, 2.55, AY + 1.2, -1.05]], lt), V(3.9, AY + 0.55, 1.1)); ch.lookAt(c, 0.8, 35); },
    (lt, o, c, t) => { tag(o, c, V(MATT.x - 0.3, AY + 0.2, MATT.z + 0.4), 90, 470, 'MATTRESS = WARM', '#62f05a', ease(W.boards - 0.1, W.boards + 0.15, t)); tag(o, c, V(4.5, AY + 0.2, 1.75), 285, 500, 'FIRST AID SPRAY', '#8cff5a', ease(T['06c_sleep'] + 1.2, T['06c_sleep'] + 1.4, t), 1); });
  // 07 pasos afuera: los pies descalzos gigantes cruzan el pasto mojado junto a la casa
  sh('07_feet', 30, (lt, t, c) => { S14({ t, lights: 'out' }); const x = 6.2 - lt * 0.9; stalk(x, 5.9, -Math.PI / 2, { ph: lt * 0.55, w: 1, t }); keyL.intensity = 10; keyL.position.set(x - 0.8, 0.8, 6.45);
      look(c, V(1.2, 0.3, 6.45), V(x, 0.45, 5.9)); });
  sh('07a_bare', 50, (lt, t, c) => { S14({ t, lights: 'out' }); const x = 3.4 - lt * 0.4; stalk(x, 5.9, -Math.PI / 2, { ph: 0.3 + lt * 0.22, w: 1, t }); keyL.intensity = 10; keyL.position.set(x - 0.7, 0.6, 6.45);
      look(c, V(x - 1.35, 0.4, 6.45), V(x - 0.05, 0.06, 5.9)); });
  // 07b la ventana al pie de la escalera estalla hacia adentro y el gigante cae pesado
  const FLY = 0.8, JUMP = () => T['07b_burst'] + 0.35;
  const stalkJump = (t) => { const t0 = JUMP(), u = L.clamp01((t - t0) / FLY), P0 = V(GX + 0.1, 0, 7.6), P1 = V(GX, 0, GZ), p = P0.clone().lerp(P1, u); p.y = 0.9 * Math.sin(Math.PI * u) * (1 - 0.4 * u);
    const landed = t >= t0 + FLY, ut = Math.max(0, t - t0 - FLY), crouch = landed ? 1 - ease(0.6, 2.6, ut) : (t < t0 ? 0.25 : 0.65);
    stalk(p.x, p.z, Math.PI, { crouch, reach: landed ? 0.35 * crouch : 0.9, duck: landed ? 0.3 * crouch : 0.6, grip: landed ? 0.2 : 0.8, pitch: landed ? -0.1 * crouch : 0, t }, p.y); return { landed, ut }; };
  sh('07b_burst', 50, (lt, t, c) => { S14({ t, burst: JUMP() - 0.05, lights: 'out' }); hallL.intensity = 0.5; stalkJump(t);
      keyL.intensity = 4; keyL.position.set(SXM, 2.2, 3.6); look(c, cr([[0, 1.35, 3.7, 1.5], [3, 1.33, 3.65, 1.65]], lt), V(0.35, 1.5, 4.9)); });
  sh('07c_rise', 46, (lt, t, c) => { S14({ t, burst: JUMP() - 0.05, lights: 'out' }); hallL.intensity = 0.5; stalkJump(t);
      keyL.intensity = 6; keyL.position.set(-0.3, 1.6, 4.0); leaves.D2.g.rotation.y = 1.9; look(c, cr([[0, -3.7, 0.9, 4.0], [4, -3.6, 0.95, 4.05]], lt), V(0.4, 1.35, 4.45)); });
  // 08 Ava en el desvan, temblando la voz (ella NO tiembla): "That's not a zombie."
  sh('08_ava', 34, (lt, t, c) => { S14({ t, hatchK: 1, matK: 1, props: true, torch: true, burst: -1 }); keyL.intensity = 6; keyL.position.set(MATT.x + 0.1, AY + 1.0, MATT.z - 1.2); moonShaft.visible = false; atticGlow.intensity = 0.6; avaAt(MATT.x, MATT.z - 0.1, Math.PI, AY + 0.17); ch.pose(lt, L.still('sit_floor', 0.9), [[-99, 'scared', mouthAt(t, 'neutral')]]);
      look(c, cr([[0, MATT.x + 0.1, AY + 1.05, MATT.z - 1.05], [3, MATT.x + 0.08, AY + 1.03, MATT.z - 0.95]], lt), V(MATT.x, AY + 0.95, MATT.z - 0.1)); ch.lookAt(c, 1, 40); });
  // 09 el sonido grave viaja lejos: anillos naranjas sobre el barrio
  sh('09_sound', 50, (lt, t, c) => { S14({ t, burst: -1, lights: 'out' });
      rings.forEach((r, i) => { const u = ((lt - i * 0.7) / 2.4); if (u < 0) return; const uu = u % 1; r.scale.setScalar(2 + uu * 38); r.material.opacity = 0.75 * (1 - uu); });
      look(c, cr([[0, -6, 24, 34], [5, -4, 27, 38]], lt), V(2, 0, 2)); },
    (lt, o, c, t) => { box2(o, LW / 2, 150, ['LOW SOUND', 'TRAVELS FARTHER'], '#ff7b2e', ease(W.farther - 0.1, W.farther + 0.15, t), 2); });
  // 09b zombis en la calle giran hacia la casa
  sh('09b_heads', 40, (lt, t, c) => { S14({ t, burst: -1, lights: 'out' });
      const P = [[-9, 12.0], [-11.5, 13.2], [-7.4, 14.6], [-13, 10.8], [-15.5, 13.8], [-10.2, 16.4]];
      zOut.forEach((z, i) => { z.w.visible = true; z.w.position.set(P[i][0], 0, P[i][1]); const tgt = Math.atan2(1.5 - P[i][0], 3 - P[i][1]), k = ease(T['09b_heads'] + 0.2 + i * 0.15, T['09b_heads'] + 0.9 + i * 0.15, t); z.w.rotation.y = (Math.PI / 2 + i) * (1 - k) + tgt * k; z.pose(['walk', 'Walking', 'walk', 'Walking', 'attack1_l', 'Zombie_Attack'][i], t * 0.9 + i); });
      look(c, cr([[0, -18, 2.2, 21], [4, -17.5, 2.3, 20.2]], lt), V(-9, 1.0, 11)); },
    (lt, o, c, t) => { box2(o, LW / 2, 150, ['EVERYTHING', 'FOR BLOCKS'], '#ff4030', ease(W.blocks - 0.15, W.blocks + 0.1, t), 2); });
  // 10 ladea la cabeza (primer plano) — luz verde de la caja del pecho
  sh('10_tilt', 30, (lt, t, c) => { S14({ t, burst: -1, lights: 'out' }); hallL.intensity = 0.6; const k = ease(W.tilts - 0.2, W.tilts + 0.6, t); stalk(GX, GZ, Math.PI, { tilt: 0.45 * k, grip: 0.3, t });
      const h = ST.bn.head.getWorldPosition(V()); look(c, h.clone().add(V(0.35, -0.15, -1.5)), h.clone().add(V(0, -0.05, 0))); });
  // 10b y mira escalera arriba (desde lo alto, por encima de la barricada)
  sh('10b_look', 44, (lt, t, c) => { S14({ t, burst: -1, lights: 'out' }); hallL.intensity = 0.7; const k = ease(W.looks - 0.2, W.attic10 + 0.2, t); stalk(GX, GZ, Math.PI, { tilt: 0.45 * (1 - k), pitch: 0.8 * k, t });
      look(c, cr([[0, SXM + 0.35, UY + 1.6, ZT - 0.55], [3, SXM + 0.3, UY + 1.55, ZT - 0.45]], lt), V(GX, 1.6, GZ - 0.2)); });
  // 11 de espaldas (70 % del cuadro): pisa el sofa volcado; solo la barricada se sacude
  const stepsAt = () => [W.one11 + 0.1, W.climb + 0.05, W.time11 + 0.1];
  const barShake = (t, hits) => { const k = hitK(t, hits, 0.22); sofa.rotation.x += 0.02 * k; dresser.position.x += 0.012 * k; dresser.rotation.z = 0.02 * k; };
  sh('11_step', 52, (lt, t, c) => { S14({ t, burst: -1, lights: 'out' }); cutWalls.forEach((w) => { if (Math.abs(w.position.x - ws.c) < 0.8 && w.position.y > ws.y1) w.visible = false; }); hallL.intensity = 0.7; const S0 = stepsAt(); const n = S0.filter((x) => t >= x).length, u = L.clamp01((t - (S0[n - 1] ?? -9)) / 0.45);
      const z = GZ - 0.18 * Math.max(0, n - 1 + u), y = n >= 1 ? 0.22 * Math.min(1, n - 1 + u) : 0; stalk(GX, z, Math.PI, { ph: 0.25 * (n + u), w: n > 0 && u < 1 ? 1 : 0, pitch: 0.55, grip: 0.4, t }, y); barShake(t, S0);
      keyL.intensity = 4; keyL.position.set(GX + 0.6, 2.4, GZ + 0.2); look(c, cr([[0, GX + 0.45, 2.1, 6.8], [4, GX + 0.4, 2.15, 6.6]], lt), V(GX - 0.05, 2.1, 1.8)); },
    (lt, o, c, t) => { box2(o, LW / 2, 150, ['1 AT A TIME'], '#ffd23f', ease(W.one11 - 0.1, W.one11 + 0.15, t), 3); });
  // 11b "this one doesn't need to": desde el piso, el gigante estira los brazos hacia arriba, las manos se cierran
  sh('11b_need', 56, (lt, t, c) => { S14({ t, burst: -1, lights: 'out' }); hallL.intensity = 0.7; const k = ease(W.need - 0.5, W.need + 0.6, t); stalk(GX, GZ - 0.5, Math.PI, { pitch: 0.7, reach: 0.8 * k, grip: L.smooth(0.5 + 0.5 * Math.sin(lt * 2.4)), t }, 0.22); barShake(t, [W.need]);
      keyL.intensity = 5; keyL.position.set(GX + 0.6, 2.8, GZ - 1.2); look(c, cr([[0, 1.35, UY + 1.3, 1.2], [3, 1.33, UY + 1.25, 1.3]], lt), V(GX, 2.5, GZ - 0.4)); });
  // 12 DECISION (gramatica RE3 del STALKER.md): destello -> negativo congelado sin texto -> destello -> negativo con opciones ->
  // destello -> vuelve el color con el mismo encuadre; menu RE vivo; el gigante en camara lenta. Corte: Ava arriba en el desvan, el gigante abajo.
  const DZ = { flash1: [0, 0.5], neg1: [0.5, 3.0], blink1: [3.0, 3.5], neg2: [3.5, 5.9], blink2: [5.9, 6.4] };
  { const c = cam(30), RED = '#ff5a4a', WHITE = '#f0f0f0', DK = '#141414';
    const left = (cx, s, x, y, sc, col, o2) => bitText(cx, s, x + textWidth(s, sc) / 2, y, sc, col, o2);
    out['12_choice'] = { scene, camera: c, invert: (lt) => (lt >= 0.12 && lt < 6.15) ? 1 : 0,
      update(lt, t) { S14({ t, hatchK: 1, burst: -1, cut: true, lights: 'out' }); hallL.intensity = 0.9; upL.intensity = 0.6; atticGlow.position.set(0.9, AY + 1.0, -0.4); atticGlow.intensity = 2.4;
        const frozen = lt < 6.2, sl = frozen ? lt * 0.03 : 0.19 + (lt - 6.2) * 0.12;
        stalk(GX, GZ - 0.2 - sl * 0.15, Math.PI, { ph: 0.15 + sl * 0.2, w: 0.7, pitch: 0.8, grip: 0.5 + 0.5 * Math.sin(sl * 1.6), t }, 0.1 + 0.15 * sl);
        avaAt(HX0 - 0.42, HZC, Math.PI / 2, AY); ch.pose(frozen ? 0 : lt, L.still('kneel', 0.6), [[-99, 'scared', 'neutral']]); ch.lookAt({ position: V(GX, 2.2, GZ) }, 0.9, 50);
        keyL.intensity = 5; keyL.position.set(GX + 0.8, 2.4, GZ + 0.9); look(c, cr([[0, 0.85, 3.5, 15.0], [20, 0.85, 3.45, 14.6]], lt), V(0.75, 3.35, 0)); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['12_choice'] + lt, inn = (k) => lt >= DZ[k][0] && lt < DZ[k][1];
        vign(0.4)(lt, dt, a, o);
        cx.fillStyle = '#c4c4c0'; cx.fillRect(0, 0, LW, 26); cx.fillRect(0, LH - 26, LW, 26);
        const sel = t >= W.two12 ? 1 : t >= W.one12 ? 0 : -1, normal = lt >= 6.4;
        if (lt >= 3.5 && !normal) { cx.font = 'bold 15px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillStyle = DK; cx.fillText('1.  STAY STILL', 34, 268); cx.fillText("2.  JUMP TO THE NEIGHBOR'S ROOF", 34, 292); }
        if (normal) {   // menu RE vivo (como el ep10/ep13), con la caja del ep10 y cuenta regresiva
          const kp = L.clamp01((lt - 6.4) / 0.2), PX = 12, PY = 196, PW = 336, PH = 176, X0 = 52;
          cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH); px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
          cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
          bitText(cx, 'WHAT DO YOU DO?', LW / 2, PY + 22, 2, '#ececec', { outline: '#000000' });
          const opts = [[['1. STAY STILL'], RED], [['2. JUMP TO THE', "   NEIGHBOR'S ROOF"], WHITE]];
          let y = PY + 62; opts.forEach(([lines, col], i) => { lines.forEach((s, j) => left(cx, s, X0, y + j * 26, 2, i === sel ? col : '#8a8a8a', { outline: '#000000' }));
            if (i === sel) { const on = Math.floor((t - (i ? W.two12 : W.one12)) * 4) % 2 === 0, x0 = X0 - 20; for (let k = 0; k < 8; k++) px(cx, x0 + k, y - 9 + k, on ? '#ffe048' : '#c89a20', 1, 19 - 2 * k); }
            y += lines.length * 26 + 12; });
          const span = Math.max(3, CUE.END - T['12_choice'] - 6.4), left2 = Math.max(0, 10 * (1 - (lt - 6.4) / span)); px(cx, PX + 20, PY + PH - 14, '#2a0a08', PW - 40, 4); px(cx, PX + 20, PY + PH - 14, left2 < 3 ? RED : '#ffd23f', (PW - 40) * left2 / 10, 4);
          if (t >= W.comment) { const b = Math.round(3 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, 556 + b, 2, '#ffd23f', { outline: '#000000' }); }
          if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, 596, 2, '#ececec', { outline: '#000000' }); }
        const ramp = (a0, a1) => Math.sin(Math.PI * L.clamp01((lt - a0) / (a1 - a0)));
        let w = 0, b = 0; if (inn('flash1')) w = ramp(0, 0.5); if (inn('blink1')) { b = lt < 3.25 ? ramp(3.0, 3.5) * 1.6 : 0; w = lt >= 3.25 ? ramp(3.25, 3.75) : 0; } if (inn('blink2')) { b = lt < 6.15 ? ramp(5.9, 6.4) * 1.6 : 0; w = lt >= 6.15 ? ramp(6.15, 6.65) * 0.8 : 0; }
        if (b > 0) { cx.fillStyle = `rgba(0,0,0,${Math.min(1, b)})`; cx.fillRect(0, 0, LW, LH); } if (w > 0) { cx.fillStyle = `rgba(255,255,255,${0.9 * w})`; cx.fillRect(0, 0, LW, LH); } } };
  }
  // ---------- portada vertical (?thumb): Ava en la pose aprobada (3/4, pistola negra a dos manos a la altura del pecho, rodillas flexionadas)
  // en el pasillo al pie de la escalera; detras, el gigante entrando por la ventana que estalla. El HUD real se compone despues (thumb.py).
  if (L.QS.has('thumb')) {
    window.GUN_SIZE = 0.32; const TP = await import('../thumb_post.js'); await TP.init();
    const tGun = L.cvs(32, 16, (c) => { const r = L.rng(981); for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) { const n = r() * 10; px(c, x, y, `rgb(${30 + n},${31 + n},${35 + n})`); } px(c, 0, 0, '#7a8088', 32, 1); for (let x = 22; x < 31; x += 2) px(c, x, 2, '#0a0a0c', 1, 6); px(c, 10, 3, '#5a5e66', 6, 3); });
    const gun = new THREE.Group(); { const mS = lam(tGun), mF = lam(null, 0x18181b), mG = lam(L.cvs(8, 8, (c) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) px(c, x, y, (x + y) % 2 ? '#141416' : '#34363a'); }));
      B(0.19, 0.034, 0.03, mS, 0, 0.02, 0, gun); B(0.17, 0.02, 0.028, mF, -0.01, -0.005, 0, gun); const gr = B(0.035, 0.11, 0.03, mG, -0.065, -0.06, 0, gun); gr.rotation.z = 0.25;
      const tg = L.mesh(new THREE.TorusGeometry(0.018, 0.004, 4, 8, Math.PI), mF, -0.02, -0.018, 0, gun); tg.rotation.z = Math.PI; B(0.008, 0.01, 0.008, mF, 0.09, 0.042, 0, gun); }
    L.holdIn(ch, gun, 'R', [0, 0.62, 0.32], [0, Math.PI / 2, Math.PI / 2]); gun.visible = false;
    const c = cam(Number(L.QS.get('tfov') ?? 42)), TT = Number(L.QS.get('tt') ?? 0.32);
    out['01_hook'] = { scene, camera: c, gamma: 0.8, update(lt) { const t = 1; S14({ t, lights: 'out', base: { sash: 0 } }); void TT;
        stalk(-0.2, 5.75, 0.2, { grip: 0.7, pitch: -0.05, tilt: 0.15, reach: 0.25, t }); keyL.intensity = 9; keyL.position.set(0.6, 2.2, 7.0);
        avaAt(1.25, 8.3, 0.6, 0); ch.pose(0, L.still('pistol_ready', Number(L.QS.get('pf') ?? 1.0)), [[-99, 'angry', 'neutral']]); gun.visible = false; TP.apply({ scene }, 0, { clip: 'pistol_ready', ct: 0.4, local: true, face: ['angry', 'frown'], gun: true, elbowR: [-0.24, 1.08, 0.14], aimR: [-0.06, 1.2, 0.4], elbowL: [0.22, 1.06, 0.16], aimL: [-0.02, 1.18, 0.36], gunDir: [0, 0.04, 1],
          legIK: { drop: 0.12, R: [-0.25, 0.12], L: [0.26, -0.05], knee: [0.1, 0, 1] }, pos: [1.25, 8.3], yaw: Number(L.QS.get('ty') ?? 0.95), key: [2.0, 1.5, 9.6, '#fff4e4', 5, 6], fill: [0.6, 1.7, 9.8, '#ffffff', 2, 6], gunColor: Number(L.QS.get('gc') ?? 0x282828) });
        look(c, V(2.1, 0.85, 12.1), V(0.75, 1.65, 6.6)); void lt; },
      overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); } };
    out['01_hook'].hard = true;
  }
  void ROOMLAB; void SOFA_BAR; void FB; void roofY; void NEIGH; void cars; void halo; void handW; void DRILL_TIP0;
  return out;
}
