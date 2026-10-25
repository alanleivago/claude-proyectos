// =====================================================================
//  SPACE — the sky over the esplanade from sunset to the dark ages (owned by the space agent).
//  buildSpace(st, S): add sky content to the esplanade stage. poseSpace(S, t, cam): set it for time t (pure function of t).
//  SHOT_FN.you (24–27) and SHOT_FN.web (27–30): one "cosmos" stage (the ground → the city → the Earth → the cosmic web).
//  spaceOverlay(t): the in-sky labels (TÚ, LA VÍA LÁCTEA, UN CUÁSAR, LA TIERRA).
//  Sky content lives on a sphere of radius SKR around the camera (depth-tested against the set, no fog, additive).
// =====================================================================
const SKR = 9000, SPC = { cam: null, at: -1, kind: '', mw: null, mwR: 0, q: null, qa: 0 };
const TRAVEL = new THREE.Vector3(0, 0.23, -1).normalize();   // the radiant of the warp, over the city
const scol = (h) => new THREE.Color(h).convertLinearToSRGB();  // raw (display) rgb for the shaders that skip encoding
const gN = (R) => (R.f() + R.f() + R.f() + R.f() - 2) * 1.732;
const pxW = (px, fovDeg, d = SKR) => px * 2 * d * Math.tan(fovDeg * DEG / 2) / H;
const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
// a direction in the sky from a screen point of a reference camera pose (so things land where the shot frames them)
function skyDir(P, T, f, sx, sy) { const c = new THREE.PerspectiveCamera(f, W / H, 0.1, 100); c.rotation.order = 'YXZ'; camLook(c, P[0], P[1], P[2], T[0], T[1], T[2]); c.updateMatrixWorld(true);
  return new THREE.Vector3(sx / W * 2 - 1, 1 - sy / H * 2, 0.5).unproject(c).sub(c.position).normalize(); }
// ---- canvas painting helpers (soft dots, glows)
function spDotImg(rgb, n = 32) { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.3, `rgba(${rgb},0.5)`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(0, 0, n, n); return c; }
const SPD = () => once('sp_dots', () => ({ blue: spDotImg('150,180,255'), white: spDotImg('255,250,240'), gold: spDotImg('255,206,140'), pink: spDotImg('255,120,180'), pale: spDotImg('200,215,255'), dark: spDotImg('14,8,4') }));
function spGlow(x, cx, cy, r, rgb, a) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.3, `rgba(${rgb},${a * 0.4})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
// a galaxy painted into a canvas (kind 0–3 spirals, 4–5 ellipticals, 6–7 young clumpy blue)
function paintGal(x, cx, cy, Rr, kind, seed) { const R = RNG('pg' + seed), D = SPD(); x.globalCompositeOperation = 'lighter';
  const dot = (img, px, py, s, a) => { x.globalAlpha = Math.min(1, a); x.drawImage(img, px - s, py - s, 2 * s, 2 * s); };
  if (kind <= 3) { const arms = [2, 2, 3, 2][kind], bar = kind === 1, b = [0.30, 0.27, 0.36, 0.21][kind], rot = R.r(0, TAU), rc = Rr * (bar ? 0.24 : 0.11), phM = Math.log(0.95 * Rr / rc) / b;
    spGlow(x, cx, cy, Rr * 1.0, '120,150,235', 0.16);
    for (let i = 0; i < 900; i++) { const r = Rr * Math.min(1, -Math.log(R.f() + 1e-3) * 0.3), th = R.r(0, TAU); dot(D.pale, cx + r * Math.cos(th), cy + r * Math.sin(th), Rr * 0.02 + 0.6, 0.06); }
    for (let a = 0; a < arms; a++) for (let i = 0; i < 1300; i++) { const u = Math.pow(R.f(), 0.85), ph = u * phM, r = rc * Math.exp(b * ph), th = rot + a * TAU / arms + ph, sg = Rr * (0.018 + 0.05 * u) * (kind === 2 ? 1.7 : 1);
      const px = cx + r * Math.cos(th) + gN(R) * sg, py = cy + r * Math.sin(th) + gN(R) * sg; dot(R.f() < 0.62 ? D.blue : D.white, px, py, Rr * (0.012 + 0.03 * R.f() * R.f()) * (1.2 - 0.5 * u) + 0.7, 0.2 * (1 - 0.5 * u));
      if (R.f() < 0.025) dot(R.f() < 0.55 ? D.pink : D.white, px, py, Rr * 0.016 + 0.7, 0.85); }
    x.globalCompositeOperation = 'source-over';
    for (let a = 0; a < arms; a++) for (let i = 0; i < 420; i++) { const u = R.f() * 0.75, ph = u * phM, r = rc * Math.exp(b * ph) * 0.9, th = rot + a * TAU / arms + ph - 0.14; dot(D.dark, cx + r * Math.cos(th) + gN(R) * Rr * 0.012, cy + r * Math.sin(th) + gN(R) * Rr * 0.012, Rr * 0.03, 0.1); }
    x.globalCompositeOperation = 'lighter';
    if (bar) { x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(1, 0.26); spGlow(x, 0, 0, Rr * 0.34, '255,206,140', 0.85); x.restore(); }
    spGlow(x, cx, cy, Rr * 0.26, '255,206,140', 0.9); spGlow(x, cx, cy, Rr * 0.08, '255,248,230', 1);
  } else if (kind <= 5) { x.save(); x.translate(cx, cy); x.rotate(R.r(0, TAU)); x.scale(1, kind === 4 ? 0.74 : 0.36);
    spGlow(x, 0, 0, Rr * 0.98, '255,214,160', 0.3); spGlow(x, 0, 0, Rr * 0.5, '255,222,176', 0.6); spGlow(x, 0, 0, Rr * 0.16, '255,246,228', 1); x.restore();
    for (let i = 0; i < 260; i++) dot(D.white, cx + gN(R) * Rr * 0.3, cy + gN(R) * Rr * 0.3 * (kind === 4 ? 0.74 : 0.36), 1.2, 0.25);
  } else { spGlow(x, cx, cy, Rr * 0.85, '110,140,255', 0.14);
    for (let c = 0; c < 10; c++) { const ox = cx + gN(R) * Rr * 0.3, oy = cy + gN(R) * Rr * 0.3, cs = Rr * R.r(0.08, 0.2); spGlow(x, ox, oy, cs * 1.7, '130,160,255', 0.4);
      for (let i = 0; i < 80; i++) dot(R.f() < 0.72 ? D.blue : R.f() < 0.6 ? D.white : D.pink, ox + gN(R) * cs * 0.5, oy + gN(R) * cs * 0.5, Rr * R.r(0.01, 0.03) + 0.7, 0.55); }
    if (kind === 7) for (let a = 0; a < 2; a++) for (let i = 0; i < 160; i++) { const u = R.f(), th = a * Math.PI + u * 3.2, r = Rr * (0.15 + 0.6 * u); dot(D.blue, cx + r * Math.cos(th) + gN(R) * 6, cy + r * Math.sin(th) * 0.8 + gN(R) * 6, 3, 0.35); }
  }
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
const SPATLAS = () => once('sp_atlas', () => g3Tex((x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 8; k++) { const cx = (k % 4) * 512 + 256, cy = Math.floor(k / 4) * 512 + 256; x.save(); x.beginPath(); x.rect(cx - 256, cy - 256, 512, 512); x.clip(); paintGal(x, cx, cy, 220, k, k); x.restore(); } }, 2048, 1024, false));
// a star texture: soft halo, hot core, diffraction spikes (kind 0 white-blue, 1 pink with a ring, 2 round, 3 the quasar)
function starTex(kind) { return g3Tex((x, w) => { const c = w / 2, col = kind === 1 ? '255,165,215' : kind === 3 ? '190,215,255' : '195,215,255'; x.globalCompositeOperation = 'lighter';
  spGlow(x, c, c, w * 0.5, col, kind === 2 ? 0.5 : 0.4); spGlow(x, c, c, w * 0.18, col, 0.8); spGlow(x, c, c, w * 0.07, '255,255,255', 1); spGlow(x, c, c, w * 0.035, '255,255,255', 1);
  if (kind === 1) { x.strokeStyle = 'rgba(255,150,210,0.35)'; x.lineWidth = w * 0.012; x.beginPath(); x.arc(c, c, w * 0.16, 0, TAU); x.stroke(); }
  if (kind !== 2) { const L = kind === 1 ? 0.62 : 1, th = kind === 3 ? 0.006 : 0.004;
    [0, 1].forEach((v) => { [[th, 0.95], [th * 4, 0.28], [th * 12, 0.08]].forEach(([tw, a]) => { const g = v ? x.createLinearGradient(c, c - c * L, c, c + c * L) : x.createLinearGradient(c - c * L, c, c + c * L, c);
      g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(255,255,255,${a})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; const t2 = w * tw; if (v) x.fillRect(c - t2 / 2, c - c * L, t2, 2 * c * L); else x.fillRect(c - c * L, c - t2 / 2, 2 * c * L, t2); }); });
    if (kind === 3 || kind === 0) { x.save(); x.translate(c, c); x.rotate(Math.PI / 4); const g = x.createLinearGradient(-c * 0.35, 0, c * 0.35, 0); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, 'rgba(255,255,255,0.25)'); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(-c * 0.35, -w * 0.003, c * 0.7, w * 0.006); x.fillRect(-w * 0.003, -c * 0.35, w * 0.006, c * 0.7); x.restore(); } }
  }, 512, 512); }
const spSprite = (tex, col = '#ffffff', op = 1, add = true) => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: tex, color: col, opacity: op, fog: false, toneMapped: false, transparent: true, depthWrite: false }, add ? { blending: THREE.AdditiveBlending } : {}))); s.visible = false; return s; };
const NOISE_GLSL = `
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float h31(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float n2(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
float fb2(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * n2(p); p = p * 2.03 + vec2(1.7, 9.2); m *= 0.5; } return a; }
float fb3(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * n3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); m *= 0.5; } return a; }
// the coastline near home (km; land where z > zc(x)): straight under the esplanade, wilder farther out
float zc(float x){ float ax = abs(x); return -1.7 + (fb2(vec2(x / 220.0, 1.3)) - 0.5) * 320.0 * smoothstep(0.0, 120.0, ax) + (fb2(vec2(x / 30.0, 4.1)) - 0.5) * 44.0 * smoothstep(0.0, 15.0, ax) + (fb2(vec2(x / 3.0, 7.7)) - 0.5) * 4.0 * smoothstep(0.0, 2.0, ax); }
// how urban a place near home is (km)
float urban(vec2 p){ float U = exp(-length((p - vec2(0.0, 0.8)) / vec2(9.0, 5.0)));
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 c = floor(p / 80.0) + vec2(float(i), float(j)); float h = h21(c); vec2 cc = (c + vec2(h21(c + 3.1), h21(c + 7.7))) * 80.0; U = max(U, step(0.3, h) * exp(-length(p - cc) / (2.0 + 16.0 * h * h * h)));
    vec2 c2 = floor(p / 16.0) + vec2(float(i), float(j)); float h2 = h21(c2 + 11.0); vec2 cc2 = (c2 + vec2(h21(c2 + 5.3), h21(c2 + 1.9))) * 16.0; U = max(U, step(0.45, h2) * 0.8 * exp(-length(p - cc2) / (0.5 + 2.5 * h2 * h2))); }
  U *= 0.55 + 0.9 * fb2(p * 0.3 + 3.0); U *= 0.45 + 1.1 * exp(-max(p.y - zc(p.x), 0.0) / 70.0);
  vec2 a = abs(p * 1000.0 - vec2(0.0, -10.0)); U *= smoothstep(0.0, 30.0, max(a.x - 75.0, a.y - 105.0)); return clamp(U, 0.0, 1.0); }
