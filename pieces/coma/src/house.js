// =====================================================================
//  HOUSE — the imagined walk through your family's house (52–57 s). Units: metres, floor y = 0.
//  Front door in the wall z = 0 (camera starts just outside it), a hallway x ∈ [-0.6, 0.6] down to z = -4.6 with framed
//  family photos, a barred window on the right wall; then the kitchen x ∈ [-0.6, 4.2], z ∈ [-8.4, -4.6]: fridge with
//  magnets dead ahead, Talavera counter along the north wall, a wooden table, and the east window with the morning sun.
// =====================================================================
const HC_SUN = dirV(75 * DEG, 21 * DEG);
const HC_GLSL = `float hcH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hcN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hcH(i), hcH(i + vec2(1, 0)), f.x), mix(hcH(i + vec2(0, 1)), hcH(i + vec2(1, 1)), f.x), f.y); }
`;
const HC_FINE = {
  plaster: `{ vec3 n = abs(hWn); vec2 p = n.y > 0.6 ? hWp.xz : (n.x > n.z ? hWp.zy : hWp.xy); float v = hcN(p * 3.0) * 0.5 + hcN(p * 11.0) * 0.3 + hcN(p * 60.0) * 0.2; diffuseColor.rgb *= 0.9 + 0.14 * v; }`,
  wood: `{ vec3 n = abs(hWn); vec2 p = n.y > 0.6 ? hWp.xz : (n.x > n.z ? hWp.zy : hWp.xy); float g = hcN(vec2(p.x * 60.0, p.y * 3.0)) * 0.6 + hcN(vec2(p.x * 200.0, p.y * 8.0)) * 0.4; diffuseColor.rgb *= 0.82 + 0.3 * g; }`,
  woodz: `{ vec3 n = abs(hWn); vec2 p = n.y > 0.6 ? hWp.zx : (n.x > n.z ? hWp.zy : hWp.xy); float g = hcN(vec2(p.y * 60.0, p.x * 3.0)) * 0.6 + hcN(vec2(p.y * 200.0, p.x * 8.0)) * 0.4; diffuseColor.rgb *= 0.82 + 0.3 * g; }`,
};
function hcFine(m, mode) { m.onBeforeCompile = (sh) => {
    sh.vertexShader = 'varying vec3 hWp; varying vec3 hWn;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n hWp = (modelMatrix * vec4(transformed, 1.0)).xyz; hWn = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = 'varying vec3 hWp; varying vec3 hWn;\n' + HC_GLSL + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n' + HC_FINE[mode]); };
  m.customProgramCacheKey = () => 'hc' + mode; return m; }
const hcAdd = (par, geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = mesh(geo, mat, x, y, z, o); par.add(m); return m; };
const hcLathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
function hcTube(pts, rad, seg = 30, rs = 8) { const cur = new THREE.CatmullRomCurve3(pts.map((a) => new THREE.Vector3(...a))), g = new THREE.TubeGeometry(cur, seg, 1, rs, false), p = g.attributes.position;
  for (let i = 0; i <= seg; i++) { const u = i / seg, c = cur.getPointAt(u), r = typeof rad === 'function' ? rad(u) : rad; for (let j = 0; j <= rs; j++) { const k = i * (rs + 1) + j; _v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c); p.setXYZ(k, _v.x, _v.y, _v.z); } }
  g.computeVertexNormals(); return g; }
// a wall along x (axis 'x', at z = c) or along z (axis 'z', at x = c) from a0 to a1 with rectangular holes [h0, h1, y0, y1]
function hcWall(par, mat, axis, c, a0, a1, holes = [], H = 2.7, th = 0.14) {
  const piece = (p0, p1, y0, y1) => { if (p1 - p0 < 0.001 || y1 - y0 < 0.001) return; const L = p1 - p0, m = (p0 + p1) / 2, y = (y0 + y1) / 2;
    if (axis === 'x') hcAdd(par, new THREE.BoxGeometry(L, y1 - y0, th), mat, m, y, c); else hcAdd(par, new THREE.BoxGeometry(th, y1 - y0, L), mat, c, y, m); };
  let cur = a0; holes.slice().sort((a, b) => a[0] - b[0]).forEach(([h0, h1, y0, y1]) => { piece(cur, h0, 0, H); piece(h0, h1, 0, y0); piece(h0, h1, y1, H); cur = h1; }); piece(cur, a1, 0, H); }

// ---- textures
function hcSaltilloTex() { return g3Tex((x, w, h) => { const R = RNG('saltillo'), n = 4, s = w / n; x.fillStyle = '#cbbba0'; x.fillRect(0, 0, w, h);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const hue = R.r(14, 24), sat = R.r(42, 58), li = R.r(40, 50), x0 = i * s + 4, y0 = j * s + 4, ts = s - 8;
    x.save(); x.beginPath(); x.rect(x0, y0, ts, ts); x.clip(); x.fillStyle = `hsl(${hue},${sat}%,${li}%)`; x.fillRect(x0, y0, ts, ts);
    for (let k = 0; k < 14; k++) blot(x, x0 + R.r(0, ts), y0 + R.r(0, ts), R.r(20, 90), R.f() < 0.5 ? 'rgba(90,30,10,0.16)' : 'rgba(255,200,150,0.14)');
    for (let k = 0; k < 500; k++) { x.fillStyle = R.f() < 0.5 ? 'rgba(60,20,5,0.25)' : 'rgba(255,220,180,0.2)'; x.fillRect(x0 + R.r(0, ts), y0 + R.r(0, ts), R.r(1, 3), R.r(1, 3)); }
    const g = x.createLinearGradient(x0, y0, x0 + ts, y0 + ts); g.addColorStop(0, 'rgba(255,230,200,0.12)'); g.addColorStop(1, 'rgba(60,20,0,0.16)'); x.fillStyle = g; x.fillRect(x0, y0, ts, ts);
    x.strokeStyle = 'rgba(70,25,10,0.35)'; x.lineWidth = 3; x.strokeRect(x0 + 1, y0 + 1, ts - 2, ts - 2); x.restore(); } }, 1024, 1024); }
function hcTalaveraTex() { return g3Tex((x, w, h) => { const R = RNG('talav'), n = 4, s = w / n, B = '#1d3b94', Y = '#e8a92a';
  x.fillStyle = '#9a968e'; x.fillRect(0, 0, w, h);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x0 = i * s + 2, y0 = j * s + 2, ts = s - 4, cx = x0 + ts / 2, cy = y0 + ts / 2;
    x.save(); x.beginPath(); x.rect(x0, y0, ts, ts); x.clip(); x.fillStyle = `hsl(42,45%,${R.r(90, 94)}%)`; x.fillRect(x0, y0, ts, ts);
    x.fillStyle = B; [[x0, y0], [x0 + ts, y0], [x0, y0 + ts], [x0 + ts, y0 + ts]].forEach(([px, py]) => { x.beginPath(); x.arc(px, py, ts * 0.28, 0, TAU); x.fill(); x.fillStyle = Y; x.beginPath(); x.arc(px, py, ts * 0.15, 0, TAU); x.fill(); x.fillStyle = B; });
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.fillStyle = k % 2 ? Y : B; x.beginPath(); x.ellipse(cx + Math.cos(a) * ts * 0.18, cy + Math.sin(a) * ts * 0.18, ts * 0.12, ts * 0.055, a, 0, TAU); x.fill(); }
    x.fillStyle = '#2a8a5a'; x.beginPath(); x.arc(cx, cy, ts * 0.07, 0, TAU); x.fill(); x.strokeStyle = B; x.lineWidth = 2.5; x.strokeRect(x0 + 6, y0 + 6, ts - 12, ts - 12);
    for (let k = 0; k < 120; k++) { x.fillStyle = 'rgba(40,40,80,0.08)'; x.fillRect(x0 + R.r(0, ts), y0 + R.r(0, ts), 2, 2); } x.restore(); } }, 512, 512); }
