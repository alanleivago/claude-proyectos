// =====================================================================
//  SET storeb — the Dutch supermarket, second half of the checkout story: s11–s18 and the ending s28–s31.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed stb.
//  One world, built once (floor y 0, units = head radius ~0.22 m):
//    lane A, the CHAT CHECKOUT: a counter along x (-7..7) at z 0, top y 4.6, belt on its top from x -6.6 to 1.6, scanner at
//      x 2.4, bagging tray x 4..6.6, a speed dial (FAST..SLOW) on the cashier side at x 5.2; the lightbox sign on a pole at
//      x -7.6 over the lane; the cashier behind the counter (z -2.8), customers in front of it (z +2.6..3).
//    lane B, the next lane: the same counter at x 12..26 with an OPEN sign and a long queue (five shoppers) toward the camera.
//    behind: rows of colourful shelves (z -16), the back wall (z -22) with aisle signs and a big wall clock.
//  People are c3Person billboards at STB_K; a standing person's root sits at STB_FOOT.
// =====================================================================
const STB = {};
const STB_K = 1.35, STB_FOOT = 2.55 * STB_K, STB_TOP = 4.6;
const stbV = (x, y, z) => new THREE.Vector3(x, y, z);
const stbSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// the first time word w is spoken at or after t0 (banana / lane / checkout / says / you repeat)
const stbWA = (w, t0, fb) => { const x = WORDS.find((q) => q.s >= t0 - 0.05 && q.w.replace(/[^\w]/g, '').toLowerCase() === w.toLowerCase()); return x ? x.s : fb; };
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function stbCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = stbSpan(id), dur = b - a;
  const P = stbV(...c.p), L = stbV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(stbV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const stbRack = (lt, id, a, b) => { const [t0, t1] = stbSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function stbFg(s, list, K, id, lt, o = {}) {
  const c = STB.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  c3SetCam(c, stbCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = stbV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(stbV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const stbRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2a9a8a', bgBlur: 2.2, nearBlur: 10, glow: 0.6, glowBlur: 14, bloom: 0.22 }, o));

// ---- textures
function stbTexFloor() {   // light speckled vinyl tiles with a soft grout grid
  const t = tex((x, w, h) => { x.fillStyle = '#7cc6d8'; x.fillRect(0, 0, w, h); const R = RNG('stbfloor'), n = 4, cw = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = (i + j) % 2 ? '#62b6cc' : '#a4dce8'; x.fillRect(i * cw, j * cw, cw, cw); }
    for (let i = 0; i < 900; i++) { x.fillStyle = ['rgba(120,110,95,0.25)', 'rgba(170,150,120,0.25)', 'rgba(255,255,255,0.5)'][i % 3]; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
    x.strokeStyle = 'rgba(140,128,110,0.55)'; x.lineWidth = 3; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * cw, 0); x.lineTo(i * cw, h); x.moveTo(0, i * cw); x.lineTo(w, i * cw); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 12); return t;
}
function stbTexBelt() {   // the conveyor belt: dark rubber with ribs (the texture scrolls when it runs)
  const t = tex((x, w, h) => { x.fillStyle = '#2c3036'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(255,255,255,0.07)'; x.fillRect(i * w / 16, 0, w / 32, h); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(i * w / 16 + w / 32, 0, 3, h); } }, 512, 64);
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); return t;
}
function stbTexSign(lit) {   // the lane sign: CHAT CHECKOUT with two speech bubbles; unlit = dim grey glass
  return tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, lit ? '#1fb3a8' : '#5d6b6a'); g.addColorStop(1, lit ? '#118a82' : '#4a5554'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = lit ? '#fff6d8' : '#8a9594'; x.lineWidth = 14; x.strokeRect(10, 10, w - 20, h - 20);
    const bub = (cx, cy, r, c) => { x.fillStyle = c; x.beginPath(); x.ellipse(cx, cy, r * 1.25, r, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(cx - r * 0.5, cy + r * 0.7); x.lineTo(cx - r * 0.9, cy + r * 1.35); x.lineTo(cx - r * 0.05, cy + r * 0.85); x.fill();
      x.fillStyle = lit ? '#118a82' : '#4a5554'; for (const k of [-1, 0, 1]) { x.beginPath(); x.arc(cx + k * r * 0.45, cy, r * 0.13, 0, TAU); x.fill(); } };
    bub(w * 0.1, h * 0.42, h * 0.2, lit ? '#ffd23a' : '#8a9594'); bub(w * 0.9, h * 0.42, h * 0.2, lit ? '#ff8a5a' : '#8a9594');
    inked(x, 'CHAT CHECKOUT', w / 2, h * 0.43, h * 0.36, lit ? '#ffffff' : '#a8b2b1', { stroke: lit ? '#0b5f5a' : '#56605f', sw: h * 0.05, maxW: w * 0.68 });
    inked(x, 'KLETSKASSA · TAKE YOUR TIME', w / 2, h * 0.78, h * 0.13, lit ? '#fff3c4' : '#8a9594', { stroke: false, maxW: w * 0.7, weight: 700 });
  }, 1024, 320);
}
function stbTexOpen() {   // lane B: a green OPEN 2 lightbox
  return tex((x, w, h) => { x.fillStyle = '#2aa04a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#eaffd8'; x.lineWidth = 10; x.strokeRect(8, 8, w - 16, h - 16);
    inked(x, 'OPEN', w * 0.42, h * 0.52, h * 0.5, '#ffffff', { stroke: '#136a2a', sw: 10, maxW: w * 0.55 });
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(w * 0.82, h * 0.5, h * 0.3, 0, TAU); x.fill(); inked(x, '2', w * 0.82, h * 0.53, h * 0.42, '#2aa04a', { stroke: false }); }, 512, 192);
}
function stbTexClock() {   // the wall clock face: cream, numbers, a red brand ring
  return tex((x, w, h) => { const c = w / 2; x.fillStyle = '#d8322a'; x.beginPath(); x.arc(c, c, c, 0, TAU); x.fill(); x.fillStyle = '#fbf6ea'; x.beginPath(); x.arc(c, c, c * 0.86, 0, TAU); x.fill();
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = c * (i % 5 ? 0.78 : 0.72); x.strokeStyle = '#2a2420'; x.lineWidth = i % 5 ? 3 : 8; x.beginPath(); x.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); x.lineTo(c + Math.sin(a) * c * 0.82, c - Math.cos(a) * c * 0.82); x.stroke(); }
    for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU; inked(x, String(i), c + Math.sin(a) * c * 0.58, c - Math.cos(a) * c * 0.58, c * 0.17, '#2a2420', { stroke: false, weight: 800 }); } }, 512, 512);
}
function stbTexDial() {   // the belt speed dial on the cashier side: FAST (red, left) to SLOW (green, right) with a snail
  return tex((x, w, h) => { const c = w / 2; x.fillStyle = '#f4f0e6'; x.beginPath(); x.arc(c, c, c * 0.98, 0, TAU); x.fill(); x.strokeStyle = '#3a3430'; x.lineWidth = 10; x.stroke();
    const arc = (a0, a1, col) => { x.strokeStyle = col; x.lineWidth = c * 0.16; x.beginPath(); x.arc(c, c * 1.08, c * 0.62, a0, a1); x.stroke(); };
    arc(Math.PI * 1.08, Math.PI * 1.5, '#e8453a'); arc(Math.PI * 1.5, Math.PI * 1.92, '#3ab85a');
    inked(x, 'FAST', c * 0.42, c * 0.98, c * 0.17, '#c8281e', { stroke: false, weight: 900 }); inked(x, 'SLOW', c * 1.58, c * 0.98, c * 0.17, '#1e8a3a', { stroke: false, weight: 900 });
    // the snail under SLOW
    x.fillStyle = '#c8a46a'; x.beginPath(); x.ellipse(c * 1.5, c * 1.5, c * 0.24, c * 0.08, 0, 0, TAU); x.fill();
    x.fillStyle = '#e88a3a'; x.beginPath(); x.arc(c * 1.45, c * 1.36, c * 0.15, 0, TAU); x.fill(); x.strokeStyle = '#8a4a1a'; x.lineWidth = 6; x.beginPath();
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU * 1.6, r = c * 0.13 * (1 - i / 44); x.lineTo(c * 1.45 + Math.cos(a) * r, c * 1.36 + Math.sin(a) * r); } x.stroke();
    x.strokeStyle = '#8a6a3a'; x.lineWidth = 5; x.beginPath(); x.moveTo(c * 1.7, c * 1.46); x.lineTo(c * 1.76, c * 1.3); x.moveTo(c * 1.66, c * 1.46); x.lineTo(c * 1.68, c * 1.3); x.stroke();
    inked(x, 'BELT SPEED', c, c * 1.82, c * 0.12, '#3a3430', { stroke: false, weight: 800 }); }, 512, 512);
}
function stbTexAisle(txt, col) {   // a hanging aisle board
  return tex((x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(0, 0, w, h * 0.18);
    inked(x, txt, w / 2, h * 0.55, h * 0.5, '#ffffff', { stroke: 'rgba(0,0,0,0.35)', sw: 8, maxW: w * 0.86 }); }, 512, 160);
}
function stbTexCal() {   // the little desk calendar on the counter (s30): the week, today starred
  return tex((x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8453a'; x.fillRect(0, 0, w, h * 0.26);
    inked(x, 'THIS WEEK', w / 2, h * 0.14, h * 0.13, '#ffffff', { stroke: false, weight: 900 });
    ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].forEach((d, i) => { const cx = w * (0.1 + i * 0.133); inked(x, d, cx, h * 0.42, h * 0.11, '#5a4a3a', { stroke: false, weight: 800 });
      x.fillStyle = i === 3 ? '#ffd23a' : '#efe8da'; x.beginPath(); x.arc(cx, h * 0.68, w * 0.055, 0, TAU); x.fill(); });
    inked(x, '★', w * (0.1 + 3 * 0.133), h * 0.69, h * 0.17, '#e8453a', { stroke: false }); inked(x, 'BEST CHAT!', w * 0.5, h * 0.9, h * 0.1, '#e8453a', { stroke: false, weight: 900 }); }, 512, 320);
}
function stbTexMilk() {   // the milk carton's front: blue cow-print band, MELK
  return tex((x, w, h) => { x.fillStyle = '#f8fbff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a7ad8'; x.fillRect(0, h * 0.55, w, h * 0.45);
    x.fillStyle = '#1a1a1a'; for (const [u, v, r] of [[0.2, 0.68, 0.08], [0.7, 0.8, 0.1], [0.45, 0.9, 0.06]]) { x.beginPath(); x.ellipse(u * w, v * h, r * w, r * w * 0.7, 0.4, 0, TAU); x.fill(); }
    inked(x, 'MELK', w / 2, h * 0.32, h * 0.2, '#2a7ad8', { stroke: false, weight: 900 }); inked(x, '1 L', w / 2, h * 0.47, h * 0.09, '#5a6a7a', { stroke: false, weight: 800 }); }, 256, 384);
}
function stbTexDivider() {   // the next-customer bar on the belt
  return tex((x, w, h) => { x.fillStyle = '#f0c020'; x.fillRect(0, 0, w, h); inked(x, 'VOLGENDE KLANT', w / 2, h / 2, h * 0.55, '#3a2a10', { stroke: false, weight: 900, maxW: w * 0.92 }); }, 512, 64);
}

