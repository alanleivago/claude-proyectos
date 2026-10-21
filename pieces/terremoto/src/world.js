
// =====================================================================
//  WORLD — the seafront of a port city on the hills: terrain, beach and sea floor, the draining water, the avenue, the
//  seafront promenade and a cross street; rows of plaster buildings; the building across (a facade of loose panels with
//  rooms behind); houses on the hills, a funicular, towers, the port (cranes, containers, a ship), the lighthouse; palms,
//  lamps, a bandstand, cars, buses, people; the cracks; dust, fires; the wave
// =====================================================================
let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd2dae4, 500, 9000);
  const cam = new THREE.PerspectiveCamera(64, W / H, 0.1, 60000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const ENV = envCube();

  // --- sky: afternoon blue, a warm band at the horizon, the sun's glow to the right; clouds
  const skyU = { top: { value: lin('#4f7cc4') }, mid: { value: lin('#9ab8de') }, hor: { value: lin('#f0dcc4') }, sunDir: { value: SUN_DIR.clone() }, sunCol: { value: lin('#fff0d8') }, dust: { value: 0 }, dustC: { value: lin('#b8a68c') } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(50000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sunDir, sunCol, dustC; uniform float dust; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.1, 1.0);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.2, pow(max(h, 0.0), 0.8))); c = mix(c, top, smoothstep(0.12, 0.8, h));
        float s = max(dot(d, sunDir), 0.0); c += sunCol * (pow(s, 1200.0) * 2.5 + pow(s, 40.0) * 0.3 + pow(s, 5.0) * 0.12);
        c = mix(c, dustC * (0.85 + 0.25 * smoothstep(-0.1, 0.6, d.y)), dust);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  const cloudTex = texCloud(), puffTex = texPuff('puffEQ'), mistTex = texPuff('mistEQ', 34, 0.3), dustTex = texPuff('dustEQ', 30, 0.4);
  const clouds = []; { const R = RNG('cloudsEQ'); for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.8 }));
    s.userData = { x: R.r(-20000, 20000), z: R.r(-40000, -14000), y: R.r(1500, 6000), w: R.r(4000, 9000), a: R.r(0.22, 0.4), o: R.r(0.6, 0.9) }; s.renderOrder = -2; scene.add(s); clouds.push(s); } }

  // --- lights: the afternoon sun from over the sea (to the right), the sky dome
  const hemi = new THREE.HemisphereLight(0xc4d4ee, 0x7a6a58, 0.95); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.3); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  Object.assign(sun.shadow.camera, { left: -280, right: 280, top: 280, bottom: -280, near: 10, far: 2500 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.4;
  sun.target.position.set(60, 0, -40); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 1200); sun.target.updateMatrixWorld();

  // --- terrain: hills, the city's ground, the beach and the sea floor (dense near the camera)
  const bedTex = wrap(texBedDetail(), 1, 1); bedTex.anisotropy = ANI;
  { const N = 340, g = new THREE.PlaneGeometry(2, 2, N, N); g.rotateX(-Math.PI / 2); const p = g.attributes.position, uv = g.attributes.uv, cols = [];
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i), m = Math.max(Math.abs(u), Math.abs(v)) + 1e-9, k = 6000 * Math.pow(m, 2.2) / m, x = u * k + 60, z = v * k - 200;
      const y = terrH(x, z); p.setXYZ(i, x, y, z); uv.setXY(i, x / 20, z / 20);
      const d = shoreZ(x) - z, hl = hillH(x, z), nA = 0.5 + 0.5 * Math.sin(x * 0.013) * Math.sin(z * 0.011);
      let c = C3('#7a7470', '#8a847a', nA);                                   // the city's ground
      c.lerp(C3('#6a8a46', '#8a8a52', nA).lerp(lin('#a08a62'), ss(0.6, 0.9, nA) * 0.5), ss(8, 30, hl));   // hillsides: scrub and dry grass
      if (d > -3) c = C3('#e2cfa4', '#c8b080', ss(0, 22, d));                  // the beach
      if (d > 22) c = C3('#8a7a5a', '#5a4e3c', ss(22, 160, d)).lerp(lin('#46503a'), ss(0.7, 0.95, nA) * 0.4);   // the sea floor
      cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const terr = new THREE.Mesh(g, STD({ vertexColors: true, map: bedTex, roughness: 0.95 })); terr.receiveShadow = true; scene.add(terr); }

  // --- the water: sky reflection, sun glitter, surf on the beach; clear in the shallows; drains with the story
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uLevel: { value: 0 }, uSun: { value: SUN_DIR.clone() }, uSunCol: { value: lin('#fff0d8') },
    uTop: { value: lin('#4f7cc4') }, uHor: { value: lin('#e8e0d4') }, uShallow: { value: lin('#5aa8a2') }, uMid: { value: lin('#2f7a90') }, uDeep: { value: lin('#1e4e70') }, uDark: { value: 0 }, uMud: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true, transparent: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uLevel, uDark, uMud; uniform vec3 uSun, uSunCol, uTop, uHor, uShallow, uMid, uDeep; varying vec3 vW; ${BED_GLSL}
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT, dep = uLevel - bedH(p), dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(150.0, 1200.0, dist);
        vec3 n = normalize(vec3(0.05 * sin(p.x * 0.09 + t * 0.9) + 0.04 * sin(p.x * 0.31 - p.y * 0.2 + t * 1.4) + fine * 0.035 * sin(p.x * 1.3 + p.y * 0.9 + t * 2.1), 1.0,
                                0.05 * sin(p.y * 0.11 - t * 0.8) + 0.04 * sin(p.y * 0.37 + p.x * 0.17 - t * 1.2) + fine * 0.035 * sin(p.y * 1.5 - p.x * 0.7 + t * 1.9)));
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(2500.0, 12000.0, dist)));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.55));
        vec3 body = mix(uShallow, uMid, smoothstep(0.0, 4.0, dep)); body = mix(body, uDeep, smoothstep(4.0, 16.0, dep));
        body = mix(body, vec3(0.42, 0.36, 0.26), uMud);
        vec3 col = mix(body, skyR, clamp(fres * 0.85, 0.0, 1.0));
        float sd = max(dot(Rf, uSun), 0.0); col += uSunCol * (pow(sd, 600.0) * 6.0 + pow(sd, 40.0) * 0.35);
        float sw = 0.25 + 0.1 * sin(t * 0.7 + p.x * 0.05), foam = exp(-dep * dep / (sw * sw)) * 0.9 * (0.6 + 0.4 * sin(p.x * 0.7 + p.y * 0.5 + t * 1.3));
        float surf = smoothstep(0.6, 1.0, sin((shoreZ(p.x) - p.y) * 0.25 - t * 1.6)) * (1.0 - smoothstep(0.5, 3.5, dep)) * 0.7;
        col = mix(col, vec3(0.95, 0.96, 0.96), clamp(foam + surf, 0.0, 1.0)); col *= 1.0 - uDark;
        float al = mix(0.35, 1.0, smoothstep(0.0, 2.0, dep)); al = max(al, clamp(foam, 0.0, 1.0)); al *= smoothstep(-0.02, 0.06, dep); if (al < 0.01) discard;
        gl_FragColor = vec4(col, al);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const seaMesh = new THREE.Mesh(new THREE.PlaneGeometry(60000, 40000).rotateX(-Math.PI / 2).translate(0, 0, -20000), seaMat); seaMesh.renderOrder = 1; scene.add(seaMesh);

  // --- the seafront, following the coast: our sidewalk, the avenue, the promenade (a wavy mosaic), the sea wall; a cross street inland
  const asphM = STD({ map: wrap(texAsphalt()), roughness: 0.9 }); asphM.map.anisotropy = ANI;
  const promM = STD({ map: wrap(texPromenade()), roughness: 0.85 }); promM.map.anisotropy = ANI;
  const sideM = STD({ color: 0xc8c0b2, roughness: 0.9 }), wallM2 = STD({ color: 0xd8d0c0, roughness: 0.9 });
  const ribbon = (o0, o1, y, mat, uScale, vScale, x0 = -2600, x1 = 900, step = 6) => { const pos = [], uvs = [], idx = []; let acc = 0, prev = null;
    for (let x = x0, k = 0; x <= x1; x += step, k++) { const A = avPt(x, o0), B = avPt(x, o1), c = avPt(x, (o0 + o1) / 2); if (prev) acc += Math.hypot(c[0] - prev[0], c[1] - prev[1]); prev = c;
      pos.push(A[0], y, A[1], B[0], y, B[1]); uvs.push(0, acc / vScale, uScale, acc / vScale); if (k) { const i = (k - 1) * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m); return m; };
  ribbon(9, 13.4, LAND_Y + 0.15, sideM, 1, 1);
  ribbon(-9, 9, LAND_Y + 0.03, asphM, 1, 16);
  const prom = ribbon(-39, -9, LAND_Y + 0.05, promM, 30 / 3.5, 3.5);
  { const g = ribbon(-39.6, -39, LAND_Y + 0.4, wallM2, 1, 4); g.castShadow = true; }
  const cross = new THREE.Mesh(new THREE.PlaneGeometry(12, 260).rotateX(-Math.PI / 2), asphM.clone()); cross.position.set(36, LAND_Y + 0.04, 130.5); cross.material.map = wrap(texAsphalt(), 1, 260 / 16); cross.receiveShadow = true; scene.add(cross);
  // the cracks: flat jagged fissures that open across the avenue, along the promenade and up the cross street
  const crackTex = texCrack(); const crackM = new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6 });
  const CRACKS = [[-40, -13, 220, 6, Math.PI / 2 - 0.05, 25.6], [10, -36, 170, 7, Math.PI / 2 + 0.12, 26.2], [36, 60, 120, 5, 0.04, 26.8], [-60, -30, 90, 5, 0.9, 27.4], [45, -44, 60, 4, -0.5, 27.8], [20, -60, 140, 9, Math.PI / 2 - 0.2, 28.2]];
  const cracks = CRACKS.map(([x, z, L, wd, ang, t0]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), crackM); m.position.set(x, LAND_Y + 0.12, z); m.rotation.y = ang; m.userData = { L, wd, t0 }; m.scale.set(0.001, 1, 0.001); m.renderOrder = 3; scene.add(m); return m; });

  // --- buildings: rows of plaster facades (tinted per building), on the avenue and climbing behind it; tar roofs
  const PL = texPlaster(); [PL.alb, PL.mask].forEach((t) => { wrap(t); t.anisotropy = ANI; });
  const bldMat = STD({ color: 0xffffff, roughness: 0.9 }); bldMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uFacM: { value: PL.alb }, uFacK: { value: PL.mask } });
    sh.vertexShader = 'varying vec2 vFac; varying float vTop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + vec3(0.5, 0.0, 0.5)) * sc; vTop = step(0.5, normal.y); vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacK; varying vec2 vFac; varying float vTop;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n if (vTop > 0.5) diffuseColor.rgb = vec3(0.62, 0.42, 0.34) * (0.85 + 0.15 * fract(sin(dot(floor(vFac * 24.0), vec2(3.1, 7.7))) * 91.3)); else { vec3 a = texture2D(uFacM, vFac).rgb; float k = texture2D(uFacK, vFac).r; diffuseColor.rgb = mix(a, diffuseColor.rgb * a * 1.18, k); }');
  };
  const COLS = ['#e8c25a', '#5a8ac8', '#c8503a', '#6aa070', '#e09aa0', '#e88a3a', '#f0ece0', '#a890c8', '#f2d27a', '#5ab0b0', '#d86a5a', '#88b4e0'];
  const BL = []; { const R = RNG('cityEQ');
    // rows along the seafront, following its bend: o = distance inland from the avenue's centre line
    const row = (x0, x1, o, d0, d1, h0, h1) => { let x = x0; while (x < x1) { const w = R.r(9, 18); if (x + w > x1) break; const d = R.r(d0, d1), [px, pz] = avPt(x + w / 2, o + d / 2);
      if (!(px > 24.5 && px < 64 && pz < 30)) BL.push({ x: px, z: pz, ry: -Math.atan(avDZ(x + w / 2)), sx: w - 0.4, sz: d, h: R.r(h0, h1), c: R.pick(COLS) }); x += w; } };
    row(-2600, -15, 13.8, 16, 22, 12, 32); row(64, 820, 13.8, 16, 22, 12, 30);
    for (let o = 44; o < 640; o += R.r(22, 30)) row(-2600 + R.r(0, 20), 29, o, 14, 20, 8, Math.max(8, 26 - o * 0.012)), row(43, 620, o, 14, 20, 8, 22);
    // houses up the hills on the right (smaller, brighter)
    for (let i = 0, nh = 0; i < 12000 && nh < 1100; i++) { const x = R.r(170, 1400), z = R.r(-560, 500); if (z < shoreZ(x) + 25) continue; const hl = hillH(x, z); if (hl < 6 && x > 240) continue;
      if (BL.some((b) => Math.abs(b.x - x) < 9 && Math.abs(b.z - z) < 9)) continue; BL.push({ x, z, sx: R.r(6, 11), sz: R.r(6, 10), h: R.r(5, 11), c: R.pick(COLS), hill: true }); nh++; } }
  BL.forEach((b) => { b.y0 = terrH(b.x, b.z) - 0.6; });
  const bld = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), bldMat, BL.length); bld.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  BL.forEach((b, i) => { bld.setMatrixAt(i, M4c(b.x, b.y0, b.z, b.ry || 0, b.sx, b.h, b.sz)); bld.setColorAt(i, lin(b.c)); }); scene.add(bld);
  // gable roofs on the hill houses (tin, red, blue)
  const roofGeo = new THREE.ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4);
  const HR = BL.map((b, i) => [b, i]).filter(([b]) => b.hill), roofs = IM(roofGeo, STD({ color: 0xffffff, roughness: 0.7, metalness: 0.2, flatShading: true }), HR.length); roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  HR.forEach(([b], j) => { roofs.setMatrixAt(j, M4c(b.x, b.y0 + b.h + 1.2, b.z, 0, b.sx * 1.45, 2.4, b.sz * 1.45)); roofs.setColorAt(j, lin(['#8a8a86', '#b5523a', '#3a6a8a', '#6a7076', '#a8472f'][j % 5])); }); scene.add(roofs);

  // --- our building and the balcony: a white plaster block, the balcony slab, an iron railing, a potted geranium
  const ours = new THREE.Mesh(new THREE.BoxGeometry(39.5, BALC + 3, 22).translate(5.25, (BALC + 3) / 2, 11), STD({ color: 0xf0ece2, roughness: 0.9 })); ours.position.y = LAND_Y - 0.3; ours.receiveShadow = true; scene.add(ours);
  const balc = new THREE.Group(); balc.position.x = CAMX; scene.add(balc);
  { const iron = STD({ color: 0x1e2024, roughness: 0.45, metalness: 0.6 }), slab = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 1.8), STD({ color: 0xd8d2c6, roughness: 0.9 })); slab.position.set(-1.3, BALC - 0.11, -0.9); slab.receiveShadow = true; balc.add(slab);
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.06), iron); top.position.set(-1.3, BALC + 0.86, -1.72); balc.add(top);
    const mid = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.035, 0.035), iron); mid.position.set(-1.3, BALC + 0.12, -1.72); balc.add(mid);
    for (let k = 0; k <= 8; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.74, 0.016), iron); b.position.set(-2.9 + k * 3.2 / 8, BALC + 0.49, -1.72); balc.add(b); }
  }

  // --- the building across the cross street: a facade of 6 x 9 loose panels (they fall), floors and rooms behind
  const HX = 42.2, HZ0 = 2, BAYW = 22 / 6, FLH = 3.0, heroTex = texHeroFacade(); heroTex.anisotropy = ANI;
  { const body = new THREE.Mesh(new THREE.BoxGeometry(22, 9 * FLH + 1, 22).translate(0, (9 * FLH + 1) / 2, 0), STD({ color: 0xe2b84e, roughness: 0.9 })); body.position.set(HX + 11 + 1.2, LAND_Y - 0.2, HZ0 + 11); body.castShadow = true; body.receiveShadow = true; scene.add(body); }
  const roomCols = ['#d8c8b0', '#a8c4c8', '#e0b0a0', '#c8d0a8', '#d0b8d8', '#f0e0c0'];
  for (let f = 1; f < 9; f++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 22), STD({ color: 0xb8b0a4 })); sl.position.set(HX + 0.9, LAND_Y + f * FLH, HZ0 + 11); scene.add(sl);
    for (let b = 0; b < 6; b++) { const wall = new THREE.Mesh(new THREE.PlaneGeometry(BAYW, FLH).rotateY(-Math.PI / 2), STD({ color: lin(roomCols[(f * 7 + b) % 6]), roughness: 0.9 })); wall.position.set(HX + 1.15, LAND_Y + f * FLH + FLH / 2, HZ0 + (b + 0.5) * BAYW); scene.add(wall);
      if (hsh(f * 13 + b) < 0.7) { const fur = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8 + hsh(b, f) * 0.8, 1.2), STD({ color: lin(['#6a4a32', '#3a4a6a', '#8a3a2a', '#d8d0c0'][(f + b) % 4]) })); fur.position.set(HX + 0.85, LAND_Y + f * FLH + 0.5, HZ0 + (b + 0.3 + hsh(f, b) * 0.4) * BAYW); scene.add(fur); }
      if (hsh(b * 5 + f, 7) < 0.6) { const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45).rotateY(-Math.PI / 2), STD({ color: lin(['#2f6fb0', '#c8372d', '#e0a43a'][b % 3]) })); pic.position.set(HX + 1.13, LAND_Y + f * FLH + 1.8, HZ0 + (b + 0.5) * BAYW); scene.add(pic); } } }
  const panels = []; const panelMat = STD({ map: heroTex, roughness: 0.9, side: THREE.DoubleSide });
  for (let f = 0; f < 9; f++) for (let b = 0; b < 6; b++) { const g = new THREE.PlaneGeometry(BAYW, FLH), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (b + uv.getX(i)) / 6, (8 - f + uv.getY(i)) / 9);   // image row 0 (the shops) is the bottom floor
    const m = new THREE.Mesh(g, panelMat); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const R = RNG('panel', f * 6 + b), falls = f > 0 && R.f() < 0.78, tp = 31.0 + (8 - f) * 0.24 + R.r(0, 1.8);
    panels.push({ m, f, b, x: HX, y0: LAND_Y + f * FLH, z: HZ0 + (b + 0.5) * BAYW, falls, tp, spin: R.n(1.5), dz: R.n(1.5) }); }
  // rubble that piles up in the street under it, and on the avenue from other buildings
  const RUB = []; { const R = RNG('rubble'); for (let i = 0; i < 1500; i++) { const kind = i < 420 ? 0 : i < 1000 ? 1 : 2; let x, z, s;
    if (kind === 0) { x = R.r(30, 42) - R.r(0, 6) * R.f(); z = R.r(2, 26); s = R.r(0.18, 0.9); } else { const xx = R.r(-260, 420); [x, z] = avPt(xx, kind === 1 ? R.r(4, 14) : R.r(-38, -6)); s = R.r(0.12, 0.7); }
    RUB.push({ x, z, y: LAND_Y + s * 0.3 + (kind === 0 ? R.r(0, 1.4) : 0), s, ry: R.r(0, 6), rx: R.n(0.5), t0: kind === 0 ? 31.4 + R.r(0, 4.5) : 14 + R.r(0, 28), c: R.pick(['#c8b48a', '#d0c4ac', '#a89e90', '#8a7c6c', '#b8a07a', '#9a948a', '#c8a868', '#b06a50']) }); } }
  const rubble = IM(new THREE.DodecahedronGeometry(1, 0), STD({ roughness: 0.95, flatShading: true }), RUB.length); rubble.instanceMatrix.setUsage(THREE.DynamicDrawUsage); rubble.frustumCulled = false;
  RUB.forEach((q, i) => { rubble.setColorAt(i, lin(q.c)); rubble.setMatrixAt(i, _hid); }); scene.add(rubble);

  // --- the towers up the slope (they sway), the funicular, the port (quay, cranes, containers, a ship), the lighthouse
  const winMats = [0, 1, 3].map((k) => { const t = wrap(texWindows(k)); t.anisotropy = ANI; return STD({ map: t, roughness: [0.45, 0.85, 0.4][k === 3 ? 2 : k], metalness: k === 1 ? 0 : 0.4, envMap: ENV, envMapIntensity: 0.5 }); });
  const towers = []; { const R = RNG('towersEQ'); for (const [x, z] of [[110, 70], [150, 140], [200, 60], [250, 160], [300, 110], [-180, 120], [-320, 90]]) { const w = R.r(18, 28), d = R.r(18, 26), h = R.r(45, 85), y0 = terrH(x, z) - 0.5;
    const grp = new THREE.Group(); grp.position.set(x, y0, z); scene.add(grp); const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), uv = g.attributes.uv, nm = g.attributes.normal;
    for (let i = 0; i < uv.count; i++) { const side = Math.abs(nm.getX(i)) > 0.5 ? d : w; uv.setXY(i, uv.getX(i) * side / 26, uv.getY(i) * h / 112); }
    const m = new THREE.Mesh(g, R.pick(winMats)); m.castShadow = true; grp.add(m); towers.push({ grp, h, ph: R.r(0, 6), fall: x === 250 }); } }
  { const R = RNG('farCity'); for (let i = 0; i < 46; i++) { const x = R.r(-2600, -700), o = R.r(30, 420), [px, pz] = avPt(x, o), w = R.r(16, 30), d = R.r(16, 26), h = R.r(28, 110) * (1 - 0.3 * ss(-700, -2600, x)), y0 = terrH(px, pz) - 0.5;
    const grp = new THREE.Group(); grp.position.set(px, y0, pz); scene.add(grp); const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), uv = g.attributes.uv, nm = g.attributes.normal;
    for (let k = 0; k < uv.count; k++) { const side = Math.abs(nm.getX(k)) > 0.5 ? d : w; uv.setXY(k, uv.getX(k) * side / 26, uv.getY(k) * h / 112); }
    grp.add(new THREE.Mesh(g, R.pick(winMats))); towers.push({ grp, h, ph: R.r(0, 6), fall: false, far: true }); } }
  const fun = { x0: 455, z0: shoreZ(455) + 40, x1: 480, z1: 40 }; fun.y0 = terrH(fun.x0, fun.z0); fun.y1 = terrH(fun.x1, fun.z1);
  { const L = Math.hypot(fun.x1 - fun.x0, fun.y1 - fun.y0, fun.z1 - fun.z0), tr = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, L), STD({ color: 0x5a5048, roughness: 0.9 }));
    tr.position.set((fun.x0 + fun.x1) / 2, (fun.y0 + fun.y1) / 2 + 0.6, (fun.z0 + fun.z1) / 2); tr.lookAt(fun.x1, fun.y1 + 0.6, fun.z1); scene.add(tr); fun.L = L; }
  const funCar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3, 5), STD({ color: 0xd8443a, roughness: 0.6 })); funCar.castShadow = true; scene.add(funCar);
  const quayM = STD({ color: 0xa8a49c, roughness: 0.95 }), red = STD({ color: 0xc8372d, roughness: 0.6 }), white = STD({ color: 0xf2efe8, roughness: 0.6 }), dark = STD({ color: 0x23292e, roughness: 0.5, metalness: 0.3 });
  { const q = new THREE.Mesh(new THREE.BoxGeometry(360, 14, 70), quayM); q.position.set(370, LAND_Y - 7, shoreZ(370) - 30); q.rotation.y = Math.atan(0.62); q.receiveShadow = true; scene.add(q);
    const R = RNG('port'), cont = IM(new THREE.BoxGeometry(12, 2.6, 2.5), STD({ roughness: 0.8 }), 240);
    for (let i = 0; i < 240; i++) { const u = R.r(-160, 160), v = R.r(-30, 10), x = 370 + u * Math.cos(Math.atan(0.62)), z = shoreZ(370) - 30 - u * Math.sin(Math.atan(0.62)) + v, lay = Math.floor(R.f() * 4);
      cont.setMatrixAt(i, M4c(x, LAND_Y + 1.3 + lay * 2.6, z, -Math.atan(0.62) + Math.PI / 2, 1, 1, 1)); cont.setColorAt(i, lin(R.pick(['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#d8d4cc', '#7a4a32']))); }
    scene.add(cont);
    for (let k = 0; k < 3; k++) { const c = new THREE.Group(), u = -90 + k * 70; c.position.set(370 + u * Math.cos(Math.atan(0.62)), LAND_Y, shoreZ(370) - 55 - u * Math.sin(Math.atan(0.62))); c.rotation.y = -Math.atan(0.62); scene.add(c);
      for (const [lx, lz] of [[-8, -6], [8, -6], [-8, 6], [8, 6]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.4, 40, 1.4), k % 2 ? red : white); l.position.set(lx, 20, lz); c.add(l); }
      const bm = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 90), k % 2 ? red : white); bm.position.set(0, 42, -18); c.add(bm); const hs = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 8), dark); hs.position.set(0, 45, 0); c.add(hs); } }
  const ship = new THREE.Group(); { const hull = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 200), STD({ color: 0x2c3e55, roughness: 0.7 })); hull.position.y = 2; ship.add(hull);
    const br = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 14), white); br.position.set(0, 15, 80); ship.add(br); const R = RNG('shipC');
    for (let i = 0; i < 9; i++) for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(12, 3, 16), STD({ color: lin(R.pick(['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#d8d4cc'])) })); c.position.set(0, 8.5 + k * 3, -70 + i * 17); ship.add(c); }
    ship.position.set(370 + 20, 0, shoreZ(370) - 110); ship.rotation.y = -Math.atan(0.62) + Math.PI / 2 - Math.PI / 2; scene.add(ship); ship.rotation.y = Math.PI / 2 - Math.atan(0.62) - Math.PI / 2; }
  const lighthouse = new THREE.Group(); { lighthouse.position.set(150, LAND_Y, -360); scene.add(lighthouse); const bw = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 240), quayM); bw.position.set(0, -3, 110); bw.rotation.y = 0.5; lighthouse.add(bw);
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(2.2 - k * 0.15, 2.4 - k * 0.15, 4, 14), k % 2 ? red : white); s.position.y = 2 + k * 4; s.castShadow = true; lighthouse.add(s); }
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 2, 12), new THREE.MeshBasicMaterial({ color: 0xfff6e0 })); lamp.position.y = 23; lighthouse.add(lamp); const cap = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2, 12), red); cap.position.y = 25; lighthouse.add(cap); }

  // --- palms, lamps, benches, a bandstand, flower beds on the promenade; traffic lights at the corner
  const palms = []; { const R = RNG('palmsEQ'); for (let x = -420; x < 520; x += R.r(11, 15)) for (const o of [-11.5, -36]) { const [px, pz] = avPt(x, o); if (Math.hypot(px + 25, pz + 40) < 9) continue; palms.push({ x: px, z: pz, h: R.r(8, 12), lean: R.n(0.08), ph: R.r(0, 6), fall: R.f() < 0.35, ft: 26 + R.r(0, 6), dir: R.f() < 0.5 ? 1 : -1 }); } }
  const trunkM = STD({ color: 0x8a7258, roughness: 1 }), frondM = STD({ color: 0x4f7a34, roughness: 0.85, side: THREE.DoubleSide, flatShading: true });
  const frondG = (() => { const P = [], C = [], R = RNG('frond'); for (let f = 0; f < 11; f++) { const a = f / 11 * TAU + R.r(-0.2, 0.2), L = R.r(3.2, 4.4), droop = R.r(0.5, 1.1), dead = f > 8, ca = lin(dead ? '#8a7a4a' : '#4f7a34'), cb = lin(dead ? '#6a5a32' : '#2f5a26');
    const seg = 10, pts = []; for (let s = 0; s <= seg; s++) { const u = s / seg, r = L * u, y = 0.5 * Math.sin(u * 2.2) - droop * u * u * L * 0.35; pts.push([Math.cos(a) * r, y, Math.sin(a) * r, 0.55 * Math.sin(Math.PI * Math.min(1, u * 1.2)) * (1 - u * 0.4)]); }
    const px = -Math.sin(a), pz = Math.cos(a); for (let s = 0; s < seg; s++) { const [x0, y0, z0, w0] = pts[s], [x1, y1, z1, w1] = pts[s + 1]; for (const side of [-1, 1]) { const A = [x0, y0, z0], B = [x1, y1, z1], Cc = [x1 + px * w1 * side, y1 - w1 * 0.35, z1 + pz * w1 * side], D = [x0 + px * w0 * side, y0 - w0 * 0.35, z0 + pz * w0 * side];
      P.push(...A, ...B, ...Cc, ...A, ...Cc, ...D); const k = s / seg; for (let q = 0; q < 6; q++) { const cc = ca.clone().lerp(cb, k * 0.6 + (q > 1 ? 0.2 : 0)); C.push(cc.r, cc.g, cc.b); } } } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; })();
  const palmTrunk = IM(new THREE.CylinderGeometry(0.2, 0.32, 1, 7).translate(0, 0.5, 0), trunkM, palms.length), palmLeaf = IM(frondG, STD({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide }), palms.length);
  palmTrunk.instanceMatrix.setUsage(THREE.DynamicDrawUsage); palmLeaf.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(palmTrunk, palmLeaf);
  const lamps = []; for (let x = -420; x < 520; x += 22) { const [ax, az] = avPt(x, -9.6), [bx, bz] = avPt(x + 11, 10.2); lamps.push({ x: ax, z: az, ph: hsh(x) * 6 }); lamps.push({ x: bx, z: bz, ph: hsh(x, 2) * 6 }); }
  const lampPole = IM(new THREE.CylinderGeometry(0.07, 0.11, 5, 7).translate(0, 2.5, 0), dark, lamps.length), lampHead = IM(new THREE.SphereGeometry(0.28, 10, 8).translate(0, 5.1, 0), STD({ color: 0xfff6e0, emissive: 0xfff0d0, emissiveIntensity: 0.4 }), lamps.length);
  lampPole.instanceMatrix.setUsage(THREE.DynamicDrawUsage); lampHead.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(lampPole, lampHead);
  { const bs = new THREE.Group(); bs.position.set(-25, LAND_Y, -40); scene.add(bs); const base = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.3, 0.8, 8), white); base.position.y = 0.4; bs.add(base);
    for (let k = 0; k < 8; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 6), white); c.position.set(Math.cos(k / 8 * TAU) * 4.6, 2.5, Math.sin(k / 8 * TAU) * 4.6); bs.add(c); }
    const rf = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.2, 8), STD({ color: 0x3a7a6a, roughness: 0.6 })); rf.position.y = 5.3; rf.castShadow = true; bs.add(rf); G_BAND = bs; }
  const beds = IM(new THREE.BoxGeometry(1, 0.5, 1), STD({ color: 0x4a7a32, roughness: 1 }), 30); for (let i = 0; i < 30; i++) beds.setMatrixAt(i, M4c(-330 + i * 16, LAND_Y + 0.3, -36, 0, 6, 1, 2.2)); scene.add(beds);
  const flowers = IM(new THREE.IcosahedronGeometry(0.12, 0), STD({ roughness: 0.8 }), 900, false); { const R = RNG('flowersEQ'); for (let i = 0; i < 900; i++) { const b = Math.floor(R.f() * 30); flowers.setMatrixAt(i, M4c(-330 + b * 16 + R.r(-2.8, 2.8), LAND_Y + 0.6, -36 + R.r(-1, 1))); flowers.setColorAt(i, lin(R.pick(['#e84a50', '#f2d24a', '#f4f0e8', '#b8a0e0', '#e86ab0']))); } } scene.add(flowers);
  // --- cars, buses and taxis along the avenue: an extruded side profile (bonnet, cabin, boot) in the paint colour, dark glass,
  //     black wheels with grey hubs, headlights; parked at the kerbs and moving in the two middle lanes
  const profile = (P, w) => { const sh = new THREE.Shape(P.map(([x, y]) => new THREE.Vector2(x, y))); const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 }); g.translate(0, 0, -w / 2); return g; };
  const carShell = profile([[-2.2, 0.32], [2.2, 0.32], [2.25, 0.62], [2.05, 0.82], [1.1, 0.9], [-2.0, 0.92], [-2.25, 0.7]], 1.62), carGlass = profile([[1.05, 0.9], [0.35, 1.38], [-1.2, 1.4], [-1.75, 0.92]], 1.5);
  const busShell = profile([[-5.6, 0.45], [5.6, 0.45], [5.65, 3.0], [-5.6, 3.0]], 2.4), busGlass = profile([[-5.5, 1.6], [5.55, 1.6], [5.6, 2.6], [-5.5, 2.6]], 2.46);
  const CARS = []; { const R = RNG('carsEQ'); for (let i = 0; i < 90; i++) { const lane = i % 4, kind = R.f() < 0.1 ? 'bus' : 'car'; CARS.push({ lane, kind, x0: R.r(-600, 600), v: lane === 0 || lane === 3 ? 0 : (lane === 1 ? 1 : -1) * R.r(9, 13),
    c: kind === 'bus' ? ['#e8e2d0', '#e0a43a', '#2f6fb0'][i % 3] : ['#f2c400', '#d8261e', '#f4f4f0', '#16161a', '#b8bcc4', '#f07a20', '#2a5ac8', '#2e9a4a', '#8a1e2a', '#f2c400', '#e86ab0', '#5ab0d8'][i % 12], ph: R.r(0, 6) }); } }
  const carsN = CARS.filter((c) => c.kind === 'car').length, busN = CARS.length - carsN, paint = STD({ roughness: 0.4, metalness: 0.15, envMap: ENV, envMapIntensity: 0.25 }), glassM = STD({ color: 0x1e2830, roughness: 0.1, metalness: 0.7, envMap: ENV, envMapIntensity: 0.9 });
  const carBody = IM(carShell, paint, carsN), carTop = IM(carGlass, glassM, carsN), busBody = IM(busShell, paint.clone(), busN), busTop = IM(busGlass, glassM, busN);
  const wheels = IM(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14).rotateX(Math.PI / 2), STD({ color: 0x16161a, roughness: 0.8 }), CARS.length * 4);
  { let ci = 0, bi = 0; CARS.forEach((c) => { c.slot = c.kind === 'car' ? ci++ : bi++; (c.kind === 'car' ? carBody : busBody).setColorAt(c.slot, lin(c.c)); }); }
  [carBody, carTop, busBody, busTop, wheels].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  const hullMat = STD({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide, flatShading: true });
  const boats = []; { const R = RNG('boatsEQ'); for (let i = 0; i < 16; i++) { const x = R.r(-500, 200), z = R.r(-110, -420), L = R.r(6, 12), grp = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(L * 0.34, L * 0.18, L).translate(0, L * 0.09, 0), STD({ color: lin(R.pick(['#f4f2ec', '#2f6fb0', '#c8372d', '#e0a43a'])), roughness: 0.5 })); grp.add(hull);
    if (R.f() < 0.5) { const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, L * 1.1, 5), white); mast.position.y = L * 0.6; grp.add(mast); } else { const cab = new THREE.Mesh(new THREE.BoxGeometry(L * 0.26, L * 0.15, L * 0.3), white); cab.position.set(0, L * 0.25, -L * 0.1); grp.add(cab); }
    grp.rotation.order = 'YXZ'; scene.add(grp); boats.push({ grp, x, z, L, yaw: R.r(0, 6), ph: R.r(0, 6), roll: R.f() < 0.5 ? 1 : -1 }); } }
  // --- people: on the promenade, the sidewalks, the beach (walking, standing, sunbathing); legs, arms, torso, head and hair
  const FOLK = []; { const R = RNG('folkEQ'); for (let i = 0; i < 2000 && FOLK.length < 320; i++) { const zone = R.f(), xx = R.r(-240, 380); let x, z, kind = 'walk';
      if (zone < 0.42) [x, z] = avPt(xx, R.r(-37, -12)); else if (zone < 0.62) [x, z] = avPt(xx, R.r(9.5, 13)); else if (zone < 0.9) { const [bx, bz] = avPt(xx, -40); const d = shoreZ(bx) - 8 - bz; [x, z] = [bx, bz + d * R.f()]; kind = R.f() < 0.45 ? 'lie' : R.f() < 0.5 ? 'stand' : 'walk'; if (z < shoreZ(x) + 3) continue; }
      else { x = R.r(31, 41); z = R.r(5, 90); }
      FOLK.push({ x, z, kind, v: kind === 'walk' ? R.r(0.8, 1.5) * (R.f() < 0.5 ? 1 : -1) : 0, yaw: R.r(0, 6), ph: R.r(0, 6), fall: R.f() < 0.35, ft: 14 + R.r(0, 12), run: 45.5 + R.r(0, 6),
        top: R.pick(['#e8e4dc', '#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#e86ab0', '#2a2a30', '#f2d24a', '#8a3a2a', '#5ab0b0']), leg: R.pick(['#2a3a5a', '#1a1a1e', '#c8b48a', '#4a4a50', '#e8e4dc', '#2f4a6a']), skin: R.pick(['#f1c9a5', '#d9a47c', '#b47a52', '#8a5636']), hair: R.pick(['#2a1a10', '#4a3020', '#1a1a1a', '#c8a060', '#8a5a30']), s: R.r(0.88, 1.06) }); } }
  const NF = FOLK.length, PART = (geo, n) => { const m = IM(geo, STD({ roughness: 0.8 }), n, false); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m; };
  const folk = { leg: PART(new THREE.CapsuleGeometry(0.085, 0.72, 3, 6).translate(0, -0.42, 0), NF * 2), torso: PART(new THREE.CapsuleGeometry(0.17, 0.42, 3, 8).translate(0, 0.21, 0), NF), arm: PART(new THREE.CapsuleGeometry(0.055, 0.5, 3, 6).translate(0, -0.3, 0), NF * 2),
    head: PART(new THREE.SphereGeometry(0.12, 10, 8), NF), hair: PART(new THREE.SphereGeometry(0.127, 10, 8, 0, TAU, 0, Math.PI * 0.55), NF) };
  FOLK.forEach((f, i) => { folk.leg.setColorAt(i * 2, lin(f.leg)); folk.leg.setColorAt(i * 2 + 1, lin(f.leg)); folk.torso.setColorAt(i, lin(f.top)); folk.arm.setColorAt(i * 2, lin(f.kind === 'lie' ? f.skin : f.top)); folk.arm.setColorAt(i * 2 + 1, lin(f.kind === 'lie' ? f.skin : f.top)); folk.head.setColorAt(i, lin(f.skin)); folk.hair.setColorAt(i, lin(f.hair)); });
  // --- the beach: umbrellas (two-colour panels), towels, coolers
  const UMB = []; { const R = RNG('umbEQ'); for (let i = 0; i < 400 && UMB.length < 110; i++) { const xx = R.r(-260, 400), [bx, bz] = avPt(xx, -40), d = shoreZ(bx) - 6 - bz, z = bz + d * R.f(); if (z < shoreZ(bx) + 4) continue; UMB.push({ x: bx, z, tilt: R.n(0.12), c: R.pick(['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#e86ab0', '#f2d24a', '#5ab0b0']), ph: R.r(0, 6) }); } }
  const umbG = (() => { const g = new THREE.ConeGeometry(1.25, 0.45, 12, 1, true); g.translate(0, 2.05, 0); const col = []; const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = Math.floor((a + Math.PI) / TAU * 12) % 2 ? 1 : 0.72; col.push(k, k, k); } g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return g; })();
  const umbA = IM(umbG, STD({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }), UMB.length), umbPole = IM(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 5).translate(0, 1.05, 0), STD({ color: 0xe8e4dc }), UMB.length), towels = IM(new THREE.BoxGeometry(0.9, 0.02, 1.8), STD({ roughness: 0.9 }), UMB.length, false);
  UMB.forEach((u, i) => { umbA.setColorAt(i, lin(u.c)); towels.setColorAt(i, lin(['#f2d24a', '#2f6fb0', '#e86ab0', '#f4f0e8', '#3a8a5a'][i % 5])); });
  [umbA, umbPole, towels].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  // --- a cruise ship on the bay: a white superstructure of decks, rows of balconies, a blue band, a red funnel
  const cruise = new THREE.Group(); { const L = 230, hullM = STD({ color: 0x1e2c48, roughness: 0.5 }), deckM = STD({ color: 0xf4f2ec, roughness: 0.5 }), winM = STD({ color: 0x2a3a4a, roughness: 0.2, metalness: 0.6 });
    const hull = new THREE.Mesh(profile([[-L / 2, 0], [L / 2 - 20, 0], [L / 2, 10], [-L / 2, 10]], 30), hullM); hull.rotation.y = 0; cruise.add(hull);
    for (let k = 0; k < 9; k++) { const len = L * (0.86 - k * 0.035), dk = new THREE.Mesh(new THREE.BoxGeometry(len, 2.9, 28 - k * 0.6), deckM); dk.position.set(-L * 0.06 - k * 1.5, 11.5 + k * 3, 0); dk.castShadow = true; cruise.add(dk);
      const band = new THREE.Mesh(new THREE.BoxGeometry(len * 0.98, 0.8, 28.2 - k * 0.6), winM); band.position.set(-L * 0.06 - k * 1.5, 11.8 + k * 3, 0); cruise.add(band); }
    const funnel = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 8), STD({ color: 0xc8372d })); funnel.position.set(-60, 42, 0); cruise.add(funnel);
    cruise.position.set(-160, 0, -760); cruise.rotation.y = -0.08; scene.add(cruise); }
  // the hill houses that break: walls and roof pieces thrown down the slope, with dust
  const HB = BL.map((b, i) => [b, i]).filter(([b, i]) => ((b.hill && b.x < 900) || (!b.hill && b.x > 60 && b.x < 800 && b.z < 260)) && hsh(i, 9) < 0.42); HB.forEach(([b]) => (b.brk = true));
  const hillDeb = IM(new THREE.BoxGeometry(1, 0.5, 0.8), STD({ roughness: 0.9 }), 1400, false); hillDeb.instanceMatrix.setUsage(THREE.DynamicDrawUsage); hillDeb.frustumCulled = false;
  for (let i = 0; i < 1400; i++) { const [b] = HB[i % HB.length]; hillDeb.setColorAt(i, lin(i % 3 ? b.c : ['#b5523a', '#8a8a86', '#c8b48a'][i % 3 === 0 ? (i >> 2) % 3 : 0])); hillDeb.setMatrixAt(i, _hid); } scene.add(hillDeb);
  // bricks and tiles falling off the facades along the avenue through the shaking
  const bricks = IM(new THREE.BoxGeometry(0.4, 0.14, 0.22), STD({ roughness: 0.9 }), 700, false); bricks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bricks.frustumCulled = false;
  for (let i = 0; i < 700; i++) bricks.setColorAt(i, lin(['#b06a50', '#c8b48a', '#e8c25a', '#d8d0c0', '#8a6a4a', '#c8503a'][i % 6])); scene.add(bricks);
  // --- dust, smoke and fire pools; glass shards falling
  const pool = (n, map, o = {}) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map, transparent: true, depthWrite: false, opacity: 0 }, o))); s.visible = false; s.renderOrder = o.order ?? 9; scene.add(s); return s; });
  const hillDust = pool(200, dustTex);
  const dust = pool(320, dustTex), smoke = pool(180, dustTex), glowTex = g3Radial([[0, 'rgba(255,250,220,1)'], [0.2, 'rgba(255,200,90,0.9)'], [0.5, 'rgba(255,110,30,0.45)'], [1, 'rgba(200,40,0,0)']], 64);
  const flames = pool(90, glowTex, { blending: THREE.AdditiveBlending });
  const glass = IM(new THREE.PlaneGeometry(0.3, 0.5), new THREE.MeshStandardMaterial({ color: 0xcfe4f0, roughness: 0.1, metalness: 0.8, envMap: ENV, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), 400, false); glass.frustumCulled = false; glass.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(glass);

  // --- THE WAVE: a 25 m wall (front toe skirt, concave face, overhanging lip, rounded crest), rebuilt each frame
  const WNX = 90, WNS = 40, WPROF = [[0.34, -0.02], [0.14, 0.03], [0.035, 0.12], [0.0, 0.3], [0.008, 0.5], [0.035, 0.7], [0.08, 0.86], [0.122, 0.955], [0.135, 1.005], [0.11, 1.04], [0.05, 1.055], [-0.04, 1.035], [-0.3, 0.9], [-1.0, 0.52], [-2.3, 0.15]];
  const wProf = [], wArc = [0];
  for (let j = 0; j < WNS; j++) { const u = j / (WNS - 1) * (WPROF.length - 1), i = Math.min(WPROF.length - 2, Math.floor(u)), f = u - i, P = (k) => WPROF[Math.max(0, Math.min(WPROF.length - 1, k))];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    wProf.push([cr(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0]), cr(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1])]); if (j) wArc.push(wArc[j - 1] + Math.hypot(wProf[j][0] - wProf[j - 1][0], wProf[j][1] - wProf[j - 1][1])); }
  const wX = []; for (let i = 0; i < WNX; i++) { const u = i / (WNX - 1) * 2 - 1; wX.push(Math.sign(u) * 5000 * Math.pow(Math.abs(u), 1.8)); }
  const wGeo = new THREE.BufferGeometry(), wPos = new Float32Array(WNX * WNS * 3), wUv = new Float32Array(WNX * WNS * 2), wYn = new Float32Array(WNX * WNS), wIdx = [];
  for (let i = 0; i < WNX; i++) for (let j = 0; j < WNS; j++) wYn[i * WNS + j] = wProf[j][1];
  for (let i = 0; i < WNX - 1; i++) for (let j = 0; j < WNS - 1; j++) { const a = i * WNS + j, b = a + WNS; wIdx.push(a, b, a + 1, b, b + 1, a + 1); }
  wGeo.setIndex(wIdx); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3)); wGeo.setAttribute('uv', new THREE.BufferAttribute(wUv, 2)); wGeo.setAttribute('aYn', new THREE.BufferAttribute(wYn, 1));
  const streakTex = wrap(texFoamStreaks()), foamTex = wrap(texFoam());
  const waveU = { uStreak: { value: streakTex }, uFoamT: { value: foamTex }, uT: { value: 0 }, uTop: { value: lin('#4a8a86') }, uMid: { value: lin('#1e5560') }, uBot: { value: lin('#3a3a30') }, uSky: { value: lin('#b8a88c') }, uFogC: { value: lin('#b8a88c') }, uFogNear: { value: 300 }, uFogFar: { value: 6000 }, uFogK: { value: 0.4 } };
  const waveMat = new THREE.ShaderMaterial({ uniforms: waveU, side: THREE.DoubleSide,
    vertexShader: `attribute float aYn; varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vYn = aYn; vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D uStreak, uFoamT; uniform float uT, uFogNear, uFogFar, uFogK; uniform vec3 uTop, uMid, uBot, uSky, uFogC;
      varying float vYn; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ float yn = vYn; vec3 col = mix(uBot, uMid, smoothstep(0.04, 0.45, yn)); col = mix(col, uTop, smoothstep(0.6, 0.98, yn));
        vec3 V = normalize(vW - cameraPosition), n = normalize(vN); if (dot(n, V) > 0.0) n = -n; float fres = pow(1.0 - max(dot(-V, n), 0.0), 4.0); col = mix(col, uSky * 0.8, fres * 0.4);
        float s1 = texture2D(uStreak, vec2(vUv.x * 0.7, vUv.y * 0.4 + uT * 0.25)).r, s2 = texture2D(uStreak, vec2(vUv.x * 1.3 + 0.37, vUv.y * 0.55 + uT * 0.4)).r;
        float streak = clamp(s1 * 0.9 + s2 * 0.6, 0.0, 1.0) * smoothstep(0.2, 0.9, yn);
        float fN = texture2D(uFoamT, vUv * 2.3 + vec2(0.0, uT * 0.08)).r, crest = smoothstep(0.92, 0.99, yn) * (0.6 + 0.6 * fN) + smoothstep(0.98, 1.04, yn), toe = (1.0 - smoothstep(0.02, 0.2, yn)) * (0.6 + 0.8 * texture2D(uFoamT, vUv * 4.0 + uT * 0.1).r);
        col = mix(col, vec3(0.88, 0.88, 0.84), clamp(max(streak * 0.85, max(crest, toe)), 0.0, 1.0));
        float dd = length(vW - cameraPosition); col = mix(col, uFogC, smoothstep(uFogNear, uFogFar, dd) * uFogK);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const wave = new THREE.Mesh(wGeo, waveMat); wave.frustumCulled = false; wave.renderOrder = 2; scene.add(wave);
  const sprays = pool(360, mistTex, { order: 10 });

  G = { cv, r, scene, cam, sky, skyU, clouds, hemi, sun, seaMat, seaMesh, bld, BL, roofs, HR, panels, rubble, RUB, towers, fun, funCar, ship, palms, palmTrunk, palmLeaf, lamps, lampPole, lampHead, CARS, carBody, carTop, busBody, busTop, wheels, boats, FOLK, folk, UMB, umbA, umbPole, towels, cruise, bricks, HB, hillDeb, hillDust,
    dust, smoke, flames, glass, cracks, prom, wave, wGeo, wPos, wUv, wX, wProf, wArc, WNX, WNS, waveU, sprays, balc };
  return G;
}
let G_BAND = null;
