// =====================================================================
//  COMMON — shared textures and builders for every set file (set-*.js), plus the three look-check sets, each a pure function of TT.
//    kitchen  1976 kitchen table: Ron signs the partnership between the two Steves (shot 2)
//    shop     the computer store that doesn't pay its bills (shot 13)
//    led      night plaza, a giant LED board rolls to $5,000,000,000,000 on "trillion" (shot 22)
//  Units: head radius = 1 (~0.22 m).
// =====================================================================
const S = {};
const wordT = (w, n = 1) => { let k = 0; for (const x of WORDS) if (x.w.replace(/[^\w$%]/g, '').toLowerCase() === w.toLowerCase() && ++k === n) return x.s; return null; };

// ---- texture helpers
function inked(x, txt, px, py, size, fill, o = {}) {
  x.save(); x.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; x.textAlign = o.align ?? 'center'; x.textBaseline = 'middle';
  const maxW = o.maxW ?? x.canvas.width * 0.9, tw = x.measureText(txt).width;   // never spill past the sign: shrink to fit
  if (tw > maxW) { size *= maxW / tw; x.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; }
  x.lineJoin = 'round'; if (o.stroke !== false) { x.strokeStyle = o.stroke ?? '#2a1208'; x.lineWidth = o.sw ?? size * 0.14; x.strokeText(txt, px, py); }
  x.fillStyle = fill; x.fillText(txt, px, py); x.restore();
}
const tex = (draw, w = 512, h = 512) => c3Tex(draw, w, h);
function texWallpaper() {   // 70s: brown ground, orange/mustard rings
  const t = tex((x, w, h) => { x.fillStyle = '#6b3a1e'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const cx = (i + (j % 2) * 0.5) * w / 4, cy = (j + 0.5) * h / 4;
      for (const [r, c] of [[52, '#e07a2a'], [40, '#f0b040'], [28, '#c8551c'], [16, '#f6d27a']]) { x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fillStyle = c; x.fill(); } } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 2); return t;
}
function texPanel() { const t = tex((x, w, h) => { const R = RNG('panel'); for (let i = 0; i < 16; i++) { x.fillStyle = `hsl(25,${45 + R.r(-6, 6)}%,${26 + R.r(-4, 4)}%)`; x.fillRect(i * w / 16, 0, w / 16, h); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(i * w / 16, 0, 3, h);
  for (let k = 0; k < 6; k++) { x.strokeStyle = 'rgba(30,12,4,0.25)'; x.beginPath(); x.moveTo(i * w / 16 + R.r(4, 28), 0); x.bezierCurveTo(i * w / 16 + R.r(0, 30), h / 3, i * w / 16 + R.r(0, 30), h * 2 / 3, i * w / 16 + R.r(4, 28), h); x.stroke(); } } });
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); return t; }
function texLino() { const t = tex((x, w, h) => { for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = (i + j) % 2 ? '#d8c49a' : '#8a5a32'; x.fillRect(i * w / 8, j * h / 8, w / 8, h / 8); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return t; }
function texWood() { const t = tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#8a5228'); g.addColorStop(1, '#a8682e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('wood'); x.strokeStyle = 'rgba(60,28,8,0.35)'; for (let i = 0; i < 40; i++) { const y = R.r(0, h); x.lineWidth = R.r(1, 3); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(20), w * 2 / 3, y + R.n(20), w, y + R.n(10)); x.stroke(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function texCalendar(month, year) {
  return tex((x, w, h) => { x.fillStyle = '#fbf3e0'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8321e'; x.fillRect(0, 0, w, h * 0.3);
    inked(x, month, w / 2, h * 0.12, h * 0.1, '#ffffff', { stroke: false }); inked(x, year, w / 2, h * 0.23, h * 0.08, '#ffe6a0', { stroke: false });
    x.fillStyle = '#5a3a22'; x.font = `700 ${h * 0.045}px Arial`; x.textAlign = 'center';
    for (let d = 0; d < 30; d++) { const c = (d + 4) % 7, r = Math.floor((d + 4) / 7); x.fillText(String(d + 1), w * (0.1 + c * 0.13), h * (0.4 + r * 0.11)); }
    x.strokeStyle = '#c8321e'; x.lineWidth = 6; x.beginPath(); x.arc(w * (0.1 + 4 * 0.13), h * 0.385, 22, 0, TAU); x.stroke(); }, 512, 640);
}
function texContract() {
  return tex((x, w, h) => { x.fillStyle = '#fbf7ec'; x.fillRect(0, 0, w, h); inked(x, 'PARTNERSHIP AGREEMENT', w / 2, h * 0.08, h * 0.04, '#2a1a10', { stroke: false, font: 'Georgia, serif', weight: 700 });
    x.fillStyle = 'rgba(40,30,20,0.55)'; const R = RNG('lines'); for (let i = 0; i < 22; i++) x.fillRect(w * 0.1, h * (0.15 + i * 0.03), w * R.r(0.5, 0.8), 3);
    x.strokeStyle = '#1a2a6a'; x.lineWidth = 4; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(w * 0.12, h * (0.86 + k * 0.035)); for (let i = 0; i < 12; i++) x.lineTo(w * (0.12 + i * 0.022), h * (0.86 + k * 0.035) + Math.sin(i * 1.7 + k) * 8); x.stroke(); }
    x.fillStyle = 'rgba(40,30,20,0.6)'; x.fillRect(w * 0.1, h * 0.9, w * 0.35, 2); }, 512, 700);
}
function texBlinds() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff3d0'); g.addColorStop(1, '#ffc87a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(150,90,40,0.55)'; x.fillRect(0, i * h / 18, w, h / 36); } }, 256, 256); }
function texBox(label, c) { return tex((x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(60,30,10,0.4)'; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
  inked(x, label, w / 2, h * 0.45, h * 0.16, '#ffffff', { stroke: '#3a1a08' }); x.fillStyle = '#2a7a4a'; x.fillRect(w * 0.2, h * 0.65, w * 0.6, h * 0.12); }, 256, 256); }
function texSign(txt, c1, c2, k = 0.55) { return tex((x, w, h) => { x.fillStyle = '#1a0c10'; x.fillRect(0, 0, w, h); inked(x, txt, w / 2, h / 2, h * k, c1, { stroke: c2, sw: h * 0.06 }); }, 1024, 256); }
function texBill(i) { return tex((x, w, h) => { x.fillStyle = '#f6efe0'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,40,20,0.5)'; for (let k = 0; k < 6; k++) x.fillRect(w * 0.1, h * (0.15 + k * 0.1), w * (0.5 + 0.3 * ((k + i) % 2)), 4);
  x.save(); x.translate(w / 2, h * 0.7); x.rotate(-0.25); x.strokeStyle = '#d22a1e'; x.lineWidth = 7; x.strokeRect(-w * 0.36, -h * 0.09, w * 0.72, h * 0.18); inked(x, 'UNPAID', 0, 0, h * 0.13, '#d22a1e', { stroke: false }); x.restore(); }, 256, 256); }
