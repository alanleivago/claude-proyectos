// =====================================================================
//  SET forest — Oslo from the fjord and the Nordmarka spruce forest of the Future Library: s18 s19 s20 s21 s22 s23 s25 s33 s34.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed fst.
//  One world, built once. The forest is around the origin: a clearing where the 1,000 trees are planted (a grid of
//  120 saplings, 9 apart, x -49.5..49.5, z -81..0, so the grown trees never touch), the ceremony spot in front of it
//  (z 14) and the hero tree (z 20). Big spruces and birches ring it; green hills run south to Oslo, which sits around
//  z 600-720 on the fjord (s18). Every tree's growth is a pure function of the shot (fstGrow), so nothing pops.
//  People are c3Person billboards at FST_K x; a standing person's root sits at FST_FOOT.
// =====================================================================
const FST = {};
const FST_K = 1.35, FST_FOOT = 2.55 * FST_K;
const fstW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const fstV = (x, y, z) => new THREE.Vector3(x, y, z);
const fstSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function fstCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = fstSpan(id), dur = b - a;
  const P = fstV(...c.p), L = fstV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(fstV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const fstRack = (lt, id, a, b) => { const [t0, t1] = fstSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function fstFg(s, list, K, id, lt, o = {}) {
  const c = FST.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 3000);
  c3SetCam(c, fstCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = fstV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(fstV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const fstRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#a8d0ec', bgBlur: 2.4, nearBlur: 10, glow: 0.6, glowBlur: 16, bloom: 0.2 }, o));

// ---- textures
function fstTexGround() {   // forest floor: moss, needles, little leaves (tinted per season by the material colour)
  const t = tex((x, w, h) => { x.fillStyle = '#7aa64a'; x.fillRect(0, 0, w, h); const R = RNG('floor');
    for (let i = 0; i < 4200; i++) { const l = R.r(-6, 6); x.fillStyle = `hsla(${R.r(80, 100)},${42 + R.r(-6, 6)}%,${44 + l}%,0.45)`; x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(1.5, 4), 0, TAU); x.fill(); }   // fine, low-contrast speckle: no tiling pattern
    x.strokeStyle = 'rgba(120,80,40,0.2)'; x.lineWidth = 1.5; for (let i = 0; i < 500; i++) { const a = R.r(0, w), b = R.r(0, h), r = R.r(0, TAU); x.beginPath(); x.moveTo(a, b); x.lineTo(a + Math.cos(r) * 9, b + Math.sin(r) * 9); x.stroke(); }
  }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(160, 160); return t;
}
function fstTexWater() {
  const t = tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); const R = RNG('fjordT'); x.strokeStyle = 'rgba(200,228,244,0.9)'; x.lineCap = 'round';
    for (let i = 0; i < 80; i++) { const y = R.r(0, h), xx = R.r(0, w), l = R.r(20, 60); x.lineWidth = R.r(2, 4); x.beginPath(); x.moveTo(xx, y); x.quadraticCurveTo(xx + l / 2, y - 4, xx + l, y); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 15); return t;
}
function fstTexSky(mode) {   // Ricks sky (kit c3SkyTex): gradient + flat-bottomed cumulus with lavender shading; mode 'day' | 'golden'
  return mode === 'day' ? c3SkyTex({ mood: 'day', seed: 11, band: [0.06, 0.38], clouds: 80, scale: 0.6, midAt: 0.44, sun: [0.62, 0.3, 26] })
    : c3SkyTex({ mood: 'golden', seed: 12, band: [0.14, 0.46], clouds: 60, scale: 0.6, midAt: 0.42, sun: [0.62, 0.47, 40] });
}
function fstTexFacade(c, seed) {   // a daytime Oslo facade: coloured render, rows of white-framed windows
  const t = tex((x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); const R = RNG('fac', seed);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) { const px = i * w / 6 + 8, py = j * h / 8 + 8, ww = w / 6 - 16, hh = h / 8 - 18;
      x.fillStyle = '#f6f2ea'; x.fillRect(px - 3, py - 3, ww + 6, hh + 6); x.fillStyle = R.f() < 0.2 ? '#ffe8b0' : '#5a7898'; x.fillRect(px, py, ww, hh);
      x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(px, py, ww * 0.35, hh); } }, 256, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function fstTexGlass() {   // the library's glass band: blue-green panes with white mullions and reflections
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#8ad0e0'); g.addColorStop(0.5, '#4a90b0'); g.addColorStop(1, '#bfe8f0'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f4f6f8'; for (let i = 0; i <= 16; i++) x.fillRect(i * w / 16 - 2, 0, 4, h); for (let j = 0; j <= 4; j++) x.fillRect(0, j * h / 4 - 2, w, 4);
    x.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 6; i++) { x.save(); x.translate(i * w / 6 + 40, 0); x.transform(1, 0, -0.5, 1, 0, 0); x.fillRect(0, 0, 18, h); x.restore(); } }, 1024, 256);
}
function fstTexBark(birch) {
  return tex((x, w, h) => { x.fillStyle = birch ? '#f2efe6' : '#7a5232'; x.fillRect(0, 0, w, h); const R = RNG('bark', birch ? 1 : 0);
    for (let i = 0; i < (birch ? 40 : 60); i++) { x.fillStyle = birch ? '#2a2420' : 'rgba(40,24,12,0.5)'; const y = R.r(0, h);
      if (birch) x.fillRect(R.r(0, w * 0.8), y, R.r(8, 30), R.r(2, 6)); else x.fillRect(R.r(0, w), 0, R.r(1, 3), h); } }, 128, 256);
}
// the carved sign: a thick pale plank, letters cut into it (dark groove + light lower lip), moss in the corners
function fstTexSign() {
  return tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d8a868'); g.addColorStop(1, '#b8844a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('signw'); x.strokeStyle = 'rgba(110,64,26,0.35)'; x.lineWidth = 3;
    for (let i = 0; i < 26; i++) { const y = R.r(0, h); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(12), w * 2 / 3, y + R.n(12), w, y + R.n(8)); x.stroke(); }
    for (const [cx, cy] of [[30, h - 30], [w - 40, 34], [w - 20, h - 24]]) for (let k = 0; k < 18; k++) { const R2 = RNG('moss', cx, k); x.fillStyle = `hsla(${R2.r(85, 110)},55%,${R2.r(30, 44)}%,0.9)`; x.beginPath(); x.arc(cx + R2.n(26), cy + R2.n(16), R2.r(5, 12), 0, TAU); x.fill(); }
    const carve = (txt, y, size, font) => { x.font = `900 ${size}px ${font}`; const tw = x.measureText(txt).width; if (tw > w * 0.9) { size *= w * 0.9 / tw; x.font = `900 ${size}px ${font}`; } x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = 'rgba(255,236,200,0.75)'; x.fillText(txt, w / 2 + 2, y + 4); x.fillStyle = '#4a2a12'; x.fillText(txt, w / 2, y); };
    carve('FUTURE LIBRARY', h * 0.32, h * 0.25, 'Georgia, serif');
    carve('2014 – 2114', h * 0.62, h * 0.17, 'Georgia, serif');
    carve('FRAMTIDSBIBLIOTEKET', h * 0.84, h * 0.08, 'Georgia, serif');
  }, 1024, 512);
}
// the planting counter (s20): a little painted board with a rolling odometer; redrawn every frame from the count
function fstCounterDraw(s, n) {
  const x = s.cntCv.getContext('2d'), w = s.cntCv.width, h = s.cntCv.height;
  x.fillStyle = '#2e5a32'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2e2b0'; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20);
  inked(x, 'TREES PLANTED', w / 2, h * 0.22, h * 0.13, '#f2e2b0', { stroke: false, maxW: w * 0.8 });
  const dg = String(Math.floor(n)).padStart(4, '0'), cw = w * 0.17;
  for (let i = 0; i < 4; i++) { const cx = w / 2 + (i - 1.5) * cw * 1.08, cy = h * 0.62;
    x.fillStyle = '#fbf6ea'; x.beginPath(); x.roundRect(cx - cw / 2, cy - h * 0.25, cw, h * 0.5, 10); x.fill();
    x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(cx - cw / 2, cy - 2, cw, 4);
    inked(x, dg[i], cx, cy + 4, h * 0.38, i === 0 && n >= 1000 ? '#c8281e' : '#1a1a22', { stroke: false }); }
  s.cntTex.needsUpdate = true;
}
// the year board (s22): a wooden board with a big rolling year
function fstYearDraw(s, y, season) {
  const x = s.yrCv.getContext('2d'), w = s.yrCv.width, h = s.yrCv.height;
  x.fillStyle = '#c89a5e'; x.fillRect(0, 0, w, h); x.strokeStyle = '#6a3e18'; x.lineWidth = 10; x.strokeRect(8, 8, w - 16, h - 16);
  inked(x, 'YEAR', w / 2, h * 0.2, h * 0.12, '#4a2a12', { stroke: false });
  inked(x, String(Math.floor(y)), w / 2, h * 0.55, h * 0.42, '#fbf6ea', { stroke: '#4a2a12', sw: h * 0.05, maxW: w * 0.84 });
  const names = ['WINTER', 'SPRING', 'SUMMER', 'AUTUMN'], cols = ['#3a7ac8', '#3aa05a', '#e8a020', '#c8501e'];
  inked(x, names[season], w / 2, h * 0.86, h * 0.1, cols[season], { stroke: false });
  s.yrTex.needsUpdate = true;
}
function fstTexPages() {   // the giant book's open pages: lines of type, a title and a big 2114
  return tex((x, w, h) => { x.fillStyle = '#fbf3de'; x.fillRect(0, 0, w, h); const R = RNG('pagetxt');
    x.fillStyle = 'rgba(200,170,120,0.35)'; x.fillRect(w / 2 - 6, 0, 12, h);
    inked(x, 'THE FUTURE', w * 0.25, h * 0.1, h * 0.05, '#3a2a1a', { stroke: false, font: 'Georgia, serif', maxW: w * 0.4 });
    inked(x, 'LIBRARY', w * 0.25, h * 0.16, h * 0.05, '#3a2a1a', { stroke: false, font: 'Georgia, serif', maxW: w * 0.4 });
    inked(x, '2114', w * 0.75, h * 0.13, h * 0.08, '#b8862a', { stroke: false, font: 'Georgia, serif' });
    x.fillStyle = 'rgba(60,44,30,0.55)';
    for (const px of [0.06, 0.56]) for (let i = 0; i < 22; i++) x.fillRect(w * px, h * (0.26 + i * 0.032), w * 0.38 * R.r(0.6, 1), 5); }, 1024, 1024);
}
function fstTexCover() {
  return tex((x, w, h) => { x.fillStyle = '#1e5a3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8c060'; x.lineWidth = 10; x.strokeRect(24, 24, w - 48, h - 48);
    x.lineWidth = 3; x.strokeRect(44, 44, w - 88, h - 88); }, 256, 512);
}
function fstTexManuscript() {   // the sealed manuscript's front: cream paper, a typed title block
  return tex((x, w, h) => { x.fillStyle = '#f6eed8'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,44,30,0.6)';
    x.fillRect(w * 0.2, h * 0.18, w * 0.6, 8); x.fillRect(w * 0.3, h * 0.26, w * 0.4, 6); }, 256, 320);
}

