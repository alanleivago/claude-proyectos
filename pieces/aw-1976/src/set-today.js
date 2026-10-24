// =====================================================================
//  SET today — s21 to s29: the calendar flies to 2026, the LED board, the museum case, the cash tower,
//  the lottery ticket for a bike, old Ron on his porch, the contract in his hands, and the push back into
//  APRIL 1976 (loops to s01). Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js).
//  Helpers are prefixed std. People are c3Person billboards at STD_K x the props (refs: people are big).
// =====================================================================
const STD = {};
const STD_K = 1.35;
const stdW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const stdSS = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
// ---- camera (tutorial + refs): never still — the knots give the move, then a creep of ~5 %/s of the subject
// distance keeps it alive and, in the last ~0.35 s (running on into the dissolve), the camera accelerates into the
// next shot (up to ~3 %/frame). K: [[lt, pos, look, fov], ...] in shot-local seconds.
const stdSpan = (id) => { const i = SHOT_LIST.findIndex((r) => r[0] === id); return shotSpan(i); };
function stdCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = stdSpan(id), dur = b - a;
  const p = new THREE.Vector3(...c.p), l = new THREE.Vector3(...c.l), d = l.clone().sub(p), dist = d.length(); d.normalize();
  const creep = 0.05 * dist * lt * (o.creep ?? 1);                                  // ~5 %/s push
  const tail = Math.max(0, lt - (dur - 0.35)), rush = (o.rush ?? 1) * dist * (0.06 * tail * tail / 0.1225 + 0.04 * tail);   // eases in, fastest on the cut
  p.addScaledVector(d, creep + rush);
  if (o.orbit) { const v = p.clone().sub(l).applyAxisAngle(new THREE.Vector3(0, 1, 0), o.orbit * (lt + tail * 1.5)); p.copy(l).add(v); }   // slow orbit (rad/s)
  return { p: p.toArray(), l: l.toArray(), fov: c.fov };
}
// rack focus: background blur eased between two values across the shot (refs: the focus shifts as the camera moves)
const stdRack = (lt, id, a, b) => { const [t0, t1] = stdSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// something in the NEAR layer (drawn blurred, in front of everything)
const stdNear = (obj) => { c3Layer(obj, C3.L_NEAR); return obj; };
function stdPerson(o, x, y, z, k = STD_K) { const p = c3Person(o); p.g.position.set(x, y, z); p.g.scale.setScalar(k); return p; }
// something held in a billboard hand (local coords), drawn in the person's own plane
function stdHold(p, obj, z = 0.06) { p.root.add(obj); obj.position.z = z; return obj; }
// colour is graded per shot in shots.js (c3Look): no heavy grade here, only the kit's default background pass
const stdRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#1a0c08', bgBlur: 3.0, glow: 0.55, glowBlur: 16, bloom: 0.3 }, o));
function stdScene(fov = 50) { return { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(fov, W / H, 0.1, 800) }; }

// ---- textures
function stdTexYear(year, month = 'APRIL') { return texCalendar(month, String(year)); }
function stdTexCash() {
  return c3Tex((x, w, h) => {
    x.fillStyle = '#5f9a5a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { x.fillStyle = i % 2 ? '#78b06e' : '#6aa462'; x.fillRect(0, i * h / 9, w, h / 18); }
    x.fillStyle = '#f2ead2'; x.fillRect(w * 0.42, 0, w * 0.16, h);   // the paper band
    x.fillStyle = '#c8a040'; x.fillRect(w * 0.42, h * 0.45, w * 0.16, h * 0.1);
    x.strokeStyle = 'rgba(30,60,30,0.6)'; x.lineWidth = 4; x.strokeRect(2, 2, w - 4, h - 4);
    x.font = `900 ${h * 0.22}px Arial Black, Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(20,60,20,0.55)'; x.fillText('$', w * 0.2, h * 0.5); x.fillText('$', w * 0.8, h * 0.5);
  }, 256, 128);
}
function stdTexTicket() {
  return c3Tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#fff2a0'); g.addColorStop(0.5, '#f2c230'); g.addColorStop(1, '#d8901a');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#8a4a08'; x.lineWidth = 10; x.setLineDash([16, 10]); x.strokeRect(14, 14, w - 28, h - 28); x.setLineDash([]);
    inked(x, 'WINNER', w / 2, h * 0.36, h * 0.24, '#ffffff', { stroke: '#8a4a08', sw: h * 0.05 });
    inked(x, '7 · 7 · 7', w / 2, h * 0.7, h * 0.18, '#c8321e', { stroke: '#fff2c0', sw: h * 0.03 });
  }, 512, 256);
}
function stdTexSiding() {
  const t = c3Tex((x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#9cc4c4' : '#8ab8ba'; x.fillRect(0, i * h / 8, w, h / 8); x.fillStyle = 'rgba(30,50,60,0.35)'; x.fillRect(0, (i + 1) * h / 8 - 4, w, 4); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); return t;
}
function stdTexPlanks(c1 = '#a8743c', c2 = '#946232') {
  const t = c3Tex((x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? c1 : c2; x.fillRect(i * w / 8, 0, w / 8, h); x.fillStyle = 'rgba(40,20,8,0.45)'; x.fillRect(i * w / 8, 0, 3, h); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t;
}
function stdTexMarble() {
  const t = c3Tex((x, w, h) => { x.fillStyle = '#e8e2d6'; x.fillRect(0, 0, w, h); const R = RNG('marble');
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.fillStyle = (i + j) % 2 ? '#d6cfc0' : '#efe9de'; x.fillRect(i * w / 4, j * h / 4, w / 4, h / 4); }
    x.strokeStyle = 'rgba(120,110,100,0.25)'; x.lineWidth = 2; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(R.r(0, w), 0); x.bezierCurveTo(R.r(0, w), h / 3, R.r(0, w), h * 2 / 3, R.r(0, w), h); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); return t;
}
function stdTexPainting(seed) {
  return c3Tex((x, w, h) => { const R = RNG('paint', seed), hue = R.r(0, 360);
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `hsl(${hue},45%,62%)`); g.addColorStop(1, `hsl(${(hue + 40) % 360},40%,38%)`); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { x.fillStyle = `hsl(${(hue + R.r(60, 200)) % 360},50%,${R.r(40, 70)}%)`; x.beginPath(); x.ellipse(R.r(0.2, 0.8) * w, R.r(0.3, 0.8) * h, R.r(20, 60), R.r(20, 60), 0, 0, TAU); x.fill(); } }, 256, 320);
}
function stdTexPlaque(txt) {
  return c3Tex((x, w, h) => { x.fillStyle = '#2a2220'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8a050'; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12);
    txt.split('\n').forEach((l, i, a) => inked(x, l, w / 2, h * (0.5 + (i - (a.length - 1) / 2) * 0.32), h * 0.22, '#f0d890', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.86 })); }, 512, 192);
}

// ---- shared props
function stdBuildings(scene, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const R = RNG('stdbld', i, o.seed ?? 0), w = R.r(6, 12), h = R.r(20, 60), x = -80 + i * (160 / n) + R.n(3), z = (o.z ?? -45) - R.r(0, 35);
    const t = texWindows(i + 20); t.repeat.set(w / 6, h / 10);
    const b = c3Mesh(new THREE.BoxGeometry(w, h, w), c3Prop('#ffffff', { map: t, rough: 0.4, emissive: '#ffffff', ei: 0.9, emissiveMap: t }), 0.04); b.position.set(x, h / 2, z); scene.add(b);
  }
}
function stdLamp(x, z, M) {   // a street lamp with a glowing head
  const g = new THREE.Group(); g.position.set(x, 0, z);
  g.add(cyl(0.18, 0.25, 9, M.lampPost, 0, 4.5, 0, 0.03, 12));
  const head = c3Mesh(new THREE.SphereGeometry(0.75, 16, 12), c3Flat('#fff1c8', { glow: '#ffcf70' }), 0.04); head.position.y = 9.3; g.add(head);
  const pl2 = new THREE.PointLight('#ffd08a', 0.7, 16, 1.6); pl2.position.y = 9; pl2.layers.enableAll(); g.add(pl2);
  return g;
}
function stdTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  g.add(cyl(0.3, 0.45, 4, c3Prop('#6a4428', { rough: 0.7 }), 0, 2, 0, 0.03, 10));
  const leaf = c3Prop('#3f7a3c', { rough: 0.6 });
  for (const [a, b, c, r] of [[0, 5.2, 0, 2.2], [1.3, 4.6, 0.4, 1.6], [-1.3, 4.7, -0.3, 1.7], [0.2, 6.4, -0.2, 1.5]]) { const m = c3Mesh(new THREE.SphereGeometry(r, 16, 12), leaf, 0.04); m.position.set(a, b, c); g.add(m); }
  return g;
}
function stdOldRon() { return { key: 'oldron', outfit: 'navy', hairStyle: 'white', fx: ['mustache_grey', 'glasses'] }; }
function stdYoungRon() { return { key: 'ron', outfit: 'mustard', hairStyle: 'brown', fx: ['mustache', 'glasses'] }; }
function stdContract() { return pl(1.7, 2.3, c3Flat('#ffffff', { map: texContract(), side: THREE.DoubleSide }), 0, 0, 0); }

// =====================================================================
//  s21 — "Today,": a wall calendar whose pages tear off and fly, the year racing 1976 -> 2026
// =====================================================================
// the s01 wall calendar, exactly: a dark wood backing board, a red pin, a 2.1 x 2.62 page (texCalendar), on the
// 70s wallpaper over the wood panelling. y = the page centre.
function stdWallCal(scene, page, y = 5.0) {
  const g = new THREE.Group(); g.position.set(0, y, -0.15); scene.add(g);
  g.add(rb(2.3, 2.85, 0.08, c3Prop('#5a3a22', { rough: 0.5 }), 0, 0, -0.05, 0.02));
  g.add(pl(2.1, 2.62, c3Prop('#ffffff', { map: page, rough: 0.7 }), 0, -0.02, 0.01));
  g.add(cyl(0.09, 0.09, 0.12, c3Prop('#c8321e', { rough: 0.3 }), 0, 1.36, 0.06, 0.01).rotateX(Math.PI / 2));
  return g;
}
function stdWallRoom(scene) {   // the s01 wall: wallpaper above a wood panel, a shelf rail, a phone, a plant
  scene.add(pl(40, 20, c3Prop('#ffffff', { map: texWallpaper(), rough: 0.8 }), 0, 11.5, -0.4));
  scene.add(pl(40, 6, c3Prop('#ffffff', { map: texPanel(), rough: 0.6 }), 0, -1.5, -0.38));
  scene.add(rb(40, 0.3, 0.3, c3Prop('#ffffff', { map: texWood(), rough: 0.5 }), 0, 1.5, -0.25, 0.02));
  const phone = new THREE.Group(); phone.add(rb(1.1, 1.5, 0.6, c3Prop('#e06a1e', { rough: 0.3 }), 0, 0, 0)); phone.add(cyl(0.38, 0.38, 0.1, c3Prop('#f6e8d0', { rough: 0.3 }), 0, -0.1, 0.33, 0.015).rotateX(Math.PI / 2));
  phone.position.set(-3.6, 4.4, 0.0); scene.add(phone);
  const frame = rb(1.8, 1.4, 0.15, c3Prop('#8a5a32', { rough: 0.5 }), 3.6, 5.6, -0.3, 0.03); scene.add(frame);
  scene.add(pl(1.5, 1.1, c3Prop('#ffffff', { map: stdTexPainting(3), rough: 0.6 }), 3.6, 5.6, -0.2));
}
function stdBuildCal() {
  const s = stdScene(46), scene = s.scene;
  const key = lights(scene, { keyP: [3, 10, 12], keyI: 0.72, ambI: 0.2 });
  stdWallRoom(scene);
  stdWallCal(scene, stdTexYear(2026, 'APRIL'));
  // the torn pages: each a different year (1976 .. 2025), pivoting on the pin then flying off
  const pages = [];
  for (let i = 0; i < 14; i++) {
    const yr = Math.round(lerp(1976, 2025, i / 13));
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.62), c3Prop('#ffffff', { map: stdTexYear(yr), rough: 0.7, side: THREE.DoubleSide }));
    const pv = new THREE.Group(); pv.position.set(0, 5.0 + 1.29, -0.1 + (14 - i) * 0.003); p.position.y = -1.31; pv.add(p); scene.add(pv); pages.push(pv);
  }
  // foreground, out of focus: the edge of the orange pendant lamp and a plant leaf (NEAR layer)
  const lampN = stdNear(c3Mesh(new THREE.ConeGeometry(1.6, 1.4, 28, 1, true), c3Prop('#e8781e', { rough: 0.35, side: THREE.DoubleSide }), 0.03)); lampN.position.set(-2.6, 7.8, 4.2); scene.add(lampN);
  const leaf = stdNear(new THREE.Group()); for (let i = 0; i < 4; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.6, 10, 8), c3Prop('#3f7a3c', { rough: 0.6 }), 0.02); lf.position.set(Math.cos(i * 1.4) * 0.5, i * 0.35, 0); lf.scale.set(0.5, 1.4, 0.3); lf.rotation.z = 0.6 - i * 0.4; leaf.add(lf); }
  leaf.position.set(2.2, 1.6, 4.6); scene.add(leaf); c3Layer(leaf, C3.L_NEAR);
  c3Env(scene, { top: '#c8986a', mid: '#7a4030' }); c3Shadows(scene, key, 10);
  return Object.assign(s, { pages });
}
SHOT_FN['s21'] = (t, u, lt) => {
  const s = STD.cal ||= stdBuildCal();
  const today = stdW('Today', 1, 30.74);
  s.pages.forEach((pv, i) => {   // page i tears off at 0.028*i s from "Today" and flutters away, spinning
    const k = clamp((t - today + 0.06 - i * 0.026) / 0.32), R = RNG('page', i);
    pv.rotation.set(-k * R.r(1.2, 2.2), k * R.n(0.8), k * R.r(0.6, 1.6) * (i % 2 ? 1 : -1));
    pv.position.set(k * R.r(-4, 3), 6.29 + k * R.r(1.5, 4), -0.1 + (14 - i) * 0.003 + k * R.r(1.5, 5));
    pv.visible = k < 0.98;
  });
  // starts on the s01 framing (the page fills the frame) and whips back and round as the years fly
  c3SetCam(s.cam, stdCam([[0, [-0.2, 4.9, 6.2], [0, 5.0, -0.15], 40], [0.46, [0.9, 5.4, 9.5], [0.1, 5.2, -0.15], 44]], lt, 's21', { orbit: 0.25, rush: 1.4 }));
  stdRender(s, { bgBlur: stdRack(lt, 's21', 0.4, 2.6), nearBlur: 9, bloom: 0.28 });
};

// =====================================================================
//  s22 — the night plaza: the LED board rolls and lands on $5,000,000,000,000 on "trillion"; the crowd looks up
// =====================================================================
function stdBuildLed() {
  const s = stdScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#8090c0', ambI: 0.62, sky: '#4060a0', ground: '#100810', key: '#a0b8ff', keyI: 0.8, keyP: [-8, 20, 10], rim: '#ff8a40', rimI: 0.9 });
  const M = { lampPost: c3Prop('#2a2a34', { rough: 0.3, metal: 0.6 }) };
  const tiles = stdTexMarble(); tiles.repeat.set(30, 30);
  scene.add(pl(300, 300, c3Prop('#5a5870', { map: tiles, rough: 0.35, metal: 0.1 }), 0, 0, 0, 0, -Math.PI / 2));
  stdBuildings(scene, 18, { z: -55 });
  // the big screen tower
  scene.add(rb(30, 30, 3, c3Prop('#2a2e3a', { rough: 0.3, metal: 0.4 }), 0, 15, -14, 0.05));
  const board = document.createElement('canvas'); board.width = 2048; board.height = 640;
  const bt = new THREE.CanvasTexture(board); bt.encoding = THREE.sRGBEncoding;
  scene.add(pl(27, 8.4, c3Flat('#ffffff', { map: bt, glow: '#5a1a08' }), 0, 19, -12.45));
  scene.add(pl(27, 3.2, c3Flat('#ffffff', { map: texSign('APPLE MARKET VALUE', '#ffffff', '#3a3a50', 0.36), glow: '#8090ff' }), 0, 25.6, -12.45));
  scene.add(pl(27, 1.6, c3Flat('#ffffff', { map: texSign('LIVE · NASDAQ · AAPL ▲', '#7aff9a', '#103a1a', 0.5), glow: '#2acb6a' }), 0, 13.2, -12.45));
  // plaza dressing: lamps, trees, benches, a hot-dog cart, planters, bollards
  [[-13, 2], [13, 2], [-13, 16], [13, 16]].forEach(([x, z]) => scene.add(stdLamp(x, z, M)));
  [[-20, -4, 1.3], [20, -4, 1.3], [-24, 10, 1.1], [24, 10, 1.1]].forEach(([x, z, k]) => scene.add(stdTree(x, z, k)));
  for (const [x, z] of [[-9, 18], [9, 18]]) { const b = new THREE.Group(); b.position.set(x, 0, z);
    b.add(rb(5, 0.3, 1.4, c3Prop('#8a5a32', { rough: 0.5 }), 0, 1.6, 0)); b.add(rb(5, 1.4, 0.25, c3Prop('#8a5a32', { rough: 0.5 }), 0, 2.4, -0.6));
    for (const sx of [-2, 2]) b.add(rb(0.3, 1.6, 1.2, c3Prop('#2a2a34', { rough: 0.3, metal: 0.5 }), sx, 0.8, 0)); scene.add(b); }
  const cart = new THREE.Group(); cart.position.set(17, 0, 6);
  cart.add(rb(4.5, 2.6, 2.4, c3Prop('#d8d8e0', { rough: 0.2, metal: 0.7 }), 0, 2.4, 0)); cart.add(rb(5.2, 0.3, 3, c3Prop('#c8321e', { rough: 0.3 }), 0, 6.2, 0));
  for (let i = 0; i < 5; i++) cart.add(pl(1.04, 2.6, c3Prop(i % 2 ? '#ffffff' : '#c8321e', { rough: 0.5, side: THREE.DoubleSide }), -2.08 + i * 1.04, 4.9, 1.5));
  cart.add(cyl(0.05, 0.05, 2.6, c3Prop('#2a2a34'), -2.4, 4.9, 1.4, 0.01, 6)); cart.add(cyl(0.05, 0.05, 2.6, c3Prop('#2a2a34'), 2.4, 4.9, 1.4, 0.01, 6));
  for (const sx of [-1.6, 1.6]) { const w = c3Mesh(new THREE.TorusGeometry(0.7, 0.18, 8, 20), c3Prop('#1a1a1a', { rough: 0.6 }), 0.02); w.position.set(sx, 0.85, 1.25); cart.add(w); }
  cart.add(pl(3.6, 1.0, c3Flat('#ffffff', { map: texSign('HOT DOGS', '#ffd23c', '#7a1a08', 0.6) }), 0, 3.2, 1.22));
  scene.add(cart);
  for (let i = 0; i < 7; i++) scene.add(cyl(0.25, 0.3, 1.6, c3Prop('#e8b030', { rough: 0.3 }), -12 + i * 4, 0.8, 0.5, 0.02, 10));
  // the crowd: three ranks, all looking up at the screen
  const focus = new THREE.Group(); scene.add(focus);
  const outfits = ['stripes', 'navy', 'plaid', 'white', 'mustard', 'teal'], hairs = ['ref', 'brown', 'long', 'white', 'bald', 'ref', 'brown', 'long', 'ref'];   // the glued (measured-hairline) styles only
  const peds = [];
  for (let i = 0; i < 16; i++) {
    const R = RNG('stdped', i), row = Math.floor(i / 6), x = -13 + (i % 6) * 5.2 + R.n(1.0) + (row % 2) * 2.4, z = 6 + row * 4.2 + R.n(0.8);
    const p = stdPerson({ key: 'stdped' + i, outfit: outfits[(i * 5) % 6], hairStyle: hairs[(i * 7) % 9], fx: i % 5 === 2 ? ['glasses'] : i % 7 === 3 ? ['beard', 'mustache'] : [] }, x, 3.0 * 1.25, z, 1.25);
    focus.add(p.g); peds.push(p);
  }
  c3Layer(focus, C3.L_FOCUS);
  // out-of-focus foreground at the lens (NEAR layer, blurred): leafy branches across the top right
  const nearG = new THREE.Group();
  for (let i = 0; i < 7; i++) { const R = RNG('nleaf', i), m = c3Mesh(new THREE.SphereGeometry(R.r(0.9, 1.5), 12, 10), c3Prop('#2f5a30', { rough: 0.6 }), 0.03); m.position.set(5 + R.r(0, 4), 13 + R.r(0, 3), 30 + R.n(1)); m.scale.set(1, 0.7, 0.8); nearG.add(m); }
  scene.add(nearG); c3Layer(nearG, C3.L_NEAR);
  c3Env(scene, { top: '#7a90d0', mid: '#3a3460', bot: '#100c1a', cards: [[0, 30, -20, 30, 8, '#ff7a3a'], [-30, 10, 10, 10, 18, '#7a9aff']] }); c3Shadows(scene, key, 34);
  return Object.assign(s, { board, bt, peds });
}
SHOT_FN['s22'] = (t, u, lt) => {
  const s = STD.led ||= stdBuildLed();
  const t0 = SHOT_LIST.find((r) => r[0] === 's22')[1], land = stdW('trillion', 1, 32.34);
  const k = clamp((t - (t0 + 0.05)) / (land - t0 - 0.05)), v = k >= 1 ? 5e12 : Math.floor(5e12 * (1 - (1 - k) ** 3) / 1e9) * 1e9 + Math.floor(RNG('led', Math.round(t * FPS)).r(0, 1e9));
  const x = s.board.getContext('2d'), w = s.board.width, h = s.board.height;
  x.fillStyle = '#100404'; x.fillRect(0, 0, w, h);
  x.font = `700 ${h * 0.34}px Consolas, "Courier New", monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(255,60,20,0.12)'; x.fillText('$8,888,888,888,888', w / 2, h * 0.53, w * 0.92);
  x.fillStyle = k >= 1 ? '#ffd23c' : '#ff4a1a'; x.fillText('$' + Math.round(Math.min(v, 5e12)).toLocaleString('en-US'), w / 2, h * 0.53, w * 0.92); s.bt.needsUpdate = true;
  // camera: low in the crowd, cranes up toward the board, accelerating into the cut
  c3SetCam(s.cam, stdCam([[0, [3.5, 4.0, 41], [0, 15.6, -12], 50], [0.9, [1.6, 5.0, 45], [0, 16.8, -12], 50], [1.8, [0.2, 6.2, 48], [0, 17.8, -12], 50]], lt, 's22', { orbit: -0.06 }));   // low in the crowd: their heads sit at ~50-58 % of the height, above the subtitle band
  const landed = t >= land - 2 / FPS;
  s.peds.forEach((p, i) => c3PersonPose(p, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [land, ['shocked', 'starstruck', 'surprised', 'excited'][i % 4]]], t, 'stdped' + i), gaze: [0, -1], head: [RNG('tilt', i).n(0.08), 0, 0.05],
    lift: (q) => landed ? 0.25 * EZ.back(seg(q, land - 0.05, land + 0.1)) * Math.exp(-Math.max(0, q - land - 0.1) * 3) : 0,
    hand: i % 3 === 0 && landed ? { armL: [1.4, 3.6], armR: [-1.4, 3.6] } : undefined, foot: { legL: [0.55, -3.0], legR: [-0.55, -3.0] } }));
  stdRender(s, { bg: '#0a0810', bgBlur: stdRack(lt, 's22', 4.5, 1.6), nearBlur: 10, glow: 0.55 + (landed ? 0.4 * Math.exp(-(t - land) * 3) : 0), glowBlur: 18 });
};

