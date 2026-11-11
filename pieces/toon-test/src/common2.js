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
  if (C3_SNAP && SNAPS[id] && !SNAP_BUILD) return c3SnapCam(snapKeys(id, K), lt);   // ref 6WTahOqdEl4: hold, then snap to what the voice names
  if (C3_SNAP) { const c = c3CamAt(K, lt); return { p: c.p, l: c.l, fov: c.fov }; }   // (while snap keys are being measured: the plain framing)
  const c = c3CamAt(K, lt), [a, b] = spanOf(id), dur = b - a;
  const P = V3(...c.p), L = V3(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(V3(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
// the snap keys of a shot, measured ONCE (user: the camera shook when targets were re-measured every frame as arms moved):
// each target box is read with the shot posed at that key's own time (a dry run), so every frame and every export worker
// gets the same keys. A mid-hold punch-in (+18 %, same subject) only where the hold is > 1.2 s.
let SNAP_BUILD = false; const SNAP_KEYS = {};
function snapKeys(id, K) {
  if (SNAP_KEYS[id]) return SNAP_KEYS[id];
  const c = c3CamAt(K, 0), dir = V3(...c.l).sub(V3(...c.p)), i = SHOT_LIST.findIndex((r) => r[0] === id), [t0, end] = shotSpan(i), S = SNAPS[id], keys = [];
  const boxAt = (t, tg) => { const keep = [C3_DRY, CUR_SHOT, TT]; SNAP_BUILD = true; C3_DRY = true; CUR_SHOT = id; TT = t;
    try { SHOT_FN[id](t, clamp((t - t0) / (end - t0)), t - t0); return snapBox(id, tg); } finally { SNAP_BUILD = false; [C3_DRY, CUR_SHOT, TT] = keep; } };
  S.forEach(([t, tg, fill], j) => { const t1 = j + 1 < S.length ? S[j + 1][0] : end, box = boxAt(Math.min(t + 0.25, t1 - 0.05), tg);
    const fk = typeof SNAP_FILLK !== 'undefined' && tg.some((q) => typeof q === 'string') ? Math.min(0.95, fill * SNAP_FILLK) : fill; keys.push([Math.max(0, t - t0), ...c3FrameBox(box, dir, fk, c.fov)]);
    if (t1 - t > 1.2) keys.push([(t + t1) / 2 - t0, ...c3FrameBox(box, dir, Math.min(0.95, fill * 1.18 * (typeof SNAP_FILLK !== 'undefined' && tg.some((q) => typeof q === 'string') ? SNAP_FILLK : 1)), c.fov)]); });
  return (SNAP_KEYS[id] = keys);
}
// the world box of a snap target list (see SNAPS in shots.js); people are read live from the shot's set
function snapBox(id, tg) {
  const set = SHOT_LIST.find((r) => r[0] === id)[2], s = { bank: BK.s, piazza: PZ.s, dairy: DY.s }[set], B = new THREE.Box3();
  for (const x of tg) {
    if (Array.isArray(x)) { B.union(new THREE.Box3().setFromCenterAndSize(V3(x[0], x[1], x[2]), V3(x[3], x[4], x[5] ?? 0.5))); continue; }
    const [k, n] = x.split(':'), o = k === 'o' ? s && s[n] : s && s.p && s.p[n] && s.p[n].g; if (!o) continue;
    o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) continue;
    if (k === 'u') b.min.y = b.max.y - (b.max.y - b.min.y) * 0.55;
    B.union(b);
  }
  return B.isEmpty() ? new THREE.Box3().setFromCenterAndSize(V3(0, 8, 20), V3(10, 10, 1)) : B;
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
// the cast (cheese-bank): role costumes (kit torso sprites, no baked sleeves) and exact Ricks Clips hair (rk_*), one each
const CAST = {
  you: { key: 'you', outfit: 'smock', hairStyle: 'rk_sweep' },                                 // you, the cheesemaker
  banker: { key: 'banker', outfit: 'suit', hairStyle: 'rk_combedgrey', fx: ['mustache_grey'] }, // the banker (grey moustache = hair)
  guard: { key: 'guard', outfit: 'guard', hairStyle: 'rk_boss' },                              // the security guard
  teller: { key: 'teller', outfit: 'blouse', hairStyle: 'rk_bun' },
  w1: { key: 'w1', outfit: 'hivis', hairStyle: 'rk_curly' }, w2: { key: 'w2', outfit: 'cargo', hairStyle: 'rk_spiky' },   // warehouse workers
  c1: { key: 'c1', outfit: 'tweed', hairStyle: 'rk_genius' }, c2: { key: 'c2', outfit: 'dress', hairStyle: 'rk_blackbob' },
  c3: { key: 'c3', outfit: 'polka', hairStyle: 'rk_kyle' }, c4: { key: 'c4', outfit: 'fleece', hairStyle: 'rk_sweepblond' },
  p1: { key: 'p1', outfit: 'white', hairStyle: 'rk_edison' }, p2: { key: 'p2', outfit: 'puffer', hairStyle: 'rk_brownbig' },
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
// =====================================================================
//  FOOD + PROP HELPERS (mistaken-orders) — gyoza plate, burger plate, coffee cup, straws, spoon, notepad, tray,
//  props held in the real fist, two-line speech bubbles. Units: head radius 1, a table top at y ~3.9.
// =====================================================================
const MO_M = {};
const moM = (k, c, o) => MO_M[k] ||= c3Prop(c, Object.assign({ rough: 0.45 }, o || {}));
function plateMesh(r = 1.05) { const g = new THREE.Group(); g.add(cyl(r, r * 0.8, 0.14, moM('plate', '#fbf8f2', { rough: 0.25 }), 0, 0.07, 0, 0.012, 28));
  const rim = c3Mesh(new THREE.TorusGeometry(r * 0.86, 0.035, 6, 36), moM('rim', '#3f6fb5'), 0); rim.rotation.x = Math.PI / 2; rim.position.y = 0.15; g.add(rim); return g; }
// one gyoza: a pleated half-moon dumpling, golden bottom
function gyoza() { const g = new THREE.Group();
  const b = c3Mesh(new THREE.SphereGeometry(0.42, 14, 8, 0, TAU, 0, Math.PI / 2), moM('gyoza', '#f6ead0', { rough: 0.6 }), 0.01); b.scale.set(1, 0.62, 0.48); g.add(b);
  const crust = c3Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 14), moM('crust', '#d8913a', { rough: 0.6 }), 0); crust.scale.set(1, 1, 0.48); crust.position.y = 0.02; g.add(crust);
  for (let i = -2; i <= 2; i++) { const p = c3Mesh(new THREE.SphereGeometry(0.06, 6, 4), moM('pleat', '#e8d8b8'), 0); p.position.set(i * 0.13, 0.25 - Math.abs(i) * 0.02, 0); g.add(p); }
  return g; }
function gyozaPlate(n = 3) { const g = plateMesh(); n = Math.min(n, 3); for (let i = 0; i < n; i++) { const d = gyoza(); d.position.set((i - (n - 1) / 2) * 0.55, 0.14, (i % 2) * 0.12); d.rotation.y = 0.15; d.scale.setScalar(1.05); g.add(d); } return g; }   // a clean row of gyoza (review: the ring read as teeth)
function burgerMesh(s = 1) { const g = new THREE.Group(), L = [['bunB', '#d88a3a', 0.62, 0.22], ['patty', '#5a2e18', 0.66, 0.2], ['cheese', '#ffc21a', 0.7, 0.06], ['lettuce', '#4fb83a', 0.72, 0.07], ['tomato', '#e8322a', 0.6, 0.08]];
  let y = 0; for (const [k, c, r, h] of L) { g.add(cyl(r, r, h, moM(k, c), 0, y + h / 2, 0, 0.01, 20)); y += h; }
  const top = c3Mesh(new THREE.SphereGeometry(0.66, 20, 10, 0, TAU, 0, Math.PI / 2), moM('bunT', '#e0963e'), 0.012); top.scale.y = 0.62; top.position.y = y; g.add(top);
  for (let i = 0; i < 7; i++) { const sd = c3Mesh(new THREE.SphereGeometry(0.035, 5, 3), moM('seed', '#fff6dc'), 0); const a = i * 2.4, r = 0.18 + (i % 3) * 0.13; sd.position.set(Math.cos(a) * r, y + 0.4 - r * 0.3, Math.sin(a) * r); g.add(sd); }
  g.scale.setScalar(s); return g; }
function burgerPlate() { const g = plateMesh(); const b = burgerMesh(1); b.position.y = 0.14; g.add(b); return g; }
function cupMesh(full = true) { const g = new THREE.Group(); g.add(cyl(0.62, 0.62, 0.06, moM('plate', '#fbf8f2'), 0, 0.03, 0, 0.01, 22));
  if (full) { g.add(cyl(0.34, 0.26, 0.55, moM('cup', '#ffffff', { rough: 0.25 }), 0, 0.33, 0, 0.012, 18)); g.add(cyl(0.3, 0.3, 0.02, moM('coffee', '#6a3a1a'), 0, 0.6, 0, 0, 18)); }
  return g; }
function strawMesh(c = '#e8322a') { const g = new THREE.Group(); g.add(cyl(0.05, 0.05, 2.2, moM('straw' + c, c), 0, 0, 0, 0.006, 8)); g.rotation.z = Math.PI / 2; return g; }
function spoonMesh() { const g = new THREE.Group(), m = moM('spoon', '#eef2f6', { rough: 0.3 });
  const h = rb(1.3, 0.05, 0.14, m, 0.35, 0, 0, 0.005); g.add(h); const b = c3Mesh(new THREE.SphereGeometry(0.22, 12, 6, 0, TAU, 0, Math.PI / 2), m, 0.006); b.scale.set(1.5, 0.35, 1.0); b.rotation.x = Math.PI; b.position.set(-0.5, 0.06, 0); g.add(b); return g; }
function trayMesh() { const g = new THREE.Group(); g.add(rb(3.2, 0.12, 2.2, moM('tray', '#8a4a2a'), 0, 0, 0, 0.012)); return g; }
// a prop carried in the fist (built once on p.root; o.dx/dy/dz offset in billboard units)
function holdProp(p, key, arm, make, o = {}) {
  p.held ||= {}; let m = p.held[key];
  if (!m) { m = p.held[key] = make(); p.root.add(m); c3Layer(m, C3.L_FOCUS); m.traverse((q) => { q.renderOrder = 6; }); }
  const f = fistLocal(p, arm); m.visible = true; m.position.set(f.x + (o.dx ?? 0), f.y + (o.dy ?? 0), f.z + (o.dz ?? 0.1)); m.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0); m.scale.setScalar(o.s ?? 1); return m;
}
const hideHeld = (p) => { if (p.held) for (const k in p.held) p.held[k].visible = false; };
// a speech bubble with one or two lines (tail at the bottom-left)
function texSay(l1, l2 = '', tailR = false) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.ellipse(w / 2, h * 0.42, w * 0.46, h * 0.36, 0, 0, TAU);
  const tx = tailR ? w * 0.68 : w * 0.32; g.moveTo(tx - 30, h * 0.72); g.lineTo(tx + (tailR ? 50 : -50), h * 0.97); g.lineTo(tx + 34, h * 0.75);
  g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke();
  inked(g, l1, w / 2, h * (l2 ? 0.33 : 0.42), h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.78 }); if (l2) inked(g, l2, w / 2, h * 0.53, h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.78 }); }, 640, 400); }
