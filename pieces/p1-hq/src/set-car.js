// =====================================================================
//  SET car — the car + battery vignettes: s16 s17 s18 s19 s25 s26 s27. Registers SHOT_FN[id] = (t, u, lt) => { ... }.
//    street   s16  the ride pulls up on "pulls", its front wheel hits the puddle and the splash soaks you
//             s17  the driver smirks out of the rolled-down window; you stand dripping on the kerb
//             s18  close on the driver: "long night, huh?" (smirk -> grin on "huh")
//             s19  close on you, deadpan: a long receipt prints out of the door sill, faster on "expensive"
//    bench    s25  full battery: rain stopped, you lounge on the bench, phone at 100 %; the street clock sweeps 10 minutes
//             s26  dying battery: rain again, phone at 1 % blinking, a giant hourglass drains; panic on "can't"
//    island   s27  you on a tiny island with a palm tree in a huge puddle, the water rising; pull back on "stranded"
//  People are c3Person billboards at CR_K (1.35x the props); a standing root sits CR_FOOT above the ground.
// =====================================================================
const CR = {};
const CR_K = 1.35, CR_FOOT = 2.55 * CR_K, CR_SEAT = 3.2;
const CR_YX = -10.5, CR_YZ = 8.4;   // where you stand on the kerb, left of the driver's window
const crW = (w, n, d) => wordT(w, n) ?? d;
const crDur = (id) => { const i = SHOT_LIST.findIndex((r) => r[0] === id), [a, b] = shotSpan(i); return b - a; };
const crT0 = (id) => SHOT_LIST.find((r) => r[0] === id)[1];
function crPerson(o, x, z, y = CR_FOOT) { const p = c3Person(o); c3Put(p.g, x, y, z, 0, 0, 0, CR_K); return p; }
// camera: never still — ~5 %/s creep toward the subject plus a slow orbit, accelerating over the last 0.35 s into the cut
function crCam(cam, K, lt, dur, o = {}) {
  const c = c3CamAt(K, lt), P = new THREE.Vector3(...c.p), Lk = new THREE.Vector3(...c.l), d = Lk.clone().sub(P), dist = d.length(); d.normalize();
  const tail = Math.min(1.6, Math.max(0, lt - (dur - 0.35)) / 0.35);
  P.addScaledVector(d, (o.push ?? 1) * dist * (0.05 * lt + 0.13 * tail * tail));
  const off = P.clone().sub(Lk).applyAxisAngle(new THREE.Vector3(0, 1, 0), (o.orbit ?? 0.04) * lt + (o.orbitEnd ?? 0.05) * tail * tail);
  P.copy(Lk).add(off); P.y += (o.crane ?? 0) * lt;
  c3SetCam(cam, { p: P.toArray(), l: Lk.toArray(), fov: c.fov });
}
const crRack = (lt, dur, a = 1.6, b = 3.8) => lerp(a, b, EZ.io(clamp(lt / Math.max(0.4, dur * 0.8))));
function crLamp(scene, x, y, z, c = '#ffc880', i = 1.6, dist = 18) { const l = new THREE.PointLight(c, i, dist, 2); l.position.set(x, y, z); l.layers.enableAll(); scene.add(l); return l; }
// foreground objects drawn blurred over everything; real parallax: they slide sideways past the lens over the shot
function crNear(scene, obj) { c3Layer(obj, C3.L_NEAR); scene.add(obj); (scene.userData.near ||= []).push(obj); obj.userData.p0 = obj.position.clone(); obj.userData.r0 = obj.rotation.y; return obj; }
function crNearDrift(scene, lt, dur, key = '', only) {
  (scene.userData.near || []).forEach((o, i) => { o.visible = !only || only.includes(i); if (!o.visible) return;
    const R = RNG('crdrift', key, i), p0 = o.userData.p0, side = Math.sign(p0.x) || 1, v = R.r(2.0, 2.8) * side, k = lt - dur * 0.45;
    o.position.set(p0.x + v * k, p0.y + Math.sin(lt * R.r(1.1, 1.7) + i) * 0.25, p0.z + R.n(1.0) * k * 0.3);
    o.rotation.y = o.userData.r0 + k * R.n(0.12); }); }
function crTex(draw, w = 256, h = 256) { return c3Tex(draw, w, h); }
const crDropTex = () => CR.dropTex ||= crTex((x, w, h) => { const g = x.createRadialGradient(w * 0.42, h * 0.38, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(190,225,255,0.95)'); g.addColorStop(0.8, 'rgba(110,170,230,0.7)'); g.addColorStop(1, 'rgba(110,170,230,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 64);
const crRingTex = () => CR.ringTex ||= crTex((x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(210,230,255,0.85)'; x.lineWidth = w * 0.05; x.beginPath(); x.arc(w / 2, h / 2, w * 0.42, 0, TAU); x.stroke(); }, 128, 128);
// a soft vertical glow streak lying on the wet road under a neon sign / lamp (its reflection)
function crReflection(scene, x, z, w, len, color) {
  const t = crTex((c, cw, ch) => { const g = c.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(cw / 2, ch * 0.5, cw * 0.45, ch * 0.5, 0, 0, TAU); c.fill(); }, 64, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.55, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z + len / 2); m.renderOrder = 1; scene.add(m); return m;
}

// ---- rain: cylindrical-billboard streaks falling through a box (bg layer: they blur with the background) and a few
// big blurred drops riding just in front of the lens (near layer)
function crRain(scene, n, box, key) {
  const mat = new THREE.MeshBasicMaterial({ color: '#d8e6ff', transparent: true, opacity: 0.32, depthWrite: false, toneMapped: false });
  mat.userData.glow = '#1c2436';
  const geo = new THREE.PlaneGeometry(0.035, 1.25), ds = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, mat); m.renderOrder = 7; scene.add(m); const R = RNG('crrain', key, i);
    ds.push({ m, x: R.r(box[0], box[1]), z: R.r(box[4], box[5]), ph: R.f(), v: R.r(20, 26) }); }
  const nm = new THREE.MeshBasicMaterial({ color: '#e8f0ff', transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false });
  const near = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 2.2), nm); m.layers.set(C3.L_NEAR); scene.add(m); near.push({ m, R: RNG('crrainN', key, i) }); }
  return { ds, near, box, mats: [mat, nm] };
}
function crRainAt(rain, t, cam, on = 1) {
  const [x0, x1, y0, y1] = rain.box, H = y1 - y0;
  rain.mats[0].opacity = 0.32 * on; rain.mats[1].opacity = 0.22 * on;
  rain.ds.forEach((d) => { d.m.visible = on > 0.01; if (!d.m.visible) return;
    const y = y1 - (((t * d.v / H) + d.ph) % 1) * H, x = d.x + (y1 - y) * 0.08;   // a little wind slant
    d.m.position.set(x, y, d.z); d.m.rotation.set(0, Math.atan2(cam.position.x - x, cam.position.z - d.z), 0.08); });
  const f = new THREE.Vector3(); cam.getWorldDirection(f); const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  rain.near.forEach(({ m, R }, i) => { m.visible = on > 0.01; if (!m.visible) return;
    const ph = ((t * R.r(1.4, 2.0)) + R.f()) % 1, dist = R.r(3.5, 7);
    m.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, R.r(-1, 1) * dist * 0.55); m.position.y += (0.5 - ph) * dist * 1.6;
    m.quaternion.copy(cam.quaternion); m.rotateZ(0.08); });
}
// rain rings popping on a puddle
function crRipples(scene, n, cx, cz, rx, rz, y, key) {
  const ps = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: crRingTex(), transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 2; scene.add(m); const R = RNG('crrip', key, i); ps.push({ m, x: cx + R.n(rx), z: cz + R.n(rz), ph: R.f(), p: R.r(0.6, 1.0) }); }
  return { ps, y };
}
function crRipplesAt(rp, t, on = 1, y) {
  rp.ps.forEach((q) => { const k = ((t / q.p) + q.ph) % 1; q.m.visible = on > 0.01; q.m.position.set(q.x, (y ?? rp.y) + 0.02, q.z);
    const s = 0.2 + k * 1.6; q.m.scale.set(s, s, 1); q.m.material.opacity = (1 - k) * 0.7 * on; });
}
// water dripping off a soaked person (world space, around their head/shoulders)
function crDrips(scene, n, key) { const ds = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.38), c3Flat('#ffffff', { map: crDropTex(), transparent: true, depthWrite: false })); m.renderOrder = 9; m.layers.set(C3.L_FOCUS); scene.add(m); ds.push({ m, R: RNG('crdrip', key, i) }); } return ds; }
function crDripsAt(ds, t, cam, cx, cy, cz, on = 1) {
  ds.forEach(({ m, R }) => { m.visible = on > 0; if (!on) return; const P = R.r(0.55, 0.9), ph = ((t / P) + R.f()) % 1;
    const sx = R.n(2.1), sy = R.r(-1.0, 3.6);
    m.position.set(cx + sx, cy + sy - ph * ph * 4.5, cz + 0.6); m.quaternion.copy(cam.quaternion); m.material.opacity = ph < 0.85 ? 1 : (1 - ph) / 0.15; m.scale.set(1, 1 + ph * 0.6, 1); });
}

