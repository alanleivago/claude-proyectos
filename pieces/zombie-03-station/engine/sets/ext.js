// sets/ext.js — ep3 01_ext (0.0-2.55): night exterior in the rain of an old city police station. Stone portico with
// columns + steps + two lit glass doors (dim emergency light inside), "CITY POLICE" frieze, brick wings, sodium street
// lamps, wet asphalt with puddle reflections, abandoned black/white patrol car (driver door open, light bar off),
// 3 zombies shambling across the street, rain + one lightning flash. Low camera pushing slowly toward the station.
// Typewriter "DAY 1" / "9:02 PM" (Courier, one key per letter, the time on the word "nine" = 1.57).
// World: facade at z=-9 facing +z, steps z -6..-8, sidewalk z -6..-4.5, road z > -4.5, camera at z~+7 looking -z.

// ---- typewriter + sfx timing (global s; this shot starts at 0) ----
const KEY_RATE = 12;
const LINES = [['DAY 1', 0.2], ['9:02 PM', 1.57]];
const keyTimes = (s, t0) => [...s].map((ch, i) => [t0 + i / KEY_RATE, ch]).filter(([, ch]) => ch !== ' ');
const FLASH = [[1.17, 0.07, 1], [1.29, 0.06, 0.7]];   // lightning on "city": [start, len, strength]
export const EXT_SFX = [
  [0.0, 'rain_street_loop'],
  ...LINES.flatMap(([s, t0]) => keyTimes(s, t0).map(([t]) => [Math.round(t * 1000) / 1000, 'type_key'])),
  [1.17, 'thunder_crack'],
  [0.45, 'zombie_moan'], [1.95, 'zombie_moan'],
].sort((a, b) => a[0] - b[0]);

