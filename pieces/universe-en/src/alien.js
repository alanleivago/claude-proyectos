// =====================================================================
//  ALIEN — someone outside the universe watching (62–67 s); owned by the alien agent.
//  A lavender alien child with three glossy eyes, antennae and freckles, in a striped knit sweater, watches us on its
//  screen from its bedroom at night (string lights, bokeh, a window with two moons). It stares, blinks, its eyes widen
//  and look at each other, its mouth opens ("oh"), it frowns, raises the TV remote and presses rewind (66.6 s).
//  Units: the head is ~1 in radius, centred at the origin; the camera (our screen) looks down -z.
// =====================================================================
const AL_SKIN = '#9a84dc';
const alG = (d, cx, cy, cz, w) => { const c = _v.set(cx, cy, cz).normalize(); return Math.exp(-(1 - (d.x * c.x + d.y * c.y + d.z * c.z)) / (w * w)); };
// the head surface: a unit direction -> a point (big round cranium, narrower soft jaw, round cheeks, a little muzzle)
function alF(d, out = new THREE.Vector3()) {
  const low = Math.max(0, -d.y), sx = 1 - 0.2 * low * low, sz = 0.9 - 0.05 * low;
  const r = 1 + 0.075 * alG(d, -0.5, -0.4, 0.77, 0.33) + 0.075 * alG(d, 0.5, -0.4, 0.77, 0.33) + 0.045 * alG(d, 0, -0.55, 0.83, 0.3) - 0.03 * alG(d, 0, 0.15, 1, 0.35);
  out.set(d.x * sx * r, d.y * (d.y < 0 ? 0.94 : 1.04) * r, d.z * sz * r); return out;
}
// the surface point (and normal) in front of face coordinates (x, y)
function alSurf(x, y, push = 0) { const d = new THREE.Vector3(x, y, Math.sqrt(Math.max(0.0001, 1 - x * x - y * y))).normalize(), p = alF(d), n = alNorm(d); return { p: p.addScaledVector(n, push), n }; }
function alNorm(d) { const t1 = new THREE.Vector3().crossVectors(d, Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize(), t2 = new THREE.Vector3().crossVectors(d, t1), e = 0.002;
  const p0 = alF(d), p1 = alF(d.clone().addScaledVector(t1, e).normalize()).sub(p0), p2 = alF(d.clone().addScaledVector(t2, e).normalize()).sub(p0), n = new THREE.Vector3().crossVectors(p1, p2).normalize(); if (n.dot(p0) < 0) n.negate(); return n; }
const alOrient = (obj, n, spin = 0) => { obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); if (spin) obj.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), spin)); };
// a decal laid on the head surface over the face box (cx ± w, cy ± h); rebuilt in place when the box changes
function alDecal(mat, nu = 18, nv = 12) { const g = new THREE.PlaneGeometry(1, 1, nu, nv), m = new THREE.Mesh(g, mat); m.renderOrder = 2; m.castShadow = false; return m; }
function alLayDecal(m, cx, cy, w, h, push = 0.004) { const p = m.geometry.attributes.position, uv = m.geometry.attributes.uv;
  for (let i = 0; i < p.count; i++) { const u = uv.getX(i) * 2 - 1, v = uv.getY(i) * 2 - 1, s = alSurf(cx + u * w, cy + v * h, push); p.setXYZ(i, s.p.x, s.p.y, s.p.z); }
  p.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere(); }

// ---- textures
function alFaceTex() { return g3Tex((x, w, h) => { const R = RNG('alface'), X = (v) => (v * 0.45 + 0.5) * w, Y = (v) => (0.5 - v * 0.45) * h;
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
  blot(x, X(0), Y(1.0), w * 0.35, 'rgba(225,215,255,0.5)');                                  // a lighter crown
  blot(x, X(0), Y(-0.55), w * 0.16, 'rgba(255,240,250,0.45)');                               // lighter muzzle
  for (const s of [-1, 1]) { blot(x, X(s * 0.55), Y(-0.36), w * 0.13, 'rgba(255,120,190,0.55)'); blot(x, X(s * 0.55), Y(-0.36), w * 0.07, 'rgba(255,110,180,0.35)'); // blush
    blot(x, X(s * 0.86), Y(0.25), w * 0.14, 'rgba(150,120,210,0.3)'); }                     // temples
  // freckles: little clusters on the cheeks and across the nose bridge
  const frk = (fx, fy) => { const r = R.r(3, 5.2); x.fillStyle = `rgba(${R.i(110, 140)},${R.i(60, 80)},${R.i(150, 180)},${R.r(0.55, 0.8)})`; x.beginPath(); x.ellipse(X(fx), Y(fy), r, r * R.r(0.75, 1), R.r(0, 3), 0, TAU); x.fill(); };
  for (const s of [-1, 1]) for (let k = 0; k < 11; k++) { const a = R.r(0, TAU), rr = Math.sqrt(R.f()) * 0.16; frk(s * 0.5 + Math.cos(a) * rr * 1.2, -0.27 + Math.sin(a) * rr * 0.6); }
  for (let k = 0; k < 7; k++) frk(R.r(-0.13, 0.13), R.r(-0.22, -0.14));
  speck(x, w, h, 5000, ['rgba(140,110,200,0.08)', 'rgba(255,255,255,0.1)'], R, 1, 2); }, 1024, 1024); }
