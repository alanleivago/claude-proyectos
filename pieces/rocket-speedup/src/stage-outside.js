// =====================================================================
//  STAGE OUTSIDE (prefix ou) — what the window sees. Rendered first, with g.far (same pose as the eye, far plane 1e9 m).
//  The ship travels towards world -Z. Story time st picks the world:
//   pad   st < 75   : the launch pad 110 m below, the tower, steam, the crowd, blue sky (darkening with altitude)
//   space 75..330   : black sky, stars, the Moon sweeping past (~118..146)
//   bow   330..460  : the starbow (relativistic aberration: everything gathers into a ring ahead)
//   dark  >= 460    : the ring has shrunk to a pinprick: darkness ahead
//  ouOutside(g, st) renders and returns the light it throws into the cockpit:
//   { dir (towards the light), col, int, fill, fillCol, ground, sunDir (for a flare, or null), glass (tint 'r,g,b') }
// =====================================================================
let OU = null;
const OU_SUN_PAD = V3(-0.5, 0.62, -0.6).normalize();
const OU_SUN_SPACE = V3(-0.78, 0.30, -0.55).normalize();

function ouSoftTex(seed, w = 256) {   // a billowy cauliflower puff: firm lobes, lit from above, shaded underneath (alpha in the canvas)
  return g3Tex((x) => {
    const R = RNG(seed), lobes = [];
    for (let k = 0; k < 26; k++) { const a = R.r(0, TAU), rr = Math.sqrt(R.f()) * 0.27 * w; lobes.push([w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr * 0.75 + w * 0.04, R.r(0.09, 0.2) * w]); }
    lobes.sort((p, q) => q[1] - p[1]);   // back (low) lobes first, the lit top ones over them
    for (const [px, py, s] of lobes) {
      const g = x.createRadialGradient(px - s * 0.25, py - s * 0.35, s * 0.05, px, py, s), v = Math.round(lerp(255, 196, clamp((py - w * 0.25) / (w * 0.55))));
      g.addColorStop(0, `rgba(${v},${v},${v + 4},0.85)`); g.addColorStop(0.55, `rgba(${v - 18},${v - 16},${v - 8},0.7)`); g.addColorStop(0.85, `rgba(${v - 40},${v - 38},${v - 28},0.35)`); g.addColorStop(1, 'rgba(160,160,170,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, s, 0, TAU); x.fill();
    }
    // feather the outside so no sprite edge shows
    x.globalCompositeOperation = 'destination-in'; const f = x.createRadialGradient(w / 2, w / 2, w * 0.3, w / 2, w / 2, w * 0.5); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = f; x.fillRect(0, 0, w, w);
  }, w, w);
}

function ouBuild() {
  const R = RNG('outside');
  // ---------------- PAD ----------------
  const pad = new THREE.Scene();
  const skyU = { uSun: { value: OU_SUN_PAD.clone() }, uAlt: { value: 0 }, uT: { value: 0 }, uWhite: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(8e4, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uSun; uniform float uAlt, uT, uWhite; varying vec3 vD;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.07 + 13.1; a *= 0.5; } return s; }
      void main(){
        vec3 d = normalize(vD); float el = d.y;
        vec3 zen = mix(vec3(0.012, 0.07, 0.32), vec3(0.0, 0.0, 0.01), uAlt), hor = mix(vec3(0.34, 0.50, 0.72), vec3(0.02, 0.035, 0.07), uAlt);
        vec3 col = mix(hor, zen, pow(clamp(el, 0.0, 1.0), 0.38));
        col = mix(col, vec3(0.78, 0.80, 0.80) * (1.0 - uAlt), smoothstep(0.02, -0.03, el));                 // haze under the horizon
        float s = clamp(dot(d, uSun), 0.0, 1.0);
        col += vec3(1.0, 0.92, 0.78) * (pow(s, 900.0) * 6.0 + pow(s, 60.0) * 0.35 + pow(s, 8.0) * 0.12 * (1.0 - uAlt));
        // thin cirrus streaks high up, and a band of fair-weather cumulus on the horizon
        vec2 q = d.xz / max(0.08, d.y + 0.05);
        float ci = smoothstep(0.55, 0.85, fbm(q * vec2(0.6, 2.4) + vec2(uT * 0.004, 0.0))) * smoothstep(0.05, 0.3, el) * (1.0 - uAlt);
        col = mix(col, vec3(0.96, 0.97, 1.0), ci * 0.45);
        float cu = smoothstep(0.52, 0.7, fbm(vec2(atan(d.x, -d.z) * 9.0, el * 60.0))) * smoothstep(0.075, 0.01, el) * smoothstep(-0.01, 0.012, el) * (1.0 - uAlt);
        col = mix(col, vec3(1.0, 0.99, 0.97) * (0.8 + 0.25 * smoothstep(0.0, 0.06, el)), cu * 0.85);
        col = mix(col, vec3(0.86, 0.88, 0.92), uWhite);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  sky.frustumCulled = false; pad.add(sky);
  // the ground: 40 km of Florida coast, painted (scrub, lagoon, roads, the ocean on the horizon)
  const gTex = g3Tex((x, w, h) => {
    const RG = RNG('ground'); x.fillStyle = '#6f7a55'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 2400; k++) { const c = RG.pick(['#5d6b45', '#7c8660', '#8a8a62', '#55633f', '#9a946c', '#677552']); x.fillStyle = c; x.globalAlpha = RG.r(0.2, 0.6); x.beginPath(); x.ellipse(RG.r(0, w), RG.r(0, h), RG.r(4, 30), RG.r(3, 18), RG.r(0, 3), 0, TAU); x.fill(); }
    x.globalAlpha = 1;
    // the ocean beyond a beach line (top of the texture = far ahead, -Z)
    x.fillStyle = '#3e6f8c'; x.fillRect(0, 0, w, h * 0.30);
    x.fillStyle = '#d9cfae'; x.fillRect(0, h * 0.30, w, h * 0.008);
    // the lagoon: a winding band of water
    x.fillStyle = '#4f7f93'; x.beginPath(); x.moveTo(0, h * 0.40);
    for (let i = 0; i <= 40; i++) x.lineTo(i / 40 * w, h * (0.40 + 0.03 * Math.sin(i * 0.7) + 0.015 * Math.sin(i * 2.1)));
    for (let i = 40; i >= 0; i--) x.lineTo(i / 40 * w, h * (0.45 + 0.025 * Math.sin(i * 0.5 + 1) + 0.01 * Math.sin(i * 1.7)));
    x.fill();
    // roads and the crawler way, the pad's concrete square in the middle
    x.strokeStyle = '#b8b2a0'; x.lineWidth = 3; x.beginPath(); x.moveTo(w * 0.5, h * 0.5); x.lineTo(w * 0.42, h * 0.32); x.moveTo(0, h * 0.62); x.lineTo(w, h * 0.58); x.stroke();
    x.strokeStyle = '#9e9a8c'; x.lineWidth = 6; x.beginPath(); x.moveTo(w * 0.5, h * 0.5); x.lineTo(w * 0.5, h); x.stroke();
    x.fillStyle = '#b9b5a8'; x.fillRect(w * 0.5 - 18, h * 0.5 - 18, 36, 36);
    // the viewing area: a pale gravel lot full of dots (cars) on the lagoon shore
    x.fillStyle = '#b7ae92'; x.fillRect(w * 0.40, h * 0.455, w * 0.10, h * 0.012);
  }, 2048, 2048);
  gTex.anisotropy = 16;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), new THREE.MeshStandardMaterial({ map: gTex, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.material.polygonOffset = true; ground.material.polygonOffsetFactor = 4; ground.material.polygonOffsetUnits = 4; pad.add(ground);
  pad.fog = new THREE.FogExp2(lin('#c4d3df'), 0.00011);
  const padSun = new THREE.DirectionalLight(lin('#fff4e4'), 2.4); padSun.position.copy(OU_SUN_PAD).multiplyScalar(1000); pad.add(padSun, new THREE.HemisphereLight(lin('#bcd6f2'), lin('#6d6a55'), 1.0));
  // the tower: a steel lattice ahead-left of the window, 4 legs, a beam every 6 m, X braces, the swing arm, a lightning mast
  const PAD_Y = -110, TW = { x: -11.5, z: -23, s: 7.5, top: 28 };
  const beams = [];
  const beam = (a, b, t) => beams.push([a, b, t]);
  const L = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => [TW.x + i * TW.s / 2, TW.z + j * TW.s / 2]);
  for (let k = 0; k < 4; k++) beam([L[k][0], PAD_Y, L[k][1]], [L[k][0], TW.top, L[k][1]], 0.55);
  for (let y = PAD_Y + 6; y < TW.top; y += 6) for (let k = 0; k < 4; k++) {
    const a = L[k], b = L[(k + 1) % 4];
    beam([a[0], y, a[1]], [b[0], y, b[1]], 0.32);
    beam([a[0], y - 6, a[1]], [b[0], y, b[1]], 0.16); beam([b[0], y - 6, b[1]], [a[0], y, a[1]], 0.16);
  }
  // the crew access arm: a covered walkway swung back from the capsule, at hatch height
  const armY = -2.6;
  for (const dy of [0, 2.6]) for (const dz of [-1.1, 1.1]) beam([TW.x + TW.s / 2, armY + dy, TW.z + 1.5 + dz], [-2.8, armY + dy, -9.5 + dz], 0.22);
  for (let k = 0; k <= 8; k++) { const u = k / 8, px = lerp(TW.x + TW.s / 2, -2.8, u), pz = lerp(TW.z + 1.5, -9.5, u); beam([px, armY, pz - 1.1], [px, armY + 2.6, pz + 1.1], 0.12); beam([px, armY, pz - 1.1], [px, armY, pz + 1.1], 0.14); }
  beam([TW.x, TW.top, TW.z], [TW.x, TW.top + 22, TW.z], 0.35);   // the lightning mast
  const bm = new THREE.MeshStandardMaterial({ color: lin('#59626c'), roughness: 0.55, metalness: 0.5 });
  const BI = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bm, beams.length), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = V3(0, 1, 0);
  beams.forEach(([a, b, t], i) => { const A = V3(...a), B = V3(...b), d = B.clone().sub(A), len = d.length(); Q.setFromUnitVectors(UP, d.normalize());
    M4.compose(A.clone().add(B).multiplyScalar(0.5), Q, V3(t, len, t)); BI.setMatrixAt(i, M4); });
  pad.add(BI);
  // the arm's walkway roof (safety orange) and the tower's red warning lights
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1, 0.18, 2.6), new THREE.MeshStandardMaterial({ color: lin('#c8662e'), roughness: 0.6 }));
  { const A = V3(TW.x + TW.s / 2, armY + 2.75, TW.z + 1.5), B = V3(-2.8, armY + 2.75, -9.5), d = B.clone().sub(A); roof.position.copy(A.clone().add(B).multiplyScalar(0.5)); roof.scale.x = d.length(); roof.rotation.y = -Math.atan2(d.z, d.x); }
  pad.add(roof);
  const lamps = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: lin('#ff4030') }));
  const LI = new THREE.InstancedMesh(lamps.geometry, lamps.material, 5); [[TW.x, TW.top + 22.4, TW.z], ...L.map(([lx, lz]) => [lx, TW.top + 0.5, lz])].forEach((p, i) => { M4.makeTranslation(...p); LI.setMatrixAt(i, M4); }); pad.add(LI);
  // catenary wires from the mast: thin dark lines
  const wire = [];
  for (const [ex, ez] of [[-60, 40], [50, 30], [10, -70]]) for (let k = 0; k < 24; k++) { const u0 = k / 24, u1 = (k + 1) / 24, p = (u) => [lerp(TW.x, ex, u), lerp(TW.top + 22, PAD_Y + 4, u) - 14 * Math.sin(Math.PI * u), lerp(TW.z, ez, u)]; wire.push(...p(u0), ...p(u1)); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
  pad.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: lin('#2c3036'), transparent: true, opacity: 0.4 })));
  // the near ground: 4 x 4 km ahead painted at 2 m/px (scrub, sand tracks, roads, the inlet, the viewing site)
  const nTex = g3Tex((x, w, h) => {
    const RN = RNG('near'); x.fillStyle = '#6b7650'; x.fillRect(0, 0, w, h);
    g3Noise(x, w, h, 40, 0.35, 'nn1', '120,128,84'); g3Noise(x, w, h, 9, 0.3, 'nn2', '70,82,52'); g3Noise(x, w, h, 3, 0.25, 'nn3', '40,48,30');
    for (let k = 0; k < 9000; k++) { x.fillStyle = RN.pick(['rgba(150,140,104,0.35)', 'rgba(50,62,38,0.55)', 'rgba(70,84,50,0.5)', 'rgba(40,52,32,0.5)']); x.beginPath(); x.ellipse(RN.r(0, w), RN.r(0, h), RN.r(2, 12), RN.r(2, 8), RN.r(0, 3), 0, TAU); x.fill(); }
    const band = (y0, a1, col, lw) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60; x.lineTo(u * w, y0 + a1 * Math.sin(u * 7.1) + a1 * 0.4 * Math.sin(u * 17)); } x.stroke(); };
    band(h * 0.38, 30, '#cdbf98', 120); band(h * 0.38, 30, '#3f7488', 90); band(h * 0.38, 30, 'rgba(120,170,180,0.5)', 30);
    x.strokeStyle = '#a8a496'; x.lineWidth = 9; x.beginPath(); x.moveTo(w * 0.5, h); x.lineTo(w * 0.5, h * 0.62); x.stroke();
    x.strokeStyle = '#4a4a48'; x.lineWidth = 9; x.beginPath(); x.moveTo(0, h * 0.70); x.bezierCurveTo(w * 0.3, h * 0.66, w * 0.6, h * 0.74, w, h * 0.69); x.stroke();
    x.strokeStyle = 'rgba(240,220,120,0.8)'; x.lineWidth = 1; x.setLineDash([6, 6]); x.stroke(); x.setLineDash([]);
    x.strokeStyle = '#555452'; x.lineWidth = 6; x.beginPath(); x.moveTo(w * 0.66, h * 0.70); x.lineTo(w * 0.66, h * 0.79); x.stroke();
    x.fillStyle = '#8f8a78'; x.fillRect(w * 0.52, h * 0.775, w * 0.2, h * 0.06); x.fillStyle = 'rgba(80,76,66,0.4)'; for (let i = 0; i < 12; i++) x.fillRect(w * 0.53, h * (0.78 + i * 0.0045), w * 0.18, 1.5);
  }, 2048, 2048);
  const nearG = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ map: nTex, roughness: 0.95 }));
  nearG.rotation.x = -Math.PI / 2; nearG.position.set(0, PAD_Y + 0.25, -2000); pad.add(nearG);
  // the crowd: cars in rows on the lot, people along the shore and on bleachers, tents, flags (~0.9 km ahead, left)
  const SX = (u) => lerp(-2000, 2000, u), SZ = (v) => -4000 + v * 4000;   // canvas fractions (x, y from the top) -> metres
  const people = [], cars = [], R2 = RNG('crowd2');
  for (let i = 0; i < 520; i++) { const r = i % 12, c = Math.floor(i / 12); cars.push([SX(0.53 + c * 0.0041) + R2.r(-0.4, 0.4), SZ(0.782 + r * 0.0045)]); }
  for (let i = 0; i < 5200; i++) { const u = R2.r(0.51, 0.73), v = R2.r(0.765, 0.775); people.push([SX(u), SZ(v) + R2.n(0.5) * 6]); }
  const carM = new THREE.InstancedMesh(g3RBox(4.4, 1.5, 1.8, 0.4, 2), new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.4 }), cars.length);
  const CC = ['#f4f4f4', '#18191c', '#c0281e', '#2456b8', '#e8c030', '#f4f4f4', '#ffffff', '#2a2c30'].map(lin), Mx = new THREE.Matrix4(), Qx = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  cars.forEach(([x, z], i) => { Mx.compose(V3(x, PAD_Y + 1.25, z), Qx, V3(1, 1, 1)); carM.setMatrixAt(i, Mx); carM.setColorAt(i, R2.pick(CC)); }); carM.frustumCulled = false; pad.add(carM);
  const pplM = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.55, 1.8, 2, 6), new THREE.MeshStandardMaterial({ roughness: 0.8 }), people.length);
  const PC = ['#e8e2d4', '#2c4f8a', '#c23a2e', '#f0c23a', '#3a3a3a', '#e07a3a', '#6aa0c8', '#ffffff', '#2f6b3a', '#d86aa0'].map(lin);
  people.forEach(([x, z], i) => { Mx.makeTranslation(x, PAD_Y + 1.75, z); pplM.setMatrixAt(i, Mx); pplM.setColorAt(i, R2.pick(PC)); }); pplM.frustumCulled = false; pad.add(pplM);
  const bleach = new THREE.MeshStandardMaterial({ color: lin('#9a9890'), roughness: 0.7 });
  const bpM = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.55, 1.6, 2, 6), new THREE.MeshStandardMaterial({ roughness: 0.8 }), 360); let bi = 0;
  for (let k = 0; k < 6; k++) { const b2 = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2 + k * 1.2, 3), bleach); b2.position.set(SX(0.59), PAD_Y + 0.6 + k * 0.6, SZ(0.768) - k * 3); pad.add(b2);
    for (let j = 0; j < 60; j++) { Mx.makeTranslation(SX(0.59) + R2.r(-34, 34), PAD_Y + 1.6 + k * 1.2, SZ(0.768) - k * 3); bpM.setMatrixAt(bi, Mx); bpM.setColorAt(bi++, R2.pick(PC)); } }
  bpM.frustumCulled = false; pad.add(bpM);
  for (let k = 0; k < 5; k++) { const tent = new THREE.Mesh(new THREE.ConeGeometry(6, 5, 4), new THREE.MeshStandardMaterial({ color: lin(k % 2 ? '#f2f0ea' : '#d8462e'), roughness: 0.6 })); tent.position.set(SX(0.65 + k * 0.016), PAD_Y + 2.5, SZ(0.772)); pad.add(tent); }
  for (let k = 0; k < 8; k++) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 12, 6), bleach); pole.position.set(SX(0.52 + k * 0.03), PAD_Y + 6, SZ(0.763)); pad.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.4), new THREE.MeshStandardMaterial({ color: lin(['#2a4a8a', '#c23a2e', '#f2f0ea'][k % 3]), side: THREE.DoubleSide })); flag.position.set(SX(0.52 + k * 0.03) + 2, PAD_Y + 10.5, SZ(0.763)); pad.add(flag); }
  const crowd = carM;
  // scrub: thousands of low dark clumps and a few pines, so the ground has relief (and the eye has scale)
  const RB = RNG('scrub'), NB = 9000, bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: false }), NB);
  const BC = ['#3e4e2a', '#4d5c32', '#56603a', '#36442a', '#6a6a44'].map(lin);
  for (let i = 0; i < NB; i++) { const x = RB.r(-2000, 2000), z = RB.r(-4000, -300); if ((z < -2250 && z > -2450) || (x > 60 && x < 900 && z > -940 && z < -840)) continue; const s2 = RB.r(2, 6);
    Mx.compose(V3(x, PAD_Y + 0.45 + s2 * 0.5, z), new THREE.Quaternion(), V3(s2 * RB.r(1, 2), s2 * 0.55, s2 * RB.r(1, 2))); bush.setMatrixAt(i, Mx); bush.setColorAt(i, RB.pick(BC)); }
  bush.frustumCulled = false; pad.add(bush);
  const NP2 = 900, pine = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2.4, 7), new THREE.MeshStandardMaterial({ color: lin('#2e3d24'), roughness: 0.9 }), NP2);
  for (let i = 0; i < NP2; i++) { let x = RB.r(-2000, 2000), z = RB.r(-3800, -400), s2 = RB.r(4, 8); if (x > 40 && x < 920 && z > -960 && z < -820) z -= 300; Mx.compose(V3(x, PAD_Y + 0.6 + s2 * 1.44, z), new THREE.Quaternion(), V3(s2, s2 * 1.2, s2)); pine.setMatrixAt(i, Mx); }
  pine.frustumCulled = false; pad.add(pine);
  // steam: the deluge flashing to steam in the flame trench (billows at the base), vapour venting past the window
  const steamTex = [ouSoftTex('st1'), ouSoftTex('st2'), ouSoftTex('st3')];
  const steam = [];
  const RS = RNG('steam');
  for (let i = 0; i < 190; i++) {
    const near = i < 30, col = i >= 110, m = new THREE.SpriteMaterial({ map: steamTex[i % 3], transparent: true, depthWrite: false, fog: !near, rotation: RS.r(0, TAU) });
    const s = new THREE.Sprite(m);
    const o = near ? { x: RS.r(-9, 9), y: RS.r(-30, 4), z: RS.r(-5, -14), sc: RS.r(5, 12), sp: RS.r(1.5, 4), ph: RS.f(), near: 1 }
      : col ? { x: RS.r(-190, 70), y: PAD_Y + 60 + Math.pow(RS.f(), 0.7) * 105, z: -RS.r(80, 280), sc: RS.r(30, 72), sp: RS.r(0.4, 1.2), ph: RS.f(), near: 0, col: 1 }
      : { x: RS.r(-140, 140), y: PAD_Y + RS.r(0, 50), z: RS.r(-160, 30), sc: RS.r(30, 80), sp: RS.r(0.5, 2), ph: RS.f(), near: 0 };
    s.userData = o; steam.push(s); pad.add(s);
  }
  const fireT = g3Radial([[0, 'rgba(255,210,120,1)'], [0.35, 'rgba(255,140,40,0.55)'], [1, 'rgba(255,90,20,0)']], 128), fire = [];
  for (let i = 0; i < 16; i++) { const f2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    f2.userData = { x: RS.r(-120, 120), y: PAD_Y + RS.r(45, 80), z: -RS.r(70, 200), sc: RS.r(50, 110), ph: RS.f() }; fire.push(f2); pad.add(f2); }
  // ---------------- SPACE ----------------
  const space = new THREE.Scene();
  // the star sky: one shader for every stage. Stars keep their rest directions; uBeta (effective) bends them forward
  // (relativistic aberration) and the ring colour shifts them blue inside / red outside the ring.
  const NS = 42000, sd = new Float32Array(NS * 3), sm = new Float32Array(NS * 2), RS2 = RNG('stars');
  for (let i = 0; i < NS; i++) {
    // a uniform sphere, with a denser band (the Milky Way plane, tilted)
    let v; if (i < NS * 0.3) { const a = RS2.r(0, TAU), b = RS2.n(0.5) * 0.18; v = V3(Math.cos(a), b, Math.sin(a)).normalize().applyAxisAngle(V3(1, 0, 0.3).normalize(), 1.0); }
    else { const u = RS2.r(-1, 1), a = RS2.r(0, TAU), r = Math.sqrt(1 - u * u); v = V3(r * Math.cos(a), u, r * Math.sin(a)); }
    sd.set([v.x, v.y, v.z], i * 3); sm.set([Math.pow(RS2.f(), 7.0), RS2.f()], i * 2);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sd, 3)); sg.setAttribute('m', new THREE.BufferAttribute(sm, 2));
  const starU = { uBeta: { value: 0 }, uRing: { value: 0.2 }, uBow: { value: 0 }, uGain: { value: 1 }, uPx: { value: 1 }, uBH: { value: V3(-0.30, 0.06, -1).normalize() }, uBHr: { value: 0 } };
  const stars = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: starU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uBeta, uRing, uBow, uGain, uPx, uBHr; uniform vec3 uBH; attribute vec2 m; varying vec3 vC; varying float vA;
      void main(){
        vec3 d = normalize(position), f = vec3(0.0, 0.0, -1.0);
        float c = dot(d, f), cp = (c + uBeta) / (1.0 + uBeta * c);
        vec3 pr = d - f * c; float pl = length(pr); pr = pl > 1e-5 ? pr / pl : vec3(1.0, 0.0, 0.0);
        vec3 o = f * cp + pr * sqrt(max(0.0, 1.0 - cp * cp));
        float th = acos(clamp(cp, -1.0, 1.0));
        // colour: a white star field normally; on the bow, blue inside the ring, white on it, orange-red outside
        float x = (th - uRing) / max(uRing, 0.01);
        vec3 warm = mix(vec3(1.0, 0.86, 0.62), vec3(1.0, 0.32, 0.16), clamp(x * 1.2, 0.0, 1.0));
        vec3 cool = mix(vec3(0.62, 0.78, 1.0), vec3(0.40, 0.36, 1.0), clamp(-x * 1.6, 0.0, 1.0));
        vec3 bowC = x < 0.0 ? mix(vec3(0.9, 0.95, 1.0), cool, clamp(-x * 2.5, 0.0, 1.0)) : mix(vec3(1.0, 0.97, 0.92), warm, clamp(x * 2.0, 0.0, 1.0));
        float bowA = x < 0.0 ? exp(-x * x * 22.0) * 0.95 + 0.04 : exp(-x * x * 7.0);
        vec3 base = mix(vec3(1.0, 0.9, 0.8), vec3(0.75, 0.85, 1.0), m.y);
        vC = mix(base, bowC, uBow);
        float b = (0.25 + 2.6 * m.x) * mix(1.0, bowA * 1.7, uBow) * uGain;
        vA = clamp(b, 0.0, 1.6);
        // gravitational lensing by the teaser's black hole: stars near it are pushed out onto an Einstein ring
        if (uBHr > 0.0) { float cb = dot(o, uBH), ab = acos(clamp(cb, -1.0, 1.0));
          if (ab < uBHr * 8.0) { vec3 pb = o - uBH * cb; float pl2 = length(pb); pb = pl2 > 1e-6 ? pb / pl2 : vec3(0.0, 1.0, 0.0);
            float a2 = ab + uBHr * uBHr * 1.6 / max(ab, uBHr * 0.2); o = normalize(uBH * cos(a2) + pb * sin(a2)); vA *= 1.0 + 2.5 * exp(-pow((a2 - uBHr * 1.3) / (uBHr * 0.3), 2.0)); } }
        vec4 mv = modelViewMatrix * vec4(o * 1e6, 1.0);
        gl_PointSize = clamp((1.3 + 3.2 * m.x) * mix(1.0, 0.8 + bowA * 0.9, uBow) * uPx, 1.0, 7.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA;
      void main(){ vec2 c = gl_PointCoord - 0.5; float r = length(c) * 2.0; if (r > 1.0) discard;
        float a = vA * (exp(-r * r * 4.0) + 0.25 * (1.0 - r)); gl_FragColor = vec4(vC * a, a); }` }));
  stars.frustumCulled = false; space.add(stars);
  // the bow's glow: a soft luminous ring painted on a sky sphere (same colour logic, smooth)
  const bowU = { uRing: starU.uRing, uAmt: { value: 0 } };
  const bowSky = new THREE.Mesh(new THREE.SphereGeometry(5e5, 96, 64), new THREE.ShaderMaterial({ uniforms: bowU, side: THREE.BackSide, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uRing, uAmt; varying vec3 vD;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        float th = acos(clamp(-normalize(vD).z, -1.0, 1.0)), x = (th - uRing) / max(uRing, 0.01);
        float ang = atan(vD.y, vD.x), grain = 0.75 + 0.5 * vn(vec2(ang * 18.0, th * 40.0));
        // a spectrum across the band: violet-blue on the inside edge, white on the crest, gold then red on the outside
        vec3 c = x < 0.0 ? mix(vec3(0.75, 0.88, 1.0), vec3(0.30, 0.32, 1.0), clamp(-x * 4.0, 0.0, 1.0)) : mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.25, 0.08), clamp(x * 3.5, 0.0, 1.0));
        float a = (exp(-x * x * (x < 0.0 ? 60.0 : 22.0)) + 0.06 * exp(-x * x * 3.0) * step(0.0, x)) * grain;
        float core = exp(-th * th / (uRing * uRing * 0.03)) * 0.35 + 0.05 * exp(-th * th / (uRing * uRing * 0.4));   // a faint violet glow dead ahead
        gl_FragColor = vec4((c * a * 0.5 + vec3(0.45, 0.4, 1.0) * core) * uAmt, 1.0);
      }` }));
  bowSky.frustumCulled = false; space.add(bowSky);
  // the Moon: a painted sphere (maria, craters with bright rims, rays) with a matching bump map, lit hard by the Sun
  const moonDraw = (bump) => (x, w, h) => {
    // colour: albedo only (bright highlands, dark smooth maria, faint ray systems); bump: bowls and soft raised rims
    x.fillStyle = bump ? '#808080' : '#b3aea4'; x.fillRect(0, 0, w, h);
    g3Noise(x, w, h, 5, bump ? 0.22 : 0.10, 'mn1', bump ? '255,255,255' : '70,66,60');
    g3Noise(x, w, h, 40, bump ? 0.10 : 0.16, 'mn2', bump ? '0,0,0' : '80,76,70');
    if (!bump) {
      const RM = RNG('maria');
      for (let k = 0; k < 16; k++) { const cx = RM.r(0, w), cy = RM.r(h * 0.25, h * 0.72);   // a mare: a cluster of overlapping dark blobs
        for (let j = 0; j < 14; j++) { const px = cx + RM.n(0.5) * 160, py = cy + RM.n(0.5) * 90, r = RM.r(40, 120), g = x.createRadialGradient(px, py, 0, px, py, r);
          g.addColorStop(0, 'rgba(48,48,54,0.62)'); g.addColorStop(0.6, 'rgba(52,52,58,0.48)'); g.addColorStop(1, 'rgba(62,62,66,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); } }
      for (let k = 0; k < 5; k++) { const cx = RM.r(0, w), cy = RM.r(h * 0.25, h * 0.75); x.strokeStyle = 'rgba(245,242,232,0.16)'; x.lineWidth = 4;
        for (let j = 0; j < 40; j++) { const a = RM.r(0, TAU), l = RM.r(80, 380); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l * 0.6); x.stroke(); }
        x.fillStyle = 'rgba(250,248,240,0.55)'; x.beginPath(); x.arc(cx, cy, 16, 0, TAU); x.fill(); const hg = x.createRadialGradient(cx, cy, 0, cx, cy, 90); hg.addColorStop(0, 'rgba(245,240,230,0.35)'); hg.addColorStop(1, 'rgba(245,240,230,0)'); x.fillStyle = hg; x.fillRect(cx - 90, cy - 90, 180, 180); }
    }
    const RK = RNG('craters');
    for (let k = 0; k < 4200; k++) {
      const r = Math.pow(RK.f(), 5) * 70 + 1.2, px = RK.r(0, w), py = RK.r(h * 0.04, h * 0.96), sx = 1 / Math.max(0.35, Math.cos((py / h - 0.5) * Math.PI));
      x.save(); x.translate(px, py); x.scale(Math.min(sx, 2.8), 1);
      let g;
      if (bump) { g = x.createRadialGradient(0, 0, 0, 0, 0, r * 1.45); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(0.55, 'rgba(0,0,0,0.3)'); g.addColorStop(0.72, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); }
      else { g = x.createRadialGradient(0, 0, 0, 0, 0, r * 1.1); g.addColorStop(0, RK.f() < 0.15 ? 'rgba(235,230,220,0.22)' : 'rgba(90,86,80,0.12)'); g.addColorStop(1, 'rgba(90,86,80,0)'); }
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, r * 1.45, 0, TAU); x.fill();
      x.restore();
    }
  };
  const mTex = g3Tex(moonDraw(false), 2048, 1024), mBump = g3Tex(moonDraw(true), 2048, 1024, false);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1737e3, 192, 128), new THREE.MeshStandardMaterial({ map: mTex, bumpMap: mBump, bumpScale: 9000, roughness: 0.97 }));
  space.add(moon);
  const spSun = new THREE.DirectionalLight(lin('#fffaf2'), 3.2); spSun.position.copy(OU_SUN_SPACE).multiplyScalar(1e7); space.add(spSun, spSun.target, new THREE.HemisphereLight(lin('#3a4a66'), lin('#101010'), 0.35));
  OU = { pad, sky, skyU, ground, steam, fire, crowd, BI, space, stars, starU, bowU, bowSky, moon, PAD_Y };
}