// a thought cloud holding a Flow photo (canvas built once)
function texCloud(file) { return tex((g, w, h) => drawThought(g, w, h, asset(file)), 512, 512); }
// tablecloths + floor tiles (kit c3TexWall has no check/dots kinds)
function texCheck(c, rep = 3) { const t = tex((g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.fillStyle = c; g.globalAlpha = 0.55;
  for (let i = 0; i < 8; i += 2) { g.fillRect(i * w / 8, 0, w / 8, h); g.fillRect(0, i * h / 8, w, h / 8); } g.globalAlpha = 1; }, 256, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t; }
function texDots(c, rep = 3) { const t = tex((g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.fillStyle = c;
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.beginPath(); g.arc((i + 0.5 + (j % 2) * 0.5) * w / 4, (j + 0.5) * h / 4, 14, 0, TAU); g.fill(); } }, 256, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t; }
function texTiles(c1, c2, rep) { const t = tex((g, w, h) => { for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.fillStyle = (i + j) % 2 ? c1 : c2; g.fillRect(i * w / 4, j * h / 4, w / 4, h / 4); }
  g.strokeStyle = 'rgba(60,40,20,0.35)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; }
// =====================================================================
//  CHEESE HELPERS (cheese-bank) — the Parmigiano wheel (golden rind with the pin-dot lettering), painted racks of wheels
//  for the far shelves, bills, the calendar. Units: head radius 1; a wheel is ~3.2 across, 1.2 tall.
// =====================================================================
function texRind() { const t = tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d89a3a'); gr.addColorStop(0.5, '#f0c060'); gr.addColorStop(1, '#c8862e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,70,20,0.55)'; const R0 = RNG('rind'); for (let i = 0; i < 260; i++) { g.beginPath(); g.arc(R0.f() * w, h * 0.25 + R0.f() * h * 0.5, 2.2, 0, TAU); g.fill(); }
  g.font = '900 34px Arial'; g.textAlign = 'center'; g.fillStyle = 'rgba(110,60,15,0.75)'; for (let k = 0; k < 2; k++) g.fillText('PARMIGIANO REGGIANO', w * (0.25 + k * 0.5), h * 0.6); }, 1024, 128);
  t.wrapS = THREE.RepeatWrapping; return t; }
function texWheelTop() { return tex((g, w, h) => { g.fillStyle = '#f2c862'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, TAU); g.fill(); g.strokeStyle = '#c8862e'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 8, 0, TAU); g.stroke();
  g.fillStyle = 'rgba(200,140,50,0.35)'; const R0 = RNG('wtop'); for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(w / 2 + R0.n(70), h / 2 + R0.n(70), 3 + R0.f() * 5, 0, TAU); g.fill(); } }, 256, 256); }
