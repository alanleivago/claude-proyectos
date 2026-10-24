// =====================================================================
//  SET money — money and trouble: s11 s12 s13 s14 s15 s18 s20. Registers SHOT_FN[id] = (t, u, lt) => { ... }.
//    bank      s11  Jobs at the teller window; the LED counter on the counter rolls to $15,000 on ",000"
//    garage    s12  Woz solders, Apple I boards stack up on the bench (one more on "computers")
//              s15  a giant INVOICE drops and lands on Ron on "lands" (panic, squash)
//              s18  Ron hands the 10% slice to Jobs; a cheque for $800 lands on the table on "$800"
//              s20  a $1,500 cheque lands on ",500"; Ron walks out to the open door with a box
//    shop      s13  the Byte Shop (buildShop in scenes.js), people at 1.35x
//    yard      s14  the garage from outside: storm clouds roll in, the sky darkens, lightning on "wrong"
//  People are c3Person billboards at SMN_K (1.35x the props); standing root height SMN_FOOT.
// =====================================================================
const SMN = {};
const SMN_K = 1.35, SMN_FOOT = 2.55 * SMN_K;   // a standing person's root (hips) above the floor
const smnW = (w, n, d) => wordT(w, n) ?? d;
function smnMat(c, o) { return c3Prop(c, o); }
function smnTex(draw, w = 512, h = 512) { return c3Tex(draw, w, h); }
// a person standing on the floor at (x, z), facing the camera
function smnPerson(o, x, z, y = 0) { const p = c3Person(o); c3Put(p.g, x, y + SMN_FOOT, z, 0, 0, 0, SMN_K); return p; }
// ---- camera (tutorial + refs): never still — a ~5 %/s creep toward the subject plus a slow orbit, accelerating over
// the last 0.35 s into the cut (and on through the 6-frame dissolve); K keys are the shot's framing in shot-local seconds
const smnDur = (id) => { const i = SHOT_LIST.findIndex((r) => r[0] === id), [a, b] = shotSpan(i); return b - a; };
function smnCam(cam, K, lt, dur, o = {}) {
  const c = c3CamAt(K, lt), P = new THREE.Vector3(...c.p), Lk = new THREE.Vector3(...c.l), d = Lk.clone().sub(P), dist = d.length(); d.normalize();
  const tail = Math.min(1.6, Math.max(0, lt - (dur - 0.35)) / 0.35);
  P.addScaledVector(d, (o.push ?? 1) * dist * (0.05 * lt + 0.13 * tail * tail));
  const off = P.clone().sub(Lk).applyAxisAngle(new THREE.Vector3(0, 1, 0), (o.orbit ?? 0.04) * lt + (o.orbitEnd ?? 0.05) * tail * tail);
  P.copy(Lk).add(off); P.y += (o.crane ?? 0) * lt;
  c3SetCam(cam, { p: P.toArray(), l: Lk.toArray(), fov: c.fov });
}
// rack focus: the background softens as the shot settles on its subject (refs: strong, animated depth of field)
const smnRack = (lt, dur, a = 1.6, b = 3.8) => lerp(a, b, EZ.io(clamp(lt / Math.max(0.4, dur * 0.8))));
// dim a set built with lights(): less flat fill, so lamps and windows carve the space and the corners fall dark
function smnDim(scene, amb = 0.12, hemi = 0.18) { scene.children.forEach((c) => { if (c.isAmbientLight) c.intensity = amb; if (c.isHemisphereLight) c.intensity = hemi; }); }
function smnLamp(scene, x, y, z, c = '#ffc880', i = 1.6, dist = 18) { const l = new THREE.PointLight(c, i, dist, 2); l.position.set(x, y, z); l.layers.enableAll(); scene.add(l); return l; }
function smnNear(scene, obj) {   // a foreground object, drawn blurred over everything; it drifts across the frame (smnNearDrift)
  c3Layer(obj, C3.L_NEAR); scene.add(obj); (scene.userData.near ||= []).push(obj); obj.userData.p0 = obj.position.clone(); obj.userData.r0 = obj.rotation.y; return obj; }
// real parallax (user: foreground must never sit glued to the screen): each near object slides sideways past the lens
// over the shot (~2.4 units/s, out toward its own edge, the far side of frame entering), with a slow bob and turn
function smnNearDrift(scene, lt, dur, key = '') {
  (scene.userData.near || []).forEach((o, i) => { const R = RNG('drift', key, i), p0 = o.userData.p0, side = Math.sign(p0.x) || 1;
    const v = R.r(2.0, 2.8) * side, k = lt - dur * 0.45;
    o.position.set(p0.x + v * k, p0.y + Math.sin(lt * R.r(1.1, 1.7) + i) * 0.25, p0.z + R.n(1.2) * k * 0.3);
    o.rotation.y = o.userData.r0 + k * R.n(0.12); }); }