// ---- the phone (in a person's hand, on their billboard): a dark rounded slab with a live screen
function crPhone() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 448; const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
  const g = new THREE.Group();
  g.add(c3Mesh(c3RBox(1.05, 1.85, 0.16, 0.14), c3Prop('#1c1c24', { rough: 0.25 }), 0.03));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.62), c3Flat('#ffffff', { map: tex, glow: '#20303a' })); scr.position.z = 0.09; g.add(scr);
  return { g, c, tex, scr };
}
function crPhoneDraw(ph, pct, blink) {
  const x = ph.c.getContext('2d'), w = ph.c.width, h = ph.c.height, red = pct <= 5, col = red ? '#ff3a30' : '#3ee87a';
  x.fillStyle = '#0c1018'; x.fillRect(0, 0, w, h);
  // status bar battery
  x.strokeStyle = '#e8eef8'; x.lineWidth = 3; x.strokeRect(w - 58, 14, 40, 18); x.fillStyle = '#e8eef8'; x.fillRect(w - 18, 19, 4, 8);
  x.fillStyle = col; x.fillRect(w - 55, 17, Math.max(3, 34 * pct / 100), 12);
  // the big battery in the middle
  const bw = w * 0.62, bh = h * 0.26, bx = (w - bw) / 2, by = h * 0.3;
  x.lineWidth = 10; x.strokeStyle = '#e8eef8'; x.beginPath(); x.roundRect(bx, by, bw, bh, 16); x.stroke(); x.fillStyle = '#e8eef8'; x.fillRect(bx + bw + 4, by + bh * 0.3, 14, bh * 0.4);
  if (!(red && blink)) { x.fillStyle = col; x.beginPath(); x.roundRect(bx + 12, by + 12, Math.max(14, (bw - 24) * pct / 100), bh - 24, 8); x.fill(); }
  x.font = '900 86px "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = red ? '#ff5a50' : '#ffffff';
  x.fillText(`${pct}%`, w / 2, h * 0.73);
  ph.tex.needsUpdate = true; ph.scr.material.userData.glow = red ? '#5a1008' : '#0c4a24';
}

// ---- the ride: an appealing rounded cartoon car facing -x, near side (+z) toward the kerb; the driver's window is open.
// Lower body and cabin are extruded side profiles with big bevels (soft, toy-like), real wheel arches, a cabin with window
// holes you can see the driver through, glass panes, a curved windshield, chrome bumpers and grille, round chunky tyres.
function crBuildCar(M) {
  const car = new THREE.Group(), body = new THREE.Group(); car.add(body);
  const paint = c3Prop('#7a44e0', { rough: 0.14, metal: 0.2, env: 1.5 }), glass = c3Prop('#1e2a4a', { rough: 0.04, metal: 0.65, env: 1.8 }), trim = c3Prop('#2a1650', { rough: 0.4 });
  const ext = (shape, depth, bev, mat, z0, ink = 0.05) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 6, curveSegments: 28 });
    g.translate(0, 0, z0); g.computeVertexNormals(); return c3Mesh(g, mat, ink); };
  // lower body: hood, doors, trunk, with two wheel arches cut into the bottom edge
  const lo = new THREE.Shape(); const AR = 2.35;
  lo.moveTo(-9.0, 2.1); lo.quadraticCurveTo(-9.1, 1.25, -8.2, 1.25); lo.lineTo(-5.8 - AR, 1.25);
  lo.absarc(-5.8, 1.55, AR, Math.PI, 0, true); lo.lineTo(5.8 - AR, 1.25); lo.absarc(5.8, 1.55, AR, Math.PI, 0, true);
  lo.lineTo(8.4, 1.25); lo.quadraticCurveTo(9.3, 1.3, 9.25, 2.5); lo.lineTo(9.05, 4.4); lo.quadraticCurveTo(8.9, 5.25, 7.9, 5.3);
  lo.lineTo(-3.4, 5.3); lo.quadraticCurveTo(-7.8, 5.15, -8.7, 4.6); lo.quadraticCurveTo(-9.15, 4.1, -9.0, 2.1);
  body.add(ext(lo, 5.9, 0.6, paint, -2.95));
  // the cabin (greenhouse): curved windshield line, round roof, sloped rear; the side windows are real holes
  const cab = new THREE.Shape();
  cab.moveTo(-3.7, 5.0); cab.quadraticCurveTo(-2.2, 7.4, -0.9, 8.45); cab.quadraticCurveTo(-0.3, 8.85, 0.8, 8.85); cab.lineTo(4.4, 8.85);
  cab.quadraticCurveTo(5.7, 8.85, 6.3, 7.7); cab.quadraticCurveTo(6.9, 6.3, 7.6, 5.0); cab.lineTo(-3.7, 5.0);
  const w1 = (sh) => { sh.moveTo(-2.45, 5.8); sh.quadraticCurveTo(-1.4, 7.4, -0.45, 8.0); sh.lineTo(1.65, 8.0); sh.lineTo(1.65, 5.8); sh.lineTo(-2.45, 5.8); };
  const w2 = (sh) => { sh.moveTo(2.25, 5.8); sh.lineTo(2.25, 8.0); sh.lineTo(4.4, 8.0); sh.quadraticCurveTo(5.3, 8.0, 5.7, 7.2); sh.quadraticCurveTo(6.0, 6.5, 6.5, 5.8); sh.lineTo(2.25, 5.8); };
  const h1 = new THREE.Path(); w1(h1); const h2 = new THREE.Path(); w2(h2); cab.holes.push(h1, h2);
  body.add(ext(cab, 4.9, 0.45, paint, -2.45, 0.045));
  // dark interior (hides the far window holes), seat backs, a dashboard
  body.add(pl(10.5, 3.8, c3Prop('#120a18', { rough: 0.9 }), 1.6, 6.9, -1.6));
  body.add(rb(2.6, 2.8, 0.5, c3Prop('#3a2040', { rough: 0.8 }), 0.6, 6.4, -0.6, 0.02)); body.add(rb(2.6, 2.8, 0.5, c3Prop('#3a2040', { rough: 0.8 }), 3.8, 6.4, -0.6, 0.02));
  body.add(rb(2.0, 0.6, 4.6, c3Prop('#241430', { rough: 0.6 }), -2.6, 5.9, 0, 0.02));
  // glass: tilted windshield + rear window, side panes (far side + rear near side); the driver's pane rolls down
  const pane = (shapeFn, z) => { const sh = new THREE.Shape(); shapeFn(sh); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 16), glass); m.position.z = z; return m; };
  body.add(pane(w2, 2.45)); body.add(pane(w1, -2.45)); body.add(pane(w2, -2.45));
  const win = pane(w1, 2.42); win.geometry.translate(0, -6.4, 0); win.position.y = 6.4; body.add(win);   // closed at y 6.4 (s17 rolls it down)
  const tilt = (cx, cy, ang, len, nx) => { const o = new THREE.Group(); o.position.set(cx, cy, 0); o.rotation.z = ang; const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, len), glass); m.rotation.y = nx * Math.PI / 2; o.add(m); body.add(o); return o; };
  tilt(-2.45, 6.85, -0.62, 4.1, -1); tilt(6.95, 6.5, 0.42, 3.0, 1);
  // chrome: rounded bumpers, a grille
  const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 8, 20);
  for (const x of [-9.55, 9.6]) { const bp = c3Mesh(cap(0.42, 6.0), M.chrome, 0.025); bp.rotation.x = Math.PI / 2; bp.position.set(x, 1.9, 0); body.add(bp); }
  const gr = c3Mesh(c3RBox(0.3, 1.3, 3.6, 0.15), M.chrome, 0.02); gr.position.set(-9.5, 3.2, 0); body.add(gr);
  for (let k = 0; k < 4; k++) body.add(rb(0.12, 0.12, 3.2, c3Flat('#1a1424'), -9.65, 2.75 + k * 0.3, 0, 0));
  // door seam, a light side stripe, chrome handles, a mirror, the RIDE light on the roof (no text)
  body.add(rb(0.07, 3.6, 0.07, trim, 1.95, 3.4, 3.58, 0)); body.add(rb(15.5, 0.16, 0.06, c3Prop('#c8b8ff', { rough: 0.3 }), 0, 4.4, 3.58, 0));
  for (const x of [-0.8, 4.3]) body.add(rb(1.0, 0.22, 0.22, M.chrome, x, 4.0, 3.62, 0.012));
  const mir = new THREE.Group(); mir.add(rb(0.3, 0.3, 0.9, paint, 0, 0, 0.45, 0.02)); const mh = c3Mesh(new THREE.SphereGeometry(0.55, 16, 12), paint, 0.03); mh.scale.set(0.6, 0.8, 1); mh.position.set(0, 0.2, 1.0); mir.add(mh);
  mir.position.set(-3.4, 5.6, 2.9); body.add(mir);
  const pill = c3Mesh(cap(0.5, 2.4), c3Flat('#efe2ff', { glow: '#8a60ff' }), 0.03); pill.rotation.z = Math.PI / 2; pill.position.set(2.2, 9.6, 0); body.add(pill);
  // the receipt printer on the door sill (s19): a little chrome box with a slot, under the open window
  const printer = new THREE.Group(); printer.add(rb(1.5, 0.55, 0.9, M.chrome, 0, 0, 0, 0.02)); printer.add(rb(1.1, 0.08, 0.2, c3Flat('#0a0a0a'), 0, -0.28, 0.42, 0));
  printer.position.set(-1.2, 5.75, 3.75); body.add(printer);
  // lights: round headlights with chrome rims and glow cones into the rain, red tail lights
  const head = c3Flat('#fff6d8', { glow: '#ffe8a0' });
  for (const z of [2.2, -2.2]) { const hl = c3Mesh(new THREE.SphereGeometry(0.8, 20, 14), head, 0.03); hl.scale.set(0.45, 1, 1); hl.position.set(-9.35, 3.95, z); body.add(hl);
    const rim = c3Mesh(new THREE.TorusGeometry(0.8, 0.12, 8, 24), M.chrome, 0.01); rim.rotation.y = Math.PI / 2; rim.position.set(-9.45, 3.95, z); body.add(rim);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.4, 14, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff2c8', transparent: true, opacity: 0.09, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    cone.material.userData.glow = '#2a2618'; cone.rotation.z = -Math.PI / 2 - 0.06; cone.position.set(-16.5, 3.3, z); cone.renderOrder = 6; body.add(cone); }
  for (const z of [2.4, -2.4]) { const tl = c3Mesh(new THREE.SphereGeometry(0.55, 16, 12), c3Flat('#ff3030', { glow: '#ff2010' }), 0.02); tl.scale.set(0.4, 1.2, 1); tl.position.set(9.6, 3.9, z); body.add(tl); }
  // wheels: chunky round tyres (torus + sidewall), chrome hubcaps with 5 spokes; they spin with distance
  const wheels = [], tyreM = c3Prop('#18161c', { rough: 0.65 });
  for (const [x, z] of [[-5.8, 3.0], [5.8, 3.0], [-5.8, -3.0], [5.8, -3.0]]) { const w = new THREE.Group(); w.position.set(x, 1.6, z);
    w.add(c3Mesh(new THREE.TorusGeometry(1.15, 0.5, 18, 36), tyreM, 0.04));
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.9, 32), tyreM); wall.rotation.x = Math.PI / 2; w.add(wall);
    const hub = c3Mesh(new THREE.SphereGeometry(0.85, 24, 12, 0, TAU, 0, Math.PI / 2), M.chrome, 0.02); hub.rotation.x = Math.sign(z) * Math.PI / 2; hub.scale.set(1, 0.45, 1); hub.position.z = Math.sign(z) * 0.4; w.add(hub);
    for (let k = 0; k < 5; k++) { const o = new THREE.Group(); o.rotation.z = k / 5 * TAU; o.position.z = Math.sign(z) * 0.78; o.add(rb(0.16, 0.75, 0.06, c3Prop('#3a3a44', { rough: 0.4 }), 0, 0.35, 0, 0)); w.add(o); }
    body.add(w); wheels.push(w); }
  // wipers on the windshield
  const wipers = []; for (const z of [1.5, -1.0]) { const wp = new THREE.Group(); wp.position.set(-3.3, 5.35, z); wp.rotation.order = 'ZXY'; wp.rotation.z = -0.62; wp.add(rb(0.12, 2.6, 0.12, c3Prop('#1a1a1a', { rough: 0.5 }), 0, 1.3, 0, 0)); body.add(wp); wipers.push(wp); }
  return { car, body, wheels, wipers, win, printer };
}

