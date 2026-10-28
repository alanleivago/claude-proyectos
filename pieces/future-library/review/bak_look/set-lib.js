// =====================================================================
//  SET lib — the library in Oslo: s01 (exterior by the fjord) and s02-s06 (the hall inside).
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed lib.
//  Two small worlds, each built once: libExt (a modern stacked library on a stone plaza at the fjord, morning) and
//  libHall (a bright hall: a NEW RELEASES wall at the back, side shelves with portraits of famous living writers above
//  them, a glass display case in the middle, a NO READING sign). People are c3Person billboards at LIB_K x;
//  a standing person's root sits at LIB_FOOT.
// =====================================================================
const LIB = {};
const LIB_K = 1.35, LIB_FOOT = 2.55 * LIB_K;
const libW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const libV = (x, y, z) => new THREE.Vector3(x, y, z);
const libSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function libCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = libSpan(id), dur = b - a;
  const P = libV(...c.p), L = libV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(libV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const libRack = (lt, id, a, b) => { const [t0, t1] = libSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function libFg(s, list, K, id, lt, o = {}) {
  const c = LIB.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 900);
  c3SetCam(c, libCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = libV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(libV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const libSph = () => LIB.sph ||= new THREE.SphereGeometry(1, 22, 16);

// ---- textures
function libTexStone() {   // big pale plaza slabs with darker joints
  const t = tex((x, w, h) => { x.fillStyle = '#6a6056'; x.fillRect(0, 0, w, h); const R = RNG('slab');
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.fillStyle = `hsl(28,${16 + R.r(-4, 4)}%,${50 + R.r(-6, 5)}%)`; x.fillRect(i * w / 4 + 3, j * h / 4 + 3, w / 4 - 6, h / 4 - 6); }
    for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(120,110,95,${R.r(0.05, 0.16)})`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 14); return t;
}
function libTexWater() {
  const t = tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a8ab8'); g.addColorStop(1, '#2a6a9a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('fjord'); x.strokeStyle = 'rgba(220,240,255,0.55)'; x.lineCap = 'round';
    for (let i = 0; i < 90; i++) { const y = R.r(0, h), xx = R.r(0, w), l = R.r(16, 60); x.lineWidth = R.r(2, 4); x.beginPath(); x.moveTo(xx, y); x.quadraticCurveTo(xx + l / 2, y - 4, xx + l, y); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 8); return t;
}
function libTexGlass(seed, warm) {   // a curtain wall: thin dark mullions, panes with sky reflection and warm lit rooms behind some
  const t = tex((x, w, h) => { const R = RNG('glass', seed), cols = 10, rows = 6;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const lit = R.f() < warm, g = x.createLinearGradient(0, j * h / rows, 0, (j + 1) * h / rows);
      if (lit) { g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#f6b868'); } else { g.addColorStop(0, '#3a6aa8'); g.addColorStop(1, '#16305a'); }
      x.fillStyle = g; x.fillRect(i * w / cols, j * h / rows, w / cols, h / rows);
      if (lit) { x.fillStyle = 'rgba(150,90,40,0.35)'; for (let k = 0; k < 4; k++) x.fillRect(i * w / cols + 6 + k * (w / cols - 12) / 4, (j + 0.55) * h / rows, (w / cols - 12) / 4 - 4, h / rows * 0.4); }   // bookshelves inside
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.moveTo(i * w / cols + 6, j * h / rows); x.lineTo(i * w / cols + 22, j * h / rows); x.lineTo(i * w / cols + 6, (j + 0.6) * h / rows); x.fill(); }
    x.strokeStyle = '#3a3e48'; x.lineWidth = 5; for (let i = 0; i <= cols; i++) { x.beginPath(); x.moveTo(i * w / cols, 0); x.lineTo(i * w / cols, h); x.stroke(); }
    for (let j = 0; j <= rows; j++) { x.lineWidth = j % 3 === 0 ? 9 : 4; x.beginPath(); x.moveTo(0, j * h / rows); x.lineTo(w, j * h / rows); x.stroke(); } }, 1024, 512);
  return t;
}
function libTexSky() {
  return c3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h * 0.5); g.addColorStop(0, '#2f78d0'); g.addColorStop(0.75, '#7ab8ec'); g.addColorStop(1, '#e8f2f8');
    x.fillStyle = g; x.fillRect(0, 0, w, h * 0.5); x.fillStyle = '#e8f2f8'; x.fillRect(0, h * 0.5, w, h * 0.5);
    const R = RNG('libcloud');
    for (let i = 0; i < 60; i++) { const cx = R.r(0, w), cy = R.r(h * 0.32, h * 0.47), n = R.i(4, 7), s = R.r(7, 15);
      for (const pass of [0, 1]) for (let k = 0; k < n; k++) { const R2 = RNG('lpuff', i, k), px = cx + (k - n / 2) * s * 0.95 + R2.n(s * 0.3), py = cy - Math.sin(k / (n - 1) * Math.PI) * s * 0.8, r = s * R2.r(0.7, 1.15);
        x.beginPath(); x.arc(px, py + (pass ? 0 : r * 0.3), r, 0, TAU); x.fillStyle = pass ? '#ffffff' : '#bcd2ea'; x.fill(); } } }, 4096, 2048);
}
function libTexWood() {
  const t = tex((x, w, h) => { x.fillStyle = '#d8a868'; x.fillRect(0, 0, w, h); const R = RNG('libwood');
    for (let i = 0; i < 8; i++) { x.fillStyle = `hsl(32,${48 + R.r(-6, 6)}%,${58 + R.r(-6, 5)}%)`; x.fillRect(0, i * h / 8 + 2, w, h / 8 - 4); }
    x.strokeStyle = 'rgba(120,70,30,0.25)'; x.lineWidth = 2; for (let i = 0; i < 40; i++) { const y = R.r(0, h); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(6), w * 2 / 3, y + R.n(6), w, y + R.n(4)); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// a generic, made-up writer portrait (cartoon head, hair, glasses or beard on a coloured ground) in a gold frame card
function libTexPortrait(i) {
  return tex((x, w, h) => { const R = RNG('port', i), BG = ['#2a6ad8', '#d8322a', '#3aa05a', '#8a4ad8', '#f2a030', '#1aa8a8'];
    x.fillStyle = BG[i % BG.length]; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h * 0.4, w * 0.7); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = ['#3a5aa8', '#f6f2ea', '#2a2a30', '#d8a030'][i % 4]; x.beginPath(); x.ellipse(w / 2, h * 0.98, w * 0.36, h * 0.3, 0, 0, TAU); x.fill();   // shoulders
    x.fillStyle = '#fbf2e6'; x.strokeStyle = '#3a2216'; x.lineWidth = 7; x.beginPath(); x.arc(w / 2, h * 0.44, w * 0.25, 0, TAU); x.fill(); x.stroke();   // head
    x.fillStyle = ['#5a3323', '#2a1a12', '#c8c8c8', '#a8642a', '#1a1a1a', '#e0b060'][R.i(0, 5)];   // hair cap
    x.beginPath(); x.ellipse(w / 2, h * 0.31, w * 0.27, h * 0.13, 0, Math.PI, TAU); x.fill(); if (i % 3 === 1) { x.fillRect(w * 0.23, h * 0.3, w * 0.07, h * 0.28); x.fillRect(w * 0.7, h * 0.3, w * 0.07, h * 0.28); }
    x.fillStyle = '#2a1a12'; for (const sx of [-1, 1]) { x.beginPath(); x.arc(w / 2 + sx * w * 0.09, h * 0.45, 6, 0, TAU); x.fill(); }   // eyes
    if (i % 2 === 0) { x.strokeStyle = '#2a1a12'; x.lineWidth = 4; for (const sx of [-1, 1]) { x.beginPath(); x.arc(w / 2 + sx * w * 0.09, h * 0.45, 17, 0, TAU); x.stroke(); } x.beginPath(); x.moveTo(w / 2 - 6, h * 0.45); x.lineTo(w / 2 + 6, h * 0.45); x.stroke(); }
    if (i % 3 === 2) { x.fillStyle = '#5a3a2a'; x.beginPath(); x.ellipse(w / 2, h * 0.56, w * 0.16, h * 0.09, 0, 0, Math.PI); x.fill(); }   // beard
    x.strokeStyle = '#2a1a12'; x.lineWidth = 5; x.beginPath(); x.arc(w / 2, h * 0.52, 16, 0.2, Math.PI - 0.2); x.stroke();   // a famous-writer smile
    x.strokeStyle = '#e8b830'; x.lineWidth = 22; x.strokeRect(11, 11, w - 22, h - 22); x.strokeStyle = '#a87a18'; x.lineWidth = 5; x.strokeRect(24, 24, w - 48, h - 48);
  }, 256, 320);
}
function libTexPlaque(txt) { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6d870'); g.addColorStop(1, '#c89a28'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#8a6a10'; x.lineWidth = 6; x.strokeRect(5, 5, w - 10, h - 10); inked(x, txt, w / 2, h / 2, h * 0.5, '#4a3008', { stroke: false, maxW: w * 0.84 }); }, 256, 72); }
function libTexBanner(txt, bg, fg) { return tex((x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28);
  inked(x, txt, w / 2, h / 2, h * 0.5, fg, { stroke: '#2a1208', sw: h * 0.05, maxW: w * 0.86 }); }, 1024, 220); }
function libTexSignFace() { return tex((x, w, h) => { x.fillStyle = '#2a2e38'; x.fillRect(0, 0, w, h); inked(x, 'BIBLIOTEK', w / 2, h / 2, h * 0.56, '#ffffff', { stroke: false, maxW: w * 0.9 }); }, 1024, 160); }
function libTexManu() { return tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,50,40,0.45)';
  const R = RNG('manu'); for (let i = 0; i < 12; i++) x.fillRect(w * 0.12, h * (0.36 + i * 0.045), w * R.r(0.5, 0.76), 3);
  inked(x, 'MANUSCRIPT', w / 2, h * 0.16, h * 0.07, '#2a1a10', { stroke: false, maxW: w * 0.8, font: 'Georgia, serif', weight: 700 });
  x.fillStyle = '#b8261e'; x.beginPath(); x.arc(w * 0.72, h * 0.86, w * 0.1, 0, TAU); x.fill(); x.fillStyle = '#e04a3a'; x.beginPath(); x.arc(w * 0.7, h * 0.84, w * 0.05, 0, TAU); x.fill(); }, 256, 340); }
// the zipper over the writer's mouth: p = 0..1 how far it is closed (the pull slides left to right)
function libZipDraw(s, p) {
  const x = s.zipCv.getContext('2d'), w = s.zipCv.width, h = s.zipCv.height; x.clearRect(0, 0, w, h);
  const x0 = w * 0.08, x1 = w * 0.92, xp = lerp(x0, x1, p);
  x.fillStyle = '#c8c4bc'; x.strokeStyle = '#2a1a12'; x.lineWidth = 5;
  x.beginPath(); x.roundRect(x0 - 6, h * 0.36, x1 - x0 + 12, h * 0.28, 12); x.fill(); x.stroke();   // the tape
  for (let k = 0; k < 18; k++) { const tx = lerp(x0 + 8, x1 - 8, k / 17), closed = tx < xp, off = closed ? 0 : h * 0.07;
    x.fillStyle = '#f2c230'; x.fillRect(tx - 5, h * 0.5 - h * 0.1 - off * (k % 2 ? 1 : 0), 10, h * 0.1); x.fillRect(tx - 5, h * 0.5 + off * (k % 2 ? 0 : 1), 10, h * 0.1); }
  x.fillStyle = '#e0e0e8'; x.strokeStyle = '#2a1a12'; x.lineWidth = 5; x.beginPath(); x.roundRect(xp - 16, h * 0.3, 32, h * 0.4, 8); x.fill(); x.stroke();   // slider
  x.beginPath(); x.roundRect(xp - 10, h * 0.66, 20, h * 0.3, 8); x.fill(); x.stroke();   // pull tab
  s.zipTex.needsUpdate = true;
}
// the NO READING sign: a stand board; the red stamp slams in at k (0 = not yet, 1 = landed)
function libSignDraw(s, k) {
  const x = s.signCv.getContext('2d'), w = s.signCv.width, h = s.signCv.height;
  x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2e38'; x.lineWidth = 14; x.strokeRect(10, 10, w - 20, h - 20);
  inked(x, 'LIBRARY RULES', w / 2, h * 0.14, h * 0.07, '#2a2e38', { stroke: false, maxW: w * 0.8 });
  x.fillStyle = 'rgba(42,46,56,0.4)'; for (let i = 0; i < 5; i++) x.fillRect(w * 0.15, h * (0.27 + i * 0.07), w * (0.55 + 0.1 * (i % 2)), 8);
  if (k > 0) { x.save(); x.translate(w / 2, h * 0.7); x.rotate(-0.16); const sc = 1 + 0.9 * (1 - EZ.o3(clamp(k))); x.scale(sc, sc); x.globalAlpha = clamp(k * 4);
    x.strokeStyle = '#d22a1e'; x.lineWidth = 14; x.strokeRect(-w * 0.4, -h * 0.13, w * 0.8, h * 0.26); inked(x, 'NO READING', 0, 0, h * 0.13, '#d22a1e', { stroke: false, maxW: w * 0.74 }); x.restore(); }
  s.signTex.needsUpdate = true;
}

// ---- props
function libBook(col, o = {}) {   // a closed hardback lying or standing: cover colour, cream page block, a spine band
  const g = new THREE.Group(), M = c3Prop(col, { rough: 0.35, env: 1.2 }), P = c3Toon('#f8f0dc');
  const w = o.w ?? 0.5, h = o.h ?? 2.0, d = o.d ?? 1.4;
  g.add(rb(w, h, d, M, 0, h / 2, 0, 0.03)); g.add(rb(w * 0.8, h * 0.92, d * 0.9, P, 0, h / 2 + 0.06, -0.08, 0));
  g.add(rb(w * 1.02, h * 0.07, d * 1.01, c3Prop('#f2c230', { rough: 0.3, metal: 0.5 }), 0, h * 0.82, 0, 0));
  return g;
}
function libChain(n) {   // a run of n linked torus links along +x (each 0.9 long), steel
  const g = new THREE.Group(), M = c3Prop('#9aa0ae', { rough: 0.25, metal: 0.9, env: 1.6 }), geo = LIB.link ||= new THREE.TorusGeometry(0.42, 0.11, 8, 20);
  for (let i = 0; i < n; i++) { const l = c3Mesh(geo, M, 0.02); l.scale.set(1.3, 0.8, 1); l.position.x = i * 0.9; l.rotation.x = i % 2 ? Math.PI / 2 : 0; g.add(l); }
  return g;
}
function libPadlock() {   // a big brass padlock: body + a steel shackle that drops shut
  const g = new THREE.Group();
  g.add(rb(2.6, 2.2, 1.0, c3Prop('#e0b030', { rough: 0.2, metal: 0.85, env: 1.8 }), 0, 0, 0, 0.05));
  const kh = c3Mesh(libSph(), c3Toon('#3a2a10'), 0); kh.scale.set(0.22, 0.22, 0.05); kh.position.set(0, 0.15, 0.51); g.add(kh);
  g.add(rb(0.14, 0.5, 0.06, c3Toon('#3a2a10'), 0, -0.2, 0.51, 0));
  g.shackle = c3Mesh(new THREE.TorusGeometry(0.85, 0.2, 12, 28, Math.PI), c3Prop('#c8ccd6', { rough: 0.2, metal: 0.95, env: 1.8 }), 0.03);
  const leg = c3Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.0, 12), g.shackle.material, 0.03); leg.position.set(-0.85, -0.5, 0); g.shackle.add(leg);
  const leg2 = leg.clone(); leg2.position.x = 0.85; g.shackle.add(leg2);
  g.add(g.shackle); return g;
}

// ---- the exterior: the fjord, a stone plaza, the library (a stack of offset glass-and-stone boxes with a big cantilever)
function libBuildExt() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff4e6', ambI: 0.55, sky: '#cfe6ff', ground: '#c8b89c', key: '#fff2d8', keyI: 1.2, keyP: [-30, 40, 30], rim: '#ffe0c0', rimI: 0.5, rimP: [30, 20, -30] });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), c3Flat('#ffffff', { map: libTexSky(), side: THREE.BackSide })));
  scene.add(pl(3000, 1400, c3Prop('#ffffff', { map: libTexWater(), rough: 0.12, metal: 0.15, env: 0.8 }), 0, -0.6, -760, 0, -Math.PI / 2));   // the fjord behind the plaza
  s.plaza = pl(400, 140, c3Prop('#ffffff', { map: libTexStone(), rough: 0.85 }), 0, 0, 10, 0, -Math.PI / 2); scene.add(s.plaza);
  scene.add(rb(400, 1.2, 2, c3Toon('#b8ad98'), 0, -0.3, -60, 0.04));   // the quay edge
  // far shore: soft hills, a few far town blocks
  const hillM = [c3Toon('#6a9a6a'), c3Toon('#5a8a7a'), c3Toon('#7aa88a')];
  for (let i = 0; i < 14; i++) { const R = RNG('hill', i), h = c3Mesh(libSph(), hillM[i % 3], 0); h.scale.set(R.r(60, 120), R.r(14, 34), 30); h.position.set(-500 + i * 75 + R.n(20), 0, -620 + R.n(30)); scene.add(h); }
  for (let i = 0; i < 18; i++) { const R = RNG('town', i), hgt = R.r(10, 40); scene.add(rb(R.r(10, 20), hgt, 10, c3Toon(['#f2ece0', '#e8d8c0', '#c8d8e8', '#f0c8a0'][i % 4]), -260 + i * 30 + R.n(6), hgt / 2, -470 + R.n(20), 0.0)); }
  // boats on the fjord (rocked per frame)
  s.boats = [...Array(3)].map((_, i) => { const g = new THREE.Group(); g.add(rb(9, 1.6, 3, c3Toon(['#ffffff', '#d8322a', '#2a6ad8'][i]), 0, 0.8, 0, 0.05)); g.add(rb(3.4, 2, 2.2, c3Toon('#f6f2ea'), -1, 2.4, 0, 0.04));
    const mast = cyl(0.12, 0.12, 9, c3Toon('#e8e4d8'), 1.8, 5.6, 0, 0.02, 8); g.add(mast); g.position.set(-90 + i * 95, 0, -150 - i * 60); scene.add(g); return g; });
  // the library: a glass ground floor set back, a heavy stone-and-glass middle that cantilevers out over the entrance, an offset top box
  const lib = new THREE.Group(); lib.position.set(0, 0, -30); scene.add(lib); s.lib = lib;
  const stone = c3Prop('#8a5530', { rough: 0.6 }), dark = c3Toon('#3a3e48');
  lib.add(rb(46, 10, 24, c3Prop('#ffffff', { map: libTexGlass(1, 0.6), rough: 0.1, metal: 0.2, env: 1.2 }), 0, 5, 0, 0.05));
  lib.add(rb(64, 1.6, 34, stone, -4, 10.8, 4, 0.06));                 // slab
  lib.add(rb(64, 14, 32, c3Prop('#ffffff', { map: libTexGlass(2, 0.7), rough: 0.1, metal: 0.25, env: 1.3 }), -4, 18.6, 4, 0.06));
  for (let i = 0; i < 9; i++) lib.add(rb(1.2, 14, 1.2, stone, -34 + i * 7.5, 18.6, 20.2, 0.03));   // vertical fins on the front
  lib.add(rb(66, 1.6, 34, stone, -4, 26.4, 4, 0.06));
  lib.add(rb(40, 9, 26, c3Prop('#ffffff', { map: libTexGlass(3, 0.6), rough: 0.1, metal: 0.25, env: 1.3 }), 8, 31.7, -2, 0.06));
  lib.add(rb(42, 1.4, 28, stone, 8, 36.8, -2, 0.05));
  const sign = pl(24, 3.6, c3Flat('#ffffff', { map: libTexSignFace() }), -4, 12.6, 21.05); lib.add(sign);   // BIBLIOTEK fascia on the slab edge
  lib.add(rb(10, 7, 0.6, dark, 0, 3.5, 12.2, 0.03)); lib.add(pl(9, 6.4, c3Prop('#ffffff', { map: libTexGlass(4, 0.95), rough: 0.15, emissive: '#ffb860', ei: 0.15 }), 0, 3.4, 12.55));   // entrance
  // plaza dressing: benches, lamp posts, trees, a bike rack
  const treeM = c3Toon('#4a9a4a'), trunkM = c3Toon('#8a6a48');
  for (const [x, z] of [[-30, 22], [26, 20], [-44, 30], [40, 34]]) { scene.add(cyl(0.5, 0.7, 6, trunkM, x, 3, z, 0.04, 10)); const c = c3Mesh(libSph(), treeM, 0.06); c.scale.set(4.4, 5, 4.4); c.position.set(x, 9, z); scene.add(c); }
  for (const x of [-16, 14]) { scene.add(rb(7, 0.6, 2, c3Toon('#a8875e'), x, 1.6, 26, 0.03)); scene.add(rb(0.5, 1.4, 1.6, dark, x - 3, 0.7, 26, 0.02)); scene.add(rb(0.5, 1.4, 1.6, dark, x + 3, 0.7, 26, 0.02)); }
  for (const x of [-30, 30]) { scene.add(cyl(0.22, 0.28, 11, dark, x, 5.5, 34, 0.03, 10)); const b = c3Mesh(libSph(), c3Flat('#fff4d0', { glow: '#ffe8a0' }), 0.03); b.scale.setScalar(0.9); b.position.set(x, 11.3, 34); scene.add(b); }
  // people strolling on the plaza (tiny, background)
  s.walkers = [{ key: 'w1', outfit: 'bomber', hairStyle: 'redcap' }, { key: 'w2', outfit: 'dress', hairStyle: 'ponytail' }, { key: 'w3', outfit: 'leather', hairStyle: 'beanie' }]
    .map((o) => { const p = c3Person(o); p.g.scale.setScalar(LIB_K); scene.add(p.g); return p; });
  s.fgBy = {
    lamp: (() => { const g = new THREE.Group(); g.add(cyl(0.3, 0.36, 26, dark, 0, 0, 0, 0.03, 10)); return g; })(),
    leaf: (() => { const g = new THREE.Group(); for (let i = 0; i < 9; i++) { const R = RNG('fgleaf', i), b = c3Mesh(libSph(), treeM, 0.04); b.scale.set(R.r(1.2, 2.2), R.r(1.0, 1.8), 1); b.position.set(R.n(2.4), R.n(1.6), 0); g.add(b); } return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  [s.lib, ...s.walkers.map((p) => p.g)].forEach((o) => c3Layer(o, C3.L_FOCUS));
  c3Env(scene, { top: '#9cc8f0', mid: '#f0e8dc', bot: '#a89a84', cards: [[0, 30, -30, 40, 8, '#ffffff'], [-30, 10, 10, 10, 18, '#cfe6ff'], [30, 12, -10, 10, 18, '#fff0d8']] });
  c3Shadows(scene, s.key, 70, { res: 2048 });
  return s;
}

// ---- the hall: warm wood floor, white walls, side shelves with portraits above, the NEW RELEASES wall at the back,
// the display case in the middle (front glass at z 1.6), the rules sign on a stand at the right
function libBuildHall() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 600), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff2e4', ambI: 0.6, sky: '#fff4e0', ground: '#b88a5a', key: '#fff0d8', keyI: 0.95, keyP: [10, 30, 24], rim: '#ffd8a8', rimI: 0.45, rimP: [-14, 18, -20] });
  const wood = libTexWood(); wood.repeat.set(10, 22);
  scene.add(pl(40, 120, c3Prop('#c88a58', { map: wood, rough: 0.35, env: 0.8 }), 0, 0, -20, 0, -Math.PI / 2));
  const wallM = c3Prop('#2f8a8a', { rough: 0.8 });
  scene.add(pl(40, 40, wallM, 0, 20, -40)); scene.add(pl(120, 40, wallM, -9.4, 20, -20, Math.PI / 2)); scene.add(pl(120, 40, wallM, 9.4, 20, -20, -Math.PI / 2));
  scene.add(pl(40, 120, c3Prop('#f2e2c4', { rough: 0.9 }), 0, 24, -20, 0, Math.PI / 2));
  for (let i = 0; i < 8; i++) { const p = pl(6, 1.0, c3Flat('#fffaf0', { glow: '#fff2d0' }), 0, 23.9, -36 + i * 7, 0, Math.PI / 2); scene.add(p); }   // ceiling light strips
  // shelves: two long runs along the side walls and the NEW RELEASES wall at the back, all full of books
  const shelfM = c3Prop('#9a6236', { rough: 0.5 }), BC = ['#d8322a', '#2a6ad8', '#f2c230', '#3aa05a', '#8a4ad8', '#f27a2a', '#1aa8a8', '#f6f2ea', '#2a2e38', '#e85a8a'];
  const shelfRun = (g, len, rows, seed) => {   // along +x, books standing on each board
    for (let r = 0; r <= rows; r++) g.add(rb(len, 0.35, 2.4, shelfM, 0, r * 2.8 + 0.2, 0, 0.03));
    for (const x of [-len / 2, len / 2]) g.add(rb(0.4, rows * 2.8 + 0.6, 2.4, shelfM, x, (rows * 2.8 + 0.6) / 2, 0, 0.03));
    g.add(rb(len, rows * 2.8 + 0.6, 0.2, c3Toon('#6a3e1e'), 0, (rows * 2.8 + 0.6) / 2, -1.15, 0));
    for (let r = 0; r < rows; r++) { const R = RNG('books', seed, r); let x = -len / 2 + 0.5;
      while (x < len / 2 - 0.8) { const w = R.r(0.38, 0.62), h = R.r(1.7, 2.35), b = libBook(BC[R.i(0, BC.length - 1)], { w, h, d: 1.6 }); b.position.set(x + w / 2, r * 2.8 + 0.38, 0.1); b.rotation.z = R.f() < 0.06 ? 0.18 : 0; g.add(b); x += w + 0.04; } } };
  s.left = new THREE.Group(); shelfRun(s.left, 46, 4, 'L'); s.left.position.set(-8, 0, -16); s.left.rotation.y = Math.PI / 2; scene.add(s.left);
  s.right = new THREE.Group(); shelfRun(s.right, 46, 4, 'R'); s.right.position.set(8, 0, -16); s.right.rotation.y = -Math.PI / 2; scene.add(s.right);
  s.back = new THREE.Group(); shelfRun(s.back, 18, 4, 'B'); s.back.position.set(0, 0, -38.6); scene.add(s.back);
  s.back.add(pl(16, 3.4, c3Flat('#ffffff', { map: libTexBanner('NEW RELEASES', '#d8322a', '#ffe8a0') }), 0, 14.2, 0.2));
  // portraits of famous living writers above the side shelves, gold plaques under each
  s.portraits = [];
  for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, z = -32 + Math.floor(i / 2) * 9.5, g = new THREE.Group();
    g.add(rb(5.2, 6.4, 0.3, c3Prop('#e0b030', { rough: 0.25, metal: 0.7, env: 1.5 }), 0, 0, -0.1, 0.03)); g.add(pl(4.6, 5.8, c3Prop('#ffffff', { map: libTexPortrait(i), rough: 0.6 }), 0, 0, 0.08));
    g.add(pl(3.4, 0.95, c3Prop('#ffffff', { map: libTexPlaque(['BESTSELLER', 'NEW', 'PRIZE WINNER', 'NEW', 'BESTSELLER', 'NEW', 'PRIZE WINNER', 'NEW'][i]), rough: 0.3, metal: 0.4 }), 0, -3.9, 0.1));
    g.position.set(side * 9.25, 16.2, z); g.rotation.y = -side * Math.PI / 2; scene.add(g); s.portraits.push(g); }
  // the display case: a white pedestal, a glass box on top with a brand-new book standing on a little easel
  s.case = new THREE.Group(); s.case.position.set(0, 0, 2); scene.add(s.case);
  s.case.add(rb(3.4, 4.6, 3.4, c3Prop('#f2e8d6', { rough: 0.5 }), 0, 2.3, 0, 0.04)); s.case.add(rb(3.6, 0.3, 3.6, c3Prop('#e0b030', { rough: 0.25, metal: 0.7 }), 0, 4.55, 0, 0.02));
  s.glassM = c3Prop('#d8f0ff', { rough: 0.04, metal: 0.15, env: 2.0, transparent: true }); s.glassM.opacity = 0.18; s.glassM.depthWrite = false;
  s.glass = new THREE.Mesh(c3RBox(3.2, 3.6, 3.2, 0.05), s.glassM); s.glass.position.set(0, 6.4, 0); s.glass.renderOrder = 8; s.case.add(s.glass);   // no ink hull: it showed as a dark box
  { const eM = c3Prop('#c8ccd6', { rough: 0.25, metal: 0.8, env: 1.6 }); for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) s.case.add(rb(0.1, 3.6, 0.1, eM, x, 6.4, z, 0.012));
    for (const y of [4.6, 8.2]) for (const [w, d, x, z] of [[3.3, 0.1, 0, -1.6], [3.3, 0.1, 0, 1.6], [0.1, 3.3, -1.6, 0], [0.1, 3.3, 1.6, 0]]) s.case.add(rb(w, 0.1, d, eM, x, y, z, 0.012)); }
  s.caseBook = libBook('#2a6ad8', { w: 1.4, h: 2.0, d: 0.35 }); s.caseBook.position.set(0, 4.75, -0.2); s.caseBook.rotation.set(-0.15, 0, 0); s.case.add(s.caseBook);
  s.caseBook.add(pl(1.1, 0.5, c3Flat('#ffffff', { map: libTexPlaque('NEW') }), 0, 1.15, 0.2));
  s.ripple = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.8, 32), c3Flat('#ffffff', { transparent: true, depthWrite: false })); s.ripple.material.opacity = 0; s.ripple.renderOrder = 9; s.case.add(s.ripple);
  // the rules sign on a stand, with the stamp
  s.signCv = Object.assign(document.createElement('canvas'), { width: 640, height: 820 }); s.signTex = new THREE.CanvasTexture(s.signCv); s.signTex.encoding = THREE.sRGBEncoding;
  s.sign = new THREE.Group(); scene.add(s.sign);
  s.sign.add(rb(4.6, 5.8, 0.3, c3Toon('#2a2e38'), 0, 7.6, 0, 0.04)); s.sign.add(pl(4.2, 5.4, c3Flat('#ffffff', { map: s.signTex }), 0, 7.6, 0.17));
  s.sign.add(cyl(0.16, 0.16, 4.8, c3Prop('#9aa0ae', { metal: 0.8, rough: 0.3 }), 0, 2.4, -0.1, 0.02, 10)); s.sign.add(cyl(1.2, 1.3, 0.25, c3Toon('#2a2e38'), 0, 0.12, -0.1, 0.02, 20));
  // chains across the NEW RELEASES wall (an X), the padlock where they cross
  s.chainA = libChain(34); s.chainB = libChain(34); s.back.add(s.chainA); s.back.add(s.chainB);
  s.lock = libPadlock(); s.back.add(s.lock);
  // people
  s.you = c3Person({ key: 'you', outfit: 'hoodie', hairStyle: 'tuft' }); s.you.g.scale.setScalar(LIB_K); scene.add(s.you.g);
  s.libr = c3Person({ key: 'librarian', outfit: 'cardigan', hairStyle: 'bun', fx: ['glasses'] }); s.libr.g.scale.setScalar(LIB_K); scene.add(s.libr.g);
  s.writer = c3Person({ key: 'writer', outfit: 'sweater', hairStyle: 'ginger', fx: ['beard_full'] }); s.writer.g.scale.setScalar(LIB_K); scene.add(s.writer.g);
  // the writer's zipper (on the face, over the mouth) and his manuscript (held at his side, half behind his body)
  s.zipCv = Object.assign(document.createElement('canvas'), { width: 256, height: 96 }); s.zipTex = new THREE.CanvasTexture(s.zipCv); s.zipTex.encoding = THREE.sRGBEncoding;
  const D = 0.915 * s.writer.HS;
  s.zip = new THREE.Mesh(new THREE.PlaneGeometry(D * 0.46, D * 0.46 * 96 / 256), new THREE.MeshBasicMaterial({ map: s.zipTex, transparent: true, depthWrite: false, toneMapped: false }));
  s.zip.position.set(0, -0.165 * D, 0.036); s.zip.renderOrder = 4; s.writer.headG.add(s.zip);
  s.manu = new THREE.Group(); s.manu.add(rb(1.5, 2.0, 0.3, c3Toon('#f6efe0'), 0, 0, 0, 0.025)); s.manu.add(pl(1.4, 1.86, c3Flat('#ffffff', { map: libTexManu() }), 0, 0, 0.16));
  s.manu.add(rb(1.56, 0.12, 0.34, c3Toon('#b8261e'), 0, 0.3, 0, 0)); s.writer.root.add(s.manu);
  // a little white "bonk" star at the glass and the shrug arrows: sprites from the kit extras are on the heads already
  [s.case, s.sign, s.back, s.you.g, s.libr.g, s.writer.g].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = {
    shelfEnd: (() => { const g = new THREE.Group(); shelfRun(g, 4, 4, 'fg'); return g; })(),
    plant: (() => { const g = new THREE.Group(); g.add(cyl(1.2, 0.9, 2.2, c3Toon('#f6f2ea'), 0, 0, 0, 0.04, 16)); for (let i = 0; i < 9; i++) { const R = RNG('fgplant', i), l = c3Mesh(libSph(), c3Toon(i % 2 ? '#3a9a4a' : '#5ab85a'), 0.03); l.scale.set(0.5, 2.2, 0.3); l.position.set(R.n(0.9), 2.6, R.n(0.5)); l.rotation.z = R.n(0.6); g.add(l); } return g; })(),
    books: (() => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const b = libBook(BC[i * 2], { w: 2.4, h: 0.6, d: 1.8 }); b.rotation.z = Math.PI / 2; b.position.set(0.2 * (i % 2), i * 0.62, 0); b.rotation.set(0, 0.2 * i, 0); g.add(b); } return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff4e0', mid: '#f0dcc0', bot: '#8a6a4a', cards: [[0, 30, -30, 40, 8, '#ffffff'], [-30, 10, 10, 10, 18, '#fff0d8'], [30, 12, -10, 10, 18, '#ffe8c8']] });
  c3Shadows(scene, s.key, 40, { res: 2048 });
  return s;
}
const libExt = () => LIB.ext ||= libBuildExt();
const libHall = () => LIB.hall ||= libBuildHall();
const libRenderExt = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#9cc8f0', bgBlur: 2.2, nearBlur: 10, glow: 0.5, glowBlur: 14, bloom: 0.16 }, o));
const libRenderHall = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#f4efe6', bgBlur: 2.4, nearBlur: 10, glow: 0.6, glowBlur: 16, bloom: 0.18 }, o));
// per-frame hall state: everything shot-specific hidden, the chains/lock/stamp at rest (open/absent)
function libHallReset(s) {
  [s.you.g, s.libr.g, s.writer.g, s.chainA, s.chainB, s.lock].forEach((o) => { o.visible = false; });
  s.ripple.material.opacity = 0; s.sign.visible = true; libSignDraw(s, 0);
}
const LIB_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const libWalkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });

// =====================================================================
//  s01 — "There's a library in Norway": low over the stone plaza, the camera rises and pushes toward the library on
//  the fjord; boats bob, a few people stroll, a lamp post and leaves slide past in the foreground
// =====================================================================
const LIB_K01 = [[0, [-12, 7, 82], [-2, 17, -30], 46], [1.3, [-6, 10, 70], [-2, 18, -30], 44]];
SHOT_FN['s01'] = (t, u, lt) => {
  const s = libExt();
  s.boats.forEach((b, i) => { b.rotation.z = 0.04 * Math.sin(t * 1.6 + i); b.position.y = 0.3 * Math.sin(t * 1.3 + i * 2); b.position.x = -90 + i * 95 + t * (1 + i * 0.4); });
  c3SetCam(s.cam, libCam(LIB_K01, lt, 's01', { orbit: 0.06, creep: 0.06 }));
  [[-20, 18, 1.1], [-7, 30, -1.0], [1, 22, 0.8]].forEach(([x, z, dir], i) => { const p = s.walkers[i], k = t * 6 + i, x2 = x + dir * t * 2.2;
    p.g.position.set(x2, LIB_FOOT, z); c3PersonPose(p, s.cam, t, { expr: 'happy', ...libWalkFeet(k), hand: { armL: [1.2 + 0.25 * Math.sin(k), -0.2], armR: [-1.2 - 0.25 * Math.sin(k), -0.2] } }); });
  libFg(s, [['leaf', [-4.6, 7.4, -9], 1.2]], LIB_K01, 's01', lt, { orbit: 0.06, creep: 0.06 });
  libRenderExt(s, { bgBlur: libRack(lt, 's01', 1.6, 2.6) });
};

// =====================================================================
//  s02 — "full of brand new books by some of the most famous writers alive,": inside, the camera glides down the aisle
//  between the shelves toward the NEW RELEASES wall; the portraits of the writers line the walls above; books glint
// =====================================================================
const LIB_K02 = [[0, [3.0, 9, 10], [-9, 14, -16], 48], [3.4, [2.2, 10.5, -4], [-4, 12.5, -38], 48]];
SHOT_FN['s02'] = (t, u, lt) => {
  const s = libHall(); libHallReset(s); s.sign.visible = false;
  c3SetCam(s.cam, libCam(LIB_K02, lt, 's02', { orbit: 0.02, creep: 0.04 }));
  // the portraits look a little alive: each nods into place as the camera reaches it
  s.portraits.forEach((g, i) => { g.scale.setScalar(1 + 0.06 * Math.max(0, Math.sin(clamp((t - 2.9 - i * 0.08) * 3) * Math.PI))); });
  s.case.visible = false;
  libFg(s, [['plant', [4.4, -7.4, -11], 1.0]], LIB_K02, 's02', lt, { orbit: 0.02, creep: 0.04 });
  libRenderHall(s, { bgBlur: libRack(lt, 's02', 2.6, 1.8) });
  s.portraits.forEach((g) => g.scale.setScalar(1));
};

// =====================================================================
//  s03 — "and nobody's allowed to read them.": in front of the NEW RELEASES wall two chains whip in from the sides
//  (an X), a big padlock drops onto the crossing and its shackle snaps shut on "allowed"; the sign at the right gets
//  a red NO READING stamp on "read"
// =====================================================================
const LIB_K03 = [[0, [1.2, 9.6, -1], [0.8, 8.4, -38], 44], [1.4, [0.8, 9.4, -2.6], [0.8, 8.2, -38], 43]];
SHOT_FN['s03'] = (t, u, lt) => {
  const s = libHall(); libHallReset(s); s.case.visible = false;
  c3SetCam(s.cam, libCam(LIB_K03, lt, 's03', { orbit: 0.03 }));
  const tChain = libW('nobodys', 1, 4.9), tLock = libW('allowed', 1, 5.4), tStamp = libW('read', 1, 5.7);
  // chains: each slides in along its own diagonal from off the shelf's edge to cross at the centre (13 m long each)
  const ca = EZ.o3(clamp((t - (tChain - 0.15)) / 0.4)), cb = EZ.o3(clamp((t - (tChain - 0.05)) / 0.4)), ang = 0.36, L = 33 * 0.9;
  for (const [c, k, sd] of [[s.chainA, ca, 1], [s.chainB, cb, -1]]) { c.visible = k > 0; const dir = libV(Math.cos(ang) * sd, -Math.sin(ang), 0);
    const end = libV(0, 6.6, 1.5).addScaledVector(dir, -L / 2), slide = (1 - k) * 30;
    c.position.copy(end).addScaledVector(dir, -slide); c.rotation.set(0, 0, sd > 0 ? -ang : Math.PI + ang); }
  // the lock: drops from above, bounces, shackle closes on "allowed"
  const dl = clamp((t - (tLock - 0.45)) / 0.4); s.lock.visible = dl > 0;
  s.lock.position.set(0, 6.6 + 14 * (1 - EZ.back(dl)) - 0.9, 1.9); s.lock.rotation.z = 0.12 * Math.sin(clamp((t - tLock) * 2) * Math.PI * 3) * (1 - clamp(t - tLock));
  s.lock.shackle.position.y = 1.1 + 0.9 * (1 - EZ.o3(clamp((t - tLock) / 0.12)));
  // the sign
  s.sign.position.set(3.8, 0, -29); s.sign.rotation.y = -0.2; libSignDraw(s, clamp((t - (tStamp - 0.05)) / 0.18));
  libFg(s, [['books', [-4.6, -6.4, -9], -0.6]], LIB_K03, 's03', lt, { orbit: 0.03 });
  libRenderHall(s, { bgBlur: libRack(lt, 's03', 1.8, 1.2) });
};

// =====================================================================
//  s04 — "Not you.": you at the glass case reach for the new book — your fist hits the glass (bonk): it stops dead,
//  bounces back, a ripple runs over the pane; your face goes from hopeful to shocked
// =====================================================================
const LIB_K04 = [[0, [-1.6, 8, 17], [-1.6, 6.6, 2], 40], [0.7, [-1.0, 7.8, 15.5], [-1.4, 6.6, 2], 40]];
SHOT_FN['s04'] = (t, u, lt) => {
  const s = libHall(); libHallReset(s); s.case.visible = true; s.sign.visible = false;
  const tBonk = libW('you', 1, 6.4);
  c3SetCam(s.cam, libCam(LIB_K04, lt, 's04', { orbit: 0.04 }));
  s.you.g.visible = true; s.you.g.position.set(-4.2, LIB_FOOT, 2.6);
  // the reach: out toward the glass (its left face at world x -1.6 => local x (−1.6+4.2)/K ≈ 1.93), a hard stop, a bounce back
  const reach = EZ.io(clamp((t - 6.1) / (tBonk - 6.1))), back = t > tBonk ? 0.35 * Math.sin(clamp((t - tBonk) / 0.25) * Math.PI) : 0;
  const hx = lerp(1.1, 1.85, reach) - back;
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [tBonk, 'shocked']], t, 'you'), gaze: [0.9, 0.1], head: [t > tBonk ? -0.08 : 0, 0, 0],
    hand: { armL: [hx, 2.85], armR: [-1.0, 0.9] }, ...LIB_STAND, lift: (q) => (q > tBonk ? 0.12 * Math.exp(-(q - tBonk) * 9) * Math.sin((q - tBonk) * 40) : 0), x: t > tBonk ? ['sweat'] : [] });
  const rp = clamp((t - tBonk) / 0.35); s.ripple.material.opacity = rp > 0 ? 0.8 * (1 - rp) : 0;
  s.ripple.position.set(-1.62, 6.3, 0.6); s.ripple.rotation.y = -Math.PI / 2; s.ripple.scale.setScalar(0.5 + 1.6 * rp);
  libFg(s, [['plant', [-4.6, -5.4, -7], 1.4]], LIB_K04, 's04', lt, { orbit: 0.04 });
  libRenderHall(s, { bgBlur: 2.6 });
};

// =====================================================================
//  s05 — "Not the librarians.": on the other side of the case the librarian reaches too — bonk on the same glass;
//  she rubs her knuckles, then shrugs at us
// =====================================================================
const LIB_K05 = [[0, [1.8, 8, 17], [1.8, 6.8, 2], 40], [1.2, [1.2, 8.2, 15.6], [1.6, 7.0, 2], 40]];
SHOT_FN['s05'] = (t, u, lt) => {
  const s = libHall(); libHallReset(s); s.case.visible = true; s.sign.visible = false;
  const tBonk = libW('librarians', 1, 7.2) - 0.05, tShrug = tBonk + 0.35;
  c3SetCam(s.cam, libCam(LIB_K05, lt, 's05', { orbit: -0.04 }));
  s.libr.g.visible = true; s.libr.g.position.set(4.2, LIB_FOOT, 2.6);
  const reach = EZ.io(clamp((t - 6.8) / (tBonk - 6.8))), sh = EZ.back(clamp((t - tShrug) / 0.3));
  const back = t > tBonk ? 0.35 * Math.sin(clamp((t - tBonk) / 0.25) * Math.PI) : 0;
  const hand = t < tShrug ? { armR: [-(lerp(1.1, 1.85, reach) - back), 2.85], armL: [1.0, 0.9] } : { armR: [lerp(-1.85, -1.7, sh), lerp(2.85, 3.5, sh)], armL: [lerp(1.0, 1.7, sh), lerp(0.9, 3.5, sh)] };
  c3PersonPose(s.libr, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [tBonk, 'shocked'], [tShrug, 'unimpressed']], t, 'librarian'), gaze: t < tShrug ? [-0.9, 0.1] : [0, 0],
    head: [t > tShrug ? 0.12 * sh : 0, 0, 0], hand, ...LIB_STAND, lift: (q) => (q > tShrug ? 0.18 * Math.sin(clamp((q - tShrug) / 0.35) * Math.PI) : 0), x: t > tBonk && t < tShrug + 0.2 ? ['sweat'] : [] });
  const rp = clamp((t - tBonk) / 0.35); s.ripple.material.opacity = rp > 0 ? 0.8 * (1 - rp) : 0;
  s.ripple.position.set(1.62, 6.3, 0.6); s.ripple.rotation.y = Math.PI / 2; s.ripple.scale.setScalar(0.5 + 1.6 * rp);
  libFg(s, [['books', [3.6, -5.6, -7], -1.0]], LIB_K05, 's05', lt, { orbit: -0.04 });
  libRenderHall(s, { bgBlur: 2.6 });
};

// =====================================================================
//  s06 — "And the writers aren't allowed to show anyone, either.": a writer by the shelves zips his own mouth shut
//  (the pull slides across on "aren't allowed") and keeps his manuscript held at his side, half hidden behind him;
//  his eyes dart left and right, then he gives a tight little nod on "either"
// =====================================================================
const LIB_K06 = [[0, [-1.5, 8.6, 12], [-0.6, 7.6, -10], 42], [2.2, [1.2, 8.8, 8], [0, 7.8, -10], 40]];
SHOT_FN['s06'] = (t, u, lt) => {
  const s = libHall(); libHallReset(s); s.case.visible = false; s.sign.visible = false;
  const tZip = libW('arent', 1, 8.6), tShow = libW('show', 1, 9.2), tEither = libW('either', 1, 9.7);
  c3SetCam(s.cam, libCam(LIB_K06, lt, 's06', { orbit: 0.03 }));
  s.writer.g.visible = true; s.writer.g.position.set(0, LIB_FOOT, -10);
  // his right hand pulls the zipper tab across his mouth, then drops; the manuscript stays in his left fist, at his side,
  // its body behind his torso (z < 0) so only its edge and the wax seal peek out
  const zp = EZ.io(clamp((t - (tZip - 0.25)) / 0.5)), D = 0.915 * s.writer.HS, mouthY = s.writer.bodyH + s.writer.HS * 0.31 - 0.165 * D;
  const zipHand = t < tZip + 0.45 ? [lerp(-0.42, 0.42, zp) * D * 0.5, mouthY - 0.35] : [-1.0, 0.8];
  libZipDraw(s, zp);
  const side = [1.35, 1.55];
  c3PersonPose(s.writer, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [tZip + 0.3, 'whistling']], t, 'writer'),
    gaze: t > tShow ? [Math.sign(Math.sin((t - tShow) * 7)) * 0.8, 0] : [0, 0], head: [0, 0, t > tEither ? -0.08 * Math.sin(clamp((t - tEither) / 0.3) * Math.PI) : 0],
    hand: { armR: zipHand, armL: side }, ...LIB_STAND, x: t > tShow ? ['sweat'] : [] });
  s.manu.position.set(side[0] + 0.15, side[1] + 0.25, -0.32);   // wholly behind the body plane (no cut through it) s.manu.rotation.set(0, 0, -0.18);
  libFg(s, [['plant', [-4.2, -7.0, -10], 1.0]], LIB_K06, 's06', lt, { orbit: 0.03 });
  libRenderHall(s, { bgBlur: libRack(lt, 's06', 2.4, 3.0) });
};
