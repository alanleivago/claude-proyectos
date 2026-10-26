// =====================================================================
//  SET beach — a Cornish beach the morning after a storm: s01 – s12.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed bch.
//  One world, built once. The shoreline runs along x at z -12; the sea goes off to -z (waves, surf bands that roll in,
//  a wash sheet that climbs the wet sand and slides back), wet glossy sand from -14 to -4 with tide pools and the sun's
//  streak, the wrack line of seaweed at z -3.5, dry rippled sand behind, cliffs on the left, a headland with a
//  lighthouse on the right, a sky breaking from grey to gold (or a black storm for s03, with rain and lightning).
//  The woman (yellow raincoat, long hair, red bucket) is a c3Person billboard at BCH_K; standing root at BCH_FOOT.
//  Lego pieces (black dragons, a flipper, a tiny life jacket, bricks) are chunky glossy 3D props at "real" size;
//  the macro shots (s07, s09, s10) use a big 3D cartoon mitten hand and a sharp sand patch on the focus layer.
// =====================================================================
const BCH = {};
const BCH_K = 1.35, BCH_FOOT = 2.55 * BCH_K;
const bchW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const bchV = (x, y, z) => new THREE.Vector3(x, y, z);
const bchSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function bchCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = bchSpan(id), dur = b - a;
  const P = bchV(...c.p), L = bchV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(bchV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const bchRack = (lt, id, a, b) => { const [t0, t1] = bchSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects placed in the WORLD at the shot's first frame (camera space `at`), then real parallax
function bchFg(s, list, K, id, lt, o = {}) {
  const c = BCH.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
  c3SetCam(c, bchCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = bchV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(bchV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const bchRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#c8a890', bgBlur: 2.2, nearBlur: 10, glow: 0.55, glowBlur: 18, bloom: 0.3 }, o));

// ---- textures
function bchTexSand(wet) {
  const t = tex((x, w, h) => {
    x.fillStyle = wet ? '#8a6a4a' : '#e2c08a'; x.fillRect(0, 0, w, h); const R = RNG('sand', wet ? 1 : 0);
    for (let i = 0; i < 14; i++) {   // ripples: soft curved bands
      const y = (i + 0.5) * h / 14; x.strokeStyle = wet ? 'rgba(60,40,24,0.28)' : 'rgba(170,130,80,0.35)'; x.lineWidth = R.r(4, 9);
      x.beginPath(); x.moveTo(0, y); for (let k = 1; k <= 8; k++) x.lineTo(k * w / 8, y + Math.sin(k * 1.3 + i) * 7 + R.n(3)); x.stroke();
      x.strokeStyle = wet ? 'rgba(200,170,140,0.18)' : 'rgba(255,240,205,0.4)'; x.lineWidth = 3;
      x.beginPath(); x.moveTo(0, y - 6); for (let k = 1; k <= 8; k++) x.lineTo(k * w / 8, y - 6 + Math.sin(k * 1.3 + i) * 7); x.stroke();
    }
    for (let i = 0; i < 2600; i++) { const v = R.r(-40, 40); x.fillStyle = wet ? `rgba(${120 + v},${95 + v},${70 + v},0.5)` : `rgba(${215 + v * 0.6},${185 + v * 0.6},${130 + v * 0.6},0.6)`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
    for (let i = 0; i < 40; i++) { x.fillStyle = R.f() < 0.5 ? 'rgba(250,245,235,0.8)' : 'rgba(90,80,75,0.6)'; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(2, 5), R.r(1.5, 3.5), R.r(0, 3), 0, TAU); x.fill(); }   // pebbles, shell bits
  }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function bchTexFoam(edge) {   // a band of surf foam: lacy blobs, alpha fading at the edges (edge = bright front at the canvas bottom)
  return c3Tex((x, w, h) => {
    const R = RNG('foam', edge ? 1 : 0); x.clearRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const yy = edge ? h - Math.abs(R.n(1)) ** 1.6 * h * 0.9 : h / 2 + R.n(1) * R.f() * h * 0.45, a = edge ? 0.25 + 0.6 * (yy / h) ** 3 : 0.6 * (1 - Math.abs(yy - h / 2) / (h / 2));
      x.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; x.beginPath(); x.ellipse(R.r(0, w), yy, R.r(4, 16), R.r(2, 6), 0, 0, TAU); x.fill();
    }
    if (edge) { x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = 7; x.beginPath(); x.moveTo(0, h - 8); for (let k = 1; k <= 24; k++) x.lineTo(k * w / 24, h - 8 - Math.abs(Math.sin(k * 1.7)) * 10); x.stroke(); }
  }, 512, 128);
}
function bchTexRock() {
  const t = tex((x, w, h) => { x.fillStyle = '#6e6258'; x.fillRect(0, 0, w, h); const R = RNG('rock');
    for (let i = 0; i < 70; i++) { x.fillStyle = `hsl(${R.r(15, 35)},${R.r(6, 16)}%,${R.r(26, 50)}%)`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(10, 50), R.r(6, 22), R.r(0, 3), 0, TAU); x.fill(); }
    x.strokeStyle = 'rgba(40,30,26,0.45)'; x.lineWidth = 3; for (let i = 0; i < 18; i++) { x.beginPath(); x.moveTo(R.r(0, w), R.r(0, h)); x.lineTo(R.r(0, w), R.r(0, h)); x.stroke(); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function bchTexStripes() {   // the lighthouse: white with two red bands
  return tex((x, w, h) => { x.fillStyle = '#f6f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8281e'; x.fillRect(0, h * 0.3, w, h * 0.16); x.fillRect(0, h * 0.62, w, h * 0.16); }, 64, 256);
}
function bchTexRadial(c0, c1) {
  return c3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 128, 128, false);
}
function bchTexWood() {
  const t = tex((x, w, h) => { x.fillStyle = '#8a6a50'; x.fillRect(0, 0, w, h); const R = RNG('drift');
    x.strokeStyle = 'rgba(60,40,28,0.45)'; for (let i = 0; i < 30; i++) { x.lineWidth = R.r(1, 3); const y = R.r(0, h); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(14), w * 2 / 3, y + R.n(14), w, y + R.n(8)); x.stroke(); }
    x.fillStyle = 'rgba(200,190,170,0.25)'; for (let i = 0; i < 12; i++) x.fillRect(R.r(0, w), R.r(0, h), R.r(20, 80), 3); }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// a calendar page: the year big, a little month grid (s12)
function bchPageDraw(x, w, h, year, last) {
  x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = last ? '#c8281e' : '#2a6ac8'; x.fillRect(0, 0, w, h * 0.22);
  inked(x, 'TIDE CALENDAR', w / 2, h * 0.11, h * 0.08, '#ffffff', { stroke: false, maxW: w * 0.84 });
  inked(x, String(year), w / 2, h * 0.42, h * 0.24, '#2a1a10', { stroke: false, maxW: w * 0.84, font: 'Georgia, serif' });
  x.fillStyle = 'rgba(60,40,30,0.55)'; x.font = `700 ${h * 0.04}px Arial`; x.textAlign = 'center';
  for (let d = 0; d < 28; d++) x.fillText(String(d + 1), w * (0.14 + (d % 7) * 0.12), h * (0.66 + Math.floor(d / 7) * 0.08));
  x.strokeStyle = 'rgba(60,40,30,0.25)'; x.lineWidth = 3; x.strokeRect(6, 6, w - 12, h - 12);
}
function bchPageTex(year, last) { return tex((x, w, h) => bchPageDraw(x, w, h, year, last), 256, 320); }
function bchTexSign30() {   // the painted sign that slams in under the calendar (s12): text kept inside the board
  return tex((x, w, h) => { x.fillStyle = '#f2e6c8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8281e'; x.lineWidth = 14; x.strokeRect(12, 12, w - 24, h - 24);
    inked(x, '30 YEARS', w / 2, h * 0.43, h * 0.42, '#c8281e', { stroke: '#5a1008', sw: h * 0.03, maxW: w * 0.82 });
    inked(x, 'AND COUNTING', w / 2, h * 0.79, h * 0.15, '#3a2418', { stroke: false, maxW: w * 0.7 }); }, 512, 256);
}

// ---- the raincoat: the mustard Flow body with the tie painted out, a placket, wooden toggles, flap pockets
function bchRaincoat(p) {
  const img = asset('spr_body_mustard.png'); if (!img) return;
  const t = c3Tex((x, w, h) => {
    x.drawImage(img, 0, 0, w, h);
    x.fillStyle = 'rgb(226,180,59)'; x.beginPath();   // the tie, painted out
    x.moveTo(w * 0.40, h * 0.15); x.lineTo(w * 0.62, h * 0.15); x.lineTo(w * 0.70, h * 0.56); x.lineTo(w * 0.52, h * 0.80); x.lineTo(w * 0.33, h * 0.56); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(150,100,24,0.9)'; x.lineWidth = w * 0.022; x.beginPath(); x.moveTo(w * 0.52, h * 0.2); x.lineTo(w * 0.52, h * 0.97); x.stroke();   // placket seam
    for (let k = 0; k < 4; k++) { const y = h * (0.3 + k * 0.15);   // toggles + loops
      x.strokeStyle = '#5a3a1a'; x.lineWidth = w * 0.014; x.beginPath(); x.moveTo(w * 0.42, y); x.lineTo(w * 0.62, y); x.stroke();
      x.fillStyle = '#7a4a22'; x.strokeStyle = '#3b2417'; x.lineWidth = w * 0.012; x.beginPath(); x.ellipse(w * 0.52, y, w * 0.07, h * 0.016, 0, 0, TAU); x.fill(); x.stroke(); }
    for (const px of [0.24, 0.80]) { x.strokeStyle = 'rgba(150,100,24,0.95)'; x.lineWidth = w * 0.018; x.beginPath(); x.roundRect(w * (px - 0.13), h * 0.66, w * 0.26, h * 0.12, 8); x.stroke(); }   // pocket flaps
  }, img.naturalWidth || img.width, img.naturalHeight || img.height);
  p.body.material.map = t; p.body.material.needsUpdate = true;
}

// ---- Lego pieces (glossy ABS: a toon-ish standard material with a strong env reflection, inked)
const bchABS = (c, o = {}) => c3Prop(c, Object.assign({ rough: 0.2, env: 1.5 }, o));
function bchBrick(c, nx = 2, nz = 2, tall = 1) {
  const g = new THREE.Group(), u = 0.24, M = bchABS(c);
  g.add(c3Mesh(c3RBox(nx * u, tall * u * 1.2, nz * u, 0.03), M, 0.012));
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) { const s = c3Mesh(new THREE.CylinderGeometry(u * 0.3, u * 0.3, u * 0.2, 16), M, 0.01); s.position.set((i - (nx - 1) / 2) * u, tall * u * 0.6 + u * 0.08, (k - (nz - 1) / 2) * u); g.add(s); }
  return g;
}
// the black dragon: body, an S-curved neck, a snouty head with horns and yellow eyes, two bat wings, a curling tail,
// four stubby legs. ~0.75 long. Origin at the belly's underside; nose at +x.
function bchDragon(c = '#1c1c24') {
  const g = new THREE.Group(), M = bchABS(c, { rough: 0.16, env: 1.8 }), ink = 0.012;
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 16);
  const body = c3Mesh(cap(0.12, 0.22), M, ink); body.rotation.z = Math.PI / 2; body.position.set(0, 0.17, 0); g.add(body);
  const tube = (pts, r0, r1) => {   // a tapering tube along points (neck, tail)
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => bchV(...p))), geo = new THREE.TubeGeometry(curve, 24, 1, 10, false), pos = geo.attributes.position;
    const N = 25, ring = 11; for (let i = 0; i < N; i++) { const k = i / (N - 1), r = lerp(r0, r1, k), c0 = curve.getPointAt(k);
      for (let j = 0; j < ring; j++) { const v = i * ring + j; const p = bchV(pos.getX(v), pos.getY(v), pos.getZ(v)).sub(c0).multiplyScalar(r).add(c0); pos.setXYZ(v, p.x, p.y, p.z); } }
    geo.computeVertexNormals(); return c3Mesh(geo, M, ink);
  };
  g.add(tube([[0.16, 0.2, 0], [0.26, 0.3, 0], [0.27, 0.44, 0], [0.33, 0.52, 0]], 0.075, 0.055));   // neck
  g.add(tube([[-0.16, 0.17, 0], [-0.3, 0.14, 0.02], [-0.42, 0.18, 0.05], [-0.47, 0.28, 0.02], [-0.42, 0.33, -0.02]], 0.07, 0.015));   // tail, curling up
  const head = new THREE.Group(); head.position.set(0.36, 0.55, 0); g.add(head);
  const skull = c3Mesh(new THREE.SphereGeometry(0.085, 18, 14), M, ink); skull.scale.set(1.15, 0.95, 0.9); head.add(skull);
  const snout = c3Mesh(cap(0.05, 0.09), M, ink); snout.rotation.z = Math.PI / 2 - 0.25; snout.position.set(0.1, -0.02, 0); head.add(snout);
  for (const z of [-0.04, 0.04]) {
    const horn = c3Mesh(new THREE.ConeGeometry(0.022, 0.12, 10), M, 0.008); horn.position.set(-0.05, 0.08, z); horn.rotation.z = 0.8; head.add(horn);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), c3Flat('#ffd23c', { glow: '#ffb020' })); eye.position.set(0.04, 0.03, z * 1.6); head.add(eye);
  }
  const wingShape = new THREE.Shape();   // a bat wing: leading spar, then scalloped trailing edge
  wingShape.moveTo(0, 0); wingShape.lineTo(0.08, 0.3); wingShape.lineTo(-0.04, 0.42); wingShape.quadraticCurveTo(-0.08, 0.3, -0.14, 0.27);
  wingShape.quadraticCurveTo(-0.17, 0.17, -0.24, 0.15); wingShape.quadraticCurveTo(-0.2, 0.06, -0.24, 0.0); wingShape.lineTo(0, 0);
  const wgeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 8 });
  for (const z of [-1, 1]) { const wing = c3Mesh(wgeo, M, 0.008); wing.position.set(0.05, 0.25, z * 0.07); wing.rotation.set(z * 0.55, 0, 0); g.add(wing); }
  for (const [x, z] of [[0.11, 0.08], [0.11, -0.08], [-0.11, 0.08], [-0.11, -0.08]]) { const leg = c3Mesh(cap(0.035, 0.07), M, ink); leg.position.set(x, 0.06, z); g.add(leg); }
  return g;
}
function bchFlipper(c = '#f2d22a') {   // a minifig swim fin: a long paddle that widens to a scalloped tip, two ribs, a rounded foot pocket at the heel
  const g = new THREE.Group(), M = bchABS(c), D = bchABS(new THREE.Color(c).multiplyScalar(0.72).getStyle());
  const s = new THREE.Shape(); s.moveTo(-0.08, 0); s.lineTo(0.08, 0); s.quadraticCurveTo(0.2, 0.3, 0.22, 0.6);
  s.quadraticCurveTo(0.16, 0.66, 0.11, 0.6); s.quadraticCurveTo(0.055, 0.67, 0, 0.6); s.quadraticCurveTo(-0.055, 0.67, -0.11, 0.6); s.quadraticCurveTo(-0.16, 0.66, -0.22, 0.6);
  s.quadraticCurveTo(-0.2, 0.3, -0.08, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 12 }); geo.translate(0, -0.12, -0.012);
  const blade = c3Mesh(geo, M, 0.012); blade.rotation.x = -Math.PI / 2; g.add(blade);
  for (const x of [-0.12, 0.12]) { const rib = c3Mesh(c3RBox(0.035, 0.04, 0.42, 0.014), D, 0.006); rib.position.set(x * 0.85, 0.03, -0.25); rib.rotation.y = -x * 0.9; g.add(rib); }
  const pocket = c3Mesh(new THREE.SphereGeometry(0.12, 20, 14), M, 0.012); pocket.scale.set(0.95, 0.6, 1.25); pocket.position.set(0, 0.05, 0.19); g.add(pocket);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.065, 20), c3Flat(new THREE.Color(c).multiplyScalar(0.5).getStyle())); hole.scale.y = 0.55; hole.rotation.x = -0.5; hole.position.set(0, 0.09, 0.3); g.add(hole);
  return g;
}
function bchJacket() {   // a minifig life vest: a chunky orange vest (U neck, armholes) with two white straps and a buckle
  const g = new THREE.Group(), M = bchABS('#ff4a10'), Wm = bchABS('#f6f2ea');
  const v = new THREE.Shape(); v.moveTo(-0.15, 0); v.lineTo(0.15, 0); v.lineTo(0.16, 0.2); v.quadraticCurveTo(0.11, 0.22, 0.1, 0.3); v.lineTo(0.05, 0.3);
  v.quadraticCurveTo(0, 0.2, -0.05, 0.3); v.lineTo(-0.1, 0.3); v.quadraticCurveTo(-0.11, 0.22, -0.16, 0.2); v.lineTo(-0.15, 0);
  const geo = new THREE.ExtrudeGeometry(v, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 4, curveSegments: 12 }); geo.translate(0, 0, -0.04);
  g.add(c3Mesh(geo, M, 0.01));
  for (const y of [0.07, 0.15]) { const st = c3Mesh(c3RBox(0.34, 0.03, 0.15, 0.012), Wm, 0.006); st.position.set(0, y, 0.005); g.add(st); }
  const bk = c3Mesh(c3RBox(0.06, 0.05, 0.03, 0.01), bchABS('#2a2a30'), 0.004); bk.position.set(0, 0.07, 0.085); g.add(bk);
  const wh = c3Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), bchABS('#ffd23c'), 0.004); wh.rotation.z = Math.PI / 2; wh.position.set(0.09, 0.23, 0.07); g.add(wh);
  return g;
}
// the open cartoon hand for macro shots (s07, s09): palm up, four chunky fingers pointing -x (screen-left from the macro
// cameras) and curling up a little, the thumb toward the camera (+z), the wrist and arm leaving to +x. curl via fingers[k].rotation.z (negative = up)
function bchHandCurl(s, c) { s.mitt.fingers.forEach((f, k) => { f.rotation.z = -(c + Math.abs(k - 1.5) * 0.06); f.userData.tip.rotation.z = -c * 0.9; }); s.mitt.thumb.rotation.y = c * 0.4; }
function bchMitten() {
  const HM = c3Toon('#3f2416'), HI = 0.035, cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 16);
  const g = new THREE.Group(), palm = c3Mesh(new THREE.SphereGeometry(0.62, 28, 20), HM, HI); palm.scale.set(1.0, 0.34, 0.95); g.add(palm);
  const fingers = [];
  for (let k = 0; k < 4; k++) { const f = new THREE.Group(), z = -0.42 + k * 0.27; f.position.set(-0.5, 0.06, z); f.rotation.y = (k - 1.5) * -0.08; g.add(f);
    const L = [0.5, 0.56, 0.52, 0.4][k], s1 = c3Mesh(cap(0.125, L), HM, HI); s1.rotation.z = Math.PI / 2; s1.position.set(-(L / 2 + 0.06), 0, 0); f.add(s1);
    const tip = new THREE.Group(); tip.position.set(-(L + 0.1), 0, 0); f.add(tip); const s2 = c3Mesh(cap(0.12, 0.2), HM, HI); s2.rotation.z = Math.PI / 2; s2.position.set(-0.12, 0, 0); tip.add(s2);
    f.userData.tip = tip; fingers.push(f); }
  const thumb = new THREE.Group(); thumb.position.set(-0.1, 0.06, 0.5); g.add(thumb);
  const th = c3Mesh(cap(0.14, 0.38), HM, HI); th.rotation.set(Math.PI / 2, 0, 0); th.rotation.y = 0.6; th.position.set(-0.14, 0.03, 0.2); thumb.add(th);
  const wrist = c3Mesh(cap(0.3, 0.3), HM, HI); wrist.rotation.z = Math.PI / 2; wrist.position.set(0.62, -0.04, 0); g.add(wrist);
  const arm = new THREE.Mesh(cap(0.2, 4.0), c3Flat(C3.ink)); arm.rotation.set(0, -0.35, Math.PI / 2 + 0.12); arm.position.set(2.65, -0.28, 0.75); g.add(arm);
  return { g, fingers, thumb };
}
// the pinching hand (s09, s10): thumb and index meet at the origin, the other fingers curled behind
function bchPincher() {
  const HM = c3Toon('#2e1a10'), HI = 0.03, cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 16), g = new THREE.Group();
  const fist = c3Mesh(new THREE.SphereGeometry(0.5, 24, 18), HM, HI); fist.scale.set(1.0, 0.95, 0.8); fist.position.set(0.55, 0.65, 0); g.add(fist);
  const idx = c3Mesh(cap(0.12, 0.5), HM, HI); idx.rotation.z = -0.75; idx.position.set(0.18, 0.28, 0.05); g.add(idx);
  const thb = c3Mesh(cap(0.12, 0.34), HM, HI); thb.rotation.z = 0.35; thb.position.set(0.12, 0.3, 0.25); g.add(thb);
  for (let k = 0; k < 3; k++) { const kn = c3Mesh(new THREE.SphereGeometry(0.15, 14, 10), HM, HI); kn.position.set(0.32 + k * 0.08, 0.3 - k * 0.14, -0.2); g.add(kn); }
  const arm = new THREE.Mesh(cap(0.16, 4.0), c3Flat(C3.ink)); arm.rotation.z = -0.9; arm.position.set(2.2, 2.2, 0); g.add(arm);
  return g;
}
// a soft round contact shadow (a disc lying on the sand)
function bchBlob(sx, sz, a = 0.5) {
  BCH.blobT ||= bchTexRadial('rgba(40,24,12,1)', 'rgba(40,24,12,0)');
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: BCH.blobT, transparent: true, opacity: a, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.renderOrder = -1; return m;
}

