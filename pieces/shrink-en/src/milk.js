// =====================================================================
//  MILK — she falls into a milk drop on the counter (fall), swims among fat globules (milk), among bacteria
//  (bact, bact2) and lands on a somatic cell like a planet (cell, cell2). 31–44 s. Prefix: mk.
// =====================================================================
const mkGLN = `
float mkh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float mkn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(mkh(i), mkh(i + vec3(1,0,0)), f.x), mix(mkh(i + vec3(0,1,0)), mkh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(mkh(i + vec3(0,0,1)), mkh(i + vec3(1,0,1)), f.x), mix(mkh(i + vec3(0,1,1)), mkh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float mkf(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * mkn(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); m *= 0.5; } return a; }`;
// JS value noise (same idea) for geometry displacement
const mkH = (x, y, z) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return h - Math.floor(h); };
function mkN(x, y, z) { const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z); let fx = x - ix, fy = y - iy, fz = z - iz; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const L = (a, b, k) => a + (b - a) * k, c = (i, j, k) => mkH(ix + i, iy + j, iz + k);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), fx), L(c(0, 1, 0), c(1, 1, 0), fx), fy), L(L(c(0, 0, 1), c(1, 0, 1), fx), L(c(0, 1, 1), c(1, 1, 1), fx), fy), fz); }
function mkF(x, y, z, o = 4) { let a = 0, m = 0.5; for (let i = 0; i < o; i++) { a += m * mkN(x, y, z); x = x * 2.03 + 1.7; y = y * 2.03 + 9.2; z = z * 2.03 + 3.1; m *= 0.5; } return a; }

// a fresnel rim (tinted by the surface colour) + a soft inner glow: membranes that scatter light
function mkRim(m, col, p = 3, k = 0.5, ik = 0, key = '') { const U = { uRim: { value: lin(col) } };
  m.onBeforeCompile = (sh) => { sh.uniforms.uRim = U.uRim; sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <output_fragment>',
    `{ float fr = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), ${p.toFixed(2)}); outgoingLight += uRim * diffuseColor.rgb * (fr * ${k.toFixed(3)} + ${ik.toFixed(3)} * (1.0 - fr)); }
#include <output_fragment>`); };
  m.customProgramCacheKey = () => 'mkrim' + col + p + k + ik + key; return m; }