// ---- the street at night: wet road, kerb and sidewalk, a row of shops with neon across the road, lamp posts
function crBuildStreet() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  const key = lights(scene, { amb: '#7080c0', ambI: 0.22, sky: '#4060a0', ground: '#100810', key: '#a8bcff', keyI: 0.5, keyP: [-8, 22, 14], rim: '#ffb070', rimI: 0.3, rimP: [10, 9, -12] });
  scene.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.25; });
  const M = { chrome: c3Chrome(), road: c3Prop('#1a1f28', { rough: 0.18, metal: 0.35, env: 0.9 }), walk: c3Prop('#262c36', { rough: 0.35, metal: 0.25, env: 0.7 }), kerb: c3Prop('#8a8696', { rough: 0.5 }), dark: c3Prop('#1c1a24', { rough: 0.5 }) };
  scene.add(pl(160, 120, M.road, 0, 0, -10, 0, -Math.PI / 2));
  for (let i = -6; i <= 6; i++) scene.add(pl(2.6, 0.35, c3Flat('#c8c080'), i * 7, 0.02, -2.0, 0, -Math.PI / 2));   // centre dashes
  const walk = rb(160, 0.7, 14, M.walk, 0, 0.35, 12.0, 0); scene.add(walk);
  scene.add(rb(160, 0.75, 0.7, M.kerb, 0, 0.38, 5.1, 0.02));
  for (let i = -12; i <= 12; i++) scene.add(pl(0.06, 13.6, c3Flat('#3a3644'), i * 3.4, 0.72, 12, 0, -Math.PI / 2));   // paving joints
  // the puddle by the kerb (s16 splash) + a few more on the road
  const puddleM = c3Prop('#101a2c', { rough: 0.04, metal: 0.6, env: 1.8 });
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 40), puddleM); puddle.rotation.x = -Math.PI / 2; puddle.scale.set(4.6, 2.0, 1); puddle.position.set(-5.4, 0.03, 3.4); scene.add(puddle);
  for (const [x, z, sx, sz] of [[9, 1.5, 3.2, 1.4], [-16, -4, 4, 1.6], [18, -6, 3, 1.2]]) { const p = new THREE.Mesh(new THREE.CircleGeometry(1, 32), puddleM); p.rotation.x = -Math.PI / 2; p.scale.set(sx, sz, 1); p.position.set(x, 0.025, z); scene.add(p); }
  // the shops across the road: brick/plaster fronts with lit windows, awnings and neon
  const signs = [['DINER', '#ff4aa0', '#ffd0e8'], ['OPEN 24H', '#4ad8ff', '#d8f6ff'], ['LAUNDRY', '#ffd24a', '#fff2c0'], ['PIZZA', '#ff6a3a', '#ffd8c0'], ['MOTEL', '#7aff8a', '#e0ffe4']];
  for (let i = 0; i < 9; i++) { const R = RNG('crshop', i), w = R.r(9, 12.5), h = R.r(15, 24), x = -46 + i * 11.4;
    const tw = texWindows(30 + i); tw.repeat.set(w / 7, h / 9);
    scene.add(rb(w, h, 8, c3Prop('#ffffff', { map: tw, rough: 0.5, emissive: '#ffffff', ei: 0.55, emissiveMap: tw }), x, h / 2, -22, 0.04));
    scene.add(rb(w - 1, 4.2, 0.4, c3Prop(['#5a2a3a', '#2a3a5a', '#3a2a1a', '#2a4a3a'][i % 4], { rough: 0.6 }), x, 2.6, -17.8, 0.02));
    scene.add(pl(w - 2, 3.4, c3Flat('#ffd8a0', { glow: '#7a4a18' }), x, 2.8, -17.55));      // warm shop window
    const aw = rb(w - 0.6, 0.5, 3.2, c3Prop(['#c83a3a', '#3a8ac8', '#e8a030', '#5aa85a'][i % 4], { rough: 0.5 }), x, 5.6, -16.2, 0.03); aw.rotation.x = 0.28; scene.add(aw);
    if (i % 2 === 0) { const [txt, c1, c2] = signs[(i / 2) % signs.length]; const sg = pl(w * 0.72, w * 0.18, c3Flat('#ffffff', { map: texSign(txt, c1, c2, 0.62), glow: c1 }), x, 8.6, -17.7); scene.add(sg);
      crLamp(scene, x, 7.5, -14, c1, 1.6, 24); crReflection(scene, x, -16, w * 0.55, 16, c1); } }
  // lamp posts along our kerb + their pools of warm light
  for (const x of [-20, 8, 30]) { const lp = new THREE.Group(); lp.add(cyl(0.22, 0.3, 13, M.dark, 0, 6.5, 0, 0.03)); lp.add(rb(2.8, 0.3, 0.3, M.dark, -1.3, 13, 0, 0.02));
    const bulb = c3Mesh(new THREE.SphereGeometry(0.6, 14, 10), c3Flat('#fff0c8', { glow: '#ffd890' })); bulb.position.set(-2.6, 12.6, 0); lp.add(bulb); lp.position.set(x, 0.7, 6.4); scene.add(lp);
    crLamp(scene, x - 2.6, 11.6, 6.4, '#ffd8a0', 1.3, 20); crReflection(scene, x - 2.6, 0, 2.6, 10, '#ffd8a0'); }
  // a fire hydrant and a parking meter on the sidewalk; a mailbox
  const hyd = new THREE.Group(); hyd.add(cyl(0.6, 0.7, 2.2, c3Prop('#c82a2a', { rough: 0.35 }), 0, 1.1, 0)); hyd.add(c3Mesh(new THREE.SphereGeometry(0.62, 14, 10), c3Prop('#c82a2a', { rough: 0.35 }), 0.03).translateY(2.2)); hyd.position.set(-14, 0.7, 7.4); scene.add(hyd);
  const mbox = rb(2.0, 3.4, 1.8, c3Prop('#2a4ab0', { rough: 0.35 }), 14, 2.4, 8.4, 0.04); scene.add(mbox);
  // the car + the people
  const focus = new THREE.Group(); scene.add(focus);
  const car = crBuildCar(M); focus.add(car.car);
  const you = crPerson({ key: 'you', outfit: 'teal', hairStyle: 'ref' }, CR_YX, CR_YZ, 0.7 + CR_FOOT); focus.add(you.g);
  const driver = crPerson({ key: 'driver', outfit: 'navy', hairStyle: 'bald', fx: ['mustache'] }, -0.2, 1.3, 2.1); car.body.add(driver.g);
  for (const n of ['legL', 'legR']) Object.values(driver.limbs[n]).forEach((m) => { if (m && m.isMesh) m.visible = false; });   // seated inside: no legs under the car
  driver.shadow.visible = false; driver.shadow.material.opacity = 0;
  const phone = crPhone(); phone.g.scale.setScalar(0.9); you.root.add(phone.g); phone.g.visible = false;
  // the receipt: a long paper strip hanging out of the printer slot (grows in s19)
  const rc = document.createElement('canvas'); rc.width = 256; rc.height = 1536; { const x = rc.getContext('2d'); x.fillStyle = '#fbf8ee'; x.fillRect(0, 0, 256, 1536);
    const line = (y, txt, sz = 26, col = '#2a2a2a', al = 'left') => { x.font = `700 ${sz}px Consolas, "Courier New", monospace`; x.fillStyle = col; x.textAlign = al; x.fillText(txt, al === 'left' ? 18 : 128, y); };
    line(60, 'RIDE  RECEIPT', 30, '#2a2a2a', 'center'); line(96, '- - - - - - - - - -', 22, '#888', 'center');
    line(150, 'BASE FARE   18.00'); line(190, 'BOOKING      2.40'); line(230, 'RAIN          ...');
    x.strokeStyle = '#d02a20'; x.lineWidth = 5; x.strokeRect(14, 262, 228, 64); line(306, 'SURGE  x 1.9', 32, '#d02a20', 'center');
    for (let k = 0; k < 12; k++) line(380 + k * 40, ['LATE NIGHT    3.50', 'WET SEATS     4.00', 'DIM SCREEN    2.00', 'NO MAP        1.50', 'SPLASH        0.99', 'IT\'S LATE     1.00'][k % 6], 22, '#3a3a3a');
    line(900, '- - - - - - - - - -', 22, '#888', 'center'); line(960, 'TOTAL', 34, '#1a1a1a', 'center'); line(1030, '$34.90', 64, '#1a1a1a', 'center');
    line(1110, 'THANK YOU :)', 24, '#555', 'center'); for (let k = 0; k < 9; k++) line(1180 + k * 38, '. . . . . . . . . .', 22, '#bbb', 'center'); }
  const rtex = new THREE.CanvasTexture(rc); rtex.encoding = THREE.sRGBEncoding;
  const pc = crTex((x, w, h) => { x.fillStyle = '#fbf8ee'; x.fillRect(0, 0, w, h); x.font = '700 22px Consolas, monospace'; x.fillStyle = '#4a4a4a'; for (let k = 0; k < 30; k++) x.fillText(['SURGE x1.9  ...', 'LATE NIGHT  3.50', 'RAIN TAX    2.00', 'TOTAL  $34.90'][k % 4], 18, 40 + k * 48); }, 256, 1536);
  const pile = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.0), c3Flat('#ffffff', { map: pc, side: THREE.DoubleSide })); pile.renderOrder = 5; pile.visible = false;
  const receipt = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.0), c3Flat('#ffffff', { map: rtex, side: THREE.DoubleSide })); receipt.renderOrder = 5; car.body.add(receipt); receipt.visible = false;
  // splash drops and big water blobs (s16), drips off you (s17, s19)
  const splash = []; for (let i = 0; i < 150; i++) { const R = RNG('crspl', i), big = i < 22; const m = new THREE.Mesh(new THREE.PlaneGeometry(big ? 2.0 : 0.5, big ? 1.6 : 0.5), c3Flat('#ffffff', { map: crDropTex(), transparent: true, depthWrite: false })); m.renderOrder = 9; focus.add(m);
    splash.push({ m, vx: R.r(-7.5, -1.0), vy: R.r(big ? 7 : 9, big ? 11 : 19), vz: R.r(2.5, 8.5), big }); }
  const drips = crDrips(scene, 16, 'you');
  c3Layer(focus, C3.L_FOCUS);
  const rain = crRain(scene, 340, [-34, 34, 0, 26, -16, 24], 'street');
  const rip = crRipples(scene, 26, -2, 2, 14, 4, 0.03, 'street');
  // foreground: the hydrant-side bollard and a lamp-post base, slid past the lens
  const bol = new THREE.Group(); bol.add(cyl(0.5, 0.55, 3.6, c3Prop('#e8c040', { rough: 0.4 }), 0, 1.8, 0, 0.03)); bol.position.set(-10, 0.7, 23); crNear(scene, bol);
  const post = new THREE.Group(); post.add(cyl(0.45, 0.55, 18, M.dark, 0, 9, 0, 0.03)); post.position.set(9, 0.7, 22); crNear(scene, post);
  c3Env(scene, { top: '#5a70b0', mid: '#262a3a', bot: '#080610', cards: [[0, 30, -20, 30, 8, '#ffb060'], [-30, 10, 10, 10, 18, '#4ad8ff'], [25, 8, -10, 8, 14, '#ffc870']] });
  c3Shadows(scene, key, 26);
  const hl = crLamp(scene, -14, 3.5, 0, '#fff0c8', 0, 22);   // headlight spill on the road (moves with the car)
  focus.add(pile); pile.layers.set(C3.L_FOCUS);
  return { scene, cam, car, you, driver, phone, receipt, rtex, pile, splash, drips, rain, rip, hl, puddle };
}
const crStreet = () => CR.street ||= crBuildStreet();
// the car's x as it pulls up and stops at x = 0 (ease-out over 1 s, stop at ts)
const crCarX = (t, ts) => (t >= ts ? 0 : 40 * Math.pow(clamp((ts - t) / 1.0), 3));
function crCarAt(g, t, ts, cam) {
  const x = crCarX(t, ts), moving = t < ts; g.car.car.position.set(x, 0, 0);
  // a little nose dip as it brakes, settling after the stop
  const brake = t < ts ? 0.03 * (1 - clamp((ts - t) / 1.0)) : 0.03 * Math.exp(-(t - ts) * 5) * Math.cos((t - ts) * 14);
  g.car.body.rotation.z = brake;
  const dist = crCarX(0, ts) - x; g.car.wheels.forEach((w) => { w.rotation.z = dist / 1.5; });
  g.car.wipers.forEach((w, i) => { w.rotation.x = Math.sin(t * 5.2 + i * 0.3) * 0.9; });
  g.hl.position.set(x - 14, 3.5, 0); g.hl.intensity = 1.6;
  return moving;
}
function crStreetCommon(g, t, cam) { crRainAt(g.rain, t, cam, 1); crRipplesAt(g.rip, t, 1); }

