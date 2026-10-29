// =====================================================================
//  ASCENT — 19–38 s: the column climbs out of Mexico City at dusk (city), pierces the cloud deck past the airliners
//  (clouds), reaches space past the Kármán line and the ISS (space), and leaves the whole Earth behind (earth).
//  Two stages:
//   · ascentCity()  metres. Origin = the studio tower downtown (the column stands on its roof); x east, -z north, y up
//     from the valley floor. A procedural Mexico City carpet (blocks, ejes, Reforma, the Zócalo, Chapultepec, the
//     airport, the ring roads, lit windows and traffic) under ~18k instanced buildings, the mountains ringing the valley,
//     the Popocatépetl and the Iztaccíhuatl with snow, a dusk sky with haze; the cloud deck and an airliner for 25–29.
//   · ascentSpace() km. The Earth (radius 6371) centred at (0, -RE, 0) with Mexico City at the top, same axes: oceans
//     with glint, continents, clouds, night lights, a ray-marched atmosphere; the ISS; stars.
//  The sun is the same low dusk sun (WSW, 4.5° up) in both, so Mexico City sits on the terminator seen from space.
// =====================================================================
const ASCENT_SUN = dirV(256 * DEG, 4.5 * DEG);
const ASCENT_TOWER = 118, ASCENT_RE = 6371;
const ASCENT_POPO = [52000, 46000], ASCENT_IZTA = [55500, 25500];
// the column: the height of the stack at rest (m) and the smooth height used to drive the camera (m)
function ascentSmooth(t) { let n = 0; while (n < 102 && FOLD_T[n + 1] <= t) n++; const a = FOLD_T[n], b = FOLD_T[n + 1] ?? a + 1; return thickM(n + clamp((t - a) / (b - a))); }
// non-uniform Hermite spline through keys [[t, v0, v1, ...]] (one-sided tangents at the ends)
function ascentPath(K, t) { const n = K.length; if (t <= K[0][0]) return K[0].slice(1); if (t >= K[n - 1][0]) return K[n - 1].slice(1);
  let i = 0; while (t > K[i + 1][0]) i++; const t0 = K[i][0], t1 = K[i + 1][0], dt = t1 - t0, u = (t - t0) / dt, u2 = u * u, u3 = u2 * u;
  const tan = (j, c) => { const a = K[Math.max(0, j - 1)], b = K[Math.min(n - 1, j + 1)]; return (b[c] - a[c]) / (b[0] - a[0]); };
  return K[i].slice(1).map((v0, c0) => { const c = c0 + 1, v1 = K[i + 1][c], m0 = tan(i, c) * dt, m1 = tan(i + 1, c) * dt;
    return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1; }); }
// the shared column (beam style: a hot core with a screen-space min width, the fold arcs); it swings toward screen-right
function ascentColumn(st, base, len, t, o = {}) { if (!st.ascCol) st.ascCol = makeColumn(st.scene, { style: 'beam', minPx: o.minPx ?? 1.8, halo: o.halo ?? 16 });
  const side = new THREE.Vector3(1, 0, 0).applyQuaternion(st.cam.quaternion); return st.ascCol.pose(base, new THREE.Vector3(0, 1, 0), len, t, { glow: o.glow ?? 1, side, visible: o.visible }); }
// a dashed polyline through 3D points (skips points behind the camera or hidden by `hide(p)`)
function ascentDash(st, pts, col, a, dash = [14, 10], lw = 2, hide) { const cam = st.cam; ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6;
  let on = false; ctx.beginPath(); pts.forEach((p) => { const v = p.clone().project(cam), ok = v.z < 1 && !(hide && hide(p)); if (!ok) { on = false; return; } const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; if (on) ctx.lineTo(x, y); else ctx.moveTo(x, y); on = true; });
  ctx.stroke(); ctx.restore(); }

// ---- shared GLSL: hashes, value noise, fbm
const ASCENT_NOISE = `
float aH2(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float aH3(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float aN2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(aH2(i), aH2(i + vec2(1, 0)), f.x), mix(aH2(i + vec2(0, 1)), aH2(i + vec2(1, 1)), f.x), f.y); }
float aN3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(aH3(i), aH3(i + vec3(1, 0, 0)), f.x), mix(aH3(i + vec3(0, 1, 0)), aH3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(aH3(i + vec3(0, 0, 1)), aH3(i + vec3(1, 0, 1)), f.x), mix(aH3(i + vec3(0, 1, 1)), aH3(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
float aF2(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * aN2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; m *= 0.5; } return a / 0.97; }
float aF3(vec3 p, int oc){ float a = 0.0, m = 0.5, s = 0.0; for (int i = 0; i < 10; i++) { if (i >= oc) break; a += m * aN3(p); s += m; p = p * 2.03 + vec3(1.7, 9.2, 4.1); m *= 0.5; } return a / s; }
`;
// ---- JS value noise (terrain heights)
const ascentHash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function ascentVN(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(ascentHash(i, j), ascentHash(i + 1, j), u), lerp(ascentHash(i, j + 1), ascentHash(i + 1, j + 1), u), v); }
function ascentFbm(x, y, oc = 5) { let a = 0, m = 0.5, s = 0; for (let k = 0; k < oc; k++) { a += m * ascentVN(x, y); s += m; x = x * 2.03 + 17.1; y = y * 2.03 + 3.7; m *= 0.5; } return a / s; }
function ascentRidge(x, y, oc = 5) { let a = 0, m = 0.5, s = 0; for (let k = 0; k < oc; k++) { a += m * (1 - Math.abs(2 * ascentVN(x, y) - 1)) ** 2; s += m; x = x * 2.07 + 5.1; y = y * 2.07 + 9.3; m *= 0.5; } return a / s; }
const ascentGN = (R) => Math.sqrt(-2 * Math.log(Math.max(1e-9, R.f()))) * Math.cos(TAU * R.f());
const ascentSS = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ascentSmax = (a, b, k0) => { const k = Math.max(1e-3, k0 * clamp(Math.min(a, b) / 2500)), h = clamp(0.5 + 0.5 * (a - b) / k); return lerp(b, a, h) + k * h * (1 - h); };

// =====================================================================
//  THE VALLEY — heights (m above the valley floor; the floor is the city at 0)
// =====================================================================
function ascentHeight(x, z) {
  const ex = (x - 1500) / 19000, ez = (z - 2500) / 25000, e = Math.hypot(ex, ez) + 0.22 * (ascentFbm(x / 11000, z / 11000, 3) - 0.5), r = Math.hypot(x, z);
  let h = ascentSS(0.8, 1.5, e) * (2200 + 1200 * ascentFbm(x / 16000 + 5, z / 16000, 4)) + ascentSS(0.85, 2.0, e) * 1500 * ascentRidge(x / 6500, z / 6500, 6);
  h *= 1 - 0.5 * ascentSS(80000, 170000, r);
  h += 900 * Math.exp(-((x + 1000) ** 2 + (z + 14500) ** 2) / 4500 ** 2) * (0.6 + 0.7 * ascentRidge(x / 1800, z / 1800, 4));      // Sierra de Guadalupe
  h += 600 * Math.exp(-((x - 10500) ** 2 + (z - 9000) ** 2) / 2600 ** 2) * (0.6 + 0.7 * ascentRidge(x / 1500, z / 1500, 4));      // Santa Catarina
  h += 220 * Math.exp(-((x - 4200) ** 2 + (z - 9300) ** 2) / 800 ** 2);                                                             // Cerro de la Estrella
  h += 160 * Math.exp(-((x + 7300) ** 2 + (z - 2000) ** 2) / 400 ** 2);                                                             // Chapultepec hill
  // the Popocatépetl: a concave cone with a crater, gullies down its flanks
  { const dx = x - ASCENT_POPO[0], dz = z - ASCENT_POPO[1], d = Math.hypot(dx, dz), a = Math.atan2(dz, dx), u = clamp(d / 24000);
    let c = 5393 * Math.pow(1 - u, 2.3) - 190 * ascentSS(430, 140, d); c -= 90 * Math.pow(Math.abs(Math.sin(a * 13 + ascentFbm(d / 3000, 3, 2) * 3)), 3) * ascentSS(300, 2500, d) * (1 - u);
    h = ascentSmax(h, c, 400); }
  // the Iztaccíhuatl: a long N–S ridge, head / chest / knees / feet
  { const dx = x - ASCENT_IZTA[0], dz = z - ASCENT_IZTA[1]; let c = 4500 * Math.pow(1 - clamp(Math.hypot(dx / 6200, dz / 15000)), 1.5);
    [[-6500, 330, 1300], [-1200, 730, 1700], [3600, 560, 1500], [7800, 300, 1200]].forEach(([zc, hh, rr]) => (c += hh * Math.exp(-(dx * dx + (dz - zc) ** 2) / (rr * rr))));
    c += 250 * (ascentRidge(x / 1400, z / 1400, 4) - 0.5) * (c / 4500); h = ascentSmax(h, c, 400); }
  // the Tláloc, the Ajusco, the Nevado de Toluca, la Malinche
  [[52000, -3000, 4120, 9000, 1.4], [-9000, 30000, 3930, 9000, 1.3], [-62000, 18000, 4680, 14000, 1.6], [128000, 20000, 4460, 18000, 1.6]].forEach(([cx, cz, hh, rr, pw]) => {
    const d = Math.hypot(x - cx, z - cz); if (d < rr) h = ascentSmax(h, hh * Math.pow(1 - d / rr, pw) * (0.9 + 0.2 * ascentFbm(x / 2000, z / 2000, 3)), 300); });
  return h; }
// the arterial roads (x, z in m; half-widths) — shared by the ground shader and the building layout
const ASCENT_ROADS = [
  [30, [[-700, -80], [-1500, 150], [-2400, 500], [-3400, 1000], [-4300, 1400], [-5300, 1750], [-8800, 2500], [-14000, 2600]]],   // Paseo de la Reforma
  [24, [[-700, -80], [-200, -1500], [800, -5000], [2500, -9000]]],                                                                 // Reforma norte
  [22, [[-1700, -14000], [-1900, -5000], [-2100, 0], [-2300, 6000], [-2500, 12000], [-2900, 20000]]],                              // Insurgentes
  [30, [[-8500, -11000], [-10500, -2000], [-10000, 6000], [-7000, 13000], [-1000, 17000], [6000, 15000], [11000, 8000], [13000, -1000], [10000, -9000], [3000, -13500], [-4000, -13500], [-8500, -11000]]], // Periférico
  [22, [[-4000, -3500], [-4500, 1500], [-3000, 4500], [1500, 5000], [4500, 2000], [4000, -3500], [500, -5000], [-4000, -3500]]], // Circuito Interior
  [25, [[-6000, 4200], [0, 3800], [6000, 3500], [9000, 3600]]],                                                                    // Viaducto
  [22, [[300, 300], [800, 6000], [900, 13000], [1500, 19000]]],                                                                    // Tlalpan
  [26, [[1500, 500], [6000, 1500], [12000, 3500], [20000, 5000]]],                                                                 // Zaragoza
  [18, [[150, 0], [0, -9000], [-500, -13000]]],                                                                                    // Eje Central
  [18, [[12000, 3500], [25000, 9000], [40000, 20000], [60000, 35000]]], [18, [[-6000, -12000], [-12000, -25000], [-20000, -50000]]],
  [18, [[-8800, 2500], [-20000, 3500], [-40000, 6000]]], [18, [[-3000, 18000], [-4000, 30000], [-5000, 50000]]], [18, [[3000, -13000], [9000, -30000], [15000, -60000]]],
];
const ASCENT_ROADS_GLSL = (() => { let s = 'float aRoads(vec2 p, out float sd, out float u, out float hw){ float best = 1e9, off = 0.0; sd = 1e9; u = 0.0; hw = 10.0; vec2 a, b, pa, ba; float h, d, cr;\n';
  ASCENT_ROADS.forEach(([w, P]) => { let acc = 0; for (let i = 0; i < P.length - 1; i++) { const [ax, az] = P[i], [bx, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az);
    s += `a = vec2(${ax.toFixed(1)}, ${az.toFixed(1)}); b = vec2(${bx.toFixed(1)}, ${bz.toFixed(1)}); pa = p - a; ba = b - a; h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); d = length(pa - ba * h) - ${w.toFixed(1)};
      if (d < best) { best = d; cr = ba.x * pa.y - ba.y * pa.x; sd = sign(cr) * length(pa - ba * h); u = ${acc.toFixed(1)} + h * ${L.toFixed(1)}; hw = ${w.toFixed(1)}; }\n`; acc += L; } });
  return s + 'return best; }\n'; })();
function ascentRoadDist(x, z) { let best = 1e9; ASCENT_ROADS.forEach(([w, P]) => { for (let i = 0; i < P.length - 1; i++) { const [ax, az] = P[i], [bx, bz] = P[i + 1], px = x - ax, pz = z - az, bx_ = bx - ax, bz_ = bz - az, h = clamp((px * bx_ + pz * bz_) / (bx_ * bx_ + bz_ * bz_)); best = Math.min(best, Math.hypot(px - bx_ * h, pz - bz_ * h) - w); } }); return best; }

// ---- the city stage's shared uniforms and its sky / haze GLSL
const ASCENT_CU = { uSun: { value: ASCENT_SUN.clone() }, uSunCol: { value: lin('#ff7a36') }, uSkyAmb: { value: lin('#1c1e3a') }, uDens: { value: 1 / 26000 }, uDip: { value: 0 }, uDark: { value: 0 }, uTime: { value: 0 }, uLights: { value: 1 } };
const ASCENT_SKY_GLSL = `
uniform vec3 uSun; uniform float uDip, uDark, uDens;
vec3 aSky(vec3 d){
  float y = d.y - uDip, yy = max(y, 0.0); vec2 hz = normalize(d.xz + vec2(1e-5)), hs = normalize(uSun.xz); float sa = dot(hz, hs), mu = dot(d, uSun);
  float k = mix(4.0, 18.0, uDark);
  vec3 zen = mix(vec3(0.050, 0.095, 0.26), vec3(0.0015, 0.003, 0.012), uDark);
  vec3 hor = mix(vec3(0.60, 0.40, 0.50), vec3(1.05, 0.52, 0.22), smoothstep(-0.55, 1.0, sa));
  hor = mix(hor, hor * vec3(1.1, 0.75, 0.6), uDark * 0.6);
  vec3 mid = mix(vec3(0.46, 0.32, 0.48), vec3(0.85, 0.42, 0.30), smoothstep(-0.3, 1.0, sa));
  vec3 c = mix(hor, mid, 1.0 - exp(-yy * k * 1.6)); c = mix(c, zen, 1.0 - exp(-yy * k * 0.55));
  float anti = smoothstep(0.1, -0.9, sa) * (1.0 - uDark);
  c = mix(c, vec3(0.20, 0.22, 0.38), anti * exp(-yy * 38.0) * 0.6);
  c += vec3(0.50, 0.24, 0.30) * anti * exp(-pow((yy - 0.085) / 0.055, 2.0)) * 0.5;
  c += vec3(1.0, 0.55, 0.25) * (pow(max(mu, 0.0), 4.0) * 0.40 + pow(max(mu, 0.0), 32.0) * 0.9) * (1.0 - 0.4 * uDark);
  c += vec3(1.0, 0.86, 0.62) * smoothstep(0.99986, 0.99993, mu) * 40.0;
  if (y < 0.0) c = hor * mix(0.9, 0.5, uDark);
  return c; }
vec3 aHorizon(vec3 d){ return aSky(normalize(vec3(d.x, uDip + 0.012, d.z))); }
vec3 aHaze(vec3 col, vec3 wp){ vec3 v = wp - cameraPosition; float dist = length(v); vec3 d = v / max(dist, 1e-3);
  float Hh = 2000.0, y0 = max(cameraPosition.y, 0.0), y1 = max(wp.y, 0.0), e0 = exp(-y0 / Hh), e1 = exp(-y1 / Hh), avg = abs(y1 - y0) > 1.0 ? Hh * (e0 - e1) / (y1 - y0) : e0;
  float od = uDens * dist * avg, up = smoothstep(-0.25, 0.0, d.y - uDip); vec3 hz = aHorizon(d) * mix(0.2, 0.92, up) * mix(vec3(0.62, 0.68, 1.0), vec3(1.0), up);
  return col * exp(-od * vec3(0.75, 1.0, 1.3)) + hz * (1.0 - exp(-od)); }
`;
const ASCENT_VS = 'varying vec3 vWp, vN; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }';
const ASCENT_END = '\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n';