// the world around (a gradient sphere that follows the camera): light from above, deeper warm tones below, soft cloudy scattering
function mkBack(st, o) { const U = { uTop: { value: lin(o.top) }, uMid: { value: lin(o.mid) }, uBot: { value: lin(o.bot) }, uGl: { value: lin(o.glow || o.top) }, uL: { value: (o.L || new THREE.Vector3(0.3, 1, 0.2)).clone().normalize() }, uCl: { value: o.cloud ?? 0.12 }, uWin: { value: o.win ? 1 : 0 } };
  const m = new THREE.Mesh(new THREE.SphereGeometry(100, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 uTop, uMid, uBot, uGl, uL; uniform float uCl, uWin; varying vec3 vD; ${mkGLN}
void main(){ vec3 d = normalize(vD); vec3 c = mix(uBot, uMid, smoothstep(-0.75, 0.05, d.y)); c = mix(c, uTop, smoothstep(0.0, 0.85, d.y));
  float g = max(dot(d, uL), 0.0); c += uGl * (pow(g, 6.0) * 0.55 + pow(g, 40.0) * 0.5);
  float n = mkf(d * 2.6) - 0.5, n2 = mkf(d * 7.0 + 4.0) - 0.5; c *= 1.0 + uCl * (n * 1.4 + n2 * 0.6);
  if (uWin > 0.5) { float az = atan(d.x, -d.z); float w = smoothstep(0.2, 0.12, abs(az + 0.9)) * smoothstep(0.06, 0.14, d.y) * smoothstep(0.45, 0.36, d.y); c = mix(c, vec3(1.05, 1.03, 0.98), w * 0.7);
    float cab = smoothstep(0.5, 0.56, d.y); c = mix(c, c * vec3(0.62, 0.5, 0.4), cab * (1.0 - w) * 0.8); float bs = smoothstep(-0.02, 0.02, d.y) * smoothstep(0.1, 0.04, d.y); c *= 1.0 - 0.12 * bs; }
  gl_FragColor = vec4(c, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` }));
  m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); st.mkBack = m; return U; }
const mkFollow = (st) => { if (st.mkBack) st.mkBack.position.copy(st.cam.position); };

// pose helpers: stand her body centre at c, oriented (yaw, pitch forward, roll), with posePerson limbs
const _mkE = new THREE.Euler(0, 0, 0, 'YXZ'), _mkA = new THREE.Vector3();
function mkOrient(P, c, h, yaw, pitch, roll, q = {}) { placeGirl(P, 0, 0, 0, h, q); P.root.rotation.order = 'YXZ'; P.root.rotation.set(pitch, yaw, roll);
  _mkA.set(0, 1, 0).applyEuler(P.root.rotation); P.root.position.set(c[0] - _mkA.x * 0.55 * h, c[1] - _mkA.y * 0.55 * h, c[2] - _mkA.z * 0.55 * h); }
// a front-crawl / breaststroke mix that reads at a glance; ph = stroke phase
function mkSwimQ(ph, o = {}) { const a = Math.sin(ph), b = Math.sin(ph + Math.PI), k = Math.sin(ph * 2);
  return Object.assign({ armL: [1.75 + 1.25 * a, 0.3 + 1.0 * Math.max(0, Math.cos(ph)), 0.2 + 0.8 * Math.max(0, Math.cos(ph))], armR: [1.75 + 1.25 * b, 0.3 + 1.0 * Math.max(0, -Math.cos(ph)), 0.2 + 0.8 * Math.max(0, -Math.cos(ph))],
    legL: [0.12 + 0.28 * k, 0.3 + 0.25 * Math.max(0, k)], legR: [0.12 - 0.28 * k, 0.3 + 0.25 * Math.max(0, -k)], headPitch: -0.75, look: [0, 0.4], emo: { surprise: 0.25 } }, o); }

// ---- bacteria and friends: rods (some with flagella), lactobacillus chains, lactococcus pairs/chains. All sizes in µm, u = µm per unit.
const MK_PAST = ['#c8b4ea', '#a8d4ee', '#f4c4a6', '#b8e2bc', '#f2dc94', '#f2b8cc', '#b4c8f4'];
function mkFlagMat(col, amp = 0.07, k = 2.4, w = 9) { const U = { uT: { value: 0 } }; const m = STDm({ color: col, roughness: 0.5 });
  m.onBeforeCompile = (sh) => { sh.uniforms.uT = U.uT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = vec3(position);
  { float ph = 0.0;
#ifdef USE_INSTANCING
    ph = dot(instanceMatrix[3].xyz, vec3(12.9, 78.2, 37.7));
#endif
    float y = position.y, e = smoothstep(0.0, 0.25, y), a = ${amp.toFixed(3)} * e;
    transformed.x += a * sin(y * ${(k * TAU).toFixed(3)} - uT * ${w.toFixed(2)} + ph); transformed.z += a * 0.8 * cos(y * ${(k * TAU).toFixed(3)} - uT * ${w.toFixed(2)} + ph); }`); };
  m.customProgramCacheKey = () => 'mkflag' + amp + k + w; m.userData.U = U; return m; }
function mkBugs(st, o) { const R = RNG('mkbugs', o.seed || 1), u = o.u, root = new THREE.Group(); st.scene.add(root);
  const C = new THREE.Vector3(...o.c), rad = o.rad, orgs = [];
  const bodyMat = mkRim(new THREE.MeshPhysicalMaterial({ roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: lin('#ffffff') }), '#ffffff', 2.5, 0.55, 0.06, 'bug');
  const geoR = [2.2, 3.2, 4.4].map((a) => new THREE.CapsuleGeometry(0.5, a - 1, 6, 16)), geoL = new THREE.CapsuleGeometry(0.5, 4.2, 6, 16), geoC = new THREE.SphereGeometry(0.5, 18, 14);
  const mems = { r0: [], r1: [], r2: [], lac: [], coc: [], fl: [] };
  const clear = o.clear || (() => null), tA = o.t0 ?? 0, tB = o.t1 ?? 4;
  const posAt = (O, t) => _mkA.copy(O.p0).addScaledVector(O.dir, O.v * t).add(new THREE.Vector3(Math.sin(t * O.w1 + O.ph) * O.wob, Math.sin(t * O.w2 + O.ph * 2) * O.wob, Math.cos(t * O.w1 + O.ph * 3) * O.wob));
  const bad = (O, size) => { for (let t = tA; t <= tB; t += 0.1) { const cs = [].concat(clear(t) || []); const p = posAt(O, t); for (const c of cs) if (p.distanceTo(c.p) < c.r + size) return true; } return false; };
  let tries = 0;
  while (orgs.length < o.n && tries++ < o.n * 8) {
    const kind = R.f() < (o.pLac ?? 0.22) ? 'lac' : R.f() < (o.pCoc ?? 0.25) ? 'coc' : 'rod';
    const dir = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(); const p0 = new THREE.Vector3(R.n(1), R.n(1), R.n(1)); if (p0.length() > 1) continue; p0.multiplyScalar(rad).add(C);
    const O = { kind, p0, dir, v: (kind === 'rod' ? R.r(0.6, 2.2) : R.r(0.1, 0.5)) / u, ph: R.r(0, TAU), w1: R.r(0.6, 1.6), w2: R.r(0.5, 1.4), wob: R.r(0.05, 0.2) / u, spin: R.r(-2, 2), tumble: R.r(-0.4, 0.4), mem: [] };
    const q0 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); O.q0 = q0;
    const col = lin(R.pick(o.cols || MK_PAST)).offsetHSL(R.n(0.02), R.n(0.05), R.n(0.04));
    let size;
    if (kind === 'rod') { const vi = R.i(0, 2), a = [2.2, 3.2, 4.4][vi], wd = R.r(0.5, 0.85) / u, hasF = R.f() < (o.pFlag ?? 0.5), fl = R.r(3, 6) / u; size = hasF ? a * wd * 0.5 + fl : a * wd * 0.6; if (bad(O, size)) continue;
      O.mem.push({ arr: 'r' + vi, off: new THREE.Vector3(), q: new THREE.Quaternion(), s: wd, col });
      if (hasF) { const nf = R.i(1, 3), polar = R.f() < 0.6, fcol = col.clone().lerp(lin('#ffffff'), 0.3);
        for (let f = 0; f < nf; f++) { const ang = R.r(0, TAU), yy = polar ? -a * wd * 0.48 : R.r(-0.4, 0.3) * a * wd, off = polar ? new THREE.Vector3(Math.cos(ang) * wd * 0.15, yy, Math.sin(ang) * wd * 0.15) : new THREE.Vector3(Math.cos(ang) * wd * 0.48, yy, Math.sin(ang) * wd * 0.48);
          const fd = new THREE.Vector3(Math.cos(ang) * (polar ? 0.25 : 0.55), -1, Math.sin(ang) * (polar ? 0.25 : 0.55)).normalize();
          O.mem.push({ arr: 'fl', off, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), fd), s: fl * R.r(0.8, 1.15), col: fcol }); } } }
    else if (kind === 'lac') { const nc = R.i(o.lacMin || 2, o.lacMax || 6), wd = R.r(0.7, 0.9) / u, L = 5.2 * wd; size = nc * L * 0.55; if (bad(O, size)) continue;
      let pos = new THREE.Vector3(0, -(nc - 1) * L * 0.5, 0), q = new THREE.Quaternion(), bend = R.r(-0.25, 0.25), bend2 = R.r(-0.2, 0.2);
      for (let k = 0; k < nc; k++) { O.mem.push({ arr: 'lac', off: pos.clone(), q: q.clone(), s: wd, col: col.clone().offsetHSL(0, 0, R.n(0.03)) });
        const step = new THREE.Vector3(0, L * 1.02, 0).applyQuaternion(q); q = q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(bend, 0, bend2))); const step2 = new THREE.Vector3(0, 0, 0); pos = pos.clone().add(step).add(step2); }
      O.v *= 0.4; }
    else { const nc = R.f() < 0.5 ? 2 : R.i(3, 8), d = R.r(0.7, 1.0) / u; size = nc * d * 0.6; if (bad(O, size)) continue;
      let pos = new THREE.Vector3(0, -(nc - 1) * d * 0.45, 0), q = new THREE.Quaternion(), bend = R.r(-0.35, 0.35);
      for (let k = 0; k < nc; k++) { O.mem.push({ arr: 'coc', off: pos.clone(), q: new THREE.Quaternion(), s: d, sy: 0.92, col: col.clone().offsetHSL(0, 0, R.n(0.03)) });
        pos = pos.clone().add(new THREE.Vector3(0, d * 0.9, 0).applyQuaternion(q)); q = q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(bend, 0, bend * 0.6))); }
      O.v *= 0.5; }
    O.mem.forEach((m) => mems[m.arr].push(m)); orgs.push(O); }
  const fmat = mkFlagMat('#eae6f4');
  const IMs = {}; [['r0', geoR[0]], ['r1', geoR[1]], ['r2', geoR[2]], ['lac', geoL], ['coc', geoC], ['fl', new THREE.CylinderGeometry(0.005, 0.0025, 1, 5, 40, true).translate(0, 0.5, 0)]].forEach(([k, g]) => {
    const n = mems[k].length; if (!n) return; const m = IM(g, k === 'fl' ? fmat : bodyMat, n, k !== 'fl'); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false;
    mems[k].forEach((mm, i) => { mm.i = i; m.setColorAt(i, mm.col); }); root.add(m); IMs[k] = m; });
  const _q = new THREE.Quaternion(), _qs = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _m = new THREE.Matrix4(), Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0);
  return { orgs, root, update(t) { fmat.userData.U.uT.value = t;
    orgs.forEach((O) => { const c = posAt(O, t).clone(); _q.copy(O.q0).multiply(_qs.setFromAxisAngle(X, Math.sin(t * O.w2 + O.ph) * 0.25 + O.tumble * t)).multiply(_qs.setFromAxisAngle(Y, O.spin * t + O.ph));
      O.mem.forEach((mm) => { _p.copy(mm.off).applyQuaternion(_q).add(c); const qq = _qs.copy(_q).multiply(mm.q); _s.set(mm.s, mm.s * (mm.sy || 1), mm.s); _m.compose(_p, qq, _s); IMs[mm.arr].setMatrixAt(mm.i, _m); }); });
    Object.values(IMs).forEach((m) => (m.instanceMatrix.needsUpdate = true)); } }; }

// fat globules: glossy, warm cream membranes (instanced), sizes in µm (lognormal-ish)
function mkGlobMat() { return mkRim(new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 0.35, sheenColor: lin('#fff8e0'), emissive: '#3a2c14', emissiveIntensity: 0.22, envMapIntensity: 1.2 }), '#fff4dc', 2.0, 0.8, 0.1, 'glob'); }
function mkGlobs(st, o) { const R = RNG('mkglob', o.seed || 1), u = o.u, list = [], C = new THREE.Vector3(...o.c), clear = o.clear || (() => null);
  let tries = 0; while (list.length < o.n && tries++ < o.n * 10) { const p = new THREE.Vector3(R.n(1), R.n(1), R.n(1)); if (p.length() > 1) continue; p.x *= o.sx || 1; p.y *= o.sy || 1; p.z *= o.sz || 1; p.multiplyScalar(o.rad).add(C);
    const dUm = R.f() < 0.12 ? R.r(6, 15) : R.f() < 0.35 ? R.r(0.3, 1.5) : Math.exp(R.r(Math.log(1.8), Math.log(6))); const r = dUm / 2 / u;
    let ok = true; for (let t = o.t0 ?? 0; t <= (o.t1 ?? 3) && ok; t += 0.1) for (const c of [].concat(clear(t) || [])) if (p.distanceTo(c.p) < c.r + r) { ok = false; break; } if (!ok) continue;
    list.push({ p, r, sq: R.r(0.96, 1.04) }); }
  const m = IM(new THREE.SphereGeometry(1, 36, 24), o.mat || mkGlobMat(), list.length, true); list.forEach((g, i) => { m.setMatrixAt(i, M4c(g.p.x, g.p.y, g.p.z, 0, g.r, g.r * g.sq, g.r)); m.setColorAt(i, C3('#fbf2dc', '#eed8a4', R.f()).offsetHSL(R.n(0.01), 0, R.n(0.03))); }); st.scene.add(m); return { m, list }; }
