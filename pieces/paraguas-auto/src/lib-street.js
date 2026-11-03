// =====================================================================
//  SET STREET — a sunny suburban morning in front of "your" house ("Today, everything goes your way.").
//  The street runs along +X; our side z < 2.6 (sidewalk z −1..1, picket fence z −1.35, lawns, houses facing +Z),
//  road z 2.6..10.6 (top y −0.13), far side z > 10.6 (houses facing −Z). Cross street at x 66..76 (traffic light).
//  Sun low from behind the camera-left (−X, +Z): long shadows down the street, dappled light from the parkway trees.
//  Everything is code: rounded boxes, swept tubes, sphere-clump foliage + alpha leaf cards, canvas textures.
// =====================================================================
let ST = null;
const ST_SUN = new THREE.Vector3(0.55, 0.42, 0.72).normalize();
const stC = (h) => { const c = lin(h); return [c.r, c.g, c.b]; };
const stMix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const stN3 = (x, y, z) => (Math.sin(x * 3.1 + Math.sin(y * 2.3)) + Math.sin(y * 2.7 + Math.sin(z * 1.9)) + Math.sin(z * 3.3 + Math.sin(x * 2.1))) / 3;
function stM(x, y, z, ry = 0, rx = 0, rz = 0, sx = 1, sy = sx, sz = sx) { return new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V3(sx, sy, sz)); }
const stGC = {};
// rounded box (spherified corner bands, smooth normals), uvs in metres per face
function stRBox(w, h, d, r = 0.02, k = 2) {
  const key = ['rb', w, h, d, r, k].join(); if (stGC[key]) return stGC[key];
  r = Math.max(1e-4, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const n = 2 * k + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, hs = [w / 2, h / 2, d / 2];
  const v = [0, 0, 0], q = [0, 0, 0], dd = [0, 0, 0], o = [0, 0, 0];
  for (let i = 0; i < P.count; i++) {
    o[0] = P.getX(i); o[1] = P.getY(i); o[2] = P.getZ(i); const fx = N.getX(i), fy = N.getY(i), fz = N.getZ(i);
    for (let a = 0; a < 3; a++) { const id = Math.round((o[a] + 0.5) * n); let x; if (id <= k) x = -hs[a] + r * id / k; else if (id >= n - k) x = hs[a] - r * (n - id) / k; else x = -hs[a] + r + (2 * hs[a] - 2 * r) * (id - k) / (n - 2 * k); v[a] = x; q[a] = clamp(x, -hs[a] + r, hs[a] - r); dd[a] = x - q[a]; }
    const L = Math.hypot(dd[0], dd[1], dd[2]);
    if (L > 1e-9) { P.setXYZ(i, q[0] + dd[0] / L * r, q[1] + dd[1] / L * r, q[2] + dd[2] / L * r); N.setXYZ(i, dd[0] / L, dd[1] / L, dd[2] / L); } else P.setXYZ(i, v[0], v[1], v[2]);
    const px = P.getX(i), py = P.getY(i), pz = P.getZ(i);
    if (Math.abs(fx) > 0.5) U.setXY(i, -pz * Math.sign(fx), py); else if (Math.abs(fy) > 0.5) U.setXY(i, px, -pz * Math.sign(fy)); else U.setXY(i, px * Math.sign(fz), py);
  }
  return (stGC[key] = g);
}
// merge [geometry, matrix, colour] parts into one geometry (position, normal, uv, color)
function stMerge(parts) {
  let nv = 0, ni = 0; parts.forEach(([g]) => { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let ov = 0, oi = 0; const v = new THREE.Vector3(), nm = new THREE.Matrix3();
  for (const [g, m, c] of parts) {
    nm.getNormalMatrix(m); const P = g.attributes.position, Nn = g.attributes.normal, U = g.attributes.uv, Cc = g.attributes.color, cc = c == null ? [1, 1, 1] : (Array.isArray(c) ? c : stC(c));
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i).applyMatrix4(m); pos[(ov + i) * 3] = v.x; pos[(ov + i) * 3 + 1] = v.y; pos[(ov + i) * 3 + 2] = v.z;
      v.fromBufferAttribute(Nn, i).applyMatrix3(nm).normalize(); nor[(ov + i) * 3] = v.x; nor[(ov + i) * 3 + 1] = v.y; nor[(ov + i) * 3 + 2] = v.z;
      if (U) { uv[(ov + i) * 2] = U.getX(i); uv[(ov + i) * 2 + 1] = U.getY(i); }
      for (let q = 0; q < 3; q++) col[(ov + i) * 3 + q] = cc[q] * (Cc ? Cc.array[i * 3 + q] : 1);
    }
    if (g.index) for (let j = 0; j < g.index.count; j++) idx[oi + j] = g.index.array[j] + ov; else for (let j = 0; j < P.count; j++) idx[oi + j] = j + ov;
    ov += P.count; oi += g.index ? g.index.count : P.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1)); out.computeBoundingSphere();
  return out;
}
function stBatch() { const parts = []; return { parts, add(g, m, c) { parts.push([g, m, c]); return this; }, mesh(mat, cast = true, recv = true) { if (!parts.length) return null; const me = new THREE.Mesh(stMerge(parts), mat); me.castShadow = cast; me.receiveShadow = recv; return me; } }; }
// swept tube with taper (trunks, branches, wires, hydrant bits)
function stTube(pts, rads, seg = 10, uvl = 1) {
  const n = pts.length, pos = [], nor = [], uv = [], idx = [], T = V3(0, 0, 0), B = V3(0, 0, 0), Nn = V3(0, 0, 0), ref = V3(0, 1, 0);
  let L = 0;
  for (let k = 0; k < n; k++) {
    if (k > 0) L += pts[k].distanceTo(pts[k - 1]);
    T.copy(k < n - 1 ? pts[k + 1] : pts[k]).sub(k < n - 1 ? pts[k] : pts[k - 1]).normalize();
    ref.set(0, 1, 0); if (Math.abs(T.y) > 0.9) ref.set(1, 0, 0);
    B.crossVectors(T, ref).normalize(); Nn.crossVectors(B, T).normalize();
    for (let j = 0; j <= seg; j++) { const a = j / seg * TAU, ca = Math.cos(a), sa = Math.sin(a), nx = Nn.x * ca + B.x * sa, ny = Nn.y * ca + B.y * sa, nz = Nn.z * ca + B.z * sa; pos.push(pts[k].x + nx * rads[k], pts[k].y + ny * rads[k], pts[k].z + nz * rads[k]); nor.push(nx, ny, nz); uv.push(j / seg, L / uvl); }
  }
  for (let k = 0; k < n - 1; k++) for (let j = 0; j < seg; j++) { const a = k * (seg + 1) + j, b = a + seg + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}
const stCurve = (P, n = 8) => new THREE.CatmullRomCurve3(P.map((p) => V3(...p))).getPoints(n);
// material patches: wrap (soft translucent) diffuse, and no back-face normal flip (foliage cards, grass)
function stSoft(mat, wrap = 0.45, noFlip = false, key = 'st', trans = 0.0) {
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <lights_physical_pars_fragment>', THREE.ShaderChunk.lights_physical_pars_fragment.replace('reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );', `{ float ndl = dot( geometry.normal, directLight.direction ); float wr = clamp( ( ndl + ${wrap.toFixed(3)} ) / ( 1.0 + ${wrap.toFixed(3)} ), 0.0, 1.0 ); float tr = pow( clamp( dot( -geometry.viewDir, directLight.direction ), 0.0, 1.0 ), 3.0 ) * ${trans.toFixed(3)}; reflectedLight.directDiffuse += ( wr + tr ) * directLight.color * BRDF_Lambert( material.diffuseColor ) + tr * 0.25 * directLight.color * vec3( 0.3, 0.36, 0.05 ); }`));
    if (noFlip) sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', THREE.ShaderChunk.normal_fragment_begin.replace('normal = normal * faceDirection;', ''));
  };
  mat.customProgramCacheKey = () => key + wrap + noFlip + trans;
  return mat;
}

