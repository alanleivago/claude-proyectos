// =====================================================================
//  ABOVE (agent-owned) — 20–57 s: clouds at her knees, Everest and planes, the air thins, space, the ISS, the Earth's
//  curve, one step over continents, the Earth as a ball at her feet, GPS satellites, the Moon.
//  Units: kilometres everywhere. Sky stage: flat land at y = 0. Space stage: the Earth centred at (0, −RE, 0), she stands
//  on its top (feet at the origin).
// =====================================================================
const AB_RE = 6371, abH = (t) => HGT(t) / 1000;
const AB_NOISE = `
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float h31(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float n2(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
float fb2(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * n2(p); p = p * 2.03 + vec2(1.7, 9.2); m *= 0.5; } return a; }
float fb3(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * n3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); m *= 0.5; } return a; }
`;
const AB_ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };

// ---- photographic cumulus sprites (from faster/skytime)
function abVN(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const h = (a, b) => { let n = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(s, 1442695041)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v); }
function abFbm(x, y, s, o) { let a = 0.5, t = 0, n = 0; for (let i = 0; i < o; i++) { t += a * abVN(x, y, s + i * 17); n += a; const X = x * 1.6 - y * 1.2, Y = x * 1.2 + y * 1.6; x = X + 3.1; y = Y - 1.7; a *= 0.5; } return t / n; }
function abCloudTex(seed) { const R = RNG('abcl' + seed), W_ = 512, H_ = 256, D = new Float32Array(W_ * H_), S = (seed * 7 + 3) | 0, yb = H_ * 0.1, B = [];
  const n = R.i(4, 7), tall = R.r(0.7, 1.25); for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, r = H_ * (0.13 + 0.22 * Math.sin(Math.PI * u) ** 1.2) * R.r(0.75, 1.15) * tall; B.push([W_ * (0.14 + 0.72 * u) + R.n(14), yb + r * R.r(0.25, 0.6), r, r * R.r(1.1, 1.5)]); }
  for (let i = 0; i < R.i(2, 5); i++) { const r = H_ * R.r(0.1, 0.2) * tall; B.push([W_ * R.r(0.3, 0.7), yb + H_ * R.r(0.28, 0.5) * tall, r, r]); }
  for (let i = 0; i < R.i(3, 7); i++) { const r = H_ * R.r(0.05, 0.1); B.push([W_ * R.r(0.08, 0.92), yb + H_ * R.r(0.05, 0.3), r, r * 1.3]); }
  const nb = B.length; for (let i = 0; i < 64; i++) { const P = B[R.i(0, nb - 1)], a = R.r(0.15, Math.PI - 0.15), r = P[2] * R.r(0.14, 0.32); B.push([P[0] + Math.cos(a) * P[3] * 0.84, P[1] + Math.sin(a) * P[2] * 0.84, r, r * R.r(1, 1.25)]); }
  const lx = R.r(-0.55, 0.55), ln = Math.hypot(lx, 1), Lx = lx / ln, Ly = 1 / ln;
  for (let y = 0; y < H_; y++) for (let x = 0; x < W_; x++) { const wx = x + (abFbm(x / 70, y / 70, S, 3) - 0.5) * 60, wy = y + (abFbm(x / 70 + 9, y / 70 + 4, S + 5, 3) - 0.5) * 40; let d = 0;
    for (const [cx, cy, ry, rx] of B) { const q = ((wx - cx) / rx) ** 2 + ((wy - cy) / ry) ** 2; if (q < 1) { const f = (1 - q) ** 0.7; d = d + f - d * f; } }
    const n1 = abFbm(wx / 34, wy / 30, S + 11, 4), n2 = abFbm(wx / 11, wy / 10, S + 23, 3);
    d = d * (0.55 + 0.6 * n1) - 0.28 * (1 - n2) * (1 - d) - 0.12; d *= ss(yb - 3, yb + 9 + 10 * abVN(x / 25, 0.5, S), y); D[y * W_ + x] = Math.max(0, d); }
  const data = new Uint8Array(W_ * H_ * 4), st = 3, sig = 0.055, l3 = Math.hypot(Lx, Ly, 0.7), Dv = (x, y) => D[clamp(y, 0, H_ - 1) * W_ + clamp(x, 0, W_ - 1)];
  for (let y = 0; y < H_; y++) for (let x = 0; x < W_; x++) { const i = y * W_ + x, d = D[i]; let acc = 0;
    if (d > 0.002) for (let k = 1; k < 30; k++) { const px = Math.round(x + Lx * st * k), py = Math.round(y + Ly * st * k); if (px < 0 || px >= W_ || py >= H_) break; acc += D[py * W_ + px]; }
    const gx = (Dv(x + 3, y) - Dv(x - 3, y)) * 4.5, gy = (Dv(x, y + 3) - Dv(x, y - 3)) * 4.5, nl = Math.hypot(gx, gy, 1), lam = Math.max(0, (-gx * Lx - gy * Ly + 0.7) / (nl * l3));
    const T = Math.exp(-acc * st * sig), a = 1 - Math.exp(-d * 8), edge = 1 - ss(0.05, 0.5, d);
    const lit = clamp((0.08 + 0.92 * T ** 0.6) * (0.5 + 0.6 * lam) + 0.22 * edge * T), bas = (1 - ss(yb, yb + H_ * 0.32, y)) * (0.4 + 0.6 * ss(0.1, 0.6, d));
    data[i * 4] = lit * 255; data[i * 4 + 1] = bas * 255; data[i * 4 + 3] = clamp(a) * 255; }
  const tx = new THREE.DataTexture(data, W_, H_, THREE.RGBAFormat); tx.flipY = false; tx.generateMipmaps = true; tx.minFilter = THREE.LinearMipmapLinearFilter; tx.magFilter = THREE.LinearFilter; tx.needsUpdate = true;
  return { tx, base: yb / H_, asp: H_ / W_ }; }
const AB_CU = { uLit: { value: lin('#fffaf2') }, uShade: { value: lin('#8d9ab2') }, uHaze: { value: lin('#cfe2f2') } };
function abCloudMat(tex) { const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }), U = { uBase: { value: 1 }, uFar: { value: 0 } }; m.userData.U = U;
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, AB_CU, U);
    sh.fragmentShader = 'uniform vec3 uLit, uShade, uHaze; uniform float uBase, uFar;\n' + sh.fragmentShader.replace('#include <map_fragment>',
      `vec4 cT = texture2D(map, vUv); vec3 cc = mix(uShade, uLit, cT.r); cc = mix(cc, uShade * 0.8, cT.g * uBase);
       cc = mix(cc, uHaze, uFar); diffuseColor = vec4(cc, opacity * cT.a * (1.0 - 0.45 * uFar));`); };
  return m; }

