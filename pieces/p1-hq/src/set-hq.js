// =====================================================================
//  SET hq — the ride company HQ at night: s20 the glass tower in the rain, s21 the control room, s22 the wall of
//  battery levels zooming into one red 1 %, s23 the economist at the podium, s24 the battery bar chart, s28 a row of
//  people at 1 % all hitting YES in the rain, s29 the press conference. Registers SHOT_FN[id] = (t, u, lt) => { ... }.
//  Helpers are prefixed shq. People are c3Person billboards at SHQ_K x the props (refs: people are big).
// =====================================================================
const SHQ = {};
const SHQ_K = 1.35;
const shqW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const shqSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// camera: knots give the move; a ~5 %/s creep keeps it alive; the last ~0.35 s rushes into the cut (refs)
function shqCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = shqSpan(id), dur = b - a;
  const p = new THREE.Vector3(...c.p), l = new THREE.Vector3(...c.l), d = l.clone().sub(p), dist = d.length(); d.normalize();
  const tail = Math.max(0, lt - (dur - 0.35));
  p.addScaledVector(d, 0.05 * dist * lt * (o.creep ?? 1) + (o.rush ?? 1) * dist * (0.06 * tail * tail / 0.1225 + 0.04 * tail));
  if (o.orbit) { const v = p.clone().sub(l).applyAxisAngle(new THREE.Vector3(0, 1, 0), o.orbit * (lt + tail * 1.5)); p.copy(l).add(v); }
  return { p: p.toArray(), l: l.toArray(), fov: c.fov };
}
const shqRack = (lt, id, a, b) => { const [t0, t1] = shqSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
const shqNear = (obj) => { c3Layer(obj, C3.L_NEAR); return obj; };
// blurred foreground travels across the frame with parallax, never glued to the screen
function shqDrift(list, cam, lt, id, k = 1) {
  const [a, b] = shqSpan(id), u = clamp(lt / (b - a));
  cam.updateMatrixWorld(true);
  const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
  list.forEach((o, i) => {
    o.userData.base ||= o.position.clone();
    const dist = o.userData.base.distanceTo(cam.position), sgn = i % 2 ? -1 : 1, amp = 0.42 * dist * Math.tan(cam.fov * DEG / 2) * k;
    o.position.copy(o.userData.base).addScaledVector(right, sgn * amp * (EZ.io(u) * 2 - 1)).addScaledVector(up, amp * 0.12 * Math.sin(lt * 1.7 + i));
  });
}
function shqPerson(o, x, y, z, k = SHQ_K) { const p = c3Person(o); p.g.position.set(x, y, z); p.g.scale.setScalar(k); return p; }
function shqHold(p, obj, z = 0.06) { p.root.add(obj); obj.position.z = z; return obj; }
const shqRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#0c0a14', bgBlur: 3.0, glow: 0.6, glowBlur: 16, bloom: 0.32 }, o));
function shqScene(fov = 50) { return { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(fov, W / H, 0.1, 900) }; }
const SHQ_STAND = { foot: { legL: [0.55, -3.0], legR: [-0.55, -3.0] } };
const SHQ_OUT = ['stripes', 'navy', 'plaid', 'white', 'mustard', 'teal'], SHQ_HAIR = ['ref', 'brown', 'long', 'white', 'bald', 'ref', 'brown', 'long'];

// ---- rain: thin streak quads falling on a loop, a pure function of t
function shqRain(scene, n, box, o = {}) {
  const [x0, x1, y0, y1, z0, z1] = box, geo = new THREE.PlaneGeometry(0.035, o.len ?? 1.1);
  const m = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: o.color ?? '#bcd4ff', transparent: true, opacity: o.op ?? 0.4, depthWrite: false, toneMapped: false }), n);
  m.frustumCulled = false; m.renderOrder = 8; scene.add(m);
  const R = RNG('rain', o.seed ?? 0), seeds = Array.from({ length: n }, () => [R.r(x0, x1), R.r(0, 1), R.r(z0, z1), R.r(0.8, 1.2)]);
  m.userData.upd = (t) => {
    const M = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.12)), sc = new THREE.Vector3(1, 1, 1);
    seeds.forEach(([x, f, z, sp], i) => { const y = y0 + mod(f * (y1 - y0) - t * 24 * sp, y1 - y0); M.compose(new THREE.Vector3(x + (y - y0) * 0.12, y, z), q, sc); m.setMatrixAt(i, M); });
    m.instanceMatrix.needsUpdate = true;
  };
  return m;
}
// a phone held in a billboard hand: glowing screen with a 1 % battery or a big YES
function shqPhoneTex(mode) {
  return c3Tex((x, w, h) => {
    x.fillStyle = '#0e1420'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ff3a2a'; x.strokeStyle = '#ffffff'; x.lineWidth = 6; x.strokeRect(w * 0.58, h * 0.05, w * 0.28, h * 0.07); x.fillRect(w * 0.6, h * 0.065, w * 0.04, h * 0.04); x.fillRect(w * 0.86, h * 0.075, w * 0.03, h * 0.03);
    inked(x, '1%', w * 0.34, h * 0.085, h * 0.06, '#ff5a3a', { stroke: false });
    if (mode === 'yes') { x.fillStyle = '#2acb6a'; x.beginPath(); x.roundRect(w * 0.1, h * 0.55, w * 0.8, h * 0.2, 30); x.fill(); inked(x, 'YES', w / 2, h * 0.65, h * 0.11, '#ffffff', { stroke: false }); }
    else { inked(x, '$34', w / 2, h * 0.38, h * 0.12, '#ffffff', { stroke: false }); x.fillStyle = '#3a4a6a'; x.beginPath(); x.roundRect(w * 0.1, h * 0.55, w * 0.8, h * 0.2, 30); x.fill(); inked(x, 'ACCEPT?', w / 2, h * 0.65, h * 0.08, '#ffffff', { stroke: false }); }
  }, 256, 480);
}
function shqPhone(texA, texB) {
  const g = new THREE.Group();
  g.add(rb(0.95, 1.8, 0.12, c3Prop('#1a1a22', { rough: 0.25, metal: 0.4 }), 0, 0, 0, 0.02));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.62), c3Flat('#ffffff', { map: texA, glow: '#4a6aa0' })); scr.position.z = 0.07; g.add(scr);
  g.userData.set = (yes) => { scr.material.map = yes ? texB : texA; scr.material.needsUpdate = true; };
  return g;
}
// a YES speech bubble that pops (scale spring) above a head
function shqBubbleTex(txt, c) {
  return c3Tex((x, w, h) => { x.fillStyle = c; x.strokeStyle = C3.ink; x.lineWidth = 12; x.beginPath(); x.roundRect(14, 14, w - 28, h * 0.7, 50); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(w * 0.42, h * 0.7 + 8); x.lineTo(w * 0.5, h * 0.95); x.lineTo(w * 0.58, h * 0.7 + 8); x.closePath(); x.fill(); x.stroke();
    inked(x, txt, w / 2, h * 0.37, h * 0.36, '#ffffff', { stroke: C3.ink, sw: h * 0.05 }); }, 512, 320);
}
function shqMonitorTex(seed, kind) {   // control-room screens: a city map with dots, a line chart, a battery list
  return c3Tex((x, w, h) => {
    const R = RNG('mon', seed); x.fillStyle = '#0a1a2a'; x.fillRect(0, 0, w, h);
    if (kind === 0) { x.strokeStyle = '#1f4a6a'; x.lineWidth = 3; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(0, R.r(0, h)); x.lineTo(w, R.r(0, h)); x.stroke(); x.beginPath(); x.moveTo(R.r(0, w), 0); x.lineTo(R.r(0, w), h); x.stroke(); }
      for (let i = 0; i < 40; i++) { x.fillStyle = R.f() < 0.2 ? '#ff4a3a' : '#3aff9a'; x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(3, 7), 0, TAU); x.fill(); } }
    else if (kind === 1) { x.strokeStyle = '#3ad0ff'; x.lineWidth = 6; x.beginPath(); for (let i = 0; i <= 20; i++) x.lineTo(i * w / 20, h * (0.8 - 0.6 * i / 20 + R.n(0.08))); x.stroke();
      x.fillStyle = 'rgba(58,208,255,0.15)'; x.fillRect(0, h * 0.85, w, h * 0.15); }
    else { for (let i = 0; i < 6; i++) { const v = R.r(0, 100) | 0, y = h * (0.1 + i * 0.14); x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.strokeRect(w * 0.1, y, w * 0.25, h * 0.08);
      x.fillStyle = v < 20 ? '#ff4a3a' : '#3aff9a'; x.fillRect(w * 0.11, y + 3, w * 0.23 * v / 100, h * 0.08 - 6); inked(x, v + '%', w * 0.6, y + h * 0.04, h * 0.07, '#ffffff', { stroke: false }); } }
  }, 512, 320);
}
function shqDesk(scene, x, z, M, seed) {   // a control-room desk: top, two glowing monitors, keyboard, mug, cable, papers
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  g.add(rb(6.0, 0.3, 2.6, M.desk, 0, 3.4, 0, 0.03)); g.add(rb(5.8, 3.2, 0.2, M.deskFront, 0, 1.7, 1.2, 0.03));
  for (const sx of [-1.4, 1.4]) { const mon = new THREE.Group(); mon.position.set(sx, 4.9, -0.6); mon.rotation.y = -sx * 0.12;
    mon.add(rb(2.5, 1.6, 0.15, M.dark, 0, 0, 0, 0.02)); mon.add(pl(2.3, 1.42, c3Flat('#ffffff', { map: shqMonitorTex(seed * 3 + (sx > 0 ? 1 : 0), (seed + (sx > 0 ? 1 : 0)) % 3), glow: '#1a4a7a' }), 0, 0, 0.09));
    mon.add(cyl(0.08, 0.08, 1.0, M.dark, 0, -1.2, -0.05, 0.01, 8)); g.add(mon); }
  g.add(rb(2.2, 0.08, 0.7, M.dark, 0, 3.6, 0.6, 0.01));
  g.add(mug(['#c8321e', '#f4ecd8', '#2a6ad8'][seed % 3], 2.5, 3.55, 0.5));
  g.add(pl(1.0, 1.3, c3Prop('#f6f1e4', { rough: 0.8 }), -2.4, 3.56, 0.5, 0.3, -Math.PI / 2));
  const cable = cyl(0.05, 0.05, 3.4, M.dark, 1.6, 1.7, -1.0, 0.01, 6); g.add(cable);
  return g;
}

