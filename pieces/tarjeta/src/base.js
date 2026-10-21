// helpers copied from pieces/escucha/src/world.js (materials, rounded boxes, phone + screens, pose rig, cameras)
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

function pose(p, o = {}) {
  const u = p.userData, R = RNOW, ph = o.ph ?? 0, br = Math.sin(R * 1.6 + ph);
  u.torso.position.y = (u.torso.userData.y0 ?? 0) + 0.006 * br; u.torso.rotation.x = (o.lean ?? 0) + 0.015 * br; u.torso.rotation.z = 0.02 * Math.sin(R * 0.4 + ph);
  let yaw = o.yaw ?? 0; if (o.look) { const w = new THREE.Vector3(); p.getWorldPosition(w); yaw = Math.atan2(o.look.x - w.x, o.look.z - w.z); }
  u.head.rotation.set((o.nod ?? 0) + 0.04 * Math.sin(R * 0.9 + ph) + (o.down ?? 0), clamp(yaw, -1.1, 1.1) + 0.05 * Math.sin(R * 0.5 + ph), 0.03 * Math.sin(R * 0.7 + ph));
  const talk = o.talk ?? 0, mo = talk * (0.5 + 0.5 * Math.abs(Math.sin(R * 13 + ph) * Math.sin(R * 7.3)));
  u.mouth.scale.set(1, 1 + 6 * mo, 1);
  const blink = (Math.sin(R * 0.8 + ph * 3) > 0.985) ? 0.15 : 1; u.eyes.forEach((e) => e.scale.set(1, blink, 1));
  u.arms.forEach((a, i) => { const s = i ? 1 : -1, gst = (o.gesture ?? 0) * (i === (o.hand ?? 1) ? 1 : 0.25), wave = talk * 0.25 * Math.sin(R * 3.1 + i + ph);
    a.rotation.set((o.arm ?? -0.55) - 0.9 * gst - wave * (i === (o.hand ?? 1) ? 1 : 0.3), 0, s * (0.12 + 0.35 * gst)); a.userData.el.rotation.x = (o.elbow ?? -0.9) - 0.6 * gst + 0.2 * wave; });
}
// a bust for the ad network (head + shoulders), faces +z
let SPI = 0, RNOW = 0;
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