// =====================================================================
//  s23 — "On paper,": the 1976 contract in a museum glass case
// =====================================================================
function stdBuildMuseum() {
  const s = stdScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#fff0e0', ambI: 0.35, keyP: [2, 18, 10], keyI: 0.9, rim: '#ffd8a0', rimI: 0.5 });
  scene.add(pl(120, 120, c3Prop('#ffffff', { map: stdTexMarble(), rough: 0.25 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(pl(80, 30, c3Prop('#7a2a2a', { rough: 0.8 }), 0, 15, -14));
  scene.add(rb(80, 1.2, 0.6, c3Prop('#c8a050', { rough: 0.3, metal: 0.6 }), 0, 4.0, -13.7, 0.02));
  for (let i = 0; i < 4; i++) {   // framed paintings with little spotlights
    const x = -21 + i * 14; if (Math.abs(x) < 5) continue;
    scene.add(rb(6.4, 8.2, 0.4, c3Prop('#c8a050', { rough: 0.3, metal: 0.7 }), x, 12, -13.6, 0.03));
    scene.add(pl(5.4, 7.2, c3Prop('#ffffff', { map: stdTexPainting(i), rough: 0.6 }), x, 12, -13.35));
    const sp = new THREE.SpotLight('#ffe0b0', 0.8, 30, 0.5, 0.6); sp.position.set(x, 20, -9); sp.target.position.set(x, 12, -13.6); sp.layers.enableAll(); scene.add(sp, sp.target);
  }
  const focus = new THREE.Group(); scene.add(focus);
  // pedestal, glass case, the contract on a velvet slope, a plaque
  focus.add(rb(6, 7, 6, c3Prop('#f2ece0', { rough: 0.4 }), 0, 3.5, 0, 0.05));
  focus.add(rb(6.4, 0.4, 6.4, c3Prop('#c8a050', { rough: 0.3, metal: 0.7 }), 0, 7.2, 0, 0.03));
  const velvet = rb(4.4, 0.6, 3.6, c3Prop('#5a1420', { rough: 0.9 }), 0, 7.65, 0, 0.03); focus.add(velvet);
  const doc = pl(2.6, 3.4, c3Prop('#ffffff', { map: texContract(), rough: 0.7 }), 0, 8.1, 0.2, 0, -1.15); focus.add(doc);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(5.4, 4.2, 5.4), new THREE.MeshPhysicalMaterial({ color: '#dff4ff', transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.0, depthWrite: false }));
  glass.position.set(0, 9.5, 0); glass.renderOrder = 5; focus.add(glass);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: '#f4fbff' })); edges.position.copy(glass.position); focus.add(edges);
  focus.add(pl(4.6, 1.4, c3Flat('#ffffff', { map: stdTexPlaque('APPLE COMPUTER CO.\nPARTNERSHIP AGREEMENT · 1976') }), 0, 5.6, 3.02));
  for (const x of [-5.5, 5.5]) { focus.add(cyl(0.18, 0.18, 4, c3Chrome(), x, 2, 4, 0.02, 10)); focus.add(cyl(0.5, 0.6, 0.3, c3Chrome(), x, 0.15, 4, 0.02, 16)); }
  const rope = c3Mesh(new THREE.TorusGeometry(5.5, 0.12, 8, 30, Math.PI), c3Prop('#a01a28', { rough: 0.6 }), 0.02); rope.rotation.set(0, 0, Math.PI); rope.position.set(0, 3.9, 4); rope.scale.y = 0.3; focus.add(rope);
  // foreground, close to the lens and blurred: a brass stanchion and its velvet rope
  const nearG = new THREE.Group(); nearG.add(cyl(0.3, 0.3, 9, c3Chrome(), 0, 4.5, 0, 0.02, 12)); nearG.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.55, 14, 10), c3Chrome(), 0.02), 0, 9.1, 0));
  const rope2 = c3Mesh(new THREE.TorusGeometry(4.0, 0.25, 8, 24, Math.PI), c3Prop('#a01a28', { rough: 0.6 }), 0.02); rope2.rotation.set(0, Math.PI / 2, Math.PI); rope2.position.set(0, 8.6, -4); rope2.scale.y = 0.35; nearG.add(rope2);
  nearG.position.set(-4.2, 0, 11.5); scene.add(nearG); c3Layer(nearG, C3.L_NEAR);
  const spot = new THREE.SpotLight('#fff4dc', 1.6, 40, 0.35, 0.5); spot.position.set(0, 24, 6); spot.target.position.set(0, 8, 0); spot.layers.enableAll(); scene.add(spot, spot.target);
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#fff4e0', mid: '#a06048' }); c3Shadows(scene, key, 16);
  return s;
}
SHOT_FN['s23'] = (t, u, lt) => {
  const s = STD.mus ||= stdBuildMuseum();
  c3SetCam(s.cam, stdCam([[0, [6, 9.5, 20], [0, 8.9, 0], 46], [0.95, [2.0, 11.6, 14.0], [0, 8.6, 0], 46]], lt, 's23', { orbit: 0.22 }));
  stdRender(s, { bg: '#2a0e0e', bgBlur: stdRack(lt, 's23', 1.2, 4.2), nearBlur: 9, glow: 0.5, bloom: 0.36 });
};

