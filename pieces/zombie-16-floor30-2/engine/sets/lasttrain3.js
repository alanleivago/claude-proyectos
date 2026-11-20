// sets/lasttrain3.js — ep15 "CHOOSE: You Stayed On The Last Train… - Part 3" (gramatica del reel "Subway" de play.malo:
// etiquetas 1 LEAVE / 2 STAY, hoja NIGHT SHIFT con reglas, rebobinado glitch, pantalla de cuenta regresiva, final abierto).
// Reusa del ep9 (zombie-09-subway2/engine/sets/subway2.js): el tunel desconocido (ladrillo, lamparas rojas), el vagon foto->loft
// con su interior en codigo, la pantalla, la criatura de dos ojos con la sonrisa demasiado ancha, la hoja FILE y el rebobinado.
// Nuevo: cabina del conductor (puerta entreabierta, palanca con cinta, consola, First Aid Spray), tren sin conductor que acelera
// y cambia de via, freno con las manos de Ava en la palanca (IK de 2 huesos como el ep14), tercer riel con cartel 600 V, salida de
// emergencia con hierba verde, pantalla YOU BROKE RULE 3 — 10. Tiempos: cues.json (voz/build_cues.py).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { paintScared } from './avaface.js';
import { makeSpray } from './respray.js';

