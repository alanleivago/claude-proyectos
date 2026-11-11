// =====================================================================
//  SHARED SHOT HELPERS (guinea-rent, from cheese-bank): snap camera keys measured once per shot, toon people + toon
//  guinea pigs (styles/cartoon3d/toon.js + toon-pets.js), pop-up labels, redraw-on-change canvases.
// =====================================================================
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const spanOf = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// the first time word w is spoken at or after t0 (common words repeat)
const wAfter = (w, t0, fb) => { const x = WORDS.find((q) => q.s >= t0 - 0.01 && q.w.replace(/[^\w]/g, '').toLowerCase() === w.toLowerCase()); return x ? x.s : fb; };
// camera: SNAPS (hold, then snap to what the voice names) or the plain framing while the snap keys are being measured
// v2 (Ricks study, fuentes/cartoon3d/ricks-documentos-camara.md): the camera never holds — the framings change on the words
// with a 0.45 s eased move (not a 5-frame snap), and on top every shot pushes in (~10-20 %/s), orbits and cranes a little.
// CAMF[id] = { push (1/s), orbit (rad/s), crane (units/s), roll (deg/s) } overrides the defaults.
const CAMF = {}, CAM_EASE = 0.34;
function camMove(K, lt, id) {
  const free = SNAPS[id] === 'free';   // no framings: the shot's own camera + the drift
  if (!free && !(C3_SNAP && SNAPS[id] && !SNAP_BUILD)) { const c = c3CamAt(K, lt); return { p: c.p, l: c.l, fov: c.fov }; }
  const c = free ? c3CamAt(K, lt) : c3SnapCam(snapKeys(id, K), lt, CAM_EASE), i = SHOT_LIST.findIndex((r) => r[0] === id), F = Object.assign({ push: 0.13, orbit: (i % 2 ? 1 : -1) * 0.05, crane: 0.12, roll: 0 }, CAMF[id] || {});
  const P = V3(...c.p), L = V3(...c.l), off = P.clone().sub(L).applyAxisAngle(V3(0, 1, 0), F.orbit * lt).multiplyScalar(Math.exp(-F.push * lt));
  const p = L.clone().add(off); p.y += F.crane * lt; return { p: p.toArray(), l: c.l, fov: c.fov, roll: F.roll * lt * Math.PI / 180 };
}
// the snap keys of a shot, measured ONCE with the shot posed at each key's own time (a dry run): no jitter from moving arms.
// A mid-hold punch-in (+18 %, same subject) only where the hold is > 1.2 s.
let SNAP_BUILD = false; const SNAP_KEYS = {};
function snapKeys(id, K) {
  if (SNAP_KEYS[id]) return SNAP_KEYS[id];
  const c = c3CamAt(K, 0), dir = V3(...c.l).sub(V3(...c.p)), i = SHOT_LIST.findIndex((r) => r[0] === id), [t0, end] = shotSpan(i), S = SNAPS[id], keys = [];
  const boxAt = (t, tg) => { const keep = [C3_DRY, CUR_SHOT, TT]; SNAP_BUILD = true; C3_DRY = true; CUR_SHOT = id; TT = t;
    try { SHOT_FN[id](t, clamp((t - t0) / (end - t0)), t - t0); return snapBox(id, tg); } finally { SNAP_BUILD = false; [C3_DRY, CUR_SHOT, TT] = keep; } };
  S.forEach(([t, tg, fill], j) => { const t1 = j + 1 < S.length ? S[j + 1][0] : end, box = boxAt(Math.min(t + 0.25, t1 - 0.05), tg);
    keys.push([Math.max(0, t - t0), ...c3FrameBox(box, dir, fill, c.fov)]);
  });
  return (SNAP_KEYS[id] = keys);
}
// the world box of a snap target: [x, y, z, w, h, d] boxes, 'p:who' (a person / pet, whole), 'u:who' (head + torso),
// 'o:name' (a set mesh). Toon cards are mostly empty canvas, so people and pets get their drawn size, not the card's.
function snapBox(id, tg) {
  const set = SHOT_LIST.find((r) => r[0] === id)[2], s = SETS[set] && SETS[set](), B = new THREE.Box3();
  for (const x of tg) {
    if (Array.isArray(x)) { B.union(new THREE.Box3().setFromCenterAndSize(V3(x[0], x[1], x[2]), V3(x[3], x[4], x[5] ?? 0.5))); continue; }
    const [k, n] = x.split(':');
    if (k === 'o') { const o = s && s[n]; if (!o) continue; o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); if (!b.isEmpty()) B.union(b); continue; }
    const p = s && s.p && s.p[n]; if (!p || !p.g.visible) continue; const w = p.g.getWorldPosition(V3(0, 0, 0)), b = new THREE.Box3();
    if (p.pet) { const sz = p.petSize ?? 1; b.setFromCenterAndSize(V3(w.x, w.y + 0.85 * sz + (p.lift || 0), w.z), V3(2.6 * sz, 1.9 * sz, 1)); }
    else { const h = (p.sitting ? 0.78 : 1) * c3ToonDims(p).height + 0.5; b.setFromCenterAndSize(V3(w.x, h / 2, w.z), V3(4.6, h, 1)); if (k === 'u') b.min.y = b.max.y - h * 0.48; }
    B.union(b);
  }
  return B.isEmpty() ? new THREE.Box3().setFromCenterAndSize(V3(0, 8, 20), V3(10, 10, 1)) : B;
}
const SETS = {};   // set name -> getter (registered by each set file)
// ---- people + pets
// facing from a world-space motion direction, seen from the camera: front 0, 3/4 ±1, profile ±2, 'back'; + = screen right
function toonFacing(cam, x, z, vx, vz) {
  const c = new THREE.Vector3(cam.position.x - x, 0, cam.position.z - z).normalize(), r = new THREE.Vector3(c.z, 0, -c.x), l = Math.hypot(vx, vz) || 1;
  const toward = (vx * c.x + vz * c.z) / l, across = (vx * r.x + vz * r.z) / l, th = Math.atan2(Math.abs(across), toward);
  return th > 2.5 ? 'back' : Math.sign(across || 1) * Math.min(2, th * 4 / Math.PI);
}
// the facing that looks from (x, z) toward the world point (tx, tz)
const faceTo = (cam, x, z, tx, tz) => toonFacing(cam, x, z, tx - x, tz - z);
// the cast: role costumes, hair + colours not used in earlier pieces
const CAST = {
  you: { key: 'you', hair: 'mop', hairColor: 'chestnut', outfit: 'hoodie', colors: { main: '#3b78c4', cord: '#f2efe8' }, body: 'avg' },          // the owner (young guy)
  lady: { key: 'lady', hair: 'bun', hairColor: 'white', outfit: 'sweater', colors: { main: '#c65a78', rib: '#a8465f' }, glasses: true, skin: 'peach', body: 'short' },   // the rental lady
  official: { key: 'official', hair: 'side', hairColor: 'dark', outfit: 'suit', colors: { main: '#4a4d58', shirt: '#f5f2ec', tie: '#d8282a' }, glasses: true, body: 'tall' },   // the Swiss official
};
// the guinea pigs: Gerald (ginger + white blaze + rosette tuft), his friend (white with black-brown patches), the young
// one (cream, small), the rented one (grey, white muzzle, white brow tufts, sleepy), and herd variations
const PETS = {
  gerald: { key: 'gerald', fur: '#d97f34', patches: [[1.1, -0.2, 0.32, 1.0, '#fbf3e6'], [-1.3, 0.1, 0.8, 0.7, '#8a4a22']], muzzle: '#fbf3e6', tuft: true },
  friend: { key: 'friend', fur: '#f7f1e6', patches: [[-1.1, -0.4, 0.9, 0.8, '#3a2a24'], [0.9, -0.85, 0.55, 0.45, '#9a5a2a']], muzzle: '#fbf6ee', ear: '#3a2a24' },
  young: { key: 'young', fur: '#f0d39a', patches: [[-1.0, -0.3, 0.7, 0.6, '#ffffff']], muzzle: '#fff8ea', size: 0.68 },
  old: { key: 'old', fur: '#9c9893', patches: [[-1.2, -0.5, 0.9, 0.7, '#7c7874'], [1.0, 0.6, 0.6, 0.4, '#d8d4ce']], muzzle: '#eeebe6', ear: '#77736e', old: true },
};
const HERD_FUR = [['#d9a066', '#ffffff'], ['#3a302c', '#d8843a'], ['#f4efe8', '#c8682a'], ['#7a5232', '#f0e2c8'], ['#e2c58e', '#8a5a32'], ['#c8c4be', '#5a5450'], ['#b0622c', '#f8f2e8'], ['#2e2a28', '#f6f0e6'], ['#efe4cc', '#a0a0a0']];
function herdPet(i) { const [a, b] = HERD_FUR[i % HERD_FUR.length], r = (k) => t3Rnd(i + 7, k);
  return { key: 'h' + i, fur: a, patches: [[-1.2 + r(1) * 0.6, -0.5 + r(2) * 0.6, 0.6 + r(3) * 0.4, 0.5 + r(4) * 0.3, b]], muzzle: t3Mix(a, '#fff6ea', 0.6), tuft: r(5) > 0.7, size: 0.85 + r(6) * 0.25 }; }
