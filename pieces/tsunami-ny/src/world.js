
// =====================================================================
//  WORLD — New York at sunset from a rooftop: the harbour floor and its water, the coastlines, ~2,500 Manhattan buildings
//  (brick facades with lit windows, water tanks), the downtown skyline and One World Trade Center, Jersey City and Brooklyn,
//  the Brooklyn Bridge, the Verrazzano, the Statue of Liberty, boats, cars, a helicopter, our roof; the wave and its spray
// =====================================================================
function envSunset() {   // the dusk sky as a cube map, for reflections in glass and water
  const face = (k) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    if (k === 2) { x.fillStyle = '#3a4c86'; x.fillRect(0, 0, 64, 64); } else if (k === 3) { x.fillStyle = '#3a3a44'; x.fillRect(0, 0, 64, 64); }
    else { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#3a4c86'); g.addColorStop(0.42, k === 0 ? '#e09a78' : '#8c8cb4'); g.addColorStop(0.5, k === 0 ? '#ffc890' : '#e8b096'); g.addColorStop(0.52, '#5a5058'); g.addColorStop(1, '#2e2e36'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
    return c; };
  const t = new THREE.CubeTexture([0, 1, 2, 3, 4, 5].map(face)); t.encoding = THREE.sRGBEncoding; t.needsUpdate = true; return t;
}
let G = null, g3NB = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc7a8a4, 1500, 30000);
  const cam = new THREE.PerspectiveCamera(70, W / H, 0.2, 90000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const ENV = envSunset();

  // --- sky (no tone mapping): dusk blue above, peach and rose at the horizon, the sun's glow in the west (right); clouds lit pink
  const skyU = { top: { value: lin('#2f437e') }, mid: { value: lin('#8a8cbc') }, hor: { value: lin('#f4b48e') }, sunDir: { value: SUN_DIR.clone() }, sunCol: { value: lin('#ffb46e') }, dark: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sunDir, sunCol; uniform float dark; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.1, 1.0);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.22, pow(max(h, 0.0), 0.8))); c = mix(c, top, smoothstep(0.15, 0.8, h));
        float s = max(dot(d, sunDir), 0.0); c += sunCol * (pow(s, 900.0) * 2.0 + pow(s, 30.0) * 0.45 + pow(s, 4.0) * 0.28) * (1.0 - smoothstep(0.0, 0.45, h));
        c += vec3(0.12, 0.05, 0.06) * exp(-abs(d.y) * 10.0);
        c *= 1.0 - dark;
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  const cloudTex = texCloud(), puffTex = texPuff('puffNY'), mistTex = texPuff('mistNY', 34, 0.3);
  const clouds = []; { const R = RNG('cloudsNY'); for (let i = 0; i < 22; i++) { const lo = i < 8;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.8 }));
    s.userData = { x: R.r(-30000, 30000), z: R.r(-60000, -24000), y: lo ? R.r(900, 2500) : R.r(3000, 9000), w: lo ? R.r(6000, 12000) : R.r(5000, 11000), a: lo ? 0.16 : R.r(0.25, 0.4), o: lo ? 0.55 : R.r(0.6, 0.85), ph: R.r(0, 9) };
    s.renderOrder = -2; scene.add(s); clouds.push(s); } }

  // --- lights: the low sun from the west (long shadows to the left), a dusk dome
  const hemi = new THREE.HemisphereLight(0xa8b0e0, 0x6a5a50, 1.05); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb878, 2.4); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  Object.assign(sun.shadow.camera, { left: -2200, right: 2200, top: 2200, bottom: -2200, near: 10, far: 9000 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 1.0;
  sun.target.position.set(0, 0, -2400); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 4000); sun.target.updateMatrixWorld();

  // --- the harbour floor: mud and sand with weed, shelving to a channel; exposed when the sea drains
  const bedTex = wrap(texBedDetail(), 1, 1); bedTex.anisotropy = ANI;
  { const N = 260, g = new THREE.PlaneGeometry(2, 2, N, N); g.rotateX(-Math.PI / 2); const p = g.attributes.position, uv = g.attributes.uv, cols = [];
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i), x = Math.sign(u) * 12000 * Math.pow(Math.abs(u), 1.6), z = 4000 - (v + 1) / 2 * 30000; p.setXYZ(i, x, bedH(x, z), z); uv.setXY(i, x / 30, z / 30);
      const nA = 0.5 + 0.5 * Math.sin(x * 0.004 + z * 0.003) * Math.sin(z * 0.005 - x * 0.002); const c = C3('#6a5a44', '#4a3e30', nA).lerp(lin('#3e4a2e'), ss(0.7, 0.95, nA) * 0.6); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const bed = new THREE.Mesh(g, STD({ vertexColors: true, map: bedTex, roughness: 0.7, envMap: ENV, envMapIntensity: 0.15 })); bed.receiveShadow = true; scene.add(bed); }

  // --- the water: sunset sky reflection, the sun's glitter path, ripples; clear in the shallows; its level drains with the story
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uLevel: { value: 0 }, uSun: { value: SUN_DIR.clone() }, uSunCol: { value: lin('#ffc890') },
    uTop: { value: lin('#3a4c86') }, uHor: { value: lin('#f0b494') }, uBody: { value: lin('#2a4258') }, uDeep: { value: lin('#1a2c40') }, uDark: { value: 0 }, uChurn: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true, transparent: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uLevel, uDark, uChurn; uniform vec3 uSun, uSunCol, uTop, uHor, uBody, uDeep; varying vec3 vW; ${BED_GLSL}
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT, dep = uLevel - bedH(p), dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(800.0, 5000.0, dist);
        vec3 n = normalize(vec3(0.05 * sin(p.x * 0.05 + t * 0.7) + 0.04 * sin(p.x * 0.17 - p.y * 0.11 + t * 1.1) + fine * 0.03 * sin(p.x * 0.6 + p.y * 0.4 + t * 1.9), 1.0,
                                0.05 * sin(p.y * 0.06 - t * 0.6) + 0.04 * sin(p.y * 0.2 + p.x * 0.09 - t) + fine * 0.03 * sin(p.y * 0.7 - p.x * 0.3 + t * 2.2)));
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(6000.0, 26000.0, dist)));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.45));
        vec3 body = mix(uBody, uDeep, smoothstep(2.0, 10.0, dep));
        vec3 col = mix(body, skyR, clamp(fres * 0.9, 0.0, 0.85));
        float sd = max(dot(Rf, uSun), 0.0); col += uSunCol * (pow(sd, 300.0) * 4.0 + pow(sd, 25.0) * 0.35);
        float foam = uChurn * smoothstep(0.6, 1.0, sin(p.x * 0.05 + t * 2.0) * sin(p.y * 0.04 - t * 1.7));
        col = mix(col, vec3(0.86, 0.88, 0.86), foam * 0.6); col *= 1.0 - uDark;
        float al = mix(0.4, 1.0, smoothstep(0.0, 2.5, dep)); al *= smoothstep(-0.02, 0.1, dep); if (al < 0.01) discard;
        gl_FragColor = vec4(col, al);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const seaMesh = new THREE.Mesh(new THREE.PlaneGeometry(90000, 70000).rotateX(-Math.PI / 2).translate(0, 0, -20000), seaMat); seaMesh.renderOrder = 1; scene.add(seaMesh);

  // --- land: the coastlines extruded (streets on top, sea walls down the side)
  const landTop = STD({ color: 0x5a5856, roughness: 0.95 }), wallM = STD({ color: 0x7a7266, roughness: 0.95 });
  const extrude = (P, top = LAND_Y) => { const sh = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, z))); const g = new THREE.ExtrudeGeometry(sh, { depth: top + 30, bevelEnabled: false, curveSegments: 24 });
    g.rotateX(Math.PI / 2); g.translate(0, top, 0); const m = new THREE.Mesh(g, [landTop, wallM]); m.receiveShadow = true; scene.add(m); return m; };
  [MANHATTAN, NEWJERSEY, BROOKLYN, STATEN].forEach((P) => extrude(P));
  const parkM = STD({ color: 0x4a6232, roughness: 1 });
  ISLES.forEach(([x, z, rr], i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr * 1.05, 34, 40), [parkM, parkM, wallM][0]); m.position.set(x, LAND_Y - 17, z); m.receiveShadow = true; scene.add(m); });
  // Battery Park: a green fringe at the tip of Manhattan
  { const m = new THREE.Mesh(new THREE.CylinderGeometry(330, 330, 0.6, 40, 1, false, Math.PI * 0.55, Math.PI * 0.9), parkM); m.position.set(-250, LAND_Y + 0.1, -3700); scene.add(m); }

  // --- buildings: one instanced box per building; brick facades (world-sized UVs from the instance scale), tar roofs on top,
  //     windows that switch on through the dusk (uOn); glass towers downtown and in Jersey City
  const BR = texBrick(); [BR.alb, BR.lit].forEach((t) => { wrap(t); t.anisotropy = ANI; }); const tarTex = wrap(texRoof());
  const WINU = { uOn: { value: 0.3 }, uRoof: { value: tarTex } };
  const bldMat = STD({ color: 0xffffff, roughness: 0.88, emissive: 0xffffff }); bldMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uFacM: { value: BR.alb }, uFacE: { value: BR.lit }, uOn: WINU.uOn, uRoof: WINU.uRoof });
    sh.vertexShader = 'varying vec2 vFac; varying float vTop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + 0.5) * sc; vTop = step(0.5, normal.y); vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : (vTop > 0.5 ? lp.xz : vec2(lp.x, lp.y)); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacE, uRoof; uniform float uOn; varying vec2 vFac; varying float vTop;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= vTop > 0.5 ? texture2D(uRoof, vFac * 3.0).rgb * 0.9 : texture2D(uFacM, vFac).rgb;')
      .replace('#include <emissivemap_fragment>', `{ vec4 e = texture2D(uFacE, vFac); float th = (e.a - 0.25) / 0.74; float on = step(th, uOn) * step(0.05, e.a) * (1.0 - vTop);
        totalEmissiveRadiance = e.rgb * on * 2.4; }`);
  };
  const BL = []; { const R = RNG('manhattan'), AV = []; for (let k = 0; k < 9; k++) AV.push(-1450 + k * 280);
    // Manhattan: avenues (north-south) every 280 m, streets every 80 m; 2 rows x 3-5 lots per block
    for (let z = 700; z > -3950; z -= 80) for (let k = 0; k < AV.length - 1; k++) { const x0 = AV[k] + 14, x1 = AV[k + 1] - 14, n = 3 + Math.floor(R.f() * 3);
      for (let row = 0; row < 2; row++) for (let j = 0; j < n; j++) { const lw = (x1 - x0) / n, x = x0 + lw * (j + 0.5), zz = z - 9 - 15.5 - row * 31;
        if (!inPoly(MANHATTAN, x, zz) || !inPoly(MANHATTAN, x + lw / 2, zz) || !inPoly(MANHATTAN, x - lw / 2, zz)) continue;
        if (Math.abs(x - CAMX) < 40 && Math.abs(zz - CAMZ) < 40) continue;   // our own building
        const down = ss(-2300, -2900, zz), d = Math.hypot(x - CAMX, zz - CAMZ), tall = R.f();
        let h = R.r(14, 42) + (tall < 0.15 ? R.r(30, 70) : 0); if (d < 1100) h = Math.min(h, (ROOF - 22) * (0.55 + 0.45 * ss(150, 900, d)));
        if (down > 0.5 && tall < 0.35) continue;   // downtown lots are mostly taken by the towers
        BL.push({ x, z: zz, sx: lw - R.r(1, 5), sz: 29 - R.r(0, 4), h: h * (1 - 0.3 * down), c: R.pick(['#c4785c', '#b06a50', '#d8b898', '#a85a44', '#c8a080', '#8a5a48', '#e0d0b8', '#b88a6a', '#9a6a5a']), tank: h < 70 && R.f() < 0.35 && d < 2600 }); } }
    // Jersey City and Brooklyn: low and mid-rise blocks along their waterfronts
    for (let i = 0; i < 5000 && BL.length < 3600; i++) { const nj = R.f() < 0.5, x = nj ? R.r(2400, 6500) : R.r(-6500, -2350), z = R.r(-9000, 1500); if (!isLand(x, z)) continue;
      const near = nj ? 1 - ss(2400, 5000, x) : 1 - ss(2350, 5000, -x); BL.push({ x, z, sx: R.r(20, 50), sz: R.r(20, 40), h: R.r(8, 30) + near * R.r(0, 40), c: R.pick(['#b8a088', '#a88068', '#c8b8a0', '#8a7060', '#d0c0a8']), tank: false }); }
    for (let i = 0; i < 4000 && BL.length < 4400; i++) { const x = R.r(-200, 9000), z = R.r(-24000, -13300); if (!inPoly(STATEN, x, z)) continue; BL.push({ x, z, sx: R.r(10, 24), sz: R.r(10, 20), h: R.r(6, 12), c: R.pick(['#c8b8a0', '#e0d8c8', '#a89888']), tank: false }); } }
  const bld = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), bldMat, BL.length); bld.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  BL.forEach((b, i) => { b.y0 = LAND_Y - 0.3; bld.setMatrixAt(i, M4c(b.x, b.y0, b.z, 0, b.sx, b.h, b.sz)); bld.setColorAt(i, lin(b.c)); }); scene.add(bld);
  // water tanks on the roofs (staves, a conical cap, steel legs), AC units and stair bulkheads
  const stavesTex = texStaves();
  const tankG = (() => { const parts = [new THREE.CylinderGeometry(1, 1, 1.4, 16).translate(0, 1.7, 0), new THREE.ConeGeometry(1.08, 0.7, 16).translate(0, 2.75, 0)]; for (const [a, b] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) parts.push(new THREE.BoxGeometry(0.08, 1, 0.08).translate(a, 0.5, b));
    const P = [], N = [], U = []; parts.forEach((g) => { const g2 = g.index ? g.toNonIndexed() : g; P.push(...g2.attributes.position.array); N.push(...g2.attributes.normal.array); U.push(...g2.attributes.uv.array); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); return g; })();
  const TK = BL.map((b, i) => [b, i]).filter(([b]) => b.tank), tanks = IM(tankG, STD({ map: stavesTex, roughness: 0.85 }), TK.length); tanks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  TK.forEach(([b], j) => { const s = 3 + hsh(j) * 1.5; b.tk = [b.x + (hsh(j, 2) - 0.5) * b.sx * 0.5, b.z + (hsh(j, 3) - 0.5) * b.sz * 0.4, s]; tanks.setMatrixAt(j, M4c(b.tk[0], b.y0 + b.h, b.tk[1], 0, s, s, s)); }); scene.add(tanks);
  const acN = Math.min(BL.length, 2600), ac = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), STD({ color: 0xb8b8b4, roughness: 0.6, metalness: 0.3 }), acN); ac.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  for (let i = 0; i < acN; i++) { const b = BL[i]; ac.setMatrixAt(i, M4c(b.x + (hsh(i, 5) - 0.5) * b.sx * 0.6, b.y0 + b.h, b.z + (hsh(i, 6) - 0.5) * b.sz * 0.6, 0, 2 + hsh(i, 7) * 3, 1.5 + hsh(i, 8) * 2.5, 2 + hsh(i, 9) * 3)); } scene.add(ac);

  // --- the towers: glass and stone shafts with setbacks, crowns, green copper pyramids; One World Trade Center; Jersey City
  const winMats = [0, 1, 2, 3].map((k) => { const t = wrap(texWindows(k)); t.anisotropy = ANI; const e = wrap(texTowerLit(k));
    return STD({ map: t, roughness: [0.4, 0.85, 0.8, 0.35][k], metalness: [0.45, 0, 0, 0.55][k], envMap: ENV, envMapIntensity: [0.7, 0.15, 0.15, 0.8][k], emissive: 0xffffff, emissiveMap: e, emissiveIntensity: 0 }); });
  const towerBox = (w, h, d, kind) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, nm = g.attributes.normal;
    for (let i = 0; i < uv.count; i++) { const side = Math.abs(nm.getX(i)) > 0.5 ? d : w; uv.setXY(i, uv.getX(i) * side / 26, uv.getY(i) * h / 112); }
    const m = new THREE.Mesh(g, winMats[kind]); m.castShadow = true; m.receiveShadow = true; return m; };
  const copper = STD({ color: 0x5e9a84, roughness: 0.6, metalness: 0.2 }), stoneM = STD({ color: 0xc8bca8, roughness: 0.85 }), steel = STD({ color: 0x9aa4ac, roughness: 0.4, metalness: 0.6, envMap: ENV });
  const towers = [];
  const addTower = (x, z, w, d, h, kind, crown, ry = 0) => { const grp = new THREE.Group(); grp.position.set(x, LAND_Y, z); grp.rotation.y = ry; scene.add(grp);
    const b = towerBox(w, h, d, kind); b.position.y = h / 2; grp.add(b); let top = h;
    if (crown === 'setback') { const h2 = h * 0.18, b2 = towerBox(w * 0.72, h2, d * 0.72, kind); b2.position.y = h + h2 / 2; grp.add(b2); top += h2; const h3 = h * 0.08, b3 = towerBox(w * 0.48, h3, d * 0.48, kind); b3.position.y = top + h3 / 2; grp.add(b3); top += h3; }
    if (crown === 'copper') { const p = new THREE.Mesh(new THREE.ConeGeometry(Math.min(w, d) * 0.62, h * 0.16, 4).rotateY(Math.PI / 4), copper); p.position.y = h + h * 0.08; p.castShadow = true; grp.add(p); top += h * 0.16;
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.4, h * 0.1, 6), copper); sp.position.y = top + h * 0.05; grp.add(sp); top += h * 0.1; }
    if (crown === 'spire') { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2, h * 0.15, 6), steel); sp.position.y = h + h * 0.075; grp.add(sp); top += h * 0.15; }
    towers.push({ grp, x, z, front: z + d / 2, h: top, w }); return grp; };
  { const R = RNG('downtown');
    // One World Trade Center: a square podium, a tapering shaft of eight triangles (the base square turning 45° into the top), a parapet, the spire
    const owtc = new THREE.Group(); owtc.position.set(330, LAND_Y, -3000); owtc.rotation.y = 0.18; scene.add(owtc);
    { const pod = towerBox(61, 57, 61, 3); pod.position.y = 28.5; owtc.add(pod);
      const r0 = 43, r1 = 31, y0 = 57, y1 = 417, B = [], T = []; for (let i = 0; i < 4; i++) { B.push([Math.cos(Math.PI / 4 + i * Math.PI / 2) * r0, y0, Math.sin(Math.PI / 4 + i * Math.PI / 2) * r0]); T.push([Math.cos(i * Math.PI / 2) * r1, y1, Math.sin(i * Math.PI / 2) * r1]); }
      const P = [], U = [], tri = (a, b, c, ua, ub, uc) => { P.push(...a, ...b, ...c); U.push(...ua, ...ub, ...uc); };
      for (let i = 0; i < 4; i++) { const b0 = B[i], b1 = B[(i + 1) % 4], t0 = T[i], t1 = T[(i + 1) % 4], wu = 61 / 26, hv = (y1 - y0) / 112;
        tri(b0, t1, b1, [0, 0], [wu / 2, hv], [wu, 0]); tri(t0, t1, b0, [0, hv], [wu, hv], [wu / 2, 0]); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals();
      const shaft = new THREE.Mesh(g, winMats[0]); shaft.castShadow = true; owtc.add(shaft);
      const par = new THREE.Mesh(new THREE.BoxGeometry(44, 8, 44).rotateY(Math.PI / 4), steel); par.position.y = 421; owtc.add(par);
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 3.5, 124, 8), steel); spire.position.y = 425 + 62; owtc.add(spire);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); beacon.position.y = 549; owtc.add(beacon); owtc.userData.beacon = beacon; }
    towers.push({ grp: owtc, x: 330, z: -3000, front: -2970, h: 541, w: 61, hero: true });
    // the rest of the financial district
    const spots = []; for (let i = 0; i < 70; i++) { const x = R.r(-1300, 700), z = R.r(-3800, -2300); if (!inPoly(MANHATTAN, x, z) || Math.hypot(x - 330, z + 3000) < 90) continue; if (spots.some(([a, b]) => Math.hypot(a - x, b - z) < 70)) continue; spots.push([x, z]); }
    spots.forEach(([x, z], i) => { const kind = R.pick([0, 0, 1, 2, 3, 2]), h = R.r(90, 300) * (i % 9 === 0 ? 1.15 : 1), w = R.r(30, 55), d = R.r(30, 50), crown = R.f() < 0.18 ? 'copper' : R.f() < 0.4 ? 'setback' : R.f() < 0.55 ? 'spire' : 'flat';
      addTower(x, z, w, d, h, kind, crown, R.r(-0.2, 0.2)); });
    // a few landmarks of the skyline: a neo-gothic stone tower with a copper pyramid, a slim spire, a tall dark slab
    addTower(-420, -2500, 45, 40, 230, 2, 'copper'); addTower(-180, -3300, 40, 40, 260, 2, 'copper'); addTower(-520, -3150, 38, 38, 250, 1, 'spire'); addTower(80, -2650, 50, 45, 320, 3, 'setback');
    // Jersey City across the Hudson, Downtown Brooklyn across the East River
    for (let i = 0; i < 26; i++) { const nj = i < 16, x = nj ? R.r(2500, 3300) : R.r(-3300, -2600), z = nj ? R.r(-3600, -500) : R.r(-3600, -1800); if (!isLand(x, z)) continue; addTower(x, z, R.r(30, 50), R.r(30, 45), R.r(80, 230), R.pick([0, 3, 1]), R.f() < 0.3 ? 'setback' : 'flat'); } }

  // --- the Brooklyn Bridge (two gothic stone towers, cables) and the Verrazzano (steel towers, a long deck, catenary cables)
  const bridgeCable = (A, B, sag, mat, r = 0.6) => { const pts = []; for (let k = 0; k <= 30; k++) { const u = k / 30; pts.push(new THREE.Vector3(lerp(A[0], B[0], u), lerp(A[1], B[1], u) - sag * 4 * u * (1 - u), lerp(A[2], B[2], u))); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, r, 5, false), mat); scene.add(m); return m; };
  { const z = -2900, xs = [-1700, -2150], gr = new THREE.Group(); scene.add(gr);
    xs.forEach((x) => { const t = new THREE.Mesh(new THREE.BoxGeometry(14, 84, 40), stoneM); t.position.set(x, 42, z); t.castShadow = true; gr.add(t);
      for (const dz of [-8, 8]) { const a = new THREE.Mesh(new THREE.BoxGeometry(15, 22, 8), STD({ color: 0x2a2620 })); a.position.set(x, 58, z + dz); gr.add(a); } });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1200, 4, 26), steel); deck.position.set(-1925, 40, z); gr.add(deck);
    for (const dz of [-12, 12]) { bridgeCable([-1700, 84, z + dz], [-2150, 84, z + dz], 34, steel, 0.6); bridgeCable([-1500, 42, z + dz], [-1700, 84, z + dz], -4, steel, 0.5); bridgeCable([-2150, 84, z + dz], [-2350, 42, z + dz], -4, steel, 0.5); } }
  const verraz = new THREE.Group(); scene.add(verraz);
  { const z = -13700, xs = [1400, 2700], vm = STD({ color: 0x8a9aa4, roughness: 0.5, metalness: 0.4 });
    xs.forEach((x) => { for (const dz of [-14, 14]) { const c = new THREE.Mesh(new THREE.BoxGeometry(8, 211, 8), vm); c.position.set(x, 105.5, z + dz); verraz.add(c); }
      for (const y of [60, 140, 205]) { const b = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 36), vm); b.position.set(x, y, z); verraz.add(b); } });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2400, 9, 32), vm); deck.position.set(2050, 69, z); verraz.add(deck);
    for (const dz of [-14, 14]) { const pts = []; for (let k = 0; k <= 40; k++) { const u = k / 40, x = lerp(850, 3250, u), xr = (x - 2050) / 650; const y = Math.abs(xr) <= 1 ? 211 - 120 * (1 - xr * xr) : 211 - (Math.abs(xr) - 1) * 650 * 0.21; pts.push(new THREE.Vector3(x, Math.max(72, y), z + dz)); }
      verraz.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 1.2, 5, false), vm)); } }
  // the bridge lights (a string of lamps along each deck)
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,200,0.8)'], [0.5, 'rgba(255,190,120,0.2)'], [1, 'rgba(255,170,90,0)']], 64);
  const lampP = []; for (let k = 0; k < 60; k++) { lampP.push(850 + k * 44, 76, -13700 - 14, 850 + k * 44, 76, -13700 + 14); } for (let k = 0; k < 24; k++) lampP.push(-1500 - k * 36, 44, -2900);
  const bridgeLamps = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lampP, 3)), new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, map: glowTex, color: 0xffe0b0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  bridgeLamps.renderOrder = 6; scene.add(bridgeLamps);

  // --- the Statue of Liberty on its island: the star fort, the granite pedestal, the copper robe, the raised arm and the gold torch (93 m)
  const statue = new THREE.Group(); statue.position.set(1650, LAND_Y, -7000); statue.rotation.y = -0.6; statue.scale.setScalar(1.7); scene.add(statue);   // drawn 1.7x so it reads at 7 km
  { const gran = STD({ color: 0xbfb4a0, roughness: 0.85 }), cu = STD({ color: 0x6aa892, roughness: 0.55, metalness: 0.15 }), gold = STD({ color: 0xffc860, emissive: 0xffa040, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.8 });
    const add = (g, m, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; statue.add(o); return o; };
    add(new THREE.CylinderGeometry(70, 75, 8, 11), gran, 0, 4, 0); add(new THREE.BoxGeometry(28, 27, 28), gran, 0, 21.5, 0); add(new THREE.BoxGeometry(20, 20, 20), gran, 0, 45, 0); add(new THREE.BoxGeometry(23, 3, 23), gran, 0, 56, 0);
    add(new THREE.CylinderGeometry(3.6, 7.5, 22, 12), cu, 0, 68.5, 0); add(new THREE.CylinderGeometry(2.6, 3.6, 7, 12), cu, 0, 83, 0); add(new THREE.SphereGeometry(2.6, 14, 10), cu, 0, 88.5, 0.4);
    for (let k = 0; k < 7; k++) add(new THREE.ConeGeometry(0.4, 3.2, 5), cu, Math.sin(-1.2 + k * 0.4) * 2.8, 90.5, Math.cos(-1.2 + k * 0.4) * 2.8 + 0.4, Math.cos(-1.2 + k * 0.4) * 0.8, -Math.sin(-1.2 + k * 0.4) * 0.8);
    add(new THREE.CylinderGeometry(0.9, 1.3, 12.5, 8), cu, 3.2, 92, 0, 0, -0.12); add(new THREE.CylinderGeometry(1.4, 0.8, 2.5, 10), gold, 4.0, 99, 0);
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd070, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); flame.position.set(4.0, 101.5, 0); flame.scale.set(14, 14, 1); statue.add(flame);
    add(new THREE.BoxGeometry(3.4, 5, 1.3), cu, -3.5, 75, 2, 0.2, 0.25); }
  towers.push({ grp: statue, x: 1650, z: -7000, front: -6980, h: 158, w: 30, statue: true });

  // --- boats: ferries, tugs, a cruise ship, sailboats; they float, then settle on the mud when the harbour drains
  const hullMat = STD({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide, flatShading: true, envMap: ENV, envMapIntensity: 0.3 });
  function hullGeo(L, B, D, c) {
    const PR = [[1, 0.2, 0.8], [1, 0.4, 0.95], [1, 0.48, 0.98], [1, 0.75, 1], [1, 1, 1]];
    const across = [...PR.slice().reverse().map(([s, h, w]) => [-1, h, w]), [0, 0, 0], ...PR];
    const NS = 16, ring = [];
    for (let i = 0; i <= NS; i++) { const a = i / NS, x = (a - 0.5) * L;
      const bw = B / 2 * (a < 0.6 ? 0.86 + 0.14 * Math.sin(a / 0.6 * Math.PI / 2) : Math.pow(Math.max(0, Math.cos((a - 0.6) / 0.4 * Math.PI / 2)), 0.7));
      const sheer = D * (1 + 0.25 * a * a), keel = a > 0.72 ? (a - 0.72) / 0.28 * D * 0.6 : 0;
      ring.push(across.map(([s, hf, wf]) => [x, lerp(keel, sheer, hf), s * bw * wf])); }
    const pos = [], col = [], tri = (A, Bv, Cv, cc) => { pos.push(...A, ...Bv, ...Cv); for (let k = 0; k < 3; k++) col.push(cc.r, cc.g, cc.b); };
    const cBot = lin(c.bot), cStr = lin(c.stripe), cTop = lin(c.top), cDeck = lin(c.deck);
    for (let i = 0; i < NS; i++) for (let k = 0; k < across.length - 1; k++) { const h = Math.min(across[k][1], across[k + 1][1]), cc = h < 0.4 ? cBot : h < 0.48 ? cStr : cTop; tri(ring[i][k], ring[i + 1][k], ring[i + 1][k + 1], cc); tri(ring[i][k], ring[i + 1][k + 1], ring[i][k + 1], cc); }
    const last = across.length - 1, dk = (p) => [p[0], p[1] - 0.06, p[2]];
    for (let i = 0; i < NS; i++) { tri(dk(ring[i][0]), dk(ring[i + 1][0]), dk(ring[i + 1][last]), cDeck); tri(dk(ring[i][0]), dk(ring[i + 1][last]), dk(ring[i][last]), cDeck); }
    const r0 = ring[0], ctr = [r0[0][0], D * 0.5, 0]; for (let k = 0; k < last; k++) tri(ctr, r0[k], r0[k + 1], cTop);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g; }
  const white = STD({ color: 0xf2efe8, roughness: 0.6 }), dark = STD({ color: 0x23292e, roughness: 0.5, metalness: 0.3 }), orange = STD({ color: 0xf07a28, roughness: 0.6 }), red = STD({ color: 0xc8372d, roughness: 0.6 });
  const boats = [];
  const BOATS = [['ferry', 95, 200, -4400, 1.3, 0.2, 7], ['ferry', 95, 800, -9800, -1.6, 1.7, -8], ['tug', 30, -700, -4300, 0.6, 2.2, 3], ['tug', 28, 1700, -3300, -1.4, 0.9, -2], ['cruise', 290, 2000, -1200, 0.02, 0.4, 0],
    ['sail', 14, 900, -5200, 0.4, 3.1, 4], ['sail', 12, 400, -6200, -0.8, 1.2, 3], ['sail', 13, -300, -6900, 1.1, 4.1, -3], ['tug', 32, -1200, -8800, 2.6, 2.6, 2], ['ferry', 60, -1800, -2400, 1.57, 5.1, 0], ['sail', 11, 1300, -4400, 2.2, 0.6, 2], ['barge', 120, -600, -11000, 1.2, 1.1, 1.5]];
  BOATS.forEach(([kind, L, x, z, yaw, ph, v]) => { const grp = new THREE.Group(), B = L * (kind === 'sail' ? 0.32 : kind === 'cruise' ? 0.13 : kind === 'ferry' ? 0.28 : 0.34), D = L * (kind === 'cruise' ? 0.08 : kind === 'ferry' ? 0.07 : 0.16);
    const C = { ferry: { top: '#f07a28', stripe: '#f2efe8', bot: '#2b2f33', deck: '#8a8072' }, tug: { top: '#c8372d', stripe: '#1a1a1a', bot: '#1a1a1a', deck: '#5a5048' }, cruise: { top: '#f4f2ec', stripe: '#1f3a5f', bot: '#1f3a5f', deck: '#b89a72' },
      sail: { top: '#f4f2ec', stripe: '#2f6fb0', bot: '#7a2a24', deck: '#c4a67c' }, barge: { top: '#4a4440', stripe: '#c8372d', bot: '#2a2420', deck: '#5a4a3a' } }[kind];
    const hull = new THREE.Mesh(hullGeo(L, B, D, C), hullMat); hull.castShadow = true; grp.add(hull);
    const box = (w, h, d, m, px, py, pz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(px, py, pz); b.castShadow = true; grp.add(b); return b; };
    if (kind === 'ferry') { box(L * 0.8, D * 1.6, B * 0.9, orange, 0, D * 1.8, 0); box(L * 0.6, D * 1.2, B * 0.8, orange, 0, D * 3.2, 0); box(L * 0.15, D * 0.8, B * 0.6, white, 0, D * 4.2, 0); }
    if (kind === 'tug') { box(L * 0.3, D * 1.4, B * 0.6, white, -L * 0.05, D * 1.7, 0); box(L * 0.1, D * 1.6, B * 0.2, dark, -L * 0.15, D * 2.6, 0); }
    if (kind === 'cruise') { for (let k = 0; k < 5; k++) box(L * (0.82 - k * 0.08), D * 0.9, B * 0.92, white, -L * 0.04, D * (1.5 + k * 0.9), 0); box(L * 0.06, D * 1.5, B * 0.4, red, -L * 0.2, D * 6.5, 0); }
    if (kind === 'sail') { box(L * 0.3, D * 0.45, B * 0.55, white, -L * 0.05, D * 1.2, 0); box(0.15, L * 1.3, 0.15, white, L * 0.08, D + L * 0.65, 0); }
    if (kind === 'barge') for (let k = 0; k < 4; k++) box(L * 0.2, D * 0.6, B * 0.8, STD({ color: lin(['#6a5a3a', '#4a4440', '#7a5a3a', '#5a5048'][k]) }), -L * 0.35 + k * L * 0.23, D * 1.2, 0);
    grp.rotation.order = 'YXZ'; scene.add(grp); boats.push({ grp, kind, x, z, yaw, D, L, ph, v, roll: (ph * 7.3) % 2 < 1 ? 1 : -1 }); });

  // --- traffic on the avenues (headlights coming towards us, tail lights going away), street lights; a helicopter over the Hudson
  const CARS = []; { const R = RNG('cars'); for (let k = 0; k < 9; k++) { const x = -1450 + k * 280; for (let i = 0; i < 70; i++) CARS.push({ x: x + (i % 2 ? 4 : -4), z0: R.r(-3900, 700), v: (i % 2 ? 1 : -1) * R.r(6, 12), head: i % 2 === 1 }); } }
  const carGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(CARS.length * 3), 3)).setAttribute('color', new THREE.Float32BufferAttribute(CARS.flatMap((c) => c.head ? [1, 0.95, 0.85] : [1, 0.15, 0.1]), 3));
  const cars = new THREE.Points(carGeo, new THREE.PointsMaterial({ size: 2.6, sizeAttenuation: false, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); cars.frustumCulled = false; cars.renderOrder = 6; scene.add(cars);
  const slP = []; for (let k = 0; k < 9; k++) for (let z = 650; z > -3900; z -= 40) { const x = -1450 + k * 280 + 9; if (inPoly(MANHATTAN, x, z)) slP.push(x, LAND_Y + 8, z); }
  const streetLights = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(slP, 3)), new THREE.PointsMaterial({ size: 2.0, sizeAttenuation: false, map: glowTex, color: 0xffcf8a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  streetLights.renderOrder = 6; scene.add(streetLights);
  const heli = new THREE.Group(); { const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8).scale(1.6, 1, 1), STD({ color: 0x2a3a5a, roughness: 0.4 })); heli.add(body);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 0.4), STD({ color: 0x2a3a5a })); tail.position.x = -4.5; heli.add(tail);
    const rotor = new THREE.Mesh(new THREE.CircleGeometry(5, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.25, side: THREE.DoubleSide })); rotor.position.y = 1.3; heli.add(rotor);
    const blink = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff3020, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); blink.scale.set(8, 8, 1); blink.position.y = -1; heli.add(blink); heli.userData.blink = blink; }
  scene.add(heli);

  // --- our roof: tar and gravel, a brick parapet with a stone coping in front, a wooden water tank on its steel stand (left),
  //     string lights, potted plants, an AC unit, a bench and two people at the parapet
  const roofG = new THREE.Group(); roofG.position.set(CAMX, 0, CAMZ); scene.add(roofG);
  const radd = (g, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; roofG.add(o); return o; };
  radd(new THREE.BoxGeometry(60, 1, 50), STD({ map: wrap(texRoof(), 4, 3), roughness: 1 }), 0, ROOF - 0.5, 8);
  radd(new THREE.BoxGeometry(60, ROOF - LAND_Y, 50), STD({ color: 0x8a4a36, roughness: 0.9 }), 0, (ROOF + LAND_Y) / 2 - 0.6, 8);
  const parM = STD({ map: wrap(texParapet(), 6, 1), roughness: 0.9 });
  radd(new THREE.BoxGeometry(60, 0.7, 0.45), parM, 0, ROOF + 0.35, -16.5); radd(new THREE.BoxGeometry(0.45, 1.15, 50), parM, -29.8, ROOF + 0.575, 8); radd(new THREE.BoxGeometry(0.45, 1.15, 50), parM, 29.8, ROOF + 0.575, 8);
  { const tk = new THREE.Group(); tk.position.set(-11, ROOF, -9); roofG.add(tk); const legM = STD({ color: 0x3a3634, roughness: 0.6, metalness: 0.5 });
    for (const [a, b] of [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.25, 6, 0.25), legM); l.position.set(a, 3, b); l.castShadow = true; tk.add(l); }
    for (const y of [2, 4.5]) { const br = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 0.15), legM); br.position.set(0, y, -2.4); tk.add(br); const br2 = br.clone(); br2.position.z = 2.4; tk.add(br2); }
    const plat = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.3, 6.4), legM); plat.position.y = 6.1; tk.add(plat);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 6.5, 32), STD({ map: stavesTex, roughness: 0.85 })); barrel.position.y = 9.5; barrel.castShadow = true; tk.add(barrel);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.4, 32), STD({ color: 0x4a3a2c, roughness: 0.9 })); cap.position.y = 13.95; cap.castShadow = true; tk.add(cap);
    const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.6, 9, 0.1), legM); ladder.position.set(2.6, 7.5, 2.9); ladder.rotation.x = 0.1; tk.add(ladder); }
  { const pots = [[-6, -15.6], [-3.5, -15.6], [4, -15.6], [7, -15.7], [12, -15.4]], potM = STD({ color: 0xa85a3a, roughness: 0.9 }), leafM = STD({ color: 0x3e6a2a, roughness: 0.8, flatShading: true });
    pots.forEach(([x, z], i) => { radd(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 10), potM, x, ROOF + 1.0, z); for (let k = 0; k < 5; k++) radd(new THREE.IcosahedronGeometry(0.28 + 0.1 * hsh(i * 7 + k), 0), leafM, x + (hsh(i, k) - 0.5) * 0.5, ROOF + 1.45 + 0.3 * hsh(k, i), z + (hsh(k + 3, i) - 0.5) * 0.4); });
    radd(new THREE.BoxGeometry(3, 1.8, 2), STD({ color: 0xc8c8c4, roughness: 0.5, metalness: 0.4 }), 10, ROOF + 0.9, -11);
    radd(new THREE.BoxGeometry(2.4, 0.12, 0.6), STD({ color: 0x8a6a48 }), 4.5, ROOF + 0.55, -12); }
  // the neighbour in front-left: a taller brick loft whose roof carries a big wooden water tank on a steel stand (foreground framing)
  { const NBH = ROOF - 48; const nb = new THREE.Group(); nb.position.set(-22, 0, -70); roofG.add(nb);
    const body = new THREE.Mesh(new THREE.BoxGeometry(40, NBH, 36).translate(0, NBH / 2, 0), STD({ color: 0x9a5a44, roughness: 0.9 })); body.receiveShadow = true; body.castShadow = true; nb.add(body);
    const fac = new THREE.Mesh(new THREE.PlaneGeometry(40, NBH), STD({ map: (() => { const t = BR.alb.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40 / 24, NBH / 24); return t; })(), color: 0xc47a5c, roughness: 0.9,
      emissive: 0xffffff, emissiveMap: (() => { const t = BR.lit.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40 / 24, NBH / 24); return t; })(), emissiveIntensity: 1.2 }));
    fac.position.set(0, NBH / 2, 18.05); nb.add(fac); g3NB = fac;
    const cop = new THREE.Mesh(new THREE.BoxGeometry(41, 1.2, 37), STD({ color: 0xc8c0b0 })); cop.position.y = NBH + 0.6; nb.add(cop);
    const tk = new THREE.Group(); tk.position.set(6, NBH, 4); nb.add(tk); const legM = STD({ color: 0x3a3634, roughness: 0.6, metalness: 0.5 });
    for (const [a2, b2] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7, 0.35), legM); l.position.set(a2, 3.5, b2); l.castShadow = true; tk.add(l); }
    const plat = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 8), legM); plat.position.y = 7.1; tk.add(plat);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 8, 32), STD({ map: stavesTex, roughness: 0.85 })); barrel.position.y = 11.2; barrel.castShadow = true; tk.add(barrel);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(4.3, 3, 32), STD({ color: 0x4a3a2c, roughness: 0.9 })); cap.position.y = 16.7; cap.castShadow = true; tk.add(cap);
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 6), STD({ color: 0x8a5a48 })); bulk.position.set(-10, NBH + 2, -6); nb.add(bulk); }
  const bulbs = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, -1e5, 0], 3)), new THREE.PointsMaterial({ size: 0.3, color: 0xffd090, transparent: true }));
  // people on our roof and on the neighbours' roofs (smooth capsules): they watch, then point, then run
  const FOLK = []; { const R = RNG('roofFolk'); BL.forEach((b, i) => { if (FOLK.length < 46 && Math.abs(b.x - CAMX) < 500 && b.z < CAMZ - 60 && b.z > CAMZ - 900 && b.h > 30 && R.f() < 0.12) FOLK.push([b.x + R.n(4), b.z + R.n(4), 1, b.y0 + b.h]); }); }
  const folkB = IM(new THREE.CapsuleGeometry(0.25, 1.0, 4, 8).translate(0, 0.8, 0), STD({ roughness: 0.8 }), FOLK.length, false), folkH = IM(new THREE.SphereGeometry(0.19, 10, 8).translate(0, 1.72, 0), STD({ roughness: 0.8 }), FOLK.length, false);
  FOLK.forEach((f, i) => { folkB.setColorAt(i, lin(['#2a2a30', '#8a3a2a', '#3a4a6a', '#c8b48a', '#5a6a4a'][i % 5])); folkH.setColorAt(i, lin(['#3a2a20', '#d8b090', '#1a1a1a', '#c08060'][i % 4])); });
  folkB.instanceMatrix.setUsage(THREE.DynamicDrawUsage); folkH.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(folkB, folkH);

  // --- THE WAVE: a swept wall (front toe skirt, concave face, overhanging lip, rounded crest, back slope), rebuilt each frame
  const WNX = 110, WNS = 46, WPROF = [[0.34, -0.02], [0.14, 0.03], [0.035, 0.12], [0.0, 0.3], [0.008, 0.5], [0.035, 0.7], [0.08, 0.86], [0.122, 0.955], [0.135, 1.005], [0.11, 1.04], [0.05, 1.055], [-0.04, 1.035], [-0.3, 0.9], [-1.0, 0.52], [-2.3, 0.15]];
  const wProf = [], wArc = [0];
  for (let j = 0; j < WNS; j++) { const u = j / (WNS - 1) * (WPROF.length - 1), i = Math.min(WPROF.length - 2, Math.floor(u)), f = u - i, P = (k) => WPROF[Math.max(0, Math.min(WPROF.length - 1, k))];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    wProf.push([cr(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0]), cr(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1])]);
    if (j) wArc.push(wArc[j - 1] + Math.hypot(wProf[j][0] - wProf[j - 1][0], wProf[j][1] - wProf[j - 1][1])); }
  const wX = []; for (let i = 0; i < WNX; i++) { const u = i / (WNX - 1) * 2 - 1; wX.push(Math.sign(u) * 14000 * Math.pow(Math.abs(u), 1.7)); }
  const wGeo = new THREE.BufferGeometry(), wPos = new Float32Array(WNX * WNS * 3), wUv = new Float32Array(WNX * WNS * 2), wYn = new Float32Array(WNX * WNS), wIdx = [];
  for (let i = 0; i < WNX; i++) for (let j = 0; j < WNS; j++) wYn[i * WNS + j] = wProf[j][1];
  for (let i = 0; i < WNX - 1; i++) for (let j = 0; j < WNS - 1; j++) { const a = i * WNS + j, b = a + WNS; wIdx.push(a, b, a + 1, b, b + 1, a + 1); }
  wGeo.setIndex(wIdx); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3)); wGeo.setAttribute('uv', new THREE.BufferAttribute(wUv, 2)); wGeo.setAttribute('aYn', new THREE.BufferAttribute(wYn, 1));
  const streakTex = wrap(texFoamStreaks()), foamTex = wrap(texFoam()); streakTex.anisotropy = ANI;
  const waveU = { uStreak: { value: streakTex }, uFoamT: { value: foamTex }, uT: { value: 0 }, uTop: { value: lin('#3a7a7a') }, uMid: { value: lin('#16404c') }, uBot: { value: lin('#0a222c') }, uSky: { value: lin('#d8a89a') },
    uFogC: { value: lin('#c7a8a4') }, uFogNear: { value: 1500 }, uFogFar: { value: 30000 }, uFogK: { value: 0.6 }, uLight: { value: 1 }, uSunUp: { value: 1 }, uSunCol: { value: lin('#ffb878') } };
  const waveMat = new THREE.ShaderMaterial({ uniforms: waveU, side: THREE.DoubleSide,
    vertexShader: `attribute float aYn; varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vYn = aYn; vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D uStreak, uFoamT; uniform float uT, uFogNear, uFogFar, uFogK, uLight, uSunUp; uniform vec3 uTop, uMid, uBot, uSky, uFogC, uSunCol;
      varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ float yn = vYn;
        vec3 col = mix(uBot, uMid, smoothstep(0.04, 0.5, yn)); col = mix(col, uTop, smoothstep(0.6, 0.98, yn));
        col *= 0.9 + 0.1 * sin(vUv.y * 7.0 + vUv.x * 0.6 + sin(vUv.x * 2.1) * 1.5);
        vec3 V = normalize(vW - cameraPosition), n = normalize(vN); if (dot(n, V) > 0.0) n = -n;
        float fres = pow(1.0 - max(dot(-V, n), 0.0), 4.0); col = mix(col, uSky * 0.8, fres * 0.45);
        col += uSunCol * 0.18 * smoothstep(0.7, 1.0, yn) * max(0.0, n.x);   // the sunset catching the western side of the crest
        float cv = texture2D(uFoamT, vec2(vUv.x * 0.37, 0.13)).r, cv2 = texture2D(uFoamT, vec2(vUv.x * 0.21 + 0.5, 0.61)).r;
        vec2 u1 = vec2(vUv.x * 0.7, vUv.y * 0.4 + uT * 0.15);
        float s1 = texture2D(uStreak, u1).r, s2 = texture2D(uStreak, vec2(vUv.x * 1.3 + 0.37, vUv.y * 0.55 + uT * 0.27)).r, s3 = texture2D(uStreak, vec2(vUv.x * 0.45 + 0.71, vUv.y * 0.3 + uT * 0.1)).r;
        float mist = texture2D(uStreak, u1, 3.5).r + texture2D(uStreak, vec2(vUv.x * 0.45 + 0.71, vUv.y * 0.3 + uT * 0.1), 4.0).r;
        float haze = clamp(mist * 1.4, 0.0, 1.0) * smoothstep(0.8, 0.2, yn) * smoothstep(0.06, 0.28, yn);
        col = mix(col, vec3(0.62, 0.72, 0.76), haze * 0.45);
        float streak = clamp(s1 * (0.35 + 1.1 * cv) + s2 * 0.75 * (1.3 - cv) * cv2 + s3 * 0.55, 0.0, 1.0) * smoothstep(0.25, 0.95, yn) * smoothstep(0.1, 0.3, yn);
        float fN = texture2D(uFoamT, vUv * 2.3 + vec2(0.0, uT * 0.05)).r, fN2 = texture2D(uFoamT, vUv * 5.1 + vec2(uT * 0.03, uT * 0.11)).r;
        float crest = smoothstep(0.935, 0.995, yn) * (0.55 + 0.7 * fN) + smoothstep(0.985, 1.04, yn);
        float toe = (1.0 - smoothstep(0.02, 0.16, yn)) * (0.55 + 0.8 * fN2);
        float dd = length(vW - cameraPosition), farK = smoothstep(4000.0, 14000.0, dd);
        float foam = clamp(max(streak * 0.9 * (1.0 - farK), max(crest * (1.0 - 0.5 * farK), toe * (1.0 - 0.9 * farK))), 0.0, 1.0);
        vec3 fc = vec3(0.9, 0.9, 0.9) * mix(0.72, 1.05, smoothstep(0.8, 1.02, yn) * uSunUp) + uSunCol * 0.08;
        col = mix(col, fc, foam);
        col *= uLight;
        col = mix(col, uFogC, smoothstep(uFogNear, uFogFar, dd) * uFogK);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const wave = new THREE.Mesh(wGeo, waveMat); wave.frustumCulled = false; wave.renderOrder = 2; scene.add(wave);
  // spray, mist and splash sprites (one pool, placed each frame), debris carried by the wall
  const sprays = Array.from({ length: 700 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, transparent: true, depthWrite: false, color: 0xffffff })); s.renderOrder = 10; s.visible = false; scene.add(s); return s; });
  const debris = IM(new THREE.BoxGeometry(1, 1, 1), STD({ color: 0xffffff, roughness: 0.8 }), 160, false); debris.frustumCulled = false; scene.add(debris);
  { const R = RNG('debNY'); for (let i = 0; i < 160; i++) debris.setColorAt(i, lin(R.pick(['#6a4a30', '#c4785c', '#f2efe8', '#f07a28', '#2b3236', '#f0c030', '#4a3a2a', '#8a9aa4']))); }

  G = { cv, r, scene, cam, sky, skyU, clouds, hemi, sun, seaMat, seaMesh, WINU, bld, BL, tanks, TK, ac, acN, winMats, towers, verraz, bridgeLamps, statue, boats, cars, CARS, streetLights, heli, roofG, bulbs, FOLK, folkB, folkH,
    wave, wGeo, wPos, wUv, wX, wProf, wArc, WNX, WNS, waveU, sprays, debris, glowTex };
  return G;
}