// s16 — "The driver pulls up": the ride slides in from the right and stops on "up"; its front wheel hits the puddle and the
// splash drenches you (jolt + shock on the splash)
SHOT_FN['s16'] = (t, u, lt) => {
  const g = crStreet(), dur = crDur('s16'), pulls = crW('pulls', 1, 20.68), ts = crW('up', 1, 20.96) + 0.06;
  const tsp = pulls + 0.06;   // the front wheel reaches the puddle
  crCam(g.cam, [[0, [-19, 3.4, 31], [-5, 4.8, 5], 50], [dur, [-17.5, 3.8, 28.5], [-5, 5.0, 5], 50]], lt, dur, { orbit: -0.05 });
  crCarAt(g, t, ts, g.cam); g.car.win.visible = true; g.car.win.position.y = 6.4; g.receipt.visible = false; g.pile.visible = false;
  // splash: drops fly from the wheel toward the kerb and you, under gravity
  g.splash.forEach((d, i) => { const k = t - (tsp + (i % 7) * 0.012); d.m.visible = k > 0 && k < 1.0;
    if (!d.m.visible) return; d.m.position.set(-5.4 + d.vx * k * (d.big ? 0.75 : 1), 0.6 + d.vy * k - 16 * k * k, 3.6 + d.vz * k);
    d.m.quaternion.copy(g.cam.quaternion); const s = d.big ? 1 + k * 1.4 : 1; d.m.scale.set(s, s, 1); d.m.material.opacity = Math.min(1, (1 - k) * 2); });
  const hit = tsp + 0.32, lift = (v) => (v < hit ? 0 : 0.4 * Math.exp(-(v - hit) * 7) * Math.cos((v - hit) * 16));
  c3PersonPose(g.you, g.cam, t, { expr: c3FaceAt([[0, 'neutral'], [hit, 'shocked']], t, 'you'), gaze: [0.8, -0.1], head: [0, 0, 0], lift,
    hand: t < hit ? { armL: [1.25, 1.2], armR: [-1.25, 1.2] } : { armL: [1.9, 3.3], armR: [-1.9, 3.3] }, x: t > hit + 0.1 ? ['sweat'] : [] });
  c3PersonPose(g.driver, g.cam, t, { expr: 'neutral', gaze: [-0.6, 0], idle: 0.5, hand: { armL: [1.5, 2.6], armR: [-1.4, 2.6] } });
  crDripsAt(g.drips, t, g.cam, CR_YX, 6.9, CR_YZ, t > hit + 0.15 ? 1 : 0);
  crStreetCommon(g, t, g.cam); g.phone.g.visible = false;
  crNearDrift(g.scene, lt, dur, '16');
  c3Render(g.scene, g.cam, { bg: '#06060e', bgBlur: crRack(lt, dur, 1.4, 3.0), nearBlur: 11, glow: 0.75, glowBlur: 16, bloom: 0.32 });
};

