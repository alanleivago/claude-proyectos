// =====================================================================
//  WORLD — three.js (styles/pov3d/three.js, global THREE r149) rendered into an offscreen WebGL canvas and drawn
//  onto the 2D canvas under the captions. Everything is built once (G) and posed from R (reference time) each frame.
//  A "frame" is a diorama: a room 16 x 9 units, 7 deep, open at z = 0, inside a dark bezel. Rooms are clones of one
//  prototype (shared geometry and materials), each with its own toy car, black block lattice, white grid and outline.
//  Ghost frames (only what moved) are flat planes with a code-drawn texture and the box's faint edges.
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const RW = 16, RH = 9, RD = 7;              // room width, height, depth
const CAR_Z = -2.6, WOMAN_X = -1.6, WOMAN_Z = -4.4;
function g3Tex(draw, w = 256, h = 256, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: o.r ?? 0.85, metalness: 0, map: o.map ?? null, emissive: o.em ? lin(o.em) : lin('#000000'), emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide });
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: lin(c), transparent: o.tr ?? false, opacity: o.op ?? 1, depthWrite: o.dw ?? true, side: o.side ?? THREE.FrontSide, map: o.map ?? null, toneMapped: false });
function mesh(geo, mat, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  if (o.s) m.scale.set(...o.s); m.castShadow = o.cast ?? true; m.receiveShadow = true; return m;
}

