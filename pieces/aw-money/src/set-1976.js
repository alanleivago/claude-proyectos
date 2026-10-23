// =====================================================================
//  SET 1976 — kitchen/garage 1976: s01 s02 s07 s08 s09 s10 s16. Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js).
//  One dressed kitchen (copied from scenes.js buildKitchen and extended), the cast as c3Person billboards at 1.35x,
//  and per-shot fact objects: the wall calendar (s01), a flip counter "AGE 41" (s08), a cherry pie (s10).
//  Units: head radius = 1. Table top at y 3.55, back wall z -7.
// =====================================================================
const S76 = {};
const S76_FN = SHOT_FN;               // shots.js loads first
const S76_K = 1.35;                  // people are big next to the set (refs)
const S76_F = 1.3;                   // the table, chairs and everything on them, scaled to the 1.35x people
const S76_SEAT = 2.45 * S76_F, S76_STAND = 3.58;
const S76_TOP = 3.55 * S76_F;        // table top
const s76V = (x, y, z) => new THREE.Vector3(x, y, z);
// a fully dynamic camera (tutorial + refs): the shot's knots, plus a constant creep along the view, a slow orbit
// around the target, and a push that accelerates through the last 0.35 s into the next shot (it keeps going in the dissolve)
function s76Cam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), i = SHOT_LIST.findIndex((r) => r[0] === id), [a, b] = shotSpan(i), dur = b - a;
  const P = s76V(...c.p), L = s76V(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(s76V(0, 1, 0), (o.orbit ?? 0.035) * lt);   // slow orbit around the target
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.push ?? 0.09) * tail * tail;
  const Pn = L.clone().add(off).add(d.clone().multiplyScalar(dist * push));
  return { p: Pn.toArray(), l: c.l, fov: c.fov };
}

// ---- textures
function s76TexPie() {
  const t = tex((x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.5); g.addColorStop(0, '#c41e2a'); g.addColorStop(1, '#8a1018');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('cherry'); for (let i = 0; i < 40; i++) { const px = R.r(0, w), py = R.r(0, h), r = R.r(10, 18); x.beginPath(); x.arc(px, py, r, 0, TAU); x.fillStyle = '#e0283a'; x.fill(); x.fillStyle = 'rgba(255,255,255,0.55)'; x.beginPath(); x.arc(px - r * 0.35, py - r * 0.35, r * 0.25, 0, TAU); x.fill(); }
    for (const [c, lw] of [['#7a3a12', 30], ['#e8a050', 22]]) {   // a wide lattice with a dark edge
      x.strokeStyle = c; x.lineWidth = lw;
      for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(w / 2 + i * w / 5, 0); x.lineTo(w / 2 + i * w / 5, h); x.stroke(); x.beginPath(); x.moveTo(0, h / 2 + i * h / 5); x.lineTo(w, h / 2 + i * h / 5); x.stroke(); }
    }
  }, 512, 512);
  return t;
}
function s76TexFlag(txt) { return tex((x, w, h) => { x.fillStyle = '#fbf3e0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3b2417'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10); inked(x, txt, w / 2, h / 2 + 4, h * 0.62, '#c8321e', { stroke: false }); }, 256, 128); }
function s76TexPocket() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.beginPath(); x.moveTo(w * 0.1, h * 0.05); x.lineTo(w * 0.9, h * 0.05); x.quadraticCurveTo(w * 0.95, h * 0.75, w * 0.5, h * 0.95); x.quadraticCurveTo(w * 0.05, h * 0.75, w * 0.1, h * 0.05); x.closePath();
  x.fillStyle = '#f4efe6'; x.fill(); x.lineWidth = 10; x.strokeStyle = '#3b2417'; x.stroke(); x.lineWidth = 4; x.beginPath(); x.moveTo(w * 0.3, h * 0.3); x.lineTo(w * 0.55, h * 0.6); x.stroke(); }, 128, 128); }
function s76TexWing() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.45, h * 0.32, 0.4, 0, TAU); x.fillStyle = '#a89a8a'; x.fill(); x.lineWidth = 8; x.strokeStyle = '#3b2417'; x.stroke();
  x.fillStyle = '#7a6a5a'; x.beginPath(); x.arc(w * 0.6, h * 0.45, w * 0.08, 0, TAU); x.fill(); }, 128, 128); }
