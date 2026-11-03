// =====================================================================
//  SET hall — the auction hall: an amphitheatre of buyers' desks rising toward +z, facing the giant price clock on
//  the clock wall (z -42). Below the clock, the pit floor where the rose trolleys roll through (z ~ -28).
//  Shots: s01 s02 s05-s22 s24-s26 s32 s33. Registers SHOT_FN[id]. Prefix hal.
//  Layout (units: a person ~11 tall): row k floor top y = HAL_Y(k), desk front z = HAL_Z(k); a seated buyer's root
//  sits at y + HAL_SEAT, z + 1.5 (the desk hides the legs from the clock side; a tall chair back hides them from behind).
//  Walls: clock wall teal, side walls mustard, back wall coral; warm ceiling lamps over every row.
// =====================================================================
const HAL = {}, HAL_SEAT = 2.7, HAL_DESK = 3.9, HAL_CLK = [0, 33, -41.4], HAL_CR = 14.5;
const HAL_Y = (k) => 1.5 + k * 3.2, HAL_Z = (k) => -16 + k * 7;
// who sits where: [cast, row, x, buyer number]
const HAL_SEATS = [['you', 1, 0, 128], ['neigh', 1, -6.4, 305], ['rival', 0, 19, 417],
  ['b1', 0, -21, 112], ['b2', 0, -9, 240], ['b4', 0, 6, 351], ['b3', 2, 9, 233], ['b5', 2, -3, 190], ['b6', 2, -15, 276], ['b7', 2, 21, 388],
  ['b8', 1, 14, 164], ['b9', 1, -19, 455], ['b2b', 2, -9, 247], ['b1b', 2, 3, 139], ['b4b', 2, 15, 362], ['b5b', 0, -15, 208], ['b8b', 0, 27, 176], ['b6b', 0, -27, 299]];

// ---- the clock: everything drawn into one canvas, redrawn when its state key changes
// state: { mode: 'time'|'price', p: price 0..100 (the lit dot), sold: buyer number or 0, tail: lit trail length, hands: angle,
//          label: extra centre text, arrow: 'down'|null, flip: 0..1 (time → price) }
function halDrawClock(x, w, h, st) {
  const cx = w / 2, cy = h / 2, R = w * 0.47;
  x.clearRect(0, 0, w, h);
  // bezel + face
  x.fillStyle = '#2a1a14'; x.beginPath(); x.arc(cx, cy, R, 0, TAU); x.fill();
  x.fillStyle = '#ffd23a'; x.beginPath(); x.arc(cx, cy, R * 0.965, 0, TAU); x.fill();
  x.fillStyle = '#163a5a'; x.beginPath(); x.arc(cx, cy, R * 0.9, 0, TAU); x.fill();
  if (st.mode === 'time') {   // an ordinary clock: hour numbers, two hands spinning
    for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - Math.PI / 2; inked(x, String(i), cx + Math.cos(a) * R * 0.74, cy + Math.sin(a) * R * 0.74, R * 0.16, '#ffffff', { stroke: '#0a1a2a', sw: 8 }); }
    x.lineCap = 'round'; x.strokeStyle = '#ffffff';
    for (const [len, wd, a] of [[0.45, 22, st.hands * 0.12], [0.66, 14, st.hands]]) { x.lineWidth = wd; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.sin(a) * R * len, cy - Math.cos(a) * R * len); x.stroke(); }
    x.fillStyle = '#e8282a'; x.beginPath(); x.arc(cx, cy, 22, 0, TAU); x.fill();
    if (st.flip > 0) { x.save(); x.globalAlpha = st.flip; x.fillStyle = '#163a5a'; x.beginPath(); x.arc(cx, cy, R * 0.9, 0, TAU); x.fill(); x.restore(); }
    if (st.flip <= 0) return;
  }
  const a0 = -Math.PI / 2, lit = Math.round(100 - st.p);   // the dot runs clockwise from the top as the price falls
  for (let i = 0; i < 100; i++) {
    const a = a0 + i / 100 * TAU, on = i === lit, tr = i < lit && lit - i <= (st.tail ?? 0);
    x.fillStyle = on ? '#ff3a2a' : tr ? `rgba(255,${120 + (lit - i) * 12},60,${1 - (lit - i) / ((st.tail ?? 1) + 1)})` : '#33506a';
    x.beginPath(); x.arc(cx + Math.cos(a) * R * 0.83, cy + Math.sin(a) * R * 0.83, on ? R * 0.045 : R * 0.03, 0, TAU); x.fill();
    if (on) { x.strokeStyle = '#fff2a0'; x.lineWidth = 6; x.stroke(); }
  }
  // the prices around the ring every 10
  for (let v = 0; v < 100; v += 10) { const a = a0 + (100 - v) / 100 * TAU; inked(x, String(v === 0 ? 100 : v), cx + Math.cos(a) * R * 0.69, cy + Math.sin(a) * R * 0.69, R * 0.07, '#a8d4ff', { stroke: false, font: 'Arial' }); }
  // the photo of the lot (Flow: roses, one in sunglasses) in a circle up top, the price big in the middle
  x.save(); x.beginPath(); x.arc(cx, cy - R * 0.28, R * 0.24, 0, TAU); x.clip(); if (!cover(x, asset('img_roses.jpg'), cx - R * 0.24, cy - R * 0.52, R * 0.48, R * 0.48)) { x.fillStyle = '#c81428'; x.fill(); } x.restore();
  x.strokeStyle = '#ffd23a'; x.lineWidth = 8; x.beginPath(); x.arc(cx, cy - R * 0.28, R * 0.24, 0, TAU); x.stroke();
  x.fillStyle = '#0a1a2a'; x.beginPath(); x.roundRect(cx - R * 0.36, cy + R * 0.02, R * 0.72, R * 0.3, 24); x.fill();
  inked(x, String(Math.round(st.p)), cx, cy + R * 0.17, R * 0.24, st.p > 90 ? '#ff5a3a' : '#3aff8a', { stroke: false, font: 'Arial', weight: 900, maxW: R * 0.64 });
  if (st.sold) { x.fillStyle = '#e8282a'; x.beginPath(); x.roundRect(cx - R * 0.33, cy + R * 0.36, R * 0.66, R * 0.2, 20); x.fill();
    inked(x, 'SOLD · BUYER ' + st.sold, cx, cy + R * 0.46, R * 0.085, '#ffffff', { stroke: false, maxW: R * 0.6 }); }
  else if (st.label) inked(x, st.label, cx, cy + R * 0.5, R * 0.11, '#ffe23a', { stroke: '#0a1a2a', sw: 8, maxW: R * 0.8 });
  if (st.arrow) { x.save(); x.translate(cx + R * 0.62, cy + R * 0.12); x.fillStyle = '#ff3a2a'; x.strokeStyle = '#2a1208'; x.lineWidth = 8; x.beginPath();
    x.moveTo(-R * 0.08, -R * 0.24); x.lineTo(R * 0.08, -R * 0.24); x.lineTo(R * 0.08, 0); x.lineTo(R * 0.17, 0); x.lineTo(0, R * 0.2); x.lineTo(-R * 0.17, 0); x.lineTo(-R * 0.08, 0); x.closePath(); x.fill(); x.stroke(); x.restore(); }
}
// the clock's state at time t (one script for the whole piece; shots only frame it)
function halClockAt(t) {
  const W_ = (w, a, fb) => wAfter(w, a, fb);
  const st = { mode: 'price', p: 100, sold: 0, tail: 0, hands: 0, label: '', arrow: null, flip: 1 };
  const run = (t0, p0, rate) => Math.max(1, p0 - (t - t0) * rate);
  if (t < 2.58) { st.p = run(0, 99, 15); st.tail = 6; return st; }                        // s01: the dot races down
  if (t < 12.2) { st.p = Math.max(30, 61 - (t - 2.58) * 3); st.tail = 3; return st; }       // the same lot keeps falling (never up)
  const tPrice = W_('price', 13.4, 13.84);
  if (t < tPrice) { st.mode = 'time'; st.hands = (t - 12.2) * 9; st.flip = 0; return st; }     // s07: a normal clock... hands spinning
  if (t < tPrice + 0.35) { st.mode = 'time'; st.hands = (t - 12.2) * 9; st.flip = (t - tPrice) / 0.35; return st; }
  if (t < 17.56) { st.p = 100; return st; }                                                 // s08-s09: the new lot starts at the top: 100
  const d1 = W_('drops', 19.3, 19.52), d2 = W_('drops', 20.2, 20.4), tc = W_('Click', 26, 26.18);
  if (t < d1) { st.p = run(17.56, 99, 3.2); return st; }
  if (t < d2) { st.p = Math.min(run(17.56, 99, 3.2), 99 - 6.2) - 14 * EZ.o3(clamp((t - d1) / 0.12)); st.tail = 4; return st; }
  if (t < tc) { const base = 99 - 6.2 - 14; st.p = Math.max(38, base - 16 * EZ.o3(clamp((t - d2) / 0.12)) - (t - d2 - 0.12 > 0 ? (t - d2 - 0.12) * 3.4 : 0)); st.tail = 2; return st; }
  if (t < 33.1) { st.p = 38; st.sold = 417; return st; }                                    // click: frozen, SOLD to the rival
  if (t < 35.04) { st.p = 100 - ((t - 33.1) * 22) % 100; st.tail = 5; return st; }
  const tpress = W_('presses', 39, 39.24);
  if (t < 37.16) { st.p = 100; return st; }
  if (t < tpress) { st.p = run(37.16, 100, 24); st.tail = 6; st.arrow = 'down'; return st; }
  if (t < 41.84) { st.p = run(37.16, 100, 24) + (t - tpress) * 24; st.p = 100 - (tpress - 37.16) * 24; st.sold = 233; return st; }
  if (t < 57.32) { st.p = 100 - ((t - 41.84) * 9) % 70; st.tail = 3; return st; }
  const twon = W_('refused', 58.5, 58.68), t1 = W_('one', 60, 60.24);
  if (t < twon) { st.p = run(57.32, 100, 18); st.tail = 4; return st; }
  if (t < 59.62) { st.p = 100 - (twon - 57.32) * 18; st.sold = 417; return st; }
  st.p = 64 - (t > t1 ? 1 : 0); st.label = t > t1 ? '1 SECOND' : ''; st.tail = 0; return st;   // s33: one notch, then frozen
}

