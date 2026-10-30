// =====================================================================
//  SET storea — the supermarket, part 1: s01–s10.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed sta.
//  One world, built once: a bright Dutch supermarket (floor y 0, ceiling y 19). The checkout lane runs along x at z 0:
//  a counter with a black conveyor belt (top y 5.0), a scanner window, a card terminal and a candy rack at its end; the
//  cashier sits behind it (z -3.4), customers queue in front (z +2.6). Behind the lane (z -14 .. -30) aisles of shelves
//  full of colourful products with hanging aisle signs; on the left (x -26) the dairy fridge with glowing glass doors
//  and milk cartons; a big wall clock high on the back wall. People are c3Person billboards at STA_K x; a standing
//  person's root sits at STA_FOOT. Props held by people live on the person's billboard root, at the real fist.
// =====================================================================
const STA = {};
const STA_K = 1.35, STA_FOOT = 2.55 * STA_K, STA_SEAT = 2.3, STA_BELT = 5.0;
const staW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const staV = (x, y, z) => new THREE.Vector3(x, y, z);
const staSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function staCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = staSpan(id), dur = b - a;
  const L = staV(...c.l), P = L.clone().add(staV(...c.p).sub(L).multiplyScalar(o.dist ?? 2.1)), d = L.clone().sub(P), dist = d.length(); d.normalize();   // keys are written close; every shot pulls back x2.1
  const off = P.clone().sub(L).applyAxisAngle(staV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const staRack = (lt, id, a, b) => { const [t0, t1] = staSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function staFg(s, list, K, id, lt, o = {}) {
  const c = STA.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  c3SetCam(c, staCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = staV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(staV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const staRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2a9a8a', bgBlur: 1.8, nearBlur: 10, glow: 0.6, glowBlur: 16, bloom: 0.22 }, o));
// a person's real fist, in its billboard root's space (the arm can stop short of the target)
function staFist(p, arm) { p.g.updateMatrixWorld(true); return p.root.worldToLocal(p.limbs[arm].e.getWorldPosition(staV(0, 0, 0))); }
// a canvas texture redrawn only when its state key changes (export workers draw any frame first)
function staCanvas(w, h) { const cv = Object.assign(document.createElement('canvas'), { width: w, height: h }), t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return { cv, t, key: null }; }
function staRedraw(C, key, draw) { if (C.key === key) return; C.key = key; draw(C.cv.getContext('2d'), C.cv.width, C.cv.height); C.t.needsUpdate = true; }
const STA_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const staWalkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });
const staRunFeet = (k) => ({ foot: { legL: [0.6 + 1.0 * Math.sin(k), -2.35 + 0.55 * Math.max(0, Math.cos(k))], legR: [-0.6 - 1.0 * Math.sin(k), -2.35 + 0.55 * Math.max(0, -Math.cos(k))] } });

// ---- textures
function staTexFloor() {   // big cream vinyl tiles with a soft sheen and grey grout
  const t = tex((x, w, h) => { x.fillStyle = '#e9e2d4'; x.fillRect(0, 0, w, h); const R = RNG('stfl');
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.fillStyle = (i + j) % 2 ? '#efe9dc' : '#e3dacb'; x.fillRect(i * w / 4 + 3, j * h / 4 + 3, w / 4 - 6, h / 4 - 6);
      for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(120,100,80,${R.r(0.03, 0.08)})`; x.fillRect(i * w / 4 + R.r(6, w / 4 - 10), j * h / 4 + R.r(6, h / 4 - 10), R.r(2, 6), R.r(2, 6)); } }
    x.fillStyle = 'rgba(150,140,128,0.9)'; for (let i = 0; i <= 4; i++) { x.fillRect(i * w / 4 - 3, 0, 6, h); x.fillRect(0, i * h / 4 - 3, w, 6); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); return t;
}
function staTexWall() {   // painted wall with a soft green band at the bottom
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6f1e6'); g.addColorStop(0.7, '#ece4d4'); g.addColorStop(0.71, '#4a9a6a'); g.addColorStop(0.78, '#3e8a5c'); g.addColorStop(0.79, '#e2d8c4'); g.addColorStop(1, '#d8cdb6'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 512);
}
// one shelf face full of products: rows of boxes, bottles, cans and bags with labels (deterministic per seed)
function staTexShelf(seed) {
  return tex((x, w, h) => { x.fillStyle = '#d8dde0'; x.fillRect(0, 0, w, h); const R = RNG('shelf', seed);
    const pal = ['#e8432e', '#f2b531', '#3a8ad8', '#2fa866', '#f07a2a', '#d23a7a', '#8a5ad8', '#f4e2a0', '#ffffff', '#24b0c0'];
    for (let r = 0; r < 5; r++) { const y0 = r * h / 5, hh = h / 5;
      x.fillStyle = '#c8ccd2'; x.fillRect(0, y0 + hh - 16, w, 16); x.fillStyle = '#ffeb3b'; for (let i = 0; i < 6; i++) x.fillRect(i * w / 6 + 12, y0 + hh - 14, 34, 11);   // shelf edge + yellow price tags
      let px = 6; while (px < w - 20) { const kind = R.i(0, 3), c = pal[R.i(0, pal.length - 1)], pw = kind === 1 ? R.r(18, 26) : R.r(28, 52), ph = kind === 1 ? hh * R.r(0.55, 0.75) : hh * R.r(0.45, 0.78);
        const yb = y0 + hh - 16;
        if (kind === 1) { x.fillStyle = c; x.beginPath(); x.roundRect(px, yb - ph, pw, ph, [pw * 0.4, pw * 0.4, 3, 3]); x.fill(); x.fillStyle = '#ffffff'; x.fillRect(px + 3, yb - ph * 0.55, pw - 6, ph * 0.25); }
        else if (kind === 2) { x.fillStyle = c; x.beginPath(); x.roundRect(px, yb - ph * 0.6, pw, ph * 0.6, 4); x.fill(); x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(px, yb - ph * 0.6, pw, 4); x.fillRect(px, yb - 6, pw, 4); }
        else { x.fillStyle = c; x.fillRect(px, yb - ph, pw, ph); x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.arc(px + pw / 2, yb - ph * 0.55, Math.min(pw, ph) * 0.24, 0, TAU); x.fill(); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px + pw - 5, yb - ph, 5, ph); }
        x.strokeStyle = 'rgba(30,20,10,0.55)'; x.lineWidth = 2; x.strokeRect(px, yb - (kind === 2 ? ph * 0.6 : ph), pw, kind === 2 ? ph * 0.6 : ph);
        px += pw + R.r(2, 6); } } }, 512, 640);
}
function staTexBelt() {   // black rubber conveyor with fine ribs
  const t = tex((x, w, h) => { x.fillStyle = '#1e2024'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 32; i++) x.fillRect(i * w / 32, 0, 3, h); }, 256, 64);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); return t;
}
function staTexMilk() {   // milk carton print: blue cow pattern band, MILK
  return tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2f7ad0'; x.fillRect(0, h * 0.55, w, h * 0.45);
    x.fillStyle = '#ffffff'; for (const [u, v, r] of [[0.2, 0.75, 0.08], [0.6, 0.85, 0.1], [0.85, 0.66, 0.06]]) { x.beginPath(); x.ellipse(u * w, v * h, r * w, r * w * 0.7, 0, 0, TAU); x.fill(); }
    inked(x, 'MILK', w / 2, h * 0.32, h * 0.2, '#2f7ad0', { stroke: false, maxW: w * 0.86 }); x.fillStyle = '#e83a2e'; x.fillRect(0, h * 0.5, w, h * 0.04); }, 256, 256);
}
function staTexClock(min) {   // wall clock face: hour hand near 9, minute hand at `min`
  return (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.46, 0, TAU); x.fill(); x.lineWidth = w * 0.05; x.strokeStyle = '#d8342a'; x.stroke();
    x.fillStyle = '#2a2a2a'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.save(); x.translate(w / 2 + Math.sin(a) * w * 0.38, h / 2 - Math.cos(a) * w * 0.38); x.rotate(a); x.fillRect(-w * 0.012, -w * 0.035, w * 0.024, w * 0.07); x.restore(); }
    const hand = (a, len, wd) => { x.save(); x.translate(w / 2, h / 2); x.rotate(a); x.fillStyle = '#1a1a1a'; x.beginPath(); x.roundRect(-wd / 2, -len, wd, len + wd, wd / 2); x.fill(); x.restore(); };
    hand((8 + min / 60) / 12 * TAU, w * 0.22, w * 0.05); hand(min / 60 * TAU, w * 0.33, w * 0.032); x.fillStyle = '#d8342a'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.03, 0, TAU); x.fill(); };
}
const staCover = (x, img, X, Y, w, h, dx = 0) => { if (!img) return false; const k = Math.max(w / img.width, h / img.height), iw = img.width * k, ih = img.height * k; x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.drawImage(img, X + (w - iw) / 2 + dx, Y + (h - ih) / 2, iw, ih); x.restore(); return true; };
function staTexGrandson() {   // a framed photo of a beaming grandson (Flow image, comic: gap-toothed grin, 'I love GRAMA' drawing — user rule: real images with a comic touch)
  return tex((x, w, h) => { x.fillStyle = '#7a4a22'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8c890'; x.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92);
    staCover(x, asset('img_grandson.jpg'), w * 0.08, h * 0.07, w * 0.84, h * 0.86); x.strokeStyle = '#2a1a10'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); }, 384, 480);
}
function staTexXray() {   // the x-ray of her new knee (Flow image, comic: smiley sticker on the shiny joint, 'NEW KNEE!' in marker)
  return tex((x, w, h) => { x.fillStyle = '#10161e'; x.fillRect(0, 0, w, h); staCover(x, asset('img_xray.jpg'), 6, 6, w - 12, h - 12); x.strokeStyle = '#5a6a7a'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); }, 320, 480);
}
// the thought cloud: the neighbour's ginger cat sneaking off with her pink slippers (k 0..1: the cat's run across)
function staDrawCatCloud(x, w, h, k) {
  x.clearRect(0, 0, w, h); x.lineWidth = 12; x.strokeStyle = '#1a1210'; x.fillStyle = '#fffaf0';
  const puffs = [[0.5, 0.42, 0.32], [0.26, 0.46, 0.22], [0.74, 0.46, 0.22], [0.38, 0.26, 0.2], [0.63, 0.25, 0.2], [0.5, 0.62, 0.22], [0.3, 0.64, 0.15], [0.7, 0.64, 0.16]];
  for (const pass of [0, 1]) for (const [u, v, r] of puffs) { x.beginPath(); x.arc(u * w, v * h, r * w * 0.5, 0, TAU); pass ? x.fill() : x.stroke(); }
  for (const [u, v, r] of [[0.42, 0.83, 0.042], [0.38, 0.95, 0.027]]) { x.beginPath(); x.arc(u * w, v * h, r * w, 0, TAU); x.fill(); x.stroke(); }   // the trail down to her head
  x.save(); x.beginPath(); x.ellipse(w * 0.5, h * 0.45, w * 0.36, h * 0.29, 0, 0, TAU); x.clip();   // the guilty ginger cat with her pink slippers (Flow photo, comic)
  if (!staCover(x, asset('img_cat.jpg'), w * 0.12, h * 0.14, w * 0.76, h * 0.6, lerp(30, -30, k))) { x.fillStyle = '#c8e0a0'; x.fillRect(0, 0, w, h); }
  x.restore();
}

// ---- props
function staMilk() {   // a 1-litre milk carton with a gable top
  const g = new THREE.Group(), m = c3Prop('#ffffff', { map: staTexMilk(), rough: 0.5 }), top = c3Prop('#f4f4f4', { rough: 0.5 });
  g.add(rb(0.62, 1.05, 0.62, m, 0, 0, 0, 0.02));
  const roof = c3Mesh(new THREE.CylinderGeometry(0.01, 0.44, 0.34, 4, 1), top, 0.02); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.98); roof.position.y = 0.69; g.add(roof);
  g.add(rb(0.62, 0.12, 0.05, top, 0, 0.88, 0, 0.01));
  return g;
}
function staBanana() {   // a curved yellow banana with brown tips
  const g = new THREE.Group(), pts = [];
  for (let i = 0; i <= 10; i++) { const a = -0.9 + i * 0.18; pts.push(staV(Math.sin(a) * 1.0, -Math.cos(a) * 1.0 + 1.0, 0)); }
  const body = c3Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.17, 10, false), c3Prop('#f6d23a', { rough: 0.45 }), 0.025); g.add(body);
  for (const p of [pts[0], pts[10]]) { const c = c3Mesh(new THREE.SphereGeometry(0.11, 8, 6), c3Toon('#5a3a1a'), 0.015); c.position.copy(p); g.add(c); }
  const stem = c3Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.3, 8), c3Toon('#7a9a3a'), 0.015); stem.position.copy(pts[10]).add(staV(0.1, 0.12, 0)); stem.rotation.z = -0.8; g.add(stem);
  return g;
}

// ---- the world
function staBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 500), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff6e8', ambI: 0.55, sky: '#ffffff', ground: '#a89070', key: '#fff4e2', keyI: 1.0, keyP: [8, 22, 16], rim: '#cfe4ff', rimI: 0.55, rimP: [-14, 14, -12] });
  const M = s.M = { steel: c3Prop('#c8d0d8', { rough: 0.3, metal: 0.7, env: 1.2 }), counter: stbMat('#e8ecee'), counterTop: stbMat('#cfd6d8', { metal: 0.5, rough: 0.3, env: 1.2 }), band: stbMat('#1fb3a8', { rough: 0.4 }),
    dark: c3Toon('#2a2e36'), white: c3Prop('#f4f2ee', { rough: 0.5 }), red: c3Prop('#d83a2e', { rough: 0.4 }), yellow: c3Prop('#f2c431', { rough: 0.45 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#e6f4ff', roughness: 0.05, transparent: true, opacity: 0.2, envMapIntensity: 1.4, depthWrite: false, side: THREE.DoubleSide }) };
  // floor, walls, ceiling with light panels
  const fl = pl(140, 140, c3Prop('#ffffff', { map: stbTexFloor(), rough: 0.35, metal: 0.05, env: 0.7 }), 0, 0, -10, 0, -Math.PI / 2); scene.add(fl);   // same store as set-storeb: its floor, walls and bands
  const wallM = stbMat('#2fbfa6');
  scene.add(pl(140, 19, wallM, 0, 9.5, -36)); scene.add(pl(140, 1.6, stbMat('#1fb3a8'), 0, 11.6, -35.9)); scene.add(pl(140, 0.5, stbMat('#ffd23a'), 0, 10.6, -35.9)); scene.add(pl(80, 19, wallM, -40, 9.5, -2, Math.PI / 2)); scene.add(pl(80, 19, wallM, 40, 9.5, -2, -Math.PI / 2));
  scene.add(pl(140, 140, stbMat('#ffe9a8'), 0, 19, -10, 0, Math.PI / 2));
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 5; j++) { const p = pl(5, 1.6, c3Flat('#ffffff', { glow: '#fffbe8' }), i * 11, 18.95, 18 - j * 11, 0, Math.PI / 2); scene.add(p); }
  // the aisles behind the lane: double-sided shelving runs with colourful products, end caps and hanging aisle signs
  const shelfTex = [0, 1, 2, 3, 4, 5].map((k) => staTexShelf(k));
  const shelfM = shelfTex.map((t) => c3Prop('#ffffff', { map: t, rough: 0.6 }));
  [-26, -13, 0, 13, 26].forEach((x, i) => { const g = new THREE.Group(); g.position.set(x, 0, -24); scene.add(g);
    g.add(rb(1.6, 11, 16, stbMat('#d8dde0'), 0, 5.5, 0, 0.04));
    g.add(pl(16, 10.4, shelfM[i % 6], 0.82, 5.4, 0, Math.PI / 2)); g.add(pl(16, 10.4, shelfM[(i + 3) % 6], -0.82, 5.4, 0, -Math.PI / 2));
    g.add(pl(1.6, 10.4, shelfM[(i + 1) % 6], 0, 5.4, 8.01));
    const sign = new THREE.Group(); sign.position.set(0, 15.5, 7); g.add(sign); sign.add(cyl(0.05, 0.05, 3.5, M.dark, -1.2, 1.9, 0, 0, 6)); sign.add(cyl(0.05, 0.05, 3.5, M.dark, 1.2, 1.9, 0, 0, 6));
    const [lbl, col] = [['BROOD', '#e88a3a'], ['GROENTE & FRUIT', '#3ab85a'], ['SNOEP', '#ff5a8a'], ['DRANKEN', '#a85ad8'], ['ZUIVEL', '#2a7ad8']][i];
    sign.add(rb(4.2, 1.5, 0.2, stbMat(col), 0, 0, 0, 0.03));
    for (const z of [0.11, -0.11]) sign.add(pl(3.9, 1.2, stbMat('#ffffff', { map: stbTexAisle(lbl, col) }), 0, 0, z, z < 0 ? Math.PI : 0));
  });
  // the dairy fridge on the left: glowing glass doors, milk cartons in rows
  s.fridge = new THREE.Group(); s.fridge.position.set(-31, 0, -6); s.fridge.rotation.y = Math.PI / 2; scene.add(s.fridge);
  const fbody = c3Prop('#e8ecf0', { rough: 0.4 });   // an open cabinet: back, sides, base and top — the glass doors close its front
  s.fridge.add(rb(18, 12, 0.8, fbody, 0, 6, -1.4, 0.04)); s.fridge.add(rb(0.6, 12, 3.6, fbody, -8.9, 6, 0, 0.04)); s.fridge.add(rb(0.6, 12, 3.6, fbody, 8.9, 6, 0, 0.04)); s.fridge.add(rb(18, 1.0, 3.6, fbody, 0, 0.5, 0, 0.04));
  s.fridge.add(pl(17, 10, c3Flat('#6a9ac0', { glow: '#2a5a88' }), 0, 6.2, -0.95));   // cool blue interior so the white cartons pop
  const milkTex = staTexMilk(), milkM = c3Prop('#ffffff', { map: milkTex, rough: 0.5 });
  const milkIM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 1.05, 0.62), milkM, 5 * 4 * 20); let mi = 0; const m4 = new THREE.Matrix4();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 20; c++) for (let d = 0; d < 1; d++) { m4.makeTranslation(-8 + c * 0.82, 2.2 + r * 2.4, 1.3 + d * 0.7); milkIM.setMatrixAt(mi++, m4); }
  milkIM.count = mi; s.fridge.add(milkIM);
  for (let r = 0; r < 4; r++) s.fridge.add(rb(17, 0.15, 1.4, M.steel, 0, 1.6 + r * 2.4, 1.3, 0.01));
  for (let d = 0; d < 4; d++) { s.fridge.add(rb(0.25, 10.4, 0.25, M.steel, -8.5 + d * 4.25 + 4.25, 6.2, 2.0, 0.01)); const gl = pl(4.2, 10, M.glass, -6.4 + d * 4.25, 6.2, 2.0); gl.renderOrder = 7; s.fridge.add(gl); }
  s.fridge.add(rb(18.4, 1.6, 3.8, c3Prop('#2f7ad0', { rough: 0.4 }), 0, 12.6, 0, 0.03));
  s.fridge.add(pl(8, 1.2, c3Flat('#ffffff', { map: tex((x2, w, h) => { x2.fillStyle = '#2f7ad0'; x2.fillRect(0, 0, w, h); inked(x2, 'FRESH DAIRY', w / 2, h / 2, h * 0.55, '#ffffff', { stroke: false }); }, 512, 80) }), 0, 12.6, 1.95));
  // the wall clock high on the back wall (s01 starts on it): 9:58 -> it's late
  s.clockC = staCanvas(512, 512); staRedraw(s.clockC, 'c', staTexClock(58));
  s.clock = new THREE.Group(); s.clock.position.set(-6, 15.6, -35.6); scene.add(s.clock);
  s.clock.add(cyl(2.25, 2.25, 0.4, M.red, 0, 0, 0, 0.04, 40)); s.clock.children[0].rotation.x = Math.PI / 2;
  s.clock.add(pl(4.2, 4.2, c3Flat('#ffffff', { map: s.clockC.t, transparent: true }), 0, 0, 0.22));
  // ---- the checkout lane (z 0): counter, belt, divider bars, scanner, terminal, bag area, candy rack, lane light
  s.lane = new THREE.Group(); scene.add(s.lane);
  s.lane.add(rb(14, STA_BELT - 0.3, 2.6, M.counter, 0, (STA_BELT - 0.3) / 2, 0, 0.05));
  s.lane.add(rb(14.4, 0.3, 2.9, M.counterTop, 0, STA_BELT - 0.15, 0, 0.03)); s.lane.add(rb(14.04, 0.9, 2.64, M.band, 0, STA_BELT - 1.1, 0, 0));
  s.belt = pl(9, 1.9, c3Prop('#ffffff', { map: staTexBelt(), rough: 0.7 }), -2.2, STA_BELT + 0.02, 0, 0, -Math.PI / 2); s.lane.add(s.belt);
  s.lane.add(rb(9.2, 0.25, 0.18, M.steel, -2.2, STA_BELT + 0.12, 1.05, 0.01)); s.lane.add(rb(9.2, 0.25, 0.18, M.steel, -2.2, STA_BELT + 0.12, -1.05, 0.01));
  s.lane.add(rb(2.2, 0.04, 1.5, c3Flat('#ff5040', { glow: '#ff3a2a' }), 3.4, STA_BELT + 0.03, 0, 0));
  { const dv = new THREE.Group(); dv.add(rb(0.3, 0.3, 1.9, stbMat('#f0c020'), 0, 0, 0, 0.015)); const f = pl(1.8, 0.24, stbMat('#ffffff', { map: stbTexDivider() }), 0.16, 0, 0, Math.PI / 2); dv.add(f); dv.position.set(-2.6, STA_BELT + 0.32, 0); s.lane.add(dv); }   // the scanner glass, red glow
  s.lane.add(rb(2.6, 0.12, 1.8, M.steel, 3.4, STA_BELT + 0.0, 0, 0.01));
  const term = new THREE.Group(); term.position.set(4.9, STA_BELT, 1.0); s.lane.add(term); term.add(cyl(0.1, 0.1, 0.9, M.dark, 0, 0.45, 0, 0.01, 8));
  term.add(rb(0.75, 1.1, 0.3, M.dark, 0, 1.3, 0, 0.02)); term.add(pl(0.6, 0.45, c3Flat('#9ae0ff', { glow: '#7ad0ff' }), 0, 1.5, 0.16));
  s.lane.add(rb(4.4, 0.6, 2.8, M.steel, 9.2, STA_BELT - 0.6, 0, 0.02));   // the bagging well
  // candy rack at the lane's entrance (x -10)
  const rack = new THREE.Group(); rack.position.set(-10.2, 0, 2.0); s.lane.add(rack); s.rack = rack; rack.add(rb(2.6, 7, 1.0, M.dark, 0, 3.5, 0, 0.03));
  rack.add(pl(2.4, 6.6, c3Prop('#ffffff', { map: staTexShelf(9), rough: 0.6 }), 0, 3.6, 0.51));
  // the lane light on a pole: a glowing "3"
  const pole = new THREE.Group(); pole.position.set(6.4, 0, -1.5); s.lane.add(pole); pole.add(cyl(0.14, 0.14, 13, M.steel, 0, 6.5, 0, 0.02, 10));
  pole.add(cyl(0.95, 0.95, 0.5, c3Flat('#ffe070', { glow: '#ffd040' }), 0, 13.4, 0, 0.03, 32)); pole.children[pole.children.length - 1].rotation.x = Math.PI / 2;
  pole.add(pl(1.3, 1.3, c3Flat('#ffffff', { map: tex((x2, w, h) => { x2.clearRect(0, 0, w, h); inked(x2, '3', w / 2, h / 2, h * 0.8, '#2a2a2a', { stroke: false }); }, 128, 128), transparent: true }), 0, 13.4, 0.27));
  // the neighbouring lanes (x +18) as set dressing, and the cashier's chair behind the counter
  for (const x of [-20, 20]) { const g = new THREE.Group(); g.position.set(x, 0, 0); scene.add(g); g.add(rb(14, STA_BELT - 0.3, 2.6, M.counter, 0, (STA_BELT - 0.3) / 2, 0, 0.05)); g.add(rb(14.4, 0.3, 2.9, M.counterTop, 0, STA_BELT - 0.15, 0, 0.03)); g.add(pl(9, 1.9, c3Prop('#ffffff', { map: staTexBelt(), rough: 0.7 }), -2.2, STA_BELT + 0.02, 0, 0, -Math.PI / 2)); }
  s.lane.add(cyl(0.9, 0.9, 0.35, c3Prop('#3a3a44', { rough: 0.6 }), 3.6, STA_SEAT + 1.3, -3.4, 0.02, 20));
  s.lane.add(cyl(0.12, 0.12, STA_SEAT + 1.2, M.steel, 3.6, (STA_SEAT + 1.2) / 2, -3.4, 0.01, 8));
  // ---- props
  s.milk = staMilk(); scene.add(s.milk);                                           // on its fridge shelf / in your fist
  s.banana = staBanana(); scene.add(s.banana);                                     // on the belt / in the cashier's fist
  s.photo = pl(1.25, 1.55, c3Prop('#ffffff', { map: staTexGrandson(), rough: 0.5 }), 0, 0, 0); s.photo.renderOrder = 6; scene.add(s.photo);
  s.xray = pl(1.3, 1.95, c3Flat('#ffffff', { map: staTexXray() }), 0, 0, 0); s.xray.renderOrder = 6; scene.add(s.xray);
  s.cloudC = staCanvas(1024, 768); s.cloud = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.8), new THREE.MeshBasicMaterial({ map: s.cloudC.t, transparent: true, depthWrite: false, toneMapped: false })); s.cloud.renderOrder = 9; scene.add(s.cloud);
  // sweat drop / sparkle sprites, cartoon "1" over the lane (s03)
  s.one = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: tex((x2, w, h) => { x2.clearRect(0, 0, w, h); x2.fillStyle = '#ffd24a'; x2.beginPath(); x2.arc(w / 2, h / 2, w * 0.46, 0, TAU); x2.fill(); x2.lineWidth = 12; x2.strokeStyle = '#2a1a10'; x2.stroke(); inked(x2, '1', w / 2, h * 0.53, h * 0.62, '#2a1a10', { stroke: false }); }, 256, 256), transparent: true, depthWrite: false, toneMapped: false }));
  s.one.renderOrder = 9; scene.add(s.one);
  s.zip = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex((x2, w, h) => { x2.clearRect(0, 0, w, h); x2.strokeStyle = 'rgba(255,255,255,0.9)'; x2.lineCap = 'round'; for (let i = 0; i < 4; i++) { x2.lineWidth = 10 - i; x2.beginPath(); x2.moveTo(w * 0.05, h * (0.2 + i * 0.2)); x2.lineTo(w * 0.95, h * (0.2 + i * 0.2)); x2.stroke(); } }, 256, 128), transparent: true, depthWrite: false, toneMapped: false }));
  s.zip.renderOrder = 4; scene.add(s.zip);   // speed lines behind you while you sprint (s02)
  // ---- people (FOCUS)
  s.you = c3Person({ key: 'you', outfit: 'tie', hairStyle: 'rk_darkfringe' }); s.you.g.scale.setScalar(STA_K); scene.add(s.you.g);
  s.lady = c3Person({ key: 'lady', outfit: 'grandma', hairStyle: 'curlygrey', fx: ['glasses_round'] }); s.lady.g.scale.setScalar(STA_K); scene.add(s.lady.g);
  s.cashier = c3Person({ key: 'cashier', outfit: 'polo', hairStyle: 'ponytail' }); s.cashier.g.scale.setScalar(STA_K); scene.add(s.cashier.g);
  // props that ride on a person's billboard (positioned at the real fist each frame)
  s.youMilk = staMilk(); s.youMilk.scale.setScalar(1 / STA_K); s.you.root.add(s.youMilk);
  s.camBanana = staBanana(); s.camBanana.scale.setScalar(0.85 / STA_K); s.cashier.root.add(s.camBanana);
  s.ladyPhoto = pl(1.25 / STA_K * 1.4, 1.55 / STA_K * 1.4, c3Prop('#ffffff', { map: staTexGrandson(), rough: 0.5 }), 0, 0, 0); s.ladyPhoto.renderOrder = 6; s.lady.root.add(s.ladyPhoto);
  s.ladyXray = pl(1.3 / STA_K * 1.4, 1.95 / STA_K * 1.4, c3Flat('#ffffff', { map: staTexXray() }), 0, 0, 0); s.ladyXray.renderOrder = 6; s.lady.root.add(s.ladyXray);
  [s.you.g, s.lady.g, s.cashier.g, s.milk, s.banana, s.photo, s.xray, s.cloud, s.one, s.zip, s.lane, s.clock].forEach((o) => c3Layer(o, C3.L_FOCUS));
  // ---- blurred foreground pieces (NEAR layer)
  s.fgBy = {
    cart: (() => { const g = new THREE.Group(); const wire = c3Prop('#c8d0d8', { rough: 0.3, metal: 0.7 }); g.add(rb(4, 2.4, 2.6, wire, 0, 0, 0, 0.03)); g.add(rb(4.2, 0.3, 0.3, c3Prop('#d83a2e', { rough: 0.4 }), 0, 1.6, 1.4, 0.02)); return g; })(),
    candy: (() => { const g = new THREE.Group(); g.add(rb(2.4, 6, 1, c3Toon('#2a2e36'), 0, 0, 0, 0.03)); g.add(pl(2.2, 5.6, c3Prop('#ffffff', { map: staTexShelf(11), rough: 0.6 }), 0, 0, 0.51)); return g; })(),
    plant: (() => { const g = new THREE.Group(); g.add(cyl(0.8, 0.6, 1.4, c3Prop('#c86a3a', { rough: 0.6 }), 0, -1, 0, 0.03, 16)); for (let i = 0; i < 7; i++) { const R = RNG('fgpl', i), l = c3Mesh(new THREE.SphereGeometry(0.7, 10, 8), c3Toon('#3a9a4a'), 0.02); l.scale.set(0.5, 1.4, 0.3); l.position.set(R.r(-0.7, 0.7), R.r(0, 1.2), R.r(-0.3, 0.3)); l.rotation.z = R.r(-0.6, 0.6); g.add(l); } return g; })(),
    basket: (() => { const g = new THREE.Group(); g.add(rb(3.2, 1.6, 2.0, c3Prop('#d83a2e', { rough: 0.45 }), 0, 0, 0, 0.03)); g.add(c3Mesh(new THREE.TorusGeometry(1.2, 0.08, 6, 20, Math.PI), c3Toon('#2a2e36'), 0.02)); g.children[1].position.y = 0.8; return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff2c8', mid: '#7cd0c4', bot: '#4a6a7a', cards: [[0, 30, 10, 30, 6, '#ffffff'], [-20, 12, 10, 8, 14, '#fff4e0'], [20, 12, -10, 8, 14, '#e8f4ff']] });
  c3ShadeScene(scene, { dark: 0.3 });   // Ricks soft shading (kit): lit tops, cooler darker bases
  c3Shadows(scene, s.key, 26);
  return s;
}
const staGet = () => STA.s ||= staBuild();
// per-frame world: hides everything shot-specific and resets the moving parts
function staWorld(s, t) {
  s.fridge.updateMatrixWorld(true);
  s.fg.forEach((f) => { f.visible = false; });   // a shot without foreground pieces must not inherit the last shot's
  [s.photo, s.xray, s.cloud, s.one, s.zip, s.youMilk, s.camBanana, s.ladyPhoto, s.ladyXray].forEach((o) => { o.visible = false; });
  s.you.g.visible = true; s.lady.g.visible = true; s.cashier.g.visible = true; s.milk.visible = true; s.banana.visible = true;
  s.you.root.rotation.z = 0; s.lady.root.rotation.z = 0; if (s.rack) s.rack.visible = true;
  // the milk waits on its fridge shelf (front row, under the second door); the banana lies on the belt by the scanner
  s.milk.position.copy(s.fridge.localToWorld(staV(-2.3, 6.98, 2.3))); s.milk.rotation.set(0, Math.PI / 2, 0); s.milk.scale.setScalar(1);
  s.banana.position.set(1.0, STA_BELT + 0.2, 0.1); s.banana.rotation.set(-Math.PI / 2 + 0.05, 0, 0.35); s.banana.scale.setScalar(0.85);
  // the belt creeps (texture offset) — the queue
  s.belt.material.map.offset.x = -t * 0.12;
  // the regulars: lady at the scanner end, cashier seated behind, you at the back of the queue
  s.lady.g.position.set(1.4, STA_FOOT, 2.7); s.cashier.g.position.set(3.6, STA_SEAT + 1.4 + 1.0, -3.4); s.you.g.position.set(-6.0, STA_FOOT, 3.0);
}
// the cashier is seated behind the counter: her legs never show (the counter hides them), pose her seated
const STA_SITC = { foot: { legL: [0.7, -1.6], legR: [-0.7, -1.6] } };
// the milk carton in your fist (left or right arm); the banana in the cashier's fist
function staMilkInFist(s, arm = 'armR') { const f = staFist(s.you, arm); s.youMilk.visible = true; s.youMilk.position.set(f.x, f.y + 0.22, f.z + 0.12); s.youMilk.rotation.set(0, 0.3, 0); }
function staBananaInFist(s, arm = 'armL', tilt = 0) { const f = staFist(s.cashier, arm); s.camBanana.visible = true; s.camBanana.position.set(f.x - 0.3, f.y - 0.25, f.z + 0.15); s.camBanana.rotation.set(0, 0, 0.5 + tilt); }
const staFace = (o, cam) => { o.quaternion.copy(cam.quaternion); };

// =====================================================================
//  s01 — "You're late. You grab one carton of milk,": the wall clock reads 9:58 (red, ticking); tilt down the dairy
//  aisle to you, who snatches one carton off the fridge shelf
// =====================================================================
const STA_K01 = [[0, [-14, 13.6, -20], [-6, 15.4, -35.6], 34], [0.7, [-17, 10.6, -6], [-28.6, 7.6, -6.4], 46], [2.0, [-18.6, 10.2, -2.6], [-28.2, 7.8, -6.0], 46]];
SHOT_FN['s01'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  staRedraw(s.clockC, t < 0.55 ? 'tick' + Math.floor(t * 4) % 2 : 'late', (x, w, h) => { staTexClock(t < 0.55 ? 58 + Math.floor(t * 4) % 2 : 59)(x, w, h); });
  c3SetCam(s.cam, staCam(STA_K01, lt, 's01', { orbit: 0.0, creep: 0.03 }));
  s.lady.g.visible = false; s.cashier.g.visible = false;
  // you hurry up to the fridge and grab the carton on "grab"
  const tg = staW('grab', 1, 0.7), k = EZ.o2(clamp((t - 0.35) / 0.5));
  s.you.g.position.set(lerp(-20, -25.4, k), STA_FOOT, lerp(-0.6, -4.6, k));
  const reach = clamp((t - (tg - 0.15)) / 0.3), took = t > tg + 0.12;
  const handR = took ? [-1.4 + 0.3 * clamp((t - tg - 0.12) / 0.3), 0.6] : [lerp(-1.2, -2.6, EZ.o2(reach)), lerp(-0.4, 1.0, EZ.o2(reach))];
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'panic'], [tg, 'determined']], t, 'you'), gaze: [-0.8, 0.1], head: [0.05, 0, 0], hand: { armR: handR, armL: [1.3, -0.5] }, ...(t < 0.85 ? staWalkFeet(t * 12) : STA_STAND) });
  if (took) { s.milk.visible = false; staMilkInFist(s, 'armR'); }
  staFg(s, [], STA_K01, 's01', lt);   // no foreground here: the tilt from the clock would sweep it across you
  staRender(s, { bgBlur: staRack(lt, 's01', 1.0, 2.2) });
};

// =====================================================================
//  s02 — "and you sprint to the checkout.": a running side-track along the front of the lanes, speed lines behind you
// =====================================================================
const STA_K02 = [[0, [-16, 7.6, 15], [-16, 7.2, 1.6], 50], [1.2, [-8.4, 7.6, 15], [-8.0, 7.0, 1.6], 50]];
SHOT_FN['s02'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  c3SetCam(s.cam, staCam(STA_K02, lt, 's02', { orbit: 0.0, creep: 0.02 })); s.rack.visible = false;
  const k = clamp(lt / 1.2), x = lerp(-16.5, -7.6, k);   // starts where the s01 dissolve leaves you: centre frame, never popping across
  s.you.g.position.set(x, STA_FOOT + 0.25 * Math.abs(Math.sin(lt * 16)), 3.2); s.you.root.rotation.z = -0.12;
  c3PersonPose(s.you, s.cam, t, { expr: 'determined', gaze: [1, 0], head: [0.08, 0, 0], hand: { armR: [-1.0 + 0.8 * Math.sin(lt * 16), 0.3], armL: [1.0 - 0.8 * Math.sin(lt * 16), -0.2] }, ...staRunFeet(lt * 16) });
  staMilkInFist(s, 'armR');
  s.zip.visible = false; s.zip.scale.set(3.4, 2.4, 1); s.zip.position.set(x - 3.6, STA_FOOT + 4.6, 3.0); staFace(s.zip, s.cam);   // user: no speed-line streaks behind him
  staFg(s, [['cart', [-4.6, -5.2, -8], 2.2], ['plant', [5.0, -5.0, -8.5], 1.6]], STA_K02, 's02', lt, { orbit: 0 });   // low and at the edges: never over you
  staRender(s, { bgBlur: 2.6 });
};

// =====================================================================
//  s03 — "There's just one person ahead of you.": over your shoulder down the lane: just the old lady at the belt; a
//  golden "1" pops over her head on "one"
// =====================================================================
const STA_K03 = [[0, [-11.4, 9.6, 9.6], [0.6, 7.2, 1.4], 44], [1.6, [-10.0, 9.4, 8.4], [1.0, 7.2, 1.2], 44]];
SHOT_FN['s03'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  c3SetCam(s.cam, staCam(STA_K03, lt, 's03', { orbit: 0.02 })); s.rack.visible = false;   // the glide from s02 passes right behind the candy rack: keep it out of this long take
  { const k3 = EZ.io(clamp(lt / 0.5)); s.you.g.position.set(lerp(-7.6, -6.4, k3), STA_FOOT, lerp(3.2, 3.6, k3)); }   // long take from s02: you skid to a stop from exactly where the sprint ended
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'relieved'], [staW('one', 2, 3.6), 'happy']], t, 'you'), gaze: [1, 0], hand: { armR: [-1.2, -0.1], armL: [1.3, -0.6] }, ...STA_STAND });
  staMilkInFist(s, 'armR');
  c3PersonPose(s.lady, s.cam, t, { expr: 'happy', gaze: [0.6, 0], hand: { armL: [1.3, -0.4], armR: [-1.3, -0.4] }, ...STA_STAND });
  c3PersonPose(s.cashier, s.cam, t, { expr: 'smile', gaze: [-0.8, -0.2], hand: { armL: [1.4, -0.2], armR: [-1.4, -0.2] }, ...STA_SITC });
  const t1 = staW('one', 2, 3.6), kk = EZ.back(clamp((t - t1) / 0.25));
  s.one.visible = t > t1; s.one.scale.setScalar(Math.max(1e-3, kk)); s.one.position.set(1.4, 13.2 + 0.15 * Math.sin(t * 6), 2.7); staFace(s.one, s.cam);
  staFg(s, [['candy', [3.8, -3.0, -6.5], 1.2]], STA_K03, 's03', lt);
  staRender(s, { bgBlur: staRack(lt, 's03', 2.4, 1.8) });
};

// =====================================================================
//  s04 — "An old lady. With a single banana.": low on the belt: a long, empty conveyor and one banana gliding toward
//  the scanner; she stands smiling behind it
// =====================================================================
const STA_K04 = [[0, [-5.6, 7.4, 8.6], [1.6, 6.6, 1.2], 42], [1.8, [-4.6, 7.2, 7.8], [1.8, 6.6, 1.4], 40]];   // from the customer side, low over the belt: the divider, the lone banana, the lady behind it   // low along the belt, from the cashier's side
SHOT_FN['s04'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  c3SetCam(s.cam, staCam(STA_K04, lt, 's04', { orbit: 0.03, dist: 1.7 }));
  s.you.g.visible = false;
  const tb = staW('banana', 1, 6.0);
  s.banana.position.set(lerp(-1.6, 0.6, EZ.o2(clamp((t - 4.8) / 1.6))), STA_BELT + 0.2, 0.1);
  s.banana.scale.setScalar(1.5); if (t > tb) s.banana.scale.setScalar(1.5 * (1 + 0.12 * Math.max(0, 1 - (t - tb) / 0.3) * Math.sin((t - tb) * 30)));
  s.lady.g.position.set(3.4, STA_FOOT, 2.6);
  c3PersonPose(s.lady, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [tb - 0.1, 'happy']], t, 'lady'), gaze: [-0.5, -0.4], head: [0.06, 0, 0], hand: { armR: [-1.6, 0.3], armL: [1.3, -0.5] }, ...STA_STAND });   // her fist proudly beside her single banana
  c3PersonPose(s.cashier, s.cam, t, { expr: 'smile', gaze: [-1, -0.2], hand: { armL: [1.4, -0.2], armR: [-1.4, -0.2] }, ...STA_SITC });
  staFg(s, [['basket', [-3.0, -3.0, -6], 0.8]], STA_K04, 's04', lt);
  staRender(s, { bgBlur: staRack(lt, 's04', 2.6, 2.0) });
};

// =====================================================================
//  s05 — "Easy.": you, close, a smug little smirk and a shrug, the milk in your fist
// =====================================================================
const STA_K05 = [[0, [-6.3, 9.2, 10.4], [-6.3, 8.6, 3.6], 34], [0.6, [-6.1, 9.1, 9.6], [-6.3, 8.6, 3.6], 34]];
SHOT_FN['s05'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  c3SetCam(s.cam, staCam(STA_K05, lt, 's05', { orbit: 0.04, rush: 0.04 }));
  s.you.g.position.set(-6.3, STA_FOOT, 3.6);
  const sh = Math.sin(clamp(lt / 0.4) * Math.PI);
  c3PersonPose(s.you, s.cam, t, { expr: 'smug', gaze: [0.2, 0.1], head: [-0.06 + 0.05 * sh, 0, 0], hand: { armR: [-1.4, -0.2 + 0.25 * sh], armL: [1.4, -0.4 + 0.25 * sh] }, lift: (q) => 0.1 * Math.sin(clamp((q - 6.6) / 0.4) * Math.PI), ...STA_STAND });
  staMilkInFist(s, 'armR');
  staRender(s, { bgBlur: 3.0 });
};

// =====================================================================
//  s06 — "Then the cashier picks up the banana, and asks how her week was.": over the belt, the cashier lifts the banana
//  in her fist… and doesn't scan it; she leans in, chin on her other fist, all ears
// =====================================================================
const STA_K06 = [[0, [5.0, 9.4, 7.0], [2.2, 7.8, -1.6], 44], [3.0, [5.6, 9.4, 6.2], [2.4, 7.8, -1.8], 42]];
SHOT_FN['s06'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  c3SetCam(s.cam, staCam(STA_K06, lt, 's06', { orbit: 0.02 }));
  s.you.g.visible = false;
  const tp = staW('picks', 1, 8.0), ta = staW('asks', 1, 9.1), held = t > tp + 0.08;
  s.banana.visible = !held;
  const lift = EZ.o2(clamp((t - tp) / 0.35));
  c3PersonPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [ta, 'talking'], [ta + 0.9, 'happy']], t, 'cashier'), gaze: [-0.9, 0.1], head: [-0.04, 0, t > ta ? 0.1 : 0],
    hand: { armL: [lerp(1.5, 1.3, lift), lerp(-0.4, 1.6, lift)], armR: t > ta ? [-0.5, 0.6] : [-1.4, -0.2] }, ...STA_SITC });
  if (held) staBananaInFist(s, 'armL', 0.2 * Math.sin(t * 3));
  s.lady.g.position.set(-1.0, STA_FOOT, 2.8);
  c3PersonPose(s.lady, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [ta + 0.6, 'excited']], t, 'lady'), gaze: [0.9, 0.1], hand: { armL: [1.3, -0.3], armR: [-1.2, 0.2] }, ...STA_STAND });
  staFg(s, [['candy', [-3.6, -2.4, -6.5], 1.0]], STA_K06, 's06', lt);
  staRender(s, { bgBlur: staRack(lt, 's06', 2.2, 1.6) });
};

// =====================================================================
//  s07 — "And she tells her. All of it.": wide: the two of them chatting happily across the counter; behind, you in
//  line, the milk in your fist, the smile fading
// =====================================================================
const STA_K07 = [[0, [-4.4, 10.4, 17.2], [-1.2, 7.6, 0.6], 46], [1.5, [-3.4, 10.2, 15.6], [-1.0, 7.6, 0.6], 46]];   // centred on the trio (you were on the left edge)
SHOT_FN['s07'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  s.lady.g.position.set(-0.4, STA_FOOT, 2.8); s.you.g.position.set(-4.4, STA_FOOT, 3.2);   // clear of the cashier behind the counter
  c3SetCam(s.cam, staCam(STA_K07, lt, 's07', { orbit: 0.03 }));
  s.banana.visible = false; staBananaInFist(s, 'armL', 0.15 * Math.sin(t * 2));
  const tl = staW('All', 1, 11.2), talk = Math.sin(t * 9);
  c3PersonPose(s.lady, s.cam, t, { expr: c3FaceAt([[0, 'talking'], [tl, 'laugh'], [tl + 0.4, 'talking']], t, 'lady'), gaze: [0.9, 0.1], hand: { armL: [1.2 + 0.3 * talk, 0.6 + 0.3 * talk], armR: [-1.3, 0.4 - 0.3 * talk] }, ...STA_STAND });
  c3PersonPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'happy'], [tl, 'laugh']], t, 'cashier'), gaze: [-0.9, 0.1], hand: { armL: [1.5, 0.7], armR: [-0.5, 0.6] }, ...STA_SITC });
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [tl, 'unimpressed']], t, 'you'), gaze: [1, 0], hand: { armR: [-1.2, -0.1], armL: [1.4, -0.6] }, ...STA_STAND });
  staMilkInFist(s, 'armR');
  staFg(s, [['plant', [-4.0, -4.2, -8], 1.2], ['cart', [4.2, -4.6, -9], 1.4]], STA_K07, 's07', lt);
  staRender(s, { bgBlur: 1.8 });
};

// =====================================================================
//  s08 — "The grandson.": she whips out a framed photo of a beaming grandson and holds it up to the cashier
// =====================================================================
const STA_K08 = [[0, [-0.6, 10.2, 8.4], [1.2, 9.4, 2.4], 40], [0.8, [-0.2, 10.2, 7.8], [1.2, 9.4, 2.4], 38]];
SHOT_FN['s08'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  c3SetCam(s.cam, staCam(STA_K08, lt, 's08', { orbit: 0.04, dist: 2.4 }));
  s.you.g.visible = false; s.banana.visible = false; staBananaInFist(s, 'armL', 0);
  const tg = staW('grandson', 1, 12.0), up = EZ.back(clamp((t - (tg - 0.15)) / 0.25));
  c3PersonPose(s.lady, s.cam, t, { expr: 'love', gaze: [0.8, 0.2], head: [0.05, 0, 0], hand: { armL: [lerp(1.3, 0.9, up), lerp(-0.3, 2.6, up)], armR: [-1.3, -0.4] }, lift: (q) => 0.12 * Math.sin(clamp((q - tg) / 0.3) * Math.PI), ...STA_STAND });
  const f = staFist(s.lady, 'armL'); s.ladyPhoto.visible = true; s.ladyPhoto.position.set(f.x + 0.05, f.y + 0.75, f.z + 0.2); s.ladyPhoto.rotation.set(0, 0, -0.08);
  c3PersonPose(s.cashier, s.cam, t, { expr: 'starstruck', gaze: [-0.9, 0.2], hand: { armL: [1.5, 0.7], armR: [-0.5, 0.6] }, ...STA_SITC });
  staRender(s, { bgBlur: 2.6 });
};

// =====================================================================
//  s09 — "The new knee.": she swaps in an x-ray of her shiny new knee; the cashier winces/marvels
// =====================================================================
const STA_K09 = [[0, [0.2, 10.0, 8.2], [1.4, 9.2, 2.4], 40], [0.8, [0.6, 10.0, 7.6], [1.4, 9.2, 2.4], 38]];
SHOT_FN['s09'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  c3SetCam(s.cam, staCam(STA_K09, lt, 's09', { orbit: -0.04, dist: 2.4 }));
  s.you.g.visible = false; s.banana.visible = false; staBananaInFist(s, 'armL', 0);
  const tk = staW('knee', 1, 12.9), up = EZ.back(clamp((t - (tk - 0.3)) / 0.25));
  c3PersonPose(s.lady, s.cam, t, { expr: 'proud', gaze: [0.8, 0.2], hand: { armR: [lerp(-1.3, -0.9, up), lerp(-0.4, 2.6, up)], armL: [1.3, -0.4] }, ...STA_STAND });
  const f = staFist(s.lady, 'armR'); s.ladyXray.visible = true; s.ladyXray.position.set(f.x - 0.45, f.y + 0.95, f.z + 0.2); s.ladyXray.rotation.set(0, 0, 0.06);
  c3PersonPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'surprised'], [tk + 0.2, 'grimace']], t, 'cashier'), gaze: [-0.9, 0.2], hand: { armL: [1.5, 0.7], armR: [-0.4, 0.9] }, ...STA_SITC });
  staRender(s, { bgBlur: 2.6 });
};

// =====================================================================
//  s10 — "The neighbor's cat that keeps stealing her slippers.": a thought cloud over her head — the ginger cat
//  sneaking across a lawn with her pink slippers; the cashier gasps; behind them, you sag in line
// =====================================================================
const STA_K10 = [[0, [-2.0, 11.6, 14.4], [0.8, 10.4, 1.4], 46], [2.4, [-1.0, 11.4, 13.0], [1.0, 10.6, 1.4], 46]];
SHOT_FN['s10'] = (t, u, lt) => {
  const s = staGet(); staWorld(s, t);
  s.lady.g.position.set(-0.4, STA_FOOT, 2.8);   // clear of the cashier behind the counter
  c3SetCam(s.cam, staCam(STA_K10, lt, 's10', { orbit: 0.02 }));
  s.banana.visible = false; staBananaInFist(s, 'armL', 0.1 * Math.sin(t * 2));
  const tc = staW('cat', 1, 14.0), ts = staW('stealing', 1, 14.5), k = clamp((t - 13.35) / 2.3);
  c3PersonPose(s.lady, s.cam, t, { expr: c3FaceAt([[0, 'talking'], [ts, 'angry']], t, 'lady'), gaze: [0.9, 0.1], hand: { armL: [1.0, 0.9 + 0.25 * Math.sin(t * 10)], armR: [-1.0, 0.9 - 0.25 * Math.sin(t * 10)] }, ...STA_STAND });
  c3PersonPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'surprised'], [ts + 0.2, 'shocked']], t, 'cashier'), gaze: [-0.9, 0.4], hand: { armL: [1.5, 0.7], armR: [-0.5, 1.1] }, ...STA_SITC });
  c3PersonPose(s.you, s.cam, t, { expr: 'tired', gaze: [1, -0.2], head: [0.1, 0, 0], hand: { armR: [-1.1, -0.4], armL: [1.3, -0.8] }, ...STA_STAND });
  s.you.root.rotation.z = 0.06; staMilkInFist(s, 'armR');
  // the thought cloud grows out of her head on "cat"
  const pk = EZ.back(clamp((t - (tc - 0.25)) / 0.3));
  s.cloud.visible = t > tc - 0.25; staRedraw(s.cloudC, (Math.round(k * 60)).toString(), (x, w, h) => staDrawCatCloud(x, w, h, k));
  s.cloud.scale.setScalar(Math.max(1e-3, pk)); s.cloud.position.copy(s.lady.g.position).add(staV(-0.4, 9.8, 0.2)); staFace(s.cloud, s.cam);
  staFg(s, [['basket', [3.8, -4.6, -8], 1.0]], STA_K10, 's10', lt);
  staRender(s, { bgBlur: 1.8 });
};