// ---------- code textures
function stTexSiding() { return g3Tex((x, w, h) => { const R = RNG('st-siding'), n = 8, bh = h / n; for (let i = 0; i < n; i++) { const y0 = i * bh, gr = x.createLinearGradient(0, y0, 0, y0 + bh); gr.addColorStop(0, '#8e8e8e'); gr.addColorStop(0.14, '#d0d0d0'); gr.addColorStop(0.8, '#e8e8e8'); gr.addColorStop(1, '#f6f6f6'); x.fillStyle = gr; x.fillRect(0, y0, w, bh); for (let k = 0; k < 26; k++) { x.fillStyle = `rgba(0,0,0,${R.r(0.015, 0.05)})`; x.fillRect(R.r(0, w), y0 + R.r(4, bh - 2), R.r(20, 90), 1); } x.fillStyle = 'rgba(30,30,30,0.6)'; x.fillRect(0, y0, w, 1.5); if (R.f() < 0.5) { x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(R.r(0, w), y0, 1.2, bh); } } }, 256, 256); }
function stTexShingle() { return g3Tex((x, w, h) => { const R = RNG('st-shingle'), rows = 6, rh = h / rows; x.fillStyle = '#5a5a5a'; x.fillRect(0, 0, w, h); for (let i = 0; i < rows; i++) { const off = (i % 2) * 21; for (let s = -1; s < 7; s++) { const x0 = s * 42 + off + R.n(4), v = R.r(150, 225); const gr = x.createLinearGradient(0, i * rh, 0, (i + 1) * rh); gr.addColorStop(0, `rgb(${v * 0.75},${v * 0.75},${v * 0.75})`); gr.addColorStop(0.85, `rgb(${v},${v},${v})`); gr.addColorStop(1, `rgb(${v * 1.05},${v * 1.05},${v * 1.05})`); x.fillStyle = gr; x.fillRect(x0 + 1.5, i * rh, 39, rh - 2.5); for (let k = 0; k < 40; k++) { const q = R.r(60, 255); x.fillStyle = `rgba(${q},${q},${q},0.35)`; x.fillRect(x0 + R.r(2, 40), i * rh + R.r(0, rh - 3), 1.6, 1.6); } } x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(0, (i + 1) * rh - 3, w, 3); } }, 256, 256); }
function stTexConcrete() { return g3Tex((x, w, h) => { const R = RNG('st-conc'); x.fillStyle = '#d6d2ca'; x.fillRect(0, 0, w, h); for (let k = 0; k < 14; k++) { const g = x.createRadialGradient(R.r(0, w), R.r(0, h), 0, R.r(0, w), R.r(0, h), R.r(40, 160)); const v = R.f() < 0.5 ? '0,0,0' : '255,255,255'; g.addColorStop(0, `rgba(${v},${R.r(0.03, 0.07)})`); g.addColorStop(1, `rgba(${v},0)`); x.fillStyle = g; x.fillRect(0, 0, w, h); } for (let k = 0; k < 9000; k++) { const v = R.f() < 0.55 ? `rgba(70,66,60,${R.r(0.1, 0.35)})` : `rgba(255,255,250,${R.r(0.1, 0.4)})`; x.fillStyle = v; const s = R.r(0.8, 2.2); x.fillRect(R.r(0, w), R.r(0, h), s, s); } x.strokeStyle = 'rgba(0,0,0,0.03)'; for (let y = 0; y < h; y += 3) { x.beginPath(); x.moveTo(0, y + R.n(1)); x.lineTo(w, y + R.n(1)); x.stroke(); } x.fillStyle = 'rgba(60,55,50,0.55)'; x.fillRect(0, 0, 4, h); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(4, 0, 2, h); x.fillStyle = 'rgba(60,55,50,0.25)'; x.fillRect(0, 0, w, 2); }, 512, 512); }
function stTexAsphalt() { return g3Tex((x, w, h) => { const R = RNG('st-asph'); x.fillStyle = '#6a6a6c'; x.fillRect(0, 0, w, h); for (let k = 0; k < 10; k++) { const g = x.createRadialGradient(R.r(0, w), R.r(0, h), 0, R.r(0, w), R.r(0, h), R.r(60, 220)); g.addColorStop(0, `rgba(0,0,0,${R.r(0.04, 0.1)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } for (let k = 0; k < 26000; k++) { const v = R.f(); x.fillStyle = v < 0.5 ? `rgba(30,30,32,${R.r(0.2, 0.6)})` : v < 0.93 ? `rgba(150,148,145,${R.r(0.15, 0.5)})` : `rgba(210,205,198,${R.r(0.3, 0.7)})`; const s = R.r(0.8, 2.4); x.fillRect(R.r(0, w), R.r(0, h), s, s); } x.lineCap = 'round'; for (let c = 0; c < 4; c++) { x.strokeStyle = `rgba(20,20,22,${R.r(0.45, 0.75)})`; x.lineWidth = R.r(2, 5); x.beginPath(); let px = R.r(0, w), py = R.r(0, h); x.moveTo(px, py); for (let s = 0; s < 14; s++) { px += R.n(26); py += R.r(8, 26); x.lineTo(px, py); } x.stroke(); } }, 512, 512); }
function stTexGrass() { return g3Tex((x, w, h) => { const R = RNG('st-grass'); x.fillStyle = '#7d7d7d'; x.fillRect(0, 0, w, h); for (let k = 0; k < 7000; k++) { const v = R.r(70, 230), px = R.r(0, w), py = R.r(0, h), l = R.r(3, 8); x.strokeStyle = `rgba(${v},${v},${v},${R.r(0.4, 0.9)})`; x.lineWidth = R.r(0.6, 1.5); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(2.5), py - l); x.stroke(); } }, 256, 256); }
function stTexLeaf() { return g3Tex((x, w, h) => { const R = RNG('st-leaf'); x.clearRect(0, 0, w, h); for (let k = 0; k < 34; k++) { const a = R.r(0, TAU), r = Math.sqrt(R.f()) * w * 0.36, cx = w / 2 + Math.cos(a) * r, cy = h / 2 + Math.sin(a) * r, ang = R.r(0, TAU), L = R.r(w * 0.07, w * 0.12), v = R.r(150, 235); x.save(); x.translate(cx, cy); x.rotate(ang); x.fillStyle = `rgb(${v},${v},${v})`; x.beginPath(); x.moveTo(-L, 0); x.quadraticCurveTo(0, -L * 0.42, L, 0); x.quadraticCurveTo(0, L * 0.42, -L, 0); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.4)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(-L * 0.9, 0); x.lineTo(L * 0.9, 0); x.stroke(); x.fillStyle = 'rgba(0,0,0,0.18)'; x.beginPath(); x.moveTo(-L, 0); x.quadraticCurveTo(0, L * 0.42, L, 0); x.quadraticCurveTo(0, L * 0.1, -L, 0); x.fill(); x.restore(); } }, 128, 128); }
function stTexLeafTile() { return g3Tex((x, w, h) => { const R = RNG('st-leaftile'); x.fillStyle = '#b4b4b4'; x.fillRect(0, 0, w, h); for (let k = 0; k < 300; k++) { const cx = R.r(0, w), cy = R.r(0, h), ang = R.r(0, TAU), L = R.r(14, 26), v = R.r(165, 205); x.save(); x.translate(cx, cy); x.rotate(ang); x.fillStyle = `rgb(${v},${v},${v})`; x.beginPath(); x.moveTo(-L, 0); x.quadraticCurveTo(0, -L * 0.45, L, 0); x.quadraticCurveTo(0, L * 0.45, -L, 0); x.fill(); x.restore(); } }, 256, 256); }
function stTexBark() { return g3Tex((x, w, h) => { const R = RNG('st-bark'); x.fillStyle = '#8a8580'; x.fillRect(0, 0, w, h); for (let k = 0; k < 160; k++) { const px = R.r(0, w), v = R.r(60, 190); x.strokeStyle = `rgba(${v},${v * 0.97},${v * 0.93},${R.r(0.3, 0.8)})`; x.lineWidth = R.r(1, 4); x.beginPath(); x.moveTo(px, 0); for (let y = 0; y <= h; y += 16) x.lineTo(px + R.n(3), y); x.stroke(); } }, 128, 256); }
function stTexBrick() { return g3Tex((x, w, h) => { const R = RNG('st-brick'); x.fillStyle = '#cfc6b8'; x.fillRect(0, 0, w, h); const bh = h / 8, bw = w / 4; for (let i = 0; i < 8; i++) for (let j = -1; j < 5; j++) { const x0 = j * bw + (i % 2) * bw / 2, r = R.r(150, 190), g = r * R.r(0.42, 0.52), b = r * R.r(0.34, 0.42); x.fillStyle = `rgb(${r},${g},${b})`; x.fillRect(x0 + 2, i * bh + 2, bw - 4, bh - 4); for (let k = 0; k < 20; k++) { x.fillStyle = `rgba(0,0,0,${R.r(0.03, 0.12)})`; x.fillRect(x0 + R.r(2, bw - 4), i * bh + R.r(2, bh - 4), 2, 2); } } }, 256, 256); }
function stTexWood() { return g3Tex((x, w, h) => { const R = RNG('st-wood'), n = 8, bh = h / n; for (let i = 0; i < n; i++) { const v = R.r(170, 215); x.fillStyle = `rgb(${v},${v * 0.82},${v * 0.66})`; x.fillRect(0, i * bh, w, bh); for (let k = 0; k < 18; k++) { x.strokeStyle = `rgba(90,60,35,${R.r(0.08, 0.25)})`; x.lineWidth = R.r(0.6, 1.6); const y = i * bh + R.r(2, bh - 2); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + R.n(3), w * 0.6, y + R.n(3), w, y); x.stroke(); } x.fillStyle = 'rgba(40,25,15,0.7)'; x.fillRect(0, i * bh, w, 2); } }, 256, 256); }
function stTexLouver() { return g3Tex((x, w, h) => { const n = 22, bh = h / n; for (let i = 0; i < n; i++) { const g = x.createLinearGradient(0, i * bh, 0, (i + 1) * bh); g.addColorStop(0, '#606060'); g.addColorStop(0.3, '#f0f0f0'); g.addColorStop(1, '#a8a8a8'); x.fillStyle = g; x.fillRect(0, i * bh, w, bh); } x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, 8, h); x.fillRect(w - 8, 0, 8, h); x.fillRect(0, 0, w, 8); x.fillRect(0, h - 8, w, 8); x.fillRect(0, h / 2 - 5, w, 10); }, 64, 256); }
// window interiors (4 variants side by side): dim room, curtains with folds, sky reflection streaks
function stTexWindow() {
  return g3Tex((x, w, h) => {
    const R = RNG('st-window'), cw = w / 4;
    const curt = ['#f3ede2', '#e9dfcf', '#dfe8ee', '#f2e3d8'], room = ['#4a3c34', '#3d3a3e', '#4b4038', '#3a3632'];
    for (let v = 0; v < 4; v++) {
      const x0 = v * cw, g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, room[v]); g.addColorStop(1, '#1e1a18'); x.fillStyle = g; x.fillRect(x0, 0, cw, h);
      if (v === 1) { x.fillStyle = 'rgba(255,220,160,0.25)'; x.beginPath(); x.ellipse(x0 + cw * 0.55, h * 0.45, 22, 30, 0, 0, TAU); x.fill(); }
      if (v === 2) { x.fillStyle = 'rgba(40,70,40,0.9)'; x.beginPath(); x.ellipse(x0 + cw * 0.5, h * 0.78, 16, 24, 0, 0, TAU); x.fill(); x.fillStyle = '#7a4a32'; x.fillRect(x0 + cw * 0.5 - 9, h * 0.86, 18, 20); }
      [0, 1].forEach((s) => { const wd = cw * R.r(0.26, 0.34), xa = s ? x0 + cw - wd : x0; for (let i = 0; i < wd; i += 2) { const f = 0.78 + 0.22 * Math.sin(i * 0.55 + v), c = lin(curt[v]); x.fillStyle = `rgb(${Math.round(240 * f * (0.92 + v * 0.02))},${Math.round(232 * f)},${Math.round(218 * f + v * 6)})`; x.fillRect(xa + i, 0, 2, h); } });
      x.fillStyle = curt[v]; x.fillRect(x0, 0, cw, h * 0.07);
      const r = x.createLinearGradient(x0, 0, x0 + cw, h); r.addColorStop(0, 'rgba(210,228,245,0.55)'); r.addColorStop(0.35, 'rgba(210,228,245,0.08)'); r.addColorStop(0.55, 'rgba(255,255,255,0.22)'); r.addColorStop(0.62, 'rgba(255,255,255,0.03)'); r.addColorStop(1, 'rgba(200,220,240,0.18)'); x.fillStyle = r; x.fillRect(x0, 0, cw, h);
    }
  }, 512, 256);
}
function stTexBill() {
  return g3Tex((x, w, h) => {
    x.fillStyle = '#d9dccb'; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.6); g.addColorStop(0, 'rgba(255,250,235,0.5)'); g.addColorStop(1, 'rgba(120,140,110,0.25)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#3f5a44'; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20); x.lineWidth = 1; for (let i = 0; i < 70; i++) { x.strokeStyle = 'rgba(60,90,70,0.35)'; x.beginPath(); x.ellipse(w / 2, h / 2, 40 + i * 3.4, 18 + i * 1.3, 0, 0, TAU); x.stroke(); }
    x.fillStyle = '#d9dccb'; x.beginPath(); x.ellipse(w / 2, h / 2, 62, 78, 0, 0, TAU); x.fill(); x.strokeStyle = '#3f5a44'; x.lineWidth = 4; x.stroke();
    x.fillStyle = '#4c6550'; x.beginPath(); x.ellipse(w / 2 - 2, h / 2 - 16, 26, 32, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(w / 2 - 50, h / 2 + 70); x.quadraticCurveTo(w / 2, h / 2 + 4, w / 2 + 50, h / 2 + 70); x.fill();
    x.fillStyle = '#2f4a36'; x.font = 'bold 46px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; [[52, 48], [w - 52, 48], [52, h - 46], [w - 52, h - 46]].forEach(([px, py]) => x.fillText('20', px, py));
    x.font = 'bold 20px Georgia'; x.fillText('THE UNITED STATES OF AMERICA', w / 2, 34); x.font = 'bold 22px Georgia'; x.fillText('TWENTY DOLLARS', w / 2, h - 30);
    x.fillStyle = '#2f6a46'; x.beginPath(); x.arc(w * 0.75, h * 0.6, 26, 0, TAU); x.fill(); x.fillStyle = '#2a2a2a'; x.beginPath(); x.arc(w * 0.25, h * 0.55, 24, 0, TAU); x.fill();
    x.fillStyle = '#2f6a46'; x.font = '15px Georgia'; x.fillText('MK 07734123 A', w * 0.2, h * 0.3); x.fillText('MK 07734123 A', w * 0.8, h * 0.78);
  }, 512, 216);
}
function stTexCoin() {   // bump/roughness relief for the quarter's face (r: 0..1)
  return g3Tex((x, w, h) => {
    const c = w / 2; x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(c, c, c * 0.84, c, c, c); g.addColorStop(0, '#7a7a7a'); g.addColorStop(0.35, '#e8e8e8'); g.addColorStop(0.8, '#ffffff'); g.addColorStop(1, '#bdbdbd'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) { const a = i / 120 * TAU; x.fillStyle = '#9a9a9a'; x.beginPath(); x.arc(c + Math.cos(a) * c * 0.8, c + Math.sin(a) * c * 0.8, 1.2, 0, TAU); x.fill(); }
    x.save(); x.filter = 'blur(1.5px)'; x.fillStyle = '#e6e6e6'; x.beginPath();   // profile bust, facing left
    x.moveTo(c + 30, c + 72); x.bezierCurveTo(c + 40, c + 40, c + 52, c + 20, c + 46, c - 14); x.bezierCurveTo(c + 44, c - 52, c + 18, c - 78, c - 14, c - 70); x.bezierCurveTo(c - 34, c - 64, c - 40, c - 40, c - 38, c - 26);
    x.lineTo(c - 50, c - 6); x.lineTo(c - 40, c - 2); x.bezierCurveTo(c - 44, c + 8, c - 38, c + 16, c - 34, c + 18); x.bezierCurveTo(c - 38, c + 30, c - 26, c + 40, c - 12, c + 38); x.bezierCurveTo(c - 10, c + 52, c - 4, c + 62, c - 20, c + 76); x.closePath(); x.fill();
    x.fillStyle = '#c4c4c4'; x.beginPath(); x.moveTo(c + 46, c - 10); x.bezierCurveTo(c + 62, c + 10, c + 56, c + 34, c + 40, c + 40); x.bezierCurveTo(c + 50, c + 14, c + 44, c, c + 36, c - 6); x.fill(); x.restore();
    x.fillStyle = '#e0e0e0'; x.font = 'bold 26px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const arc = (s, r, a0, step, flip) => { for (let i = 0; i < s.length; i++) { const a = a0 + i * step; x.save(); x.translate(c + Math.cos(a) * r, c + Math.sin(a) * r); x.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2)); x.fillText(s[i], 0, 0); x.restore(); } };
    arc('LIBERTY', c * 0.66, -Math.PI / 2 - 0.62, 0.2, false); x.font = 'bold 22px Georgia'; arc('2026', c * 0.66, Math.PI / 2 + 0.3, -0.2, true);
    x.font = 'bold 14px Georgia'; x.save(); x.translate(c - 62, c + 22); x.fillText('IN GOD', 0, -8); x.fillText('WE TRUST', 0, 8); x.restore();
  }, 256, 256, false);
}

// ---------- foliage: sphere clumps (soft volumetric normals) + alpha leaf cards. o: c, r, n, cr, cards, cs, pal, seed, det, box, flat
function stFoliage(o) {
  const R = RNG('st-fol', o.seed), c = o.c, r = o.r, pd = stC(o.pal[0]), pm = stC(o.pal[1]), pt = stC(o.pal[2]);
  const canN = (x, y, z, out) => { const ux = (x - c[0]) / r[0], uy = (y - c[1]) / r[1], uz = (z - c[2]) / r[2]; if (o.box) out.set(ux ** 3 / r[0], uy ** 3 / r[1], uz ** 3 / r[2]); else out.set(ux / r[0], uy / r[1], uz / r[2]); if (out.lengthSq() < 1e-12) out.set(0, 1, 0); return out.normalize(); };
  const kIn = (x, y, z) => { const ux = (x - c[0]) / r[0], uy = (y - c[1]) / r[1], uz = (z - c[2]) / r[2]; return o.box ? Math.pow(ux ** 4 + uy ** 4 + uz ** 4, 0.25) : Math.hypot(ux, uy, uz); };
  const colAt = (x, y, z, nk, j) => { const k = kIn(x, y, z), ao = ss(0.35, 1.0, k); let cc = stMix(pd, pm, ao); cc = stMix(cc, pt, clamp(0.55 * clamp(nk.y * 0.6 + 0.4) * ao + j)); return cc; };
  const sph = stGC.sph || (stGC.sph = new THREE.SphereGeometry(1, o.det === 2 ? 14 : 18, o.det === 2 ? 10 : 13)), sp = sph.attributes.position, sn = sph.index.array;
  const P = [], N = [], C = [], U = [], I = [], cl = [], nk = V3(0, 0, 0), nn = V3(0, 0, 0);
  for (let i = 0; i < o.n; i++) {
    let cc;
    if (o.box) cc = [c[0] + R.r(-1, 1) * r[0] * 0.8, c[1] + R.r(-0.6, 0.9) * r[1] * 0.75, c[2] + R.r(-1, 1) * r[2] * 0.7];
    else { const u = R.r(-0.45, 1), a = R.r(0, TAU), q = Math.sqrt(1 - u * u), rr = R.r(0.42, 0.78); cc = [c[0] + q * Math.cos(a) * r[0] * rr, c[1] + u * r[1] * rr, c[2] + q * Math.sin(a) * r[2] * rr]; }
    const cr = R.r(o.cr[0], o.cr[1]), sd = R.r(0, 50), jit = R.n(0.08), base = P.length / 3; cl.push([cc, cr, base]);
    for (let v = 0; v < sp.count; v++) {
      const px = sp.getX(v), py = sp.getY(v), pz = sp.getZ(v), d = 1 + 0.17 * stN3(px * 2.3 + sd, py * 2.3, pz * 2.3 - sd);
      let x = cc[0] + px * cr * d, y = cc[1] + py * cr * d * 0.92, z = cc[2] + pz * cr * d;
      if (o.flat) y = Math.max(y, c[1] - r[1] * o.flat);
      canN(x, y, z, nk); nn.set(px, py, pz).lerp(nk, 0.5).normalize();
      P.push(x, y, z); N.push(nn.x, nn.y, nn.z); const col = colAt(x, y, z, nk, jit); C.push(...col); U.push(Math.atan2(pz, px) / TAU * 2.5, py * 1.2);
    }
    for (let q = 0; q < sn.length; q++) I.push(sn[q] + base);
  }
  // occlusion where clumps intersect (darkens the creases between clumps)
  cl.forEach(([cc, cr, base], i) => { for (let v = 0; v < sp.count; v++) { const q = base + v, x = P[q * 3], y = P[q * 3 + 1], z = P[q * 3 + 2]; let oc = 1; cl.forEach(([c2, r2], j) => { if (j === i) return; const dd = Math.hypot(x - c2[0], y - c2[1], z - c2[2]) / r2; if (dd < 1.35) oc = Math.min(oc, 0.42 + 0.58 * ss(0.8, 1.35, dd)); }); C[q * 3] *= oc; C[q * 3 + 1] *= oc; C[q * 3 + 2] *= oc; } });
  const blob = new THREE.BufferGeometry(); blob.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); blob.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); blob.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); blob.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); blob.setIndex(I);
  const CP = [], CN = [], CC = [], CU = [], CI = [], d = V3(0, 0, 0), t1 = V3(0, 0, 0), t2 = V3(0, 0, 0), pn = V3(0, 0, 0);
  let made = 0, tries = 0;
  while (made < o.cards && tries++ < o.cards * 6) {
    const [cc, cr] = cl[Math.floor(R.f() * cl.length)], u = R.r(-0.5, 1), a = R.r(0, TAU), q = Math.sqrt(1 - u * u);
    d.set(q * Math.cos(a), u, q * Math.sin(a)); const f = cr * R.r(0.92, 1.12), x = cc[0] + d.x * f, y = cc[1] + d.y * f * 0.92, z = cc[2] + d.z * f;
    if (kIn(x, y, z) < 0.72) continue;
    canN(x, y, z, nk); pn.copy(d).lerp(nk, 0.5).add(V3(R.n(0.7), R.n(0.7), R.n(0.7))).normalize();
    t1.set(0, 1, 0).cross(pn); if (t1.lengthSq() < 1e-4) t1.set(1, 0, 0); t1.normalize(); t2.crossVectors(pn, t1).normalize();
    const rot = R.r(0, TAU), s = R.r(o.cs[0], o.cs[1]) / 2, ca = Math.cos(rot) * s, sa = Math.sin(rot) * s, base = CP.length / 3;
    nn.copy(d).lerp(nk, 0.6).normalize(); const col = colAt(x, y, z, nk, R.n(0.07) + 0.02);
    [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]].forEach(([i, j, uu, vv]) => { const e1 = i * ca - j * sa, e2 = i * sa + j * ca; CP.push(x + t1.x * e1 + t2.x * e2, y + t1.y * e1 + t2.y * e2, z + t1.z * e1 + t2.z * e2); CN.push(nn.x, nn.y, nn.z); CC.push(...col); CU.push(uu, vv); });
    CI.push(base, base + 1, base + 2, base, base + 2, base + 3); made++;
  }
  const cards = new THREE.BufferGeometry(); cards.setAttribute('position', new THREE.Float32BufferAttribute(CP, 3)); cards.setAttribute('normal', new THREE.Float32BufferAttribute(CN, 3)); cards.setAttribute('color', new THREE.Float32BufferAttribute(CC, 3)); cards.setAttribute('uv', new THREE.Float32BufferAttribute(CU, 2)); cards.setIndex(CI);
  const m1 = new THREE.Mesh(blob, ST.mat.fol), m2 = new THREE.Mesh(cards, ST.mat.leaf);
  m1.castShadow = m2.castShadow = o.cast !== false; m1.receiveShadow = m2.receiveShadow = true;
  ST.scene.add(m1, m2);
  return [m1, m2];
}
const ST_PAL = { green: ['#2a4f22', '#4f8a32', '#93bd52'], deep: ['#223f1e', '#3f7430', '#86b04c'], lime: ['#3a5a20', '#6c9c36', '#adc862'], blossom: ['#d27c94', '#ffb3c9', '#fff2f5'], hedge: ['#1f3b1c', '#3b6b2c', '#7fa84a'], gold: ['#6a5a20', '#b8a03c', '#f0dc84'] };
function stTree(seed, x, z, s = 1, pal = 'green', lod = 0) {
  const R = RNG('st-tree', seed), th = R.r(2.3, 2.9) * s, lean = [R.n(0.25), R.n(0.25)];
  const bark = stBatch();
  bark.add(stTube(stCurve([[0, -0.2, 0], [lean[0] * 0.3, th * 0.5, lean[1] * 0.3], [lean[0], th, lean[1]]], 6), [0.3, 0.24, 0.21, 0.19, 0.18, 0.17, 0.16].map((v) => v * s), 12, 2), stM(x, 0, z));
  const nb = R.i(4, 5);
  for (let b = 0; b < nb; b++) { const a = b / nb * TAU + R.n(0.5), out = R.r(1.2, 2.2) * s, up = R.r(1.6, 2.4) * s, y0 = th * R.r(0.82, 1); const p0 = [lean[0], y0, lean[1]]; bark.add(stTube(stCurve([p0, [p0[0] + Math.cos(a) * out * 0.45, y0 + up * 0.55, p0[2] + Math.sin(a) * out * 0.45], [p0[0] + Math.cos(a) * out, y0 + up, p0[2] + Math.sin(a) * out]], 5), [0.13, 0.11, 0.09, 0.075, 0.06, 0.05].map((v) => v * s), 8, 2), stM(x, 0, z)); }
  const me = bark.mesh(ST.mat.bark);
  const cy = th + 2.3 * s, rr = [R.r(3.1, 3.7) * s, R.r(2.4, 2.9) * s, R.r(3.1, 3.7) * s];
  const fm = stFoliage({ c: [x + lean[0], cy, z + lean[1]], r: rr, n: lod ? 11 : 17, cr: [1.05 * s, 1.65 * s], cards: lod ? 260 : 1500, cs: [0.6 * s, 0.95 * s], pal: ST_PAL[pal], seed: 'tree' + seed, det: lod ? 2 : 3, flat: 0.75, cast: true });
  const G = new THREE.Group(); G.position.set(x, 0, z); ST.scene.add(G); [me, ...fm].forEach((m) => { m.geometry.translate(-x, 0, -z); m.geometry.computeBoundingSphere(); G.add(m); });
  ST.trees.push([x, z, rr[0]]); ST.treeG.push({ g: G, x, z, h: cy + rr[1], ph: RNG('st-sway', seed).r(0, TAU), fol: fm });
}

// ---------- house. Local frame: front face at z = 0 facing +z, body x ∈ [−w/2, w/2], z ∈ [−d, 0]. o: x, z, rot, w, d, h, f, pitch, col, roof, door, shut, porch, gable, garage, chim, seed, lod, win
function stHouse(o) {
  const G = new THREE.Group(); G.position.set(o.x, 0, o.z); G.rotation.y = o.rot ?? 0; ST.scene.add(G);
  const R = RNG('st-house', o.seed), w = o.w, d = o.d, h = o.h, f = o.f ?? 0.55, pitch = o.pitch ?? 2.2, lod = o.lod ?? 0, white = '#f5f2ea';
  const sid = stBatch(), paint = stBatch(), roof = stBatch(), glass = stBatch(), stone = stBatch(), wood = stBatch(), brick = stBatch(), shutB = stBatch();
  const FACE = { F: new THREE.Matrix4(), L: stM(-w / 2, 0, -d / 2, -Math.PI / 2), R: stM(w / 2, 0, -d / 2, Math.PI / 2) };
  const at = (face, m) => new THREE.Matrix4().multiplyMatrices(FACE[face], m);
  sid.add(stRBox(w, h - f, d, 0.03), stM(0, f + (h - f) / 2, -d / 2), o.col);
  stone.add(stRBox(w + 0.12, f + 0.02, d + 0.12, 0.03), stM(0, f / 2, -d / 2), '#bdb5a8');
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => paint.add(stRBox(0.16, h - f, 0.16, 0.025), stM(sx * (w / 2 + 0.02), f + (h - f) / 2, sz > 0 ? 0.02 : -d - 0.02), white));
  // gable roof (ridge along x)
  const ov = 0.45, ovx = 0.35, th = Math.atan(pitch / (d / 2)), L = (d / 2 + ov) / Math.cos(th), ridge = V3(0, h + pitch, -d / 2);
  [1, -1].forEach((s) => {
    const ds = V3(0, -Math.sin(th), s * Math.cos(th)), nu = V3(0, Math.cos(th), s * Math.sin(th)), c = ridge.clone().addScaledVector(ds, L / 2).addScaledVector(nu, 0.08);
    roof.add(stRBox(w + 2 * ovx, 0.14, L, 0.03), stM(c.x, c.y, c.z, 0, s * th), o.roof);
    const e = ridge.clone().addScaledVector(ds, L).addScaledVector(nu, -0.02); paint.add(stRBox(w + 2 * ovx + 0.04, 0.2, 0.05, 0.015), stM(e.x, e.y, e.z), white);
    paint.add(stRBox(w + 2 * ovx, 0.1, 0.12, 0.04), stM(e.x, e.y - 0.08, e.z - s * 0.06), '#ece8de');   // gutter
    [-1, 1].forEach((sx) => { const m = stM(c.x + sx * (w / 2 + ovx + 0.02), c.y - 0.05, c.z, 0, s * th); paint.add(stRBox(0.06, 0.22, L, 0.02), m, white); });
  });
  roof.add(stRBox(w + 2 * ovx + 0.04, 0.1, 0.24, 0.04), stM(0, h + pitch + 0.13, -d / 2), stMix(stC(o.roof), [0, 0, 0], 0.15));
  const tri = (bw, bh) => { const key = 'tri' + bw + ',' + bh; if (stGC[key]) return stGC[key]; const sh = new THREE.Shape(); sh.moveTo(-bw / 2, 0); sh.lineTo(bw / 2, 0); sh.lineTo(0, bh); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }); g.translate(0, 0, -0.04); return (stGC[key] = g); };
  [-1, 1].forEach((sx) => sid.add(tri(d, pitch), stM(sx * w / 2, h, -d / 2, Math.PI / 2), o.col));
  // front cross gable over the entry
  if (o.gable) {
    const gx = o.gable.x, gw = o.gable.w, gp = o.gable.p ?? pitch * 0.95, gth = Math.atan(gp / (gw / 2)), gL = (gw / 2 + 0.35) / Math.cos(gth), gd = o.gable.d ?? 0;
    sid.add(stRBox(gw, h - f, 0.3, 0.02), stM(gx, f + (h - f) / 2, gd - 0.15), o.col);
    sid.add(tri(gw, gp), stM(gx, h, gd - 0.04), o.col);
    [1, -1].forEach((s) => { const ds = V3(s * Math.cos(gth), -Math.sin(gth), 0), nu = V3(s * Math.sin(gth), Math.cos(gth), 0), rg = V3(gx, h + gp, gd - (d / 2 + 0.4) / 2 + 0.2), c = rg.clone().addScaledVector(ds, gL / 2).addScaledVector(nu, 0.08); roof.add(stRBox(gL, 0.14, d / 2 + 0.8, 0.03), stM(c.x, c.y, c.z, 0, 0, -s * gth), o.roof); paint.add(stRBox(gL, 0.24, 0.06, 0.02), stM(c.x, c.y - 0.06, gd + 0.38, 0, 0, -s * gth), white); });
    roof.add(stRBox(0.24, 0.1, d / 2 + 0.8, 0.04), stM(gx, h + gp + 0.13, gd - (d / 2 + 0.4) / 2 + 0.2), stMix(stC(o.roof), [0, 0, 0], 0.15));
    paint.add(stRBox(0.5, 0.5, 0.06, 0.02), stM(gx, h + gp * 0.45, gd + 0.01), white); glass.add(stWinGeo(0.36, 0.36, 3), stM(gx, h + gp * 0.45, gd + 0.045));   // gable vent window
  }
  // windows: face, position along the face, sill height, width, height
  const win = (face, a, y, ww, wh, v, shut = true, zo = 0) => {
    const B = (g, x, yy, z, c, bt = paint) => bt.add(g, at(face, stM(a + x, yy, z + zo)), c);
    B(stRBox(ww + 0.2, 0.09, 0.08, 0.02), 0, y + wh + 0.08, 0.04, white); B(stRBox(ww + 0.34, 0.06, 0.12, 0.02), 0, y + wh + 0.15, 0.06, white);
    B(stRBox(ww + 0.26, 0.07, 0.14, 0.02), 0, y - 0.05, 0.07, white);
    [-1, 1].forEach((s) => B(stRBox(0.09, wh + 0.1, 0.08, 0.02), s * (ww / 2 + 0.045), y + wh / 2, 0.04, white));
    B(stRBox(0.035, wh, 0.03, 0.01), 0, y + wh / 2, 0.035, white); B(stRBox(ww, 0.05, 0.04, 0.012), 0, y + wh / 2, 0.035, white);
    if (lod < 2) [-1, 1].forEach((s) => B(stRBox(ww / 4 + 0.12, wh / 2 - 0.03, 0.02, 0.008), 0, y + wh * (s > 0 ? 0.75 : 0.25), 0.032, white));
    glass.add(stWinGeo(ww, wh, v), at(face, stM(a, y + wh / 2, 0.015 + zo)));
    if (shut && o.shut) [-1, 1].forEach((s) => B(stShutter(ww * 0.48, wh + 0.1), s * (ww / 2 + 0.09 + ww * 0.24), y + wh / 2, 0.035, o.shut, shutB));
    if (o.box && face === 'F' && y < 2) { B(stRBox(ww + 0.2, 0.2, 0.24, 0.03), 0, y - 0.2, 0.17, o.shut || '#7a5a3a'); ST.boxes.push(at(face, stM(a, y - 0.06, 0.17 + zo)).premultiply(G.matrixWorld.clone().compose(G.position, G.quaternion, V3(1, 1, 1))).elements.slice(12, 15).concat([ww])); }
  };
  (o.win || []).forEach((q) => win(...q));
  // door
  const dx = o.doorX ?? 0, dz = o.doorZ ?? 0, dw = 0.95, dh = 2.1;
  if (o.door) {
    paint.add(stRBox(dw, dh, 0.06, 0.015), stM(dx, f + dh / 2, dz + 0.02), o.door);
    [[0.27, 0.5], [0.27, 1.12]].forEach(([yy]) => [-1, 1].forEach((s) => paint.add(stRBox(0.3, yy === 0.27 ? 0.55 : 0.5, 0.03, 0.02), stM(dx + s * 0.2, f + 0.18 + (yy === 0.27 ? 0.28 : 0.95), dz + 0.055), stMix(stC(o.door), [0, 0, 0], 0.18))));
    glass.add(stWinGeo(0.7, 0.32, 1), stM(dx, f + dh - 0.32, dz + 0.054));
    paint.add(new THREE.SphereGeometry(0.035, 12, 8), stM(dx + 0.36, f + 1.0, dz + 0.09), '#c9a24a'); paint.add(stRBox(0.05, 0.22, 0.02, 0.008), stM(dx + 0.36, f + 1.0, dz + 0.06), '#b08a3a');
    [-1, 1].forEach((s) => paint.add(stRBox(0.14, dh + 0.18, 0.07, 0.02), stM(dx + s * (dw / 2 + 0.07), f + (dh + 0.18) / 2, dz + 0.03), white));
    paint.add(stRBox(dw + 0.5, 0.16, 0.12, 0.03), stM(dx, f + dh + 0.25, dz + 0.05), white); glass.add(stWinGeo(dw, 0.22, 2), stM(dx, f + dh + 0.08 + 0.02, dz + 0.02));
    [-1, 1].forEach((s) => { paint.add(stRBox(0.16, 0.26, 0.12, 0.04), stM(dx + s * 0.85, f + 1.75, dz + 0.08), '#2c2c2c'); paint.add(stRBox(0.11, 0.17, 0.125, 0.03), stM(dx + s * 0.85, f + 1.74, dz + 0.085), '#f3dca0'); });
    if (o.num) ST.plaque = { m: at('F', stM(dx + 0.85, f + 1.32, 0.02)).premultiply(new THREE.Matrix4().compose(G.position, G.quaternion, V3(1, 1, 1))), n: o.num };
  }
  // porch: deck, steps, columns, beam, shed roof with a pale blue ceiling, railing
  if (o.porch) {
    const p = o.porch, px0 = p.x0, px1 = p.x1, pd = p.d, pc = (px0 + px1) / 2, pw = px1 - px0, ph = h - 0.25;
    wood.add(stRBox(pw, 0.1, pd, 0.02), stM(pc, f - 0.05, pd / 2), null); stone.add(stRBox(pw - 0.1, f - 0.1, pd - 0.1, 0.02), stM(pc, (f - 0.1) / 2, pd / 2), '#cfc7b8');
    const sx = p.step ?? dx, ns = 3;
    for (let i = 0; i < ns; i++) { const sy = f - (i + 1) * f / (ns + 0.4); stone.add(stRBox(1.7, sy + 0.02 > 0 ? f / (ns + 0.4) : 0.05, 0.34, 0.02), stM(sx, sy + f / (ns + 0.4) / 2, pd + 0.17 + i * 0.32), '#d8d0c2'); }
    const cols = p.cols ?? [px0 + 0.15, sx - 1.0, sx + 1.0, px1 - 0.15];
    cols.forEach((cx) => { paint.add(ST.colGeo, stM(cx, f, pd - 0.18, 0, 0, 0, 1, (ph - f) / 2.4, 1), white); });
    paint.add(stRBox(pw + 0.2, 0.26, 0.26, 0.03), stM(pc, ph + 0.1, pd - 0.18), white);
    const sl = 0.12, rl = Math.hypot(pd + 0.5, 0.45); roof.add(stRBox(pw + 0.5, 0.12, rl, 0.03), stM(pc, ph + 0.48, (pd + 0.5) / 2, 0, Math.atan2(0.45, pd + 0.5)), o.roof);
    paint.add(stRBox(pw + 0.2, 0.04, pd, 0.01), stM(pc, ph + 0.22, pd / 2), '#cfe6ec'); paint.add(stRBox(pw + 0.5, 0.18, 0.05, 0.015), stM(pc, ph + 0.28, pd + 0.48), white);
    if (lod < 1) {
      const rail = (a, b) => { const len = b - a, mid = (a + b) / 2; paint.add(stRBox(len, 0.07, 0.1, 0.02), stM(mid, f + 0.9, pd - 0.18), white); paint.add(stRBox(len, 0.05, 0.07, 0.015), stM(mid, f + 0.12, pd - 0.18), white); for (let xx = a + 0.1; xx < b - 0.05; xx += 0.13) paint.add(stRBox(0.04, 0.76, 0.04, 0.01), stM(xx, f + 0.5, pd - 0.18), white); };
      rail(cols[0] + 0.12, cols[1] - 0.12); rail(cols[2] + 0.12, cols[3] - 0.12);
    }
  }
  // garage wing with its own front gable and a panelled door
  if (o.garage) {
    const gs = o.garage.side, gw = o.garage.w, gx = gs * (w / 2 + gw / 2), gd = o.garage.d ?? d - 1, gh = h - 0.6, gp = 1.5, gth = Math.atan(gp / (gw / 2)), gL = (gw / 2 + 0.35) / Math.cos(gth), gz = o.garage.z ?? -1.2;
    sid.add(stRBox(gw, gh - 0.1, gd, 0.03), stM(gx, 0.1 + (gh - 0.1) / 2, gz - gd / 2), o.col); stone.add(stRBox(gw + 0.08, 0.2, gd + 0.08, 0.02), stM(gx, 0.1, gz - gd / 2), '#bdb5a8');
    sid.add(tri(gw, gp), stM(gx, gh, gz - 0.04), o.col);
    [1, -1].forEach((s) => { const ds = V3(s * Math.cos(gth), -Math.sin(gth), 0), nu = V3(s * Math.sin(gth), Math.cos(gth), 0), c = V3(gx, gh + gp, gz - gd / 2 + 0.2).addScaledVector(ds, gL / 2).addScaledVector(nu, 0.08); roof.add(stRBox(gL, 0.14, gd + 0.8, 0.03), stM(c.x, c.y, c.z, 0, 0, -s * gth), o.roof); paint.add(stRBox(gL, 0.22, 0.06, 0.02), stM(c.x, c.y - 0.06, gz + 0.62, 0, 0, -s * gth), white); });
    for (let i = 0; i < 4; i++) paint.add(stRBox(gw - 1.0, 0.5, 0.06, 0.03), stM(gx, 0.3 + i * 0.52, gz + 0.03), '#f1eee6');
    glass.add(stWinGeo(gw - 1.3, 0.28, 3), stM(gx, 0.3 + 3 * 0.52, gz + 0.065));
    [-1, 1].forEach((s) => paint.add(stRBox(0.16, 2.3, 0.08, 0.02), stM(gx + s * (gw / 2 - 0.42), 1.15, gz + 0.04), white)); paint.add(stRBox(gw - 0.7, 0.18, 0.1, 0.02), stM(gx, 2.32, gz + 0.05), white);
  }
  if (o.chim != null) brick.add(stRBox(0.8, h + pitch + 1.1, 0.7, 0.03), stM(o.chim, (h + pitch + 1.1) / 2, -d - 0.25), null);
  [[sid, ST.mat.siding], [paint, ST.mat.paint], [roof, ST.mat.roof], [glass, ST.mat.glass, false], [stone, ST.mat.stone], [wood, ST.mat.wood], [brick, ST.mat.brick], [shutB, ST.mat.shutter]].forEach(([b, m, cast]) => { const me = b.mesh(m, cast !== false); if (me) G.add(me); });
  return G;
}
function stWinGeo(ww, wh, v) { const key = ['win', ww, wh, v].join(); if (stGC[key]) return stGC[key]; const g = new THREE.PlaneGeometry(ww, wh), U = g.attributes.uv; for (let i = 0; i < U.count; i++) U.setX(i, (v + U.getX(i)) / 4); return (stGC[key] = g); }
function stShutter(sw, sh) { return stRBox(sw, sh, 0.035, 0.012); }

// ---------- picket fence (instanced pickets), posts with caps, rails; gate gap
function stFence(x0, x1, z, gaps) {
  const sh = new THREE.Shape(), pw = 0.085, ph = 0.95; sh.moveTo(-pw / 2, 0); sh.lineTo(pw / 2, 0); sh.lineTo(pw / 2, ph - 0.07); sh.lineTo(0, ph); sh.lineTo(-pw / 2, ph - 0.07); sh.closePath();
  const pg = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }); pg.computeVertexNormals();
  const xs = []; for (let x = x0; x <= x1; x += 0.15) if (!gaps.some(([a, b]) => x > a && x < b)) xs.push(x);
  const im = new THREE.InstancedMesh(pg, ST.mat.fence, xs.length), R = RNG('st-fence');
  xs.forEach((x, i) => { im.setMatrixAt(i, stM(x, 0.02 + R.n(0.006), z, R.n(0.01), 0, R.n(0.012), 1, 1 + R.n(0.015), 1)); });
  im.castShadow = im.receiveShadow = true; ST.scene.add(im);
  const b = stBatch();
  const runs = []; let a = x0; gaps.forEach(([g0, g1]) => { runs.push([a, g0]); a = g1; }); runs.push([a, x1]);
  runs.forEach(([r0, r1]) => { [0.25, 0.7].forEach((y) => b.add(stRBox(r1 - r0, 0.07, 0.035, 0.012), stM((r0 + r1) / 2, y, z - 0.03), null)); for (let x = r0; x <= r1 + 0.01; x += Math.max(1.2, (r1 - r0) / Math.round((r1 - r0) / 2.4))) { b.add(stRBox(0.1, 1.08, 0.1, 0.02), stM(x, 0.54, z - 0.02), null); b.add(stRBox(0.14, 0.05, 0.14, 0.02), stM(x, 1.1, z - 0.02), null); b.add(new THREE.SphereGeometry(0.05, 12, 8), stM(x, 1.15, z - 0.02), null); } });
  const me = b.mesh(ST.mat.fence); ST.scene.add(me);
}

// ---------- props
function stShadowBlob(x, z, sx, sz, ry = 0, a = 0.55, y = 0.012) { const m = new THREE.Mesh(stGC.blobPlane || (stGC.blobPlane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), ST.mat.blob); m.position.set(x, y, z); m.scale.set(sx, 1, sz); m.rotation.y = ry; m.renderOrder = 1; ST.scene.add(m); return m; }
function stCar(x, z, ry, col, suv = false, o = {}) {
  const G = new THREE.Group(); G.position.set(x, -0.13, z); G.rotation.y = ry; (o.parent || ST.scene).add(G);
  const paint = stBatch(), dark = stBatch(), glass = stBatch(), chrome = stBatch(), lights = stBatch(), sy = suv ? 1.16 : 1, W = suv ? 1.86 : 1.76;
  const body = new THREE.Shape(); body.moveTo(2.2, 0.32); body.lineTo(1.87, 0.32); body.absarc(1.45, 0.32, 0.42, 0, Math.PI, false); body.lineTo(-1.03, 0.32); body.absarc(-1.45, 0.32, 0.42, 0, Math.PI, false); body.lineTo(-2.22, 0.32); body.lineTo(-2.3, 0.5); body.lineTo(-2.3, 0.86 * sy); body.quadraticCurveTo(-2.25, 1.0 * sy, -2.0, 1.02 * sy); body.lineTo(1.05, 1.03 * sy); body.quadraticCurveTo(2.0, 0.98 * sy, 2.25, 0.86 * sy); body.quadraticCurveTo(2.36, 0.78 * sy, 2.34, 0.5); body.closePath();
  const bg = new THREE.ExtrudeGeometry(body, { depth: W - 0.24, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 5, curveSegments: 10 }); bg.translate(0, 0, -(W - 0.24) / 2); bg.computeVertexNormals();
  paint.add(bg, stM(0, 0, 0), col);
  const cab = new THREE.Shape(), r0 = 1.0 * sy, r1 = suv ? 1.62 : 1.45; cab.moveTo(-1.35 - (suv ? 0.6 : 0), r0); cab.lineTo(-1.0 - (suv ? 0.75 : 0), r1); cab.lineTo(0.42, r1 + 0.01); cab.lineTo(1.08, r0); cab.closePath();
  if (o.conv) { glass.add(stRBox(0.04, 0.42, W - 0.3, 0.015), stM(0.95, r0 + 0.2, 0, 0, 0, 0.55), null); paint.add(stRBox(0.06, 0.46, 0.05, 0.02), stM(0.95, r0 + 0.2, (W - 0.3) / 2, 0, 0, 0.55), col).add(stRBox(0.06, 0.46, 0.05, 0.02), stM(0.95, r0 + 0.2, -(W - 0.3) / 2, 0, 0, 0.55), col); [0.4, -0.4].forEach((sz) => { dark.add(stRBox(0.52, 0.16, 0.5, 0.075), stM(-0.35, r0 - 0.06, sz), '#b8865a'); dark.add(stRBox(0.16, 0.5, 0.48, 0.075), stM(-0.68, r0 + 0.2, sz, 0, 0, 0.16), '#b8865a'); dark.add(stRBox(0.12, 0.16, 0.26, 0.06), stM(-0.76, r0 + 0.52, sz, 0, 0, 0.16), '#b8865a'); }); dark.add(stRBox(1.1, 0.12, W - 0.3, 0.05), stM(-1.6, r0 - 0.06, 0), '#3fae8c'); dark.add(new THREE.TorusGeometry(0.17, 0.022, 8, 24), stM(0.35, r0 + 0.12, 0.4, Math.PI / 2, 0, -0.5), '#3a3a3a'); }
  else { const cg = new THREE.ExtrudeGeometry(cab, { depth: W - 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.06, bevelSegments: 4 }); cg.translate(0, 0, -(W - 0.5) / 2); cg.computeVertexNormals(); glass.add(cg, stM(0, 0, 0), null); }
  const rf = new THREE.Shape(); rf.moveTo(-1.02 - (suv ? 0.75 : 0), r1 - 0.06); rf.lineTo(-0.98 - (suv ? 0.75 : 0), r1 + 0.05); rf.lineTo(0.42, r1 + 0.06); rf.lineTo(0.5, r1 - 0.06); rf.closePath();
  const rg = new THREE.ExtrudeGeometry(rf, { depth: W - 0.42, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.04, bevelSegments: 3 }); rg.translate(0, 0, -(W - 0.42) / 2); rg.computeVertexNormals(); if (!o.conv) paint.add(rg, stM(0, 0, 0), col);
  [-1, 1].forEach((s) => { if (!o.conv) paint.add(stRBox(0.09, r1 - r0 + 0.02, 0.06, 0.02), stM(-0.28, (r0 + r1) / 2, s * (W / 2 - 0.12), 0, 0, 0.12), col); paint.add(stRBox(0.14, 0.09, 0.18, 0.03), stM(0.95, r0 + 0.12, s * (W / 2 + 0.03)), col); });
  [[1.45, 1], [1.45, -1], [-1.45, 1], [-1.45, -1]].forEach(([wx, s]) => { dark.add(ST.tireGeo, stM(wx, 0.35, s * (W / 2 - 0.12)), '#2a2a2c'); chrome.add(ST.rimGeo, stM(wx, 0.35, s * (W / 2 - 0.02), 0, Math.PI / 2), null); });
  [-1, 1].forEach((s) => { dark.add(stRBox(0.2, 0.2, W + 0.04, 0.08), stM(s * 2.3, 0.45, 0), '#2a2a2c'); lights.add(stRBox(0.08, 0.12, 0.34, 0.04), stM(s * 2.32, 0.78 * sy, 0.55), s > 0 ? '#fff6dc' : '#c8281e'); lights.add(stRBox(0.08, 0.12, 0.34, 0.04), stM(s * 2.32, 0.78 * sy, -0.55), s > 0 ? '#fff6dc' : '#c8281e'); });
  [[paint, ST.mat.carPaint], [dark, o.conv ? ST.mat.paint : ST.mat.rubber], [glass, ST.mat.carGlass], [chrome, ST.mat.chrome], [lights, ST.mat.paint]].forEach(([b, m]) => { const me = b.mesh(m); if (me) G.add(me); });
  const bl = stShadowBlob(0, 0, 5.0, 2.3, 0, 0.75, 0.012); G.add(bl);
  return G;
}
const stMC = {};
function stMatCol(hex, rough = 0.7) { const k = hex + rough; return stMC[k] || (stMC[k] = new THREE.MeshStandardMaterial({ color: lin(hex), roughness: rough })); }
function stLimb(parent, len, r, col, y0 = 0) { const m = new THREE.Mesh(stGC['cap' + len + r] || (stGC['cap' + len + r] = new THREE.CapsuleGeometry(r, len, 6, 12)), stMatCol(col)); m.position.y = y0 - len / 2; m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function stJoint(parent, x, y, z) { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; }
// background people: smooth sculpted shapes (tapered limbs, mitten hands with thumbs, face with nose/eyes/ears/brows, hair styles)
function stLimbT(parent, len, r1, r2, col, rough = 0.75) { const k = 'lt' + len + r1 + r2; const g = stGC[k] || (stGC[k] = (() => { const pts = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; pts.push(new THREE.Vector2(Math.max(1e-4, Math.cos(a) * r2), -len + Math.sin(a) * r2 * 0 - (1 - (Math.sin(a) + 1) / 2) * 0)); } const P = []; for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i / 8 * Math.PI / 2; P.push(new THREE.Vector2(Math.cos(a) * r2, -len + Math.sin(a) * r2)); } for (let i = 1; i < 6; i++) { const u = i / 6; P.push(new THREE.Vector2(lerp(r2, r1, u * u * (3 - 2 * u)), -len + u * len)); } for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; P.push(new THREE.Vector2(Math.max(1e-4, Math.cos(a) * r1), Math.sin(a) * r1)); } return new THREE.LatheGeometry(P, 14); })());
  const m = new THREE.Mesh(g, stMatCol(col, rough)); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function stPerson(o) {
  const root = new THREE.Group(); (o.parent || ST.scene).add(root); const c = o.cols, P = { root, o }, sk = (r) => stMatCol(c.skin, r ?? 0.55);
  const hips = stJoint(root, 0, 0.94 * (o.s ?? 1), 0); P.hips = hips; root.scale.setScalar(o.s ?? 1); hips.position.y = 0.94;
  const chest = stJoint(hips, 0, 0.12, 0); P.chest = chest;
  const torso = new THREE.Mesh(stGC.torso || (stGC.torso = new THREE.LatheGeometry([[0.001, -0.18], [0.14, -0.16], [0.16, -0.05], [0.155, 0.12], [0.17, 0.3], [0.14, 0.4], [0.06, 0.45], [0.001, 0.46]].map(([a, b]) => new THREE.Vector2(a, b)), 18)), stMatCol(c.top, 0.8)); torso.scale.set(1, 1, 0.66); torso.position.y = 0.04; torso.castShadow = true; chest.add(torso);
  if (o.suit) { const sh = new THREE.Mesh(stRBox(0.1, 0.22, 0.02, 0.008), stMatCol('#f4f2ee', 0.6)); sh.position.set(0, 0.36, 0.1); chest.add(sh); const tie = new THREE.Mesh(stRBox(0.035, 0.2, 0.012, 0.005), stMatCol(o.suit, 0.5)); tie.position.set(0, 0.33, 0.112); chest.add(tie); }
  const pel = new THREE.Mesh(stGC.pel || (stGC.pel = new THREE.SphereGeometry(0.16, 16, 12)), stMatCol(c.bottom, 0.8)); pel.scale.set(1.0, 0.75, 0.72); pel.position.y = -0.02; pel.castShadow = true; hips.add(pel);
  const neck = stLimbT(chest, 0.1, 0.045, 0.05, c.skin, 0.55); neck.position.y = 0.58;
  const head = stJoint(chest, 0, 0.62, 0.01); P.head = head;
  const hd = new THREE.Mesh(stGC.head || (stGC.head = new THREE.SphereGeometry(0.105, 22, 16)), sk()); hd.scale.set(0.88, 1.08, 0.98); hd.position.y = 0.1; hd.castShadow = true; head.add(hd);
  const jaw = new THREE.Mesh(stGC.head, sk()); jaw.scale.set(0.7, 0.6, 0.78); jaw.position.set(0, 0.04, 0.02); head.add(jaw);
  const nose = new THREE.Mesh(stGC.nose || (stGC.nose = new THREE.SphereGeometry(0.02, 10, 8)), sk()); nose.scale.set(0.8, 1.1, 1); nose.position.set(0, 0.085, 0.1); head.add(nose);
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(stGC.eye || (stGC.eye = new THREE.SphereGeometry(0.012, 10, 8)), stMatCol('#1d1410', 0.3)); e.position.set(s * 0.033, 0.112, 0.088); head.add(e); const w = new THREE.Mesh(stGC.eyeW || (stGC.eyeW = new THREE.SphereGeometry(0.017, 10, 8)), stMatCol('#f4efe8', 0.4)); w.scale.set(1, 0.8, 0.5); w.position.set(s * 0.033, 0.112, 0.082); head.add(w); const br = new THREE.Mesh(stRBox(0.032, 0.008, 0.01, 0.004), stMatCol(c.hair, 0.7)); br.position.set(s * 0.034, 0.142 + (o.brow ?? 0) * 0.006, 0.09); br.rotation.z = s * (o.brow ?? 0) * -0.35; head.add(br); P['brow' + s] = br; const ear = new THREE.Mesh(stGC.nose, sk()); ear.scale.set(0.6, 1.4, 1); ear.position.set(s * 0.093, 0.1, 0); head.add(ear); });
  const mouth = new THREE.Mesh(stRBox(0.034, 0.008, 0.01, 0.004), stMatCol('#7a3a32', 0.5)); mouth.position.set(0, 0.048, 0.09); head.add(mouth); P.mouth = mouth;
  const hm = stMatCol(c.hair, 0.6), hs = o.hairS ?? 'short';
  if (hs !== 'bald') { const cap = new THREE.Mesh(stGC.hcap || (stGC.hcap = new THREE.SphereGeometry(0.112, 22, 14, 0, TAU, 0, Math.PI * 0.56)), hm); cap.scale.set(0.93, 1.1, 1.05); cap.position.set(0, 0.112, -0.012); cap.rotation.x = -0.3; cap.castShadow = true; head.add(cap);
    const fr = new THREE.Mesh(stGC.hfr || (stGC.hfr = new THREE.SphereGeometry(0.06, 14, 10)), hm); fr.scale.set(1.5, 0.5, 0.9); fr.position.set(0.01, 0.19, 0.06); fr.rotation.z = 0.2; head.add(fr); }
  if (hs === 'bob' || hs === 'long') { const bk = new THREE.Mesh(stGC.hcap, hm); bk.scale.set(1.0, hs === 'long' ? 1.9 : 1.35, 1.05); bk.position.set(0, hs === 'long' ? 0.0 : 0.06, -0.02); bk.rotation.x = Math.PI; head.add(bk); }
  if (hs === 'curly') for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, q = new THREE.Mesh(stGC.hfr, hm); q.scale.setScalar(0.62); q.position.set(Math.cos(a) * 0.08, 0.17 + Math.sin(i * 2.3) * 0.03, Math.sin(a) * 0.08 - 0.01); head.add(q); }
  if (o.pony || hs === 'pony') { const pn = new THREE.Mesh(stGC.hfr, hm); pn.scale.set(0.7, 1.7, 0.7); pn.position.set(0, 0.1, -0.13); pn.rotation.x = 0.5; head.add(pn); P.pony = pn; }
  if (o.cap) { const cp = new THREE.Mesh(new THREE.SphereGeometry(0.118, 18, 10, 0, TAU, 0, Math.PI * 0.5), stMatCol(o.cap, 0.7)); cp.position.y = 0.125; head.add(cp); const vz = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 18, 1, false, -Math.PI / 2, Math.PI), stMatCol(o.cap, 0.7)); vz.position.set(0, 0.13, 0.07); vz.scale.set(1, 1, 0.8); head.add(vz); }
  if (o.ranger) { const hat = new THREE.Group(); hat.position.y = 0.2; head.add(hat); P.hat = hat; const br = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.22, 0.012, 28), stMatCol('#8a6a3e', 0.8)); hat.add(br); const cr = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.13, 4, 1), stMatCol('#8a6a3e', 0.8)); cr.position.y = 0.065; cr.rotation.y = Math.PI / 4; hat.add(cr); const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.105, 0.025, 20), stMatCol('#4a3a24', 0.7)); bd.position.y = 0.016; hat.add(bd); }
  [-1, 1].forEach((s) => {
    const k = s > 0 ? 'L' : 'R';
    const hip = stJoint(hips, s * 0.085, 0.0, 0); stLimbT(hip, 0.42, 0.085, 0.06, c.bottom, 0.85); const kn = stJoint(hip, 0, -0.44, 0); stLimbT(kn, 0.4, 0.062, o.shorts ? 0.042 : 0.052, o.shorts ? c.skin : c.bottom, 0.8);
    const ft = new THREE.Mesh(stRBox(0.1, 0.08, 0.26, 0.038), stMatCol(c.shoe, 0.6)); ft.position.set(0, -0.44, 0.045); ft.castShadow = true; kn.add(ft);
    const shd = stJoint(chest, s * 0.19, 0.4, -0.01); const sb = new THREE.Mesh(stGC.pel, stMatCol(c.sleeve ?? c.top, 0.8)); sb.scale.setScalar(0.42); shd.add(sb); stLimbT(shd, 0.27, 0.058, 0.046, c.sleeve ?? c.top, 0.8);
    const el = stJoint(shd, 0, -0.29, 0); stLimbT(el, 0.24, 0.046, 0.036, c.arm ?? c.sleeve ?? c.top, 0.8);
    const hn = stJoint(el, 0, -0.27, 0); const palm = new THREE.Mesh(stGC.palm || (stGC.palm = new THREE.SphereGeometry(0.042, 14, 10)), sk()); palm.scale.set(0.62, 1.15, 1.0); palm.position.y = -0.035; hn.add(palm); const th = new THREE.Mesh(stGC.thumb || (stGC.thumb = new THREE.CapsuleGeometry(0.013, 0.035, 4, 8)), sk()); th.position.set(0, -0.025, 0.035); th.rotation.x = 0.7; hn.add(th);
    P['hip' + k] = hip; P['kn' + k] = kn; P['sh' + k] = shd; P['el' + k] = el; P['hand' + k] = hn;
  });
  root.position.set(o.x ?? 0, o.y ?? 0.04, o.z ?? 0); root.rotation.y = o.rot ?? 0;
  return P;
}
// pose a background person: name + phase (walk/jog); joint rotations in degrees
const ST_PP = {
  stand: {}, walk: {}, jog: {},
  kneel: { hips: [0, 0, 0], hipL: [-88, 0, 4], knL: [88, 0, 0], hipR: [-6, 0, -4], knR: [96, 0, 0], chest: [14, 0, 0], shL: [-30, 0, 10], elL: [-60, 0, 0], shR: [-150, 0, -25], elR: [-110, 0, 0], head: [12, 0, 0], y: -0.42 },
  tear: { chest: [6, 0, 0], head: [16, 0, 0], shL: [-38, 0, 12], elL: [-95, 0, 25], shR: [-38, 0, -12], elR: [-95, 0, -25] },
  sadstand: { chest: [10, 0, 0], head: [24, 0, 0], shL: [4, 0, 6], shR: [4, 0, -6], elL: [-10, 0, 0], elR: [-10, 0, 0] },
  sign: { chest: [-6, 0, 0], head: [6, 0, 0], shL: [-95, 0, 16], elL: [-45, 0, 0], shR: [-95, 0, -16], elR: [-45, 0, 0] },
  afraid: { hips: [0, 0, 0], chest: [-12, 0, 0], head: [-4, 0, 0], shL: [-60, 0, 30], elL: [-70, 0, 0], shR: [-80, 0, -18], elR: [-50, 0, 0], hipL: [-12, 0, 0], knL: [10, 0, 0] },
  carry: { chest: [-4, 0, 0], shL: [-55, 0, 18], elL: [-70, 0, 0], shR: [-55, 0, -18], elR: [-70, 0, 0] },
  bucket: { chest: [28, 0, 0], head: [-10, 0, 0], shL: [-50, 0, 10], elL: [-30, 0, 0], shR: [-50, 0, -10], elR: [-30, 0, 0], hipL: [-30, 0, 0], knL: [40, 0, 0], hipR: [-30, 0, 0], knR: [40, 0, 0], y: -0.07 },
  armsout: { chest: [-4, 0, 0], head: [-6, 0, 0], shL: [0, 0, 70], elL: [-10, 0, 0], shR: [0, 0, -70], elR: [-10, 0, 0] },
  hug: { chest: [10, 0, 0], head: [8, 0, 0], shL: [-50, 0, -20], elL: [-90, 0, 0], shR: [-50, 0, 20], elR: [-90, 0, 0] },
};
// extras: the character agent's chExtra (same tech as the hero) when available, my own people otherwise
function stPeep(seed, xo, fo) {
  if (typeof chExtra !== 'function') return stPerson(fo);
  const X = chExtra(seed, xo); (fo.parent || ST.scene).add(X.root); X.root.position.set(fo.x ?? 0, fo.y ?? 0.04, fo.z ?? 0); X.root.rotation.y = fo.rot ?? 0;
  return { X, root: X.root, rig: X.rig, handR: X.rig.arms.R.wr, head: X.rig.head, _y: fo.y ?? 0.04 };
}
const ST_XP = {
  stand: { pose: 'stand', expr: 'neutral' }, walk: { pose: 'stand', expr: 'neutral' }, jog: { pose: 'stand', expr: 'happy' },
  kneel: { pose: 'stand', expr: 'worried', add: { hipL: [-88, 0, 4], knL: [86, 0, 0], anL: [4, 0, 0], hipR: [-4, 0, -4], knR: [100, 0, 0], anR: [30, 0, 0], spine: [8, 0, 0], shR: [-30, 0, -112], elR: [-120, 0, 0], shL: [-30, 0, 0], elL: [-40, 0, 0], head: [-6, 0, 0] }, hand: { R: 'open', L: 'relax' } },
  tear: { pose: 'hold', expr: 'sad', hand: { L: 'fist', R: 'fist' }, add: { head: [14, 0, 0], shL: [-10, 0, 0], shR: [-10, 0, 0] } },
  sadstand: { pose: 'sad', expr: 'sad' }, sit: { pose: 'sad', expr: 'sad' },
  sign: { pose: 'hold', expr: 'worried', hand: { L: 'fist', R: 'fist' }, add: { shL: [-50, 0, 0], shR: [-50, 0, 0], spine: [-6, 0, 0] } },
  afraid: { pose: 'shock', expr: 'worried', add: { spine: [-6, 0, 0] } }, carry: { pose: 'hold', expr: 'neutral' },
  bucket: { pose: 'hold', expr: 'worried', add: { spine: [26, 0, 0] } }, armsout: { pose: 'shrug', expr: 'surprised' }, hug: { pose: 'hold', expr: 'worried', add: { head: [6, 0, 0] } },
};
function stPP(P, name, ph = 0, add = {}) {
  if (P.X) {
    const r = P.root; if (P._after !== undefined && r.position.y !== P._after) P._y = r.position.y;
    const base = ST_XP[name] || ST_XP.stand, A = {}; Object.entries(base.add || {}).forEach(([j, v]) => { A[j] = [...v]; });
    if (add.head) A.head = [(A.head?.[0] ?? 0) + add.head[0] * 0.5, (A.head?.[1] ?? 0) + add.head[1], 0];
    const o = { pose: base.pose, expr: base.expr, hand: base.hand, add: A, pos: [r.position.x, P._y, r.position.z], rot: r.rotation.y / DEG, t: TT + (P._ph ?? 0) };
    if (name === 'walk' || name === 'jog') { o.walk = ph / TAU; o.stride = name === 'jog' ? 1.5 : 1; }
    P.X.pose(o); P._after = r.position.y; return;
  }
  const D = DEG, J = ['hips', 'chest', 'head', 'hipL', 'hipR', 'knL', 'knR', 'shL', 'shR', 'elL', 'elR'];
  J.forEach((j) => P[j] && P[j].rotation.set(0, 0, 0));
  P.shL.rotation.z = 6 * D; P.shR.rotation.z = -6 * D; P.elL.rotation.x = -10 * D; P.elR.rotation.x = -10 * D;
  const A = ST_PP[name] || {}; let y = 0.94;
  Object.entries(A).forEach(([j, v]) => { if (j === 'y') y += v; else if (P[j]) P[j].rotation.set(v[0] * D, v[1] * D, v[2] * D); });
  if (name === 'walk' || name === 'jog') { const J2 = name === 'jog', sw = J2 ? 38 : 22; [['L', 1], ['R', -1]].forEach(([k, s]) => { const p = Math.sin(ph) * s; P['hip' + k].rotation.x = (-sw * p - (J2 ? 8 : 0)) * D; P['kn' + k].rotation.x = ((J2 ? 25 : 6) + (J2 ? 55 : 28) * Math.max(0, Math.sin(ph + (s > 0 ? 0 : Math.PI) - 1.2))) * D; P['sh' + k].rotation.x = (J2 ? 42 : 18) * p * D; P['el' + k].rotation.x = (J2 ? -85 : -14) * D; }); y += (J2 ? 0.05 : 0.02) * Math.abs(Math.sin(ph)); if (J2) P.chest.rotation.x = 8 * D; }
  Object.entries(add).forEach(([j, v]) => { if (P[j]) { P[j].rotation.x += v[0] * D; P[j].rotation.y += v[1] * D; P[j].rotation.z += v[2] * D; } });
  P.hips.position.y = y;
}
function stDog() {
  const root = new THREE.Group(); ST.scene.add(root); const col = '#c8924c', D = { root };
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.42, 6, 14), stMatCol(col, 0.8)); body.rotation.z = Math.PI / 2; body.position.y = 0.46; body.scale.set(1, 1, 0.9); body.castShadow = true; root.add(body);
  const hd = stJoint(root, 0.34, 0.62, 0); D.head = hd;
  const sk = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), stMatCol(col, 0.8)); sk.castShadow = true; hd.add(sk);
  const sn = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.08, 4, 10), stMatCol('#d9a865', 0.8)); sn.rotation.z = Math.PI / 2; sn.position.set(0.12, -0.03, 0); hd.add(sn);
  const ns = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), stMatCol('#222', 0.4)); ns.position.set(0.2, -0.02, 0); hd.add(ns);
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), stMatCol('#a8743a', 0.8)); e.scale.set(0.5, 1.2, 0.35); e.position.set(-0.02, -0.04, s * 0.1); e.rotation.x = s * 0.3; hd.add(e); });
  const nk = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.12, 4, 10), stMatCol(col, 0.8)); nk.position.set(0.27, 0.54, 0); nk.rotation.z = -0.8; root.add(nk);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.015, 6, 16), stMatCol('#c8323a', 0.5)); collar.position.set(0.29, 0.56, 0); collar.rotation.y = Math.PI / 2; collar.rotation.x = 0.8; root.add(collar); D.collar = collar;
  D.legs = [[0.22, 0.09], [0.22, -0.09], [-0.22, 0.09], [-0.22, -0.09]].map(([lx, lz]) => { const j = stJoint(root, lx, 0.42, lz); stLimb(j, 0.3, 0.038, col); return j; });
  const tail = new THREE.Mesh(stTube(stCurve([[-0.32, 0.5, 0], [-0.45, 0.62, 0], [-0.52, 0.72, 0.03]], 6), [0.035, 0.032, 0.028, 0.024, 0.018, 0.012, 0.006], 8), stMatCol(col, 0.8)); root.add(tail); D.tail = tail;
  return D;
}
function stBird(R) {
  const g = new THREE.Group(), m = stMatCol('#2b2622', 0.8); ST.scene.add(g);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), m); b.scale.set(2.2, 0.9, 0.9); g.add(b);
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.05, 0.02); sh.quadraticCurveTo(0.1, 0.18, 0.02, 0.32); sh.lineTo(-0.06, 0.05); sh.closePath();
  const wg = new THREE.ShapeGeometry(sh); wg.rotateX(Math.PI / 2);
  const w = [1, -1].map((s) => { const p = stJoint(g, 0, 0.01, 0); const mw = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ color: lin('#2b2622'), roughness: 0.8, side: THREE.DoubleSide })); mw.scale.z = s; p.add(mw); return [p, s]; });
  return { g, w, ph: R.r(0, TAU), sp: R.r(5, 7) };
}
function stSignTex(txt) { return g3Tex((x, w, h) => { x.fillStyle = '#1f6a3c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2f2ea'; x.lineWidth = 4; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#f6f6ee'; x.font = 'bold 44px Helvetica, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, w / 2, h / 2 + 2); }, 256, 64); }
function stTextTex(txt, fg, bg, w = 128, h = 128, font = 'bold 96px Georgia') { return g3Tex((x) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, w / 2, h / 2 + 4); }, w, h); }

// ---------- sky (gradient + soft clouds), used for the backdrop and the PMREM environment
function stSkyMat(gain = 1) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { gain: { value: gain }, storm: { value: 0 }, dusk: { value: 0 }, front: { value: 0 }, sun: { value: ST_SUN.clone() }, hor: { value: lin('#f3dcc2') }, mid: { value: lin('#a6c6ea') }, zen: { value: lin('#4f88d2') }, gnd: { value: lin('#7d8466') } },
    vertexShader: 'varying vec3 vD; void main(){ vD = (modelMatrix * vec4(position, 0.0)).xyz; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 sun, hor, mid, zen, gnd; uniform float gain, storm, dusk, front; varying vec3 vD;
      float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec3 d = normalize(vD); float h = d.y, st = clamp(storm + front * d.x * 0.9, 0.0, 1.0);
        vec3 H = mix(mix(hor, vec3(1.0, 0.45, 0.22), dusk), vec3(0.16, 0.18, 0.2), st), M = mix(mix(mid, vec3(0.45, 0.32, 0.5), dusk), vec3(0.09, 0.1, 0.12), st), Z = mix(mix(zen, vec3(0.06, 0.08, 0.24), dusk), vec3(0.05, 0.055, 0.07), st);
        vec3 c = mix(H, M, smoothstep(0.0, 0.22, h)); c = mix(c, Z, smoothstep(0.2, 0.75, h));
        float s = max(dot(d, sun), 0.0); c += vec3(1.0, 0.7 - 0.25 * dusk, 0.45 - 0.25 * dusk) * (pow(s, 6.0) * (0.35 + 0.6 * dusk) + pow(s, 900.0) * 6.0) * (1.0 - st);
        if (h > 0.0) { vec2 q = d.xz / (h + 0.12) * 1.6; float n = vn(q) * 0.55 + vn(q * 2.1 + 3.0) * 0.3 + vn(q * 4.7 - 1.0) * 0.15; float cl = smoothstep(0.52 - 0.4 * st, 0.8 - 0.2 * st, n) * smoothstep(0.02, 0.18, h) * (1.0 - smoothstep(0.55 + 0.4 * st, 0.9 + 0.1 * st, h));
          vec3 cc = mix(mix(vec3(1.0, 0.97, 0.93) * (0.9 + 0.25 * s), vec3(1.0, 0.55, 0.45), dusk), vec3(0.06, 0.065, 0.075) * (0.7 + n), st); c = mix(c, cc, cl * (0.75 + 0.2 * st)); }
        c = mix(c, gnd * (1.0 - 0.6 * max(st, dusk)), smoothstep(0.0, -0.08, h));
        gl_FragColor = vec4(c * gain, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`,
  });
}

// ---------- build once
function stBuild(g) {
  ST = { scene: new THREE.Scene(), trees: [], treeG: [], boxes: [], mat: {}, people: [], signals: [], grp: {} };
  const S = ST.scene, rep = (t, sx, sy = sx) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(sx, sy); t.anisotropy = Math.min(8, g.ani); return t; };
  // environment from the sky
  const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), stSkyMat(0.5)));
  const pm = new THREE.PMREMGenerator(g.r), eu = es.children[0].material.uniforms; ST.envs = {};
  [['sunny', 0, 0], ['over', 0.55, 0], ['storm', 1, 0], ['dusk', 0, 1]].forEach(([k, a, b]) => { eu.storm.value = a; eu.dusk.value = b; ST.envs[k] = pm.fromScene(es, 0.02).texture; }); ST.env = ST.envs.sunny;   // reflections only (glass, paint, chrome, coin): diffuse ambient comes from the hemisphere
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), stSkyMat()); sky.renderOrder = -10; sky.frustumCulled = false; S.add(sky); ST.sky = sky;
  S.fog = new THREE.FogExp2(lin('#ecd9c3'), 0.0085);
  // light
  const sun = new THREE.DirectionalLight(lin('#ffdcae'), 3.7); sun.castShadow = true;
  sun.target.position.set(24, 0, 2); sun.position.copy(sun.target.position).addScaledVector(ST_SUN, 90);
  sun.shadow.mapSize.set(4096, 2048); sun.shadow.radius = 5; sun.shadow.blurSamples = 10; sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 22, bottom: -22, near: 30, far: 170 });
  const hemi = new THREE.HemisphereLight(lin('#c9dcf4'), lin('#8c8a64'), 0.72);
  S.add(sun, sun.target, hemi); ST.sun = sun; ST.hemi = hemi;
  // textures + materials
  const T = { siding: rep(stTexSiding(), 1 / 1.2), shingle: rep(stTexShingle(), 1 / 1.1, 1 / 1.3), conc: rep(stTexConcrete(), 1 / 1.5), asph: rep(stTexAsphalt(), 1 / 4.5), grass: rep(stTexGrass(), 1 / 0.9), leaf: stTexLeaf(), leafT: rep(stTexLeafTile(), 1), bark: rep(stTexBark(), 2, 0.6), brick: rep(stTexBrick(), 1 / 1.0, 1 / 0.6), wood: rep(stTexWood(), 1 / 1.4), win: stTexWindow(), louv: rep(stTexLouver(), 1 / 0.5, 1 / 1.5) };
  const M = ST.mat, SM = (o) => new THREE.MeshStandardMaterial(o);
  M.siding = SM({ vertexColors: true, map: T.siding, bumpMap: T.siding, bumpScale: 0.9, roughness: 0.78 });
  M.paint = SM({ vertexColors: true, roughness: 0.42, envMapIntensity: 0.8 });
  M.roof = SM({ vertexColors: true, map: T.shingle, bumpMap: T.shingle, bumpScale: 1.2, roughness: 0.88 });
  M.glass = SM({ envMap: ST.env, map: T.win, roughness: 0.05, metalness: 0.1, envMapIntensity: 2.6 });
  M.stone = SM({ vertexColors: true, map: T.conc, roughness: 0.92 });
  M.wood = SM({ map: T.wood, roughness: 0.7 });
  M.brick = SM({ map: T.brick, bumpMap: T.brick, bumpScale: 0.6, roughness: 0.9 });
  M.fol = stSoft(SM({ vertexColors: true, map: T.leafT, roughness: 0.85 }), 0.45, false, 'stfol', 0.9);
  M.leaf = stSoft(SM({ vertexColors: true, map: T.leaf, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75 }), 0.45, true, 'stleaf', 1.2);
  M.bark = SM({ color: lin('#8a7a6c'), map: T.bark, bumpMap: T.bark, bumpScale: 1.5, roughness: 0.92 });
  M.fence = SM({ color: lin('#f7f4ec'), roughness: 0.5, envMapIntensity: 0.7 });
  M.lawn = SM({ vertexColors: true, map: T.grass, roughness: 0.95, envMapIntensity: 0.8 });
  M.conc = SM({ map: T.conc, roughness: 0.9 });
  M.asph = SM({ vertexColors: true, map: T.asph, roughness: 0.88 });
  M.carPaint = SM({ envMap: ST.env, vertexColors: true, roughness: 0.2, metalness: 0.25, envMapIntensity: 2.2 });
  M.carSeat = SM({ vertexColors: true, roughness: 0.6 });
  M.carGlass = SM({ envMap: ST.env, color: lin('#1c242c'), roughness: 0.04, metalness: 0.2, envMapIntensity: 2.6 });
  M.rubber = SM({ color: lin('#2a2a2c'), roughness: 0.75 });
  M.chrome = SM({ envMap: ST.env, color: lin('#d8dadc'), roughness: 0.18, metalness: 1, envMapIntensity: 2.2 });
  M.blob = new THREE.MeshBasicMaterial({ map: g3Radial([[0, 'rgba(20,20,10,0.55)'], [0.5, 'rgba(20,20,10,0.3)'], [1, 'rgba(20,20,10,0)']]), transparent: true, depthWrite: false });
  M.shutter = SM({ vertexColors: true, map: T.louv, bumpMap: T.louv, bumpScale: 0.8, roughness: 0.55 });
  // shared geometry
  { const pts = [[0, 0], [0.17, 0], [0.17, 0.08], [0.14, 0.12], [0.13, 0.2], [0.115, 2.1], [0.14, 2.18], [0.17, 2.24], [0.17, 2.32], [0, 2.32]].map(([a, b]) => new THREE.Vector2(a, b)); ST.colGeo = new THREE.LatheGeometry(pts, 20); ST.colGeo.scale(1, 2.4 / 2.32, 1); }
  ST.tireGeo = new THREE.TorusGeometry(0.25, 0.11, 10, 26); ST.rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 22);
  // ---- ground: lawns (vertex-coloured mow stripes + shade under trees), road, sidewalks, curbs, driveways
  const lawn = (x0, x1, z0, z1, seed) => {
    const nx = Math.ceil((x1 - x0) / 1.0), nz = Math.ceil((z1 - z0) / 0.5), geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); geo.rotateX(-Math.PI / 2); geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const P = geo.attributes.position, col = new Float32Array(P.count * 3), U = geo.attributes.uv, R = RNG('st-lawn', seed), base = stC('#6f9a3a'), dry = stC('#a3a650'), dark = stC('#3f6a2a');
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); U.setXY(i, x, z); let c = base; const n = stN3(x * 0.13, z * 0.17, 1.7 + seed), m = (Math.floor(z / 1.1) % 2 === 0 ? 1 : -1) * 0.07; c = stMix(c, dry, clamp(n * 0.6 + 0.15)); c = c.map((v) => v * (1 + m + stN3(x * 0.7, z * 0.9, seed) * 0.06)); let sh = 0; ST.trees.forEach(([tx, tz, tr]) => { sh = Math.max(sh, 1 - clamp(Math.hypot(x - tx, z - tz) / (tr * 0.9))); }); c = stMix(c, dark, sh * 0.55); col.set(c, i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); const me = new THREE.Mesh(geo, M.lawn); me.receiveShadow = true; S.add(me);
  };
  ST.lawn = lawn;
  { const geo = new THREE.PlaneGeometry(300, 8.1, 300, 8); geo.rotateX(-Math.PI / 2); geo.translate(70, -0.13, 6.6); const P = geo.attributes.position, U = geo.attributes.uv, col = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); U.setXY(i, x, z); const lane = Math.min(Math.abs(z - 4.6), Math.abs(z - 8.6)), v = 0.95 - 0.12 * Math.exp(-lane * lane / 0.12) + 0.08 * Math.exp(-((z - 6.6) ** 2) / 0.6) + stN3(x * 0.2, z, 3) * 0.04; col.set([v, v, v * 0.98], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); const me = new THREE.Mesh(geo, M.asph); me.receiveShadow = true; S.add(me);
    const cr = new THREE.PlaneGeometry(10, 160, 10, 80); cr.rotateX(-Math.PI / 2); cr.translate(71, -0.128, 10); const P2 = cr.attributes.position, U2 = cr.attributes.uv, c2 = new Float32Array(P2.count * 3); for (let i = 0; i < P2.count; i++) { U2.setXY(i, P2.getX(i), P2.getZ(i)); c2.set([0.95, 0.95, 0.93], i * 3); } cr.setAttribute('color', new THREE.BufferAttribute(c2, 3)); const m2 = new THREE.Mesh(cr, M.asph); m2.receiveShadow = true; S.add(m2); }
  const conc = stBatch(), lines = stBatch();
  [[-80, 66], [76, 230]].forEach(([a, b]) => { conc.add(stRBox(b - a, 0.12, 2.0, 0.02), stM((a + b) / 2, -0.02, 0), null); conc.add(stRBox(b - a, 0.12, 2.0, 0.02), stM((a + b) / 2, -0.02, 13.2), null); conc.add(stRBox(b - a, 0.2, 0.18, 0.04), stM((a + b) / 2, -0.06, 2.6), null); conc.add(stRBox(b - a, 0.2, 0.18, 0.04), stM((a + b) / 2, -0.06, 10.6), null); });
  [[-1, 1]].forEach(() => { [[-80, 66], [76, 230]].forEach(([a, b]) => { for (let x = a; x < b; x += 4.2) { lines.add(stRBox(2.6, 0.01, 0.1, 0.004), stM(x + 1.3, -0.122, 6.5), '#e3b23c'); lines.add(stRBox(2.6, 0.01, 0.1, 0.004), stM(x + 1.3, -0.122, 6.7), '#e3b23c'); } }); });
  for (let i = 0; i < 9; i++) { lines.add(stRBox(1.4, 0.01, 0.45, 0.004), stM(64.9, -0.122, 3.2 + i * 0.85), '#f2f0ea'); lines.add(stRBox(1.4, 0.01, 0.45, 0.004), stM(77.1, -0.122, 3.2 + i * 0.85), '#f2f0ea'); }
  lines.add(stRBox(0.35, 0.01, 4, 0.004), stM(63.6, -0.122, 4.6), '#f2f0ea');
  [134.4, 204.4].forEach((sx) => { for (let i = 0; i < 9; i++) lines.add(stRBox(1.4, 0.01, 0.45, 0.004), stM(sx + 0.5, -0.122, 3.2 + i * 0.85), '#f2f0ea'); lines.add(stRBox(0.35, 0.01, 4, 0.004), stM(sx - 0.8, -0.122, 4.6), '#f2f0ea'); });
  ST.conc = conc; ST.lines = lines;
  // ---- houses
  const H = [];
  H.push(stHouse({ x: 8.5, z: -8.6, w: 10, d: 8.5, h: 5.9, pitch: 2.5, col: '#a9c6db', roof: '#565a64', door: '#c8463a', shut: '#2f4a6a', num: '7', box: true, seed: 'home', doorX: -1.6, chim: 3.4,
    gable: { x: -1.6, w: 4.2, d: 0 }, porch: { x0: -5, x1: 1.6, d: 2.3, step: -1.6 }, garage: { side: 1, w: 3.8, d: 6.8, z: -1.5 },
    win: [['F', -3.6, 1.45, 1.0, 1.5, 0], ['F', 0.4, 1.45, 1.0, 1.5, 2], ['F', 3.2, 1.45, 1.6, 1.5, 1], ['F', -3.6, 3.85, 1.0, 1.35, 3], ['F', -1.6, 3.85, 1.1, 1.35, 1], ['F', 0.6, 3.85, 1.0, 1.35, 0], ['F', 3.2, 3.85, 1.0, 1.35, 2], ['L', -2.0, 1.45, 1.0, 1.5, 3], ['L', 2.0, 1.45, 1.0, 1.5, 0], ['L', 0, 3.85, 1.0, 1.35, 2], ['R', -1.5, 3.85, 1.0, 1.35, 1]] }));
  const hv = [
    { x: 27, col: '#e9dcae', roof: '#6c5548', door: '#3b5d7a', shut: '#56704a', pitch: 2.3, h: 5.7, w: 9.5, porch: true },
    { x: 44, col: '#f0ebe0', roof: '#4e545e', door: '#2f6a58', shut: '#2a2a2a', pitch: 2.8, h: 3.4, w: 11, porch: true, garage: true },
    { x: 60, col: '#c7d3b0', roof: '#5b5e66', door: '#a4473a', shut: '#f1eee6', pitch: 2.4, h: 5.7, w: 9 },
    { x: 88, col: '#e8c8b8', roof: '#6a4d42', door: '#2e4c6c', shut: '#2e4c6c', pitch: 2.4, h: 5.6, w: 10, porch: true },
    { x: 105, col: '#b8c9d8', roof: '#4c525c', door: '#c9a24a', shut: '#3a4a5e', pitch: 2.6, h: 3.6, w: 11, garage: true },
    { x: 122, col: '#efe2c4', roof: '#5f4c42', door: '#5a7a4a', shut: '#5a7a4a', pitch: 2.4, h: 5.6, w: 10 },
    { x: -14, col: '#d9c7e0', roof: '#5a5560', door: '#3a6a5a', shut: '#4a4060', pitch: 2.4, h: 5.6, w: 10, porch: true },
  ];
  const mk = (q, side, i) => { const two = q.h > 4, lod = Math.abs(q.x) > 70 ? 1 : 0, wn = [['F', -q.w / 2 + 1.5, 1.4, 1.0, 1.5, (i + 1) % 4], ['F', q.w / 2 - 1.5, 1.4, 1.0, 1.5, (i + 2) % 4], ['L', -1.8, 1.4, 1.0, 1.5, i % 4], ['L', 1.8, 1.4, 1.0, 1.5, (i + 3) % 4], ['R', 0, 1.4, 1.0, 1.5, (i + 1) % 4]];
    if (two) wn.push(['F', -q.w / 2 + 1.5, 3.8, 1.0, 1.3, (i + 3) % 4], ['F', 0, 3.8, 1.0, 1.3, i % 4], ['F', q.w / 2 - 1.5, 3.8, 1.0, 1.3, (i + 2) % 4], ['L', 0, 3.8, 1.0, 1.3, (i + 1) % 4], ['R', 1.5, 3.8, 1.0, 1.3, (i + 2) % 4]);
    else wn.push(['F', 0.0, 1.4, 1.6, 1.5, (i + 3) % 4]);
    return stHouse({ x: q.x, z: side > 0 ? -8.6 - (i % 3) * 0.6 : 20.2 + (i % 2) * 0.7, rot: side > 0 ? 0 : Math.PI, w: q.w, d: 8.5, h: q.h, pitch: q.pitch, col: q.col, roof: q.roof, door: q.door, shut: q.shut, seed: 'h' + side + i, lod, doorX: -0.3, chim: i % 2 ? q.w / 2 - 1.2 : null,
      porch: q.porch ? { x0: -q.w / 2 + 0.6, x1: q.w / 2 - 0.6, d: 2.0, step: -0.3, cols: [-q.w / 2 + 0.75, -1.3, 0.7, q.w / 2 - 0.75] } : null, garage: q.garage ? { side: i % 2 ? -1 : 1, w: 3.8, d: 6.5, z: -1.4 } : null, win: wn }); };
  hv.forEach((q, i) => H.push(mk(q, 1, i)));
  const hf = [
    { x: -6, col: '#c9dcc4', roof: '#565a64', door: '#c8463a', shut: '#3f5a3a', pitch: 2.4, h: 5.7, w: 10, porch: true },
    { x: 11, col: '#f2e6c8', roof: '#6b5446', door: '#2d4e6e', shut: '#2d4e6e', pitch: 2.8, h: 3.5, w: 11, garage: true },
    { x: 28, col: '#b6c8dc', roof: '#50565e', door: '#e0b84a', shut: '#f2efe8', pitch: 2.4, h: 5.8, w: 9.5, porch: true },
    { x: 45, col: '#e6cfc4', roof: '#5e4a44', door: '#3c6a5a', shut: '#7a4a44', pitch: 2.4, h: 5.6, w: 10 },
    { x: 60, col: '#eeeadf', roof: '#454b55', door: '#2a5a8a', shut: '#2a2a2a', pitch: 2.6, h: 3.5, w: 10.5, garage: true },
    { x: 88, col: '#d4dcb4', roof: '#5b5e66', door: '#a4473a', shut: '#f1eee6', pitch: 2.4, h: 5.7, w: 9 },
    { x: 105, col: '#efd8a8', roof: '#6c5548', door: '#3b5d7a', shut: '#56704a', pitch: 2.3, h: 5.7, w: 9.5, porch: true },
    { x: 122, col: '#c4d4e2', roof: '#565a64', door: '#c8463a', shut: '#2f4a6a', pitch: 2.4, h: 3.6, w: 10.5 },
  ];
  hf.forEach((q, i) => H.push(mk(q, -1, i + 3)));
  [152, 169, 186, 222].forEach((x, i) => { H.push(mk({ ...hv[i % 6], x }, 1, i + 1)); H.push(mk({ ...hf[(i + 2) % 8], x: x + 4 }, -1, i + 5)); });
  stLamps();
  // ---- trees (parkways, front yards, backyards)
  const R = RNG('st-layout');
  [-10, 12, 24, 36, 48, 59, 83, 95, 107, 119, 131, 160, 177, 195, 225].forEach((x, i) => stTree('p' + i, x + R.n(0.6), 1.85, R.r(0.95, 1.12), i % 3 === 1 ? 'deep' : 'green', x > 70 ? 1 : 0));
  [-12, 7, 19, 30, 42, 54, 84, 96, 108, 120, 150, 166, 183, 220].forEach((x, i) => stTree('f' + i, x + R.n(0.6), 11.45, R.r(0.95, 1.12), i % 3 === 2 ? 'lime' : 'green', x > 40 ? 1 : 0));
  stTree('y1', 19.5, -4.6, 0.85, 'blossom', 0); stTree('y2', 35.5, -5.2, 0.95, 'deep', 0); stTree('y3', 16, 15.5, 0.9, 'lime', 1); stTree('y4', 51, 16, 0.9, 'blossom', 1);
  [[-2, -24], [14, -21], [33, -25], [50, -22], [66, -26], [94, -24], [113, -22], [3, 33], [20, 35], [37, 32], [55, 35], [92, 34], [112, 33]].forEach(([x, z], i) => stTree('b' + i, x, z, R.r(1.3, 1.6), ['green', 'deep', 'lime'][i % 3], 1));
  // lawns after the trees (shade under canopies)
  lawn(-80, 66, -70, 2.55, 1); lawn(76, 230, -70, 2.55, 2); lawn(-80, 66, 10.65, 90, 3); lawn(76, 230, 10.65, 90, 4);
  // driveways + front walks
  conc.add(stRBox(3.2, 0.1, 9.5, 0.02), stM(15.0, -0.03, -5.5), null); conc.add(stRBox(3.0, 0.1, 9.5, 0.02), stM(33.5, -0.03, -5.5), null); conc.add(stRBox(3.0, 0.1, 9.5, 0.02), stM(49, -0.03, -5.5), null);
  conc.add(stRBox(3.2, 0.1, 1.6, 0.02), stM(15.0, -0.04, 1.8), null); conc.add(stRBox(3.0, 0.1, 1.6, 0.02), stM(33.5, -0.04, 1.8), null);
  [[-2, 16], [6, 16], [20, 16], [36.5, 16.5], [53.5, 16]].forEach(([x, z]) => conc.add(stRBox(3.0, 0.1, 6, 0.02), stM(x, -0.03, z), null));
  const pav = stBatch(); for (let z = -1.6; z > -5.4; z -= 0.42) pav.add(stRBox(1.3, 0.06, 0.38, 0.03), stM(6.9 + Math.sin(z * 2) * 0.03, 0.0, z), stMix(stC('#c9b9a4'), stC('#a89a88'), (Math.sin(z * 7) + 1) / 2));
  S.add(pav.mesh(M.stone)); S.add(conc.mesh(M.conc)); S.add(lines.mesh(M.paint, false));
  // ---- fence + hedges + flowers + grass
  stFence(-9.5, 13.2, -1.35, [[6.3, 7.5]]);
  stFence(19.5, 34.5, -1.4, [[25.7, 26.9]]);
  stFoliage({ c: [4.0, 0.62, -6.15], r: [2.7, 0.62, 0.42], n: 22, cr: [0.35, 0.5], cards: 420, cs: [0.28, 0.42], pal: ST_PAL.hedge, seed: 'hedge1', det: 2, box: true });
  stFoliage({ c: [9.2, 0.55, -6.2], r: [1.0, 0.55, 0.42], n: 9, cr: [0.33, 0.45], cards: 160, cs: [0.28, 0.42], pal: ST_PAL.hedge, seed: 'hedge2', det: 2, box: true });
  stFoliage({ c: [-6.0, 0.7, -2.0], r: [2.8, 0.7, 0.5], n: 22, cr: [0.35, 0.5], cards: 380, cs: [0.28, 0.42], pal: ST_PAL.hedge, seed: 'hedge3', det: 2, box: true });
  [[2.0, -2.0], [-1.2, -2.0], [10.5, -2.0], [12.5, -5.8], [-3.8, -5.6]].forEach(([x, z], i) => stFoliage({ c: [x, 0.32, z], r: [0.75, 0.38, 0.5], n: 7, cr: [0.24, 0.36], cards: 90, cs: [0.2, 0.32], pal: ST_PAL.deep, seed: 'bed' + i, det: 2 }));
  { // flowers (instanced): beds along the fence, by the porch, in window boxes
    const fg = stFlowerGeo(), list = [], Rf = RNG('st-flowers'), pal = ['#f2a7b8', '#ffffff', '#f5d04a', '#e8604a', '#b98ad8', '#ff8fa0', '#f7efe0'];
    const bed = (x, z, rx, rz, n, y = 0.5) => { for (let i = 0; i < n; i++) { const a = Rf.r(0, TAU), q = Math.sqrt(Rf.f()); list.push([x + Math.cos(a) * rx * q, y + Rf.r(-0.12, 0.14) * (1 - q * 0.6), z + Math.sin(a) * rz * q, Rf.pick(pal), Rf.r(0.8, 1.3)]); } };
    [[2.0, -2.0], [-1.2, -2.0], [10.5, -2.0], [12.5, -5.8], [-3.8, -5.6]].forEach(([x, z]) => bed(x, z, 0.75, 0.48, 70, 0.55));
    ST.boxes.forEach(([x, y, z, ww]) => { for (let i = 0; i < 26; i++) list.push([x + Rf.r(-ww / 2, ww / 2), y + 0.12 + Rf.r(0, 0.1), z + Rf.r(-0.08, 0.08), Rf.pick(pal), Rf.r(0.9, 1.3)]); });
    const im = new THREE.InstancedMesh(fg, stSoft(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }), 0.5, false, 'stflw'), list.length); const cc = new THREE.Color();
    list.forEach(([x, y, z, c, s], i) => { im.setMatrixAt(i, stM(x, y, z, Rf.r(0, TAU), Rf.n(0.5), Rf.n(0.5), s)); im.setColorAt(i, cc.set(lin(c))); }); im.castShadow = true; im.receiveShadow = true; S.add(im);
    // window-box greenery
    ST.boxes.forEach(([x, y, z, ww], i) => stFoliage({ c: [x, y + 0.08, z], r: [ww / 2 + 0.05, 0.14, 0.12], n: 6, cr: [0.1, 0.16], cards: 40, cs: [0.12, 0.2], pal: ST_PAL.deep, seed: 'wb' + i, det: 2 }));
  }
  stGrass();
  // ---- props
  stMailbox(-1.7, 1.75); stHydrant(9.4, 2.15);
  [[22.6, 2.0, '#3a6ea8'], [23.4, 2.05, '#4a8a4c']].forEach(([x, z, c]) => { const b = stBatch(); b.add(stRBox(0.62, 1.0, 0.72, 0.06), stM(0, 0.52, 0), c).add(stRBox(0.68, 0.07, 0.8, 0.03), stM(0, 1.04, 0.0), stMix(stC(c), [0, 0, 0], 0.2)); const me = b.mesh(M.carPaint); me.position.set(x, 0, z); me.rotation.y = 0.1; S.add(me); (ST.bins = ST.bins || []).push(me); });
  ST.cars = [stCar(19.5, 3.55, 0, '#c8483c'), stCar(46, 3.6, 0, '#efeee9', true), stCar(2.5, 9.6, Math.PI, '#6fa3cf'), stCar(31, 9.55, Math.PI, '#94cdb8'), stCar(55, 9.6, Math.PI, '#e7bf4e', true), stCar(96, 3.6, 0, '#6a6f7a'), stCar(110, 9.6, Math.PI, '#b84a5a')];
  stPoles(); [64.4, 134.4, 204.4].forEach((x) => stSignal(x));
  // people + dog
  ST.jog = stPeep('jogger', { sex: 'f', age: 'young', outfit: 'tee', hair: 'pony', colors: { top: '#e8605a', bottom: '#2c3040', shoe: '#f4f4f4' }, lod: 1 }, { x: 21, z: 13.1, rot: -Math.PI / 2, s: 1, hairS: 'pony', shorts: true, cols: { skin: '#c98e6a', top: '#e8605a', bottom: '#2c3040', shoe: '#f4f4f4', hair: '#3a2416' } });
  ST.walker = stPeep('walker', { sex: 'm', age: 'old', outfit: 'casual', colors: { top: '#b8d0e4', bottom: '#b7a07e', shoe: '#5a4636' }, lod: 1 }, { x: 30, z: 0.45, rot: -Math.PI / 2, s: 1, cap: '#2f4f6f', hairS: 'bald', cols: { skin: '#e2b896', top: '#b8d0e4', bottom: '#b7a07e', shoe: '#5a4636', hair: '#d8d4cc' } });
  ST.dog = stDog(); ST.dog.root.position.set(28.4, 0.04, 0.0); ST.dog.root.rotation.y = Math.PI;
  ST.leash = new THREE.Mesh(new THREE.BufferGeometry(), stMatCol('#c8323a', 0.5)); S.add(ST.leash);
  ST.birds = []; const Rb = RNG('st-birds'); for (let i = 0; i < 6; i++) { const b = stBird(Rb); b.p = [16 + i * 1.7 + Rb.n(0.8), 8.5 + Rb.r(0, 2.4), 3 + Rb.r(-2, 3)]; ST.birds.push(b); }
  // the bill + the coin
  { const bg = new THREE.PlaneGeometry(0.3, 0.128, 12, 3), P = bg.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); P.setZ(i, 0.016 * (x / 0.15) ** 2 + 0.006 * Math.sin(y * 30 + x * 10)); } bg.computeVertexNormals(); bg.rotateX(-Math.PI / 2);
    const bill = new THREE.Mesh(bg, SM({ map: stTexBill(), roughness: 0.85, side: THREE.DoubleSide })); bill.position.set(-0.42, 0.045, 0.32); bill.rotation.y = 0.55; bill.castShadow = true; bill.receiveShadow = true; S.add(bill); ST.bill = bill; }
  { const ct = stTexCoin(), reed = g3Tex((x, w, h) => { for (let i = 0; i < w; i += 2) { x.fillStyle = i % 4 ? '#ffffff' : '#555555'; x.fillRect(i, 0, 2, h); } }, 256, 8, false); reed.wrapS = THREE.RepeatWrapping; reed.repeat.set(2, 1);
    const face = SM({ envMap: ST.env, color: lin('#ebe6de'), map: ct, metalness: 1, roughness: 0.36, bumpMap: ct, bumpScale: 0.9, roughnessMap: ct, envMapIntensity: 1.7 }), edge = SM({ envMap: ST.env, color: lin('#d6d2cc'), metalness: 1, roughness: 0.3, bumpMap: reed, bumpScale: 1, envMapIntensity: 2.4 });
    ST.coinFace = face; ST.coinEdge = edge; ST.coin = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.0036, 64, 1), [edge, face, face]); ST.coin.castShadow = true; S.add(ST.coin);
    ST.ghosts = [0.32, 0.18, 0.09].map((a) => { const m = new THREE.Mesh(ST.coin.geometry, [edge.clone(), face.clone(), face.clone()]); m.material.forEach((q) => { q.transparent = true; q.opacity = a; q.depthWrite = false; }); S.add(m); return m; });
    const glint = g3Tex((x, w) => { const c = w / 2; let gr = x.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.08, 'rgba(255,250,230,0.8)'); gr.addColorStop(0.3, 'rgba(255,230,180,0.15)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); x.globalCompositeOperation = 'lighter'; [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].forEach((a, i) => { x.save(); x.translate(c, c); x.rotate(a); gr = x.createLinearGradient(-c, 0, c, 0); const k = i < 2 ? 0.95 : 0.4; gr.addColorStop(0, 'rgba(255,240,210,0)'); gr.addColorStop(0.5, `rgba(255,250,235,${k})`); gr.addColorStop(1, 'rgba(255,240,210,0)'); x.fillStyle = gr; x.fillRect(-c, i < 2 ? -2 : -1, w, i < 2 ? 4 : 2); x.restore(); }); }, 256, 256);
    ST.glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glint, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); S.add(ST.glint); }
  // number plaque
  if (ST.plaque) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), SM({ map: stTextTex(ST.plaque.n, '#f4efe2', '#2a3a52'), roughness: 0.5 })); pl.applyMatrix4(ST.plaque.m); pl.position.z += 0.01; S.add(pl); }
  // the character
  ST.ch = chBuild(); S.add(ST.ch.root); ST.chBlob = stShadowBlob(0, -0.1, 0.75, 0.5, 0, 0.6, 0.045);
  stBuildBeats();
  return ST;
}
function stFlowerGeo() {
  const parts = [], cen = new THREE.SphereGeometry(0.014, 8, 6), pet = new THREE.SphereGeometry(0.02, 8, 6);
  parts.push([cen, stM(0, 0.008, 0, 0, 0, 0, 1, 0.7, 1), '#8a5a1a']);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; parts.push([pet, stM(Math.cos(a) * 0.022, 0.0, Math.sin(a) * 0.022, -a, 0, 0, 1.25, 0.35, 0.85), '#ffffff']); }
  return stMerge(parts);
}
function stGrass() {
  const R = RNG('st-grass-blades'), seg = 2, pos = [], col = [], nor = [], idx = [];
  for (let k = 0; k <= seg; k++) { const v = k / seg, w = 0.007 * (1 - v * 0.9); [-1, 1].forEach((s) => { pos.push(s * w * (k === seg ? 0.15 : 1), v, 0.25 * v * v); nor.push(0, 1, 0); const c = stMix(stC('#2f4f1c'), stC('#9cc458'), v); col.push(...c); }); }
  for (let k = 0; k < seg; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
  const L = [], add = (x0, x1, z0, z1, n, h0, h1) => { for (let i = 0; i < n; i++) L.push([R.r(x0, x1), R.r(z0, z1), R.r(h0, h1)]); };
  add(-4, 5.0, 1.05, 2.48, 5200, 0.05, 0.11); add(-4, 5.0, 0.98, 1.12, 700, 0.06, 0.14); add(-4, 9, -1.3, -1.02, 1100, 0.06, 0.15); add(-4, 9, -2.6, -1.4, 2200, 0.05, 0.1); add(-4, 0, 2.38, 2.5, 300, 0.08, 0.16);
  const im = new THREE.InstancedMesh(g, stSoft(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide }), 0.6, true, 'stgrass', 1.4), L.length), cc = new THREE.Color();
  L.forEach(([x, z, h], i) => { im.setMatrixAt(i, stM(x, 0.0, z, R.r(0, TAU), R.n(0.25), R.n(0.25), 1, h, 1)); const v = R.r(0.75, 1.15); im.setColorAt(i, cc.setRGB(v * R.r(0.9, 1.05), v, v * R.r(0.8, 1))); });
  im.receiveShadow = true; ST.scene.add(im);
}
function stMailbox(x, z) {
  const b = stBatch(), sh = new THREE.Shape(); sh.moveTo(-0.11, 0); sh.lineTo(0.11, 0); sh.lineTo(0.11, 0.14); sh.absarc(0, 0.14, 0.11, 0, Math.PI, false); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.46, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 3, curveSegments: 16 }); g.translate(0, 0, -0.23); g.computeVertexNormals();
  b.add(stRBox(0.1, 1.05, 0.1, 0.02), stM(0, 0.52, 0.0), '#e8e2d6').add(stRBox(0.1, 0.08, 0.36, 0.02), stM(0, 1.02, 0.0), '#e8e2d6').add(g, stM(0, 1.07, 0.0), '#2c3d5a').add(stRBox(0.012, 0.16, 0.05, 0.005), stM(-0.125, 1.22, -0.12), '#d23a2e').add(stRBox(0.012, 0.05, 0.1, 0.005), stM(-0.125, 1.28, -0.07), '#d23a2e').add(stRBox(0.03, 0.03, 0.06, 0.01), stM(0, 1.2, 0.25), '#c9c9c9');
  const me = b.mesh(ST.mat.carPaint); me.position.set(x, 0.0, z); me.rotation.y = Math.PI / 2; ST.scene.add(me);
}
function stHydrant(x, z) {
  const b = stBatch(), red = '#c8382c', P = [[0, 0], [0.16, 0], [0.16, 0.06], [0.12, 0.08], [0.11, 0.1], [0.105, 0.55], [0.13, 0.57], [0.13, 0.6], [0.11, 0.62], [0.1, 0.7], [0.06, 0.75], [0.03, 0.8], [0, 0.81]].map(([a, c]) => new THREE.Vector2(a, c));
  b.add(new THREE.LatheGeometry(P, 24), stM(0, 0, 0), red); b.add(new THREE.CylinderGeometry(0.02, 0.025, 0.05, 6), stM(0, 0.82, 0), '#e8e4da');
  [-1, 1].forEach((s) => { b.add(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 16), stM(s * 0.13, 0.42, 0, 0, 0, Math.PI / 2), red); b.add(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), stM(s * 0.19, 0.42, 0, 0, 0, Math.PI / 2), '#e8e4da'); });
  b.add(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 18), stM(0, 0.4, 0.13, 0, Math.PI / 2), red); b.add(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 6), stM(0, 0.4, 0.19, 0, Math.PI / 2), '#e8e4da');
  const me = b.mesh(ST.mat.carPaint); me.position.set(x, 0, z); me.rotation.y = -0.5; ST.scene.add(me);
}
function stPoles() {
  const b = stBatch(), wires = stBatch(), xs = [-24, 10, 44, 82, 116], z = 11.75;
  xs.forEach((x) => { b.add(stTube([V3(0, 0, 0), V3(0, 9.4, 0)], [0.15, 0.11], 10), stM(x, 0, z), '#7a6656'); b.add(stRBox(0.12, 0.12, 2.2, 0.02), stM(x, 8.8, z), '#6a5848'); [-0.9, 0, 0.9].forEach((dz) => b.add(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 10), stM(x, 8.93, z + dz), '#5d7a6a')); b.add(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 14), stM(x + 0.28, 7.6, z), '#8e9294'); });
  for (let i = 0; i < xs.length - 1; i++) { const a = xs[i], c = xs[i + 1]; [[-0.9, 9.0, 0.7], [0, 9.0, 0.7], [0.9, 9.0, 0.7], [0, 7.0, 0.9]].forEach(([dz, y, sag]) => { const P = []; for (let k = 0; k <= 18; k++) { const u = k / 18; P.push(V3(lerp(a, c, u), y - sag * 4 * u * (1 - u), z + dz)); } wires.add(stTube(P, P.map(() => 0.014), 5), stM(0, 0, 0), '#262626'); }); }
  ST.scene.add(b.mesh(ST.mat.bark)); const wm = wires.mesh(stMatCol('#2a2a2a', 0.6), true, false); ST.scene.add(wm);
  ST.wireY = (x) => { const a = 10, c = 44, u = (x - a) / (c - a); return 9.0 - 0.7 * 4 * u * (1 - u); };
  const Rb = RNG('st-perch'); ST.perched = [];
  [27.5, 28.2, 29.6, 30.1].forEach((x, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), stMatCol('#2b2622', 0.8)); m.scale.set(0.8, 1.1, 0.8); m.position.set(x, ST.wireY(x) + 0.09, 11.75 + 0.9 * (i % 2 ? 1 : 0)); ST.scene.add(m); });
}
function stSignal(x) {
  const b = stBatch(), metal = '#5c6262', z = 1.9, sig = { x, state: 'r', m: {}, glow: [] };
  b.add(stTube([V3(0, 0, 0), V3(0, 6.2, 0)], [0.13, 0.1], 12), stM(x, 0, z), metal); b.add(stTube(stCurve([[0, 5.6, 0], [0, 6.0, 2.5], [0, 6.0, 7.0]], 8), [0.09, 0.085, 0.08, 0.075, 0.07, 0.065, 0.06, 0.055, 0.05], 10), stM(x, 0, z), metal);
  b.add(stRBox(0.5, 0.25, 0.5, 0.06), stM(x, 0.12, z), metal); b.add(stTube([V3(0, 0, 0), V3(0, 3.6, 0)], [0.09, 0.08], 10), stM(x, 0, 11.3), metal);
  const heads = [[x, 5.2, z + 2.6], [x, 5.2, z + 6.0], [x - 0.2, 3.1, z], [x - 0.05, 3.3, 11.3]];
  const lm = (c) => new THREE.MeshStandardMaterial({ color: lin(c), emissive: lin(c), emissiveIntensity: 0.2, roughness: 0.3, fog: false });
  sig.m = { r: lm('#ff3a26'), a: lm('#ffb21e'), g: lm('#5dffa0') };
  const glowT = (c) => g3Radial([[0, `rgba(${c},0.95)`], [0.22, `rgba(${c},0.38)`], [1, `rgba(${c},0)`]]);
  ST.glowTex = ST.glowTex || { r: glowT('255,110,80'), g: glowT('140,255,180'), a: glowT('255,200,90'), w: glowT('255,214,150') };
  heads.forEach(([hx, hy, hz]) => {
    b.add(stRBox(0.36, 1.02, 0.34, 0.05), stM(hx, hy, hz), '#3a4436');
    [-1, 1].forEach((sd) => { b.add(stRBox(0.05, 1.2, 0.5, 0.02), stM(hx + sd * 0.2, hy, hz), '#2a2f28'); [0.32, 0, -0.32].forEach((dy, i) => { b.add(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 16, 1, true, 0, Math.PI), stM(hx + sd * 0.25, hy + dy + 0.04, hz, 0, 0, sd * Math.PI / 2), '#2f372c'); const m = new THREE.Mesh(stGC.lampG || (stGC.lampG = new THREE.SphereGeometry(0.115, 14, 10)), sig.m['rag'[i]]); m.scale.x = 0.4; m.position.set(hx + sd * 0.18, hy + dy, hz); ST.scene.add(m); }); });
    ['r', 'g'].forEach((k) => [-1, 1].forEach((sd) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex[k], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.position.set(hx + sd * 0.34, hy + (k === 'r' ? 0.32 : -0.32), hz); sp.scale.set(2.6, 2.6, 1); ST.scene.add(sp); sig.glow.push([k, sp]); }));
  });
  [['LUCKY LN', 0], ['MAPLE AVE', Math.PI / 2]].forEach(([s2, r], i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.26, 0.02), [stMatCol('#1f6a3c', 0.5), stMatCol('#1f6a3c', 0.5), stMatCol('#1f6a3c', 0.5), stMatCol('#1f6a3c', 0.5), new THREE.MeshStandardMaterial({ map: stSignTex(s2), roughness: 0.5 }), new THREE.MeshStandardMaterial({ map: stSignTex(s2), roughness: 0.5 })]); m.position.set(x, 4.0 + i * 0.3, z); m.rotation.y = r + Math.PI / 2; ST.scene.add(m); });
  ST.scene.add(b.mesh(ST.mat.carPaint)); ST.signals.push(sig); stSetSignal(sig, 'g');
}
function stSetSignal(sig, st) { sig.state = st; sig.m.r.emissiveIntensity = st === 'r' ? 3.2 : 0.25; sig.m.a.emissiveIntensity = st === 'a' ? 3.2 : 0.25; sig.m.g.emissiveIntensity = st === 'g' ? 3.2 : 0.25; sig.glow.forEach(([k, sp]) => { sp.visible = k === st; }); }