function texWindows(seed) { const t = tex((x, w, h) => { x.fillStyle = '#141826'; x.fillRect(0, 0, w, h); const R = RNG('win', seed);
  for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) { const on = R.f() < 0.55; x.fillStyle = on ? (R.f() < 0.5 ? '#ffd890' : '#ffeec8') : '#232a40'; x.fillRect(i * w / 8 + 6, j * h / 16 + 5, w / 8 - 12, h / 16 - 10); } }, 256, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }

// ---- shared builders
const rb = (w, h, d, mat, x, y, z, ink = 0.03) => { const m = c3Mesh(c3RBox(w, h, d, Math.min(0.12, w * 0.2, h * 0.2, d * 0.2)), mat, ink); m.position.set(x, y, z); return m; };
const pl = (w, h, mat, x, y, z, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); return m; };
const cyl = (r0, r1, h, mat, x, y, z, ink = 0.03, seg = 24) => { const m = c3Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat, ink); m.position.set(x, y, z); return m; };
function lights(scene, o = {}) {
  scene.add(new THREE.AmbientLight(o.amb ?? '#fff0e4', o.ambI ?? 0.3));
  scene.add(new THREE.HemisphereLight(o.sky ?? '#ffe2c0', o.ground ?? '#3a1c2a', 0.45));
  const key = new THREE.DirectionalLight(o.key ?? '#ffe9d0', o.keyI ?? 1.0); key.position.set(...(o.keyP ?? [6, 14, 12])); scene.add(key);
  const rim = new THREE.DirectionalLight(o.rim ?? '#ffb070', o.rimI ?? 0.6); rim.position.set(...(o.rimP ?? [-6, 9, -8])); scene.add(rim);
  scene.children.forEach((c) => c.isLight && c.layers.enableAll());
  return key;
}
function mug(c, x, y, z) { const g = new THREE.Group(); g.add(cyl(0.32, 0.28, 0.7, c3Prop(c, { rough: 0.3 }), 0, 0.35, 0, 0.02)); const h = c3Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 16, Math.PI), c3Prop(c, { rough: 0.3 }), 0.015); h.position.set(0.34, 0.38, 0); h.rotation.z = -Math.PI / 2; g.add(h); g.position.set(x, y, z); return g; }
function chair(x, z, ry, M) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  g.add(rb(2.0, 0.3, 2.0, M.vinyl, 0, 2.3, 0)); g.add(rb(2.0, 2.2, 0.25, M.vinyl, 0, 3.6, -0.95));
  for (const [a, b] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) g.add(cyl(0.07, 0.07, 2.2, M.chrome, a, 1.1, b, 0.015, 8)); return g; }