// s17 — "looks at you, soaking wet, and goes,": the window rolls down, the driver leans to it smirking; you drip on the kerb
SHOT_FN['s17'] = (t, u, lt) => {
  const g = crStreet(), dur = crDur('s17'), looks = crW('looks', 1, 21.34), soak = crW('soaking', 1, 21.96), goes = crW('goes', 1, 22.8);
  crCam(g.cam, [[0, [-18, 6.6, 27], [-5, 6.0, 5], 48], [dur, [-17, 6.5, 25], [-5, 6.0, 5], 48]], lt, dur, { orbit: 0.04 });
  crCarAt(g, t, 0, g.cam);
  const down = EZ.io(clamp((t - looks) / 0.4)); g.car.win.position.y = 6.4 - down * 3.0; g.car.win.visible = down < 0.99;
  g.receipt.visible = false; g.pile.visible = false; g.splash.forEach((d) => { d.m.visible = false; });
  c3PersonPose(g.driver, g.cam, t, { expr: c3FaceAt([[0, 'neutral'], [looks + 0.1, 'smug']], t, 'driver'), gaze: [-0.9, 0.05], head: [0.08, 0, 0], idle: 0.7,
    hand: { armL: c3Hold([[0, [1.4, 2.4]], [looks + 0.4, [1.95, 3.0]]], t), armR: [-1.4, 2.4] } });
  c3PersonPose(g.you, g.cam, t, { expr: c3FaceAt([[0, 'sad'], [soak, 'unimpressed']], t, 'you'), gaze: [0.85, 0], head: [-0.05, 0, -0.12],
    hand: { armL: [1.3, 0.9], armR: [-1.3, 0.9] }, x: ['sweat'] });
  crDripsAt(g.drips, t, g.cam, CR_YX, 6.9, CR_YZ, 1);
  crStreetCommon(g, t, g.cam);
  crNearDrift(g.scene, lt, dur, '17');
  c3Render(g.scene, g.cam, { bg: '#06060e', bgBlur: crRack(lt, dur, 1.8, 3.6), nearBlur: 11, glow: 0.75, glowBlur: 16, bloom: 0.32 });
};

// s18 — "long night, huh?": close on the driver at his window, smirk -> grin on "huh"
SHOT_FN['s18'] = (t, u, lt) => {
  const g = crStreet(), dur = crDur('s18'), huh = crW('huh', 1, 23.56);
  crCam(g.cam, [[0, [0.4, 6.9, 17.5], [-1.6, 6.5, 3], 46], [dur, [0.0, 6.8, 16.0], [-1.6, 6.5, 3], 46]], lt, dur, { orbit: 0.08, push: 1.3 });
  crCarAt(g, t, 0, g.cam); g.car.win.visible = false; g.receipt.visible = false; g.pile.visible = false; g.splash.forEach((d) => { d.m.visible = false; });
  c3PersonPose(g.driver, g.cam, t, { expr: c3FaceAt([[0, 'smirk'], [huh, 'grin']], t, 'driver'), gaze: [-0.9, 0.05], head: c3Hold([[0, [0.08, 0, 0]], [huh, [-0.06, 0, 0.05]]], t, 4 / 30), idle: 1,
    hand: { armL: [1.95, 3.0], armR: [-1.4, 2.4] } });
  c3PersonPose(g.you, g.cam, t, { expr: 'unimpressed', gaze: [0.85, 0], head: [-0.05, 0, -0.12], hand: { armL: [1.3, 0.9], armR: [-1.3, 0.9] }, x: ['sweat'] });
  crDripsAt(g.drips, t, g.cam, CR_YX, 6.9, CR_YZ, 1);
  crStreetCommon(g, t, g.cam);
  crNearDrift(g.scene, lt, dur, '18');
  c3Render(g.scene, g.cam, { bg: '#06060e', bgBlur: crRack(lt, dur, 2.6, 4.2), nearBlur: 11, glow: 0.75, glowBlur: 16, bloom: 0.32 });
};

// s19 — "Yeah, expensive night, too.": close on you, deadpan; a long receipt spills out of the door-sill printer, faster on "expensive"
SHOT_FN['s19'] = (t, u, lt) => {
  const g = crStreet(), dur = crDur('s19'), yeah = crW('yeah', 1, 23.84), exp = crW('expensive', 1, 24.26), too = crW('too', 1, 25.26);
  crCam(g.cam, [[0, [-16.5, 7.0, 21], [-8, 6.2, 7], 48], [dur, [-15.5, 6.9, 19.5], [-7.6, 6.2, 7], 48]], lt, dur, { orbit: -0.05 });
  crCarAt(g, t, 0, g.cam); g.car.win.visible = false; g.splash.forEach((d) => { d.m.visible = false; });
  // the strip: grows out of the slot, slowly at first, then racing on "expensive", curling out over the kerb
  const L = 0.3 + 3.2 * EZ.o2(clamp((t - yeah) / 0.45)) + 10.5 * EZ.io(clamp((t - exp) / (too - exp + 0.25)));
  const Lmax = 14.4; g.receipt.visible = true;
  // it hangs from the slot down to the ground (4.6), then the rest piles out over the road toward you
  const hang = Math.min(L, 5.3), pile = Math.max(0, L - 5.3);
  g.receipt.scale.set(1, hang, 1); g.receipt.position.set(-1.2, 5.48 - hang / 2, 4.25); g.receipt.rotation.set(-0.06, 0, Math.sin(t * 3) * 0.03);
  g.rtex.repeat.set(1, hang / Lmax); g.rtex.offset.set(0, 1 - hang / Lmax);
  g.pile.visible = pile > 0.05; g.pile.scale.set(1, Math.max(0.05, pile), 1); g.pile.position.set(-1.2 - pile * 0.25, 0.08, 4.3 + pile / 2); g.pile.rotation.set(-Math.PI / 2, 0, 0.5 * clamp(pile / 6));
  c3PersonPose(g.you, g.cam, t, { expr: c3FaceAt([[0, 'deadpan'], [exp, 'unimpressed'], [too, 'deadpan']], t, 'you'), gaze: [0.7, 0.25], head: c3Hold([[0, [-0.04, 0, -0.1]], [exp, [0.05, 0.05, -0.1]]], t, 5 / 30),
    hand: { armL: [1.3, 0.9], armR: [-1.3, 0.9] }, x: ['sweat'] });
  c3PersonPose(g.driver, g.cam, t, { expr: 'smirk', gaze: [-0.9, 0.05], head: [0.08, 0, 0], hand: { armL: [1.95, 3.0], armR: [-1.4, 2.4] } });
  crDripsAt(g.drips, t, g.cam, CR_YX, 6.9, CR_YZ, 1);
  crStreetCommon(g, t, g.cam);
  crNearDrift(g.scene, lt, dur, '19');
  c3Render(g.scene, g.cam, { bg: '#06060e', bgBlur: crRack(lt, dur, 2.0, 3.8), nearBlur: 11, glow: 0.75, glowBlur: 16, bloom: 0.32 });
};