// the eye on a sphere whose pole looks down +z: rows = angle from the pole (pupil, iris with streaks, limbal ring, white)
function alEyeTex(key, c0, c1, c2) { return g3Tex((x, w, h) => { const R = RNG(key), row = (deg) => deg * 1.15 / 180 * h;
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#f4f2fb'); g.addColorStop(1, '#c8b8d8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const ig = x.createLinearGradient(0, row(14), 0, row(37)); ig.addColorStop(0, c0); ig.addColorStop(0.45, c1); ig.addColorStop(1, c2); x.fillStyle = ig; x.fillRect(0, row(14), w, row(37) - row(14));
  for (let k = 0; k < 260; k++) { const px = R.r(0, w); x.strokeStyle = R.f() < 0.5 ? `rgba(255,255,230,${R.r(0.08, 0.25)})` : `rgba(10,40,60,${R.r(0.08, 0.25)})`; x.lineWidth = R.r(0.6, 2); x.beginPath(); x.moveTo(px, row(15)); x.lineTo(px + R.n(2), row(R.r(26, 36))); x.stroke(); }
  x.fillStyle = 'rgba(255,214,90,0.55)'; for (let k = 0; k < 90; k++) x.fillRect(R.r(0, w), row(R.r(15, 20)), R.r(1, 3), R.r(2, 6));   // gold flecks round the pupil
  x.fillStyle = '#05060a'; x.fillRect(0, 0, w, row(15)); x.fillStyle = 'rgba(5,6,10,0.6)'; x.fillRect(0, row(15), w, 2);
  const lg = x.createLinearGradient(0, row(33), 0, row(39.5)); lg.addColorStop(0, 'rgba(10,30,50,0)'); lg.addColorStop(0.6, 'rgba(10,26,44,0.95)'); lg.addColorStop(1, 'rgba(10,26,44,0)'); x.fillStyle = lg; x.fillRect(0, row(33), w, row(39.5) - row(33));
  for (let k = 0; k < 14; k++) { const px = R.r(0, w); x.strokeStyle = 'rgba(230,120,160,0.18)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, h); x.bezierCurveTo(px + R.n(20), row(120), px + R.n(20), row(90), px + R.n(10), row(R.r(55, 75))); x.stroke(); } }, 256, 256); }
// knit: rows of little V stitches in stripe bands (mustard / cream / teal / plum); one tile = 0.9 units
function alKnit(cols) { return g3Tex((x, w, h) => { const R = RNG('knit'), n = 8, sw = w / n, sh = h / 16;
  for (let r = 0; r < 16; r++) { const c = cols[r]; for (let k = 0; k < n; k++) { const cx = k * sw + sw / 2, cy = r * sh + sh / 2, l = R.r(-6, 6);
    x.fillStyle = c; x.fillRect(k * sw, r * sh, sw, sh);
    for (const s of [-1, 1]) { const gg = x.createLinearGradient(cx + s * sw * 0.45, cy, cx, cy); gg.addColorStop(0, 'rgba(0,0,0,0.2)'); gg.addColorStop(0.55, `rgba(255,255,255,${0.12 + l * 0.01})`); gg.addColorStop(1, 'rgba(0,0,0,0.12)');
      x.fillStyle = gg; x.beginPath(); x.ellipse(cx + s * sw * 0.21, cy, sw * 0.23, sh * 0.7, s * -0.5, 0, TAU); x.fill(); } } }
  speck(x, w, h, 2500, ['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.12)'], R, 1, 2); }, 512, 512); }
// the mouth: an oval with a plum interior, a tongue and a lip rim (alpha outside the oval)
function alMouthTex() { return g3Tex((x, w, h) => { x.save(); x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.46, h * 0.46, 0, 0, TAU); x.clip();
  const g = x.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h / 2, w * 0.5); g.addColorStop(0, '#1a0614'); g.addColorStop(0.7, '#3c0f2e'); g.addColorStop(1, '#5a1d48'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#e0607e'; x.beginPath(); x.ellipse(w / 2, h * 0.86, w * 0.3, h * 0.24, 0, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,170,190,0.5)'; x.beginPath(); x.ellipse(w * 0.45, h * 0.8, w * 0.1, h * 0.06, 0, 0, TAU); x.fill();
  x.fillStyle = '#fbf6ff'; x.beginPath(); x.roundRect ? x.roundRect(w * 0.56, h * 0.02, w * 0.12, h * 0.17, 4) : x.rect(w * 0.56, h * 0.02, w * 0.12, h * 0.17); x.fill();   // one little tooth
  x.restore(); x.strokeStyle = '#7d4f9e'; x.lineWidth = w * 0.05; x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.45, h * 0.45, 0, 0, TAU); x.stroke(); }, 128, 128); }
function alLineTex(curve) { return g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.lineCap = 'round'; x.strokeStyle = '#5a2e6e'; x.lineWidth = h * 0.13;
  x.beginPath(); x.moveTo(w * 0.12, h * (0.5 - curve * 0.25)); x.quadraticCurveTo(w * 0.5, h * (0.5 + curve * 0.32), w * 0.88, h * (0.5 - curve * 0.25)); x.stroke(); }, 256, 64); }