// ---- textures, drawn in code
function texPlaster() {   // grey-blue plaster, mottled
  return g3Tex((x, w, h) => {
    x.fillStyle = '#b3bcc2'; x.fillRect(0, 0, w, h); const R = RNG('plaster');
    for (let i = 0; i < 260; i++) { const px = R.r(0, w), py = R.r(0, h), s = R.r(30, 150), g = x.createRadialGradient(px, py, 0, px, py, s);
      const c = R.f() < 0.5 ? '70,82,96' : '178,188,196'; g.addColorStop(0, `rgba(${c},${R.r(0.03, 0.08)})`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(px - s, py - s, s * 2, s * 2); }
    for (let i = 0; i < 9000; i++) { x.fillStyle = R.f() < 0.5 ? `rgba(60,70,80,${R.r(0.04, 0.1)})` : `rgba(220,226,230,${R.r(0.04, 0.1)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
  }, 1024, 576);
}
function texWood() {   // warm planks running into the room
  return g3Tex((x, w, h) => {
    const R = RNG('wood'), n = 8, pw = w / n;
    for (let i = 0; i < n; i++) { x.fillStyle = pvMix3('#9b6338', '#b67a46', R.f()); x.fillRect(i * pw, 0, pw, h);
      for (let k = 0; k < 26; k++) { x.strokeStyle = `rgba(70,38,18,${R.r(0.05, 0.16)})`; x.lineWidth = R.r(1, 3); x.beginPath(); const x0 = i * pw + R.r(4, pw - 4); x.moveTo(x0, 0); for (let y = 0; y <= h; y += 32) x.lineTo(x0 + Math.sin(y * 0.01 + k) * 4, y); x.stroke(); }
      x.fillStyle = 'rgba(40,20,8,0.55)'; x.fillRect(i * pw, 0, 3, h);
      const cut = R.r(0, h); x.fillRect(i * pw, cut, pw, 3); }
  }, 512, 512, [1, 1]);
}
function pvMix3(a, b, t) { const h = (c, i) => parseInt(c.slice(i, i + 2), 16); return '#' + [1, 3, 5].map((i) => Math.round(lerp(h(a, i), h(b, i), t)).toString(16).padStart(2, '0')).join(''); }
function texKnit() {   // a mustard chevron knit
  return g3Tex((x, w, h) => {
    x.fillStyle = '#c99a2e'; x.fillRect(0, 0, w, h);
    const cw = 32, ch = 24;
    for (let r = 0; r < h / ch + 1; r++) for (let c = 0; c < w / cw; c++) {
      const X = c * cw, Y = r * ch;
      for (const [s, col] of [[1, 'rgba(255,226,140,0.32)'], [-1, 'rgba(90,60,10,0.34)']]) {
        x.strokeStyle = col; x.lineWidth = 5; x.beginPath();
        x.moveTo(X + 2, Y + (s > 0 ? 2 : 6)); x.lineTo(X + cw / 2, Y + ch * 0.62 + (s > 0 ? 0 : 4)); x.lineTo(X + cw - 2, Y + (s > 0 ? 2 : 6)); x.stroke();
      }
    }
  }, 256, 256, [5, 5]);
}
function texPainting() {   // an abstract landscape: teal sky, orange sun, layered hills
  return g3Tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5fb3b8'); g.addColorStop(0.62, '#bfe0d6'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ef7d3c'; x.beginPath(); x.arc(w * 0.68, h * 0.42, h * 0.13, 0, TAU); x.fill();
    const hills = [['#3e7f73', 0.62, 0.08], ['#2f5f5a', 0.72, 0.1], ['#d9a441', 0.84, 0.06]];
    hills.forEach(([c, y0, a], k) => { x.fillStyle = c; x.beginPath(); x.moveTo(0, h); for (let i = 0; i <= 40; i++) { const u = i / 40; x.lineTo(u * w, h * (y0 - a * Math.sin(u * 5 + k * 2) - a * 0.5 * Math.sin(u * 13 + k))); } x.lineTo(w, h); x.fill(); });
  }, 512, 384);
}
function texRug() {
  return g3Tex((x, w, h) => {
    x.fillStyle = '#b4532f'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e9c48d'; x.lineWidth = 10; x.strokeRect(22, 22, w - 44, h - 44);
    x.lineWidth = 4; x.strokeRect(42, 42, w - 84, h - 84); const R = RNG('rug');
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '60,20,8' : '240,170,120'},${R.r(0.05, 0.12)})`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  }, 512, 256);
}

// ---- the room prototype (no car): walls, floor, ceiling, baseboards, rug, side table + lamp, painting, plant, the woman
function buildRoom(T) {
  const g = new THREE.Group();
  const wall = std('#ffffff', { map: T.plaster }), side = std('#d9dfe4', { map: T.plaster });
  g.add(mesh(new THREE.PlaneGeometry(RW, RH), wall, 0, RH / 2, -RD, { cast: false }));
  g.add(mesh(new THREE.PlaneGeometry(RD, RH), side, -RW / 2, RH / 2, -RD / 2, { ry: Math.PI / 2, cast: false }));
  g.add(mesh(new THREE.PlaneGeometry(RD, RH), side, RW / 2, RH / 2, -RD / 2, { ry: -Math.PI / 2, cast: false }));
  g.add(mesh(new THREE.PlaneGeometry(RW, RD), std('#ffffff', { map: T.wood, r: 0.7 }), 0, 0, -RD / 2, { rx: -Math.PI / 2, cast: false }));
  g.add(mesh(new THREE.PlaneGeometry(RW, RD), std('#3a332d'), 0, RH, -RD / 2, { rx: Math.PI / 2, cast: false }));
  const bb = std('#efe9de');
  g.add(mesh(new THREE.BoxGeometry(RW, 0.28, 0.08), bb, 0, 0.14, -RD + 0.04));
  g.add(mesh(new THREE.BoxGeometry(0.08, 0.28, RD), bb, -RW / 2 + 0.04, 0.14, -RD / 2));
  g.add(mesh(new THREE.BoxGeometry(0.08, 0.28, RD), bb, RW / 2 - 0.04, 0.14, -RD / 2));
  g.add(mesh(new THREE.PlaneGeometry(4.6, 2.6), std('#ffffff', { map: T.rug, r: 0.95 }), WOMAN_X + 0.2, 0.012, WOMAN_Z + 0.6, { rx: -Math.PI / 2, cast: false }));
  // side table + lamp, left
  const wood = std('#6b4428', { r: 0.6 }), brass = std('#c9a25a', { r: 0.4 });
  const TX = -5.4, TZ = -5.2;
  g.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 32), wood, TX, 2.05, TZ));
  g.add(mesh(new THREE.CylinderGeometry(0.09, 0.12, 2.0, 12), wood, TX, 1.0, TZ));
  g.add(mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.1, 24), wood, TX, 0.05, TZ));
  g.add(mesh(new THREE.SphereGeometry(0.32, 20, 14), std('#e7dccb', { r: 0.5 }), TX, 2.4, TZ, { s: [1, 0.85, 1] }));
  g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), brass, TX, 2.9, TZ));
  g.add(mesh(new THREE.CylinderGeometry(0.42, 0.78, 0.9, 28, 1, true), std('#fff4dc', { em: '#ffe9bf', ei: 0.85, side: THREE.DoubleSide }), TX, 3.55, TZ));
  // painting, right of centre
  g.add(mesh(new THREE.BoxGeometry(4.3, 3.2, 0.14), std('#2c2119', { r: 0.5 }), 3.4, 5.6, -RD + 0.07));
  g.add(mesh(new THREE.PlaneGeometry(3.9, 2.8), std('#ffffff', { map: T.painting, r: 0.9 }), 3.4, 5.6, -RD + 0.15, { cast: false }));
  // plant, right: a white pot and long leaves
  const PX = 6.3, PZ = -5.4;
  g.add(mesh(new THREE.CylinderGeometry(0.62, 0.48, 1.25, 24), std('#ece6dc', { r: 0.6 }), PX, 0.62, PZ));
  g.add(mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 24), std('#3a2a1e'), PX, 1.22, PZ));
  const leaf = std('#3f7a4a', { r: 0.7, side: THREE.DoubleSide }), leaf2 = std('#2e5f3a', { r: 0.7, side: THREE.DoubleSide });
  { const R = RNG('plant'); for (let i = 0; i < 11; i++) { const a = (i / 11) * TAU + R.n(0.3), tilt = R.r(0.25, 0.75), L = R.r(1.6, 2.6);
    const l = mesh(new THREE.SphereGeometry(1, 16, 10), i % 2 ? leaf : leaf2, 0, 0, 0, { s: [0.28, L * 0.5, 0.05] });
    const piv = new THREE.Group(); piv.position.set(PX, 1.25, PZ); piv.rotation.set(Math.sin(a) * tilt, a, Math.cos(a) * tilt * 0.9); l.position.y = L * 0.5; piv.add(l); g.add(piv); } }
  g.add(buildWoman(T));
  return g;
}
function buildWoman(T) {
  const g = new THREE.Group(); g.position.set(WOMAN_X, 0, WOMAN_Z);
  const skin = std('#a8714f', { r: 0.6 }), knit = std('#ffffff', { map: T.knit, r: 0.95 }), pants = std('#2b3040', { r: 0.8 }), shoe = std('#3b2418', { r: 0.6 }), hair = std('#24170f', { r: 0.7 });
  for (const s of [-1, 1]) {
    g.add(mesh(new THREE.CapsuleGeometry(0.21, 1.55, 6, 16), pants, s * 0.25, 1.0, 0));
    g.add(mesh(new THREE.BoxGeometry(0.36, 0.2, 0.62), shoe, s * 0.26, 0.1, 0.1));
    const arm = mesh(new THREE.CapsuleGeometry(0.155, 1.2, 6, 16), knit, s * 0.68, 2.72, 0, { rz: s * 0.07 }); g.add(arm);
    g.add(mesh(new THREE.SphereGeometry(0.16, 16, 12), skin, s * 0.73, 1.93, 0.02));
  }
  g.add(mesh(new THREE.CylinderGeometry(0.53, 0.47, 1.55, 28), knit, 0, 2.7, 0, { s: [1, 1, 0.72] }));
  g.add(mesh(new THREE.SphereGeometry(0.53, 28, 16, 0, TAU, 0, Math.PI / 2), knit, 0, 3.47, 0, { s: [1, 0.42, 0.72] }));
  g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 14), skin, 0, 3.62, 0));
  g.add(mesh(new THREE.SphereGeometry(0.37, 28, 20), skin, 0, 4.02, 0, { s: [1, 1.12, 1] }));
  g.add(mesh(new THREE.SphereGeometry(0.39, 28, 16, 0, TAU, 0, Math.PI * 0.52), hair, 0, 4.06, -0.02, { s: [1, 1.12, 1.03], rx: -0.18 }));
  g.add(mesh(new THREE.SphereGeometry(0.21, 18, 14), hair, 0, 4.36, -0.3));
  return g;
}
// the toy car: red body, cream roof, black wheels with white hubs (faces +x)
function buildCar() {
  const g = new THREE.Group(), red = std('#d63b26', { r: 0.45 }), cream = std('#f2e8d6', { r: 0.5 }), blk = std('#1b1715', { r: 0.7 }), win = std('#2b3a46', { r: 0.3 });
  const b = new THREE.Group(); b.scale.setScalar(1.55); g.add(b);
  b.add(mesh(new THREE.BoxGeometry(1.5, 0.36, 0.78), red, 0, 0.36, 0));
  b.add(mesh(new THREE.BoxGeometry(0.3, 0.2, 0.7), red, 0.62, 0.5, 0));
  b.add(mesh(new THREE.BoxGeometry(0.82, 0.3, 0.68), red, -0.12, 0.69, 0));
  b.add(mesh(new THREE.BoxGeometry(0.86, 0.06, 0.72), cream, -0.12, 0.86, 0));
  b.add(mesh(new THREE.BoxGeometry(0.7, 0.18, 0.7), win, -0.12, 0.69, 0));
  b.add(mesh(new THREE.BoxGeometry(0.06, 0.08, 0.6), cream, 0.76, 0.38, 0));
  for (const [x, z] of [[-0.46, 0.38], [0.46, 0.38], [-0.46, -0.38], [0.46, -0.38]]) {
    b.add(mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 20), blk, x, 0.19, z, { rx: Math.PI / 2 }));
    b.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12), cream, x, 0.19, z + Math.sign(z) * 0.01, { rx: Math.PI / 2 }));
  }
  return g;
}
// the dark bezel around the opening + the box behind it
function buildBezel() {
  const g = new THREE.Group(), m = std('#1c1712', { r: 0.7 }), t = 0.6, d = RD + 0.3;
  const M = (...a) => { const q = mesh(...a); q.castShadow = false; return q; };
  g.add(M(new THREE.BoxGeometry(RW + 2 * t, t, d), m, 0, RH + t / 2 + 0.03, -d / 2 + 0.01));
  g.add(M(new THREE.BoxGeometry(RW + 2 * t, t, d), m, 0, -t / 2 - 0.03, -d / 2 + 0.01));
  g.add(M(new THREE.BoxGeometry(t, RH + 0.06, d), m, -RW / 2 - t / 2 - 0.03, RH / 2, -d / 2 + 0.01));
  g.add(M(new THREE.BoxGeometry(t, RH + 0.06, d), m, RW / 2 + t / 2 + 0.03, RH / 2, -d / 2 + 0.01));
  g.add(M(new THREE.BoxGeometry(RW + 2 * t, RH + 2 * t, 0.3), m, 0, RH / 2, -d - 0.14));
  return g;
}
// the black egg-crate lattice in the opening: 16 x 9 cells of 1 unit
function buildLattice() {
  const m = std('#0d0b0a', { r: 0.9 }), g = new THREE.Group();
  const v = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, RH, 0.3), m, RW + 1), hz = new THREE.InstancedMesh(new THREE.BoxGeometry(RW, 0.07, 0.3), m, RH + 1);
  for (let i = 0; i <= RW; i++) v.setMatrixAt(i, new THREE.Matrix4().makeTranslation(-RW / 2 + i, RH / 2, -0.12));
  for (let j = 0; j <= RH; j++) hz.setMatrixAt(j, new THREE.Matrix4().makeTranslation(0, j, -0.12));
  v.castShadow = hz.castShadow = false; g.add(v, hz); return g;
}
// the white thin grid flashed on "la imagen completa"
function buildWGrid() {
  const p = []; for (let i = 0; i <= RW; i++) p.push(-RW / 2 + i, 0, 0.05, -RW / 2 + i, RH, 0.05); for (let j = 0; j <= RH; j++) p.push(-RW / 2, j, 0.05, RW / 2, j, 0.05);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0, toneMapped: false }));
}
// a rectangular ring (a highlight around a block) w x h, bar width b; its own material
function buildRing(c, w = 2, h = 2, b = 0.14) {
  const m = basic(c, { tr: true }), g = new THREE.Group();
  for (const [bw, bh, x, y] of [[w + b, b, 0, h / 2], [w + b, b, 0, -h / 2], [b, h + b, -w / 2, 0], [b, h + b, w / 2, 0]]) { const q = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), m); q.position.set(x, y, 0); g.add(q); }
  g.userData.mat = m; return g;
}
// the outline of the opening (white or yellow), its own material
function buildOutline() { return buildRing('#ffffff', RW + 1.2, RH + 1.2, 0.16); }

