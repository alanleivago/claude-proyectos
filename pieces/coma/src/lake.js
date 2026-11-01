// =====================================================================
//  LAKE — the night party on a wooden pier at Valle de Bravo (string lights, papel picado, paper lanterns, a DJ,
//  people, pine hills with town lights, a mirror-reflecting lake), the jump, the rock under water, the sinking,
//  and the dream: the hospital bed floating on the lake, the storm, and the cold empty lake with the doctors.
//  One world stage (once 'lkW') serves every shot; modes switch fog / lights / groups.
// =====================================================================
const LKD = 1.2, LKB = { x: 1.5, z: -30 }; // deck top; the dream bed's centre
let LKTMP = null;
function lkTmp() { if (!LKTMP) { LKTMP = document.createElement('canvas'); LKTMP.width = W; LKTMP.height = H; } return LKTMP; }
function lkBlur(px, a = 1) { if (px <= 0.2 || a <= 0) return; const c = lkTmp(), x = c.getContext('2d'); x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0); ctx.save(); screen(); ctx.globalAlpha = a; ctx.filter = `blur(${px}px)`; ctx.drawImage(c, 0, 0); ctx.restore(); }
function lkFill(col, a, op = 'source-over') { if (a <= 0) return; ctx.save(); screen(); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function lkHash(i, s = 0) { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }

// ---- water: storm swell (vertex + normals), fine ripples (normals), a planar mirror sampled with streaks
const LKWAV = `uniform float uT, uAmp, uRip; uniform vec2 uBed;
float lkH(vec2 p, out vec2 g){ float h = 0.0; g = vec2(0.0); vec4 Wv[5];
  Wv[0] = vec4(0.8, 0.6, 7.0, 0.30); Wv[1] = vec4(-0.5, 0.86, 4.6, 0.20); Wv[2] = vec4(0.2, -0.98, 3.1, 0.11); Wv[3] = vec4(-0.9, -0.3, 2.2, 0.07); Wv[4] = vec4(0.6, -0.8, 1.5, 0.045);
  for (int i = 0; i < 5; i++) { vec2 d = normalize(Wv[i].xy); float k = 6.2832 / Wv[i].z, w = sqrt(9.8 * k), a = Wv[i].w * uAmp, ph = k * dot(d, p) - w * uT + float(i) * 1.7; h += a * sin(ph); g += a * k * d * cos(ph); }
  float f = 1.0 - smoothstep(40.0, 110.0, length(p - uBed)); g *= f; return h * f; }
`;
const LKRIP = `float lkh2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float lkvn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(lkh2(i), lkh2(i + vec2(1, 0)), f.x), mix(lkh2(i + vec2(0, 1)), lkh2(i + vec2(1, 1)), f.x), f.y); }
vec2 lkRip(vec2 p){ vec2 g = vec2(0.0); vec4 R[7];
  R[0] = vec4(0.3, 1.0, 1.3, 0.012); R[1] = vec4(-0.7, 0.5, 0.83, 0.008); R[2] = vec4(0.9, -0.2, 0.51, 0.005); R[3] = vec4(-0.2, -1.0, 0.37, 0.0035); R[4] = vec4(0.55, 0.75, 0.23, 0.0022); R[5] = vec4(-0.95, 0.1, 0.17, 0.0016); R[6] = vec4(0.1, 0.99, 2.3, 0.02);
  for (int i = 0; i < 7; i++) { vec2 d = normalize(R[i].xy); float k = 6.2832 / R[i].z, w = sqrt(9.8 * k), ph = k * dot(d, p) - w * uT + float(i) * 2.3; g += R[i].w * k * d * cos(ph); }
  float e = 0.15, q = 1.7; vec2 s = vec2(uT * 0.21, -uT * 0.13); float n0 = lkvn(p * q + s), nx = lkvn((p + vec2(e, 0.0)) * q + s), nz = lkvn((p + vec2(0.0, e)) * q + s);
  g += vec2(nx - n0, nz - n0) / e * 0.025; return g * uRip; }
`;
function lkWaveH(x, z, t, amp) { const Wv = [[0.8, 0.6, 7.0, 0.30], [-0.5, 0.86, 4.6, 0.20], [0.2, -0.98, 3.1, 0.11], [-0.9, -0.3, 2.2, 0.07], [0.6, -0.8, 1.5, 0.045]]; let h = 0;
  Wv.forEach(([dx, dz, L, a], i) => { const l = Math.hypot(dx, dz), k = TAU / L, w = Math.sqrt(9.8 * k); h += a * amp * Math.sin(k * (dx * x + dz * z) / l - w * t + i * 1.7); }); return h; }
function lkWater(S) { const st = S.st;
  const rt = new THREE.WebGLRenderTarget(W / 3, H / 3, { type: THREE.HalfFloatType }); S.rt = rt; S.mcam = new THREE.PerspectiveCamera(50, W / H, 0.05, 6000); S.mcam.rotation.order = 'YXZ';
  S.clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.02);
  const U = S.wU = { uT: { value: 0 }, uAmp: { value: 0 }, uRip: { value: 1 }, uRefl: { value: rt.texture }, uTM: { value: new THREE.Matrix4() }, uRK: { value: 1 }, uFoam: { value: 0 }, uBed: { value: new THREE.Vector2(LKB.x, LKB.z) } };
  const m = STDm({ color: '#04090d', roughness: 0.1, metalness: 0.0, envMapIntensity: 0.3 });
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vLw;\n' + LKWAV + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      { vec2 wp = (modelMatrix * vec4(transformed, 1.0)).xz; vec2 gg; transformed.y += lkH(wp, gg); }`).replace('#include <project_vertex>', '#include <project_vertex>\n vLw = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'varying vec3 vLw; uniform sampler2D uRefl; uniform mat4 uTM; uniform float uRK, uFoam;\n' + LKWAV + LKRIP + sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      float lkD = length(vLw - cameraPosition); vec2 lkG; lkH(vLw.xz, lkG); lkG += lkRip(vLw.xz) * (1.0 - 0.85 * smoothstep(6.0, 90.0, lkD));
      vec3 lkN = normalize(vec3(-lkG.x, 1.0, -lkG.y)); normal = normalize((viewMatrix * vec4(lkN, 0.0)).xyz);`)
      .replace('#include <output_fragment>', `{ vec3 V = normalize(cameraPosition - vLw); float fr = 0.02 + 0.98 * pow(1.0 - clamp(dot(V, lkN), 0.0, 1.0), 5.0);
        vec4 pc = uTM * vec4(vLw.x, 0.0, vLw.z, 1.0); float lkF2 = 1.0 - 0.6 * smoothstep(10.0, 200.0, lkD); vec2 ruv = pc.xy / pc.w + vec2(lkN.x * 0.03, lkN.z * 0.1) * lkF2;
        vec3 rc = texture2D(uRefl, ruv).rgb * 0.34 + texture2D(uRefl, ruv + vec2(0.0, 0.008)).rgb * 0.22 + texture2D(uRefl, ruv - vec2(0.0, 0.008)).rgb * 0.22 + texture2D(uRefl, ruv + vec2(0.0, 0.018)).rgb * 0.11 + texture2D(uRefl, ruv - vec2(0.0, 0.018)).rgb * 0.11;
        outgoingLight += rc * uRK * mix(0.5, 1.0, fr);
        float fo = uFoam * smoothstep(0.62, 0.85, lkvn(vLw.xz * 0.9 + vec2(uT * 0.8, uT * 0.3)) * 0.6 + lkvn(vLw.xz * 3.1 - uT) * 0.4 + lkG.x * 0.15) * (1.0 - smoothstep(20.0, 90.0, lkD));
        outgoingLight = mix(outgoingLight, vec3(0.16, 0.18, 0.21), fo); }
      #include <output_fragment>`); };
  const sz = 260, near = new THREE.PlaneGeometry(sz, sz, 230, 230).rotateX(-Math.PI / 2).translate(0, 0, -40);
  const sh = new THREE.Shape([new THREE.Vector2(-3000, -3000), new THREE.Vector2(3000, -3000), new THREE.Vector2(3000, 3000), new THREE.Vector2(-3000, 3000)]);
  sh.holes.push(new THREE.Path([new THREE.Vector2(-sz / 2, 40 - sz / 2), new THREE.Vector2(-sz / 2, 40 + sz / 2), new THREE.Vector2(sz / 2, 40 + sz / 2), new THREE.Vector2(sz / 2, 40 - sz / 2)]));
  const far = new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2);
  S.water = [near, far].map((g) => { const w = new THREE.Mesh(g, m); w.receiveShadow = true; w.frustumCulled = false; st.scene.add(w); return w; });
  // the surface seen from below (Snell's window, wavy light), only in the underwater shots
  const UU = S.uU = { uT: { value: 0 }, uCol: { value: lin('#0d3b44') }, uWin: { value: lin('#9fd8e0') }, uFog: { value: lin('#06222a') } };
  S.surfU = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: UU, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT; uniform vec3 uCol, uWin, uFog; varying vec3 vW; ${LKRIP.replace(/uRip/g, '1.0')}
      float fb(vec2 p){ return lkvn(p) * 0.55 + lkvn(p * 2.1 + 3.0) * 0.3 + lkvn(p * 4.3 + 7.0) * 0.15; }
      void main(){ vec3 d = normalize(vW - cameraPosition); float win = smoothstep(0.62, 0.72, d.y), dist = length(vW - cameraPosition);
        float n = fb(vW.xz * 1.1 + vec2(uT * 0.25, uT * 0.18)), n2 = fb(vW.xz * 2.7 - vec2(uT * 0.4, -uT * 0.2));
        float rip = pow(abs(sin(n * 9.0 + n2 * 5.0)), 8.0);
        vec3 c = mix(uCol * (0.45 + 0.12 * n), uWin * 0.2, win) + uWin * rip * (0.12 + 0.55 * win);
        c = mix(c, uFog, smoothstep(6.0, 30.0, dist)); gl_FragColor = vec4(c, mix(0.96, 0.3, win));
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  S.surfU.renderOrder = 3; S.surfU.position.set(0, -0.01, -14); S.surfU.visible = false; st.scene.add(S.surfU);
}
// the mirror pass: the scene from the camera reflected in y = 0, clipped above the water, into a half-res target
function lkMirror(S) { const st = S.st, cam = st.cam, mc = S.mcam; cam.updateMatrixWorld(true);
  mc.fov = cam.fov; mc.aspect = cam.aspect; mc.near = cam.near; mc.far = cam.far; mc.updateProjectionMatrix();
  mc.position.set(cam.position.x, -cam.position.y, cam.position.z); mc.rotation.set(-cam.rotation.x, cam.rotation.y, -cam.rotation.z); mc.updateMatrixWorld(true);
  S.wU.uTM.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mc.projectionMatrix).multiply(mc.matrixWorldInverse);
  const r = r3().r; S.water.forEach((w) => (w.visible = false)); const sv = S.surfU.visible; S.surfU.visible = false; const hv = S.hideRefl.map((o) => o.visible); S.hideRefl.forEach((o) => (o.visible = false));
  r.clippingPlanes = [S.clip]; r.shadowMap.autoUpdate = false; r.setRenderTarget(S.rt); r.toneMappingExposure = 1; r.clear(); r.render(st.scene, mc); r.setRenderTarget(null); r.clippingPlanes = []; r.shadowMap.autoUpdate = true;
  S.water.forEach((w) => (w.visible = true)); S.surfU.visible = sv; S.hideRefl.forEach((o, i) => (o.visible = hv[i])); }
