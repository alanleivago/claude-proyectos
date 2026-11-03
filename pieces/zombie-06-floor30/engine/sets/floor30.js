// sets/floor30.js — ep6 "Floor 30" (adapta el reel fuentes/zombie-nicho/ig-DeunEGHNj1F.md: apartamento 3012, piso 30).
// Un solo mundo: torre de 34 pisos en una ciudad de noche; el apartamento 3012 vive DENTRO de la torre (grupo apt a y = FY),
// con la ventana real en la fachada (la grua de la apertura llega a ella), living + cocina, bano con banera, pasillo con 3011.
// Props foto->lowpoly (objects/tools/build_ep6.py): bathtub bucket fridge dresser notebook can cans_stack phone plank.
// Vecino: city-zombie (CC0) con camiseta manchada. Camara: splines Catmull-Rom continuas (dollies, orbitas, whips). Prefijo F*.
import { reText as bitText, reWidth as textWidth } from '../refont.js';

export async function shots({ L, TL }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.02, 2600);
  const FY = 29 * 2.9;   // piso 30 (0-based 29)
  const A = (x, y, z) => V(x, y + FY, z);   // coordenadas del apartamento -> mundo
  const look = (c, p, t) => { c.up.set(0, 1, 0); c.position.copy(p); c.lookAt(t); c.updateProjectionMatrix(); };
  const lk = (c, p, t) => look(c, A(...p), A(...t));
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const cr = (keys, t) => {   // Catmull-Rom por tiempo: keys [[t, x, y, z], ...]
    if (t <= keys[0][0]) return V(keys[0][1], keys[0][2], keys[0][3]);
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const k = (j) => keys[Math.max(0, Math.min(keys.length - 1, j))], [a, b, c, d] = [k(i - 1), k(i), k(i + 1), k(i + 2)];
    const u = Math.min(1, (t - b[0]) / (c[0] - b[0])), u2 = u * u, u3 = u2 * u;
    const f = (j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3);
    return V(f(1), f(2), f(3));
  };
  const crA = (keys, t) => cr(keys, t).add(V(0, FY, 0));
  const vign = (k) => (lt, dt, a, o) => { const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LW * 0.36, LW / 2, LH * 0.5, LH * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH); };
  /** etiqueta de diagrama (cajita con borde de 1 px + linea fina al punto 3D) */
  const tag = (o, camera, p3, x, y, txt, col, k = 1, sc = 2) => {
    if (k <= 0) return; const c = o.tctx, [qx, qy] = L.toScreen(camera, p3.x, p3.y, p3.z), w = textWidth(txt, sc) + 12, h = 9 * sc + 6;
    c.globalAlpha = k; c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(qx + 0.5, qy + 0.5); c.lineTo(x + 0.5, y + 0.5); c.stroke();
    px(c, qx - 1, qy - 1, col, 3, 3);
    c.fillStyle = 'rgba(4,8,16,0.86)'; c.fillRect(x - w / 2, y - h / 2, w, h); c.strokeRect(x - w / 2 + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
    bitText(c, txt, x, y, sc, col, { outline: null }); c.globalAlpha = 1;
  };

  // ================= texturas pintadas =================
  const R = L.rng(606);
  const noiseTex = (w, h, base, amp, seed, extra) => L.cvs(w, h, (c) => { const r = L.rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (r() - 0.5) * amp; px(c, x, y, `rgb(${base[0] + n},${base[1] + n},${base[2] + n})`); } if (extra) extra(c, r); });
  const tWallp = noiseTex(32, 32, [150, 142, 120], 14, 1, (c, r) => {   // papel pintado sucio con rayas verticales finas (como el reel)
    for (let x = 0; x < 32; x += 8) { px(c, x, 0, 'rgba(110,96,70,0.5)', 1, 32); px(c, x + 4, 0, 'rgba(180,170,140,0.35)', 1, 32); }
    for (let k = 0; k < 8; k++) { c.fillStyle = `rgba(90,74,50,${0.12 + r() * 0.12})`; c.beginPath(); c.ellipse(r() * 32, r() * 32, 2 + r() * 5, 3 + r() * 7, 0, 0, 7); c.fill(); } });
  const tFloor = L.cvs(32, 32, (c) => { const r = L.rng(2); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.6 + (y >> 3) * 2.1) + r() * 8; px(c, x, y, `rgb(${112 + n},${76 + n * 0.7},${48 + n * 0.5})`); } for (let y = 0; y < 32; y += 8) px(c, 0, y, '#3e2816', 32, 1); for (let y = 0; y < 32; y += 8) px(c, ((y / 8) % 2) * 16 + 7, y, '#3e2816', 1, 8); });
  const tCeil = noiseTex(16, 16, [168, 164, 152], 10, 3);
  const tTile = L.cvs(32, 32, (c) => { px(c, 0, 0, '#cfd6d2', 32, 32); for (let i = 0; i < 32; i += 8) { px(c, i, 0, '#8a948e', 1, 32); px(c, 0, i, '#8a948e', 32, 1); } c.fillStyle = 'rgba(90,80,50,0.25)'; for (let k = 0; k < 16; k++) c.fillRect(R() * 32, R() * 32, 1 + R() * 3, 1 + R() * 4); });
  const tCarpet = noiseTex(32, 32, [96, 40, 36], 16, 4, (c) => { for (let y = 0; y < 32; y += 4) px(c, 0, y, 'rgba(60,20,18,0.5)', 32, 1); });   // moqueta del pasillo
  const tHallW = noiseTex(32, 32, [120, 128, 112], 12, 5, (c) => { px(c, 0, 20, '#5a5040', 32, 1); px(c, 0, 21, '#8a7a60', 32, 2); });
  const tConc = noiseTex(32, 32, [70, 72, 78], 14, 6);
  const tAsph = noiseTex(32, 32, [34, 34, 38], 10, 7, (c) => { px(c, 0, 15, '#8a8458', 32, 1); });
  const tWood = L.cvs(32, 32, (c) => { const r = L.rng(8); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.8 + Math.sin(y * 0.4) * 2.5) + r() * 7; px(c, x, y, `rgb(${96 + n},${58 + n * 0.6},${32 + n * 0.4})`); } });
  const tFabric = noiseTex(16, 16, [70, 84, 104], 14, 9, (c) => { for (let x = 0; x < 16; x += 3) px(c, x, 0, 'rgba(30,40,60,0.4)', 1, 16); });
  const tCounter = noiseTex(16, 16, [196, 190, 172], 10, 10, (c) => px(c, 0, 0, '#8a8270', 16, 1));
  const tCab = L.cvs(32, 32, (c) => { const r = L.rng(11); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 8; px(c, x, y, `rgb(${168 + n},${150 + n},${116 + n})`); } px(c, 15, 0, '#6a5a40', 1, 32); px(c, 0, 0, '#6a5a40', 32, 1); px(c, 0, 31, '#6a5a40', 32, 1); px(c, 11, 14, '#c8c8c0', 2, 5); px(c, 19, 14, '#c8c8c0', 2, 5); });

  // ventanas de la ciudad (una "bahia" de 3 m x 2,9 m = 8 x 8 px); lit = probabilidad de ventana encendida
  const WIN_LIT = ['#f2c878', '#e8b060', '#f6dca0', '#d8e0f0', '#ffd890'];
  const cityTex = (cols, rows, lit, seed, hole = null) => L.cvs(cols * 8, rows * 8, (c) => {
    const r = L.rng(seed); px(c, 0, 0, '#3a3c44', cols * 8, rows * 8);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * 8, y = j * 8, n = r() * 10; px(c, x, y, `rgb(${58 + n},${60 + n},${68 + n})`, 8, 8); px(c, x, y + 7, '#2a2c32', 8, 1);
      if (hole && hole[0] === i && hole[1] === j) { c.clearRect(x + 1, y + 1, 6, 5); continue; }
      const on = r() < lit; px(c, x + 1, y + 1, on ? WIN_LIT[Math.floor(r() * WIN_LIT.length)] : (r() < 0.5 ? '#141c30' : '#1c2438'), 6, 5);
      if (on && r() < 0.5) px(c, x + 1 + Math.floor(r() * 4), y + 1, 'rgba(60,40,30,0.5)', 2, 5);   // cortina
      px(c, x + 4, y + 1, 'rgba(20,20,24,0.6)', 1, 5);
    } });

  // ================= mundo =================
  const scene = new THREE.Scene(); const SKY = 0x0c1426; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(0x101a30, 160, 1500);
  const hemi = new THREE.HemisphereLight(0x8aa0d0, 0x2a2a34, 1.2); scene.add(hemi);
  // suelo y calles
  L.plane(5000, 5000, lam(L.rep(tAsph, 600, 600), 0x9a9aa0), 0, 0, 900, scene, 0, -Math.PI / 2);
  // la torre: fachada de 9 bahias x 34 pisos con el hueco de la ventana del 3012 (bahia 4, piso 29 desde abajo)
  const TW = 27, TH = 34 * 2.9, TD = 20;
  const facadeT = cityTex(9, 34, 0.42, 3012, [4, 33 - 29]);
  const facade = L.plane(TW, TH, L.basic(facadeT, 0xffffff, { alphaTest: 0.5 }), 0, TH / 2, 0, scene); facade.renderOrder = 1;
  const sideT = cityTex(7, 34, 0.38, 77);
  L.plane(TD, TH, L.basic(sideT), TW / 2, TH / 2, -TD / 2, scene, Math.PI / 2); L.plane(TD, TH, L.basic(sideT), -TW / 2, TH / 2, -TD / 2, scene, -Math.PI / 2);
  L.plane(TW, TD, lam(tConc), 0, TH, -TD / 2, scene, 0, -Math.PI / 2);
  B(TW + 1, 4.2, 1.2, lam(tConc, 0x8a8a90), 0, 2.1, 0.6, scene);                       // zocalo de la entrada
  B(6, 0.3, 2.4, lam(null, 0x2a2a30), 0, 3.6, 1.2, scene);                            // marquesina
  const lobby = L.plane(5, 3, L.basic(null, 0xf0d8a0), 0, 1.5, 1.21, scene);          // portal iluminado
  // ciudad: bloques de edificios (los "blocks" que se apagan en 05). Cada bloque = grupo de edificios con su material
  const blocks = [];
  { const r = L.rng(99), tex = [0, 1, 2, 3].map((k) => cityTex(6, 40, 0.45, 300 + k));
    const spots = [];
    for (let gx = -22; gx <= 22; gx++) for (let gz = -3; gz <= 40; gz++) {
      if (Math.abs(gx) > 8 + gz * 0.9) continue;   // abanico delante de la ventana hasta el horizonte
      const x = gx * 34 + (r() - 0.5) * 8, z = gz * 34 + (r() - 0.5) * 8;
      if (Math.abs(x) < 26 && z > -32 && z < 22) continue;   // la torre y su plaza
      spots.push([x, z]);
    }
    const NB = 7;
    for (let b = 0; b < NB; b++) blocks.push({ g: new THREE.Group(), mats: [], lamps: [] });
    for (const [x, z] of spots) {
      const ang = Math.atan2(x, Math.max(1, z + 60)), b = Math.max(0, Math.min(NB - 1, Math.floor((ang + 1.0) / 2.0 * NB)));   // de izquierda a derecha vistos desde la ventana
      const w = 10 + r() * 14, d = 10 + r() * 14, h = 12 + r() * r() * (z > 400 ? 190 : z > 120 ? 140 : 70);
      const t = L.rep(tex[Math.floor(r() * 4)], w / 18, h / 116); const m = L.basic(t);
      const bx = B(w, h, d, m, x, h / 2, z, blocks[b].g); blocks[b].mats.push(m); void bx;
    }
    // farolas: filas de luces sobre las calles
    const bl = blocks.map(() => L.basic(null, 0xffd890)); blocks.forEach((b, i) => b.lamps.push(bl[i]));
    for (let gx = -22; gx <= 22; gx++) for (let gz = -3; gz <= 40; gz++) {
      if (Math.abs(gx) > 8 + gz * 0.9) continue;
      const x = gx * 34 + 17, z = gz * 34 + 17; if (Math.abs(x) < 20 && z > -30 && z < 20) continue;
      const ang = Math.atan2(x, Math.max(1, z + 60)), b = Math.max(0, Math.min(NB - 1, Math.floor((ang + 1.0) / 2.0 * NB)));
      B(1.2, 0.6, 1.2, bl[b], x, 6, z, blocks[b].g);
    }
    blocks.forEach((b) => scene.add(b.g));
  }
  const setBlocks = (k) => blocks.forEach((b, i) => { const off = k > i + 0.5 ? 1 : 0; for (const m of b.mats) m.color.setScalar(off ? 0.05 : 1); for (const m of b.lamps) m.color.set(off ? 0x141414 : 0xffd890); });
  // luna
  L.mesh(new THREE.CircleGeometry(9, 12), L.basic(null, 0xe8ecf4, { fog: false }), -60, 210, 400, scene).lookAt(0, 90, 0);

  // ================= el apartamento 3012 (local: suelo y = 0, fachada z = 0, interior z < 0) =================
  const apt = new THREE.Group(); apt.position.y = FY; scene.add(apt);
  const HH = 2.6, XL = -3.2, XR = 3.2, ZB = -5.0, XB = -5.7;
  const mWall = lam(L.rep(tWallp, 3, 1.3)), mTrim = lam(null, 0x4a3420);
  const wall = (x0, z0, x1, z1, y0 = 0, y1 = HH, m = mWall, g = apt) => { const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.01) return; const w = B(0.1, y1 - y0, len, m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, g); w.rotation.y = Math.atan2(x1 - x0, z1 - z0); if (y0 === 0) { const s = B(0.13, 0.1, len, mTrim, (x0 + x1) / 2, 0.05, (z0 + z1) / 2, g); s.rotation.y = w.rotation.y; } };
  L.plane(XR - XL, -ZB, lam(L.rep(tFloor, 5, 4)), 0, 0.002, ZB / 2, apt, 0, -Math.PI / 2);
  L.plane(XR - XL, -ZB, lam(L.rep(tCeil, 4, 4)), 0, HH, ZB / 2, apt, 0, Math.PI / 2);
  // pared de la ventana (z = -0.12) con el hueco x [-1, 1], y [0.8, 2.2]
  wall(XL, -0.12, -1.0, -0.12); wall(1.0, -0.12, XR, -0.12); wall(-1.0, -0.12, 1.0, -0.12, 0, 0.8); wall(-1.0, -0.12, 1.0, -0.12, 2.2, HH);
  const mFrame = lam(null, 0xd8d8d0);
  for (const x of [-1.0, 1.0]) B(0.06, 1.4, 0.12, mFrame, x, 1.5, -0.08, apt);
  for (const y of [0.8, 2.2]) B(2.06, 0.06, 0.14, mFrame, 0, y, -0.08, apt);
  B(2.1, 0.04, 0.24, mFrame, 0, 0.8, -0.2, apt);                                             // repisa
  const glass = L.plane(2.0, 1.4, L.basic(null, 0x9ab8e0, { transparent: true, opacity: 0.1, depthWrite: false }), 0, 1.5, -0.04, apt); void glass;
  wall(XL, -0.12, XL, -2.1); wall(XL, -3.1, XL, ZB); wall(XL, -2.1, XL, -3.1, 2.1, HH);    // izquierda con la puerta del bano (z [-3.1,-2.1])
  wall(XR, -0.12, XR, ZB);                                                                    // derecha (cocina)
  wall(XL, ZB, -2.27, ZB); wall(-1.33, ZB, XR, ZB); wall(-2.27, ZB, -1.33, ZB, 2.08, HH);   // fondo con la puerta 3012 (x [-2.27,-1.33])
  // cortinas
  const tCurt = noiseTex(16, 32, [150, 120, 90], 12, 12, (c) => { for (let x = 0; x < 16; x += 4) px(c, x, 0, 'rgba(70,50,30,0.5)', 1, 32); });
  for (const s of [-1, 1]) B(0.45, 1.9, 0.05, lam(tCurt), s * 1.25, 1.45, -0.22, apt);
  // living: sofa, mesa baja, alfombra, lampara de pie, estante, tele vieja
  const mFab = lam(tFabric), mWd = lam(tWood);
  const sofa = new THREE.Group(); apt.add(sofa); sofa.position.set(0.5, 0, -3.9);
  B(2.0, 0.42, 0.85, mFab, 0, 0.21, 0, sofa); B(2.0, 0.5, 0.2, mFab, 0, 0.62, -0.33, sofa); for (const s of [-1, 1]) B(0.2, 0.62, 0.85, mFab, s * 1.0, 0.31, 0, sofa);
  for (const s of [-0.48, 0.48]) B(0.9, 0.12, 0.62, lam(tFabric, 0xb8c0d0), s, 0.48, 0.06, sofa);
  const table = new THREE.Group(); apt.add(table); table.position.set(0.5, 0, -2.6);
  B(1.1, 0.05, 0.6, mWd, 0, 0.42, 0, table); for (const [x, z] of [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]]) B(0.05, 0.4, 0.05, mWd, x, 0.2, z, table);
  L.plane(2.4, 1.7, lam(noiseTex(16, 16, [120, 46, 40], 18, 13, (c) => { px(c, 1, 1, '#c8a060', 14, 1); px(c, 1, 14, '#c8a060', 14, 1); px(c, 1, 1, '#c8a060', 1, 14); px(c, 14, 1, '#c8a060', 1, 14); })), 0.5, 0.006, -2.9, apt, 0, -Math.PI / 2);
  const shelf = new THREE.Group(); apt.add(shelf); shelf.position.set(-2.95, 0, -1.2); shelf.rotation.y = Math.PI / 2;
  B(1.0, 1.8, 0.35, mWd, 0, 0.9, 0, shelf); for (let i = 0; i < 4; i++) for (let k = 0; k < 7; k++) B(0.06, 0.24 + R() * 0.06, 0.22, lam(null, [0x8a2a20, 0x2a4a7a, 0xc8a050, 0x3a6a3a][(i + k) % 4]), -0.36 + k * 0.11, 0.3 + i * 0.42, 0.05, shelf);
  const lampP = new THREE.Group(); apt.add(lampP); lampP.position.set(2.0, 0, -4.5);
  B(0.04, 1.5, 0.04, lam(null, 0x2a2a2a), 0, 0.75, 0, lampP); const shade = L.mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.3, 8), L.basic(null, 0xf0dca8), 0, 1.6, 0, lampP); void shade;
  // cocina (pared derecha): encimera, fregadero con grifo, armarios, nevera, reloj de pared a pilas
  const mCt = lam(tCounter), mCab = lam(L.rep(tCab, 2, 1));
  B(0.62, 0.86, 2.2, mCab, XR - 0.31, 0.43, -2.0, apt); B(0.66, 0.05, 2.24, mCt, XR - 0.33, 0.885, -2.0, apt);
  B(0.36, 0.7, 2.2, mCab, XR - 0.18, 1.85, -2.0, apt);                                     // armarios altos
  B(0.42, 0.02, 0.5, lam(null, 0x6a6e72), XR - 0.33, 0.9, -1.6, apt);                       // pileta
  const tapG = new THREE.Group(); apt.add(tapG); tapG.position.set(XR - 0.08, 0.91, -1.6);
  const chrome = lam(null, 0xc8ccd0); B(0.04, 0.26, 0.04, chrome, 0, 0.13, 0, tapG); B(0.24, 0.035, 0.035, chrome, -0.12, 0.26, 0, tapG); B(0.03, 0.05, 0.03, chrome, -0.235, 0.235, 0, tapG);
  const tapHandle = new THREE.Group(); tapHandle.position.set(0, 0.2, 0.06); tapG.add(tapHandle); B(0.03, 0.03, 0.12, lam(null, 0xe0e4e8), 0, 0, 0.05, tapHandle);
  const drip = L.mesh(new THREE.SphereGeometry(0.012, 5, 4), L.basic(null, 0x9cd4ff), -0.235, 0.2, 0, tapG); drip.visible = false;
  const fridge = await prop('fridge'); fridge.position.set(XR - 0.4, 0, -3.65); fridge.rotation.y = -Math.PI / 2; apt.add(fridge);
  // reloj de pared a pilas (codigo): esfera crema, numeros, agujas
  const clockCv = document.createElement('canvas'); clockCv.width = 48; clockCv.height = 48; const clockTex = L.canvasTex(clockCv);
  const drawClock = (hh, mm) => { const c = clockCv.getContext('2d'); c.clearRect(0, 0, 48, 48); c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(24, 24, 23, 0, 7); c.fill(); c.fillStyle = '#f0ead8'; c.beginPath(); c.arc(24, 24, 20, 0, 7); c.fill();
    c.fillStyle = '#2a2a2a'; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; c.fillRect(24 + Math.sin(a) * 17 - 1, 24 - Math.cos(a) * 17 - 1, 2, 2); }
    const ah = ((hh % 12) + mm / 60) / 12 * 6.283, am = mm / 60 * 6.283; c.strokeStyle = '#1a1a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(24, 24); c.lineTo(24 + Math.sin(ah) * 10, 24 - Math.cos(ah) * 10); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(24, 24); c.lineTo(24 + Math.sin(am) * 15, 24 - Math.cos(am) * 15); c.stroke(); c.fillStyle = '#c02020'; c.fillRect(23, 23, 2, 2); clockTex.needsUpdate = true; };
  drawClock(7, 5);
  const clockM = L.mesh(new THREE.CircleGeometry(0.17, 14), L.basic(clockTex, 0xffffff, { transparent: true }), XR - 0.06, 2.1, -3.5, apt); clockM.rotation.y = -Math.PI / 2;
  // luces del apartamento
  const aLights = [];
  const addL = (x, y, z, i, col = 0xffe2b0, d = 7) => { const p = new THREE.PointLight(col, i, d, 1.3); p.position.set(x, y, z); p.userData.i = i; apt.add(p); aLights.push(p); return p; };
  addL(0.4, 2.3, -2.4, 6.5); addL(2.4, 2.3, -2.2, 4.5); addL(2.0, 1.55, -4.3, 2.4); addL(-1.6, 2.3, -4.2, 3.0);
  const bulbs = []; for (const [x, z] of [[0.4, -2.4], [2.4, -2.2]]) { const b = L.mesh(new THREE.SphereGeometry(0.12, 6, 4), L.basic(null, 0xfff0d0), x, HH - 0.14, z, apt); bulbs.push(b); B(0.2, 0.03, 0.2, lam(null, 0x8a8478), x, HH - 0.015, z, apt); }
  const moonL = new THREE.PointLight(0x7a96d8, 0, 12, 0.8); moonL.position.set(0, 1.9, -0.6); apt.add(moonL);
  const lampShade = shade;
  // la puerta 3012 (codigo: hoja con cuarterones, mirilla, cerrojo, placa 3012 por fuera)
  const tDoor = L.cvs(32, 64, (c) => { const r = L.rng(14); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 8 + 6 * Math.sin(y * 0.5); px(c, x, y, `rgb(${118 + n},${78 + n * 0.6},${46 + n * 0.4})`); }
    for (const [x, y, w, h] of [[4, 4, 24, 24], [4, 34, 24, 26]]) { px(c, x, y, '#5a3a20', w, 1); px(c, x, y, '#5a3a20', 1, h); px(c, x, y + h - 1, '#c89a68', w, 1); px(c, x + w - 1, y, '#c89a68', 1, h); } });
  const mkDoor = (num) => { const g = new THREE.Group(); const md = lam(tDoor); B(0.9, 2.05, 0.05, md, 0.45, 1.025, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), lam(null, 0xd8b860), 0.8, 1.0, 0, g).rotation.x = Math.PI / 2;
    L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), lam(null, 0x101010), 0.45, 1.58, 0, g).rotation.x = Math.PI / 2;   // mirilla
    B(0.08, 0.05, 0.07, lam(null, 0xb8a050), 0.8, 1.18, 0, g);                              // cerrojo
    if (num) { const t = L.cvs(64, 22, (c) => { px(c, 0, 0, '#c8a850', 64, 22); px(c, 2, 2, '#1e180c', 60, 18); c.fillStyle = '#f0dc90'; c.font = 'bold 17px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(num, 32, 12); });
      L.plane(0.2, 0.075, L.basic(t), 0.45, 1.78, -0.03, g, Math.PI); }
    const frame = lam(null, 0x3a2614); B(0.06, 2.1, 0.14, frame, -0.03, 1.05, 0, g); B(0.06, 2.1, 0.14, frame, 0.93, 1.05, 0, g); B(1.02, 0.06, 0.14, frame, 0.45, 2.1, 0, g);
    return g; };
  const door3012 = mkDoor('3012'); door3012.position.set(-2.25, 0, ZB); apt.add(door3012);
  // rendija de luz bajo la puerta (dentro): tira con la sombra de los pies que pasan
  const gapCv = document.createElement('canvas'); gapCv.width = 32; gapCv.height = 2; const gapTex = L.canvasTex(gapCv);
  const gap = L.plane(0.86, 0.025, L.basic(gapTex), -1.8, 0.0125, ZB + 0.035, apt); void gap;
  const drawGap = (on, feet) => { const c = gapCv.getContext('2d'); px(c, 0, 0, on ? '#f2d8a0' : '#2a2418', 32, 2); for (const f of feet) px(c, Math.round(f * 32) - 3, 0, '#0a0806', 6, 2); gapTex.needsUpdate = true; };
  drawGap(true, []);
  // tablones de la barricada (foto -> loft), clavados en diagonal sobre la parte alta de la puerta
  const plankG = await prop('plank'); const planks = [];
  for (const [y, rz] of [[1.35, 0.18], [1.75, -0.16]]) { const p = plankG.clone(); p.position.set(-1.8, y, ZB + 0.06); p.rotation.z = rz; apt.add(p); planks.push(p); }
  const dresser = await prop('dresser'); apt.add(dresser);
  // pasillo (detras de la puerta, z [-6.6, -5.0])
  const hall = new THREE.Group(); apt.add(hall); const HZ = -6.6;
  L.plane(16, 1.6, lam(L.rep(tCarpet, 12, 1.5)), -1, 0.003, (ZB + HZ) / 2, hall, 0, -Math.PI / 2);
  L.plane(16, 1.6, lam(L.rep(tCeil, 8, 1)), -1, 2.5, (ZB + HZ) / 2, hall, 0, Math.PI / 2);
  const mHW = lam(L.rep(tHallW, 6, 1.2));
  B(16, 2.5, 0.1, mHW, -1, 1.25, HZ - 0.05, hall); B(6.5, 2.5, 0.1, mHW, -5.55, 1.25, ZB - 0.07, hall); B(7.9, 2.5, 0.1, mHW, 2.6, 1.25, ZB - 0.07, hall); B(1.1, 0.45, 0.1, mHW, -1.8, 2.3, ZB - 0.07, hall);
  const door3011 = mkDoor('3011'); door3011.position.set(-0.3, 0, HZ + 0.02); door3011.rotation.y = Math.PI; door3011.position.x += 0.9; hall.add(door3011);
  const door3010 = mkDoor('3010'); door3010.position.set(-5.4, 0, ZB - 0.08); hall.add(door3010);
  const door3013 = mkDoor('3013'); door3013.position.set(3.4, 0, ZB - 0.08); hall.add(door3013);
  const hallL = new THREE.PointLight(0xffe0b0, 3.2, 4.2, 1.6); hallL.position.set(-1.8, 2.3, -5.8); hall.add(hallL);
  const hallL2 = new THREE.PointLight(0xffe0b0, 2.0, 5, 1.5); hallL2.position.set(3.0, 2.3, -5.8); hall.add(hallL2);
  for (const [x, l] of [[-1.8, 1], [3.0, 1]]) { void l; L.mesh(new THREE.BoxGeometry(0.4, 0.05, 0.25), L.basic(null, 0xfff0d0), x, 2.47, -5.8, hall); }
  const exitS = L.plane(0.36, 0.14, L.basic(L.cvs(24, 10, (c) => { px(c, 0, 0, '#0a2a10', 24, 10); c.fillStyle = '#40ff60'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.fillText('EXIT', 12, 8); })), -7.0, 2.25, -5.8, hall, Math.PI / 2); void exitS;
  // bano (x [-5.7, -3.2], z [-4.4, -1.0])
  const bath = new THREE.Group(); apt.add(bath);
  const mTileW = lam(L.rep(tTile, 4, 3));
  for (const [x0, z0, x1, z1] of [[XB, -1.0, XB, -4.4], [XB, -4.4, XL - 0.06, -4.4], [XB, -1.0, XL - 0.06, -1.0]]) wall(x0, z0, x1, z1, 0, HH, mTileW, bath);
  L.plane(2.5, 3.4, lam(L.rep(tTile, 6, 8), 0xb8c0c8), (XB + XL) / 2, 0.004, -2.7, bath, 0, -Math.PI / 2);
  L.plane(2.5, 3.4, lam(tCeil), (XB + XL) / 2, HH, -2.7, bath, 0, Math.PI / 2);
  const tub = await prop('bathtub'); tub.position.set(XB + 0.4, 0, -2.7); tub.rotation.y = Math.PI / 2; bath.add(tub);
  const bucket = await prop('bucket'); bucket.position.set(-4.62, 0, -2.75); bucket.rotation.y = 0.3; bath.add(bucket);
  const bathL = new THREE.PointLight(0xf0f4ff, 5.5, 6, 1.3); bathL.position.set(-4.5, 2.3, -2.6); bath.add(bathL); aLights.push(bathL); bathL.userData.i = 5.5;
  L.mesh(new THREE.BoxGeometry(0.5, 0.04, 0.3), L.basic(null, 0xf4f8ff), -4.5, HH - 0.03, -2.6, bath);
  // grifo de pared sobre el balde (codigo) y el espejo + lavabo
  const spig = new THREE.Group(); spig.position.set(-4.05, 0.62, -4.36); bath.add(spig);
  B(0.04, 0.04, 0.16, chrome, 0, 0, 0.08, spig); B(0.035, 0.06, 0.035, chrome, 0, -0.03, 0.16, spig); B(0.1, 0.02, 0.02, lam(null, 0xe8e8ec), 0, 0.05, 0.05, spig);
  B(0.5, 0.15, 0.4, lam(null, 0xeceae2), -4.6, 0.8, -4.18, bath); B(0.6, 0.7, 0.02, L.basic(null, 0x7a8a98), -4.6, 1.55, -4.38, bath);
  // agua: plano en la banera (piso 0.12 -> 0.46), chorro del cano, agua del balde, chorro del grifo de pared
  const mWater = L.basic(null, 0x6aa8e0, { transparent: true, opacity: 0.78, depthWrite: false });
  const tubW = L.plane(1.18, 0.52, mWater, 0.04, 0.13, 0.01, tub, 0, -Math.PI / 2); tubW.scale.set(1, 1, 1);
  const spoutP = V(-0.545, 0.605, 0); const stream = L.box(0.025, 1, 0.025, L.basic(null, 0x9cd0ff, { transparent: true, opacity: 0.85 }), 0, 0, 0, tub);
  const bucketW = L.mesh(new THREE.CircleGeometry(0.135, 10), mWater, 0, 0.06, 0, bucket); bucketW.rotation.x = -Math.PI / 2;
  const stream2 = L.box(0.02, 1, 0.02, L.basic(null, 0x9cd0ff, { transparent: true, opacity: 0.85 }), 0, 0, 0, bath);
  const setWater = (k, kb, run) => {   // k: 0..1 llenado de la banera; kb: del balde; run: chorros
    const y = 0.13 + 0.33 * k; tubW.position.y = y;
    stream.visible = run; if (run) { stream.scale.y = Math.max(0.02, spoutP.y - 0.04 - y); stream.position.set(spoutP.x + 0.015, (spoutP.y - 0.04 + y) / 2, 0); }
    const yb = 0.05 + 0.27 * kb; bucketW.position.y = yb; bucketW.visible = kb > 0.02;
    stream2.visible = false; spig.visible = false; if (false) { const top = 0.58, bot = yb; stream2.scale.y = top - bot; stream2.position.set(-4.05, (top + bot) / 2, -4.1); }
  };
  // mesa del cuaderno (en la mesa baja): cuaderno abierto + telefono + latas
  const nb = await prop('notebook'); nb.position.set(0.42, 0.445, -2.6); apt.add(nb);
  const pageCv = { L: document.createElement('canvas'), R: document.createElement('canvas') }; const pageTex = {};
  for (const s of ['L', 'R']) { pageCv[s].width = 112; pageCv[s].height = 152; pageTex[s] = L.canvasTex(pageCv[s]); pageTex[s].flipY = false; }
  nb.traverse((o) => { if (!o.isMesh) return; if (o.name === 'page_L' || o.parent?.name === 'page_L') o.material = L.lam(pageTex.L); if (o.name === 'page_R' || o.parent?.name === 'page_R') o.material = L.lam(pageTex.R); });
  const HAND = '"Segoe Print", "Comic Sans MS", cursive';
  const drawPages = (lines) => {   // lines: [[side, text, y, size, color, k(0..1 letras escritas)], ...]
    for (const s of ['L', 'R']) { const c = pageCv[s].getContext('2d'); px(c, 0, 0, '#ece8dc', 112, 152); for (let y = 18; y < 152; y += 10) px(c, 0, y, '#a8c0d8', 112, 1); px(c, s === 'L' ? 14 : 8, 0, '#e09090', 1, 152); }
    for (const [s, txt, y, size, col, k] of lines) { if (k <= 0) continue; const c = pageCv[s].getContext('2d'); c.font = `bold ${size}px ${HAND}`; c.fillStyle = col; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillText(txt.slice(0, Math.ceil(txt.length * Math.min(1, k))), s === 'L' ? 18 : 12, y); }
    pageTex.L.needsUpdate = pageTex.R.needsUpdate = true;
  };
  drawPages([]);
  const phone2 = await prop('phone'); phone2.position.set(0.88, 0.448, -2.5); phone2.rotation.set(-Math.PI / 2, 0, 0); apt.add(phone2);
  const ph2Cv = document.createElement('canvas'); ph2Cv.width = 36; ph2Cv.height = 72; const ph2Tex = L.canvasTex(ph2Cv); ph2Tex.flipY = false;
  phone2.traverse((o) => { if (o.isMesh && o.name === 'screen') o.material = L.basic(ph2Tex); });
  const drawPh2 = (pct, blink) => { const c = ph2Cv.getContext('2d'); px(c, 0, 0, '#06080e', 36, 72); c.fillStyle = '#e8e8e8'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('11:58', 18, 22);
    px(c, 8, 32, '#e0e0e0', 18, 10); px(c, 26, 35, '#e0e0e0', 2, 4); px(c, 9, 33, '#06080e', 16, 8); if (blink) px(c, 10, 34, '#ff3020', Math.max(1, Math.round(14 * pct / 100)), 6);
    c.fillStyle = '#ff4030'; c.font = 'bold 9px monospace'; c.fillText(`${pct}%`, 18, 56); ph2Tex.needsUpdate = true; };
  drawPh2(18, true);
  const cans = await prop('cans_stack'); cans.position.set(-0.05, 0.445, -2.45); cans.rotation.y = 0.4; cans.scale.setScalar(0.9); apt.add(cans);

  // ================= Ava =================
  const ch = L.hero(); apt.add(ch.root);
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

  // ================= el vecino del 3011 (city-zombie CC0, camiseta gris manchada) =================
  const cityG = await L.loadModel('models/city-zombie.glb');
  cityG.scene.traverse((o) => {   // el GLB no trae UVs utiles -> UVs planas (camiseta arriba, pantalon abajo), como hall.js
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  const shirtT = L.cvs(32, 64, (c) => { const r = L.rng(3011);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 12 - 6; px(c, x, y, `rgb(${150 + n},${148 + n},${140 + n})`); }   // pantalon (abajo en v)
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 10 - 5; px(c, x, y, `rgb(${46 + n},${52 + n},${70 + n})`); }
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 12 - 6; px(c, x, y, `rgb(${168 + n},${164 + n},${150 + n})`); }   // camiseta gris clara
    for (let k = 0; k < 9; k++) { c.fillStyle = r() < 0.6 ? 'rgba(110,14,10,0.85)' : 'rgba(80,60,30,0.6)'; c.beginPath(); c.ellipse(r() * 32, 34 + r() * 28, 1 + r() * 4, 1 + r() * 5, 0, 0, 7); c.fill(); } });
  shirtT.wrapS = THREE.RepeatWrapping;
  const skinT = L.rep(L.cvs(16, 16, (c) => { const r = L.rng(33); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 16 - 8; px(c, x, y, `rgb(${150 + n},${150 + n},${138 + n})`); } for (let k = 0; k < 5; k++) px(c, r() * 14 | 0, r() * 14 | 0, '#6a1210', 2, 1); }), 1, 1);
  const nb3011 = L.ps1Clone(cityG.scene); const nbMats = [];
  nb3011.traverse((o) => { if (!o.isMesh) return; const n = o.material.name || ''; o.material = n.includes('Outfit') ? L.lam(shirtT) : n.includes('Body') ? L.lam(skinT) : L.lam(null, 0x4a2a20); nbMats.push(o.material); });
  const nbW = new THREE.Group(); nbW.add(nb3011); hall.add(nbW);
  { nb3011.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(nb3011), k = 1.82 / (bb.max.y - bb.min.y); nb3011.scale.multiplyScalar(k); nb3011.position.y = -bb.min.y * k; }
  const nbMix = new THREE.AnimationMixer(nb3011); const nbIdle = nbMix.clipAction(THREE.AnimationClip.findByName(cityG.animations, 'Zombie_Idle')); nbIdle.play();
  let nbHip = null; nb3011.traverse((o) => { if (!nbHip && o.isSkinnedMesh) nbHip = o.skeleton.bones[0]; }); const nbHip0 = nbHip.position.clone();
  const poseNb = (t, vis) => { nbIdle.time = (t * 0.6) % nbIdle.getClip().duration; nbMix.update(0); nbHip.position.x = nbHip0.x; nbHip.position.z = nbHip0.z;
    const k = vis; nbMats.forEach((m) => m.color.setRGB(k, k, k)); nbW.visible = true; };
  nbW.visible = false;

  // ================= estado =================
  const state = ({ noPhone = false, lights = 1, moon = 0, hero = true, nb = false, hallLit = 1, dresserAt = 0, planks: pk = false, fridgeOn = true } = {}) => {
    aLights.forEach((p) => { p.intensity = p.userData.i * lights; }); bulbs.forEach((b) => { b.material.color.setScalar(0.1 + 0.9 * lights); }); lampShade.material.color.set(lights > 0.5 ? 0xf0dca8 : 0x5a5448);
    moonL.intensity = 6.0 * moon; hemi.intensity = 1.25 - 0.1 * moon; hemi.color.set(moon > 0.5 ? 0x8098d0 : 0x9aa8d0);
    ch.root.visible = hero; nbW.visible = nb; if (typeof ph1 !== 'undefined' && !noPhone) ph1.visible = false; hallL.intensity = 3.2 * hallLit; hallL2.intensity = 2.0 * hallLit;
    const z = L.lerp(-3.1, ZB + 0.27, dresserAt); dresser.position.set(-1.8, 0, z); dresser.rotation.y = 0;   // el frente mira al living (+Z)
    planks.forEach((p) => { p.visible = pk; });
    setWater(1, 1, false); drip.visible = false; void fridgeOn;
  };
  const out = {};
  const AVA = (x, z, yaw) => { ch.root.position.set(x, 0, z); ch.root.rotation.y = yaw; };

  // 01 grua: desde la calle sube por la fachada nocturna hasta la ventana del 3012, Ava dentro mirando la ciudad
  { const c = cam(55);
    out['01_crane'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({ lights: 1 }); setBlocks(0); AVA(0, -0.75, 0);
      ch.pose(lt, [L.seg('idle', -99, { loop: true })], [[-99, 'half', mouthAt(t, 'neutral')], [W.worst - 0.3, 'open', 'frown'], [W.tonight - 0.2, 'sad', 'frown']]);
      const up = ease(0.0, 3.6, lt);   // la grua (rapida al principio, frena al llegar)
      const cp = cr([[0, 3, 2.2, 30], [1.4, 1.5, 34, 22], [2.8, 0.6, 72, 11], [3.8, 0.3, FY + 1.5, 4.0], [6.2, 0.1, FY + 1.5, 1.5]], lt);
      const tg = cr([[0, 0, 26, 0], [1.4, 0, 52, 0], [2.8, 0, FY - 4, 0], [3.8, 0, FY + 1.35, -0.6], [6.2, 0, FY + 1.36, -0.75]], lt);
      look(c, cp, tg); void up;
      if (lt > 4.3) ch.lookAt(c, ease(4.3, 4.9, lt), 30);
    } };
  }
  // 02 POV en el pasillo frente al 3012 (llega a su puerta) -> el telefono sube DERECHO y nivelado: EMERGENCY ALERT
  const ph1 = await prop('phone'); scene.add(ph1); ph1.visible = false;
  let ph1Rect = null;
  const povCam = (t) => {   // camara POV continua (sirve a 02_door y 02_alert)
    const u = t - T.door, p = cr([[0, -3.4, 1.6, -5.85], [1.2, -2.3, 1.6, -5.9], [2.6, -1.85, 1.58, -5.95], [5, -1.8, 1.58, -5.98]], u);
    const tg = cr([[0, -1.2, 1.35, -5.0], [1.2, -1.7, 1.4, -5.0], [5, -1.8, 1.45, -5.0]], u);
    return [A(p.x, p.y, p.z), A(tg.x, tg.y, tg.z)];
  };
  const placePhone = (c, t) => {   // el telefono vive delante de la camara: sube en 0,35 s y queda derecho
    const k = ease(T.alert - 0.05, T.alert + 0.3, t); ph1.visible = k > 0;
    const fwd = V(); c.getWorldDirection(fwd); const right = V().crossVectors(fwd, V(0, 1, 0)).normalize(), upv = V().crossVectors(right, fwd).normalize();
    const pos = c.position.clone().add(fwd.clone().multiplyScalar(0.36)).add(upv.clone().multiplyScalar(0.04 - 0.3 * (1 - k)));
    ph1.position.copy(pos).add(upv.clone().multiplyScalar(-0.075)); ph1.quaternion.copy(c.quaternion);
    ph1.updateMatrixWorld(true);
    const corners = [V(-0.034, 0.003, 0.005), V(0.034, 0.147, 0.005)].map((v) => ph1.localToWorld(v.clone()));
    const a = L.toScreen(c, corners[0].x, corners[0].y, corners[0].z), b = L.toScreen(c, corners[1].x, corners[1].y, corners[1].z);
    ph1Rect = k > 0 ? [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])] : null;
  };
  const alertUI = (lt, t, o) => {   // pantalla del telefono (dibujada sobre el rectangulo proyectado: texto nitido)
    if (!ph1Rect) return; const c = o.tctx, [x, y, w, h] = ph1Rect;
    px(c, x, y, '#05070c', w, h); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#1a2448'); g.addColorStop(1, '#06080e'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = '#e8e8e8'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7:02', x + w / 2, y + h * 0.16);
    c.font = '9px monospace'; c.fillText('FRI, NOV 7', x + w / 2, y + h * 0.16 + 16);
    const on = t >= T.alert + 0.15; if (!on) return;
    const bx = x + 6, by = y + h * 0.3, bw = w - 12, bh = h * 0.44, fl = Math.floor((t - T.alert) * 3) % 2 === 0;
    c.fillStyle = 'rgba(236,236,240,0.96)'; c.fillRect(bx, by, bw, bh); c.fillStyle = fl ? '#e01818' : '#b01010'; c.fillRect(bx, by, bw, 22);
    bitText(c, 'EMERGENCY ALERT', bx + bw / 2, by + 11, 1, '#ffffff', { outline: null });
    const lines = ['STAY INSIDE.', 'LOCK YOUR', 'DOORS.']; lines.forEach((s, i) => bitText(c, s, bx + bw / 2, by + 40 + i * 22, 2, '#141414', { outline: null }));
    c.fillStyle = '#5a5a60'; c.font = '8px monospace'; c.fillText('City Emergency Mgmt', bx + bw / 2, by + bh - 10);
  };
  { const c = cam(52);
    const upd = (lt, t) => { state({ hero: false, noPhone: true }); const [p, tg] = povCam(t); look(c, p, tg); placePhone(c, t); };
    out['02_door'] = { scene, camera: c, overlay: vign(0.32), update: upd };
    out['02_alert'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.32)(lt, dt, a, o); alertUI(lt, T.alert + lt, o); }, update: upd };
  }
  // 03 agua: el bano; el cano llena la banera y el grifo de pared el balde. Dolly lento alrededor de Ava -> cenital oblicua en "forty"
  { const c = cam(54); const D = T.item - T.water;
    out['03_water'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T.water + lt;
      if (t > W.forty - 0.1) tag(o, c, A(XB + 0.4, 0.45, -2.7), 250, 150, '= 40 GAL', '#8cff5a', ease(W.forty - 0.1, W.forty + 0.1, t), 2);
      if (t > W.bucket - 0.3) tag(o, c, A(-4.62, 0.45, -2.75), 80, 250, '+5 GAL', '#ffb050', ease(W.bucket - 0.3, W.bucket - 0.1, t), 1);
      if (t > W.pumps && t < W.tub) tag(o, c, A(XB + 0.4, 0.62, -2.15), 96, 150, 'PUMPS = POWER', '#ffd23f', ease(W.pumps, W.pumps + 0.2, t) * (1 - ease(W.tub - 0.3, W.tub, t)), 1);
    }, update(lt, t) {
      state({}); const kt = ease(0.2, D - 0.6, lt), kb = 0.92; setWater(kt, kb, true);
      AVA(-4.55, -3.45, 0.6);
      ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('point', W.tub - T.water - 0.3, { fade: 0.25, speed: 0.8 }), L.seg('idle', W.pressure - T.water, { loop: true, fade: 0.3 })], [[-99, 'half', mouthAt(t, 'neutral')], [W.bucket - T.water, 'open', mouthAt(t, 'smile')]]);
      if (lt < D * 0.5) ch.lookAt(c, 0.8, 30);
      const cp = crA([[0, -3.55, 1.55, -1.35], [D * 0.45, -3.75, 1.65, -1.6], [D * 0.8, -4.2, 2.35, -1.6], [D, -4.6, 2.5, -1.75]], lt);
      const tg = crA([[0, -4.5, 0.95, -3.2], [D * 0.45, -4.7, 0.75, -3.1], [D, -5.2, 0.25, -2.8]], lt);
      look(c, cp, tg);
    } };
  }
  // 04 ITEM (RE): latas, galletas y agua; RATION 2/DIA -> 1/DIA; DAYS 6 -> 12 (contador que sube en "splits it into days")
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x05070e); s.add(new THREE.AmbientLight(0xffffff, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 2.0); dl.position.set(-1, 1.6, 2); s.add(dl);
    const c = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); c.position.set(0, 0, 500); c.lookAt(0, 0, 0);
    const P2 = (x, y) => [x - LW / 2, LH / 2 - y];
    const bevel = (cx, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(cx, x, y, f, w, h); px(cx, x, y, hi, w, 1); px(cx, x, y, hi, 1, h); px(cx, x, y + h - 1, lo, w, 1); px(cx, x + w - 1, y, lo, 1, h); };
    const slot = (cx, x, y, w, h) => { px(cx, x, y, '#0e2a1a', w, h); for (let yy = y + 3; yy < y + h - 2; yy += 3) px(cx, x + 2, yy, '#123a24', w - 4, 1); px(cx, x, y, '#58b07c', w, 1); px(cx, x, y, '#58b07c', 1, h); px(cx, x, y + h - 1, '#04100a', w, 1); px(cx, x + w - 1, y, '#04100a', 1, h); };
    const SL = [[30, 92, 140, 120], [190, 92, 140, 120], [30, 230, 140, 120], [190, 230, 140, 120]];
    const bg = L.cvs(LW, LH, (cx) => { const g = cx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH);
      cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1);
      bevel(cx, 14, 30, 332, 22); px(cx, 18, 34, '#04060e', 324, 14); bevel(cx, 20, 82, 320, 278); for (const [x, y, w, h] of SL) slot(cx, x, y, w, h); bevel(cx, 20, 456, 320, 118); });
    L.plane(LW, LH, L.basic(bg), 0, 0, -400, s);
    const icon = (g, x, y, sc, rx = 0.25) => { const w = new THREE.Group(); w.add(g); g.scale.multiplyScalar(sc); const [X, Y] = P2(x, y); w.position.set(X, Y, 0); w.rotation.x = rx; s.add(w); return w; };
    const iCans0 = 0; const iCans = icon(cans.clone(), 100, 200, 300); iCans.children[0].position.set(0, 0, 0); iCans.children[0].rotation.set(0, 0.4, 0);
    const crack = new THREE.Group(); { const t = L.cvs(32, 32, (cx) => { px(cx, 0, 0, '#d82020', 32, 32); px(cx, 2, 8, '#f0d070', 28, 14); cx.fillStyle = '#a01010'; cx.font = 'bold 8px monospace'; cx.textAlign = 'center'; cx.fillText('CRACK', 16, 18); });
      const m = L.lam(t), m2 = L.lam(null, 0xb01818); L.box(0.16, 0.22, 0.06, [m2, m2, m2, m2, m, m], 0, 0.11, 0, crack); const c2 = L.box(0.16, 0.22, 0.06, [m2, m2, m2, m2, m, m], 0.05, 0.1, -0.08, crack); c2.rotation.z = 0.2; }
    const iCr = icon(crack, 260, 200, 330);
    const iBk = icon(bucket.clone(), 100, 340, 240); iBk.children[0].position.set(0, 0, 0); iBk.children[0].rotation.set(0, 0.3, 0);
    const iTub = icon(tub.clone(), 260, 318, 82); iTub.children[0].position.set(0, 0, 0); iTub.children[0].rotation.set(0, -0.5, 0);
    const icons = [iCans, iCr, iBk, iTub]; const tW = W.counts - T.item;
    out['04_item'] = { scene: s, camera: c, update(lt) { const q = L.q15(lt); icons.forEach((g, i) => { const k = ease(0.1 + i * 0.12, 0.35 + i * 0.12, lt); g.scale.setScalar(Math.max(0.001, k)); g.rotation.y = 0.35 * Math.sin(q * 0.9 + i); }); void tW; },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T.item + lt;
        bitText(cx, 'ITEMS', 44, 41, 1, '#9cf09c', { outline: null }); bitText(cx, 'DAY 1  //  FLOOR 30', 250, 41, 1, '#c8ccd8', { outline: null });
        const lab = [['BEANS x12', 100, 98 + 106], ['CRACKERS x2', 260, 98 + 106], ['BUCKET 5 GAL', 100, 236 + 106], ['TUB 40 GAL', 260, 236 + 106]];
        lab.forEach(([s2, x, y], i) => { if (lt > 0.3 + i * 0.12) bitText(cx, s2, x, y, 1, i < 2 ? '#e8e8ec' : '#9cd4ff', { outline: '#000' }); });
        if (Math.floor(lt * 4) % 2 === 0 && lt > 0.3) { cx.strokeStyle = '#ffe048'; cx.lineWidth = 2; cx.strokeRect(29, 91, 142, 122); }
        // raciones: 2 por dia -> 1 por dia en "splits"; DAYS 6 -> 12 contando en "days"
        const kr = t >= W.splits; left(cx, 'RATION', 36, 480, 2, '#c8ccd8'); bitText(cx, kr ? '1 CAN/DAY' : '2 CANS/DAY', 250, 480, 2, kr ? '#8cff5a' : '#e8e8ec', { outline: '#000' });
        if (kr) { px(cx, 158, 468, '#ff4030', 0, 0); }
        left(cx, 'FOOD LASTS', 36, 520, 2, '#c8ccd8');
        if (!kr) bitText(cx, '6 DAYS', 262, 520, 3, '#ffd23f', { outline: '#021006' });
        else { bitText(cx, '6', 158, 520, 2, '#8a8070', { outline: null }); px(cx, 150, 519, '#ff4030', 16, 2); const sp = Math.min(1, (t - W.splits) * 6); bitText(cx, '12 DAYS', 262, 520 - Math.round(4 * (1 - sp)), 3, '#62f05a', { outline: '#021006' }); }
        if (t >= W.counts) { const k = Math.min(1, (t - W.counts) * 3); cx.globalAlpha = k; left(cx, 'EXAMINE', 24, 440, 1, '#9aa0b0'); cx.globalAlpha = 1; }
      } };
  }
  // 05a la ciudad se apaga por bloques (desde la ventana, por encima del hombro de Ava)
  { const c = cam(50); const d0 = W.dark - T.city, d1 = W.building - T.city;
    out['05_city'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({}); const k = ease(d0 - 0.2, d1 + 0.1, lt) * (blocks.length + 0.2); setBlocks(k);
      ch.root.visible = false;
      const cp = crA([[0, -0.85, 1.75, -1.75], [d1, -0.65, 1.68, -1.45]], lt); const tg = crA([[0, 0.3, 0.6, 6], [d1, 0.6, 0.2, 6]], lt);
      look(c, cp, tg);
    } };
  }
  // 05b el edificio: las luces del apartamento se apagan, la nevera muere (etiqueta), el reloj salta 7:05 PM -> 11:57 PM
  { const c = cam(56); const D = T.tap - T.fridge;
    out['05_fridge'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const t = T.fridge + lt;
      if (t > W.dies - 0.1) tag(o, c, A(XR - 0.8, 1.2, -3.65), 120, 170, 'FRIDGE: OFF', '#ff4030', ease(W.dies - 0.1, W.dies + 0.1, t), 1);
      const tj = D - 0.75, hhmm = lt < tj ? '7:05 PM' : '11:57 PM';
      const cl = o.tctx; px(cl, 226, 470, 'rgba(4,8,16,0.85)', 120, 26); cl.strokeStyle = '#8a90a8'; cl.strokeRect(226.5, 470.5, 119, 25); bitText(cl, hhmm, 286, 483, 2, lt < tj ? '#e8e8ec' : '#ff7b2e', { outline: null });
    }, update(lt, t) {
      const off = ease(0.15, 0.35, lt); state({ lights: 1 - off * 0.94, moon: off }); setBlocks(99);
      const tj = D - 0.75, sweep = ease(tj - 0.3, tj + 0.05, lt); const mins = 7 * 60 + 5 + sweep * (4 * 60 + 52); drawClock(Math.floor(mins / 60), mins % 60);
      AVA(2.0, -2.6, -0.9); ch.pose(lt, [L.seg('idle', -99, { loop: true })], [[-99, 'surprised', 'gasp'], [0.6, 'sad', 'frown']]);
      const cp = crA([[0, -0.7, 1.6, -0.5], [D, -0.4, 1.55, -0.8]], lt); look(c, cp, A(2.5, 1.2, -2.9)); ch.lookAt(c, 0.7, 30);
    } };
  }
  // 06 el grifo: Ava lo abre -> una gota y nada; diagrama: bomba en el sotano, el agua no sube 30 pisos sin luz
  { const c = cam(46); const D = T.note - T.tap;
    const diagram = (o, t) => { const k = ease(W.power - 0.2, W.power + 0.15, t); if (k <= 0) return; const cx = o.tctx; cx.globalAlpha = k;
      const x0 = 206, y0 = 96, w = 130, h = 226; px(cx, x0 - 8, y0 - 22, 'rgba(4,8,16,0.9)', w + 16, h + 52); cx.strokeStyle = '#8a90a8'; cx.strokeRect(x0 - 7.5, y0 - 21.5, w + 15, h + 51);
      bitText(cx, 'WATER UP', x0 + w / 2, y0 - 10, 1, '#9cd4ff', { outline: null });
      px(cx, x0 + 30, y0, '#3a3e4a', 60, h); for (let f = 0; f < 30; f++) px(cx, x0 + 30, y0 + h - (f + 1) * (h / 30), '#20232c', 60, 1);
      const lvl = Math.min(6, 6 * ease(W.power, W.power + 0.8, t)); px(cx, x0 + 55, y0 + h - lvl * (h / 30), '#4aa0f0', 10, lvl * (h / 30));
      px(cx, x0 + 30, y0 + 2, '#ffd23f', 60, 6); bitText(cx, '30', x0 + 104, y0 + 6, 1, '#ffd23f', { outline: null }); bitText(cx, '6', x0 + 104, y0 + h - 6 * (h / 30), 1, '#9cd4ff', { outline: null });
      px(cx, x0 + 46, y0 + h + 4, '#6a6e7a', 28, 12); bitText(cx, 'PUMP', x0 + 60, y0 + h + 22, 1, '#c8ccd8', { outline: null });
      if (t > W.thirty - 0.2) { const kk = ease(W.thirty - 0.2, W.thirty + 0.1, t); cx.globalAlpha = k * kk; cx.strokeStyle = '#ff4030'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(x0 + 40, y0 + h - 2); cx.lineTo(x0 + 80, y0 + h + 18); cx.moveTo(x0 + 80, y0 + h - 2); cx.lineTo(x0 + 40, y0 + h + 18); cx.stroke(); bitText(cx, 'NO POWER', x0 + 60, y0 + h + 36, 1, '#ff4030', { outline: null }); }
      cx.globalAlpha = 1; };
    out['06_tap'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.42)(lt, dt, a, o); const t = T.tap + lt;
      if (t > W.nothing - 0.05 && t < W.power) tag(o, c, A(XR - 0.32, 1.1, -1.6), 110, 150, 'NO PRESSURE', '#ff4030', ease(W.nothing - 0.05, W.nothing + 0.1, t), 1);
      diagram(o, t); }, update(lt, t) {
      state({ lights: 0.06, moon: 1 }); setBlocks(99);
      const tk = W.faucet - T.tap; tapHandle.rotation.y = -1.2 * ease(tk, tk + 0.4, lt);
      const dt0 = W.nothing - T.tap - 0.35, dk = (lt - dt0) / 0.5; drip.visible = dk > 0 && dk < 1; drip.position.y = 0.2 - 0.25 * Math.max(0, dk) ** 2;
      AVA(XR - 0.72, -1.6, Math.PI / 2);
      ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('turn_key', tk - 0.35, { fade: 0.2, speed: 0.8 }), L.seg('idle', tk + 1.4, { loop: true, fade: 0.3 })], [[-99, 'half', mouthAt(t, 'neutral')], [W.nothing - T.tap, 'sad', 'frown']]);
      const cp = crA([[0, 1.0, 1.85, -3.5], [W.nothing - T.tap, 1.2, 1.8, -3.3], [D, 1.25, 1.8, -3.25]], lt);
      look(c, cp, A(2.55, 1.15, -1.75));
    } };
  }
  // 07 el cuaderno (cenital que gira lento): 40 GAL / 1 GAL/DAY = 40 DAYS, y el telefono al 18 %
  { const c = cam(38); const D = T.barricade - T.note;
    out['07_note'] = { scene, camera: c, overlay: vign(0.38), update(lt, t) {
      state({ lights: 0.06, moon: 1, hero: false }); setBlocks(99);
      const w = (a, rate = 2.2) => (t - a) * rate;
      drawPages([['L', 'WATER', 30, 14, '#1a2a6a', w(W.fema - 0.1, 6)], ['L', 'tub  40 gal', 56, 14, '#1a2a6a', w(W.fema + 0.3, 4)], ['L', '÷ 1 gal/day', 82, 14, '#1a2a6a', w(W.gallon, 4)],
        ['L', '≈ 40 DAYS', 110, 15, '#b01818', w(W.forty7 - 0.1, 5)], ['R', 'FOOD', 30, 14, '#1a2a6a', w(W.fema - 0.1, 6)], ['R', '12 cans', 56, 14, '#1a2a6a', w(W.fema + 0.5, 4)],
        ['R', '1 / day', 82, 14, '#1a2a6a', w(W.gallon + 0.3, 4)], ['R', 'phone 18%', 118, 14, '#b01818', w(W.eighteen - 0.15, 5)]]);
      drawPh2(18, Math.floor(t * 2.5) % 2 === 0 || t < W.eighteen);
      const kp = ease(W.forty7 + 0.5, W.forty7 + 1.1, t), kf = ease(W.phone7 - 0.3, W.phone7 + 0.3, t);   // pagina izquierda -> derecha -> telefono
      const tx = L.lerp(L.lerp(0.315, 0.53, kp), 0.835, kf), tz = L.lerp(-2.6, -2.575, kf), hh = 0.6 - 0.04 * ease(0, D, lt) - 0.15 * kf, ang = 0.06 * Math.sin(lt * 0.5) * (1 - kf);
      c.up.set(Math.sin(ang), 0, -Math.cos(ang)); c.position.copy(A(tx, 0.45 + hh, tz + 0.1 * (1 - kf) + 0.03 * kf)); c.lookAt(A(tx, 0.45, tz + 0.035 * (1 - kf) + 0.03 * kf)); c.updateProjectionMatrix();
    } };
  }
  // 08 la barricada: empuja la comoda contra la puerta (tablones ya clavados arriba); la camara orbita
  { const c = cam(50); const D = T.steps - T.barricade;
    out['08_barricade'] = { scene, camera: c, overlay: vign(0.38), update(lt, t) {
      const k = ease(0.2, D - 0.3, lt); state({ lights: 0.06, moon: 1, dresserAt: k, planks: true }); setBlocks(99);
      AVA(-1.8, dresser.position.z + 0.24 + 0.53, Math.PI);
      ch.pose(lt, [L.seg('push_heavy', -99, { loop: true, speed: 0.9 })], [[-99, 'angry', mouthAt(t, 'frown')]]);
      const ang = L.lerp(-0.5, 0.8, ease(0, D, lt)), cz = dresser.position.z + 0.3;
      look(c, A(-1.8 + Math.sin(ang) * 2.0, 1.8, cz + Math.cos(ang) * 2.0), A(-1.8, 1.0, cz - 0.15));
    } };
  }
  // 09 pasos: Ava se congela junto a la puerta; bajo la puerta, la luz del pasillo y la sombra de unos pies que pasan... y se paran
  { const c = cam(46); const D = T.peep - T.steps;
    out['09_steps'] = { scene, camera: c, overlay: vign(0.45), update(lt, t) {
      state({ lights: 0.05, moon: 1, dresserAt: 1, planks: true }); setBlocks(99);
      const fs = W.footsteps - T.steps, st = W.stop - T.steps, fx = Math.min(lt, st);
      const feet = lt > fs - 0.2 ? [0.1 + 0.28 * (fx - fs + 0.2), 0.1 + 0.28 * (fx - fs + 0.2) + 0.16].map((v) => Math.max(-0.2, Math.min(0.62, v))) : [];
      drawGap(true, feet);
      AVA(-0.6, -3.0, Math.PI * 0.92);
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.6 }), L.seg('idle', W.freezes - T.steps, { from: 0.4, speed: 0 })], [[-99, 'half', mouthAt(t, 'neutral')], [fs, 'surprised', 'gasp'], [W.freezes - T.steps, 'scared', 'gasp']]);
      // de su cara (3/4) a un empuje bajo hacia la rendija de la puerta
      const k = ease(st - 0.6, st + 0.6, lt);
      const cp = crA([[0, -0.85, 1.5, -4.35], [st - 0.6, -0.9, 1.48, -4.2]], lt).lerp(A(-1.05, 1.45, -3.7), k);
      const tg = A(-0.6, 1.42, -3.0).lerp(A(-1.8, 1.45, ZB), k);
      look(c, cp, tg);
      if (k < 0.3) ch.lookAt(c, 0.5, 25);
    } };
  }
  // 10 mirilla (ojo de pez): el vecino del 3011 sale de la sombra, se planta frente a la mirilla y mira fijo; golpes + caja de dialogo
  { const c = cam(100); const D = T.fudge - T.peep;
    out['10_peep'] = { scene, camera: c, hideHud: () => false, overlay(lt, dt, a, o) { const cx = o.tctx, t = T.peep + lt;
      // lente: fuera del circulo negro, borde con aberracion leve
      const R0 = 158, cxp = LW / 2, cyp = 300; cx.save(); cx.beginPath(); cx.rect(0, 0, LW, LH); cx.moveTo(cxp + R0, cyp); cx.arc(cxp, cyp, R0, 0, Math.PI * 2, true); cx.fillStyle = '#000'; cx.fill('evenodd'); cx.restore();
      const g = cx.createRadialGradient(cxp, cyp, R0 * 0.55, cxp, cyp, R0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); cx.fillStyle = g; cx.beginPath(); cx.arc(cxp, cyp, R0, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(160,200,255,0.25)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(cxp, cyp, R0 - 2, 0, 7); cx.stroke();
      if (t >= W.knock + 0.1) {   // caja de dialogo RE: nombre + texto a maquina
        const s = 'PLEASE...  I JUST NEED WATER.', n = Math.floor((t - W.knock - 0.1) * 30), x = 20, y = 486, w = 320, h = 54;
        cx.fillStyle = 'rgba(6,8,16,0.9)'; cx.fillRect(x, y, w, h); cx.strokeStyle = '#8a90a8'; cx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        left(cx, '3011', x + 8, y - 8, 1, '#ff7b2e'); left(cx, s.slice(0, n), x + 10, y + 27, 1, '#e8e8f0');
      }
    }, update(lt, t) {
      state({ lights: 0.05, moon: 1, dresserAt: 1, planks: true, hero: false, nb: true, hallLit: 0.55 }); setBlocks(99);
      // sale de la sombra del fondo del pasillo (z -6.5, sin luz) y avanza hasta la puerta; la luz lo descubre poco a poco
      const kw = ease(0.4, 2.8, lt), z = L.lerp(-6.55, -5.75, kw); nbW.position.set(-1.78, 0, z); nbW.rotation.y = 0;
      poseNb(t, ease(0.7, 2.8, lt));
      const kn = t - W.knock, bob = kn > 0 && kn < 0.9 ? 0.012 * Math.max(0, Math.sin(kn * 22)) * (1 - kn / 0.9) : 0;   // los golpes mueven SOLO la hoja de la puerta (la mirilla con ella)
      look(c, A(-1.8, 1.58 + bob, ZB - 0.13), A(-1.8, 1.78, -6.6));
    } };
  }
  // 11 "Oh, fudge": de frente, cara de miedo de reojo hacia la puerta, boca normal de la toma (sin mueca)
  { const c = cam(40);
    out['11_fudge'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ lights: 0.05, moon: 1, dresserAt: 1, planks: true }); setBlocks(99);
      AVA(-1.55, -4.15, 0.25);
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'scared', mouthAt(t, 'neutral')]]);
      lk(c, [-1.45 + 0.03 * lt, 1.55, -2.55 - 0.1 * lt], [-1.55, 1.45, -4.15]);
      ch.lookAt(c, 1, 35);
    } };
  }
  // 12 menu RE sobre la puerta barricada: 1 OPEN / 2 STAY QUIET, COMMENT 1 OR 2, MOST COMMENTS DECIDE PART 2.
  { const c = cam(48);
    out['12_choice'] = { scene, camera: c, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T.choice + lt; vign(0.6)(lt, dt, a, o);
      const kp = L.clamp01(lt / 0.2), PX = 16, PY = 112, PW = 328, PH = 176;
      cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH);
      px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
      bitText(cx, 'WHAT DO YOU DO?', LW / 2, 146, 2, '#ececec', { outline: '#000000' });
      const opts = [['1  OPEN', W.open, '#5ab0ff'], ['2  STAY QUIET', W.quiet, '#ff5a4a']];
      const sel = t >= W.quiet - 0.2 ? 1 : t >= W.open - 0.2 ? 0 : -1;
      opts.forEach(([s, tw, col], i) => { if (t < tw - 0.25) return; const y = 196 + i * 50; left(cx, s, 80, y, 3, i === sel ? col : '#b8b8b8', { outline: '#000000' });
        if (i === sel) { const on = Math.floor((t - tw) * 4) % 2 === 0, x0 = 54; for (let k = 0; k < 10; k++) px(cx, x0 + k, y - 11 + k, on ? '#ffe048' : '#c89a20', 1, 23 - 2 * k); } });
      if (t >= W.comment) { const b = Math.round(3 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, 326 + b, 2, '#ffd23f', { outline: '#000000' }); }
      if (t >= W.most) {
        const n = Math.floor((t - W.most) * 20), L1 = 'MOST COMMENTS', L2 = 'DECIDE PART 2.';
        cx.font = 'bold 22px "Courier New", monospace'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
        cx.fillStyle = 'rgba(4,8,18,0.8)'; cx.fillRect(40, 466, LW - 80, 64);
        [[L1, 0, 484], [L2, L1.length + 1, 512]].forEach(([ln, off, y]) => { const s2 = ln.slice(0, Math.max(0, n - off)); if (!s2) return;
          const xw = Math.round(LW / 2 - cx.measureText(ln).width / 2); cx.fillStyle = '#000'; cx.fillText(s2, xw + 2, y + 2); cx.fillStyle = '#e8e4dc'; cx.fillText(s2, xw, y); });
      }
      if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, 576, 2, '#ececec', { outline: '#000000' });   // ultimo cuadro: el menu sobre el plano vivo
    }, update(lt, t) {
      state({ lights: 0.05, moon: 1, dresserAt: 1, planks: true }); setBlocks(99); drawGap(true, [0.3, 0.46]);
      AVA(-1.55, -4.3, Math.PI); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.55 })], [[-99, 'scared', 'neutral']]);   // de espaldas, mira por la mirilla, respira (idle vivo)
      lk(c, [-0.95 - 0.04 * lt, 1.62, -2.75 - 0.03 * lt], [-1.7, 1.45, -4.9]);
    } };
  }
  return out;
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          