export async function shots({ L, TL, youDied, hud }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.1, 260);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateProjectionMatrix(); };
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  const glb = async (n) => (await L.loadModel(`models/${n}.glb`)).scene;
  const prop = async (n) => L.ps1Clone(await glb(n));
  const PO = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 };
  const lerp3 = (a, b, k) => a.clone().lerp(b, k);
  // muchas cajas iguales en una sola malla (traviesas, rieles): una llamada de dibujo
  const mergeBoxes = (list, m, parent) => {
    const P = [], N = [], U = [];
    for (const [w, h, d, x, y, z, ry = 0] of list) { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); if (ry) g.rotateY(ry); g.translate(x, y, z); P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); U.push(...g.attributes.uv.array); g.dispose(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    const o = new THREE.Mesh(g, m); parent.add(o); return o; };

  // ================= movimiento del tren (sin conductor): parado en s=140 (fin de la parte 2), acelera tras cerrar las puertas,
  // cambia de via, Ava tira del freno en 'pull' y para en 'stops' =================
  const S0 = 140, TA = W.close + 0.55, TBK = W.pull + 0.1, TSTOP = W.stops + 0.35, ACC = 7.0, VMAX = 21;
  const DT = 1 / 120, STAB = []; { let s = S0, v = 0, vB = null; for (let t = TA; t < CUE.END + 1; t += DT) {
    if (t < TBK) v = Math.min(VMAX, v + ACC * DT); else { if (vB === null) vB = v; v = Math.max(0, vB * (1 - (t - TBK) / (TSTOP - TBK))); }
    s += v * DT; STAB.push(s); } }
  const sAt = (t) => t <= TA ? S0 : STAB[Math.min(STAB.length - 1, Math.floor((t - TA) / DT))];
  const vAt = (t) => (sAt(t + 0.05) - sAt(t - 0.05)) / 0.1;
  const SW = Math.round(sAt(T['06c_speed'] + 1.15)), SEND = Math.ceil(sAt(CUE.END) + 70);   // segundo cambio de via, delante del tren en 06c
  const XS = (s) => s < 112 ? 4.6 * L.smooth((s - 100) / 24) : s < SW ? 4.6 * L.smooth((s - 100) / 24) : 4.6 * (1 - L.smooth((s - SW) / 24));
  const SSTOP = sAt(CUE.END);

  // ================= el tunel (ep9 + extension) =================
  const BG = 0x050406;
  const sT = new THREE.Scene(); sT.background = new THREE.Color(BG); sT.fog = new THREE.Fog(BG, 10, 70);
  const hemT = new THREE.HemisphereLight(0x8890a8, 0x2a2420, 0.85); sT.add(hemT);
  const tConc = L.cvs(32, 32, (c) => { const r = L.rng(12); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 22 + (y % 16 === 0 ? -18 : 0); px(c, x, y, `rgb(${70 + n},${70 + n},${68 + n})`); } for (let k = 0; k < 5; k++) px(c, r() * 32 | 0, 0, 'rgba(30,26,20,0.4)', 1, 32); });
  const tBrick = L.cvs(32, 32, (c) => { px(c, 0, 0, '#2a1a14', 32, 32); const r = L.rng(66); for (let y = 0; y < 32; y += 4) for (let x = (y / 4) % 2 ? -4 : 0; x < 32; x += 8) { const n = r() * 30 | 0; px(c, x + 1, y + 1, `rgb(${110 + n},${52 + n / 2},${36})`, 7, 3); } for (let k = 0; k < 40; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(10,8,6,0.5)', 1 + r() * 3 | 0, 1); });
  const tBed = L.cvs(32, 32, (c) => { const r = L.rng(41); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 30; px(c, x, y, `rgb(${40 + n},${36 + n},${32 + n})`); } });
  const TZ0 = 40, TZ1 = -SEND, SU = 118, XL = -2.7, XR = 7.3, BED = -1.12, TIE = -1.04;
  const mRail = lam(null, 0xa0a0a8), mTie = lam(null, 0x5a4634);
  const wallSeg = (tex, z0, z1, rep) => { const l = z0 - z1, zc = (z0 + z1) / 2;
    B(0.2, 5.4, l, lam(L.rep(tex, l / rep, 3)), XL, 1.6, zc, sT); B(0.2, 5.4, l, lam(L.rep(tex, l / rep, 3)), XR, 1.6, zc, sT); B(XR - XL, 0.2, l, lam(L.rep(tex, l / rep, 3), 0x8a8a8a), (XL + XR) / 2, 4.3, zc, sT); };
  wallSeg(tConc, TZ0, -SU, 4); for (let z = -SU; z > TZ1; z -= 100) wallSeg(tBrick, z, Math.max(TZ1, z - 100), 2);
  B(XR - XL, 0.05, TZ0 - TZ1, lam(L.rep(tBed, 10, (TZ0 - TZ1) / 1.3)), (XL + XR) / 2, BED, (TZ0 + TZ1) / 2, sT);
  { const rails = [], ties = [];
    for (const xc of [0, 4.6]) { for (const dx of [-0.72, 0.72]) rails.push([0.08, 0.14, TZ0 - TZ1, xc + dx, -1.03, (TZ0 + TZ1) / 2]); for (let z = TZ0; z > TZ1; z -= 0.9) ties.push([2.6, 0.08, 0.24, xc, -1.08, z]); }
    for (const [a, b] of [[96, 130], [SW - 4, SW + 28]]) for (let s = a; s < b; s += 0.5) { const x = XS(s), x2 = XS(s + 0.5), yaw = Math.atan2(x2 - x, 0.5); for (const dx of [-0.72, 0.72]) rails.push([0.08, 0.14, 0.52, x + dx, -1.02, -s - 0.25, yaw]); }
    mergeBoxes(rails, mRail, sT); mergeBoxes(ties, mTie, sT); }
  // agujas del segundo cambio (puntas que brillan) + senal
  const sigRed = L.basic(null, 0xff2a1a, { fog: false }), sigGrn = L.basic(null, 0x2aff5a, { fog: false }), sigOff = lam(null, 0x1a1a1a);
  const sig = new THREE.Group(); sig.position.set(XL + 0.3, 1.4, -SW + 6); sT.add(sig); B(0.2, 0.55, 0.18, lam(null, 0x141414), 0, 0, 0, sig); B(0.06, 2.6, 0.06, lam(null, 0x2a2a2a), 0, -1.5, 0, sig);
  const sTop = B(0.1, 0.1, 0.03, sigRed, 0, 0.12, 0.1, sig), sBot = B(0.1, 0.1, 0.03, sigOff, 0, -0.12, 0.1, sig);
  B(0.5, 0.3, 0.3, lam(null, 0x3a3a30), 5.6, -0.95, -SW - 1, sT); B(0.12, 0.5, 0.12, lam(null, 0xd0b020), 5.6, -0.6, -SW - 1, sT);   // motor de agujas
  // agujas: dos rieles moviles (talon fijo a 5,5 m, punta en s = SW) que se corren en 06c; varilla del motor que empuja
  const blades = []; for (const dx of [-0.72, 0.72]) { const pv = new THREE.Group(); pv.position.set(4.6 + dx + (dx < 0 ? 0.09 : -0.09), -1.0, -SW - 5.5); sT.add(pv); B(0.07, 0.12, 5.5, lam(null, 0xd8d8de), 0, 0, 2.75, pv); B(0.11, 0.03, 1.2, L.basic(null, 0xffd23f), 0, 0.075, 4.9, pv); blades.push(pv); }
  const rod = B(1.3, 0.05, 0.05, lam(null, 0xd0b020), 5.0, -0.97, -SW - 1, sT);
  const setPoints = (k) => { blades.forEach((b) => { b.rotation.y = -0.05 * k; }); rod.position.x = 5.0 - 0.27 * k; };
  // lamparas: blancas en el tunel normal, rojas enjauladas en el desconocido
  const mLampW = L.basic(null, 0xf0f0e0), mLampR = L.basic(null, 0xff4a1a, { fog: false }), mCage = lam(null, 0x1a1410);
  { const lr = [], cg = [], lw = []; for (let z = TZ0; z > TZ1; z -= 10) { const red = z < -SU; for (const x of [XL + 0.12, XR - 0.12]) { (red ? lr : lw).push([0.06, 0.12, 0.3, x, 2.6, z]); if (red) cg.push([0.08, 0.16, 0.1, x, 2.6, z]); } }
    mergeBoxes(lr, mLampR, sT); mergeBoxes(lw, mLampW, sT); mergeBoxes(cg, mCage, sT); }
  const redLs = []; for (const z of [-128, -142, -156]) { const p = new THREE.PointLight(0xff4a1a, 5, 13, 1.4); p.position.set(XL + 0.6, 2.4, z); sT.add(p); redLs.push(p); const p2 = p.clone(); p2.position.x = XR - 0.6; sT.add(p2); redLs.push(p2); }
  const tSign = L.cvs(96, 20, (c) => { px(c, 0, 0, '#d8d0b8', 96, 20); px(c, 0, 0, '#1a1a18', 96, 2); px(c, 0, 18, '#1a1a18', 96, 2); c.fillStyle = '#1a1a18'; c.font = 'bold 13px monospace'; c.textBaseline = 'middle'; c.fillText('ASH    OVE', 6, 11);
    const r = L.rng(21); for (let k = 0; k < 160; k++) px(c, r() * 96 | 0, r() * 20 | 0, `rgba(${90 + r() * 40 | 0},50,20,${0.3 + r() * 0.5})`, 1 + r() * 3 | 0, 1); px(c, 30, 4, '#5a3a20', 22, 12); });
  L.plane(2.6, 0.54, L.lam(tSign), XL + 0.11, 1.9, -146, sT, Math.PI / 2); L.plane(2.6, 0.54, L.lam(tSign), XR - 0.11, 1.9, -137, sT, -Math.PI / 2);
  // cables en las paredes (detalle) y manchas de agua
  { const cb = []; for (const x of [XL + 0.14, XR - 0.14]) for (const y of [3.2, 3.32, 3.5]) cb.push([0.05, 0.05, TZ0 - TZ1, x, y, (TZ0 + TZ1) / 2]); mergeBoxes(cb, lam(null, 0x15130f), sT); }

  // ---------- tercer riel (lado de la pared derecha, x=6.0) con tablon protector y carteles DANGER 600 V ----------
  const tWarn = L.cvs(48, 24, (c) => { px(c, 0, 0, '#e8c020', 48, 24); px(c, 0, 0, '#1a1a18', 48, 2); px(c, 0, 22, '#1a1a18', 48, 2); c.fillStyle = '#1a1a18'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DANGER', 24, 8); c.font = 'bold 9px monospace'; c.fillText('600 V', 24, 17);
    c.beginPath(); c.moveTo(5, 5); c.lineTo(9, 5); c.lineTo(6, 11); c.lineTo(10, 11); c.lineTo(4, 20); c.lineTo(6, 13); c.lineTo(3, 13); c.fill(); });
  const tWarnWall = L.cvs(64, 40, (c) => { px(c, 0, 0, '#e8c020', 64, 40); px(c, 2, 2, '#1a1a18', 60, 1); c.fillStyle = '#1a1a18'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DANGER', 32, 9); c.fillText('THIRD RAIL', 32, 20); c.font = 'bold 11px monospace'; c.fillText('600 V', 32, 32); const r = L.rng(5); for (let k = 0; k < 60; k++) px(c, r() * 64 | 0, r() * 40 | 0, 'rgba(70,50,20,0.35)', 1 + r() * 3 | 0, 1); });
  const R3X = 6.0, R3A = 126, R3B = SW - 3;
  { const rl = [], br = [], cv = []; rl.push([0.1, 0.1, R3B - R3A, R3X, -0.92, -(R3A + R3B) / 2]); cv.push([0.36, 0.04, R3B - R3A, R3X + 0.02, -0.8, -(R3A + R3B) / 2]);
    for (let s = R3A; s < R3B; s += 2.7) { br.push([0.08, 0.32, 0.08, R3X + 0.16, -0.96, -s]); br.push([0.2, 0.05, 0.1, R3X + 0.06, -0.86, -s]); }
    mergeBoxes(rl, lam(null, 0x6a6460), sT); mergeBoxes(br, lam(null, 0x2a2622), sT); mergeBoxes(cv, lam(null, 0x4a3a2a), sT); }
  for (let s = R3A + 6; s < R3B; s += 14) { L.plane(0.42, 0.21, lam(tWarn, 0xffffff, PO), R3X + 0.02, -0.775, -s, sT, 0, -Math.PI / 2); L.plane(0.7, 0.44, lam(tWarnWall), XR - 0.11, 0.2, -s - 3, sT, -Math.PI / 2); }

  // ---------- salida de emergencia en la pared derecha cerca de donde para el tren: puerta verde, EXIT encendido, hierba verde ----------
  const exitG = new THREE.Group(); sT.add(exitG); exitG.position.set(XR - 0.1, TIE, -SSTOP + 2.0);
  { const tDoor = L.cvs(32, 64, (c) => { px(c, 0, 0, '#2a5a3a', 32, 64); px(c, 0, 0, '#3a7a4e', 32, 2); px(c, 2, 30, '#c8c8b0', 6, 3); const r = L.rng(9); for (let k = 0; k < 70; k++) px(c, r() * 32 | 0, r() * 64 | 0, 'rgba(20,30,20,0.4)', 1 + r() * 2 | 0, 1); px(c, 4, 6, '#1e4a2e', 24, 20); px(c, 4, 36, '#1e4a2e', 24, 22); });
    B(0.12, 2.3, 1.3, lam(null, 0x5a5a56), -0.02, 1.15 + 0.08, 0, exitG); L.plane(1.0, 2.0, lam(tDoor), -0.1, 1.08, 0, exitG, -Math.PI / 2);
    B(0.5, 0.18, 1.6, lam(null, 0x5a5650), -0.25, 0.09, 0, exitG);   // escalon de concreto
    const tEx = L.cvs(48, 16, (c, w, h) => { px(c, 0, 0, '#0a6a2a', w, h); px(c, 1, 1, '#22a04a', w - 2, 1); c.fillStyle = '#f4fff4'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', w / 2 - 6, h / 2 + 1); c.fillRect(37, 6, 6, 3); c.beginPath(); c.moveTo(43, 3); c.lineTo(47, 7.5); c.lineTo(43, 12); c.fill(); });
    L.plane(0.9, 0.3, L.basic(tEx, 0xffffff, { fog: false }), -0.13, 2.45, 0, exitG, -Math.PI / 2);
    const gl = new THREE.PointLight(0x40ff70, 4, 6, 1.4); gl.position.set(-0.8, 2.2, 0); exitG.add(gl); exitG.userData.glow = gl;
    const tLeaf = L.cvs(16, 16, (c) => { c.fillStyle = '#2e8a2a'; c.beginPath(); c.ellipse(8, 9, 4, 7, 0, 0, 7); c.fill(); px(c, 8, 3, '#1a5a18', 1, 12); px(c, 6, 6, '#5ac04a', 1, 2); px(c, 10, 9, '#5ac04a', 1, 2); });
    const tPot = L.cvs(16, 16, (c) => { px(c, 0, 0, '#b0603a', 16, 16); px(c, 0, 0, '#d07a4a', 16, 3); px(c, 0, 13, '#7a3e22', 16, 3); });
    const herb = new THREE.Group(); herb.position.set(-0.35, 0.18, 0.55); exitG.add(herb); exitG.userData.herb = herb;
    L.mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.2, 8), lam(tPot), 0, 0.1, 0, herb); L.mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.02, 8), lam(null, 0x3a2614), 0, 0.19, 0, herb);
    for (let k = 0; k < 9; k++) { const lf = L.plane(0.12, 0.2, lam(tLeaf, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide }), Math.cos(k * 2.4) * 0.05, 0.28 + (k % 3) * 0.05, Math.sin(k * 2.4) * 0.05, herb, k * 0.9, -0.35); lf.rotation.order = 'YXZ'; } }

  // ================= vagones (GLB foto->loft) + interior en codigo con CABINA =================
  const carG = await glb('subway_car');
  const tInt = L.cvs(48, 72, (c, w, h) => {
    px(c, 0, 0, '#cfd8c8', w, h); px(c, 0, 0, '#f4fbee', w, 4); px(c, 0, 4, '#9aa298', w, 1);
    for (const x of [3, 26]) { px(c, x, 8, '#d8c060', 19, 7); px(c, x + 2, 10, '#3a3020', 12, 1); px(c, x + 2, 12, '#3a3020', 8, 1); }
    for (const x of [3, 26]) { px(c, x, 18, '#14181e', 19, 16); px(c, x, 18, '#3a4048', 19, 1); px(c, x + 3, 22, '#202830', 5, 8); }
    px(c, 0, 38, '#8a9088', w, 4); for (let x = 0; x < w; x += 8) { px(c, x, 42, '#2f56a8', 7, 9); px(c, x, 42, '#4a72c8', 7, 2); }
    px(c, 0, 51, '#1e2e5e', w, 3); px(c, 0, 54, '#6a7068', w, 18); for (let y = 56; y < h; y += 4) px(c, 0, y, '#5a6058', w, 1);
    for (const x of [11, 36]) { px(c, x, 0, '#e8ece8', 2, 54); px(c, x + 2, 0, '#8a908a', 1, 54); } px(c, 0, 16, '#c0c4c0', w, 1); });
  const tGlow = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.35, 'rgba(255,240,190,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const mkCar = () => {
    const root = L.ps1Clone(carG); const g = new THREE.Group(); g.add(root); const doors = [];
    root.traverse((o) => { if (o.isMesh && /^door_L/.test(o.name)) doors.push(o); });
    doors.forEach((d) => { d.userData.z0 = d.position.z; d.userData.dir = /a$/.test(d.name) ? 1 : -1; });
    const pics = []; for (const Y of [2.6, 6.4, 10.2, 14.0]) pics.push(L.plane(1.28, 2.0, L.basic(tInt), -1.537, 1.5, -Y, g, -Math.PI / 2));
    const lamps = []; for (const x of [-0.61, 0.85]) lamps.push(L.plane(1.1, 1.1, L.basic(tGlow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), x, 0.94, 0.03, g));
    const setDoors = (k) => doors.forEach((d) => { d.position.z = d.userData.z0 + d.userData.dir * 0.6 * k; });
    return { g, root, setDoors, lamps, pics };
  };
  const tWallI = L.cvs(32, 32, (c) => { px(c, 0, 0, '#d8d2bc', 32, 32); const r = L.rng(91); for (let k = 0; k < 60; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(120,110,80,0.25)'); px(c, 0, 0, '#bcb59e', 32, 1); px(c, 15, 0, '#c4bda6', 1, 32); for (let k = 0; k < 6; k++) px(c, 3 + k * 5, 28, '#a8a28c', 1, 1); });
  const tFloorI = L.cvs(32, 32, (c) => { px(c, 0, 0, '#5a6062', 32, 32); const r = L.rng(17); for (let k = 0; k < 140; k++) { const v = 70 + r() * 50 | 0; px(c, r() * 32 | 0, r() * 32 | 0, `rgb(${v},${v + 4},${v + 6})`); } for (let y = 0; y < 32; y += 8) px(c, 0, y, '#4a5052', 32, 1); });
  const tSeat = L.cvs(32, 16, (c) => { px(c, 0, 0, '#2f56a8', 32, 16); for (let x = 0; x < 32; x += 8) { px(c, x, 0, '#1e3a78', 1, 16); px(c, x + 1, 1, '#4a72c8', 6, 2); } const r = L.rng(5); for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 16 | 0, 'rgba(10,20,50,0.35)'); });
  const tCeil = L.cvs(32, 32, (c) => { px(c, 0, 0, '#c8ccc4', 32, 32); for (let x = 0; x < 32; x += 8) px(c, x, 0, '#a8aca4', 1, 32); const r = L.rng(3); for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(90,90,80,0.3)'); });
  const tDoorI = L.cvs(16, 32, (c) => { px(c, 0, 0, '#9aa0a4', 16, 32); px(c, 0, 0, '#b8bec2', 16, 1); px(c, 0, 0, '#b8bec2', 1, 32); px(c, 15, 0, '#6a7074', 1, 32); px(c, 2, 26, '#e8c020', 12, 2); const r = L.rng(4); for (let k = 0; k < 14; k++) px(c, r() * 16 | 0, r() * 32 | 0, 'rgba(60,60,60,0.35)'); });
  const ADS = [['#c83a2a', 'COLD?', 'TRY HOT SOUP'], ['#2a7ac8', 'NIGHT SCHOOL', 'ENROLL NOW'], ['#e0b020', 'LOST?', 'ASK STAFF'], ['#3a9a4a', 'MERCY LINE', 'MAP 24/7']];
  const tAds = ADS.map(([bg, a, b]) => L.cvs(64, 20, (c) => { px(c, 0, 0, bg, 64, 20); px(c, 0, 0, 'rgba(255,255,255,0.3)', 64, 1); c.fillStyle = '#f8f4e8'; c.font = 'bold 8px monospace'; c.textBaseline = 'middle'; c.fillText(a, 3, 6); c.font = '6px monospace'; c.fillText(b, 3, 14); }));
  const DZ = [-2.6, -6.4, -10.2, -14.0], SEGS = [[-0.2, -1.96], [-3.24, -5.76], [-7.04, -9.56], [-10.84, -13.36], [-14.64, -15.3]];
  const FY = 0.5, CY = 2.95, PZ = -1.95;   // PZ = mampara de la cabina
  const carT1 = mkCar(), carT2 = mkCar(); sT.add(carT1.g, carT2.g);
  const g = new THREE.Group(); carT1.g.add(g); g.visible = false;   // interior del vagon 1 (coordenadas del vagon: frente z=0, piso y=0.5)
  const mW = lam(tWallI), mGlass = L.basic(null, 0x0a1018, { transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }), mFrame = lam(null, 0x6a7074), mPole = lam(null, 0xd8dce0);
  const mSeat = lam(L.rep(tSeat, 4, 1)), mBase = lam(null, 0x3a4048);
  B(2.96, 0.04, 15.2, lam(L.rep(tFloorI, 3, 15)), 0, FY - 0.02, -7.75, g);
  B(2.96, 0.04, 15.2, lam(L.rep(tCeil, 3, 15)), 0, CY + 0.02, -7.75, g);
  const stripOn = L.basic(null, 0xf6faee), stripOff = lam(null, 0x3a3c3a), strips = [];
  for (const x of [-0.55, 0.55]) for (let z = -2.9; z > -15; z -= 1.9) strips.push(B(0.16, 0.03, 1.6, stripOn, x, CY - 0.015, z, g));
  for (const s of [-1, 1]) {
    for (const [z1, z2] of SEGS) {
      const len = z1 - z2, zc = (z1 + z2) / 2;
      B(0.06, 0.95, len, mW, s * 1.5, FY + 0.475, zc, g); B(0.06, 0.7, len, mW, s * 1.5, 2.6, zc, g);
      L.plane(len, 0.8, mGlass, s * 1.53, 1.85, zc, g, Math.PI / 2);
      for (const z of [z1 - 0.03, z2 + 0.03, zc]) B(0.08, 0.8, 0.05, mFrame, s * 1.5, 1.85, z, g);
      if (len > 1.5 && z1 < -1) {
        L.plane(len * 0.8, 0.26, L.basic(tAds[(Math.round(zc) + (s > 0 ? 1 : 0) + 8) % 4]), s * 1.465, 2.5, zc, g, s < 0 ? Math.PI / 2 : -Math.PI / 2);
        B(0.46, 0.1, len - 0.3, mSeat, s * 1.24, FY + 0.45, zc, g); B(0.38, 0.4, len - 0.3, mBase, s * 1.27, FY + 0.2, zc, g); B(0.07, 0.5, len - 0.3, mSeat, s * 1.43, FY + 0.78, zc, g);
      }
    }
    for (const z of DZ) {
      B(0.06, 0.45, 1.28, mW, s * 1.5, 2.725, z, g);
      for (const d of [-0.7, 0.7]) L.mesh(new THREE.CylinderGeometry(0.02, 0.02, CY - FY, 6), mPole, s * 1.0, (CY + FY) / 2, z + d, g);
      const pl = B(1.28, 0.02, 0.5, lam(null, 0xe8c020, PO), s * 1.2, FY + 0.005, z, g); pl.scale.set(0.35, 1, 2.4); pl.renderOrder = 1;
    }
    B(0.035, 0.035, 13.0, mPole, s * 0.7, 2.62, -8.75, g);
  }
  for (const z of [-4.5, -8.3, -12.1]) L.mesh(new THREE.CylinderGeometry(0.02, 0.02, CY - FY, 6), mPole, 0, (CY + FY) / 2, z, g);
  // puerta de paso del fondo (al vagon siguiente) con ventana: ahi aparece la sonrisa
  // el hueco de la ventana se recorta del muro con un marco: muro con agujero = 4 cajas alrededor (el muro de arriba tapa)
  B(1.13, CY - FY, 0.06, mW, -0.915, (CY + FY) / 2, -15.3, g); B(1.13, CY - FY, 0.06, mW, 0.915, (CY + FY) / 2, -15.3, g);
  B(0.7, CY - FY - 2.0, 0.06, mW, 0, FY + 2.0 + (CY - FY - 2.0) / 2, -15.3, g);   // muro sobre la puerta
  // v3: puerta de paso del fondo = hoja con bisagra (x = +0.35) que cede hacia adentro y rebota con cada golpe del cazador; el vidrio se raja
  const rearLeaf = new THREE.Group(); rearLeaf.position.set(0.35, 0, -15.28); g.add(rearLeaf);
  { const mD2 = lam(null, 0x8a9094), fr = lam(null, 0x4a4e52);
    B(0.7, 1.2, 0.05, mD2, -0.35, FY + 0.6, 0, rearLeaf); B(0.7, 0.3, 0.05, mD2, -0.35, FY + 1.85, 0, rearLeaf);
    B(0.06, 0.5, 0.07, fr, -0.35 - 0.24, FY + 1.45, 0.005, rearLeaf); B(0.06, 0.5, 0.07, fr, -0.35 + 0.24, FY + 1.45, 0.005, rearLeaf); B(0.54, 0.06, 0.07, fr, -0.35, FY + 1.2, 0.005, rearLeaf); B(0.54, 0.06, 0.07, fr, -0.35, FY + 1.7, 0.005, rearLeaf);
    L.plane(0.42, 0.5, L.basic(null, 0x0a1018, { transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }), -0.35, FY + 1.45, 0.02, rearLeaf);
    B(0.04, 0.03, 0.12, lam(null, 0x2a2c2e), -0.62, FY + 0.95, 0.04, rearLeaf); }
  const crackCv = document.createElement('canvas'); crackCv.width = 84; crackCv.height = 100; const crackTex = L.canvasTex(crackCv);
  const crackP = L.plane(0.42, 0.5, L.basic(crackTex, 0xffffff, { transparent: true, depthWrite: false, side: THREE.DoubleSide }), -0.35, FY + 1.45, 0.03, rearLeaf); crackP.visible = false;
  let crackN = -1; const setCrack = (n) => { crackP.visible = n > 0; if (n === crackN) return; crackN = n; const c = crackCv.getContext('2d'); c.clearRect(0, 0, 84, 100); const R = L.rng(73);
    for (let k = 0; k < n; k++) { const cx = 30 + R() * 24, cy = 36 + R() * 30; c.strokeStyle = 'rgba(225,232,245,0.7)'; c.lineWidth = 1;
      for (let r = 0; r < 4 + Math.floor(k / 2); r++) { const a = R() * 6.28; let x = cx, y = cy; c.beginPath(); c.moveTo(x, y); for (let q = 0; q < 4; q++) { x += Math.cos(a + (R() - 0.5) * 0.8) * (6 + R() * 10); y += Math.sin(a + (R() - 0.5) * 0.8) * (6 + R() * 10); c.lineTo(x, y); } c.stroke(); }
      c.beginPath(); c.arc(cx, cy, 3 + k, 0, 6.28); c.stroke(); }
    crackTex.needsUpdate = true; };
  const nextVoid = L.plane(3, 3, L.basic(null, 0x020203, { fog: false }), 0, 1.5, -17.2, g, Math.PI);   // el vagon siguiente: oscuridad total
  // puertas laterales (dos hojas por hueco, con ventana)
  const leaves = []; const mD = lam(tDoorI);
  for (const s of [-1, 1]) for (const z of DZ) for (const dir of [1, -1]) {
    const lf = new THREE.Group(); lf.position.set(s * 1.56, 0, z + dir * 0.32); g.add(lf);
    B(0.03, 0.85, 0.64, mD, 0, FY + 0.425, 0, lf); B(0.03, 0.22, 0.64, mD, 0, FY + 1.89, 0, lf);
    for (const e of [-0.29, 0.29]) B(0.03, 0.98, 0.06, mD, 0, FY + 1.34, e, lf);
    L.plane(0.52, 0.98, mGlass, 0, FY + 1.34, 0, lf, Math.PI / 2); B(0.04, 0.03, 0.6, lam(null, 0x2a2c2e), 0, FY + 0.86, 0, lf);
    lf.userData = { z0: lf.position.z, dir, s, z, x0: lf.position.x }; leaves.push(lf);
  }
  const setDoorsI = (k, zDoor = -2.6) => leaves.forEach((lf) => { const u = lf.userData; const open = u.s === -1 && Math.abs(u.z - zDoor) < 0.1 ? k : 0; lf.position.z = u.z0 + u.dir * 0.62 * open; lf.position.x = u.x0; });
  const lightsI = []; for (const z of [-5.2, -11]) { const p = new THREE.PointLight(0xe8ecf2, 7, 10, 1.2); p.position.set(0, 2.5, z); g.add(p); lightsI.push(p); }
  const emerg = new THREE.PointLight(0x7088c0, 0, 7, 1.3); emerg.position.set(0, 2.6, -6.4); g.add(emerg);
  const setLights = (k, em = 1) => { strips.forEach((m, i) => { m.material = (typeof k === 'function' ? k(i) : k) > 0.5 ? stripOn : stripOff; }); const kk = typeof k === 'function' ? k(0) : k; lightsI.forEach((p) => { p.intensity = 1.8 + 5.2 * kk; }); emerg.intensity = 2.2 * (1 - kk) * em; };
  const outVoid = L.plane(3.2, 3.2, L.basic(null, 0x000000, { fog: false }), -1.95, 1.6, -2.6, g, Math.PI / 2); outVoid.visible = false;

  // ---------- CABINA (z 0 .. PZ): parabrisas, consola, palanca (dead man's switch) con cinta, asiento, First Aid Spray ----------
  const cab = new THREE.Group(); g.add(cab);
  const tPanel = L.cvs(64, 32, (c) => { px(c, 0, 0, '#2a2e34', 64, 32); px(c, 0, 0, '#4a4e56', 64, 1); const dial = (x, y, col) => { c.fillStyle = '#d8d8c8'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); c.strokeStyle = '#1a1a1a'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4, y - 3); c.stroke(); px(c, x - 1, y + 3, col, 3, 1); };
    dial(10, 10, '#c82a1a'); dial(26, 10, '#2a8a3a'); for (let i = 0; i < 6; i++) px(c, 38 + i * 4, 6, ['#e83a2a', '#3ad84a', '#e8c020'][i % 3], 2, 2); for (let i = 0; i < 5; i++) px(c, 38 + i * 5, 14, '#8a8e96', 3, 3); px(c, 4, 22, '#101418', 56, 7); c.fillStyle = '#ff7a2a'; c.font = '6px monospace'; c.textBaseline = 'middle'; c.fillText('SPD 00 ATP', 6, 26); });
  const tCrew = L.cvs(32, 12, (c) => { px(c, 0, 0, '#c8301e', 32, 12); c.fillStyle = '#fff'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CREW ONLY', 16, 6.5); });
  const mCabW = lam(L.rep(tWallI, 1, 1), 0xb8b2a0), mDark = lam(null, 0x24272c), mBlack = lam(null, 0x101214);
  // mampara con hueco de puerta (x 0.25..0.95)
  B(1.75, CY - FY, 0.06, mCabW, -0.625, (CY + FY) / 2, PZ, cab); B(0.55, CY - FY, 0.06, mCabW, 1.225, (CY + FY) / 2, PZ, cab); B(0.7, CY - FY - 2.0, 0.06, mCabW, 0.6, FY + 2.0 + (CY - FY - 2.0) / 2, PZ, cab);
  L.plane(0.4, 0.15, L.basic(tCrew), 0.6, FY + 2.15, PZ - 0.035, cab, Math.PI);
  // hoja de la puerta de la cabina (bisagra en x=0.95), entreabierta; la hoja NIGHT SHIFT pegada en ella
  const cabDoor = new THREE.Group(); cabDoor.position.set(0.95, 0, PZ - 0.02); cab.add(cabDoor);
  { const tCD = L.cvs(16, 32, (c) => { px(c, 0, 0, '#8a9094', 16, 32); px(c, 0, 0, '#a8aeb2', 16, 1); px(c, 0, 0, '#6a7074', 1, 32); const r = L.rng(12); for (let k = 0; k < 20; k++) px(c, r() * 16 | 0, r() * 32 | 0, 'rgba(50,50,50,0.4)'); });
    B(0.7, 1.95, 0.04, lam(tCD), -0.35, FY + 0.975, 0, cabDoor); B(0.05, 0.12, 0.06, lam(null, 0x2a2a2a), -0.62, FY + 1.0, -0.04, cabDoor);
    const tNote = L.cvs(24, 32, (c) => { px(c, 0, 0, '#e2d8b8', 24, 32); c.fillStyle = '#2a2016'; c.font = 'bold 4px monospace'; c.fillText('NIGHT SHIFT', 1, 5); for (let i = 0; i < 6; i++) px(c, 2, 9 + i * 3, i === 4 ? '#8a1810' : '#4a4030', 18 - (i % 2) * 4, 1); px(c, 0, 0, 'rgba(230,230,210,0.9)', 6, 2); px(c, 18, 0, 'rgba(230,230,210,0.9)', 6, 2); });
    L.plane(0.26, 0.34, lam(tNote, 0xffffff, { side: THREE.DoubleSide }), -0.36, FY + 1.5, -0.03, cabDoor, Math.PI); }
  // frente con parabrisas (hueco x -1.2..1.2, y FY+1.0..FY+2.0)
  const FZ = -0.2;
  B(2.96, 1.0, 0.08, mCabW, 0, FY + 0.5, FZ, cab); B(2.96, CY - FY - 2.0, 0.08, mCabW, 0, FY + 2.0 + (CY - FY - 2.0) / 2, FZ, cab);
  B(0.28, 1.0, 0.08, mCabW, -1.34, FY + 1.5, FZ, cab); B(0.28, 1.0, 0.08, mCabW, 1.34, FY + 1.5, FZ, cab); B(0.06, 1.0, 0.1, mDark, 0, FY + 1.5, FZ, cab);
  L.plane(2.4, 1.0, L.basic(null, 0x1a2a2a, { transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }), 0, FY + 1.5, FZ - 0.01, cab);
  B(2.96, 0.04, 1.75, lam(null, 0x2a2c2e), 0, CY + 0.0, (FZ + PZ) / 2, cab);   // techo de cabina oscuro
  // consola a la izquierda (lado del conductor) y estante a la derecha
  const CZ0 = -0.25, CZ1 = -0.72, CH = FY + 0.95;
  B(1.9, 0.95, CZ0 - CZ1, mDark, -0.5, FY + 0.475, (CZ0 + CZ1) / 2, cab);
  { const top = B(1.9, 0.04, 0.5, lam(null, 0x34383e), -0.5, CH + 0.02, (CZ0 + CZ1) / 2, cab); void top;
    const pnl = L.plane(1.0, 0.3, L.basic(tPanel), -0.65, CH + 0.19, -0.31, cab, 0, -0.75); void pnl;
    B(1.0, 0.32, 0.06, mDark, -0.65, CH + 0.16, -0.27, cab).rotation.x = -0.75 + Math.PI / 2 - Math.PI / 2; }
  B(0.9, 0.06, 0.45, lam(null, 0x34383e), 0.95, FY + 0.95, -0.5, cab); B(0.06, 0.9, 0.45, mDark, 0.55, FY + 0.47, -0.5, cab);
  const spray = makeSpray(L); spray.position.set(1.05, FY + 0.98, -0.45); spray.rotation.y = -0.5; cab.add(spray);
  const cabSpray = spray;
  // radio y libreta en el estante
  B(0.2, 0.1, 0.14, mBlack, 0.78, FY + 1.03, -0.56, cab); B(0.16, 0.01, 0.22, lam(null, 0xd8d0b0), 1.2, FY + 0.985, -0.6, cab);
  // asiento del conductor, VACIO (corrido a la izquierda)
  const seatG = new THREE.Group(); seatG.position.set(-0.5, FY, -1.35); cab.add(seatG);
  { const ms = lam(L.rep(tSeat, 1, 1), 0x9a8a80); B(0.5, 0.1, 0.5, ms, 0, 0.55, 0, seatG); B(0.5, 0.65, 0.1, ms, 0, 0.92, -0.24, seatG); L.mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 6), mBlack, 0, 0.25, 0, seatG); B(0.5, 0.04, 0.5, mBlack, 0, 0.02, 0, seatG); }
  // palanca: grupo en la consola; el brazo gira en x (+ adelante = traccion, - atras = freno). Manija transversal + pomo rojo
  const lever = new THREE.Group(); lever.position.set(-0.5, CH + 0.04, -0.55); cab.add(lever);
  B(0.18, 0.06, 0.24, mBlack, 0, 0.03, 0, lever);
  const tSlot = L.cvs(16, 16, (c) => { px(c, 0, 0, '#141618', 16, 16); px(c, 7, 1, '#000', 2, 14); c.fillStyle = '#d8d8c8'; c.font = '4px monospace'; c.fillText('P', 1, 4); c.fillText('B', 1, 14); });
  L.plane(0.16, 0.22, L.basic(tSlot), 0, 0.062, 0, lever, 0, -Math.PI / 2);
  const arm = new THREE.Group(); arm.position.set(0, 0.05, 0); lever.add(arm);
  const ARM = 0.3; L.mesh(new THREE.CylinderGeometry(0.015, 0.02, ARM, 6), lam(null, 0x8a8e94), 0, ARM / 2, 0, arm);
  B(0.22, 0.035, 0.04, mBlack, 0, ARM, 0, arm);
  const knob = L.mesh(new THREE.SphereGeometry(0.028, 8, 6), lam(null, 0xd0201a), 0, ARM + 0.03, 0, arm);
  const ghostArm = new THREE.Group(); lever.add(ghostArm); ghostArm.position.copy(arm.position);   // diagrama: la palanca "suelta" que salta al freno
  { const mg = L.basic(null, 0x9cf0ff, { transparent: true, opacity: 0.45, depthWrite: false, fog: false }); L.mesh(new THREE.CylinderGeometry(0.016, 0.02, ARM, 6), mg, 0, ARM / 2, 0, ghostArm); B(0.22, 0.035, 0.04, mg, 0, ARM, 0, ghostArm); L.mesh(new THREE.SphereGeometry(0.028, 8, 6), mg, 0, ARM + 0.03, 0, ghostArm); }
  ghostArm.visible = false;
  const A_PWR = 0.55, A_BRK = -0.6;
  // cinta gris (dos tiras): de la manija a la consola, delante y detras
  const tTape = L.cvs(8, 16, (c) => { px(c, 0, 0, '#a8a8a0', 8, 16); const r = L.rng(3); for (let k = 0; k < 18; k++) px(c, r() * 8 | 0, r() * 16 | 0, 'rgba(60,60,60,0.35)'); for (let y = 0; y < 16; y += 3) px(c, 0, y, '#c0c0b8', 8, 1); });
  const mTape = lam(tTape, 0x9a9a92, { side: THREE.DoubleSide });
  const mkStrip = () => { const m = B(1, 1, 1, mTape, 0, 0, 0, cab); return m; };
  const strips2 = [mkStrip(), mkStrip(), mkStrip()];
  const setStrip = (m, a, b, w = 0.034, th = 0.006) => { const d = b.clone().sub(a), len = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(w, th, Math.max(0.001, len)); m.lookAt(m.parent.localToWorld(b.clone())); m.visible = true; };
  const cabLocal = (wp) => cab.worldToLocal(wp.clone());
  const gripL = (side = 0) => { arm.updateMatrixWorld(true); return arm.localToWorld(V(side * 0.075, ARM, 0)); };   // en mundo
  const tapeOn = () => { arm.updateMatrixWorld(true); const a1 = cabLocal(arm.localToWorld(V(0, 0.12, 0.012))), a2 = cabLocal(arm.localToWorld(V(0, 0.12, -0.012)));
    setStrip(strips2[0], a1, V(-0.5, CH + 0.05, -0.33)); setStrip(strips2[1], a2, V(-0.5, CH + 0.05, -0.72)); setStrip(strips2[2], cabLocal(arm.localToWorld(V(0, 0.16, 0))), cabLocal(arm.localToWorld(V(0, 0.08, 0))), 0.06, 0.05); };
  const tapeOff = () => strips2.forEach((m) => { m.visible = false; });
  const tapeFloor = B(0.14, 0.02, 0.06, mTape, -0.25, FY + 0.012, -1.05, cab); tapeFloor.rotation.y = 0.7; tapeFloor.visible = false;
  // luces de la cabina: ambar tenue + el brillo de la consola
  const cabL = new THREE.PointLight(0xffb070, 0, 3.5, 1.3); cabL.position.set(-0.2, FY + 1.9, -1.0); cab.add(cabL);
  const cabFill = new THREE.PointLight(0xd8e0ec, 0, 3.2, 1.2); cabFill.position.set(-0.45, FY + 1.75, -1.7); cab.add(cabFill);
  const conL = new THREE.PointLight(0x80c0ff, 0, 2.2, 1.4); conL.position.set(-0.6, CH + 0.4, -0.75); cab.add(conL);
  // pantalla en la mampara, del lado del vagon (encima del hueco izquierdo), mira hacia atras
  const scrCv = document.createElement('canvas'); scrCv.width = 160; scrCv.height = 96; const scrTex = L.canvasTex(scrCv);
  const scrG = new THREE.Group(); scrG.position.set(-0.55, 2.4, PZ - 0.06); g.add(scrG);
  B(1.12, 0.7, 0.06, lam(null, 0x16181c), 0, 0, 0, scrG); L.plane(1.02, 0.612, L.basic(scrTex, 0xffffff, { fog: false }), 0, 0, -0.035, scrG, Math.PI);
  const scrGlow = new THREE.PointLight(0xff9070, 0, 3.0, 1.5); scrGlow.position.set(-0.5, 2.0, PZ - 0.7); g.add(scrGlow);

  // tren del tunel: faros, haz, brillo
  const headT = new THREE.SpotLight(0xfff4d8, 0, 70, 0.4, 0.6, 1.0); sT.add(headT, headT.target);
  const trainGlow = new THREE.PointLight(0xd8e4d0, 0, 9, 1.2); sT.add(trainGlow);
  const tHL = L.cvs(16, 16, (c) => { const gg = c.createRadialGradient(8, 8, 0, 8, 8, 8); gg.addColorStop(0, 'rgba(255,250,230,1)'); gg.addColorStop(0.5, 'rgba(255,240,200,0.5)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(0, 0, 16, 16); });
  const heads = []; for (const x of [-0.9, 0.9]) heads.push(L.plane(0.7, 0.7, L.basic(tHL, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), x, 0.95, 0.05, carT1.g));
  // chispas de las ruedas al frenar (aditivas, deterministas)
  const tSpark = L.cvs(8, 8, (c) => { const gg = c.createRadialGradient(4, 4, 0, 4, 4, 4); gg.addColorStop(0, 'rgba(255,250,200,1)'); gg.addColorStop(0.5, 'rgba(255,170,60,0.8)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(0, 0, 8, 8); });
  const mSpark = L.basic(tSpark, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const sparks = []; for (let i = 0; i < 60; i++) { const m = L.plane(0.09, 0.09, mSpark, 0, 0, 0, sT); m.visible = false; sparks.push(m); }
  const sparkL = new THREE.PointLight(0xffa040, 0, 5, 1.5); sT.add(sparkL);
  const setSparks = (t, k, camera) => { const R = L.rng(5); sparks.forEach((m, i) => { const wheel = [-2.2, -12.8][i % 2], side = (i >> 1) % 2 ? 1 : -1, ph = ((t * 3.2 + R()) % 1), sp = 1.5 + R() * 2.5, ang = R() * Math.PI;
      const base = carT1.g.localToWorld(V(side * 0.72, -0.48, wheel)); m.position.copy(base).add(V(side * Math.cos(ang) * sp * ph * 0.25, 0.25 * sp * ph - 1.2 * ph * ph, -(1 - R() * 2) * sp * ph * 0.4)); m.visible = k > 0.05 && R() < k; m.scale.setScalar(1 - ph * 0.7); m.lookAt(camera.position); });
    sparkL.intensity = 14 * k; sparkL.position.copy(carT1.g.localToWorld(V(0, -0.3, -2.2))); };

  const placeT = (s) => {
    for (const [car, ds] of [[carT1, 0], [carT2, 16]]) { const sf = s - ds; car.g.position.set(XS(sf), -0.5, -sf); const roll = Math.max(-0.07, Math.min(0.07, 4.0 * (XS(sf - 6) - 2 * XS(sf - 3) + XS(sf))));   // el vagon se sacude al tomar el cambio
      car.g.rotation.set(0, Math.atan2(XS(sf + 1) - XS(sf), -1), roll, 'YXZ'); }
    headT.position.set(XS(s), 0.6, -s - 0.5); headT.target.position.set(XS(s + 20), 0.4, -s - 20); trainGlow.position.set(XS(s - 8), 1.6, -s + 8);
  };
  const inCar = (x, y, z) => { carT1.g.updateMatrixWorld(true); return carT1.g.localToWorld(V(x, y, z)); };
  const lookIn = (c, p, q) => { c.position.copy(inCar(...p)); c.lookAt(inCar(...q)); c.updateProjectionMatrix(); };

  // ---------- la criatura (ep4/ep9): silueta negra, dos ojos brillantes separados, sonrisa demasiado ancha ----------
  const zG = await L.loadModel('models/thin-zombie.glb');
  const CH_H = 4.3, CS = CH_H / 1.9;
  const mkCreature = (parentScene) => {
    const shadow = L.ps1Clone(zG.scene); const shW = new THREE.Group(); shW.add(shadow); parentScene.add(shW);
    const mats = []; shadow.traverse((o) => { if (o.isMesh) { o.material = L.lam(null, 0x30323c); mats.push(o.material); } });
    { const bb = new THREE.Box3().setFromObject(shadow), k = CH_H / (bb.max.y - bb.min.y) * 2.9; shadow.scale.multiplyScalar(k); shadow.position.y = 0; }
    const mix = new THREE.AnimationMixer(shadow), idle = mix.clipAction(THREE.AnimationClip.findByName(zG.animations, 'idle')), atk = mix.clipAction(THREE.AnimationClip.findByName(zG.animations, 'attack2'));
    idle.play(); atk.play(); atk.setEffectiveWeight(0);
    const head = shadow.getObjectByName('head');
    const eyeG = new THREE.Group(); parentScene.add(eyeG); eyeG.scale.setScalar(CS);
    const mEye = L.basic(null, 0xf4f8ff, { fog: false, side: THREE.DoubleSide, transparent: true });
    const tG = L.cvs(32, 32, (c) => { const gg = c.createRadialGradient(16, 16, 1, 16, 16, 16); gg.addColorStop(0, 'rgba(230,240,255,0.85)'); gg.addColorStop(0.4, 'rgba(170,200,255,0.3)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(0, 0, 32, 32); });
    const mGlow = L.basic(tG, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide });
    const mPup = L.basic(null, 0x101418, { fog: false, side: THREE.DoubleSide, transparent: true });
    for (const sx of [-1, 1]) {
      const e = L.mesh(new THREE.CircleGeometry(0.013, 10), mEye, sx * 0.033, 0, 0.002, eyeG); e.scale.set(1.0, 0.5, 1); e.rotation.z = sx * 0.18;
      L.mesh(new THREE.CircleGeometry(0.0032, 6), mPup, sx * 0.033, 0, 0.004, eyeG);
      L.mesh(new THREE.PlaneGeometry(0.044, 0.03), mGlow, sx * 0.033, 0, 0.0, eyeG);
    }
    const tSm = L.cvs(64, 24, (c) => { c.fillStyle = '#f2f0e4'; c.beginPath(); c.moveTo(1, 3); c.quadraticCurveTo(32, 33, 63, 3); c.quadraticCurveTo(32, 13, 1, 3); c.fill();
      c.globalCompositeOperation = 'source-atop'; c.fillStyle = '#5a1010'; for (let x = 5; x < 62; x += 4) c.fillRect(x, 0, 1, 24); c.fillStyle = '#3a0606'; c.fillRect(0, 13, 64, 1); });
    const mSm = L.basic(tSm, 0xffffff, { transparent: true, alphaTest: 0.5, fog: false, side: THREE.DoubleSide });
    const SR = 0.07, smile = new THREE.Group(); smile.position.set(0, -0.032, -SR + 0.01); eyeG.add(smile);
    L.mesh(new THREE.CylinderGeometry(SR, SR, 0.045, 14, 1, true, -0.9, 1.8), mSm, 0, 0, 0, smile);
    L.mesh(new THREE.PlaneGeometry(0.12, 0.035), mGlow, 0, 0, SR - 0.004, smile);
    const pose = (lt, { atkT = null, smileK = 0 } = {}) => {
      if (atkT !== null && atkT >= 0) { idle.setEffectiveWeight(0); atk.setEffectiveWeight(1); atk.time = Math.min(atk.getClip().duration - 1e-3, L.q15(atkT)); }
      else { atk.setEffectiveWeight(0); idle.setEffectiveWeight(1); idle.time = 0.92 + 0.06 * Math.sin(L.q15(lt) * 1.3); }
      mix.update(0); shW.updateMatrixWorld(true);
      const hp = head.getWorldPosition(V()); const q = shW.getWorldQuaternion(new THREE.Quaternion());
      eyeG.position.copy(hp).add(V(0, 0.095 * CS, 0.15 * CS).applyQuaternion(q)); eyeG.quaternion.copy(q);
      smile.visible = smileK > 0.01; smile.scale.set(0.55 + 0.45 * smileK, 0.6 + 0.4 * smileK, 0.55 + 0.45 * smileK);
    };
    const clip = (plane) => mats.forEach((m) => { m.clippingPlanes = plane ? [plane] : null; });
    const set = (vis, body = 1, eyes = 1) => { shW.visible = vis && body > 0.01; eyeG.visible = vis && eyes > 0.01;
      mats.forEach((m) => { m.transparent = body < 1; m.opacity = body; m.depthWrite = body >= 1; }); mEye.opacity = mPup.opacity = mGlow.opacity = mSm.opacity = eyes; };
    return { shW, eyeG, pose, set, clip };
  };
  const cr = mkCreature(sT);
  // ---------- v2 (usuario): el gigante ("the Stalker", makeStalker del largo 3 / ep14). 2,6 m; sus dientes sin labios son "the smile";
  // luz verde en la caja del pecho; sale de la oscuridad, lento y pesado ----------
  const SG = await L.loadModel('models/stalker_ps1.glb'); const CRS = -1;
  function makeStalker(scene) {
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
      R('thighL', X, CRS * 1.25 * crouch); R('thighR', X, CRS * 1.25 * crouch); R('shinL', X, -CRS * 1.9 * crouch); R('shinR', X, -CRS * 1.9 * crouch); R('spine', X, 0.45 * crouch); R('upperarmL', X, -CRS * 1.1 * reach); R('upperarmR', X, -CRS * 1.1 * reach);
      R('spine', Z, 0.05 * s * w); R('chest', X, 0.18 * duck + 0.04); R('spine', X, 0.35 * duck); R('chest', Y, -0.06 * s * w);
      R('upperarmL', X, 0.16 * s * w); R('upperarmR', X, -0.16 * s * w); R('forearmL', X, -0.25); R('forearmR', X, -0.25);
      R('neck', X, -0.2 * duck - pitch * 0.4); R('head', Z, tilt); R('head', X, -pitch * 0.6); R('head', Y, yawHead);
      for (const sd of ['L', 'R']) { const sg = sd === 'L' ? -1 : 1; R('fingers' + sd, Z, sg * 1.5 * grip); R('fingers' + sd, X, 0.6 * grip); R('thumb' + sd, Z, -sg * 0.9 * grip); R('hand' + sd, Z, sg * 0.35 * grip); }
      boxL.intensity = 0.5 + 0.35 * (Math.floor(t * 2.5) % 2);
    }
    return { wrap, root, bn, pose, boxL };
  }
  const ST = makeStalker(sT); ST.wrap.visible = false;
  const gMats = []; ST.root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => gMats.push(m)); });
  let gClipCur = null; const gClip = (pl) => { if (pl === gClipCur) return; gClipCur = pl; gMats.forEach((m) => { m.clippingPlanes = pl ? [pl] : null; m.needsUpdate = true; }); };
  const faceL = new THREE.PointLight(0xdfe6ff, 0, 2.2, 1.4); sT.add(faceL);   // luz suave en la cara para que se lean los dientes
  /** el gigante en el mundo: pies en (x, y, z), yaw (0 = mira a +z); o = pose + {face: luz en la cara, clip: plano} */
  const stalk = (x, z, yaw, o = {}, y = 0) => { ST.wrap.visible = true; ST.wrap.position.set(x, y, z); ST.wrap.rotation.set(0, yaw, 0); ST.pose(o); ST.root.updateMatrixWorld(true); gClip(o.clip || null);
    const h = ST.bn.head.getWorldPosition(V()); faceL.intensity = o.face || 0; faceL.position.copy(h).add(V(Math.sin(yaw), -0.05, Math.cos(yaw)).multiplyScalar(0.6)); return h; };

  // ---------- Ava: ch2 dentro del vagon (coordenadas del vagon), ch3 en el tunel (mundo) con linterna ----------
  const ch2 = L.hero(); carT1.g.add(ch2.root); paintScared(ch2);
  const ch3 = L.hero(); sT.add(ch3.root); paintScared(ch3);
  const torch = await prop('flashlight'); L.holdIn(ch3, torch, 'R', [0, 0.75, 0.22], [0, 0, Math.PI / 2]);
  const hBeam = new THREE.SpotLight(0xfff0d0, 0, 12, 0.42, 0.5, 1.2); torch.add(hBeam); hBeam.position.set(0.1, 0, 0); const hTgt = new THREE.Object3D(); hTgt.position.set(3, 0, 0); torch.add(hTgt); hBeam.target = hTgt;
  const tPoolX = L.cvs(32, 32, (c) => { const gg = c.createRadialGradient(16, 16, 0, 16, 16, 16); gg.addColorStop(0, 'rgba(255,246,214,1)'); gg.addColorStop(0.55, 'rgba(255,238,196,0.55)'); gg.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = gg; c.fillRect(0, 0, 32, 32); });
  const pool = L.mesh(new THREE.CircleGeometry(1, 20), L.basic(tPoolX, 0xffe0a8, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), 0, 0, 0, sT); pool.renderOrder = 5; pool.visible = false;
  const cone = L.mesh(new THREE.ConeGeometry(1, 1, 12, 1, true), L.basic(null, 0xfff0c8, { transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, 0, 0, sT); cone.visible = false;
  // el charco cae en el plano del balasto/traviesas (y = TIE) o en la pared derecha: interseccion analitica (rapida y estable)
  const torchOn = (on, k = 1) => { torch.visible = on; hBeam.intensity = on ? 14 * k : 0; pool.visible = cone.visible = false; if (!on) return;
    ch3.root.updateMatrixWorld(true); const fw = V(0, 0, 1).applyQuaternion(ch3.root.getWorldQuaternion(new THREE.Quaternion())); fw.y = 0; const d = fw.normalize().add(V(0, -0.42, 0)).normalize();
    { const hq = torch.parent.getWorldQuaternion(new THREE.Quaternion()).invert(); torch.quaternion.copy(hq.multiply(new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), d))); torch.updateMatrixWorld(true); }   // la linterna apunta adelante y abajo (el haz no baila con el brazo)
    const lp = torch.localToWorld(V(0.11, 0, 0)); hTgt.position.set(3, 0, 0);
    let tt = d.y < -0.05 ? (TIE + 0.005 - lp.y) / d.y : 1e9, n = V(0, 1, 0); const tw = d.x > 0.05 ? (XR - 0.11 - lp.x) / d.x : 1e9; if (tw < tt) { tt = tw; n = V(-1, 0, 0); }
    if (tt > 14) return; const hit = lp.clone().addScaledVector(d, tt), r = Math.max(0.2, tt * 0.24);
    pool.visible = true; pool.position.copy(hit).addScaledVector(n, 0.012); pool.lookAt(hit.clone().add(n)); pool.scale.set(r, r, 1); pool.material.opacity = Math.min(0.5, 0.6 * k / (1 + 0.015 * tt * tt));
    cone.visible = false; cone.position.copy(lp).addScaledVector(d, tt / 2); cone.scale.set(r, tt, r); cone.quaternion.setFromUnitVectors(V(0, -1, 0), d); };

  // IK de 2 huesos (como el ep14 climbUp) para las manos de Ava en la palanca
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
  const handOff = (lb, side) => lb.Lo.localToWorld(lb.enL.clone()).sub(ch2.hand(side).getWorldPosition(V()));   // (no usado: la mano es el extremo)
  void handOff;
  carT1.g.updateMatrixWorld(true); ch2.root.position.set(0, 0, 0); ch2.root.rotation.set(0, 0, 0); ch2.pose(0, L.still('idle', 0.3)); ch2.root.updateMatrixWorld(true);
  const ARMS = { L: mkLimb(ch2.bone, 'UpperArmL', 'ForearmL', 'HandL'), R: mkLimb(ch2.bone, 'UpperArmR', 'ForearmR', 'HandR') };
  // la mano: el hueso HandX termina en la muneca; el agarre cae ~8 cm mas alla en la direccion del antebrazo
  const reach = (side, tgtW, poleW) => { const lb = ARMS[side]; const a = lb.U.getWorldPosition(V()); const d = tgtW.clone().sub(a); const back = d.clone().normalize().multiplyScalar(0.075); solve(lb, tgtW.clone().sub(back), poleW); };

  { placeT(SSTOP); const cp = inCar(0.95, 1.95, -4.75), dp = inCar(-1.56, 1.3, -2.6), d = dp.clone().sub(cp); const k = (XR - 0.1 - cp.x) / d.x; exitG.position.z = cp.z + d.z * k + 0.4; }
  // ================= estado =================
  const state = ({ s = S0, inside = false, light = 1, em = 1, doorK = 0, hero2 = false, hero3 = false, screen = null, t = 0, redK = 1, cabK = 0, cabDoorA = 0.45, hl = 0, next = 0 } = {}) => {
    ikUndo(); placeT(s); carT1.root.visible = !inside; carT1.pics.forEach((p) => { p.visible = !inside; }); g.visible = inside; setLights(light, em); setDoorsI(doorK); outVoid.visible = doorK > 0.001 && redK < 0.05;
    carT1.setDoors(inside ? 0 : doorK); carT2.setDoors(0); carT2.g.visible = !inside; carT1.lamps.forEach((p) => { p.visible = false; }); carT2.lamps.forEach((p) => { p.visible = false; });
    headsOn(hl); trainGlow.intensity = inside ? 0 : 1.2;
    redLs.forEach((p) => { p.intensity = 5 * redK; }); mLampR.color.set(redK > 0.5 ? 0xff4a1a : 0x2a0a04); hemT.intensity = 0.12 + 0.6 * redK;
    ch2.root.visible = hero2 && inside; ch3.root.visible = hero3; torchOn(false); cr.set(false); cr.clip(null); ST.wrap.visible = false; faceL.intensity = 0; gClip(null); fillT.intensity = 0; fillT.color.set(0xa8b8d8); fillT.distance = 6; cabFill.intensity = 0; setPoints(t >= T['06c_speed'] + 0.1 ? ease(T['06c_speed'] + 0.1, T['06c_speed'] + 0.5, t) : 0); redLs.forEach((p, i) => { void i; });
    drawScreen(t, screen); cabL.intensity = 1.6 * cabK; conL.intensity = 1.4 * cabK; cabDoor.rotation.y = cabDoorA;
    rearLeaf.rotation.y = 0; rearLeaf.position.z = -15.28; setCrack(0); arm.rotation.x = A_PWR; ghostArm.visible = false; seatG.position.x = hero2 ? -1.1 : -0.5; tapeOn(); tapeFloor.visible = false; nextVoid.visible = true;
    const sw = t >= T['06c_speed'] + 0.6; sTop.material = sw ? sigOff : sigRed; sBot.material = sw ? sigGrn : sigOff;
    setSparks(t, 0, { position: V() }); exitG.userData.glow.intensity = 4; void next;
  };
  const fillT = new THREE.PointLight(0xa8b8d8, 0, 6, 1.4); sT.add(fillT);   // luz suave de relleno (GUIA: 3D ~30 % mas claro, legible)
  const darkBehind = () => { for (let i = 0; i < 4; i++) redLs[i].intensity = 0; };   // las lamparas detras de Ava apagadas: el gigante sale de lo negro
  function headsOn(k) { heads.forEach((p) => { p.visible = k > 0; p.material.opacity = 1; }); headT.intensity = 45 * k; }
  const creature = (o) => { cr.shW.position.copy(o.at); cr.shW.position.y += o.lift || 0; cr.shW.rotation.set(o.lean || 0, o.ry ?? 0, 0, 'YXZ'); cr.set(true, o.body ?? 1, o.eyes ?? 1); cr.clip(o.clip || null); cr.pose(o.lt || 0, o); };

  const cdown = (t) => Math.max(1, Math.ceil(10 - 9.2 * Math.max(0, t - W.ten) / (CUE.END - 0.5 - W.ten)));   // la cuenta llega a 1 al final del video
  // ---------- pantalla: 'buttons' (como la parte 2, 00:05), 'leave' / 'stay' (boton apretado), 'broke' (YOU BROKE RULE 3 — 10) ----------
  const btn = (c, x, col, txt, sub, hi, y = 40, w = 66, h = 40) => { px(c, x, y, hi ? '#ffffff' : '#3a1a14', w, h); px(c, x + 2, y + 2, col, w - 4, h - 4); if (hi) { px(c, x - 2, y - 2, '#ffffff', w + 4, 1); px(c, x - 2, y + h + 1, '#ffffff', w + 4, 1); }
    c.fillStyle = col === '#f0f0f0' ? '#1a1a1a' : '#fff4f0'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x + w / 2, y + 14); c.font = '7px monospace'; c.fillText(sub, x + w / 2, y + 29); };
  function drawScreen(t, mode) {
    const c = scrCv.getContext('2d'), Wd = 160, Hd = 96;
    if (!mode) { px(c, 0, 0, '#06080a', Wd, Hd); scrTex.needsUpdate = true; scrGlow.intensity = 0; return; }
    px(c, 0, 0, '#140604', Wd, Hd); for (let y = 0; y < Hd; y += 2) px(c, 0, y, 'rgba(255,60,30,0.05)', Wd, 1);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (mode === 'broke') {
      const sec = cdown(t);
      const fl = Math.floor(t * 4) % 2 === 0; if (fl) px(c, 0, 0, 'rgba(255,0,0,0.14)', Wd, Hd);
      c.fillStyle = '#ffd8c8'; c.font = 'bold 10px monospace'; c.fillText('YOU BROKE', Wd / 2, 14); c.fillStyle = '#ff3a2a'; c.font = 'bold 15px monospace'; c.fillText('RULE 3', Wd / 2, 30);
      px(c, 20, 40, '#5a1a10', 120, 1); c.fillStyle = sec <= 3 ? '#ff2a1a' : '#ffb030'; c.font = 'bold 40px monospace'; c.fillText(String(sec), Wd / 2, 70);
      px(c, 10, 88, '#5a1a10', 140, 4); px(c, 11, 89, '#ff2a1a', Math.round(138 * sec / 10), 2);
    } else {
      c.fillStyle = '#ff2a1a'; c.font = 'bold 15px monospace'; c.fillText('00:05', Wd / 2, 24);
      px(c, 10, 6, '#5a1a10', 140, 6); px(c, 11, 7, '#ff2a1a', 12, 4);
      btn(c, 8, '#d01e14', 'LEAVE', 'Exit the train', mode === 'leave'); btn(c, 86, '#f0f0f0', 'STAY', 'Remain on board', mode === 'stay');
    }
    scrTex.needsUpdate = true; scrGlow.intensity = 0.8;   // v2: interior neutro (la pantalla tenia todo rojo)
  }

  const vign = (k) => (lt, dt, a, o) => { const c = o.tctx, gg = c.createRadialGradient(LW / 2, LH * 0.45, LW * 0.35, LW / 2, LH * 0.5, LH * 0.7); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = gg; c.fillRect(0, 0, LW, LH); };
  // etiquetas (ep9): placa RE con numero + linea a un punto 3D; placa fija arriba a la derecha en cada rama
  const plate = (c, x, y, txt, col, k = 1) => {
    const w = Math.round((textWidth(txt, 2) + 18) * k), h = Math.round(26 * k), x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
    c.fillStyle = 'rgba(4,8,18,0.88)'; c.fillRect(x0, y0, w, h); px(c, x0, y0, col, w, 2); px(c, x0, y0 + h - 2, col, w, 2); px(c, x0, y0, col, 2, h); px(c, x0 + w - 2, y0, col, 2, h);
    bitText(c, txt, x, y, 2, col, { outline: '#000000' });
  };
  const POPK = (dt) => dt < 0 ? 0 : dt < 0.07 ? 0.7 : dt < 0.14 ? 1.08 : 1;
  const tag = (o, camera, p3, txt, col, lx, ly, t, tw) => {
    if (t < tw - 0.05) return; const c = o.tctx, [x, y] = L.toScreen(camera, p3.x, p3.y, p3.z), k = POPK(t - tw + 0.05);
    const n = Math.max(1, Math.round(Math.hypot(x - lx, y - ly) / 2));
    for (let i = 0; i <= n * Math.min(1, (t - tw + 0.05) / 0.15); i++) { const u = i / n; px(c, Math.round(lx + (x - lx) * u) - 1, Math.round(ly + (y - ly) * u) - 1, '#000000', 4, 4); px(c, Math.round(lx + (x - lx) * u), Math.round(ly + (y - ly) * u), col, 2, 2); }
    px(c, x - 3, y - 3, '#000000', 7, 7); px(c, x - 2, y - 2, col, 5, 5);
    plate(c, lx, ly, txt, col, k);
  };
  // etiqueta de diagrama chica (cajita borde 1 px, texto pixel ~8 px) con linea fina
  const dtag = (o, camera, p3, txt, col, lx, ly, t, tw) => { if (t < tw - 0.05) return; const c = o.tctx, [x, y] = L.toScreen(camera, p3.x, p3.y, p3.z);
    const wd = textWidth(txt, 1) + 10, k = Math.min(1, (t - tw + 0.05) / 0.15), n = Math.max(1, Math.round(Math.hypot(x - lx, y - ly)));
    for (let i = 0; i <= n * k; i++) { const u = i / n; px(c, Math.round(lx + (x - lx) * u), Math.round(ly + (y - ly) * u), col, 1, 1); }
    px(c, x - 2, y - 2, col, 4, 4); c.fillStyle = 'rgba(4,8,18,0.9)'; c.fillRect(lx - wd / 2, ly - 8, wd, 16); c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(Math.round(lx - wd / 2) + 0.5, ly - 7.5, Math.round(wd) - 1, 15);
    bitText(c, txt, lx, ly, 1, col, { outline: null }); };
  const pin = (o, txt, col) => plate(o.tctx, LW / 2 + 60, 26, txt, col);
  const RED = '#ff5a4a', WHITE = '#f0f0f0', YEL = '#ffd23f';

  const out = {};
  const sh = (id, fov, upd, ov, extra = {}) => { const c = cam(fov); out[id] = { scene: sT, camera: c, update(lt, t) { upd(lt, t, c); }, overlay(lt, dt, a, o) { vign(0.42)(lt, dt, a, o); if (ov) ov(lt, o, c, T[id] + lt); }, ...extra }; return out[id]; };
  // posiciones de Ava en el vagon (coordenadas del vagon)
  const AVA_DOOR = V(-0.85, FY, -2.75), AVA_CAB = V(-0.5, FY, -0.92);
  const idle = (sp = 0.5) => [L.seg('idle', -99, { loop: true, speed: sp })];

  // 01 gancho: dentro del vagon parado (fin de la parte 2): puertas abiertas a lo negro, pantalla 00:05 con LEAVE/STAY;
  // 1 LEAVE (rojo) a la puerta abierta, 2 STAY (blanco) a Ava
  sh('01_hook', 50, (lt, t, c) => { state({ inside: true, light: 0, em: 1, doorK: 1, hero2: true, screen: 'buttons', t, redK: 0 });
      ch2.root.position.copy(AVA_DOOR).add(V(0.25, 0, -0.6)); ch2.root.rotation.y = Math.PI / 2 + 0.5;
      ch2.pose(lt, idle(0.55), [[-99, 'scared', mouthAt(t, 'neutral')]]);
      lookIn(c, [1.25 - 0.05 * lt, 1.9, -6.2 + 0.12 * lt], [-0.9, 1.45, -2.9]); ch2.lookAt(c, 0.7, 30); },
    (lt, o, c, t) => { tag(o, c, inCar(-1.55, 1.25, -2.6), '1 LEAVE', RED, 92, 150, t, 0.35); tag(o, c, inCar(AVA_DOOR.x + 0.25, 1.35, AVA_DOOR.z - 0.6), '2 STAY', WHITE, 270, 270, t, 0.75); });
  // 01b "but who's driving it?": la puerta de la cabina entreabierta, oscuro detras; Ava gira la cabeza hacia ella (HUD de golpe)
  sh('01b_cab', 46, (lt, t, c) => { state({ inside: true, light: 0, em: 1, doorK: 1, hero2: true, screen: 'buttons', t, redK: 0, cabDoorA: 0.42 });
      ch2.root.position.copy(AVA_DOOR).add(V(0.35, 0, -0.9)); ch2.root.rotation.y = Math.PI - 0.35;
      ch2.pose(lt, idle(0.5), [[-99, 'scared', mouthAt(t, 'neutral')]]);
      lookIn(c, [0.35, 1.75, -5.6 + 0.1 * lt], [0.55, 1.5, PZ]); },
    (lt, o, c, t) => { dtag(o, c, inCar(0.62, 1.55, PZ), 'CAB', YEL, 290, 200, t, W.driving - 0.1); });
  // 02 LEAVE: la pantalla, LEAVE apretado (rojo); placa 1 LEAVE fija arriba
  sh('02_leave', 40, (lt, t, c) => { state({ inside: true, light: 0, em: 0.6, doorK: 1, screen: t >= W.red - 0.05 ? 'leave' : 'buttons', t, redK: 0 });
      lookIn(c, [-0.5, 2.3, PZ - 2.3 + 0.1 * lt], [-0.55, 2.4, PZ - 0.06]); },
    (lt, o) => pin(o, '1 LEAVE', RED));
  // ---------- rama LEAVE: Ava baja al tunel (mundo) ----------
  const TW0 = T['02b_step'], WALK = 1.05;
  const avaZ = (t) => -137.6 - WALK * Math.max(0, Math.min(t, W.turn - 0.05) - TW0);   // camina hacia -z hasta que se da vuelta
  const AX = 6.72, AY = TIE;
  const walkPose = (lt, t, faces) => { const tStop = W.turn - 0.05 - T[curShot(t)]; ch3.pose(lt, [L.seg('walk', -99, { loop: true }), L.seg('idle', tStop, { fade: 0.25, loop: true, speed: 0.5 })], faces); };
  const curShot = (t) => { let id = '02b_step'; for (const k of ['02b_step', '02c_rail', '03_steps', '03b_turn', '03c_back', '04_fudge']) if (t >= T[k]) id = k; return id; };
  const turnK = (t) => ease(W.turn - 0.05, W.turn + 0.55, t);
  const placeAva3 = (t) => { ch3.root.position.set(AX, AY, avaZ(t)); ch3.root.rotation.y = Math.PI + Math.PI * turnK(t); };
  // 02b "So you step off into the tunnel": desde el tunel, el vagon abierto iluminado; Ava se aleja de la puerta por el costado
  sh('02b_step', 50, (lt, t, c) => { state({ s: S0, doorK: 1, hero3: true, t, redK: 1, hl: 0 }); carT1.lamps.forEach((p) => { p.visible = true; }); trainGlow.intensity = 3; trainGlow.position.copy(inCar(-1.9, 1.6, -2.6));
      placeAva3(t); walkPose(lt, t, [[-99, 'scared', 'neutral']]); torchOn(true, 0.9);
      look(c, V(6.6, 0.45, -143.6 + 0.1 * lt), V(6.4, -0.05, -137.5)); },
    (lt, o) => pin(o, '1 LEAVE', RED));
  // 02c tercer riel: camara baja delante; Ava pasa junto al riel cubierto; THIRD RAIL y 600 V en sus palabras
  sh('02c_rail', 44, (lt, t, c) => { state({ s: S0, doorK: 1, hero3: true, t, redK: 1 }); placeAva3(t); walkPose(lt, t, [[-99, 'scared', 'neutral']]); torchOn(true, 0.9);
      const z = avaZ(t); look(c, V(6.05, -0.62, z - 4.6), V(6.55, -0.2, z + 0.3)); },
    (lt, o, c, t) => { pin(o, '1 LEAVE', RED); const z = avaZ(t); dtag(o, c, V(R3X, -0.8, z - 1.6), 'THIRD RAIL', YEL, 96, 420, t, W.third); dtag(o, c, V(R3X, -0.8, z - 2.2), '600 VOLTS', '#ff4030', 250, 470, t, W.six); });
  // 03 "Then footsteps behind you": de frente, Ava camina hacia camara con la linterna, ojos de reojo; lo negro detras
  sh('03_steps', 40, (lt, t, c) => { state({ s: S0, doorK: 1, hero3: true, t, redK: 1 }); placeAva3(t); walkPose(lt, t, [[-99, 'scared', 'neutral']]); torchOn(true, 0.9);
      const z = avaZ(t); look(c, V(6.3, 0.62, z - 2.4), V(6.7, 0.5, z)); ch3.lookAt(c, 0.55, 25); },
    (lt, o) => pin(o, '1 LEAVE', RED));
  // 03b "and you turn around": sobre su hombro; se da vuelta y la linterna encuentra al gigante, que sale de lo negro caminando lento
  // (primero la luz verde del pecho, despues el cuerpo); las lamparas detras de ella estan apagadas
  const GXL = 6.5;   // el gigante camina por el costado del tunel
  const gz = (t) => avaZ(t) + 3.0 + 5.2 * (1 - ease(W.turn - 0.9, W.turn + 2.1, t));
  const gStep = (t) => (avaZ(t) + 8.2 - gz(t)) / 1.64;   // fase del paso = distancia recorrida (zancada 1,64 m): los pies no patinan
  sh('03b_turn', 46, (lt, t, c) => { state({ s: S0, doorK: 1, hero3: true, t, redK: 0.6 }); darkBehind(); placeAva3(t); walkPose(lt, t, [[-99, 'scared', 'neutral'], [W.turn - T['03b_turn'] + 0.3, 'shocked', 'gasp']]); torchOn(true, 1);
      stalk(GXL, gz(t), Math.PI, { ph: gStep(t), w: 1, grip: 0.3, t, face: 0.6 * ease(W.turn + 0.6, W.turn + 1.4, t) }, TIE);
      fillT.color.set(0x8ea4d8); fillT.intensity = 2.6 * ease(T['03b_turn'], T['03b_turn'] + 0.8, t); fillT.position.set(GXL - 0.2, 2.2, gz(t) + 1.4);   // contraluz suave: la silueta se lee, sigue saliendo de lo oscuro
      const z = avaZ(t); look(c, V(AX - 0.3, 0.75, z - 1.7), V(AX - 0.05, 0.95, z + 4.0)); },
    (lt, o) => pin(o, '1 LEAVE', RED));
  // 03c plano grande desde la espalda del gigante (~70 % del cuadro), Ava chica al fondo con la linterna (gramatica RE3, STALKER.md); da un paso pesado
  sh('03c_back', 50, (lt, t, c) => { state({ s: S0, doorK: 1, hero3: true, t, redK: 0.6 }); darkBehind(); placeAva3(t); ch3.pose(lt, idle(0.5), [[-99, 'shocked', 'gasp']]); torchOn(true, 1);
      fillT.intensity = 1.6; fillT.position.set(6.9, 1.2, gz(T['03c_back']) + 2.0); const k = L.smooth(lt / 1.25), z0 = gz(T['03c_back']); stalk(GXL, z0 - 0.82 * k, Math.PI, { ph: gStep(T['03c_back']) + 0.5 * k, w: 1, grip: 0.35 + 0.35 * k, reach: 0.12 * k, t }, TIE);
      look(c, V(7.05, 0.3, z0 + 2.5 - 0.12 * lt), V(6.2, 0.55, avaZ(t))); ch3.lookAt(c, 0.6, 25); },
    (lt, o) => pin(o, '1 LEAVE', RED));
  // 04 "Oh, fudge": se vuelve para correr, de frente a camara; el gigante detras, inclinado sobre ella, los dientes enormes a la luz
  sh('04_fudge', 42, (lt, t, c) => { state({ s: S0, doorK: 1, hero3: true, t, redK: 0.6 }); darkBehind(); placeAva3(t); ch3.root.rotation.y = Math.PI * (2 - L.smooth(lt / 0.45));
      ch3.pose(lt, idle(0.5), [[-99, 'scared', mouthAt(t, 'neutral')]]); torchOn(true, 1);
      const z = avaZ(t), kc = L.smooth(lt / 1.3), z0 = gz(T['03c_back']) - 0.82; stalk(GXL, z0 - 0.75 * kc, Math.PI, { ph: gStep(T['03c_back']) + 0.5 + 0.5 * kc, w: 1, duck: 0.35 * kc, pitch: -0.25 * kc, reach: 0.15 + 0.4 * kc, grip: 0.2, t, face: 4.0 }, TIE);
      look(c, V(AX - 0.1, 0.62, z - 1.75), V(AX - 0.05, 1.22, z + 1.2)); ch3.lookAt(c, 0.7 * L.smooth((lt - 0.3) / 0.3), 30); },
    (lt, o) => pin(o, '1 LEAVE', RED));
  // 05 rebobinado: glitch sobre YOU DIED y la rama LEAVE hacia atras, rapido, con capa VHS (ep9)
  const REV = ['02b_step', '02c_rail', '03_steps', '03b_turn', '03c_back', '04_fudge'];
  { const c = cam(46), G0 = 0.35;
    out['05_rewind'] = { scene: sT, camera: c, update(lt) {
      const t0s = REV.map((id) => T[id]), tA = T['02b_step'] + 0.1, tB = T['04c_died'] - 0.05, D = T['06_stay'] - T['05_rewind'];
      const u = lt < G0 ? 0 : L.clamp01((lt - G0) / (D - G0 - 0.03)); const tb = lt < G0 ? tB : tB - (tB - tA) * u;
      let k = 0; while (k < REV.length - 1 && tb >= t0s[k + 1]) k++;
      const s = out[REV[k]]; s.update(tb - t0s[k], tb);
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
  // ---------- rama STAY ----------
  // 06 STAY: la pantalla, STAY apretado (blanco); placa 2 STAY fija
  sh('06_stay', 40, (lt, t, c) => { state({ inside: true, light: 0, em: 0.6, doorK: 1, screen: t >= W.white - 0.05 ? 'stay' : 'buttons', t, redK: 0 });
      lookIn(c, [-0.7, 2.25, PZ - 2.2 + 0.1 * lt], [-0.5, 2.4, PZ - 0.06]); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 06b las puertas se cierran en 'close' y la sonrisa queda afuera, pegada al vidrio
  const CLIPOUT = new THREE.Plane(V(1, 0, 0), -6.12);   // la criatura solo existe fuera del vagon (x >= 6.12 en mundo)
  sh('06b_close', 48, (lt, t, c) => { const kc = ease(W.close - 0.1, W.close + 0.4, t);
      state({ inside: true, light: ease(W.close, W.close + 0.5, t), em: 1, doorK: 1 - kc, hero2: true, screen: 'stay', t, redK: 0 });
      outVoid.visible = false; const dp = inCar(-1.56, 0, -2.6), ks = ease(W.close - 0.2, W.close + 0.9, t), kh = ease(W.smile6 - 0.35, W.smile6 - 0.05, t);
      stalk(6.95 - 0.12 * ks, dp.z, -Math.PI / 2, { ph: 0.5 * ks, w: 1, duck: 0.2, pitch: -0.15, reach: 0.25 + 0.55 * kh, grip: 0.3 * (1 - kh), t, face: 1.8 * ease(W.close, W.close + 0.6, t), clip: CLIPOUT }, TIE);
      { const u = t - W.smile6; const d = u > 0 && u < 0.5 ? 0.018 * Math.sin(u * 42) * (1 - u / 0.5) : 0; leaves.forEach((lf) => { if (lf.userData.s === -1 && Math.abs(lf.userData.z + 2.6) < 0.1) lf.position.x = lf.userData.x0 + d; }); }   // golpe de la manopla: solo tiemblan las hojas
      ch2.root.position.set(-0.75, FY, -2.25); ch2.root.rotation.y = -Math.PI / 2 + 0.5;
      ch2.pose(lt, idle(0.5), [[-99, 'surprised', 'gasp'], [W.smile6 - T['06b_close'], 'scared', 'neutral']]);
      lookIn(c, [1.05, 1.6, -4.05], [-1.4, 1.45, -2.5]); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 06c "Then the train speeds up": camara baja junto al segundo cambio de via; el tren llega a toda velocidad y cambia de via
  sh('06c_speed', 50, (lt, t, c) => { state({ s: sAt(t), t, redK: 1, hl: 1 });
      fillT.distance = 12; fillT.intensity = 7; fillT.position.set(3.0, 1.6, -SW - 1); look(c, V(0.4, 1.35, -SW - 5.2), V(4.2, -1.0, -SW + 0.6)); },
    (lt, o, c, t) => { pin(o, '2 STAY', WHITE); dtag(o, c, V(4.6 - 0.62, -0.95, -SW - 0.5), 'SWITCH', YEL, 270, 330, t, T['06c_speed'] + 0.15); });
  // 06d "with nobody driving": dentro de la cabina, detras del asiento vacio; el tunel corre por el parabrisas; la palanca sola
  sh('06d_empty', 68, (lt, t, c) => { state({ s: sAt(t), inside: true, light: 1, t, redK: 1, cabK: 2.2, cabDoorA: 0.42, screen: 'stay' }); cabFill.intensity = 2.2;
      lookIn(c, [-0.45, 2.05, -1.9 + 0.05 * lt], [-0.5, 0.85, 0.6]); },
    (lt, o, c, t) => { pin(o, '2 STAY', WHITE); dtag(o, c, inCar(-0.5, FY + 0.62, -1.35), 'NOBODY', '#ff4030', 90, 470, t, W.nobody); });
  // 07 "Trains have a dead man's switch": primer plano de la manija con el pomo rojo
  sh('07_dms', 34, (lt, t, c) => { state({ s: sAt(t), inside: true, light: 1, t, redK: 1, cabK: 1 });
      lookIn(c, [-0.05, CH + 0.62, -1.2 + 0.05 * lt], [-0.5, CH + 0.28, -0.45]); },
    (lt, o, c, t) => { pin(o, '2 STAY', WHITE); const k = gripL(0); dtag(o, c, k.clone(), "DEAD MAN'S SWITCH", YEL, 180, 150, t, W.switch7); });
  // 07b "If the driver lets go, it brakes on its own": diagrama: la palanca fantasma salta sola al freno
  sh('07b_letgo', 40, (lt, t, c) => { state({ s: sAt(t), inside: true, light: 1, t, redK: 1, cabK: 1 });
      ghostArm.visible = true; ghostArm.rotation.x = A_PWR + (A_BRK - A_PWR) * ease(W.lets, W.lets + 0.5, t);
      lookIn(c, [-1.25, CH + 0.55, -0.85 + 0.05 * lt], [-0.45, CH + 0.2, -0.5]); },
    (lt, o, c, t) => { pin(o, '2 STAY', WHITE); ghostArm.updateMatrixWorld(true); dtag(o, c, ghostArm.localToWorld(V(0, ARM, 0)), 'LET GO', '#9cf0ff', 110, 170, t, W.lets); dtag(o, c, inCar(-0.5, CH + 0.1, -0.74), 'BRAKES', '#62f05a', 250, 430, t, W.brakes); });
  // 07c "this one doesn't": mas abierto, la palanca atada con cinta gris hacia adelante
  sh('07c_tape', 38, (lt, t, c) => { state({ s: sAt(t), inside: true, light: 1, t, redK: 1, cabK: 1 });
      lookIn(c, [0.25, CH + 0.5, -1.05 - 0.04 * lt], [-0.5, CH + 0.12, -0.5]); },
    (lt, o, c, t) => { pin(o, '2 STAY', WHITE); dtag(o, c, inCar(-0.5, CH + 0.06, -0.38), 'TAPED DOWN', '#ff4030', 230, 170, t, T['07c_tape'] + 0.25); });
  // 08 FILE: la hoja NIGHT SHIFT pegada en la puerta de la cabina; reglas 1 y 2 (ep4/ep9), regla 3 palabra a palabra
  { const fs = new THREE.Scene(); fs.background = new THREE.Color(0x000000); const fc = cam(45);
    const PXL = 28, PYT = 62, PWd = 304, PHd = 380, INK = '#2a2016', TEAR = 206, R = L.rng(404);
    const tear = []; for (let x = 0; x < PWd; x++) tear.push(TEAR + Math.round(3 * Math.sin(x * 0.53) + 2 * Math.sin(x * 1.7 + 1) + R() * 3));
    const paper = (() => { const cv = document.createElement('canvas'); cv.width = PWd; cv.height = PHd; const c = cv.getContext('2d'), img = c.createImageData(PWd, PHd); const r = L.rng(7);
      for (let y = 0; y < PHd; y++) for (let x = 0; x < PWd; x++) { const i = (y * PWd + x) * 4, e = Math.min(x, y, PWd - 1 - x, PHd - 1 - y), edge = e < 8 ? (8 - e) * 5 : 0, n = (r() - 0.5) * 14, fib = Math.abs(y - tear[x]) < 2 ? -40 : 0;
        img.data[i] = 222 + n - edge + fib; img.data[i + 1] = 212 + n - edge * 1.2 + fib; img.data[i + 2] = 176 + n - edge * 1.6 + fib; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0); c.fillStyle = 'rgba(230,230,210,0.8)'; c.fillRect(20, -2, 46, 12); c.fillRect(PWd - 66, -2, 46, 12);
      c.fillStyle = 'rgba(200,200,190,0.55)'; for (const x of [40, 150, 250]) c.fillRect(x, TEAR - 8, 30, 16);   // cinta sobre el desgarro (la hoja de la parte 2, pegada)
      c.strokeStyle = 'rgba(120,80,30,0.22)'; c.lineWidth = 2; c.beginPath(); c.arc(268, 28, 15, 0, 6.3); c.stroke(); return cv; })();
    const R3 = [['NEVER', W.never8], ['ENTER', W.enter8], ['THE', W.the8], ['CAB.', W.cab8]];
    out['08_rule'] = { scene: fs, camera: fc, update() {}, overlay(lt, dt, a, o) {
      const c = o.tctx, t = T['08_rule'] + lt, prev = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
      px(c, 14, 30, '#2c3040', 332, 22); px(c, 14, 30, '#7a8094', 332, 1); px(c, 18, 34, '#04060e', 324, 14);
      bitText(c, 'FILE', 40, 41, 1, '#9cf09c', { outline: null }); bitText(c, 'CAB DOOR', 300, 41, 1, '#c8ccd8', { outline: null });
      const Y = PYT + Math.round(6 * (1 - ease(0, 0.3, lt)));
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(PXL + 4, Y + 4, PWd, PHd); c.drawImage(paper, PXL, Y);
      bitText(c, 'NIGHT SHIFT', LW / 2, Y + 34, 2, INK, { outline: null }); bitText(c, 'INSTRUCTIONS', LW / 2, Y + 56, 2, INK, { outline: null });
      bitText(c, 'STAFF ONLY', LW / 2, Y + 76, 1, '#8a1810', { outline: null }); px(c, PXL + 16, Y + 88, PWd - 32, 1, INK);
      const wrap = (words, x0, y0) => { let x = x0, y = y0; for (const [w, tw, cl] of words) { const wd = textWidth(w, 2); if (x + wd > 316) { x = x0; y += 22; } if (t >= tw) left(c, w, x, y, 2, cl || INK); x += wd + 10; } };
      left(c, '1.', 44, Y + 112, 2, INK); wrap('NEVER BOARD AN EMPTY TRAIN.'.split(' ').map((w) => [w, -1, null]), 70, Y + 112);
      left(c, '2.', 44, Y + 166, 2, INK); wrap("IF YOU HEAR FOOTSTEPS BEHIND YOU, DON'T TURN AROUND.".split(' ').map((w) => [w, -1, null]), 70, Y + 166);
      left(c, '3.', 44, Y + 262, 2, t >= W.three8 - 0.05 ? '#a01808' : INK); wrap(R3.map(([w, tw]) => [w, tw - 0.03, '#a01808']), 70, Y + 262);
      if (t >= W.three8 - 0.05) { const k = POPK(t - W.three8 + 0.05); c.strokeStyle = '#d01e14'; c.lineWidth = 2; c.strokeRect(36, Y + 246 - 4 * k, 290, 34 + 8 * k); }
      c.imageSmoothingEnabled = prev;
      pin(o, '2 STAY', WHITE);
    } };
  }
  // 08b "You go in anyway": desde dentro de la cabina; Ava empuja la puerta entreabierta (push_door, una vez) y entra
  sh('08b_enter', 48, (lt, t, c) => { const ko = ease(0.25, 0.9, lt); state({ s: sAt(t), inside: true, light: 1, hero2: true, t, redK: 1, cabK: 1, cabDoorA: 0.42 + 1.1 * ko });
      const kw = ease(0.55, 1.5, lt); ch2.root.position.copy(V(0.6, FY, PZ - 0.55)).lerp(V(0.2, FY, -1.25), kw); ch2.root.rotation.y = -0.25 * kw;
      ch2.pose(lt, [L.seg('push_door', 0, { from: 0.1, speed: 1.0 }), L.seg('walk', 0.6, { fade: 0.2, loop: true }), L.seg('idle', 1.55, { fade: 0.25, loop: true, speed: 0.5 })], [[-99, 'angry', 'neutral']]);
      lookIn(c, [-0.15, 1.8, -3.75], [0.7, 1.35, PZ + 0.35]); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 08c "rip the tape off the lever": primer plano; mano izquierda en la manija, la derecha arranca la cinta (la tira sigue a la mano)
  const ripK = (t) => ease(W.rip - 0.05, W.rip + 0.6, t);
  const cabPose = (lt, t, mode) => {   // mode: 'rip' | 'pull'
    ch2.root.position.copy(AVA_CAB); ch2.root.rotation.y = 0;
    ch2.pose(lt, idle(0.4), [[-99, 'angry', mouthAt(t, 'neutral')]]); ch2.root.updateMatrixWorld(true);
    const kp = mode === 'pull' ? ease(W.pull - 0.05, W.pull + 0.55, t) : 0; arm.rotation.x = A_PWR + (A_BRK - A_PWR) * kp; ch2.root.position.z = AVA_CAB.z - 0.08 * kp; ch2.root.updateMatrixWorld(true);
    const sh0 = ch2.root.localToWorld(V(0, 1.35, 0)), poleL = sh0.clone().add(inCar(0.5, -0.5, -0.3).sub(inCar(0, 0, 0))), poleR = sh0.clone().add(inCar(-0.5, -0.5, -0.3).sub(inCar(0, 0, 0)));
    reach('L', gripL(1), poleL);
    if (mode === 'pull') { reach('R', gripL(-1), poleR); tapeOff(); tapeFloor.visible = true; return; }
    const k = ripK(t), start = inCar(-0.58, CH + 0.1, -0.36), endP = inCar(-0.95, CH + 0.62, -0.7), path = start.clone().lerp(endP, k).add(inCar(0, 0.12 * Math.sin(Math.PI * k), 0).sub(inCar(0, 0, 0)));
    reach('R', path, poleR); ch2.root.updateMatrixWorld(true);
    tapeOn(); if (k > 0.02) { const hp = cab.worldToLocal(ch2.hand('R').getWorldPosition(V())); const a1 = cab.worldToLocal(arm.localToWorld(V(0, 0.12, 0.012)));
      setStrip(strips2[0], k < 0.35 ? a1 : a1.clone().lerp(hp, 0.6), hp); strips2[2].visible = k < 0.35; strips2[1].visible = true; }
  };
  sh('08c_tape', 58, (lt, t, c) => { state({ s: sAt(t), inside: true, light: 1, hero2: true, t, redK: 1, cabK: 1, cabDoorA: 1.52 }); cabPose(lt, t, 'rip');
      lookIn(c, [0.55, CH + 0.82, -0.27], [-0.6, CH + 0.22, -0.72]); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 08d "and pull the brake": mas abierto de costado; las dos manos en la manija, tira hacia atras; el tunel se frena en el parabrisas
  sh('08d_brake', 54, (lt, t, c) => { state({ s: sAt(t), inside: true, light: 1, hero2: true, t, redK: 1, cabK: 1, cabDoorA: 1.52 }); cabPose(lt, t, 'pull');
      lookIn(c, [1.0, 2.3, -0.12], [-0.45, 1.72, -1.0]); ch2.lookAt(c, 0.35, 20); },
    (lt, o, c, t) => { pin(o, '2 STAY', WHITE); dtag(o, c, gripL(0), 'BRAKE', '#62f05a', 110, 180, t, W.brake8); });
  // 08e (···): afuera, junto a las ruedas: chispas, el tren frena
  sh('08e_sparks', 48, (lt, t, c) => { state({ s: sAt(t), t, redK: 1, hl: 1 }); const v = vAt(t); setSparks(t, L.clamp01(v / 8) * (t < TSTOP ? 1 : 0), c);
      const sm = sAt(T['08e_sparks'] + 0.8); look(c, V(XS(sm) + 1.95, -0.62, -sm + 2.2 - 2.8), V(XS(sm) + 0.7, -0.85, -sm + 2.2 + 0.6)); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 09 "It stops in the dark": de frente al tren parado; las lamparas rojas se apagan, los faros parpadean
  const flick = (t, seed = 1) => { const f = Math.floor(t * 2.5), r = L.rng(seed * 977 + f)(); return r > 0.72 ? 1 : r > 0.38 ? 0.55 : 0.25; };   // parpadeo lento y suave (sin estrobo)
  sh('09_stop', 46, (lt, t, c) => { const kd = ease(W.dark - 0.2, W.dark + 0.3, t); state({ s: sAt(t), t, redK: 1 - kd, hl: 0.25 + 0.75 * flick(t, 3) }); hemT.intensity = Math.max(hemT.intensity, 0.4); fillT.distance = 16; fillT.intensity = 5; fillT.position.set(XS(SSTOP) - 1.2, 1.9, -SSTOP - 6);
      const s = SSTOP; look(c, V(XS(s) - 1.6, 0.3, -s - 9 + 0.15 * lt), V(XS(s) + 0.2, 0.2, -s)); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  const REARPL = (() => { placeT(SSTOP); carT1.g.updateMatrixWorld(true); const n = V(0, 0, -1).applyQuaternion(carT1.g.quaternion).normalize(), p0 = inCar(0, 0, -15.34); return new THREE.Plane(n, -n.dot(p0)); })();   // el gigante solo existe detras del muro del fondo
  const nextGiant = (t, xs, zl, face) => { const p = inCar(xs, FY - 0.95, zl); return stalk(p.x, p.z, carT1.g.rotation.y, { duck: 0.35, pitch: -0.1, grip: 0.4, t, face, clip: REARPL }, p.y); };   // agachado: solo se ve del pecho arriba por la ventana
  // 09b "Then footsteps in the next car": desde la cabina mirando el vagon hasta la puerta del fondo; las tiras parpadean
  sh('09b_next', 44, (lt, t, c) => { state({ s: SSTOP, inside: true, light: (i) => flick(t + i * 0.13, 7 + (i % 3)), em: 1, hero2: true, t, redK: 0, cabK: 0.6, cabDoorA: 1.52 });
      nextGiant(t, 0.75 * (1 - ease(W.car9 - 0.7, W.car9 + 0.5, t)), -16.15, 0.8);
      ch2.root.position.copy(V(0.95, FY, -3.3)); ch2.root.rotation.y = Math.PI + 0.1; ch2.pose(lt, idle(0.45), [[-99, 'scared', 'neutral']]);
      lookIn(c, [0.6, 1.85, -1.45], [0.0, 1.75, -15.3]); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 09c "the smile got on board": la ventana de la puerta del fondo: los dos ojos y la sonrisa que se abre en lo negro
  sh('09c_smile', 36, (lt, t, c) => { state({ s: SSTOP, inside: true, light: (i) => flick(t + i * 0.13, 7 + (i % 3)) * (i > 10 ? 1 : 0.3), em: 1, t, redK: 0, cabK: 0.4, cabDoorA: 1.52 });
      nextGiant(t, 0, -16.15 + 0.3 * L.smooth(lt / 1.5), 1.2 + 1.4 * ease(W.smile9 - 0.2, W.smile9 + 0.4, t));
      lookIn(c, [0.05, 1.95, -12.4 + 0.35 * lt], [0.0, FY + 1.45, -15.3]); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 10 "Ten seconds": la pantalla YOU BROKE RULE 3 con la cuenta desde 10; las puertas se abren solas
  sh('10_count', 40, (lt, t, c) => { state({ s: SSTOP, inside: true, light: 0, em: 1, t, redK: 0, screen: 'broke', doorK: ease(W.ten, W.ten + 0.8, t) });
      lookIn(c, [-0.35, 2.2, PZ - 2.1 + 0.12 * lt], [-0.55, 2.38, PZ - 0.06]); },
    (lt, o) => pin(o, '2 STAY', WHITE));
  // 10 DECISION (gramatica RE3 del STALKER.md, como el largo 3 / ep14): corte seco -> destello 0,5 -> NEGATIVO congelado sin texto 2,5 ->
  // parpadeo negro + destello 0,5 -> NEGATIVO con las dos opciones 2,4 -> parpadeo + destello 0,5 -> vuelve el color con el mismo encuadre:
  // caja azul en la opcion que nombra la voz, cuenta, menu vivo, COMMENT 1 OR 2 + FOLLOW FOR MORE!. Todo el tiempo el cazador golpea la puerta
  // del fondo (solo la hoja cede y rebota, el vidrio se raja de a poco), en camara lenta. Sin subtitulos encima.
  const DZD = { flash1: [0, 0.5], neg1: [0.5, 3.0], blink1: [3.0, 3.5], neg2: [3.5, 5.9], blink2: [5.9, 6.4] };
  const HITS = [0.0, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6, 6.4];   // golpes en tiempo de historia
  const storyT = (lt) => lt < 3.0 ? 0.1 + 0.02 * lt : lt < 6.4 ? 1.7 + 0.02 * (lt - 3.0) : 1.9 + 0.5 * (lt - 6.4);   // congelado en los negativos, x0,5 despues
  const hitReal = (h) => h < 1.0 ? 0 : h < 1.9 ? 3.25 : 6.4 + (h - 1.9) / 0.5;   // cuadro real de cada golpe (lo usa la mezcla via cues: DEC_HITS)
  window.DEC_HITS = HITS.map(hitReal);
  const give = (u) => u < 0 ? 0 : u < 0.12 ? u / 0.12 : Math.exp(-(u - 0.12) * 5) * Math.cos((u - 0.12) * 18);
  { const c = cam(33);
    out['10_choice'] = { scene: sT, camera: c, invert: (lt) => (lt >= 0.12 && lt < 6.15) ? 1 : 0,
      update(lt, t) {
        const ts = storyT(lt); state({ s: SSTOP, inside: true, light: 0, em: 1.2, doorK: 1, hero2: true, t, redK: 0, screen: 'broke', cabK: 0.5, cabDoorA: 1.52 }); outVoid.visible = false;
        let gv = 0, n = 0, pun = 0; for (const h of HITS) { const u = ts - h; if (u >= 0) { n++; gv += give(u); } pun = Math.max(pun, Math.exp(-(((u + 0.08) / 0.18) ** 2))); }
        rearLeaf.rotation.y = -0.17 * gv; rearLeaf.position.z = -15.28 + 0.06 * Math.max(0, gv); setCrack(n);
        const p = inCar(0, FY - 0.95, -15.95); stalk(p.x, p.z, carT1.g.rotation.y, { duck: 0.3 + 0.1 * pun, pitch: -0.12, reach: 0.35 + 0.55 * pun, grip: 1, t: ts, face: 1.5, clip: REARPL }, p.y);
        ch2.root.position.set(-0.22, FY, -8.7); ch2.root.rotation.y = Math.PI - 0.55;
        ch2.pose(lt < 6.4 ? (lt < 3 ? 0.2 : 1.1) : 1.1 + 0.5 * (lt - 6.4), idle(0.5), [[-99, 'scared', 'neutral']]);
        lookIn(c, [0.5, 1.8, -4.9 + (lt < 6.4 ? 0 : 0.04 * (lt - 6.4))], [-0.05, 1.5, -15.3]); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['10_choice'] + lt, inn = (k) => lt >= DZD[k][0] && lt < DZD[k][1];
        vign(0.4)(lt, dt, a, o); cx.fillStyle = '#c4c4c0'; cx.fillRect(0, 0, LW, 26); cx.fillRect(0, LH - 26, LW, 26);
        const normal = lt >= 6.4, DK = '#141414';
        if (lt >= 3.5 && !normal) { cx.font = 'bold 16px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillStyle = DK; cx.fillText('1.  RUN FOR EXIT', 40, 470); cx.fillText('2.  LOCK THE CAB', 40, 496); }
        if (normal) {
          const kp = L.clamp01((lt - 6.4) / 0.2), PX = 26, PY = 60, PW = 308, PH = 160;
          cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH); px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
          cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
          bitText(cx, 'WHAT DO YOU DO?', LW / 2, PY + 24, 2, '#ececec', { outline: '#000000' });
          const sel = t >= W.two10 - 0.05 ? 1 : t >= W.one10 - 0.05 ? 0 : 1;   // caja azul en la opcion que nombra la voz
          [['1. RUN FOR EXIT', RED], ['2. LOCK THE CAB', WHITE]].forEach(([str, col], i) => { const y = PY + 64 + i * 38;
            if (i === sel) { cx.fillStyle = 'rgba(40,90,220,0.55)'; cx.fillRect(PX + 14, y - 15, PW - 28, 30); cx.strokeStyle = '#7ab0ff'; cx.lineWidth = 2; cx.strokeRect(PX + 14.5, y - 14.5, PW - 29, 29); cx.lineWidth = 1; }
            left(cx, str, 66, y, 2, i === sel ? col : '#8a8a8a', { outline: '#000000' }); });
          const sec = cdown(t); bitText(cx, `00:${String(sec).padStart(2, '0')}`, LW / 2, PY + PH - 14, 1, sec <= 3 ? '#ff2a1a' : '#ffb030', { outline: '#000000' });
          if (t >= W.comment) { const bq = Math.round(3 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, 548 + bq, 2, '#ffd23f', { outline: '#000000' }); }
          if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, 590, 2, '#ececec', { outline: '#000000' }); }
        const ramp = (a0, a1) => Math.sin(Math.PI * L.clamp01((lt - a0) / (a1 - a0)));
        let w = 0, bk = 0; if (inn('flash1')) w = ramp(0, 0.5); if (inn('blink1')) { bk = lt < 3.25 ? ramp(3.0, 3.5) * 1.6 : 0; w = lt >= 3.25 ? ramp(3.25, 3.75) : 0; } if (inn('blink2')) { bk = lt < 6.15 ? ramp(5.9, 6.4) * 1.6 : 0; w = lt >= 6.15 ? ramp(6.15, 6.65) * 0.8 : 0; }
        if (bk > 0) { cx.fillStyle = `rgba(0,0,0,${Math.min(1, bk)})`; cx.fillRect(0, 0, LW, LH); } if (w > 0) { cx.fillStyle = `rgba(255,255,255,${0.9 * w})`; cx.fillRect(0, 0, LW, LH); } } };
  }
  // ---------- portada vertical (?thumb): Ava en la pose aprobada (thumb_post.js del ep14: 3/4, pistola negra a dos manos, rodillas
  // flexionadas) en el tunel rojo; detras, el gigante con los dientes a la luz y la luz verde del pecho. HUD real SUBWAY · Danger al ~48 % del ancho.
  if (L.QS.has('thumb')) {
    window.GUN_SIZE = 0.32; window.WORDS_OVERRIDE = []; const TP = await import('../thumb_post.js'); await TP.init();
    ch2.root.parent.remove(ch2.root);   // thumb_post busca la primera Ava de la escena: solo queda la del tunel
    const c = cam(Number(L.QS.get('tfov') ?? 42)); const AXT = 5.3, AZT = -150;
    out['01_hook'] = { scene: sT, camera: c, gamma: 0.8, hard: true, update(lt) { const t = 1; state({ s: S0, doorK: 1, hero3: true, t, redK: 1 }); darkBehind(); torch.visible = false;
        stalk(AXT - 1.45, AZT - 2.55, 0.3, { grip: 0.7, pitch: -0.05, tilt: 0.15, reach: 0.3, t, face: 4.5 }, TIE); fillT.distance = 7; fillT.intensity = 3; fillT.color.set(0x9fb4e8); fillT.position.set(AXT - 1.2, TIE + 2.6, AZT - 4.2);
        ch3.root.position.set(AXT, TIE, AZT); ch3.pose(0, L.still('pistol_ready', 1.0), [[-99, 'angry', 'neutral']]);
        TP.apply({ scene: sT }, 0, { clip: 'pistol_ready', ct: 0.4, local: true, face: ['angry', 'frown'], gun: true, elbowR: [-0.24, 1.08, 0.14], aimR: [-0.06, 1.2, 0.4], elbowL: [0.22, 1.06, 0.16], aimL: [-0.02, 1.18, 0.36], gunDir: [0, 0.04, 1],
          legIK: { drop: 0.12, R: [-0.25, 0.12], L: [0.26, -0.05], knee: [0.1, 0, 1] }, pos: [AXT, AZT], posY: TIE, yaw: Number(L.QS.get('ty') ?? 0.95), key: [AXT + 0.75, TIE + 1.5, AZT + 1.3, '#fff4e4', 5, 6], fill: [AXT - 0.65, TIE + 1.7, AZT + 1.5, '#ffffff', 2, 6], gunColor: 0x141414 });
        look(c, V(AXT + 0.85, TIE + 0.85, AZT + 3.8), V(AXT - 0.5, TIE + 1.65, AZT - 1.7)); void lt; },
      overlay(lt, dt, a, o) { vign(0.35)(lt, dt, a, o); const cx = o.tctx; cx.save(); cx.translate(Math.round(LW * 0.48 - 67), -14); hud(o, 99, 'DANGER'); cx.restore(); } };
  }
  // ---------- poster vertical (?poster&layer=bg|ava|hud): estilo portada fija desde el ep15 (poster de cine tipo RE3): el cazador enorme arriba
  // entre la niebla, Ava al centro de frente con la pistola negra baja, zombis a los lados, luz de luna fria; niebla/DOF/reflejo y HUD se
  // componen en review/poster.py. layer=bg: todo menos Ava; ava: Ava + pistola sobre verde; hud: el HUD real sobre negro.
  if (L.QS.has('poster')) {
    window.GUN_SIZE = 0.3; window.WORDS_OVERRIDE = []; const TP = await import('../thumb_post.js'); await TP.init();
    ch2.root.parent.remove(ch2.root);
    const layer = L.QS.get('layer') || 'bg', c = cam(Number(L.QS.get('pfov') ?? 58)), PX0 = 2.3, PZ0 = -176;
    const moon = new THREE.DirectionalLight(0x8fb0ff, 1.6); moon.position.set(PX0 - 3, 9, PZ0 - 6); moon.target.position.set(PX0, 0, PZ0); sT.add(moon, moon.target); moon.visible = false;
    const rimG = new THREE.PointLight(0xb8d0ff, 0, 9, 1.2); sT.add(rimG); const rimA = new THREE.PointLight(0xc8dcff, 0, 5, 1.2); sT.add(rimA);
    const zs = []; for (const [dx, dz, ry, tt] of [[-1.05, -3.4, 0.35, 0.3], [-1.6, -5.2, 0.25, 1.1], [1.15, -3.7, -0.3, 0.7], [1.75, -5.6, -0.2, 1.5]]) {
      const z = L.ps1Clone(zG.scene); sT.add(z); const bb = new THREE.Box3().setFromObject(z); z.scale.multiplyScalar(10.0 / (bb.max.y - bb.min.y)); z.position.set(PX0 + dx, TIE, PZ0 + dz); z.rotation.y = ry; z.traverse((o) => { if (o.isMesh) [].concat(o.material).forEach((m) => m.color && m.color.multiplyScalar(0.4)); });
      const mx = new THREE.AnimationMixer(z), ac = mx.clipAction(THREE.AnimationClip.findByName(zG.animations, 'idle')); ac.play(); ac.time = tt; mx.update(0); z.visible = false; zs.push(z); }
    const hs = new THREE.Scene(); hs.background = new THREE.Color(0x000000);
    out['01_hook'] = { scene: layer === 'hud' ? hs : sT, camera: c, gamma: 0.8, hard: true, update() { const t = 1;
        if (layer === 'hud') { c.position.set(0, 0, 5); c.lookAt(0, 0, 0); return; }
        state({ s: S0 - 6, doorK: 0, hero3: layer === 'ava', t, redK: 0.15 }); redLs.forEach((q) => { q.intensity = 0; }); hemT.color.set(0x6f86c0); hemT.groundColor.set(0x101418); hemT.intensity = 0.55; torch.visible = false;
        moon.visible = true; zs.forEach((z) => { z.visible = layer === 'bg'; });
        const h = stalk(PX0 + 0.1, PZ0 - 3.6, 0, { grip: 0.6, pitch: -0.42, duck: 0.25, reach: 0.25, tilt: 0.08, t: 0.1, face: 0 }, TIE); ST.wrap.scale.setScalar(Number(L.QS.get('gs') ?? 2.0)); ST.root.updateMatrixWorld(true);
        const hh = ST.bn.head.getWorldPosition(V()); faceL.intensity = 6; faceL.distance = 4; faceL.position.copy(hh).add(V(0.3, -0.45, 1.5)); rimG.intensity = 9; rimG.position.copy(hh).add(V(-1.2, 1.2, -1.8)); void h;
        ST.wrap.visible = layer === 'bg';
        ch3.root.position.set(PX0, TIE, PZ0); ch3.root.visible = layer === 'ava';
        if (layer === 'ava') { ch3.pose(0, L.still('idle', 0.4), [[-99, 'angry', 'neutral']]);
          TP.apply({ scene: sT }, 0, { clip: 'idle', ct: 0.4, local: true, face: ['angry', 'neutral'], gun: true, elbowR: [-0.3, 1.0, -0.02], aimR: [-0.33, 0.8, 0.12], gunDir: [0.3, -0.85, 0.42], gunUp: [-1, 0, 0.25],
            pos: [PX0, PZ0], posY: TIE, yaw: Number(L.QS.get('ty') ?? 0.22), key: [PX0 + 0.9, TIE + 1.7, PZ0 + 2.0, '#e8eeff', 4, 6], fill: [PX0 - 1.0, TIE + 1.2, PZ0 + 1.6, '#9fb4e8', 2, 6], rim: [PX0 - 0.4, TIE + 2.2, PZ0 - 1.4, "#cfe0ff", 6, 4], gunColor: 0x1c1c20, isolate: true, headYaw: Number(L.QS.get('hy') ?? 0) }); }
        look(c, V(PX0 + 0.05, TIE + 1.1, PZ0 + 2.3), V(PX0, TIE + Number(L.QS.get('ly') ?? 3.1), PZ0 - 5.5)); },
      overlay(lt, dt, a, o) { if (layer !== 'hud') return; const cx = o.tctx; cx.save(); cx.translate(Math.round(LW / 2 - 59 - 8), 640 - 66 - 34 - 44); hud(o, 99, 'DANGER'); cx.restore(); } };
  }
  // ?prop=<clave>&clean=1: primeros planos de los objetos nuevos para el storyboard (sin HUD ni subtitulos)
  const PROP = L.QS.get('prop');
  if (PROP) {
    const PC = { cab: (c) => lookIn(c, [0.05, 2.25, -1.55], [-0.65, 1.3, -0.25]), spray: (c) => lookIn(c, [0.85, FY + 1.25, -0.95], [1.05, FY + 1.02, -0.45]),
      lever: (c) => lookIn(c, [0.15, CH + 0.4, -1.0], [-0.5, CH + 0.15, -0.5]), door: (c) => lookIn(c, [0.3, 1.7, -3.6], [0.6, 1.5, PZ]),
      rail: (c) => look(c, V(R3X - 0.75, -0.45, -(R3A + 20) + 1.3), V(R3X + 0.1, -0.8, -(R3A + 20))), exit: (c) => look(c, V(XR - 3.2, 1.0, exitG.position.z + 2.6), exitG.localToWorld(V(-0.2, 1.0, 0))),
      giant: (c) => { const h = ST.bn.head.getWorldPosition(V()); look(c, h.clone().add(V(0.35, -0.12, -1.35)), h.clone().add(V(0, -0.08, 0))); faceL.intensity = 3; },
      giantfull: (c) => { const h = ST.bn.head.getWorldPosition(V()); look(c, h.clone().add(V(-0.35, -0.9, -3.6)), h.clone().add(V(0.05, -1.1, 0))); faceL.intensity = 2; } };
    const propL = new THREE.PointLight(0xe8ecf4, 0, 9, 1.0); sT.add(propL);
    for (const sh0 of Object.values(out)) { const u = sh0.update; sh0.update = (lt, t) => { u(lt, t); if (PC[PROP]) { PC[PROP](sh0.camera); sh0.camera.fov = 50; sh0.camera.updateProjectionMatrix(); propL.position.copy(sh0.camera.position).add(V(0, 0.4, 0)); propL.intensity = ['rail', 'giantfull', 'exit'].includes(PROP) ? 6 : 0; } }; }
  }
  return out;
}