function hcSarapeTex() { return g3Tex((x, w, h) => { const R = RNG('sarape'), pal = ['#c8242c', '#e8562a', '#f2b632', '#2a8a4a', '#1f4f9a', '#d43c7a', '#3a1a2a', '#f4ead4', '#7a2a6a']; let y = 0;
  while (y < h) { const bh = R.f() < 0.35 ? R.r(3, 6) : R.r(14, 40), c = R.pick(pal); x.fillStyle = c; x.fillRect(0, y, w, bh); if (bh > 20 && R.f() < 0.5) { x.fillStyle = R.pick(pal); for (let i = 0; i < w; i += 16) { x.beginPath(); x.moveTo(i, y + bh / 2); x.lineTo(i + 8, y + 3); x.lineTo(i + 16, y + bh / 2); x.lineTo(i + 8, y + bh - 3); x.fill(); } } y += bh; }
  x.fillStyle = '#f4ead4'; x.fillRect(0, 0, 10, h); x.fillRect(w - 10, 0, 10, h);
  for (let k = 0; k < 9000; k++) { x.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'; x.fillRect(R.r(0, w), R.r(0, h), 2, 1); } }, 256, 1024); }
function hcPhotoTex(seed, w, h) { return g3Tex((x) => { const R = RNG('photo' + seed), kind = seed % 4, sep = kind === 3;
  const bg = x.createLinearGradient(0, 0, 0, h);
  if (kind === 0) { bg.addColorStop(0, '#7ab4e0'); bg.addColorStop(0.5, '#cfe4f0'); bg.addColorStop(0.52, '#3a8ab0'); bg.addColorStop(0.64, '#5aa8c0'); bg.addColorStop(0.66, '#e8d4a8'); bg.addColorStop(1, '#d8c090'); }
  else if (kind === 1) { bg.addColorStop(0, '#a8c8e0'); bg.addColorStop(0.35, '#5a8a40'); bg.addColorStop(1, '#3a6a2a'); }
  else if (kind === 2) { bg.addColorStop(0, '#e8b878'); bg.addColorStop(0.7, '#c88850'); bg.addColorStop(1, '#8a5a3a'); }
  else { bg.addColorStop(0, '#b8a080'); bg.addColorStop(1, '#6a5038'); }
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  if (kind === 1) for (let k = 0; k < 14; k++) blot(x, R.r(0, w), h * R.r(0.25, 0.5), R.r(20, 50), 'rgba(30,70,20,0.5)');
  if (kind === 2) { x.fillStyle = 'rgba(240,80,120,0.6)'; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(R.r(0, w), R.r(0, h * 0.3), R.r(6, 12), 0, TAU); x.fill(); } }
  const n = R.i(2, 4), base = h * 0.98;
  for (let i = 0; i < n; i++) { const px = w * (i + 0.5) / n + R.n(w * 0.04), kid = R.f() < 0.35, ph = (kid ? 0.42 : 0.62) * h * R.r(0.92, 1.05), hr = ph * 0.13;
    const skin = sep ? '#c8a888' : R.pick(['#c89070', '#a8704a', '#d8a888', '#8a5a3a']), shirt = sep ? R.pick(['#5a4430', '#8a7258', '#d8c8a8']) : R.pick(['#c83a3a', '#f4f0e4', '#2a5aa0', '#e8b02a', '#3a8a5a', '#d86aa0']);
    x.fillStyle = shirt; x.beginPath(); x.moveTo(px - hr * 1.7, base); x.quadraticCurveTo(px - hr * 1.8, base - ph + hr * 2.4, px, base - ph + hr * 2.1); x.quadraticCurveTo(px + hr * 1.8, base - ph + hr * 2.4, px + hr * 1.7, base); x.fill();
    x.fillStyle = skin; x.beginPath(); x.ellipse(px, base - ph + hr * 1.05, hr * 0.85, hr, 0, 0, TAU); x.fill();
    x.fillStyle = sep ? '#3a2a1a' : R.pick(['#1a120c', '#2a1a10', '#4a3020', '#8a8a8a']); x.beginPath(); x.ellipse(px, base - ph + hr * 0.7, hr * 0.95, hr * 0.7, 0, Math.PI, TAU); x.fill();
    if (R.f() < 0.5) { x.fillRect(px - hr * 0.95, base - ph + hr * 0.6, hr * 0.35, hr * (kid ? 0.8 : 1.6)); x.fillRect(px + hr * 0.6, base - ph + hr * 0.6, hr * 0.35, hr * (kid ? 0.8 : 1.6)); }
    x.fillStyle = 'rgba(40,20,10,0.6)'; x.fillRect(px - hr * 0.35, base - ph + hr * 1.05, hr * 0.14, hr * 0.12); x.fillRect(px + hr * 0.22, base - ph + hr * 1.05, hr * 0.14, hr * 0.12);
    x.strokeStyle = 'rgba(90,30,20,0.6)'; x.lineWidth = 1.2; x.beginPath(); x.arc(px, base - ph + hr * 1.3, hr * 0.3, 0.2, Math.PI - 0.2); x.stroke(); }
  x.fillStyle = sep ? 'rgba(200,160,100,0.2)' : 'rgba(255,230,190,0.14)'; x.fillRect(0, 0, w, h); blot(x, w / 2, h / 2, w * 0.9, 'rgba(0,0,0,0)');
  const v = x.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,20,0,0.35)'); x.fillStyle = v; x.fillRect(0, 0, w, h); }, w, h); }
function hcDrawingTex(seed) { return g3Tex((x, w, h) => { const R = RNG('draw' + seed); x.fillStyle = '#f8f6f0'; x.fillRect(0, 0, w, h); x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = '#e8a020'; x.lineWidth = 5; x.beginPath(); x.arc(w * 0.8, h * 0.18, 16, 0, TAU); x.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.beginPath(); x.moveTo(w * 0.8 + Math.cos(a) * 22, h * 0.18 + Math.sin(a) * 22); x.lineTo(w * 0.8 + Math.cos(a) * 32, h * 0.18 + Math.sin(a) * 32); x.stroke(); }
  if (seed % 2) { x.strokeStyle = '#c83030'; x.lineWidth = 5; x.strokeRect(w * 0.2, h * 0.5, w * 0.45, h * 0.32); x.beginPath(); x.moveTo(w * 0.15, h * 0.52); x.lineTo(w * 0.425, h * 0.3); x.lineTo(w * 0.7, h * 0.52); x.stroke(); x.strokeStyle = '#3a6ac8'; x.strokeRect(w * 0.37, h * 0.65, w * 0.1, h * 0.17); }
  x.strokeStyle = '#3a3a3a'; x.lineWidth = 4; for (let i = 0; i < (seed % 2 ? 2 : 4); i++) { const px = w * (0.2 + i * 0.2) + (seed % 2 ? w * 0.5 : 0), py = h * 0.75, s = R.r(0.8, 1.2) * (seed % 2 ? 0.6 : 1); x.beginPath(); x.arc(px, py - 40 * s, 10 * s, 0, TAU); x.moveTo(px, py - 30 * s); x.lineTo(px, py); x.moveTo(px - 12 * s, py - 20 * s); x.lineTo(px + 12 * s, py - 20 * s); x.moveTo(px, py); x.lineTo(px - 8 * s, py + 16 * s); x.moveTo(px, py); x.lineTo(px + 8 * s, py + 16 * s); x.stroke(); }
  x.strokeStyle = '#3a9a3a'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, h * 0.93); for (let i = 0; i <= 10; i++) x.lineTo(i / 10 * w, h * 0.93 + R.n(4)); x.stroke(); }, 128, 160); }
function hcLeafTex() { return g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const R = RNG('hcmonst');
  x.save(); x.beginPath(); x.moveTo(w / 2, h * 0.98); x.bezierCurveTo(w * 0.02, h * 0.85, w * 0.0, h * 0.25, w * 0.42, h * 0.06); x.quadraticCurveTo(w / 2, h * 0.12, w * 0.58, h * 0.06); x.bezierCurveTo(w * 1.0, h * 0.25, w * 0.98, h * 0.85, w / 2, h * 0.98); x.closePath(); x.clip();
  const g = x.createRadialGradient(w / 2, h * 0.6, 10, w / 2, h * 0.55, w * 0.6); g.addColorStop(0, '#3f7d32'); g.addColorStop(1, '#1f4a1c'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 3000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,255,220' : '0,30,0'},0.05)`; x.fillRect(R.r(0, w), R.r(0, h), 3, 3); }
  x.strokeStyle = 'rgba(190,220,140,0.55)'; x.lineWidth = 7; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, h * 0.1); x.stroke();
  for (let k = 0; k < 7; k++) { const y0 = h * (0.86 - k * 0.11); [-1, 1].forEach((s) => { x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, y0); x.quadraticCurveTo(w / 2 + s * w * 0.22, y0 - h * 0.08, w / 2 + s * w * 0.5, y0 - h * 0.16); x.stroke(); }); }
  x.globalCompositeOperation = 'destination-out'; x.strokeStyle = '#000'; x.lineCap = 'round';
  for (let k = 0; k < 6; k++) { const y0 = h * (0.8 - k * 0.11) - h * 0.055; [-1, 1].forEach((s) => { x.lineWidth = R.r(9, 15); x.beginPath(); x.moveTo(w / 2 + s * w * 0.42, y0 - h * 0.12); x.quadraticCurveTo(w / 2 + s * w * 0.5, y0 - h * 0.15, w / 2 + s * w * 0.6, y0 - h * 0.16); x.stroke(); }); }
  x.restore(); }, 512, 512); }
function hcPicadoTex() { return g3Tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
  for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * w / 8, h); x.lineTo((i + 0.5) * w / 8, h - 14); x.lineTo((i + 1) * w / 8, h); x.fill(); }
  x.beginPath(); x.arc(w / 2, h * 0.45, w * 0.16, 0, TAU); x.fill(); x.globalCompositeOperation = 'source-over'; x.beginPath(); x.arc(w / 2, h * 0.45, w * 0.07, 0, TAU); x.fill(); x.globalCompositeOperation = 'destination-out';
  for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; x.beginPath(); x.ellipse(w / 2 + Math.cos(a) * w * 0.28, h * 0.45 + Math.sin(a) * w * 0.28, 9, 4, a, 0, TAU); x.fill(); }
  for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) { x.beginPath(); x.arc((i + 0.5) * w / 6, j ? h * 0.82 : h * 0.1, 5, 0, TAU); x.fill(); }
  x.fillRect(w * 0.1, h * 0.03, w * 0.8, 3); }, 128, 160); }

