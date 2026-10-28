// =====================================================================
//  SET room — the Silent Room of the Future Library: s07–s17, s24, s35.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed rom.
//  One world, built once: a small oval room (rx 16, rz 12 around the origin, floor y 0, ceiling y 17) lined all round
//  with thin vertical wood strips; a doorway on the left wall (theta -72 deg) with the warm corridor behind it; the back
//  wall holds a 5 x 4 grid of glass-fronted drawers, each with a sealed manuscript (twine + red wax seal), a brass
//  combination bar locked on 2114 and a brass plate under it. The hero drawer (col 2, row 2) holds SCRIBBLER MOON; the
//  drawer at its right (col 3, row 2) is empty until s24, when a new manuscript slides in and its dials roll to 2114.
//  People are c3Person billboards at ROM_K x; a standing person's root sits at ROM_FOOT.
// =====================================================================
const ROM = {};
const ROM_K = 1.35, ROM_FOOT = 2.55 * ROM_K;
const ROM_RX = 16, ROM_RZ = 12, ROM_TOP = 17;
const romW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
// the first time word w is spoken after t0 (common words repeat: 'in', 'So', 'read', 'I')
const romWA = (w, t0, fb) => { const x = WORDS.find((q) => q.s >= t0 && q.w.replace(/[^\w]/g, '').toLowerCase() === w.toLowerCase()); return x ? x.s : fb; };
const romV = (x, y, z) => new THREE.Vector3(x, y, z);
const romSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// a point on the oval wall at angle th (0 = back wall, + to the right), scaled toward the centre by f; and its inward yaw
const romWallP = (th, f = 1, y = 0) => romV(ROM_RX * f * Math.sin(th), y, -ROM_RZ * f * Math.cos(th));
const romYaw = (th) => Math.atan2(-Math.sin(th) / ROM_RX, Math.cos(th) / ROM_RZ);
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function romCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = romSpan(id), dur = b - a;
  const P = romV(...c.p), L = romV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(romV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const romRack = (lt, id, a, b) => { const [t0, t1] = romSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function romFg(s, list, K, id, lt, o = {}) {
  const c = ROM.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  c3SetCam(c, romCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = romV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(romV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const romRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2a170c', bgBlur: 2.0, nearBlur: 10, glow: 0.75, glowBlur: 16, bloom: 0.26 }, o));

// ---- the archive: the drawers that hold a manuscript (title, author), by [col, row]; the rest are still empty
const ROM_BOOKS = { '1,1': ['FROM ME FLOWS WHAT YOU CALL TIME', 'DAVID MITCHELL'], '2,1': ['AS MY BROW BRUSHES ON THE TAPESTRY OF TIME', 'SJÓN'],
  '3,1': ['THE LAST TABOO', 'ELIF SHAFAK'], '1,2': ['DEAR SON, MY BELOVED', 'HAN KANG'], '2,2': ['SCRIBBLER MOON', 'MARGARET ATWOOD'],
  '4,1': ['BLIND BOOK', 'KARL OVE KNAUSGÅRD'] };
const ROM_NEW = '3,2', ROM_HERO = '2,2';
const ROM_COLS = [-2, -1, 0, 1, 2].map((k) => k * 0.206), ROM_ROWS = [3.9, 6.6, 9.3, 12.0];

// ---- textures
function romTexStrip(k) {   // one thin wood strip: warm grain, a lit edge
  return tex((x, w, h) => { const R = RNG('strip', k), base = [['#a27a50', '#87623e'], ['#b08a5c', '#957046'], ['#8c6a46', '#745636']][k];
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, base[1]); g.addColorStop(0.5, base[0]); g.addColorStop(1, base[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(70,32,10,0.28)'; for (let i = 0; i < 9; i++) { const xx = R.r(4, w - 4); x.lineWidth = R.r(1, 2.5); x.beginPath(); x.moveTo(xx, 0); x.bezierCurveTo(xx + R.n(6), h / 3, xx + R.n(6), h * 2 / 3, xx + R.n(4), h); x.stroke(); }
    x.fillStyle = 'rgba(255,230,190,0.25)'; x.fillRect(w * 0.08, 0, w * 0.1, h); }, 64, 512);
}
function romTexFloor() {   // warm herringbone parquet
  const t = tex((x, w, h) => { x.fillStyle = '#7a4622'; x.fillRect(0, 0, w, h); const R = RNG('floor'), n = 8, bw = w / n;
    for (let j = -1; j < n + 1; j++) for (let i = 0; i < n; i++) { const c = ['#a86a36', '#94592a', '#b87a42', '#8a5226'][(i * 3 + j * 5) % 4];
      x.save(); x.translate(i * bw + bw / 2, j * bw + (i % 2) * bw / 2); x.rotate(i % 2 ? Math.PI / 4 : -Math.PI / 4); x.fillStyle = c; x.fillRect(-bw * 0.62, -bw * 0.17, bw * 1.24, bw * 0.34);
      x.strokeStyle = 'rgba(50,22,6,0.5)'; x.lineWidth = 2; x.strokeRect(-bw * 0.62, -bw * 0.17, bw * 1.24, bw * 0.34); x.restore(); }
    x.fillStyle = 'rgba(255,220,170,0.06)'; for (let i = 0; i < 300; i++) x.fillRect(R.r(0, w), R.r(0, h), R.r(2, 8), 1); }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 4); return t;
}
function romTexCover(title, author) {   // the manuscript's cover: cream paper, typed title, author, a faint FUTURE LIBRARY stamp
  return tex((x, w, h) => { x.fillStyle = '#f4ead2'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(120,90,50,0.35)'; x.lineWidth = 6; x.strokeRect(14, 14, w - 28, h - 28);
    const words = title.split(' '), lines = []; let cur = '';
    for (const wd of words) { if ((cur + ' ' + wd).trim().length > 14) { lines.push(cur.trim()); cur = wd; } else cur += ' ' + wd; } lines.push(cur.trim());
    const fs = lines.length > 2 ? h * 0.065 : h * 0.085;
    lines.forEach((l, i) => inked(x, l, w / 2, h * 0.16 + i * fs * 1.15, fs, '#2a1a10', { stroke: false, maxW: w * 0.84, font: 'Georgia, serif', weight: 700 }));
    inked(x, author, w / 2, h * 0.86, h * 0.05, '#5a3a22', { stroke: false, maxW: w * 0.8, font: 'Georgia, serif', weight: 400 }); }, 384, 480);
}
function romTexPlate(l1, l2) {   // brass plate, engraved
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f0cf78'); g.addColorStop(0.5, '#c8963c'); g.addColorStop(1, '#a87628'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(80,50,10,0.6)'; x.lineWidth = 5; x.strokeRect(6, 6, w - 12, h - 12);
    inked(x, l1, w / 2, h * (l2 ? 0.38 : 0.52), h * (l2 ? 0.27 : 0.36), '#3a240a', { stroke: false, maxW: w * 0.88, font: 'Georgia, serif', weight: 700 });
    if (l2) inked(x, l2, w / 2, h * 0.74, h * 0.2, '#4a3010', { stroke: false, maxW: w * 0.8, font: 'Georgia, serif', weight: 400 }); }, 512, 96);
}
function romTexStone(l1, l2) {   // a cartoon tombstone front: grey stone, carved lettering
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#c8ccd4'); g.addColorStop(1, '#8e94a0'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('stone', l2); x.fillStyle = 'rgba(60,64,74,0.25)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(2, 7), 0, TAU); x.fill(); }
    inked(x, 'R.I.P.', w / 2, h * 0.24, h * 0.17, '#4a4e58', { stroke: '#e8ecf2', sw: 4, maxW: w * 0.8, font: 'Georgia, serif' });
    inked(x, l1, w / 2, h * 0.52, h * 0.15, '#3a3e48', { stroke: '#e8ecf2', sw: 4, maxW: w * 0.82, font: 'Georgia, serif' });
    inked(x, l2, w / 2, h * 0.74, h * 0.085, '#4a4e58', { stroke: false, maxW: w * 0.8, font: 'Georgia, serif', weight: 700 }); }, 256, 320);
}
// rolling digits in little windows (odometer): v is a continuous number; the low digit rolls, the others carry
function romOdoDraw(x, w, h, v, n, o = {}) {
  x.fillStyle = o.bg ?? '#1a120a'; x.fillRect(0, 0, w, h);
  const cw = w / n;
  for (let i = 0; i < n; i++) {
    let base, roll;
    if (Array.isArray(v)) { base = Math.floor(v[i]); roll = v[i] - base; }   // each wheel at its own position
    else { const p = n - 1 - i, P = 10 ** p, d = v / P, low = v - Math.floor(v / P) * P; base = Math.floor(d); roll = p === 0 ? d - base : clamp(low - (P - 1)); }
    const cx = i * cw + cw / 2;
    x.save(); x.beginPath(); x.rect(i * cw + cw * 0.08, h * 0.08, cw * 0.84, h * 0.84); x.clip();
    x.fillStyle = o.win ?? '#f6f0e2'; x.fillRect(i * cw + cw * 0.08, h * 0.08, cw * 0.84, h * 0.84);
    for (const [dig, dy] of [[mod(base, 10), -roll], [mod(base + 1, 10), 1 - roll]])
      inked(x, String(dig), cx, h / 2 - dy * h * 0.86, h * 0.62, o.ink ?? '#1a120a', { stroke: false, font: '"Courier New", monospace', weight: 700 });
    x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(i * cw + cw * 0.08, h * 0.08, cw * 0.84, h * 0.12); x.fillRect(i * cw + cw * 0.08, h * 0.8, cw * 0.84, h * 0.12);
    x.restore(); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(i * cw + cw * 0.46, h * 0.49, cw * 0.08, h * 0.02);
  }
}
const romOdoTex = (n, w, h) => { const cv = Object.assign(document.createElement('canvas'), { width: w, height: h }), t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return { cv, t, n, last: null }; };
function romOdo(o, v, st) { const key = Array.isArray(v) ? v.map((q) => q.toFixed(3)).join(',') : v; if (o.last === key) return; o.last = key; romOdoDraw(o.cv.getContext('2d'), o.cv.width, o.cv.height, v, o.n, st); o.t.needsUpdate = true; }

// ---- a drawer in the wall (local: +z = out of the wall, front face at z +0.62, centre y 0): a walnut frame around a dark
// cavity with a warm light strip at its top; the drawer box (glass front over a brass combination bar, glass sides) slides
// out along +z; the manuscript stands inside, leaning back, tied with twine and a red wax seal
function romManuscript(title, author) {
  const g = new THREE.Group(), paper = c3Prop('#efe2c4', { rough: 0.85 });
  g.add(rb(1.32, 1.62, 0.2, paper, 0, 0, 0, 0.025));
  const cov = pl(1.24, 1.54, c3Prop('#ffffff', { map: romTexCover(title, author), rough: 0.85 }), 0, 0, 0.105); g.add(cov);
  const tw = c3Toon('#c8a46a');
  g.add(rb(1.36, 0.06, 0.24, tw, 0, -0.05, 0.005, 0.0));
  for (const sd of [-1, 1]) { const tail = rb(0.06, 0.42, 0.05, tw, sd * 0.1, -0.3, 0.11, 0.0); tail.rotation.z = sd * 0.35; g.add(tail); }   // two ribbon tails under the seal: title and author stay readable
  const seal = new THREE.Group(); seal.position.set(0, -0.05, 0.14); g.add(seal); g.seal = seal;
  const sm = c3Prop('#b8141e', { rough: 0.25, env: 1.4 });
  const blob = c3Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.08, 20), sm, 0.02); blob.rotation.x = Math.PI / 2; seal.add(blob);
  const rim = c3Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 20), sm, 0); rim.position.z = 0.045; seal.add(rim);
  const em = c3Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6), c3Prop('#d8303a', { rough: 0.3 }), 0); em.rotation.x = Math.PI / 2; em.position.z = 0.05; seal.add(em);
  return g;
}
function romDrawer(s, key, book) {
  const g = new THREE.Group(), walnut = s.M.walnut, D = {};
  // frame (2.9 x 2.3, depth 1.3) around the cavity
  g.add(rb(2.9, 0.22, 1.3, walnut, 0, 1.04, 0, 0.03)); g.add(rb(2.9, 0.22, 1.3, walnut, 0, -1.04, 0, 0.03));
  g.add(rb(0.22, 2.3, 1.3, walnut, -1.34, 0, 0, 0.03)); g.add(rb(0.22, 2.3, 1.3, walnut, 1.34, 0, 0, 0.03));
  g.add(pl(2.5, 1.9, s.M.cavity, 0, 0, -0.62));
  D.lamp = rb(2.2, 0.06, 0.12, c3Flat('#fff0c8', { glow: '#ffcf80' }), 0, 0.88, 0.1, 0); g.add(D.lamp);
  // the sliding box
  const box = new THREE.Group(); g.add(box); D.box = box;
  const glass = pl(2.42, 1.5, s.M.glass, 0, 0.18, 0.6); glass.renderOrder = 8; box.add(glass);
  for (const sd of [-1, 1]) { const side = pl(1.2, 1.5, s.M.glass, sd * 1.21, 0.18, 0, sd * Math.PI / 2); side.renderOrder = 8; box.add(side); }
  box.add(rb(2.46, 0.08, 1.2, s.M.brass, 0, 0.95, 0, 0.0));   // top rail
  const bar = rb(2.46, 0.38, 0.14, s.M.brass, 0, -0.76, 0.56, 0.02); box.add(bar);
  D.odo = romOdoTex(4, 512, 160);
  D.odoP = pl(0.92, 0.29, c3Flat('#ffffff', { map: D.odo.t }), 0.6, -0.76, 0.64); box.add(D.odoP);
  const knob = c3Mesh(new THREE.SphereGeometry(0.12, 14, 10), s.M.brass, 0.015); knob.position.set(-0.7, -0.76, 0.7); box.add(knob);
  D.led = c3Mesh(new THREE.SphereGeometry(0.06, 10, 8), c3Flat('#3a0c0c'), 0); D.led.position.set(-0.25, -0.76, 0.66); box.add(D.led);
  box.add(rb(2.46, 0.06, 1.2, s.M.walnutDark, 0, -0.55, 0, 0.0));   // the tray
  if (book) { D.ms = romManuscript(...book); D.ms.position.set(0, 0.2, -0.1); D.ms.rotation.x = -0.1; box.add(D.ms); }
  // plate under the frame
  const [l1, l2] = book ? [book[0], book[1]] : ['—', ''];
  D.plate = pl(2.3, 0.34, c3Prop('#ffffff', { map: romTexPlate(l1, l2), rough: 0.3, metal: 0.6, env: 1.3 }), 0, -1.37, 0.66); g.add(D.plate);
  D.g = g; D.key = key; D.book = book;
  return D;
}

