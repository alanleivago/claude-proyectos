
// =====================================================================
//  FOLD — the ground has too much length. 46–56 s: ripples and rolling pulses run through the lawn and the promenade,
//  the asphalt cracks, steam/dust plumes burst up; 50–56 s: the land ahead (z ≈ -61 … -86) folds up into a ~22 m wall
//  of earth (strata, rocks, a torn grass lip; the road, lamps, benches and trees carried up its face), asphalt slabs
//  break and tilt at its foot, debris and turf fall, dust rolls. It stays after π comes back (only near ripples settle).
//  One mapping (foldMap: base x,z + offset along the normal → deformed point and tilt) drives the ground, the path,
//  the curbs and everything that stands on them.
// =====================================================================
const FOLD_PULSES = [[45.9, 0.3], [47.4, 0.45], [48.9, 0.55], [50.4, 0.45], [51.9, 0.35], [53.4, 0.3]];
const FOLD_TMP = { p: [0, 0, 0], o: [0, 0, 0, 0, 0], v: new THREE.Vector3(), w: new THREE.Vector3(), s: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), e: new THREE.Euler(), m: new THREE.Matrix4(), m2: new THREE.Matrix4() };
const foldK = (t) => ss(49.6, 55.4, t);
const foldFoot = (x) => -62.5 + 1.4 * Math.sin(x * 0.045 + 0.8) + 0.8 * Math.sin(x * 0.12 + 2.0) - 1.5 * ss(8, 40, Math.abs(x));
const foldHgt = (x) => (15 + 5 * ss(4, 26, Math.abs(x)) + 2.2 * Math.sin(x * 0.09 + 0.4) + 1.0 * Math.sin(x * 0.31 + 1.1)) * (1 - ss(70, 95, Math.abs(x)));
const foldRough = (x, s) => 0.5 * Math.sin(x * 0.83 + s * 0.37) * Math.sin(s * 0.61 - x * 0.29 + 1.3) + 0.25 * Math.sin(x * 1.9 + s * 1.7 + 0.4) + 0.35 * Math.max(0, Math.sin(x * 0.23 + 2.0)) * Math.sin(s * 0.9 + 0.5);
const foldTh = (k, H) => 1.43 * ss(0, 0.45, k) * ss(0, 4, H);
// the profile of the fold by arc length s: a fillet up from the lawn, the steep face, the rounded lip, the plateau → [d back, h up, tilt]
function foldProf(s, H, k, o) { const th = foldTh(k, H), r1 = 3.5, r2 = 2.2, Lf = H * k, a1 = r1 * th, a2 = a1 + Lf, a3 = a2 + r2 * th;
  if (th < 1e-4) { o[0] = s; o[1] = 0; o[2] = 0; return o; } const sT = Math.sin(th), cT = Math.cos(th);
  if (s < a1) { const p = s / r1; o[0] = r1 * Math.sin(p); o[1] = r1 * (1 - Math.cos(p)); o[2] = p; return o; }
  const dA = r1 * sT, hA = r1 * (1 - cT); if (s < a2) { const u = s - a1; o[0] = dA + u * cT; o[1] = hA + u * sT; o[2] = th; return o; }
  const dB = dA + Lf * cT, hB = hA + Lf * sT; if (s < a3) { const p = th - (s - a2) / r2; o[0] = dB + r2 * (sT - Math.sin(p)); o[1] = hB + r2 * (Math.cos(p) - cT); o[2] = p; return o; }
  o[0] = dB + r2 * sT + (s - a3); o[1] = hB + r2 * (1 - cT); o[2] = 0; return o; }
// base distance behind the foot of the torn grass lip (where turf breaks off)
function foldLipS(x, k) { const H = foldHgt(x), th = foldTh(k, H); return (3.5 * th + H * k + 0.5 * 2.2 * th) / (1 + 0.65 * k); }
// ripples and rolling pulses (vertical); they run toward you; after π comes back only the far buckles stay
function foldWave(x, z, t) { if (t < 45.8 || z > 16) return 0; const tt = Math.min(t, 55.9), m = (t < 56 ? 1 : ss(-40, -50, z)) * (1 - ss(5, 15, z)); if (m <= 0) return 0;
  const a = 0.15 * ss(46.3, 49.5, tt) * (0.5 + 0.5 * ss(-22, -52, z));
  let y = a * (Math.sin(0.42 * z - 2.6 * tt + 0.06 * x) + 0.55 * Math.sin(0.74 * z - 1.9 * tt - 0.2 * x + 1.3) + 0.3 * Math.sin(1.3 * z - 3.7 * tt + 0.37 * x + 0.5) + 0.25 * Math.sin(0.3 * x + 0.21 * z - 1.1 * tt));
  for (let i = 0; i < FOLD_PULSES.length; i++) { const [t0, h] = FOLD_PULSES[i], u = tt - t0; if (u <= 0) continue; const zc = -70 + 15 * u + 2.5 * Math.sin(x * 0.07 + t0), q = (z - zc) / 3.8; if (q * q < 16) y += h * Math.exp(-q * q) * (0.75 + 0.25 * Math.sin(x * 0.15 + t0 * 3)) * (1 - ss(5, 20, zc)); }
  return y * m; }