// casein micelles and whey specks: soft points
let MK_DOT = null;
function mkSpecks(st, o) { const R = RNG('mkspk', o.seed || 1), n = o.n, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { let x, y, z; do { x = R.n(1); y = R.n(1); z = R.n(1); } while (x * x + y * y + z * z > 1); pos.set([o.c[0] + x * o.rad, o.c[1] + y * o.rad, o.c[2] + z * o.rad], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  MK_DOT = MK_DOT || g3Radial([[0, 'rgba(255,255,255,1)'], [0.45, 'rgba(255,255,255,0.85)'], [0.7, 'rgba(255,255,255,0.25)'], [1, 'rgba(255,255,255,0)']], 32);
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size: o.size, map: MK_DOT, color: o.col || '#e8dcc4', transparent: true, depthWrite: false, opacity: o.op ?? 0.8, sizeAttenuation: true })); p.frustumCulled = false; st.scene.add(p); return p; }
// the inside-the-milk stage: warm cream light from above, deeper amber below, exp fog
function mkMilkStage(o) { const st = makeStage({ hemi: 0.5, sky: 0xfff4e0, ground: 0x6a4e30, key: o.key ?? 2.3, keyCol: '#fff2dc', box: o.box || 6, boxFar: o.boxFar || 60, sunDist: o.sunDist || 25, far: 400, fov: 45 });
  const L = new THREE.Vector3(0.35, 1, 0.25).normalize(); st.setSun(L, new THREE.Vector3(...(o.target || [0, 0, 0])));
  skyEnv(st, '#f4ead4', '#d8c4a0', L, '#fff8e8'); st.scene.fog = new THREE.FogExp2(lin(o.fog || '#d9c9a8'), o.dens || 0.08);
  st.mkU = mkBack(st, { top: '#f6eedc', mid: o.fog || '#d9c9a8', bot: '#8e7450', glow: '#fff6e0', L, cloud: 0.18 });
  if (o.shafts) { const R = RNG('mkshaft' + o.shafts[0]); for (let i = 0; i < 9; i++) shaft(st, o.shafts[1][0] + R.n(o.shafts[0]), o.shafts[1][1] + o.shafts[0] * 3, o.shafts[1][2] - R.r(0.3, 1.2) * o.shafts[0], R.r(0.15, 0.5) * o.shafts[0], o.shafts[0] * 5, -0.25 + R.n(0.08), R.n(0.3), '#fff4dc', R.r(0.05, 0.11)); }
  return st; }

// ================= FALL (31–33.5): a milk drop dome on the kitchen counter; she trips at its foot and falls in
// units: 1.6 = her height at 31 s (34.6 µm) → 1 unit ≈ 21.6 µm. Drop: base radius 16 (0.7 mm across), height 9 (contact angle ~59°).
const MK_DR = { a: 16, h: 9 }; MK_DR.Rs = (MK_DR.a ** 2 + MK_DR.h ** 2) / (2 * MK_DR.h); MK_DR.yc = MK_DR.h - MK_DR.Rs;
const mkDomeY = (x, z) => { const r2 = x * x + z * z; return r2 < MK_DR.a ** 2 ? MK_DR.yc + Math.sqrt(MK_DR.Rs ** 2 - r2) : 0; };
const MK_IMP = (() => { const y = 0.75, r = Math.sqrt(MK_DR.Rs ** 2 - (y - MK_DR.yc) ** 2); return new THREE.Vector3(r, y, 0); })(), MK_IMPN = MK_IMP.clone().sub(new THREE.Vector3(0, MK_DR.yc, 0)).normalize();
const MK_FALL = { tS: 1.0, tI: 1.45 }; // stumble and impact times (lt)
const MK_TOUCH = (() => { const y = 1.5, r = Math.sqrt(MK_DR.Rs ** 2 - (y - MK_DR.yc) ** 2); return new THREE.Vector3(r, y, 0); })(); // where her hands touch first
function mkKitchenEnv(st) { const es = new THREE.Scene(), B = (c, k = 1) => new THREE.MeshBasicMaterial({ color: lin(c).multiplyScalar(k), side: THREE.DoubleSide });
  const pl = (w, h, mat, x, y, z, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); es.add(m); };
  pl(60, 30, B('#b8ab98', 0.7), 0, 5, -14); pl(60, 30, B('#a89a88', 0.6), 0, 5, 14, Math.PI); pl(40, 30, B('#b0a490', 0.65), -16, 5, 0, Math.PI / 2); pl(40, 30, B('#a49884', 0.6), 16, 5, 0, -Math.PI / 2);
  pl(60, 40, B('#f2eee6', 0.8), 0, 14, 0, 0, Math.PI / 2); pl(60, 40, B('#2a2826', 0.8), 0, -1, 0, 0, -Math.PI / 2);
  // big window (4 panes, mullions) on the back wall and a second one on the left: the bright shapes that curve over the dome
  pl(11, 7, B('#ffffff', 4.0), -5, 5, -13.9); pl(11.4, 0.35, B('#3a3430', 1), -5, 5, -13.85); pl(0.35, 7.4, B('#3a3430', 1), -5, 5, -13.85); pl(12, 0.6, B('#5a4a3c', 1), -5, 1.3, -13.8);
  pl(7, 6, B('#f4f8ff', 3.0), -15.9, 6, -4, Math.PI / 2); pl(0.3, 6.2, B('#3a3430', 1), -15.85, 6, -4, Math.PI / 2);
  // dark wall cabinets with lighter door gaps, a tall fridge, shelves with jars, a plant, the doorway behind
  for (let i = 0; i < 5; i++) pl(4.6, 5, B(i % 2 ? '#4a3a2c' : '#54402e', 0.9), 4 + i * 4.9, 10.5, -13.8);
  for (let i = 0; i < 4; i++) pl(4.4, 2.6, B('#3e3026', 0.9), 4 + i * 4.9, 0.8, -13.8);
  pl(5, 13, B('#c8ccd0', 1.2), 15.8, 5, 4, -Math.PI / 2); pl(0.2, 3, B('#2a2a2a', 1), 15.75, 7, 2, -Math.PI / 2);
  [[3, '#d86a3a'], [5, '#e8d8a0'], [7, '#6a8a4a'], [9.5, '#8a3a2a']].forEach(([x, c]) => pl(1.2, 1.8, B(c, 1.1), x, 4.5, -13.75));
  pl(14, 0.25, B('#6a5444', 1), 7, 3.5, -13.75); pl(6, 9, B('#4a6a3a', 0.7), 14, 3, -10, -Math.PI / 2);
  pl(8, 11, B('#1e1c1a', 1), -2, 4, 13.8, Math.PI); pl(14, 7, B('#7a6450', 0.7), 8, 2, 13.8, Math.PI);
  pl(3, 1.2, B('#fff4d8', 5), 0, 13.9, 0, 0, Math.PI / 2); pl(3, 1.2, B('#fff4d8', 5), -8, 13.9, 4, 0, Math.PI / 2); pl(3, 1.2, B('#fff4d8', 5), 8, 13.9, -4, 0, Math.PI / 2);
  const pm = new THREE.PMREMGenerator(r3().r); st.scene.environment = pm.fromScene(es, 0.025).texture; pm.dispose(); }
