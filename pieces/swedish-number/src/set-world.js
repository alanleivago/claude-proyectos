// =====================================================================
//  SET world — the planet: s01 (Sweden gives its number to the whole planet), s29 (people loved it: hearts),
//  s30 (~200,000 calls from almost every country: call arcs fly into Sweden, a counter rolls), s31 (the world's first
//  impression of Sweden: a postcard flies out of Sweden). Registers SHOT_FN[id]. Helpers are prefixed wld.
//  One world, built once: a cartoon Earth (radius 30, Flow equirect map, assets/img_earth.jpg) in a saturated starry
//  sky; tilt group (x) > spin group (y) > globe, so Sweden can be turned to face the camera. Sweden is at map
//  (u 0.527, v 0.17) — measured on the image. Everything random is drawn once at build (RNG).
// =====================================================================
const WLD = {}, WLD_R = 30, WLD_SE = [0.527, 0.17];
// a point on the globe (local, before spin/tilt) from map u, v; h = height above the surface
function wldPt(u, v, h = 0) { const ph = u * TAU, th = v * Math.PI, r = WLD_R + h; return V3(-Math.cos(ph) * Math.sin(th) * r, Math.cos(th) * r, Math.sin(ph) * Math.sin(th) * r); }
// spin (y) and tilt (x) that bring map point (u, v) to face +z
function wldFaceAngles(u, v) { const p = wldPt(u, v); const spin = Math.atan2(-p.x, p.z), lat = Math.asin(p.y / WLD_R); return [spin, lat]; }
function wldTexSky() {   // deep saturated space: indigo to teal, soft nebula puffs, many 4-point stars
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a1458'); g.addColorStop(0.45, '#2a3a9a'); g.addColorStop(1, '#127a9a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('wldsky'); for (let i = 0; i < 14; i++) { const cx = R.r(0, w), cy = R.r(0, h), r = R.r(80, 260), gg = x.createRadialGradient(cx, cy, 0, cx, cy, r); gg.addColorStop(0, ['rgba(255,120,200,0.22)', 'rgba(120,220,255,0.2)', 'rgba(255,220,120,0.16)'][i % 3]); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
    for (let i = 0; i < 520; i++) { const sx = R.r(0, w), sy = R.r(0, h), s = R.f() < 0.1 ? R.r(5, 9) : R.r(1, 2.6); x.fillStyle = R.f() < 0.2 ? '#ffe8a0' : '#ffffff';
      if (s > 4) { x.beginPath(); x.moveTo(sx, sy - s); x.quadraticCurveTo(sx, sy, sx + s, sy); x.quadraticCurveTo(sx, sy, sx, sy + s); x.quadraticCurveTo(sx, sy, sx - s, sy); x.quadraticCurveTo(sx, sy, sx, sy - s); x.fill(); }
      else { x.beginPath(); x.arc(sx, sy, s, 0, TAU); x.fill(); } } }, 4096, 2048);
}
function wldTexBanner() {   // the phone-number ribbon: blue band, yellow edges, the number and a little phone, repeated
  const t = tex((x, w, h) => { x.fillStyle = '#1a5aa8'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffcc1a'; x.fillRect(0, 0, w, h * 0.12); x.fillRect(0, h * 0.88, w, h * 0.12);
    inked(x, '+46 771 793 336', w * 0.42, h * 0.52, h * 0.5, '#ffffff', { stroke: '#0a2a5a', sw: h * 0.05, maxW: w * 0.68 });
    x.fillStyle = '#ffcc1a'; x.save(); x.translate(w * 0.88, h * 0.52); x.rotate(-0.4); x.beginPath(); x.roundRect(-h * 0.22, -h * 0.08, h * 0.44, h * 0.16, h * 0.05); x.fill();
    x.beginPath(); x.arc(-h * 0.17, h * 0.04, h * 0.09, 0, TAU); x.arc(h * 0.17, h * 0.04, h * 0.09, 0, TAU); x.fill(); x.restore(); }, 2048, 256);
  t.wrapS = THREE.RepeatWrapping; return t;
}
function wldTexHeart() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); const cx = w / 2, cy = h * 0.47, r = w * 0.2;
  const path = () => { x.beginPath(); x.moveTo(cx, cy + r * 1.7); x.bezierCurveTo(cx - r * 2.6, cy - r * 0.1, cx - r * 1.1, cy - r * 2.2, cx, cy - r * 0.7); x.bezierCurveTo(cx + r * 1.1, cy - r * 2.2, cx + r * 2.6, cy - r * 0.1, cx, cy + r * 1.7); x.closePath(); };
  path(); x.fillStyle = '#e8304a'; x.fill(); x.lineWidth = w * 0.05; x.strokeStyle = '#3b1417'; x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.55)'; x.beginPath(); x.ellipse(cx - r * 0.9, cy - r * 0.75, r * 0.35, r * 0.2, -0.6, 0, TAU); x.fill(); }, 256, 256); }