function lkRender(S, exp, bl, mirror = true) { if (!CAMONLY && mirror) lkMirror(S); renderStage(S.st, exp); if (CAMONLY) return false; bloom(bl); return true; }

// ---- small builders
const lkWoodTex = () => texNoise('lkwood', '#7a5638', ['#5a3c26', '#8a6440', '#4a3020', '#9a7450', '#6a4830'], 7000);
function lkGlowPts(st, n, size, opacity = 0.85, map) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: map || glowTex(), vertexColors: true, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })); p.frustumCulled = false; st.scene.add(p); return p; }
function lkBoat(st, x, z, ry, col, s = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; st.scene.add(g);
  const hull = new THREE.BoxGeometry(1.7 * s, 0.75 * s, 5 * s, 6, 3, 16), p = hull.attributes.position;
  for (let i = 0; i < p.count; i++) { const zz = p.getZ(i) / (2.5 * s), yy = p.getY(i) / (0.375 * s), bow = clamp((zz - 0.25) / 0.75), nar = (1 - 0.92 * bow * bow) * (0.62 + 0.38 * (yy + 1) / 2); p.setX(i, p.getX(i) * nar); p.setY(i, p.getY(i) + bow * bow * 0.25 * s * (yy + 1) / 2); }
  hull.computeVertexNormals(); g.add(mesh(hull, STDm({ color: col, roughness: 0.35 }), 0, 0.12 * s, 0));
  g.add(mesh(new THREE.BoxGeometry(1.4 * s, 0.06, 3.6 * s), STDm({ map: lkWoodTex(), roughness: 0.8 }), 0, 0.42 * s, -0.3 * s));
  g.add(mesh(new THREE.BoxGeometry(1.2 * s, 0.35, 0.5 * s), STDm({ color: '#e8e4dc', roughness: 0.6 }), 0, 0.6 * s, -1.4 * s)); g.add(mesh(new THREE.BoxGeometry(1.0 * s, 0.4, 0.06), STDm({ color: '#9ab0c0', roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.5 }), 0, 0.8 * s, 0.2 * s));
  return g; }
function lkSail(st, x, z, ry) { const g = lkBoat(st, x, z, ry, '#eae6de', 1.25); const mt = STDm({ color: '#c8c8cc', metalness: 0.7, roughness: 0.3 });
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 11, 8).translate(0, 5.5, 0), mt, 0, 0.6, 0.6)); g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 8).rotateX(Math.PI / 2), mt, 0, 1.9, -1.2));
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.12, 3.4, 10).rotateX(Math.PI / 2), STDm({ color: '#2a4a8a', roughness: 0.9 }), 0, 2.05, -1.2));
  const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff5040', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); l.position.set(0, 11.7, 0.6); l.scale.setScalar(1.6); g.add(l);
  const l2 = l.clone(); l2.material = l.material.clone(); l2.material.color.set('#fff4e0'); l2.position.set(0, 4, 0.75); l2.scale.setScalar(0.8); g.add(l2); return g; }
function lkFoot(side, skinM) { const g = new THREE.Group(), sk = (z) => [[0.03, 0.034, 0.058], [-0.05, 0.042, 0.072], [-0.12, 0.049, 0.05], [-0.175, 0.052, 0.032], [-0.205, 0.05, 0.022]].reduce((a, b, k, A) => (k && z <= A[k - 1][0] && z >= b[0] ? [b[1] + (A[k - 1][1] - b[1]) * (z - b[0]) / (A[k - 1][0] - b[0]), b[2] + (A[k - 1][2] - b[2]) * (z - b[0]) / (A[k - 1][0] - b[0])] : a), [0.034, 0.058]);
  const geo = new THREE.SphereGeometry(1, 40, 28), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), zz = lerp(-0.205, 0.03, (z + 1) / 2), [w, h] = sk(zz), arch = side * 0.006 * Math.sin(clamp((zz + 0.15) / 0.18) * Math.PI);
    p.setXYZ(i, x * w + side * (zz < -0.1 ? -0.004 : 0) + (x * side < 0 ? arch : 0), y > 0 ? y * h : y * 0.006 + 0.006, zz); }
  geo.computeVertexNormals(); g.add(mesh(geo, skinM, 0, 0, 0, { cast: false }));
  const nail = STDm({ color: '#d8a898', roughness: 0.2 });
  [[0.0155, 0.052, -0.03, 0.0], [0.0115, 0.04, -0.006, 0.006], [0.0105, 0.035, 0.015, 0.012], [0.0098, 0.03, 0.033, 0.02], [0.009, 0.025, 0.048, 0.03]].forEach(([r, l, x, back]) => {
    const tx = side * x, tz = -0.2 + back; const t = mesh(new THREE.CapsuleGeometry(r, l * 0.55, 6, 14).rotateX(Math.PI / 2), skinM, tx, r * 0.9, tz - l * 0.35, { cast: false }); t.scale.set(1, 0.85, 1); g.add(t);
    const n = mesh(new THREE.SphereGeometry(r * 0.75, 12, 8, 0, TAU, 0, Math.PI * 0.4), nail, tx, r * 1.55, tz - l * 0.62, { cast: false }); n.scale.set(1, 0.35, 1.2); g.add(n); });
  g.add(mesh(new THREE.SphereGeometry(0.02, 10, 8), skinM, side * 0.036, 0.05, 0.005, { cast: false })); g.add(mesh(new THREE.SphereGeometry(0.018, 10, 8), skinM, -side * 0.032, 0.048, 0.012, { cast: false }));
  g.add(mesh(new THREE.CapsuleGeometry(0.04, 0.1, 6, 16).translate(0, 0.12, 0.012), skinM, 0, 0, 0, { cast: false })); return g; }

function lkRockGeo(seed, n = 72) { const g = new THREE.SphereGeometry(1, n, Math.round(n * 0.7)), p = g.attributes.position, R = RNG('lkr' + seed), K = []; for (let k = 0; k < 8; k++) K.push([new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(), R.r(0.3, 1)]);
  for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i); let d = 1; K.forEach(([c, a]) => (d += 0.28 * a * Math.max(0, _v.dot(c)) ** 3)); d += 0.05 * Math.sin(_v.x * 9 + seed) * Math.sin(_v.y * 8) * Math.sin(_v.z * 7 + seed) + 0.02 * Math.sin(_v.x * 23 + _v.z * 19);
    if (_v.y < -0.3) d *= 1 - (-0.3 - _v.y) * 0.4; p.setXYZ(i, _v.x * d, _v.y * d * 0.85, _v.z * d); } g.computeVertexNormals(); return g; }