// ---- ghost frames: a code-drawn texture per (car cell, previous cell)
const GHOST_TEX = {};
function ghostTex(cell, prev) {
  const key = cell + '|' + prev; if (GHOST_TEX[key]) return GHOST_TEX[key];
  const t = g3Tex((x, w, h) => {
    const u = (X) => (X + RW / 2) / RW * w, v = (Y) => h - Y / RH * h, sc = w / RW;
    x.fillStyle = 'rgba(24,22,20,0.62)'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,0.2)'; x.lineWidth = 2;
    for (let i = 1; i < RW; i++) { x.beginPath(); x.moveTo(u(-RW / 2 + i), 0); x.lineTo(u(-RW / 2 + i), h); x.stroke(); }
    for (let j = 1; j < RH; j++) { x.beginPath(); x.moveTo(0, v(j)); x.lineTo(w, v(j)); x.stroke(); }
    x.fillStyle = 'rgba(150,146,140,0.42)';
    x.fillRect(u(1.25), v(7.0), 4.3 * sc, 3.2 * sc);                                  // painting
    x.fillRect(u(-5.5), v(3.9), 0.2 * sc, 3.9 * sc); x.beginPath(); x.moveTo(u(-6.2), v(3.1)); x.lineTo(u(-4.6), v(3.1)); x.lineTo(u(-5.0), v(4.0)); x.lineTo(u(-5.85), v(4.0)); x.fill();   // table lamp
    x.beginPath(); x.ellipse(u(6.3), v(2.4), 1.2 * sc, 1.3 * sc, 0, 0, TAU); x.fill(); x.fillRect(u(5.7), v(1.3), 1.2 * sc, 1.3 * sc);   // plant
    x.beginPath(); x.arc(u(WOMAN_X), v(4.05), 0.4 * sc, 0, TAU); x.fill(); x.fillRect(u(WOMAN_X - 0.55), v(3.5), 1.1 * sc, 1.6 * sc); x.fillRect(u(WOMAN_X - 0.45), v(1.95), 0.9 * sc, 1.95 * sc);   // woman
    x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 5; x.strokeRect(2.5, 2.5, w - 5, h - 5);
    if (prev != null) {   // the previous position, dim, and the cyan hop arrow
      x.fillStyle = 'rgba(150,146,140,0.38)'; x.fillRect(u(prev - 1.1), v(1.2), 2.2 * sc, 0.75 * sc);
      x.strokeStyle = '#3fd0d6'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(u(prev), v(1.7)); x.quadraticCurveTo(u((prev + cell) / 2), v(3.6), u(cell - 0.1), v(2.3)); x.stroke();
      x.fillStyle = '#3fd0d6'; x.beginPath(); x.moveTo(u(cell + 0.25), v(2.05)); x.lineTo(u(cell - 0.45), v(2.05)); x.lineTo(u(cell - 0.05), v(2.7)); x.fill();
    }
    // the block that moved: the car, warm, in a yellow square
    x.fillStyle = '#d63b26'; x.beginPath(); x.roundRect(u(cell - 1.15), v(1.05), 2.3 * sc, 0.6 * sc, 0.12 * sc); x.fill();
    x.beginPath(); x.roundRect(u(cell - 0.6), v(1.55), 1.25 * sc, 0.55 * sc, 0.1 * sc); x.fill(); x.fillStyle = '#2b3a46'; x.fillRect(u(cell - 0.5), v(1.45), 1.05 * sc, 0.3 * sc);
    x.fillStyle = '#f2e8d6'; x.fillRect(u(cell - 0.62), v(1.58), 1.3 * sc, 0.1 * sc);
    for (const dx of [-0.7, 0.7]) { x.fillStyle = '#1b1715'; x.beginPath(); x.arc(u(cell + dx), v(0.45), 0.3 * sc, 0, TAU); x.fill(); x.fillStyle = '#f2e8d6'; x.beginPath(); x.arc(u(cell + dx), v(0.45), 0.12 * sc, 0, TAU); x.fill(); }
    x.strokeStyle = '#f2b632'; x.lineWidth = 8; x.strokeRect(u(cell - 1) + 4, v(2) + 4, 2 * sc, 2 * sc);
  }, 1024, 576);
  return (GHOST_TEX[key] = t);
}

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.NoToneMapping;
  const scene = new THREE.Scene(); scene.background = lin('#0c0a08');
  const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 3000); scene.add(cam);
  const T = { plaster: texPlaster(), wood: texWood(), knit: texKnit(), painting: texPainting(), rug: texRug() };
  T.wood.repeat.set(2, 1);

  // lights: a warm soft sky, a key from the front-left that casts the shadows, a faint cool rim
  scene.add(new THREE.HemisphereLight(0xfff0dc, 0x4a3828, 0.95));
  const key = new THREE.DirectionalLight(0xffe7c8, 1.05); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -14, right: 14, top: 16, bottom: -14, near: 1, far: 120 });
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xbfd2ff, 0.18); rim.position.set(20, 30, -20); scene.add(rim);

  // the floor: dark, with a warm pool of light under the frames
  const floorTex = g3Tex((x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, '#3b2b1d'); g.addColorStop(0.35, '#231910'); g.addColorStop(1, '#0c0a08'); x.fillStyle = g; x.fillRect(0, 0, w, w); }, 512, 512);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), basic('#ffffff', { map: floorTex })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.62; scene.add(floor);

  // prototypes
  const roomP = buildRoom(T), bezelP = buildBezel(), latP = buildLattice(), carP = buildCar();
  // the flat picture of the room (what a frame IS once it is cut into blocks): the room filmed head-on into a texture
  const picScene = new THREE.Scene(); picScene.background = lin('#2a2420');
  picScene.add(new THREE.HemisphereLight(0xfff0dc, 0x4a3828, 0.95));
  const pk = new THREE.DirectionalLight(0xffe7c8, 1.05); pk.position.set(-12, 26, 26); pk.target.position.set(0, 4, -3); pk.castShadow = true;
  pk.shadow.mapSize.set(2048, 2048); pk.shadow.radius = 4; pk.shadow.bias = -0.0004; pk.shadow.normalBias = 0.02; Object.assign(pk.shadow.camera, { left: -14, right: 14, top: 16, bottom: -14, near: 1, far: 120 });
  picScene.add(pk, pk.target);
  const picRoom = roomP.clone(), picCar = carP.clone(); picCar.position.z = CAR_Z; picScene.add(picRoom, picCar);
  const picCam = new THREE.PerspectiveCamera(2 * Math.atan(4.5 / 12) / DEG, RW / RH, 0.1, 100); picCam.position.set(0, 4.5, 12); picCam.lookAt(0, 4.5, 0);
  const PICS = {};
  const pic = (carX) => {
    const k = carX.toFixed(2); if (PICS[k]) return PICS[k];
    const rt = new THREE.WebGLRenderTarget(1280, 720, { samples: 4 }); rt.texture.encoding = THREE.sRGBEncoding;
    picCar.position.x = carX; r.setRenderTarget(rt); r.render(picScene, picCam); r.setRenderTarget(null);
    return (PICS[k] = rt.texture);
  };
  const mkRoom = () => {
    const g = new THREE.Group(), room = roomP.clone(); g.add(room, bezelP.clone());
    const picM = basic('#ffffff'), picP = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), picM); picP.position.set(0, RH / 2, -0.3); picP.visible = false; g.add(picP);
    const car = carP.clone(); car.position.set(0, 0, CAR_Z); g.add(car);
    const lat = latP.clone(); g.add(lat);
    const wg = buildWGrid(); g.add(wg);
    const ol = buildOutline(); ol.position.set(0, RH / 2, 0.08); g.add(ol);
    g.userData = { car, lat, wg, ol, room, picP, picM }; g.visible = false; scene.add(g); return g;
  };
  const rooms = Array.from({ length: 24 }, mkRoom);
  // ghosts: a plane + the faint box edges
  const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(RW, RH, RD)); edgeGeo.translate(0, RH / 2, -RD / 2);
  const mkGhost = () => {
    const g = new THREE.Group(), pm = basic('#ffffff', { tr: true, dw: false, side: THREE.DoubleSide });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), pm); p.position.y = RH / 2; g.add(p);
    const em = new THREE.LineBasicMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0.25, toneMapped: false, depthWrite: false }); g.add(new THREE.LineSegments(edgeGeo, em));
    g.userData = { pm, em }; g.visible = false; scene.add(g); return g;
  };
  const ghosts = Array.from({ length: 30 }, mkGhost);
  // highlight rings, the lifted block, the arc, the patch
  const rings = Array.from({ length: 4 }, (_, i) => { const q = buildRing(i % 2 ? '#3fd0d6' : '#f2b632'); q.visible = false; scene.add(q); return q; });
  const block = new THREE.Group(); {
    const dark = std('#211a14', { r: 0.8 }), bw = std('#ffffff', { map: T.wood });
    block.add(mesh(new THREE.BoxGeometry(2, 0.12, 2), bw, 0, 0.06, 0));
    block.add(mesh(new THREE.BoxGeometry(2, 2, 0.08), std('#ffffff', { map: T.plaster }), 0, 1, -1));
    for (const s of [-1, 1]) block.add(mesh(new THREE.BoxGeometry(0.06, 2, 2), dark, s, 1, 0));
    const c2 = carP.clone(); c2.scale.setScalar(0.62); c2.position.set(0, 0.12, 0.1); block.add(c2);
    block.visible = false; scene.add(block);
  }
  const arcMat = basic('#3fd0d6'), arc = new THREE.Mesh(new THREE.BufferGeometry(), arcMat); arc.visible = false; scene.add(arc);
  const arcHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), arcMat); arcHead.visible = false; scene.add(arcHead);
  const patch = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.08), basic('#f2b632', { tr: true })); patch.visible = false; scene.add(patch);

  // the pixel column: 3,600 cubes (1 cube = 16 pixels of the 240 x 240 piece), 6 x 6 x 100
  const px = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), std('#f0b02a', { r: 0.55, em: '#5a3a00', ei: 0.35 }), 3600);
  { const R = RNG('px'), c = new THREE.Color(); for (let i = 0; i < 3600; i++) { c.set('#f0b02a').offsetHSL(R.n(0.012), 0, R.n(0.05)); px.setColorAt(i, c); } }
  px.castShadow = false; px.visible = false; scene.add(px);

  // the knit as a voxel field: 72 x 120 columns, far away (x = 600)
  const VX = 72, VZ = 120, vox = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std('#ffffff', { r: 0.9 }), VX * VZ);
  vox.castShadow = false; vox.receiveShadow = false; vox.visible = false; scene.add(vox);
  const voxH = new Float32Array(VX * VZ), voxC = []; {
    const R = RNG('vox');
    for (let k = 0; k < VZ; k++) for (let i = 0; i < VX; i++) {
      const ch = Math.abs(((i % 8) - 3.5) / 3.5), rowp = ((k + ch * 3) % 6) / 6, h = 0.8 + 1.6 * Math.abs(Math.sin(rowp * Math.PI)) + R.r(0, 0.9);
      voxH[k * VX + i] = h;
      // the knit's own chevrons: light / mid / dark bands, so the field seen from above reads as the sweater
      const r = R.f(), band = rowp < 0.34 ? '#e3b64a' : rowp < 0.7 ? '#c4962f' : '#9a7021', base = lin(band).offsetHSL(R.n(0.01), R.n(0.04), R.n(0.03));
      voxC.push(r < 0.025 ? lin('#6f7f93') : r < 0.05 ? lin('#8a5a2a') : base);
    }
  }
  const divider = new THREE.Mesh(new THREE.BoxGeometry(0.12, 40, 0.12), basic('#ffffff', { tr: true, op: 0.9 })); divider.visible = false; scene.add(divider);

  // tiny differences on the wall: little yellow squares (in the main room's frame)
  const diffs = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.32, 0.32), basic('#f2b632', { tr: true }), 40); diffs.visible = false; scene.add(diffs);

  // the phone shell (frame A drops into it) and the two last bars (raw / streamed)
  const phone = new THREE.Group(); {
    const pm = std('#121212', { r: 0.35 }), t = 0.9, d = 1.6;
    phone.add(mesh(new THREE.BoxGeometry(RW + 2 * t, t, d), pm, 0, RH + t / 2, -0.4));
    phone.add(mesh(new THREE.BoxGeometry(RW + 2 * t, t, d), pm, 0, -t / 2, -0.4));
    phone.add(mesh(new THREE.BoxGeometry(t, RH + 2 * t, d), pm, -RW / 2 - t / 2, RH / 2, -0.4));
    phone.add(mesh(new THREE.BoxGeometry(t, RH + 2 * t, d), pm, RW / 2 + t / 2, RH / 2, -0.4));
    phone.add(mesh(new THREE.SphereGeometry(0.16, 12, 8), std('#2a2a2a'), -RW / 2 - t / 2, RH / 2, 0.42));
    phone.visible = false; scene.add(phone);
  }
  const rawTex = g3Tex((x, w, h) => { x.fillStyle = '#e9a72b'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { x.fillStyle = 'rgba(120,70,0,0.28)'; x.fillRect(0, y, w, 2); } }, 64, 1024, [1, 8]);
  const raw = new THREE.Mesh(new THREE.BoxGeometry(14, 160, 14), std('#ffffff', { map: rawTex, r: 0.7 })); raw.visible = false; scene.add(raw);
  const stream = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 4.2), std('#3fd0d6', { r: 0.5, em: '#0a5a5e', ei: 0.4 })); stream.visible = false; scene.add(stream);

  G = { r, cv, scene, cam, key, T, pic, rooms, ghosts, rings, block, arc, arcHead, patch, px, vox, voxH, voxC, VX, VZ, divider, diffs, phone, raw, stream, floor };
  return G;
}