function wldDrawCounter(x, w, h, n, done) { x.clearRect(0, 0, w, h); { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffd23a'); g.addColorStop(1, '#f2a81a'); x.fillStyle = g; x.beginPath(); x.roundRect(6, 6, w - 12, h - 12, 40); x.fill();
  x.lineWidth = 12; x.strokeStyle = '#3b2417'; x.stroke(); inked(x, 'CALLS TO SWEDEN', w / 2, h * 0.2, h * 0.12, '#1a3a7a', { stroke: false, maxW: w * 0.84 });
  const s = Math.round(n).toLocaleString('en-US'), cw = w * 0.1, ww = [...s].map((ch) => (ch === ',' ? cw * 0.4 : cw)), x0 = w / 2 - ww.reduce((a, b) => a + b, 0) / 2;   // the comma takes a narrow slot
  for (let i = 0, px = x0; i < s.length; px += ww[i], i++) { const ch = s[i], cwi = ww[i]; if (ch !== ',') { x.fillStyle = '#1a2448'; x.beginPath(); x.roundRect(px + 4, h * 0.34, cw - 8, h * 0.42, 12); x.fill(); }
    inked(x, ch, px + cwi / 2, h * 0.56, h * 0.32, ch === ',' ? '#1a2448' : '#ffffff', { stroke: false, font: 'Arial' }); }
  inked(x, done ? 'in about 2 months' : 'and counting...', w / 2, h * 0.88, h * 0.09, '#1a3a7a', { stroke: false, weight: 700 }); } }
function wldTexPostcard() { return tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); cover(x, asset('img_postcard.jpg'), w * 0.03, h * 0.04, w * 0.94, h * 0.92); x.strokeStyle = '#3b2417'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); }, 1024, 763); }

function wldBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(36, W / H, 1, 6000), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffffff', ambI: 0.7, sky: '#e8f0ff', ground: '#3a3a8a', key: '#fff6e0', keyI: 1.25, keyP: [-60, 50, 90], rim: '#8ae8ff', rimI: 0.9, rimP: [70, 30, -60] });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), c3Flat('#ffffff', { map: wldTexSky(), side: THREE.BackSide })));
  // halo of atmosphere behind the globe (a soft additive card, always faced to the camera)
  s.halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: c3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(140,230,255,0.9)'); g.addColorStop(0.3, 'rgba(120,200,255,0.45)'); g.addColorStop(1, 'rgba(80,140,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 256, 256), transparent: true, depthWrite: false, toneMapped: false }));
  s.halo.scale.setScalar(WLD_R * 2.9); scene.add(s.halo);
  s.tilt = new THREE.Group(); s.spin = new THREE.Group(); s.tilt.add(s.spin); scene.add(s.tilt);
  const em = new THREE.Texture(asset('img_earth.jpg')); em.encoding = THREE.sRGBEncoding; em.anisotropy = 8; em.needsUpdate = true;
  s.globe = c3Mesh(new THREE.SphereGeometry(WLD_R, 96, 64), c3Prop('#ffffff', { map: em, rough: 0.55, env: 0.6 }), 0.5); s.spin.add(s.globe);
  // little cartoon clouds hugging the globe (they spin with it)
  s.clouds = [];
  for (let i = 0; i < 0; i++) { const R = RNG('wldcl', i)   // (none: flat-bottomed cloud cards read as quad edges on the round globe)
, c = c3Cloud({ mood: 'day', seed: 300 + i, size: R.r(9, 15) }); c.material.depthWrite = false; const u = R.r(0, 1), v = R.r(0.18, 0.78);
    c.userData.at = wldPt(u, v, 2.5); s.spin.add(c); s.clouds.push(c); }
  // Sweden's pin: a yellow head, a blue stem, a waving flag
  s.pin = new THREE.Group(); s.spin.add(s.pin);
  s.pin.add(cyl(0.25, 0.05, 4.4, c3Prop('#1a5aa8', { rough: 0.3 }), 0, 2.2, 0, 0.04, 10));
  const ph = c3Mesh(new THREE.SphereGeometry(1.0, 20, 14), c3Prop('#ffcc1a', { rough: 0.3, emissive: '#ffcc1a', ei: 0.25 }), 0.08); ph.position.y = 4.8; s.pin.add(ph);
  s.flag = pl(3.2, 2.0, c3Flat('#ffffff', { map: texFlagSE(), side: THREE.DoubleSide }), 1.7, 4.4, 0); s.pin.add(s.flag);
  { const p = wldPt(...WLD_SE), n = p.clone().normalize(); s.pin.position.copy(p); s.pin.quaternion.setFromUnitVectors(V3(0, 1, 0), n); }
  // the number ribbon (geometry rebuilt per unroll step, cached)
  s.bannerTex = wldTexBanner(); s.bannerM = new THREE.MeshBasicMaterial({ map: s.bannerTex, side: THREE.DoubleSide, toneMapped: false });
  s.banner = new THREE.Mesh(new THREE.BufferGeometry(), s.bannerM); s.banner.rotation.z = -0.22; s.banner.position.y = 10; scene.add(s.banner); s.bannerGeo = {};
  // hearts (s29) at fixed spots on the front of the globe
  const hm = wldTexHeart(); s.hearts = [];
  for (let i = 0; i < 40; i++) { const R = RNG('wldh', i), m = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: hm, transparent: true, depthWrite: false, toneMapped: false }));
    m.userData.at = wldPt(R.r(0.12, 0.62), R.r(0.18, 0.7), 3.5); m.userData.t0 = R.r(0, 1.0); m.renderOrder = 8; s.spin.add(m); s.hearts.push(m); }
  // call arcs (s30): from points all over the world to Sweden, each a tube drawn in with setDrawRange
  const se = wldPt(...WLD_SE, 0.3); s.arcs = [];
  const arcM = [c3Flat('#ffe23a', { glow: '#ffe23a' }), c3Flat('#ff6ab0', { glow: '#ff6ab0' }), c3Flat('#7affd8', { glow: '#7affd8' })];
  for (let i = 0; i < 46; i++) { const R = RNG('wldarc', i); let u, v; do { u = R.f(); v = R.r(0.12, 0.85); } while (Math.hypot(u - WLD_SE[0], v - WLD_SE[1]) < 0.08);
    const a = wldPt(u, v, 0.3), mid = a.clone().add(se).multiplyScalar(0.5), lift = WLD_R + 4 + a.distanceTo(se) * 0.35; mid.normalize().multiplyScalar(lift);
    const geo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, se), 40, 0.5, 8, false), m = new THREE.Mesh(geo, arcM[i % 3]); m.userData.noInk2 = true;
    const dot = c3Mesh(new THREE.SphereGeometry(0.55, 10, 8), arcM[i % 3], 0.05); dot.position.copy(a);
    Object.assign(m.userData, { n: geo.index.count, t0: R.r(0, 2.4) * (i / 46 + 0.3), dot, noCast: true }); s.spin.add(m); s.spin.add(dot); s.arcs.push(m); }
  // the counter panel (s30) and the postcard (s31), placed in the world in front of the globe
  s.ctr = canvasTex(1024, 512);
  s.counter = new THREE.Group(); s.counter.add(pl(26, 13, new THREE.MeshBasicMaterial({ map: s.ctr.t, transparent: true, toneMapped: false }), 0, 0, 0)); scene.add(s.counter);
  s.card = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.745), new THREE.MeshBasicMaterial({ map: wldTexPostcard(), toneMapped: false, side: THREE.DoubleSide })); scene.add(s.card);
  // a little satellite crossing the sky (comic: it has a phone dish)
  s.sat = new THREE.Group(); s.sat.add(rb(2.2, 1.4, 1.4, c3Prop('#e8e8f0', { metal: 0.5, rough: 0.3 }), 0, 0, 0, 0.05));
  for (const sx of [-1, 1]) s.sat.add(rb(3.2, 0.1, 1.6, c3Prop('#2a5ad8', { rough: 0.3, emissive: '#1a3a8a', ei: 0.3 }), sx * 2.8, 0, 0, 0.03));
  const dish = c3Mesh(new THREE.SphereGeometry(0.8, 14, 8, 0, TAU, 0, Math.PI / 2), c3Prop('#f6f6fa', { rough: 0.3 }), 0.03); dish.rotation.x = Math.PI; dish.position.y = -1.0; s.sat.add(dish); scene.add(s.sat);
  [s.tilt, s.banner, s.counter, s.card, s.sat].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = { star: (() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: wldTexHeart(), transparent: true, depthWrite: false, toneMapped: false })); return m; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#e8f0ff', mid: '#6a8ad8', bot: '#1a1458' });
  return s;
}
const wldGet = () => WLD.s ||= wldBuild();
// per-frame: orientation (Sweden toward the camera by k 0..1 from a base spin), clouds and hearts face the camera
function wldWorld(s, t, o = {}) {
  const [sp, lat] = wldFaceAngles(...WLD_SE);
  s.spin.rotation.y = sp + (o.spin ?? 0) + t * 0.02; s.tilt.rotation.x = lat * (o.tilt ?? 1);
  s.tilt.updateMatrixWorld(true);
  s.clouds.forEach((c) => { c.position.copy(c.userData.at); c.quaternion.copy(s.spin.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(s.cam.quaternion)); });
  s.flag.rotation.y = 0.25 * Math.sin(t * 5); s.flag.scale.x = 1 + 0.04 * Math.sin(t * 7);
  s.halo.quaternion.copy(s.cam.quaternion); s.halo.position.set(0, 0, -WLD_R * 0.6).applyQuaternion(s.cam.quaternion).add(V3(0, 0, 0));
  s.banner.visible = false; s.counter.visible = false; s.card.visible = false; s.sat.visible = false;
  s.hearts.forEach((m) => { m.visible = false; }); s.arcs.forEach((m) => { m.visible = false; m.userData.dot.visible = false; });
  s.pin.scale.setScalar(1);
}
function wldBanner(s, k) {   // the ribbon unrolls around the globe (k 0..1 of a full turn)
  const q = Math.max(1, Math.round(k * 60)); if (!s.bannerGeo[q]) { const L = q / 60 * TAU;
    s.bannerGeo[q] = new THREE.CylinderGeometry(WLD_R + 3.2, WLD_R + 3.2, 5.2, 120, 1, true, -0.4, L);
    const uv = s.bannerGeo[q].attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * L / TAU * 4); }
  s.banner.geometry = s.bannerGeo[q]; s.banner.visible = true;
}
// heart billboards facing the camera
function wldHearts(s, t, t0, dur = 1.2) {
  const q = s.spin.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(s.cam.quaternion);
  s.hearts.forEach((m, i) => { const ts = t0 + m.userData.t0 * dur, k = pop(t, ts, 0.3); m.visible = k > 0.01; if (!m.visible) return;
    m.position.copy(m.userData.at).multiplyScalar(1 + 0.06 * clamp((t - ts) / 1.5)); m.quaternion.copy(q); m.scale.setScalar(k * (1 + 0.08 * Math.sin((t - ts) * 9))); });
}