function toonPerson(s, who) { const p = c3ToonChar(CAST[who]); s.scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); s.p[who] = p; p.g.visible = false; return p; }
function toonPet(s, name, o) { const p = c3ToonPet(o); p.petSize = o.size ?? 1; s.scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); s.p[name] = p; p.g.visible = false; return p; }
// pose a person at (x, z) on the floor (o.y lifts the root, e.g. a seat)
function pose(s, who, t, x, z, o = {}) { const p = s.p[who]; p.g.visible = true; p.g.position.set(x, o.y ?? 0, z); p.sitting = !!o.sit; return c3ToonPose(p, s.cam, t, o); }
// pose a pet at (x, y, z) (y = the surface it stands on)
function petAt(s, name, t, x, y, z, o = {}) { const p = s.p[name]; if (o.facing === 'back') o = Object.assign({}, o, { facing: 1.6 }); p.g.visible = true; p.g.position.set(x, y, z); p.lift = (o.hop || 0) * 150 * T3P.scale * T3.U * (p.petSize ?? 1); return c3ToonPetPose(p, s.cam, t, o); }
const hideAll = (s) => { for (const k in s.p) s.p[k].g.visible = false; };
// keyframe value helper: [[t, v], ...] -> the value in force at t
const keyAt = (K, t) => { let v = K[0][1]; for (const [k, x] of K) if (k <= t) v = x; return v; };
// a hop that snaps up and lands (0..1..0 over d s), for 'popcorning'
const hopAt = (t, t0, d = 0.32) => { const x = (t - t0) / d; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); };
// ---- labels, canvases
function canvasTex(w, h) { const cv = Object.assign(document.createElement('canvas'), { width: w, height: h }), t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return { cv, t, key: null }; }
function redraw(C, key, draw) { if (C.key === key) return; C.key = key; draw(C.cv.getContext('2d'), C.cv.width, C.cv.height); C.t.needsUpdate = true; }
const facing = (m, cam) => { m.quaternion.copy(cam.quaternion); };
const pop = (t, t0, d = 0.25) => t < t0 ? 0 : EZ.back(clamp((t - t0) / d));
const popAt = (m, k, pos, cam, sc = 1) => { m.visible = k > 0.01; if (!m.visible) return; m.position.set(...pos); facing(m, cam); m.scale.setScalar(k * sc); };
// a camera-facing sprite plane (FOCUS layer, drawn over the set)
function spritePlane(scene, map, w, h, ro = 9) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = ro; scene.add(m); c3Layer(m, C3.L_FOCUS); m.visible = false; return m; }
// a comic burst with a word: yellow star with a red rim
function texBurst(word, c1 = '#ffe23a', c2 = '#e8282a') { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.save(); x.translate(w / 2, h / 2);
  const star = () => { x.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = (i % 2 ? 0.34 : 0.48) * w; x.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); } x.closePath(); };
  star(); x.fillStyle = c2; x.fill(); x.lineWidth = 10; x.strokeStyle = '#2a1208'; x.stroke(); x.scale(0.82, 0.82); star(); x.fillStyle = c1; x.fill(); x.restore();
  inked(x, word, w / 2, h / 2 + 4, h * 0.2, '#e8282a', { stroke: '#2a1208', sw: h * 0.03, maxW: w * 0.6 }); }, 512, 512); }
