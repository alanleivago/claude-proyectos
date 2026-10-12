
// =====================================================================
//  WORLD — the ground scene (metres): sky, sea, beach, promenade, road, houses, old town, towers, plains, palms, cars, people
// =====================================================================
const sandY = (x) => (x >= -14 ? 0 : -2.4 - 0.05 * (-14 - x) - 0.03 * Math.max(0, -60 - x));
const SEA_Y = -3.9;

// the houses: [cx, cz, sx (across), sz (along), h, wall, roof, zone]; facades face the road (±x)
function houseList() {
  const R = RNG('housesD'), L = [], WALL = ['#e9dcc4', '#d9a77e', '#c97a62', '#f0e6d2', '#a9c0bf', '#e2c87e', '#c99a72', '#d8c2aa', '#b4c0a2', '#d6a6a0', '#f2e2c8', '#9fb4c8'], ROOF = ['#b5523a', '#a8472f', '#c46a48', '#8a4a3a', '#9a5a40', '#6a6a70'];
  const row = (side, front, z0, z1, fl0, fl1, zone, gapP) => { let z = z0; while (z > z1) { const sz = R.r(7, 12.5), sx = R.r(8, 12), fl = Math.floor(R.r(fl0, fl1 + 0.99)), h = fl * 3.1 + R.r(0.4, 1.2);
    L.push([side * (front + sx / 2), z - sz / 2, sx, sz - 0.08, h, R.pick(WALL), R.pick(ROOF), zone]); z -= sz + (R.f() < gapP ? R.r(3, 7) : 0); } };
  row(1, 16.2, 60, -ZB - 40, 2, 4, 0, 0.14);            // the seafront row on the right
  row(1, 30, 60, -ZB - 40, 4, 7, 0, 0.1);               // a taller row behind it
  row(-1, 11.6, -ZB, -ZC - 30, 3, 6, 1, 0.05);          // the old town, both sides
  row(1, 14.4, -ZB - 40, -ZC - 30, 3, 6, 1, 0.05);
  return L;
}
function towerList() {
  const R = RNG('towersD'), L = [];
  for (const side of [-1, 1]) { let z = -ZC; while (z > -ZD - 200) { const sz = R.r(22, 44), sx = R.r(22, 40), h = R.r(55, 220) * (R.f() < 0.15 ? 1.4 : 1);
    L.push([side * (16 + sx / 2 + R.r(0, 22)), z - sz / 2, sx, sz, h, R.pick(['#9aa6b8', '#b8b4ac', '#8a96a8', '#c4bcb0', '#7a8698'])]); z -= sz + R.r(8, 26); } }
  return L;
}
// the cars: [lane x, z0, speed (m/s, signed: - = same way as you), colour, kind]
function carList() {
  const R = RNG('carsD'), L = [], COL = ['#c8372d', '#f2f0ea', '#1f2d3d', '#2f6fd1', '#9aa0a6', '#202224', '#e8b23a', '#3a6a4a', '#7a2a2a', '#d6d2c8'];
  for (let i = 0; i < 46; i++) { const lane = R.f() < 0.5 ? 5.25 : 8.75; L.push([lane, R.r(80, -ZC) , -R.r(12, 21), R.pick(COL), R.f() < 0.2 ? 1 : 0]); }
  for (let i = 0; i < 40; i++) { const lane = R.f() < 0.5 ? -1.75 : 1.75; L.push([lane, R.r(150, -ZC - 400), R.r(13, 20), R.pick(COL), R.f() < 0.2 ? 1 : 0]); }
  for (let i = 0; i < 44; i++) { const same = R.f() < 0.55, lane = same ? (R.f() < 0.5 ? 5.25 : 8.75) : (R.f() < 0.5 ? -1.75 : 1.75); L.push([lane, R.r(-ZC + 200, -ZD - 300), same ? -R.r(14, 24) : R.r(14, 24), R.pick(COL), R.f() < 0.25 ? 1 : 0]); }   // the canyon of towers: busy traffic
  L.push([8.75, -runS(12.85) - 7 + 18 * 12.85, -18, '#e8e4dc', 0]);   // the car you look at (12.2-13.7s)
  L.push([8.75, -runS(14.6) + 3 + 19 * 14.6, -19, '#c8372d', 1]);
  return L;
}

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
  scene.fog = new THREE.Fog(0xf6dcc0, 150, 9000);
  const cam = new THREE.PerspectiveCamera(66, W / H, 0.1, 60000); cam.rotation.order = 'YXZ'; scene.add(cam);

  // --- sky dome (skips tone mapping): lavender top, cream horizon, the low sun with a wide glow; a plasma tint later
  const skyU = { top: { value: lin('#7f9ce6') }, mid: { value: lin('#d9b8d8') }, hor: { value: lin('#ffd3a0') }, sunDir: { value: SUN.clone() }, sunCol: { value: lin('#fff1d0') },
    plasma: { value: 0 }, plasmaCol: { value: lin('#ff8a3c') } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(50000, 64, 32), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sunDir, sunCol, plasmaCol; uniform float plasma; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.2, 1.0);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.12, 0.75, h));
        c = mix(c, hor * vec3(0.92, 0.86, 0.82), smoothstep(0.0, -0.08, d.y));
        float a = acos(clamp(dot(d, sunDir), -1.0, 1.0));
        c += sunCol * (smoothstep(0.016, 0.012, a) * 2.2 + 0.55 * exp(-a * a / 0.004) + 0.22 * exp(-a * 3.2) + 0.08 * exp(-a * 0.9));
        c = mix(c, plasmaCol * (0.7 + 0.5 * h), plasma * (0.35 + 0.65 * smoothstep(-0.1, 0.5, -d.z)));
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }`,
  }));
  sky.renderOrder = -2; scene.add(sky);
  // --- clouds: warm-lit puffs high over the sea and the land
  const cloudTex = texCloud(), clouds = []; { const R = RNG('cloudsD'); for (let i = 0; i < 26; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.6, color: 0xfff4ea }));
    const az = R.r(-75, 75) * DEG, D = R.r(4000, 18000);
    s.userData = { x: Math.sin(az) * D, z: -Math.cos(az) * D, y: R.r(700, 2600), w: R.r(2500, 7000), o: R.r(0.35, 0.75) }; s.renderOrder = -1; scene.add(s); clouds.push(s); } }

  // --- lights: the low sun casts long soft shadows towards you; a warm sky dome
  const hemi = new THREE.HemisphereLight(0xd8d4f0, 0xb89a7a, 0.75); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd6a8, 2.6); scene.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 5; key.shadow.blurSamples = 16;
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 90, bottom: -50, near: 10, far: 900 }); key.shadow.bias = -0.0005;

  // --- the sea: turquoise shallows -> blue -> haze, rolling swell, foam lines that run up the beach, the sun's glitter path
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uSun: { value: SUN.clone() }, uTop: { value: lin('#7f9ce6') }, uHor: { value: lin('#ffd3a0') },
    uShallow: { value: lin('#1fc4cf') }, uMid: { value: lin('#0d7fcf') }, uDeep: { value: lin('#0a4aa8') }, uFar: { value: lin('#5a86d0') } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT; uniform vec3 uSun, uTop, uHor, uShallow, uMid, uDeep, uFar; varying vec3 vW;
      #include <fog_pars_fragment>
      float sandY(float x){ return x >= -14.0 ? 0.0 : -2.4 - 0.05 * (-14.0 - x) - 0.03 * max(0.0, -60.0 - x); }
      void main(){ vec2 p = vW.xz; float t = uT; float dep = ${SEA_Y.toFixed(2)} - sandY(p.x);
        float dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(80.0, 900.0, dist), fine2 = 1.0 - smoothstep(20.0, 200.0, dist);
        vec3 n = normalize(vec3(
          0.05 * sin(p.x * 0.09 + t * 0.7) + 0.04 * sin(p.x * 0.31 - p.y * 0.17 + t * 1.2) + fine * (0.04 * sin(p.x * 1.1 + p.y * 0.8 + t * 1.9) + 0.03 * sin(p.x * 2.7 + p.y * 1.5 + t * 2.7)) + fine2 * 0.03 * sin(p.x * 6.1 - p.y * 4.9 + t * 3.9),
          1.0,
          0.05 * sin(p.y * 0.11 - t * 0.6) + 0.04 * sin(p.y * 0.37 + p.x * 0.13 - t * 1.1) + fine * (0.04 * sin(p.y * 1.3 - p.x * 0.6 + t * 1.7) + 0.03 * sin(p.y * 3.1 - p.x * 0.9 + t * 2.9)) + fine2 * 0.03 * sin(p.y * 7.3 + p.x * 3.9 - t * 4.1)));
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(2000.0, 15000.0, dist) * 0.75));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n);
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.5));
        vec3 body = mix(uShallow, uMid, smoothstep(0.2, 3.0, dep)); body = mix(body, uDeep, smoothstep(3.0, 12.0, dep)); body = mix(body, uFar, smoothstep(1500.0, 12000.0, dist) * 0.7);
        vec3 col = mix(body, skyR, clamp(fres * 0.5, 0.0, 1.0));
        float sd = max(dot(Rf, uSun), 0.0);
        col += vec3(1.0, 0.92, 0.75) * (pow(sd, 900.0) * 7.0 + pow(sd, 60.0) * 0.35 + pow(sd, 8.0) * 0.06);
        // foam: lines of breaking waves rolling up the beach, and the wet edge
        float wv = sin((p.x + 44.0) * 0.55 + t * 1.6 + sin(p.y * 0.05) * 1.5), band = smoothstep(0.82, 0.98, wv) * (1.0 - smoothstep(0.2, 2.6, dep)) * (0.6 + 0.4 * sin(p.y * 0.21 + t * 0.4));
        float edge = exp(-dep * dep / 0.04) * (0.6 + 0.4 * sin(p.y * 0.9 + t * 1.3));
        col = mix(col, vec3(0.97, 0.96, 0.93), clamp(band + edge, 0.0, 1.0) * fine);
        float al = smoothstep(-0.02, 0.15, dep); if (al < 0.01) discard;
        gl_FragColor = vec4(col, al);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }`, transparent: true });
  { const g = new THREE.PlaneGeometry(40000, 60000, 1, 1); g.rotateX(-Math.PI / 2); g.translate(-14 - 20000, SEA_Y, -20000); scene.add(new THREE.Mesh(g, seaMat)); }

  // --- ground strips: beach sand, the sea wall, the promenade, the kerbs, the road, the far sidewalk, the plains
  const sandTex = wrap(texSand()), promTex = wrap(texPromenade()), roadTex = wrap(texRoad()), pave = wrap(texPaving('pave', '#9a9086', ['#c9c0b2', '#bdb4a6', '#d4ccbe', '#b2a99a'], 32)), cob = wrap(texPaving('cob', '#6a625a', ['#8a8278', '#7c746a', '#969086', '#827a70'], 16)), field = wrap(texField());
  [sandTex, promTex, roadTex, pave, cob, field].forEach((t) => (t.anisotropy = ANI));
  const strip = (x0, x1, z0, z1, mat, uS, vS, yf, nx = 1, nz = 1, u0 = 0) => { const g = new THREE.PlaneGeometry(x1 - x0, z0 - z1, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); if (yf) p.setY(i, yf(x)); uv.setXY(i, (x - u0) / uS, z / vS); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m); return m; };
  const ZEND = -ZD - 60000;
  strip(-90, -14, 80, -ZB - 60, STD({ map: sandTex, roughness: 1 }), 16, 16, sandY, 40, 1);
  strip(-14, ROAD0, 80, -ZB - 60, STD({ map: promTex, roughness: 0.85 }), 10.5, 8);
  strip(ROAD0, ROAD1, 120, ZEND, STD({ map: roadTex, roughness: 0.9 }), 14, 16, null, 1, 1, ROAD0);
  strip(ROAD1, 60, 80, -ZB - 60, STD({ map: pave, roughness: 0.9 }), 8, 8);
  strip(-60, ROAD0, -ZB - 20, -ZC, STD({ map: cob, roughness: 0.9 }), 6, 6);
  strip(ROAD1, 60, -ZB - 20, -ZC, STD({ map: cob, roughness: 0.9 }), 6, 6);
  strip(-400, ROAD0, -ZC + 20, -ZD - 30, STD({ map: pave, roughness: 0.9, color: 0xd8d2c8 }), 10, 10);
  strip(ROAD1, 400, -ZC + 20, -ZD - 30, STD({ map: pave, roughness: 0.9, color: 0xd8d2c8 }), 10, 10);
  strip(-30000, ROAD0, -ZD, ZEND, STD({ map: field, roughness: 1 }), 400, 400).position.y = -0.03;
  strip(ROAD1, 30000, -ZD, ZEND, STD({ map: field, roughness: 1 }), 400, 400).position.y = -0.03;
  const concrete = STD({ color: 0xcfc6b8, roughness: 0.9 }), dark = STD({ color: 0x2a2e33, roughness: 0.5, metalness: 0.4 }), white = STD({ color: 0xf2efe8, roughness: 0.6 });
  { const w = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.6, ZB + 140), concrete); w.position.set(-14.1, -1.2, 80 - (ZB + 140) / 2); w.receiveShadow = true; scene.add(w); }
  // kerbs along both sides of the road (zones A-C)
  { const k = new THREE.BoxGeometry(0.3, 0.16, ZC + 120); for (const x of [ROAD0 - 0.15, ROAD1 + 0.15]) { const m = new THREE.Mesh(k, STD({ color: 0xe0dcd2, roughness: 0.8 })); m.position.set(x, 0.08, 120 - (ZC + 120) / 2); m.receiveShadow = true; scene.add(m); } }

  // --- the railing along the sea, benches, lamps, bins
  const railN = Math.ceil((ZB + 140) / 2.2), posts = IM(new THREE.CylinderGeometry(0.035, 0.035, 1.05, 6).translate(0, 0.52, 0), white, railN);
  for (let i = 0; i < railN; i++) posts.setMatrixAt(i, M4c(RAIL, 0, 80 - i * 2.2)); scene.add(posts);
  for (const y of [1.05, 0.55]) { const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, ZB + 140, 6).rotateX(Math.PI / 2), white); rl.position.set(RAIL, y, 80 - (ZB + 140) / 2); rl.castShadow = true; scene.add(rl); }
  const lampPts = []; for (let z = 70; z > -ZB; z -= 22) lampPts.push([-4.4, z], [11.3, z - 11]); for (let z = -ZB; z > -ZC; z -= 26) lampPts.push([-4.2, z], [11.2, z - 13]);
  const poleI = IM(new THREE.CylinderGeometry(0.07, 0.11, 5.6, 8).translate(0, 2.8, 0), dark, lampPts.length), armI = IM(new THREE.BoxGeometry(1.2, 0.08, 0.1), dark, lampPts.length), headI = IM(new THREE.BoxGeometry(0.5, 0.16, 0.26), dark, lampPts.length);
  lampPts.forEach(([x, z], i) => { const s = x < 4 ? 1 : -1; poleI.setMatrixAt(i, M4c(x, 0, z)); armI.setMatrixAt(i, M4c(x + s * 0.55, 5.55, z)); headI.setMatrixAt(i, M4c(x + s * 1.1, 5.5, z)); }); scene.add(poleI, armI, headI);
  const wood = STD({ color: 0x9a6a44, roughness: 0.8 }), benchN = Math.ceil((ZB + 80) / 26), seat = IM(new THREE.BoxGeometry(0.5, 0.06, 1.9), wood, benchN), back = IM(new THREE.BoxGeometry(0.06, 0.45, 1.9), wood, benchN), legs = IM(new THREE.BoxGeometry(0.45, 0.42, 0.06), dark, benchN * 2);
  for (let i = 0; i < benchN; i++) { const z = 60 - i * 26 - 9; seat.setMatrixAt(i, M4c(-12.6, 0.45, z)); back.setMatrixAt(i, M4c(-12.35, 0.72, z)); legs.setMatrixAt(i * 2, M4c(-12.6, 0.21, z - 0.8)); legs.setMatrixAt(i * 2 + 1, M4c(-12.6, 0.21, z + 0.8)); } scene.add(seat, back, legs);

  // --- palms along the promenade: a curved trunk of rings and a crown of broad fronds
  const palmN = Math.ceil((ZB + 80) / 13), RPm = RNG('palms'), trunkM = STD({ color: 0x8a7458, roughness: 0.95 }), frondM = STD({ map: texFrond(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 });
  const ringI = IM(new THREE.CylinderGeometry(0.2, 0.24, 0.9, 8).translate(0, 0.45, 0), trunkM, palmN * 10), frI = IM(new THREE.PlaneGeometry(1.5, 4.6).translate(0, 2.3, 0), frondM, palmN * 13);
  for (let i = 0; i < palmN; i++) { const z = 70 - i * 13 + RPm.r(-2, 2), x = -11.4 + RPm.r(-0.4, 0.4), hgt = RPm.r(7, 10.5), lean = RPm.r(-0.12, 0.12), leanZ = RPm.r(-0.1, 0.1);
    for (let k = 0; k < 10; k++) { const f = k / 10, px = x + lean * hgt * f * f, pz = z + leanZ * hgt * f * f; ringI.setMatrixAt(i * 10 + k, M4c(px, f * hgt, pz, k * 0.7, 1 - f * 0.35, hgt / 9, 1 - f * 0.35, leanZ * 2 * f, -lean * 2 * f)); }
    const tx = x + lean * hgt, tz = z + leanZ * hgt;
    for (let k = 0; k < 13; k++) { const a = k / 13 * TAU + RPm.r(0, 0.4), droop = RPm.r(0.6, 1.25), s = RPm.r(0.8, 1.15);
      frI.setMatrixAt(i * 13 + k, new THREE.Matrix4().compose(new THREE.Vector3(tx, hgt, tz), new THREE.Quaternion().setFromEuler(new THREE.Euler(droop, a, 0, 'YXZ')), new THREE.Vector3(s, s, s))); } }
  scene.add(ringI, frI);

  // --- beach: umbrellas, towels, a lifeguard chair
  { const R = RNG('beach'), n = 16, poleB = IM(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6).translate(0, 1.1, 0), white, n), cap = IM(new THREE.ConeGeometry(1.2, 0.5, 10, 1, true).translate(0, 2.1, 0), STD({ roughness: 0.8, side: THREE.DoubleSide }), n), towel = IM(new THREE.PlaneGeometry(0.9, 1.9).rotateX(-Math.PI / 2), STD({ roughness: 0.9 }), n);
    for (let i = 0; i < n; i++) { const x = R.r(-34, -18), z = R.r(40, -ZB + 40), y = sandY(x); poleB.setMatrixAt(i, M4c(x, y, z, 0, 1, 1, 1, R.n(0.08), R.n(0.08))); cap.setMatrixAt(i, M4c(x, y, z)); cap.setColorAt(i, lin(R.pick(['#e8542e', '#2f8fd1', '#f2c94c', '#ffffff', '#e86fa8', '#2a9d8f'])));
      towel.setMatrixAt(i, M4c(x + 1.4, y + 0.03, z + R.r(-1, 1), R.r(-0.4, 0.4))); towel.setColorAt(i, lin(R.pick(['#f2c94c', '#e86fa8', '#2f8fd1', '#f4f1ea', '#3cae5c']))); }
    scene.add(poleB, cap, towel);
    const lg = new THREE.Group(); lg.position.set(-30, sandY(-30), -140); scene.add(lg); const wd = STD({ color: 0xf2efe8, roughness: 0.7 });
    for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.12), wd); l.position.set(x, 1.6, z); l.castShadow = true; lg.add(l); }
    const pl = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 1.9), wd); pl.position.y = 3.2; lg.add(pl); const hut = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.6), STD({ color: 0xc8372d })); hut.position.y = 3.9; hut.castShadow = true; lg.add(hut);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.7, 4).rotateY(Math.PI / 4), wd); rf.position.y = 4.95; lg.add(rf); }

  // --- houses: one instanced box with a world-sized facade sheet; gable roofs; awnings and balconies; shop fronts
  const facTex = wrap(texFacade()), roofTex = wrap(texRoof()); facTex.anisotropy = ANI;
  const houseMat = STD({ color: 0xffffff, roughness: 0.85 }); houseMat.onBeforeCompile = (sh) => {
    sh.uniforms.uFac = { value: facTex };
    sh.vertexShader = 'varying vec2 vFac;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + 0.5) * sc; vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y - 3.4) : vec2(lp.x, lp.y - 3.4); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, 0.0);`);
    sh.fragmentShader = 'uniform sampler2D uFac; varying vec2 vFac;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      vec3 fc = texture2D(uFac, vFac).rgb; diffuseColor.rgb *= (vFac.y < 0.0 ? vec3(0.78, 0.74, 0.7) : fc);`);
  };
  const roofGeo = (() => { const P = [], U = [];
    const q = (a, b, c, d, ua, ub, uc, ud) => { P.push(...a, ...c, ...b, ...a, ...d, ...c); U.push(...ua, ...uc, ...ub, ...ua, ...ud, ...uc); };
    q([-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 1, 0], [-0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1]);
    q([0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 1, 0], [0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1]);
    P.push(-0.5, 0, 0.5, -0.5, 1, 0, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, 0.5); U.push(0, 0, 0.5, 1, 1, 0, 0, 0, 0.5, 1, 1, 0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals(); return g; })();
  const roofMat = STD({ color: 0xffffff, roughness: 0.8, map: wrap(roofTex, 3, 2), side: THREE.DoubleSide });
  const HL = houseList(), houses = IM(new THREE.BoxGeometry(1, 1, 1), houseMat, HL.length), roofs = IM(roofGeo, roofMat, HL.length);
  const awn = [], balc = [], shops = []; { const R = RNG('decor');
    HL.forEach(([x, z, sx, sz, h, wc, rc, zone], i) => {
      houses.setMatrixAt(i, M4c(x, h / 2, z, 0, sx, h, sz)); houses.setColorAt(i, lin(wc));
      roofs.setMatrixAt(i, M4c(x, h, z, Math.PI / 2, sz + 0.5, Math.min(sx, sz) * R.r(0.25, 0.36), sx + 0.6)); roofs.setColorAt(i, lin(rc));
      const face = x > 0 ? x - sx / 2 : x + sx / 2, s = x > 0 ? -1 : 1;
      if (Math.abs(face) < 20) {
        if (R.f() < (zone ? 0.55 : 0.7)) awn.push([face + s * 0.8, 3.3, z, sz * R.r(0.55, 0.85), s, R.pick(['#c8372d', '#2f6fb0', '#2a7a5a', '#e8a33a', '#7a3a5a', '#3a3a3a'])]);
        shops.push([face + s * 0.03, 1.55, z, sz * 0.7, s, R.pick(['#8fa4b4', '#9aa8b0', '#a8b4b8', '#7f94a6'])]);
        const fl = Math.floor(h / 3.1); for (let f = 1; f < fl; f++) if (R.f() < (zone ? 0.45 : 0.25)) balc.push([face + s * 0.45, f * 3.1 + 0.15, z + R.r(-sz * 0.25, sz * 0.25), R.r(1.8, 3.2), s]);
      } }); }
  scene.add(houses, roofs);
  const awnM = STD({ map: texAwning(), roughness: 0.8, side: THREE.DoubleSide }), awnI = IM(new THREE.BoxGeometry(1.6, 0.06, 1), awnM, awn.length);
  awn.forEach(([x, y, z, w, s, c], i) => { awnI.setMatrixAt(i, M4c(x, y, z, 0, 1, 1, w, 0, -s * 0.35)); awnI.setColorAt(i, lin(c)); }); scene.add(awnI);
  const shopI = IM(new THREE.BoxGeometry(0.06, 2.4, 1), STD({ roughness: 0.15, metalness: 0.05, emissive: 0x30302a }), shops.length);
  shops.forEach(([x, y, z, w, s, c], i) => { shopI.setMatrixAt(i, M4c(x, y, z, 0, 1, 1, w)); shopI.setColorAt(i, lin(c)); }); scene.add(shopI);
  const balI = IM(new THREE.BoxGeometry(0.9, 0.14, 1), concrete, balc.length), balR = IM(new THREE.BoxGeometry(0.04, 0.95, 1), dark, balc.length);
  balc.forEach(([x, y, z, w, s], i) => { balI.setMatrixAt(i, M4c(x, y, z, 0, 1, 1, w)); balR.setMatrixAt(i, M4c(x + s * 0.43, y + 0.55, z, 0, 1, 1, w)); }); scene.add(balI, balR);

  // --- towers: glass curtain walls (48 x 96 m sheet in world units), a dark podium
  const towTex = wrap(texTower()); towTex.anisotropy = ANI;
  const towMat = STD({ color: 0xffffff, roughness: 0.25, metalness: 0.15 }); towMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTow = { value: towTex };
    sh.vertexShader = 'varying vec2 vTw;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 lp = (position + 0.5) * sc; vTw = (abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y)) / vec2(48.0, 96.0);`);
    sh.fragmentShader = 'uniform sampler2D uTow; varying vec2 vTw;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= texture2D(uTow, vTw).rgb * 1.15;');
  };
  const TL = towerList(), towers = IM(new THREE.BoxGeometry(1, 1, 1), towMat, TL.length), pods = IM(new THREE.BoxGeometry(1, 1, 1), STD({ color: 0x4a4e56, roughness: 0.6 }), TL.length), crowns = IM(new THREE.BoxGeometry(1, 1, 1), dark, TL.length);
  TL.forEach(([x, z, sx, sz, h, c], i) => { towers.setMatrixAt(i, M4c(x, h / 2, z, 0, sx, h, sz)); towers.setColorAt(i, lin(c)); pods.setMatrixAt(i, M4c(x, 3, z, 0, sx + 4, 6, sz + 4)); crowns.setMatrixAt(i, M4c(x, h + 1.5, z, 0, sx * 0.6, 3, sz * 0.6)); });
  scene.add(towers, pods, crowns);

  // --- the plains: trees, power poles, far mountains
  { const R = RNG('plain'), n = 700, trunk = IM(new THREE.CylinderGeometry(0.15, 0.22, 3, 6).translate(0, 1.5, 0), STD({ color: 0x5a4632 }), n), crown = IM(new THREE.IcosahedronGeometry(2.2, 1), STD({ color: 0x5f7f3a, roughness: 0.9, flatShading: true }), n);
    for (let i = 0; i < n; i++) { const z = -ZD - R.r(0, 9000), x = (R.f() < 0.5 ? -1 : 1) * (14 + Math.pow(R.f(), 1.6) * 600), s = R.r(0.7, 1.6); trunk.setMatrixAt(i, M4c(x, 0, z, 0, s, s, s)); crown.setMatrixAt(i, M4c(x, 3 * s + 1.6 * s, z, R.r(0, 3), s * R.r(0.9, 1.3), s * R.r(0.8, 1.1), s * R.r(0.9, 1.3))); crown.setColorAt(i, lin(R.pick(['#5f7f3a', '#6e8a40', '#4f6e34', '#7a8a44']))); }
    scene.add(trunk, crown);
    const np = 220, pole = IM(new THREE.CylinderGeometry(0.12, 0.16, 11, 6).translate(0, 5.5, 0), STD({ color: 0x6a5a48 }), np), arm = IM(new THREE.BoxGeometry(2.4, 0.14, 0.14), STD({ color: 0x6a5a48 }), np);
    for (let i = 0; i < np; i++) { const z = -ZC - i * 45; pole.setMatrixAt(i, M4c(13.5, 0, z)); arm.setMatrixAt(i, M4c(13.5, 10.4, z)); } scene.add(pole, arm);
    const mtnM = STD({ color: 0x8a8aa0, roughness: 1, flatShading: true });
    for (let k = 0; k < 14; k++) { const g = new THREE.ConeGeometry(R.r(1500, 3500), R.r(500, 1400), 9, 3); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < g.parameters.height / 2 - 1) { p.setX(i, p.getX(i) * R.r(0.8, 1.2)); p.setZ(i, p.getZ(i) * R.r(0.8, 1.2)); }
      g.computeVertexNormals(); const m = new THREE.Mesh(g, mtnM); const side = k % 2 ? 1 : -1; m.position.set(side * R.r(2500, 9000), g.parameters.height / 2 - 60, -ZD - R.r(9000, 26000)); scene.add(m); } }

  // --- cars: body, cabin glass, wheels, lamps
  const CL = carList(), NC = CL.length, paint = STD({ roughness: 0.35, metalness: 0.4 }), glass = STD({ color: 0x2c3a4a, roughness: 0.08, metalness: 0.5 }), tyre = STD({ color: 0x151515, roughness: 0.9 });
  // a car's side profile (length along x: rear -2.2 .. front +2.2), extruded across its width with a soft bevel; the glasshouse is a narrower dark extrusion
  const prof = (pts, w, bev) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 8 }); g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2); g.computeVertexNormals(); return g; };
  const bodyG = prof([[-2.2, 0.28], [2.2, 0.28], [2.22, 0.55], [2.05, 0.78], [1.0, 0.92], [0.55, 1.36], [-0.95, 1.4], [-1.75, 1.0], [-2.2, 0.92]], 1.62, 0.09);
  const glassG = prof([[0.78, 0.98], [0.47, 1.31], [-0.88, 1.34], [-1.55, 1.0]], 1.84, 0.02);
  const carB = IM(bodyG, paint, NC), carC = IM(glassG, glass, NC), carT = IM(new THREE.BoxGeometry(1.7, 0.18, 4.3), STD({ color: 0x1c1e22, roughness: 0.6 }), NC), carW = IM(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 12).rotateZ(Math.PI / 2), tyre, NC * 4);
  const carL = IM(new THREE.BoxGeometry(0.34, 0.14, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }), NC * 4, false);
  // details: chrome rims, bumpers + grille, plates, mirrors, door seams and handles (placed per car in the same frame as the body)
  const chrome = STD({ color: 0xd8dade, roughness: 0.25, metalness: 0.9 }), trimM = STD({ color: 0x18191c, roughness: 0.55 }), plateM = STD({ color: 0xf2f2ee, roughness: 0.5 });
  const carRim = IM(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 10).rotateZ(Math.PI / 2), chrome, NC * 4, false);
  const CAR_PARTS = [   // [geometry, material, list of [x, y, z, sx, sy, sz]] in the car's frame (front = -z)
    [new THREE.BoxGeometry(1, 1, 1), trimM, [[0, 0.42, -2.27, 1.75, 0.22, 0.12], [0, 0.42, 2.27, 1.75, 0.22, 0.12], [0, 0.66, -2.24, 1.0, 0.16, 0.06]]],                      // bumpers, grille
    [new THREE.BoxGeometry(1, 1, 1), plateM, [[0, 0.44, -2.34, 0.52, 0.12, 0.02], [0, 0.6, 2.33, 0.52, 0.12, 0.02]]],                                                          // plates
    [new THREE.BoxGeometry(1, 1, 1), trimM, [[-0.98, 0.98, -0.6, 0.16, 0.1, 0.22], [0.98, 0.98, -0.6, 0.16, 0.1, 0.22]]],                                                        // mirrors
    [new THREE.BoxGeometry(1, 1, 1), trimM, [[-0.905, 0.66, 0.05, 0.01, 0.55, 0.02], [0.905, 0.66, 0.05, 0.01, 0.55, 0.02], [-0.905, 0.66, -1.05, 0.01, 0.5, 0.02], [0.905, 0.66, -1.05, 0.01, 0.5, 0.02],
      [-0.91, 0.82, -0.75, 0.02, 0.04, 0.18], [0.91, 0.82, -0.75, 0.02, 0.04, 0.18], [-0.91, 0.82, 0.35, 0.02, 0.04, 0.18], [0.91, 0.82, 0.35, 0.02, 0.04, 0.18],
      [-0.9, 0.32, 0, 0.03, 0.08, 2.6], [0.9, 0.32, 0, 0.03, 0.08, 2.6]]],                                                                                                         // door seams, handles, sills
  ].map(([geo, mat, L]) => { const m = IM(geo, mat, NC * L.length, false); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return { m, L }; });
  carRim.instanceMatrix.setUsage(THREE.DynamicDrawUsage); carRim.frustumCulled = false; scene.add(carRim);
  CL.forEach((c, i) => { carB.setColorAt(i, lin(c[3])); carT.setColorAt(i, lin(c[3])); for (let k = 0; k < 4; k++) carL.setColorAt(i * 4 + k, lin(k < 2 ? '#fff4d8' : '#d0201a')); });
  [carB, carC, carT, carW, carL].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });

  // --- people: smooth instanced bodies in everyday clothes (walkers, joggers, people at the railing, the beach, the old town)
  const SHIRT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f1ea', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#9fc2e0', '#c2185b'];
  const PANTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#6a7a8a', '#4a5a3a', '#e8e2d6'], SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'], HAIR = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#8a4a2a', '#b8b0a8'];
  const RP = RNG('peopleD'), ppl = [];
  const person = (x, z, o = {}) => { const kid = o.kid ?? RP.f() < 0.08, shirt = RP.pick(SHIRT), skin = RP.pick(SKIN), shorts = RP.f() < 0.35;
    ppl.push(Object.assign({ x, z, yaw: Math.PI, v: 0, kid, s: kid ? RP.r(0.6, 0.72) : RP.r(0.92, 1.08), w: RP.r(0.9, 1.2), ph: RP.r(0, TAU), look: RP.n(0.4), y: 0, jog: false,
      c: (() => { const pants = lin(RP.pick(PANTS)), longS = RP.f() < 0.4; return { skin: lin(skin), shirt: lin(shirt), pants, shin: shorts ? lin(skin) : pants, sleeve: lin(shirt), fore: longS ? lin(shirt) : lin(skin),
        shoe: lin(RP.pick(['#1e1e22', '#f2f0ea', '#5a4030', '#2f4a6a'])), hair: lin(RP.pick(HAIR)) }; })(), longHair: RP.f() < 0.4 }, o)); };
  for (let i = 0; i < 22; i++) person(RP.r(-13, -4.5), RP.r(20, -70), { v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.7, 1.3), still: RP.f() < 0.25 });
  for (let i = 0; i < 46; i++) { const z = RP.r(50, -ZB), dir = RP.f() < 0.5 ? 1 : -1, jog = RP.f() < 0.18; person(RP.r(-12.8, -5), z, { v: dir * (jog ? RP.r(2.4, 3.2) : RP.r(0.8, 1.4)), jog }); }
  for (let i = 0; i < 16; i++) person(RAIL + 0.5, RP.r(40, -ZB), { yaw: -Math.PI / 2 + RP.n(0.3) });
  for (let i = 0; i < 14; i++) { const x = RP.r(-42, -24); person(x, RP.r(40, -ZB + 40), { y: sandY(x), v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.6, 1.1) }); }
  for (let i = 0; i < 24; i++) person(RP.r(11.2, 15), RP.r(50, -ZB), { v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.8, 1.4) });
  for (let i = 0; i < 70; i++) { const left = RP.f() < 0.5; person(left ? RP.r(-11, -4.4) : RP.r(11.2, 14), RP.r(-ZB, -ZC), { v: (RP.f() < 0.5 ? 1 : -1) * RP.r(0.8, 1.4), still: RP.f() < 0.3 }); }
  const N = ppl.length;
  const foldTex = g3Tex((x, w, h) => { x.fillStyle = '#f4f4f4'; x.fillRect(0, 0, w, h); const R = RNG('folds');
    for (let i = 0; i < 26; i++) { const px = R.r(0, w), ww = R.r(3, 12), g = x.createLinearGradient(px - ww, 0, px + ww, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, `rgba(0,0,0,${R.r(0.08, 0.2)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - ww, R.r(0, h * 0.4), ww * 2, R.r(h * 0.3, h)); } }, 128, 128);
  const clothM = STD({ map: foldTex, roughness: 0.88 }), skinM = STD({ roughness: 0.55 }), hairM = STD({ roughness: 0.7 }), shoeM = STD({ roughness: 0.5 });
  const lathe = (pts2, seg2 = 12) => new THREE.LatheGeometry(pts2.slice().sort((a, b) => a[1] - b[1]).map(([rr, y]) => new THREE.Vector2(rr, y)), seg2);
  const PG = {
    thigh: [lathe([[0.001, 0.03], [0.07, 0.025], [0.09, -0.02], [0.084, -0.12], [0.068, -0.32], [0.058, -0.44], [0.001, -0.46]]), 2, 'pants', clothM],
    shin: [lathe([[0.001, 0.01], [0.057, 0.0], [0.056, -0.1], [0.046, -0.28], [0.037, -0.41], [0.001, -0.43]]), 2, 'shin', clothM],
    shoe: [new THREE.CapsuleGeometry(0.05, 0.13, 4, 8).rotateX(Math.PI / 2).scale(1.1, 0.72, 1).translate(0, -0.43, 0.055), 2, 'shoe', shoeM],
    uarm: [lathe([[0.001, 0.02], [0.06, 0.0], [0.053, -0.12], [0.044, -0.28], [0.001, -0.3]], 10), 2, 'sleeve', clothM],
    farm: [lathe([[0.001, 0.0], [0.043, -0.005], [0.04, -0.12], [0.032, -0.25], [0.001, -0.26]], 10), 2, 'fore', clothM],
    hand: [new THREE.SphereGeometry(0.047, 10, 8).scale(0.75, 1.25, 0.55).translate(0, -0.3, 0), 2, 'skin', skinM],
    torso: [lathe([[0.001, -0.02], [0.15, 0.0], [0.142, 0.08], [0.158, 0.22], [0.19, 0.35], [0.175, 0.42], [0.09, 0.47], [0.001, 0.48]], 16).scale(1, 1, 0.62), 1, 'shirt', clothM],
    hips: [new THREE.CylinderGeometry(0.155, 0.165, 0.2, 14).scale(1, 1, 0.72), 1, 'pants', clothM],
    neck: [new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), 1, 'skin', skinM],
    head: [new THREE.SphereGeometry(0.11, 16, 12).scale(0.92, 1.08, 1), 1, 'skin', skinM],
    hair: [new THREE.SphereGeometry(0.118, 16, 8, 0, TAU, 0, Math.PI * 0.56).scale(0.96, 1.08, 1.04), 1, 'hair', hairM],
    hairB: [new THREE.SphereGeometry(0.1, 12, 8).scale(1.05, 1.5, 0.6), 1, 'hair', hairM],
  };
  const PM = {}; for (const k in PG) { const [geo, n, , mat] = PG[k]; const m = IM(geo, mat, N * n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); PM[k] = m; }
  ppl.forEach((q, i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setColorAt(i * PG[k][1] + j, q.c[PG[k][2]]); });

  // --- gulls over the beach: a bent pair of wings
  const gullG = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.15, -0.55, 0.12, 0, 0, 0, -0.15, 0, 0, 0.15, 0.55, 0.12, 0, 0, 0, -0.15, -0.55, 0.12, 0, -1.0, -0.05, 0.05, -0.55, 0.12, -0.12, 0.55, 0.12, 0, 1.0, -0.05, 0.05, 0.55, 0.12, -0.12], 3)); g.computeVertexNormals(); return g; })();
  const gulls = IM(gullG, STD({ color: 0xf4f2ee, side: THREE.DoubleSide, roughness: 0.7 }), 18, false); gulls.frustumCulled = false; scene.add(gulls);

  // --- glass shards that burst out of the old town's windows after you pass (seen when you look back)
  const shards = []; { const R = RNG('shards'); for (let i = 0; i < 3200; i++) { const side = R.f() < 0.5 ? -1 : 1, z = -R.r(runS(19.6), runS(21.6)), y = R.r(3, 16), x = side > 0 ? 14.4 : -11.6;
    shards.push({ x, y, z, t0: tPass(z) + R.r(0.08, 0.35), vx: -side * R.r(2, 14), vy: R.r(-1, 6), vz: R.r(-4, 4), b: R.r(0.55, 1) }); } }
  // the towers' curtain walls burst as you tear past (the shock of your passage): glass sprays into the street and back
  { const R = RNG('towerGlass'); const faces = TL.filter(([x, z, sx]) => Math.abs(x) - sx / 2 < 45);
    for (let i = 0; i < 7000; i++) { const [x, z, sx, sz, h] = R.pick(faces), side = Math.sign(x), fx = x - side * sx / 2, zz = z + R.r(-sz / 2, sz / 2), y = R.r(2, Math.min(h, 90)) * Math.pow(R.f(), 0.35);
      shards.push({ x: fx - side * 0.3, y, z: zz, t0: tPass(zz) - R.r(0.15, 0.5) + y * 0.002, vx: -side * R.r(8, 45), vy: R.r(-3, 12), vz: R.r(-5, 25), b: R.r(0.7, 1.3) }); } }
  const shardN = shards.length, shardP = new Float32Array(shardN * 3), shardC = new Float32Array(shardN * 3);
  const shardGeo = new THREE.BufferGeometry(); shardGeo.setAttribute('position', new THREE.BufferAttribute(shardP, 3)); shardGeo.setAttribute('color', new THREE.BufferAttribute(shardC, 3));
  const shardPts = new THREE.Points(shardGeo, new THREE.PointsMaterial({ size: 2.6, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.8)'], [1, 'rgba(255,255,255,0)']], 32) }));
  shardPts.frustumCulled = false; scene.add(shardPts);

  G = { r, cv, scene, cam, sky, skyU, seaU, key, hemi, clouds, cars: CL, carB, carC, carT, carW, carL, carRim, CAR_PARTS, ppl, PM, PG, gulls, shards, shardGeo };
  return G;
}

// one person's pose at time t (walkers loop over a long stretch so the promenade never empties)
function personPose(q, t) {
  let x = q.x, z = q.z, yaw = q.yaw, walk = 0, run = 0, p = t * (q.jog ? 9 : 5.6) + q.ph;
  if (q.v && !q.still) { z = q.z + q.v * t; yaw = q.v > 0 ? 0 : Math.PI; walk = q.jog ? 0 : 1; run = q.jog ? 0.75 : 0; }
  return { x, z, yaw, p, walk, run, y: q.y || 0 };
}
