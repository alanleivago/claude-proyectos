// =====================================================================
//  styles/cartoon3d/kit.js — "3D cartoon shorts": flat-drawn cartoon people (ball head, bean body, stick limbs,
//  thick brown ink outline, face decals that swap on a blink) inside dense, inked, warmly lit 3D sets.
//  three.js r149 (styles/pov3d/three.js, global THREE) renders into an offscreen WebGL canvas in passes
//  (background blurred, subject sharp, near blurred, emissive glow added), then the 2D canvas adds
//  vignette, grain and one-word subtitles. Motion on 1s at 30 fps. Helpers are prefixed `c3`.
//  Rules and numbers: styles/cartoon3d/STYLE.md.
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB

const C3 = {
  ink: '#3b2417',          // outlines, limbs, face lines
  skin: '#ffffff',
  sub: '"Montserrat Black", "Segoe UI Black", "Arial Black", "Helvetica Neue", Arial, sans-serif',
  subY: 0.715,              // subtitle baseline, fraction of H (refs: ~70%; faces stay out of 66-76%)
  L_BG: 0, L_FOCUS: 1, L_NEAR: 2,
};

// ---- small three helpers
function c3Tex(draw, w = 256, h = 256, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
const c3V = (x, y, z) => new THREE.Vector3(x, y, z);
// soft toon ramp: three bands blended (the refs' shading is soft, mostly lit)
const C3_RAMP = (() => {
  const v = [150, 205, 240, 255], d = new Uint8Array(v.length * 4);
  v.forEach((x, i) => d.set([x, x, x, 255], i * 4));
  const t = new THREE.DataTexture(d, v.length, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
})();
function c3Toon(color, o = {}) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: C3_RAMP, map: o.map || null, transparent: !!o.transparent, side: o.side ?? THREE.FrontSide }); m.toneMapped = false;
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; if (o.emissiveMap) m.emissiveMap = o.emissiveMap; }
  if (o.glow) m.userData.glow = o.glow;
  return m;
}
// set dressing: physically based, so props get soft gradients, highlights and reflections of the room (the refs' "3D")
function c3Prop(color, o = {}) {
  const m = new THREE.MeshStandardMaterial({ color, map: o.map || null, roughness: o.rough ?? 0.45, metalness: o.metal ?? 0.0, envMapIntensity: o.env ?? 1.0, transparent: !!o.transparent });
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; if (o.emissiveMap) m.emissiveMap = o.emissiveMap; }
  if (o.glow) m.userData.glow = o.glow;
  return m;
}
// a box with rounded edges (extruded rounded rectangle with a bevel), centred like BoxGeometry
function c3RBox(w, h, d, r = 0.08, seg = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, iw = w - 2 * r, ih = h - 2 * r;
  s.moveTo(x, y); s.lineTo(x + iw, y); s.lineTo(x + iw, y + ih); s.lineTo(x, y + ih); s.lineTo(x, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(1e-3, d - 2 * r), bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: seg, curveSegments: 1 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals(); return g;
}
// a room light-probe for reflections: warm ceiling panels, dark floor, a few bright cards (built once per scene)
function c3Env(scene, o = {}) {
  const { r } = c3Renderer(), env = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color(o.top ?? '#ffd9a8') }, mid: { value: new THREE.Color(o.mid ?? '#d09070') }, bot: { value: new THREE.Color(o.bot ?? '#1a0c10') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top, mid, bot; varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.8, h)) : mix(mid, bot, smoothstep(0.0, 0.5, -h)); gl_FragColor = vec4(c, 1.0); }' }));
  env.add(sky);
  for (const [x, y, z, w, h, c] of o.cards ?? [[0, 30, 0, 40, 6, '#fff6e8'], [-30, 10, 10, 10, 18, '#ffd0a0'], [30, 12, -10, 10, 18, '#ffffff'], [0, 8, 40, 30, 8, '#ff9a60'], [20, 4, 25, 12, 3, '#ffffff'], [-22, 6, -20, 3, 14, '#fff0d0']]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 0, 0); env.add(p);
  }
  const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(env, 0.02).texture; pm.dispose();
}
// platinum chrome: its own high-contrast reflection (dark room, hard white strip lights) so it reads as polished metal
let C3_CHROME_ENV = null;
function c3Chrome(color = '#f2f4fa', o = {}) {
  if (!C3_CHROME_ENV) {
    const { r } = c3Renderer(), env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 16, 8), new THREE.MeshBasicMaterial({ color: '#8a8690', side: THREE.BackSide })));
    for (const [x, y, z, w, h, c] of [[0, 18, -30, 80, 5, '#ffffff'], [0, -6, -30, 80, 3, '#ffe8c8'], [-30, 6, 0, 4, 40, '#ffffff'], [30, 10, 10, 6, 40, '#fff4e0'], [0, 30, 0, 30, 30, '#d8dce8'], [0, -30, 0, 60, 60, '#141016']]) {
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); pm.position.set(x, y, z); pm.lookAt(0, 0, 0); env.add(pm);
    }
    const pg = new THREE.PMREMGenerator(r); C3_CHROME_ENV = pg.fromScene(env, 0.0).texture; pg.dispose();
  }
  return new THREE.MeshStandardMaterial({ color, metalness: 1.0, roughness: o.rough ?? 0.08, envMap: C3_CHROME_ENV, envMapIntensity: o.env ?? 1.3 });
}
// soft shadows from one key light over the area that matters
function c3Shadows(scene, light, box = 14, o = {}) {
  const { r } = c3Renderer(); r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  light.castShadow = true; light.shadow.mapSize.set(o.res ?? 2048, o.res ?? 2048); light.shadow.radius = o.radius ?? 6; light.shadow.blurSamples = 12; light.shadow.bias = -0.0004;
  const c = light.shadow.camera; c.left = c.bottom = -box; c.right = c.top = box; c.near = 0.5; c.far = 80; c.updateProjectionMatrix();
  light.shadow.camera.layers.enableAll();
  scene.traverse((m) => { if (m.isMesh && !(m.userData && m.userData.hull) && !(m.material && m.material.transparent)) { m.castShadow = m.userData.noCast ? false : true; m.receiveShadow = true; } });
}
const c3Flat = (color, o = {}) => { const m = new THREE.MeshBasicMaterial({ color, map: o.map || null, transparent: !!o.transparent, depthWrite: o.depthWrite ?? true, side: o.side ?? THREE.FrontSide }); m.toneMapped = false; if (o.glow) m.userData.glow = o.glow; return m; };
// ink outline: an inverted hull pushed out along the normals (world-space width, like the refs: thicker up close)
const C3_HULLS = {};
function c3HullMat(w, color = C3.ink) {
  const k = w + color;
  if (!C3_HULLS[k]) {
    const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }); m.toneMapped = false;
    m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normalize(normal) * ${w.toFixed(4)};`); };
    m.customProgramCacheKey = () => 'hull' + k;
    C3_HULLS[k] = m;
  }
  return C3_HULLS[k];
}
function c3Ink(mesh, w = 0.035, color) { const h = new THREE.Mesh(mesh.geometry, c3HullMat(w, color)); h.userData.hull = true; mesh.add(h); return mesh; }
function c3Mesh(geo, mat, ink) { const m = new THREE.Mesh(geo, mat); if (ink) c3Ink(m, ink === true ? 0.035 : ink); return m; }
function c3Layer(obj, n) { obj.traverse((o) => o.layers.set(n)); return obj; }
function c3Put(o, x, y, z, ry = 0, rx = 0, rz = 0, s) { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); if (s != null) (typeof s === 'number' ? o.scale.setScalar(s) : o.scale.set(...s)); return o; }

// ---- time curves
// smooth monotone curve through knots [[t, v], ...] (cubic Hermite, no overshoot)
function c3Knots(K, t) {
  if (t <= K[0][0]) return K[0][1];
  if (t >= K[K.length - 1][0]) return K[K.length - 1][1];
  let i = 0; while (t > K[i + 1][0]) i++;
  const [t0, v0] = K[i], [t1, v1] = K[i + 1], h = t1 - t0, u = (t - t0) / h;
  const sl = (j) => (K[Math.min(j + 1, K.length - 1)][1] - K[Math.max(j - 1, 0)][1]) / (K[Math.min(j + 1, K.length - 1)][0] - K[Math.max(j - 1, 0)][0]);
  let m0 = sl(i) * h, m1 = sl(i + 1) * h; const d = v1 - v0;
  if (d === 0) { m0 = m1 = 0; } else {
    m0 = Math.sign(m0) === Math.sign(d) ? Math.sign(d) * Math.min(Math.abs(m0), 3 * Math.abs(d)) : 0;
    m1 = Math.sign(m1) === Math.sign(d) ? Math.sign(d) * Math.min(Math.abs(m1), 3 * Math.abs(d)) : 0;
  }
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
}
// camera from knots: [[t, [px,py,pz], [lx,ly,lz], fov], ...] — every component its own smooth curve
function c3CamAt(K, t) {
  const comp = (j, i) => c3Knots(K.map((k) => [k[0], k[j][i]]), t);
  return { p: [0, 1, 2].map((i) => comp(1, i)), l: [0, 1, 2].map((i) => comp(2, i)), fov: c3Knots(K.map((k) => [k[0], k[3]]), t) };
}
// a pose value that snaps between holds: [[t, v], ...] each change takes d seconds (ease in-out), dead still otherwise
function c3Hold(K, t, d = 5 / 30) {
  let v = K[0][1];
  for (let i = 1; i < K.length; i++) {
    const [tk, vk] = K[i]; if (t < tk - d) break;
    const u = EZ.io(clamp((t - (tk - d)) / d));
    v = Array.isArray(vk) ? vk.map((x, j) => lerp(v[j], x, u)) : lerp(v, vk, u);
  }
  return v;
}

// ---- faces: drawn on a canvas, mapped on a front patch of the head sphere (a decal); swapped, never morphed
const C3_FACE = { size: 512, span: 1.9, draw: 1.0 };   // span: the patch's angular size (radians) both ways; draw: PNG size on the patch
function c3FaceDraw(x, S, expr, gx = 0, gy = 0) {
  const ink = C3.ink, cx = S / 2, cy = S * 0.5, ex = S * 0.13, ey = cy - S * 0.03, lw = S * 0.018;
  x.clearRect(0, 0, S, S); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = lw;
  const P = (px, py) => [cx + px * S, cy + py * S];
  const dotEyes = (r = 0.032, dy = 0) => [-1, 1].forEach((s) => { const [a, b] = P(s * 0.13 + gx * 0.02, -0.03 + dy + gy * 0.02); x.beginPath(); x.ellipse(a, b, r * S * 0.85, r * S, 0, 0, TAU); x.fill(); });
  const bigEyes = (r = 0.075, pr = 0.032) => [-1, 1].forEach((s) => {
    const [a, b] = P(s * 0.14, -0.05); x.beginPath(); x.ellipse(a, b, r * S * 0.92, r * S, 0, 0, TAU); x.fillStyle = '#fff'; x.fill(); x.lineWidth = lw * 1.05; x.stroke();
    x.fillStyle = ink; x.beginPath(); x.arc(a + gx * r * S * 0.35, b + gy * r * S * 0.35, pr * S, 0, TAU); x.fill(); });
  const lidEyes = (open = 0.45, dy = 0) => [-1, 1].forEach((s) => {   // half-lidded: flat top lid, dark iris below
    const [a, b] = P(s * 0.13 + gx * 0.02, -0.02 + dy); const rx = 0.05 * S, ry = 0.04 * S;
    x.save(); x.beginPath(); x.rect(a - rx * 1.4, b - ry + ry * 2 * (1 - open), rx * 2.8, ry * 3); x.clip();
    x.beginPath(); x.ellipse(a, b, rx, ry, 0, 0, TAU); x.fill(); x.restore();
    x.lineWidth = lw * 1.2; x.beginPath(); x.moveTo(a - rx * 1.25, b - ry + ry * 2 * (1 - open)); x.lineTo(a + rx * 1.25, b - ry + ry * 2 * (1 - open)); x.stroke(); });
  const brows = (tilt, dy = -0.15, w = 0.075, th = 1.5) => [-1, 1].forEach((s) => {   // tilt > 0: inner ends down (angry)
    const [a, b] = P(s * 0.13, dy); x.lineWidth = lw * th; x.beginPath();
    x.moveTo(a - w * S * 0.5, b - s * tilt * S * 0.02 - Math.abs(tilt) * 0); x.quadraticCurveTo(a, b - S * 0.022, a + w * S * 0.5, b + s * tilt * S * 0.02); x.stroke(); });
  const arc = (y, w, d, th = 1) => { const [a, b] = P(0, y); x.lineWidth = lw * th; x.beginPath(); x.moveTo(a - w * S, b); x.quadraticCurveTo(a, b + d * S, a + w * S, b); x.stroke(); };
  const lineM = (y, w, tilt = 0) => { const [a, b] = P(0.01, y); x.lineWidth = lw; x.beginPath(); x.moveTo(a - w * S, b - tilt * S); x.lineTo(a + w * S, b + tilt * S); x.stroke(); };
  const openMouth = (y, w, d, teeth) => { const [a, b] = P(0, y); x.beginPath(); x.moveTo(a - w * S, b); x.quadraticCurveTo(a, b + d * S * 2, a + w * S, b); x.closePath();
    x.fillStyle = '#5a2a1c'; x.fill(); if (teeth) { x.save(); x.clip(); x.fillStyle = '#fff'; x.fillRect(a - w * S, b - 2, w * S * 2, d * S * 0.55); x.strokeStyle = ink; x.lineWidth = lw * 0.5;
      for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(a + i * w * S * 0.27, b); x.lineTo(a + i * w * S * 0.27, b + d * S * 0.55); x.stroke(); } x.restore(); }
    x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = lw; x.beginPath(); x.moveTo(a - w * S, b); x.quadraticCurveTo(a, b + d * S * 2, a + w * S, b); x.closePath(); x.stroke(); };
  const closedEyes = (up) => [-1, 1].forEach((s) => { const [a, b] = P(s * 0.13, -0.03); x.lineWidth = lw * 1.2; x.beginPath(); x.moveTo(a - 0.045 * S, b); x.quadraticCurveTo(a, b + (up ? -1 : 1) * 0.035 * S, a + 0.045 * S, b); x.stroke(); });
  const sweat = () => { const [a, b] = P(0.24, -0.16); x.fillStyle = '#7fd0ff'; x.beginPath(); x.moveTo(a, b - 0.05 * S); x.quadraticCurveTo(a + 0.03 * S, b, a, b + 0.025 * S); x.quadraticCurveTo(a - 0.03 * S, b, a, b - 0.05 * S); x.fill(); x.lineWidth = lw * 0.6; x.stroke(); x.fillStyle = ink; };
  switch (expr) {
    case 'half': lidEyes(0.35); arc(0.1, 0.05, 0.025); break;                       // blink frame 1
    case 'closed': closedEyes(false); arc(0.1, 0.05, 0.025); break;                 // blink frame 2
    case 'neutral': dotEyes(); arc(0.1, 0.045, 0.025); break;
    case 'smile': dotEyes(); arc(0.09, 0.07, 0.05, 1.1); break;
    case 'grin': bigEyes(); openMouth(0.08, 0.1, 0.06, true); break;
    case 'excited': bigEyes(0.08, 0.026); brows(-0.6, -0.2); openMouth(0.08, 0.085, 0.08, false); break;
    case 'happy': closedEyes(true); openMouth(0.08, 0.08, 0.055, false); break;
    case 'hopeful': bigEyes(0.07, 0.03); brows(-0.8, -0.18); arc(0.1, 0.035, 0.02); break;
    case 'smug': lidEyes(0.5); brows(0.25, -0.12, 0.085, 1.7); lineM(0.12, 0.035, -0.006); break;
    case 'unimpressed': lidEyes(0.42); brows(0, -0.11, 0.09, 1.7); { const [a, b] = P(0.02, 0.13); x.lineWidth = lw; x.beginPath(); x.moveTo(a - 0.03 * S, b + 0.004 * S); x.quadraticCurveTo(a, b - 0.012 * S, a + 0.03 * S, b + 0.008 * S); x.stroke(); } break;
    case 'surprised': bigEyes(0.07, 0.022); brows(-0.5, -0.21); { const [a, b] = P(0, 0.12); x.beginPath(); x.ellipse(a, b, 0.03 * S, 0.04 * S, 0, 0, TAU); x.fillStyle = '#5a2a1c'; x.fill(); x.lineWidth = lw; x.stroke(); } break;
    case 'panic': bigEyes(0.08, 0.018); brows(-0.9, -0.21); openMouth(0.09, 0.07, 0.07, false); sweat(); break;
    case 'sad': dotEyes(0.028, 0.01); brows(-1, -0.12); arc(0.13, 0.045, -0.03); break;
    case 'angry': dotEyes(0.03, 0.01); brows(1.1, -0.1, 0.09, 1.9); arc(0.13, 0.05, -0.025, 1.2); break;
    case 'worried': dotEyes(0.03); brows(-0.9, -0.13); { const [a, b] = P(0, 0.12); x.lineWidth = lw; x.beginPath(); x.moveTo(a - 0.05 * S, b); x.bezierCurveTo(a - 0.02 * S, b - 0.02 * S, a + 0.02 * S, b + 0.02 * S, a + 0.05 * S, b); x.stroke(); } break;
    default: dotEyes(); arc(0.1, 0.045, 0.025);
  }
}
const C3_FACES = {};
function c3FaceTex(expr, gx = 0, gy = 0) {
  const k = `${expr}|${gx.toFixed(1)}|${gy.toFixed(1)}`;
  // the Flow-drawn sheets (styles/cartoon3d/faces/png, copied into the piece's assets as face_<expr>.png) win;
  // the procedural faces are only a fallback. Gaze moves the features a little across the head.
  const img = asset(`face_${expr}.png`);
  if (!C3_FACES[k]) C3_FACES[k] = c3Tex((x, w) => {
    if (img) { const D = w * C3_FACE.draw; x.clearRect(0, 0, w, w); x.drawImage(img, (w - D) / 2 + gx * w * 0.012, (w - D) / 2 + gy * w * 0.01, D, D); }   // no offset: fit_faces placed the features; a small gaze shift stays inside the glasses
    else c3FaceDraw(x, w, expr, gx, gy);
  }, C3_FACE.size, C3_FACE.size);
  return C3_FACES[k];
}
// which face shows at time t. track = [[tWord, expr], ...]: the new face SNAPS 2 frames before the word,
// after a half-lid frame (-4f) and a closed frame (-3f). Idle blinks every ~3.4 s when nothing changes nearby.
function c3FaceAt(track, t, key = 'c') {
  const f = Math.round(t * FPS); let cur = track[0][1];
  for (let i = 1; i < track.length; i++) {
    const fn = Math.round(track[i][0] * FPS) - 2;
    if (f === fn - 2) return 'half';
    if (f === fn - 1) return 'closed';
    if (f >= fn) cur = track[i][1];
  }
  // idle blinks (ref 6: half, closed, half — frames 41-43 and 99-101), every 1.6-2.8 s
  const near = track.some(([tw]) => Math.abs(f - (Math.round(tw * FPS) - 2)) < 10);
  if (!near && !['happy', 'laugh', 'closed', 'proud', 'relieved'].includes(cur)) {
    const R = RNG('blink', key); let b = Math.round(R.r(0.4, 1.6) * FPS);
    while (b + 2 < f) b += Math.round(R.r(1.6, 2.8) * FPS);
    const k = f - b;
    if (k === 0 || k === 2) return 'half';
    if (k === 1) return 'closed';
  }
  return cur;
}

// ---- the character: ball head (r = 1, the unit of everything), bean body, stick limbs, mitten hands
function c3Char(o = {}) {
  const ink = C3.ink, R = RNG('char', o.key ?? 'milo');
  const g = new THREE.Group(), body = new THREE.Group(), headG = new THREE.Group();
  g.add(body); body.add(headG);
  // body: a bean (lathe), seam at the back; the shirt texture has the front at u = 0.5
  const prof = [[0.0, 0], [0.42, 0.06], [0.66, 0.25], [0.76, 0.6], [0.78, 1.0], [0.74, 1.45], [0.62, 1.8], [0.42, 2.02], [0.0, 2.12]].map(([r, y]) => new THREE.Vector2(r, y));
  const shirt = c3Tex((x, w, h) => {
    x.fillStyle = o.shirt ?? '#2fb5ad'; x.fillRect(0, 0, w, h);
    if (o.stripes) { x.fillStyle = o.stripes; for (let k = 0; k < 9; k++) x.fillRect(0, h * (0.12 + k * 0.1), w, h * 0.035); }
    const pr = RNG('pattern', o.key ?? 'milo');
    if (o.pattern !== 'none') for (let i = 0; i < 34; i++) {   // leaf/flame flecks like the refs' shirt
      const px = pr.r(0, w), py = pr.r(h * 0.1, h * 0.92), s = pr.r(17, 23), a = pr.r(-0.6, 0.6);
      x.save(); x.translate(px, py); x.rotate(a); x.fillStyle = o.patternColor ?? '#f4c430';
      for (const d of [-1, 0, 1]) { x.beginPath(); x.ellipse(d * s * 0.55, -Math.abs(d) * s * 0.15, s * 0.28, s * 0.62, d * 0.5, 0, TAU); x.fill(); }
      x.restore();
    }
    // the front: open collar (white V), tie, lapel lines, one button
    const fx = w / 2;
    x.fillStyle = o.collar ?? '#ffffff'; x.beginPath(); x.moveTo(fx - 44, h * 0.0); x.lineTo(fx + 44, h * 0.0); x.lineTo(fx, h * 0.22); x.closePath(); x.fill();
    if (o.tie !== false) { x.fillStyle = o.tie ?? '#e2462f'; x.beginPath(); x.moveTo(fx - 10, h * 0.02); x.lineTo(fx + 10, h * 0.02); x.lineTo(fx + 16, h * 0.42); x.lineTo(fx, h * 0.5); x.lineTo(fx - 16, h * 0.42); x.closePath(); x.fill();
      x.strokeStyle = ink; x.lineWidth = 4; x.stroke(); }
    x.strokeStyle = ink; x.lineWidth = 6; x.lineCap = 'round';
    x.beginPath(); x.moveTo(fx - 46, 0); x.lineTo(fx - 2, h * 0.23); x.moveTo(fx + 46, 0); x.lineTo(fx + 2, h * 0.23); x.stroke();
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(fx + 34, h * 0.68, 7, 0, TAU); x.fill();
  }, 1024, 512);
  shirt.wrapS = THREE.RepeatWrapping;
  const bodyM = c3Mesh(new THREE.LatheGeometry(prof, 48, Math.PI), c3Toon('#ffffff', { map: shirt }), 0.04);
  bodyM.scale.set(1, 1, 0.82); body.add(bodyM);
  // head: a slightly squashed white ball, its face a decal patch over the front
  headG.position.set(0, 2.62, 0.02);
  const head = c3Mesh(new THREE.SphereGeometry(1, 48, 32), c3Toon(o.skin ?? C3.skin), 0.045);
  head.scale.set(1, 0.93, 0.96); headG.add(head);
  const sp = C3_FACE.span, faceMat = new THREE.MeshBasicMaterial({ map: c3FaceTex('neutral'), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false });
  const face = new THREE.Mesh(new THREE.SphereGeometry(1.004, 40, 40, Math.PI / 2 - sp / 2, sp, Math.PI / 2 - sp / 2, sp), faceMat);
  face.scale.copy(head.scale); face.renderOrder = 2; headG.add(face);
  // hair: a messy brown cap with a fringe and a few tufts
  if (o.hair !== false && o.hairStyle !== 'bald') {
    const hairM = c3Prop(o.hair ?? '#24140f', { rough: 0.32, env: 0.55 });   // glossy painted hair with a highlight, like the refs
    const cap = c3Mesh(new THREE.SphereGeometry(1.08, 40, 20, 0, TAU, 0, 1.05), hairM, 0.04);
    cap.rotation.x = -0.42; cap.scale.set(1.02, 0.95, 1.0); headG.add(cap);
    // spiky messy tufts: flattened cones standing out of the cap along the hairline and over the crown
    const spike = new THREE.SphereGeometry(0.3, 16, 10); spike.scale(1, 1.55, 1); spike.translate(0, 0.12, 0);   // a soft teardrop lock
    const up = c3V(0, 1, 0), tilt = (v) => v.applyAxisAngle(c3V(1, 0, 0), -0.42);
    for (let i = 0; i < (o.hairStyle === 'short' ? 0 : o.hairStyle === 'long' ? 6 : 11); i++) {
      const a = (i / 11) * TAU + R.r(-0.15, 0.15), el = i % 3 === 0 ? R.r(0.2, 0.45) : R.r(0.75, 0.95);
      const d = tilt(c3V(Math.sin(a) * Math.sin(el), Math.cos(el), Math.cos(a) * Math.sin(el)));
      if (d.z > 0.55 && d.y < 0.75) continue;   // keep the face clear
      const t = c3Mesh(spike, hairM, 0.03); t.position.copy(d.clone().multiplyScalar(0.98));
      const out = d.clone().add(c3V(R.n(0.25), 0.35, R.n(0.25))).normalize(); t.quaternion.setFromUnitVectors(up, out);
      t.scale.set(R.r(0.85, 1.15), R.r(0.7, 1.05), 0.6); headG.add(t);
    }
    for (let i = 0; i < (o.hairStyle === 'short' || o.hairStyle === 'long' ? 0 : 3); i++) {   // a fringe flicking over the forehead
      const t = c3Mesh(spike, hairM, 0.03); t.position.set(-0.32 + i * 0.32, 0.74, 0.6);
      t.quaternion.setFromUnitVectors(up, c3V(0.35 - i * 0.2, -0.25, 1).normalize()); t.scale.set(0.9, 0.6, 0.5); headG.add(t);
    }
  }
  // hair styles beyond the messy mop: 'long' (side curtains to the shoulders), 'short' (cap only), 'bald' (a fringe ring)
  if (o.hairStyle === 'long' || o.hairStyle === 'bald') {
    const hm = c3Prop(o.hair ?? '#24140f', { rough: 0.35, env: 0.5 });
    const n = o.hairStyle === 'long' ? 7 : 6;
    for (let k = 0; k < n; k++) {
      const a = o.hairStyle === 'long' ? lerp(1.75, TAU - 1.75, k / (n - 1)) : lerp(1.4, TAU - 1.4, k / (n - 1));
      const lock = c3Mesh(new THREE.SphereGeometry(0.34, 16, 12), hm, 0.03);
      const y = o.hairStyle === 'long' ? -0.35 : 0.05;
      lock.position.set(Math.sin(a) * 0.92, y, Math.cos(a) * 0.92); lock.scale.set(0.75, o.hairStyle === 'long' ? 2.1 : 0.9, 0.75); headG.add(lock);
    }
  }
  // facial hair and glasses, sitting on the head over the face decal
  if (o.beard) {
    const bm = c3Prop(o.beardColor ?? o.hair ?? '#24140f', { rough: 0.6, env: 0.4 });
    const beard = c3Mesh(new THREE.SphereGeometry(1.03, 40, 20, Math.PI / 2 - 1.15, 2.3, 1.95, 0.85), bm, 0.035);
    beard.scale.copy(head.scale); headG.add(beard);
  }
  if (o.mustache) {
    const mm = c3Prop(o.beardColor ?? o.hair ?? '#24140f', { rough: 0.6, env: 0.4 });
    for (const sx of [-1, 1]) { const m = c3Mesh(new THREE.SphereGeometry(0.2, 14, 8), mm, 0.02); m.position.set(sx * 0.13, -0.12, 0.93); m.scale.set(1.2, 0.42, 0.5); m.rotation.z = sx * -0.25; headG.add(m); }
  }
  if (o.glasses) {
    const gm = c3Flat(C3.ink), ring = new THREE.TorusGeometry(0.2, 0.03, 8, 28);
    for (const sx of [-1, 1]) { const r = new THREE.Mesh(ring, gm); r.position.set(sx * 0.25, 0.0, 0.99); r.lookAt(sx * 0.5, 0, 3); headG.add(r); }
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 6), gm); br.rotation.z = Math.PI / 2; br.position.set(0, 0.02, 1.02); headG.add(br);
  }
  if (o.body) { bodyM.scale.x *= o.body[0]; bodyM.scale.y *= o.body[1]; bodyM.scale.z *= o.body[0]; }
  // limbs: ink-brown sticks (no outline: they ARE ink), round joints, mitten hands, small shoes
  const limbM = c3Flat(ink), unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), ball = new THREE.SphereGeometry(1, 14, 10);
  const LR = o.limb ?? 0.07, limbs = {};
  for (const n of ['armL', 'armR', 'legL', 'legR']) {
    const a = new THREE.Mesh(unitCyl, limbM), b = new THREE.Mesh(unitCyl, limbM), j = new THREE.Mesh(ball, limbM), r0 = new THREE.Mesh(ball, limbM);
    const end = n.startsWith('arm') ? c3Mesh(new THREE.SphereGeometry(1, 16, 12), c3Toon(o.hand ?? '#4a2c1e'), 0.02) : c3Mesh(new THREE.SphereGeometry(1, 16, 12), c3Toon(o.shoe ?? '#3a2a24'), 0.02);
    [a, b, j, r0, end].forEach((m) => body.add(m)); limbs[n] = { a, b, j, r0, end };
  }
  const ch = { g, body, headG, head, face, faceMat, limbs, LR, expr: 'neutral' };
  // shoulders and hips in body space
  ch.joint = { armL: c3V(0.6, 1.62, 0.05), armR: c3V(-0.6, 1.62, 0.05), legL: c3V(0.28, 0.35, 0.35), legR: c3V(-0.28, 0.35, 0.35) };
  ch.len = { arm: [0.95, 0.95], leg: [1.45, 1.45] };
  return ch;
}
// place a stick segment between two body-space points
function c3Seg(m, a, b, r) {
  const d = b.clone().sub(a), L = d.length();
  m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(r, L, r);
  m.quaternion.setFromUnitVectors(c3V(0, 1, 0), d.normalize());
}
// two-bone IK: root, target, lengths, pole (bend direction) -> elbow/knee
function c3IK(root, target, l1, l2, pole) {
  const d = target.clone().sub(root); let L = d.length(); L = Math.min(L, l1 + l2 - 1e-3); d.normalize();
  const a = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const side = pole.clone().sub(d.clone().multiplyScalar(pole.dot(d))).normalize();
  return root.clone().add(d.multiplyScalar(a)).add(side.multiplyScalar(h));
}
// pose: { hand: { armL: [x,y,z], armR }, foot: { legL, legR }, pole: {...}, head: [rx, ry, rz], lean: [rx, rz], expr, gaze: [gx, gy] }
function c3Pose(ch, p) {
  if (p.lean) { ch.body.rotation.x = p.lean[0]; ch.body.rotation.z = p.lean[1] ?? 0; }
  if (p.head) ch.headG.rotation.set(p.head[0], p.head[1], p.head[2] ?? 0);
  for (const n of ['armL', 'armR', 'legL', 'legR']) {
    const L = ch.limbs[n], arm = n.startsWith('arm'), root = ch.joint[n].clone();
    const tgt = c3V(...((arm ? p.hand : p.foot)?.[n] ?? (arm ? [root.x * 1.3, 0.7, 0.3] : [root.x, -1.9, 0.5])));
    const [l1, l2] = arm ? ch.len.arm : ch.len.leg;
    const pole = c3V(...(p.pole?.[n] ?? (arm ? [Math.sign(root.x), -0.3, -1] : [0, 0.2, 1]))).normalize();
    const mid = c3IK(root, tgt, l1, l2, pole);
    c3Seg(L.a, root, mid, ch.LR); c3Seg(L.b, mid, tgt, ch.LR);
    L.j.position.copy(mid); L.j.scale.setScalar(ch.LR); L.r0.position.copy(root); L.r0.scale.setScalar(ch.LR);
    L.end.position.copy(tgt);
    if (arm) L.end.scale.set(0.17, 0.15, 0.15); else { L.end.scale.set(0.16, 0.12, 0.27); L.end.position.z += 0.08; }
  }
  const e = p.expr ?? 'neutral', gz = p.gaze ?? [0, 0];
  ch.faceMat.map = c3FaceTex(e, Math.round(gz[0] * 10) / 10, Math.round(gz[1] * 10) / 10); ch.faceMat.needsUpdate = true;
}

// ---- the refs' people are 2D cut-outs living in the 3D set: a billboard group facing the camera, built from
// layers (body, head disc with its soft glow, face decal, hair, ink-stroke limbs). Layer images come from Flow
// (assets spr_<kind>_<name>.png) and fall back to code-drawn look-alikes until those exist.
const C3_SPR = {};
function c3SprTex(key, draw, w = 512, h = 512) {
  const img = asset(`spr_${key}.png`);
  if (!C3_SPR[key]) C3_SPR[key] = c3Tex((x, cw, ch) => { if (img) x.drawImage(img, 0, 0, cw, ch); else draw(x, cw, ch); }, w, h);
  return C3_SPR[key];
}
// a Flow layer from the piece's assets (spr_<name>.png) as a texture plus its aspect (h / w), or null
const C3_IMG = {};
function c3Img(name) {
  if (name in C3_IMG) return C3_IMG[name];
  const img = asset(`spr_${name}.png`);
  if (!img) return (C3_IMG[name] = null);
  const t = new THREE.Texture(img); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.needsUpdate = true;
  return (C3_IMG[name] = { tex: t, aspect: (img.naturalHeight || img.height) / (img.naturalWidth || img.width) });
}
function c3HeadDisc(x, w, h, skin) {   // creamy disc, glow brighter at upper left, warm pink falloff low right, thick ink rim
  const c = skin ? [skin[0], skin[1], skin[2]] : ['#fffbe6', '#fdf0e2', '#f2d6d2'];
  const r = w * 0.44, cx = w / 2, cy = h / 2;
  const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r * 1.05);
  g.addColorStop(0, c[0]); g.addColorStop(0.6, c[1]); g.addColorStop(1, c[2]);
  x.beginPath(); x.ellipse(cx, cy, r, r * 0.96, 0, 0, TAU); x.fillStyle = g; x.fill();
  x.lineWidth = w * 0.035; x.strokeStyle = C3.ink; x.stroke();
}
function c3BodyBean(x, w, h, o) {   // flat bean torso with a soft side shade, collar, tie, pattern, ink rim
  const P = new Path2D(); const cx = w / 2;
  P.moveTo(cx, h * 0.04); P.bezierCurveTo(cx + w * 0.42, h * 0.04, cx + w * 0.44, h * 0.55, cx + w * 0.4, h * 0.82);
  P.bezierCurveTo(cx + w * 0.36, h * 0.98, cx - w * 0.36, h * 0.98, cx - w * 0.4, h * 0.82);
  P.bezierCurveTo(cx - w * 0.44, h * 0.55, cx - w * 0.42, h * 0.04, cx, h * 0.04); P.closePath();
  x.save(); x.clip(P);
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, o.shirt2 ?? o.shirt); g.addColorStop(0.55, o.shirt); g.addColorStop(1, o.shade ?? '#1c6a60');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  if (o.stripes) { x.fillStyle = o.stripes; for (let k = 0; k < 9; k++) x.fillRect(0, h * (0.14 + k * 0.095), w, h * 0.04); }
  if (o.pattern !== 'none') { const R = RNG('spat', o.key); x.fillStyle = o.patternColor ?? '#f4c430';
    for (let i = 0; i < 16; i++) { const px = R.r(w * 0.1, w * 0.9), py = R.r(h * 0.2, h * 0.92), s = w * 0.03; x.save(); x.translate(px, py); x.rotate(R.n(0.6));
      for (const d of [-1, 0, 1]) { x.beginPath(); x.ellipse(d * s * 0.6, -Math.abs(d) * s * 0.2, s * 0.32, s * 0.7, d * 0.5, 0, TAU); x.fill(); } x.restore(); } }
  if (o.collar !== false) { x.fillStyle = o.collar ?? '#ffffff'; x.beginPath(); x.moveTo(cx - w * 0.12, 0); x.lineTo(cx + w * 0.12, 0); x.lineTo(cx, h * 0.2); x.closePath(); x.fill(); }
  if (o.tie) { x.fillStyle = o.tie; x.beginPath(); x.moveTo(cx - w * 0.03, h * 0.03); x.lineTo(cx + w * 0.03, h * 0.03); x.lineTo(cx + w * 0.045, h * 0.42); x.lineTo(cx, h * 0.48); x.lineTo(cx - w * 0.045, h * 0.42); x.closePath(); x.fill(); x.strokeStyle = C3.ink; x.lineWidth = w * 0.01; x.stroke(); }
  x.strokeStyle = 'rgba(40,20,10,0.35)'; x.lineWidth = w * 0.012; x.beginPath(); x.moveTo(cx - w * 0.13, 0); x.lineTo(cx, h * 0.21); x.lineTo(cx + w * 0.13, 0); x.stroke();
  x.restore(); x.lineWidth = w * 0.03; x.strokeStyle = C3.ink; x.stroke(P);
}
function c3HairShape(x, w, h, o) {   // a messy glossy cap with a lilac highlight streak
  const cx = w / 2, cy = h * 0.5, r = w * 0.46, R = RNG('hair', o.key), long = o.hairStyle === 'long';
  const P = new Path2D(), n = long ? 9 : 13;
  P.moveTo(cx - r * 1.02, cy + r * (long ? 0.95 : 0.12));
  for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI, rr = r * (1.06 + (i % 2 ? R.r(0.05, 0.13) : 0));
    P.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.98); }
  P.lineTo(cx + r * 1.02, cy + r * (long ? 0.95 : 0.12));
  if (!long) { for (let i = 0; i <= 5; i++) P.lineTo(cx + r * (0.85 - i * 0.34), cy - r * (0.3 + (i % 2) * 0.12)); }
  else { P.lineTo(cx + r * 0.75, cy + r * 0.9); P.lineTo(cx + r * 0.7, cy - r * 0.35); P.lineTo(cx - r * 0.7, cy - r * 0.35); P.lineTo(cx - r * 0.75, cy + r * 0.9); }
  P.closePath();
  const g = x.createLinearGradient(0, cy - r, 0, cy + r * 0.3); g.addColorStop(0, o.hair2 ?? '#4a3226'); g.addColorStop(1, o.hair ?? '#24140f');
  x.fillStyle = g; x.fill(P); x.lineWidth = w * 0.03; x.lineJoin = 'round'; x.strokeStyle = C3.ink; x.stroke(P);
  x.save(); x.clip(P); x.strokeStyle = 'rgba(190,170,230,0.55)'; x.lineWidth = w * 0.05; x.lineCap = 'round';
  x.beginPath(); x.moveTo(cx - r * 0.55, cy - r * 0.62); x.quadraticCurveTo(cx - r * 0.1, cy - r * 0.92, cx + r * 0.3, cy - r * 0.8); x.stroke(); x.restore();
}
// a stepped "hop": holds a small random offset, then springs (with overshoot) to the next one every 10-18 frames
function c3Hop(key, t, amp) {
  if (!amp) return 0;
  const R = RNG('hopP', key), P = R.i(10, 18), ph = R.i(0, P), f = t * FPS + ph, k = Math.floor(f / P), u = (f - k * P) / 5;
  const v = (i) => RNG('hop', key, i).n(1);
  return amp * lerp(v(k - 1), v(k), u >= 1 ? 1 : EZ.back(u));
}
function c3Person(o = {}) {
  const key = o.key ?? 'p', g = new THREE.Group(), root = new THREE.Group(); g.add(root);
  const mat = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.08, depthWrite: true, toneMapped: false });
  const plane = (wd, ht, map, x, y, z, ro) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, ht), mat(map)); m.position.set(x, y, z); m.renderOrder = ro; root.add(m); return m; };
  const bodyH0 = o.bodyH ?? 3.0, bodyW0 = o.bodyW ?? 1.8, bodyW = bodyW0, HS = o.headS ?? 2.8;   // ref 6: torso 0.70 of the head's diameter
  const bImg = o.outfit && c3Img(`body_${o.outfit}`);
  const bodyH = bImg ? bodyW0 * (o.bodyAspect ?? 1.65) : bodyH0;   // ref 6: ~1 head diameter of torso shows under the head
  const body = plane(bodyW0, bodyH, bImg ? bImg.tex : c3SprTex(`body_${key}`, (x, w, h) => c3BodyBean(x, w, h, { key, ...o }), 512, 640), 0, bodyH / 2, 0, 1);
  const headG = new THREE.Group(); headG.position.set(0, bodyH + HS * 0.31, 0.02); root.add(headG);
  const hp = (wd, ht, map, z, ro) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, ht), mat(map)); m.position.z = z; m.renderOrder = ro; headG.add(m); return m; };
  const hImg = c3Img(`head_${o.skinKey ?? 'white'}`);
  hp(HS, HS * (hImg ? hImg.aspect : 1), hImg ? hImg.tex : c3SprTex(`head_${o.skinKey ?? 'white'}`, (x, w, h) => c3HeadDisc(x, w, h, o.skin)), 0, 2);
  const faceM = hp(HS * 1.2, HS * 1.2, c3FaceTex('neutral'), 0.024, 3);   // layers: head 0, beard/moustache 0.012, face 0.024, hair 0.032, glasses 0.04   // refs: eyes ~0.25 of the head's width apart
  // hair: the lit cap only (the dark back of the head cut away), glued to the head: the hairline measured in each
  // sprite (fraction from its top, at the centre columns) sits on the forehead at +0.24 D, as in ref 6 (D = disc diameter)
  const D = 0.915 * HS, hst = o.hairStyle ?? 'ref';
  const HAIR = { ref: ['hair_ref_cap', 1.09, 0.487], brown: ['hair_brown_cap', 1.05, 0.358], white: ['hair_white', 1.06, 0.55], long: ['hair_long_cap', 1.24, 0.236],
    side: ['hair_side_cap', 1.08, 0.358], spiky: ['hair_spiky_cap', 1.1, 0.743], messy: ['hair_messy_cap', 1.1, 0.635], swept: ['hair_swept_cap', 1.08, 0.494],
    neat: ['hair_neat', 1.06, 0.459], neat2: ['hair_neat2', 1.06, 0.477],
    // Ricks Clips library (2026-10-27, tools/slice_ricks.py): role hats and more hairstyles, same glue rule
    policecap: ['hair_policecap', 1.153, 0.438], beanie: ['hair_beanie', 1.075, 0.519], buckethat: ['hair_buckethat', 1.312, 0.525], redcap: ['hair_redcap', 1.114, 0.538],
    crown: ['hair_crown', 1.092, 0.497], scholar: ['hair_scholar', 1.097, 0.579], nightcap: ['hair_nightcap', 1.147, 0.52], beret: ['hair_beret', 1.171, 0.59],
    hardhat: ['hair_hardhat', 1.136, 0.649], cowboy: ['hair_cowboy', 1.113, 0.661], tophat: ['hair_tophat', 1.087, 0.764], bun: ['hair_bun', 1.217, 0.486],
    ponytail: ['hair_ponytail', 1.22, 0.52], bowl: ['hair_bowl', 1.058, 0.572], buzz: ['hair_buzz', 1.105, 0.446], baldsides: ['hair_baldsides', 1.15, 0.4],
    curlygrey: ['hair_curlygrey', 1.132, 0.531], ginger: ['hair_ginger', 1.103, 0.575], sidepart: ['hair_sidepart', 1.06, 0.53], tuft: ['hair_tuft', 1.068, 0.635],
    pigtails: ['hair_pigtails', 1.069, 0.369], afro: ['hair_afro', 1.059, 0.562], slick: ['hair_slick', 1.065, 0.527],
    // exact Ricks Clips hairstyles (2026-10-27, tools/slice_ricks2.py: one Flow copy per real character crop)
    rk_kyle: ['hair_rk_kyle', 1.06, 0.619], rk_bun: ['hair_rk_bun', 1.07, 0.445], rk_curly: ['hair_rk_curly', 1.2, 0.517], rk_genius: ['hair_rk_genius', 1.06, 0.446],
    rk_edison: ['hair_rk_edison', 1.06, 0.472], rk_darkbowl: ['hair_rk_darkbowl', 1.06, 0.402], rk_darkfringe: ['hair_rk_darkfringe', 1.06, 0.426],
    rk_brownshort: ['hair_rk_brownshort', 1.06, 0.388], rk_glasses: ['hair_rk_glasses', 1.06, 0.324], rk_boss: ['hair_rk_boss', 1.06, 0.451] };   // every style glued by its measured hairline (no floating hair)
  if (o.hair !== false && HAIR[hst] && c3Img(HAIR[hst][0])) {
    const [img, kw, hl] = HAIR[hst], im = c3Img(img), hw = D * kw * (o.hairW ?? 1), hh = hw * im.aspect;
    hp(hw, hh, im.tex, 0.032, 4).position.set(D * (o.hairX ?? 0), D * (0.24 + (o.hairUp ?? 0)) + hl * hh - hh / 2, 0.032);
  } else {
    const rImg = o.hair !== false && (c3Img(`hair_${hst}_cap`) || c3Img(`hair_${hst}`));
    if (rImg) { const hw = HS * (o.hairW ?? 1.0), hh = hw * rImg.aspect; hp(hw, hh, rImg.tex, 0.02, 4).position.set(HS * (o.hairX ?? 0), HS * (o.hairBottom ?? { bald: -0.12 }[hst] ?? -0.13) + hh / 2, 0.02); }
    else if (o.hair !== false) hp(2.6, 2.6, c3SprTex(`hair_${o.hairKey ?? key}`, (x, w, h) => c3HairShape(x, w, h, { key, ...o })), 0.02, 4).position.y = 0.42;
  }
  // facial hair and glasses (Flow, front view), fitted to the measured face: eyes at +0.045 D, 0.24 D apart; mouth at -0.165 D.
  // beards and moustaches sit BEHIND the face layer (z 0.005 < 0.01) so a smile or a grin is always drawn over them;
  // glasses sit in front. [sprite, width (D), y of the plane's centre (D), z]
  const FXL = {
    glasses: ['fx_glasses_round', 0.508, 0.045, 0.04], glasses_square: ['fx_glasses_square', 0.52, 0.045, 0.04],
    beard: ['fx_stubble', 1.0, -0.24, 0.012, 1.12], stubble: ['fx_stubble', 1.0, -0.24, 0.012, 1.12],   // chin band stretched to the face's width (user); 5th value = vertical stretch
    beard_full: ['fx_beard_full', 1.0, -0.165 - 0.132 * 1.0, 0.012],
    mustache: ['fx_mustache2', 0.27, -0.098, 0.014], mustache_grey: ['fx_mustache_grey', 0.26, -0.094, 0.014],   // right above the mouth (user)
  };
  const glassM = [];
  for (const f of o.fx ?? []) { const L = FXL[f]; const im = L && c3Img(L[0]); if (!im) continue; const m = hp(D * L[1], D * L[1] * im.aspect * (L[4] ?? 1), im.tex, L[3], L[3] > 0.03 ? 5 : 2); m.position.set(0, D * L[2], L[3]); if (f.startsWith('glasses')) glassM.push(m); }
  const extras = {};
  for (const [n, w, x, y] of [['sweat', 0.45, 0.95, 0.55], ['tears', 1.3, 0, -0.35], ['anger', 0.6, 0.85, 0.85], ['blush', 1.5, 0, -0.18], ['sparkle', 0.8, 1.15, 0.9], ['question', 0.6, 1.2, 1.2], ['exclaim', 0.45, 1.15, 1.25], ['stars', 1.8, 0, 1.25], ['smoke', 1.0, 1.0, 1.4]]) {
    const im = c3Img(`x_${n}`); if (!im) continue; const m = hp(w, w * im.aspect, im.tex, 0.05, 6); m.position.set(x, y, 0.05); m.visible = false; extras[n] = m;
  }
  const limbM = new THREE.MeshBasicMaterial({ color: o.limbColor ?? C3.ink, toneMapped: false, side: THREE.DoubleSide });
  const quad = new THREE.PlaneGeometry(1, 1), disc = new THREE.CircleGeometry(0.5, 16), limbs = {};
  for (const n of ['armL', 'armR', 'legL', 'legR']) {
    const z = n.startsWith('leg') ? -0.01 : 0.015, ro = n.startsWith('leg') ? 0 : 5;
    // a limb is one smooth ink stroke (a ribbon along a curve through shoulder, elbow, hand), like the refs' bent arms and legs
    const N = 16, geo = new THREE.BufferGeometry(), idx = [];
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 2 * 3), 3));
    for (let k = 0; k < N; k++) idx.push(2 * k, 2 * k + 1, 2 * k + 2, 2 * k + 1, 2 * k + 3, 2 * k + 2);
    geo.setIndex(idx);
    const L = { rib: new THREE.Mesh(geo, limbM), r0: new THREE.Mesh(disc, limbM), e: new THREE.Mesh(disc, limbM), z, N, arm: n.startsWith('arm') };
    L.rib.frustumCulled = false;
    [L.rib, L.r0, L.e].forEach((m) => { m.position.z = z; m.renderOrder = ro; root.add(m); }); limbs[n] = L;
  }
  // a soft contact shadow on the floor (not a billboard)
  // under the FEET, very soft (user): a radial-gradient blob placed at the lowest foot each frame
  C3_SPR.__shadow ||= c3Tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 128, 128, false);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: C3_SPR.__shadow, transparent: true, depthWrite: false, toneMapped: false, opacity: o.shadow ?? 0.7 }));
  sh.rotation.x = -Math.PI / 2; sh.scale.set(1.9, 0.7, 1); sh.renderOrder = -1; sh.visible = o.shadow !== 0; root.add(sh);
  return { g, root, body, headG, faceM, glassM, limbs, extras, shadow: sh, key, bodyH, bodyW, LW: o.limbW ?? 0.125,
    HS, joint: { armL: [bodyW * 0.4, bodyH * 0.74], armR: [-bodyW * 0.4, bodyH * 0.74], legL: [bodyW * 0.2, bodyH * 0.12], legR: [-bodyW * 0.2, bodyH * 0.12] },
    len: { arm: [1.15, 1.15], leg: [1.7, 1.7] } };
}
// 2D two-bone IK in the billboard plane (local x right, y up from the hips).
// o: { hand: { armL: [x, y] }, foot: {...}, bend: { armL: 1 | -1 }, head: [tilt, dx, dy], lean, expr, gaze, idle }
function c3PersonPose(p, cam, t, o = {}) {
  const wp = new THREE.Vector3(); p.g.getWorldPosition(wp);   // face the camera, upright
  let ry = 0; for (let q = p.g; q; q = q.parent) ry += q.rotation.y;
  p.root.rotation.y = Math.atan2(cam.position.x - wp.x, cam.position.z - wp.z) - ry;
  // every part moves on its own (refs): small stepped "hops" — each part holds an offset, then springs to a new one
  // with a little overshoot every 0.33-0.6 s — plus a slow breath. o.lift(t) is a whole-body jolt (e.g. a surprise):
  // the body takes it first, the hands 1 frame later and the head 3 frames later (follow-through).
  const idle = o.idle === false ? 0 : (o.idle ?? 1), lift = o.lift || (() => 0), lagT = (f) => t - f / FPS;
  const hop = (part, amp) => c3Hop(p.key + part, t, amp * idle);
  const br = idle * Math.sin(t * 2.2 + RNG('idle', p.key).r(0, TAU));
  const bLift = lift(t), hLift = lift(lagT(3)), aLift = lift(lagT(1));
  p.body.scale.set(1 - br * 0.006, 1 + br * 0.012, 1);
  p.body.position.set(hop('bx', 0.025), p.bodyH / 2 * (1 + br * 0.012) + hop('by', 0.03) + bLift, 0);
  p.body.rotation.z = hop('br', 0.012);
  const hd = o.head ?? [0, 0, 0];
  p.headG.position.set((hd[1] ?? 0) + hop('hx', 0.04), p.bodyH * (1 + br * 0.012) + p.HS * 0.31 + (hd[2] ?? 0) + hop('hy', 0.04) + hLift, 0.02);
  p.headG.rotation.z = (hd[0] ?? 0) + hop('ht', 0.035);
  p.root.rotation.z = o.lean ?? 0;
  const hopHand = { armL: [hop('lx', 0.05), hop('ly', 0.05) + aLift], armR: [hop('rx', 0.05), hop('ry', 0.05) + aLift], legL: [0, 0], legR: [0, 0] };
  const jointLift = { armL: bLift, armR: bLift, legL: bLift, legR: bLift };
  for (const n of ['armL', 'armR', 'legL', 'legR']) {
    const L = p.limbs[n], arm = n.startsWith('arm'), [jx, jy0] = p.joint[n], [l1, l2] = arm ? p.len.arm : p.len.leg;
    const jy = jy0 + jointLift[n] + (arm ? p.body.position.y - p.bodyH / 2 - bLift : 0);   // shoulders ride on the body
    const t0 = (arm ? o.hand : o.foot)?.[n] ?? (arm ? [jx * 1.35, jy0 - 1.7] : [jx * 1.2, -2.4]);
    const tgt = [t0[0] + hopHand[n][0], t0[1] + hopHand[n][1]];
    let dx = tgt[0] - jx, dy = tgt[1] - jy; const d = Math.hypot(dx, dy) || 1e-3, D = Math.min(d, l1 + l2 - 1e-3); dx /= d; dy /= d;
    const a = (l1 * l1 - l2 * l2 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    // elbows and knees always bend AWAY from the body (outward, and down for elbows), whatever the reach direction
    const side = Math.sign(jx) || 1, cand = [1, -1].map((bd) => [jx + dx * a - dy * h * bd, jy + dy * a + dx * h * bd]);
    const score = ([x, y]) => (x - jx) * side - (arm ? (y - jy) * 0.6 : 0);
    const [mx, my] = o.bend?.[n] ? cand[o.bend[n] > 0 ? 0 : 1] : (score(cand[0]) >= score(cand[1]) ? cand[0] : cand[1]);
    const ex = jx + dx * D, ey = jy + dy * D;
    // quadratic curve that passes through the elbow/knee: control = 2*mid - (start+end)/2, softened toward a gentle bow
    const cx = 2 * mx - (jx + ex) / 2, cy = 2 * my - (jy + ey) / 2, kx = lerp((jx + ex) / 2, cx, 0.45), ky = lerp((jy + ey) / 2, cy, 0.45);   // a gentle bow, never a loop
    const pos = L.rib.geometry.attributes.position, hw = p.LW / 2, Pt = (u) => [(1 - u) * (1 - u) * jx + 2 * (1 - u) * u * kx + u * u * ex, (1 - u) * (1 - u) * jy + 2 * (1 - u) * u * ky + u * u * ey];
    for (let k = 0; k <= L.N; k++) {
      const u = k / L.N, [x, y] = Pt(u), [x2, y2] = Pt(Math.min(1, u + 0.01)), [x1, y1] = Pt(Math.max(0, u - 0.01));
      let tx = x2 - x1, ty = y2 - y1; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      pos.setXYZ(2 * k, x - ty * hw, y + tx * hw, 0); pos.setXYZ(2 * k + 1, x + ty * hw, y - tx * hw, 0);
    }
    pos.needsUpdate = true; L.rib.geometry.computeBoundingSphere();
    L.r0.position.set(jx, jy, L.z); L.r0.scale.setScalar(p.LW);
    if (arm) { L.e.position.set(ex, ey, L.z); L.e.scale.set(p.LW * 2.9, p.LW * 2.9, 1); L.e.rotation.z = 0; }   // big round fists (ref)
    else {   // small dark shoes: an oval pointing out to the side, the ankle at its back end
      const out = Math.sign(ex - jx) || Math.sign(jx) || 1;
      L.e.position.set(ex + out * p.LW * 0.75, ey - p.LW * 0.35, L.z + 0.002); L.e.scale.set(p.LW * 3.4, p.LW * 1.9, 1); L.e.rotation.z = out * 0.12;
    }
  }
  { const fl = p.limbs.legL.e.position, fr = p.limbs.legR.e.position;   // the shadow sits on the floor under the feet
    p.shadow.position.set((fl.x + fr.x) / 2, Math.min(fl.y, fr.y) - p.LW * 0.9, 0.0); p.shadow.scale.set(Math.abs(fl.x - fr.x) + 1.1, 0.55, 1);
    if (o.shadowY != null) p.shadow.position.y = o.shadowY; }
  for (const [n, m] of Object.entries(p.extras)) m.visible = (o.x ?? []).includes(n);
  // wide ringed eyes (grin, panic...) are bigger than the lenses: the glasses grow to frame them
  const wide = ['grin', 'surprised', 'panic', 'scared', 'screaming', 'shocked', 'starstruck', 'love', 'dizzy'].includes(o.expr);
  p.glassM.forEach((m) => m.scale.setScalar(wide ? 1.5 : 1));
  const gz = o.gaze ?? [0, 0];
  p.faceM.material.map = c3FaceTex(o.expr ?? 'neutral', Math.round(gz[0] * 10) / 10, Math.round(gz[1] * 10) / 10); p.faceM.material.needsUpdate = true;
}

// ---- renderer and the pass pipeline
const C3R = { r: null, cv: null };
function c3Renderer() {
  if (C3R.r) return C3R;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;   // props are tone-mapped; people, ink and faces are not
  C3R.r = r; C3R.cv = cv; C3R.black = new THREE.MeshBasicMaterial({ color: 0x000000 }); C3R.glowM = {};
  return C3R;
}
// o: { bg: '#hex', bgBlur, nearBlur, glow (0..1), glowBlur }
function c3Render(scene, cam, o = {}) {
  const { r, cv } = c3Renderer();
  if (C3_VIVID) o = Object.assign({}, o, { bgBlur: (o.bgBlur ?? 0) * C3_VIVID.bgBlur, glow: (o.glow ?? 0) * C3_VIVID.glow, glowBlur: Math.min(o.glowBlur ?? 18, C3_VIVID.glowBlur) });
  if (C3_SHADOW) {   // shadow maps only see objects on the CAMERA's layers: build them once per frame with every layer on
    c3ShadowSetup(scene); r.shadowMap.autoUpdate = false; r.shadowMap.needsUpdate = true;
    const km = cam.layers.mask; cam.layers.enableAll(); r.setClearColor(0x000000, 0); r.render(scene, cam); cam.layers.mask = km;
  }
  ctx.save(); screen();
  // 1. background: drawn sharp, then blurred on top (so the blur never shows transparent edges)
  cam.layers.set(C3.L_BG); r.setClearColor(o.bg ?? '#000000', 1); r.render(scene, cam);
  ctx.filter = o.grade ?? 'saturate(1.3) contrast(1.06)'; ctx.drawImage(cv, 0, 0, W, H); ctx.filter = 'none';
  if ((o.bgBlur ?? 0) > 0.3) { ctx.filter = `blur(${o.bgBlur.toFixed(2)}px) ${o.grade ?? 'saturate(1.3) contrast(1.06)'}`; ctx.drawImage(cv, 0, 0, W, H); ctx.filter = 'none'; }
  if (C3_INK2) c3EdgePass(scene, cam, C3.L_BG, o.bgBlur ?? 0);   // Ricks marker ink on the background
  // 2. the subject layer, sharp
  cam.layers.set(C3.L_FOCUS); r.setClearColor(0x000000, 0); r.render(scene, cam); ctx.drawImage(cv, 0, 0, W, H);
  if (C3_INK2) c3EdgePass(scene, cam, C3.L_FOCUS, 0);
  // 3. emissive glow: emitters in their glow colour, everything else black; blurred and added
  if ((o.glow ?? 0) > 0) {
    const swap = [];
    scene.traverse((m) => { if (!m.isMesh) return; swap.push([m, m.material]);
      const gc = m.material.userData && m.material.userData.glow;
      m.material = gc ? (C3R.glowM[gc] ||= new THREE.MeshBasicMaterial({ color: gc })) : C3R.black; });
    cam.layers.enable(C3.L_BG); cam.layers.enable(C3.L_FOCUS); cam.layers.enable(C3.L_NEAR);
    r.setClearColor(0x000000, 1); r.render(scene, cam);
    swap.forEach(([m, mat]) => { m.material = mat; });
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.glow;
    ctx.filter = `blur(${(o.glowBlur ?? 18).toFixed(1)}px)`; ctx.drawImage(cv, 0, 0, W, H);
    ctx.filter = `blur(${((o.glowBlur ?? 18) * 3).toFixed(1)}px)`; ctx.globalAlpha = o.glow * 0.6; ctx.drawImage(cv, 0, 0, W, H);
    ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // 4. near layer (foreground props), blurred
  cam.layers.set(C3.L_NEAR); r.setClearColor(0x000000, 0); r.render(scene, cam);
  if ((o.nearBlur ?? 0) > 0.3) ctx.filter = `blur(${o.nearBlur.toFixed(2)}px)`;
  ctx.drawImage(cv, 0, 0, W, H); ctx.filter = 'none';
  // 5. bloom (refs): the bright parts — white heads, lamps, signs — bleed a soft warm glow over everything around them
  if (C3_HD && o.bloom == null) o = Object.assign({}, o, { bloom: 0.2 }); else if (C3_HD) o = Object.assign({}, o, { bloom: o.bloom * 0.6 });   // HD: less haze
  if (C3_VIVID) o = Object.assign({}, o, { bloom: Math.min(o.bloom ?? 0, C3_VIVID.bloom) });   // VIVID: no milky bloom veil
  if ((o.bloom ?? 0.32) > 0) {
    const b = C3R.bloom ||= Object.assign(document.createElement('canvas'), { width: W / 4, height: H / 4 }), bx = b.getContext('2d');
    bx.filter = 'brightness(0.95) contrast(2.4) saturate(1.2)'; bx.clearRect(0, 0, b.width, b.height); bx.drawImage(ctx.canvas, 0, 0, b.width, b.height); bx.filter = 'none';
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = o.bloom ?? 0.32; ctx.filter = 'blur(10px)'; ctx.drawImage(b, 0, 0, W, H);
    ctx.globalAlpha = (o.bloom ?? 0.32) * 0.6; ctx.filter = 'blur(28px)'; ctx.drawImage(b, 0, 0, W, H);
    ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}
function c3SetCam(cam, c) { cam.fov = c.fov; cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateProjectionMatrix(); }

// ---- colour looks measured on the 7 refs (per shot: mean luminance 0.3-0.6, whites rarely clipped, shadows tinted):
// the whole composited frame is graded once (people included: white heads take the scene's light)
const C3_LOOKS = {
  warmInterior: { f: 'brightness(0.80) contrast(1.12) saturate(1.18)', shadow: [46, 12, 10], high: [255, 232, 200] },   // ref 6 casino, ref 2
  warmDay:      { f: 'brightness(0.88) contrast(1.08) saturate(1.08)', shadow: [58, 34, 48], high: [255, 238, 214] },   // ref 1 / 4 kitchens
  dayExterior:  { f: 'brightness(0.93) contrast(1.06) saturate(1.0)',  shadow: [30, 42, 112], high: [246, 248, 255] },  // ref 7 daylight
  night:        { f: 'brightness(0.80) contrast(1.14) saturate(1.15)', shadow: [6, 10, 42], high: [232, 228, 255] },   // lighter tint: the stronger one left a blue-violet haze on faces   // ref 1 t33, ref 7 t36
  golden:       { f: 'brightness(0.90) contrast(1.06) saturate(1.12)', shadow: [64, 36, 44], high: [255, 222, 172] },   // ref 1 t46, ref 3 t30
  storm:        { f: 'brightness(0.72) contrast(1.10) saturate(0.9)',  shadow: [26, 32, 70], high: [212, 220, 236] },
};
// C3_HD (set true by a piece, 2026-10-25): the refs measure ~6x sharper with whites at 88-98 L; the plain looks capped
// whites near 80 and the shadow 'screen' lifted a haze. HD keeps the hue of each look but with lighter tints, then c3Crisp.
let C3_HD = false;
// C3_VIVID (2026-10-29, measured on 30 Ricks frames vs slow-checkout): ours read milky — dark-channel haze 41 vs Ricks 31,
// mean L 68 vs 60, mean saturation 37 vs 43, sharpness 114 vs 136. Cause: the look's shadow 'screen' tint + warm highlight
// multiply (a cream veil), the bloom pass and wide glow/bg blur. VIVID drops the screen tint, keeps only a hint of the
// light tint, grades with one clean exposure/contrast/saturation filter and caps bloom/glow/blur. Opt-in: a piece sets
// `C3_VIVID = C3_VIVID_DEF` (or its own object) in shots.js; older pieces are unchanged.
let C3_VIVID = null;
const C3_VIVID_DEF = { b: 0.9, c: 1.2, s: 1.2, vib: 1.6, tint: 0, bloom: 0.04, glow: 0.55, glowBlur: 10, bgBlur: 0.55 };
// vibrance: pale-but-tinted surfaces (cream walls, beige floors) gain colour, strong colours barely move (no clipping) and
// neutral whites/greys (the white heads) stay neutral — gain = vib * sat * (1 - sat)^2 per pixel
function c3Vibrance(k) {
  if (!(k > 0)) return;
  const im = ctx.getImageData(0, 0, W, H), d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx < 8) continue;
    const s = (mx - mn) / mx, a = k * s * (1 - s) * (1 - s); if (a < 0.01) continue;
    const l = 0.299 * r + 0.587 * g + 0.114 * b, f = 1 + a;
    d[i] = l + (r - l) * f; d[i + 1] = l + (g - l) * f; d[i + 2] = l + (b - l) * f;   // Uint8Clamped clamps
  }
  ctx.putImageData(im, 0, 0);
}
function c3Look(name) {
  const L = C3_LOOKS[name]; if (!L) return;
  const b = C3R.lookCv ||= Object.assign(document.createElement('canvas'), { width: W, height: H }), bx = b.getContext('2d');
  if (C3_VIVID) {
    const V = C3_VIVID, hiV = L.high.map((v) => Math.round(255 - (255 - v) * V.tint));
    bx.filter = `brightness(${V.b}) contrast(${V.c}) saturate(${V.s})`; bx.clearRect(0, 0, W, H); bx.drawImage(ctx.canvas, 0, 0); bx.filter = 'none';
    ctx.save(); screen(); ctx.globalCompositeOperation = 'copy'; ctx.drawImage(b, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${hiV})`; ctx.fillRect(0, 0, W, H);   // a hint of the look's light colour only
    ctx.restore(); c3Vibrance(V.vib); return;
  }
  const f = C3_HD ? L.f.replace(/brightness\(([\d.]+)\)/, (m, v) => `brightness(${(1 - (1 - v) * 0.35).toFixed(3)})`).replace(/contrast\(([\d.]+)\)/, (m, v) => `contrast(${(+v + 0.06).toFixed(2)})`) : L.f;
  const sh = C3_HD ? L.shadow.map((v) => Math.round(v * 0.4)) : L.shadow, hi = C3_HD ? L.high.map((v) => Math.round(255 - (255 - v) * 0.45)) : L.high;
  // C3_RICKS (2026-10-27, measured on 24 Ricks Clips frames): median L 47 vs ours 74, highlights 1.5 % vs 11 %, deep
  // shadows 10 % vs 2 %, saturation 36 vs 46 — Ricks is darker and moodier with real shadows: pull exposure down, contrast up
  const rk = typeof C3_RICKS !== 'undefined' && C3_RICKS ? ` brightness(${C3_RICKS.b ?? 0.82}) contrast(${C3_RICKS.c ?? 1.14}) saturate(${C3_RICKS.s ?? 0.9})` : '';
  bx.filter = f + rk; bx.clearRect(0, 0, W, H); bx.drawImage(ctx.canvas, 0, 0); bx.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'copy'; ctx.drawImage(b, 0, 0);
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgb(${sh})`; ctx.fillRect(0, 0, W, H);      // tints the shadows most
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${hi})`; ctx.fillRect(0, 0, W, H);    // tints the lights
  ctx.restore();
}
// crisp finish (HD): an unsharp kernel over the whole frame, before vignette/grain/subtitles
function c3Crisp(k = 0.45) {
  if (k <= 0) return;
  if (!document.getElementById('c3sharp')) document.body.insertAdjacentHTML('beforeend',
    `<svg width="0" height="0" style="position:absolute"><filter id="c3sharp" color-interpolation-filters="sRGB"><feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 ${-k} 0 ${-k} ${1 + 4 * k} ${-k} 0 ${-k} 0"/></filter></svg>`);
  const b = C3R.crispCv ||= Object.assign(document.createElement('canvas'), { width: W, height: H }), bx = b.getContext('2d');
  bx.clearRect(0, 0, W, H); bx.drawImage(ctx.canvas, 0, 0);
  ctx.save(); screen(); ctx.globalCompositeOperation = 'copy'; ctx.filter = 'url(#c3sharp)'; ctx.drawImage(b, 0, 0); ctx.restore();
}
// ---- 2D finishing: vignette, grain, one-word subtitles
function c3Vignette(a = 0.3) {
  ctx.save(); screen(); const g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.5, H * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(18,8,4,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
const C3_GRAIN = [];
function c3Grain(a = 0.05) {
  if (a <= 0) return;
  if (!C3_GRAIN.length) for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), im = x.createImageData(256, 256), R = RNG('grain', k);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + R.n(60); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); C3_GRAIN.push(c);
  }
  ctx.save(); screen(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a;
  const R = RNG('grainF', F); ctx.fillStyle = ctx.createPattern(C3_GRAIN[F % 4], 'repeat'); ctx.translate(-R.r(0, 256), -R.r(0, 256)); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
// the word on screen at t: each word from its start until the next word starts (a gap > 0.35 s clears it)
function c3WordAt(words, t) {
  for (let i = 0; i < words.length; i++) {
    const w = words[i], nx = words[i + 1];
    if (t < w.s) return null;
    const end = nx ? (nx.s - w.e > 0.35 ? w.e + 0.12 : nx.s) : w.e + 0.4;
    if (t < end) return w.w;
  }
  return null;
}
function c3Subtitle(words, t) {
  const w = c3WordAt(words, t); if (!w) return;
  const txt = w.replace(/[.,!?;:"]+$/g, '').replace(/^["]+/, '');
  ctx.save(); screen(); ctx.font = `900 80px ${C3.sub}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const y = H * C3.subY;
  ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 18; ctx.strokeText(txt, CX, y);   // thick dark outline (user)
  ctx.shadowColor = 'transparent'; ctx.fillStyle = '#ffffff'; ctx.fillText(txt, CX, y);
  ctx.restore();
}

// =====================================================================
const STYLE = {
  name: 'cartoon3d',
  paper: '#1a0f0a',
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); },
  heroColor: '#ffffff',
  post() {},
  ones: true,
};

// =====================================================================
//  RICKS LOOK (2026-10-27, from Ricks Clips frames: Ref 3D cartoon animations/ricks) — skies, clouds, soft shading,
//  detailed exteriors. Measured on PLe2Gu3FDuA t17: sky top (107,155,208) -> mid (180,212,238) -> horizon (238,234,222);
//  clouds are flat-bottomed clusters of round bumps: body (236,236,244), each bump shaded lower-right in lavender
//  (200,204,228), a thin cool rim (165,180,214) on the shadow side, soft edges.
// =====================================================================
const C3_SKY = {
  day:    { top: '#6b9bd0', mid: '#b4d4ee', hor: '#eeeade', body: '#ececf4', shade: '#c8cce4', rim: '#a5b4d6' },
  golden: { top: '#e88a5a', mid: '#f6b880', hor: '#ffe6b0', body: '#fff0dc', shade: '#e8b0a8', rim: '#c88a9a' },
  dusk:   { top: '#3a3a86', mid: '#a86aa0', hor: '#f6a070', body: '#f4c8d0', shade: '#a880b0', rim: '#7a6098' },
  night:  { top: '#1a2050', mid: '#3a4a8a', hor: '#6a6aa0', body: '#c8c8ea', shade: '#8a8ac0', rim: '#5a5a98' },
};
// one Ricks cloud painted into a 2D context: (cx, cy) = centre of its flat bottom, w = width, R = RNG, p = palette
function c3PaintCloud(x, cx, cy, w, R, p, o = {}) {
  const n = o.bumps ?? Math.round(R.r(4, 7)), bumps = [];
  for (let i = 0; i < n; i++) {   // big bumps in the middle, small ones at the ends; bottoms clipped flat
    const u = (i + 0.5) / n, edge = 1 - Math.abs(u - 0.5) * 2, r = w * (0.11 + 0.13 * edge) * R.r(0.85, 1.15);
    bumps.push([cx - w / 2 + u * w, cy - r * R.r(0.35, 0.75) - edge * w * 0.06, r]);
  }
  for (let i = 0; i < Math.round(n / 2); i++) { const u = R.r(0.25, 0.75), r = w * R.r(0.12, 0.2); bumps.push([cx - w / 2 + u * w, cy - w * R.r(0.16, 0.26), r]); }
  const shape = (dx, dy, k) => { x.beginPath(); for (const [bx, by, r] of bumps) { x.moveTo(bx + dx + r * k, by + dy); x.arc(bx + dx, by + dy, r * k, 0, TAU); } };
  x.save(); x.beginPath(); x.rect(cx - w, cy - w, w * 2, w); x.clip();   // flat bottom
  x.filter = 'blur(1.2px)';
  x.fillStyle = p.rim; shape(w * 0.012, w * 0.01, 1.02); x.fill();                         // thin cool rim on the shade side
  x.fillStyle = p.shade; shape(0, 0, 1); x.fill();                                           // shaded body
  x.fillStyle = p.body; shape(-w * 0.03, -w * 0.035, 0.9); x.fill();                         // lit bumps (shade shows lower-right)
  x.globalAlpha = 0.55; x.fillStyle = '#ffffff'; shape(-w * 0.05, -w * 0.06, 0.6); x.fill(); // top highlights
  x.globalAlpha = 1; x.filter = 'none';
  x.restore();
}
// equirect sky texture for a BackSide sphere: Ricks gradient + a band of clouds (and optional sun/moon). Deterministic.
// o: { mood: 'day'|'golden'|'dusk'|'night', seed, clouds: count, band: [v0, v1] (0 = top, 0.5 = horizon), sun: [u, v, r] }
function c3SkyTex(o = {}) {
  const p = Object.assign({}, C3_SKY[o.mood ?? 'day'], o.pal || {});
  return c3Tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, p.top); g.addColorStop(o.midAt ?? 0.4, p.mid); g.addColorStop(0.5, p.hor); g.addColorStop(1, p.hor);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (o.sun) { const [u, v, r] = o.sun, sg = x.createRadialGradient(u * w, v * h, 0, u * w, v * h, r * 6); sg.addColorStop(0, 'rgba(255,250,230,1)'); sg.addColorStop(0.18, 'rgba(255,240,200,0.9)'); sg.addColorStop(1, 'rgba(255,230,180,0)'); x.fillStyle = sg; x.fillRect(0, 0, w, h); }
    const R = RNG('c3sky', o.seed ?? 1), [v0, v1] = o.band ?? [0.2, 0.47], n = o.clouds ?? 14;
    const list = [...Array(n)].map(() => ({ u: R.r(0, 1), v: R.r(v0, v1), s: R.r(0.6, 1.25) })).sort((a, b) => a.v - b.v);
    for (const c of list) { const cw = w * 0.07 * (o.scale ?? 1) * c.s * (0.6 + (c.v - v0) / (v1 - v0 + 1e-6) * 0.6); for (const du of [0, -1, 1]) c3PaintCloud(x, (c.u + du) * w, c.v * h, cw, RNG('c3cl', Math.round(c.u * 1e5)), p); }
  }, 4096, 2048);
}
// a cloud as a 3D billboard card (BG layer by default) for parallax near the horizon; drift it with .position
function c3Cloud(o = {}) {
  const p = Object.assign({}, C3_SKY[o.mood ?? 'day'], o.pal || {}), R = RNG('c3cloud', o.seed ?? 1);
  const t = c3Tex((x, w, h) => c3PaintCloud(x, w / 2, h * 0.92, w * 0.82, R, p), 1024, 512);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
  m.material.toneMapped = false; m.scale.set(o.size ?? 40, (o.size ?? 40) / 2, 1); m.renderOrder = -1; return m;
}
// a field of billboard clouds around (0,0,0): keep them facing the camera each frame with c3CloudsFace(group, cam)
function c3Clouds(o = {}) {
  const g = new THREE.Group(), R = RNG('c3clouds', o.seed ?? 1), n = o.n ?? 10;
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? -0.9) + ((o.a1 ?? 0.9) - (o.a0 ?? -0.9)) * (i + R.r(0, 0.8)) / n, d = R.r(o.d0 ?? 300, o.d1 ?? 520);
    const c = c3Cloud({ mood: o.mood, pal: o.pal, seed: (o.seed ?? 1) * 100 + i, size: R.r(o.s0 ?? 50, o.s1 ?? 110) });
    c.position.set(Math.sin(a) * d, R.r(o.y0 ?? 40, o.y1 ?? 140), -Math.cos(a) * d); c.userData.base = c.position.clone(); g.add(c);
  }
  return g;
}
function c3CloudsFace(g, cam, t = 0, drift = 1.2) { g.children.forEach((c, i) => { c.position.copy(c.userData.base); c.position.x += drift * t * (0.6 + (i % 3) * 0.2); c.quaternion.copy(cam.quaternion); }); }

// ---- soft shading (Ricks): every surface carries a gentle vertical gradient — lit and warm on top, a little darker
// and cooler towards the bottom (soft AO where things meet the ground). Opt-in per object: c3Shade(obj, { dark, cool }).
function c3Shade(obj, o = {}) {
  if (obj.userData.shaded) return obj; obj.userData.shaded = true;
  const dark = o.dark ?? 0.22, cool = new THREE.Color(o.cool ?? '#8a9ad0'), warm = new THREE.Color(o.warm ?? '#fff6e8');
  obj.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(obj), y0 = box.min.y, y1 = Math.max(box.max.y, y0 + 1e-3);
  obj.traverse((m) => {
    if (!m.isMesh || !m.geometry || !m.geometry.attributes.position || m.userData.hull || m.userData.noShade || m.material?.isShaderMaterial || m.material?.transparent) return;
    const pos = m.geometry.attributes.position, col = new Float32Array(pos.count * 3), v = new THREE.Vector3(), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); const h = clamp((v.y - y0) / (y1 - y0)), ao = Math.pow(1 - h, 2.2);
      c.setRGB(1, 1, 1).lerp(cool, ao * dark * 1.4).lerp(warm, h * 0.25).multiplyScalar(1 - ao * dark);
      col.set([c.r, c.g, c.b], i * 3);
    }
    m.geometry = m.geometry.clone(); m.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    m.material = mats.map((mt) => { const n = mt.clone(); n.vertexColors = true; return n; }); if (m.material.length === 1) m.material = m.material[0];
  });
  return obj;
}

// ---- surface textures (Ricks: every wall has a material — siding boards, brick, shingles, plaster, paving, wood)
const c3Shd = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
function c3TexWall(kind, color, o = {}) {
  const t = c3Tex((x, w, h) => {
    const R = RNG('c3wall', kind + color); x.fillStyle = color; x.fillRect(0, 0, w, h);
    if (kind === 'siding') { const n = 12; for (let i = 0; i < n; i++) { const y = i * h / n; const g = x.createLinearGradient(0, y, 0, y + h / n); g.addColorStop(0, c3Shd(color, 1.06)); g.addColorStop(0.85, color); g.addColorStop(1, c3Shd(color, 0.72)); x.fillStyle = g; x.fillRect(0, y, w, h / n); } }
    else if (kind === 'brick') { const rows = 16, cols = 6; x.fillStyle = c3Shd(color, 0.62); x.fillRect(0, 0, w, h);
      for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) { const bx = (i + (j % 2) * 0.5) * w / cols + 3, by = j * h / rows + 3; x.fillStyle = c3Shd(color, R.r(0.88, 1.1)); x.fillRect(bx, by, w / cols - 6, h / rows - 6); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(bx, by, w / cols - 6, 3); } }
    else if (kind === 'shingle') { const rows = 10, cols = 8; for (let j = 0; j < rows; j++) for (let i = -1; i <= cols; i++) { const bx = (i + (j % 2) * 0.5) * w / cols, by = j * h / rows, bw = w / cols, bh = h / rows;
        x.fillStyle = c3Shd(color, R.r(0.86, 1.08)); x.beginPath(); x.moveTo(bx + 1, by); x.lineTo(bx + bw - 1, by); x.lineTo(bx + bw - 1, by + bh * 0.8); x.quadraticCurveTo(bx + bw / 2, by + bh * 1.15, bx + 1, by + bh * 0.8); x.fill();
        x.fillStyle = c3Shd(color, 0.6); x.fillRect(bx, by + bh - 4, bw, 4); } }
    else if (kind === 'paving') { const n = 8; x.fillStyle = c3Shd(color, 0.7); x.fillRect(0, 0, w, h); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = c3Shd(color, R.r(0.9, 1.08)); x.fillRect(i * w / n + 3, j * h / n + 3, w / n - 6, h / n - 6); } }
    else if (kind === 'wood') { for (let i = 0; i < 6; i++) { x.fillStyle = c3Shd(color, R.r(0.88, 1.08)); x.fillRect(i * w / 6, 0, w / 6, h); x.fillStyle = c3Shd(color, 0.6); x.fillRect(i * w / 6, 0, 3, h); }
      x.strokeStyle = c3Shd(color, 0.75); x.lineWidth = 2; for (let k = 0; k < 30; k++) { const px = R.r(0, w); x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + R.n(8), h / 3, px + R.n(8), h * 2 / 3, px + R.n(4), h); x.stroke(); } }
    else { for (let k = 0; k < 400; k++) { x.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; x.fillRect(R.r(0, w), R.r(0, h), R.r(2, 8), R.r(2, 8)); } }   // plaster
  }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; if (o.rep) t.repeat.set(o.rep[0], o.rep[1]); return t;
}
// window glass: sky reflection gradient with a diagonal sheen, or a warm lit room with curtains
function c3TexGlass(lit) {
  return c3Tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, w * 0.4, h);
    if (lit) { g.addColorStop(0, '#ffe8b0'); g.addColorStop(1, '#f0b060'); } else { g.addColorStop(0, '#cfe6ff'); g.addColorStop(0.6, '#7aa6d8'); g.addColorStop(1, '#4a6aa8'); }
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (lit) { x.fillStyle = 'rgba(200,80,60,0.55)'; x.fillRect(0, 0, w * 0.22, h); x.fillRect(w * 0.78, 0, w * 0.22, h); }
    x.fillStyle = 'rgba(255,255,255,0.45)'; x.beginPath(); x.moveTo(w * 0.15, h); x.lineTo(w * 0.45, 0); x.lineTo(w * 0.6, 0); x.lineTo(w * 0.3, h); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.moveTo(w * 0.42, h); x.lineTo(w * 0.72, 0); x.lineTo(w * 0.78, 0); x.lineTo(w * 0.48, h); x.fill();
  }, 128, 192);
}
const C3_GLASS = {}; const c3GlassTex = (lit) => (C3_GLASS[lit ? 1 : 0] ||= c3TexGlass(lit));
// a detailed building (Ricks exteriors): textured walls, framed windows with sills, mullions and optional shutters and
// planters, a panelled door with frame, knob and steps, cornices, a gable shingle roof with chimney and gutters or a flat
// roof with parapet, an optional sign over the door. Origin = centre of the footprint at ground level, front faces +z.
// o: { w, h, d, floors, cols, wall: 'siding'|'brick'|'plaster'|'wood', color, trim, roof: 'gable'|'flat', roofH, roofColor,
//      shutters, planters, door, doorCol (-1 = none), lit (0..1 share of lit windows), sign, signColor, chimney, seed, ink }
function c3Building(o = {}) {
  const g = new THREE.Group(), R = RNG('c3bld', o.seed ?? 1), W = o.w ?? 8, H = o.h ?? 7, D = o.d ?? 6, F = o.floors ?? 2, C = o.cols ?? 3;
  const ink = o.ink ?? 0.03, trim = o.trim ?? '#f6f0e4', col = o.color ?? '#7cc0c0';
  const box = (w, h, d, mat, x, y, z, k = ink) => { const m = c3Mesh(c3RBox(w, h, d, Math.min(0.06, w * 0.2, h * 0.2, d * 0.2)), mat, k); m.position.set(x, y, z); g.add(m); return m; };
  const wall = c3Prop('#ffffff', { map: c3TexWall(o.wall ?? 'siding', col, { rep: [Math.max(1, W / (o.texS ?? 7)), Math.max(1, H / (o.texS ?? 7))] }), rough: 0.8 });
  box(W, H, D, wall, 0, H / 2, 0);
  const trimM = c3Prop(trim, { rough: 0.6 }), fh = (H - 0.6) / F, ww = Math.min(o.winW ?? 2.2, W / C * 0.5), wh = Math.min(fh * 0.6, o.winH ?? 3.0);
  box(W + 0.3, 0.35, D + 0.3, trimM, 0, 0.17, 0);
  for (let f = 1; f <= F; f++) box(W + 0.18, 0.16, D + 0.18, trimM, 0, Math.min(H, f * fh + 0.3), 0, ink * 0.6);
  const doorCol = o.doorCol ?? Math.floor(C / 2);
  for (let f = 0; f < F; f++) for (let c = 0; c < C; c++) {
    const x = -W / 2 + (c + 0.5) * W / C, y = 0.35 + f * fh + fh * 0.55, z = D / 2;
    if (f === 0 && c === doorCol) {
      const dw = Math.min(1.5, W / C * 0.55), dh = Math.min(fh * 0.8, 2.6), dc = o.door ?? '#d8452e';
      box(dw + 0.36, dh + 0.25, 0.14, trimM, x, 0.35 + dh / 2 + 0.06, z + 0.04);
      box(dw, dh, 0.12, c3Prop(dc, { rough: 0.5 }), x, 0.35 + dh / 2, z + 0.1);
      for (const [px, py] of [[-0.22, 0.25], [0.22, 0.25], [-0.22, -0.2], [0.22, -0.2]]) box(dw * 0.32, dh * 0.3, 0.05, c3Prop(c3Shd(dc, 0.82)), x + px * dw, 0.35 + dh / 2 + py * dh, z + 0.17, 0.015);
      const knob = c3Mesh(new THREE.SphereGeometry(0.08, 12, 8), c3Prop('#f0c040', { metal: 0.8, rough: 0.25 }), 0.01); knob.position.set(x + dw * 0.36, 0.35 + dh * 0.48, z + 0.22); g.add(knob);
      box(dw + 0.8, 0.18, 0.7, trimM, x, 0.09, z + 0.45); box(dw + 0.5, 0.18, 0.45, trimM, x, 0.27, z + 0.3);
      if (o.sign) {
        const st = c3Tex((cx, w2, h2) => { cx.fillStyle = o.signColor ?? '#2a5a8a'; cx.fillRect(0, 0, w2, h2); cx.strokeStyle = '#f0d890'; cx.lineWidth = 10; cx.strokeRect(8, 8, w2 - 16, h2 - 16);
          let s = h2 * 0.5; cx.font = '900 ' + s + 'px ' + C3.sub; while (cx.measureText(o.sign).width > w2 * 0.86 && s > 10) { s *= 0.92; cx.font = '900 ' + s + 'px ' + C3.sub; }
          cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#fff6e0'; cx.fillText(o.sign, w2 / 2, h2 / 2 + 2); }, 1024, 256);
        const sw = o.signW ?? Math.min(W * 0.8, 6), sm = new THREE.Mesh(new THREE.PlaneGeometry(sw, sw / 4), new THREE.MeshBasicMaterial({ map: st })); sm.material.toneMapped = false; sm.position.set(x, 0.35 + dh + 0.75, z + 0.12); g.add(sm);
      }
      continue;
    }
    const lit = R.f() < (o.lit ?? 0.2);
    box(ww + 0.26, wh + 0.26, 0.12, trimM, x, y, z + 0.03, ink * 0.7);
    const glM = new THREE.MeshBasicMaterial({ map: c3GlassTex(lit) }); glM.toneMapped = false; if (lit) glM.userData.glow = '#ffd890';
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), glM); gl.position.set(x, y, z + 0.1); g.add(gl);
    box(0.06, wh, 0.06, trimM, x, y, z + 0.13, 0); box(ww, 0.06, 0.06, trimM, x, y + wh * 0.1, z + 0.13, 0);
    box(ww + 0.5, 0.12, 0.34, trimM, x, y - wh / 2 - 0.16, z + 0.16, ink * 0.6);
    if (o.shutters) for (const sx of [-1, 1]) box(ww * 0.42, wh + 0.2, 0.08, c3Prop('#ffffff', { map: c3TexWall('siding', o.shutters, { rep: [1, 2] }), rough: 0.6 }), x + sx * (ww / 2 + ww * 0.26), y, z + 0.08, ink * 0.6);
    if (o.planters && f === 0) {
      box(ww + 0.3, 0.32, 0.34, c3Prop('#ffffff', { map: c3TexWall('wood', '#8a5a3a') }), x, y - wh / 2 - 0.42, z + 0.24, ink * 0.6);
      for (let k = 0; k < 5; k++) { const b = c3Mesh(new THREE.SphereGeometry(0.16, 10, 8), c3Prop(['#e84a6a', '#ffd040', '#f080b0', '#ffffff'][k % 4]), 0.012); b.position.set(x - ww / 2 + (k + 0.5) * (ww + 0.2) / 5, y - wh / 2 - 0.2, z + 0.28); g.add(b); }
    }
  }
  if ((o.roof ?? 'gable') === 'gable') {
    const rh = o.roofH ?? Math.min(3.2, W * 0.38), sh = new THREE.Shape(); sh.moveTo(-W / 2 - 0.45, 0); sh.lineTo(W / 2 + 0.45, 0); sh.lineTo(0, rh); sh.lineTo(-W / 2 - 0.45, 0);
    const rg = new THREE.ExtrudeGeometry(sh, { depth: D + 0.8, bevelEnabled: false }); rg.translate(0, 0, -(D + 0.8) / 2);
    const roof = c3Mesh(rg, c3Prop('#ffffff', { map: c3TexWall('shingle', o.roofColor ?? '#8a3a2e', { rep: [W / 3, D / 3] }), rough: 0.85 }), ink); roof.position.y = H; g.add(roof);
    const gutter = c3Mesh(new THREE.CylinderGeometry(0.1, 0.1, D + 0.8, 10), trimM, ink * 0.5); gutter.rotation.x = Math.PI / 2; gutter.position.set(W / 2 + 0.42, H - 0.05, 0); g.add(gutter);
    const g2 = gutter.clone(); g2.position.x = -W / 2 - 0.42; g.add(g2);
    if (o.chimney !== false) { box(0.9, rh + 0.6, 0.9, c3Prop('#ffffff', { map: c3TexWall('brick', '#b05a42') }), W * 0.22, H + rh * 0.55, -D * 0.15); box(1.1, 0.2, 1.1, trimM, W * 0.22, H + rh * 0.55 + rh / 2 + 0.38, -D * 0.15); }
  } else { box(W + 0.4, 0.5, D + 0.4, trimM, 0, H + 0.2, 0); box(W - 0.2, 0.4, D - 0.2, c3Prop(o.roofColor ?? '#6a6a72'), 0, H + 0.05, 0, 0); }
  g.userData.h = H; return g;
}
// small street furniture: a lamp post (warm glowing head) and a round tree, both inked
function c3Lamp(h = 4.5) { const g = new THREE.Group(), M = c3Prop('#2a3a4a', { metal: 0.4, rough: 0.4 });
  const p = c3Mesh(new THREE.CylinderGeometry(0.08, 0.12, h, 10), M, 0.02); p.position.y = h / 2; g.add(p);
  const hd = c3Mesh(new THREE.SphereGeometry(0.32, 14, 10), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0.02); hd.position.y = h + 0.2; g.add(hd);
  const cap = c3Mesh(new THREE.ConeGeometry(0.42, 0.3, 12), M, 0.02); cap.position.y = h + 0.55; g.add(cap); return g; }
function c3Tree(s = 1, color = '#5aa83a', seed = 1) { const g = new THREE.Group(), R = RNG('c3tree', seed);
  const tr = c3Mesh(new THREE.CylinderGeometry(0.15 * s, 0.22 * s, 2 * s, 8), c3Prop('#7a4a2a'), 0.02); tr.position.y = s; g.add(tr);
  for (let k = 0; k < 4; k++) { const b = c3Mesh(new THREE.SphereGeometry(s * R.r(0.75, 1.05), 16, 12), c3Prop(c3Shd(color, R.r(0.88, 1.08)), { rough: 0.8 }), 0.03); b.position.set(R.n(0.5 * s), 2.3 * s + R.r(0, 0.6 * s), R.n(0.4 * s)); g.add(b); }
  return g; }

// shade a whole built scene the Ricks way: c3Shade on each top-level object that has height (skips flat grounds,
// the sky sphere, people/sprites and anything transparent). Call once at build, after the set is assembled.
function c3ShadeScene(scene, o = {}) {
  const box = new THREE.Box3(), size = new THREE.Vector3();
  for (const c of scene.children) {
    if (c.isLight || c.userData.noShade || c.userData.person) continue;
    box.setFromObject(c); if (box.isEmpty()) continue; box.getSize(size);
    if (size.y < (o.minH ?? 0.6) || Math.max(size.x, size.y, size.z) > (o.maxSize ?? 400)) continue;
    let sprite = false; c.traverse((m) => { if (m.isMesh && m.material && m.material.transparent && m.material.map) sprite = true; });
    if (sprite && size.y < (o.personH ?? 12) && !o.withSprites) continue;   // people (small groups of billboard sprites) keep their drawn shading
    c3Shade(c, o);
  }
}

// =====================================================================
// C3_INK2 + C3_SHADOW (2026-10-29, opt-in, slow-checkout): Ricks Clips draws a marker-like dark outline on EVERY edge
// (silhouettes, desk/drawer/shelf creases, signs) and lights rooms with real cast shadows. Older pieces leave both null.
//  C3_INK2 = { px: line half-width in px at 1080 wide, color, normal: crease threshold, depth: silhouette threshold }
//  C3_SHADOW = { size: shadow map px, dark: 0..1 (hemi/ambient scale while shadows are on) }
// The outline is a screen-space pass: every mesh is redrawn as view-normal + linear depth (billboard people as their
// alpha-cut silhouettes with a flat normal, so only their outline counts), then normal/depth jumps become ink.
// =====================================================================
let C3_INK2 = null, C3_SHADOW = null;
const C3_INK2_DEF = { px: 3.4, color: [0.10, 0.06, 0.05], normal: 0.22, depth: 0.008, alpha: 0.95 };
const C3_SHADOW_DEF = { size: 2048, dark: 0.55, key: 1.5, dir: [-0.55, 0.78, 0.3], catch: 0.34 };
const C3E = {};
function c3EdgeMats() {
  if (C3E.solid) return C3E;
  const vs = 'varying vec3 vN; varying float vD; varying vec2 vUv;\n' +
    'void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vD = -mv.z; gl_Position = projectionMatrix * mv; }';
  C3E.solid = new THREE.ShaderMaterial({ vertexShader: vs, uniforms: { far: { value: 300 } }, side: THREE.DoubleSide,
    fragmentShader: 'uniform float far; varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*0.5+0.5, vD/far); }' });
  C3E.sprite = (map) => new THREE.ShaderMaterial({ vertexShader: vs, uniforms: { far: { value: 300 }, map: { value: map } }, side: THREE.DoubleSide,
    fragmentShader: 'uniform float far; uniform sampler2D map; varying float vD; varying vec2 vUv; void main(){ if(texture2D(map,vUv).a < 0.5) discard; gl_FragColor = vec4(0.5,0.5,1.0, vD/far); }' });
  C3E.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  C3E.quadScene = new THREE.Scene(); C3E.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  C3E.edge = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false,
    uniforms: { tex: { value: C3E.rt.texture }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, r: { value: 2 }, col: { value: new THREE.Vector3() }, tn: { value: 0.35 }, td: { value: 0.012 }, al: { value: 0.9 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.0,1.0); }',
    fragmentShader: [
      'uniform sampler2D tex; uniform vec2 px; uniform float r, tn, td, al; uniform vec3 col; varying vec2 vUv;',
      'void main(){ vec4 c = texture2D(tex, vUv); float e = 0.0;',
      '  for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982; vec2 o = vec2(cos(a), sin(a)) * px * r;',
      '    vec4 s = texture2D(tex, vUv + o);',
      '    bool ce = c.a > 0.0; bool se = s.a > 0.0;',
      '    if (ce != se) { e = 1.0; break; }',
      '    if (!ce) continue;',
      '    float dd = abs(c.a - s.a) / max(min(c.a, s.a), 1e-4);',
      '    float dn = 1.0 - dot(c.rgb * 2.0 - 1.0, s.rgb * 2.0 - 1.0);',
      '    if (dd > td * 6.0 || dn > tn) { e = 1.0; break; } }',
      '  gl_FragColor = vec4(col, e * al); }'].join('\n') });
  C3E.quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), C3E.edge));
  return C3E;
}
// draw the ink of `layer` straight into ctx (blurred like that layer when blurPx > 0)
function c3EdgePass(scene, cam, layer, blurPx) {
  const { r, cv } = c3Renderer(), E = c3EdgeMats(), K = C3_INK2, swap = [];
  scene.traverse((m) => {
    if (!m.isMesh || !m.visible) return;
    const mat = m.material;
    if (m.userData.hull || m.userData.noInk2 || (mat && mat.side === THREE.BackSide)) { swap.push([m, mat, true]); m.visible = false; return; }
    const sprite = mat && mat.transparent && (mat.alphaTest > 0 || mat.map);
    swap.push([m, mat, true]);
    if (sprite && mat.map) { m.userData.c3e ||= E.sprite(mat.map); m.material = m.userData.c3e; m.material.uniforms.far.value = cam.far; }
    else if (sprite) { m.visible = false; }
    else { m.material = E.solid; E.solid.uniforms.far.value = cam.far; }
  });
  const bg = scene.background; scene.background = null;
  const keep = cam.layers.mask; cam.layers.set(layer);
  r.setRenderTarget(E.rt); r.setClearColor(0x000000, 0); r.clear(); r.render(scene, cam); r.setRenderTarget(null);
  scene.background = bg; cam.layers.mask = keep;
  swap.forEach(([m, mat, v]) => { m.material = mat; m.visible = v; });
  const U = E.edge.uniforms; U.r.value = K.px * W / 1080; U.col.value.set(...K.color); U.tn.value = K.normal; U.td.value = K.depth; U.al.value = K.alpha;
  const tm = r.toneMapping; r.toneMapping = THREE.NoToneMapping;
  r.setClearColor(0x000000, 0); r.clear(); r.render(E.quadScene, E.quadCam); r.toneMapping = tm;
  ctx.save(); screen(); if (blurPx > 0.3) ctx.filter = `blur(${blurPx.toFixed(2)}px)`; ctx.drawImage(cv, 0, 0, W, H); ctx.restore();
}
// real cast shadows from the scene's key light (the strongest DirectionalLight), set up once per scene
function c3ShadowSetup(scene) {
  if (scene.userData.c3shadow) return;
  const { r } = c3Renderer(); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  let key = null; const hemi = [];
  scene.traverse((o) => { if (o.isDirectionalLight && (!key || o.intensity > key.intensity)) key = o; if (o.isHemisphereLight || o.isAmbientLight) hemi.push(o); });
  scene.userData.c3shadow = true; if (!key) return;
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3(), tmp = new THREE.Box3();
  scene.traverse((m) => {
    if (!m.isMesh || m.userData.hull) return;
    const mat = m.material; if (!mat || mat.side === THREE.BackSide) return;
    const lit = mat.isMeshStandardMaterial || mat.isMeshToonMaterial || mat.isMeshLambertMaterial || mat.isMeshPhongMaterial;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    tmp.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); const sz = tmp.getSize(new THREE.Vector3());
    if (lit) { m.receiveShadow = true; m.castShadow = Math.max(sz.x, sz.y, sz.z) < 120; if (m.castShadow) box.union(tmp); }
    if (!m.userData.c3catch && !mat.transparent && Math.max(sz.x, sz.y, sz.z) > 6 && [sz.x, sz.y, sz.z].filter((d) => d > 3).length >= 2) {   // big floors/walls (often emissive-bright): a shadow catcher on top, so shadows read like Ricks
      const sm = new THREE.ShadowMaterial({ opacity: C3_SHADOW.catch ?? 0.32, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false });
      const cm = new THREE.Mesh(m.geometry, sm); cm.receiveShadow = true; cm.userData.c3catch = true; cm.userData.noInk2 = true; cm.layers.mask = m.layers.mask; cm.renderOrder = m.renderOrder + 1; m.add(cm);
    }
    else if (mat.transparent && mat.map && mat.alphaTest > 0) {   // billboard people cast their silhouette
      m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: mat.map, alphaTest: 0.5 });
    }
  });
  if (box.isEmpty()) return;
  const c = box.getCenter(new THREE.Vector3()), rad = Math.min(90, box.getSize(new THREE.Vector3()).length() * 0.5);
  const dir = C3_SHADOW.dir ? new THREE.Vector3(...C3_SHADOW.dir).normalize() : key.position.clone().sub(key.target.position).normalize();   // Ricks: a raking key so shadows read on the floor
  key.target.position.copy(c); scene.add(key.target); key.position.copy(c).addScaledVector(dir, rad * 2);
  key.castShadow = true; key.shadow.mapSize.set(C3_SHADOW.size, C3_SHADOW.size); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  const sc = key.shadow.camera; sc.left = -rad; sc.right = rad; sc.top = rad; sc.bottom = -rad; sc.near = 0.5; sc.far = rad * 4; sc.updateProjectionMatrix();
  sc.layers.enableAll();
  hemi.forEach((h) => { h.intensity *= C3_SHADOW.dark; }); key.intensity *= C3_SHADOW.key ?? 1;
}