// ---- trees: an appealing rounded cartoon spruce (soft skirted tiers, ink outlines) and a round-crowned birch
function fstTierGeo() {   // one spruce tier: a soft rounded skirt (height 1, radius 1)
  return FST.tierGeo ||= new THREE.LatheGeometry([[0.0, 0.02], [0.92, 0.0], [1.0, 0.08], [0.86, 0.22], [0.5, 0.62], [0.16, 0.94], [0.0, 1.0]].map(([r, y]) => new THREE.Vector2(r, y)), 18);
}
function fstSnowGeo() {
  return FST.snowGeo ||= new THREE.LatheGeometry([[0.0, 0.7], [0.4, 0.66], [0.56, 0.62], [0.42, 0.78], [0.18, 0.98], [0.0, 1.04]].map(([r, y]) => new THREE.Vector2(r, y)), 18);
}
const FST_TIERS = [[0.18, 0.95, 0.62], [0.58, 0.76, 0.56], [0.95, 0.56, 0.5], [1.28, 0.36, 0.42]];   // [y0, radius, height]; total height ~1.7
function fstSpruce(s, seed, ink = 0.025) {
  const g = new THREE.Group(), R = RNG('spruce', seed), M = s.needle[R.i(0, s.needle.length - 1)];
  const trunk = c3Mesh(s.trunkGeo, s.barkM, ink); trunk.scale.set(0.09, 0.32, 0.09); trunk.position.y = 0.16; g.add(trunk);
  const tiers = [], snow = [];
  FST_TIERS.forEach(([y0, r, hh], k) => { const m = c3Mesh(fstTierGeo(), M, ink); m.position.y = y0; m.scale.set(r, hh, r); m.rotation.y = R.r(0, TAU); g.add(m); tiers.push(m);
    const sn = new THREE.Mesh(fstSnowGeo(), s.snowM); sn.position.y = y0; sn.scale.set(r, hh, r); g.add(sn); snow.push(sn); });
  return { g, tiers, snow, lean: R.n(0.03) };
}
// growth G scales the tree (height G * 1.7 units); the crown widens slower than it grows tall, so grown neighbours never touch
const fstLat = (G) => 0.8 * Math.pow(Math.max(G, 1e-3), 0.6);
function fstSize(tr, G) { if (G <= 0.001) { tr.g.visible = false; return; } tr.g.visible = true; const L = fstLat(G); tr.g.scale.set(L, G, L); tr.g.rotation.z = tr.lean; }
function fstBirch(s, seed) {
  const g = new THREE.Group(), R = RNG('birch', seed);
  const trunk = c3Mesh(s.trunkGeo, s.birchM, 0.03); trunk.scale.set(0.35, 9, 0.35); trunk.position.y = 4.5; g.add(trunk);
  const crown = new THREE.Group(); crown.position.y = 9.5; g.add(crown); const blobs = [];
  for (let k = 0; k < 5; k++) { const b = c3Mesh(s.sph, s.leafM, 0.04); b.scale.set(R.r(2.2, 3.2), R.r(2.0, 2.8), R.r(2.2, 3.0)); b.position.set(R.n(1.8), R.r(-0.5, 2.4), R.n(1.6)); crown.add(b); blobs.push(b); }
  return { g, crown, blobs };
}