// ---- stars (fixed screen size, at infinity) and a faint Milky Way band
function abStars(st, n, seed) { const R = RNG('abst' + seed), P = [], S = [], C = [], cs = ['#ffffff', '#e4ecff', '#c8d8ff', '#fff2dc', '#ffe2bc', '#ffcf9e'].map((h) => lin(h));
  const band = new THREE.Vector3(0.3, 0.8, 0.52).normalize(), e1 = new THREE.Vector3().crossVectors(band, new THREE.Vector3(1, 0, 0)).normalize(), e2 = new THREE.Vector3().crossVectors(band, e1);
  for (let i = 0; i < n; i++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)); if (v.lengthSq() > 1 || v.lengthSq() < 0.01) { i--; continue; } v.normalize(); P.push(v.x, v.y, v.z);
    const m = R.f() ** 6; S.push(1.4 + 4.2 * m); const c = R.pick(cs), b = 0.25 + 1.4 * m + 0.25 * R.f(); C.push(c.r * b, c.g * b, c.b * b); }
  for (let i = 0; i < n * 3; i++) { const a = R.r(0, TAU), off = (R.f() + R.f() + R.f() - 1.5) * 0.12 * (0.6 + 0.6 * Math.sin(a * 3 + 1) ** 2), v = e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a)).addScaledVector(band, off).normalize();
    P.push(v.x, v.y, v.z); S.push(R.r(1.1, 2.0)); const b = R.r(0.06, 0.22) * (1 - Math.abs(off) * 4); C.push(b * 0.9, b * 0.92, b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('aS', new THREE.Float32BufferAttribute(S, 1)); g.setAttribute('aC', new THREE.Float32BufferAttribute(C, 3));
  const U = { uA: { value: 1 } }, m = new THREE.Points(g, new THREE.ShaderMaterial(Object.assign({ uniforms: U,
    vertexShader: 'attribute float aS; attribute vec3 aC; varying vec3 vC; void main(){ vec4 p = projectionMatrix * vec4(mat3(modelViewMatrix) * position * 1000.0, 1.0); gl_Position = p.xyww; gl_PointSize = aS; vC = aC; }',
    fragmentShader: 'uniform float uA; varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); gl_FragColor = vec4(vC * uA * exp(-d * 14.0), 1.0); }' }, AB_ADD)));
  m.frustumCulled = false; m.renderOrder = -5; st.scene.add(m); return { m, U }; }

function abSun(st, dir, c, size) { const k = st.key; k.target.position.copy(c); k.target.updateMatrixWorld(); k.position.copy(c).addScaledVector(dir.clone().normalize(), size * 4);
  Object.assign(k.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: size * 0.5, far: size * 9 }); k.shadow.camera.updateProjectionMatrix(); k.shadow.normalBias = size * 0.002; }
function abNF(st, n, f) { st.cam.near = n; st.cam.far = f; st.cam.updateProjectionMatrix(); }
const abWP = (o) => { o.updateWorldMatrix(true, false); return o.getWorldPosition(new THREE.Vector3()); };
function abLabel(st, p, txt, a, dx = 60, dy = -50) { if (a <= 0.01) return; const v = p.clone().project(st.cam); if (v.z > 1) return; const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
  ctx.save(); ctx.font = '700 24px "Courier New", monospace'; const tw = ctx.measureText(txt).width + txt.length; ctx.restore();
  if (x + dx + 24 + tw > W - 160) dx = Math.min(-Math.abs(dx) - 40 - tw, W - 184 - tw - x); if (x + dx < 40) dx = 40 - x; dy = Math.max(140 - y, Math.min(H - 460 - y, dy));
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 7, y - 5); ctx.lineTo(x + dx, y + dy); ctx.lineTo(x + dx + 16, y + dy); ctx.stroke(); ctx.restore();
  pvText(txt, x + dx + 24, y + dy + 8, 24, { font: '"Courier New", monospace', weight: 700, spacing: 1, alpha: a * 0.95 }); }