// the drop's skin: creamy subsurface body, bright fresnel rim, bluish-translucent thin edge at the contact line, mirror clearcoat
// (kitchen env), tiny fat-globule dimples/specks and slow undulation in the normal, plus touch + impact ripples in the geometry
function mkMilkSurfMat() { const m = new THREE.MeshPhysicalMaterial({ color: '#ece3cf', roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.015, ior: 1.35, sheen: 0.25, sheenColor: lin('#fffaf0'), emissive: '#4a4030', emissiveIntensity: 0.1, envMapIntensity: 1.5 });
  const U = { uImp: { value: MK_IMP.clone() }, uTi: { value: -1 }, uTp: { value: MK_TOUCH.clone() }, uTs: { value: -1 }, uT: { value: 0 } }; m.userData.U = U;
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vMkP; uniform vec3 uImp, uTp; uniform float uTi, uTs; float mkRip(vec3 p){ float r = 0.0; if (uTs > 0.0) { float d = distance(p, uTp); r += 0.06 * sin(d * 5.5 - uTs * 14.0) * exp(-d * 0.25) * smoothstep(uTs * 5.0 + 0.8, uTs * 5.0 - 0.6, d) * exp(-uTs * 1.2); }\n' +
      ' if (uTi < 0.0) return r; float d = distance(p, uImp), fr = uTi * 7.0;\n' +
      ' float w = 0.22 * sin(d * 3.2 - uTi * 18.0) * exp(-d * 0.12) * smoothstep(fr + 1.5, fr - 1.0, d) * exp(-uTi * 0.9);\n' +
      ' float pit = -0.6 * exp(-d * d / 1.5) * sin(min(uTi * 3.0, 3.14159)) * exp(-uTi * 1.2); return r + w + pit; }\n' +
      sh.vertexShader.replace('#include <beginnormal_vertex>', `vec3 objectNormal = vec3(normal);
  float mkD0 = mkRip(position); { vec3 t1 = normalize(cross(objectNormal, vec3(0.0, 0.0, 1.0) + vec3(0.31, 0.0, 0.0))), t2 = normalize(cross(objectNormal, t1)); float e = 0.08;
    float d1 = mkRip(position + t1 * e) - mkD0, d2 = mkRip(position + t2 * e) - mkD0; objectNormal = normalize(objectNormal - (t1 * d1 + t2 * d2) / e); }`)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position) + normal * mkD0; vMkP = position;');
    sh.fragmentShader = 'varying vec3 vMkP; uniform float uT;\n' + mkGLN + `
float mkSh(vec3 P){ float s = mkn(P * 2.4 + 13.0), s2 = mkn(P * 5.5 + 3.0);
  return 0.03 * mkn(P * 0.35 + vec3(0.0, uT * 0.15, 0.0)) - 0.007 * smoothstep(0.72, 0.88, s) - 0.003 * smoothstep(0.76, 0.9, s2) + 0.0012 * mkn(P * 14.0); }
` + sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  vec3 mkGv; float mkSpk; { vec3 P = vMkP; float e = 0.03, h0 = mkSh(P); vec3 g = vec3(mkSh(P + vec3(e, 0.0, 0.0)) - h0, mkSh(P + vec3(0.0, e, 0.0)) - h0, mkSh(P + vec3(0.0, 0.0, e)) - h0) / e;
    mkGv = mat3(viewMatrix) * g; normal = normalize(normal - (mkGv - dot(mkGv, normal) * normal));
    mkSpk = smoothstep(0.72, 0.86, mkn(P * 2.4 + 13.0)) + 0.6 * smoothstep(0.76, 0.9, mkn(P * 5.5 + 3.0)); }`)
      .replace('#include <clearcoat_normal_fragment_maps>', `#include <clearcoat_normal_fragment_maps>
  clearcoatNormal = normalize(clearcoatNormal - (mkGv - dot(mkGv, clearcoatNormal) * clearcoatNormal));`)
      .replace('#include <output_fragment>', `{ vec3 V = normalize(vViewPosition); float nv = clamp(abs(dot(normal, V)), 0.0, 1.0), fr = pow(1.0 - nv, 3.0);
    float thin = 1.0 - smoothstep(0.0, 0.9, vMkP.y);
    outgoingLight += vec3(1.0, 0.88, 0.66) * 0.13 * nv;                         // warm body glow (light scattered inside the fat)
    outgoingLight += vec3(1.0, 0.97, 0.92) * fr * 0.32;                        // brighter rim
    outgoingLight += vec3(1.0, 0.94, 0.8) * mkSpk * 0.045;                     // fat-globule specks just under the skin
    outgoingLight *= mix(0.8, 1.0, smoothstep(0.0, 5.0, vMkP.y));
    outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.66, 0.78, 0.94) + vec3(0.02, 0.04, 0.07), thin * 0.6); }   // thin bluish edge
#include <output_fragment>`); };
  m.customProgramCacheKey = () => 'mkmilkskin'; return m; }