// ---- props: the ceremony chest on its stump, the sealed manuscript, the giant book, sparkles
function fstChest(s) {
  const g = new THREE.Group(), wood = c3Prop('#8a5a2e', { map: texWood(), rough: 0.6 }), brass = c3Prop('#d8b040', { rough: 0.25, metal: 0.8, env: 1.4 });
  g.add(rb(3.2, 1.7, 2.1, wood, 0, 0.85, 0, 0.04));
  for (const x of [-1.3, 1.3]) g.add(rb(0.22, 1.74, 2.16, brass, x, 0.85, 0, 0.02));
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.6), c3Flat('#2a160a')); hole.rotation.x = -Math.PI / 2; hole.position.y = 1.71; g.add(hole);
  const lid = new THREE.Group(); lid.position.set(0, 1.7, -1.05); g.add(lid);   // hinged at the back edge
  lid.add(rb(3.3, 0.4, 2.2, wood, 0, 0.2, 1.1, 0.04));
  const plate = rb(1.1, 0.06, 0.5, brass, 0, 0.42, 1.55, 0.015); lid.add(plate);
  const pt = pl(0.95, 0.4, c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#d8b040'; x.fillRect(0, 0, w, h); inked(x, '2114', w / 2, h / 2, h * 0.7, '#5a3a10', { stroke: false }); }, 256, 112) }), 0, 0.46, 1.55, 0, -Math.PI / 2); lid.add(pt);
  g.lid = lid;
  const stump = c3Mesh(new THREE.CylinderGeometry(2.0, 2.3, 1.6, 22), c3Prop('#7a5232', { map: fstTexBark(false), rough: 0.8 }), 0.04); stump.position.y = -0.8; g.add(stump);
  const rings = new THREE.Mesh(new THREE.CircleGeometry(2.0, 26), c3Toon('#d8b07a')); rings.rotation.x = -Math.PI / 2; rings.position.y = 0.005; g.add(rings);
  return g;
}
function fstManuscript() {
  const g = new THREE.Group(), paper = c3Prop('#f6eed8', { rough: 0.8 });
  g.add(rb(1.1, 1.45, 0.28, paper, 0, 0, 0, 0.02));
  g.add(pl(1.0, 1.32, c3Flat('#ffffff', { map: fstTexManuscript() }), 0, 0, 0.145));
  const str = c3Toon('#c8501e'); g.add(rb(1.14, 0.06, 0.32, str, 0, 0.1, 0, 0)); g.add(rb(0.06, 1.49, 0.32, str, 0.1, 0, 0, 0));
  const seal = c3Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 18), c3Prop('#b81e1e', { rough: 0.35, env: 1.2 }), 0.012); seal.rotation.x = Math.PI / 2; seal.position.set(0.1, 0.1, 0.18); g.add(seal);
  return g;
}
function fstBook() {   // a giant hardcover standing open (a V facing the camera), pages fanned; base on y 0, ~12 tall
  const g = new THREE.Group(), cover = c3Prop('#1e5a3a', { map: fstTexCover(), rough: 0.5 }), page = c3Prop('#fbf3de', { rough: 0.9 });
  const halves = [];
  for (const sd of [-1, 1]) { const h = new THREE.Group(); h.rotation.y = sd * -0.55; g.add(h);
    h.add(rb(6.2, 12, 0.35, cover, sd * 3.1, 6, -0.2, 0.06));
    h.add(rb(5.8, 11.4, 0.9, page, sd * 2.95, 6, 0.4, 0.04)); halves.push(h); }
  const spine = c3Mesh(new THREE.CylinderGeometry(0.5, 0.5, 12, 16), cover, 0.05); spine.position.set(0, 6, -0.4); g.add(spine);
  // the open spread, drawn as one texture across both page blocks
  for (const [k, h] of halves.entries()) { const p = pl(5.6, 11.0, c3Flat('#ffffff', { map: (FST.pagesTex ||= fstTexPages()) }), (k ? 1 : -1) * 2.95, 6, 0.86); p.material = p.material.clone();
    const m = p.material.map.clone(); m.needsUpdate = true; m.offset.set(k ? 0.5 : 0, 0); m.repeat.set(0.5, 1); p.material.map = m; h.add(p); }
  g.pages = [...Array(5)].map((_, i) => { const p = c3Mesh(c3RBox(5.6, 11.0, 0.05, 0.02), page, 0.015); const piv = new THREE.Group(); piv.position.set(0, 6, 0.4); p.position.x = 2.8; piv.add(p); g.add(piv); return piv; });
  return g;
}