// ---- builders
const stbMat = (c, o = {}) => c3Prop(c, Object.assign({ rough: 0.55 }, o));
function stbBanana() {   // one cartoon banana: a curved tapered tube with brown tips
  const g = new THREE.Group(), pts = [];
  for (let i = 0; i <= 12; i++) { const a = -0.9 + i / 12 * 1.8; pts.push(stbV(Math.sin(a) * 1.0, (1 - Math.cos(a)) * 1.0, 0)); }
  const curve = new THREE.CatmullRomCurve3(pts), geo = new THREE.TubeGeometry(curve, 40, 0.2, 10, false), pos = geo.attributes.position;
  // taper the ends (scale each ring toward its centre line)
  for (let i = 0; i < pos.count; i++) { const ring = Math.floor(i / 11), u = ring / 40, c = curve.getPoint(u), k = 0.35 + 0.65 * Math.sin(Math.PI * u);
    pos.setXYZ(i, c.x + (pos.getX(i) - c.x) * k, c.y + (pos.getY(i) - c.y) * k, c.z + (pos.getZ(i) - c.z) * k); }
  geo.computeVertexNormals(); g.add(c3Mesh(geo, c3Prop('#ffd23a', { rough: 0.35, env: 1.2 }), 0.025));
  for (const u of [0, 1]) { const p = curve.getPoint(u), tip = c3Mesh(new THREE.SphereGeometry(0.08, 8, 6), c3Toon('#5a3a1a'), 0.01); tip.position.copy(p); g.add(tip); }
  g.rotation.x = -0.25; return g;
}
function stbCounter(s, x0, x1, o = {}) {   // a checkout counter along x at z 0 (front panel toward +z), with the belt and its rails
  const g = new THREE.Group(), w = x1 - x0, cx = (x0 + x1) / 2;
  const body = c3Mesh(c3RBox(w, STB_TOP, 2.6, 0.12), stbMat(o.col ?? '#e8ecee'), 0.03); body.position.set(cx, STB_TOP / 2, 0); g.add(body);
  const band = c3Mesh(c3RBox(w + 0.04, 0.9, 2.64, 0.1), stbMat(o.band ?? '#1fb3a8', { rough: 0.4 }), 0.0); band.position.set(cx, STB_TOP - 1.1, 0); g.add(band);
  const kick = c3Mesh(c3RBox(w + 0.04, 0.5, 2.5, 0.1), stbMat('#4a5258'), 0.0); kick.position.set(cx, 0.25, 0.08); g.add(kick);
  const top = c3Mesh(c3RBox(w + 0.2, 0.18, 2.8, 0.06), stbMat('#cfd6d8', { metal: 0.5, rough: 0.3, env: 1.2 }), 0.02); top.position.set(cx, STB_TOP, 0); g.add(top);
  const bx0 = x0 + 0.4, bx1 = o.beltEnd ?? x0 + w * 0.6, bm = new THREE.MeshStandardMaterial({ map: stbTexBelt(), roughness: 0.7 });
  const belt = new THREE.Mesh(new THREE.PlaneGeometry(bx1 - bx0, 1.9), bm); belt.rotation.x = -Math.PI / 2; belt.position.set((bx0 + bx1) / 2, STB_TOP + 0.1, 0); g.add(belt); g.belt = belt;
  for (const sz of [-1, 1]) { const rail = c3Mesh(c3RBox(bx1 - bx0, 0.22, 0.16, 0.05), stbMat('#b8c2c6', { metal: 0.7, rough: 0.25, env: 1.4 }), 0.01); rail.position.set((bx0 + bx1) / 2, STB_TOP + 0.2, sz * 1.02); g.add(rail); }
  // scanner glass + its frame, the bagging tray at the end
  const sx = bx1 + 0.8; g.scanX = sx;
  g.add(rb(1.3, 0.12, 1.9, stbMat('#5a6266', { metal: 0.4 }), sx, STB_TOP + 0.07, 0, 0.02));
  const glass = c3Mesh(new THREE.PlaneGeometry(1.0, 1.5), c3Flat('#c8202a', { glow: '#ff3a3a' }), 0); glass.rotation.x = -Math.PI / 2; glass.position.set(sx, STB_TOP + 0.14, 0); g.add(glass); g.scan = glass;
  const tower = rb(0.9, 1.4, 0.3, stbMat('#5a6266', { metal: 0.4 }), sx, STB_TOP + 0.75, -0.9, 0.02); g.add(tower);
  const tray = rb(x1 - sx - 0.9, 0.2, 2.2, stbMat('#b8c2c6', { metal: 0.6, rough: 0.3 }), (sx + 0.6 + x1) / 2, STB_TOP - 0.2, 0, 0.02); g.add(tray);
  return g;
}
// a supermarket shelf unit with product rows (deterministic)
function stbShelf(s, x, z, w, seed) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  g.add(rb(w, 10, 0.4, stbMat('#d8dde0'), 0, 5, -1.3, 0.02)); for (const sx of [-1, 1]) g.add(rb(0.3, 10.2, 3.0, stbMat('#c8cfd2'), sx * w / 2, 5.1, 0, 0.02));
  const R = RNG('stbshelf', seed), pal = ['#e8453a', '#ffd23a', '#2a7ad8', '#3ab85a', '#ff8a3a', '#a85ad8', '#f6f0e4', '#1fb3a8', '#ff5a8a'];
  for (let r = 0; r < 4; r++) { const y = 0.6 + r * 2.4; g.add(rb(w, 0.16, 2.6, stbMat('#eef1f2'), 0, y, 0, 0.01)); g.add(rb(w, 0.32, 0.08, stbMat(['#ffd23a', '#1fb3a8'][r % 2]), 0, y + 0.06, 1.32, 0));
    let px = -w / 2 + 0.3; while (px < w / 2 - 0.6) { const bw = R.r(0.5, 1.0), bh = R.r(0.9, 1.9), col = pal[R.i(0, pal.length - 1)], round = R.f() < 0.3;
      const m = round ? cyl(bw * 0.42, bw * 0.42, bh, stbMat(col, { rough: 0.35 }), px + bw / 2, y + 0.08 + bh / 2, R.r(-0.3, 0.6), 0.015, 12) : rb(bw, bh, R.r(0.8, 1.4), stbMat(col, { rough: 0.5 }), px + bw / 2, y + 0.08 + bh / 2, R.r(-0.2, 0.5), 0.015);
      g.add(m); px += bw + R.r(0.05, 0.2); } }
  s.scene.add(g); return g;
}
function stbCarton() {   // the milk carton (held in your fist): a box with a gable top and its label
  const g = new THREE.Group(), white = stbMat('#f8fbff', { rough: 0.6 });
  g.add(rb(0.9, 1.4, 0.9, white, 0, 0.7, 0, 0.02));
  const front = pl(0.84, 1.3, stbMat('#ffffff', { map: stbTexMilk() }), 0, 0.68, 0.46); g.add(front);
  const roof = c3Mesh(new THREE.CylinderGeometry(0.01, 0.64, 0.42, 4, 1), white, 0.02); roof.rotation.y = Math.PI / 4; roof.position.y = 1.6; g.add(roof);
  g.add(rb(0.92, 0.12, 0.12, white, 0, 1.86, 0, 0.01));
  // condensation drops on the front (s11): they slide down with the waiting
  g.drops = [...Array(6)].map((_, i) => { const R = RNG('drop', i), d = c3Mesh(new THREE.SphereGeometry(R.r(0.04, 0.06), 8, 6), new THREE.MeshPhysicalMaterial({ color: '#e8f6ff', roughness: 0.05, transmission: 0.2, envMapIntensity: 2 }), 0);
    d.scale.y = 1.4; d.userData = { x: R.r(-0.32, 0.32), y0: R.r(0.9, 1.3), v: R.r(0.25, 0.5) }; d.position.set(d.userData.x, d.userData.y0, 0.48); g.add(d); return d; });
  return g;
}