// ---- the world
function bchBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 900), s = { scene, cam };
  const key = lights(scene, { amb: '#ffe8d0', ambI: 0.55, sky: '#ffe0b8', ground: '#6a4a3a', key: '#ffe0b0', keyI: 1.25, keyP: [22, 18, -26], rim: '#ffb070', rimI: 0.5, rimP: [-14, 10, 20] });
  s.key = key; s.hemi = scene.children.find((c) => c.isHemisphereLight); s.amb = scene.children.find((c) => c.isAmbientLight);
  { const L = new THREE.DirectionalLight('#fff0dc', 0.55); L.position.set(-6, 14, 30); L.layers.enableAll(); scene.add(L); s.fill = L; }   // fill from the land side, so faces of props read
  // sky: a gradient dome — grey cloud cover overhead breaking to a gold horizon and the sun; storm = slate black
  s.skyU = { top: { value: new THREE.Color('#8a94a8') }, mid: { value: new THREE.Color('#f2c890') }, hor: { value: new THREE.Color('#ffd8a0') }, sun: { value: bchV(0.12, 0.08, -1).normalize() }, storm: { value: 0 }, flash: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: s.skyU,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sun; uniform float storm, flash; varying vec3 vP;
      void main(){ vec3 d = normalize(vP); float h = d.y;
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.15, 0.6, h));
        float sd = max(dot(d, sun), 0.0); c += vec3(1.0, 0.75, 0.4) * pow(sd, 18.0) * 0.6 + vec3(1.0, 0.9, 0.7) * pow(sd, 300.0) * 1.2;
        vec3 st = mix(vec3(0.16, 0.18, 0.22), vec3(0.08, 0.09, 0.12), smoothstep(0.0, 0.5, h)); c = mix(c, st, storm);
        c += vec3(0.6, 0.65, 0.8) * flash; gl_FragColor = vec4(c, 1.0); }` }));
  sky.renderOrder = -10; scene.add(sky);
  // clouds: puffs (toon spheres) far over the sea — grey with gold-lit bellies; in the storm they turn black and close in
  s.cloudM = c3Toon('#c8c2c4'); s.clouds = new THREE.Group(); scene.add(s.clouds);
  for (let i = 0; i < 16; i++) { const R = RNG('cloud', i), c = new THREE.Group(), cx = R.r(-420, 420), cy = R.r(90, 220), cz = R.r(-560, -380);
    for (let k = 0; k < 7; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(R.r(22, 46), 14, 10), s.cloudM); p.position.set(R.n(70), R.n(12), R.n(20)); p.scale.y = 0.6; c.add(p); }
    c.position.set(cx, cy, cz); s.clouds.add(c); }
  s.sunDisc = new THREE.Mesh(new THREE.CircleGeometry(22, 32), c3Flat('#fff4d0', { glow: '#ffc060' })); s.sunDisc.position.copy(s.skyU.sun.value.clone().multiplyScalar(600)); s.sunDisc.lookAt(0, 0, 0); scene.add(s.sunDisc);
  // the sea: a big wavy plane (vertices moved each frame), teal near, deep blue far, glossy so the sky glints in it
  const seaG = new THREE.PlaneGeometry(900, 520, 180, 90); seaG.rotateX(-Math.PI / 2); seaG.translate(0, -0.15, -272);
  s.seaBase = Float32Array.from(seaG.attributes.position.array);
  const cols = new Float32Array(seaG.attributes.position.count * 3), cNear = new THREE.Color('#1f8f9c'), cFar = new THREE.Color('#123e6e'), tmp = new THREE.Color();
  for (let i = 0; i < seaG.attributes.position.count; i++) { const z = s.seaBase[i * 3 + 2]; tmp.copy(cNear).lerp(cFar, clamp((-z - 14) / 120)); cols.set([tmp.r, tmp.g, tmp.b], i * 3); }
  seaG.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  s.seaM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.22, metalness: 0.05, envMapIntensity: 0.75 });
  s.sea = new THREE.Mesh(seaG, s.seaM); s.sea.userData.noCast = true; scene.add(s.sea);
  // surf bands: foam ribbons rolling in to the shore
  const foamT = bchTexFoam(false); s.surf = [];
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(320, 3.2), new THREE.MeshBasicMaterial({ map: foamT, transparent: true, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; scene.add(m); s.surf.push(m); }
  // the sand: wet glossy band near the water, dry rippled sand behind
  const wetT = bchTexSand(true); wetT.repeat.set(30, 2);
  scene.add(pl(400, 12, c3Prop('#ffffff', { map: wetT, rough: 0.16, metal: 0.25, env: 1.3 }), 0, 0, -9, 0, -Math.PI / 2));
  const dryT = bchTexSand(false); dryT.repeat.set(30, 7);
  scene.add(pl(400, 90, c3Prop('#ffffff', { map: dryT, rough: 0.85 }), 0, 0.01, 42, 0, -Math.PI / 2));
  // the sun's streak on the wet sand and the sea (reflection), and a few tide pools that mirror the sky
  s.streak = new THREE.Mesh(new THREE.PlaneGeometry(14, 140), new THREE.MeshBasicMaterial({ map: bchTexRadial('rgba(255,236,190,0.8)', 'rgba(255,200,120,0)'), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  s.streak.rotation.x = -Math.PI / 2; s.streak.position.set(14, 0.05, -70); scene.add(s.streak);
  s.pools = [];
  for (const [x, z, sx, sz] of [[-7, -9.5, 3.2, 1.2], [6, -10.5, 4.5, 1.4], [16, -8.5, 2.6, 1.0], [-18, -10, 5, 1.6], [-2, -12.6, 6, 1.4]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 28), c3Prop('#d8c8b8', { rough: 0.02, metal: 0.85, env: 1.6 })); p.rotation.x = -Math.PI / 2; p.scale.set(sx, sz, 1); p.position.set(x, 0.03, z); scene.add(p); s.pools.push(p); }
  // the wash: a thin sheet of water + foam front climbing the wet sand and sliding back
  s.wash = new THREE.Mesh(new THREE.PlaneGeometry(400, 1), new THREE.MeshBasicMaterial({ map: bchTexFoam(true), transparent: true, depthWrite: false, toneMapped: false, opacity: 0.95 }));
  s.wash.rotation.x = -Math.PI / 2; scene.add(s.wash);
  s.washWater = new THREE.Mesh(new THREE.PlaneGeometry(400, 1), new THREE.MeshStandardMaterial({ color: '#4aa8b0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.62, depthWrite: false }));
  s.washWater.rotation.x = -Math.PI / 2; scene.add(s.washWater);
  // the wrack line: seaweed strands, bits of driftwood and shells along z -3.5
  const weedM = [c3Prop('#3a4a1e', { rough: 0.35, metal: 0.1 }), c3Prop('#5a3a1a', { rough: 0.35, metal: 0.1 }), c3Prop('#2a3a24', { rough: 0.3 })];
  for (let i = 0; i < 70; i++) { const R = RNG('weed', i), pts = [], x0 = R.r(-60, 60), z0 = -3.5 + R.n(1.4), a = R.r(0, TAU);
    for (let k = 0; k < 5; k++) pts.push(bchV(x0 + Math.cos(a) * k * 0.45 + R.n(0.15), 0.06, z0 + Math.sin(a) * k * 0.45 + R.n(0.2)));
    const m = c3Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, R.r(0.05, 0.11), 6, false), weedM[i % 3], 0.012); m.scale.y = 0.5; scene.add(m); }
  for (let i = 0; i < 26; i++) { const R = RNG('shell', i), sh = c3Mesh(new THREE.SphereGeometry(R.r(0.08, 0.15), 10, 8, 0, TAU, 0, Math.PI / 2), c3Prop(R.f() < 0.5 ? '#f4e8dc' : '#e8b8a0', { rough: 0.4 }), 0.008);
    sh.scale.y = 0.5; sh.position.set(R.r(-30, 30), 0.0, R.r(-8, 6)); scene.add(sh); }
  // a trail of footprints across the dry sand down to the wrack line (someone's been here at dawn)
  { const fpT = bchTexRadial('rgba(150,110,70,0.75)', 'rgba(150,110,70,0)');
    for (let i = 0; i < 34; i++) { const k = i / 33, x = lerp(-14, 3, k) + Math.sin(k * 5) * 2 + (i % 2 ? 0.45 : -0.45), z = lerp(30, -2.5, k);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.1), new THREE.MeshBasicMaterial({ map: fpT, transparent: true, depthWrite: false, toneMapped: false }));
      f.rotation.set(-Math.PI / 2, 0, Math.atan2(17, 32.5) * 0.6); f.position.set(x, 0.03, z); scene.add(f); } }
  // driftwood log and an old wooden groyne running into the sea
  const woodM = c3Prop('#ffffff', { map: bchTexWood(), rough: 0.7 });
  { const lg = c3Mesh(new THREE.CapsuleGeometry(0.45, 6, 8, 14), woodM, 0.03); lg.rotation.set(0, 0.4, Math.PI / 2); lg.position.set(-9.5, 0.35, -1.5); scene.add(lg); s.log = lg; }
  for (let i = 0; i < 12; i++) { const z = -2 - i * 3.4, R = RNG('groyne', i), h = R.r(2.2, 3.8) - i * 0.12;
    const post = c3Mesh(c3RBox(0.75, h, 0.75, 0.15), woodM, 0.03); post.position.set(22 + R.n(0.3), h / 2 - 0.4, z); post.rotation.y = R.n(0.15); scene.add(post); }
  // rocks along the shore and at the cliff foot
  const rockM = c3Prop('#ffffff', { map: bchTexRock(), rough: 0.75 }), rockW = c3Prop('#4a4440', { rough: 0.25, metal: 0.2 });
  for (let i = 0; i < 18; i++) { const R = RNG('rock', i), r = R.r(0.6, 2.4), m = c3Mesh(new THREE.DodecahedronGeometry(r, 1), i % 3 ? rockM : rockW, 0.04);
    m.scale.set(R.r(1, 1.6), R.r(0.5, 0.8), R.r(0.9, 1.3)); m.rotation.y = R.r(0, 3); m.position.set(i < 9 ? R.r(-40, -16) : R.r(-60, 60), r * 0.25, i < 9 ? R.r(-16, -4) : R.r(-30, -16)); scene.add(m); }
  // cliffs on the left: big rock masses with a grass cap, receding along the coast
  const grassM = c3Prop('#5a8a3a', { rough: 0.8 });
  for (let i = 0; i < 7; i++) { const R = RNG('cliff', i), x = -48 - i * 6, z = 10 - i * 34, h = R.r(26, 40), w = R.r(26, 40);
    const c = c3Mesh(new THREE.DodecahedronGeometry(1, 1), rockM, 0.05); c.scale.set(w, h, w * 0.9); c.position.set(x - w * 0.4, h * 0.45, z); scene.add(c);
    const top = c3Mesh(new THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, Math.PI / 2), grassM, 0.05); top.scale.set(w * 0.95, 5, w * 0.85); top.position.set(x - w * 0.4, h * 0.9, z); scene.add(top); }
  // the headland on the right with the lighthouse and its keeper's cottage
  { const hm = c3Mesh(new THREE.DodecahedronGeometry(1, 1), rockM, 0.05); hm.scale.set(80, 24, 40); hm.position.set(75, 4, -170); scene.add(hm);
    const ht = c3Mesh(new THREE.SphereGeometry(1, 18, 8, 0, TAU, 0, Math.PI / 2), grassM, 0.05); ht.scale.set(76, 6, 38); ht.position.set(75, 22, -170); scene.add(ht);
    const lh = new THREE.Group(); lh.position.set(55, 24, -165); scene.add(lh); s.lighthouse = lh;
    lh.add(c3Mesh(new THREE.CylinderGeometry(2.2, 3.2, 20, 20), c3Prop('#ffffff', { map: bchTexStripes(), rough: 0.5 }), 0.06).translateY(10));
    lh.add(c3Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.8, 20), c3Prop('#2a2a2e', { rough: 0.4 }), 0.04).translateY(20.4));
    s.lamp = c3Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.6, 16), c3Flat('#fff2b0', { glow: '#ffd060' }), 0.04); s.lamp.position.y = 22.1; lh.add(s.lamp);
    lh.add(c3Mesh(new THREE.ConeGeometry(2.4, 2.2, 16), c3Prop('#c8281e', { rough: 0.4 }), 0.04).translateY(24.5));
    s.beam = new THREE.Mesh(new THREE.ConeGeometry(4, 60, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4c0', transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
    s.beam.position.y = 22.1; s.beam.rotation.z = Math.PI / 2; s.beam.geometry.translate(0, -30, 0); lh.add(s.beam);
    const ct = rb(9, 5, 6, c3Prop('#f2ece0', { rough: 0.6 }), 63, 26.5, -165); scene.add(ct); const rf = rb(10, 1.4, 7, c3Prop('#3a4a5a', { rough: 0.5 }), 63, 29.6, -165); scene.add(rf); }
  // marram-grass dunes behind the beach (seen when the camera turns along the coast)
  const dune = c3Prop('#e8cc96', { rough: 0.9 }), marram = c3Prop('#9aa85a', { rough: 0.7 });
  for (let i = 0; i < 8; i++) { const R = RNG('dune', i), d = c3Mesh(new THREE.SphereGeometry(1, 20, 10, 0, TAU, 0, Math.PI / 2), dune, 0.04); d.scale.set(R.r(14, 22), R.r(4, 7), R.r(8, 12)); d.position.set(-70 + i * 20, 0, 70 + R.n(6)); scene.add(d);
    for (let k = 0; k < 14; k++) { const b = c3Mesh(new THREE.ConeGeometry(0.12, R.r(1.8, 3.2), 4), marram, 0.01); b.position.set(d.position.x + R.n(12), d.scale.y * 0.8 + 0.5, d.position.z + R.n(6)); b.rotation.set(R.n(0.4), 0, R.n(0.4)); scene.add(b); } }
  // gulls
  s.gulls = [];
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(), wm = c3Prop('#f4f4f0', { rough: 0.5 }), tip = c3Prop('#2a2a30', { rough: 0.5 });
    const b = c3Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 6, 10), wm, 0.03); b.rotation.z = Math.PI / 2; g.add(b);
    const bk = c3Mesh(new THREE.ConeGeometry(0.08, 0.3, 8), c3Prop('#f2b030'), 0.01); bk.rotation.z = -Math.PI / 2; bk.position.x = 0.62; g.add(bk);
    const wings = []; for (const z of [-1, 1]) { const wg = new THREE.Group(); wg.position.z = z * 0.15; g.add(wg);
      const w1 = c3Mesh(c3RBox(0.5, 0.06, 1.3, 0.03), wm, 0.02); w1.position.z = z * 0.65; wg.add(w1); const w2 = c3Mesh(c3RBox(0.4, 0.05, 0.6, 0.02), tip, 0.02); w2.position.z = z * 1.55; w2.position.x = -0.05; wg.add(w2); wings.push([wg, z]); }
    scene.add(g); s.gulls.push({ g, wings, R: RNG('gull', i) }); }
  // Lego scattered along the wash and the wrack line (the medium shots)
  const BR = ['#d8281e', '#1e5ac8', '#f2c21e', '#2a9a3a', '#f4f4f0', '#ff7a1a'];
  s.scatter = new THREE.Group(); scene.add(s.scatter);
  for (let i = 0; i < 26; i++) { const R = RNG('scat', i), k = i % 5;
    const p = k === 0 ? bchDragon() : k === 1 ? bchFlipper(R.f() < 0.5 ? '#1c1c24' : '#f2d22a') : k === 2 ? bchJacket() : bchBrick(BR[i % BR.length], R.i(1, 2), R.i(2, 4));
    p.position.set(R.r(-10, 12), 0.02, R.r(-9, -2.5)); p.rotation.set(k > 2 ? 0 : 0, R.r(0, TAU), k === 0 ? R.n(0.3) : 0);
    if (k === 2) p.rotation.x = -Math.PI / 2 * 0.9;   // jackets lie on their back
    p.scale.setScalar(1.25); s.scatter.add(p); const bl = bchBlob(0.9, 0.6, 0.35); bl.position.set(p.position.x, 0.02, p.position.z); s.scatter.add(bl); }
  // the bricks riding in the surf (s02) and the one the wave flings out (s04)
  s.surfBricks = [...Array(16)].map((_, i) => { const R = RNG('sb', i), b = i % 4 === 3 ? bchDragon() : bchBrick(BR[i % BR.length], R.i(1, 2), R.i(2, 4)); b.scale.setScalar(1.3); scene.add(b); return { b, R }; });
  s.fling = bchBrick('#d8281e', 2, 4); s.fling.scale.setScalar(1.6); scene.add(s.fling);
  // the woman: raincoat, long hair, red bucket; she carries pieces in her fists
  const w = c3Person({ key: 'woman', outfit: 'mustard', hairStyle: 'long' }); w.g.scale.setScalar(BCH_K); scene.add(w.g); s.w = w; bchRaincoat(w);
  s.bucket = new THREE.Group(); w.root.add(s.bucket); s.bucket.renderOrder = 6;
  { const BM = c3Prop('#d8281e', { rough: 0.3 }), body = c3Mesh(new THREE.CylinderGeometry(0.62, 0.46, 1.1, 24, 1, true), BM, 0.03); body.material.side = THREE.DoubleSide; body.position.y = -1.0; s.bucket.add(body);
    const rim = c3Mesh(new THREE.TorusGeometry(0.62, 0.06, 8, 24), BM, 0.015); rim.rotation.x = Math.PI / 2; rim.position.y = -0.45; s.bucket.add(rim);
    const base = new THREE.Mesh(new THREE.CircleGeometry(0.46, 24), c3Prop('#a81a14')); base.rotation.x = -Math.PI / 2; base.position.y = -1.55; s.bucket.add(base);
    const hd = c3Mesh(new THREE.TorusGeometry(0.6, 0.035, 6, 20, Math.PI), c3Prop('#2a2a30', { rough: 0.3, metal: 0.5 }), 0.01); hd.position.y = -0.45; s.bucket.add(hd);
    s.bucketFill = new THREE.Group(); s.bucket.add(s.bucketFill);   // pieces heaped in it (grows over the scene)
    for (let i = 0; i < 18; i++) { const R = RNG('bf', i), p = i % 6 === 0 ? bchDragon() : bchBrick(BR[i % BR.length], R.i(1, 2), R.i(1, 3)); p.scale.setScalar(1.15);
      const a = R.r(0, TAU), r = R.r(0, 0.42); p.position.set(Math.cos(a) * r, -0.62 + (i / 18) * 0.7, Math.sin(a) * r * 0.5); p.rotation.set(R.n(0.8), R.r(0, 3), R.n(0.8)); s.bucketFill.add(p); } }
  s.holdL = new THREE.Group(); s.holdR = new THREE.Group(); w.root.add(s.holdL); w.root.add(s.holdR);   // whatever her fists hold
  s.heldDragonL = bchDragon(); s.heldDragonL.scale.setScalar(1.15); s.holdL.add(s.heldDragonL);
  s.heldDragonR = bchDragon(); s.heldDragonR.scale.setScalar(1.15); s.holdR.add(s.heldDragonR);
  [s.holdL, s.holdR].forEach((h) => { h.renderOrder = 7; h.traverse((m) => { m.renderOrder = 7; }); });
  // the macro rig (s07, s09, s10): mitten / pincher, the hero pieces, a sharp sand patch, at x 6, z -6 (hidden elsewhere)
  s.macro = new THREE.Group(); s.macro.position.set(...BCH_MAC); scene.add(s.macro);
  { const pt = bchTexSand(true); pt.repeat.set(2, 2); const patchT = c3Tex((x, w2, h2) => { const g = x.createRadialGradient(w2 / 2, h2 / 2, w2 * 0.2, w2 / 2, h2 / 2, w2 / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w2, h2); }, 256, 256, false);
    const patch = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshStandardMaterial({ map: pt, alphaMap: patchT, transparent: true, depthWrite: false, roughness: 0.2, metalness: 0.2, envMapIntensity: 1.2 }));
    patch.rotation.x = -Math.PI / 2; patch.position.y = 0.02; s.macro.add(patch); s.patch = patch;
    for (let i = 0; i < 40; i++) { const R = RNG('grain', i), gr = c3Mesh(new THREE.DodecahedronGeometry(R.r(0.015, 0.04), 0), c3Prop(R.f() < 0.3 ? '#f4ece0' : '#9a7a5a', { rough: 0.6 }), 0); gr.position.set(R.n(1.6), 0.03, R.n(1.6)); s.macro.add(gr); } }
  s.mitt = bchMitten(); s.macro.add(s.mitt.g);
  s.mFlip2 = bchFlipper('#ffae00'); s.mFlip2.scale.setScalar(2.0); s.mFlip2.position.set(-0.05, 0.22, 0.02); s.mFlip2.rotation.set(0, Math.PI / 2 + 0.25, 0); s.mitt.g.add(s.mFlip2);
  s.mDragon = bchDragon(); s.mitt.g.add(s.mDragon); s.mDragon.position.set(0.05, 0.2, -0.05); s.mDragon.scale.setScalar(1.6); s.mDragon.rotation.y = -0.5;
  s.sparkle = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: c3Tex((x, w2, h2) => { x.translate(w2 / 2, h2 / 2); for (const [a, l] of [[0, 1], [Math.PI / 2, 1], [Math.PI / 4, 0.5], [-Math.PI / 4, 0.5]]) { x.save(); x.rotate(a); const g = x.createLinearGradient(0, -h2 / 2 * l, 0, h2 / 2 * l); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,240,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, w2 * 0.035, h2 / 2 * l, 0, 0, TAU); x.fill(); x.restore(); } }, 256, 256, false), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  s.sparkle.renderOrder = 9; scene.add(s.sparkle);
  s.pinch = bchPincher(); s.pinch.scale.setScalar(0.6); s.macro.add(s.pinch);
  s.mFlipper = bchFlipper('#ffbe14'); s.mFlipper.scale.setScalar(2.2); s.macro.add(s.mFlipper);
  s.mJacket = bchJacket(); s.mJacket.scale.setScalar(2.4); s.macro.add(s.mJacket);
  s.mBlob = bchBlob(1.2, 0.8, 0.55); s.macro.add(s.mBlob);
  s.mFoam = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), new THREE.MeshBasicMaterial({ map: bchTexFoam(true), transparent: true, depthWrite: false, toneMapped: false })); s.mFoam.rotation.x = -Math.PI / 2; s.macro.add(s.mFoam);
  // the tide calendar board (s12): two posts, a little roof, the calendar block, the 30 YEARS sign; pages that tear and fly
  s.board = new THREE.Group(); s.board.position.set(-4, 0, 3); s.board.rotation.y = 0.35; scene.add(s.board);
  for (const x of [-2.2, 2.2]) s.board.add(c3Mesh(c3RBox(0.5, 9, 0.5, 0.1), woodM, 0.03).translateX(x).translateY(4.5));
  s.board.add(rb(5.4, 5.2, 0.35, woodM, 0, 6.0, 0, 0.03)); s.board.add(rb(6.2, 0.4, 1.4, c3Prop('#3a5a6a', { rough: 0.5 }), 0, 8.8, 0.3, 0.03));
  s.calBack = rb(2.6, 3.2, 0.25, c3Prop('#5a3a24', { rough: 0.6 }), 0, 6.9, 0.25, 0.02); s.board.add(s.calBack);
  s.calTop = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.85), c3Prop('#ffffff', { map: bchPageTex(1997), rough: 0.8 })); s.calTop.position.set(0, 6.85, 0.39); s.board.add(s.calTop);
  s.calCv = Object.assign(document.createElement('canvas'), { width: 256, height: 320 }); s.calTex = new THREE.CanvasTexture(s.calCv); s.calTex.encoding = THREE.sRGBEncoding; s.calTop.material.map = s.calTex; s.calYear = -1;
  s.sign30 = new THREE.Group(); s.sign30.add(rb(4.4, 2.2, 0.2, c3Prop('#e8dcc0', { rough: 0.6 }), 0, 0, 0, 0.03)); s.sign30.add(pl(4.2, 2.05, c3Prop('#ffffff', { map: bchTexSign30(), rough: 0.6 }), 0, 0, 0.11));
  s.sign30.position.set(0, 3.9, 0.3); s.board.add(s.sign30);
  s.pages = [...Array(10)].map((_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.85), c3Prop('#ffffff', { map: bchPageTex(1997 + i * 3), rough: 0.8, side: THREE.DoubleSide })); m.renderOrder = 5; scene.add(m); return m; });
  // storm: rain streaks + a lightning bolt
  const streak = new THREE.BoxGeometry(0.06, 2.2, 0.06), rainM = new THREE.MeshBasicMaterial({ color: '#c8d4e8', transparent: true, opacity: 0.45, depthWrite: false, toneMapped: false });
  s.rain = new THREE.InstancedMesh(streak, rainM, 1600); s.rain.frustumCulled = false; scene.add(s.rain);
  s.rainSeed = [...Array(1600)].map((_, i) => { const R = RNG('brain', i); return [R.r(-60, 60), R.r(0, 50), R.r(-80, 20), R.r(40, 52)]; });
  { const pts = [bchV(0, 160, 0)], R = RNG('bolt'); for (let i = 1; i < 12; i++) pts.push(bchV(pts[i - 1].x + R.n(9), 160 - i * 14, pts[i - 1].z + R.n(3)));
    s.bolt = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0), 60, 0.9, 6, false), c3Flat('#f4f6ff', { glow: '#c8d8ff' })); s.bolt.position.set(-60, 0, -320); scene.add(s.bolt); }
  // layers: people, held pieces, the macro rig, the board, the flung brick and surf bricks are in focus
  [w.g, s.macro, s.board, s.fling, s.sparkle, ...s.pages, ...s.surfBricks.map((b) => b.b)].forEach((o) => c3Layer(o, C3.L_FOCUS));
  // blurred foreground pieces (NEAR layer), placed per shot by bchFg
  s.fgBy = {
    grass: (() => { const g = new THREE.Group(); for (let k = 0; k < 22; k++) { const R = RNG('fgg', k), b = c3Mesh(new THREE.ConeGeometry(0.09, R.r(2.4, 4.2), 4), marram, 0.0); b.position.set(R.n(1.6), R.r(-1, 0.5), R.n(0.4)); b.rotation.set(R.n(0.2), 0, R.n(0.45)); g.add(b); } return g; })(),
    rock: (() => { const m = c3Mesh(new THREE.DodecahedronGeometry(1.6, 1), rockW, 0.0); m.scale.set(1.4, 0.8, 1); return m; })(),
    post: c3Mesh(c3RBox(0.9, 14, 0.9, 0.2), woodM, 0.0),
    weed: (() => { const g = new THREE.Group(); for (let k = 0; k < 6; k++) { const R = RNG('fgw', k), pts = []; for (let j = 0; j < 6; j++) pts.push(bchV(R.n(0.3) + j * 0.4, Math.sin(j + k) * 0.25, R.n(0.2)));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.13, 6, false), weedM[k % 3])); } return g; })(),
    rope: (() => { const pts = []; for (let j = 0; j < 10; j++) pts.push(bchV(j * 0.9 - 4, -Math.sin(j / 9 * Math.PI) * 0.8, 0)); return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.12, 8, false), c3Prop('#c8a868', { rough: 0.8 })); })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#c8ccd8', mid: '#f2c890', bot: '#8a6a4a', cards: [[60, 20, -200, 120, 30, '#fff0c8'], [0, 60, 0, 60, 10, '#e0e4ee'], [-40, 10, 40, 30, 12, '#f4d8b0']] });
  c3Shadows(scene, key, 20);
  return s;
}
const bchGet = () => BCH.s ||= bchBuild();
const BCH_MAC = [6, 0, -6];   // the macro rig's spot; macro camera keys are written relative to it
const bchMac = (K) => K.map(([t, p, l, f]) => [t, p.map((v, i) => v + BCH_MAC[i]), l.map((v, i) => v + BCH_MAC[i]), f]);

// ---- per-frame world: waves, surf, wash, gulls, sky mode, rain, lightning; o.storm 0..1
const BCH_M4 = new THREE.Matrix4(), BCH_Q = new THREE.Quaternion(), BCH_ONE = bchV(1, 1, 1), BCH_ZERO = bchV(0, 0, 0);
function bchWorld(s, t, o = {}) {
  const st = o.storm ?? 0, amp = lerp(0.22, 1.6, st);
  const pos = s.sea.geometry.attributes.position, B = s.seaBase;
  for (let i = 0; i < pos.count; i++) { const x = B[i * 3], z = B[i * 3 + 2], near = clamp((-z - 10) / 30);
    pos.setY(i, B[i * 3 + 1] + amp * near * (Math.sin(x * 0.05 + z * 0.11 + t * 1.6) * 0.6 + Math.sin(x * 0.13 - z * 0.07 + t * 2.3) * 0.3 + Math.sin(z * 0.3 + t * 2.9) * 0.4)); }
  pos.needsUpdate = true; s.sea.geometry.computeVertexNormals();
  s.seaM.color.setRGB(lerp(1, 0.45, st), lerp(1, 0.5, st), lerp(1, 0.58, st));
  // surf bands roll in over ~5 s each, fading at the shore
  s.surf.forEach((m, i) => { const p = mod(t / 5 + i / 5, 1); m.position.set(0, 0.25 + amp * 0.5 * Math.sin(p * Math.PI), lerp(-70, -12.5, EZ.i2(p)));
    m.material.opacity = Math.sin(p * Math.PI) * (0.6 + 0.3 * st); m.scale.y = 1 + 2.5 * p + st * 2; });
  // the wash: climbs to z -5 and slides back, every 5.2 s (o.washZ overrides the front)
  const wz = o.washZ ?? (-11.8 + 6.5 * Math.max(0, Math.sin(TAU * t / 5.2 + 0.4)) ** 1.4);
  const back = -13, len = Math.max(0.01, wz - back);
  s.wash.position.set(0, 0.04, wz - 0.9); s.wash.scale.set(1, 1.8, 1);
  s.washWater.position.set(0, 0.035, back + len / 2); s.washWater.scale.set(1, len, 1);
  // gulls: slow glides with flaps
  s.gulls.forEach(({ g, wings, R }, i) => { const sp = R.r(2.5, 4.5), x = mod(R.r(-80, 80) + t * sp * (i % 2 ? 1 : -1), 160) - 80;
    g.position.set(x, R.r(14, 30) + Math.sin(t * 0.8 + i) * 1.2, R.r(-60, -20)); g.rotation.y = i % 2 ? 0 : Math.PI; g.scale.setScalar(R.r(1.0, 1.5));
    const fl = Math.sin(t * R.r(5, 7) + i) * (Math.sin(t * 0.7 + i) > 0 ? 0.6 : 0.12); wings.forEach(([wg, z]) => { wg.rotation.x = z * fl; }); g.visible = st < 0.5; });
  // sky + light by mode
  s.skyU.storm.value = st; s.cloudM.color.set(st > 0.5 ? '#3a3e48' : '#d2c8c4');
  s.clouds.position.set(0, -st * 70, st * 260); s.clouds.scale.setScalar(1 + st * 0.6);
  s.sunDisc.visible = st < 0.5; s.streak.visible = st < 0.5;
  s.key.intensity = lerp(1.25, 0.35, st); s.amb.intensity = lerp(0.55, 0.35, st); s.hemi.intensity = lerp(0.45, 0.6, st);
  const flash = o.flash ?? 0; s.skyU.flash.value = flash; s.bolt.visible = flash > 0.3; s.hemi.intensity += flash * 1.6;
  s.lamp.material.color.set(st > 0.5 ? '#ffffff' : '#fff2b0'); s.beam.material.opacity = st * 0.35; s.beam.rotation.y = t * 1.4;
  // rain (storm only)
  s.rain.visible = st > 0.5;
  if (s.rain.visible) { const q = BCH_Q.setFromEuler(new THREE.Euler(0, 0, 0.35)), p = bchV(0, 0, 0);
    s.rainSeed.forEach(([x, y, z, v], i) => { const yy = mod(y - v * t, 50); p.set(x + (50 - yy) * 0.35, yy, z); BCH_M4.compose(p, q, BCH_ONE); s.rain.setMatrixAt(i, BCH_M4); });
    s.rain.instanceMatrix.needsUpdate = true; }
  // per-shot things off by default
  s.surfBricks.forEach(({ b }) => { b.visible = false; }); s.fling.visible = false; s.macro.visible = false; s.sparkle.visible = false;
  s.pages.forEach((m) => { m.visible = false; }); s.board.visible = !!o.board; s.scatter.visible = o.scatter !== false; s.w.g.visible = !!o.woman;
}
// pose helpers (billboard-local, unscaled)
const BCH_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
function bchPlace(s, x, z, drop = 0) { s.w.g.position.set(x, BCH_FOOT - drop * BCH_K, z); }
// what she holds this shot: bucket in a fist ([x, y] = the fist, billboard-local), pieces in her fists
function bchProps(s, o = {}) {
  s.bucket.visible = !!o.bucket; if (o.bucket) { s.bucket.position.set(o.bucket[0], o.bucket[1], 0.06); s.bucket.rotation.set(0.25, 0, o.bucket[2] ?? 0); }
  s.bucketFill.children.forEach((p, i) => { p.visible = i < (o.fill ?? 6); });
  s.holdL.visible = !!o.holdL; if (o.holdL) { s.holdL.position.set(o.holdL[0], o.holdL[1] + 0.12, 0.2); s.holdL.rotation.set(0.3, -0.6, o.holdL[2] ?? 0); s.holdL.scale.setScalar(o.holdL[3] ?? 1); }
  s.holdR.visible = !!o.holdR; if (o.holdR) { s.holdR.position.set(o.holdR[0], o.holdR[1] + 0.12, 0.2); s.holdR.rotation.set(0.3, 0.6, o.holdR[2] ?? 0); s.holdR.scale.setScalar(o.holdR[3] ?? 1); }
}
// walking feet (side-on stride), billboard-local
function bchWalk(t, sp = 7) {
  const ph = t * sp, a = Math.sin(ph), b = Math.sin(ph + Math.PI);
  return { foot: { legL: [0.5 + 0.55 * a, -2.55 + 0.32 * Math.max(0, Math.cos(ph))], legR: [-0.5 + 0.55 * b, -2.55 + 0.32 * Math.max(0, Math.cos(ph + Math.PI))] }, bob: 0.1 * Math.abs(Math.sin(ph)) };
}

// =====================================================================
//  s01 — "Some beaches in England": a high glide over the beach toward the sea, cliffs left, lighthouse right
// =====================================================================
const BCH_K01 = [[0, [-4, 6.5, 34], [12, 5.5, -60], 52], [1.3, [-2, 5.6, 26], [15, 5.0, -60], 52]];
SHOT_FN['s01'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t);
  c3SetCam(s.cam, bchCam(BCH_K01, lt, 's01', { orbit: 0.05, creep: 0.08 }));
  bchFg(s, [['grass', [-2.4, -4.4, -7], 1.6], ['rope', [2.2, -5.0, -8.5], 1.2], ['post', [5.5, -1, -14], 1.2]], BCH_K01, 's01', lt, { orbit: 0.05, creep: 0.08 });
  bchRender(s, { bgBlur: bchRack(lt, 's01', 0.6, 1.4) });
};

// =====================================================================
//  s02 — "have a very strange tide.": low at the water line; a wave rolls in carrying colourful glints — Lego tumbling in the foam
// =====================================================================
const BCH_K02 = [[0, [7.5, 2.6, 0.5], [1, 0.5, -14], 44], [1.3, [5.8, 2.2, -1.6], [0, 0.4, -14], 44]];
SHOT_FN['s02'] = (t, u, lt) => {
  const s = bchGet();
  const p = EZ.o2(clamp((t - 1.0) / 1.5)), wz = lerp(-14, -6.5, p);   // this wave rolls all the way in
  bchWorld(s, t, { scatter: false, washZ: lerp(-12.5, -6.8, EZ.o2(clamp((t - 1.5) / 1.2))) });
  s.surfBricks.forEach(({ b, R }, i) => { b.visible = true; const x = R.r(-5, 8), lag = R.r(0, 1.6);
    b.position.set(x, 0.25 + 0.25 * Math.sin(t * 5 + i) * (1 - p), wz - lag - 0.5);
    b.rotation.set(t * R.r(2, 4) + i, t * R.r(1, 3), t * R.r(1.5, 3)); });
  c3SetCam(s.cam, bchCam(BCH_K02, lt, 's02', { orbit: -0.05 }));
  bchFg(s, [['weed', [-1.4, -2.2, -4], 0.7], ['rock', [3.2, -3.6, -9], 1.2]], BCH_K02, 's02', lt, { orbit: -0.05 });
  bchRender(s, { bgBlur: bchRack(lt, 's02', 2.6, 1.6), glow: 0.7 });
};

// =====================================================================
//  s03 — "After a big storm,": the same beach under a black storm — rain, huge waves, lightning on "storm"
// =====================================================================
const BCH_K03 = [[0, [-2, 7, 12], [6, 12, -80], 50], [1.0, [-1, 6.4, 9], [8, 14, -80], 50]];
SHOT_FN['s03'] = (t, u, lt) => {
  const s = bchGet(), storm = bchW('storm', 1, 2.9), k = t - (storm - 0.05);
  const flash = k > 0 && k < 0.45 ? (k < 0.06 ? 1 : k < 0.12 ? 0.3 : k < 0.18 ? 0.9 : Math.max(0, 0.6 - k)) : 0;
  bchWorld(s, t, { storm: 1, flash, scatter: false });
  c3SetCam(s.cam, bchCam(BCH_K03, lt, 's03', { orbit: 0.04, creep: 0.06 }));
  s.cam.position.x += Math.sin(t * 31) * 0.05 * (flash > 0 ? 1 : 0.3); s.cam.position.y += Math.sin(t * 27) * 0.04;   // the wind shakes the lens
  bchFg(s, [['grass', [3.4, -5.4, -8], 2.6]], BCH_K03, 's03', lt, { orbit: 0.04, creep: 0.06 });
  bchRender(s, { bg: '#20242c', bgBlur: 1.8, glow: 0.9, bloom: 0.36 + flash * 0.4 });
};

// =====================================================================
//  s04 — "the sea spits out Lego.": morning again; the wash slides back and leaves Lego on the sand; on "Lego" the
//  last of the wave spits a red brick straight at us, tumbling
// =====================================================================
const BCH_K04 = [[0, [2.5, 2.4, 3.6], [0, 0.6, -9], 46], [1.2, [2.0, 2.1, 2.2], [-0.4, 0.7, -9], 46]];
SHOT_FN['s04'] = (t, u, lt) => {
  const s = bchGet(), spits = bchW('spits', 1, 3.6), lego = bchW('lego', 1, 4.1);
  bchWorld(s, t, { washZ: lerp(-5.2, -12, EZ.io(clamp((t - 3.3) / 1.0))) });
  const f = clamp((t - (spits + 0.1)) / 0.75);   // the brick: out of the foam, an arc toward the lens, landing on "Lego"
  s.fling.visible = true; s.fling.position.set(lerp(-1.6, 0.9, f), 0.35 + 1.3 * Math.sin(Math.PI * Math.min(1, f * 1.05)) * (1 - f * 0.3), lerp(-7.5, -2.2, EZ.o2(f)));
  s.fling.rotation.set(f * 7.5, f * 3, f * 5.5); if (f >= 1) { const b = clamp((t - spits - 0.85) / 0.25); s.fling.position.y = 0.3 + 0.35 * Math.sin(Math.PI * b) * (1 - b); s.fling.rotation.set(0, 0.6, 0); }
  c3SetCam(s.cam, bchCam(BCH_K04, lt, 's04', { orbit: 0.04 }));
  bchFg(s, [['weed', [1.6, -2.4, -4], -0.6]], BCH_K04, 's04', lt, { orbit: 0.04 });
  bchRender(s, { bgBlur: bchRack(lt, 's04', 2.2, 3.0) });
};

// =====================================================================
//  s05 — "A woman walks along the sand,": a tracking side shot, morning gold; she swings her red bucket
// =====================================================================
const BCH_K05 = [[0, [-6.4, 7.6, 21], [-5.6, 6.2, -2], 46], [1.6, [-2.6, 7.4, 19.6], [-1.6, 6.2, -2], 46]];
SHOT_FN['s05'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { woman: true });
  const x = lerp(-7.2, -1.2, lt / 1.6), wk = bchWalk(t);
  bchPlace(s, x, -2); s.w.g.position.y += wk.bob;
  c3SetCam(s.cam, bchCam(BCH_K05, lt, 's05', { orbit: 0.03 }));
  const sw = Math.sin(t * 7) * 0.25;
  bchProps(s, { bucket: [1.55 + sw * 0.3, 0.75, -sw * 0.4], fill: 4 });
  c3PersonPose(s.w, s.cam, t, { expr: c3FaceAt([[0, 'happy'], [bchW('sand', 1, 5.6), 'smile']], t, 'woman'), gaze: [0.6, -0.2], hand: { armL: [1.55 + sw * 0.3, 0.75], armR: [-1.1 - sw * 0.4, 0.95] }, foot: wk.foot });
  bchFg(s, [['grass', [-3.0, -5.2, -7], 2.4], ['rope', [2.5, -6.4, -9], 1.8]], BCH_K05, 's05', lt, { orbit: 0.03 });
  bchRender(s, { bgBlur: bchRack(lt, 's05', 2.4, 3.0) });
};

// =====================================================================
//  s06 — "picks up something tiny and black,": she crouches; her fist comes up with a tiny black thing; she squints at it
// =====================================================================
const BCH_K06 = [[0, [4.4, 6.4, 15.5], [-0.2, 5.0, -2], 44], [1.4, [3.0, 6.2, 13.4], [-0.2, 5.2, -2], 44]];
SHOT_FN['s06'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { woman: true });
  const pick = bchW('picks', 1, 6.0), tiny = bchW('tiny', 1, 6.5), black = bchW('black', 1, 7.1);
  const down = EZ.io(clamp((t - (pick - 0.25)) / 0.3)) * (1 - EZ.io(clamp((t - (pick + 0.35)) / 0.35))) ;
  const crouch = Math.max(down, 0.55 * EZ.io(clamp((t - (pick - 0.25)) / 0.3)));
  bchPlace(s, -0.2, -2, crouch * 1.25);
  c3SetCam(s.cam, bchCam(BCH_K06, lt, 's06', { orbit: 0.05 }));
  const up = clamp((t - (pick + 0.3)) / 0.4), hx = lerp(0.9, 0.55, up), hy = lerp(-1.2 + 0.9 * (1 - down), 2.6, EZ.back(up));
  bchProps(s, { bucket: [-1.6, 0.4, 0.1], fill: 5, holdL: t > pick + 0.1 ? [hx, hy, 0, 0.75] : null });
  c3PersonPose(s.w, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [pick, 'thinking'], [tiny, 'suspicious'], [black, 'surprised']], t, 'woman'), gaze: t < pick + 0.4 ? [0.4, -0.9] : [0.5, 0.2],
    head: [0.06 * up, 0, 0], hand: { armL: [hx, hy], armR: [-1.6, 0.4] }, foot: { legL: [0.75 + crouch * 0.35, -2.55 + crouch * 1.25], legR: [-0.75 - crouch * 0.35, -2.55 + crouch * 1.25] },
    lift: (q) => 0.12 * EZ.back(seg(q, black - 0.05, black + 0.08)) * Math.exp(-Math.max(0, q - black - 0.08) * 5), x: t > black ? ['question'] : [] });
  bchFg(s, [['weed', [-2.0, -3.4, -5], 1.0]], BCH_K06, 's06', lt, { orbit: 0.05 });
  bchRender(s, { bgBlur: bchRack(lt, 's06', 2.6, 3.4) });
};

// =====================================================================
//  s07 — "and it's a little plastic dragon.": MACRO — her mitten opens over the wet sand; a glossy black dragon in her palm,
//  a sparkle pings on "dragon"
// =====================================================================
const BCH_K07 = [[0, [1.9, 5.6, 6.2], [-0.35, 1.1, 0], 34], [1.4, [-0.3, 5.3, 5.6], [-0.35, 1.15, 0], 34]];
SHOT_FN['s07'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { scatter: false });
  const plastic = bchW('plastic', 1, 7.8), dragon = bchW('dragon', 1, 8.1);
  s.macro.visible = true; s.pinch.visible = false; s.mFlipper.visible = false; s.mJacket.visible = false; s.mitt.g.visible = true; s.mDragon.visible = true; s.mFoam.visible = false;
  const open = EZ.back(clamp((t - (7.4)) / 0.45));
  s.mitt.g.position.set(0, 0.95 + c3Hop('mitt y', t, 0.02), 0); s.mitt.g.rotation.set(0.15, 0.25 + c3Hop('mitt r', t, 0.02), 0);
  bchHandCurl(s, lerp(1.0, 0.25, open)); s.mFlip2.visible = false;
  s.mDragon.rotation.y = -0.5 + 0.2 * Math.sin(t * 2); s.mDragon.position.y = 0.2 + 0.05 * EZ.back(seg(t, dragon - 0.05, dragon + 0.12)) * Math.exp(-Math.max(0, t - dragon - 0.12) * 6);
  s.mBlob.position.set(0.1, 0.03, 0.2); s.mBlob.scale.set(2.6, 1.8, 1);
  c3SetCam(s.cam, bchCam(bchMac(BCH_K07), lt, 's07', { orbit: 0.08, creep: 0.04 }));
  const sp = clamp((t - (dragon - 0.04)) / 0.4); s.sparkle.visible = sp > 0 && sp < 1; if (s.sparkle.visible) {
    s.sparkle.position.copy(s.macro.localToWorld(bchV(0.42, 1.95, -0.1))); s.sparkle.quaternion.copy(s.cam.quaternion); s.sparkle.rotateZ(sp * 1.5); s.sparkle.scale.setScalar(0.9 * Math.sin(Math.PI * sp)); }
  bchFg(s, [['weed', [-1.0, -1.4, -2.6], 0.4]], bchMac(BCH_K07), 's07', lt, { orbit: 0.08, creep: 0.04 });
  bchRender(s, { bgBlur: 11, glow: 0.7, nearBlur: 12 });
};

// =====================================================================
//  s08 — "Then another.": she holds up a second dragon in her other fist — two dragons, a big grin
// =====================================================================
const BCH_K08 = [[0, [1.8, 8.6, 9.6], [-0.2, 7.6, -2], 42], [0.6, [1.3, 8.6, 8.8], [-0.2, 7.7, -2], 42]];
SHOT_FN['s08'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { woman: true });
  const an = bchW('another', 1, 9.0), up = EZ.back(clamp((t - (an - 0.1)) / 0.22));
  bchPlace(s, -0.2, -2);
  c3SetCam(s.cam, bchCam(BCH_K08, lt, 's08', { orbit: -0.06, creep: 0.08 }));
  bchProps(s, { holdL: [1.2, 2.7, 0.1, 0.75], holdR: [lerp(-1.2, -1.3, up), lerp(0.6, 2.8, up), -0.1, 0.75] });
  c3PersonPose(s.w, s.cam, t, { expr: c3FaceAt([[0, 'surprised'], [an, 'grin']], t, 'woman'), gaze: [0, 0.3], hand: { armL: [1.2, 2.7], armR: [lerp(-1.2, -1.3, up), lerp(0.6, 2.8, up)] }, ...BCH_STAND,
    lift: (q) => 0.15 * EZ.back(seg(q, an - 0.05, an + 0.08)) * Math.exp(-Math.max(0, q - an - 0.08) * 5), x: t > an ? ['sparkle'] : [] });
  bchFg(s, [['grass', [-2.6, -4.4, -6], 1.6]], BCH_K08, 's08', lt, { orbit: -0.06, creep: 0.08 });
  bchRender(s, { bgBlur: 3.2 });
};

// =====================================================================
//  s09 — "Then a flipper.": MACRO — her open hand swings up into view with a yellow toy flipper on the palm; sparkle on "flipper"
// =====================================================================
const BCH_K09 = [[0, [-1.6, 5.6, 6.0], [-0.35, 1.1, 0], 34], [0.8, [-0.9, 5.3, 5.4], [-0.35, 1.15, 0], 34]];
SHOT_FN['s09'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { scatter: false });
  const fl = bchW('flipper', 1, 9.8);
  s.macro.visible = true; s.mitt.g.visible = true; s.mDragon.visible = false; s.mFlip2.visible = true; s.mJacket.visible = false; s.pinch.visible = false; s.mFlipper.visible = false; s.mFoam.visible = false;
  const rise = EZ.back(clamp((t - (fl - 0.35)) / 0.4));   // her hand swings the flipper up into view on "flipper"
  s.mitt.g.position.set(lerp(0.8, 0, rise), lerp(0.2, 0.95, rise) + c3Hop('mitt y9', t, 0.02), 0); s.mitt.g.rotation.set(0.12, -0.2 + 0.25 * (1 - rise) + c3Hop('mitt r9', t, 0.02), 0);
  bchHandCurl(s, 0.3 + 0.1 * Math.sin(t * 3));
  s.mBlob.position.set(0.1, 0.03, 0.2); s.mBlob.scale.set(2.6, 1.8, 1); s.mBlob.material.opacity = 0.55;
  c3SetCam(s.cam, bchCam(bchMac(BCH_K09), lt, 's09', { orbit: -0.08, creep: 0.04 }));
  const sp = clamp((t - (fl + 0.05)) / 0.4); s.sparkle.visible = sp > 0 && sp < 1; if (s.sparkle.visible) {
    s.sparkle.position.copy(s.mitt.g.localToWorld(bchV(-0.6, 0.55, 0.1))); s.sparkle.quaternion.copy(s.cam.quaternion); s.sparkle.rotateZ(sp * 1.5); s.sparkle.scale.setScalar(0.8 * Math.sin(Math.PI * sp)); }
  bchFg(s, [['weed', [1.0, -1.1, -2.2], -0.5]], bchMac(BCH_K09), 's09', lt, { orbit: -0.08, creep: 0.04 });
  bchRender(s, { bgBlur: 11, glow: 0.6, nearBlur: 12 });
};

// =====================================================================
//  s10 — "Then a tiny life jacket.": MACRO — foam slides off a tiny orange life jacket half-sunk in the sand; her open hand scoops it up on "jacket"
// =====================================================================
const BCH_K10 = [[0, [-0.6, 5.0, 5.6], [0.4, 0.5, 0], 34], [1.5, [-0.2, 5.2, 5.2], [0.2, 1.0, 0], 34]];
SHOT_FN['s10'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { scatter: false });
  const jk = bchW('jacket', 1, 11.2);
  s.macro.visible = true; s.mitt.g.visible = true; s.mDragon.visible = false; s.mFlip2.visible = false; s.mFlipper.visible = false; s.pinch.visible = false; s.mJacket.visible = true; s.mFoam.visible = true;
  const fz = lerp(1.4, -2.2, EZ.o2(clamp((t - 10.2) / 0.9)));   // the foam front slides back past it
  s.mFoam.position.set(0, 0.06, fz); s.mFoam.material.opacity = 1 - clamp((t - 10.8) / 0.5);
  // her open hand slides in flat over the sand from the right, scoops under the jacket, then lifts it on "jacket"
  const slide = EZ.io(clamp((t - (jk - 0.75)) / 0.55)), lift = EZ.back(clamp((t - (jk + 0.02)) / 0.35));
  const hx = lerp(2.6, 0.3, slide), hy = 0.18 + lift * 0.8;
  s.mitt.g.position.set(hx, hy + c3Hop('mitt y10', t, 0.015), 0); s.mitt.g.rotation.set(0.1, -0.15 + c3Hop('mitt r10', t, 0.02), 0);
  bchHandCurl(s, 0.2 + 0.15 * lift);
  const onPalm = slide > 0.98;
  const under = clamp((0.5 - (hx - 1.7)) / 0.18);   // the fingertips reach it: it hops up onto the fingers and rides them
  s.mJacket.position.set(onPalm ? hx - 0.3 : 0, onPalm ? hy + 0.32 : 0.02 + 0.48 * EZ.back(under), 0);
  s.mJacket.rotation.set(-Math.PI / 2 * (1 - lift * 0.15), lerp(0.4, 0.2, lift), 0);
  s.mBlob.position.set(hx * 0.6, 0.03, 0.1); s.mBlob.scale.set(2.6, 1.6, 1); s.mBlob.material.opacity = 0.5 * (1 - lift * 0.5);
  c3SetCam(s.cam, bchCam(bchMac(BCH_K10), lt, 's10', { orbit: 0.06, creep: 0.04 }));
  const sp = clamp((t - (jk + 0.1)) / 0.4); s.sparkle.visible = sp > 0 && sp < 1; if (s.sparkle.visible) {
    s.sparkle.position.copy(s.macro.localToWorld(bchV(hx - 0.5, hy + 0.7, 0.1))); s.sparkle.quaternion.copy(s.cam.quaternion); s.sparkle.rotateZ(sp * 1.5); s.sparkle.scale.setScalar(0.8 * Math.sin(Math.PI * sp)); }
  bchFg(s, [['rock', [-1.5, -1.6, -3.4], 0.4]], bchMac(BCH_K10), 's10', lt, { orbit: 0.06, creep: 0.04 });
  bchRender(s, { bgBlur: 11, glow: 0.6, nearBlur: 12 });
};

// =====================================================================
//  s11 — "And here's the funny part.": she turns to us with a sly grin and hoists the bucket — overflowing with Lego
// =====================================================================
const BCH_K11 = [[0, [-2.6, 8.4, 11.5], [0, 7.4, -2], 44], [1.2, [-1.6, 8.4, 10.2], [0, 7.5, -2], 44]];
SHOT_FN['s11'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { woman: true });
  const funny = bchW('funny', 1, 12.2), hoist = EZ.back(clamp((t - (funny - 0.15)) / 0.3));
  bchPlace(s, 0, -2);
  c3SetCam(s.cam, bchCam(BCH_K11, lt, 's11', { orbit: 0.05, creep: 0.07 }));
  const hx = lerp(1.4, 1.1, hoist), hy = lerp(0.8, 3.2, hoist);
  bchProps(s, { bucket: [hx, hy, -0.15 * hoist], fill: 18 });
  c3PersonPose(s.w, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [funny, 'mischievous']], t, 'woman'), gaze: [0, 0], head: [-0.08, 0, 0],
    hand: { armL: [hx, hy], armR: [lerp(-1.1, 0.3, hoist), lerp(0.9, 2.4, hoist)] }, ...BCH_STAND,
    lift: (q) => 0.12 * EZ.back(seg(q, funny - 0.05, funny + 0.08)) * Math.exp(-Math.max(0, q - funny - 0.08) * 5) });
  bchFg(s, [['post', [3.6, -2, -9], -1.2], ['grass', [-2.8, -5.6, -7], 1.4]], BCH_K11, 's11', lt, { orbit: 0.05, creep: 0.07 });
  bchRender(s, { bgBlur: 3.0 });
};

// =====================================================================
//  s12 — "This has been happening for almost thirty years.": the tide calendar on its board; the wind rips pages off,
//  one per beat, the years flipping 1997 → 2026; on "thirty" the painted 30 YEARS sign slams up under it
// =====================================================================
const BCH_K12 = [[0, [2.4, 6.4, 19.5], [-4, 4.4, 3], 40], [2.1, [0.4, 6.0, 16.0], [-4, 4.3, 3], 40]];
SHOT_FN['s12'] = (t, u, lt) => {
  const s = bchGet(); bchWorld(s, t, { board: true });
  const thirty = bchW('thirty', 1, 14.1), years = bchW('years', 1, 14.4);
  const kf = clamp((t - 12.95) / (years - 12.95)), yr = Math.round(1997 + 29 * EZ.i2(kf));
  if (yr !== s.calYear) { s.calYear = yr; const x = s.calCv.getContext('2d'); bchPageDraw(x, s.calCv.width, s.calCv.height, yr, yr >= 2026); s.calTex.needsUpdate = true; }
  // torn pages tumbling off in the wind, toward camera-right
  s.pages.forEach((m, i) => { const t0 = 12.95 + i * 0.13 * (1 - i * 0.04), k = t - t0; if (k < 0 || k > 1.6) return; m.visible = true;
    const R = RNG('page', i), base = s.board.localToWorld(bchV(0, 6.85, 0.45));
    m.position.set(base.x + k * R.r(5, 8) + k * k * 2, base.y + k * R.r(1.5, 3.5) - k * k * 0.8 + Math.sin(k * 9 + i) * 0.3, base.z + k * R.r(2, 5));
    m.rotation.set(k * R.r(3, 6), 0.35 + k * R.r(2, 5), k * R.r(2, 5)); });
  const sl = EZ.back(clamp((t - (thirty - 0.08)) / 0.22)); s.sign30.scale.setScalar(Math.max(0.001, sl)); s.sign30.rotation.z = (1 - sl) * 0.4 - 0.04;
  c3SetCam(s.cam, bchCam(BCH_K12, lt, 's12', { orbit: 0.04, creep: 0.05, rush: 0.2 }));
  if (t > thirty && t < thirty + 0.15) s.cam.position.y += Math.sin((t - thirty) * 90) * 0.08;   // the slam knocks the lens
  bchFg(s, [['grass', [3.8, -6.2, -8], 2.4]], BCH_K12, 's12', lt, { orbit: 0.04, creep: 0.05, rush: 0.2 });
  bchRender(s, { bgBlur: 3.4 });
};