let CB_WM = null;
function wheelMesh(s = 1) { CB_WM ||= [c3Prop('#ffffff', { map: texRind(), rough: 0.55 }), c3Prop('#ffffff', { map: texWheelTop(), rough: 0.6 })];
  const m = c3Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.15, 28, 1), [CB_WM[0], CB_WM[1], CB_WM[1]], 0.02); m.scale.setScalar(s); return m; }
// a rack face painted with rows of wheels seen side-on (far shelves), rows x cols
function texWheelRack(rows = 6, cols = 6, seed = 1) { return tex((g, w, h) => { const R0 = RNG('rack', seed), rh = h / rows; g.fillStyle = '#6a3a1e'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) { g.fillStyle = '#3a2010'; g.fillRect(0, r * rh, w, rh * 0.86); for (let c = 0; c < cols; c++) { if (R0.f() < 0.04) continue; const x = (c + 0.5) * w / cols, y = r * rh + rh * 0.47, rw = w / cols * 0.44, rhh = rh * 0.34;
      const gr = g.createLinearGradient(0, y - rhh, 0, y + rhh); gr.addColorStop(0, '#d89a3a'); gr.addColorStop(0.5, '#f4c868'); gr.addColorStop(1, '#b8782a'); g.fillStyle = gr; g.beginPath(); g.roundRect(x - rw, y - rhh, rw * 2, rhh * 2, rhh * 0.5); g.fill();
      g.strokeStyle = '#140e10'; g.lineWidth = 4; g.stroke(); g.fillStyle = 'rgba(120,70,20,0.5)'; for (let k = 0; k < 10; k++) g.fillRect(x - rw * 0.8 + k * rw * 0.17, y - 2, 3, 3); }
    g.fillStyle = '#9a5a30'; g.fillRect(0, r * rh + rh * 0.86, w, rh * 0.14); g.fillStyle = '#140e10'; g.fillRect(0, r * rh + rh * 0.86, w, 3); } }, 512, 1024); }
