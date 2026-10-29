// =====================================================================
//  FALL — rise (9–11: a light opens above you… and stops), tunnel (11–16: head-first down the throat of hell),
//  fireball (16–18: the shaft opens on a sun of fire and you plunge into it; overlays flashes into the lake)
//  All the big surfaces are own shaders (fall… names); embers/smoke come from the fire API.
// =====================================================================
const fallGLSL = `
float fallH(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float fallN(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(fallH(i), fallH(i + vec3(1,0,0)), f.x), mix(fallH(i + vec3(0,1,0)), fallH(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(fallH(i + vec3(0,0,1)), fallH(i + vec3(1,0,1)), f.x), mix(fallH(i + vec3(0,1,1)), fallH(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fallF(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++){ a += m * fallN(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); m *= 0.5; } return a; }
float fallF3(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 3; i++){ a += m * fallN(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); m *= 0.5; } return a; }
float fallRidge(vec3 p){ return 1.0 - abs(fallN(p) * 2.0 - 1.0); }
vec2 fallVor(vec3 p){ vec3 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec3 g = vec3(float(x), float(y), float(z));
    vec3 o = vec3(fallH(i + g), fallH(i + g + 31.7), fallH(i + g + 67.3)); vec3 r = g + o - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
  return vec2(sqrt(d1), sqrt(d2)); }
vec3 fallFire(float k){ k = clamp(k, 0.0, 1.2);
  vec3 c = mix(vec3(0.02, 0.002, 0.0), vec3(0.75, 0.08, 0.008), smoothstep(0.0, 0.35, k));
  c = mix(c, vec3(1.0, 0.36, 0.03), smoothstep(0.3, 0.62, k)); c = mix(c, vec3(1.0, 0.72, 0.25), smoothstep(0.6, 0.85, k));
  return mix(c, vec3(1.0, 0.95, 0.82) * 1.6, smoothstep(0.85, 1.15, k)); }
`;
const fallOUT = '\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n';
const fallSM = (U, vs, fs, o = {}) => new THREE.ShaderMaterial(Object.assign({ uniforms: U, vertexShader: fallGLSL + vs, fragmentShader: fallGLSL + fs + '', fog: false }, o));
const fallADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
// integrate a speed function v(x) from 0 to lt (deterministic distance travelled)
function fallInteg(v, lt, n = 80) { let s = 0; const h = lt / n; for (let i = 0; i < n; i++) s += v((i + 0.5) * h) * h; return s; }