// the bedroom wall, painted out of focus: window with two moons, shelves and toys, a poster, a lamp, a bed
function alRoomTex() { const w = 900, h = 1500, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), R = RNG('alroom');
  const FX = (f) => (0.183 + 0.634 * f) * w, FY = (f) => (0.152 + 0.677 * f) * h;   // frame fractions -> canvas
  let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1c1838'); g.addColorStop(0.55, '#171230'); g.addColorStop(1, '#0d0a1c'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 120; k++) { x.fillStyle = 'rgba(190,170,255,0.08)'; const px = R.r(0, w), py = R.r(0, h * 0.75), s = R.r(3, 6); x.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, rr = i % 2 ? s * 0.45 : s; x.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); } x.fill(); }   // star wallpaper
  blot(x, FX(0.08), FY(0.42), w * 0.35, 'rgba(255,170,90,0.22)'); blot(x, FX(0.95), FY(0.3), w * 0.3, 'rgba(90,200,220,0.2)');
  // the window (right): a strange night sky, two moons, unfamiliar stars
  const wx0 = FX(0.75), wx1 = FX(1.1), wy0 = FY(0.1), wy1 = FY(0.42);
  g = x.createLinearGradient(0, wy0, 0, wy1); g.addColorStop(0, '#0e4a6e'); g.addColorStop(0.6, '#3a3a8e'); g.addColorStop(1, '#8a4a9a'); x.fillStyle = g; x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  blot(x, (wx0 + wx1) / 2, wy0 + (wy1 - wy0) * 0.45, (wx1 - wx0) * 0.6, 'rgba(120,255,200,0.12)');
  for (let k = 0; k < 70; k++) { const px = R.r(wx0, wx1), py = R.r(wy0, wy1), s = R.r(1, 3.5); x.fillStyle = R.pick(['#ffffff', '#ffd0f0', '#a0f0ff', '#fff0a0']); x.fillRect(px, py, s, s); if (s > 2.8) { x.fillRect(px - s * 2, py + s / 2 - 0.5, s * 5, 1); x.fillRect(px + s / 2 - 0.5, py - s * 2, 1, s * 5); } }
  const moon = (mx, my, r, c0, c1, ring) => { blot(x, mx, my, r * 2.6, c0.replace('1)', '0.35)')); const mg = x.createRadialGradient(mx - r * 0.3, my - r * 0.3, r * 0.1, mx, my, r); mg.addColorStop(0, c0); mg.addColorStop(1, c1); x.fillStyle = mg; x.beginPath(); x.arc(mx, my, r, 0, TAU); x.fill();
    if (ring) { x.strokeStyle = 'rgba(255,220,250,0.6)'; x.lineWidth = 4; x.beginPath(); x.ellipse(mx, my, r * 1.9, r * 0.45, -0.35, 0, TAU); x.stroke(); } };
  moon(FX(0.92), FY(0.19), w * 0.055, 'rgba(255,236,214,1)', 'rgba(230,150,170,1)', true); moon(FX(0.84), FY(0.32), w * 0.026, 'rgba(200,255,240,1)', 'rgba(90,190,180,1)', false);
  for (let k = 0; k < 6; k++) { x.fillStyle = 'rgba(180,100,130,0.35)'; x.beginPath(); x.arc(FX(0.92) + R.n(w * 0.035), FY(0.19) + R.n(w * 0.035), R.r(3, 8), 0, TAU); x.fill(); }
  x.strokeStyle = '#5a4470'; x.lineWidth = 18; x.strokeRect(wx0, wy0, wx1 - wx0, wy1 - wy0); x.lineWidth = 10; x.beginPath(); x.moveTo(wx0, (wy0 + wy1) / 2); x.lineTo(wx1, (wy0 + wy1) / 2); x.moveTo((wx0 + wx1) / 2, wy0); x.lineTo((wx0 + wx1) / 2, wy1); x.stroke();
  x.fillStyle = 'rgba(120,70,140,0.9)'; x.fillRect(wx0 - 40, wy0 - 20, 46, wy1 - wy0 + 80);   // curtain edge
  // a poster (left, top): a ringed planet
  x.fillStyle = '#2a3a6a'; x.fillRect(FX(-0.05), FY(0.1), FX(0.2) - FX(-0.05), FY(0.27) - FY(0.1)); blot(x, FX(0.08), FY(0.18), w * 0.07, 'rgba(255,150,90,0.8)'); x.strokeStyle = 'rgba(255,220,160,0.7)'; x.lineWidth = 3; x.beginPath(); x.ellipse(FX(0.08), FY(0.18), w * 0.09, w * 0.02, -0.3, 0, TAU); x.stroke();
  // shelves with toys (left), lit warm by a lamp
  for (const sy of [0.36, 0.5]) { x.fillStyle = '#4a2e2a'; x.fillRect(FX(-0.1), FY(sy), FX(0.24) - FX(-0.1), 12); x.fillStyle = 'rgba(255,190,120,0.25)'; x.fillRect(FX(-0.1), FY(sy) - 2, FX(0.24) - FX(-0.1), 3); }
  const bx = (fx, fy, bw, bh, col) => { x.fillStyle = col; x.fillRect(FX(fx), FY(fy) - bh, bw, bh); };
  bx(-0.06, 0.36, 18, 70, '#c84a5a'); bx(-0.03, 0.36, 16, 60, '#3a8aa0'); bx(-0.005, 0.36, 20, 76, '#e8b040'); bx(0.025, 0.36, 14, 56, '#8a5ac0');
  x.fillStyle = '#d06040'; x.beginPath(); x.moveTo(FX(0.12), FY(0.36) - 110); x.lineTo(FX(0.12) + 22, FY(0.36) - 40); x.lineTo(FX(0.12) + 22, FY(0.36)); x.lineTo(FX(0.12) - 22, FY(0.36)); x.lineTo(FX(0.12) - 22, FY(0.36) - 40); x.fill();   // toy rocket
  x.fillStyle = '#9adfe8'; x.beginPath(); x.arc(FX(0.12), FY(0.36) - 55, 9, 0, TAU); x.fill();
  x.fillStyle = '#7a8a9a'; x.fillRect(FX(-0.02), FY(0.5) - 60, 46, 40); x.fillRect(FX(-0.02) + 6, FY(0.5) - 20, 34, 20); x.fillStyle = '#90ffd0'; x.fillRect(FX(-0.02) + 10, FY(0.5) - 48, 8, 8); x.fillRect(FX(-0.02) + 28, FY(0.5) - 48, 8, 8);   // robot
  x.fillStyle = '#3a7a4a'; for (let k = 0; k < 7; k++) { x.beginPath(); x.ellipse(FX(0.16) + R.n(18), FY(0.5) - 40 - R.r(0, 30), 10, 22, R.n(0.8), 0, TAU); x.fill(); } x.fillStyle = '#b06a4a'; x.fillRect(FX(0.16) - 16, FY(0.5) - 30, 32, 30);   // plant
  blot(x, FX(0.06), FY(0.62), w * 0.12, 'rgba(255,120,200,0.55)'); x.fillStyle = '#ff7ac8'; x.beginPath(); x.ellipse(FX(0.06), FY(0.62), 18, 40, 0, 0, TAU); x.fill();   // lava lamp
  // the bed (low, right) and a plush toy
  x.fillStyle = '#2c2050'; x.fillRect(FX(0.7), FY(0.66), FX(1.1) - FX(0.7), h); x.fillStyle = '#3a2c68'; for (let k = 0; k < 6; k++) x.fillRect(FX(0.7), FY(0.68) + k * 40, FX(1.1) - FX(0.7), 14);
  x.fillStyle = '#e08ab0'; x.beginPath(); x.arc(FX(0.92), FY(0.62), 34, 0, TAU); x.fill(); x.beginPath(); x.arc(FX(0.92) - 24, FY(0.62) - 30, 12, 0, TAU); x.arc(FX(0.92) + 24, FY(0.62) - 30, 12, 0, TAU); x.fill();
  // a far string of lights along the wall (bokeh later on top)
  for (let k = 0; k < 16; k++) { const fx = -0.1 + k * 0.08, fy = 0.3 + 0.05 * Math.sin(k * 0.8); blot(x, FX(fx), FY(fy), 26, R.pick(['rgba(255,200,120,0.6)', 'rgba(255,120,200,0.6)', 'rgba(120,220,255,0.6)'])); }
  const o = document.createElement('canvas'); o.width = w; o.height = h; const ox = o.getContext('2d'); ox.filter = 'blur(9px)'; ox.drawImage(c, 0, 0); ox.filter = 'none';
  const t = new THREE.CanvasTexture(o); t.encoding = THREE.sRGBEncoding; return t; }