// ---- the world
function romBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 400), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffe2c0', ambI: 0.5, sky: '#ffd8a8', ground: '#4a2412', key: '#ffe6c4', keyI: 0.95, keyP: [6, 16, 14], rim: '#ffb070', rimI: 0.5, rimP: [-10, 12, -8] });
  s.lit = scene.children.filter((c) => c.isLight); s.lit0 = s.lit.map((l) => l.intensity);
  s.M = { walnut: c3Prop('#5a321a', { rough: 0.45, env: 0.8 }), walnutDark: c3Toon('#3a1e0e'), cavity: c3Flat('#1e1008'),
    brass: c3Prop('#d8a848', { rough: 0.25, metal: 0.85, env: 1.5 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#dff0ff', roughness: 0.04, transparent: true, opacity: 0.16, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }) };
  // the oval wall: thin vertical wood strips with dark gaps (a dark oval backing behind them); the doorway gap at -72 deg
  const backing = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, ROM_TOP, 72, 1, true), c3Flat('#2a1408', { side: THREE.BackSide }));
  backing.scale.set(ROM_RX + 0.5, 1, ROM_RZ + 0.5); backing.position.y = ROM_TOP / 2; scene.add(backing);
  const stripM = [0, 1, 2].map((k) => c3Prop('#ffffff', { map: romTexStrip(k), rough: 0.55 }));
  const sg = new THREE.BoxGeometry(0.3, ROM_TOP, 0.3);   // thin slats: the dark backing shows between them
  s.door = { th: -72 * DEG, half: 7.2 * DEG };
  for (let i = 0; i < 180; i++) { const th = -Math.PI + i * TAU / 180;
    if (Math.abs(th - s.door.th) < s.door.half) continue;
    const m = new THREE.Mesh(sg, stripM[(i * 7) % 3]); m.position.copy(romWallP(th, 1.0, ROM_TOP / 2)); m.rotation.y = romYaw(th); scene.add(m); }
  // floor, a round rug, the ceiling with a glowing oval cove
  const fl = new THREE.Mesh(new THREE.CircleGeometry(1, 72), c3Prop('#ffffff', { map: romTexFloor(), rough: 0.4, metal: 0.05, env: 0.6 })); fl.scale.set(ROM_RX + 0.6, ROM_RZ + 0.6, 1); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1, 60), c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#8a2a22'; x.fillRect(0, 0, w, h);
    for (const [r, c] of [[0.48, '#c89a4a'], [0.44, '#8a2a22'], [0.3, '#a8463a'], [0.27, '#c89a4a'], [0.25, '#8a2a22']]) { x.beginPath(); x.arc(w / 2, h / 2, r * w, 0, TAU); x.fillStyle = c; x.fill(); } }, 512, 512), rough: 0.95 }));
  rug.scale.set(7.5, 5.5, 1); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, 1.5); scene.add(rug);
  const ceil = new THREE.Mesh(new THREE.CircleGeometry(1, 72), c3Toon('#4a2612')); ceil.scale.set(ROM_RX + 0.6, ROM_RZ + 0.6, 1); ceil.rotation.x = Math.PI / 2; ceil.position.y = ROM_TOP; scene.add(ceil);
  s.cove = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 90), c3Flat('#fff0c8', { glow: '#ffcf80' })); s.cove.scale.set(ROM_RX - 2.2, ROM_RZ - 2.2, 1); s.cove.rotation.x = Math.PI / 2; s.cove.position.y = ROM_TOP - 0.3; scene.add(s.cove);
  // the doorway: a walnut frame in the gap, the bright warm corridor behind it
  const dp0 = romWallP(s.door.th - s.door.half, 1), dp1 = romWallP(s.door.th + s.door.half, 1), dmid = dp0.clone().add(dp1).multiplyScalar(0.5), dyaw = romYaw(s.door.th), dw = dp0.distanceTo(dp1);
  s.doorG = new THREE.Group(); s.doorG.position.copy(dmid); s.doorG.rotation.y = dyaw; scene.add(s.doorG);
  s.doorG.add(rb(0.6, 13, 1.0, s.M.walnut, -dw / 2, 6.5, 0, 0.04)); s.doorG.add(rb(0.6, 13, 1.0, s.M.walnut, dw / 2, 6.5, 0, 0.04)); s.doorG.add(rb(dw + 1.2, 0.8, 1.0, s.M.walnut, 0, 13.2, 0, 0.04));
  s.doorG.add(rb(dw + 1.2, 4.2, 1.0, s.M.walnut, 0, 15.6, 0, 0.04));
  s.corr = pl(dw + 1, 13, c3Flat('#ffe6b8', { glow: '#ffd890' }), 0, 6.5, -3.2); s.doorG.add(s.corr);
  s.doorG.add(pl(dw + 1, 3, c3Prop('#a86a36', { rough: 0.5 }), 0, 0.01, -1.6, 0, -Math.PI / 2));   // the corridor floor
  // the drawer grid on the back wall
  s.drawers = {};
  ROM_COLS.forEach((th, ci) => ROM_ROWS.forEach((y, ri) => { const key = `${ci},${ri}`, D = romDrawer(s, key, key === ROM_NEW ? null : ROM_BOOKS[key]);
    D.g.position.copy(romWallP(th, 0.948, y)); D.g.rotation.y = romYaw(th); scene.add(D.g); s.drawers[key] = D;
    romOdo(D.odo, D.book ? 2114 : 0, {}); c3Layer(D.g, C3.L_FOCUS); }));
  s.hero = s.drawers[ROM_HERO]; s.newD = s.drawers[ROM_NEW];
  s.newMs = romManuscript('UNTITLED — SEALED', 'THIS YEAR’S WRITER'); s.newMs.position.set(0, 0.2, -0.1); s.newMs.rotation.x = -0.1; s.newD.box.add(s.newMs); c3Layer(s.newMs, C3.L_FOCUS);
  // a glint that sweeps across a drawer's glass (s09)
  s.glint = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.2), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 64), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  s.glint.renderOrder = 9; s.glint.rotation.z = 0.5; s.hero.box.add(s.glint); s.glint.position.set(-2, 0.18, 0.63); c3Layer(s.glint, C3.L_FOCUS);
  // breath fog on the hero glass (s11)
  s.fog = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,0.75)'); g.addColorStop(0.6, 'rgba(240,248,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 128, 128), transparent: true, depthWrite: false, toneMapped: false }));
  s.fog.renderOrder = 9; s.hero.box.add(s.fog); c3Layer(s.fog, C3.L_FOCUS);
  // the year board on a brass stand (s14): a split-flap-style counter that rolls 2026 -> 2114
  s.board = new THREE.Group(); scene.add(s.board);
  s.board.add(cyl(0.18, 0.18, 6.4, s.M.brass, 0, 3.2, 0, 0.02, 12)); s.board.add(cyl(1.0, 1.2, 0.3, s.M.brass, 0, 0.15, 0, 0.03, 24));
  s.board.add(rb(4.4, 2.2, 0.4, c3Prop('#2a1a10', { rough: 0.4 }), 0, 7.4, 0, 0.04));
  s.yearOdo = romOdoTex(4, 1024, 360); s.board.add(pl(4.0, 1.4, c3Flat('#ffffff', { map: s.yearOdo.t }), 0, 7.2, 0.21));
  s.board.add(pl(4.0, 0.42, c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#2a1a10'; x.fillRect(0, 0, w, h); inked(x, 'OPENS IN THE YEAR', w / 2, h / 2, h * 0.62, '#f0cf78', { stroke: false, maxW: w * 0.9, font: 'Georgia, serif', weight: 700 }); }, 512, 64) }), 0, 8.17, 0.21));
  // tombstones (s16, s17): rounded-top grey stones with carved text; they pop out of the floor with a dirt puff
  const stone = (l1, l2) => { const g = new THREE.Group(), sm = c3Prop('#b4b8c2', { rough: 0.85 });
    g.add(rb(2.4, 2.4, 0.7, sm, 0, 1.2, 0, 0.05)); const top = c3Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.7, 32), sm, 0.05); top.rotation.x = Math.PI / 2; top.position.y = 2.4; g.add(top);   // its lower half sits inside the block
    g.add(pl(2.0, 2.5, c3Prop('#ffffff', { map: romTexStone(l1, l2), rough: 0.85 }), 0, 1.75, 0.36)); g.add(rb(3.0, 0.3, 1.2, c3Toon('#6a4a2a'), 0, 0.15, 0, 0.03)); return g; };
  s.stoneYou = stone('YOU', 'NEVER READ IT'); s.stoneGuard = stone('THE GUARD', 'NEITHER DID HE'); scene.add(s.stoneYou); scene.add(s.stoneGuard);
  s.puff = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 8, 6), c3Toon('#8a6a48'), 24); s.puff.frustumCulled = false; scene.add(s.puff);
  // the thought bubble with the chalk sum (s15): a cloud on a canvas, the sum written in
  s.bubCv = Object.assign(document.createElement('canvas'), { width: 1024, height: 640 }); s.bubTex = new THREE.CanvasTexture(s.bubCv); s.bubTex.encoding = THREE.sRGBEncoding;
  s.bubble = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.25), new THREE.MeshBasicMaterial({ map: s.bubTex, transparent: true, depthWrite: false, toneMapped: false })); s.bubble.renderOrder = 9; scene.add(s.bubble);
  // ---- people (FOCUS)
  s.you = c3Person({ key: 'you', outfit: 'teal', hairStyle: 'ref' }); s.you.g.scale.setScalar(ROM_K); scene.add(s.you.g);
  s.guard = c3Person({ key: 'guard', outfit: 'navy', hairStyle: 'bald', fx: ['mustache'] }); s.guard.g.scale.setScalar(ROM_K); scene.add(s.guard.g);
  // the guard's peaked cap: a drawn sprite glued over the top of his head (in front of the hair layer)
  { const D = 0.915 * s.guard.HS, capT = c3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.lineJoin = 'round'; x.lineWidth = 14; x.strokeStyle = '#1a1210';
      x.fillStyle = '#1e2a52'; x.beginPath(); x.moveTo(w * 0.12, h * 0.72); x.quadraticCurveTo(w * 0.1, h * 0.12, w * 0.5, h * 0.1); x.quadraticCurveTo(w * 0.9, h * 0.12, w * 0.88, h * 0.72); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#2e3c6e'; x.beginPath(); x.ellipse(w * 0.4, h * 0.3, w * 0.18, h * 0.08, -0.3, 0, TAU); x.fill();
      x.fillStyle = '#121a36'; x.beginPath(); x.moveTo(w * 0.06, h * 0.7); x.quadraticCurveTo(w * 0.5, h * 0.98, w * 0.94, h * 0.7); x.quadraticCurveTo(w * 0.5, h * 0.82, w * 0.06, h * 0.7); x.fill(); x.stroke();
      x.fillStyle = '#e8b840'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 26 : 56, a = i / 10 * TAU - Math.PI / 2; x.lineTo(w * 0.5 + Math.cos(a) * r, h * 0.44 + Math.sin(a) * r); } x.closePath(); x.fill(); x.lineWidth = 8; x.stroke(); }, 512, 360);
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(D * 1.08, D * 1.08 * 360 / 512), new THREE.MeshBasicMaterial({ map: capT, transparent: true, alphaTest: 0.08, toneMapped: false }));
    cap.position.set(0, D * 0.44, 0.036); cap.renderOrder = 5; s.guard.headG.add(cap); }
  // little ink fingers that pop up out of your fists while you count (s15): rounded strokes in the limb ink
  const fM = new THREE.MeshBasicMaterial({ color: C3.ink, toneMapped: false, side: THREE.DoubleSide });
  s.fingers = [...Array(6)].map(() => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 4, 8), fM); m.renderOrder = 6; m.visible = false; s.you.root.add(m); return m; });
  [s.you.g, s.guard.g, s.board, s.stoneYou, s.stoneGuard, s.puff, s.bubble].forEach((o) => c3Layer(o, C3.L_FOCUS));
  // ---- blurred foreground pieces (NEAR layer), placed per shot by romFg
  s.fgBy = {
    post: (() => { const g = new THREE.Group(); g.add(cyl(0.22, 0.22, 9, s.M.brass, 0, -2, 0, 0.02, 16)); const b = c3Mesh(new THREE.SphereGeometry(0.42, 16, 12), s.M.brass, 0.02); b.position.y = 2.7; g.add(b);
      const rope = c3Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([romV(0, 2.4, 0), romV(2.5, 1.2, 0), romV(5, 2.4, 0)]), 20, 0.17, 8, false), c3Toon('#a8142a'), 0.03); g.add(rope); return g; })(),
    lamp: (() => { const g = new THREE.Group(); const sh = c3Mesh(new THREE.ConeGeometry(1.6, 1.4, 24, 1, true), c3Prop('#d8a848', { rough: 0.3, metal: 0.7, side: THREE.DoubleSide }), 0.04); g.add(sh);
      const b = c3Mesh(new THREE.SphereGeometry(0.6, 14, 10), c3Flat('#fff4c8', { glow: '#ffd890' }), 0); b.position.y = -0.5; g.add(b); g.add(cyl(0.04, 0.04, 8, c3Toon('#2a1a10'), 0, 4.6, 0, 0, 6)); return g; })(),
    strip: (() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 30, 0.5), stripM[1]); return m; })(),
    glass: (() => { const g = new THREE.Group(); g.add(rb(4, 0.3, 0.4, s.M.brass, 0, 1.4, 0, 0.02)); const gl = pl(4, 2.8, s.M.glass, 0, 0, 0); gl.renderOrder = 8; g.add(gl); return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#ffd8a8', mid: '#7a4a2a', bot: '#2a1408', cards: [[0, 30, 10, 30, 6, '#fff0d0'], [-20, 10, 10, 8, 14, '#ffd890'], [20, 10, -10, 8, 14, '#ffe0c0']] });
  c3Shadows(scene, s.key, 24);
  return s;
}
const romGet = () => ROM.s ||= romBuild();
// the room lights: k 0..1 (0 = only the corridor light and a faint drawer glow); drawer lamps switch on along a sweep
function romLights(s, k, sweep = 1) {
  s.lit.forEach((l, i) => { l.intensity = s.lit0[i] * lerp(0.28, 1, k); });
  s.cove.visible = k > 0.35;
  for (const D of Object.values(s.drawers)) { const [ci, ri] = D.key.split(',').map(Number), order = (Math.abs(ci - 2) * 4 + (3 - ri)) / 12;
    D.lamp.visible = (D.book || (D === s.newD && s.newLit)) ? sweep >= order : false; }
}
// per-frame world: hides everything shot-specific, resets the moving parts
function romWorld(s, t) {
  [s.board, s.stoneYou, s.stoneGuard, s.puff, s.bubble, s.guard.g, s.glint, s.fog].forEach((o) => { o.visible = false; });
  s.fingers.forEach((f) => { f.visible = false; });
  s.you.g.visible = true; s.you.root.rotation.z = 0;
  for (const D of Object.values(s.drawers)) { D.box.position.z = 0; D.led.material.color.set('#3a0c0c'); }
  s.newMs.visible = false; s.newLit = false; romOdo(s.newD.odo, 0, {});
  romLights(s, 1, 1);
}
const ROM_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const romWalkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });
// a prop that pops out of the floor: scale with overshoot from t0, and a dirt puff around its base
function romPop(s, obj, t, t0, x, z, ry = 0, sc = 1.35) {
  obj.visible = t > t0; const k = EZ.back(clamp((t - t0) / 0.22));
  obj.position.set(x, 0, z); obj.rotation.y = ry; obj.scale.set(sc, sc * Math.max(1e-3, k), sc);
}
function romPuff(s, t, list) {   // list: [[t0, x, z], ...] — little dirt balls flying out and falling back
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(); let n = 0;
  for (const [t0, x, z] of list) { const dt = t - t0; if (dt < 0 || dt > 0.7) continue;
    for (let i = 0; i < 12; i++, n++) { const R = RNG('puff', i), a = i / 12 * TAU + R.n(0.2), v = R.r(2.5, 4.5);
      p.set(x + Math.cos(a) * v * dt * 0.9, Math.max(0.1, R.r(3, 6) * dt - 9 * dt * dt), z + Math.sin(a) * v * dt * 0.5);
      const s1 = (1 - dt / 0.7) * R.r(0.7, 1.3); sc.set(s1, s1, s1); m4.compose(p, q, sc); s.puff.setMatrixAt(n, m4); } }
  s.puff.count = n; s.puff.visible = n > 0; s.puff.instanceMatrix.needsUpdate = true;
}
// your fingers popping up out of your fists, counting (n per hand side)
function romFingers(s, nL, nR) {
  const p = s.you; let i = 0;
  for (const [side, n] of [['armL', nL], ['armR', nR]]) { const e = p.limbs[side].e.position;
    for (let k = 0; k < n && i < s.fingers.length; k++, i++) { const f = s.fingers[i], a = (k - (n - 1) / 2) * 0.38;
      f.visible = true; f.position.set(e.x + Math.sin(a) * 0.36, e.y + Math.cos(a) * 0.36, e.z + 0.003); f.rotation.set(0, 0, -a); } }
}
// the chalk sum in the thought bubble: k 0..1 writes it in
function romBubbleDraw(s, k) {
  const x = s.bubCv.getContext('2d'), w = s.bubCv.width, h = s.bubCv.height; x.clearRect(0, 0, w, h);
  x.lineWidth = 12; x.strokeStyle = '#1a1210'; x.fillStyle = '#fffaf0';
  const puffs = [[0.5, 0.42, 0.3], [0.28, 0.46, 0.2], [0.72, 0.46, 0.2], [0.38, 0.28, 0.18], [0.62, 0.27, 0.19], [0.5, 0.6, 0.2], [0.3, 0.62, 0.14], [0.7, 0.62, 0.15]];
  for (const pass of [0, 1]) for (const [u, v, r] of puffs) { x.beginPath(); x.arc(u * w, v * h, r * w * 0.5, 0, TAU); pass ? x.fill() : x.stroke(); }
  for (const [u, v, r] of [[0.2, 0.86, 0.035], [0.12, 0.95, 0.022]]) { x.beginPath(); x.arc(u * w, v * h, r * w, 0, TAU); x.fill(); x.stroke(); }
  const txt = '2114 − 2026 = 88', n = Math.floor(txt.length * clamp(k * 1.3));
  inked(x, txt.slice(0, n), w * 0.5, h * 0.4, h * 0.13, '#1a1210', { stroke: false, maxW: w * 0.62, font: '"Comic Sans MS", "Segoe Print", sans-serif', weight: 700 });
  if (k > 0.8) inked(x, 'YEARS!?', w * 0.5, h * 0.58, h * 0.12 * EZ.back(clamp((k - 0.8) * 5)), '#c8281e', { stroke: false, maxW: w * 0.5, font: '"Comic Sans MS", "Segoe Print", sans-serif', weight: 700 });
  s.bubTex.needsUpdate = true;
}
const romFace = (o, cam) => { o.quaternion.copy(cam.quaternion); };

