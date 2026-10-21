
// =====================================================================
//  SHOTS
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
const T_GONE = 10.0, T_BACK = 56.0, T_BOOM = 61.4;
const sceneT = (t) => (t < T_GONE ? t : t < T_BACK ? T_GONE + (t - T_GONE) / 12 * 0.6 : T_GONE + (T_BACK - T_GONE) / 12 * 0.6);
const EYE = [0.3, 1.68, 1.6];
function roofStage() { return once('roof', () => { const st = makeStage({ skyTop: '#2a3466', skyHor: '#f29a5c', hemi: 0.6, sky: 0xb8b0d0, ground: 0x6a5048, key: 2.2, keyCol: '#ffb070', box: 16, boxFar: 200, fog: '#c88a70', fogNear: 300, fogFar: 2600, sunDist: 120, far: 40000 });
  st.setSun(SUN_SET, new THREE.Vector3(0, 0, -2)); skyEnv(st, '#2a3466', '#f29a5c', SUN_SET, '#ffb070'); const S = buildRoof(st); S.stars = starField(st); S.clouds.forEach((c) => st.scene.remove(c)); S.clouds = [sunsetDome(st)]; if (st.sky) st.sky.material.visible = false; return S; }); }
function sunsetDome(st) { const m = new THREE.Mesh(new THREE.SphereGeometry(30000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { S: { value: SUN_SET } },
  vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
  fragmentShader: `uniform vec3 S; varying vec3 vD;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 6; i++) { a += m * vn(p); p = p * 2.02 + 1.7; m *= 0.5; } return a; }
void main(){ vec3 d = normalize(vD); float h = clamp(d.y, 0.0, 1.0), toward = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(S.x, 0.0, S.z))), 0.0), 2.0);
  vec3 zen = vec3(0.10, 0.12, 0.28), mid = mix(vec3(0.55, 0.38, 0.55), vec3(0.95, 0.55, 0.38), toward), hor = mix(vec3(0.95, 0.55, 0.42), vec3(1.0, 0.72, 0.42), toward);
  vec3 col = mix(hor, mid, smoothstep(0.0, 0.12, h)); col = mix(col, zen, smoothstep(0.1, 0.65, h)); if (d.y < 0.0) col = hor * 0.8;
  float sd = acos(clamp(dot(d, S), -1.0, 1.0)); col += vec3(1.0, 0.8, 0.5) * (smoothstep(0.012, 0.009, sd) * 6.0 + exp(-sd * 10.0) * 0.7);
  if (d.y > 0.0) { vec2 cp = d.xz / (d.y + 0.06); float c = fbm(vec2(cp.x * 0.45, cp.y * 1.6)) ; float c2 = fbm(vec2(cp.x * 1.2 + 4.0, cp.y * 4.0)); float cov = smoothstep(0.5, 0.72, c * 0.75 + c2 * 0.35) * smoothstep(0.0, 0.08, d.y) * (1.0 - smoothstep(0.35, 0.6, d.y));
    float lit = smoothstep(0.55, 0.85, c2) ; vec3 body = mix(vec3(0.42, 0.3, 0.45), vec3(0.62, 0.4, 0.45), toward), rim = mix(vec3(1.0, 0.62, 0.45), vec3(1.0, 0.82, 0.55), toward);
    vec3 cc = mix(body, rim, 0.35 + 0.65 * lit * (0.4 + 0.6 * toward)); col = mix(col, cc, cov * 0.92); }
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); m.renderOrder = -10; m.frustumCulled = false; m.userData.keep = true; st.scene.add(m); return m; }
// a look from where you stand: yaw (degrees, 0 = over the railing toward the sunset, + = left) and pitch
function lookE(st, yaw, pitch, f = 60, dp = [0, 0, 0]) { const x = EYE[0] + dp[0], y = EYE[1] + dp[1], z = EYE[2] + dp[2], a = yaw * DEG, p = pitch * DEG; camLook(st.cam, x, y, z, x - Math.sin(a) * 10 * Math.cos(p), y + 10 * Math.sin(p), z - Math.cos(a) * 10 * Math.cos(p)); fov(st, f); }
// the world state: x = 0 normal ... 1 ghost (no electrons)
function setGhost(S, x, glow = 0, fade = 1, t = 0) { const st = S.st, on = x > 0.5;
  if (S.ghostOn !== on) { S.ghostOn = on; st.scene.traverse((o) => { if (o.isMesh && !o.userData.keep) { if (o.userData.mat0 === undefined) o.userData.mat0 = o.material; o.material = on ? XRAY : o.userData.mat0; o.castShadow = on ? false : o.userData.cs0 ?? (o.userData.cs0 = o.castShadow); } if (o.isSprite) o.visible = !on; }); } XU.uGlow.value = glow; XU.uFade.value = fade; XU.uT.value = t;
  if (st.sky) st.sky.visible = x < 0.5; S.clouds.forEach((c) => (c.visible = x < 0.5)); st.scene.fog.near = x > 0.5 ? 1e6 : 300; S.stars.pts.material.opacity = x > 0.5 ? 0.95 : 0; S.stars.mw.material.opacity = 0;
  st.scene.background = x > 0.5 ? lin('#02040c') : null; S.flat.forEach((m) => (m.visible = x < 0.5)); }
function renderRoof(S, t, o = {}) { const st = S.st; renderStage(st, o.exp ?? 1.0); bloom(o.bloom ?? 0.25); if (!o.ghost) lensFlare(st, SUN_SET, 0.7); }
// ===================== 1. ROOF (0-10): the party at sunset; you look down at your drink =====================
SHOT_FN.roof = (lt, dur, t) => { const S = roofStage(), st = S.st; setGhost(S, 0); poseRoof(S, t, false);
  const y = knots([[0, 0], [3.5, 8], [5.0, 48], [7.2, 34], [8.2, 4], [10, 0]], t), p = knots([[0, 2], [5, -4], [7.2, -6], [8.6, -38], [10, -38]], t); lookE(st, y, p, 62); handheld(st.cam, t, 0.6, 1);
  placeHandsE(S, st.cam, { view: ss(7.8, 8.8, t), cup: true, tilt: 0.55, dy: -0.15, dz: -0.42 }); renderRoof(S, t); };
// ===================== 2. GHOST (10-27): light passes through everything; stars through your hands; people of glass =====================
SHOT_FN.ghost = (lt, dur, t) => { const S = roofStage(), st = S.st; setGhost(S, 1, 0, 1, t); poseRoof(S, sceneT(t), true);
  let y, p; if (t < 13) { y = 0; p = knots([[10, -38], [13, -30]], t); } else if (t < 20) { y = 2 * Math.sin(t * 0.2); p = knots([[13, -30], [14.6, 26], [20, 30]], t); } else { y = knots([[20, 10], [23, 52], [27, 38]], t); p = knots([[20, 22], [22, -6], [27, -8]], t); }
  lookE(st, y, p, 62); handheld(st.cam, t, 0.6, 2); placeHandsE(S, st.cam, { view: t < 20 ? 1 : 1 - ss(20, 21.5, t), cup: t < 13, palm: t >= 13, tilt: t < 13 ? 0.55 : lerp(0.55, 0.05, ss(13, 14.6, t)), dy: t < 13 ? -0.15 : lerp(-0.15, -0.08, ss(13, 14.6, t)), dz: -0.42, spread: 0.8, tremble: 0.6 });
  renderRoof(S, t, { ghost: true, bloom: 0.45 }); };
// ===================== 3. BURST (27-41): charges repel: sparks fly apart; your hands glow and burst =====================
SHOT_FN.burst = (lt, dur, t) => { const S = roofStage(), st = S.st; poseRoof(S, sceneT(t), true);
  if (!S.sp) { S.sp = makeSparks(st, samplePoints([...S.sample, ...S.towers.slice(0, 60)], 30000, 'roof'), 0xbfd6ff, 0.07); S.spH = makeSparks(st, samplePoints([S.HL.root, S.HR.root], 5000, 'hands'), 0xffffff, 0.03); }
  const k = ss(27.5, 40, t), kh = ss(34.5, 39.5, t); setGhost(S, 1, 0.15 + 0.85 * ss(30, 40, t), 1 - ss(33, 39, t), t);
  let y, p; if (t < 34) { y = knots([[27, 38], [30, 20], [34, 0]], t); p = knots([[27, -8], [31, 0], [34, -24]], t); } else { y = 0; p = -24; } lookE(st, y, p, 64); handheld(st.cam, t, 0.8 + 3 * ss(36, 40, t), 3);
  placeHandsE(S, st.cam, { view: ss(33.6, 34.6, t), palm: true, tilt: 0.1, dy: -0.1, dz: -0.42, spread: 0.9, tremble: 1.5 + 2 * kh });
  // hand sparks follow the hands (re-sampled once), then burst
  S.sp.m.material.opacity = ss(27.3, 28.5, t); poseSparks(S.sp, k, 40, 1, t); S.spH.m.material.opacity = ss(34.5, 35.5, t); if (t > 34.5) { if (!S.spH.done) { const pts = samplePoints([S.HL.root, S.HR.root], 5000, 'hands2'); S.spH.base = pts; S.spH.done = true; } poseSparks(S.spH, kh, 2.5, 0.3, t); }
  renderRoof(S, t, { ghost: true, bloom: 0.4 + 0.5 * ss(35, 40, t) }); if (t > 38) pvTint('#ffffff', ss(38, 40.8, t)); };
// ===================== 4. EARTH (41-56): the Earth glows white; the Moon passes; you fall into the white =====================
SHOT_FN.earth = (lt, dur, t) => { const S = once('space', buildSpaceE), st = S.st; S.EU.uT.value = t; S.EU.uHeat.value = ss(44, 52, t);
  const d = t < 50 ? lerp(5200, 3600, EZ.io(seg(t, 41, 50))) : lerp(3600, 1080, EZ.i3 ? EZ.i3(seg(t, 50, 54)) : seg(t, 50, 54) ** 3); camLook(st.cam, 0, 300, d, 0, 0, 0); fov(st, 50);
  S.halo.scale.setScalar(2900 * (1 + 0.05 * Math.sin(t * 3))); S.moon.position.set(lerp(-2400, 2400, seg(t, 43, 52)), 700 + 300 * seg(t, 43, 52), 2200);
  renderStage(st, 1.0); bloom(0.6); if (t < 41.6) pvTint('#ffffff', 1 - seg(t, 41, 41.6)); if (t > 52.5) pvTint('#f4f8ff', ss(52.5, 54.5, t)); };
// ===================== 5. BACK (56-66): the electrons come back as blue points; silence; they explode =====================
SHOT_FN.back = (lt, dur, t) => { const S = roofStage(), st = S.st; poseRoof(S, sceneT(55.9), true); if (!S.sp) SHOT_FN.burst(0, 14, 27.6);
  setGhost(S, 1, 0, 0, t); S.stars.pts.material.opacity = 0.5; st.scene.background = lin('#010208');
  if (!S.spB) { S.spB = makeSparks(st, S.sp.base, 0x4a8cff, 0.06); } const come = ss(56.1, 57.6, t), boom = ss(T_BOOM, T_BOOM + 2.6, t);
  S.sp.m.material.opacity = 0; S.spH.m.material.opacity = 0; S.spB.m.material.opacity = come * (1 - 0.3 * boom); poseSparks(S.spB, (1 - come) * 0.9 + boom * 1.2, 30, 0.6 + 2 * boom, t); XU.uFade.value = 0.25 * ss(57, 59, t) * (1 - boom);
  const y = knots([[56, 0], [59, 18], [61, 10]], t), p = knots([[56, -10], [59, -4], [61, -2]], t); lookE(st, y, p, 62); handheld(st.cam, t, 0.6 + 6 * ss(T_BOOM, T_BOOM + 0.3, t) * (1 - ss(T_BOOM + 1, T_BOOM + 4, t)), 5);
  placeHandsE(S, st.cam, { view: 0 }); renderRoof(S, t, { ghost: true, bloom: 0.4 + 0.8 * boom });
  if (t >= 60.6 && t < T_BOOM) pvTint('#000000', 0.55 * ss(60.6, 61.0, t));
  if (t >= T_BOOM) { pvTint('#3a7aff', 0.55 * ss(T_BOOM, T_BOOM + 0.5, t)); pvTint('#ffffff', 0.8 * (1 - seg(t, T_BOOM, T_BOOM + 0.4))); pvTint('#cfe2ff', ss(T_BOOM + 2.0, 65.5, t)); } };
SHOT_FN.card = () => {};
