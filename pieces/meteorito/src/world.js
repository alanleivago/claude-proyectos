
// =====================================================================
//  WORLD — the hillside porch, the timber town on the river, the bridge, the railway and its train, the autumn taiga,
//  clouds and birds; the asteroid's star, fireball and trail, the burst's ring and plume, the dust wall, the debris
// =====================================================================
const RIVER_Y = -1.6;
const riverZ = (x) => -560 + 40 * Math.sin(x * 0.0034 + 0.6) + 14 * Math.sin(x * 0.011 + 2.0);
const RIVER_W = 78;   // half width
const railZ = (x) => -905 + 14 * Math.sin(x * 0.0021 + 1.1);
// the ground: the hillside under the porch, the valley floor, the river's cut, the taiga hills behind and to the sides
function terrH(x, z) {
  const ax = Math.abs(x), slope = (PORCH - 1) * ss(-100, -7, z + 6 * Math.sin(x * 0.03)) * (1 - 0.3 * ss(250, 800, ax)) + 0.06 * Math.max(0, z);
  const flat = 1.2 * Math.sin(x * 0.013) * Math.sin(z * 0.011) + 0.5 * Math.sin(x * 0.05 + z * 0.03);
  const dz = Math.abs(z - riverZ(x)) + 9 * Math.sin(x * 0.021 + z * 0.01) + 5 * Math.sin(x * 0.07), cut = -5.4 * (1 - ss(RIVER_W - 8, RIVER_W + 22, dz));
  const far = ss(1100, 4200, -z) * (130 + 110 * Math.sin(x * 0.0011 + 1.3) * Math.sin(z * 0.0013 + 0.4) + 60 * Math.sin(x * 0.0031 - z * 0.0023)) + ss(4500, 9000, -z) * 260 * (0.6 + 0.4 * Math.sin(x * 0.0007));
  const side = ss(650, 2600, ax) * (90 + 50 * Math.sin(z * 0.0021 + x * 0.0004)) * ss(-400, 200, -z + 300);
  return slope + flat + cut + far + side;
}
// ---- code-drawn textures for this world
// a log wall, 24 m x 24 m = 8 x 8 cells of 3 m: logs (luminance, tinted per house) + windows with carved painted frames.
// returns the albedo and a mask (white = multiply by the house colour, black = keep the absolute colour: glass, trims)
function texLogWall() {
  const w = 1024, c = w / 8, R = RNG('logwall'), lg = w / 96, mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = w; return cv; };
  const ca = mk(), cm = mk(), x = ca.getContext('2d'), m = cm.getContext('2d');
  m.fillStyle = '#ffffff'; m.fillRect(0, 0, w, w); m.fillStyle = '#000000';
  x.fillStyle = '#c8bcae'; x.fillRect(0, 0, w, w);
  for (let r = 0; r < 96; r++) { const y = r * lg, k = R.r(0.86, 1.06); x.fillStyle = `rgb(${200 * k},${190 * k},${176 * k})`; x.fillRect(0, y, w, lg);
    const g = x.createLinearGradient(0, y, 0, y + lg); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(0.85, 'rgba(0,0,0,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); x.fillStyle = g; x.fillRect(0, y, w, lg);
    for (let k2 = 0; k2 < 14; k2++) { x.fillStyle = `rgba(60,40,24,${R.r(0.05, 0.16)})`; x.fillRect(R.r(0, w), y + R.r(1, lg - 2), R.r(12, 90), 1); }
    if (R.f() < 0.25) { x.fillStyle = 'rgba(40,28,18,0.25)'; x.beginPath(); x.ellipse(R.r(0, w), y + lg / 2, 2.5, 2, 0, 0, TAU); x.fill(); } }
  for (let q = 0; q < 8; q++) { x.fillStyle = 'rgba(30,20,12,0.35)'; x.fillRect(q * c - 2, 0, 4, w); }   // log ends at the cell joints
  const both = (fn) => { fn(x); fn(m); };
  for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) {
    if (R.f() > 0.5) continue; const ww = c * 0.34, hh = c * 0.44, px = q * c + (c - ww) / 2, py = r * c + c * 0.24, trim = R.pick(['#f2eee2', '#f2eee2', '#e8e2cf', '#5d8cb8', '#3f6f9e', '#d9b44a', '#7aa07a']);
    x.fillStyle = trim;
    both((z) => { z.fillRect(px - 9, py - 8, ww + 18, hh + 16);   // the frame
      z.beginPath(); z.moveTo(px - 14, py - 8); z.lineTo(px + ww / 2, py - 30); z.lineTo(px + ww + 14, py - 8); z.closePath(); z.fill();   // the carved pediment
      for (let k2 = 0; k2 < 5; k2++) { z.beginPath(); z.arc(px - 6 + k2 * (ww + 12) / 4, py + hh + 12, 5, 0, Math.PI); z.fill(); }   // scalloped apron
      z.fillRect(px - 14, py + hh + 6, ww + 28, 7); });
    const gl = x.createLinearGradient(0, py, 0, py + hh); gl.addColorStop(0, '#c9d6e6'); gl.addColorStop(0.35, '#6f88a4'); gl.addColorStop(1, '#2c3846'); x.fillStyle = gl; x.fillRect(px, py, ww, hh);
    if (R.f() < 0.4) { x.fillStyle = 'rgba(255,190,120,0.55)'; x.fillRect(px, py, ww, hh * 0.3); }   // the sunrise caught in the glass
    x.fillStyle = trim; x.fillRect(px + ww / 2 - 2, py, 4, hh); x.fillRect(px, py + hh * 0.38, ww, 4);
    if (R.f() < 0.5) { x.fillStyle = 'rgba(245,240,230,0.85)'; x.fillRect(px, py, ww * 0.18, hh); x.fillRect(px + ww * 0.82, py, ww * 0.18, hh); }   // curtains
    for (const sx of [-1, 1]) { if (R.f() < 0.5) continue; x.fillStyle = R.pick(['#3f6f9e', '#5a7a4a', '#8a3a2a', '#e8e2cf']); both((z) => z.fillRect(sx < 0 ? px - 9 - ww * 0.45 : px + ww + 9, py - 4, ww * 0.45, hh + 8)); }   // shutters
  }
  const alb = new THREE.CanvasTexture(ca); alb.encoding = THREE.sRGBEncoding; const mask = new THREE.CanvasTexture(cm);
  return { alb, mask };
}
function texTin() {   // corrugated tin / plank roof: ribs, rust streaks, moss at the eaves (luminance; tinted per house)
  return g3Tex((x, w, h) => { const R = RNG('tin'); x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 48; i++) { const px = i * w / 48, g = x.createLinearGradient(px, 0, px + w / 48, 0); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(0.5, 'rgba(0,0,0,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.28)'); x.fillStyle = g; x.fillRect(px, 0, w / 48, h); }
    for (let k = 0; k < 60; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '120,60,30' : '60,50,40'},${R.r(0.06, 0.2)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(2, 6), R.r(20, 120)); }
    const m = x.createLinearGradient(0, h * 0.8, 0, h); m.addColorStop(0, 'rgba(70,80,40,0)'); m.addColorStop(1, 'rgba(70,80,40,0.35)'); x.fillStyle = m; x.fillRect(0, 0, w, h);
    speck(x, w, h, 3000, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)'], R, 1, 2); }, 256, 256);
}
function texPlanks(key, base, n) {   // porch boards / wooden beams: grain, knots, gaps
  return g3Tex((x, w, h) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { const y = i * h / n, k = R.r(0.8, 1.1); x.fillStyle = `rgba(${k > 1 ? '255,240,220' : '40,24,12'},${Math.abs(k - 1) * 0.6})`; x.fillRect(0, y, w, h / n);
      for (let j = 0; j < 30; j++) { x.fillStyle = `rgba(50,30,16,${R.r(0.05, 0.18)})`; x.fillRect(R.r(0, w), y + R.r(1, h / n - 1), R.r(20, 160), 1); }
      if (R.f() < 0.5) { x.fillStyle = 'rgba(50,30,16,0.45)'; x.beginPath(); x.ellipse(R.r(0, w), y + h / n / 2, 5, 3, 0, 0, TAU); x.fill(); }
      x.fillStyle = 'rgba(20,12,6,0.7)'; x.fillRect(0, y, w, 2); } }, 512, 512);
}
function texValance() {   // the carved board under the porch eave: a scalloped edge and cut-out diamonds (alpha-tested)
  return g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#efe6d2'; x.fillRect(0, 0, w, h * 0.45);
    const n = 8; for (let i = 0; i < n; i++) { const cx = (i + 0.5) * w / n; x.beginPath(); x.moveTo(cx - w / n / 2, h * 0.44); x.quadraticCurveTo(cx, h * 1.05, cx + w / n / 2, h * 0.44); x.fill();
      x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.moveTo(cx, h * 0.12); x.lineTo(cx + 9, h * 0.3); x.lineTo(cx, h * 0.48); x.lineTo(cx - 9, h * 0.3); x.closePath(); x.fill();
      x.beginPath(); x.arc(cx, h * 0.66, 6, 0, TAU); x.fill(); x.restore(); }
    x.fillStyle = 'rgba(80,60,40,0.25)'; x.fillRect(0, h * 0.4, w, 3); }, 512, 64);
}
function texDirt(key) {   // a dirt street: ruts, puddles catching the sky, grass at the edges
  return g3Tex((x, w, h) => { const R = RNG(key); x.fillStyle = '#8a7458'; x.fillRect(0, 0, w, h); speck(x, w, h, 5000, ['rgba(60,46,32,0.3)', 'rgba(170,150,120,0.25)'], R, 1, 3);
    for (const u of [0.32, 0.68]) { x.fillStyle = 'rgba(70,54,38,0.35)'; x.fillRect(w * u - 4, 0, 8, h); }
    for (let k = 0; k < 4; k++) { x.fillStyle = 'rgba(170,190,210,0.5)'; x.beginPath(); x.ellipse(R.r(w * 0.3, w * 0.7), R.r(0, h), R.r(4, 9), R.r(8, 20), 0, 0, TAU); x.fill(); }
    for (const e of [0, 1]) { const g = x.createLinearGradient(e ? w : 0, 0, e ? w * 0.82 : w * 0.18, 0); g.addColorStop(0, 'rgba(96,120,60,0.95)'); g.addColorStop(1, 'rgba(96,120,60,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } }, 64, 256);
}
function texGarden() {   // a kitchen garden: dark soil rows, cabbages and potato tops
  return g3Tex((x, w, h) => { const R = RNG('garden'); x.fillStyle = '#5a4430'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 10; r++) { const y = (r + 0.5) * h / 10; x.fillStyle = 'rgba(40,30,20,0.6)'; x.fillRect(0, y - 3, w, 6);
      for (let k = 0; k < 18; k++) { x.fillStyle = R.pick(['#6a8a3a', '#7a9a4a', '#8aa86a', '#5a7a32']); x.beginPath(); x.arc(R.r(4, w - 4), y + R.n(2), R.r(2.5, 5), 0, TAU); x.fill(); } } }, 128, 128);
}
function texBillow(key, dark = 0) {   // one cloud / smoke billow: many soft lobes, lit at the top, shaded below
  return g3Tex((x, w) => { const R = RNG(key);
    for (let i = 0; i < 70; i++) { const a = R.r(0, TAU), d = Math.pow(R.f(), 0.7) * w * 0.28, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.8, s = R.r(w * 0.07, w * 0.19) * (1 - d / (w * 0.42));
      const g = x.createRadialGradient(px, py - s * 0.35, 0, px, py, s); g.addColorStop(0, `rgba(255,255,255,${0.6 + dark * 0.3})`); g.addColorStop(0.55, `rgba(222,222,228,${0.42 + dark * 0.3})`); g.addColorStop(0.85, 'rgba(160,160,172,0.18)'); g.addColorStop(1, 'rgba(120,120,136,0)');
      x.fillStyle = g; x.fillRect(px - s, py - s, 2 * s, 2 * s); }
    const sh = x.createLinearGradient(0, w * 0.25, 0, w * 0.85); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, `rgba(40,36,48,${0.38 + dark * 0.25})`); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, w); }, 256, 256);
}

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc8cedd, 500, 11000);
  const cam = new THREE.PerspectiveCamera(64, W / H, 0.15, 90000); cam.rotation.order = 'YXZ'; scene.add(cam);

  // --- sky dome (no tone mapping, so the sunrise stays warm)
  const skyU = { top: { value: lin('#5d86c6') }, mid: { value: lin('#a9c0e2') }, hor: { value: lin('#f6d9bc') }, sunDir: { value: SUN_DIR.clone() }, sunCol: { value: lin('#fff0d4') },
    fireDir: { value: BURST.clone() }, fireCol: { value: lin('#fff2dc') }, fire: { value: 0 }, fireW: { value: 0.001 }, flash: { value: 0 }, amber: { value: 0 }, dust: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `${SKY_GLSL}
      varying vec3 vDir;
      void main(){ gl_FragColor = vec4(skyColor(normalize(vDir)), 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);

  // --- lights: the low sun front-left (long shadows towards us), the sky dome, the fireball's light (its own shadows)
  const hemi = new THREE.HemisphereLight(0xb4c8ee, 0x4a5a34, 0.95); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0dc, 1.7); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 5; sun.shadow.blurSamples = 16;
  Object.assign(sun.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 10, far: 5000 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.5;
  sun.target.position.set(0, 0, -520); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 2500); sun.target.updateMatrixWorld();
  const fireL = new THREE.DirectionalLight(0xfff0e0, 0); scene.add(fireL, fireL.target);
  fireL.castShadow = true; fireL.shadow.mapSize.set(2048, 2048); fireL.shadow.radius = 3;
  Object.assign(fireL.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 10, far: 5000 }); fireL.shadow.bias = -0.0005; fireL.shadow.normalBias = 0.5;
  fireL.target.position.set(0, 0, -520); fireL.target.updateMatrixWorld();

  // --- terrain: meadow, hay and ploughed strips near the town, rocky river banks, dark forest floor on the hills
  { const N = 320, g = new THREE.PlaneGeometry(2, 2, N, N); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, cols = [];
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i), m = Math.max(Math.abs(u), Math.abs(v)) + 1e-9, k = 11000 * Math.pow(m, 2.3) / m; const x = u * k, z = v * k - 300; p.setXYZ(i, x, terrH(x, z), z);
      const nA = 0.5 + 0.5 * Math.sin(x * 0.013) * Math.sin(z * 0.011), nB = 0.5 + 0.5 * Math.sin(x * 0.05 + 1) * Math.sin(z * 0.043), strip = Math.floor((x * 0.7 + z * 0.3) / 38), sh = mod(strip * 0.618, 1);
      let c = C3('#3a7410', '#5a921a', nB).lerp(lin('#3e5a24'), 0.5 * ss(0.6, 0.9, nA));
      const fieldK = ss(260, 420, Math.abs(x)) * (1 - ss(900, 1300, -z)) * (1 - ss(-150, -100, z)) * ss(0.25, 0.4, nA);
      c.lerp(sh < 0.33 ? lin('#c9ad62') : sh < 0.6 ? lin('#6e5440') : lin('#7f9a44'), fieldK * 0.9);
      const dz = Math.abs(z - riverZ(x)); c.lerp(lin('#8e8472'), (1 - ss(RIVER_W - 4, RIVER_W + 14, dz)) * 0.85);
      const forest = Math.max(ss(1050, 1300, -z), ss(560, 900, Math.abs(x)) * ss(150, 400, -z)); c.lerp(C3('#304428', '#4a4a26', nA), forest * 0.9);
      cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const grassTex = wrap(g3Tex((x, w) => { const R = RNG('grassT'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); speck(x, w, w, 22000, ['rgba(40,60,20,0.25)', 'rgba(220,220,160,0.22)', 'rgba(90,70,40,0.18)'], R, 1, 3);
      for (let k = 0; k < 1100; k++) { x.strokeStyle = `rgba(${R.f() < 0.5 ? '50,70,30' : '170,180,110'},0.35)`; x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, w); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(2), py - R.r(4, 10)); x.stroke(); } }, 512, 512));
    grassTex.anisotropy = ANI;
    const m = STD({ vertexColors: true, map: grassTex, roughness: 1 });
    m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_UV\n vUv = position.xz / 5.0;\n#endif'); };
    const terr = new THREE.Mesh(g, m); terr.receiveShadow = true; scene.add(terr); }

  // --- the river: sky reflection, ripples, sun glitter, a mist band at dawn; quake rings and the blast's churn
  const waterU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uSun: { value: SUN_DIR.clone() }, uSunCol: { value: lin('#fff0d4') }, uTop: { value: lin('#5d86c6') }, uHor: { value: lin('#f6d9bc') },
    uBody: { value: lin('#24546e') }, uQuake: { value: 0 }, uChurn: { value: 0 }, uFire: { value: BURST.clone() }, uFireK: { value: 0 }, uDust: { value: 0 } }]);
  const waterMat = new THREE.ShaderMaterial({ uniforms: waterU, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uQuake, uChurn, uFireK, uDust; uniform vec3 uSun, uSunCol, uTop, uHor, uBody, uFire; varying vec3 vW;
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT, dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(300.0, 1400.0, dist);
        vec2 fl = vec2(t * 0.6, 0.0);   // the current runs to the right
        vec3 n = vec3(0.04 * sin((p.x - fl.x) * 0.21 + p.y * 0.05) + fine * (0.03 * sin((p.x - fl.x) * 0.9 + p.y * 0.7 + t * 1.3) + 0.02 * sin(p.x * 2.3 - p.y * 1.9 + t * 2.1)), 1.0,
                      0.04 * sin(p.y * 0.17 - t * 0.5) + fine * (0.03 * sin(p.y * 1.1 - p.x * 0.4 + t * 1.6) + 0.02 * sin(p.y * 2.7 + p.x * 1.3 - t * 2.4)));
        for (int k = 0; k < 4; k++) { vec2 c = vec2(-200.0 + float(k) * 140.0, -560.0 + 30.0 * sin(float(k) * 2.1)); float d = length(p - c), ph = d * 0.35 - t * 9.0 - float(k);
          n.xz += uQuake * 0.22 * normalize(p - c + 0.001) * sin(ph) * exp(-d * 0.006); }
        n.xz += uChurn * 0.25 * vec2(sin(p.x * 0.7 + t * 6.0) * sin(p.y * 0.4 - t * 5.0), sin(p.y * 0.8 + t * 7.0));
        n = normalize(n);
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n);
        float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.25)); float hill = 0.035 + 0.02 * sin(p.x * 0.004 + 1.3) + 0.012 * sin(p.x * 0.013);
        skyR = mix(vec3(0.16, 0.2, 0.12) + vec3(0.18, 0.12, 0.02) * (0.5 + 0.5 * sin(p.x * 0.05 + n.x * 30.0)), skyR, smoothstep(hill - 0.012, hill + 0.006, Rf.y));
        vec3 col = mix(uBody, skyR * vec3(0.78, 0.84, 0.92), clamp(fres * 0.55 + 0.12, 0.0, 0.62));
        float sd = max(dot(Rf, uSun), 0.0); col += uSunCol * (pow(sd, 900.0) * 7.0 + pow(sd, 60.0) * 0.4) * (1.0 - uDust);
        float fd = max(dot(Rf, uFire), 0.0); col += vec3(1.0, 0.9, 0.75) * uFireK * (pow(fd, 200.0) * 5.0 + pow(fd, 12.0) * 0.5);
        float foam = uChurn * smoothstep(0.6, 1.0, sin(p.x * 0.5 + t * 3.0) * sin(p.y * 0.6 - t * 2.5));
        col = mix(col, vec3(0.86, 0.84, 0.8), foam * 0.7);
        col = mix(col, vec3(0.45, 0.38, 0.3), uDust * 0.7);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  { const pos = [], idx = []; const NX = 400; for (let i = 0; i <= NX; i++) { const x = -5000 + i * 10000 / NX, zc = riverZ(x); pos.push(x, RIVER_Y, zc - RIVER_W - 30, x, RIVER_Y, zc + RIVER_W + 30); if (i < NX) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, waterMat)); }

  // --- streets: dirt ribbons through the town; a path down the hill from the porch; the main street to the bridge
  const ribbon = (pts, wd, mat, lift = 0.1) => { const pos = [], uvs = [], idx = []; let acc = 0;
    pts.forEach(([x, z], k) => { const [x2, z2] = pts[Math.min(k + 1, pts.length - 1)], [x0, z0] = pts[Math.max(k - 1, 0)], tx = x2 - x0, tz = z2 - z0, L = Math.hypot(tx, tz) || 1, nx = -tz / L, nz = tx / L;
      if (k) acc += Math.hypot(x - pts[k - 1][0], z - pts[k - 1][1]);
      for (const s of [-1, 1]) { const px = x + nx * wd / 2 * s, pz = z + nz * wd / 2 * s; pos.push(px, terrH(px, pz) + lift, pz); uvs.push(s < 0 ? 0 : 1, acc / 10); } });
    for (let k = 0; k < pts.length - 1; k++) { const a = k * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m); return m; };
  const dirtMat = STD({ map: wrap(texDirt('street')), roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 });
  const BRIDGE_X = 40, STREETS = [];
  { const path = []; for (let k = 0; k <= 60; k++) { const u = k / 60; path.push([8 * Math.sin(u * 7) * (1 - u) + lerp(-3, BRIDGE_X, u * u), lerp(-6, riverZ(BRIDGE_X) + RIVER_W + 12, u)]); } STREETS.push(path); ribbon(path, 6, dirtMat); }
  for (const z0 of [-200, -300, -400]) { const s = []; for (let k = 0; k <= 80; k++) { const x = -900 + k * 22.5; s.push([x, z0 + 0.04 * x + 8 * Math.sin(x * 0.01 + z0)]); } STREETS.push(s); ribbon(s, 7, dirtMat); }
  for (const x0 of [-420, -230, 210, 400]) { const s = []; for (let k = 0; k <= 30; k++) { const z = -150 - k * 16; s.push([x0 + 0.08 * z + 6 * Math.sin(z * 0.02), z]); } STREETS.push(s); ribbon(s, 6, dirtMat); }
  { const s = []; for (let k = 0; k <= 60; k++) { const x = -1200 + k * 40; s.push([x, riverZ(x) - RIVER_W - 45 + 6 * Math.sin(x * 0.006)]); } STREETS.push(s); ribbon(s, 6, dirtMat); }   // the far-bank road
  const onStreet = (x, z, m) => STREETS.some((s) => s.some(([sx, sz]) => Math.abs(sx - x) < m && Math.abs(sz - z) < m));

  // --- the railway on the far bank: ballast, sleepers, two rails
  { const pts = []; for (let k = 0; k <= 120; k++) { const x = -3000 + k * 50; pts.push([x, railZ(x)]); }
    ribbon(pts, 4.2, STD({ color: 0x8a8278, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }), 0.25);
    ribbon(pts, 1.8, STD({ color: 0x4a3a2c, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4 }), 0.33); }

  // --- houses: log walls with carved window frames (albedo + mask), gable roofs of tin or planks, brick chimneys,
  //     yards of bare earth, kitchen gardens, picket fences
  const LW = texLogWall(); [LW.alb, LW.mask].forEach((t) => { wrap(t); t.anisotropy = ANI; });
  const houseMat = STD({ color: 0xffffff, roughness: 0.92 }); houseMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uFacM: { value: LW.alb }, uFacK: { value: LW.mask } });
    sh.vertexShader = 'varying vec2 vFac;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + 0.5) * sc; vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacK; varying vec2 vFac;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n { vec3 a = texture2D(uFacM, vFac).rgb; float k = texture2D(uFacK, vFac).r; diffuseColor.rgb = mix(a, diffuseColor.rgb * a, k); }');
  };
  const roofGeo = (() => { const P = [], U = [];
    const q = (a, b, c, d, ua, ub, uc, ud) => { P.push(...a, ...c, ...b, ...a, ...d, ...c); U.push(...ua, ...uc, ...ub, ...ua, ...ud, ...uc); };
    q([-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 1, 0], [-0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1]); q([0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 1, 0], [0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1]);
    P.push(-0.5, 0, 0.5, -0.5, 1, 0, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, 0.5); U.push(0, 0, 0.5, 1, 1, 0, 0, 0, 0.5, 1, 1, 0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals(); return g; })();
  const HL = []; { const R = RNG('townAst'), WALL = ['#8a6a4a', '#7a5a3e', '#6a4e36', '#9a7a56', '#a4825c', '#c9a95a', '#9a4a32', '#6f8a9a', '#8a9a72', '#e6dcc6', '#5f7f9a', '#b08a5a'], ROOF = ['#6a7076', '#8a8a86', '#7a3a2a', '#3f5a4a', '#4a3a30', '#9a9a94', '#5a4a3c', '#355a6a'];
    const ok = (x, z, sx, sz) => { if (Math.abs(z - riverZ(x)) < RIVER_W + 18) return false; if (z > -105 || z < -1040 || Math.abs(x) > 1100) return false; if (Math.abs(z - railZ(x)) < 20) return false;
      if (onStreet(x, z, Math.max(sx, sz) * 0.5 + 5)) return false; return !HL.some((h) => Math.abs(h.x - x) < (h.sx + sx) * 0.5 + 9 && Math.abs(h.z - z) < (h.sz + sz) * 0.5 + 9); };
    for (let i = 0; i < 9000 && HL.length < 360; i++) {
      const z = -Math.pow(R.f(), 0.8) * 940 - 105, near = z > -260, x = near ? R.r(-130 + z * 0.2, 130 - z * 0.2) : R.r(-260 + z * 0.55, 260 - z * 0.55);
      const far = Math.abs(z - riverZ(x)) > 0 && z < riverZ(x); if (far && R.f() < 0.55) continue;
      const sx = R.r(6, 10), sz = R.r(6, 10); if (!ok(x, z, sx, sz)) continue;
      const fl = R.f() < 0.22 ? 2 : 1, h = fl * 3.0 + R.r(0.4, 1.2);
      HL.push({ x, z, sx, sz, h, wc: R.pick(WALL), rc: R.pick(ROOF), ry: R.f() < 0.5 ? 0 : Math.PI / 2, rh: Math.min(sx, sz) * R.r(0.42, 0.6), chim: R.f() < 0.65, garden: R.f() < 0.7, fence: R.f() < 0.75 });
    } }
  const houses = IM(new THREE.BoxGeometry(1, 1, 1), houseMat, HL.length), roofs = IM(roofGeo, STD({ color: 0xffffff, roughness: 0.6, metalness: 0.15, map: wrap(texTin(), 3, 2), side: THREE.DoubleSide }), HL.length);
  roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); houses.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const chims = IM(new THREE.BoxGeometry(0.9, 2.2, 0.9), STD({ color: 0x9a5a44, roughness: 0.9 }), HL.length); chims.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const CHIM = [];
  { const R = RNG('houseAst'); HL.forEach((q, i) => { q.y0 = terrH(q.x, q.z) - 0.6; q.tR = 0;
    houses.setMatrixAt(i, M4c(q.x, q.y0 + q.h / 2, q.z, q.ry, q.sx, q.h, q.sz)); houses.setColorAt(i, lin(q.wc));
    roofs.setMatrixAt(i, M4c(q.x, q.y0 + q.h, q.z, q.ry + Math.PI / 2, q.sz + 0.8, q.rh, q.sx + 1.0)); roofs.setColorAt(i, lin(q.rc));
    const cxo = (R.f() - 0.5) * q.sx * 0.5; q.cx = q.x + (q.ry ? 0 : cxo); q.cz = q.z + (q.ry ? cxo : 0); q.cy = q.y0 + q.h + q.rh * 0.75;
    chims.setMatrixAt(i, q.chim ? M4c(q.cx, q.cy, q.cz) : _hid); if (q.chim) CHIM.push(i);
    q.spin = [R.n(1.2), R.n(1.2), R.n(1.2)]; q.sp = R.r(0.7, 1.3); }); }
  scene.add(houses, roofs, chims);
  // yards and gardens
  const yardTex = g3Tex((x, w) => { const R = RNG('yard'); const g = x.createRadialGradient(w / 2, w / 2, w * 0.1, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(120,98,72,0.95)'); g.addColorStop(0.6, 'rgba(112,92,66,0.7)'); g.addColorStop(1, 'rgba(100,84,60,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, w); for (let k = 0; k < 2600; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '60,46,32' : '170,150,120'},${R.r(0.1, 0.3)})`; x.fillRect(R.r(w * 0.1, w * 0.9), R.r(w * 0.1, w * 0.9), 2, 2); } }, 128, 128);
  const flatIM = (tex, n, extra = {}) => { const m = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), STD(Object.assign({ map: tex, roughness: 1, polygonOffset: true, polygonOffsetFactor: -3 }, extra)), n, false); m.receiveShadow = true; scene.add(m); return m; };
  const yards = flatIM(yardTex, HL.length, { transparent: true, depthWrite: false }), gardens = flatIM(texGarden(), HL.length);
  { const R = RNG('yardR'); HL.forEach((q, i) => { yards.setMatrixAt(i, M4c(q.x, terrH(q.x, q.z) + 0.06, q.z, R.r(0, 3), q.sx * 2.4, 1, q.sz * 2.4));
    const gx = q.x + (R.f() < 0.5 ? -1 : 1) * (q.sx * 0.5 + 9), gz = q.z + R.n(3); gardens.setMatrixAt(i, q.garden && !onStreet(gx, gz, 9) ? M4c(gx, terrH(gx, gz) + 0.08, gz, q.ry, 12, 1, 9) : _hid); }); }
  // picket fences round the yards (alpha-tested pickets)
  const picketTex = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#d8ccb4'; for (let i = 0; i < 16; i++) { const px = i * w / 16 + 2; x.fillRect(px, h * 0.12, w / 16 - 6, h * 0.88); x.beginPath(); x.moveTo(px, h * 0.12); x.lineTo(px + (w / 16 - 6) / 2, 0); x.lineTo(px + w / 16 - 6, h * 0.12); x.fill(); }
    x.fillStyle = '#b8a888'; x.fillRect(0, h * 0.3, w, 5); x.fillRect(0, h * 0.75, w, 5); }, 256, 64);
  const FEN = []; HL.forEach((q) => { if (!q.fence || q.z < -720) return; const hw = q.sx * 0.5 + 7, hd = q.sz * 0.5 + 7; [[0, -hd, 0, 2 * hw], [0, hd, 0, 2 * hw], [-hw, 0, Math.PI / 2, 2 * hd], [hw, 0, Math.PI / 2, 2 * hd]].forEach(([ox, oz, a, L]) => FEN.push([q.x + ox, q.z + oz, a, L])); });
  const fences = IM(new THREE.PlaneGeometry(1, 1.2).translate(0, 0.6, 0), STD({ map: picketTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, color: 0xc8bca4 }), FEN.length);
  fences.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  FEN.forEach(([x, z, a, L], i) => fences.setMatrixAt(i, M4c(x, terrH(x, z) - 0.1, z, a, L, 1, 1))); scene.add(fences);
  // haystacks in the fields
  const HAY = []; { const R = RNG('hay'); for (let i = 0; i < 4000 && HAY.length < 90; i++) { const x = R.r(-1000, 1000), z = R.r(-1000, -120); if (Math.abs(x) < 120 || Math.abs(z - riverZ(x)) < RIVER_W + 20 || onStreet(x, z, 10) || HL.some((h) => Math.abs(h.x - x) < 14 && Math.abs(h.z - z) < 14)) continue; HAY.push([x, terrH(x, z), z, R.r(1.6, 2.6)]); } }
  const hay = IM(new THREE.SphereGeometry(1, 10, 8, 0, TAU, 0, Math.PI * 0.62).scale(1, 1.4, 1), STD({ color: 0xc9a85a, roughness: 1, flatShading: true }), HAY.length);
  HAY.forEach(([x, y, z, s], i) => hay.setMatrixAt(i, M4c(x, y - 0.4, z, i, s, s, s))); scene.add(hay);
  // the church: white walls, a bell tower with a green tent roof and a gold onion dome; the stone bridge
  { const white = STD({ color: 0xf1ece2, roughness: 0.85 }), green = STD({ color: 0x3f7a5a, roughness: 0.6, metalness: 0.2 }), gold = STD({ color: 0xd9b45a, roughness: 0.3, metalness: 0.8 });
    const cx = -150, cz = -330, y0 = terrH(cx, cz) - 0.3, add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
    add(new THREE.BoxGeometry(12, 10, 20), white, cx, y0 + 5, cz); add(new THREE.BoxGeometry(14, 3, 22).translate(0, 0, 0), green, cx, y0 + 11, cz).scale.set(1, 0.6, 1);
    add(new THREE.BoxGeometry(6, 20, 6), white, cx, y0 + 10, cz + 12); add(new THREE.ConeGeometry(4.6, 9, 4).rotateY(Math.PI / 4), green, cx, y0 + 24.5, cz + 12);
    add(new THREE.SphereGeometry(1.4, 16, 12).scale(1, 1.3, 1), gold, cx, y0 + 29.6, cz + 12); add(new THREE.CylinderGeometry(4.5, 4.5, 4, 16), white, cx, y0 + 12, cz - 4);
    add(new THREE.SphereGeometry(4.2, 18, 12).scale(1, 1.5, 1), green, cx, y0 + 16.5, cz - 4); add(new THREE.SphereGeometry(1, 12, 10), gold, cx, y0 + 23.2, cz - 4);
    const bz = riverZ(BRIDGE_X), stone = STD({ color: 0xa89c88, roughness: 0.95 });
    add(new THREE.BoxGeometry(8, 1.2, 2 * RIVER_W + 40), stone, BRIDGE_X, 3.2, bz); for (const dz of [-60, -36, -12, 12, 36, 60]) add(new THREE.CylinderGeometry(2.2, 2.6, 8, 10), stone, BRIDGE_X, -1.5, bz + dz);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.4, 0.9, 2 * RIVER_W + 40), stone, BRIDGE_X + s * 3.8, 4.2, bz); }

  // --- trees: near/mid detailed birches (white trunks, gold crowns), spruces and larches; the far taiga as a carpet of
  //     cheap instanced spruces and gold crowns. Every tree knows when the blast front reaches it.
  const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo; g2.applyMatrix4(m4); g2.computeVertexNormals();
      const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.6 + 0.4 * clamp(n.getY(i) * 0.5 + 0.5 + (p.getY(i) - shade) * 0.05) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
  const lumpy = (r, R) => { const g = new THREE.IcosahedronGeometry(r, 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + 0.2 * Math.sin(v.x * 3.1 + R) * Math.sin(v.y * 2.7 + R * 2) + 0.14 * Math.sin(v.z * 5.3 + R * 3); p.setXYZ(i, v.x * k, v.y * k * 0.85, v.z * k); } return g; };
  const birch = (seed, leaf) => { const R = RNG('birch', seed), parts = [[new THREE.CylinderGeometry(0.12, 0.22, 7, 7).translate(0, 3.5, 0), M4c(0, 0, 0, 0, 1, 1, 1, R.n(0.05), R.n(0.05)), '#e8e4da', 0]];
    for (let k = 0; k < 5; k++) parts.push([new THREE.CylinderGeometry(0.125, 0.125, 0.12, 7).translate(0, 0, 0), M4c(0, R.r(0.5, 5), 0), '#2a2622', 0]);   // the black marks
    for (let b = 0; b < 4; b++) { const a = b / 4 * TAU + R.r(0, 1); parts.push([new THREE.CylinderGeometry(0.04, 0.08, 2.4, 5).translate(0, 1.2, 0), M4c(0, 4.0 + R.r(0, 1.5), 0, a, 1, 1, 1, 0.8, 0), '#d8d4ca', 0]); }
    const n = 8 + Math.floor(R.f() * 5); for (let k = 0; k < n; k++) { const a = R.r(0, TAU), rr = k === 0 ? 0 : R.r(0.6, 1.7), y = 6.0 + R.r(-1.4, 2.2) + (k === 0 ? 0.8 : 0), s = R.r(0.9, 1.4) * (k === 0 ? 1.3 : 1);
      parts.push([lumpy(s, R.r(0, 9)), M4c(Math.cos(a) * rr, y, Math.sin(a) * rr, R.r(0, 3), 1, 1.15, 1), R.pick(leaf), 5.6]); }
    return mergeG(parts); };
  const spruce = (seed, cols, tall) => { const R = RNG('spruce', seed), parts = [[new THREE.CylinderGeometry(0.1, 0.24, 2, 6).translate(0, 1, 0), M4c(0, 0, 0), '#3e2e22', 0]];
    const n = tall ? 8 : 6; for (let k = 0; k < n; k++) { const y = 1.2 + k * 1.15, s = 1 - k / (n + 1); parts.push([new THREE.ConeGeometry(2.0 * s, 2.3, 9, 1).translate(0, 1.15, 0), M4c(0, y, 0, R.r(0, 3), 1, 1, 1, R.n(0.05), R.n(0.05)), R.pick(cols), 1.4 + 3]); }
    return mergeG(parts); };
  const TGEO = [birch(1, ['#d8b444', '#e2c25a', '#c9a038', '#b8a040']), birch(2, ['#c98a2e', '#d89a3a', '#e0b048', '#a8a046']), spruce(3, ['#2a4428', '#30502e', '#263e24'], true), spruce(4, ['#c88a3a', '#b87a30', '#d09a48'], false)];
  const treeMat = STD({ vertexColors: true, roughness: 0.9 }), R0 = RNG('treesAst'), trees = [];
  const freeAt = (x, z, m) => Math.abs(z - riverZ(x)) > RIVER_W + 4 && Math.abs(z - railZ(x)) > 10 && !onStreet(x, z, 6) && !HL.some((h) => Math.abs(h.x - x) < h.sx * 0.5 + m && Math.abs(h.z - z) < h.sz * 0.5 + m);
  for (let i = 0; i < 9000 && trees.length < 2400; i++) { let x, z;
    if (i < 300) { x = R0.r(-90, 90); z = R0.r(-150, -6); if (Math.abs(x) < 0.5 * -z + 12) continue; } else { x = R0.r(-1300, 1300); z = R0.r(-1150, -40); }
    if (Math.abs(x) < 3 && z > -20) continue; if (!freeAt(x, z, 4)) continue;
    const grove = 0.5 + 0.5 * Math.sin(x * 0.02 + 1.7) * Math.sin(z * 0.017 + 0.3); if (i >= 300 && R0.f() > 0.25 + 0.75 * grove) continue;
    const ty = R0.f(), type = ty < 0.42 ? 0 : ty < 0.62 ? 1 : ty < 0.88 ? 2 : 3;
    trees.push({ x, y: terrH(x, z) - 0.1, z, s: R0.r(0.9, 1.6) * (type === 2 ? 1.3 : 1), ph: R0.f(), type }); }
  const treeI = TGEO.map((geo, k) => { const m = IM(geo, treeMat, trees.filter((t) => t.type === k).length); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; });
  { const cnt = [0, 0, 0, 0]; trees.forEach((tr) => { tr.slot = cnt[tr.type]++; treeI[tr.type].setMatrixAt(tr.slot, M4c(tr.x, tr.y, tr.z, tr.ph * 6, tr.s, tr.s, tr.s)); }); }
  // the far taiga: spruce spires and gold crowns over the hills (scaled up with distance so the carpet closes)
  const farSp = new THREE.ConeGeometry(1, 1, 6, 1).translate(0, 0.5, 0), farCr = new THREE.IcosahedronGeometry(1, 0).scale(1, 1.3, 1).translate(0, 1.6, 0);
  const FAR = []; { const R = RNG('taiga'); for (let i = 0; i < 90000 && FAR.length < 42000; i++) {
    const z = -1060 - Math.pow(R.f(), 1.35) * 9500, x = R.r(-1, 1) * (0.62 * -z + 900), dense = 0.5 + 0.5 * Math.sin(x * 0.0021 + 0.7) * Math.sin(z * 0.0017 + 1.9);
    if (R.f() > 0.35 + 0.65 * dense) continue; if (Math.abs(z - railZ(x)) < 25) continue;
    const k = 1 + -z / 2600, gold = R.f() < 0.3 + 0.25 * Math.sin(x * 0.004 + z * 0.003); FAR.push({ x, z, y: terrH(x, z) - 0.5, gold, s: R.r(14, 24) * k, w: R.r(3, 4.6) * k, ph: R.f() }); }
    for (let i = 0; i < 9000; i++) { const x = (R.f() < 0.5 ? -1 : 1) * R.r(620, 3500), z = R.r(-1060, 400); if (Math.abs(z - riverZ(x)) < RIVER_W + 10 || Math.abs(z - railZ(x)) < 20) continue; FAR.push({ x, z, y: terrH(x, z) - 0.5, gold: R.f() < 0.4, s: R.r(14, 22), w: R.r(3, 4.5), ph: R.f() }); } }
  const farN = [FAR.filter((f) => !f.gold).length, FAR.filter((f) => f.gold).length];
  const farI = [IM(farSp, STD({ color: 0xffffff, roughness: 1, flatShading: true }), farN[0], false), IM(farCr, STD({ color: 0xffffff, roughness: 1, flatShading: true }), farN[1], false)];
  { const R = RNG('taigaC'), cnt = [0, 0]; FAR.forEach((f) => { const k = f.gold ? 1 : 0; f.k = k; f.slot = cnt[k]++;
    farI[k].setMatrixAt(f.slot, f.gold ? M4c(f.x, f.y, f.z, f.ph * 6, f.w * 1.4, f.s * 0.42, f.w * 1.4) : M4c(f.x, f.y, f.z, f.ph * 6, f.w, f.s, f.w));
    farI[k].setColorAt(f.slot, f.gold ? lin(R.pick(['#c9a038', '#d8b04a', '#b8862e', '#c27a2a', '#a8a040'])) : lin(R.pick(['#2a4228', '#2f4a2c', '#24381f', '#34502e']))); }); }
  farI.forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.receiveShadow = true; scene.add(m); });
  // when the blast front reaches a z (inverse of frontZ, by bisection)
  const tFront = (z) => { if (z < FRONT[0][1]) return 47.5; let a = 47.5, b = 57.3; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (frontZ(m) < z) a = m; else b = m; } return b; };
  trees.forEach((tr) => { tr.tf = tFront(tr.z) + 0.05 * Math.sin(tr.x); }); FAR.forEach((f) => { f.tf = tFront(f.z) + 0.04 * Math.sin(f.x * 0.1); }); HL.forEach((q) => { q.tf = tFront(q.z); });

  // --- the porch: corner posts at the frame's edges, the eave beam and a carved valance at the top, a rail across the bottom, boards
  const beamTex = wrap(texPlanks('beam', '#7a5a3c', 4)), boardTex = wrap(texPlanks('board', '#8a6a48', 10), 1, 1);
  const wood = STD({ map: beamTex, roughness: 0.85 }), porch = new THREE.Group(); scene.add(porch);
  const pAdd = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; porch.add(m); return m; };
  for (const s of [-1, 1]) pAdd(new THREE.BoxGeometry(0.12, 3.2, 0.12), wood, s * 0.45, PORCH + 1.6, -1.2);
  pAdd(new THREE.BoxGeometry(4, 0.2, 0.16), wood, 0, EYE + 0.72, -1.25);
  const valTex = wrap(texValance(), 5, 1); valTex.wrapT = THREE.ClampToEdgeWrapping;   // clamped: a repeat in v bled the opaque top row along the bottom edge (a dashed line in the sky)
  const val = pAdd(new THREE.PlaneGeometry(4, 0.16), STD({ map: valTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), 0, EYE + 0.56, -1.2);
  pAdd(new THREE.BoxGeometry(4, 0.09, 0.11), wood, 0, PORCH + 0.98, -1.2);
  { const bt = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.4).rotateX(-Math.PI / 2), STD({ map: boardTex, roughness: 0.85 })); bt.position.set(0, PORCH, 0); bt.receiveShadow = true; porch.add(bt); }

  // --- grass on the hillside below the porch: clumps of curved blades; wildflowers
  const clumpG = (() => { const P = [], C = [], R = RNG('blades'); for (let b = 0; b < 11; b++) { const a = R.r(0, TAU), lean = R.r(0.15, 0.55), hgt = R.r(0.22, 0.5), w = R.r(0.012, 0.022), ox = R.n(0.05), oz = R.n(0.05), dx = Math.cos(a), dz = Math.sin(a);
      const seg = 4, pts = []; for (let s = 0; s <= seg; s++) { const u = s / seg, bend = lean * u * u * hgt; pts.push([ox + dx * bend, u * hgt, oz + dz * bend, w * (1 - u * 0.92)]); }
      const px = -dz, pz = dx; for (let s = 0; s < seg; s++) { const [x0, y0, z0, w0] = pts[s], [x1, y1, z1, w1] = pts[s + 1], c0 = lerp(0.35, 1, s / seg), c1 = lerp(0.35, 1, (s + 1) / seg);
        const A = [x0 - px * w0, y0, z0 - pz * w0], B2 = [x0 + px * w0, y0, z0 + pz * w0], Cc = [x1 + px * w1, y1, z1 + pz * w1], D = [x1 - px * w1, y1, z1 - pz * w1];
        P.push(...A, ...B2, ...Cc, ...A, ...Cc, ...D); [c0, c0, c1, c0, c1, c1].forEach((k) => C.push(0.36 * k, 0.48 * k, 0.2 * k)); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; })();
  const RR = RNG('tuftsAst'), tuftN = 26000, tufts = IM(clumpG, STD({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }), tuftN, false), tuftL = [];
  for (let i = 0; i < tuftN; i++) { const x = RR.r(-90, 90), z = -1.3 - Math.pow(RR.f(), 2.2) * 110; const s = RR.r(0.22, 0.5) * (1 + -z / 70); tuftL.push([x, terrH(x, z), z, s, RR.r(0, 9)]); tufts.setColorAt(i, C3('#c8d0a0', '#ffffff', RR.f()).lerp(lin('#e0c070'), RR.f() < 0.2 ? 0.5 : 0)); }
  tufts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tufts.frustumCulled = false; tufts.receiveShadow = true; scene.add(tufts);
  const flowers = IM(new THREE.IcosahedronGeometry(0.06, 0), STD({ color: 0xffffff, roughness: 0.8 }), 1400, false);
  for (let i = 0; i < 1400; i++) { const x = RR.r(-60, 60), z = -12 - Math.pow(RR.f(), 1.3) * 100, k = 0.5 + -z / 70; flowers.setMatrixAt(i, M4c(x, terrH(x, z) + RR.r(0.2, 0.35) * k, z, 0, k, k, k)); flowers.setColorAt(i, lin(RR.pick(['#f4f0e8', '#f2d24a', '#b8a0e0', '#e86a6a', '#f4f0e8']))); }
  scene.add(flowers);

  // --- villagers on the streets (tiny smooth bodies) and cows in the meadows
  const PEOPLE = []; { const R = RNG('folk'); for (let i = 0; i < 400 && PEOPLE.length < 90; i++) { const s = R.pick(STREETS.slice(0, 5)), j = Math.floor(R.r(2, s.length - 3)); const [x, z] = s[j]; if (z > -60) continue; const [x2, z2] = s[j + 1];
    PEOPLE.push({ s, j, u0: R.f(), v: R.r(0.6, 1.2) * (R.f() < 0.5 ? 1 : -1), hx: (x2 - x), hz: (z2 - z), wear: R.pick(['#8a3a2a', '#3a4a6a', '#5a4a3a', '#2a2a2e', '#c9b48a', '#6a2a3a', '#4a5a3a']), head: R.pick(['#e8e0d0', '#c84a3a', '#3a3a40', '#d8c090']), ph: R.f() }); } }
  const bodies = IM(new THREE.CapsuleGeometry(0.26, 1.0, 4, 8).translate(0, 0.8, 0), STD({ roughness: 0.8 }), PEOPLE.length, false), heads = IM(new THREE.SphereGeometry(0.2, 8, 6).translate(0, 1.75, 0), STD({ roughness: 0.8 }), PEOPLE.length, false);
  PEOPLE.forEach((p, i) => { bodies.setColorAt(i, lin(p.wear)); heads.setColorAt(i, lin(p.head)); }); bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage); heads.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(bodies, heads);
  const COWS = []; { const R = RNG('cows'); for (let i = 0; i < 400 && COWS.length < 24; i++) { const x = R.r(-500, 500), z = R.r(-650, -160); if (!freeAt(x, z, 8) || Math.abs(x) < 60) continue; COWS.push([x, terrH(x, z), z, R.r(0, TAU), R.pick(['#5a3a2a', '#e8e0d4', '#2a2420', '#8a5a3a'])]); } }
  const cows = IM(new THREE.BoxGeometry(1.0, 1.0, 2.2).translate(0, 1.0, 0), STD({ roughness: 0.9 }), COWS.length), cowH = IM(new THREE.BoxGeometry(0.5, 0.5, 0.6).translate(0, 1.3, 1.3), STD({ roughness: 0.9 }), COWS.length);
  COWS.forEach(([x, y, z, a, c], i) => { cows.setMatrixAt(i, M4c(x, y, z, a)); cowH.setMatrixAt(i, M4c(x, y, z, a)); cows.setColorAt(i, lin(c)); cowH.setColorAt(i, lin(c)); }); cows.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cowH.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(cows, cowH);

  // --- the train: a steam locomotive (boiler, cab, funnel, red wheels) and seven wagons on the far bank
  const train = []; { const blk = STD({ color: 0x2a2a2e, roughness: 0.5, metalness: 0.4 }), red = STD({ color: 0x9a2a22, roughness: 0.6 }), wag = [0x7a3a2a, 0x5a4a3a, 0x6a2e24, 0x4a5a4a];
    const loco = new THREE.Group(); [[new THREE.CylinderGeometry(1.2, 1.2, 8, 14).rotateZ(Math.PI / 2), blk, 0, 2.6, 0], [new THREE.BoxGeometry(3.2, 3.4, 3), blk, -5, 3, 0], [new THREE.CylinderGeometry(0.4, 0.55, 1.6, 10), blk, 3, 4.4, 0], [new THREE.BoxGeometry(11, 0.8, 2.8), red, -1, 1.1, 0], [new THREE.BoxGeometry(4, 2.2, 2.8), blk, -9, 2.2, 0]]
      .forEach(([g, m, x, y, z]) => { const me = new THREE.Mesh(g, m); me.position.set(x, y, z); me.castShadow = true; loco.add(me); }); scene.add(loco); train.push(loco);
    for (let k = 0; k < 7; k++) { const w = new THREE.Group(), me = new THREE.Mesh(new THREE.BoxGeometry(9, 3.2, 3), STD({ color: wag[k % 4], roughness: 0.85 })); me.position.y = 2.6; me.castShadow = true; w.add(me);
      const rf = new THREE.Mesh(new THREE.BoxGeometry(9.3, 0.3, 3.3), STD({ color: 0x5a5a5e })); rf.position.y = 4.3; w.add(rf); scene.add(w); train.push(w); } }

  // --- sprite pools: clouds, chimney smoke, steam, the trail, the plume, the dust wall, dust on the ground
  const BT = [texBillow('b0'), texBillow('b1'), texBillow('b2'), texBillow('d0', 1), texBillow('d1', 1)], glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,250,235,0.85)'], [0.35, 'rgba(255,220,170,0.25)'], [1, 'rgba(255,200,140,0)']], 128);
  const pool = (n, o = {}) => { const a = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: BT[i % 3], transparent: true, depthWrite: false, fog: false, opacity: 0 }, o))); s.visible = false; s.renderOrder = o.order ?? 7; scene.add(s); a.push(s); } return a; };
  const clouds = []; { const R = RNG('cloudsAst'); for (let c = 0; c < 30; c++) { const cx = R.r(-9000, 9000), cz = R.r(-22000, -3000), cy = R.r(1500, 3600), size = R.r(500, 1300), n = 5 + Math.floor(R.f() * 5);
    for (let k = 0; k < n; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: BT[k % 3], transparent: true, depthWrite: false, opacity: 0.6, fog: false }));
      s.userData = { x: cx + R.n(size * 0.7), z: cz + R.n(size * 0.4), y: cy + R.n(size * 0.15) + (k === 0 ? size * 0.12 : 0), w: size * R.r(0.6, 1.1), o: R.r(0.55, 0.9) }; s.material.rotation = R.n(0.2); s.renderOrder = 2; scene.add(s); clouds.push(s); } }
    for (let c = 0; c < 10; c++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: BT[c % 3], transparent: true, depthWrite: false, opacity: 0.3, fog: false })); s.userData = { x: R.r(-14000, 14000), z: R.r(-30000, -18000), y: R.r(5000, 9000), w: R.r(6000, 11000), o: 0.28, flat: 0.12 }; s.renderOrder = 1; scene.add(s); clouds.push(s); } }
  const smoke = pool(CHIM.length * 6, { order: 8 }), steam = pool(220, { order: 8 }), trainSmoke = pool(70, { order: 8 });
  const trailGlow = pool(220, { map: glowTex, blending: THREE.AdditiveBlending, order: 4 }), trail = pool(240, { order: 3 }), plume = pool(420, { order: 3 });
  plume.forEach((s, i) => (s.material.map = BT[3 + (i % 2)])); trail.forEach((s, i) => (s.material.map = BT[(i % 2) ? 3 : 1]));
  const wall = pool(520, { order: 9, fog: false }), groundDust = pool(140, { order: 9 });
  wall.forEach((s, i) => (s.material.map = BT[3 + (i % 2)]));
  // the asteroid: the star / fireball core and its glare; the burst's ring
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); core.renderOrder = 5; scene.add(core);
  const glare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0.5 })); glare.renderOrder = 5; scene.add(glare);
  const ringTex = g3Tex((x, w) => { const g = x.createRadialGradient(w / 2, w / 2, w * 0.3, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,0.05)'); g.addColorStop(0.9, 'rgba(255,255,255,0.75)'); g.addColorStop(0.96, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); }, 512, 512);
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, fog: false, opacity: 0 })); ring.renderOrder = 4; scene.add(ring);
  // the blast wall's curtain: an opaque brown sheet just behind the front (everything behind it is gone in dust)
  const curtTex = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(150,124,96,0)'); g.addColorStop(0.35, 'rgba(146,120,92,0.85)'); g.addColorStop(1, 'rgba(120,98,76,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 16, 256);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ map: curtTex, transparent: true, depthWrite: false, fog: false })); curtain.renderOrder = 8; curtain.visible = false; scene.add(curtain);
  // birds: wings as a shallow V (flap = scale y), crows over the river and a flock that bursts from the trees at the quake
  const birdG = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.25, -1, 0.35, 0.05, 0, 0, 0.25, 0, 0, -0.25, 1, 0.35, 0.05, 0, 0, 0.25], 3)); g.computeVertexNormals(); return g; })();
  const BIRDS = []; { const R = RNG('birds'); for (let i = 0; i < 260; i++) BIRDS.push({ flock: i >= 30, cx: R.r(-400, 400), cz: R.r(-900, -250), cy: R.r(40, 160), r: R.r(30, 120), w: R.r(0.15, 0.35) * (R.f() < 0.5 ? 1 : -1), ph: R.r(0, TAU), x0: R.r(-700, 700), z0: R.r(-1100, -350), vx: R.r(-30, 10), vz: R.r(15, 40), vy: R.r(8, 20), t0: R.r(43.2, 46), s: R.r(0.5, 0.9) }); }
  const birds = IM(birdG, new THREE.MeshBasicMaterial({ color: 0x1e1c22, side: THREE.DoubleSide }), BIRDS.length, false); birds.instanceMatrix.setUsage(THREE.DynamicDrawUsage); birds.frustumCulled = false; scene.add(birds);
  // debris for the blast: shingles, planks, leaves, branches (near the camera and over the town)
  const debN = 700, deb = IM(new THREE.BoxGeometry(1, 1, 1), STD({ roughness: 0.8 }), debN, false), debL = [];
  { const R = RNG('debAst'); for (let i = 0; i < debN; i++) { const leaf = i % 3 === 0, near = i < 260; const z = near ? R.r(-90, -4) : R.r(-700, -90), x = near ? R.r(-30, 30) : R.r(-260, 260);
    debL.push({ x, z, y: terrH(x, z) + R.r(0.2, 8), tf: tFront(z), v: R.r(35, 90), up: R.r(4, 18), s: leaf ? [0.12, 0.01, 0.1] : [R.r(0.2, 1.2), R.r(0.03, 0.12), R.r(0.15, 0.5)], spin: [R.r(2, 9), R.r(2, 9), R.r(2, 9)], dx: R.n(0.25) });
    deb.setColorAt(i, lin(leaf ? R.pick(['#d8b444', '#c98a2e', '#6a8a3a']) : R.pick(['#7a5a3c', '#8a8a86', '#6a7076', '#9a7a56', '#7a3a2a']))); deb.setMatrixAt(i, _hid); } }
  deb.instanceMatrix.setUsage(THREE.DynamicDrawUsage); deb.frustumCulled = false; scene.add(deb);

  // --- the aftermath: fires (flames + dark smoke columns) on houses, haystacks and trees, wreckage strewn on the ground, embers
  const FIRES = []; { const R = RNG('fires'); HL.forEach((q, i) => { if (q.z > -720 && R.f() < 0.38) FIRES.push({ x: q.x + R.n(2), z: q.z + R.n(2), y: q.y0 + q.h * 0.4, s: R.r(8, 15), ph: R.r(0, 9), t0: q.tf + R.r(0.3, 1.6) }); });
    HAY.forEach(([x, y, z], i) => { if (R.f() < 0.5) FIRES.push({ x, z, y: y + 0.5, s: R.r(5, 9), ph: R.r(0, 9), t0: tFront(z) + R.r(0.2, 1.0) }); });
    trees.forEach((tr) => { if (tr.z > -700 && R.f() < 0.03) FIRES.push({ x: tr.x, z: tr.z, y: tr.y + 1, s: R.r(6, 11), ph: R.r(0, 9), t0: tr.tf + R.r(0.5, 2) }); });
    HL.forEach((q) => { q.collapse = q.z > -900 && R.f() < 0.42; q.tilt = R.n(0.4); }); }
  const fireTex = g3Radial([[0, 'rgba(255,250,220,1)'], [0.2, 'rgba(255,200,90,0.9)'], [0.5, 'rgba(255,110,30,0.45)'], [1, 'rgba(200,40,0,0)']], 64);
  const flames = []; FIRES.forEach((f, i) => { for (let k = 0; k < 3; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); sp.visible = false; sp.renderOrder = 9; scene.add(sp); flames.push(sp); } });
  const fireSmoke = pool(FIRES.length * 5, { order: 8 }); fireSmoke.forEach((sp, i) => (sp.material.map = BT[3 + (i % 2)]));
  const embers = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(900 * 3), 3)), new THREE.PointsMaterial({ size: 0.5, map: glowTex, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  embers.frustumCulled = false; embers.renderOrder = 9; scene.add(embers);
  const litN = 900, litter = IM(new THREE.BoxGeometry(1, 1, 1), STD({ roughness: 0.9 }), litN), LIT = [];
  { const R = RNG('litter'); for (let i = 0; i < litN; i++) { const q = HL[Math.floor(R.f() * HL.length)], x = q.x + R.n(14), z = q.z + R.n(14) + 6, s = [R.r(0.4, 3), R.r(0.06, 0.3), R.r(0.2, 1)];
    LIT.push({ x, z, y: terrH(x, z) + s[1] / 2, s, ry: R.r(0, 6), rx: R.n(0.25), tf: tFront(z) + R.r(0.1, 0.9) }); litter.setColorAt(i, lin(R.pick(['#6a4e36', '#7a5a3c', '#5a5a5e', '#8a8a86', '#4a3828', '#7a3a2a', '#3a3430']))); litter.setMatrixAt(i, _hid); } }
  litter.instanceMatrix.setUsage(THREE.DynamicDrawUsage); litter.frustumCulled = false; scene.add(litter);

  G = { r, cv, scene, FIRES, flames, fireSmoke, embers, litter, LIT, cam, sky, skyU, hemi, sun, fireL, waterU, houses, roofs, chims, HL, CHIM, fences, FEN, hay, HAY, trees, treeI, FAR, farI, porch, val, tufts, tuftL, PEOPLE, bodies, heads, COWS, cows, cowH, train,
    clouds, smoke, steam, trainSmoke, trailGlow, trail, plume, wall, groundDust, core, glare, ring, curtain, BIRDS, birds, deb, debL, BT };
  return G;
}