// =====================================================================
//  s07 — "You walk into a tiny wooden room,": the room is dim, the warm corridor glows in the doorway on the left;
//  you walk in through it, the camera inside panning with you
// =====================================================================
const ROM_K07 = [[0, [1.6, 8.6, 7.4], [-13.4, 7.0, -3.6], 46], [1.9, [0.4, 8.2, 7.0], [-8.6, 7.4, -1.4], 46]];
SHOT_FN['s07'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t); romLights(s, 0, 0);
  c3SetCam(s.cam, romCam(ROM_K07, lt, 's07', { orbit: 0.02 }));
  // from just outside the doorway to a step inside the room
  const P0 = romWallP(s.door.th, 1.12), P1 = romV(-7.6, 0, -0.6), k = EZ.io(clamp((t - 10.15) / 1.95)), P = P0.clone().lerp(P1, k);
  s.you.g.position.set(P.x, ROM_FOOT, P.z);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [romW('tiny', 1, 11.1), 'surprised']], t, 'you'), gaze: [0.7, 0.2], head: [-0.05, 0, 0],
    hand: { armL: [1.2 + 0.25 * Math.sin(t * 7.5), -0.3], armR: [-1.2 - 0.25 * Math.sin(t * 7.5), -0.3] }, ...romWalkFeet(t * 7.5 * (1 - k * 0.6)) });
  romFg(s, [['strip', [3.6, 0, -6], 1.6], ['lamp', [-1.6, 5.2, -9], 0.8]], ROM_K07, 's07', lt, { orbit: 0.02 });
  romRender(s, { bgBlur: romRack(lt, 's07', 2.6, 1.6), bloom: 0.34 });
};