// a stamp: a rotated rounded box with a word
function texStamp(word, c = '#d8282a', rot = -0.18) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(rot);
  g.lineWidth = 22; g.strokeStyle = '#2a1208'; g.beginPath(); g.roundRect(-w * 0.44, -h * 0.3, w * 0.88, h * 0.6, 24); g.stroke(); g.lineWidth = 14; g.strokeStyle = c; g.stroke();
  inked(g, word, 0, 6, h * 0.3, c, { stroke: '#2a1208', sw: h * 0.025, maxW: w * 0.78 }); g.restore(); }, 768, 384); }
// a speech bubble with one or two lines
function texSay(l1, l2 = '', tailR = false) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.ellipse(w / 2, h * 0.42, w * 0.46, h * 0.36, 0, 0, TAU);
  const tx = tailR ? w * 0.68 : w * 0.32; g.moveTo(tx - 30, h * 0.72); g.lineTo(tx + (tailR ? 50 : -50), h * 0.97); g.lineTo(tx + 34, h * 0.75);
  g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke();
  inked(g, l1, w / 2, h * (l2 ? 0.33 : 0.42), h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.78 }); if (l2) inked(g, l2, w / 2, h * 0.53, h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.78 }); }, 640, 400); }
// a heart sprite
function texHeart(c = '#e8344a') { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, h * 0.86); g.bezierCurveTo(w * 0.04, h * 0.5, w * 0.2, h * 0.08, w / 2, h * 0.32); g.bezierCurveTo(w * 0.8, h * 0.08, w * 0.96, h * 0.5, w / 2, h * 0.86);
  g.fillStyle = c; g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a1208'; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(w * 0.33, h * 0.3, w * 0.07, h * 0.05, -0.6, 0, TAU); g.fill(); }, 256, 256); }