// the flip counter's face: "AGE" and two digit cards that roll (v may be fractional)
function s76DrawCounter(c, v) {
  const x = c.getContext('2d'), w = c.width, h = c.height;
  x.fillStyle = '#2a1a12'; x.fillRect(0, 0, w, h);
  inked(x, 'AGE', w * 0.2, h * 0.5, h * 0.28, '#f2c230', { stroke: false });
  const col = (cx, val) => {   // a digit window rolling from floor(val) to floor(val)+1
    const d0 = Math.floor(val) % 10, fr = val - Math.floor(val), cw = w * 0.22, ch = h * 0.78, y0 = (h - ch) / 2;
    x.save(); x.beginPath(); x.rect(cx - cw / 2, y0, cw, ch); x.clip();
    x.fillStyle = '#f6efe0'; x.fillRect(cx - cw / 2, y0, cw, ch);
    x.font = `900 ${ch * 0.82}px ${C3.sub}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#2a1a12';
    x.fillText(String(d0), cx, y0 + ch / 2 - fr * ch); x.fillText(String((d0 + 1) % 10), cx, y0 + ch / 2 + ch - fr * ch);
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(cx - cw / 2, y0 + ch / 2 - 2, cw, 4);
    x.restore(); x.strokeStyle = '#c8a050'; x.lineWidth = 8; x.strokeRect(cx - cw / 2, y0, cw, ch);
  };
  const ones = v % 10, tens = Math.floor(v / 10) + (ones > 9 ? ones - 9 : 0);
  col(w * 0.55, tens); col(w * 0.8, ones);
}

// ---- the set
function s76Build() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
  const key = lights(scene, { keyP: [4, 13, 14], keyI: 0.75, ambI: 0.16, rimI: 0.5 });
  scene.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.22; });   // less flat fill: the corners fall off
  const sun = new THREE.PointLight('#ffb060', 1.5, 22, 1.8); sun.position.set(6, 9, -4.5); sun.layers.enableAll(); scene.add(sun);   // through the window
  const M = { wood: c3Prop('#ffffff', { map: texWood(), rough: 0.45 }), vinyl: c3Prop('#c8561a', { rough: 0.35 }), chrome: c3Chrome(),
    fridge: c3Prop('#7a8a34', { rough: 0.3 }), cab: c3Prop('#c8a888', { map: texWood(), rough: 0.5 }), counter: c3Prop('#d8a848', { rough: 0.3 }) };
  // the room's big surfaces are toned down (their maps are bright): the refs' rooms sit in mid tones with dark corners
  scene.add(pl(60, 60, c3Prop('#b8987a', { map: texLino(), rough: 0.6 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(pl(40, 10, c3Prop('#b88e6a', { map: texWallpaper(), rough: 0.8 }), 0, 10.5, -7));
  scene.add(pl(40, 5.5, c3Prop('#a08060', { map: texPanel(), rough: 0.6 }), 0, 2.75, -6.98));
  scene.add(rb(40, 0.3, 0.3, M.cab, 0, 5.5, -6.85, 0.02));
  scene.add(pl(16, 16, c3Prop('#9a7656', { map: texWallpaper(), rough: 0.8 }), -13, 8, 0, Math.PI / 2));
  scene.add(pl(16, 16, c3Prop('#9a7656', { map: texWallpaper(), rough: 0.8 }), 13, 8, 0, -Math.PI / 2));
  scene.add(pl(40, 30, c3Prop('#6a5440', { rough: 0.9 }), 0, 15.5, 0, 0, Math.PI / 2));   // ceiling, in shadow
  // window with blinds
  scene.add(rb(5.4, 4.6, 0.4, c3Prop('#f4ecd8', { rough: 0.4 }), 6, 9.0, -6.9, 0.03));
  scene.add(pl(4.8, 4.0, c3Flat('#ffffff', { map: texBlinds(), glow: '#ffcf80' }), 6, 9.0, -6.65));
  // fridge, cabinets, counter, props
  scene.add(rb(3.2, 8.4, 2.8, M.fridge, -9.5, 4.2, -5.4)); scene.add(rb(0.18, 2.2, 0.3, M.chrome, -8.3, 6.0, -3.9, 0.015));
  scene.add(rb(6, 3.6, 2.4, M.cab, -4.6, 1.8, -5.7)); scene.add(rb(6.2, 0.3, 2.6, M.counter, -4.6, 3.75, -5.6, 0.02));
  scene.add(rb(6, 2.6, 1.4, M.cab, -4.6, 11.5, -6.2));
  scene.add(rb(1.4, 1.0, 1.0, M.chrome, -6.4, 4.4, -5.6)); scene.add(rb(1.0, 1.6, 1.0, c3Prop('#c8321e', { rough: 0.3 }), -3.2, 4.7, -5.6));
  scene.add(mug('#f0c040', -5.0, 3.9, -5.2)); scene.add(mug('#4a8ac8', -4.3, 3.9, -5.6));
  const plant = new THREE.Group(); plant.add(cyl(0.5, 0.38, 0.8, c3Prop('#c86a2a', { rough: 0.6 }), 0, 0.4, 0));
  for (let i = 0; i < 7; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.45, 10, 8), c3Prop('#4a8a3a', { rough: 0.6 }), 0.02); lf.position.set(Math.cos(i) * 0.45, 1.1 + (i % 3) * 0.25, Math.sin(i) * 0.45); lf.scale.set(0.6, 1.3, 0.35); lf.rotation.z = Math.cos(i) * 0.6; plant.add(lf); }
  plant.position.set(9.0, 6.0, -6.4); scene.add(plant); scene.add(rb(4.4, 0.25, 0.9, M.cab, 8.2, 5.95, -6.5, 0.02));
  const phone = new THREE.Group(); phone.add(rb(1.1, 1.5, 0.6, c3Prop('#e06a1e', { rough: 0.3 }), 0, 0, 0)); phone.add(cyl(0.38, 0.38, 0.1, c3Prop('#f6e8d0', { rough: 0.3 }), 0, -0.1, 0.33, 0.015).rotateX(Math.PI / 2));
  phone.position.set(-1.6, 8.6, -6.6); scene.add(phone);
  // the wall calendar: APRIL 1976 under a MARCH page that tears away on "1976" (s01)
  const calG = new THREE.Group(); calG.position.set(2.2, 9.3, -6.92); scene.add(calG);
  calG.add(rb(2.3, 2.85, 0.08, c3Prop('#5a3a22', { rough: 0.5 }), 0, 0, -0.05, 0.02));
  calG.add(pl(2.1, 2.62, c3Prop('#ffffff', { map: texCalendar('APRIL', '1976'), rough: 0.7 }), 0, -0.02, 0.01));
  const pagePivot = new THREE.Group(); pagePivot.position.set(0, 1.29, 0.03); calG.add(pagePivot);
  const page = pl(2.1, 2.62, c3Prop('#ffffff', { map: texCalendar('MARCH', '1976'), rough: 0.7, side: THREE.DoubleSide }), 0, -1.31, 0); pagePivot.add(page);
  calG.add(cyl(0.09, 0.09, 0.12, c3Prop('#c8321e', { rough: 0.3 }), 0, 1.36, 0.06, 0.01).rotateX(Math.PI / 2));
  // pendant lamp over the table
  const lamp = new THREE.Group(); lamp.add(cyl(0.04, 0.04, 6, c3Flat('#3a2a20'), 0, 3, 0, 0, 6)); lamp.add(c3Mesh(new THREE.ConeGeometry(1.6, 1.4, 28, 1, true), c3Prop('#e8781e', { rough: 0.35 }), 0.03));
  lamp.children[1].material.side = THREE.DoubleSide; lamp.add(c3Mesh(new THREE.SphereGeometry(0.45, 14, 10), c3Flat('#fff4d0', { glow: '#ffd080' })));
  lamp.children[2].position.y = -0.5; lamp.position.set(0, 12.6, -1.2); scene.add(lamp);
  const bulb = new THREE.PointLight('#ffd8a0', 1.0, 20, 1.6); bulb.position.set(0, 11.6, -1.2); bulb.layers.enableAll(); scene.add(bulb);
  // the table and what is on it
  const focus = new THREE.Group(); scene.add(focus); focus.scale.setScalar(S76_F);   // everything in it is scaled to the people
  focus.add(cyl(3.4, 3.4, 0.3, M.wood, 0, 3.4, -1.2, 0.04, 48)); focus.add(cyl(0.35, 0.5, 3.2, M.chrome, 0, 1.7, -1.2, 0.02)); focus.add(cyl(1.4, 1.5, 0.2, M.chrome, 0, 0.1, -1.2, 0.02));
  const paper = pl(1.6, 2.2, c3Prop('#ffffff', { map: texContract(), rough: 0.8 }), -0.55, 3.57, -3.5, 0, -Math.PI / 2); paper.rotation.z = 0.25; focus.add(paper);   // under Ron's pen (he sits behind the table edge)
  focus.add(pl(1.3, 1.7, c3Prop('#f6f1e4', { rough: 0.8 }), -2.2, 3.565, -0.4, 0, -Math.PI / 2)); focus.add(pl(1.3, 1.7, c3Prop('#f6f1e4', { rough: 0.8 }), 2.2, 3.565, -0.9, 0, -Math.PI / 2));
  const mugs = [mug('#c8321e', -2.5, 3.55, -2.0), mug('#f4ecd8', 2.4, 3.55, -2.3)]; mugs.forEach((m) => focus.add(m));
  const board = new THREE.Group(); board.add(rb(1.6, 0.06, 1.1, c3Prop('#2a7a4a', { rough: 0.4 }), 0, 0, 0, 0.015));
  for (let i = 0; i < 6; i++) board.add(rb(0.35, 0.08, 0.16, c3Prop('#1a1a1a', { rough: 0.4 }), -0.45 + (i % 3) * 0.45, 0.06, -0.22 + Math.floor(i / 3) * 0.45, 0));
  board.position.set(1.6, 3.6, -0.6); focus.add(board);
  const chairs = [chair(0, -4.85, 0, M), chair(-3.7, -3.55, 0.6, M), chair(3.7, -3.55, -0.6, M)]; chairs.forEach((c) => focus.add(c));
  // dark foreground silhouettes that ride with the camera (blurred in the near pass): a hanging plant and a chair back
  const fg = new THREE.Group(), dark = c3Prop('#2a160c', { rough: 0.6 });
  const pot = new THREE.Group(); pot.add(cyl(0.7, 0.5, 1.0, c3Prop('#5a2a10', { rough: 0.5 }), 0, 0, 0, 0.03));
  for (let i = 0; i < 9; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.55, 10, 8), c3Prop('#1e3a14', { rough: 0.6 }), 0.02); lf.position.set(Math.cos(i * 0.9) * 0.9, -0.3 - (i % 4) * 0.55, Math.sin(i * 0.9) * 0.4); lf.scale.set(0.5, 1.6, 0.3); lf.rotation.z = Math.cos(i) * 0.7; pot.add(lf); }
  pot.add(cyl(0.03, 0.03, 4, c3Flat('#2a1a10'), 0, 2.4, 0, 0, 6)); fg.add(pot);
  const cback = rb(2.4, 3.2, 0.3, dark, 0, 0, 0, 0.04); fg.add(cback);
  c3Layer(fg, C3.L_NEAR); scene.add(cam); cam.add(fg);
  // the cherry pie (s10): 90 % and the 10 % slice that slides to Ron. Extruded sectors so the cut faces are closed.
  const pieTop = s76TexPie(); pieTop.wrapS = pieTop.wrapT = THREE.RepeatWrapping; pieTop.repeat.set(1 / 3.2, 1 / 3.2); pieTop.offset.set(0.5, 0.5);
  const sector = (a0, a1) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.absarc(0, 0, 1.45, a0, a1, false); sh.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.38, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 40 });
    g.rotateX(-Math.PI / 2); return c3Mesh(g, [c3Prop('#ffffff', { map: pieTop, rough: 0.35 }), c3Prop('#e0a050', { rough: 0.5 })], 0.035); };
  // shape space: angle a in the XY plane -> after rotateX(-90) it lies in XZ with z = -y; Ron sits toward -z => a = +90 deg
  const pie = new THREE.Group(); pie.position.set(0, 3.62, 0.6); focus.add(pie);
  pie.add(cyl(1.62, 1.5, 0.12, c3Chrome(), 0, -0.02, 0, 0.02, 40));   // the tin plate
  pie.add(sector(Math.PI / 2 + 0.314, Math.PI / 2 + TAU - 0.314));
  const slice = new THREE.Group(); slice.add(sector(Math.PI / 2 - 0.314, Math.PI / 2 + 0.314)); pie.add(slice);
  const pick = new THREE.Group(); pick.add(cyl(0.03, 0.03, 1.0, c3Prop('#e8d8b0', { rough: 0.5 }), 0, 0.5, 0, 0.01, 6));
  pick.add(pl(0.7, 0.35, c3Prop('#ffffff', { map: s76TexFlag('10%'), rough: 0.6, side: THREE.DoubleSide }), 0.37, 0.82, 0)); pick.position.set(0, 0.4, -0.9); slice.add(pick);
  // the flip counter "AGE 41" (s08), on a little stand
  const cntCv = document.createElement('canvas'); cntCv.width = 512; cntCv.height = 256; s76DrawCounter(cntCv, 0);
  const cntTex = new THREE.CanvasTexture(cntCv); cntTex.encoding = THREE.sRGBEncoding;
  const counter = new THREE.Group(); counter.add(rb(2.6, 1.4, 0.8, c3Prop('#5a2a14', { rough: 0.35 }), 0, 0, 0, 0.035));
  counter.add(pl(2.35, 1.17, c3Flat('#ffffff', { map: cntTex }), 0, 0, 0.42)); counter.add(cyl(0.12, 0.12, 5.4, c3Chrome(), 0, -3.4, 0, 0.02, 10)); counter.add(cyl(0.8, 0.9, 0.15, c3Chrome(), 0, -6.0, 0, 0.02, 24));
  counter.position.set(2.5, 6.05, 3.4); counter.visible = false; scene.add(counter);
  // a crumpled paper ball (s09) and the moth (s16)
  const ballG = new THREE.IcosahedronGeometry(0.3, 2); { const p = ballG.attributes.position, R = RNG('ball'); for (let i = 0; i < p.count; i++) { const k = 1 + R.n(0.18); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); } ballG.computeVertexNormals(); }
  const ball = c3Mesh(ballG, c3Prop('#f6f1e4', { rough: 0.7 }), 0.03); ball.visible = false; scene.add(ball);
  const moth = new THREE.Group(); const wingT = s76TexWing(), wmat = c3Flat('#ffffff', { map: wingT, transparent: true, side: THREE.DoubleSide });
  moth.add(c3Mesh(new THREE.SphereGeometry(0.12, 10, 8).scale(1, 2.2, 1), c3Prop('#6a5a4a', { rough: 0.6 }), 0.015));
  const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.55), wmat), wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.55), wmat);
  const wl = new THREE.Group(), wr = new THREE.Group(); wingL.position.x = -0.36; wingR.position.x = 0.36; wingR.scale.x = -1; wl.add(wingL); wr.add(wingR); moth.add(wl, wr);
  moth.scale.setScalar(2.6); moth.visible = false; scene.add(moth);
  // the cast at 1.35x; their pen, briefcase and pockets ride on their billboards
  const ron = c3Person({ key: 'ron', outfit: 'mustard', hairStyle: 'brown', fx: ['mustache', 'glasses'] });
  const jobs = c3Person({ key: 'jobs', outfit: 'white', hairStyle: 'long', fx: ['beard', 'mustache'] });
  const woz = c3Person({ key: 'woz', outfit: 'plaid', hairStyle: 'ref', fx: ['beard', 'mustache', 'glasses'] });
  [ron, jobs, woz].forEach((c) => { c.g.scale.setScalar(S76_K); scene.add(c.g); });
  const pen = cyl(0.08, 0.08, 1.3, c3Prop('#1a2a6a', { rough: 0.3 }), 0, 0, 0.06, 0.015, 8); ron.root.add(pen); pen.renderOrder = 6;
  const brief = new THREE.Group(); brief.add(rb(1.5, 1.05, 0.35, c3Prop('#6a3a1a', { rough: 0.35 }), 0, -0.6, 0, 0.03));
  brief.add(c3Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 16, Math.PI), c3Prop('#3a1a0a', { rough: 0.4 }), 0.012));
  brief.add(rb(0.22, 0.12, 0.05, c3Chrome(), -0.4, -0.15, 0.2, 0.01)); brief.add(rb(0.22, 0.12, 0.05, c3Chrome(), 0.4, -0.15, 0.2, 0.01));
  brief.scale.setScalar(1.7); ron.root.add(brief); brief.traverse((m) => { m.renderOrder = 6; });   // big enough to read
  const pocketT = s76TexPocket(), pockets = [];
  for (const c of [jobs, woz]) for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: pocketT, transparent: true, toneMapped: false }));
    m.position.set(sx * (c.bodyW * 0.5 + 0.12), 0.75, 0.04); m.renderOrder = 6; m.visible = false; c.root.add(m); pockets.push({ m, c, sx }); }
  [focus, ron.g, jobs.g, woz.g, counter, ball, moth].forEach((o) => c3Layer(o, C3.L_FOCUS));
  c3Env(scene, { top: '#ffe2b8', mid: '#b07048' }); c3Shadows(scene, key, 18);
  return { scene, cam, ron, jobs, woz, pen, brief, pockets, pagePivot, page, counter, cntCv, cntTex, ball, moth, wl, wr, slice, pick, pie, paper, mugs, pot, cback };
}
const s76 = () => S76.set ||= s76Build();

// place everyone for a shot: [x, z, 'seat'|'stand'] or null to hide
function s76Place(k, where) {
  for (const n of ['ron', 'jobs', 'woz']) {
    const w = where[n], p = k[n]; p.g.visible = !!w;
    if (w) p.g.position.set(w[0], w[2] === 'stand' ? S76_STAND : S76_SEAT, w[1]);
  }
  k.pen.visible = false; k.brief.visible = false; k.counter.visible = false; k.ball.visible = false; k.moth.visible = false;
  k.pockets.forEach((q) => { q.m.visible = false; }); k.pie.visible = false;
  k.pot.visible = false; k.cback.visible = false;
}
// a foreground silhouette in camera space ([x, y, z] in front of the lens), blurred by the near pass
function s76Fg(k, which, at, rz = 0) { const o = k[which]; o.visible = true; o.position.set(...at); o.rotation.set(0, 0, rz); }
const S76_SIT = { foot: { legL: [0.75, -2.25], legR: [-0.75, -2.25] } };
const S76_FEET = { legL: [0.55, -2.6], legR: [-0.55, -2.6] };
// render: rack focus (background blur animated per shot) and a blurred foreground; the colour look is applied by shots.js
const s76Render = (k, o = {}) => c3Render(k.scene, k.cam, { bg: '#2a1408', bgBlur: o.bgBlur ?? 2.6, nearBlur: o.nearBlur ?? 9, glow: 0.55, glowBlur: 16, bloom: 0.3, grade: 'saturate(1.2) contrast(1.1)' });

// ---- shot layout (furniture scaled by S76_F): Ron's chair behind the table, the Steves at its sides
// every seated billboard sits BEHIND the round table (world centre z -1.56, radius 4.42): the top only hides their lower body
const S76_AT = { ron: [0, -6.3, 'seat'], jobs: [-4.8, -4.6, 'seat'], woz: [4.8, -4.6, 'seat'] };
const S76_HAND = 1.12;   // a seated person's hand resting on the table top (billboard-local y)

// ---- s01: the wall calendar; the MARCH page tears off and APRIL 1976 lands on "1976"; the camera pulls back into the kitchen
S76_FN['s01'] = (t, u, lt) => {
  const k = s76(); s76Place(k, {});
  const land = (wordT('1976') ?? 0.46), tear = land - 0.3, f = clamp((t - tear) / 0.5);
  k.pagePivot.rotation.set(-EZ.i2(f) * 1.9, 0, EZ.i2(f) * 0.5); k.page.position.y = -1.31 - EZ.i3(f) * 3.0; k.pagePivot.visible = f < 1;
  c3SetCam(k.cam, s76Cam([[0, [2.0, 9.2, -0.4], [2.2, 9.25, -6.9], 40], [0.75, [2.0, 9.1, 0.6], [2.1, 9.1, -6.9], 42], [1.6, [1.4, 8.8, 13.5], [0.8, 7.2, -3.5], 48]], lt, 's01', { orbit: 0.02 }));
  s76Render(k, { bgBlur: lerp(0.4, 2.2, EZ.io(seg(lt, 0.6, 1.4))) });
};

// ---- s02: Ron signs the partnership between the two Steves; proud on "starts"
S76_FN['s02'] = (t, u, lt) => {
  const k = s76(); s76Place(k, S76_AT); k.pen.visible = true;
  s76Fg(k, 'cback', [-1.35, -2.45, -5.0], 0.15);
  c3SetCam(k.cam, s76Cam([[0, [1.4, 8.7, 19.8], [0.0, 7.3, -2.2], 50], [1.4, [0.8, 8.5, 18.4], [0.0, 7.3, -2.2], 50], [2.4, [0.2, 8.4, 16.4], [0.0, 7.4, -2.2], 50]], lt, 's02'));
  const sign = wordT('signed') ?? 2.06, starts = wordT('starts') ?? 2.92;
  const wr = t < starts - 0.15 ? Math.sin(t * 24) * 0.08 : 0, back = c3Hold([[0, 0], [starts, 1]], t, 5 / 30);
  // the writing hand stays above the table top and toward the camera side, so the pen reads
  const hand = [lerp(-0.45 + wr, -1.4, back), lerp(S76_HAND + 0.3 + Math.abs(wr) * 0.4, 1.6, back)];
  k.pen.position.set(hand[0] + 0.05, hand[1] + 0.3, 0.06); k.pen.rotation.set(0, 0, lerp(-0.5, 0.4, back));
  c3PersonPose(k.ron, k.cam, t, { expr: c3FaceAt([[0, 'determined'], [starts, 'proud']], t, 'ron'), gaze: [-0.2 * (1 - back), 0.8 * (1 - back)], head: [0.04 * (1 - back), 0, -0.1 * (1 - back)],
    hand: { armR: hand, armL: [1.35, S76_HAND] }, ...S76_SIT });
  c3PersonPose(k.jobs, k.cam, t, { expr: c3FaceAt([[0, 'excited'], [sign, 'grin']], t, 'jobs'), gaze: [0.8, 0.3], head: [-0.06, 0, 0], hand: { armR: [-1.25, 2.5], armL: [1.35, S76_HAND] }, ...S76_SIT });
  c3PersonPose(k.woz, k.cam, t, { expr: c3FaceAt([[0, 'happy'], [starts, 'laugh']], t, 'woz'), gaze: [-0.8, 0.3], head: [0.06, 0, 0], hand: { armL: [1.25, 2.5], armR: [-1.35, S76_HAND] }, ...S76_SIT });
  s76Render(k, { bgBlur: lerp(1.6, 3.2, u) });
};

// ---- s07: "Your partners are two guys named Steve" — Jobs and Woz step in from the sides
S76_FN['s07'] = (t, u, lt) => {
  const k = s76(), tJ = (wordT('partners') ?? 8.14) + 0.1, tW = (wordT('steve') ?? 9.32) - 0.25;
  const walk = (t0, from, to) => { const v = EZ.o3(clamp((t - (t0 - 0.55)) / 0.55)); return [lerp(from, to, v), v]; };
  const [jx, jv] = walk(tJ, -9.0, -2.1), [wx, wv] = walk(tW, 9.0, 2.1);
  s76Place(k, { ron: S76_AT.ron, jobs: [jx, 3.0, 'stand'], woz: [wx, 3.0, 'stand'] });
  s76Fg(k, 'pot', [1.55, 2.75, -4.6]); k.pot.scale.setScalar(0.65);
  c3SetCam(k.cam, s76Cam([[0, [-0.6, 8.8, 22.4], [0, 7.9, 2.0], 50], [1.2, [0, 8.7, 21.2], [0, 7.9, 2.0], 50], [1.9, [0.5, 8.7, 19.8], [0.2, 8.0, 2.0], 50]], lt, 's07', { orbit: 0.05 }));
  // brisk walk while moving: a step every 5-6 frames, the body bobs ~7 % of a head
  const stepper = (v, ph) => (f) => (v > 0 && v < 1 ? 0.18 * Math.abs(Math.sin((f * FPS) * Math.PI / 5.5 + ph)) : 0);
  const feet = (v, ph) => { if (!(v > 0 && v < 1)) return S76_FEET; const s = Math.sin(t * FPS * Math.PI / 5.5 + ph) * 0.5; return { legL: [0.55 + s, -2.6 + Math.max(0, s) * 0.4], legR: [-0.55 + s, -2.6 + Math.max(0, -s) * 0.4] }; };
  c3PersonPose(k.ron, k.cam, t, { expr: c3FaceAt([[0, 'neutral'], [tW, 'surprised']], t, 'ron'), gaze: [0, 0.2], hand: { armR: [-1.3, S76_HAND], armL: [1.3, S76_HAND] }, ...S76_SIT });
  // waves stay inside the frame: the hand rises above the shoulder, not out to the side
  c3PersonPose(k.jobs, k.cam, t, { expr: c3FaceAt([[0, 'excited'], [tJ, 'grin']], t, 'jobs'), gaze: [0.6, 0], lift: stepper(jv, 0), foot: feet(jv, 0), hand: { armL: [1.4, 0.6], armR: c3Hold([[0, [-1.3, 0.4]], [tJ, [-1.25, 3.3]]], t) } });
  c3PersonPose(k.woz, k.cam, t, { expr: c3FaceAt([[0, 'happy'], [tW + 0.25, 'laugh']], t, 'woz'), gaze: [-0.6, 0], lift: stepper(wv, 1.3), foot: feet(wv, 1.3), hand: { armR: [-1.4, 0.6], armL: c3Hold([[0, [1.3, 0.4]], [tW + 0.25, [1.25, 3.3]]], t) } });
  s76Render(k, { bgBlur: lerp(2.0, 3.2, u) });
};

// ---- s08: "and at 41" — Ron, tie and briefcase; the flip counter rolls to 41 on "41"
S76_FN['s08'] = (t, u, lt) => {
  const k = s76(); s76Place(k, { ron: [-0.6, 3.0, 'stand'], jobs: S76_AT.jobs, woz: S76_AT.woz });
  k.brief.visible = true; k.counter.visible = true;
  const land = wordT('41') ?? 10.1, v = 41 * EZ.o3(clamp((t - 9.86) / (land - 9.86)));
  s76DrawCounter(k.cntCv, t >= land ? 41 : v); k.cntTex.needsUpdate = true;
  c3SetCam(k.cam, s76Cam([[0, [1.2, 8.4, 17.2], [0.5, 7.8, 3.0], 50], [0.5, [0.8, 8.5, 16.2], [0.5, 7.9, 3.0], 50], [0.9, [0.4, 8.6, 14.8], [0.4, 8.0, 3.0], 50]], lt, 's08', { orbit: -0.06 }));
  const hb = [-1.35, 0.35]; k.brief.position.set(hb[0], hb[1], 0.08);
  c3PersonPose(k.ron, k.cam, t, { expr: c3FaceAt([[0, 'neutral'], [land, 'proud']], t, 'ron'), gaze: [0.6, 0], hand: { armR: hb, armL: [1.25, 2.0] }, foot: S76_FEET,
    lift: (w) => 0.1 * (w > land ? Math.exp(-(w - land) * 9) : 0) });
  c3PersonPose(k.jobs, k.cam, t, { expr: 'happy', hand: { armR: [-1.35, S76_HAND], armL: [1.35, S76_HAND] }, ...S76_SIT });
  c3PersonPose(k.woz, k.cam, t, { expr: 'smile', hand: { armR: [-1.35, S76_HAND], armL: [1.35, S76_HAND] }, ...S76_SIT });
  s76Render(k, { bgBlur: lerp(2.4, 3.4, u) });
};

// ---- s09: "you're the only adult in the room" — the Steves toss a paper ball and laugh; Ron unimpressed
S76_FN['s09'] = (t, u, lt) => {
  const k = s76(); s76Place(k, S76_AT); k.ball.visible = true;
  s76Fg(k, 'pot', [1.55, 2.8, -4.6]); k.pot.scale.setScalar(0.65);
  c3SetCam(k.cam, s76Cam([[0, [0.4, 8.4, 16.4], [0, 7.4, -2.2], 50], [1.1, [-0.2, 8.5, 18.2], [0, 7.3, -2.2], 50], [1.6, [-0.8, 8.3, 18.8], [-0.4, 7.2, -2.2], 50]], lt, 's09', { creep: -0.03, orbit: -0.05 }));
  const adult = wordT('adult') ?? 11.22;
  c3PersonPose(k.ron, k.cam, t, { expr: c3FaceAt([[0, 'neutral'], [wordT('only') ?? 10.96, 'unimpressed']], t, 'ron'), gaze: [0, 0], hand: { armR: [-1.3, S76_HAND], armL: [1.3, S76_HAND] }, ...S76_SIT });
  // the ball flies Woz -> Jobs -> Woz, a high lob every 0.62 s over Ron's head; each catch a little hop
  const P = 0.62, ph = (t - 10.62) / P, n = Math.floor(ph), f = ph - n, toJobs = n % 2 === 0;
  const jh = [1.2, 2.6], wh = [-1.2, 2.6];
  const hopAt = (even) => (v) => 0.12 * Math.exp(-((v - 10.62) / P % 1) * 8) * (Math.floor((v - 10.62) / P) % 2 === (even ? 0 : 1) ? 0 : 1);
  c3PersonPose(k.jobs, k.cam, t, { expr: c3FaceAt([[0, 'laugh'], [adult, 'mischievous']], t, 'jobs'), gaze: [0.6, 0.5], head: [-0.1, 0, 0], hand: { armL: jh, armR: [-1.35, S76_HAND] }, lift: hopAt(true), ...S76_SIT });
  c3PersonPose(k.woz, k.cam, t, { expr: 'laugh', gaze: [-0.6, 0.5], head: [0.1, 0, 0], hand: { armR: wh, armL: [1.35, S76_HAND] }, lift: hopAt(false), ...S76_SIT });
  const a = k.woz.root.localToWorld(s76V(...wh, 0.3)), b = k.jobs.root.localToWorld(s76V(...jh, 0.3)), [p0, p1] = toJobs ? [a, b] : [b, a];
  k.ball.position.lerpVectors(p0, p1, f); k.ball.position.y += Math.sin(f * Math.PI) * 4.6; k.ball.rotation.set(t * 7, t * 5, 0);
  s76Render(k, { bgBlur: lerp(3.0, 2.0, u) });
};

// ---- s10: "You own 10%" — the pie; the 10 % slice slides out to Ron and lands on "10%"
S76_FN['s10'] = (t, u, lt) => {
  const k = s76(); s76Place(k, S76_AT); k.pie.visible = true;
  const land = wordT('10%') ?? 12.66, f = clamp((t - (land - 0.32)) / 0.32);
  k.slice.position.set(0, Math.sin(f * Math.PI) * 0.35, -2.0 * EZ.back(f));
  c3SetCam(k.cam, s76Cam([[0, [0.8, 12.4, 10.6], [0, 5.9, -1.8], 50], [0.6, [0.4, 12.0, 9.8], [0, 6.0, -1.8], 50], [1.0, [0.0, 11.2, 8.4], [0, 6.2, -2.0], 50]], lt, 's10', { orbit: 0.08 }));
  c3PersonPose(k.ron, k.cam, t, { expr: c3FaceAt([[0, 'neutral'], [wordT('own') ?? 12.44, 'smile'], [land, 'happy']], t, 'ron'), gaze: [0, 0.9], hand: { armR: [-1.0, S76_HAND + 0.1], armL: [1.0, S76_HAND + 0.1] },
    lift: (v) => 0.12 * Math.exp(-Math.max(0, v - land) * 9) * (v > land ? 1 : 0), ...S76_SIT });
  c3PersonPose(k.jobs, k.cam, t, { expr: 'surprised', gaze: [0.7, 0.6], hand: { armR: [-1.35, S76_HAND], armL: [1.35, S76_HAND] }, ...S76_SIT });
  c3PersonPose(k.woz, k.cam, t, { expr: 'smile', gaze: [-0.7, 0.6], hand: { armR: [-1.35, S76_HAND], armL: [1.35, S76_HAND] }, ...S76_SIT });
  s76Render(k, { bgBlur: lerp(2.6, 4.0, u) });
};

// ---- s16: "not on the two kids with nothing to lose" — empty pockets turned out; a moth flutters up on "nothing"
S76_FN['s16'] = (t, u, lt) => {
  const k = s76(); s76Place(k, { ron: S76_AT.ron, jobs: [-2.1, 3.0, 'stand'], woz: [2.1, 3.0, 'stand'] });
  s76Fg(k, 'cback', [1.4, -2.5, -5.0], -0.12);
  const kids = wordT('kids') ?? 22.14, nothing = wordT('nothing') ?? 22.56;
  c3SetCam(k.cam, s76Cam([[0, [0.6, 8.8, 22.2], [0, 7.9, 2.4], 50], [1.4, [0, 8.8, 21.0], [0, 7.9, 2.4], 50], [2.1, [-0.4, 8.9, 19.4], [-0.2, 8.0, 2.4], 50]], lt, 's16', { orbit: -0.04 }));
  const pop = EZ.back(clamp((t - (kids - 0.08)) / 0.18));
  k.pockets.forEach((q) => { q.m.visible = pop > 0.01; q.m.scale.setScalar(Math.max(0.01, pop)); });
  const shrug = c3Hold([[0, 0], [kids - 0.05, 1]], t, 4 / 30);
  const hands = () => ({ armR: [lerp(-1.3, -1.4, shrug), lerp(0.5, 1.9, shrug)], armL: [lerp(1.3, 1.4, shrug), lerp(0.5, 1.9, shrug)] });
  c3PersonPose(k.ron, k.cam, t, { expr: 'unimpressed', hand: { armR: [-1.3, S76_HAND], armL: [1.3, S76_HAND] }, ...S76_SIT });
  c3PersonPose(k.jobs, k.cam, t, { expr: c3FaceAt([[0, 'smile'], [nothing, 'whistling']], t, 'jobs'), gaze: [0.5, -0.2], hand: hands(), foot: S76_FEET, lift: (v) => 0.14 * shrug * (v > kids ? Math.exp(-(v - kids) * 6) : 0) });
  c3PersonPose(k.woz, k.cam, t, { expr: c3FaceAt([[0, 'smile'], [nothing, 'shy']], t, 'woz'), gaze: [-0.5, -0.2], hand: hands(), foot: S76_FEET, lift: (v) => 0.14 * shrug * (v > kids + 0.05 ? Math.exp(-(v - kids - 0.05) * 6) : 0) });
  // the moth leaves Woz's left pocket and flutters up toward the camera
  if (t > nothing - 0.05) {
    const m = k.moth, d = t - (nothing - 0.05), q = k.pockets.find((p) => p.c === k.woz && p.sx > 0), o = q.c.root.localToWorld(q.m.position.clone());
    m.visible = true; m.position.set(o.x - d * 1.2 + Math.sin(d * 9) * 0.3, o.y + d * 2.4 + Math.sin(d * 13) * 0.25, o.z + 0.6 + d * 1.2);
    const fl = Math.sin(t * 60) * 0.9; k.wl.rotation.y = fl; k.wr.rotation.y = -fl; m.rotation.z = Math.sin(d * 7) * 0.3;
  }
  s76Render(k, { bgBlur: lerp(2.2, 3.4, u) });
};