export async function shots({ L }) {
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
  const flashK = (t) => { let k = 0; for (const [a, d, s] of FLASH) if (t >= a && t < a + d) k = Math.max(k, s); else if (t >= a + d && t < a + d + 0.12) k = Math.max(k, s * 0.35 * (1 - (t - a - d) / 0.12)); return k; };
  const out = {};

  const NIGHT = 0x1c2638;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(NIGHT); scene.fog = new THREE.Fog(NIGHT, 16, 46);
  const hemi = new THREE.HemisphereLight(0x8ea4c8, 0x2c2a30, 1.6); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xa8bce0, 0.9); moon.position.set(4, 8, 6); scene.add(moon);

  // ---------------- textures (PS1, nearest, painted in code) ----------------
  const skyT = L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(301);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = y / h, n = r() * 6 - 3; px(c, x, y, rgb(14 + 46 * k * k + n, 20 + 46 * k * k + n, 36 + 46 * k * k + n)); }
    for (let k = 0; k < 18; k++) { const cx = r() * w, cy = r() * h * 0.7, rx = 3 + r() * 7; for (let x = -rx; x < rx; x++) px(c, (cx + x + w) % w | 0, cy | 0, 'rgba(70,82,104,0.45)', 1, 1 + (r() * 2 | 0)); }   // cloud bands
  });
  const brickT = L.cvs(64, 64, (c, w, h) => {
    const r = L.rng(302);
    px(c, 0, 0, '#3e3a38', w, h);
    for (let row = 0; row < 16; row++) for (let b = -1; b < 8; b++) {
      const x = b * 8 + (row % 2 ? 4 : 0), n = r() * 26 - 13;
      px(c, x + 1, row * 4 + 1, rgb(122 + n, 64 + n * 0.6, 50 + n * 0.5), 7, 3);
    }
    for (let k = 0; k < 8; k++) { const x = r() * w | 0; for (let y = 0; y < h; y++) if (r() < 0.8) px(c, x, y, 'rgba(20,20,28,0.25)'); }   // rain stains
  });
  const stoneT = L.cvs(32, 32, (c, w, h) => {
    const r = L.rng(303);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 16 - 8; px(c, x, y, rgb(170 + n, 164 + n, 150 + n)); }
    for (let y = 0; y < h; y += 8) px(c, 0, y, '#7e786c', w, 1);
    for (let y = 0; y < h; y += 8) px(c, (y / 8) % 2 ? 4 : 20, y, '#7e786c', 1, 8);
    for (let k = 0; k < 6; k++) { const x = r() * w | 0; for (let y = r() * 8 | 0; y < h; y++) if (r() < 0.6) px(c, x, y, 'rgba(60,58,64,0.3)'); }
  });
  const colT = L.cvs(16, 64, (c, w, h) => {
    const r = L.rng(304);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5 + (x % 4 === 0 ? -34 : x % 4 === 2 ? 12 : 0); px(c, x, y, rgb(184 + n, 178 + n, 164 + n)); }
    for (let k = 0; k < 4; k++) { const x = r() * w | 0; for (let y = 0; y < h; y++) if (r() < 0.5) px(c, x, y, 'rgba(50,50,60,0.3)'); }
  });
  const stepT = L.cvs(32, 8, (c, w, h) => { const r = L.rng(305); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7; px(c, x, y, rgb(150 + n + (y < 2 ? 34 : 0), 146 + n + (y < 2 ? 34 : 0), 136 + n + (y < 2 ? 34 : 0))); } });
  const asphaltT = L.cvs(64, 64, (c, w, h) => {
    const r = L.rng(306);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 16 - 8; px(c, x, y, rgb(46 + n, 50 + n, 58 + n)); }
    for (let k = 0; k < 6; k++) {   // puddles = lighter, bluer patches (sky reflected)
      const cx = r() * w, cy = r() * h, rx = 5 + r() * 9, ry = 2 + r() * 4;
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) < 1) { const e = (x * x) / (rx * rx) + (y * y) / (ry * ry); px(c, (cx + x + w) % w | 0, (cy + y + h) % h | 0, e < 0.45 ? '#74849c' : '#5a6678'); }
    }
    c.strokeStyle = '#30323a'; c.lineWidth = 1;
    for (let k = 0; k < 5; k++) { c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let s = 0; s < 4; s++) { x += r() * 10 - 5; y += r() * 10 - 5; c.lineTo(x, y); } c.stroke(); }
  });
  const walkT = L.cvs(32, 32, (c, w, h) => { const r = L.rng(307); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7; px(c, x, y, rgb(104 + n, 106 + n, 112 + n)); } px(c, 0, 0, '#5a5c64', w, 1); px(c, 0, 0, '#5a5c64', 1, h); px(c, 0, 16, '#5a5c64', w, 1); px(c, 16, 0, '#5a5c64', 1, h); });
  // glass door: dark lobby, green emergency EXIT glow at the top, faint checker floor, reflection streak
  const glassT = L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(308);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 6 - 3, g = Math.max(0, 1 - Math.hypot(x - 16, y - 6) / 22); px(c, x, y, rgb(18 + n + 30 * g, 34 + n + 70 * g, 40 + n + 40 * g)); }
    for (let y = 46; y < h; y++) for (let x = 0; x < w; x++) if (((x >> 2) + (y >> 2)) % 2) px(c, x, y, 'rgba(90,130,120,0.18)');
    px(c, 2, 26, 'rgba(10,16,20,0.6)', 28, 12);   // reception desk silhouette
    px(c, 11, 2, '#2a6a3a', 10, 5); px(c, 12, 3, '#9af0a8', 8, 3);   // EXIT sign
    for (let y = 0; y < h; y++) { const x = 22 - y * 0.35; if (x > 0) px(c, x | 0, y, 'rgba(160,190,210,0.25)', 2, 1); }
  });
  const winT = (lit, seed) => L.cvs(16, 24, (c, w, h) => {
    const r = L.rng(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 8 - 4; px(c, x, y, lit ? rgb(70 + n + y * 2, 64 + n + y, 40 + n) : rgb(22 + n, 30 + n + y * 0.6, 44 + n + y)); }
    px(c, 0, 0, '#2a2a2c', w, 1); px(c, 0, h - 1, '#2a2a2c', w, 1); px(c, 0, 0, '#2a2a2c', 1, h); px(c, w - 1, 0, '#2a2a2c', 1, h);
    px(c, 7, 0, '#2a2a2c', 2, h); px(c, 0, 11, '#2a2a2c', w, 2);
    if (!lit) for (let y = 0; y < h; y++) { const x = 12 - y * 0.5; if (x > 0) px(c, x | 0, y, 'rgba(110,130,160,0.35)'); }
  });
  const signT = L.cvs(128, 16, (c, w, h) => {
    px(c, 0, 0, '#3a3834', w, h); px(c, 0, 0, '#5a5650', w, 1); px(c, 0, h - 1, '#24221e', w, 1);
    c.font = 'bold 13px "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#141210'; c.fillText('CITY  POLICE', 65, 9.5);
    c.fillStyle = '#e8dcb8'; c.fillText('CITY  POLICE', 64, 8.5);
  });
  const skylineT = L.cvs(32, 32, (c, w, h) => { const r = L.rng(309); px(c, 0, 0, '#141a26', w, h); for (let y = 2; y < h; y += 4) for (let x = 2; x < w; x += 4) if (r() < 0.12) px(c, x, y, r() < 0.5 ? '#8a7a4a' : '#4a5a6a', 2, 2); });

  // ---------------- sky + distant skyline ----------------
  const sky = L.plane(110, 50, L.basic(skyT, 0xffffff, { fog: false }), 0, 18, -40, scene);
  for (const [x, w, hh, z] of [[-14, 7, 16, -22], [-8.5, 4, 12, -18], [9, 5, 14, -19], [15, 7, 19, -24], [-20, 6, 10, -26], [21, 6, 12, -27]])
    L.box(w, hh, 2, L.basic(L.rep(skylineT, w / 3, hh / 3), 0xffffff, { fog: false }), x, hh / 2, z, scene);

  // ---------------- the station ----------------
  const FZ = -9;
  const brick = L.lam(L.rep(brickT, 3, 3)), stone = L.lam(L.rep(stoneT, 6, 3)), stoneS = L.lam(L.rep(stoneT, 2, 2));
  for (const s of [-1, 1]) {   // brick wings
    L.box(5.2, 8.2, 1, brick, s * 5.9, 4.1, FZ - 0.5, scene);
    L.box(5.4, 0.9, 1.1, stoneS, s * 5.9, 0.45, FZ - 0.45, scene);   // stone base
    L.box(5.5, 0.35, 1.2, stoneS, s * 5.9, 8.3, FZ - 0.45, scene);   // cornice
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x = s * (4.2 + i * 1.5), y = 2.6 + j * 3.0, lit = (i === 1 && j === 1 && s > 0);
      L.plane(0.8, 1.4, L.basic(winT(lit, 320 + i * 7 + j * 3 + (s > 0 ? 50 : 0))), x, y, FZ + 0.02, scene);
      L.box(1.0, 0.16, 0.12, stoneS, x, y + 0.8, FZ + 0.06, scene);   // lintel
      L.box(0.96, 0.1, 0.16, stoneS, x, y - 0.74, FZ + 0.08, scene);  // sill
    }
  }
  // central stone block + portico
  L.box(6.6, 8.6, 1, stone, 0, 4.3, FZ - 0.5, scene);
  L.box(7.4, 1.0, 2.2, stoneS, 0, 0.5, FZ + 0.9, scene);   // podium the columns stand on (top of steps y=1.0)
  for (let i = 0; i < 5; i++) L.box(7.0, 0.2, 0.42, L.lam(L.rep(stepT, 6, 1)), 0, 0.1 + i * 0.2, -5.9 - i * 0.42 - (i ? 0 : 0) - 0.21, scene).scale.set(1, (i + 1), 1);
  // (steps: each box grows down to the ground so the stack is solid)
  scene.children.slice(-5).forEach((m, i) => { m.position.y = (0.2 * (i + 1)) / 2; });
  const colM = L.lam(L.rep(colT, 2, 1));
  for (const x of [-2.75, -1.55, 1.55, 2.75]) {
    L.mesh(new THREE.CylinderGeometry(0.24, 0.27, 4.2, 8), colM, x, 3.1, -7.95, scene);
    L.box(0.66, 0.2, 0.66, stoneS, x, 1.1, -7.95, scene);   // base
    L.box(0.7, 0.24, 0.7, stoneS, x, 5.3, -7.95, scene);    // capital
  }
  L.box(7.2, 1.1, 1.6, stone, 0, 5.95, -8.25, scene);        // entablature
  L.plane(5.4, 0.68, L.basic(signT, 0xd8d4c8), 0, 5.95, -7.44, scene);   // CITY POLICE (lit sign, readable)
  L.box(7.6, 0.18, 1.8, stoneS, 0, 6.58, -8.25, scene);       // cornice
  { const sh = new THREE.Shape(); sh.moveTo(-3.7, 0); sh.lineTo(3.7, 0); sh.lineTo(0, 1.35); sh.lineTo(-3.7, 0);   // pediment
    const g = new THREE.ExtrudeGeometry(sh, { depth: 1.4, bevelEnabled: false }); L.mesh(g, L.lam(L.rep(stoneT, 0.25, 0.4)), 0, 6.67, -8.95, scene);
    const disc = L.mesh(new THREE.CircleGeometry(0.34, 10), L.lam(null, 0x8a7a50), 0, 7.15, -7.53, scene);   // brass seal
    L.mesh(new THREE.CircleGeometry(0.24, 5), L.lam(null, 0x4a4030), 0, 7.15, -7.52, scene); }
  // flag pole (flag hangs wet)
  L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 5), L.lam(null, 0x9a9aa0), 3.75, 8.5, -8.2, scene);

  // ---- front doors: two glass leaves + side lights + transom, metal frames, glass is self-lit (dim emergency light) ----
  const glass = L.basic(glassT), frame = L.lam(null, 0x6a6e74);
  const DZ = FZ + 0.02, DY = 1.0;
  for (const [x, w] of [[-0.52, 0.98], [0.52, 0.98]]) { L.plane(w, 2.5, glass, x, DY + 1.25, DZ, scene); L.box(0.06, 0.4, 0.06, L.lam(null, 0xb0b4b8), x + (x < 0 ? 0.38 : -0.38), DY + 1.2, DZ + 0.06, scene); }   // + push bars
  for (const x of [-1.32, 1.32]) L.plane(0.52, 2.5, glass, x, DY + 1.25, DZ, scene);
  L.plane(3.1, 0.6, glass, 0, DY + 2.85, DZ, scene);
  for (const x of [-1.6, -1.04, 0, 1.04, 1.6]) L.box(0.08, 3.2, 0.1, frame, x, DY + 1.6, DZ + 0.04, scene);
  for (const y of [0.04, 2.52, 3.18]) L.box(3.28, 0.08, 0.1, frame, 0, DY + y, DZ + 0.04, scene);
  // emergency light spill on the landing + steps (green), + a halo plane in front of the doors
  const doorLight = new THREE.PointLight(0x6ad890, 6, 7, 1.4); doorLight.position.set(0, 2.0, -8.2); scene.add(doorLight);

  // ---------------- street ----------------
  L.plane(60, 40, L.lam(L.rep(asphaltT, 22, 15)), 0, 0, 8, scene, 0, -Math.PI / 2);
  L.box(40, 0.14, 1.6, L.lam(L.rep(walkT, 25, 1)), 0, 0.07, -5.2, scene);   // sidewalk
  L.box(40, 0.14, 0.12, L.lam(null, 0x8a8a88), 0, 0.07, -4.36, scene);      // curb
  const lineM = L.lam(null, 0xb8a050);
  for (let x = -16; x < 16; x += 2.2) L.plane(1.1, 0.1, lineM, x, 0.012, 1.6, scene, 0, -Math.PI / 2);   // faded centre line
  for (let x = -3; x <= 3; x += 0.8) L.plane(0.42, 2.2, L.lam(null, 0x9a9c9e), x, 0.011, -3.0, scene, 0, -Math.PI / 2);   // crosswalk

  // ---- street lamps (sodium) + glow halos + puddle reflections ----
  const haloT = L.cvs(32, 32, (c, w, h) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,220,150,0.9)'); g.addColorStop(0.3, 'rgba(255,190,110,0.35)'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  haloT.minFilter = haloT.magFilter = THREE.LinearFilter;
  const reflT = L.cvs(16, 64, (c, w, h) => {   // vertical streak reflection, broken by ripples
    const r = L.rng(310);
    for (let y = 0; y < h; y++) { const k = Math.pow(1 - y / h, 1.3); for (let x = 0; x < w; x++) { const e = 1 - Math.abs(x - 7.5) / 8, a = (0.35 + 0.65 * k) * e * (r() < 0.25 ? 0.3 : 1); c.fillStyle = `rgba(255,${190 + r() * 40 | 0},120,${Math.min(1, a * 1.2)})`; c.fillRect(x, y, 1, 1); } }
  });
  const lampM = L.lam(null, 0x2a3230), haloM = new THREE.MeshBasicMaterial({ map: haloT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const reflM = new THREE.MeshBasicMaterial({ map: reflT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const lamps = [];
  for (const [x, z, s] of [[-3.25, -5.0, 1], [3.25, -5.0, -1]]) {
    L.mesh(new THREE.CylinderGeometry(0.07, 0.1, 4.6, 6), lampM, x, 2.3, z, scene);
    L.box(0.9, 0.08, 0.08, lampM, x + s * 0.42, 4.55, z, scene);
    L.box(0.42, 0.18, 0.26, lampM, x + s * 0.85, 4.5, z, scene);
    const bulb = L.box(0.3, 0.05, 0.18, L.basic(null, 0xffe0a0), x + s * 0.85, 4.39, z, scene);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), haloM); halo.position.set(x + s * 0.85, 4.35, z + 0.2); scene.add(halo);
    const pl = new THREE.PointLight(0xffb870, 22, 11, 1.3); pl.position.set(x + s * 0.85, 4.2, z); scene.add(pl);
    const rf = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 8), reflM); rf.rotation.x = -Math.PI / 2; rf.position.set(x + s * 0.85 + s * 0.15, 0.03, z + 4.6 + 0.5); scene.add(rf);
    lamps.push({ bulb, halo, pl, rf });
  }
  // green door light reflected on the wet sidewalk/road in front of the steps
  const reflG = new THREE.MeshBasicMaterial({ map: reflT, color: 0x40ff90, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
  { const rf = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 6), reflG); rf.rotation.x = -Math.PI / 2; rf.position.set(0, 0.02, -0.5); scene.add(rf); }

  // ---------------- abandoned patrol car (black & white, light bar off, driver door open) ----------------
  const car = new THREE.Group(); car.position.set(-1.2, 0, -2.9); car.rotation.y = -0.75; scene.add(car);   // front 3/4: nose toward camera-left, driver side + open door toward camera
  {
    // model: Kenney "Car Kit" 3.1 police.glb — CC0 (https://kenney.nl/assets/car-kit, licence copy in models/police-kenney.LICENSE.txt)
    // raw: 1.5 x 1.1 x 2.9 m, nose +z, one body mesh (no separate doors) -> scaled to 4.8 m; the driver door is added here.
    const g = await L.loadModel('models/police-kenney.glb');
    const body = L.ps1Clone(g.scene);
    body.updateMatrixWorld(true);
    // palette repaint (Kenney colormap = 8x4 cells): windows -> dark tinted glass, light bar -> off, black panels -> deep black
    const pal = await L.img('models/Textures/colormap.png');
    const palT = L.cvs(64, 32, (c) => {
      c.imageSmoothingEnabled = true; c.drawImage(pal, 0, 0, 64, 32);
      px(c, 0, 24, '#1c2a36', 8, 8);  // (0,3) windows
      px(c, 16, 24, '#1a2440', 8, 8); // (2,3) light bar blue lens, off
      px(c, 24, 24, '#4a1414', 8, 8); // (3,3) light bar red lens, off
      px(c, 24, 16, '#1a1b1f', 8, 8); // (3,2) black livery panels
      px(c, 16, 16, '#101012', 8, 8); // (2,2) tyres / trim
    });
    palT.flipY = false; palT.needsUpdate = true;
    body.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) { m.map = palT; m.needsUpdate = true; } });
    const bb = new THREE.Box3().setFromObject(body);
    const SX = 1.85 / (bb.max.x - bb.min.x), SY = 1.45 / (bb.max.y - bb.min.y), SZ = 4.8 / (bb.max.z - bb.min.z);   // Kenney is chunky: real sedan proportions
    body.scale.set(SX, SY, SZ); body.position.set(-(bb.max.x + bb.min.x) / 2 * SX, -bb.min.y * SY, -(bb.max.z + bb.min.z) / 2 * SZ); car.add(body);
    const W = 1.85 / 2;
    const wht = L.lam(null, 0xd8dade), blk = L.lam(null, 0x141518), gls = L.basic(null, 0x1c2a36);
    // dark door opening on the driver side (+x, faces camera) + one POLICE on the rear door
    L.plane(1.0, 0.82, L.basic(null, 0x0a0c10), W + 0.015, 0.84, 0.62, car, Math.PI / 2);
    const doorT = L.cvs(64, 16, (c, w, h) => { px(c, 0, 0, '#dcdee2', w, h); c.font = 'bold 13px Arial, sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillStyle = '#121418'; c.fillText('POLICE', 32, 8.5, 60); });
    L.plane(1.05, 0.26, L.lam(doorT), W + 0.016, 0.62, -0.75, car, Math.PI / 2);
    // open driver door, hinged at its front edge (z 1.15)
    const hinge = new THREE.Group(); hinge.position.set(W, 0, 1.15); hinge.rotation.y = -0.8; car.add(hinge);
    L.box(0.07, 0.48, 1.0, wht, 0.03, 0.62, -0.5, hinge);
    L.box(0.05, 0.36, 0.9, gls, 0.03, 1.05, -0.48, hinge);
    L.box(0.08, 0.04, 1.0, blk, 0.03, 1.24, -0.5, hinge);
    const dome = new THREE.PointLight(0xffe6b0, 1.6, 2.5, 1.5); dome.position.set(0.2, 1.1, 0); car.add(dome);
  }

  // ---------------- zombies (copied from ep2 outside.js: Hzombie) ----------------
  const src = {
    city: [await L.loadModel('models/city-zombie.glb'), 'Walking', null, 1.8],
    thin: [await L.loadModel('models/thin-zombie.glb'), 'walk', 'tex/thin_zombie.png', 1.85],
  };
  const thinTex = await L.loadTex('tex/thin_zombie.png', 256); thinTex.flipY = false; thinTex.needsUpdate = true;
  const zTex = L.cvs(32, 64, (c) => {
    const r = L.rng(31);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const sx = x % 8 < 2, sy = y % 8 < 2, th = x % 8 === 5 || y % 8 === 5;
      let col = sx && sy ? [60, 10, 10] : sx || sy ? [110, 18, 16] : th ? [210, 110, 90] : [176, 38, 30];
      const n = r() * 16 - 8; px(c, x, y, rgb(col[0] + n, col[1] + n / 2, col[2] + n / 2));
    }
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 18 - 9 + (x % 16 === 0 ? -18 : 0); px(c, x, y, rgb(58 + n, 84 + n, 138 + n)); }
    for (let k = 0; k < 7; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), '#5a0a08', 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 3));
  });
  zTex.wrapS = THREE.RepeatWrapping; zTex.wrapT = THREE.ClampToEdgeWrapping;
  const skinT = L.rep(L.cvs(32, 32, (c) => {
    const r = L.rng(33);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 20 - 10; px(c, x, y, rgb(138 + n, 150 + n, 152 + n)); }
    for (let k = 0; k < 14; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), r() < 0.5 ? '#6a7064' : '#7a1210', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3));
  }), 1, 1);
  src.city[0].scene.traverse((o) => {
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; }
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  function Hzombie(kind, h, tint) {
    const [g, clipName, tex] = src[kind];
    const root = L.ps1Clone(g.scene);
    if (kind === 'city') root.traverse((o) => { if (!o.isMesh) return; const n = o.material.name || ''; o.material = n.includes('Outfit') ? L.lam(zTex) : n.includes('Body') ? L.lam(skinT) : L.lam(null, 0x8a2a20); o.material.side = THREE.DoubleSide; });
    root.traverse((o) => { if (!o.isMesh) return; for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { if (tex) m.map = thinTex; m.color.multiply(new THREE.Color(tint)); m.needsUpdate = true; } });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), clip = THREE.AnimationClip.findByName(g.animations, clipName), act = mixer.clipAction(clip); act.play();
    let hip = null; root.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; });
    const hip0 = hip.position.clone();
    scene.add(wrap);
    return { wrap, dur: clip.duration, set(t) { act.time = ((t % clip.duration) + clip.duration) % clip.duration; mixer.update(0); hip.position.x = hip0.x; hip.position.z = hip0.z; } };
  }
  // [kind, x at lt=0, z, dir (+1 = walks to +x), speed m/s, height, tint, phase]
  const Z = [
    ['city', -0.75, 2.3, 1, 0.45, 1.8, 0xffffff, 0.1],
    ['thin', 1.9, -1.4, -1, 0.4, 1.86, 0xe8ecf0, 0.5],
    ['city', 3.0, -4.9, -1, 0.36, 1.76, 0xa8c0e0, 0.75],
  ].map(([kind, x, z, dir, sp, h, tint, ph]) => ({ z: Hzombie(kind, h, tint), x, zz: z, dir, sp, ph }));

  // ---------------- camera ----------------
  const cam = new THREE.PerspectiveCamera(58, LW / LH, 0.05, 80);
  const C0 = V(0.35, 0.75, 7.6), C1 = V(0.35, 0.82, 6.3), TGT = V(0.0, 3.6, -8);

  // ---------------- rain + lightning (fx canvas: composited into the render, opaque pixels only) ----------------
  const RAIN = 260;
  const drops = []; { const r = L.rng(400); for (let i = 0; i < RAIN; i++) drops.push({ x: r() * (LW + 80) - 40, y: r() * LH, sp: 520 + r() * 260, len: 6 + (r() * 9 | 0), col: r() < 0.3 ? '#a4b4c8' : r() < 0.7 ? '#7a8aa0' : '#5c6a80' }); }
  const splash = []; { const r = L.rng(401); for (let i = 0; i < 40; i++) splash.push({ x: r() * LW | 0, y: 470 + r() * 170 | 0, ph: r() }); }
  const bolt = []; { const r = L.rng(402); let x = 296, y = 0; bolt.push([x, y]); while (y < 210) { x += r() * 18 - 10; y += 8 + r() * 14; bolt.push([x | 0, y | 0]); } }
  function fxDraw(c, t) {
    c.clearRect(0, 0, LW, LH);
    const fk = flashK(t);
    if (fk > 0.6) {   // bolt in the sky (right, away from the title)
      c.strokeStyle = '#eef4ff'; c.lineWidth = 2; c.beginPath(); bolt.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      c.lineWidth = 1; c.beginPath(); c.moveTo(bolt[4][0], bolt[4][1]); c.lineTo(bolt[4][0] + 16, bolt[4][1] + 22); c.lineTo(bolt[4][0] + 12, bolt[4][1] + 40); c.stroke();
    }
    for (const d of drops) {   // slanted streaks, slight wind to the left
      const y = ((d.y + t * d.sp) % (LH + 40)) - 20, x = d.x - (y + 20) * 0.12;
      c.strokeStyle = fk > 0.3 ? '#dfe8f4' : d.col; c.lineWidth = 1;
      c.beginPath(); c.moveTo(Math.round(x), Math.round(y)); c.lineTo(Math.round(x - d.len * 0.12), Math.round(y + d.len)); c.stroke();
    }
    for (const s of splash) { const k = (t * 3 + s.ph) % 1; if (k < 0.25) { c.fillStyle = '#9aaabe'; c.fillRect(s.x - 1, s.y, 1, 1); c.fillRect(s.x + 1, s.y, 1, 1); c.fillRect(s.x, s.y - 1, 1, 1); } }
  }

  out['01_ext'] = {
    scene, camera: cam,
    update(lt, t) {
      const k = L.smooth(lt / 2.55);
      cam.position.lerpVectors(C0, C1, k); cam.lookAt(TGT); cam.updateMatrixWorld();
      for (const z of Z) {
        const d = lt * z.sp;
        z.z.wrap.position.set(z.x + z.dir * d, z.zz < -4.4 ? 0.14 : 0, z.zz);   // on the sidewalk
        z.z.wrap.rotation.y = z.dir * (Math.PI / 2 - 0.45);   // 3/4 to camera while crossing
        z.z.set(z.ph * z.z.dur + lt * z.sp * 1.9);
      }
      const fk = flashK(t);
      hemi.intensity = 1.6 + 5 * fk; moon.intensity = 0.9 + 4 * fk;
      sky.material.color.setScalar(1 + 1.6 * fk);
      // right lamp flickers (deterministic)
      const fl = (Math.floor(lt * 15) % 11 === 3 || Math.floor(lt * 15) % 17 === 9) ? 0.25 : 1;
      const lp = lamps[1]; lp.pl.intensity = 22 * fl; lp.halo.visible = fl > 0.5; lp.rf.visible = fl > 0.5; lp.bulb.material.color.setScalar(fl > 0.5 ? 1 : 0.35);
    },
    fx: { draw(c, t) { fxDraw(c, t); } },
    overlay(lt, dt, a, o) {
      const c = o.tctx;
      const g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.3, LW / 2, LH * 0.45, LH * 0.68);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.4)'); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
      const fk = flashK(lt); if (fk > 0) { c.fillStyle = `rgba(220,230,255,${0.22 * fk})`; c.fillRect(0, 0, LW, LH); }
      // typewriter (Courier, one letter per key) — centred, under the HUD band
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const type = (s, t0, y, font, col) => {
        const n = Math.max(0, Math.min(s.length, Math.floor((lt - t0) * KEY_RATE + 1e-6) + 1)); if (lt < t0) return;
        c.font = font; c.fillStyle = 'rgba(0,0,0,0.85)'; c.fillText(s.slice(0, n).padEnd(s.length, ' '), LW / 2 + 2, y + 2);
        c.fillStyle = col; c.fillText(s.slice(0, n).padEnd(s.length, ' '), LW / 2, y);
      };
      type(LINES[0][0], LINES[0][1], 132, 'bold 34px "Courier New", monospace', '#f2eee4');
      type(LINES[1][0], LINES[1][1], 166, 'bold 25px "Courier New", monospace', '#eab866');
    },
  };
  return out;
}