// floating dust motes (Ricks: particles in the air), a BG-layer Points cloud drifting slowly; seeded, stateless
function dustCloud(scene, box, n = 160, col = '#fff2d0') {
  const R = RNG('dust', n), pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([box[0] + R.f() * box[3], box[1] + R.f() * box[4], box[2] + R.f() * box[5], R.f() * TAU]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = c3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 32);
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, map: dot, size: 0.22, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  m.userData.noInk2 = true; m.userData.noCast = true; m.userData.noShade = true; scene.add(m);
  m.visible = false;   // v2: off (the ink pass drew them as black specks)
  m.userData.tick = (t) => { base.forEach(([x, y, z, ph], i) => { pos[i * 3] = x + 0.6 * Math.sin(t * 0.3 + ph); pos[i * 3 + 1] = y + 0.5 * Math.sin(t * 0.21 + ph * 2); pos[i * 3 + 2] = z + 0.6 * Math.cos(t * 0.25 + ph); }); geo.attributes.position.needsUpdate = true; };
  return m;
}
// haze: exponential fog on the set; people, labels and sprites (alpha-tested / transparent) stay crisp over it
function haze(scene, col, d) { scene.fog = new THREE.FogExp2(col, d); }
function noFogOnCards(scene) { scene.traverse((m) => { if (m.isMesh && m.material && (m.material.alphaTest > 0 || m.material.transparent)) m.material.fog = false; }); }
// ---- the RENT-A-PIG box: cardboard, air holes, a handle slot, four flaps hinged on the top edges (open(k) 0..1)
let GR_BOXM = null;
function rentBox(s = 1) {
  GR_BOXM ||= { card: c3Prop('#c9935c', { rough: 0.8 }), in: c3Prop('#7a5230', { rough: 0.9 }),
    side: c3Prop('#ffffff', { rough: 0.8, map: tex((g, w, h) => { g.fillStyle = '#c9935c'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,80,40,0.25)'; g.fillRect(0, h * 0.46, w, 6);
      g.fillStyle = 'rgba(200,170,110,0.75)'; g.fillRect(w * 0.42, 0, w * 0.16, h * 0.5);   // packing tape (v2: no air-hole 'face')
      g.fillStyle = '#d8282a'; g.beginPath(); g.roundRect(w * 0.1, h * 0.56, w * 0.8, h * 0.3, 18); g.fill(); inked(g, 'RENT-A-PIG', w / 2, h * 0.71, h * 0.15, '#ffffff', { stroke: false, maxW: w * 0.72 }); }, 512, 384) }) };
  const M = GR_BOXM, g = new THREE.Group(), w = 2.8, h = 2.0, d = 2.2, th = 0.08;
  g.add(rb(w, th, d, M.card, 0, th / 2, 0, 0.015));
  for (const [x, z, ww, dd, ry] of [[0, d / 2, w, th, 0], [0, -d / 2, w, th, 0], [w / 2, 0, d, th, Math.PI / 2], [-w / 2, 0, d, th, Math.PI / 2]]) {
    const m = c3Mesh(new THREE.BoxGeometry(ww, h, th), [M.card, M.card, M.card, M.card, ry ? M.card : M.side, M.in], 0.02); m.position.set(x, h / 2, z); m.rotation.y = ry; g.add(m); }
  g.userData.flaps = [];
  for (const [x, z, ww, dd, ax, sg] of [[0, d / 2, w, d / 2, 'x', 1], [0, -d / 2, w, d / 2, 'x', -1], [w / 2, 0, w / 2, d, 'z', 1], [-w / 2, 0, w / 2, d, 'z', -1]]) {
    const hinge = new THREE.Group(); hinge.position.set(x, h + (ax === 'z' ? 0.06 : 0), z); g.add(hinge);
    const f = rb(ww, 0.06, dd, M.card, ax === 'x' ? 0 : -sg * ww / 2, 0, ax === 'x' ? -sg * dd / 2 : 0, 0.012);
    hinge.add(f); g.userData.flaps.push([hinge, ax, sg]); }
  g.userData.open = (k) => g.userData.flaps.forEach(([hg, ax, sg], i) => { const a = (Math.PI * 0.74 + i * 0.05) * k; if (ax === 'x') hg.rotation.x = sg * a; else hg.rotation.z = -sg * a; });
  g.userData.open(0); g.scale.setScalar(s); return g;
}
function texTiles(c1, c2, rep) { const t = tex((g, w, h) => { for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.fillStyle = (i + j) % 2 ? c1 : c2; g.fillRect(i * w / 4, j * h / 4, w / 4, h / 4); }
  g.strokeStyle = 'rgba(60,40,20,0.35)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; }
