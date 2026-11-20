// sets/subway2.js — ep9 "AVA: The Last Train — Part 2" (parte 2 del reel "Subway" de play.malo, analisis en
// fuentes/zombie-nicho/playmalo-subway-p2.md). Reusa el anden MERCY STREET del ep4 (sets/subway.js de zombie-04-subway: azulejo,
// granito, vias, reja EXIT, cabina, reloj, vagones foto->loft, la criatura de dos ojos) y agrega: sonrisa de la criatura, interior
// del vagon hecho en codigo (asientos, barras, ventanas, puertas con vidrio, pantalla), un tunel con cambio de via y el tunel
// desconocido, la pantalla "LAST STOP", el rebobinado VHS y el menu RE final. Tiempos: cues.json (voz/build_cues.py).
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { paintScared } from './avaface.js';

export async function shots({ L, TL, youDied }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.1, 220);   // ep8: near 0.1+ (z-fight del suelo con near 0.03)
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateProjectionMatrix(); };
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  const glb = async (n) => (await L.loadModel(`models/${n}.glb`)).scene;
  const prop = async (n) => L.ps1Clone(await glb(n));
  const PO = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 };   // capas sobre el suelo sin parpadeo

  // ================= escena 1: el anden MERCY STREET (copia del ep4) =================
  const BG = 0x0c0e14;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 14, 60);
  const hemi = new THREE.HemisphereLight(0xe8f0ff, 0x4a4a48, 1.5); scene.add(hemi);
  const keyL = new THREE.DirectionalLight(0xf4f8ff, 0.9); keyL.position.set(-1, 6, 4); keyL.target.position.set(0, 0, -4); scene.add(keyL, keyL.target);
  const carGlow = new THREE.PointLight(0xd8ecd0, 0, 6, 1.2); scene.add(carGlow);
  const blueL = new THREE.PointLight(0x6080c0, 0, 12, 1.4); scene.add(blueL);
  const tWall = L.rep(await L.loadTex('tex/sub/wall_tile.png', 96), 30, 4);
  const tGran = L.rep(await L.loadTex('tex/sub/floor_granite.png', 64), 3, 40);
  const tYel = L.rep(await L.loadTex('tex/sub/floor_yellow.png', 64), 1, 60);
  const ZA = -60, ZB = 14, ZL = ZB - ZA, ZC = (ZA + ZB) / 2;
  B(4.6, 0.1, ZL, lam(tGran, 0xd8d8d8), -2.3, -0.05, ZC, scene);
  { const y = B(0.6, 0.012, ZL, lam(tYel, 0xffffff, PO), -0.3, 0.006, ZC, scene); y.renderOrder = 1; }
  B(0.2, 1.1, ZL, lam(null, 0x55524c), -0.1, -0.55, ZC, scene);
  const tBed = L.cvs(32, 32, (c) => { const r = L.rng(41); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 30; px(c, x, y, `rgb(${40 + n},${36 + n},${32 + n})`); } });
  B(4.5, 0.05, ZL, lam(L.rep(tBed, 6, 80)), 2.25, -1.12, ZC, scene);
  const mRail = lam(null, 0x8a8a90), mTie = lam(null, 0x3a2e24);
  for (const x of [1.0, 2.44]) B(0.08, 0.14, ZL, mRail, x, -1.03, ZC, scene);
  for (let z = ZA; z < ZB; z += 0.9) B(2.6, 0.08, 0.24, mTie, 1.72, -1.08, z, scene);
  B(0.1, 4.0, ZL, lam(tWall), -4.65, 2.0, ZC, scene);
  B(0.1, 5.1, ZL, lam(L.rep(await L.loadTex('tex/sub/wall_tile.png', 96), 30, 4), 0xc8c8c8), 4.6, 1.45, ZC, scene);
  const mGreen = lam(null, 0x2f7a4a);
  B(0.06, 0.22, ZL, mGreen, -4.58, 2.55, ZC, scene); B(0.06, 0.22, ZL, mGreen, 4.53, 2.55, ZC, scene);
  B(9.4, 0.1, ZL, lam(null, 0x3a3c40), 0, 3.85, ZC, scene);
  const mCol = lam(null, 0x2c4a7a), mColD = lam(null, 0x1c3050);
  for (const z of [-8.5, -15.5, -22.5, -29.5, -36.5, -43.5]) { B(0.22, 3.8, 0.22, mCol, -1.7, 1.9, z, scene); B(0.34, 0.06, 0.34, mColD, -1.7, 0.03, z, scene); }
  const tubeOff = L.lam(null, 0x2a2c30);
  for (let z = ZB - 2; z > ZA; z -= 3.2) for (const x of [-2.6, -0.9]) { B(0.36, 0.08, 1.4, lam(null, 0x50545a), x, 3.79, z, scene); B(0.22, 0.04, 1.25, tubeOff, x, 3.74, z, scene); }   // ep9: apagados desde el ep4
  const signG = await prop('station_sign');
  for (const z of [-8.0, -20, -32]) { const s = signG.clone(); s.position.set(-4.56, 1.85, z); s.rotation.y = Math.PI / 2; scene.add(s); }
  for (const z of [-10, -26]) { const s = signG.clone(); s.position.set(4.53, 1.65, z); s.rotation.y = -Math.PI / 2; scene.add(s); }
  const benchG = await prop('bench');
  for (const z of [0.2, -11.5, -24, -36]) { const b = benchG.clone(); b.position.set(-4.25, 0, z); b.rotation.y = Math.PI / 2; scene.add(b); }
  // salida: reja cerrada con candado y cadena, EXIT, torniquetes, maquina, cabina
  const gate = new THREE.Group(); gate.position.set(-2.9, 0, 10.8); scene.add(gate);
  const mBar = lam(null, 0x1a1c20);
  for (let i = 0; i <= 18; i++) B(0.035, 2.6, 0.035, mBar, -1.7 + i * 0.19, 1.3, 0, gate);
  for (const y of [0.08, 1.3, 2.55]) B(3.5, 0.06, 0.05, mBar, 0, y, 0, gate);
  B(0.1, 0.5, 0.06, lam(null, 0xb09040), 0.05, 1.18, 0.06, gate);
  for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 4, 6), lam(null, 0x8a8a90)); l.position.set(-0.2 + i * 0.07, 1.3 + Math.sin(i) * 0.02, 0.05); l.rotation.y = i % 2 ? Math.PI / 2 : 0; gate.add(l); }
  B(9.4, 1.4, 0.1, lam(tWall), 0, 3.15, 10.7, scene);
  B(1.0, 3.9, 0.1, lam(tWall), -4.4, 1.95, 10.7, scene); B(3.0, 3.9, 0.1, lam(tWall), 1.55, 1.95, 10.7, scene);
  for (let i = 0; i < 12; i++) B(4.0, 0.18, 0.32, lam(tGran, 0xb8b8b8), -1.9, 0.09 + i * 0.18, 11.2 + i * 0.3, scene);
  B(0.1, 4.0, 4.0, lam(tWall), -3.95, 2.0, 13.0, scene); B(0.1, 4.0, 4.0, lam(tWall), 0.1, 2.0, 13.0, scene);
  B(4.0, 0.1, 4.0, lam(null, 0x3a3c40), -1.9, 4.0, 13.0, scene); B(0.5, 0.06, 1.2, L.basic(null, 0xf4fbff), -1.9, 3.94, 13.0, scene);
  const stairL = new THREE.PointLight(0xe8f0ff, 3.0, 7, 1.3); stairL.position.set(-1.9, 3.4, 12.6); scene.add(stairL);   // luz de la escalera (detras de la reja)
  const tExit = L.cvs(48, 16, (c, w, h) => { px(c, 0, 0, '#0a6a2a', w, h); px(c, 1, 1, '#22a04a', w - 2, 1); c.fillStyle = '#f4fff4'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', w / 2 - 6, h / 2 + 1); c.fillRect(37, 6, 6, 3); c.beginPath(); c.moveTo(43, 3); c.lineTo(47, 7.5); c.lineTo(43, 12); c.fill(); });
  B(0.9, 0.3, 0.08, L.basic(tExit), -2.9, 2.75, 10.55, scene);
  const turnG = await prop('turnstile');
  const turns = []; for (const x of [-3.9, -2.9, -1.9]) { const t = turnG.clone(); t.position.set(x, 0, 8.6); t.rotation.y = Math.PI / 2; scene.add(t); turns.push(t); }
  const tmG = await prop('ticket_machine'); tmG.position.set(-4.25, 0, 6.2); tmG.rotation.y = Math.PI / 2; scene.add(tmG);
  const booth = new THREE.Group(); booth.position.set(-3.75, 0, 3.6); scene.add(booth);
  const tSteel = L.cvs(32, 32, (c) => { const r = L.rng(8); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 16 + (x % 8 === 0 ? -20 : 0); px(c, x, y, `rgb(${120 + n},${122 + n},${126 + n})`); } });
  const mSt = lam(tSteel);
  B(1.7, 1.0, 2.0, mSt, 0, 0.5, 0, booth); B(1.7, 0.5, 2.0, mSt, 0, 2.55, 0, booth); B(0.1, 1.1, 2.0, mSt, -0.8, 1.55, 0, booth);
  B(1.7, 0.08, 0.1, mSt, 0, 1.03, 0.95, booth); for (const z of [-0.95, 0, 0.95]) B(0.06, 1.1, 0.06, mSt, 0.85, 1.55, z, booth);
  B(1.5, 1.0, 1.8, lam(null, 0x1a1c20), -0.05, 1.55, 0, booth);
  // reloj LED + panel NEXT TRAIN
  const clk = await prop('platform_clock'); clk.position.set(-1.6, 2.75, -1.5); scene.add(clk);
  const ledCv = document.createElement('canvas'); ledCv.width = 96; ledCv.height = 36; const ledTex = L.canvasTex(ledCv);
  const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  function drawLED(c, text, x0, y0, s, on, off) {
    let x = x0;
    for (const ch of text) {
      if (ch === ':') { px(c, x + s, y0 + 2 * s, on, s, s); px(c, x + s, y0 + 5 * s, on, s, s); x += 3 * s; continue; }
      if (ch === ' ') { x += 3 * s; continue; }
      const sg = SEG[ch] || ''; const seg = (k, X, Y, w, h) => px(c, X, Y, sg.includes(k) ? on : off, w, h);
      seg('a', x + s, y0, 2 * s, s); seg('g', x + s, y0 + 3 * s, 2 * s, s); seg('d', x + s, y0 + 6 * s, 2 * s, s);
      seg('f', x, y0 + s, s, 2 * s); seg('b', x + 3 * s, y0 + s, s, 2 * s); seg('e', x, y0 + 4 * s, s, 2 * s); seg('c', x + 3 * s, y0 + 4 * s, s, 2 * s);
      x += 5 * s;
    }
  }
  { const c = ledCv.getContext('2d'); px(c, 0, 0, '#120808', 96, 36); drawLED(c, '12:00', 10, 4, 4, '#ff2a1a', '#1c0806'); }
  for (const s of [1, -1]) L.plane(0.78, 0.29, L.basic(ledTex), 0.014, 0.203, 0.085 * s, clk, s > 0 ? 0 : Math.PI);

  // ---------- vagones (GLB foto->loft del ep4) ----------
  const carG = await glb('subway_car');
  const tInt = L.cvs(48, 72, (c, w, h) => {
    px(c, 0, 0, '#cfd8c8', w, h); px(c, 0, 0, '#f4fbee', w, 4); px(c, 0, 4, '#9aa298', w, 1);
    for (const x of [3, 26]) { px(c, x, 8, '#d8c060', 19, 7); px(c, x + 2, 10, '#3a3020', 12, 1); px(c, x + 2, 12, '#3a3020', 8, 1); }
    for (const x of [3, 26]) { px(c, x, 18, '#14181e', 19, 16); px(c, x, 18, '#3a4048', 19, 1); px(c, x + 3, 22, '#202830', 5, 8); }
    px(c, 0, 38, '#8a9088', w, 4);
    for (let x = 0; x < w; x += 8) { px(c, x, 42, '#2f56a8', 7, 9); px(c, x, 42, '#4a72c8', 7, 2); }
    px(c, 0, 51, '#1e2e5e', w, 3); px(c, 0, 54, '#6a7068', w, 18); for (let y = 56; y < h; y += 4) px(c, 0, y, '#5a6058', w, 1);
    for (const x of [11, 36]) { px(c, x, 0, '#e8ece8', 2, 54); px(c, x + 2, 0, '#8a908a', 1, 54); }
    px(c, 0, 16, '#c0c4c0', w, 1);
  });
  const tGlow = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.35, 'rgba(255,240,190,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const mkCar = () => {
    const root = L.ps1Clone(carG); const g = new THREE.Group(); g.add(root); const doors = [];
    root.traverse((o) => { if (o.isMesh && /^door_L/.test(o.name)) doors.push(o); });
    doors.forEach((d) => { d.userData.z0 = d.position.z; d.userData.dir = /a$/.test(d.name) ? 1 : -1; });
    const pics = []; for (const Y of [2.6, 6.4, 10.2, 14.0]) pics.push(L.plane(1.28, 2.0, L.basic(tInt), -1.537, 1.5, -Y, g, -Math.PI / 2));
    const lamps = [];
    for (const x of [-0.61, 0.85]) lamps.push(L.plane(1.1, 1.1, L.basic(tGlow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), x, 0.94, 0.03, g));
    const setDoors = (k) => doors.forEach((d) => { d.position.z = d.userData.z0 + d.userData.dir * 0.6 * k; });
    return { g, root, setDoors, lamps, pics };
  };

  // ---------- interior del vagon, hecho en codigo (coordenadas del vagon: suelo y=0.5, lado del anden x<0, frente z=0) ----------
  const tWallI = L.cvs(32, 32, (c) => { px(c, 0, 0, '#d8d2bc', 32, 32); const r = L.rng(91); for (let k = 0; k < 60; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(120,110,80,0.25)'); px(c, 0, 0, '#bcb59e', 32, 1); px(c, 15, 0, '#c4bda6', 1, 32); for (let k = 0; k < 6; k++) px(c, 3 + k * 5, 28, '#a8a28c', 1, 1); });
  const tFloorI = L.cvs(32, 32, (c) => { px(c, 0, 0, '#5a6062', 32, 32); const r = L.rng(17); for (let k = 0; k < 140; k++) { const v = 70 + r() * 50 | 0; px(c, r() * 32 | 0, r() * 32 | 0, `rgb(${v},${v + 4},${v + 6})`); } for (let y = 0; y < 32; y += 8) px(c, 0, y, '#4a5052', 32, 1); });
  const tSeat = L.cvs(32, 16, (c) => { px(c, 0, 0, '#2f56a8', 32, 16); for (let x = 0; x < 32; x += 8) { px(c, x, 0, '#1e3a78', 1, 16); px(c, x + 1, 1, '#4a72c8', 6, 2); } const r = L.rng(5); for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 16 | 0, 'rgba(10,20,50,0.35)'); });
  const tCeil = L.cvs(32, 32, (c) => { px(c, 0, 0, '#c8ccc4', 32, 32); for (let x = 0; x < 32; x += 8) px(c, x, 0, '#a8aca4', 1, 32); const r = L.rng(3); for (let k = 0; k < 30; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(90,90,80,0.3)'); });
  const tDoorI = L.cvs(16, 32, (c) => { px(c, 0, 0, '#9aa0a4', 16, 32); px(c, 0, 0, '#b8bec2', 16, 1); px(c, 0, 0, '#b8bec2', 1, 32); px(c, 15, 0, '#6a7074', 1, 32); px(c, 2, 26, '#e8c020', 12, 2); const r = L.rng(4); for (let k = 0; k < 14; k++) px(c, r() * 16 | 0, r() * 32 | 0, 'rgba(60,60,60,0.35)'); });
  const ADS = [['#c83a2a', 'COLD?', 'TRY HOT SOUP'], ['#2a7ac8', 'NIGHT SCHOOL', 'ENROLL NOW'], ['#e0b020', 'LOST?', 'ASK STAFF'], ['#3a9a4a', 'MERCY LINE', 'MAP 24/7']];
  const tAds = ADS.map(([bg, a, b]) => L.cvs(64, 20, (c) => { px(c, 0, 0, bg, 64, 20); px(c, 0, 0, 'rgba(255,255,255,0.3)', 64, 1); c.fillStyle = '#f8f4e8'; c.font = 'bold 8px monospace'; c.textBaseline = 'middle'; c.fillText(a, 3, 6); c.font = '6px monospace'; c.fillText(b, 3, 14); }));
  const DZ = [-2.6, -6.4, -10.2, -14.0], SEGS = [[-0.2, -1.96], [-3.24, -5.76], [-7.04, -9.56], [-10.84, -13.36], [-14.64, -15.3]];
  const FY = 0.5, CY = 2.95;
  const mkInterior = (parent, withScreen) => {
    const g = new THREE.Group(); parent.add(g); g.visible = false;
    const mW = lam(tWallI), mGlass = L.basic(null, 0x0a1018, { transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }), mFrame = lam(null, 0x6a7074), mPole = lam(null, 0xd8dce0);
    const mSeat = lam(L.rep(tSeat, 4, 1)), mBase = lam(null, 0x3a4048);
    B(2.96, 0.04, 15.2, lam(L.rep(tFloorI, 3, 15)), 0, FY - 0.02, -7.75, g);
    B(2.96, 0.04, 15.2, lam(L.rep(tCeil, 3, 15)), 0, CY + 0.02, -7.75, g);
    const stripOn = L.basic(null, 0xf6faee), stripOff = lam(null, 0x3a3c3a), strips = [];
    for (const x of [-0.55, 0.55]) for (let z = -1.0; z > -15; z -= 1.9) strips.push(B(0.16, 0.03, 1.6, stripOn, x, CY - 0.015, z, g));
    for (const s of [-1, 1]) {
      for (const [z1, z2] of SEGS) {
        const len = z1 - z2, zc = (z1 + z2) / 2;
        B(0.06, 0.95, len, mW, s * 1.5, FY + 0.475, zc, g);
        B(0.06, 0.7, len, mW, s * 1.5, 2.6, zc, g);
        L.plane(len, 0.8, mGlass, s * 1.53, 1.85, zc, g, Math.PI / 2);
        for (const z of [z1 - 0.03, z2 + 0.03, zc]) B(0.08, 0.8, 0.05, mFrame, s * 1.5, 1.85, z, g);
        if (len > 1.5) {
          L.plane(len * 0.8, 0.26, L.basic(tAds[(Math.round(zc) + (s > 0 ? 1 : 0) + 8) % 4]), s * 1.465, 2.5, zc, g, s < 0 ? Math.PI / 2 : -Math.PI / 2);
          B(0.46, 0.1, len - 0.3, mSeat, s * 1.24, FY + 0.45, zc, g); B(0.38, 0.4, len - 0.3, mBase, s * 1.27, FY + 0.2, zc, g); B(0.07, 0.5, len - 0.3, mSeat, s * 1.43, FY + 0.78, zc, g);
        }
      }
      for (const z of DZ) {
        B(0.06, 0.45, 1.28, mW, s * 1.5, 2.725, z, g);
        for (const d of [-0.7, 0.7]) { L.mesh(new THREE.CylinderGeometry(0.02, 0.02, CY - FY, 6), mPole, s * 1.0, (CY + FY) / 2, z + d, g); }
        const pl = B(1.28, 0.02, 0.5, lam(null, 0xe8c020, PO), s * 1.2, FY + 0.005, z, g); pl.scale.set(0.35, 1, 2.4); pl.renderOrder = 1;   // banda amarilla en el piso de la puerta
      }
      B(0.035, 0.035, 15.0, mPole, s * 0.7, 2.62, -7.75, g);
    }
    for (const z of [-4.5, -8.3, -12.1]) L.mesh(new THREE.CylinderGeometry(0.02, 0.02, CY - FY, 6), mPole, 0, (CY + FY) / 2, z, g);
    for (const z of [-0.2, -15.3]) { B(2.96, CY - FY, 0.06, mW, 0, (CY + FY) / 2, z, g); B(0.7, 1.9, 0.02, lam(null, 0x8a9094), 0, FY + 0.95, z + (z > -1 ? -0.04 : 0.04), g); B(0.5, 0.6, 0.02, mGlass, 0, FY + 1.45, z + (z > -1 ? -0.05 : 0.05), g); }
    // puertas: dos hojas por hueco, con ventana; corren en z y se esconden detras del panel de la pared
    const leaves = [];
    const mD = lam(tDoorI);
    for (const s of [-1, 1]) for (const z of DZ) for (const dir of [1, -1]) {
      const lf = new THREE.Group(); lf.position.set(s * 1.56, 0, z + dir * 0.32); g.add(lf);
      B(0.03, 0.85, 0.64, mD, 0, FY + 0.425, 0, lf); B(0.03, 0.22, 0.64, mD, 0, FY + 1.89, 0, lf);
      for (const e of [-0.29, 0.29]) B(0.03, 0.98, 0.06, mD, 0, FY + 1.34, e, lf);
      L.plane(0.52, 0.98, mGlass, 0, FY + 1.34, 0, lf, Math.PI / 2);
      B(0.04, 0.03, 0.6, lam(null, 0x2a2c2e), 0, FY + 0.86, 0, lf);
      lf.userData = { z0: lf.position.z, dir, s, z, x0: lf.position.x }; leaves.push(lf);
    }
    const setDoors = (k, side = -1, zDoor = null) => leaves.forEach((lf) => { const u = lf.userData; const open = u.s === side && (zDoor === null || Math.abs(u.z - zDoor) < 0.1) ? k : 0; lf.position.z = u.z0 + u.dir * 0.62 * open; lf.position.x = u.x0; });
    const lights = []; for (const z of [-4.2, -11]) { const p = new THREE.PointLight(0xf0f4e8, 7, 10, 1.2); p.position.set(0, 2.5, z); g.add(p); lights.push(p); }
    const emerg = new THREE.PointLight(0x7088c0, 0, 7, 1.3); emerg.position.set(0, 2.6, -6.4); g.add(emerg);   // luz de emergencia azul tenue: Ava se lee a oscuras
    const setLights = (k, em = 1) => { strips.forEach((m, i) => { m.material = i / strips.length < k ? stripOn : stripOff; }); lights.forEach((p) => { p.intensity = 7 * k; }); emerg.intensity = 2.2 * (1 - k) * em; };
    let scr = null;
    if (withScreen) {   // pantalla en la pared del frente, sobre la puerta de paso
      const cv = document.createElement('canvas'); cv.width = 160; cv.height = 96; const tex = L.canvasTex(cv);
      const sg = new THREE.Group(); sg.position.set(0, 2.42, -0.26); g.add(sg);   // v2: mas alta, por encima de la cabeza de Ava
      B(1.12, 0.7, 0.06, lam(null, 0x16181c), 0, 0, 0, sg);
      L.plane(1.02, 0.612, L.basic(tex, 0xffffff, { fog: false }), 0, 0, -0.035, sg, Math.PI);
      const glow = new THREE.PointLight(0xff5030, 0, 4.5, 1.3); glow.position.set(0, 2.0, -0.8); g.add(glow);
      scr = { cv, tex, g: sg, glow };
      scr.void = L.plane(3.2, 3.2, L.basic(null, 0x000000, { fog: false }), -1.95, 1.6, -6.4, g, Math.PI / 2); scr.void.visible = false;   // fuera de la puerta abierta: negro total
    }
    return { g, leaves, setDoors, setLights, scr };
  };

  const carA = mkCar(), carB = mkCar(); scene.add(carA.g, carB.g);
  const intA = mkInterior(carA.g, false);
  const STOP = 5.0, DOOR_Z = STOP - 6.4, AVA_DOOR = V(-1.25, 0, DOOR_Z);
  const placeCars = (zFront) => { carA.g.position.set(1.7, -0.5, zFront); carB.g.position.set(1.7, -0.5, zFront - 16); };

  // ---------- la criatura del ep4 (silueta negra, dos ojos separados) + sonrisa demasiado ancha (ep9) ----------
  const zG = await L.loadModel('models/thin-zombie.glb');
  const CH_H = 4.3, CS = CH_H / 1.9;   // agachada (idle) la cabeza queda a ~2,9 m   // v4 (usuario): la criatura mucho mas grande que Ava (3,0 m contra 1,70 m)
  const mkCreature = (parentScene) => {
    const shadow = L.ps1Clone(zG.scene); const shW = new THREE.Group(); shW.add(shadow); parentScene.add(shW);
    const mats = []; shadow.traverse((o) => { if (o.isMesh) { o.material = L.lam(null, 0x30323c); mats.push(o.material); } });
    { const bb = new THREE.Box3().setFromObject(shadow), k = CH_H / (bb.max.y - bb.min.y) * 2.9; shadow.scale.multiplyScalar(k); shadow.position.y = 0; }
    const mix = new THREE.AnimationMixer(shadow), idle = mix.clipAction(THREE.AnimationClip.findByName(zG.animations, 'idle')), atk = mix.clipAction(THREE.AnimationClip.findByName(zG.animations, 'attack2'));
    idle.play(); atk.play(); atk.setEffectiveWeight(0);
    const head = shadow.getObjectByName('head');
    const eyeG = new THREE.Group(); parentScene.add(eyeG); eyeG.scale.setScalar(CS);
    const mEye = L.basic(null, 0xf4f8ff, { fog: false, side: THREE.DoubleSide, transparent: true });
    const tG = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(230,240,255,0.85)'); g.addColorStop(0.4, 'rgba(170,200,255,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
    const mGlow = L.basic(tG, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide });
    const mPup = L.basic(null, 0x101418, { fog: false, side: THREE.DoubleSide, transparent: true });
    for (const sx of [-1, 1]) {
      const e = L.mesh(new THREE.CircleGeometry(0.013, 10), mEye, sx * 0.033, 0, 0.002, eyeG); e.scale.set(1.0, 0.5, 1); e.rotation.z = sx * 0.18;
      L.mesh(new THREE.CircleGeometry(0.0032, 6), mPup, sx * 0.033, 0, 0.004, eyeG);
      L.mesh(new THREE.PlaneGeometry(0.044, 0.03), mGlow, sx * 0.033, 0, 0.0, eyeG);   // v3: halo chico, dos ojos separados
    }
    // sonrisa: media luna blanca de 26 cm (mas ancha que la cara) con dientes; se estira de lado a lado (antinatural)
    const tSm = L.cvs(64, 24, (c) => { c.fillStyle = '#f2f0e4'; c.beginPath(); c.moveTo(1, 3); c.quadraticCurveTo(32, 33, 63, 3); c.quadraticCurveTo(32, 13, 1, 3); c.fill();
      c.globalCompositeOperation = 'source-atop'; c.fillStyle = '#5a1010'; for (let x = 5; x < 62; x += 4) c.fillRect(x, 0, 1, 24); c.fillStyle = '#3a0606'; c.fillRect(0, 13, 64, 1); });
    const mSm = L.basic(tSm, 0xffffff, { transparent: true, alphaTest: 0.5, fog: false, side: THREE.DoubleSide });
    // v2 (usuario): la sonrisa va EN la cara, bajo los ojos y dentro de la cabeza: franja curva (segmento de cilindro) que sigue la
    // curvatura de la cabeza; de mejilla a mejilla (antinatural) pero sin salirse de la silueta. Cuelga de eyeG, que sigue al hueso head.
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
    const CLIP = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.12)];   // solo existe del lado del anden (x <= 0.12)
    const clip = (on) => mats.forEach((m) => { m.clippingPlanes = on ? CLIP : null; });
    const set = (vis, body = 1, eyes = 1) => { shW.visible = vis && body > 0.01; eyeG.visible = vis && eyes > 0.01;
      mats.forEach((m) => { m.transparent = body < 1; m.opacity = body; m.depthWrite = body >= 1; }); mEye.opacity = mPup.opacity = mGlow.opacity = mSm.opacity = eyes; };
    return { shW, eyeG, pose, set, clip };
  };
  const cr = mkCreature(scene);

  // Ava (anden) + cara 'scared' (atlas, sin tocar modelo ni texturas)
  const ch = L.hero(); scene.add(ch.root); paintScared(ch);
  // retazo de papel en el suelo (la otra mitad de la hoja)
  const tScrap = L.cvs(24, 14, (c) => { px(c, 0, 0, '#e2d8b8', 24, 14); for (let x = 0; x < 24; x += 2) px(c, x, 0, 'rgba(0,0,0,0)', 2, (x * 7) % 3); c.clearRect(0, 0, 24, 2); for (let i = 0; i < 3; i++) px(c, 3, 5 + i * 3, '#5a5a50', 12 + i * 2, 1); });
  const scrap = L.plane(0.42, 0.25, L.basic(tScrap, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide, ...PO }), 0, 0.006, 0, scene, 0, -Math.PI / 2); scrap.renderOrder = 2;

  // estado global del anden por plano
  const state = ({ cars = STOP, doors = 0, hero = true, inside = false, intDoor = 0, intLight = 1, creature = null } = {}) => {
    hemi.intensity = 0.55; hemi.color.set(0x6a7ab0); keyL.intensity = 0; blueL.intensity = 2.8;   // v2: anden 30 % mas claro
    carA.g.visible = carB.g.visible = cars !== null; if (cars !== null) placeCars(cars);
    carA.setDoors(doors); carB.setDoors(doors); carGlow.intensity = doors > 0.05 && !inside ? 5 * doors : 0; carGlow.position.set(0.3, 1.6, DOOR_Z);
    carA.root.visible = !inside; carA.pics.forEach((p) => { p.visible = !inside; }); intA.g.visible = inside; intA.setDoors(intDoor, -1, -6.4); intA.setLights(intLight);
    carA.lamps.forEach((p) => { p.visible = false; p.material.color.set(0xffffff); }); carB.lamps.forEach((p) => { p.visible = false; });
    ch.root.visible = hero; clk.visible = true; turns.forEach((t) => { t.visible = true; }); scrap.visible = false;
    cr.set(false);
    if (creature) { cr.shW.position.copy(creature.at); cr.shW.position.y += creature.lift || 0; cr.shW.rotation.set(creature.lean || 0, creature.ry ?? Math.PI / 2, 0, 'YXZ'); cr.set(true, creature.body ?? 1, creature.eyes ?? 1); cr.clip(!!creature.lean); cr.pose(creature.lt || 0, creature); }
  };
  const vign = (k) => (lt, dt, a, o) => { const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LW * 0.35, LW / 2, LH * 0.5, LH * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH); };
  const angTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);

  // ---------- etiquetas: placa RE con numero (pop en su palabra) + linea a un punto 3D; placa fija arriba en cada rama ----------
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
  const pin = (o, txt, col) => plate(o.tctx, LW / 2 + 60, 26, txt, col);   // placa de la rama, fija arriba a la derecha (el HUD esta a la izquierda)
  const BLUE = '#5ab0ff', RED = '#ff5a4a', WHITE = '#f0f0f0';
  const breath = (o, x, y, t, t0, sc = 1) => { if (t < t0) return; const c = o.tctx;   // v2: bocanadas redondas y suaves (antes eran rectangulos)
    for (let k = 0; k < 2; k++) { const ph = (((t - t0) + k * 0.65) % 1.3) / 1.3, r = (6 + ph * 22) * sc, cx = x + ph * 14 * sc, cy = y - ph * 6 * sc;
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, r); const al = 0.6 * Math.sin(Math.PI * Math.min(1, ph * 1.25));
      g.addColorStop(0, `rgba(215,225,245,${al})`); g.addColorStop(0.55, `rgba(190,200,230,${al * 0.5})`); g.addColorStop(1, 'rgba(180,190,220,0)'); c.fillStyle = g; c.fillRect(cx - r, cy - r, 2 * r, 2 * r); } };

  const out = {};
  const SH_NEAR = V(-1.85, 0, DOOR_Z + 0.5), SH_WALL = V(-2.95, 0, DOOR_Z - 0.45);

  // 01 hook: el anden a oscuras, el tren abierto (fin de la parte 1); 1 GET ON (azul) a la puerta, 2 STAY (rojo) a Ava
  { const c = cam(46);
    out['01_hook'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = lt;
      tag(o, c, V(0.16, 1.25, DOOR_Z + 0.05), '1 GET ON', BLUE, 92, 128, t, W.geton);   // v2: placa sobre el hueco iluminado, punta dentro del vagon
      tag(o, c, V(-1.25, 1.25, DOOR_Z), '2 STAY', RED, 84, 270, t, W.stay); },
    update(lt, t) {
      state({ doors: 1 });
      carGlow.intensity = 6; carA.lamps.forEach((p) => { p.visible = true; });
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2 - 0.35;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.6 })], [[-99, 'scared', 'neutral']]);
      look(c, V(-3.9 + 0.06 * lt, 1.5, DOOR_Z - 2.9 + 0.08 * lt), V(-1.0, 1.15, DOOR_Z + 0.2));
    } };
  }
  // 02 STAY: las puertas se cierran ('close') y el tren se va ('leaves'); Ava de espaldas lo mira irse
  { const c = cam(48);
    out['02_stay'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); pin(o, '2 STAY', RED); },
    update(lt, t) {
      const kd = ease(W.close2 - 0.1, W.close2 + 0.7, t), td = Math.max(0, t - W.leaves + 0.2), zf = STOP - 1.2 * td * td - 0.4 * td;
      state({ cars: zf, doors: 1 - kd }); clk.visible = false;   // v2 (usuario): el reloj rojo asomaba arriba a la izquierda
      carGlow.intensity = 6 * (1 - kd); carA.lamps.forEach((p) => { p.visible = true; });
      if (td > 0) { carB.lamps.forEach((p) => { p.visible = false; }); }
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.6 })], [[-99, 'scared', 'neutral']]);
      look(c, V(-3.3, 1.65, DOOR_Z + 3.6), V(0.4, 1.15, DOOR_Z - 1.2));
    } };
  }
  // 02b: en el suelo, el resto de la hoja; Ava se agacha (kneel, una sola vez) y la levanta
  { const c = cam(44);
    out['02b_floor'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); pin(o, '2 STAY', RED); },
    update(lt, t) {
      state({ cars: null });
      ch.root.position.copy(AVA_DOOR).add(V(-0.3, 0, 0.1)); ch.root.rotation.y = -Math.PI / 2 + 0.4;
      ch.pose(lt, [L.seg('kneel', 0, { speed: 1.0 })], [[-99, 'half', 'neutral']]);
      scrap.visible = true; look(c, V(0.05, 1.15, DOOR_Z + 2.7), V(-1.65, 0.45, DOOR_Z + 0.15));
      ch.root.updateMatrixWorld(true); const hp = ch.hand('R').getWorldPosition(V());
      if (lt < 0.75) { scrap.position.set(hp.x, 0.006, hp.z); scrap.rotation.set(-Math.PI / 2, 0, 0); }   // v2: el papel esta bajo su mano y ella lo levanta
      else { scrap.position.copy(hp).add(V(0, 0.06, 0)); scrap.lookAt(c.position); }
    } };
  }
  // 02c FILE: la hoja del ep4 con su mitad de abajo, que sube y encaja en el borde roto; la regla 2 completa palabra a palabra
  {
    const fs = new THREE.Scene(); fs.background = new THREE.Color(0x000000); const fc = cam(45);
    const PXL = 28, PYT = 62, PWd = 304, PHd = 330, INK = '#2a2016', TEAR = 206;   // v4: el corte pasa justo bajo 'IF YOU HEAR...'
    const R = L.rng(404);
    const tear = []; for (let x = 0; x < PWd; x++) tear.push(TEAR + Math.round(3 * Math.sin(x * 0.53) + 2 * Math.sin(x * 1.7 + 1) + R() * 3));
    const mkPaper = (top) => { const cv = document.createElement('canvas'); cv.width = PWd; cv.height = PHd; const c = cv.getContext('2d'), img = c.createImageData(PWd, PHd); const r = L.rng(top ? 7 : 8);
      for (let y = 0; y < PHd; y++) for (let x = 0; x < PWd; x++) {
        const i = (y * PWd + x) * 4, above = y <= tear[x]; if (above !== top) continue;
        const e = Math.min(x, y, PWd - 1 - x, PHd - 1 - y), edge = e < 8 ? (8 - e) * 5 : 0, n = (r() - 0.5) * 14, fib = Math.abs(y - tear[x]) < 3 ? 34 : 0;
        img.data[i] = 222 + n - edge + fib * 0.3; img.data[i + 1] = 212 + n - edge * 1.2 + fib * 0.3; img.data[i + 2] = 176 + n - edge * 1.6 + fib * 0.4; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0);
      if (top) { c.strokeStyle = 'rgba(120,80,30,0.22)'; c.lineWidth = 2; c.beginPath(); c.arc(268, 28, 15, 0, 6.3); c.stroke(); c.fillStyle = 'rgba(230,230,210,0.75)'; c.fillRect(20, -2, 46, 12); c.fillRect(PWd - 66, -2, 46, 12); }
      else { c.fillStyle = 'rgba(90,70,40,0.25)'; for (let k = 0; k < 30; k++) c.fillRect(r() * PWd | 0, TEAR + 10 + r() * 80 | 0, 2 + r() * 6 | 0, 1); c.fillStyle = 'rgba(60,50,40,0.18)'; c.fillRect(40, PHd - 40, 90, 22); }   // mugre y una pisada: estaba en el suelo
      return cv; };
    const pTop = mkPaper(true), pBot = mkPaper(false);
    const R1 = 'NEVER BOARD AN EMPTY TRAIN.';
    const R2W = CUE.R2; const nR = R2W.length;
    out['02c_file'] = { scene: fs, camera: fc, update() {}, overlay(lt, dt, a, o) {
      const c = o.tctx, t = T['02c_file'] + lt, prev = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
      px(c, 14, 30, '#2c3040', 332, 22); px(c, 14, 30, '#7a8094', 332, 1); px(c, 18, 34, '#04060e', 324, 14);
      bitText(c, 'FILE', 40, 41, 1, '#9cf09c', { outline: null }); bitText(c, 'MERCY ST.', 300, 41, 1, '#c8ccd8', { outline: null });
      const slide = Math.round(70 * (1 - ease(0.05, 0.55, lt))), Y = PYT;
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(PXL + 4, Y + 4, PWd, PHd);
      c.drawImage(pTop, PXL, Y); c.drawImage(pBot, PXL, Y + slide);
      bitText(c, 'NIGHT SHIFT', LW / 2, 96, 2, INK, { outline: null }); bitText(c, 'INSTRUCTIONS', LW / 2, 118, 2, INK, { outline: null });
      bitText(c, 'STAFF ONLY', LW / 2, 138, 1, '#8a1810', { outline: null }); px(c, PXL + 16, 150, PWd - 32, 1, INK);
      const wrap = (words, x0, y0, col) => { let x = x0, y = y0; for (const [w, tw, cl] of words) { const wd = textWidth(w, 2); if (x + wd > 316) { x = x0; y += 24; } if (t >= tw) left(c, w, x, y + (y > Y + TEAR - 6 ? slide : 0), 2, cl || col); x += wd + 10; } };
      left(c, '1.', 44, 176, 2, INK); wrap(R1.split(' ').map((w, i) => [w, -1, i >= 3 ? '#8a1810' : null]), 70, 176, INK);
      // v4 (usuario): arriba solo queda el comienzo 'IF YOU HEAR...' pegado al corte; el resto de la regla 2 esta en el pedazo que encaja
      const R2c = R2W.map(([w, tw], i) => [w, Math.max(T['02c_file'], tw), i >= nR - 3 ? '#a01808' : null]);
      left(c, '2.', 44, 246, 2, INK); wrap(R2c.slice(0, 3).map(([w, tw, cl], i) => [i === 2 ? w + '...' : w, -1, cl]), 70, 246, INK);
      wrap(R2c.slice(3), 70, 300, INK);   // wrap suma 'slide' bajo el corte: el texto viaja con el pedazo
      c.imageSmoothingEnabled = prev;
    } };
  }
  // 03: pasos detras; Ava de frente (camara en la via, el tren ya se fue), ojos de miedo de reojo; en 'turn' se da vuelta
  { const c = cam(42);
    out['03_turn'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); pin(o, '2 STAY', RED); },
    update(lt, t) {
      state({ cars: null });
      const kr = ease(W.turn3 - 0.05, W.turn3 + 0.55, t);
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2 + Math.PI * kr;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.6 })], [[-99, 'open', mouthAt(t, 'neutral')], [W.steps3 - T['03_turn'], 'scared', mouthAt(t, 'neutral')]]);
      look(c, V(0.9, 1.5, DOOR_Z + 0.25), V(-1.25, 1.42, DOOR_Z));
      if (kr < 0.3) ch.lookAt(c, 1 - kr / 0.3, 30);
    } };
  }
  // 03b: sobre su hombro, en la oscuridad del anden: dos ojos primero, despues la silueta sale de lo negro
  { const c = cam(46);
    out['03b_eyes'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); pin(o, '2 STAY', RED); },
    update(lt, t) {
      const em = L.smooth((lt - 0.35) / 1.2), ke = L.smooth(lt / 0.3);
      state({ cars: null, creature: { at: V(-2.7, 0, DOOR_Z - 0.35).add(V(-0.8 * (1 - em), 0, 0)), ry: Math.PI / 2, lt, body: em, eyes: ke } }); clk.visible = false;
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = -Math.PI / 2;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.4 })], [[-99, 'shocked', 'gasp']]);
      look(c, V(0.9, 0.95, DOOR_Z + 3.0), V(-2.0, 2.0, DOOR_Z - 0.35));   // v4: contrapicado, la criatura se eleva sobre Ava
    } };
  }
  // 03c: primer plano de la cara: los ojos y la sonrisa que se abre de lado a lado en 'wide'
  { const c = cam(36);
    out['03c_smile'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.55)(lt, dt, a, o); pin(o, '2 STAY', RED); },
    update(lt, t) {
      state({ cars: null, hero: false, creature: { at: SH_WALL, ry: Math.PI / 2, lt: 2 + lt, smileK: ease(W.smile - 0.15, W.wide + 0.2, t) } });
      const e = cr.eyeG.position.clone(), q = cr.eyeG.quaternion, f = V(0, 0, 1).applyQuaternion(q);
      look(c, e.clone().add(f.multiplyScalar(0.95 - 0.12 * lt)).add(V(0, -0.02, 0)), e.clone().add(V(0, -0.04, 0)));
    } };
  }
  // 04: corre a la salida (de espaldas, como la ref); la reja sigue cerrada con candado; en 'locked' la empuja (solo tiembla la reja)
  { const c = cam(46);
    out['04_run'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); pin(o, '2 STAY', RED); },
    update(lt, t) {
      state({ cars: null }); turns.forEach((tt) => { tt.visible = false; });   // como el ep4: nada tapandola en primer plano
      const tArr = W.locked - 0.25 - T['04_run'], q = L.q15(lt), z = Math.min(9.55, 9.55 - 1.85 * Math.max(0, tArr - q));
      ch.root.position.set(-2.6, 0, z); ch.root.rotation.y = 0;
      ch.pose(lt, [L.seg('run', -99, { loop: true }), L.seg('push_door', tArr, { from: 0.25, speed: 0.8, fade: 0.15 })], [[-99, 'scared', 'gasp'], [tArr, 'shocked', 'gasp']]);
      const tc = W.locked; const hit = t > tc && t < tc + 0.6 ? Math.sin((t - tc) * 45) * 0.015 * (1 - (t - tc) / 0.6) : 0; gate.position.x = -2.9 + hit;
      look(c, V(-2.3, 1.75, Math.min(z - 3.2, 6.5)), V(-2.75, 1.35, 11.5));
    } };
  }
  // 04b "Oh, fudge": a traves de la reja, de frente; ojos de miedo, boca normal de la toma; los ojos y la sonrisa detras, en lo negro
  { const c = cam(40);
    out['04b_fudge'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); pin(o, '2 STAY', RED); },
    update(lt, t) {
      state({ cars: null, creature: { at: V(-3.1, 0, 6.6).lerp(V(-3.35, 0, 9.3), L.smooth(lt / 1.6)), ry: 0.05, lt: 3 + lt, smileK: 1, body: 1 } }); gate.position.x = -2.9;   // v2: se le acerca antes del YOU DIED
      ch.root.position.set(-2.6, 0, 9.55); ch.root.rotation.y = 0;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'scared', mouthAt(t, 'neutral')]]);
      look(c, V(-2.2, 1.35, 12.1), V(-2.55, 1.75, 9.4));
      ch.lookAt(c, 1, 30);
    } };
  }
  // 05 rebobinado: glitch sobre YOU DIED y despues la rama STAY hacia atras, rapido, con capa VHS (REW, lineas de tracking)
  const REV = ['02_stay', '02b_floor', '03_turn', '03b_eyes', '03c_smile', '04_run', '04b_fudge'];
  { const c = cam(46);
    const G0 = 0.5;   // glitch
    const R = L.rng(99);
    out['05_rewind'] = { scene, camera: c, update(lt, t) {
      const t0s = REV.map((id) => T[id]), tA = T['02_stay'] + 0.2, tB = T['04c_died'] - 0.05;
      const u = lt < G0 ? 0 : L.clamp01((lt - G0) / (T['06_geton'] - T['05_rewind'] - G0 - 0.05));
      let tb = lt < G0 ? tB : tB - (tB - tA) * u;
      if (tb >= T['02c_file'] && tb < T['03_turn']) tb = T['02c_file'] - 0.02;   // el FILE no se rebobina (es otra pantalla)
      let k = 0; while (k < REV.length - 1 && tb >= t0s[k + 1]) k++;
      const s = out[REV[k]]; s.update(tb - t0s[k], tb);
      c.position.copy(s.camera.position); c.quaternion.copy(s.camera.quaternion); c.fov = s.camera.fov; c.updateProjectionMatrix();
    }, overlay(lt, dt, a, o) {
      const cx = o.tctx, f = Math.floor(lt * 30);
      if (lt < G0) {   // glitch: YOU DIED rojo que se rompe en franjas, bloques de ruido y barras de color
        cx.fillStyle = 'rgba(150,0,0,0.55)'; cx.fillRect(0, 0, LW, LH); cx.fillStyle = 'rgba(20,0,0,0.78)'; cx.fillRect(0, 0, LW, LH);
        youDied(o, 3);
        const r = L.rng(1000 + f);
        for (let k = 0; k < 9; k++) { const y = r() * LH | 0, h = 4 + r() * 26 | 0, dx = Math.round((r() - 0.5) * 60); const im = cx.getImageData(0, y, LW, h); cx.putImageData(im, dx, y); }
        for (let k = 0; k < 5; k++) { const cols = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff', '#000000']; cx.fillStyle = cols[(r() * 5) | 0]; cx.globalAlpha = 0.5; cx.fillRect(0, r() * LH | 0, LW, 1 + r() * 4 | 0); cx.globalAlpha = 1; }
        if (f % 4 === 2) { cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, LW, LH); }
        return;
      }
      // VHS: tinte frio, lineas de barrido, banda de tracking que sube, ruido; REW y contador que retrocede
      cx.fillStyle = 'rgba(40,20,90,0.18)'; cx.fillRect(0, 0, LW, LH);
      const r = L.rng(2000 + f);
      for (let y = 0; y < LH; y += 3) { cx.fillStyle = 'rgba(0,0,0,0.12)'; cx.fillRect(0, y, LW, 1); }
      const by = LH - ((lt * 520) % (LH + 80));
      for (let k = 0; k < 40; k++) { cx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.5})`; cx.fillRect(r() * LW | 0, by + r() * 26 | 0, 2 + r() * 14 | 0, 1); }
      cx.fillStyle = 'rgba(255,255,255,0.08)'; cx.fillRect(0, by, LW, 26);
      for (let k = 0; k < 3; k++) { const y = r() * LH | 0, im = cx.getImageData(0, y, LW, 6); cx.putImageData(im, Math.round((r() - 0.5) * 10), y); }
      const on = Math.floor(lt * 3) % 2 === 0;
      left(cx, 'REW', 52, 56, 2, '#f4f4f4', { outline: '#000000' });
      if (on) { cx.fillStyle = '#f4f4f4'; for (const x0 of [20, 34]) for (let k = 0; k < 9; k++) px(cx, x0 + k, 56 - k * 0.8 | 0, '#f4f4f4', 1, Math.max(1, Math.round(k * 1.6))); }
      const sec = Math.max(0, Math.round(27 - (lt - G0) * 9)), tc = `0:00:${String(sec).padStart(2, '0')}`;
      left(cx, 'SP', 22, 600, 2, '#f4f4f4', { outline: '#000000' }); left(cx, tc, 210, 600, 2, '#f4f4f4', { outline: '#000000' });
    } };
  }
  // 06 GET ON: vuelve al momento de elegir; Ava entra (se corta en el umbral: sin atravesar el vagon); la criatura detras
  { const c = cam(48);
    out['06_geton'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); pin(o, '1 GET ON', BLUE); },
    update(lt, t) {
      state({ doors: 1, creature: { at: V(-2.5 + 0.3 * L.smooth(lt / 1.6), 0, DOOR_Z - 1.9), ry: Math.PI / 2, lt: 5 + lt, smileK: 1 } });
      carGlow.intensity = 6; carA.lamps.forEach((p) => { p.visible = true; });
      const kw = L.smooth((lt - 0.25) / 1.3), P = AVA_DOOR.clone().lerp(V(-0.12, 0, DOOR_Z), kw);
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI / 2;
      ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('walk', 0.25, { fade: 0.15, loop: true })], [[-99, 'scared', 'gasp']]);
      look(c, V(-3.9, 1.5, DOOR_Z - 2.9), V(-1.0, 1.15, DOOR_Z + 0.2));
    } };
  }
  // 06b: dentro del vagon; las puertas se cierran en 'shut' y la criatura golpea el vidrio (attack2 una vez: dos golpes; solo se mueven las hojas)
  const AVA_IN = V(0.95, 0, DOOR_Z + 0.35);
  const doorHit = (t) => { let d = 0; for (const h of W.bang_hits) { const u = t - h; if (u > 0 && u < 0.45) d += 0.02 * Math.sin(u * 40) * (1 - u / 0.45); } return d; };
  { const c = cam(50);
    out['06b_shut'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); pin(o, '1 GET ON', BLUE); },
    update(lt, t) {
      const kc = ease(W.shut - 0.1, W.shut + 0.35, t);
      state({ doors: 1 - kc, inside: true, intDoor: 1 - kc, creature: { at: V(-2.05 + 0.15 * ease(W.shut, W.bangs - 0.3, t), 0, DOOR_Z + 0.55), ry: Math.PI / 2, lift: -0.55, lean: 0.38, lt: 6 + lt, smileK: 1, atkT: t - (W.bangs - 0.30) } });
      const d = doorHit(t); intA.leaves.forEach((lf) => { if (lf.userData.s === -1 && Math.abs(lf.userData.z + 6.4) < 0.1) lf.position.x = lf.userData.x0 + d; });
      ch.root.position.copy(AVA_IN); ch.root.rotation.y = -Math.PI / 2 + 0.5;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.6 })], [[-99, 'surprised', 'gasp'], [W.bangs - T['06b_shut'], 'shocked', 'gasp']]);
      look(c, V(2.75, 1.6, DOOR_Z - 1.45), V(0.2, 1.45, DOOR_Z + 0.1));
    } };
  }
  // 06c: de frente, dentro; suspiro de alivio ('relaxed'); detras, la criatura en el vidrio
  { const c = cam(42);
    out['06c_breathe'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); pin(o, '1 GET ON', BLUE); },
    update(lt, t) {
      state({ doors: 0, inside: true, intDoor: 0, creature: { at: V(-1.9, 0, DOOR_Z + 0.55), ry: Math.PI / 2, lift: -0.55, lean: 0.38, lt: 8 + lt, smileK: 1 } });
      ch.root.position.copy(AVA_IN); ch.root.rotation.y = Math.PI / 2 + 0.35;
      const tb = W.breathe - T['06c_breathe'];
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'half', mouthAt(t, 'neutral')], [tb, 'relaxed', mouthAt(t, 'neutral')]]);
      look(c, V(2.55, 1.5, DOOR_Z + 1.0), V(0.7, 1.4, DOOR_Z + 0.05));
      ch.lookAt(c, 1, 35);
    } };
  }

  // ================= escena 2: el tunel (via doble, cambio de via, tunel desconocido) =================
  const sT = new THREE.Scene(); sT.background = new THREE.Color(0x050406); sT.fog = new THREE.Fog(0x050406, 10, 70);
  const hemT = new THREE.HemisphereLight(0x8890a8, 0x2a2420, 0.85); sT.add(hemT);
  const tConc = L.cvs(32, 32, (c) => { const r = L.rng(12); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 22 + (y % 16 === 0 ? -18 : 0); px(c, x, y, `rgb(${70 + n},${70 + n},${68 + n})`); } for (let k = 0; k < 5; k++) px(c, r() * 32 | 0, 0, 'rgba(30,26,20,0.4)', 1, 32); });
  const tBrick = L.cvs(32, 32, (c) => { px(c, 0, 0, '#2a1a14', 32, 32); const r = L.rng(66); for (let y = 0; y < 32; y += 4) for (let x = (y / 4) % 2 ? -4 : 0; x < 32; x += 8) { const n = r() * 30 | 0; px(c, x + 1, y + 1, `rgb(${110 + n},${52 + n / 2},${36})`, 7, 3); } for (let k = 0; k < 40; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(10,8,6,0.5)', 1 + r() * 3 | 0, 1); });
  const TZ0 = 40, TZ1 = -260, SU = 118;   // el tunel desconocido empieza en z = -118
  const XL = -2.7, XR = 7.3;
  const wallSeg = (tex, z0, z1, rep) => { const l = z0 - z1, zc = (z0 + z1) / 2;
    B(0.2, 5.4, l, lam(L.rep(tex, l / rep, 3)), XL, 1.6, zc, sT); B(0.2, 5.4, l, lam(L.rep(tex, l / rep, 3)), XR, 1.6, zc, sT); B(XR - XL, 0.2, l, lam(L.rep(tex, l / rep, 3), 0x8a8a8a), (XL + XR) / 2, 4.3, zc, sT); };
  wallSeg(tConc, TZ0, -SU, 4); wallSeg(tBrick, -SU, TZ1, 2);
  B(XR - XL, 0.05, TZ0 - TZ1, lam(L.rep(tBed, 10, 300)), (XL + XR) / 2, -1.12, (TZ0 + TZ1) / 2, sT);
  const XS = (s) => 4.6 * L.smooth((s - 100) / 24);   // via: x de la via segun la distancia (cambio de via entre s = 100 y 124)
  for (const xc of [0, 4.6]) { for (const dx of [-0.72, 0.72]) B(0.08, 0.14, TZ0 - TZ1, mRail, xc + dx, -1.03, (TZ0 + TZ1) / 2, sT); for (let z = TZ0; z > TZ1; z -= 0.9) B(2.6, 0.08, 0.24, mTie, xc, -1.08, z, sT); }
  for (let s = 96; s < 130; s += 0.5) { const x = XS(s), x2 = XS(s + 0.5), yaw = Math.atan2(x2 - x, 0.5); for (const dx of [-0.72, 0.72]) { const r = B(0.08, 0.14, 0.52, mRail, x + dx, -1.02, -s - 0.25, sT); r.rotation.y = yaw; } }   // via de cruce
  // senal del cambio de via (roja -> verde en 'switches') y lamparas de pared: blancas en el tunel normal, rojas enjauladas en el desconocido
  const sigRed = L.basic(null, 0xff2a1a, { fog: false }), sigGrn = L.basic(null, 0x2aff5a, { fog: false }), sigOff = lam(null, 0x1a1a1a);
  const sig = new THREE.Group(); sig.position.set(XL + 0.3, 1.4, -96); sT.add(sig); B(0.2, 0.55, 0.18, lam(null, 0x141414), 0, 0, 0, sig);
  const sTop = B(0.1, 0.1, 0.03, sigRed, 0, 0.12, 0.1, sig), sBot = B(0.1, 0.1, 0.03, sigOff, 0, -0.12, 0.1, sig);
  const mLampW = L.basic(null, 0xf0f0e0), mLampR = L.basic(null, 0xff4a1a, { fog: false });
  for (let z = TZ0; z > TZ1; z -= 10) { const red = z < -SU; for (const x of [XL + 0.12, XR - 0.12]) { B(0.06, 0.12, 0.3, red ? mLampR : mLampW, x, 2.6, z, sT); if (red) B(0.08, 0.16, 0.34, lam(null, 0x1a1410), x, 2.6, z, sT).scale.set(1, 1, 0.3); } }
  const redLs = []; for (const z of [-128, -142, -156]) { const p = new THREE.PointLight(0xff4a1a, 5, 13, 1.4); p.position.set(XL + 0.6, 2.4, z); sT.add(p); redLs.push(p); const p2 = p.clone(); p2.position.x = XR - 0.6; sT.add(p2); redLs.push(p2); }
  const tSign = L.cvs(96, 20, (c) => { px(c, 0, 0, '#d8d0b8', 96, 20); px(c, 0, 0, '#1a1a18', 96, 2); px(c, 0, 18, '#1a1a18', 96, 2); c.fillStyle = '#1a1a18'; c.font = 'bold 13px monospace'; c.textBaseline = 'middle'; c.fillText('ASH    OVE', 6, 11);
    const r = L.rng(21); for (let k = 0; k < 160; k++) px(c, r() * 96 | 0, r() * 20 | 0, `rgba(${90 + r() * 40 | 0},50,20,${0.3 + r() * 0.5})`, 1 + r() * 3 | 0, 1); px(c, 30, 4, '#5a3a20', 22, 12); });   // cartel de una estacion vieja, letras caidas
  L.plane(2.6, 0.54, L.lam(tSign), XL + 0.11, 1.9, -146, sT, Math.PI / 2);
  L.plane(2.6, 0.54, L.lam(tSign), XR - 0.11, 1.9, -137, sT, -Math.PI / 2);
  const tNum = L.cvs(16, 16, (c) => { c.fillStyle = '#c8c0a8'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('13', 8, 9); });
  L.plane(0.7, 0.7, L.lam(tNum, 0xffffff, { transparent: true, alphaTest: 0.4 }), XL + 0.11, 0.8, -152, sT, Math.PI / 2);
  // tren del tunel
  const carT1 = mkCar(), carT2 = mkCar(); sT.add(carT1.g, carT2.g);
  const intT = mkInterior(carT1.g, true);
  const headT = new THREE.SpotLight(0xfff4d8, 0, 70, 0.4, 0.6, 1.0); sT.add(headT, headT.target);
  const trainGlow = new THREE.PointLight(0xd8e4d0, 0, 9, 1.2); sT.add(trainGlow);
  const tHL = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,250,230,1)'); g.addColorStop(0.5, 'rgba(255,240,200,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const heads = []; for (const x of [-0.9, 0.9]) heads.push(L.plane(0.7, 0.7, L.basic(tHL, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), x, 0.95, 0.05, carT1.g));
  const placeT = (s) => {   // frente del tren a distancia s; cada vagon sigue la via con su guinada
    for (const [car, ds] of [[carT1, 0], [carT2, 16]]) { const sf = s - ds; car.g.position.set(XS(sf), -0.5, -sf); car.g.rotation.y = Math.atan2(XS(sf + 1) - XS(sf), -1); }   // girado: el extremo z=0 del vagon va adelante
    headT.position.set(XS(s), 0.6, -s - 0.5); headT.target.position.set(XS(s + 20), 0.4, -s - 20); trainGlow.position.set(XS(s - 8), 1.6, -s + 8);
  };
  // movimiento: Hermite por tramos (acelera hasta el cambio de via en 'switches', frena y para en el tunel desconocido)
  const TS0 = T['07_speed'], TSW = W.switches, TST = W.switches + 2.9;
  const herm = (t, t0, t1, s0, s1, v0, v1) => { const h = t1 - t0, u = L.clamp01((t - t0) / h), u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * s0 + (u3 - 2 * u2 + u) * h * v0 + (-2 * u3 + 3 * u2) * s1 + (u3 - u2) * h * v1; };
  const sAt = (t) => t < TSW ? herm(t, TS0, TSW, 72, 100, 10, 26) : t < TST ? herm(t, TSW, TST, 100, 140, 26, 0) : 140;
  const ch2 = L.hero(); carT1.g.add(ch2.root); paintScared(ch2);
  const timerAt = (t) => t < W.minute ? 60 : t < W.five ? 60 - 55 * L.clamp01((t - W.minute) / (W.five - W.minute)) : Math.max(1, 5 - (t - W.five) * 0.5);
  const drawScreen = (t, mode) => {   // mode: 0 apagada, 1 bienvenida, 2 botones, 3 cuenta final
    const s = intT.scr, c = s.cv.getContext('2d'), Wd = 160, Hd = 96;
    if (mode === 0) { px(c, 0, 0, '#06080a', Wd, Hd); s.tex.needsUpdate = true; s.glow.intensity = 0; return; }
    const fl = t - W.screen < 0.25 ? (Math.floor((t - W.screen) * 30) % 2 ? 0.3 : 1) : 1;
    px(c, 0, 0, '#140604', Wd, Hd); c.globalAlpha = fl;
    for (let y = 0; y < Hd; y += 2) px(c, 0, y, 'rgba(255,60,30,0.05)', Wd, 1);
    const sec = Math.ceil(timerAt(t)), tt = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;   // v2: 01:00, no 00:60
    c.textAlign = 'center'; c.textBaseline = 'middle';
    // barra de progreso (jeringa) arriba
    px(c, 10, 6, '#5a1a10', 140, 6); px(c, 11, 7, sec <= 10 ? '#ff2a1a' : '#ff8a30', Math.round(138 * sec / 60), 4); px(c, 150, 7, '#c8c8c8', 6, 4); px(c, 4, 8, '#c8c8c8', 6, 2);
    if (mode === 1) {
      c.fillStyle = '#ffd8c8'; c.font = 'bold 11px monospace'; c.fillText('WELCOME TO THE', Wd / 2, 26);
      c.fillStyle = '#ff3a2a'; c.font = 'bold 15px monospace'; if (t >= W.laststop - 0.3) c.fillText('LAST STOP', Wd / 2, 42);
      if (t >= W.minute - 0.6) { c.fillStyle = '#ffd8c8'; c.font = '9px monospace'; c.fillText('You have one minute', Wd / 2, 60); c.fillStyle = '#ffb030'; c.font = 'bold 17px monospace'; c.fillText(tt, Wd / 2, 78); }
    } else {
      c.fillStyle = sec <= 10 ? '#ff2a1a' : '#ffb030'; c.font = 'bold 15px monospace'; c.fillText(tt, Wd / 2, 24);
      const hiR = mode === 2 && t >= W.red - 0.1 && t < W.white - 0.1, hiW = mode === 2 && t >= W.white - 0.1;
      const btn = (x, col, txt, sub, hi) => { px(c, x, 40, hi ? '#ffffff' : '#3a1a14', 66, 40); px(c, x + 2, 42, col, 62, 36); c.fillStyle = col === '#f0f0f0' ? '#1a1a1a' : '#fff4f0'; c.font = 'bold 13px monospace'; c.fillText(txt, x + 33, 54); c.font = '7px monospace'; c.fillText(sub, x + 33, 69); };
      btn(8, '#d01e14', 'LEAVE', 'Exit the train', hiR); btn(86, '#f0f0f0', 'STAY', 'Remain on board', hiW);
      if (mode === 3 && Math.floor(t * 4) % 2 === 0) { px(c, 0, 0, 'rgba(255,0,0,0.12)', Wd, Hd); }
    }
    c.globalAlpha = 1; s.tex.needsUpdate = true; s.glow.intensity = 2.2 * fl;
  };
  const stateT = ({ s = 140, inside = false, intLight = 1, doorK = 0, hero = true, screen = 0, t = 0, redK = 1, em = 1 } = {}) => {
    placeT(s); carT1.root.visible = !inside; carT1.pics.forEach((p) => { p.visible = !inside; }); intT.g.visible = inside; intT.setLights(intLight, em); intT.setDoors(doorK, -1, -6.4); intT.scr.void.visible = doorK > 0.001;
    carT1.setDoors(0); carT2.setDoors(0); carT2.g.visible = !inside; carT1.lamps.forEach((p) => { p.visible = false; }); carT2.lamps.forEach((p) => { p.visible = false; });
    heads.forEach((p) => { p.visible = !inside; }); headT.intensity = inside ? 0 : 45; trainGlow.intensity = inside ? 0 : 3;
    redLs.forEach((p) => { p.intensity = 5 * redK; }); mLampR.color.setScalar(1); mLampR.color.set(redK > 0.5 ? 0xff4a1a : 0x2a0a04);
    ch2.root.visible = hero && inside; drawScreen(t, screen);
    const sw = t >= W.switches; sTop.material = sw ? sigOff : sigRed; sBot.material = sw ? sigGrn : sigOff;
  };
  const inCar = (x, y, z) => carT1.g.localToWorld(V(x, y, z));   // punto del vagon -> mundo
  const lookIn = (c, p, q) => { c.position.copy(inCar(...p)); c.lookAt(inCar(...q)); c.updateProjectionMatrix(); };
  const AVA_T = [-0.62, 0.5, -6.05];   // Ava de pie dentro del vagon del tunel, junto a la puerta (local)

  // 07: el tren acelera por el tunel y cambia de via (camara baja junto a la senal)
  { const c = cam(50);
    out['07_speed'] = { scene: sT, camera: c, overlay: vign(0.4), update(lt, t) {
      stateT({ s: sAt(t), t, screen: 0 });
      look(c, V(-2.0, 0.9, -121), V(3.0, 0.7, -88));
    } };
  }
  // 07b: frena y para en el tunel desconocido (ladrillo, lamparas rojas, el cartel viejo)
  { const c = cam(48);
    out['07b_tunnel'] = { scene: sT, camera: c, overlay: vign(0.45), update(lt, t) {
      stateT({ s: sAt(t), t, screen: 0 });
      look(c, V(2.1, 1.0, -150.5), V(4.0, 0.9, -128));
    } };
  }
  // 07c: dentro, las luces se apagan tira a tira en 'lights'..'out'; queda el rojo del tunel por las ventanas
  { const c = cam(46);
    out['07c_dark'] = { scene: sT, camera: c, overlay(lt, dt, a, o) { vign(0.45)(lt, dt, a, o); const t = T['07c_dark'] + lt;   // v2: el apagon cae casi a negro en 'out' y se recupera apenas con la emergencia
      const k = 0.85 * ease(W.out8 - 0.15, W.out8 + 0.1, t) * (1 - 0.55 * ease(W.out8 + 0.7, W.out8 + 1.8, t)); if (k > 0) { o.tctx.fillStyle = `rgba(0,0,0,${k})`; o.tctx.fillRect(0, 0, LW, LH); } }, update(lt, t) {
      const k = 1 - ease(W.lights - 0.05, W.out8 + 0.25, t);
      stateT({ s: 140, inside: true, intLight: k, t, screen: 0, em: 0.15 + 0.5 * ease(W.out8 + 0.6, W.out8 + 1.6, t) }); hemT.intensity = 0.04 + 0.5 * k;   // v2: apagon casi a negro en 'out', la emergencia entra despues
      ch2.root.position.set(...AVA_T); ch2.root.rotation.y = Math.PI / 2 + 0.6;
      ch2.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'surprised', 'neutral'], [W.out8 - T['07c_dark'], 'scared', 'gasp']]);
      lookIn(c, [0.85, 1.95, -3.9], [-0.7, 1.75, -6.4]);
      ch2.lookAt(c, 0.6, 25);
    } };
  }
  // 08: la pantalla se enciende: WELCOME TO THE LAST STOP / You have one minute / 01:00
  { const c = cam(40);
    out['08_screen'] = { scene: sT, camera: c, overlay: vign(0.35), update(lt, t) {
      stateT({ s: 140, inside: true, intLight: 0, t, screen: t >= W.screen ? 1 : 0, hero: false }); hemT.intensity = 0.2;
      lookIn(c, [0.12, 2.3, -3.0 + 0.08 * lt], [0, 2.4, -0.26]);
    } };
  }
  // 08b: los dos botones: LEAVE (rojo, Exit the train) y STAY (blanco, Remain on board); se iluminan en su palabra; Ava los mira
  { const c = cam(46);
    out['08b_buttons'] = { scene: sT, camera: c, overlay: vign(0.4), update(lt, t) {
      stateT({ s: 140, inside: true, intLight: 0, t, screen: 2 }); hemT.intensity = 0.2;
      ch2.root.position.set(-0.1, 0.5, -1.15); ch2.root.rotation.y = Math.PI - 0.25;
      ch2.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'scared', 'neutral']]);
      lookIn(c, [0.35, 1.85, -4.6], [0.0, 1.95, -0.4]);
    } };
  }
  // 09: las puertas se abren a lo negro (el tunel desconocido ya sin luz); el contador sigue arriba
  { const c = cam(46);
    out['09_open'] = { scene: sT, camera: c, overlay: vign(0.45), update(lt, t) {
      const ko = ease(W.open10 - 0.1, W.open10 + 0.8, t);
      stateT({ s: 140, inside: true, intLight: 0, doorK: ko, t, screen: 2, redK: 1 - ko }); hemT.intensity = 0.18;
      ch2.root.position.set(...AVA_T); ch2.root.rotation.y = -Math.PI / 2 - 0.25;
      ch2.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'scared', 'neutral']]);
      lookIn(c, [1.05, 1.62, -4.7], [-1.6, 1.3, -6.5]);
    } };
  }
  // 09b: primer plano del contador en 00:05, rojo
  { const c = cam(40);
    out['09b_count'] = { scene: sT, camera: c, overlay: vign(0.4), update(lt, t) {
      stateT({ s: 140, inside: true, intLight: 0, doorK: 1, t, screen: 3, hero: false, redK: 0 }); hemT.intensity = 0.15;
      lookIn(c, [0.0, 2.3, -3.2 + 0.06 * lt], [0, 2.37, -0.26]);
    } };
  }
  // 09c: el hueco de la puerta abierta, negro total; algo respira afuera (solo vaho, sin ojos: ambiguo)
  { const c = cam(44);
    out['09c_breath'] = { scene: sT, camera: c, overlay(lt, dt, a, o) { vign(0.5)(lt, dt, a, o); const t = T['09c_breath'] + lt; const [x, y] = L.toScreen(c, inCar(-2.3, 1.55, -6.4).x, 1.05, inCar(-2.3, 1.55, -6.4).z); breath(o, x, y, t, W.breathing - 0.6, 3.0); },
    update(lt, t) {
      stateT({ s: 140, inside: true, intLight: 0, doorK: 1, t, screen: 3, redK: 0, hero: false });   // v2: solo el hueco negro y el vaho (Ava tapaba medio cuadro) hemT.intensity = 0.15;
      ch2.root.position.set(...AVA_T); ch2.root.rotation.y = -Math.PI / 2;
      ch2.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.4 })], [[-99, 'scared', 'neutral']]);
      lookIn(c, [-0.2, 1.6, -5.5 + 0.04 * lt], [-1.9, 1.4, -6.45]);
    } };
  }
  // 10 menu RE final sobre el plano vivo: Ava respira entre la puerta abierta (1 LEAVE) y el asiento (2 STAY); sin subtitulos
  { const c = cam(64);
    out['10_choice'] = { scene: sT, camera: c, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T['10_choice'] + lt; vign(0.55)(lt, dt, a, o);
      const dp = inCar(-1.5, 1.35, -6.55), sp = inCar(-1.22, 0.98, -7.85);
      tag(o, c, dp, '1 LEAVE', RED, 72, 390, t, W.leave11);
      tag(o, c, sp, '2 STAY', WHITE, 290, 390, t, W.stay11);
      const kp = L.clamp01(lt / 0.2), PX = 26, PY = 74, PW = 308, PH = 150;
      cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH);
      px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
      bitText(cx, 'WHAT DO YOU DO?', LW / 2, 104, 2, '#ececec', { outline: '#000000' });
      const opts = [['1. LEAVE', W.leave11, RED], ['2. STAY', W.stay11, WHITE]];
      const sel = t >= W.stay11 ? 1 : t >= W.leave11 ? 0 : -1;
      opts.forEach(([s, tw, col], i) => { const y = 150 + i * 44; left(cx, s, 104, y, 3, i === sel ? col : '#8a8a8a', { outline: '#000000' });
        if (i === sel) { const on = Math.floor((t - tw) * 4) % 2 === 0, x0 = 78; for (let k = 0; k < 10; k++) px(cx, x0 + k, y - 11 + k, on ? '#ffe048' : '#c89a20', 1, 23 - 2 * k); } });
      if (t >= W.comment) { const b = Math.round(3 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, 548 + b, 2, '#ffd23f', { outline: '#000000' }); }
      if (t >= CUE.VOICE_END + 0.3) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, 598, 2, '#ececec', { outline: '#000000' });
    }, update(lt, t) {
      stateT({ s: 140, inside: true, intLight: 0, doorK: 1, t, screen: 3, redK: 0 }); hemT.intensity = 0.2;
      ch2.root.position.set(-0.55, 0.5, -7.4); ch2.root.rotation.y = Math.PI / 2 - 0.1;
      ch2.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.55 })], [[-99, 'scared', 'neutral']]);   // respira (idle vivo), sin congelar
      lookIn(c, [1.38, 2.05, -7.3], [-1.5, 1.95, -7.3]);
      ch2.lookAt(c, 0.8, 30);
    } };
  }
  return out;
}