// ---- the world
function stbBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 500), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff6ec', ambI: 0.6, sky: '#ffffff', ground: '#c8b8a0', key: '#fff4e6', keyI: 1.0, keyP: [8, 24, 18], rim: '#d8ecff', rimI: 0.5, rimP: [-14, 16, -10] });
  // floor, back wall with a brand band, ceiling with light panels
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(140, 100), c3Prop('#ffffff', { map: stbTexFloor(), rough: 0.35, metal: 0.05, env: 0.7 })); fl.rotation.x = -Math.PI / 2; fl.position.z = -10; scene.add(fl);
  const wall = pl(140, 26, stbMat('#2fbfa6'), 0, 13, -22); scene.add(wall);
  scene.add(pl(140, 1.6, stbMat('#1fb3a8'), 0, 11.6, -21.9)); scene.add(pl(140, 0.5, stbMat('#ffd23a'), 0, 10.6, -21.9));
  const ceil = pl(140, 100, stbMat('#ffe9a8'), 0, 24, -10, 0, Math.PI / 2); scene.add(ceil);
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 3; j++) { const p = pl(9, 1.4, c3Flat('#ffffff', { glow: '#fff6e0' }), i * 16, 23.9, -18 + j * 12, 0, Math.PI / 2); scene.add(p); }
  // the shelves (two rows) and the hanging aisle boards
  [-30, -17, -4, 9, 22, 35].forEach((x, i) => stbShelf(s, x, -16, 11, i));
  [-36, -23, -10, 3, 16, 29, 42].forEach((x, i) => stbShelf(s, x, -9.5, 7, 10 + i));
  [['GROENTE & FRUIT', '#3ab85a', -24], ['ZUIVEL', '#2a7ad8', -2], ['BROOD', '#e88a3a', 18], ['SNOEP', '#ff5a8a', 38]].forEach(([txt, col, x]) => {
    const b = pl(8, 2.5, stbMat('#ffffff', { map: stbTexAisle(txt, col) }), x, 17.5, -14); scene.add(b);
    for (const sx of [-3.2, 3.2]) scene.add(cyl(0.04, 0.04, 6, stbMat('#8a9294'), x + sx, 21.5, -14, 0, 6)); });
  // the big wall clock (hands turn per shot)
  s.clock = new THREE.Group(); s.clock.position.set(-2, 15.6, -21.6); scene.add(s.clock);
  s.clock.add(c3Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.4, 48), stbMat('#d8322a'), 0.03).rotateX(Math.PI / 2));
  s.clock.add(pl(4.6, 4.6, c3Flat('#ffffff', { map: stbTexClock() }), 0, 0, 0.22));
  const hand = (l, wd, c) => { const p = new THREE.Group(), m = rb(wd, l, 0.06, c3Toon(c), 0, l / 2 - 0.2, 0, 0); p.add(m); p.position.z = 0.3; s.clock.add(p); return p; };
  s.hourH = hand(1.2, 0.2, '#2a2420'); s.minH = hand(1.8, 0.14, '#2a2420'); s.clock.add(c3Mesh(new THREE.SphereGeometry(0.16, 10, 8), c3Toon('#d8322a'), 0).translateZ(0.34));
  // lane A (the chat checkout) and lane B (the next one)
  s.laneA = stbCounter(s, -7, 7, { band: '#1fb3a8', beltEnd: 1.6 }); scene.add(s.laneA);
  s.laneB = stbCounter(s, 12, 26, { band: '#2aa04a', beltEnd: 20.6 }); scene.add(s.laneB);
  // lane A: divider bar, card terminal (customer side), candy rack at the lane start, a little plant and the speed dial
  s.divider = new THREE.Group(); s.divider.add(rb(1.9, 0.3, 0.3, stbMat('#f0c020'), 0, 0, 0, 0.015)); s.divider.add(pl(1.8, 0.24, stbMat('#ffffff', { map: stbTexDivider() }), 0, 0, 0.16));
  s.divider.rotation.y = Math.PI / 2; s.divider.position.set(-2.4, STB_TOP + 0.3, 0); s.laneA.add(s.divider); s.divider.rotation.set(0, 0, 0); s.divider.position.set(-2.4, STB_TOP + 0.32, 0.6);
  const term = new THREE.Group(); term.add(cyl(0.08, 0.08, 1.1, stbMat('#5a6266'), 0, 0.55, 0, 0.01, 8)); term.add(rb(0.7, 1.0, 0.24, stbMat('#2a3034', { rough: 0.3 }), 0, 1.4, 0, 0.02));
  term.add(pl(0.5, 0.36, c3Flat('#8ad8ff', { glow: '#8ad8ff' }), 0, 1.6, 0.13)); term.position.set(2.9, STB_TOP, 1.2); term.rotation.x = -0.25; scene.add(term);
  const rack = new THREE.Group(); rack.position.set(-8.6, 0, 1.8); scene.add(rack); rack.add(rb(2.4, 6.2, 1.4, stbMat('#d8dde0'), 0, 3.1, 0, 0.02));
  { const R = RNG('candy'); for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) rack.add(rb(0.48, 0.8, 0.5, stbMat(['#e8453a', '#ffd23a', '#a85ad8', '#ff8a3a', '#3ab85a', '#ff5a8a'][R.i(0, 5)], { rough: 0.4 }), -0.84 + i * 0.56, 1.2 + r * 1.35, 0.5, 0.012)); }
  s.plant = new THREE.Group(); s.plant.position.set(6.4, STB_TOP + 0.1, -0.8); scene.add(s.plant); s.plant.add(cyl(0.38, 0.28, 0.6, stbMat('#e88a3a'), 0, 0.3, 0, 0.015, 14));
  for (let i = 0; i < 6; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.3, 10, 8), c3Toon('#3ab85a'), 0.015); lf.scale.set(0.6, 1.4, 0.4); lf.position.set(Math.sin(i * 1.05) * 0.25, 0.95, Math.cos(i * 1.05) * 0.25); lf.rotation.z = Math.sin(i * 1.05) * 0.6; s.plant.add(lf); }
  s.dial = new THREE.Group(); s.dial.position.set(6.2, STB_TOP + 1.0, -2.1); s.dial.rotation.x = -0.3; scene.add(s.dial);   // on a little wedge on the front edge, facing the customers
  s.dial.add(cyl(0.95, 0.95, 0.12, stbMat('#5a6266', { metal: 0.5 }), 0, 0, -0.04, 0.02, 32).rotateX(Math.PI / 2));
  scene.add(rb(1.4, 1.0, 0.9, stbMat('#5a6266', { metal: 0.4 }), 6.2, STB_TOP + 0.5, -2.3, 0.02));   // on a stand on the cashier's side, just behind her fist plane, so her fist sits on the knob
  s.dial.add(pl(1.8, 1.8, new THREE.MeshBasicMaterial({ map: stbTexDial(), transparent: true, alphaTest: 0.1, toneMapped: false }), 0, 0, 0.03));   // round face: the canvas corners stay clear
  s.needle = new THREE.Group(); s.needle.position.set(0, -0.07, 0.06); s.dial.add(s.needle); s.needle.add(rb(0.12, 0.62, 0.06, c3Toon('#2a2420'), 0, 0.31, 0, 0.0));
  s.needle.add(c3Mesh(new THREE.SphereGeometry(0.12, 10, 8), c3Toon('#d8322a'), 0.01));
  s.cal = new THREE.Group(); s.cal.position.set(6.4, STB_TOP + 0.12, 0.9); scene.add(s.cal); { const c = pl(1.2, 0.75, stbMat('#ffffff', { map: stbTexCal() }), 0, 0.55, 0); c.rotation.x = -0.25; s.cal.add(c); s.cal.add(rb(1.3, 0.12, 0.5, stbMat('#5a6266'), 0, 0.05, -0.1, 0.01)); }
  // the bananas: the one on the belt (s17, s30, s31) and the lady's (held, s28–s30 she has paid and keeps it on the belt)
  s.banana = stbBanana(); s.banana.position.set(0.8, STB_TOP + 0.24, 0.1); scene.add(s.banana);
  // the signs: lane A's CHAT CHECKOUT lightbox on a pole, lane B's OPEN 2
  const signG = new THREE.Group(); signG.position.set(-4.4, 0, -0.4); scene.add(signG); s.signG = signG;
  signG.add(cyl(0.16, 0.16, 15.6, stbMat('#8a9294', { metal: 0.6 }), -3.2, 7.8, 0, 0.015, 10));
  signG.add(rb(7.0, 2.3, 0.6, stbMat('#e8ecee'), 0, 14.2, 0, 0.03));
  s.signOff = c3Flat('#ffffff', { map: stbTexSign(false) }); s.signOn = c3Flat('#ffffff', { map: stbTexSign(true) });
  s.signFace = pl(6.7, 2.05, s.signOff, 0, 14.2, 0.31); signG.add(s.signFace);
  const openG = new THREE.Group(); openG.position.set(13.2, 0, -0.4); scene.add(openG); openG.add(cyl(0.16, 0.16, 13, stbMat('#8a9294', { metal: 0.6 }), -1.4, 6.5, 0, 0.015, 10));
  openG.add(rb(3.0, 1.2, 0.4, stbMat('#e8ecee'), 0, 13, 0, 0.02)); openG.add(pl(2.8, 1.05, c3Flat('#ffffff', { map: stbTexOpen(), glow: '#8affa0' }), 0, 13, 0.21));
  // the thought bubble (s12): a cloud with a CLOSED board drawn in, trail toward the head at its lower left
  s.bubCv = Object.assign(document.createElement('canvas'), { width: 1024, height: 768 }); s.bubTex = new THREE.CanvasTexture(s.bubCv); s.bubTex.encoding = THREE.sRGBEncoding; s.bubK = -1;
  s.bubble = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.45), new THREE.MeshBasicMaterial({ map: s.bubTex, transparent: true, depthWrite: false, toneMapped: false })); s.bubble.renderOrder = 9; scene.add(s.bubble);
  // the sigh puff (s29) and sparkles / hearts (s16, s30, s31): little sprites, positions per shot
  s.puff = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { x.fillStyle = 'rgba(220,226,232,0.95)'; x.strokeStyle = '#5a6066'; x.lineWidth = 6;
    for (const pass of [0, 1]) for (const [u, v, r] of [[0.35, 0.55, 0.22], [0.58, 0.45, 0.26], [0.75, 0.6, 0.18]]) { x.beginPath(); x.arc(u * w, v * h, r * w, 0, TAU); pass ? x.fill() : x.stroke(); } }, 256, 192), transparent: true, depthWrite: false, toneMapped: false }));
  s.puff.renderOrder = 9; scene.add(s.puff);
  const spr = (draw) => new THREE.MeshBasicMaterial({ map: tex(draw, 128, 128), transparent: true, depthWrite: false, toneMapped: false });
  const starM = spr((x, w) => { x.fillStyle = '#fff6b0'; x.strokeStyle = '#e8a020'; x.lineWidth = 6; x.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = (i % 2 ? 0.2 : 0.46) * w; x.lineTo(w / 2 + Math.cos(a) * r, w / 2 + Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); });
  const heartM = spr((x, w) => { x.fillStyle = '#ff5a7a'; x.strokeStyle = '#a81a3a'; x.lineWidth = 6; x.beginPath(); x.moveTo(w / 2, w * 0.82); x.bezierCurveTo(w * 0.05, w * 0.5, w * 0.2, w * 0.1, w / 2, w * 0.32); x.bezierCurveTo(w * 0.8, w * 0.1, w * 0.95, w * 0.5, w / 2, w * 0.82); x.fill(); x.stroke(); });
  s.stars = [...Array(6)].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), starM); m.renderOrder = 9; scene.add(m); return m; });
  s.hearts = [...Array(5)].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), heartM); m.renderOrder = 9; scene.add(m); return m; });
  // ---- people
  s.you = c3Person({ key: 'you', outfit: 'tie', hairStyle: 'rk_darkfringe' }); s.you.g.scale.setScalar(STB_K); scene.add(s.you.g);
  s.lady = c3Person({ key: 'lady', outfit: 'grandma', hairStyle: 'curlygrey', fx: ['glasses_round'] }); s.lady.g.scale.setScalar(STB_K); scene.add(s.lady.g);
  s.cashier = c3Person({ key: 'cashier', outfit: 'polo', hairStyle: 'ponytail' }); s.cashier.g.scale.setScalar(STB_K); scene.add(s.cashier.g);
  s.guy = c3Person({ key: 'guy', outfit: 'hivis', hairStyle: 'buzz' }); s.guy.g.scale.setScalar(STB_K); scene.add(s.guy.g);
  // lane B's queue (background): five shoppers lined up toward the camera, lane B's cashier
  s.queue = [['q1', 'bomber', 'rk_brownshort'], ['q2', 'dress', 'rk_curly'], ['q3', 'leather', 'beanie'], ['q4', 'sweater', 'rk_edison'], ['q5', 'stripes', 'rk_darkbowl']]
    .map(([key, outfit, hairStyle], i) => { const p = c3Person({ key, outfit, hairStyle }); p.g.scale.setScalar(STB_K); p.g.position.set(21.4 - i * 3.0, STB_FOOT, 3.0 + (i % 2) * 1.6); scene.add(p.g); return p; });
  s.cashB = c3Person({ key: 'cashB', outfit: 'polo', hairStyle: 'rk_glasses' }); s.cashB.g.scale.setScalar(STB_K); s.cashB.g.position.set(22.5, STB_FOOT, -2.9); scene.add(s.cashB.g);
  // the milk carton in your fist
  s.milk = stbCarton(); s.you.root.add(s.milk);
  [s.laneA, s.you.g, s.lady.g, s.cashier.g, s.guy.g, s.signG, s.dial, s.cal, s.banana, s.plant, s.bubble, s.puff, ...s.stars, ...s.hearts, term, rack].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.term = term;
  // ---- blurred foreground pieces (NEAR layer), placed per shot by stbFg
  s.fgBy = {
    basket: (() => { const g = new THREE.Group(), red = stbMat('#e8453a', { rough: 0.4 }); g.add(rb(3.2, 1.6, 2.0, red, 0, 0, 0, 0.03)); g.add(rb(2.8, 0.2, 1.6, stbMat('#ffd23a'), 0, 0.9, 0, 0));
      const h = c3Mesh(new THREE.TorusGeometry(1.2, 0.09, 8, 24, Math.PI), stbMat('#2a2420'), 0.01); h.position.y = 0.8; g.add(h); return g; })(),
    candy: (() => { const g = new THREE.Group(); const R = RNG('fgcandy'); for (let i = 0; i < 6; i++) g.add(rb(0.9, 1.5, 0.8, stbMat(['#e8453a', '#ffd23a', '#a85ad8', '#3ab85a', '#ff8a3a', '#ff5a8a'][i]), (i % 3) * 1.0 - 1, Math.floor(i / 3) * 1.7, 0, 0.02)); return g; })(),
    rail: (() => rb(9, 0.4, 0.4, stbMat('#b8c2c6', { metal: 0.7, rough: 0.25 }), 0, 0, 0, 0.02))(),
    leaf: (() => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const l = c3Mesh(new THREE.SphereGeometry(0.9, 10, 8), c3Toon('#3ab85a'), 0.02); l.scale.set(0.5, 1.6, 0.25); l.position.set(i * 0.8 - 1.2, Math.sin(i) * 0.4, 0); l.rotation.z = (i - 1.5) * 0.4; g.add(l); } return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff2c8', mid: '#7cd0c4', bot: '#4a6a7a', cards: [[0, 30, 10, 30, 6, '#ffffff'], [-20, 12, 12, 8, 14, '#fff4e0'], [20, 12, -10, 8, 14, '#e0f0ff']] });
  c3ShadeScene(scene, { dark: 0.3 });
  c3Shadows(scene, s.key, 30);
  return s;
}
const stbGet = () => STB.s ||= stbBuild();
const STB_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const stbWalkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });
// per-frame world: hide every shot-specific piece, reset moving parts to their rest state
function stbWorld(s, t) {
  [s.bubble, s.puff, ...s.stars, ...s.hearts].forEach((o) => { o.visible = false; });
  [s.you.g, s.lady.g, s.cashier.g, s.guy.g, s.cashB.g, ...s.queue.map((q) => q.g)].forEach((g) => { g.visible = true; });
  s.you.root.rotation.z = 0; s.milk.visible = true;
  s.you.g.position.set(-1.6, STB_FOOT, 2.8); s.lady.g.position.set(2.9, STB_FOOT, 2.7); s.cashier.g.position.set(3.6, STB_FOOT, -2.8); s.guy.g.position.set(-5.6, STB_FOOT, 3.0);
  s.signFace.material = t >= stbWA('chat', 20.4, 20.8) ? s.signOn : s.signOff;
  s.laneA.belt.material.map.offset.x = 0; s.laneA.scan.material.color.set('#c8202a');
  s.banana.position.set(0.8, STB_TOP + 0.24, 0.1); s.banana.rotation.set(-0.25, 0, 0);
  s.needle.rotation.z = 0.95;   // FAST s.plant.visible = true;
  stbClock(s, 0);
}
// the wall clock: minutes since the lady started talking (hour hand creeps with it)
function stbClock(s, min) { s.minH.rotation.z = -(min / 60) * TAU; s.hourH.rotation.z = -((2 + min / 60) / 12) * TAU - 0.4; }
// a prop held in a fist: put it on the limb end (root-local), a little in front of the arm
function stbHold(p, obj, side, dx = 0, dy = 0.15) { const e = p.limbs[side].e.position; obj.position.set(e.x + dx, e.y + dy, e.z + 0.06); }
function stbPose(p, cam, t, o) { c3PersonPose(p, cam, t, Object.assign({}, STB_STAND, o)); }
// background shoppers: idle, facing the camera
function stbExtras(s, t) { [...s.queue, s.cashB].forEach((p, i) => c3PersonPose(p, s.cam, t, { expr: c3FaceAt([[0, ['bored', 'tired', 'unimpressed', 'sleepy', 'neutral', 'talking'][i]]], t, p.key), ...STB_STAND })); }
// the chatting pair at the scanner (lady + cashier) in the background of most shots
function stbChat(s, t, o = {}) {
  const k = Math.floor(t / 0.9) % 2;
  stbPose(s.lady, s.cam, t, { expr: c3FaceAt([[0, o.lady ?? (k ? 'talking' : 'laugh')]], t, 'lady'), gaze: [0.6, 0.1], hand: { armL: [1.6 + 0.3 * Math.sin(t * 3), 1.4 + 0.4 * Math.sin(t * 4.2)] } });
  stbPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, o.cash ?? (k ? 'smile' : 'talking')]], t, 'cashier'), gaze: [-0.6, 0.1] });
}
function stbStars(s, t, t0, p, n = 5, r = 1.2) {   // a sparkle burst around point p from t0 (0.6 s)
  const dt = t - t0; if (dt < 0 || dt > 0.6) return;
  s.stars.slice(0, n).forEach((m, i) => { const a = i / n * TAU + 0.3, k = EZ.o2(dt / 0.6); m.visible = true; m.position.set(p.x + Math.cos(a) * r * k, p.y + Math.sin(a) * r * k, p.z + 0.3); m.quaternion.copy(s.cam.quaternion); m.scale.setScalar(Math.sin(Math.PI * dt / 0.6) + 0.01); });
}
function stbBubbleDraw(s, k) {   // the thought cloud with the CLOSED board you're praying for
  const kq = Math.round(k * 30) / 30; if (kq === s.bubK) return; s.bubK = kq;
  const x = s.bubCv.getContext('2d'), w = s.bubCv.width, h = s.bubCv.height; x.clearRect(0, 0, w, h);
  x.lineWidth = 12; x.strokeStyle = '#1a1210'; x.fillStyle = '#fffaf0';
  const puffs = [[0.55, 0.38, 0.32], [0.33, 0.42, 0.22], [0.77, 0.42, 0.21], [0.43, 0.24, 0.2], [0.67, 0.23, 0.2], [0.55, 0.56, 0.22], [0.36, 0.58, 0.15], [0.74, 0.58, 0.16]];
  for (const pass of [0, 1]) for (const [u, v, r] of puffs) { x.beginPath(); x.arc(u * w, v * h, r * w * 0.5, 0, TAU); pass ? x.fill() : x.stroke(); }
  for (const [u, v, r] of [[0.22, 0.8, 0.035], [0.12, 0.93, 0.022]]) { x.beginPath(); x.arc(u * w, v * h, r * w, 0, TAU); x.fill(); x.stroke(); }   // the trail down to the head (lower left)
  if (k > 0) { const sc = EZ.back(clamp(k)); x.save(); x.translate(w * 0.55, h * 0.4); x.scale(sc, sc); x.rotate(-0.06);
    x.strokeStyle = '#5a4a3a'; x.lineWidth = 8; x.beginPath(); x.moveTo(-w * 0.12, -h * 0.17); x.lineTo(0, -h * 0.27); x.lineTo(w * 0.12, -h * 0.17); x.stroke();
    x.fillStyle = '#d8322a'; x.strokeStyle = '#7a1410'; x.lineWidth = 10; x.beginPath(); x.roundRect(-w * 0.2, -h * 0.15, w * 0.4, h * 0.3, 18); x.fill(); x.stroke();
    inked(x, 'CLOSED', 0, h * 0.005, h * 0.14, '#ffffff', { stroke: '#7a1410', sw: 8, maxW: w * 0.34 }); x.restore(); }
  s.bubTex.needsUpdate = true;
}