// ---- set 1: the kitchen, April 1976
function buildKitchen() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 300);
  const key = lights(scene, { keyP: [4, 13, 14], keyI: 0.95 });
  const sun = new THREE.PointLight('#ffc070', 1.2, 30, 1.5); sun.position.set(5, 8, -4); sun.layers.enableAll(); scene.add(sun);
  const M = { wood: c3Prop('#ffffff', { map: texWood(), rough: 0.45 }), vinyl: c3Prop('#d8641e', { rough: 0.35 }), chrome: c3Chrome(),
    fridge: c3Prop('#8a9a3a', { rough: 0.3 }), cab: c3Prop('#ffffff', { map: texWood(), rough: 0.5 }), counter: c3Prop('#e8c060', { rough: 0.3 }) };
  const floor = pl(60, 60, c3Prop('#ffffff', { map: texLino(), rough: 0.6 }), 0, 0, 0, 0, -Math.PI / 2); scene.add(floor);
  scene.add(pl(40, 8, c3Prop('#ffffff', { map: texWallpaper(), rough: 0.8 }), 0, 9.5, -7));
  scene.add(pl(40, 5.5, c3Prop('#ffffff', { map: texPanel(), rough: 0.6 }), 0, 2.75, -6.98));
  scene.add(rb(40, 0.3, 0.3, M.cab, 0, 5.5, -6.85, 0.02));
  scene.add(pl(14, 14, c3Prop('#ffffff', { map: texWallpaper(), rough: 0.8 }), -13, 7, 0, Math.PI / 2));
  scene.add(pl(40, 30, c3Prop('#f2e2c4', { rough: 0.9 }), 0, 13.5, 0, 0, Math.PI / 2));   // ceiling
  // window with blinds (the daylight)
  scene.add(rb(5.4, 4.6, 0.4, c3Prop('#f4ecd8', { rough: 0.4 }), 5, 8.2, -6.9, 0.03));
  scene.add(pl(4.8, 4.0, c3Flat('#ffffff', { map: texBlinds(), glow: '#ffcf80' }), 5, 8.2, -6.65));
  // fridge, cabinets, counter, props
  scene.add(rb(3.2, 8.4, 2.8, M.fridge, -9.5, 4.2, -5.4)); scene.add(rb(0.18, 2.2, 0.3, M.chrome, -8.3, 6.0, -3.9, 0.015));
  scene.add(rb(6, 3.6, 2.4, M.cab, -4.6, 1.8, -5.7)); scene.add(rb(6.2, 0.3, 2.6, M.counter, -4.6, 3.75, -5.6, 0.02));
  scene.add(rb(6, 2.6, 1.4, M.cab, -4.6, 10.5, -6.2));
  scene.add(rb(1.4, 1.0, 1.0, M.chrome, -6.4, 4.4, -5.6)); scene.add(rb(1.0, 1.6, 1.0, c3Prop('#c8321e', { rough: 0.3 }), -3.2, 4.7, -5.6));
  scene.add(mug('#f0c040', -5.0, 3.9, -5.2)); scene.add(mug('#4a8ac8', -4.3, 3.9, -5.6));
  const plant = new THREE.Group(); plant.add(cyl(0.5, 0.38, 0.8, c3Prop('#c86a2a', { rough: 0.6 }), 0, 0.4, 0));
  for (let i = 0; i < 7; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.45, 10, 8), c3Prop('#4a8a3a', { rough: 0.6 }), 0.02); lf.position.set(Math.cos(i) * 0.45, 1.1 + (i % 3) * 0.25, Math.sin(i) * 0.45); lf.scale.set(0.6, 1.3, 0.35); lf.rotation.z = Math.cos(i) * 0.6; plant.add(lf); }
  plant.position.set(7.8, 6.0, -6.4); scene.add(plant); scene.add(rb(3.6, 0.25, 0.9, M.cab, 6.8, 5.95, -6.5, 0.02));
  scene.add(pl(1.8, 2.25, c3Prop('#ffffff', { map: texCalendar('APRIL', '1976'), rough: 0.7 }), 1.2, 8.4, -6.95));
  const phone = new THREE.Group(); phone.add(rb(1.1, 1.5, 0.6, c3Prop('#e06a1e', { rough: 0.3 }), 0, 0, 0)); phone.add(cyl(0.38, 0.38, 0.1, c3Prop('#f6e8d0', { rough: 0.3 }), 0, -0.1, 0.33, 0.015).rotateX(Math.PI / 2));
  phone.position.set(10.5, 6.8, -6.6); scene.add(phone);
  // pendant lamp over the table
  const lamp = new THREE.Group(); lamp.add(cyl(0.04, 0.04, 4, c3Flat('#3a2a20'), 0, 2, 0, 0, 6)); lamp.add(c3Mesh(new THREE.ConeGeometry(1.6, 1.4, 28, 1, true), c3Prop('#e8781e', { rough: 0.35 }), 0.03));
  lamp.children[1].material.side = THREE.DoubleSide; lamp.add(c3Mesh(new THREE.SphereGeometry(0.45, 14, 10), c3Flat('#fff4d0', { glow: '#ffd080' })));
  lamp.children[2].position.y = -0.5; lamp.position.set(0, 11.2, -1.2); scene.add(lamp);
  const bulb = new THREE.PointLight('#ffd8a0', 1.0, 18, 1.6); bulb.position.set(0, 10.2, -1.2); bulb.layers.enableAll(); scene.add(bulb);
  // the table, the contract, the people
  const focus = new THREE.Group(); scene.add(focus);
  focus.add(cyl(3.4, 3.4, 0.3, M.wood, 0, 3.4, -1.2, 0.04, 48)); focus.add(cyl(0.35, 0.5, 3.2, M.chrome, 0, 1.7, -1.2, 0.02)); focus.add(cyl(1.4, 1.5, 0.2, M.chrome, 0, 0.1, -1.2, 0.02));
  const paper = pl(1.6, 2.2, c3Prop('#ffffff', { map: texContract(), rough: 0.8 }), 0.1, 3.57, 0.3, 0, -Math.PI / 2); paper.rotation.z = 0.12; focus.add(paper);
  focus.add(pl(1.3, 1.7, c3Prop('#f6f1e4', { rough: 0.8 }), -1.9, 3.565, 0.1, 0, -Math.PI / 2)); focus.add(pl(1.3, 1.7, c3Prop('#f6f1e4', { rough: 0.8 }), 2.0, 3.565, -0.4, 0, -Math.PI / 2));
  focus.add(mug('#c8321e', -2.3, 3.55, -1.8)); focus.add(mug('#f4ecd8', 2.2, 3.55, -2.2));
  const pcb = rb(1.6, 0.06, 1.1, c3Prop('#2a7a4a', { rough: 0.4 }), 1.6, 3.6, -1.0, 0.015); focus.add(pcb);
  for (let i = 0; i < 6; i++) focus.add(rb(0.35, 0.08, 0.16, c3Prop('#1a1a1a', { rough: 0.4 }), 1.1 + (i % 3) * 0.45, 3.66, -1.25 + Math.floor(i / 3) * 0.45, 0));
  const pen = cyl(0.04, 0.04, 0.9, c3Prop('#1a2a6a', { rough: 0.3 }), 0, 0, 0, 0.01, 8); pen.rotation.set(Math.PI / 2, 0, 0.6); focus.add(pen);
  focus.add(chair(0, -3.6, 0, M)); focus.add(chair(-3.9, -0.8, 1.15, M)); focus.add(chair(3.9, -0.8, -1.15, M));
  const ron = c3Person({ key: 'ron', outfit: 'mustard', hairStyle: 'brown', fx: ['mustache', 'glasses'] });
  const jobs = c3Person({ key: 'jobs', outfit: 'white', hairStyle: 'long', hairW: 1.15, fx: ['beard'] });
  const woz = c3Person({ key: 'woz', outfit: 'plaid', hairStyle: 'ref', fx: ['beard', 'glasses'], bodyW: 2.3 });
  c3Put(ron.g, 0, 2.45, -3.3); c3Put(jobs.g, -3.6, 2.45, -0.8); c3Put(woz.g, 3.6, 2.45, -0.8);
  ron.root.add(pen); pen.rotation.set(0, 0, -0.7);
  [ron, jobs, woz].forEach((c) => focus.add(c.g));
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#ffe2b8', mid: '#b07048' }); c3Shadows(scene, key, 16);
  return { scene, cam, ron, jobs, woz, pen };
}
const CAM_KITCHEN = [[1.3, [1.0, 8.2, 18.5], [0.2, 5.6, -1.2], 44], [3.62, [0.4, 8.6, 20.5], [0.0, 5.8, -1.2], 44]];
function sceneKitchen(t) {
  const k = S.kitchen ||= buildKitchen();
  const sign = wordT('signed') ?? 2.0, starts = wordT('starts') ?? 3.0;

  // Ron signs: right hand writes small loops on the contract until "signed", then sits back proud on "starts"
  const wr = t < sign ? Math.sin(t * 22) * 0.1 : 0, back = c3Hold([[0, 0], [starts, 1]], t, 5 / 30);
  const hand = [lerp(-0.35 + wr, -1.5, back), lerp(1.45, 1.1, back)];   // billboard-local: writing on the paper, then sitting back
  c3SetCam(k.cam, c3CamAt(CAM_KITCHEN, t));   // billboards face the camera: camera first
  k.pen.position.set(hand[0] + 0.12, hand[1] + 0.2, 0.08);
  c3PersonPose(k.ron, k.cam, t, { expr: c3FaceAt([[0, 'determined'], [starts, 'proud']], t, 'ron'), gaze: [0, 0.7 * (1 - back)], head: [0.05 * (1 - back), 0, -0.08 * (1 - back)],
    hand: { armR: hand.slice(0, 2), armL: [1.5, 1.45] } });
  c3PersonPose(k.jobs, k.cam, t, { expr: c3FaceAt([[0, 'excited']], t, 'jobs'), gaze: [0.7, 0.2], head: [-0.06, 0, 0], hand: { armR: [-1.4, 2.6], armL: [1.5, 1.4] }, bend: { armR: 1 } });
  c3PersonPose(k.woz, k.cam, t, { expr: c3FaceAt([[0, 'happy']], t, 'woz'), gaze: [-0.7, 0.2], head: [0.06, 0, 0], hand: { armL: [1.4, 2.6], armR: [-1.5, 1.4] }, bend: { armL: -1 } });
  c3Render(k.scene, k.cam, { bg: '#2a1408', bgBlur: 3.0, glow: 0.55, glowBlur: 16, grade: 'saturate(1.3) contrast(1.15) brightness(0.92)' });
}