// =====================================================================
//  s24 — "your 10% would be half a trillion": pallets of cash stack up into a tower; on "half" the top
//  tenth glows gold, and a sign lands on $500,000,000,000 on "trillion"
// =====================================================================
function stdBuildCash() {
  const s = stdScene(50), scene = s.scene;
  const key = lights(scene, { keyP: [6, 30, 16], keyI: 1.0, rim: '#ffd08a', rimI: 0.7 });
  scene.add(pl(200, 200, c3Prop('#4a4a52', { rough: 0.6 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(pl(200, 90, c3Prop('#3a3440', { rough: 0.8 }), 0, 45, -40));
  for (let i = 0; i < 10; i++) scene.add(rb(2, 70, 2, c3Prop('#5a5060', { rough: 0.5 }), -45 + i * 10, 35, -38, 0.03));   // warehouse columns
  const cashM = c3Prop('#ffffff', { map: stdTexCash(), rough: 0.5 }), glowM = c3Prop('#ffe08a', { map: stdTexCash(), rough: 0.3, emissive: '#ff9a10', ei: 0.0 });
  glowM.userData.glow = '#ffcf50';
  const palletM = c3Prop('#b07a40', { rough: 0.7 });
  const focus = new THREE.Group(); scene.add(focus);
  // the tower: 10 tiers of 4 pallets; tier 10 (the top tenth) is "your 10%"
  const tiers = [];
  for (let k = 0; k < 10; k++) {
    const tier = new THREE.Group(); tier.position.y = k * 3.0;
    for (const [px, pz] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) {
      tier.add(rb(5, 0.5, 5, palletM, px, 0.25, pz, 0.03));
      const block = rb(4.8, 2.4, 4.8, k === 9 ? glowM : cashM, px, 1.7, pz, 0.04); tier.add(block);
    }
    focus.add(tier); tiers.push(tier);
  }
  // a forklift and loose stacks around the base (the set is never empty)
  const fork = new THREE.Group(); fork.position.set(-12, 0, 6); fork.rotation.y = 0.5;
  fork.add(rb(4, 3, 6, c3Prop('#f2c230', { rough: 0.3 }), 0, 2.2, 0)); fork.add(rb(3.6, 3, 0.3, c3Prop('#2a2a2a', { rough: 0.5 }), 0, 5.2, -1)); fork.add(rb(0.3, 7, 0.3, c3Prop('#2a2a2a'), -1.4, 3.5, 3.2)); fork.add(rb(0.3, 7, 0.3, c3Prop('#2a2a2a'), 1.4, 3.5, 3.2));
  for (const [x, z] of [[-1.6, -2], [1.6, -2], [-1.6, 2], [1.6, 2]]) { const w = c3Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 16), c3Prop('#1a1a1a', { rough: 0.6 }), 0.02); w.rotation.z = Math.PI / 2; w.position.set(x, 0.9, z); fork.add(w); }
  scene.add(fork);
  for (const [x, z, n] of [[11, 7, 3], [14, -3, 4], [-15, -6, 2]]) for (let j = 0; j < n; j++) scene.add(rb(4.8, 2.4, 4.8, cashM, x, 1.2 + j * 2.5, z, 0.04));
  // a cash stack right at the lens, out of focus (NEAR layer)
  const nearCash = new THREE.Group(); for (let j = 0; j < 3; j++) nearCash.add(rb(4.8, 2.4, 4.8, cashM, 0, 1.2 + j * 2.5, 0, 0.04));
  nearCash.position.set(15, 0, 34); scene.add(nearCash); c3Layer(nearCash, C3.L_NEAR);
  // the value sign hanging beside the tower
  const sign = document.createElement('canvas'); sign.width = 1024; sign.height = 256; const st = new THREE.CanvasTexture(sign); st.encoding = THREE.sRGBEncoding;
  const sg = new THREE.Group(); sg.add(rb(14, 3.6, 0.5, c3Prop('#1a1414', { rough: 0.4 }), 0, 0, 0, 0.04)); sg.add(pl(13.2, 3.0, c3Flat('#ffffff', { map: st, glow: '#5a3a08' }), 0, 0, 0.27));
  sg.position.set(0, 33, 2.8); focus.add(sg);
  for (const sx of [-5, 5]) focus.add(cyl(0.05, 0.05, 6, c3Prop('#1a1a1a'), sx, 36.8, 2.8, 0.01, 6));
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#ffe8c8', mid: '#706070' }); c3Shadows(scene, key, 30);
  return Object.assign(s, { tiers, glowM, sign, st });
}
SHOT_FN['s24'] = (t, u, lt) => {
  const s = STD.cash ||= stdBuildCash();
  const half = stdW('half', 1, 35.07), tril = stdW('trillion', 2, 35.41), t0 = SHOT_LIST.find((r) => r[0] === 's24')[1];
  // tiers drop in one after another (each with a small bounce), finishing just before "half"
  s.tiers.forEach((tier, k) => { const ts = k < 3 ? -1 : t0 + 0.05 + (k - 3) * ((half - t0 - 0.25) / 7), q = clamp((t - ts) / 0.16);
    tier.position.y = k * 3.0 + (1 - EZ.back(q)) * 14; tier.visible = t >= ts - 0.02; });
  const g = t >= half - 2 / FPS ? Math.min(1, (t - half + 2 / FPS) / 0.15) : 0; s.glowM.emissiveIntensity = 0.55 * g;
  const x = s.sign.getContext('2d'), w = s.sign.width, h = s.sign.height; x.fillStyle = '#120a04'; x.fillRect(0, 0, w, h);
  const kk = clamp((t - (half - 0.2)) / (tril - half + 0.2)), v = kk >= 1 ? 5e11 : Math.floor(5e11 * EZ.o3(kk) / 1e8) * 1e8;
  x.font = `700 ${h * 0.5}px Consolas, monospace`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = kk >= 1 ? '#ffd23c' : '#ff8a2a';
  x.fillText('$' + v.toLocaleString('en-US'), w / 2, h * 0.53, w * 0.94); s.st.needsUpdate = true;
  // camera: starts low on the base, pulls back and tilts up as the tower grows
  c3SetCam(s.cam, stdCam([[0, [7, 4, 22], [0, 6, 0], 50], [1.0, [10, 13, 42], [0, 16, 0], 50], [1.94, [11, 22, 58], [0, 22, 0], 50]], lt, 's24', { orbit: 0.12, creep: 0.4 }));
  stdRender(s, { bg: '#1a1418', bgBlur: stdRack(lt, 's24', 1.4, 3.6), nearBlur: 10, glow: 0.5 + 0.6 * g, bloom: 0.34 + 0.15 * g });
};

// =====================================================================
//  s25 — "like trading a winning lottery ticket for a used bike": young Ron hands over a glowing ticket,
//  a smug guy pushes a rusty bike to him; the ticket flares on "ticket", the bike lands on "bike"
// =====================================================================
function stdBike(M) {
  const g = new THREE.Group();
  for (const x of [-1.9, 1.9]) { const w = c3Mesh(new THREE.TorusGeometry(1.3, 0.12, 8, 28), M.tire, 0.02); w.position.set(x, 1.3, 0); g.add(w);
    for (let i = 0; i < 6; i++) { const sp = cyl(0.025, 0.025, 2.5, M.rust, 0, 0, 0, 0, 4); sp.position.set(x, 1.3, 0); sp.rotation.z = i * Math.PI / 6; g.add(sp); }
    g.add(cyl(0.12, 0.12, 0.2, M.rust, x, 1.3, 0, 0.01, 8).rotateX(Math.PI / 2)); }
  const bar = (a, b, r = 0.11) => { const d = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)), m = cyl(r, r, d.length(), M.frame, 0, 0, 0, 0.02, 8);
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); };
  bar([-1.9, 1.3, 0], [-0.2, 2.9, 0]); bar([-1.9, 1.3, 0], [0.2, 1.4, 0]); bar([0.2, 1.4, 0], [-0.2, 2.9, 0]); bar([-0.2, 2.9, 0], [1.4, 3.0, 0]); bar([0.2, 1.4, 0], [1.4, 3.0, 0]); bar([1.4, 3.0, 0], [1.9, 1.3, 0]); bar([1.4, 3.0, 0], [1.2, 3.8, 0]);
  bar([0.8, 3.9, -0.7], [1.6, 3.8, 0.7], 0.08);
  const seat = rb(0.9, 0.25, 0.45, M.seat, -0.25, 3.2, 0, 0.02); g.add(seat);
  for (let i = 0; i < 9; i++) { const R = RNG('rust', i), sp = c3Mesh(new THREE.SphereGeometry(R.r(0.08, 0.16), 8, 6), M.rustDark, 0); sp.position.set(R.r(-1.6, 1.4), R.r(1.5, 3), R.n(0.1)); g.add(sp); }   // rust flakes
  return g;
}
function stdBuildTrade() {
  const s = stdScene(50), scene = s.scene;
  const key = lights(scene, { keyP: [8, 20, 14], keyI: 0.8, ambI: 0.2, sky: '#c8e0ff', ground: '#6a5040', rim: '#ffd8a0', rimI: 0.6 });
  // a sunny back street: pavement, a brick wall with posters, a dumpster, a hydrant, a lamp, bins
  scene.add(pl(200, 200, c3Prop('#8a8478', { rough: 0.8 }), 0, 0, 0, 0, -Math.PI / 2));
  const brick = c3Tex((x, w, h) => { x.fillStyle = '#b05a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8d8c0'; for (let j = 0; j < 16; j++) { x.fillRect(0, j * h / 16, w, 3); for (let i = 0; i < 8; i++) x.fillRect(((i + (j % 2) * 0.5) * w / 8) % w, j * h / 16, 3, h / 16); } }, 256, 256);
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(10, 4);
  scene.add(pl(80, 22, c3Prop('#ffffff', { map: brick, rough: 0.8 }), 0, 11, -8));
  [['GARAGE SALE', '#ffd23c', '#7a1a08', -9, 9], ['BIKES $5', '#ffffff', '#1a3a7a', 7, 11], ['LOTTO', '#ffd23c', '#c8321e', 15, 8]].forEach(([tx, c1, c2, x, y]) =>
    scene.add(pl(5, 2.2, c3Prop('#ffffff', { map: texSign(tx, c1, c2, 0.5), rough: 0.6 }), x, y, -7.9)));
  const dump = rb(7, 4, 3.5, c3Prop('#2a6a4a', { rough: 0.4 }), -16, 2.2, -5.5, 0.04); scene.add(dump);
  scene.add(cyl(0.6, 0.7, 2.4, c3Prop('#c8321e', { rough: 0.3 }), 13, 1.2, -4, 0.03, 14)); scene.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.6, 14, 8, 0, TAU, 0, Math.PI / 2), c3Prop('#c8321e', { rough: 0.3 }), 0.03), 13, 2.4, -4));
  for (let i = 0; i < 3; i++) scene.add(cyl(0.9, 0.8, 2.6, c3Prop(['#4a5a6a', '#3a6a3a', '#6a6a6a'][i], { rough: 0.4 }), 18 + i * 2.1, 1.3, -6, 0.03, 14));
  scene.add(stdTree(-24, -3, 1.2));
  const nearT = new THREE.Group(); nearT.add(cyl(0.9, 0.8, 2.6, c3Prop('#4a5a6a', { rough: 0.4 }), 0, 1.3, 0, 0.03, 14)); nearT.add(cyl(1.0, 1.0, 0.25, c3Prop('#3a4a5a', { rough: 0.4 }), 0, 2.7, 0, 0.03, 14)); nearT.position.set(-7.5, 0, 17); scene.add(nearT); c3Layer(nearT, C3.L_NEAR);   // a bin at the lens, blurred
  const M = { tire: c3Prop('#1e1a18', { rough: 0.7 }), rust: c3Prop('#8a4a22', { rough: 0.8 }), rustDark: c3Prop('#5a2a10', { rough: 0.9 }), frame: c3Prop('#9a5a2a', { rough: 0.75, metal: 0.3 }), seat: c3Prop('#3a2418', { rough: 0.6 }) };
  const focus = new THREE.Group(); scene.add(focus);
  const ron = stdPerson(stdYoungRon(), -3.4, 3.0 * STD_K, 2.5);
  const guy = stdPerson({ key: 'bikeguy', outfit: 'plaid', hairStyle: 'ref', fx: ['beard', 'mustache'] }, 3.6, 3.0 * STD_K, 4.7);   // just in front of the bike: his hands rest ON the grips
  const bike = stdBike(M); bike.scale.setScalar(1.15); bike.position.set(1.2, 0, 3.4); bike.rotation.y = -0.25;
  const ticket = new THREE.Group(); const tm = c3Flat('#ffffff', { map: stdTexTicket(), side: THREE.DoubleSide, glow: '#ffcf40' });
  const tk = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), tm); ticket.add(tk); ticket.add(c3Put(c3Mesh(new THREE.PlaneGeometry(1.72, 0.92), c3Flat(C3.ink, { side: THREE.DoubleSide })), 0, 0, -0.01));
  stdHold(ron, ticket);
  focus.add(ron.g, guy.g, bike);
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#a8b8c8', mid: '#806050' }); c3Shadows(scene, key, 18);
  return Object.assign(s, { ron, guy, bike, ticket, tm });
}
SHOT_FN['s25'] = (t, u, lt) => {
  const s = STD.trade ||= stdBuildTrade();
  const tick = stdW('ticket', 1, 37.47), bikeT = stdW('bike', 1, 38.39), win = stdW('winning', 1, 36.85);
  c3SetCam(s.cam, stdCam([[0, [-7, 5.0, 25], [-0.5, 6.6, 2.5], 50], [1.5, [-1.5, 5.6, 24.5], [0.2, 6.6, 2.5], 50], [3.0, [4, 6.2, 23.5], [0.6, 6.6, 2.5], 50]], lt, 's25', { creep: 0.6 }));
  // Ron holds the ticket up proudly, then hands it over on "bike"; the guy walks the bike in, both hands on the handlebar
  const give = c3Hold([[0, 0], [bikeT - 0.1, 1]], t, 6 / FPS);
  const ronHand = [lerp(1.6, 2.6, give), lerp(3.2, 2.2, give)];
  s.ticket.position.set(ronHand[0] + 0.1, ronHand[1] + 0.55, 0.06); s.ticket.rotation.z = lerp(0.18, -0.1, give);
  const flare = t >= tick - 2 / FPS ? Math.exp(-(t - tick) * 1.8) : 0;
  s.ticket.scale.setScalar(1 + 0.25 * flare + 0.12 * (t >= win ? 1 : 0));
  const roll = EZ.io(seg(t, bikeT - 0.6, bikeT - 0.05));
  s.bike.position.x = lerp(2.6, 0.6, roll); s.bike.rotation.z = (1 - EZ.back(seg(t, bikeT - 0.12, bikeT + 0.1))) * 0.04;
  s.guy.g.position.x = s.bike.position.x + 2.5;   // he walks with it, standing at the handlebar
  const step = Math.sin(clamp((t - (bikeT - 0.6)) / 0.55) * Math.PI * 3) * (roll > 0 && roll < 1 ? 1 : 0);
  c3PersonPose(s.ron, s.cam, t, { expr: c3FaceAt([[0, 'proud'], [win, 'excited'], [bikeT, 'happy']], t, 'ron'), gaze: [0.6, 0.3], head: [-0.05, 0, 0],
    hand: { armL: ronHand, armR: [-1.0, 0.6] }, foot: { legL: [0.6, -3.0], legR: [-0.6, -3.0] } });
  // hand targets = the handlebar's two grips, taken into the guy's billboard plane
  const guyPose = (hand) => c3PersonPose(s.guy, s.cam, t, { expr: c3FaceAt([[0, 'sly'], [tick, 'mischievous']], t, 'bikeguy'), gaze: [-0.7, 0.2], head: [0.05, 0, 0],
    hand, foot: { legL: [0.6 + step * 0.35, -3.0], legR: [-0.6 - step * 0.35, -3.0] } });
  guyPose(undefined); s.bike.updateMatrixWorld(true); s.guy.g.updateMatrixWorld(true);
  const grip = (x, y, z) => { const v = s.bike.localToWorld(new THREE.Vector3(x, y, z)); s.guy.root.worldToLocal(v); return [v.x, v.y]; };
  const g1 = grip(0.75, 3.92, -0.75), g2 = grip(1.65, 3.78, 0.75);
  const near = g1[0] > g2[0] ? g1 : g2, far = g1[0] > g2[0] ? g2 : g1;   // armL is on the +x side of his body
  guyPose({ armL: near, armR: far });
  stdRender(s, { bg: '#a0b8d0', bgBlur: stdRack(lt, 's25', 2.0, 3.6), nearBlur: 9, glow: 0.5 + 0.8 * flare, bloom: 0.3 });
};