// ---------- street lamps (glow at dusk)
function stLamps() {
  const b = stBatch(); ST.lampGlow = []; ST.lampMat = new THREE.MeshStandardMaterial({ color: lin('#fff1d6'), emissive: lin('#ffcf8a'), emissiveIntensity: 0.0, roughness: 0.4 });
  const add = (x, z, s) => { b.add(stTube([V3(0, 0, 0), V3(0, 4.6, 0), V3(0, 5.0, s * 0.3), V3(0, 5.05, s * 1.0)], [0.075, 0.06, 0.05, 0.045], 10), stM(x, 0, z), '#3c4140'); b.add(stRBox(0.32, 0.14, 0.5, 0.06), stM(x, 5.0, z + s * 1.15), '#3c4140'); const bl = new THREE.Mesh(stRBox(0.24, 0.05, 0.38, 0.02), ST.lampMat); bl.position.set(x, 4.92, z + s * 1.15); ST.scene.add(bl); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,220,160,0.9)'], [0.2, 'rgba(255,190,120,0.35)'], [1, 'rgba(255,170,90,0)']]), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.position.set(x, 4.85, z + s * 1.15); sp.scale.set(3, 3, 1); sp.visible = false; ST.scene.add(sp); ST.lampGlow.push(sp); };
  for (let x = -40; x < 230; x += 30) { if (Math.abs(x - 64) < 4 || Math.abs(x - 134) < 4) continue; if (x + 15 < -8 || x + 15 > 14) add(x + 15, 2.25, 1); add(x, 11.0, -1); }
  ST.scene.add(b.mesh(ST.mat.carPaint));
}
// ---------- weather presets (blend two by k)
const ST_WX = {
  sunny: { sun: 3.7, sunC: '#ffdcae', dir: [0.55, 0.42, 0.72], hemi: 0.72, sky: '#c9dcf4', gnd: '#8c8a64', fog: '#ecd9c3', fd: 0.0085, storm: 0, dusk: 0, wet: 0, lamps: 0 },
  late: { sun: 3.4, sunC: '#ffc184', dir: [0.42, 0.24, 0.88], hemi: 0.62, sky: '#c4cfe6', gnd: '#857a5c', fog: '#ebcfae', fd: 0.009, storm: 0, dusk: 0.35, wet: 0, lamps: 0 },
  over: { sun: 1.1, sunC: '#e6ecf2', dir: [0.4, 0.6, 0.7], hemi: 1.25, sky: '#c6ced8', gnd: '#77796c', fog: '#b7bec4', fd: 0.011, storm: 0.55, dusk: 0, wet: 0.7, lamps: 0 },
  storm: { sun: 0.0, sunC: '#9aa8b8', dir: [0.4, 0.6, 0.7], hemi: 0.62, sky: '#78838f', gnd: '#3c4038', fog: '#4f585f', fd: 0.02, storm: 1, dusk: 0, wet: 1, lamps: 0.4 },
  dusk: { sun: 2.4, sunC: '#ff8a4a', dir: [0.93, 0.1, 0.36], hemi: 0.42, sky: '#7d7fb8', gnd: '#4a3a34', fog: '#c08a80', fd: 0.0095, storm: 0, dusk: 1, wet: 0, lamps: 1 },
};
function stWeather(a, b2 = a, k = 0, o = {}) {
  const A = ST_WX[a], B = ST_WX[b2], L = (p) => lerp(A[p], B[p], k), C = (p) => lin(A[p]).lerp(lin(B[p]), k), S = ST.sun;
  const dir = V3(...A.dir).lerp(V3(...B.dir), k).normalize();
  S.intensity = L('sun') * (o.sunK ?? 1); S.castShadow = S.intensity > 0.05; S.color.copy(C('sunC')); S.target.position.set(...(o.tgt ?? [24, 0, 2])); S.position.copy(S.target.position).addScaledVector(dir, 90); S.target.updateMatrixWorld();
  ST.hemi.intensity = L('hemi') * (o.hemiK ?? 1); ST.hemi.color.copy(C('sky')); ST.hemi.groundColor.copy(C('gnd'));
  ST.scene.fog.color.copy(C('fog')); ST.scene.fog.density = o.fd ?? L('fd');
  const u = ST.sky.material.uniforms; u.sun.value.copy(dir); u.storm.value = L('storm'); u.dusk.value = L('dusk'); u.front.value = o.front ?? 0; u.gain.value = o.gain ?? 1;
  const env = ST.envs[(k < 0.5 ? a : b2) === 'storm' ? 'storm' : (k < 0.5 ? a : b2) === 'over' ? 'over' : (k < 0.5 ? a : b2) === 'dusk' ? 'dusk' : 'sunny'];
  [ST.mat.glass, ST.mat.carPaint, ST.mat.carGlass, ST.mat.chrome, ST.coinFace, ST.coinEdge, ST.mat.water].forEach((m) => { if (m && m.envMap !== env) { m.envMap = env; } });
  const wet = L('wet'); [['lawn', 0.95], ['conc', 0.9], ['asph', 0.88]].forEach(([n, r]) => { const m = ST.mat[n]; m.roughness = lerp(r, n === 'lawn' ? 0.7 : 0.32, wet); m.color.setScalar(1 - 0.38 * wet); });
  const lm = L('lamps'); ST.lampMat.emissiveIntensity = lm * 3; ST.lampGlow.forEach((sp) => { sp.visible = lm > 0.3; sp.material.opacity = lm; });
  ST.wx = { dir, storm: L('storm') };
}
// ---------- rain (crossed streaks around the camera; optional dry hole over the house)
function stRain(n = 3800) {
  const g = new THREE.PlaneGeometry(0.014, 0.55); const g2 = g.clone().rotateY(Math.PI / 2); const geo = stMerge([[g, new THREE.Matrix4(), '#ffffff'], [g2, new THREE.Matrix4(), '#ffffff']]);
  const m = new THREE.MeshBasicMaterial({ color: lin('#c9d3de'), transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide });
  const im = new THREE.InstancedMesh(geo, m, n); im.frustumCulled = false; im.visible = false; ST.scene.add(im);
  const R = RNG('st-rain'); im.userData.p = Array.from({ length: n }, () => [R.f(), R.f(), R.f(), R.r(0.8, 1.2)]); ST.rain = im;
}
function stRainUpdate(t, cam, hole, sc) {
  const im = ST.rain, scene = sc || ST.scene; if (im.parent !== scene) scene.add(im); im.visible = true; const B = [46, 22, 46], c = cam.position, m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = V3(1, 1, 1), pv = V3(0, 0, 0);
  im.userData.p.forEach(([a, b, d, s], i) => {
    const x = c.x - B[0] / 2 + ((a * B[0] - c.x) % B[0] + B[0]) % B[0] + Math.floor(c.x / B[0]) * 0, z = c.z + (((d * B[2] - c.z) % B[2] + B[2]) % B[2]) - B[2] / 2, y = (((b * B[1] - t * 13 * s) % B[1]) + B[1]) % B[1] - 1;
    const xx = c.x + (((a * B[0] - c.x) % B[0] + B[0]) % B[0]) - B[0] / 2;
    let k = 1; if (hole && Math.hypot(xx - hole[0], z - hole[1]) < hole[2]) k = 0;
    pv.set(xx + y * 0.08, y, z); sv.set(k, k * s, k); m.compose(pv, q, sv); im.setMatrixAt(i, m);
  });
  im.instanceMatrix.needsUpdate = true;
}
// ---------- lightning bolt (jagged emissive tube + glow)
function stBolt(a, b, seed, parent) {
  const R = RNG('st-bolt', seed), main = [], n = 16, A = V3(...a), Bv = V3(...b);
  for (let i = 0; i <= n; i++) { const u = i / n, p = A.clone().lerp(Bv, u); if (i > 0 && i < n) p.add(V3(R.n(1), R.n(0.3), R.n(1)).multiplyScalar(1.6 * Math.sin(u * Math.PI) + 0.3)); main.push(p); }
  const parts = [[stTube(main, main.map((_, i) => 0.16 * (1 - i / n * 0.5)), 5), new THREE.Matrix4(), '#ffffff']];
  for (let k = 0; k < 4; k++) { const i0 = R.i(2, n - 5), br = [main[i0].clone()]; const dir = V3(R.n(1), -R.r(0.6, 1), R.n(1)).normalize(); for (let j = 1; j < 6; j++) br.push(br[j - 1].clone().addScaledVector(dir, R.r(0.8, 1.6)).add(V3(R.n(0.4), 0, R.n(0.4)))); parts.push([stTube(br, br.map((_, j) => 0.08 * (1 - j / 6)), 4), new THREE.Matrix4(), '#ffffff']); }
  const G = new THREE.Group(), me = new THREE.Mesh(stMerge(parts), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: false })); G.add(me);
  const gl = new THREE.MeshBasicMaterial({ color: lin('#9fb8ff'), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
  G.add(new THREE.Mesh(stMerge(parts.map(([g2, m2]) => { const gg = g2.clone(), P = gg.attributes.position, Nn = gg.attributes.normal; for (let i = 0; i < P.count; i++) P.setXYZ(i, P.getX(i) + Nn.getX(i) * 0.5, P.getY(i) + Nn.getY(i) * 0.5, P.getZ(i) + Nn.getZ(i) * 0.5); return [gg, m2, '#ffffff']; })), gl));
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex.w, color: lin('#cfe0ff'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.position.copy(Bv); sp.scale.set(9, 9, 1); G.add(sp);
  (parent || ST.scene).add(G); G.visible = false; return G;
}
// ---------- beat props (built once, hidden until their beat)
function stTexLabel(lines, fg, bg, w = 512, h = 256, size = 70, font = 'Helvetica, Arial, sans-serif', border) { return g3Tex((x) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); if (border) { x.strokeStyle = border; x.lineWidth = 10; x.strokeRect(8, 8, w - 16, h - 16); } x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; lines.forEach((l, i) => { x.font = `bold ${Array.isArray(l) ? l[1] : size}px ${font}`; x.fillText(Array.isArray(l) ? l[0] : l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.1); }); }, w, h); }
function stSoldSign(parent, x, z, ry = 0) {
  const b = stBatch(); b.add(stRBox(0.07, 1.25, 0.07, 0.015), stM(-0.4, 0.62, 0), '#f2efe8').add(stRBox(0.9, 0.06, 0.06, 0.015), stM(0.0, 1.2, 0), '#f2efe8');
  const me = b.mesh(ST.mat.paint); const G = new THREE.Group(); G.add(me);
  const sg = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.48, 0.02), [stMatCol('#fff', 0.5), stMatCol('#fff', 0.5), stMatCol('#fff', 0.5), stMatCol('#fff', 0.5), new THREE.MeshStandardMaterial({ map: ST.tex.forsale, roughness: 0.6 }), new THREE.MeshStandardMaterial({ map: ST.tex.forsale, roughness: 0.6 })]); sg.position.set(0.05, 0.9, 0); sg.castShadow = true; G.add(sg);
  const sd = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.025), new THREE.MeshStandardMaterial({ map: ST.tex.sold, roughness: 0.5 })); sd.position.set(0.05, 1.08, 0); sd.rotation.z = -0.12; G.add(sd);
  G.position.set(x, 0, z); G.rotation.y = ry; parent.add(G); return G;
}
function stBox(b, x, y, z, s = 0.5, ry = 0) { b.add(stRBox(s, s * 0.75, s * 0.8, 0.02), stM(x, y + s * 0.375, z, ry), '#b88a58').add(stRBox(s + 0.005, s * 0.06, 0.07, 0.01), stM(x, y + s * 0.75, z, ry), '#d8c69e'); }
function stTruck(parent, x, z, ry) {
  const G = new THREE.Group(); G.position.set(x, -0.13, z); G.rotation.y = ry; parent.add(G); const b = stBatch(), d = stBatch();
  b.add(stRBox(5.4, 2.5, 2.3, 0.08), stM(-0.9, 1.95, 0), '#f3f1ec').add(stRBox(1.9, 1.5, 2.2, 0.18), stM(2.75, 1.45, 0), '#e8eef2').add(stRBox(1.2, 0.8, 2.1, 0.22), stM(2.95, 2.45, 0), '#e8eef2');
  b.add(stRBox(5.5, 0.25, 2.34, 0.04), stM(-0.9, 0.62, 0), '#c84a3a');
  [[2.6, 1], [2.6, -1], [-2.4, 1], [-2.4, -1], [-1.5, 1], [-1.5, -1]].forEach(([wx, s]) => d.add(new THREE.TorusGeometry(0.33, 0.15, 10, 22), stM(wx, 0.48, s * 1.0), '#2a2a2c'));
  d.add(stRBox(0.06, 0.9, 2.0, 0.03), stM(3.72, 2.0, 0, 0, 0, -0.25), '#1c242c'); [-1, 1].forEach((s) => d.add(stRBox(1.0, 0.7, 0.04, 0.02), stM(2.85, 2.2, s * 1.12), '#1c242c'));
  G.add(b.mesh(ST.mat.paint)); G.add(d.mesh(ST.mat.paint));
  [-1, 1].forEach((s) => { const lb = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.0), new THREE.MeshStandardMaterial({ map: ST.tex.movers, roughness: 0.6 })); lb.position.set(-0.9, 2.1, s * 1.162); if (s < 0) lb.rotation.y = Math.PI; G.add(lb); });
  G.add(stShadowBlob(0, 0, 8.0, 3.0, 0, 0.8, 0.012));
  return G;
}
function stPlacard(P, txt, col = '#ffffff') { const g = new THREE.Group(); const bd = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.5, 0.02), [stMatCol(col, 0.7), stMatCol(col, 0.7), stMatCol(col, 0.7), stMatCol(col, 0.7), new THREE.MeshStandardMaterial({ map: stTexLabel(txt, '#2a2a2a', col, 512, 330, 92, 'Marker Felt, Comic Sans MS, Chalkboard, sans-serif'), roughness: 0.8 }), stMatCol(col, 0.7)]); bd.castShadow = true; g.add(bd); const st = new THREE.Mesh(stRBox(0.03, 0.9, 0.03, 0.01), stMatCol('#b08a5a', 0.8)); st.position.set(0, -0.6, -0.02); g.add(st); P.root.add(g); g.position.set(0, 1.62, 0.42); return g; }
function stBuildBeats() {
  const S = ST.scene, G = (n) => { const g = new THREE.Group(); g.visible = false; S.add(g); ST.grp[n] = g; return g; };
  ST.tex = { forsale: stTexLabel(['FOR SALE', ['555-0107', 44]], '#ffffff', '#b8362c', 512, 340, 92), sold: stTexLabel(['SOLD'], '#b8362c', '#ffffff', 512, 128, 100), movers: stTexLabel(['EASY MOVE', ['local & long distance', 40]], '#2a5a8a', '#f3f1ec', 1024, 284, 120), ticket: stTexLabel(['POWERBALL', ['07 13 22 31 48 · 19', 46]], '#c8283a', '#fbe9ec', 512, 256, 80), ad: stTexLabel([['POWERBALL', 110], ['$1.6 BILLION', 92], ['JACKPOT', 70]], '#ffffff', '#c8283a', 512, 820, 100) };
  stRain();
  // storm: light shaft + sun spot over the house
  { const g = G('hole'); const sp = new THREE.SpotLight(lin('#ffd9a0'), 6.5, 90, 0.2, 0.45, 1.0); sp.position.set(8.5, 48, -5); sp.target.position.set(8.5, 0, -5); sp.castShadow = true; sp.shadow.mapSize.set(768, 768); sp.shadow.bias = -0.0006; sp.shadow.radius = 3; g.add(sp, sp.target); ST.holeSpot = sp;
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 10.5, 46, 32, 1, true), new THREE.MeshBasicMaterial({ map: g3Tex((x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,225,170,0.55)'); gr.addColorStop(0.7, 'rgba(255,215,160,0.2)'); gr.addColorStop(1, 'rgba(255,210,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${0.04 + (i % 3) * 0.02})`; x.fillRect((i * 37) % w, 0, 3 + (i % 4), h); } }, 256, 64), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    cone.position.set(8.5, 23, -5); g.add(cone); ST.shaft = cone; }
  ST.bolts = { tree: stBolt([36, 46, 22], [30.2, 7.2, 11.45], 'tree'), car: stBolt([36, 46, 22], [31, 1.2, 9.6], 'car') };
  // greens: the convertible
  { const g = G('conv'); ST.conv = stCar(0, 0, 0, '#3fae8c', false, { conv: true, parent: g }); }
  // twenty: bill in hand
  // rival: dead car with the hood up, steam, the rival in a suit
  { const g = G('rival'); const car = stCar(24, 3.55, 0, '#2c3a52', false, { parent: g }); const hb = stBatch(); hb.add(stRBox(1.15, 0.06, 1.62, 0.03), stM(-0.575, 0, 0), '#2c3a52'); const hood = hb.mesh(ST.mat.carPaint); const hinge = new THREE.Group(); hinge.position.set(1.1 + 0.0, 1.03, 0); hinge.rotation.z = 1.05; hinge.add(hood); hood.position.x = 1.15; car.add(hinge);
    const eb = stBatch(); eb.add(stRBox(0.9, 0.3, 1.3, 0.05), stM(1.65, 0.85, 0), '#3a3a3c').add(stRBox(0.4, 0.2, 0.5, 0.05), stM(1.5, 1.05, 0.3), '#55585a').add(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 14), stM(1.9, 1.05, -0.4), '#c8b03a'); car.add(eb.mesh(ST.mat.paint));
    ST.steam = []; const st = g3Radial([[0, 'rgba(255,255,255,0.75)'], [0.5, 'rgba(240,240,240,0.3)'], [1, 'rgba(240,240,240,0)']]); for (let i = 0; i < 14; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: st, transparent: true, depthWrite: false })); g.add(sp); ST.steam.push(sp); }
    ST.rival = stPeep('rival', { sex: 'm', age: 'young', outfit: 'suit', hair: 'side', colors: { top: '#2b3448', bottom: '#2b3448', tie: '#b8343a', shirt: '#f4f2ee', shoe: '#2a1e18' }, beard: 'none' }, { parent: g, x: 26.4, z: 2.15, rot: Math.PI * 0.62, suit: '#b8343a', brow: 1, hairS: 'short', cols: { skin: '#d9a07c', top: '#2b3448', bottom: '#2b3448', shoe: '#2a1e18', hair: '#1c1612', sleeve: '#2b3448', arm: '#2b3448' } });; }
  // losers: bus stop + crowd + ticket scraps
  { const g = G('bus'); const b = stBatch(), gl = stBatch(), x0 = 40, z0 = 13.6;
    [[-1.6, -0.55], [1.6, -0.55], [-1.6, 0.55], [1.6, 0.55]].forEach(([dx, dz]) => b.add(stRBox(0.07, 2.4, 0.07, 0.02), stM(x0 + dx, 1.2, z0 + dz), '#4a5250'));
    b.add(stRBox(3.6, 0.1, 1.5, 0.03), stM(x0, 2.45, z0), '#4a5250').add(stRBox(2.4, 0.06, 0.4, 0.02), stM(x0, 0.48, z0 + 0.32), '#7a5a3a'); [-0.9, 0.9].forEach((dx) => b.add(stRBox(0.06, 0.45, 0.3, 0.02), stM(x0 + dx, 0.24, z0 + 0.32), '#4a5250'));
    gl.add(stRBox(3.2, 1.8, 0.02, 0.01), stM(x0, 1.3, z0 + 0.55), null); gl.add(stRBox(0.02, 1.8, 1.0, 0.01), stM(x0 - 1.6, 1.3, z0), null);
    g.add(b.mesh(ST.mat.paint)); const gm = gl.mesh(new THREE.MeshStandardMaterial({ envMap: ST.env, color: lin('#cfe0e8'), roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false })); g.add(gm);
    const ad = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.6), new THREE.MeshStandardMaterial({ map: ST.tex.ad, emissive: lin('#ffffff'), emissiveMap: ST.tex.ad, emissiveIntensity: 0.35, roughness: 0.4 })); ad.position.set(x0 + 1.55, 1.3, z0); ad.rotation.y = -Math.PI / 2; g.add(ad);
    const pole = stBatch(); pole.add(stRBox(0.06, 2.6, 0.06, 0.02), stM(x0 - 2.4, 1.3, z0 - 0.9), '#4a5250'); g.add(pole.mesh(ST.mat.paint)); const bs = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshStandardMaterial({ map: stTexLabel([['BUS', 150], ['12', 120]], '#ffffff', '#2a6aa8', 256, 256, 110), side: THREE.DoubleSide })); bs.position.set(x0 - 2.4, 2.45, z0 - 0.88); g.add(bs);
    const sg = new THREE.PlaneGeometry(0.07, 0.035); ST.scraps = new THREE.InstancedMesh(sg, new THREE.MeshStandardMaterial({ map: ST.tex.ticket, side: THREE.DoubleSide, roughness: 0.8 }), 700); ST.scraps.frustumCulled = false; g.add(ST.scraps); }
  // crowd pool (reused by losers / signs / moving / flood)
  { const R = RNG('st-crowd'), skins = ['#f0c6a4', '#d9a07c', '#b77a52', '#8a5638', '#e8b48e', '#6e4128'], hair = ['#2a1c14', '#5a3a22', '#c9a46a', '#1a1412', '#8a4a2a', '#d8d4cc'], tops = ['#e86a5a', '#4a7ab8', '#f2c84a', '#5aa070', '#9a6ab8', '#f0efe8', '#2f3a4a', '#e88aa8', '#7ab8c8', '#c87a3a', '#6a8a3a', '#b84a5a'], bots = ['#2c3448', '#3a5272', '#6a5a48', '#2a2a2c', '#8a7a62', '#4a4a5a'], hs = ['short', 'pony', 'bob', 'curly', 'long', 'bald', 'short'];
    ST.crowd = []; for (let i = 0; i < 12; i++) { const fo = { s: R.r(0.92, 1.06), hairS: R.pick(hs), brow: 1, cap: i === 4 ? '#c84a3a' : null, cols: { skin: R.pick(skins), top: tops[i], bottom: R.pick(bots), shoe: R.pick(['#f4f4f4', '#2a2a2a', '#7a5a3a', '#c84a3a']), hair: R.pick(hair) } }; const P = stPeep('crowd' + i, { colors: { top: tops[i] }, lod: 1 }, fo); P._ph = i * 0.37; P.root.visible = false; ST.crowd.push(P); }
    ST.kid = stPeep('kid', { sex: 'f', age: 'young', height: 0.66, outfit: 'tee', colors: { top: '#f2c84a', bottom: '#4a7ab8' }, lod: 1 }, { s: 0.66, hairS: 'pony', brow: 1, cols: { skin: '#e8b48e', top: '#f2c84a', bottom: '#4a7ab8', shoe: '#f4f4f4', hair: '#5a3a22' } }); ST.kid.root.visible = false; }
  // placards (signs beat)
  ST.placards = [[['PLEASE', 'LEAVE'], '#fff6d8'], [['STAY', 'AWAY'], '#ffffff'], [['WE\'RE', 'SORRY'], '#e8f2ff'], [['PLEASE'], '#ffe8e8'], [['NOTHING', 'PERSONAL'], '#ffffff'], [['GO SOMEWHERE', 'SAFE?'], '#f0ffe8']].map(([t2, c], i) => { const pl = stPlacard(ST.crowd[i], t2, c); pl.visible = false; return pl; });
  // flood: water everywhere except his lot
  { const g = G('flood'); const nt = g3Tex((x, w, h) => { const R = RNG('st-ripple'); x.fillStyle = '#8080ff'; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const cx = R.r(0, w), cy = R.r(0, h), r = R.r(4, 26); const gr = x.createRadialGradient(cx, cy, r * 0.6, cx, cy, r); gr.addColorStop(0, 'rgba(128,128,255,0)'); gr.addColorStop(0.5, `rgba(${R.f() < 0.5 ? '150,150' : '106,106'},255,0.5)`); gr.addColorStop(1, 'rgba(128,128,255,0)'); x.fillStyle = gr; x.beginPath(); x.ellipse(cx, cy, r, r * 0.7, 0, 0, TAU); x.fill(); } }, 256, 256, false); nt.wrapS = nt.wrapT = THREE.RepeatWrapping; nt.repeat.set(1 / 3.5, 1 / 3.5);
    ST.mat.water = new THREE.MeshStandardMaterial({ envMap: ST.envs.over, color: lin('#26332f'), roughness: 0.02, metalness: 0.62, normalMap: nt, normalScale: new THREE.Vector2(0.55, 0.55), transparent: true, opacity: 0.93, envMapIntensity: 1.5 }); ST.waterN = nt;
    [[-80, 1.0, -60, 90], [17.4, 230, -60, 90], [1.0, 17.4, -1.3, 90]].forEach(([x0, x1, z0, z1]) => { const p = new THREE.PlaneGeometry(x1 - x0, z1 - z0); p.rotateX(-Math.PI / 2); const U = p.attributes.uv, P = p.attributes.position; for (let i = 0; i < U.count; i++) U.setXY(i, P.getX(i) + (x0 + x1) / 2, P.getZ(i) + (z0 + z1) / 2); const m = new THREE.Mesh(p, ST.mat.water); m.position.set((x0 + x1) / 2, 0.3, (z0 + z1) / 2); m.receiveShadow = true; g.add(m); });
    const fl = stBatch(); fl.add(new THREE.SphereGeometry(0.22, 16, 12), stM(22, 0.32, 4.5), '#e84a3a').add(new THREE.SphereGeometry(0.221, 16, 12, 0, Math.PI / 3), stM(22, 0.32, 4.5), '#f6f2e8').add(stRBox(0.62, 1.0, 0.72, 0.06), stM(31.5, 0.35, -3.2, 0.4, 1.3), '#3a6ea8').add(stRBox(0.5, 0.06, 0.5, 0.02), stM(-3, 0.32, 6.5, 0.7), '#e8d24a').add(new THREE.TorusGeometry(0.28, 0.1, 10, 20), stM(25, 0.32, 8, 0, Math.PI / 2), '#f2c83a');
    g.add(fl.mesh(ST.mat.carPaint)); }
  // moving: trucks, SOLD signs, boxes, a couch
  { const g = G('moving'), sold = G('sold'); ST.truckA = stTruck(g, 27.5, 3.75, 0); ST.truckB = stTruck(g, 46, 9.4, Math.PI);
    const rb = stBatch(); rb.add(stRBox(1.4, 0.04, 2.6, 0.01), stM(23.4, 0.36, 3.75, 0, 0, -0.22), '#b8bcbe'); g.add(rb.mesh(ST.mat.chrome));
    const bx = stBatch(); [[26, -3.0], [26.6, -3.2], [26.3, -2.6], [28.2, -2.4], [43, -2.8], [43.6, -2.6], [45, 15.6], [45.6, 15.4], [-5, 15.2], [-5.6, 15.5], [-4.8, 15.8]].forEach(([x, z], i) => { stBox(bx, x, 0, z, 0.5 + (i % 3) * 0.08, i * 0.4); if (i % 2) stBox(bx, x + 0.05, 0.4 + (i % 3) * 0.06, z, 0.42, i); }); g.add(bx.mesh(ST.mat.paint));
    const cb = stBatch(); cb.add(stRBox(1.9, 0.42, 0.8, 0.12), stM(0, 0.42, 0), '#5a7a9a').add(stRBox(1.9, 0.5, 0.2, 0.1), stM(0, 0.8, -0.32), '#5a7a9a').add(stRBox(0.2, 0.62, 0.8, 0.1), stM(-0.95, 0.6, 0), '#5a7a9a').add(stRBox(0.2, 0.62, 0.8, 0.1), stM(0.95, 0.6, 0), '#5a7a9a'); ST.couch = cb.mesh(ST.mat.paint); g.add(ST.couch);
    [[27, -3.6], [44, -3.4], [60.5, -3.8], [-6, 16.8], [11, 16.6], [28, 16.8], [88, -3.6], [105, 16.8]].forEach(([x, z]) => stSoldSign(sold, x, z, z > 5 ? Math.PI : 0)); }
}
// ---------- billion: the whole town from the air (instanced, built on first use)
function stTown() {
  if (ST.town) return ST.town;
  const G = new THREE.Group(); ST.scene.add(G); ST.town = G; const R = RNG('st-town');
  const gnd = new THREE.PlaneGeometry(5000, 5000, 100, 100); gnd.rotateX(-Math.PI / 2); const P = gnd.attributes.position, col = new Float32Array(P.count * 3);
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), n = stN3(x * 0.004, z * 0.004, 2) * 0.5 + stN3(x * 0.017, z * 0.013, 5) * 0.3; col.set(stMix(stC('#6f9440'), stC('#a8a45a'), clamp(n + 0.4)), i * 3); }
  gnd.setAttribute('color', new THREE.BufferAttribute(col, 3)); const gm = new THREE.Mesh(gnd, new THREE.MeshLambertMaterial({ vertexColors: true })); gm.position.y = -0.25; G.add(gm);
  const keep = (x, z) => x > -90 && x < 236 && z > -45 && z < 48;
  const rd = stBatch(); for (let k = -14; k <= 8; k++) { const z = 6.6 + k * 70; if (k !== 0) rd.add(stRBox(4000, 0.05, 7.5, 0.01), stM(400, -0.2, z), '#5c5d60'); } for (let k = -6; k <= 14; k++) { const x = 71 + k * 140; rd.add(stRBox(7.5, 0.05, 4000, 0.01), stM(x, -0.19, -200), '#5c5d60'); }
  rd.add(stRBox(4000, 0.06, 22, 0.01), stM(400, -0.17, -1100), '#55565a'); G.add(rd.mesh(new THREE.MeshLambertMaterial({ vertexColors: true }), false, false));
  const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({ envMap: ST.envs.sunny, color: lin('#3c6a82'), roughness: 0.05, metalness: 0.2 })); lake.rotation.x = -Math.PI / 2; lake.scale.set(260, 170, 1); lake.position.set(900, -0.15, -620); G.add(lake);
  const hb = stBatch(); hb.add(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.Matrix4(), '#ffffff'); const walls = stMerge(hb.parts);
  const rs = new THREE.Shape(); rs.moveTo(-0.6, 0); rs.lineTo(0.6, 0); rs.lineTo(0, 0.42); rs.closePath(); const roofG = new THREE.ExtrudeGeometry(rs, { depth: 1.1, bevelEnabled: false }); roofG.translate(0, 0, -0.55); roofG.rotateY(Math.PI / 2); roofG.computeVertexNormals();
  const L = []; for (let k = -12; k <= 7; k++) for (const sd of [-1, 1]) { const z = 6.6 + k * 70 + sd * 17; for (let x = -900; x < 1700; x += R.r(15, 19)) { if (keep(x, z) || Math.abs(((x - 71) % 140 + 140) % 140 - 0) < 12 || Math.abs(((x - 71) % 140 + 140) % 140 - 140) < 12) continue; if (Math.hypot((x - 900) / 270, (z + 620) / 180) < 1) continue; L.push([x, z, sd]); } }
  const pal = ['#f0e8d8', '#c9dcec', '#e9dcae', '#d6e2c4', '#f2d6c8', '#e8e8ee', '#d4c4e0', '#f4ead0'], roofs = ['#565a64', '#6c5548', '#4e545e', '#7a4a3c', '#5b5e66'];
  const iw = new THREE.InstancedMesh(walls, new THREE.MeshLambertMaterial({ vertexColors: true }), L.length), ir = new THREE.InstancedMesh(roofG, new THREE.MeshLambertMaterial(), L.length), cc = new THREE.Color();
  L.forEach(([x, z, sd], i) => { const w = R.r(9, 13), d = R.r(8, 10), h = R.r(3.2, 6), ry = sd > 0 ? Math.PI : 0; iw.setMatrixAt(i, stM(x, 0, z - sd * 4, ry, 0, 0, w, h, d)); ir.setMatrixAt(i, stM(x, h, z - sd * 4, ry, 0, 0, w * 1.08, d * 0.95 * 2.4 / 2.4 * 5.5 / 1.2 / 4, d * 1.08 / 1.2 * 1.0).multiply(new THREE.Matrix4())); iw.setColorAt(i, cc.set(lin(R.pick(pal)))); ir.setColorAt(i, cc.set(lin(R.pick(roofs)))); });
  // fix roof scale: width across the ridge = depth d, length along the ridge = w
  L.forEach(([x, z, sd], i) => { const m = new THREE.Matrix4(); iw.getMatrixAt(i, m); const p = V3(), q = new THREE.Quaternion(), s = V3(); m.decompose(p, q, s); ir.setMatrixAt(i, new THREE.Matrix4().compose(V3(p.x, s.y, p.z), q, V3(s.z / 1.2 * 1.1, s.z * 0.55, s.x / 1.1 * 1.05).set(s.x / 1.1 * 1.05, s.z * 0.5, s.z / 1.2 * 1.12))); });
  G.add(iw, ir);
  const tg = new THREE.IcosahedronGeometry(1, 2), tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) { const v = V3(tp.getX(i), tp.getY(i), tp.getZ(i)), d = 1 + 0.18 * stN3(v.x * 2, v.y * 2, v.z * 2); tp.setXYZ(i, v.x * d, v.y * d * 0.85, v.z * d); } tg.computeVertexNormals();
  const T = []; for (let i = 0; i < 9000; i++) { const x = R.r(-900, 1700), z = R.r(-900, 440); if (keep(x, z) || Math.hypot((x - 900) / 270, (z + 620) / 180) < 1.05) continue; const zr = ((z - 6.6) % 70 + 70) % 70; if (zr < 6 || zr > 64) continue; T.push([x, z, R.r(3, 6)]); }
  const it = new THREE.InstancedMesh(tg, new THREE.MeshLambertMaterial(), T.length); T.forEach(([x, z, s], i) => { it.setMatrixAt(i, stM(x, s * 1.2, z, 0, 0, 0, s)); it.setColorAt(i, cc.set(lin(R.pick(['#3f7430', '#4f8a32', '#5f8a2a', '#2f5f2a', '#6c9c36', '#7a8a3a'])))); }); G.add(it);
  const db = stBatch(); for (let i = 0; i < 46; i++) { const h = R.r(40, 180); db.add(new THREE.BoxGeometry(R.r(18, 40), h, R.r(18, 40)).translate(0, h / 2, 0), stM(2300 + R.r(-260, 260), -0.2, -1500 + R.r(-200, 200)), R.pick(['#b8c4d0', '#c9ced6', '#a8b4c4', '#d6dbe2'])); } G.add(db.mesh(new THREE.MeshLambertMaterial({ vertexColors: true }), false, false));
  return G;
}
// ---------- sullivan: a fire-lookout tower in a forest storm (own scene, built on first use)
function stForest() {
  if (ST.forest) return ST.forest;
  const S = new THREE.Scene(), F = { scene: S }; ST.forest = F; const R = RNG('st-forest');
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), stSkyMat()); sky.material.uniforms.storm.value = 1; sky.frustumCulled = false; sky.renderOrder = -10; S.add(sky); F.sky = sky;
  S.fog = new THREE.FogExp2(lin('#3e464e'), 0.012);
  F.hemi = new THREE.HemisphereLight(lin('#8a9aac'), lin('#2a3026'), 0.9); const key = new THREE.DirectionalLight(lin('#b8c4d4'), 0.9); key.position.set(-30, 40, 30); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -15, right: 15, top: 20, bottom: -5, near: 10, far: 120 }); key.target.position.set(0, 8, 0); S.add(F.hemi, key, key.target); F.key = key;
  const gnd = new THREE.PlaneGeometry(800, 800, 120, 120); gnd.rotateX(-Math.PI / 2); const P = gnd.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), r = Math.hypot(x, z); P.setY(i, (stN3(x * 0.01, z * 0.012, 1) * 9 + stN3(x * 0.03, z * 0.03, 2) * 3) * clamp((r - 12) / 40)); } gnd.computeVertexNormals();
  const gm = new THREE.Mesh(gnd, new THREE.MeshStandardMaterial({ color: lin('#3a4a2c'), roughness: 0.95 })); gm.receiveShadow = true; S.add(gm);
  const cb = stBatch(); cb.add(new THREE.CylinderGeometry(0.15, 0.22, 2, 8).translate(0, 1, 0), new THREE.Matrix4(), '#4a3a2a'); [[2.6, 3.2, 1.4], [2.0, 2.8, 3.2], [1.4, 2.4, 4.8], [0.8, 1.8, 6.2]].forEach(([r, h, y]) => cb.add(new THREE.ConeGeometry(r, h, 12).translate(0, y, 0), new THREE.Matrix4(), '#ffffff'));
  const fir = stMerge(cb.parts), FT = []; for (let i = 0; i < 1400; i++) { const a = R.r(0, TAU), r = 9 + Math.pow(R.f(), 0.7) * 240, x = Math.cos(a) * r, z = Math.sin(a) * r; FT.push([x, z, R.r(1.4, 2.6)]); }
  const fm = new THREE.InstancedMesh(fir, stSoft(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), 0.4, false, 'stfir'), FT.length), cc = new THREE.Color();
  FT.forEach(([x, z, s], i) => { const y = (stN3(x * 0.01, z * 0.012, 1) * 9 + stN3(x * 0.03, z * 0.03, 2) * 3) * clamp((Math.hypot(x, z) - 12) / 40); fm.setMatrixAt(i, stM(x, y - 0.3, z, R.r(0, TAU), R.n(0.05), R.n(0.05), s, s * R.r(0.9, 1.3), s)); fm.setColorAt(i, cc.set(lin(R.pick(['#22402a', '#2a4a2c', '#1d3524', '#30502e'])))); }); fm.castShadow = true; fm.receiveShadow = true; S.add(fm);
  // tower: splayed legs, braces, catwalk, cabin with windows, hip roof
  const tw = stBatch(), wd = '#7a5a3c', top = 12;
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => tw.add(stTube([V3(sx * 2.4, 0, sz * 2.4), V3(sx * 1.6, top, sz * 1.6)], [0.13, 0.11], 8), new THREE.Matrix4(), wd));
  for (let l = 0; l < 4; l++) { const y0 = l * 3, y1 = y0 + 3, w0 = 2.4 - 0.8 * y0 / top, w1 = 2.4 - 0.8 * y1 / top; [[0, 1], [1, 0]].forEach(([ax]) => [-1, 1].forEach((s) => { const a = ax ? V3(s * w0, y0, -w0) : V3(-w0, y0, s * w0), b2 = ax ? V3(s * w1, y1, w1) : V3(w1, y1, s * w1); tw.add(stTube([a, b2], [0.05, 0.05], 6), new THREE.Matrix4(), wd); tw.add(stTube([ax ? V3(s * w1, y1, -w1) : V3(-w1, y1, s * w1), ax ? V3(s * w1, y1, w1) : V3(w1, y1, s * w1)], [0.06, 0.06], 6), new THREE.Matrix4(), wd); })); }
  tw.add(stRBox(5.6, 0.2, 5.6, 0.03), stM(0, top, 0), '#8a6a48'); [-1, 1].forEach((s) => { tw.add(stRBox(5.6, 0.08, 0.08, 0.02), stM(0, top + 1.0, s * 2.76), wd); tw.add(stRBox(0.08, 0.08, 5.6, 0.02), stM(s * 2.76, top + 1.0, 0), wd); for (let i = -5; i <= 5; i++) { tw.add(stRBox(0.05, 1.0, 0.05, 0.01), stM(i * 0.54, top + 0.5, s * 2.76), wd); tw.add(stRBox(0.05, 1.0, 0.05, 0.01), stM(s * 2.76, top + 0.5, i * 0.54), wd); } });
  tw.add(stRBox(3.8, 1.0, 3.8, 0.03), stM(0, top + 0.6, 0), '#c8b89a'); [[-1.5], [-0.5], [0.5], [1.5]].forEach(([d]) => [-1, 1].forEach((s) => { tw.add(stRBox(0.12, 1.5, 0.12, 0.02), stM(d * 1.25, top + 1.85, s * 1.88), '#f0ebe0'); tw.add(stRBox(0.12, 1.5, 0.12, 0.02), stM(s * 1.88, top + 1.85, d * 1.25), '#f0ebe0'); }));
  tw.add(new THREE.ConeGeometry(3.3, 1.6, 4).rotateY(Math.PI / 4).translate(0, top + 3.4, 0), new THREE.Matrix4(), '#7a3a2c'); tw.add(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6).translate(0, top + 4.8, 0), new THREE.Matrix4(), '#c8c8c8');
  const tm = tw.mesh(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 })); S.add(tm);
  const gw = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.4, 3.7), new THREE.MeshStandardMaterial({ envMap: ST.envs.storm, color: lin('#2a343c'), roughness: 0.05, metalness: 0.3 })); gw.position.set(0, top + 1.85, 0); S.add(gw);
  F.ranger = stPeep('ranger', { sex: 'm', age: 'adult', outfit: 'uniform', hair: 'crop', colors: { top: '#b8a06a', bottom: '#5a5a3a', shoe: '#3a2a1c' }, beard: 'mustache' }, { parent: S, x: 0.6, y: top + 0.1, z: 2.3, rot: 0.25, ranger: true, brow: 1, hairS: 'short', cols: { skin: '#e2b08c', top: '#b8a06a', bottom: '#5a5a3a', shoe: '#3a2a1c', hair: '#4a3020', sleeve: '#b8a06a' } });
  if (F.ranger.X) { const hat = new THREE.Group(); hat.position.set(0, 0.2, -0.005); F.ranger.head.add(hat); F.ranger.hat = hat; const br = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.012, 28), stMatCol('#8a6a3e', 0.8)); hat.add(br); const cr = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.13, 4, 1), stMatCol('#8a6a3e', 0.8)); cr.position.y = 0.065; cr.rotation.y = Math.PI / 4; hat.add(cr); const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.1, 0.025, 20), stMatCol('#4a3a24', 0.7)); bd.position.y = 0.016; hat.add(bd); }
  F.bolt = stBolt([-6, 60, -14], [0.62, top + 2.3, 2.3], 'ranger', S);
  F.smoke = []; const sm = g3Radial([[0, 'rgba(90,90,90,0.7)'], [0.5, 'rgba(110,110,110,0.3)'], [1, 'rgba(120,120,120,0)']]); for (let i = 0; i < 10; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sm, transparent: true, depthWrite: false })); S.add(sp); F.smoke.push(sp); }
  F.spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex.w, color: lin('#cfe0ff'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); S.add(F.spark);
  return F;
}

// =====================================================================
//  PER FRAME — setStreet(g, t, b): one staged shot per beat (b.shot), animated over s = t − b.t0 / b.k
// =====================================================================
const ST_COIN_AX = V3(0.38, 0, 0.92).normalize();
function stHero(o) {
  const c = ST.ch; if (c.root.parent !== ST.scene) ST.scene.add(c.root); c.root.visible = true;
  chPose(o); c.root.updateMatrixWorld(true);
  ST.chBlob.visible = o.blob !== false; const p = o.pos ?? [0, 0, 0]; ST.chBlob.position.set(p[0], (o.blobY ?? 0.045), p[2]);
  return c;
}
const stW = (obj) => obj.getWorldPosition(V3(0, 0, 0));
function stReset() {
  Object.values(ST.grp).forEach((g) => { g.visible = false; });
  ST.crowd.forEach((P) => { P.root.visible = false; }); ST.kid.root.visible = false; ST.placards.forEach((p) => { p.visible = false; });
  ST.rain.visible = false; Object.values(ST.bolts).forEach((b) => { b.visible = false; });
  [ST.coin, ...ST.ghosts, ST.glint, ST.bill].forEach((m) => { m.visible = false; }); ST.bill.scale.setScalar(1); ST.coin.scale.setScalar(1); ST.ghosts.forEach((m) => m.scale.setScalar(1));
  if (ST.bag) ST.bag.visible = false; if (ST.billHand) ST.billHand.visible = false; if (ST.town) ST.town.visible = false; if (ST.smoke) ST.smoke.forEach((s) => { s.visible = false; });
  ST.cars.forEach((c) => { c.visible = true; }); ST.bins.forEach((m) => { m.visible = true; }); ST.treeG.forEach((T) => { T.g.rotation.set(0, 0, 0); T.g.visible = true; });
  ST.signals.forEach((sg) => stSetSignal(sg, 'g')); ST.camFar = 2000; ST.sky.material.uniforms.gain.value = 1;
}
function stAmbient(t, on) { const s0 = ST.s ?? 0;
  [ST.jog.root, ST.walker.root, ST.dog.root, ST.leash, ...ST.birds.map((b) => b.g)].forEach((o) => { o.visible = on; }); if (!on) return;
  const J = ST.jog; J.root.position.x = 30 - s0 * 2.6; stPP(J, 'jog', t * TAU * 1.45); if (J.pony) J.pony.rotation.z = Math.sin(t * TAU * 2.9) * 0.3;
  const Wk = ST.walker; Wk.root.position.x = 31 - s0 * 1.1; stPP(Wk, 'walk', t * TAU * 0.85, { shR: [-35, 0, 0], elR: [-20, 0, 0], head: [0, -15, 0] });
  const Dg = ST.dog, pd = t * TAU * 2.2, D = DEG; Dg.root.position.x = Wk.root.position.x - 1.9; Dg.root.position.y = 0.04 + Math.abs(Math.sin(pd)) * 0.02;
  Dg.legs.forEach((j, i) => { j.rotation.z = D * 28 * Math.sin(pd + [0, Math.PI, Math.PI * 0.5, Math.PI * 1.5][i]); }); Dg.tail.rotation.x = Math.sin(t * 9) * 0.35; Dg.head.rotation.z = D * (10 + 6 * Math.sin(t * 3));
  Wk.root.updateMatrixWorld(true); Dg.root.updateMatrixWorld(true);
  const a = stW(Wk.handR || Wk.handR), b = stW(Dg.collar), P = []; for (let k = 0; k <= 12; k++) { const u = k / 12; P.push(V3(lerp(a.x, b.x, u), lerp(a.y, b.y, u) - 0.35 * 4 * u * (1 - u), lerp(a.z, b.z, u))); }
  ST.leash.geometry.dispose(); ST.leash.geometry = stTube(P, P.map(() => 0.008), 5);
  ST.birds.forEach((b, i) => { const fl = Math.sin(t * b.sp * 2 + b.ph); b.g.position.set(b.p[0] + 12 - s0 * 3.2, b.p[1] + Math.sin(t * 0.8 + i) * 0.3, b.p[2]); b.g.rotation.y = Math.PI; b.g.scale.setScalar(1.4); b.w.forEach(([w, s]) => { w.rotation.x = s * (0.15 + fl * 0.75); }); });
}
function stHideTrees(L) { ST.treeG.forEach((T) => { if (L.some(([x, z]) => Math.abs(T.x - x) < 2 && Math.abs(T.z - z) < 1)) T.g.visible = false; }); }
function stSway(t, amp) { ST.treeG.forEach((T) => { T.g.rotation.z = Math.sin(t * 1.9 + T.ph) * amp * 0.035 + amp * 0.02; T.g.rotation.x = Math.sin(t * 1.3 + T.ph * 2) * amp * 0.02; }); }
function stGlint(g, cp, size, op = 1) { const vd = g.cam.position.clone().sub(cp).normalize(), cn = V3(0, 1, 0).applyQuaternion(ST.coin.quaternion), gl = Math.pow(Math.abs(cn.dot(vd.clone().add(ST.wx.dir).normalize())), 6); ST.glint.visible = true; ST.glint.position.copy(cp).addScaledVector(vd, 0.04); const s = size * (0.55 + gl); ST.glint.scale.set(s, s, 1); ST.glint.material.opacity = op * (0.55 + 0.45 * gl); ST.glint.material.rotation = 0.3; }
function stSmoke(pos, t, n = 8, scale = 1, col) {
  if (!ST.smoke) { const sm = g3Radial([[0, 'rgba(70,70,70,0.7)'], [0.5, 'rgba(90,90,90,0.32)'], [1, 'rgba(110,110,110,0)']]); ST.smoke = []; for (let i = 0; i < 12; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sm, transparent: true, depthWrite: false })); ST.scene.add(sp); ST.smoke.push(sp); } }
  ST.smoke.forEach((sp, i) => { if (i >= n) return; const u = ((t * 0.45 + i / n) % 1); sp.visible = true; sp.position.set(pos[0] + Math.sin(i * 2.1) * 0.2 * scale + u * 0.8 * scale, pos[1] + u * 2.6 * scale, pos[2] + Math.cos(i * 1.7) * 0.2 * scale); const s = (0.5 + u * 1.6) * scale; sp.scale.set(s, s, 1); sp.material.opacity = Math.sin(u * Math.PI) * 0.75; });
}
function stDof(g, cp, r = 0.03, blur = 9) {
  if (!ST.dc) { ST.dc = document.createElement('canvas'); ST.dc.width = W; ST.dc.height = H; ST.dc2 = document.createElement('canvas'); ST.dc2.width = W; ST.dc2.height = H; }
  const b = ST.dc.getContext('2d'); b.clearRect(0, 0, W, H); b.filter = `blur(${blur}px)`; b.drawImage(ctx.canvas, 0, 0); b.filter = 'none';
  const pts = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, v = V3(Math.cos(a) * r, 0, Math.sin(a) * r).applyQuaternion(ST.coin.quaternion).add(cp).project(g.cam); pts.push([(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]); }
  const s = ST.dc2.getContext('2d'); s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, W, H);
  s.filter = 'blur(2px)'; s.fillStyle = '#fff'; s.beginPath(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); s.fill(); s.filter = 'none'; s.globalCompositeOperation = 'source-in'; s.drawImage(ctx.canvas, 0, 0); s.globalCompositeOperation = 'source-over';
  b.drawImage(ST.dc2, 0, 0); ctx.save(); screen(); ctx.drawImage(ST.dc, 0, 0); ctx.restore();
}
function stAttach(name, make) { if (!ST[name]) { ST[name] = make(); ST.ch.arms.R.grip.add(ST[name]); } ST[name].visible = true; return ST[name]; }

const ST_SHOTS = {
  // 1 — the coin flip: a real thumb flick, the coin climbs in slow motion against the sky, lands heads in his palm
  flip(g, t, b, s) {
    stWeather('sunny'); stAmbient(t, true); ST.bill.visible = true;
    const fl = s > 1.45, u = clamp((s - 1.5) / 5.0), air = s > 1.5 && s < 6.5, close = s >= 6.6;
    const ang = 50 * DEG + (s - 1.5) * TAU * 1.25;
    if (!close) {
      const flick = ss(1.35, 1.5, s) * (1 - ss(1.6, 2.2, s));
      const lookU = air ? 10 + 30 * Math.sin(u * Math.PI) : 6;
      stHero({ pose: 'flip', hand: { R: fl ? 'thumb' : 'flip' }, expr: air ? [['amazed', 0.6], ['happy', 0.4]] : [['happy', 1]], look: [-8, air ? 22 : -10], rot: -66, pos: [0, 0.04, -0.1], add: { elR: [-12 * flick, 0, 0], wrR: [-20 * flick, 0, 0], neck: [-lookU * 0.4, -4, 0], head: [-lookU * 0.5 + (air ? 0 : 10), -8, 0] }, t, blink: false });
      const th = stW(ST.ch.arms.R.th[2]), hand = stW(ST.ch.arms.R.wr);
      let cp; const q = new THREE.Quaternion();
      if (s < 1.5) { cp = th.clone().add(V3(0, 0.02, 0)); q.setFromAxisAngle(ST_COIN_AX, 0.2); }
      else if (air) { cp = th.clone().add(V3(-0.06 * u, 1.0 * 4 * u * (1 - u) + 0.02, 0.03 * u)); q.setFromAxisAngle(ST_COIN_AX, ang); }
      else { cp = hand.clone().add(V3(0, 0.06, 0)); q.setFromAxisAngle(ST_COIN_AX, 0); }
      ST.coin.visible = true; ST.coin.scale.setScalar(1.4); ST.coin.position.copy(cp); ST.coin.quaternion.copy(q);
      ST.ghosts.forEach((m, i) => { if (!air) return; const uu = clamp((s - 1.5 - (i + 1) * 0.035) / 5.0); m.visible = true; m.scale.setScalar(1.4); m.position.copy(th).add(V3(-0.06 * uu, 1.0 * 4 * uu * (1 - uu) + 0.02, 0.03 * uu)); m.quaternion.setFromAxisAngle(ST_COIN_AX, ang - (i + 1) * 0.35); });
      shotCam(g, [lerp(-2.05, -1.85, b.k), 0.62, lerp(0.8, 0.72, b.k)], [0.1, 1.9, -0.3], 24, 0.5, t);
      stGlint(g, cp, air ? 0.75 : 0.22);
      present(g, ST.scene, { bloom: 0.22 }); return;
    }
    // close: the coin lies heads-up in his palm, his grin out of focus behind it
    stHero({ pose: 'hold', hand: { R: 'open', L: 'relax' }, expr: [['joy', 1]], look: [0, -18], rot: -66, pos: [0, 0.04, -0.1], add: { shL: [70, 0, 0], elL: [60, -50, 0], head: [16, 0, 0], neck: [6, 0, 0] }, t });
    const gp = stW(ST.ch.arms.R.grip), face = stW(ST.ch.head).add(V3(0, 0.1, 0));
    const cp = gp.clone().add(V3(0, 0.035, 0)); ST.coin.visible = true; ST.coin.scale.setScalar(1.4); ST.coin.position.copy(cp); ST.coin.quaternion.setFromAxisAngle(ST_COIN_AX, 0.75);
    const cd = V3(-0.92, 0, 0.38); shotCam(g, cp.clone().addScaledVector(cd, 0.36).add(V3(0, 0.1, 0.05)).toArray(), cp.clone().lerp(face, 0.16).toArray(), 28, 0.3, t);
    stGlint(g, cp, 0.07, 0.8);
    present(g, ST.scene, { bloom: 0.2 }); stDof(g, cp, 0.04, 8);
  },
  // 2 — every light turns green: he cruises down the street in a little convertible, the signals flip ahead of him
  greens(g, t, b, s) {
    stWeather('sunny', 'sunny', 0, { tgt: [40 + s * 6, 0, 4] }); stAmbient(t, true); ST.grp.conv.visible = true;
    const x = 8 + 8.5 * s, car = ST.conv; car.position.set(x, -0.13, 5.6); car.rotation.y = 0; ST.cars[1].visible = false; ST.cars[5].visible = false;
    ST.signals.forEach((sg, i) => stSetSignal(sg, s >= 2.8 + i * 0.9 ? 'g' : s >= 2.5 + i * 0.9 ? 'a' : 'r'));
    stHero({ pose: [['sit', 1]], hand: { L: 'hold', R: 'hold' }, expr: [['joy', 0.7], ['happy', 0.3]], look: [s < 4.6 ? 0 : -8, 4], rot: 90, pos: [x - 0.35, 0.1, 5.2], sitY: 0, add: { spine: [-6, 0, 0], shL: [-38, 0, 6], shR: [-38, 0, -6], elL: [-28, 30, 0], elR: [-28, -30, 0], head: [-4, 8, 0] }, t, blob: false });
    if (s < 4.6) shotCam(g, [x - 4.4, 2.15, 4.5], [x + 30, 3.0, 6.0], 30, 0.6, t);
    else shotCam(g, [x + 2.9, 1.8, 4.05], [x - 0.45, 1.3, 5.2], 30, 0.6, t);
    present(g, ST.scene, { bloom: 0.24 });
  },
  // 3 — a twenty on the sidewalk: he spots it, crouches, holds it up
  twenty(g, t, b, s) {
    stWeather('sunny'); stAmbient(t, true);
    const bx = 6.3, walkEnd = 3.1, x = 1.6 + 1.3 * Math.min(s, walkEnd), cr = ss(3.5, 4.3, s) * (1 - ss(5.4, 6.2, s)), got = s > 5.0;
    ST.bill.visible = !got; ST.bill.position.set(bx, 0.045, 0.25);
    if (got) stAttach('billHand', () => { const m = ST.bill.clone(); m.geometry = ST.bill.geometry.clone().rotateX(Math.PI / 2).rotateZ(Math.PI / 2); m.position.set(0.0, -0.06, 0.03); return m; });
    const up = ss(6.0, 6.8, s);
    ST.bill.scale.setScalar(1.4); if (ST.billHand) ST.billHand.scale.setScalar(1.4);
    stHero({ pose: 'stand', walk: s < walkEnd ? x / 1.5 : null, hand: { R: got ? 'hold' : 'open' }, expr: s < 3.2 ? 'happy' : s < 5.2 ? [['surprised', 0.6], ['happy', 0.4]] : 'joy', look: [0, s > 3.1 && s < 5.3 ? -24 : 4], rot: 90, pos: [x, 0.04, 0.05],
      add: { hipL: [-78 * cr, 0, 6 * cr], hipR: [-70 * cr, 0, -6 * cr], knL: [118 * cr, 0, 0], knR: [108 * cr, 0, 0], anL: [-36 * cr, 0, 0], anR: [-34 * cr, 0, 0], spine: [16 * cr, 0, 0], chest: [8 * cr, 0, 0], neck: [10 * cr + (s > 3.1 && s < 3.6 ? 12 : 0), 0, 0], shR: [-48 * cr - 120 * up, 0, -20 * up], elR: [-10 * cr - 30 * up, 0, 0] }, t });
    shotCam(g, [7.55, 0.3, 1.15], [5.85, 0.62 + 0.5 * up, 0.12], 26, 0.4, t);
    present(g, ST.scene, { bloom: 0.2 });
  },
  // 4 — the rival in a suit kneels by his dead car, hood up, steam; you stroll past
  rival(g, t, b, s) {
    stWeather('sunny'); stAmbient(t, false); ST.grp.rival.visible = true; ST.cars[0].visible = false;
    const Rv = ST.rival; Rv.root.position.set(27.2, -0.09, 4.05); Rv.root.rotation.y = -0.75; stPP(Rv, 'kneel', 0, { head: [Math.sin(t * 0.9) * 6, 26 + Math.sin(t * 0.6) * 10, 0], shR: [Math.sin(t * 2) * 8, 0, 0] });
    ST.steam.forEach((sp, i) => { const u = (t * 0.32 + i / ST.steam.length) % 1; sp.position.set(25.9 + u * 0.9 + Math.sin(i * 3 + t) * 0.15, 0.95 + u * 2.4, 3.55 + Math.cos(i * 2.3) * 0.35); const sc = 0.5 + u * 1.9; sp.scale.set(sc, sc, 1); sp.material.opacity = Math.min(1, Math.sin(u * Math.PI) * 1.1); });
    const x = 33.5 - 1.25 * s; stHero({ pose: 'stand', walk: s * 0.84, expr: 'happy', look: [x < 28 && x > 22 ? 20 : 0, 0], rot: -90, pos: [x, 0.04, -0.15], add: { head: [0, x < 29 && x > 22 ? 22 : 0, 0] }, t });
    shotCam(g, [lerp(30.0, 29.5, b.k), 1.0, 7.4], [25.9, 0.85, 3.0], 32, 0.5, t);
    present(g, ST.scene, { bloom: 0.2 });
  },
  // 5 — losers: a bus-stop crowd tearing up their tickets, scraps blowing down the street
  losers(g, t, b, s) {
    stWeather('sunny', 'over', 0.3); stAmbient(t, false); ST.grp.bus.visible = true; ST.cars[3].visible = false;
    const spots = [[37.4, 13.1, 0.6, 'tear'], [38.2, 12.5, -0.4, 'tear'], [39.6, 13.9, 0.1, 'sadstand'], [41.0, 12.4, 0.5, 'tear'], [41.7, 13.3, -0.9, 'tear'], [43.4, 12.8, 0.3, 'sadstand'], [35.9, 12.6, 1.1, 'tear'], [44.4, 13.6, -0.6, 'tear'], [40.3, 13.7, 0.2, 'sit'], [36.8, 13.8, 0.2, 'sadstand']];
    const src = [];
    spots.forEach(([x, z, r, p], i) => { const P = ST.crowd[i]; P.root.visible = true; P.root.position.set(x, 0.04, z); P.root.rotation.y = Math.PI + r; const tr = Math.sin(t * 5 + i) * 6; stPP(P, p === 'sit' ? 'sadstand' : p, 0, p === 'tear' ? { elL: [0, 0, tr], elR: [0, 0, -tr], head: [0, Math.sin(t * 0.7 + i) * 10, 0] } : { head: [0, Math.sin(t * 0.5 + i) * 8, 0] }); if (p === 'tear') src.push([x, 1.25 * P.root.scale.y, z - 0.25]); });
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), R = RNG('st-scraps');
    for (let i = 0; i < ST.scraps.count; i++) { const [sx, sy, sz] = src[i % src.length], off = R.r(-7, 8.5), tau = Math.max(0, s - off), vx = R.r(0.2, 1.4), vz = R.n(0.5) - 0.3, vy = R.r(0.2, 1.0), sk = R.r(0.4, 0.9);
      let y = sy + vy * tau - 0.5 * sk * tau * tau, land = false; if (y < 0.05) { y = 0.05; land = true; } const tt = land ? Math.min(tau, (vy + Math.sqrt(vy * vy + 2 * sk * (sy - 0.05))) / sk) : tau;
      e.set(land ? -Math.PI / 2 : t * R.r(3, 9) + i, land ? R.f() * 6 : t * R.r(2, 7), land ? 0 : t * R.r(1, 5)); q.setFromEuler(e);
      const sc = s < off ? 0 : 1; m.compose(V3(sx + vx * tt + Math.sin(t * 2 + i) * 0.1 * (land ? 0 : 1), y, sz + vz * tt), q, V3(sc, sc, sc)); ST.scraps.setMatrixAt(i, m); }
    ST.scraps.instanceMatrix.needsUpdate = true;
    shotCam(g, [lerp(41.4, 40.8, b.k), 1.5, 7.2], [40.0, 1.3, 13.4], 30, 0.4, t);
    present(g, ST.scene, { bloom: 0.2 });
  },
  // 6 — on the way home a storm rolls in down the street
  stormcomes(g, t, b, s) {
    const k = ss(0, 1, b.k); stWeather('sunny', 'storm', 0.25 + 0.6 * k, { front: 0.75 * (1 - k * 0.6), sunK: 1 - 0.7 * k }); stAmbient(t, false); stSway(t, 0.5 + k);
    const x = 13 - 1.0 * s; stHero({ pose: 'stand', walk: s * 0.7, expr: [['worried', 0.7], ['surprised', 0.3]], look: [10, 18], rot: -100, pos: [x, 0.04, 0.1], add: { neck: [-8, 10, 0], head: [-10, 14, 0] }, t });
    shotCam(g, [-3.8, 0.85, -0.1], [14, 3.4, 1.6], 28, 0.5, t);
    present(g, ST.scene, { bloom: 0.18 });
  },
  // 7 — rain on every house but yours: a hole in the clouds, a shaft of sun on your lawn
  sunhole(g, t, b, s) {
    stWeather('storm'); stAmbient(t, false); stSway(t, 1.4); ST.grp.hole.visible = true; stHideTrees([[7, 11.45]]); ST.shaft.material.opacity = 0.5 + 0.08 * Math.sin(t * 1.3);
    stHero({ pose: 'shrug', expr: [['amazed', 0.5], ['happy', 0.5]], look: [0, 20], rot: 12, pos: [6.9, 0.04, -3.4], add: { head: [-18, 0, 0], neck: [-8, 0, 0] }, t });
    shotCam(g, [lerp(-5, -3.5, b.k), lerp(10, 9, b.k), 21], [8, 1.6, -4.5], 30, 0.4, t);
    stRainUpdate(t, g.cam, [8.5, -5, 9.6]);
    present(g, ST.scene, { bloom: 0.25 });
  },
  // 8 — lightning finds everyone near you: a neighbour's tree, then a car
  strikes(g, t, b, s) {
    const f1 = s > 3.65 && s < 4.6 ? (0.6 + 0.4 * Math.sin(s * 60)) * (1 - (s - 3.65) / 1.1) : 0, f2 = s > 6.6 && s < 7.2 ? 0.8 : 0, fl = Math.max(f1, f2);
    stWeather('storm', 'storm', 0, { hemiK: 1 + 2.6 * fl, gain: 1 + 2.2 * fl }); stAmbient(t, false); stSway(t, 1.6); ST.grp.hole.visible = true; stHideTrees([[24, 1.85], [12, 1.85]]);
    ST.bolts.tree.visible = f1 > 0; ST.bolts.car.visible = f2 > 0; if (s > 3.9) stSmoke([30.2, 6.8, 11.45], t, 8, 1.6);
    const sh = ss(3.6, 3.9, s); stHero({ pose: [['stand', 1 - sh], ['shock', sh]], expr: s > 3.6 ? 'surprised' : 'worried', look: [10, 10], rot: 52, pos: [6.6, 0.04, -2.7], t });
    shotCam(g, [5.2, 1.45, -4.8], [26, 6.2, 10.0], 26, 0.5, t);
    stRainUpdate(t, g.cam, [8.5, -5, 9.6]);
    present(g, ST.scene, { bloom: 0.3 + 0.4 * fl });
  },
  // 9 — Roy Sullivan, struck seven times: a ranger on a lookout tower, hit, hat smoking, fine
  sullivan(g, t, b, s) {
    const F = stForest(), top = 12, hit = s > 3.6 && s < 4.7, fl = hit ? 0.6 + 0.4 * Math.sin(s * 55) : 0, after = s > 4.3;
    F.hemi.intensity = 0.9 + 3.0 * fl; F.sky.material.uniforms.gain.value = 1 + 2.5 * fl; F.bolt.visible = hit; F.spark.visible = hit; F.spark.position.set(0.62, top + 2.3, 2.3); F.spark.scale.set(5 * fl + 1, 5 * fl + 1, 1);
    const Rg = F.ranger; stPP(Rg, after ? 'armsout' : 'stand', 0, after ? { head: [0, Math.sin(t * 3) * 8, 0], chest: [0, 0, Math.sin(t * 2) * 3] } : { shR: [-30, 0, 0], elR: [-90, 0, 0], head: [-14, 0, 0] });
    Rg.hat.rotation.z = after ? -0.15 : 0; Rg.hat.position.y = after ? 0.24 : 0.2;
    F.smoke.forEach((sp, i) => { const u = (t * 0.4 + i / 10) % 1; sp.visible = after; sp.position.set(0.62 + u * 0.5 + Math.sin(i) * 0.08, top + 2.35 + u * 1.6, 2.3 + Math.cos(i * 2) * 0.08); const sc = 0.2 + u * 0.9; sp.scale.set(sc, sc, 1); sp.material.opacity = Math.sin(u * Math.PI) * 0.8; });
    shotCam(g, [lerp(5.6, 5.0, b.k), 11.4, lerp(10.5, 9.6, b.k)], [0.2, 13.3, 1.6], 32, 0.5, t);
    stRainUpdate(t, g.cam, null, F.scene);
    present(g, F.scene, { bloom: 0.25 + 0.4 * fl });
  },
  // 10 — the neighbours' yards flood; yours stays dry behind the picket fence
  flood(g, t, b, s) {
    stWeather('over', 'over', 0, { sunK: 1.6 }); stAmbient(t, false); ST.grp.flood.visible = true; stHideTrees([[7, 11.45], [12, 1.85]]); ST.waterN.offset.set(t * 0.02, t * 0.013);
    stHero({ pose: 'shrug', expr: 'worried', look: [0, -6], rot: 8, pos: [6.9, 0.04, -2.3], t });
    const P0 = ST.crowd[1]; P0.root.visible = true; P0.root.position.set(27.3, 0.6, -6.9); P0.root.rotation.y = 0.2; stPP(P0, 'bucket', 0, { shL: [Math.sin(t * 3) * 25, 0, 0], shR: [Math.sin(t * 3) * 25, 0, 0] });
    const P1 = ST.crowd[5]; P1.root.visible = true; P1.root.position.set(-13.5, 0.6, -6.5); P1.root.rotation.y = 0.5; stPP(P1, 'sadstand');
    const P2 = ST.crowd[9]; P2.root.visible = true; P2.root.position.set(28.6, 0.6, 18.4); P2.root.rotation.y = Math.PI - 0.3; stPP(P2, 'hug');
    shotCam(g, [lerp(15, 13.5, b.k), 5.2, 13.5], [9.5, 0.3, -4.5], 26, 0.4, t);
    present(g, ST.scene, { bloom: 0.18 });
  },
  // 11 — one by one the neighbours move away: trucks, SOLD signs, a couch going up a ramp
  moving(g, t, b, s) {
    stWeather('sunny', 'over', 0.45, { tgt: [16, 0, 0] }); stAmbient(t, false); ST.grp.moving.visible = true; ST.grp.sold.visible = true; ST.cars[0].visible = false; ST.cars[4].visible = false; ST.bins.forEach((m) => { m.visible = false; }); 
    ST.truckB.position.x = 46 + Math.max(0, s - 1.5) ** 1.6 * 1.2;
    const u = clamp(s / 8), cx = lerp(27.0, 24.6, u), cz = lerp(-3.4, 2.9, u);
    const A = ST.crowd[2], B2 = ST.crowd[3]; [A, B2].forEach((P, i) => { P.root.visible = true; P.root.position.set(cx + (i ? -1.0 : 1.0) * 0.05, 0.04, cz + (i ? 1.2 : -1.2)); P.root.rotation.y = 0; stPP(P, 'carry', 0, { hipL: [Math.sin(t * 5 + i) * 12, 0, 0], hipR: [-Math.sin(t * 5 + i) * 12, 0, 0] }); });
    ST.couch.position.set(cx, 0.55, cz); ST.couch.rotation.y = Math.PI / 2;
    stHero({ pose: [['sit', 1]], expr: 'sad', look: [14, -2], rot: 30, pos: [6.9, -0.27, -6.15], sitY: 0, add: { spine: [14, 0, 0], head: [6, 20, 0], shL: [-20, 0, 0], shR: [-20, 0, 0], elL: [-60, 0, 0], elR: [-60, 0, 0] }, t, blob: false });
    if (s < 4.6) shotCam(g, [lerp(16.2, 17.0, b.k), 1.75, 7.9], [26.5, 1.25, -1.2], 28, 0.4, t);
    else shotCam(g, [lerp(8.6, 8.4, b.k), 0.95, -3.5], [6.8, 0.9, -6.2], 38, 0.4, t);
    present(g, ST.scene, { bloom: 0.18 });
  },
  // 12 — a billion people: the whole town, then the horizon
  billion(g, t, b, s) {
    stWeather('late', 'late', 0, { fd: 0.0011, tgt: [60, 0, 0] }); stAmbient(t, false); stTown().visible = true; ST.grp.sold.visible = true;
    if (ST.ch.root.parent === ST.scene) ST.scene.remove(ST.ch.root); ST.chBlob.visible = false;
    shotCam(g, [lerp(-150, -120, b.k), lerp(110, 150, b.k), lerp(230, 210, b.k)], [lerp(220, 260, b.k), 0, lerp(-240, -280, b.k)], 30, 0.2, t);
    present(g, ST.scene, { bloom: 0.2 });
  },
  // 13 — they don't hate you, they're scared of you: neighbours with signs at a careful distance
  signs(g, t, b, s) {
    stWeather('late', 'late', 0, { tgt: [8, 0, 0] }); stAmbient(t, false); ST.grp.sold.visible = true;
    const spots = [[4.8, 0.4, 'sign', 0], [6.0, 0.9, 'sign', 1], [7.3, 0.3, 'sign', 2], [8.6, 0.8, 'sign', 3], [9.9, 0.2, 'sign', 4], [3.6, 1.2, 'afraid', -1], [11.0, 1.1, 'hug', 5], [5.4, 1.6, 'afraid', -1]];
    spots.forEach(([x, z, p, si], i) => { const P = ST.crowd[i]; P.root.visible = true; P.root.position.set(x, 0.04, z); P.root.rotation.y = Math.PI + (x - 7) * -0.06; stPP(P, p, 0, { chest: [-8 - 4 * Math.sin(t * 1.5 + i), 0, 0], head: [6, Math.sin(t * 0.8 + i) * 6, 0], hipL: [-10, 0, 0], knL: [8, 0, 0] }); if (si >= 0 && si < ST.placards.length) ST.placards[si].visible = true; });
    ST.placards.forEach((pl) => { pl.position.set(0, 1.55, 0.4); });
    ST.kid.root.visible = true; ST.kid.root.position.set(6.4, 0.04, 1.5); ST.kid.root.rotation.y = Math.PI + 0.3; stPP(ST.kid, 'hug', 0, { head: [0, 20, 0] });
    stHero({ pose: 'sad', expr: 'sad', look: [0, 0], rot: 0, pos: [6.9, 0.04, -3.2], add: { head: [-6, 0, 0] }, t });
    shotCam(g, [lerp(5.1, 5.3, b.k), 1.78, lerp(-6.6, -6.1, b.k)], [7.6, 1.35, 1.2], 30, 0.4, t);
    present(g, ST.scene, { bloom: 0.18 });
  },
  // 14 — so you leave: dusk, a bag, the empty street
  leave(g, t, b, s) {
    stWeather('dusk', 'dusk', 0, { tgt: [26, 0, 6] }); stAmbient(t, false); ST.grp.sold.visible = true; ST.cars.forEach((c, i) => { c.visible = i === 5; });
    stAttach('bag', () => { const G = new THREE.Group(); const bg = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.42, 6, 14), stMatCol('#5a4a3a', 0.8)); bg.rotation.z = Math.PI / 2; bg.position.set(0, -0.26, 0); bg.castShadow = true; G.add(bg); const st = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16, Math.PI), stMatCol('#3a2e24', 0.7)); st.position.set(0, -0.12, 0); G.add(st); return G; });
    const x = 7 + 1.15 * s; stHero({ pose: 'stand', walk: x / 1.45, hand: { R: 'hold' }, expr: 'sad', look: [0, -4], rot: 90, pos: [x, -0.09, 6.0], add: { shR: [-6, 0, 6], elR: [-4, 0, 0], head: [8, 0, 0] }, t, blobY: -0.12 });
    shotCam(g, [-3.0, 1.2, 5.6], [40, 2.0, 6.6], 34, 0.3, t);
    present(g, ST.scene, { bloom: 0.26 });
  },
};
function setStreet(g, t, b) {
  if (!ST) stBuild(g);
  if (!b) b = { shot: 'flip', t0: t - 4.2, t1: t + 4.8, k: 0.47 };
  const s = t - b.t0, fn = ST_SHOTS[b.shot] || ST_SHOTS.flip; ST.s = s;
  stReset();
  const c = ST.ch; if (c.root.parent !== ST.scene && b.shot !== 'billion' && b.shot !== 'sullivan') ST.scene.add(c.root);
  fn(g, t, b, s);
  if (ST.bag) ST.bag.visible = false; if (ST.billHand) ST.billHand.visible = false;
}
