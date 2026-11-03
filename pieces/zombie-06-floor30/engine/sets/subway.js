// sets/subway.js — ep4 "AVA: The Last Train — Part 1" (adapta los beats del reel "Subway" de play.malo, analisis en
// fuentes/zombie-nicho/playmalo-subway-p1.md). Anden de metro "MERCY STREET": azulejo blanco + franja verde, granito, banda
// amarilla, vias, torniquetes, maquina de billetes, cabina con la hoja, reloj LED, vagon. Props = GLB hechos con el metodo
// foto -> loft (objects/tools/build.py). Pantallas RE: FILE de la hoja, menu 1/2 y tarjeta final. Prefijo propio: U*.
import { reText as bitText, reWidth as textWidth } from '../refont.js';

// palabras (s globales, timeline.json)
export const W = {
  train0: 1.41, locks: 2.90, phone: 5.18, signal: 5.86, pct: 6.32, time: 7.40, next: 9.05, five: 10.09,
  sheet: 12.86, night: 14.04, rule1: 15.60, never: 16.08, empty: 17.04, rule2: 18.89, torn: 19.51, ifw: 21.23, dont: 22.67, ends: 24.35,
  laugh: 26.63, prank: 28.25, eleven: 30.93, clock: 33.27, midnight: 33.61, every: 34.54, out: 35.90,
  train: 39.25, headlights: 40.27, sound: 42.22, doors: 42.76, open: 43.22, empty2: 43.74,
  steps: 47.68, something: 48.94, breathing: 51.42, neck: 52.34, fudge: 54.51, closing: 56.87,
  so: 58.89, geton: 59.45, stay: 61.32, comment: 62.44, one: 62.61, two: 62.93, most: 63.53,   // v2: CTA en toma aparte con pausa
};
export const T = {
  plat: 0, gate: 2.42, phone: 5.04, board: 8.91, booth: 12.29, file: 14.04, laugh: 26.47, clock: 30.79, dark: 34.54,
  train: 39.2, doors: 42.72, steps: 46.91, eyes: 48.94, neck: 50.76, fudge: 54.51, close: 55.93, choice: 58.89, end: 65.4, follow: 66.0,
};