function alBokehTex() { return g3Tex((x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.72, 'rgba(255,255,255,0.7)'); g.addColorStop(0.86, 'rgba(255,255,255,0.95)'); g.addColorStop(0.93, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); }, 128, 128); }

// ---- build
function alBuild() { return once('alien', () => {
  const st = makeStage({ fov: 40, sky: 0x8a78c8, ground: 0x2a1a34, hemi: 0.45, key: 1.7, keyCol: 0xd6e4ff, box: 4.5, boxFar: 60, sunDist: 22, far: 100 });
  const S = { st }; const sc = st.scene;
  skyEnv(st, '#2a2050', '#4a3060', new THREE.Vector3(-0.3, 0.4, 1), '#e0ecff');
  const rimW = new THREE.DirectionalLight('#ffb070', 1.5); rimW.position.set(-6, 7, -7); const rimP = new THREE.DirectionalLight('#ff78c8', 1.1); rimP.position.set(7, 3, -6);
  const fillL = new THREE.PointLight('#ffb070', 0.3, 14, 2); fillL.position.set(-3.5, -1, 1.5); sc.add(rimW, rimP, fillL); S.rimW = rimW;
  st.setSun(new THREE.Vector3(0.25, 0.35, 1), new THREE.Vector3(0, -1, 0));
  const spot = new THREE.SpotLight('#d6e4ff', 2.2, 0, 0.3, 0.95, 0); spot.position.set(2.6, 2.6, 12.5); spot.target.position.set(0, -0.3, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0004; spot.shadow.radius = 3; sc.add(spot, spot.target); S.spot = spot; st.key.castShadow = false;
  // materials
  const faceMap = alFaceTex();
  const skinO = { color: AL_SKIN, roughness: 0.52, sheen: 0.7, sheenColor: new THREE.Color('#f0d0ff'), sheenRoughness: 0.45, clearcoat: 0.12, clearcoatRoughness: 0.45, emissive: new THREE.Color('#2a0c3a'), emissiveIntensity: 0.3 };
  const skinF = new THREE.MeshPhysicalMaterial(Object.assign({ map: faceMap }, skinO)), skin = new THREE.MeshPhysicalMaterial(skinO), skinD = new THREE.MeshPhysicalMaterial(Object.assign({}, skinO, { side: THREE.DoubleSide }));
  S.skinMats = [skinF, skin, skinD];
  // root / neck pivot / head
  const body = new THREE.Group(); sc.add(body); S.body = body;
  const pivot = new THREE.Group(); pivot.position.set(0, -0.85, 0); body.add(pivot); const head = new THREE.Group(); head.position.set(0, 0.85, 0); pivot.add(head); S.pivot = pivot; S.head = head;
  { const g = new THREE.SphereGeometry(1, 160, 120), p = g.attributes.position, nr = g.attributes.normal, uv = g.attributes.uv, d = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { d.fromBufferAttribute(p, i).normalize(); const q = alF(d), n = alNorm(d); p.setXYZ(i, q.x, q.y, q.z); nr.setXYZ(i, n.x, n.y, n.z); uv.setXY(i, q.x * 0.45 + 0.5, q.y * 0.45 + 0.5); }
    head.add(mesh(g, skinF)); }
  // the eyes: two big ones low, one on the forehead
  S.eyes = [];
  const mkEye = (fx, fy, r, yaw, key, cols) => { const s = alSurf(fx, fy), sock = new THREE.Group(); sock.position.copy(s.p).addScaledVector(s.n, -r * 0.62); sock.rotation.set(-fy * 0.25, yaw, 0, 'YXZ'); head.add(sock);
    const tex = alEyeTex(key, ...cols), ball = new THREE.Group(); sock.add(ball);
    ball.add(mesh(new THREE.SphereGeometry(r, 64, 48).rotateX(Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.12, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03 }), 0, 0, 0, { cast: false }));
    const lidG = (cap) => { const g = new THREE.Group(); sock.add(g); g.add(mesh(cap, skinD, 0, 0, 0, { cast: false })); return g; };
    const up = lidG(new THREE.SphereGeometry(r * 1.045, 64, 24, 0, TAU, 0, Math.PI / 2)), lo = lidG(new THREE.SphereGeometry(r * 1.04, 64, 12, 0, TAU, Math.PI - 1.15, 1.15));
    const lash = mesh(new THREE.TorusGeometry(r * 1.045, r * 0.05, 10, 48, Math.PI).rotateX(Math.PI / 2), STDm({ color: '#4a2a66', roughness: 0.6 }), 0, 0, 0, { cast: false }); up.add(lash);
    const lrim = mesh(new THREE.TorusGeometry(r * 1.04 * Math.sin(1.15), r * 0.03, 8, 48, Math.PI).rotateX(Math.PI / 2), skin, 0, -r * 1.04 * Math.cos(1.15), 0, { cast: false }); lo.add(lrim);
    const hlM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95 }), hl = [];
    for (const [hx, hy, hs] of [[-0.42, 0.5, 0.2], [0.34, -0.26, 0.09]]) { const d = new THREE.Vector3(hx, hy, Math.sqrt(1 - hx * hx - hy * hy)), m = new THREE.Mesh(new THREE.SphereGeometry(r * hs, 16, 12).scale(1, 0.8, 0.25), hlM); m.position.copy(d).multiplyScalar(r * 1.012); alOrient(m, d, -0.5); sock.add(m); hl.push([m, Math.asin(hy)]); }
    const E = { sock, ball, up, lo, hl, r }; S.eyes.push(E); return E; };
  const irisA = ['#ffe080', '#36d6c0', '#0d6a7a'];
  mkEye(-0.37, 0.0, 0.29, -0.2, 'eyeL', irisA); mkEye(0.37, 0.0, 0.29, 0.2, 'eyeR', irisA); mkEye(0, 0.54, 0.235, 0, 'eyeT', ['#fff0a0', '#7ae070', '#1a7a5a']);
  // brows
  S.brows = [-1, 1].map((s) => { const m = mesh(new THREE.CapsuleGeometry(0.034, 0.17, 6, 12).rotateZ(Math.PI / 2), STDm({ color: '#6a3f96', roughness: 0.7 }), 0, 0, 0, { cast: false }); head.add(m); return { m, s }; });
  // nose: a tiny button
  { const s = alSurf(0, -0.27, -0.03), m = mesh(new THREE.SphereGeometry(0.075, 24, 16).scale(1.15, 0.8, 0.75), skin); m.position.copy(s.p); alOrient(m, s.n); head.add(m); }
  // mouth decals: an oval ("oh") and a line (smile / frown)
  const mM = new THREE.MeshStandardMaterial({ map: alMouthTex(), transparent: true, roughness: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  S.mouth = alDecal(mM); head.add(S.mouth);
  S.smile = alDecal(new THREE.MeshStandardMaterial({ map: alLineTex(1), transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); head.add(S.smile);
  S.frown = alDecal(new THREE.MeshStandardMaterial({ map: alLineTex(-0.7), transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); head.add(S.frown);
  alLayDecal(S.smile, 0, -0.55, 0.17, 0.045); alLayDecal(S.frown, 0, -0.56, 0.13, 0.04);
  // antennae with glowing tips
  S.ant = [-1, 1].map((s) => { const d = new THREE.Vector3(s * 0.36, 0.92, 0.1).normalize(), base = alF(d), g = new THREE.Group(); g.position.copy(base).multiplyScalar(0.97); head.add(g);
    const pts = [[0, 0, 0], [s * 0.06, 0.22, 0.0], [s * 0.2, 0.42, 0.04], [s * 0.36, 0.53, 0.1]].map((a) => new THREE.Vector3(...a)), cv = new THREE.CatmullRomCurve3(pts);
    const tg = new THREE.TubeGeometry(cv, 40, 0.04, 14), tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) { /* taper toward the tip */ const k = Math.floor(i / 15) / 40, c = cv.getPointAt(Math.min(1, k)); _v.fromBufferAttribute(tp, i).sub(c).multiplyScalar(1 - 0.45 * k).add(c); tp.setXYZ(i, _v.x, _v.y, _v.z); } tg.computeVertexNormals();
    g.add(mesh(tg, skin)); const tipP = pts[3], bulb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), new THREE.MeshStandardMaterial({ color: '#c8fff0', emissive: '#7dffd8', emissiveIntensity: 1.6, roughness: 0.3 })); bulb.position.copy(tipP); g.add(bulb);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#70ffd0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); gl.position.copy(tipP); gl.scale.setScalar(0.55); g.add(gl);
    return { g, s, bulb, gl }; });
  // neck, sweater (striped knit), collar, arms
  body.add(mesh(new THREE.CylinderGeometry(0.31, 0.36, 0.5, 32), skin, 0, -0.95, -0.06));
  const knit = alKnit(['#c98e1e', '#c98e1e', '#c98e1e', '#c98e1e', '#c98e1e', '#c98e1e', '#c4b28e', '#1f6f6e', '#1f6f6e', '#1f6f6e', '#1f6f6e', '#1f6f6e', '#1f6f6e', '#c4b28e', '#c98e1e', '#c98e1e']);
  knit.wrapS = knit.wrapT = THREE.RepeatWrapping; const sweM = STDm({ map: knit, bumpMap: knit, bumpScale: 0.012, roughness: 0.95 }); S.sweM = sweM;
  const tUV = (g, fu) => { const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); uv.setXY(i, fu(x, y, z, i), y / 0.9); } return g; };
  const prof = [[0.001, -1.12], [0.4, -1.12], [0.66, -1.2], [1.0, -1.32], [1.26, -1.5], [1.42, -1.76], [1.5, -2.15], [1.52, -2.8], [1.5, -3.7], [1.46, -4.9], [1.42, -6.2]];
  const tor = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 96).rotateY(Math.PI).scale(1, 1, 0.68);
  tUV(tor, (x, y, z, i) => Math.floor(i / prof.length) / 96 * 8); tor.computeVertexNormals(); const torso = mesh(tor, sweM, 0, 0, -0.1); body.add(torso); S.torso = torso;
  const ribT = g3Tex((x, w, h) => { x.fillStyle = '#d89a28'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(i, 0, 3, h); x.fillStyle = 'rgba(255,240,200,0.18)'; x.fillRect(i + 4, 0, 2, h); } }, 256, 32);
  ribT.wrapS = THREE.RepeatWrapping; ribT.repeat.set(4, 1); const ribM = STDm({ map: ribT, bumpMap: ribT, bumpScale: 0.01, roughness: 0.95 }); S.ribM = ribM;
  const col = mesh(new THREE.TorusGeometry(0.42, 0.14, 20, 64).rotateX(Math.PI / 2).scale(1, 1, 0.82), ribM, 0, -1.1, -0.08); body.add(col);
  // the right arm (screen left): a sleeve tube rebuilt each frame from the shoulder to the hand holding the remote
  S.sleeve = mesh(new THREE.BufferGeometry(), sweM); body.add(S.sleeve);
  S.cuff = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 32, 1, true), ribM); S.cuff.material = ribM.clone(); S.cuff.material.side = THREE.DoubleSide; body.add(S.cuff);
  // the hand + remote ("grip" space: remote long axis +y toward its tip, buttons on +z; the palm on +x, fingers wrap under)
  const grip = new THREE.Group(); body.add(grip); S.grip = grip;
  const remM = new THREE.MeshPhysicalMaterial({ color: '#14151d', roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.4 });
  grip.add(mesh(roundedBox(0.2, 0.86, 0.08, 0.035, 6), remM, 0, 0.05, 0));
  const btn = (x, y, r, c, e = 0) => { const m = mesh(new THREE.CylinderGeometry(r, r, 0.025, 20).rotateX(Math.PI / 2), STDm({ color: c, roughness: 0.4, emissive: c, emissiveIntensity: e }), x, y, 0.045, { cast: false }); grip.add(m); return m; };
  S.power = btn(0, 0.41, 0.03, '#e03a3a', 0.4);
  grip.add(mesh(new THREE.TorusGeometry(0.06, 0.016, 10, 28), STDm({ color: '#5a5a6a', roughness: 0.4 }), 0, 0.25, 0.045));
  btn(0, 0.25, 0.028, '#7a7a8a');
  S.rwBtn = btn(-0.035, 0.1, 0.033, '#ffb43a', 0.15); btn(0.045, 0.1, 0.026, '#6a6a7a');
  [['#e04848', -0.06], ['#40c060', -0.02], ['#e8c040', 0.02], ['#4080e0', 0.06]].forEach(([c, x]) => btn(x, -0.02, 0.015, c, 0.2));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) btn(-0.05 + k * 0.05, -0.1 - r * 0.055, 0.017, '#55556a');
  S.led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 14, 10), new THREE.MeshStandardMaterial({ color: '#601020', emissive: '#ff2a3a', emissiveIntensity: 0.1 })); S.led.position.set(0, 0.485, 0.0); grip.add(S.led);
  S.ledGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff4060', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); S.ledGlow.position.copy(S.led.position); S.ledGlow.scale.setScalar(0.6); grip.add(S.ledGlow);
  S.btnGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffb040', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); S.btnGlow.position.set(-0.035, 0.1, 0.07); S.btnGlow.scale.setScalar(0.22); grip.add(S.btnGlow);
  // palm + three fingers wrapping under the remote + a thumb over the top
  grip.add(mesh(new THREE.SphereGeometry(1, 32, 24).scale(0.15, 0.24, 0.13), skin, 0.12, -0.2, -0.04));
  const tube = (pts, r) => { const cv = new THREE.CatmullRomCurve3(pts.map((a) => new THREE.Vector3(...a))), g = new THREE.Group(); g.add(mesh(new THREE.TubeGeometry(cv, 20, r, 12), skin)); g.add(mesh(new THREE.SphereGeometry(r, 16, 12), skin, ...pts[pts.length - 1])); return g; };
  [0.0, -0.13, -0.26].forEach((y, i) => grip.add(tube([[0.14, y - 0.06, -0.06], [0.06, y, -0.115], [-0.07, y, -0.1], [-0.125, y + 0.01, -0.02], [-0.115, y + 0.02, 0.03]], 0.052 - i * 0.004)));
  S.thumbG = new THREE.Group(); S.thumbG.position.set(0.15, -0.26, 0.02); grip.add(S.thumbG);
  S.thumbG.add(tube([[0, 0, 0], [-0.05, 0.14, 0.075], [-0.185, 0.36, 0.09]], 0.05)); S.thumbG.add(mesh(new THREE.SphereGeometry(0.07, 18, 14), skin, 0, 0, 0));
  grip.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.25, 20), skin, 0.08, -0.45, -0.04));   // wrist into the cuff
  // the room: a painted out-of-focus wall, string lights, bokeh
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 15.8), new THREE.MeshBasicMaterial({ map: alRoomTex() })); wall.position.set(0, -0.9, -7); sc.add(wall);
  const R = RNG('allights'), BC = ['#ffcf7a', '#ff7ab8', '#7ad8ff', '#b58aff', '#ff9a5a', '#a8ff8a'];
  { const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, x = lerp(-3.6, 3.6, u), sag = Math.sin(u * TAU * 1.5 % Math.PI); pts.push(new THREE.Vector3(x, 2.85 - 0.35 * Math.abs(Math.sin(u * Math.PI * 2.2)), -2.6 + 0.4 * Math.sin(u * 5))); }
    const cv = new THREE.CatmullRomCurve3(pts); sc.add(mesh(new THREE.TubeGeometry(cv, 200, 0.012, 6), STDm({ color: '#1a1420' }), 0, 0, 0, { cast: false }));
    const bm = new THREE.SphereGeometry(0.075, 16, 12).scale(1, 1.25, 1), gt = glowTex(); S.bulbs = [];
    for (let k = 0; k <= 26; k++) { const p = cv.getPointAt(k / 26), c = BC[k % BC.length], b = new THREE.Mesh(bm, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.1 })); b.position.copy(p).add(new THREE.Vector3(0, -0.08, 0)); sc.add(b);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.75 })); sp.position.copy(b.position); sp.scale.setScalar(0.85); sc.add(sp); S.bulbs.push([b, sp, R.r(0, TAU)]); } }
  { const bt = alBokehTex(); S.bokeh = [];
    for (let k = 0; k < 46; k++) { const c = R.pick(BC), z = R.r(-6.5, -4), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bt, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: R.r(0.12, 0.32) }));
      let x = R.r(-4.5, 4.5), y = R.r(-6, 4.4); if (k < 18) y = R.r(1.5, 4.6); sp.position.set(x, y, z); sp.scale.setScalar(R.r(0.35, 0.9)); sc.add(sp); S.bokeh.push([sp, sp.material.opacity, R.r(0, TAU)]); } }
  return S; }); }