// ---- a soft volumetric light beam (cone from `org` along `dir`), additive. U.uK = strength
function fallBeam(scene, org, dir, len, r0, r1, col, seed) {
  const U = { uC: { value: lin(col) }, uK: { value: 1 }, uT: { value: 0 }, uSeed: { value: seed }, uPul: { value: 1 }, uFade: { value: 0 } };
  const g = new THREE.CylinderGeometry(r1, r0, len, 20, 1, true).translate(0, len / 2, 0);
  const m = new THREE.Mesh(g, fallSM(U,
    `varying vec3 vN, vV, vA; varying float vY; void main(){ vY = uv.y; vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vA = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0)); vV = cameraPosition - w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    `uniform vec3 uC; uniform float uK, uT, uSeed, uPul, uFade; varying vec3 vN, vV, vA; varying float vY;
    void main(){ vec3 V = normalize(vV); vec3 Vp = V - vA * dot(V, vA); float f = abs(dot(normalize(vN), normalize(Vp + 1e-5)));
      float a = pow(f, 2.2 + uFade * 1.5) * smoothstep(0.0, mix(0.08, 0.35, uFade), vY) * (1.0 - smoothstep(mix(0.55, 0.35, uFade), mix(1.0, 0.85, uFade), vY));
      float pul = mix(1.0, 0.55 + 0.45 * sin(vY * 70.0 - uT * 30.0 + uSeed) * (0.6 + 0.4 * fallN(vec3(vY * 9.0 - uT * 6.0, uSeed, 0.0))), uPul);
      gl_FragColor = vec4(uC * a * pul * uK, 1.0);${fallOUT}}`, Object.assign({ side: THREE.DoubleSide }, fallADD)));
  m.position.copy(org); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); m.frustumCulled = false; m.renderOrder = 5; scene.add(m);
  return { m, U };
}
// ---- ember streaks: thin quads stretched along y by the fall speed (radial streaks when you look down the shaft)
function fallStreaks(scene, n, o) {
  const R = RNG('fallstk' + o.seed), P = new Float32Array(n * 12), Q = new Float32Array(n * 8), A = new Float32Array(n * 16), I = [];
  for (let i = 0; i < n; i++) { const a = R.r(0, TAU), r = o.r0 + (o.r1 - o.r0) * Math.sqrt(R.f()), y = R.r(0, o.range + 15), rr = [R.f(), R.f(), R.f(), R.f()];
    for (let k = 0; k < 4; k++) { const j = i * 4 + k; P.set([Math.cos(a) * r, y, Math.sin(a) * r], j * 3); Q.set([k % 2 ? 1 : -1, k < 2 ? 0 : 1], j * 2); A.set(rr, j * 4); }
    I.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aQ', new THREE.BufferAttribute(Q, 2)); g.setAttribute('aR', new THREE.BufferAttribute(A, 4)); g.setIndex(I);
  const U = { uCamY: { value: 0 }, uV: { value: 0 }, uT: { value: 0 }, uRange: { value: o.range }, uW: { value: o.w || 0.07 }, uL: { value: o.len || 0.05 }, uRise: { value: o.rise || 8 }, uK: { value: 1 }, uC: { value: lin(o.col || '#ffb050') } };
  const m = new THREE.Mesh(g, fallSM(U,
    `attribute vec2 aQ; attribute vec4 aR; uniform float uCamY, uV, uT, uRange, uW, uL, uRise; varying float vA; varying vec2 vQ;
    void main(){ float y = position.y + uT * uRise * (0.5 + aR.x); float rel = mod(y - uCamY + uRange, uRange + 15.0) - uRange;
      vec3 c = vec3(position.x + sin(uT * 2.0 + aR.w * 30.0) * 0.4, uCamY + rel, position.z + cos(uT * 1.7 + aR.w * 20.0) * 0.4);
      float len = (uV + uRise) * uL * (0.4 + aR.y); vec3 p = c - vec3(0.0, len * aQ.y, 0.0);
      vec3 tc = normalize(cameraPosition - p); vec3 sd = cross(vec3(0.0, 1.0, 0.0), tc); float sl = length(sd); sd = sl > 1e-4 ? sd / sl : vec3(1.0, 0.0, 0.0);
      p += sd * aQ.x * uW * (0.4 + aR.y);
      vA = smoothstep(-uRange, -uRange * 0.7, rel) * smoothstep(15.0, 1.0, rel) * (0.25 + 0.75 * aR.z * aR.z) * (0.65 + 0.35 * sin(uT * 23.0 + aR.w * 40.0));
      vQ = aQ; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
    `uniform vec3 uC; uniform float uK; varying float vA; varying vec2 vQ;
    void main(){ float a = vA * (1.0 - abs(vQ.x)) * pow(1.0 - vQ.y, 1.5); vec3 c = mix(uC, vec3(1.0, 0.9, 0.7), (1.0 - vQ.y) * 0.6);
      gl_FragColor = vec4(c * a * uK * 3.0, 1.0);${fallOUT}}`, Object.assign({ side: THREE.DoubleSide }, fallADD)));
  m.frustumCulled = false; m.renderOrder = 6; scene.add(m); return { m, U };
}
// ---- a curtain of flame tongues on an (arc of a) cylinder: licks upward. U.uK strength
function fallFlameMat(seed, k = 1) {
  const U = { uT: { value: 0 }, uK: { value: k }, uSeed: { value: seed }, uArc: { value: 0 } };
  return { U, mat: fallSM(U,
    `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    `uniform float uT, uK, uSeed, uArc; varying vec2 vUv; varying vec3 vW;
    void main(){ vec3 d = normalize(vec3(vW.x, 0.0, vW.z)); float v = vUv.y;
      float n = fallF(vec3(d.x * 7.0 + uSeed, v * 2.2 - uT * 3.2, d.z * 7.0));
      float n2 = fallN(vec3(d.x * 22.0, v * 5.0 - uT * 6.0, d.z * 22.0 + uSeed));
      float shape = n * 1.5 + n2 * 0.35 - v * 1.3 - 0.3;
      float edge = uArc > 0.5 ? smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x) : 1.0;
      float a = smoothstep(0.0, 0.18, shape) * smoothstep(0.0, 0.12, v) * edge;
      vec3 c = fallFire(0.4 + shape * 1.1) * (0.8 + 1.4 * smoothstep(0.3, 0.6, shape));
      gl_FragColor = vec4(c * a * uK, 1.0);${fallOUT}}`, Object.assign({ side: THREE.DoubleSide }, fallADD)) };
}
// ---- rough rock with glowing cracks, lit from a portal below and by fire bands (the shaft walls)
function fallRockMat(o) {
  const U = { uT: { value: 0 }, uPY: { value: o.py }, uPK: { value: 1 }, uRing0: { value: o.ring0 }, uRingSp: { value: o.ringSp }, uRingK: { value: 1 }, uCrack: { value: 1 }, uR: { value: o.r }, uFog: { value: lin('#1a0502') } };
  return { U, mat: fallSM(U,
    `uniform float uR; varying vec3 vW;
    void main(){ vec3 p = position; vec3 d = normalize(vec3(p.x, 0.0, p.z));
      float n = fallF3(vec3(d.x * 2.6, p.y * 0.045, d.z * 2.6)); float n2 = fallN(vec3(d.x * 8.0, p.y * 0.2, d.z * 8.0)); float n3 = fallN(vec3(d.x * 22.0, p.y * 0.6, d.z * 22.0));
      float ledge = smoothstep(0.55, 0.9, fallN(vec3(d.x * 1.5, p.y * 0.11, d.z * 1.5)));
      float r = length(p.xz) * (1.0 - 0.42 * (n - 0.35) - 0.12 * n2 - 0.035 * n3 - 0.12 * ledge);
      vec4 w = modelMatrix * vec4(d * r + vec3(0.0, p.y, 0.0), 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    `uniform float uT, uPY, uPK, uRing0, uRingSp, uRingK, uCrack; uniform vec3 uFog; varying vec3 vW;
    void main(){ vec3 N = normalize(cross(dFdx(vW), dFdy(vW))); vec3 inw = normalize(vec3(-vW.x, 0.0, -vW.z) + 1e-4); if (dot(N, inw) < 0.0) N = -N;
      float b1 = fallF(vW * 0.45), b2 = fallN(vW * 2.4), b3 = fallN(vW * 7.0);
      N = normalize(N + (vec3(b2, b3, fallN(vW * 2.4 + 5.0)) - 0.5) * 0.9);
      vec3 alb = mix(vec3(0.035, 0.022, 0.018), vec3(0.16, 0.09, 0.06), smoothstep(0.3, 0.75, b1)) * (0.7 + 0.45 * b2) * (0.85 + 0.3 * b3);
      alb *= 0.8 + 0.25 * sin(vW.y * 0.8 + b1 * 6.0);
      vec3 toP = vec3(0.0, uPY, 0.0) - vW; float dP = length(toP); toP /= dP;
      float lp = (0.2 + 0.8 * max(dot(N, toP), 0.0)) * 1.1e4 / (dP * dP + 1200.0) * uPK;
      float ry = vW.y - uRing0; float k = floor(ry / uRingSp + 0.5); float dy = ry - k * uRingSp - 3.0;
      float fl = 0.75 + 0.25 * sin(uT * 9.0 + k * 1.7) * sin(uT * 13.0 + k);
      float lr = exp(-abs(dy) * 0.09) * (0.4 + 0.6 * max(dot(N, vec3(0.0, -sign(dy), 0.0) * 0.6 + inw * 0.4), 0.0)) * 2.6 * fl * uRingK * step(ry, 8.0);
      vec3 col = alb * (lp * vec3(1.0, 0.42, 0.12) + lr * vec3(1.0, 0.5, 0.15) + vec3(0.06, 0.02, 0.014));
      vec2 v = fallVor(vW * vec3(0.15, 0.085, 0.15)); float e = v.y - v.x; float cw = 0.04 + 0.07 * fallN(vW * 0.21);
      float crack = 1.0 - smoothstep(0.0, cw, e), core = 1.0 - smoothstep(0.0, cw * 0.3, e);
      float hot = smoothstep(0.54, 0.8, fallF3(vW * 0.028 + vec3(0.0, uT * 0.06, 0.0)));
      float puls = 0.7 + 0.3 * sin(uT * 3.0 + vW.y * 0.13 + b1 * 9.0);
      vec3 em = fallFire(0.5 + 0.45 * crack * puls) * crack * (0.04 + 1.6 * hot) + vec3(1.0, 0.8, 0.45) * core * hot * 2.2 * puls;
      em += vec3(0.6, 0.07, 0.01) * (1.0 - smoothstep(0.0, cw * 2.5, e)) * hot * 0.35;
      col += em * uCrack;
      float d = length(vW - cameraPosition); float near = exp(-max(vW.y - uPY, 0.0) * 0.012);
      vec3 fogC = mix(uFog, vec3(1.0, 0.28, 0.04) * 0.22, near * uPK * 0.6);
      col = mix(col, fogC, (1.0 - exp(-d * 0.006)) * 0.8);
      gl_FragColor = vec4(col, 1.0);${fallOUT}}`, { side: THREE.DoubleSide }) };
}
// ---- the sun of fire: domain-warped plasma, granulation cells, filaments, dark crust, limb glow; more detail up close
function fallSunMat(rs) {
  const U = { uT: { value: 0 }, uK: { value: 1 }, uNear: { value: 0 }, uRs: { value: rs }, uHeat: { value: 1 } };
  return { U, mat: fallSM(U,
    `uniform float uT, uRs; varying vec3 vW, vP; void main(){ vec3 p = normalize(position); vP = p;
      float d = fallF3(p * 7.0 + vec3(0.0, uT * 0.4, 0.0)); vec4 w = modelMatrix * vec4(p * uRs * (1.0 + 0.012 * d), 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    `uniform float uT, uK, uNear, uHeat; varying vec3 vW, vP;
    void main(){ vec3 p = normalize(vP); float t = uT;
      vec3 w = vec3(fallF3(p * 3.0 + vec3(t * 0.15, 0.0, 0.0)), fallF3(p * 3.0 + vec3(5.2, t * 0.12, 1.3)), fallF3(p * 3.0 + vec3(2.1, 7.7, t * 0.13)));
      vec3 q = p * 4.0 + (w - 0.5) * 2.6;
      float big = fallF(q + vec3(0.0, t * 0.25, 0.0));
      vec2 g = fallVor(p * 26.0 + (w - 0.5) * 3.0 + vec3(t * 0.2)); float gran = smoothstep(0.0, 0.32, g.y - g.x);
      float fil = pow(fallRidge(q * 2.2 + vec3(t * 0.35)), 7.0) + 0.6 * pow(fallRidge(q * 5.0 - vec3(t * 0.5)), 9.0);
      float spots = smoothstep(0.6, 0.74, fallF3(p * 2.4 + w + vec3(9.0, t * 0.06, 0.0)));
      float heat = 0.12 + 0.6 * big + 0.3 * (1.0 - 0.6 * uNear) * (gran - 0.5) + 0.38 * fil - 0.5 * spots * (1.0 - fil);
      if (uNear > 0.0) { vec3 q2 = p * 60.0 + w * 5.0; float tb = fallF(q2 + vec3(0.0, t * 0.6, t * 0.3) + fallF3(q2 * 0.7 - t * 0.2) * 2.0);
        float lane = pow(fallRidge(p * 150.0 + w * 9.0 + vec3(t * 0.5)), 4.0), fl2 = pow(fallRidge(q2 * 0.8 + vec3(t * 0.7, 0.0, 0.0)), 10.0);
        vec2 g2 = fallVor(p * 260.0 + w * 12.0 + vec3(t * 0.8)); float gr2 = smoothstep(0.0, 0.25, g2.y - g2.x);
        float hn = -0.2 + 0.95 * tb + 0.45 * fl2 - 0.4 * lane * (1.0 - fl2) + 0.15 * (gr2 - 0.5);
        heat = mix(heat, hn, uNear * 0.8); }
      vec3 V = normalize(cameraPosition - vW); float mu = clamp(dot(p, V), 0.0, 1.0);
      heat *= mix(0.55, 1.0, pow(mu, 0.35)) * uHeat;
      vec3 col = fallFire(heat) * (0.75 + 1.8 * smoothstep(0.7, 1.0, heat));
      col += vec3(1.0, 0.22, 0.02) * pow(1.0 - mu, 2.5) * 1.0;
      gl_FragColor = vec4(col * uK, 1.0);${fallOUT}}`) };
}
// zoom (speed) blur toward a screen point, 2D, on what's drawn so far
let FALL_ZC = null;
function fallZoom(k, cx, cy) { if (k <= 0.003) return; if (!FALL_ZC) { FALL_ZC = document.createElement('canvas'); FALL_ZC.width = W / 2; FALL_ZC.height = H / 2; }
  const z = FALL_ZC.getContext('2d'); z.clearRect(0, 0, W / 2, H / 2); z.drawImage(ctx.canvas, 0, 0, W / 2, H / 2); ctx.save(); screen();
  for (let i = 1; i <= 5; i++) { const s = 1 + k * i / 5; ctx.globalAlpha = 0.3 * (1 - i / 6.5); ctx.drawImage(FALL_ZC, cx - cx * s, cy - cy * s, W * s, H * s); } ctx.restore(); }
const fallScr = (st, x, y, z) => { const v = new THREE.Vector3(x, y, z).project(st.cam); return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H, v.z]; };
const fallNoStage = () => { const st = makeStage({ hemi: 0, key: 0, fov: 70, far: 9000 }); st.key.castShadow = false; st.key.visible = false; st.hemi.visible = false; st.scene.background = new THREE.Color(0); return st; };

// =====================================================================
//  RISE (9.0–11.0) — darkness; you drift up a vortex of cloud toward a soft white light that opens… then flickers,
//  stops coming closer, and pulls away; the cold blue-black turns ember red from the edges in
// =====================================================================
const FALL_LY = 230;
function fallRiseBuild() {
  const st = fallNoStage(), S = st.scene, R = RNG('fallrise');
  // the light: a soft disc with rays and a silver rim of parted cloud
  const LU = { uT: { value: 0 }, uOpen: { value: 0 }, uK: { value: 1 } };
  const light = new THREE.Mesh(new THREE.PlaneGeometry(520, 520).rotateX(Math.PI / 2), fallSM(LU,
    `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    `uniform float uT, uOpen, uK; varying vec2 vUv;
    void main(){ vec2 p = (vUv - 0.5) * 2.0; float r = length(p), a = atan(p.y, p.x); float R0 = 0.025 + 0.04 * uOpen;
      float core = exp(-pow(r / R0, 2.0) * 1.6) * 2.4, halo = exp(-r / (R0 * 1.4)) * 0.45 + exp(-r * 5.0) * 0.12;
      float rays = pow(fallN(vec3(cos(a) * 5.0, sin(a) * 5.0, uT * 0.25)), 4.0) * exp(-r / (R0 * 3.0)) * 1.4 + pow(fallN(vec3(cos(a) * 14.0, sin(a) * 14.0, uT * 0.4 + 3.0)), 6.0) * exp(-r / (R0 * 1.6)) * 0.6;
      float rim = exp(-pow((r - R0 * 1.25) / (R0 * 0.25), 2.0)) * fallF3(vec3(cos(a) * 7.0, sin(a) * 7.0, uT * 0.5 + r * 9.0)) * 1.6;
      vec3 col = vec3(0.86, 0.93, 1.0) * (core + halo + rays) + vec3(0.75, 0.82, 1.0) * rim;
      gl_FragColor = vec4(col * uK * smoothstep(1.0, 0.6, r), 1.0);${fallOUT}}`, fallADD));
  light.position.y = FALL_LY; light.renderOrder = 0; S.add(light);
  // three nested swirling cloud walls (parallax), lit from above, ember from below
  const layers = [[95, 0.05, 0.75, 1], [55, 0.09, 0.7, 2], [28, 0.14, 0.62, 3]].map(([r, spin, al, ro], i) => {
    const U = { uT: { value: 0 }, uRed: { value: 0 }, uLight: { value: 1 }, uSpin: { value: spin }, uCamY: { value: 0 }, uSeed: { value: i * 7.3 }, uA: { value: al }, uOpen: { value: 0 }, uLY: { value: FALL_LY } };
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 640, 128, 80, true).translate(0, 20, 0), fallSM(U,
      `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      `uniform float uT, uRed, uLight, uSpin, uCamY, uSeed, uA, uOpen, uLY; varying vec3 vW;
      void main(){ vec3 d = normalize(vec3(vW.x, 0.0, vW.z)); float ang = atan(d.z, d.x); float sw = ang + vW.y * 0.01 + uT * uSpin;
        vec3 q = vec3(cos(sw) * 2.2, vW.y * 0.022 - uT * 0.06, sin(sw) * 2.2) + uSeed;
        float dens = fallF(q * 1.25 + fallF3(q * 2.2 + uT * 0.05) * 1.4); dens = smoothstep(0.32, 0.82, dens);
        float wisp = pow(fallRidge(q * 3.0 + vec3(0.0, uT * 0.1, 0.0)), 5.0);
        float toL = clamp(1.0 - (uLY - vW.y) / 330.0, 0.0, 1.0);
        vec3 cold = vec3(0.012, 0.022, 0.05) + vec3(0.16, 0.21, 0.32) * pow(toL, 3.0) * uLight * (0.5 + 0.8 * wisp);
        float redH = uCamY - 45.0 + 170.0 * uRed; float nb = (fallF3(q * 3.0) - 0.5) * 60.0;
        float redM = smoothstep(redH + 25.0, redH - 35.0, vW.y + nb) * smoothstep(0.0, 0.15, uRed);
        vec3 ember = vec3(0.8, 0.07, 0.008) * (0.15 + 1.3 * pow(fallF3(q * 4.0 + vec3(0.0, uT * 0.4, 0.0)), 2.0) * (0.6 + 1.4 * wisp)) * (0.3 + 0.7 * uRed);
        vec3 col = mix(cold, ember, redM) * (0.25 + 1.5 * dens);
        float hole = smoothstep(0.55 + 0.25 * uOpen, 0.98, toL);
        gl_FragColor = vec4(col, clamp(dens * uA + wisp * 0.2, 0.0, 1.0) * (1.0 - hole));${fallOUT}}`, { transparent: true, depthWrite: false, side: THREE.BackSide }));
    m.renderOrder = ro; S.add(m); return U; });
  // god rays from the light down past you
  const beams = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + R.r(-0.15, 0.15), s = R.r(0.05, 0.16);
    beams.push(fallBeam(S, new THREE.Vector3(0, FALL_LY, 0), new THREE.Vector3(Math.cos(a) * s, -1, Math.sin(a) * s), 320, R.r(1.5, 4), R.r(5, 14), '#b8ccff', i * 1.7)); }
  // drifting motes
  const n = 1600, P = new Float32Array(n * 3), A = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { const a = R.r(0, TAU), r = 1.5 + 24 * Math.sqrt(R.f()); P.set([Math.cos(a) * r, R.r(0, 120), Math.sin(a) * r], i * 3); A.set([R.f(), R.f(), R.f(), R.f()], i * 4); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aR', new THREE.BufferAttribute(A, 4));
  const DU = { uCamY: { value: 0 }, uT: { value: 0 }, uRed: { value: 0 }, uK: { value: 1 } };
  const dust = new THREE.Points(g, fallSM(DU,
    `attribute vec4 aR; uniform float uCamY, uT; varying float vA, vR;
    void main(){ float y = position.y - uT * (1.0 + aR.x * 2.0); float rel = mod(y - uCamY + 30.0, 120.0) - 30.0;
      vec3 p = vec3(position.x + sin(uT * 0.5 + aR.w * 6.0) * 0.8, uCamY + rel, position.z + cos(uT * 0.4 + aR.w * 5.0) * 0.8);
      vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (0.4 + aR.y * aR.y * 1.6) * 260.0 / max(1.0, -mv.z);
      vA = (0.2 + 0.8 * aR.z) * smoothstep(0.5, 5.0, -mv.z) * smoothstep(-30.0, -20.0, rel) * smoothstep(90.0, 60.0, rel); vR = aR.w; }`,
    `uniform float uRed, uK; varying float vA, vR; void main(){ vec2 d = gl_PointCoord - 0.5; float a = exp(-dot(d, d) * 20.0) * vA;
      vec3 c = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.4, 0.1), clamp(uRed * 1.4 - vR * 0.4, 0.0, 1.0));
      gl_FragColor = vec4(c * a * uK * 1.4, 1.0);${fallOUT}}`, fallADD));
  dust.frustumCulled = false; dust.renderOrder = 7; S.add(dust);
  const E = makeEmbers(S, 260, { color: 0xff7a30, size: 3 });
  return { st, LU, layers, beams, DU, E, light };
}
SHOT_FN.rise = (lt, dur, t) => {
  const B = once('fallRise', fallRiseBuild), st = B.st;
  // up (slowing), a stall, then the first drop
  const v = (x) => 15 * (1 - ss(1.25, 1.7, x)) + 2.5 - 38 * ss(1.72, 2.0, x) ** 1.5;
  const cy = fallInteg(v, lt);
  const red = ss(0.9, 2.0, lt), open = ss(0.05, 1.2, lt);
  const flick = lt < 1.55 ? 1 : (lt < 1.82 ? 0.55 + 0.45 * Math.sign(Math.sin(lt * 90)) * (0.5 + 0.5 * Math.sin(lt * 37)) : 0.5 * (1 - ss(1.82, 2.0, lt)) + 0.05);
  B.light.position.y = FALL_LY + 260 * ss(1.65, 2.0, lt) ** 2;
  B.LU.uT.value = t; B.LU.uOpen.value = open * (1 - 0.35 * ss(1.6, 2.0, lt)); B.LU.uK.value = (0.06 + 0.3 * ss(0.0, 1.0, lt)) * flick;
  B.layers.forEach((U) => { U.uT.value = t; U.uRed.value = red; U.uCamY.value = cy; U.uOpen.value = open; U.uLight.value = (0.3 + 0.7 * ss(0, 1, lt)) * (0.5 + 0.5 * flick); });
  B.beams.forEach(({ U, m }, i) => { U.uT.value = t * 0.3; U.uPul.value = 0.4; U.uK.value = 0.025 * flick * ss(0.2, 1.1, lt) * (0.55 + 0.45 * Math.sin(t * 1.3 + i * 2.1)); m.position.y = B.light.position.y; });
  B.DU.uCamY.value = cy; B.DU.uT.value = t; B.DU.uRed.value = red;
  B.E.update(t, new THREE.Vector3(0, cy - 40, 0), 22, 60 * red + 0.01);
  // look up; a slow drift and turn; a jolt when the light stops
  const tilt = 0.3 + 0.03 * Math.sin(lt * 1.3), yaw = 0.15 * lt + 0.05 * lt * lt;
  st.cam.position.set(1.2 * Math.sin(lt * 0.8), cy, 0.8 * Math.cos(lt * 0.6)); st.cam.rotation.set(Math.PI / 2 - tilt, yaw, 0); fov(st, 72 - 4 * ss(0, 1.6, lt) + 8 * ss(1.7, 2.0, lt));
  const j = ss(1.55, 1.6, lt) * (1 - ss(1.6, 1.85, lt)); st.cam.rotation.x += j * 0.02 * Math.sin(lt * 70); st.cam.rotation.z += j * 0.015 * Math.sin(lt * 53);
  handheld(st.cam, t, 0.8, 3);
  renderStage(st, 1.05); if (CAMONLY) return;
  const [lx, ly] = fallScr(st, 0, B.light.position.y, 0); fallZoom(0.05 * ss(1.75, 2.0, lt), lx, ly);
  bloom(0.65);
};

// =====================================================================
//  TUNNEL (11.0–16.0) — head first down a vertical throat of rock: glowing cracks, bands of fire, flames licking off
//  the walls, beams of orange light from the portal far below, embers streaking up past you; faster and faster
// =====================================================================
const FALL_TR = 14, FALL_PY = -400, FALL_R0 = -36, FALL_RS = 46;
const fallTV = (x) => 14 + 150 * (x / 5) ** 1.6;          // fall speed (units/s) over the 5 s
function fallTunnelBuild() {
  const st = fallNoStage(), S = st.scene, R = RNG('falltun');
  const rock = fallRockMat({ py: FALL_PY, ring0: FALL_R0, ringSp: FALL_RS, r: FALL_TR });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(FALL_TR, FALL_TR, 470, 160, 420, true).translate(0, 60 - 235, 0), rock.mat); wall.frustumCulled = false; S.add(wall);
  // bands of fire (a curtain at each ring) and flames licking from the walls
  const fl = [];
  for (let y = FALL_R0; y > FALL_PY + 10; y -= FALL_RS) { const F = fallFlameMat(y * 0.37, 0.55); const h = 10 + (hsh(y) * 6);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(FALL_TR * 0.84, FALL_TR * 0.9, h, 128, 1, true).translate(0, h / 2, 0), F.mat); m.position.y = y; m.renderOrder = 4; S.add(m); fl.push(F); }
  for (let i = 0; i < 26; i++) { const F = fallFlameMat(i * 3.1 + 50, 0.5); F.U.uArc.value = 1; const h = R.r(4, 13), th = R.r(0.4, 1.3), r = FALL_TR * R.r(0.74, 0.84);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 32, 1, true, R.r(0, TAU), th).translate(0, h / 2, 0), F.mat); m.position.y = R.r(FALL_PY + 20, -10); m.renderOrder = 4; S.add(m); fl.push(F); }
  // the portal: a burning rim, a curtain of fire, and the sun of fire seen through it
  const port = fallFlameMat(91, 0.55), pm = new THREE.Mesh(new THREE.CylinderGeometry(FALL_TR * 0.8, FALL_TR * 0.95, 26, 128, 1, true).translate(0, 13, 0), port.mat); pm.position.y = FALL_PY - 4; pm.renderOrder = 4; S.add(pm); fl.push(port);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(FALL_TR * 0.86, 1.8, 16, 128).rotateX(Math.PI / 2), lavaMat({ scale: 2, glow: 2, crust: 0.5 })); rim.position.y = FALL_PY; S.add(rim);
  const sun = fallSunMat(700), sm = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), sun.mat); sm.position.y = FALL_PY - 1100; sm.rotation.set(1.1, 0, 0.4); S.add(sm);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff8a30', transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); halo.position.y = FALL_PY - 10; halo.scale.setScalar(60); halo.renderOrder = 3; S.add(halo);
  // beams of light from the portal, fanning up past you
  const beams = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + R.r(-0.2, 0.2), s = R.r(0.012, 0.03);
    beams.push(Object.assign(fallBeam(S, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 265, R.r(0.2, 0.5), R.r(0.9, 2.0), '#ff7a24', i * 2.3), { a, s: R.r(0.022, 0.04), ph: R.r(0, TAU), sp: R.r(0.6, 1.6) })); }
  const stk = fallStreaks(S, 1300, { seed: 1, r0: 2.0, r1: FALL_TR * 0.78, range: 170, w: 0.06, len: 0.022, rise: 10, col: '#ff9a40' });
  const stk2 = fallStreaks(S, 300, { seed: 2, r0: 1.0, r1: FALL_TR * 0.5, range: 60, w: 0.03, len: 0.018, rise: 6, col: '#ffd890' });
  const E = makeEmbers(S, 500, { color: 0xffa040, size: 4 });
  const sk = makeSmoke(S, 24, { color: 0x140806 });
  return { st, rock, fl, sun, beams, stk, stk2, E, sk, halo, sm };
}
SHOT_FN.tunnel = (lt, dur, t) => {
  const B = once('fallTunnel', fallTunnelBuild), st = B.st, v = fallTV(lt), cy = -fallInteg(fallTV, lt), sp = v / 164;
  const deep = ss(0, 5, lt);
  B.rock.U.uT.value = t; B.rock.U.uCrack.value = 0.6 + 0.5 * deep; B.rock.U.uPK.value = 0.5 + 0.5 * deep; B.rock.U.uRingK.value = 0.8 + 0.6 * deep;
  B.fl.forEach((F) => { F.U.uT.value = t; });
  B.sun.U.uT.value = t; B.sun.U.uK.value = 1.6; B.sm.scale.setScalar(700);
  B.halo.material.opacity = 0.55 + 0.35 * deep; B.halo.scale.setScalar(70 + 40 * deep);
  B.beams.forEach((b, i) => { const on = clamp(1.6 * Math.sin(t * b.sp * 2.2 + b.ph) - 0.4) * (0.35 + 0.65 * fallTVk(lt)); b.U.uT.value = t; b.U.uK.value = (0.3 + 0.15 * deep) * on; b.U.uFade.value = 0.45; b.U.uPul.value = 0.6;
    b.m.position.set(0, Math.max(cy - 270, FALL_PY + 40), 0); b.m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(b.a + t * 0.25) * b.s, 1, Math.sin(b.a + t * 0.25) * b.s).normalize()); });
  [B.stk, B.stk2].forEach((s, i) => { s.U.uCamY.value = cy; s.U.uV.value = v; s.U.uT.value = t; s.U.uK.value = (i ? 0.7 : 0.8) * (0.5 + 0.4 * deep); });
  B.E.update(t, new THREE.Vector3(0, cy - 120, 0), FALL_TR * 0.75, 125);
  B.sk.update(t, new THREE.Vector3(0, cy - 60, 0), FALL_TR * 0.8, 70, 0.5 * (1 - deep));
  // head first, rolling faster; drift off-axis; shake grows with speed
  const yaw = 0.25 * lt + 0.07 * lt * lt, drift = 1 - 0.5 * deep;
  st.cam.position.set(2.2 * drift * Math.sin(lt * 0.9), cy, 1.8 * drift * Math.cos(lt * 0.7 + 1));
  st.cam.rotation.set(-Math.PI / 2 - 0.09 + 0.05 * Math.sin(lt * 1.1), yaw, 0);
  st.cam.rotation.x += sp * 0.006 * (Math.sin(t * 31) + 0.6 * Math.sin(t * 47 + 1)); st.cam.rotation.z += sp * 0.004 * Math.sin(t * 39 + 2);
  fov(st, 74 + 10 * ss(0, 5, lt) ** 2);
  renderStage(st, 0.84 - 0.14 * ss(3.4, 5, lt)); if (CAMONLY) return;
  const [vx, vy] = fallScr(st, 0, cy - 300, 0); fallZoom(0.015 + 0.04 * sp, vx, vy);
  bloom(0.45 + 0.15 * deep);
};
const fallTVk = (lt) => ss(0, 4, lt);

// =====================================================================
//  FIREBALL (16.0–18.0) — out of the shaft through its burning rim: below, a sun of churning fire fills the frame;
//  you plunge into it (overlays flashes white-gold into the lake)
// =====================================================================
const FALL_SR = 300, FALL_SH0 = 1020;
const fallFH = (lt) => { const u = clamp(lt / 2); return 3 + FALL_SH0 * (1 - u) ** 1.9; };
function fallBallBuild() {
  const st = fallNoStage(), S = st.scene, R = RNG('fallball');
  const sun = fallSunMat(FALL_SR), sm = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 128), sun.mat); sm.rotation.set(1.1, 0, 0.4); S.add(sm);
  // prominences: a shell of flame around the limb
  const PU = { uT: { value: 0 }, uK: { value: 1 } };
  const shell = new THREE.Mesh(new THREE.SphereGeometry(FALL_SR * 1.09, 128, 96), fallSM(PU,
    `varying vec3 vW, vP, vN; void main(){ vP = normalize(position); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    `uniform float uT, uK; varying vec3 vW, vP, vN;
    void main(){ vec3 V = normalize(cameraPosition - vW); float rim = 1.0 - abs(dot(normalize(vN), V));
      float f = fallF(vP * 6.0 + vec3(0.0, -uT * 0.5, uT * 0.2)), f2 = fallRidge(vP * 14.0 + vec3(uT * 0.3));
      float a = pow(rim, 3.0) * smoothstep(0.42, 0.8, f + 0.25 * f2);
      gl_FragColor = vec4(fallFire(0.5 + f * 0.6) * a * uK * 2.5, 1.0);${fallOUT}}`, Object.assign({ side: THREE.DoubleSide }, fallADD)));
  shell.renderOrder = 3; S.add(shell);
  const cor = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff5a10', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3 })); cor.scale.setScalar(FALL_SR * 2.8); cor.renderOrder = 2; S.add(cor);
  // the vast cavern around: smoky dark red, glowing toward the sun
  const CU = { uT: { value: 0 } };
  const cav = new THREE.Mesh(new THREE.SphereGeometry(5000, 64, 32), fallSM(CU,
    `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    `uniform float uT; varying vec3 vW;
    void main(){ vec3 d = normalize(vW - cameraPosition), s = normalize(-cameraPosition); float c = max(dot(d, s), 0.0);
      vec3 p = normalize(vW); float sm = fallF(p * 5.0 + vec3(0.0, uT * 0.05, 0.0)), sm2 = fallF3(p * 16.0 - vec3(uT * 0.04));
      vec3 col = vec3(0.05, 0.008, 0.002) * (0.3 + 1.6 * sm * sm2) + vec3(1.0, 0.25, 0.04) * pow(c, 10.0) * 0.5 * (0.6 + 0.6 * sm);
      col += vec3(1.0, 0.5, 0.1) * pow(fallRidge(p * 9.0 + vec3(uT * 0.1)), 12.0) * 0.5 * (1.0 - c);
      gl_FragColor = vec4(col, 1.0);${fallOUT}}`, { side: THREE.BackSide, depthWrite: false }));
  cav.renderOrder = -5; S.add(cav);
  // crepuscular beams out of the sun
  const beams = []; for (let i = 0; i < 18; i++) { const a = R.r(0, TAU), up = R.r(0.25, 1.1);
    beams.push(Object.assign(fallBeam(S, new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a), up, Math.sin(a)), 2600, R.r(25, 60), R.r(150, 320), '#ff7a20', i * 1.9), { ph: R.r(0, TAU), sp: R.r(0.7, 1.5) })); }
  // the shaft's burning rim you fall through, and a ring of rock
  const rimF = fallFlameMat(17, 2.4), rf = new THREE.Mesh(new THREE.CylinderGeometry(FALL_TR * 0.95, FALL_TR * 1.35, 18, 128, 1, true).translate(0, 9, 0), rimF.mat); rf.position.y = FALL_SR + FALL_SH0 - 28; rf.renderOrder = 4; S.add(rf);
  const rk = fallRockMat({ py: 0, ring0: 1e5, ringSp: 1e6, r: FALL_TR }); rk.U.uRingK.value = 0; rk.U.uPK.value = 0;
  const mouth = new THREE.Mesh(new THREE.CylinderGeometry(FALL_TR * 1.4, FALL_TR * 2.6, 60, 128, 60, true).translate(0, 30, 0), rk.mat); mouth.position.y = FALL_SR + FALL_SH0 - 12; S.add(mouth);
  const stk = fallStreaks(S, 2400, { seed: 3, r0: 2, r1: 70, range: 220, w: 0.14, len: 0.03, rise: 20, col: '#ffa850' });
  const E = makeEmbers(S, 600, { color: 0xffb050, size: 5 });
  const sk = makeSmoke(S, 40, { color: 0x1a0c08 });
  return { st, sun, sm, PU, cor, CU, beams, rimF, rk, stk, E, sk };
}
SHOT_FN.fireball = (lt, dur, t) => {
  const B = once('fallBall', fallBallBuild), st = B.st, h = fallFH(lt), cy = FALL_SR + h, near = ss(1.0, 1.95, lt);
  const v = (fallFH(Math.max(0, lt - 0.02)) - fallFH(lt + 0.02)) / 0.04;
  B.sm.scale.setScalar(1); B.sun.U.uT.value = t; B.sun.U.uNear.value = near; B.sun.U.uK.value = 1.0 - 0.3 * near; B.sun.U.uHeat.value = 0.84; B.cor.material.opacity = 0.3 * (1 - near);
  B.PU.uT.value = t; B.PU.uK.value = 1 - near * 0.7; B.CU.uT.value = t; B.rimF.U.uT.value = t; B.rk.U.uT.value = t;
  B.beams.forEach((b) => { b.U.uT.value = t; b.U.uPul.value = 0.5; b.U.uK.value = 0.045 * clamp(0.4 + 0.8 * Math.sin(t * b.sp * 2 + b.ph)) * (1 - 0.6 * near); });
  B.stk.U.uCamY.value = cy; B.stk.U.uV.value = Math.min(v, 900); B.stk.U.uT.value = t; B.stk.U.uL.value = 0.03 * (1 - 0.6 * near);
  B.E.update(t, new THREE.Vector3(0, cy - 60, 0), 60, 70);
  B.sk.update(t, new THREE.Vector3(0, -FALL_SR * 2, 0), 1, 1, 0);
  // straight down at first, the roll continuing from the shaft; then pitching a little as you dive in, shaking hard
  const yaw = 0.25 * (lt + 5) + 0.07 * (lt + 5) ** 2, sp = Math.min(1.6, v / 500);
  st.cam.position.set(0, cy, 0); st.cam.rotation.set(-Math.PI / 2 - 0.07 + 0.05 * ss(0.6, 2, lt), yaw, 0);
  st.cam.rotation.x += sp * 0.006 * (Math.sin(t * 29) + 0.6 * Math.sin(t * 43 + 1)); st.cam.rotation.z += sp * 0.005 * Math.sin(t * 37 + 2);
  fov(st, 84 - 14 * ss(0, 1.0, lt) + 10 * ss(1.4, 2.0, lt));
  renderStage(st, 0.9); if (CAMONLY) return;
  const [vx, vy] = fallScr(st, 0, 0, 0); fallZoom(0.025 + 0.025 * ss(0.8, 1.9, lt) + 0.05 * (1 - ss(0, 0.4, lt)), vx, vy);
  bloom(0.6 - 0.15 * near);
};