// =====================================================================
//  s11 — "Five minutes go by. Then ten.": you wait behind the lady with your milk; the wall clock behind you jumps
//  +5, then +10 minutes; you wilt and the carton sweats; the lady and the cashier keep chatting at the scanner
// =====================================================================
const STB_K11 = [[0, [-1.0, 8.0, 19.0], [-1.6, 10.8, -6.0], 48], [1.7, [-1.2, 8.2, 17.6], [-1.6, 11.0, -6.0], 48]];
SHOT_FN['s11'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t);
  c3SetCam(s.cam, stbCam(STB_K11, lt, 's11', { orbit: -0.02 }));
  const t5 = stbWA('five', 15.6, 15.7), t10 = stbWA('ten', 16.8, 17.0);
  const min = lerp(0, 5, EZ.back(clamp((t - t5) / 0.35))) + lerp(0, 5, EZ.back(clamp((t - t10) / 0.35)));
  stbClock(s, min);
  const wilt = clamp((t - 15.7) / 1.6);
  s.you.root.rotation.z = -0.06 * wilt;
  stbPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'bored'], [t5, 'tired'], [t10, 'pained']], t, 'you'), gaze: [-0.2, 0.7], head: [-0.06 * wilt, 0, -0.25 * wilt],
    hand: { armR: [-1.0, 0.9 - 0.4 * wilt] } });
  stbHold(s.you, s.milk, 'armR', 0, 0.05);
  s.milk.drops.forEach((d) => { const ud = d.userData; d.position.y = Math.max(0.15, ud.y0 - ud.v * clamp((t - 15.7) / 1.7) * 1.6); });
  stbChat(s, t); s.guy.g.visible = false;
  stbExtras(s, t);
  stbFg(s, [['basket', [3.4, -5.2, -7.5], 1.0, 0.1]], STB_K11, 's11', lt, { orbit: -0.02 });
  stbRender(s, { bgBlur: stbRack(lt, 's11', 1.6, 1.0) });
};