// =====================================================================
//  s26-s28 — old Ron on his porch at golden hour: rocker, lemonade, the contract in his hands
// =====================================================================
function stdTexSunset() {   // golden-hour sky: violet top, peach band, low sun, soft lit clouds, a tree line in silhouette
  return c3Tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a4c9a'); g.addColorStop(0.42, '#d8789a'); g.addColorStop(0.68, '#f6a066'); g.addColorStop(0.86, '#ffd88a'); g.addColorStop(1, '#ffe8b0');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const sun = x.createRadialGradient(w * 0.66, h * 0.8, 0, w * 0.66, h * 0.8, w * 0.28); sun.addColorStop(0, 'rgba(255,248,214,1)'); sun.addColorStop(0.18, 'rgba(255,236,170,0.95)'); sun.addColorStop(1, 'rgba(255,200,120,0)');
    x.fillStyle = sun; x.fillRect(0, 0, w, h);
    const R = RNG('sunclouds');
    for (let c = 0; c < 7; c++) {   // puffy clouds: a violet base, a peach lit top, a pale crown
      const cx = R.r(0.05, 0.95) * w, cy = R.r(0.12, 0.6) * h, sc = R.r(0.6, 1.2) * w / 1024;
      const puffs = []; for (let k = 0; k < 7; k++) puffs.push([cx + (k - 3) * 46 * sc + R.n(14 * sc), cy - Math.sin((k / 6) * Math.PI) * 34 * sc + R.n(6 * sc), R.r(30, 52) * sc]);
      x.fillStyle = 'rgba(122,86,150,0.92)'; puffs.forEach(([px, py, r]) => { x.beginPath(); x.arc(px, py + r * 0.25, r, 0, TAU); x.fill(); });
      x.fillStyle = 'rgba(255,190,150,0.95)'; puffs.forEach(([px, py, r]) => { x.beginPath(); x.arc(px - r * 0.1, py - r * 0.05, r * 0.82, 0, TAU); x.fill(); });
      x.fillStyle = 'rgba(255,232,196,0.8)'; puffs.forEach(([px, py, r]) => { x.beginPath(); x.arc(px - r * 0.25, py - r * 0.3, r * 0.42, 0, TAU); x.fill(); });
    }
    x.fillStyle = '#3a2440';   // the tree line and one big tree, in silhouette
    for (let i = 0; i <= 40; i++) { const tx = i / 40 * w, ty = h * 0.9 - (RNG('tl', i).r(0.02, 0.07)) * h; x.beginPath(); x.arc(tx, ty, h * 0.05, 0, TAU); x.fill(); }
    x.fillRect(0, h * 0.9, w, h * 0.1);
    x.fillRect(w * 0.205, h * 0.6, w * 0.022, h * 0.32);
    for (const [ox, oy, r] of [[0.2, 0.55, 0.09], [0.27, 0.5, 0.08], [0.15, 0.6, 0.07], [0.24, 0.42, 0.07], [0.31, 0.58, 0.06]]) { x.beginPath(); x.arc(ox * w, oy * h, r * w, 0, TAU); x.fill(); }
  }, 1024, 1024);
}
function stdBuildPorch() {
  const s = stdScene(50), scene = s.scene;
  const key = lights(scene, { keyP: [16, 9, 10], keyI: 1.05, key: '#ffcf98', amb: '#ffe0c8', ambI: 0.28, sky: '#ffc8a0', ground: '#5a3a30', rim: '#ff8a50', rimI: 1.0, rimP: [14, 7, -12] });
  const wood = c3Prop('#8a5a32', { rough: 0.5 }), trim = c3Prop('#f4ecd8', { rough: 0.4 });
  // the far view to the right of the house: lawn, a picket fence, two trees, and the sunset sky
  scene.add(pl(240, 240, c3Prop('#5a8a3a', { rough: 0.9 }), 0, -0.02, 0, 0, -Math.PI / 2));
  scene.add(pl(300, 150, c3Flat('#ffffff', { map: stdTexSunset() }), 30, 46, -70));
  for (let i = 0; i < 26; i++) { const x = 3 + i * 1.3; scene.add(rb(0.5, 3.2, 0.2, trim, x, 1.6, -22, 0.02)); }
  scene.add(rb(34, 0.35, 0.2, trim, 19.5, 2.3, -21.9, 0.015)); scene.add(stdTree(30, -30, 2.0)); scene.add(stdTree(12, -40, 2.6));
  // the porch: plank deck, the house wall behind his left (siding, a warm window, shutters, a wall lantern), roof beam, posts, railing
  scene.add(rb(34, 1.2, 15, c3Prop('#ffffff', { map: stdTexPlanks(), rough: 0.6 }), 0, 0.6, 0, 0.04));
  // the house, complete: one long sided wall from far left to a corner post at x 9, a plank porch ceiling, the roof's
  // fascia and shingled eave along the front, a door with its frame; past the corner the porch opens onto the yard
  const sid = stdTexSiding(); sid.repeat.set(10, 3);
  scene.add(pl(50, 17.4, c3Prop('#ffffff', { map: sid, rough: 0.7 }), -16, 9.7, -6.9));
  scene.add(rb(1.0, 17.6, 1.0, trim, 9, 9.6, -6.6, 0.04));                                   // corner board
  scene.add(rb(52, 0.6, 0.5, trim, -16, 1.5, -6.7, 0.02));                                    // skirting
  const ceil = c3Prop('#ffffff', { map: stdTexPlanks(), rough: 0.7 }); ceil.color = new THREE.Color('#d8c0a0');
  scene.add(pl(52, 14.2, ceil, -15, 18.3, -0.1, 0, Math.PI / 2));                            // porch ceiling
  scene.add(rb(54, 1.6, 0.6, trim, -14, 18.0, 7.0, 0.04));                                    // fascia
  const eave = rb(56, 0.7, 3.4, c3Prop('#5a3a32', { rough: 0.7 }), -14, 19.2, 7.6, 0.04); eave.rotation.x = -0.32; scene.add(eave);   // shingled eave
  for (let i = 0; i < 9; i++) { const sh = rb(56, 0.25, 0.5, c3Prop(i % 2 ? '#4a2e28' : '#6a443a', { rough: 0.8 }), -14, 19.0 + i * 0.12, 6.4 + i * 0.36, 0); sh.rotation.x = -0.32; scene.add(sh); }
  const door = new THREE.Group(); door.position.set(5.4, 1.2, -6.75);
  door.add(rb(4.6, 9.6, 0.5, trim, 0, 4.8, 0, 0.04)); door.add(rb(3.6, 8.9, 0.4, c3Prop('#2f5a4c', { rough: 0.45 }), 0, 4.45, 0.15, 0.03));
  for (const [px, py] of [[-0.85, 6.6], [0.85, 6.6], [-0.85, 2.6], [0.85, 2.6]]) door.add(rb(1.2, 2.6, 0.15, c3Prop('#3a6a5a', { rough: 0.45 }), px, py, 0.4, 0.015));
  door.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.2, 12, 8), c3Chrome('#e8c060'), 0.01), 1.3, 4.4, 0.5));
  scene.add(door);
  scene.add(rb(5.5, 5.2, 0.4, trim, -8.5, 9.2, -6.7, 0.04)); scene.add(pl(4.8, 4.5, c3Flat('#ffd890', { glow: '#ffb050' }), -8.5, 9.2, -6.45));
  scene.add(rb(0.3, 4.5, 0.2, trim, -8.5, 9.2, -6.4, 0.01)); scene.add(rb(4.8, 0.3, 0.2, trim, -8.5, 9.2, -6.4, 0.01));
  for (let i = 0; i < 2; i++) scene.add(rb(1.4, 5.2, 0.25, c3Prop('#3a6a5a', { rough: 0.5 }), -8.5 + (i ? 3.4 : -3.4), 9.2, -6.6, 0.03));
  const lant = new THREE.Group(); lant.add(rb(0.9, 1.3, 0.9, c3Prop('#2a2a2a', { rough: 0.4, metal: 0.5 }), 0, 0, 0, 0.02)); lant.add(c3Mesh(new THREE.SphereGeometry(0.34, 12, 10), c3Flat('#fff0c0', { glow: '#ffc060' })));
  lant.position.set(-1.6, 10.8, -6.3); scene.add(lant);
  const lampL = new THREE.PointLight('#ffc070', 0.7, 14, 1.6); lampL.position.set(-1.6, 10.6, -5); lampL.layers.enableAll(); scene.add(lampL);
  scene.add(rb(36, 1.0, 1.0, trim, 0, 17.2, 6.4, 0.04)); scene.add(rb(1.0, 1.0, 14, trim, 2.4, 17.2, -0.3, 0.04));
  for (const x of [-15, 15]) scene.add(rb(0.8, 16.6, 0.8, trim, x, 8.3, 6.4, 0.04));
  scene.add(rb(30, 0.3, 0.3, trim, 0, 4.4, 6.6, 0.02));
  for (let i = 0; i < 27; i++) scene.add(rb(0.22, 3.2, 0.22, trim, -14.5 + i * 1.12, 2.8, 6.6, 0.015));
  // a hanging fern, a wind chime, potted flowers, a doormat with the dog, a side table with the lemonade
  const fern = new THREE.Group(); fern.add(cyl(0.9, 0.7, 1.0, c3Prop('#b0603a', { rough: 0.6 }), 0, 0, 0, 0.03, 14));
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, lf = c3Mesh(new THREE.SphereGeometry(0.5, 10, 8), c3Prop(i % 3 ? '#4a8a3a' : '#3a7030', { rough: 0.6 }), 0.02); lf.position.set(Math.cos(a) * 0.9, -0.3 - (i % 4) * 0.35, Math.sin(a) * 0.9); lf.scale.set(0.5, 1.6, 0.4); lf.rotation.z = Math.cos(a) * 0.6; fern.add(lf); }
  for (const sx of [-0.7, 0.7]) fern.add(cyl(0.02, 0.02, 2.4, c3Prop('#3a2a20'), sx, 1.6, 0, 0, 4));
  fern.position.set(6.5, 13.0, 3.5); scene.add(fern);
  const chime = new THREE.Group(); chime.add(cyl(0.6, 0.6, 0.1, wood, 0, 0, 0, 0.01, 12));
  for (let i = 0; i < 5; i++) chime.add(cyl(0.07, 0.07, 1.2 + i * 0.25, c3Chrome(), Math.cos(i * 1.26) * 0.42, -0.8 - i * 0.12, Math.sin(i * 1.26) * 0.42, 0.01, 8));
  chime.add(cyl(0.015, 0.015, 1.4, c3Prop('#3a2a20'), 0, 0.75, 0, 0, 4)); chime.position.set(10.5, 15.0, 4.5); scene.add(chime);
  for (const [x, z, c] of [[-12, -4.5, '#c8321e'], [-4.2, -5.2, '#f2a0c0'], [12.5, 4.6, '#f2d040']]) { scene.add(cyl(1.0, 0.8, 1.6, c3Prop('#b0603a', { rough: 0.6 }), x, 2.0, z, 0.03, 14));
    for (let i = 0; i < 7; i++) { const m = c3Mesh(new THREE.SphereGeometry(0.55, 10, 8), c3Prop(i % 2 ? c : '#4a8a3a', { rough: 0.6 }), 0.02); m.position.set(x + Math.cos(i) * 0.6, 3.3 + (i % 3) * 0.3, z + Math.sin(i) * 0.6); scene.add(m); } }
  const focus = new THREE.Group(); scene.add(focus);
  const rocker = new THREE.Group(); rocker.position.set(-1.0, 1.2, 0);
  rocker.add(rb(3.6, 0.35, 3.0, wood, 0, 3.4, 0, 0.03)); rocker.add(rb(3.6, 5.2, 0.35, wood, 0, 6.0, -1.4, 0.03));
  for (let i = 0; i < 4; i++) rocker.add(rb(0.25, 4.4, 0.2, c3Prop('#a06a3a'), -1.2 + i * 0.8, 6.0, -1.2, 0.015));
  for (const sx of [-1.7, 1.7]) { rocker.add(rb(0.3, 3.2, 0.3, wood, sx, 1.6, 1.1, 0.02)); rocker.add(rb(0.3, 3.2, 0.3, wood, sx, 1.6, -1.1, 0.02));
    rocker.add(rb(0.35, 0.3, 3.0, wood, sx, 4.6, 0.1, 0.02));
    const run = c3Mesh(new THREE.TorusGeometry(4.0, 0.16, 6, 30, 1.0), wood, 0.02); run.rotation.set(0, Math.PI / 2, -Math.PI / 2 - 0.5); run.position.set(sx, 4.0, 0); rocker.add(run); }
  rocker.add(rb(3.2, 0.3, 2.6, c3Prop('#c8321e', { rough: 0.8 }), 0, 3.7, 0.1, 0.02));   // a red cushion
  focus.add(rocker);
  const table = new THREE.Group(); table.position.set(4.6, 1.2, 0.6);
  table.add(cyl(1.3, 1.3, 0.25, trim, 0, 3.4, 0, 0.03, 24)); table.add(cyl(0.2, 0.3, 3.3, trim, 0, 1.65, 0, 0.02, 10));
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#fff6c8', transparent: true, opacity: 0.55, roughness: 0.1 });
  const pitcher = c3Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.6, 18), glassM, 0.02); pitcher.position.set(-0.3, 4.35, 0); table.add(pitcher);
  table.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.1, 18), c3Prop('#ffe25a', { rough: 0.2, emissive: '#ffd040', ei: 0.15 }), 0), -0.3, 4.1, 0));
  for (const [lx, lz] of [[0.6, 0.3], [0.45, -0.4]]) table.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.28, 10, 8), c3Prop('#f2e040'), 0.015), lx, 3.75, lz));
  focus.add(table);
  const dog = new THREE.Group(); dog.position.set(-6.5, 1.2, 2.6);
  dog.add(rb(5, 0.1, 3, c3Prop('#c8321e', { rough: 0.8 }), 0, 0.05, 0, 0.02));
  const fur = c3Prop('#d8a060', { rough: 0.7 }); dog.add(c3Put(c3Mesh(new THREE.SphereGeometry(1.2, 16, 12), fur, 0.03), 0, 0.8, 0, 0, 0, 0, [1.4, 0.7, 1]));
  dog.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.7, 14, 10), fur, 0.03), 1.6, 0.9, 0.4)); dog.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.35, 10, 8), c3Prop('#8a5a32'), 0.02), 1.6, 1.5, 0.1, 0, 0, 0, [0.6, 1, 0.5]));
  focus.add(dog);
  const ron = stdPerson(stdOldRon(), -1.0, 1.2 + 3.85 * STD_K * 0.92, 1.6);
  focus.add(ron.g);
  const lem = new THREE.Group(); lem.add(c3Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 16), c3Prop('#ffe25a', { rough: 0.15, emissive: '#ffd040', ei: 0.2 }), 0.02));
  lem.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), c3Prop('#e8321e'), 0), 0.12, 0.4, 0)); stdHold(ron, lem, 0.08);
  const doc = stdContract(); doc.scale.setScalar(0.9); stdHold(ron, doc, 0.09); doc.visible = false;
  c3Layer(focus, C3.L_FOCUS);
  // at the lens, out of focus: a second hanging fern top-left and the railing's corner post (NEAR layer)
  const nearG = new THREE.Group(); const fern2 = fern.clone(); fern2.position.set(-5.2, 15.0, 13.5); nearG.add(fern2);
  nearG.add(rb(0.9, 12, 0.9, trim, 6.6, 2, 14, 0.04)); scene.add(nearG); c3Layer(nearG, C3.L_NEAR);
  c3Env(scene, { top: '#ffd8b0', mid: '#c07050' }); c3Shadows(scene, key, 22);
  return Object.assign(s, { ron, rocker, lem, doc, chime });
}
function stdPorchPose(s, t, o) {
  const rock = Math.sin(t * 1.6) * 0.06;   // the chair rocks slowly; he rocks with it; the chime sways
  s.rocker.rotation.x = rock; s.ron.g.position.z = 1.6 + rock * 2.4; s.ron.g.position.y = 1.2 + 3.85 * STD_K * 0.92 + Math.abs(rock) * 0.5;
  s.chime.rotation.z = Math.sin(t * 2.3) * 0.08;
  c3PersonPose(s.ron, s.cam, t, Object.assign({ foot: { legL: [1.1, -2.6], legR: [-1.1, -2.6] } }, o));
}
// framing measured on the refs' close-ups: his head ~0.32 of the frame width in s26, 0.45-0.5 in s27, face to paper in s28
SHOT_FN['s26'] = (t, u, lt) => {
  const s = STD.porch ||= stdBuildPorch();
  s.doc.visible = false; s.lem.visible = true; s.lem.position.set(1.65, 1.2, 0.08);
  c3SetCam(s.cam, stdCam([[0, [3.6, 7.6, 19.5], [0.3, 8.9, 1.6], 50], [1.18, [2.4, 8.0, 17.6], [0.0, 9.0, 1.6], 50]], lt, 's26', { orbit: 0.1 }));
  stdPorchPose(s, t, { expr: c3FaceAt([[0, 'neutral'], [stdW('weird', 1, 39.5), 'smile']], t, 'oldron'), gaze: [0.2, 0], hand: { armL: [1.65, 0.9], armR: [-1.4, 0.7] } });
  stdRender(s, { bg: '#c87a50', bgBlur: stdRack(lt, 's26', 2.0, 3.4), nearBlur: 11, bloom: 0.34 });
};
SHOT_FN['s27'] = (t, u, lt) => {
  const s = STD.porch ||= stdBuildPorch();
  const say = stdW('say', 1, 40.35), regret = stdW('regret', 1, 40.95), not = stdW('not', 3, 41.45);   // 3rd 'not' ("not paying", "not on the two kids" come first)
  s.doc.visible = false; s.lem.visible = true;
  // he lifts the glass for a sip on "regret", lowers it, and smirks on "not one bit"
  const sip = c3Hold([[0, 0], [regret - 0.05, 1], [not - 0.12, 0]], t, 6 / FPS);
  const hand = [lerp(1.65, 0.55, sip), lerp(0.9, 2.55, sip)]; s.lem.position.set(hand[0], hand[1] + 0.3, 0.08); s.lem.rotation.z = sip * 0.5;
  c3SetCam(s.cam, stdCam([[0, [2.6, 8.4, 15.6], [-0.2, 9.4, 1.6], 50], [2.26, [1.2, 8.8, 14.0], [-0.5, 9.4, 1.6], 50]], lt, 's27', { orbit: -0.08 }));
  stdPorchPose(s, t, { expr: c3FaceAt([[0, 'neutral'], [say, 'smile'], [regret, 'closed'], [not, 'smug']], t, 'oldron'), gaze: [0.3, 0], head: [lerp(0, 0.08, sip), 0, 0],
    hand: { armL: hand, armR: [-1.4, 0.7] } });
  stdRender(s, { bg: '#c87a50', bgBlur: stdRack(lt, 's27', 3.2, 4.4), nearBlur: 12, bloom: 0.34 });
};
SHOT_FN['s28'] = (t, u, lt) => {
  const s = STD.porch ||= stdBuildPorch();
  const paper = stdW('paper', 4, 43.93);   // 4th 'paper': "a paper you signed"
  // the contract held up at his chest beside his face (never over it); the camera slides from his face to the paper
  s.lem.visible = false; s.doc.visible = true; s.doc.position.set(2.15, 2.35, 0.09); s.doc.rotation.z = -0.08;
  c3SetCam(s.cam, stdCam([[0, [0.4, 9.6, 14.0], [-0.8, 10.0, 1.6], 50], [1.2, [1.2, 9.0, 12.0], [0.4, 9.3, 1.6], 50], [2.42, [1.9, 8.8, 10.4], [1.4, 8.9, 1.6], 50]], lt, 's28', { creep: 0.6 }));
  stdPorchPose(s, t, { expr: c3FaceAt([[0, 'smile'], [paper, 'relieved']], t, 'oldron'), gaze: [0.7, 0.2], head: [-0.05, 0, 0],
    hand: { armL: [1.5, 1.35], armR: [-1.3, 0.7] } });
  stdRender(s, { bg: '#c87a50', bgBlur: stdRack(lt, 's28', 3.0, 4.6), nearBlur: 12, bloom: 0.34 });
};