// the sun coming through a window: an additive prism from the opening along the light, fading with distance
function hcBeam(sc, corners, L, a = 0.06, col = '#ffd8a0') { const d = HC_SUN.clone().multiplyScalar(-1), pos = [], uu = [], idx = [];
  corners.forEach((c) => { pos.push(c[0], c[1], c[2]); uu.push(0); }); corners.forEach((c) => { pos.push(c[0] + d.x * L, c[1] + d.y * L, c[2] + d.z * L); uu.push(1); });
  [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].forEach(([p, q, r, s]) => idx.push(p, q, r, p, r, s));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aU', new THREE.Float32BufferAttribute(uu, 1)); g.setIndex(idx);
  const m = new THREE.ShaderMaterial({ uniforms: { uA: { value: a }, uC: { value: lin(col) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'attribute float aU; varying float vU; varying vec3 vP; void main(){ vU = aU; vP = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uA; uniform vec3 uC; varying float vU; varying vec3 vP; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9, 78.2))) * 43758.5); } void main(){ float s = 0.75 + 0.25 * sin(vP.z * 9.0 + vP.y * 4.0); gl_FragColor = vec4(uC * uA * pow(1.0 - vU, 1.6) * s, 1.0); }' });
  const b = new THREE.Mesh(g, m); b.renderOrder = 5; b.frustumCulled = false; sc.add(b); return b; }

// =====================================================================
//  the set
// =====================================================================
function hcHouse() { return once('house', () => {
  const st = inStage({ target: new THREE.Vector3(1.8, 0, -4.2), sun: HC_SUN, hemi: 0.16, sky: 0xffe2c0, ground: 0x7a4a30, key: 3.8, keyCol: '#ffd29a', box: 7.5, boxFar: 60, sunDist: 30, top: '#5c96d4', hor: '#f6e0c0', clouds: 0.45 }), sc = st.scene, S = { st };
  st.key.shadow.mapSize.set(4096, 4096); st.key.shadow.radius = 3; st.key.shadow.bias = -0.0002; st.key.shadow.normalBias = 0.02;
  // ---- materials
  const sal = wrap(hcSaltilloTex(), 1, 1), floorM = STDm({ map: sal, bumpMap: sal, bumpScale: 0.004, roughness: 0.55 });
  const hallWall = hcFine(STDm({ color: '#e2d0b2', roughness: 0.95 }), 'plaster'), kitWall = hcFine(STDm({ color: '#d8c096', roughness: 0.95 }), 'plaster'), ceilM = hcFine(STDm({ color: '#f2e8d8', roughness: 0.95 }), 'plaster');
  const band = hcFine(STDm({ color: '#a24a2e', roughness: 0.85 }), 'plaster'), wood = hcFine(STDm({ color: '#7a4a2a', roughness: 0.6 }), 'wood'), woodZ = hcFine(STDm({ color: '#7a4a2a', roughness: 0.6 }), 'woodz');
  const darkWood = hcFine(STDm({ color: '#4a2c18', roughness: 0.6 }), 'wood'), blueP = STDm({ color: '#2a6a88', roughness: 0.5 }), iron = STDm({ color: '#1c1a1a', roughness: 0.5, metalness: 0.6 });
  const lime = STDm({ color: '#6aa83a', roughness: 0.4 }), clay = STDm({ color: '#b8603a', roughness: 0.8 }), glazed = STDm({ color: '#a8502e', roughness: 0.3 });
  // ---- floor, porch, outside ground
  { const g = new THREE.PlaneGeometry(5.6, 9.6).rotateX(-Math.PI / 2), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 5.6 / 1.36, uv.getY(i) * 9.6 / 1.36); hcAdd(sc, g, floorM, 1.8, 0, -3.6, { cast: false }); }
  hcAdd(sc, new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('hcgrass', '#6a8a3a', ['#5a7a30', '#7a9a48', '#4e6a2a', '#8a8a50'], 9000), 50, 50), roughness: 1 }), 0, -0.03, 0, { cast: false });
  hcAdd(sc, new THREE.BoxGeometry(3.2, 0.12, 1.6), STDm({ color: '#b8aa98', roughness: 0.9 }), 0, -0.06, 0.85);
  // ---- walls (height 2.7, 0.14 thick)
  hcWall(sc, hallWall, 'x', 0.07, -3, 3, [[-0.5, 0.5, 0, 2.2]]);                         // front wall with the door opening
  hcWall(sc, hallWall, 'z', -0.67, -8.4, 0.1, [[-3.9, -3.0, 0, 2.1]]);                      // left (west) wall, a closed side door
  hcWall(sc, hallWall, 'z', 0.67, -4.6, 0.1, [[-2.95, -2.0, 1.0, 2.15]]);                   // right hallway wall with the window
  hcWall(sc, kitWall, 'x', -4.67, 0.6, 4.3);                                                // kitchen south wall
  hcWall(sc, kitWall, 'x', -8.47, -0.75, 4.3);                                              // kitchen north wall
  hcWall(sc, kitWall, 'z', 4.27, -8.5, -4.6, [[-7.0, -5.2, 0.95, 2.25]]);                   // kitchen east wall with the sun window
  hcAdd(sc, new THREE.BoxGeometry(1.5, 0.12, 4.75), ceilM, 0, 2.66, -2.3);                  // hallway ceiling
  hcAdd(sc, new THREE.BoxGeometry(5.1, 0.12, 4.0), ceilM, 1.8, 2.76, -6.55);               // kitchen ceiling
  hcAdd(sc, new THREE.BoxGeometry(1.24, 0.1, 0.16), hallWall, 0, 2.65, -4.6);               // hall header
  // painted wainscot band + skirting in the hallway
  [[-0.595, 1], [0.595, -1]].forEach(([x, s]) => { const z0 = s > 0 ? -4.6 : -4.55, z1 = 0; hcAdd(sc, new THREE.BoxGeometry(0.012, 0.9, z1 - z0), band, x, 0.45, (z0 + z1) / 2, { cast: false });
    hcAdd(sc, new THREE.BoxGeometry(0.02, 0.03, z1 - z0), STDm({ color: '#1f4f8a', roughness: 0.5 }), x + s * 0.002, 0.915, (z0 + z1) / 2, { cast: false }); });
  // kitchen: vigas (dark beams) running north–south, a timber lintel over the window
  for (let k = 0; k < 7; k++) hcAdd(sc, new THREE.BoxGeometry(0.14, 0.18, 3.9), woodZ, -0.35 + k * 0.72, 2.62, -6.55);
  hcAdd(sc, new THREE.BoxGeometry(0.18, 0.12, 2.2), darkWood, 4.2, 2.31, -6.1);
  // ---- the front door: carved wood, open inward against the left wall; frame, threshold
  { const dg = new THREE.Group(); dg.position.set(-0.55, 0, -0.05); dg.rotation.y = Math.PI / 2; sc.add(dg);   // hinge at x = -0.48; leaf points toward -z
    hcAdd(dg, new THREE.BoxGeometry(0.96, 2.18, 0.05), wood, 0.48, 1.09, 0);
    [[0.25, 1.55], [0.71, 1.55], [0.25, 0.6], [0.71, 0.6]].forEach(([x, y]) => [-1, 1].forEach((s) => hcAdd(dg, roundedBox(0.34, y > 1 ? 0.75 : 0.85, 0.02, 0.008, 3), darkWood, x, y, s * 0.03)));
    hcAdd(dg, new THREE.SphereGeometry(0.03, 12, 10), STDm({ color: '#c9a45a', metalness: 0.9, roughness: 0.3 }), 0.88, 1.0, 0.05); }
  [[-0.53, 1.1, 0.06, 2.2], [0.53, 1.1, 0.06, 2.2]].forEach(([x, y, w, h]) => hcAdd(sc, new THREE.BoxGeometry(w, h, 0.2), darkWood, x, y, 0.07)); hcAdd(sc, new THREE.BoxGeometry(1.12, 0.08, 0.2), darkWood, 0, 2.22, 0.07);
  hcAdd(sc, new THREE.BoxGeometry(1.0, 0.03, 0.24), STDm({ color: '#8a6a50', roughness: 0.7 }), 0, 0.015, 0.07);
  // side door on the left, closed
  hcAdd(sc, new THREE.BoxGeometry(0.04, 2.08, 0.88), wood, -0.62, 1.04, -3.45); [[1.5], [0.6]].forEach(([y]) => hcAdd(sc, roundedBox(0.02, y > 1 ? 0.7 : 0.8, 0.62, 0.008, 3), darkWood, -0.595, y, -3.45));
  [-3.92, -2.98].forEach((z) => hcAdd(sc, new THREE.BoxGeometry(0.06, 2.12, 0.05), darkWood, -0.58, 1.06, z)); hcAdd(sc, new THREE.BoxGeometry(0.06, 0.05, 1.0), darkWood, -0.58, 2.12, -3.45);
  hcAdd(sc, new THREE.SphereGeometry(0.028, 12, 10), STDm({ color: '#c9a45a', metalness: 0.9, roughness: 0.3 }), -0.57, 1.0, -3.1);
  // ---- hallway window (right wall): blue painted frame, wrought-iron bars outside
  { const z0 = -2.95, z1 = -2.0, y0 = 1.0, y1 = 2.15, zc = (z0 + z1) / 2, x = 0.67;
    [[0.06, y1 - y0, z0 + 0.03], [0.06, y1 - y0, z1 - 0.03], [0.04, y1 - y0, zc]].forEach(([w, h, z]) => hcAdd(sc, new THREE.BoxGeometry(0.08, h, w), blueP, x, (y0 + y1) / 2, z));
    [y0 + 0.03, y1 - 0.03, 1.62].forEach((y) => hcAdd(sc, new THREE.BoxGeometry(0.08, 0.05, z1 - z0), blueP, x, y, zc));
    hcAdd(sc, new THREE.BoxGeometry(0.22, 0.04, z1 - z0 + 0.1), STDm({ color: '#d8c8b0', roughness: 0.8 }), 0.6, y0 - 0.02, zc);
    for (let k = 0; k < 6; k++) hcAdd(sc, new THREE.CylinderGeometry(0.009, 0.009, y1 - y0, 6), iron, 0.79, (y0 + y1) / 2, z0 + 0.08 + k * (z1 - z0 - 0.16) / 5);
    [y0 + 0.2, y1 - 0.2].forEach((y) => hcAdd(sc, new THREE.BoxGeometry(0.015, 0.015, z1 - z0), iron, 0.79, y, zc));
    for (let k = 0; k < 5; k++) hcAdd(sc, new THREE.TorusGeometry(0.06, 0.007, 6, 16).rotateY(Math.PI / 2), iron, 0.79, 1.58, z0 + 0.175 + k * 0.15);
    // little pots on the sill
    [[zc - 0.25, '#4a8a3a'], [zc + 0.22, '#5a9a4a']].forEach(([z, c], i) => { hcAdd(sc, hcLathe([[0.001, 0], [0.05, 0], [0.065, 0.11], [0.001, 0.11]]), i ? glazed : clay, 0.58, y0, z);
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, l = hcAdd(sc, new THREE.SphereGeometry(0.03, 8, 6).scale(0.4, 1.4, 0.2), STDm({ color: c, roughness: 0.6 }), 0.58 + Math.cos(a) * 0.025, y0 + 0.15, z + Math.sin(a) * 0.025); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); } }); }
  // ---- hallway: sarape runner, console table, photos, plant, lanterns
  { const rt = hcSarapeTex(); hcAdd(sc, new THREE.BoxGeometry(0.72, 0.008, 3.6), STDm({ map: rt, roughness: 1 }), 0, 0.004, -2.4, { cast: false });
    const R = RNG('fringe'), fr = IM(new THREE.BoxGeometry(0.006, 0.003, 0.05).translate(0, 0, 0.025), STDm({ color: '#efe4cc', roughness: 1 }), 100, false);
    for (let i = 0; i < 100; i++) { const s = i < 50 ? 1 : -1, k = i % 50; fr.setMatrixAt(i, M4c(-0.35 + k * 0.0143, 0.002, -2.4 + s * 1.8, s > 0 ? R.n(0.2) : Math.PI + R.n(0.2))); } sc.add(fr); }
  { const g = new THREE.Group(); g.position.set(0.4, 0, -1.15); sc.add(g);   // console table against the right wall
    hcAdd(g, new THREE.BoxGeometry(0.28, 0.04, 0.9), wood, 0, 0.8, 0); hcAdd(g, new THREE.BoxGeometry(0.26, 0.14, 0.86), wood, 0, 0.71, 0);
    [-0.4, 0.4].forEach((z) => [-0.11, 0.11].forEach((x) => hcAdd(g, new THREE.BoxGeometry(0.04, 0.64, 0.04), darkWood, x, 0.32, z))); hcAdd(g, new THREE.BoxGeometry(0.22, 0.02, 0.8), wood, 0, 0.18, 0);
    [-0.2, 0.2].forEach((z) => hcAdd(g, new THREE.SphereGeometry(0.014, 8, 6), STDm({ color: '#c9a45a', metalness: 0.9, roughness: 0.3 }), -0.135, 0.71, z));
    hcAdd(g, hcLathe([[0.001, 0], [0.04, 0], [0.09, 0.04], [0.085, 0.045], [0.035, 0.006], [0.001, 0.006]]), STDm({ color: '#1d3b94', roughness: 0.3, side: THREE.DoubleSide }), 0, 0.82, -0.25);
    hcAdd(g, new THREE.TorusGeometry(0.015, 0.004, 6, 12), STDm({ color: '#c8c8c8', metalness: 0.9, roughness: 0.3 }), 0.01, 0.832, -0.24).rotation.x = Math.PI / 2;
    hcAdd(g, hcLathe([[0.001, 0], [0.05, 0], [0.07, 0.06], [0.04, 0.2], [0.02, 0.26], [0.03, 0.28], [0.001, 0.28]]), glazed, 0, 0.82, 0.2);
    const fl = STDm({ color: '#f0a020', roughness: 0.8 }); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, px = Math.cos(a) * 0.06, pz = 0.2 + Math.sin(a) * 0.06; hcAdd(g, hcTube([[0, 1.08, 0.2], [px * 0.6, 1.2, pz * 0.97 + 0.006], [px, 1.28 + (k % 3) * 0.04, pz]], 0.003, 8, 4), STDm({ color: '#4a7a2a' }));
      hcAdd(g, new THREE.SphereGeometry(0.04, 12, 10), fl, px, 1.29 + (k % 3) * 0.04, pz).scale.set(1, 0.75, 1); } }
  // tin-frame mirror above the console
  { const g = new THREE.Group(); g.position.set(0.59, 1.62, -1.15); g.rotation.y = -Math.PI / 2; sc.add(g); const tin = STDm({ color: '#c8c0b0', metalness: 0.85, roughness: 0.35 });
    hcAdd(g, new THREE.CylinderGeometry(0.2, 0.2, 0.02, 40).rotateX(Math.PI / 2), STDm({ color: '#8a96a0', metalness: 1, roughness: 0.08 }), 0, 0, 0.02);
    hcAdd(g, new THREE.TorusGeometry(0.21, 0.02, 8, 48), tin, 0, 0, 0.02); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = hcAdd(g, new THREE.ConeGeometry(0.035, k % 2 ? 0.1 : 0.16, 4).translate(0, 0.27 + (k % 2 ? 0.03 : 0.06), 0), tin, 0, 0, 0.015); r.rotation.z = a; } }
  // the family photos
  { const frames = [
      [-1, -1.15, 1.55, 0.32, 0.42, 0], [-1, -1.6, 1.3, 0.24, 0.18, 1], [-1, -1.62, 1.66, 0.22, 0.28, 2], [-1, -2.05, 1.5, 0.4, 0.3, 3], [-1, -2.55, 1.62, 0.26, 0.34, 4], [-1, -2.55, 1.2, 0.3, 0.22, 5],
      [-1, -4.25, 1.55, 0.34, 0.44, 6], [1, -1.15, 2.08, 0.42, 0.24, 7], [1, -3.4, 1.55, 0.36, 0.46, 8], [1, -3.95, 1.68, 0.26, 0.2, 9], [1, -3.95, 1.36, 0.26, 0.2, 10], [1, -4.35, 1.5, 0.2, 0.26, 11]];
    const fm = [darkWood, STDm({ color: '#c9a45a', metalness: 0.7, roughness: 0.35 }), STDm({ color: '#f2ece0', roughness: 0.5 }), STDm({ color: '#2a2622', roughness: 0.4 })], mat = STDm({ color: '#f6f0e4', roughness: 0.9 });
    frames.forEach(([s, z, y, w, h, i]) => { const g = new THREE.Group(); g.position.set(s * 0.598, y, z); g.rotation.y = -s * Math.PI / 2; g.rotation.z = (i % 3 - 1) * 0.012; sc.add(g); const b = 0.025 + (i % 2) * 0.01;
      hcAdd(g, new THREE.BoxGeometry(w + 2 * b, h + 2 * b, 0.025), fm[i % 4], 0, 0, 0.0125); hcAdd(g, new THREE.PlaneGeometry(w, h), mat, 0, 0, 0.026, { cast: false });
      const pw = w * (i % 3 ? 0.8 : 1), ph = h * (i % 3 ? 0.8 : 1), tw = 256, th = Math.round(256 * ph / pw);
      hcAdd(g, new THREE.PlaneGeometry(pw, ph), STDm({ map: hcPhotoTex(i, tw, th), roughness: 0.35 }), 0, 0, 0.027, { cast: false }); }); }
  // a snake plant in the hall corner by the kitchen
  { const g = new THREE.Group(); g.position.set(-0.36, 0, -4.35); sc.add(g); const R = RNG('sansev');
    hcAdd(g, hcLathe([[0.001, 0], [0.13, 0], [0.16, 0.34], [0.17, 0.36], [0.15, 0.36], [0.001, 0.34]]), clay, 0, 0, 0);
    hcAdd(g, new THREE.CylinderGeometry(0.15, 0.15, 0.01, 24), STDm({ color: '#3a2618', roughness: 1 }), 0, 0.33, 0);
    const lt = g3Tex((x, w, h) => { x.fillStyle = '#2f5a2a'; x.fillRect(0, 0, w, h); for (let k = 0; k < 18; k++) { x.strokeStyle = k % 2 ? 'rgba(160,190,110,0.5)' : 'rgba(20,40,20,0.5)'; x.lineWidth = 4; x.beginPath(); for (let i = 0; i <= w; i += 8) x.lineTo(i, k * h / 18 + Math.sin(i * 0.2 + k) * 4); x.stroke(); } x.fillStyle = '#c8b850'; x.fillRect(0, 0, 4, h); x.fillRect(w - 4, 0, 4, h); }, 64, 256);
    const lm = STDm({ map: lt, roughness: 0.5, side: THREE.DoubleSide });
    for (let k = 0; k < 11; k++) { const h = R.r(0.45, 0.85), sh = new THREE.Shape(); sh.moveTo(-0.035, 0); sh.quadraticCurveTo(-0.045, h * 0.6, 0, h); sh.quadraticCurveTo(0.045, h * 0.6, 0.035, 0); const geo = new THREE.ShapeGeometry(sh, 8), uv = geo.attributes.uv, p = geo.attributes.position;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 0.09 + 0.5, p.getY(i) / h); const a = R.r(0, TAU), r = R.r(0, 0.09), l = hcAdd(g, geo, lm, Math.cos(a) * r, 0.33, Math.sin(a) * r); l.rotation.set(R.n(0.15), R.r(0, TAU), R.n(0.15), 'YXZ'); } }
  // punched-tin star lanterns on the ceiling (off: it's morning)
  [[0, -2.4]].forEach(([x, z]) => { const tin = STDm({ color: '#c8b898', metalness: 0.35, roughness: 0.45 }); hcAdd(sc, new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4), iron, x, 2.5, z);
    const st8 = hcAdd(sc, new THREE.OctahedronGeometry(0.09, 0), tin, x, 2.36, z); st8.scale.set(1, 1.3, 1); for (let k = 0; k < 6; k++) { const c = hcAdd(sc, new THREE.ConeGeometry(0.02, 0.08, 4).translate(0, 0.09, 0), tin, x, 2.36, z); c.rotation.set(k < 4 ? Math.PI / 2 : (k === 4 ? 0 : Math.PI), k * Math.PI / 2, 0); } });
  // ---- KITCHEN ------------------------------------------------------------------
  // the fridge (dead ahead at the end of the hall), with magnets, drawings and a photo
  { const g = new THREE.Group(); g.position.set(-0.18, 0, -8.0); sc.add(g); const enamel = STDm({ color: '#eeeae0', roughness: 0.28 }), chrome = STDm({ color: '#d8d8d8', metalness: 0.95, roughness: 0.2 });
    hcAdd(g, roundedBox(0.76, 1.78, 0.7, 0.05, 6), enamel, 0, 0.92, 0); hcAdd(g, new THREE.BoxGeometry(0.74, 0.008, 0.01), STDm({ color: '#9a968c' }), 0, 1.25, 0.352);
    hcAdd(g, new THREE.BoxGeometry(0.7, 0.06, 0.66), STDm({ color: '#2a2622' }), 0, 0.03, 0);
    [[1.4, 0.24], [0.95, 0.4]].forEach(([y, h]) => { hcAdd(g, new THREE.CylinderGeometry(0.012, 0.012, h, 10), chrome, 0.3, y, 0.39); [-1, 1].forEach((s) => hcAdd(g, new THREE.BoxGeometry(0.02, 0.02, 0.04), chrome, 0.3, y + s * h / 2, 0.37)); });
    const fz = 0.355, R = RNG('magnets');
    [[0, -0.12, 1.55, 0.17, 0.21, -0.06], [1, 0.08, 1.02, 0.17, 0.21, 0.05]].forEach(([s, x, y, w, h, rz]) => { const p = hcAdd(g, new THREE.PlaneGeometry(w, h), STDm({ map: hcDrawingTex(s), roughness: 0.8 }), x, y, fz, { cast: false }); p.rotation.z = rz; });
    const ph = hcAdd(g, new THREE.PlaneGeometry(0.13, 0.1), STDm({ map: hcPhotoTex(13, 256, 196), roughness: 0.4 }), 0.12, 1.62, fz, { cast: false }); ph.rotation.z = 0.08;
    const pp = hcAdd(g, new THREE.PlaneGeometry(0.11, 0.15), STDm({ color: '#f4e4a0', roughness: 0.8 }), -0.2, 0.75, fz, { cast: false }); pp.rotation.z = 0.1;
    const mg = [[-0.12, 1.66, '#d83a3a'], [0.08, 1.12, '#2a7ad8'], [0.12, 1.7, '#f0c020'], [-0.2, 0.83, '#3aa860'], [-0.05, 1.82, '#e86aa8'], [0.2, 1.44, '#f08a2a'], [-0.25, 1.38, '#7a4ac8'], [0.02, 0.6, '#d83a3a'], [-0.08, 1.3, '#f0c020'], [0.22, 0.75, '#2a9a9a']];
    mg.forEach(([x, y, c], i) => { const geo = i % 3 === 0 ? new THREE.SphereGeometry(0.022, 14, 10).scale(1, 1, 0.5) : i % 3 === 1 ? roundedBox(0.045, 0.03, 0.014, 0.006, 3) : new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16).rotateX(Math.PI / 2); hcAdd(g, geo, STDm({ color: c, roughness: 0.35 }), x, y, fz + 0.008); });
    // a little lime-shaped and a chili-shaped magnet
    hcAdd(g, new THREE.SphereGeometry(0.024, 14, 10).scale(1, 0.8, 0.45), STDm({ color: '#5aa83a', roughness: 0.3 }), 0.24, 1.08, fz + 0.01);
    hcAdd(g, hcTube([[-0.27, 1.12, fz + 0.01], [-0.25, 1.06, fz + 0.012], [-0.21, 1.03, fz + 0.01]], (u) => 0.012 * (1 - u * 0.8), 12, 8), STDm({ color: '#c82020', roughness: 0.3 }));
    // stuff on top: a basket, a clay jug
    hcAdd(g, hcLathe([[0.001, 0], [0.14, 0], [0.16, 0.1], [0.15, 0.1], [0.13, 0.01], [0.001, 0.01]]), STDm({ color: '#b08850', roughness: 0.9, side: THREE.DoubleSide }), -0.1, 1.81, -0.05);
    hcAdd(g, hcLathe([[0.001, 0], [0.06, 0], [0.09, 0.08], [0.06, 0.18], [0.035, 0.22], [0.04, 0.24], [0.001, 0.24]]), glazed, 0.2, 1.81, -0.05); }
  // the counter along the north wall: blue cabinet doors, white tiled top with a Talavera edge, Talavera backsplash
  { const K = new THREE.Group(); sc.add(K); const x0 = 0.28, x1 = 3.4, zc = -8.09, D = 0.62, top = STDm({ color: '#f4efe4', roughness: 0.25 }), brass = STDm({ color: '#c9a45a', metalness: 0.9, roughness: 0.3 });
    hcAdd(K, new THREE.BoxGeometry(x1 - x0, 0.84, D - 0.05), STDm({ color: '#d8c8a8', roughness: 0.8 }), (x0 + x1) / 2, 0.44, zc - 0.02);
    hcAdd(K, new THREE.BoxGeometry(x1 - x0, 0.08, 0.02), STDm({ color: '#3a2a20' }), (x0 + x1) / 2, 0.04, zc + D / 2 - 0.06);
    const nd = 6, dw = (x1 - x0) / nd; for (let k = 0; k < nd; k++) { const x = x0 + dw * (k + 0.5); if (k === 2 || k === 3) { hcAdd(K, new THREE.BoxGeometry(dw - 0.02, 0.18, 0.02), blueP, x, 0.77, zc + D / 2 - 0.02); }
      hcAdd(K, roundedBox(dw - 0.02, 0.6, 0.025, 0.006, 3), blueP, x, k === 2 || k === 3 ? 0.38 : 0.45, zc + D / 2 - 0.02); hcAdd(K, roundedBox(dw - 0.14, 0.4, 0.012, 0.004, 3), STDm({ color: '#23607e', roughness: 0.5 }), x, k === 2 || k === 3 ? 0.38 : 0.45, zc + D / 2);
      hcAdd(K, new THREE.SphereGeometry(0.015, 10, 8), brass, x + (k % 2 ? -1 : 1) * (dw / 2 - 0.06), 0.62, zc + D / 2 + 0.01); }
    const tal = hcTalaveraTex(); hcAdd(K, new THREE.BoxGeometry(x1 - x0 + 0.04, 0.05, D + 0.04), top, (x0 + x1) / 2, 0.885, zc);
    { const g = new THREE.PlaneGeometry(x1 - x0 + 0.04, 0.05); hcAdd(K, g, STDm({ map: wrap(tal.clone(), 12, 0.2), roughness: 0.2 }), (x0 + x1) / 2, 0.885, zc + D / 2 + 0.021, { cast: false }); }
    const bs = tal.clone(); bs.needsUpdate = true; wrap(bs, (x1 - x0) / 0.4, 0.7 / 0.4); hcAdd(K, new THREE.PlaneGeometry(x1 - x0, 0.7), STDm({ map: bs, roughness: 0.15, bumpMap: bs, bumpScale: 0.001 }), (x0 + x1) / 2, 1.26, -8.395, { cast: false });
    // sink (a hole is faked by a dark recessed basin) and faucet
    hcAdd(K, new THREE.BoxGeometry(0.6, 0.012, 0.42), STDm({ color: '#b8bcc0', metalness: 0.8, roughness: 0.3 }), 1.6, 0.912, zc + 0.02); hcAdd(K, new THREE.BoxGeometry(0.54, 0.005, 0.36), STDm({ color: '#5a5e62', metalness: 0.8, roughness: 0.4 }), 1.6, 0.92, zc + 0.02);
    hcAdd(K, hcTube([[1.6, 0.91, -8.33], [1.6, 1.2, -8.33], [1.6, 1.26, -8.22], [1.6, 1.18, -8.1]], 0.014, 20, 8), STDm({ color: '#d8d8d8', metalness: 0.95, roughness: 0.2 }));
    // a stove top with a clay pot (olla de barro) and a comal
    hcAdd(K, new THREE.BoxGeometry(0.62, 0.02, 0.5), STDm({ color: '#2a2a2c', roughness: 0.4 }), 2.75, 0.92, zc); [[2.6, -8.2], [2.9, -8.2], [2.6, -7.97], [2.9, -7.97]].forEach(([x, z]) => hcAdd(K, new THREE.TorusGeometry(0.07, 0.008, 6, 20).rotateX(Math.PI / 2), iron, x, 0.935, z));
    hcAdd(K, hcLathe([[0.001, 0], [0.1, 0], [0.16, 0.1], [0.15, 0.2], [0.11, 0.25], [0.12, 0.27], [0.001, 0.27]]), clay, 2.6, 0.93, -8.2); [-1, 1].forEach((s) => hcAdd(K, new THREE.TorusGeometry(0.03, 0.01, 6, 12, Math.PI), clay, 2.6 + s * 0.15, 1.12, -8.2).rotation.set(0, 0, s * Math.PI / 2));
    hcAdd(K, new THREE.CylinderGeometry(0.16, 0.16, 0.012, 32), iron, 2.9, 0.94, -7.97);
    // on the counter: a cutting board with limes, a molcajete, a row of jars, a coffee pot
    hcAdd(K, roundedBox(0.36, 0.025, 0.24, 0.008, 3), wood, 0.85, 0.925, zc + 0.06);
    [[0.8, 0.02], [0.88, 0.07], [0.93, -0.03]].forEach(([x, dz]) => hcAdd(K, new THREE.SphereGeometry(0.028, 14, 10), lime, x, 0.965, zc + 0.06 + dz).scale.set(1, 0.9, 1.15));
    hcAdd(K, hcLathe([[0.001, 0], [0.07, 0.02], [0.11, 0.1], [0.1, 0.11], [0.06, 0.05], [0.001, 0.05]]), STDm({ color: '#4a4644', roughness: 0.95, side: THREE.DoubleSide }), 1.15, 0.91, -8.2);
    [0.42, 0.55, 0.68].forEach((x, i) => { hcAdd(K, new THREE.CylinderGeometry(0.05, 0.05, 0.18 - i * 0.02, 20), new THREE.MeshStandardMaterial({ color: '#d8e0e0', transparent: true, opacity: 0.45, roughness: 0.1 }), x, 1.0 - i * 0.01, -8.28);
      hcAdd(K, new THREE.CylinderGeometry(0.046, 0.046, 0.1 - i * 0.02, 20), STDm({ color: ['#e8d8a8', '#5a3a20', '#c8402a'][i], roughness: 0.9 }), x, 0.96 - i * 0.01, -8.28); hcAdd(K, new THREE.CylinderGeometry(0.052, 0.052, 0.02, 20), wood, x, 1.1 - i * 0.02, -8.28); });
    hcAdd(K, hcLathe([[0.001, 0], [0.08, 0], [0.09, 0.12], [0.06, 0.18], [0.03, 0.2], [0.001, 0.2]]), STDm({ color: '#2a5aa0', roughness: 0.35 }), 3.2, 0.91, -8.15);
    // open shelf over the counter: plates standing, clay jarritos hanging from hooks
    hcAdd(K, new THREE.BoxGeometry(2.3, 0.04, 0.26), wood, 1.9, 1.78, -8.27); [0.9, 2.9].forEach((x) => hcAdd(K, new THREE.BoxGeometry(0.03, 0.14, 0.2), iron, x, 1.71, -8.3));
    const R = RNG('shelf'); for (let k = 0; k < 7; k++) { const p = hcAdd(K, new THREE.CylinderGeometry(0.11, 0.11, 0.015, 28).rotateX(Math.PI / 2), STDm({ map: tal, roughness: 0.25 }), 1.0 + k * 0.05, 1.91, -8.32); p.rotation.x = -0.12; }
    for (let k = 0; k < 4; k++) hcAdd(K, hcLathe([[0.001, 0], [0.05, 0], [0.065, 0.06], [0.05, 0.14], [0.06, 0.18], [0.001, 0.18]]), k % 2 ? glazed : STDm({ color: '#2a6a5a', roughness: 0.35 }), 1.7 + k * 0.17, 1.8, -8.27);
    for (let k = 0; k < 6; k++) { const x = 1.0 + k * 0.28, m = hcAdd(K, hcLathe([[0.001, 0], [0.035, 0], [0.045, 0.05], [0.035, 0.09], [0.04, 0.1], [0.036, 0.1], [0.031, 0.09], [0.04, 0.05], [0.03, 0.006], [0.001, 0.006]]), STDm({ color: k % 2 ? '#a8502e' : '#c06a40', roughness: 0.45, side: THREE.DoubleSide }), x, 1.62, -8.25); m.rotation.x = Math.PI;
      hcAdd(K, new THREE.TorusGeometry(0.02, 0.005, 6, 10), STDm({ color: k % 2 ? '#a8502e' : '#c06a40' }), x + 0.045, 1.57, -8.25); }
    // a calendar-style woven palm basket on the west wall: a dark bowl, braided rim
    hcAdd(sc, new THREE.CylinderGeometry(0.22, 0.2, 0.02, 32).rotateZ(Math.PI / 2), STDm({ color: '#b8904a', roughness: 0.95 }), -0.59, 1.75, -6.1); hcAdd(sc, new THREE.TorusGeometry(0.22, 0.015, 6, 32).rotateY(Math.PI / 2), STDm({ color: '#8a6a30', roughness: 0.95 }), -0.58, 1.75, -6.1); }
  // the east window: blue frame, open shutters, deep sill with herbs; outside a garden wall with bougainvillea
  { const z0 = -7.0, z1 = -5.2, y0 = 0.95, y1 = 2.25, zc = (z0 + z1) / 2, x = 4.27;
    [[0.07, z0 + 0.035], [0.07, z1 - 0.035], [0.05, zc]].forEach(([w, z]) => hcAdd(sc, new THREE.BoxGeometry(0.1, y1 - y0, w), blueP, x, (y0 + y1) / 2, z));
    [y0 + 0.035, y1 - 0.035].forEach((y) => hcAdd(sc, new THREE.BoxGeometry(0.1, 0.07, z1 - z0), blueP, x, y, zc));
    hcAdd(sc, new THREE.BoxGeometry(0.3, 0.05, z1 - z0 + 0.16), STDm({ map: wrap(hcTalaveraTex(), 3, 0.5), roughness: 0.2 }), 4.16, y0 - 0.025, zc);
    // open shutters outside, against the wall
    [[z0, -1], [z1, 1]].forEach(([z, s]) => { const g = new THREE.Group(); g.position.set(4.36, (y0 + y1) / 2, z + s * 0.45); sc.add(g); hcAdd(g, new THREE.BoxGeometry(0.03, y1 - y0, 0.88), blueP, 0, 0, 0);
      for (let k = 0; k < 9; k++) hcAdd(g, new THREE.BoxGeometry(0.035, 0.03, 0.78), STDm({ color: '#235a74', roughness: 0.5 }), 0.012, -0.5 + k * 0.125, 0); });
    // herbs on the sill (cilantro / basil / a cactus)
    [[zc - 0.6, 'herb'], [zc - 0.05, 'cact'], [zc + 0.55, 'herb']].forEach(([z, kind], i) => { hcAdd(sc, hcLathe([[0.001, 0], [0.06, 0], [0.075, 0.13], [0.08, 0.14], [0.001, 0.14]]), i === 1 ? glazed : clay, 4.12, y0, z); const R = RNG('herb' + i);
      if (kind === 'cact') { hcAdd(sc, new THREE.CapsuleGeometry(0.035, 0.14, 6, 12), STDm({ color: '#4a8a4a', roughness: 0.6 }), 4.12, y0 + 0.25, z); hcAdd(sc, new THREE.CapsuleGeometry(0.022, 0.06, 6, 10), STDm({ color: '#4a8a4a', roughness: 0.6 }), 4.12, y0 + 0.25, z + 0.05).rotation.x = 0.7; }
      else { const lm = STDm({ color: '#4a8a32', roughness: 0.6, side: THREE.DoubleSide }), L = []; for (let k = 0; k < 40; k++) { const a = R.r(0, TAU), r = R.r(0, 0.09); L.push(M4c(4.12 + Math.cos(a) * r, y0 + 0.16 + R.r(0, 0.14) - r * 0.4, z + Math.sin(a) * r, R.r(0, TAU), 1, 1, 1, R.r(-0.8, 0.8))); }
        const im = IM(new THREE.CircleGeometry(0.03, 8).scale(0.7, 1, 1), lm, L.length); L.forEach((m, k) => im.setMatrixAt(k, m)); sc.add(im); } });
    // outside: an ochre garden wall topped with bougainvillea, a lemon tree, trees beyond
    hcAdd(sc, new THREE.BoxGeometry(0.3, 1.8, 16), hcFine(STDm({ color: '#d89a5a', roughness: 0.95 }), 'plaster'), 11.5, 0.9, -6);
    const bg = STDm({ map: g3Tex((x, w) => { const Rb = RNG('bougt'); x.fillStyle = '#3a5a2a'; x.fillRect(0, 0, w, w); for (let k = 0; k < 900; k++) { x.fillStyle = `hsl(${Rb.r(318, 338)},${Rb.r(60, 80)}%,${Rb.r(45, 68)}%)`; x.beginPath(); x.ellipse(Rb.r(0, w), Rb.r(0, w), Rb.r(3, 6), Rb.r(2, 4), Rb.r(0, TAU), 0, TAU); x.fill(); } }, 256, 256), roughness: 0.9 }), lg = STDm({ map: leafTex('bougl', '#3a6a2a'), roughness: 0.9 }), R = RNG('bougv');
    for (let k = 0; k < 16; k++) { const b = hcAdd(sc, lumpyGeo(3, 0.3, 300 + k), k % 3 ? bg : lg, 11.3, 1.75 + R.r(-0.1, 0.2), -13 + k * 0.95); b.scale.set(0.45, R.r(0.3, 0.5), R.r(0.5, 0.75)); }
    tree(st, 6.4, -4.2, 0.6, 21); tree(st, 14, -8, 1.2, 22); tree(st, 15, -2, 1.4, 23); tree(st, 14, -13, 1.3, 24); tree(st, 3.5, 3.5, 0.9, 25); tree(st, 4.5, -11.5, 0.9, 26);
    { const lemons = STDm({ color: '#f0d020', roughness: 0.5 }); for (let k = 0; k < 12; k++) hcAdd(sc, new THREE.SphereGeometry(0.06, 10, 8), lemons, 6.4 + R.n(0.7), 2.4 + R.r(0, 0.9), -4.2 + R.n(0.7)).scale.set(1, 1.25, 1); }
    for (let k = 0; k < 10; k++) { const p = hcAdd(sc, lumpyGeo(3, 0.3, 500 + k), lg, 5.2 + R.r(0, 3), 0.3, -12 + k * 1.3); p.scale.set(0.5, 0.45, 0.5); } }
  // the dining table: thick wooden planks, turned legs, four chairs with woven seats; fruit bowl, pan dulce, flowers, mugs
  { const g = new THREE.Group(); g.position.set(2.75, 0, -6.95); sc.add(g); S.table = g; const tw = hcFine(STDm({ color: '#8a5530', roughness: 0.5 }), 'wood');
    for (let k = 0; k < 4; k++) hcAdd(g, new THREE.BoxGeometry(1.6, 0.05, 0.22), tw, 0, 0.76, -0.33 + k * 0.222);
    hcAdd(g, new THREE.BoxGeometry(1.45, 0.08, 0.75), darkWood, 0, 0.7, 0);
    [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].forEach(([x, z]) => hcAdd(g, hcLathe([[0.001, 0], [0.035, 0], [0.03, 0.15], [0.045, 0.25], [0.028, 0.4], [0.04, 0.55], [0.035, 0.74], [0.001, 0.74]], 12), darkWood, x, 0, z));
    const seat = STDm({ map: wrap(g3Tex((x, w, h) => { x.fillStyle = '#c8a050'; x.fillRect(0, 0, w, h); for (let i = 0; i < 32; i++) { x.fillStyle = i % 2 ? 'rgba(120,80,20,0.35)' : 'rgba(255,230,160,0.25)'; x.fillRect(i * w / 32, 0, w / 64, h); x.fillRect(0, i * h / 32, w, h / 64); } }, 128, 128), 2, 2), roughness: 0.95 });
    [[-0.45, -0.62, 0], [0.45, -0.62, 0], [-0.45, 0.62, Math.PI], [0.95, 0.12, -Math.PI / 2 + 0.25]].forEach(([x, z, ry]) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
      hcAdd(c, new THREE.BoxGeometry(0.44, 0.05, 0.42), seat, 0, 0.46, 0); [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]].forEach(([lx, lz]) => hcAdd(c, new THREE.BoxGeometry(0.035, 0.46, 0.035), darkWood, lx, 0.23, lz));
      [-0.2, 0.2].forEach((lx) => hcAdd(c, new THREE.BoxGeometry(0.035, 0.5, 0.035), darkWood, lx, 0.72, -0.19)); [0.68, 0.82, 0.95].forEach((y) => hcAdd(c, new THREE.BoxGeometry(0.42, 0.05, 0.02), tw, 0, y, -0.19)); });
    // fruit bowl: glazed clay, oranges, limes, a mango, bananas
    const by = 0.785; hcAdd(g, hcLathe([[0.001, 0], [0.08, 0], [0.17, 0.08], [0.165, 0.09], [0.075, 0.012], [0.001, 0.012]]), STDm({ map: hcTalaveraTex(), roughness: 0.25, side: THREE.DoubleSide }), -0.1, by, 0.02);
    const orM = STDm({ color: '#f0861a', roughness: 0.45, bumpMap: wrap(texNoise('hcpeel', '#888', ['#666', '#aaa'], 4000), 2, 2), bumpScale: 0.002 });
    [[-0.14, 0.05, 0.0], [-0.04, 0.06, -0.04], [-0.1, 0.06, 0.09], [-0.16, 0.06, -0.08], [-0.09, 0.13, 0.0]].forEach(([dx, dy, dz]) => hcAdd(g, new THREE.SphereGeometry(0.042, 18, 14), orM, -0.1 + dx + 0.1, by + dy, 0.02 + dz));
    [[0.0, 0.07, 0.08], [0.04, 0.06, 0.03]].forEach(([dx, dy, dz]) => hcAdd(g, new THREE.SphereGeometry(0.028, 14, 10), lime, -0.1 + dx, by + dy, 0.02 + dz).scale.set(1, 0.9, 1.15));
    hcAdd(g, new THREE.SphereGeometry(0.05, 18, 14), STDm({ color: '#e8a030', roughness: 0.4, emissive: '#601000', emissiveIntensity: 0.1 }), -0.04, by + 0.11, 0.07).scale.set(1.35, 0.85, 0.95);
    const ban = STDm({ color: '#f0d040', roughness: 0.5 }); for (let k = 0; k < 3; k++) hcAdd(g, hcTube([[-0.25, by + 0.12 + k * 0.012, -0.03 + k * 0.03], [-0.15, by + 0.17, -0.06 + k * 0.035], [-0.02, by + 0.16, -0.08 + k * 0.035], [0.07, by + 0.12, -0.05 + k * 0.03]], (u) => 0.018 * Math.min(1, Math.sin(u * Math.PI) * 2.2) + 0.004, 24, 8), ban);
    // pan dulce on a plate (conchas)
    hcAdd(g, new THREE.CylinderGeometry(0.14, 0.11, 0.015, 32), STDm({ color: '#f4efe4', roughness: 0.25 }), 0.4, 0.792, 0.1); const conch = g3Tex((x, w) => { x.fillStyle = '#f2d8b8'; x.fillRect(0, 0, w, w); x.strokeStyle = '#b88050'; x.lineWidth = 4; for (let k = 0; k < 8; k++) { x.beginPath(); x.arc(w / 2, w, w * (0.15 + k * 0.12), Math.PI, TAU); x.stroke(); } }, 128, 128);
    [[0.36, 0.06, '#f4d8c8'], [0.46, 0.13, '#c8784a'], [0.38, 0.16, '#f6e8d8']].forEach(([x, z, c], i) => { hcAdd(g, new THREE.SphereGeometry(0.055, 20, 10, 0, TAU, 0, Math.PI / 2), STDm({ map: conch, color: c, roughness: 0.85 }), x, 0.8 + (i === 2 ? 0.02 : 0), z).scale.set(1, 0.55, 1); });
    // marigolds (cempasúchil) in a jarrito
    hcAdd(g, hcLathe([[0.001, 0], [0.05, 0], [0.065, 0.07], [0.04, 0.16], [0.05, 0.2], [0.001, 0.2]]), STDm({ color: '#2a6a5a', roughness: 0.3 }), -0.45, 0.785, -0.15);
    const mgM = STDm({ map: g3Tex((x, w) => { x.fillStyle = '#f08a10'; x.fillRect(0, 0, w, w); const R = RNG('marig'); for (let k = 0; k < 400; k++) { x.fillStyle = R.f() < 0.5 ? '#f8b020' : '#c85a08'; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), 4, 2, R.r(0, TAU), 0, TAU); x.fill(); } }, 64, 64), roughness: 0.8 });
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = k ? 0.06 : 0, px = -0.45 + Math.cos(a) * r, pz = -0.15 + Math.sin(a) * r, py = 1.08 + (k % 3) * 0.04; hcAdd(g, hcTube([[-0.45, 0.95, -0.15], [px, py - 0.06, pz]], 0.003, 6, 4), STDm({ color: '#3a6a2a' }));
      hcAdd(g, lumpyGeo(2, 0.25, 70 + k), mgM, px, py, pz).scale.set(0.04, 0.032, 0.04); }
    // two coffee mugs (clay) and a woven placemat
    [[0.15, -0.25], [-0.55, 0.22]].forEach(([x, z], i) => { hcAdd(g, hcLathe([[0.001, 0], [0.035, 0], [0.042, 0.09], [0.039, 0.09], [0.032, 0.006], [0.001, 0.006]], 24), STDm({ color: i ? '#2a5aa0' : '#a8502e', roughness: 0.35, side: THREE.DoubleSide }), x, 0.785, z);
      hcAdd(g, new THREE.CylinderGeometry(0.035, 0.035, 0.004, 20), STDm({ color: '#3a1e0e', roughness: 0.1 }), x, 0.85, z); hcAdd(g, new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI), STDm({ color: i ? '#2a5aa0' : '#a8502e' }), x + 0.042, 0.83, z).rotation.z = -Math.PI / 2; });
    hcAdd(g, new THREE.BoxGeometry(0.42, 0.004, 0.3), STDm({ map: hcSarapeTex(), roughness: 1 }), 0.15, 0.787, -0.22, { cast: false }); }
  // a monstera in the south-east corner and a hanging pothos from a beam
  { const g = new THREE.Group(); g.position.set(3.62, 0, -5.22); sc.add(g); const R = RNG('hcmon');
    hcAdd(g, hcLathe([[0.001, 0], [0.18, 0], [0.22, 0.05], [0.23, 0.45], [0.2, 0.45], [0.19, 0.05], [0.001, 0.05]], 40), STDm({ map: wrap(hcTalaveraTex(), 4, 1), roughness: 0.25 }), 0, 0, 0);
    hcAdd(g, new THREE.CylinderGeometry(0.2, 0.2, 0.01, 32), STDm({ color: '#3a2a1e', roughness: 1 }), 0, 0.42, 0);
    const lm = STDm({ map: hcLeafTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 }), stem = STDm({ color: '#4a7a32', roughness: 0.7 }), lg = new THREE.PlaneGeometry(1, 1, 8, 8).translate(0, 0.5, 0), lp = lg.attributes.position;
    for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), y = lp.getY(i); lp.setZ(i, -0.35 * y * y + 0.18 * Math.abs(x)); } lg.computeVertexNormals();
    for (let k = 0; k < 13; k++) { const a = k / 13 * TAU + R.n(0.3), el = R.r(0.25, 1.0), Ls = R.r(0.5, 1.1), tip = [Math.cos(a) * Math.cos(el) * Ls * 0.42, 0.42 + Math.sin(el) * Ls, Math.sin(a) * Math.cos(el) * Ls * 0.42];
      hcAdd(g, hcTube([[R.n(0.05), 0.42, R.n(0.05)], [tip[0] * 0.4, 0.42 + (tip[1] - 0.42) * 0.7, tip[2] * 0.4], tip], 0.008, 16, 6), stem);
      const lf = hcAdd(g, lg, lm, tip[0], tip[1], tip[2]); lf.scale.setScalar(R.r(0.32, 0.48)); lf.rotation.set(-R.r(0.5, 1.1), Math.atan2(tip[0], tip[2]), R.n(0.3), 'YXZ'); } }
  { const R = RNG('pothos'), x = 0.37, z = -5.6; hcAdd(sc, new THREE.CylinderGeometry(0.003, 0.003, 0.5, 4), STDm({ color: '#c8b890' }), x, 2.28, z);
    hcAdd(sc, hcLathe([[0.001, 0], [0.08, 0], [0.12, 0.12], [0.001, 0.12]]), STDm({ color: '#d8c8a8', roughness: 0.9 }), x, 1.92, z);
    const L = []; for (let s = 0; s < 7; s++) { let px = x + R.n(0.08), py = 2.04, pz = z + R.n(0.08); const n = R.i(6, 14); for (let k = 0; k < n; k++) { L.push(M4c(px + R.n(0.02), py, pz + R.n(0.02), R.r(0, TAU), 1, 1, 1, R.r(-0.7, 0.7))); py -= 0.045; px += R.n(0.02); pz += R.n(0.02); } }
    const im = IM(new THREE.CircleGeometry(0.035, 10).scale(0.8, 1, 1), STDm({ color: '#5a9a3a', roughness: 0.6, side: THREE.DoubleSide }), L.length); L.forEach((m, i) => im.setMatrixAt(i, m)); sc.add(im); }
  // papel picado strung across the kitchen (sun shines through)
  { const tex = hcPicadoTex(), pal = ['#e8306a', '#f08a1a', '#2a9ad8', '#8ac83a', '#a04ad8', '#f0d020'], ps = [], R = RNG('picado');
    [[-5.3, 2.38], [-6.2, 2.42], [-7.2, 2.38]].forEach(([z, y]) => { const xa = -0.5, xb = 4.15, n = 15; hcAdd(sc, hcTube([[xa, y + 0.05, z], [(xa + xb) / 2, y - 0.1, z], [xb, y + 0.05, z]], 0.002, 20, 3), STDm({ color: '#eee' }));
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, sag = 0.15 * 4 * u * (1 - u); ps.push([xa + (xb - xa) * u, y + 0.05 - sag - 0.11, z, R.n(0.15), R.pick(pal)]); } });
    const im = IM(new THREE.PlaneGeometry(0.2, 0.25), STDm({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, emissive: '#ffffff', emissiveIntensity: 0.08 }), ps.length);
    ps.forEach(([x, y, z, r, c], i) => { im.setMatrixAt(i, M4c(x, y, z, r, 1, 1, 1, R.n(0.1))); im.setColorAt(i, lin(c)); }); sc.add(im); }
  // ---- light: warm sun through both windows (shadows), soft warm bounces, sun beams and dust
  const pl = (c, i, d, x, y, z) => { const l = new THREE.PointLight(c, i, d, 2); l.position.set(x, y, z); sc.add(l); };
  pl('#ffc890', 0.9, 5, 2.6, 0.9, -6.0); pl('#ffd8a8', 0.35, 4, 1.0, 2.2, -7.2); pl('#ffcc98', 0.3, 3.5, 0, 2.2, -1.4); pl('#ffcc98', 0.3, 3.5, 0, 2.0, -3.6);
  hcBeam(sc, [[4.25, 2.22, -6.98], [4.25, 2.22, -5.22], [4.25, 0.98, -5.22], [4.25, 0.98, -6.98]], 4.2, 0.12);
  hcBeam(sc, [[0.66, 2.12, -2.93], [0.66, 2.12, -2.02], [0.66, 1.03, -2.02], [0.66, 1.03, -2.93]], 1.3, 0.08);
  { const n = 420, p = new Float32Array(n * 3), R = RNG('hcmote'); for (let i = 0; i < n; i++) { const u = R.f() * 3.5, c = [4.2 - u * 0.9, R.r(1.0, 2.2) - u * 0.38, R.r(-7.0, -5.2) + u * 0.24]; p.set(c, i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    S.motes = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex(), color: '#fff0d0', size: 0.018, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); sc.add(S.motes); }
  hcAdd(sc, new THREE.BoxGeometry(0.06, 2.6, 0.06), darkWood, 0.6, 1.3, -4.6); hcAdd(sc, new THREE.BoxGeometry(0.06, 0.06, 4.6), darkWood, -0.57, 0.03, -2.3);
  sc.updateMatrixWorld(true); sc.traverse((m) => { if (m.isMesh && m.material && m.material.isMeshStandardMaterial) m.material.envMapIntensity = 0.25; if (m.isMesh && m.getWorldPosition(_v).x > 4.6 && m.position.x !== 11.5) m.castShadow = false; });
  // the walk: a curve through the door, down the hall, a right turn into the kitchen
  S.path = new THREE.CatmullRomCurve3([[0, 0, 0.32], [0, 0, -2.0], [0.04, 0, -3.9], [0.5, 0, -5.0], [1.3, 0, -5.6], [2.2, 0, -5.85], [4.0, 0, -6.1]].map((a) => new THREE.Vector3(...a)));
  S.len = S.path.getLength(); return S; }); }