// ---- the bench: a bus-stop bench under a lamp, a shop window behind, a big street clock (s25) and a giant hourglass (s26)
function crBuildBench() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  const key = lights(scene, { amb: '#7080c0', ambI: 0.22, sky: '#4060a0', ground: '#100810', key: '#a8bcff', keyI: 0.45, keyP: [-8, 22, 14], rim: '#ffb070', rimI: 0.45, rimP: [10, 9, -12] });
  scene.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.25; });
  const M = { chrome: c3Chrome(), wood: c3Prop('#ffffff', { map: texWood(), rough: 0.45 }), walk: c3Prop('#3c4450', { rough: 0.42, metal: 0.15, env: 0.6 }), dark: c3Prop('#1c1a24', { rough: 0.5 }), brass: c3Chrome('#e8c060', { rough: 0.15 }) };
  scene.add(pl(120, 80, M.walk, 0, 0, 0, 0, -Math.PI / 2));
  for (let i = -10; i <= 10; i++) scene.add(pl(0.06, 40, c3Flat('#3a3644'), i * 3.4, 0.02, 0, 0, -Math.PI / 2));
  // the shop front behind: a big warm window with blinds, a door, brick wall, neon "OPEN"
  const brick = crTex((x, w, h) => { x.fillStyle = '#5a2e2a'; x.fillRect(0, 0, w, h); for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) { x.fillStyle = `hsl(${8 + (i * 7 + j * 3) % 6},${38 + (i + j) % 8}%,${26 + (i * 3 + j) % 7}%)`; x.fillRect(i * w / 8 + (j % 2) * w / 16 + 2, j * h / 16 + 2, w / 8 - 4, h / 16 - 4); } }, 256, 256);
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(10, 4);
  scene.add(pl(70, 26, c3Prop('#ffffff', { map: brick, rough: 0.8 }), 0, 13, -6));
  scene.add(rb(16, 9, 0.4, M.dark, -1, 6.5, -5.8, 0.03)); scene.add(pl(15, 8, c3Flat('#ffd8a0', { map: texBlinds(), glow: '#6a3a10' }), -1, 6.5, -5.55));
  scene.add(rb(4.6, 9.4, 0.5, c3Prop('#2a4a3a', { rough: 0.5 }), 11, 4.7, -5.7, 0.03));
  scene.add(pl(5.2, 1.8, c3Flat('#ffffff', { map: texSign('OPEN', '#ff4aa0', '#ffd0e8', 0.62), glow: '#ff4aa0' }), -1, 12.2, -5.5));
  crLamp(scene, -1, 10, -3, '#ff4aa0', 1.2, 20); crLamp(scene, -1, 6, -2, '#ffcf90', 1.3, 18);
  // the bench (seat top at CR_SEAT), a bin, the lamp post with its warm pool
  const bench = new THREE.Group(); bench.add(rb(10, 0.35, 2.6, M.wood, 0, CR_SEAT - 0.18, 0, 0.03)); bench.add(rb(10, 2.0, 0.3, M.wood, 0, CR_SEAT + 1.5, -1.25, 0.03));
  for (const x of [-4.4, 4.4]) { bench.add(rb(0.3, CR_SEAT - 0.3, 2.4, M.dark, x, (CR_SEAT - 0.3) / 2, 0, 0.02)); bench.add(rb(0.3, 2.4, 0.3, M.dark, x, CR_SEAT + 1.2, -1.3, 0.02)); }
  bench.position.set(0, 0, 2); scene.add(bench);
  scene.add(cyl(1.0, 0.85, 3.2, c3Prop('#2a6a4a', { rough: 0.4 }), 7.2, 1.6, 2.4));
  const lp = new THREE.Group(); lp.add(cyl(0.22, 0.3, 15, M.dark, 0, 7.5, 0, 0.03)); lp.add(rb(3.2, 0.3, 0.3, M.dark, 1.4, 15, 0, 0.02));
  const bulb = c3Mesh(new THREE.SphereGeometry(0.65, 14, 10), c3Flat('#fff0c8', { glow: '#ffd890' })); bulb.position.set(2.9, 14.6, 0); lp.add(bulb); lp.position.set(-8, 0, 3); scene.add(lp);
  const pool = crLamp(scene, -5, 13.5, 3, '#ffd8a0', 2.4, 26);
  // the street clock on a post (s25): a big round face, hands that sweep
  const clock = new THREE.Group(); clock.add(cyl(0.35, 0.45, 12, M.dark, 0, 6, 0, 0.03));
  const ring = c3Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.7, 40), M.brass, 0.04); ring.rotation.x = Math.PI / 2; ring.position.y = 13.6; clock.add(ring);
  const face = new THREE.Mesh(new THREE.CircleGeometry(2.45, 48), c3Flat('#ffffff', { map: crTex((x, w, h) => { x.fillStyle = '#fbf3dc'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a1a10'; x.font = '700 40px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let k = 1; k <= 12; k++) { const a = k / 12 * TAU - Math.PI / 2; x.fillText(String(k), w / 2 + Math.cos(a) * w * 0.38, h / 2 + Math.sin(a) * h * 0.38); }
    for (let k = 0; k < 60; k++) { const a = k / 60 * TAU; x.fillRect(w / 2 + Math.cos(a) * w * 0.46 - 2, h / 2 + Math.sin(a) * h * 0.46 - 2, 4, 4); } }, 512, 512), glow: '#3a3020' }));
  face.position.set(0, 13.6, 0.37); clock.add(face);
  const mk = (len, wd, c) => { const g = new THREE.Group(); const m = rb(wd, len, 0.08, c3Flat(c), 0, len / 2 - 0.2, 0, 0); g.add(m); g.position.set(0, 13.6, 0.46); clock.add(g); return g; };
  const hourH = mk(1.4, 0.26, '#2a1a10'), minH = mk(2.1, 0.16, '#2a1a10');
  clock.add(c3Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.brass, 0.01).translateY(13.6).translateZ(0.5));
  clock.position.set(6.8, 0, 0); scene.add(clock);
  // the giant hourglass (s26): wooden caps on three posts, two glass bulbs, sand that drains
  const hg = new THREE.Group(); const capM = c3Prop('#8a5228', { rough: 0.4 });
  hg.add(cyl(2.4, 2.4, 0.6, capM, 0, 0.3, 0)); hg.add(cyl(2.4, 2.4, 0.6, capM, 0, 9.1, 0));
  for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; hg.add(cyl(0.18, 0.18, 8.2, capM, Math.cos(a) * 2.05, 4.7, Math.sin(a) * 2.05, 0.02, 10)); }
  const prof = []; for (let i = 0; i <= 24; i++) { const v = i / 24, y = 0.6 + v * 8.2, r = 0.25 + 1.75 * Math.pow(Math.abs(Math.cos(v * Math.PI)), 0.7); prof.push(new THREE.Vector2(r, y)); }
  const glassM = new THREE.MeshStandardMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.3, roughness: 0.02, metalness: 0.3, envMapIntensity: 2.2, depthWrite: false }); glassM.toneMapped = false;
  const bulbs = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), glassM); bulbs.renderOrder = 6; hg.add(bulbs);
  const sandM = c3Prop('#d8801e', { rough: 0.6, emissive: '#7a3e08', ei: 0.35 }), sandTopM = c3Prop('#d8801e', { rough: 0.6, emissive: '#c06a14', ei: 0.9, side: THREE.DoubleSide });   // the top cone's visible side faces down: lit by emission
  const top = c3Mesh(new THREE.ConeGeometry(1.6, 2.6, 32), sandTopM, 0.02); top.rotation.x = Math.PI; hg.add(top);
  const bot = c3Mesh(new THREE.ConeGeometry(1.75, 1.0, 32), sandM, 0.02); hg.add(bot);
  const stream = cyl(0.06, 0.06, 1, sandM, 0, 0, 0, 0, 8); hg.add(stream);
  hg.scale.setScalar(1.3); hg.position.set(-6.4, 0, 4.4); scene.add(hg);
  const hgLight = new THREE.SpotLight('#ffc070', 0, 30, 0.6, 0.5, 1.2); hgLight.position.set(-2, 18, 12); hgLight.target = hg; hgLight.layers.enableAll(); scene.add(hgLight);
  const focus = new THREE.Group(); scene.add(focus);
  const you = crPerson({ key: 'you', outfit: 'teal', hairStyle: 'ref' }, 0.4, 3.0, CR_SEAT); focus.add(you.g);
  const phone = crPhone(); phone.g.scale.setScalar(1.45); you.root.add(phone.g);
  c3Layer(focus, C3.L_FOCUS); c3Layer(hg, C3.L_FOCUS); c3Layer(clock, C3.L_FOCUS);
  const rain = crRain(scene, 300, [-30, 30, 0, 26, -6, 24], 'bench');
  const rip = crRipples(scene, 22, 0, 8, 14, 6, 0.02, 'bench');
  const bin = new THREE.Group(); bin.add(cyl(1.2, 1.0, 3.6, c3Prop('#2a6a4a', { rough: 0.4 }), 0, 1.8, 0)); bin.position.set(-9, 0, 22); crNear(scene, bin);
  const sign = new THREE.Group(); sign.add(cyl(0.2, 0.2, 14, M.dark, 0, 7, 0, 0.02)); sign.add(rb(2.6, 2.6, 0.2, c3Prop('#2a5ab0', { rough: 0.4 }), 0, 12.5, 0, 0.03)); sign.position.set(9.5, 0, 21); crNear(scene, sign);
  c3Env(scene, { top: '#5a70b0', mid: '#262a3a', bot: '#080610', cards: [[0, 30, -20, 30, 8, '#ffb060'], [-30, 10, 10, 10, 18, '#4ad8ff'], [25, 8, -10, 8, 14, '#ffc870']] });
  c3Shadows(scene, key, 22);
  return { scene, cam, you, phone, clock, hourH, minH, hg, hgLight, top, bot, stream, rain, rip, pool, key };
}
const crBench = () => CR.bench ||= crBuildBench();