const foldPass = (i, z) => FOLD_PULSES[i][0] + (z + 70) / 15;
function foldFlatY(x, z, t, k, zF) { const s = zF - z; let y = foldWave(x, z, t); if (s > -3) y *= 1 - ss(-3, 1, s);
  if (k > 0 && s > -7 && s < 0) y += 0.5 * k * Math.exp(-(((s + 2.5) / 1.6) ** 2)) * (1 - ss(-1, 0, s)); return y; }
// base point (x, z) with an offset along the surface normal → o = [X, Y, Z, tilt about x, dirt]
function foldMap(x, z, off, t, k, o, needPhi) { const zF = foldFoot(x), s = zF - z, tear = k > 0 ? k * 0.9 * Math.exp(-(((s + 0.4) / 0.8) ** 2)) : 0;
  if (s <= 0 || k <= 0) { const y = foldFlatY(x, z, t, k, zF); let ph = 0; if (needPhi && t >= 45.8) ph = -Math.atan((foldFlatY(x, z + 0.3, t, k, zF) - foldFlatY(x, z - 0.3, t, k, zF)) / 0.6);
    o[0] = x; o[1] = y + off * Math.cos(ph); o[2] = z + off * Math.sin(ph); o[3] = ph; o[4] = tear; return o; }
  const P = foldProf(s * (1 + 0.65 * k), foldHgt(x), k, FOLD_TMP.p), ph = P[2], w = foldWave(x, z, t) * (1 - ss(-3, 1, s)), r = k * Math.sin(ph) * foldRough(x, s) + off;
  o[0] = x; o[1] = P[1] + w + r * Math.cos(ph); o[2] = zF - P[0] + r * Math.sin(ph); o[3] = ph; o[4] = Math.max(clamp((Math.sin(ph) - 0.3) / 0.35), tear); return o; }

// ---- textures
function foldStrataTex() { return wrap(g3Tex((x, w, h) => { const R = RNG('fstrata'), pal = ['#5e4632', '#6a503a', '#4c3828', '#7a6048', '#584434', '#423022', '#705842', '#8a725a', '#644c36'];
  let y = 0; while (y < h) { const th = R.r(5, 34); x.fillStyle = R.pick(pal); x.fillRect(0, y, w, th + 1); x.fillStyle = 'rgba(30,18,8,0.25)'; x.fillRect(0, y + th - 2, w, 2); y += th; }
  for (let k = 0; k < 50; k++) blot(x, R.r(0, w), R.r(0, h), R.r(10, 50), R.pick(['rgba(40,24,12,0.28)', 'rgba(170,140,100,0.2)', 'rgba(60,40,20,0.2)']));
  x.globalAlpha = 0.16; for (let k = 0; k < 90; k++) { x.fillStyle = R.f() < 0.7 ? '#2e1e10' : '#b89a70'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(20, 110)); } x.globalAlpha = 1;
  x.strokeStyle = 'rgba(45,30,18,0.5)'; for (let k = 0; k < 26; k++) { let px = R.r(0, w), py = R.r(0, h); x.lineWidth = R.r(0.8, 2); x.beginPath(); x.moveTo(px, py); for (let s = 0; s < 6; s++) { px += R.n(8); py += R.r(3, 9); x.lineTo(px, py); } x.stroke(); }
  for (let k = 0; k < 190; k++) { const rx = R.r(2, 10), ry = rx * R.r(0.5, 0.9), px = R.r(0, w), py = R.r(0, h), g = R.r(95, 170) | 0, a = R.r(0, 3);
    x.fillStyle = 'rgba(25,15,8,0.4)'; x.beginPath(); x.ellipse(px + 1, py + ry * 0.5, rx, ry, a, 0, TAU); x.fill(); x.fillStyle = `rgb(${g},${g - 10},${g - 24})`; x.beginPath(); x.ellipse(px, py, rx, ry, a, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,250,235,0.2)'; x.beginPath(); x.ellipse(px - rx * 0.25, py - ry * 0.3, rx * 0.5, ry * 0.4, a, 0, TAU); x.fill(); }
  speck(x, w, h, 7000, ['#3e2a18', '#9a7a58', '#5a4028', '#b09070', '#2a1a0e'], R, 1, 2); }, 512, 512)); }