// ---- the world
function fstBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 4000), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff4e4', ambI: 0.5, sky: '#d8ecff', ground: '#6a8a3a', key: '#fff2d8', keyI: 1.15, keyP: [-18, 30, 24], rim: '#ffd8b0', rimI: 0.5, rimP: [14, 16, -26] });
  s.lit = scene.children.filter((c) => c.isLight);
  s.sph = new THREE.SphereGeometry(1, 22, 16); s.trunkGeo = new THREE.CylinderGeometry(1, 1.15, 1, 12);
  s.skyTex = { day: fstTexSky('day'), golden: fstTexSky('golden') };
  s.sky = new THREE.Mesh(new THREE.SphereGeometry(2600, 48, 24), c3Flat('#ffffff', { map: s.skyTex.day, side: THREE.BackSide })); scene.add(s.sky);
  // materials (shared, tinted per season)
  s.needle = ['#2e6a3a', '#3a7a40', '#28603a'].map((c) => c3Toon(c)); s.needleBase = ['#2e6a3a', '#3a7a40', '#28603a'];
  s.barkM = c3Prop('#ffffff', { map: fstTexBark(false), rough: 0.8 }); s.birchM = c3Prop('#ffffff', { map: fstTexBark(true), rough: 0.7 });
  s.leafM = c3Toon('#6ab84a'); s.snowM = c3Toon('#ffffff'); s.snowM.transparent = true; s.snowM.opacity = 0;
  s.groundM = c3Prop('#ffffff', { map: fstTexGround(), rough: 0.95 });
  const ground = pl(3200, 3200, s.groundM, 0, 0, -400, 0, -Math.PI / 2); scene.add(ground);
  // the fjord in front of the city (south, +z), the city and the library
  s.fjordM = c3Prop('#2a6a98', { map: fstTexWater(), rough: 0.35, metal: 0.0, env: 0.4 });
  scene.add(pl(3200, 900, s.fjordM, 0, 0.08, 1180, 0, -Math.PI / 2));
  s.city = new THREE.Group(); scene.add(s.city);
  // city floor (s18 aerial): asphalt streets on a grid, pale sidewalks, little parks and tree dots instead of the bare pale meadow
  const cityTex = c3Tex((x, w, h) => { x.fillStyle = '#8a8a86'; x.fillRect(0, 0, w, h); const R = RNG('cityfloor'), n = 8, m = 4;
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const bx = i * w / n + 7, by = j * h / m + 7, bw = w / n - 14, bh = h / m - 14;
      x.fillStyle = '#d8d0c0'; x.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
      const park = R.f() < 0.22; x.fillStyle = park ? '#5aa04a' : ['#c8b49a', '#bca88e', '#cfc0a8'][(i + j) % 3]; x.fillRect(bx, by, bw, bh);
      if (park) for (let k = 0; k < 7; k++) { x.fillStyle = '#3e7e36'; x.beginPath(); x.arc(bx + R.r(6, bw - 6), by + R.r(6, bh - 6), R.r(3, 6), 0, TAU); x.fill(); } }
    x.strokeStyle = '#f2e6b0'; x.setLineDash([6, 6]); x.lineWidth = 1.5;
    for (let i = 1; i < n; i++) { x.beginPath(); x.moveTo(i * w / n, 0); x.lineTo(i * w / n, h); x.stroke(); }
    for (let j = 1; j < m; j++) { x.beginPath(); x.moveTo(0, j * h / m); x.lineTo(w, j * h / m); x.stroke(); } }, 1024, 512);
  s.city.add(pl(360, 180, c3Prop('#ffffff', { map: cityTex, rough: 0.9 }), 0, 0.05, 625, 0, -Math.PI / 2));
  for (let i = 0; i < 40; i++) { const R = RNG('ctree', i), tr = c3Tree(R.r(1.6, 2.4), ['#4e9a3a', '#5aa83a', '#3e8a34'][i % 3], i); tr.position.set(R.r(-170, 170), 0, R.r(548, 700)); s.city.add(tr); }
  const FC =['#e8b88a', '#d87a5a', '#f2d8a0', '#9ab8d0', '#c8d8b8', '#f0e6d6', '#d8a0a0', '#7cc0c0'];
  for (let i = 0; i < 46; i++) { const R = RNG('blk', i), w = R.r(12, 20), h = R.r(12, 30), x = R.r(-160, 160), z = R.r(560, 680);
    if (Math.abs(x) < 40 && z > 640) continue;   // keep the library's plaza clear
    const b = c3Building({ w, h, d: R.r(10, 16), floors: Math.max(2, Math.round(h / 6)), cols: Math.max(3, Math.round(w / 4.5)), wall: ['plaster', 'siding', 'brick', 'plaster'][i % 4], color: FC[i % FC.length],
      roof: R.f() < 0.65 ? 'gable' : 'flat', roofColor: R.f() < 0.5 ? '#3a4a5a' : '#8a3a2a', shutters: R.f() < 0.4 ? '#2a5a7a' : null, lit: 0.12, chimney: R.f() < 0.5, seed: 100 + i, ink: 0.06 });
    b.position.set(x, 0, z); b.rotation.y = R.f() < 0.5 ? 0 : Math.PI; c3Shade(b, { dark: 0.25 }); s.city.add(b); }
  // the library on the waterfront: the same warm-brick hall as in s01 (kit c3Building), banners, roof garden, flags
  const lib = new THREE.Group(); lib.position.set(0, 0, 680); s.city.add(lib);
  lib.add(c3Building({ w: 46, h: 24, d: 22, floors: 4, cols: 9, wall: 'brick', color: '#c8704a', trim: '#f6efe2', roof: 'flat', roofColor: '#5a6a72', sign: 'BIBLIOTEK', signColor: '#1f3a5f', signW: 16, planters: true, lit: 0.45, doorCol: 4, seed: 41, ink: 0.06 }));
  for (let i = 0; i < 6; i++) { const tr = c3Tree(1.5, '#5aa83a', i); tr.position.set(-15 + i * 6, 24.6, -4 + (i % 2) * 5); lib.add(tr); }
  c3Shade(lib, { dark: 0.3 });
  // the opera roof beside it: white slabs sloping into the water
  for (let k = 0; k < 3; k++) { const p = rb(30, 1.2, 26, c3Prop('#f8f8f4', { rough: 0.35 }), 48 + k * 6, 5 + k * 4, 700 - k * 8, 0.08); p.rotation.x = -0.28; s.city.add(p); }
  for (let i = 0; i < 4; i++) { const R = RNG('boat', i), b = new THREE.Group(); b.position.set(R.r(-120, 120), 0, R.r(760, 860)); b.rotation.y = R.r(0, 3); s.city.add(b);
    b.add(rb(8, 1.6, 2.8, c3Toon(i % 2 ? '#ffffff' : '#d8322a'), 0, 0.8, 0, 0.05)); b.add(rb(3, 2, 2, c3Toon('#f6f2ea'), -1, 2.6, 0, 0.04)); }
  // hills between the city and the forest, and far mountains: big soft green humps sprinkled with tiny cone trees
  const hillM = [c3Toon('#4a8a3e'), c3Toon('#3e7a3a'), c3Toon('#5a9a44')], ico = new THREE.IcosahedronGeometry(1, 3);
  s.hills = new THREE.Group(); scene.add(s.hills);
  const hillList = [];
  for (let i = 0; i < 16; i++) { const R = RNG('hill', i), x = R.r(-420, 420), z = R.r(150, 520), sc = R.r(60, 140), h = R.r(18, 46);
    const m = c3Mesh(ico, hillM[i % 3], 0); m.scale.set(sc, h, sc * 0.8); m.position.set(x, -h * 0.25, z); s.hills.add(m); hillList.push([x, z, sc, h]); }
  for (let i = 0; i < 10; i++) { const R = RNG('mtn', i), x = -900 + i * 200 + R.n(60), z = R.r(-900, -700), sc = R.r(160, 260), h = R.r(90, 170);
    const m = c3Mesh(ico, c3Toon(i % 2 ? '#5a7a8a' : '#6a8a9a'), 0); m.scale.set(sc, h, sc * 0.7); m.position.set(x, -h * 0.2, z); s.hills.add(m); hillList.push([x, z, sc, h]); }
  // distant forest: thousands of little cone trees (one InstancedMesh), seeded once
  const coneN = 2600, cone = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2.6, 7), c3Toon('#2e6a3a'), coneN), dm = new THREE.Object3D();
  for (let i = 0; i < coneN; i++) { const R = RNG('cone', i); let x, z, y = 0;
    if (i < 1600) { x = R.r(-900, 900); z = R.r(-700, 140); if (Math.abs(x) < 120 && z > -150) { x = Math.sign(x || 1) * R.r(120, 900); } }
    else { const hl = hillList[R.i(0, 15)]; const a = R.r(0, TAU), r = Math.sqrt(R.f()) * 0.8; x = hl[0] + Math.cos(a) * hl[2] * r; z = hl[1] + Math.sin(a) * hl[2] * 0.8 * r; y = Math.max(0, hl[3] * 0.75 * Math.sqrt(Math.max(0, 1 - r * r)) - hl[3] * 0.25); }
    const sc = R.r(4, 8); dm.position.set(x, y + sc * 1.2, z); dm.scale.set(sc * 0.5, sc, sc * 0.5); dm.updateMatrix(); cone.setMatrixAt(i, dm.matrix); }
  scene.add(cone); s.cones = cone;
  // the ring of big spruces and birches around the clearing (outside |x| 58 or behind z -95), seeded once
  s.bigTrees = []; s.birches = [];
  for (let i = 0; i < 70; i++) { const R = RNG('big', i); let x, z;
    if (i < 46) { x = (i % 2 ? 1 : -1) * R.r(62, 130); z = R.r(-140, 60); } else { x = R.r(-110, 110); z = R.r(-180, -98); }
    const tr = fstSpruce(s, 'b' + i, 0.06); tr.g.position.set(x, 0, z); scene.add(tr.g); fstSize(tr, R.r(16, 26)); s.bigTrees.push(tr); }
  for (let i = 0; i < 22; i++) { const R = RNG('birchp', i), x = (i % 2 ? 1 : -1) * R.r(64, 110), z = R.r(-120, 50);
    const b = fstBirch(s, i); b.g.position.set(x, 0, z); b.g.scale.setScalar(R.r(1.6, 2.2)); scene.add(b.g); s.birches.push(b); }
  // rocks, ferns, mushrooms on the floor (kept off the planting grid lanes and the ceremony spot)
  const rockM = [c3Toon('#8a8478'), c3Toon('#76716a')], icoR = new THREE.IcosahedronGeometry(1, 1), mossM = c3Toon('#5a9a3a');
  for (let i = 0; i < 26; i++) { const R = RNG('rock', i), x = (i % 2 ? 1 : -1) * R.r(60, 95), z = R.r(-100, 40), sc = R.r(1.5, 4);
    const r = c3Mesh(icoR, rockM[i % 2], 0.04); r.scale.set(sc * 1.3, sc * 0.7, sc); r.position.set(x, sc * 0.25, z); r.rotation.y = R.r(0, 3); scene.add(r);
    const ms = c3Mesh(s.sph, mossM, 0.03); ms.scale.set(sc * 1.1, sc * 0.25, sc * 0.8); ms.position.set(x, sc * 0.62, z); scene.add(ms); }
  s.fernGeo = new THREE.ConeGeometry(0.35, 2.4, 6);
  const fern = (seed) => { const g = new THREE.Group(), R = RNG('fern', seed); for (let k = 0; k < 9; k++) { const f = c3Mesh(s.fernGeo, c3Toon(k % 2 ? '#4a9a3a' : '#6ab04a'), 0.015); f.scale.set(1, 1, 0.25); const a = k / 9 * TAU + R.n(0.2);
      f.position.set(Math.cos(a) * 0.9, 0.7, Math.sin(a) * 0.9); f.rotation.set(Math.sin(a) * 0.9, -a, -Math.cos(a) * 0.9); g.add(f); } return g; };
  for (let i = 0; i < 40; i++) { const R = RNG('fernp', i), f = fern(i); const x = R.r(-60, 60), z = R.r(24, 46); if (Math.abs(x) < 9) continue; f.position.set(x, 0, z); f.scale.setScalar(R.r(1.2, 2)); scene.add(f); }
  // the planting grid: 12 x 10 saplings, 9 apart (each with a little mound of fresh earth)
  s.grid = []; const moundM = c3Toon('#6a4a2a');
  for (let r = 0; r < 10; r++) for (let c = 0; c < 12; c++) { const x = -49.5 + c * 9, z = -r * 9, R = RNG('gridj', r, c);
    const tr = fstSpruce(s, `g${r}_${c}`); tr.g.position.set(x + R.n(0.6), 0, z + R.n(0.6)); scene.add(tr.g);
    const md = c3Mesh(s.sph, moundM, 0.02); md.position.set(tr.g.position.x, 0, tr.g.position.z); scene.add(md);
    tr.mound = md; tr.order = r * 12 + (c % 2 ? 11 - c : c) * 0 + c; tr.row = r; tr.col = c; s.grid.push(tr); }
  // the hero tree (s33-s34), in front of the grid
  s.hero = fstSpruce(s, 'hero', 0.04); s.hero.g.position.set(0, 0, 22); scene.add(s.hero.g);
  // in-world devices: planting counter, carved sign, year board
  s.cntCv = Object.assign(document.createElement('canvas'), { width: 640, height: 400 }); s.cntTex = new THREE.CanvasTexture(s.cntCv); s.cntTex.encoding = THREE.sRGBEncoding;
  s.counter = new THREE.Group(); scene.add(s.counter);
  s.counter.add(rb(7.2, 4.6, 0.4, c3Toon('#6a4428'), 0, 6.0, 0, 0.05)); s.counter.add(pl(6.7, 4.2, c3Flat('#ffffff', { map: s.cntTex }), 0, 6.0, 0.21));
  s.counter.add(rb(0.5, 4.2, 0.5, c3Toon('#6a4428'), 0, 2.1, -0.1, 0.03));
  s.sign = new THREE.Group(); scene.add(s.sign);
  // grassy tufts hide where FOCUS-layer posts meet the ground (an upper hemisphere: nothing of it dips below the ground)
  const tuftGeo = new THREE.SphereGeometry(1, 18, 8, 0, TAU, 0, Math.PI / 2), tuft = (x, z, r) => { const m = c3Mesh(tuftGeo, mossM, 0.03); m.scale.set(r, r * 0.45, r); m.position.set(x, 0, z); return m; };
  const signM = c3Prop('#ffffff', { map: fstTexSign(), rough: 0.75 }), logM = c3Prop('#ffffff', { map: fstTexBark(false), rough: 0.85 });
  s.sign.add(rb(15, 7.4, 1.0, c3Toon('#b8844a'), 0, 8, 0, 0.06)); s.sign.add(pl(14.6, 7.1, signM, 0, 8, 0.51));
  for (const x of [-6.2, 6.2]) { const p = c3Mesh(s.trunkGeo, logM, 0.05); p.scale.set(0.55, 12.5, 0.55); p.position.set(x, 6.25, -0.75); s.sign.add(p); }   // posts never dip below the ground: FOCUS-layer parts under it would show through
  const sm = c3Mesh(s.sph, mossM, 0.03); sm.scale.set(2.6, 0.5, 0.9); sm.position.set(-5.2, 11.75, 0); s.sign.add(sm);
  for (const x of [-6.2, 6.2]) s.sign.add(tuft(x, -0.75, 1.5)); s.counter.add(tuft(0, -0.1, 0.9));
  s.yrCv = Object.assign(document.createElement('canvas'), { width: 640, height: 480 }); s.yrTex = new THREE.CanvasTexture(s.yrCv); s.yrTex.encoding = THREE.sRGBEncoding;
  s.yearB = new THREE.Group(); scene.add(s.yearB);
  s.yearB.add(rb(6.4, 4.9, 0.4, c3Toon('#6a3e18'), 0, 6.6, 0, 0.05)); s.yearB.add(pl(6.0, 4.5, c3Flat('#ffffff', { map: s.yrTex }), 0, 6.6, 0.21));
  s.yearB.add(rb(0.5, 4.6, 0.5, c3Toon('#6a3e18'), 0, 2.3, -0.1, 0.03)); s.yearB.add(tuft(0, -0.1, 0.9));
  // the ceremony: the chest on its stump, lanterns, the writer and the librarian
  s.chest = fstChest(s); s.chest.position.set(1.0, 1.6, 14); scene.add(s.chest);
  s.lanterns = [-7.5, 8.5].map((x) => { const g = new THREE.Group(); g.position.set(x, 0, 12); scene.add(g);
    g.add(c3Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 8), c3Toon('#3a2a1a'), 0.02).translateY(3));
    g.add(rb(1.1, 1.4, 1.1, c3Prop('#2a2a30', { rough: 0.4, metal: 0.6 }), 0, 6.6, 0, 0.03));
    const fl = c3Mesh(s.sph, c3Flat('#ffe08a', { glow: '#ffc040' }), 0); fl.scale.set(0.35, 0.5, 0.35); fl.position.y = 6.6; g.add(fl); g.flame = fl; return g; });
  s.writer = c3Person({ key: 'writer', outfit: 'sweater', hairStyle: 'ginger', fx: ['beard_full'] }); s.writer.g.scale.setScalar(FST_K); scene.add(s.writer.g);
  s.librarian = c3Person({ key: 'librarian', outfit: 'cardigan', hairStyle: 'bun', fx: ['glasses'] }); s.librarian.g.scale.setScalar(FST_K); scene.add(s.librarian.g);
  s.ms = fstManuscript(); s.ms.scale.setScalar(FST_K * 0.9); scene.add(s.ms);
  // the giant book (s34), sparkles, season particles, light shafts, leaf swirl
  s.book = fstBook(); s.book.position.set(0, 0, 22); scene.add(s.book);
  s.sparkTex = tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.25, 'rgba(255,236,170,0.8)'); gr.addColorStop(1, 'rgba(255,220,140,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(w / 2 - 2, 4, 4, h - 8); x.fillRect(4, h / 2 - 2, w - 8, 4); }, 128, 128);
  s.sparks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: s.sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), 120); s.sparks.frustumCulled = false; scene.add(s.sparks);
  s.sparkSeed = [...Array(120)].map((_, i) => { const R = RNG('spk', i); return [R.r(0, TAU), R.r(0.3, 1), R.r(0, 1), R.r(0.6, 1.6), R.r(0, TAU)]; });
  s.parts = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false, transparent: true }), 360); s.parts.frustumCulled = false; scene.add(s.parts);
  s.partSeed = [...Array(360)].map((_, i) => { const R = RNG('part', i); return [R.r(-40, 40), R.r(-30, 40), R.r(0, 1), R.r(0.6, 1.4), R.r(0, TAU), R.r(0, TAU)]; });
  { const c = new THREE.Color('#ffffff'); for (let i = 0; i < 360; i++) s.parts.setColorAt(i, c); }
  s.shafts = [...Array(5)].map((_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,240,190,0)'); gr.addColorStop(0.5, 'rgba(255,240,190,0.55)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      const g2 = x.createLinearGradient(0, 0, 0, h); x.globalCompositeOperation = 'destination-in'; g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g2; x.fillRect(0, 0, w, h); }, 128, 256), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }));
    scene.add(m); return m; });
  // layers: the people, the devices, the chest and the hero subjects are the focus
  [s.writer.g, s.librarian.g, s.ms, s.chest, s.counter, s.sign, s.yearB, s.book, s.sparks, s.hero.g, ...s.lanterns].forEach((o) => c3Layer(o, C3.L_FOCUS));
  // blurred foreground pieces (NEAR layer), placed per shot by fstFg
  s.fgBy = {
    fern: (() => { const f = fern('fg'); f.scale.setScalar(1.3); f.rotation.x = 0.9; return f; })(),
    bough: (() => { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const m = c3Mesh(fstTierGeo(), s.needle[0], 0.02); m.scale.set(1.6 - k * 0.25, 0.5, 1.6 - k * 0.25); m.position.set(k * 1.1, 0, 0); m.rotation.z = -Math.PI / 2; g.add(m); } return g; })(),
    rock: (() => { const r = c3Mesh(icoR, rockM[1], 0.05); r.scale.set(2.6, 1.6, 1.4); return r; })(),
    shroom: (() => { const g = new THREE.Group(); for (let k = 0; k < 3; k++) { const st = c3Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.9, 10), c3Toon('#f6ead6'), 0.015); st.position.set(k * 0.6 - 0.6, 0.45 - k * 0.1, 0); g.add(st);
      const cp = c3Mesh(s.sph, c3Toon(k === 1 ? '#d8322a' : '#c8642a'), 0.02); cp.scale.set(0.55, 0.32, 0.55); cp.position.set(k * 0.6 - 0.6, 0.95 - k * 0.1, 0); g.add(cp); } return g; })(),
    cloud: (() => { const g = new THREE.Group(); for (let k = 0; k < 6; k++) { const R = RNG('fgc', k), b = c3Mesh(s.sph, c3Toon('#ffffff'), 0); b.scale.setScalar(R.r(3, 5)); b.position.set(k * 3 - 7, R.n(1.2), R.n(1)); g.add(b); } return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#a8d0f0', mid: '#e8e0c8', bot: '#4a6a3a', cards: [[0, 30, -30, 40, 8, '#fff6e8'], [-30, 10, 10, 10, 18, '#d8ecff'], [30, 12, -10, 10, 18, '#ffe8c8']] });
  c3ShadeScene(scene, { dark: 0.34 });   // Ricks soft shading (kit): lit tops, cooler darker bases
  c3Shadows(scene, s.key, 34);
  return s;
}
const fstGet = () => FST.s ||= fstBuild();

// ---- seasons: w = [winter, spring, summer, autumn] weights (one continuous cycle value q, 0..4 wraps)
const FST_SEASON = {   // ground tint, spruce tints (3), birch crown colour, sky tint, particle colour
  ground: ['#eef4fa', '#b8e08a', '#ffffff', '#e8b070'], needle: [['#3a5a5a', '#46665e', '#345452'], ['#3a8a44', '#4a9a4a', '#348040'], ['#2e6a3a', '#3a7a40', '#28603a'], ['#2e5e36', '#3a6a3a', '#28563a']],
  leaf: ['#e8eef4', '#9ad85a', '#5aa83a', '#e8782a'], sky: ['#dce6f2', '#ffffff', '#ffffff', '#ffe8c8'], part: ['#ffffff', '#ffb8d0', '#fff0a0', '#e8641e'],
};
function fstSeasonW(q) { const w = [0, 0, 0, 0], k = Math.floor(mod(q, 4)), f = mod(q, 1), e = EZ.io(clamp((f - 0.6) / 0.4)); w[k] = 1 - e; w[(k + 1) % 4] += e; return w; }
const fstMix = (cols, w) => { const c = new THREE.Color(0, 0, 0), t = new THREE.Color(); cols.forEach((h, i) => { if (w[i]) c.add(t.set(h).multiplyScalar(w[i])); }); return c; };
function fstSeason(s, w) {
  s.groundM.color.copy(fstMix(FST_SEASON.ground, w));
  s.needle.forEach((m, i) => m.color.copy(fstMix(FST_SEASON.needle.map((n) => n[i]), w)));
  s.leafM.color.copy(fstMix(FST_SEASON.leaf, w));
  s.sky.material.color.copy(fstMix(FST_SEASON.sky, w));
  s.snowM.opacity = w[0]; s.snowM.transparent = true;
  const snowOn = w[0] > 0.01; [...s.grid, ...s.bigTrees, s.hero].forEach((tr) => tr.snow.forEach((m) => { m.visible = snowOn; }));
  const bare = w[0];   // birches lose their crowns in winter (they shrink away, never pop)
  s.birches.forEach((b) => b.crown.scale.setScalar(Math.max(0.001, 1 - 0.85 * bare)));
}
// per-frame world: hides everything shot-specific, sets mood (sky map, light), seasons to summer by default
function fstWorld(s, t, mode = 'day') {
  const golden = mode === 'golden';
  if (s.mode !== mode) { s.mode = mode; s.sky.material.map = s.skyTex[golden ? 'golden' : 'day']; s.sky.material.needsUpdate = true;
    const [amb, hemi, key, rim] = s.lit;
    amb.color.set(golden ? '#ffe0c0' : '#fff4e4'); amb.intensity = golden ? 0.45 : 0.5;
    hemi.color.set(golden ? '#ffc8a0' : '#d8ecff'); hemi.groundColor.set(golden ? '#6a4a2a' : '#6a8a3a');
    key.color.set(golden ? '#ffb870' : '#fff2d8'); key.intensity = golden ? 1.25 : 1.15; key.position.set(...(golden ? [-30, 14, -20] : [-18, 30, 24]));
    rim.color.set(golden ? '#ff9a60' : '#ffd8b0'); rim.intensity = golden ? 0.9 : 0.5; }
  fstSeason(s, [0, 0, 1, 0]);
  [s.writer.g, s.librarian.g, s.ms, s.chest, s.counter, s.sign, s.yearB, s.book, s.sparks, s.parts, ...s.lanterns].forEach((o) => { o.visible = false; });
  s.shafts.forEach((m) => { m.visible = false; });
  s.hero.g.visible = false; s.parts.count = 0; s.sparks.count = 0;
}
// growth of the planting grid: f(tr) -> G (0 = not planted yet)
function fstGrid(s, f) { s.grid.forEach((tr) => { const G = f(tr); fstSize(tr, G); tr.mound.visible = G > 0.001; tr.mound.scale.set(1.1, 0.28, 1.1); }); }
// light shafts slanting through the canopy
function fstShafts(s, t, list, op = 1) {
  s.shafts.forEach((m, i) => { const L = list[i]; if (!L) { m.visible = false; return; } m.visible = true;
    m.position.set(L[0], L[1], L[2]); m.scale.set(L[3], L[4], 1); m.rotation.set(0, L[5] ?? 0, 0.35);
    m.material.opacity = op * (0.7 + 0.3 * Math.sin(t * 0.8 + i * 1.7)); });
}
// season particles (snowflakes, petals, pollen, autumn leaves): each one's path is a pure function of t and its seed
function fstParticles(s, t, w, box) {
  const n = s.partSeed.length, d = new THREE.Object3D(), col = new THREE.Color();
  s.parts.visible = true; s.parts.count = n;
  for (let i = 0; i < n; i++) { const [px, pz, ph, sp, rot, wob] = s.partSeed[i];
    const k = i % 4, wt = w[k === 1 ? 1 : k === 2 ? 3 : 0] + (k === 3 ? w[2] * 0.4 : 0), fall = mod(ph - t * 0.18 * sp, 1);
    d.position.set(box[0] + px * box[3] + Math.sin(t * 1.5 + wob) * 1.5, box[1] + fall * 34, box[2] + pz * 0.5);
    d.rotation.set(t * 2 * sp + rot, t * 1.4 + wob, rot); const sc = wt < 0.02 ? 0.0001 : (k === 1 || k === 0 ? 0.45 : 0.7) * Math.min(1, wt * 1.6);
    d.scale.set(sc, sc * (k === 3 ? 0.7 : 1), sc); d.updateMatrix(); s.parts.setMatrixAt(i, d.matrix);
    col.copy(fstMix(FST_SEASON.part, w)); if (k === 0) col.set('#ffffff'); if (k === 3) col.set(i % 3 ? '#e8641e' : '#f2b030'); s.parts.setColorAt(i, col); }
  s.parts.instanceMatrix.needsUpdate = true; if (s.parts.instanceColor) s.parts.instanceColor.needsUpdate = true;
}
// a sparkle burst around a point (deterministic): k 0..1 progress
function fstSparks(s, c, k, r = 6, n = 60) {
  const d = new THREE.Object3D(); s.sparks.visible = true; s.sparks.count = n;
  for (let i = 0; i < n; i++) { const [a, rr, ph, sc, sp] = s.sparkSeed[i], u = clamp(k * 1.3 - ph * 0.3), e = EZ.o3(u);
    d.position.set(c.x + Math.cos(a + u * 2) * r * rr * e, c.y + (rr - 0.3) * r * e + u * 2, c.z + Math.sin(a + u * 2) * r * rr * e * 0.6);
    d.quaternion.copy(s.cam.quaternion); d.rotateZ(sp + u * 3);
    const v = Math.sin(Math.PI * u) * sc * 0.75; d.scale.set(v, v, v); d.updateMatrix(); s.sparks.setMatrixAt(i, d.matrix); }
  s.sparks.instanceMatrix.needsUpdate = true;
}

// =====================================================================
//  s18 — "And it gets weirder.": whoosh out of the library on the Oslo fjord, up over the city's coloured roofs, toward the
//  green hills to the north
// =====================================================================
const FST_K18 = [[0, [-34, 34, 846], [2, 14, 690], 44], [0.9, [-10, 80, 700], [0, 20, 330], 50]];
SHOT_FN['s18'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'day');
  c3SetCam(s.cam, fstCam(FST_K18, EZ.i2(clamp(lt / 0.9)) * 0.9, 's18', { orbit: 0.0, creep: 0.0, rush: 0.05 }));
  fstGrid(s, () => 0); s.hero.g.visible = false;
  s.fg.forEach((f) => { f.visible = false; });
  fstRender(s, { bgBlur: 1.2, nearBlur: 12 });
};