function halTexTulip(c) { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#2a1208'; x.lineWidth = 8;
  x.fillStyle = '#3aa84a'; x.fillRect(w * 0.46, h * 0.45, w * 0.08, h * 0.5); x.strokeRect(w * 0.46, h * 0.45, w * 0.08, h * 0.5);
  x.beginPath(); x.ellipse(w * 0.36, h * 0.72, w * 0.08, h * 0.2, 0.5, 0, TAU); x.fill(); x.stroke();
  x.fillStyle = c; x.beginPath(); x.moveTo(w * 0.24, h * 0.18); x.lineTo(w * 0.37, h * 0.3); x.lineTo(w * 0.5, h * 0.12); x.lineTo(w * 0.63, h * 0.3); x.lineTo(w * 0.76, h * 0.18);
  x.quadraticCurveTo(w * 0.8, h * 0.5, w * 0.5, h * 0.52); x.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.24, h * 0.18); x.closePath(); x.fill(); x.stroke(); }, 256, 256); }
function halTexPlaque() { return tex((x, w, h) => { x.fillStyle = '#ff7a1a'; x.beginPath(); x.roundRect(6, 6, w - 12, h - 12, 40); x.fill(); x.lineWidth = 12; x.strokeStyle = '#2a1208'; x.stroke();
  inked(x, 'DUTCH AUCTION', w / 2, h * 0.42, h * 0.36, '#ffffff', { stroke: '#2a1208', sw: 14, maxW: w * 0.86 }); inked(x, 'the price only goes DOWN', w / 2, h * 0.79, h * 0.2, '#ffffff', { stroke: '#2a1208', sw: 10, maxW: w * 0.86 }); }, 1024, 300); }

function halBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 900), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff4e6', ambI: 0.7, sky: '#fff2dc', ground: '#5a4a3a', key: '#fff0d8', keyI: 1.0, keyP: [22, 60, 30], rim: '#a8d0ff', rimI: 0.5, rimP: [-30, 40, -30] });
  // floors and walls (saturated, Ricks)
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), c3Prop('#ffffff', { map: c3TexWall('paving', '#c8d4dc', { rep: [12, 8] }), rough: 0.5, env: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.position.z = -10; scene.add(fl);
  scene.add(pl(120, 80, c3Prop('#ffffff', { map: c3TexWall('plaster', '#2ab8b0', { rep: [6, 4] }), rough: 0.85 }), 0, 40, -42.5));
  for (const sx of [-1, 1]) scene.add(pl(90, 80, c3Prop('#ffffff', { map: c3TexWall('plaster', '#ffbe2a', { rep: [5, 4] }), rough: 0.85 }), sx * 46, 40, 0, -sx * Math.PI / 2));
  scene.add(pl(120, 80, c3Prop('#ffffff', { map: c3TexWall('plaster', '#ff6a5a', { rep: [6, 4] }), rough: 0.85 }), 0, 40, 26, Math.PI));
  const ceil = pl(120, 80, c3Prop('#fff6e0', { rough: 0.9 }), 0, 62, -8, 0, Math.PI / 2); scene.add(ceil);
  // the clock: dark bezel ring in 3D, the canvas face, a gold rim; the plaque under it (s22); two big lamps over it
  s.clk = canvasTex(1024, 1024);
  { const bz = cyl(HAL_CR + 0.8, HAL_CR + 0.8, 1.2, c3Prop('#2a1a14', { rough: 0.4 }), HAL_CLK[0], HAL_CLK[1], HAL_CLK[2] - 0.4, 0.05, 64); bz.rotation.x = Math.PI / 2; scene.add(bz); }
  const face = new THREE.Mesh(new THREE.CircleGeometry(HAL_CR, 96), new THREE.MeshBasicMaterial({ map: s.clk.t, toneMapped: false }));
  face.position.set(HAL_CLK[0], HAL_CLK[1], HAL_CLK[2] + 0.25); scene.add(face); s.face = face;
  s.plaque = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.5), new THREE.MeshBasicMaterial({ map: halTexPlaque(), transparent: true, alphaTest: 0.5, depthWrite: false, toneMapped: false })); s.plaque.position.set(0, 15.6, -41.9); scene.add(s.plaque);
  // the pit: a rail lane under the clock, two big doors (left in, right out), a low wall in front of row 0
  scene.add(rb(90, 0.2, 3.2, c3Prop('#4a5a6a', { rough: 0.5 }), 0, 0.1, -28, 0.02));
  for (const sx of [-1, 1]) { scene.add(rb(12, 15, 0.6, c3Prop('#2a2a30'), sx * 34, 7.5, -42.1, 0.03)); if (sx < 0) scene.add(rb(11, 14, 0.3, c3Prop('#ffe23a', { rough: 0.6 }), sx * 34, 7.0, -41.9, 0.02));
    scene.add(pl(9, 2.2, c3Flat('#ffffff', { map: texSign(sx < 0 ? 'IN' : 'OUT', '#ffe23a', '#2a1208') }), sx * 34, 16.2, -41.7)); }
  scene.add(rb(90, 2.2, 1.0, c3Prop('#e8483a', { rough: 0.6 }), 0, 1.1, -18.2, 0.03));
  // the tiers: platform, desk (front panel hides the legs), chair backs, a lamp per row
  const deskM = c3Prop('#ffffff', { map: c3TexWall('wood', '#c8783a', { rep: [10, 1] }), rough: 0.6 }), topM = c3Prop('#f4f0e6', { rough: 0.4 }), platM = c3Prop('#3a6aa8', { rough: 0.7 }), chairM = c3Prop('#2a3a5a', { rough: 0.6 });
  s.rows = [];
  for (let k = 0; k < 4; k++) { const y = HAL_Y(k), z = HAL_Z(k), g = new THREE.Group(); scene.add(g); s.rows.push(g);
    g.add(rb(88, y, 7, platM, 0, y / 2, z + 2.5, 0.03));
    const dk = new THREE.Group(); g.add(dk);   // the desk is in the people's layer so it hides their legs
    dk.add(rb(80, HAL_DESK - 0.3, 0.6, deskM, 0, y + (HAL_DESK - 0.3) / 2, z, 0.03)); dk.add(rb(80.4, 0.3, 1.8, topM, 0, y + HAL_DESK - 0.15, z + 0.3, 0.02)); c3Layer(dk, C3.L_FOCUS);
    for (let i = 0; i < 4; i++) { const lp = new THREE.PointLight('#ffd8a0', 0.35, 26, 1.5); lp.position.set(-30 + i * 20, y + 16, z + 2); scene.add(lp); } }
  // every seat: the chair back, the console with its button, the person
  s.ppl = {}; s.cons = {};
  for (const [who, k, x, num, cast] of HAL_SEATS) { const y = HAL_Y(k), z = HAL_Z(k);
    const ch = rb(3.4, 5.6, 0.5, chairM, x, y + 2.8, z + 3.3, 0.03); scene.add(ch); c3Layer(ch, C3.L_FOCUS);
    const c = consoleMesh(num); c.position.set(x + 0.2, y + HAL_DESK + 0.15, z + 0.75); scene.add(c); c3Layer(c, C3.L_FOCUS); s.cons[who] = c;
    const p = person(scene, cast ?? who); p.g.position.set(x, y + HAL_SEAT, z + 1.6); p.home = p.g.position.clone(); s.ppl[who] = p; }
  // the rose trolleys in the pit (s08, s19): a train of 3
  s.carts = [0, 1, 2, 3, 4].map((i) => { const c = roseCart(30 + i); c.scale.setScalar(1.1); scene.add(c); c3Layer(c, C3.L_FOCUS); return c; });
  // the OUT door opening: the bright distribution floor beyond (lanes, trolleys) painted on a plane just inside it
  s.beyond = pl(10.6, 13.6, c3Flat('#ffffff', { map: tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff6e0'); g.addColorStop(0.5, '#dfe6ee'); g.addColorStop(1, '#a8b4c4'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#ffd23a'; x.lineWidth = 6; for (const k of [-0.3, 0, 0.3]) { x.beginPath(); x.moveTo(w / 2 + k * w * 0.2, h * 0.5); x.lineTo(w / 2 + k * w * 1.6, h); x.stroke(); }
    for (let i = 0; i < 7; i++) { const R = RNG('beyond', i), bx = R.r(0.05, 0.8) * w, by = R.r(0.45, 0.62) * h, s2 = R.r(0.08, 0.14) * w; x.fillStyle = '#8a96a8'; x.fillRect(bx, by - s2, s2 * 1.4, s2); x.fillStyle = '#e8202e'; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(bx + s2 * (0.2 + k * 0.33), by - s2 * 0.75, s2 * 0.14, 0, TAU); x.fill(); } } }, 512, 640) }), 34, 7.0, -41.8);
  scene.add(s.beyond);
  s.porter = person(scene, 'cargo'); s.porter.g.visible = false;
  // sprites: CLICK / SOLD bursts, tulips around the plaque, sparkles; the thought cloud; the halo
  s.click = spritePlane(scene, texBurst('CLICK'), 6, 6); s.sold = spritePlane(scene, texBurst('SOLD', '#ffffff', '#e8282a'), 6, 6);
  s.tulips = ['#e8282a', '#ffcc1a', '#ff6ab8', '#ff8a1a', '#ffffff', '#e8282a'].map((c) => spritePlane(scene, halTexTulip(c), 4, 4));
  s.cloudC = canvasTex(768, 640); s.cloud = spritePlane(scene, s.cloudC.t, 10, 8.33);
  s.halo = c3Mesh(new THREE.TorusGeometry(1.3, 0.22, 10, 32), c3Flat('#ffe23a', { glow: '#ffe23a' }), 0.04); s.halo.visible = false; scene.add(s.halo); c3Layer(s.halo, C3.L_FOCUS);
  // blurred foreground: a rose bucket and a buyer's catalogue
  s.fgBy = { bucket: (() => { const b = roseBucket(77); return b; })(), cat: rb(2.2, 0.3, 3.0, c3Prop('#ffe23a'), 0, 0, 0, 0.02) };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff4e0', mid: '#e8d0a0', bot: '#4a3a2a' });
  c3ShadeScene(scene, { dark: 0.22 });
  return s;
}
const halGet = () => HAL.s ||= halBuild();
// reset per frame: the clock, everyone seated and idle, no sprites
function halWorld(s, t) {
  const st = halClockAt(t); redraw(s.clk, JSON.stringify([st.mode, Math.round(st.p * 4) / 4, st.sold, st.tail, Math.round(st.hands * 20), st.label, st.arrow, Math.round(st.flip * 10)]), (x, w, h) => halDrawClock(x, w, h, st));
  s.plaque.visible = t >= 33.1 && t < 35.04;
  [s.click, s.sold, s.cloud, ...s.tulips].forEach((m) => { m.visible = false; }); s.halo.visible = false;
  s.carts.forEach((c) => { c.visible = false; }); s.porter.g.visible = false;
  for (const p of Object.values(s.ppl)) { p.g.position.copy(p.home); p.g.visible = true; }
  for (const c of Object.values(s.cons)) c.userData.btn.position.y = 0.55;
}
// every buyer seated, faces by default; o[who] overrides the pose
function halPose(s, t, o = {}) {
  for (const [who, p] of Object.entries(s.ppl)) {
    const q = o[who] ?? {}, R = RNG('halidle', who);
    c3PersonPose(p, s.cam, t, Object.assign({ expr: ['neutral', 'thinking', 'skeptical', 'bored', 'neutral'][R.i(0, 5)], gaze: [R.r(-0.3, 0.3), 0.5], hand: { armL: [1.6, 0.9], armR: [-1.6, 0.9] }, ...sitFeet(HAL_SEAT) }, q));
  }
}
// a fist target (billboard units) that puts the fist over world point P as seen from the camera: the camera ray
// through P meets the person's billboard plane (the fist lives in that plane), then into billboard units
function halFistTo(p, cam, P) { p.g.updateMatrixWorld(true); const o = p.g.position, n = cam.position.clone().sub(o); n.y = 0; n.normalize();
  const d = P.clone().sub(cam.position), k = o.clone().sub(cam.position).dot(n) / (d.dot(n) || 1e-6), X = cam.position.clone().addScaledVector(d, k);
  const right = V3(0, 1, 0).cross(n).normalize(), v = X.sub(o); return [v.dot(right) / PK, v.y / PK]; }