// =====================================================================
//  SKY STAGE (20–31 s)
// =====================================================================
const AB_EX = 400;   // the Himalaya sits around x = 400 km
function abSkyDome(st) { const U = { uTop: { value: lin('#2f6cc8') }, uHor: { value: lin('#cfe2f2') }, uK: { value: 0 }, uSun: { value: new THREE.Vector3(0, 1, 0) } };
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * vec4(mat3(modelViewMatrix) * position * 1000.0, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 uTop, uHor, uSun; uniform float uK; varying vec3 vD;
void main(){ vec3 d = normalize(vD); float h = max(d.y, 0.0); vec3 col = mix(uHor, uTop, pow(h, mix(0.5, 0.18, uK)));
  col += uHor * exp(-h * mix(20.0, 60.0, uK)) * 0.35 * uK; if (d.y < 0.0) col = uHor;
  float sd = acos(clamp(dot(d, uSun), -1.0, 1.0)); col += vec3(1.0, 0.96, 0.9) * (smoothstep(0.012, 0.009, sd) * 8.0 + exp(-sd * 9.0) * 0.35 * (1.0 - 0.6 * uK));
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); return U; }
function abGroundMat() { const U = { uCl: { value: 0 } }, m = STDm({ color: '#ffffff', roughness: 1 });
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'varying vec3 vWp; uniform float uCl;\n' + AB_NOISE + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWp.xz; float fw = length(fwidth(p));
        vec2 q = mat2(0.94, -0.34, 0.34, 0.94) * p + 1.2 * vec2(fb2(p * 0.08), fb2(p * 0.08 + 5.0)); vec2 cl = floor(q / 0.7); float hc = h21(cl);
        vec3 fld = hc < 0.3 ? vec3(0.30, 0.38, 0.16) : hc < 0.55 ? vec3(0.42, 0.44, 0.22) : hc < 0.75 ? vec3(0.52, 0.46, 0.30) : hc < 0.9 ? vec3(0.24, 0.32, 0.14) : vec3(0.58, 0.54, 0.40);
        vec2 fe = abs(fract(q / 0.7) - 0.5); float edge = smoothstep(0.47, 0.5, max(fe.x, fe.y)); fld *= 1.0 - 0.25 * edge;
        vec3 avg = vec3(0.38, 0.40, 0.22); fld = mix(fld, avg, smoothstep(0.08, 0.5, fw / 0.7));
        float fo = smoothstep(0.52, 0.6, fb2(p * 0.12 + 3.0) + 0.15 * fb2(p * 1.5)); vec3 col = mix(fld, vec3(0.09, 0.15, 0.06) * (0.8 + 0.5 * fb2(p * 3.0)), fo);
        col *= 0.8 + 0.4 * fb2(p * 0.015 + 9.0);
        // the city around the origin (and towns): grey blocks and streets
        float urb = exp(-length((p - vec2(4.0, -6.0)) / vec2(16.0, 12.0)));
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 c = floor(p / 60.0) + vec2(float(i), float(j)); float h = h21(c); vec2 cc = (c + vec2(h21(c + 3.1), h21(c + 7.7))) * 60.0; urb = max(urb, step(0.55, h) * exp(-length(p - cc) / (1.5 + 5.0 * h))); }
        urb = clamp(urb * (0.6 + 0.8 * fb2(p * 0.4)), 0.0, 1.0);
        vec2 sg = abs(fract(p / 0.16) - 0.5); float street = smoothstep(0.4, 0.46, max(sg.x, sg.y)); street = mix(street, 0.15, smoothstep(0.05, 0.16, fw));
        vec3 city = mix(vec3(0.46, 0.44, 0.41), vec3(0.62, 0.60, 0.56), h21(floor(p / 0.16))) * (0.85 + 0.3 * fb2(p * 6.0)); city = mix(city, vec3(0.28, 0.28, 0.29), street * 0.8);
        col = mix(col, city, smoothstep(0.25, 0.6, urb));
        // her avenue: a river with a green park along z = 0 near the city
        float rz = abs(p.y + 0.6 * sin(p.x * 0.25) * smoothstep(0.0, 30.0, abs(p.x))); col = mix(col, vec3(0.2, 0.34, 0.14) * (0.8 + 0.4 * fb2(p * 9.0)), (1.0 - smoothstep(0.55, 0.7, rz)) * step(abs(p.x - 4.0), 40.0));
        col = mix(col, vec3(0.05, 0.12, 0.16), 1.0 - smoothstep(0.08, 0.12, rz));
        // seen from very high: a field of cumulus (white blobs) and their shadows
        vec2 cq = p * 0.22; float cc2 = fb2(cq) * 0.7 + fb2(cq * 3.1 + 2.0) * 0.4; float cov = smoothstep(0.74, 0.86, cc2) * uCl; float sh2 = smoothstep(0.74, 0.86, fb2(cq + vec2(0.06, -0.05)) * 0.7 + fb2((cq + vec2(0.06, -0.05)) * 3.1 + 2.0) * 0.4) * uCl;
        col *= 1.0 - 0.45 * sh2; col = mix(col, vec3(1.25, 1.27, 1.3), cov);
        diffuseColor.rgb = col; }`); };
  m.userData.U = U; return m; }
function abMountains() { const NX = 420, NZ = 260, g = new THREE.PlaneGeometry(240, 150, NX, NZ).rotateX(-Math.PI / 2), p = g.attributes.position, col = new Float32Array(p.count * 3);
  const rid = (x, z, s0, o) => { let r = 0, a = 1, f = 1 / 18, w = 0; for (let k = 0; k < o; k++) { const n = 1 - Math.abs(2 * abFbm(x * f, z * f, s0 + k, 1) - 1); r += a * n * n * (k ? 0.6 + 0.6 * r / w : 1); w += a; a *= 0.5; f *= 2.05; } return r / w; };
  for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i) - 75, wx = u + 6 * (abFbm(u / 30, v / 30, 3, 2) - 0.5), wz = v + 6 * (abFbm(u / 30, v / 30, 4, 2) - 0.5);
    const r = rid(wx, wz, 91, 6), env = Math.exp(-(((v + 58) / 26) ** 2)) * ss(-4, -22, v);
    // Everest: a sharp pyramid with three ridges (local x 6, z −20)
    const dx = u - 6, dz = v + 20, dd = Math.hypot(dx, dz), an = Math.atan2(dz, dx), arms = 0.75 + 0.25 * Math.cos(3 * an + 0.6), ever = 8.85 * Math.max(0, 1 - dd / (11 * arms)) ** 1.35 * (0.92 + 0.08 * r);
    let y = Math.max(env * (1.0 + 7.4 * r ** 1.4), ever * ss(-3, -10, v), 0.6 * env * r) + 0.35 * abFbm(u / 6, v / 6, 5, 3) * ss(-2, -10, v); p.setY(i, Math.max(0, y)); }
  g.computeVertexNormals(); const nrm = g.attributes.normal;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), ny = nrm.getY(i), u = p.getX(i), v = p.getZ(i), n = abFbm(u / 2.5, v / 2.5, 7, 3) - 0.5;
    const snow = ss(5.0, 6.0, y + 1.6 * n) * ss(0.6, 0.8, ny + 0.15 * n), rock = ss(1.4, 2.6, y + n), sc = 0.82 + 0.3 * abFbm(u * 1.3, v * 1.3, 9, 2);
    const c = new THREE.Color().setRGB(0.24, 0.27, 0.13).lerp(new THREE.Color(0.22, 0.2, 0.18).multiplyScalar(sc), rock).lerp(new THREE.Color(0.11, 0.105, 0.1), rock * ss(0.75, 0.45, ny) * 0.8).lerp(new THREE.Color(0.93, 0.95, 1.0), snow);
    col.set([c.r, c.g, c.b], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, STDm({ vertexColors: true, roughness: 0.92 })); m.position.set(AB_EX, 0.01, -75); m.receiveShadow = true; m.castShadow = true; return m; }
function abAirliner() { const g = new THREE.Group(), w = STDm({ color: '#f2f2ee', roughness: 0.4, metalness: 0.3 }), b = STDm({ color: '#2a4a8a', roughness: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(2, 2, 40, 10).rotateZ(Math.PI / 2), w)); g.add(mesh(new THREE.SphereGeometry(2, 10, 8), w, -20, 0, 0, { s: [1.6, 1, 1] }));
  g.add(mesh(new THREE.BoxGeometry(7, 0.4, 36), w, 2, -0.5, 0)); g.add(mesh(new THREE.BoxGeometry(4, 6, 0.4), b, 18, 3, 0)); g.add(mesh(new THREE.BoxGeometry(3, 0.3, 12), w, 18, 0.5, 0));
  g.scale.setScalar(0.024); g.traverse((o) => (o.castShadow = false)); return g; }   // ~0.5 km: larger than life so it reads next to a 10 km girl
function abSky() { return once('ab_sky', () => {
  const st = makeStage({ fov: 50, far: 20000, hemi: 0.55, sky: 0xbcd4f0, ground: 0x6a6450, key: 2.3, keyCol: '#fff2e0' }), S = { st }, R = RNG('absky');
  st.cam.near = 0.01; S.sun = new THREE.Vector3(0.7, 0.6, 0.3).normalize(); skyEnv(st, '#3a78c8', '#cfe2f2', S.sun);
  S.U = abSkyDome(st); S.U.uSun.value.copy(S.sun); S.stars = abStars(st, 2500, 1); st.scene.fog = new THREE.Fog('#cfe2f2', 20, 300);
  S.gm = abGroundMat(); const gr = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), S.gm); gr.receiveShadow = true; st.scene.add(gr);
  S.mtn = abMountains(); st.scene.add(S.mtn);
  // the city (instanced blocks) around (4, −6), leaving the river park along z = 0 free
  { const N = 14000, im = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), STDm({ roughness: 0.8 }), N, true), c = new THREE.Color(), cols = ['#d8d0c4', '#bfc4c8', '#a8a49c', '#e4dccc', '#8e949a', '#c8b8a0']; let k = 0;
    while (k < N) { const x = 4 + R.n(26), z = -6 + R.n(20), d = Math.hypot((x - 4) / 16, (z + 6) / 12); if (R.f() > Math.exp(-d * 1.4) || Math.abs(z + 0.6 * Math.sin(x * 0.25) * ss(0, 30, Math.abs(x))) < 0.9) continue;
      const core = Math.exp(-(((x - 6) / 3) ** 2 + ((z + 4) / 3) ** 2)), hgt = 0.02 + R.f() ** 2 * 0.07 + core * R.f() ** 2 * 0.4, f = R.r(0.04, 0.1);
      im.setMatrixAt(k, M4c(x, 0, z, R.r(0, 0.3), f, hgt, f * R.r(0.7, 1.3))); im.setColorAt(k, c.set(R.pick(cols)).multiplyScalar(R.r(0.75, 1.05))); k++; }
    st.scene.add(im); }
  // cumulus deck (bases ~0.9–1.3 km), dense around the city and the walk, sparser farther out; a few higher puffs by the mountains
  const T = [0, 1, 2, 3, 4, 5, 6, 7].map(abCloudTex); S.clouds = [];
  const addC = (x, z, y, w) => { const tt = R.pick(T), m = abCloudMat(tt.tx), sp = new THREE.Sprite(m); sp.center.set(0.5, tt.base); sp.position.set(x, y, z); sp.scale.set(w, w * tt.asp * R.r(0.85, 1.2), 1); sp.renderOrder = -4; st.scene.add(sp); S.clouds.push(sp); };
  for (let i = 0; i < 260; i++) { let x = R.r(-25, 60), z = R.r(-60, 25); if (z > -2.5 && z < 14 && x > -12 && x < 30) z = -R.r(2.5, 8); addC(x, z, R.r(0.9, 1.3), R.r(0.5, 2.0)); }
  for (let i = 0; i < 70; i++) { const x = R.r(-2, 14), z = (R.f() < 0.6 ? -1 : 1) * R.r(0.5, 3.5); addC(x, z, R.r(0.35, 0.8), R.r(0.35, z > 0 ? 0.7 : 1.2)); }
  for (let i = 0; i < 260; i++) { const a = R.r(0, TAU), r = R.r(40, 700); addC(Math.cos(a) * r + 100, Math.sin(a) * r, R.r(0.9, 1.6), R.r(1.5, 5)); }
  for (let i = 0; i < 14; i++) addC(AB_EX + R.r(-60, 120), R.r(-150, -110), R.r(2.0, 3.5), R.r(1.2, 3));   // only a few valley puffs far behind the range
  S.planes = [0, 1, 2, 3].map(() => { const p = abAirliner(); st.scene.add(p); return p; });
  S.trailM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false }); S.trails = [null, null, null, null];
  S.P = makeGirl(st); return S; }); }
// her walk: x of the hips (km) as she strides 0.55 h per second; phase stays a steady pace
const abWalkX = (t, t0, x0) => x0 + 0.55 * (abH(t) - abH(t0)) * 2 / Math.LN2;
function abSkyFrame(S, t, h, girlP, q, camP, camT, f, alt) { const st = S.st;
  placeGirl(S.P, girlP[0], girlP[1], girlP[2], h, q);
  const k = ss(8, 55, alt); S.U.uK.value = k; S.U.uTop.value.copy(C3('#2f6cc8', '#0b1d58', ss(6, 30, alt)).lerp(lin('#01030a'), ss(25, 65, alt))); S.U.uHor.value.copy(C3('#cfe2f2', '#9cc4ee', k));
  S.stars.U.uA.value = ss(35, 70, alt) * 0.9; st.hemi.intensity = lerp(0.55, 0.25, k);
  st.scene.fog.color.copy(S.U.uHor.value); st.scene.fog.near = 25 + 12 * alt; st.scene.fog.far = 220 + 60 * alt; AB_CU.uHaze.value.copy(S.U.uHor.value); S.gm.userData.U.uCl.value = ss(12, 40, alt);
  camPt(st, camP, camT, f, t, 0.35, 3); abNF(st, Math.max(0.005, h * 0.004), 20000);
  const cp = st.cam.position, ca = ss(15, 35, alt); S.clouds.forEach((sp) => { const d = sp.position.distanceTo(cp); sp.material.userData.U.uFar.value = ss(st.scene.fog.near * 0.6, st.scene.fog.far, d) * 0.85; sp.material.opacity = 1 - ca; sp.visible = ca < 0.99; });
  abSun(st, S.sun, new THREE.Vector3(girlP[0], h * 0.45, girlP[2]), h * 0.75); }
SHOT_FN.clouds = (lt, dur, t) => { const S = abSky(), h = abH(t), x = abWalkX(t, 20, -1.5);
  S.planes.forEach((p) => (p.visible = false)); S.trails.forEach((m) => m && (m.visible = false));
  abSkyFrame(S, t, h, [x, 0, 0], { yaw: Math.PI / 2, walk: 1, ph: t * 5.2, headYaw: -0.15, look: [0.3, -0.3] }, [x + 0.25 * h, h * 0.36, 1.55 * h], [x + 0.05 * h, h * 0.47, 0], 50, h * 0.42);
  renderStage(S.st, 1.0); bloom(0.15); };
// Everest: she walks past the range; airliners at ~10.5 km swerve round her with contrails
const AB_PL = [[23.0, 1, 10.6, 3.6], [24.0, -1, 10.3, 1.4], [24.9, 1, 11.0, 3.4], [25.8, -1, 10.5, 2.0]];
function abPlanePos(i, tau) { const [t0, side, alt, zb] = AB_PL[i], xh = abWalkX(tau, 24, AB_EX - 24), h = abH(tau), xs = xh + 0.15 * h + 18 - 9 * (tau - t0), u = (xs - xh) / (0.35 * h + 3);
  return new THREE.Vector3(xs, alt + 0.8 * side * Math.exp(-u * u) * ss(0, 1, tau - t0 + 1), zb * 0.2 * h + side * (0.12 * h + 1.5) * Math.exp(-u * u)); }
SHOT_FN.everest = (lt, dur, t) => { const S = abSky(), h = abH(t), x = abWalkX(t, 24, AB_EX - 24);
  S.planes.forEach((p, i) => { const on = t > AB_PL[i][0] - 0.2; p.visible = on; if (!on) { if (S.trails[i]) S.trails[i].visible = false; return; }
    const a = abPlanePos(i, t), b = abPlanePos(i, t + 0.02); p.position.copy(a); p.lookAt(b); p.rotateY(Math.PI / 2); p.rotateX(clamp((b.z - a.z) * 1.2, -0.7, 0.7));
    const pts = []; for (let k = 0; k <= 40; k++) pts.push(abPlanePos(i, t - 2.6 * (k / 40))); if (S.trails[i]) { S.trails[i].geometry.dispose(); S.st.scene.remove(S.trails[i]); }
    const tr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.11, 6), S.trailM); S.st.scene.add(tr); S.trails[i] = tr; });
  abSkyFrame(S, t, h, [x, 0, 0], { yaw: Math.PI / 2, walk: 1, ph: t * 5.2, headYaw: 0.2 * Math.sin(t * 1.3), look: [0.4, 0] }, [x + 0.3 * h, h * 0.34, 1.3 * h], [x + 0.06 * h, h * 0.5, 0], 50, h * 0.5);
  S.st.scene.fog.near = 160; S.st.scene.fog.far = 1100;
  renderStage(S.st, 1.0); bloom(0.12); if (CAMONLY) return; abLabel(S.st, new THREE.Vector3(AB_EX + 6, 8.85, -95), 'EVEREST · 29,032 ft', ss(24.3, 24.8, t) * (1 - ss(27.2, 27.6, t)), 50, -60); };
SHOT_FN.air = (lt, dur, t) => { const S = abSky(), h = abH(t), x = AB_EX + 600;
  S.planes.forEach((p) => (p.visible = false)); S.trails.forEach((m) => m && (m.visible = false));
  abSkyFrame(S, t, h, [x, 0, 0], { yaw: Math.PI / 2, walk: 0.15 * (1 - lt / dur), ph: t * 4, headPitch: -0.12 * ss(0.5, 2.5, lt), look: [0, 0.5] }, [x + 0.12 * h, h * 0.3, 1.45 * h], [x, h * 0.55, 0], 52, h * 0.9);
  renderStage(S.st, 1.0); bloom(0.18); };

// =====================================================================
//  SPACE STAGE (31–57 s): the Earth (procedural day texture, clouds, atmosphere), stars, the ISS, GPS rings, the Moon
// =====================================================================
function abEarth(st) { const U = { uSun: { value: new THREE.Vector3(0, 1, 0) } }, C = new THREE.Vector3(0, -AB_RE, 0);
  const gV = 'varying vec3 vN, vWp; void main(){ vN = position; vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
  const e = new THREE.Mesh(new THREE.SphereGeometry(AB_RE, 320, 160), new THREE.ShaderMaterial({ extensions: { derivatives: true }, uniforms: U, vertexShader: gV,
    fragmentShader: AB_NOISE + `uniform vec3 uSun; varying vec3 vN, vWp;