// ---- per-frame posing
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _m4 = new THREE.Matrix4(), _s = new THREE.Vector3();
let RI = 0, GI = 0, NI = 0;
function resetWorld() {
  const g = g3(); RI = GI = NI = 0;
  g.rooms.forEach((o) => (o.visible = false)); g.ghosts.forEach((o) => (o.visible = false)); g.rings.forEach((o) => (o.visible = false));
  for (const k of ['block', 'arc', 'arcHead', 'patch', 'px', 'vox', 'divider', 'diffs', 'phone', 'raw', 'stream']) g[k].visible = false;
  g.floor.visible = true;
}
// a parent transform for a group of frames: world = P.pos + rot(P) * local
const POSE0 = { pos: [0, 0, 0], rx: 0, ry: 0, s: 1 };
function place(obj, local, P = POSE0, o = {}) {
  _e.set(P.rx || 0, P.ry || 0, 0); _q.setFromEuler(_e);
  _v.set(...local).multiplyScalar(P.s ?? 1).applyQuaternion(_q).add(_s.set(...P.pos));
  obj.position.copy(_v); obj.quaternion.copy(_q);
  if (o.rx || o.ry) obj.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(o.rx || 0, o.ry || 0, 0)));
  obj.scale.setScalar((P.s ?? 1) * (o.s ?? 1));
}
// a room frame at local position; o: { car, lat, wg, ol: [color, alpha], s }
function useRoom(local, P = POSE0, o = {}) {
  const g = g3(), f = g.rooms[RI++]; if (!f) return null; f.visible = true; place(f, local, P, o);
  const u = f.userData; u.car.position.x = o.car ?? 1.6;
  const flat = !!o.flat; u.room.visible = u.car.visible = !flat; u.picP.visible = flat; if (flat) u.picM.map = g.pic(o.car ?? 1.6);
  u.lat.visible = (o.lat ?? 0) > 0;
  u.wg.material.opacity = o.wg ?? 0; u.wg.visible = (o.wg ?? 0) > 0;
  const [oc, oa] = o.ol ?? ['#ffffff', 0]; u.ol.visible = oa > 0; u.ol.userData.mat.color.set(oc); u.ol.userData.mat.opacity = oa;
  return f;
}
// a ghost frame at local position; o: { cell, prev, a }
function useGhost(local, P = POSE0, o = {}) {
  const g = g3(), f = g.ghosts[GI++]; if (!f) return null; f.visible = true; place(f, local, P, o);
  f.userData.pm.map = ghostTex(o.cell ?? 2, o.prev ?? null); f.userData.pm.opacity = o.a ?? 1; f.userData.em.opacity = 0.28 * (o.a ?? 1);
  return f;
}
// highlight ring i (0, 2 yellow; 1, 3 cyan) on a frame's 2 x 2 block centred at (cx, cy) in frame units
function ringOn(i, frame, cx, cy, a = 1, lift = 0.45) {
  const q = g3().rings[i]; if (a <= 0) return; q.visible = true; q.userData.mat.opacity = a;
  frame.updateMatrixWorld(); q.position.set(cx, cy, lift).applyMatrix4(frame.matrixWorld); q.quaternion.copy(frame.quaternion); q.scale.copy(frame.scale);
}
// world point of a frame-local point
const fpt = (frame, x, y, z) => { frame.updateMatrixWorld(); return new THREE.Vector3(x, y, z).applyMatrix4(frame.matrixWorld); };