// s25 — "Because with a full battery, you can wait ten minutes and check again.": the rain has stopped; you lounge on the bench,
// phone at 100 %; the street clock's minute hand sweeps ten minutes on "wait ten minutes"; you glance back at the phone on "check"
SHOT_FN['s25'] = (t, u, lt) => {
  const g = crBench(), dur = crDur('s25'), full = crW('full', 1, 37.58), wait = crW('wait', 2, 38.74), mins = crW('minutes', 1, 39.22), check = crW('check', 1, 39.84);
  g.hg.visible = false; g.hgLight.intensity = 0; g.clock.visible = true; crRainAt(g.rain, t, g.cam, 0); crRipplesAt(g.rip, t, 0);
  g.pool.intensity = 3.0; g.key.intensity = 0.55;
  crCam(g.cam, [[0, [2.4, 7.2, 27], [3.0, 6.6, 2], 50], [dur, [3.8, 7.4, 24], [3.4, 6.8, 2], 50]], lt, dur, { orbit: 0.05, crane: 0.15 });   // slightly above: the screen tilts up to us
  const sweep = EZ.io(clamp((t - wait) / (check - wait))), mAng = -(TAU * (50 / 60) + sweep * TAU / 6);   // 11:50 -> 12:00
  g.minH.rotation.z = mAng; g.hourH.rotation.z = -(TAU * (11 / 12) + (50 + sweep * 10) / 60 * TAU / 12);
  crPhoneDraw(g.phone, 100, false);
  // the phone sits in both hands in front of his chest, its screen tilted up toward the camera: we read 100 % and he reads it too
  const atClock = c3Hold([[0, 0], [wait - 0.05, 1], [check - 0.05, 0]], t, 5 / 30), raise = c3Hold([[0, 0], [check - 0.05, 1]], t, 5 / 30);
  g.phone.g.position.set(0.35, lerp(1.25, 1.75, raise), 0.35); g.phone.g.rotation.set(-0.35, 0, 0.04);
  const hy = lerp(0.65, 1.15, raise);
  c3PersonPose(g.you, g.cam, t, { expr: c3FaceAt([[0, 'smile'], [full, 'proud'], [wait, 'whistling'], [check, 'happy']], t, 'you'),
    gaze: atClock > 0.5 ? [0.9, 0.6] : [0.1, -0.9], head: atClock > 0.5 ? [-0.08, 0.05, 0.04] : [0.05, 0, -0.08],
    hand: { armL: [0.95, hy], armR: [-0.25, hy] }, foot: { legL: [-0.2, -2.0], legR: [0.9, -2.3] } });
  crNearDrift(g.scene, lt, dur, '25');
  c3Render(g.scene, g.cam, { bg: '#06060e', bgBlur: crRack(lt, dur, 1.4, 3.0), nearBlur: 11, glow: 0.7, glowBlur: 16, bloom: 0.34 });
};

// s26 — "With a dying one, you can't.": the rain is back; phone at 1 % blinking, the giant hourglass drains fast; panic on "can't"
SHOT_FN['s26'] = (t, u, lt) => {
  const g = crBench(), dur = crDur('s26'), dying = crW('dying', 1, 40.9), cant = crW('cant', 1, 41.84), t0 = crT0('s26');
  g.hg.visible = true; g.clock.visible = false; crRainAt(g.rain, t, g.cam, 1); crRipplesAt(g.rip, t, 1);
  crCam(g.cam, [[0, [-3.4, 7.0, 30], [-2.6, 6.2, 2.5], 50], [dur, [-3.0, 7.2, 28.5], [-2.6, 6.2, 2.5], 50]], lt, dur, { orbit: -0.07, push: 1.1 });
  // sand: top cone shrinks, bottom grows, a thin stream between them
  const k = clamp((t - t0 + 0.4) / (dur + 0.6)), top = 1 - k;
  g.top.scale.set(Math.max(0.05, Math.sqrt(top)), Math.max(0.05, top), Math.max(0.05, Math.sqrt(top))); g.top.position.y = 4.85 + 1.3 * Math.max(0.05, top);
  g.bot.scale.set(0.6 + 0.4 * k, 0.4 + 2.2 * k, 0.6 + 0.4 * k); g.bot.position.y = 0.6 + (0.4 + 2.2 * k) * 0.5;
  const sTop = 4.7, sBot = 0.6 + (0.4 + 2.2 * k); g.stream.scale.set(1, sTop - sBot, 1); g.stream.position.y = (sTop + sBot) / 2; g.stream.visible = top > 0.04;
  const blink = Math.floor(t * 4) % 2 === 1; crPhoneDraw(g.phone, 1, blink);
  g.phone.g.position.set(0.3, 1.45, 0.35); g.phone.g.rotation.set(-0.3, 0, -0.05);   // held out in front, screen to camera: 1 % red
  g.hgLight.intensity = 1.1; g.pool.intensity = 2.4; g.key.intensity = 0.6;
  const lift = (v) => (v < cant ? 0 : 0.32 * Math.exp(-(v - cant) * 7) * Math.cos((v - cant) * 15));
  c3PersonPose(g.you, g.cam, t, { expr: c3FaceAt([[0, 'worried'], [dying, 'scared'], [cant, 'panic']], t, 'you'), gaze: [-0.4, 0.5], head: [-0.04, 0, -0.08], lift,
    hand: { armL: [0.85, 0.9], armR: [-0.25, 0.9] }, foot: { legL: [0.8, -2.2], legR: [-0.8, -2.2] }, x: t >= cant ? ['sweat'] : [] });
  crNearDrift(g.scene, lt, dur, '26');
  c3Render(g.scene, g.cam, { bg: '#06060e', bgBlur: crRack(lt, dur, 1.6, 3.4), nearBlur: 11, glow: 0.75, glowBlur: 16, bloom: 0.32 });
};