// the splash: milky, luminous sheets and beads
function mkSplashMat() { return mkRim(new THREE.MeshPhysicalMaterial({ color: '#fffaf0', roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02, sheen: 0.4, sheenColor: lin('#ffffff'), emissive: '#c8b898', emissiveIntensity: 0.38, envMapIntensity: 1.4, side: THREE.DoubleSide }), '#fff6e4', 2.2, 0.9, 0.06, 'splash'); }
function mkFallStage() { return once('mkFall', () => {
  const st = makeStage({ hemi: 0.4, sky: 0xfff2e2, ground: 0x4a4440, key: 2.1, keyCol: '#fff0dc', box: 26, boxFar: 300, sunDist: 140, far: 6000, fov: 50 }), S = { st };
  const L = dirV(150 * DEG, 50 * DEG); st.setSun(L, new THREE.Vector3(MK_IMP.x, 2, 0)); mkKitchenEnv(st);
  st.scene.fog = new THREE.Fog(lin('#7a7066'), 80, 900);
  mkBack(st, { top: '#a89c8c', mid: '#7a7066', bot: '#3a3632', glow: '#ffe8c8', L: dirV(-40 * DEG, 20 * DEG), cloud: 0.06, win: true });
  // the counter: dark polished quartz seen at 20 µm a unit — grains, pale flecks, polishing scratches
  const qt = g3Tex((x, w, h) => { const R = RNG('mkqtz'); x.fillStyle = '#34363a'; x.fillRect(0, 0, w, h); x.globalAlpha = 0.55;
    for (let k = 0; k < 2400; k++) { x.fillStyle = R.pick(['#2a2c30', '#3a3c40', '#303236', '#26282c', '#404246', '#2e3034', '#4a4a4c']); x.beginPath(); const cx = R.r(0, w), cy = R.r(0, h), r = R.r(3, 14); x.ellipse(cx, cy, r * R.r(0.6, 1.1), r * R.r(0.6, 1.1), R.r(0, TAU), 0, TAU); x.fill(); }
    for (let k = 0; k < 2600; k++) { x.fillStyle = R.pick(['rgba(255,255,255,0.18)', 'rgba(0,0,0,0.25)', 'rgba(200,195,185,0.2)']); x.fillRect(R.r(0, w), R.r(0, h), R.r(0.6, 1.6), R.r(0.6, 1.6)); }
    for (let k = 0; k < 320; k++) blot(x, R.r(0, w), R.r(0, h), R.r(1.5, 5), R.pick(['rgba(235,232,225,0.6)', 'rgba(190,185,175,0.45)', 'rgba(10,10,12,0.6)']));
    x.globalAlpha = 1; x.strokeStyle = 'rgba(255,255,255,0.025)'; x.lineWidth = 1; for (let k = 0; k < 12; k++) { x.beginPath(); const y0 = R.r(0, h); x.moveTo(0, y0); x.lineTo(w, y0 + R.n(60)); x.stroke(); } }, 512, 512);
  const cm = STDm({ map: wrap(qt, 110, 110), roughness: 0.38, metalness: 0, envMapIntensity: 0.35, bumpMap: wrap(qt, 110, 110), bumpScale: 0.2 });
  st.scene.add(mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), cm, 0, 0, 0, { cast: false }));
  // debris: dust grains, skin flakes, salt specks, crumbs; and a couple of lint fibres
  const R = RNG('mkdeb'), dm = STDm({ roughness: 0.8 }), ok = (x, z) => Math.hypot(x, z) > MK_DR.a + 0.6 && !(x > MK_DR.a - 1 && x < MK_DR.a + 12 && Math.abs(z) < 1.0) && !(x > MK_DR.a + 1.2 && z > -0.7 && z < 5);
  const crT = g3Tex((x, w, h) => { const R2 = RNG('mkcrumbT'); x.fillStyle = '#e2cfa8'; x.fillRect(0, 0, w, h); for (let k = 0; k < 900; k++) blot(x, R2.r(0, w), R2.r(0, h), R2.r(1, 5), R2.pick(['rgba(170,134,90,0.14)', 'rgba(250,240,220,0.3)', 'rgba(210,170,120,0.16)', 'rgba(150,115,75,0.1)'])); }, 256, 256);
  const crumbGeo = (seed) => { const g = new THREE.SphereGeometry(1, 40, 28), p = g.attributes.position, o = seed * 7.3;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), d = 1 + 0.32 * (mkF(x * 1.1 + o, y * 1.1, z * 1.1, 3) - 0.5) + 0.1 * (mkF(x * 3.5, y * 3.5 + o, z * 3.5, 2) - 0.5) + 0.025 * (mkN(x * 9 + o, y * 9, z * 9) - 0.5); p.setXYZ(i, x * d, y * d, z * d); }
    g.computeVertexNormals(); return g; };
  const crM = STDm({ map: crT, bumpMap: crT, bumpScale: 0.08, roughness: 0.75, color: '#ffffff' });
  [0, 1, 2].forEach((s) => { const n = 420, m = IM(crumbGeo(s), crM, n);
    for (let i = 0; i < n; i++) { let x, z; do { x = MK_DR.a + (i < 260 ? R.r(-2, 16) : R.r(-30, 50)); z = i < 260 ? R.r(-8, 6) : R.r(-70, 30); } while (!ok(x, z)); const s2 = Math.exp(R.r(Math.log(0.04), Math.log(i < 200 ? 0.35 : 1.0)));
      const sy = R.r(0.55, 0.9); m.setMatrixAt(i, M4c(x, s2 * sy * 0.75, z, R.r(0, TAU), s2, s2 * sy, s2 * R.r(0.75, 1.25))); m.setColorAt(i, lin(R.pick(['#f0e2c8', '#d0b088', '#f8f0e4', '#e0c49c', '#fffaf0', '#b89470']))); } st.scene.add(m); });
  const sc = IM(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhysicalMaterial({ color: '#eef2f4', roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.85 }), 30);
  for (let i = 0; i < 30; i++) { let x, z; do { x = MK_DR.a + R.r(-20, 40); z = R.r(-60, 10); } while (!ok(x, z)); const s2 = R.r(0.3, 1.6); sc.setMatrixAt(i, M4c(x, s2 * 0.5, z, R.r(0, TAU), s2, s2, s2)); } st.scene.add(sc);
  for (let i = 0; i < 4; i++) { const pts = [], x0 = MK_DR.a + R.r(-10, 40), z0 = R.r(-90, -45), a = R.r(-0.4, 0.4); for (let k = 0; k < 9; k++) pts.push(new THREE.Vector3(x0 + Math.cos(a) * k * 7 + R.n(2), 0.28 + R.r(0, 0.3), z0 + Math.sin(a) * k * 7 + R.n(2)));
    st.scene.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, R.r(0.18, 0.3), 8), STDm({ color: R.pick(['#9aa8c0', '#c8b8a0', '#b0a0b8']), roughness: 0.95 }))); }
  // the drop: a spherical cap with a little surface-tension foot, rippling where she falls in
  const prof = [], NP = 360; for (let i = 0; i <= NP; i++) { const ph = (i / NP) * Math.acos(-MK_DR.yc / MK_DR.Rs); prof.push(new THREE.Vector2(MK_DR.Rs * Math.sin(ph), MK_DR.yc + MK_DR.Rs * Math.cos(ph))); }
  prof.forEach((v) => { if (v.y < 0.6) v.x += 0.3 * Math.pow(1 - v.y / 0.6, 2.2); }); prof.push(new THREE.Vector2(MK_DR.a + 0.36, 0.004), new THREE.Vector2(MK_DR.a + 0.42, -0.05)); prof.reverse();
  S.mat = mkMilkSurfMat(); const lg = new THREE.LatheGeometry(prof, 1024), ln = lg.attributes.normal; for (let i = 0; i < ln.array.length; i++) ln.array[i] *= -1; S.dome = mesh(lg, S.mat, 0, 0, 0, { recv: false, cast: true }); st.scene.add(S.dome);
  // splash: a crown sheet and droplets
  const cprof = []; for (let i = 0; i <= 14; i++) { const y = i / 14; cprof.push(new THREE.Vector2(1 + 0.55 * y * y, y)); } const cg = new THREE.LatheGeometry(cprof, 120), cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) { const y = cp.getY(i), a = Math.atan2(cp.getZ(i), cp.getX(i)), sp = Math.pow(0.5 + 0.5 * Math.cos(a * 9), 2); cp.setY(i, y * (0.8 + 0.35 * sp)); } cg.computeVertexNormals();
  const dm2 = mkSplashMat(); S.crown = mesh(cg, dm2, MK_IMP.x, MK_IMP.y, MK_IMP.z); S.crown.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), MK_IMPN); st.scene.add(S.crown);
  const RD = RNG('mkdrops'); S.drops = []; const t1 = new THREE.Vector3().crossVectors(MK_IMPN, new THREE.Vector3(0, 0, 1)).normalize(), t2 = new THREE.Vector3().crossVectors(MK_IMPN, t1);
  for (let i = 0; i < 60; i++) { const a = RD.r(0, TAU), sp = RD.r(1.2, 3.5), up = RD.r(2.5, 6); S.drops.push({ v: MK_IMPN.clone().multiplyScalar(up).addScaledVector(t1, Math.cos(a) * sp).addScaledVector(t2, Math.sin(a) * sp), r: RD.r(0.02, 0.075), d: RD.r(0, 0.15) }); }
  S.dropIM = IM(new THREE.SphereGeometry(1, 14, 10), dm2, S.drops.length); S.dropIM.frustumCulled = false; st.scene.add(S.dropIM);
  { const RG = RNG('mkskinglob'), n = 520, gm = IM(new THREE.SphereGeometry(1, 16, 12), mkGlobMat(), n); let k = 0;
    while (k < n) { const ph = RG.r(-0.75, 0.75), y = RG.r(0.5, 8.6), r = Math.sqrt(MK_DR.Rs ** 2 - (y - MK_DR.yc) ** 2), P = new THREE.Vector3(r * Math.cos(ph), y, r * Math.sin(ph));
      if (P.distanceTo(MK_IMP) < 4.5 || P.distanceTo(MK_TOUCH) < 2.5) continue; const N = P.clone().sub(new THREE.Vector3(0, MK_DR.yc, 0)).normalize(), rr = Math.exp(RG.r(Math.log(0.03), Math.log(0.16))); P.addScaledVector(N, -rr * 0.7);
      gm.setMatrixAt(k, M4c(P.x, P.y, P.z, 0, rr, rr, rr)); gm.setColorAt(k, C3('#fbf4e4', '#f2e2c0', RG.f())); k++; } st.scene.add(gm); }
  S.girl = makeGirl(st); return S; }); }
// her feet and tilt during the fall shot (lt): walks to the drop's foot, trips, pitches forward into the milk
const MK_X0 = MK_IMP.x + 5.2, MK_XS = MK_IMP.x + 0.75;
function mkFallState(lt) { const F = MK_FALL;
  if (lt < F.tS) { const k = lt / F.tS, x = lerp(MK_X0, MK_XS, k * (2 - k) * 0.5 + k * 0.5); return { feet: [x, 0, 0], pitch: 0, walk: 1 - ss(0.85, 1.0, lt) }; }
  const k = (lt - F.tS) / (F.tI - F.tS), pitch = 1.35 * EZ.i2(Math.min(1, k)) + (lt > F.tI ? 0.25 * EZ.o2(seg(lt, F.tI, F.tI + 0.5)) : 0), push = lt > F.tI ? 2.4 * EZ.o2(seg(lt, F.tI, F.tI + 0.9)) : 0;
  return { feet: [MK_XS - 0.25 * Math.min(1, k) - push, 0, 0], pitch, walk: 0 }; }