// =====================================================================
//  s08 — "and there they are.": the lights come up, the drawer lamps switch on in a sweep from the centre out
// =====================================================================
const ROM_K08 = [[0, [3.4, 7.2, 7.6], [0.2, 8.6, -11], 44], [0.9, [2.4, 7.8, 5.6], [0.0, 8.8, -11], 44]];
SHOT_FN['s08'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const there = romW('there', 1, 12.3), up = EZ.o2(clamp((t - (there - 0.15)) / 0.4));
  romLights(s, up, clamp((t - (there - 0.1)) / 0.45));
  c3SetCam(s.cam, romCam(ROM_K08, lt, 's08', { orbit: -0.03 }));
  s.you.g.visible = false;   // the drawers' moment: you stay just out of the frame
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'surprised'], [there, 'starstruck']], t, 'you'), gaze: [0.8, 0.3], head: [-0.08, 0, 0.04],
    hand: { armL: [1.3, 0.9], armR: [-1.3, 0.9] }, lift: (q) => 0.12 * EZ.back(seg(q, there - 0.03, there + 0.08)) * Math.exp(-Math.max(0, q - there - 0.08) * 5), x: t > there ? ['sparkle'] : [], ...ROM_STAND });
  romFg(s, [['post', [-3.2, -4.0, -8], 1.2]], ROM_K08, 's08', lt, { orbit: -0.03 });
  romRender(s, { bgBlur: romRack(lt, 's08', 1.2, 0.8), bloom: 0.3 });
};