`;

// =====================================================================
//  THE NIGHT SKY AND THE WARP — one ribbon per star; at rest a soft dot, in the warp a streak radiating from TRAVEL.
//  Each star has a virtual position P (sky stars at ~1, deep stars far ahead along the axis); the warp moves us by s(t).
// =====================================================================
function buildStars(st) { const R = RNG('stars'), L = [], cs = ['#ffffff', '#e4ecff', '#c8d8ff', '#fff2dc', '#ffe2bc', '#ffcf9e', '#b8ccff'].map(scol);
  const push = (P, m, w, k, c) => L.push([P, m, w, k, c]);
  for (let i = 0; i < 13000; i++) { const y = R.r(-0.1, 1), a = R.r(0, TAU), q = Math.sqrt(1 - y * y), r = R.r(0.75, 1.25), m = 0.28 + 1.7 * Math.pow(R.f(), 6); push([Math.cos(a) * q * r, y * r, Math.sin(a) * q * r], m * Math.pow(r, 1.2), 1.3 + 1.6 * Math.pow(R.f(), 4) + m * 0.9, 0, R.pick(cs)); }
  const T = TRAVEL, e1 = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 1, 0)).normalize(), e2 = new THREE.Vector3().crossVectors(e1, T);
  for (let i = 0; i < 6000; i++) { const z = R.r(0.9, 9.6), rho = 0.05 + Math.sqrt(R.f()) * 1.7, a = R.r(0, TAU); push(T.clone().multiplyScalar(z).addScaledVector(e1, Math.cos(a) * rho).addScaledVector(e2, Math.sin(a) * rho).toArray(), 0.45 + 1.4 * Math.pow(R.f(), 3), 1.4 + 1.5 * R.f(), 1, R.pick(cs)); }
  // the Milky Way band across the night sky: thousands of faint stars and soft haze
  const d1 = new THREE.Vector3(-0.8, 0.1, -0.6).normalize(), d2 = new THREE.Vector3(0.45, 0.8, -0.4).normalize(), Nb = new THREE.Vector3().crossVectors(d1, d2).normalize(), b2 = new THREE.Vector3().crossVectors(Nb, d1).normalize();
  const band = (sg) => { const a = R.r(0, TAU), off = gN(R) * sg * (0.7 + 0.3 * Math.sin(a * 3 + 1)); return d1.clone().multiplyScalar(Math.cos(a)).addScaledVector(b2, Math.sin(a)).addScaledVector(Nb, off).normalize(); };
  for (let i = 0; i < 24000; i++) { const P = band(0.075); if (P.y > -0.1) push(P.toArray(), 0.07 + 0.45 * Math.pow(R.f(), 5), 1.0 + 0.6 * R.f(), 2, R.pick(cs.slice(0, 4))); }
  for (let i = 0; i < 900; i++) { const P = band(0.05); if (P.y > -0.1) push(P.toArray(), R.r(0.018, 0.045), R.r(22, 60), 3, R.pick(['#a8b8ff', '#ffe0c8', '#c8c0ff', '#e8e8ff'].map(scol))); }
  const n = L.length, pos = new Float32Array(n * 12), cor = new Float32Array(n * 8), mag = new Float32Array(n * 4), wid = new Float32Array(n * 4), kin = new Float32Array(n * 4), sed = new Float32Array(n * 4), col = new Float32Array(n * 12), idx = new Uint32Array(n * 6);
  L.forEach(([P, m, w, k, c], i) => { for (let v = 0; v < 4; v++) { const j = i * 4 + v; pos.set(P, j * 3); cor.set([v === 1 || v === 2 ? 1 : 0, v < 2 ? -1 : 1], j * 2); mag[j] = m; wid[j] = w; kin[j] = k; sed[j] = (i * 0.61803) % 1; col.set([c.r, c.g, c.b], j * 3); }
    idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aC', new THREE.BufferAttribute(cor, 2)); g.setAttribute('aM', new THREE.BufferAttribute(mag, 1)); g.setAttribute('aW', new THREE.BufferAttribute(wid, 1));
  g.setAttribute('aK', new THREE.BufferAttribute(kin, 1)); g.setAttribute('aSeed', new THREE.BufferAttribute(sed, 1)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  const U = { uT: { value: TRAVEL.clone() }, uS: { value: 0 }, uL: { value: 0 }, uR: { value: SKR }, uK: { value: new THREE.Vector4(1, 0, 1, 1) }, uRes: { value: new THREE.Vector2(W, H) }, uTime: { value: 0 }, uTw: { value: 1 }, uA: { value: 1 } };
  const mat = new THREE.ShaderMaterial(Object.assign({ uniforms: U,
    vertexShader: `uniform vec3 uT; uniform float uS, uL, uR, uTime, uTw, uA; uniform vec4 uK; uniform vec2 uRes; attribute vec2 aC; attribute float aM, aW, aK, aSeed; attribute vec3 aCol;
      varying vec2 vQ; varying float vLen, vW, vB; varying vec3 vCol;
      vec4 clipOf(vec3 P){ return projectionMatrix * viewMatrix * vec4(cameraPosition + normalize(P) * uR, 1.0); }
      void main(){ float k = aK < 0.5 ? uK.x : aK < 1.5 ? uK.y : aK < 2.5 ? uK.z : uK.w; vec3 P = position - uT * uS, Pt = P + uT * uL; float d2 = max(dot(P, P), 1e-4);
        float b = aM * k * uA * min(pow(d2, -0.6), 40.0) * (1.0 + uTw * 0.3 * sin(aSeed * 61.0 + uTime * (2.0 + fract(aSeed * 7.0) * 4.0)));
        vec4 cH = clipOf(P), cT = clipOf(Pt); if (b < 0.003 || cH.w <= 0.0 || cT.w <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
        vec2 sH = cH.xy / cH.w * 0.5 * uRes, sT = cT.xy / cT.w * 0.5 * uRes, dv = sH - sT; float len = length(dv); vec2 ax = len > 1e-3 ? dv / len : vec2(1.0, 0.0), nr = vec2(-ax.y, ax.x);
        float w = aW * clamp(pow(d2, -0.2), 1.0, 2.6), al = aC.x * (len + 2.0 * w) - w; vec2 sp = sT + ax * al + nr * aC.y * w;
        gl_Position = vec4(sp / (0.5 * uRes), cH.z / cH.w, 1.0); vQ = vec2(al, aC.y * w); vLen = len; vW = w; vB = b * (len > 2.0 ? 1.4 : 1.0); vCol = aCol; }`,
    fragmentShader: `varying vec2 vQ; varying float vLen, vW, vB; varying vec3 vCol;
      void main(){ float s = vQ.x, c = vQ.y, d = s < 0.0 ? length(vec2(s, c)) : s > vLen ? length(vec2(s - vLen, c)) : abs(c); float sg = vW * 0.42;
        float a = exp(-d * d / (sg * sg)) + 0.12 * exp(-d / vW) * min(vB, 1.0); float g = vLen > 1.0 ? mix(0.08, 1.0, pow(clamp(s / vLen, 0.0, 1.0), 1.5)) : 1.0;
        gl_FragColor = vec4(vCol * vB * a * g, 1.0); }` }, ADD));
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 3; m.visible = false; st.scene.add(m); return { m, U }; }
function poseStars(F, t) { const on = t >= 8 && t < 13.1; F.m.visible = on; if (!on) return; const U = F.U, u = clamp((t - 10.5) / 2.5), E = Math.exp(3) - 1;
  U.uS.value = t < 10.5 ? 0 : 9.6 * (Math.exp(3 * u) - 1) / E; U.uL.value = t < 10.5 ? 0 : 9.6 * 1.2 * Math.exp(3 * u) / E * 0.075 * ss(10.5, 10.9, t);
  U.uK.value.set(1, ss(10.45, 11.0, t), 1 - ss(10.55, 11.2, t), 1 - ss(10.5, 11.0, t)); U.uTime.value = t; U.uTw.value = 1 - ss(10.5, 10.9, t); U.uA.value = ss(8.0, 8.15, t) * (1 - ss(12.85, 13.1, t)); }

// =====================================================================
//  THE MILKY WAY SEEN FROM OUTSIDE — a barred spiral of ~60k points (golden bar and bulge, bluish arms, pink knots, dust lanes)
//  over a soft glow painted from the same points. Its angular size follows the HUD distance (100.000 light-years across).
// =====================================================================
function buildMilky(st) { const R = RNG('mw'), P = [], C = [], Sz = [], DP = [];
  const add = (x, y, z, c, b, s) => { P.push(x, y, z); C.push(c.r * b, c.g * b, c.b * b); Sz.push(s); };
  const gold = scol('#ffd496'), white = scol('#fff4e6'), blue = scol('#98b4ff'), pale = scol('#d0dcff'), pink = scol('#ff78b0');
  for (let i = 0; i < 6000; i++) add(gN(R) * 0.075, gN(R) * 0.07, gN(R) * 0.045, R.f() < 0.7 ? gold : white, 0.45, 2.0 + R.f());
  for (let i = 0; i < 4000; i++) add(R.r(-0.27, 0.27) + gN(R) * 0.02, gN(R) * 0.035, gN(R) * 0.02, gold, 0.5, 1.8 + R.f());
  const b = Math.log(1 / 0.27) / (1.65 * Math.PI), arm = (a, ph, sg) => { const r = 0.27 * Math.exp(b * ph), th = ph + a; return [r * Math.cos(th) + gN(R) * sg, r * Math.sin(th) + gN(R) * sg]; };
  for (let a = 0; a < 2; a++) for (let i = 0; i < 13000; i++) { const u = Math.pow(R.f(), 0.8), [x, y] = arm(a * Math.PI, u * 1.65 * Math.PI, 0.02 + 0.06 * u); add(x, y, gN(R) * 0.012, R.f() < 0.45 ? blue : R.f() < 0.6 ? pale : white, 0.85 * (1 - 0.4 * u), 1.4 + 1.2 * R.f()); }
  for (let k = 0; k < 170; k++) { const a = R.f() < 0.5 ? 0 : Math.PI, u = R.r(0.1, 0.95), [x, y] = arm(a, u * 1.65 * Math.PI, 0.03), c = R.f() < 0.6 ? pink : white; for (let i = 0; i < 12; i++) add(x + gN(R) * 0.008, y + gN(R) * 0.008, 0, c, 0.9, 1.8 + R.f()); }
  for (let a = 0; a < 2; a++) for (let i = 0; i < 4500; i++) { const u = R.f(), ph = (0.45 + 0.8 * u) * Math.PI, r = 0.3 * Math.exp(b * ph), th = ph + a * Math.PI + Math.PI / 2; add(r * Math.cos(th) + gN(R) * 0.04, r * Math.sin(th) + gN(R) * 0.04, gN(R) * 0.012, R.f() < 0.5 ? blue : pale, 0.45, 1.4 + R.f()); }
  for (let i = 0; i < 9000; i++) { const r = Math.min(1.15, -Math.log(R.f() + 1e-4) * 0.3), th = R.r(0, TAU); add(r * Math.cos(th), r * Math.sin(th), gN(R) * 0.02, r < 0.3 ? gold : pale, 0.2, 1.6); }
  for (let i = 0; i < 500; i++) { const r = Math.sqrt(R.f()) * 1.1, th = R.r(0, TAU); add(r * Math.cos(th), r * Math.sin(th), gN(R) * 0.03, white, 1.0, 2.4 + R.f()); }
  for (let a = 0; a < 2; a++) for (let i = 0; i < 6000; i++) { const u = R.r(0.02, 0.85), ph = u * 1.65 * Math.PI, r = 0.27 * Math.exp(b * ph) * 0.93, th = ph + a * Math.PI - 0.1; DP.push(r * Math.cos(th) + gN(R) * 0.014, r * Math.sin(th) + gN(R) * 0.014, 0.002); }
  const grp = new THREE.Group(); grp.visible = false; st.scene.add(grp); const N = Sz.length;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('aCol', new THREE.Float32BufferAttribute(C, 3)); g.setAttribute('aS', new THREE.Float32BufferAttribute(Sz, 1));
  const U = { uPs: { value: 1 }, uA: { value: 1 } };
  const pts = new THREE.Points(g, new THREE.ShaderMaterial(Object.assign({ uniforms: U,
    vertexShader: 'uniform float uPs, uA; attribute vec3 aCol; attribute float aS; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float s = aS * uPs; gl_PointSize = max(1.0, s); vC = aCol * uA * min(1.0, s * s); }',
    fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; gl_FragColor = vec4(vC * exp(-dot(q, q) * 14.0), 1.0); }' }, ADD)));
  pts.frustumCulled = false; pts.renderOrder = 5;
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(DP, 3)); const UD = { uPs: { value: 1 }, uA: { value: 1 } };
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({ uniforms: UD, transparent: true, depthWrite: false,
    vertexShader: 'uniform float uPs; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(1.0, 4.0 * uPs); }',
    fragmentShader: 'uniform float uA; void main(){ vec2 q = gl_PointCoord - 0.5; gl_FragColor = vec4(0.05, 0.025, 0.012, uA * 0.22 * exp(-dot(q, q) * 10.0)); }' }));
  dust.frustumCulled = false; dust.renderOrder = 6;
  // the soft glow under the points: the same points painted and blurred into a canvas
  const tex = g3Tex((x, w) => { const c0 = document.createElement('canvas'); c0.width = c0.height = w; const y = c0.getContext('2d'), D = SPD(); y.fillStyle = '#000'; y.fillRect(0, 0, w, w); y.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N; i += 2) { const px = (P[i * 3] / 1.25 + 1) / 2 * w, py = (1 - (P[i * 3 + 1] / 1.25 + 1) / 2) * w, cc = [C[i * 3], C[i * 3 + 1], C[i * 3 + 2]]; y.globalAlpha = Math.min(1, (cc[0] + cc[1] + cc[2]) * 0.06); y.drawImage(cc[2] > cc[0] ? D.blue : D.gold, px - 3, py - 3, 6, 6); }
    y.globalCompositeOperation = 'source-over'; y.globalAlpha = 1; x.fillStyle = '#000'; x.fillRect(0, 0, w, w); x.filter = 'blur(5px)'; x.drawImage(c0, 0, 0); x.filter = 'none'; x.globalCompositeOperation = 'lighter'; spGlow(x, w / 2, w / 2, w * 0.13, '255,214,160', 0.7); }, 1024, 1024, false);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), new THREE.ShaderMaterial(Object.assign({ uniforms: { uMap: { value: tex }, uA: { value: 1 } }, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D uMap; uniform float uA; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(uMap, vUv).rgb * uA, 1.0); }' }, ADD)));
  glow.renderOrder = 4; grp.add(glow, pts, dust);
  const G = skyDir([0, 1.6, 4.5], [0, 18, -60], 62, 700, 560);
  return { grp, U, UD, glow, N, G }; }
function poseMilky(F, t, cam) { const on = t > 14.3 && t < 20.9; F.grp.visible = on; if (!on) { SPC.mw = null; return; }
  const d = logK(DIST, t), D = SKR * 0.78, sc = D * 50000 / d, fpx = (H / 2) / Math.tan(cam.fov * DEG / 2), Rpx = 50000 / d * fpx, fade = ss(14.3, 15.4, t) * (1 - ss(20.3, 20.9, t));
  F.grp.position.copy(cam.position).addScaledVector(F.G, D); F.grp.scale.setScalar(sc);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), F.G.clone().negate()); q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.95, 0, 0.6 + 0.05 * t))); F.grp.quaternion.copy(q);
  const ps = clamp(Rpx / 330, 0.3, 2.4), pe = Math.max(1, 2 * ps); F.U.uPs.value = ps; F.U.uA.value = fade * Math.min(1, 0.55 * Rpx * Rpx / (F.N * pe * pe));
  F.UD.uPs.value = ps; F.UD.uA.value = fade * clamp(Rpx / 200, 0, 1); F.glow.material.uniforms.uA.value = fade * (0.45 + 0.75 * (1 - ss(60, 360, Rpx)));
  SPC.mw = F.grp.position.clone(); SPC.mwR = Rpx; }

// =====================================================================
//  GALAXY FIELDS — textured galaxies (atlas) flying past along an axis: 20–24 everywhere, 30–37 sparse young blue ones
// =====================================================================
function buildGalField(st, key, n, o) { const R = RNG(key), T = o.T, e1 = new THREE.Vector3().crossVectors(T, new THREE.Vector3(1, 0, 0)).normalize(), e2 = new THREE.Vector3().crossVectors(T, e1);
  const geo = new THREE.PlaneGeometry(1, 1), tile = new Float32Array(n), col = new Float32Array(n * 3), al = new Float32Array(n), items = [];
  for (let i = 0; i < n; i++) { const rho = 0.12 + Math.sqrt(R.f()) * o.rho, a = R.r(0, TAU); tile[i] = o.kind(R); const k = R.r(0.85, 1.15), bl = R.r(0.9, 1.1); col.set([k * 1.6 * o.gain, k * 1.6 * o.gain, k * bl * 1.65 * o.gain], i * 3);
    items.push({ z0: R.r(0, o.Z), lat: e1.clone().multiplyScalar(Math.cos(a) * rho).addScaledVector(e2, Math.sin(a) * rho), size: o.size(R), qt: new THREE.Quaternion().setFromEuler(new THREE.Euler(R.r(0, 1.2), R.r(-0.3, 0.3), R.r(0, TAU))), sp: R.n(0.06) }); }
  geo.setAttribute('aTile', new THREE.InstancedBufferAttribute(tile, 1)); geo.setAttribute('aCol', new THREE.InstancedBufferAttribute(col, 3)); const aA = new THREE.InstancedBufferAttribute(al, 1); aA.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aA', aA);
  const mat = new THREE.ShaderMaterial(Object.assign({ uniforms: { uMap: { value: SPATLAS() } }, side: THREE.DoubleSide,
    vertexShader: 'attribute float aTile, aA; attribute vec3 aCol; varying vec2 vUv, vL; varying vec3 vC; void main(){ float c = mod(aTile, 4.0), r = floor(aTile / 4.0); vL = uv; vUv = vec2((uv.x + c) / 4.0, (uv.y + 1.0 - r) / 2.0); vC = aCol * aA; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D uMap; varying vec2 vUv, vL; varying vec3 vC; void main(){ vec2 d = abs(vL - 0.5); float e = 1.0 - smoothstep(0.44, 0.5, max(d.x, d.y)); gl_FragColor = vec4(texture2D(uMap, vUv).rgb * vC * e, 1.0); }' }, ADD));
  const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.frustumCulled = false; mesh.renderOrder = 4; mesh.visible = false; st.scene.add(mesh); return { mesh, items, aA, o }; }
const _gm = new THREE.Matrix4(), _gq = new THREE.Quaternion(), _gq2 = new THREE.Quaternion(), _gp = new THREE.Vector3(), _gs = new THREE.Vector3(), _gz = new THREE.Vector3(0, 0, 1), _ge = new THREE.Euler();
function poseGalField(F, t, cam) { const o = F.o, on = t > o.t0 && t < o.t1; F.mesh.visible = on; if (!on) return; const s = o.v * (t - o.t0), fade = ss(o.t0, o.t0 + o.fin, t) * (1 - ss(o.t1 - o.fout, o.t1, t)), D = SKR * 0.9, Z = o.Z;
  F.items.forEach((g, i) => { const z = ((g.z0 - s) % Z + Z) % Z, rel = g.lat.clone().addScaledVector(o.T, z), dist = rel.length(), ang = Math.atan(g.size / dist), dir = rel.divideScalar(dist);
    F.aA.array[i] = fade * (1 - ss(0.8 * Z, Z, z)) * (1 - ss(0.3, 0.6, ang)) * ss(0.0, 0.004, ang);
    _gp.copy(cam.position).addScaledVector(dir, D); _gq.setFromUnitVectors(_gz, _gs.copy(dir).negate()); _gq2.setFromEuler(_ge.set(0, 0, g.sp * t)); _gq.multiply(g.qt).multiply(_gq2);
    const sc = Math.tan(ang) * D / 0.43; _gm.compose(_gp, _gq, _gs.set(sc, sc, sc)); F.mesh.setMatrixAt(i, _gm); });
  F.mesh.instanceMatrix.needsUpdate = true; F.aA.needsUpdate = true; }

// =====================================================================
//  THE QUASAR (31.3–36.8): a blinding point with diffraction spikes and a bipolar jet beam; THE FIRST STARS (36.9–39.8)
// =====================================================================
function buildQuasar(st) { const core = spSprite(starTex(3), '#ffffff', 1), halo = spSprite(glowTex(), '#a8c0ff', 0.5), wide = spSprite(glowTex(), '#7090ff', 0.25);
  const beamT = g3Tex((x, w, h) => { const im = x.createImageData(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = Math.abs(i / (w - 1) * 2 - 1), v = (j / (h - 1) * 2 - 1), a = Math.pow(1 - u, 1.4) * (Math.exp(-v * v * 30) + 0.25 * Math.exp(-v * v * 4)), k = (j * w + i) * 4;
    im.data[k] = 200 + 55 * Math.exp(-v * v * 60); im.data[k + 1] = 220 + 35 * Math.exp(-v * v * 60); im.data[k + 2] = 255; im.data[k + 3] = 255 * Math.min(1, a); } x.putImageData(im, 0, 0); }, 512, 64);
  const jet = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial(Object.assign({ map: beamT, fog: false, toneMapped: false, side: THREE.DoubleSide }, ADD))); jet.matrixAutoUpdate = false; jet.visible = false; jet.renderOrder = 7;
  [wide, halo, jet, core].forEach((m) => st.scene.add(m)); core.renderOrder = 8;
  const PQ = [3, 1.1, 5], TQ = [-5, 17, -60]; return { core, halo, wide, jet, dirAt: (sx, sy) => skyDir(PQ, TQ, 60, sx, sy) }; }
function poseQuasar(Q, t, cam) { const on = t > 31.3 && t < 36.8; [Q.core, Q.halo, Q.wide].forEach((m) => (m.visible = on)); Q.jet.visible = false; SPC.q = null; if (!on) return;
  const k1 = EZ.o3(seg(t, 31.3, 33.6)), k2 = seg(t, 33.6, 36.8), sx = lerp(940, 700, k1) - 70 * k2, sy = lerp(-40, 520, k1) + 130 * k2, dir = Q.dirAt(sx, sy), pos = cam.position.clone().addScaledVector(dir, SKR);
  const b = ss(31.35, 31.8, t) * (1 - ss(34.6, 36.6, t)), fl = 1 + 0.5 * Math.exp(-Math.pow((t - 32.05) / 0.25, 2)), f = 60;
  Q.core.position.copy(pos); Q.core.scale.setScalar(pxW(950 * b * fl, f)); Q.core.material.rotation = 0.05;
  Q.halo.position.copy(pos); Q.halo.scale.setScalar(pxW(520 * fl, f)); Q.halo.material.opacity = 0.6 * b;
  Q.wide.position.copy(pos); Q.wide.scale.setScalar(pxW(1400, f)); Q.wide.material.opacity = 0.22 * b;
  const ja = ss(31.75, 32.0, t) * (1 - ss(34.0, 34.9, t)); if (ja > 0.001) { const L = 2400 * EZ.o3(seg(t, 31.75, 32.5)) * (1 - 0.45 * seg(t, 32.5, 34.5)), ang = 0.32, tip = Q.dirAt(sx + Math.sin(ang) * 100, sy - Math.cos(ang) * 100);
    const J = tip.sub(dir).normalize(), toC = dir.clone().negate(), side = new THREE.Vector3().crossVectors(toC, J).normalize(), Jw = J.multiplyScalar(pxW(L, f)), Sw = side.multiplyScalar(pxW(38, f));
    Q.jet.matrix.makeBasis(Jw, Sw, toC).setPosition(pos); Q.jet.matrixWorldNeedsUpdate = true; Q.jet.material.opacity = ja * 0.95; Q.jet.visible = true; }
  SPC.q = pos; SPC.qa = b; }
function buildFirst(st) { const tx = [starTex(0), starTex(1), starTex(2)], P = [-5.5, 1.6, 1], T = [4, 19, -50], out = [];
  [[600, 430, 620, 0], [290, 520, 430, 1], [740, 900, 520, 0], [880, 560, 330, 1], [180, 250, 200, 2], [770, 150, 180, 2], [430, 700, 160, 2], [960, 300, 150, 2], [110, 700, 160, 2], [640, 560, 140, 2], [880, 1060, 170, 2], [290, 1110, 200, 0], [990, 830, 130, 2], [150, 990, 140, 2], [560, 1180, 130, 2], [430, 170, 120, 2], [830, 1250, 150, 1], [60, 420, 120, 2], [700, 420, 110, 2], [1010, 1150, 120, 2], [350, 900, 110, 2]]
    .forEach(([x, y, s, k], i) => { const sp = spSprite(tx[k], k === 1 ? '#ffd8ee' : '#ffffff', 1); sp.renderOrder = 8; st.scene.add(sp); out.push({ sp, dir: skyDir(P, T, 60, x, y), s, ph: i * 1.7, i }); }); return out; }
function poseFirst(L, t, cam) { const on = t > 36.85 && t < 39.95; L.forEach((o) => { o.sp.visible = on; if (!on) return; const a = ss(36.9 + o.i * 0.035, 37.35 + o.i * 0.035, t) * (1 - ss(38.45 + (o.i % 6) * 0.13, 39.05 + (o.i % 6) * 0.1, t));
  o.sp.visible = a > 0.002; o.sp.position.copy(cam.position).addScaledVector(o.dir, SKR); o.sp.scale.setScalar(pxW(o.s * (1 + 0.06 * Math.sin(t * 5 + o.ph)) * (0.7 + 0.3 * a), 60)); o.sp.material.opacity = a; }); }

// =====================================================================
//  THE ESPLANADE SKY — sunset gradient and the Moon (0–8), black after 8 with the stars, warp, galaxies, quasar, first stars
// =====================================================================
function buildSpace(st, S) { const X = {};
  const mt = g3Tex((x, w) => { const R = RNG('moon'), c = w / 2, r = w * 0.46; x.save(); x.beginPath(); x.arc(c, c, r, 0, TAU); x.clip(); const g = x.createRadialGradient(c - r * 0.25, c - r * 0.25, r * 0.1, c, c, r); g.addColorStop(0, '#fffdf6'); g.addColorStop(0.75, '#f0ece4'); g.addColorStop(1, '#cfc8c4'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    for (let k = 0; k < 11; k++) { const a = R.r(0, TAU), d = R.r(0, r * 0.65); blot(x, c + Math.cos(a) * d, c + Math.sin(a) * d, R.r(r * 0.12, r * 0.34), 'rgba(150,150,170,0.32)'); }
    for (let k = 0; k < 26; k++) { const a = R.r(0, TAU), d = R.r(0, r * 0.85), cr = R.r(2, 7); x.strokeStyle = 'rgba(160,155,165,0.35)'; x.lineWidth = 1.2; x.beginPath(); x.arc(c + Math.cos(a) * d, c + Math.sin(a) * d, cr, 0, TAU); x.stroke(); } x.restore(); }, 256, 256);
  X.moon = spSprite(mt, '#ffffff', 1, false); X.moonGlow = spSprite(glowTex(), '#fff0e4', 0.4); X.moon.renderOrder = 2; st.scene.add(X.moonGlow, X.moon); X.moonDir = skyDir([0, 1.6, 1.25], [0, 43, 70], 58, 870, 470);
  X.stars = buildStars(st); X.milky = buildMilky(st);
  X.gal = buildGalField(st, 'gal', 460, { T: new THREE.Vector3(0.03, 0.79, -0.61).normalize(), Z: 10, rho: 4.6, v: 2.1, t0: 19.7, t1: 24.3, fin: 0.7, fout: 0.3, gain: 1, size: (R) => (R.f() < 0.07 ? R.r(0.22, 0.4) : 0.03 + 0.14 * Math.pow(R.f(), 2.5)), kind: (R) => { const f = R.f(); return f < 0.62 ? R.i(0, 3) : f < 0.9 ? R.i(4, 5) : R.i(6, 7); } });
  X.young = buildGalField(st, 'young', 300, { T: new THREE.Vector3(-0.13, 0.22, -0.97).normalize(), Z: 12, rho: 5, v: 0.9, t0: 29.8, t1: 37.3, fin: 0.9, fout: 0.7, gain: 1.3, size: (R) => 0.08 + 0.13 * Math.pow(R.f(), 2), kind: (R) => (R.f() < 0.72 ? R.i(6, 7) : R.i(0, 3)) });
  X.quasar = buildQuasar(st); X.first = buildFirst(st); S.space = X; }
function poseSpace(S, t, cam) { const X = S.space, U = S.st.skyU; if (!X || !U) return;
  if (t < 8) { U.uTop.value.set('#1a4a9e'); U.uHor.value.set('#cfd9e8'); U.uCl.value = -0.3; U.uSunC.value.set('#ffe0b8'); }
  else { U.uTop.value.set('#000104'); U.uHor.value.copy(C3('#03050b', '#0b0705', ss(39.5, 41.5, t))); U.uCl.value = -1; U.uSunC.value.set('#000000'); }
  const mo = t < 8; X.moon.visible = X.moonGlow.visible = mo; if (mo) { X.moon.position.copy(cam.position).addScaledVector(X.moonDir, SKR); X.moon.scale.setScalar(pxW(150, 58)); X.moonGlow.position.copy(X.moon.position); X.moonGlow.scale.setScalar(pxW(620, 58)); }
  poseStars(X.stars, t); poseMilky(X.milky, t, cam); poseGalField(X.gal, t, cam); poseGalField(X.young, t, cam); poseQuasar(X.quasar, t, cam); poseFirst(X.first, t, cam);
  SPC.cam = cam; SPC.at = TT; SPC.kind = 'esp'; }

// =====================================================================
//  YOU → THE CITY → THE EARTH → THE COSMIC WEB (24–30): one stage in km. The ground near home is a flat shader plane
//  (the plaza, the street grid, the coast) that hands over to a night globe (continents, city lights, atmosphere);
//  the web is a cloud of ~120k soft points around the Earth.
// =====================================================================
function cosmos() { return once('sp_cosmos', () => { const st = makeStage({ fov: 60, far: 5e6, hemi: 0, key: 0 }); st.key.castShadow = false; const RE = 6371, C = { st, RE };
  const gV = 'varying vec3 vN, vWp; void main(){ vN = position; vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
  C.earth = new THREE.Mesh(new THREE.SphereGeometry(RE, 256, 128), new THREE.ShaderMaterial({ extensions: { derivatives: true }, vertexShader: gV,
    fragmentShader: NOISE_GLSL + `varying vec3 vN, vWp;
      void main(){ vec3 n = normalize(vN), V = normalize(cameraPosition - vWp); float c = fb3(n * 1.7 + 2.0) + 0.3 * fb3(n * 6.0 + 9.0), fwn = length(fwidth(n)) * 40.0;
        float landN = smoothstep(0.66 - fwn - 0.003, 0.66 + fwn + 0.003, c), hx = n.x * 6371.0, hz = n.z * 6371.0, dh = length(n.xz), w = (1.0 - smoothstep(0.035, 0.09, dh)) * step(0.0, n.y);
        float land = mix(landN, smoothstep(-2.0, 2.0, hz - zc(hx)), w);
        float dens = smoothstep(0.34, 0.6, fb3(n * 5.0 + 5.0)) * pow(clamp(fb3(n * 60.0) * 1.9 - 0.5, 0.0, 1.0), 1.2) * (0.5 + 0.9 * fb3(n * 300.0)) * (0.35 + 1.4 * (1.0 - smoothstep(0.0, 0.05, c - 0.66))); dens = mix(dens, urban(vec2(hx, hz)) * 0.9, w) * land;
        vec3 q = n * 2600.0; float fq = length(fwidth(q)), dots = step(1.0 - dens * 0.75, h31(floor(q)));
        float Lg = mix(dots * (0.6 + 0.6 * h31(floor(q) + 7.0)), dens * 0.75, smoothstep(0.35, 1.1, fq)) + dens * 0.3;
        vec3 col = mix(vec3(0.005, 0.02, 0.034), vec3(0.045, 0.095, 0.07) * (0.45 + 1.1 * fb3(n * 40.0)), land) + vec3(1.0, 0.76, 0.4) * Lg * 1.7;
        float mu = max(dot(n, V), 0.0); col += vec3(0.05, 0.42, 0.40) * pow(1.0 - mu, 3.0) * 1.5 + vec3(0.01, 0.05, 0.05) * (1.0 - mu);
        gl_FragColor = vec4(col, 1.0); }` }));
  C.atmo = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.12, 96, 48), new THREE.ShaderMaterial(Object.assign({ side: THREE.BackSide, uniforms: { uR: { value: RE } }, vertexShader: gV,
    fragmentShader: 'uniform float uR; varying vec3 vN, vWp; void main(){ vec3 ro = cameraPosition, rd = normalize(vWp - ro); float tc = -dot(ro, rd); float d = length(ro + rd * max(tc, 0.0)); float x = (d - uR) / (uR * 0.1); float g = exp(-max(x, 0.0) * 4.5) * smoothstep(-0.015, 0.0, x); gl_FragColor = vec4(vec3(0.22, 0.72, 0.78) * g * 0.95, 1.0); }' }, ADD)));
  C.ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000, 200, 200).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ extensions: { derivatives: true }, transparent: true, depthWrite: false, uniforms: { uA: { value: 1 }, uTime: { value: 0 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: NOISE_GLSL + `uniform float uA, uTime; varying vec2 vP;
      float gridL(vec2 q, float sp, float wd, float fw){ vec2 d2 = abs(fract(q / sp + 0.5) - 0.5) * sp; float d = min(d2.x, d2.y), l = (1.0 - smoothstep(wd * 0.5, wd * 0.5 + fw, d)) * min(1.0, wd / fw); return mix(l, min(1.0, 2.0 * wd / sp), smoothstep(0.15, 0.6, fw / sp)); }
      float speck(vec2 q, float cell, float th, float fw){ vec2 c = floor(q / cell); float h = h21(c), r = length(fract(q / cell) - 0.5), d = step(th, h) * (1.0 - smoothstep(0.18, 0.18 + fw / cell, r)) * (0.5 + 0.5 * h21(c + 5.0)); return mix(d, (1.0 - th) * 0.075, smoothstep(0.25, 0.8, fw / cell)); }
      float lampDots(vec2 q, float sp, float wd, float per, float fw){ vec2 a = abs((fract(q / sp + 0.5) - 0.5) * sp); float r = 0.0022, re = max(r, fw * 0.8), e = (r * r) / (re * re);
        float ly = abs(fract(q.y / per + 0.5) - 0.5) * per, lx = abs(fract(q.x / per + 0.5) - 0.5) * per, d1 = length(vec2(a.x - wd * 0.5, ly)), d2 = length(vec2(a.y - wd * 0.5, lx));
        float v = e * (exp(-d1 * d1 / (re * re)) + exp(-d2 * d2 / (re * re))) + (1.0 - smoothstep(wd * 0.5, wd * 0.5 + fw, min(a.x, a.y))) * min(1.0, wd / fw) * 0.07;
        return mix(v, min(1.0, 2.0 * wd / sp) * 0.07 + 12.6 * r * r / (per * sp), smoothstep(0.3, 1.0, fw / per)); }
      float ringPts(vec2 m, vec2 c, float r, float n, float rad, float fwm){ vec2 d = m - c; float st = 6.2831853 / n, k = floor(atan(d.y, d.x) / st + 0.5) * st; float re = max(rad, fwm * 0.8), dd = length(m - c - r * vec2(cos(k), sin(k))); return (rad * rad) / (re * re) * exp(-dd * dd / (re * re)); }
      void main(){ vec2 p = vP; float fw = max(length(vec2(dFdx(p.x), dFdy(p.x))), length(vec2(dFdx(p.y), dFdy(p.y)))), fwm = fw * 1000.0;
        float land = smoothstep(-fw - 0.004, fw + 0.004, p.y - zc(p.x)), U = urban(p) * land; vec2 q = mat2(0.94, -0.34, 0.34, 0.94) * p + 0.4 * vec2(fb2(p * 0.15), fb2(p * 0.15 + 5.0)); float blk = 0.35 + 1.1 * h21(floor(q / 0.11));
        float Lc = U * (4.0 * lampDots(q, 0.99, 0.02, 0.028, fw) + 2.6 * blk * lampDots(q + 0.05, 0.11, 0.008, 0.024, fw) + 1.3 * blk * speck(q, 0.03, 0.5, fw) + 0.05);
        vec2 m = p * 1000.0, fc = vec2(0.0, -30.0); float r = length(m - fc), bas = 1.0 - smoothstep(14.6, 14.6 + fwm, r), pl = (1.0 - smoothstep(0.0, fwm + 1.0, max(abs(m.x) - 60.0, abs(m.y + 20.0) - 62.0)));
        float Lp = 2.2 * ringPts(m, fc, 22.0, 12.0, 0.7, fwm) + 0.32 * ringPts(m, fc, 22.0, 12.0, 6.0, fwm) + 1.5 * ringPts(m, fc, 14.2, 28.0, 0.45, fwm) + 0.6 * exp(-r / 2.5) + 0.15 * bas * smoothstep(5.0, 14.0, r) + 0.04 * pl;
        { vec2 gq = (fract(m / 16.0 + 0.5) - 0.5) * 16.0; float re = max(0.4, fwm * 0.8); Lp += 1.6 * pl * step(26.0, r) * (0.16 / (re * re)) * exp(-dot(gq, gq) / (re * re)) + 0.12 * pl * step(26.0, r) * exp(-dot(gq, gq) / 16.0); }
        Lp += 0.5 * step(fract(m.x / 3.6), 0.45) * (1.0 - smoothstep(0.0, fwm + 0.3, abs(m.y - 52.6) - 0.6)) * step(abs(m.x), 34.0) + 0.06 * (1.0 - smoothstep(0.0, fwm + 0.2, abs(m.y + 80.0) - 0.3)) * step(abs(m.x), 60.0);
        vec3 col = mix(vec3(0.003, 0.008, 0.016), vec3(0.011, 0.012, 0.009), land) + vec3(1.0, 0.76, 0.44) * (Lc + Lp) + vec3(0.1, 0.45, 0.5) * bas * 0.25;
        gl_FragColor = vec4(col, uA * (1.0 - smoothstep(1300.0, 2000.0, length(p)))); }` }));
  C.ground.position.y = RE + 0.001; C.ground.renderOrder = 2; C.atmo.renderOrder = 1; st.scene.add(C.earth, C.atmo, C.ground);
  // the cosmic web: nodes joined to their nearest neighbours, filaments as soft clouds of points
  { const R = RNG('web'), L = 4.5e5, nd = []; for (let i = 0; i < 260; i++) nd.push(new THREE.Vector3(R.n(L), R.n(L), R.n(L)));
    const ed = new Set(); nd.forEach((a, i) => nd.map((b, j) => [j, a.distanceToSquared(b)]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 4).forEach(([j]) => ed.add(i < j ? i + '_' + j : j + '_' + i)));
    const P = [], Sz = [], Bc = [], fil = scol('#a0b0dc'), node = scol('#f0e4d8'), hot = scol('#ffffff');
    const add = (v, s, b, c) => { if (v.length() < 9e4) return; P.push(v.x, v.y, v.z); Sz.push(s); Bc.push(c.r * b, c.g * b, c.b * b); };
    ed.forEach((k) => { const [i, j] = k.split('_').map(Number), a = nd[i], b = nd[j], len = a.distanceTo(b), mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(R.n(len * 0.15), R.n(len * 0.15), R.n(len * 0.15))), n = Math.round(len / L * 1700);
      for (let q = 0; q < n; q++) { const u = R.f(), v = a.clone().multiplyScalar((1 - u) * (1 - u)).addScaledVector(mid, 2 * u * (1 - u)).addScaledVector(b, u * u), sg = 3800 * (0.6 + 0.8 * R.f()) * (1.3 - 0.5 * Math.sin(u * Math.PI));
        v.add(new THREE.Vector3(gN(R) * sg, gN(R) * sg, gN(R) * sg)); if (R.f() < 0.025) add(v, 700, 2.0, hot); else add(v, 4600, 0.075, fil); } });
    nd.forEach((a, i) => { const big = i % 9 === 0; for (let q = 0; q < (big ? 260 : 120); q++) add(a.clone().add(new THREE.Vector3(gN(R), gN(R), gN(R)).multiplyScalar(big ? 12000 : 8000)), 3000, 0.18, node); add(a, big ? 9000 : 4000, big ? 2.5 : 1.2, hot); add(a, big ? 40000 : 18000, 0.25, node); });
    for (let q = 0; q < 6000; q++) add(new THREE.Vector3(R.n(L), R.n(L), R.n(L)), 1500, 0.35, fil);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('aS', new THREE.Float32BufferAttribute(Sz, 1)); g.setAttribute('aCol', new THREE.Float32BufferAttribute(Bc, 3));
    C.webU = { uK: { value: (H / 2) / Math.tan(30 * DEG) }, uA: { value: 0 } };
    C.web = new THREE.Points(g, new THREE.ShaderMaterial(Object.assign({ uniforms: C.webU,
      vertexShader: 'uniform float uK, uA; attribute float aS; attribute vec3 aCol; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float s = aS * uK / max(-mv.z, 1.0), sc = clamp(s, 1.2, 80.0); gl_PointSize = sc; vC = aCol * uA * (s < 1.2 ? s * s / 1.44 : 1.0) * clamp(28.0 / s, 0.2, 1.0); }',
      fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; gl_FragColor = vec4(vC * exp(-dot(q, q) * 16.0), 1.0); }' }, ADD)));
    C.web.frustumCulled = false; C.web.renderOrder = 0; st.scene.add(C.web); }
  return C; }); }
const cosK = (t) => { const f = (x) => (Math.tanh((x - 25.6) / 0.75) + 1) / 2, f0 = f(24), f1 = f(30); return (f(t) - f0) / (f1 - f0); };
const cosH = (t) => 0.13 * Math.exp(Math.log(30000 / 0.13) * cosK(t));
function poseCosmos(C, t) { const cam = C.st.cam, h = cosH(t); cam.position.set(0, C.RE + h, 0); cam.rotation.set(-Math.PI / 2 + 23 * DEG * ss(25.9, 26.9, t) + 2 * DEG * seg(t, 27, 30), 0.35 + 0.55 * cosK(t) + 0.03 * (t - 24), 0);
  cam.fov = 60; cam.near = Math.max(0.004, h * 0.2); cam.far = t > 26 ? 3e6 : h + 2 * C.RE; cam.updateProjectionMatrix();
  C.ground.material.uniforms.uA.value = 1 - ss(400, 1600, h); C.ground.visible = h < 1600; C.webU.uA.value = ss(26.2, 27.1, t); C.web.visible = t > 26.2; C.web.rotation.set(0.03 * (t - 26), 0.09 * (t - 26), 0); }
let ZBC = null;
function cosmosShot(t) { const C = cosmos(); poseCosmos(C, t); renderStage(C.st, 1.0); if (CAMONLY) return; const cam = C.st.cam;
  // a zoom blur while the camera shoots up (centred on home)
  const rate = (Math.log(cosH(t + 0.02)) - Math.log(cosH(t))) / 0.02, z = Math.min(0.14, rate * 0.012); if (z > 0.01) { const v = new THREE.Vector3(0, C.RE, 0).project(cam), cx = (v.x + 1) / 2 * W, cy = (1 - v.y) / 2 * H;
    if (!ZBC) { ZBC = document.createElement('canvas'); ZBC.width = W; ZBC.height = H; } const x = ZBC.getContext('2d'); x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0); ctx.save(); screen();
    for (let i = 1; i <= 5; i++) { const s = 1 + z * i / 5; ctx.globalAlpha = 0.22 * (1 - i / 7); ctx.drawImage(ZBC, cx - cx * s, cy - cy * s, W * s, H * s); } ctx.restore(); }
  bloom(0.55); SPC.cam = cam; SPC.at = TT; SPC.kind = 'cosmos'; SPC.RE = C.RE; }
SHOT_FN.you = (lt, dur, t) => cosmosShot(t);
SHOT_FN.web = (lt, dur, t) => cosmosShot(t);

// =====================================================================
//  LABELS IN THE SKY (2D, projected with the camera that drew this frame)
// =====================================================================
function spaceOverlay(t) { if (SPC.at !== TT || !SPC.cam) return; const cam = SPC.cam, pr = (p) => { const v = p.clone().project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2]; };
  const S = { font: PV.sans, weight: 700, align: 'center' }, items = [];
  const label = (x, y, a, l1, l2, tx, ty) => items.push(() => { if (tx !== undefined) { ctx.save(); screen(); ctx.globalAlpha = a * 0.8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + (l2 ? 34 : 14)); ctx.lineTo(tx, ty); ctx.stroke(); ctx.restore(); }
    pvText(l1, x, y, 27, Object.assign({ spacing: 4, alpha: a }, S)); if (l2) pvText(l2, x, y + 25, 16, Object.assign({ spacing: 2, alpha: a * 0.85 }, S)); });
  const ring = (x, y, r, a) => items.push(() => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); ctx.restore(); });
  if (SPC.kind === 'esp') {
    if (t > 15.7 && t < 19.8 && SPC.mw) { const a = ss(15.7, 16.2, t) * (1 - ss(19.3, 19.8, t)), [x, y, ok] = pr(SPC.mw); if (ok) { const lx = clamp(x + 30, 240, 840); let ly = clamp(y - Math.max(SPC.mwR * 0.45, 50) - 70, 330, 1180); if (ly > 700 && ly < 990 && lx < 680) ly = 700; label(lx, ly, a, 'LA VÍA LÁCTEA', '100.000 AÑOS LUZ DE DIÁMETRO', x, y - 12); } }
    if (t > 32.4 && t < 35.3 && SPC.q && SPC.qa > 0.2) { const a = ss(32.4, 32.8, t) * (1 - ss(34.9, 35.3, t)), [x, y, ok] = pr(SPC.q); if (ok) label(clamp(x - 230, 260, 820), Math.max(300, y - 290), a, 'UN CUÁSAR', 'MÁS BRILLANTE QUE UN BILLÓN DE SOLES', x - 30, y - 60); }
  } else if (SPC.kind === 'cosmos') { const [x, y, ok] = pr(new THREE.Vector3(0, SPC.RE, 0)); if (ok) {
    if (t > 24.05 && t < 25.1) { const a = ss(24.05, 24.3, t) * (1 - ss(24.85, 25.1, t)); ring(x, y, 16, a); label(x, y + 58, a, 'TÚ'); }
    if (t > 26.6 && t < 29.7) { const a = ss(26.6, 27.0, t) * (1 - ss(29.3, 29.7, t)); ring(x, y, 9, a); label(x, y - 64, a, 'LA TIERRA', 'CADA CIUDAD, AÚN ENCENDIDA'); } } }
  if (items.length) { const f = () => items.forEach((g) => g()); if (DEFER) DEFER.push(f); else f(); } }