// ---- the performance (a pure function of t)
const alKick = (t, te, amp, f = 11, dmp = 4) => (t > te ? amp * Math.exp(-(t - te) * dmp) * Math.sin((t - te) * f) : 0);
function alBlink(t, t0, dc = 0.16, dh = 0.06, dop = 0.22) { return t < t0 || t > t0 + dc + dh + dop ? 0 : t < t0 + dc ? EZ.io(seg(t, t0, t0 + dc)) : t < t0 + dc + dh ? 1 : 1 - EZ.io(seg(t, t0 + dc + dh, t0 + dc + dh + dop)); }
function poseAlien(S, t) {
  const st = S.st, br = Math.sin(t * 2.4);
  // the screen light: the white glow of the edge, flickering; the string lights twinkle
  const scr = (1 + 0.6 * (1 - ss(62, 63.2, t))) * (1 + 0.05 * Math.sin(t * 13) + 0.035 * Math.sin(t * 31.7)); st.key.intensity = 0.4 * scr; S.spot.intensity = 1.5 * scr;
  S.bulbs.forEach(([b, sp, ph]) => { const k = 0.85 + 0.15 * Math.sin(t * 2 + ph); b.material.emissiveIntensity = 1.1 * k; sp.material.opacity = 0.7 * k; });
  S.bokeh.forEach(([sp, o, ph]) => (sp.material.opacity = o * (0.8 + 0.2 * Math.sin(t * 1.3 + ph))));
  // body: breathing, a small lean in when surprised, back when aiming
  S.body.position.set(0.02 * Math.sin(t * 0.7), 0.02 * br, knots([[62, 0], [63.4, 0], [63.7, -0.08], [64.5, -0.12], [65.6, 0.05], [66.6, 0.14], [67, 0.12]], t));
  S.torso.scale.set(1 + 0.006 * br, 1, 1 + 0.01 * br);
  // head: tilt, look around, the jolt at "oh"
  const yaw = knots([[62, 0.12], [62.7, 0.02], [63.4, 0.0], [64.4, 0.02], [65.2, -0.05], [65.8, 0.03], [67, 0.0]], t) + 0.012 * Math.sin(t * 1.1);
  const roll = knots([[62, 0.1], [62.8, 0.14], [63.5, 0.04], [64.4, -0.02], [65.0, -0.16], [65.6, -0.07], [66.3, 0.05], [67, 0.06]], t) + alKick(t, 64.5, 0.02);
  const pitch = knots([[62, 0.02], [63.4, 0.0], [63.7, -0.06], [64.5, -0.08], [65.4, -0.04], [65.9, 0.07], [67, 0.06]], t) - alKick(t, 64.5, 0.05, 14, 5) + 0.01 * br;
  S.pivot.rotation.set(pitch, yaw, roll, 'YXZ');
  // eyes: lids (upper α: -0.85 open, +0.45 shut), lower lids, look directions [yaw, up]
  const wide = ss(63.35, 63.6, t) * (1 - ss(65.35, 65.7, t)), frown = ss(65.4, 65.8, t), press = ss(66.5, 66.62, t) * (1 - ss(66.85, 67.1, t));
  const blinkL = alBlink(t, 62.7, 0.2, 0.08, 0.28), blinkT = Math.max(alBlink(t, 62.82, 0.2, 0.08, 0.28), alBlink(t, 65.2, 0.09, 0.03, 0.12), alBlink(t, 64.05, 0.08, 0.02, 0.1));
  const look = (K) => [knots(K.map(([tt, a]) => [tt, a]), t), knots(K.map(([tt, , b]) => [tt, b]), t)];
  const LL = look([[62, -0.25, 0.08], [62.55, 0, 0], [63.65, 0, 0], [63.85, 0.42, 0.42], [64.2, 0.42, 0.42], [64.35, 0, 0], [65.5, 0, 0], [65.7, 0.1, -0.25], [66.0, 0.1, -0.25], [66.2, 0, 0.02], [67, 0, 0]]);
  const LR = look([[62, -0.25, 0.08], [62.55, 0, 0], [63.65, 0, 0], [63.85, -0.42, 0.42], [64.2, -0.42, 0.42], [64.35, 0, 0], [65.5, 0, 0], [65.7, 0.1, -0.25], [66.0, 0.1, -0.25], [66.2, 0, 0.02], [67, 0, 0]]);
  const LT = look([[62, 0.3, 0.2], [62.5, 0.3, 0.2], [62.7, 0, 0], [63.6, 0, 0], [63.8, -0.4, -0.45], [63.98, -0.4, -0.45], [64.12, 0.4, -0.45], [64.26, 0.4, -0.45], [64.4, 0, 0], [65.5, 0, 0], [65.7, 0.2, -0.45], [66.1, 0.2, -0.45], [66.3, 0, 0], [67, 0, 0]]);
  const sacc = 0.015 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
  S.eyes.forEach((E, i) => { const L = i === 0 ? LL : i === 1 ? LR : LT, bl = i === 2 ? blinkT : blinkL;
    E.ball.rotation.set(-L[1] - sacc, L[0] + sacc, 0, 'YXZ');
    const open = lerp(-0.82, -1.22, wide) * (1 - frown) + lerp(-0.82, i === 2 ? -0.5 : -0.62, frown) * frown + 0.18 * press - (i === 2 ? 0.05 : 0);
    const a = lerp(open, 0.45, bl); E.up.rotation.x = a; E.lo.rotation.x = lerp(0.04, 0.18, wide) - 0.08 * frown - 0.06 * press + 0.1 * bl;
    E.hl.forEach(([m, el]) => (m.visible = -a > el + 0.12)); });
  // brows: up when surprised; inner ends down in the frown
  S.brows.forEach(({ m, s }) => { const y = 0.43 + 0.07 * wide + 0.05 * ss(64.45, 64.6, t) * (1 - frown) - 0.05 * frown - 0.02 * press, x = s * (0.47 - 0.04 * frown), sp = alSurf(x, y, 0.012); m.position.copy(sp.p); alOrient(m, sp.n, s * (-0.3 - 0.15 * wide + 0.95 * frown)); });
  // mouth: a smile line → "oh" → a small o → a pursed frown
  const op = knots([[62, 0], [64.38, 0], [64.56, 1.0], [65.25, 0.85], [65.6, 0.3], [66.2, 0.22], [66.45, 0], [67, 0]], t) * (1 + 0.04 * Math.sin(t * 9));
  const mw = lerp(0.04, 0.16, op), mh = lerp(0.03, 0.2, op); S.mouth.visible = op > 0.06; if (S.mouth.visible) alLayDecal(S.mouth, 0, -0.55 - 0.03 * op, mw, mh, 0.004);
  const lineK = 1 - ss(0.04, 0.2, op); S.smile.material.opacity = lineK * (1 - frown); S.frown.material.opacity = lineK * frown; S.smile.visible = S.smile.material.opacity > 0.01; S.frown.visible = S.frown.material.opacity > 0.01;
  // antennae: springy, perk up on surprise
  S.ant.forEach(({ g, s, bulb, gl }) => { const perk = 0.25 * wide + 0.2 * ss(64.45, 64.7, t) * (1 - frown) - 0.15 * frown;
    g.rotation.set(-perk * 0.6 + alKick(t, 64.5, 0.14, 13, 3.5) + alKick(t, 63.45, 0.1, 12, 4) + 0.03 * Math.sin(t * 2.2 + s), 0, s * (0.1 - perk * 0.5 + 0.035 * Math.sin(t * 1.7 + s)) + alKick(t, 66.6, 0.08 * s, 15, 5));
    const glow = 1 + 0.6 * wide + 0.8 * press + 0.15 * Math.sin(t * 3 + s); bulb.material.emissiveIntensity = 1.4 * glow; gl.material.opacity = 0.6 * glow; gl.scale.setScalar(0.5 + 0.12 * glow); });
  // the hand + remote: resting low, then raised toward the screen at 65.5; the thumb presses rewind at 66.6
  const up = EZ.io(seg(t, 65.55, 66.35)), idle = 0.02 * Math.sin(t * 1.6);
  const P = new THREE.Vector3(lerp(-0.62, -0.6, up), lerp(-2.95, -1.65, up) + idle, lerp(1.7, 3.1, up)), f = new THREE.Vector3(lerp(0.15, 0.7, up), lerp(0.75, 0.3, up), lerp(0.65, 0.65, up)).normalize();
  f.x += 0.03 * Math.sin(t * 1.3); f.y += alKick(t, 66.6, -0.06, 18, 6); f.normalize();
  const u0 = new THREE.Vector3(0, 1, 1.15 * up).normalize(), zl = u0.clone().addScaledVector(f, -u0.dot(f)).normalize(), xl = new THREE.Vector3().crossVectors(f, zl);
  S.grip.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xl, f, zl)); S.grip.position.copy(P);
  const th = knots([[62, 0.0], [66.4, 0.0], [66.6, 1], [66.85, 1], [67, 0.6]], t); S.thumbG.rotation.set(lerp(0.3, 0, th), 0, 0);
  S.rwBtn.material.emissiveIntensity = 0.15 + 2.2 * press; S.btnGlow.material.opacity = 0.6 * press;
  const ir = ss(66.6, 66.66, t) * (1 - ss(66.9, 67, t)) * (0.75 + 0.25 * Math.sin(t * 60)); S.led.material.emissiveIntensity = 0.1 + 4 * ir; S.ledGlow.material.opacity = ir; S.ledGlow.scale.setScalar(0.2 + 0.35 * ir);
  // the sleeve: shoulder → elbow → the wrist behind the hand
  S.body.updateMatrixWorld(true); const wr = S.grip.localToWorld(new THREE.Vector3(0.08, -0.52, -0.04)), wb = S.grip.localToWorld(new THREE.Vector3(0.08, -0.58, -0.04));
  const wl = S.body.worldToLocal(wr.clone()), wbl = S.body.worldToLocal(wb.clone()), dir = wl.clone().sub(wbl).normalize();
  const sh = new THREE.Vector3(-0.95, -2.5, -0.25), el = new THREE.Vector3(lerp(-1.55, -1.5, up), lerp(-4.0, -3.5, up), lerp(0.5, 1.0, up));
  const cv = new THREE.CatmullRomCurve3([sh, new THREE.Vector3(-1.3, -3.0, 0.05), el, wl.clone().addScaledVector(dir, -0.45), wl]), g = new THREE.TubeGeometry(cv, 48, 0.27, 20);
  { const tp = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < tp.count; i++) { const k = Math.floor(i / 21) / 48, c = cv.getPointAt(Math.min(1, k)); _v.fromBufferAttribute(tp, i).sub(c).multiplyScalar(1 - 0.28 * k).add(c); tp.setXYZ(i, _v.x, _v.y, _v.z); uv.setXY(i, (i % 21) / 20 * 3, k * cv.getLength() / 0.9); } g.computeVertexNormals(); }
  S.sleeve.geometry.dispose(); S.sleeve.geometry = g;
  S.cuff.position.copy(wl); S.cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
}

SHOT_FN.alien = (lt, dur, t) => {
  const S = alBuild(), st = S.st; poseAlien(S, t);
  const push = EZ.io(seg(t, 62, 67));
  camLook(st.cam, 0.04 * Math.sin(t * 0.6), -0.75 + 0.03 * Math.sin(t * 0.9), lerp(8.0, 7.4, push), 0, -0.85, 0); fov(st, 40); handheld(st.cam, t, 0.7, 4.2);
  renderStage(st, 0.95); bloom(0.42);
};