// =====================================================================
//  s09 — "Sealed manuscripts in glass drawers,": close on the hero drawer: the wax seal glints on "Sealed", a light
//  streak sweeps across the glass on "glass"
// =====================================================================
const ROM_K09 = [[0, [1.6, 9.6, -6.0], [0.0, 9.4, -11.4], 38], [2.1, [0.5, 9.4, -7.3], [0.0, 9.45, -11.4], 38]];
SHOT_FN['s09'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const sealed = romW('Sealed', 1, 13.0), glass = romW('glass', 1, 14.2);
  c3SetCam(s.cam, romCam(ROM_K09, lt, 's09', { orbit: 0.02, creep: 0.03 }));
  const sp = clamp((t - (sealed + 0.05)) / 0.35); s.hero.ms.seal.scale.setScalar(1 + 0.18 * Math.sin(Math.PI * sp));
  const gk = clamp((t - (glass - 0.05)) / 0.45); s.glint.visible = gk > 0 && gk < 1; s.glint.position.x = lerp(-1.6, 1.6, EZ.io(gk));
  romFg(s, [['lamp', [-2.0, 3.0, -7], 0.8]], ROM_K09, 's09', lt, { orbit: 0.02, creep: 0.03 });
  romRender(s, { bgBlur: romRack(lt, 's09', 2.4, 3.2), glow: 0.8, bloom: 0.3 });
};

