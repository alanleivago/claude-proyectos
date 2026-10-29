// =====================================================================
//  COLUMN — the shared paper column: one folded sheet from the desk to beyond the universe.
//  API (other files code against this; signatures are stable):
//
//    makeColumn(scene, o) → C
//      o: { style 'paper'|'beam',
//           w      paper: the sheet's short side in world units (default 0.21 = metres; scales the real footprint)
//                  beam : the slab's world width (default 0 → only the screen-space min width is used),
//           minPx  beam/paper: min on-screen HALF width in px of the line (default beam 2.2, paper 1.3),
//           halo   halo radius px (default 30), color (core, default '#fffaf0'), haloColor (default '#ffe2b8'),
//           contact paper: soft contact shadow under the stack (default true), trail 0..1 paper arc trail (default 0.5) }
//    C.pose(base, up, len, t, o2) → info { top, hinge, tip, h }   (Vector3s reused between calls; tip/hinge null when idle)
//      The stack standing at `base` (Vector3) along unit `up`. `len` = its height (world units) with foldAt(t).n folds
//      DONE — i.e. colLen(t, scale) = thickM(foldAt(t).n) * scale. While the next fold is in flight (k > 0) the stack keeps
//      that height and its other half swings 180° over the hinge at its top (the top of the stack = mid-height of the
//      result), landing doubled exactly when n increments and len doubles — so it is continuous if len follows the clock.
//      paper: real A4 physics. Footprint = colFoot(n) (alternating halving, 29.7 × 21 cm → a needle), folds alternate the
//             x and z axes (odd folds swing in the x–y plane, even ones in z–y; turn it with o2.yaw). The flap is rigid
//             with an exact bend (concentric layers) at the hinge, the folded spine is the rounded U of the last fold,
//             the layered edges show 2^n sheets (fine lines that resolve into striations), fibre texture on the faces,
//             contact shadow, a faint glowing arc trail. When the stack is thinner than ~2 px on screen a min-width
//             line takes over, so the needle never vanishes (the same object that later pierces space).
//      beam : a glowing line/slab (hot core + soft halo, screen-space min width). During a fold the upper half swings
//             over as a bright segment whose tip traces a fading arc over a faint swept sector of light (afterglow
//             ~0.45 s after it lands, assuming len doubled). C.fan / C.glow are the meshes (renderOrder 4/5).
//      o2: { glow 0..1 (halo/trail amount, default 1), visible, yaw (paper: radians about up),
//            side (beam: Vector3 the arc swings toward; default: screen-left for a camera looking down -z),
//            w (override width / footprint scale), after (beam afterglow, default true), fan (beam swept-sector light 0..1) }
//    colLabel(st, p, title, sub, a, side, o) — 2D label for world point p: a small dot with a soft ring, a thin leader
//      that underlines a small-caps title and a serif italic sub line ('LA LUNA', 'a 384.400 km'). side 1 = text to the
//      LEFT of the point, -1 = right; flips automatically to stay inside the safe frame, slides off the HUD block,
//      clamps vertically (the leader bends). Fades with a; deferred (DEFER) so overlays stay on top.
//      o: { color (dot, default '#ffffff'), lead (leader px before the text, default 70), dy (raise text px) }
//
//  Helpers:
//    colLen(t, s=1)   thickM(foldAt(t).n) * s — the `len` to pass to C.pose at scale s (world units per metre)
//    colGrow(t, s=1)  the visible top height at t (smooth through folds: len·(1 + eased k)) — for cameras/framing
//    colFoot(n)       [x, z] real footprint in metres after n folds;  colAxis(j) 'x'|'z' = axis halved by fold j
//    colPaperSheet(scene, o) → S   a single flexible A4 sheet for folds 1–4 on the desk (vertices bend along a
//      crease: it lifts as a soft loop, rolls over and is pressed flat; thickness and layers grow with each fold).
//      o: { s (world units per metre, default 1), trail 0..1 (default 0.25), sss (translucency, default 0.2) }
//      S.pose(base, t, o2) → { tip, crease }   base = Vector3 centre of the sheet on the desk (y = desk top);
//      o2: { yaw, visible, n (max folds, default 4) }. Same axes, footprint, recentring and spine as the column, so at
//      n = 4 it hands over to makeColumn('paper') with no jump (switch while foldAt(t).k = 0, e.g. at t ≥ 3.4).
// =====================================================================
const colAxis = (j) => (j % 2 ? 'x' : 'z');
const colFoot = (n) => [0.297 / Math.pow(2, Math.ceil(n / 2)), 0.21 / Math.pow(2, Math.floor(n / 2))];
const colEase = (k) => k * k * k * (k * (k * 6 - 15) + 10);
const colLen = (t, s = 1) => thickM(foldAt(t).n) * s;
const colGrow = (t, s = 1) => { const F = foldAt(t); return thickM(F.n) * s * (1 + colEase(F.k)); };
const colBeta = (n) => (n >= 1 && colAxis(n) === 'z' ? -Math.PI / 2 : 0);          // the frame whose +x' is fold n's axis
const colToFrame = (wAxis, beta) => (beta === 0 ? (wAxis === 'x' ? 0 : 2) : (wAxis === 'z' ? 0 : 3));   // + side of a world axis → side index (0 +x', 1 -x', 2 +z', 3 -z')
function colWob(y, s) { return 0.6 * Math.sin(y * 9.3 + s) + 0.35 * Math.sin(y * 23.7 + s * 2.1) + 0.2 * Math.sin(y * 51.1 + s * 3.7); }