// =====================================================================
//  s12 — "You look up at the sign above the lane, praying it says Closed.": seen from the sign, looking down at you;
//  you look up with your fists together; a thought cloud pops with the CLOSED board you hope for
// =====================================================================
const STB_K12 = [[0, [-3.6, 17.6, 15.0], [-1.2, 9.6, 2.6], 46], [3.0, [-3.2, 17.0, 13.8], [-1.2, 9.8, 2.6], 46]];
SHOT_FN['s12'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 10);
  c3SetCam(s.cam, stbCam(STB_K12, lt, 's12', { orbit: 0.02 }));
  const tLook = stbWA('look', 17.4, 17.6), tPray = stbWA('praying', 18.8, 19.1), tClosed = stbWA('closed', 19.4, 19.7);
  const pray = EZ.io(clamp((t - tPray + 0.1) / 0.3));
  stbPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'tired'], [tLook, 'hopeful'], [tPray, 'worried'], [tClosed, 'hopeful']], t, 'you'), gaze: [0.1, lerp(0.2, 1, clamp((t - tLook) / 0.25))],
    head: [0, 0, 0.15 * clamp((t - tLook) / 0.3)],
    hand: { armL: [lerp(1.0, 0.32, pray), lerp(0.8, 1.9, pray)], armR: [lerp(-1.0, -0.32, pray), lerp(0.9, 1.9, pray)] } });
  stbHold(s.you, s.milk, 'armR', 0, 0.05); s.milk.visible = pray < 0.5;   // he tucks the carton away to pray
  s.bubble.visible = t > tPray - 0.15; stbBubbleDraw(s, clamp((t - tClosed + 0.15) / 0.3));
  s.bubble.position.copy(s.you.root.localToWorld(stbV(0.9, 7.2, 0.4))); s.bubble.quaternion.copy(s.cam.quaternion);
  s.bubble.scale.setScalar(EZ.back(clamp((t - tPray + 0.15) / 0.25)) + 1e-3);
  stbChat(s, t); stbExtras(s, t);
  s.guy.g.visible = true; stbPose(s.guy, s.cam, t, { expr: c3FaceAt([[0, 'bored']], t, 'guy'), gaze: [0.6, 0] });
  stbFg(s, [['leaf', [-3.6, 3.4, -6.5], 0.8, 0.4]], STB_K12, 's12', lt, { orbit: 0.02 });
  stbRender(s, { bgBlur: 1.8 });
};

