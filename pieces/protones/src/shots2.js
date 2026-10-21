
// =====================================================================
//  SHOTS 2 — the park shots, the rise and the fall, following the reference's framings and camera moves:
//  a low shot by the water, a tracking shot of the dog walker, looking down at your hands; the frozen park in a slow pan;
//  one hand raised; up past the trees to the city grid and the Earth; back down through the city to your hands.
// =====================================================================
function earthStage() { return once('earth', () => { const st2 = makeStage({ hemi: 0.7, sky: 0xbcd4ff, ground: 0x202030, key: 3.4, keyCol: '#ffffff', box: 10 }); st2.setSun(dirV(25 * DEG, 30 * DEG)); st2.scene.background = lin('#020206');
    const hsh = (i, j, q) => { const v = Math.sin(i * 127.1 + j * 311.7 + q * 74.7) * 43758.5453; return v - Math.floor(v); }, vn = (x, y, q, P) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hsh(i % P, j, q), hsh((i + 1) % P, j, q), u), lerp(hsh(i % P, j + 1, q), hsh((i + 1) % P, j + 1, q), u), v); }, fbm = (x, y, q, P) => { let a = 0, m = 0.5, f = 1; for (let o = 0; o < 6; o++) { a += m * vn(x * f, y * f, q, P * f); m *= 0.5; f *= 2; } return a; };
    const tex = g3Tex((x, w, h) => { const im = x.createImageData(w, h); for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) { const X = px / w * 6, Y = py / h * 3, lat = Math.abs(py / h - 0.5) * 2, e = fbm(X, Y, 1, 6), cl = fbm(X * 2, Y * 2, 7, 12); let r, g, b;
        if (e > 0.52) { const k = (e - 0.52) * 4; r = 70 + 90 * k; g = 100 + 40 * k; b = 50 + 30 * k; if (lat < 0.35 && e > 0.6) { r = 170; g = 145; b = 95; } } else { const k = e / 0.52; r = 10 + 20 * k; g = 40 + 50 * k; b = 90 + 60 * k; }
        if (lat > 0.86) r = g = b = 240; const c = clamp((cl - 0.5) * 3); const o = (py * w + px) * 4; im.data[o] = lerp(r, 250, c); im.data[o + 1] = lerp(g, 252, c); im.data[o + 2] = lerp(b, 255, c); im.data[o + 3] = 255; } x.putImageData(im, 0, 0); }, 1024, 512);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), STDm({ map: tex, roughness: 0.7 })); st2.scene.add(earth); const atm = new THREE.Mesh(new THREE.SphereGeometry(1.03, 64, 48), new THREE.MeshBasicMaterial({ color: '#6ab0ff', transparent: true, opacity: 0.18, side: THREE.BackSide })); st2.scene.add(atm);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 48), new THREE.MeshBasicMaterial({ color: '#c8ecff', transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })); st2.scene.add(shell);
    const crack = { value: 0 }; earth.material.onBeforeCompile = (sh) => { sh.uniforms.uCrack = crack; sh.vertexShader = 'varying vec3 vCp;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vCp = position;');
      sh.fragmentShader = 'uniform float uCrack; varying vec3 vCp;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        if (uCrack > 0.001) { vec3 q = vCp * 11.0; vec3 c = floor(q); float d1 = 9.0, d2 = 9.0; for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) for (int k = -1; k <= 1; k++) { vec3 h = c + vec3(float(i), float(j), float(k)); vec3 o = fract(sin(vec3(dot(h, vec3(127.1, 311.7, 74.7)), dot(h, vec3(269.5, 183.3, 246.1)), dot(h, vec3(113.5, 271.9, 124.6)))) * 43758.5453); float d = length(q - h - o); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
          float edge = 1.0 - smoothstep(0.0, 0.015 + 0.03 * uCrack, d2 - d1); totalEmissiveRadiance += vec3(1.0, 0.9, 0.95) * edge * uCrack * 1.6; }`); };
    const R = RNG('stars'), sp = []; for (let i = 0; i < 2000; i++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize().multiplyScalar(50); sp.push(v.x, v.y, v.z); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); st2.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.12, color: 0xffffff })));
    return { st: st2, earth, atm, shell, crack }; }); }
const POV0 = [0.4, 1.62, -11];
// a look from where you stand (yaw: 0 = toward the lake, + = left), pitch in radians
const lookFrom = (st, yaw, pitch, p = POV0) => camLook(st.cam, p[0], p[1], p[2], p[0] - Math.sin(yaw) * 10 * Math.cos(pitch), p[1] + 10 * Math.sin(pitch), p[2] - Math.cos(yaw) * 10 * Math.cos(pitch));
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };

// ===================== 1. LAKE (0-10) =====================
SHOT_FN.lake = (lt, dur, t) => {
  const S = drawPark(t), { st } = S;
  if (t < 5.6) { // low by the water's edge, geese in front, a slow push along the shore
    const k = t / 5.6; camLook(st.cam, lerp(2.4, 1.4, k), 0.95, lerp(-16.6, -17.2, k), -10, 1.4, -45); fov(st, 60); handheld(st.cam, t, 0.5, 1); placeHands(S, st.cam, { view: 0 }); }
  else if (t < 8.0) { // the dog walker: a low tracking shot beside the dog, the skyline behind
    const dx = S.dogX; camLook(st.cam, dx + 3.2, 0.7, -12.4, dx - 0.2, 1.0, -16.8); fov(st, 55); handheld(st.cam, t, 0.8, 2); placeHands(S, st.cam, { view: 0 }); }
  else { // you look down at your hands, palms up over the grass
    const k = EZ.io(seg(t, 8.0, 9.0)); lookFrom(st, 0.05, lerp(-0.25, -0.95, k)); fov(st, 58); handheld(st.cam, t, 0.6, 3);
    placeHands(S, st.cam, { view: ss(8.0, 8.8, t), palm: true, tilt: 0.25, dy: -0.1, dz: -0.5, tremble: 0.3 }); }
  renderStage(st, 1.05); bloom(0.22);
};
// ===================== 2. HANDS (10-20): hands raised before you; then a slow pan over the frozen park; one hand rises =====================
SHOT_FN.hands = (lt, dur, t) => {
  const S = drawPark(t), { st } = S;
  if (lt < 5.2) { const k = EZ.io(seg(lt, 0, 1.2)); lookFrom(st, 0.06 * Math.sin(lt * 0.4), lerp(-0.95, 0.12, k)); fov(st, 60); handheld(st.cam, t, 0.8, 4);
    placeHands(S, st.cam, { palm: true, glass: ss(0.2, 1.4, lt), tremble: 1.2, tilt: lerp(0.25, 0.1, k), dy: lerp(-0.1, -0.08, k), dz: -0.42, twist: 0.25 * Math.sin(lt * 0.7), curl: [0.08 + 0.12 * Math.sin(lt * 1.3), 0.1, 0.12 + 0.1 * Math.sin(lt * 1.1 + 1), 0.18], spread: 0.85 }); }
  else if (lt < 9.0) { // the pan: left (people on the lawn) across the promenade to the frozen jogger
    const k = EZ.io(seg(lt, 5.2, 9.0)); lookFrom(st, lerp(0.75, -0.7, k), -0.08, [0.4 + lerp(-0.5, 0.8, k), 1.62, -10.6]); fov(st, 56); handheld(st.cam, t, 0.6, 5); placeHands(S, st.cam, { view: 0 }); }
  else { const k = EZ.io(seg(lt, 9.0, 10)); lookFrom(st, -0.7 + 0.5 * k, -0.05); fov(st, 56); handheld(st.cam, t, 0.6, 5);
    placeHands(S, st.cam, { only: 1, view: k, palm: true, glass: 1, tilt: 0.05, dx: 0.02, dy: -0.06, dz: lerp(-0.45, -0.3, ss(9.6, 10, lt)), tremble: 1, spread: 0.8 }); }
  renderStage(st, 1.05);
};
// ===================== 4. CRACK (30-38): one raised hand cracks; then the frozen park: the dog walker, the bench =====================
SHOT_FN.crack = (lt, dur, t) => {
  const S = drawPark(t), { st } = S;
  if (lt < 4.2) { lookFrom(st, 0.15 - 0.1 * lt / 4.2, 0.02); fov(st, 54); handheld(st.cam, t, 0.7, 6);
    placeHands(S, st.cam, { only: 1, palm: true, glass: 1, tilt: 0.05, dx: 0.035, dy: -0.07, dz: -0.4, twist: -0.3 + 0.25 * lt / 4.2, tremble: 1.6, curl: [0.2, 0.15, 0.2, 0.25], spread: 0.8 }); crackHands(S, ss(0.3, 4, lt) * 0.7); }
  else { const k = EZ.io(seg(lt, 4.2, dur)); lookFrom(st, lerp(-0.25, 0.65, k), lerp(-0.12, -0.18, k), [lerp(0.8, -0.4, k), 1.62, -11.2]); fov(st, 56); handheld(st.cam, t, 0.6, 7); placeHands(S, st.cam, { view: 0 }); crackHands(S, 0.7); }
  renderStage(st, 1.05);
};
// ===================== 5. RISE (38-48): up past the trees, the towers, the city grid from above; then the Earth cracking, and pulling back =====================
function riseCam(st, u) { const h = Math.exp(lerp(Math.log(1.8), Math.log(2600), u)); camLook(st.cam, 0.4, h, -11 + h * 0.35, 0.4, lerp(h * 0.6, 0, ss(0.0, 0.5, u)), -11 - lerp(60, h * 0.45, ss(0.05, 0.6, u)) - h * 0.2 - 400 * (1 - ss(0, 0.35, u))); fov(st, 58); st.scene.fog.far = 3200 + h * 3; st.scene.fog.near = 250 + h; }
function drawEarth(lt, d, crackK, pulse) { const E = earthStage(); E.earth.rotation.y = 2.2 + lt * 0.04; E.crack.value = crackK; E.shell.scale.setScalar(1.02 + 0.08 * pulse); E.shell.material.opacity = 0.55 * pulse * (1 - 0.6 * pulse);
  camLook(E.st.cam, 0, 0.3 * d, d, 0, 0.04 * (d - 1), 0); fov(E.st, 50); renderStage(E.st, 1.0); bloom(0.3 + 0.3 * pulse); }
SHOT_FN.rise = (lt, dur, t) => {
  if (lt < 4.5) { const P = drawPark(t), st = P.st; riseCam(st, EZ.io(seg(lt, 0, 4.5))); placeHands(P, st.cam, { view: 0 }); renderStage(st, 1.05); st.scene.fog.far = 3200; st.scene.fog.near = 250; return; }
  const k = EZ.io(seg(lt, 4.5, 8.0)), d = lerp(1.32, 3.4, k), p = lt > 6.4 ? Math.max(0, Math.sin((lt - 6.4) * 3.2)) ** 3 : 0; drawEarth(lt, d, 0.5 * (1 - ss(5.5, 7.5, lt)) + 0.2, p);
};
// ===================== 6. FALL (48-56.5): the Earth rushes in; down through the city; your cracked hands, the last 100 ms =====================
SHOT_FN.fall = (lt, dur, t) => {
  if (lt < 1.8) { drawEarth(lt + 10, Math.exp(lerp(Math.log(3.4), Math.log(1.05), seg(lt, 0, 1.8) ** 2)), 0.5, 0); return; }
  const S = drawPark(t), { st } = S;
  if (lt < 5.2) { riseCam(st, 1 - EZ.io(seg(lt, 1.8, 5.2))); placeHands(S, st.cam, { view: 0 }); renderStage(st, 1.05); st.scene.fog.far = 3200; st.scene.fog.near = 250; return; }
  lookFrom(st, 0.02, 0.08); fov(st, 58); handheld(st.cam, t, 0.8 + 2.4 * ss(7, 8.4, lt), 8);
  placeHands(S, st.cam, { view: ss(5.2, 5.8, lt), palm: true, glass: 1, tilt: 0.1, dy: -0.09, dz: -0.42, tremble: 2.2, curl: [0.3, 0.28, 0.3, 0.35], spread: 0.9 }); crackHands(S, 0.75 + 0.25 * ss(6, 8.3, lt));
  renderStage(st, 1.05);
};
// ===================== 7. BACK (56.5-66): colour back; your hands; you turn to the jogger running toward you =====================
SHOT_FN.back = (lt, dur, t) => {
  const S = drawPark(t), { st } = S;
  if (lt < 4.6) { lookFrom(st, 0.02, 0.08 - 0.25 * ss(1, 4, lt)); fov(st, 58); handheld(st.cam, t, 0.6, 9);
    const c = 0.5 - 0.5 * Math.cos(Math.max(0, lt - 1.2) * 2.4); placeHands(S, st.cam, { palm: true, tilt: 0.1 + 0.15 * ss(1, 4, lt), dy: -0.09, dz: -0.44, tremble: 0.5, curl: [c * 0.8, c * 0.85, c * 0.85, c * 0.8], thumb: c * 0.6, spread: 0.6 }); crackHands(S, 0); }
  else { const k = EZ.io(seg(lt, 4.6, 6.0)); lookFrom(st, lerp(0, 1.12, k), lerp(-0.12, -0.03, k)); fov(st, 56); handheld(st.cam, t, 0.7, 10); placeHands(S, st.cam, { view: 0 }); }
  renderStage(st, 1.05); bloom(0.22);
};