SHOT_FN.fall = (lt, dur, t) => { const S = mkFallStage(), st = S.st, F = MK_FALL, h = 1.6 * HGT(t) / HGT(31), G = mkFallState(lt);
  const yaw = -Math.PI / 2, k = seg(lt, F.tS, F.tI), wk = G.walk > 0.5;
  // pitch about the feet: put the body centre where the tilted body puts it
  const c = [G.feet[0] - Math.sin(G.pitch) * 0.55 * h, G.feet[1] + Math.cos(G.pitch) * 0.55 * h, G.feet[2]];
  const q = { walk: G.walk, ph: lt * 7, headPitch: lt < F.tS ? 0.1 - 0.3 * seg(lt, 0.2, 0.7) : -0.4, emo: { surprise: lt < F.tS ? 0.3 : 1 }, look: [0, lt < F.tS ? 0.3 : 0] };
  if (!wk) Object.assign(q, { armL: [lerp(0.4, 2.4, k), lerp(0.3, 0.6, k), 0.3], armR: [lerp(0.4, 2.2, k), lerp(0.3, 0.5, k), 0.4], legL: [-0.15 * k, 0.1], legR: [0.35 * k, 0.5 * k] });
  mkOrient(S.girl, c, h, yaw, G.pitch, 0, q);
  // splash and ripples
  const ti = lt - F.tI; S.mat.userData.U.uTi.value = ti; S.mat.userData.U.uTs.value = lt - 1.15; S.mat.userData.U.uT.value = t;
  S.crown.visible = ti > 0 && ti < 1.0; if (S.crown.visible) { const g = EZ.o2(ti / 0.45), hh = 1.5 * Math.sin(Math.min(1, ti / 1.0) * Math.PI) * (1 - 0.3 * ti); S.crown.scale.set(0.25 + 0.55 * g, Math.max(0.01, hh * 0.55), 0.25 + 0.55 * g); }
  S.drops.forEach((d, i) => { const tt = ti - d.d; if (ti < 0 || tt < 0 || tt > 1.6) { S.dropIM.setMatrixAt(i, _hid); return; } const p = MK_IMP.clone().addScaledVector(d.v, tt).add(new THREE.Vector3(0, -7 * tt * tt, 0)); if (p.y < Math.max(0, mkDomeY(p.x, p.z)) - d.r) { S.dropIM.setMatrixAt(i, _hid); return; }
    S.dropIM.setMatrixAt(i, M4c(p.x, p.y, p.z, 0, d.r, d.r * 1.2, d.r)); }); S.dropIM.instanceMatrix.needsUpdate = true;
  // camera: low beside her, the milk dome rising behind like a white hill; then it pushes into the splash and under
  const I = MK_IMP, n = MK_IMPN, gx = Math.max(G.feet[0], MK_XS - 0.25), qq = EZ.io(seg(lt, 0, F.tI));
  let cp = [gx + 6.5 - 1.2 * qq, 2.2, 2.0], tp = [gx - 8, lerp(0.1, -0.1, qq), -1.0];
  if (lt > F.tI - 0.2) { const k2 = EZ.io(seg(lt, F.tI - 0.2, 2.5)), e = [I.x + 5.6, I.y + 1.5, I.z + 1.9]; cp = mixv(cp, e, k2); tp = mixv(tp, [I.x - 3, I.y + 0.2, I.z - 0.5], k2); }
  camPt(st, cp, tp, 60, t, 0.5, 31); mkFollow(st); renderStage(st, 0.85); bloom(0.25);
  const w = ss(2.0, 2.45, lt); if (w > 0) { ctx.save(); screen(); ctx.fillStyle = `rgba(232,222,200,${w})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } };

// ================= MILK (33.5–36): inside the drop, swimming among fat globules
// units: 1.6 = her height at 33.5 s (15.4 µm) → u = 9.6 µm per unit
const MK_MU = HGT(33.5) * 1e6 / 1.6;
const mkMilkPath = (lt) => [-0.55 * lt, 0.1 * Math.sin(lt * 1.3), -0.15 * lt];
function mkMilkCam(lt) { const c = mkMilkPath(lt), h = 1.6 * Math.pow(2, -lt / 2), hc = 0.35 + 0.65 * h / 1.6 * 1.6;
  return { c, h, cp: [c[0] + 0.9 * hc, c[1] + 0.55 * hc, c[2] + 3.6 * hc], tp: [c[0] - 0.15 * hc, c[1] + 0.2 * hc, c[2]] }; }
function mkSegClear(a, b, r0, r1, n = 6) { const out = []; for (let i = 0; i <= n; i++) { const k = i / n; out.push({ p: new THREE.Vector3(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)), r: lerp(r0, r1, k) }); } return out; }
function mkMilk() { return once('mkMilk', () => { const st = mkMilkStage({ dens: 0.075, box: 6, shafts: [4, [-1, 0, -1]] }), S = { st };
  const clear = (lt) => { const C = mkMilkCam(lt); return mkSegClear(C.c, C.cp, 0.55 * C.h + 0.15, 0.3, 8); };
  mkGlobs(st, { u: MK_MU, n: 2600, c: [-0.6, 0, -1], rad: 16, sy: 0.8, seed: 2, clear, t0: 0, t1: 2.5 });
  mkSpecks(st, { n: 26000, c: [-0.6, 0, 0], rad: 10, size: 0.035, col: '#efe4cc', op: 0.75, seed: 3 });
  mkSpecks(st, { n: 5000, c: [-0.6, 0, 0], rad: 4, size: 0.02, col: '#f8f0dc', op: 0.9, seed: 4 });
  S.bugs = mkBugs(st, { u: MK_MU, n: 18, c: [-2, -1, -5], rad: 4, seed: 5, clear, t0: 0, t1: 2.5 });
  S.girl = makeGirl(st); return S; }); }
SHOT_FN.milk = (lt, dur, t) => { const S = mkMilk(), st = S.st, h = 1.6 * HGT(t) / HGT(33.5), c = mkMilkPath(lt);
  mkOrient(S.girl, c, h, -Math.PI / 2 - 0.27, 1.45, 0.1 * Math.sin(lt * 2.5), mkSwimQ(lt * 5.2)); S.bugs.update(lt);
  const C = mkMilkCam(lt); camPt(st, C.cp, C.tp, 45, t, 0.6, 33); mkFollow(st); renderStage(st, 0.76); bloom(0.32); };

// ================= BACT (36–40): bacteria everywhere; she swims down towards a big cell
// units: 1.6 = her height at 36 s (6.25 µm) → u = 3.9 µm per unit
const MK_BU = HGT(36) * 1e6 / 1.6, MK_BCELL = [0.4, -2.75, -0.6], MK_BCR = 5 / MK_BU;
const mkBactPath = (lt) => [-0.12 * lt, 0.9 - 0.32 * lt - 0.03 * lt * lt, -0.08 * lt];
function mkBactCam(lt) { const c = mkBactPath(lt), h = 1.6 * Math.pow(2, -lt / 2);
  if (lt < 2) { const hc = 0.35 + 0.65 * h; return { c, h, cp: [c[0] + 1.0 * hc, c[1] + 0.6 * hc, c[2] + 3.0 * hc], tp: [c[0] - 0.1 * hc, c[1] + 0.15 * hc, c[2]] }; }
  const hc = 0.25 + 0.75 * h, k = seg(lt, 2, 4); return { c, h, cp: [c[0] + 0.9 * hc, c[1] + lerp(0.5, 1.1, k) * hc, c[2] + 2.4 * hc], tp: [c[0] - 0.1 * hc, c[1] - lerp(0.1, 0.9, k) * hc, c[2] - 0.2 * k] }; }
function mkBact() { return once('mkBact', () => { const st = mkMilkStage({ dens: 0.12, box: 5, fog: '#d6c8a8', shafts: [3, [0, 0, -2]] }), S = { st };
  const clear = (lt) => { const C = mkBactCam(lt); return mkSegClear(C.c, C.cp, 0.6 * C.h + 0.06, 0.25, 10).concat([{ p: new THREE.Vector3(...MK_BCELL), r: MK_BCR + 0.08 }]); };
  S.bugs = mkBugs(st, { u: MK_BU, n: 700, c: [0, 0.3, -0.5], rad: 5.5, seed: 11, clear, t0: 0, t1: 4, pLac: 0.25, pCoc: 0.3 });
  S.bugs2 = mkBugs(st, { u: MK_BU, n: 260, c: [0, -0.3, 0], rad: 2.0, seed: 12, clear, t0: 0, t1: 4, pLac: 0.2, pCoc: 0.3 });
  mkGlobs(st, { u: MK_BU, n: 120, c: [0, 0, -3], rad: 12, seed: 13, clear: (lt) => ({ p: new THREE.Vector3(...mkBactPath(lt)), r: 2.2 }), t0: 0, t1: 4 });
  mkSpecks(st, { n: 30000, c: [0, 0, 0], rad: 6, size: 0.022, col: '#eadfc6', op: 0.8, seed: 14 });
  // casein micelles as tiny lumpy spheres near her path
  const R = RNG('mkcas'), n = 1000, cm = IM(lumpyGeo(3, 0.25, 77), mkRim(STDm({ color: '#f2ead8', roughness: 0.5 }), '#fff8e8', 2.5, 0.4, 0.05, 'cas'), n, false);
  const cl = []; for (let tt = 0; tt <= 4; tt += 0.1) cl.push(...clear(tt)); for (let i = 0; i < n; i++) { const p = new THREE.Vector3(R.n(2.2), R.n(2.2), R.n(2.2)); const s = R.r(0.06, 0.2) / MK_BU; if (cl.some((c) => p.distanceTo(c.p) < c.r + s)) { i--; continue; } cm.setMatrixAt(i, M4c(p.x, p.y, p.z, R.r(0, TAU), s, s, s, R.r(0, TAU))); } st.scene.add(cm);
  S.cell = mkCellBall(st, MK_BCELL, MK_BCR, 1); S.girl = makeGirl(st); return S; }); }
function mkBactShot(lt, t, two) { const S = mkBact(), st = S.st, h = 1.6 * HGT(t) / HGT(36), c = mkBactPath(lt);
  S.bugs.update(lt); S.bugs2.update(lt);
  mkOrient(S.girl, c, h, -0.4 + 0.25 * Math.sin(lt * 0.8), 1.35 - 0.15 * lt / 4, 0.12 * Math.sin(lt * 2.2), mkSwimQ(lt * 5.6, { look: [0.3 * Math.sin(lt * 1.5), 0.5] }));
  const C = mkBactCam(lt); camPt(st, C.cp, C.tp, two ? 42 : 46, t, 0.6, 36); mkFollow(st); renderStage(st, 0.82); bloom(0.3); }
SHOT_FN.bact = (lt, dur, t) => mkBactShot(lt, t, false);
SHOT_FN.bact2 = (lt, dur, t) => mkBactShot(lt + 2, t, true);

// ================= CELL (40–44): the somatic cell — a planet of membrane
// units: 1 µm; her height 1.6 → 0.4. Cell radius 5 (10 µm across), centre (0, −5, 0), she stands on top.
const MK_CR = 5;
function mkCellH(x, y, z) { return 0.14 * (mkF(x * 0.45 + 3, y * 0.45, z * 0.45, 3) - 0.5) + 0.09 * (mkF(x * 1.8, y * 1.8 + 7, z * 1.8, 3) - 0.5) + 0.035 * (mkF(x * 6, y * 6, z * 6 + 2, 2) - 0.5); }
function mkCellMat(fine) { const m = new THREE.MeshPhysicalMaterial({ color: '#86b898', roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.35, envMapIntensity: 0.6, emissive: '#1e3428', emissiveIntensity: 0.12 }), F = fine;
  m.onBeforeCompile = (sh) => { sh.vertexShader = 'varying vec3 vMkP;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vMkP = worldPosition.xyz;');
    sh.fragmentShader = 'varying vec3 vMkP;\n' + mkGLN + '\nfloat mkB(vec3 p){ return mkf(p * ' + (4.0 * F).toFixed(2) + ') * 0.6 + mkf(p * ' + (16.0 * F).toFixed(2) + ' + 3.0) * 0.3 + mkn(p * ' + (60.0 * F).toFixed(2) + ') * 0.12; }\n' +
      sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
  float mkPat = mkf(vMkP * 1.3 + 5.0), mkDot = smoothstep(0.62, 0.7, mkf(vMkP * 9.0));
  diffuseColor.rgb *= mix(vec3(0.86, 0.93, 0.95), vec3(1.06, 1.02, 0.94), mkPat); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.08, 0.95, 1.1), mkDot * 0.6);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  { float e = ${(0.004 / F).toFixed(5)}; float b0 = mkB(vMkP); vec3 gr = vec3(mkB(vMkP + vec3(e, 0, 0)) - b0, mkB(vMkP + vec3(0, e, 0)) - b0, mkB(vMkP + vec3(0, 0, e)) - b0) / e;
    vec3 gv = mat3(viewMatrix) * gr; normal = normalize(normal - (gv - dot(gv, normal) * normal) * ${(0.025 / F).toFixed(4)}); }`)
      .replace('#include <output_fragment>', `{ float fr = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.5); outgoingLight += diffuseColor.rgb * vec3(0.9, 1.0, 0.95) * fr * 0.15; }
#include <output_fragment>`); };
  m.customProgramCacheKey = () => 'mkcell' + F; return m; }
