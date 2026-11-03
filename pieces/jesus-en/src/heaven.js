
// =====================================================================
//  HEAVEN — one sky dome shared by every stage: a lavender-blue dusk with soft clouds and the low sun; the opening
//  (a white-gold light high in the sky, long straight rays, rings of small lens-shaped clouds turning around it);
//  the sun that turns into a black disk with a burning ring; night; a field of stars; stars that fall.
// =====================================================================
const SUN_DIR = dirV(-100 * DEG, 9 * DEG), L_DIR = dirV(-15 * DEG, 40 * DEG);
const HV = { uSun: { value: SUN_DIR.clone() }, uL: { value: L_DIR.clone() }, uOpen: { value: 0 }, uEcl: { value: 0 }, uNight: { value: 0 }, uFlash: { value: 0 }, uFall: { value: 0 }, uT: { value: 0 }, uRays: { value: 1 }, uBig: { value: 0 } };
function heavenDome(st) { const m = new THREE.Mesh(new THREE.SphereGeometry(30000, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: HV,
  vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
  fragmentShader: `uniform vec3 uSun, uL; uniform float uOpen, uEcl, uNight, uFlash, uFall, uT, uRays, uBig; varying vec3 vD;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 6; i++) { a += m * vn(p); p = p * 2.02 + 1.7; m *= 0.5; } return a; }
void main(){ vec3 d = normalize(vD); float h = clamp(d.y, 0.0, 1.0), toward = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0), 2.0);
  // dusk: lavender-blue overhead, peach at the horizon toward the sun
  vec3 zen = vec3(0.26, 0.32, 0.66), mid = mix(vec3(0.52, 0.5, 0.8), vec3(0.86, 0.62, 0.62), toward), hor = mix(vec3(0.86, 0.72, 0.78), vec3(1.0, 0.74, 0.5), toward);
  vec3 col = mix(hor, mid, smoothstep(0.0, 0.14, h)); col = mix(col, zen, smoothstep(0.12, 0.7, h)); if (d.y < 0.0) col = hor * 0.85;
  // clouds (dusk): soft streaks, lit warm toward the sun
  if (d.y > 0.0) { vec2 cp = d.xz / (d.y + 0.08); float c = fbm(vec2(cp.x * 0.5, cp.y * 1.4) + uT * 0.01), c2 = fbm(vec2(cp.x * 1.3 + 4.0, cp.y * 3.6));
    float cov = smoothstep(0.52, 0.74, c * 0.75 + c2 * 0.35) * smoothstep(0.0, 0.1, d.y) * (1.0 - smoothstep(0.4, 0.7, d.y));
    vec3 cc = mix(mix(vec3(0.6, 0.55, 0.78), vec3(0.85, 0.6, 0.62), toward), mix(vec3(1.0, 0.86, 0.8), vec3(1.0, 0.8, 0.55), toward), smoothstep(0.55, 0.85, c2));
    col = mix(col, cc * mix(1.0, 0.12, uNight), cov * 0.85 * (1.0 - 0.7 * uOpen)); }
  // night: the sky goes dark blue-black
  vec3 nig = mix(vec3(0.03, 0.035, 0.07), vec3(0.008, 0.01, 0.025), h); if (d.y < 0.0) nig = vec3(0.03, 0.03, 0.05);
  col = mix(col, nig, uNight);
  // stars
  { vec2 sp = vec2(atan(d.z, d.x) * 180.0, d.y * 260.0); vec2 ci = floor(sp); float hs = h2(ci); vec2 f = fract(sp) - 0.5; float st = step(0.985, hs) * smoothstep(0.12, 0.0, length(f)) * (0.6 + 0.4 * sin(uT * 3.0 + hs * 50.0));
    col += vec3(0.9, 0.92, 1.0) * st * uNight * smoothstep(0.0, 0.15, d.y) * 1.6; }
  // the sun: a disk with a glow; the eclipse turns it into a black disk with a burning ring
  float sd = acos(clamp(dot(d, uSun), -1.0, 1.0)), R0 = 0.018;
  vec3 sunC = vec3(1.0, 0.82, 0.55) * (smoothstep(R0, R0 * 0.8, sd) * 7.0 + exp(-sd * 9.0) * 0.8);
  vec3 ringC = vec3(1.0, 0.86, 0.6) * (exp(-abs(sd - R0) * 260.0) * 9.0 + exp(-max(sd - R0, 0.0) * 30.0) * 0.6 * step(R0, sd)) - vec3(1.0) * smoothstep(R0, R0 * 0.9, sd) * 2.0;
  col += mix(sunC, ringC, uEcl); col = max(col, vec3(0.0)); if (uEcl > 0.0) col *= mix(1.0, 0.0, smoothstep(R0 * 0.98, R0 * 0.9, sd) * uEcl);
  // the opening: a white-gold light, long straight rays, rings of lens clouds turning around it
  if (uOpen > 0.0) { float ld = acos(clamp(dot(d, uL), -1.0, 1.0)) / (1.0 + uBig); vec3 ax = normalize(cross(uL, vec3(0.0, 1.0, 0.0))), ay = cross(ax, uL); float ph = atan(dot(d, ay), dot(d, ax));
    float core = smoothstep(0.075, 0.05, ld) * 6.0 + exp(-ld * 9.0) * 1.4 + exp(-ld * 3.0) * 0.2;
    float rays = 0.0; for (int k = 0; k < 2; k++) { float n = k == 0 ? 36.0 : 61.0; float s = pow(abs(sin(ph * n * 0.5 + float(k) * 1.3)), k == 0 ? 90.0 : 160.0); rays += s * (k == 0 ? 1.0 : 0.6); }
    rays *= smoothstep(0.08, 0.16, ld) * exp(-ld * 1.1) * uRays;
    // lens clouds: cells in (log distance, angle) around the light; each an ellipse stretched along the ring, lit on the inner side
    float lr = log(max(ld, 0.001)) * 6.0 - uT * 0.06, ca = ph * 9.0 / 3.14159 + uT * 0.02; vec2 cell = vec2(floor(ca), floor(lr)); vec2 fc = vec2(fract(ca), fract(lr)) - 0.5; float hc = h2(cell + 3.1);
    vec2 off = vec2(h2(cell + 7.7) - 0.5, h2(cell + 1.9) - 0.5) * 0.35; vec2 q = (fc - off) / vec2(0.38 + 0.1 * hc, 0.16 + 0.05 * hc); float el = 1.0 - dot(q, q);
    float lens = smoothstep(0.0, 0.35, el) * step(0.35, hc) * smoothstep(0.12, 0.22, ld) * (1.0 - smoothstep(1.2, 1.7, ld)) * (0.75 + 0.25 * fbm(fc * 8.0 + cell));
    vec3 lensC = mix(vec3(0.82, 0.72, 0.62), vec3(1.0, 0.95, 0.85), clamp(0.5 - q.y * 0.6, 0.0, 1.0)) * mix(1.0, 0.75, uNight);
    vec3 add = vec3(1.0, 0.95, 0.82) * core + vec3(1.0, 0.94, 0.8) * rays * 0.6;
    col = mix(col, lensC, lens * 0.92 * uOpen * mix(1.0, smoothstep(0.35, 0.8, uOpen), uNight)); col += add * uOpen; col = mix(col, col + vec3(0.05, 0.04, 0.02), uOpen * exp(-ld * 1.2)); }
  // falling stars: streaks sliding down the sky, each on its own path and time
  if (uFall > 0.0 && d.y > -0.05) { float az = atan(d.z, d.x), el2 = asin(clamp(d.y, -1.0, 1.0)); for (int i = 0; i < 28; i++) { float fi = float(i), a0 = h2(vec2(fi, 1.3)) * 6.2831, sp = 0.25 + 0.4 * h2(vec2(fi, 4.1)), t0 = h2(vec2(fi, 8.7)) * 6.0, tl = mod(uT * sp + t0, 6.0) / 6.0;
      vec2 hd = vec2(a0 + 0.12 * tl, 1.25 - 1.3 * tl), tl2 = hd + vec2(-0.025, 0.16); vec2 p = vec2(az, el2); float da = mod(p.x - hd.x + 3.14159, 6.28318) - 3.14159; vec2 pp = vec2(da, p.y - hd.y), ab = tl2 - hd; float u = clamp(dot(pp, ab) / dot(ab, ab), 0.0, 1.0); float dd = length(pp - ab * u);
      col += vec3(1.0, 0.92, 0.8) * smoothstep(0.004, 0.0, dd) * (1.0 - u) * 3.0 * uFall + vec3(1.0, 0.8, 0.6) * exp(-dd * 260.0) * (1.0 - u) * 0.5 * uFall; } }
  col = mix(col, vec3(0.92, 0.94, 1.0) * 1.6, uFlash * 0.85);
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); return m; }
// the lightning bolt (2D, over the frame): a jagged trunk from one side to the other with branches; grows across in ~0.25 s
function boltPath(seed) { const R = RNG('bolt' + seed), P = [[1180, 380]]; let x = 1180, y = 380; while (x > -120) { x -= R.r(30, 80); y += R.r(-40, 55); P.push([x, y]); } const br = [];
  for (let k = 0; k < 7; k++) { const i = 2 + Math.floor(R.f() * (P.length - 4)), b = [P[i]]; let bx = P[i][0], by = P[i][1]; const n = 3 + Math.floor(R.f() * 5); for (let j = 0; j < n; j++) { bx -= R.r(10, 50); by += R.r(20, 70); b.push([bx, by]); } br.push([i, b]); } return { P, br }; }
function drawBolt(B, grow, a) { if (a <= 0) return; ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const n = Math.max(2, Math.round(B.P.length * clamp(grow))); const path = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
  const tr = B.P.slice(0, n); [[34, 'rgba(150,170,255,0.18)'], [16, 'rgba(190,205,255,0.4)'], [7, 'rgba(230,236,255,0.85)'], [3, 'rgba(255,255,255,1)']].forEach(([w, c]) => { ctx.globalAlpha = a; ctx.lineWidth = w; ctx.strokeStyle = c; path(tr); B.br.forEach(([i, b]) => { if (i < n) { ctx.lineWidth = w * 0.45; path(b.slice(0, Math.min(b.length, n - i + 1))); } }); });
  ctx.restore(); }
// the sky state over time (shared by every stage)
function heavenState(t) {
  const open = ss(16.6, 20.5, t), night = ss(47.0, 52.5, t), ecl = ss(47.5, 51.0, t);
  HV.uOpen.value = t < 46 ? open * (1 - 0.0) : t < 66.5 ? lerp(open, 0.25, ss(46, 49, t)) : ss(66.6, 70.5, t) * 1.15;
  HV.uEcl.value = ecl; HV.uBig.value = t >= 66.5 ? 1.6 * ss(67, 72, t) : 0; HV.uNight.value = t < 46 ? 0 : t < 66.5 ? night : 1; HV.uFall.value = ss(51.0, 52.0, t) * (1 - ss(60, 61, t)) + (t >= 61 && t < 66.5 ? 0.4 : 0);
  HV.uFlash.value = t >= 12.5 && t < 13.6 ? (0.8 * Math.exp(-(t - 12.62) * 10) * (t > 12.62 ? 1 : (t - 12.5) / 0.12) + 0.5 * Math.exp(-Math.abs(t - 12.95) * 30)) : 0; HV.uT.value = t;
  return { open: HV.uOpen.value, night: HV.uNight.value, ecl, flash: HV.uFlash.value }; }