// =====================================================================
//  s20 — "But here's the weird part": fly in through the rain to the glass tower with the big RIDE CO. sign
// =====================================================================
// the HQ facade: glass curtain wall, floor by floor — dark blue glass, lit offices (warm and cool), a few dark ones,
// blinds half down, spandrel bands between floors (they read as floors from far away)
function shqFacadeTex(seed, cols = 10, rows = 24) {
  return c3Tex((x, w, h) => {
    const R = RNG('facade', seed), cw = w / cols, rh = h / rows;
    x.fillStyle = '#0b1424'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const v = R.f(), px = i * cw + 3, py = j * rh + rh * 0.22, ww = cw - 6, hh = rh * 0.74;
      const g = x.createLinearGradient(0, py, 0, py + hh);
      if (v < 0.42) { g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#ffb868'); }          // warm office
      else if (v < 0.62) { g.addColorStop(0, '#cfe6ff'); g.addColorStop(1, '#7ab0e8'); }     // cool office (screens)
      else { g.addColorStop(0, '#1d2c48'); g.addColorStop(1, '#101a30'); }                   // dark glass reflecting the sky
      x.fillStyle = g; x.fillRect(px, py, ww, hh);
      if (v < 0.62 && R.f() < 0.45) { x.fillStyle = 'rgba(40,30,30,0.45)'; x.fillRect(px, py, ww, hh * R.r(0.2, 0.6)); }   // blinds
      if (v < 0.62 && R.f() < 0.35) { x.fillStyle = 'rgba(30,20,20,0.55)'; x.fillRect(px + ww * R.r(0.2, 0.6), py + hh * 0.55, ww * 0.12, hh * 0.45); }   // someone at a desk
    }
    for (let j = 0; j <= rows; j++) { x.fillStyle = '#2a3446'; x.fillRect(0, j * rh, w, rh * 0.2); }   // spandrels = floor lines
    x.fillStyle = 'rgba(0,0,0,0.55)'; for (let i = 0; i <= cols; i++) x.fillRect(i * cw - 2, 0, 4, h);   // mullion shadows
  }, 512, 1024);
}
function shqBuildTower() {
  const s = shqScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#7080b0', ambI: 0.5, sky: '#4a5a90', ground: '#100810', key: '#a8b8ff', keyI: 0.6, keyP: [-10, 30, 20], rim: '#ff8a4a', rimI: 0.8 });
  // the wet street: dark asphalt with long neon reflections, lane marks, a sidewalk in front of the lobby
  const road = c3Tex((x, w, h) => { x.fillStyle = '#1c1c28'; x.fillRect(0, 0, w, h); const R = RNG('road');
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,190,110' : '110,240,200'},${R.r(0.05, 0.16)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(3, 10), R.r(40, 160)); }
    x.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 8; i++) x.fillRect(w / 2 - 4, i * h / 8, 8, h / 16); }, 512, 512);
  road.wrapS = road.wrapT = THREE.RepeatWrapping; road.repeat.set(4, 6);
  scene.add(pl(400, 400, c3Prop('#ffffff', { map: road, rough: 0.12, metal: 0.35 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(rb(120, 0.6, 14, c3Prop('#4a4a58', { rough: 0.5 }), 0, 0.3, -22, 0.03));   // sidewalk
  // the tower: body + setback crown, curtain-wall texture, real mullions and floor bands on the front face
  const T = { x: 0, z: -40, w: 30, d: 22, h: 110 };
  const glass = (seed, rx, ry) => { const t = shqFacadeTex(seed); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
    return c3Prop('#ffffff', { map: t, rough: 0.08, metal: 0.4, emissive: '#ffffff', ei: 0.85, emissiveMap: t }); };
  const body = c3Mesh(new THREE.BoxGeometry(T.w, T.h, T.d), glass(91, 1.2, 4.6), 0.07); body.position.set(T.x, T.h / 2, T.z); scene.add(body);
  const crown = c3Mesh(new THREE.BoxGeometry(T.w * 0.72, 22, T.d * 0.72), glass(92, 0.9, 0.9), 0.06); crown.position.set(T.x, T.h + 11, T.z); scene.add(crown);
  const metal = c3Prop('#c8d0dc', { rough: 0.25, metal: 0.8 }), dark = c3Prop('#1a2030', { rough: 0.3, metal: 0.5 });
  const front = T.z + T.d / 2;
  for (let i = 0; i <= 12; i++) scene.add(rb(0.35, T.h, 0.5, metal, T.x - T.w / 2 + i * T.w / 12, T.h / 2, front + 0.2, 0.0));   // vertical mullions
  for (let j = 1; j < 14; j++) scene.add(rb(T.w + 0.4, 0.45, 0.7, dark, T.x, j * T.h / 14, front + 0.3, 0.015));                // floor bands
  scene.add(rb(T.w + 1.2, 1.4, T.d + 1.2, metal, T.x, T.h + 0.7, T.z, 0.03));                                                 // setback ledge
  scene.add(rb(T.w * 0.72 + 0.8, 1.2, T.d * 0.72 + 0.8, metal, T.x, T.h + 22.6, T.z, 0.03));                                  // crown cap
  scene.add(cyl(0.3, 0.6, 18, metal, T.x + 4, T.h + 32, T.z, 0.02, 10));                                                      // antenna
  s.beacon = c3Mesh(new THREE.SphereGeometry(0.9, 14, 10), c3Flat('#ff3a2a', { glow: '#ff2a1a' }), 0.0); s.beacon.position.set(T.x + 4, T.h + 41.5, T.z); scene.add(s.beacon);
  // the big RIDE CO. sign on the facade: a framed light box with a logo ring, glowing, readable from the street
  const signTex = c3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0f3a34'); g.addColorStop(1, '#06201c'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#5affc8'; x.lineWidth = 14; x.strokeRect(10, 10, w - 20, h - 20);
    x.fillStyle = '#5affc8'; x.beginPath(); x.arc(h * 0.62, h / 2, h * 0.3, 0, TAU); x.fill(); x.fillStyle = '#06201c'; x.beginPath(); x.arc(h * 0.62, h / 2, h * 0.14, 0, TAU); x.fill();
    inked(x, 'RIDE CO.', w * 0.62, h * 0.53, h * 0.56, '#ffffff', { stroke: '#0a5a44', sw: h * 0.06, maxW: w * 0.58 }); }, 1024, 320);
  const signG = new THREE.Group(); signG.position.set(T.x, 52, front + 0.9); scene.add(signG);
  signG.add(rb(24, 7.8, 0.8, dark, 0, 0, -0.3, 0.05));
  signG.add(pl(23, 7.2, c3Flat('#c8d0cc', { map: signTex, glow: '#0e6a50' }), 0, 0, 0.12));   // dimmed so bloom keeps the letters readable
  for (const sx of [-9, 9]) signG.add(rb(0.4, 3.2, 1.4, metal, sx, 4.8, -0.2, 0.02));   // brackets
  // the lobby: a glowing double-height glass front with a canopy and its own small sign
  const lobby = c3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff2c8'); g.addColorStop(1, '#ffb860'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(60,40,20,0.55)'; for (let i = 1; i < 8; i++) x.fillRect(i * w / 8 - 3, 0, 6, h); x.fillRect(0, h * 0.5, w, 5);
    x.fillStyle = 'rgba(40,30,20,0.5)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(w * (0.15 + i * 0.18), h * 0.82, 10, 26, 0, 0, TAU); x.fill(); } }, 512, 256);
  scene.add(pl(28, 9, c3Flat('#ffffff', { map: lobby, glow: '#ffc070' }), T.x, 4.5, front + 0.4));
  scene.add(rb(14, 0.6, 5, metal, T.x, 9.5, front + 2.6, 0.03));
  scene.add(pl(8, 1.4, c3Flat('#ffffff', { map: texSign('RIDE CO.', '#ffffff', '#0a6a4a', 0.62), glow: '#5affc8' }), T.x, 9.5, front + 5.2));
  // neighbours: shorter towers with lit windows
  for (let i = 0; i < 10; i++) { const R = RNG('shqbld', i), w = R.r(12, 20), h = R.r(25, 70), x = (i % 2 ? 1 : -1) * R.r(28, 70), z = -50 - R.r(0, 60);
    const t = texWindows(i + 40); t.repeat.set(w / 6, h / 10); const _m = c3Mesh(new THREE.BoxGeometry(w, h, w), c3Prop('#ffffff', { map: t, rough: 0.4, emissive: '#ffffff', ei: 0.7, emissiveMap: t }), 0.04); _m.position.set(x, h / 2, z); scene.add(_m); }
  const post = c3Prop('#2a2a34', { rough: 0.3, metal: 0.6 });
  for (const [x, z] of [[-16, -12], [16, -12], [-16, 14], [16, 14]]) { scene.add(cyl(0.25, 0.32, 11, post, x, 5.5, z, 0.03, 12));
    const h2 = c3Mesh(new THREE.SphereGeometry(0.9, 16, 12), c3Flat('#fff1c8', { glow: '#ffcf70' }), 0.04); h2.position.set(x, 11.4, z); scene.add(h2); }
  // rounded cartoon cars with glowing head and tail lights
  s.cars = [];
  for (let i = 0; i < 3; i++) { const c = new THREE.Group(), col = ['#c8321e', '#e8b030', '#3a6ad8'][i];
    c.add(rb(5.2, 1.4, 2.4, c3Prop(col, { rough: 0.22 }), 0, 1.1, 0, 0.04)); c.add(rb(3.0, 1.2, 2.1, c3Prop('#1a2030', { rough: 0.08, metal: 0.4 }), -0.3, 2.2, 0, 0.03));
    for (const wx of [-1.7, 1.7]) for (const wz of [-1.1, 1.1]) { const wh = cyl(0.55, 0.55, 0.4, c3Prop('#141418', { rough: 0.6 }), wx, 0.55, wz, 0.02, 16); wh.rotation.x = Math.PI / 2; c.add(wh); }
    for (const sz of [-0.8, 0.8]) { const hl = c3Mesh(new THREE.SphereGeometry(0.24, 10, 8), c3Flat('#fff6d8', { glow: '#fff0c0' }), 0.01); hl.position.set(2.6, 1.2, sz); c.add(hl);
      const tl = c3Mesh(new THREE.SphereGeometry(0.2, 10, 8), c3Flat('#ff3020', { glow: '#ff2010' }), 0.01); tl.position.set(-2.6, 1.3, sz); c.add(tl); }
    c.position.set(0, 0, 2 + i * 7); scene.add(c); s.cars.push(c); }
  s.rain = shqRain(scene, 1100, [-34, 34, 0, 70, -24, 50], { len: 1.8, op: 0.33 });
  // foreground: a lamp post and a dripping awning edge near the lens (NEAR, blurred, drifting with parallax)
  const nearG = new THREE.Group(); const np = cyl(0.35, 0.35, 34, post, 7, 17, 56, 0.02, 10); nearG.add(np);
  const awn = rb(9, 0.5, 3, c3Prop('#c8321e', { rough: 0.4 }), -7, 22, 54, 0.03); nearG.add(awn); scene.add(nearG); c3Layer(nearG, C3.L_NEAR); s.near = [np, awn];
  c3Env(scene, { top: '#5a70b0', mid: '#2a2440', bot: '#080610', cards: [[0, 30, -20, 30, 8, '#5affc8'], [-30, 10, 10, 10, 18, '#7a9aff']] }); c3Shadows(scene, key, 50);
  return s;
}
SHOT_FN['s20'] = (t, u, lt) => {
  const s = SHQ.tower ||= shqBuildTower();
  s.rain.userData.upd(t);
  s.cars.forEach((c, i) => { c.position.x = -50 + mod(t * 16 + i * 33, 100); });
  s.beacon.visible = Math.floor(t * 2) % 2 === 0;
  // fly in: low over the wet street toward the lobby, then rise so the tower and its RIDE CO. sign fill the frame
  c3SetCam(s.cam, shqCam([[0, [9, 3, 74], [0, 18, -30], 54], [0.6, [5, 12, 52], [0, 34, -30], 50], [1.28, [1.5, 26, 30], [0, 50, -30], 48]], lt, 's20', { rush: 1.4 }));
  shqDrift(s.near, s.cam, lt, 's20', 1.1);
  shqRender(s, { bg: '#0a0c18', bgBlur: shqRack(lt, 's20', 3.0, 1.0), nearBlur: 12, glow: 0.75 });
};

// =====================================================================
//  s21 — "The ride company actually knows this happens": the control room, analysts at glowing desks, a giant
//  wall map behind; on "knows" every analyst turns to camera with the same smug face
// =====================================================================
function shqBuildRoom() {
  const s = shqScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#6a7ab0', ambI: 0.42, sky: '#3a5a90', ground: '#1a0c10', key: '#ffe2c0', keyI: 0.55, keyP: [8, 20, 16], rim: '#5ab0ff', rimI: 0.9, rimP: [0, 10, -20] });
  const M = { desk: c3Prop('#4a3a32', { rough: 0.4 }), deskFront: c3Prop('#2a2a36', { rough: 0.4 }), dark: c3Prop('#1a1a22', { rough: 0.3, metal: 0.4 }) };
  const carpet = c3Tex((x, w, h) => { x.fillStyle = '#2a2a3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#34344a'; x.lineWidth = 4; for (let i = 0; i < 8; i++) { x.strokeRect(i * w / 8, 0, w / 8, h); } }, 256, 256);
  carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(20, 20);
  scene.add(pl(200, 200, c3Prop('#ffffff', { map: carpet, rough: 0.8 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(pl(120, 40, c3Prop('#22222e', { rough: 0.6 }), 0, 20, -40));
  // the wall map: a huge city of dots, the battery dots red
  const wallTex = c3Tex((x, w, h) => { x.fillStyle = '#081624'; x.fillRect(0, 0, w, h); const R = RNG('wall');
    x.strokeStyle = '#1a3a5a'; x.lineWidth = 4; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(R.r(0, w), 0); x.lineTo(R.r(0, w), h); x.stroke(); x.beginPath(); x.moveTo(0, R.r(0, h)); x.lineTo(w, R.r(0, h)); x.stroke(); }
    for (let i = 0; i < 500; i++) { x.fillStyle = R.f() < 0.15 ? '#ff4a3a' : '#3aff9a'; x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(3, 7), 0, TAU); x.fill(); }
    inked(x, 'LIVE RIDERS · BATTERY LEVEL', w / 2, h * 0.07, h * 0.05, '#ffffff', { stroke: false }); }, 2048, 1024);
  s.wall = pl(64, 32, c3Flat('#ffffff', { map: wallTex, glow: '#1a5a8a' }), 0, 20, -39.5); scene.add(s.wall);
  s.banner = pl(30, 4, c3Flat('#ffffff', { map: texSign('BATTERY DATA: ON', '#ff6a4a', '#4a0a08', 0.6), glow: '#ff4a2a' }), 0, 38.5, -39.4); scene.add(s.banner);
  // rows of desks, an analyst behind each (seated: legs hidden by the desk front)
  s.people = [];
  const rows = [[-9, -14], [0, -14], [9, -14], [-9, -2], [0, -2], [9, -2], [-9, 10], [9, 10]];
  rows.forEach(([x, z], i) => {
    shqDesk(scene, x, z, M, i);
    const p = shqPerson({ key: 'analyst' + i, outfit: SHQ_OUT[(i * 5) % 6], hairStyle: SHQ_HAIR[(i * 3) % 8], fx: i % 3 === 1 ? ['glasses'] : [] }, x, 2.3 * SHQ_K, z - 2.0);
    scene.add(p.g); s.people.push(p);
    const ch = new THREE.Group(); ch.position.set(x, 0, z - 2.6); ch.add(rb(2.4, 0.3, 2.2, M.dark, 0, 2.4, 0, 0.02)); ch.add(rb(2.4, 3.0, 0.3, M.dark, 0, 4.0, -1.0, 0.02)); ch.add(cyl(0.12, 0.12, 2.2, c3Chrome(), 0, 1.2, 0, 0.01, 8)); scene.add(ch);
  });
  // plants, a water cooler, cable trays
  for (const [x, z] of [[-18, -8], [18, -8], [-18, 6]]) { const pt = new THREE.Group(); pt.position.set(x, 0, z); pt.add(cyl(1.0, 0.8, 1.8, c3Prop('#c8a070', { rough: 0.6 }), 0, 0.9, 0));
    for (let i = 0; i < 7; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.9, 10, 8), c3Prop('#3f7a3c', { rough: 0.6 }), 0.02); lf.position.set(Math.cos(i) * 0.8, 2.4 + (i % 3) * 0.6, Math.sin(i) * 0.8); lf.scale.set(0.5, 1.4, 0.35); lf.rotation.z = Math.cos(i) * 0.6; pt.add(lf); } scene.add(pt); }
  const cooler = new THREE.Group(); cooler.position.set(20, 0, 2); cooler.add(rb(1.8, 4, 1.8, c3Prop('#e8e8f0', { rough: 0.3 }), 0, 2, 0)); cooler.add(cyl(0.8, 0.8, 2.2, c3Prop('#7ac0ff', { rough: 0.05, transparent: true }), 0, 5.1, 0, 0.02)); scene.add(cooler);
  for (let i = 0; i < 4; i++) scene.add(rb(60, 0.3, 0.8, M.dark, 0, 34 - i * 0.01, -30 + i * 14, 0.02));
  // foreground: a monitor's back and a coffee cup at the lens (NEAR, blurred)
  const nearG = new THREE.Group(); const mback = rb(5, 3.2, 0.4, M.dark, -6, 8, 26, 0.02); nearG.add(mback); const cup = mug('#c8321e', 5, 6.8, 27); cup.scale.setScalar(2.2); nearG.add(cup);
  scene.add(nearG); c3Layer(nearG, C3.L_NEAR); s.near = [mback, cup];
  c3Env(scene, { top: '#5a7ab0', mid: '#2a2a40', bot: '#100c18' }); c3Shadows(scene, key, 30);
  return s;
}
SHOT_FN['s21'] = (t, u, lt) => {
  const s = SHQ.room ||= shqBuildRoom();
  const knows = shqW('knows', 1, 27.92);
  s.banner.visible = t >= knows - 0.05 || Math.floor(t * 6) % 2 === 0;   // blinks, then holds ON from "knows"
  c3SetCam(s.cam, shqCam([[0, [8, 7.5, 24], [1, 7.5, -10], 50], [1.0, [4, 8, 20], [0, 8, -10], 48], [1.9, [1, 8.5, 16], [0, 8.5, -10], 46]], lt, 's21', { orbit: -0.05 }));
  shqDrift(s.near, s.cam, lt, 's21');
  s.people.forEach((p, i) => {
    const turned = t >= knows - 2 / FPS + i * 0.03;
    c3PersonPose(p, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [knows + i * 0.03, 'smug']], t, 'analyst' + i), gaze: turned ? [0, 0] : [0, 0.6],
      hand: { armL: [1.2, 1.0 + 0.06 * Math.sin(t * 30 + i)], armR: [-1.2, 1.0 + 0.06 * Math.sin(t * 27 + i * 2)] }, foot: { legL: [0.6, -1.6], legR: [-0.6, -1.6] } });
  });
  shqRender(s, { bgBlur: shqRack(lt, 's21', 1.0, 2.8), nearBlur: 11 });
};