// soft cartoon smoke puffs (billboard discs) that drift up and fade
function smnPuffTex() { return SMN.puff ||= smnTex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(0.6, 'rgba(240,236,230,0.45)'); g.addColorStop(1, 'rgba(240,236,230,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 128, 128); }
function smnSmoke(group, n, key) {
  const ps = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: smnPuffTex(), transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = 8; group.add(m); ps.push(m); }
  return { ps, key };
}
function smnSmokeAt(sm, t, cam, x0, y0, z0) {
  sm.ps.forEach((m, i) => { const R = RNG('smk', sm.key, i), P = 1.6, ph = (t / P + i / sm.ps.length + R.r(0, 0.2)) % 1;
    m.position.set(x0 + Math.sin(ph * 5 + i) * 0.25 * ph, y0 + ph * 2.2, z0); const s = 0.35 + ph * 0.9; m.scale.set(s, s, 1);
    m.material.opacity = Math.sin(ph * Math.PI) * 0.75; m.quaternion.copy(cam.quaternion); });
}
// a seven-segment style LED counter (the fact as an object): canvas texture updated each frame
function smnLed(w = 1024, h = 256) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return { c, t }; }
function smnLedDraw(L, txt, ghost) {
  const x = L.c.getContext('2d'), w = L.c.width, h = L.c.height;
  x.fillStyle = '#140404'; x.fillRect(0, 0, w, h);
  x.font = `700 ${h * 0.7}px Consolas, "Courier New", monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(255,60,20,0.12)'; x.fillText(ghost, w / 2, h * 0.54);
  x.shadowColor = '#ff3010'; x.shadowBlur = h * 0.08; x.fillStyle = '#ff4a1a'; x.fillText(txt, w / 2, h * 0.54); x.shadowBlur = 0;
  L.t.needsUpdate = true;
}
// a bank cheque texture: amount in figures and words, a signature
function smnCheque(amount, words) {
  return smnTex((x, w, h) => {
    x.fillStyle = '#e8f2dc'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(80,130,90,0.25)'; x.lineWidth = 2; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(0, i * h / 40); x.bezierCurveTo(w / 3, i * h / 40 + 8, w * 2 / 3, i * h / 40 - 8, w, i * h / 40); x.stroke(); }
    x.strokeStyle = '#3a6a4a'; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20);
    inked(x, 'CITY SAVINGS BANK', w * 0.3, h * 0.13, h * 0.08, '#2a4a34', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.5 });
    inked(x, 'PAY TO  RONALD WAYNE', w * 0.36, h * 0.36, h * 0.085, '#2a2a2a', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.62 });
    x.strokeStyle = '#2a4a34'; x.lineWidth = 4; x.strokeRect(w * 0.7, h * 0.27, w * 0.26, h * 0.2);
    inked(x, amount, w * 0.83, h * 0.37, h * 0.14, '#1a2a1a', { stroke: false, maxW: w * 0.24 });
    inked(x, words, w * 0.38, h * 0.58, h * 0.07, '#2a2a2a', { stroke: false, font: 'Georgia, serif', weight: 400, maxW: w * 0.66 });
    x.fillStyle = '#5a6a5a'; x.fillRect(w * 0.06, h * 0.67, w * 0.62, 3); x.fillRect(w * 0.62, h * 0.86, w * 0.32, 3);
    x.strokeStyle = '#1a2a6a'; x.lineWidth = 5; x.beginPath(); x.moveTo(w * 0.64, h * 0.83); for (let i = 0; i < 14; i++) x.lineTo(w * (0.64 + i * 0.02), h * 0.83 + Math.sin(i * 1.9) * 14); x.stroke();
  }, 1024, 448);
}
// a cheque that spins down from above and lands flat-ish on a surface at time tl (overshoot settle)
function smnChequeAt(m, t, tl, x, y, z, tilt = -1.1) {
  const fall = 0.42, u = clamp((t - (tl - fall)) / fall), s = t < tl - fall ? 0 : 1;
  m.visible = s > 0;
  const land = t >= tl ? 1 : 0, set = land ? Math.exp(-(t - tl) * 9) * Math.sin((t - tl) * 30) * 0.06 : 0;
  m.position.set(x + (1 - u) * 0.6, y + (1 - EZ.i2(u)) * 7, z);
  m.rotation.set(tilt + (1 - u) * 1.2 + set, (1 - u) * 2.4, (1 - u) * 1.1 + set);
}
// the 10 % slice of a pie chart: a wedge of an orange pie
function smnWedge(r = 1.1, h = 0.35) {
  const g = new THREE.Group();
  const cake = c3Mesh(new THREE.CylinderGeometry(r, r, h, 24, 1, false, 0, TAU * 0.1), smnMat('#f0a030', { rough: 0.5 }), 0.03); g.add(cake);
  const top = c3Mesh(new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.06, 24, 1, false, 0, TAU * 0.1), smnMat('#fff2d8', { rough: 0.4 }), 0.015); top.position.y = h / 2; g.add(top);
  return g;
}
function smnLabelTex(txt, bg, fg, w = 512, h = 192, k = 0.55) { return smnTex((x) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); inked(x, txt, w / 2, h / 2, h * k, fg, { stroke: false, maxW: w * 0.9 }); }, w, h); }

// ---- the bank
function smnBuildBank() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
  const key = lights(scene, { keyP: [5, 16, 14], keyI: 0.95, rim: '#ffcf80', rimI: 0.55 });
  const M = { marble: smnMat('#ffffff', { map: smnTex((x, w, h) => { for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = (i + j) % 2 ? '#e8dcc0' : '#2f5a46'; x.fillRect(i * w / 8, j * h / 8, w / 8, h / 8); } }), rough: 0.25 }),
    wood: smnMat('#ffffff', { map: texWood(), rough: 0.4 }), dark: smnMat('#4a2a18', { rough: 0.35 }), brass: c3Chrome('#e8c060', { rough: 0.15 }), chrome: c3Chrome(), green: smnMat('#2a6a4a', { rough: 0.3 }), red: smnMat('#a01818', { rough: 0.6 }) };
  M.marble.map.wrapS = M.marble.map.wrapT = THREE.RepeatWrapping; M.marble.map.repeat.set(6, 6);
  scene.add(pl(80, 80, M.marble, 0, 0, 0, 0, -Math.PI / 2));
  scene.add(pl(60, 26, smnMat('#ffffff', { map: texPanel(), rough: 0.6 }), 0, 13, -9));
  scene.add(pl(60, 30, smnMat('#efe2c4', { rough: 0.9 }), 0, 17, 0, 0, Math.PI / 2));
  scene.add(pl(14, 2.2, c3Flat('#ffffff', { map: smnLabelTex('CITY SAVINGS BANK', '#2a1608', '#f0c860', 1024, 160, 0.6), glow: '#4a3008' }), 0, 14.2, -8.9));
  // wall: big clock, two banker's windows with brass bars, framed portrait
  const clock = new THREE.Group(); clock.add(c3Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.3, 40), M.brass, 0.03)); clock.children[0].rotation.x = Math.PI / 2;
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.2, 40), smnMat('#ffffff', { map: smnTex((x, w, h) => { x.fillStyle = '#fbf6e8'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a1a10'; x.font = '700 44px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let k = 1; k <= 12; k++) { const a = k / 12 * TAU - Math.PI / 2; x.fillText(String(k), w / 2 + Math.cos(a) * w * 0.38, h / 2 + Math.sin(a) * h * 0.38); }
    x.lineCap = 'round'; x.strokeStyle = '#2a1a10'; x.lineWidth = 12; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + w * 0.2, h / 2 - h * 0.08); x.stroke(); x.lineWidth = 7; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 - w * 0.05, h / 2 - h * 0.33); x.stroke(); }), rough: 0.5 }));
  face.position.z = 0.16; clock.add(face); clock.position.set(-6.5, 11.2, -8.7); scene.add(clock);
  for (const wx of [6.5, 11.5]) { scene.add(rb(3.6, 4.6, 0.3, M.dark, wx, 9.8, -8.8)); scene.add(pl(3.0, 4.0, c3Flat('#ffe6b0', { glow: '#ffcf80' }), wx, 9.8, -8.6)); for (let k = 0; k < 6; k++) scene.add(cyl(0.05, 0.05, 4.0, M.brass, wx - 1.25 + k * 0.5, 9.8, -8.5, 0.012, 8)); }
  scene.add(rb(2.6, 3.2, 0.3, M.brass, -11.5, 10.2, -8.8)); scene.add(pl(2.1, 2.7, smnMat('#ffffff', { map: smnTex((x, w, h) => { x.fillStyle = '#5a3a24'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8d0b0'; x.beginPath(); x.arc(w / 2, h * 0.38, w * 0.2, 0, TAU); x.fill(); x.fillStyle = '#2a1a10'; x.fillRect(w * 0.25, h * 0.6, w * 0.5, h * 0.4); }), rough: 0.6 }), -11.5, 10.2, -8.6));
  // the teller line: wooden counter, brass grilles, a TELLER plate, banker's lamps, stacks of cash
  const focus = new THREE.Group(); scene.add(focus);
  focus.add(rb(20, 4.4, 2.6, M.wood, 0, 2.2, -0.3)); focus.add(rb(20.6, 0.35, 3.0, M.dark, 0, 4.55, -0.3, 0.025));
  for (let k = 0; k < 9; k++) focus.add(rb(0.25, 4.0, 0.25, M.dark, -9.5 + k * 2.4, 2.1, 1.05, 0.015));
  for (const gx of [-5.0, 2.6]) {
    focus.add(rb(4.2, 0.18, 0.25, M.brass, gx, 9.1, -0.9, 0.015)); focus.add(rb(4.2, 0.18, 0.25, M.brass, gx, 4.85, -0.9, 0.015));
    for (let k = 0; k < 9; k++) focus.add(cyl(0.045, 0.045, 4.2, M.brass, gx - 2.0 + k * 0.5, 6.95, -0.9, 0.01, 8));
  }
  focus.add(pl(2.2, 0.55, smnMat('#ffffff', { map: smnLabelTex('TELLER', '#2a1608', '#f0c860', 512, 128, 0.6), rough: 0.3 }), 2.6, 9.55, -0.85));
  function lamp(x, z) { const g = new THREE.Group(); g.add(cyl(0.25, 0.35, 0.12, M.brass, 0, 0.06, 0, 0.015)); g.add(cyl(0.05, 0.05, 1.0, M.brass, 0, 0.6, 0, 0.01, 8));
    const sh = c3Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.4, 20, 1, true, 0, Math.PI), smnMat('#1e7a4a', { rough: 0.15, emissive: '#2a8a4a', ei: 0.35 }), 0.02); sh.rotation.set(0, Math.PI / 2, Math.PI / 2); sh.position.y = 1.15; sh.material.side = THREE.DoubleSide; g.add(sh);
    const b = c3Mesh(new THREE.SphereGeometry(0.22, 12, 8), c3Flat('#fff2c8', { glow: '#ffd890' })); b.position.y = 0.95; g.add(b); g.position.set(x, 4.72, z); return g; }
  focus.add(lamp(-8.6, -0.6)); focus.add(lamp(7.6, -0.6));
  for (let i = 0; i < 5; i++) { const R = RNG('cash', i), st = new THREE.Group();
    for (let k = 0; k < 4; k++) { const b = rb(0.9, 0.22, 0.45, smnMat('#6aaa6a', { rough: 0.6 }), 0, 0.11 + k * 0.23, 0, 0.012); st.add(b); const band = rb(0.18, 0.24, 0.47, smnMat('#f0e0b0', { rough: 0.5 }), 0, 0.11 + k * 0.23, 0, 0); st.add(band); }
    st.position.set(4.9 + (i % 3) * 1.0 + R.n(0.1), 4.72, -0.9 + Math.floor(i / 3) * 0.6); st.rotation.y = R.n(0.3); focus.add(st); }
  const bag = c3Mesh(new THREE.SphereGeometry(0.9, 20, 14), smnMat('#c8b088', { rough: 0.8 }), 0.03); bag.scale.set(1, 1.15, 0.9); bag.position.set(-1.2, 5.6, -0.9); focus.add(bag);
  const bagMark = pl(0.9, 0.9, c3Flat('#ffffff', { map: smnLabelTex('$', '#c8b088', '#2a5a2a', 256, 256, 0.8) }), -1.2, 5.6, -0.05); focus.add(bagMark);
  // the LED counter: a chrome-framed box on the counter, facing the lobby
  const led = smnLed(1024, 256);
  focus.add(rb(5.2, 1.7, 0.9, M.dark, 1.4, 5.65, 0.65)); focus.add(rb(5.4, 0.2, 1.0, M.chrome, 1.4, 6.55, 0.65, 0.015)); focus.add(rb(5.4, 0.2, 1.0, M.chrome, 1.4, 4.78, 0.65, 0.015));
  focus.add(pl(4.8, 1.2, c3Flat('#ffffff', { map: led.t, glow: '#5a1606' }), 1.4, 5.66, 1.11));
  // velvet ropes on chrome posts
  for (const px of [-9, -5.5]) { focus.add(cyl(0.12, 0.12, 2.6, M.chrome, px, 1.3, 4.5, 0.015, 12)); focus.add(cyl(0.45, 0.5, 0.12, M.chrome, px, 0.06, 4.5, 0.015)); }
  const rope = c3Mesh(new THREE.TorusGeometry(1.75, 0.09, 8, 24, Math.PI), M.red, 0.015); rope.rotation.set(0, 0, Math.PI); rope.position.set(-7.25, 2.55, 4.5); focus.add(rope);
  const plant = new THREE.Group(); plant.add(cyl(0.7, 0.55, 1.4, smnMat('#b07040', { rough: 0.5 }), 0, 0.7, 0));
  for (let i = 0; i < 9; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.6, 10, 8), smnMat('#3a8a4a', { rough: 0.6 }), 0.02); lf.position.set(Math.cos(i * 2.1) * 0.6, 2.0 + (i % 3) * 0.5, Math.sin(i * 2.1) * 0.6); lf.scale.set(0.5, 1.5, 0.3); lf.rotation.z = Math.cos(i * 2.1) * 0.6; plant.add(lf); }
  plant.position.set(-12, 0, 2); focus.add(plant);
  // people: Jobs at the window (lobby side), the teller behind the grille
  const jobs = smnPerson({ key: 'jobs', outfit: 'white', hairStyle: 'long', fx: ['beard', 'mustache'] }, -3.4, 2.6);
  const teller = smnPerson({ key: 'teller', outfit: 'navy', hairStyle: 'neat', fx: ['glasses'] }, 3.0, -2.2, 0.4);
  focus.add(jobs.g); focus.add(teller.g);
  c3Layer(focus, C3.L_FOCUS);
  // pools of lamp light and dark corners; foreground: a chrome rope post and a palm, blurred over the lobby
  smnDim(scene, 0.14, 0.22); key.intensity = 0.7; smnLamp(scene, -8.6, 7.2, 0.4, '#ffd890', 1.8, 16); smnLamp(scene, 7.6, 7.2, 0.4, '#ffd890', 1.8, 16); smnLamp(scene, 1.4, 6.0, 3.0, '#ff7040', 1.0, 9);
  const post = new THREE.Group(); post.add(cyl(0.16, 0.16, 3.2, M.chrome, 0, 1.6, 0, 0.02, 12)); post.add(cyl(0.6, 0.65, 0.15, M.chrome, 0, 0.08, 0, 0.02)); post.add(c3Mesh(new THREE.SphereGeometry(0.28, 14, 10), M.chrome, 0.02).translateY(3.3));
  post.position.set(-5.2, 0, 14.5); smnNear(scene, post);
  const palm = new THREE.Group(); for (let i = 0; i < 7; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.9, 12, 8), smnMat('#2f6a3a', { rough: 0.6 }), 0.03); lf.scale.set(0.45, 2.4, 0.2); lf.position.set(Math.cos(i * 0.9) * 1.2, 6 + Math.sin(i * 1.7) * 1.2, 0); lf.rotation.z = -0.9 + i * 0.3; palm.add(lf); }
  palm.position.set(5.6, 0, 15.5); smnNear(scene, palm);
  c3Env(scene, { top: '#ffe0b0', mid: '#704830' }); c3Shadows(scene, key, 18);
  return { scene, cam, jobs, teller, led };
}
SHOT_FN['s11'] = (t, u, lt) => {
  const b = SMN.bank ||= smnBuildBank();
  const land = smnW('000', 1, 14.74), borrow = smnW('borrows', 1, 14.06);
  const dur = smnDur('s11');   // push in from the lobby toward Jobs at the window, crane up a little, orbit toward the LED
  smnCam(b.cam, [[0, [-3.4, 4.6, 25.5], [-1.2, 7.4, 1.0], 50], [borrow - 13.22, [-2.6, 5.0, 23.6], [-0.9, 7.3, 1.0], 50], [dur, [-1.4, 5.6, 21.2], [-0.3, 7.0, 1.0], 50]], lt, dur, { orbit: 0.06, crane: 0.25 });
  const p = clamp((t - (borrow - 0.1)) / (land - borrow + 0.1)), v = t >= land ? 15000 : Math.floor(15000 * (1 - (1 - p) ** 3));
  smnLedDraw(b.led, '$' + (t < borrow - 0.1 ? 0 : v).toLocaleString('en-US'), '$88,888');
  const grab = c3Hold([[0, [1.4, 0.6]], [land, [2.0, 2.4]]], t, 5 / 30);   // Jobs reaches for the cash as the number lands
  c3PersonPose(b.jobs, b.cam, t, { expr: c3FaceAt([[0, 'smile'], [borrow, 'mischievous'], [land, 'excited']], t, 'jobs'), gaze: [0.7, 0.1], head: [-0.05, 0, 0],
    hand: { armL: grab, armR: [-1.3, 0.5] }, x: t >= land && t < land + 0.9 ? ['sparkle'] : [] });
  c3PersonPose(b.teller, b.cam, t, { expr: c3FaceAt([[0, 'neutral'], [land, 'worried']], t, 'teller'), gaze: [-0.8, 0], head: [0.06, 0, 0], hand: { armL: [1.3, 1.2], armR: [-1.3, 1.2] } });
  smnNearDrift(b.scene, lt, dur, '1'); c3Render(b.scene, b.cam, { bg: '#1a0c06', bgBlur: smnRack(lt, dur), nearBlur: 10, glow: 0.6, glowBlur: 16, bloom: 0.3 });
};

// ---- the garage (inside): workbench, Apple I boards, open roll-up door to the right
function smnBoardTex() { return SMN.boardTex ||= smnTex((x, w, h) => { x.fillStyle = '#2a7a4a'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(200,230,170,0.5)'; x.lineWidth = 2; const R = RNG('pcb');
  for (let i = 0; i < 40; i++) { x.beginPath(); const y = R.r(0, h); x.moveTo(0, y); x.lineTo(R.r(0, w), y); x.lineTo(R.r(0, w), R.r(0, h)); x.stroke(); }
  for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { x.fillStyle = '#1a1a1a'; x.fillRect(20 + i * 80, 30 + j * 110, 56, 70); x.fillStyle = '#c8c8c8'; for (let k = 0; k < 6; k++) { x.fillRect(16 + i * 80, 36 + j * 110 + k * 11, 4, 5); x.fillRect(76 + i * 80, 36 + j * 110 + k * 11, 4, 5); } } }, 512, 512); }
function smnBoard(group, x, y, z, ry = 0) { const b = rb(1.9, 0.08, 1.3, smnMat('#ffffff', { map: smnBoardTex(), rough: 0.4 }), x, y, z, 0.012); b.rotation.y = ry; group.add(b); return b; }
function smnInvoiceTex() { return SMN.inv ||= smnTex((x, w, h) => { x.fillStyle = '#fbf6e8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3a2a1a'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28);
  inked(x, 'INVOICE', w / 2, h * 0.11, h * 0.08, '#2a1a10', { stroke: false, font: 'Georgia, serif', weight: 700 });
  x.fillStyle = 'rgba(60,40,20,0.55)'; for (let i = 0; i < 9; i++) { x.fillRect(w * 0.1, h * (0.24 + i * 0.05), w * 0.5, 6); x.fillRect(w * 0.72, h * (0.24 + i * 0.05), w * 0.18, 6); }
  x.fillStyle = '#2a1a10'; x.fillRect(w * 0.1, h * 0.72, w * 0.8, 5);
  inked(x, 'TOTAL DUE', w * 0.32, h * 0.8, h * 0.05, '#2a1a10', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.4 });
  inked(x, '$$$$$', w * 0.72, h * 0.8, h * 0.08, '#c81e14', { stroke: false, maxW: w * 0.36 });
  x.save(); x.translate(w * 0.52, h * 0.36); x.rotate(-0.22); x.strokeStyle = '#d22a1e'; x.lineWidth = 14; x.strokeRect(-w * 0.32, -h * 0.06, w * 0.64, h * 0.12); inked(x, 'PAY NOW', 0, 0, h * 0.075, '#d22a1e', { stroke: false }); x.restore();   // PAY NOW up in the open middle of the sheet (user)
}, 768, 1024); }
function smnBuildGarage() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
  // light: daylight pouring in from the roll-up door (right), a bare bulb over the bench, a work lamp; little fill -> dark corners
  const key = lights(scene, { keyP: [14, 12, 8], keyI: 0.55, key: '#fff0d8', rim: '#ffb070', rimI: 0.35 });
  smnDim(scene, 0.1, 0.16);
  const day = new THREE.PointLight('#fff0d0', 2.6, 34, 1.6); day.position.set(12, 6, 3); day.layers.enableAll(); scene.add(day);
  smnLamp(scene, -3, 12.6, -2, '#ffcf80', 2.2, 20); smnLamp(scene, -6.0, 8.2, -4.2, '#ffe0a8', 1.6, 12);
  const M = { wood: smnMat('#ffffff', { map: texWood(), rough: 0.45 }), conc: smnMat('#7a746a', { rough: 0.85 }), wall: smnMat('#ffffff', { map: smnTex((x, w, h) => { x.fillStyle = '#6a7670'; x.fillRect(0, 0, w, h); x.strokeStyle = '#4e5853'; x.lineWidth = 4; for (let j = 0; j < 16; j++) { x.beginPath(); x.moveTo(0, j * h / 16); x.lineTo(w, j * h / 16); x.stroke(); for (let i = 0; i < 8; i++) { const xx = (i + (j % 2) * 0.5) * w / 8; x.beginPath(); x.moveTo(xx, j * h / 16); x.lineTo(xx, (j + 1) * h / 16); x.stroke(); } } }, 512, 512), rough: 0.9 }), panel: smnMat('#ffffff', { map: texPanel(), rough: 0.6 }),
    peg: smnMat('#ffffff', { map: smnTex((x, w, h) => { x.fillStyle = '#b08850'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a3e22'; for (let j = 0; j < 24; j++) for (let i = 0; i < 48; i++) { x.beginPath(); x.arc(6 + i * 10.6, 6 + j * 10.6, 2.2, 0, TAU); x.fill(); } }, 512, 256), rough: 0.7 }),
    metal: c3Chrome('#c8ccd4', { rough: 0.25 }), red: smnMat('#c8321e', { rough: 0.35 }), dark: smnMat('#2a2420', { rough: 0.4 }), card: smnMat('#c89a5a', { rough: 0.8 }), beige: smnMat('#e6dcc4', { rough: 0.4 }),
    oil: smnMat('#4a4038', { rough: 0.3 }), cable: smnMat('#1e1e22', { rough: 0.4 }), cableO: smnMat('#d8641e', { rough: 0.4 }) };
  M.panel.map.wrapS = THREE.RepeatWrapping; M.panel.map.repeat.set(5, 1); M.wall.map.wrapS = M.wall.map.wrapT = THREE.RepeatWrapping; M.wall.map.repeat.set(4, 2);
  scene.add(pl(80, 80, M.conc, 0, 0, 0, 0, -Math.PI / 2));
  const oil = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), smnMat('#3a332c', { rough: 0.2 })); oil.rotation.x = -Math.PI / 2; oil.position.set(4, 0.02, 6); oil.scale.set(1.4, 0.8, 1); scene.add(oil);
  scene.add(pl(40, 5, M.panel, 0, 2.5, -7.98)); scene.add(pl(40, 14, M.wall, 0, 12, -8)); scene.add(pl(30, 18, M.wall, -12, 9, 4, Math.PI / 2)); scene.add(pl(40, 30, smnMat('#4a3c30', { rough: 0.9 }), 0, 17, 0, 0, Math.PI / 2));
  for (let k = 0; k < 4; k++) scene.add(rb(40, 0.6, 0.8, M.wood, 0, 16.6, -6 + k * 5, 0.02));   // ceiling joists
  // roll-up door on the right wall, open: daylight, driveway, hedge
  scene.add(pl(30, 18, M.wall, 13, 9, 4, -Math.PI / 2));
  scene.add(pl(9, 9.5, c3Flat('#fff4d8', { glow: '#ffe6b0' }), 12.9, 4.75, 3.5, -Math.PI / 2));
  for (let k = 0; k < 5; k++) scene.add(rb(0.3, 0.6, 9.4, M.metal, 12.8, 10.0 + k * 0.6, 3.5, 0.012));
  scene.add(rb(0.4, 9.8, 0.4, M.dark, 12.8, 4.9, -1.2)); scene.add(rb(0.4, 9.8, 0.4, M.dark, 12.8, 4.9, 8.2));
  // pegboard with hand tools, coiled cables on hooks, a poster, shelves of boxes and paint cans, a bare bulb
  scene.add(rb(15, 6.4, 0.3, M.peg, -2, 9.6, -7.8, 0.02));
  const tool = (c, parts, x, y) => { const g = new THREE.Group(); parts.forEach(([w, h, dx, dy, mc]) => g.add(rb(w, h, 0.18, mc ? smnMat(mc, { rough: 0.35 }) : smnMat(c, { rough: 0.35 }), dx, dy, 0, 0.02))); g.position.set(x, y, -7.5); scene.add(g); };
  tool('#c8321e', [[0.25, 1.6, 0, 0], [1.1, 0.35, 0, 0.9, '#8a8e96']], -8.2, 9.8);         // hammer
  tool('#8a8e96', [[0.22, 2.0, 0, 0], [0.6, 0.35, 0, 1.0]], -6.6, 9.6);                      // wrench
  tool('#3a6ac8', [[0.3, 1.0, 0, -0.5], [0.12, 1.2, 0, 0.6, '#c8ccd4']], -5.3, 9.9);           // screwdriver
  tool('#f0c040', [[0.35, 1.0, 0, -0.6], [1.2, 1.6, 0.4, 0.6, '#c8ccd4']], -3.6, 9.6);        // saw
  tool('#2a2a2a', [[0.9, 0.9, 0, 0], [0.25, 0.9, 0, -0.85, '#c8321e']], 2.0, 10.4);           // pliers-ish
  for (const [cx, mc] of [[-0.6, M.cable], [3.6, M.cableO]]) { for (let k = 0; k < 3; k++) { const coil = c3Mesh(new THREE.TorusGeometry(0.85 - k * 0.04, 0.07, 8, 28), mc, 0.012); coil.position.set(cx + k * 0.05, 9.4 - k * 0.06, -7.45 + k * 0.05); scene.add(coil); } }
  const poster = pl(3.4, 4.6, smnMat('#ffffff', { map: smnTex((x, w, h) => { x.fillStyle = '#f0e2c0'; x.fillRect(0, 0, w, h);
    ['#e2462f', '#f0922a', '#f2c230', '#4aa04a', '#3a6ac8', '#8a4ac8'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, h * (0.2 + i * 0.06), w, h * 0.06); });
    inked(x, 'HOMEBREW', w / 2, h * 0.68, h * 0.1, '#2a1a10', { stroke: false }); inked(x, 'COMPUTER CLUB', w / 2, h * 0.79, h * 0.07, '#2a1a10', { stroke: false }); inked(x, 'WED 7 PM', w / 2, h * 0.9, h * 0.05, '#c8321e', { stroke: false });
    x.strokeStyle = '#2a1a10'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); }, 384, 512), rough: 0.8 }), -10.5, 10.6, -7.85); poster.rotation.z = 0.04; scene.add(poster);
  for (let s2 = 0; s2 < 3; s2++) { scene.add(rb(6, 0.25, 2, M.wood, 8, 3 + s2 * 3.4, -7, 0.02));
    for (let i = 0; i < 3; i++) { const R = RNG('gbox', s2, i); scene.add(rb(R.r(1.3, 1.7), R.r(1.3, 2.1), 1.6, smnMat('#ffffff', { map: texBox(['PARTS', 'CHIPS', 'CABLES'][(i + s2) % 3], '#c8a060'), rough: 0.7 }), 6.0 + i * 1.65, 3.15 + s2 * 3.4 + 0.85, -7, 0.02)); }
    const can = cyl(0.45, 0.45, 1.0, smnMat(['#c8321e', '#3a6ac8', '#5aa05a'][s2], { rough: 0.3 }), 10.4, 3.65 + s2 * 3.4, -6.8, 0.02); scene.add(can); }
  const bulb = new THREE.Group(); bulb.add(cyl(0.03, 0.03, 3, c3Flat('#2a2a2a'), 0, 1.5, 0, 0, 6)); const bb = c3Mesh(new THREE.SphereGeometry(0.4, 14, 10), c3Flat('#fff4d0', { glow: '#ffd890' })); bulb.add(bb); bulb.position.set(-3, 13.5, -2); scene.add(bulb);
  const fan = new THREE.Group(); fan.add(cyl(0.6, 0.8, 0.2, M.dark, 0, 0.1, 0, 0.02)); fan.add(cyl(0.08, 0.08, 1.4, M.metal, 0, 0.8, 0, 0.012, 8)); const cage = c3Mesh(new THREE.TorusGeometry(0.9, 0.06, 8, 28), M.metal, 0.015); cage.position.y = 1.9; fan.add(cage);
  for (let k = 0; k < 3; k++) { const bl = c3Mesh(new THREE.SphereGeometry(0.5, 10, 6), smnMat('#7aa0c8', { rough: 0.3 }), 0.012); bl.scale.set(0.35, 1, 0.08); bl.position.set(Math.sin(k * 2.1) * 0.45, 1.9 + Math.cos(k * 2.1) * 0.45, 0.05); bl.rotation.z = -k * 2.1; fan.add(bl); }
  fan.position.set(8.6, 4.6, -5.4); scene.add(fan);
  // foreground (blurred): a cardboard box corner and a coiled extension cord near the lens
  const nearBox = rb(3.4, 4.0, 3.0, smnMat('#ffffff', { map: texBox('APPLE I', '#b8884a'), rough: 0.8 }), -9.5, 2.0, 15.5, 0.04); nearBox.rotation.y = 0.5; smnNear(scene, nearBox);
  const cord = new THREE.Group(); for (let k = 0; k < 4; k++) { const c = c3Mesh(new THREE.TorusGeometry(1.1 - k * 0.08, 0.12, 8, 30), M.cableO, 0.015); c.rotation.x = Math.PI / 2; c.position.y = 0.15 + k * 0.2; cord.add(c); } cord.position.set(8.5, 0, 16); smnNear(scene, cord);
  // the workbench along the back wall: oscilloscope, soldering iron (smoking), stacks of boards
  const focus = new THREE.Group(); scene.add(focus);
  focus.add(rb(16, 0.45, 3.2, M.wood, -1, 4.4, -5.6)); for (const lx of [-8.6, 6.6]) focus.add(rb(0.4, 4.2, 2.8, M.wood, lx, 2.1, -5.6));
  const scope = new THREE.Group(); scope.add(rb(3.0, 2.2, 2.0, M.beige, 0, 1.1, 0)); scope.add(pl(1.7, 1.2, c3Flat('#ffffff', { map: smnTex((x, w, h) => { x.fillStyle = '#062a12'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3aff8a'; x.lineWidth = 6; x.beginPath(); for (let i = 0; i <= 64; i++) x.lineTo(i * w / 64, h / 2 + Math.sin(i * 0.5) * h * 0.3); x.stroke(); }, 256, 192), glow: '#2acb6a' }), -0.3, 1.2, 1.01));
  for (let k = 0; k < 4; k++) scope.add(cyl(0.12, 0.12, 0.15, M.dark, 0.9, 0.5 + k * 0.42, 1.05, 0.01, 10).rotateX(Math.PI / 2));
  scope.position.set(-6.4, 4.63, -6.0); focus.add(scope);
  const iron = new THREE.Group(); iron.add(cyl(0.12, 0.12, 2.0, M.red, 0, 0, 0, 0.015, 10)); iron.add(cyl(0.05, 0.01, 0.8, M.metal, 0, -1.4, 0, 0.01, 8)); iron.rotation.z = 1.1; iron.position.set(-2.0, 5.3, 3.6); focus.add(iron);
  const stand = rb(1.2, 0.4, 0.9, M.dark, -1.2, 5.03, 3.6, 0.015); focus.add(stand);   // the iron's stand
  const boards = []; for (let i = 0; i < 16; i++) { const b = smnBoard(focus, 1.2 + (i % 2) * 2.1, 4.88 + Math.floor(i / 2) * 0.1, 3.8, (i % 3) * 0.05); boards.push(b); }
  for (let i = 0; i < 5; i++) smnBoard(focus, -3.2 + i * 0.2, 4.68 + i * 0.1, -4.8, 0.2);
  // a table in the foreground (s18, s20), a stool, cardboard boxes
  const table = new THREE.Group(); table.add(rb(7, 0.4, 3.4, M.wood, 0, 4.4, 0)); for (const [a, c] of [[-3, -1.3], [3, -1.3], [-3, 1.3], [3, 1.3]]) table.add(rb(0.35, 4.2, 0.35, M.wood, a, 2.1, c, 0.015));
  table.position.set(0, 0, 3.2); focus.add(table);
  for (let i = 0; i < 3; i++) { const R = RNG('cbox', i); focus.add(rb(R.r(1.8, 2.6), R.r(1.4, 2.2), 1.8, smnMat('#ffffff', { map: texBox(['APPLE I', 'KEYS', 'MONITOR'][i], '#c89a5a'), rough: 0.8 }), -10 + i * 0.3, 1.0 + i * 1.6, 0.5 - i * 0.4, 0.02)); }
  const smoke = smnSmoke(focus, 6, 'iron');
  // the invoice (s15), the cheques (s18, s20), the 10 % slice and Ron's box
  const inv = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 8.5), smnMat('#ffffff', { map: smnInvoiceTex(), rough: 0.8 })); inv.material.side = THREE.DoubleSide; inv.visible = false; c3Ink(inv, 0.04); focus.add(inv);
  const ch800 = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 2.62), smnMat('#ffffff', { map: smnCheque('$800.00', 'Eight hundred and 00/100 dollars'), rough: 0.7 })); ch800.material.side = THREE.DoubleSide; c3Ink(ch800, 0.02); focus.add(ch800);
  const ch1500 = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 2.62), smnMat('#ffffff', { map: smnCheque('$1,500.00', 'Fifteen hundred and 00/100 dollars'), rough: 0.7 })); ch1500.material.side = THREE.DoubleSide; c3Ink(ch1500, 0.02); focus.add(ch1500);
  const wedge = smnWedge(1.5, 0.45); focus.add(wedge);
  const pieRest = new THREE.Group(); pieRest.add(c3Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.45, 32, 1, false, TAU * 0.1, TAU * 0.9), smnMat('#f0a030', { rough: 0.5 }), 0.03));
  const pieTop = c3Mesh(new THREE.CylinderGeometry(1.48, 1.48, 0.06, 32, 1, false, TAU * 0.1, TAU * 0.9), smnMat('#fff2d8', { rough: 0.4 }), 0.015); pieTop.position.y = 0.23; pieRest.add(pieTop);
  pieRest.position.set(2.2, 4.85, 3.2); focus.add(pieRest);
  const box = rb(2.4, 1.6, 1.4, smnMat('#ffffff', { map: texBox('RON\'S STUFF', '#c89a5a'), rough: 0.8 }), 0, 0, 0, 0.02);
  // people
  const ron = (c3Person({ key: 'ron', outfit: 'mustard', hairStyle: 'brown', fx: ['mustache', 'glasses'] }));
  const jobs = (c3Person({ key: 'jobs', outfit: 'white', hairStyle: 'long', fx: ['beard', 'mustache'] }));
  const woz = (c3Person({ key: 'woz', outfit: 'plaid', hairStyle: 'ref', fx: ['beard', 'mustache', 'glasses'] }));
  [ron, jobs, woz].forEach((p) => { p.g.scale.setScalar(SMN_K); focus.add(p.g); });
  ron.root.add(box); box.visible = false;
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#e8d0a8', mid: '#5a4030' }); c3Shadows(scene, key, 20);
  return { scene, cam, ron, jobs, woz, boards, smoke, inv, ch800, ch1500, wedge, pieRest, box, iron, stand, table };
}
const smnG = () => SMN.garage ||= smnBuildGarage();
function smnShow(g, who) { for (const k of ['ron', 'jobs', 'woz']) g[k].g.visible = who.includes(k); g.smoke.ps.forEach((m) => { m.visible = who.includes('woz'); }); }   // the iron's smoke only in s12

SHOT_FN['s12'] = (t, u, lt) => {   // "to build computers": Woz solders behind the table, boards stack up, the last on "computers"
  const g = smnG(); smnShow(g, ['woz']);
  g.inv.visible = false; g.ch800.visible = false; g.ch1500.visible = false; g.wedge.visible = false; g.pieRest.visible = false; g.table.visible = true; g.iron.visible = g.stand.visible = true;
  const comp = smnW('computers', 1, 16.0);
  c3Put(g.woz.g, -1.4, SMN_FOOT, 1.0);
  const dur = smnDur('s12');   // a low tracking move along the bench toward the stack, starting on "build"
  smnCam(g.cam, [[0, [-5.0, 5.2, 24.0], [-0.6, 6.4, 1.5], 50], [Math.max(0.2, smnW('build', 1, 15.3) - 15.0), [-3.6, 5.3, 22.6], [0.0, 6.3, 1.8], 50], [dur, [-0.6, 5.6, 19.6], [1.2, 6.0, 2.4], 50]], lt, dur, { orbit: 0.07 });
  g.boards.forEach((b, i) => { const tin = comp - 0.95 + i * 0.06, k = clamp((t - tin) / 0.12); b.visible = i < 6 || t >= tin;
    b.position.y = (b.userData.y0 ??= b.position.y) + (1 - EZ.back(k)) * 0.8; });
  smnSmokeAt(g.smoke, t, g.cam, -1.15, 5.3, 3.6);
  const sol = Math.sin(t * 9) * 0.05;
  c3PersonPose(g.woz, g.cam, t, { expr: c3FaceAt([[0, 'determined'], [comp, 'happy']], t, 'woz'), gaze: [0.2, 0.8], head: [-0.04, 0, -0.06],
    hand: { armL: [1.5 + sol, 1.2], armR: [-1.6, 1.1] }, x: t >= comp ? ['sparkle'] : [] });
  smnNearDrift(g.scene, lt, dur, '2'); c3Render(g.scene, g.cam, { bg: '#1a0c06', bgBlur: smnRack(lt, dur), nearBlur: 11, glow: 0.6, glowBlur: 16, bloom: 0.3 });
};

SHOT_FN['s15'] = (t, u, lt) => {   // "the debt lands on you": a giant invoice drops onto Ron on "lands"
  const g = smnG(); smnShow(g, ['ron']); g.box.visible = false;
  g.ch800.visible = false; g.ch1500.visible = false; g.wedge.visible = false; g.pieRest.visible = false; g.table.visible = false; g.boards.forEach((b) => { b.visible = false; });
  const land = smnW('lands', 1, 20.54);
  c3Put(g.ron.g, 0.6, SMN_FOOT, 1.2);
  const dur = smnDur('s15');   // low angle looking up; a fast crash-in on "lands" (impact)
  const crash = t >= land ? 0.9 * EZ.o3(clamp((t - land) / 0.25)) : 0;
  smnCam(g.cam, [[0, [2.6, 3.2, 18.4], [0.4, 8.2, 0.0], 52], [land - 20.16, [1.4, 3.0, 16.8], [0.4, 8.2, 0.0], 52], [dur, [0.8, 2.6 - crash, 15.2 - crash * 2], [0.4, 8.6, 0.0], 52]], lt, dur, { orbit: -0.06 });
  // the invoice falls from above, lands leaning over Ron (top on his head, foot on the floor behind him)
  const fall = 0.32, k = clamp((t - (land - fall)) / fall), hit = t >= land ? Math.exp(-(t - land) * 10) * Math.sin((t - land) * 34) : 0;
  g.inv.visible = t >= land - fall; g.iron.visible = g.stand.visible = false;
  const press = t >= land ? 0.45 * Math.exp(-(t - land) * 6) : 0;   // the sheet slams onto his hands and head
  g.inv.position.set(0.6, 10.7 + (1 - EZ.i2(k)) * 12 - press, 1.6);
  g.inv.rotation.set(0.95 + (1 - k) * 0.5 + hit * 0.05, 0.1, -0.1 + (1 - k) * 0.5);
  // Ron squashes and jolts: the body drops on impact, the head follows
  const lift = (v) => v < land ? 0 : -0.55 * Math.exp(-(v - land) * 7) * Math.cos((v - land) * 14);
  c3PersonPose(g.ron, g.cam, t, { expr: c3FaceAt([[0, 'worried'], [land, 'panic']], t, 'ron'), gaze: [0, 1], head: [0.04, 0, -0.06], lift,
    hand: t < land ? { armL: [1.8, 3.4], armR: [-1.8, 3.4] } : { armL: [1.7, 4.6], armR: [-1.7, 4.6] }, x: t >= land ? ['sweat'] : [] });
  smnNearDrift(g.scene, lt, dur, '3'); c3Render(g.scene, g.cam, { bg: '#1a0c06', bgBlur: smnRack(lt, dur, 1.4, 3.4), nearBlur: 11, glow: 0.6, glowBlur: 16, bloom: 0.3 });
};

SHOT_FN['s18'] = (t, u, lt) => {   // "you sell your 10% back for $800": the slice goes to Jobs, a cheque lands on "$800"
  const g = smnG(); smnShow(g, ['ron', 'jobs']); g.box.visible = false;
  g.inv.visible = false; g.ch1500.visible = false; g.table.visible = true; g.pieRest.visible = true; g.wedge.visible = true; g.iron.visible = g.stand.visible = false;
  g.boards.forEach((b) => { b.visible = false; });
  const sell = smnW('sell', 1, 25.08), pct = smnW('10', 1, 25.46), land = smnW('$800', 1, 26.6);
  c3Put(g.ron.g, -3.0, SMN_FOOT, 1.0); c3Put(g.jobs.g, 3.2, SMN_FOOT, 1.2);
  const dur = smnDur('s18');   // orbit across the table from Ron's side to Jobs' as the slice travels
  smnCam(g.cam, [[0, [-3.4, 5.6, 24.6], [-0.4, 6.2, 2.0], 50], [sell - 24.88, [-2.4, 5.7, 23.8], [-0.2, 6.2, 2.0], 50], [dur, [1.4, 5.9, 21.6], [0.2, 6.0, 2.4], 50]], lt, dur, { orbit: 0.05 });
  // the wedge travels from Ron's hand across the table to Jobs' hand (world positions)
  const m = EZ.io(clamp((t - sell) / Math.max(0.3, pct - sell + 0.25)));
  g.wedge.position.set(lerp(-1.4, 1.6, m), 6.9 + Math.sin(m * Math.PI) * 0.9, 2.6); g.wedge.rotation.set(0.6, -1.2 + m * 0.5, 0);
  g.ch800.scale.setScalar(0.55); smnChequeAt(g.ch800, t, land, -2.5, 5.3, 4.9, -0.75);   // lands propped up in front of Ron, clear of the slice's path
  c3PersonPose(g.ron, g.cam, t, { expr: c3FaceAt([[0, 'nervous'], [sell, 'smile'], [land, 'relieved']], t, 'ron'), gaze: [0.6, 0.3], head: [-0.04, 0, 0],
    hand: { armL: m < 0.5 ? [2.0, 2.4] : [1.4, 1.4], armR: [-1.3, 1.0] } });
  c3PersonPose(g.jobs, g.cam, t, { expr: c3FaceAt([[0, 'neutral'], [pct, 'mischievous']], t, 'jobs'), gaze: [-0.6, 0.3], head: [0.04, 0, 0],
    hand: { armR: m > 0.5 ? [-2.0, 2.4] : [-1.4, 1.4], armL: [1.3, 1.0] }, x: t >= land ? ['sparkle'] : [] });
  smnNearDrift(g.scene, lt, dur, '4'); c3Render(g.scene, g.cam, { bg: '#1a0c06', bgBlur: smnRack(lt, dur), nearBlur: 11, glow: 0.6, glowBlur: 16, bloom: 0.3 });
};

SHOT_FN['s20'] = (t, u, lt) => {   // "$1,500 more to walk away for good": the cheque lands, Ron walks out with his box
  const g = smnG(); smnShow(g, ['ron']); g.box.visible = true;
  g.inv.visible = false; g.ch800.visible = false; g.table.visible = true; g.pieRest.visible = false; g.wedge.visible = false; g.iron.visible = g.stand.visible = false;
  g.boards.forEach((b, i) => { b.visible = i < 6; });
  const land = smnW('500', 1, 28.94), walk = smnW('walk', 1, 29.84), dur = smnDur('s20');
  // brisk walk to the open roll-up door (x 12.9): he sets off as the cheque lands and steps into the light by the end
  // (a step every ~5.5 frames, body bob ~7 % of a head); past the door plane he is hidden by the wall
  const go = land + 0.15, wt = Math.max(0, t - go), x = 3.4 + wt * 5.6, ph = wt * FPS / 11 * TAU;
  c3Put(g.ron.g, x, SMN_FOOT, 6.4);
  smnCam(g.cam, [[0, [1.6, 5.6, 27.0], [2.4, 6.2, 4.0], 50], [go - 28.12, [2.6, 5.7, 26.4], [3.6, 6.2, 4.0], 50], [dur, [8.6, 6.0, 25.2], [10.4, 6.4, 4.0], 50]], lt, dur, { orbit: -0.03, push: 0.7 });
  g.ch1500.scale.setScalar(0.55); smnChequeAt(g.ch1500, t, land, 1.2, 5.3, 4.9, -0.75);
  g.box.position.set(0, 1.05, 0.35); g.box.rotation.set(0, 0, 0);
  const step = (sd) => [sd * 0.75 + (wt > 0 ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.55 : 0), -2.4 + (wt > 0 ? Math.max(0, Math.cos(ph + (sd > 0 ? 0 : Math.PI))) * 0.35 : 0)];
  const bob = (v) => (v > go ? Math.abs(Math.sin((v - go) * FPS / 11 * Math.PI)) * 0.2 : 0);
  c3PersonPose(g.ron, g.cam, t, { expr: c3FaceAt([[0, 'neutral'], [land, 'surprised'], [walk, 'smile']], t, 'ron'), gaze: [wt > 0 ? 0.8 : -0.6, 0.2], head: [0, 0, 0], lift: bob,
    hand: { armL: [1.25, 1.15], armR: [-1.25, 1.15] }, foot: { legL: step(1), legR: step(-1) } });
  smnNearDrift(g.scene, lt, dur, '5'); c3Render(g.scene, g.cam, { bg: '#1a0c06', bgBlur: smnRack(lt, dur), nearBlur: 11, glow: 0.7, glowBlur: 18, bloom: 0.34 });
};

// ---- the Byte Shop: a cramped 1976 computer store — shelves of boxed kits, terminals on the counter, price cards,
// fluorescent tubes, posters; the owner behind the counter and the box of UNPAID bills that flies on "bills"
function smnBuildShop() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
  const key = lights(scene, { keyP: [-6, 14, 12], keyI: 0.55, rim: '#7ab0ff', rimI: 0.4 }); smnDim(scene, 0.12, 0.2);
  const M = { shelf: smnMat('#ffffff', { map: texWood(), rough: 0.5 }), counter: smnMat('#b08050', { rough: 0.4 }), front: smnMat('#6a4026', { rough: 0.5 }), dark: smnMat('#2a2420', { rough: 0.4 }), beige: smnMat('#e6dcc4', { rough: 0.4 }),
    wall: smnMat('#7a6a52', { rough: 0.9 }), tube: c3Flat('#f4fff4', { glow: '#d8ffe8' }), floor: smnMat('#ffffff', { map: texLino(), rough: 0.6 }) };
  scene.add(pl(60, 60, M.floor, 0, 0, 0, 0, -Math.PI / 2)); scene.add(pl(40, 18, M.wall, 0, 9, -8)); scene.add(pl(40, 30, smnMat('#3a3028', { rough: 0.9 }), 0, 16.5, 0, 0, Math.PI / 2));
  for (const tx of [-6, 3, 12]) { scene.add(rb(4.6, 0.3, 0.6, M.dark, tx, 16.0, 0, 0.02)); scene.add(rb(4.2, 0.18, 0.3, M.tube, tx, 15.8, 0, 0)); smnLamp(scene, tx, 14.8, 0.5, '#e8fff0', 1.4, 16); }
  scene.add(pl(7.5, 1.9, c3Flat('#ffffff', { map: texSign('BYTE SHOP', '#ff7a2a', '#ffd080', 0.62), glow: '#5a2008' }), 0.7, 13.6, -7.9)); smnLamp(scene, 0.7, 12.6, -6, '#ff8a40', 1.2, 8);
  const boxes = [texBox('COMPUTER', '#c8a060'), texBox('MEMORY', '#b89050'), texBox('TERMINAL', '#d0b070'), texBox('KIT', '#a87840')];
  for (let s2 = 0; s2 < 3; s2++) { scene.add(rb(18, 0.3, 2.4, M.shelf, 0, 2.5 + s2 * 3.2, -6.8, 0.02));
    for (let i = 0; i < 9; i++) { const R = RNG('box', s2, i), bx = rb(R.r(1.3, 1.9), R.r(1.4, 2.3), 1.8, smnMat('#ffffff', { map: boxes[(i + s2) % 4], rough: 0.7 }), -8.4 + i * 2.05 + R.n(0.15), 2.65 + s2 * 3.2 + 0.85, -6.8, 0.025); bx.rotation.y = R.n(0.12); scene.add(bx); }
    for (let i = 0; i < 4; i++) { const pc = pl(0.9, 0.55, c3Flat('#ffffff', { map: smnLabelTex(['$666', '$75', '$29', '$495'][(i + s2) % 4], '#fff4c8', '#c8321e', 256, 160, 0.6) }), -7 + i * 4.6, 2.3 + s2 * 3.2, -5.55); scene.add(pc); } }
  const poster = pl(3.2, 4.4, smnMat('#ffffff', { map: smnTex((x, w, h) => { x.fillStyle = '#1a2a5a'; x.fillRect(0, 0, w, h); x.fillStyle = '#3aff8a'; x.font = '700 40px Consolas'; x.textAlign = 'center'; for (let i = 0; i < 6; i++) x.fillText('10 PRINT "HI"', w / 2, 120 + i * 50);
    inked(x, 'BASIC!', w / 2, h * 0.86, h * 0.1, '#f2c230', { stroke: false }); }, 384, 512), rough: 0.7 }), -11.5, 11.4, -7.85); scene.add(poster);
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.add(rb(2.4, 2.0, 2.0, M.beige, 0, 1.0, 0)); g.add(pl(1.7, 1.3, c3Flat('#3aff8a', { glow: '#2acb6a' }), 0, 1.1, 1.02)); g.add(rb(2.6, 0.3, 1.2, M.beige, 0, -0.05, 1.4, 0.02)); g.position.set(-6 + i * 6, 4.0, -3.5); scene.add(g); }
  scene.add(rb(18, 0.4, 3, M.counter, 0, 3.8, -3.5)); scene.add(rb(17.6, 3.6, 2.6, M.front, 0, 1.8, -3.5));
  const focus = new THREE.Group(); scene.add(focus);
  focus.add(rb(2.4, 1.6, 2.0, c3Chrome('#b8b8c0', { rough: 0.25 }), 5.5, 4.8, -3.2));                      // the register
  focus.add(rb(3.2, 2.2, 2.4, smnMat('#b08850', { rough: 0.7 }), -1.2, 5.1, -2.6));                        // the bills box
  focus.add(pl(2.4, 0.8, c3Flat('#ffffff', { map: smnLabelTex('UNPAID', '#f6efe0', '#d22a1e', 512, 170, 0.6) }), -1.2, 5.3, -1.38));
  const bills = []; for (let i = 0; i < 16; i++) { const R = RNG('bill', i), bl = pl(2.3, 2.3, smnMat('#ffffff', { map: texBill(i), rough: 0.8 }), -1.2 + R.n(1.2), 6.3 + R.r(0, 0.8), -2.6 + R.n(0.9));
    bl.rotation.set(-Math.PI / 2 + R.n(0.9), R.n(0.6), R.n(1.2)); bl.material.side = THREE.DoubleSide; c3Ink(bl, 0.02); focus.add(bl); bills.push(bl); }
  const owner = smnPerson({ key: 'owner', outfit: 'stripes', hairStyle: 'bald', fx: ['mustache'], shadow: 0 }, 3.4, -5.0); focus.add(owner.g);   // behind the counter
  for (const n of ['legL', 'legR']) { const L = owner.limbs[n]; [L.rib, L.r0, L.e].forEach((m) => { m.visible = false; }); }   // the counter hides his legs (user: no feet showing)
  scene.add(rb(18, 2.4, 0.3, M.front, 0, 1.2, -5.6, 0));   // a back panel closes the counter, so no floor shows behind it
  c3Layer(focus, C3.L_FOCUS);
  // foreground (blurred): a magazine rack and a keyboard on a stand near the lens
  const rack = new THREE.Group(); rack.add(rb(3.2, 5.0, 0.4, M.dark, 0, 2.5, 0)); for (let k = 0; k < 3; k++) rack.add(pl(1.3, 1.7, smnMat(['#e2462f', '#3a6ac8', '#f2c230'][k], { rough: 0.6 }), -0.8 + k * 0.8, 3.0 + (k % 2) * 1.2, 0.25));
  rack.position.set(-6.8, 0, 13.5); rack.rotation.y = 0.4; smnNear(scene, rack);
  const kb = new THREE.Group(); kb.add(rb(3.0, 0.4, 1.2, M.beige, 0, 0, 0)); kb.position.set(6.8, 2.6, 14); kb.rotation.set(0.5, -0.3, 0); smnNear(scene, kb);   // low, so it never crosses the owner's face
  c3Env(scene, { top: '#e8f0e0', mid: '#5a4a38' }); c3Shadows(scene, key, 16);
  return { scene, cam, owner, bills };
}
SHOT_FN['s13'] = (t, u, lt) => {
  const s2 = SMN.shop ||= smnBuildShop(), dur = smnDur('s13');
  const bills = smnW('bills', 1, 18.42), notp = smnW('not', 1, 17.68);
  // the bills burst out of the box on "bills": big sheets fly up and tumble toward the lens
  s2.bills.forEach((b, i) => { const R = RNG('billf', i), k = clamp((t - (bills - 0.3 + i * 0.025)) / 0.6); b.position.set((b.userData.x0 ??= b.position.x) + EZ.o2(k) * R.n(4), (b.userData.y0 ??= b.position.y) + EZ.o2(k) * R.r(2.5, 6.5), (b.userData.z0 ??= b.position.z) + EZ.o2(k) * R.r(2, 7));
    b.rotation.set((b.userData.rx ??= b.rotation.x) + k * R.n(2.5), b.rotation.y, (b.userData.r0 ??= b.rotation.z) + k * R.n(3)); });
  smnCam(s2.cam, [[0, [5.6, 5.6, 21.0], [1.8, 7.4, -2.6], 50], [notp - 16.9, [4.2, 5.8, 19.0], [1.2, 7.4, -2.6], 50], [dur, [1.6, 6.2, 15.8], [0.2, 7.2, -2.6], 50]], lt, dur, { orbit: -0.05 });
  c3PersonPose(s2.owner, s2.cam, t, { expr: c3FaceAt([[0, 'whistling'], [notp, 'sly'], [bills, 'smug']], t, 'owner'), gaze: [-0.7, 0.2], head: [0.08, 0, 0],
    hand: { armL: [1.9, 1.0], armR: [-1.1, 4.0] }, bend: { armR: 1 } });
  smnNearDrift(s2.scene, lt, dur, '6'); c3Render(s2.scene, s2.cam, { bg: '#1a0c06', bgBlur: smnRack(lt, dur), nearBlur: 11, glow: 0.6, glowBlur: 16, bloom: 0.3 });
};

// ---- the yard: the garage from outside, storm clouds roll in (s14)
function smnSkyTex() { return SMN.sky ||= smnTex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5aa8e8'); g.addColorStop(0.7, '#bfe0f4'); g.addColorStop(1, '#ffe6c0'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 256); }
function smnStormTex() { return SMN.storm ||= smnTex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a2e3e'); g.addColorStop(0.7, '#4a4e5e'); g.addColorStop(1, '#6a6458'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 256); }
function smnBuildYard() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  const key = lights(scene, { keyP: [8, 18, 14], keyI: 1.0, rim: '#ffcf90', rimI: 0.5 });
  const M = { grass: smnMat('#5a9a3a', { rough: 0.9 }), drive: smnMat('#a8a090', { rough: 0.85 }), siding: smnMat('#e8d8b0', { rough: 0.7 }), trim: smnMat('#ffffff', { rough: 0.5 }), roof: smnMat('#6a3a2a', { rough: 0.7 }), door: smnMat('#f0ecdc', { rough: 0.5 }), dark: smnMat('#3a2a20', { rough: 0.5 }) };
  scene.add(pl(200, 200, M.grass, 0, -0.01, 0, 0, -Math.PI / 2)); scene.add(pl(10, 30, M.drive, 0, 0.01, 8, 0, -Math.PI / 2));
  const sun = pl(260, 130, new THREE.MeshBasicMaterial({ map: smnSkyTex(), toneMapped: false, depthWrite: false }), 0, 40, -80); scene.add(sun);
  const storm = pl(260, 130, new THREE.MeshBasicMaterial({ map: smnStormTex(), toneMapped: false, transparent: true, opacity: 0, depthWrite: false }), 0, 40, -79.5); scene.add(storm);
  // the house: siding, a roof, the garage door, a window, a mailbox, a tree
  const house = new THREE.Group(); scene.add(house);
  house.add(rb(26, 12, 10, M.siding, 0, 6, -7));
  // a gable roof that sits exactly on the walls: triangular prism (ridge along x) with a small overhang, plus fascia boards
  { const sh = new THREE.Shape(); sh.moveTo(-6.0, 0); sh.lineTo(6.0, 0); sh.lineTo(0, 5.2); sh.lineTo(-6.0, 0);   // in (z, y): 12 deep incl. 1 overhang each side
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 27.6, bevelEnabled: false }); geo.translate(0, 0, -13.8); geo.rotateY(Math.PI / 2);   // extrude along x
    const roof = c3Mesh(geo, M.roof, 0.05); roof.position.set(0, 12.0, -7); house.add(roof);
    for (const sz of [-1, 1]) { const f = rb(27.8, 0.35, 0.35, M.trim, 0, 12.05, -7 + sz * 6.0, 0.02); house.add(f); }
    const ridge = rb(27.8, 0.4, 0.5, M.dark, 0, 17.2, -7, 0.02); house.add(ridge);
    const chim = rb(1.8, 4.0, 1.8, smnMat('#9a4a32', { rough: 0.8 }), 8, 16.5, -9.5, 0.03); house.add(chim); }
  house.add(rb(10.4, 8.4, 0.5, M.trim, 0, 4.2, -1.9)); const door = rb(9.6, 7.8, 0.4, M.door, 0, 3.9, -1.7, 0.03); house.add(door);
  for (let k = 0; k < 4; k++) house.add(rb(9.6, 0.08, 0.1, M.dark, 0, 1.0 + k * 1.95, -1.45, 0));
  for (const wx of [-9.5, 9.5]) { house.add(rb(4, 3.6, 0.4, M.trim, wx, 6.5, -1.9)); house.add(pl(3.4, 3.0, c3Flat('#ffe6a8', { glow: '#ffcf70' }), wx, 6.5, -1.65)); house.add(rb(0.12, 3.0, 0.15, M.dark, wx, 6.5, -1.6, 0)); }
  const mail = new THREE.Group(); mail.add(rb(0.25, 3, 0.25, M.dark, 0, 1.5, 0)); mail.add(rb(1.0, 0.8, 1.6, smnMat('#3a6ac8', { rough: 0.3 }), 0, 3.3, 0)); mail.add(rb(0.1, 0.5, 0.3, smnMat('#d8321e'), 0.55, 3.6, 0.4, 0.01)); mail.position.set(6.8, 0, 7); scene.add(mail);
  const tree = new THREE.Group(); tree.add(cyl(0.6, 0.9, 7, smnMat('#6a4a2a', { rough: 0.8 }), 0, 3.5, 0, 0.03));
  for (let i = 0; i < 8; i++) { const R = RNG('tree', i), b = c3Mesh(new THREE.SphereGeometry(R.r(2.2, 3.2), 16, 12), smnMat('#4a8a3a', { rough: 0.7 }), 0.04); b.position.set(R.n(2.6), 8.5 + R.r(0, 3), R.n(2)); tree.add(b); }
  tree.position.set(-14, 0, 2); scene.add(tree);
  // storm clouds: fluffy cartoon cumulus — a flat-bottomed dome of many overlapping toon spheres, light tops, dark undersides,
  // ink-outlined; their rim lights up white on the lightning flash
  const cloudTop = c3Toon('#a8aec2', { emissive: '#fff4c8', ei: 0 }), cloudMid = c3Toon('#7e849a', { emissive: '#fff4c8', ei: 0 }), cloudBot = c3Toon('#4a4e64');
  const clouds = []; for (let i = 0; i < 8; i++) { const R = RNG('cloud', i), c = new THREE.Group(), wdt = R.r(14, 20);
    for (let k = 0; k < 16; k++) { const u = k / 15, x = (u - 0.5) * wdt, dome = Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2)), r = R.r(2.2, 3.4) * (0.75 + 0.5 * dome);
      const y = dome * R.r(2.5, 4.5), sp = c3Mesh(new THREE.SphereGeometry(r, 18, 14), y > 2.2 ? cloudTop : cloudMid, 0.07); sp.position.set(x + R.n(0.8), y, R.n(1.5)); c.add(sp); }
    for (let k = 0; k < 7; k++) { const sp = c3Mesh(new THREE.SphereGeometry(R.r(2.4, 3.0), 16, 10), cloudBot, 0.07); sp.scale.set(1.3, 0.55, 1); sp.position.set((k / 6 - 0.5) * wdt * 0.9, -0.6, R.n(1)); c.add(sp); }
    c.userData = { side: i % 2 ? 1 : -1, y: 21 + R.r(0, 12), z: -24 - R.r(0, 22), x1: R.n(16) }; clouds.push(c); scene.add(c); }
  const cloudMats = [cloudTop, cloudMid];
  const bolt = new THREE.Mesh(new THREE.PlaneGeometry(4, 18), c3Flat('#ffffff', { map: smnTex((x, w, h) => { x.strokeStyle = '#fff8c0'; x.lineWidth = 16; x.lineJoin = 'miter'; x.beginPath(); x.moveTo(w * 0.6, 0); x.lineTo(w * 0.35, h * 0.4); x.lineTo(w * 0.62, h * 0.45); x.lineTo(w * 0.3, h); x.stroke(); }, 128, 512), transparent: true, glow: '#fff4a0' }));
  bolt.position.set(9, 24, -30); bolt.visible = false; scene.add(bolt);
  const focus = new THREE.Group(); scene.add(focus);
  const ron = smnPerson({ key: 'ron', outfit: 'mustard', hairStyle: 'brown', fx: ['mustache', 'glasses'] }, -1.6, 4.6); focus.add(ron.g);
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#cfe6ff', mid: '#9a9a8a' }); c3Shadows(scene, key, 24);
  // foreground (blurred): picket fence posts and a tuft of grass near the lens
  const fence = new THREE.Group(); for (let k = 0; k < 4; k++) { fence.add(rb(0.5, 3.4, 0.25, M.trim, k * 1.3, 1.7, 0, 0.03)); } fence.add(rb(5.0, 0.3, 0.2, M.trim, 1.9, 2.4, 0.1, 0.02)); fence.position.set(-10, 0, 13); fence.rotation.y = 0.3; smnNear(scene, fence);
  const tuft = new THREE.Group(); for (let k = 0; k < 9; k++) { const b = c3Mesh(new THREE.ConeGeometry(0.25, 2.2, 6), smnMat('#3a7a2a', { rough: 0.8 }), 0.02); b.position.set(k * 0.3 - 1.2, 1.1, 0); b.rotation.z = (k - 4) * 0.12; tuft.add(b); } tuft.position.set(6.5, 0, 14.5); smnNear(scene, tuft);
  return { scene, cam, ron, clouds, cloudMats, storm, bolt, key, sun };
}
SHOT_FN['s14'] = (t, u, lt) => {
  const y = SMN.yard ||= smnBuildYard();
  const wrong = smnW('wrong', 1, 19.62), ifT = smnW('If', 1, 18.88);
  const dark = EZ.io(clamp((t - ifT + 0.1) / 0.9));
  y.storm.material.opacity = dark;
  y.clouds.forEach((c, i) => { const d = c.userData, k = EZ.o3(clamp((t - ifT + 0.2 + i * 0.05) / 1.1)); c.position.set(lerp(d.side * 70, d.x1, k), d.y, d.z); });
  const flash = t >= wrong ? Math.exp(-(t - wrong) * 9) : 0;
  y.bolt.visible = flash > 0.15; y.key.intensity = lerp(1.0, 0.45, dark) + flash * 1.6; y.cloudMats.forEach((m) => { m.emissiveIntensity = flash * 0.8; });
  const dur = smnDur('s14');   // a crane down + push in on Ron while the sky closes over the house, tilting up toward the storm
  smnCam(y.cam, [[0, [-6.0, 7.0, 44.0], [-1.0, 10.4, -4.0], 50], [ifT - 18.88 + 0.05, [-5.4, 6.6, 42.0], [-1.0, 10.8, -4.0], 50], [dur, [-3.4, 5.6, 37.0], [-0.6, 11.6, -4.0], 50]], lt, dur, { orbit: 0.05 });   // Ron small under the house, the storm filling the sky
  c3PersonPose(y.ron, y.cam, t, { expr: c3FaceAt([[0, 'neutral'], [ifT + 0.1, 'worried'], [wrong, 'scared']], t, 'ron'), gaze: [0.3, -1], head: [0.05, 0, 0.05],
    hand: { armL: [1.4, 0.4], armR: [-1.4, 0.4] }, x: t >= wrong ? ['sweat'] : [] });
  smnNearDrift(y.scene, lt, dur, '7'); c3Render(y.scene, y.cam, { bg: '#2a2e3e', bgBlur: smnRack(lt, dur, 1.2, 3.2), nearBlur: 11, glow: 0.55 + flash, glowBlur: 16, bloom: 0.3 + flash * 0.3 });
};