// =====================================================================
//  s10 — "each one with a title and a name.": the camera tracks along the row of brass plates; each one catches the light
// =====================================================================
const ROM_K10 = [[0, [-4.6, 8.0, -6.6], [-3.6, 7.75, -11.6], 40], [1.8, [3.6, 8.1, -6.8], [3.0, 7.75, -11.6], 40]];
SHOT_FN['s10'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  c3SetCam(s.cam, romCam(ROM_K10, lt, 's10', { orbit: 0.0, creep: 0.02 }));
  const title = romW('title', 1, 16.0), name = romW('name', 1, 16.5);
  // a warm sheen slides over the plates on "title" and on "name"
  for (const D of Object.values(s.drawers)) { const ci = Number(D.key[0]), k = Math.max(seg(t, title + ci * 0.05, title + 0.25 + ci * 0.05) * (1 - seg(t, title + 0.3, title + 0.6)), seg(t, name + ci * 0.05, name + 0.25 + ci * 0.05) * (1 - seg(t, name + 0.35, name + 0.7)));
    D.plate.material.emissive?.set('#ffcf70'); D.plate.material.emissiveIntensity = 0.55 * k; }
  romFg(s, [['strip', [-3.4, 0, -5], 2.4], ['post', [3.0, -4.6, -8], 1.6]], ROM_K10, 's10', lt, { orbit: 0, creep: 0.02 });
  romRender(s, { bgBlur: 1.6, glow: 0.8 });
};

// =====================================================================
//  s11 — "You lean in. You can read the title.": you lean over to the hero drawer, nose to the glass; your breath fogs it;
//  the camera slides in onto the title
// =====================================================================
const ROM_K11 = [[0, [-5.0, 9.6, -3.2], [1.4, 9.0, -10.4], 42], [0.9, [-3.8, 9.6, -4.4], [1.2, 9.2, -10.8], 42], [1.7, [-1.8, 9.9, -6.0], [1.1, 9.5, -11.0], 40]];
SHOT_FN['s11'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const lean = romW('lean', 1, 17.0), read = romWA('read', 17.3, 17.7), title = romW('title', 2, 18.0);
  c3SetCam(s.cam, romCam(ROM_K11, lt, 's11', { orbit: 0.02, creep: 0.02 }));
  const ln = EZ.o2(clamp((t - (lean - 0.1)) / 0.35));
  s.you.g.position.set(2.75, ROM_FOOT, -9.0); s.you.root.rotation.z = 0;
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [lean, 'suspicious'], [read, 'thinking']], t, 'you'), gaze: [-0.9, 0.1], lean: 0.22 * ln, head: [0.1 * ln, -0.15 * ln, 0.55 * ln],
    hand: { armL: [-0.3, 1.0], armR: [-1.3, 1.2 + 0.1 * ln] }, ...ROM_STAND });
  // breath fog blooms on the glass by your mouth while you're leaning, and pulses with each breath
  const fk = ln * (0.75 + 0.25 * Math.sin(t * 5)); s.fog.visible = fk > 0.02; s.fog.position.set(1.05, 0.05, 0.62); s.fog.scale.setScalar(0.4 + 0.8 * fk); s.fog.material.opacity = fk;
  romFg(s, [['lamp', [2.4, 4.6, -8], -0.8]], ROM_K11, 's11', lt, { orbit: 0.02, creep: 0.02 });
  romRender(s, { bgBlur: romRack(lt, 's11', 1.6, 2.6), glow: 0.75 });
};