// =====================================================================
//  s19 — "In a forest outside the city,": the camera glides low between the big spruces into the empty clearing; moss,
//  ferns and golden light shafts
// =====================================================================
const FST_K19 = [[0, [-58, 7, 54], [-20, 9, 0], 46], [1.6, [-34, 8.5, 44], [0, 9, -10], 46]];
SHOT_FN['s19'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'day');
  c3SetCam(s.cam, fstCam(FST_K19, lt, 's19', { orbit: 0.02 }));
  fstGrid(s, () => 0);
  fstShafts(s, t, [[-30, 18, 10, 6, 44, 0.4], [-8, 18, -12, 5, 44, 0.3], [14, 18, -30, 7, 44, 0.5], [-48, 18, 30, 4, 40, 0.4]], 0.9);
  fstFg(s, [['bough', [-3.4, 4.0, -9], 1.2, 0.2], ['fern', [3.0, -3.8, -8], 0.9]], FST_K19, 's19', lt, { orbit: 0.02 });
  fstRender(s, { bgBlur: fstRack(lt, 's19', 1.6, 2.4) });
};

// =====================================================================
//  s20 — "someone planted a thousand trees just for these books.": row after row, little spruces sprout out of fresh earth,
//  sweeping away from the camera; the TREES PLANTED board rolls up to 1000 on "books"
// =====================================================================
const FST_K20 = [[0, [7, 13, 47], [-1, 4, 0], 46], [2.6, [-3, 22, 54], [0, 1, -24], 46]];
SHOT_FN['s20'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'day');
  const planted = fstW('planted', 1, 28.9), books = fstW('books', 2, 30.7);
  c3SetCam(s.cam, fstCam(FST_K20, lt, 's20', { orbit: 0.03 }));
  const t0 = planted - 0.15, t1 = books - 0.1;   // the last sapling starts here
  const startOf = (tr) => t0 + (tr.row + (tr.col % 2) * 0.35 + Math.abs(tr.col - 5.5) * 0.06) / 10.6 * (t1 - t0);
  fstGrid(s, (tr) => { const k = clamp((t - startOf(tr)) / 0.38); return k <= 0 ? 0 : 2.0 * EZ.back(k); });
  s.grid.forEach((tr) => { const k = clamp((t - startOf(tr) + 0.12) / 0.2); tr.mound.visible = k > 0; tr.mound.scale.set(1.1 * EZ.o2(k) + 0.001, 0.28 * EZ.o2(k) + 0.001, 1.1 * EZ.o2(k) + 0.001); });
  s.counter.visible = true; s.counter.position.set(-1.0, 0, 17); s.counter.rotation.y = 0.05;
  const n = Math.round(lerp(0, 1000, EZ.io(clamp((t - t0) / (books + 0.25 - t0)))));
  fstCounterDraw(s, n);
  fstShafts(s, t, [[-20, 18, -10, 6, 44, 0.4], [18, 18, -30, 7, 44, 0.5]], 0.6);
  fstFg(s, [['fern', [-3.6, -3.6, -8], 1.1], ['shroom', [3.2, -4.2, -7.5], 0.8]], FST_K20, 's20', lt, { orbit: 0.03 });
  fstRender(s, { bgBlur: fstRack(lt, 's20', 1.4, 2.2) });
};