// =====================================================================
//  s01 — "Sweden once gave its phone number to the entire planet.": close on the Swedish pin waving its flag; the
//  camera pulls back to the whole planet while the number ribbon unrolls all the way around it
// =====================================================================
const WLD_K01 = [[0, [6, 34, 72], [0, 26, 0], 38], [1.1, [8, 26, 120], [0, 10, 0], 40], [2.68, [-6, 18, 168], [0, 4, 0], 40]];
SHOT_FN['s01'] = (t, u, lt) => {
  const s = wldGet(); c3SetCam(s.cam, camMove(WLD_K01, lt, 's01', { orbit: 0.04, creep: 0.0, rush: 0.04 }));
  wldWorld(s, t, { spin: -0.25 + 0.25 * EZ.io(clamp(lt / 2.6)), tilt: 0.55 });
  const sw = wAfter('Sweden', 0, 0); s.pin.scale.setScalar(Math.max(0.01, pop(t, sw - 0.05, 0.35)));
  const ph = wAfter('phone', 0, 1.04), pt = wAfter('planet', 0, 2.08);
  const k = clamp((t - ph) / (pt + 0.3 - ph)); if (k > 0) wldBanner(s, EZ.o3(k));
  c3Render(s.scene, s.cam, { bg: '#1a1458', bgBlur: rackOf(lt, 's01', 2.4, 1.2), nearBlur: 10, glow: 0.6, glowBlur: 14 });
};

