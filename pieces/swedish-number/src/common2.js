// =====================================================================
//  SHARED SHOT HELPERS (swedish-number) — every set file uses these: camera moves that never sit still, blurred
//  foreground props with real parallax, people at one scale, phones held in the real fist, redraw-on-change canvases.
// =====================================================================
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const spanOf = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// the first time word w is spoken at or after t0 (common words repeat)
const wAfter = (w, t0, fb) => { const x = WORDS.find((q) => q.s >= t0 - 0.01 && q.w.replace(/[^\w]/g, '').toLowerCase() === w.toLowerCase()); return x ? x.s : fb; };
// camera: keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function camMove(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = spanOf(id), dur = b - a;
  const P = V3(...c.p), L = V3(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(V3(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const rackOf = (lt, id, a, b) => { const [t0, t1] = spanOf(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground props: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they drift along the lens' right — never glued to the screen
function fgPlace(s, list, K, id, lt, o = {}) {
  const c = s.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 4000);
  c3SetCam(c, camMove(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = V3(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => { const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(V3(...at))).addScaledVector(right, (drift ?? 1.4) * lt); f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0); });
}
// ---- people: one scale everywhere; a standing person's root sits at FOOT, a seated one at the seat height
const PK = 1.35, FOOT = 2.55 * PK;
const STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const walkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });
const sitFeet = (seat) => ({ foot: { legL: [0.85, -seat / PK + 0.05], legR: [-0.8, -seat / PK + 0.05] } });
// the cast: role costumes never used in earlier videos; hair = exact Ricks Clips styles (rk_*), the new ones cut from Ricks frames
const CAST = {
  you: { key: 'you', outfit: 'sweatnosleeve', hairStyle: 'rk_darkbowl' },   // sweatshirt with the baked sleeves painted out: the kit's ink arms are the sleeves          // the caller on the couch
  meat: { key: 'meat', outfit: 'apron', hairStyle: 'rk_edison' },              // the Swede eating meatballs
  farmer: { key: 'farmer', outfit: 'overalls', hairStyle: 'rk_sweepblond' },
  student: { key: 'student', outfit: 'parka', hairStyle: 'rk_spiky' },
  exec: { key: 'exec', outfit: 'vest', hairStyle: 'rk_combedgrey', hairX: -0.03 },              // the tourism group
  poet: { key: 'poet', outfit: 'turtleneck', hairStyle: 'rk_partblack' },   // the Ricks centre part in black (the brown one was too close to the caller's)
  sleepy: { key: 'sleepy', outfit: 'pajamas', hairStyle: 'rk_swoop', hairX: -0.03 },          // the Swede who just woke up
  op1: { key: 'op1', outfit: 'denim', hairStyle: 'rk_brownbig' }, op2: { key: 'op2', outfit: 'polka', hairStyle: 'rk_blackbob' }, clerk: { key: 'clerk', outfit: 'polka', hairStyle: 'rk_greybun', hairX: 0.08 },   // extras: exact Ricks cuts too
};
function person(scene, who, o = {}) { const p = c3Person(Object.assign({}, CAST[who], o)); p.g.scale.setScalar(PK); p.g.userData.person = true; scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); return p; }
// the fist's position in the person's billboard root (props held there follow the real hand)
function fistLocal(p, arm) { p.g.updateMatrixWorld(true); return p.root.worldToLocal(p.limbs[arm].e.getWorldPosition(V3(0, 0, 0))); }
// a smartphone (body + lit screen), billboard units; screen faces +z
function phoneMesh(color = '#2a2e3a', screen = '#8ad8ff') { const g = new THREE.Group();
  g.add(rb(0.62, 1.15, 0.12, c3Prop(color, { rough: 0.35 }), 0, 0, 0, 0.012));
  const sc = pl(0.5, 0.95, c3Flat(screen, { glow: screen }), 0, 0.02, 0.07); g.add(sc); g.userData.screen = sc; return g; }
// a phone in a fist (at the ear or out in front); built once on p.root, layered with the person
function holdPhone(p, arm, o = {}) {
  if (!p.phone) { p.phone = phoneMesh(o.color, o.screen); p.phone.scale.setScalar(o.s ?? 1); p.root.add(p.phone); c3Layer(p.phone, C3.L_FOCUS); p.phone.traverse((m) => { m.renderOrder = 6; }); }
  const f = fistLocal(p, arm); p.phone.visible = true; p.phone.position.set(f.x + (o.dx ?? 0), f.y + (o.dy ?? 0.35), f.z + (o.dz ?? 0.06)); p.phone.rotation.set(0, 0, o.rz ?? 0);
}
// "phone at the right ear" / "left ear" fist targets (billboard units, from the hips)
const EAR_R = [-1.3, 3.85], EAR_L = [1.3, 3.85];
// canvases redrawn only when their state key changes (export workers draw any frame first)
function canvasTex(w, h) { const cv = Object.assign(document.createElement('canvas'), { width: w, height: h }), t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return { cv, t, key: null }; }
function redraw(C, key, draw) { if (C.key === key) return; C.key = key; draw(C.cv.getContext('2d'), C.cv.width, C.cv.height); C.t.needsUpdate = true; }
const cover = (x, img, X, Y, w, h, dx = 0) => { if (!img) return false; const k = Math.max(w / img.width, h / img.height), iw = img.width * k, ih = img.height * k; x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.drawImage(img, X + (w - iw) / 2 + dx, Y + (h - ih) / 2, iw, ih); x.restore(); return true; };
const facing = (m, cam) => { m.quaternion.copy(cam.quaternion); };
// a pop scale 0..1 with overshoot, starting at t0
const pop = (t, t0, d = 0.25) => t < t0 ? 0 : EZ.back(clamp((t - t0) / d));
// the big red X stamp texture
function texXStamp() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.lineCap = 'round'; x.save(); x.translate(w / 2, h / 2);
  x.strokeStyle = '#5a0a08'; x.lineWidth = w * 0.2; x.beginPath(); x.moveTo(-w * 0.34, -h * 0.34); x.lineTo(w * 0.34, h * 0.34); x.moveTo(w * 0.34, -h * 0.34); x.lineTo(-w * 0.34, h * 0.34); x.stroke();
  x.strokeStyle = '#e8282a'; x.lineWidth = w * 0.14; x.stroke(); x.restore(); }, 512, 512); }
