// =====================================================================
//  WORLD — "¿Tu celular te escucha?" in three.js (styles/pov3d/three.js, r149), metres. Three places:
//  the living room at night (origin), the app field (x = 100) and the ad network (x = 200).
//  Phones are rounded slabs with a code-drawn screen (a CanvasTexture redrawn by the shot that owns it).
// =====================================================================
THREE.ColorManagement.legacyMode = false;
const lin = (h) => new THREE.Color(h);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function g3Tex(draw, w = 256, h = 256, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: o.r ?? 0.8, metalness: o.m ?? 0, map: o.map ?? null, emissive: lin(o.em ?? '#000000'), emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide, transparent: o.tr ?? false, opacity: o.op ?? 1 });
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: lin(c), transparent: o.tr ?? false, opacity: o.op ?? 1, depthWrite: o.dw ?? true, side: o.side ?? THREE.FrontSide, map: o.map ?? null, toneMapped: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending });
function mesh(geo, mat, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  if (o.s) m.scale.set(...o.s); m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; return m;
}
function rrShape(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function rrBox(w, h, d, r, bevel = 0.002) { const g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: d, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 }); g.translate(0, 0, -d / 2); g.computeVertexNormals(); return g; }

// ---- the phone: a slab lying in its local x-y plane (screen faces +z), 7.4 x 15.4 cm
const PW = 0.074, PH = 0.154, PD = 0.008;
function buildPhone(frameC = '#2a2c34') {
  const g = new THREE.Group();
  g.add(mesh(rrBox(PW, PH, PD, 0.011), std(frameC, { r: 0.35, m: 0.6 })));
  const cv = document.createElement('canvas'); cv.width = 540; cv.height = 1120; const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
  const scrM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); const sg = new THREE.ShapeGeometry(rrShape(PW - 0.005, PH - 0.005, 0.009), 10);
  { const p = sg.attributes.position, uv = []; for (let i = 0; i < p.count; i++) uv.push(p.getX(i) / (PW - 0.005) + 0.5, p.getY(i) / (PH - 0.005) + 0.5); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); }
  const scr = new THREE.Mesh(sg, scrM); scr.position.z = PD / 2 + 0.0026; g.add(scr);
  // the bottom edge: speaker / mic holes
  const holeM = std('#0c0c10', { r: 0.6 }); for (let k = 0; k < 6; k++) g.add(mesh(new THREE.CylinderGeometry(0.0011, 0.0011, 0.004, 10), holeM, -0.018 + k * 0.0045 + (k > 2 ? 0.012 : 0), -PH / 2 - 0.0005, 0, { cast: false }));
  const micGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.02), new THREE.MeshBasicMaterial({ map: softTex('255,140,60'), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  micGlow.position.set(0, -PH / 2 - 0.002, 0); micGlow.rotation.x = -Math.PI / 2; g.add(micGlow);
  g.userData = { cv, tex, x: cv.getContext('2d'), micGlow };
  return g;
}
let SOFT = {};
function softTex(c) { if (SOFT[c]) return SOFT[c]; return (SOFT[c] = g3Tex((x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(0.4, `rgba(${c},0.5)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(0, 0, w, w); }, 128, 128)); }

// ---- screens (540 x 1120 canvas)
const ICON_C = ['#ff6a8a', '#3ad08a', '#ffc83a', '#a07aff', '#3ac8e8', '#ff8a3a', '#5a8aff', '#e85aff'];
function screenLock(x, o = {}) {
  const w = 540, h = 1120, g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a4aa8'); g.addColorStop(1, '#2a2a6a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,0.9)'; x.textAlign = 'center'; x.font = `700 30px ${S3.font}`; x.fillText('martes, 3 de marzo', w / 2, 190); x.font = `700 170px ${S3.font}`; x.fillText('9:41', w / 2, 350);
  if (o.notif > 0) { const a = clamp(o.notif), y = 430 + (1 - a) * 40; x.globalAlpha = a; x.fillStyle = 'rgba(245,244,250,0.95)'; x.beginPath(); x.roundRect(36, y, w - 72, 250, 34); x.fill();
    x.fillStyle = '#ffb42a'; x.beginPath(); x.roundRect(64, y + 28, 50, 50, 12); x.fill(); x.textAlign = 'left'; x.fillStyle = '#7a7a86'; x.font = `700 24px ${S3.font}`; x.fillText('Patrocinado · ahora', 130, y + 62);
    x.fillStyle = '#16161c'; x.font = `700 31px ${S3.font}`; x.fillText('Freidora de aire AirChef', 64, y + 130); x.fillStyle = '#5a5a66'; x.font = `700 28px ${S3.font}`; x.fillText('30 % de descuento · solo hoy', 64, y + 176);
    x.fillStyle = '#2a2c34'; x.beginPath(); x.roundRect(400, y + 110, 76, 96, 14); x.fill(); x.fillStyle = '#ffb42a'; x.fillRect(416, y + 130, 44, 8); x.globalAlpha = 1; }
  x.fillStyle = '#000'; x.beginPath(); x.roundRect(w / 2 - 80, 22, 160, 46, 23); x.fill();
}
function screenHome(x, o = {}) {
  const w = 540, h = 1120, sat = o.sat ?? 1, g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, hexMix('#4a3a8a', '#2a2a30', 1 - sat)); g.addColorStop(1, hexMix('#7a3a7a', '#2a2a30', 1 - sat)); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) { x.fillStyle = hexMix(ICON_C[(r * 4 + c) % 8], '#4a4a50', 1 - sat); x.beginPath(); x.roundRect(46 + c * 118, 150 + r * 150, 92, 92, 22); x.fill(); }
  x.fillStyle = '#000'; x.beginPath(); x.roundRect(w / 2 - 80, 22, 160, 46, 23); x.fill();
  x.fillStyle = '#fff'; x.font = `700 28px ${S3.font}`; x.textAlign = 'left'; x.fillText('9:41', 50, 56);
  if (o.dot) { x.fillStyle = '#ff9a2a'; x.beginPath(); x.arc(w / 2 + 52, 45, 9, 0, TAU); x.fill(); }
  const b = o.battery ?? 0.97; x.strokeStyle = '#fff'; x.lineWidth = 3; x.strokeRect(w - 96, 34, 48, 22); x.fillStyle = b < 0.2 ? '#ff4a3a' : '#fff'; x.fillRect(w - 93, 37, 42 * b, 16);
}
function screenSearch(x, o = {}) {
  const w = 540, h = 1120; x.fillStyle = '#fbfbfd'; x.fillRect(0, 0, w, h); x.fillStyle = '#000'; x.beginPath(); x.roundRect(w / 2 - 80, 22, 160, 46, 23); x.fill();
  x.fillStyle = '#eef0f4'; x.beginPath(); x.roundRect(30, 110, w - 60, 70, 35); x.fill(); x.fillStyle = '#16161c'; x.font = `700 30px ${S3.font}`; x.textAlign = 'left';
  const q = 'mejor freidora de aire', n = Math.floor(q.length * clamp(o.typed ?? 1)); x.fillText(q.slice(0, n) + (n < q.length ? '|' : ''), 70, 156);
  const res = [['Las mejores freidoras de aire de 2026', 'guía · reseñas'], ['AirChef vs. CrispMax: las probamos', 'comparativa'], ['Ofertas de freidoras cerca de ti', 'tiendas']];
  res.forEach(([t, s], i) => { const a = clamp((o.results ?? 0) * 3 - i); if (a <= 0) return; x.globalAlpha = a; const y = 240 + i * 190; x.fillStyle = '#ffb42a'; x.beginPath(); x.roundRect(40, y, 90, 110, 14); x.fill();
    x.fillStyle = '#16161c'; x.font = `700 30px ${S3.font}`; wrapText(x, t, 150, y + 34, 340, 36); x.fillStyle = '#3a8a5a'; x.font = `700 24px ${S3.font}`; x.fillText(s, 150, y + 110); x.globalAlpha = 1; });
}
function wrapText(x, t, px, py, maxW, lh) { const ws = t.split(' '); let line = '', y = py; for (const w of ws) { const test = line ? line + ' ' + w : w; if (x.measureText(test).width > maxW && line) { x.fillText(line, px, y); line = w; y += lh; } else line = test; } x.fillText(line, px, y); }
function screenOff(x) { x.fillStyle = '#0a0a0e'; x.fillRect(0, 0, 540, 1120); }
const hexMix = (a, b, t) => { const h = (c, i) => parseInt(c.slice(i, i + 2), 16); return '#' + [1, 3, 5].map((i) => Math.round(lerp(h(a, i), h(b, i), clamp(t))).toString(16).padStart(2, '0')).join(''); };
function paintScr(phone, fn, o) { const u = phone.userData; u.x.save(); fn(u.x, o); u.x.restore(); u.tex.needsUpdate = true; }

// ---- a seated person (faces +z), hips at the origin; userData: torso, head, arms [L, R], for pose()
function buildSitter(top, skin = '#a8714f', hairC = '#24170f') {
  const g = new THREE.Group(), T = std(top, { r: 0.9 }), S = std(skin, { r: 0.6 }), P = std('#24262e', { r: 0.8 }), Hm = std(hairC, { r: 0.7 });
  for (const s of [-1, 1]) {
    g.add(mesh(new THREE.CapsuleGeometry(0.075, 0.38, 4, 10), P, s * 0.11, 0, 0.2, { rx: Math.PI / 2 }));
    g.add(mesh(new THREE.CapsuleGeometry(0.065, 0.36, 4, 10), P, s * 0.11, -0.22, 0.43));
    g.add(mesh(new THREE.BoxGeometry(0.1, 0.06, 0.2), std('#1a1a1e'), s * 0.11, -0.43, 0.48));
  }
  const torso = new THREE.Group(); g.add(torso);
  torso.add(mesh(new THREE.CapsuleGeometry(0.17, 0.32, 6, 16), T, 0, 0.32, 0, { s: [1, 1, 0.75] }));
  const arms = [-1, 1].map((s) => { const sh = new THREE.Group(); sh.position.set(s * 0.22, 0.52, 0); const up = mesh(new THREE.CapsuleGeometry(0.05, 0.24, 4, 10), T, 0, -0.15, 0); sh.add(up);
    const el = new THREE.Group(); el.position.set(0, -0.3, 0); el.add(mesh(new THREE.CapsuleGeometry(0.045, 0.2, 4, 10), T, 0, -0.12, 0)); el.add(mesh(new THREE.SphereGeometry(0.05, 12, 10), S, 0, -0.26, 0)); sh.add(el); sh.userData.el = el; torso.add(sh); return sh; });
  const head = new THREE.Group(); head.position.set(0, 0.64, 0.02); torso.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.12, 20, 16), S, 0, 0.1, 0, { s: [1, 1.12, 1] }));
  head.add(mesh(new THREE.SphereGeometry(0.128, 20, 12, 0, TAU, 0, Math.PI * 0.5), Hm, 0, 0.12, -0.02, { s: [1, 1.12, 1.04], rx: -0.35 }));
  const eyes = [-1, 1].map((s) => { const e = mesh(new THREE.SphereGeometry(0.012, 8, 6), std('#140e0a'), s * 0.042, 0.11, 0.11); head.add(e); return e; });
  const mouth = mesh(new THREE.BoxGeometry(0.035, 0.006, 0.006), std('#5a2a20'), 0, 0.05, 0.118); head.add(mouth);
  g.userData = { torso, head, arms, eyes, mouth };
  return g;
}
// pose a sitter: breathe, look (yaw toward a point), talk (mouth + hands), lean, a gesture on one arm (0..1)
function pose(p, o = {}) {
  const u = p.userData, R = RNOW, ph = o.ph ?? 0, br = Math.sin(R * 1.6 + ph);
  u.torso.position.y = 0.006 * br; u.torso.rotation.x = (o.lean ?? 0) + 0.015 * br; u.torso.rotation.z = 0.02 * Math.sin(R * 0.4 + ph);
  let yaw = o.yaw ?? 0; if (o.look) { const w = new THREE.Vector3(); p.getWorldPosition(w); yaw = Math.atan2(o.look.x - w.x, o.look.z - w.z); }
  u.head.rotation.set((o.nod ?? 0) + 0.04 * Math.sin(R * 0.9 + ph) + (o.down ?? 0), clamp(yaw, -1.1, 1.1) + 0.05 * Math.sin(R * 0.5 + ph), 0.03 * Math.sin(R * 0.7 + ph));
  const talk = o.talk ?? 0, mo = talk * (0.5 + 0.5 * Math.abs(Math.sin(R * 13 + ph) * Math.sin(R * 7.3)));
  u.mouth.scale.set(1, 1 + 6 * mo, 1);
  const blink = (Math.sin(R * 0.8 + ph * 3) > 0.985) ? 0.15 : 1; u.eyes.forEach((e) => e.scale.set(1, blink, 1));
  u.arms.forEach((a, i) => { const s = i ? 1 : -1, gst = (o.gesture ?? 0) * (i === (o.hand ?? 1) ? 1 : 0.25), wave = talk * 0.25 * Math.sin(R * 3.1 + i + ph);
    a.rotation.set(-0.55 - 0.9 * gst - wave * (i === (o.hand ?? 1) ? 1 : 0.3), 0, s * (0.12 + 0.35 * gst)); a.userData.el.rotation.x = -0.9 - 0.6 * gst + 0.2 * wave; });
}
// a bust for the ad network (head + shoulders), faces +z
function buildBust(top, skin = '#a8714f', hairC = '#24170f') {
  const g = new THREE.Group(); g.add(mesh(new THREE.SphereGeometry(1, 32, 16, 0, TAU, 0, Math.PI / 2), std(top, { r: 0.85 }), 0, 0, 0, { s: [1, 0.8, 0.75] }));
  g.add(mesh(new THREE.SphereGeometry(0.55, 24, 18), std(skin, { r: 0.6 }), 0, 1.25, 0, { s: [1, 1.1, 1] }));
  g.add(mesh(new THREE.SphereGeometry(0.58, 24, 12, 0, TAU, 0, Math.PI * 0.5), std(hairC, { r: 0.7 }), 0, 1.3, -0.02, { s: [1, 1.1, 1.04], rx: -0.35 }));
  return g;
}
// the air fryer (a black rounded body, a drawer with a handle, a glowing dial)
function buildFryer() {
  const g = new THREE.Group(), body = std('#1e2026', { r: 0.4, m: 0.3 });
  g.add(mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.32, 32), body, 0, 0.16, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.02, 32), std('#30333a', { r: 0.3, m: 0.5 }), 0, 0.33, 0));
  g.add(mesh(new THREE.BoxGeometry(0.2, 0.12, 0.04), std('#2a2c34', { r: 0.4 }), 0, 0.09, 0.13));
  g.add(mesh(new THREE.BoxGeometry(0.1, 0.025, 0.05), std('#ffb42a', { r: 0.5 }), 0, 0.09, 0.165));
  g.add(mesh(new THREE.CircleGeometry(0.03, 24), basic('#ff9a2a'), 0, 0.25, 0.141, { cast: false }));
  return g;
}

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.background = lin('#0b0f1c'); const cam = new THREE.PerspectiveCamera(45, W / H, 0.005, 800); scene.add(cam);
  // ---- lights (the room's are re-set by night()/morning())
  const hemi = new THREE.HemisphereLight(0x6a78c0, 0x1a1420, 0.55); scene.add(hemi);
  const lamp = new THREE.PointLight(0xffb070, 1.6, 7, 1.6); lamp.position.set(-1.9, 1.5, -1.6); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.002; scene.add(lamp);
  const moon = new THREE.DirectionalLight(0x8aa0ff, 0.5); moon.position.set(1.5, 4, -6); moon.target.position.set(0, 0, 0); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 }); moon.shadow.bias = -0.0005; scene.add(moon, moon.target);
  const fill = new THREE.DirectionalLight(0xffe0c8, 0.25); fill.position.set(0, 2, 4); scene.add(fill);
  // ---- the room
  const room = new THREE.Group();
  const wallT = g3Tex((x, w, h) => { x.fillStyle = '#3a3654'; x.fillRect(0, 0, w, h); const R = RNG('wall'); for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '20,18,34' : '90,86,120'},${R.r(0.04, 0.1)})`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); } }, 512, 512, [3, 2]);
  const floorT = g3Tex((x, w) => { const R = RNG('fl'); for (let i = 0; i < 8; i++) { x.fillStyle = hexMix('#5a3e2c', '#6e4a32', R.f()); x.fillRect(i * w / 8, 0, w / 8, w); x.fillStyle = 'rgba(20,10,4,0.5)'; x.fillRect(i * w / 8, 0, 2, w); } }, 512, 512, [3, 3]);
  room.add(mesh(new THREE.PlaneGeometry(9, 9), std('#ffffff', { map: floorT, r: 0.7 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false }));
  const wallM = std('#ffffff', { map: wallT, r: 0.95 });
  room.add(mesh(new THREE.PlaneGeometry(9, 3.2), wallM, 0, 1.6, -3.6, { cast: false })); room.add(mesh(new THREE.PlaneGeometry(9, 3.2), wallM, -4.5, 1.6, 0, { ry: Math.PI / 2, cast: false })); room.add(mesh(new THREE.PlaneGeometry(9, 3.2), wallM, 4.5, 1.6, 0, { ry: -Math.PI / 2, cast: false }));
  // the window with city lights
  const cityT = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a1030'); g.addColorStop(0.7, '#1a2050'); g.addColorStop(1, '#3a2a50'); x.fillStyle = g; x.fillRect(0, 0, w, h); const R = RNG('city');
    for (let i = 0; i < 26; i++) { const bw = R.r(20, 60), bh = R.r(60, 220), bx = R.r(0, w), by = h - bh; x.fillStyle = '#0c1024'; x.fillRect(bx, by, bw, bh); for (let k = 0; k < 18; k++) { if (R.f() < 0.45) { x.fillStyle = R.f() < 0.8 ? '#ffd890' : '#a0c8ff'; x.fillRect(bx + R.r(3, bw - 6), by + R.r(4, bh - 4), 4, 5); } } }
    for (let i = 0; i < 80; i++) { x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(R.r(0, w), R.r(0, h * 0.4), 1.5, 1.5); } }, 512, 256);
  const winM = new THREE.MeshBasicMaterial({ map: cityT, toneMapped: false }); const win = mesh(new THREE.PlaneGeometry(3.4, 1.5), winM, 0.4, 1.85, -3.58, { cast: false }); room.add(win);
  const frameM = std('#d8d0c4', { r: 0.6 }); for (const [w, h, x, y] of [[3.6, 0.08, 0.4, 2.62], [3.6, 0.08, 0.4, 1.08], [0.08, 1.6, -1.36, 1.85], [0.08, 1.6, 2.16, 1.85], [0.05, 1.5, 0.4, 1.85]]) room.add(mesh(new THREE.BoxGeometry(w, h, 0.06), frameM, x, y, -3.55));
  // the sofa
  const sofaM = std('#2c3a6a', { r: 0.95 }), sofa = new THREE.Group();
  sofa.add(mesh(rrBox(2.6, 0.42, 0.9, 0.08, 0.02), sofaM, 0, 0.21, 0, { rx: -Math.PI / 2, s: [1, 1, 1] }));
  sofa.add(mesh(new THREE.BoxGeometry(2.6, 0.5, 0.22), sofaM, 0, 0.66, -0.36)); for (const s of [-1, 1]) sofa.add(mesh(new THREE.BoxGeometry(0.22, 0.58, 0.9), sofaM, s * 1.36, 0.4, 0));
  for (const s of [-1, 1]) sofa.add(mesh(new THREE.BoxGeometry(1.2, 0.12, 0.66), std('#33447a', { r: 0.95 }), s * 0.62, 0.48, 0.08));
  sofa.position.set(0, 0, -2.4); room.add(sofa);
  // the coffee table, a book, a mug
  const tbl = new THREE.Group(), wood = std('#4a3426', { r: 0.6 }); tbl.add(mesh(new THREE.BoxGeometry(1.4, 0.05, 0.62), wood, 0, 0.44, 0)); for (const [x, z] of [[-0.62, -0.26], [0.62, -0.26], [-0.62, 0.26], [0.62, 0.26]]) tbl.add(mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), wood, x, 0.21, z));
  tbl.add(mesh(new THREE.BoxGeometry(0.26, 0.04, 0.18), std('#b8382a', { r: 0.7 }), 0.45, 0.485, -0.05, { ry: 0.2 })); tbl.add(mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 16), std('#e8e4dc', { r: 0.4 }), -0.5, 0.51, 0.1));
  tbl.position.set(0, 0, -1.25); room.add(tbl);
  // the lamp (left), a plant (right)
  room.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), std('#3a3a40'), -1.9, 0.7, -2.6)); room.add(mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.32, 24, 1, true), std('#fff0d8', { em: '#ffc890', ei: 0.9, side: THREE.DoubleSide }), -1.9, 1.5, -2.6));
  room.add(mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.4, 20), std('#d8d0c4'), 1.9, 0.2, -2.8)); { const R = RNG('plant'); for (let i = 0; i < 9; i++) room.add(mesh(new THREE.SphereGeometry(1, 10, 8), std(i % 2 ? '#3a6a44' : '#2c5236'), 1.9 + R.n(0.2), 0.7 + R.r(0, 0.5), -2.8 + R.n(0.2), { s: [0.08, 0.35, 0.04], rz: R.n(0.6), rx: R.n(0.4) })); }
  // the router (on a side table, right)
  room.add(mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), wood, 1.75, 0.25, -1.6)); const router = new THREE.Group(); router.add(mesh(rrBox(0.22, 0.14, 0.035, 0.02), std('#e8e8ec', { r: 0.4 }), 0, 0.02, 0, { rx: -Math.PI / 2 }));
  for (const s of [-1, 1]) router.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 8), std('#e8e8ec'), s * 0.08, 0.1, -0.05)); router.add(mesh(new THREE.CircleGeometry(0.005, 10), basic('#3aff8a'), 0.06, 0.04, 0.071, { cast: false }));
  router.position.set(1.75, 0.5, -1.6); room.add(router);
  scene.add(room);
  // the people: your friend (left, mustard) and you (right, teal), seated on the sofa
  const friend = buildSitter('#d8a028'), you = buildSitter('#1f8a86', '#7a5236', '#3a2414');
  friend.position.set(-0.55, 0.62, -2.35); you.position.set(0.55, 0.62, -2.35); scene.add(friend, you);
  // the phones on the table (screens up)
  const phoneF = buildPhone('#c8a8ff'), phoneY = buildPhone('#2a2c34');
  // ---- the app field (x = 100): 60 x 60 icons
  const N = 60, apps = new THREE.InstancedMesh(rrBox(0.8, 0.8, 0.22, 0.2, 0.03), std('#ffffff', { r: 0.45 }), N * N);
  { const R = RNG('apps'), c = new THREE.Color(), m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)); let k = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++, k++) { m.compose(V3(100 + (i - N / 2) * 1.05, 0.11, (j - N / 2) * 1.05), q, V3(1, 1, 1)); apps.setMatrixAt(k, m); apps.setColorAt(k, c.set(R.pick(ICON_C)).offsetHSL(R.n(0.02), 0, R.n(0.05))); } }
  apps.castShadow = false; scene.add(apps);
  const appFloor = mesh(new THREE.PlaneGeometry(90, 90), std('#0d1020', { r: 0.9 }), 100, 0, 0, { rx: -Math.PI / 2, cast: false }); scene.add(appFloor);
  const appLight = new THREE.DirectionalLight(0xffffff, 1.2); appLight.position.set(110, 30, 20); appLight.target.position.set(100, 0, 0); scene.add(appLight, appLight.target);
  // ---- the ad network (x = 200): a dark floor, a grid, many people-dots, two busts
  const net = new THREE.Group(); net.add(mesh(new THREE.PlaneGeometry(200, 200), std('#0a0f1e', { r: 0.95 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false }));
  { const p = []; for (let i = -40; i <= 40; i++) p.push(i * 2, 0.01, -80, i * 2, 0.01, 80, -80, 0.01, i * 2, 80, 0.01, i * 2); const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); net.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: lin('#1a2848'), toneMapped: false }))); }
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 12, 8), std('#3a6aff', { r: 0.5, em: '#1a3aaa', ei: 0.6 }), 500); { const R = RNG('dots'), m = new THREE.Matrix4(); for (let i = 0; i < 500; i++) { let x, z; do { x = R.r(-40, 40); z = R.r(-60, 6); } while (Math.abs(x) < 6 && z > -3); m.makeTranslation(x, 0.35 + R.r(0, 1.5), z); dots.setMatrixAt(i, m); } } net.add(dots);
  const bustF = buildBust('#d8a028'), bustY = buildBust('#1f8a86', '#7a5236', '#3a2414'); bustF.position.set(-2.4, 0, 0); bustY.position.set(2.4, 0, 0);
  for (const b of [bustF, bustY]) { net.add(mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.12, 40), std('#1a3aaa', { r: 0.6, em: '#0a1a6a', ei: 0.5 }), b.position.x, 0.06, 0)); net.add(b); }
  net.position.set(200, 0, 0); scene.add(net);
  const netLight = new THREE.DirectionalLight(0xc8d8ff, 1.0); netLight.position.set(205, 12, 14); netLight.target.position.set(200, 1, 0); scene.add(netLight, netLight.target);
  // ---- props: the fryer, rings, arcs, the pin, the ad card
  const fryer = buildFryer(); fryer.visible = false; scene.add(fryer);
  const ringM = [...Array(8)].map(() => new THREE.MeshBasicMaterial({ color: lin('#ff8a2a'), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  const rings = ringM.map((m) => { const q = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 64), m); q.visible = false; scene.add(q); return q; });
  const wifiM = [...Array(6)].map(() => new THREE.MeshBasicMaterial({ color: lin('#5ab8ff'), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  const wifi = wifiM.map((m) => { const q = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64), m); q.visible = false; scene.add(q); return q; });
  const arcM = new THREE.MeshBasicMaterial({ color: lin('#8ad8ff'), toneMapped: false, transparent: true, opacity: 1 }), arcs = [0, 1, 2].map(() => { const q = new THREE.Mesh(new THREE.BufferGeometry(), arcM); q.visible = false; scene.add(q); return q; });
  const pin = new THREE.Group(); pin.add(mesh(new THREE.SphereGeometry(0.06, 20, 14), std('#e8283a', { r: 0.4 }), 0, 0.12, 0)); pin.add(mesh(new THREE.ConeGeometry(0.045, 0.1, 16), std('#e8283a', { r: 0.4 }), 0, 0.05, 0, { rx: Math.PI })); pin.visible = false; scene.add(pin);
  const pinRing = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.3, 48), new THREE.MeshBasicMaterial({ color: lin('#ff5a6a'), transparent: true, toneMapped: false, side: THREE.DoubleSide })); pinRing.rotation.x = -Math.PI / 2; pinRing.visible = false; scene.add(pinRing);
  const sparks = [...Array(60)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('180,230,255'), transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); return s; });
  scene.add(phoneF, phoneY);
  const glowO = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('255,140,50'), transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); glowO.visible = false; scene.add(glowO);
  G = { r, cv, scene, cam, glowO, hemi, lamp, moon, fill, winM, room, friend, you, phoneF, phoneY, apps, N, fryer, rings, ringM, wifi, wifiM, arcs, arcM, pin, pinRing, sparks, bustF, bustY, net };
  return G;
}