// =====================================================================
//  s13 — "It says Chat Checkout.": looking up past your shocked face at the lightbox; it lights up on "Chat"
// =====================================================================
const STB_K13 = [[0, [-2.6, 6.4, 18.0], [-4.4, 12.6, -0.4], 46], [1.4, [-2.8, 6.2, 16.6], [-4.4, 12.8, -0.4], 46]];
SHOT_FN['s13'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 10);
  c3SetCam(s.cam, stbCam(STB_K13, lt, 's13', { orbit: -0.02, rush: 0.06 }));
  const tChat = stbWA('chat', 20.4, 20.8);
  s.you.g.position.set(-0.6, STB_FOOT, 5.0);
  stbPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [tChat, 'shocked']], t, 'you'), gaze: [-0.5, 1], head: [0.08, 0, 0.2], lift: (q) => 0.35 * Math.max(0, Math.sin(Math.PI * clamp((q - tChat) / 0.3))) });
  stbHold(s.you, s.milk, 'armR', 0, 0.05);
  s.lady.g.visible = false; s.cashier.g.visible = false; s.guy.g.visible = false;
  stbStars(s, t, tChat, stbV(-4.4, 14.2, 0.2), 6, 3.6);
  stbExtras(s, t);
  stbRender(s, { bgBlur: 1.4, glow: 0.9 });
};