// ---------------------------------------------------------------- the paper material (fibre faces + layered edges)
let COL_FIB = null;
function colFibTex() { if (COL_FIB) return COL_FIB; const R = RNG('colfib');
  COL_FIB = wrap(g3Tex((x, w, h) => { x.fillStyle = '#f3f1ec'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 90; k++) { const px = R.r(0, w), py = R.r(0, h), r = R.r(8, 40), c = R.pick(['218,212,198', '255,255,255', '232,226,214']), gr = x.createRadialGradient(px, py, 0, px, py, r);
      gr.addColorStop(0, `rgba(${c},0.12)`); gr.addColorStop(1, `rgba(${c},0)`); x.fillStyle = gr; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
    x.lineCap = 'round'; for (let k = 0; k < 2600; k++) { const px = R.r(0, w), py = R.r(0, h), a = R.r(0, TAU), l = R.r(3, 16), b = R.n(0.5);
      x.strokeStyle = R.f() < 0.6 ? `rgba(196,188,172,${R.r(0.04, 0.12)})` : `rgba(255,255,255,${R.r(0.08, 0.22)})`; x.lineWidth = R.r(0.4, 0.9);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + b) * l * 0.5, py + Math.sin(a + b) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    speck(x, w, h, 900, ['rgba(170,160,145,0.18)', 'rgba(255,255,255,0.5)'], R, 0.6, 1.4); }, 512, 512));
  return COL_FIB; }
