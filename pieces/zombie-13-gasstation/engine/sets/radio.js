// sets/radio.js — ep12 "AVA: The Radio" (casa del ep10/ep11 reutilizada: mundo, Ava, zombis; planos nuevos al final). Base: sets/xvirus.js / stairs.js.
// La MISMA casa del ep1/ep7 en corte (papel, parquet, sofa azul, puerta acolchada "13") con un PRIMER PISO nuevo y la escalera
// en el pasillo (ensanchado a x [-0.6, 1.5]): 14 escalones de z 4.0 (abajo, junto a D2) a z 0.7 (arriba, rellano).
// Barricadas: sofa volcado + comoda abajo, puerta de canto + estanteria (foto Flow) arriba; escalera de cuerda (codigo) en la ventana UW.
// Cada update() fija TODO el estado. Tiempos: cues.json (voz/build_cues.py).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { makeSpray } from './respray.js';
import { makeRadio, makeHerb, makeNotebook, makeHatMan, makeTypewriter } from './radioprops.js';
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
    ['z', -5, -4, 5, 'out', 'liv', [DOOR(-2.85, 0.9, 'D3'), WIN(-1.7, 1.0, 'wK2'), [1.8, 1.3, 0.45, 2.4, 'W1'], WIN(3.8, 1.1, 'W2')], 0],
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
  const hand3 = (h, sd) => h.hand(sd).getWorldPosition(V());
  const fore3 = (h, sd, k = 0.5) => { const fa = h.bone.getObjectByName('Forearm' + sd), hb = h.hand(sd); return fa.getWorldPosition(V()).lerp(hb.getWorldPosition(V()), k); };
  const unbreathe = (h) => { const cb = h.bone.getObjectByName('Chest'); if (cb && cb.userData.br) { cb.rotation.x -= cb.userData.br; cb.userData.br = 0; } };
  const breathe = (h, t, a = 0.02) => { const cb = h.bone.getObjectByName('Chest'); if (!cb) return; const v = a * Math.sin(L.q15(t) * 2.4); cb.rotation.x += v; cb.userData.br = v; };
  // =====================================================================================================================
  // ep12 "The Radio" — apagon de noche en el living (luna azul por las ventanas oeste + farol calido), radio a manivela,
  // auricular con cable, maceta de hierba verde, libreta (itchy... tasty... tachado), nota en la nevera, maquina de escribir,
  // hombre del sombrero que pasa por la ventana. Props en sets/radioprops.js. Cada update() fija TODO el estado.
  // =====================================================================================================================
  const RAD = makeRadio(L); scene.add(RAD.g);
  const herb = makeHerb(L); scene.add(herb);
  const NB = makeNotebook(L); scene.add(NB.g);
  const HAT = makeHatMan(L); scene.add(HAT.g);
  // v3 (usuario): lo que se ve por la ventana W1 en 08b vive en su PROPIA escena, se renderiza a 1/7 de resolucion (52x92, nearest)
  // con la misma camara y se pega en la abertura de la ventana con un plano que muestrea en espacio de pantalla. Casi negro: cielo y luna apagados.
  const OUT = { scene: new THREE.Scene(), rt: new THREE.WebGLRenderTarget(52, 92, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType }) };
  OUT.scene.background = new THREE.Color(0x05070c);
  if (L.QS.has('gdbg')) { OUT.rt.setSize(360, 640); OUT.scene.add(new THREE.AmbientLight(0xffffff, 3)); }
  OUT.scene.add(new THREE.AmbientLight(0x404a66, 0.35)); { const dl = new THREE.DirectionalLight(0x8c9cc8, 0.55); dl.position.set(2, 6, 1.5); OUT.scene.add(dl); }
  { const sk = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshBasicMaterial({ map: L.cvs(16, 16, (c) => { const gg = c.createLinearGradient(0, 0, 0, 16); gg.addColorStop(0, '#05070c'); gg.addColorStop(0.7, '#111830'); gg.addColorStop(1, '#18213a'); c.fillStyle = gg; c.fillRect(0, 0, 16, 16); }) }));
    sk.position.set(-18, 4, 0); sk.rotation.y = Math.PI / 2; OUT.scene.add(sk);
    const mn = new THREE.Mesh(new THREE.CircleGeometry(1.0, 10), new THREE.MeshBasicMaterial({ color: 0x3a4056 })); mn.position.set(-17.5, 5.6, -1.4); mn.rotation.y = Math.PI / 2; OUT.scene.add(mn);
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ color: 0x07080a })); gr.rotation.x = -Math.PI / 2; gr.position.set(-12, -0.05, 0); OUT.scene.add(gr);
    for (const [x, z, h] of [[-13, -4, 5], [-15, 3, 6.5], [-11, 6, 4], [-16, -8, 6]]) { const tr = new THREE.Mesh(new THREE.ConeGeometry(1.2, h, 5), new THREE.MeshLambertMaterial({ color: 0x050608, flatShading: true })); tr.position.set(x, h / 2, z); OUT.scene.add(tr); } }
  // v3b (usuario: las primitivas a mano se ven peor): base = maniqui de Quaternius "Universal Animation Library" (CC0, models/giant_base.glb)
  // con su Walk_Loop. Gigante ORIGINAL: >2,5 m, pecho y hombros ensanchados, cuello y brazos gruesos, puños grandes, cabeza chica;
  // gabardina larga (torso + faldon hasta las canillas + cuello alzado + solapas) y fedora pegados a los huesos. Paso lento y pesado.
  const GIANT = await (async () => {
    const gl = await L.loadModel('models/giant_base.glb'), root = L.ps1Clone(gl.scene), wrap = new THREE.Group(); wrap.add(root); OUT.scene.add(wrap);
    const dark = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
    const mBody = dark(0x0b0b0f), mCoat = dark(0x0d0d12), mHat = dark(0x08080b), mSkin = dark(0x141110);
    root.traverse((o) => { if (o.isMesh) { o.material = mBody; o.frustumCulled = false; } });
    const B = {}; root.traverse((o) => { if (o.isBone) B[o.name.toLowerCase().replace(/[^a-z0-9]/g, '')] = o; });
    const mx = new THREE.AnimationMixer(root), act = mx.clipAction(THREE.AnimationClip.findByName(gl.animations, 'Walk_Loop')), idle = mx.clipAction(THREE.AnimationClip.findByName(gl.animations, 'Idle_Loop'));
    act.play(); idle.play();
    const pose = (t, w) => { act.setEffectiveWeight(w); idle.setEffectiveWeight(1 - w); act.time = (t * 0.62) % act.getClip().duration; idle.time = t % idle.getClip().duration; mx.update(0); bulk(); };
    const S3 = (b, x, y, z) => { if (b) b.scale.set(x, y, z); };
    const bulk = () => {   // los clips traen escala: se reaplica despues de cada update
      S3(B.defspine003, 1.22, 1.0, 1.28); S3(B.defspine002, 1.2, 1.0, 1.2); S3(B.defneck, 1.45, 1.0, 1.45); S3(B.defhead, 0.6, 0.72, 0.6);
      for (const sd of ['l', 'r']) { S3(B['defupperarm' + sd], 1.45, 0.95, 1.45); S3(B['defhand' + sd], 1.35, 1.1, 1.35); S3(B['defthigh' + sd], 1.25, 1.0, 1.25); }
    };
    // ropa en coordenadas de mundo con el maniqui en el origen (pose 0), pegada con attach() a su hueso
    wrap.position.set(0, 0, 0); wrap.rotation.set(0, 0, 0); wrap.scale.set(1, 1, 1); pose(0, 1); root.updateMatrixWorld(true);
    const add = (geo, m, x, y, z, bone, sc = [1, 1, 1], rot = [0, 0, 0]) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(...sc); o.rotation.set(...rot); OUT.scene.add(o); o.updateMatrixWorld(true); bone.attach(o); return o; };
    const hip = B.defhips, chest = B.defspine003, head = B.defhead;
    add(new THREE.CylinderGeometry(0.2, 0.29, 0.78, 7, 1, true), mCoat, 0, 0.62, 0.0, hip, [1, 1, 0.78]);                     // faldon recto hasta las canillas
    add(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 7), mCoat, 0, 1.12, 0.0, B.defspine001 || hip, [1.05, 1, 0.75]);             // cintura
    add(new THREE.CylinderGeometry(0.25, 0.21, 0.36, 7), mCoat, 0, 1.38, 0.0, chest, [1.1, 1, 0.78]);                          // pecho
    add(new THREE.CylinderGeometry(0.1, 0.15, 0.13, 7, 1, true), mCoat, 0, 1.58, -0.01, chest, [1.2, 1, 1]);                   // cuello alzado
    for (const sd of [-1, 1]) add(new THREE.BoxGeometry(0.1, 0.3, 0.02), mSkin, sd * 0.07, 1.37, 0.17, chest, [1, 1, 1], [0, 0, sd * 0.25]);   // solapas
    const hy = head.getWorldPosition(new THREE.Vector3()).y;
    add(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 12), mHat, 0, hy + 0.14, 0.01, head);                                     // ala
    add(new THREE.CylinderGeometry(0.09, 0.105, 0.11, 10), mHat, 0, hy + 0.2, 0.01, head);                                    // copa
    wrap.scale.set(1.62, 1.42, 1.45);   // ~2,6 m, muy ancho
    if (L.QS.has('gdbg')) wrap.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshLambertMaterial({ color: 0xb0b0b0, flatShading: true }); });
    return { g: wrap, walk(t, w = 1) { pose(L.q15(t), w); wrap.children[0].position.y = 0; } };
  })();
  const outPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 1.97), new THREE.ShaderMaterial({ uniforms: { tex: { value: OUT.rt.texture } },
    vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D tex; void main(){ gl_FragColor = texture2D(tex, gl_FragCoord.xy / vec2(360.0, 640.0)); }' }));
  outPlane.position.set(-5.075, (0.45 + 2.4) / 2, 1.8); outPlane.rotation.y = Math.PI / 2; scene.add(outPlane); outPlane.visible = false;
  const TWR = makeTypewriter(L); scene.add(TWR.g);
  const lantern = await prop('lantern'); scene.add(lantern);
  const clock = await prop('wall_clock'); scene.add(clock);
  const phone = await prop('phone'); { const pr = (L.QS.get('phrot') ?? '1.5708,0,3.1416').split(',').map(Number); L.holdIn(ch, phone, 'R', [0, 0.9, 0.2], pr); } phone.visible = false;
  const SIT = V(-2.6, 0, 2.15), TBL = V(-2.6, 0, 3.15), TH = 0.42;
  { const mT = lam(tWood, 0x8a5a3a); B(0.95, 0.05, 0.55, mT, TBL.x, TH - 0.025, TBL.z, furn); for (const dx of [-0.42, 0.42]) for (const dz of [-0.22, 0.22]) B(0.05, TH - 0.05, 0.05, mT, TBL.x + dx, (TH - 0.05) / 2, TBL.z + dz, furn); }
  const RADP = V(TBL.x + 0.22, TH + RAD.H / 2, TBL.z - 0.05);
  const setRadioHome = () => { RAD.g.position.copy(RADP); RAD.g.rotation.set(0, 0, 0); RAD.g.scale.setScalar(1); scene.add(RAD.g); };
  setRadioHome();
  NB.g.position.set(TBL.x - 0.2, TH, TBL.z + 0.02); NB.g.rotation.set(0, 0.12, 0); NB.pencil.position.set(0.02, 0.018, 0.16); NB.pencil.rotation.set(0, 0.4, 0);
  { const bb = new THREE.Box3().setFromObject(lantern); const k = 0.26 / (bb.max.y - bb.min.y); lantern.scale.multiplyScalar(k); lantern.position.set(TBL.x - 0.38, TH - bb.min.y * k, TBL.z - 0.12); }
  herb.position.set(SIT.x - 0.75, 0, SIT.z + 0.35); herb.scale.setScalar(1.6);
  { const bb = new THREE.Box3().setFromObject(clock); const k = 0.5 / (bb.max.y - bb.min.y); clock.scale.multiplyScalar(k); clock.position.set(-2.6, 1.72, 0.6 + 0.07); }
  { let top = 0.55; furn.children.forEach((o) => { if (Math.abs(o.position.x + 1.1) < 0.01 && Math.abs(o.position.z - 1.0) < 0.01) { const bb = new THREE.Box3().setFromObject(o); top = bb.max.y; } }); TWR.g.position.set(-1.1, top + 0.001, 1.0); TWR.g.rotation.set(0, -0.5, 0); }   // v2: apoyada en la tapa real de la mesita
  // luces de la noche
  const lanL = new THREE.PointLight(0xffb868, 5.5, 5.5, 1.3); scene.add(lanL);
  const phL = new THREE.PointLight(0x9cc8ff, 0, 1.6, 1.5); scene.add(phL);
  const kitL = new THREE.PointLight(0xffc080, 0, 4, 1.4); kitL.position.set(-1.8, 1.6, -2.6); scene.add(kitL);
  // cielo de luna detras de las ventanas oeste (la silueta pasa entre el cielo y el vidrio)
  const tSky = L.cvs(64, 32, (c) => { const g = c.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, '#1c2c58'); g.addColorStop(0.7, '#4a6aa8'); g.addColorStop(1, '#6a88c0'); c.fillStyle = g; c.fillRect(0, 0, 64, 32); c.fillStyle = '#f4f2dc'; c.beginPath(); c.arc(30, 8, 4, 0, 7); c.fill(); c.fillStyle = '#16203a'; for (let x = 0; x < 64; x += 3) { const h = 3 + ((x * 7) % 5); c.fillRect(x, 32 - h, 3, h); } });
  const sky = L.plane(30, 12, L.basic(tSky), -16, 3.5, 0, scene, Math.PI / 2); void sky;
  const moonP = []; for (const id of ['W1', 'W2']) { const hl = holes[id]; const p = L.plane(1.0, 0.75, L.basic(null, 0x8ab0ff, { transparent: true, opacity: 0.22, depthWrite: false, ...PO }), -4.45, 0.01, hl.c, scene, 0, -Math.PI / 2); p.material.blending = THREE.AdditiveBlending; p.renderOrder = 4; moonP.push([p, hl.c]); }
  // auricular: boton blanco en la oreja izquierda (+x en reposo), pegado al hueso Head; cable de linea con comba hasta el jack
  const bonesA = {}; ch.bone.traverse((o) => { if (o.isBone && !bonesA[o.name]) bonesA[o.name] = o; });
  const EAR = { x: Number(L.QS.get('earX') ?? 0.083), y: Number(L.QS.get('earY') ?? 1.485), z: Number(L.QS.get('earZ') ?? 0.0) };
  const earbud = new THREE.Group();
  { ch.root.position.set(0, 0, 0); ch.root.rotation.set(0, 0, 0); ch.pose(0, L.still('idle', 0)); ch.root.updateMatrixWorld(true);
    earbud.position.set(EAR.x, EAR.y, EAR.z); L.mesh(new THREE.SphereGeometry(0.013, 6, 5), L.lam(null, 0xf4f4f0), 0, 0, 0, earbud); B(0.008, 0.03, 0.008, L.lam(null, 0xf4f4f0), 0.004, -0.02, 0, earbud);
    scene.add(earbud); earbud.updateMatrixWorld(true); bonesA.Head.attach(earbud); }
  const NC = 24, cable = new THREE.Group(); scene.add(cable); const mCab = L.lam(null, 0xf0f0ea), cabSeg = []; for (let i = 0; i < NC - 1; i++) { const m = B(0.009, 0.009, 1, mCab, 0, 0, 0, cable); m.frustumCulled = false; cabSeg.push(m); }   // fix storyboard: cable grueso (cajitas), visible a 360x640
  const setCable = (on) => { cable.visible = on; earbud.visible = on; if (!on) return; ch.root.updateMatrixWorld(true); RAD.g.updateMatrixWorld(true);
    const a = RAD.jack.getWorldPosition(V()), b = earbud.localToWorld(V(0.004, -0.035, 0)), pts = [];
    for (let i = 0; i < NC; i++) { const u = i / (NC - 1), p = a.clone().lerp(b, u); const sn = Math.sin(Math.PI * u); p.y -= 0.34 * sn * (1 - u * 0.6); p.z += 0.10 * sn; p.x += 0.16 * sn + 0.04 * Math.sin(Math.PI * 2 * u); pts.push(p); }   // v2: cae en curva hacia afuera (no un palo recto)
    cabSeg.forEach((m, i) => { const d = pts[i + 1].clone().sub(pts[i]); m.position.copy(pts[i]).add(pts[i + 1]).multiplyScalar(0.5); m.scale.set(1, 1, d.length() + 0.004); m.lookAt(pts[i + 1]); }); };
  // nevera: notas pegadas (cada una en su palabra) + la nota "master of unlocking"
  const FR = V(-1.2, 0, -3.55);
  const noteTex = (lines, bg, rot = 0) => L.cvs(48, 48, (c) => { const r = L.rng(lines.join().length); px(c, 0, 0, bg, 48, 48); for (let k = 0; k < 30; k++) px(c, r() * 48 | 0, r() * 48 | 0, 'rgba(0,0,0,0.06)', 1, 1); px(c, 0, 0, 'rgba(0,0,0,0.12)', 48, 4);
    c.save(); c.translate(24, 24); c.rotate(rot); c.fillStyle = '#1a1a3a'; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach(([s, sz, col], i) => { c.font = `bold ${sz}px "Comic Sans MS", cursive`; c.fillStyle = col || '#1a1a3a'; c.fillText(s, 0, -14 + i * 12); }); c.restore(); });
  const NOTES = [['shelters', ['SHELTER', 'school gym', 'IIII'], '#f0e070', -0.18, 1.62, 0.1], ['routes', ['ROUTE 9', 'open west', 'III'], '#a8e0f0', 0.12, 1.4, -0.08], ['curfew', ['CURFEW', '6 PM', 'IIII'], '#f4a0b0', -0.14, 1.12, 0.06]];
  const fridgeNotes = {};
  { const bb = new THREE.Box3().setFromObject(furn.children.find((o) => o.position.x === FR.x && o.position.z === FR.z) || furn); void bb; }
  const FZ = Number(L.QS.get('frz') ?? -3.18);   // cara frontal de la nevera (z)
  for (const [k, ls, bg, x, y, r] of NOTES) { const m = L.plane(0.2, 0.2, lam(noteTex(ls.map((s, i) => [s, i === 0 ? 9 : i === 2 ? 11 : 8, i === 2 ? '#b01818' : null]), bg)), FR.x + x, y, FZ, scene); m.rotation.z = r; fridgeNotes[k] = m; }
  const unlock = L.plane(0.3, 0.25, lam(L.cvs(48, 40, (c) => { px(c, 0, 0, '#f4f0e4', 48, 40); px(c, 0, 0, '#e05050', 48, 3); c.fillStyle = '#2a2a6a'; c.font = 'italic bold 8px "Comic Sans MS", cursive'; c.textAlign = 'center'; c.fillText('you are the', 24, 13); c.fillText('master of', 24, 23); c.fillText('unlocking!', 24, 33);
    c.strokeStyle = '#2a2a6a'; c.beginPath(); c.moveTo(41, 33); c.lineTo(46, 28); c.stroke(); })), FR.x + 0.15, 1.72, FZ + 0.002, scene); unlock.rotation.z = -0.1;
  const magnet = (x, y, col) => L.mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.012, 8), lam(null, col), x, y, FZ + 0.006, scene).rotation.x = Math.PI / 2;
  magnet(FR.x + 0.15, 1.83, 0xd02020); magnet(FR.x - 0.18, 1.71, 0x2050d0); magnet(FR.x + 0.12, 1.49, 0x20a040); magnet(FR.x - 0.14, 1.21, 0xe0a020);
  const st12 = ({ cableOn = false, phoneOn = false, hat = false, kit = false } = {}) => {
    state({ up: true, twOn: false }); leaves.BD.g.visible = false;
    amb.color.set(0x7088c8); amb.intensity = 0.42; hemi.intensity = 0.32; sun.color.set(0x90a8ff); sun.intensity = 0.45; sun.position.set(-10, 8, 2);
    livL.intensity = 0; hallL.intensity = 0.5; upL.intensity = 0.4; bedL.intensity = 0.2; kitL.intensity = kit ? 3.5 : 0;
    lantern.updateMatrixWorld(true); lanL.position.copy(lantern.getWorldPosition(V()).add(V(0, 0.2, 0.05)));
    setRadioHome(); RAD.set({}); RAD.crank.scale.set(1, 1, 1); if (typeof crate !== 'undefined') crate.visible = false; phone.visible = phoneOn; phL.intensity = 0; HAT.g.visible = false; moon.visible = false; outPlane.visible = false; glass.W1.pane.visible = !hat;   // v3: sin vidrio rayado delante de la capa de baja resolucion moonP.forEach(([p]) => { p.material.opacity = 0.22; });
    setCable(cableOn); ch.root.visible = true;
  };
  const TW = []; const twk = (b, ax, v) => { b.rotation[ax] += v; TW.push([b, ax, v]); }; const untw = () => { while (TW.length) { const [b, ax, v] = TW.pop(); b.rotation[ax] -= v; } };
  const sitPose = (lt, faces) => { untw(); unbreathe(ch); AVA(SIT.x, SIT.z, 0); ch.pose(lt, L.still('sit_floor', 9), faces); };
  const NOTE_LINES = (t) => [['8 PM  1040 AM', W.time5 - 99], ['shelter: gym', W.time5 - 99], ['9 PM  1040 AM', W.time5], ['shelter: gym', W.frequency]];
  const drawLog = (t) => NB.draw((c) => {
    c.fillStyle = '#1a2a5a'; c.font = 'bold 9px "Comic Sans MS", cursive'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText('RADIO LOG', 18, 9);
    c.font = 'italic 8px "Comic Sans MS", cursive'; c.fillStyle = '#4a2a1a'; c.fillText('itchy...', 18, 21); c.fillText('tasty...', 50, 21);   // homenaje: tachado
    c.strokeStyle = '#2a1a3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(16, 21); c.lineTo(46, 20); c.moveTo(48, 22); c.lineTo(82, 21); c.stroke();
    let y = 41; for (const [s, t0] of NOTE_LINES(t)) { const n = Math.max(0, Math.min(s.length, Math.floor((t - t0) * 16))); if (n) { c.font = 'bold 8px "Comic Sans MS", cursive'; c.fillStyle = '#1a2a5a'; c.fillText(s.slice(0, n), 18, y); } y += 10; }
  });
  const staticFx = (o, c3, k, seed) => { if (k <= 0) return; RAD.g.updateMatrixWorld(true); const p = RAD.g.localToWorld(V(-0.06, 0.02, 0.05)), [sx, sy] = L.toScreen(c3, p.x, p.y, p.z), R = L.rng(seed), cx = o.tctx;
    cx.globalAlpha = Math.min(1, k); for (let i = 0; i < 14; i++) { const a = -1.2 + R() * 1.4, d = 18 + R() * 40; px(cx, sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.7, i % 3 ? '#e8f0ff' : '#9ad8ff', 2 + (R() * 8 | 0), 1); } cx.globalAlpha = 1; };
  const radioWave = (o, c3, k, t, col = '#62f05a') => { if (k <= 0) return; RAD.g.updateMatrixWorld(true); const p = RAD.g.localToWorld(V(-0.06, 0.02, 0.05)), [sx, sy] = L.toScreen(c3, p.x, p.y, p.z), cx = o.tctx;
    cx.globalAlpha = k; cx.strokeStyle = col; cx.lineWidth = 2; for (let i = 0; i < 3; i++) { const r = 14 + ((L.q15(t) * 30 + i * 12) % 36); cx.globalAlpha = k * (1 - r / 52); cx.beginPath(); cx.arc(sx, sy, r, -0.9, 0.9); cx.stroke(); cx.beginPath(); cx.arc(sx, sy, r, Math.PI - 0.9, Math.PI + 0.9); cx.stroke(); } cx.globalAlpha = 1; };

  // ---------- 01 gancho: apagon, Ava con el telefono sin senal ----------
  { const c = cam(50);
    out['01_hook'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = lt;
        tag(o, c, V(-4.55, 1.35, 1.0), 92, 150, 'NO POWER', '#ff7b2e', ease(W.lights - 0.05, W.lights + 0.12, t));
        ch.root.updateMatrixWorld(true); tag(o, c, phone.getWorldPosition(V()), 262, 190, 'NO BARS', '#ff4030', ease(W.bars - 0.05, W.bars + 0.12, t)); },
      update(lt, t) {
        st12({ phoneOn: true }); AVA(-2.9, 2.55, 0.25);
        ch.pose(lt, [L.seg('phone_look', 0, { from: 0.5, speed: 0.45 })], [[-99, 'half', mouthAt(t, 'frown')], [W.bars, 'sad', mouthAt(t, 'frown')]]);
        ch.root.updateMatrixWorld(true);
        { // v2 (usuario): la pantalla mira a SUS ojos (eje +Z del modelo = pantalla, +Y = largo); el dorso queda hacia la camara
          const fa = V(Math.sin(0.25), 0, Math.cos(0.25)), pp = phone.getWorldPosition(V()), eye = bonesA.Head.getWorldPosition(V()).add(V(0, 0.1, 0.08)), n = eye.clone().sub(pp).normalize().add(fa.clone().multiplyScalar(-1.1)).normalize();   // mas parado: pantalla hacia ella, dorso a 3/4 hacia la camara
          const y = fa.clone().sub(n.clone().multiplyScalar(fa.dot(n))).normalize(), x = y.clone().cross(n);
          const qw = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, n)), qp = phone.parent.getWorldQuaternion(new THREE.Quaternion());
          phone.quaternion.copy(qp.invert().multiply(qw)); phone.updateMatrixWorld(true); }
        phL.position.copy(phone.getWorldPosition(V()).add(V(0, 0.1, 0.05))); phL.intensity = 0.9;
        look(c, cr([[0, -2.35, 1.4, 4.55], [3, -2.45, 1.38, 4.3]], lt), V(-2.85, 1.15, 2.55));
      } };
  }
  // ---------- 01b la manivela: Ava de pie gira la manivela de la radio, que descansa sobre una caja de provisiones.
  // El clip 'pump' mueve la mano derecha arriba/abajo (periodo 1 s); se le suma un balanceo lateral del brazo (UpperArmR) en cuadratura,
  // asi la mano dibuja un circulo, y la manivela se orienta cada cuadro hacia la mano (el pomo queda en la palma).
  const CR = { pos: V(-2.9, 0, 2.55), yaw: 0.25 };
  const crate = new THREE.Group(); scene.add(crate);
  { const tCr = L.cvs(32, 32, (c) => { const r = L.rng(1210); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 16; px(c, x, y, `rgb(${120 + n},${86 + n * 0.7},${48 + n * 0.4})`); } for (let y = 0; y < 32; y += 8) px(c, 0, y, '#4a3018', 32, 1); px(c, 0, 0, '#4a3018', 2, 32); px(c, 30, 0, '#4a3018', 2, 32); c.fillStyle = '#2a1a0a'; c.font = 'bold 6px monospace'; c.fillText('SUPPLY', 7, 20); });
    const m = lam(tCr, 0x9a8a78); B(0.3, 1, 0.3, m, 0, 0.5, 0, crate); }
  const crankFit = (() => {   // centro y radio del recorrido de la mano en 'pump' (Ava en CR)
    const at = (x) => { AVA(CR.pos.x, CR.pos.z, CR.yaw); ch.pose(0, L.still('pump', x), null); ch.root.updateMatrixWorld(true); return ch.hand('R').localToWorld(V(0, 0.75, 0)); };
    const top = at(0), bot = at(0.47), sh = (() => { at(0); return bonesA.UpperArmR.getWorldPosition(V()); })();
    return { P: top.clone().add(bot).multiplyScalar(0.5), A: (top.y - bot.y) / 2, Lr: sh.distanceTo(top.clone().add(bot).multiplyScalar(0.5)) };
  })();
  const fwd = V(Math.sin(CR.yaw), 0, Math.cos(CR.yaw)), left = V(Math.cos(CR.yaw), 0, -Math.sin(CR.yaw));
  // fix storyboard: el circulo de la mano va en el plano sagital (arriba/abajo + adelante/atras), el eje de la manivela es lateral
  // y la camara mira desde la derecha de Ava, asi el giro se ve de frente (antes se leia como bombear).
  const SWAY = Number(L.QS.get('sway') ?? 1.15);
  // v2 (usuario: el brazo temblaba): IK analitico de dos huesos a 30 fps continuos (sin clip 'pump' ni cuantizar a 15 fps).
  // Pose base quieta ('pump' a mitad de recorrido); la mano (palma) recorre un circulo exacto en el plano sagital (arriba + adelante).
  const CQ = {};
  const crankPose = (lt, faces) => {
    if (!CQ.ua) { AVA(CR.pos.x, CR.pos.z, CR.yaw); ch.pose(0, L.still('idle', 0), null); ch.pose(0, L.still('pump', 0.23), null); CQ.ua = bonesA.UpperArmR.quaternion.clone(); CQ.fa = bonesA.ForearmR.quaternion.clone(); }
    bonesA.UpperArmR.quaternion.copy(CQ.ua); bonesA.ForearmR.quaternion.copy(CQ.fa);   // el clip quieto no reescribe huesos sin cambio: se restauran a mano
    AVA(CR.pos.x, CR.pos.z, CR.yaw); ch.pose(lt, L.still('pump', 0.23), faces); ch.root.updateMatrixWorld(true);
    const th = -lt * Math.PI * 2 * 0.9, A = crankFit.A * 0.9, up = V(0, 1, 0);
    const target = crankFit.P.clone().add(up.clone().multiplyScalar(A * Math.cos(th))).add(fwd.clone().multiplyScalar(A * Math.sin(th)));
    const ua = bonesA.UpperArmR, fa2 = bonesA.ForearmR, hb = ch.hand('R');
    const palm = hb.localToWorld(V(0, 0.75, 0)), wr = hb.getWorldPosition(V()), T = target.clone().sub(palm.clone().sub(wr));
    const S = ua.getWorldPosition(V()), E = fa2.getWorldPosition(V()), l1 = E.distanceTo(S), l2 = wr.distanceTo(E);
    const dS = T.clone().sub(S), d = Math.min(l1 + l2 - 1e-4, Math.max(Math.abs(l1 - l2) + 1e-4, dS.length())), dir = dS.normalize();
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const es = E.clone().sub(S), perp = es.clone().sub(dir.clone().multiplyScalar(es.dot(dir))).normalize(), E2 = S.clone().add(dir.clone().multiplyScalar(a)).add(perp.multiplyScalar(h));
    const rotB = (bone, from, to) => { const q = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize()), qw = bone.getWorldQuaternion(new THREE.Quaternion()), pw = bone.parent.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pw.invert().multiply(q.multiply(qw))); ch.root.updateMatrixWorld(true); };
    rotB(ua, E.clone().sub(S), E2.clone().sub(S));
    const E3 = fa2.getWorldPosition(V()), W3 = hb.getWorldPosition(V()); rotB(fa2, W3.clone().sub(E3), T.clone().sub(E3));
    return hb.localToWorld(V(0, 0.75, 0));
  };
  const placeCrankRadio = (hand) => {   // radio a la izquierda del centro del giro; su eje x local apunta a la derecha de Ava (hacia la manivela)
    const th = CR.yaw + Math.PI; RAD.g.rotation.set(0, th, 0); RAD.g.updateMatrixWorld(true);
    const off = RAD.crank.position.clone().applyEuler(RAD.g.rotation); RAD.g.position.copy(crankFit.P.clone().sub(off).add(left.clone().multiplyScalar(0.035))); RAD.g.updateMatrixWorld(true);
    const loc = RAD.g.worldToLocal(hand.clone()).sub(RAD.crank.position), r = Math.hypot(loc.y, loc.z);
    RAD.crank.rotation.x = Math.atan2(-loc.z, -loc.y); RAD.crank.scale.set(1, r / 0.07, 1);   // v2: solo el largo del brazo (antes se engordaba en z: losa negra)
    crate.position.set(RAD.g.position.x, 0, RAD.g.position.z); crate.rotation.y = th; crate.scale.y = RAD.g.position.y - RAD.H / 2;
  };
  { const c = cam(46);
    out['01b_crank'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['01b_crank'] + lt; staticFx(o, c, 1 - ease(W.friend - 0.3, W.friend + 0.2, t), Math.floor(L.q15(lt) * 15)); radioWave(o, c, ease(W.friend - 0.3, W.friend, t), t); },
      update(lt, t) {
        st12({}); crate.visible = true; RAD.set({ ledOn: t > W.friend - 0.3, freq: 0.3 });
        const h = crankPose(lt, [[-99, 'open', mouthAt(t, 'neutral')], [W.friend - 0.2, 'happy', mouthAt(t, 'smile')]]); placeCrankRadio(h);
        look(c, cr([[0, -3.95, 1.35, 3.95], [3, -3.87, 1.33, 3.85]], lt), V(-2.85, 1.2, 2.85)); ch.lookAt(c, 1, 40);
      } };
  }
  // ---------- 03 un solo auricular, el parlante apagado; maceta de hierba verde al lado ----------
  { const c = cam(48);
    out['03_earbud'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['03_earbud'] + lt; ch.root.updateMatrixWorld(true);
        tag(o, c, earbud.getWorldPosition(V()), 270, 140, '1 EARBUD', '#62f05a', ease(W.earbud - 0.05, W.earbud + 0.12, t));
        const k = ease(W.speaker - 0.05, W.speaker + 0.12, t); if (k > 0) { RAD.g.updateMatrixWorld(true); const p = RAD.g.localToWorld(V(-0.07, 0.0, 0.04)); tag(o, c, p, 270, 330, 'SPEAKER OFF', '#ff4030', k); const [sx, sy] = L.toScreen(c, p.x, p.y, p.z); o.tctx.globalAlpha = k; o.tctx.strokeStyle = '#ff4030'; o.tctx.lineWidth = 3; o.tctx.beginPath(); o.tctx.arc(sx, sy, 14, 0, 7); o.tctx.moveTo(sx - 10, sy - 10); o.tctx.lineTo(sx + 10, sy + 10); o.tctx.stroke(); o.tctx.globalAlpha = 1; }
        box2(o, 96, 150, ['NOISE', 'BRINGS THEM'], '#ff7b2e', ease(W.noise - 0.05, W.noise + 0.12, t), 1); },
      update(lt, t) {
        st12({ cableOn: true }); sitPose(lt, [[-99, 'half', mouthAt(t, 'neutral')], [W.noise, 'scared', mouthAt(t, 'neutral')]]);
        RAD.set({ ledOn: true }); look(c, cr([[0, -2.1, 1.05, 3.9], [3, -2.15, 1.02, 3.75]], lt), V(-2.6, 0.7, 2.45)); ch.lookAt(c, 0.8, 35); setCable(true);
      } };
  }
  // 03b primer plano: la otra oreja libre escucha la casa (ojos de reojo hacia el pasillo oscuro)
  { const c = cam(44);
    out['03b_ear'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['03b_ear'] + lt; ch.root.updateMatrixWorld(true);
        const el = ch.root.worldToLocal(earbud.getWorldPosition(V())); el.x *= -1; const ear = ch.root.localToWorld(el);
        tag(o, c, ear, 80, 330, 'OTHER EAR:', '#4fd6ff', ease(W.ear - 0.1, W.ear + 0.1, t)); box2(o, 80, 366, ['THE HOUSE'], '#4fd6ff', ease(W.house - 0.1, W.house + 0.1, t), 2); },
      update(lt, t) {
        st12({ cableOn: true }); sitPose(lt, [[-99, 'scared', 'neutral']]);
        RAD.set({ ledOn: true }); ch.root.updateMatrixWorld(true); const hp = earbud.getWorldPosition(V()).add(V(-0.08, 0, 0.02));
        look(c, cr([[0, hp.x - 0.4, hp.y + 0.02, hp.z + 0.95], [2.5, hp.x - 0.36, hp.y + 0.02, hp.z + 0.85]], lt), hp.clone().add(V(0.02, -0.12, 0))); setCable(true);
      } };
  }
  // ---------- 05 ahorrar pilas: escuchar en punto (reloj de pared llega a las 9:00) ----------
  const clockHands = (() => { const g = new THREE.Group(); scene.add(g); g.position.copy(clock.position).add(V(0, 0, 0.08)); g.scale.setScalar(1.45); const mH = L.basic(null, 0x101010);
    const h = new THREE.Group(), m = new THREE.Group(); g.add(h, m); L.box(0.012, 0.07, 0.006, mH, 0, 0.035, 0, h); L.box(0.008, 0.11, 0.006, mH, 0, 0.055, 0.004, m); return { g, set(hr, mn) { h.rotation.z = -((hr % 12) + mn / 60) / 12 * Math.PI * 2; m.rotation.z = -mn / 60 * Math.PI * 2; } }; })();
  { const c = cam(54);
    out['05_clock'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['05_clock'] + lt, cx = o.tctx;
        { const k = ease(W.batteries - 0.05, W.batteries + 0.12, t); if (k > 0) { cx.globalAlpha = k; cx.fillStyle = 'rgba(4,8,16,0.86)'; cx.fillRect(136, 48, 216, 54); px(cx, 144, 58, '#e8e8e8', 60, 34); px(cx, 147, 61, '#101418', 54, 28); px(cx, 204, 67, '#e8e8e8', 6, 16); for (let i = 0; i < 2; i++) px(cx, 150 + i * 13, 64, '#e2c62c', 11, 22); bitText(cx, 'SAVE', 278, 64, 2, '#e2c62c', { outline: '#000' }); bitText(cx, 'BATTERIES', 278, 86, 2, '#e2c62c', { outline: '#000' }); cx.globalAlpha = 1; } }
        tag(o, c, clock.position.clone().add(V(0, -0.05, 0.06)), 250, 222, 'TOP OF THE HOUR', '#ffd23f', ease(W.top - 0.05, W.top + 0.12, t));
        radioWave(o, c, ease(W.news - 0.5, W.news - 0.3, t), t); box2(o, 262, 480, ['NEWS ON'], '#62f05a', ease(W.news - 0.5, W.news - 0.35, t), 2); },
      update(lt, t) {
        st12({ cableOn: true }); sitPose(lt, [[-99, 'open', mouthAt(t, 'neutral')], [W.news, 'happy', mouthAt(t, 'smile')]]);
        const mn = t < W.top ? 59 : 0; clockHands.set(t < W.top ? 8 : 9, mn); RAD.set({ ledOn: t > W.news - 0.5 });
        look(c, cr([[0, -2.3, 1.0, 3.9], [3, -2.33, 1.0, 3.75]], lt), V(-2.6, 1.22, 1.3)); ch.lookAt(c, 0.7, 30); setCable(true);
      } };
  }
  // 05b la libreta (desde arriba): se escribe la hora y la frecuencia; arriba "itchy... tasty..." tachado
  { const c = cam(36);
    out['05b_log'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['05b_log'] + lt;
        NB.g.updateMatrixWorld(true); tag(o, c, NB.g.localToWorld(V(0.02, 0.02, 0.03)), 270, 520, 'TIME + FREQUENCY', '#ffd23f', ease(W.frequency - 0.1, W.frequency + 0.1, t)); },
      update(lt, t) { st12({}); drawLog(t); sitPose(lt, [[-99, 'open', 'neutral']]); NB.g.updateMatrixWorld(true);
        const p = NB.g.localToWorld(V(0, 0, 0)); look(c, cr([[0, p.x + 0.02, p.y + 0.62, p.z + 0.2], [2.5, p.x + 0.01, p.y + 0.55, p.z + 0.17]], lt), p.clone().add(V(0, 0, -0.01))); } };
  }
  // ---------- 06 lo que se repite: notas en la nevera con rayitas (cada una en su palabra), y la nota "master of unlocking" ----------
  { const c = cam(58);
    out['06_fridge'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['06_fridge'] + lt, cx = o.tctx;
        const k = ease(W.official - 0.1, W.official + 0.06, t); if (k > 0) { const sc = 1 + 0.6 * (1 - k); cx.save(); cx.translate(LW / 2, 486); cx.rotate(-0.08); cx.scale(sc, sc); cx.globalAlpha = k; cx.strokeStyle = '#ff4030'; cx.lineWidth = 3; cx.strokeRect(-108, -24, 216, 48); bitText(cx, 'REPEATS =', 0, -9, 2, '#ff4030', { outline: '#000' }); bitText(cx, 'OFFICIAL', 0, 11, 2, '#ff4030', { outline: '#000' }); cx.restore(); cx.globalAlpha = 1; } },
      update(lt, t) {
        st12({ kit: true }); for (const [k] of NOTES) fridgeNotes[k].visible = t >= W[k] - 0.05;
        AVA(FR.x - 0.78, FR.z + 1.0, 0.15); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.7 }), L.seg('point', W.shelters - T['06_fridge'] - 0.3, { fade: 0.2, speed: 0.8 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.official, 'wink', mouthAt(t, 'smile')]]);
        const pe = T['07_voice'] - T['06_fridge']; look(c, cr([[0, FR.x - 0.7, 1.5, FR.z + 3.75], [pe - 2.6, FR.x - 0.72, 1.47, FR.z + 3.5], [pe, FR.x - 0.62, 1.55, FR.z + 2.7]], lt), V(FR.x - 0.42, 1.2, FR.z + 0.5).lerp(V(FR.x - 0.45, 1.45, FZ + 0.4), ease(pe - 2.6, pe, lt))); ch.lookAt(c, 0.8, 35);
      } };
  }
  // ---------- 07 una voz que te invita no es un rescate ----------
  { const c = cam(46);
    out['07_voice'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['07_voice'] + lt; radioWave(o, c, 1, t, '#ff7b2e');
        box2(o, LW / 2, 150, ['AN INVITATION', 'IS NOT A RESCUE'], '#ff7b2e', ease(W.rescue - 0.1, W.rescue + 0.1, t), 2); box2(o, LW / 2, 214, ['ANYONE CAN SAY', '"THE ARMY"'], '#ff4030', ease(W.army - 0.25, W.army, t), 1); },
      update(lt, t) {
        st12({ cableOn: true }); sitPose(lt, [[-99, 'half', mouthAt(t, 'frown')], [W.rescue, 'angry', mouthAt(t, 'frown')]]); RAD.set({ ledOn: true, freq: 0.62 });
        look(c, cr([[0, -2.25, 1.1, 3.6], [3, -2.3, 1.08, 3.45]], lt), V(-2.55, 0.85, 2.45)); ch.lookAt(c, 0.8, 35); setCable(true);
      } };
  }
  // 07c escuchar es gratis, contestar te delata: la casa en corte desde afuera, ondas rojas saliendo, los zombis giran hacia la casa
  { const c = cam(50);
    out['07c_ping'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T['07c_ping'] + lt, cx = o.tctx;
        RAD.g.updateMatrixWorld(true); const p = RAD.g.getWorldPosition(V()), [sx, sy] = L.toScreen(c, p.x, p.y, p.z);
        cx.strokeStyle = '#ff4030'; cx.lineWidth = 2; for (let i = 0; i < 3; i++) { const r = ((L.q15(lt) * 70 + i * 40) % 120) + 6; cx.globalAlpha = 1 - r / 126; cx.beginPath(); cx.ellipse(sx, sy, r, r * 0.6, 0, 0, 7); cx.stroke(); } cx.globalAlpha = 1;
        px(cx, sx - 4, sy - 22, '#ff4030', 8, 8); cx.fillStyle = '#ff4030'; cx.beginPath(); cx.moveTo(sx - 4, sy - 14); cx.lineTo(sx + 4, sy - 14); cx.lineTo(sx, sy - 6); cx.fill();
        box2(o, LW / 2, 140, ['LISTEN = FREE'], '#62f05a', 1, 2); box2(o, LW / 2, 182, ['TALK = THEY', 'FIND YOU'], '#ff4030', ease(W.talking7 - 0.05, W.talking7 + 0.12, t), 2); },
      update(lt, t) {
        st12({}); ch.root.visible = true; sitPose(lt, [[-99, 'half', 'neutral']]); RAD.set({ ledOn: true });
        const u = ease(W.talking7, W.talking7 + 2.5, t);
        for (const [z, clip] of [[zA, 'walk'], [zB, 'Walking'], [zC, 'walk'], [zD, 'Walking']]) { z.w.visible = true; const [hx, hz] = z.home, ang = Math.atan2(SIT.x - hx, SIT.z - hz); z.w.position.set(hx + (SIT.x - hx) * 0.15 * u, 0, hz + (SIT.z - hz) * 0.15 * u); z.w.rotation.set(0, ang, 0); z.pose(clip, t); }
        look(c, cr([[0, -1.2, 6.2, 9.8], [3, -1.4, 5.8, 9.2]], lt), V(-2.4, 0.4, 2.6));
      } };
  }
  // ---------- 08 la radio habla: "Anyone out there?... police station... food." (Ava al fondo escucha) ----------
  { const c = cam(46);
    out['08_radio'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['08_radio'] + lt; radioWave(o, c, 1, t, '#9ad8ff'); staticFx(o, c, 0.6, Math.floor(L.q15(lt) * 15)); },
      /* 08: camara un poco mas alta para que la cara quede sobre la radio */
      update(lt, t) {
        st12({ cableOn: false }); sitPose(lt, [[-99, 'surprised', 'neutral'], [W.police, 'open', 'surprised']]); RAD.set({ ledOn: true, freq: 0.62, antZ: 1.45 });
        ch.root.updateMatrixWorld(true); twk(bonesA.Chest, 'x', Number(L.QS.get('lean') ?? 0.16) * ease(0.2, 2.2, lt)); twk(bonesA.Chest, 'z', 0.07 * Math.sin(ease(W.police - 0.4, W.food, t) * Math.PI));   // v2: se inclina hacia la radio y ladea al oir 'police station'
        look(c, cr([[0, RADP.x + 0.1, 0.72, RADP.z + 0.8], [3, RADP.x + 0.06, 0.7, RADP.z + 0.72]], lt), V(-2.6, 0.78, 2.4)); ch.lookAt(c, 0.6, 30);
      } };
  }
  // fix storyboard: el hombre pasa CERCA de la ventana alta W1 (1,3 x 1,95 m), mas grande (x1.12), recortado contra una luna grande;
  // camina, se detiene de cara a la casa medio segundo y sigue. Pasos: hatSteps() (lo usa el mix por cues.json? no: tiempos fijos en mix12.py).
  const HATX = Number(L.QS.get('hatx') ?? -7.2); HAT.g.scale.setScalar(1.0);
  const hatPath = (lt) => { const z0 = 0.0, zc = 1.3, z1 = 2.6; if (lt < 1.05) return [z0 + (zc - z0) * lt / 1.05, 0, true]; if (lt < 1.75) return [zc, Math.PI / 2 * ease(1.05, 1.3, lt) * (1 - ease(1.5, 1.75, lt)), false]; return [zc + (z1 - zc) * (lt - 1.75) / 1.4, 0, true]; };
  const moon = L.plane(3.4, 3.4, L.basic(L.cvs(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 8, 32, 32, 32); g.addColorStop(0, '#fffbe6'); g.addColorStop(0.5, '#f4eccc'); g.addColorStop(0.62, 'rgba(200,210,255,0.55)'); g.addColorStop(1, 'rgba(120,150,220,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); c.fillStyle = 'rgba(190,180,150,0.5)'; for (const [x, y, r] of [[26, 24, 4], [38, 34, 3], [30, 40, 2]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } }), 0xffffff, { transparent: true, depthWrite: false }), -15.5, Number(L.QS.get('moony') ?? 3.7), Number(L.QS.get('moonz') ?? -1.0), scene, Math.PI / 2);
  // ---------- 08b pasos pesados: la silueta del sombrero pasa por las ventanas; "Oh, fudge" ----------
  { const c = cam(70);
    out['08b_window'] = { scene, camera: c, overlay: vign(0.45), update(lt, t) {
        st12({ hat: true }); const T0 = T['08b_window'], [hz, hry, walking] = hatPath(lt);
        HAT.g.visible = false; moon.visible = false; outPlane.visible = true; GIANT.g.position.set(HATX - 0.2, 0, hz); GIANT.g.rotation.set(0, hry, 0); GIANT.walk(lt, walking ? 1 : 0.15);
        moonP.forEach(([p, zc]) => { p.material.opacity = Math.abs(hz - zc) < 0.6 ? 0.04 : 0.22; });
        sitPose(lt, [[-99, 'surprised', 'neutral'], [0.5, 'scared', 'neutral'], [W.fudge - T0, 'shocked', mouthAt(t, 'surprised')], [W.fudge + 0.9 - T0, 'scared', 'neutral']]);
        RAD.set({ ledOn: true, freq: 0.62 }); breathe(ch, t);
        const tf = W.fudge - T0; look(c, cr([[0, -0.9, 0.95, 3.9], [tf - 0.45, -0.98, 0.95, 3.75], [tf + 0.15, -1.95, 1.0, 3.15], [tf + 3, -2.0, 1.0, 3.05]], lt), V(-3.4, 1.15, 1.95).lerp(V(-2.62, 0.85, 2.2), ease(tf - 0.45, tf + 0.15, lt))); ch.lookAt(c, 0.5 + 0.4 * ease(tf - 0.45, tf, lt), 30);
        { c.updateMatrixWorld(); const R3 = window.__fx.renderer, prt = R3.getRenderTarget(); R3.setRenderTarget(OUT.rt); R3.render(OUT.scene, c); R3.setRenderTarget(prt); }
      } };
  }
  // ---------- 09 maquina de escribir: SAVE? (1 INK RIBBON) ----------
  { const c = cam(40);
    const typed = (t) => { const c2 = TWR.cv.getContext('2d'); c2.fillStyle = '#ece6d4'; c2.fillRect(0, 0, 96, 128); c2.fillStyle = '#1a1a1a'; c2.font = 'bold 13px "Courier New", monospace'; c2.textBaseline = 'top';
      const n = Math.max(0, Math.floor((t - T['09_save'] - 0.15) * 9)); c2.fillText('SAVE?'.slice(0, n), 18, 30); if (n > 5) { c2.font = 'bold 9px "Courier New", monospace'; c2.fillText('LIVING ROOM', 12, 52); } TWR.tex.needsUpdate = true; };
    out['09_save'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['09_save'] + lt, k = ease(0.75, 0.9, lt); if (k <= 0) return;
        const cx = o.tctx; cx.globalAlpha = k; cx.fillStyle = 'rgba(4,8,18,0.88)'; cx.fillRect(40, 470, 280, 70); cx.strokeStyle = '#8a90a8'; cx.strokeRect(40.5, 470.5, 279, 69);
        bitText(cx, 'WILL YOU SAVE YOUR GAME?', LW / 2, 488, 1, '#ececec', { outline: null }); bitText(cx, 'INK RIBBON x1', LW / 2, 506, 1, '#c8ccd8', { outline: null });
        const on = Math.floor(t * 4) % 2 === 0; bitText(cx, '> YES      NO', LW / 2, 525, 1, on ? '#ffe048' : '#c89a20', { outline: null }); cx.globalAlpha = 1; },
      update(lt, t) { st12({}); typed(t); ch.root.visible = false; lanL.position.set(-1.3, 1.1, 1.6);
        look(c, cr([[0, -0.55, 1.12, 2.0], [2, -0.6, 1.08, 1.9]], lt), V(-1.1, 0.8, 1.0)); } };
  }
  // ---------- 10 menu RE vivo (Ava respira, mirando la radio): ANSWER / STAY SILENT ----------
  const FIN = { ava: (L.QS.get('fava') ?? '-3.3,3.75').split(',').map(Number), yawOff: Number(L.QS.get('fyaw') ?? 0.35), ty: Number(L.QS.get('fty') ?? 1.7),
    cam0: (L.QS.get('fc0') ?? '-4.8,1.25,0.6').split(',').map(Number), cam1: (L.QS.get('fc1') ?? '-4.75,1.25,0.7').split(',').map(Number) };
  { const c = cam(Number(L.QS.get('ffov') ?? 64)), RED = '#ff5a4a', WHITE = '#f0f0f0';
    const left = (cx, s, x, y, sc, col, o2) => bitText(cx, s, x + textWidth(s, sc) / 2, y, sc, col, o2);
    const fit = (s, maxW, scs = [3, 2, 1]) => scs.find((sc) => textWidth(s, sc) <= maxW) ?? 1;
    out['10_choice'] = { scene, camera: c, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T['10_choice'] + lt; vign(0.5)(lt, dt, a, o); radioWave(o, c, 0.7, t, '#9ad8ff');
      const kp = L.clamp01(lt / 0.2), PX = 8, PW = 344, PY = 52, IN = 12;
      const q = 'WHAT DO YOU DO?', opts = [['1. ANSWER THEM', W.answer, RED], ['2. STAY SILENT', W.silent, WHITE]], X0 = PX + IN + 16, XR = PX + PW - IN;
      const qs = fit(q, PW - 2 * IN), osc = Math.min(...opts.map(([s]) => fit(s, XR - X0))), cs = fit('COMMENT 1 OR 2', PW - 2 * IN, [2, 1]), fs = fit('FOLLOW FOR MORE!', PW - 2 * IN, [2, 1]);
      const rows = [[PY + 16 + qs * 5, qs], [0, osc], [0, osc], [0, cs], [0, fs]]; let y = rows[0][0] + qs * 5 + 18; for (let i = 1; i < rows.length; i++) { rows[i][0] = y + rows[i][1] * 5; y = rows[i][0] + rows[i][1] * 5 + (i === 2 ? 22 : 14); }
      const PH = y - PY + 4;
      cx.globalAlpha = kp; cx.fillStyle = 'rgba(4,8,18,0.86)'; cx.fillRect(PX, PY, PW, PH);
      px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
      bitText(cx, q, LW / 2, rows[0][0], qs, '#ececec', { outline: '#000000' });
      const sel = t >= W.silent ? 1 : t >= W.answer ? 0 : -1;
      opts.forEach(([s, tw2, col], i) => { const yy = rows[1 + i][0]; left(cx, s, X0, yy, osc, i === sel ? col : '#8a8a8a', { outline: '#000000' });
        if (i === sel) { const on = Math.floor((t - tw2) * 4) % 2 === 0, x0 = PX + IN; for (let k = 0; k < 8; k++) px(cx, x0 + k, yy - 8 + k, on ? '#ffe048' : '#c89a20', 1, 17 - 2 * k); } });
      if (t >= W.comment) { const b = Math.round(2 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, rows[3][0] + b, cs, '#ffd23f', { outline: '#000000' }); }
      if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, rows[4][0], fs, '#ececec', { outline: '#000000' }); cx.globalAlpha = 1;
    }, update(lt, t) {
      // v2 (usuario): Ava de pie, cuerpo entero, mirando hacia la ventana W1 (fuera de cuadro a la izquierda, la luna entra por el piso); menu arriba
      st12({ cableOn: false }); untw(); unbreathe(ch); RAD.set({ ledOn: true, freq: 0.62, antZ: 1.45 });
      const AP = FIN.ava, yaw = Math.atan2(-5 - AP[0], 1.8 - AP[1]) + FIN.yawOff; AVA(AP[0], AP[1], yaw);
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.7 })], [[-99, 'scared', 'neutral']]);
      look(c, cr([[0, ...FIN.cam0], [7, ...FIN.cam1]], lt), V(AP[0], FIN.ty, AP[1])); ch.lookAt({ position: V(-5, 1.45, 1.8) }, 0.8, 40);
      moonP.forEach(([p2]) => { p2.material.opacity = 0.32; });
    } };
  }
  void ROOMLAB; void SOFA_BAR; void label3; void fore3; void hand3; void unbreathe; void handW; void DRILL_TIP0;
  return out;
}