// =====================================================================
//  s29 — "In April 1976,": push into the paper; it ends on the APRIL 1976 calendar page (loops to s01)
// =====================================================================
function stdBuildLoop() {
  const s = stdScene(46), scene = s.scene;
  const key = lights(scene, { keyP: [3, 10, 12], keyI: 1.0, key: '#ffe0b8' });
  stdWallRoom(scene);
  stdWallCal(scene, stdTexYear(1976));
  // the contract in front of the calendar, which slides away as the camera pushes through
  const doc = pl(5.2, 7.0, c3Prop('#ffffff', { map: texContract(), rough: 0.7, side: THREE.DoubleSide }), 0, 5.0, 3.6); scene.add(doc);
  const nearG = new THREE.Group(); const lampN = c3Mesh(new THREE.ConeGeometry(1.6, 1.4, 28, 1, true), c3Prop('#e8781e', { rough: 0.35, side: THREE.DoubleSide }), 0.03); lampN.position.set(2.8, 8.2, 7.0); nearG.add(lampN);
  scene.add(nearG); c3Layer(nearG, C3.L_NEAR);
  c3Env(scene, { top: '#ffe2b8', mid: '#b07048' }); c3Shadows(scene, key, 10);
  return Object.assign(s, { doc });
}
SHOT_FN['s29'] = (t, u, lt) => {
  const s = STD.loop ||= stdBuildLoop();
  const april = stdW('april', 2, 44.99);
  // the paper drops away on "April" and the camera lands on the s01 framing: the page nearly filling the frame
  const k = seg(t, april - 0.1, april + 0.4);
  s.doc.position.y = 5.0 - 10 * EZ.i2(k); s.doc.rotation.x = -0.6 * EZ.i2(k);
  const c = c3CamAt([[0, [0.6, 5.6, 11.5], [0.1, 5.2, -0.15], 44], [0.8, [0.1, 5.1, 8.0], [0.0, 5.05, -0.15], 41], [1.25, [-0.2, 4.9, 6.25], [0, 5.0, -0.15], 40]], lt);
  c3SetCam(s.cam, c);
  stdRender(s, { bgBlur: stdRack(lt, 's29', 2.4, 0.4), nearBlur: 10, bloom: 0.28 });
};
