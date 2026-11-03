// =====================================================================
//  SHARED SHOT HELPERS (flower-clock) — every set file uses these: camera moves that never sit still, blurred
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
// the cast (human-library): role costumes never used in earlier videos (kit torso sprites, no baked sleeves: the kit's
// ink arms are the sleeves) and exact Ricks Clips hair (rk_*), one hair colour per cast member
const CAST = {
  you: { key: 'you', outfit: 'mustard', hairStyle: 'rk_darkbowl', hairW: 0.95 },                         // the reader: mustard shirt + tie
  lib: { key: 'lib', outfit: 'blazer', hairStyle: 'rk_brownbig', hairW: 0.92, fx: ['glasses_square'] }, // the librarian: purple blazer, glasses
  man: { key: 'man', outfit: 'hoodie', hairStyle: 'rk_edison' },   // a different Ricks cut from yours (review)                       // the "former prisoner" book: red hoodie
  lady: { key: 'lady', outfit: 'cardigan', hairStyle: 'rk_bungrey', fx: ['glasses_round'] }, // the lady next table: teal cardigan + pearls, silver Ricks bun
  fire: { key: 'fire', outfit: 'navy', hairStyle: 'firehelmet' },                             // her borrowed firefighter: navy + helmet
  cop: { key: 'cop', outfit: 'police', hairStyle: 'policecap' },                           // POLICE OFFICER
  refu: { key: 'refu', outfit: 'bomber', hairStyle: 'rk_curly' },                          // REFUGEE
  tatt: { key: 'tatt', outfit: 'leather', hairStyle: 'rk_combed' },                         // COVERED IN TATTOOS
  r1: { key: 'r1', outfit: 'plaid', hairStyle: 'rk_brownshort' }, r2: { key: 'r2', outfit: 'stripes', hairStyle: 'rk_sweep' },
  r3: { key: 'r3', outfit: 'polka', hairStyle: 'rk_blackbob' }, r4: { key: 'r4', outfit: 'denim', hairStyle: 'rk_sweepblond' },
  w1: { key: 'w1', outfit: 'teal', hairStyle: 'rk_genius' }, w2: { key: 'w2', outfit: 'dress', hairStyle: 'rk_blackbob' }, w3: { key: 'w3', outfit: 'blouse', hairStyle: 'rk_swoop' },
  w4: { key: 'w4', outfit: 'labcoat', hairStyle: 'rk_kyle' }, w5: { key: 'w5', outfit: 'sweater', hairStyle: 'rk_combed' }, w6: { key: 'w6', outfit: 'white', hairStyle: 'rk_edisonwhite' },
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
// =====================================================================
//  FLOWER HELPERS — roses, auction buckets, the Danish trolley (a steel cart with 3 shelves of buckets) and the
//  buyer's console with its single big button. Units: a person ~11 tall (PK).
// =====================================================================
// one rose bloom: a toon cup of petals + a darker centre (head up, origin at the bloom's base)
function roseHead(r = 0.32, c = '#e8202e') { const g = new THREE.Group();
  const cup = c3Mesh(new THREE.SphereGeometry(r, 12, 8, 0, TAU, 0, Math.PI * 0.62), c3Toon(c), 0.012); cup.rotation.x = Math.PI; cup.position.y = r * 0.9; g.add(cup);
  const top = c3Mesh(new THREE.SphereGeometry(r * 0.78, 12, 8), c3Toon(c), 0.012); top.scale.y = 0.55; top.position.y = r * 1.05; g.add(top);
  const mid = c3Mesh(new THREE.SphereGeometry(r * 0.38, 10, 6), c3Toon('#a8101e'), 0.008); mid.scale.y = 0.6; mid.position.y = r * 1.3; g.add(mid); return g; }
// a bunch of n roses packed in a round shape (radius rad), on stems; origin = stems' bottom
function roseBunch(n, rad, seed, o = {}) { const g = new THREE.Group(), R = RNG('rose', seed), stem = c3Toon('#2f8a3a'), H = o.h ?? 1.6;
  for (let i = 0; i < n; i++) { const a = R.r(0, TAU), d = Math.sqrt(R.f()) * rad, x = Math.cos(a) * d, z = Math.sin(a) * d, y = H + R.r(-0.15, 0.15) - d * 0.25;
    const s = cyl(0.03, 0.03, y, stem, x * 0.5, y / 2, z * 0.5, 0, 5); s.rotation.set(z * 0.12, 0, -x * 0.12); g.add(s);
    const h = roseHead(o.r ?? 0.3, o.c ?? (R.f() < 0.15 ? '#c81428' : '#e8202e')); h.position.set(x, y, z); g.add(h); }
  return g; }
// a black auction bucket full of roses
function roseBucket(seed, o = {}) { const g = new THREE.Group();
  g.add(cyl(0.75, 0.6, 1.2, c3Prop('#25262a', { rough: 0.45 }), 0, 0.6, 0, 0.02, 18));
  const b = roseBunch(o.n ?? 14, 0.62, seed, { h: 1.25, r: 0.27 }); b.position.y = 0.3; g.add(b); return g; }
// the Danish trolley: steel frame on 4 wheels, 3 shelves of rose buckets (origin = floor, faces +z)
function roseCart(seed, o = {}) { const g = new THREE.Group(), st = c3Prop('#b8c0cc', { metal: 0.7, rough: 0.3, env: 1.2 }), W0 = 5.4, D0 = 2.6;
  for (const [x, z] of [[-W0 / 2, -D0 / 2], [W0 / 2, -D0 / 2], [-W0 / 2, D0 / 2], [W0 / 2, D0 / 2]]) { g.add(cyl(0.07, 0.07, 6.6, st, x, 3.6, z, 0.01, 6)); const wh = cyl(0.32, 0.32, 0.22, c3Toon('#2a2a30'), x, 0.32, z, 0.01, 12); wh.rotation.z = Math.PI / 2; g.add(wh); }
  const sh = [];
  for (let k = 0; k < (o.shelves ?? 3); k++) { const y = 0.6 + k * 2.2; g.add(rb(W0 + 0.2, 0.12, D0 + 0.2, st, 0, y, 0, 0.012));
    const row = new THREE.Group(); row.position.y = y + 0.06; g.add(row); sh.push(row);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const b = roseBucket(seed * 31 + k * 7 + i * 2 + j, { n: 9 }); b.scale.setScalar(0.62); b.position.set(-1.7 + i * 1.7, 0, -0.6 + j * 1.2); row.add(b); } }
  g.userData.shelves = sh; return g; }