// a bill / payslip card: title, lines, an amount; o.stamp = a red stamp word
function texBill2(title, amount, o = {}) { return tex((g, w, h) => { g.fillStyle = o.bg ?? '#fffaf0'; g.fillRect(0, 0, w, h); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = o.band ?? '#c8323a'; g.fillRect(12, 12, w - 24, h * 0.2); inked(g, title, w / 2, h * 0.12, h * 0.1, '#ffffff', { stroke: false, maxW: w * 0.85 });
  if (o.icon) inked(g, o.icon, w / 2, h * 0.42, h * 0.2, '#2a1208', { stroke: false });
  g.fillStyle = 'rgba(40,30,20,0.4)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.12, h * (0.6 + k * 0.07), w * (0.5 + 0.1 * k), 6);
  inked(g, amount, w / 2, h * 0.88, h * 0.1, '#2a1208', { stroke: false, maxW: w * 0.8 });
  if (o.stamp) { g.save(); g.translate(w / 2, h * 0.5); g.rotate(-0.3); g.strokeStyle = '#d23b3b'; g.lineWidth = 12; g.strokeRect(-w * 0.4, -h * 0.09, w * 0.8, h * 0.18); inked(g, o.stamp, 0, 4, h * 0.11, '#d23b3b', { stroke: false, maxW: w * 0.72 }); g.restore(); } }, 400, 520); }
const popAt = (m, k, pos, cam, sc = 1) => { m.visible = k > 0.01; if (!m.visible) return; m.position.set(...pos); facing(m, cam); m.scale.setScalar(k * sc); };