// ---- the island: a tiny sand island with one palm tree in the middle of a flooded night street
function crBuildIsland() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
  const key = lights(scene, { amb: '#7080c0', ambI: 0.22, sky: '#4060a0', ground: '#100810', key: '#a8bcff', keyI: 0.55, keyP: [-8, 22, 14], rim: '#ffb070', rimI: 0.55, rimP: [10, 9, -12] });
  scene.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.25; });
  const M = { dark: c3Prop('#1c1a24', { rough: 0.5 }) };
  // the street far around: shop fronts with neon all round the flood
  for (let i = 0; i < 12; i++) { const R = RNG('crisl', i), w = R.r(9, 13), h = R.r(14, 26), a = -0.9 + i * 0.16, x = Math.sin(a) * 60, z = -Math.cos(a) * 60;
    const tw = texWindows(60 + i); tw.repeat.set(w / 7, h / 9);
    const b = rb(w, h, 8, c3Prop('#ffffff', { map: tw, rough: 0.5, emissive: '#ffffff', ei: 0.55, emissiveMap: tw }), x, h / 2 - 1, z, 0.04); b.rotation.y = -a; scene.add(b);
    if (i % 3 === 0) { const s = pl(w * 0.7, w * 0.17, c3Flat('#ffffff', { map: texSign(['DINER', 'OPEN 24H', 'MOTEL', 'PIZZA'][(i / 3) % 4], ['#ff4aa0', '#4ad8ff', '#7aff8a', '#ff6a3a'][(i / 3) % 4], '#ffffff', 0.62), glow: ['#ff4aa0', '#4ad8ff', '#7aff8a', '#ff6a3a'][(i / 3) % 4] }), x * 0.93, 8, z * 0.93); s.rotation.y = -a; scene.add(s); } }
  for (const x of [-24, 22]) { const lp = new THREE.Group(); lp.add(cyl(0.25, 0.32, 14, M.dark, 0, 7, 0, 0.03)); const bb = c3Mesh(new THREE.SphereGeometry(0.7, 14, 10), c3Flat('#fff0c8', { glow: '#ffd890' })); bb.position.y = 14; lp.add(bb); lp.position.set(x, -1, -22); scene.add(lp); crLamp(scene, x, 12, -20, '#ffd8a0', 2.0, 30); }
  // the water: a dark glossy flood (rises over the shot), with rain rings; a submerged road line shows through
  const water = new THREE.Mesh(new THREE.CircleGeometry(90, 64), c3Prop('#2c6a96', { rough: 0.05, metal: 0.35, env: 2.0 })); water.rotation.x = -Math.PI / 2; scene.add(water);
  scene.add(pl(160, 160, c3Prop('#1a1c26', { rough: 0.6 }), 0, -1.2, 0, 0, -Math.PI / 2));
  // the island + palm
  const focus = new THREE.Group(); scene.add(focus);
  const island = c3Mesh(new THREE.SphereGeometry(5.2, 36, 18, 0, TAU, 0, Math.PI / 2), c3Prop('#f0b860', { rough: 0.85 }), 0.05); island.scale.set(1, 0.42, 0.8); island.position.y = -0.6; focus.add(island);
  const palm = new THREE.Group(); const trunkM = c3Prop('#8a5a32', { rough: 0.7 });
  for (let k = 0; k < 7; k++) { const s = cyl(0.42 - k * 0.03, 0.48 - k * 0.03, 1.6, trunkM, Math.sin(k * 0.22) * 1.6 * k / 6, 1.0 + k * 1.45, 0, 0.03, 12); s.rotation.z = -0.12 - k * 0.025; palm.add(s); }
  const crown = new THREE.Group(); crown.position.set(1.6, 11.0, 0); palm.add(crown);
  for (let i = 0; i < 8; i++) { const lf = c3Mesh(new THREE.SphereGeometry(1, 14, 8), c3Prop('#2f8a44', { rough: 0.55 }), 0.04); lf.scale.set(3.2, 0.16, 0.85); const a = i / 8 * TAU;
    lf.position.set(Math.cos(a) * 2.6, -0.6 - Math.abs(Math.sin(a)) * 0.4, Math.sin(a) * 2.0); lf.rotation.set(0, -a, -0.35); crown.add(lf); }
  for (let i = 0; i < 3; i++) crown.add(c3Mesh(new THREE.SphereGeometry(0.42, 12, 8), c3Prop('#6a4a2a', { rough: 0.5 }), 0.02).translateX(Math.cos(i * 2.1) * 0.5).translateY(-0.5).translateZ(Math.sin(i * 2.1) * 0.5));
  palm.position.set(3.6, 1.0, -2.8); focus.add(palm);
  const you = crPerson({ key: 'you', outfit: 'teal', hairStyle: 'ref' }, -1.2, 0.6, 1.3 + CR_FOOT); focus.add(you.g);
  crLamp(scene, 2, 16, 8, '#ffd8a0', 2.6, 34); crLamp(scene, -14, 8, -6, '#4ad8ff', 1.2, 30);
  const phone = crPhone(); phone.g.scale.setScalar(1.3); you.root.add(phone.g);
  c3Layer(focus, C3.L_FOCUS);
  const rain = crRain(scene, 340, [-34, 34, 0, 28, -20, 26], 'island');
  const rip = crRipples(scene, 40, 0, 2, 20, 12, 0.1, 'island');
  // foreground: a half-sunken street sign and a floating traffic cone
  const sg = new THREE.Group(); sg.add(cyl(0.22, 0.22, 16, M.dark, 0, 7, 0, 0.02)); sg.add(rb(3.2, 3.2, 0.2, c3Prop('#e8c040', { rough: 0.4 }), 0, 13, 0, 0.03)); sg.position.set(-10, -1, 24); crNear(scene, sg);
  const cone = c3Mesh(new THREE.ConeGeometry(1.2, 3.2, 20), c3Prop('#ff7a2a', { rough: 0.4 }), 0.04); cone.position.set(10, 1.4, 24); cone.rotation.z = 0.7; crNear(scene, cone);
  c3Env(scene, { top: '#5a70b0', mid: '#262a3a', bot: '#080610', cards: [[0, 30, -20, 30, 8, '#ffb060'], [-30, 10, 10, 10, 18, '#4ad8ff'], [25, 8, -10, 8, 14, '#ffc870']] });
  c3Shadows(scene, key, 22);
  return { scene, cam, water, island, palm, crown, you, phone, rain, rip };
}
const crIsland = () => CR.island ||= crBuildIsland();

// s27 — "Every second you wait is a second closer to being stranded.": close on you on the little island, the water creeping up;
// on "stranded" the camera rips back and up to show the tiny island alone in the flooded street
SHOT_FN['s27'] = (t, u, lt) => {
  const g = crIsland(), dur = crDur('s27'), t0 = crT0('s27'), closer = crW('closer', 1, 44.44), str = crW('stranded', 1, 45.16);
  const rise = EZ.io(clamp((t - t0) / (dur + 0.3))); const wy = lerp(-0.2, 1.05, rise); g.water.position.y = wy;
  const back = EZ.io(clamp((t - (str - 0.15)) / 0.55));
  crCam(g.cam, [[0, [1.0, 9.0, 24], [0.2, 5.6, 0], 48], [closer - t0, [1.4, 9.4, 27], [0.4, 5.4, 0], 48], [dur, [2.0, 10.4, 30], [0.4, 5.0, 0], 50]], lt, dur, { orbit: 0.06, push: 0.6 });   // island + palm + you all in frame
  if (back > 0) { const P = g.cam.position.clone(), Lk = new THREE.Vector3(-0.4, 4.2, 0.5); g.cam.position.lerp(new THREE.Vector3(2.5, 26, 46), back); g.cam.fov = lerp(46, 52, back); g.cam.lookAt(Lk.lerp(new THREE.Vector3(-0.6, 6.4, 0.5), 1 - back)); g.cam.updateProjectionMatrix(); }
  g.crown.rotation.set(0, Math.sin(t * 1.3) * 0.05, Math.sin(t * 2.1) * 0.06);
  g.phone.g.visible = true; crPhoneDraw(g.phone, 1, Math.floor(t * 4) % 2 === 1); g.phone.g.position.set(0.3, 1.4, 0.35); g.phone.g.rotation.set(-0.3, 0, 0);
  crRainAt(g.rain, t, g.cam, 1); crRipplesAt(g.rip, t, 1, wy);
  const lift = (v) => (v < str ? 0 : 0.3 * Math.exp(-(v - str) * 7) * Math.cos((v - str) * 15));
  c3PersonPose(g.you, g.cam, t, { expr: c3FaceAt([[0, 'nervous'], [closer, 'worried'], [str, 'panic']], t, 'you'), gaze: [0, -0.7], head: [0.04, 0, -0.06], lift,
    hand: { armL: [0.85, 0.85], armR: [-0.25, 0.85] }, x: t >= str ? ['sweat'] : [] });
  crNearDrift(g.scene, lt, dur, '27');
  c3Render(g.scene, g.cam, { bg: '#06060e', bgBlur: crRack(lt, dur, 1.2, 2.8), nearBlur: 11, glow: 0.75, glowBlur: 16, bloom: 0.32 });
};
