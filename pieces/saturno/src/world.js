
// =====================================================================
//  WORLD — a wooden fjord town at dusk: the sky (stars, the afterglow, Saturn's glow), Saturn and its rings, the rock walls with
//  snow and the lava cracks, the fjord's water, the villages on both shelves, the church, the quay, the ferry and boats, our
//  terrace; the ice from the rings (streak heads, flashes, steam), avalanches, debris that lifts towards Saturn
// =====================================================================
const SKYD = 30000;
let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x5a6488, 800, 22000);
  const cam = new THREE.PerspectiveCamera(66, W / H, 0.2, 120000); cam.rotation.order = 'YXZ'; scene.add(cam);

  // --- sky (no tone mapping): deep blue above, the afterglow behind-left, stars; Saturn's golden light; later its bands
  const skyU = { top: { value: lin('#16204a') }, mid: { value: lin('#3a4a86') }, hor: { value: lin('#d88a7a') }, sunDir: { value: SUN_DIR.clone() }, satDir: { value: dirV(9 * DEG, 16 * DEG) },
    satGlow: { value: 0 }, satW: { value: 0.01 }, starA: { value: 1 }, gold: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(100000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sunDir, satDir; uniform float satGlow, satW, starA, gold; varying vec3 vDir;
      float sh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.2, 1.0);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.25, pow(max(h, 0.0), 0.8))); c = mix(c, top, smoothstep(0.15, 0.85, h));
        float s = max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(sunDir.x, 0.0, sunDir.z))), 0.0); c += vec3(0.9, 0.42, 0.25) * pow(s, 3.0) * 0.45 * (1.0 - smoothstep(0.0, 0.3, h));
        float st = 0.0; for (int L = 0; L < 3; L++) { float sc = L == 0 ? 220.0 : L == 1 ? 420.0 : 800.0; float lat = asin(clamp(d.y, -1.0, 1.0)); vec2 uv = vec2(atan(d.x, -d.z) * cos(lat), lat) * sc; vec2 cc = floor(uv);
          float r = sh(cc + float(L) * 17.3); if (r > (L == 0 ? 0.95 : 0.965)) { vec2 o = vec2(0.2 + 0.6 * sh(cc + 3.1), 0.2 + 0.6 * sh(cc + 7.7)); st += smoothstep(0.22, 0.0, length(fract(uv) - o)) * (0.4 + 0.6 * sh(cc + 11.0)) * (L == 0 ? 1.4 : 0.7); } }
        c += vec3(0.95, 0.95, 1.0) * st * starA * smoothstep(0.05, 0.4, h);
        float a = acos(clamp(dot(d, satDir), -1.0, 1.0)); c += vec3(1.0, 0.82, 0.55) * satGlow * (0.5 * exp(-a * a / satW) + 0.12 * exp(-a * 2.5));
        c = mix(c, vec3(0.74, 0.6, 0.4) * (0.7 + 0.4 * smoothstep(-0.2, 0.6, d.y)), gold);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);

  // --- Saturn: an oblate sphere with its bands, lit from the side (a soft terminator), limb darkening, the rings' shadow;
  //     the rings: a flat annulus (inner C ring at 1.24 R to the F ring at 2.33 R), lit, with Saturn's shadow across the back
  const satTex = texSaturn(); satTex.anisotropy = ANI;
  const SAT = new THREE.Group(); scene.add(SAT);
  const satU = { uMap: { value: satTex }, uSun: { value: SUNP.clone() }, uRingN: { value: new THREE.Vector3(0, 1, 0) }, uDim: { value: 1 } };
  const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({ uniforms: satU, fog: false,
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uSun, uRingN; uniform float uDim; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vec3 c = texture2D(uMap, vUv).rgb; float l = dot(normalize(vN), normalize(uSun)), lit = smoothstep(-0.12, 0.35, l) * 0.92 + 0.08;
        float limb = pow(max(dot(normalize(vN), vV), 0.0), 0.35); float rs = 1.0 - 0.45 * smoothstep(0.04, 0.0, abs(dot(normalize(vN), uRingN) - 0.18)) * step(0.0, l);
        vec3 col = c * lit * (0.55 + 0.45 * limb) * rs; col += vec3(1.0, 0.85, 0.6) * pow(1.0 - limb, 4.0) * 0.25 * lit;
        gl_FragColor = vec4(col * uDim, 1.0);
        #include <encodings_fragment>
      }` }));
  planet.renderOrder = -2; planet.scale.set(1, 0.9, 1); SAT.add(planet);
  const ringTex = texRings();
  const ringG = new THREE.RingGeometry(1.24, 2.33, 256, 1); { const p = ringG.attributes.position, uv = ringG.attributes.uv; for (let i = 0; i < p.count; i++) { const rr = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (rr - 1.24) / (2.33 - 1.24), 0.5); } }
  const ringU = { uMap: { value: ringTex }, uSun: { value: SUNP.clone() }, uDim: { value: 1 } };
  const rings = new THREE.Mesh(ringG, new THREE.ShaderMaterial({ uniforms: ringU, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
    vertexShader: 'varying vec2 vUv; varying vec3 vL; void main(){ vUv = uv; vL = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uSun; uniform float uDim; varying vec2 vUv; varying vec3 vL;
      void main(){ vec4 c = texture2D(uMap, vec2(vUv.x, 0.5)); float shadow = 1.0 - 0.85 * smoothstep(1.05, 0.95, abs(vL.x * 0.6 + vL.y * 0.8)) * step(0.0, vL.y * 0.6 - vL.x * 0.8);
        gl_FragColor = vec4(c.rgb * (0.85 + 0.25 * vUv.x) * shadow * uDim, c.a);
        #include <encodings_fragment>
      }` }));
  rings.renderOrder = -1; SAT.add(rings);

  // --- lights: a cold dusk dome; Saturn's golden reflected light grows into the key light; fire light from the cracks later
  const hemi = new THREE.HemisphereLight(0x8a96d0, 0x3a3640, 1.0); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe0b0, 0.2); scene.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 4; key.shadow.blurSamples = 12;
  Object.assign(key.shadow.camera, { left: -900, right: 900, top: 900, bottom: -900, near: 10, far: 9000 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.6;
  key.target.position.set(0, 0, -600); key.target.updateMatrixWorld();

  // --- terrain: rock walls with snow above a line (it melts), green slopes and pines below, lava cracks (Roche)
  const crackU = { value: 0 }, timeU = { value: 0 }, snowU = { value: 1 };
  { const N = 420, g = new THREE.PlaneGeometry(2, 2, N, N); g.rotateX(-Math.PI / 2); const p = g.attributes.position, cols = [];
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i), m = Math.max(Math.abs(u), Math.abs(v)) + 1e-9, k = 30000 * Math.pow(m, 2.2) / m, x = u * k, z = v * k;
      const y = terrH(x, z); p.setXYZ(i, x, y, z); const nA = 0.5 + 0.5 * Math.sin(x * 0.011) * Math.sin(z * 0.009);
      let c = C3('#5a6a3a', '#3e5232', nA); c.lerp(C3('#6a6660', '#4a4844', nA), ss(30, 180, y)); if (y < 2) c = C3('#5a5446', '#3a362e', nA); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const rockTex = wrap(texSnowRock()); rockTex.anisotropy = ANI;
    const m = STD({ vertexColors: true, map: rockTex, roughness: 0.95 });
    m.onBeforeCompile = (sh) => { sh.uniforms.uCrack = crackU; sh.uniforms.uT = timeU; sh.uniforms.uSnow = snowU;
      sh.vertexShader = 'varying vec3 vWp; varying vec3 vWn;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWp = (modelMatrix * vec4(transformed, 1.0)).xyz; vWn = normalize(mat3(modelMatrix) * objectNormal);').replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_UV\n { float st = 1.0 - smoothstep(0.35, 0.75, abs(normal.y)); vUv = mix(position.xz, vec2(position.x + position.z, position.y * 1.6), st) / 40.0; }\n#endif');
      sh.fragmentShader = 'uniform float uCrack, uT, uSnow; varying vec3 vWp; varying vec3 vWn;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
          { float line = 250.0 + 70.0 * sin(vWp.x * 0.004 + vWp.z * 0.003); float flatK = smoothstep(0.45, 0.8, vWn.y);
            float sn = smoothstep(line, line + 120.0, vWp.y) * mix(0.55, 1.0, flatK) * uSnow; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.92, 0.97), clamp(sn * 1.2, 0.0, 1.0)); }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec2 q = vec2(vWp.x + vWp.z * 0.3, vWp.z + vWp.y * 0.8) * 0.018; float c1 = abs(sin(q.x * 1.3 + sin(q.y * 0.7) * 2.0) * sin(q.y * 1.1 + sin(q.x * 0.9) * 2.0)), c2 = abs(sin(q.x * 3.1 - q.y * 2.3 + sin(q.y * 1.7)));
            float net = (1.0 - smoothstep(0.0, 0.12, c1)) + 0.7 * (1.0 - smoothstep(0.0, 0.07, c2)) * step(0.3, sin(q.x * 0.5 + q.y * 0.3));
            float grow = smoothstep(0.0, 1.0, uCrack * 1.6 - 0.6 * fract(sin(dot(floor(q * 0.5), vec2(12.9, 78.2))) * 437.5));
            vec3 lava = mix(vec3(1.0, 0.3, 0.04), vec3(1.0, 0.78, 0.35), smoothstep(0.5, 1.0, net));
            totalEmissiveRadiance += lava * net * grow * (5.0 + 1.2 * sin(uT * 3.0 + vWp.x * 0.02)); diffuseColor.rgb *= 1.0 - 0.6 * grow; }`); };
    const terr = new THREE.Mesh(g, m); terr.receiveShadow = true; scene.add(terr); }
  const falls = []; for (const [z, side] of [[-1200, 1], [-2600, -1], [-4200, 1], [-5800, -1]]) { const x = fjordX(z) + side * (halfW(z) + 160), top = terrH(x, z), m = new THREE.Mesh(new THREE.PlaneGeometry(14, top - 10), new THREE.MeshBasicMaterial({ color: 0xe8f0f4, transparent: true, opacity: 0.75, fog: true }));
    m.position.set(x - side * 90, (top - 10) / 2 + 5, z); m.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(m); falls.push(m); }

  // --- the fjord's water: reflections of the dusk sky and of Saturn's glow, ripples; it drains, then floods the shore
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uLevel: { value: 0 }, uTop: { value: lin('#1a2450') }, uHor: { value: lin('#b88a8a') }, uSat: { value: dirV(9 * DEG, 16 * DEG) }, uSatK: { value: 0 },
    uBody: { value: lin('#14303a') }, uChurn: { value: 0 }, uGold: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true, transparent: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uLevel, uSatK, uChurn, uGold; uniform vec3 uTop, uHor, uSat, uBody; varying vec3 vW; ${BED_GLSL}
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT, dep = uLevel - bedH(p), dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(300.0, 3000.0, dist);
        vec3 n = normalize(vec3(0.04 * sin(p.x * 0.05 + t * 0.6) + 0.03 * sin(p.x * 0.17 - p.y * 0.11 + t) + fine * 0.03 * sin(p.x * 0.7 + p.y * 0.5 + t * 1.8) + uChurn * 0.15 * sin(p.x * 0.3 + t * 5.0), 1.0,
                                0.04 * sin(p.y * 0.06 - t * 0.5) + 0.03 * sin(p.y * 0.2 + p.x * 0.09 - t) + fine * 0.03 * sin(p.y * 0.8 - p.x * 0.3 + t * 2.0) + uChurn * 0.15 * sin(p.y * 0.25 - t * 6.0)));
        n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(5000.0, 22000.0, dist)));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.45)); float sa = acos(clamp(dot(Rf, uSat), -1.0, 1.0)); skyR += vec3(1.0, 0.8, 0.5) * uSatK * (exp(-sa * sa / 0.01) + 0.2 * exp(-sa * 3.0));
        vec3 col = mix(uBody, skyR, clamp(fres * 0.9 + 0.15, 0.0, 0.9)); col = mix(col, vec3(0.6, 0.48, 0.32), uGold * 0.5);
        float foam = smoothstep(0.0, 1.2, 1.0 - dep) * 0.6 + uChurn * smoothstep(0.6, 1.0, sin(p.x * 0.08 + t * 3.0) * sin(p.y * 0.07 - t * 2.4)) * 0.5;
        col = mix(col, vec3(0.86, 0.88, 0.9), clamp(foam, 0.0, 1.0) * 0.6);
        float al = mix(0.4, 1.0, smoothstep(0.0, 2.0, dep)) * smoothstep(-0.02, 0.1, dep); if (al < 0.01) discard;
        gl_FragColor = vec4(col, al);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const seaMesh = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000).rotateX(-Math.PI / 2).translate(0, 0, -25000), seaMat); seaMesh.renderOrder = 1; scene.add(seaMesh);

  // --- the villages: painted wooden houses (Falu red, ochre, white, blue-grey, green) with steep gable roofs, on our slope and
  //     along both shelves of the fjord; windows switch on through the dusk
  const WD = texWood(); [WD.alb, WD.lit].forEach((t) => { wrap(t); t.anisotropy = ANI; });
  const WINU = { uOn: { value: 0.35 }, uPow: { value: 1 } };
  const hMat = STD({ color: 0xffffff, roughness: 0.85, emissive: 0xffffff }); hMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uFacM: { value: WD.alb }, uFacE: { value: WD.lit }, uOn: WINU.uOn, uPow: WINU.uPow });
    sh.vertexShader = 'varying vec2 vFac; varying float vTop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + vec3(0.5, 0.0, 0.5)) * sc; vTop = step(0.5, normal.y); vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacE; uniform float uOn, uPow; varying vec2 vFac; varying float vTop;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= texture2D(uFacM, vFac).rgb;')
      .replace('#include <emissivemap_fragment>', `{ vec4 e = texture2D(uFacE, vFac); float th = (e.a - 0.25) / 0.74; float cellH = fract(sin(dot(floor(vFac * 8.0), vec2(41.3, 17.7))) * 9137.1);
        float on = step(th, uOn) * step(0.05, e.a) * (1.0 - vTop) * step(cellH, uPow); totalEmissiveRadiance = e.rgb * on * 3.2; }`);
  };
  const HCOL = ['#9a2e22', '#a83a26', '#d8a840', '#f0ece2', '#e8e4d8', '#4a6a8a', '#6a8a5a', '#c8b07a', '#8a2a20', '#d0c4a4', '#3a5a7a'];
  const HL = []; { const R = RNG('fjordTown'), ok = (x, z, s) => !HL.some((h) => Math.abs(h.x - x) < (h.sx + s) / 2 + 3 && Math.abs(h.z - z) < (h.sz + s) / 2 + 3);
    for (let i = 0; i < 9000 && HL.length < 340; i++) { const x = R.r(-420, 420), z = R.r(SHORE + 6, 200), sx = R.r(7, 11), sz = R.r(6, 9); if (Math.abs(x) < 9 && Math.abs(z - 10) < 9) continue; if (!ok(x, z, Math.max(sx, sz))) continue;
      HL.push({ x, z, sx, sz, h: R.r(5, 9.5), ry: R.f() < 0.5 ? 0 : Math.PI / 2, c: R.pick(HCOL) }); }
    for (let i = 0; i < 50000 && HL.length < 1900; i++) { const z = -Math.pow(R.f(), 1.4) * 6000 - 140, side = R.f() < 0.5 ? -1 : 1, dx = R.r(10, 80), x = fjordX(z) + side * (halfW(z) + dx), sx = R.r(7, 12), sz = R.r(6, 10);
      if (!ok(x, z, Math.max(sx, sz))) continue; HL.push({ x, z, sx, sz, h: R.r(5, 9), ry: R.f() < 0.5 ? 0 : Math.PI / 2, c: R.pick(HCOL), far: true }); } }
  HL.forEach((q) => { q.y0 = terrH(q.x, q.z) - 0.6; q.rh = Math.min(q.sx, q.sz) * 0.55; });
  const houses = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), hMat, HL.length); houses.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const roofGeo = (() => { const P = []; const q = (a, b, c, d) => P.push(...a, ...c, ...b, ...a, ...d, ...c);
    q([-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 1, 0], [-0.5, 1, 0]); q([0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 1, 0], [0.5, 1, 0]); P.push(-0.5, 0, 0.5, -0.5, 1, 0, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, 0.5);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); return g; })();
  const roofs = IM(roofGeo, STD({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide }), HL.length); roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  HL.forEach((q, i) => { houses.setMatrixAt(i, M4c(q.x, q.y0, q.z, q.ry, q.sx, q.h, q.sz)); houses.setColorAt(i, lin(q.c)); roofs.setMatrixAt(i, M4c(q.x, q.y0 + q.h, q.z, q.ry, q.sx + 0.8, q.rh, q.sz + 0.8)); roofs.setColorAt(i, lin(['#2a2a2e', '#3a3430', '#5a2a24', '#2e3a30'][i % 4])); });
  scene.add(houses, roofs);
  // pines on the lower slopes (dark cones), waterfalls down the walls
  const HOCC = new Set(); HL.forEach((h) => { for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) HOCC.add(`${Math.round(h.x / 8) + dx},${Math.round(h.z / 8) + dz}`); });
  const PINES = []; { const R = RNG('pines'); for (let i = 0; i < 60000 && PINES.length < 22000; i++) { const z = R.r(-9000, 200), side = R.f() < 0.5 ? -1 : 1, dx = Math.pow(R.f(), 1.6) * 420 + 8, x = fjordX(z) + side * (halfW(z) + dx), y = terrH(x, z);
    if (y > 230 || y < 3 || (Math.abs(x) < 70 && z > -60) || HOCC.has(`${Math.round(x / 8)},${Math.round(z / 8)}`)) continue; PINES.push([x, y, z, R.r(9, 18) * (1 + -z / 9000)]); } }
  const pines = IM(new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), STD({ color: 0x3e5634, roughness: 1, flatShading: true }), PINES.length, false); pines.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  PINES.forEach(([x, y, z, s], i) => pines.setMatrixAt(i, M4c(x, y - 0.5, z, i, s * 0.35, s, s * 0.35))); scene.add(pines);
  // the white church with its steeple on the shore to the left; street lamps along the shore road
  { const white = STD({ color: 0xf4f0e8, roughness: 0.8 }), cx = -170, cz = -70, y0 = terrH(cx, cz) - 0.3, add = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; scene.add(o); };
    add(new THREE.BoxGeometry(12, 9, 22), white, cx, y0 + 4.5, cz); add(roofGeo.clone().scale(13, 5, 23), STD({ color: 0x2a2a2e, side: THREE.DoubleSide }), cx, y0 + 9, cz);
    add(new THREE.BoxGeometry(6, 16, 6), white, cx, y0 + 8, cz + 13); add(new THREE.ConeGeometry(4.2, 14, 4).rotateY(Math.PI / 4), STD({ color: 0x2a2a2e }), cx, y0 + 23, cz + 13); }
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,200,0.8)'], [0.5, 'rgba(255,190,120,0.2)'], [1, 'rgba(255,170,90,0)']], 64);
  const lampP = []; for (let x = -400; x <= 400; x += 24) lampP.push(x, terrH(x, SHORE + 6) + 5, SHORE + 6); HL.forEach((q, i) => { if (q.far && i % 3 === 0) lampP.push(q.x, q.y0 + 4, q.z + (q.x > 0 ? -1 : 1) * 6); });
  const POSTS = []; { const R = RNG('postsFj'); for (let i = 0; i < 60; i++) { const x = R.r(-300, 300), z = R.r(SHORE + 4, 120); if (HL.some((h) => Math.abs(h.x - x) < h.sx / 2 + 2 && Math.abs(h.z - z) < h.sz / 2 + 2)) continue; POSTS.push([x, terrH(x, z), z]); lampP.push(x, terrH(x, z) + 4.6, z); } }
  const posts = IM(new THREE.CylinderGeometry(0.08, 0.12, 4.6, 6).translate(0, 2.3, 0), STD({ color: 0x1e2024, metalness: 0.4, roughness: 0.5 }), POSTS.length); POSTS.forEach(([x, y, z], i) => posts.setMatrixAt(i, M4c(x, y, z))); scene.add(posts);
  const poolTex = g3Radial([[0, 'rgba(255,200,130,0.65)'], [0.5, 'rgba(255,170,90,0.22)'], [1, 'rgba(255,160,80,0)']], 64);
  const pools = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4 }), POSTS.length + 20, false);
  POSTS.forEach(([x, y, z], i) => pools.setMatrixAt(i, M4c(x, y + 0.15, z, 0, 16, 1, 16))); for (let i = 0; i < 20; i++) pools.setMatrixAt(POSTS.length + i, M4c(-38 + i * 8, 2.9, SHORE - 14, 0, 12, 1, 12)); scene.add(pools);
  const lamps = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lampP, 3)), new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, map: glowTex, color: 0xffd090, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  lamps.renderOrder = 6; scene.add(lamps);
  // --- a lighthouse on a rocky point on the left shore, its beam sweeping across the fjord
  const LH = { x: fjordX(-760) - halfW(-760) + 70, z: -760 }; LH.y = terrH(LH.x, LH.z); { const red = STD({ color: 0xc8372d, roughness: 0.6 }), white = STD({ color: 0xf4f0e8, roughness: 0.6 }), grp = new THREE.Group(); grp.position.set(LH.x, LH.y, LH.z); scene.add(grp);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(18, 1), STD({ color: 0x5a5650, roughness: 1, flatShading: true })); rock.scale.set(1.4, 0.5, 1.2); rock.position.set(30, -2, 0); grp.add(rock);
    for (let k = 0; k < 6; k++) { const sgm = new THREE.Mesh(new THREE.CylinderGeometry(2.4 - k * 0.15, 2.55 - k * 0.15, 3.2, 16), k % 2 ? red : white); sgm.position.set(30, 3 + k * 3.2, 0); sgm.castShadow = true; grp.add(sgm); }
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.8, 12), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); lamp.position.set(30, 23, 0); grp.add(lamp); const cap = new THREE.Mesh(new THREE.ConeGeometry(2, 2, 12), red); cap.position.set(30, 25, 0); grp.add(cap);
    const beamTex = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,246,216,0.9)'); g.addColorStop(1, 'rgba(255,246,216,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = v; x.fillRect(0, 0, w, h); }, 256, 64);
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(900, 60).translate(450, 0, 0), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); beam.position.set(LH.x + 30, LH.y + 23, LH.z); beam.renderOrder = 6; scene.add(beam); LH.beam = beam; LH.grp = grp; }
  // --- the quay: a wooden deck on piles with bollards; the ferry; fishing boats
  const QUAY = []; { const R = RNG('quayStuff'), crateM = STD({ roughness: 0.8 }), n = 70, crates = IM(new THREE.BoxGeometry(1, 1, 1), crateM, n);
    for (let i = 0; i < n; i++) { const x = R.r(-36, 116), z = SHORE - R.r(3, 24), k = R.f(), sc = k < 0.5 ? [1.4, 1.2, 1.4] : k < 0.8 ? [2.4, 1, 1.2] : [6, 2.6, 2.4]; crates.setMatrixAt(i, M4c(x, 2.8 + sc[1] / 2, z, R.r(0, 1), ...sc)); crates.setColorAt(i, lin(R.pick(['#8a6a44', '#a87a4a', '#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#6a5440']))); QUAY.push([x, z]); }
    scene.add(crates);
    const bol = IM(new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8), STD({ color: 0x2a2a2e }), 20); for (let i = 0; i < 20; i++) bol.setMatrixAt(i, M4c(-38 + i * 8, 3.2, SHORE - 25.5)); scene.add(bol);
    const barrels = IM(new THREE.CylinderGeometry(0.4, 0.4, 1, 10), STD({ color: 0x3a5a7a, roughness: 0.6 }), 24); for (let i = 0; i < 24; i++) barrels.setMatrixAt(i, M4c(-30 + (i % 6) * 0.9 + Math.floor(i / 6) * 30, 3.3, SHORE - 6 - (i % 2) * 0.9)); scene.add(barrels);
    const shed = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 10), STD({ color: 0x9a2e22, roughness: 0.85 })); shed.position.set(100, 5.8, SHORE - 9); shed.castShadow = true; scene.add(shed);
    const shR = new THREE.Mesh(new THREE.BoxGeometry(21, 0.4, 11), STD({ color: 0x2a2a2e })); shR.position.set(100, 9, SHORE - 9); scene.add(shR);
    const cr = new THREE.Group(); cr.position.set(-20, 2.8, SHORE - 18); scene.add(cr); const ym = STD({ color: 0xe0a43a, roughness: 0.6 });
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 0.8), ym); mast.position.y = 7; cr.add(mast); const jib = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 16), ym); jib.position.set(0, 13.6, -6); jib.rotation.x = -0.25; cr.add(jib); }
  { const deck = new THREE.Mesh(new THREE.BoxGeometry(160, 1.2, 26), STD({ color: 0xa88a64, roughness: 0.9 })); deck.position.set(40, 2.2, SHORE - 13); deck.receiveShadow = true; scene.add(deck);
    const piles = IM(new THREE.CylinderGeometry(0.3, 0.3, 12, 6), STD({ color: 0x3a2e24 }), 40); for (let i = 0; i < 40; i++) piles.setMatrixAt(i, M4c(-38 + (i % 20) * 8, -3, SHORE - 1 - Math.floor(i / 20) * 24)); scene.add(piles); }
  const boats = []; { const white = STD({ color: 0xf2efe8, roughness: 0.6 }), R = RNG('boatsFj');
    const mk = (L, col, x, z, yaw, kind) => { const grp = new THREE.Group(), hull = new THREE.Mesh(new THREE.BoxGeometry(L * 0.3, L * 0.16, L).translate(0, L * 0.08, 0), STD({ color: lin(col), roughness: 0.5 })); hull.castShadow = true; grp.add(hull);
      if (kind === 'ferry') { const s = new THREE.Mesh(new THREE.BoxGeometry(L * 0.28, L * 0.12, L * 0.6), white); s.position.y = L * 0.2; grp.add(s); const f = new THREE.Mesh(new THREE.BoxGeometry(L * 0.06, L * 0.1, L * 0.06), STD({ color: 0xc8372d })); f.position.set(0, L * 0.31, -L * 0.1); grp.add(f); }
      else { const c = new THREE.Mesh(new THREE.BoxGeometry(L * 0.22, L * 0.18, L * 0.24), white); c.position.set(0, L * 0.25, -L * 0.15); grp.add(c); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, L * 0.6, 5), white); m.position.set(0, L * 0.45, L * 0.15); grp.add(m); }
      grp.rotation.order = 'YXZ'; scene.add(grp); boats.push({ grp, x, z, yaw, L, ph: R.r(0, 6), roll: R.f() < 0.5 ? 1 : -1 }); };
    mk(70, '#1e3a5a', 90, SHORE - 45, Math.PI / 2 + 0.05, 'ferry');
    for (let i = 0; i < 9; i++) mk(R.r(9, 13), R.pick(['#c8372d', '#2f6fb0', '#f2efe8', '#2a5a3a', '#e0a43a']), -30 + i * 7.5, SHORE - 31, Math.PI / 2 + R.n(0.05), 'fish');   // moored along the quay
    for (let i = 0; i < 18; i++) mk(R.r(8, 14), R.pick(['#c8372d', '#2f6fb0', '#f2efe8', '#2a5a3a', '#e0a43a']), R.r(-300, 300), SHORE - R.r(30, 260), R.r(0, 6), 'fish'); }

  const ter = new THREE.Group(), bulbs = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, -1e5, 0], 3)), new THREE.PointsMaterial({ size: 1, transparent: true }));

  // --- the ice rain: impact points on the walls, the water and the shelves; flashes, steam, splashes; avalanches; debris lifting
  const puffTex = texPuff('puffSat', 30, 0.4);
  const pool = (n, map, o = {}) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map, transparent: true, depthWrite: false, opacity: 0 }, o))); s.visible = false; s.renderOrder = o.order ?? 9; scene.add(s); return s; });
  const ICE = []; { const R = RNG('iceHits'); for (let i = 0; i < 200; i++) { const z = -R.r(400, 9000), kind = R.f(), side = R.f() < 0.5 ? -1 : 1;
    const x = kind < 0.45 ? fjordX(z) + R.r(-1, 1) * halfW(z) * 0.9 : fjordX(z) + side * (halfW(z) + R.r(60, 700)); const y = kind < 0.45 ? 0 : terrH(x, z);
    ICE.push({ x, y, z, t: 31 + Math.pow(R.f(), 0.8) * 22, big: R.f() < 0.12, water: kind < 0.45 }); } ICE.sort((a, b) => a.t - b.t); }
  const flashes = pool(200, glowTex, { blending: THREE.AdditiveBlending, order: 8 }), steam = pool(400, puffTex), aval = pool(120, puffTex);
  const CHUNK = []; { const R = RNG('chunks'); ICE.forEach((h, k) => { const n = h.big ? 22 : 8; for (let j = 0; j < n; j++) { const a = R.r(0, TAU), v = R.r(30, 120) * (h.big ? 1.6 : 1); CHUNK.push({ h, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: R.r(40, 140) * (h.big ? 1.4 : 1), s: R.r(3, 10) * (h.big ? 1.6 : 1), ice: R.f() < 0.4, sp: R.r(1, 6) }); } }); }
  const chunks = IM(new THREE.DodecahedronGeometry(1, 0), STD({ roughness: 0.9, flatShading: true }), CHUNK.length, false); chunks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); chunks.frustumCulled = false;
  CHUNK.forEach((c, i) => { chunks.setColorAt(i, lin(c.ice ? '#d8ecf8' : ['#5a5650', '#6a6660', '#3a3632'][i % 3])); chunks.setMatrixAt(i, _hid); }); scene.add(chunks);
  const sparks = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(2400 * 3), 3)), new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, map: glowTex, color: 0xcfe8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sparks.frustumCulled = false; sparks.renderOrder = 9; scene.add(sparks);
  const DEB = []; { const R = RNG('debSat'); for (let i = 0; i < 900; i++) { const q = HL[Math.floor(R.f() * Math.min(HL.length, 400))]; DEB.push({ x: q.x + R.n(6), z: q.z + R.n(6), y: q.y0 + R.r(0, q.h), t0: 53 + R.r(0, 5.5), sp: R.r(0.6, 1.6), s: [R.r(0.3, 2), R.r(0.05, 0.4), R.r(0.3, 1.5)], c: R.pick(['#9a2e22', '#2a2a2e', '#d8a840', '#f0ece2', '#6a5440', '#4a6a8a']), spin: R.r(1, 5) }); } }
  const deb = IM(new THREE.BoxGeometry(1, 1, 1), STD({ roughness: 0.8 }), DEB.length, false); deb.instanceMatrix.setUsage(THREE.DynamicDrawUsage); deb.frustumCulled = false; DEB.forEach((d, i) => { deb.setColorAt(i, lin(d.c)); deb.setMatrixAt(i, _hid); }); scene.add(deb);
  const spray = pool(260, puffTex, { order: 9 });

  G = { cv, r, scene, cam, LH, CHUNK, chunks, sparks, PINES, pools, sky, skyU, SAT, planet, rings, satU, ringU, hemi, key, crackU, timeU, snowU, pines, falls, seaMat, seaMesh, WINU, HL, houses, roofs, lamps, boats, ter, bulbs, ICE, flashes, steam, aval, DEB, deb, spray, glowTex };
  return G;
}