// a cell seen from afar (bact shots): a displaced ball with the same skin
function mkCellBall(st, c, r, seed) { const g = new THREE.IcosahedronGeometry(1, 40), p = g.attributes.position; // non-indexed → smooth normals from the direction
  const nrm = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).normalize(); const d = 1 + mkCellH(_v.x * 5, _v.y * 5, _v.z * 5) / 5 * 1.4; p.setXYZ(i, _v.x * d, _v.y * d, _v.z * d); nrm.set([_v.x, _v.y, _v.z], i * 3); }
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); const m = mesh(g, mkCellMat(5 / r / 5), c[0], c[1], c[2], { s: [r, r, r] }); st.scene.add(m); return m; }
function mkCell() { return once('mkCell', () => { const st = mkMilkStage({ dens: 0.075, box: 2.4, boxFar: 30, sunDist: 10, fog: '#d8caa8', key: 1.6, target: [0, 0, 0] }), S = { st };
  st.setSun(new THREE.Vector3(-0.55, 1, 0.45).normalize(), new THREE.Vector3(0, 0, 0)); st.key.shadow.radius = 3;
  const cellMat = mkCellMat(1);
  // the near patch: a dense grid around the top (indexed → smooth normals), displaced by the membrane's relief
  const pg = new THREE.SphereGeometry(MK_CR, 760, 760, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.95, 1.9).rotateX(-Math.PI / 2), pp = pg.attributes.position;
  for (let i = 0; i < pp.count; i++) { _v.fromBufferAttribute(pp, i); const n = _v.clone().normalize(); const r = MK_CR + mkCellH(_v.x, _v.y, _v.z); pp.setXYZ(i, n.x * r, n.y * r - MK_CR, n.z * r); }
  pg.computeVertexNormals(); const patch = mesh(pg, cellMat); st.scene.add(patch);
  const fg = new THREE.SphereGeometry(MK_CR - 0.06, 160, 100), fp = fg.attributes.position; for (let i = 0; i < fp.count; i++) { _v.fromBufferAttribute(fp, i); const n = _v.clone().normalize(), r = MK_CR - 0.04 + mkCellH(n.x * MK_CR, n.y * MK_CR, n.z * MK_CR); fp.setXYZ(i, n.x * r, n.y * r - MK_CR, n.z * r); }
  fg.computeVertexNormals(); st.scene.add(mesh(fg, cellMat));
  const surf = (n) => { const r = MK_CR + mkCellH(n.x * MK_CR, n.y * MK_CR, n.z * MK_CR); return new THREE.Vector3(n.x * r, n.y * r - MK_CR, n.z * r); };
  S.surf = surf; S.y0 = surf(new THREE.Vector3(0, 1, 0)).y;
  // membrane proteins and rafts: lumpy pebbles, denser near her; microvilli fingers; glycocalyx: fine wavy sugar strands
  const R = RNG('mkprot'), lg = [0, 1, 2].map((s) => lumpyGeo(2, 0.4, 300 + s)), pmat = mkRim(STDm({ roughness: 0.5 }), '#ffffff', 2.5, 0.2, 0.0, 'prot');
  const PCOL = ['#9a88c0', '#b8a4d8', '#88aac8', '#c8b088', '#90b890', '#d098a4', '#88b4a8', '#c0b480'];
  const onCell = (th, az) => new THREE.Vector3(Math.sin(th) * Math.cos(az), Math.cos(th), Math.sin(th) * Math.sin(az));
  lg.forEach((g, gi) => { const n = 1100, m = IM(g, pmat, n); let k = 0;
    while (k < n) { const th = Math.pow(R.f(), 1.7) * 0.8, az = R.r(0, TAU), nn = onCell(th, az), p = surf(nn); if (Math.hypot(p.x, p.z) < 0.09) continue;
      const s = Math.exp(R.r(Math.log(0.005), Math.log(0.03))) * (R.f() < 0.05 ? 2.2 : 1); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), nn).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), R.r(0, TAU)));
      m.setMatrixAt(k, new THREE.Matrix4().compose(p.addScaledVector(nn, -s * 0.3), q, new THREE.Vector3(s, s * R.r(0.6, 1.3), s))); m.setColorAt(k, lin(R.pick(PCOL))); k++; }
    st.scene.add(m); });
  const mv = IM(new THREE.CapsuleGeometry(0.5, 1, 6, 12).translate(0, 0.5, 0), cellMat, 70); for (let k = 0; k < 70;) { const th = R.r(0.3, 0.95), az = R.r(0, TAU), nn = onCell(th, az), p = surf(nn); if (p.z > 0 && p.x > -0.5) continue;
    const w = R.r(0.06, 0.1), L = R.r(0.1, 0.3), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), nn.clone().add(new THREE.Vector3(R.n(0.35), 0, R.n(0.35))).normalize());
    mv.setMatrixAt(k, new THREE.Matrix4().compose(p.addScaledVector(nn, -0.04), q, new THREE.Vector3(w, L, w))); k++; } st.scene.add(mv);
  const fmat = mkFlagMat('#b8dcc0', 0.06, 1.3, 2.5), sg = new THREE.CylinderGeometry(0.02, 0.035, 1, 5, 10, true).translate(0, 0.5, 0), ns = 6000, strands = IM(sg, fmat, ns, false), beads = IM(new THREE.SphereGeometry(0.06, 8, 6), STDm({ color: '#dceccc', roughness: 0.5 }), ns, false);
  for (let k = 0; k < ns;) { const th = Math.pow(R.f(), 1.5) * 0.75, az = R.r(0, TAU), nn = onCell(th, az), p = surf(nn); if (Math.hypot(p.x, p.z) < 0.08) continue;
    const L = R.r(0.02, 0.085), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), nn.clone().add(new THREE.Vector3(R.n(0.6), 0, R.n(0.6))).normalize());
    strands.setMatrixAt(k, new THREE.Matrix4().compose(p.clone().addScaledVector(nn, -0.004), q, new THREE.Vector3(L, L, L))); const tip = new THREE.Vector3(0, L, 0).applyQuaternion(q).add(p); beads.setMatrixAt(k, k % 3 ? _hid : M4c(tip.x, tip.y, tip.z, 0, L, L, L)); k++; }
  st.scene.add(strands, beads); S.fmat = fmat;
  // above: a few bacteria drifting, fat globules and other cells far off, casein specks
  S.bugs = mkBugs(st, { u: 1, n: 70, c: [0, 4.5, -4], rad: 5.5, seed: 21, clear: () => [{ p: new THREE.Vector3(0, 0.5, 0), r: 3.2 }, { p: new THREE.Vector3(0, -MK_CR, 0), r: MK_CR + 0.3 }], pLac: 0.3, pCoc: 0.3 });
  mkGlobs(st, { u: 1, n: 22, c: [0, 9, -16], rad: 14, seed: 22, clear: () => [{ p: new THREE.Vector3(0, -2, 0), r: 9 }] });
  mkCellBall(st, [-9, 1.5, -16], 4.2, 2); mkCellBall(st, [11, 4, -22], 3.2, 3);
  mkSpecks(st, { n: 12000, c: [0, 3, -2], rad: 8, size: 0.04, col: '#efe4cc', op: 0.7, seed: 23 });
  S.girl = makeGirl(st); return S; }); }