// a camera move: keys = [[R, [px,py,pz], [tx,ty,tz], fov], ...]; eased between keys
function camKeys(R, keys) {
  let i = 0; while (i < keys.length - 2 && R > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1] ?? a, u = b === a ? 0 : EZ.io(seg(R, a[0], b[0]));
  const L = (p, q) => p.map((v, k) => lerp(v, q[k], u));
  return { pos: L(a[1], b[1]), tgt: L(a[2], b[2]), fov: lerp(a[3], b[3], u) };
}
function setCam(c, sway = 1) {
  const g = g3(), R = RNOW;
  const s = sway * 0.06, sx = Math.sin(R * 0.7) * s, sy = Math.sin(R * 0.53 + 1) * s * 0.6;
  g.cam.position.set(c.pos[0] + sx, c.pos[1] + sy, c.pos[2]); g.cam.fov = c.fov; g.cam.updateProjectionMatrix();
  g.cam.lookAt(c.tgt[0] + sx * 0.5, c.tgt[1] + sy * 0.5, c.tgt[2]);
  g.cam.updateMatrixWorld();
}
function lightOn(x, y, z) { const g = g3(); g.key.target.position.set(x, y, z); g.key.position.set(x - 12, y + 22, z + 26); g.key.target.updateMatrixWorld(); }
function renderWorld(a = 1) { const g = g3(); g.r.render(g.scene, g.cam); ctx.save(); screen(); ctx.globalAlpha = a; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore(); }
const P2 = (v) => s3Proj(v, g3().cam);
let RNOW = 0;