// how far the stage has climbed (m) and the speed in m/s
const ouAlt = (st) => distOf(shipTau(st));
// starbow ring radius (rad) and the effective beta that crowds the stars into it
function ouBow(st) {
  const k = ss(326.2, 345, st), r = st < 460 ? lerp(0.22, 0.13, ss(345, 455, st)) : lerp(0.13, 0.01, ss(458, 470, st));
  return { amt: k, ring: r, beta: Math.cos(r) * k + (st > 265 ? 0.35 * ss(265, 326.2, st) * (1 - k) : 0) };
}

function ouOutside(g, st) {
  if (!OU) ouBuild();
  const cam = g.far;
  if (st < 84) {
    // ---------------- the pad ----------------
    cam.near = 3; cam.far = 1e5; cam.updateProjectionMatrix();
    const alt = ouAlt(st), aK = ss(8000, 70000, alt);
    OU.skyU.uAlt.value = aK; OU.skyU.uT.value = st;
    OU.ground.position.y = OU.PAD_Y - 2.5 - alt; OU.pad.fog.density = 0.00011 * (1 - aK * 0.8);
    OU.pad.children.forEach((c) => { if (c !== OU.sky && c !== OU.ground && !c.isLight) c.position.y = (c.userData.y0 ??= c.position.y) - alt; });
    const ign = ss(LIFTOFF - 4, LIFTOFF, st), rise = clamp(st - LIFTOFF + 4, 0, 99);
    for (const s of OU.steam) {
      const o = s.userData, m = s.material;
      if (o.near) {   // vapour from the LOX vents falls past the window, then the exhaust plume swallows the base
        const ph = (st * o.sp * 0.08 + o.ph) % 1;
        s.position.set(o.x + Math.sin(st * 0.3 + o.ph * 6) * 1.2, o.y - ph * 18 - alt, o.z);
        s.scale.setScalar(o.sc * (0.7 + ph)); m.opacity = 0.42 * Math.sin(Math.PI * ph) * (1 - ss(LIFTOFF + 2, LIFTOFF + 8, st));
        m.color.setRGB(1, 1, 1);
      } else {          // the trench steam billows out and up once the deluge and the ignition start
        const grow = 0.55 + 0.45 * ign + 0.35 * ss(LIFTOFF, LIFTOFF + 8, st), hy = o.col ? (o.y - OU.PAD_Y) * (0.25 + 0.75 * ss(LIFTOFF - 9, LIFTOFF + 2, st)) : 0;
        s.position.set(o.x * grow + Math.sin(st * 0.1 + o.ph * 9) * 4, (o.col ? OU.PAD_Y + hy : o.y) + rise * o.sp * 1.6 - alt, o.z * (o.col ? 1 : grow));
        s.scale.setScalar(o.sc * grow); m.opacity = (o.col ? 0.95 : 0.85) * (0.5 + 0.5 * ign);
        const hh = s.position.y + alt - OU.PAD_Y, warm = ign * clamp(1.15 - hh / 85); m.color.setRGB(1, 1 - warm * 0.42, 1 - warm * 0.78);
      }
      m.rotation = o.ph * 6 + st * 0.02 * (o.near ? 3 : 1);
    }
    obPad(st, alt, cam); OU.skyU.uWhite.value = OB.white;
    for (const f2 of OU.fire) { const o = f2.userData; f2.position.set(o.x, o.y - alt + Math.sin(st * 2 + o.ph * 9) * 2, o.z); f2.scale.setScalar(o.sc * (0.8 + 0.2 * Math.sin(st * 7 + o.ph * 20)));
      f2.material.opacity = 0.55 * ign * (1 - ss(LIFTOFF + 6, LIFTOFF + 14, st)); }
    g.r.render(OU.pad, cam);
    if (aK > 0.4) { OU.starU.uGain.value = 0.55 * ss(0.4, 1.0, aK); OU.starU.uBeta.value = 0; OU.starU.uBow.value = 0; OU.bowU.uAmt.value = 0; OU.moon.visible = false; for (const k in OB.fly) OB.fly[k].visible = false; g.r.render(OU.space, cam); }
    return { dir: OU_SUN_PAD, col: lin('#fff3e2'), int: 3.2, fill: 1.05, fillCol: lin('#bcd3ea'), ground: lin('#5a5446'), sunDir: OU_SUN_PAD, flare: 0.55, glass: '200,225,255', glassA: 0.10 };
  }
  // ---------------- space ----------------
  const B = ouBow(st), pad2 = 1;
  OU.starU.uBeta.value = B.beta; OU.starU.uRing.value = B.ring; OU.starU.uBow.value = B.amt; OU.bowU.uAmt.value = B.amt * (st > 458 ? 1 - 0.93 * ss(458, 472, st) : 1);
  OU.starU.uGain.value = st < 330 ? 0.55 : 1.0 - 0.95 * ss(458, 472, st);
  // the Moon sweeps past on the right (closest ~134 s): it slides in from ahead and leaves to the side
  OU.starU.uBHr.value = TEASER() ? 0.065 : 0;
  cam.near = 1; cam.far = 1e10; cam.updateProjectionMatrix();
  obSpace(st, cam);
  g.r.render(OU.space, cam);
  if (st < 330) return { dir: OU_SUN_SPACE, col: lin('#fffaf0'), int: 4.2, fill: 0.18, fillCol: lin('#7d8aa0'), ground: lin('#15161a'), sunDir: OU_SUN_SPACE, flare: 0.35, glass: '220,230,255', glassA: 0.05 };
  if (st < 460) return { dir: V3(0.05, 0.25, -1).normalize(), col: lin('#8fb2ff'), int: 0.9 * B.amt + 0.1, fill: 0.16, fillCol: lin('#5a6a9a'), ground: lin('#120f1a'), sunDir: null, glass: '150,180,255', glassA: 0.06 };
  return { dir: V3(0.05, 0.25, -1).normalize(), col: lin('#6c82c8'), int: 0.08, fill: 0.06, fillCol: lin('#3a4058'), ground: lin('#0a0a0e'), sunDir: null, glass: '120,140,200', glassA: 0.035 };
}