function colPaperMat(o = {}) { const U = { uFib: { value: colFibTex() }, uN: { value: 0 }, uFibS: { value: 9 }, uSSS: { value: o.sss ?? 0.07 } };
  const m = new THREE.MeshStandardMaterial({ color: o.color || '#fbf9f3', roughness: 0.86, metalness: 0 });
  m.userData.U = U; m.customProgramCacheKey = () => 'colPaper';
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aK; attribute float aS; attribute vec2 aF; varying float vK; varying float vS; varying vec2 vF;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvK = aK; vS = aS; vF = aF;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform sampler2D uFib; uniform float uN, uFibS, uSSS; varying float vK; varying float vS; varying vec2 vF;
float colH(float x){ return fract(sin(x * 12.9898 + 4.1) * 43758.5453); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{ vec3 fib = texture2D(uFib, vF * uFibS).rgb;
  if (vK < 0.5) { diffuseColor.rgb *= mix(vec3(1.0), fib / 0.95, 0.85); }
  else {
    // the layered edge: 2^uN sheets over vS 0..1. Draw the finest level that is >= ~3 px apart (true sheet seams when
    // they resolve), crossfade to the next, and give every group of sheets its own faint tone (striations).
    float sy = vS + (sin(vF.x * 211.0 + vS * 37.0) * 0.5 + sin(vF.x * 57.0 - vS * 13.0)) * 0.12 * exp2(-min(uN, 9.0)) ;
    float fw = max(fwidth(sy), 1e-8), e = clamp(log2(1.0 / (3.2 * fw)), 0.0, uN), e0 = floor(e), fr = e - e0;
    float tone = 0.0;
    for (int i = 0; i < 4; i++) { float ei = e0 - float(i); if (ei < 0.0) break; tone += (colH(floor(sy * exp2(ei)) + ei * 7.13) - 0.5) * 0.085 / (1.0 + float(i) * 0.8); }
    float L0 = sy * exp2(e0), f0 = fract(L0), p0 = min(f0, 1.0 - f0) / max(fwidth(L0), 1e-6);
    float L1 = sy * exp2(e0 + 1.0), f1 = fract(L1), p1 = min(f1, 1.0 - f1) / max(fwidth(L1), 1e-6);
    float res = step(uN - 0.5, e0);                       // 1 = real sheets are resolved
    float seam = exp(-p0 * p0 * 0.7) * (1.0 - fr) + exp(-p1 * p1 * 0.7) * fr * step(e0 + 1.0, uN);
    float ao = res * (1.0 - 4.0 * f0 * (1.0 - f0)) * 0.10;  // each sheet a touch darker toward its seams
    diffuseColor.rgb *= vec3(0.95, 0.935, 0.91) * (1.0 + tone) * (1.0 - seam * mix(0.2, 0.42, res) - ao);
  } }`).replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * uSSS;'); };
  return m; }

// ---------------------------------------------------------------- a slab: 4 lofted sides (with stadium spines) + caps
const COL_NY = 40;
function colSlab(mat) { const nv = 4 * (COL_NY + 1) * 2 + 8, g = new THREE.BufferGeometry(), idx = [];
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
  g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(nv), 1)); g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(nv), 1)); g.setAttribute('aF', new THREE.BufferAttribute(new Float32Array(nv * 2), 2));
  for (let f = 0; f < 4; f++) for (let j = 0; j < COL_NY; j++) { const a = (f * (COL_NY + 1) + j) * 2, b = a + 1, c = a + 3, d = a + 2; idx.push(a, b, c, a, c, d); }
  const t0 = 4 * (COL_NY + 1) * 2; idx.push(t0, t0 + 1, t0 + 2, t0, t0 + 2, t0 + 3, t0 + 4, t0 + 6, t0 + 5, t0 + 4, t0 + 7, t0 + 6); g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e12);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; return m; }
// P: { x0, x1, z0, z1, h, sp: [ {side, r, segs} ], kind: [k+x, k-x, k+z, k-z], wob: (y01) → [dx, dz], s (world/metre) }
// the folded spine: the U of the last fold bulges OUT of the cut footprint as a half-disc of radius r centred at mid-height
// (exactly what the bend sector becomes when the flap lands). Thin stacks: r = H/2 (the true U); needle-like stacks fade it out.
const colSpineR = (H, e) => { const q = H / 2 / Math.max(e, 1e-12); return q <= 0.5 ? H / 2 : q < 1 ? e * (1 - q) : 0; };
function colBulge(sp, side, y, h) { let v = 0; for (const q of sp) if (q.side === side && q.r > 0) v = Math.max(v, Math.sqrt(Math.max(0, q.r * q.r - (y - h / 2) * (y - h / 2)))); return v; }
function colSlabSet(m, P) { const g = m.geometry, p = g.attributes.position.array, K = g.attributes.aK.array, S = g.attributes.aS.array, F = g.attributes.aF.array, h = Math.max(P.h, 1e-9), s = P.s || 1;
  const rows = []; for (let j = 0; j <= COL_NY; j++) { const hn = COL_NY / 2, jj = j <= hn ? j : j - hn, base = j <= hn ? 0 : 0.5; rows.push(Math.min(1, base + 0.25 * (1 - Math.cos(Math.PI * jj / hn)))); }
  let vi = 0; const put = (x, y, z, k, sy, fu, fv) => { p[vi * 3] = x; p[vi * 3 + 1] = y; p[vi * 3 + 2] = z; K[vi] = k; S[vi] = sy; F[vi * 2] = fu / s; F[vi * 2 + 1] = fv / s; vi++; };
  // uneven sheets: each layered side wavers on its own; the folded (rounded) spine stays smooth
  const ring = (y01) => { const y = y01 * h, w = P.wob ? P.wob(y01) : [0, 0, 0, 0], q = (i) => (P.kind[i] ? w[i] : 0);
    return [P.x1 + colBulge(P.sp, 0, y, h) + q(0), P.x0 - colBulge(P.sp, 1, y, h) + q(1), P.z1 + colBulge(P.sp, 2, y, h) + q(2), P.z0 - colBulge(P.sp, 3, y, h) + q(3), y]; };
  const RG = rows.map(ring);
  for (let f = 0; f < 4; f++) for (let j = 0; j <= COL_NY; j++) { const [X1, X0, Z1, Z0, y] = RG[j], k = P.kind[f], sy = rows[j];
    if (f === 0) { put(X1, y, Z1, k, sy, Z1, y); put(X1, y, Z0, k, sy, Z0, y); } else if (f === 1) { put(X0, y, Z0, k, sy, Z0, y); put(X0, y, Z1, k, sy, Z1, y); }
    else if (f === 2) { put(X0, y, Z1, k, sy, X0, y); put(X1, y, Z1, k, sy, X1, y); } else { put(X1, y, Z0, k, sy, X1, y); put(X0, y, Z0, k, sy, X0, y); } }
  { const [X1, X0, Z1, Z0, y] = RG[COL_NY]; put(X0, y, Z1, 0, 1, X0, Z1); put(X1, y, Z1, 0, 1, X1, Z1); put(X1, y, Z0, 0, 1, X1, Z0); put(X0, y, Z0, 0, 1, X0, Z0); }
  { const [X1, X0, Z1, Z0] = RG[0]; put(X0, 0, Z1, 0, 0, X0 + 0.37, Z1); put(X1, 0, Z1, 0, 0, X1 + 0.37, Z1); put(X1, 0, Z0, 0, 0, X1 + 0.37, Z0); put(X0, 0, Z0, 0, 0, X0 + 0.37, Z0); }
  g.attributes.position.needsUpdate = g.attributes.aK.needsUpdate = g.attributes.aS.needsUpdate = g.attributes.aF.needsUpdate = true; g.computeVertexNormals(); }

// ---------------------------------------------------------------- the bend at the hinge: a sector of concentric layers
const COL_NA = 28, COL_NR = 10;
function colPie(mat) { const nf = (COL_NR + 1) * (COL_NA + 1), nv = nf * 2 + (COL_NA + 1) * 2, g = new THREE.BufferGeometry(), idx = [];
  ['position', 'normal'].forEach((k) => g.setAttribute(k, new THREE.BufferAttribute(new Float32Array(nv * 3), 3)));
  g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(nv), 1)); g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(nv), 1)); g.setAttribute('aF', new THREE.BufferAttribute(new Float32Array(nv * 2), 2));
  const v = (f, i, j) => f * nf + i * (COL_NA + 1) + j;
  for (let i = 0; i < COL_NR; i++) for (let j = 0; j < COL_NA; j++) { const a0 = v(0, i, j), b0 = v(0, i + 1, j), c0 = v(0, i + 1, j + 1), d0 = v(0, i, j + 1); idx.push(a0, c0, b0, a0, d0, c0);
    const a1 = v(1, i, j), b1 = v(1, i + 1, j), c1 = v(1, i + 1, j + 1), d1 = v(1, i, j + 1); idx.push(a1, b1, c1, a1, c1, d1); }
  const o = nf * 2; for (let j = 0; j < COL_NA; j++) { const a = o + j * 2, b = a + 1, c = a + 3, d = a + 2; idx.push(a, c, b, a, d, c); }
  g.setIndex(idx); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e12);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; return m; }
// Q: { h, rb, th, z0, z1, sp, s }  hinge at (0, h); layer at stack height y sits at radius h − y
function colPieSet(m, Q) { const g = m.geometry, p = g.attributes.position.array, nr = g.attributes.normal.array, K = g.attributes.aK.array, S = g.attributes.aS.array, F = g.attributes.aF.array, s = Q.s || 1, nf = (COL_NR + 1) * (COL_NA + 1);
  let vi = 0; const put = (x, y, z, nx, ny, nz, k, sy, fu, fv) => { p[vi * 3] = x; p[vi * 3 + 1] = y; p[vi * 3 + 2] = z; nr[vi * 3] = nx; nr[vi * 3 + 1] = ny; nr[vi * 3 + 2] = nz; K[vi] = k; S[vi] = sy; F[vi * 2] = fu / s; F[vi * 2 + 1] = fv / s; vi++; };
  for (let f = 0; f < 2; f++) for (let i = 0; i <= COL_NR; i++) for (let j = 0; j <= COL_NA; j++) { const rho = Q.rb * i / COL_NR, ph = Q.th * j / COL_NA, ys = Q.h - rho, x = rho * Math.sin(ph), y = Q.h - rho * Math.cos(ph);
    const z = f ? Q.z1 : Q.z0; put(x, y, z, 0, 0, f ? 1 : -1, 1, ys / Q.h, x + z * 0.3, y); }
  for (let j = 0; j <= COL_NA; j++) { const ph = Q.th * j / COL_NA, ys = Q.h - Q.rb, x = Q.rb * Math.sin(ph), y = Q.h - Q.rb * Math.cos(ph), ar = Q.rb * ph;
    put(x, y, Q.z0, Math.sin(ph), -Math.cos(ph), 0, 0, 0, Q.z0, ar); put(x, y, Q.z1, Math.sin(ph), -Math.cos(ph), 0, 0, 0, Q.z1, ar); }
  ['position', 'normal', 'aK', 'aS', 'aF'].forEach((k) => (g.attributes[k].needsUpdate = true)); }

// ---------------------------------------------------------------- glow lines: instanced screen-space capsules
function colGlow(par, o = {}) { const MAX = o.max || 200, g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
  const A = {}; [['iA', 3], ['iB', 3], ['iW', 4], ['iC', 4]].forEach(([k, n]) => { A[k] = new THREE.InstancedBufferAttribute(new Float32Array(MAX * n), n); A[k].setUsage(THREE.DynamicDrawUsage); g.setAttribute(k, A[k]); });
  g.instanceCount = 0;
  const U = { uRes: { value: new THREE.Vector2(W, H) }, uNear: { value: 0.05 }, uMinPx: { value: o.minPx ?? 2.2 }, uHaloPx: { value: o.halo ?? 30 }, uCol: { value: lin(o.color || '#fffaf0') }, uHaloCol: { value: lin(o.haloColor || '#fff1de') }, uWide: { value: o.wide ?? 0 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, depthTest: true, fog: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    vertexShader: `uniform vec2 uRes; uniform float uNear, uMinPx, uHaloPx, uWide; attribute vec3 iA, iB; attribute vec4 iW, iC;
varying vec3 vQ; varying vec4 vP; varying float vF, vC, vE;
void main(){ mat4 pm = projectionMatrix * modelViewMatrix; vec4 a = pm * vec4(iA, 1.0), b = pm * vec4(iB, 1.0);
  if (a.w < uNear && b.w < uNear) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  if (a.w < uNear) a = mix(a, b, (uNear - a.w) / (b.w - a.w)); if (b.w < uNear) b = mix(b, a, (uNear - b.w) / (a.w - b.w));
  vec2 sa = (a.xy / a.w * 0.5 + 0.5) * uRes, sb = (b.xy / b.w * 0.5 + 0.5) * uRes, d = sb - sa; float L = length(d);
  vec2 dir = L > 1e-3 ? d / L : vec2(1.0, 0.0), nrm = vec2(-dir.y, dir.x);
  float f = projectionMatrix[1][1] * 0.5 * uRes.y, e = position.x;
  float real = iW.x * f / mix(a.w, b.w, e), hw = max(real, uMinPx * iC.z), ext = hw + uHaloPx * iC.z * step(0.001, iC.y) * 1.6 + 2.0;
  vec2 s = mix(sa, sb, e) + dir * (e * 2.0 - 1.0) * ext + nrm * position.y * ext; vec4 c = e < 0.5 ? a : b;
  gl_Position = vec4(s / uRes * 2.0 - 1.0, clamp(c.z / c.w, -1.0, 1.0), 1.0);
  vQ = vec3(e * L + (e * 2.0 - 1.0) * ext, position.y * ext, L); vP = vec4(hw, mix(iW.y, iW.z, e), iC.y, iC.z);
  vC = iW.w; vE = ext; vF = iC.x; if (uWide > 0.0) vF *= 1.0 - smoothstep(uWide, uWide * 2.2, real); }`,
    fragmentShader: `uniform vec3 uCol, uHaloCol; uniform float uHaloPx; varying vec3 vQ; varying vec4 vP; varying float vF, vC, vE;
void main(){ float dx = max(max(-vQ.x, vQ.x - vQ.z), 0.0), d = length(vec2(dx, vQ.y)), hw = vP.x, I = vP.y;
  float core = clamp(hw + 0.7 - d, 0.0, 1.0), hot = exp(-d * d / max(hw * hw, 0.36) * 1.4), hr = uHaloPx * vP.w;
  if (vC > 0.5 && (vQ.x < 0.0 || vQ.x > vQ.z)) discard;
  float halo = vP.z * (exp(-d / max(hr * 0.12, 0.5)) * 0.42 + exp(-d * d / max(hr * hr, 1.0)) * 0.1) * (1.0 - smoothstep(0.55, 1.0, d / max(vE, 1.0)));
  vec3 col = (uCol * core * mix(0.8, 1.35, hot) * vF + uHaloCol * halo) * I;
  gl_FragColor = vec4(col, clamp(core * vF * min(I, 1.0), 0.0, 1.0));
  #include <encodings_fragment>
}` });
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = o.order ?? 5;
  m.onBeforeRender = (r, sc, cam) => { U.uNear.value = cam.near * 1.01; };
  par.add(m);
  // seg(a, b, worldHalfWidth, intensityA, intensityB, solid 0..1, halo 0..n, pxScale)
  const G = { m, U, n: 0, begin() { this.n = 0; },
    seg(a, b, hw = 0, ia = 1, ib = 1, solid = 1, halo = 1, px = 1, flat = 0) { if (this.n >= MAX) return; const i = this.n++;
      A.iA.setXYZ(i, a.x, a.y, a.z); A.iB.setXYZ(i, b.x, b.y, b.z); A.iW.setXYZW(i, hw, ia, ib, flat); A.iC.setXYZW(i, solid, halo, px, 0); },
    end() { g.instanceCount = this.n; Object.values(A).forEach((x) => (x.needsUpdate = true)); m.visible = this.n > 0; } };
  return G; }

// ---------------------------------------------------------------- a soft contact shadow texture (rounded rect)
let COL_CT = null;
function colContactTex() { return COL_CT || (COL_CT = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.filter = 'blur(10px)'; x.fillStyle = '#000'; x.fillRect(w * 0.2, h * 0.2, w * 0.6, h * 0.6); x.filter = 'none'; }, 128, 128, false)); }

// ---------------------------------------------------------------- THE COLUMN
function makeColumn(scene, o = {}) { const g = new THREE.Group(); scene.add(g); const beam = o.style === 'beam', S = beam ? 1 : (o.w || 0.21) / 0.21;
  const info = { top: new THREE.Vector3(), hinge: null, tip: null, h: 0 }, _h = new THREE.Vector3(), _t = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3();
  const qUp = new THREE.Quaternion(), qYaw = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
  // the min-width / glow line (world space: lives in the scene, not in the group)
  const GL = colGlow(scene, beam ? { minPx: o.minPx ?? 2.2, halo: o.halo ?? 30, color: o.color, haloColor: o.haloColor } : { minPx: o.minPx ?? 1.3, halo: o.halo ?? 22, color: o.color || '#f4efe4', haloColor: o.haloColor || '#ffe6c4', wide: 1.6 });
  const C = { g, glow: GL, info };
  if (beam) { const FN = 72, fg = new THREE.BufferGeometry(), fi = []; for (let i = 1; i <= FN; i++) fi.push(0, i, i + 1);
    fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array((FN + 2) * 3), 3)); fg.setAttribute('color', new THREE.BufferAttribute(new Float32Array((FN + 2) * 3), 3)); fg.setIndex(fi);
    const fan = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
    fan.frustumCulled = false; fan.renderOrder = 4; scene.add(fan); C.fan = fan; const fc = lin(o.haloColor || '#fff1de');
    // the swept sector: dark at the hinge, a soft light at the rim, brightest just behind the swinging half
    const fanSet = (hg, pts, amt) => { const P = fg.attributes.position.array, Cc = fg.attributes.color.array, n = Math.min(FN + 1, pts.length); P[0] = hg.x; P[1] = hg.y; P[2] = hg.z; Cc[0] = Cc[1] = Cc[2] = 0;
      for (let i = 0; i < FN + 1; i++) { const q = pts[Math.min(i, n - 1)], w = amt * Math.pow(Math.min(i, n - 1) / Math.max(1, n - 1), 2.2) * 0.11; P[(i + 1) * 3] = q.x; P[(i + 1) * 3 + 1] = q.y; P[(i + 1) * 3 + 2] = q.z; Cc[(i + 1) * 3] = fc.r * w; Cc[(i + 1) * 3 + 1] = fc.g * w; Cc[(i + 1) * 3 + 2] = fc.b * w; }
      fg.setDrawRange(0, Math.max(0, n - 1) * 3); fg.attributes.position.needsUpdate = fg.attributes.color.needsUpdate = true; fan.visible = n > 1 && amt > 0.002; };
    C.pose = (base, up, len, t, o2 = {}) => { const F = foldAt(t), u = _a.copy(up).normalize(), gl = o2.glow ?? 1, hw = (o2.w ?? o.w ?? 0) / 2; info.hinge = info.tip = null;
      let sd = o2.side ? _b.copy(o2.side) : _b.set(0, 0, 1).cross(u); sd.addScaledVector(u, -sd.dot(u)); if (sd.lengthSq() < 1e-8) { sd.set(-1, 0, 0); sd.addScaledVector(u, -sd.dot(u)); } sd.normalize();
      GL.begin(); fan.visible = false; if (o2.visible === false) { GL.end(); return info; }
      const top = _h.copy(base).addScaledVector(u, len); GL.seg(base, top, hw, 1, 1, 1, gl, 1); info.top.copy(top); info.h = len;
      const arc = (hg, L, ph1, amt, tipI) => { const N = Math.max(6, Math.ceil(ph1 / Math.PI * 44)), pts = []; let pa = null;
        for (let i = 0; i <= N; i++) { const ph = ph1 * i / N, pb = new THREE.Vector3().copy(hg).addScaledVector(u, -L * Math.cos(ph)).addScaledVector(sd, L * Math.sin(ph)); pts.push(pb);
          if (pa) { const ia = Math.pow((i - 1) / N, 1.6), ib = Math.pow(i / N, 1.6); GL.seg(pa, pb, 0, amt * (0.12 + 0.88 * ia), amt * (0.12 + 0.88 * ib), 0.9, 0.6 * gl, 0.45, 1); } pa = pb; }
        if (tipI > 0) GL.seg(pa, pa, 0, tipI, tipI, 1, 1.2 * gl, 1.7); fanSet(hg, pts, amt * gl * (o2.fan ?? 1)); return pa; };
      if (F.k > 0) { const ph = Math.PI * colEase(F.k), tip = arc(top, len, ph, 0.9, 1.3);
        GL.seg(top, tip, hw, 0.95, 1, 1, gl, 1); info.hinge = top.clone(); info.tip = tip.clone(); if (tip.clone().sub(base).dot(u) > len) info.top.copy(tip); }
      else if (F.n >= 1 && o2.after !== false) { const tau = t - FOLD_T[F.n]; if (tau >= 0 && tau < 0.45) { const a = Math.pow(1 - tau / 0.45, 2); arc(_t.copy(base).addScaledVector(u, len / 2), len / 2, Math.PI, a * 0.8, a * 0.9); } }
      GL.end(); return info; };
    return C; }

  // ---- paper
  const mat = colPaperMat(o), FS = new THREE.Group(), FF = new THREE.Group(); g.add(FS, FF);
  const stat = colSlab(mat), body = colSlab(mat), flap = colSlab(mat), pie = colPie(mat), piv = new THREE.Group(); FS.add(stat); FF.add(body, pie, piv); piv.add(flap);
  const ct = o.contact === false ? null : new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: colContactTex(), transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  if (ct) { ct.renderOrder = 1; g.add(ct); }
  const wobFor = (beta, amp) => (y01) => { const W4 = [1.3, 2.2, 4.9, 6.1].map((sd) => amp * colWob(y01, sd));   // world +x, -x, +z, -z
    return beta ? [W4[2], W4[3], -W4[1], -W4[0]] : W4; };   // into the frame (β = −90°: +x' = +z, -x' = -z, +z' = -x, -z' = +x)
  const spines = (n, beta, h, fx, fz, f = 1) => (n >= 1 ? [{ side: colToFrame(colAxis(n), beta), r: f * colSpineR(h, colAxis(n) === 'x' ? fx : fz) }] : []);
  const kinds = (sp, h) => [0, 1, 2, 3].map((s) => (sp.some((q) => q.side === s && q.r > 0.3 * h) ? 0 : 1));
  C.pose = (base, up, len, t, o2 = {}) => { const F = foldAt(t), n = F.n, k = F.k, h = Math.max(len, 1e-9), gl = o2.glow ?? 1, sc = (o2.w ? o2.w / 0.21 : 1) * S;
    g.visible = o2.visible !== false; g.position.copy(base); qUp.setFromUnitVectors(Y, _a.copy(up).normalize()); qYaw.setFromAxisAngle(Y, o2.yaw || 0); g.quaternion.copy(qUp).multiply(qYaw);
    mat.userData.U.uN.value = n; mat.userData.U.uFibS.value = 9;
    const [fx0, fz0] = colFoot(n), fx = fx0 * sc, fz = fz0 * sc, amp = 0.004 * Math.min(fx, fz); info.hinge = info.tip = null; info.h = h;
    GL.begin(); const u = _a.copy(up).normalize();
    if (!g.visible) { GL.end(); return info; }
    if (k <= 0) { const beta = colBeta(n); FS.rotation.y = beta; FS.visible = true; FF.visible = false; const lx = beta ? fz : fx, lz = beta ? fx : fz, sp = spines(n, beta, h, fx, fz);
      colSlabSet(stat, { x0: -lx / 2, x1: lx / 2, z0: -lz / 2, z1: lz / 2, h, sp, kind: kinds(sp, h), wob: wobFor(beta, amp), s: sc });
      info.top.copy(base).addScaledVector(u, h); GL.seg(base, info.top, Math.min(fx, fz) / 2, 1, 1, 1, 0, 1); }
    else { const j = n + 1, beta = colBeta(j); FF.rotation.y = beta; FF.visible = true; FS.visible = false; const lx = beta ? fz : fx, lz = beta ? fx : fz;
      const slide = lx / 4 * colEase(seg(k, 0.25, 1)), th = Math.PI * colEase(k);
      const spB = spines(n, beta, h, fx, fz, 1 - colEase(seg(k, 0.2, 1))), spBody = spB, kindsB = kinds(spBody, h);
      const wob = wobFor(beta, amp);
      colSlabSet(body, { x0: -lx / 2, x1: 0, z0: -lz / 2, z1: lz / 2, h, sp: spBody, kind: kindsB, wob, s: sc }); body.position.set(slide, 0, 0);
      const kf = kinds(spB, h); kf[1] = 1; colSlabSet(flap, { x0: 0, x1: lx / 2, z0: -lz / 2, z1: lz / 2, h, sp: spB, kind: kf, wob, s: sc });
      piv.position.set(slide, h, 0); piv.rotation.set(0, 0, th); flap.position.set(0, -h, 0);
      const [fxN, fzN] = colFoot(j), eA = (colAxis(j) === 'x' ? fxN : fzN) * sc, rb = lerp(Math.min(h, 0.5 * eA), colSpineR(2 * h, eA), colEase(seg(k, 0.7, 1)));   // the bend tightens as the crease is pressed
      colPieSet(pie, { h, rb, th, z0: -lz / 2, z1: lz / 2, sp: [], s: sc }); pie.position.set(slide, 0, 0);
      g.updateMatrixWorld(true);
      // the swing: a faint glowing arc traced by the middle of the flap's free edge
      const tr = (o.trail ?? 0.5) * gl * Math.sin(Math.PI * k), hingeW = new THREE.Vector3(slide, h, 0).applyMatrix4(FF.matrixWorld); info.hinge = hingeW;
      const Nn = 30; let pa = null; for (let i = 0; i <= Nn; i++) { const ph = th * i / Nn, rr = Math.hypot(lx / 2, h / 2), a0 = Math.atan2(lx / 2, -h / 2) - Math.PI / 2;
        const pb = new THREE.Vector3(slide + rr * Math.cos(a0 + ph), h + rr * Math.sin(a0 + ph), 0).applyMatrix4(FF.matrixWorld);
        if (pa && tr > 0.01) GL.seg(pa, pb, 0, tr * Math.pow((i - 1) / Nn, 2), tr * Math.pow(i / Nn, 2), 0.5, 0.7, 0.45, 1); pa = pb; }
      info.tip = pa; const topH = h + Math.max(h * -Math.cos(th), lx / 2 * Math.sin(th), 0); info.top.copy(base).addScaledVector(u, topH); info.h = topH;
      // the min-width line for the needle: body + flap axis
      const bodyTop = _t.copy(base).addScaledVector(u, h); GL.seg(base, bodyTop, Math.min(fx, fz) / 2, 1, 1, 1, 0, 1);
      const ftip = new THREE.Vector3(slide + h * Math.sin(th), h - h * Math.cos(th), 0).applyMatrix4(FF.matrixWorld); GL.seg(hingeW, ftip, Math.min(fx, fz) / 2, 1, 1, 1, 0, 1); }
    if (ct) { const cx = Math.max(fx, 1e-6) * 1.35 + h * 0.15, cz = Math.max(fz, 1e-6) * 1.35 + h * 0.15; ct.scale.set(cx, 1, cz); ct.position.set(0, 0.0003 * sc, 0); ct.material.opacity = 0.42 * clamp(fx * 40 / sc); }
    GL.end(); return info; };
  return C; }

// ---------------------------------------------------------------- the single flexible sheet (folds 1–4 on the desk)
function colPaperSheet(scene, o = {}) { const g = new THREE.Group(); scene.add(g); const sc = o.s || 1, mat = colPaperMat(o), FR = new THREE.Group(); g.add(FR);
  const NU = 96, NV = 6, ntop = (NU + 1) * (NV + 1), nx = (NV + 1) * 2, nz = (NU + 1) * 2, nv = ntop * 2 + nx * 2 + nz * 2, geo = new THREE.BufferGeometry(), idx = [];
  ['position', 'normal'].forEach((k) => geo.setAttribute(k, new THREE.BufferAttribute(new Float32Array(nv * 3), 3)));
  geo.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(nv), 1)); geo.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(nv), 1)); geo.setAttribute('aF', new THREE.BufferAttribute(new Float32Array(nv * 2), 2));
  const T = (s, i, j) => s * ntop + i * (NV + 1) + j;
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = T(0, i, j), b = T(0, i + 1, j), c = T(0, i + 1, j + 1), d = T(0, i, j + 1); idx.push(a, c, b, a, d, c);
    const a1 = T(1, i, j), b1 = T(1, i + 1, j), c1 = T(1, i + 1, j + 1), d1 = T(1, i, j + 1); idx.push(a1, b1, c1, a1, c1, d1); }
  const ox = ntop * 2, oz = ox + nx * 2;
  for (let e = 0; e < 2; e++) for (let j = 0; j < NV; j++) { const a = ox + e * nx + j * 2, b = a + 2, c = a + 3, d = a + 1; if (e) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); }
  for (let e = 0; e < 2; e++) for (let i = 0; i < NU; i++) { const a = oz + e * nz + i * 2, b = a + 2, c = a + 3, d = a + 1; if (e) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); }
  geo.setIndex(idx); geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; FR.add(m);
  const GL = colGlow(scene, { minPx: 1, halo: 18, color: '#fff6e6', haloColor: '#ffe0b0' });
  // u: −1..1 across the crease (dense near it)
  const us = []; for (let i = 0; i <= NU; i++) { const q = i / NU * 2 - 1; us.push(Math.sign(q) * Math.pow(Math.abs(q), 1.55)); }
  // the mid-surface across the crease: x ≤ 0 flat; x > 0 rolls over a cylinder of radius r by θ, then a slightly leading free part
  const bendAt = (x, th, r, Lf, c) => { if (x <= 0 || th <= 0) return [x, 0, 0, 1]; const arc = r * th; if (x <= arc) { const al = x / r; return [r * Math.sin(al), r * (1 - Math.cos(al)), -Math.sin(al), Math.cos(al)]; }
    const s = x - arc, bx = r * Math.sin(th), by = r * (1 - Math.cos(th)), ps = th + c * s / Lf;
    if (Math.abs(c) < 1e-5) return [bx + s * Math.cos(th), by + s * Math.sin(th), -Math.sin(th), Math.cos(th)];
    return [bx + Lf / c * (Math.sin(ps) - Math.sin(th)), by - Lf / c * (Math.cos(ps) - Math.cos(th)), -Math.sin(ps), Math.cos(ps)]; };
  const qYaw = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), out = { tip: null, crease: null };
  const shape = (n, k, L) => { const Tn = thickM(n) * sc, th = Math.PI * colEase(k), rs = Math.min(0.05 * sc, 0.26 * L / 2), r = lerp(rs, Tn / 2 + 1e-6, colEase(seg(k, 0.55, 1))), c = 0.5 * Math.sin(th) / (1 + n); return { Tn, th, r, c }; };
  const S = { g, glow: GL, mesh: m, pose(base, t, o2 = {}) { const F = foldAt(t), nmax = o2.n ?? 4; let n = F.n, k = F.k; if (n >= nmax) { n = nmax; k = 0; }
    g.visible = o2.visible !== false; g.position.copy(base); g.quaternion.copy(qYaw.setFromAxisAngle(Y, o2.yaw || 0)); GL.begin();
    const fold = k > 0, beta = colBeta(fold ? n + 1 : n), [fx, fz] = colFoot(n).map((v) => v * sc), lx = beta ? fz : fx, lz = beta ? fx : fz; FR.rotation.y = beta;
    mat.userData.U.uN.value = n; mat.userData.U.uSSS.value = (o.sss ?? 0.2) / (1 + 0.6 * n); const { Tn, th, r, c } = shape(n, k, lx), slide = fold ? lx / 4 * colEase(seg(k, 0.25, 1)) : 0, Lf = lx / 2, y0 = 0.0004 * sc;
    const p = geo.attributes.position.array, nr = geo.attributes.normal.array, K = geo.attributes.aK.array, Sa = geo.attributes.aS.array, Fa = geo.attributes.aF.array;
    let vi = 0; const put = (x, y, z, a, b, cz, kk, sy, fu, fv) => { p[vi * 3] = x; p[vi * 3 + 1] = y; p[vi * 3 + 2] = z; nr[vi * 3] = a; nr[vi * 3 + 1] = b; nr[vi * 3 + 2] = cz; K[vi] = kk; Sa[vi] = sy; Fa[vi * 2] = fu / sc; Fa[vi * 2 + 1] = fv / sc; vi++; };
    const M = us.map((q) => { const x = q * lx / 2; if (!fold) return [x, 0, 0, 1, x]; const b = bendAt(x, th, r, Lf, c); return [b[0] + slide, b[1], b[2], b[3], x]; });
    for (let s = 0; s < 2; s++) for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) { const [mx, my, ax, ay, rx] = M[i], w = s ? -Tn / 2 : Tn / 2, z = (j / NV - 0.5) * lz;
      put(mx + ax * w, y0 + Tn / 2 + my + ay * w, z, s ? -ax : ax, s ? -ay : ay, 0, 0, s ? 0 : 1, rx + s * 0.31, z); }
    for (let e = 0; e < 2; e++) { const [mx, my, ax, ay] = M[e ? NU : 0], tx = e ? ay : -ay, ty = e ? -ax : ax; for (let j = 0; j <= NV; j++) { const z = (j / NV - 0.5) * lz;
      put(mx - ax * Tn / 2, y0 + Tn / 2 + my - ay * Tn / 2, z, tx, ty, 0, 1, 0, z, 0); put(mx + ax * Tn / 2, y0 + Tn / 2 + my + ay * Tn / 2, z, tx, ty, 0, 1, 1, z, Tn); } }
    for (let e = 0; e < 2; e++) { const z = e ? lz / 2 : -lz / 2; for (let i = 0; i <= NU; i++) { const [mx, my, ax, ay, rx] = M[i];
      put(mx - ax * Tn / 2, y0 + Tn / 2 + my - ay * Tn / 2, z, 0, 0, e ? 1 : -1, 1, 0, rx, 0); put(mx + ax * Tn / 2, y0 + Tn / 2 + my + ay * Tn / 2, z, 0, 0, e ? 1 : -1, 1, 1, rx, Tn); } }
    ['position', 'normal', 'aK', 'aS', 'aF'].forEach((kk) => (geo.attributes[kk].needsUpdate = true));
    g.updateMatrixWorld(true); out.tip = out.crease = null;
    if (fold) { out.crease = new THREE.Vector3(slide, y0 + Tn, 0).applyMatrix4(FR.matrixWorld); const tr = (o.trail ?? 0.25) * Math.sin(Math.PI * k), N = 26; let pa = null;
      for (let i = 0; i <= N; i++) { const ki = k * i / N, sh = shape(n, ki, lx), sl = lx / 4 * colEase(seg(ki, 0.25, 1)), b = bendAt(Lf, sh.th, sh.r, Lf, sh.c), pb = new THREE.Vector3(b[0] + sl, y0 + Tn + b[1], 0).applyMatrix4(FR.matrixWorld);
        if (pa && tr > 0.01) GL.seg(pa, pb, 0, tr * Math.pow((i - 1) / N, 2), tr * Math.pow(i / N, 2), 0.5, 0.8, 0.45, 1); pa = pb; } out.tip = pa; }
    GL.end(); return out; } };
  return S; }

// ---------------------------------------------------------------- labels
function colLabel(st, p, title, sub, a = 1, side = 1, o = {}) { if (a <= 0 || CAMONLY) return; st.cam.updateMatrixWorld(); const s = p.clone().project(st.cam);
  if (s.z > 1 || s.z < -1 || Math.abs(s.x) > 1.15 || Math.abs(s.y) > 1.15) return; const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H;
  const f = () => { ctx.save(); screen(); const T1 = String(title || '').toUpperCase(), fT = `700 25px ${PV.sans}`, fS = `italic 400 27px ${PV.serif}`;
    ctx.font = fT; ctx.letterSpacing = '4px'; const wT = ctx.measureText(T1).width; ctx.letterSpacing = '0px'; ctx.font = fS; const wS = sub ? ctx.measureText(sub).width : 0; const bw = Math.max(wT, wS);
    const L = 60, R = W - (SAFE.right || 140), top = (SAFE.top || 240) + 60, bot = Math.min(H - (SAFE.bottom || 420) - 10, 1255); let lead = o.lead ?? 70, sd = side >= 0 ? 1 : -1;
    const fits = (d, ld) => (d > 0 ? x - ld - bw >= L : x + ld + bw <= R);
    if (!fits(sd, lead)) { if (fits(-sd, lead)) sd = -sd; else { while (lead > 24 && !fits(sd, lead)) lead -= 8; } }
    let tx0 = sd > 0 ? x - lead - bw : x + lead; tx0 = clamp(tx0, L, R - bw);
    // text baseline row (the leader runs under the text); keep it inside the safe band and off the HUD block
    let ly = clamp(y - (o.dy || 0), top, bot); const hudT = TT < 68 && !(TT >= 61.5 && TT < 62);
    // the HUD's right edge grows with its GROSOR value ('107 mil millones de años luz' runs to x ~700)
    let hudR = 430; if (hudT) { const F = foldAt(TT), th = TT >= 66 ? thickM(12) : thickM(F.n) * (1 + F.k * (TT < 61.4 ? 1 : 0)); ctx.font = `700 44px ${PV.sans}`; hudR = Math.max(430, 90 + ctx.measureText(fmtLen(th)).width + 24); }
    if (hudT && tx0 < hudR && ly > 585 && ly < 990) ly = ly < 760 ? 585 : 990;
    const ex = sd > 0 ? tx0 : tx0 + bw, near = sd > 0 ? x - 11 : x + 11;
    ctx.globalAlpha = clamp(a);
    // leader: from the ring, (bend if the row moved), then under the text block
    ctx.strokeStyle = 'rgba(255,255,255,0.78)'; ctx.lineWidth = 1.6; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4; ctx.beginPath(); ctx.moveTo(near, y);
    if (Math.abs(ly - y) > 1) { const bx = sd > 0 ? Math.max(ex + 8, x - 11 - Math.abs(ly - y)) : Math.min(ex - 8, x + 11 + Math.abs(ly - y)); ctx.lineTo(bx, ly); } ctx.lineTo(ex, ly); ctx.stroke();
    const g2 = ctx.createLinearGradient(tx0, 0, tx0 + bw, 0), fade = sd > 0 ? [0, 1] : [1, 0]; g2.addColorStop(0, `rgba(255,255,255,${0.15 + 0.6 * fade[0]})`); g2.addColorStop(1, `rgba(255,255,255,${0.15 + 0.6 * fade[1]})`);
    ctx.strokeStyle = g2; ctx.beginPath(); ctx.moveTo(tx0, ly); ctx.lineTo(tx0 + bw, ly); ctx.stroke(); ctx.shadowBlur = 0;
    // dot + soft ring
    const col = o.color || '#ffffff', rg = ctx.createRadialGradient(x, y, 0, x, y, 22); rg.addColorStop(0, 'rgba(255,255,255,0.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(x - 22, y - 22, 44, 44);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, 10.5, 0, TAU); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 4.6, 0, TAU); ctx.fill();
    ctx.restore();
    const al = sd > 0 ? 'left' : 'left'; pvText(T1, tx0, ly - (sub ? 46 : 14), 25, { font: PV.sans, weight: 700, spacing: 4, align: al, alpha: a });
    if (sub) pvText(sub, tx0, ly - 13, 27, { italic: true, align: al, alpha: a * 0.82 }); };
  if (DEFER) DEFER.push(f); else f(); }