// soft dreamy edges: a blurred copy faded in toward the frame edges, plus a warm haze
let HC_BL = null;
function hcDream(amt = 1) { if (!HC_BL) { HC_BL = document.createElement('canvas'); HC_BL.width = W / 3 | 0; HC_BL.height = H / 3 | 0; }
  const b = HC_BL.getContext('2d'), bw = HC_BL.width, bh = HC_BL.height; b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, bw, bh); b.filter = 'blur(6px)'; b.drawImage(ctx.canvas, 0, 0, bw, bh); b.filter = 'none';
  b.globalCompositeOperation = 'destination-out'; const g = b.createRadialGradient(bw / 2, bh * 0.42, bh * 0.16, bw / 2, bh * 0.45, bh * 0.52); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = g; b.fillRect(0, 0, bw, bh);
  ctx.save(); screen(); ctx.globalAlpha = amt; ctx.drawImage(HC_BL, 0, 0, W, H); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,190,130,${0.07 * amt})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }

SHOT_FN.house = (lt, dur, t) => { const S = hcHouse(), st = S.st;
  // walking at ~1.3 m/s (a soft start), the head turning into the kitchen a little ahead of the body
  const d = Math.min(S.len - 0.2, 1.4 * lt), u = d / S.len, p = S.path.getPointAt(u), q = S.path.getPointAt(Math.min(1, (d + 1.5) / S.len)), tg = S.path.getTangentAt(u);
  const f = 1.9, ph = TAU * f * lt, side = new THREE.Vector3(-tg.z, 0, tg.x);
  const bob = 0.018 * Math.cos(ph), sway = 0.012 * Math.sin(ph / 2), eye = 1.6 + bob;
  const pos = [p.x + side.x * sway, eye, p.z + side.z * sway], tgt = [q.x, 1.38 + 0.25 * (1 - ss(1.0, 4.0, lt)) - 0.25 * ss(3.4, 4.6, lt), q.z];
  S.motes.rotation.y = 0; S.motes.position.set(Math.sin(t * 0.3) * 0.03, Math.sin(t * 0.5) * 0.04, 0);
  camPt(st, pos, tgt, 74, t, 0.5, 52); st.cam.rotation.z += 0.007 * Math.sin(ph / 2) + 0.004 * Math.cos(ph);
  // VSM leaves this closed interior fully shadowed: render this set with soft PCF, then restore the shared renderer's type
  const RR = r3().r, pt = RR.shadowMap.type; RR.shadowMap.type = THREE.PCFSoftShadowMap; renderStage(st, 1.0); RR.shadowMap.type = pt; bloom(0.5); hcDream(0.85);
  if (lt < 0.45) { ctx.save(); screen(); ctx.fillStyle = `rgba(255,244,225,${0.6 * (1 - ss(0, 0.45, lt))})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } };
