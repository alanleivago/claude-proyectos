
// =====================================================================
//  SCENES — a real 3D beach (three.js, rendered into an offscreen WebGL canvas, then drawn onto the 2D canvas
//  under the HUD). One fixed high camera looking down over a busy beach towards the sea; the sun low in front.
//  Phases (all from TT): L = the flash (20-27s), Hh = heat (30-38s), X = the blast front (40-52s).
//  Everything is a pure function of TT + seeded RNG: deterministic frame by frame.
// =====================================================================
const ph = () => ({ L: EZ.i2(seg(TT, 20, 27)), Hh: EZ.io(seg(TT, 30, 38)), X: EZ.i2(seg(TT, 40, 52)) });
const SUNDIR = new THREE.Vector3(0.05, 0.05, -1).normalize();      // the visible sun, low over the sea
const LIGHTDIR = new THREE.Vector3(0.22, 0.3, -1).normalize();     // the light that casts the long shadows
const CAMZ = 20, CAMY = 13;
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// the coastline: a straight-ish beach on the left that curves out to a sandy point on the right
const shoreZ = (x) => -85 + 2.5 * Math.sin(x * 0.09 + 1) - 100 * ss(10, 50, x);
function sandH(x, z) {
  const s = z - shoreZ(x); let h = 0.3 + (s > 0 ? 0.025 * s : 0.022 * s);
  const dx = x - 30, dz = z + 172, c = Math.cos(0.35), sn = Math.sin(0.35), u = (dx * c - dz * sn) / 38, v = (dx * sn + dz * c) / 18;
  return Math.max(Math.max(h, 0.3 + 2.6 * (1 - u * u - v * v)), -10);
}
const SAND_GLSL = `
  float sss(float a, float b, float x){ float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
  float shoreZ(float x){ return -85.0 + 2.5 * sin(x * 0.09 + 1.0) - 100.0 * sss(10.0, 50.0, x); }
  float sandH(vec2 p){ float s = p.y - shoreZ(p.x); float h = 0.3 + (s > 0.0 ? 0.025 * s : 0.022 * s);
    float dx = p.x - 30.0, dz = p.y + 172.0, c = cos(0.35), sn = sin(0.35); float u = (dx * c - dz * sn) / 38.0, v = (dx * sn + dz * c) / 18.0;
    return max(max(h, 0.3 + 2.6 * (1.0 - u * u - v * v)), -10.0); }`;
// the headland on the right: layered cliffs rising out of the sea behind the sandy point
const xEdge = (z) => 44 + 0.13 * (-z - 225) + 5 * Math.sin(z * 0.05);
function headH(x, z) {
  const d = x - xEdge(z) + 7 * Math.sin(z * 0.06 + 1) + 4 * Math.sin(z * 0.17 + x * 0.05) + 2 * Math.sin(z * 0.43 + x * 0.2);
  if (d < -9) return -6;
  const Hs = 44 * Math.pow(ss(0, 48, d), 0.7) * ss(-222, -246, z) * (1 - ss(-450, -640, z)) * (0.8 + 0.2 * Math.sin(x * 0.04 + z * 0.025));
  // layered rock faces in the lower cliffs (irregular step heights), a smooth green crown above
  const st = 5.5, q = Hs / st + 0.45 * Math.sin(x * 0.13 + z * 0.07) + 0.3 * Math.sin(z * 0.23 - x * 0.09), fq = q - Math.floor(q);
  const Ht = (Math.floor(q) + ss(0.45, 1, fq) - 0.45 * Math.sin(x * 0.13 + z * 0.07) - 0.3 * Math.sin(z * 0.23 - x * 0.09)) * st;
  let H = lerp(Ht, Hs, ss(20, 34, Hs)) + 1.1 * Math.sin(x * 0.7 + z * 0.4) * Math.sin(z * 0.9 - x * 0.3) * ss(1, 4, Hs);
  return H - 6 * (1 - ss(0.2, 1.6, H));
}
const hw = (z) => 0.262 * (CAMZ - z) + 1;   // visible half-width of the beach at depth z

// small canvas textures, drawn in code
function g3Tex(draw, w = 128, h = 128) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
const g3Radial = (stops) => g3Tex((x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w); });
const IM = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = shadow; m.receiveShadow = true; return m; };
const M4c = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xeadbcc, 140, 2600);
  const cam = new THREE.PerspectiveCamera(50, W / H, 0.3, 6000);
  cam.position.set(0, CAMY, CAMZ); cam.lookAt(0, CAMY - 1.8, CAMZ - 100); scene.add(cam);

  // --- sky dome with the sun in it
  const skyU = { top: { value: lin('#c4c5de') }, hor: { value: lin('#f6dcc0') }, sunCol: { value: lin('#fff1d2') }, sunDir: { value: SUNDIR.clone() }, sunR: { value: 0.016 }, glow: { value: 1 }, flash: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 64, 32), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, hor, sunCol, sunDir; uniform float sunR, glow, flash; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(hor, top, pow(h, 0.3));
        float a = acos(clamp(dot(d, sunDir), -1.0, 1.0));
        c += sunCol * glow * 0.75 * exp(-a * a / (0.006 + flash * 0.6)) + sunCol * 0.3 * exp(-a * a / 0.035);
        c += sunCol * 0.4 * exp(-a * 5.0) + sunCol * 0.05 * exp(-a * 1.5);
        c += sunCol * 0.2 * exp(-abs(d.y) * 9.0) * exp(-abs(atan(d.x, -d.z) - atan(sunDir.x, -sunDir.z)) * 2.0);   // warm band on the horizon
        c = mix(c, sunCol * 4.0, smoothstep(sunR * 1.15, sunR * 0.85, a));
        c = mix(c, vec3(1.0), flash * 0.5);
        gl_FragColor = vec4(c, 1.0);
        // sky skips tone mapping: keeps the cream/lavender
        #include <encodings_fragment>
      }`,
  }));
  sky.position.copy(cam.position); scene.add(sky);

  // --- the blast: a churning plasma sphere far away in the sun's direction
  const blastTex = g3Tex((x, w, h) => {
    x.fillStyle = '#f08a2a'; x.fillRect(0, 0, w, h); const R = RNG('plasma');
    for (let i = 0; i < 900; i++) { const px = R.r(0, w), py = R.r(0, h), s = R.r(6, 40); const g = x.createRadialGradient(px, py, 0, px, py, s);
      const c = R.pick(['255,246,214', '255,214,120', '230,110,30', '200,70,20']); g.addColorStop(0, `rgba(${c},${R.r(0.3, 0.7)})`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(px - s, py - s, s * 2, s * 2); }
  }, 512, 256);
  const blast = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ map: blastTex, fog: false }));
  blast.position.copy(cam.position).addScaledVector(SUNDIR, 1500); scene.add(blast);
  const blastHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,200,120,1)'], [0.5, 'rgba(255,150,60,0.5)'], [1, 'rgba(255,120,40,0)']]), fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  blastHalo.position.copy(blast.position).addScaledVector(SUNDIR, -50); scene.add(blastHalo);

  // --- soft clouds: long streaks low on the horizon, puffs higher up
  const cloudTex = g3Tex((x, w, h) => { const R = RNG('cloudtex'); for (let i = 0; i < 40; i++) { const px = w / 2 + R.n(w * 0.32), py = h / 2 + R.n(h * 0.12), s = R.r(h * 0.15, h * 0.42);
    const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } }, 256, 128);
  const clouds = []; { const R = RNG('cloud4'); for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.6 }));
    const lo = i < 7; s.userData = { x: R.r(-1300, 1300), y: lo ? R.r(60, 260) : R.r(380, 1100), z: R.r(-2500, -2000), w: lo ? R.r(700, 1300) : R.r(500, 900), a: lo ? 0.1 : 0.28, v: R.r(3, 8), o: lo ? 0.3 : 0.22 }; scene.add(s); clouds.push(s); } }

  // --- lights: warm low sun behind the beach, a soft sky, and a gentle fill from behind the camera
  const hemi = new THREE.HemisphereLight(0xe6e0f2, 0xc89a68, 0.7); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd9a0, 2.7);
  sun.target.position.set(0, 0, -62); sun.position.copy(sun.target.position).addScaledVector(LIGHTDIR, 320); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 6; sun.shadow.blurSamples = 16;
  Object.assign(sun.shadow.camera, { left: -44, right: 44, top: 27, bottom: -23, near: 190, far: 460 }); sun.shadow.bias = -0.0006;
  const fill = new THREE.DirectionalLight(0xffe8d0, 0.35); fill.position.set(-30, 60, 120); scene.add(fill);

  // --- sand: dry dunes down to wet sand and the sea floor (smooth shading, grain texture, vertex-colour tones)
  const sandGeo = new THREE.PlaneGeometry(540, 450, 270, 225); sandGeo.rotateX(-Math.PI / 2); sandGeo.translate(0, 0, -200);
  { const p = sandGeo.attributes.position, R = RNG('sand'), cols = [], dry = lin('#cfa56e'), dry2 = lin('#bb8f5a'), wetC = lin('#a88a60'), floor = lin('#d9caa2');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = sandH(x, z); p.setY(i, h + R.n(0.015) + 0.04 * Math.sin(x * 0.8 + z * 0.3) * ss(0.8, 1.5, h));
      const n = 0.5 + 0.25 * Math.sin(x * 0.11 + z * 0.07) + 0.25 * Math.sin(x * 0.31 - z * 0.23 + 1.7), c = dry.clone().lerp(dry2, n * 0.7);
      if (h < 0.75) c.lerp(wetC, ss(0.75, 0.42, h)); if (h < 0.3) c.copy(wetC).lerp(floor, ss(0.3, 0.0, h));
      cols.push(c.r, c.g, c.b); }
    sandGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); sandGeo.computeVertexNormals(); }
  const sandTex = g3Tex((x, w) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, w); const R = RNG('grain');
    for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(160,130,90,${R.r(0.04, 0.09)})`; x.lineWidth = R.r(2, 6); x.beginPath(); const y0 = R.r(0, w); for (let k = 0; k <= 16; k++) x.lineTo(k * w / 16, y0 + Math.sin(k * 0.9 + i) * 6); x.stroke(); }
    for (let i = 0; i < 22000; i++) { x.fillStyle = R.f() < 0.55 ? `rgba(140,108,70,${R.r(0.06, 0.2)})` : `rgba(255,252,240,${R.r(0.15, 0.4)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 2.5), R.r(1, 2.5)); }
    for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(120,95,65,0.07)'; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), R.r(4, 9), R.r(7, 13), R.r(0, 3), 0, TAU); x.fill(); } }, 512, 512);
  sandTex.wrapS = sandTex.wrapT = THREE.RepeatWrapping; sandTex.repeat.set(90, 75); sandTex.anisotropy = ANI;
  const sandMat = new THREE.MeshStandardMaterial({ vertexColors: true, map: sandTex, roughness: 0.95, emissive: 0xff5a10, emissiveIntensity: 0 });
  const sand = new THREE.Mesh(sandGeo, sandMat); sand.receiveShadow = true; scene.add(sand);

  // --- the sea: one shader — turquoise shallows over the sand, deep blue further out, rolling foam lines, sun glitter
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uBoil: { value: 0 }, uSun: { value: SUNDIR.clone() }, uSunCol: { value: lin('#fff0d0') },
    uTop: { value: lin('#c4c5de') }, uHor: { value: lin('#f6dcc0') }, uShallow: { value: lin('#4fd6cf') }, uMid: { value: lin('#1fa5b8') }, uDeep: { value: lin('#1f6e9e') }, uFar: { value: lin('#a9b8cc') },
    uFoam: { value: 1 }, uTint: { value: lin('#b8946a') }, uTintK: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true, transparent: true,
    vertexShader: `uniform float uT, uBoil; varying vec3 vW; ${SAND_GLSL}
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); float dep = 0.3 - sandH(w.xz); float k = sss(1.5, 6.0, dep);
        w.y += k * (sin(w.x * 0.07 + uT * 1.3) * 0.12 + sin(w.z * 0.11 - uT * 1.7 + w.x * 0.03) * 0.15) + uBoil * sin(w.x * 0.7 + w.z * 0.9 + uT * 9.0) * 0.5 * max(k, 0.25);
        vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uFoam, uTintK, uBoil; uniform vec3 uSun, uSunCol, uTop, uHor, uShallow, uMid, uDeep, uFar, uTint; varying vec3 vW; ${SAND_GLSL}
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT; float dep = 0.3 - sandH(p) + uBoil * 0.0;
        float dist = length(p - cameraPosition.xz), fine = 1.0 - sss(120.0, 700.0, dist);
        vec3 n = normalize(vec3(
          0.05 * sin(p.x * 0.9 + t * 1.7) + 0.05 * sin(p.x * 2.3 - p.y * 1.1 + t * 2.6) + fine * (0.05 * sin(p.x * 5.1 + p.y * 3.7 + t * 3.1) + 0.04 * sin(p.x * 11.0 + p.y * 7.0 + t * 4.0) + 0.03 * sin(p.x * 23.0 - p.y * 17.0 + t * 6.0)),
          1.0,
          0.05 * sin(p.y * 0.8 - t * 1.5) + 0.05 * sin(p.y * 2.7 + p.x * 0.6 - t * 2.2) + fine * (0.05 * sin(p.y * 6.3 - p.x * 2.9 + t * 2.8) + 0.04 * sin(p.y * 13.0 - p.x * 5.0 + t * 5.0) + 0.03 * sin(p.y * 29.0 + p.x * 13.0 - t * 7.0))));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n);
        float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.5));
        vec3 body = mix(uShallow, uMid, sss(0.0, 2.2, dep)); body = mix(body, uDeep, sss(2.2, 9.0, dep)); body = mix(body, uFar, sss(250.0, 1400.0, dist));
        vec3 col = mix(body, skyR, fres * 0.35);
        float sd = max(dot(Rf, uSun), 0.0);
        col += uSunCol * (pow(sd, 900.0) * 9.0 + pow(sd, 60.0) * 0.5 + pow(sd, 6.0) * 0.12);
        float foam = 0.0;
        for (int k = 0; k < 5; k++) { float fk = float(k); float ph = fract(t * 0.085 + fk * 0.2); float bd = 1.55 * (1.0 - ph) - 0.03; float d = dep - bd;
          float crest = exp(-d * d / 0.0016); float trail = d < 0.0 ? exp(d / 0.07) * 0.4 : 0.0;
          float br = sss(-0.45, 0.55, sin(p.x * 0.21 + fk * 1.7 + t * 0.15) * 0.6 + sin(p.x * 0.57 - fk + p.y * 0.1) * 0.4);
          foam += (crest + trail) * (0.35 + 0.65 * br) * sss(0.0, 0.15, ph) * (1.0 - sss(0.82, 1.0, ph)); }
        float sw = 0.035 + 0.02 * sin(t * 0.9 + p.x * 0.05);
        foam += exp(-dep * dep / (sw * sw)) * 0.85;
        foam += 0.25 * sss(0.6, 1.0, sin(p.x * 3.1 + p.y * 2.3) * sin(p.x * 1.7 - p.y * 4.1 + t)) * (1.0 - sss(0.0, 1.6, dep));
        foam = clamp(foam, 0.0, 1.0) * uFoam;
        col = mix(col, vec3(1.0, 0.985, 0.95) * 1.05, foam);
        col = mix(col, uTint, uTintK);
        float al = mix(0.6, 1.0, sss(0.0, 1.3, dep)); al = max(al, foam);
        gl_FragColor = vec4(col, al);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const seaGeo = new THREE.PlaneGeometry(4400, 2800, 220, 140); seaGeo.rotateX(-Math.PI / 2); seaGeo.translate(0, 0.3, -1400 - 30);
  const seaMesh = new THREE.Mesh(seaGeo, seaMat); scene.add(seaMesh);

  // --- materials shared by the built world
  const white = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.7 }), red = new THREE.MeshStandardMaterial({ color: 0xc23a2e, roughness: 0.7 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6e5038, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x2c3540, roughness: 0.4 });

  // --- the headland: displaced layered rock, vegetation on the ledges, trees, the lighthouse on top
  const rockTex = g3Tex((x, w, h) => { x.fillStyle = '#b8ab98'; x.fillRect(0, 0, w, h); const R = RNG('rock4');
    for (let i = 0; i < 160; i++) { const px = R.r(-40, w), py = R.r(0, h), pw = R.r(30, 160), th = R.r(8, 40); x.fillStyle = `rgba(${R.pick(['120,104,86', '205,192,170', '150,132,110', '90,80,70', '170,160,140'])},${R.r(0.12, 0.3)})`;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + pw, py + R.n(6)); x.lineTo(px + pw + R.n(10), py + th); x.lineTo(px + R.n(10), py + th + R.n(6)); x.fill(); }
    for (let i = 0; i < 260; i++) { const px = R.r(0, w), py = R.r(0, h), len = R.r(15, 90); x.strokeStyle = `rgba(40,32,26,${R.r(0.25, 0.6)})`; x.lineWidth = R.r(1, 3.5); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(8), py + len * 0.5); x.lineTo(px + R.n(10), py + len); x.stroke(); }
    for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '60,50,40' : '240,230,210'},${R.r(0.08, 0.22)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 4), R.r(1, 3)); } }, 512, 512);
  rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping; rockTex.anisotropy = ANI;
  const trees = [];
  { const nx = 200, nz = 280, g = new THREE.PlaneGeometry(260, 470, nx, nz); g.rotateX(-Math.PI / 2); g.translate(150, 0, -195 - 235);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = headH(x, z); p.setY(i, y); uv.setXY(i, (x - z) * 0.03, y * 0.055); }
    g.computeVertexNormals(); const nm = g.attributes.normal, cols = [], R = RNG('headcol');
    const rockC = lin('#b8a78f'), rockD = lin('#4a4036'), grn = lin('#a2c86c'), grnD = lin('#6e9a46'), sandC = lin('#e3c79a');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i), ny = nm.getY(i);
      const veg = ss(0.5, 0.8, ny) * ss(1.5, 3.5, y), n = 0.5 + 0.5 * Math.sin(x * 0.45 + z * 0.3) * Math.sin(z * 0.21 - x * 0.13);
      const c = rockC.clone().lerp(rockD, ss(0.35, 0.05, ny) * (0.4 + 0.6 * n)).lerp(grn.clone().lerp(grnD, n), veg);
      if (y < 1.2) c.lerp(sandC, 0.6); cols.push(c.r, c.g, c.b);
      if (veg > 0.8 && R.f() < 0.05 && y > 4) trees.push([x, y, z, R.r(1.6, 3.6)]); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const head = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: rockTex, vertexColors: true, roughness: 1 })); head.receiveShadow = true; scene.add(head); var headMat = head.material; }
  // the island on the horizon, left
  { const g = new THREE.SphereGeometry(1, 64, 20, 0, TAU, 0, Math.PI / 2), p = g.attributes.position, R = RNG('isle'), cols = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), n = 1 + 0.12 * Math.sin(a * 3 + 1) + 0.05 * Math.sin(a * 9);
      p.setXYZ(i, x * n * (1 + 0.4 * Math.max(0, x)), Math.pow(y, 0.7) * (0.8 + 0.3 * Math.sin(a * 2 + 0.5)), z * n); }
    g.scale(85, 26, 40); g.computeVertexNormals();
    for (let i = 0; i < p.count; i++) { const c = lin('#8a7c68').lerp(lin('#5d7a3e'), ss(4, 9, p.getY(i))); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const isle = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); isle.position.set(-250, -2, -1450); scene.add(isle); }
  const treeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
  { const tm = IM(new THREE.IcosahedronGeometry(1, 1), treeMat, trees.length), R = RNG('trees');
    trees.forEach(([tx, ty, tz, s], i) => { tm.setMatrixAt(i, M4c(tx, ty + s * 0.5, tz, R.r(0, 3), s, s * R.r(0.8, 1.3), s)); tm.setColorAt(i, lin(R.pick(['#4f7434', '#3f6a2e', '#6a8a3f', '#577a36']))); }); scene.add(tm); }
  const lhX = xEdge(-282) + 20, lhZ = -282, lhY = headH(lhX, lhZ);
  const lh = new THREE.Group(); lh.position.set(lhX, lhY - 0.5, lhZ); scene.add(lh);
  { const lt = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.7, 15, 16), white); lt.position.y = 7.5; lh.add(lt);
    [4.5, 9.5].forEach((y) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(2.4 - y * 0.05, 2.5 - y * 0.05, 2.2, 16), red); b.position.y = y; lh.add(b); });
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.4, 16), dark); gal.position.y = 15.2; lh.add(gal);
    const hut = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 4.5), white); hut.position.set(-3.5, 1.6, 2); lh.add(hut);
    const hr = new THREE.Mesh(new THREE.ConeGeometry(4.3, 1.8, 4), red); hr.rotation.y = Math.PI / 4; hr.position.set(-3.5, 4.1, 2); hr.scale.z = 0.8; lh.add(hr); }
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.2, 12), new THREE.MeshBasicMaterial({ color: 0xfff1b0 })); lamp.position.y = 16.5; lh.add(lamp);
  const lcap = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 12), red); lcap.position.y = 18.8; lh.add(lcap);

  // --- the pier: a long deck on piles from the sandy point out to sea, a small house at the end
  { const P0 = new THREE.Vector3(34, 0, -176), P1 = new THREE.Vector3(-28, 0, -470), d = P1.clone().sub(P0), len = d.length();
    const pier = new THREE.Group(); pier.position.copy(P0); pier.rotation.y = Math.atan2(d.x, d.z); scene.add(pier);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, len), wood); deck.position.set(0, 3.4, len / 2); pier.add(deck);
    const np = Math.floor(len / 6), piles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 6), wood, np * 2 + 4);
    for (let k = 0; k < np; k++) [-1.8, 1.8].forEach((px, j) => piles.setMatrixAt(k * 2 + j, M4c(px, -1.3, k * 6 + 3)));
    for (let j = 0; j < 4; j++) piles.setMatrixAt(np * 2 + j, M4c(j % 2 ? -5 : 5, -1.3, len + (j < 2 ? 1 : 10)));
    pier.add(piles);
    const braces = new THREE.InstancedMesh(new THREE.BoxGeometry(3.8, 0.15, 0.15), wood, np); for (let k = 0; k < np; k++) braces.setMatrixAt(k, M4c(0, 1.6, k * 6 + 3, 0, 1, 1, 1, 0, 0.5)); pier.add(braces);
    [-2, 2].forEach((px) => { const rl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, len), white); rl.position.set(px, 4.6, len / 2); pier.add(rl); });
    const nr = Math.floor(len / 3), posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), white, nr * 2);
    for (let k = 0; k < nr; k++) [-2, 2].forEach((px, j) => posts.setMatrixAt(k * 2 + j, M4c(px, 4.1, k * 3))); pier.add(posts);
    const nl = Math.floor(len / 30), lamps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5, 5), dark, nl); for (let k = 0; k < nl; k++) lamps.setMatrixAt(k, M4c(k % 2 ? 2 : -2, 5.3, k * 30 + 10)); pier.add(lamps);
    const plat = new THREE.Mesh(new THREE.BoxGeometry(13, 0.5, 13), wood); plat.position.set(0, 3.4, len + 5.5); pier.add(plat);
    const house = new THREE.Mesh(new THREE.BoxGeometry(8, 3.6, 7), white); house.position.set(0, 5.4, len + 6); pier.add(house);
    const hw2 = new THREE.Mesh(new THREE.BoxGeometry(8.1, 1.1, 7.1), dark); hw2.position.set(0, 5.6, len + 6); hw2.scale.set(1, 1, 1); pier.add(hw2);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.6, 2.6, 4), red); roof.rotation.y = Math.PI / 4; roof.position.set(0, 8.5, len + 6); roof.scale.set(1.05, 1, 0.95); pier.add(roof); }

  // --- boats on the sea, buoys near the swimmers
  const boats = []; { const R = RNG('boats');
    [[-60, -330, 1], [-150, -520, 1], [-95, -700, 1], [-20, -820, 0], [-210, -900, 1], [40, -620, 1], [-40, -420, 0], [-5, -175, 2], [-120, -1050, 1]].forEach(([x, z, kind], i) => {
      const b = new THREE.Group(), s = kind === 2 ? 0.7 : R.r(0.9, 1.3);
      const hull = new THREE.Mesh(new THREE.BoxGeometry(6, 1.1, 2.2), white); hull.position.y = 0.4; b.add(hull);
      const keel = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 4), white); keel.rotation.z = -Math.PI / 2; keel.position.set(4, 0.4, 0); keel.scale.z = 0.9; b.add(keel);
      if (kind === 1) { const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 10, 4), dark); mast.position.set(0.5, 5.5, 0); b.add(mast);
        const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute([0.6, 1.4, 0, 0.6, 10.2, 0, -3.2, 1.4, 0, 0.4, 9.8, 0, 3.8, 1.2, 0, 0.4, 2, 0], 3)); sg.computeVertexNormals();
        b.add(new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xfaf6ee, side: THREE.DoubleSide, roughness: 0.8 }))); }
      else { const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.8), white); cab.position.set(-0.5, 1.4, 0); b.add(cab); const wn = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 1.6), dark); wn.position.set(0.72, 1.5, 0); b.add(wn); }
      b.scale.setScalar(s); b.rotation.y = R.r(-0.6, 0.6) + (R.f() < 0.5 ? Math.PI : 0); b.position.set(x, 0.3, z); b.userData = { x, z, v: R.r(-1.5, 1.5), ph: R.r(0, 9) }; scene.add(b); boats.push(b); }); }
  { const R = RNG('buoy'), bm = new THREE.MeshStandardMaterial({ roughness: 0.4 }), bi = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 10, 8), bm, 18);
    for (let i = 0; i < 18; i++) { const x = R.r(-60, 25), z = shoreZ(x) - R.r(45, 130); bi.setMatrixAt(i, M4c(x, 0.35, z, 0, 1, 0.9, 1)); bi.setColorAt(i, lin(R.pick(['#e8532e', '#f2b33a', '#e8532e', '#f4efe6']))); } scene.add(bi); }

  // --- beach props: lifeguard tower, sandcastle, volleyball net
  const tower = new THREE.Group(); tower.position.set(-6, sandH(-6, -54), -54); tower.rotation.y = 0.08; scene.add(tower);
  { const add = (geo, mat, x, y, z, rz = 0, rx = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); m.castShadow = true; m.receiveShadow = true; tower.add(m); return m; };
    for (const [lx, lz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) add(new THREE.BoxGeometry(0.22, 3.4, 0.22), white, lx, 1.7, lz);
    add(new THREE.BoxGeometry(0.1, 0.1, 4.2), white, -1.5, 1.6, 0, 0, 0.7); add(new THREE.BoxGeometry(0.1, 0.1, 4.2), white, 1.5, 1.6, 0, 0, -0.7);
    add(new THREE.BoxGeometry(4, 0.2, 4.6), white, 0, 3.45, 0.3);
    add(new THREE.BoxGeometry(3, 2.2, 2.6), white, 0, 4.65, -0.3);
    add(new THREE.BoxGeometry(2.4, 0.8, 0.05), dark, 0, 4.9, 1.0);
    add(new THREE.BoxGeometry(0.9, 0.35, 0.05), red, 0.6, 4.1, 1.0);
    add(new THREE.BoxGeometry(3.5, 0.18, 3.1), white, 0, 5.85, -0.3);
    add(new THREE.BoxGeometry(0.08, 0.9, 4.6), white, 1.95, 4.0, 0.3); add(new THREE.BoxGeometry(0.08, 0.9, 4.6), white, -1.95, 4.0, 0.3);
    for (const rx of [0.75, 1.65]) add(new THREE.BoxGeometry(0.1, 0.1, 4.4), white, rx, 1.7, 4.0, 0, -0.9);
    for (let k = 0; k < 9; k++) add(new THREE.BoxGeometry(0.9, 0.06, 0.25), white, 1.2, 0.25 + k * 0.36, 5.55 - k * 0.29);
    add(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 4), white, -1.6, 7.0, -1.5); add(new THREE.BoxGeometry(0.05, 0.5, 0.8), red, -1.6, 7.8, -1.1); }
  const castleMat = new THREE.MeshStandardMaterial({ color: 0xd2ad78, roughness: 1 });
  { const c = new THREE.Group(); c.position.set(5, sandH(5, -47), -47); scene.add(c);
    const add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, castleMat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; c.add(m); };
    add(new THREE.CylinderGeometry(1.7, 1.9, 0.5, 10), 0, 0.25, 0); add(new THREE.BoxGeometry(2.2, 0.7, 2.2), 0, 0.85, 0);
    add(new THREE.CylinderGeometry(0.5, 0.55, 1.6, 10), 0, 1.6, 0); add(new THREE.ConeGeometry(0.55, 0.7, 10), 0, 2.75, 0);
    for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) { add(new THREE.CylinderGeometry(0.28, 0.32, 1.3, 8), x, 0.9, z); add(new THREE.ConeGeometry(0.33, 0.45, 8), x, 1.78, z); }
    add(new THREE.TorusGeometry(2.4, 0.18, 6, 20).rotateX(Math.PI / 2), 0, 0.05, 0); }
  { const net = new THREE.Group(); net.position.set(14, sandH(14, -40), -40); net.rotation.y = 0.12; scene.add(net);
    const pm = new THREE.MeshStandardMaterial({ color: 0xe8e2d6 }); [-4.5, 4.5].forEach((px) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), pm); p.position.set(px, 1.3, 0); p.castShadow = true; net.add(p); });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.9), new THREE.MeshStandardMaterial({ map: g3Tex((x, w, h) => { x.strokeStyle = 'rgba(30,30,30,0.9)'; x.lineWidth = 2; for (let i = 0; i <= w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j <= h; j += 8) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, 6); }, 256, 32), transparent: true, side: THREE.DoubleSide, alphaTest: 0.1 }));
    mesh.position.y = 2.1; mesh.castShadow = true; net.add(mesh); }

  // --- the crowd: smooth instanced bodies in swimwear (skin, trunks / bikini, arms, hair); towels, umbrellas
  const SUIT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#1f2d3d', '#7b4fc9', '#ef8a3a', '#3cae5c', '#f4f1ea', '#c2185b', '#1e88e5'];
  const SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'], HAIR = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#8a4a2a'];
  const UMB = [['#d94848', '#f6f1e6'], ['#2f5fd1', '#f6f1e6'], ['#8a4fc9', '#f6f1e6'], ['#e86fa8', '#f6f1e6'], ['#2a9d6f', '#f0c33c'], ['#f08a2a', '#f6f1e6'], ['#e04040', '#2f5fd1'], ['#1e88c5', '#f0c33c']];
  const TOWC = ['#e86fa8', '#2f6fd1', '#f0c33c', '#7b4fc9', '#2a9d8f', '#f4f1ea', '#ef8a3a', '#5fc3e4', '#c2185b'];
  const R = RNG('crowd5'), ppl = [], tows = [], ums = [], chairs = [], boards = [], coolers = [], balls = [];
  const onBeach = (x, z, m = 1.5) => z < -6.5 && z > shoreZ(x) + m && Math.abs(x) < hw(z) && sandH(x, z) > 0.45 && !(Math.abs(x + 6) < 3.5 && Math.abs(z + 52) < 5) && !(Math.abs(x - 5) < 2.6 && Math.abs(z + 47) < 2.6);
  const spot = (zMin, zMax, m) => { for (let k = 0; k < 60; k++) { const z = lerp(zMin, zMax, Math.pow(R.f(), 0.85)), x = R.r(-hw(z), hw(z)); if (onBeach(x, z, m)) return [x, z]; } return [0, -30]; };
  const person = (x, z, pose, yaw, o = {}) => { const kid = R.f() < 0.1; ppl.push(Object.assign({ x, z, pose, yaw, female: R.f() < 0.5, kid, s: kid ? R.r(0.58, 0.72) : R.r(0.9, 1.1), w: R.r(0.86, 1.25),
    c: { skin: lin(R.pick(SKIN)), suit: lin(R.pick(SUIT)), hair: lin(R.pick(HAIR)) }, ph: R.f() * TAU, arm: R.pick([0, 0, 0.1, 0.3]), wave: false, walk: false,
    run: 20.6 + R.r(0, 2.4), v: R.r(3.5, 6.5), dx: R.n(1.2), stay: R.f() < 0.07 }, o)); };
  // a few placed like the reference's foreground: a blue umbrella, two sunbathers, a man walking
  ums.push({ x: 0.5, z: -19, c: UMB[1], tilt: 0.05, ig: 31 });
  tows.push({ x: -1.6, z: -10, yaw: 0.05, c: '#5fc3e4' }, { x: 1.4, z: -10.3, yaw: -0.05, c: '#e86fa8' });
  person(-1.6, -10, 'lie', 0.05); person(1.4, -10.3, 'lie', -0.05); person(5.6, -11, 'stand', 0.3, { fwd: true, female: false, s: 1.05 });
  coolers.push([2.9, -15, 0.3, '#2a9d6f']); chairs.push([-0.6, -16.5, 0.2, '#e86fa8']);
  // towels with sunbathers
  for (let i = 0; i < 60; i++) { const [x, z] = spot(-8, -82, 3), yaw = R.r(-0.5, 0.5); tows.push({ x, z, yaw, c: R.pick(TOWC) }); const k = R.f();
    if (k < 0.5) person(x, z, R.f() < 0.65 ? 'lie' : 'lieb', yaw); else if (k < 0.72) person(x, z + 0.3, 'sit', yaw + R.n(0.4)); }
  // umbrellas, each with a little camp around it
  for (let i = 0; i < 34; i++) { const [x, z] = spot(-12, -82, 3.5); ums.push({ x, z, c: R.pick(UMB), tilt: R.n(0.16), ig: R.r(30.5, 35) }); const k = R.f();
    if (k < 0.45) chairs.push([x + R.r(-1, 1), z + R.r(0.4, 1.4), R.n(0.4), R.pick(TOWC)]);
    if (k > 0.3) person(x + R.r(-1.2, 1.2), z + R.r(0.5, 1.6), R.f() < 0.5 ? 'sit' : 'stand', R.n(0.8));
    if (R.f() < 0.4) coolers.push([x + R.r(-1.5, 1.5), z + R.r(-1, 1), R.r(0, 3), R.pick(['#d94848', '#2f6fd1', '#2a9d8f', '#f4f1ea'])]); }
  for (let i = 0; i < 10; i++) { const [x, z] = spot(-8, -80, 3); chairs.push([x, z, R.n(0.5), R.pick(TOWC)]); }
  for (let i = 0; i < 9; i++) { const [x, z] = spot(-8, -80, 3); boards.push([x, z, R.r(0, 3), R.pick(['#2a9d8f', '#f0c33c', '#e86fa8', '#2f6fd1', '#f4f1ea'])]); }
  for (let i = 0; i < 12; i++) { const [x, z] = spot(-8, -80, 3); coolers.push([x, z, R.r(0, 3), R.pick(['#d94848', '#2f6fd1', '#2a9d8f', '#f4f1ea'])]); }
  for (let i = 0; i < 10; i++) { const [x, z] = spot(-8, -80, 2); balls.push([x, z, R.pick(['#f0c33c', '#e86fa8', '#2f6fd1', '#ffffff'])]); }
  // standing groups and pairs
  for (let gI = 0; gI < 26; gI++) { const [cx, cz] = spot(-10, -80, 3), n = R.f() < 0.45 ? 2 : 3 + Math.floor(R.f() * 3), rr = n === 2 ? 0.45 : 0.8;
    for (let k = 0; k < n; k++) { const a = (k / n) * TAU + R.n(0.3), x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr; person(x, z, 'stand', Math.atan2(cx - x, cz - z), { wave: R.f() < 0.06 }); } }
  // a crowd gathering at the shoreline on the right, facing the sea
  for (let i = 0; i < 90; i++) { const x = R.r(-2, 26), z = shoreZ(x) + R.r(1.2, 12) * (0.4 + 0.6 * R.f()); if (!onBeach(x, z, 0.8)) continue; person(x, z, 'stand', Math.PI + R.n(0.7), { wave: R.f() < 0.08 }); }
  // walkers along the beach
  for (let i = 0; i < 18; i++) { const [x, z] = spot(-10, -85, 1.5); person(x, z, 'stand', 0, { walk: true }); }
  // swimmers waist-deep, a few swimming
  for (let i = 0; i < 56; i++) { const x = R.r(-30, 22), dep = R.r(0.15, 1.15), z = shoreZ(x) - dep / 0.022; if (Math.abs(x) > hw(z) + 4) continue;
    person(x, z, dep > 0.75 && R.f() < 0.3 ? 'float' : 'swim', R.r(-Math.PI, Math.PI), { swim: true, wave: R.f() < 0.15 }); }
  ppl.forEach((q) => { q.swim = !!q.swim; });
  const N = ppl.length;
  const pplMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  const PG = {
    leg: [new THREE.CapsuleGeometry(0.075, 0.66, 4, 10).translate(0, -0.4, 0), 2, 'skin'],
    arm: [new THREE.CapsuleGeometry(0.052, 0.5, 4, 8).translate(0, -0.3, 0), 2, 'skin'],
    torso: [new THREE.CapsuleGeometry(0.16, 0.36, 6, 14).scale(1, 1, 0.68), 1, 'skin'],
    hips: [new THREE.CylinderGeometry(0.17, 0.15, 0.2, 14).scale(1, 1, 0.75), 1, 'suit'],
    top: [new THREE.CylinderGeometry(0.168, 0.17, 0.12, 14).scale(1, 1, 0.74), 1, 'suit'],
    head: [new THREE.SphereGeometry(0.115, 16, 12), 1, 'skin'],
    hair: [new THREE.SphereGeometry(0.122, 16, 8, 0, TAU, 0, Math.PI * 0.55), 1, 'hair'],
  };
  const PM = {}; for (const k in PG) { const [geo, n] = PG[k]; const m = IM(geo, pplMat, N * n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); PM[k] = m; }
  ppl.forEach((q, i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setColorAt(i * PG[k][1] + j, q.c[PG[k][2]]); });

  // umbrellas: scalloped canopies in two-colour panels, poles
  function canopy(parity) {
    const pos = [], n = 10, r = 1.35, h = 0.6;
    for (let i = parity; i < n; i += 2) { const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU, am = (a0 + a1) / 2;
      const P0 = [Math.cos(a0) * r, 0, Math.sin(a0) * r], P1 = [Math.cos(a1) * r, 0, Math.sin(a1) * r], Pm = [Math.cos(am) * r * 0.93, 0.1, Math.sin(am) * r * 0.93];
      pos.push(0, h, 0, ...P1, ...Pm, 0, h, 0, ...Pm, ...P0); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  }
  const NU = ums.length, umbMat = new THREE.MeshStandardMaterial({ flatShading: true, side: THREE.DoubleSide, roughness: 0.85 });
  const canA = IM(canopy(0), umbMat, NU), canB = IM(canopy(1), umbMat, NU), poles = IM(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 5).translate(0, 1.2, 0), umbMat, NU);
  const towels = IM(new THREE.BoxGeometry(0.95, 0.03, 1.9), new THREE.MeshStandardMaterial({ roughness: 1 }), tows.length, false);
  tows.forEach((t, i) => { towels.setMatrixAt(i, M4c(t.x, sandH(t.x, t.z) + 0.02, t.z, t.yaw)); towels.setColorAt(i, lin(t.c)); });
  [canA, canB, poles, towels].forEach((m) => scene.add(m));
  // chairs, boards, coolers, balls
  const propMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  const seat = IM(new THREE.BoxGeometry(0.6, 0.06, 0.95), propMat, chairs.length), back = IM(new THREE.BoxGeometry(0.6, 0.75, 0.05), propMat, chairs.length);
  chairs.forEach(([x, z, yaw, c], i) => { const b = M4c(x, sandH(x, z), z, yaw); seat.setMatrixAt(i, b.clone().multiply(M4c(0, 0.28, 0))); back.setMatrixAt(i, b.clone().multiply(M4c(0, 0.55, -0.55, 0, 1, 1, 1, -0.55))); seat.setColorAt(i, lin(c)); back.setColorAt(i, lin(c)); });
  const brd = IM(new THREE.CapsuleGeometry(0.26, 1.5, 4, 10).rotateX(Math.PI / 2).scale(1, 0.14, 1), propMat, boards.length);
  boards.forEach(([x, z, yaw, c], i) => { brd.setMatrixAt(i, M4c(x, sandH(x, z) + 0.05, z, yaw)); brd.setColorAt(i, lin(c)); });
  const cbox = IM(new THREE.BoxGeometry(0.62, 0.42, 0.42), propMat, coolers.length), clid = IM(new THREE.BoxGeometry(0.66, 0.08, 0.46), propMat, coolers.length);
  coolers.forEach(([x, z, yaw, c], i) => { const b = M4c(x, sandH(x, z), z, yaw); cbox.setMatrixAt(i, b.clone().multiply(M4c(0, 0.21, 0))); clid.setMatrixAt(i, b.clone().multiply(M4c(0, 0.45, 0))); cbox.setColorAt(i, lin(c)); clid.setColorAt(i, lin('#f4f1ea')); });
  const bls = IM(new THREE.SphereGeometry(0.22, 14, 10), propMat, balls.length); balls.forEach(([x, z, c], i) => { bls.setMatrixAt(i, M4c(x, sandH(x, z) + 0.22, z)); bls.setColorAt(i, lin(c)); });
  [seat, back, brd, cbox, clid, bls].forEach((m) => scene.add(m));

  // --- kites over the beach: a big red diamond with a bow tail, smaller multicolour diamonds and deltas
  const kiteMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, flatShading: true, roughness: 0.8, emissive: 0x000000 });
  function kiteGeo(cols, delta) {
    const pos = [], col = [], P = delta ? [[0, 1, 0], [1.4, -0.5, 0], [0, -0.2, 0.15], [-1.4, -0.5, 0]] : [[0, 1.25, 0], [0.85, 0.3, 0], [0, -1.25, 0], [-0.85, 0.3, 0]], C = [0, 0, 0.18];
    for (let k = 0; k < 4; k++) { if (delta && k === 1) continue; const a = P[k], b = P[(k + 1) % 4]; pos.push(...C, ...a, ...b); const c = lin(cols[k % cols.length]); for (let j = 0; j < 3; j++) col.push(c.r, c.g, c.b); }
    if (delta) { pos.push(...P[1], ...P[2], ...P[3]); const c = lin(cols[1]); for (let j = 0; j < 3; j++) col.push(c.r, c.g, c.b); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  }
  const kites = [
    { p: [11, 29, -112], s: 4.3, cols: ['#d8322a', '#b8241f', '#e2443a', '#c52a24'], tail: 8, a: [3, 1.3, -76] },
    { p: [-24, 31, -150], s: 1.0, cols: ['#f0c33c', '#e04040', '#f0c33c', '#2f6fd1'], tail: 4, a: [-12, 1.3, -70] },
    { p: [14, 27, -170], s: 1.0, cols: ['#3cae5c', '#f0c33c', '#2f6fd1', '#e86fa8'], tail: 4, a: [8, 1.3, -70] },
    { p: [-8, 22, -140], s: 0.9, cols: ['#2f6fd1', '#f4f1ea', '#e04040', '#f0c33c'], tail: 4, a: [-4, 1.3, -60] },
    { p: [3, 26, -190], s: 1.1, cols: ['#e04040', '#f0c33c', '#2f6fd1', '#3cae5c'], tail: 0, delta: true, a: [10, 1.3, -78] },
    { p: [30, 34, -210], s: 1.3, cols: ['#7b4fc9', '#e04040', '#f0c33c', '#3cae5c'], tail: 0, delta: true, a: [16, 1.3, -80] },
    { p: [-3, 18, -200], s: 0.9, cols: ['#f08a2a', '#2f6fd1', '#f0c33c', '#e86fa8'], tail: 3, a: [2, 1.3, -82] },
  ];
  kites.forEach((k, i) => { if (i) k.s *= 1.7; k.m = new THREE.Mesh(kiteGeo(k.cols, k.delta), kiteMat); k.m.scale.setScalar(k.s); scene.add(k.m); k.ph = i * 1.7; });
  const NB = kites.reduce((a, k) => a + k.tail, 0);
  const bowGeo = new THREE.BufferGeometry(); bowGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -0.5, 0.25, 0, -0.5, -0.25, 0, 0, 0, 0, 0.5, -0.25, 0, 0.5, 0.25, 0], 3)); bowGeo.computeVertexNormals();
  const bows = new THREE.InstancedMesh(bowGeo, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8 }), NB); scene.add(bows);
  { const BC = ['#e04040', '#f0c33c', '#3cae5c', '#2f6fd1', '#7b4fc9', '#e86fa8']; for (let i = 0; i < NB; i++) bows.setColorAt(i, lin(BC[i % BC.length])); }
  const strings = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(kites.length * 6), 3)), new THREE.LineBasicMaterial({ color: 0xf6efe2, transparent: true, opacity: 0.7 }));
  strings.frustumCulled = false; scene.add(strings);
  // a small plane crossing far away
  const plane = new THREE.Group(); { const pm = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.6 });
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 15, 4, 10).rotateZ(Math.PI / 2), pm); plane.add(fus);
    const wg = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 26), pm); wg.position.x = 0.5; plane.add(wg);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 8), pm); tl.position.x = 8; plane.add(tl);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(2, 3.4, 0.2), pm); fin.position.set(8.4, 1.8, 0); plane.add(fin); }
  plane.rotation.y = 0.25; scene.add(plane);

  // --- foreground palm fronds framing the top corners (attached to the camera)
  const frondMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, flatShading: true, roughness: 0.85, emissive: 0x0f2610 });
  function frondGeo(len, lw, curve, key) {
    const R = RNG(key), pos = [], col = [], n = 10, g1 = lin('#33602c'), g2 = lin('#5c8a3c'), g0 = lin('#1f3d1a');
    const P = (t) => [t * len, -0.18 * t * t * len, curve * t * t * len];
    const tri = (a, b, c, cl) => { pos.push(...a, ...b, ...c); for (let k = 0; k < 3; k++) col.push(cl.r, cl.g, cl.b); };
    for (let i = 1; i < n; i++) { const t = i / n, b = P(t), b2 = P(t + 0.7 / n), tg = [b2[0] - b[0], b2[1] - b[1], b2[2] - b[2]], tl = Math.hypot(...tg); tg.forEach((v, k) => (tg[k] = v / tl));
      for (const side of [-1, 1]) { const L = lw * (0.25 + 0.95 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * R.r(0.85, 1.1);
        const d = [0.95 * tg[0], -0.3 - 0.3 * t, side * 0.7 + 0.95 * tg[2]], dl = Math.hypot(...d); d.forEach((v, k) => (d[k] = v / dl));
        const tip = [b[0] + d[0] * L, b[1] + d[1] * L, b[2] + d[2] * L], mid = [b[0] + d[0] * L * 0.45, b[1] + d[1] * L * 0.45 + 0.04 * L, b[2] + d[2] * L * 0.45], w = 0.17 * len / 4;
        const sA = [mid[0] + tg[0] * w, mid[1] + tg[1] * w, mid[2] + tg[2] * w], sB = [mid[0] - tg[0] * w, mid[1] - tg[1] * w - 0.03 * L, mid[2] - tg[2] * w];
        const k = R.f(); tri(b, sA, tip, g1.clone().lerp(g2, 0.3 + 0.7 * k)); tri(b, tip, sB, g0.clone().lerp(g1, k)); tri(b, b2, sA, g1); }
      tri([b[0], b[1] + 0.03, b[2]], [b2[0], b2[1] + 0.03, b2[2]], [b[0], b[1] - 0.03, b[2]], lin('#5b7a33')); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  }
  const fronds = [];
  [[-1, [-1.6, 2.75, -5.6], [-0.35, -0.8, -1.2, -1.55], [3.0, 4.2, 4.6, 3.8]], [1, [1.6, 2.2, -5.6], [Math.PI + 0.35, Math.PI + 0.75, Math.PI + 1.15], [3.6, 4.0, 3.0]]].forEach(([sd, hub, angs, lens], gi) => {
    angs.forEach((a, i) => { const o = new THREE.Group(); o.position.set(...hub); o.rotation.z = a; o.userData.s = 0.36; cam.add(o);
      const m = new THREE.Mesh(frondGeo(lens[i], lens[i] * 0.5, 0.1 * sd, 'fr' + gi + i), frondMat); m.rotation.x = Math.PI / 2 - 0.35; o.add(m); fronds.push({ o, a, ph: gi * 2 + i * 0.7 }); }); });

  // --- fire, smoke and steam sprites (a pool, placed each frame)
  const flameTex = g3Radial([[0, 'rgba(255,250,210,1)'], [0.3, 'rgba(255,190,70,0.9)'], [0.7, 'rgba(255,90,20,0.4)'], [1, 'rgba(255,60,0,0)']]);
  const smokeTex = g3Tex((x, w) => { const R = RNG('smk'); for (let i = 0; i < 26; i++) { const px = w / 2 + R.n(w * 0.22), py = w / 2 + R.n(w * 0.22), s = R.r(w * 0.15, w * 0.32); const g = x.createRadialGradient(px, py, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } });
  const pool = (n, tex, add) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); s.visible = false; scene.add(s); return s; });
  const flames = pool(NU * 2 + 60, flameTex, true), smokes = pool(NU * 4 + 60, smokeTex, false), steams = pool(60, smokeTex, false);
  smokes.concat(steams).forEach((s) => { s.material.depthTest = false; s.renderOrder = 10; });   // no hard cut where a puff meets the water/sand
  const lhGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 })); lhGlow.position.set(lhX, lhY + 16, lhZ); lhGlow.scale.set(9, 9, 1); scene.add(lhGlow);

  G = { cv, r, scene, cam, skyU, blast, blastHalo, clouds, hemi, sun, fill, sandMat, seaMat, boats, PM, PG, ppl, canA, canB, poles, ums, flames, smokes, steams, white, red, wood, dark, pplMat, umbMat,
    headMat, treeMat, castleMat, propMat, towels, kites, kiteMat, bows, strings, plane, fronds, frondMat };
  return G;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _hid = new THREE.Matrix4().makeScale(0, 0, 0);