const LKSIL = new THREE.MeshBasicMaterial({ color: '#0b0f17' });
// ---- the world
function lkWorld() { return once('lkW', () => {
  const moon = dirV(-28 * DEG, 17 * DEG);
  const st = makeStage({ hemi: 0.3, sky: 0x33447a, ground: 0x1a140e, key: 0.55, keyCol: '#a8bce8', box: 24, boxFar: 220, sunDist: 100, far: 6000, fog: '#1c2a4c', fogNear: 30, fogFar: 950, skyTop: '#060b1e', skyHor: '#3a5088' });
  st.setSun(moon, new THREE.Vector3(0, 0, -10)); skyEnv(st, '#0a1430', '#24304e', moon, '#5a6890');
  const R = RNG('lake'), S = { st, moon, hideRefl: [] }; S.fogAir = st.scene.fog; S.fogUnder = new THREE.FogExp2('#06222a', 0.12);
  // sky: stars, moon with halo, a cloud layer (cover/flash as uniforms)
  { const n = 2600, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = R.r(0, TAU), y = Math.pow(R.f(), 0.7) * 0.95 + 0.03, r = Math.sqrt(1 - y * y); pos.set([Math.cos(a) * r * 1350, y * 1350, Math.sin(a) * r * 1350], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); S.stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, color: '#dfe6ff', transparent: true, opacity: 0.85, fog: false, depthWrite: false })); st.scene.add(S.stars);
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, 600), 3)); S.hideRefl.push(S.stars); S.stars2 = new THREE.Points(g2, new THREE.PointsMaterial({ size: 3.6, sizeAttenuation: false, map: glowTex(), color: '#fff8f0', transparent: true, opacity: 0.9, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); st.scene.add(S.stars2); S.hideRefl.push(S.stars2); }
  { const mt = g3Tex((x, w) => { const Rm = RNG('moon'); x.clearRect(0, 0, w, w); x.fillStyle = '#f4f0e4'; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 2, 0, TAU); x.fill(); for (let k = 0; k < 26; k++) { x.fillStyle = `rgba(150,150,160,${Rm.r(0.1, 0.3)})`; x.beginPath(); x.arc(w / 2 + Rm.n(w * 0.32), w / 2 + Rm.n(w * 0.32), Rm.r(3, 16), 0, TAU); x.fill(); } }, 128, 128);
    S.moonS = new THREE.Sprite(new THREE.SpriteMaterial({ map: mt, color: new THREE.Color(2.2, 2.2, 2.1), fog: false, depthWrite: false })); S.moonS.position.copy(moon).multiplyScalar(1250); S.moonS.scale.setScalar(34); st.scene.add(S.moonS);
    S.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#7d8fc8', transparent: true, opacity: 0.35, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); S.halo.position.copy(S.moonS.position); S.halo.scale.setScalar(420); st.scene.add(S.halo); }
  { const U = S.cU = { uCov: { value: 0.35 }, uT: { value: 0 }, uFlash: { value: 0 }, uCol: { value: lin('#141a2c') }, uLit: { value: lin('#8090c0') }, uMoon: { value: moon.clone() } };
    const cm = new THREE.Mesh(new THREE.SphereGeometry(1300, 48, 24), new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uCov, uT, uFlash; uniform vec3 uCol, uLit, uMoon; varying vec3 vD;
        float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 6; i++) { a += m * vn(p); p = p * 2.03 + 1.7; m *= 0.5; } return a; }
        void main(){ vec3 d = normalize(vD); if (d.y < -0.02) discard; vec2 cp = d.xz / (d.y + 0.12) * 1.1 + vec2(uT * 0.05, uT * 0.02);
          float c = fbm(cp) * 0.7 + fbm(cp * 2.9 + 3.0) * 0.3, cov = smoothstep(1.02 - uCov, 1.25 - uCov * 0.75, c + 0.18) * mix(smoothstep(0.02, 0.3, d.y), smoothstep(-0.02, 0.1, d.y), uCov);
          float ml = pow(max(dot(d, uMoon), 0.0), 5.0); vec3 col = uCol * (0.6 + 0.8 * fbm(cp * 3.0 + 1.0)) + uLit * ml * (0.4 + 0.6 * (1.0 - c)) + vec3(0.6, 0.66, 0.95) * uFlash * (0.3 + fbm(cp * 2.0));
          gl_FragColor = vec4(col, cov * mix(0.7, 0.97, uCov));
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }` })); cm.renderOrder = -1; st.scene.add(cm); }
  // terrain: the lake basin and the pine hills around it (vertex colours), pines, town lights on the slopes
  const tn = (x, z) => Math.sin(x * 0.013 + 1.3) * Math.sin(z * 0.011 + 0.4) * 0.5 + Math.sin(x * 0.031 + z * 0.017) * 0.25 + Math.sin(x * 0.07 - z * 0.05 + 2) * 0.12 + Math.sin(x * 0.0051 - 0.7) * 0.4;
  const lkE = (x, z) => Math.hypot(x / 360, (z + 230) / 290);
  const hT = S.hT = (x, z) => { const e = lkE(x, z), n = tn(x, z); if (e < 1) return -Math.min(9, 1 + (1 - e) * 70); return (e - 1) * 230 * (0.75 + 0.35 * n) + 10 * n * clamp((e - 1) * 6) + Math.max(0, Math.sin(x * 0.004 + 0.5) * Math.sin(z * 0.005 - 0.3)) * 140 * clamp((e - 1.15) * 3); };
  { const g = new THREE.PlaneGeometry(3400, 3400, 260, 260).rotateX(-Math.PI / 2).translate(0, 0, -230), p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = hT(x, z); p.setY(i, h); const k = lkHash(i, 3);
      if (h < 0) c.set('#2a2418').lerp(lin('#1a2a1a'), clamp(-h / 6)); else if (h < 4) c.set('#3a3226'); else c.set('#1e3020').lerp(lin('#2a3a26'), k * 0.6).lerp(lin('#3a4040'), clamp((h - 150) / 120));
      col.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); const tm = mesh(g, STDm({ vertexColors: true, roughness: 1 }), 0, 0, 0, { cast: false }); tm.frustumCulled = false; st.scene.add(tm); S.terrain = tm; }
  { const N = 6500, cone1 = new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), mt = STDm({ color: '#ffffff', roughness: 0.95 }), A = IM(cone1, mt, N, false), B = IM(cone1, mt, N, false); let k = 0;
    for (let t = 0; t < 40000 && k < N; t++) { const a = R.r(0, TAU), e = R.r(1.005, 1.9), x = Math.cos(a) * 360 * e, z = -230 + Math.sin(a) * 290 * e; if (z > 120) continue; const h = hT(x, z); if (h < 1.5 || tn(x * 3, z * 3) < -0.55) continue;
      const s = R.r(7, 15), w = s * R.r(0.26, 0.34), cc = lin(R.pick(['#1a3020', '#20381f', '#162a1c', '#243a22', '#1c2c18']));
      A.setMatrixAt(k, M4c(x, h - 1, z, R.r(0, 6), w, s * 0.7, w)); B.setMatrixAt(k, M4c(x, h - 1 + s * 0.42, z, R.r(0, 6), w * 0.7, s * 0.6, w * 0.7)); A.setColorAt(k, cc); B.setColorAt(k, cc.clone().multiplyScalar(1.15)); k++; }
    A.count = B.count = k; st.scene.add(A, B); }
  { const n = 1100, P = lkGlowPts(st, n, 7, 1), pa = P.geometry.attributes.position, ca = P.geometry.attributes.color; const cl = []; for (let c = 0; c < 16; c++) { const a = R.r(-2.9, -0.2), e = R.r(1.01, 1.12); cl.push([Math.cos(a) * 360 * e, -230 + Math.sin(a) * 290 * e, R.r(25, 70)]); }
    for (let i = 0; i < n; i++) { const [cx, cz, r] = cl[i % cl.length], x = cx + R.n(r), z = cz + R.n(r), h = Math.max(1, hT(x, z)) + 2; pa.setXYZ(i, x, h, z); const w = R.f(), c = w < 0.6 ? [1.0, 0.62, 0.3] : w < 0.85 ? [1, 0.9, 0.75] : [0.75, 0.9, 1]; const b = R.r(0.6, 1.4); ca.setXYZ(i, c[0] * b, c[1] * b, c[2] * b); }
    S.town = P; }
  lkWater(S);
  // the pier: platform 13 x 14 m, two fingers (a boat slip) at the end, a 58 m walkway to the shore
  const wood = STDm({ map: lkWoodTex(), roughness: 0.82 }), dark = STDm({ color: '#3a2a1c', roughness: 0.9 });
  { const pl = []; for (let z = -0.1; z > -14; z -= 0.215) pl.push([0, z, 13]); for (let z = -14.1; z > -18.5; z -= 0.215) { pl.push([-1.95, z, 1.3]); pl.push([1.95, z, 1.3]); } for (let z = 0.1; z < 58; z += 0.215) pl.push([0, z, 3.2]);
    const I = IM(new THREE.BoxGeometry(1, 0.05, 0.195), wood, pl.length); pl.forEach(([x, z, l], i) => { I.setMatrixAt(i, M4c(x, LKD - 0.025, z, (lkHash(i) - 0.5) * 0.004, l, 1, 1)); I.setColorAt(i, new THREE.Color().setScalar(0.75 + 0.4 * lkHash(i, 2))); }); st.scene.add(I); }
  { const pp = []; for (let x = -6.3; x <= 6.4; x += 2.52) for (let z = -0.2; z >= -14; z -= 2.76) pp.push([x, z]); [-2.5, -1.4, 1.4, 2.5].forEach((x) => [-16.2, -18.4].forEach((z) => pp.push([x, z]))); for (let z = 3; z < 58; z += 3) pp.push([-1.5, z], [1.5, z]);
    const I = IM(new THREE.CylinderGeometry(0.15, 0.17, 10.6, 10).translate(0, -5.3, 0), STDm({ color: '#4a3a2a', roughness: 0.95 }), pp.length), J = IM(new THREE.CylinderGeometry(0.185, 0.2, 9.4, 10).translate(0, -4.85, 0), STDm({ color: '#22301e', roughness: 1 }), pp.length);
    pp.forEach(([x, z], i) => { I.setMatrixAt(i, M4c(x, LKD, z)); J.setMatrixAt(i, M4c(x, -0.12, z, i)); }); st.scene.add(I, J); S.under = new THREE.Group(); st.scene.add(S.under); }
  [[0, -0.05, 13.2, 0.3, 0.12], [0, -14.05, 13.2, 0.3, 0.12], [-6.55, -7, 0.12, 0.3, 14.1], [6.55, -7, 0.12, 0.3, 14.1], [-1.3, -16.3, 0.1, 0.3, 4.5], [1.3, -16.3, 0.1, 0.3, 4.5], [-2.62, -16.3, 0.1, 0.3, 4.5], [2.62, -16.3, 0.1, 0.3, 4.5], [-1.95, -18.55, 1.42, 0.3, 0.1], [1.95, -18.55, 1.42, 0.3, 0.1], [-1.65, 29, 0.1, 0.3, 58], [1.65, 29, 0.1, 0.3, 58]]
    .forEach(([x, z, w, h, d]) => st.scene.add(mesh(new THREE.BoxGeometry(w, h, d), dark, x, LKD - 0.19, z)));
  // walkway rails, benches, cleats
  { const ps = []; for (let z = 1; z < 58; z += 1.6) ps.push([-1.6, z], [1.6, z]); const I = IM(new THREE.BoxGeometry(0.09, 1.0, 0.09).translate(0, 0.5, 0), dark, ps.length); ps.forEach(([x, z], i) => I.setMatrixAt(i, M4c(x, LKD, z))); st.scene.add(I);
    [-1.6, 1.6].forEach((x) => st.scene.add(mesh(new THREE.BoxGeometry(0.12, 0.06, 57), wood, x, LKD + 1.0, 29.5))); }
  [[-6.1, -3.5, 0], [-6.1, -10.5, 0]].forEach(([x, z]) => { st.scene.add(mesh(new THREE.BoxGeometry(0.45, 0.06, 4), wood, x, LKD + 0.45, z)); [-1.7, 1.7].forEach((dz) => st.scene.add(mesh(new THREE.BoxGeometry(0.4, 0.45, 0.08), dark, x, LKD + 0.22, z + dz))); });
  [[-1.3, -15], [1.3, -17.5], [-6.5, -12], [6.5, -2]].forEach(([x, z]) => st.scene.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 10), STDm({ color: '#c8c8c8', metalness: 0.8, roughness: 0.3 }), x, LKD + 0.11, z)));
  // poles + string lights (bulbs: instanced cores + glow points), paper lanterns, papel picado
  const PO = S.poles = [[-6.4, -0.1, 4], [6.4, -0.1, 4], [-6.4, -7, 4], [6.4, -7, 4], [-6.4, -13.9, 4], [6.4, -13.9, 4], [-2.5, -18.4, 3.4], [2.5, -18.4, 3.4], [-1.55, 8, 3], [1.55, 16, 3], [-1.55, 24, 3], [1.55, 32, 3], [-1.55, 40, 3], [1.55, 48, 3]];
  PO.forEach(([x, z, h]) => { st.scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 8).translate(0, h / 2, 0), dark, x, LKD, z)); });
  const STR = [[0, 2], [2, 4], [1, 3], [3, 5], [4, 6], [5, 7], [0, 1], [0, 3], [1, 2], [2, 5], [3, 4], [2, 3], [4, 5], [6, 7], [0, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [6, 4], [7, 5]];
  const top = (i) => new THREE.Vector3(PO[i][0], LKD + PO[i][2], PO[i][1]);
  const bulbs = []; S.strings = STR.map(([a, b], si) => { const A = top(a), B = top(b), L = A.distanceTo(B), n = Math.max(2, Math.round(L / 0.42)), sag = 0.05 * L + 0.2, pts = [];
    for (let k = 0; k <= n; k++) { const u = k / n, p = A.clone().lerp(B, u); p.y -= sag * 4 * u * (1 - u); pts.push(p); if (k > 0 && k < n) bulbs.push({ p, si, u }); } return { A, B, sag, pts }; });
  { const lg = new THREE.BufferGeometry().setFromPoints(S.strings.flatMap((s) => s.pts.slice(1).flatMap((p, k) => [s.pts[k], p]))); st.scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#1a1410' }))); }
  S.bulbs = bulbs; const NB = bulbs.length; S.bulbCore = IM(new THREE.SphereGeometry(0.042, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.3, 1.6) }), NB, false); S.bulbCore.instanceMatrix.setUsage(THREE.DynamicDrawUsage); st.scene.add(S.bulbCore);
  S.bulbGlow = lkGlowPts(st, NB, 0.75, 0.9); S.bulbOff = bulbs.map((b, i) => R.r(0.3, 2.4));
  const LC = ['#ff4f7a', '#ffb030', '#ff7a2a', '#e8304a', '#38c8c0', '#b05cff', '#ffe050', '#ff5fb0'];
  S.lant = []; [[7, [0.3, 0.55, 0.8]], [8, [0.3, 0.55, 0.8]], [9, [0.35, 0.65]], [10, [0.35, 0.65]], [11, [0.5]], [12, [0.3, 0.7]], [6, [0.25, 0.75]], [1, [0.5]], [2, [0.5]]].forEach(([si, us]) => us.forEach((u) => {
    const s = S.strings[si], p = s.A.clone().lerp(s.B, u); p.y -= s.sag * 4 * u * (1 - u); const col = LC[S.lant.length % LC.length], big = 0.75 + 0.5 * lkHash(S.lant.length, 9);
    const g = new THREE.Group(); g.position.copy(p); st.scene.add(g); const body = new THREE.Mesh(new THREE.SphereGeometry(0.3 * big, 20, 14).scale(1, 1.1, 1), STDm({ color: col, emissive: col, emissiveIntensity: 1.6, roughness: 0.9, side: THREE.DoubleSide })); body.position.y = -0.42 * big; g.add(body);
    for (let r = -2; r <= 2; r++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3 * big * Math.cos(r * 0.32) * 1.003, 0.004, 4, 28).rotateX(Math.PI / 2), STDm({ color: '#2a1a10' })); ring.position.y = -0.42 * big + r * 0.1 * big; g.add(ring); }
    g.add(mesh(new THREE.CylinderGeometry(0.1 * big, 0.12 * big, 0.06, 12), STDm({ color: '#1a1a1a' }), 0, -0.1 * big, 0)); g.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.1, 4), STDm({ color: '#111' }), 0, -0.05, 0));
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.position.y = -0.42 * big; gl.scale.setScalar(2.6 * big); g.add(gl);
    S.lant.push({ g, body, gl, col: lin(col), ph: R.r(0, TAU), off: R.r(0.4, 2.2) }); }));
  { const pt = g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
      for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(k * w / 8 + w / 16, h - 2); x.lineTo(k * w / 8, h + 2); x.lineTo(k * w / 8 + w / 8, h + 2); x.fill(); x.fillRect(k * w / 8 + 3, h - 12, 3, 9); }
      x.beginPath(); x.arc(w / 2, h * 0.45, w * 0.17, 0, TAU); x.fill(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.beginPath(); x.ellipse(w / 2 + Math.cos(a) * w * 0.3, h * 0.45 + Math.sin(a) * w * 0.3, 6, 11, a, 0, TAU); x.fill(); }
      for (let k = 0; k < 6; k++) { x.fillRect(8 + k * 20, 8, 8, 8); x.fillRect(8 + k * 20, h * 0.78, 8, 6); } }, 128, 160);
    const fl = []; [[2, 3, 3.0], [0, 1, 2.9], [4, 5, 2.95], [8, 9, 2.4]].forEach(([a, b, hh]) => { const A = top(a), B = top(b); A.y = B.y = LKD + hh; const L = A.distanceTo(B), n = Math.round(L / 0.34);
      for (let k = 1; k < n; k++) { const u = k / n, p = A.clone().lerp(B, u); p.y -= 0.35 * 4 * u * (1 - u); fl.push({ p, ry: Math.atan2(B.x - A.x, B.z - A.z) + Math.PI / 2 }); } });
    const I = IM(new THREE.PlaneGeometry(0.28, 0.35).translate(0, -0.175, 0), STDm({ map: pt, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7, emissive: '#ffffff', emissiveIntensity: 0.12 }), fl.length, false); I.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    fl.forEach((f, i) => I.setColorAt(i, lin(['#ff3d8a', '#2ec46a', '#ff9a1a', '#2a8cff', '#ffd21a', '#a24cff'][i % 6]))); st.scene.add(I); S.picado = { I, fl }; }
  S.plights = [[-3.2, -4], [3.2, -4], [-3.2, -10.5], [3.2, -10.5]].map(([x, z], i) => { const l = new THREE.PointLight('#ffa856', 2.0, 18, 1.5); l.position.set(x, LKD + 3.4, z); st.scene.add(l); return l; });
  S.djl = [['#d040ff', -4.2, -6.6]].map(([c, x, z]) => { const l = new THREE.PointLight(c, 2.5, 11, 1.6); l.position.set(x, LKD + 1.6, z); st.scene.add(l); return l; });
  // DJ booth, speakers, bar, cocktail tables, coolers
  { const g = new THREE.Group(); g.position.set(-5.0, LKD, -6.6); g.rotation.y = Math.PI / 2; st.scene.add(g); S.djG = g; const blk = STDm({ color: '#141416', roughness: 0.5 });
    g.add(mesh(new THREE.BoxGeometry(2.0, 0.95, 0.7), STDm({ color: '#1c1c20', roughness: 0.6 }), 0, 0.475, 0)); g.add(mesh(new THREE.BoxGeometry(2.0, 0.05, 0.03), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.4, 1.6) }), 0, 0.82, 0.36));
    g.add(mesh(new THREE.BoxGeometry(2.0, 0.05, 0.03), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.6, 3) }), 0, 0.12, 0.36));
    [-0.6, 0.6].forEach((x) => { g.add(mesh(new THREE.BoxGeometry(0.45, 0.06, 0.38), blk, x, 0.98, 0)); g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 24), STDm({ color: '#222', roughness: 0.3 }), x, 1.02, 0)); });
    g.add(mesh(new THREE.BoxGeometry(0.4, 0.07, 0.36), blk, 0, 0.99, 0)); const led = IM(new THREE.BoxGeometry(0.02, 0.01, 0.02), new THREE.MeshBasicMaterial({ color: '#ffffff' }), 12, false); for (let k = 0; k < 12; k++) { led.setMatrixAt(k, M4c(-0.15 + (k % 6) * 0.06, 1.03, -0.08 + Math.floor(k / 6) * 0.14)); led.setColorAt(k, new THREE.Color(...(k % 3 ? [0.2, 3, 1] : [3, 0.4, 0.2]))); } g.add(led);
    const lap = new THREE.Group(); lap.position.set(0, 1.03, -0.2); g.add(lap); lap.add(mesh(new THREE.BoxGeometry(0.34, 0.015, 0.24), STDm({ color: '#b8b8c0', metalness: 0.7, roughness: 0.3 }))); const scr = mesh(new THREE.PlaneGeometry(0.32, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.9, 1.6) }), 0, 0.1, -0.12); scr.rotation.x = -0.25; scr.rotation.y = Math.PI; lap.add(scr);
    [-1.5, 1.5].forEach((x) => { g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6).translate(0, 0.55, 0), blk, x, 0, 0)); const sp = mesh(new THREE.BoxGeometry(0.45, 0.7, 0.4), blk, x, 1.45, 0); g.add(sp);
      [[1.27, 0.14], [1.65, 0.06]].forEach(([y, r]) => g.add(mesh(new THREE.CylinderGeometry(r, r, 0.02, 20).rotateX(Math.PI / 2), STDm({ color: '#2a2a2e', roughness: 0.4 }), x, y, 0.205))); });
    const D = S.dj = man(RNG('dj'), { top: '#1c1c1c', hairStyle: 'short' }); st.scene.add(D.root); }
  { const g = new THREE.Group(); g.position.set(5.6, LKD, -4.5); st.scene.add(g); g.add(mesh(new THREE.BoxGeometry(0.9, 1.1, 4.2), wood, 0, 0.55, 0)); g.add(mesh(new THREE.BoxGeometry(1.1, 0.06, 4.4), dark, 0, 1.13, 0));
    const bt = IM(new THREE.CylinderGeometry(0.035, 0.04, 0.3, 8).translate(0, 0.15, 0), STDm({ color: '#ffffff', roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85 }), 26); for (let k = 0; k < 26; k++) { bt.setMatrixAt(k, M4c(R.n(0.3), 1.16, -2 + k * 0.155 + R.n(0.03))); bt.setColorAt(k, lin(R.pick(['#2a6a2a', '#7a4a1a', '#e8e0c8', '#3a2a1a', '#2a4a7a']))); } g.add(bt);
    const cooler = (x, z, c) => { g.add(mesh(new THREE.BoxGeometry(0.7, 0.45, 0.45), STDm({ color: c, roughness: 0.5 }), x, 0.225, z)); g.add(mesh(new THREE.BoxGeometry(0.72, 0.06, 0.47), STDm({ color: '#f0f0f0', roughness: 0.5 }), x, 0.47, z)); }; cooler(-0.9, 2.6, '#1f5aa8'); cooler(-0.9, 1.9, '#c8372d'); }
  [[-1.8, -4.8], [2.4, -8.6], [-0.6, -11.8], [3.6, -12.4]].forEach(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, LKD, z); st.scene.add(g); g.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.05, 8).translate(0, 0.52, 0), IRON())); g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 20), wood, 0, 1.07, 0)); g.add(mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 16), IRON(), 0, 0.015, 0)); candle(g, 0.05, 1.09, 0.05, 0.12, 0.03);
    [[0.12, -0.08, '#2a6a2a'], [-0.1, 0.1, '#e8e0c8']].forEach(([bx, bz, c]) => g.add(mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.24, 8).translate(0, 0.12, 0), STDm({ color: c, roughness: 0.15 }), bx, 1.09, bz))); });
  // boats on the lake, rocks: the one under the slip (the danger) and some on the bed
  lkBoat(st, 3.4, 12, 0.05, '#e8e8ec'); lkBoat(st, -3.5, 22, -0.08, '#c8372d'); lkBoat(st, -3.4, 7, 0.04, '#2a6aa8', 0.8); lkSail(st, -26, -44, 0.6); lkSail(st, 38, -75, -0.3); lkSail(st, -70, -150, 1.0); lkSail(st, 55, -190, 0.3);
  const rockM = STDm({ color: '#b0a898', roughness: 0.7, map: texNoise('lkrock', '#6e675c', ['#3a362e', '#7a7468', '#4a4438', '#5a5a48', '#8a8476'], 14000) });
  S.rock = mesh(lkRockGeo(31), STDm({ color: '#c4ccd8', emissive: '#262e3a', roughness: 0.25, metalness: 0.05, envMapIntensity: 2.5, map: texNoise('lkrockg', '#7a7e82', ['#55595e', '#8e9296', '#45494c', '#a0a4a6', '#5e625a'], 16000) }), 0.55, -0.72, -17.7); S.rock.scale.set(0.95, 1.2, 0.85); st.scene.add(S.rock);
  S.foam = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.2, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: g3Radial([[0, 'rgba(255,255,255,0)'], [0.62, 'rgba(255,255,255,0)'], [0.7, 'rgba(230,240,250,0.55)'], [0.85, 'rgba(230,240,250,0.12)'], [1, 'rgba(255,255,255,0)']], 128), transparent: true, depthWrite: false, color: '#c8d4e0' })); S.foam.position.set(0.55, 0.015, -17.7); S.foam.scale.set(1, 1, 0.9); st.scene.add(S.foam);
  { const I = IM(lkRockGeo(7, 32), rockM, 40); for (let k = 0; k < 40; k++) { const x = R.r(-14, 14), z = R.r(-30, 4), s = R.r(0.4, 1.8); I.setMatrixAt(k, M4c(x, hT(x, z) + s * 0.3, z, R.r(0, 6), s * 1.2, s * 0.8, s)); } S.under.add(I);
    const wd = IM(new THREE.PlaneGeometry(0.12, 1).translate(0, 0.5, 0), STDm({ color: '#2f5a2a', side: THREE.DoubleSide, roughness: 0.9 }), 500, false); for (let k = 0; k < 500; k++) { const x = R.r(-10, 10), z = R.r(-28, 2); wd.setMatrixAt(k, M4c(x, hT(x, z), z, R.r(0, 6), 1, R.r(0.6, 2.4), 1, R.n(0.25), R.n(0.25))); } S.under.add(wd);
    const sn = 1400, sg = new THREE.BufferGeometry(), sp = new Float32Array(sn * 3); for (let k = 0; k < sn; k++) sp.set([R.r(-8, 8), R.r(-8, 0), R.r(-26, -8)], k * 3); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    S.motes = new THREE.Points(sg, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, map: glowTex(), color: '#b8dcd8', transparent: true, opacity: 0.5, depthWrite: false })); S.under.add(S.motes); S.under.visible = false;
    S.uLight = new THREE.PointLight('#8fe0e0', 0, 9, 1.2); S.uLight.position.set(0.0, -0.2, -15.2); st.scene.add(S.uLight); }
  // people: the dancing crowd, the four friends on the slip
  { const n = 70, C = S.crowd = makeCrowd(n, { seed: 21 }); st.scene.add(C.grp); S.cp = [];
    for (let i = 0; i < n; i++) { let x, z; if (i < 56) { x = R.r(-3.9, 4.9); z = R.r(-2.4, -13.2); } else if (i < 64) { x = R.r(-1.2, 1.2); z = R.r(1, 18); } else { x = (i % 2 ? 1 : -1) * R.r(1.6, 2.4); z = R.r(-14.4, -18.2); }
      S.cp.push({ x, z, yaw: Math.atan2(-5.2 - x, -6.6 - z) + R.n(0.9), ph: R.r(0, TAU), up: R.f(), fast: R.r(0.85, 1.15), gone: R.r(0.2, 2.6) }); } }
  S.dan = Array.from({ length: 12 }, (_, i) => { const Rr = RNG('dan' + i), P = (i % 2 ? woman : man)(Rr); st.scene.add(P.root); return { P, x: -3.4 + (i % 6) * 1.5 + Rr.n(0.3), z: -10.2 - Math.floor(i / 6) * 2.0 + Rr.n(0.3), ph: Rr.r(0, TAU), yaw: Rr.r(-1, 1) + (i % 3 ? Math.PI : 0) }; });
  S.fr = [['w', '#e8304a', -1.52, -16.3], ['m', '#f4f1ea', -1.6, -17.9], ['m', '#2a9d8f', 1.52, -16.1], ['w', '#f0c33c', 1.6, -17.7]].map(([s, top, x, z], i) => { const Rr = RNG('fr' + i), P = s === 'w' ? woman(Rr, { top }) : man(Rr, { top }); st.scene.add(P.root); return { P, x, z }; });
  // the floating bed, its IV/monitor pole, floating paper lanterns, the doctors
  S.bed = lkBed(S); S.flo = lkFloaters(S, R); S.docs = [['#e8ecf0', 0], ['#dfe6ea', 1], ['#e8ecf0', 2]].map(([c, i]) => { const P = man(RNG('doc' + i), { coat: c, top: '#7aa0b8', bottom: '#3a4a5a', hairStyle: i === 1 ? 'none' : 'short' }); st.scene.add(P.root); P.root.visible = false; P.root.traverse((m) => { if (m.isMesh) m.material = LKSIL; }); P.cheeks.forEach((c) => (c.visible = false)); P.cheeks.forEach((c) => (c.material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }))); return P; });
  // first-person body: hands + bare feet
  S.HL = makeHand(-1, { sleeve: '#e8e2d6', skin: '#d8a48a' }); S.HR = makeHand(1, { sleeve: '#e8e2d6', skin: '#d8a48a' }); st.scene.add(S.HL.root, S.HR.root); S.hideRefl.push(S.HL.root, S.HR.root);
  { const sk = STDm({ color: '#9a6a50', roughness: 0.75 }); S.feet = new THREE.Group(); [-1, 1].forEach((s) => { const f = lkFoot(s, sk); f.position.set(s * 0.15, LKD, -13.78); f.rotation.y = -s * 0.12; f.scale.setScalar(1.5); S.feet.add(f); }); st.scene.add(S.feet); S.hideRefl.push(S.feet); }
  // rain streaks in a box around the camera
  { const n = 2600, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3)); S.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#a8b8d0', transparent: true, opacity: 0.5, depthWrite: false })); S.rain.frustumCulled = false; S.rain.visible = false; st.scene.add(S.rain); S.rainS = Array.from({ length: n }, () => [R.r(-12, 12), R.r(0, 1), R.r(-14, 10), R.r(0.8, 1.2)]); }
  return S; }); }

function lkBed(S) { const st = S.st, g = new THREE.Group(); g.position.set(LKB.x, 0, LKB.z); st.scene.add(g);
  const metal = STDm({ color: '#d8dce0', metalness: 0.6, roughness: 0.35 }), plast = STDm({ color: '#ece6da', roughness: 0.45 }), blanketM = STDm({ color: '#d2e2ee', roughness: 0.95 });
  g.add(mesh(new THREE.BoxGeometry(1.0, 0.16, 2.15), metal, 0, 0.42, 0)); g.add(mesh(new THREE.BoxGeometry(0.96, 0.18, 2.05), STDm({ color: '#eef2f4', roughness: 0.8 }), 0, 0.6, 0));
  [[-0.45, -0.95], [0.45, -0.95], [-0.45, 0.95], [0.45, 0.95]].forEach(([x, z]) => g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), metal, x, 0.12, z)));
  // blanket: draped over the body (torso under the camera, legs, feet), wrinkles, sides falling
  { const bg = new THREE.PlaneGeometry(1.3, 1.85, 60, 100).rotateX(-Math.PI / 2), p = bg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), ax = Math.abs(x), tor = 0.09 * Math.exp(-((x / 0.24) ** 4)) * ss(0.3, -0.2, z), legs = 0.075 * (Math.exp(-(((x - 0.11) / 0.085) ** 2)) + Math.exp(-(((x + 0.11) / 0.085) ** 2))) * ss(-0.2, 0.1, z),
        feet = 0.1 * (Math.exp(-(((x - 0.12) / 0.07) ** 2)) + Math.exp(-(((x + 0.12) / 0.07) ** 2))) * Math.exp(-(((z - 0.66) / 0.09) ** 2)), wr = 0.006 * Math.sin(x * 11 + z * 5 + 1) * Math.sin(z * 9 - x * 4) + 0.003 * Math.sin(z * 23 + x * 9);
      let y = 0.7 + Math.max(tor, legs, feet) + wr; if (ax > 0.47) y -= (ax - 0.47) * 2.4 + 0.006 * Math.sin(z * 30); p.setY(i, y); if (ax > 0.47) p.setX(i, Math.sign(x) * (0.47 + (ax - 0.47) * 0.35)); }
    bg.computeVertexNormals(); const b = mesh(bg, blanketM, 0, 0, 0.12, { cast: false }); b.material.side = THREE.DoubleSide; g.add(b);
    const fold = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 16).rotateZ(Math.PI / 2), STDm({ color: '#f2f4f6', roughness: 0.9 }), 0, 0.84, -0.78); fold.scale.set(1, 0.6, 1); g.add(fold); }
  // footboard with the little green display, side rails, the pillow
  { const fb = new THREE.Group(); fb.position.set(0, 0, 1.08); g.add(fb); fb.add(mesh(roundedBox(1.04, 0.62, 0.07, 0.03, 4), plast, 0, 0.82, 0)); fb.add(mesh(new THREE.BoxGeometry(0.36, 0.1, 0.02), STDm({ color: '#1a2420', roughness: 0.3 }), 0, 0.98, -0.04));
    const lamps = IM(new THREE.BoxGeometry(0.055, 0.045, 0.01), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 3.2, 1.2) }), 4, false); for (let k = 0; k < 4; k++) lamps.setMatrixAt(k, M4c(-0.12 + k * 0.08, 0.98, -0.052)); fb.add(lamps); S.bedLamps = lamps; }
  [-1, 1].forEach((s) => { const r = new THREE.Group(); r.position.set(s * 0.53, 0, -0.35); g.add(r); [0.86, 1.0].forEach((y) => r.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.9, 8).rotateX(Math.PI / 2), metal, 0, y, 0)));
    [-0.4, 0, 0.4].forEach((z) => r.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), metal, 0, 0.84, z))); r.add(mesh(new THREE.BoxGeometry(0.03, 0.2, 0.9), STDm({ color: '#e0dcd2', roughness: 0.5, transparent: true, opacity: 0.85 }), 0, 0.93, 0)); });
  g.add(mesh(roundedBox(0.7, 0.16, 0.42, 0.07, 4), STDm({ color: '#f4f4f2', roughness: 0.9 }), 0, 0.78, -0.86));
  // the IV + monitor pole, standing in the water at the bed's left
  { const pg = new THREE.Group(); pg.position.set(0.64, 0, 0.8); g.add(pg); pg.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.9, 8).translate(0, 0.95, 0), metal)); pg.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 16), metal, 0, 0.04, 0));
    const c = document.createElement('canvas'); c.width = 320; c.height = 240; S.monC = c; S.monT = new THREE.CanvasTexture(c); S.monT.encoding = THREE.sRGBEncoding;
    const mon = new THREE.Group(); mon.position.set(-0.05, 1.6, 0); mon.rotation.y = 0.35; pg.add(mon); mon.add(mesh(roundedBox(0.5, 0.4, 0.09, 0.02, 3), STDm({ color: '#d8d4cc', roughness: 0.5 })));
    mon.add(mesh(new THREE.PlaneGeometry(0.44, 0.33), new THREE.MeshBasicMaterial({ map: S.monT, color: new THREE.Color(1.6, 1.6, 1.6) }), 0, 0, -0.047, { ry: Math.PI }));
    const bag = mesh(new THREE.SphereGeometry(0.09, 14, 10), STDm({ color: '#e8f0f4', roughness: 0.15, transparent: true, opacity: 0.7 }), 0.1, 1.85, 0.05); bag.scale.set(0.8, 1.3, 0.35); pg.add(bag); }
  // tape and IV line on the right hand, ID band on the left (posed with the hands)
  S.tape = mesh(new THREE.BoxGeometry(0.035, 0.004, 0.05), STDm({ color: '#f4f0e8', roughness: 0.8 }), 0, 0, 0, { cast: false }); st.scene.add(S.tape);
  S.band = mesh(new THREE.TorusGeometry(0.036, 0.007, 6, 24).scale(1.25, 1, 0.7), STDm({ color: '#f8f8f4', roughness: 0.5 }), 0, 0, 0, { cast: false }); st.scene.add(S.band);
  S.ivLine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]), 8, 0.003, 5), STDm({ color: '#e8f0f0', roughness: 0.2, transparent: true, opacity: 0.8 })); st.scene.add(S.ivLine);
  S.bedL = new THREE.PointLight('#ffd6b0', 0, 7, 1.4); S.bedL.position.set(0.2, 2.3, 0.2); g.add(S.bedL);
  g.visible = false; S.bedExtras = [S.tape, S.band, S.ivLine]; S.bedExtras.forEach((o) => (o.visible = false)); S.hideRefl.push(S.tape, S.band, S.ivLine); return g; }
function lkFloaters(S, R) { const n = 60, st = S.st, body = IM(new THREE.CylinderGeometry(0.11, 0.14, 0.22, 6).translate(0, 0.11, 0), new THREE.MeshBasicMaterial({ color: '#ffffff' }), n, false), G = lkGlowPts(st, n, 1.4, 0.8), L = [];
  body.instanceMatrix.setUsage(THREE.DynamicDrawUsage); st.scene.add(body);
  for (let i = 0; i < n; i++) { let x, z; do { const a = i % 2 ? R.r(0.3, 2.85) : R.r(0, TAU), r = 1.8 + Math.pow(R.f(), 1.1) * 26; x = LKB.x + Math.cos(a) * r; z = LKB.z + Math.sin(a) * r * 0.9; } while (z > -19.5 && Math.abs(x) < 8);
    L.push({ x, z, ph: R.r(0, TAU), col: lin(R.pick(['#ffb050', '#ff8a3a', '#ff6080', '#ffd070', '#ffa0c0'])), off: R.r(0.4, 2.3), dx: R.n(1), dz: R.n(1) }); }
  return { body, G, L }; }

// ---- per-frame posing
function lkMon(S, t, alarm = 0) { const c = S.monC, x = c.getContext('2d'), w = c.width, h = c.height; x.fillStyle = alarm > 0.5 && Math.floor(t * 4) % 2 ? '#3a0808' : '#060a0c'; x.fillRect(0, 0, w, h);
  const tr = (y0, col, f, amp) => { x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 200; i++) { const u = i / 200, ph = u * 3 + t * 1.3; x.lineTo(10 + u * 195, y0 - amp * f(ph)); } x.stroke(); };
  tr(55, '#3cff7a', (p) => { const q = p % 1; return q < 0.04 ? -0.3 : q < 0.07 ? 1.6 : q < 0.1 ? -0.6 : q > 0.3 && q < 0.42 ? 0.3 * Math.sin((q - 0.3) / 0.12 * Math.PI) : 0; }, 26);
  tr(125, '#3cd8ff', (p) => Math.sin(p * TAU) * 0.6 + Math.sin(p * TAU * 2) * 0.2, 16); tr(185, '#ffe23c', (p) => Math.sin(p * TAU * 0.5), 10);
  x.font = 'bold 44px sans-serif'; x.textAlign = 'right'; x.fillStyle = alarm > 0.5 ? '#ff5050' : '#3cff7a'; x.fillText(alarm > 0.5 ? '41' : '78', 305, 60); x.fillStyle = '#3cd8ff'; x.fillText('97', 305, 120); x.font = 'bold 30px sans-serif'; x.fillStyle = '#ffe23c'; x.fillText('14', 305, 168); x.fillStyle = '#ff7ad0'; x.font = 'bold 26px sans-serif'; x.fillText('118/76', 305, 222);
  S.monT.needsUpdate = true; }
// mode: which world is on (fog, groups, the hands/feet)
function lkMode(S, m) { const st = S.st, under = m === 'under', bed = m === 'dream' || m === 'storm' || m === 'off';
  st.scene.fog = under ? S.fogUnder : S.fogAir; S.under.visible = under; S.surfU.visible = under; [S.HL, S.HR].forEach((H) => H.sleeveM.color.set(bed ? '#dfe6ee' : '#b07a5c')); S.foam.visible = !under; S.uLight.intensity = under ? 3.2 : 0;
  S.bed.visible = bed; S.bedExtras.forEach((o) => (o.visible = bed)); S.flo.body.visible = S.flo.G.visible = m === 'dream' || m === 'storm'; S.docs.forEach((P) => (P.root.visible = m === 'off'));
  S.feet.visible = m === 'dare' || m === 'jump'; S.HL.root.visible = S.HR.root.visible = m !== 'party'; S.rain.visible = m === 'storm'; S.fr.forEach((f) => (f.P.root.visible = m !== 'dream' && m !== 'storm' && m !== 'off'));
  [S.bulbGlow].forEach((p) => { if (p.material.fog === under) { p.material.fog = !under; p.material.needsUpdate = true; } });
  st.hemi.color.set(under ? '#2a7080' : '#33447a'); st.hemi.groundColor.set(under ? '#061818' : '#1a140e'); st.hemi.intensity = under ? 0.5 : 0.3; st.key.intensity = under ? 0.15 : 0.55;
  S.cU.uFlash.value = 0; S.cU.uCov.value = 0.35; S.cU.uCol.value.set(lin('#141a2c')); S.stars.material.opacity = 0.85; S.stars2.material.opacity = 0.9; S.halo.material.opacity = 0.35; S.moonS.material.opacity = 1;
  S.bedL.intensity = m === 'dream' ? 0.32 : m === 'storm' ? 0.3 : m === 'off' ? 0.25 : 0; S.bedL.color.set(m === 'off' ? '#8aa0c8' : '#ffe8d8'); S.st.skyU.top.value.copy(lin('#060b1e')); S.st.skyU.hor.value.copy(lin('#3a5088')); S.fogAir.color.set('#1c2a4c'); S.fogAir.near = 30; S.fogAir.far = 950; S.wU.uAmp.value = 0; S.wU.uRip.value = 1; S.wU.uFoam.value = 0; S.wU.uRK.value = 1; }
// the party lights. k(i) → 0..1 per bulb; lanternK(i), plK, sway (wind)
function lkLights(S, t, o = {}) { const bk = o.bulb || (() => 1), lk = o.lant || (() => 1), wind = o.wind || 0, pk = o.pl ?? 1;
  const M = S.bulbCore, gp = S.bulbGlow.geometry.attributes.position, gc = S.bulbGlow.geometry.attributes.color;
  S.bulbs.forEach((b, i) => { const sw = wind * (0.18 + 0.25 * Math.sin(Math.PI * b.u)) * (Math.sin(t * 3.1 + b.si) + 0.5 * Math.sin(t * 7.3 + i * 0.3)), x = b.p.x + sw * 0.4, y = b.p.y + Math.abs(sw) * 0.2, z = b.p.z + sw;
    const k = clamp(bk(i, b)) * (0.88 + 0.12 * Math.sin(t * 2.3 + i * 1.7)); M.setMatrixAt(i, M4c(x, y, z, 0, 1, 1, 1)); M.setColorAt(i, new THREE.Color(0.03 + 0.97 * k, 0.025 + 0.975 * k, 0.02 + 0.98 * k));
    gp.setXYZ(i, x, y, z); gc.setXYZ(i, 1.0 * k, 0.68 * k, 0.34 * k); });
  M.instanceMatrix.needsUpdate = true; M.instanceColor.needsUpdate = true; gp.needsUpdate = gc.needsUpdate = true;
  S.lant.forEach((L, i) => { const k = clamp(lk(i)); L.body.material.emissiveIntensity = 1.6 * k; L.gl.material.opacity = 0.55 * k; L.g.rotation.set(wind * (0.5 * Math.sin(t * 2.6 + L.ph) + 0.3), 0, wind * 0.45 * Math.sin(t * 3.4 + L.ph * 2) + 0.03 * Math.sin(t * 0.8 + L.ph)); });
  const { I, fl } = S.picado; fl.forEach((f, i) => { I.setMatrixAt(i, M4c(f.p.x, f.p.y, f.p.z, f.ry, 1, 1, 1, (0.08 + wind * 0.9) * Math.sin(t * (2 + wind * 6) + i * 0.7) + wind * 0.6, 0)); }); I.instanceMatrix.needsUpdate = true;
  S.plights.forEach((l) => (l.intensity = 2.0 * pk)); S.djl.forEach((l, i) => (l.intensity = 2.5 * pk * (0.6 + 0.4 * Math.sin(t * 6.28 + i * 3))));
  const tc = S.town.material; tc.opacity = 0.9 * (o.town ?? 1); }
function lkCrowd(S, t, gone = () => 0) { const C = S.crowd; S.cp.forEach((q, i) => { const b = Math.max(0, Math.sin(t * 12.566 * 0.5 * q.fast + q.ph)), y = (i >= 56 && i < 64 ? LKD : LKD) + 0.06 * b, up = q.up > 0.55 ? 0.5 + 0.5 * Math.sin(t * 3.1 + q.ph) : q.up > 0.35 ? 0.25 : 0;
  C.set(i, q.x + 0.05 * Math.sin(t * 2 + q.ph), y, q.z, q.yaw + 0.25 * Math.sin(t * 1.3 + q.ph), 1, up, 0.08 * Math.sin(t * 6.28 * 0.5 + q.ph), gone(i, q)); }); C.done();
  S.dan.forEach((d, i) => { if (gone(i + 100, { gone: 0.4 + i * 0.15 }) >= 1) { d.P.root.visible = false; return; } d.P.root.visible = true; const b = Math.sin(t * 6.283 + d.ph), up = i % 3 === 0;
    posePerson(d.P, { x: d.x, y: LKD, z: d.z, yaw: d.yaw + 0.3 * Math.sin(t * 1.1 + d.ph), ph: t * 6.283 * 0.5 + d.ph, walk: 0.25, armL: up ? [2.7 + 0.2 * b, 0.3, 0.3] : [0.5 + 0.3 * b, 0.25, 1.4], armR: up ? [2.5 - 0.2 * b, 0.3, 0.4] : [0.6 - 0.3 * b, 0.25, 1.5], headPitch: 0.1 * b, sway: 0.08 * b, emo: { smile: 0.9, open: 0.3 } }); });
  const D = S.dj; posePerson(D, { x: -5.75, y: LKD, z: -6.6, yaw: Math.PI / 2, armL: [0.9, 0.15, 0.6], armR: [0.7 + 0.25 * Math.sin(t * 6.28), 0.2, 0.9], headPitch: 0.25 + 0.12 * Math.max(0, Math.sin(t * 12.566)), emo: { smile: 0.6 } }); }
function lkFriends(S, t, mode) { S.fr.forEach((f, i) => { const P = f.P, s = f.x > 0 ? 1 : -1;
  if (mode === 'cheer') { const yaw = Math.atan2(0 - f.x, -13.4 - f.z), j = Math.sin(t * 7 + i * 1.3); posePerson(P, { x: f.x, y: LKD + 0.04 * Math.max(0, j), z: f.z, yaw, armL: [2.6 + 0.3 * j, 0.35, 0.3], armR: [i % 2 ? 2.2 : 0.6, 0.3, i % 2 ? 0.4 : 1.4], headPitch: 0.1, emo: { smile: 0.9, open: 0.6 + 0.3 * j } }); }
  else { const sp = [[-0.55, -13.85, 0], [0.7, -13.9, 0], [-1.42, -15.6, 1], [1.42, -16.4, -1]][i], yaw = sp[2] === 0 ? Math.PI : sp[2] * Math.PI / 2; // lean over the edge
    posePerson(P, { x: sp[0], y: LKD, z: sp[1], yaw, lean: 0.75, crouch: 0.4, headPitch: 0.55, armL: [1.2, 0.25, 0.4], armR: [i % 2 ? 1.3 : 0.4, 0.2, 0.5], emo: { fear: 0.8, open: 0.4 } }); } }); }
// first-person hands relative to the camera; q: dx, dy, dz, tilt, roll, curl, spread
function lkCamHands(S, q) { const cam = S.st.cam; cam.updateMatrixWorld(true); [S.HL, S.HR].forEach((H) => { const s = H.side, off = new THREE.Vector3(s * (q.dx ?? 0.2), q.dy ?? -0.3, q.dz ?? -0.45);
  if (q.wob) off.add(new THREE.Vector3(Math.sin(TT * 9 + s) * q.wob, Math.cos(TT * 7 + s * 2) * q.wob, 0)); H.root.position.copy(cam.position).add(off.applyQuaternion(cam.quaternion));
  H.root.quaternion.copy(cam.quaternion); H.root.rotateX(-(q.tilt ?? 0.9)); H.root.rotateZ(-s * (q.roll ?? 0.3)); H.root.rotateY(s * (q.yaw ?? 0));
  poseHand(H, { curl: q.curl ?? [0.2, 0.25, 0.3, 0.35], spread: q.spread ?? 0.4, thumb: 0.2, tremble: q.tremble ?? 0.2 }); }); }
const _lkY = new THREE.Vector3(), _lkZ = new THREE.Vector3(), _lkX = new THREE.Vector3(), _lkM = new THREE.Matrix4();
function lkAim(H, w, dir, up) { _lkY.copy(dir).normalize(); _lkZ.copy(up).addScaledVector(_lkY, -up.dot(_lkY)).normalize(); _lkX.crossVectors(_lkY, _lkZ); _lkM.makeBasis(_lkX, _lkY, _lkZ); H.root.quaternion.setFromRotationMatrix(_lkM); H.root.position.copy(w); }
// the bed: bob/roll on the swell; the hands lying on the blanket; extras follow
function lkPoseBed(S, t, amp) { const g = S.bed, hb = lkWaveH(LKB.x, LKB.z, t, amp), hf = lkWaveH(LKB.x, LKB.z + 1, t, amp), hs = lkWaveH(LKB.x + 0.5, LKB.z, t, amp);
  g.position.y = hb * 0.8 + 0.015 * Math.sin(t * 1.1); g.rotation.set((hf - hb) * 0.6, 0, -(hs - hb) * 0.9); g.updateMatrixWorld(true);
  const W2 = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(g.matrixWorld), D2 = (x, y, z) => new THREE.Vector3(x, y, z).transformDirection(g.matrixWorld);
  [S.HL, S.HR].forEach((H) => { const s = H.side; lkAim(H, W2(s * 0.16, 0.81, -0.36), D2(-s * 0.12, -0.08, 1), D2(-s * 0.12, 1, 0)); poseHand(H, { curl: [0.22, 0.26, 0.3, 0.36], spread: 0.25, thumb: 0.1, tremble: 0 }); H.root.updateMatrixWorld(true); });
  S.tape.position.copy(new THREE.Vector3(0, 0.05, 0.022).applyMatrix4(S.HR.root.matrixWorld)); S.tape.quaternion.copy(S.HR.root.quaternion); S.tape.rotateX(Math.PI / 2);
  S.band.position.copy(new THREE.Vector3(0, -0.035, 0).applyMatrix4(S.HL.root.matrixWorld)); S.band.quaternion.copy(S.HL.root.quaternion); S.band.rotateX(Math.PI / 2);
  const a = new THREE.Vector3(0, 0.06, 0.03).applyMatrix4(S.HR.root.matrixWorld), b = W2(0.42, 0.9, -0.1), c2 = W2(0.55, 1.3, 0.45), d = W2(0.62, 1.8, 0.8);
  S.ivLine.geometry.dispose(); S.ivLine.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, b, c2, W2(0.2, 1.9, 1.0), d]), 40, 0.003, 5); return g; }
function lkFloat(S, t, k = () => 1, toss = 0) { const { body, G, L } = S.flo, gp = G.geometry.attributes.position, gc = G.geometry.attributes.color;
  L.forEach((q, i) => { const x = q.x + toss * q.dx * (t - 28) * 0.8, z = q.z + toss * q.dz * (t - 28) * 0.8, y = lkWaveH(x, z, t, S.wU.uAmp.value) * (1 - ss(40, 110, Math.hypot(x - LKB.x, z - LKB.z))) + 0.02 * Math.sin(t * 1.4 + q.ph), kk = clamp(k(i, q));
    body.setMatrixAt(i, M4c(x, y, z, q.ph, 1, 1, 1, toss * 0.4 * Math.sin(t * 3 + q.ph), toss * 0.4 * Math.cos(t * 2.6 + q.ph))); body.setColorAt(i, new THREE.Color(0.15, 0.1, 0.07).lerp(q.col.clone().multiplyScalar(2.2), kk));
    gp.setXYZ(i, x, y + 0.14, z); gc.setXYZ(i, q.col.r * kk, q.col.g * kk, q.col.b * kk); });
  body.instanceMatrix.needsUpdate = true; body.instanceColor.needsUpdate = true; gp.needsUpdate = gc.needsUpdate = true; }
function lkRain(S, t, k) { const cam = S.st.cam.position, pa = S.rain.geometry.attributes.position; S.rain.material.opacity = 0.45 * k;
  S.rainS.forEach(([x, y0, z, sp], i) => { const y = 14 - ((y0 * 14 + t * 13 * sp) % 14) - 2, px = cam.x + x + (14 - y) * 0.25, pz = cam.z + z; pa.setXYZ(i * 2, px, cam.y + y, pz); pa.setXYZ(i * 2 + 1, px - 0.12, cam.y + y - 0.55, pz); }); pa.needsUpdate = true; }
function lkRain2D(t, k) { if (k <= 0) return; const R = RNG('lkrain', Math.floor(t * 24)); ctx.save(); screen(); ctx.lineCap = 'round';
  for (let i = 0; i < 190; i++) { const x = R.r(-100, W + 50), y = R.r(-100, H), l = R.r(50, 140), w = R.r(1.2, 3.2); ctx.strokeStyle = `rgba(200,215,235,${R.r(0.08, 0.28) * k})`; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l * 0.28, y + l); ctx.stroke(); } ctx.restore(); }
function lkBolt(seed, a, x0, y0, y1) { if (a <= 0) return; const R = RNG('bolt' + seed); ctx.save(); screen(); ctx.lineJoin = 'round';
  const pts = [[x0, y0]]; let x = x0, y = y0; while (y < y1) { y += R.r(25, 60); x += R.n(45); pts.push([x, y]); }
  [[22, 0.12], [9, 0.35], [3.5, 1]].forEach(([w, al]) => { ctx.strokeStyle = `rgba(225,232,255,${al * a})`; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    for (let b = 2; b < pts.length - 2; b += 3) { const [bx, by] = pts[b]; let cx = bx, cy = by; ctx.beginPath(); ctx.moveTo(cx, cy); for (let k = 0; k < 4; k++) { cx += R.r(10, 40) * (b % 2 ? 1 : -1); cy += R.r(20, 40); ctx.lineTo(cx, cy); } ctx.stroke(); } }); ctx.restore(); }
// the bed POV camera (the patient's head on the pillow)
function lkBedCam(S, t, o = {}) { const g = S.bed; g.updateMatrixWorld(true); const e = new THREE.Vector3(0.0, 1.17, -0.98).applyMatrix4(g.matrixWorld), tg = new THREE.Vector3(o.tx ?? -0.12, o.ty ?? 0.35, 3.4).applyMatrix4(g.matrixWorld);
  camPt(S.st, [e.x, e.y, e.z], [tg.x, tg.y, tg.z], o.fov ?? 66, t, o.hh ?? 0.5, 7); S.st.cam.rotation.z += g.rotation.z * 0.8; }

// ===================================================================== shots
SHOT_FN.party = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'party'); S.wU.uT.value = t; S.cU.uT.value = t;
  lkLights(S, t); lkCrowd(S, t); lkFriends(S, t, 'cheer');
  const k = EZ.io(lt / dur); camPt(st, [lerp(23, 19.5, k), lerp(15, 13, k), lerp(13, 9, k)], [lerp(-2.0, -2.6, k), 0.0, lerp(-13, -14, k)], 56, t, 0.25, 3);
  if (!lkRender(S, 1.05, 0.55)) return; };
SHOT_FN.dare = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'dare'); S.wU.uT.value = t; S.cU.uT.value = t;
  lkLights(S, t); lkCrowd(S, t); lkFriends(S, t, 'cheer');
  const k = EZ.io(lt / dur), sway = 0.04 * Math.sin(t * 1.3); camPt(st, [sway, 2.75, -13.42], [0.0 + sway * 2, lerp(-0.6, -0.8, k), lerp(-16.0, -15.8, k)], 86, t, 0.7, 5);
  lkCamHands(S, { dx: 0.27, dy: -0.36, dz: -0.62, tilt: 2.15, roll: 0.1, yaw: 1.3, tremble: 0.4, curl: [0.18, 0.22, 0.28, 0.34], spread: 0.55 });
  if (!lkRender(S, 1.05, 0.5)) return; };
SHOT_FN.jump = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'jump'); S.wU.uT.value = t; S.cU.uT.value = t;
  lkLights(S, t); lkCrowd(S, t); lkFriends(S, t, 'cheer');
  const crouch = ss(0, 0.35, lt) * (1 - ss(0.35, 0.55, lt)), air = lt > 0.45, u = clamp((lt - 0.45) / 2.5), arc = lt < 0.45 ? 0 : 1;
  const y = lt < 0.45 ? 2.85 - 0.4 * crouch : 2.85 + 3.4 * u - 6.0 * u * u * 0.55 - 2.6 * u * u * u, z = lt < 0.45 ? -13.25 : -13.25 - 4.1 * EZ.o2(u), x = 0.32 * u;
  const pitch = lt < 0.45 ? lerp(-40, -48, crouch) : lt < 1.2 ? lerp(-48, -8, ss(0.45, 1.15, lt)) : lerp(-8, -78, ss(1.25, 2.6, lt));
  const pr = pitch * DEG; camPt(st, [x, y, z], [x + 0.05, y + Math.sin(pr) * 5, z - Math.cos(pr) * 5], 78, t, 1.6 * arc + 0.5, 9); st.cam.rotation.z += 0.08 * Math.sin(lt * 3) * arc;
  S.feet.visible = lt < 0.6; lkCamHands(S, lt < 1.3 ? { dx: lerp(0.24, 0.32, ss(0.4, 0.9, lt)), dy: lerp(-0.34, -0.12, ss(0.4, 0.9, lt)), dz: -0.42, tilt: lerp(1.05, 0.2, ss(0.4, 0.9, lt)), roll: 0.5, wob: 0.03 * arc } : { dx: 0.26, dy: -0.22, dz: -0.42, tilt: 0.7, roll: 0.25, curl: [0.05, 0.05, 0.1, 0.15], spread: 0.9, wob: 0.025 });
  if (!lkRender(S, 1.05, 0.5)) return;
  lkFill('#dff4ff', ss(2.88, 3.0, lt) * 0.9); };
// under water: the rock, the flash at 10.0, bubbles, a hand drifting
let LKBUB = null;
function lkBubbles(t0, t, n, seed, cx, cy, spread) { LKBUB = LKBUB || g3Radial([[0, 'rgba(255,255,255,0.0)'], [0.6, 'rgba(220,250,255,0.08)'], [0.82, 'rgba(235,252,255,0.75)'], [0.92, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']], 64).image;
  const R = RNG('bub' + seed); ctx.save(); screen(); for (let i = 0; i < n; i++) { const st0 = R.r(0, 1.2), sp = R.r(380, 900), r = R.r(6, 34), x0 = cx + R.n(spread), wob = R.r(10, 30), a = t - t0 - st0; if (a < 0) continue; const y = cy - a * sp - R.r(0, 300), x = x0 + Math.sin(a * 6 + i) * wob;
    if (y < -60) continue; ctx.globalAlpha = 0.9; ctx.drawImage(LKBUB, x - r, y - r * 0.9, r * 2, r * 1.8); ctx.globalAlpha = 0.6; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.18, 0, TAU); ctx.fill(); } ctx.restore(); }
SHOT_FN.hit = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'under'); S.wU.uT.value = t; S.uU.uT.value = t;
  lkLights(S, t); lkCrowd(S, t); lkFriends(S, t, 'cheer'); S.feet.visible = false;
  const sh = Math.exp(-lt * 3.5), sx = sh * 0.06 * Math.sin(lt * 61), sy = sh * 0.05 * Math.sin(lt * 47 + 1);
  camPt(st, [-0.2 + sx + 0.1 * lt, -0.7 - 0.35 * lt + sy, -15.45 + 0.25 * lt], [0.9, -1.2 - 0.3 * lt, -17.6], 70, t, 0.6, 11); st.cam.rotation.z += 0.25 - 0.1 * lt + sh * 0.1 * Math.sin(lt * 40);
  S.HL.root.visible = false; const H = S.HR; st.cam.updateMatrixWorld(true);
  const w = new THREE.Vector3(0.12 + 0.05 * lt, -0.18 - 0.03 * lt, -0.42).applyMatrix4(st.cam.matrixWorld), cq = st.cam.quaternion; H.root.position.copy(w); H.root.quaternion.copy(cq); H.root.rotateX(-1.2 - 0.15 * lt); H.root.rotateZ(-0.6 + 0.2 * Math.sin(lt * 1.5)); H.root.rotateY(2.4);
  poseHand(H, { curl: [0.1 + 0.08 * Math.sin(lt * 2), 0.15, 0.2, 0.28], spread: 0.6, thumb: 0.1, tremble: 0 });
  if (!lkRender(S, 1.1, 0.45, false)) return;
  lkBubbles(10, t, 46, 'hit', W * 0.55, H * 0.95, W * 0.4); lkBlur(1.5, 0.6);
  lkFill('#ffffff', Math.exp(-lt * 7) * 0.95); lkFill('#7a1010', Math.exp(-lt * 4) * 0.18, 'multiply'); };
SHOT_FN.sink = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'under'); S.wU.uT.value = t; S.uU.uT.value = t;
  lkLights(S, t); lkCrowd(S, t); lkFriends(S, t, 'lean'); S.feet.visible = false; S.HL.root.visible = S.HR.root.visible = false;
  const k = lt / dur, y = lerp(-2.2, -5.2, EZ.io(k)); camPt(st, [0.1 + 0.15 * Math.sin(lt * 0.6), y, -16.6], [0.0, 4.0, -15.6 + 0.3 * Math.sin(lt * 0.4)], 76, t, 0.6, 13); st.cam.rotation.z += 0.12 * Math.sin(lt * 0.5);
  if (!lkRender(S, 1.15, 0.6, false)) return;
  lkBubbles(12, t, 18, 'sink', W * 0.5, H * 1.05, W * 0.3); lkBlur(3 + 4 * k, 1);
  lkFill('#000000', ss(1.0, 3.5, lt) * 0.96); };
// the dream: the bed on the lake at the party
SHOT_FN.dream = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'dream'); S.wU.uT.value = t; S.cU.uT.value = t; S.wU.uRip.value = 0.8;
  lkLights(S, t); lkCrowd(S, t); lkFloat(S, t); lkPoseBed(S, t, 0); lkMon(S, t);
  lkBedCam(S, t, { ty: lerp(0.4, 0.3, lt / dur), fov: lerp(68, 64, EZ.io(lt / dur)) });
  if (!lkRender(S, 1.08, 0.6)) return; };
SHOT_FN.storm = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'storm'); S.wU.uT.value = t; S.cU.uT.value = t * 4;
  const k = ss(0, 1.4, lt), fl = Math.max(0, ...[0.5, 0.62, 1.95, 2.05, 2.5].map((a, i) => (lt >= a ? Math.exp(-(lt - a) * 14) * (i === 1 ? 0.7 : 1) : 0)));
  S.cU.uCov.value = lerp(0.35, 1.0, k); S.cU.uCol.value.copy(lin('#141a2c').lerp(lin('#0c0f18'), k)); S.cU.uFlash.value = fl * 2.2; S.stars.material.opacity = S.stars2.material.opacity = 0.85 * (1 - k); S.halo.material.opacity = 0.35 * (1 - k); S.moonS.material.opacity = 1 - k;
  S.st.skyU.top.value.copy(lin('#050918').lerp(lin('#05070c'), k)); S.st.skyU.hor.value.copy(lin('#2e3f6e').lerp(lin('#1a2030'), k)); S.fogAir.color.set(C3('#1c2a4c', '#141a24', k)); S.fogAir.far = lerp(950, 260, k); S.fogAir.near = lerp(30, 15, k);
  S.wU.uAmp.value = lerp(0.05, 1.0, ss(0.2, 2.0, lt)); S.wU.uRip.value = lerp(1, 3, k); S.wU.uFoam.value = ss(0.6, 2.2, lt);
  st.hemi.intensity = 0.3 + fl * 2.5; st.hemi.color.set(fl > 0.05 ? '#a8b8ff' : '#33447a'); st.key.intensity = 0.55 * (1 - 0.6 * k) + fl * 3;
  lkLights(S, t, { bulb: (i) => (lt < S.bulbOff[i] * 0.85 ? 1 - 0.6 * (lkHash(i, Math.floor(t * 14)) > 0.7 ? k : 0) : 0), lant: (i) => (lt < S.lant[i].off ? 1 : 0), wind: lerp(0.05, 1, k), pl: 1 - ss(0.6, 2.2, lt), town: 1 - 0.7 * k });
  lkCrowd(S, t, (i, q) => (lt > q.gone ? 1 : 0)); lkFloat(S, t, (i, q) => (lt < q.off ? 1 : 0), k); lkPoseBed(S, t, S.wU.uAmp.value); lkMon(S, t, lt > 1.2 ? 1 : 0); lkRain(S, t, k);
  lkBedCam(S, t, { hh: 1.6, ty: 0.38, fov: 66 });
  if (!lkRender(S, 1.05, 0.5)) return;
  lkRain2D(t, k); if (lt > 0.5 && lt < 0.75) lkBolt(1, 1 - (lt - 0.5) / 0.25, W * 0.68, 120, 620); if (lt > 1.95 && lt < 2.25) lkBolt(2, 1 - (lt - 1.95) / 0.3, W * 0.3, 80, 560);
  lkFill('#dfe6ff', fl * 0.28); };
SHOT_FN.off = (lt, dur, t) => { const S = lkWorld(), st = S.st; lkMode(S, 'off'); S.wU.uT.value = t; S.cU.uT.value = t * 0.5; S.wU.uRip.value = 0.35;
  S.cU.uCov.value = 0.85; S.cU.uCol.value.copy(lin('#1a2232')); S.stars.material.opacity = 0.12; S.stars2.material.opacity = 0.1; S.halo.material.opacity = 0.2; S.moonS.material.opacity = 0.35;
  S.st.skyU.top.value.copy(lin('#0e1828')); S.st.skyU.hor.value.copy(lin('#56667e')); S.fogAir.color.set('#5e6e86'); S.fogAir.near = 4; S.fogAir.far = 40; S.bedL.intensity = 0.06;
  st.hemi.intensity = 0.07; st.hemi.color.set('#5a6a90'); st.key.intensity = 0.03;
  lkLights(S, t, { bulb: () => 0, lant: () => 0, pl: 0, town: 0.15 }); lkCrowd(S, t, () => 1); lkPoseBed(S, t, 0); lkMon(S, t);
  const D = [[-0.9, 3.3, 0.35], [0.25, 3.9, 0], [1.3, 3.2, -0.5]]; S.docs.forEach((P, i) => { const [x, z, yw] = D[i], talk = Math.sin(t * 5.5 + i * 2) > 0.2 && Math.floor((t + i * 0.7) / 1.3) % 3 === i % 3;
    posePerson(P, { x: LKB.x + x, y: 0, z: LKB.z + z, yaw: Math.PI + yw, headYaw: 0.35 * Math.sin(t * 0.7 + i * 2) - x * 0.25, headPitch: 0.1, armL: i === 1 ? [0.4, 0.1, 1.4] : [0.1, 0.12, 0.3], armR: talk ? [0.5 + 0.2 * Math.sin(t * 3 + i), 0.25, 1.2] : [0.1, 0.12, 0.3], emo: { sad: 0.4, open: talk ? 0.3 + 0.3 * Math.max(0, Math.sin(t * 13 + i)) : 0 } }); });
  lkBedCam(S, t, { ty: 0.75, fov: lerp(64, 58, EZ.io(lt / dur)), hh: 0.25 });
  if (!lkRender(S, 0.9, 0.35)) return; lkFill('#0a1830', 0.18, 'multiply'); };
