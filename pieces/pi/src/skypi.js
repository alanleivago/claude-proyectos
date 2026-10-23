
// =====================================================================
//  SKY PI — the light and the sky (tuneLight), the giant glowing π circle in the sky (buildSkyPi / poseSkyPi),
//  and the 2D circle diagram (diagramPi, called from overlays — now empty: the 3D circle carries its own label)
// =====================================================================
const LIGHT = { exp: 0.86 };
const SKY_SUN = dirV(32 * DEG, 40 * DEG); // ahead and to the right: shadows fall back toward the camera, a hazy glow above the skyline
function tuneLight(st, S) {
  const k = st.key; k.color.set('#ffeedc'); k.intensity = 3.4; st.setSun(SKY_SUN, new THREE.Vector3(0, 0, -30));
  k.shadow.mapSize.set(4096, 4096); k.shadow.radius = 3; k.shadow.blurSamples = 12; k.shadow.bias = -0.0003;
  st.hemi.color.set('#9cb0cc'); st.hemi.groundColor.set('#3e3428'); st.hemi.intensity = 0.38;
  const U = st.skyU; U.uTop.value = lin('#1a56b4'); U.uHor.value = lin('#c4d6e8'); U.uSun.value.copy(SKY_SUN); U.uCl.value = 0.42; U.uSunC.value = lin('#ffe8c4');
  skyEnv(st, '#1c4078', '#6c7c8e', SKY_SUN, '#ffe2b8');
  st.scene.fog.color.setRGB(0.84, 0.85, 0.85); st.scene.fog.near = 30; st.scene.fog.far = 560;
  // the reference's lawns and road are deeper: tint the green and grey maps down a little (by their average colour)
  const seen = new Set(); st.scene.traverse((m) => { if (!m.isMesh) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => {
    if (seen.has(mt) || !mt.isMeshStandardMaterial) return; seen.add(mt); const c = skyAvg(mt.map) || { r: mt.color.r, g: mt.color.g, b: mt.color.b, raw: true }, hsl = {};
    new THREE.Color(c.r, c.g, c.b).getHSL(hsl); if (hsl.h > 0.18 && hsl.h < 0.45 && hsl.s > 0.25) mt.color.multiply(new THREE.Color(0.7, 0.78, 0.66));
    else if (hsl.s < 0.08 && hsl.l > 0.08 && hsl.l < 0.6) (c.raw ? mt.color.multiplyScalar(0.86) : mt.color.multiply(new THREE.Color(0.46, 0.5, 0.56))); }); });
}
const SKY_AVG = new Map();
function skyAvg(tex) { if (!tex || !tex.image || !tex.image.getContext) return null; if (SKY_AVG.has(tex)) return SKY_AVG.get(tex);
  const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d'); x.drawImage(tex.image, 0, 0, 8, 8); const d = x.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; } const n = d.length / 4, o = { r: r / n / 255, g: g / n / 255, b: b / n / 255 }; SKY_AVG.set(tex, o); return o; }

// ---- the circle: unit radius, in its own plane (XY); every line is a glowing ribbon (core + soft halo, additive)
const SKY_END = 6 / TAU; // three diameters of rim: 95.5 % of the way round
function skyMat() { return new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uA: { value: 1 }, uEnd: { value: 1 }, uCy: { value: 0 }, uCyS: { value: SKY_END } },
  vertexShader: 'attribute float aU, aV; varying float vU, vV; void main(){ vU = aU; vV = aV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uA, uEnd, uCy, uCyS; varying float vU, vV;
void main(){ if (vU > uEnd) discard; float d = abs(vV), core = smoothstep(0.3, 0.12, d), glow = exp(-d * d * 6.0) * 0.38 + exp(-d * d * 26.0) * 0.5;
  vec3 cc = vec3(1.0, 0.98, 0.94), gc = vec3(1.0, 0.86, 0.62); if (vU > uCyS) { cc = mix(cc, vec3(0.55, 0.95, 1.0), uCy); gc = mix(gc, vec3(0.3, 0.8, 1.0), uCy); }
  vec3 c = cc * core + gc * glow; gl_FragColor = vec4(c, uA); }` }); }
function skyRib(pts, w, mat) { const n = pts.length, pos = new Float32Array(n * 6), aU = new Float32Array(n * 2), aV = new Float32Array(n * 2), idx = [];
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l * w, ny = tx / l * w;
    pos.set([p[0] + nx, p[1] + ny, 0, p[0] - nx, p[1] - ny, 0], i * 6); aU.set([p[2], p[2]], i * 2); aV.set([1, -1], i * 2); if (i) { const o = (i - 1) * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aU', new THREE.BufferAttribute(aU, 1)); g.setAttribute('aV', new THREE.BufferAttribute(aV, 1)); g.setIndex(idx);
  const m = new THREE.Mesh(g, mat); m.renderOrder = 999; m.frustumCulled = false; return m; }
// a text card in the circle's plane, hW = card height in circle radii (the glyphs fill ~60 % of it)
function skyLabel(str, hW, col = '#fffaf0', glow = 'rgba(255,214,150,0.95)') { const w = 2048, h = 256;
  const tex = g3Tex((x) => { x.clearRect(0, 0, w, h); x.font = `400 160px ${PV.serif}`; const sz = Math.min(160, Math.floor(160 * w * 0.92 / x.measureText(str).width)); x.font = `400 ${sz}px ${PV.serif}`;
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.shadowColor = 'rgba(20,24,40,0.5)'; x.shadowBlur = sz * 0.3; x.fillText(str, w / 2, h / 2);
    x.shadowColor = glow; x.shadowBlur = sz * 0.25; x.fillText(str, w / 2, h / 2); x.shadowBlur = 0; x.fillText(str, w / 2, h / 2); }, w, h);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(hW * w / h, hW), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  m.renderOrder = 1000; m.frustumCulled = false; return m; }
function buildSkyPi(st, S) { const G = new THREE.Group(), I = new THREE.Group(); G.add(I); st.scene.add(G); const P = { G, I, mats: [] }; S.skyPi = P;
  const rimM = skyMat(), lineM = skyMat(), arrM = skyMat(); P.rimM = rimM; P.lineM = lineM; P.arrM = arrM; const W0 = 0.065;
  const arc = []; for (let i = 0; i <= 384; i++) { const u = i / 384, a = u * TAU; arc.push([Math.cos(a), Math.sin(a), u]); } I.add(skyRib(arc, W0, rimM));
  I.add(skyRib([[-1, 0, 0], [1, 0, 0]], W0 * 0.85, lineM));
  [2, 4, 6].forEach((a) => I.add(skyRib([[Math.cos(a) * 0.93, Math.sin(a) * 0.93, 0], [Math.cos(a) * 1.07, Math.sin(a) * 1.07, 0]], W0 * 0.7, lineM)));
  const dotT = g3Radial([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,250,235,0.95)'], [0.45, 'rgba(255,215,150,0.3)'], [1, 'rgba(255,200,120,0)']], 64);
  const dotM = new THREE.MeshBasicMaterial({ map: dotT, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending }); P.dotM = dotM;
  [-1, 1].forEach((x) => { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), dotM); d.position.set(x, 0, 0); d.renderOrder = 1000; I.add(d); });
  // the arrowhead where the rim gives up (built at angle 0, turned to the end of the rim each frame)
  const A = new THREE.Group(); [0.55, -0.55].forEach((s) => A.add(skyRib([[1 + Math.sin(s) * 0.1, -Math.cos(s) * 0.1, 0], [1, 0, 0]], W0 * 0.75, arrM))); I.add(A); P.arrow = A;
  P.lab = [skyLabel('π = 3,14159265…', 0.3), skyLabel('π = 3', 0.38), skyLabel('π = 3,14159…', 0.32)]; P.lab.forEach((l) => { l.position.set(0, -0.4, 0); I.add(l); });
  P.cyl = skyLabel('0,14159…', 0.15, '#d8f6ff', 'rgba(110,210,255,0.95)'); P.cyl.position.set(1.12, -0.3, 0); I.add(P.cyl);
  P.ones = [1, 3, 5].map((a) => { const l = skyLabel('1', 0.19); l.position.set(Math.cos(a) * 0.84, Math.sin(a) * 0.84, 0); I.add(l); return l; });
  const d1 = skyLabel('1', 0.19); d1.position.set(0, 0.1, 0); I.add(d1); P.ones.push(d1);
  G.visible = false; }
function poseSkyPi(S, cam, t) { const P = S.skyPi; if (!P) return; const G = P.G;
  const a = Math.min(1, ev(0.2, 1.0)) * (1 - ev(63.8, 0.7)); if (t >= 64.5 || (t >= 30 && t < 37) || a <= 0) { G.visible = false; return; } G.visible = true;
  const big = t >= 44 && t < 47 ? ss(44, 45.1, t) * (1 - ss(46.6, 47, t)) : 0, on = t >= 8 && t < 56;
  const tv = Math.tan(cam.fov * DEG / 2), th = tv * W / H, D = 120;
  // where it sits in the frame (upper part; lower and much bigger for the planet shot), only partly locked to the camera's pitch
  const ny = lerp(lerp(0.72, 0.62, ss(4.2, 5.4, t)), 0.36, big) + 0.02 * Math.sin(t * 0.31), nx = lerp(0.05, 0.02, big) + 0.035 * Math.sin(t * 0.19 + 0.7);
  const pitch = cam.rotation.x * (t >= 60 ? 1 : 0.5) + Math.atan(ny * tv), yaw = cam.rotation.y - Math.atan(nx * th);
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  G.position.copy(cam.position).addScaledVector(dir, D); G.rotation.set(pitch, yaw, 0, 'YXZ');
  const R = lerp(0.33, 0.62, big) * D * th * (1 + 0.025 * Math.sin(t * 1.05)); G.scale.setScalar(R);
  // it turns and breathes in 3D: seen a little from below, swinging slowly
  P.I.rotation.set(lerp(-0.2, -0.34, big) + 0.09 * Math.sin(t * 0.37), 0.3 * Math.sin(t * 0.23 + 1.2) + lerp(0, 0.12, big), -0.05 + 0.04 * Math.sin(t * 0.17) + (on ? 0.012 * Math.sin(t * 7.3) * (1 - ss(8, 10, t)) : 0));
  // the snap at π = 3 (8 s) and the return (56 s): a flash, the rim opens to 95.5 % / closes again
  const gap = ss(8, 8.6, t) * (1 - ss(56, 56.6, t)), flash = 1 + 1.2 * (t >= 8 ? Math.max(1 - seg(t, 8, 8.9), t >= 56 ? 1 - seg(t, 56, 56.9) : 0) : 0);
  const A = a * lerp(0.95, 1.15, big) * flash; P.rimM.uniforms.uA.value = A; P.lineM.uniforms.uA.value = A; P.dotM.opacity = Math.min(1, A);
  P.rimM.uniforms.uEnd.value = lerp(1.001, SKY_END, gap); P.rimM.uniforms.uCy.value = 1 - ss(7.2, 8, t);
  P.arrM.uniforms.uA.value = A * gap; P.arrow.rotation.z = P.rimM.uniforms.uEnd.value * TAU;
  const li = t < 8 ? 0 : t < 56 ? 1 : 2; P.lab.forEach((l, i) => { l.visible = i === li; l.material.opacity = Math.min(1, a * (i === 1 ? ss(8, 8.5, t) : i === 2 ? ss(56, 56.5, t) : 1)); });
  P.cyl.material.opacity = a * (1 - ss(7.2, 8, t)); P.cyl.visible = t < 8; P.ones.forEach((l) => { l.material.opacity = 0.85 * a; }); }
// the circle diagram now lives in the sky (buildSkyPi); the 2D one is retired so they don't duplicate
function diagramPi(t) { }