void main(){ vec3 n = normalize(vN), V = normalize(cameraPosition - vWp); float fw = length(fwidth(n));
  float c = fb3(n * 1.45 + vec3(3.1, 1.7, 4.2)) * 0.78 + fb3(n * 5.0 + 11.0) * 0.26 + (fb3(n * 22.0) - 0.5) * 0.14 + (fb3(n * 120.0) - 0.5) * 0.05;
  float th = 0.6, land = smoothstep(th - fw * 3.0 - 0.0015, th + fw * 3.0 + 0.0015, c), lat = abs(n.y);
  float desert = smoothstep(0.52, 0.66, fb3(n * 2.6 + 20.0) + 0.22 * exp(-pow((lat - 0.38) / 0.14, 2.0)) - 0.12 * smoothstep(0.62, 0.7, c));
  float dt = fb3(n * 300.0 + 4.0);
  vec3 veg = mix(vec3(0.035, 0.085, 0.03), vec3(0.11, 0.14, 0.06), fb3(n * 28.0)) * (0.8 + 0.4 * dt);
  vec3 des = mix(vec3(0.42, 0.30, 0.17), vec3(0.58, 0.46, 0.30), fb3(n * 25.0)) * (0.85 + 0.3 * dt);
  vec3 lc = mix(veg, des, desert); float ridge = 1.0 - abs(2.0 * fb3(n * 16.0 + 3.0) - 1.0); lc = mix(lc, vec3(0.22, 0.19, 0.16), smoothstep(0.8, 0.95, ridge) * 0.7);
  lc = mix(lc, vec3(0.75, 0.75, 0.75), smoothstep(0.93, 0.99, ridge) * 0.6 * land);
  vec3 oc = mix(vec3(0.004, 0.02, 0.07), vec3(0.02, 0.12, 0.2), smoothstep(th - 0.05, th, c));
  vec3 col = mix(oc, lc, land); float ice = smoothstep(0.84, 0.9, lat + (fb3(n * 9.0) - 0.5) * 0.12); col = mix(col, vec3(0.85, 0.88, 0.92), ice);
  vec3 q = n * 3.6 + 1.1 * (vec3(fb3(n * 2.2), fb3(n * 2.2 + 3.3), fb3(n * 2.2 + 7.1)) - 0.5);
  float cv = fb3(q) * 0.62 + fb3(q * 4.3 + 2.0) * 0.3 + (fb3(q * 22.0) - 0.5) * 0.18 + (fb3(q * 110.0) - 0.5) * 0.06;
  float band = 0.08 * exp(-pow(lat / 0.12, 2.0)) + 0.07 * exp(-pow((lat - 0.75) / 0.12, 2.0)) - 0.06 * exp(-pow((lat - 0.4) / 0.1, 2.0));
  float cloud = smoothstep(0.5, 0.7, cv + band);
  float dl = dot(n, uSun), lam = max(dl, 0.0), mu = max(dot(n, V), 0.0);
  float shd = 1.0 - 0.45 * smoothstep(0.5, 0.7, fb3(q + uSun * 0.01) + band);   // cloud shadows on the ground
  col *= (0.012 + 1.25 * lam) * shd;
  col += (1.0 - land) * (1.0 - cloud) * pow(max(dot(reflect(-uSun, n), V), 0.0), 50.0) * 0.55 * step(0.0, dl) * vec3(1.0, 0.95, 0.85);
  col = mix(col, vec3(1.0, 0.99, 0.97) * (0.015 + 1.3 * lam), cloud * 0.97);
  float lit = smoothstep(-0.15, 0.3, dl); col = mix(col, vec3(0.18, 0.38, 0.85) * lit * 0.7, 0.04 + 0.4 * pow(1.0 - mu, 3.0));
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` }));
  e.position.copy(C); st.scene.add(e);
  const AU = { uSun: U.uSun, uC: { value: C }, uR: { value: AB_RE } };
  const a = new THREE.Mesh(new THREE.SphereGeometry(AB_RE + 420, 128, 64), new THREE.ShaderMaterial(Object.assign({ side: THREE.BackSide, uniforms: AU, vertexShader: gV,
    fragmentShader: `uniform vec3 uSun, uC; uniform float uR; varying vec3 vN, vWp;
void main(){ vec3 ro = cameraPosition - uC, rd = normalize(vWp - cameraPosition); float tc = -dot(ro, rd); vec3 cp = ro + rd * max(tc, 0.0); float d = length(cp), x = (d - uR);
  float hit = step(d, uR) * step(0.0, tc); float g = exp(-max(x, 0.0) / 28.0) * 1.1 + exp(-max(x, 0.0) / 140.0) * 0.28; g *= mix(1.0, 0.25, hit) * smoothstep(-60.0, 0.0, x + 60.0 * (1.0 - hit));
  float L = smoothstep(-0.25, 0.35, dot(normalize(cp), uSun)); float rr = length(ro); g *= 1.0 - smoothstep(-0.03, 0.12, dot(rd, ro / rr)) * (1.0 - smoothstep(uR + 150.0, uR + 420.0, rr));
  gl_FragColor = vec4(vec3(0.28, 0.55, 1.0) * g * L, 1.0);
#include <encodings_fragment>
}` }, AB_ADD))); a.position.copy(C); a.renderOrder = 1; st.scene.add(a);
  return { e, a, U }; }
function abISS() { const g = new THREE.Group(), white = STDm({ color: '#e6e4de', roughness: 0.45, metalness: 0.2 }), grey = STDm({ color: '#8a8c90', roughness: 0.45, metalness: 0.7 }), gold = STDm({ color: '#c89a48', roughness: 0.35, metalness: 0.9 });
  const panel = g3Tex((x, w, h) => { x.fillStyle = '#c8a050'; x.fillRect(0, 0, w, h); const cw = w / 4, ch = h / 64; for (let j = 0; j < 64; j++) for (let i = 0; i < 4; i++) { x.fillStyle = (i + j) % 7 ? '#1a2848' : '#22305a'; x.fillRect(i * cw + 1.5, j * ch + 1, cw - 3, ch - 2); }
    x.fillStyle = '#b8b0a0'; x.fillRect(w / 2 - 2, 0, 4, h); }, 128, 1024);
  const pm = STDm({ map: panel, roughness: 0.3, metalness: 0.55, side: THREE.DoubleSide, emissive: '#0a1430', emissiveIntensity: 0.4 });
  const latt = wrap(g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 7; x.strokeRect(3, 3, w - 6, h - 6); x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.stroke(); }, 64, 64), 24, 1);
  const tm = STDm({ color: '#c8c8c4', map: latt, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.5 });
  const add = (geo, m, x, y, z, o) => { const q = mesh(geo, m, x, y, z, o); g.add(q); return q; };
  add(new THREE.BoxGeometry(108, 4.5, 4.5), tm, 0, 5, 0); add(new THREE.BoxGeometry(108, 0.5, 0.5), grey, 0, 7.2, 2.2); add(new THREE.BoxGeometry(108, 0.5, 0.5), grey, 0, 2.8, -2.2);
  [-1, 1].forEach((s) => [38, 50].forEach((x0) => { add(new THREE.CylinderGeometry(1.4, 1.4, 3, 12).rotateZ(Math.PI / 2), grey, s * x0, 5, 0);
    [-1, 1].forEach((sz) => { const w = new THREE.Group(); w.position.set(s * x0, 5, sz * 3); w.rotation.z = 0.5 * s; g.add(w);
      [-1, 1].forEach((k) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 33).rotateX(-Math.PI / 2), pm); p.position.set(k * 2.7, 0, sz * 17.5); w.add(p); });
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 34, 6).rotateX(Math.PI / 2), grey); mast.position.z = sz * 17.5; w.add(mast); }); }));
  [-1, 1].forEach((s) => [10, 14, 18].forEach((x0, i) => { const r = add(new THREE.BoxGeometry(3.2, 0.2, 13), white, s * x0, 2.2 - i * 0.2, -9); r.rotation.x = 0.2; }));
  const mod = (r, l, z, x = 0, ry = 0, m = white) => { const c = add(new THREE.CylinderGeometry(r, r, l, 20).rotateX(Math.PI / 2), m, x, 0, z); c.rotation.y = ry; for (let k = -1; k <= 1; k += 2) add(new THREE.TorusGeometry(r, 0.12, 6, 20), grey, x + (ry ? k * l / 2 : 0), 0, ry ? z : z + k * l / 2).rotation.y = ry; return c; };
  mod(2.2, 7, 12); mod(2.2, 8.5, 4); mod(2.2, 5.5, -3); mod(2.0, 12.6, -12.5, 0, 0, gold); mod(2.1, 13, -25.5);
  mod(2.2, 7, 12, 6.5, Math.PI / 2); mod(2.2, 11, 12, -8, Math.PI / 2); add(new THREE.CylinderGeometry(1.5, 1.5, 4, 14), white, -8, 3.5, 12);
  [-1, 1].forEach((s) => add(new THREE.PlaneGeometry(14, 3.2).rotateX(-Math.PI / 2), pm, s * 9.5, 0, -27).rotation.z = 0.3 * s);
  add(new THREE.BoxGeometry(0.4, 0.4, 17), grey, 0, 2.6, 0); g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  g.scale.setScalar(0.001); return g; }
function abMoonTex() { const W_ = 2048, H_ = 1024, R = RNG('moon'); const hc = document.createElement('canvas'); hc.width = W_; hc.height = H_; const hx = hc.getContext('2d');
  const col = g3Tex((x) => { x.fillStyle = '#8c8a86'; x.fillRect(0, 0, W_, H_); hx.fillStyle = '#808080'; hx.fillRect(0, 0, W_, H_);
    for (let k = 0; k < 900; k++) blot(x, R.r(0, W_), R.r(0, H_), R.r(20, 120), R.pick(['rgba(160,158,150,0.18)', 'rgba(100,100,98,0.18)', 'rgba(190,186,176,0.12)']));
    for (let k = 0; k < 16; k++) { const cx = R.r(W_ * 0.12, W_ * 0.45), cy = R.r(H_ * 0.25, H_ * 0.7), r = R.r(60, 190); for (let j = 0; j < 7; j++) blot(x, cx + R.n(r * 0.8), cy + R.n(r * 0.6), r * R.r(0.5, 1), 'rgba(58,60,64,0.55)'); }
    const crater = (cx, cy, r, a) => { [x, hx].forEach((c, ci) => { c.save(); c.translate(cx, cy); c.scale(1 / Math.max(0.25, Math.cos((cy / H_ - 0.5) * Math.PI)), 1);
      const g1 = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.35); if (ci) { g1.addColorStop(0, 'rgba(40,40,40,1)'); g1.addColorStop(0.7, 'rgba(70,70,70,1)'); g1.addColorStop(0.86, 'rgba(210,210,210,1)'); g1.addColorStop(1, 'rgba(128,128,128,0)'); }
      else { g1.addColorStop(0, `rgba(120,118,112,${a})`); g1.addColorStop(0.8, `rgba(110,108,104,${a})`); g1.addColorStop(0.9, `rgba(200,196,188,${a})`); g1.addColorStop(1, 'rgba(150,150,150,0)'); }
      c.globalAlpha = ci ? Math.min(1, a * 1.6) : 1; c.fillStyle = g1; c.beginPath(); c.arc(0, 0, r * 1.35, 0, TAU); c.fill(); c.restore(); }); };
    for (let k = 0; k < 5000; k++) { const r = 2 + 60 * R.f() ** 6; crater(R.r(0, W_), R.r(H_ * 0.04, H_ * 0.96), r, R.r(0.3, 0.8)); }
    [[0.62, 0.72, 40], [0.2, 0.3, 26]].forEach(([u, v, r]) => { crater(u * W_, v * H_, r, 0.9); for (let k = 0; k < 40; k++) { const a = R.r(0, TAU), L = r * R.r(3, 9); x.strokeStyle = 'rgba(225,222,215,0.18)'; x.lineWidth = R.r(2, 6); x.beginPath(); x.moveTo(u * W_ + Math.cos(a) * r, v * H_ + Math.sin(a) * r); x.lineTo(u * W_ + Math.cos(a) * L, v * H_ + Math.sin(a) * L); x.stroke(); } }); }, W_, H_);
  const bump = new THREE.CanvasTexture(hc); return { col, bump }; }
function abSatTex() { return g3Tex((x, w, h) => { blot(x, w / 2, h / 2, w / 2, 'rgba(200,220,255,0.35)'); x.fillStyle = '#e8c070'; x.fillRect(w / 2 - 6, h / 2 - 6, 12, 12); x.fillStyle = '#5a7ad0'; x.fillRect(w / 2 - 30, h / 2 - 3, 20, 6); x.fillRect(w / 2 + 10, h / 2 - 3, 20, 6); }, 64, 64); }
function abSpace() { return once('ab_space', () => {
  const st = makeStage({ fov: 40, far: 1e7, hemi: 0.32, sky: 0x06080e, ground: 0x2f62b8, key: 3.4, keyCol: '#fff1de' }), S = { st };
  st.key.shadow.mapSize.set(2048, 2048); S.sun = new THREE.Vector3(0.68, 0.42, -0.6).normalize();   // hard side sun: lit front/profile, the camera side in shadow
  S.rim = new THREE.DirectionalLight('#c4d8ff', 1.6); st.scene.add(S.rim, S.rim.target);
  S.stars = abStars(st, 6000, 2); S.E = abEarth(st); S.E.U.uSun.value.copy(S.sun);
  S.iss = abISS(); st.scene.add(S.iss);
  // GPS: 6 orbital planes at 55°, radius 26 560 km, 4 satellites each; the geostationary ring
  S.rings = new THREE.Group(); S.rings.position.set(0, -AB_RE, 0); st.scene.add(S.rings); S.sats = [];
  const ringGeo = (r) => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 257 }, (_, i) => new THREE.Vector3(Math.cos(i / 256 * TAU) * r, 0, Math.sin(i / 256 * TAU) * r)));
  const rm = new THREE.LineBasicMaterial({ color: '#cfdcff', transparent: true, opacity: 0.45, depthWrite: false }), stx = abSatTex();
  for (let k = 0; k < 6; k++) { const pl = new THREE.Group(); pl.rotation.set(0, k / 6 * Math.PI, 0); const inc = new THREE.Group(); inc.rotation.x = 55 * DEG; pl.add(inc); inc.add(new THREE.Line(ringGeo(26560), rm)); S.rings.add(pl);
    for (let j = 0; j < 4; j++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: stx, transparent: true, depthWrite: false })); inc.add(sp); S.sats.push({ sp, a0: j / 4 * TAU + k * 0.5, r: 26560 }); } }
  { const geo = new THREE.Group(); geo.add(new THREE.Line(ringGeo(42164), rm.clone())); geo.children[0].material.opacity = 0.25; S.rings.add(geo); for (let j = 0; j < 5; j++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: stx, transparent: true, depthWrite: false })); geo.add(sp); S.sats.push({ sp, a0: j / 5 * TAU + 0.3, r: 42164, geo: 1 }); } }
  // the Moon and its orbit
  const MT = abMoonTex(); S.moon = new THREE.Mesh(new THREE.SphereGeometry(1737, 128, 64), STDm({ map: MT.col, bumpMap: MT.bump, bumpScale: 6, roughness: 1 })); S.moon.castShadow = false; S.moon.receiveShadow = false; st.scene.add(S.moon);
  S.moonRing = new THREE.Line(ringGeo(384400), new THREE.LineBasicMaterial({ color: '#d8e0ff', transparent: true, opacity: 0.4, depthWrite: false })); st.scene.add(S.moonRing);
  S.P = makeGirl(st);
  return S; }); }
// a cool rim from behind her (opposite the camera, on the shadow side)
function abRim(S, c, sd) { const v = S.st.cam.position.clone().sub(c).normalize(), d = v.negate().addScaledVector(sd, -0.6).add(new THREE.Vector3(0, 0.3, 0)).normalize();
  S.rim.target.position.copy(c); S.rim.target.updateMatrixWorld(); S.rim.position.copy(c).add(d); }
function abSpaceFrame(S, t, h, q, camP, camT, f, near, far, vis = {}) { const st = S.st; placeGirl(S.P, 0, 0, 0, h, q); S.iss.visible = !!vis.iss; S.rings.visible = !!vis.rings; S.moon.visible = S.moonRing.visible = !!vis.moon;
  const sd = vis.sun || S.sun; S.E.U.uSun.value.copy(sd); camPt(st, camP, camT, f, t, 0.25, 5); abNF(st, near, far); abSun(st, sd, new THREE.Vector3(0, h * 0.5, 0), h * 0.7); abRim(S, new THREE.Vector3(0, h * 0.6, 0), sd); S.sd = sd;
  S.sats.forEach((s) => { s.sp.visible = !!vis.rings; const a = s.a0 + t * (s.geo ? 0.08 : 0.35); s.sp.position.set(Math.cos(a) * s.r, 0, Math.sin(a) * s.r); s.sp.scale.setScalar(0.022 * st.cam.position.length() * (vis.satK || 1)); }); }
const abHead = (S) => abWP(S.P.head);
// 31–34: close on her upper body, the blue limb and clouds below, black space
SHOT_FN.space = (lt, dur, t) => { const S = abSpace(), h = abH(t);
  abSpaceFrame(S, t, h, { yaw: Math.PI / 2, headYaw: 0.25, headPitch: 0.05, look: [0.3, -0.1], emo: { surprise: 0.3 } }, [0.62 * h, 0.66 * h, 0.72 * h], [0.0, 0.72 * h, 0], 40, h * 0.02, 30000);
  renderStage(S.st, 1.0); bloom(0.25); };
// 34–38: the ISS drifts past in front of her face (camera near the station, her huge face behind)
const AB_ISSUN = new THREE.Vector3(0.82, 0.38, -0.42).normalize();   // a touch more frontal so her face and the panels are lit
function abIssShot(t, lt, dur, near) { const S = abSpace(), h = abH(t), st = S.st;
  abSpaceFrame(S, t, h, { yaw: Math.PI / 2, headYaw: 0.35, headPitch: 0.04, look: [0.5, 0], emo: { surprise: 0.4 } }, [0, 0, 0], [0, 0, 0], 40, 0.02, 30000, { iss: 1, sun: AB_ISSUN });
  // her face sits in the left half; the station drifts across the empty space in front of her face, ~1 km from the lens (hundreds of km in front of her)
  const F = abHead(S), dir = new THREE.Vector3(0.8, -0.08, 0.6).normalize(), dist = near ? 0.78 * h : 1.05 * h, C = F.clone().addScaledVector(dir, dist), fv = near ? 36 : 40;
  camPt(st, C.toArray(), F.clone().add(new THREE.Vector3(near ? 0.17 * h : 0.2 * h, near ? -0.11 * h : -0.17 * h, 0)).toArray(), fv, t, 0.2, 7); abNF(st, 0.01, 30000); st.cam.updateMatrixWorld(true);
  const u = lt / dur, nx = near ? lerp(0.62, 0.42, u) : lerp(1.05, 0.55, u), ny = near ? 0.3 - 0.03 * u : 0.36 - 0.04 * u, wf = near ? 0.36 : 0.3;
  const dI = 0.109 / (wf * 2 * Math.tan(fv * DEG / 2) * W / H), ray = new THREE.Vector3(nx, ny, 0.5).unproject(st.cam).sub(st.cam.position).normalize(), I = st.cam.position.clone().addScaledVector(ray, dI);
  const nI = st.cam.position.clone().sub(I).normalize().add(S.sd).normalize();   // panels face between the lens and the sun so they catch light
  S.iss.position.copy(I); S.iss.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nI).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.6 + 0.15 * u));
  abRim(S, F, S.sd); renderStage(st, 0.92); bloom(0.15); if (CAMONLY) return; abLabel(st, I, 'ISS · 357 ft', ss(0.2, 0.5, lt) * (near ? 0 : 1), -90, 110); }
SHOT_FN.iss = (lt, dur, t) => abIssShot(t, lt, dur, false);
SHOT_FN.iss2 = (lt, dur, t) => abIssShot(t, lt, dur, true);
// 38–41: wider, the Earth curves away under her feet
SHOT_FN.curve = (lt, dur, t) => { const S = abSpace(), h = abH(t);
  abSpaceFrame(S, t, h, { yaw: Math.PI / 2, headYaw: 0.1, headPitch: 0.25, look: [0, 0.4] }, [0.9 * h, 0.75 * h, 1.25 * h], [0.05 * h, 0.5 * h, 0], 42, h * 0.05, 60000);
  renderStage(S.st, 1.0); bloom(0.25); };
// 41–46: one huge step over continents — side view, then from above
SHOT_FN.step = (lt, dur, t) => { const S = abSpace(), h = abH(t), k = ss(0.0, 1.3, lt);
  abSpaceFrame(S, t, h, { yaw: Math.PI / 2, legR: [-0.85 * k, 0.75 * k], legL: [0.3 * k, 0.15 * k], armL: [0.45 * k, 0.1, 0.25], armR: [-0.4 * k, 0.1, 0.2], lean: 0.08 * k, headPitch: 0.3, look: [0, 0.4] }, [0.4 * h, 0.55 * h, 1.7 * h], [0.05 * h, 0.42 * h, 0], 45, h * 0.05, 80000);
  renderStage(S.st, 1.0); bloom(0.25); };
SHOT_FN.step2 = (lt, dur, t) => { const S = abSpace(), h = abH(t), k = ss(0, 2.2, lt), u = lt / dur;
  abSpaceFrame(S, t, h, { yaw: Math.PI / 2, legR: [lerp(-0.85, -0.6, k), lerp(0.75, 0.2, k)], legL: [0.3, 0.15], armL: [0.45, 0.1, 0.25], armR: [-0.4, 0.1, 0.2], headPitch: 0.5, look: [0, 0.6] }, [1.0 * h, (0.25 + 0.05 * u) * h, 1.05 * h], [0.1 * h, 0.4 * h, 0], 48, h * 0.05, 80000);
  renderStage(S.st, 1.0); bloom(0.25); };
// 46–49: bigger than the Earth — she stands on it like a ball
SHOT_FN.earth = (lt, dur, t) => { const S = abSpace(), h = abH(t), span = h + 2 * AB_RE, cy = h * 0.5 - AB_RE * 0.55;
  abSpaceFrame(S, t, h, { yaw: Math.PI / 2 + 0.3, headPitch: 0.35, look: [0, 0.5], armL: [0.1, 0.2, 0.3], armR: [0.1, 0.2, 0.3] }, [0.75 * span, cy + 0.2 * span, 1.3 * span], [0, cy, 0], 42, span * 0.1, span * 10);
  renderStage(S.st, 1.0); bloom(0.25); };
// 49–52: GPS rings and satellites round her legs
SHOT_FN.sats = (lt, dur, t) => { const S = abSpace(), h = abH(t), span = h * 1.05;
  abSpaceFrame(S, t, h, { yaw: Math.PI / 2 + 0.3, headPitch: 0.45, look: [0.2, 0.6], armL: [0.1, 0.2, 0.3], armR: [0.1, 0.2, 0.3] }, [0.8 * span, 0.4 * span, 1.35 * span], [0, 0.42 * h, 0], 42, span * 0.1, span * 20, { rings: 1 });
  renderStage(S.st, 1.0); bloom(0.3); if (CAMONLY) return; abLabel(S.st, S.sats[5].sp.getWorldPosition(new THREE.Vector3()), 'GPS · 12,550 mi', ss(0.4, 0.8, lt), 50, -60); };
// 52–57: the Moon. Close on the cratered Moon with her giant hand reaching in from behind, then the camera pulls back:
// her fingertips touch it (~55.2 s) and she keeps growing past it; the orbit ring sweeps round her.
const AB_TOUCH = 55.2;
const abMoonPose = (t) => ({ yaw: Math.PI / 2, armR: [lerp(0.4, 2.25, ss(52.1, 53.8, t)), 0.12, lerp(0.5, 0.06, ss(52.1, 54, t))], armL: [0.1, 0.18, 0.3], headPitch: -0.35 * ss(52.1, 53.5, t), look: [0, 0.6], emo: { smile: 0.5 * ss(54.5, 55.5, t) } });
// forced perspective: the camera sits ~30 000 km from the Moon (it fills ~0.3 of the frame) and her hand is far behind it,
// so at the touch her fingertip lands just beside the Moon's limb on screen (they never intersect); then a short pull-back.
const AB_MV = new THREE.Vector3(0.18, -0.1, 1).normalize(), AB_MSUN = new THREE.Vector3(1, 0.32, -0.12).normalize();
const abTip = (S) => S.P.arms[1].hand.localToWorld(new THREE.Vector3(0, -0.17, 0));
SHOT_FN.moon = (lt, dur, t) => { const S = abSpace(), h = abH(t), Ec = new THREE.Vector3(0, -AB_RE, 0), fv = 40, k = Math.tan(fv * DEG / 2) * 2 * W / H;
  if (!S.M) { const hT = abH(AB_TOUCH); placeGirl(S.P, 0, 0, 0, hT, abMoonPose(AB_TOUCH)); S.P.root.updateMatrixWorld(true);
    const tip = abTip(S), ad = tip.clone().sub(abWP(S.P.arms[1].el)).normalize(), Dm = 3474 / (0.3 * k), Dh = 0.5 * hT;   // the hand ~half the frame
    const C = tip.clone().addScaledVector(AB_MV, Dh), toT = tip.clone().sub(C).normalize(), sd = ad.clone().addScaledVector(toT, -ad.dot(toT)).normalize();
    const ang = Math.asin(1737 / Dm) * 1.1 + 0.004; S.MC = C; S.M = C.clone().addScaledVector(toT.clone().multiplyScalar(Math.cos(ang)).addScaledVector(sd, Math.sin(ang)), Dm);
    S.moon.position.copy(S.M); S.moon.rotation.set(0.2, -1.9, 0); const rM = S.M.distanceTo(Ec);
    const nrm = new THREE.Vector3().crossVectors(S.M.clone().sub(Ec).normalize(), new THREE.Vector3(0.3, 0, 1).normalize()).normalize(); S.moonRing.position.copy(Ec); S.moonRing.scale.setScalar(rM / 384400); S.moonRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nrm); }
  abSpaceFrame(S, t, h, abMoonPose(t), [0, 0, 0], [0, 0, 0], fv, 1, 1e7, { moon: 1, rings: 1, satK: 0.6, sun: AB_MSUN }); S.P.root.updateMatrixWorld(true);
  const M = S.M, p = EZ.io(ss(55.7, 57, t)), wide = new THREE.Vector3(0, 0.62 * h, 0), Cw = wide.clone().addScaledVector(AB_MV, 1.9 * h);
  const C = S.MC.clone().addScaledVector(AB_MV, 900 * (t - 52)).lerp(Cw, p), T = M.clone().lerp(wide.lerp(M, 0.3), p), D = C.distanceTo(M);
  camPt(S.st, C.toArray(), T.toArray(), fv, t, 0.08, 9); abNF(S.st, Math.min(D, C.length()) * 0.03, 5e7); abRim(S, new THREE.Vector3(0, h * 0.6, 0), AB_MSUN);
  S.sats.forEach((s) => s.sp.scale.setScalar(0.004 * Math.max(D, 0.3 * h)));
  renderStage(S.st, 1.05); bloom(0.3); if (CAMONLY) return; abLabel(S.st, M, 'MOON · 2,159 mi', ss(52.4, 52.9, t) * (1 - ss(54.3, 54.7, t)), 60, -70); };
