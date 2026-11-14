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

  // ---------- 01 grua: zombis golpeando la puerta de entrada; Ava en el living a camara; en "go up" la grua sube por la escalera ----------
  { const c = cam(50), D = T['02_down'];
    out['01_crane'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = lt;
        const k = ease(W.up1 - 0.2, W.up1 + 0.2, t); if (k > 0) label3(o, c, SXM, UY + 0.4, -0.4, '2F', k, '#ffd23f', 3);
      }, update(lt, t) {
        state({ zOut: true });
        const HITS = W.crane_hits; const k = hitK(t, HITS, 0.22); leaves.D1.g.rotation.y = 0.04 * Math.abs(k); leaves.D1.hdl.rotation.z = 0.3 * k;
        zA.pose('attack2', lt + 0.3); zB.pose('Zombie_Attack', lt + 0.4); zC.pose('attack1_r', lt + 0.7); zD.pose('Zombie_Attack2', lt + 0.2); zE.pose('attack1_l', lt + 1.1); zF.pose('Zombie_Attack', lt + 0.9);
        // Ava en el living, junto a D2 (pie de la escalera), mira a camara; en "go up" gira hacia la escalera y camina
        const goT = W.up1 - 0.15;
        if (t < goT) { AVA(-2.6, 2.4, 0.5); ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('point', W.forever - 0.5, { fade: 0.25 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.safe1, 'open', mouthAt(t, 'frown')], [W.forever, 'sad', mouthAt(t, 'frown')]]); }
        else { const u = Math.min(1, (lt - goT) / 2.2), x = -2.6 + 1.6 * u, z = 2.4 + 1.6 * u; AVA(x, z, Math.PI / 4); ch.pose(lt, [L.seg('walk', goT, { loop: true })], [[-99, 'happy', mouthAt(t, 'smile')]]); }
        const p = cr([[0, -1.7, 5.0, 10.4], [1.8, -0.9, 7.2, 10.8], [W.up1 - 0.2, 1.2, 9.0, 9.4], [D, 2.6, 6.8, 5.4]], lt), tg = cr([[0, -2.1, 0.9, 3.6], [1.8, -1.6, 0.6, 2.8], [W.up1 - 0.2, 0.6, 1.2, 1.4], [D, SXM, UY, ZT - 0.2]], lt);
        look(c, p, tg); if (t < goT) ch.lookAt(c, 1, 40);
      } };
  }
  // ---------- 02 la planta baja desde arriba (el primer piso oculto): 2 puertas y 5 ventanas destellan en rojo una por una ----------
  { const c = cam(62), D = T['03_door'] - T['02_down'];
    const FL = [['D1', W.two], ['D3', W.two + 0.16], ['W1', W.five], ['W2', W.five + 0.11], ['W3', W.five + 0.22], ['wK', W.five + 0.33], ['wK2', W.five + 0.44]];
    out['02_down'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['02_down'] + lt;
        { const k = ease(W.down - 0.1, W.down + 0.2, t); if (k > 0) box2(o, 98, 150, ['DOWNSTAIRS'], '#ff9a4a', k, 2); }
        const nD = FL.slice(0, 2).filter(([, t0]) => t >= t0).length, nW = FL.slice(2).filter(([, t0]) => t >= t0).length;
        if (nD) box2(o, 262, 150, [`DOORS x${nD}`], '#ff4030', 1, 2); if (nW) box2(o, 262, 182, [`WINDOWS x${nW}`], '#ff4030', 1, 2);
      }, update(lt, t) {
        const fk = {}; for (const [id, t0] of FL) { const d = t - t0; fk[id] = d < 0 ? 0 : d < 0.12 ? 0.9 : 0.35 + 0.25 * Math.max(0, Math.cos((d - 0.12) * 9)); }
        state({ flashK: fk, up: false, zOut: true }); zOut.forEach((z, i) => z.pose(['attack2', 'Zombie_Attack', 'attack1_r', 'Zombie_Attack2', 'attack1_l', 'Zombie_Attack'][i], lt + i * 0.3 + 2));
        AVA(-2.6, 1.6, 0.4);
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('look_around', W.doors - T['02_down'] - 0.3, { fade: 0.25 })], [[-99, 'open', 'neutral'], [W.doors - T['02_down'], 'surprised', 'gasp'], [W.guard - T['02_down'], 'scared', 'frown']]);
        look(c, cr([[0, -2.6, 13.0, 7.6], [D, -2.6, 12.4, 7.2]], lt), cr([[0, -2.7, 0, 0.0], [D, -2.7, 0, 0.1]], lt));
      } };
  }
  // ---------- 03 la puerta de entrada cede: la hoja se abre de golpe y entran (caminan mirando hacia donde van) ----------
  const intrude = (z, i, t) => {   // zombis que entran por D1 y van al pie de la escalera (D2), mirando a su objetivo
    const t0 = W.gives + 0.1 + i * 0.45, u = Math.max(0, t - t0);
    const P = [[holes.D1.c + (i - 1) * 0.35, 5.5], [holes.D1.c + (i - 1) * 0.3, 4.3], [-1.3 + 0.1 * i, 4.4 - 0.5 * i]], seg2 = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
    const sp = 0.9, d01 = 1.2, d12 = Math.hypot(P[2][0] - P[1][0], P[2][1] - P[1][1]); let d = u * sp, pos, dir;
    if (d < d01) { pos = seg2(P[0], P[1], d / d01); dir = [P[1][0] - P[0][0], P[1][1] - P[0][1]]; } else { const s = Math.min(1, (d - d01) / d12); pos = seg2(P[1], P[2], s); dir = [P[2][0] - P[1][0], P[2][1] - P[1][1]]; }
    z.w.visible = true; z.w.position.set(pos[0], 0, pos[1]); z.w.rotation.set(0, Math.atan2(dir[0], dir[1]), 0); return d >= d01 + d12;
  };
  { const c = cam(56);
    out['03_door'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      const open = ease(W.gives - 0.05, W.gives + 0.12, t);
      state({ d1: -1.7 * open });
      const pre = t < W.gives; [zA, zB, zC].forEach((z, i) => { if (pre) { z.w.visible = true; z.pose(['attack2', 'Zombie_Attack', 'attack1_r'][i], lt + i * 0.3); } else { const arrived = intrude(z, i, t); z.pose(i === 1 ? 'Walking' : 'walk', t * 1.1 + i * 0.4); void arrived; } });
      if (pre) { const k = hitK(t, [T['03_door'] + 0.05, T['03_door'] + 0.45, W.gives - 0.25], 0.2); leaves.D1.g.rotation.y = 0.05 * Math.abs(k); }
      ch.root.visible = false;
      look(c, cr([[0, -2.2, 1.7, 1.6], [2.0, -2.1, 1.65, 1.9]], lt), V(holes.D1.c, 1.1, 5.0));
    } };
  }
  // 03b demasiado tarde: Ava corre desde la cocina, los zombis ya tapan el pie de la escalera; ella frena
  { const c = cam(58);
    out['03b_late'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ d1: -1.7 }); const r = Math.min(1, lt / 1.1), x = -4.0 + 1.6 * r, z = 1.4 + 1.4 * r; AVA(x, z, Math.atan2(1.6, 1.4));
      [zA, zB, zC].forEach((z, i) => { intrude(z, i, t); z.pose(i === 1 ? 'Walking' : 'walk', t * 1.1 + i * 0.4); const dx = x - z.w.position.x, dz = z.w.position.z - 0; z.w.rotation.y = Math.atan2(dx, (ch.root.position.z - z.w.position.z)); void dz; });   // miran a Ava
      ch.pose(lt, [L.seg('run', -99, { loop: true }), L.seg('surprised', 1.05, { fade: 0.15 })], [[-99, 'scared', 'gasp'], [1.1, 'shocked', 'gasp']]);
      look(c, cr([[0, -4.6, 2.5, 0.95], [1.8, -4.55, 2.45, 1.05]], lt), cr([[0, -1.8, 0.8, 3.8], [1.8, -1.7, 0.8, 3.9]], lt));
    } };
  }
  // ---------- 04 "zombies are terrible at stairs": un zombi en el segundo escalon tropieza y cae (dead1 una sola vez) ----------
  { const c = cam(52);
    out['04_rule'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const t = T['04_rule'] + lt;
        box2(o, LW / 2, 150, ['THIS WORLD\'S RULE', 'ZOMBIES + STAIRS = BAD'], '#ffd23f', ease(W.terrible - 0.1, W.terrible + 0.15, t), 2);
      }, update(lt, t) {
        state({ d1: -1.7 }); ch.root.visible = false;
        // v1 (usuario): sube, el pie se engancha en el 2o escalon (tropieza), cae de espaldas por los escalones y queda en el piso. Una sola vez.
        const zz0 = ZB + 0.7, zz1 = ZB - 1.15 * RUN, tripT = W.stairs4 - 0.5, z = zA; z.w.visible = true; z.w.rotation.set(0, Math.PI, 0);
        const stepY = (zz) => zz > ZB ? 0 : Math.min(2, Math.floor((ZB - zz) / RUN) + 1) * RISE;
        if (t < tripT) { const u = L.clamp01((t - T['04_rule']) / (tripT - T['04_rule'])), zz = zz0 + (zz1 - zz0) * u; const yy = stepY(zz), yPrev = stepY(zz + 0.12);
          z.w.position.set(SXM - 0.2, yPrev + (yy - yPrev) * L.clamp01((ZB - zz) % RUN / 0.12), zz); z.pose('walk', (t - T['04_rule']) * 0.9); }
        else { const d = t - tripT, k = ease(0.15, 0.95, d);   // tropieza (cuerpo hacia atras) y cae: la raiz baja los escalones hacia +z
          z.w.position.set(SXM - 0.2, stepY(zz1) * (1 - k), zz1 + 0.95 * k); z.pose('dead1', d * 1.15, { loop: false }); }
        look(c, cr([[0, SXM + 0.4, 2.9, ZB - 2.4], [2.5, SXM + 0.35, 2.95, ZB - 2.6]], lt), V(SXM - 0.1, 0.7, ZB + 0.4));
      } };
  }
  // ---------- 04b MAPA del primer piso (estilo RE): la escalera es tu muro, 1 a la vez ----------
  { const c = new THREE.OrthographicCamera(-4.9, 4.9, 4.9 * LH / LW, -4.9 * LH / LW, 0.1, 80); c.position.set(3.1, 40, 0.5); c.up.set(0, 0, -1); c.lookAt(3.1, 0, 0.5); c.updateProjectionMatrix();
    const rect = (o, [x0, x1, z0, z1], fill, stroke, lw = 2) => { const cx = o.tctx, [ax, ay] = L.toScreen(c, x0, UY, z0), [bx, by] = L.toScreen(c, x1, UY, z1);
      if (fill) { cx.fillStyle = fill; cx.fillRect(ax, ay, bx - ax, by - ay); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw; cx.strokeRect(ax + 1, ay + 1, bx - ax - 2, by - ay - 2); } return [ax, ay, bx, by]; };
    out['04b_map'] = { scene, camera: c, overlay(lt, dt, a, o) {
        const cx = o.tctx, t = T['04b_map'] + lt;
        cx.fillStyle = 'rgba(6,14,40,0.62)'; cx.fillRect(0, 0, LW, LH); cx.fillStyle = 'rgba(90,140,220,0.10)'; for (let x = 0; x < LW; x += 12) cx.fillRect(x, 0, 1, LH); for (let y = 0; y < LH; y += 12) cx.fillRect(0, y, LW, 1);
        bitText(cx, 'MAP  2F', LW / 2, 112, 3, '#e8e8ec', { outline: '#000' });
        for (const [n, r] of Object.entries(UROOMS)) { rect(o, r.slice(0, 4), 'rgba(70,110,200,0.22)', '#8aa8e8', 1); const [sx, sy] = L.toScreen(c, (r[0] + r[1]) / 2, UY, (r[2] + r[3]) / 2); bitText(cx, n, sx, sy, n.length > 7 ? 1 : 2, '#f0f0e8', { outline: '#000' }); }
        const kS = ease(W.staircase - 0.1, W.staircase + 0.15, t), [ax, ay, bx, by] = rect(o, [SX0, SX1, ZT, ZB + 0.9], `rgba(220,40,30,${0.3 * kS})`, kS > 0 ? '#ff4030' : null, 2);
        for (let i = 0; i <= NST; i++) { const [, yy] = L.toScreen(c, 0, UY, ZB - i * RUN); cx.fillStyle = 'rgba(255,255,255,0.35)'; cx.fillRect(ax + 3, yy, bx - ax - 6, 1); }
        if (kS > 0) { const [wx, wy] = L.toScreen(c, SXM, UY, ZT); cx.globalAlpha = kS; cx.fillStyle = '#ff4030'; cx.fillRect(ax, wy - 3, bx - ax, 6); cx.globalAlpha = 1; tag(o, c, V(SXM, UY, ZT), 96, 210, 'YOUR WALL', '#ff4030', ease(W.wall - 0.1, W.wall + 0.15, t)); }
        const kO = ease(W.one4 - 0.1, W.one4 + 0.15, t); if (kO > 0) { const zz = ZB + 0.3 - Math.min(1.4, (t - W.one4) * 0.5); const [zx, zy] = L.toScreen(c, SXM, UY, zz); cx.globalAlpha = kO; cx.fillStyle = '#ff4030'; cx.beginPath(); cx.arc(zx, zy, 6, 0, 7); cx.fill(); cx.globalAlpha = 1;
          for (let k2 = 1; k2 < 4; k2++) { const [qx, qy] = L.toScreen(c, SXM + (k2 - 2) * 0.5, UY, ZB + 1.1); cx.globalAlpha = 0.5 * kO; cx.beginPath(); cx.arc(qx, qy, 5, 0, 7); cx.fill(); cx.globalAlpha = 1; }
          tag(o, c, V(SXM, UY, zz), 260, 470, '1 AT A TIME', '#ffd23f', kO); }
        const [px2, py2] = L.toScreen(c, 0.6, UY, -0.4); cx.fillStyle = '#62f05a'; cx.beginPath(); cx.moveTo(px2, py2 - 6); cx.lineTo(px2 - 5, py2 + 5); cx.lineTo(px2 + 5, py2 + 5); cx.fill();
        bitText(cx, 'AVA', px2, py2 + 14, 1, '#62f05a', { outline: '#000' });
      }, update(lt) { state({}); ch.root.visible = false; const z = 1 + 0.03 * lt; c.zoom = z; c.updateProjectionMatrix(); } };
  }
  // ---------- 05 bloquear los escalones de abajo: Ava empuja el sofa (se vuelca contra la escalera) y cae la comoda encima ----------
  { const c = cam(66);
    out['05_block'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['05_block'] + lt;
        box2(o, LW / 2, 150, ['BOTTOM STEPS'], '#ffd23f', ease(W.bottom - 0.1, W.bottom + 0.15, t) * (1 - ease(W.tip - 0.2, W.tip, t)), 2);
      }, update(lt, t) {
        const tipK = ease(W.tip, W.tip + 0.45, t), drK = ease(W.dresser - 0.15, W.dresser + 0.25, t);
        state({ sofaK: tipK, dresserK: drK > 0 ? 1 : 0, d1: 0 }); dresser.position.y = 0.88 + (1 - drK) * 0.9;
        AVA(SXM + 0.15, ZB + 1.05 + 0.1 * tipK, Math.PI);
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('push_heavy', W.tip - T['05_block'] - 0.4, { fade: 0.2 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.tip - T['05_block'], 'angry', mouthAt(t, 'neutral')]]);
        if (ch.root.position.z < ZB + 1.0) ch.root.position.z = ZB + 1.0;
        look(c, cr([[0, SX1 - 0.12, 2.45, ZB + 1.45], [3.0, SX1 - 0.15, 2.5, ZB + 1.4]], lt), V(SXM - 0.25, 0.35, ZB - 0.3));
      } };
  }
  // 05b Ava sobre los escalones, por encima de la barricada, atornilla con el taladro del ep2 (agarre correcto)
  { const c = cam(50);
    out['05_drill'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({ sofaK: 1, dresserK: 1, drillOn: true });
      const zz = ZB - 0.3; AVA(SXM + 0.25, zz, 0, stairY(zz)); DR.chuck.rotation.z = lt * 60;
      ch.pose(lt, [L.seg('drill', -99, { from: 0.2 })], [[-99, 'angry', mouthAt(t, 'neutral')]]);
      look(c, cr([[0, SX0 + 0.1, 1.95, ZB - 0.75], [1.5, SX0 + 0.12, 1.9, ZB - 0.7]], lt), V(SXM + 0.3, 1.2, ZB - 0.15)); ch.lookAt(c, 0.5, 25);
    } };
  }
  // 05c (v1 usuario) primer plano en corte rayos X: el tornillo de 3" atraviesa el brazo del sofa volcado y muerde la zanca de la escalera
  const xr = new THREE.Group(); scene.add(xr); xr.visible = false;
  const XS = V(SX1 - 0.03, 0.32, ZB + 0.06);   // punto donde muerde la zanca (cara interior)
  const xBox = (w, h, d, col, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d), m = L.basic(null, col, { transparent: true, opacity: 0.12, depthWrite: false, depthTest: false }), o = L.mesh(g, m, x, y, z, xr); o.renderOrder = 8;
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: col, transparent: true, depthTest: false })); e.renderOrder = 9; o.add(e); return o; };
  const xStr = xBox(0.05, 0.3, 0.7, 0x8cff5a, SX1 - 0.03, 0.2, ZB + 0.05), xArm = xBox(0.16, 0.6, 0.62, 0x4fd6ff, SXM + 0.95 - 0.1, 0.45, ZB + 0.3);
  const screwX = new THREE.Group(); xr.add(screwX); { const th = L.cvs(4, 16, (c) => { for (let y = 0; y < 16; y++) px(c, 0, y, y % 2 ? '#8a8e94' : '#f0f2f4', 4, 1); });
    const sm = (m) => { m.depthTest = false; return m; }; const a2 = L.mesh(new THREE.CylinderGeometry(0.009, 0.004, 0.2, 6), sm(L.basic(th)), 0, 0, 0, screwX); a2.renderOrder = 10; const hd = L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 8), sm(L.basic(null, 0xe8ecf0)), 0, 0.1, 0, screwX); hd.renderOrder = 10; }
  screwX.rotation.z = Math.PI / 2;   // eje +x: entra desde el lado del sofa hacia la zanca
  const xLight = new THREE.PointLight(0xffe8c0, 3, 2.5, 1.2); scene.add(xLight);
  { const c = cam(42);
    out['05_screw'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['05_screw'] + lt;
        tag(o, c, screwX.position.clone(), 250, 170, '3-INCH SCREWS', '#ffd23f', ease(W.three - 0.1, W.three + 0.15, t));
        tag(o, c, V(SX1 - 0.03, 0.12, ZB + 0.3), 240, 480, 'STAIR STRINGER', '#c8ffb0', ease(W.screws - 0.05, W.screws + 0.2, t), 2);
        tag(o, c, V(SXM + 0.85, 0.7, ZB + 0.3), 100, 540, 'SOFA FRAME', '#9ae8ff', ease(W.screws + 0.1, W.screws + 0.35, t), 2); },
      update(lt, t) {
        state({ sofaK: 1, dresserK: 1 }); ch.root.visible = false; xr.visible = true; xLight.intensity = 3; xLight.position.set(SXM + 0.5, 0.9, ZB + 0.9);
        const k = ease(T['05_screw'] + 0.15, W.screws + 0.35, t);   // la cabeza queda al ras del brazo del sofa
        screwX.position.set(XS.x - 0.02 - 0.2 * (1 - k), XS.y, XS.z); screwX.rotation.set(0, 0, Math.PI / 2); screwX.rotateY(k * 40);
        bitL.visible = k < 0.999; bitL.position.set(screwX.position.x - 0.1 - 0.2, XS.y, XS.z); bitL.rotation.set(0, 0, Math.PI / 2); bitL.rotateY(k * 40);
        xStr.material.opacity = 0.08 + 0.12 * ease(W.screws - 0.05, W.screws + 0.2, t);
        look(c, cr([[0, SXM + 0.05, 0.95, ZB + 1.25], [2.0, SXM + 0.1, 0.9, ZB + 1.15]], lt), V(XS.x - 0.25, XS.y + 0.05, XS.z));
      } };
  }
  // 05d "You already know how": Ava a camara sobre la escalera, guino
  { const c = cam(44);
    out['05_know'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({ sofaK: 1, dresserK: 1 }); const zz = ZB - 1.2; AVA(SXM + 0.2, zz, 0.2, stairY(zz));
      ch.pose(lt, [L.seg('hands_on_hips', -99, { from: 0.4, speed: 0.6 })], [[-99, 'open', mouthAt(t, 'smile')], [W.know - T['05_know'], 'wink', mouthAt(t, 'smile')]]);
      look(c, V(SXM + 0.05, stairY(zz) + 1.45, zz + 1.6), V(SXM + 0.2, stairY(zz) + 1.3, zz)); ch.lookAt(c, 1, 40);
    } };
  }
  // ---------- 06 arriba: puerta de canto atornillada al final de la escalera ----------
  { const c = cam(54);
    out['06_top'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['06_top'] + lt;
        tag(o, c, V(SXM - 0.3, UY + 0.6, ZT - 0.1), 110, 200, 'DOOR ON ITS EDGE', '#ff7b2e', ease(W.edge - 0.15, W.edge + 0.1, t)); },
      update(lt, t) {
        state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: ease(W.screw6, W.edge + 0.4, t) + 0.01, drillOn: true });
        // Ava al norte de la puerta, mirando a +z, la punta del taladro en la hoja junto al liston derecho
        { const tx = DRILL_TIP0.x, tz = DRILL_TIP0.z; AVA(SX1 - 0.08 + tx, ZT - 0.19 + tz, 0, UY); } DR.chuck.rotation.z = t > W.screw6 - 0.1 ? lt * 60 : 0;
        ch.pose(lt, [L.seg('drill', -99, { from: 0.0 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.screw6 - T['06_top'], 'angry', mouthAt(t, 'neutral')]]);
        look(c, cr([[0, -0.3, UY + 1.55, ZT + 1.3], [3.0, -0.25, UY + 1.5, ZT + 1.15]], lt), V(0.8, UY + 0.75, ZT - 0.3));
      } };
  }
  // 06b la estanteria pesada contra la puerta (push_heavy, una vez)
  { const c = cam(56);
    out['06b_shelf'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['06b_shelf'] + lt;
        tag(o, c, V(SX0 + 0.62, UY + 1.2, -0.3), 96, 150, 'HEAVY SHELF', '#ff7b2e', ease(W.shelf - 0.1, W.shelf + 0.15, t)); },
      update(lt, t) {
        const k = ease(W.push6 - 0.05, W.shelf + 0.6, t);
        state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: k });
        AVA(SX0 + 0.62, shelf.position.z - 0.19 - 0.56, 0, UY);
        ch.pose(lt, [L.seg('push_heavy', -99, { from: 0.1 })], [[-99, 'angry', mouthAt(t, 'neutral')]]);
        look(c, cr([[0, 1.1, UY + 1.9, -1.5], [2.0, 1.05, UY + 1.85, -1.45]], lt), V(0.0, UY + 0.7, -0.5));
      } };
  }
  // ---------- 07 la salida: la ventana de arriba; Ava la abre y tira la escalera de cuerda (throw_out_window, una vez) ----------
  { const c = cam(52);
    out['07_ladder'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['07_ladder'] + lt;
        tag(o, c, V(uw.c, UY + 1.5, uw.fixed), 110, 170, 'YOUR EXIT', '#8cff5a', ease(W.exit - 0.1, W.exit + 0.15, t)); },
      update(lt, t) {
        const throwT = W.window7 - 0.3;
        state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, sash: ease(T['07_ladder'] + 0.2, T['07_ladder'] + 0.8, t), ladderK: t > throwT + 0.5 ? 0.15 : 0 });
        AVA(uw.c - 0.05, uw.fixed - 0.62, 0, UY);
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('throw_out_window', throwT - T['07_ladder'], { fade: 0.2 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.trap - T['07_ladder'] + 0.2, 'angry', mouthAt(t, 'neutral')], [W.exit - T['07_ladder'], 'happy', mouthAt(t, 'smile')]]);
        if (t < throwT + 0.45) { ladderRoll.visible = true; const hp = handW('R').add(handW('L')).multiplyScalar(0.5); ladderRoll.position.copy(hp); }
        look(c, cr([[0, uw.c - 1.3, UY + 1.55, uw.fixed - 2.4], [2.5, uw.c - 1.1, UY + 1.5, uw.fixed - 2.2]], lt), V(uw.c - 0.1, UY + 1.1, uw.fixed - 0.3)); if (t < throwT) ch.lookAt(c, 0.8, 30);
      } };
  }
  // 07b afuera, de noche: la escalera se desenrolla hasta el suelo por la pared
  { const c = cam(50);
    out['07b_out'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, sash: 1, ladderK: 0.15 + 0.85 * ease(T['07b_out'], T['07b_out'] + 1.0, t) });
      AVA(uw.c, uw.fixed - 0.5, Math.PI, UY); ch.pose(lt, [L.seg('peek', -99, { from: 0.3, speed: 0.5 })], [[-99, 'open', 'neutral']]);
      look(c, cr([[0, uw.c + 2.3, 0.7, uw.fixed + 3.6], [1.6, uw.c + 2.0, 0.9, uw.fixed + 3.3]], lt), V(uw.c, 2.3, uw.fixed));
    } };
  }
  // ---------- 08 cargar las cosas arriba: aparecen en el rellano en su palabra; Ava arrodillada dejando el spray ----------
  { const c = cam(50);
    const IT = [['WATER', 'water', '#4fd6ff'], ['BACKPACK', 'backpack', '#ffd23f'], ['RADIO', 'radio', '#ffd23f'], ['FIRST AID SPRAY', 'spray', '#8cff5a']];
    out['08_carry'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['08_carry'] + lt;
        IT.forEach(([lab, k, col], i) => { const [o3] = ITEMPOS[i]; const p = o3.position.clone().add(V(0, 0.3, 0)); const [sx] = L.toScreen(c, p.x, p.y, p.z); tag(o, c, p, sx > LW / 2 ? 290 : 80, 150 + i * 36, lab, col, ease(W[k] - 0.05, W[k] + 0.12, t), 1); });
      }, update(lt, t) {
        const n = IT.filter(([, k]) => t >= W[k] - 0.05).length;
        state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: n });
        ITEMPOS.forEach(([o3, , , , s], i) => { const k = ease(W[IT[i][1]] - 0.05, W[IT[i][1]] + 0.15, t); o3.scale.setScalar(s * Math.max(0.001, k)); });
        AVA(1.55, -0.7, -Math.PI / 2, UY);
        ch.pose(lt, [L.seg('kneel', -99, { from: 0.6, speed: 0.5 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.spray - T['08_carry'], 'happy', mouthAt(t, 'smile')]]);
        look(c, cr([[0, -0.3, UY + 1.75, -1.45], [3.0, -0.25, UY + 1.7, -1.4]], lt), V(1.25, UY + 0.65, -0.6));
      } };
  }
  // 08b maquina de escribir en el rellano: "DAY 4 / SECOND FLOOR / SECURED."
  { const c = cam(40); const L1 = 'DAY 4', L2 = 'SECOND FLOOR', L3 = 'SECURED.', TOT = L1.length + L2.length + L3.length; let lastN = -1;
    out['08_save'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['08_save'] + lt;
        if (t > W.save) { const cx = o.tctx; cx.globalAlpha = ease(W.save, W.save + 0.2, t); bitText(cx, 'PROGRESS SAVED', LW / 2, 470, 2, '#9cd4ff', { outline: '#000' }); bitText(cx, 'INK RIBBON x1', LW / 2, 492, 1, '#c8c8d0', { outline: '#000' }); cx.globalAlpha = 1; }
      }, update(lt, t) {
        state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: 4 }); ch.root.visible = false;
        const n = Math.max(0, Math.min(TOT, Math.floor((t - W.day + 0.05) * 14)));
        if (n !== lastN) { lastN = n; const cx = pcv.getContext('2d'); cx.fillStyle = '#ece6d6'; cx.fillRect(0, 0, 96, 128); cx.fillStyle = '#c8c0ac'; for (let y = 0; y < 128; y += 9) cx.fillRect(0, y, 96, 1);
          cx.fillStyle = '#1a1a1a'; cx.font = 'bold 12px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'top';
          cx.fillText(L1.slice(0, n), 8, 14); cx.font = 'bold 10px "Courier New", monospace'; cx.fillText(L2.slice(0, Math.max(0, n - L1.length)), 6, 40); cx.fillStyle = '#a01010'; cx.font = 'bold 12px "Courier New", monospace'; cx.fillText(L3.slice(0, Math.max(0, n - L1.length - L2.length)), 8, 56); pt.needsUpdate = true; }
        tw.children.forEach((k) => { if (k.userData.key !== undefined) k.position.y = 0.105 + Math.floor(k.userData.key / 10) * 0.012 - (k.userData.key === (n * 7) % 40 && n < TOT ? 0.006 : 0); });
        paper.position.y = 0.33 + 0.004 * Math.floor(n / 9);
        const wp = tw.localToWorld(V(0, 0.3, 0));
        look(c, cr([[0, 2.12, UY + 1.2, -0.42], [2.0, 2.14, UY + 1.17, -0.5]], lt), wp);
      } };
  }
  // ---------- 09 golpes en la puerta de entrada (abajo, a oscuras): golpes educados, luz bajo la puerta y sombra de pies ----------
  const D1KN = () => W.knock_hits;
  { const c = cam(48);
    out['09_knock'] = { scene, camera: c, overlay: vign(0.5), update(lt, t) {
      state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: 4, glowK: 1 }); ch.root.visible = false;
      livL.intensity = 1.2; const k = hitK(t, D1KN(), 0.16); leaves.D1.g.rotation.y = 0.015 * Math.abs(k); leaves.D1.hdl.rotation.z = 0;
      look(c, cr([[0, holes.D1.c - 0.2, 1.2, 2.6], [2.0, holes.D1.c - 0.15, 1.15, 2.9]], lt), V(holes.D1.c, 0.9, 5.0));
    } };
  }
  // 09b Ava arriba detras de la barricada mira hacia abajo, cara de miedo ("Zombies don't knock")
  const topAva = (lt, t, faces) => { AVA(1.05, ZT - 0.35, 0.15, UY); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.55 })], faces); };
  { const c = cam(46);
    out['09b_ava'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: 4, glowK: 1 }); livL.intensity = 1.2;
      topAva(lt, t, [[-99, 'scared', mouthAt(t, 'neutral')]]);
      look(c, V(1.0, UY + 1.15, ZT + 1.1), V(1.05, UY + 1.4, ZT - 0.35)); ch.lookAt(c, 0.35, 20);
    } };
  }
  // 09c la voz detras de la puerta: la manija gira despacio, la sombra de pies se mueve
  { const c = cam(40);
    out['09c_door'] = { scene, camera: c, overlay: vign(0.5), update(lt, t) {
      state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: 4, glowK: 1 }); ch.root.visible = false; livL.intensity = 1.2;
      leaves.D1.hdl.rotation.z = -0.35 * ease(0.3, 0.7, lt) * (1 - ease(1.0, 1.3, lt)); feetShadow.forEach((f, i) => { f.position.x = holes.D1.c + (i ? 0.1 : -0.12) + 0.03 * Math.sin(lt * 3 + i); });
      look(c, cr([[0, holes.D1.c + 0.05, 1.25, 3.0], [1.6, holes.D1.c + 0.03, 1.2, 3.3]], lt), V(holes.D1.c, 1.0, 5.0));
    } };
  }
  // 09d (v1 usuario) sobre el hombro de Ava, en corte: la escalera bloqueada abajo (sofa + comoda) y, mas alla, la puerta de entrada que golpean
  { const c = cam(60);
    out['09d_look'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['09d_look'] + lt;
        tag(o, c, V(SXM, 1.5, ZB + 0.4), 90, 470, 'BLOCKED', '#ff7b2e', ease(T['09d_look'] + 0.3, T['09d_look'] + 0.5, t), 1);
        tag(o, c, V(holes.D1.c, 1.8, 5.0), 270, 520, 'FRONT DOOR', '#ff8a70', ease(T['09d_look'] + 0.5, T['09d_look'] + 0.7, t), 1); },
      update(lt, t) {
      state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: 4, glowK: 1 }); livL.intensity = 2.2;
      upCut.forEach((o) => { o.visible = false; }); for (const id of ['uWw', 'UW']) winGroups[id].visible = false;
      const k = hitK(t, [T['09d_look'] + 0.25, T['09d_look'] + 0.45, W.bitten - 0.6], 0.16); leaves.D1.g.rotation.y = 0.015 * Math.abs(k);
      AVA(1.05, ZT - 0.35, 0.1, UY); ch.pose(lt, [L.seg('peek', -99, { from: 0.0, speed: 0.6 })], [[-99, 'scared', 'neutral']]);
      look(c, cr([[0, 1.0, UY + 3.1, ZT - 1.45], [1.8, 0.95, UY + 3.05, ZT - 1.35]], lt), V(-1.1, 0.4, 4.4));
    } };
  }
  // ---------- 10 menu RE final sobre el plano vivo: Ava respira arriba de la escalera (sin subtitulos) ----------
  { const c = cam(50), RED = '#ff5a4a', WHITE = '#f0f0f0';
    const left = (cx, s, x, y, sc, col, o2) => bitText(cx, s, x + textWidth(s, sc) / 2, y, sc, col, o2);
    out['10_choice'] = { scene, camera: c, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T['10_choice'] + lt; vign(0.55)(lt, dt, a, o);
      const kp = L.clamp01(lt / 0.2), PX = 12, PY = 74, PW = 336, PH = 168, X0 = 64, XR = PX + PW - 14;   // v1 (usuario): todo el texto dentro del recuadro con margen
      cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH);
      px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
      { const q = 'SHOULD I OPEN THE DOOR?', qs = textWidth(q, 2) <= PW - 28 ? 2 : 1; bitText(cx, q, LW / 2, 104, qs, '#ececec', { outline: '#000000' }); }
      const opts = [['1. LET THEM IN', W.let11, RED], ['2. STAY QUIET', W.quiet11, WHITE]];
      const sel = t >= W.quiet11 ? 1 : t >= W.let11 ? 0 : -1;
      const osc = opts.every(([s]) => X0 + textWidth(s, 3) <= XR) ? 3 : 2;
      opts.forEach(([s, tw2, col], i) => { const y = 150 + i * 46; left(cx, s, X0, y, osc, i === sel ? col : '#8a8a8a', { outline: '#000000' });
        if (i === sel) { const on = Math.floor((t - tw2) * 4) % 2 === 0, x0 = X0 - 24; for (let k = 0; k < 10; k++) px(cx, x0 + k, y - 11 + k, on ? '#ffe048' : '#c89a20', 1, 23 - 2 * k); } });
      if (t >= W.comment) { const b = Math.round(3 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, 548 + b, 2, '#ffd23f', { outline: '#000000' }); }
      if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, 598, 2, '#ececec', { outline: '#000000' });
    }, update(lt, t) {
      state({ sofaK: 1, dresserK: 1, topDoorOn: true, screwsK: 1, shelfK: 1, ladderK: 1, sash: 1, items: 4, glowK: 1 }); livL.intensity = 1.2;
      topAva(lt, t, [[-99, 'scared', 'neutral']]);
      const k = hitK(t, W.knock_end, 0.16); leaves.D1.g.rotation.y = 0.015 * Math.abs(k);
      look(c, cr([[0, 0.9, UY + 1.45, ZT + 1.9], [5, 0.95, UY + 1.5, ZT + 1.75]], lt), V(1.0, UY + 1.75, ZT - 0.4)); ch.lookAt(c, 0.7, 30);
    } };
  }
  void ROOMLAB; void SOFA_BAR;
  return out;
}