// =====================================================================
//  s21 — "You see… it's an art project called the Future Library.": the camera rises past a mossy stump to a carved wooden
//  sign between two log posts: FUTURE LIBRARY 2014 – 2114, the little spruces in rows behind it
// =====================================================================
const FST_K21 = [[0, [-5, 6.0, 66], [0, 7.5, 22], 44], [2.8, [3, 9.5, 60], [0, 8.6, 22], 44]];
SHOT_FN['s21'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'day');
  const lib = fstW('library', 2, 33.2);
  c3SetCam(s.cam, fstCam(FST_K21, lt, 's21', { orbit: -0.03 }));
  fstGrid(s, () => 2.2);
  s.sign.visible = true; s.sign.position.set(0, 0, 22); s.sign.rotation.y = 0.05;
  const pop = EZ.back(clamp((t - (lib - 0.15)) / 0.3)); s.sign.scale.setScalar(1 + 0.035 * Math.sin(Math.PI * clamp((t - (lib - 0.15)) / 0.3)) * (pop > 0 ? 1 : 0));
  if (t > lib - 0.1) fstSparks(s, fstV(0, 9, 23), clamp((t - (lib - 0.1)) / 0.7), 9, 40);
  fstShafts(s, t, [[-9, 18, 14, 4, 40, 0.3], [12, 18, 6, 5, 40, 0.5]], 0.7);
  fstFg(s, [['fern', [-3.0, -3.8, -7.5], 1.1], ['shroom', [3.2, -4.2, -7], -0.9]], FST_K21, 's21', lt, { orbit: -0.03 });
  fstRender(s, { bgBlur: fstRack(lt, 's21', 2.2, 3.2) });
};