// =====================================================================
//  s22 — "You see, the app can see your battery level": a giant wall of screens, hundreds of little phones each
//  with its battery %, the red ones pulsing; the camera zooms into one red 1 % landing on "level"
// =====================================================================
const SHQ_GRID = { cols: 16, rows: 24, tgt: [9, 14] };
function shqGridDraw(x, w, h, t) {
  const { cols, rows, tgt } = SHQ_GRID, cw = w / cols, ch = h / rows;
  x.fillStyle = '#060c16'; x.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const R = RNG('gridp', i, j), target = i === tgt[0] && j === tgt[1], v = target ? 1 : R.f() < 0.16 ? R.i(1, 5) : R.i(25, 100), px = i * cw, py = j * ch;
    x.fillStyle = '#1a2030'; x.beginPath(); x.roundRect(px + cw * 0.18, py + ch * 0.06, cw * 0.64, ch * 0.88, cw * 0.1); x.fill();
    x.fillStyle = '#0c1220'; x.fillRect(px + cw * 0.24, py + ch * 0.12, cw * 0.52, ch * 0.76);
    const red = v <= 5, pulse = red ? 0.55 + 0.45 * Math.sin(t * 8 + i * 1.7 + j) : 1;
    x.globalAlpha = red ? pulse : 1; x.strokeStyle = red ? '#ff3a2a' : '#ffffff'; x.lineWidth = Math.max(2, cw * (red ? 0.05 : 0.03)); x.strokeRect(px + cw * 0.32, py + ch * 0.32, cw * 0.32, ch * 0.16); x.globalAlpha = 1; x.fillRect(px + cw * 0.64, py + ch * 0.37, cw * 0.04, ch * 0.06);
    x.globalAlpha = pulse; x.fillStyle = red ? '#ff3a2a' : v < 40 ? '#ffc23a' : '#3aff9a'; x.fillRect(px + cw * 0.34, py + ch * 0.335, cw * 0.28 * Math.max(0.08, v / 100), ch * 0.13); x.globalAlpha = 1;
    x.font = `700 ${ch * 0.16}px Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = red ? '#ff6a4a' : '#d8e8ff'; x.fillText(v + '%', px + cw * 0.5, py + ch * 0.66);
  }
}
function shqBuildWall() {
  const s = shqScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#6a7ab0', ambI: 0.35, sky: '#3a5a90', ground: '#100810', key: '#ffe2c0', keyI: 0.4, keyP: [8, 20, 16], rim: '#5ab0ff', rimI: 0.8 });
  scene.add(pl(200, 200, c3Prop('#1e1e2a', { rough: 0.3, metal: 0.2 }), 0, 0, 0, 0, -Math.PI / 2));
  const cv = document.createElement('canvas'); cv.width = 1536; cv.height = 2304;
  const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 8;
  s.cv = cv; s.tx = tx; s.wallW = 32; s.wallH = 48;
  scene.add(rb(34, 50, 1, c3Prop('#14141c', { rough: 0.3, metal: 0.5 }), 0, 26, -10.6, 0.05));
  scene.add(pl(s.wallW, s.wallH, c3Flat('#ffffff', { map: tx, glow: '#1a3a6a' }), 0, 26, -10.0));
  // the bezels between screen tiles (a real video wall)
  for (let i = 1; i < 4; i++) scene.add(pl(0.18, 48, c3Flat('#0a0a10'), -16 + i * 8, 26, -9.95));
  for (let j = 1; j < 6; j++) scene.add(pl(32, 0.18, c3Flat('#0a0a10'), 0, 2 + j * 8, -9.95));
  // an analyst silhouette and a desk edge in the foreground (NEAR, blurred), and one in focus watching
  s.watch = shqPerson({ key: 'watcher', outfit: 'navy', hairStyle: 'ref' }, 8.5, 3.0 * SHQ_K, 24); scene.add(s.watch.g); c3Layer(s.watch.g, C3.L_FOCUS);
  const nearG = new THREE.Group(); const head = c3Mesh(new THREE.SphereGeometry(3.4, 20, 16), c3Prop('#1a1a22', { rough: 0.5 }), 0.03); head.position.set(-9, 7, 34); nearG.add(head);
  const desk = rb(20, 1, 4, c3Prop('#2a2a36', { rough: 0.4 }), 4, 2.8, 30, 0.02); nearG.add(desk); scene.add(nearG); c3Layer(nearG, C3.L_NEAR); s.near = [head, desk];
  c3Env(scene, { top: '#4a6ab0', mid: '#1a1a30', bot: '#080610' }); c3Shadows(scene, key, 30);
  return s;
}
SHOT_FN['s22'] = (t, u, lt) => {
  const s = SHQ.wall ||= shqBuildWall();
  shqGridDraw(s.cv.getContext('2d'), s.cv.width, s.cv.height, t); s.tx.needsUpdate = true;
  // the target cell's world position on the wall
  const { cols, rows, tgt } = SHQ_GRID, tx = -s.wallW / 2 + (tgt[0] + 0.5) * s.wallW / cols, ty = 26 + s.wallH / 2 - (tgt[1] + 0.5) * s.wallH / rows;
  const see = shqW('see', 2, 30.50) - SHOT_LIST.find((r) => r[0] === 's22')[1], level = shqW('level', 1, 31.40) - SHOT_LIST.find((r) => r[0] === 's22')[1];
  // wide on the whole wall, then a fast push straight into the one red 1 % (lands on "level")
  c3SetCam(s.cam, shqCam([[0, [4, 18, 46], [0, 26, -10], 52], [see - 0.2, [2, 22, 30], [tx * 0.5, 24, -10], 48], [level, [tx, ty - 0.2, -4.6], [tx, ty, -10], 30], [level + 1, [tx, ty - 0.2, -4.3], [tx, ty, -10], 30]], lt, 's22', { creep: 0.25, rush: 0.4 }));
  shqDrift(s.near, s.cam, lt, 's22', 1.1);
  c3PersonPose(s.watch, s.cam, t, { expr: c3FaceAt([[0, 'thinking'], [shqW('battery', 1, 30.98), 'smirk']], t, 'watcher'), gaze: [-0.4, -0.8], head: [0.06, 0, 0], ...SHQ_STAND });
  shqRender(s, { bgBlur: lt > level - 0.4 ? 0.2 : shqRack(lt, 's22', 0.6, 1.4), nearBlur: 12, glow: 0.7 + 0.4 * clamp((lt - (level - 0.3)) / 0.4) });
};

// =====================================================================
//  s23 — "And their own economist once said...": the economist at a podium (HEAD OF ECONOMICS), a big screen
//  behind with the battery icon; a spotlight snaps on at "economist"; he raises a finger on "said"
// =====================================================================
function shqPlaqueTex(txt) {
  return c3Tex((x, w, h) => { x.fillStyle = '#2a2220'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8a050'; x.lineWidth = 10; x.strokeRect(8, 8, w - 16, h - 16);
    inked(x, txt, w / 2, h / 2, h * 0.38, '#f0d890', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.88 }); }, 1024, 192);
}
function shqBuildStage() {
  const s = shqScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#ffe8d0', ambI: 0.32, sky: '#ffd8b0', ground: '#2a1410', key: '#ffe2c0', keyI: 0.6, keyP: [6, 20, 18], rim: '#7ab0ff', rimI: 0.7 });
  const wood = texWood(); wood.repeat.set(8, 8);
  scene.add(pl(200, 200, c3Prop('#ffffff', { map: wood, rough: 0.4 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(rb(40, 1.2, 14, c3Prop('#3a2a22', { rough: 0.5 }), 0, 0.6, -4, 0.04));   // the stage
  const curtain = c3Tex((x, w, h) => { for (let i = 0; i < 24; i++) { const g = x.createLinearGradient(i * w / 24, 0, (i + 1) * w / 24, 0); g.addColorStop(0, '#5a0e14'); g.addColorStop(0.5, '#a8242a'); g.addColorStop(1, '#5a0e14'); x.fillStyle = g; x.fillRect(i * w / 24, 0, w / 24 + 1, h); } }, 1024, 512);
  scene.add(pl(70, 40, c3Prop('#ffffff', { map: curtain, rough: 0.7 }), 0, 20, -14));
  // the big screen: battery icon at 1 % and a quote mark
  const scr = c3Tex((x, w, h) => { x.fillStyle = '#0a1424'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffffff'; x.lineWidth = 22; x.strokeRect(w * 0.25, h * 0.3, w * 0.42, h * 0.36); x.fillStyle = '#ffffff'; x.fillRect(w * 0.67, h * 0.42, w * 0.05, h * 0.12);
    x.fillStyle = '#ff3a2a'; x.fillRect(w * 0.27, h * 0.33, w * 0.03, h * 0.3); inked(x, '1%', w * 0.46, h * 0.82, h * 0.13, '#ff5a3a', { stroke: false }); inked(x, 'WHO SAYS YES?', w / 2, h * 0.14, h * 0.1, '#ffffff', { stroke: false }); }, 1024, 768);
  s.screen = pl(22, 16.5, c3Flat('#ffffff', { map: scr, glow: '#2a4a8a' }), 7, 13, -12.5); scene.add(s.screen);
  scene.add(rb(23, 17.5, 0.6, c3Prop('#14141c', { rough: 0.3, metal: 0.5 }), 7, 13, -12.9, 0.04));
  // the podium with its plaque and a gooseneck mic
  const pod = new THREE.Group(); pod.position.set(-4, 1.2, 0); scene.add(pod);
  pod.add(rb(4.6, 5.0, 2.6, c3Prop('#5a3a22', { rough: 0.4 }), 0, 2.5, 0, 0.04)); pod.add(rb(5.0, 0.3, 3.0, c3Prop('#7a5030', { rough: 0.4 }), 0, 5.1, 0, 0.03));
  pod.add(pl(4.2, 0.8, c3Flat('#ffffff', { map: shqPlaqueTex('HEAD OF ECONOMICS') }), 0, 3.4, 1.32));
  const gn = cyl(0.05, 0.05, 1.6, c3Chrome(), 0.6, 6.0, 0.6, 0.01, 8); gn.rotation.x = 0.5; pod.add(gn); const mh = c3Mesh(new THREE.SphereGeometry(0.2, 12, 10), c3Prop('#1a1a1a', { rough: 0.5 }), 0.01); mh.position.set(0.6, 6.7, 1.0); pod.add(mh);
  // the economist behind it (his legs hidden by the podium)
  s.econ = shqPerson({ key: 'econ', outfit: 'white', hairStyle: 'brown', fx: ['glasses_square'] }, -4, 3.3 * SHQ_K, -2.2); scene.add(s.econ.g); c3Layer(s.econ.g, C3.L_FOCUS);
  c3Layer(pod, C3.L_FOCUS);   // the podium is drawn in the subject pass so it hides his legs
  // the spotlight: a soft cone + a pool of light on the stage
  s.spot = new THREE.Group(); const cone = new THREE.Mesh(new THREE.ConeGeometry(6, 26, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); cone.position.set(-4, 14, -1); s.spot.add(cone);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(-4, 1.22, -1); s.spot.add(pool);
  s.spotL = new THREE.SpotLight('#fff0c8', 0, 60, 0.45, 0.5, 1.2); s.spotL.position.set(-4, 27, 2); s.spotL.target.position.set(-4, 4, -2); s.spotL.layers.enableAll(); scene.add(s.spotL, s.spotL.target); scene.add(s.spot);
  // the audience: blurred heads at the lens (NEAR)
  const nearG = new THREE.Group(); s.near = [];
  for (let i = 0; i < 3; i++) { const h2 = c3Mesh(new THREE.SphereGeometry(2.6, 18, 14), c3Prop(['#2a1a14', '#3a2a1a', '#1a1a22'][i], { rough: 0.5 }), 0.03); h2.position.set(-12 + i * 12, 3.2 + (i % 2) * 0.6, 24); nearG.add(h2); s.near.push(h2); }   // low at the frame's bottom edge
  scene.add(nearG); c3Layer(nearG, C3.L_NEAR);
  c3Env(scene, { top: '#c89a6a', mid: '#5a2a24' }); c3Shadows(scene, key, 24);
  return s;
}
SHOT_FN['s23'] = (t, u, lt) => {
  const s = SHQ.stage ||= shqBuildStage();
  const econ = shqW('economist', 1, 32.54), said = shqW('said', 1, 33.30), on = clamp((t - econ + 0.06) / 0.08);
  s.spot.visible = on > 0; s.spot.children.forEach((m, i) => { m.material.opacity = on * (i ? 0.18 : 0.08); }); s.spotL.intensity = 1.6 * on;
  c3SetCam(s.cam, shqCam([[0, [6, 9, 30], [-2, 9, -4], 46], [1.2, [2, 9.5, 24], [-3, 9.5, -4], 44], [2.26, [-1, 10, 19], [-3.5, 10, -4], 42]], lt, 's23', { orbit: 0.04 }));
  shqDrift(s.near, s.cam, lt, 's23');
  const up = c3Hold([[0, 0], [said, 1]], t, 5 / 30);
  c3PersonPose(s.econ, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [econ, 'proud'], [said, 'talking'], [shqW('strongest', 1, 34.18), 'determined']], t, 'econ'), gaze: [0.2, 0], head: [0.05 * up, 0, 0],
    hand: { armR: [lerp(-1.2, -1.6, up), lerp(1.2, 3.6, up)], armL: [1.3, 1.25] }, foot: { legL: [0.6, -2.4], legR: [-0.6, -2.4] } });
  shqRender(s, { bg: '#1a0c08', bgBlur: shqRack(lt, 's23', 2.6, 1.4), nearBlur: 12, glow: 0.55 + 0.3 * on });
};

// =====================================================================
//  s24 — "...one of the strongest signs of whether you'll pay the higher price": a physical bar chart on the
//  stage — four giant batteries (100 %, 50 %, 20 %, 1 %), each topped by a stack of green YES blocks that grow;
//  the 1 % stack is by far the tallest and its last block lands on "higher"
// =====================================================================
function shqBlockTex() { return c3Tex((x, w, h) => { x.fillStyle = '#2acb6a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#0e5a2a'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); inked(x, 'YES', w / 2, h / 2, h * 0.5, '#ffffff', { stroke: '#0e5a2a', sw: h * 0.06 }); }, 256, 128); }
function shqBatteryTex(v) {
  return c3Tex((x, w, h) => { x.fillStyle = '#1a1a22'; x.fillRect(0, 0, w, h); const c = v <= 5 ? '#ff3a2a' : v < 40 ? '#ffc23a' : '#3aff9a';
    x.fillStyle = c; x.fillRect(w * 0.12, h * (0.92 - 0.8 * Math.max(0.04, v / 100)), w * 0.76, h * 0.8 * Math.max(0.04, v / 100));
    inked(x, v + '%', w / 2, h * 0.5, h * 0.16, '#ffffff', { stroke: '#1a1a22', sw: h * 0.03 }); }, 256, 512);
}
function shqBuildChart() {
  const s = shqScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#ffe8d0', ambI: 0.34, sky: '#ffd8b0', ground: '#2a1410', key: '#ffe2c0', keyI: 0.65, keyP: [6, 24, 20], rim: '#7ab0ff', rimI: 0.7 });
  const wood = texWood(); wood.repeat.set(8, 8);
  scene.add(pl(200, 200, c3Prop('#ffffff', { map: wood, rough: 0.4 }), 0, 0, 0, 0, -Math.PI / 2));
  const curtain = c3Tex((x, w, h) => { for (let i = 0; i < 24; i++) { const g = x.createLinearGradient(i * w / 24, 0, (i + 1) * w / 24, 0); g.addColorStop(0, '#5a0e14'); g.addColorStop(0.5, '#a8242a'); g.addColorStop(1, '#5a0e14'); x.fillStyle = g; x.fillRect(i * w / 24, 0, w / 24 + 1, h); } }, 1024, 512);
  scene.add(pl(90, 60, c3Prop('#ffffff', { map: curtain, rough: 0.7 }), 0, 30, -14));
  scene.add(pl(34, 4, c3Flat('#ffffff', { map: texSign('SAYS YES TO A HIGHER PRICE', '#ffffff', '#3a0a08', 0.42), glow: '#ff6a4a' }), 0, 40, -13.5));
  scene.add(rb(44, 0.6, 3, c3Prop('#e8e2d6', { rough: 0.3 }), 0, 0.3, 0, 0.03));   // the chart's base line
  const vals = [100, 50, 20, 1], heights = [2, 4, 7, 12], bt = shqBlockTex();
  s.cols = vals.map((v, i) => {
    const g = new THREE.Group(), x = -15 + i * 10; g.position.set(x, 0.6, 0); scene.add(g);
    const bat = new THREE.Group(); bat.add(rb(5, 9, 3, c3Prop('#22222c', { rough: 0.25, metal: 0.4 }), 0, 4.5, 0, 0.05)); bat.add(rb(2, 0.8, 1.6, c3Prop('#22222c', { rough: 0.25, metal: 0.4 }), 0, 9.4, 0, 0.03));
    bat.add(pl(4.2, 8.2, c3Flat('#ffffff', { map: shqBatteryTex(v), glow: v <= 5 ? '#ff2a1a' : '#1a6a3a' }), 0, 4.5, 1.52)); g.add(bat);
    const blocks = []; for (let k = 0; k < heights[i]; k++) { const b = rb(4.4, 1.9, 2.6, c3Prop('#ffffff', { map: bt, rough: 0.35 }), 0, 0, 0, 0.03); b.visible = false; g.add(b); blocks.push(b); }
    return { g, blocks, v };
  });
  s.econ = shqPerson({ key: 'econ', outfit: 'white', hairStyle: 'brown', fx: ['glasses_square'] }, 22, 3.0 * SHQ_K, 6); scene.add(s.econ.g); c3Layer(s.econ.g, C3.L_FOCUS);
  const nearG = new THREE.Group(); s.near = [];
  for (let i = 0; i < 2; i++) { const h2 = c3Mesh(new THREE.SphereGeometry(3, 18, 14), c3Prop(['#2a1a14', '#1a1a22'][i], { rough: 0.5 }), 0.03); h2.position.set(-10 + i * 18, 8, 40); nearG.add(h2); s.near.push(h2); }
  scene.add(nearG); c3Layer(nearG, C3.L_NEAR);
  c3Env(scene, { top: '#c89a6a', mid: '#5a2a24' }); c3Shadows(scene, key, 34);
  return s;
}
SHOT_FN['s24'] = (t, u, lt) => {
  const s = SHQ.chart ||= shqBuildChart();
  const t0 = SHOT_LIST.find((r) => r[0] === 's24')[1], higher = shqW('higher', 1, 36.20);
  // the stacks build left to right; each block drops in (0.12 s) and thumps; the 1 % stack finishes on "higher"
  const starts = [t0 + 0.15, t0 + 0.55, t0 + 0.95, t0 + 1.25], ends = [t0 + 0.45, t0 + 0.95, t0 + 1.55, higher];
  s.cols.forEach((c, i) => c.blocks.forEach((b, k) => {
    const n = c.blocks.length, tk = lerp(starts[i], ends[i], n > 1 ? k / (n - 1) : 1), d = clamp((t - tk + 0.12) / 0.12);
    b.visible = d > 0; b.position.y = 10.2 + k * 2.0 + (1 - EZ.o2(d)) * 6; b.rotation.z = (1 - d) * 0.2 * (k % 2 ? 1 : -1);
  }));
  // camera: low beside the 100 % battery, tracking along and craning up the tall 1 % stack
  c3SetCam(s.cam, shqCam([[0, [-6, 9, 62], [-2, 15, 0], 50], [1.2, [-2, 12, 58], [0, 17, 0], 50], [higher - t0, [3, 19, 52], [3, 22, 0], 50], [2.9, [5, 23, 46], [5, 26, 0], 48]], lt, 's24', { creep: 0.6 }));
  shqDrift(s.near, s.cam, lt, 's24');
  const point = c3Hold([[0, 0], [higher - 0.15, 1]], t, 5 / 30);
  c3PersonPose(s.econ, s.cam, t, { expr: c3FaceAt([[0, 'talking'], [higher, 'smug']], t, 'econ'), gaze: [-0.8, -0.4], hand: { armR: [lerp(-1.2, -2.2, point), lerp(1.2, 3.4, point)], armL: [1.3, 1.2] }, ...SHQ_STAND });
  shqRender(s, { bg: '#1a0c08', bgBlur: shqRack(lt, 's24', 2.4, 1.2), nearBlur: 12 });
};

// =====================================================================
//  s28 — "So people at 1 percent stop shopping around and just say yes": a row of people in the rain under a
//  bus shelter, faces lit by their dying phones; on "yes" they all tap at once and green YES bubbles pop above them
// =====================================================================
function shqBuildRow() {
  const s = shqScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#7080b0', ambI: 0.5, sky: '#4a5a90', ground: '#100810', key: '#a8b8ff', keyI: 0.55, keyP: [-10, 24, 20], rim: '#ff8a4a', rimI: 0.8 });
  scene.add(pl(300, 300, c3Prop('#2a2a38', { rough: 0.12, metal: 0.35 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(rb(60, 0.8, 8, c3Prop('#5a5a66', { rough: 0.6 }), 0, 0.4, -4, 0.03));   // the curb
  for (let i = 0; i < 12; i++) { const R = RNG('rowbld', i), w = R.r(10, 16), h = R.r(25, 60), x = -70 + i * 13, z = -40 - R.r(0, 30);
    const tw = texWindows(i + 70); tw.repeat.set(w / 6, h / 10); const _m = c3Mesh(new THREE.BoxGeometry(w, h, w), c3Prop('#ffffff', { map: tw, rough: 0.4, emissive: '#ffffff', ei: 0.8, emissiveMap: tw }), 0.04); _m.position.set(x, h / 2, z); scene.add(_m); }
  // the bus shelter: a roof, glass panels, a glowing ad, a RIDE CO. poster
  const sh = new THREE.Group(); sh.position.set(0, 0, -6); scene.add(sh);
  sh.add(rb(40, 0.6, 7, c3Prop('#2a2a34', { rough: 0.3, metal: 0.5 }), 0, 15, 0, 0.04));
  for (const x of [-19, 19]) sh.add(cyl(0.3, 0.3, 15, c3Chrome(), x, 7.5, 2.5, 0.02, 10));
  sh.add(pl(38, 13, c3Prop('#9ab8d8', { rough: 0.05, transparent: true }), 0, 7.6, -3.2)); sh.children[sh.children.length - 1].material.opacity = 0.25;
  sh.add(pl(8, 11, c3Flat('#ffffff', { map: c3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2acb9a'); g.addColorStop(1, '#0a3a5a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    inked(x, 'RIDE CO.', w / 2, h * 0.22, h * 0.09, '#ffffff', { stroke: false }); inked(x, 'Always there', w / 2, h * 0.34, h * 0.05, '#e0fff4', { stroke: false }); }, 256, 352), glow: '#2acb9a' }), 14, 8, -3.0));
  sh.add(rb(30, 0.4, 2.2, c3Prop('#8a5a32', { rough: 0.5 }), 0, 3.0, -1.5, 0.02));
  // the row: 6 people, each holding a phone at 1 %
  s.people = []; s.phones = []; s.bubbles = [];
  const ta = shqPhoneTex('ask'), tb = shqPhoneTex('yes'), bub = shqBubbleTex('YES', '#2acb6a');
  for (let i = 0; i < 6; i++) {
    const p = shqPerson({ key: 'row' + i, outfit: SHQ_OUT[(i * 5 + 1) % 6], hairStyle: SHQ_HAIR[(i * 3 + 1) % 8], fx: i === 2 ? ['glasses'] : i === 4 ? ['beard', 'mustache'] : [] }, -16 + i * 6.4, 3.0 * SHQ_K, 2 + (i % 2) * 1.2);
    scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); s.people.push(p);
    const ph = shqHold(p, shqPhone(ta, tb), 0.09); ph.scale.setScalar(0.85); s.phones.push(ph);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshBasicMaterial({ map: bub, transparent: true, alphaTest: 0.05, depthWrite: false, toneMapped: false })); b.renderOrder = 7; p.root.add(b); b.position.set(0.4, 9.2, 0.2); b.visible = false; s.bubbles.push(b);
  }
  s.rain = shqRain(scene, 1100, [-30, 30, 0, 40, -10, 34], { len: 1.4, op: 0.38, seed: 3 });
  const nearG = new THREE.Group(); const umb = c3Mesh(new THREE.SphereGeometry(4, 20, 10, 0, TAU, 0, 1.1), c3Prop('#c8321e', { rough: 0.3, side: THREE.DoubleSide }), 0.03); umb.position.set(-8, 16, 34); nearG.add(umb);
  const pole = cyl(0.35, 0.35, 24, c3Prop('#2a2a34', { rough: 0.3, metal: 0.6 }), 9, 12, 32, 0.02, 10); nearG.add(pole); scene.add(nearG); c3Layer(nearG, C3.L_NEAR); s.near = [umb, pole];
  c3Env(scene, { top: '#5a70b0', mid: '#2a2440', bot: '#080610', cards: [[0, 30, -20, 30, 8, '#2acb9a'], [-30, 10, 10, 10, 18, '#7a9aff']] }); c3Shadows(scene, key, 34);
  return s;
}
SHOT_FN['s28'] = (t, u, lt) => {
  const s = SHQ.row ||= shqBuildRow();
  s.rain.userData.upd(t);
  const yes = shqW('yes', 1, 48.50), shop = shqW('shopping', 1, 47.36);
  // tracking along the row at chest height, slowing to frame them all as they hit YES
  c3SetCam(s.cam, shqCam([[0, [-14, 8, 26], [-10, 8, 0], 48], [1.6, [-4, 8.5, 30], [-2, 8.5, 0], 48], [3.14, [2, 9.5, 36], [-1, 9, 0], 50]], lt, 's28', { creep: 0.5 }));
  shqDrift(s.near, s.cam, lt, 's28');
  s.people.forEach((p, i) => {
    const tap = yes - 0.12 + i * 0.025, tapped = t >= tap, hit = clamp((t - tap) / 0.08);
    s.phones[i].userData.set(tapped); s.phones[i].position.set(0.15, 2.2, 0.09);
    const bt = clamp((t - tap - 0.04) / 0.22); s.bubbles[i].visible = bt > 0; s.bubbles[i].scale.setScalar(EZ.back(bt));
    // before "shopping": thumbs scroll, looking hesitant; at "shopping" a shrug; then the tap
    const thumb = tapped ? [0.3, 2.35 - 0.25 * Math.sin(hit * Math.PI)] : [0.3, 2.3 + 0.08 * Math.sin(t * 12 + i)];
    c3PersonPose(p, s.cam, t, { expr: c3FaceAt([[0, 'worried'], [shop + i * 0.04, 'nervous'], [yes, 'relieved']], t, 'row' + i), gaze: tapped ? [0, 0] : [0.2, -0.8], head: [RNG('rowt', i).n(0.06), 0, -0.05],
      hand: { armL: [0.3, 2.0], armR: [-0.1 + thumb[0], thumb[1]] }, x: t >= shop && !tapped && i % 2 ? ['sweat'] : [], ...SHQ_STAND });
  });
  shqRender(s, { bg: '#0a0c18', bgBlur: shqRack(lt, 's28', 1.0, 2.6), nearBlur: 12, glow: 0.6 + 0.35 * clamp((t - yes) / 0.1) * Math.exp(-Math.max(0, t - yes) * 2) });
};

// =====================================================================
//  s29 — "The company says it doesn't use your battery to set the price": a press conference; the spokesperson
//  at a podium bristling with microphones, WE DON'T USE YOUR BATTERY on the front, camera flashes popping
// =====================================================================
function shqBuildPress() {
  const s = shqScene(50), scene = s.scene;
  const key = lights(scene, { amb: '#ffe8d0', ambI: 0.36, sky: '#ffe2c8', ground: '#2a1a14', key: '#ffe8d0', keyI: 0.7, keyP: [6, 20, 20], rim: '#7ab0ff', rimI: 0.6 });
  scene.add(pl(200, 200, c3Prop('#5a4a42', { rough: 0.7 }), 0, 0, 0, 0, -Math.PI / 2));
  // the backdrop: a step-and-repeat wall of RIDE CO. logos
  const back = c3Tex((x, w, h) => { x.fillStyle = '#f2f2f6'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < 6; j++) for (let i = 0; i < 4; i++) { const px = (i + (j % 2) * 0.5) * w / 4, py = (j + 0.5) * h / 6; x.fillStyle = '#2acb9a'; x.beginPath(); x.arc(px - w * 0.07, py, h * 0.035, 0, TAU); x.fill(); inked(x, 'RIDE CO.', px + w * 0.03, py, h * 0.045, '#1a3a4a', { stroke: false, maxW: w * 0.18 }); } }, 1024, 1024);
  scene.add(pl(60, 40, c3Prop('#ffffff', { map: back, rough: 0.6 }), 0, 20, -10));
  // the podium: WE DON'T USE YOUR BATTERY, a cluster of mics with coloured flags
  const pod = new THREE.Group(); pod.position.set(0, 0, 0); scene.add(pod);
  pod.add(rb(7, 6, 3, c3Prop('#2a2a34', { rough: 0.35, metal: 0.3 }), 0, 3, 0, 0.04)); pod.add(rb(7.4, 0.3, 3.4, c3Prop('#3a3a46', { rough: 0.35 }), 0, 6.1, 0, 0.03));
  pod.add(pl(6.4, 2.6, c3Flat('#ffffff', { map: c3Tex((x, w, h) => { x.fillStyle = '#0e1a2a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2acb9a'; x.lineWidth = 10; x.strokeRect(6, 6, w - 12, h - 12);
    inked(x, "WE DON'T USE", w / 2, h * 0.34, h * 0.22, '#ffffff', { stroke: false, maxW: w * 0.9 }); inked(x, 'YOUR BATTERY', w / 2, h * 0.68, h * 0.22, '#5affc8', { stroke: false, maxW: w * 0.9 }); }, 1024, 420) }), 0, 4.6, 1.52));   // plaque high on the podium: clear of the subtitle band
  const flags = ['#c8321e', '#2a6ad8', '#e8b030', '#2acb6a', '#8a4ad8', '#ff8a2a', '#1a1a1a'];
  // small microphones on short gooseneck stems just above the podium top: shaft, body, foam head, colour flag cube
  for (let i = 0; i < 9; i++) { const R = RNG('mic', i), x = -2.2 + i * 0.55 + R.n(0.08), mic = new THREE.Group(); mic.position.set(x, 6.25, 1.1);
    const len = 0.9 + R.r(0, 0.5); mic.rotation.set(0.55 + R.n(0.12), 0, R.n(0.3));
    mic.add(cyl(0.035, 0.035, len, c3Prop('#1a1a1a', { rough: 0.4 }), 0, len / 2, 0, 0.008, 6));
    mic.add(cyl(0.08, 0.06, 0.45, c3Prop('#2a2a2e', { rough: 0.3, metal: 0.4 }), 0, len + 0.2, 0, 0.01, 10));
    const foam = c3Mesh(new THREE.SphereGeometry(0.17, 12, 10), c3Prop(i % 3 ? '#1e1e22' : '#c8321e', { rough: 0.9 }), 0.012); foam.scale.set(1, 1.25, 1); foam.position.set(0, len + 0.55, 0); mic.add(foam);
    mic.add(rb(0.34, 0.3, 0.34, c3Prop(flags[i % 7], { rough: 0.3 }), 0, len + 0.05, 0, 0.01)); pod.add(mic); }
  s.spokes = shqPerson({ key: 'spokes', outfit: 'mustard', hairStyle: 'side' }, 0, 3.75 * SHQ_K, -2.2); scene.add(s.spokes.g);   // hair glued by the kit's measured hairline
  c3Layer(s.spokes.g, C3.L_FOCUS);
  c3Layer(pod, C3.L_FOCUS);   // podium + mics in the subject pass: they hide the body below the chest
  // the press: blurred heads and two raised cameras at the lens (NEAR); flashes are glowing planes at the cameras
  const nearG = new THREE.Group(); s.near = []; s.flashes = [];
  for (let i = 0; i < 5; i++) { const R = RNG('press', i), h2 = c3Mesh(new THREE.SphereGeometry(2.2, 18, 14), c3Prop(['#2a1a14', '#3a2a1a', '#1a1a22', '#4a3020', '#2a2026'][i], { rough: 0.5 }), 0.03); h2.position.set(-11 + i * 5.5, 5.6 + R.r(0, 1.0), 24 + R.r(0, 1.5)); nearG.add(h2); s.near.push(h2); }
  for (let i = 0; i < 2; i++) { const cam = new THREE.Group(); cam.add(rb(2.2, 1.5, 1.2, c3Prop('#1a1a1a', { rough: 0.3 }), 0, 0, 0, 0.02)); cam.add(cyl(0.5, 0.5, 1.0, c3Prop('#2a2a2a', { rough: 0.2, metal: 0.5 }), 0, 0, -0.9, 0.01, 16).rotateX(Math.PI / 2));
    const fl = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); fl.position.set(0, 1.1, -0.7); cam.add(fl); s.flashes.push(fl);
    cam.position.set(i ? 6 : -7, 8.2, 23); nearG.add(cam); s.near.push(cam); }
  scene.add(nearG); c3Layer(nearG, C3.L_NEAR);
  // flash lights on the stage
  s.flashL = new THREE.PointLight('#ffffff', 0, 40, 1.4); s.flashL.position.set(0, 10, 14); s.flashL.layers.enableAll(); scene.add(s.flashL);
  c3Env(scene, { top: '#e8e0d8', mid: '#7a6a60' }); c3Shadows(scene, key, 24);
  return s;
}
const SHQ_FLASH = [0.25, 0.7, 1.05, 1.5, 1.8, 2.3, 2.6, 2.95];   // shot-local flash times
SHOT_FN['s29'] = (t, u, lt) => {
  const s = SHQ.press ||= shqBuildPress();
  const doesnt = shqW("doesnt", 1, 49.92), battery = shqW('battery', 2, 50.62);
  let fl = 0; SHQ_FLASH.forEach((f) => { const d = lt - f; if (d >= 0 && d < 0.1) fl = Math.max(fl, 1 - d / 0.1); });
  s.flashes.forEach((m, i) => { m.material.opacity = (Math.round(lt * 30) % 2 === i ? 1 : 0.4) * fl; }); s.flashL.intensity = 2.2 * fl;
  c3SetCam(s.cam, shqCam([[0, [5, 10.5, 33], [0, 4.9, 0], 46], [1.5, [2, 10.8, 29], [0, 5.0, 0], 44], [3.14, [-1, 11, 27], [0, 5.1, 0], 42]], lt, 's29', { orbit: -0.04, creep: 0.6 }));
  shqDrift(s.near, s.cam, lt, 's29', 0.45);
  const hands = c3Hold([[0, 0], [doesnt, 1], [battery + 0.3, 0.5]], t, 5 / 30);   // palms up "we don't", then a little shrug
  c3PersonPose(s.spokes, s.cam, t, { expr: c3FaceAt([[0, 'nervous'], [doesnt, 'smile'], [battery, 'grimace']], t, 'spokes'), gaze: [0.3, 0], head: [0.04 * Math.sin(lt * 3), 0, 0],
    hand: { armR: [lerp(-1.2, -2.2, hands), lerp(1.3, 2.6, hands)], armL: [lerp(1.2, 2.2, hands), lerp(1.3, 2.6, hands)] }, x: t >= battery ? ['sweat'] : [], foot: { legL: [0.6, -2.4], legR: [-0.6, -2.4] } });
  shqRender(s, { bg: '#1a1410', bgBlur: shqRack(lt, 's29', 2.2, 3.2), nearBlur: 12, glow: 0.55 + 0.5 * fl });
};