// =====================================================================
//  s12 — "That's it.": you, deadpan, close; the fog on the glass fades
// =====================================================================
const ROM_K12 = [[0, [-1.4, 9.4, -3.8], [2.3, 9.0, -9.2], 40], [0.6, [-1.0, 9.4, -4.2], [2.3, 9.0, -9.2], 39]];
SHOT_FN['s12'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  c3SetCam(s.cam, romCam(ROM_K12, lt, 's12', { orbit: 0.02, rush: 0.05 }));
  s.you.g.position.set(2.75, ROM_FOOT, -9.0);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'deadpan']], t, 'you12'), gaze: [-0.2, 0], lean: 0.1, head: [0.04, 0, 0], hand: { armL: [0.9, -0.6], armR: [-0.9, -0.6] }, ...ROM_STAND });
  const fk = 0.6 * (1 - clamp((t - 18.6) / 0.6)); s.fog.visible = true; s.fog.position.set(1.05, 0.05, 0.62); s.fog.scale.setScalar(0.4 + 0.8 * fk); s.fog.material.opacity = fk;
  romRender(s, { bgBlur: 3.0, glow: 0.7 });
};

// =====================================================================
//  s13 — "So you ask the guard when they open.": you step over to the guard by the drawer wall and ask; he turns
// =====================================================================
const ROM_K13 = [[0, [0.8, 8.6, 11.0], [3.6, 7.0, -4.8], 50], [1.8, [1.8, 8.4, 10.0], [3.9, 7.2, -5.0], 50]];   // the camera stays inside the oval
SHOT_FN['s13'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const ask = romW('ask', 1, 19.5), guard = romW('guard', 1, 20.0), open = romW('open', 1, 20.5);
  c3SetCam(s.cam, romCam(ROM_K13, lt, 's13', { orbit: 0.02 }));
  const wk = EZ.io(clamp((t - 19.15) / 0.75)), yx = lerp(-1.6, 1.4, wk);
  s.you.g.position.set(yx, ROM_FOOT, -3.4);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [ask, 'talking'], [open + 0.25, 'hopeful']], t, 'you'), gaze: [0.85, 0.1], head: [-0.05, 0, 0],
    hand: { armL: [1.4, lerp(-0.2, 1.4, seg(t, ask, ask + 0.2))], armR: [-1.0, -0.4] }, ...(wk < 1 ? romWalkFeet(t * 8) : ROM_STAND) });
  s.guard.g.visible = true; s.guard.g.position.set(6.2, ROM_FOOT, -5.6);
  c3PersonPose(s.guard, s.cam, t, { expr: c3FaceAt([[0, 'bored'], [guard, 'neutral']], t, 'guard'), gaze: t > guard ? [-0.85, 0] : [0.2, 0.1], head: [0, 0, 0],
    hand: { armL: [0.35, 0.65], armR: [-0.35, 0.6] }, ...ROM_STAND });
  romFg(s, [['post', [-3.4, -4.2, -8.5], 1.4]], ROM_K13, 's13', lt, { orbit: 0.02 });
  romRender(s, { bgBlur: romRack(lt, 's13', 2.2, 1.8) });
};

// =====================================================================
//  s14 — "He says, in twenty-one fourteen.": the guard by his brass year board; on "in" he slaps the board and the
//  counter rolls from 2026 up to 2114, landing on "fourteen"
// =====================================================================
const ROM_K14 = [[0, [5.0, 8.8, 7.6], [8.0, 7.8, -6.0], 46], [1.4, [5.6, 8.6, 6.2], [8.0, 7.8, -6.0], 46]];
SHOT_FN['s14'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const says = romW('says', 1, 21.1), inW = romWA('in', 21.0, 21.3), fourteen = romW('fourteen', 1, 21.8);
  c3SetCam(s.cam, romCam(ROM_K14, lt, 's14', { orbit: -0.02 }));
  s.guard.g.visible = true; s.guard.g.position.set(6.2, ROM_FOOT, -5.6);
  s.board.visible = true; s.board.position.set(9.7, 0, -6.6); s.board.rotation.y = -0.22; s.board.scale.setScalar(0.82);
  const slap = seg(t, inW - 0.15, inW), v = lerp(2026, 2114, EZ.o3(clamp((t - inW) / (fourteen + 0.25 - inW))));
  romOdo(s.yearOdo, t < inW ? 2026 : Math.min(2114, v), { bg: '#120c08', win: '#fbf6ea', ink: '#1a120a' });
  s.board.position.y = 0.06 * Math.sin(Math.PI * seg(t, inW, inW + 0.15));
  c3PersonPose(s.guard, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [says, 'talking'], [fourteen + 0.35, 'smug']], t, 'guard'), gaze: [0.2, 0.05], head: c3Hold([[0, [0.04, 0, 0]], [fourteen, [-0.08, 0, 0.04]]], t, 4 / 30),
    hand: { armL: [lerp(0.6, 2.1, EZ.o2(slap)), lerp(0.6, 3.1, EZ.o2(slap))], armR: [-0.35, 0.6] }, ...ROM_STAND });   // he points his thumb at the board
  romFg(s, [['lamp', [-2.0, 4.8, -8.5], 0.8]], ROM_K14, 's14', lt, { orbit: -0.02 });
  romRender(s, { bgBlur: romRack(lt, 's14', 1.8, 2.6) });
};

// =====================================================================
//  s15 — "You do the math.": you, close, counting on your fingers; the sum writes itself in a thought bubble
// =====================================================================
const ROM_K15 = [[0, [1.0, 10.6, 9.6], [1.6, 10.4, -3.4], 48], [0.8, [1.2, 10.6, 8.6], [1.6, 10.5, -3.4], 48]];
SHOT_FN['s15'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  c3SetCam(s.cam, romCam(ROM_K15, lt, 's15', { orbit: 0.02, rush: 0.05 }));
  s.you.g.position.set(1.4, ROM_FOOT, -3.4);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'thinking'], [romW('math', 1, 22.8), 'confused']], t, 'you'), gaze: [0.4, 0.8], head: [0.12, 0, 0], hand: { armL: [1.4, 1.7], armR: [-1.4, 1.7] }, ...ROM_STAND });
  s.you.g.updateMatrixWorld(true);
  const n = Math.min(5, Math.floor((t - 22.42) / 0.12) + 1); romFingers(s, Math.min(3, Math.max(0, n)), Math.max(0, n - 3));
  romBubbleDraw(s, clamp((t - 22.42) / 0.62)); s.bubble.visible = true;
  s.bubble.position.copy(s.you.root.localToWorld(romV(0.3, 7.3, 0.4))); romFace(s.bubble, s.cam);
  const k = EZ.back(clamp((t - 22.4) / 0.18)); s.bubble.scale.setScalar(Math.max(1e-3, 0.85 * k));
  romRender(s, { bgBlur: 2.8 });
};