// =====================================================================
//  s22 — "Every year for a hundred years,": time races — the forest runs through winter, spring, summer and autumn twice
//  (snow, blossom, pollen, falling leaves) while the YEAR board rolls 2014 → 2114 and the saplings grow a little
// =====================================================================
const FST_K22 = [[0, [12, 7, 44], [0, 6, 18], 44], [1.7, [6, 8, 40], [0, 6.5, 18], 44]];
SHOT_FN['s22'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'golden');
  const every = fstW('every', 1, 34.0), years = fstW('years', 1, 35.1);
  c3SetCam(s.cam, fstCam(FST_K22, lt, 's22', { orbit: 0.03 }));
  const k = clamp((t - every) / (years + 0.5 - every)), q = 0.0 + k * 8;   // two full turns of the seasons
  const w = fstSeasonW(q); fstSeason(s, w);
  fstGrid(s, () => lerp(2.2, 3.4, EZ.io(k)));
  s.yearB.visible = true; s.yearB.position.set(1.6, 0, 24); s.yearB.rotation.y = -0.1; s.yearB.scale.setScalar(0.72);
  fstYearDraw(s, lerp(2014, 2114, EZ.io(k)), Math.floor(mod(q + 0.3, 4)));
  fstParticles(s, t, w, [0, 0, 14, 0.5]);
  fstFg(s, [['fern', [-3.4, -3.8, -8], 1.0], ['rock', [3.4, -4.6, -9], 0.8]], FST_K22, 's22', lt, { orbit: 0.03 });
  fstRender(s, { bgBlur: fstRack(lt, 's22', 1.8, 2.6) });
};

