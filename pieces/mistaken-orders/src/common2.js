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
// the cast (mistaken-orders): role costumes (kit torso sprites, no baked sleeves) and exact Ricks Clips hair (rk_*);
// the three waiters share the restaurant's apron (a uniform), everyone else wears their own
const CAST = {
  you: { key: 'you', outfit: 'windgiletteal', hairStyle: 'rk_darkfringe' },                       // you, the diner
  wait: { key: 'wait', outfit: 'apron', hairStyle: 'rk_bungrey', fx: ['glasses'] },         // your waitress: silver bun with a pencil
  wait2: { key: 'wait2', outfit: 'apron', hairStyle: 'rk_combedgrey', fx: ['mustache_grey'] },    // waiter, grey moustache = hair colour
  wait3: { key: 'wait3', outfit: 'apron', hairStyle: 'rk_edisonwhite' },                          // waiter, white hair
  coffee: { key: 'coffee', outfit: 'polo', hairStyle: 'rk_partred' },                             // the coffee guy at the next table
  dir: { key: 'dir', outfit: 'leathergiletblack', hairStyle: 'rk_glasses' },                      // the TV director
  gran: { key: 'gran', outfit: 'grandma', hairStyle: 'curlygrey' },                              // the care-home resident who serves him
  c1: { key: 'c1', outfit: 'knitvestmaroon', hairStyle: 'rk_greycap' }, c2: { key: 'c2', outfit: 'sweater', hairStyle: 'rk_bun' },
  d1: { key: 'd1', outfit: 'tweed', hairStyle: 'rk_spiky' }, d2: { key: 'd2', outfit: 'sundress', hairStyle: 'rk_blackbob' },
  d3: { key: 'd3', outfit: 'puffer', hairStyle: 'rk_curly' }, d4: { key: 'd4', outfit: 'fleece', hairStyle: 'rk_sweepblond' },
  d5: { key: 'd5', outfit: 'raincoat', hairStyle: 'rk_genius' }, d6: { key: 'd6', outfit: 'jerseyorange', hairStyle: 'rk_kyle' },
  d7: { key: 'd7', outfit: 'sailorblue', hairStyle: 'rk_brownshort' }, d8: { key: 'd8', outfit: 'scrubspink', hairStyle: 'rk_brownbig' },
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
