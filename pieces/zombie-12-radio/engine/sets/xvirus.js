// sets/xvirus.js — ep11 "AVA: How Not to Turn" (casa del ep10 reutilizada: mundo, Ava, zombis; planos nuevos abajo). Base: sets/stairs.js — ep10 "AVA: The Stairs" (4a de la serie de la casa: ep1 puerta, ep2 ventana, ep7 cuarto seguro).
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
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.9); sun.position.set(4, 12, 8); scene.add(sun);
  { const g = new THREE.PlaneGeometry(200, 200, 100, 100); const o = L.mesh(g, rm(tGrass, 80, 80, 0x6a7a62), 1, -0.06, 0.5, scene); o.rotation.x = -Math.PI / 2; }   // pasto subdividido (sin parpadeo con el snap PS1)
  const WH = 2.6, WT = 0.12;
  const DOOR = (c, w, id) => [c, w, 0, 2.05, id], WIN = (c, w, id) => [c, w, 0.9, 2.0, id];
  // planta baja (ep7) con el pasillo ensanchado a x [-0.6, 1.5] para la escalera; puerta trasera D3 en la cocina; D2 (living -> pasillo) al pie de la escalera
  const WALLS = [
    ['x', -4, -5, 7, 'out', 'kit', [WIN(-2.5, 1.1, 'wK'), WIN(5.6, 1.1, 'wB1')], 0],
    ['x', 5, -5, 7, 'liv', 'out', [WIN(-3.6, 1.1, 'W3'), DOOR(-1.6, 0.9, 'D1'), WIN(5.6, 1.1, 'wB2')], 0],
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
  await place('side_table', 2.25, -1.25, 0, 1, UY, upGroup);
  const tw = new THREE.Group(); scene.add(tw); tw.position.set(2.25, UY + 0.55, -1.25); tw.rotation.y = 0.3;
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
    drill.visible = drillOn; screw.visible = false; xr.visible = false; xLight.intensity = 0; bracket.visible = sofaK >= 1 && dresserK > 0; bitL.visible = false;
    zOut.forEach((z) => { z.w.visible = false; z.w.position.set(z.home[0], 0, z.home[1]); z.w.rotation.set(0, z.home[2], 0); }); if (zo) zOut.forEach((z) => { z.w.visible = true; });
    doorGlow.material.opacity = 0.7 * glowK; feetShadow.forEach((f) => { f.material.opacity = 0.85 * glowK; });
    upGroup.visible = up; tw.visible = twOn; ch.root.visible = true; upCut.forEach((o) => { o.visible = true; }); Object.values(winGroups).forEach((g) => { g.visible = true; });
  };
  const out = {};
  const hitK = (t, hits, dur = 0.22) => { let k = 0; for (const h of hits) { const d = t - h; if (d >= 0 && d < dur) k = Math.max(k, (1 - d / dur) * Math.cos(d * 60)); } return k; };
  const ROOMLAB = { LIVING: [-3.7, 4.0, 0], KITCHEN: [-2.5, -1.7, 0] };
  const label3 = (o, c, x, y, z, s, k, col = '#f0f0e8', sc = 2) => { const [sx, sy] = L.toScreen(c, x, y, z); o.tctx.globalAlpha = k; bitText(o.tctx, s, sx, sy, sc, col, { outline: '#000000' }); o.tctx.globalAlpha = 1; };
  const xr = new THREE.Group(); scene.add(xr); xr.visible = false;
  const XS = V(SX1 - 0.03, 0.32, ZB + 0.06);   // punto donde muerde la zanca (cara interior)
  const xBox = (w, h, d, col, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d), m = L.basic(null, col, { transparent: true, opacity: 0.12, depthWrite: false, depthTest: false }), o = L.mesh(g, m, x, y, z, xr); o.renderOrder = 8;
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: col, transparent: true, depthTest: false })); e.renderOrder = 9; o.add(e); return o; };
  const xStr = xBox(0.05, 0.3, 0.7, 0x8cff5a, SX1 - 0.03, 0.2, ZB + 0.05), xArm = xBox(0.16, 0.6, 0.62, 0x4fd6ff, SXM + 0.95 - 0.1, 0.45, ZB + 0.3);
  const screwX = new THREE.Group(); xr.add(screwX); { const th = L.cvs(4, 16, (c) => { for (let y = 0; y < 16; y++) px(c, 0, y, y % 2 ? '#8a8e94' : '#f0f2f4', 4, 1); });
    const sm = (m) => { m.depthTest = false; return m; }; const a2 = L.mesh(new THREE.CylinderGeometry(0.009, 0.004, 0.2, 6), sm(L.basic(th)), 0, 0, 0, screwX); a2.renderOrder = 10; const hd = L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 8), sm(L.basic(null, 0xe8ecf0)), 0, 0.1, 0, screwX); hd.renderOrder = 10; }
  screwX.rotation.z = Math.PI / 2;   // eje +x: entra desde el lado del sofa hacia la zanca
  const xLight = new THREE.PointLight(0xffe8c0, 3, 2.5, 1.2); scene.add(xLight);
  // =====================================================================================================================
  // ep11 "How Not to Turn" — equipo de proteccion (props en codigo pegados a los huesos: NO se toca el modelo ni sus texturas)
  // =====================================================================================================================
  const tSleeve = noiseTex(16, 32, [70, 78, 58], 14, 101, (c) => { for (let y = 0; y < 32; y += 6) px(c, 0, y, 'rgba(30,34,24,0.45)', 16, 1); px(c, 0, 29, '#3a4030', 16, 3); });   // tela de mezclilla verde oliva, puno
  const tGlove = noiseTex(16, 32, [236, 168, 30], 18, 102, (c) => { px(c, 0, 0, '#c07a10', 16, 4); for (let k = 0; k < 4; k++) px(c, 2 + k * 4, 26, '#b87010', 1, 6); });   // guante de goma amarillo, puno y dedos
  const tBand = L.cvs(32, 32, (c) => { px(c, 0, 0, '#b8201c', 32, 32); const r = L.rng(103); for (let k = 0; k < 26; k++) { const x = r() * 30 | 0, y = r() * 30 | 0; px(c, x, y, '#f0e6d8', 2, 1); px(c, x + 1, y + 1, '#f0e6d8', 1, 1); } for (let x = 0; x < 32; x += 2) px(c, x, 0, '#701010', 1, 2); });
  const bloodImg = await L.img('tex/blood_drops.png');
  const tScratch = L.cvs(48, 24, (c) => { c.clearRect(0, 0, 48, 24); c.save(); c.beginPath(); for (const x0 of [8, 18, 28]) { c.moveTo(x0, 2); c.lineTo(x0 + 4, 2); c.lineTo(x0 + 14, 22); c.lineTo(x0 + 10, 22); c.closePath(); } c.clip(); c.drawImage(bloodImg, 0, 0, 48, 24); c.drawImage(bloodImg, 10, -6, 40, 36); c.restore(); });   // ep11 v2: tres lineas recortadas de la textura real de sangre
  function makeGear(h) {   // h = L.hero(); devuelve {set({sleeves, gloves, goggles, bandana, scratch})}
    const bones = {}; h.bone.traverse((o) => { if (o.isBone && !bones[o.name]) bones[o.name] = o; });
    const G = { sleeves: [], gloves: [], goggles: null, bandana: null, scratch: null };
    const mS = lam(L.rep(tSleeve, 2, 1)), mG = lam(L.rep(tGlove, 2, 1)), U = 1 / L.S;
    for (const sd of ['L', 'R']) {
      const fa = bones['Forearm' + sd], hb = bones['Hand' + sd], len = hb.position.length();
      const sl = L.mesh(new THREE.CylinderGeometry(0.05 * U, 0.042 * U, len * 1.0, 8, 1, true), lam(L.rep(tSleeve, 2, 1), 0xffffff, { side: THREE.DoubleSide }), 0, 0, 0, fa); sl.position.copy(hb.position).multiplyScalar(0.5); sl.quaternion.setFromUnitVectors(V(0, 1, 0), hb.position.clone().normalize()); G.sleeves.push(sl);
      const gl = new THREE.Group(); hb.add(gl);
      L.mesh(new THREE.CylinderGeometry(0.05 * U, 0.042 * U, 0.09 * U, 8), mG, 0, 0.0, 0, gl);           // puno sobre la muneca
      B(0.095 * U, 0.15 * U, 0.05 * U, mG, 0, 0.085 * U, 0, gl);                                          // mano
      G.gloves.push(gl); void mS;
    }
    // cabeza: posicion de reposo medida en mundo (Ava en el origen mirando a +z, idle) y pegada al hueso Head con attach()
    h.root.position.set(0, 0, 0); h.root.rotation.set(0, 0, 0); h.pose(0, L.still('idle', 0)); h.root.updateMatrixWorld(true);
    const head = bones.Head, hp = head.getWorldPosition(V());
    const gg = new THREE.Group(); gg.position.set(0, GEAR.eyeY, GEAR.faceZ);
    const mF = lam(null, 0x1a1c20), mL = L.basic(null, 0x9ad8ff, { transparent: true, opacity: 0.55 }), mHi = L.basic(null, 0xffffff);
    for (const s of [-1, 1]) { B(0.062, 0.044, 0.018, mF, s * 0.034, 0, 0, gg); const ln = B(0.048, 0.03, 0.006, mL, s * 0.034, 0, 0.011, gg); ln.renderOrder = 3; B(0.01, 0.006, 0.004, mHi, s * 0.034 - 0.012, 0.008, 0.016, gg); }
    B(0.012, 0.012, 0.016, mF, 0, 0, 0.002, gg);
    const strap = L.mesh(new THREE.CylinderGeometry(GEAR.headR, GEAR.headR, 0.022, 14, 1, true), lam(null, 0x24262a, { side: THREE.DoubleSide }), 0, 0, -GEAR.headR + 0.01, gg);
    void strap; void hp; gg.updateMatrixWorld(true); head.attach(gg); G.goggles = gg;
    const bd = new THREE.Group(); bd.position.set(0, GEAR.mouthY, GEAR.faceZ - 0.006);
    const mB = lam(tBand, 0xffffff, { side: THREE.DoubleSide });
    { const g = new THREE.CylinderGeometry(GEAR.headR + 0.006, GEAR.headR + 0.012, 0.07, 14, 1, true, -Math.PI * 0.62, Math.PI * 1.24); const o = L.mesh(g, mB, 0, 0, -GEAR.headR + 0.004, bd); void o;
      const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-0.07, -0.03, 0.008, 0.07, -0.03, 0.008, 0, -0.1, 0.0], 3)); tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)); tri.computeVertexNormals(); L.mesh(tri, mB, 0, 0, 0, bd); }
    bd.updateMatrixWorld(true); head.attach(bd); G.bandana = bd;
    // rasguno: calcomania en el antebrazo izquierdo (lado de arriba en reposo), solo para el giro final
    { const fa = bones.ForearmR, hp2 = bones.HandR.position; const piv = new THREE.Group(); fa.add(piv); piv.position.copy(hp2).multiplyScalar(0.8); piv.quaternion.setFromUnitVectors(V(0, 1, 0), hp2.clone().normalize());
      const rot = new THREE.Group(); piv.add(rot); rot.rotation.y = GEAR.scrRot; const sc = L.plane(0.09 * U, 0.045 * U, L.basic(tScratch, 0xffffff, { transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }), 0, 0, GEAR.armR * U, rot); sc.rotation.z = Math.PI / 2; G.scratch = piv; }
    const set = ({ sleeves = false, gloves = false, goggles = false, bandana = false, scratch = false } = {}) => {
      G.sleeves.forEach((o) => { o.visible = sleeves; }); G.gloves.forEach((o) => { o.visible = gloves; }); G.goggles.visible = goggles; G.bandana.visible = bandana; G.scratch.visible = scratch; };
    set({}); return { set, G };
  }
  const GEAR = { eyeY: Number(L.QS.get('eyeY') ?? 1.505), mouthY: Number(L.QS.get('mouthY') ?? 1.462), faceZ: Number(L.QS.get('faceZ') ?? 0.118), headR: 0.095, armR: Number(L.QS.get('armR') ?? 0.03), scrRot: Number(L.QS.get('scrRot') ?? 0) };
  const gear = makeGear(ch);
  const hand3 = (h, sd) => h.hand(sd).getWorldPosition(V());
  const fore3 = (h, sd, k = 0.5) => { const fa = h.bone.getObjectByName('Forearm' + sd), hb = h.hand(sd); return fa.getWorldPosition(V()).lerp(hb.getWorldPosition(V()), k); };
  const unbreathe = (h) => { const cb = h.bone.getObjectByName('Chest'); if (cb && cb.userData.br) { cb.rotation.x -= cb.userData.br; cb.userData.br = 0; } };
  const breathe = (h, t, a = 0.02) => { const cb = h.bone.getObjectByName('Chest'); if (!cb) return; const v = a * Math.sin(L.q15(t) * 2.4); cb.rotation.x += v; cb.userData.br = v; };
  // zombi tirado en el living (dead1 al final, una sola pose quieta) + sangre real en el piso
  const DZ = (L.QS.get('dz') ?? '-2.05,3.35,-1.25').split(',').map(Number);
  const dead = (z, x, zz, ry) => { z.w.visible = true; z.w.position.set(x, 0, zz); z.w.rotation.set(0, ry, 0); z.pose('dead1', 99, { loop: false, root: true }); };
  const floorBlood = L.plane(0.9, 0.9, L.basic(tBlood, 0xffffff, { transparent: true, alphaTest: 0.3, depthWrite: false, ...PO }), DZ[0] + 0.25, 0.008, DZ[1] - 0.1, scene, 0.7, -Math.PI / 2); floorBlood.renderOrder = 4;
  // tubo de acero (arma) en la mano derecha
  const pipe = new THREE.Group(); { const m = lam(L.cvs(4, 16, (c) => { for (let y = 0; y < 16; y++) px(c, 0, y, y % 5 ? '#8a8e94' : '#5a5e64', 4, 1); })); const p = L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 6), m, 0, 0.13, 0, pipe); void p; L.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 6), lam(null, 0x222224), 0, -0.08, 0, pipe); }
  L.holdIn(ch, pipe, 'R', [0, 0.75, 0], [Math.PI / 2, 0, 0]); pipe.visible = false;
  // bano: lavabo con canilla, espejo, jabon; chorro de agua animado y espuma
  const SINK = V(2.1, 0.85, -0.97);
  B(0.5, 0.05, 0.38, lam(null, 0xf4f2ec), SINK.x, SINK.y + 0.025, SINK.z, furn); B(0.36, 0.02, 0.26, lam(null, 0xb8c4c8), SINK.x, SINK.y + 0.052, SINK.z + 0.02, furn);
  B(0.04, 0.16, 0.04, mSteel, SINK.x, SINK.y + 0.13, SINK.z - 0.16, furn);
  const spout = B(0.03, 0.03, 0.2, mSteel, SINK.x, SINK.y + 0.2, SINK.z - 0.07, furn);
  B(0.5, 0.6, 0.02, L.basic(L.cvs(16, 16, (c) => { const g = c.createLinearGradient(0, 0, 16, 16); g.addColorStop(0, '#c8d4dc'); g.addColorStop(1, '#6a7a86'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); px(c, 3, 2, 'rgba(255,255,255,0.6)', 1, 8); })), SINK.x, 1.55, -1.13, furn);
  const soap = B(0.08, 0.03, 0.05, lam(null, 0xf0a8c0), SINK.x + 0.19, SINK.y + 0.065, SINK.z + 0.1, furn); void soap;
  const tWater = L.cvs(4, 16, (c) => { for (let y = 0; y < 16; y++) px(c, 0, y, y % 4 < 2 ? 'rgba(200,235,255,0.85)' : 'rgba(120,180,230,0.6)', 4, 1); });
  const mWater = L.basic(L.rep(tWater, 1, 4), 0xffffff, { transparent: true, depthWrite: false }); const stream = B(0.022, 1, 0.022, mWater, 0, 0, 0, scene); stream.visible = false;
  const foam = []; { const mFo = [lam(null, 0xf8fbff), lam(null, 0xdcecf8)]; for (let i = 0; i < 26; i++) { const r0 = i < 6 ? 0.02 : 0.009 + (i % 3) * 0.003; foam.push(L.mesh(new THREE.SphereGeometry(r0, 6, 4), mFo[i % 2], 0, -9, 0, scene)); } }
  const setWater = (on, t, hands) => { stream.visible = on; foam.forEach((f) => { f.visible = false; }); if (!on) return;
    const top = HM0.y + 0.2, bot = SINK.y + 0.06; stream.position.set(HM0.x, (top + bot) / 2, HM0.z); stream.scale.y = top - bot; mWater.map.offset.y = -L.q15(t) * 3;
    spout.position.set(HM0.x, top + 0.015, (HM0.z + SINK.z - 0.2) / 2); spout.scale.z = (HM0.z - SINK.z + 0.2) / 0.2;
    if (hands) { const r = L.rng(Math.floor(L.q15(t) * 15)); foam.forEach((f, i) => { if (i >= hands.n) return; f.visible = true; const big = i < 6; f.position.set(hands.p.x + (r() - 0.5) * (big ? 0.07 : 0.14), hands.p.y + (big ? 0.0 : (r() - 0.5) * 0.06), hands.p.z + (r() - 0.5) * (big ? 0.05 : 0.1)); }); } };
  // puerta de cuarentena (lavadero, dL cerrada): cartel 72 H + luz bajo la puerta + sombra de pies de alguien adentro
  const qSign = L.plane(0.42, 0.56, lam(L.cvs(42, 56, (c) => { const r = L.rng(110); px(c, 0, 0, '#ece4cc', 42, 56); for (let k = 0; k < 40; k++) px(c, r() * 42 | 0, r() * 56 | 0, 'rgba(120,100,60,0.25)', 1, 1);
    c.fillStyle = '#b01818'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('QUARANTINE', 21, 8); c.fillStyle = '#1a1a1a'; c.font = 'bold 17px monospace'; c.fillText('72 H', 21, 25);
    c.font = 'bold 6px monospace'; c.fillText('DO NOT OPEN', 21, 40); px(c, 6, 46, '#1a1a1a', 30, 1); for (let k = 0; k < 7; k++) px(c, 7 + k * 4, 48, '#1a1a1a', 1, 5); px(c, 6, 50, '#1a1a1a', 22, 1); px(c, 14, 0, 'rgba(220,220,200,0.7)', 14, 3); })), 1.5 - 0.035, 1.35, -2.6, scene, -Math.PI / 2);
  const qGlow = L.plane(0.1, 0.8, L.basic(null, 0xffe0a0, { transparent: true, opacity: 0, depthWrite: false, ...PO }), 1.5 - 0.07, 0.012, -2.6, scene, 0, -Math.PI / 2);
  const qFeet = []; for (const dz of [-0.12, 0.1]) qFeet.push(L.plane(0.07, 0.1, L.basic(null, 0x000000, { transparent: true, opacity: 0, depthWrite: false, ...PO }), 1.5 - 0.06, 0.014, -2.6 + dz, scene, 0, -Math.PI / 2));
  const HM0 = (() => { AVA(SINK.x, SINK.z + 0.49, Math.PI); ch.pose(1.6, [L.seg('pour', 0, { speed: 0.7 })], null); ch.root.updateMatrixWorld(true); return hand3(ch, 'L').add(hand3(ch, 'R')).multiplyScalar(0.5); })();
  const st11 = ({ zDead = false, quar = false, glowK = 0, water = false } = {}) => {
    state({ up: true }); drops.forEach((d) => { d.visible = false; }); leaves.BD.g.visible = false; livL.intensity = 6; hallL.intensity = 5; floorBlood.visible = zDead; pipe.visible = false; stream.visible = water; foam.forEach((f) => { f.visible = false; });
    leaves.dL.g.rotation.y = quar ? 0 : -1.2; qSign.visible = quar; qGlow.material.opacity = quar ? 0.75 : 0; qFeet.forEach((f) => { f.material.opacity = quar ? 0.85 : 0; });
    doorGlow.material.opacity = 0.7 * glowK; feetShadow.forEach((f) => { f.material.opacity = 0.85 * glowK; });
    gear.set({});
  };

  // ---------- 01 gancho: Ava en el living sobre un zombi abatido, a camara ----------
  { const c = cam(52);
    out['01_hook'] = { scene, camera: c, overlay: vign(0.35), update(lt, t) {
      st11({ zDead: true }); dead(zA, DZ[0], DZ[1], DZ[2]);
      AVA(-2.45, 2.45, 0.12); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.8 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.bite1 - 0.1, 'half', mouthAt(t, 'neutral')], [W.turns, 'open', mouthAt(t, 'smile')]]);
      look(c, cr([[0, -1.95, 1.55, 4.75], [3, -2.05, 1.5, 4.55]], lt), V(-2.4, 0.95, 2.7)); ch.lookAt(c, 1, 40);
    } };
  }
  // 01b la camara se mete en su antebrazo (ella lo levanta y lo mira) -> transicion al microscopio
  { const c = cam(46);
    out['01b_push'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const t = T['01b_push'] + lt, k = ease(T['02_micro'] - 0.45, T['02_micro'] + 0.1, t);
        if (k > 0) { o.tctx.fillStyle = `rgba(250,248,244,${0.9 * k})`; o.tctx.fillRect(0, 0, LW, LH); } },
      update(lt, t) {
      st11({ zDead: true }); dead(zA, DZ[0], DZ[1], DZ[2]);
      AVA(-2.45, 2.45, 0.12); ch.pose(lt, [L.seg('hold_up_object', 0, { speed: 0.9 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.xvirus - T['01b_push'], 'scared', mouthAt(t, 'neutral')]]);
      ch.root.updateMatrixWorld(true); const arm = fore3(ch, PL.side, 0.55), D = T['02_micro'] - T['01b_push'], u = ease(0.2, D, lt);
      const p0 = V(-2.35, 1.45, 3.6), p1 = arm.clone().add(V(0.02, 0.04, 0.2)); look(c, p0.lerp(p1, u), V(-2.45, 1.35, 2.45).lerp(arm, Math.min(1, u * 1.4)));
    } };
  }
  // ---------- 03 el error: pelea con los brazos desnudos (tubo, 'hammer' una vez) ----------
  { const c = cam(64);
    out['03_fight'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const t = T['03_fight'] + lt; ch.root.updateMatrixWorld(true);
        const k = ease(W.bare - 0.1, W.bare + 0.15, t); if (k > 0) tag(o, c, fore3(ch, 'R', 0.5), 270, 170, 'BARE ARMS', '#ff7b2e', k); },
      update(lt, t) {
      st11({}); pipe.visible = true;
      AVA(-2.4, 2.1, 0); ch.pose(t - T['03_fight'], [L.seg('pistol_ready', -99, { from: 0.3, speed: 0 }), L.seg('hammer', FIGHT.swing - T['03_fight'], { fade: 0.15, speed: 1.0 }), L.seg('hammer', FIGHT.swing - T['03_fight'] + 0.55, { from: 0.55, speed: 0 })], [[-99, 'angry', mouthAt(t, 'neutral')]]);
      zB.w.visible = true; zB.w.position.set(-2.35, 0, 2.8); zB.w.rotation.set(0, Math.PI, 0); zB.pose('Zombie_Attack', t - T['03_fight'] + 0.4);
      look(c, cr([[0, -0.85, 1.5, 2.5], [3, -0.9, 1.45, 2.45]], lt), V(-2.4, 1.05, 2.45));
    } };
  }
  // 03b la salpicadura: primer plano, gotas de sangre vuelan al ojo -> mancha real en pantalla, DANGER, "A SPLASH = A BITE"
  const drops = []; { const mD = new THREE.SpriteMaterial({ map: tBlood, transparent: true, alphaTest: 0.2, depthWrite: false }); for (let i = 0; i < 10; i++) { const sp = new THREE.Sprite(mD); sp.scale.setScalar(0.035 + (i % 3) * 0.012); sp.material.rotation = i; scene.add(sp); sp.visible = false; drops.push(sp); } }
  { const c = cam(50);
    out['03b_splash'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['03b_splash'] + lt, cx = o.tctx;
        if (t >= W.eye3) {
          const [ex, ey] = L.toScreen(c, EYE.x, EYE.y, EYE.z), k = ease(W.eye3, W.eye3 + 0.08, t), s = 120 + 30 * k; cx.globalAlpha = 0.95; cx.drawImage(bloodImg, ex - s / 2, ey - s / 2, s, s); cx.globalAlpha = 1;
          cx.fillStyle = `rgba(160,0,0,${0.25 * (1 - ease(W.eye3, W.eye3 + 0.5, t))})`; cx.fillRect(0, 0, LW, LH); }
        box2(o, LW / 2, 150, ['A SPLASH', '= A BITE'], '#ff4030', ease(W.splash3 - 0.1, W.splash3 + 0.12, t), 2); },
      update(lt, t) {
      st11({}); pipe.visible = true;
      AVA(-2.4, 2.1, 0); ch.pose(t - T['03_fight'], [L.seg('pistol_ready', -99, { from: 0.3, speed: 0 }), L.seg('surprised', W.eye3 - T['03_fight'], { fade: 0.1 })],
        [[-99, 'angry', mouthAt(t, 'neutral')], [W.eye3 - T['03_fight'], 'wink', mouthAt(t, 'gasp')]]);
      zB.w.visible = true; zB.w.position.set(-2.35, 0, 2.8); zB.w.rotation.set(0, Math.PI, 0); zB.pose('Zombie_Attack', t - T['03_fight'] + 0.4);
      EYE.copy(faceW(ch, gear, -0.034));
      const src = V(-2.35, 1.62, 2.72), u = (t - (W.eye3 - 0.35)) / 0.35, R = L.rng(9);
      drops.forEach((d, i) => { const du = u - i * 0.05; d.visible = du > 0 && du < 1; if (!d.visible) return; d.position.copy(src.clone().lerp(EYE, du).add(V((R() - 0.5) * 0.1 * (1 - du), (R() - 0.5) * 0.08 * (1 - du) + 0.08 * Math.sin(du * Math.PI), 0))); });
      look(c, cr([[0, -1.45, 1.6, 2.75], [2, -1.55, 1.58, 2.7]], lt), EYE.clone().add(V(0, -0.05, 0.12)));
    } };
  }
  const EYE = V(), FIGHT = { swing: T['03b_splash'] - 0.6 };
  const faceW = (h, g, dx = 0) => { h.root.updateMatrixWorld(true); return g.G.goggles.localToWorld(V(dx, 0, 0.01)); };
  // ---------- 05 si te muerden: lavar con agua corriente y jabon 15 minutos (pour una vez, sigue en 05b) ----------
  const washPose = (h, t, t0, faces) => { AVA(SINK.x, SINK.z + 0.49, Math.PI); h.pose(t - t0, [L.seg('pour', 0, { speed: 0.7 })], faces); h.root.updateMatrixWorld(true); return hand3(h, 'L').add(hand3(h, 'R')).multiplyScalar(0.5); };
  { const c = cam(52);
    out['05_wash'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['05_wash'] + lt;
        tag(o, c, V(SINK.x + 0.19, SINK.y + 0.08, SINK.z + 0.1), 270, 200, 'SOAP', '#4fd6ff', ease(W.soap - 0.1, W.soap + 0.12, t));
        tag(o, c, V(SINK.x, SINK.y + 0.14, SINK.z + 0.02), 96, 200, 'RUNNING WATER', '#4fd6ff', ease(W.running - 0.1, W.running + 0.12, t)); },
      update(lt, t) {
      st11({}); const hm = washPose(ch, t, T['05_wash'], [[-99, 'open', mouthAt(t, 'frown')]]); setWater(true, t, { p: hm, n: t > W.soap ? 12 : 0 });
      look(c, cr([[0, SINK.x + 0.95, 1.5, SINK.z + 0.95], [3, SINK.x + 0.9, 1.48, SINK.z + 0.85]], lt), V(SINK.x - 0.05, 1.05, SINK.z + 0.3));
    } };
  }
  { const c = cam(50);
    out['05b_timer'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['05b_timer'] + lt, cx = o.tctx;
        const t0 = W.fifteen5, left = t < t0 ? 900 : Math.max(0, 900 - (t - t0) * 380), mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(Math.floor(left % 60)).padStart(2, '0');
        cx.fillStyle = 'rgba(4,10,6,0.85)'; cx.fillRect(70, 120, 220, 92); cx.strokeStyle = '#2fb83c'; cx.lineWidth = 2; cx.strokeRect(71, 121, 218, 90);
        bitText(cx, `${mm}:${ss}`, LW / 2, 160, 5, '#62f05a', { outline: '#021006' }); bitText(cx, 'AT LEAST 15 MIN', LW / 2, 198, 1, '#c8f0c0', { outline: null }); },
      update(lt, t) {
      st11({}); const hm = washPose(ch, t, T['05_wash'], [[-99, 'open', 'neutral']]); setWater(true, t, { p: hm, n: 16 });
      look(c, cr([[0, SINK.x + 0.85, 1.38, SINK.z + 0.12], [2, SINK.x + 0.8, 1.36, SINK.z + 0.14]], lt), HM0.clone().add(V(0, 0.02, 0)));
    } };
  }
  // ---------- 06 no te toques la cara (pinch_nose una vez) ----------
  { const c = cam(44);
    out['06_face'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['06_face'] + lt, cx = o.tctx, k = ease(W.touch - 0.05, W.touch + 0.12, t);
        if (k > 0) { const hd = faceW(ch, gear); const [fx, fy] = L.toScreen(c, hd.x, hd.y - 0.02, hd.z); const R = 64;
          cx.globalAlpha = k; cx.strokeStyle = '#ff2a1a'; cx.lineWidth = 7; cx.beginPath(); cx.arc(fx, fy, R, 0, 7); cx.stroke(); cx.beginPath(); cx.moveTo(fx - R * 0.7, fy - R * 0.7); cx.lineTo(fx + R * 0.7, fy + R * 0.7); cx.stroke(); cx.globalAlpha = 1;
          box2(o, 84, 150, ['EYES', 'NOSE', 'MOUTH'], '#ff4030', k, 2); } },
      update(lt, t) {
      st11({ zDead: true }); dead(zA, DZ[0], DZ[1], DZ[2]);
      AVA(-2.45, 2.45, 0.12); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.7 }), L.seg('pinch_nose', W.touch - T['06_face'] - 0.45, { fade: 0.15, speed: 0.8 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.touch - T['06_face'], 'disgust', mouthAt(t, 'frown')]]);
      look(c, cr([[0, -2.3, 1.55, 3.55], [2.5, -2.32, 1.53, 3.45]], lt), V(-2.45, 1.42, 2.45)); ch.lookAt(c, 0.6, 30);
    } };
  }
  // 06b lavarse las manos (lavabo, espuma) — WASH HANDS FIRST
  { const c = cam(46);
    out['06b_hands'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const t = T['06b_hands'] + lt; box2(o, LW / 2, 150, ['WASH HANDS', 'FIRST'], '#4fd6ff', ease(W.hands - 0.25, W.hands, t), 2); },
      update(lt, t) {
      st11({}); const hm = washPose(ch, t, T['06b_hands'] - 1.2, [[-99, 'relaxed', 'neutral']]); setWater(true, t, { p: hm, n: 18 });
      look(c, cr([[0, SINK.x - 0.52, 1.5, SINK.z + 0.42], [2, SINK.x - 0.5, 1.48, SINK.z + 0.38]], lt), HM0.clone().add(V(0, 0.02, 0)));
    } };
  }
  // ---------- 08 cuarentena: alguien adentro del lavadero (luz y pies bajo la puerta, cartel 72 H); Ava sentada vigila ----------
  { const c = cam(76);
    out['08_quar'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      st11({ quar: true }); livL.intensity = 1.4; hallL.intensity = 2.2;
      AVA(0.15, -2.5, Math.PI / 2); ch.pose(lt, [L.seg('sit_floor', 0, { from: 0.0, speed: 0.8 })], [[-99, 'open', 'neutral']]);
      qFeet.forEach((f, i) => { f.position.z = -2.6 + (i ? 0.1 : -0.12) + 0.025 * Math.sin(L.q15(t) * 2 + i); });
      look(c, cr([[0, -0.52, 2.05, -0.55], [3, -0.5, 2.0, -0.65]], lt), V(0.75, 0.55, -2.55));
    } };
  }
  // 08b el tipo de la puerta (ep10): luz bajo la puerta de entrada, golpes educados
  { const c = cam(40);
    out['08b_front'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['08b_front'] + lt; tag(o, c, V(holes.D1.c, 1.6, 5.0), 250, 170, 'HIM TOO', '#ff7b2e', ease(W.guy - 0.05, W.guy + 0.12, t)); },
      update(lt, t) {
      st11({ glowK: 1 }); ch.root.visible = false; livL.intensity = 1.2; hallL.intensity = 5;
      const k = hitK(t, [T['08b_front'] + 0.1, T['08b_front'] + 0.32], 0.16); leaves.D1.g.rotation.y = 0.015 * Math.abs(k);
      look(c, cr([[0, holes.D1.c + 0.05, 1.25, 3.0], [1.6, holes.D1.c + 0.03, 1.2, 3.3]], lt), V(holes.D1.c, 1.0, 5.0));
    } };
  }
  // 08c primer plano del cartel: 72:00:00 corriendo, regla de este mundo
  { const c = cam(40);
    out['08c_sign'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['08c_sign'] + lt, cx = o.tctx;
        box2(o, LW / 2, 562, ['THIS WORLD\'S RULE'], '#ffd23f', ease(T['08c_sign'], T['08c_sign'] + 0.2, t), 2);
        const sec = 72 * 3600 - Math.max(0, t - W.seventy) * 9000, hh = String(Math.floor(sec / 3600)).padStart(2, '0'), mi = String(Math.floor(sec / 60) % 60).padStart(2, '0'), ss = String(Math.floor(sec) % 60).padStart(2, '0');
        cx.fillStyle = 'rgba(4,10,6,0.85)'; cx.fillRect(50, 470, 260, 60); cx.strokeStyle = '#e2c62c'; cx.lineWidth = 2; cx.strokeRect(51, 471, 258, 58);
        bitText(cx, `${hh}:${mi}:${ss}`, LW / 2, 492, 3, '#ffd23f', { outline: '#100c00' }); bitText(cx, 'ISOLATED + WATCHED', LW / 2, 518, 1, '#e8e0b0', { outline: null }); },
      update(lt, t) {
      st11({ quar: true }); ch.root.visible = false; livL.intensity = 1.4; hallL.intensity = 2.2;
      qFeet.forEach((f, i) => { f.position.z = -2.6 + (i ? 0.1 : -0.12) + 0.025 * Math.sin(L.q15(t) * 2 + i); });
      look(c, cr([[0, -0.3, 1.45, -2.25], [2, -0.15, 1.43, -2.33]], lt), V(1.45, 1.45, -2.72));
    } };
  }
  // ---------- 09 el giro: Ava ve un rasguno en su antebrazo (hold_up_object una vez) -> 10 menu RE vivo, MISMO plano continuo ----------
  const PL = { side: 'R' };
  const twist = (t, c) => {
    const T9 = T['09_twist'];
    st11({ zDead: true }); dead(zA, DZ[0], DZ[1], DZ[2]); gear.set({ scratch: true });
    AVA(-2.45, 2.45, 0.12); unbreathe(ch);
    ch.pose(t - T9, [L.seg('hold_up_object', 0, { speed: 0.8 })], [[-99, 'open', 'neutral'], [W.scratch9 - T9, 'scared', mouthAt(t, 'neutral')], [W.when - T9, 'scared', mouthAt(t, 'surprised')], [W.fudge - T9, 'shocked', mouthAt(t, 'surprised')], [W.fudge + 0.9 - T9, 'scared', mouthAt(t, 'neutral')]]);
    breathe(ch, t); ch.root.updateMatrixWorld(true);
    const arm = fore3(ch, PL.side, 0.8), hd = faceW(ch, gear);
    const u = ease(W.when - 0.3, W.when + 0.6, t), v = ease(T['10_choice'] - 0.2, T['10_choice'] + 1.2, t);
    const mid = arm.clone().lerp(hd, 0.5), pA = mid.clone().add(V(0.05, 0.02, 0.62)), pB = hd.clone().add(V(0.05, -0.05, 0.75)), pC = hd.clone().add(V(0.05, 0.0, 1.25));
    const p = pA.clone().lerp(pB, u).lerp(pC, v), tg = mid.clone().lerp(hd.clone().add(V(0, -0.05, 0)), u).lerp(hd.clone().add(V(0, 0.15, 0)), v);
    look(c, p, tg);
  };
  { const c = cam(46);
    out['09_twist'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['09_twist'] + lt; ch.root.updateMatrixWorld(true);
        const k = ease(W.scratch9 - 0.05, W.scratch9 + 0.12, t) * (1 - ease(W.when + 0.1, W.when + 0.3, t)); if (k > 0) tag(o, c, fore3(ch, PL.side, 0.8), 92, 520, 'SCRATCH?', '#ff4030', k); },
      update(lt, t) { twist(t, c); } };
  }
  { const c = cam(46), RED = '#ff5a4a', WHITE = '#f0f0f0';
    const left = (cx, s, x, y, sc, col, o2) => bitText(cx, s, x + textWidth(s, sc) / 2, y, sc, col, o2);
    const fit = (s, maxW, scs = [3, 2, 1]) => scs.find((sc) => textWidth(s, sc) <= maxW) ?? 1;
    out['10_choice'] = { scene, camera: c, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T['10_choice'] + lt; vign(0.5)(lt, dt, a, o);
      const kp = L.clamp01(lt / 0.2), PX = 8, PW = 344, PY = 52, IN = 12;   // ep11 (usuario): TODO el texto dentro del recuadro, que se ajusta solo
      const q = 'WHAT DO I DO?', opts = [['1. WASH IT FOR 15 MIN', W.wash10, RED], ['2. QUARANTINE MYSELF', W.quarantine, WHITE]], X0 = PX + IN + 16, XR = PX + PW - IN;
      const qs = fit(q, PW - 2 * IN), osc = Math.min(...opts.map(([s]) => fit(s, XR - X0))), cs = fit('COMMENT 1 OR 2', PW - 2 * IN, [2, 1]), fs = fit('FOLLOW FOR MORE!', PW - 2 * IN, [2, 1]);
      const rows = [[PY + 16 + qs * 5, qs], [0, osc], [0, osc], [0, cs], [0, fs]]; let y = rows[0][0] + qs * 5 + 18; for (let i = 1; i < rows.length; i++) { rows[i][0] = y + rows[i][1] * 5; y = rows[i][0] + rows[i][1] * 5 + (i === 2 ? 22 : 14); }
      const PH = y - PY + 4;
      cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH);
      px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
      bitText(cx, q, LW / 2, rows[0][0], qs, '#ececec', { outline: '#000000' });
      const sel = t >= W.quarantine ? 1 : t >= W.wash10 ? 0 : -1;
      opts.forEach(([s, tw2, col], i) => { const yy = rows[1 + i][0]; left(cx, s, X0, yy, osc, i === sel ? col : '#8a8a8a', { outline: '#000000' });
        if (i === sel) { const on = Math.floor((t - tw2) * 4) % 2 === 0, x0 = PX + IN; for (let k = 0; k < 8; k++) px(cx, x0 + k, yy - 8 + k, on ? '#ffe048' : '#c89a20', 1, 17 - 2 * k); } });
      if (t >= W.comment) { const b = Math.round(2 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, rows[3][0] + b, cs, '#ffd23f', { outline: '#000000' }); }
      if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, rows[4][0], fs, '#ececec', { outline: '#000000' });
    }, update(lt, t) { twist(t, c); } };
  }
  // ---------- 04 ITEM: Ava se equipa (otra Ava en su propia escena oscura; cada pieza aparece en su palabra) ----------
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x05070e);
    s.add(new THREE.AmbientLight(0xffffff, 1.0)); const dl = new THREE.DirectionalLight(0xffffff, 1.8); dl.position.set(-1, 2, 3); s.add(dl);
    const bg = L.cvs(LW, LH, (cx) => { const g = cx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH); cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1); });
    const c = cam(30); c.position.set(0.32, 1.05, 4.6); c.lookAt(0.32, 0.95, 0); c.updateProjectionMatrix();
    const bgp = L.plane(12, 12 * LH / LW, L.basic(bg), 0.32, 0.95, -3, s); void bgp;
    const ch2 = L.hero(); s.add(ch2.root); paintScared(ch2); const gear2 = makeGear(ch2);
    const IT = [['LONG SLEEVES', 'sleeves'], ['GLOVES', 'gloves'], ['GOGGLES', 'goggles'], ['MASK / BANDANA', 'mask']];
    const icon = (cx, k, x, y) => {   // iconos pixel 2D (estilo inventario RE2)
      if (k === 'sleeves') { px(cx, x - 18, y - 8, '#4a5238', 36, 16); px(cx, x - 18, y - 8, '#6a7650', 36, 3); px(cx, x + 14, y - 9, '#2e3424', 5, 18); }
      if (k === 'gloves') { px(cx, x - 12, y - 4, '#e8a820', 18, 16); for (let f = 0; f < 4; f++) px(cx, x - 12 + f * 5, y - 14, '#f0b830', 4, 11); px(cx, x + 6, y - 2, '#e8a820', 7, 5); px(cx, x - 13, y + 10, '#b07010', 20, 3); }
      if (k === 'goggles') { px(cx, x - 22, y - 2, '#24262a', 44, 4); for (const d of [-10, 10]) { px(cx, x + d - 9, y - 7, '#1a1c20', 18, 14); px(cx, x + d - 7, y - 5, '#8ad0f8', 14, 10); px(cx, x + d - 6, y - 4, '#e8f8ff', 3, 2); } }
      if (k === 'mask') { cx.fillStyle = '#b8201c'; cx.beginPath(); cx.moveTo(x - 20, y - 10); cx.lineTo(x + 20, y - 10); cx.lineTo(x, y + 14); cx.fill(); for (let q = 0; q < 8; q++) px(cx, x - 12 + q * 3, y - 6 + (q % 3) * 3, '#f0e6d8', 2, 1); }
    };
    out['04_gear'] = { scene: s, camera: c, update(lt, t) {
        const on = (w) => t >= W[w] - 0.05;
        gear2.set({ sleeves: on('sleeves'), gloves: on('gloves'), goggles: on('goggles'), bandana: on('mask') });
        ch2.root.position.set(-0.08, 0, 0); ch2.root.rotation.y = 0.35 + 0.15 * Math.sin(L.q15(lt) * 0.8);
        ch2.pose(lt, [L.seg('hands_on_hips', 0, { speed: 0.6 })], [[-99, 'open', mouthAt(t, 'smile')], [W.mask - T['04_gear'], 'wink', mouthAt(t, 'smile')]]);
      },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['04_gear'] + lt;
        const bev = (x, y, w, h, f) => { px(cx, x, y, f, w, h); px(cx, x, y, '#7a8094', w, 1); px(cx, x, y, '#7a8094', 1, h); px(cx, x, y + h - 1, '#0c0e14', w, 1); px(cx, x + w - 1, y, '#0c0e14', 1, h); };
        bev(14, 22, 332, 22, '#262a38'); bitText(cx, 'ITEMS', 46, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'SPLASH PROTECTION', 238, 33, 1, '#c8ccd8', { outline: null });
        IT.forEach(([lab, k], i) => { const x = 236, y = 92 + i * 74, kk = ease(W[k] - 0.05, W[k] + 0.1, t), sc = 1 + 0.5 * (1 - kk);
          bev(x - 56, y - 26, 112, 52, '#0e1424'); if (kk <= 0) return;
          cx.save(); cx.translate(x, y - 6); cx.scale(sc, sc); cx.globalAlpha = kk; icon(cx, k, 0, 0); cx.restore(); cx.globalAlpha = kk; bitText(cx, lab, x, y + 18, 1, '#e8e8ec', { outline: '#000' }); cx.globalAlpha = 1;
          if (t < W[k] + 0.35) { cx.strokeStyle = '#ffe048'; cx.lineWidth = 2; cx.strokeRect(x - 55, y - 25, 110, 50); } });
        { const k = ease(W.laundry - 0.1, W.laundry + 0.05, t); if (k > 0) { ch2.root.updateMatrixWorld(true); const p = fore3(ch2, 'R', 0.45), [sx, sy] = L.toScreen(c, p.x, p.y, p.z), sz = 70 * k; cx.globalAlpha = 0.9; cx.drawImage(bloodImg, sx - sz / 2, sy - sz / 2, sz, sz); cx.globalAlpha = 1;
          const k2 = ease(W.laundry + 0.25, W.laundry + 0.4, t), sc = 1 + 0.6 * (1 - k2); if (k2 > 0) { cx.save(); cx.translate(236, 482); cx.rotate(-0.1); cx.scale(sc, sc); cx.globalAlpha = k2; cx.strokeStyle = '#62f05a'; cx.lineWidth = 3; cx.strokeRect(-92, -16, 184, 32); bitText(cx, 'JUST LAUNDRY', 0, 0, 2, '#62f05a', { outline: '#021006' }); cx.restore(); cx.globalAlpha = 1; } } }
      } };
  }
  void ROOMLAB; void SOFA_BAR; void label3;
  return out;
}
