// =====================================================================
//  SET street — the rainy night city street and its bus stop: s01 s02 s06 s07 s10 s11 s12 s13 s31 s32 s33.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed stz.
//  One world, built once: shops with neon along the back (z -4), the sidewalk, the bus shelter (x 0) with a glowing
//  ad box and a bench, a street clock (11:47), a payphone (OUT OF ORDER), lamps with rain in their light cones,
//  the curb (z 10) and the wet road with a taxi that splashes past. Rain = instanced streaks + splash rings.
//  People are c3Person billboards at STZ_K x (refs: people are big); a standing person's root sits at STZ_FOOT.
// =====================================================================
const STZ = {};
const STZ_K = 1.35, STZ_FOOT = 2.55 * STZ_K, STZ_SEAT = 2.35;
const stzW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const stzV = (x, y, z) => new THREE.Vector3(x, y, z);
const stzSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a ~5 %/s creep and a slow orbit keep it alive, and the last
// 0.35 s accelerate into the cut (running on through the dissolve). K: [[lt, pos, look, fov], ...] shot-local.
function stzCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = stzSpan(id), dur = b - a;
  const P = stzV(...c.p), L = stzV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(stzV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const stzRack = (lt, id, a, b) => { const [t0, t1] = stzSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the
// camera moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function stzFg(s, list, K, id, lt, o = {}) {
  const c = STZ.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
  c3SetCam(c, stzCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = stzV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(stzV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const stzRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#06070e', bgBlur: 2.6, nearBlur: 9, glow: 0.7, glowBlur: 16, bloom: 0.24 }, o));

// ---- textures
function stzTexSlabs() {
  const t = tex((x, w, h) => { x.fillStyle = '#4a4c58'; x.fillRect(0, 0, w, h); const R = RNG('slab');
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.fillStyle = `hsl(230,${8 + R.r(0, 6)}%,${27 + R.r(-4, 4)}%)`; x.fillRect(i * w / 4 + 3, j * h / 4 + 3, w / 4 - 6, h / 4 - 6); }
    x.fillStyle = 'rgba(160,180,230,0.10)'; for (let i = 0; i < 30; i++) { x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(10, 40), R.r(4, 14), 0, 0, TAU); x.fill(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 3); return t;
}
function stzTexRoad() {
  const t = tex((x, w, h) => { x.fillStyle = '#1c1d26'; x.fillRect(0, 0, w, h); const R = RNG('road');
    for (let i = 0; i < 600; i++) { x.fillStyle = `rgba(${R.r(40, 90)},${R.r(40, 90)},${R.r(60, 110)},0.35)`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
    x.fillStyle = '#d8c060'; for (let i = 0; i < 4; i++) x.fillRect(i * w / 4 + 20, h * 0.48, w / 8, h * 0.04); }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); return t;
}
function stzTexBrick(hue) {
  const t = tex((x, w, h) => { x.fillStyle = `hsl(${hue},28%,20%)`; x.fillRect(0, 0, w, h); const R = RNG('brick', hue);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) { x.fillStyle = `hsl(${hue + R.n(8)},${30 + R.r(-6, 6)}%,${24 + R.r(-5, 5)}%)`; x.fillRect(i * w / 8 + (j % 2) * w / 16 + 2, j * h / 16 + 2, w / 8 - 4, h / 16 - 4); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}
function stzTexShutter() {
  return tex((x, w, h) => { for (let i = 0; i < 24; i++) { x.fillStyle = i % 2 ? '#8a8e9a' : '#727684'; x.fillRect(0, i * h / 24, w, h / 24); } x.fillStyle = 'rgba(20,20,30,0.5)'; x.fillRect(w * 0.45, h * 0.9, w * 0.1, h * 0.05);
    x.strokeStyle = 'rgba(200,60,140,0.55)'; x.lineWidth = 8; x.beginPath(); x.moveTo(w * 0.2, h * 0.5); x.bezierCurveTo(w * 0.35, h * 0.3, w * 0.5, h * 0.7, w * 0.7, h * 0.45); x.stroke(); }, 256, 256);   // a tag sprayed on the shutter
}
function stzTexStreak(c) {   // a reflection of a light on wet ground: a soft vertical streak
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'destination-in'; const r = x.createLinearGradient(0, 0, w, 0); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(0.5, '#000'); r.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = r; x.fillRect(0, 0, w, h); }, 64, 256);
}
function stzTexClock() {
  return tex((x, w, h) => { x.fillStyle = '#f4ecd8'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.48, 0, TAU); x.fill(); x.lineWidth = w * 0.04; x.strokeStyle = '#2a2a30'; x.stroke();
    x.fillStyle = '#2a2a30'; x.font = `700 ${w * 0.1}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - Math.PI / 2; x.fillText(String(i), w / 2 + Math.cos(a) * w * 0.37, h / 2 + Math.sin(a) * h * 0.37); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; x.fillRect(w / 2 + Math.cos(a) * w * 0.44 - 1, h / 2 + Math.sin(a) * h * 0.44 - 1, i % 5 ? 2 : 5, i % 5 ? 2 : 5); } }, 512, 512);
}
function stzTexMap() {
  return tex((x, w, h) => { x.fillStyle = '#efe6c8'; x.fillRect(0, 0, w, h); const R = RNG('map');
    x.fillStyle = '#b8d8a0'; for (let i = 0; i < 6; i++) x.fillRect(R.r(0, w * 0.8), R.r(0, h * 0.8), R.r(30, 90), R.r(30, 80));
    x.fillStyle = '#9cc4e4'; x.beginPath(); x.moveTo(0, h * 0.7); x.bezierCurveTo(w * 0.3, h * 0.6, w * 0.6, h * 0.9, w, h * 0.75); x.lineTo(w, h * 0.85); x.bezierCurveTo(w * 0.6, h, w * 0.3, h * 0.7, 0, h * 0.8); x.fill();
    x.strokeStyle = '#d88a3a'; x.lineWidth = 6; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(R.r(0, w), 0); x.lineTo(R.r(0, w), h); x.stroke(); x.beginPath(); x.moveTo(0, R.r(0, h)); x.lineTo(w, R.r(0, h)); x.stroke(); }
    x.strokeStyle = 'rgba(80,60,40,0.4)'; x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke();   // the folds
    inked(x, 'CITY MAP', w / 2, h * 0.1, h * 0.07, '#7a3a1a', { stroke: false, maxW: w * 0.6 }); }, 512, 400);
}
function stzTexOutOfOrder() {
  return tex((x, w, h) => { x.fillStyle = '#fbf4dc'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(200,200,180,0.8)'; x.fillRect(w * 0.1, 0, w * 0.18, h * 0.08); x.fillRect(w * 0.72, 0, w * 0.18, h * 0.08);   // tape
    inked(x, 'OUT OF', w / 2, h * 0.38, h * 0.2, '#c8281e', { stroke: false, maxW: w * 0.84 }); inked(x, 'ORDER', w / 2, h * 0.66, h * 0.24, '#c8281e', { stroke: false, maxW: w * 0.84 }); }, 256, 192);
}
function stzTexPayphone() {
  return tex((x, w, h) => { x.fillStyle = '#2a3a6a'; x.fillRect(0, 0, w, h); x.fillStyle = '#dfe4ee'; x.fillRect(w * 0.1, h * 0.05, w * 0.8, h * 0.12);
    inked(x, 'PHONE', w / 2, h * 0.11, h * 0.08, '#2a3a6a', { stroke: false, maxW: w * 0.7 });
    x.fillStyle = '#c8ccd6'; for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { x.fillRect(w * (0.3 + i * 0.15), h * (0.42 + j * 0.1), w * 0.1, h * 0.07); } }, 256, 512);
}
// the ad box on the shelter: a ride ad whose price can roll up (s31 "high")
function stzAdDraw(s, price, hot) {
  const x = s.adCv.getContext('2d'), w = s.adCv.width, h = s.adCv.height;
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a2a6a'); g.addColorStop(1, '#3a1a5a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  inked(x, 'RIDE', w / 2, h * 0.12, h * 0.09, '#ffffff', { stroke: '#0a0a2a', maxW: w * 0.8 });
  inked(x, 'GET THERE FAST', w / 2, h * 0.22, h * 0.045, '#9ad8ff', { stroke: false, maxW: w * 0.84 });
  // a little cartoon car
  x.fillStyle = '#f2c230'; x.beginPath(); x.roundRect(w * 0.18, h * 0.38, w * 0.64, h * 0.12, 18); x.fill(); x.beginPath(); x.roundRect(w * 0.3, h * 0.31, w * 0.4, h * 0.1, 22); x.fill();
  x.fillStyle = '#2a2a34'; x.beginPath(); x.arc(w * 0.32, h * 0.5, h * 0.035, 0, TAU); x.arc(w * 0.68, h * 0.5, h * 0.035, 0, TAU); x.fill();
  x.fillStyle = '#9ad8ff'; x.fillRect(w * 0.34, h * 0.33, w * 0.14, h * 0.06); x.fillRect(w * 0.52, h * 0.33, w * 0.14, h * 0.06);
  x.fillStyle = hot ? '#3a0808' : '#0a1030'; x.beginPath(); x.roundRect(w * 0.12, h * 0.6, w * 0.76, h * 0.22, 20); x.fill();
  inked(x, 'NOW', w / 2, h * 0.645, h * 0.04, '#ffffff', { stroke: false });
  inked(x, '$' + price, w / 2, h * 0.74, h * 0.12, hot ? '#ff4a2a' : '#7aff9a', { stroke: '#000', sw: h * 0.012, maxW: w * 0.7 });
  if (hot) inked(x, 'SURGE x2', w / 2, h * 0.9, h * 0.05, '#ffd23c', { stroke: '#3a0808', maxW: w * 0.7 });
  s.adTex.needsUpdate = true;
}
function stzScreenDraw(s, mode) {   // the small phone in his hand: just a glowing app screen (the close-ups are the phone set's)
  const x = s.phCv.getContext('2d'), w = s.phCv.width, h = s.phCv.height;
  if (mode === 'off') { x.fillStyle = '#050508'; x.fillRect(0, 0, w, h); s.phTex.needsUpdate = true; return; }
  x.fillStyle = '#16204a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c230'; x.fillRect(w * 0.1, h * 0.38, w * 0.8, h * 0.16);
  x.fillStyle = mode === 'accept' ? '#3aff7a' : '#2acb6a'; x.fillRect(w * 0.1, h * 0.72, w * 0.8, h * 0.14);
  x.fillStyle = '#ff3a2a'; x.fillRect(w * 0.72, h * 0.04, w * 0.08, h * 0.04); x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.strokeRect(w * 0.64, h * 0.035, w * 0.22, h * 0.05);   // 1 % battery
  s.phTex.needsUpdate = true;
}

// ---- the world
function stzBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 600), s = { scene, cam };
  const key = lights(scene, { amb: '#7a84a8', ambI: 0.8, sky: '#5a6890', ground: '#2a1a14', key: '#c8d0ff', keyI: 0.95, keyP: [-10, 30, 26], rim: '#ff7a40', rimI: 0.75, rimP: [14, 14, -14] });
  const M = { metal: c3Prop('#2a2e3c', { rough: 0.3, metal: 0.6 }), chrome: c3Chrome(), glass: new THREE.MeshStandardMaterial({ color: '#9ab4d8', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.18, depthWrite: false }),
    wood: c3Prop('#ffffff', { map: texWood(), rough: 0.4 }), curb: c3Prop('#6a6c78', { rough: 0.5 }) };
  // ground: wet slabs (sidewalk), curb at z 10, wet asphalt beyond — glossy so the env and the lights glint
  scene.add(pl(200, 16, c3Prop('#c8ccd8', { map: stzTexSlabs(), rough: 0.18, metal: 0.15 }), 0, 0, 2, 0, -Math.PI / 2));
  scene.add(rb(200, 0.7, 1.2, M.curb, 0, 0.35, 10.2, 0.02));
  scene.add(pl(200, 60, c3Prop('#ffffff', { map: stzTexRoad(), rough: 0.12, metal: 0.35 }), 0, -0.02, 40.5, 0, -Math.PI / 2));
  // the shops along the back: brick, shuttered windows, awnings, neon signs (their glow also streaks on the wet slabs)
  const NEON = [['PIZZA', '#ff5a2a', '#ffd080'], ['LAUNDRY', '#5ad8ff', '#d8f8ff'], ['24 H', '#ff3a9a', '#ffd0e8'], ['NOODLES', '#ffd23c', '#fff4c8'], ['BAR', '#ff3a3a', '#ffd0c0'], ['DONUTS', '#ff8ad8', '#fff0f8'], ['PAWN', '#7aff9a', '#e0ffe8'], ['VIDEO', '#a87aff', '#ece0ff']];
  s.neon = [];
  for (let i = -4; i <= 4; i++) {
    const xx = i * 13, R = RNG('shop', i), hue = R.r(0, 40) + (i % 2 ? 200 : 0);
    scene.add(rb(12.6, 22, 3, c3Prop('#ffffff', { map: stzTexBrick(hue), rough: 0.7 }), xx, 11, -5.6, 0.04));
    scene.add(rb(10.4, 9.5, 0.4, c3Prop('#ffffff', { map: stzTexShutter(), rough: 0.4, metal: 0.4 }), xx, 5.2, -4.0, 0.03));
    const aw = rb(11.6, 0.5, 2.6, c3Prop(R.f() < 0.5 ? '#a8281e' : '#2a6a5a', { rough: 0.5 }), xx, 10.6, -2.8, 0.03); aw.rotation.x = 0.28; scene.add(aw);
    const [txt, c1, c2] = NEON[(i + 4) % NEON.length];
    const sign = pl(9, 2.4, c3Flat('#ffffff', { map: texSign(txt, c1, c2, 0.6), glow: c1 }), xx, 13.8, -3.9); scene.add(sign); s.neon.push(sign);
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(6, 9), new THREE.MeshBasicMaterial({ map: stzTexStreak(c1), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }));
    refl.rotation.x = -Math.PI / 2; refl.position.set(xx, 0.03, 1.5); scene.add(refl);
    for (let k = 0; k < 2; k++) { const up = rb(3.2, 3.6, 0.3, c3Flat(R.f() < 0.6 ? '#ffd890' : '#20243a', { glow: '#ffb860' }), xx - 3 + k * 6, 18, -4.0, 0.02); scene.add(up); }   // lit upstairs windows
  }
  for (let i = 0; i < 12; i++) { const R = RNG('tower', i), w = R.r(10, 18), h = R.r(40, 80), t = texWindows(i + 40); t.repeat.set(w / 6, h / 10);
    const b = c3Mesh(new THREE.BoxGeometry(w, h, w), c3Prop('#ffffff', { map: t, rough: 0.4, emissive: '#ffffff', ei: 0.85, emissiveMap: t }), 0.04); b.position.set(-75 + i * 14 + R.n(3), h / 2, -24 - R.r(0, 20)); scene.add(b); }
  // the bus shelter at x 0: dark posts, a glass roof and back, a bench, the lit ad box on its right side
  const sh = new THREE.Group(); scene.add(sh);
  for (const [x, z] of [[-8, 0.4], [8, 0.4], [-8, 7.8], [8, 7.8]]) sh.add(rb(0.45, 13, 0.45, M.metal, x, 6.5, z, 0.02));
  sh.add(rb(17.4, 0.4, 8.6, M.metal, 0, 13.1, 4.1, 0.03)); sh.add(pl(16.6, 8, M.glass, 0, 12.85, 4.1, 0, -Math.PI / 2));
  sh.add(pl(15.6, 10.5, M.glass, 0, 6.6, 0.45)); sh.add(rb(16, 0.3, 0.3, M.metal, 0, 1.4, 0.45, 0.01)); sh.add(rb(16, 0.3, 0.3, M.metal, 0, 11.8, 0.45, 0.01));
  sh.add(pl(2.6, 0.9, c3Flat('#ffffff', { map: texSign('BUS 12', '#ffffff', '#1a3a8a', 0.6), glow: '#5a8aff' }), -5.5, 13.1, 8.42));
  // bench: a slatted wooden seat on two metal legs
  for (let k = 0; k < 3; k++) sh.add(rb(9, 0.22, 0.7, M.wood, 1, STZ_SEAT - 0.12, 1.6 + k * 0.8, 0.015));
  for (let k = 0; k < 2; k++) sh.add(rb(9, 0.22, 0.6, M.wood, 1, STZ_SEAT + 1.0 + k * 0.7, 1.05, 0.015));
  for (const x of [-3, 5]) sh.add(rb(0.3, STZ_SEAT - 0.2, 2.2, M.metal, x, (STZ_SEAT - 0.2) / 2, 2.2, 0.015));
  // the ad box (a lit panel, facing the street)
  s.adCv = Object.assign(document.createElement('canvas'), { width: 512, height: 900 }); s.adTex = new THREE.CanvasTexture(s.adCv); s.adTex.encoding = THREE.sRGBEncoding;
  const adFrame = rb(5.4, 9.2, 0.8, M.metal, 10.4, 6.2, 4.4, 0.03); scene.add(adFrame);
  s.ad = pl(4.8, 8.5, c3Flat('#ffffff', { map: s.adTex, glow: '#7a5aff' }), 10.4, 6.2, 4.82); scene.add(s.ad); stzAdDraw(s, 19, false);
  // the broken umbrella leaning on the shelter (after s02) and a trash bin
  s.leanUmb = new THREE.Group(); s.leanUmb.add(cyl(0.07, 0.07, 6, M.metal, 0, 3, 0, 0.01, 6));
  const lc = c3Mesh(new THREE.ConeGeometry(1.1, 3.6, 10, 1, true), c3Prop('#c8281e', { rough: 0.5, side: THREE.DoubleSide }), 0.02); lc.position.y = 4.6; s.leanUmb.add(lc);
  s.leanUmb.position.set(-7.2, 0, 1.4); s.leanUmb.rotation.z = -0.28; s.leanUmb.visible = false; scene.add(s.leanUmb);
  const bin = cyl(1.0, 0.85, 3.2, c3Prop('#2a5a3a', { rough: 0.4, metal: 0.3 }), -10.2, 1.6, 6.5, 0.03); scene.add(bin);
  // the street clock at x -12 (a fact object: it ticks to 11:47 on "late")
  const ck = new THREE.Group(); ck.position.set(-12.5, 0, 8.4); scene.add(ck);
  ck.add(cyl(0.3, 0.42, 15, M.metal, 0, 7.5, 0, 0.03, 12)); ck.add(cyl(2.6, 2.6, 0.8, M.metal, 0, 17.2, 0, 0.04, 32).rotateX(Math.PI / 2));
  ck.add(pl(4.6, 4.6, c3Flat('#ffffff', { map: stzTexClock(), glow: '#3a3020' }), 0, 17.2, 0.42));
  const hand = (len, wd) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, len), c3Flat('#1a1a22')); m.position.y = len / 2 - 0.2; g.add(m); g.position.set(0, 17.2, 0.46); ck.add(g); return g; };
  s.hourH = hand(1.3, 0.22); s.minH = hand(1.9, 0.14);
  // the payphone at x 13 (s13): a box on a post with a handset, and the OUT OF ORDER sign taped inside its face
  const pp = new THREE.Group(); pp.position.set(14.5, 0, 2.2); scene.add(pp);
  pp.add(rb(0.5, 6.5, 0.5, M.metal, 0, 3.25, -0.3, 0.02)); pp.add(rb(3.4, 5.6, 1.6, c3Prop('#2a3a6a', { rough: 0.3, metal: 0.3 }), 0, 8.8, 0, 0.04));
  pp.add(pl(3.0, 5.0, c3Prop('#ffffff', { map: stzTexPayphone(), rough: 0.4 }), 0, 8.8, 0.81));
  const oos = pl(2.4, 1.8, c3Prop('#ffffff', { map: stzTexOutOfOrder(), rough: 0.8 }), 0, 9.9, 0.83); oos.rotation.z = 0.08; pp.add(oos);
  s.ppHandset = rb(0.6, 2.2, 0.5, c3Prop('#1a1a22', { rough: 0.3 }), -1.3, 9.0, 0.95, 0.02); pp.add(s.ppHandset);
  // lamps: a post with a glowing head and a soft light cone (the rain shows up in it)
  s.lamps = [];
  for (const x of [-26, 26]) { const g = new THREE.Group(); g.position.set(x, 0, 9.0); scene.add(g);
    g.add(cyl(0.28, 0.4, 22, M.metal, 0, 11, 0, 0.03, 12)); g.add(rb(3.4, 0.5, 0.9, M.metal, -1.4, 22, 0, 0.02));
    const hd = c3Mesh(new THREE.SphereGeometry(0.9, 16, 10), c3Flat('#fff1c8', { glow: '#ffcf70' }), 0.03); hd.position.set(-2.8, 21.4, 0); g.add(hd);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(7, 21, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd08a', transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
    cone.position.set(-2.8, 10.6, 0); g.add(cone); const L = new THREE.PointLight('#ffd08a', 1.1, 34, 1.4); L.position.set(-2.8, 20, 0); L.layers.enableAll(); g.add(L); s.lamps.push(g); }
  { const L = new THREE.PointLight('#8a7aff', 0.9, 16, 1.6); L.position.set(10.4, 6.2, 7); L.layers.enableAll(); scene.add(L); }   // the ad box lights him
  { const L = new THREE.PointLight('#ff8a5a', 0.6, 30, 1.6); L.position.set(0, 13, 1); L.layers.enableAll(); scene.add(L); }    // neon spill
  { const L = new THREE.DirectionalLight('#ffd8b0', 0.45); L.position.set(6, 10, 30); L.layers.enableAll(); scene.add(L); }    // a warm fill from the street side (shop windows across the road)
  // puddles: dark mirrors with light streaks in them
  for (const [x, z, sx, sz] of [[-4, 8.6, 4.5, 1.6], [6, 7.2, 3.2, 1.2], [-16, 5.5, 3.6, 1.5], [3, 14, 6, 2.2], [-8, 18, 5, 1.8], [16, 6, 2.6, 1.1]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 28), c3Prop('#0a0c16', { rough: 0.02, metal: 0.8 })); p.rotation.x = -Math.PI / 2; p.scale.set(sx, sz, 1); p.position.set(x, 0.04, z); scene.add(p); }
  // the taxi (s11): drives along the road at z 16 and throws a wave of water at the curb
  const tx = new THREE.Group(); s.taxi = tx; scene.add(tx);
  tx.add(rb(22, 4.2, 8.4, c3Prop('#f2c230', { rough: 0.25 }), 0, 3.6, 0, 0.06)); tx.add(rb(12, 3.6, 7.6, c3Prop('#f2c230', { rough: 0.25 }), -0.5, 7.4, 0, 0.05));
  tx.add(pl(10.6, 2.6, c3Prop('#1a2436', { rough: 0.05, metal: 0.6 }), -0.5, 7.5, 3.82)); tx.add(rb(22.2, 0.6, 8.6, c3Prop('#1a1a1a', { rough: 0.4 }), 0, 2.0, 0, 0.02));
  for (let i = 0; i < 8; i++) tx.add(rb(1.1, 0.6, 0.1, c3Prop(i % 2 ? '#1a1a1a' : '#f2f2f2'), -4 + i * 1.1, 4.6, 4.25, 0));   // checker stripe
  tx.add(rb(3.2, 1.0, 1.6, c3Flat('#fff4c8', { glow: '#ffd23c' }), -0.5, 9.8, 0, 0.03));
  for (const x of [-7, 7]) { const w = c3Mesh(new THREE.CylinderGeometry(1.8, 1.8, 1.2, 22), c3Prop('#16161a', { rough: 0.6 }), 0.03); w.rotation.x = Math.PI / 2; w.position.set(x, 1.8, 4.0); tx.add(w); }
  for (const z of [-2.8, 2.8]) { const hl = c3Mesh(new THREE.SphereGeometry(0.7, 12, 8), c3Flat('#ffffe8', { glow: '#ffffd0' }), 0.02); hl.position.set(11.1, 3.8, z); tx.add(hl);
    const tl = c3Mesh(new THREE.SphereGeometry(0.55, 12, 8), c3Flat('#ff2a1a', { glow: '#ff2a1a' }), 0.02); tl.position.set(-11.1, 3.8, z); tx.add(tl); }
  const beam = new THREE.Mesh(new THREE.ConeGeometry(5, 26, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#fff6d0', transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  beam.rotation.z = Math.PI / 2; beam.position.set(24, 3.6, 0); tx.add(beam);
  tx.position.set(-200, 0, 16.5);
  // the wave the taxi throws (s11): instanced droplets on ballistic arcs
  s.wave = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.02, 0.9, 5), new THREE.MeshBasicMaterial({ color: '#cfe0ff', transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), 320); s.wave.frustumCulled = false; scene.add(s.wave);
  // rain: instanced streaks (far ones drawn with the background, so they blur), splash rings on the ground
  const streak = new THREE.BoxGeometry(0.05, 1.7, 0.05), rainM = new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false });
  s.rainFar = new THREE.InstancedMesh(streak, rainM, 1400); s.rainNear = new THREE.InstancedMesh(streak, rainM.clone(), 700);
  s.rainNear.material.opacity = 0.65; [s.rainFar, s.rainNear].forEach((m) => { m.frustumCulled = false; scene.add(m); });
  s.rainSeed = [...Array(2100)].map((_, i) => { const R = RNG('rain', i); return [R.r(-45, 45), R.r(0, 44), i < 1400 ? R.r(-4, 20) : R.r(4, 30), R.r(36, 46)]; });
  s.rings = new THREE.InstancedMesh(new THREE.RingGeometry(0.72, 0.8, 20), new THREE.MeshBasicMaterial({ color: '#d8e4ff', transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }), 420);
  s.rings.frustumCulled = false; scene.add(s.rings);
  s.ringSeed = [...Array(420)].map((_, i) => { const R = RNG('ring', i); return [R.r(-40, 40), R.r(-2, 30), R.r(0, 1), R.r(0.35, 0.6)]; });
  // the protagonist: You, holding his phone (a small glowing screen); an umbrella for s01-s02; a paper map (s12)
  const you = c3Person({ key: 'you', outfit: 'teal', hairStyle: 'ref' }); you.g.scale.setScalar(STZ_K); scene.add(you.g); s.you = you;
  s.phCv = Object.assign(document.createElement('canvas'), { width: 128, height: 240 }); s.phTex = new THREE.CanvasTexture(s.phCv); s.phTex.encoding = THREE.sRGBEncoding;
  s.phone = new THREE.Group(); s.phone.add(rb(0.4, 0.74, 0.08, c3Prop('#1a1a22', { rough: 0.3 }), 0, 0, 0, 0.015));
  const scr = pl(0.33, 0.64, c3Flat('#ffffff', { map: s.phTex, glow: '#5a7aff' }), 0, 0, 0.07); scr.position.z = 0.045; s.phone.add(scr); s.phone.renderOrder = 6; you.root.add(s.phone); stzScreenDraw(s, 'app');
  s.umb = new THREE.Group(); you.root.add(s.umb);
  s.umbStick = cyl(0.07, 0.07, 1, M.metal, 0, 0, 0.05, 0.0, 6); s.umb.add(s.umbStick);
  s.canopy = new THREE.Group(); s.umb.add(s.canopy);
  const can = c3Mesh(new THREE.SphereGeometry(3.0, 28, 10, 0, TAU, 0, 1.2), c3Toon('#f0402e', { side: THREE.DoubleSide }), 0.06); can.scale.y = 0.62; s.canopy.add(can);
  for (let k = 0; k < 8; k++) { const r = cyl(0.04, 0.04, 3.0, M.metal, 0, 0, 0, 0, 4); r.position.set(Math.cos(k / 8 * TAU) * 1.4, 0.6, Math.sin(k / 8 * TAU) * 1.4); r.rotation.set(Math.sin(k / 8 * TAU) * 1.05, 0, -Math.cos(k / 8 * TAU) * 1.05); s.canopy.add(r); }
  s.map = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.2), c3Prop('#ffffff', { map: stzTexMap(), rough: 0.8, side: THREE.DoubleSide })); s.map.renderOrder = 6; you.root.add(s.map);
  s.handset = rb(0.6, 2.0, 0.45, c3Prop('#1a1a22', { rough: 0.3 }), 0, 0, 0.1, 0.02); you.root.add(s.handset);
  s.drips = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshBasicMaterial({ color: '#b8d0ff', transparent: true, opacity: 0.85, toneMapped: false }), 24); s.drips.frustumCulled = false; you.root.add(s.drips);
  c3Layer(you.g, C3.L_FOCUS); c3Layer(sh, C3.L_FOCUS); c3Layer(adFrame, C3.L_FOCUS); c3Layer(s.ad, C3.L_FOCUS); c3Layer(s.wave, C3.L_FOCUS); c3Layer(s.rainNear, C3.L_FOCUS); c3Layer(s.rings, C3.L_FOCUS);
  c3Layer(pp, C3.L_FOCUS); c3Layer(ck, C3.L_FOCUS); c3Layer(tx, C3.L_FOCUS); c3Layer(s.leanUmb, C3.L_FOCUS); c3Layer(bin, C3.L_FOCUS);
  // blurred foreground pieces (NEAR layer), placed per shot by stzFg
  s.fgBy = {
    post: c3Mesh(new THREE.CylinderGeometry(0.5, 0.5, 30, 12), c3Prop('#1a1c26', { rough: 0.3, metal: 0.6 }), 0.03),
    sign: (() => { const g = new THREE.Group(); g.add(cyl(0.18, 0.18, 20, M.metal, 0, 0, 0, 0.02, 8)); const p = rb(3.2, 3.2, 0.2, c3Prop('#2a6ad8', { rough: 0.3 }), 0, 7, 0.2, 0.03); g.add(p); return g; })(),
    drops: (() => { const g = new THREE.Group(); for (let i = 0; i < 9; i++) { const R = RNG('lensdrop', i); const d = new THREE.Mesh(new THREE.SphereGeometry(R.r(0.12, 0.3), 10, 8), new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0.35, toneMapped: false })); d.position.set(R.n(1.6), R.n(2.6), 0); g.add(d); } return g; })(),
    railing: (() => { const g = new THREE.Group(); g.add(rb(16, 0.4, 0.4, M.metal, 0, 0, 0, 0.02)); for (let i = 0; i < 6; i++) g.add(rb(0.3, 5, 0.3, M.metal, -7 + i * 2.8, -2.5, 0, 0.02)); return g; })(),
    hedge: (() => { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const m = c3Mesh(new THREE.SphereGeometry(1.6, 12, 10), c3Prop('#1e3a26', { rough: 0.7 }), 0.03); m.position.set(i * 2.2 - 5, Math.sin(i) * 0.6, 0); g.add(m); } return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#3a4468', mid: '#2a2028', bot: '#08060a', cards: [[0, 30, -20, 30, 8, '#ff7a3a'], [-30, 10, 10, 10, 18, '#7a9aff'], [24, 6, 10, 8, 10, '#ff3a9a']] });
  c3Shadows(scene, key, 30);
  return s;
}
const stzGet = () => STZ.s ||= stzBuild();

// ---- per-frame world: rain, splash rings, the clock, the taxi, the wave, his drips
function stzWorld(s, t, o = {}) {
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, o.wind ?? 0.12)), one = stzV(1, 1, 1), p = stzV(0, 0, 0), z0 = stzV(0, 0, 0);
  const heavy = o.heavy ?? 1;
  s.rainSeed.forEach(([x, y, z, v], i) => {
    const mesh = i < 1400 ? s.rainFar : s.rainNear, j = i < 1400 ? i : i - 1400;
    const yy = mod(y - v * t, 44), on = RNG('rainOn', i).f() < heavy;
    p.set(x + (44 - yy) * (o.wind ?? 0.12) * 0.6, yy, z); m4.compose(p, q, on ? one : z0); mesh.setMatrixAt(j, m4);
  });
  s.rainFar.instanceMatrix.needsUpdate = true; s.rainNear.instanceMatrix.needsUpdate = true;
  const rq = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), sc = stzV(1, 1, 1);
  s.ringSeed.forEach(([x, z, ph, life], i) => { const k = mod(t / life + ph, 1), cyc = Math.floor(t / life + ph), R = RNG('ringc', i, cyc);
    p.set(x + R.n(3), 0.08, z + R.n(2)); const r = 0.1 + k * 0.7; sc.set(r, r, r * (1 - k)); m4.compose(p, rq, k < 0.9 ? sc : z0); s.rings.setMatrixAt(i, m4); });
  s.rings.instanceMatrix.needsUpdate = true;
  // the clock: 11:46 -> 11:47, the minute hand ticks over on "late" with a little overshoot
  const late = stzW('late', 1, 0.3), tick = 46 + EZ.back(clamp((t - late + 0.08) / 0.12));
  s.minH.rotation.z = -tick / 60 * TAU; s.hourH.rotation.z = -(11 + tick / 60) / 12 * TAU;
  // the taxi: off-screen unless s11 drives it
  s.taxi.position.x = o.taxiX ?? -200; s.wave.visible = false;
  s.neon.forEach((n, i) => { n.material.color.setScalar(0.85 + 0.15 * Math.sin(t * 7 + i * 1.3) * (i === 2 ? (Math.sin(t * 23) > 0.6 ? 0 : 1) : 1)); });   // a flickering sign
}
// pose helpers (You, billboard-local): standing feet on the ground, seated feet in front of the bench
const STZ_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const STZ_SITF = { foot: { legL: [0.8, -STZ_SEAT / STZ_K + 0.05], legR: [-0.75, -STZ_SEAT / STZ_K + 0.05] } };
function stzPlace(s, x, z, sit) { s.you.g.position.set(x, sit ? STZ_SEAT : STZ_FOOT, z); }
function stzProps(s, o = {}) {   // what he holds this shot (billboard-local positions)
  s.phone.visible = !!o.phone; if (o.phone) { s.phone.position.set(o.phone[0], o.phone[1], 0.12); s.phone.rotation.set(0, 0, o.phone[2] ?? 0.1); }
  s.umb.visible = !!o.umb; s.map.visible = !!o.map; s.handset.visible = !!o.handset; s.drips.visible = !!o.drips;
  s.leanUmb.visible = !!o.leanUmb; s.ppHandset.visible = !o.handset;
}
function stzDrips(s, t, head) {   // after the soaking: water drips off his head and hair
  const m4 = new THREE.Matrix4(), p = stzV(0, 0, 0), q = new THREE.Quaternion(), sc = stzV(1, 1, 1);
  for (let i = 0; i < 24; i++) { const R = RNG('drip', i), per = R.r(0.45, 0.8), k = mod(t / per + R.f(), 1);
    p.set(R.n(1.3), head - 0.9 - k * k * 4.5, 0.2); m4.compose(p, q, sc); s.drips.setMatrixAt(i, m4); }
  s.drips.instanceMatrix.needsUpdate = true;
}

// =====================================================================
//  s01 — "It's late,": the street clock ticks to 11:47 above the wet street; You at the bus stop under an umbrella
// =====================================================================
const STZ_K01 = [[0, [-10.0, 12.6, 33], [-9.6, 12.4, 7.0], 46], [0.7, [-8.8, 12.0, 36], [-8.2, 11.6, 6.0], 48]];
SHOT_FN['s01'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t);
  stzPlace(s, -6.5, 7.2, false);
  c3SetCam(s.cam, stzCam(STZ_K01, lt, 's01', { orbit: 0.06 }));
  stzProps(s, { umb: true, phone: [-0.25, 1.75, 0.15] });
  stzUmbrella(s, 0, t);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'neutral']], t, 'you'), gaze: [0.4, 0.6], hand: { armL: [1.5, 2.8], armR: [-0.3, 1.6] }, ...STZ_STAND });
  stzFg(s, [['post', [5.2, 0, -12], 1.6]], STZ_K01, 's01', lt, { orbit: 0.06 });
  stzRender(s, { bgBlur: stzRack(lt, 's01', 1.0, 2.4) });
};
// the umbrella in his left hand: k = 0 open, 1 flipped inside out (s02)
function stzUmbrella(s, k, t) {
  const hx = 1.5, hy = 2.8, top = 6.0;
  s.umbStick.position.set(hx - 0.25, (hy + top) / 2, 0.05); s.umbStick.scale.set(1, top - hy + 0.6, 1); s.umbStick.rotation.z = 0.06;
  const shake = k > 0 ? Math.sin(t * 38) * 0.12 * (1 - clamp(k - 1, 0, 1)) : 0;
  s.canopy.position.set(hx - 1.0, top + 1.7 * clamp(k, 0, 1), 0.0); s.canopy.scale.set(1 + 0.15 * clamp(k, 0, 1), lerp(1, -1.25, clamp(k, 0, 1)), 1);
  s.canopy.rotation.set(0.15, 0, -0.08 + shake + 0.3 * clamp(k, 0, 1));
}

// =====================================================================
//  s02 — "it's pouring rain,": the rain hammers down; on "rain" a gust flips the umbrella inside out
// =====================================================================
const STZ_K02 = [[0, [-4.2, 8.6, 24], [-6.4, 10.4, 7.2], 50], [1.1, [-5.2, 8.4, 21.8], [-6.6, 10.6, 7.2], 50]];
SHOT_FN['s02'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t, { heavy: 1, wind: 0.12 + 0.5 * EZ.io(clamp((t - stzW('rain', 1, 1.2) + 0.2) / 0.3)) });
  const rain = stzW('rain', 1, 1.2), k = EZ.back(clamp((t - rain + 0.05) / 0.16));
  stzPlace(s, -6.5, 7.2, false);
  c3SetCam(s.cam, stzCam(STZ_K02, lt, 's02'));
  stzProps(s, { umb: true, phone: [-0.25, 1.75, 0.15] });
  stzUmbrella(s, k, t);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [rain, 'shocked']], t, 'you'), gaze: [0.5, 0.9], lean: -0.05 * k, head: [-0.06 * k, 0, 0],
    lift: (q) => 0.25 * EZ.back(seg(q, rain - 0.02, rain + 0.1)) * Math.exp(-Math.max(0, q - rain - 0.1) * 4), hand: { armL: [1.5, 2.8 + 0.2 * k], armR: [-0.3, 1.6] }, x: k > 0.5 ? ['exclaim'] : [], ...STZ_STAND });
  stzFg(s, [['drops', [-1.6, 1.2, -5], 0.5], ['sign', [-5.5, -2, -14], 1.8]], STZ_K02, 's02', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's02', 2.0, 3.2) });
};

// =====================================================================
//  s06 — "So you think, no way,": under the shelter, phone in hand, smug, shaking his head on "no way"
// =====================================================================
const STZ_K06 = [[0, [1.2, 8.4, 19.5], [-1.4, 8.2, 3.8], 50], [1.06, [0.3, 8.6, 17.4], [-1.4, 8.3, 3.8], 50]];
SHOT_FN['s06'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t);
  const no = stzW('no', 1, 6.42), think = stzW('think', 1, 6.12);
  stzPlace(s, -1.4, 4.6, false);
  c3SetCam(s.cam, stzCam(STZ_K06, lt, 's06'));
  stzProps(s, { phone: [-0.1, 1.9, 0.0], leanUmb: true, drips: false });
  const shake = t > no - 0.1 && t < no + 0.45 ? Math.sin((t - no + 0.1) * 26) * 0.13 : 0;
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'thinking'], [no, 'smug']], t, 'you'), gaze: t < no ? [0.3, 0.8] : [0.6, 0], head: [shake * 0.5, shake, 0],
    hand: { armR: [-0.1, 1.9], armL: [1.4, 0.9] }, ...STZ_STAND });
  stzFg(s, [['post', [-4.0, 0, -9], 1.4]], STZ_K06, 's06', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's06', 3.0, 3.6) });
};

// =====================================================================
//  s07 — "I'll just wait it out.": he sits down on the bench and crosses his arms; the camera slides along the shelter
// =====================================================================
const STZ_K07 = [[0, [9.5, 6.8, 18], [1.6, 6.4, 2.4], 48], [1.14, [5.0, 6.6, 16.6], [1.4, 6.5, 2.4], 48]];
SHOT_FN['s07'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t);
  const wait = stzW('wait', 1, 7.26), sit = EZ.io(clamp((t - (wait - 0.35)) / 0.3));
  stzPlace(s, 1.6, 2.4, true); s.you.g.position.y = lerp(STZ_FOOT + 0.4, STZ_SEAT, sit);
  c3SetCam(s.cam, stzCam(STZ_K07, lt, 's07', { orbit: -0.05 }));
  stzProps(s, { phone: [0.5, 1.15, 0.5], leanUmb: true });
  const cross = EZ.io(clamp((t - wait) / 0.2));
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'smug'], [stzW('out', 1, 7.68), 'determined']], t, 'you'), gaze: [-0.5, 0], head: [0.05, 0, 0],
    lift: (q) => 0.12 * EZ.back(seg(q, wait - 0.05, wait + 0.08)) * Math.exp(-Math.max(0, q - wait - 0.08) * 5),
    hand: { armL: [lerp(1.4, -0.35, cross), lerp(0.9, 1.25, cross)], armR: [lerp(-0.1, 0.4, cross), lerp(1.9, 1.35, cross)] }, ...(sit > 0.5 ? STZ_SITF : STZ_STAND) });
  stzFg(s, [['railing', [0, -4.6, -8], -1.6]], STZ_K07, 's07', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's07', 2.4, 3.4) });
};

// =====================================================================
//  s10 — "and you realize that if this thing dies,": on the bench, phone glowing; on "realize" panic + a jolt
// =====================================================================
const STZ_K10 = [[0, [2.6, 7.4, 14.5], [1.6, 7.1, 2.4], 50], [1.9, [2.0, 7.7, 12.4], [1.6, 7.4, 2.4], 50]];
SHOT_FN['s10'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t);
  const real = stzW('realize', 1, 11.12), dies = stzW('dies', 1, 12.26);
  stzPlace(s, 1.6, 2.4, true);
  c3SetCam(s.cam, stzCam(STZ_K10, lt, 's10', { creep: 0.07 }));
  stzProps(s, { phone: [0.0, 1.85, 0.1], leanUmb: true });
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [real, 'panic'], [dies, 'scared']], t, 'you'), gaze: t < real ? [0, 0.8] : [0, 0],
    lift: (q) => 0.55 * EZ.back(seg(q, real - 0.07, real + 0.05)) * (1 - 0.6 * EZ.io(seg(q, real + 0.4, real + 0.9))),
    hand: { armR: [0.0, 1.85], armL: [1.5, 2.5] }, x: t > real ? ['sweat'] : [], ...STZ_SITF });
  stzFg(s, [['drops', [1.4, -1.0, -4.5], -0.4]], STZ_K10, 's10', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's10', 3.0, 4.2) });
};

// =====================================================================
//  s11 — "you're stuck out here with no ride,": at the curb he waves at a taxi; it roars past on "ride" and soaks him
// =====================================================================
const STZ_K11 = [[0, [7.5, 5.0, 38], [-3.0, 7.4, 8.5], 50], [1.78, [5.2, 5.6, 34], [-3.4, 7.8, 8.5], 50]];
SHOT_FN['s11'] = (t, u, lt) => {
  const s = stzGet();
  const ride = stzW('ride', 2, 14.06), pass = ride - 0.05;   // the taxi's nose passes him on "ride"
  const tx = (t - pass) * 64 + (-3.5);   // fast, left to right
  stzWorld(s, t, { taxiX: tx });
  stzPlace(s, -3.5, 8.8, false);
  c3SetCam(s.cam, stzCam(STZ_K11, lt, 's11', { orbit: 0.02 }));
  // the wave: droplets leave the puddle by his feet as the wheel passes, arc over him and fall
  if (t > pass - 0.05) { s.wave.visible = true; const m4 = new THREE.Matrix4(), p = stzV(0, 0, 0), q = new THREE.Quaternion(), one = stzV(1, 1, 1);
    for (let i = 0; i < 320; i++) { const R = RNG('wave', i), dt = t - pass - R.r(0, 0.12); if (dt < 0) { m4.makeScale(0, 0, 0); s.wave.setMatrixAt(i, m4); continue; }
      const vx = R.r(-2, 10), vy = R.r(12, 24), vz = R.r(-14, -6); p.set(-3.5 + R.n(4) + vx * dt, 0.6 + vy * dt - 30 * dt * dt, 13.5 + vz * dt);
      const vel = stzV(vx, vy - 60 * dt, vz).normalize(); q.setFromUnitVectors(stzV(0, 1, 0), vel); m4.compose(p, q, p.y > 0 ? one : stzV(0, 0, 0)); s.wave.setMatrixAt(i, m4); }
    s.wave.instanceMatrix.needsUpdate = true; }
  const soaked = t > pass + 0.25;
  stzProps(s, { phone: [-0.3, 1.6, 0.15], drips: soaked });
  if (soaked) stzDrips(s, t, s.you.bodyH + s.you.HS * 0.31);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [pass + 0.2, 'shocked'], [pass + 0.9, 'sad']], t, 'you'), gaze: t < pass ? [-0.8, 0] : [0, 0],
    lift: (q) => 0.35 * EZ.back(seg(q, pass + 0.18, pass + 0.28)) * Math.exp(-Math.max(0, q - pass - 0.28) * 4),
    hand: { armL: t < pass + 0.2 ? [1.8, 4.6 + 0.25 * Math.sin(t * 16)] : [1.5, 1.0], armR: [-0.3, 1.6] }, x: soaked ? ['sweat'] : [], ...STZ_STAND });
  stzFg(s, [['hedge', [-6, -6.5, -12], 2.2]], STZ_K11, 's11', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's11', 1.6, 2.6), glow: 0.85 });
};

// =====================================================================
//  s12 — "no map,": still dripping, he unfolds a paper map; on "map" the wind rips it out of his hands
// =====================================================================
const STZ_K12 = [[0, [-2.0, 7.6, 22.5], [-3.5, 8.9, 8.8], 50], [0.82, [-3.0, 7.8, 20.6], [-3.6, 9.2, 8.8], 50]];
SHOT_FN['s12'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t, { wind: 0.3 });
  const map = stzW('map', 1, 14.94), k = clamp((t - map + 0.04) / 0.7);
  stzPlace(s, -3.5, 8.8, false);
  c3SetCam(s.cam, stzCam(STZ_K12, lt, 's12'));
  stzProps(s, { map: true, drips: true }); stzDrips(s, t, s.you.bodyH + s.you.HS * 0.31);
  s.map.position.set(lerp(0.1, 4.5, EZ.i2(k)) + Math.sin(k * 9) * 0.3 * k, lerp(1.8, 7.5, EZ.o2(k)), 0.15 + k * 2.5); s.map.rotation.set(k * 1.4, k * 2.2, -k * 2.6 + Math.sin(t * 20) * 0.05 * (1 - k));
  s.map.scale.setScalar(1 - 0.25 * k);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'sad'], [map, 'shocked']], t, 'you'), gaze: k > 0 ? [0.9, -0.9] : [0, 0.6],
    hand: k <= 0 ? { armL: [1.4, 1.8], armR: [-1.2, 1.8] } : { armL: [2.0, 3.6], armR: [-0.9, 2.0] }, ...STZ_STAND });
  stzFg(s, [['sign', [4.8, -1, -12], -1.8]], STZ_K12, 's12', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's12', 2.6, 3.4) });
};

// =====================================================================
//  s13 — "and no way to call anyone.": he grabs the payphone's handset... OUT OF ORDER
// =====================================================================
const STZ_K13 = [[0, [20.0, 7.6, 24], [13.4, 8.8, 4.0], 50], [1.36, [18.4, 7.9, 21.6], [13.2, 9.0, 4.0], 50]];
SHOT_FN['s13'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t);
  const call = stzW('call', 1, 15.7), any = stzW('anyone', 1, 15.94);
  stzPlace(s, 12.2, 6.2, false);
  c3SetCam(s.cam, stzCam(STZ_K13, lt, 's13', { orbit: -0.04 }));
  const lifted = t > call - 0.12;
  stzProps(s, { handset: lifted, drips: true }); stzDrips(s, t, s.you.bodyH + s.you.HS * 0.31);
  if (lifted) { s.handset.position.set(1.15, 4.1, 0.15); s.handset.rotation.set(0, 0, -0.35); }
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [any, 'deadpan']], t, 'you'), gaze: t > any ? [0.9, -0.3] : [0.3, 0], head: [t > any ? -0.08 : 0.04, 0, 0],
    hand: { armL: lifted ? [1.2, 3.4] : [2.1, 2.6], armR: [-1.4, 0.9] }, ...STZ_STAND });
  stzFg(s, [['post', [4.6, 0, -9.5], -1.6]], STZ_K13, 's13', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's13', 2.2, 3.0) });
};

// =====================================================================
//  s31 — "So the next time your phone is almost dead, and the price looks high,": back at the stop; the ad's price
//  rolls up and flashes SURGE on "high"
// =====================================================================
const STZ_K31 = [[0, [11.0, 8.0, 28], [8.4, 8.0, 4.5], 50], [3.7, [7.0, 8.4, 24.0], [8.4, 8.0, 4.5], 50]];
SHOT_FN['s31'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t);
  const dead = stzW('dead', 1, 54.76), high = stzW('high', 1, 56.22);
  const k = clamp((t - high + 0.3) / 0.3), price = k >= 1 ? 38 : Math.round(lerp(19, 38, EZ.i2(k)));
  if (s.adLast !== price) { stzAdDraw(s, price, k >= 1); s.adLast = price; }
  stzPlace(s, 6.0, 5.6, false);
  c3SetCam(s.cam, stzCam(STZ_K31, lt, 's31', { orbit: 0.025 }));
  stzProps(s, { phone: [-0.1, 1.95, 0.05], leanUmb: true });
  stzScreenDraw(s, 'app');
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'tired'], [dead, 'worried'], [high, 'shocked']], t, 'you'), gaze: t > high ? [0.9, 0] : [0, 0.8],
    lift: (q) => 0.2 * EZ.back(seg(q, high - 0.04, high + 0.08)) * Math.exp(-Math.max(0, q - high - 0.08) * 4),
    hand: { armR: [-0.1, 1.95], armL: [1.4, 0.9] }, ...STZ_STAND });
  stzFg(s, [['post', [-5.4, 0, -10], -0.8], ['drops', [1.8, 1.6, -5], 0.3]], STZ_K31, 's31', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's31', 2.4, 3.2), glow: 0.75 + (k >= 1 ? 0.35 * Math.exp(-(t - high) * 3) : 0) });
};

// =====================================================================
//  s32 — "it's not just the rain.": the camera tilts up into a lamp's light cone, full of rain
// =====================================================================
const STZ_K32 = [[0, [-20, 8.0, 26], [-25, 13.0, 9], 50], [1.22, [-20.8, 7.2, 24.5], [-27.5, 18.5, 9], 52]];
SHOT_FN['s32'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t, { heavy: 1, wind: 0.18 });
  stzPlace(s, -20, 8.0, false);
  c3SetCam(s.cam, stzCam(STZ_K32, lt, 's32', { orbit: 0.04 }));
  stzProps(s, { phone: [-0.3, 1.6, 0.15] });
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'unimpressed']], t, 'you'), gaze: [-0.4, -1], head: [0.08, 0, 0.1], hand: { armR: [-0.3, 1.6], armL: [1.4, 0.9] }, ...STZ_STAND });
  stzFg(s, [['hedge', [3, -6.0, -11], 1.6]], STZ_K32, 's32', lt);
  stzRender(s, { bgBlur: stzRack(lt, 's32', 1.6, 2.8), glow: 0.8 });
};

// =====================================================================
//  s33 — "It's you deciding a lot faster than you normally would.": he jabs ACCEPT on "faster", the screen flashes,
//  and the camera pulls back and up to the exact s01 opening frame (the short loops)
// =====================================================================
SHOT_FN['s33'] = (t, u, lt) => {
  const s = stzGet(); stzWorld(s, t);
  const fast = stzW('faster', 1, 59.32), [a, b] = stzSpan('s33'), dur = b - a;
  stzPlace(s, -6.5, 7.2, false);
  // ends exactly on s01's first frame: no creep/rush here, the keys do the whole move
  const s01 = STZ_K01[0];
  const K = [[0, [-4.8, 8.4, 17.2], [-6.5, 8.3, 7.2], 48], [fast - a + 0.1, [-5.4, 8.8, 16.3], [-6.5, 8.5, 7.2], 48], [fast - a + 0.55, [-7.0, 10.5, 21], [-7.8, 10.8, 7.2], 47], [dur, s01[1], s01[2], s01[3]]];
  c3SetCam(s.cam, stzCam(K, lt, 's33', { creep: 0, rush: 0, orbit: 0 }));
  const tapped = t > fast;
  stzProps(s, { phone: [-0.25, 1.75, 0.15], umb: true }); stzUmbrella(s, 0, t);
  stzScreenDraw(s, tapped && t < fast + 0.3 ? 'accept' : 'app');
  const jab = t > fast - 0.08 && t < fast + 0.12 ? 1 : 0;
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'determined'], [fast, 'grimace'], [fast + 0.6, 'neutral']], t, 'you'), gaze: t < fast + 0.6 ? [0, 0.8] : [0.4, 0.6],
    hand: { armL: [1.5, 2.8], armR: [-0.25, 1.75] }, head: [0, 0, -0.06 * jab], ...STZ_STAND });
  stzFg(s, [['drops', [-1.2, -1.4, -4.5], 0.6]], K, 's33', lt, { creep: 0, rush: 0, orbit: 0 });
  stzRender(s, { bgBlur: lerp(3.0, 1.0, EZ.io(clamp(lt / dur))), glow: 0.7 + (tapped ? 0.3 * Math.exp(-(t - fast) * 4) : 0) });
};