// ---- the ground: the city carpet, the fields, the forests and the snow, all in one shader
const ASCENT_GROUND_FS = ASCENT_NOISE + ASCENT_SKY_GLSL + ASCENT_ROADS_GLSL + `
uniform vec3 uSunCol, uSkyAmb; uniform float uTime, uLights; varying vec3 vWp, vN;
float aLine(float d, float hw, float fw){ return clamp((hw + 0.5 * fw - d) / fw, 0.0, 1.0) * min(1.0, 2.0 * hw / fw); }
float aLamp(float d, float along, float off, float sp, float r, float fw){ float a = (fract(along / sp) - 0.5) * sp, dd = d - off, re = max(r, fw * 0.75); return (r * r) / (re * re) * exp(-(a * a + dd * dd) / (re * re)); }
vec2 aCityQ(vec2 p){ float k = smoothstep(2500.0, 6000.0, length(p)); float a = mix(0.035, 0.035 + 0.5 * (aN2(p / 9000.0) - 0.5), k);
  vec2 w = k * 240.0 * vec2(aN2(p / 4200.0) - 0.5, aN2(p / 4200.0 + 17.0) - 0.5); float c = cos(a), s = sin(a); return mat2(c, -s, s, c) * p + w; }
float aCar(float u, float lat, float lane, float speed, float fw, float seed){ float s = u - speed * uTime, cs = 24.0, id = floor(s / cs), h = aH2(vec2(id, seed));
  float a = (fract(s / cs) - 0.5) * cs - (h - 0.5) * 10.0, dl = lat - lane, re = max(1.2, fw * 0.75); return step(0.3, h) * 1.44 / (re * re) * exp(-(a * a + dl * dl) / (re * re)); }
void main(){
  vec3 p = vWp, n = normalize(vN); vec2 xz = p.xz; float fw = max(length(fwidth(xz)), 0.02);
  float ndl = dot(n, uSun), nz = aF2(xz / 1300.0), nz2 = aN2(xz / 140.0);
  // nature
  vec3 grass = mix(vec3(0.20, 0.17, 0.09), vec3(0.30, 0.25, 0.13), nz);
  vec3 forest = mix(vec3(0.035, 0.06, 0.035), vec3(0.08, 0.10, 0.05), nz2);
  vec3 rock = mix(vec3(0.25, 0.22, 0.21), vec3(0.40, 0.34, 0.30), nz2);
  float fo = smoothstep(200.0, 900.0, p.y + 500.0 * (nz - 0.5)) * (1.0 - smoothstep(3200.0, 3800.0, p.y + 400.0 * (nz - 0.5)));
  vec3 nat = mix(grass, forest, fo * smoothstep(0.25, 0.55, nz + 0.25));
  float steep = 1.0 - n.y; nat = mix(nat, rock, clamp(smoothstep(3300.0, 4000.0, p.y + 300.0 * nz) + smoothstep(0.5, 0.75, steep), 0.0, 1.0));
  float snow = smoothstep(4150.0, 4450.0, p.y + 350.0 * (aF2(xz / 1600.0) - 0.5) + 700.0 * (n.y - 0.78)); nat = mix(nat, vec3(0.93, 0.93, 0.97), snow);
  float lit = max(ndl, 0.0); vec3 amb = uSkyAmb * (0.55 + 0.45 * n.y);
  vec3 col = nat * (uSunCol * lit * 2.4 + amb) + vec3(1.0, 0.7, 0.75) * snow * pow(lit, 1.5) * 0.25;
  // the city
  vec2 e2 = (xz - vec2(1500.0, 2500.0)) / vec2(19000.0, 25000.0); float e = length(e2) + 0.22 * (aF2(xz / 11000.0) - 0.5);
  float urb = (1.0 - smoothstep(0.8, 1.02, e)) * (1.0 - smoothstep(250.0, 800.0, p.y)) * smoothstep(0.2, 0.42, aF2(xz / 2600.0 + 3.0) + (0.95 - e) * 0.8);
  // parks, the lake, the airport, the Zócalo
  vec2 cp = mat2(0.9, 0.44, -0.44, 0.9) * (xz - vec2(-6900.0, 2300.0)); float park = 1.0 - smoothstep(0.85, 1.0, length(cp / vec2(1900.0, 1050.0)) + 0.14 * aN2(xz / 400.0));
  park = max(park, step(abs(xz.x + 480.0), 250.0) * step(abs(xz.y + 30.0), 110.0));
  park = max(park, 1.0 - smoothstep(0.8, 1.0, length((xz - vec2(5200.0, -7600.0)) / 900.0) + 0.1 * aN2(xz / 300.0)));
  park = max(park, 1.0 - smoothstep(0.8, 1.0, length((xz - vec2(-3200.0, 15500.0)) / vec2(1600.0, 1200.0)) + 0.15 * aN2(xz / 300.0)));
  float xochi = 1.0 - smoothstep(0.75, 1.0, length((xz - vec2(3500.0, 19500.0)) / vec2(3500.0, 2200.0)) + 0.2 * aN2(xz / 900.0));
  float lake = 1.0 - smoothstep(0.85, 1.0, length((xz - vec2(16500.0, -9500.0)) / vec2(5800.0, 8000.0)) + 0.25 * aF2(xz / 3000.0));
  vec2 ap = xz - vec2(7200.0, -1600.0); vec2 aa = vec2(0.819, -0.574), ab = vec2(0.574, 0.819); float au = dot(ap, aa), av = dot(ap, ab);
  float apt = step(abs(au), 2700.0) * step(abs(av), 900.0);
  vec2 zq = xz - vec2(1000.0, 120.0); float zoc = step(max(abs(zq.x), abs(zq.y)), 112.0);
  vec2 q = aCityQ(xz), bs = vec2(105.0, 82.0), cell = floor(q / bs), f = q - cell * bs; float dx = min(f.x, bs.x - f.x), dz = min(f.y, bs.y - f.y);
  float sl = max(aLine(dx, 6.0, fw), aLine(dz, 6.0, fw));
  float ex = abs(fract(q.x / (bs.x * 9.0) + 0.5) - 0.5) * bs.x * 9.0, ez = abs(fract(q.y / (bs.y * 10.0) + 0.5) - 0.5) * bs.y * 10.0, eje = max(aLine(ex, 13.0, fw), aLine(ez, 13.0, fw));
  vec2 lsz = vec2(bs.x / 5.0, bs.y / 2.0), lc = floor(q / lsz); float lh = aH2(lc + 11.0), lh2 = aH2(lc + 37.0);
  vec3 roof = lh < 0.25 ? vec3(0.34, 0.32, 0.30) : lh < 0.45 ? vec3(0.50, 0.45, 0.38) : lh < 0.6 ? vec3(0.44, 0.25, 0.18) : lh < 0.78 ? vec3(0.60, 0.58, 0.55) : vec3(0.22, 0.21, 0.21);
  roof *= 0.7 + 0.5 * aN2(q / 7.0) * (1.0 - smoothstep(4.0, 20.0, fw)) + 0.25 * smoothstep(4.0, 20.0, fw);
  float tin = aLamp(abs(fract(q.x / 9.0) - 0.5) * 9.0, q.y + lh * 30.0, 0.0, 13.0, 1.1, fw) * step(0.45, lh2); roof = mix(roof, vec3(0.04), clamp(tin, 0.0, 1.0) * 0.8 * (1.0 - smoothstep(2.0, 6.0, fw)));
  float sunlit = mix(smoothstep(0.35, 0.7, lh2), 0.22, smoothstep(6.0, 30.0, fw));
  vec3 ucol = roof * (uSunCol * sunlit * 0.6 + uSkyAmb * 0.7) * mix(1.0, 0.6, smoothstep(2.0, 20.0, fw));
  float street = max(sl, eje); ucol = mix(ucol, vec3(0.035, 0.035, 0.04), street);
  float lw = smoothstep(4.0, 16.0, fw);
  float lamps = mix(aLamp(dx, q.y, 5.5, 27.0, 1.3, fw) + aLamp(dz, q.x, 5.5, 27.0, 1.3, fw), 0.006, lw);
  float ejeL = mix(aLamp(ex, q.y, 11.0, 30.0, 1.6, fw) + aLamp(ez, q.x, 11.0, 30.0, 1.6, fw), 0.004, lw) * 1.6 + eje * 0.012;
  float win = mix(step(0.9, aH2(floor(q / 3.2) + 5.0)) * (1.0 - street) * (1.0 - smoothstep(0.6, 2.5, fw)), 0.03, smoothstep(0.6, 2.5, fw)) * (0.4 + 0.8 * lh2);
  vec3 L = vec3(1.0, 0.56, 0.2) * lamps * 7.0 + vec3(1.0, 0.82, 0.6) * ejeL * 6.0 + vec3(1.0, 0.74, 0.45) * win * 1.1;
  // arterials: asphalt, lamps both sides, traffic (white one way, red the other)
  float sd, ru, rhw; float rd = aRoads(xz, sd, ru, rhw); float rcov = aLine(abs(sd), rhw, fw);
  float carW = aCar(ru, sd, -0.45 * rhw, 14.0, fw, 3.0) + aCar(ru, sd, -0.2 * rhw, 17.0, fw, 5.0), carR = aCar(ru, sd, 0.45 * rhw, -14.0, fw, 7.0) + aCar(ru, sd, 0.2 * rhw, -16.0, fw, 9.0);
  float rlamp = aLamp(abs(sd), ru, rhw * 0.95, 34.0, 1.6, fw) + aLamp(abs(sd), ru + 17.0, 0.0, 34.0, 1.4, fw);
  float rfar = smoothstep(3.0, 14.0, fw);
  vec3 RL = mix(vec3(1.0, 0.62, 0.28) * rlamp * 8.0 + vec3(1.0, 0.95, 0.85) * carW * 9.0 + vec3(1.0, 0.08, 0.04) * carR * 8.0, vec3(1.0, 0.55, 0.24) * rcov * 0.4, rfar);
  ucol = mix(ucol, vec3(0.03), rcov * (1.0 - rfar));
  // the Zócalo: pale paving under floodlights, a ring of lamps
  ucol = mix(ucol, vec3(0.55, 0.50, 0.45) * (uSunCol * 0.5 + uSkyAmb), zoc); L += zoc * (vec3(1.0, 0.8, 0.55) * 0.5 + vec3(1.0, 0.85, 0.6) * aLamp(abs(max(abs(zq.x), abs(zq.y)) - 100.0), zq.x + zq.y, 0.0, 22.0, 1.6, fw) * 6.0);
  vec3 parkC = mix(vec3(0.03, 0.065, 0.03), vec3(0.07, 0.10, 0.045), aN2(xz / 18.0) * (1.0 - smoothstep(2.0, 8.0, fw)) + 0.4 * smoothstep(2.0, 8.0, fw)) * (uSunCol * 0.6 + uSkyAmb * 1.2);
  float pl = aLamp(abs(fract(xz.x / 160.0) - 0.5) * 160.0, xz.y, 0.0, 40.0, 1.2, fw);
  ucol = mix(ucol, parkC, park); L = mix(L, vec3(1.0, 0.8, 0.5) * mix(pl * 4.0, 0.006, lw), park);
  // Chapultepec lake
  float plk = 1.0 - smoothstep(0.8, 1.0, length((xz - vec2(-6300.0, 2050.0)) / vec2(320.0, 130.0))); vec3 wcol = aSky(reflect(normalize(p - cameraPosition), vec3(0, 1, 0))) * 0.55;
  ucol = mix(ucol, wcol, plk); L *= 1.0 - plk;
  // the airport: grass and tarmac, two runways with edge lights, the terminal
  { float rw = 0.0, rl = 0.0; for (int i = 0; i < 2; i++) { float v0 = i == 0 ? -170.0 : 160.0, dv = abs(av - v0); rw = max(rw, aLine(dv, 24.0, fw) * step(abs(au), 1950.0));
      rl += step(abs(au), 1950.0) * mix(aLamp(abs(dv), au, 26.0, 60.0, 1.4, fw) * 6.0 + aLamp(dv, au, 0.0, 30.0, 0.9, fw) * 2.0, 0.02, lw); }
    float term = step(abs(au), 900.0) * step(abs(av - 560.0), 90.0), tw = aLine(abs(av - 330.0), 12.0, fw) * step(abs(au), 2000.0);
    vec3 acol = mix(vec3(0.07, 0.08, 0.05), vec3(0.06), max(rw, tw)); acol = mix(acol, vec3(0.3, 0.3, 0.32), term);
    ucol = mix(ucol, acol * (uSunCol * 0.6 + uSkyAmb), apt); L = mix(L, vec3(0.95, 0.95, 1.0) * rl + vec3(0.4, 0.6, 1.0) * tw * 0.4 + vec3(1.0, 0.85, 0.6) * term * 0.9, apt); }
  // Xochimilco fields and canals
  { float can = aLine(abs(fract((q.x + q.y * 0.3) / 140.0) - 0.5) * 140.0, 4.0, fw); vec3 xc = mix(vec3(0.08, 0.12, 0.05), vec3(0.13, 0.15, 0.07), aN2(q / 60.0)) * (uSunCol * 0.7 + uSkyAmb);
    xc = mix(xc, wcol * 0.6, can); ucol = mix(ucol, xc, xochi * 0.85); L *= 1.0 - xochi * 0.8; }
  // the dried lake of Texcoco: pale flats, shallow water mirrors
  { float wet = smoothstep(0.52, 0.6, aF2(xz / 2600.0 + 9.0)); vec3 lk = mix(vec3(0.42, 0.40, 0.36) * (uSunCol * 0.7 + uSkyAmb), wcol, wet); ucol = mix(ucol, lk, lake); L *= 1.0 - lake; nat = mix(nat, lk, lake); }
  { vec2 gq = xz / 38.0, gc = floor(gq), gf = fract(gq) - 0.5 - (vec2(aH2(gc + 1.0), aH2(gc + 2.0)) - 0.5) * 0.7; float re = max(0.04, fw / 38.0 * 0.8), sp2 = step(0.5, aH2(gc + 4.0)) * 0.0016 / (re * re) * exp(-dot(gf, gf) / (re * re)) * (1.0 + 5.0 * smoothstep(4.0, 30.0, fw));
    L += mix(vec3(1.0, 0.6, 0.25), vec3(1.0, 0.9, 0.75), aH2(gc + 6.0)) * min(sp2, 3.0) * 2.5 * (1.0 - park) * (1.0 - apt); }
  L *= uLights;
  vec3 C = mix(col, ucol, urb) + (L + RL * max(urb, 0.35 * (1.0 - smoothstep(600.0, 1500.0, p.y)))) * urb;
  C += RL * (1.0 - urb) * (1.0 - smoothstep(200.0, 1200.0, p.y)) * smoothstep(-5.0, 40.0, -rd) * 0.6;
  // small towns beyond the valley (Toluca, Cuernavaca, Puebla side)
  { vec2 tc = floor(xz / 5000.0); float th = aH2(tc + 3.0); vec2 to = (tc + 0.2 + 0.6 * vec2(aH2(tc + 7.0), aH2(tc + 9.0))) * 5000.0; float td = length(xz - to), tr = 400.0 + 900.0 * th;
    float town = step(0.72, th) * (1.0 - smoothstep(0.3 * tr, tr, td)) * (1.0 - urb) * (1.0 - smoothstep(1200.0, 2600.0, p.y)) * (1.0 - snow) * step(28000.0, length(xz));
    C += vec3(1.0, 0.65, 0.3) * town * mix(step(0.86, aH2(floor(xz / 24.0))) * 3.0, 0.4, smoothstep(6.0, 20.0, fw)) * uLights; }
  C = aHaze(C, p);
  gl_FragColor = vec4(C, 1.0);` + ASCENT_END + '}';