SHOT_FN.cell = (lt, dur, t) => { const S = mkCell(), st = S.st, h = 1.6 * HGT(t) / HGT(40), y0 = S.y0; S.bugs.update(lt); S.fmat.userData.U.uT.value = t;
  const land = 0.75, k = seg(lt, 0, land), air = (1 - EZ.o2(k)) * 1.1, cr = lt < land ? 0.25 * k : 0.7 * Math.sin(Math.min(1, (lt - land) / 0.55) * Math.PI) * (lt < land + 0.55 ? 1 : 0);
  const lookK = ss(1.2, 2.0, lt);
  placeGirl(S.girl, 0, y0 + air, 0, h, { yaw: 0.35 + 0.25 * lookK, crouch: cr, armL: lt < land ? [0.5, 1.1, 0.3] : [0.15 + 0.3 * cr, 0.25 + 0.4 * cr, 0.3], armR: lt < land ? [0.5, 1.1, 0.3] : [0.15 + 0.3 * cr, 0.25 + 0.4 * cr, 0.3],
    legL: lt < land ? [-0.35, 0.55] : [-0.6 * cr, 1.1 * cr], legR: lt < land ? [-0.1, 0.25] : [-0.6 * cr, 1.1 * cr], headPitch: lt < land ? 0.35 : 0.25 * (1 - lookK) - 0.1 * lookK, headYaw: -0.5 * lookK, emo: { surprise: 0.5 + 0.3 * lookK }, look: [-0.4 * lookK, lt < land ? -0.4 : 0.1] });
  const hc = 0.35 + 0.65 * h; camPt(st, [1.2 * hc, y0 + 1.3 * hc, 2.7 * hc], [-0.3 * hc, y0 + 0.3 * h + air * 0.5, 0], 46, t, 0.5, 40); mkFollow(st); renderStage(st, 0.72); bloom(0.28); };
SHOT_FN.cell2 = (lt, dur, t) => { const S = mkCell(), st = S.st, h = 1.6 * HGT(t) / HGT(40), y0 = S.y0; S.bugs.update(lt + 2); S.fmat.userData.U.uT.value = t;
  const sw = Math.sin(lt * 1.6); placeGirl(S.girl, 0, y0, 0, h, { yaw: 0.6 + 0.35 * sw, headYaw: -0.7 * sw, headPitch: -0.25, look: [-0.5 * sw, 0.3], armL: [0.1, 0.2, 0.25], armR: [0.25, 0.3, 0.5], emo: { surprise: 0.7 } });
  const k = EZ.io(lt / 2), cp = [lerp(0.9, 1.3, k), y0 + lerp(0.62, 0.5, k), lerp(1.7, 2.2, k)], tp = [-0.42, y0 + lerp(0.3, 0.22, k), -0.5];
  camPt(st, cp, tp, 50, t, 0.5, 42); mkFollow(st); renderStage(st, 0.72); bloom(0.28); };