// =====================================================================
//  s14 — "So you try the next lane, and the guy behind you laughs.": wide; you hurry right toward lane B and stop at
//  its long queue; behind, the guy in the hi-vis vest bursts out laughing
// =====================================================================
const STB_K14 = [[0, [6.4, 13.4, 46.0], [7.4, 7.4, 3.0], 52], [2.9, [6.8, 13.0, 42.0], [7.6, 7.4, 3.0], 52]];   // wider: the guy (left) and lane B's whole queue (right) both read
SHOT_FN['s14'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 10);
  c3SetCam(s.cam, stbCam(STB_K14, lt, 's14', { orbit: 0.02 }));
  const tNext = stbWA('next', 22.3, 22.5), tGuy = stbWA('guy', 23.2, 23.4), tLaugh = stbWA('laughs', 23.9, 24.1);
  const k = EZ.io(clamp((t - tNext + 0.2) / 1.0));
  s.you.g.position.set(lerp(-1.6, 7.6, k), STB_FOOT, lerp(2.8, 4.8, k));
  const walking = k > 0.02 && k < 0.98;
  stbPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'determined'], [tNext + 1.0, 'shocked'], [tLaugh, 'embarrassed']], t, 'you'), gaze: [0.8, 0],
    hand: { armR: [-1.0, 0.9] }, ...(walking ? stbWalkFeet(t * 9) : STB_STAND) });
  stbHold(s.you, s.milk, 'armR', 0, 0.05);
  s.guy.g.position.set(-1.0 + 2.6 * k, STB_FOOT, 3.6);   // he steps up into your spot
  stbPose(s.guy, s.cam, t, { expr: c3FaceAt([[0, 'smirk'], [tLaugh, 'laugh']], t, 'guy'), gaze: [0.7, 0], lift: (q) => 0.25 * Math.max(0, Math.sin(Math.PI * clamp((q - tLaugh) / 0.25))) * (q > tLaugh ? 1 : 0),
    hand: { armL: [0.9, 1.0 + (t > tLaugh ? 0.25 * Math.sin(t * 22) : 0)], armR: [-0.6, 0.6] } });
  stbChat(s, t); stbExtras(s, t);
  stbFg(s, [['candy', [-5.4, -4.2, -9.0], 1.3, 0]], STB_K14, 's14', lt, { orbit: 0.02 });
  stbRender(s, { bgBlur: 1.2 });
};

// =====================================================================
//  s15 — "Bro, that lane's for people who aren't in a hurry. Clearly not you.": close on the guy, smug, talking;
//  on "Clearly" he points his fist at you (you, at the right edge, annoyed)
// =====================================================================
const STB_K15 = [[0, [-3.4, 9.6, 12.4], [-4.6, 9.4, 2.6], 44], [3.1, [-3.0, 9.8, 11.2], [-4.6, 9.6, 2.6], 44]];
SHOT_FN['s15'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 10);
  c3SetCam(s.cam, stbCam(STB_K15, lt, 's15', { orbit: 0.02 }));
  const tBro = stbWA('bro', 24.6, 24.7), tClear = stbWA('clearly', 26.6, 26.8), tYou = stbWA('you', 27.2, 27.4);
  s.guy.g.position.set(-4.8, STB_FOOT, 3.0); s.you.g.position.set(-0.4, STB_FOOT, 3.6);
  const talk = (q) => c3FaceAt([[0, 'talking'], [tBro + 0.35, 'smug'], [tBro + 0.7, 'talking'], [tClear - 0.2, 'smirk'], [tClear, 'talking'], [tYou, 'grin']], q, 'guy');
  const point = EZ.back(clamp((t - tClear + 0.05) / 0.25));
  stbPose(s.guy, s.cam, t, { expr: talk(t), gaze: [0.7, 0], head: [0.06, 0, 0],
    hand: { armL: [lerp(0.9, 2.9, point), lerp(0.8, 2.1, point)], armR: [-0.7, lerp(0.6, 1.6, clamp((t - tBro) / 0.2))] } });
  stbPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'unimpressed'], [tClear, 'angry']], t, 'you'), gaze: [-0.8, 0], hand: { armR: [-1.0, 0.9] } });
  stbHold(s.you, s.milk, 'armR', 0, 0.05);
  s.lady.g.visible = false; s.cashier.g.visible = false;
  stbExtras(s, t);
  stbFg(s, [['rail', [2.4, -4.8, -6.0], 1.1, 0.12]], STB_K15, 's15', lt, { orbit: 0.02 });
  stbRender(s, { bgBlur: 2.2 });
};

// =====================================================================
//  s16 — "But here's the twist.": the camera swoops up over lane A and down behind the counter to the cashier's side;
//  a sparkle pops over the lane on "twist"
// =====================================================================
const STB_K16 = [[0, [1.0, 12.0, 15.0], [1.6, 7.0, 0.0], 50], [0.6, [5.0, 16.0, 2.0], [2.4, 6.0, 0.0], 48], [1.2, [9.6, 10.0, -10.0], [2.4, 6.6, 0.0], 46]];
SHOT_FN['s16'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 10);
  c3SetCam(s.cam, stbCam(STB_K16, lt, 's16', { orbit: 0, creep: 0, rush: 0.05 }));
  const tTw = stbWA('twist', 28.4, 28.6);
  stbChat(s, t, { lady: 'happy', cash: 'grin' }); s.guy.g.visible = false; s.you.g.visible = false;
  stbStars(s, t, tTw, stbV(2.4, 9.6, 0), 6, 2.6);
  stbExtras(s, t);
  stbRender(s, { bgBlur: 1.6 });
};

// =====================================================================
//  s17 — "That lane isn't broken and the cashier isn't lazy.": from the cashier's side: the belt runs smoothly, the
//  banana rides to the scanner and beeps green on "broken"; the cashier bounces, all smiles, on "lazy"
// =====================================================================
const STB_K17 = [[0, [-0.6, 9.4, 17.0], [1.4, 6.4, 0.0], 44], [2.4, [-0.2, 9.0, 15.6], [1.6, 6.4, 0.0], 44]];
SHOT_FN['s17'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 10);
  c3SetCam(s.cam, stbCam(STB_K17, lt, 's17', { orbit: 0.02 }));
  const tBr = stbWA('broken', 29.6, 29.8), tLazy = stbWA('lazy', 30.8, 31.0);
  s.laneA.belt.material.map.offset.x = -(t - 29.0) * 0.6;   // the belt runs (texture scrolls toward the scanner)
  const bk = EZ.io(clamp((t - 29.0) / (tBr - 29.0)));
  s.banana.position.set(lerp(-1.6, s.laneA.scanX, bk), STB_TOP + 0.24, 0.1);
  if (t > tBr) s.laneA.scan.material.color.set('#2ad84a');
  stbStars(s, t, tBr, stbV(s.laneA.scanX, STB_TOP + 1.0, 0), 4, 1.0);
  stbPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [tLazy, 'excited']], t, 'cashier'), gaze: [0.6, -0.3],
    lift: (q) => 0.3 * Math.max(0, Math.sin(Math.PI * clamp((q - tLazy) / 0.3))),
    hand: { armL: [1.4, lerp(0.6, 2.4, EZ.back(clamp((t - tLazy) / 0.25)))], armR: [-1.0, 0.8] } });
  s.lady.g.visible = false; s.you.g.visible = false; s.guy.g.visible = false;
  stbExtras(s, t);
  stbFg(s, [['leaf', [-3.0, -4.0, -6.5], 1.0, -0.3]], STB_K17, 's17', lt, { orbit: 0.02 });
  stbRender(s, { bgBlur: 1.8 });
};