// the Swedish flag
function texFlagSE() { return tex((x, w, h) => { x.fillStyle = '#1a5aa8'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffcc1a'; x.fillRect(w * 0.31, 0, w * 0.12, h); x.fillRect(0, h * 0.42, w, h * 0.17); }, 256, 160); }
// a plate of Swedish meatballs: plate, a mound of balls, lingonberry jam and mash (origin = plate bottom)
function meatPlate(seed = 1, n = 9) { const g = new THREE.Group(), R = RNG('meat', seed);
  g.add(cyl(1.5, 1.2, 0.18, c3Prop('#fbf8f2', { rough: 0.25, env: 1.2 }), 0, 0.09, 0, 0.02, 32));
  g.add(cyl(1.15, 1.15, 0.04, c3Prop('#e8e2d6', { rough: 0.4 }), 0, 0.19, 0, 0, 32));
  const ballM = c3Prop('#8a4a24', { rough: 0.55 }); g.userData.balls = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU + R.r(0, 0.4), r = i < n - 2 ? 0.62 : 0.15; const b = c3Mesh(new THREE.SphereGeometry(0.3, 14, 10), ballM, 0.012); b.position.set(Math.cos(a) * r + 0.1, 0.42 + (i >= n - 2 ? 0.25 : 0), Math.sin(a) * r * 0.8); g.add(b); g.userData.balls.push(b); }
  const jam = c3Mesh(new THREE.SphereGeometry(0.28, 12, 8), c3Prop('#c8202a', { rough: 0.3 }), 0.01); jam.scale.y = 0.5; jam.position.set(-0.8, 0.3, 0.45); g.add(jam);
  const mash = c3Mesh(new THREE.SphereGeometry(0.45, 12, 8), c3Prop('#f6e2a0', { rough: 0.8 }), 0.01); mash.scale.y = 0.6; mash.position.set(-0.6, 0.35, -0.5); g.add(mash);
  return g; }
// a fork with a meatball on it (for a fist)
function forkMeat() { const g = new THREE.Group(), st = c3Prop('#c8ccd4', { metal: 0.8, rough: 0.25, env: 1.3 });
  g.add(rb(0.08, 0.9, 0.05, st, 0, 0.45, 0, 0.008)); for (const dx of [-0.08, 0, 0.08]) g.add(rb(0.03, 0.3, 0.03, st, dx, 1.02, 0, 0));
  const b = c3Mesh(new THREE.SphereGeometry(0.34, 16, 12), c3Toon('#5e3418'), 0.05); b.position.y = 1.12; g.add(b);   // a clear brown meatball: toon shading + ink outline
  const hl = c3Mesh(new THREE.SphereGeometry(0.1, 8, 6), c3Flat('#c88a5a'), 0); hl.position.set(-0.12, 1.24, 0.24); g.add(hl); g.userData.ball = b; b.add(hl); hl.position.set(-0.12, 0.12, 0.24); return g; }