const _char = lin('#2a1c14'), _v3c = new THREE.Color(), _cw = lin('#ffffff');

function update3D(p) {
  const g = g3(), { L, Hh, X } = p;
  // sky, sun, exposure
  g.skyU.top.value.copy(lin('#c3bfe6')).lerp(lin('#fff6e8'), L).lerp(lin('#f3b071'), Hh).lerp(lin('#e88a3c'), X);
  g.skyU.hor.value.copy(lin('#fde2bd')).lerp(lin('#ffffff'), L).lerp(lin('#ffd08a'), Hh).lerp(lin('#ffb060'), X);
  g.skyU.sunR.value = 0.016 + 0.32 * L * L; g.skyU.flash.value = L * (1 - Hh * 0.6); g.skyU.glow.value = 1 + 2 * L;
  g.r.toneMappingExposure = 0.82 + 2.4 * L * (1 - Hh * 0.75);
  g.scene.fog.color.copy(lin('#eadbcc').lerp(lin('#ffffff'), L).lerp(lin('#e9a463'), Hh).lerp(lin('#d9772f'), X));
  g.scene.fog.near = lerp(140, 20, Math.max(Hh * 0.4, X)); g.scene.fog.far = lerp(2600, 260, X * X);
  g.sun.intensity = 2.7 + 9 * L; g.sun.color.set('#ffd9a0').lerp(lin('#ff9a4c'), Hh);
  g.hemi.intensity = 0.7 + 1.2 * L; g.hemi.color.set('#e6e0f2').lerp(lin('#ffb070'), Hh);
  g.sandMat.color.set('#ffffff').lerp(lin('#c07a40'), Hh * 0.6); g.sandMat.emissiveIntensity = 0.25 * Hh * (0.8 + 0.2 * Math.sin(TT * 7));
  const su = g.seaMat.uniforms, boil = seg(TT, 34, 40);
  su.uT.value = TT; su.uBoil.value = boil; su.uTop.value.copy(g.skyU.top.value); su.uHor.value.copy(g.skyU.hor.value); su.uFoam.value = 1 - Hh; su.uTintK.value = 0.35 * boil;
  su.fogColor.value.copy(g.scene.fog.color); su.fogNear.value = g.scene.fog.near; su.fogFar.value = g.scene.fog.far;
  g.clouds.forEach((c) => { const u = c.userData; c.position.set(mod(u.x + TT * u.v + 1400, 2800) - 1400, u.y, u.z); c.scale.set(u.w, u.w * u.a, 1); c.material.opacity = u.o * (1 - L); });
  // the blast
  const ang = (1 + 42 * X) * DEG, br = Math.min(1450, 1500 * Math.tan(ang));
  g.blast.visible = X > 0; g.blast.scale.setScalar(br); g.blast.rotation.set(0, TT * 0.06, 0);
  g.blastHalo.visible = X > 0; g.blastHalo.scale.setScalar(br * 3); g.blastHalo.material.opacity = 0.3 * Math.min(1, X * 6);
  g.boats.forEach((bt) => { const u = bt.userData; bt.position.x = u.x + TT * u.v; bt.position.y = 0.3 - boil * 4 + Math.sin(TT * 1.3 + u.ph) * 0.12; bt.rotation.z = Math.sin(TT * 1.5 + u.ph) * 0.05; });
  // char the world
  [g.white, g.red, g.wood, g.dark].forEach((m, i) => m.color.set(['#f4efe6', '#c23a2e', '#6e5038', '#2c3540'][i]).lerp(_char, Hh * 0.8));
  g.headMat.color.set('#ffffff').lerp(lin('#5a3a26'), Hh * 0.8); g.treeMat.color.set('#ffffff').lerp(lin('#1e130c'), seg(TT, 31, 37));
  g.castleMat.color.set('#d2ad78').lerp(lin('#c07a40'), Hh * 0.6); g.propMat.color.set('#ffffff').lerp(_char, Hh * 0.85); g.towels.material.color.set('#ffffff').lerp(_char, Hh * 0.85);
  g.kiteMat.color.set('#ffffff').lerp(_char, Hh * 0.9); g.bows.material.color.set('#ffffff').lerp(_char, Hh * 0.9);
  g.frondMat.color.set('#ffffff').lerp(lin('#1e130c'), seg(TT, 31, 36)); g.frondMat.emissive.set('#0f2610').lerp(lin('#ff5a10'), 0.12 * seg(TT, 31, 33) * (1 - seg(TT, 35, 38))).lerp(lin('#000000'), seg(TT, 35, 38));
  g.fronds.forEach((f, i) => { const curl = seg(TT, 32, 38); f.o.rotation.z = f.a + Math.sin(TT * 0.7 + f.ph) * 0.015 + Math.sin(TT * 1.9 + f.ph) * 0.006; f.o.scale.setScalar(f.o.userData.s * (1 - 0.18 * curl)); });
  // kites sway on their strings; tails trail behind
  { const sp = g.strings.geometry.attributes.position; let bi = 0;
    g.kites.forEach((k, i) => { const x = k.p[0] + Math.sin(TT * 0.45 + k.ph) * 1.6, y = k.p[1] + Math.sin(TT * 0.8 + k.ph) * 0.8 - 45 * seg(TT, 31 + i * 0.4, 36) ** 2, z = k.p[2];
      k.m.position.set(x, y, z); k.m.visible = TT < 36; k.m.rotation.set(-0.35, Math.sin(TT * 0.6 + k.ph) * 0.15, Math.sin(TT * 0.9 + k.ph) * 0.12);
      sp.setXYZ(i * 2, x, y - 0.2 * k.s, z); sp.setXYZ(i * 2 + 1, ...k.a);
      for (let j = 0; j < k.tail; j++) { const t = j + 1, bx = x + Math.sin(TT * 1.6 + k.ph - j * 0.6) * 0.18 * t * k.s + 0.1 * t * k.s, by = y - k.s * (1.3 + 0.5 * t);
        g.bows.setMatrixAt(bi++, M4c(bx, by, z + 0.2 * t, 0, k.s * 0.32, k.s * 0.32, k.s * 0.32, 0, Math.sin(TT * 3 + j) * 0.3)); } });
    sp.needsUpdate = true; g.bows.instanceMatrix.needsUpdate = true; g.bows.visible = g.strings.visible = TT < 36; }
  g.plane.visible = TT < 22; g.plane.position.set(48 - TT * 4, 92, -420);

  // the crowd
  let fi = 0, si = 0; const flames = g.flames, smokes = g.smokes;
  const PM = g.PM, PG = g.PG, M4 = () => new THREE.Matrix4(), Tr = (x, y, z) => M4().makeTranslation(x, y, z), Rx = (a) => M4().makeRotationX(a), Rz = (a) => M4().makeRotationZ(a);
  const hide = (i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setMatrixAt(i * PG[k][1] + j, _hid); };
  g.ppl.forEach((q, i) => {
    let x = q.x, z = q.z, y, yaw = q.yaw, swing = 0, pose = q.pose, armR = q.arm, armL = q.arm, armRx = 0;
    if (q.swim) {
      if (TT > 30) return hide(i);
      y = sandH(x, z) + Math.sin(TT * 2 + q.ph) * 0.05;
      if (pose === 'float') { y = 0.15 + Math.sin(TT * 2 + q.ph) * 0.04; swing = Math.sin(TT * 3 + q.ph) * 1.2; }
      else { swing = Math.sin(TT * 1.5 + q.ph) * 0.2; armL = armR = 0.5; if (q.wave) armR = 2.6 + Math.sin(TT * 8 + q.ph) * 0.3; }
    } else {
      const run = !q.stay && TT > q.run;
      if (q.fwd) { z = q.z - Math.min(TT, 20.6) * 0.32; yaw = Math.PI - 0.15; if (TT < 20.6) swing = Math.sin(TT * 4 + q.ph) * 0.4; }
      else if (q.walk && TT < 20) { x += Math.sin(TT * 0.2 + q.ph) * 4; yaw = Math.cos(TT * 0.2 + q.ph) > 0 ? Math.PI / 2 : -Math.PI / 2; swing = Math.sin(TT * 6 + q.ph) * 0.45; }
      if (q.wave && TT < 20 && pose === 'stand') armR = 2.5 + Math.sin(TT * 8 + q.ph) * 0.3;
      if (run) { const k = TT - q.run; z += k * q.v; x += k * q.dx; yaw = Math.atan2(q.dx, q.v); swing = Math.sin(TT * 11 + q.ph) * 0.8; pose = 'stand'; armR = armL = 0.15; if (z > 6) return hide(i); }
      y = sandH(x, z);
    }
    const s = q.s, w = q.w, base = M4().compose(_v.set(x, y, z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(s * w, s, s * w));
    let legA = null;
    if (pose === 'lie' || pose === 'float') base.multiply(Tr(0, 0.12, 0)).multiply(Rx(Math.PI / 2)).multiply(Tr(0, -0.85, 0));
    else if (pose === 'lieb') { base.multiply(Tr(0, 0.12, 0)).multiply(Rx(-Math.PI / 2)).multiply(Tr(0, -0.85, 0)); armL = armR = 0.25; }
    else if (pose === 'sit') { base.multiply(Tr(0, -0.68, 0)); legA = -1.45; armRx = 0.45; armL = armR = 0.25; }
    const put = (k, j, m) => PM[k].setMatrixAt(i * PG[k][1] + j, _m.copy(base).multiply(m));
    for (const j of [0, 1]) put('leg', j, Tr(j ? 0.09 : -0.09, 0.82, 0).multiply(Rx(legA !== null ? legA + (j ? 0.1 : -0.05) : (j ? swing : -swing))));
    for (const j of [0, 1]) put('arm', j, Tr(j ? 0.21 : -0.21, 1.36, 0).multiply(Rz((j ? 1 : -1) * (0.12 + (j ? armR : armL)))).multiply(Rx(armRx + (pose === 'float' ? (j ? -swing : swing) * 1.5 : (j ? -swing : swing)))));
    put('hips', 0, Tr(0, 0.86, 0)); put('torso', 0, Tr(0, 1.14, 0)); put('head', 0, Tr(0, 1.58, 0)); put('hair', 0, Tr(0, 1.6, -0.01));
    if (q.female) put('top', 0, Tr(0, 1.24, 0.005)); else PM.top.setMatrixAt(i, _hid);
    const dk = Hh * 0.92;
    for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setColorAt(i * PG[k][1] + j, _v3c.copy(q.c[PG[k][2]]).lerp(_char, dk));
  });
  for (const k in PM) { PM[k].instanceMatrix.needsUpdate = true; PM[k].instanceColor.needsUpdate = true; }

  // umbrellas, burning
  g.ums.forEach((u, i) => {
    const y = sandH(u.x, u.z), burnt = TT > u.ig + 4.5;
    const mp = new THREE.Matrix4().compose(_v.set(u.x, y, u.z), _q.setFromEuler(_e.set(u.tilt, 0, u.tilt * 0.5)), _s.set(1, 1, 1));
    g.poles.setMatrixAt(i, mp);
    const mc = burnt ? _hid : _m.copy(mp).multiply(new THREE.Matrix4().makeTranslation(0, 2.25, 0));
    g.canA.setMatrixAt(i, mc); g.canB.setMatrixAt(i, mc);
    const dk = Math.max(Hh * 0.7, seg(TT, u.ig, u.ig + 4));
    g.canA.setColorAt(i, _v3c.copy(lin(u.c[0])).lerp(_char, dk)); g.canB.setColorAt(i, _v3c.copy(lin(u.c[1])).lerp(_char, dk)); g.poles.setColorAt(i, _v3c.copy(lin('#e8e2d6')).lerp(_char, Hh * 0.8));
    if (TT > u.ig) {   // flames + smoke column
      const R = RNG('fl' + i, F);
      for (let k = 0; k < 2 && fi < flames.length; k++) { const f = flames[fi++]; f.visible = true; const sz = (burnt ? 0.8 : 1.7) * R.r(0.8, 1.2); f.position.set(u.x + R.n(0.5), y + (burnt ? 0.6 : 2.5) + R.r(0, 0.6), u.z); f.scale.set(sz, sz * 1.5, 1); f.material.opacity = 0.7; }
      const S = RNG('sm' + i);
      for (let k = 0; k < 4 && si < smokes.length; k++) { const sm = smokes[si++], age = mod(TT * 0.22 + k / 4 + S.f(), 1); sm.visible = true; sm.position.set(u.x + age * 6 + S.n(1), y + 3 + age * 30, u.z - age * 2); const sz = 3 + age * 16; sm.scale.set(sz, sz, 1); sm.material.color.set('#3a312b'); sm.material.opacity = 0.75 * (1 - age) * Math.min(1, age * 6) * seg(TT, u.ig, u.ig + 1.5) * (1 - 0.85 * seg(TT, 40, 44)); }
    }
  });
  // ground fires spreading after 33s
  if (TT > 33) { const R = RNG('gf'); for (let k = 0; k < 60 && fi < flames.length; k++) { const z = -8 - R.r(0, 75), x = R.n(hw(z)), t0 = R.r(33, 39); if (TT < t0 || z < shoreZ(x) + 2) continue; const f = flames[fi++], J = RNG('gfj', k, F); f.visible = true; const sz = 1.0 * J.r(0.7, 1.3); f.position.set(x, sandH(x, z) + 0.5, z); f.scale.set(sz, sz * 1.4, 1); f.material.opacity = 0.8; } }
  for (; fi < flames.length; fi++) flames[fi].visible = false;
  for (; si < smokes.length; si++) smokes[si].visible = false;
  // steam off the sea
  g.steams.forEach((st, k) => { const S = RNG('st', k), t0 = 34 + S.r(0, 3); if (TT < t0) { st.visible = false; return; } const age = mod(TT * S.r(0.1, 0.2) + S.f(), 1); st.visible = true; const sx = S.n(120); st.position.set(sx, 1 + age * 40, shoreZ(sx) - 10 - S.r(0, 260)); const sz = 10 + age * 40; st.scale.set(sz, sz, 1); st.material.color.set('#f5ece0'); st.material.opacity = 0.55 * (1 - age) * seg(TT, t0, t0 + 1.5); });
  [g.canA, g.canB, g.poles].forEach((m) => { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; });

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

function birds(p) {
  if (TT > 26) return;
  const R = RNG('gulls');
  ctx.save(); screen(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 12; i++) {
    const sp = R.r(14, 34) * (TT > 20 ? 4 : 1), x = mod(R.r(0, 1200) + TT * sp * (R.f() < 0.5 ? 1 : -1), 1300) - 110, y = R.r(380, 860) + Math.sin(TT + i) * 10, s = R.r(10, 18), fl = Math.sin(TT * 7 + i * 1.3) * 0.6;
    ctx.fillStyle = 'rgba(245,242,238,0.95)'; ctx.strokeStyle = 'rgba(95,90,100,0.75)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x - s, y - s * fl * 0.6); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.45, x, y); ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.45, x + s, y - s * fl * 0.6);
    ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.2, x, y + s * 0.12); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.2, x - s, y - s * fl * 0.6); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// the counter text for each act
function hud(p) {
  if (TT < 5) return;
  if (TT < 20) {
    const left = Math.max(0, 500 - (TT - 5) / 14.5 * 500), m = Math.floor(left / 60), s = Math.floor(left % 60);
    return pvHud('La luz llega en', `${m}:${String(s).padStart(2, '0')}`, 'a 150 millones de km', ev(5, 0.5));
  }
  if (TT < 30) return pvHud('Brillo del Sol', pvNum(Math.max(1, 1e6 ** EZ.i2(seg(TT, 20.2, 29.5)))) + '×', 'veces lo normal');
  if (TT < 40) return pvHud('Temperatura del suelo', pvNum(lerp(40, 1500, EZ.i2(seg(TT, 30, 39.5)))) + ' °C', 'en la arena');
  return pvHud('Onda expansiva', pvNum(150e6 * (1 - EZ.i2(seg(TT, 40, 51.8))) + 2e5 * (1 - seg(TT, 51, 52))) + ' km', 'a 10.000 km por segundo');
}

function sceneBeach() {
  const p = ph();
  update3D(p); birds(p);
  if (p.X > 0.7) pvTint('#e3843a', (p.X - 0.7) * 2.2);   // the front swallows the frame
  hud(p);
  pvTitle(['¿Qué pasaría si', 'el Sol explotara?'], 0.3, 5.0);
  pvCaption('El Sol acaba de explotar.', 5.4, 10.0);
  pvCaption('No lo sabrás hasta en 8 minutos.', 10.0, 14.5);
  pvCaption('Su luz aún viene en camino.', 14.5, 19.9);
  pvCaption('Entonces el Sol brilla más.', 20.8, 25.0);
  pvCaption('Y más. Y más.', 25.0, 29.8);
  pvCaption('La arena empieza a arder.', 30.5, 34.0);
  pvCaption('El mar se evapora.', 34.0, 39.8);
  pvCaption('Luego llega la onda expansiva.', 40.5, 46.0);
  pvCaption('Ya ocupa medio cielo.', 46.0, 51.8);
}

function sceneDust() {
  fillAll('#cf7a37');
  pvGlow(W / 2 + Math.sin(TT * 0.9) * 260, H * 0.45 + Math.cos(TT * 0.7) * 300, 1100, 'rgba(255,200,130,0.8)', 0.55);
  const R = RNG('dust');
  for (let i = 0; i < 160; i++) {
    const x = mod(R.r(0, W) + TT * R.r(160, 420), W + 40) - 20, y = mod(R.r(0, H) - TT * R.r(30, 120), H), s = R.r(2, 7);
    ctx.fillStyle = `rgba(90,45,20,${R.r(0.2, 0.6)})`; ctx.fillRect(x, y, s, s);
  }
  if (TT < 58) {
    pvHud('Onda expansiva', 'AQUÍ', '');
    pvCaption('No hay dónde esconderse.', 53.0, 57.8);
  } else {
    const a = ev(58, 0.4);
    pvTint('#1a120d', a * 0.6);
    const f = () => { pvText('Tranquilo:', CX, 900, 60, { italic: true, align: 'center', alpha: a });
      pvText('el Sol es demasiado pequeño', CX, 990, 56, { align: 'center', alpha: a });
      pvText('para explotar.', CX, 1062, 56, { align: 'center', alpha: a }); };
    if (DEFER) DEFER.push(f); else f();
  }
}