// a hand pose that reaches the fist to P with whichever arm is on that side; the other arm rests
function halReach(s, who, P, rest) { const f = halFistTo(s.ppl[who], s.cam, P);
  return f[0] >= 0 ? { armL: f, armR: rest ?? [-1.6, 1.0] } : { armR: f, armL: rest ? [-rest[0], rest[1]] : [1.6, 1.0] }; }
// the world point just above a seat's button
const halBtn = (s, who, up = 0) => { const c = s.cons[who]; c.updateMatrixWorld(true); return c.localToWorld(V3(-0.95, 0.75 + up, 0.1)); };
// the button goes down when pressed (k 0..1)
const halPress = (s, who, k) => { s.cons[who].userData.btn.position.y = 0.55 - 0.18 * k; };
// the trolley train at the pit: head x
function halCarts(s, x) { s.carts.forEach((c, i) => { c.visible = true; c.position.set(x - i * 6.6, 0.2, -28); c.rotation.y = 0; }); }
// a sprite that sits next to a person's head (camera facing)
function halNear(s, m, p, dx, dy, k, size) { m.visible = k > 0.01; if (!m.visible) return; const right = V3(1, 0, 0).applyQuaternion(s.cam.quaternion);
  m.position.copy(p.g.position).addScaledVector(right, dx).add(V3(0, dy, 0)); facing(m, s.cam); m.scale.setScalar(k * (size ?? 1)); }
const halR = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2ab8b0', bgBlur: 1.2, nearBlur: 10, glow: 0.45, glowBlur: 12 }, o));
// camera helpers: a point relative to a seat (row k, x) — handy for framing people
const halHead = (who) => { const p = HAL.s.ppl[who].home; return [p.x, p.y + 6.6, p.z]; };