// =====================================================================
//  s18 — "It's slow on purpose.": close on the belt-speed dial; the cashier's fist turns it from FAST to SLOW on "slow",
//  the snail glints on "purpose"
// =====================================================================
const STB_K18 = [[0, [6.8, 9.4, 10.6], [5.2, 6.6, -1.6], 42], [1.3, [6.6, 9.2, 9.6], [5.2, 6.6, -1.6], 40]];   // her arm and fist on the dial both in frame
SHOT_FN['s18'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 10);
  c3SetCam(s.cam, stbCam(STB_K18, lt, 's18', { orbit: 0.02, rush: 0.06 }));
  const tSlow = stbWA('slow', 31.5, 31.7), tPur = stbWA('purpose', 31.9, 32.1);
  s.cashier.g.position.set(4.0, STB_FOOT, -1.7);   // close enough that her fist reaches the dial knob
  stbPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [tSlow, 'wink']], t, 'cashier'), gaze: [0.6, -0.5] });   // sets the root's facing
  s.cashier.g.updateMatrixWorld(true);
  const reach = EZ.io(clamp((t - tSlow + 0.45) / 0.35)), knob = s.cashier.root.worldToLocal(s.dial.localToWorld(stbV(0, -0.07, 0.1)));
  stbPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [tSlow, 'wink']], t, 'cashier'), gaze: [0.6, -0.5], idle: 0.4,
    hand: { armL: [lerp(1.4, knob.x, reach), lerp(0.8, knob.y, reach)], armR: [knob.x, knob.y] } });
  s.needle.rotation.z = lerp(0.95, -0.95, EZ.back(clamp((t - tSlow) / 0.3)));
  stbStars(s, t, tPur, s.dial.localToWorld(stbV(0.55, -0.45, 0.2)), 4, 0.5);
  s.you.g.visible = false; s.guy.g.visible = false; s.lady.g.visible = false; s.plant.visible = false;   // the plant would hide the dial
  stbExtras(s, t);
  stbRender(s, { bgBlur: 2.6 });
};

// =====================================================================
//  s28 — "So next time the line won't move,": another day, wide and calm: the lady and the cashier chatting again, you in
//  line with your milk, arms relaxed; the clock reads early
// =====================================================================
const STB_K28 = [[0, [1.8, 10.4, 19.0], [1.0, 8.0, 0.0], 44], [1.8, [1.2, 10.0, 17.2], [0.8, 8.2, 0.0], 44]];
SHOT_FN['s28'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 3);
  c3SetCam(s.cam, stbCam(STB_K28, lt, 's28', { orbit: -0.02 }));
  const tMove = stbWA('move', 55.7, 55.9);
  stbChat(s, t);
  stbPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [tMove, 'tired']], t, 'you'), gaze: [0.7, 0], hand: { armR: [-1.0, 0.9] } });
  stbHold(s.you, s.milk, 'armR', 0, 0.05);
  s.guy.g.visible = false; stbExtras(s, t);
  stbFg(s, [['basket', [-3.8, -5.6, -8.0], 1.2, -0.1]], STB_K28, 's28', lt, { orbit: -0.02 });
  stbRender(s, { bgBlur: 1.2 });
};

// =====================================================================
//  s29 — "maybe don't sigh.": close on you: you breathe in for a big sigh (a grey puff starts at your mouth)… and stop,
//  the puff shrinks back, and you smile instead
// =====================================================================
const STB_K29 = [[0, [-0.6, 9.8, 10.6], [-1.6, 9.6, 2.8], 42], [1.1, [-0.8, 9.8, 9.6], [-1.6, 9.7, 2.8], 42]];
SHOT_FN['s29'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 4);
  c3SetCam(s.cam, stbCam(STB_K29, lt, 's29', { orbit: 0.02 }));
  const tSigh = stbWA('sigh', 56.7, 56.9);
  const inhale = clamp((t - 56.2) / 0.5), stop = clamp((t - tSigh) / 0.25);
  stbPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'tired'], [56.5, 'grimace'], [tSigh, 'relieved'], [tSigh + 0.25, 'smile']], t, 'you'), gaze: [0.6, 0.1],
    lift: () => 0.25 * inhale * (1 - stop), hand: { armR: [-1.0, 0.9] } });
  stbHold(s.you, s.milk, 'armR', 0, 0.05);
  const pk = clamp((t - 56.55) / 0.25) * (1 - stop);
  s.puff.visible = pk > 0.02; s.puff.position.copy(s.you.root.localToWorld(stbV(1.3, 4.6, 0.4))); s.puff.quaternion.copy(s.cam.quaternion); s.puff.scale.setScalar(pk + 1e-3);
  s.lady.g.visible = false; s.cashier.g.visible = false; s.guy.g.visible = false; stbExtras(s, t);
  stbRender(s, { bgBlur: 2.4 });
};

// =====================================================================
//  s30 — "Someone might be having the best conversation of their week": the lady and the cashier laughing over the
//  counter; hearts float up on "conversation"; the desk calendar stars today
// =====================================================================
const STB_K30 = [[0, [4.2, 9.6, 13.0], [3.6, 8.2, 0.0], 44], [2.4, [3.8, 9.4, 11.6], [3.6, 8.4, 0.0], 44]];
SHOT_FN['s30'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 6);
  c3SetCam(s.cam, stbCam(STB_K30, lt, 's30', { orbit: 0.02 }));
  const tBest = stbWA('best', 58.2, 58.4), tConv = stbWA('conversation', 58.4, 58.6);
  s.lady.g.position.set(2.4, STB_FOOT, 2.7);
  stbPose(s.lady, s.cam, t, { expr: c3FaceAt([[0, 'talking'], [tBest, 'laugh']], t, 'lady'), gaze: [0.6, 0.1], lift: (q) => 0.2 * Math.max(0, Math.sin(Math.PI * clamp((q - tBest) / 0.3))),
    hand: { armL: [1.6, 1.4 + 0.4 * Math.sin(t * 5)] } });
  stbPose(s.cashier, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [tBest, 'laugh']], t, 'cashier'), gaze: [-0.6, 0.1] });
  s.banana.position.set(1.4, STB_TOP + 0.24, 0.3);
  s.hearts.forEach((m, i) => { const dt = t - tConv - i * 0.18; if (dt < 0 || dt > 1.4) return; m.visible = true;
    m.position.set(3.0 + Math.sin(i * 2.3) * 1.2 + Math.sin(dt * 4 + i) * 0.2, 10.6 + dt * 1.8, 1.0); m.quaternion.copy(s.cam.quaternion); m.scale.setScalar(Math.min(1, dt * 4) * (1 - Math.max(0, dt - 1.1) / 0.3) + 1e-3); });
  s.you.g.visible = false; s.guy.g.visible = false; stbExtras(s, t);
  stbFg(s, [['candy', [-4.2, -5.4, -8.0], 1.1, 0]], STB_K30, 's30', lt, { orbit: 0.02 });
  stbRender(s, { bgBlur: 2.0 });
};

// =====================================================================
//  s31 — "over a single banana.": the hero shot: the single banana on the belt in a warm pool of light, the camera
//  orbiting in low; a sparkle on "banana" (the video loops back to s01)
// =====================================================================
const STB_K31 = [[0, [3.4, 7.0, 6.4], [1.4, 5.0, 0.2], 40], [1.8, [1.6, 6.6, 5.8], [1.4, 5.0, 0.2], 38]];
SHOT_FN['s31'] = (t, u, lt) => {
  const s = stbGet(); stbWorld(s, t); stbClock(s, 6);
  c3SetCam(s.cam, stbCam(STB_K31, lt, 's31', { orbit: 0.08, rush: 0.04 }));
  const tBan = stbWA('banana', 60.5, 60.7);
  s.banana.position.set(1.4, STB_TOP + 0.24, 0.2);
  s.banana.rotation.set(-0.25, 0.4 * Math.sin(Math.PI * clamp((t - tBan) / 0.4)) * 0.3, 0);
  stbStars(s, t, tBan, stbV(1.4, STB_TOP + 1.1, 0.4), 5, 0.9);
  s.lady.g.visible = false; s.cashier.g.visible = false; s.you.g.visible = false; s.guy.g.visible = false;
  stbExtras(s, t);
  stbRender(s, { bgBlur: 3.0 });
};
