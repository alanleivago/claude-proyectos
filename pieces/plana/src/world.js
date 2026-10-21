
// =====================================================================
//  WORLD — Patagonia: a sunset sky with lenticular clouds, the turquoise lake (it tilts and runs), golden steppe, lenga
//  woods in autumn, an estancia (house, barn, a windmill, fences), villages on the shores, sheep, guanacos, hay bales, boulders; three rings of far ranges that rise as the horizon goes flat; the bowl — the disc's rim curling up around us.
//  A second world: the rim of the disc in space (the strata wall, the ocean held at the edge, stars).
// =====================================================================
let G = null, E = null;
const ridge = (x, z) => 0.55 + 0.3 * Math.sin(x * 0.004 + 1.0) * Math.sin(z * 0.0031 + 0.3) + 0.15 * Math.sin(x * 0.013 - z * 0.009) + 0.08 * Math.sin(x * 0.041 + z * 0.037);
function lakeDist(x, z) { const e = Math.sqrt(((x - LAKE.x) / LAKE.rx) ** 2 + ((z - LAKE.z) / LAKE.rz) ** 2); return (e - 1) * LAKE.rx * (1 + 1.6 * Math.abs((z - LAKE.z) / (e * LAKE.rz)) ** 2); }
const headK = (x, z) => Math.exp(-((x - CAMP.x) ** 2 / (220 * 220) + (z - CAMP.z - 10) ** 2 / (130 * 130)));
function groundH(x, z) {
  const d = lakeDist(x, z); if (d < 0) return -2 - 22 * ss(0, -90, d);
  const hk = headK(x, z), mt = 1500 * ss(-3700, -4900, z) * ridge(x * 0.6, z * 0.6) + 950 * ss(900, 2600, Math.abs(x)) * ridge(x * 0.8, z * 0.8) * ss(200, -800, z);
  return 1.2 + 34 * ss(0, 600, d) * ridge(x * 1.4, z * 1.4) * (1 - hk) + mt * (1 - hk) + 44 * hk;
}
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xf0c8a0, 1200, 12000);
  const cam = new THREE.PerspectiveCamera(66, W / H, 0.5, 90000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const SUN_DIR = dirV(24 * DEG, 6 * DEG);

  // --- sky: a Patagonian sunset; it deepens when the air drains
  const skyU = { top: { value: lin('#4a5aa0') }, hor: { value: lin('#f8c890') }, sunDir: { value: SUN_DIR.clone() }, sunCol: { value: lin('#fff0c8') }, sunK: { value: 1 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunK; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.2, 1.0); vec3 c = mix(hor, top, smoothstep(0.0, 0.5, pow(max(h, 0.0), 0.7)));
        float s = max(dot(d, sunDir), 0.0); c += sunCol * sunK * (smoothstep(0.9995, 0.9997, s) * 3.0 + pow(s, 50.0) * 0.6 + pow(s, 6.0) * 0.2);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  // lenticular clouds (smooth lenses) and ordinary ones
  const lensTex = g3Tex((x, w, h) => { for (let k = 0; k < 7; k++) { const g = x.createRadialGradient(w / 2, h / 2 - k * 3, 0, w / 2, h / 2 - k * 3, w * 0.48 - k * 18); g.addColorStop(0, `rgba(255,255,255,${0.22 - k * 0.02})`); g.addColorStop(0.75, `rgba(255,250,245,${0.12 - k * 0.012})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.save(); x.translate(w / 2, h / 2); x.scale(1, 0.18 + k * 0.02); x.translate(-w / 2, -h / 2); x.fillStyle = g; x.fillRect(0, 0, w, h); x.restore(); } }, 512, 256);
  const cloudTex = texCloud(); const clouds = []; { const R = RNG('cloudsP'); for (let i = 0; i < 20; i++) { const lens = i < 7, s = new THREE.Sprite(new THREE.SpriteMaterial({ map: lens ? lensTex : cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.85 }));
    s.userData = { x: R.r(-14000, 14000), z: R.r(-26000, -8000), y: lens ? R.r(3500, 6000) : R.r(2200, 5000), w: lens ? R.r(5000, 9000) : R.r(4000, 8000), a: lens ? R.r(0.28, 0.4) : R.r(0.22, 0.34), o: R.r(0.6, 0.95) }; s.renderOrder = -2; scene.add(s); clouds.push(s); } }
  const hemi = new THREE.HemisphereLight(0xc8c8e8, 0x7a6248, 0.95); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd8a8, 2.5); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  Object.assign(sun.shadow.camera, { left: -1600, right: 1600, top: 1600, bottom: -1600, near: 10, far: 9000 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.6;
  sun.target.position.set(0, 0, -900); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR.clone().setY(0.25).normalize(), 3500); sun.target.updateMatrixWorld();

  // --- the ground: steppe, shore, lake bed, rock, snow
  { const g = new THREE.PlaneGeometry(22000, 22000, 600, 600).rotateX(-Math.PI / 2).translate(0, 0, -7000), p = g.attributes.position, cols = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = groundH(x, z), d = lakeDist(x, z), hk = hsh(Math.floor(x / 22) + Math.floor(z / 22) * 131), hk2 = hsh(Math.floor(x / 70) + Math.floor(z / 55) * 77, 3); p.setY(i, y);
      const c = d < 0 ? C3('#6a5a44', '#7a6a50', hk) : d < 12 ? lin('#b8a888') : y > 1000 ? C3('#e8ecf0', '#ffffff', hk) : y > 330 ? C3('#7a7068', '#8a8078', hk).lerp(lin('#f0f2f4'), ss(800, 1000, y)) : d < 70 ? C3('#7a8a48', '#8a9a50', hk) : C3(['#c8a45a', '#b89048', '#a8a050', '#d0b068'][Math.floor(hk2 * 4)], '#b08a46', hk * 0.4);
      cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const gr = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); gr.receiveShadow = true; scene.add(gr); }
  // --- the lake: milky turquoise; the plane tilts and slides to pile the water toward the centre (left)
  const lakeU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uTop: { value: lin('#4a5aa0') }, uHor: { value: lin('#f8c890') }, uSunDir: { value: SUN_DIR.clone() }, uSunCol: { value: lin('#ffe0b0') }, uBody: { value: lin('#14a0b8') }, uRun: { value: 0 } }]);
  const lakeMat = new THREE.ShaderMaterial({ uniforms: lakeU, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uRun; uniform vec3 uTop, uHor, uBody, uSunDir, uSunCol; varying vec3 vW;
      #include <fog_pars_fragment>
      float nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec2 p = vW.xz; float t = uT, dist = length(vW - cameraPosition), fade = 1.0 / (1.0 + dist * 0.004); vec2 fl = vec2(uRun * t * 30.0, 0.0);
        vec3 n = normalize(vec3((0.02 * sin(p.x * 0.11 + p.y * 0.05 + t * 0.9) + 0.012 * sin(p.x * 0.37 - p.y * 0.2 + t * 1.5) + uRun * 0.05 * sin((p.x + fl.x) * 0.2 + p.y * 0.02)) * fade, 1.0, (0.02 * sin(p.y * 0.09 - p.x * 0.05 - t * 0.7) + 0.012 * sin(p.y * 0.33 + p.x * 0.17 - t)) * fade));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 col = mix(uBody, mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.5)), clamp(fres * 0.55 + 0.04, 0.0, 0.45));
        col += uSunCol * (pow(max(dot(Rf, uSunDir), 0.0), 260.0) * 2.4 + pow(max(dot(Rf, uSunDir), 0.0), 24.0) * 0.15);
        float streak = smoothstep(0.62, 0.8, vn(vec2((p.x + uT * 60.0 * uRun) * 0.05, p.y * 0.6))) * uRun; col = mix(col, vec3(0.9, 0.97, 0.98), streak * 0.6);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(LAKE.rx * 2 + 1600, LAKE.rz * 2 + 600, 1, 1).rotateX(-Math.PI / 2), lakeMat); lake.position.set(LAKE.x, LAKE_Y, LAKE.z); scene.add(lake);

  const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo.clone(); g2.applyMatrix4(m4); g2.computeVertexNormals();
      const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.6 + 0.4 * clamp(n.getY(i) * 0.5 + 0.5) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
  const add = (geo, mat, x, y, z, parent = scene, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // --- far ranges: three rings of mountains that rise into view as the Earth flattens
  const RINGS = [[9000, 4200, '#7a86ac', 0.0], [18000, 8500, '#9aa4c4', 1.0], [36000, 17000, '#b8bed6', 2.0]].map(([rad, hh, col, k]) => {
    const n = 360, g = new THREE.CylinderGeometry(rad, rad, 1, n, 1, true), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { if (p.getY(i) > 0) { const a = Math.atan2(p.getZ(i), p.getX(i)), f = 0.45 + 0.3 * Math.abs(Math.sin(a * (9 + k * 5))) + 0.25 * Math.abs(Math.sin(a * (23 + k * 11) + 1.3)) + 0.12 * Math.sin(a * 61 + k); p.setY(i, hh * f); } else p.setY(i, -hh * 0.3); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: lin(col), side: THREE.DoubleSide, fog: false, transparent: true, opacity: 1 })); m.position.set(CAMP.x, 0, CAMP.z); m.renderOrder = -1; scene.add(m); return { m, hh }; });

  // --- lenga woods in autumn colours around the shores and on the slopes
  const lumpy = (rr, s) => { const g = new THREE.IcosahedronGeometry(rr, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + 0.18 * Math.sin(v.x * 3.1 + s) * Math.sin(v.y * 2.7 + s * 2); p.setXYZ(i, v.x * k, v.y * k * 0.8, v.z * k); } return g; };
  const broad = (seed, cols) => { const R = RNG('lenga', seed), parts = [[new THREE.CylinderGeometry(0.3, 0.5, 6, 6).translate(0, 3, 0), M4c(0, 0, 0), '#4a3626', 0]]; for (let k = 0; k < 6; k++) { const a = R.r(0, TAU), rr = k ? R.r(1, 2.4) : 0; parts.push([lumpy(R.r(1.8, 2.6), R.r(0, 9)), M4c(Math.cos(a) * rr, 6.5 + R.r(-1, 1.6), Math.sin(a) * rr), R.pick(cols), 1]); } return mergeG(parts); };
  const TGEO = [broad(1, ['#c84a24', '#d8642a', '#b83a20']), broad(2, ['#e0a030', '#d88a28', '#c8b040']), broad(3, ['#5a7a2e', '#6a8a34', '#8a6a2a'])];
  const TREES = []; { const R = RNG('treesP'); for (let i = 0; i < 30000 && TREES.length < 1600; i++) { const x = R.r(-2600, 2600), z = R.r(-4200, 160), d = lakeDist(x, z), y = groundH(x, z); if (d < 14 || y > 520) continue; if (headK(x, z) > 0.3) continue; if (Math.hypot(x - EST.x, z - EST.z) < 70) continue;
      if (!(d < 160 || (y > 60 && R.f() < 0.6))) continue; if (Math.abs(x - CAMP.x) < 0.5 * (CAMP.z - z) + 10 && y + 10 > CAMP.y - 0.35 * (CAMP.z - z)) continue; TREES.push({ x, y, z, type: R.f() < 0.45 ? 0 : R.f() < 0.6 ? 1 : 2, s: R.r(0.9, 1.7), ry: R.r(0, 6) }); } }
  const treeI = TGEO.map((geo, k) => { const list = TREES.filter((t) => t.type === k), m = IM(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), list.length); list.forEach((t, i) => m.setMatrixAt(i, M4c(t.x, t.y, t.z, t.ry, t.s, t.s, t.s))); m.frustumCulled = false; scene.add(m); return m; });

  // --- the estancia: house, barn, a windmill pump, fences
  const est = new THREE.Group(); est.position.set(EST.x, groundH(EST.x, EST.z), EST.z); est.rotation.y = -0.4; scene.add(est);
  { const white = new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.8 }), red = new THREE.MeshStandardMaterial({ color: 0xb83a2a, roughness: 0.7 }), wood = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 });
    add(box(16, 6, 9).translate(0, 3, 0), white, 0, 0, 0, est); add(new THREE.CylinderGeometry(0.1, 7.2, 4, 4, 1).rotateY(Math.PI / 4).scale(1.6, 1, 0.9).translate(0, 8, 0), red, 0, 0, 0, est);
    add(box(14, 8, 12).translate(0, 4, 0), red, 26, 0, 6, est); add(new THREE.CylinderGeometry(0.1, 10, 5, 4, 1).rotateY(Math.PI / 4).scale(1, 1, 0.85).translate(0, 10.5, 0), new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.4, roughness: 0.5 }), 26, 0, 6, est);
    for (const [x, z] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) { const lg = add(box(0.25, 14, 0.25).translate(0, 7, 0), wood, -18 + x * 0.6, 0, -6 + z * 0.6, est, false); lg.rotation.set(z * 0.05, 0, -x * 0.05); }
    const fan = new THREE.Group(); fan.position.set(-18, 14, -5.4); est.add(fan); for (let k = 0; k < 16; k++) { const b = add(box(0.5, 3, 0.05).translate(0, 1.7, 0), new THREE.MeshStandardMaterial({ color: 0xd8d8d0, metalness: 0.4 }), 0, 0, 0, fan, false); b.rotation.z = k / 16 * TAU; } est.userData.fan = fan; }
  const FENCE = []; for (let k = 0; k < 60; k++) { const x = EST.x - 120 + k * 6, z = EST.z + 60 - k * 1.4; if (lakeDist(x, z) > 8) FENCE.push([x, groundH(x, z), z]); }
  const fence = IM(box(0.2, 1.4, 0.2).translate(0, 0.7, 0), new THREE.MeshStandardMaterial({ color: 0x5a4430 }), FENCE.length, false); FENCE.forEach(([x, y, z], i) => fence.setMatrixAt(i, M4c(x, y, z))); scene.add(fence);

  // --- things that will roll: boulders, hay bales, sheep, guanacos
  const ROLL = []; { const R = RNG('rollP'); const put = (kind, n, fx, fz) => { for (let i = 0, k = 0; i < n * 30 && k < n; i++) { const x = fx(R), z = fz(R); if (lakeDist(x, z) < 6 || headK(x, z) > 0.3) continue; ROLL.push({ kind, x, z, s: R.r(0.8, 1.3), ry: R.r(0, 6), w: R.r(0.7, 1.3), ph: R.r(0, 6) }); k++; } };
    put('rock', 320, (R) => R.r(-1500, 1500), (R) => R.r(-3200, 120)); put('hay', 36, (R) => EST.x + R.r(-120, 120), (R) => EST.z + R.r(-110, 110)); put('sheep', 220, (R) => R.r(150, 900), (R) => R.r(-1400, 60)); put('guanaco', 24, (R) => R.r(-1100, -620), (R) => R.r(-1300, -100));
    for (let i = 0; i < 400 && ROLL.filter((o) => o.near).length < 46; i++) { const x = CAMP.x + R.r(-260, 260), z = CAMP.z + R.r(-560, -60); if (lakeDist(x, z) < 10) continue; if (Math.abs(x - CAMP.x) < 0.5 * (CAMP.z - z) && groundH(x, z) + 8 > CAMP.y - 0.3 * (CAMP.z - z)) continue; ROLL.push({ kind: i % 3 ? 'rock' : 'hay', x, z, s: i % 3 ? R.r(2.2, 4.2) : R.r(1.6, 2.2), ry: R.r(0, 6), w: R.r(0.9, 1.3), ph: R.r(0, 6), near: true }); } }
  const quad = (neck) => mergeG([[new THREE.IcosahedronGeometry(1, 1).scale(0.5, 0.45, 1.0), M4c(0, 1.0, 0), '#ffffff', 1], [new THREE.IcosahedronGeometry(1, 1).scale(0.22, 0.26, 0.38), M4c(0, neck ? 2.1 : 1.35, neck ? -1.1 : -1.05), '#ffffff', 1], ...(neck ? [[new THREE.CylinderGeometry(0.13, 0.17, 1.2, 6), M4c(0, 1.6, -0.95, 0, 1, 1, 1, -0.35), '#ffffff', 0]] : []),
    ...[[-0.3, -0.6], [0.3, -0.6], [-0.3, 0.6], [0.3, 0.6]].map(([x, z]) => [new THREE.CylinderGeometry(0.06, 0.08, neck ? 1.1 : 0.7, 5).translate(0, (neck ? 1.1 : 0.7) / 2, 0), M4c(x, 0, z), '#ffffff', 0])]);
  const RG = { rock: new THREE.IcosahedronGeometry(1.4, 0), hay: new THREE.CylinderGeometry(1.0, 1.0, 1.3, 14).rotateZ(Math.PI / 2), sheep: quad(false), guanaco: quad(true) };
  const RC = { rock: 0x8a8278, hay: 0xd8b860, sheep: 0xf0ece0, guanaco: 0xb07a48 };
  const rollI = {}; Object.keys(RG).forEach((k) => { const list = ROLL.filter((o) => o.kind === k); list.forEach((o, i) => (o.slot = i)); const m = IM(RG[k], new THREE.MeshStandardMaterial({ color: RC[k], roughness: 0.85, flatShading: k === 'rock', vertexColors: k === 'sheep' || k === 'guanaco' }), list.length); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); rollI[k] = m; });

  // --- coirón tufts and calafate shrubs near us
  const tuftG = mergeG([0, 1, 2, 3, 4, 5].map((k) => [new THREE.ConeGeometry(0.1, 1.1, 3).translate(0, 0.55, 0), M4c(Math.cos(k) * 0.18, 0, Math.sin(k) * 0.18, 0, 1, 1, 1, Math.cos(k * 1.7) * 0.45, Math.sin(k * 1.7) * 0.45), k % 2 ? '#d8b868' : '#c0a050', 1]));
  const TUFT = []; { const R = RNG('tufts'); for (let i = 0; i < 40000 && TUFT.length < 9000; i++) { const x = CAMP.x + R.r(-900, 900), z = CAMP.z + R.r(-1400, 40), d = lakeDist(x, z); if (d < 20) continue; TUFT.push([x, groundH(x, z), z, R.r(1.2, 2.6), R.r(0, 6)]); } }
  const tufts = IM(tuftG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), TUFT.length, false); TUFT.forEach(([x, y, z, sc, ry], i) => tufts.setMatrixAt(i, M4c(x, y, z, ry, sc, sc, sc))); tufts.frustumCulled = false; scene.add(tufts);
  const SHR = []; { const R = RNG('shrubs'); for (let i = 0; i < 20000 && SHR.length < 1400; i++) { const x = CAMP.x + R.r(-1400, 1400), z = CAMP.z + R.r(-2200, 40), d = lakeDist(x, z); if (d < 16) continue; SHR.push([x, groundH(x, z), z, R.r(1.5, 3.5)]); } }
  const shrubs = IM(new THREE.IcosahedronGeometry(1, 1).scale(1.3, 0.7, 1.3).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0x4a5a2a, roughness: 0.9, flatShading: true }), SHR.length); SHR.forEach(([x, y, z, sc], i) => shrubs.setMatrixAt(i, M4c(x, y, z, i, sc, sc, sc))); shrubs.frustumCulled = false; scene.add(shrubs);
  // --- villages along the shores: white walls, red and green tin roofs
  const VIL = []; { const R = RNG('villages'); [[-700, -1500, 70], [640, -2500, 60], [-520, -3200, 50], [380, -1200, 34], [-860, -700, 30]].forEach(([cx, cz, n]) => { for (let i = 0, k = 0; i < n * 20 && k < n; i++) { const x = cx + R.n(70), z = cz + R.n(90), d = lakeDist(x, z); if (d < 12 || d > 400) continue; VIL.push({ x, y: groundH(x, z), z, w: R.r(6, 11), d: R.r(6, 9), h: R.r(4, 7), ry: R.r(-0.4, 0.4), rc: R.pick(['#b83a2a', '#c8462e', '#3a6a4a', '#8a2a22', '#4a5a6a']) }); k++; } }); }
  const vilB = IM(box(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0xf2eee4, roughness: 0.85 }), VIL.length), vilR = IM(new THREE.ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.2 }), VIL.length);
  VIL.forEach((v, i) => { vilB.setMatrixAt(i, M4c(v.x, v.y - 0.5, v.z, v.ry, v.w, v.h + 0.5, v.d)); vilR.setMatrixAt(i, M4c(v.x, v.y + v.h, v.z, v.ry, v.w * 1.1, 2.4, v.d * 1.1)); vilR.setColorAt(i, lin(v.rc)); }); scene.add(vilB, vilR);
  // --- the balcony railing at the lens
  { const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a26, roughness: 0.85 }), bal = new THREE.Group(); bal.position.set(CAMP.x, CAMP.y - 3.7, CAMP.z - 3.2); scene.add(bal);
    add(box(16, 0.14, 0.14), wood, 0, 1.15, -0.4, bal); add(box(16, 0.08, 0.08), wood, 0, 0.6, -0.4, bal); for (let k = -7; k <= 7; k++) add(box(0.08, 1.15, 0.08).translate(0, 0.58, 0), wood, k * 1.05, 0, -0.4, bal); }

  // --- the bowl: the disc's rim curling up all around us (a surface of revolution posed in the vertex shader)
  const bowlU = { uDark: { value: 0 }, uAsp: { value: 1 }, uT: { value: 0 }, uR0: { value: 40000 }, uH: { value: 0 }, uC: { value: 0 }, uSky: { value: lin('#f8c890') }, uCam: { value: new THREE.Vector3(CAMP.x, 0, CAMP.z) } };
  const NA = 240, NS = 80, BP = [], BI = []; for (let j = 0; j <= NS; j++) for (let i = 0; i <= NA; i++) BP.push(i / NA * TAU, j / NS, 0);
  for (let j = 0; j < NS; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + 1, c = a + NA + 1, d = c + 1; BI.push(a, c, b, b, c, d); }
  const bowlG = new THREE.BufferGeometry(); bowlG.setAttribute('position', new THREE.Float32BufferAttribute(BP, 3)); bowlG.setIndex(BI);
  const bowl = new THREE.Mesh(bowlG, new THREE.ShaderMaterial({ uniforms: bowlU, side: THREE.DoubleSide, fog: false,
    vertexShader: `uniform float uR0, uH, uC; uniform vec3 uCam; varying vec2 vP; varying float vS;
      void main(){ float a = position.x, s = position.y; float r = uR0 * (1.0 - uC * 0.55 * s * s); float y = uH * pow(s, 1.25) - 50.0;
        vec3 p = vec3(uCam.x + cos(a) * r, y, uCam.z + sin(a) * r); vP = vec2(a, s); vS = s; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform float uT, uC, uAsp, uDark; uniform vec3 uSky; varying vec2 vP; varying float vS;
      float nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec2 q = vec2(vP.x * 40.0, vP.y * 22.0 * uAsp); float n = vn(q) * 0.55 + vn(q * 2.7) * 0.3 + vn(q * 7.3) * 0.15;
        float rd = abs(vn(q * 1.7 + 5.0) - 0.5); float ridgeL = smoothstep(0.06, 0.0, rd);
        vec3 land = mix(mix(vec3(0.24, 0.34, 0.12), vec3(0.5, 0.36, 0.2), smoothstep(0.3, 0.6, n)), vec3(0.58, 0.52, 0.46), smoothstep(0.66, 0.8, n));
        land = mix(land, vec3(0.95, 0.96, 0.98), smoothstep(0.82, 0.9, n)); land *= 1.0 - 0.45 * ridgeL;
        float sv = vn(vec2(vP.x * 8.0, vP.y * 3.5 * uAsp + 3.0)); float sea = smoothstep(0.4, 0.34, sv), shore = smoothstep(0.43, 0.4, sv) - sea;
        vec3 water = mix(vec3(0.05, 0.2, 0.36), vec3(0.12, 0.34, 0.5), vn(q * 0.5));
        float fall = smoothstep(0.62, 0.86, vn(vec2(vP.x * 220.0, vP.y * 5.0 * min(uAsp, 6.0) + uT * 2.2))) * smoothstep(0.5, 0.36, sv);
        vec3 col = mix(land, water, sea); col = mix(col, vec3(0.94, 0.97, 1.0), clamp(shore * 0.9 + fall * 0.9, 0.0, 1.0) * (1.0 - 0.65 * uDark));
        col *= 0.7 + 0.4 * vS; col = mix(col, uSky, 0.35 * (1.0 - smoothstep(0.0, 0.3, vS)) * (1.0 - uC * 0.85)); col *= 1.0 - 0.5 * uDark;
        gl_FragColor = vec4(col, 1.0);
        #include <encodings_fragment>
      }` })); bowl.frustumCulled = false; bowl.renderOrder = -1; bowl.visible = false; scene.add(bowl);

  const puffTex = texPuff('puffP', 30, 0.4), spray = Array.from({ length: 60 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; s.renderOrder = 8; scene.add(s); return s; });
  const DEB = []; { const R = RNG('debris'); for (let i = 0; i < 160; i++) DEB.push({ a: R.r(-1.3, 1.3) - Math.PI / 2, r0: R.r(250, 1000), t0: T_HERO + R.r(-0.2, 4.2), v: R.r(150, 420), up: R.r(40, 200), s: R.r(5, 24), sp: R.r(1, 5), ax: R.r(0, 6) }); }
  const debris = IM(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0x6a5444, roughness: 1, flatShading: true }), DEB.length, false); debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage); debris.frustumCulled = false; scene.add(debris);
  const dust = Array.from({ length: 70 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; s.renderOrder = 9; scene.add(s); return s; });
  G = { cv, r, scene, cam, sky, skyU, clouds, hemi, sun, lake, lakeMat, RINGS, est, ROLL, rollI, bowl, bowlU, spray, TREES, DEB, debris, dust };
  return G;
}

// =====================================================================
//  THE RIM OF THE WORLD — the disc's edge in space: the strata wall falling away, the ocean on top held back and banked into
//  a lip by gravity that points inward, spray, a thin glow of air; the mantle and core glowing deep in the wall; a coloured sky.
// =====================================================================
function edge3() {
  if (E) return E;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(62, W / H, 1, 400000); scene.add(cam);
  // space: a coloured nebula, the Milky Way, dense stars
  const neb = new THREE.Mesh(new THREE.SphereGeometry(300000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { uT: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uT; varying vec3 vD; float sh(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float vn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(mix(sh(i), sh(i + vec3(1,0,0)), f.x), mix(sh(i + vec3(0,1,0)), sh(i + vec3(1,1,0)), f.x), f.y), mix(mix(sh(i + vec3(0,0,1)), sh(i + vec3(1,0,1)), f.x), mix(sh(i + vec3(0,1,1)), sh(i + vec3(1,1,1)), f.x), f.y), f.z); }
      void main(){ vec3 d = normalize(vD); float n = vn(d * 3.0) * 0.5 + vn(d * 7.0) * 0.3 + vn(d * 17.0) * 0.2; float n2 = vn(d * 4.0 + 9.0);
        vec3 c = mix(vec3(0.01, 0.02, 0.07), vec3(0.06, 0.16, 0.42), smoothstep(-0.2, 0.6, d.y)); c += vec3(0.3, 0.08, 0.35) * smoothstep(0.62, 0.9, n) * 0.6; c += vec3(0.05, 0.2, 0.5) * smoothstep(0.55, 0.9, n2) * 0.6; c += vec3(0.8, 0.25, 0.4) * smoothstep(0.72, 0.95, n * n2 * 1.8) * 0.5;
        float band = exp(-pow(dot(d, normalize(vec3(0.3, 0.8, 0.5))) / 0.18, 2.0)); c += vec3(0.5, 0.5, 0.7) * band * (0.3 + 0.35 * n);
        float st = step(0.996, sh(floor(d * 900.0))) * (0.5 + 0.5 * sh(floor(d * 900.0) + 3.0)) + step(0.9993, sh(floor(d * 2400.0))) ; c += vec3(st);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` })); scene.add(neb);
  scene.add(new THREE.HemisphereLight(0xb8c8ff, 0x402818, 0.7)); const sun = new THREE.DirectionalLight(0xfff0d8, 2.8); sun.position.set(8000, 6000, 4000); scene.add(sun);
  // the wall: crust strata, then the mantle and the core glowing deeper down
  const st = texStrata(); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(26, 3);
  const wallU = { uT: { value: 0 }, uMap: { value: st } };
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(90000, 14000, 1, 1).rotateY(Math.PI / 2), new THREE.ShaderMaterial({ uniforms: wallU,
    vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT; uniform sampler2D uMap; varying vec2 vU; varying vec3 vW;
      float nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }
      void main(){ float depth = -vW.y; float n1 = vn(vec2(vW.z * 0.0004, vW.y * 0.004)), n2 = vn(vec2(vW.z * 0.0012 + uT * 0.04, vW.y * 0.012 - uT * 0.08));
        vec3 crust = mix(vec3(0.86, 0.76, 0.6), vec3(0.78, 0.66, 0.5), n1); vec3 seam = vec3(0.45, 0.3, 0.2);
        vec3 mant = mix(vec3(0.62, 0.22, 0.07), vec3(0.78, 0.32, 0.1), n1);
        float streak = smoothstep(0.62, 0.8, vn(vec2(vW.z * 0.0009 - uT * 0.05, vW.y * 0.03))) * (0.6 + 0.4 * n2);
        mant = mix(mant, vec3(1.0, 0.72, 0.2), streak); mant = mix(mant, vec3(1.0, 0.9, 0.55), smoothstep(0.86, 0.95, n2) * 0.8);
        vec3 c = depth < 420.0 ? crust : depth < 520.0 ? seam : mant;
        c *= 0.85 + 0.25 * smoothstep(0.0, 1.0, vn(vW.zy * 0.0003)); gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` })); wall.position.set(0, -7000, -40000); scene.add(wall);
  // the ocean on top: waves, foam lines toward the edge, a bright banked lip
  const oceanU = { uT: { value: 0 } };
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(60000, 90000, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: oceanU,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT; varying vec3 vW; float nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec2 p = vW.xz; float w = vn(p * 0.004 + vec2(uT * 0.2, 0.0)) * 0.6 + vn(p * 0.015 - vec2(0.0, uT * 0.4)) * 0.4;
        vec3 c = mix(vec3(0.42, 0.56, 0.68), vec3(0.78, 0.84, 0.9), w); float e = smoothstep(-1500.0, 0.0, vW.x);
        float foam = smoothstep(0.55, 0.75, vn(vec2(vW.x * 0.01 - uT * 1.5, p.y * 0.002))) * e + smoothstep(0.7, 0.9, vn(p * 0.03 + uT)) * 0.4;
        c = mix(c, vec3(0.96, 0.98, 1.0), clamp(foam * 0.8 + e * e * 0.5, 0.0, 1.0)); float far = smoothstep(4000.0, 60000.0, length(vW - cameraPosition)); c = mix(c, vec3(0.7, 0.8, 0.95), far * 0.5);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` })); ocean.position.set(-30000, 0, -30000); scene.add(ocean);
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(220, 220, 90000, 24, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8ecf4, roughness: 0.25, emissive: 0x3a6a80, emissiveIntensity: 0.35 })); lip.position.set(-220, 0, -30000); scene.add(lip);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(90000, 2400).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ map: g3Tex((x, w, h) => { const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, 'rgba(110,170,255,0.5)'); g.addColorStop(0.4, 'rgba(90,140,255,0.18)'); g.addColorStop(1, 'rgba(90,140,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 4, 256), transparent: true, depthWrite: false, side: THREE.DoubleSide })); glow.rotation.y = 0; glow.position.set(-1200, 1200, -60000); glow.scale.set(1.2, 3.0, 1); scene.add(glow);
  const puffTex = texPuff('puffE', 30, 0.45), spray = Array.from({ length: 140 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0, color: 0xeaf6fc })); scene.add(s); return s; });
  E = { scene, cam, oceanU, wallU, neb, spray };
  return E;
}