// ---- set 2: the computer store
function buildShop() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 300);
  const key = lights(scene, { keyP: [-5, 14, 12], keyI: 0.9, rim: '#7ab0ff', rimI: 0.5 });
  const M = { shelf: c3Prop('#ffffff', { map: texWood(), rough: 0.5 }), counter: c3Prop('#c8a070', { rough: 0.4 }), dark: c3Prop('#2a2420', { rough: 0.4 }), beige: c3Prop('#e6dcc4', { rough: 0.4 }) };
  scene.add(pl(60, 60, c3Prop('#5a4a42', { rough: 0.8 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(pl(40, 16, c3Prop('#c8b088', { rough: 0.9 }), 0, 8, -8));
  scene.add(pl(7.5, 1.9, c3Flat('#ffffff', { map: texSign('BYTE SHOP', '#ff7a2a', '#ffd080', 0.62), glow: '#5a2008' }), 0.7, 11.4, -7.9));
  const boxes = [texBox('COMPUTER', '#c8a060'), texBox('MEMORY', '#b89050'), texBox('TERMINAL', '#d0b070')];
  for (let s = 0; s < 3; s++) { scene.add(rb(18, 0.3, 2.4, M.shelf, 0, 2.5 + s * 3.2, -6.8, 0.02));
    for (let i = 0; i < 8; i++) { const R = RNG('box', s, i), b = rb(R.r(1.6, 2.1), R.r(1.6, 2.4), 1.8, c3Prop('#ffffff', { map: boxes[(i + s) % 3], rough: 0.7 }), -8 + i * 2.2 + R.n(0.2), 2.65 + s * 3.2 + 0.9, -6.8, 0.025); scene.add(b); } }
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.add(rb(2.4, 2.0, 2.0, M.beige, 0, 1.0, 0)); g.add(pl(1.7, 1.3, c3Flat('#3aff8a', { glow: '#2acb6a' }), 0, 1.1, 1.02)); g.add(rb(2.6, 0.3, 1.2, M.beige, 0, -0.05, 1.4, 0.02)); g.position.set(-6 + i * 6, 4.0, -3.5); scene.add(g); }
  scene.add(rb(18, 0.4, 3, M.counter, 0, 3.8, -3.5)); scene.add(rb(17.6, 3.6, 2.6, c3Prop('#8a5a32', { rough: 0.5 }), 0, 1.8, -3.5));
  const focus = new THREE.Group(); scene.add(focus);
  // the register and the overflowing box of unpaid bills
  focus.add(rb(2.4, 1.6, 2.0, c3Prop('#b8b8c0', { rough: 0.25, metal: 0.6 }), 5.5, 4.8, -3.2));
  focus.add(rb(3.2, 2.2, 2.4, c3Prop('#b08850', { rough: 0.7 }), -1.2, 5.1, -2.6));
  const bills = []; for (let i = 0; i < 14; i++) { const R = RNG('bill', i), b = pl(1.3, 1.3, c3Prop('#ffffff', { map: texBill(i), rough: 0.8, side: THREE.DoubleSide }), -1.2 + R.n(1.2), 6.3 + R.r(0, 1.0), -2.6 + R.n(0.9));
    b.rotation.set(-Math.PI / 2 + R.n(0.9), R.n(0.6), R.n(1.2)); b.material.side = THREE.DoubleSide; focus.add(b); bills.push(b); }
  const owner = c3Person({ key: 'owner', outfit: 'stripes', hairStyle: 'bald', hairW: 1.2, fx: ['mustache'], bodyW: 2.6 });
  c3Put(owner.g, 2.6, 2.7, -5.4); focus.add(owner.g);
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#fff0d8', mid: '#a08060' }); c3Shadows(scene, key, 16);
  return { scene, cam, owner, bills };
}
const CAM_SHOP = [[16.9, [2.0, 8.8, 16.5], [0.8, 7.6, -3.0], 42], [18.72, [0.8, 8.2, 12.5], [0.6, 7.4, -2.8], 42]];
function sceneShop(t) {
  const s = S.shop ||= buildShop();
  const bills = wordT('bills') ?? 18.2;
  s.bills.forEach((b, i) => { const R = RNG('billf', i), u = clamp((t - (bills - 0.4 + i * 0.03)) / 0.5); b.position.y = (b.userData.y0 ??= b.position.y) + EZ.o2(u) * R.r(0.3, 1.4); b.rotation.z = (b.userData.r0 ??= b.rotation.z) + u * R.n(1.5); });
  c3SetCam(s.cam, c3CamAt(CAM_SHOP, t));
  c3PersonPose(s.owner, s.cam, t, { expr: c3FaceAt([[0, 'whistling'], [bills, 'smug']], t, 'owner'), gaze: [-0.5, 0], head: [0.08, 0, 0], hand: { armL: [1.6, 0.6], armR: [-0.9, 3.4] }, bend: { armR: 1 } });
  c3Render(s.scene, s.cam, { bg: '#2a1408', bgBlur: 3.2, glow: 0.6, glowBlur: 16, grade: 'saturate(1.3) contrast(1.15) brightness(0.92)' });
}

// ---- set 3: the LED board, today
function buildLed() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 600);
  const key = lights(scene, { amb: '#8090c0', ambI: 0.35, sky: '#4060a0', ground: '#100810', key: '#a0b8ff', keyI: 0.5, keyP: [-8, 20, 10], rim: '#ff8a40', rimI: 0.8 });
  scene.add(pl(200, 200, c3Prop('#22202a', { rough: 0.25, metal: 0.2 }), 0, 0, 0, 0, -Math.PI / 2));
  for (let i = 0; i < 14; i++) { const R = RNG('bld', i), w = R.r(6, 12), h = R.r(20, 60), x = -70 + i * 11 + R.n(2), z = -40 - R.r(0, 40);
    const t = texWindows(i); t.repeat.set(w / 6, h / 10); const b = c3Mesh(new THREE.BoxGeometry(w, h, w), c3Prop('#ffffff', { map: t, rough: 0.4, emissive: '#ffffff', ei: 0.9, emissiveMap: t }), 0.03); b.position.set(x, h / 2, z); scene.add(b); }
  const focus = new THREE.Group(); scene.add(focus);
  focus.add(rb(26, 22, 3, c3Prop('#2a2e3a', { rough: 0.3, metal: 0.4 }), 0, 11, -12));
  const board = document.createElement('canvas'); board.width = 2048; board.height = 640;
  const bt = new THREE.CanvasTexture(board); bt.encoding = THREE.sRGBEncoding;
  focus.add(pl(23, 7.2, c3Flat('#ffffff', { map: bt, glow: '#5a1a08' }), 0, 14, -10.45));
  focus.add(pl(23, 3, c3Flat('#ffffff', { map: texSign('APPLE MARKET VALUE', '#ffffff', '#3a3a50', 0.3), glow: '#8090ff' }), 0, 19.4, -10.45));
  const peds = [];
  for (let i = 0; i < 9; i++) { const p = c3Person({ key: 'ped' + i, outfit: ['stripes', 'navy', 'plaid', 'white', 'mustard', 'teal'][i % 6], hairStyle: ['spiky', 'side', 'long', 'neat2', 'white', 'swept'][i % 6] });
    const R = RNG('ped', i); c3Put(p.g, -10 + i * 2.5 + R.n(0.6), 2.6, 4 + R.n(2.5), 0, 0, 0, 0.9); focus.add(p.g); peds.push(p); }
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#5a70b0', mid: '#2a2440', bot: '#080610', cards: [[0, 30, -20, 30, 8, '#ff7a3a'], [-30, 10, 10, 10, 18, '#7a9aff']] }); c3Shadows(scene, key, 30);
  return { scene, cam, board, bt, peds };
}
const CAM_LED = [[31.2, [0, 3.5, 40], [0, 9.0, -10], 44], [33.0, [0, 6.0, 52], [0, 12.0, -10], 44]];
function sceneLed(t) {
  const s = S.led ||= buildLed();
  // the counter rolls fast and lands on 5,000,000,000,000 exactly on "trillion"
  const land = wordT('trillion') ?? 32.4, u = clamp((t - 31.25) / (land - 31.25)), v = u >= 1 ? 5e12 : Math.floor(5e12 * (1 - (1 - u) ** 3));
  const x = s.board.getContext('2d'), w = s.board.width, h = s.board.height;
  x.fillStyle = '#100404'; x.fillRect(0, 0, w, h);
  x.font = `700 ${h * 0.3}px Consolas, "Courier New", monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(255,60,20,0.1)'; x.fillText('$8,888,888,888,888', w / 2, h * 0.53);
  x.fillStyle = '#ff4a1a'; x.fillText('$' + Math.round(v).toLocaleString('en-US'), w / 2, h * 0.53); s.bt.needsUpdate = true;
  c3SetCam(s.cam, c3CamAt(CAM_LED, t));
  s.peds.forEach((p, i) => c3PersonPose(p, s.cam, t, { expr: u >= 1 ? ['shocked', 'starstruck', 'surprised'][i % 3] : 'surprised', gaze: [0, -0.9], head: [0, 0, 0.05] }));
  c3Render(s.scene, s.cam, { bg: '#0a0810', bgBlur: 4.0, glow: 0.5, glowBlur: 18, grade: 'saturate(1.25) contrast(1.12)' });
}