function foldNoiseTex() { return wrap(g3Tex((x, w) => { const R = RNG('fnoise'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); for (let k = 0; k < 260; k++) blot(x, R.r(0, w), R.r(0, w), R.r(4, 22), R.f() < 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'); }, 128, 128, false)); }
function foldPuffTex() { return g3Tex((x, w) => { const R = RNG('fpuff'); x.clearRect(0, 0, w, w); for (let k = 0; k < 24; k++) { const a = R.r(0, TAU), r = R.r(0, w * 0.2), px = w / 2 + Math.cos(a) * r, py = w / 2 + Math.sin(a) * r * 0.8, rr = R.r(w * 0.12, w * 0.27), l = R.r(200, 255) | 0, g = x.createRadialGradient(px, py, 0, px, py, rr);
  g.addColorStop(0, `rgba(${l},${l},${l},0.42)`); g.addColorStop(0.6, `rgba(${l},${l},${l},0.16)`); g.addColorStop(1, `rgba(${l},${l},${l},0)`); x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2); } }, 128, 128); }
function foldCrackTex(seed) { return g3Tex((x, w, h) => { const R = RNG('fcrk' + seed); x.clearRect(0, 0, w, h); x.lineCap = 'round'; x.lineJoin = 'round';
  const main = []; let px = -4, py = h * R.r(0.35, 0.65); while (px < w + 8) { main.push([px, py]); px += R.r(10, 26); py = clamp(py + R.n(16), h * 0.15, h * 0.85); }
  const top = main.map(([a, b], i) => [a, b - R.r(1, 5) - 3 * Math.sin(i * 0.7) ** 2]), bot = main.map(([a, b]) => [a, b + R.r(1, 5)]);
  x.fillStyle = 'rgba(150,150,150,0.35)'; x.beginPath(); top.forEach(([a, b]) => x.lineTo(a, b - 3)); bot.slice().reverse().forEach(([a, b]) => x.lineTo(a, b + 3)); x.fill();
  x.fillStyle = 'rgba(14,12,11,0.97)'; x.beginPath(); top.forEach(([a, b]) => x.lineTo(a, b)); bot.slice().reverse().forEach(([a, b]) => x.lineTo(a, b)); x.fill();
  x.strokeStyle = 'rgba(18,16,15,0.9)'; for (let k = 0; k < 16; k++) { let [bx, by] = R.pick(main), a = R.f() < 0.5 ? -1.3 : 1.3; x.lineWidth = R.r(1, 3); x.beginPath(); x.moveTo(bx, by); for (let s = 0; s < 5; s++) { a += R.n(0.5); bx += Math.cos(a) * R.r(4, 10) + R.n(4); by += Math.sin(a) * R.r(3, 8); x.lineTo(bx, by); } x.stroke(); } }, 512, 128); }

// ---- geometry helpers
function foldAxis(spans) { const a = []; spans.forEach(([a0, a1, st]) => { const n = Math.max(1, Math.round(Math.abs(a1 - a0) / st)); for (let i = a.length ? 1 : 0; i <= n; i++) a.push(a0 + (a1 - a0) * i / n); }); return a; }
function foldGrid(xs, zs, uvf) { const nx = xs.length, nz = zs.length, n = nx * nz, pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const v = j * nx + i, [u, w] = uvf(xs[i], zs[j]); pos[v * 3] = xs[i]; pos[v * 3 + 2] = zs[j]; uv[v * 2] = u; uv[v * 2 + 1] = w; }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
// the lawn material: grass on flat ground, earth strata (and rocks) where it is steep or torn, a ragged edge between
function foldGroundMat(base) { const m = base.clone(), strata = foldStrataTex(), nz = foldNoiseTex();
  m.onBeforeCompile = (sh) => { sh.uniforms.uStrata = { value: strata }; sh.uniforms.uFNoise = { value: nz };
    sh.vertexShader = 'attribute float aDirt;\nvarying float vDirt;\nvarying vec3 vFWp;\nvarying vec3 vFWn;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vDirt = aDirt; vFWp = (modelMatrix * vec4(transformed, 1.0)).xyz; vFWn = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = 'uniform sampler2D uStrata, uFNoise;\nvarying float vDirt;\nvarying vec3 vFWp;\nvarying vec3 vFWn;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      { vec3 fn = normalize(vFWn); float stp = smoothstep(0.2, 0.65, 1.0 - fn.y);
        float nz = texture2D(uFNoise, vFWp.xz * 0.07 + vec2(0.0, vFWp.y * 0.09)).r * 0.65 + texture2D(uFNoise, vFWp.xz * 0.31 + vec2(vFWp.y * 0.27, 0.0)).r * 0.35;
        float dm = smoothstep(0.44, 0.56, vDirt + (nz - 0.5) * 0.8);
        vec2 uvS = mix(vFWp.xz * 0.07, vec2(vFWp.x * 0.055 + vFWp.z * 0.02, vFWp.y * 0.075 + 0.05 * sin(vFWp.x * 0.11)), stp);
        vec3 dc = texture2D(uStrata, uvS).rgb * mix(0.6, 1.0, smoothstep(-0.3, 3.5, vFWp.y)) * mix(0.85, 1.1, nz);
        diffuseColor.rgb = mix(diffuseColor.rgb, dc, dm); }`); };
  m.customProgramCacheKey = () => 'foldgnd'; return m; }

function buildFold(st, S) { const R = RNG('fold'), F = { o: [0, 0, 0, 0, 0], dirty: true }; S.fd = F;
  // the lawn: rebuilt as a finer grid (fine across the park, finest where it folds), same placement and texture mapping
  { F.gxs = foldAxis([[-600, -100, 25], [-100, -30, 2.5], [-30, 30, 0.75], [30, 100, 2.5], [100, 600, 25]]); F.gzs = foldAxis([[214, 12, 4], [12, -50, 0.5], [-50, -86, 0.3]]);
    const g = foldGrid(F.gxs, F.gzs, (x, z) => [(x + 600) / 1200, (150 - (z - S.gOZ)) / 300]); g.setAttribute('aDirt', new THREE.BufferAttribute(new Float32Array(F.gxs.length * F.gzs.length), 1));
    S.gnd.geometry.dispose(); S.gnd.geometry = g; S.gnd.material = foldGroundMat(S.gnd.material); S.g0 = g.attributes.position.array.slice(); }
  // the promenade: a finer grid (same UVs); it lies just above the lawn along the normal
  { F.pxs = foldAxis([[-PATH_W / 2, PATH_W / 2, 0.5]]); F.pzs = foldAxis([[20, -50, 0.5], [-50, -86, 0.25]]); const g = foldGrid(F.pxs, F.pzs, (x, z) => [(x + PATH_W / 2) / PATH_W, (53 - (z - S.pOZ)) / 106]);
    S.path.geometry.dispose(); S.path.geometry = g; S.p0 = g.attributes.position.array.slice(); const pm = S.path.material; pm.polygonOffset = true; pm.polygonOffsetFactor = -1; pm.polygonOffsetUnits = -2; }
  // the curbs: segmented so they can bend with the path
  F.curbs = []; st.scene.children.filter((o) => o.isMesh && o.geometry.type === 'BoxGeometry' && o.geometry.parameters.depth === 106).forEach((c) => { const g = new THREE.BoxGeometry(0.25, 0.12, 106, 1, 1, 424), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + c.position.x, p.getY(i) + c.position.y, p.getZ(i) + c.position.z); c.geometry.dispose(); c.geometry = g; c.position.set(0, 0, 0); g.computeBoundingSphere(); F.curbs.push({ c, b: p.array.slice() }); });
  // everything static standing on the park ground rides it: anchors (things at ground level) and their parts (canopies, lamp heads, glows)
  { const skip = new Set([S.gnd, S.path, st.cam, ...F.curbs.map((c) => c.c), ...S.bub.map((b) => b.b), ...S.mh.map((m) => m.cov)]), list = [];
    st.scene.children.forEach((o) => { if (skip.has(o) || o.isInstancedMesh || !(o.isMesh || o.isGroup || o.isSprite)) return; const p = o.position; if (Math.abs(p.x) > 80 || p.z > 22 || p.z < -88 || p.y < -0.5 || p.y > 12) return;
      if (o.isMesh) { o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) > 12) return; } list.push(o); });
    F.anc = []; list.filter((o) => o.position.y < 0.35).forEach((o) => { if (!F.anc.some((a) => Math.hypot(a.x - o.position.x, a.z - o.position.z) < 0.05)) F.anc.push({ x: o.position.x, z: o.position.z, ex: R.r(-0.3, 0.45), ez: R.n(0.3), q: new THREE.Quaternion(), X: 0, Y: 0, Z: 0 }); });
    F.stat = list.map((o) => { let best = null, bd = 2.6; F.anc.forEach((a) => { const d = Math.hypot(a.x - o.position.x, a.z - o.position.z); if (d < bd) { bd = d; best = a; } });
      if (!best) { best = { x: o.position.x, z: o.position.z, ex: R.r(-0.3, 0.45), ez: R.n(0.3), q: new THREE.Quaternion(), X: 0, Y: 0, Z: 0 }; F.anc.push(best); } return { o, a: best, p0: o.position.clone(), q0: o.quaternion.clone() }; });
    F.ims = st.scene.children.filter((o) => o.isInstancedMesh && (o.count === 9000 || o.count === 1200)).map((m) => { m.frustumCulled = false; return { m, b: m.instanceMatrix.array.slice() }; }); }
  // cracks opening across the path (dark asphalt) and tears in the lawn (earth), timed to the pulses that pass under them
  { const tex = [0, 1, 2, 3].map(foldCrackTex), mk = (cx, cz, w, d, yaw, col, tc) => { const g = new THREE.PlaneGeometry(w, d, 12, 3).rotateX(-Math.PI / 2).rotateY(yaw), p = g.attributes.position;
      const m = new THREE.Mesh(g, STDm({ map: R.pick(tex), color: col, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, roughness: 1 })); m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; m.visible = false; st.scene.add(m);
      return { m, b: p.array.slice(), cx, cz, tc }; };
    const tcAt = (z) => { const ok = FOLD_PULSES.map((_, i) => foldPass(i, z) + 0.15).filter((v) => v > 47.2 && v < 54.5); return ok.length ? R.pick(ok) : R.r(48, 53); };
    F.cracks = []; for (let i = 0; i < 13; i++) { const z = -34 - i * 2.0 - R.r(0, 1.2); F.cracks.push(mk(R.n(0.8), z, R.r(6.5, 9), R.r(1.3, 2.3), R.n(0.35), '#ffffff', tcAt(z))); }
    for (let i = 0; i < 10; i++) { const z = R.r(-30, -58); F.cracks.push(mk((i % 2 ? 1 : -1) * R.r(6, 18), z, R.r(4, 8), R.r(1.4, 2.4), R.n(0.6), '#7a5030', tcAt(z))); } }
  // broken asphalt slabs: tilted up where the path meets the fold, and a few lifting along the cracks
  { const n = 34, m = IM(new THREE.BoxGeometry(1, 1, 1), STDm({ map: texNoise('fslab', '#56585c', ['#4a4c50', '#606266', '#3e4044', '#6a6c70'], 4000), roughness: 0.9 }), n); m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); st.scene.add(m);
    F.slab = { m, L: [] }; for (let i = 0; i < 24; i++) F.slab.L.push({ x: (i % 2 ? 1 : -1) * R.r(0.9, 2.5), s: -3.4 + Math.floor(i / 2) * 0.5 + R.n(0.25), sx: R.r(1.6, 2.8), sz: R.r(0.9, 1.6), rx: (R.f() < 0.65 ? -1 : 1) * R.r(0.25, 0.8), ry: R.n(0.3), rz: R.n(0.35), fold: true });
    for (let i = 0; i < 10; i++) { const c = F.cracks[i]; if (i % 2) continue; F.slab.L.push({ x: c.cx + R.n(2.2), z: c.cz + R.r(0.6, 1.1), sx: R.r(1.0, 1.8), sz: R.r(0.6, 1.0), rx: R.r(0.08, 0.2), ry: R.n(0.3), rz: R.n(0.08), tc: c.tc, th: 0.1 }); } m.count = F.slab.L.length; }
  // rocks embedded in the face, rocks and clods that break off, turf that falls from the lip
  { const n = 420, m = IM(lumpyGeo(1, 0.4, 31), STDm({ roughness: 0.95, flatShading: true }), n); m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); st.scene.add(m); F.rock = { m, L: [] };
    for (let i = 0; i < n; i++) { const ty = i < 240 ? 0 : i < 370 ? 1 : 2, r = R.n(1), x = Math.sign(r) * Math.abs(r) ** 1.4 * (ty === 2 ? 22 : 32), q = { ty, x, s: R.r(0.8, 14), sc: ty === 2 ? R.r(0.2, 0.45) : 0.08 + R.f() ** 2.5 * (ty ? 0.4 : 0.55), rx: R.r(0, 6), ry: R.r(0, 6), rz: R.r(0, 6), tl: ty === 0 ? 99 : R.r(ty === 2 ? 52.3 : 51.4, 56.8), vx: R.n(0.8), vy: R.r(0, 1.6), vz: R.r(1.2, 4.2), sp: R.n(4) };
      m.setColorAt(i, lin(ty === 2 ? R.pick(['#4a7a30', '#3e6a28', '#5a8a3a']) : R.f() < 0.55 ? R.pick(['#7a6a58', '#8a7a66', '#6a5c4c', '#9a8a74']) : R.pick(['#6a4a30', '#5a3e26', '#7a5636']))); F.rock.L.push(q); } }
  // steam / dust plumes bursting up as the pulses pass; the big dust of the fold; puffs along its face
  { const tx = foldPuffTex(), sp = (col) => { const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, color: col, transparent: true, depthWrite: false, opacity: 0 })); d.visible = false; st.scene.add(d); return d; };
    const tbAt = (z, a, b) => { const ok = FOLD_PULSES.map((_, i) => foldPass(i, z) + R.r(0, 0.3)).filter((v) => v > a && v < b); return ok.length ? R.pick(ok) : R.r(a, b); };
    F.plume = []; for (let i = 0; i < 40; i++) { let x, z, tb; if (i < 14) { x = R.f() < 0.5 ? R.n(2.5) : (i % 2 ? 1 : -1) * R.r(3.4, 4.6); z = R.r(-30, -60); tb = tbAt(z, 46.2, 55); } else if (i < 30) { x = (i % 2 ? 1 : -1) * R.r(5, 24); z = R.r(-24, -60); tb = tbAt(z, 46.2, 55); } else { x = R.r(3, 13); z = R.r(-34, -50); tb = tbAt(z, 47.2, 49.8); }
      const L = []; for (let j = 0; j < 6; j++) L.push({ d: sp(R.f() < 0.7 ? '#f2f0ea' : '#d8ccb8'), dt: j * 0.1 + R.r(0, 0.12), life: R.r(2.6, 4.2), h: R.r(0.6, 1.3), dx: R.n(0.8), dz: R.n(0.8), s: R.r(0.7, 1.3), rot: R.r(0, 6) }); F.plume.push({ x, z, tb, L }); }
    F.dust = []; for (let i = 0; i < 64; i++) { const r = R.n(1); F.dust.push({ d: sp(R.pick(['#c2a888', '#b49878', '#d0bca0'])), x: Math.sign(r) * Math.abs(r) ** 1.5 * 34, s: R.r(-3.5, 13), off: R.r(1.0, 3.5), tb: 50.4 + R.r(0, 4.8), life: R.r(5, 8), sc: R.r(0.7, 1.3), rot: R.r(0, 6) }); }
    F.puff = []; for (let i = 0; i < 44; i++) F.puff.push({ d: sp('#b8a080'), x: R.n(26), s: R.r(2, 13), tb: R.r(51.2, 56.4), life: R.r(1.8, 2.8), sc: R.r(0.7, 1.4), rot: R.r(0, 6) }); }
}

function poseFold(S, t) { const F = S.fd, act = t >= 45.8, o = F.o, T = FOLD_TMP;
  if (!act && !F.dirty) return; F.dirty = act; const k = foldK(t);
  // the lawn and the promenade
  { const g = S.gnd.geometry, p = g.attributes.position.array, dA = g.attributes.aDirt.array, xs = F.gxs, zs = F.gzs, nx = xs.length;
    for (let j = 0; j < zs.length; j++) for (let i = 0; i < nx; i++) { const v = j * nx + i; foldMap(xs[i], zs[j], 0, t, k, o, false); p[v * 3] = o[0]; p[v * 3 + 1] = o[1]; p[v * 3 + 2] = o[2] - S.gOZ; dA[v] = o[4]; }
    g.attributes.position.needsUpdate = true; g.attributes.aDirt.needsUpdate = true; g.computeVertexNormals(); }
  { const g = S.path.geometry, p = g.attributes.position.array, xs = F.pxs, zs = F.pzs, nx = xs.length;
    for (let j = 0; j < zs.length; j++) for (let i = 0; i < nx; i++) { const v = j * nx + i; foldMap(xs[i], zs[j], 0.04, t, k, o, true); p[v * 3] = o[0]; p[v * 3 + 1] = o[1] - 0.02; p[v * 3 + 2] = o[2] - S.pOZ; }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals(); }
  F.curbs.forEach(({ c, b }) => { const p = c.geometry.attributes.position.array; for (let i = 0; i < b.length; i += 3) { foldMap(b[i], b[i + 2], b[i + 1], t, k, o, true); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; } c.geometry.attributes.position.needsUpdate = true; c.geometry.computeVertexNormals(); });
  // static things ride the ground (and lean near the fold)
  F.anc.forEach((a) => { foldMap(a.x, a.z, 0, t, k, o, true); const f = k * (1 - ss(1, 9, Math.abs(foldFoot(a.x) - a.z + 1))); a.X = o[0]; a.Y = o[1]; a.Z = o[2]; a.q.setFromEuler(T.e.set(o[3] + a.ex * f, 0, a.ez * f)); });
  F.stat.forEach((m) => { const a = m.a, v = T.v.copy(m.p0); v.x -= a.x; v.z -= a.z; v.applyQuaternion(a.q); m.o.position.set(a.X + v.x, a.Y + v.y, a.Z + v.z); m.o.quaternion.copy(a.q).multiply(m.q0); });
  F.ims.forEach(({ m, b }) => { const arr = m.instanceMatrix.array; for (let i = 0; i < m.count; i++) { const ax = b[i * 16 + 12], az = b[i * 16 + 14]; foldMap(ax, az, 0, t, k, o, true); if (m.count === 1200 && o[3] > 0.6) { T.m.copy(_hid).toArray(arr, i * 16); continue; } T.m.makeRotationX(o[3]); T.v.set(ax, 0, az).applyMatrix4(T.m); T.m.setPosition(o[0] - T.v.x, o[1] - T.v.y, o[2] - T.v.z); T.m2.fromArray(b, i * 16); T.m.multiply(T.m2); T.m.toArray(arr, i * 16); } m.instanceMatrix.needsUpdate = true; });
  [F.slab.m, F.rock.m].forEach((m) => (m.visible = act)); F.cracks.forEach((c) => (c.m.visible = false)); [...F.plume.flatMap((p) => p.L), ...F.dust, ...F.puff].forEach((d) => (d.d.visible = false));
  if (!act) return;
  // moving things (re-posed every frame before this): people, bikes, manhole covers, the crowd
  const lift = (obj) => { const p = obj.position; foldMap(p.x, p.z, 0, t, k, o, false); p.set(o[0], p.y + o[1], o[2]); };
  S.walk.forEach((w, i) => { const r = w.p.root, y0 = r.position.y; lift(r); if (i === 2) { const dy = r.position.y - y0; S.balloon.position.y += dy; S.string.position.y += dy; } });
  S.bikes.forEach((b) => { lift(b.g); lift(b.rider.root); }); S.mh.forEach((m) => lift(m.cov));
  { const C = S.crowd, ims = [C.body, C.head, C.hair, C.armL, C.armR], ba = C.body.instanceMatrix.array; for (let i = 0; i < C.L.length; i++) { if (ba[i * 16 + 15] === 0) continue; const ax = ba[i * 16 + 12], az = ba[i * 16 + 14]; foldMap(ax, az, 0, t, k, o, true);
      T.m.makeRotationX(o[3]); T.v.set(ax, 0, az).applyMatrix4(T.m); T.m.setPosition(o[0] - T.v.x, o[1] - T.v.y, o[2] - T.v.z); ims.forEach((m) => { T.m2.fromArray(m.instanceMatrix.array, i * 16); T.m2.premultiply(T.m); T.m2.toArray(m.instanceMatrix.array, i * 16); }); } ims.forEach((m) => (m.instanceMatrix.needsUpdate = true)); }
  // cracks open as the pulses pass
  F.cracks.forEach((c) => { const r = ss(c.tc, c.tc + 0.7, t); if (r <= 0) return; c.m.visible = true; c.m.material.opacity = r; const p = c.m.geometry.attributes.position.array, sx = 0.25 + 0.75 * r;
    for (let i = 0; i < c.b.length; i += 3) { foldMap(c.cx + c.b[i] * sx, c.cz + c.b[i + 2], 0.05, t, k, o, true); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; } c.m.geometry.attributes.position.needsUpdate = true; c.m.geometry.computeVertexNormals(); });
  // slabs
  { const { m, L } = F.slab; L.forEach((q, i) => { const tf = q.fold ? ss(0.03, 0.4, k) : ss(q.tc, q.tc + 0.9, t); if (tf <= 0.001) { m.setMatrixAt(i, _hid); return; } const zF = foldFoot(q.x), z = q.fold ? zF - q.s : q.z;
      foldMap(q.x, z, q.th ? 0.0 : 0.05 + 0.1 * tf, t, k, o, true); T.q.setFromEuler(T.e.set(o[3], 0, 0)); T.q2.setFromEuler(T.e.set(q.rx * tf, q.ry, q.rz * tf, 'YXZ')); T.q.multiply(T.q2);
      m.setMatrixAt(i, T.m.compose(T.v.set(o[0], o[1], o[2]), T.q, T.s.set(q.sx, (q.th || 0.22) * Math.min(1, tf * 3), q.sz))); }); m.instanceMatrix.needsUpdate = true; }
  // rocks: embedded on the steep face; some break off and fall, turf drops from the lip; they land and stay
  { const { m, L } = F.rock; L.forEach((q, i) => { let sc = q.sc, rx = q.rx, X, Y, Z;
      if (t < q.tl) { if (q.ty === 2 || k <= 0.02) { m.setMatrixAt(i, _hid); return; } foldMap(q.x, foldFoot(q.x) - q.s, -0.25 * q.sc, t, k, o, true); sc *= ss(0.55, 0.95, o[3]) * ss(0.05, 0.3, k); if (sc < 0.01) { m.setMatrixAt(i, _hid); return; } X = o[0]; Y = o[1]; Z = o[2]; rx += o[3]; }
      else { const kl = foldK(q.tl), sL = q.ty === 2 ? foldLipS(q.x, kl) : q.s; foldMap(q.x, foldFoot(q.x) - sL, 0.35 * q.sc, q.tl, kl, o, true); const g = 7.8, yG = 0.25 * q.sc + 0.2, uL = (q.vy + Math.sqrt(q.vy * q.vy + 2 * g * Math.max(0, o[1] - yG))) / g, u = Math.min(t - q.tl, uL), roll = ss(0, 1.2, t - q.tl - uL);
        X = o[0] + q.vx * u; Y = o[1] + q.vy * u - 0.5 * g * u * u; Z = o[2] + q.vz * u + 0.6 * roll; rx += q.sp * (u + 0.5 * roll); }
      T.q.setFromEuler(T.e.set(rx, q.ry, q.rz)); m.setMatrixAt(i, T.m.compose(T.v.set(X, Y, Z), T.q, T.s.set(sc, q.ty === 2 ? sc * 0.45 : sc * 0.8, sc))); }); m.instanceMatrix.needsUpdate = true; }
  // plumes: puffs rise and spread from the ground where a pulse passes
  F.plume.forEach((pl) => { const near = t < 56 ? 1 : ss(-38, -46, pl.z); pl.L.forEach((q) => { const u = (t - pl.tb - q.dt) / q.life; if (u <= 0 || u >= 1 || near <= 0) return; foldMap(pl.x + q.dx * u, pl.z + q.dz * u, 0, t, k, o, false);
    q.d.visible = true; q.d.position.set(o[0], o[1] + 0.25 + 5.5 * q.h * (1 - (1 - u) ** 2) * (0.6 + 0.4 * q.dt * 2), o[2]); q.d.scale.setScalar((0.6 + 3.4 * Math.sqrt(u)) * q.s); q.d.material.rotation = q.rot + u * 0.6; q.d.material.opacity = 0.7 * ss(0, 0.06, u) * (1 - u) ** 1.5 * near; }); });
  // the big dust of the fold (a thin haze of it stays)
  F.dust.forEach((q) => { const u = (t - q.tb) / q.life; if (u <= 0) return; const uu = Math.min(u, 1); foldMap(q.x, foldFoot(q.x) - q.s, q.off, t, k, o, false);
    q.d.visible = true; q.d.position.set(o[0], o[1] + 2.2 * uu, o[2] + 1.5 * uu); q.d.scale.setScalar(q.sc * (3 + 9 * Math.sqrt(uu))); q.d.material.rotation = q.rot + uu * 0.4; q.d.material.opacity = 0.6 * ss(0, 0.08, uu) * (1 - 0.75 * ss(0.25, 1, uu)); });
  F.puff.forEach((q) => { const u = (t - q.tb) / q.life; if (u <= 0 || u >= 1 || k < 0.1) return; foldMap(q.x, foldFoot(q.x) - q.s, 0.6 + 1.2 * u, t, k, o, false);
    q.d.visible = true; q.d.position.set(o[0], o[1] - 0.8 * u, o[2]); q.d.scale.setScalar(q.sc * (1 + 3.5 * Math.sqrt(u))); q.d.material.rotation = q.rot; q.d.material.opacity = 0.6 * ss(0, 0.1, u) * (1 - u) ** 1.3; });
}
