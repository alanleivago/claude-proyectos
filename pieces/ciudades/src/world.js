
// =====================================================================
//  WORLD — the city by the river: sky (day / night / stars), ground with the river's channel, the avenue, sidewalks and the
//  promenade, blocks of brick buildings along the avenue, the skyline of glass towers on the far bank, the elevated metro and
//  its train, the cable-stayed bridge, a Ferris wheel, palms, street lamps, traffic lights, billboards; cars, people; then
//  nature: weeds, grass, trees, a forest, snow; animals (dogs, deer, wolves, a bear); rubble and dust
// =====================================================================
let G = null;
// every material that nature takes back: grass and moss creep over it (noise threshold rising with grassK), snow on top
const NAT = { uGrass: { value: 0 }, uSnow: { value: 0 }, uLeaves: { value: 0 }, uRust: { value: 0 } };
function natMat(o, k = 1) {
  const m = new THREE.MeshStandardMaterial(o);
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, NAT); sh.uniforms.uK = { value: k };
    sh.vertexShader = 'varying vec3 vNW; varying vec3 vNN;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
      { vec4 w4 = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        w4 = instanceMatrix * w4;
      #endif
        vNW = (modelMatrix * w4).xyz; vNN = normalize(mat3(modelMatrix) * objectNormal); }`);
    sh.fragmentShader = 'uniform float uGrass, uSnow, uLeaves, uRust, uK; varying vec3 vNW; varying vec3 vNN;\nfloat nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }\n'
      + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        { float up = smoothstep(0.55, 0.9, vNN.y), side = 1.0 - up; vec2 q = vNW.xz * 0.08 + vNW.y * 0.03;
          float nz = vn(q) * 0.6 + vn(q * 3.1) * 0.3 + vn(q * 9.7) * 0.1;
          float g = smoothstep(1.0 - uGrass * 1.15, 1.08 - uGrass * 1.15, nz) * uK * (up + side * 0.55 * smoothstep(0.0, 1.0, (8.0 - vNW.y) / 8.0 + uGrass * 0.6));
          vec3 grass = mix(vec3(0.12, 0.24, 0.06), vec3(0.24, 0.36, 0.1), vn(q * 5.3));
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.72, 0.5, 0.36), uRust * uK * side * smoothstep(0.4, 0.8, vn(q * 2.0 + 7.0)));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.5, 0.36, 0.18), uLeaves * up * uK * step(vNW.y, 1.0) * smoothstep(0.6, 0.72, vn(vNW.xz * 0.9)) * 0.75);
          diffuseColor.rgb = mix(diffuseColor.rgb, grass, clamp(g, 0.0, 1.0));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92, 0.94, 0.98), uSnow * (up * 0.95 + side * 0.25 * smoothstep(0.5, 0.7, vn(q * 3.0)))); }`);
  };
  return m;
}
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc8d6e4, 600, 9000);
  const cam = new THREE.PerspectiveCamera(66, W / H, 0.5, 60000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const SUN_DIR = dirV(-38 * DEG, 42 * DEG);

  // --- sky (no tone mapping): blue day, a night with stars, a pale winter sky
  const skyU = { top: { value: lin('#4f86d0') }, hor: { value: lin('#d8e6f2') }, sunDir: { value: SUN_DIR.clone() }, starA: { value: 0 }, sunK: { value: 1 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(50000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, hor, sunDir; uniform float starA, sunK; varying vec3 vDir;
      float sh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.1, 1.0); vec3 c = mix(hor, top, smoothstep(0.0, 0.55, pow(max(h, 0.0), 0.8)));
        float s = max(dot(d, sunDir), 0.0); c += vec3(1.0, 0.95, 0.85) * sunK * (pow(s, 1000.0) * 2.0 + pow(s, 30.0) * 0.2);
        float st = 0.0; float lat = asin(clamp(d.y, -1.0, 1.0)); for (int L = 0; L < 2; L++) { float sc = L == 0 ? 260.0 : 520.0; vec2 uv = vec2(atan(d.x, -d.z) * cos(lat), lat) * sc; vec2 cc = floor(uv);
          float r = sh(cc + float(L) * 17.3); if (r > 0.95) { vec2 o = vec2(0.2 + 0.6 * sh(cc + 3.1), 0.2 + 0.6 * sh(cc + 7.7)); st += smoothstep(0.22, 0.0, length(fract(uv) - o)) * (0.4 + 0.6 * sh(cc + 11.0)); } }
        c += vec3(0.95) * st * starA * smoothstep(0.05, 0.3, h);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  const cloudTex = texCloud(); const clouds = []; { const R = RNG('cloudsC'); for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.85 }));
    s.userData = { x: R.r(-14000, 14000), z: R.r(-30000, -9000), y: R.r(2500, 7000), w: R.r(4000, 9000), a: R.r(0.25, 0.4), o: R.r(0.6, 0.9) }; s.renderOrder = -2; scene.add(s); clouds.push(s); } }
  const hemi = new THREE.HemisphereLight(0xc4d6ee, 0x6a6a5a, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.3); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  Object.assign(sun.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 10, far: 4000 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.5;
  sun.target.position.set(0, 0, -400); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 1800); sun.target.updateMatrixWorld();

  // --- ground: the city's paved ground with the river channel cut across it
  const groundH = (x, z) => (z < RIVER_Z0 - 6 && z > RIVER_Z1 + 6 ? -9 : z < RIVER_Z0 && z > RIVER_Z1 ? -4 : GY);
  { const g = new THREE.PlaneGeometry(14000, 14000, 280, 280).rotateX(-Math.PI / 2).translate(0, 0, -3000), p = g.attributes.position, cols = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = groundH(x, z); p.setY(i, y); const c = y < -1 ? lin('#4a4438') : C3('#8a857c', '#77736a', hsh(Math.floor(x / 40) + Math.floor(z / 40) * 97)); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const m = natMat({ vertexColors: true, roughness: 0.95 }, 1); const gr = new THREE.Mesh(g, m); gr.receiveShadow = true; scene.add(gr); }
  // the river: sky reflection, ripples; it swells over the promenade for a while
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uTop: { value: lin('#4f86d0') }, uHor: { value: lin('#d8e6f2') }, uBody: { value: lin('#2a5a6a') }, uIce: { value: 0 }, uMud: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uIce, uMud; uniform vec3 uTop, uHor, uBody; varying vec3 vW;
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT; vec3 n = normalize(vec3(0.04 * sin(p.x * 0.06 + t * 0.8) + 0.03 * sin(p.x * 0.21 - p.y * 0.13 + t * 1.3), 1.0, 0.04 * sin(p.y * 0.07 - t * 0.6) + 0.03 * sin(p.y * 0.23 + p.x * 0.1 - t)));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 col = mix(mix(uBody, vec3(0.42, 0.36, 0.26), uMud), mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.5)), clamp(fres * 0.9 + 0.15, 0.0, 0.85));
        col = mix(col, vec3(0.86, 0.9, 0.95), uIce * 0.85);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(14000, RIVER_Z0 - RIVER_Z1 + 40).rotateX(-Math.PI / 2), seaMat); sea.position.set(0, -2, (RIVER_Z0 + RIVER_Z1) / 2); scene.add(sea);

  // --- the avenue (asphalt, lanes, a median), sidewalks, crosswalks; the riverside promenade
  const asphTex = wrap(g3Tex((x, w, h) => { const R = RNG('asphC'); x.fillStyle = '#4a4a4c'; x.fillRect(0, 0, w, h); speck(x, w, h, 20000, ['rgba(20,20,22,0.3)', 'rgba(160,160,160,0.15)'], R, 1, 3);
    x.fillStyle = 'rgba(240,240,236,0.85)'; for (const u of [0.2, 0.35, 0.65, 0.8]) for (let v = 0; v < h; v += 64) x.fillRect(w * u, v, 3, 32); x.fillStyle = '#e0b030'; x.fillRect(w * 0.49, 0, 3, h); x.fillRect(w * 0.51, 0, 3, h); }, 256, 512));
  const AL = 60 - RIVER_Z0, AZ = (60 + RIVER_Z0) / 2; const ave = new THREE.Mesh(new THREE.PlaneGeometry(AVE_W, AL).rotateX(-Math.PI / 2), natMat({ map: asphTex, roughness: 0.9 }, 0.9)); ave.material.map.repeat.set(1, AL / 65); ave.position.set(0, GY + 0.05, AZ); ave.receiveShadow = true; scene.add(ave);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, AL), natMat({ color: 0xc8c2b6, roughness: 0.9 })); sw.position.set(s * (AVE_W / 2 + 4), GY + 0.15, AZ); sw.receiveShadow = true; scene.add(sw); }
  const cross = new THREE.Mesh(new THREE.BoxGeometry(260, 0.2, 18), natMat({ map: asphTex, roughness: 0.9 })); cross.position.set(0, GY + 0.06, -60); cross.receiveShadow = true; scene.add(cross);
  const prom = new THREE.Mesh(new THREE.BoxGeometry(1400, 0.6, 30), natMat({ color: 0xd8cfbe, roughness: 0.9 })); prom.position.set(0, GY + 0.1, RIVER_Z0 + 18); prom.receiveShadow = true; scene.add(prom);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(14000, 10, 2), natMat({ color: 0x8a8478, roughness: 1 })); wall.position.set(0, -4, RIVER_Z0 + 1); scene.add(wall);
  const wall2 = wall.clone(); wall2.position.z = RIVER_Z1 - 1; scene.add(wall2);

  // --- buildings on the near bank: brick blocks along the avenue and the cross street, lit windows at night, tar roofs
  const BR = texBrick(); [BR.alb, BR.lit].forEach((t) => { wrap(t); t.anisotropy = ANI; }); const tarTex = wrap(texRoof());
  const WINU = { uOn: { value: 1 }, uPow: { value: 1 }, uBroken: { value: 0 } };
  const bldMat = natMat({ color: 0xffffff, roughness: 0.88, emissive: 0xffffff }, 0.8); { const prev = bldMat.onBeforeCompile; bldMat.onBeforeCompile = (sh) => { prev(sh);
    Object.assign(sh.uniforms, { uFacM: { value: BR.alb }, uFacE: { value: BR.lit }, uRoof: { value: tarTex } }, { uOn: WINU.uOn, uPow: WINU.uPow, uBroken: WINU.uBroken });
    sh.vertexShader = 'varying vec2 vFac; varying float vTop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + vec3(0.5, 0.0, 0.5)) * sc; vTop = step(0.5, normal.y); vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : (vTop > 0.5 ? lp.xz : vec2(lp.x, lp.y)); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacE, uRoof; uniform float uOn, uPow, uBroken; varying vec2 vFac; varying float vTop;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= vTop > 0.5 ? texture2D(uRoof, vFac * 3.0).rgb * 0.9 : texture2D(uFacM, vFac).rgb;\n { float cellB = fract(sin(dot(floor(vFac * 8.0), vec2(17.1, 93.7))) * 5137.3); vec4 e0 = texture2D(uFacE, vFac); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.04), step(cellB, uBroken) * step(0.05, e0.a) * (1.0 - vTop)); }')
      .replace('#include <emissivemap_fragment>', `{ vec4 e = texture2D(uFacE, vFac); float th = (e.a - 0.25) / 0.74; float cellH = fract(sin(dot(floor(vFac * 8.0), vec2(41.3, 17.7))) * 9137.1);
        float on = step(th, uOn) * step(0.05, e.a) * (1.0 - vTop) * step(cellH, uPow); totalEmissiveRadiance = e.rgb * on * 2.2; }`); }; }
  const COLS = ['#c4785c', '#b06a50', '#d8b898', '#a85a44', '#c8a080', '#e0d0b8', '#b88a6a', '#9a6a5a', '#d8c8b0', '#a8b0b8'];
  const BL = []; { const R = RNG('blocksC');
    const row = (xs, z0, z1, side) => { let z = z0; while (z > z1) { const d = R.r(14, 26), w = R.r(18, 34), h = R.r(9, 24) * (1 + 0.25 * ss(-100, -380, z)) * (1 + 0.6 * ss(60, 0, z)); BL.push({ x: side * (xs + w / 2), z: z - d / 2, sx: w, sz: d - 1, h, c: R.pick(COLS), tf: 0 }); z -= d; } };
    for (const s of [-1, 1]) { row(AVE_W / 2 + 8.5, 60, -68, s); row(AVE_W / 2 + 8.5, -52, RIVER_Z0 + 38, s); }
    for (let i = 0; i < 4000 && BL.length < 520; i++) { const x = R.r(-1200, 1200), z = R.r(RIVER_Z0 + 40, 300); if (Math.abs(x) < AVE_W / 2 + 46 || Math.abs(z + 60) < 16 || Math.abs(z - METRO_Z) < 10) continue;
      if (BL.some((b) => Math.abs(b.x - x) < (b.sx + 22) / 2 && Math.abs(b.z - z) < (b.sz + 22) / 2)) continue; BL.push({ x, z, sx: R.r(16, 30), sz: R.r(14, 26), h: R.r(10, 32) * (1 + 0.6 * ss(150, 600, Math.abs(x))), c: R.pick(COLS), tf: 0 }); } }
  { const R = RNG('farBlocksC'); for (let i = 0; i < 6000 && BL.length < 1300; i++) { const x = R.r(-1500, 1500), z = R.r(RIVER_Z1 - 30, -2200); if (BL.some((b) => b.far && Math.abs(b.x - x) < (b.sx + 18) / 2 && Math.abs(b.z - z) < (b.sz + 18) / 2)) continue;
    BL.push({ x, z, sx: R.r(20, 40), sz: R.r(18, 34), h: R.r(12, 45), c: R.pick(COLS), far: true }); } }
  BL.forEach((b, i) => { b.y0 = GY - 0.3; b.tf = 44 + hsh(i, 3) * 12; });
  const bld = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), bldMat, BL.length); bld.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  BL.forEach((b, i) => { bld.setMatrixAt(i, M4c(b.x, b.y0, b.z, 0, b.sx, b.h, b.sz)); bld.setColorAt(i, lin(b.c)); }); scene.add(bld);

  // --- the skyline on the far bank: glass and stone towers with crowns and antennas, lit at night
  const winMats = [0, 1, 2, 3].map((k) => { const t = wrap(texWindows(k)); t.anisotropy = ANI; const e = wrap(texTowerLit(k)); return natMat({ map: t, roughness: [0.4, 0.85, 0.8, 0.35][k], metalness: [0.45, 0, 0, 0.55][k], emissive: 0xffffff, emissiveMap: e, emissiveIntensity: 0 }, 0.6); });
  const towers = []; { const R = RNG('skylineC'); const spots = []; for (let i = 0; i < 400 && spots.length < 34; i++) { const x = R.r(-900, 900) * (1 + 0.5 * R.f()), z = R.r(RIVER_Z1 - 60, -1900); if (spots.some(([a, b]) => Math.hypot(a - x, b - z) < 90)) continue; spots.push([x, z]); }
    spots.forEach(([x, z], i) => { const kind = R.pick([0, 0, 3, 1, 2]), w = R.r(34, 60), d = R.r(30, 54), h = R.r(110, 300) * (1 - 0.25 * ss(400, 900, Math.abs(x))), grp = new THREE.Group(); grp.position.set(x, GY, z); scene.add(grp);
      const mk = (ww, hh, dd, y) => { const g = new THREE.BoxGeometry(ww, hh, dd), uv = g.attributes.uv, nm = g.attributes.normal; for (let k = 0; k < uv.count; k++) { const side = Math.abs(nm.getX(k)) > 0.5 ? dd : ww; uv.setXY(k, uv.getX(k) * side / 26, uv.getY(k) * hh / 112); } const m = new THREE.Mesh(g, winMats[kind]); m.position.y = y; m.castShadow = true; grp.add(m); };
      mk(w, h, d, h / 2); let top = h; if (R.f() < 0.5) { const h2 = h * 0.18; mk(w * 0.7, h2, d * 0.7, h + h2 / 2); top += h2; } if (R.f() < 0.35) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.5, 40, 6), STD({ color: 0x9aa4ac, metalness: 0.6, roughness: 0.4 })); a.position.y = top + 20; grp.add(a); top += 40; }
      towers.push({ grp, x, z, h: top, w, tf: TOWER_T0 + (i / 34) * (TOWER_T1 - TOWER_T0) + hsh(i, 2) * 0.8, lean: (hsh(i, 4) - 0.5) * 2, i }); }); }
  // a stadium on the far bank, right
  { const st = new THREE.Mesh(new THREE.CylinderGeometry(120, 135, 34, 40, 1, true), natMat({ color: 0xe8e4dc, roughness: 0.8, side: THREE.DoubleSide })); st.position.set(820, GY + 17, -980); scene.add(st); G_ST = st; }

  // --- the elevated metro: a viaduct on pillars crossing the avenue, a 4-car train
  const metro = new THREE.Group(); scene.add(metro);
  { const conc = natMat({ color: 0xb8b2a6, roughness: 0.9 }); const deck = new THREE.Mesh(new THREE.BoxGeometry(2400, 2, 9), conc); deck.position.set(0, METRO_Y, METRO_Z); deck.castShadow = true; deck.receiveShadow = true; metro.add(deck);
    for (let x = -1200; x <= 1200; x += 40) { const p = new THREE.Mesh(new THREE.BoxGeometry(2.4, METRO_Y, 2.4), conc); p.position.set(x, METRO_Y / 2, METRO_Z); p.castShadow = true; metro.add(p); } }
  const train = new THREE.Group(); scene.add(train); { const body = natMat({ color: 0xe8ecef, roughness: 0.4, metalness: 0.3 }), stripe = STD({ color: 0xd8372d }), glass = STD({ color: 0x1e2830, roughness: 0.1, metalness: 0.7 });
    for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(18, 3.4, 3.2), body); c.position.set(k * 19, 0, 0); c.castShadow = true; train.add(c); const s2 = new THREE.Mesh(new THREE.BoxGeometry(18.1, 0.4, 3.3), stripe); s2.position.set(k * 19, -0.6, 0); train.add(s2); const g2 = new THREE.Mesh(new THREE.BoxGeometry(17, 1.0, 3.32), glass); g2.position.set(k * 19, 0.6, 0); train.add(g2); } }

  // --- the cable-stayed bridge: a deck along the avenue's axis across the river, an A-pylon, two fans of stays
  const bridge = new THREE.Group(); scene.add(bridge); const BZ0 = RIVER_Z0 + 10, BZ1 = RIVER_Z1 - 10, PZ = (BZ0 + BZ1) / 2, PH = 140, white = natMat({ color: 0xf0eeea, roughness: 0.6 }, 0.5);
  const segs = []; { const n = 10, L = (BZ0 - BZ1) / n; for (let k = 0; k < n; k++) { const s = new THREE.Group(); s.position.set(0, 8, BZ0 - (k + 0.5) * L); bridge.add(s); const d = new THREE.Mesh(new THREE.BoxGeometry(AVE_W + 4, 2.4, L - 0.3), natMat({ map: asphTex, roughness: 0.9 })); d.castShadow = true; d.receiveShadow = true; s.add(d);
      for (const sx of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, L - 0.3), white); rail.position.set(sx * (AVE_W / 2 + 1.6), 1.6, 0); s.add(rail); } segs.push({ s, k, z: s.position.z, sp: (hsh(k, 3) - 0.5) * 2 }); } }
  // approach ramps: the deck meets the avenue on the near bank and the street on the far bank (no gap)
  { const RL = 55, RH = 9.2, W = AVE_W + 4, ramp = natMat({ color: 0xb8b2a6, roughness: 0.9 }); for (const [z, dir] of [[BZ0, 1], [BZ1, -1]]) {
    const sh = new THREE.Shape([new THREE.Vector2(0, -0.5), new THREE.Vector2(RL, -0.5), new THREE.Vector2(0, RH)]); const eg = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }).translate(0, 0, -W / 2).rotateY(-dir * Math.PI / 2);
    const em = new THREE.Mesh(eg, ramp); em.position.set(0, GY, z); em.castShadow = em.receiveShadow = true; scene.add(em);
    const top = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, Math.hypot(RL, RH)), natMat({ map: asphTex, roughness: 0.9 }, 0.9)); top.position.set(0, GY + RH / 2 + 0.2, z + dir * RL / 2); top.rotation.x = dir * Math.atan2(RH, RL); top.receiveShadow = true; scene.add(top);
    for (const sx of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, Math.hypot(RL, RH)), white); rail.position.set(sx * (W / 2 - 0.4), GY + RH / 2 + 0.9, z + dir * RL / 2); rail.rotation.x = top.rotation.x; scene.add(rail); } } }
  const pylon = new THREE.Group(); pylon.position.set(0, 0, PZ); bridge.add(pylon); for (const sx of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(3, PH, 3), white); leg.position.set(sx * 14, PH / 2 - 2, 0); leg.rotation.z = -sx * 0.11; leg.castShadow = true; pylon.add(leg); }
  { const cap = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 4), white); cap.position.set(0, PH - 2, 0); pylon.add(cap); const beam = new THREE.Mesh(new THREE.BoxGeometry(32, 2, 3), white); beam.position.set(0, 10, 0); pylon.add(beam); }
  const stays = []; { const cm = STD({ color: 0xe8e8e8, roughness: 0.5, metalness: 0.4 }); for (const dir of [-1, 1]) for (let k = 1; k <= 9; k++) for (const sx of [-1, 1]) { const z1 = PZ + dir * k * 13, a = new THREE.Vector3(sx * 1.5, PH - 6 - k * 2, PZ), b = new THREE.Vector3(sx * (AVE_W / 2 + 1), 9, z1);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1, 4).translate(0, 0.5, 0), cm); m.position.copy(a); m.lookAt(b); m.rotateX(Math.PI / 2); m.scale.set(1, a.distanceTo(b), 1); bridge.add(m); stays.push(m); } }

  // --- the Ferris wheel on the promenade (right), palms, lamps, traffic lights, billboards
  const wheel = new THREE.Group(); wheel.position.set(150, GY, RIVER_Z0 + 22); scene.add(wheel); const WR = 32;
  { const steel = natMat({ color: 0xf2f0ec, roughness: 0.5, metalness: 0.3 }, 0.5), rim = new THREE.Mesh(new THREE.TorusGeometry(WR, 0.7, 6, 64), steel); const rot = new THREE.Group(); rot.position.y = WR + 6; wheel.add(rot); rot.add(rim);
    for (let k = 0; k < 16; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.3, WR, 0.3).translate(0, WR / 2, 0), steel); sp.rotation.z = k / 16 * TAU; rot.add(sp); }
    for (const sx of [-1, 1]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(1, WR + 8, 1), steel); lg.position.set(sx * 9, (WR + 6) / 2, 0); lg.rotation.z = sx * 0.28; wheel.add(lg); }
    const cabins = []; for (let k = 0; k < 16; k++) { const cb = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), STD({ color: lin(['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a'][k % 4]), roughness: 0.5 })); cb.castShadow = true; wheel.add(cb); cabins.push(cb); } wheel.userData = { rot, cabins }; }
  const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo.clone(); g2.applyMatrix4(m4); g2.computeVertexNormals();
      const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.6 + 0.4 * clamp(n.getY(i) * 0.5 + 0.5) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
  const palmG = mergeG([[new THREE.CylinderGeometry(0.25, 0.4, 10, 6).translate(0, 5, 0), M4c(0, 0, 0), '#8a7258', 0], ...[0, 1, 2, 3, 4, 5, 6].map((k) => [new THREE.ConeGeometry(0.6, 5, 4).rotateX(Math.PI / 2).translate(0, 0, 2.5), M4c(0, 10, 0, k / 7 * TAU, 1, 0.3, 1, 0.5), '#3e7a2e', 1])]);
  const PALMS = []; for (let x = -600; x <= 600; x += 18) if (Math.abs(x - 150) > 40 && Math.abs(x) > 20) PALMS.push([x, RIVER_Z0 + 30]);
  const palms = IM(palmG, natMat({ vertexColors: true, roughness: 0.9 }, 0.4), PALMS.length); palms.instanceMatrix.setUsage(THREE.DynamicDrawUsage); PALMS.forEach(([x, z], i) => palms.setMatrixAt(i, M4c(x, GY, z, i))); scene.add(palms);
  const LAMPS = []; for (let z = 40; z > RIVER_Z0 + 30; z -= 26) for (const s of [-1, 1]) LAMPS.push([s * (AVE_W / 2 + 1.5), z]);
  const lampPole = IM(new THREE.CylinderGeometry(0.12, 0.18, 9, 6).translate(0, 4.5, 0), natMat({ color: 0x2a2e33, metalness: 0.4, roughness: 0.5 }), LAMPS.length); lampPole.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  LAMPS.forEach(([x, z], i) => lampPole.setMatrixAt(i, M4c(x, GY, z))); scene.add(lampPole);
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,200,0.8)'], [0.5, 'rgba(255,190,120,0.2)'], [1, 'rgba(255,170,90,0)']], 64);
  const lampLights = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(LAMPS.flatMap(([x, z]) => [x * 0.8, GY + 9, z]), 3)), new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, map: glowTex, color: 0xffd090, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  lampLights.renderOrder = 6; scene.add(lampLights);
  const BB = []; { const R = RNG('billboards'); for (let i = 0; i < 6; i++) BB.push({ x: (i % 2 ? 1 : -1) * R.r(30, 60), z: -20 - i * 55, c: R.pick(['#e0a43a', '#c8372d', '#2f6fb0', '#3a8a5a', '#e86ab0', '#5ab0d8']) }); }
  const billboards = BB.map((b) => { const grp = new THREE.Group(); grp.position.set(b.x, GY + 22, b.z); grp.rotation.y = b.x > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(grp); const panel = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 0.4), STD({ color: lin(b.c), emissive: lin(b.c), emissiveIntensity: 0.6 })); grp.add(panel);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.6, 10, 0.6), STD({ color: 0x3a3e44 })); post.position.y = -8; grp.add(post); return { grp, panel }; });

  // --- cars on the avenue (body, glass, wheels), people on the sidewalks and the promenade
  const profile = (P, w) => { const sh = new THREE.Shape(P.map(([x, y]) => new THREE.Vector2(x, y))); const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 }); g.translate(0, 0, -w / 2); return g; };
  const carShell = profile([[-2.2, 0.32], [2.2, 0.32], [2.25, 0.62], [2.05, 0.82], [1.1, 0.9], [-2.0, 0.92], [-2.25, 0.7]], 1.62), carGlass = profile([[1.05, 0.9], [0.35, 1.38], [-1.2, 1.4], [-1.75, 0.92]], 1.5);
  const CARS = []; { const R = RNG('carsC'); for (let i = 0; i < 70; i++) { const lane = i % 4, cross = i >= 56; CARS.push({ lane, cross, z0: R.r(RIVER_Z0 + 20, 60), x0: R.r(-130, 130), v: cross ? (i % 2 ? 1 : -1) * R.r(8, 12) : (lane < 2 ? -1 : 1) * R.r(9, 14), c: ['#f2c400', '#d8261e', '#f4f4f0', '#16161a', '#b8bcc4', '#f07a20', '#2a5ac8', '#2e9a4a', '#8a1e2a', '#e86ab0', '#5ab0d8', '#f4f4f0'][i % 12], ph: R.r(0, 6), crash: R.f() < 0.5 }); } }
  const paint = natMat({ roughness: 0.4, metalness: 0.15 }, 0.7), glassM = STD({ color: 0x1e2830, roughness: 0.1, metalness: 0.7 });
  const carBody = IM(carShell, paint, CARS.length), carTop = IM(carGlass, glassM, CARS.length), wheels = IM(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12).rotateX(Math.PI / 2), STD({ color: 0x16161a, roughness: 0.8 }), CARS.length * 4);
  CARS.forEach((c, i) => carBody.setColorAt(i, lin(c.c))); [carBody, carTop, wheels].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  const FOLK = []; { const R = RNG('folkC'); for (let i = 0; i < 520; i++) { const zone = R.f(); let x, z; if (zone < 0.55) { x = (R.f() < 0.5 ? -1 : 1) * R.r(AVE_W / 2 + 1, AVE_W / 2 + 7); z = R.r(RIVER_Z0 + 30, 60); } else if (zone < 0.8) { x = R.r(-500, 500); z = RIVER_Z0 + R.r(6, 30); } else { x = R.r(-120, 120); z = R.r(-66, -54); }
    FOLK.push({ x, z, v: R.r(0.8, 1.6) * (R.f() < 0.5 ? 1 : -1), along: zone < 0.55 ? 'z' : 'x', ph: R.r(0, 6), top: R.pick(['#e8e4dc', '#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#2a2a30', '#f2d24a', '#8a3a2a']), s: R.r(0.9, 1.08) }); } }
  const folkB = IM(new THREE.CapsuleGeometry(0.24, 0.95, 3, 6).translate(0, 0.78, 0), STD({ roughness: 0.8 }), FOLK.length, false), folkH = IM(new THREE.SphereGeometry(0.17, 8, 6).translate(0, 1.66, 0), STD({ color: 0xd8a888, roughness: 0.8 }), FOLK.length, false);
  FOLK.forEach((f, i) => folkB.setColorAt(i, lin(f.top))); [folkB, folkH].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });

  // --- nature: weeds (tufts in the cracks), trees that grow in the streets and the blocks, then a forest; snow
  const tuftG = mergeG([...[0, 1, 2, 3, 4].map((k) => [new THREE.ConeGeometry(0.12, 1.2, 3).translate(0, 0.6, 0), M4c(Math.cos(k * 1.3) * 0.2, 0, Math.sin(k * 1.3) * 0.2, 0, 1, 1, 1, Math.cos(k) * 0.4, Math.sin(k) * 0.4), '#5a8a2a', 1])]);
  const WEEDS = []; { const R = RNG('weedsC'); for (let i = 0; i < 4000; i++) { const onAve = R.f() < 0.6, x = onAve ? R.r(-AVE_W / 2 - 8, AVE_W / 2 + 8) : R.r(-300, 300), z = onAve ? R.r(-400, 60) : R.r(-400, 60); WEEDS.push([x, z, R.r(0.6, 1.6), 26 + R.r(0, 6)]); } }
  const weeds = IM(tuftG, natMat({ vertexColors: true, roughness: 0.9 }, 0), WEEDS.length, false); weeds.instanceMatrix.setUsage(THREE.DynamicDrawUsage); weeds.frustumCulled = false; scene.add(weeds);
  const lumpy = (r, s) => { const g = new THREE.IcosahedronGeometry(r, 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + 0.18 * Math.sin(v.x * 3.1 + s) * Math.sin(v.y * 2.7 + s * 2) + 0.12 * Math.sin(v.z * 5.3 + s * 3); p.setXYZ(i, v.x * k, v.y * k * 0.9, v.z * k); } return g; };
  const broad = (seed, cols) => { const R = RNG('broadC', seed), parts = [[new THREE.CylinderGeometry(0.3, 0.5, 6, 7).translate(0, 3, 0), M4c(0, 0, 0), '#5a4430', 0]]; for (let k = 0; k < 7; k++) { const a = R.r(0, TAU), rr = k ? R.r(1, 2.6) : 0; parts.push([lumpy(R.r(1.8, 2.6), R.r(0, 9)), M4c(Math.cos(a) * rr, 7 + R.r(-1, 2), Math.sin(a) * rr), R.pick(cols), 1]); } return mergeG(parts); };
  const conif = mergeG([[new THREE.CylinderGeometry(0.25, 0.45, 3, 6).translate(0, 1.5, 0), M4c(0, 0, 0), '#4a3828', 0], ...[0, 1, 2, 3, 4].map((k) => [new THREE.ConeGeometry(3.2 - k * 0.5, 3.4, 8).translate(0, 1.7, 0), M4c(0, 2.4 + k * 2.2, 0), '#2e4a28', 1])]);
  const TGEO = [broad(1, ['#4f7a2e', '#5a8a34', '#46702a']), broad(2, ['#7a9a3a', '#c8b040', '#6a8a2e']), conif];
  const TREES = []; { const R = RNG('forestC'); for (let i = 0; i < 9000 && TREES.length < 2600; i++) { const x = R.r(-500, 500), z = R.r(RIVER_Z0 + 4, 70); if (Math.hypot(x, z - 90) < 40) continue; TREES.push({ x, z, type: R.f() < 0.3 ? 2 : R.f() < 0.5 ? 1 : 0, s: R.r(1.0, 1.7), t0: 50 + R.r(0, 6), ry: R.r(0, 6) }); } }
  { const R = RNG('treesC'); for (let i = 0; i < 24000 && TREES.length < 6200; i++) { const x = R.r(-1400, 1400), z = R.r(-2400, 80); if (z < RIVER_Z0 + 2 && z > RIVER_Z1 - 2) continue;
    const street = Math.abs(x) < AVE_W / 2 + 8 && z > RIVER_Z0; const t0 = street ? 33 + R.r(0, 8) : z < RIVER_Z1 ? 52 + R.r(0, 6) : 34 + R.r(0, 14); TREES.push({ x, z, type: R.f() < 0.2 ? 2 : R.f() < 0.5 ? 1 : 0, s: R.r(0.7, 1.4) * (1 + Math.max(0, -z - 800) / 1500), t0, ry: R.r(0, 6) }); } }
  const treeMat = natMat({ vertexColors: true, roughness: 0.9 }, 0), treeI = TGEO.map((geo, k) => { const m = IM(geo, treeMat, TREES.filter((t) => t.type === k).length); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m; });
  { const c = [0, 0, 0]; TREES.forEach((tr) => { tr.slot = c[tr.type]++; }); }

  // --- animals: one low-poly quadruped, scaled and coloured as dogs, deer (with antlers), wolves, a bear
  const quad = mergeG([[new THREE.IcosahedronGeometry(1, 1).scale(0.5, 0.45, 1.0), M4c(0, 1.0, 0), '#ffffff', 1], [new THREE.IcosahedronGeometry(1, 1).scale(0.26, 0.26, 0.4), M4c(0, 1.45, -1.05), '#ffffff', 1],
    ...[[-0.3, -0.6], [0.3, -0.6], [-0.3, 0.6], [0.3, 0.6]].map(([x, z]) => [new THREE.CylinderGeometry(0.07, 0.09, 0.9, 5).translate(0, 0.45, 0), M4c(x, 0, z), '#ffffff', 0]), [new THREE.CylinderGeometry(0.03, 0.08, 0.6, 4), M4c(0, 1.1, 1.1, 0, 1, 1, 1, 1.0), '#ffffff', 0]]);
  const ANIM = []; { const R = RNG('animals'); const add = (kind, n, t0, t1, s, c) => { for (let i = 0; i < n; i++) ANIM.push({ kind, t0: t0 + R.r(0, 1), t1, s: s * R.r(0.9, 1.15), c: R.pick(c), x0: R.r(-40, 40), z0: R.r(RIVER_Z0 + 40, 0), vx: R.r(-2, 2), vz: R.r(-3, 3), ph: R.r(0, 6) }); };
    add('dog', 8, 17, 25, 0.75, ['#8a6a44', '#2a2420', '#c8a878', '#5a4a3a']); add('deer', 7, 31, 41, 1.25, ['#a8743e', '#8a5a2e']); add('wolf', 6, 54, 60, 0.95, ['#7a7a78', '#5a5a58', '#9a9890']); add('bear', 1, 63, 66.5, 1.9, ['#3a2a1e']); }
  const animals = IM(quad, STD({ vertexColors: true, roughness: 0.85, flatShading: true }), ANIM.length, false); ANIM.forEach((a, i) => animals.setColorAt(i, lin(a.c))); animals.instanceMatrix.setUsage(THREE.DynamicDrawUsage); animals.frustumCulled = false; scene.add(animals);
  const antlers = IM(new THREE.ConeGeometry(0.05, 0.6, 4), STD({ color: 0xd8c8a8 }), ANIM.length * 2, false); antlers.instanceMatrix.setUsage(THREE.DynamicDrawUsage); antlers.frustumCulled = false; scene.add(antlers);

  // --- rubble mounds where buildings and towers fell; dust; debris from the bridge
  const puffTex = texPuff('puffC', 30, 0.4), pool = (n, map, o = {}) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map, transparent: true, depthWrite: false, opacity: 0 }, o))); s.visible = false; s.renderOrder = o.order ?? 8; scene.add(s); return s; });
  const dust = pool(260, puffTex), splash = pool(80, puffTex);
  const mound = IM(new THREE.SphereGeometry(1, 10, 6, 0, TAU, 0, Math.PI / 2), natMat({ color: 0x8a8278, roughness: 1, flatShading: true }, 1), BL.length + towers.length); mound.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mound.frustumCulled = false; scene.add(mound);

  G = { cv, r, scene, cam, sky, skyU, clouds, hemi, sun, seaMat, sea, WINU, BL, bld, winMats, towers, metro, train, bridge, segs, pylon, stays, wheel, PALMS, palms, LAMPS, lampPole, lampLights, billboards, CARS, carBody, carTop, wheels, FOLK, folkB, folkH,
    WEEDS, weeds, TREES, treeI, ANIM, animals, antlers, dust, splash, mound, BZ0, BZ1, PZ, PH };
  return G;
}
let G_ST = null;