// =====================================================================
//  s23 — "one writer hands in one book": a little ceremony in front of the young trees — lanterns, the brass-bound chest
//  on a stump; the writer leans in and lays his sealed manuscript inside, the librarian smiles and the lid shuts on "book"
// =====================================================================
const FST_K23 = [[0, [4, 10, 47], [1, 7.6, 14], 44], [1.5, [-1, 9.5, 43], [1, 7.2, 14], 44]];
SHOT_FN['s23'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'golden');
  const writer = fstW('writer', 1, 35.9), hands = fstW('hands', 1, 36.2), book = fstW('book', 1, 37.0);
  c3SetCam(s.cam, fstCam(FST_K23, lt, 's23', { orbit: 0.025 }));
  fstGrid(s, () => 3.6);
  s.chest.visible = true; s.lanterns.forEach((l, i) => { l.visible = true; l.flame.scale.set(0.35, 0.5 + 0.05 * Math.sin(t * 13 + i), 0.35); });
  const open = clamp((t - (writer - 0.5)) / 0.3), shut = EZ.back(clamp((t - (book - 0.15)) / 0.22));
  s.chest.lid.rotation.x = -1.75 * EZ.o2(open) * (1 - shut);
  // the writer, left of the chest; the librarian behind it, right
  s.writer.g.visible = true; s.writer.g.position.set(-3.6, FST_FOOT, 15.2);
  s.librarian.g.visible = true; s.librarian.g.position.set(5.2, FST_FOOT, 12.4);
  const slot = fstV(1.0, 1.6 + 1.9, 14.1);   // just above the chest's open mouth (world)
  const reach = EZ.io(clamp((t - hands + 0.15) / 0.4)), drop = clamp((t - hands - 0.3) / 0.25), back = EZ.io(clamp((t - book + 0.1) / 0.35));
  const pose = (hand) => c3PersonPose(s.writer, s.cam, t, { expr: c3FaceAt([[0, 'proud'], [hands, 'smile'], [book, 'happy']], t, 'writer'), gaze: [0.8, -0.4], head: [0.06, 0, -0.08],
    hand: { armL: hand, armR: [-1.3, -0.3] }, lean: -0.06 * reach * (1 - back), foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } });
  pose([1.3, 1.2]); s.writer.g.updateMatrixWorld(true);
  const sl = s.writer.root.worldToLocal(slot.clone()), tgt = [lerp(1.3, Math.min(sl.x, 2.15), reach * (1 - back)), lerp(1.2, Math.max(sl.y + 0.4, -0.2), reach * (1 - back))];
  pose(tgt); s.writer.g.updateMatrixWorld(true);
  const hw = s.writer.root.localToWorld(fstV(tgt[0], tgt[1], 0.2));
  s.ms.visible = t < book - 0.05; s.ms.rotation.set(-0.3 - 1.2 * drop, 0.3, 0);
  s.ms.position.copy(drop > 0 ? hw.clone().lerp(fstV(1.0, 2.6, 14.1), EZ.i2(drop)) : hw);
  c3PersonPose(s.librarian, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [book, 'happy']], t, 'librarian'), gaze: [-0.7, -0.3], hand: { armL: [0.5, 0.9 + 0.15 * clamp((t - book) / 0.2)], armR: [-0.5, 0.9 + 0.15 * clamp((t - book) / 0.2)] },
    foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } });
  if (t > book - 0.1) fstSparks(s, fstV(1.0, 4.0, 14.4), clamp((t - (book - 0.1)) / 0.6), 4, 30);
  fstShafts(s, t, [[-6, 18, 6, 4, 40, 0.3], [9, 18, 2, 5, 40, 0.5]], 0.8);
  fstFg(s, [['fern', [-3.2, -4.0, -8], 1.1], ['shroom', [3.4, -4.4, -7], 0.8]], FST_K23, 's23', lt, { orbit: 0.025 });
  fstRender(s, { bgBlur: fstRack(lt, 's23', 2.0, 3.0), glow: 0.8 });
};

// =====================================================================
//  s25 — "Then those thousand trees, fully grown by then,": time-lapse from the forest floor — the young spruces shoot up into
//  a tall forest as the sun swings over and the light shafts sweep
// =====================================================================
const FST_K25 = [[0, [2, 3.0, 30], [0, 8, 0], 52], [2.4, [-1, 2.4, 26], [0, 22, -6], 56]];
SHOT_FN['s25'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'golden');
  const then = fstW('then', 1, 39.8), grown = fstW('grown', 1, 41.3);
  c3SetCam(s.cam, fstCam(FST_K25, lt, 's25', { orbit: 0.05 }));
  const k = clamp((t - then + 0.1) / (grown + 0.35 - then));
  fstGrid(s, (tr) => { const lag = (tr.row * 0.03 + tr.col * 0.01) % 0.15, kk = clamp((k - lag) / (1 - 0.15)); return lerp(3.6, 20, EZ.io(kk)); });
  const sw = lt * 0.5; s.key.position.set(-30 * Math.cos(sw), 16 + 6 * Math.sin(sw * 2), -20 + 30 * Math.sin(sw));
  fstShafts(s, t, [[-12 + lt * 6, 18, 8, 5, 44, 0.3], [10 + lt * 5, 18, -6, 6, 44, 0.5], [-30 + lt * 7, 18, -20, 5, 44, 0.4]], 0.8);
  fstFg(s, [['fern', [-3.0, -3.8, -7], 1.0], ['fern', [3.4, -4.2, -8], 0.8]], FST_K25, 's25', lt, { orbit: 0.05 });
  fstRender(s, { bgBlur: fstRack(lt, 's25', 1.6, 2.4) });
  s.mode = null;   // the key light was moved: let the next shot restore it
};

// =====================================================================
//  s33 — "Which means somewhere in that forest, right now,": golden hour in the grown forest, dust in the light shafts; a slow
//  push-in to one tree standing in front
// =====================================================================
const FST_K33 = [[0, [-10, 14, 70], [0, 14, 22], 46], [2.5, [-3, 12, 50], [0, 15, 22], 44]];
SHOT_FN['s33'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'golden');
  c3SetCam(s.cam, fstCam(FST_K33, lt, 's33', { orbit: 0.02, creep: 0.06 }));
  fstGrid(s, () => 20);
  s.hero.g.visible = true; fstSize(s.hero, 18); s.hero.g.scale.x = s.hero.g.scale.z = fstLat(18) * (1 + 0.006 * Math.sin(t * 1.3));
  fstShafts(s, t, [[-8, 22, 30, 6, 50, 0.3], [12, 22, 18, 7, 50, 0.5], [-24, 22, 8, 5, 50, 0.4], [26, 22, 36, 5, 46, 0.6]], 1.0);
  fstParticles(s, t, [0, 0, 1, 0], [0, -6, 30, 0.35]);
  fstFg(s, [['bough', [-3.6, 3.4, -9], 1.0, 0.25], ['fern', [3.2, -4.2, -8], 0.8]], FST_K33, 's33', lt, { orbit: 0.02, creep: 0.06 });
  fstRender(s, { bgBlur: fstRack(lt, 's33', 1.6, 2.8), glow: 0.8, bloom: 0.28 });
};

// =====================================================================
//  s34 — "a tree is slowly growing into a book": the tree glows, then winds itself down into the forest floor in a swirl of
//  golden sparkles, and a giant open book grows up in its place, its pages fluttering on "book"
// =====================================================================
const FST_K34 = [[0, [-4, 12, 60], [0, 12, 22], 44], [1.9, [2, 10, 58], [0, 7.6, 22], 44]];
SHOT_FN['s34'] = (t, u, lt) => {
  const s = fstGet(); fstWorld(s, t, 'golden');
  const tree = fstW('tree', 1, 57.3), growing = fstW('growing', 1, 57.9), book = fstW('book', 2, 58.7);
  c3SetCam(s.cam, fstCam(FST_K34, lt, 's34', { orbit: -0.02, creep: 0.04 }));
  fstGrid(s, () => 20);
  // the tree: glows on "tree", then twists and squashes into the ground
  const sq = EZ.i2(clamp((t - growing) / 0.4));
  fstSize(s.hero, 18 * (1 - sq) + 0.01); s.hero.g.visible = sq < 0.98; s.hero.g.rotation.y = sq * 2.4;
  s.hero.g.scale.x = s.hero.g.scale.z = fstLat(18) * (1 + 0.5 * sq);
  // the book rises once the tree is mostly gone
  const bk = EZ.back(clamp((t - (growing + 0.28)) / 0.42));
  s.book.visible = bk > 0.002; s.book.scale.setScalar(Math.max(0.002, bk) * 0.95); s.book.rotation.y = 0.12 * Math.sin(t * 0.8);
  s.book.pages.forEach((p, i) => { const f = clamp((t - book + 0.1 - i * 0.05) / 0.4); p.rotation.y = -0.55 + (i % 2 ? -1 : 1) * 0.12 + Math.sin(Math.PI * f) * (1.1 - i * 0.12); });
  const spk = clamp((t - (tree - 0.1)) / (book + 0.3 - tree));
  fstSparks(s, fstV(0, 8, 22), spk, 9, 90);
  fstShafts(s, t, [[-8, 22, 30, 6, 50, 0.3], [12, 22, 18, 7, 50, 0.5], [26, 22, 36, 5, 46, 0.6]], 1.0);
  fstFg(s, [['bough', [-3.4, 3.6, -9], 1.0, 0.25], ['shroom', [3.2, -4.4, -7], 0.8]], FST_K34, 's34', lt, { orbit: -0.02, creep: 0.04 });
  fstRender(s, { bgBlur: fstRack(lt, 's34', 2.2, 2.8), glow: 0.9, bloom: 0.3 });
};