// =====================================================================
//  s29 — "But people loved it.": the globe turned toward the Atlantic; hearts pop up all over the world
// =====================================================================
const WLD_K29 = [[0, [-30, 16, 150], [0, 9, 0], 38], [1.34, [-14, 18, 140], [0, 10, 0], 38]];
SHOT_FN['s29'] = (t, u, lt) => {
  const s = wldGet(); c3SetCam(s.cam, camMove(WLD_K29, lt, 's29', { orbit: 0.02, creep: 0.02, rush: 0.0 }));
  wldWorld(s, t, { spin: 0.9, tilt: 0.45 });
  wldHearts(s, t, wAfter('loved', 48, 48.56) - 0.25, 0.8);
  c3Render(s.scene, s.cam, { bg: '#1a1458', bgBlur: 1.6, glow: 0.5, glowBlur: 14 });
};

// =====================================================================
//  s30 — "In its first couple of months, it got close to two hundred thousand calls from almost every country on
//  Earth.": long take — the globe turns under glowing call arcs that fly from everywhere into Sweden; the counter
//  rolls to 200,000 on "thousand"; the hearts fade
// =====================================================================
const WLD_K30 = [[0, [-14, 18, 140], [0, 10, 0], 38], [2.2, [10, 34, 150], [0, 13, 0], 40], [4.84, [22, 40, 158], [0, 15, 0], 40]];
SHOT_FN['s30'] = (t, u, lt) => {
  const s = wldGet(); c3SetCam(s.cam, camMove(WLD_K30, lt, 's30', { orbit: 0.015, creep: 0.0, rush: 0.0 }));
  const [a, b] = spanOf('s30');
  wldWorld(s, t, { spin: 0.9 - 0.75 * EZ.io(clamp((t - a) / (b - a))), tilt: 0.45 + 0.25 * EZ.io(clamp((t - a) / (b - a))) });
  wldHearts(s, t, 48.3, 0.8); s.hearts.forEach((m) => { m.scale.multiplyScalar(clamp(1 - (t - a) / 0.8)); m.visible = m.visible && t < a + 0.8; });
  const t0 = a + 0.2, thou = wAfter('thousand', 51, 51.84);
  s.arcs.forEach((m) => { const k = clamp((t - t0 - m.userData.t0) / 0.7); m.visible = k > 0; m.userData.dot.visible = k > 0;
    if (k > 0) m.geometry.setDrawRange(0, Math.floor(m.userData.n * k / 6) * 6); m.userData.dot.scale.setScalar(pop(t, t0 + m.userData.t0, 0.25) + 0.001); });
  s.pin.scale.setScalar(1 + 0.18 * Math.max(0, Math.sin((t - a) * 10)) * clamp((t - t0) / 1));
  const n = 200000 * EZ.o3(clamp((t - (a + 0.3)) / (thou + 0.05 - (a + 0.3)))); const nq = Math.round(n / 1000) * 1000, nd = nq >= 200000 ? 200000 : nq + (nq * 7919) % 1000;   // quantised: the same frame always shows the same number
  redraw(s.ctr, 'c' + nd + (t > thou + 0.3), (x, w, h) => wldDrawCounter(x, w, h, nd, t > thou + 0.3));
  s.counter.visible = true; s.counter.position.copy(s.cam.position).add(V3(0, 0, -1).applyQuaternion(s.cam.quaternion).multiplyScalar(70)).add(V3(0, 10.5, 0).applyQuaternion(s.cam.quaternion));
  s.counter.quaternion.copy(s.cam.quaternion); s.counter.scale.setScalar(0.66 * Math.max(0.01, pop(t, a + 0.15, 0.3)) * (1 + 0.05 * pop(t, thou, 0.2) * Math.exp(-(t - thou) * 3)));
  s.sat.visible = true; s.sat.position.set(lerp(-60, 60, (t - a) / (b - a)), 44, 20); s.sat.rotation.set(0.3, t * 0.6, 0.2);
  c3Render(s.scene, s.cam, { bg: '#1a1458', bgBlur: 1.4, glow: 0.8, glowBlur: 12 });
};