// ---- per frame
let SPI = 0, RNOW = 0;
function resetWorld() {
  const g = g3(); SPI = 0;
  g.fryer.visible = false; g.glowO.visible = false; g.rings.forEach((q) => (q.visible = false)); g.wifi.forEach((q) => (q.visible = false)); g.arcs.forEach((q) => (q.visible = false)); g.pin.visible = g.pinRing.visible = false; g.sparks.forEach((s) => (s.visible = false));
  night(); tablePhones(); g.phoneF.userData.micGlow.material.opacity = g.phoneY.userData.micGlow.material.opacity = 0; g.fryer.scale.setScalar(1);
}
function night() { const g = g3(); g.hemi.intensity = 0.55; g.hemi.color.set(0x6a78c0); g.lamp.intensity = 1.6; g.moon.intensity = 0.5; g.moon.color.set(0x8aa0ff); g.winM.color.set('#ffffff'); g.scene.background.set('#0b0f1c'); }
function morning() { const g = g3(); g.hemi.intensity = 1.1; g.hemi.color.set(0xd8e4ff); g.lamp.intensity = 0.2; g.moon.intensity = 1.6; g.moon.color.set(0xfff0d8); g.winM.color.set('#c8e0ff'); }
// the two phones lying screen-up on the table (friend's left, yours right)
const TABLE_Y = 0.465 + 0.0045 + PD / 2;
function tablePhones() { const g = g3(); for (const [p, x, ry] of [[g.phoneF, -0.13, 0.25], [g.phoneY, 0.14, -0.15]]) { p.position.set(x, TABLE_Y, -1.2); p.rotation.set(-Math.PI / 2, 0, ry); p.scale.setScalar(1); p.visible = true; } }
function spark(p, s, a) { const q = g3().sparks[SPI++]; if (!q || a <= 0) return; q.visible = true; q.position.copy(p); q.scale.set(s, s, 1); q.material.opacity = clamp(a); }
function setArc(i, a, b, h, u = 1, r = 0.012) { const q = g3().arcs[i]; if (u <= 0) return; const mid = a.clone().lerp(b, 0.5).add(V3(0, h, 0)), pts = []; for (let k = 0; k <= 40; k++) { const t = (k / 40) * u, p = a.clone().lerp(mid, t), p2 = mid.clone().lerp(b, t); pts.push(p.lerp(p2, t)); } q.geometry.dispose(); q.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, r, 8, false); q.visible = true; return pts[pts.length - 1]; }
const ppt = (phone, x, y, z) => { phone.updateMatrixWorld(); return V3(x, y, z).applyMatrix4(phone.matrixWorld); };
function camKeys(R, keys) {
  let i = 0; while (i < keys.length - 2 && R > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1] ?? a, u = b === a ? 0 : EZ.io(seg(R, a[0], b[0]));
  const L = (p, q) => p.map((v, k) => lerp(v, q[k], u));
  return { pos: L(a[1], b[1]), tgt: L(a[2], b[2]), fov: lerp(a[3], b[3], u) };
}
function setCam(c, sway = 1) {
  const g = g3(), R = RNOW, d = Math.hypot(c.pos[0] - c.tgt[0], c.pos[1] - c.tgt[1], c.pos[2] - c.tgt[2]), s = sway * 0.006 * d, sx = Math.sin(R * 0.7) * s, sy = Math.sin(R * 0.53 + 1) * s * 0.6;
  g.cam.position.set(c.pos[0] + sx, c.pos[1] + sy, c.pos[2]); g.cam.fov = c.fov; g.cam.updateProjectionMatrix(); g.cam.lookAt(c.tgt[0] + sx * 0.5, c.tgt[1] + sy * 0.5, c.tgt[2]); g.cam.updateMatrixWorld();
}
function renderWorld(a = 1) { const g = g3(); g.r.render(g.scene, g.cam); ctx.save(); screen(); ctx.globalAlpha = a; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore(); }
const P2 = (v) => s3Proj(v, g3().cam);