// the buyer's console: a slanted desk front with a little screen (buyer number) and ONE big red button
function texConsole(num) { return tex((x, w, h) => { x.fillStyle = '#1a2a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#3ad8a8'; x.fillRect(w * 0.06, h * 0.18, w * 0.5, h * 0.64);
  inked(x, 'BUYER ' + num, w * 0.31, h * 0.5, h * 0.3, '#0a2a1a', { stroke: false, font: 'Arial', weight: 900, maxW: w * 0.46 }); }, 512, 128); }
function consoleMesh(num) { const g = new THREE.Group();
  g.add(rb(4.2, 0.35, 2.2, c3Prop('#e8eef4', { rough: 0.4 }), 0, 0, 0, 0.025));
  g.add(pl(3.6, 0.9, c3Flat('#ffffff', { map: texConsole(num) }), 0.55, 0.19, 0.3, 0, -Math.PI / 2 + 0.2));
  const base = cyl(0.62, 0.7, 0.25, c3Prop('#2a2a30'), -0.95, 0.3, 0.1, 0.02, 20); g.add(base);
  const btn = cyl(0.48, 0.5, 0.32, c3Prop('#ff2a2a', { rough: 0.25, emissive: '#ff2a2a', ei: 0.25 }), -0.95, 0.55, 0.1, 0.02, 20); g.add(btn); g.userData.btn = btn;
  return g; }
// a thought cloud with an image inside (Flow photo), the little bubbles trailing down to the head (bottom-left)
function drawThought(x, w, h, img, dx = 0) {
  x.clearRect(0, 0, w, h); x.lineWidth = 12; x.strokeStyle = '#1a1210'; x.fillStyle = '#fffaf0';
  const puffs = [[0.5, 0.42, 0.32], [0.26, 0.46, 0.22], [0.74, 0.46, 0.22], [0.38, 0.26, 0.2], [0.63, 0.25, 0.2], [0.5, 0.62, 0.22], [0.3, 0.64, 0.15], [0.7, 0.64, 0.16]];
  for (const pass of [0, 1]) for (const [u, v, r] of puffs) { x.beginPath(); x.arc(u * w, v * h, r * w * 0.5, 0, TAU); pass ? x.fill() : x.stroke(); }
  for (const [u, v, r] of [[0.5, 0.83, 0.042], [0.5, 0.95, 0.027]]) { x.beginPath(); x.arc(u * w, v * h, r * w, 0, TAU); x.fill(); x.stroke(); }
  x.save(); x.beginPath(); x.ellipse(w * 0.5, h * 0.45, w * 0.36, h * 0.29, 0, 0, TAU); x.clip();
  if (!cover(x, img, w * 0.12, h * 0.14, w * 0.76, h * 0.6, dx)) { x.fillStyle = '#ffd0d0'; x.fillRect(0, 0, w, h); } x.restore(); }
// a comic burst with a word (CLICK, SOLD): yellow star with red rim
function texBurst(word, c1 = '#ffe23a', c2 = '#e8282a') { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.save(); x.translate(w / 2, h / 2); x.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = (i % 2 ? 0.34 : 0.48) * w; x.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); } x.closePath();
  x.fillStyle = c2; x.fill(); x.lineWidth = 10; x.strokeStyle = '#2a1208'; x.stroke(); x.scale(0.82, 0.82); x.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = (i % 2 ? 0.34 : 0.48) * w; x.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); } x.closePath(); x.fillStyle = c1; x.fill(); x.restore();
  inked(x, word, w / 2, h / 2 + 4, h * 0.22, '#e8282a', { stroke: '#2a1208', sw: h * 0.03, maxW: w * 0.6 }); }, 512, 512); }
// a camera-facing sprite plane (FOCUS layer, drawn over the set)
function spritePlane(scene, map, w, h, ro = 9) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = ro; scene.add(m); c3Layer(m, C3.L_FOCUS); m.visible = false; return m; }