// =====================================================================
//  s01 — "Imagine an auction where the price only goes down…": tight on the giant clock, the red dot racing round
//  the ring with a glowing trail, the price falling; the camera pulls back and the top of the hall appears
// =====================================================================
const HAL_K01 = [[0, [0, 33, -14], [0, 33, -41], 40], [1.76, [2, 29, -2], [0, 31, -41], 44]];
SHOT_FN['s01'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove(HAL_K01, lt, 's01', { orbit: 0, creep: 0, rush: 0.04 })); halPose(s, t);
  halR(s, { bgBlur: rackOf(lt, 's01', 0.6, 1.2) });
};
// =====================================================================
//  s00 — "Imagine an auction": the opening — the tiers of buyers, you at your desk in the middle, every face
//  turned up toward something off screen (the clock), a slow push in
// =====================================================================
SHOT_FN['s00'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('you');
  c3SetCam(s.cam, camMove([[0, [h[0] + 2, h[1] + 3, h[2] - 16], [h[0] - 1, h[1] - 0.6, h[2] + 2], 44], [0.82, [h[0] + 1.6, h[1] + 2.6, h[2] - 15], [h[0] - 1, h[1] - 0.4, h[2] + 2], 44]], lt, 's00', { orbit: 0.02, rush: 0 }));
  const o = {}; for (const who of Object.keys(s.ppl)) o[who] = { expr: who === 'you' ? 'nervous' : ['thinking', 'determined', 'neutral'][RNG('h00', who).i(0, 3)], gaze: [0, 0.9], ...sitFeet(HAL_SEAT) };
  halPose(s, t, o); halR(s, { bgBlur: 1.4 });
};
// =====================================================================
//  s02 — "and that's what makes it terrifying.": you at your desk in the tiers, gulp, sweat drop, the neighbour calm
// =====================================================================
SHOT_FN['s02'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('you');
  c3SetCam(s.cam, camMove([[0, [h[0] + 3, h[1] + 1.5, h[2] - 15], [h[0] - 1, h[1] - 1.6, h[2]], 42], [1.84, [h[0] + 1.5, h[1] + 1, h[2] - 13], [h[0] - 1, h[1] - 1.4, h[2]], 42]], lt, 's02', { orbit: 0.02 }));
  const tt = wAfter('terrifying', 3.4, 3.66);
  halPose(s, t, { you: { expr: c3FaceAt([[0, 'nervous'], [tt, 'scared']], t, 'you'), gaze: [0, 0.8], x: t > tt ? ['sweat'] : [], lift: (q) => q > tt ? -0.12 * Math.exp(-(q - tt) * 6) : 0, hand: { armL: [1.5, 1.0], armR: [-1.5, 1.0] }, ...sitFeet(HAL_SEAT) },
    neigh: { expr: 'smug', gaze: [0.6, 0.4], hand: { armL: [1.2, 1.1], armR: [-1.3, 1.1] }, ...sitFeet(HAL_SEAT) } });
  halR(s, { bgBlur: 1.6 });
};
// =====================================================================
//  s05 — "with your finger on a single button.": insert, your fist hovering right over the big red button, the console
//  reads BUYER 128; the price clock blurred behind
// =====================================================================
SHOT_FN['s05'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const b = halBtn(s, 'you');
  c3SetCam(s.cam, camMove([[0, [b.x + 2.4, b.y + 7.4, b.z - 20], [b.x + 1.4, b.y + 3.6, b.z + 1], 44], [1.8, [b.x + 2.0, b.y + 7.0, b.z - 19], [b.x + 1.4, b.y + 3.6, b.z + 1], 44]], lt, 's05', { orbit: 0.02, creep: 0.03 }));
  halPose(s, t, { you: { expr: 'determined', gaze: [0, -0.8], hand: halReach(s, 'you', halBtn(s, 'you', 0.45 + 0.08 * Math.sin(t * 3))), ...sitFeet(HAL_SEAT) } });
  halR(s, { bgBlur: 2.2 });
};
// =====================================================================
//  s06 — "On the wall, there's a giant clock.": wide from the back of the tiers, rows of buyers, the clock on the teal wall
// =====================================================================
const HAL_K06 = [[0, [8, 27, 26], [0, 23, -41], 54], [2.2, [3, 26, 22], [0, 24, -41], 54]];
SHOT_FN['s06'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove(HAL_K06, lt, 's06', { orbit: 0.02, creep: 0.04 })); halPose(s, t);
  halR(s, { bgBlur: 0.8 });
};
// =====================================================================
//  s07 — "But it doesn't tell time. It tells price.": the clock face as an ordinary clock, the hands spin; on "price"
//  it flips to the ring of 100 lights and the price
// =====================================================================
SHOT_FN['s07'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove([[0, [-4, 32, -10], [0, 33, -41], 44], [2.26, [2, 33, -12], [0, 33, -41], 44]], lt, 's07', { orbit: 0, creep: 0.03 })); halPose(s, t);
  halR(s, { bgBlur: 0.8 });
};
// =====================================================================
//  s08 — "A cart full of red roses rolls in,": a train of rose trolleys rolls in through the IN door under the clock
// =====================================================================
SHOT_FN['s08'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const k = EZ.o3(clamp(lt / 1.9));
  halCarts(s, lerp(-16, 6, k));
  const K = [[0, [-12, 9, -18], [-6, 8, -32], 56], [2.0, [-4, 9.5, -18], [0, 8.5, -32], 56]]; c3SetCam(s.cam, camMove(K, lt, 's08', { orbit: 0.02 })); halPose(s, t);
  fgPlace(s, [['bucket', [-3.6, -4.2, -8], 0.8]], K, 's08', lt);
  halR(s, { bgBlur: 1.2 });
};
// =====================================================================
//  s09 — "and the clock starts high.": the clock, the dot at the very top, 100 blazing red; a slow push
// =====================================================================
SHOT_FN['s09'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove([[0, [0, 30, -8], [0, 27, -41], 44], [1.08, [0, 30, -10], [0, 27, -41], 44]], lt, 's09', { orbit: 0, creep: 0.05 })); halPose(s, t);
  halR(s, { bgBlur: 0.8, glow: 0.7 });
};
// =====================================================================
//  s10 — "Way too high. So you wait.": you scoff, cross your arms, lean back in your chair
// =====================================================================
SHOT_FN['s10'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('you');
  c3SetCam(s.cam, camMove([[0, [h[0] - 2.5, h[1] + 1.4, h[2] - 14], [h[0] - 1.6, h[1] - 1.8, h[2]], 42], [1.5, [h[0] - 1, h[1] + 1, h[2] - 13], [h[0] - 1.6, h[1] - 1.6, h[2]], 42]], lt, 's10', { orbit: -0.02 }));
  const tw = wAfter('wait', 18.4, 18.68);
  halPose(s, t, { you: { expr: c3FaceAt([[0, 'skeptical'], [tw - 0.1, 'smug']], t, 'you'), gaze: [0.2, 0.7], lean: t > tw ? -0.06 : 0, hand: { armL: [-0.4, 1.4], armR: [0.4, 1.3] }, bend: { armL: 1, armR: 1 }, ...sitFeet(HAL_SEAT) },
    neigh: { expr: 'neutral', gaze: [0.3, 0.6], ...sitFeet(HAL_SEAT) } });
  halR(s, { bgBlur: 1.6 });
};
// =====================================================================
//  s11 / s12 — "The pointer drops. Then it drops again.": the clock; on each "drops" the dot jumps down the ring,
//  the price digits flick; one long take: s12 glides on from s11
// =====================================================================
SHOT_FN['s11'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove([[0, [-6, 30, -12], [0, 33, -41], 42], [0.96, [-5, 31, -13], [0, 33, -41], 42]], lt, 's11', { orbit: 0, creep: 0.04, rush: 0 })); halPose(s, t);
  halR(s, { bgBlur: 0.8 });
};
SHOT_FN['s12'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove([[0, [3, 34, -15], [0, 33, -41], 42], [1.0, [5, 35, -17], [0, 33, -41], 42]], lt, 's12', { orbit: 0, creep: 0.04 })); halPose(s, t);
  halR(s, { bgBlur: 0.8 });
};
// =====================================================================
//  s13 — "Now it's a pretty good deal.": you sit up straight, starstruck, sparkles
// =====================================================================
SHOT_FN['s13'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('you');
  c3SetCam(s.cam, camMove([[0, [h[0] + 2.4, h[1] + 0.8, h[2] - 13], [h[0] - 1.2, h[1] - 1.6, h[2]], 42], [1.22, [h[0] + 1.8, h[1] + 0.6, h[2] - 12], [h[0] - 1.2, h[1] - 1.5, h[2]], 42]], lt, 's13', { orbit: 0.02 }));
  halPose(s, t, { you: { expr: 'starstruck', gaze: [0, 0.8], x: ['sparkle'], lift: (q) => 0.15 * Math.exp(-Math.max(0, q - 21.1) * 5) * (q > 21.1 ? 1 : 0), hand: { armL: [1.7, 2.2], armR: [-1.7, 2.2] }, ...sitFeet(HAL_SEAT) },
    neigh: { expr: 'sly', gaze: [0.8, 0.2], ...sitFeet(HAL_SEAT) } });
  halR(s, { bgBlur: 1.6 });
};
// =====================================================================
//  s14 — "Your finger twitches.": insert, your fist trembling over the button, a sweat drop falls onto the console
// =====================================================================
SHOT_FN['s14'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const b = halBtn(s, 'you');
  c3SetCam(s.cam, camMove([[0, [b.x + 0.4, b.y + 6.8, b.z - 18], [b.x + 1.2, b.y + 3.4, b.z + 1], 44], [0.98, [b.x + 0.6, b.y + 6.6, b.z - 17.2], [b.x + 1.2, b.y + 3.4, b.z + 1], 44]], lt, 's14', { orbit: -0.02, creep: 0.04 }));
  const tw = wAfter('twitches', 22.5, 22.72), jit = t > tw - 0.15 ? 0.16 * Math.sin(t * 60) * Math.exp(-(t - tw) * 1.5) : 0;
  const P = halBtn(s, 'you', 0.4 + jit); P.x += jit * 0.6;
  halPose(s, t, { you: { expr: 'nervous', gaze: [0, -0.9], x: ['sweat'], hand: halReach(s, 'you', P), ...sitFeet(HAL_SEAT) } });
  halR(s, { bgBlur: 2.2 });
};
// =====================================================================
//  s15 — "But if you wait one more second, it'll be even cheaper.": you dreaming, a thought cloud with the mountain of
//  roses and its 1¢ tag (Flow photo); the neighbour side-eyes you
// =====================================================================
SHOT_FN['s15'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('you');
  c3SetCam(s.cam, camMove([[0, [h[0] - 1, h[1] + 3.5, h[2] - 19], [h[0] - 1.5, h[1] + 1.2, h[2]], 44], [2.26, [h[0] - 0.5, h[1] + 3.2, h[2] - 17.5], [h[0] - 1.5, h[1] + 1.4, h[2]], 44]], lt, 's15', { orbit: 0.015 }));
  halPose(s, t, { you: { expr: c3FaceAt([[0, 'thinking'], [24.3, 'love']], t, 'you'), gaze: [-0.5, 0.9], head: [-0.08, 0, 0], hand: { armL: [1.4, 1.2], armR: [-0.6, 3.2] }, ...sitFeet(HAL_SEAT) },
    neigh: { expr: 'unimpressed', gaze: [0.9, 0.1], ...sitFeet(HAL_SEAT) } });
  const k = EZ.back(clamp((lt - 0.15) / 0.35)), dx = lerp(25, -25, clamp(lt / 2.26));
  redraw(s.cloudC, 'm' + Math.round(dx), (x, w, hh) => drawThought(x, w, hh, asset('img_mountain.jpg'), dx));
  halNear(s, s.cloud, s.ppl.you, 0, 9.6, k, 0.5);
  halR(s, { bgBlur: 1.6 });
};
// =====================================================================
//  s16 — "So you wait.": eyes closed, a smug little smile, fist hovering, the price ticking down behind
// =====================================================================
SHOT_FN['s16'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('you');
  c3SetCam(s.cam, camMove([[0, [h[0] + 1.5, h[1] + 1.0, h[2] - 12.5], [h[0] - 1, h[1] - 1.4, h[2]], 42], [0.7, [h[0] + 1.2, h[1] + 0.9, h[2] - 12], [h[0] - 1, h[1] - 1.4, h[2]], 42]], lt, 's16', { orbit: 0.02, rush: 0.02 }));
  halPose(s, t, { you: { expr: 'closed', gaze: [0, 0], head: [0.06, 0, 0], hand: halReach(s, 'you', halBtn(s, 'you', 1.1)), ...sitFeet(HAL_SEAT) } });
  halR(s, { bgBlur: 1.6 });
};
// =====================================================================
//  s17 — "Click.": across the hall, the rival in the maroon puffer slams his button, CLICK burst
// =====================================================================
SHOT_FN['s17'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('rival');
  c3SetCam(s.cam, camMove([[0, [h[0] - 5, h[1] + 2.4, h[2] - 15], [h[0] + 0.6, h[1] - 3.0, h[2]], 44], [0.48, [h[0] - 4.4, h[1] + 2.0, h[2] - 14], [h[0] + 0.6, h[1] - 3.0, h[2]], 44]], lt, 's17', { orbit: 0, creep: 0.06, rush: 0 }));
  const tc = wAfter('Click', 26, 26.18), k = clamp((t - (tc - 0.12)) / 0.1);
  halPress(s, 'rival', k);
  halPose(s, t, { rival: { expr: 'determined', gaze: [0, -0.7], hand: halReach(s, 'rival', halBtn(s, 'rival', lerp(1.6, 0.25, k))), lift: (q) => q > tc ? -0.1 * Math.exp(-(q - tc) * 8) : 0, ...sitFeet(HAL_SEAT) } });
  const bk = pop(t, tc - 0.04, 0.16); s.click.visible = bk > 0.01; if (s.click.visible) { const right = V3(1, 0, 0).applyQuaternion(s.cam.quaternion); s.click.position.copy(halBtn(s, 'rival', 1.2)).addScaledVector(right, -2.2); facing(s.click, s.cam); s.click.scale.setScalar(bk * 0.75); }
  halR(s, { bgBlur: 1.8 });
};
// =====================================================================
//  s18 — "Somebody else pressed it.": the clock frozen, SOLD · BUYER 417 flashing in red
// =====================================================================
SHOT_FN['s18'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove([[0, [2, 24, -8], [0, 23.5, -41], 46], [1.04, [1, 24, -10], [0, 23.5, -41], 46]], lt, 's18', { orbit: 0, creep: 0.06 })); halPose(s, t);
  halR(s, { bgBlur: 0.8, glow: 0.7 });
};
// =====================================================================
//  s19 — "The roses are gone,": the trolley train rolls away through the OUT door
// =====================================================================
SHOT_FN['s19'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const k = clamp(lt / 1.22);
  halCarts(s, lerp(12, 30, k));   // the whole train rolls away toward the OUT door
  const K = [[0, [-6, 10, -21], [26, 6, -31], 52], [1.22, [-2, 10, -21.5], [30, 6, -32], 52]];
  c3SetCam(s.cam, camMove(K, lt, 's19', { orbit: 0, creep: 0.02 })); halPose(s, t);
  const P = s.porter; P.g.visible = true; P.g.position.set(lerp(12, 30, k) - 6.6, FOOT, -24.4);
  c3PersonPose(P, s.cam, t, { expr: 'happy', gaze: [0.8, 0], hand: { armL: [2.4, 2.2], armR: [1.8, 2.0] }, ...walkFeet(t * 9) });
  halR(s, { bgBlur: 1.0 });
};
// =====================================================================
//  s20 / s21 — "and the guy next to you leans over. 'Nice strategy. Very cheap. For him.'": two-shot from the clock
//  side, the tweed neighbour leans toward you, a fist cupped at his mouth; s21 glides in closer while he talks, you
//  sag; on "him" he points his fist toward the rival
// =====================================================================
const HAL_K20 = () => { const a = halHead('you'), b = halHead('neigh'), m = [(a[0] + b[0]) / 2, a[1], a[2]];
  return [[0, [m[0] + 3, m[1] + 1.6, m[2] - 18], [m[0], m[1] - 2.0, m[2]], 42], [1.82, [m[0] + 2, m[1] + 1.2, m[2] - 16.5], [m[0], m[1] - 1.8, m[2]], 42]]; };