// =====================================================================
//  s31 — "Which means a lot of the world's first impression of Sweden…": the globe turns back to Sweden; on
//  "impression" a postcard (Flow photo: GREETINGS FROM SWEDEN, a man in pajamas with meatballs) flies out of the pin
//  toward the lens and fills the frame
// =====================================================================
const WLD_K31 = [[0, [16, 30, 150], [0, 8, 0], 40], [3.3, [4, 26, 128], [0, 14, 0], 38]];
SHOT_FN['s31'] = (t, u, lt) => {
  const s = wldGet(); c3SetCam(s.cam, camMove(WLD_K31, lt, 's31', { orbit: 0.02, creep: 0.0, rush: 0.0 }));
  const [a] = spanOf('s31'); wldWorld(s, t, { spin: 0.15 * (1 - EZ.io(clamp((t - a) / 1.4))), tilt: 0.7 - 0.15 * EZ.io(clamp((t - a) / 1.4)) });
  const ti = wAfter('impression', 56, 56.52) - 0.35, k = EZ.io(clamp((t - ti) / 1.1));
  if (t > ti) { const p0 = s.pin.getWorldPosition(V3(0, 0, 0)), p1 = s.cam.position.clone().add(V3(0, 0, -1).applyQuaternion(s.cam.quaternion).multiplyScalar(40)).add(V3(0, 3.2, 0).applyQuaternion(s.cam.quaternion));
    s.card.visible = true; s.card.position.lerpVectors(p0, p1, k); s.card.quaternion.copy(s.cam.quaternion); s.card.rotateZ(0.6 * (1 - k) - 0.06); s.card.scale.setScalar(lerp(2, 16.5, k)); }
  c3Render(s.scene, s.cam, { bg: '#1a1458', bgBlur: 1.4, glow: 0.5, glowBlur: 12 });
};