// =====================================================================
//  s16 — "You'd be… well, gone.": a little tombstone with your name pops out of the floor beside you; you deflate
// =====================================================================
const ROM_K16 = [[0, [-0.2, 7.6, 10.4], [-0.1, 6.0, -3.4], 48], [0.9, [-0.3, 7.4, 9.4], [-0.1, 6.0, -3.4], 48]];
SHOT_FN['s16'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const be = romW('be', 1, 23.3), gone = romW('gone', 1, 23.7);
  c3SetCam(s.cam, romCam(ROM_K16, lt, 's16', { orbit: -0.02 }));
  s.you.g.position.set(1.4, ROM_FOOT, -3.4);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'confused'], [be, 'worried'], [gone, 'sad']], t, 'you'), gaze: [-0.7, -0.4], head: [0.1, 0, -0.1], hand: { armL: [0.8, -0.5], armR: [-0.8, -0.5] },
    lift: (q) => -0.15 * EZ.o2(seg(q, gone, gone + 0.25)), ...ROM_STAND });
  romPop(s, s.stoneYou, t, be, -1.3, -3.6, 0.2); romPuff(s, t, [[be, -1.3, -3.6]]);
  romRender(s, { bgBlur: 2.2 });
};

// =====================================================================
//  s17 — "Don't worry, he says. So will I.": the guard, smug, reassures you; on "So will I" his own tombstone pops up
// =====================================================================
const ROM_K17 = [[0, [3.2, 8.4, 10.8], [4.0, 6.6, -4.8], 56], [2.0, [4.0, 8.2, 10.0], [4.2, 6.6, -4.8], 56]];
SHOT_FN['s17'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const worry = romW('worry', 1, 24.4), so = romWA('So', 25.0, 25.3), I = romWA('I', 25.4, 25.7);
  c3SetCam(s.cam, romCam(ROM_K17, lt, 's17', { orbit: 0.02 }));
  s.you.g.position.set(1.4, ROM_FOOT, -3.4);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'sad'], [so + 0.3, 'unimpressed']], t, 'you'), gaze: [0.85, 0], head: [-0.06, 0, -0.06], hand: { armL: [0.8, -0.5], armR: [-0.8, -0.5] }, ...ROM_STAND });
  romPop(s, s.stoneYou, t, -1, -1.3, -3.6, 0.2);
  s.guard.g.visible = true; s.guard.g.position.set(5.0, ROM_FOOT, -5.0);
  c3PersonPose(s.guard, s.cam, t, { expr: c3FaceAt([[0, 'smug'], [worry - 0.25, 'talking'], [romW('says', 2, 24.9), 'smug'], [so, 'talking'], [I + 0.2, 'grin']], t, 'guard'), gaze: [-0.85, 0],
    head: c3Hold([[0, [0.05, 0, 0]], [so, [-0.08, 0, 0.05]]], t, 4 / 30), hand: { armL: [0.35, 0.65], armR: [lerp(-0.35, -1.6, seg(t, worry, worry + 0.2) * (1 - seg(t, so - 0.2, so))), lerp(0.6, 2.2, seg(t, worry, worry + 0.2) * (1 - seg(t, so - 0.2, so)))] },
    x: t > I ? ['sparkle'] : [], ...ROM_STAND });
  romPop(s, s.stoneGuard, t, so + 0.05, 7.6, -5.8, -0.2); romPuff(s, t, [[so + 0.05, 7.6, -5.8]]);
  romFg(s, [['lamp', [-2.4, 5.0, -9], 0.8]], ROM_K17, 's17', lt, { orbit: 0.02 });
  romRender(s, { bgBlur: romRack(lt, 's17', 1.8, 2.4) });
};

// =====================================================================
//  s24 — "that stays locked away until twenty-one fourteen.": the new manuscript slides into the empty drawer next to
//  SCRIBBLER MOON; the drawer shuts; its combination wheels roll to 2-1-1-4 one by one; the lock light turns red
// =====================================================================
const ROM_K24 = [[0, [6.8, 10.0, -3.8], [3.1, 9.2, -10.8], 42], [1.2, [5.0, 9.2, -6.8], [3.1, 8.9, -11.2], 38], [2.6, [4.4, 8.9, -7.6], [3.2, 8.7, -11.3], 36]];
SHOT_FN['s24'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  const locked = romW('locked', 1, 37.6), away = romW('away', 1, 37.9), tw = romW('twenty', 2, 38.5), fourteen = romW('fourteen', 2, 39.1);
  c3SetCam(s.cam, romCam(ROM_K24, lt, 's24', { orbit: -0.02, creep: 0.03 }));
  s.newMs.visible = true; s.newLit = true; romLights(s, 1, 1);
  const shut = EZ.i2(clamp((t - (locked - 0.35)) / (away + 0.05 - (locked - 0.35)))); s.newD.box.position.z = 1.5 * (1 - shut) - 0.03 * Math.sin(Math.PI * seg(t, away + 0.05, away + 0.2));
  // the wheels land one after another: 2 on "twenty", 1, 1, 4 on "fourteen"
  // each wheel spins (8 digits/s) from just after the thunk, then eases onto its digit
  const lands = [tw, tw + 0.25, tw + 0.45, fourteen], dig = [2, 1, 1, 4], start = away + 0.15;
  const wheel = (L, d) => { if (t <= start) return 0; const tb = L - 0.45, pA = Math.max(0, tb - start) * 8; if (t < tb) return (t - start) * 8;
    const tgt = Math.ceil(pA / 10) * 10 + 10 + d; return lerp(pA, tgt, EZ.o3(clamp((t - tb) / 0.45))); };
  romOdo(s.newD.odo, lands.map((L, i) => wheel(L, dig[i])), {});
  s.newD.led.material.color.set(t > fourteen + 0.12 ? '#ff2a2a' : '#3a0c0c'); s.newD.led.material.userData.glow = t > fourteen + 0.12 ? '#ff3030' : null;
  romFg(s, [['lamp', [1.8, 4.2, -9], -0.6]], ROM_K24, 's24', lt, { orbit: -0.02, creep: 0.03 });
  romRender(s, { bgBlur: romRack(lt, 's24', 2.4, 3.2), glow: 0.85 });
};

// =====================================================================
//  s35 — "that nobody alive today will ever get to read.": the room at night, the camera drifting back from the sealed
//  drawers as the lights dim to their warm glow; the last frames lead back to the opening (loops to s01)
// =====================================================================
const ROM_K35 = [[0, [1.0, 9.6, -6.8], [0.6, 9.3, -11.4], 40], [2.6, [1.6, 9.0, 1.0], [0.8, 8.8, -11.4], 44]];
SHOT_FN['s35'] = (t, u, lt) => {
  const s = romGet(); romWorld(s, t);
  s.newMs.visible = true; s.newLit = true; romOdo(s.newD.odo, 2114, {});
  const dim = clamp((t - 59.4) / 1.6); romLights(s, 1 - dim, 1); s.cove.visible = dim < 0.6;
  for (const D of Object.values(s.drawers)) D.lamp.visible = D.lamp.visible && (D === s.hero || D === s.newD || dim < 0.75);
  c3SetCam(s.cam, romCam(ROM_K35, lt, 's35', { orbit: 0.01, creep: 0.02, rush: 0.0 }));
  romFg(s, [['post', [-4.6, -4.6, -7.5], 0.8]], ROM_K35, 's35', lt, { orbit: 0.01, creep: 0.02, rush: 0 });
  romRender(s, { bgBlur: romRack(lt, 's35', 1.6, 2.6), glow: 0.9, bloom: 0.3 });
};