// windows on instanced buildings (world-space grid on the walls), lit at dusk, plus the haze
function ascentBldMat(o = {}) { const m = STDm({ color: '#ffffff', roughness: o.glass ? 0.22 : 0.85, metalness: o.glass ? 0.55 : 0.0, envMapIntensity: o.glass ? 0.8 : 0.12 });
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, ASCENT_CU);
    sh.vertexShader = 'varying vec3 vWp2; varying vec3 vWn2;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n { mat4 IM4 = modelMatrix;\n#ifdef USE_INSTANCING\n IM4 = modelMatrix * instanceMatrix;\n#endif\n vWp2 = (IM4 * vec4(transformed, 1.0)).xyz; vWn2 = normalize(mat3(IM4) * objectNormal); }');
    sh.fragmentShader = 'varying vec3 vWp2; varying vec3 vWn2; uniform float uLights; uniform float uTime;\n' + ASCENT_NOISE + ASCENT_SKY_GLSL + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        float aWin = 0.0, aLit = 0.0; if (abs(vWn2.y) < 0.5) { float u = abs(vWn2.x) > 0.5 ? vWp2.z : vWp2.x; vec2 c = vec2(floor(u / 3.1), floor(vWp2.y / 3.6)); float h = aH2(c + floor(vWp2.xz / 37.0) * 13.0);
          float fwu = max(fwidth(u), fwidth(vWp2.y)), wx = fract(u / 3.1), wy = fract(vWp2.y / 3.6); aWin = step(0.18, wx) * step(wx, 0.82) * step(0.22, wy) * step(wy, 0.8) * step(4.0, vWp2.y);
          aWin = mix(aWin, 0.42, smoothstep(0.4, 1.6, fwu)); aLit = mix(aWin * step(0.62, h), 0.42 * 0.38, smoothstep(0.4, 1.6, fwu)) * (0.6 + 0.8 * aH2(c + 3.0));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.06, 0.07, 0.09), aWin * ${o.glass ? '0.45' : '0.75'}); }
        else diffuseColor.rgb *= 0.55;`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += vec3(1.0, 0.72, 0.42) * aLit * uLights * 2.2;')
      .replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb = aHaze(gl_FragColor.rgb, vWp2);\n#include <tonemapping_fragment>'); };
  m.customProgramCacheKey = () => 'ascBld' + (o.glass ? 'g' : 'c'); return m; }
// a plain lit material with the haze (landmarks, the airliner)
function ascentHazeMat(o) { const m = STDm(o); m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, ASCENT_CU);
  sh.vertexShader = 'varying vec3 vWp2;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWp2 = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  sh.fragmentShader = 'varying vec3 vWp2;\n' + ASCENT_SKY_GLSL + sh.fragmentShader.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb = aHaze(gl_FragColor.rgb, vWp2);\n#include <tonemapping_fragment>'); };
  m.customProgramCacheKey = () => 'ascHz'; return m; }

// =====================================================================
//  THE CITY STAGE
// =====================================================================
function ascentCity() { return once('ascentCity', () => {
  const st = makeStage({ fov: 50, far: 460000, hemi: 0.22, sky: 0x4a4c80, ground: 0x221c22, key: 2.3, keyCol: '#ff8a48', sunDist: 1000 });
  st.key.castShadow = false; st.cam.near = 2; st.setSun(ASCENT_SUN, new THREE.Vector3(0, 0, 0)); const S = { st }; ASCENT_CU.uSun.value.copy(ASCENT_SUN);
  skyEnv(st, '#1c2a5a', '#e89a70', ASCENT_SUN, '#ffb070');
  // the sky dome (follows the camera)
  S.sky = new THREE.Mesh(new THREE.SphereGeometry(400000, 64, 32), new THREE.ShaderMaterial({ uniforms: ASCENT_CU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: ASCENT_NOISE + ASCENT_SKY_GLSL + `varying vec3 vD; void main(){ vec3 d = normalize(vD); vec3 c = aSky(d);
      float y = d.y - uDip; if (y > 0.0) { vec2 cp = d.xz / (d.y + 0.06); float ci = smoothstep(0.55, 0.85, aF2(vec2(cp.x * 1.4 + cp.y * 0.6, cp.y * 4.0 - cp.x) * 1.3)) * smoothstep(0.0, 0.1, y) * (1.0 - smoothstep(0.35, 0.8, y)) * (1.0 - uDark);
        float sa = dot(normalize(d.xz), normalize(uSun.xz)); c = mix(c, mix(vec3(0.9, 0.55, 0.62), vec3(1.25, 0.72, 0.42), smoothstep(-0.3, 1.0, sa)), ci * 0.55);
        float s = step(0.9975, aH3(floor(d * 900.0))) * uDark * uDark * smoothstep(0.02, 0.2, y); c += vec3(s * 1.5); }
      gl_FragColor = vec4(c, 1.0);` + ASCENT_END + '}' }));
  S.sky.renderOrder = -10; S.sky.frustumCulled = false; st.scene.add(S.sky);
  // the ground: a polar mesh around the city (dense near, sparse far) + a fine patch over the volcanoes
  const gmat = new THREE.ShaderMaterial({ uniforms: ASCENT_CU, vertexShader: ASCENT_VS, fragmentShader: ASCENT_GROUND_FS, extensions: { derivatives: true }, side: THREE.DoubleSide });
  { const NR = 230, NA = 900, pos = new Float32Array((NR + 1) * NA * 3), idx = [];
    for (let i = 0; i <= NR; i++) { const r = 260000 * Math.pow(i / NR, 2.4); for (let j = 0; j < NA; j++) { const a = j / NA * TAU, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const inP = ascentSS(0, 2500, Math.min(x - 30000, 75000 - x, z - 9000, 63000 - z)); pos.set([x, ascentHeight(x, z) - 260 * inP, z], (i * NA + j) * 3); } }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + (j + 1) % NA, c = a + NA, d = b + NA; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, gmat); m.frustumCulled = false; st.scene.add(m); }
  { const g = new THREE.PlaneGeometry(45000, 54000, 300, 360).rotateX(-Math.PI / 2).translate(52500, 0, 36000), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, ascentHeight(p.getX(i), p.getZ(i))); g.computeVertexNormals(); const m = new THREE.Mesh(g, gmat); st.scene.add(m); }
  // the Popocatépetl's fumarole: a lazy plume drifting east
  { const texs = [0, 1, 2].map((k) => cloudTex(10 + k)); S.plume = []; for (let i = 0; i < 9; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texs[i % 3], transparent: true, depthWrite: false, fog: false, premultipliedAlpha: true, color: '#8a7480', opacity: 0.4 }));
    st.scene.add(sp); S.plume.push(sp); } }
  // sunset cumulus far around the valley
  { const R = RNG('ascCu'), texs = [0, 1, 2, 3, 4, 5].map((k) => cloudTex(k)); S.cu = [];
    for (let i = 0; i < 40; i++) { const a = R.r(0, TAU), r = R.r(45000, 150000), s = R.r(6000, 15000), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.pick(texs), transparent: true, depthWrite: false, fog: false, premultipliedAlpha: true }));
      const x = Math.cos(a) * r, z = Math.sin(a) * r, toSun = (x * ASCENT_SUN.x + z * ASCENT_SUN.z) / r; sp.material.color = C3('#a888a8', '#ffb880', ascentSS(-0.6, 0.9, toSun)).multiplyScalar(0.75); sp.material.opacity = 0.5;
      { const da = Math.abs(((Math.atan2(z, x) - Math.atan2(36000, 54000)) / TAU + 1.5) % 1 - 0.5) * 360; if (da < 32) continue; }
      sp.position.set(x, R.r(4200, 7000), z); sp.scale.set(s * 1.7, s, 1); st.scene.add(sp); S.cu.push(sp); } }
  ascentBuildings(st, S); ascentLandmarks(st, S); ascentDeck(st, S); ascentPlane(st, S);
  return S; }); }

// ~18k buildings on the downtown blocks (the same grid as the ground shader) and the towers of Reforma
function ascentBuildings(st, S) { const R = RNG('ascBld'), c = Math.cos(0.035), s = Math.sin(0.035), bs = [105, 82], conc = [], glass = [];
  const pal = ['#9a8e7e', '#a89c88', '#7e756c', '#b8b0a2', '#8a5e4a', '#6e6e74', '#a08a6e', '#c4bcb0'];
  const avoid = (x, z) => (Math.abs(x + 480) < 280 && Math.abs(z + 30) < 135) || (Math.abs(x - 1000) < 135 && Math.abs(z - 120) < 135) || Math.hypot(x, z) < 70 || Math.hypot(x - 330, z - 220) < 40 || (Math.abs(x + 210) < 75 && Math.abs(z - 130) < 55) || (Math.abs(x - 1000) < 80 && Math.abs(z + 230) < 60) || (Math.abs(x - 1170) < 45 && Math.abs(z - 120) < 120);
  for (let i = -50; i <= 50; i++) for (let j = -64; j <= 64; j++) { const qx = (i + 0.5) * bs[0], qz = (j + 0.5) * bs[1], x = c * qx - s * qz, z = s * qx + c * qz, r = Math.hypot(x, z); if (r > 5000) continue;
    if (i % 9 === 0 || j % 10 === 0) { /* the ejes run on these lines: keep the blocks, the shader narrows them */ }
    if (ascentRoadDist(x, z) < 60 || avoid(x, z) || R.f() < ascentSS(1600, 5000, r) * 0.9) continue;
    const nb = 2 + Math.floor(R.f() * 4), rows = R.f() < 0.6 ? 2 : 1, bw = (bs[0] - 14) / nb, bd = (bs[1] - 14) / rows;
    for (let a = 0; a < nb; a++) for (let b = 0; b < rows; b++) { const lx = -bs[0] / 2 + 7 + (a + 0.5) * bw, lz = -bs[1] / 2 + 7 + (b + 0.5) * bd, qx2 = qx + lx, qz2 = qz + lz, px = c * qx2 - s * qz2, pz = s * qx2 + c * qz2;
      if (avoid(px, pz)) continue; const tower = R.f() < (r < 1500 ? 0.03 : 0.07); let h = tower ? R.r(45, r < 1500 ? 95 : 150) : R.r(8, r < 1500 ? 24 : 34) * (1 + 0.4 * R.f() * R.f());
      const w = bw - R.r(1, 4), d = bd - R.r(1, 4); (tower && R.f() < 0.6 ? glass : conc).push([px, pz, w, h, d, R.pick(pal), tower]); } }
  // Reforma: towers on both sides
  const P = ASCENT_ROADS[0][1]; for (let k = 0; k < 5; k++) { const [ax, az] = P[k + 1], [bx, bz] = P[k + 2], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    for (let u = 60; u < L - 60; u += R.r(70, 120)) for (const sd of [-1, 1]) { const off = 30 + R.r(25, 55), x = ax + ux * u - uz * off * sd, z = az + uz * u + ux * off * sd, h = R.r(50, 120) + (k >= 2 ? R.r(0, 110) : 0), w = R.r(22, 40);
      glass.push([x, z, w, h, w * R.r(0.7, 1.1), R.pick(['#8aa0b8', '#7a8a9a', '#a0b4c4', '#6a7888']), true, Math.atan2(uz, ux)]); } }
  [[-4800, 1450, 246, 40], [-4950, 1680, 235, 44], [-5070, 1560, 225, 46], [-4500, 1500, 205, 36], [-3700, 1300, 180, 38]].forEach(([x, z, h, w]) => glass.push([x, z, w, h, w, '#9ab0c8', true, 0.35]));
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  [[conc, ascentBldMat()], [glass, ascentBldMat({ glass: true })]].forEach(([L, mat]) => { const im = IM(geo, mat, L.length, false); im.receiveShadow = false;
    L.forEach(([x, z, w, h, d, col, , ry], i) => { im.setMatrixAt(i, M4c(x, 0, z, ry || -0.035, w, h, d)); im.setColorAt(i, lin(col)); }); im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false; st.scene.add(im); }); }

// the studio tower, the Torre Latinoamericana, Bellas Artes, the Zócalo (Cathedral, Palacio Nacional, the flag), the Ángel
function ascentLandmarks(st, S) { const add = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; st.scene.add(m); return m; }, B = (w, h, d) => new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
  const gl = ascentBldMat({ glass: true }), stone = ascentHazeMat({ color: '#e8e0d0', roughness: 0.7, emissive: '#ffc890', emissiveIntensity: 0.12 }), red = ascentHazeMat({ color: '#8a4a3a', roughness: 0.9, emissive: '#ff9a50', emissiveIntensity: 0.1 });
  const g1 = new THREE.Mesh(B(40, ASCENT_TOWER, 40), gl); g1.instanceColor = null; st.scene.add(g1); g1.material = ascentBldMat({ glass: true }); g1.material.color = lin('#7a90a8');
  add(B(41, 3.6, 41), new THREE.MeshBasicMaterial({ color: lin('#ffd8a0').multiplyScalar(1.4) }), 0, ASCENT_TOWER - 5, 0);                       // the studio, lit
  // the Torre Latinoamericana: a blue-glass shaft with setbacks, an antenna and a red light
  const tl = lin('#6a88a8'), tm = ascentBldMat({ glass: true }); tm.color = tl; [[0, 30, 138], [138, 24, 10], [148, 18, 8], [156, 12, 8]].forEach(([y, w, h]) => add(B(w, h, w), tm, 330, y, 220, -0.035));
  add(new THREE.CylinderGeometry(0.8, 1.4, 24, 8).translate(0, 12, 0), ascentHazeMat({ color: '#d0d0d8', metalness: 0.6, roughness: 0.4 }), 330, 164, 220);
  S.red = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff3020', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.red.position.set(330, 189, 220); st.scene.add(S.red);
  // Bellas Artes: white marble, an orange-gold dome
  add(B(110, 28, 76), stone, -210, 0, 130, -0.035); const dm = add(new THREE.SphereGeometry(17, 24, 12, 0, TAU, 0, Math.PI / 2), ascentHazeMat({ color: '#d8903a', metalness: 0.7, roughness: 0.35, emissive: '#ff8a30', emissiveIntensity: 0.15 }), -210, 30, 130); dm.scale.y = 1.25;
  // the Zócalo: the Cathedral (north), the Palacio Nacional (east), the flag
  add(B(60, 34, 110), stone, 1000, 0, -235, -0.035); [-22, 22].forEach((dx) => add(B(15, 64, 15), stone, 1000 + dx, 0, -185, -0.035)); add(new THREE.SphereGeometry(10, 16, 8, 0, TAU, 0, Math.PI / 2), stone, 1000, 34, -245);
  add(B(60, 22, 200), red, 1180, 0, 120, -0.035); add(new THREE.CylinderGeometry(0.6, 0.9, 50, 6).translate(0, 25, 0), stone, 1000, 0, 120);
  { const ft = g3Tex((x, w, h) => { ['#006847', '#f4f0e8', '#ce1126'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * w / 3, 0, w / 3 + 1, h); }); x.fillStyle = '#8a6a30'; x.beginPath(); x.arc(w / 2, h / 2, h * 0.16, 0, TAU); x.fill(); }, 96, 64);
    S.flag = add(new THREE.PlaneGeometry(25, 14, 12, 4).translate(12.5, 0, 0), new THREE.MeshStandardMaterial({ map: ft, side: THREE.DoubleSide, roughness: 0.9, emissive: '#ffffff', emissiveMap: ft, emissiveIntensity: 0.35 }), 1000, 42, 120); }
  // the Ángel de la Independencia on its roundabout
  add(new THREE.CylinderGeometry(2.2, 3, 36, 10).translate(0, 18, 0), stone, -3400, 0, 1000); S.angel = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffc040', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.angel.position.set(-3400, 39, 1000); S.angel.scale.setScalar(26); st.scene.add(S.angel); }

// the cloud deck for 25–29 (a lit fbm sheet + 3D puffs), hidden before
function ascentDeck(st, S) { S.deck = new THREE.Group(); S.deck.visible = false; st.scene.add(S.deck);
  // the cloud sea: a soft height field of cumulus domes between 3.8 and 6.6 km, ray-marched from a sheet at its top, lit by the low sun with self-shadow
  const m = new THREE.Mesh(new THREE.PlaneGeometry(900000, 900000, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: ASCENT_CU, transparent: true, depthWrite: false, extensions: { derivatives: true },
    vertexShader: ASCENT_VS, fragmentShader: ASCENT_NOISE + ASCENT_SKY_GLSL + `uniform vec3 uSunCol, uSkyAmb; uniform float uTime; varying vec3 vWp, vN;
      const float YB = 4000.0, YT = 5700.0;
      float aF2b(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 3; i++) { a += m * aN2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; m *= 0.5; } return a / 0.875; }
      float clr(vec2 p){ return 0.0 * (1.0 - smoothstep(7000.0, 24000.0, length(p - vec2(1000.0, 2000.0))))  ; }
      float Hl(vec2 p){ float c = aF2b(p / 9000.0) * 0.62 + aF2b(p / 2600.0 + 4.0) * 0.38; return smoothstep(0.42, 0.78, c - clr(p)); }
      float Hd(vec2 p){ float c = aF2(p / 9000.0) * 0.6 + aF2(p / 2600.0 + 4.0) * 0.34 + aF2(p / 650.0 + 9.0) * 0.025; return smoothstep(0.42, 0.78, c - clr(p)); }
      float hy(float h){ return YB + (YT - YB) * sqrt(h); }
      void main(){ vec3 ro = cameraPosition, rd = normalize(vWp - ro); if (rd.y > -0.002) discard;
        float t = max((YT - ro.y) / rd.y, 0.0), tE = (YB - ro.y) / rd.y; vec3 p = ro + rd * t; float h = 0.0; bool hit = false; vec2 o = vec2(uTime * 6.0, 0.0);
        for (int i = 0; i < 72; i++) { h = Hl(p.xz + o); float g = p.y - hy(h); if (g < 4.0) { hit = true; break; } t += max(g / (-rd.y + 2.6 * length(rd.xz)), 6.0); if (t > tE) break; p = ro + rd * t; }
        if (!hit) { p = ro + rd * tE; h = 0.0; } float cl0 = clr(p.xz + o); if (h < 0.015 && cl0 > 0.04) discard;
        vec2 q = p.xz + o; float hd = Hd(q), e = 90.0; vec3 n = normalize(vec3(-(hy(Hd(q + vec2(e, 0.0))) - hy(hd)) / e, 1.0, -(hy(Hd(q + vec2(0.0, e))) - hy(hd)) / e) * vec3(1.0, 0.45, 1.0)); n = normalize(mix(n, vec3(0.0, 1.0, 0.0), 0.55));
        float sh = 1.0; for (int k = 1; k <= 6; k++) { vec3 s = p + uSun * float(k * k) * 160.0; sh = min(sh, clamp((s.y - hy(Hl(s.xz + o))) / 450.0 + 0.6, 0.0, 1.0)); }
        float ndl = clamp(dot(n, uSun) * 1.8 + 0.22, 0.0, 1.0) * (0.3 + 0.7 * sh), top = smoothstep(0.05, 0.8, hd);
        vec3 col = vec3(1.0, 0.46, 0.24) * ndl * 1.7 * (0.5 + 0.5 * top) + mix(vec3(0.09, 0.08, 0.22), vec3(0.22, 0.15, 0.32), 0.4 * n.y + 0.6 * top); col *= 0.92 + 0.16 * aN2(q / 180.0);
        col = aHaze(col, p); gl_FragColor = vec4(col, max(smoothstep(0.015, 0.12, h), 1.0 - smoothstep(0.0, 0.04, cl0)));` + ASCENT_END + '}' }));
  m.position.y = 5700; m.renderOrder = 1; m.frustumCulled = false; S.deck.add(m);
}

// an airliner (metres) with nav lights and two contrails
function ascentPlane(st, S) { const g = new THREE.Group(), w = ascentHazeMat({ color: '#eef0f4', roughness: 0.35, metalness: 0.3 }), dk = ascentHazeMat({ color: '#2a3040', roughness: 0.5, metalness: 0.4 });
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 52, 20).rotateX(Math.PI / 2), w); g.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(2.9, 20, 12, 0, TAU, 0, Math.PI / 2).rotateX(-Math.PI / 2), w); nose.scale.z = 2.0; nose.position.z = -26; g.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(2.9, 12, 20).rotateX(Math.PI / 2), w); tail.position.z = 32; tail.scale.y = 0.7; tail.position.y = 0.8; g.add(tail);
  const wing = (sx) => { const sh = new THREE.Shape(); sh.moveTo(0, -4); sh.lineTo(sx * 31, 9); sh.lineTo(sx * 31, 12.5); sh.lineTo(0, 10); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false }).rotateX(Math.PI / 2), w); m.position.y = -1.2; g.add(m);
    const en = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 6.5, 16).rotateX(Math.PI / 2), dk); en.position.set(sx * 10, -2.6, 1.5); g.add(en); return en; };
  wing(1); wing(-1);
  const hs = (sx) => { const sh = new THREE.Shape(); sh.moveTo(0, 26); sh.lineTo(sx * 11, 34); sh.lineTo(sx * 11, 36.5); sh.lineTo(0, 35); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false }).rotateX(Math.PI / 2), w); m.position.y = 0.6; g.add(m); };
  hs(1); hs(-1); { const sh = new THREE.Shape(); sh.moveTo(25, 0); sh.lineTo(36, 11); sh.lineTo(38.5, 11); sh.lineTo(37, 0); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }).rotateY(-Math.PI / 2), ascentHazeMat({ color: '#1a3a7a', roughness: 0.4 })); m.position.set(0.3, 1.5, 0); g.add(m); }
  const lt = (c, x, y, z, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.position.set(x, y, z); sp.scale.setScalar(s); g.add(sp); return sp; };
  S.navR = lt('#ff2a20', -31, -1, 11, 7); S.navG = lt('#30ff60', 31, -1, 11, 7); S.strobe = lt('#ffffff', 0, 3, 38, 14); S.beacon = lt('#ff3020', 0, 3.4, -5, 9);
  // contrails: tapered open tubes behind the engines, brighter at the rim, fading with age
  const cg = new THREE.CylinderGeometry(1, 1, 1, 24, 60, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) { const u = cp.getZ(i), r = 1.2 + 70 * Math.pow(u, 0.8); cp.setX(i, cp.getX(i) * r); cp.setY(i, cp.getY(i) * r); cp.setZ(i, 14 + u * 5200); } cg.computeVertexNormals();
  const cm = new THREE.ShaderMaterial({ uniforms: ASCENT_CU, transparent: true, depthWrite: false, side: THREE.DoubleSide, vertexShader: 'varying vec3 vWp, vN; varying float vU; void main(){ vU = (position.z - 14.0) / 5200.0; vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: ASCENT_SKY_GLSL + 'uniform vec3 uSunCol, uSkyAmb; varying vec3 vWp, vN; varying float vU; void main(){ vec3 V = normalize(cameraPosition - vWp); float rim = pow(1.0 - abs(dot(normalize(vN), V)), 0.6); float a = rim * (1.0 - smoothstep(0.0, 1.0, vU)) * smoothstep(0.0, 0.01, vU) * 0.55;\n vec3 col = vec3(1.0, 0.96, 0.95) * (uSunCol * 1.3 + uSkyAmb * 1.2); col = aHaze(col, vWp); gl_FragColor = vec4(col, a);' + ASCENT_END + '}' });
  [-10, 10].forEach((x) => { const m = new THREE.Mesh(cg, cm); m.position.set(x, -2.6, 0); m.frustumCulled = false; g.add(m); });
  g.visible = false; st.scene.add(g); S.plane = g; }

// =====================================================================
//  CITY (19–25) and CLOUDS (25–29) — one stage, two camera moves
// =====================================================================
// city keys: [t, bearing of the camera from the tower (deg), log horizontal distance, log height, log target height, yaw offset (deg), fov]
const ASCENT_CITY_K = [[19.0, 318, Math.log(520), Math.log(300), Math.log(230), 0, 52], [20.3, 320, Math.log(820), Math.log(560), Math.log(420), 1, 50],
  [21.7, 322, Math.log(1900), Math.log(1150), Math.log(820), 2, 48], [22.9, 323, Math.log(6200), Math.log(2700), Math.log(2100), 3, 44], [24.2, 321, Math.log(17400), Math.log(5300), Math.log(5100), 2.9, 36], [25.0, 320.5, Math.log(19500), Math.log(5600), Math.log(5450), 3, 35]];
// clouds keys: [t, bearing, log dist, log height, log target height, yaw offset, fov]
const ASCENT_CLOUD_K = [[25.0, 298, Math.log(9000), Math.log(8000), Math.log(7300), 3, 46], [26.3, 303, Math.log(10500), Math.log(11400), Math.log(10800), 2.5, 46], [27.6, 308, Math.log(16000), Math.log(17000), Math.log(19500), 1.5, 48], [29.0, 314, Math.log(34000), Math.log(33000), Math.log(47000), 0, 52]];
function ascentCityCam(S, t, K, amt) { const [brg, ld, lh, lt, yo, fv] = ascentPath(K, t), b = brg * DEG, d = Math.exp(ld), x = Math.sin(b) * d, z = -Math.cos(b) * d, y = Math.exp(lh), ty = Math.exp(lt);
  const cam = S.st.cam; camLook(cam, x, y, z, 0, ty, 0); cam.rotation.y += yo * DEG; fov(S.st, fv); handheld(cam, t, amt, 4); cam.near = Math.max(2, y * 0.004); cam.far = 460000; cam.updateProjectionMatrix(); return cam; }
function ascentCityPose(S, t, lt) { const st = S.st, cam = st.cam; ASCENT_CU.uTime.value = t; ASCENT_CU.uDip.value = -Math.sqrt(2 * Math.max(cam.position.y, 1) / 6.371e6);
  ASCENT_CU.uDark.value = ascentSS(9000, 60000, cam.position.y); ASCENT_CU.uLights.value = lerp(0.75, 1.15, ascentSS(19, 26, t)); ASCENT_CU.uDens.value = 1 / 26000;
  S.sky.position.copy(cam.position);
  // the plume
  S.plume.forEach((sp, i) => { const k = (i + (t * 0.25) % 1) / S.plume.length, s = 1200 + k * 5200; sp.position.set(ASCENT_POPO[0] + k * 9000, 5450 + k * 1800, ASCENT_POPO[1] - k * 2000); sp.scale.set(s * 1.6, s, 1); sp.material.opacity = 0.32 * (1 - k) * ascentSS(0, 0.15, k); });
  S.red.scale.setScalar(Math.max(8, cam.position.distanceTo(S.red.position) * 0.006) * (0.6 + 0.4 * (Math.sin(t * 4) > 0 ? 1 : 0.3)));
  S.col = ascentColumn(st, new THREE.Vector3(0, ASCENT_TOWER, 0), colLen(t), t, { glow: lerp(0.25, 1, ascentSS(19.0, 19.9, t)) }); }   // the studio's thin line blooms into the beam after the cut
function ascentCityShot(lt, dur, t) { const S = ascentCity(), st = S.st, cam = ascentCityCam(S, t, ASCENT_CITY_K, 0.5);
  S.deck.visible = false; S.plane.visible = false; S.cu.forEach((p) => (p.visible = true));
  ascentCityPose(S, t, lt); renderStage(st, 1.05); if (CAMONLY) return;
  // the Torre Latinoamericana while the caption names it
  { const a = ascentSS(19.1, 19.5, t) * (1 - ascentSS(21.4, 21.8, t)); if (a > 0) colLabel(st, new THREE.Vector3(330, 175, 220), 'TORRE LATINOAMERICANA', '183 m', a, -1); }
  // the city's names, small
  { const a = ascentSS(21.6, 22.1, t) * (1 - ascentSS(23.3, 23.7, t)); if (a > 0) [[[1000, 0, 120], 'ZÓCALO', 1], [[-3400, 0, 1000], 'REFORMA', -1], [[-6900, 0, 2300], 'CHAPULTEPEC', -1], [[7200, 0, -1600], 'AEROPUERTO', 1]].forEach(([p, n, sd]) => colLabel(st, new THREE.Vector3(...p), n, '', a * 0.85, sd)); }
  // the Popocatépetl: its height drawn across to the column
  { const a = ascentSS(23.5, 23.9, t); if (a > 0) { const top = new THREE.Vector3(ASCENT_POPO[0], 5393, ASCENT_POPO[1]); ascentDash(st, [top, new THREE.Vector3(0, 5393, 0)], 'rgba(255,236,200,0.95)', a * 0.9, [10, 9], 2);
    colLabel(st, top, 'POPOCATÉPETL', '5.393 m', a, -1); } }
  bloom(0.42); }
function ascentCloudShot(lt, dur, t) { const S = ascentCity(), st = S.st, cam = ascentCityCam(S, t, ASCENT_CLOUD_K, 0.4);
  S.deck.visible = true; S.cu.forEach((p) => (p.visible = false));
  // the airliner crosses in front of the camera, right to left, at 11 km
  const cc = new THREE.PerspectiveCamera(50, W / H, 1, 10); cc.rotation.order = 'YXZ'; const tc = 26.35, c0 = ascentCityCam({ st: { cam: cc } }, tc, ASCENT_CLOUD_K, 0), fwd = new THREE.Vector3(0, 0, -1).applyEuler(c0.rotation), rt = new THREE.Vector3(1, 0, 0).applyEuler(c0.rotation); rt.y = 0; rt.normalize();
  const X = c0.position.clone().addScaledVector(fwd, 1000); X.y = 11000; let pp = X.clone().addScaledVector(rt, -240 * (t - tc));
  { const cn = new THREE.PerspectiveCamera(50, W / H, 1, 10); cn.rotation.order = 'YXZ'; const c1 = ascentCityCam({ st: { cam: cn } }, t, ASCENT_CLOUD_K, 0), f1 = new THREE.Vector3(0, 0, -1).applyEuler(c1.rotation); pp = c1.position.clone().addScaledVector(f1, 620).addScaledVector(rt, -260 * (t - tc)).add(new THREE.Vector3(0, -70, 0)); } S.plane.visible = t > 25.7 && t < 27.3; S.plane.position.copy(pp);
  S.plane.lookAt(pp.clone().add(rt)); S.plane.rotateY(Math.PI); S.plane.rotateZ(0.05); S.plane.scale.setScalar(1.25);
  S.strobe.visible = (t * 1.1) % 1 < 0.06; S.beacon.material.opacity = (t * 0.9) % 1 < 0.15 ? 1 : 0.15;
  ascentCityPose(S, t, lt); renderStage(st, 1.05); if (CAMONLY) return;
  { const a = ascentSS(25.6, 25.9, t) * (1 - ascentSS(27.2, 27.5, t)); if (a > 0) colLabel(st, pp.clone().add(new THREE.Vector3(0, 6, 0)), 'AVIONES COMERCIALES', '~11 km', a, pp.clone().project(cam).x > -0.1 ? 1 : -1); }
  { const a = ascentSS(27.5, 27.9, t); if (a > 0) { const ring = []; for (let i = 0; i <= 64; i++) { const an = i / 64 * TAU; ring.push(new THREE.Vector3(Math.cos(an) * 2600, 8849, Math.sin(an) * 2600)); }
    ascentDash(st, ring, 'rgba(255,236,200,0.95)', a * 0.9, [9, 8], 2); colLabel(st, new THREE.Vector3(-2600, 8849, 0), 'EVEREST', '8.849 m', a, 1); } }
  bloom(0.42); }
SHOT_FN.city = ascentCityShot;
SHOT_FN.clouds = ascentCloudShot;

// =====================================================================
//  THE EARTH — textures drawn once (land and biomes, the coast, city lights), a shader globe, a ray-marched atmosphere
// =====================================================================
const ASCENT_LAND = [
  // North America (with Mexico, Baja California, the Yucatán)
  [[-166, 68.9], [-163, 70.3], [-156.8, 71.3], [-148, 70.3], [-141, 69.6], [-135, 69.4], [-128, 70.2], [-121, 69.5], [-114, 68.5], [-108, 68.6], [-100, 67.8], [-95, 68], [-90, 68.5], [-85, 69.6], [-82, 66.5], [-86, 64], [-93, 61.5], [-94.5, 59], [-92.5, 57], [-88, 55.5], [-82.5, 55], [-82, 52.5], [-79.5, 51.5], [-79, 54.5], [-77, 58], [-78, 60.5], [-77.5, 62.5], [-73, 62], [-69.5, 61], [-65, 60.2], [-64, 58], [-61.5, 56], [-58, 54], [-56, 52], [-59, 48.5], [-64.5, 49], [-66.5, 45], [-70, 43.6], [-70.5, 41.8], [-74, 40.6], [-75.5, 38], [-76, 35], [-78.5, 33.8], [-81, 31.5], [-80.5, 28], [-80, 25.5], [-81.5, 25.2], [-82.8, 27.5], [-83.5, 29.8], [-86, 30.3], [-89.5, 30.2], [-90, 29.1], [-94, 29.6], [-97.3, 27.8], [-97.5, 25.5], [-97.8, 22.5], [-96.5, 19.5], [-94.5, 18.2], [-91.5, 18.5], [-90.5, 21], [-87, 21.5], [-87.5, 18.5], [-88.2, 16], [-86, 15.9], [-83.3, 15], [-83.5, 11.5], [-81.5, 9], [-79.5, 9.5], [-77.4, 8.6], [-78, 7.2], [-80, 7.3], [-81.5, 7.8], [-83.5, 8.4], [-85.7, 10], [-85.9, 11.2], [-87.5, 13], [-91.5, 14], [-94, 16], [-96.5, 15.7], [-99.5, 16.6], [-102, 17.9], [-105.5, 20.5], [-105.3, 21.8], [-106.5, 23.4], [-108.8, 25.4], [-110.8, 27.9], [-112.8, 30.5], [-114.7, 31.7], [-113.5, 29.5], [-112, 27.5], [-111, 25.5], [-110.3, 24.2], [-109.9, 22.9], [-110.8, 23.5], [-112, 24.8], [-112.3, 26.5], [-114, 27.8], [-115.2, 29.5], [-116.5, 31.5], [-117.1, 32.5], [-118.5, 34], [-120.6, 34.6], [-122.5, 37.5], [-124, 40.5], [-124.5, 43], [-124, 46.5], [-124.7, 48.4], [-123, 49], [-126, 50.5], [-130, 54.5], [-133, 57], [-136.5, 58.5], [-140, 59.8], [-146, 60.6], [-151, 59.2], [-154, 57.5], [-158, 56.5], [-162, 55], [-164.5, 54.5], [-160, 58.5], [-162, 59.8], [-165, 60.5], [-166, 62], [-164.5, 63.2], [-161, 64.4], [-166, 65.2], [-168, 65.6]],
  [[-73, 78], [-65, 81], [-50, 82.5], [-30, 83.5], [-20, 82], [-18, 77], [-21, 72], [-24, 69.5], [-32, 68], [-40, 65], [-43, 60], [-48, 61], [-51, 64], [-53, 67], [-55, 70.5], [-58, 75], [-66, 76.3]],
  [[-80, 73], [-72, 71.5], [-68, 70], [-62, 67], [-65, 63.5], [-72, 62.5], [-78, 64.5], [-86, 70], [-90, 72.5]], [[-90, 76.5], [-80, 77], [-70, 79], [-62, 82], [-80, 83], [-95, 81], [-92, 77.5]],
  [[-118, 70.5], [-105, 69], [-101, 70], [-104, 73], [-112, 73], [-119, 72.5]], [[-125, 71.5], [-120, 71.5], [-117, 74], [-124, 74.3]], [[-100, 73], [-94, 72], [-95, 75], [-100, 76]],
  // South America
  [[-77, 8.5], [-75.5, 10.5], [-72, 12.2], [-70, 12], [-68, 10.5], [-64, 10.6], [-61, 10.5], [-59, 8], [-57, 6], [-53, 5.5], [-51, 4], [-50, 1.5], [-49, -1], [-44, -2.5], [-40, -3], [-37, -5], [-35, -7], [-35, -9], [-37, -12], [-39, -16], [-39.5, -19], [-41, -22], [-44, -23], [-47, -24.5], [-48.6, -28], [-50, -30], [-52, -32.5], [-54, -34.5], [-57, -35], [-57.5, -38], [-62, -39], [-63.5, -41], [-65, -42.5], [-65.5, -45], [-67.5, -46.5], [-66, -48], [-68.5, -50.5], [-69, -52], [-68.5, -54.5], [-71, -55], [-74, -53], [-75.5, -50], [-75, -46], [-74, -43], [-73.6, -40], [-73.5, -37], [-71.6, -33], [-71.4, -30], [-70.6, -25], [-70.2, -20], [-71.5, -17], [-75, -15], [-77, -12], [-79, -8], [-81, -6], [-81, -4], [-80, -2], [-80.5, 0], [-79.5, 1.5], [-78.5, 2.5], [-77.5, 4], [-77.4, 6.5], [-77.9, 7.5]],
  // Africa, Madagascar
  [[-17, 21], [-16.5, 24], [-14.5, 26], [-13, 27.8], [-10, 29.5], [-9.7, 32], [-6.8, 34], [-5.9, 35.8], [-2, 35.1], [3, 36.8], [10, 37.2], [11, 35.3], [10, 34], [11.5, 33], [15, 32.2], [19.5, 30.4], [20.5, 32.2], [23, 32.6], [25, 31.7], [29, 30.9], [32.3, 31.3], [34.2, 31.2], [34.9, 29.5], [35, 28], [37, 24], [38.5, 18], [39.5, 15.5], [42, 13], [43.3, 12.5], [44, 11], [47, 11.2], [51.2, 11.8], [51, 10.5], [49.5, 7], [48, 5], [45.5, 2], [43, -1], [40, -3.5], [39, -6], [39.5, -10], [40.5, -15], [37, -18], [35.3, -22], [35.5, -24], [33, -26], [32.5, -28.5], [30.5, -31], [27.5, -33.5], [25, -34], [22, -34.2], [20, -34.8], [18.4, -34], [18, -32], [17, -29], [15.2, -27], [14.5, -23], [13.5, -21], [11.8, -17.5], [11.8, -15], [13.6, -12], [13, -8.5], [12.2, -6], [11, -3.8], [9.3, -1], [9.5, 2.5], [9.7, 4], [8.5, 4.5], [6, 4.3], [4.5, 6.3], [2, 6.3], [-1, 5], [-4, 5.2], [-7.5, 4.4], [-9.5, 5.5], [-11.5, 6.8], [-13.2, 8.5], [-15, 11], [-16.7, 12.5], [-17.2, 14.7], [-16.5, 16.2], [-16.2, 19]],
  [[49.3, -12], [50.5, -15.5], [49.5, -17], [48, -22], [47, -25], [45, -25.5], [43.6, -23.5], [43.3, -21.5], [44.4, -19], [44, -17], [46.5, -15.7], [48, -13.5]],
  // Eurasia (the seas are carved out after)
  [[-5.6, 36], [-6.3, 36.8], [-8.9, 37], [-9.5, 38.7], [-8.8, 41], [-9.3, 43], [-8, 43.7], [-4, 43.4], [-1.5, 43.4], [-1.2, 46], [-2.5, 47.3], [-4.6, 48.4], [-1.5, 48.7], [0, 49.5], [1.6, 50.2], [3, 51.2], [4.5, 52.2], [5, 53.2], [7, 53.5], [8.6, 53.9], [8.5, 55.5], [8.1, 56.8], [10.5, 57.7], [7, 58], [5.5, 58.8], [5, 61], [7, 62.7], [12, 65.5], [15, 68.5], [19, 70], [25, 71], [31, 70], [33, 69], [41, 67.5], [40, 66], [35, 64.5], [37, 63.8], [44, 66.2], [44, 68.5], [53, 68.7], [58, 68.8], [60, 69.8], [66.5, 70.7], [72.5, 72.5], [80, 73.5], [87, 74.5], [100, 76.5], [105, 77.5], [113, 73.6], [120, 73], [128, 72.5], [140, 72.5], [150, 71.5], [160, 70.5], [170, 70], [180, 69], [180, 65], [178, 62.5], [170, 60], [164, 60], [162.5, 57], [160.5, 54], [156.7, 51], [156, 57.5], [155, 59.3], [151, 59.2], [143, 59.4], [138, 56], [141, 52], [140.5, 48.5], [137, 45], [133, 42.8], [130, 42.5], [129.5, 40.5], [128.5, 38.5], [129.4, 36], [126.5, 34.5], [126.2, 37.6], [125, 39.6], [122.3, 40.5], [121.5, 39], [119.5, 39.6], [118, 39.2], [119.5, 37], [122.5, 37.3], [120.3, 36], [119.2, 34.6], [120.8, 32.5], [121.9, 30.8], [121.5, 28.5], [119.6, 25.6], [117, 23.5], [114, 22.3], [111, 21.5], [110.4, 20.3], [108.5, 21.6], [106.5, 20.2], [105.8, 18.9], [106.7, 17], [108.8, 15.3], [109.3, 12], [107, 10.5], [105, 8.7], [104.8, 10.4], [103, 11], [100.9, 12.7], [99.2, 10], [100.3, 7], [102, 6], [103.4, 4], [103.6, 1.4], [101.3, 2.8], [100.4, 5.2], [98.3, 8], [98.6, 10.5], [97.7, 16.5], [94.3, 16], [94, 19.2], [92.3, 20.7], [91.8, 22.3], [89, 21.7], [86.9, 20.8], [85, 19.4], [82, 16.5], [80.3, 15.6], [80.2, 13.4], [79.8, 10.3], [77.5, 8.1], [76.3, 9.8], [74.8, 12.8], [73.4, 16], [72.8, 19.3], [72.6, 21.3], [70, 22.6], [68.5, 23.6], [66.7, 25.4], [61.6, 25.2], [57.3, 25.8], [56.4, 27], [54, 26.6], [51.4, 27.9], [50, 30.2], [48, 30], [48.5, 28.5], [50.2, 26.1], [51.5, 24.3], [53.5, 24], [56, 24.9], [56.4, 26.4], [57.8, 23.7], [59.8, 22.4], [58.5, 20.4], [55.5, 17.8], [52.3, 16.3], [49, 14.5], [45, 12.8], [43.5, 12.7], [42.8, 15], [42.6, 16.8], [40.8, 19.6], [39.2, 21.5], [38.4, 23.8], [36.6, 26], [35, 28], [34.6, 29.5], [34.2, 31.2], [35, 32.5], [35.9, 34.6], [36, 36.8], [32, 36], [27, 36.5], [24, 35], [20, 35.5], [12, 35.5], [5, 36.5], [-2, 36.6]],
  [[-180, 69], [-172, 69.8], [-170, 66], [-173, 64.5], [-180, 65]],
  [[-5.7, 50], [1.5, 51.2], [1.7, 52.7], [0, 53.5], [-1.6, 55.5], [-2, 57.7], [-3.2, 58.6], [-5, 58.6], [-6.2, 57.5], [-5.5, 56], [-4.9, 55], [-3, 54.6], [-3.2, 53.4], [-4.5, 53.2], [-4.2, 52.3], [-5.2, 51.7], [-3.5, 51.4]], [[-6, 52.2], [-6.2, 54], [-5.6, 54.6], [-7.3, 55.3], [-8.5, 54.6], [-10, 54.2], [-9.5, 53], [-10.3, 52], [-9, 51.6]],
  [[-24, 65.5], [-22, 66.4], [-16, 66.5], [-14, 65.3], [-15, 64.3], [-18.5, 63.4], [-22.5, 63.8]], [[52, 71], [55, 73], [57, 75.5], [63, 76.5], [68, 77], [59, 74.5], [57, 72], [55, 70.5]], [[11, 78.5], [16, 80.3], [27, 80], [22, 77.5], [16, 76.6]],
  [[130.9, 34], [132.5, 35.5], [136, 36.2], [137, 37], [140, 40.5], [141.5, 41.4], [142, 39.5], [141, 38], [140.8, 36], [139.8, 35], [138.8, 34.6], [136.8, 34.3], [135.2, 33.6], [133, 34]], [[129.6, 33.3], [130.9, 34], [131.9, 33], [131.2, 31.4], [130.2, 31.3]], [[132.5, 34.2], [134.6, 34.2], [134.3, 33.2], [133, 32.8]],
  [[140, 41.5], [141, 43.3], [141.7, 45.4], [143.5, 44.2], [145.5, 43.3], [143.3, 42], [141, 41.8]], [[142, 46], [143.5, 49], [142.5, 54.2], [142, 51], [141.8, 48]], [[120.2, 22.5], [121.9, 25.2], [121.5, 23], [120.8, 21.9]], [[108.6, 19.2], [110.5, 20.1], [111, 19.6], [109.6, 18.2]],
  [[120, 18.5], [122.3, 18.5], [122, 16], [124, 13.5], [121, 13.8], [120.6, 14.5], [119.8, 16.3]], [[122, 8], [126, 9.5], [126.5, 7], [125.5, 5.6], [123.5, 7.4]], [[122, 11.5], [124.5, 12.5], [125.6, 11], [123, 9.6]],
  [[109, 1.5], [111, 2.5], [113.5, 3.2], [115.5, 5], [117, 7], [119.2, 5.3], [118, 4.4], [118.5, 1], [117.5, 0], [116.5, -2.5], [116, -4], [113, -3.3], [110.2, -2.9], [110, -1], [109.2, 0.3]],
  [[95.3, 5.6], [97.5, 5.2], [100.4, 2.2], [103.5, -0.5], [106, -3.2], [105.8, -5.8], [104.5, -5.9], [102, -4], [100.5, -1.5], [98.7, 1.7], [96.4, 3.8]], [[105.3, -6.8], [106.5, -6], [108.5, -6.6], [111, -6.5], [112.6, -6.9], [114.5, -7.7], [114.4, -8.7], [111, -8.2], [108, -7.8], [106, -7.4]],
  [[119.5, -5.5], [120.5, -1], [119.8, 0.5], [121, 1.3], [124.5, 1.5], [121.5, 0.5], [123.3, -0.9], [121.3, -1.8], [122.2, -4.8], [120.5, -5.6]],
  [[131, -1.3], [134, -1], [137, -1.6], [141, -2.6], [145.5, -4.5], [147.5, -6.2], [147.2, -8], [150, -10.4], [146, -8.4], [143.5, -9], [141, -9.1], [138.5, -8.3], [137.5, -5], [135, -4.2], [132.5, -3]], [[79.8, 6.5], [80, 9.5], [81, 8.5], [81.8, 7], [81, 6]],
  [[113.5, -22], [114, -26.5], [115, -30], [115.6, -33.6], [117.8, -35.1], [123, -33.9], [126, -32.3], [131, -31.5], [134, -32.9], [136, -34.5], [138, -35.6], [138.5, -34.2], [140.5, -38], [143.5, -38.8], [146.3, -39.1], [148, -37.8], [150, -36], [151.2, -34], [153, -31.5], [153.6, -28.5], [153, -25.4], [151, -23], [149.5, -22], [146.5, -19], [145.5, -15], [143.5, -14], [142.5, -10.7], [141.5, -13], [141.6, -17], [139.5, -17.5], [136.8, -15.8], [136.5, -12], [132.5, -11.5], [130.5, -12.5], [129.5, -14.9], [127, -14], [125, -15], [123, -16.5], [122, -18.5], [119, -20], [116.5, -20.7]],
  [[144.7, -40.7], [148.3, -40.9], [148, -43.2], [146, -43.6]], [[172.7, -34.5], [174.5, -36], [178.5, -37.7], [177, -39.3], [176, -41.3], [174.7, -41.3], [175.2, -40], [173.8, -39.2], [174.6, -37]], [[172.7, -40.5], [174.2, -41.7], [173, -43.8], [171.2, -44.5], [169, -46.6], [166.5, -46], [168, -44], [170.5, -43], [172, -41.5]],
  [[-85, 21.8], [-82, 23.1], [-80, 23], [-77, 21.5], [-74.2, 20.2], [-77.5, 19.9], [-78, 20.7], [-81, 21.6], [-84.9, 21.3]], [[-74.4, 19.8], [-72.8, 19.9], [-70, 19.7], [-68.4, 18.6], [-70, 18.2], [-71.5, 17.6], [-74.4, 18.3]], [[-78.3, 18.4], [-76.2, 18.4], [-76.8, 17.9], [-78.3, 18.2]], [[-67.2, 18.5], [-65.6, 18.4], [-65.8, 18], [-67.2, 18]],
  [[-180, -90], [-180, -77], [-150, -76], [-120, -73], [-90, -72], [-75, -70], [-62, -64.5], [-57, -63.3], [-60, -66], [-65, -70], [-60, -75], [-45, -78], [-30, -76], [-20, -71], [0, -70], [20, -69.5], [40, -69], [60, -67], [80, -67], [100, -66], [120, -66.5], [140, -66.5], [160, -70], [170, -72], [180, -77], [180, -90]],
  [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7], [12.5, 37.6]], [[8.4, 41], [9.8, 41], [9.6, 39.1], [8.4, 38.9]], [[8.6, 43], [9.5, 42.9], [9.4, 41.4], [8.7, 41.6]], [[23.5, 35.6], [26.3, 35.3], [24, 34.9]], [[32.3, 35.1], [34.6, 35.6], [33.9, 34.6]],
];
const ASCENT_WATER = [
  [[-5.6, 36.0], [-4.5, 36.7], [-2, 36.8], [-0.5, 38.5], [0.2, 39.6], [0.9, 41], [3.2, 42], [3.2, 43.3], [4.8, 43.4], [6.5, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.5, 42.9], [12.3, 41.7], [14, 40.8], [15.6, 40], [15.7, 38], [16.1, 38], [17, 39], [18.5, 40.2], [16.9, 41.1], [15.9, 41.9], [13.8, 43.5], [12.3, 44.4], [12.4, 45.4], [13.7, 45.6], [14.5, 45.2], [16, 43.5], [18.5, 42.4], [19.4, 41.8], [19.4, 40.5], [21, 39], [21.7, 36.8], [22.5, 36.5], [23.2, 37.8], [22.8, 39.8], [24, 40.6], [26, 40.8], [26.2, 40.2], [26.7, 39.5], [26.3, 38.3], [27.3, 37], [29.5, 36.3], [32.5, 36.1], [34.6, 36.8], [36, 36.8], [35.9, 34.6], [35, 32.5], [34.2, 31.2], [32.3, 31.3], [29, 30.9], [25, 31.7], [23, 32.6], [20.5, 32.2], [19.5, 30.4], [15, 32.2], [11.5, 33], [10, 34], [11, 35.3], [10, 37.2], [3, 36.8], [-2, 35.1], [-5.4, 35.8]],
  [[28, 41.2], [28.5, 43.5], [29.7, 45.2], [30.8, 46.5], [33.5, 46], [32.5, 45.4], [33.5, 44.5], [36.5, 45.3], [38, 47], [39.5, 47], [38.5, 46], [41.5, 42], [39.5, 41], [36, 41.7], [33.5, 42], [31, 41.1], [29, 41.2]],
  [[47, 45], [49.5, 46.5], [53, 46.8], [53, 45], [51.5, 44], [52.7, 41.8], [53.8, 40.5], [54, 37.5], [50.5, 37], [49, 38], [49.5, 40.3], [47.6, 42.5]],
  [[10.8, 54.4], [12.5, 54.5], [14, 54], [18, 54.7], [21, 55.2], [21, 56.8], [24.4, 57.2], [23.5, 59.2], [28, 59.4], [29.8, 60.1], [25, 60.3], [22.5, 60.2], [21.4, 60.8], [21.5, 62], [24.5, 64.5], [25.5, 65.5], [22, 65.7], [21, 64.5], [17.3, 62.5], [17.5, 60.6], [18.5, 59.3], [16.6, 57.8], [16.4, 56.6], [14.5, 56.2], [12.8, 55.9], [12.5, 55.4], [10.8, 55.2]],
  [[-92, 46.7], [-89, 48.3], [-86, 48.8], [-84.5, 47.4], [-84.6, 46.5], [-87, 46.5]], [[-87.8, 41.7], [-87.9, 44.5], [-86, 45.9], [-85, 45.8], [-86.3, 43.5], [-86.5, 42]], [[-84.5, 45.9], [-82.5, 45.3], [-80, 44.5], [-81.7, 43.3], [-82.5, 44]], [[-83.4, 41.7], [-79, 42.9], [-79.5, 42.4], [-82, 41.5]], [[-79.8, 43.3], [-76.2, 44.1], [-76.4, 43.4], [-78, 43.3]],
];
const ASCENT_CITIES = [[19.43, -99.13, 3.2], [20.67, -103.35, 1.5], [25.67, -100.31, 1.6], [19.04, -98.2, 1.1], [32.5, -117, 1.1], [21.12, -101.68, 0.8], [31.7, -106.4, 0.9], [20.97, -89.62, 0.6], [21.16, -86.85, 0.5], [19.2, -96.13, 0.6], [16.85, -99.88, 0.5], [24.8, -107.4, 0.5], [29.1, -110.95, 0.6], [28.63, -106.07, 0.6], [20.59, -100.39, 0.8], [22.15, -100.98, 0.7], [19.29, -99.65, 0.9], [17.06, -96.72, 0.4], [16.75, -93.12, 0.4], [17.99, -92.93, 0.4], [22.25, -97.86, 0.5], [19.7, -101.19, 0.6], [21.88, -102.29, 0.6], [23.24, -106.41, 0.4], [25.42, -101, 0.6], [25.54, -103.4, 0.6], [32.62, -115.45, 0.6], [24.14, -110.31, 0.3], [18.92, -99.23, 0.6], [20.1, -98.75, 0.5],
  [34.05, -118.24, 2.2], [37.77, -122.42, 1.4], [32.7, -117.16, 1], [33.45, -112.07, 1.3], [36.17, -115.14, 1], [32.78, -96.8, 1.6], [29.76, -95.37, 1.7], [29.42, -98.49, 1], [30.27, -97.74, 0.9], [31.76, -106.49, 0.6], [39.74, -104.99, 1.1], [41.88, -87.63, 2], [40.71, -74, 2.5], [42.36, -71.06, 1.2], [39.95, -75.17, 1.3], [38.9, -77.04, 1.3], [33.75, -84.39, 1.3], [25.76, -80.19, 1.4], [27.95, -82.46, 0.9], [28.54, -81.38, 0.8], [29.95, -90.07, 0.7], [47.6, -122.33, 1.1], [45.5, -122.68, 0.8], [44.98, -93.27, 1], [38.63, -90.2, 0.9], [39.1, -94.58, 0.8], [42.33, -83.05, 1.2], [41.5, -81.69, 0.8], [40.44, -80, 0.7], [35.23, -80.84, 0.8], [36.16, -86.78, 0.7], [35.15, -90.05, 0.6], [40.76, -111.89, 0.7], [35.08, -106.65, 0.5], [35.47, -97.52, 0.6], [43.65, -79.38, 1.5], [45.5, -73.57, 1.1], [49.28, -123.12, 0.9], [51.05, -114.07, 0.6], [53.55, -113.49, 0.5], [49.9, -97.14, 0.4], [45.42, -75.7, 0.5], [46.81, -71.21, 0.4],
  [14.63, -90.51, 0.8], [13.69, -89.22, 0.6], [14.07, -87.19, 0.4], [12.11, -86.24, 0.4], [9.93, -84.08, 0.5], [8.98, -79.52, 0.6], [23.11, -82.37, 0.6], [18.49, -69.93, 0.7], [18.47, -66.1, 0.6], [17.97, -76.79, 0.3], [18.59, -72.31, 0.3],
  [4.71, -74.07, 1.4], [6.24, -75.58, 0.8], [3.45, -76.53, 0.6], [10.48, -66.9, 1], [10.65, -71.64, 0.5], [-0.18, -78.47, 0.6], [-2.17, -79.92, 0.6], [-12.05, -77.04, 1.4], [-33.45, -70.67, 1.3], [-34.6, -58.38, 2], [-34.9, -56.16, 0.6], [-23.55, -46.63, 2.4], [-22.91, -43.17, 1.8], [-19.92, -43.94, 1], [-15.79, -47.88, 0.8], [-12.97, -38.5, 0.8], [-8.05, -34.9, 0.8], [-3.73, -38.52, 0.8], [-1.46, -48.5, 0.5], [-3.12, -60.02, 0.5], [-30.03, -51.23, 0.9], [-25.43, -49.27, 0.8], [-31.42, -64.18, 0.7], [-32.95, -60.65, 0.5], [-16.5, -68.15, 0.5], [-25.26, -57.58, 0.5],
  [51.5, -0.12, 2], [48.86, 2.35, 2], [40.42, -3.7, 1.4], [41.39, 2.17, 1], [38.72, -9.14, 0.8], [41.9, 12.5, 1.1], [45.46, 9.19, 1.1], [52.52, 13.4, 1.2], [52.37, 4.9, 1], [50.85, 4.35, 0.9], [51.45, 7, 1.5], [48.14, 11.58, 0.8], [48.2, 16.37, 0.8], [52.23, 21.01, 0.8], [55.76, 37.62, 1.8], [41.01, 28.98, 1.6], [37.98, 23.73, 0.8], [30.04, 31.24, 1.8], [6.52, 3.38, 1], [33.57, -7.59, 0.8], [36.75, 3.06, 0.7], [36.8, 10.18, 0.5], [-26.2, 28.05, 1.2], [-33.92, 18.42, 0.7], [-1.29, 36.82, 0.5], [-4.44, 15.27, 0.5], [14.72, -17.47, 0.4], [5.6, -0.19, 0.5], [5.36, -4, 0.5], [24.71, 46.68, 1], [25.2, 55.27, 1], [35.69, 51.39, 1.2], [33.31, 44.36, 0.7], [28.61, 77.21, 2], [19.08, 72.88, 1.8], [22.57, 88.36, 1.4], [12.97, 77.59, 1], [13.08, 80.27, 1], [24.86, 67, 1.2], [31.55, 74.34, 1], [23.81, 90.41, 1.2], [13.76, 100.5, 1.3], [39.9, 116.4, 2], [31.23, 121.47, 2.2], [23.13, 113.26, 2], [22.32, 114.17, 1.2], [37.57, 126.98, 1.8], [35.68, 139.69, 2.6], [34.69, 135.5, 1.6], [14.6, 120.98, 1.2], [-6.2, 106.85, 1.6], [1.35, 103.82, 0.9], [-33.87, 151.21, 1], [-37.81, 144.96, 1], [25.03, 121.57, 1.1], [29.56, 106.55, 1.2], [30.59, 114.31, 1.1], [30.57, 104.07, 1.1], [34.34, 108.94, 0.9], [45.8, 126.53, 0.7], [10.82, 106.63, 1], [21.03, 105.85, 0.8], [3.14, 101.69, 0.8], [21.3, -157.86, 0.4], [61.2, -149.9, 0.3], [-36.85, 174.76, 0.5]];
// populated regions sprinkled with small towns: [lon0, lon1, lat0, lat1, count]
const ASCENT_POP = [[-100, -70, 28, 46, 5200], [-123, -100, 30, 49, 1400], [-106, -95, 17, 24, 2600], [-105, -88, 14, 22, 900], [-92, -78, 7, 16, 500], [-80, -60, -2, 12, 600], [-52, -35, -30, -5, 1800], [-65, -55, -38, -27, 600], [-80, -70, -15, 5, 400], [-10, 30, 36, 58, 6000], [30, 50, 42, 58, 1500], [70, 90, 10, 32, 5000], [100, 122, 22, 41, 5500], [126, 142, 31, 40, 1500], [28, 33, 22, 31, 400], [-10, 10, 4, 14, 900], [-118, -110, 31, 34.5, 300]];
function ascentEarthTex() { const Wt = 4096, Ht = 2048, P = (lon, lat) => [(lon + 180) / 360 * Wt, (90 - lat) / 180 * Ht];
  const mk = () => { const c = document.createElement('canvas'); c.width = Wt; c.height = Ht; return c; };
  const poly = (x, pts) => { x.beginPath(); pts.forEach(([lo, la], i) => { const [px, py] = P(lo, la); if (i) x.lineTo(px, py); else x.moveTo(px, py); }); x.closePath(); x.fill(); };
  const lm = mk(), lx = lm.getContext('2d'); lx.fillStyle = '#000'; lx.fillRect(0, 0, Wt, Ht); lx.fillStyle = '#fff'; ASCENT_LAND.forEach((p) => poly(lx, p)); lx.fillStyle = '#000'; ASCENT_WATER.forEach((p) => poly(lx, p));
  const bl = mk(), bx = bl.getContext('2d'); bx.filter = 'blur(10px)'; bx.drawImage(lm, 0, 0); bx.filter = 'none';
  // city lights: glowing cores, scattered suburbs, small towns over the populated regions, faint roads between neighbours
  const li = mk(), x = li.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, Wt, Ht); x.globalCompositeOperation = 'lighter'; const R = RNG('ascLights'), LD = lx.getImageData(0, 0, Wt, Ht).data;
  const isLand = (px, py) => { const i = ((Math.floor(py) * Wt + Math.floor(px)) * 4); return LD[i] > 128; };
  x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = 1; ASCENT_CITIES.forEach(([la, lo], i) => ASCENT_CITIES.forEach(([lb, lob], j) => { if (j <= i) return; const d = Math.hypot(la - lb, (lo - lob) * Math.cos(la * DEG)); if (d < 7 && Math.abs(lo - lob) < 90) { const [x0, y0] = P(lo, la), [x1, y1] = P(lob, lb); x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); } }));
  ASCENT_CITIES.forEach(([la, lo, w]) => { const [cx, cy] = P(lo, la), sx = 1 / Math.cos(la * DEG), r = 3 + 3.5 * Math.sqrt(w); const g = x.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6); g.addColorStop(0, `rgba(255,255,255,${Math.min(1, 0.55 + 0.2 * w)})`); g.addColorStop(0.4, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(cx - r * 1.6 * sx, cy - r * 1.6, r * 3.2 * sx, r * 3.2);
    for (let k = 0; k < 90 * w; k++) { const a = R.r(0, TAU), d = Math.abs(ascentGN(R)) * r * 2.2, px = cx + Math.cos(a) * d * sx, py = cy + Math.sin(a) * d; if (!isLand(px, py)) continue; x.fillStyle = `rgba(255,255,255,${R.r(0.25, 0.8)})`; x.fillRect(px, py, R.r(1, 2.2), R.r(1, 2.2)); } });
  ASCENT_POP.forEach(([l0, l1, a0, a1, n]) => { for (let k = 0; k < n; k++) { const [px, py] = P(R.r(l0, l1), R.r(a0, a1)); if (!isLand(px, py)) continue; x.fillStyle = `rgba(255,255,255,${R.r(0.12, 0.55)})`; x.fillRect(px, py, R.r(1, 2), R.r(1, 2)); } });
  // land colours (biomes) on a coarser grid, then upscaled
  const cw = 1024, ch = 512, cc = document.createElement('canvas'); cc.width = cw; cc.height = ch; const cx2 = cc.getContext('2d'), im = cx2.createImageData(cw, ch);
  const E = (lo, la, l0, l1, a0, a1) => { const u = (lo - (l0 + l1) / 2) / ((l1 - l0) / 2), v = (la - (a0 + a1) / 2) / ((a1 - a0) / 2); return clamp(1.3 - Math.hypot(u, v)); };
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const lo = i / cw * 360 - 180, la = 90 - j / ch * 180, al = Math.abs(la), n = ascentFbm(i / 24, j / 24, 4), n2 = ascentFbm(i / 6 + 40, j / 6, 3);
    let c = [0.10, 0.15, 0.06];                                                                                          // temperate green
    if (al < 14) c = [0.045, 0.11, 0.035]; else if (al < 24) c = [0.16, 0.17, 0.08];
    const des = Math.max(E(lo, la, -16, 35, 15, 33), E(lo, la, 35, 58, 14, 32), E(lo, la, 50, 72, 24, 36), E(lo, la, 68, 77, 23, 30), E(lo, la, 74, 118, 36, 48) * 0.8, E(lo, la, 118, 146, -33, -18), E(lo, la, 11, 26, -29, -17) * 0.8, E(lo, la, -73, -67, -28, -15), E(lo, la, -72, -64, -51, -38) * 0.7, E(lo, la, -118, -101, 23, 37) * 0.9, E(lo, la, -121, -110, 36, 44) * 0.7, E(lo, la, 40, 51, 2, 11) * 0.8);
    const jun = Math.max(E(lo, la, -76, -47, -13, 3), E(lo, la, 9, 31, -6, 6), E(lo, la, 95, 152, -9, 8), E(lo, la, -95, -86, 14, 22) * 0.8);
    const tun = clamp((al - 60) / 10), ice = clamp((al - 73) / 4) + (la < -60 ? 1 : 0) + (lo > -60 && lo < -15 && la > 62 ? clamp((la - 62) / 3) : 0);
    const mix3 = (a, b, k) => a.map((v, q) => v + (b[q] - v) * k);
    c = mix3(c, [0.55 + 0.1 * n, 0.43 + 0.06 * n, 0.27], clamp(des * 1.4 - 0.15 + (n - 0.5) * 0.6)); c = mix3(c, [0.03, 0.09, 0.03], clamp(jun * 1.3 - 0.1)); c = mix3(c, [0.24, 0.22, 0.18], tun); c = mix3(c, [0.9, 0.92, 0.96], clamp(ice));
    const k = 0.75 + 0.5 * n2, o = (j * cw + i) * 4; im.data[o] = 255 * Math.min(1, c[0] * k * 1.6); im.data[o + 1] = 255 * Math.min(1, c[1] * k * 1.6); im.data[o + 2] = 255 * Math.min(1, c[2] * k * 1.6); im.data[o + 3] = 255; }
  cx2.putImageData(im, 0, 0); const col = mk(), ox = col.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(cc, 0, 0, Wt, Ht);
  // aux: R = land, G = coast blur, B = lights
  const aux = mk(), ax = aux.getContext('2d'), A = ax.createImageData(Wt, Ht), BL = bx.getImageData(0, 0, Wt, Ht).data, LI = x.getImageData(0, 0, Wt, Ht).data;
  for (let i = 0; i < Wt * Ht; i++) { const o = i * 4; A.data[o] = LD[o]; A.data[o + 1] = BL[o]; A.data[o + 2] = LI[o]; A.data[o + 3] = 255; } ax.putImageData(A, 0, 0);
  const T = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping; return t; };
  return { col: T(col, true), aux: T(aux, false) }; }
const ASCENT_EARTH_FS = ASCENT_NOISE + `
uniform sampler2D uCol, uAux; uniform vec3 uSun, uC; uniform mat3 uM; uniform float uTime, uRE; varying vec3 vWp;
void main(){
  vec3 n = normalize(vWp - uC), V = normalize(cameraPosition - vWp), e = uM * n; float lat = asin(clamp(e.z, -1.0, 1.0)), lon = atan(e.y, e.x);
  vec2 uv = vec2(lon / 6.2831853 + 0.5, lat / 3.14159265 + 0.5), dx = dFdx(uv), dy = dFdy(uv); dx.x -= floor(dx.x + 0.5); dy.x -= floor(dy.x + 0.5);
  float px = length(fwidth(vWp)) / uRE, det = 1.0 - smoothstep(0.0004, 0.004, px);
  vec2 wq = (vec2(aF3(e * 60.0, 4), aF3(e * 60.0 + 7.0, 4)) - 0.5) * 0.0018 * det; vec4 A = textureGrad(uAux, uv + wq, dx, dy); vec3 Lc = textureGrad(uCol, uv + wq, dx, dy).rgb;
  float landN = A.r + (aF3(e * 220.0, 5) - 0.5) * 0.5 * det, land = smoothstep(0.42, 0.58, landN);
  Lc *= 0.75 + 0.5 * aF3(e * 140.0, 5) * det + 0.25 * (1.0 - det); Lc *= 0.85 + 0.3 * aF3(e * 1500.0, 4) * det;
  vec3 ocean = mix(vec3(0.004, 0.022, 0.06), vec3(0.01, 0.075, 0.11), smoothstep(0.1, 0.5, A.g));
  float ndl = dot(n, uSun), day = smoothstep(-0.06, 0.1, ndl);
  vec3 sunC = mix(vec3(1.0, 0.36, 0.12), vec3(1.0, 0.96, 0.9), smoothstep(0.0, 0.35, ndl));
  vec3 surf = mix(ocean, Lc, land), col = surf * sunC * max(ndl, 0.0) * 2.3 + surf * 0.012;
  vec3 Hh = normalize(uSun + V); float gl = pow(max(dot(n, Hh), 0.0), 220.0) * 6.0 + pow(max(dot(n, Hh), 0.0), 18.0) * 0.12; col += sunC * gl * (1.0 - land) * step(0.0, ndl) * smoothstep(-0.02, 0.1, ndl);
  // clouds: warped fbm, banded by latitude, a clear sky over Mexico City
  vec3 cq = e * 3.0 + vec3(uTime * 0.004, 0.0, 0.0); float w = aF3(cq * 1.3, 4); float oc = 8.0 - 3.0 * smoothstep(0.0003, 0.003, px); vec3 ca = vec3(cq.x, cq.y, cq.z * 2.4); float w2 = aF3(ca * 0.9 + 3.0, 3); float cl = 0.5 * aF3(ca * 1.5 + w * 1.6 + w2 * 1.2, int(oc)) + 0.3 * aF3(cq * 6.0 + w * 2.5, int(oc) - 1) + 0.2 * aF3(cq * 22.0 + w2 * 4.0, int(oc) - 2);
  float la = abs(degrees(lat)), band = 0.08 * exp(-pow((la - 6.0) / 7.0, 2.0)) + 0.1 * smoothstep(38.0, 58.0, la) - 0.07 * exp(-pow((la - 24.0) / 9.0, 2.0));
  float cov = smoothstep(0.5 - band, 0.6 - band, cl) * smoothstep(0.035, 0.09, length(n - vec3(0.0, 1.0, 0.0)));
  vec3 cloudC = vec3(1.0) * sunC * (max(ndl, 0.0) * 1.9 + 0.02) + vec3(0.02, 0.03, 0.05) * (1.0 - day);
  float thk = smoothstep(0.5 - band, 0.7 - band, cl); col = mix(col, cloudC * (0.7 + 0.4 * thk), cov * (0.35 + 0.6 * thk));
  // night lights: the texture's towns, finer speckle when close, orange-white
  float Ln = A.b; vec2 sq = vec2(lon * cos(lat), lat) * 4000.0, fq = fract(sq) - 0.5; float sp = step(0.55, aH2(floor(sq))) * (0.5 + aH2(floor(sq) + 3.0)) * exp(-dot(fq, fq) * 30.0) * 5.0; float lights = Ln * mix(1.0, sp, det * smoothstep(0.0, 0.3, 1.0 - length(fwidth(sq))));
  float mx = length(n - vec3(0.0, 1.0, 0.0)) * uRE; lights += (1.0 - smoothstep(4.0, 34.0, mx)) * (0.6 + 1.6 * step(0.5, aH2(floor(sq * 4.0))) * det) * 1.2;
  col += vec3(1.0, 0.66, 0.32) * lights * (1.0 - day) * (1.0 - cov * 0.85) * 1.8 * land;
  // the air seen from above: blue haze toward the limb on the day side, a red band along the terminator
  float mu = max(dot(n, V), 0.0); col += vec3(0.16, 0.36, 0.9) * pow(1.0 - mu, 3.0) * smoothstep(-0.2, 0.35, ndl) * 0.2;
  col += vec3(1.0, 0.35, 0.1) * exp(-pow(ndl / 0.06, 2.0)) * (0.06 + 0.4 * pow(1.0 - mu, 2.0));
  gl_FragColor = vec4(col, 1.0);` + ASCENT_END + '}';
const ASCENT_ATMO_FS = `uniform vec3 uSun, uC; uniform float uRE, uRA, uI; varying vec3 vWp;
vec2 rs(vec3 ro, vec3 rd, float R){ float b = dot(ro, rd), c = dot(ro, ro) - R * R, h = b * b - c; if (h < 0.0) return vec2(1e9, -1e9); h = sqrt(h); return vec2(-b - h, -b + h); }
void main(){ vec3 ro = cameraPosition - uC, rd = normalize(vWp - cameraPosition); vec2 ta = rs(ro, rd, uRA); if (ta.y < 0.0) discard; vec2 tp = rs(ro, rd, uRE);
  float t0 = max(ta.x, 0.0), t1 = ta.y; if (tp.x > 0.0) t1 = min(t1, tp.x); float ds = (t1 - t0) / 24.0;
  vec3 bR = vec3(5.8e-3, 13.5e-3, 33.1e-3); float bM = 1.5e-3, mu = dot(rd, uSun), pR = 0.0597 * (1.0 + mu * mu), g = 0.76, pM = 0.0796 * (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * mu, 1.5);
  vec3 sum = vec3(0.0); float oR = 0.0, oM = 0.0;
  for (int i = 0; i < 24; i++) { vec3 p = ro + rd * (t0 + (float(i) + 0.5) * ds); float r = length(p), h = max(r - uRE, 0.0), dR = exp(-h / 8.0), dM = exp(-h / 1.4);
    oR += dR * ds; oM += dM * ds; vec3 up = p / r; float cz = dot(up, uSun), b = dot(p, uSun), ca = sqrt(max(r * r - b * b, 0.0)), lit = b > 0.0 ? 1.0 : smoothstep(uRE - 2.0, uRE + 12.0, ca);
    float am = cz > -0.05 ? min(40.0, 1.0 / (max(cz, 0.0) + 0.15 * pow(max(93.885 - degrees(acos(clamp(cz, -1.0, 1.0))), 0.6), -1.253))) : 40.0;
    vec3 tr = exp(-(bR * (oR + dR * 8.0 * am) + bM * 1.1 * (oM + dM * 1.4 * am))); sum += lit * tr * (bR * dR * pR + bM * dM * pM) * ds; }
  if (tp.x > 0.0) sum *= 0.38; gl_FragColor = vec4(sum * uI, 1.0);` + ASCENT_END + '}';

// =====================================================================
//  THE SPACE STAGE
// =====================================================================
function ascentSpace() { return once('ascentSpace', () => { const RE = ASCENT_RE, st = makeStage({ fov: 50, far: 4e6, hemi: 0.05, sky: 0x8090b0, ground: 0x000000, key: 3.4, keyCol: '#fff4e6', sunDist: 50 });
  st.key.castShadow = false; st.setSun(ASCENT_SUN, new THREE.Vector3(0, 400, 0)); st.cam.near = 0.05; const S = { st, RE }, C0 = new THREE.Vector3(0, -RE, 0);
  // Mexico City (19.43 N, 99.13 W) at the top: world → Earth-fixed
  const f0 = 19.43 * DEG, l0 = -99.13 * DEG, U = new THREE.Vector3(Math.cos(f0) * Math.cos(l0), Math.cos(f0) * Math.sin(l0), Math.sin(f0)), E = new THREE.Vector3(-Math.sin(l0), Math.cos(l0), 0), N = new THREE.Vector3(-Math.sin(f0) * Math.cos(l0), -Math.sin(f0) * Math.sin(l0), Math.cos(f0));
  const M = new THREE.Matrix3().set(E.x, U.x, -N.x, E.y, U.y, -N.y, E.z, U.z, -N.z), T = ascentEarthTex();
  S.U = { uCol: { value: T.col }, uAux: { value: T.aux }, uSun: { value: ASCENT_SUN.clone() }, uC: { value: C0 }, uM: { value: M }, uTime: { value: 0 }, uRE: { value: RE }, uRA: { value: RE + 110 }, uI: { value: 9 } };
  const gV = 'varying vec3 vWp; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
  S.atmo = new THREE.Mesh(new THREE.SphereGeometry(RE + 110, 192, 96), new THREE.ShaderMaterial({ uniforms: S.U, vertexShader: gV, fragmentShader: ASCENT_ATMO_FS, side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
  S.atmo.position.copy(C0); S.atmo.renderOrder = -5; S.atmo.frustumCulled = false; st.scene.add(S.atmo);
  S.earth = new THREE.Mesh(new THREE.SphereGeometry(RE, 512, 256), new THREE.ShaderMaterial({ uniforms: S.U, vertexShader: gV, fragmentShader: ASCENT_EARTH_FS, extensions: { derivatives: true } }));
  S.earth.position.copy(C0); S.earth.frustumCulled = false; st.scene.add(S.earth);
  // stars (they ride with the camera)
  { const R = RNG('ascStars'), n = 7000, P = new Float32Array(n * 3), Sz = new Float32Array(n), Cc = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const v = new THREE.Vector3(ascentGN(R), ascentGN(R), ascentGN(R)).normalize(); const band = Math.exp(-((v.y * 0.8 + v.x * 0.5) ** 2) / 0.04); P.set([v.x * 2e6, v.y * 2e6, v.z * 2e6], i * 3); const b = Math.pow(R.f(), 6); Sz[i] = 1.2 + b * 3.5;
      const c = R.f() < 0.15 ? [1, 0.82, 0.62] : R.f() < 0.3 ? [0.7, 0.8, 1] : [1, 1, 1], k = 0.25 + 1.4 * b + 0.2 * band; Cc.set([c[0] * k, c[1] * k, c[2] * k], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aS', new THREE.BufferAttribute(Sz, 1)); g.setAttribute('aC', new THREE.BufferAttribute(Cc, 3));
    S.stars = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: 'attribute float aS; attribute vec3 aC; varying vec3 vC; void main(){ vC = aC; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aS * 2.0; }',
      fragmentShader: 'uniform float uA; varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; gl_FragColor = vec4(vC * uA * exp(-dot(q, q) * 14.0), 1.0); }' }));
    S.stars.frustumCulled = false; S.stars.renderOrder = -8; st.scene.add(S.stars); }
  ascentISS(st, S); return S; }); }
// the International Space Station (metres → km): the truss, eight golden solar wings, radiators, the modules
function ascentISS(st, S) { const g = new THREE.Group(), al = STDm({ color: '#d8d8dc', roughness: 0.45, metalness: 0.6 }), wh = STDm({ color: '#f0f0ee', roughness: 0.6, metalness: 0.1 });
  const panelT = g3Tex((x, w, h) => { x.fillStyle = '#3a2410'; x.fillRect(0, 0, w, h); for (let j = 0; j < 32; j++) for (let i = 0; i < 4; i++) { const R = RNG('cell', i, j); x.fillStyle = `rgb(${150 + R.r(-20, 30)},${92 + R.r(-15, 20)},${40 + R.r(-10, 15)})`; x.fillRect(i * w / 4 + 2, j * h / 32 + 1, w / 4 - 4, h / 32 - 2); }
    x.fillStyle = '#c8b090'; x.fillRect(w / 2 - 2, 0, 4, h); }, 128, 512);
  const pm = STDm({ map: panelT, roughness: 0.35, metalness: 0.65, side: THREE.DoubleSide, emissive: '#ff9040', emissiveIntensity: 0.05 });
  const trussT = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#e0e0e4'; x.lineWidth = 3; x.strokeRect(1, 1, w - 2, h - 2); for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo((i + 1) * w / 8, h); x.moveTo(i * w / 8, h); x.lineTo((i + 1) * w / 8, 0); x.stroke(); } }, 256, 32);
  wrap(trussT, 14, 1); const tm = STDm({ map: trussT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.6, roughness: 0.4 });
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
  box(109, 4.5, 4.5, tm, 0, 0, 0); box(109, 1.2, 1.2, al, 0, 0, 0);
  [[-52, 1], [-40, 1], [40, 1], [52, 1]].forEach(([x]) => { [1, -1].forEach((sd) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 34), pm); p.position.set(x, 0, sd * 20.5); p.rotation.x = -Math.PI / 2 + 0.35; g.add(p);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 35, 6).rotateX(Math.PI / 2), al); mast.position.set(x, 0.3, sd * 20.5); g.add(mast); }); box(3, 3, 3, al, x, 0, 0); });
  [-14, 14].forEach((x) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 22), wh); r.position.set(x, -12, 2); r.rotation.y = 0.2; g.add(r); });
  const cyl = (r, L, x, y, z, ax = 'z', m = wh) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 20), m); if (ax === 'z') c.rotation.x = Math.PI / 2; if (ax === 'x') c.rotation.z = Math.PI / 2; c.position.set(x, y, z); g.add(c); return c; };
  cyl(2.1, 8.5, 0, -3, -5); cyl(2.2, 8.5, 0, -3, 3.5); cyl(2.2, 7, 0, -3, 11); cyl(2.1, 7, 0, -3, 18.5); cyl(2.2, 13, 0, -3, 28.5); cyl(2.1, 13, 0, -3, 41.5);
  cyl(2.2, 7, 0, -3, -11); cyl(2.2, 8, -7.5, -3, -11, 'x'); cyl(2.2, 11, 9, -3, -11, 'x'); cyl(1.6, 4, 0, -7, -11, 'y');
  [41.5].forEach((z) => [1, -1].forEach((sd) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), pm); p.position.set(sd * 7.5, -3, z); g.add(p); }));
  g.scale.setScalar(0.001); g.visible = false; st.scene.add(g); S.iss = g; }

// space (29–33) and earth (33–38): one continuous camera around the globe
const ASCENT_SPACE_K = [[29.0, -40, 135, 560, 0, 70, 54], [30.4, -34, 190, 590, 0, 120, 52], [31.4, -20, 330, 600, 0, 280, 50], [32.1, -10, 392, 610, 0, 380, 48], [32.7, -4, 406, 620, 0, 400, 48], [33.0, -2, 470, 680, 0, 420, 50]];
function ascentSpaceCam(S, t) { const cam = S.st.cam, RE = S.RE;
  if (t < 33) { const [x, y, z, tx, ty, fv] = ascentPath(ASCENT_SPACE_K, t); camLook(cam, x, y, z, tx, ty, 0); fov(S.st, fv); handheld(cam, t, 0.35, 7); cam.near = 0.05; cam.far = 4e6; cam.updateProjectionMatrix(); return cam; }
  // the pull-back: distance from the Earth's centre grows with the column; the view tilts down onto Mexico
  const u = ascentSS(33, 37.9, t), L = ascentSmooth(t) / 1000, p33 = new THREE.Vector3(...ascentPath(ASCENT_SPACE_K, 33).slice(0, 3)), r33 = p33.clone().add(new THREE.Vector3(0, RE, 0));
  const Rc = lerp(r33.length(), 9000 + 1.4 * L, ascentSS(33, 34.2, t)) * (1 + 0.03 * Math.sin((t - 33) * 0.9) * ascentSS(33, 34, t)), th = lerp(Math.atan2(r33.z, r33.y), 50 * DEG, ascentSS(33, 37.4, t)), ph = lerp(Math.atan2(r33.x, r33.z), -14 * DEG, ascentSS(33, 37.9, t));
  const P = new THREE.Vector3(Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)).multiplyScalar(Rc).add(new THREE.Vector3(0, -RE, 0));
  const ty = lerp(420, 0.5 * L - 2200, ascentSS(33, 34.5, t)); camLook(cam, P.x, P.y, P.z, 0, ty, 0); fov(S.st, lerp(50, 60, u)); handheld(cam, t, 0.25, 7); cam.near = Math.max(0.05, Rc * 0.002); cam.far = 4e6; cam.updateProjectionMatrix(); return cam; }
function ascentSpaceShot(lt, dur, t) { const S = ascentSpace(), st = S.st, cam = ascentSpaceCam(S, t), RE = S.RE; S.U.uTime.value = t; S.stars.position.copy(cam.position);
  // the ISS crosses in front, left to right, at ~400 km
  const tc = 32.35, iv = t > 31.2 && t < 33.4; S.iss.visible = iv; if (iv) { const c0 = new THREE.PerspectiveCamera(50, W / H, 0.01, 10); c0.rotation.order = 'YXZ'; const [x, y, z, tx, ty] = ascentPath(ASCENT_SPACE_K, t); camLook(c0, x, y, z, tx, ty, 0); c0.updateMatrixWorld();
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(c0.quaternion), rt = new THREE.Vector3(1, 0, 0).applyQuaternion(c0.quaternion); S.issP = c0.position.clone().addScaledVector(fwd, 0.62).addScaledVector(rt, 0.26 * (t - tc)).add(new THREE.Vector3(0, -0.06, 0));
    S.iss.position.copy(S.issP); S.iss.rotation.set(0.35, 0.5 + 0.03 * (t - tc), 0.12); }
  S.col = ascentColumn(st, new THREE.Vector3(0, 0, 0), colLen(t, 0.001), t, { glow: lerp(0.3, 1, ascentSS(29.0, 29.8, t)) });
  S.stars.material.uniforms.uA.value = 0.8; renderStage(st, 1.0); if (CAMONLY) return;
  const hide = (p) => { const ro = cam.position.clone().add(new THREE.Vector3(0, RE, 0)), q = p.clone().add(new THREE.Vector3(0, RE, 0)), d = q.clone().sub(ro), L2 = d.length(); d.divideScalar(L2); const b = ro.dot(d), c = ro.lengthSq() - RE * RE, h = b * b - c; if (h < 0) return false; const t0 = -b - Math.sqrt(h); return t0 > 0 && t0 < L2; };
  // the Kármán line: a dashed ring 100 km up around the column
  { const a = ascentSS(29.05, 29.4, t) * (1 - ascentSS(31.2, 31.7, t)); if (a > 0) { const ring = [], al = 3.6 * DEG; for (let i = 0; i <= 128; i++) { const ph = i / 128 * TAU; ring.push(new THREE.Vector3(Math.sin(al) * Math.cos(ph), Math.cos(al), Math.sin(al) * Math.sin(ph)).multiplyScalar(RE + 100).add(new THREE.Vector3(0, -RE, 0))); }
    ascentDash(st, ring, 'rgba(150,215,255,0.95)', a * 0.85, [12, 9], 2, hide); let best = null, bd = 9; ring.forEach((q) => { if (hide(q)) return; const v = q.clone().project(cam); if (v.z > 1 || Math.abs(v.y) > 0.9) return; const d = Math.abs(v.x + 0.35); if (d < bd) { bd = d; best = q; } });
    if (best) colLabel(st, best, 'LÍNEA DE KÁRMÁN', '100 km · empieza el espacio', a, -1); } }
  { const a = ascentSS(31.6, 32.0, t) * (1 - ascentSS(33.1, 33.4, t)); if (a > 0 && S.iss.visible) colLabel(st, S.issP, 'EEI', '~400 km', a, -1); }
  { const a = ascentSS(34.6, 35.1, t); if (a > 0) { const d = cam.position.clone().add(new THREE.Vector3(0, RE, 0)).normalize(), side = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion); const p = side.clone().sub(d.clone().multiplyScalar(side.dot(d))).normalize().multiplyScalar(-RE * 0.9).add(new THREE.Vector3(0, -RE, 0)); colLabel(st, p, 'LA TIERRA', '12.742 km de diámetro', a, 1); } }
  lensFlare(st, ASCENT_SUN, 0.5); bloom(0.5); }
SHOT_FN.space = ascentSpaceShot;
SHOT_FN.earth = ascentSpaceShot;
