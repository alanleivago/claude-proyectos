// sets/gas.js — ep13 "AVA: Gas Station, Part 1": gasolinera + tienda de noche en codigo (helpers copiados de sets/radio.js del ep12).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { makeSpray } from './respray.js';
import { makeTypewriter } from './radioprops.js';
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
  const noiseTex = (w, h, base, amp, seed, extra) => L.cvs(w, h, (c) => { const r = L.rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (r() - 0.5) * amp; px(c, x, y, `rgb(${base[0] + n},${base[1] + n},${base[2] + n})`); } if (extra) extra(c, r); });
  const PO = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 };
  const out = {};
  // =====================================================================================================================
  // ep13 "Gas Station, Part 1": gasolinera de noche en codigo. Marquesina con paneles de luz (z 0), dos islas con surtidores (x +-2),
  // el auto de Ava (x 4.4) cargando, un auto abandonado con los faros prendidos (-3.5, 5.5) apuntando a la tienda;
  // tienda (frente de vidrio en z -7, fondo z -15): mostrador + maquina de escribir, gondolas (spray de primeros auxilios),
  // camara frigorifica (atras a la derecha) y puerta del bano (atras a la izquierda). Cada update() fija TODO el estado.
  // =====================================================================================================================
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060912); scene.fog = new THREE.Fog(0x060912, 25, 70);
  const amb = new THREE.AmbientLight(0x6a7cb0, 0.45); scene.add(amb);
  const hemi = new THREE.HemisphereLight(0x8090c0, 0x201810, 0.35); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x9aa8e0, 0.35); moon.position.set(-8, 14, 6); scene.add(moon);
  // ---------- texturas ----------
  const tAsph = noiseTex(64, 64, [52, 54, 58], 18, 1301, (c, r) => { for (let k = 0; k < 40; k++) px(c, r() * 64 | 0, r() * 64 | 0, 'rgba(20,20,22,0.5)', 1 + (r() * 3 | 0), 1); for (let k = 0; k < 8; k++) px(c, r() * 64 | 0, r() * 64 | 0, 'rgba(120,110,90,0.25)', 2, 2); });
  const tConc = noiseTex(32, 32, [118, 116, 110], 14, 1302, (c) => { px(c, 0, 0, 'rgba(60,60,60,0.5)', 32, 1); px(c, 0, 0, 'rgba(60,60,60,0.5)', 1, 32); });
  const tLine = L.cvs(8, 32, (c) => { px(c, 0, 0, '#e8e0b0', 8, 32); px(c, 0, 0, 'rgba(0,0,0,0.25)', 2, 32); });
  const tTileW = L.cvs(32, 32, (c) => { const r = L.rng(1303); px(c, 0, 0, '#d8d6cc', 32, 32); for (let i = 0; i < 32; i += 8) { px(c, i, 0, '#9a988e', 1, 32); px(c, 0, i, '#9a988e', 32, 1); } for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(120,110,80,0.25)', 1, 1); });
  const tFloor = L.cvs(32, 32, (c) => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, ((x >> 3) + (y >> 3)) % 2 ? '#c8c2b0' : '#7a3a32'); });
  const tSteel = noiseTex(32, 32, [160, 166, 172], 12, 1304, (c) => { for (let y = 0; y < 32; y += 4) px(c, 0, y, 'rgba(255,255,255,0.18)', 32, 1); });
  const tStripe = L.cvs(32, 8, (c) => { px(c, 0, 0, '#c82a20', 32, 8); px(c, 0, 5, '#f0f0e8', 32, 2); });
  const mWhite = lam(null, 0xe8e6de), mDark = lam(null, 0x1a1a1c), mSteel = lam(L.rep(tSteel, 2, 2)), mRed = lam(null, 0xc02a20), mGlass = L.basic(null, 0x6a88a8, { transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  // ---------- suelo ----------
  { const g = new THREE.PlaneGeometry(120, 120, 60, 60); const o = L.mesh(g, lam(L.rep(tAsph, 40, 40)), 0, 0, 0, scene); o.rotation.x = -Math.PI / 2; }
  { const g = new THREE.PlaneGeometry(16, 10, 16, 10); const o = L.mesh(g, lam(L.rep(tConc, 8, 5), 0xffffff, PO), 0, 0.004, 0, scene); o.rotation.x = -Math.PI / 2; }
  for (const x of [-5.5, 5.5]) L.plane(0.12, 9, lam(L.rep(tLine, 1, 9), 0xffffff, PO), x, 0.008, 0, scene, 0, -Math.PI / 2);
  // ---------- marquesina ----------
  const canopy = new THREE.Group(); scene.add(canopy);
  B(11, 0.6, 7.5, [lam(L.rep(tStripe, 4, 1)), lam(L.rep(tStripe, 4, 1)), mWhite, lam(null, 0x2a2a2e), lam(L.rep(tStripe, 4, 1)), lam(L.rep(tStripe, 4, 1))], 0, 4.7, 0, canopy);
  for (const x of [-2, 2]) for (const z of [-2.6, 2.6]) B(0.35, 4.4, 0.35, mWhite, x, 2.2, z, canopy);
  const panels = []; for (const x of [-3.6, -1.2, 1.2, 3.6]) for (const z of [-1.8, 1.8]) { const p = L.plane(1.4, 0.7, L.basic(null, 0xf4f8ff), x, 4.39, z, canopy, 0, Math.PI / 2); panels.push(p); }
  const canL = [new THREE.PointLight(0xf0f4ff, 9, 13, 1.2), new THREE.PointLight(0xf0f4ff, 9, 13, 1.2)]; canL[0].position.set(-2, 4.1, 0); canL[1].position.set(2.5, 4.1, 0.5); canL.forEach((l) => scene.add(l));
  // ---------- surtidores (precio y litros en una CanvasTexture que se actualiza) ----------
  const pumps = [];
  const makePump = (x) => {
    const g = new THREE.Group(); g.position.set(x, 0, 0); scene.add(g);
    B(0.9, 0.16, 3.2, lam(L.rep(tConc, 1, 3), 0xd8d4c8), 0, 0.08, 0, g);   // isla
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48; const tx = new THREE.CanvasTexture(cv); L.nearest(tx); tx.colorSpace = THREE.SRGBColorSpace;
    const tBody = L.cvs(32, 64, (c) => { px(c, 0, 0, '#e8e6e0', 32, 64); px(c, 0, 0, '#c02a20', 32, 10); c.fillStyle = '#f8f0e0'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.fillText('FUEL', 16, 8); px(c, 3, 40, '#2a2a2e', 26, 10); for (let i = 0; i < 3; i++) px(c, 5 + i * 8, 42, ['#d8c020', '#38a040', '#c03030'][i], 6, 6); px(c, 0, 58, '#3a3a3e', 32, 6); });
    const mB = lam(tBody), mS = lam(null, 0xb8b4ac);
    B(0.72, 1.75, 0.48, [mS, mS, mS, mS, mB, mB], 0, 0.16 + 0.875, 0, g);
    const disp = L.plane(0.5, 0.36, L.basic(tx), 0, 1.45, 0.245, g); void disp;
    const hook = B(0.08, 0.2, 0.1, mDark, 0.3, 1.0, 0.27, g); void hook;
    const draw = (usd, on = 1) => { const c = cv.getContext('2d'); c.fillStyle = '#0a0c0a'; c.fillRect(0, 0, 64, 48); if (on > 0) { c.globalAlpha = on; c.fillStyle = '#ffb030'; c.font = 'bold 13px monospace'; c.textAlign = 'right'; c.fillText('$' + usd.toFixed(2), 60, 18); c.fillStyle = '#8af070'; c.font = 'bold 9px monospace'; c.fillText((usd / 3.89).toFixed(3) + ' GAL', 60, 34); c.fillStyle = '#c8c8c8'; c.font = '7px monospace'; c.fillText('3.89 /GAL', 60, 45); c.globalAlpha = 1; } tx.needsUpdate = true; };
    draw(0); const p = { g, draw }; pumps.push(p); return p;
  };
  const SZ_ICE = 4.3;
  const PUMP = makePump(2.0); makePump(-2.0).draw(0);
  // ---------- autos (codigo, low poly con textura pintada) ----------
  const makeCar = (col, plate) => {
    const g = new THREE.Group(), R = L.rng(col);
    const tSide = L.cvs(64, 24, (c) => { px(c, 0, 0, '#' + col.toString(16).padStart(6, '0'), 64, 24); px(c, 0, 18, 'rgba(0,0,0,0.35)', 64, 6); px(c, 0, 9, 'rgba(255,255,255,0.15)', 64, 1); for (let k = 0; k < 18; k++) px(c, R() * 64 | 0, R() * 24 | 0, 'rgba(60,40,30,0.3)', 1 + (R() * 3 | 0), 1); px(c, 28, 4, 'rgba(0,0,0,0.4)', 1, 14); });
    const tWin = L.cvs(32, 16, (c) => { const gg = c.createLinearGradient(0, 0, 0, 16); gg.addColorStop(0, '#4a5a78'); gg.addColorStop(1, '#141a28'); c.fillStyle = gg; c.fillRect(0, 0, 32, 16); px(c, 3, 2, 'rgba(255,255,255,0.35)', 8, 1); px(c, 15, 0, '#101010', 2, 16); });
    const tFront = L.cvs(32, 16, (c) => { px(c, 0, 0, '#' + col.toString(16).padStart(6, '0'), 32, 16); px(c, 8, 7, '#1a1a1a', 16, 5); for (let x = 9; x < 23; x += 2) px(c, x, 8, '#555', 1, 3); px(c, 12, 13, '#e8e8d0', 8, 3); c.fillStyle = '#222'; c.font = '3px monospace'; c.fillText(plate, 12, 16); });
    const mS = lam(tSide), mF = lam(tFront), mW = lam(tWin), mT = lam(null, col), mTi = lam(null, 0x141414), mRim = lam(null, 0x9a9a9a);
    B(1.76, 0.62, 4.2, [mS, mS, mT, mTi, mF, mF], 0, 0.62, 0, g);                                  // carroceria (frente = -z)
    B(1.56, 0.5, 2.1, [mW, mW, mT, mTi, mW, mW], 0, 1.18, 0.25, g);                               // cabina
    for (const x of [-0.82, 0.82]) for (const z of [-1.35, 1.35]) { const w = L.mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 10), mTi, x, 0.33, z, g); w.rotation.z = Math.PI / 2; const h = L.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 8), mRim, x, 0.33, z, g); h.rotation.z = Math.PI / 2; }
    const heads = []; for (const x of [-0.6, 0.6]) heads.push(B(0.32, 0.14, 0.04, L.basic(null, 0x404038), x, 0.75, -2.11, g));
    for (const x of [-0.62, 0.62]) B(0.3, 0.12, 0.04, L.basic(null, 0x801010), x, 0.78, 2.11, g);
    const filler = B(0.02, 0.16, 0.16, lam(null, 0x2a2a2a), -0.885, 0.85, 1.3, g);
    return { g, heads, filler, setHeads(on) { heads.forEach((h) => h.material.color.set(on ? 0xfffbe8 : 0x404038)); } };
  };
  // v1 (usuario: auto muy de cajas): sedanes low poly de Quaternius (CC0, poly.pizza Cz6yDaUcM9 / unqqkULtRU) con carroceria curva,
  // pasos de rueda, ruedas, vidrios, espejos y luces. El modelo mira a +z: se gira 180 para que el frente quede en -z como antes.
  const loadCar = async (file, col, len) => {
    const m = await prop(file), g = new THREE.Group(); g.add(m); m.rotation.y = Math.PI; m.updateMatrixWorld(true);
    let bb = new THREE.Box3().setFromObject(m); const k = len / (bb.max.z - bb.min.z); m.scale.multiplyScalar(k); m.updateMatrixWorld(true); bb = new THREE.Box3().setFromObject(m); m.position.y = -bb.min.y;
    const heads = [], mOn = L.basic(null, 0xfffbe8), mOff = lam(null, 0x9a9a90);
    m.traverse((o) => { if (!o.isMesh) return; const nm = o.material.name || ''; if (/blue/i.test(nm)) o.material = lam(null, col); if (/headlight/i.test(nm)) heads.push(o); if (/tail/i.test(nm)) o.material = L.basic(null, 0x6a0c0c); });
    const filler = B(0.02, 0.16, 0.16, lam(null, 0x2a2a2a), -0.92, 0.82, 1.3, g);
    return { g, heads, filler, setHeads(on) { heads.forEach((h) => { h.material = on ? mOn : mOff; }); } };
  };
  const CAR = await loadCar('car_a', 0x2e4e86, 4.3); scene.add(CAR.g); CAR.g.position.set(4.4, 0, 0.3); CAR.setHeads(false);
  const ABND = await loadCar('car_b', 0x6a2420, 4.0); scene.add(ABND.g); ABND.g.position.set(-3.9, 0, 2.6); ABND.g.rotation.y = 0.12; ABND.setHeads(true);
  { const dr = B(0.05, 0.55, 1.0, lam(null, 0x6a2420), -0.95, 0.85, -0.25, ABND.g); dr.rotation.y = -0.8; }   // puerta del conductor abierta: lo abandonaron
  const headL = []; for (const x of [-0.6, 0.6]) { const s = new THREE.SpotLight(0xfff2d0, 26, 26, 0.42, 0.5, 1.1); ABND.g.add(s); s.position.set(x, 0.75, -2.2); s.target.position.set(x * 2, 0.4, -14); ABND.g.add(s.target); headL.push(s); }
  const tGlare = L.cvs(32, 32, (c) => { const gg = c.createRadialGradient(16, 16, 1, 16, 16, 16); gg.addColorStop(0, 'rgba(255,250,230,1)'); gg.addColorStop(0.3, 'rgba(255,240,200,0.6)'); gg.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = gg; c.fillRect(0, 0, 32, 32); });
  const tHaze = L.cvs(8, 32, (c) => { const gg = c.createLinearGradient(0, 0, 0, 32); gg.addColorStop(0, 'rgba(255,240,200,0)'); gg.addColorStop(1, 'rgba(255,240,200,0.9)'); c.fillStyle = gg; c.fillRect(0, 0, 8, 32); });
  for (const x of [-0.6, 0.6]) { const cn = L.mesh(new THREE.ConeGeometry(1.6, 9, 10, 1, true), L.basic(tHaze, 0xffffff, { transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide }), x, 0.75, -6.7, ABND.g); cn.material.blending = THREE.AdditiveBlending; cn.rotation.x = -Math.PI / 2; cn.visible = false; }   // haz de los faros (las siluetas se recortan contra el)
  const glares = []; for (const x of [-0.6, 0.6]) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tGlare, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(1.3, 1.3, 1); ABND.g.add(sp); sp.position.set(x, 0.75, -2.25); glares.push(sp); }
  // ---------- v1: detalle del exterior (cordon, manchas de aceite, grietas, tacho, conservadora de hielo, inflador, cartel de precios,
  // ruta con lineas, arboleda y edificios oscuros, cielo con estrellas, borde de marquesina con profundidad, polillas en las luces) ----------
  { const mCurb = lam(L.rep(noiseTex(16, 16, [168, 164, 156], 16, 1310), 8, 1));
    for (const [w, d, x, z] of [[16.4, 0.25, 0, 5.1], [16.4, 0.25, 0, -5.1], [0.25, 10.4, 8.1, 0], [0.25, 10.4, -8.1, 0]]) B(w, 0.14, d, mCurb, x, 0.07, z, scene);
    const tOil = L.cvs(32, 32, (c) => { const r = L.rng(1311); c.clearRect(0, 0, 32, 32); for (let k = 0; k < 5; k++) { c.fillStyle = `rgba(14,12,10,${0.35 + r() * 0.3})`; c.beginPath(); c.ellipse(16 + (r() - 0.5) * 10, 16 + (r() - 0.5) * 10, 4 + r() * 9, 3 + r() * 6, r() * 3, 0, 7); c.fill(); } });
    const tCrack = L.cvs(64, 64, (c) => { const r = L.rng(1312); c.clearRect(0, 0, 64, 64); c.strokeStyle = 'rgba(30,28,26,0.8)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { let x = r() * 64, y = r() * 64; c.beginPath(); c.moveTo(x, y); for (let q = 0; q < 8; q++) { x += (r() - 0.5) * 16; y += (r() - 0.5) * 16; c.lineTo(x, y); } c.stroke(); } });
    const R = L.rng(1313); for (let k = 0; k < 9; k++) { const o = L.plane(0.8 + R() * 1.2, 0.8 + R() * 1.2, L.basic(tOil, 0xffffff, { transparent: true, depthWrite: false, ...PO }), (R() - 0.5) * 12, 0.009, (R() - 0.5) * 8, scene, R() * 3, -Math.PI / 2); o.renderOrder = 3; }
    for (let k = 0; k < 6; k++) { const o = L.plane(2.5, 2.5, L.basic(tCrack, 0xffffff, { transparent: true, depthWrite: false, ...PO }), (R() - 0.5) * 14, 0.009, (R() - 0.5) * 9, scene, R() * 3, -Math.PI / 2); o.renderOrder = 3; }
    // ruta frente a la estacion (z 11) con lineas amarillas, cordon y vereda
    { const g = new THREE.PlaneGeometry(140, 8, 70, 4); const o = L.mesh(g, lam(L.rep(noiseTex(32, 32, [40, 42, 46], 14, 1314), 70, 4)), 0, 0.006, 11.5, scene); o.rotation.x = -Math.PI / 2; }
    for (let x = -60; x < 60; x += 4) L.plane(2, 0.14, L.basic(null, 0xc8a830, PO), x, 0.012, 11.5, scene, 0, -Math.PI / 2);
    // tacho, conservadora de hielo, inflador
    const tTrash = L.cvs(16, 32, (c) => { px(c, 0, 0, '#3a5a3a', 16, 32); for (let x = 0; x < 16; x += 3) px(c, x, 0, '#2a4a2a', 1, 32); px(c, 0, 0, '#1a1a1a', 16, 3); });
    L.mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.95, 10), lam(tTrash), 1.4, 0.475, 1.9, scene); L.mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 10), lam(null, 0x1a1a1a), 1.4, 0.98, 1.9, scene);
    const tIce = L.cvs(64, 32, (c) => { px(c, 0, 0, '#e8eef4', 64, 32); px(c, 0, 0, '#2a6ac0', 64, 9); c.fillStyle = '#f0f6ff'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('ICE', 32, 8); for (let y = 12; y < 32; y += 5) px(c, 2, y, '#b8c4d0', 60, 1); px(c, 26, 18, '#707880', 12, 3); });
    B(1.4, 1.05, 0.7, [lam(null, 0xd8e0e8), lam(null, 0xd8e0e8), lam(null, 0xc8d0d8), lam(null, 0x8a9098), lam(tIce), lam(tIce)], 4.6, 0.525, SZ_ICE, scene);
    const tAir = L.cvs(16, 32, (c) => { px(c, 0, 0, '#c02a20', 16, 32); px(c, 2, 4, '#f0f0e0', 12, 8); c.fillStyle = '#c02a20'; c.font = 'bold 5px monospace'; c.fillText('AIR', 3, 10); px(c, 4, 16, '#1a1a1a', 8, 6); });
    B(0.35, 1.25, 0.3, lam(tAir), 7.2, 0.625, 3.6, scene); { const hose = L.mesh(new THREE.TorusGeometry(0.15, 0.025, 4, 10), lam(null, 0x111111), 7.2, 0.7, 3.78, scene); void hose; }
    // cartel de precios en un poste (luces apagadas con el corte, numeros pintados)
    const tPrice = L.cvs(32, 64, (c) => { px(c, 0, 0, '#f0f0e8', 32, 64); px(c, 0, 0, '#c02a20', 32, 14); c.fillStyle = '#fff'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('FUEL', 16, 10); c.fillStyle = '#1a1a1a'; c.font = 'bold 7px monospace'; ['REG 3.89', 'MID 4.19', 'PRE 4.49'].forEach((t, i) => { px(c, 2, 18 + i * 15, '#101010', 28, 12); c.fillStyle = '#ffb030'; c.fillText(t, 16, 27 + i * 15); }); });
    L.mesh(new THREE.CylinderGeometry(0.12, 0.14, 6.5, 8), lam(null, 0x8a8a8a), -7.0, 3.25, 6.5, scene); B(1.6, 3.0, 0.3, [mDark, mDark, mDark, mDark, lam(tPrice), lam(tPrice)], -7.0, 6.9, 6.5, scene);
    // arboleda y edificios oscuros detras de la ruta + cielo con estrellas
    const mTree = lam(null, 0x0c140e, { flatShading: true }); for (let k = 0; k < 40; k++) { const x = -60 + k * 3.1 + R() * 2, z = 18 + R() * 6, h = 6 + R() * 6; const t2 = L.mesh(new THREE.ConeGeometry(1.6 + R(), h, 6), mTree, x, h / 2, z, scene); void t2; }
    const tBld = L.cvs(16, 32, (c) => { const r = L.rng(1315); px(c, 0, 0, '#0e1018', 16, 32); for (let y = 3; y < 30; y += 4) for (let x = 2; x < 15; x += 4) if (r() < 0.12) px(c, x, y, '#c8a860', 2, 2); });
    for (let k = 0; k < 8; k++) { const w = 6 + R() * 6, h = 8 + R() * 10; B(w, h, 5, [mDark, mDark, mDark, mDark, lam(L.rep(tBld, Math.round(w / 3), Math.round(h / 4))), mDark], -40 + k * 11, h / 2, -32 - R() * 6, scene); }
    const tSky = L.cvs(64, 64, (c) => { const r = L.rng(1316), gg = c.createLinearGradient(0, 0, 0, 64); gg.addColorStop(0, '#02030a'); gg.addColorStop(1, '#141a30'); c.fillStyle = gg; c.fillRect(0, 0, 64, 64); for (let k = 0; k < 90; k++) px(c, r() * 64 | 0, r() * 52 | 0, `rgba(230,230,255,${0.3 + r() * 0.7})`, 1, 1); });
    const sky = L.mesh(new THREE.SphereGeometry(90, 16, 8), L.basic(L.rep(tSky, 4, 1), 0xffffff, { side: THREE.BackSide, fog: false }), 0, 0, 0, scene); void sky;
    // borde de la marquesina con profundidad: fascia con franjas + plafones empotrados con marco + polillas
    B(11.2, 0.12, 0.12, lam(null, 0xd8d8d0), 0, 4.38, 3.8, canopy); B(11.2, 0.12, 0.12, lam(null, 0xd8d8d0), 0, 4.38, -3.8, canopy);
    panels.forEach((pn) => { B(1.6, 0.06, 0.06, mDark, pn.position.x, 4.37, pn.position.z - 0.38, canopy); B(1.6, 0.06, 0.06, mDark, pn.position.x, 4.37, pn.position.z + 0.38, canopy); });
  }
  const moths = []; { const mM = new THREE.SpriteMaterial({ color: 0xd8d0c0 }); for (let k = 0; k < 14; k++) { const sp = new THREE.Sprite(mM); sp.scale.set(0.035, 0.025, 1); scene.add(sp); moths.push(sp); } }
  const setMoths = (on, t) => { moths.forEach((m, k) => { m.visible = on; if (!on) return; const pn = panels[k % panels.length].position, a = L.q15(t) * (3 + k % 3) + k; m.position.set(pn.x + 0.5 * Math.cos(a), 4.1 + 0.2 * Math.sin(a * 1.7), pn.z + 0.4 * Math.sin(a)); }); };
  // ---------- tienda ----------
  const shop = new THREE.Group(); scene.add(shop); const roof = new THREE.Group(); scene.add(roof);
  const SZ0 = -7, SZ1 = -15, SX = 6, SH = 3.2;
  const mWallI = lam(L.rep(tTileW, 6, 2)), mWallO = lam(L.rep(noiseTex(32, 32, [150, 140, 120], 14, 1305), 6, 2)), mCap = lam(null, 0xb8b4a8);
  B(2 * SX, SH, 0.2, [mCap, mCap, mCap, mCap, mWallI, mWallO], 0, SH / 2, SZ1, shop);                          // fondo
  for (const s of [-1, 1]) B(0.2, SH, SZ0 - SZ1, [s < 0 ? mWallI : mWallO, s < 0 ? mWallO : mWallI, mCap, mCap, mCap, mCap], s * SX, SH / 2, (SZ0 + SZ1) / 2, shop);
  { const g = new THREE.PlaneGeometry(2 * SX, SZ0 - SZ1, 12, 8); const o = L.mesh(g, lam(L.rep(tFloor, 12, 8)), 0, 0.01, (SZ0 + SZ1) / 2, shop); o.rotation.x = -Math.PI / 2; }
  B(2 * SX + 0.4, 0.3, SZ0 - SZ1 + 0.4, [mCap, mCap, lam(null, 0x3a3a3e), lam(null, 0xd8d6cc), mCap, mCap], 0, SH + 0.15, (SZ0 + SZ1) / 2, roof);
  B(2 * SX + 0.4, 0.7, 0.3, [mCap, mCap, mCap, mCap, lam(L.rep(tStripe, 6, 1)), mCap], 0, SH + 0.25, SZ0 + 0.1, roof);   // franja del frente
  // v1 (usuario: la puerta flotaba): frente de vitrina con perfiles de aluminio (zocalo, travesano, montantes), vano de puerta con jambas y
  // dintel; la hoja (marco de aluminio + vidrio + barra) gira sobre su jamba izquierda; afiches en los vidrios y cartel OPEN.
  const mAl = lam(L.rep(noiseTex(8, 8, [176, 180, 186], 10, 1320), 1, 4)), glassF = [];
  { const mK = lam(L.rep(noiseTex(16, 16, [60, 62, 68], 10, 1321), 6, 1)), w = SX - 0.66; for (const sg of [-1, 1]) { B(w, 0.55, 0.16, mK, sg * (0.66 + w / 2), 0.275, SZ0, shop); B(w, 0.1, 0.14, mAl, sg * (0.66 + w / 2), 0.6, SZ0, shop); L.plane(0.78, 1.78, mGlass, sg * 1.11, 0.65 + 0.89, SZ0, shop); } }   // v3: zocalo/riel cortados en el vano (antes cruzaban la puerta)
  B(2 * SX, 0.12, 0.14, mAl, 0, SH - 0.06, SZ0, shop); B(2 * SX, 0.08, 0.12, mAl, 0, 2.42, SZ0, shop);   // travesanos
  const tPost = (title, col, sub) => L.cvs(32, 48, (c) => { px(c, 0, 0, col, 32, 48); px(c, 2, 2, 'rgba(255,255,255,0.85)', 28, 12); c.fillStyle = col; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.fillText(title, 16, 11); c.fillStyle = '#fff'; c.font = 'bold 6px monospace'; c.fillText(sub, 16, 30); });
  const posters = [[-4.6, tPost('ICE', '#2a6ac0', 'COLD'), 1.4], [-2.3, tPost('LOTTO', '#c02a20', '$$$'), 1.3], [3.0, tPost('SODA', '#d08020', '2 FOR 3'), 1.35]];
  for (let x = -SX; x < SX - 0.01; x += 1.5) { const cx = x + 0.75; if (Math.abs(x) > 0.7) B(0.07, SH, 0.14, mAl, x, SH / 2, SZ0, shop); if (Math.abs(cx) < 0.8) continue;   // v4: ningun montante ni vidrio dentro del vano
    glassF.push(L.plane(1.42, 1.78, mGlass, cx, 0.65 + 0.89, SZ0, shop)); glassF.push(L.plane(1.42, 0.6, mGlass, cx, 2.46 + 0.3, SZ0, shop)); }
  for (const [x, tx, y] of posters) L.plane(0.45, 0.66, lam(tx), x, y, SZ0 + 0.01, shop);
  { const tOpen = L.cvs(32, 12, (c) => { px(c, 0, 0, '#1a0808', 32, 12); c.fillStyle = '#5a1818'; c.font = 'bold 9px monospace'; c.fillText('OPEN', 4, 10); }); L.plane(0.6, 0.22, L.basic(tOpen), 1.6, 2.1, SZ0 + 0.012, shop); }
  for (const x of [-0.66, 0.66]) B(0.1, 2.4, 0.18, mAl, x, 1.2, SZ0, shop);   // jambas
  B(1.42, 0.12, 0.18, mAl, 0, 2.36, SZ0, shop); L.plane(1.22, 0.7, mGlass, 0, 2.77, SZ0, shop);   // dintel + vidrio fijo arriba
  const mGlassClear = L.basic(null, 0x8aa0b8, { transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide }); const outFill = new THREE.PointLight(0xb8c8ff, 0, 14, 1.0); outFill.position.set(-2.6, 2.6, 0.2); scene.add(outFill);
  const sdoor = new THREE.Group(); sdoor.position.set(-0.6, 0, SZ0 + 0.02); shop.add(sdoor);
  { B(0.07, 2.28, 0.06, mAl, 0.04, 1.16, 0, sdoor); B(0.07, 2.28, 0.06, mAl, 1.16, 1.16, 0, sdoor); B(1.2, 0.08, 0.06, mAl, 0.6, 2.26, 0, sdoor); B(1.2, 0.22, 0.06, mAl, 0.6, 0.13, 0, sdoor);
    L.plane(1.06, 1.98, mGlass, 0.6, 1.25, 0, sdoor); B(0.8, 0.05, 0.05, lam(null, 0xd8dce0), 0.6, 1.05, -0.06, sdoor); B(0.8, 0.05, 0.05, lam(null, 0xd8dce0), 0.6, 1.05, 0.06, sdoor);
    L.plane(0.3, 0.1, L.basic(L.cvs(24, 8, (c) => { px(c, 0, 0, '#f0f0f0', 24, 8); c.fillStyle = '#c02a20'; c.font = 'bold 6px monospace'; c.fillText('PUSH', 3, 7); })), 0.6, 1.3, 0.035, sdoor); }
  // tubos fluorescentes del techo (se apagan con el corte)
  const tubes = []; for (const x of [-3, 0, 3]) for (const z of [-9, -12.5]) tubes.push(B(1.2, 0.05, 0.12, L.basic(null, 0xf4f8ff), x, SH - 0.05, z, shop));
  // mostrador + caja + maquina de escribir (detras, sobre un mueble)
  const tCounter = L.cvs(32, 16, (c) => { px(c, 0, 0, '#8a5a3a', 32, 16); for (let x = 0; x < 32; x += 8) px(c, x, 0, '#6a4228', 1, 16); px(c, 0, 0, '#c8b898', 32, 2); });
  B(3.0, 1.0, 0.6, lam(L.rep(tCounter, 3, 1)), -4.0, 0.5, -8.6, shop); B(3.1, 0.05, 0.7, lam(null, 0xd8d0c0), -4.0, 1.025, -8.6, shop);
  B(0.42, 0.25, 0.36, mDark, -4.6, 1.17, -8.6, shop); B(0.36, 0.2, 0.05, L.basic(null, 0x203828), -4.6, 1.36, -8.5, shop);
  B(1.4, 0.9, 0.45, lam(L.rep(tCounter, 2, 1)), -4.6, 0.45, -10.3, shop);
  const TWR = makeTypewriter(L); shop.add(TWR.g); TWR.g.position.set(-4.75, 0.9, -10.3); TWR.g.rotation.y = 0.35;
  { const c2 = TWR.cv.getContext('2d'); c2.fillStyle = '#ece6d4'; c2.fillRect(0, 0, 96, 128); c2.fillStyle = '#1a1a1a'; c2.font = 'bold 10px "Courier New", monospace'; c2.fillText('NIGHT SHIFT', 10, 30); c2.fillText('LOG', 10, 44); TWR.tex.needsUpdate = true; }
  // gondolas con productos (cajitas de colores), spray de primeros auxilios en una
  const tProd = L.cvs(64, 16, (c) => { const r = L.rng(1306); const cols = ['#d83a30', '#f0c030', '#3070d0', '#40a050', '#e87030', '#f0f0e8', '#8a40b0']; for (let x = 0; x < 64; x += 4) { const col = cols[r() * cols.length | 0]; px(c, x, 2 + (r() * 4 | 0), col, 3, 14); px(c, x, 6, 'rgba(255,255,255,0.35)', 3, 1); } });
  for (const gx of [-0.8, 1.6]) { const gg = new THREE.Group(); gg.position.set(gx, 0, -11); shop.add(gg); B(0.7, 1.6, 4.0, lam(null, 0xd8d4c8), 0, 0.8, 0, gg);
    for (const y of [0.35, 0.8, 1.25]) for (const s of [-1, 1]) { B(0.12, 0.03, 4.0, lam(null, 0xa8a49a), s * 0.4, y - 0.02, 0, gg); const pr = L.plane(4.0, 0.3, lam(L.rep(tProd, 4, 1)), s * 0.42, y + 0.15, 0, gg, s * Math.PI / 2); void pr; } }
  const spray = makeSpray(L); shop.add(spray); spray.position.set(-0.8 - 0.42, 0.8, -10.2); spray.scale.setScalar(1.3);
  const water = await prop('water'); shop.add(water); water.position.set(1.6 + 0.43, 0.8, -12.0);
  // camara frigorifica (cuarto de acero adentro de la tienda, atras a la derecha) con puerta pesada y cartel
  const cooler = new THREE.Group(); shop.add(cooler); const CX0 = 2.8, CX1 = 5.9, CZ0 = -12.0, CZ1 = -14.9, CH = 2.7;
  { const mC = lam(L.rep(tSteel, 3, 2)); B(0.25, CH, CZ0 - CZ1, mC, CX0, CH / 2, (CZ0 + CZ1) / 2, cooler); B(CX1 - CX0, CH, 0.25, mC, (CX0 + CX1) / 2, CH / 2, CZ0, cooler); B(CX1 - CX0, 0.2, CZ0 - CZ1, mC, (CX0 + CX1) / 2, CH, (CZ0 + CZ1) / 2, cooler); }
  const cdoor = new THREE.Group(); cdoor.position.set(CX0 - 0.14, 0, -12.6); cooler.add(cdoor);
  { const tCD = L.cvs(32, 64, (c) => { px(c, 0, 0, '#b8bcc0', 32, 64); for (let y = 0; y < 64; y += 6) px(c, 0, y, 'rgba(255,255,255,0.2)', 32, 1); px(c, 4, 6, '#2a6ab0', 24, 8); c.fillStyle = '#f0f4f8'; c.font = 'bold 5px monospace'; c.textAlign = 'center'; c.fillText('COOLER', 16, 12); px(c, 2, 2, '#707478', 28, 1); px(c, 2, 61, '#707478', 28, 1); });
    B(0.1, 2.1, 1.0, [lam(tCD), lam(tCD), mSteel, mSteel, mSteel, mSteel], 0, 1.05, -0.5, cdoor); B(0.08, 0.06, 0.32, mDark, -0.07, 1.05, -0.85, cdoor); B(0.06, 0.18, 0.06, mDark, -0.08, 1.05, -0.7, cdoor); }
  // bano: puerta de madera con cartel RESTROOM en la pared del fondo (x -3.8); la ranura de abajo deja pasar la mano y la sangre
  const BDX = -3.8, BDZ = SZ1 + 0.11;
  const bdoorG = new THREE.Group(); bdoorG.position.set(BDX - 0.45, 0, BDZ); shop.add(bdoorG);
  const tBD = L.cvs(32, 64, (c) => { const r = L.rng(1307); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.7 + y * 0.05) + r() * 8; px(c, x, y, `rgb(${120 + n},${84 + n * 0.6},${52 + n * 0.4})`); } for (const [x, y, w, h] of [[4, 4, 24, 24], [4, 34, 24, 26]]) { px(c, x, y, '#4a2a18', w, 1); px(c, x, y, '#4a2a18', 1, h); px(c, x, y + h - 1, '#c89a6a', w, 1); px(c, x + w - 1, y, '#c89a6a', 1, h); } });
  const bleaf = new THREE.Group(); bdoorG.add(bleaf); B(0.9, 2.02, 0.05, [lam(null, 0x5a3a20), lam(null, 0x5a3a20), lam(null, 0x5a3a20), lam(null, 0x5a3a20), lam(tBD), lam(tBD)], 0.45, 0.05 + 1.01, 0, bleaf);
  const bknob = new THREE.Group(); bleaf.add(bknob); bknob.position.set(0.8, 1.0, 0.04); L.mesh(new THREE.SphereGeometry(0.035, 8, 6), lam(null, 0xc8a050), 0, 0, 0.02, bknob); B(0.05, 0.08, 0.02, lam(null, 0xc8a050), 0, 0, 0, bknob);
  for (const x of [-0.04, 0.94]) B(0.08, 2.15, 0.12, lam(null, 0x4a2e18), x, 1.075, 0, bdoorG); B(1.06, 0.08, 0.12, lam(null, 0x4a2e18), 0.45, 2.15, 0, bdoorG);
  L.plane(0.5, 0.16, L.basic(L.cvs(48, 16, (c) => { px(c, 0, 0, '#1a3a6a', 48, 16); c.fillStyle = '#f0f0f0'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('RESTROOM', 24, 11); })), 0.45, 2.38, 0.02, bdoorG);
  const gapLight = L.plane(0.86, 0.03, L.basic(null, 0x3a3020, { transparent: true, opacity: 0.0, depthWrite: false, ...PO }), BDX, 0.012, BDZ + 0.02, shop, 0, -Math.PI / 2);
  // v1 (usuario: mano fea y plana): mano low poly facetada (flatShading) con palma deformada, 4 dedos de 3 falanges + pulgar de 2 con
  // nudillos, textura de piel, vendaje de varias vueltas con mancha de sangre y puno de manga oscuro. Sale de la ranura y los dedos se crispan.
  const handG = new THREE.Group(); shop.add(handG);
  const HAND = (() => {
    const tSkin = L.cvs(16, 16, (c) => { const r = L.rng(1330); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 14 - 7; px(c, x, y, `rgb(${196 + n},${150 + n},${122 + n})`); } px(c, 0, 5, 'rgba(120,70,50,0.35)', 16, 1); px(c, 0, 11, 'rgba(120,70,50,0.3)', 16, 1); });
    const tBand = L.cvs(32, 16, (c) => { const r = L.rng(1331); px(c, 0, 0, '#e8e0cc', 32, 16); for (let y = 0; y < 16; y += 3) { px(c, 0, y, '#bdb39c', 32, 1); px(c, 0, y + 1, '#f4eedc', 32, 1); } for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 16 | 0, 'rgba(150,130,100,0.3)', 1, 1); c.fillStyle = 'rgba(120,12,10,0.9)'; c.beginPath(); c.ellipse(20, 8, 6, 4, 0.3, 0, 7); c.fill(); c.fillStyle = 'rgba(70,6,6,0.9)'; c.beginPath(); c.ellipse(21, 8, 3, 2, 0.3, 0, 7); c.fill(); });
    const tSleeve = L.cvs(16, 16, (c) => { const r = L.rng(1332); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 10; px(c, x, y, `rgb(${34 + n},${36 + n},${44 + n})`); } px(c, 0, 0, '#16161c', 16, 2); });
    const mS = new THREE.MeshLambertMaterial({ map: tSkin, flatShading: true }), mB = new THREE.MeshLambertMaterial({ map: tBand, flatShading: true }), mC = new THREE.MeshLambertMaterial({ map: tSleeve, flatShading: true });
    [mS, mB, mC].forEach((m) => L.snap(m));
    const root = new THREE.Group(); handG.add(root);   // la mano apunta a +z (sale de la puerta hacia el cuarto), palma abajo, apoyada en y = 0
    // palma: caja de 8 vertices deformada (ancha en los nudillos, angosta en la muneca, mas gruesa al centro)
    const pg = new THREE.SphereGeometry(0.05, 7, 4), pp = pg.attributes.position;   // v1b: palma facetada (esfera de 7x4 aplastada y deformada), no una caja
    for (let k = 0; k < pp.count; k++) { const x = pp.getX(k), y = pp.getY(k), z = pp.getZ(k); pp.setX(k, x * 0.88 * (z > 0 ? 1.08 : 0.85)); pp.setY(k, y * 0.3 * (y > 0 ? 1.15 : 0.7)); pp.setZ(k, z * 0.98); }
    pg.computeVertexNormals(); const palm = new THREE.Mesh(pg, mS); palm.position.set(0, 0.014, 0); root.add(palm);
    const fingers = [];
    const seg = (r0, r1, len, m) => { const g = new THREE.CylinderGeometry(r1, r0, len, 6, 1); g.rotateX(Math.PI / 2); g.translate(0, 0, len / 2); return new THREE.Mesh(g, m); };
    const FL = [[-0.032, 0.05, [0.024, 0.016, 0.012]], [-0.011, 0.054, [0.027, 0.018, 0.013]], [0.011, 0.053, [0.026, 0.017, 0.013]], [0.031, 0.048, [0.021, 0.014, 0.011]]];
    for (const [x, z0, lens] of FL) { let par = root, z = z0; const chain = []; const kn = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 5, 4), mS); kn.position.set(x, 0.02, z0 - 0.004); root.add(kn);   // nudillo
      lens.forEach((ln, q) => { const j = new THREE.Group(); j.position.set(q === 0 ? x : 0, q === 0 ? 0.014 : 0, q === 0 ? z : lens[q - 1]); par.add(j); const sg = seg(0.0085 - q * 0.0012, 0.0075 - q * 0.0012, ln, mS); j.add(sg); chain.push(j); par = j; });
      fingers.push(chain); }
    { let par = root; const lens = [0.026, 0.02], th = []; lens.forEach((ln, q) => { const j = new THREE.Group(); if (q === 0) { j.position.set(0.045, 0.012, -0.01); j.rotation.set(0, 0.9, 0); } else j.position.set(0, 0, lens[0]); par.add(j); j.add(seg(0.0095 - q * 0.0015, 0.008 - q * 0.0015, ln, mS)); th.push(j); par = j; }); fingers.push(th); }
    // vendaje: 4 vueltas inclinadas que se solapan sobre palma y muneca
    for (let k = 0; k < 4; k++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05 - k * 0.002, 0.052 - k * 0.002, 0.026, 8, 1, true), mB); w.material.side = THREE.DoubleSide; w.rotation.set(Math.PI / 2 + (k % 2 ? 0.25 : -0.25), 0, 0); w.scale.set(1, 1, 0.42); w.position.set(0, 0.015, -0.03 - k * 0.022); root.add(w); }
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.054, 0.16, 8, 1), mC); cuff.rotation.x = Math.PI / 2; cuff.scale.set(1.15, 1, 0.55); cuff.position.set(0, 0.022, -0.2); root.add(cuff);   // puno de la manga (queda bajo la puerta)
    root.scale.setScalar(1.15);
    return { root, curl(a) { fingers.forEach((ch, i) => ch.forEach((j, q) => { j.rotation.x = (i < 4 ? 1 : 0.6) * a * (q === 0 ? 0.5 : 0.9); })); } };
  })();
  // gota de sangre: sale rodando de la ranura, se frena y se abre en un charco (disco irregular que crece)
  const drop = L.mesh(new THREE.SphereGeometry(0.013, 6, 4), L.basic(null, 0x7a0606), 0, 0, 0, shop); drop.scale.y = 0.6;
  const pudG = new THREE.CircleGeometry(0.07, 12); { const pa = pudG.attributes.position, R2 = L.rng(1333); for (let k = 1; k < pa.count; k++) { const f = 0.75 + R2() * 0.5; pa.setXY(k, pa.getX(k) * f, pa.getY(k) * f); } }
  const puddle = L.mesh(pudG, L.basic(null, 0x3a0303, { ...PO }), 0, 0.013, 0, shop); puddle.rotation.x = -Math.PI / 2; puddle.renderOrder = 4;
  const tBlood = await L.loadTex('tex/blood_drops.png', 96);
  const tPud = L.cvs(32, 32, (c) => { c.clearRect(0, 0, 32, 32); c.fillStyle = '#5a0606'; c.beginPath(); c.ellipse(16, 18, 13, 9, 0.2, 0, 7); c.fill(); c.fillStyle = '#8a0c0c'; c.beginPath(); c.ellipse(15, 17, 10, 6, 0.2, 0, 7); c.fill(); c.fillStyle = '#c83030'; c.fillRect(11, 14, 4, 1); c.beginPath(); c.arc(27, 9, 2, 0, 7); c.fill(); });   // charco propio + gotitas
  void tBlood; const blood = L.plane(0.5, 0.5, L.basic(tPud, 0xffffff, { transparent: true, alphaTest: 0.3, depthWrite: false, ...PO }), BDX + 0.15, 0.014, BDZ + 0.12, shop, 0.4, -Math.PI / 2); blood.renderOrder = 4;
  // ---------- zombis (siluetas que cruzan frente a los faros) ----------
  const ZS = [];
  const mkZ = async (name, tex, h, clip) => {
    const g = await L.loadModel(`models/${name}.glb`), r = L.ps1Clone(g.scene);
    if (tex) { const tt = await L.loadTex(tex, 256); tt.flipY = false; tt.needsUpdate = true; r.traverse((o) => { if (o.isMesh) { o.material.map = tt; o.material.color.set(0xffffff); o.material.needsUpdate = true; } }); }
    const w = new THREE.Group(); w.add(r); scene.add(w); r.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(r), k = h / (bb.max.y - bb.min.y); r.scale.multiplyScalar(k); r.position.y = -bb.min.y * k;
    const mx = new THREE.AnimationMixer(r), a = mx.clipAction(THREE.AnimationClip.findByName(g.animations, clip)); a.play();
    let hip = null; r.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; }); const hip0 = hip.position.clone();
    const z = { w, set(t, x, zz, ry) { w.visible = true; w.position.set(x, 0, zz); w.rotation.y = ry; a.time = ((L.q15(t) % a.getClip().duration) + a.getClip().duration) % a.getClip().duration; mx.update(0); hip.position.copy(hip0); } };
    w.visible = false; ZS.push(z); return z;
  };
  const zA = await mkZ('thin-zombie', 'tex/thin_zombie.png', 1.8, 'walk'), zB = await mkZ('city-zombie', null, 1.82, 'Walking'), zC = await mkZ('thin-zombie', 'tex/thin_zombie.png', 1.75, 'walk2');
  // ---------- Ava + props en mano ----------
  const ch = L.hero(); scene.add(ch.root); paintScared(ch);
  const AVA = (x, z, yaw, y = 0) => { ch.root.position.set(x, y, z); ch.root.rotation.y = yaw; };
  const BN = {}; ch.bone.traverse((o) => { if (o.isBone && !BN[o.name]) BN[o.name] = o; });
  const flashlight = await prop('flashlight'); L.holdIn(ch, flashlight, 'R', [0, 0.75, 0.22], [0, 0, Math.PI / 2]); flashlight.visible = false;
  const fBeam = new THREE.SpotLight(0xfff0d0, 0, 12, 0.38, 0.5, 1.2); flashlight.add(fBeam); fBeam.position.set(0.1, 0, 0); const fTgt = new THREE.Object3D(); fTgt.position.set(3, 0, 0); flashlight.add(fTgt); fBeam.target = fTgt;
  const fLens = new THREE.Sprite(new THREE.SpriteMaterial({ map: tGlare, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fLens.scale.set(0.14, 0.14, 1); flashlight.add(fLens); fLens.position.set(0.12 / L.S * 0 + 0.12, 0, 0);
  const keyG = new THREE.Group(); { const mK = lam(null, 0xd8b850); L.mesh(new THREE.TorusGeometry(0.014, 0.005, 5, 10), mK, 0, -0.016, 0, keyG); B(0.008, 0.012, 0.005, mK, 0, 0.002, 0, keyG); B(0.007, 0.05, 0.004, mK, 0, 0.032, 0, keyG); for (const [y, h] of [[0.03, 0.006], [0.04, 0.009], [0.05, 0.005]]) B(h, 0.005, 0.004, mK, 0.006, y, 0, keyG); }   // v2: llave (anilla + hoja dentada)
  keyG.scale.setScalar(2.2); L.holdIn(ch, keyG, 'L', [0, 0.85, 0.12], [Math.PI / 2, 0, 0]); keyG.visible = false;
  const nozzle = new THREE.Group(); { const mN = lam(null, 0x1a1a1a), mY = lam(null, 0xd8c020); B(0.05, 0.12, 0.05, mN, 0, 0, 0, nozzle); B(0.03, 0.03, 0.2, mY, 0, 0.05, 0.1, nozzle); B(0.02, 0.02, 0.12, lam(null, 0x9a9a9a), 0, 0.06, 0.25, nozzle); }
  scene.add(nozzle);
  const HN = 20, hoseSeg = []; for (let i = 0; i < HN - 1; i++) hoseSeg.push(B(0.035, 0.035, 1, lam(null, 0x111114), 0, 0, 0, scene));
  const setHose = (on, a, b) => { hoseSeg.forEach((m) => { m.visible = on; }); if (!on) return; const pts = []; for (let i = 0; i < HN; i++) { const u = i / (HN - 1), p = a.clone().lerp(b, u); p.y -= 0.55 * Math.sin(Math.PI * u); p.z += 0.25 * Math.sin(Math.PI * u); pts.push(p); }
    hoseSeg.forEach((m, i) => { const d = pts[i + 1].clone().sub(pts[i]); m.position.copy(pts[i]).add(pts[i + 1]).multiplyScalar(0.5); m.scale.set(1, 1, d.length() + 0.01); m.lookAt(pts[i + 1]); }); };
  // IK de dos huesos (ep12 v2: sin clip encima, sin temblor) para apoyar una mano en un punto
  const IKQ = {};
  const ik = (sd, target) => {
    const ua = BN['UpperArm' + sd], fa = BN['Forearm' + sd], hb = ch.hand(sd); ch.root.updateMatrixWorld(true);
    const palm = hb.localToWorld(V(0, 0.75, 0)), wr = hb.getWorldPosition(V()), T2 = target.clone().sub(palm.clone().sub(wr));
    const S = ua.getWorldPosition(V()), E = fa.getWorldPosition(V()), l1 = E.distanceTo(S), l2 = wr.distanceTo(E);
    const dS = T2.clone().sub(S), d = Math.min(l1 + l2 - 1e-4, Math.max(Math.abs(l1 - l2) + 1e-4, dS.length())), dir = dS.normalize();
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), es = E.clone().sub(S), perp = es.clone().sub(dir.clone().multiplyScalar(es.dot(dir))).normalize(), E2 = S.clone().add(dir.clone().multiplyScalar(a)).add(perp.multiplyScalar(h));
    const rotB = (bone, from, to) => { const q = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize()), qw = bone.getWorldQuaternion(new THREE.Quaternion()), pw = bone.parent.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pw.invert().multiply(q.multiply(qw))); ch.root.updateMatrixWorld(true); };
    rotB(ua, E.clone().sub(S), E2.clone().sub(S)); const E3 = fa.getWorldPosition(V()), W3 = hb.getWorldPosition(V()); rotB(fa, W3.clone().sub(E3), T2.clone().sub(E3));
    return hb.localToWorld(V(0, 0.75, 0));
  };
  const restoreArm = (sd) => { const k = 'arm' + sd; if (IKQ[k]) { BN['UpperArm' + sd].quaternion.copy(IKQ[k][0]); BN['Forearm' + sd].quaternion.copy(IKQ[k][1]); } };
  const saveArm = (sd) => { IKQ['arm' + sd] = [BN['UpperArm' + sd].quaternion.clone(), BN['Forearm' + sd].quaternion.clone()]; };
  // ---------- estado ----------
  const power = (t) => { if (t < W.flicker - 0.05) return 1; if (t >= W.stops) return 0; const u = (t - W.flicker) * 15 | 0; return [1, 0.1, 1, 0, 0.8, 0, 0, 1, 0, 0.3, 0][u % 11]; };
  const st = ({ t = 0, flash = 0, key = false, hose = false, roofOn = true, hand = 0, bloodK = 0 } = {}) => {
    const pw = power(t); panels.forEach((p) => p.material.color.set(pw > 0.5 ? 0xf4f8ff : 0x30343a)); canL.forEach((l) => { l.intensity = 9 * pw; }); tubes.forEach((m) => m.material.color.set(pw > 0.5 ? 0xf4f8ff : 0x2a2c30));
    glassF.forEach((g) => { g.material = mGlass; }); outFill.intensity = 0;
    flashlight.rotation.set(0, 0, Math.PI / 2);
    flashlight.visible = flash > 0; fBeam.intensity = flash > 0.5 ? 14 : 0; fLens.visible = flash > 0.5; keyG.visible = key; nozzle.visible = hose; setHose(false);
    roof.visible = roofOn; ZS.forEach((z) => { z.w.visible = false; }); handG.visible = hand > 0; blood.visible = false; drop.visible = bloodK > 0 && bloodK < 0.45; puddle.visible = bloodK >= 0.4; { const u = Math.min(1, bloodK / 0.45); drop.position.set(BDX + 0.32, 0.01, BDZ + 0.02 + 0.3 * u); drop.rotation.x = u * 12; puddle.position.set(BDX + 0.32, 0.013, BDZ + 0.32); puddle.scale.setScalar(Math.max(0.05, 0.7 * (bloodK - 0.4) / 0.6)); } HAND.curl(0.25); setMoths(false, t);
    bleaf.rotation.set(0, 0, 0); bknob.rotation.z = 0; sdoor.rotation.y = 0; ch.root.visible = true; amb.intensity = pw > 0.5 ? 0.6 : 0.42;
  };
  const hitK = (t, hits, dur = 0.2) => { let k = 0; for (const h of hits) { const d = t - h; if (d >= 0 && d < dur) k = Math.max(k, (1 - d / dur) * Math.cos(d * 60)); } return k; };
  const FILL = CAR.filler.getWorldPosition(V()).add(V(-0.06, 0, 0));
  const AV1 = V(3.05, 0, 1.55);
  // ---------- 01 gancho: 2 AM, Ava carga nafta (mano izquierda en el pico, apoyado en el tanque); las luces titilan y se cortan ----------
  const fuelPose = (lt, faces) => { restoreArm('L'); AVA(AV1.x, AV1.z, -0.25); ch.pose(lt, L.still('idle', 0.2), faces); if (!IKQ.armL) saveArm('L'); restoreArm('L'); ch.pose(lt, L.still('idle', 0.2), faces);
    const hp = ik('L', FILL.clone().add(V(-0.12, 0.02, 0))); nozzle.visible = true; nozzle.position.copy(hp); nozzle.lookAt(FILL.clone().add(V(0.4, 0, 0))); setHose(true, PUMP.g.position.clone().add(V(0.3, 1.0, 0.3)), hp.clone().add(V(0, -0.02, 0))); };
  { const c = cam(50);
    out['01_hook'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); const cx = o.tctx; if (lt < 2.2) { cx.globalAlpha = Math.min(1, lt / 0.3); bitText(cx, '2:00 AM', 300, 130, 2, '#e8e8e8', { outline: '#000' }); cx.globalAlpha = 1; } },
      update(lt, t) { st({ t, hose: true }); fuelPose(lt, [[-99, 'half', mouthAt(t, 'neutral')], [W.flicker, 'surprised', mouthAt(t, 'neutral')]]);
        PUMP.draw(Math.min(12.4, 6.2 + t * 1.6) * 1, power(t) > 0.5 ? 1 : 0.4); ch.lookAt(c, 0.7, 35);
        look(c, cr([[0, 1.55, 1.35, 4.7], [3, 1.7, 1.33, 4.4]], lt), V(3.1, 1.0, 1.3)); setMoths(power(t) > 0.5, t); } };
  }
  // 01b primer plano del surtidor: el contador se congela en $12.40 cuando se corta la luz
  { const c = cam(40);
    out['01b_pump'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['01b_pump'] + lt; tag(o, c, PUMP.g.position.clone().add(V(0, 1.45, 0.25)), 250, 170, '$12.40', '#ffb030', ease(W.stops - 0.05, W.stops + 0.12, t)); },
      update(lt, t) { st({ t, hose: true }); fuelPose(t - T['01_hook'], [[-99, 'surprised', mouthAt(t, 'neutral')]]); const usd = t < W.stops ? Math.min(12.4, 6.2 + t * 1.6) : 12.4; PUMP.draw(usd, power(t) > 0.5 ? 1 : t >= W.stops ? 0.25 : 0.6);
        look(c, cr([[0, 2.75, 1.55, 1.6], [2, 2.65, 1.52, 1.45]], lt), PUMP.g.position.clone().add(V(0, 1.35, 0.2))); } };
  }
  // 02 manguera muerta: Ava aprieta el pico, nada; medidor del tanque en 1/4
  { const c = cam(46);
    out['02_dead'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['02_dead'] + lt, cx = o.tctx, k = ease(W.quarter - 0.1, W.quarter + 0.1, t);
        if (k > 0) { cx.globalAlpha = k; const X = 268, Y = 160; cx.fillStyle = 'rgba(4,8,16,0.88)'; cx.fillRect(X - 56, Y - 40, 112, 70); cx.strokeStyle = '#e2c62c'; cx.strokeRect(X - 55.5, Y - 39.5, 111, 69);
          cx.strokeStyle = '#e8e8e8'; cx.lineWidth = 2; cx.beginPath(); cx.arc(X, Y + 8, 32, Math.PI * 1.05, Math.PI * 1.95); cx.stroke(); bitText(cx, 'E', X - 34, Y + 4, 1, '#ff4030', { outline: null }); bitText(cx, 'F', X + 34, Y + 4, 1, '#e8e8e8', { outline: null });
          const ang = Math.PI * (1.05 + 0.9 * 0.25); cx.strokeStyle = '#ff7b2e'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(X, Y + 8); cx.lineTo(X + Math.cos(ang) * 28, Y + 8 + Math.sin(ang) * 28); cx.stroke(); bitText(cx, 'TANK 1/4', X, Y + 22, 1, '#e2c62c', { outline: null }); cx.globalAlpha = 1; }
        box2(o, 96, 160, ['HOSE: DEAD'], '#ff4030', ease(W.dead - 0.1, W.dead + 0.1, t), 1); },
      update(lt, t) { st({ t, hose: true }); fuelPose(t - T['01_hook'], [[-99, 'surprised', mouthAt(t, 'frown')], [W.dead, 'sad', mouthAt(t, 'frown')]]); PUMP.draw(12.4, 0.25); ch.lookAt(c, 0.8, 35);
        look(c, cr([[0, 2.55, 1.5, 3.1], [3, 2.6, 1.48, 2.9]], lt), V(3.25, 1.2, 1.3)); } };
  }
  // ---------- 03 entra a la tienda con la linterna (puerta de vidrio que se abre a su paso) ----------
  { const c = cam(52);
    out['03_shop'] = { scene, camera: c, overlay: vign(0.45), update(lt, t) { st({ t, flash: 1 }); const D = T['03b_inv'] - T['03_shop'], u = Math.min(1, lt / D);
        const z = SZ0 + 1.2 - 2.6 * u; AVA(0.0, z, Math.PI); ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.9 })], [[-99, 'half', mouthAt(t, 'neutral')]]);
        sdoor.rotation.y = -1.62 * ease(-0.2, 0.06, u);   // v3: abierta antes de que ella llegue al vano
        look(c, cr([[0, 0.0, 1.5, -11.8], [D, 0.0, 1.48, -11.4]], lt), V(0.0, 1.15, z + 0.3)); ch.lookAt(c, 0.5, 30); } };
  }
  // ---------- 04 corte transversal: la tienda desde arriba sin techo; vidrio (rojo) contra la camara frigorifica (verde) ----------
  { const c = cam(62);
    out['04_xsec'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.3)(lt, dt, a, o); const t = T['04_xsec'] + lt;
        { const cx = o.tctx, P = (x, z) => L.toScreen(c, x, 0.05, z), poly = (pts, col) => { cx.fillStyle = col; cx.beginPath(); pts.forEach(([x, z], i) => { const [sx, sy] = P(x, z); if (i) cx.lineTo(sx, sy); else cx.moveTo(sx, sy); }); cx.closePath(); cx.fill(); };
          const kg = ease(W.glass - 0.1, W.glass + 0.1, t), kc = ease(W.cooler - 0.1, W.cooler + 0.1, t);   // franja roja sobre el vidrio, verde sobre la camara frigorifica
          if (kg > 0) { cx.globalAlpha = 0.45 * kg; poly([[-SX, SZ0 + 0.35], [SX, SZ0 + 0.35], [SX, SZ0 - 0.35], [-SX, SZ0 - 0.35]], '#ff3020'); cx.globalAlpha = 1; }
          if (kc > 0) { cx.globalAlpha = 0.4 * kc; poly([[CX0, CZ0], [CX1, CZ0], [CX1, CZ1], [CX0, CZ1]], '#40e050'); cx.globalAlpha = 1; } }
        tag(o, c, V(-3, 1.5, SZ0), 96, 128, 'GLASS: BREAKS', '#ff4030', ease(W.glass - 0.1, W.glass + 0.1, t)); box2(o, 96, 166, ['THEY SEE YOU'], '#ff4030', ease(W.see - 0.1, W.see + 0.1, t), 1);
        tag(o, c, V(4.3, 1.4, -13.4), 268, 300, '1 DOOR', '#62f05a', ease(W.door4 - 0.1, W.door4 + 0.1, t)); box2(o, 268, 340, ['THICK WALLS', 'NO WINDOWS'], '#62f05a', ease(W.thick - 0.1, W.thick + 0.1, t), 1);
        const k = ease(W.safe - 0.1, W.safe + 0.06, t); if (k > 0) { const cx = o.tctx, sc = 1 + 0.6 * (1 - k); cx.save(); cx.translate(LW / 2 + 30, 540); cx.rotate(-0.08); cx.scale(sc, sc); cx.globalAlpha = k; cx.strokeStyle = '#62f05a'; cx.lineWidth = 3; cx.strokeRect(-92, -17, 184, 34); bitText(cx, 'SAFE ROOM', 0, 0, 2, '#62f05a', { outline: '#021006' }); cx.restore(); cx.globalAlpha = 1; } },
      update(lt, t) { st({ t, flash: 1, roofOn: false }); AVA(0.4, -9.2, Math.PI * 0.9); ch.pose(lt, L.still('idle', 0.4), [[-99, 'open', 'neutral']]); cooler.children[2].visible = false;
        { const h = 17.5 - 0.8 * ease(0, 4, lt); c.up.set(-1, 0, 0); c.position.set(0.1, h, -11.0); c.lookAt(0.1, 0, -11.0); c.updateProjectionMatrix(); } },   // cenital girado: el largo de la tienda va a lo alto del cuadro 9:16
      fx: null };
  }
  // (SQ: fotograma del clip squat en el punto mas bajo)
  // ---------- 05 agachada tras el mostrador; siluetas cruzan frente a los faros del auto abandonado; "Flashlight off" ----------
  { const c = cam(54);
    out['05_low'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['05_low'] + lt; box2(o, LW / 2, 200, ['SEEN FROM THE ROAD'], '#ff7b2e', ease(W.road - 0.1, W.road + 0.1, t), 1); },
      update(lt, t) { st({ t, flash: t < W.off ? 1 : 0.2 }); cooler.children[2].visible = true;
        AVA(-3.6, -9.6, Math.PI); ch.pose(lt, L.still('sit_floor', 9), [[-99, 'scared', mouthAt(t, 'neutral')]]);
        glassF.forEach((g) => { g.material = mGlassClear; }); outFill.intensity = 7; const T5 = T['05_low']; [[zA, -1.2], [zB, 0.2], [zC, 1.5]].forEach(([z, d], i) => { const u = (t - T5 - d) / 4.5; if (u < -0.05 || u > 1.05) return; z.set(t, -8.0 + 7.5 * u, -1.0 + i * 0.3, Math.PI / 2); z.w.scale.setScalar(1.3); });   // cruzan justo delante de los faros
        look(c, cr([[0, -2.55, 1.75, -11.1], [4, -2.6, 1.72, -10.95]], lt), V(-3.7, 0.9, 3)); fLens.visible = false; } };
  }
  const SQ = Number(L.QS.get('sq') ?? 1.0);
  // 05b la cara: agachada de espaldas al mostrador, apaga la linterna
  { const c = cam(46);
    out['05b_off'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['05b_off'] + lt; box2(o, LW / 2, 140, ['LIGHT OFF', 'STAY LOW', 'DON\'T MOVE'], '#4fd6ff', ease(W.off - 0.1, W.off + 0.1, t), 1); },
      update(lt, t) { st({ t, flash: t < W.off ? 1 : 0.2 }); AVA(-3.6, -9.6, Math.PI); ch.pose(lt, L.still('sit_floor', 9), [[-99, 'scared', mouthAt(t, 'neutral')], [W.off, 'half', mouthAt(t, 'neutral')]]);
        ch.lookAt(c, 0.7, 35); look(c, cr([[0, -3.3, 0.85, -11.0], [3, -3.35, 0.83, -10.9]], lt), V(-3.6, 0.62, -9.3)); } };
  }
  // ---------- 06 golpes desde el bano cerrado (solo la puerta se mueve) ----------
  const KN = () => [W.knocks - 0.05, W.knocks + 0.22, W.knocks + 0.5, W.bathroom + 0.3];
  const knockDoor = (t) => { const k = hitK(t, KN(), 0.16); bleaf.rotation.y = 0.012 * Math.abs(k); bknob.rotation.z = 0.15 * k; };
  { const c = cam(70);
    out['06_knock'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['06_knock'] + lt; tag(o, c, V(BDX + 0.3, 1.0, BDZ), 290, 250, 'LOCKED', '#ff7b2e', ease(W.bathroom - 0.1, W.bathroom + 0.1, t)); },
      update(lt, t) { st({ t, flash: 0.2 }); knockDoor(t); AVA(-2.5, -13.6, -2.36); ch.pose(lt, L.still('idle', 0.3), [[-99, 'scared', mouthAt(t, 'neutral')]]);   // v3: linterna apagada, colgando al costado (sin IK)
        ch.lookAt({ position: V(BDX, 1.05, BDZ) }, 1, 70);
        look(c, cr([[0, -5.4, 1.45, -12.4], [3, -5.3, 1.43, -12.5]], lt), V(-3.0, 1.1, -13.9)); } };
  }
  // 07 el desconocido habla tras la puerta (primer plano de la cerradura, la puerta tiembla con su voz)
  { const c = cam(42);
    out['07_voice'] = { scene, camera: c, overlay: vign(0.55), update(lt, t) { st({ t, flash: 0.2 }); const k = hitK(t, [W.please - 0.05, W.cut7 - 0.1], 0.18); bleaf.rotation.y = 0.01 * Math.abs(k); gapLight.material.opacity = 0.0;
        const rat = (t > W.please - 0.1 && t < W.please + 0.5) || (t > W.cut7 - 0.2 && t < W.cut7 + 0.7); bknob.rotation.z = rat ? 0.22 * Math.sin(L.q15(t) * 47) : 0;   // v2: el picaporte traquetea
        const D7 = T['08_hand'] - T['07_voice']; look(c, cr([[0, BDX + 0.95, 1.2, BDZ + 1.45], [D7, BDX + 0.6, 1.05, BDZ + 0.55]], lt), V(BDX + 0.3, 1.0, BDZ)); } };
  }
  // 08 la mano vendada sale por la ranura (plano bajo, al ras del piso)
  { const c = cam(46);
    out['08_hand'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['08_hand'] + lt; tag(o, c, handG.position.clone().add(V(0, 0.03, -0.1)), 264, 330, 'BANDAGE', '#e8e0c8', ease(W.bandage - 0.1, W.bandage + 0.1, t)); },
      update(lt, t) { st({ t, flash: 0.2, hand: 1 }); const u = ease(W.hand - 0.2, W.hand + 1.0, t); handG.position.set(BDX + 0.1, 0.004, BDZ - 0.18 + 0.4 * u); handG.rotation.y = 0.15; HAND.curl(0.2 + 0.35 * Math.max(0, Math.sin(L.q15(t) * 2.6)) * ease(W.hand + 0.8, W.hand + 1.2, t));
        look(c, cr([[0, BDX + 0.42, 0.24, BDZ + 0.85], [3, BDX + 0.38, 0.22, BDZ + 0.75]], lt), V(BDX + 0.1, 0.03, BDZ + 0.18)); } };
  }
  // 09 una gota de sangre sale despues; Ava con la llave en la mano duda -> "Oh, fudge"
  { const c = cam(46);
    out['09_blood'] = { scene, camera: c, overlay: vign(0.5), update(lt, t) { st({ t, flash: 0.2, hand: 1, bloodK: ease(W.drop - 0.15, W.drop + 1.6, t) }); handG.position.set(BDX + 0.1, 0.004, BDZ + 0.22); handG.rotation.y = 0.15; HAND.curl(0.45);
        look(c, cr([[0, BDX + 0.75, 0.38, BDZ + 0.95], [3, BDX + 0.7, 0.36, BDZ + 0.85]], lt), V(BDX + 0.25, 0.03, BDZ + 0.25)); } };
  }
  { const c = cam(46);
    out['09b_key'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['09b_key'] + lt; ch.root.updateMatrixWorld(true); box2(o, 92, 540, ['BITE?', 'OR A CUT?'], '#ff4030', ease(W.cuts - 0.3, W.cuts, t), 2); },
      update(lt, t) { st({ t, flash: 0.2, key: true, hand: 1, bloodK: 1 }); handG.position.set(BDX + 0.1, 0.004, BDZ + 0.24);
        AVA(-2.9, -12.6, Math.PI + 0.4); restoreArm('L'); ch.pose(lt, L.still('idle', 0.3), [[-99, 'scared', mouthAt(t, 'neutral')], [W.fudge - 0.05, 'shocked', mouthAt(t, 'surprised')], [W.fudge + 0.9, 'scared', 'neutral']]); if (!IKQ.armL) saveArm('L'); restoreArm('L'); ch.pose(lt, L.still('idle', 0.3), [[-99, 'scared', mouthAt(t, 'neutral')], [W.fudge - 0.05, 'shocked', mouthAt(t, 'surprised')], [W.fudge + 0.9, 'scared', 'neutral']]);
        { ch.root.updateMatrixWorld(true); const cb = BN.Chest.getWorldPosition(V()), fw = V(Math.sin(ch.root.rotation.y), 0, Math.cos(ch.root.rotation.y)), rt = V(Math.cos(ch.root.rotation.y), 0, -Math.sin(ch.root.rotation.y)); ik('L', cb.add(fw.multiplyScalar(0.22)).add(rt.multiplyScalar(0.04)).add(V(0, -0.02, 0))); }   // v3: llave quieta frente al pecho (IK a un punto fijo del cuerpo, sin clip)
        ch.lookAt({ position: V(BDX + 0.3 * Math.sin(L.q15(lt) * 0.6), 1.2, BDZ) }, 0.8, 40); look(c, cr([[0, -3.55, 1.45, -13.85], [3, -3.5, 1.43, -13.75]], lt), V(-2.95, 1.3, -12.6)); } };
  }
  const qv = (k, d) => (L.QS.get(k) ?? d).split(',').map(Number);
  const FA = qv('fa', '-2.0,-14.4'), FC0 = qv('fc0', '-4.0,1.35,-11.5'), FC1 = qv('fc1', '-3.95,1.35,-11.65'), FT = qv('ft', '-2.65,1.5,-14.6');
  // ---------- 10 menu RE vivo: Ava de cuerpo entero mirando la puerta del bano, llave en la mano; UNLOCK IT / LEAVE IT LOCKED ----------
  { const c = cam(75), RED = '#ff5a4a', WHITE = '#f0f0f0';
    const left = (cx, s, x, y, sc, col, o2) => bitText(cx, s, x + textWidth(s, sc) / 2, y, sc, col, o2);
    const fit = (s, maxW, scs = [3, 2, 1]) => scs.find((sc) => textWidth(s, sc) <= maxW) ?? 1;
    out['10_choice'] = { scene, camera: c, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T['10_choice'] + lt; vign(0.5)(lt, dt, a, o);
      const kp = L.clamp01(lt / 0.2), PX = 8, PW = 344, PY = 40, IN = 12;
      const q = 'WOULD YOU UNLOCK IT?', opts = [['1. UNLOCK IT', W.unlock, RED], ['2. LEAVE IT LOCKED', W.leave, WHITE]], X0 = PX + IN + 16, XR = PX + PW - IN;
      const qs = fit(q, PW - 2 * IN), osc = Math.min(...opts.map(([s]) => fit(s, XR - X0))), cs = fit('COMMENT 1 OR 2', PW - 2 * IN, [2, 1]), fs = fit('PART 1 - FOLLOW FOR PART 2!', PW - 2 * IN, [2, 1]);
      const rows = [[PY + 16 + qs * 5, qs], [0, osc], [0, osc], [0, cs], [0, fs]]; let y = rows[0][0] + qs * 5 + 18; for (let i = 1; i < rows.length; i++) { rows[i][0] = y + rows[i][1] * 5; y = rows[i][0] + rows[i][1] * 5 + (i === 2 ? 22 : 14); }
      const PH = y - PY + 4;
      cx.globalAlpha = kp; cx.fillStyle = 'rgba(4,8,18,0.86)'; cx.fillRect(PX, PY, PW, PH);
      px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
      bitText(cx, q, LW / 2, rows[0][0], qs, '#ececec', { outline: '#000000' });
      const sel = t >= W.leave ? 1 : t >= W.unlock ? 0 : -1;
      opts.forEach(([s, tw2, col], i) => { const yy = rows[1 + i][0]; left(cx, s, X0, yy, osc, i === sel ? col : '#8a8a8a', { outline: '#000000' });
        if (i === sel) { const on = Math.floor((t - tw2) * 4) % 2 === 0, x0 = PX + IN; for (let k = 0; k < 8; k++) px(cx, x0 + k, yy - 8 + k, on ? '#ffe048' : '#c89a20', 1, 17 - 2 * k); } });
      if (t >= W.comment) { const b = Math.round(2 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, rows[3][0] + b, cs, '#ffd23f', { outline: '#000000' }); }
      if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'PART 1 - FOLLOW FOR PART 2!', LW / 2, rows[4][0], fs, '#ececec', { outline: '#000000' }); cx.globalAlpha = 1;
    }, update(lt, t) {
      st({ t, flash: 0.2, key: true, hand: 1, bloodK: 1 }); handG.position.set(BDX + 0.1, 0.004, BDZ + 0.24);
      AVA(FA[0], FA[1], Math.atan2(BDX + 0.45 - FA[0], BDZ - FA[1]) + 0.45); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.7 })], [[-99, 'scared', 'neutral']]); ch.lookAt({ position: V(BDX, 1.3, BDZ) }, 0.9, 50);
      look(c, cr([[0, ...FC0], [7, ...FC1]], lt), V(FT[0], FT[1], FT[2]));
    } };
  }
  void PO; void moon; void mRed; void glassF; void water; void glares;
  return out;
}