const HAL_K21 = () => { const a = halHead('you'), b = halHead('neigh'), m = [(a[0] + b[0]) / 2, a[1], a[2]];
  return [[0, [m[0] + 1.6, m[1] + 0.9, m[2] - 14], [m[0], m[1] - 1.6, m[2]], 42], [2.36, [m[0] + 0.8, m[1] + 0.6, m[2] - 12], [m[0], m[1] - 1.5, m[2]], 42]]; };
function halTwo(s, t, lean) {
  const th = wAfter('him', 32.4, 32.68), lk = EZ.io(clamp(lean));
  // the neighbour leans in toward you (screen side of you), sliding a little along the desk
  s.ppl.neigh.g.position.x = s.ppl.neigh.home.x + 1.4 * lk;
  halPose(s, t, {
    neigh: { expr: c3FaceAt([[0, 'sly'], [30.7, 'smug'], [th, 'smirk']], t, 'neigh'), gaze: [-0.9, 0.2], lean: -0.22 * lk, head: [-0.12 * lk, 0, 0],
      hand: t > th ? { armL: [3.4, 3.6], armR: [-1.3, 1.1] } : { armL: [1.0 + 0.4 * lk, 3.2 * lk + 1.1 * (1 - lk)], armR: [-1.3, 1.1] }, ...sitFeet(HAL_SEAT) },
    you: { expr: c3FaceAt([[0, 'sad'], [31.7, 'unimpressed'], [th, 'crying']], t, 'you'), gaze: [0.7, 0.1], head: [0.08, 0, -0.1 * lk], hand: { armL: [1.4, 0.7], armR: [-1.4, 0.7] }, ...sitFeet(HAL_SEAT) } });
}
SHOT_FN['s20'] = (t, u, lt) => { const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove(HAL_K20(), lt, 's20', { orbit: 0.015, rush: 0 })); halTwo(s, t, (lt - 0.6) / 1.0); halR(s, { bgBlur: 1.6 }); };
SHOT_FN['s21'] = (t, u, lt) => { const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove(HAL_K21(), lt, 's21', { orbit: 0.015 })); halTwo(s, t, 1); halR(s, { bgBlur: 1.8 }); };
// =====================================================================
//  s22 — "You see, this is called a Dutch auction.": the clock wall, an orange DUTCH AUCTION plaque under the clock,
//  tulips pop up around it one by one
// =====================================================================
SHOT_FN['s22'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove([[0, [-3, 18, -9], [0, 16, -41], 50], [1.94, [2, 18, -11], [0, 16.5, -41], 50]], lt, 's22', { orbit: 0, creep: 0.03 })); halPose(s, t);
  const td = wAfter('Dutch', 34, 34.16);
  s.tulips.forEach((m, i) => { const k = pop(t, td - 0.4 + i * 0.1, 0.25); m.visible = k > 0.01; if (!m.visible) return; const sx = i < 3 ? -1 : 1, j = i % 3;
    m.position.set(sx * (3.5 + j * 2.6), 11.2 + (j === 1 ? 0.8 : 0), -40.8); m.rotation.set(0, 0, sx * -0.12 + 0.08 * Math.sin(t * 4 + i)); m.scale.setScalar(k * 0.75); });
  halR(s, { bgBlur: 0.8 });
};
// =====================================================================
//  s24 — "the price falls until the first person brave enough presses the button.": from behind a determined buyer
//  (b3, row 2) toward the clock with its big DOWN arrow; on "presses" he slams his button, the clock stops
// =====================================================================
SHOT_FN['s24'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('b3');
  const K = [[0, [h[0] + 8, h[1] + 4, h[2] + 12], [h[0] - 4, h[1] + 4, -40], 50], [3.04, [h[0] + 6, h[1] + 2.5, h[2] + 9], [h[0] - 4, h[1] + 3, -40], 50]];
  c3SetCam(s.cam, camMove(K, lt, 's24', { orbit: 0, creep: 0.03 }));
  const tp = wAfter('presses', 39, 39.24), k = clamp((t - (tp - 0.12)) / 0.1); halPress(s, 'b3', k);
  halPose(s, t, { b3: { expr: c3FaceAt([[0, 'determined'], [tp + 0.2, 'proud']], t, 'b3'), gaze: [0, 0.6], hand: halReach(s, 'b3', halBtn(s, 'b3', lerp(1.7, 0.25, k))), ...sitFeet(HAL_SEAT) } });
  const bk = pop(t, tp - 0.04, 0.16); s.click.visible = bk > 0.01; if (s.click.visible) { s.click.position.copy(halBtn(s, 'b3', 2.4)); facing(s.click, s.cam); s.click.scale.setScalar(bk * 0.7); }
  halR(s, { bgBlur: 0.9 });
};
// =====================================================================
//  s25 — "Nobody gets a second chance.": you slam your button a beat too late; a red SOLD burst pops over your
//  console, you freeze shocked
// =====================================================================
SHOT_FN['s25'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('you');
  c3SetCam(s.cam, camMove([[0, [h[0] - 2, h[1] + 1.2, h[2] - 14], [h[0] - 0.4, h[1] - 2.6, h[2]], 42], [1.64, [h[0] - 1.4, h[1] + 1.0, h[2] - 13], [h[0] - 0.4, h[1] - 2.5, h[2]], 42]], lt, 's25', { orbit: -0.02 }));
  const ts = wAfter('second', 40.9, 41.06), k = clamp((t - 40.52) / 0.1); halPress(s, 'you', k);
  halPose(s, t, { you: { expr: c3FaceAt([[0, 'determined'], [ts - 0.2, 'shocked']], t, 'you'), gaze: [0, 0.6], hand: halReach(s, 'you', halBtn(s, 'you', lerp(1.6, 0.25, k))), x: t > ts ? ['sweat'] : [], ...sitFeet(HAL_SEAT) },
    neigh: { expr: 'smirk', gaze: [0.8, 0.1], ...sitFeet(HAL_SEAT) } });
  const bk = pop(t, ts - 0.25, 0.22); s.sold.visible = bk > 0.01; if (s.sold.visible) { const right = V3(1, 0, 0).applyQuaternion(s.cam.quaternion); s.sold.position.copy(halBtn(s, 'you', 1.0)).addScaledVector(right, 1.6); facing(s.sold, s.cam); s.sold.rotateZ(0.15); s.sold.scale.setScalar(bk * 0.6); }
  halR(s, { bgBlur: 1.6 });
};
// =====================================================================
//  s26 — "That one rule forces everyone to show how badly they really want something, in a split second.": one long
//  take tracking along row 2 at desk height: every buyer leaning in, fists hovering over the buttons, sweat; on
//  "split" the last one in frame (b7) slams his button
// =====================================================================
SHOT_FN['s26'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const y = HAL_Y(0) + 8.4, z = HAL_Z(0);
  const K = [[0, [-24, y + 0.6, z - 16], [-17, y - 0.6, z + 1.5], 46], [2.4, [-8, y + 0.4, z - 16], [-1, y - 0.6, z + 1.5], 46], [4.84, [8, y + 0.6, z - 15.5], [15, y - 0.8, z + 1.5], 46]];
  c3SetCam(s.cam, camMove(K, lt, 's26', { orbit: 0, creep: 0.01 }));
  const tsp = wAfter('split', 45.7, 45.9), k = clamp((t - (tsp - 0.1)) / 0.1); halPress(s, 'rival', k);
  const row = ['b1', 'b5b', 'b2', 'b8b', 'b4', 'b6b', 'rival'], ex = ['nervous', 'scared', 'determined', 'worried', 'determined', 'nervous', 'determined'], o = {};
  row.forEach((who, i) => { const R = RNG('h26', who), jit = 0.08 * Math.sin(t * 30 + R.r(0, 6));
    o[who] = { expr: ex[i], gaze: [0, 0.4], lean: 0.08, x: R.f() < 0.6 ? ['sweat'] : [], hand: halReach(s, who, halBtn(s, who, who === 'rival' ? lerp(1.0, 0.25, k) : 1.0 + jit)), ...sitFeet(HAL_SEAT) }; });
  halPose(s, t, o);
  const bk = pop(t, tsp - 0.04, 0.16); s.click.visible = bk > 0.01; if (s.click.visible) { const right = V3(1, 0, 0).applyQuaternion(s.cam.quaternion); s.click.position.copy(halBtn(s, 'rival', 1.4)).addScaledVector(right, -3); facing(s.click, s.cam); s.click.scale.setScalar(bk * 0.7); }
  halR(s, { bgBlur: 1.4 });
};
// =====================================================================
//  s32 — "were probably won by someone who refused to be greedy…": the rival, calm, presses at the right moment; a
//  little golden halo pops over his curls
// =====================================================================
SHOT_FN['s32'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); const h = halHead('rival');
  c3SetCam(s.cam, camMove([[0, [h[0] + 3, h[1] + 1.4, h[2] - 14], [h[0], h[1] - 2.2, h[2]], 42], [2.3, [h[0] + 2, h[1] + 1.1, h[2] - 12.5], [h[0], h[1] - 2.1, h[2]], 42]], lt, 's32', { orbit: 0.02 }));
  const tr = wAfter('refused', 58.5, 58.68), k = clamp((t - (tr - 0.1)) / 0.1); halPress(s, 'rival', k);
  halPose(s, t, { rival: { expr: c3FaceAt([[0, 'relieved'], [tr + 0.15, 'happy']], t, 'rival'), gaze: [0, 0.3], hand: halReach(s, 'rival', halBtn(s, 'rival', lerp(0.9, 0.25, k))), ...sitFeet(HAL_SEAT) } });
  const hk = pop(t, tr + 0.1, 0.3); s.halo.visible = hk > 0.01; if (s.halo.visible) { const p = s.ppl.rival.g.position; s.halo.position.set(p.x, p.y + 8.3 + 0.1 * Math.sin(t * 4), p.z); s.halo.rotation.set(Math.PI / 2 - 0.25, 0, 0); s.halo.scale.setScalar(hk * 0.95); }
  halR(s, { bgBlur: 1.6 });
};
// =====================================================================
//  s33 — "for exactly one second.": the clock; on "one" the dot ticks one notch and freezes, 1 SECOND lights up; the
//  last frames match s01's opening clock (loop)
// =====================================================================
SHOT_FN['s33'] = (t, u, lt) => {
  const s = halGet(); halWorld(s, t); c3SetCam(s.cam, camMove([[0, [-2, 25, -2], [0, 24, -41], 46], [1.9, [0, 25, -10], [0, 24, -41], 44]], lt, 's33', { orbit: 0, creep: 0, rush: 0 })); halPose(s, t);
  halR(s, { bgBlur: 0.8, glow: 0.6 });
};