export async function shots({ L, TL }) {
  const CUE = await (await fetch('cues.json')).json(); Object.assign(W, CUE.W); Object.assign(T, CUE.T);   // v4: tiempos de la voz nueva
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 120);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateProjectionMatrix(); };
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  const glb = async (n) => (await L.loadModel(`models/${n}.glb`)).scene;
  const prop = async (n) => L.ps1Clone(await glb(n));

  // ================= escena compartida: el anden =================
  const BG = 0x0c0e14;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 14, 60);
  const hemi = new THREE.HemisphereLight(0xe8f0ff, 0x4a4a48, 1.5); scene.add(hemi);
  const keyL = new THREE.DirectionalLight(0xf4f8ff, 0.9); keyL.position.set(-1, 6, 4); keyL.target.position.set(0, 0, -4); scene.add(keyL, keyL.target);
  const carGlow = new THREE.PointLight(0xd8ecd0, 0, 6, 1.2); scene.add(carGlow);          // luz del vagon vacio
  const headL = new THREE.SpotLight(0xfff4d8, 0, 60, 0.35, 0.6, 1.0); scene.add(headL, headL.target);   // faros
  const blueL = new THREE.PointLight(0x6080c0, 0, 12, 1.4); scene.add(blueL);             // apagon: azul tenue para leer siluetas

  const tWall = L.rep(await L.loadTex('tex/sub/wall_tile.png', 96), 30, 4);
  const tWallFar = L.rep(await L.loadTex('tex/sub/wall_tile.png', 96), 30, 4);
  const tGran = L.rep(await L.loadTex('tex/sub/floor_granite.png', 64), 3, 40);
  const tYel = L.rep(await L.loadTex('tex/sub/floor_yellow.png', 64), 1, 60);
  const ZA = -60, ZB = 14, ZL = ZB - ZA, ZC = (ZA + ZB) / 2;
  // suelo, borde, foso de vias
  B(4.6, 0.1, ZL, lam(tGran, 0xd8d8d8), -2.3, -0.05, ZC, scene);
  B(0.6, 0.012, ZL, lam(tYel), -0.3, 0.006, ZC, scene);
  B(0.2, 1.1, ZL, lam(null, 0x55524c), -0.1, -0.55, ZC, scene);
  const tBed = L.cvs(32, 32, (c) => { const r = L.rng(41); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 30; px(c, x, y, `rgb(${40 + n},${36 + n},${32 + n})`); } });
  B(4.5, 0.05, ZL, lam(L.rep(tBed, 6, 80)), 2.25, -1.12, ZC, scene);
  const mRail = lam(null, 0x8a8a90), mTie = lam(null, 0x3a2e24);
  for (const x of [1.0, 2.44]) B(0.08, 0.14, ZL, mRail, x, -1.03, ZC, scene);
  for (let z = ZA; z < ZB; z += 0.9) B(2.6, 0.08, 0.24, mTie, 1.72, -1.08, z, scene);
  // paredes de azulejo + franja verde + techo
  B(0.1, 4.0, ZL, lam(tWall), -4.65, 2.0, ZC, scene);
  B(0.1, 5.1, ZL, lam(tWallFar, 0xc8c8c8), 4.6, 1.45, ZC, scene);
  const mGreen = lam(null, 0x2f7a4a);
  B(0.06, 0.22, ZL, mGreen, -4.58, 2.55, ZC, scene); B(0.06, 0.22, ZL, mGreen, 4.53, 2.55, ZC, scene);
  B(9.4, 0.1, ZL, lam(null, 0x3a3c40), 0, 3.85, ZC, scene);
  // columnas de acero azul (NYC) a lo largo del anden
  const mCol = lam(null, 0x2c4a7a), mColD = lam(null, 0x1c3050);
  for (const z of [-8.5, -15.5, -22.5, -29.5, -36.5, -43.5]) { B(0.22, 3.8, 0.22, mCol, -1.7, 1.9, z, scene); B(0.34, 0.06, 0.34, mColD, -1.7, 0.03, z, scene); }
  // tubos fluorescentes (encendidos = basic blanco; apagados = gris)
  const tubeOn = L.basic(null, 0xf4fbff), tubeOff = L.lam(null, 0x2a2c30); const tubes = [];
  for (let z = ZB - 2; z > ZA; z -= 3.2) for (const x of [-2.6, -0.9]) { B(0.36, 0.08, 1.4, lam(null, 0x50545a), x, 3.79, z, scene); tubes.push(B(0.22, 0.04, 1.25, tubeOn, x, 3.74, z, scene)); }
  const setTubes = (k) => tubes.forEach((m, i) => { m.material = i < k ? tubeOff : tubeOn; });   // k tubos apagados (desde el fondo)
  tubes.sort((a, b) => a.position.z - b.position.z);
  // carteles MERCY STREET en la pared (GLB foto->loft) y en la pared de enfrente
  const signG = await prop('station_sign');
  for (const z of [-8.0, -20, -32]) { const s = signG.clone(); s.position.set(-4.56, 1.85, z); s.rotation.y = Math.PI / 2; scene.add(s); }
  for (const z of [-10, -26]) { const s = signG.clone(); s.position.set(4.53, 1.65, z); s.rotation.y = -Math.PI / 2; scene.add(s); }
  let hs; { hs = signG.clone(); hs.position.set(-3.25, 2.45, -4.0); hs.scale.setScalar(1.25); scene.add(hs);
    for (const x of [-4.3, -2.2]) B(0.03, 1.0, 0.03, lam(null, 0x1a1c20), x, 3.3, -4.0, scene); }
  const benchG = await prop('bench');
  for (const z of [0.2, -11.5, -24, -36]) { const b = benchG.clone(); b.position.set(-4.25, 0, z); b.rotation.y = Math.PI / 2; scene.add(b); }
  // salida (z = 10): reja cerrada con cadena, cartel EXIT verde, torniquetes, maquina de billetes, cabina con la hoja
  const gate = new THREE.Group(); gate.position.set(-2.9, 0, 10.8); scene.add(gate);
  const mBar = lam(null, 0x1a1c20);
  for (let i = 0; i <= 18; i++) B(0.035, 2.6, 0.035, mBar, -1.7 + i * 0.19, 1.3, 0, gate);
  for (const y of [0.08, 1.3, 2.55]) B(3.5, 0.06, 0.05, mBar, 0, y, 0, gate);
  const padlock = B(0.1, 0.5, 0.06, lam(null, 0xb09040), 0.05, 1.18, 0.06, gate);   // candado
  for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 4, 6), lam(null, 0x8a8a90)); l.position.set(-0.2 + i * 0.07, 1.3 + Math.sin(i) * 0.02, 0.05); l.rotation.y = i % 2 ? Math.PI / 2 : 0; gate.add(l); l.userData.chain = 1; }
  B(9.4, 1.4, 0.1, lam(tWall), 0, 3.15, 10.7, scene);
  B(1.0, 3.9, 0.1, lam(tWall), -4.4, 1.95, 10.7, scene); B(3.0, 3.9, 0.1, lam(tWall), 1.55, 1.95, 10.7, scene);
  for (let i = 0; i < 12; i++) B(4.0, 0.18, 0.32, lam(tGran, 0xb8b8b8), -1.9, 0.09 + i * 0.18, 11.2 + i * 0.3, scene);   // escalera de salida tras la reja
  B(0.1, 4.0, 4.0, lam(tWall), -3.95, 2.0, 13.0, scene); B(0.1, 4.0, 4.0, lam(tWall), 0.1, 2.0, 13.0, scene);
  B(4.0, 0.1, 4.0, lam(null, 0x3a3c40), -1.9, 4.0, 13.0, scene); B(0.5, 0.06, 1.2, tubeOn, -1.9, 3.94, 13.0, scene);
  const tExit = L.cvs(48, 16, (c, w, h) => { px(c, 0, 0, '#0a6a2a', w, h); px(c, 1, 1, '#22a04a', w - 2, 1); c.fillStyle = '#f4fff4'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', w / 2 - 6, h / 2 + 1); c.fillRect(37, 6, 6, 3); c.beginPath(); c.moveTo(43, 3); c.lineTo(47, 7.5); c.lineTo(43, 12); c.fill(); });
  B(0.9, 0.3, 0.08, L.basic(tExit), -2.9, 2.75, 10.55, scene);
  const turnG = await prop('turnstile');
  const turns = []; for (const x of [-3.9, -2.9, -1.9]) { const t = turnG.clone(); t.position.set(x, 0, 8.6); t.rotation.y = Math.PI / 2; scene.add(t); turns.push(t); }
  const tmG = await prop('ticket_machine'); tmG.position.set(-4.25, 0, 6.2); tmG.rotation.y = Math.PI / 2; scene.add(tmG);
  // cabina (booth): caja de acero + ventanilla con la hoja pegada por dentro
  const booth = new THREE.Group(); booth.position.set(-3.75, 0, 3.6); scene.add(booth);
  const tSteel = L.cvs(32, 32, (c) => { const r = L.rng(8); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 16 + (x % 8 === 0 ? -20 : 0); px(c, x, y, `rgb(${120 + n},${122 + n},${126 + n})`); } });
  const mSt = lam(tSteel);
  B(1.7, 1.0, 2.0, mSt, 0, 0.5, 0, booth); B(1.7, 0.5, 2.0, mSt, 0, 2.55, 0, booth); B(0.1, 1.1, 2.0, mSt, -0.8, 1.55, 0, booth);
  B(1.7, 0.08, 0.1, mSt, 0, 1.03, 0.95, booth); for (const z of [-0.95, 0, 0.95]) B(0.06, 1.1, 0.06, mSt, 0.85, 1.55, z, booth);
  B(0.02, 1.1, 1.9, L.basic(null, 0x9ab8b8, { transparent: true, opacity: 0.22, depthWrite: false }), 0.86, 1.55, 0, booth);
  B(1.5, 1.0, 1.8, lam(null, 0x1a1c20), -0.05, 1.55, 0, booth);   // interior oscuro
  const tSheet = L.cvs(48, 64, (c, w, h) => {
    px(c, 0, 0, '#e8e2cc', w, h); const r = L.rng(5); for (let k = 0; k < 40; k++) px(c, r() * w | 0, r() * h | 0, 'rgba(120,100,60,0.25)');
    c.fillStyle = '#20201c'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.fillText('NIGHT SHIFT', 24, 8); c.fillText('INSTRUCTIONS', 24, 15);
    for (let i = 0; i < 6; i++) px(c, 5, 22 + i * 6, '#5a5a50', 20 + ((i * 7) % 18), 1);
    c.fillStyle = '#e8e2cc'; for (let x = 0; x < w; x += 3) c.fillRect(x, 56 + (x * 7 % 5), 3, 10);   // borde roto
    c.clearRect(0, 60, w, 4);
    px(c, 2, 0, 'rgba(230,230,210,0.7)', 10, 3); px(c, 36, 0, 'rgba(230,230,210,0.7)', 10, 3);   // cinta
  });
  L.plane(0.36, 0.48, L.lam(tSheet, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide }), 0.84, 1.6, 0.25, booth, Math.PI / 2);
  const tBooth = L.cvs(64, 16, (c, w, h) => { px(c, 0, 0, '#1a2a50', w, h); c.fillStyle = '#e8e8f0'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STATION AGENT', w / 2, h / 2 + 1); });
  L.plane(1.4, 0.3, L.basic(tBooth), 0.87, 2.4, 0, booth, Math.PI / 2);
  // reloj LED colgado + panel NEXT TRAIN
  const clk = await prop('platform_clock'); clk.position.set(-1.6, 2.75, -1.5); scene.add(clk);
  const ledCv = document.createElement('canvas'); ledCv.width = 96; ledCv.height = 36; const ledTex = L.canvasTex(ledCv);
  const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  function drawLED(c, text, x0, y0, s, on, off) {   // 7 segmentos: digito 4s x 7s
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
  let ledText = null;
  const setClock = (txt, blinkColon) => {
    const key = txt + blinkColon; if (key === ledText) return; ledText = key;
    const c = ledCv.getContext('2d'); px(c, 0, 0, '#120808', 96, 36);
    drawLED(c, blinkColon ? txt : txt.replace(':', ' '), 10, 4, 4, '#ff2a1a', '#1c0806'); ledTex.needsUpdate = true;
  };
  setClock('11:42', true);
  for (const s of [1, -1]) { const p = L.plane(0.78, 0.29, L.basic(ledTex), 0.014, 0.203, 0.085 * s, clk, s > 0 ? 0 : Math.PI); void p; }
  const brdCv = document.createElement('canvas'); brdCv.width = 128; brdCv.height = 24; const brdTex = L.canvasTex(brdCv);
  let brdKey = null;
  const setBoard = (n) => {
    if (n === brdKey) return; brdKey = n; const c = brdCv.getContext('2d'); px(c, 0, 0, '#0a0806', 128, 24);
    c.fillStyle = '#ffb020'; c.font = 'bold 9px monospace'; c.textBaseline = 'middle'; c.textAlign = 'left';
    const s = 'NEXT TRAIN  5:30 AM'; c.fillText(s.slice(0, n), 4, 12);
    brdTex.needsUpdate = true;
  };
  setBoard(0);
  const board = new THREE.Group(); board.position.set(-1.6, 2.35, -1.5); scene.add(board);
  B(1.2, 0.26, 0.1, lam(null, 0x141416), 0, 0, 0, board); L.plane(1.12, 0.2, L.basic(brdTex), 0, 0, 0.051, board);
  for (const x of [-0.5, 0.5]) B(0.02, 0.3, 0.02, lam(null, 0x141416), x, 0.25, 0, board);

  // vagones (GLB foto->loft): frente a +Z, largo hacia -Z, puertas L del lado del anden; interior iluminado detras de cada puerta
  const carG = await glb('subway_car');
  const tInt = L.cvs(48, 72, (c, w, h) => {   // interior vacio: luz palida, anuncios, ventanas negras, asientos azules, barras, suelo
    px(c, 0, 0, '#cfd8c8', w, h); px(c, 0, 0, '#f4fbee', w, 4); px(c, 0, 4, '#9aa298', w, 1);
    for (const x of [3, 26]) { px(c, x, 8, '#d8c060', 19, 7); px(c, x + 2, 10, '#3a3020', 12, 1); px(c, x + 2, 12, '#3a3020', 8, 1); }   // anuncios
    for (const x of [3, 26]) { px(c, x, 18, '#14181e', 19, 16); px(c, x, 18, '#3a4048', 19, 1); px(c, x + 3, 22, '#202830', 5, 8); }   // ventanas (tunel negro)
    px(c, 0, 38, '#8a9088', w, 4);
    for (let x = 0; x < w; x += 8) { px(c, x, 42, '#2f56a8', 7, 9); px(c, x, 42, '#4a72c8', 7, 2); }   // asientos individuales
    px(c, 0, 51, '#1e2e5e', w, 3); px(c, 0, 54, '#6a7068', w, 18); for (let y = 56; y < h; y += 4) px(c, 0, y, '#5a6058', w, 1);   // suelo
    for (const x of [11, 36]) { px(c, x, 0, '#e8ece8', 2, 54); px(c, x + 2, 0, '#8a908a', 1, 54); }   // barras
    px(c, 0, 16, '#c0c4c0', w, 1);   // pasamanos
  });
  const mkCar = () => {
    const root = L.ps1Clone(carG); const g = new THREE.Group(); g.add(root); const doors = [];
    root.traverse((o) => { if (o.isMesh && /^door_L/.test(o.name)) doors.push(o); });
    doors.forEach((d) => { d.userData.z0 = d.position.z; d.userData.dir = /a$/.test(d.name) ? 1 : -1; });
    for (const Y of [2.6, 6.4, 10.2, 14.0]) L.plane(1.28, 2.0, L.basic(tInt), -1.537, 1.5, -Y, g, -Math.PI / 2);
    const glow = L.cvs(32, 32, (c) => { const gr = c.createRadialGradient(16, 16, 1, 16, 16, 16); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.35, 'rgba(255,240,190,0.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 32, 32); });
    const lamps = [];
    for (const x of [-0.61, 0.85]) { const p = L.plane(1.1, 1.1, L.basic(glow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), x, 0.44 + 0.5, 0.03, g); lamps.push(p); }
    const setDoors = (k) => doors.forEach((d) => { d.position.z = d.userData.z0 + d.userData.dir * 0.6 * k; });
    return { g, setDoors, lamps };
  };
  const carA = mkCar(), carB = mkCar(); scene.add(carA.g, carB.g);
  const placeCars = (zFront) => { carA.g.position.set(1.7, -0.5, zFront); carB.g.position.set(1.7, -0.5, zFront - 16); };
  const STOP = 5.0;   // frente del tren parado
  // ojos-blancos: silueta negra (thin-zombie) con ojos blancos
  const zG = await L.loadModel('models/thin-zombie.glb');
  const shadow = L.ps1Clone(zG.scene); const shW = new THREE.Group(); shW.add(shadow); scene.add(shW);
  const shMats = []; shadow.traverse((o) => { if (o.isMesh) { o.material = L.basic(null, 0x020203); shMats.push(o.material); } });
  { const bb = new THREE.Box3().setFromObject(shadow), k = 1.9 / (bb.max.y - bb.min.y) * 2.9; shadow.scale.multiplyScalar(k); shadow.position.y = 0; }   // la caja del SkinnedMesh sin pose mide el doble: x2.9 medido en el still (pose encorvada: cabeza a ~1,8 m)
  const zMix = new THREE.AnimationMixer(shadow), zIdle = zMix.clipAction(THREE.AnimationClip.findByName(zG.animations, 'idle')); zIdle.play();
  const zHead = shadow.getObjectByName('head');
  const eyeG = new THREE.Group(); const mEye = L.basic(null, 0xf4f8ff, { fog: false, side: THREE.DoubleSide });
  const tGlow = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(230,240,255,0.85)'); g.addColorStop(0.4, 'rgba(170,200,255,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const mGlow = L.basic(tGlow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide });
  const mPup = L.basic(null, 0x101418, { fog: false, side: THREE.DoubleSide });
  for (const sx of [-1, 1]) {   // v4 (usuario): ojos, no gafas: almendra 2,6 x 1,3 cm, centros a 3,3 cm del eje, ligera inclinacion
    const e = L.mesh(new THREE.CircleGeometry(0.013, 10), mEye, sx * 0.033, 0, 0.002, eyeG); e.scale.set(1.0, 0.5, 1); e.rotation.z = sx * 0.18;
    L.mesh(new THREE.CircleGeometry(0.0032, 6), mPup, sx * 0.033, 0, 0.004, eyeG);
    L.mesh(new THREE.PlaneGeometry(0.075, 0.05), mGlow, sx * 0.033, 0, 0.0, eyeG);
  }
  scene.add(eyeG);
  // silueta de pie (el idle se agacha en otros tramos); ojos medidos en el render: +0,09 m (cabeza escalada x2,9)
    const poseShadow = (lt) => { zIdle.time = 0.92 + 0.06 * Math.sin(L.q15(lt) * 1.3); zMix.update(0); shW.updateMatrixWorld(true);
    const hp = zHead.getWorldPosition(V()); const q = shW.getWorldQuaternion(new THREE.Quaternion());
    eyeG.position.copy(hp).add(V(0, 0.08, 0.16).applyQuaternion(q)); eyeG.quaternion.copy(q); };
  // Ava
  const ch = L.hero(); scene.add(ch.root);
  // v6 (usuario): cara >.< para "Oh, fudge": celda 13 del atlas de ojos = copia de 'blink' con los ojos tapados de piel y dos
  // chevrones > < (el atlas va invertido en Y y el ojo B se envuelve hasta la celda 14: se copia y pinta tambien ahi)
  ch.root.traverse((o) => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
    if (m.name !== 'face_eyes' || !m.map || m.map.userData.sq) return; const im = m.map.image, cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0); const k = im.width / 2048, C13 = 1664 * k;
    c.drawImage(cv, 256 * k, 0, 128 * k, im.height, C13, 0, 128 * k, im.height); c.drawImage(cv, 384 * k, 0, 12 * k, im.height, 1792 * k, 0, 12 * k, im.height);
    const sk = c.getImageData(Math.round(354 * k), Math.round(70 * k), 1, 1).data; c.fillStyle = `rgb(${sk[0]},${sk[1]},${sk[2]})`;
    for (const cx of [98, 128]) { c.beginPath(); c.ellipse(C13 + cx * k, 84 * k, 11 * k, 8 * k, 0, 0, 7); c.fill(); }
    c.strokeStyle = '#3a2418'; c.lineWidth = 2.8 * k; c.lineJoin = 'miter';
    for (const [cx, d] of [[98, 1], [128, -1]]) { c.beginPath(); c.moveTo(C13 + (cx - 6 * d) * k, 79 * k); c.lineTo(C13 + (cx + 5 * d) * k, 84 * k); c.lineTo(C13 + (cx - 6 * d) * k, 89 * k); c.stroke(); }
    m.map.image = cv; m.map.userData.sq = 1; m.map.needsUpdate = true;
  }); });
  const phoneG = await prop('phone'); L.holdIn(ch, phoneG, 'R', [0, 0.9, 0.2], [Math.PI / 2, 0, Math.PI]);
  const phCv = document.createElement('canvas'); phCv.width = 48; phCv.height = 96; const phTex = L.canvasTex(phCv);
  { const c = phCv.getContext('2d'); px(c, 0, 0, '#0a1020', 48, 96); const g = c.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, '#1a2a5a'); g.addColorStop(1, '#06080e'); c.fillStyle = g; c.fillRect(0, 0, 48, 96);
    c.fillStyle = '#f0f0f0'; c.font = 'bold 15px monospace'; c.textAlign = 'center'; c.fillText('11:42', 24, 36); c.font = '6px monospace'; c.fillText('FRI, NOV 14', 24, 45);
    px(c, 3, 3, '#ff3020', 2, 4); px(c, 6, 5, '#ff3020', 2, 2); c.fillStyle = '#ff3020'; c.font = 'bold 6px monospace'; c.textAlign = 'left'; c.fillText('X', 10, 8);
    px(c, 34, 3, '#e0e0e0', 10, 5); px(c, 44, 4, '#e0e0e0', 1, 3); px(c, 35, 4, '#ff2a1a', 1, 3); c.fillStyle = '#ff3a2a'; c.font = 'bold 6px monospace'; c.fillText('3%', 22, 8);
    px(c, 4, 58, 'rgba(255,255,255,0.12)', 40, 18); c.fillStyle = '#ff5040'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.fillText('NO SERVICE', 24, 66); c.fillStyle = '#c0c0c8'; c.font = '5px monospace'; c.fillText('SOS calls only', 24, 73); }
  phTex.repeat.set(1, 1); phTex.offset.set(0, 0);   // POV: el telefono se ve desde sus ojos
  const phScreen = L.plane(0.068, 0.145, L.basic(phTex), 0, 0.079, -0.0048, phoneG, Math.PI); phoneG.visible = false;

  // estado global por plano
  const state = ({ lights = 1, k = 0, cars = null, doors = 0, hero = true, shadowAt = null, phone = false, clock = '11:42', board = 19 } = {}) => {
    hemi.intensity = 0.25 + 1.25 * lights; hemi.color.set(lights > 0.5 ? 0xe8f0ff : 0x6a7ab0); keyL.intensity = 0.9 * lights;
    setTubes(k); blueL.intensity = lights < 0.5 ? 2.3 : 0;
    scene.fog.color.set(BG);
    carA.g.visible = carB.g.visible = cars !== null; if (cars !== null) placeCars(cars);
    carA.setDoors(doors); carB.setDoors(doors); carGlow.intensity = doors > 0.05 ? 5 * doors : 0;
    carGlow.position.set(0.0, 1.5, STOP - 6.4);
    ch.root.visible = hero; phoneG.visible = phone; shW.visible = eyeG.visible = !!shadowAt;
    if (shadowAt) { shW.position.copy(shadowAt[0]); shW.position.y += shadowAt[3] || 0; shW.rotation.y = shadowAt[1]; poseShadow(shadowAt[2] || 0); }   // [3]: alza en primeros planos (pies fuera de cuadro; el idle va encorvado)
    setClock(clock, true); setBoard(board);
    gate.children.forEach((o) => { o.visible = true; }); gate.position.x = -2.9;
    shMats.forEach((m) => { m.transparent = false; m.opacity = 1; m.depthWrite = true; }); mEye.transparent = true; mEye.opacity = 1; mPup.transparent = true; mPup.opacity = 1; mGlow.opacity = 1;
    turns.forEach((t) => { t.visible = true; });
    hs.visible = false;   // el cartel colgado solo en el plano 1 (en 02b/05 tapaba el reloj)
    headL.intensity = 0; carA.lamps.forEach((p) => { p.visible = false; p.material.color.set(0xffffff); }); carB.lamps.forEach((p) => { p.visible = false; });
  };
  const inFrame = (c, d, side) => { c.updateMatrixWorld(true); const f = new THREE.Vector3(); c.getWorldDirection(f); f.y = 0; f.normalize(); const r = V(-f.z, 0, f.x);
    return c.position.clone().add(f.multiplyScalar(d)).add(r.multiplyScalar(side)).setY(0); };
  const angTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
  const vign = (k) => (lt, dt, a, o) => { const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LW * 0.35, LW / 2, LH * 0.5, LH * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH); };
  const out = {};
  const DOOR_Z = STOP - 6.4;   // puerta (2a) del vagon A frente a Ava
  const AVA_DOOR = V(-1.25, 0, DOOR_Z);

  // 01 (0-2.42): anden vacio, Ava de espaldas mira las luces traseras del ultimo tren que se va; carteles MERCY STREET
  { const c = cam(50);
    out['01_plat'] = { scene, camera: c, overlay: vign(0.35), update(lt, t) {
      const q = L.q15(lt), zf = 8.5 - 1.2 * q - 2.6 * q * q;   // el tren arranca y acelera (cola hacia la camara)
      state({ cars: zf, k: 0, board: 0 });
      hs.visible = true; carA.g.visible = carB.g.visible = true;   // A (cola, hacia la camara) y B delante, hacia -Z
      carA.lamps.forEach((p) => { p.visible = true; p.material.color.set(0xff2010); });
      // corre (1,85 m/s, clip run) detras del tren y frena en 1,6-2,1 s
      const RUN = 1.85, T1 = 1.6, T2 = 2.1, d = q < T1 ? RUN * q : RUN * T1 + RUN * (q - T1) * (1 - 0.5 * (q - T1) / (T2 - T1)) * (q < T2 ? 1 : 0) + (q >= T2 ? RUN * (T2 - T1) * 0.5 : 0);
      ch.root.position.set(-0.85, 0, 6.2 - d); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('run', 0, { loop: true }), L.seg('idle', T2 - 0.25, { loop: true, fade: 0.3 })], [[-99, 'surprised', 'gasp'], [T2, 'sad', 'frown']]);
      look(c, V(-1.25, 1.55, 9.6 - q * 0.9), V(-2.1, 1.7, -6));
    } };
  }
  // 01b (2.42-5.04): la reja de la salida cerrada con cadena; Ava la sacude (solo tiembla la reja)
  { const c = cam(46);
    out['01b_gate'] = { scene, camera: c, overlay: vign(0.35), update(lt, t) {
      state({ board: 0 }); turns.forEach((t) => { t.visible = false; });   // v6 (usuario): nada claro tapandola en primer plano
      gate.children.forEach((o) => { if (o === padlock || o.userData.chain) o.visible = false; });   // la reja se esta cerrando: sin candado
      // v4 (usuario): como la ref, la reja corre y se cierra ENTRE la camara (en la escalera) y Ava, que llega corriendo
      const tc = W.locks + 0.25, dc = Math.max(0.8, tc - T.gate - 0.15), k = L.smooth((t - (tc - dc)) / dc);   // se cierra durante todo el plano                  // cerrada en 'locks' + 0,25 s
      const hit = t > tc && t < tc + 0.6 ? Math.sin((t - tc) * 45) * 0.015 * (1 - (t - tc) / 0.6) : 0;   // rebote al tope (solo la reja)
      gate.position.x = -2.9 + 3.45 * (1 - k) + hit;
      const tArr = tc - 0.1 - T.gate, z = 8.95 + 0.6 * L.smooth(L.q15(lt) / Math.max(0.3, tArr));   // v5: ya paso los torniquetes, da unos pasos hasta la reja
      ch.root.position.set(-2.6, 0, Math.min(z, 9.55)); ch.root.rotation.y = 0;
      ch.pose(lt, [L.seg('run', 0, { loop: true }), L.seg('push_door', tArr, { from: 0.25, speed: 0.8, fade: 0.15 })],
        [[-99, 'surprised', 'gasp'], [tArr, 'shocked', 'gasp'], [tArr + 0.7, 'sad', 'frown']]);
      look(c, V(-2.15, 1.75, 6.5), V(-2.75, 1.4, 11.5));   // v5 (usuario, como la ref): de espaldas, la reja se cierra delante de su cara
    } };
  }
  // 02 (5.04-8.91): sobre el hombro, el telefono en su mano: NO SERVICE, 3 %, 11:42
  { const c = cam(34);
    out['02_phone'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({ phone: true, board: 0 });
      const P = V(-1.3, 0, 2.0); ch.root.position.copy(P); ch.root.rotation.y = Math.PI * 0.9;
      ch.pose(lt, [L.seg('phone_look', 0, { from: 0.6, speed: 0.4 })], [[-99, 'half', 'frown']]);
      ch.root.updateMatrixWorld(true); const pp = phoneG.getWorldPosition(V()), hb = ch.bone.getObjectByName('Head').getWorldPosition(V());
      void pp; void hb;   // v4 (usuario): el telefono derecho, vertical y de frente: la camara mira la pantalla por su normal con su 'arriba'
      phScreen.updateMatrixWorld(true); const sp = phScreen.getWorldPosition(V()), qs = phScreen.getWorldQuaternion(new THREE.Quaternion());
      const nrm = V(0, 0, 1).applyQuaternion(qs), up = V(0, 1, 0).applyQuaternion(qs);   // la pantalla mira a +Z local (plano girado pi)
      if (up.y < 0) up.negate();
      c.up.copy(up); c.position.copy(sp).add(nrm.multiplyScalar(0.52)).add(up.clone().multiplyScalar(-0.06)); c.lookAt(sp.clone().add(up.clone().multiplyScalar(-0.06))); c.updateProjectionMatrix();
    } };
  }
  // 02b (8.91-12.29): reloj 11:42 y el panel NEXT TRAIN que se escribe en "next train", 5:30 en "five thirty"
  { const c = cam(40);
    out['02b_board'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      const n = t < W.next ? 0 : t < W.five ? Math.min(12, Math.floor((t - W.next) * 18)) : Math.min(19, 12 + Math.floor((t - W.five) * 18));
      state({ board: n });
      ch.root.position.set(-0.9, 0, -0.6); ch.root.rotation.y = Math.PI * 1.05;
      ch.pose(lt, [L.seg('idle', 0, { loop: true })], [[-99, 'open', 'neutral']]);
      look(c, V(-1.25, 1.3, 1.4 - lt * 0.05), V(-1.6, 2.55, -1.5));
    } };
  }
  // 03 (12.29-14.04): la cabina; Ava se asoma a la hoja pegada en la ventanilla
  { const c = cam(42);
    out['03_booth'] = { scene, camera: c, overlay: vign(0.35), update(lt, t) {
      state({});
      const P = V(-2.45, 0, 3.75); ch.root.position.copy(P); ch.root.rotation.y = -Math.PI / 2;
      ch.pose(lt, [L.seg('peek', 0, { from: 0.1, speed: 0.6 })], [[-99, 'half', 'neutral']]);
      look(c, V(-1.0, 1.55, 5.4 - lt * 0.2), V(-2.85, 1.5, 3.7));
    } };
  }
  // 04 (26.47-30.79): frontal, sonrie: "una broma del personal" (shrug -> guino)
  { const c = cam(40);
    out['04_laugh'] = { scene, camera: c, overlay: vign(0.3), update(lt, t) {
      state({});
      const P = V(-1.4, 0, 2.5); ch.root.position.copy(P); ch.root.rotation.y = 0.15;
      look(c, V(-1.1, 1.45, 4.6 - lt * 0.06), V(-1.35, 1.32, 2.5));
      const tw = W.prank - T.laugh;
      ch.pose(lt, [L.seg('idle', 0, { loop: true }), L.seg('shrug', 0.25, { fade: 0.2, speed: 0.8 }), L.seg('smug', tw, { fade: 0.25 })],
        [[-99, 'open', mouthAt(t, 'smileOpen')], [tw, lt > 3.5 && lt < 3.58 ? 'blink' : 'open', mouthAt(t, 'smile')]]);
      ch.lookAt(c, 1, 40);
    } };
  }
  // 05 (30.79-34.54): el reloj: 11:59 -> 12:00 en "midnight"
  { const c = cam(44);
    out['05_clock'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ clock: t < W.midnight ? '11:59' : '12:00', hero: false });
      look(c, V(-1.4, 2.35, 1.3 - lt * 0.12), V(-1.6, 2.85, -1.5));
    } };
  }
  // 05b (34.54-39.2): plano general; los tubos se apagan fila a fila hacia la camara y termina a oscuras en "out"
  { const c = cam(50);
    out['05b_dark'] = { scene, camera: c, overlay: vign(0.45), update(lt, t) {
      const k = Math.round(tubes.length * ease(W.every + 0.1, W.out, t));
      state({ k, lights: t < W.out ? 1 - 0.6 * ease(W.every, W.out, t) : 0, clock: '12:00' });
      if (t >= W.out) setClock('12:00', true);
      ch.root.position.set(-1.45, 0, 0.9); ch.root.rotation.y = Math.PI * 0.8; blueL.position.set(-1.6, 3.2, 2.4);
      ch.pose(lt, [L.seg('idle', 0, { loop: true }), L.seg('look_around', W.out - T.dark, { fade: 0.2 })], [[-99, 'open', 'neutral'], [W.out - T.dark, 'surprised', 'gasp']]);
      look(c, V(-1.95, 1.5, 3.2), V(-1.45, 1.35, -4));
    } };
  }
  // 06 (39.2-42.72): a oscuras, dos faros aparecen en el tunel y se acercan sin un sonido; ilumina a Ava
  { const c = cam(46);
    out['06_train'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      const k = ease(0, 3.4, lt), zf = -70 + (STOP + 70) * (1 - (1 - k) * (1 - k));
      state({ k: tubes.length, lights: 0, cars: zf, clock: '12:00' });
      carA.lamps.forEach((p) => { p.visible = true; }); headL.intensity = 40; headL.position.set(1.7, 0.6, zf + 0.5); headL.target.position.set(0, 0.5, zf + 20);
      ch.root.position.set(-1.0, 0, 7.0); ch.root.rotation.y = Math.PI * 0.85; blueL.position.set(-1.5, 3, 7.5);
      ch.pose(lt, [L.seg('idle', 0, { loop: true })], [[-99, 'surprised', 'neutral']]);
      look(c, V(-2.3, 1.5, 9.4), V(0.9, 0.8, -14));
    } };
  }
  // 06b (42.72-46.91): el tren parado; la puerta frente a Ava se abre en "open": vagon vacio iluminado
  { const c = cam(46);
    out['06b_doors'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ k: tubes.length, lights: 0, cars: STOP, doors: ease(W.open - 0.05, W.open + 0.9, t), clock: '12:00' });
      carA.lamps.forEach((p) => { p.visible = true; });
      ch.root.position.copy(AVA_DOOR).add(V(-0.45, 0, 1.35)); ch.root.rotation.y = angTo(ch.root.position, V(0.2, 0, DOOR_Z));
      blueL.position.set(-1.5, 3, DOOR_Z + 3);
      ch.pose(lt, [L.seg('idle', 0, { loop: true })], [[-99, 'surprised', 'neutral']]);
      look(c, V(-2.9, 1.55, DOOR_Z + 3.8), V(-0.1, 1.2, DOOR_Z - 0.3));
    } };
  }
  // 07 (46.91-48.94): pasos lentos detras: Ava de cara a la puerta abierta, a su espalda el anden negro
  // 07b (48.94-50.76): en la oscuridad detras de ella, una silueta negra con ojos blancos
  const SH_FAR = V(-3.5, 0, DOOR_Z - 0.5), SH_NEAR = V(-1.85, 0, DOOR_Z + 0.5);
  for (const [id, t0, sh] of [['07_steps', T.steps, null], ['07b_eyes', T.eyes, SH_FAR]]) {
    const c = cam(52);
    out[id] = { scene, camera: c, overlay: vign(0.45), update(lt, t) {
      const em = sh ? L.smooth((lt - 0.45) / 1.2) : 1;   // v6 (usuario): emerge de la oscuridad, ojos primero
      state({ k: tubes.length, lights: 0, cars: STOP, doors: 1, clock: '12:00', shadowAt: sh ? [sh.clone().add(V(-0.75 * (1 - em), 0, 0)), Math.PI / 2, lt] : null });
      if (sh) { const ke = L.smooth(lt / 0.35); mEye.opacity = mPup.opacity = ke; mGlow.opacity = ke;
        shMats.forEach((m) => { m.transparent = em < 1; m.opacity = em; m.depthWrite = em >= 1; }); }
      carGlow.position.set(0.3, 1.6, DOOR_Z);
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2;
      const scared = sh ? [[-99, 'shocked', mouthAt(t, 'gasp')]] : [[-99, 'surprised', mouthAt(t, 'frown')], [0.9, 'shocked', mouthAt(t, 'gasp')]];
      ch.pose(lt, sh ? [L.seg('idle', 0, { from: 0.5, speed: 0 })] : [L.seg('idle', 0, { loop: true })], scared);   // v5 (usuario): sin temblor, quieta con cara de miedo
      look(c, V(0.1, 1.4, DOOR_Z - 0.35), V(-2.2, 1.15, DOOR_Z));   // desde dentro del vagon hacia el anden
      void t0;
    } };
  }
  // 07c (50.76-54.51): primer plano: la silueta pegada a su espalda; aliento en la nuca (vaho)
  { const c = cam(42);
    out['07c_neck'] = { scene, camera: c, overlay(lt, dt, a, o) {
      vign(0.5)(lt, dt, a, o);
      const t = T.neck + lt; if (t > W.breathing - 0.1) { const c2 = o.tctx, ph = ((t - W.breathing) % 1.3) / 1.3, [x, y] = L.toScreen(o.camera, -1.5, 1.52, -1.4 - 0.22);
        for (let i = 0; i < 9; i++) { const r = 3 + ph * 16 + i * 1.5; c2.fillStyle = `rgba(220,230,255,${0.12 * (1 - ph)})`; c2.fillRect(Math.round(x - r - i * 2), Math.round(y - r / 2 + i), Math.round(r * 2), Math.round(r)); } }
    }, update(lt, t) {
      look(c, V(0.1, 1.55, DOOR_Z - 0.1), V(-1.4, 1.6, DOOR_Z - 0.2));
      state({ k: tubes.length, lights: 0, cars: STOP, doors: 1, clock: '12:00', shadowAt: [inFrame(c, 1.95, 0.26), Math.PI / 2, lt, 0.45] });
      carGlow.position.set(0.3, 1.6, DOOR_Z);
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2;
      ch.pose(lt, [L.seg('idle', 0, { loop: true, speed: 0.4 })], [[-99, 'shocked', 'gasp'], [2.6, 'shocked', 'bigShock']]);
      look(c, V(0.1, 1.55, DOOR_Z - 0.1), V(-1.4, 1.6, DOOR_Z - 0.2));
    } };
  }
  // 08 (54.51-55.93): "Oh, fudge." frontal, luz del vagon en la cara
  { const c = cam(42);
    out['08_fudge'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      look(c, V(0.1, 1.5, DOOR_Z - 0.05), V(-1.35, 1.5, DOOR_Z - 0.2));
      state({ k: tubes.length, lights: 0, cars: STOP, doors: 1, clock: '12:00', shadowAt: [inFrame(c, 1.95, 0.3), Math.PI / 2, 3 + lt, 0.45] });
      carGlow.position.set(0.3, 1.6, DOOR_Z); carGlow.intensity = 7;
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2;
      ch.pose(lt, [L.seg('shrug', 0, { from: 0.25, speed: 0.5 })], [[-99, 'squeeze', mouthAt(t, 'disgust')]]);   // v6 (usuario): >.< con mueca, sin sonrisa
      look(c, V(0.1, 1.5, DOOR_Z - 0.05), V(-1.35, 1.5, DOOR_Z - 0.2));
      ch.lookAt(c, 1, 40);
    } };
  }
  // 08b (55.93-58.89): las puertas empiezan a cerrarse; Ava entre la puerta y la silueta (plano lateral)
  { const c = cam(48);
    out['08b_close'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ k: tubes.length, lights: 0, cars: STOP, doors: 1 - 0.55 * ease(W.closing - 0.3, W.closing + 2.0, t), clock: '12:00', shadowAt: [SH_NEAR, Math.PI / 2, 4.5 + lt] });
      carGlow.position.set(0.3, 1.6, DOOR_Z);
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2 - 0.25;
      ch.pose(lt, [L.seg('idle', 0, { loop: true })], [[-99, 'shocked', 'frown']]);
      look(c, V(-3.9, 1.5, DOOR_Z - 2.9), V(-1.0, 1.15, DOOR_Z + 0.2));
    } };
  }
  // 09 (58.89-64.0): menu RE sobre el anden oscuro: 1 GET ON / 2 STAY, cursor en cada opcion, COMMENT 1 OR 2, maquina de escribir
  const TYPE = 'MOST COMMENTS DECIDE PART 2.';
  { const c = cam(48);
    out['09_choice'] = { scene, camera: c, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T.choice + lt;
      vign(0.6)(lt, dt, a, o);
      const kp = L.clamp01(lt / 0.2), PX = 16, PY = 112, PW = 328, PH = 176;
      cx.fillStyle = `rgba(4,8,18,${0.86 * kp})`; cx.fillRect(PX, PY, PW, PH);
      px(cx, PX, PY, '#8a90a8', PW, 1); px(cx, PX, PY, '#8a90a8', 1, PH); px(cx, PX, PY + PH - 1, '#2a2e3e', PW, 1); px(cx, PX + PW - 1, PY, '#2a2e3e', 1, PH);
      cx.strokeStyle = '#3a3e52'; cx.strokeRect(PX + 3.5, PY + 3.5, PW - 7, PH - 7);
      if (t >= W.so) bitText(cx, 'WHAT DO YOU DO?', LW / 2, 146, 2, '#ececec', { outline: '#000000' });
      const opts = [['1  GET ON', W.geton, '#5ab0ff'], ['2  STAY', W.stay, '#ff5a4a']];
      const sel = t >= W.stay ? 1 : t >= W.geton ? 0 : -1;
      opts.forEach(([s, tw, col], i) => { if (t < tw - 0.25) return; const y = 196 + i * 50; left(cx, s, 110, y, 3, i === sel ? col : '#b8b8b8', { outline: '#000000' });
        if (i === sel) { const on = Math.floor((t - tw) * 4) % 2 === 0, x0 = 84; for (let k = 0; k < 10; k++) px(cx, x0 + k, y - 11 + k, on ? '#ffe048' : '#c89a20', 1, 23 - 2 * k); } });
      if (t >= W.comment) { const b = Math.round(3 * Math.abs(Math.sin((t - W.comment) * 5))); bitText(cx, 'COMMENT 1 OR 2', LW / 2, 326 + b, 2, '#ffd23f', { outline: '#000000' }); }
      if (t >= W.most) {   // v3: dos lineas centradas sobre placa oscura (la revision API la vio pegada al borde)
        const n = Math.floor((t - W.most) * 20), L1 = 'MOST COMMENTS', L2 = 'DECIDE PART 2.';
        cx.font = 'bold 22px "Courier New", monospace'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
        cx.fillStyle = 'rgba(4,8,18,0.8)'; cx.fillRect(40, 466, LW - 80, 64);
        [[L1, 0, 484], [L2, L1.length + 1, 512]].forEach(([ln, off, y]) => { const s2 = ln.slice(0, Math.max(0, n - off)); if (!s2) return;
          const xw = Math.round(LW / 2 - cx.measureText(ln).width / 2); cx.fillStyle = '#000'; cx.fillText(s2, xw + 2, y + 2); cx.fillStyle = '#e8e4dc'; cx.fillText(s2, xw, y); });
      }
    }, update(lt, t) {
      state({ k: tubes.length, lights: 0, cars: STOP, doors: 0.45, clock: '12:00', shadowAt: [SH_NEAR, Math.PI / 2, 7 + lt] });
      carGlow.position.set(0.3, 1.6, DOOR_Z);
      ch.root.position.copy(AVA_DOOR); ch.root.rotation.y = Math.PI / 2 - 0.25;
      ch.pose(lt, [L.seg('idle', 0, { loop: true })], [[-99, 'shocked', 'frown']]);
      look(c, V(-3.9, 1.5, DOOR_Z - 2.9), V(-1.0, 1.15, DOOR_Z + 0.2));
    } };
  }
  // ================= 03b FILE: NIGHT SHIFT INSTRUCTIONS (regla 2 rota a media frase) =================
  {
    const fs = new THREE.Scene(); fs.background = new THREE.Color(0x000000); const fc = cam(45);
    const PXL = 28, PYT = 62, PWd = 304, PHd = 300, INK = '#2a2016';
    const R = L.rng(404);
    const paper = document.createElement('canvas'); paper.width = PWd; paper.height = PHd;
    { const c = paper.getContext('2d'), img = c.createImageData(PWd, PHd);
      const xEnd = 70 + textWidth('BEHIND', 2) + 10 + textWidth('YOU,', 2) + 10 + textWidth("DON'T—", 2) - PXL + 3;   // fin de la linea 2 (x del papel)
      const tear = []; for (let x = 0; x < PWd; x++) { const j = Math.round(3 * Math.sin(x * 0.53) + 2 * Math.sin(x * 1.7 + 1) + R() * 3); tear.push((x < xEnd ? 231 : Math.max(198, 231 - (x - xEnd) * 1.6)) + j); }
      for (let y = 0; y < PHd; y++) for (let x = 0; x < PWd; x++) {
        const i = (y * PWd + x) * 4; if (y > tear[x]) { img.data[i + 3] = 0; continue; }
        const e = Math.min(x, y, PWd - 1 - x), edge = e < 8 ? (8 - e) * 5 : 0, n = (R() - 0.5) * 14, fib = y > tear[x] - 3 ? 30 : 0;
        img.data[i] = 222 + n - edge + fib * 0.3; img.data[i + 1] = 212 + n - edge * 1.2 + fib * 0.3; img.data[i + 2] = 176 + n - edge * 1.6 + fib * 0.4; img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      for (const [x, y, r] of [[268, 28, 15], [24, 150, 13]]) { c.strokeStyle = 'rgba(120,80,30,0.22)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.stroke(); }
      c.fillStyle = 'rgba(230,230,210,0.75)'; c.fillRect(20, -2, 46, 12); c.fillRect(PWd - 66, -2, 46, 12);   // cinta
    }
    const R1 = 'NEVER BOARD AN EMPTY TRAIN.';
    const R2W = CUE.R2;   // [palabra, t] de la regla 2 en la voz (cues.json)
    out['03b_file'] = { scene: fs, camera: fc, update() {}, overlay(lt, dt, a, o) {
      const c = o.tctx, t = T.file + lt, prev = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
      px(c, 14, 30, '#2c3040', 332, 22); px(c, 14, 30, '#7a8094', 332, 1); px(c, 18, 34, '#04060e', 324, 14);
      bitText(c, 'FILE', 40, 41, 1, '#9cf09c', { outline: null }); bitText(c, 'MERCY ST.', 300, 41, 1, '#c8ccd8', { outline: null });
      const sl = Math.round(16 * (1 - ease(0, 0.3, lt))), Y = PYT + sl, dy = sl;
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(PXL + 4, Y + 4, PWd, PHd - 40); c.drawImage(paper, PXL, Y);
      bitText(c, 'NIGHT SHIFT', LW / 2, 96 + dy, 2, INK, { outline: null });
      bitText(c, 'INSTRUCTIONS', LW / 2, 118 + dy, 2, INK, { outline: null });
      bitText(c, 'STAFF ONLY', LW / 2, 138 + dy, 1, '#8a1810', { outline: null });
      px(c, PXL + 16, 150 + dy, PWd - 32, 1, INK);
      const wrap = (words, x0, y0, col) => { let x = x0, y = y0; for (const [w, tw, cl] of words) { if (t < tw) break; const wd = textWidth(w, 2); if (x + wd > 316) { x = x0; y += 24; } left(c, w, x, y, 2, cl || col); x += wd + 10; } };
      if (t >= W.rule1) { left(c, '1.', 44, 176 + dy, 2, INK); wrap(R1.split(' ').map((w, i) => [w, i < 2 ? W.never : W.empty, i >= 3 ? '#8a1810' : null]), 70, 176 + dy, INK); }
      if (t >= W.rule2) { left(c, '2.', 44, 254 + dy, 2, INK); wrap(R2W, 70, 254 + dy, INK); }
      c.imageSmoothingEnabled = prev;
    } };
  }
  // ================= 10 tarjeta final: el reloj del anden girando (12:00) + NEXT: PART 2. + FOLLOW AVA RESTFIELD! =================
  {
    const es = new THREE.Scene(); es.background = new THREE.Color(0x000000); const ec = cam(30); ec.position.set(0, 0, 4.2); ec.lookAt(0, 0, 0);
    es.add(new THREE.AmbientLight(0xffffff, 1.6)); const dl = new THREE.DirectionalLight(0xfff2dc, 1.4); dl.position.set(2, 3, 4); es.add(dl);
    const ck2 = await prop('platform_clock'); const g = new THREE.Group(); g.add(ck2); ck2.position.set(0, -0.2, 0); g.position.set(0, 0.3, 0); es.add(g); g.scale.setScalar(1.1);   // v4: margen lateral al girar
    const ledC = document.createElement('canvas'); ledC.width = 96; ledC.height = 36; const lt2 = L.canvasTex(ledC); { const c = ledC.getContext('2d'); px(c, 0, 0, '#120808', 96, 36); drawLED(c, '12:00', 10, 4, 4, '#ff2a1a', '#1c0806'); }
    for (const s of [1, -1]) L.plane(0.78, 0.29, L.basic(lt2), 0.014, 0.203, 0.085 * s, ck2, s > 0 ? 0 : Math.PI);
    out['10_end'] = { scene: es, camera: ec, update(lt) { const q = L.q15(lt); g.rotation.y = -0.45 + q * 0.22; g.rotation.x = 0.1; }, overlay(lt, dt, a, o) {
      const c = o.tctx; c.textAlign = 'center'; c.textBaseline = 'middle';
      const n = Math.floor(lt * 14); c.font = '15px "Courier New", monospace'; c.fillStyle = '#e8e4dc'; c.fillText('NEXT:'.slice(0, n), LW / 2, 432);
      if (lt > 0.6) { c.font = 'bold 32px "Courier New", monospace'; c.fillStyle = '#ff4a3a'; c.fillText('PART 2.'.slice(0, Math.floor((lt - 0.6) * 12)), LW / 2, 466); }
      if (T.end + lt >= T.follow + 0.9) bitText(c, 'FOLLOW FOR MORE!', LW / 2, 528, 2, '#ececec', { outline: null });   // v6 (usuario): shorts = FOLLOW FOR MORE!, largos = SUBSCRIBE!
    } };
  }
  return out;
}
