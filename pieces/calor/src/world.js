
// =====================================================================
//  WORLD — the beach at golden hour: sky, sea (boils from the shore out), sand, the boardwalk, the road, palms, hotels, pine
//  hills; the fair (Ferris wheel, carousel, circus tent, bouncy castle, stalls, string lights, balloons); a gas station; a kiosk
//  with a popcorn machine; umbrellas, towels, loungers, kayaks, beach balls, people, cars, sailboats; the steel pier; the port
//  (quay, containers, a ship, gantry cranes, a lighthouse). Then the heat: steam, a cloud with virga, fires, smoke, char, glow.
// =====================================================================
let G = null;
// every solid material: it dries (vegetation), chars black, then glows dull red past the Draper point
const NAT = { uDry: { value: 0 }, uChar: { value: 0 }, uGlow: { value: 0 }, uSoot: { value: 0 } };
function natMat(o, k = 1, veg = 0) {
  const m = new THREE.MeshStandardMaterial(o);
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, NAT); sh.uniforms.uK = { value: k }; sh.uniforms.uVeg = { value: veg };
    sh.vertexShader = 'varying vec3 vNW;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
      { vec4 w4 = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        w4 = instanceMatrix * w4;
      #endif
        vNW = (modelMatrix * w4).xyz; }`);
    sh.fragmentShader = 'uniform float uDry, uChar, uGlow, uSoot, uK, uVeg; varying vec3 vNW;\nfloat nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }\n'
      + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        { vec2 q = vNW.xz * 0.11 + vNW.y * 0.07; float nz = vn(q) * 0.6 + vn(q * 3.1) * 0.3 + vn(q * 9.7) * 0.1;
          vec3 dry = vec3(dot(diffuseColor.rgb, vec3(0.4, 0.45, 0.15))) * vec3(1.25, 0.95, 0.55);
          diffuseColor.rgb = mix(diffuseColor.rgb, dry, uDry * uVeg); diffuseColor.rgb *= 1.0 - 0.62 * uSoot * (0.7 + 0.3 * nz);
          float c = smoothstep(0.75 - uChar * 0.9, 0.95 - uChar * 0.9, nz) * uK;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.045, 0.04, 0.035), clamp(c, 0.0, 1.0) * min(1.0, uChar * 1.4)); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec2 q = vNW.xz * 0.13 + vNW.y * 0.05; float nz = vn(q) * 0.6 + vn(q * 2.7) * 0.4; totalEmissiveRadiance += vec3(1.0, 0.13, 0.02) * uGlow * uK * (0.25 + 0.75 * nz * nz) * 0.6; }`);
  };
  return m;
}
const shoreAt = (z) => SHORE_X - Math.max(0, -1250 - z) * 0.9;     // the coast bends left past the port into a headland
function hillH(x, z) { const inl = x - shoreAt(z), k = Math.max(ss(380, 760, inl), ss(-1250, -1700, z) * ss(-60, 200, inl)); if (k <= 0) return 0;
  const f = 0.55 + 0.3 * Math.sin(x * 0.006 + 1.3) * Math.sin(z * 0.005 + 0.4) + 0.15 * Math.sin(x * 0.019 - z * 0.013); return k * 150 * f; }
function groundH(x, z) { const s = shoreAt(z); if (x < s) return Math.max(-30, SEA_Y - (s - x) * 0.08); if (x < s + 45) return SEA_Y + (x - s) / 45 * (0.1 - SEA_Y); return GY + hillH(x, z); }
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf0c8a0, 500, 7000);
  const cam = new THREE.PerspectiveCamera(66, W / H, 0.5, 60000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const SUN_DIR = dirV(-32 * DEG, 8 * DEG);

  // --- sky: golden hour; haze, smoke and a red sun later
  const skyU = { top: { value: lin('#6f7fc0') }, hor: { value: lin('#f6c890') }, sunDir: { value: SUN_DIR.clone() }, sunCol: { value: lin('#fff0c8') }, sunK: { value: 1 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(50000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunK; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.1, 1.0); vec3 c = mix(hor, top, smoothstep(0.0, 0.5, pow(max(h, 0.0), 0.7)));
        float s = max(dot(d, sunDir), 0.0); c += sunCol * sunK * (smoothstep(0.99955, 0.9997, s) * 3.0 + pow(s, 60.0) * 0.5 + pow(s, 8.0) * 0.18);
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  const cloudTex = texCloud(); const clouds = []; { const R = RNG('cloudsH'); for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.6 }));
    s.userData = { x: R.r(-16000, 12000), z: R.r(-30000, -12000), y: R.r(2200, 5000), w: R.r(5000, 10000), a: R.r(0.18, 0.3), o: R.r(0.35, 0.6) }; s.renderOrder = -2; scene.add(s); clouds.push(s); } }
  const hemi = new THREE.HemisphereLight(0xc8d0f0, 0x8a6a50, 0.85); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd8a8, 2.6); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  Object.assign(sun.shadow.camera, { left: -800, right: 800, top: 800, bottom: -800, near: 10, far: 5000 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.5;
  sun.target.position.set(40, 0, -450); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 2400); sun.target.updateMatrixWorld();
  const fireLight = new THREE.PointLight(0xff7a30, 0, 900, 1.2); fireLight.position.set(60, 40, -200); scene.add(fireLight);

  // --- ground: sand, the fair's grass, the hotels' paving, pine hills
  { const g = new THREE.PlaneGeometry(16000, 16000, 360, 360).rotateX(-Math.PI / 2).translate(0, 0, -3500), p = g.attributes.position, cols = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = groundH(x, z), s = shoreAt(z); p.setY(i, y); const inl = x - s, hk = hsh(Math.floor(x / 30) + Math.floor(z / 30) * 97);
      const c = inl < 0 ? lin('#8a7a5a') : inl < 8 ? lin('#b8a07a') : x < BOARD_X0 + 2 && z > -1250 ? C3('#ecd6a6', '#e0c898', hk) : hillH(x, z) > 3 ? C3('#6a7a3a', '#7a8644', hk) : (x > 52 && x < 170 && z < -140 && z > -450) ? C3('#7f9a46', '#94a656', hk) : C3('#c8beae', '#b8ae9c', hk);
      cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const gr = new THREE.Mesh(g, natMat({ vertexColors: true, roughness: 0.95 }, 0.45, 0.8)); gr.receiveShadow = true; scene.add(gr); }
  // the sea: sky reflection, ripples, the sun's glint, waves at the shore; boils from the shore outward, steams
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uTop: { value: lin('#6f7fc0') }, uHor: { value: lin('#f6c890') }, uSunDir: { value: SUN_DIR.clone() }, uSunCol: { value: lin('#ffe0a8') }, uBody: { value: lin('#1e5a6e') }, uBoil: { value: 0 }, uGlow: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uBoil, uGlow; uniform vec3 uTop, uHor, uBody, uSunDir, uSunCol; varying vec3 vW;
      #include <fog_pars_fragment>
      float nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }
      float shoreAt(float z){ return ${SHORE_X.toFixed(1)} - max(0.0, -1250.0 - z) * 0.9; }
      void main(){ vec2 p = vW.xz; float t = uT; float d = shoreAt(p.y) - p.x;
        float front = uBoil * 2600.0, bk = smoothstep(front, front - 120.0, d) * step(0.001, uBoil);
        float ch = 1.0 + 3.0 * bk;
        vec3 n = normalize(vec3(0.05 * sin(p.x * 0.07 + t * 0.9) + 0.03 * sin(p.x * 0.23 - p.y * 0.13 + t * 1.4) + bk * 0.25 * (vn(p * 0.9 + t * 3.0) - 0.5), 1.0, 0.05 * sin(p.y * 0.05 - t * 0.7) + 0.03 * sin(p.y * 0.21 + p.x * 0.1 - t) + bk * 0.25 * (vn(p * 0.9 - t * 2.7 + 9.0) - 0.5)));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 col = mix(uBody, mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.5)), clamp(fres * 0.9 + 0.12, 0.0, 0.85));
        col += uSunCol * (pow(max(dot(Rf, uSunDir), 0.0), 220.0) * 2.2 + pow(max(dot(Rf, uSunDir), 0.0), 18.0) * 0.18);
        float wave = smoothstep(4.0, 0.0, d) + smoothstep(0.6, 1.0, sin(d * 0.35 - t * 1.6)) * smoothstep(30.0, 4.0, d) * 0.5;
        float bub = (smoothstep(0.8, 0.92, vn(p * 1.3 + vec2(t * 2.3, -t * 1.9))) * 0.7 + smoothstep(0.86, 0.96, vn(p * 3.2 - t * 4.0))) * bk;
        col = mix(col, vec3(0.92, 0.94, 0.95), clamp(wave * 0.7 + bub * 0.7, 0.0, 1.0));
        col = mix(col, vec3(0.52, 0.58, 0.58), bk * 0.18);
        col += vec3(0.6, 0.08, 0.01) * uGlow * 0.1;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000).rotateX(-Math.PI / 2).translate(-8000, 0, -8000), seaMat); sea.position.y = SEA_Y; scene.add(sea);

  // --- the boardwalk (planks), the road (asphalt that softens), the sidewalk
  const woodTex = wrap(g3Tex((x, w, h) => { const R = RNG('planks'); for (let k = 0; k < 16; k++) { const v = R.r(0.85, 1.1); x.fillStyle = `rgb(${168 * v},${126 * v},${86 * v})`; x.fillRect(0, k * h / 16, w, h / 16 - 1.5); } x.fillStyle = 'rgba(60,40,24,0.6)'; for (let k = 0; k < 16; k++) x.fillRect(0, k * h / 16 + h / 16 - 1.5, w, 1.5); speck(x, w, h, 3000, ['rgba(80,50,30,0.15)', 'rgba(255,230,190,0.1)'], R, 1, 3); }, 128, 256));
  const BL0 = 100, BL1 = -1240, BLEN = BL0 - BL1;
  const board = new THREE.Mesh(new THREE.BoxGeometry(BOARD_X1 - BOARD_X0, 0.6, BLEN), natMat({ map: woodTex, roughness: 0.85 }, 1)); board.material.map.repeat.set(1, BLEN / 16); board.position.set((BOARD_X0 + BOARD_X1) / 2, 0.3, (BL0 + BL1) / 2); board.receiveShadow = true; board.castShadow = true; scene.add(board);
  const asphTex = wrap(g3Tex((x, w, h) => { const R = RNG('asphH'); x.fillStyle = '#4c4c4e'; x.fillRect(0, 0, w, h); speck(x, w, h, 16000, ['rgba(20,20,22,0.3)', 'rgba(160,160,160,0.15)'], R, 1, 3);
    x.fillStyle = 'rgba(240,240,236,0.9)'; x.fillRect(w * 0.04, 0, 3, h); x.fillRect(w * 0.94, 0, 3, h); for (let v = 0; v < h; v += 64) x.fillRect(w * 0.49, v, 4, 32); }, 256, 512));
  const roadMat = natMat({ map: asphTex, roughness: 0.9, color: 0xffffff }, 0.8);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_X1 - ROAD_X0, BLEN).rotateX(-Math.PI / 2), roadMat); road.material.map.repeat.set(1, BLEN / 60); road.position.set((ROAD_X0 + ROAD_X1) / 2, 0.06, (BL0 + BL1) / 2); road.receiveShadow = true; scene.add(road);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, BLEN), natMat({ color: 0xd8d0c0, roughness: 0.9 })); walk.position.set(ROAD_X1 + 2, 0.15, (BL0 + BL1) / 2); walk.receiveShadow = true; scene.add(walk);

  // shared builders
  const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo.clone(); g2.applyMatrix4(m4); g2.computeVertexNormals();
      const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.6 + 0.4 * clamp(n.getY(i) * 0.5 + 0.5) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
  const profile = (P, w, bevel = 0.06) => { const sh = new THREE.Shape(P.map(([x, y]) => new THREE.Vector2(x, y))); const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 }); g.translate(0, 0, -w / 2); return g; };
  const add = (geo, mat, x, y, z, parent = scene, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const steelW = natMat({ color: 0xeef0f2, roughness: 0.45, metalness: 0.35 }, 0.8), steelR = natMat({ color: 0xc8372d, roughness: 0.5, metalness: 0.3 }, 0.8), steelB = natMat({ color: 0x6a7c8c, roughness: 0.5, metalness: 0.4 }, 0.8);

  // --- palms along the boardwalk; pines on the hills and in the gardens
  const palmG = mergeG([[new THREE.CylinderGeometry(0.28, 0.45, 11, 6).translate(0, 5.5, 0), M4c(0, 0, 0, 0, 1, 1, 1, 0, 0.06), '#8a7258', 0], ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => [new THREE.ConeGeometry(0.7, 5.5, 4).rotateX(Math.PI / 2).translate(0, 0, 2.7), M4c(0.6, 11, 0, k / 8 * TAU, 1, 0.3, 1, 0.45), '#4a7a2e', 1])]);
  const PALMS = []; for (let z = 5; z > -1200; z -= 15) PALMS.push([BOARD_X1 + 1.2, z + (hsh(z) - 0.5) * 3]);
  const palms = IM(palmG, natMat({ vertexColors: true, roughness: 0.9 }, 1, 1), PALMS.length); palms.instanceMatrix.setUsage(THREE.DynamicDrawUsage); PALMS.forEach(([x, z], i) => palms.setMatrixAt(i, M4c(x, 0.3, z, i, 1, 1 + hsh(i, 3) * 0.3, 1))); scene.add(palms);
  const pineG = mergeG([[new THREE.CylinderGeometry(0.3, 0.5, 7, 6).translate(0, 3.5, 0), M4c(0, 0, 0), '#5a4430', 0], ...[0, 1, 2].map((k) => [new THREE.IcosahedronGeometry(3.4 - k * 0.7, 1).scale(1.5, 0.55, 1.5), M4c(0, 7 + k * 1.7, 0), k ? '#3e6a2e' : '#36602a', 1])]);
  const PINES = []; { const R = RNG('pinesH'); for (let i = 0; i < 30000 && PINES.length < 1500; i++) { const x = R.r(-1800, 1600), z = R.r(-2600, 120), h = hillH(x, z), inl = x - shoreAt(z); if (inl < 60 || (h < 4 && !(inl > 140 && R.f() < 0.15))) continue; if (x < 175 && z > -1200) continue; PINES.push([x, groundH(x, z), z, R.r(1.0, 2.2)]); } }
  const pines = IM(pineG, natMat({ vertexColors: true, roughness: 0.9 }, 1, 1), PINES.length); pines.instanceMatrix.setUsage(THREE.DynamicDrawUsage); pines.frustumCulled = false; PINES.forEach(([x, y, z, s], i) => pines.setMatrixAt(i, M4c(x, y, z, i, s, s, s))); scene.add(pines);

  // --- hotels and apartments: stucco facades with balconies, flat roofs
  const stTex = texStucco(); wrap(stTex); stTex.anisotropy = ANI;
  const hotMat = natMat({ color: 0xffffff, roughness: 0.85 }, 0.6); { const prev = hotMat.onBeforeCompile; hotMat.onBeforeCompile = (sh) => { prev(sh); sh.uniforms.uFac = { value: stTex };
    sh.vertexShader = 'varying vec2 vFac; varying float vTop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + vec3(0.5, 0.0, 0.5)) * sc; vTop = step(0.5, normal.y); vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : (vTop > 0.5 ? lp.xz : vec2(lp.x, lp.y)); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, 0.0);`);
    sh.fragmentShader = 'uniform sampler2D uFac; varying vec2 vFac; varying float vTop;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= vTop > 0.5 ? vec3(0.78, 0.74, 0.68) : texture2D(uFac, vFac).rgb;'); }; }
  const HOT = []; { const R = RNG('hotelsH'); const ok = (x, z, w, d) => !HOT.some((b) => Math.abs(b.x - x) < (b.sx + w) / 2 + 6 && Math.abs(b.z - z) < (b.sz + d) / 2 + 6);
    for (let i = 0; i < 20000 && HOT.length < 260; i++) { const x = R.r(62, 900), z = R.r(-1240, 160), w = R.r(20, 44), d = R.r(16, 30); if (x - w / 2 < ROAD_X1 + 8) continue; if (x < 175 + w / 2 && z < -135 && z > -460) continue; if (x < 125 && z > -470) continue; if (Math.abs(x - STATION_P.x) < 40 && Math.abs(z - STATION_P.z) < 30) continue; if (hillH(x, z) > 2) continue; if (!ok(x, z, w, d)) continue;
      HOT.push({ x, z, sx: w, sz: d, h: R.r(16, 40) * (1 + 0.8 * ss(120, 300, x)) * (x < 100 ? 0.7 : 1), c: R.pick(['#fff4e8', '#f6d8b8', '#f0e0c8', '#dce4ea', '#f4c8b0', '#e8d0e0', '#fbe8b0']) }); } }
  const hot = IM(box(1, 1, 1).translate(0, 0.5, 0), hotMat, HOT.length); HOT.forEach((b, i) => { hot.setMatrixAt(i, M4c(b.x, GY - 0.2, b.z, 0, b.sx, b.h, b.sz)); hot.setColorAt(i, lin(b.c)); }); scene.add(hot);

  // --- the fair: Ferris wheel, carousel, circus tent, bouncy castle, stalls with awnings, string lights, balloons
  const wheel = new THREE.Group(); wheel.position.set(WHEEL_P.x, GY, WHEEL_P.z); scene.add(wheel); const WR = 34, HUB = WR + 7;
  const cabins = [], rot = new THREE.Group(); rot.position.y = HUB; wheel.add(rot);
  { for (const zz of [-1.6, 1.6]) { const rim = add(new THREE.TorusGeometry(WR, 0.55, 6, 72), steelW, 0, 0, zz, rot); const rim2 = add(new THREE.TorusGeometry(WR * 0.82, 0.3, 5, 64), steelW, 0, 0, zz, rot); }
    for (let k = 0; k < 24; k++) for (const zz of [-1.6, 1.6]) { const sp = add(box(0.25, WR, 0.25).translate(0, WR / 2, 0), steelW, 0, 0, zz, rot, false); sp.rotation.z = k / 24 * TAU; }
    add(new THREE.CylinderGeometry(1.6, 1.6, 4.4, 12).rotateX(Math.PI / 2), steelB, 0, 0, 0, rot);
    for (const sx of [-1, 1]) for (const zz of [-3.5, 3.5]) { const lg = add(box(1.1, HUB + 3, 1.1), steelB, sx * 11, HUB / 2, zz, wheel); lg.rotation.z = sx * 0.27; lg.rotation.x = -Math.sign(zz) * 0.06; }
    const CC = ['#c8372d', '#2f6fb0', '#f0b43a', '#3a8a5a', '#e86ab0', '#5ab0d8'];
    for (let k = 0; k < 24; k++) { const cb = new THREE.Group(); const body = add(new THREE.CylinderGeometry(1.5, 1.3, 2.4, 8), natMat({ color: lin(CC[k % 6]), roughness: 0.5 }, 0.8), 0, -2.2, 0, cb); add(new THREE.ConeGeometry(1.7, 0.9, 8), steelW, 0, -0.6, 0, cb); wheel.add(cb); cabins.push(cb); } }
  const bulbTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,190,0.85)'], [0.5, 'rgba(255,180,90,0.25)'], [1, 'rgba(255,160,80,0)']], 64);
  const bulbP = []; for (let k = 0; k < 96; k++) { const a = k / 96 * TAU; bulbP.push(Math.cos(a) * WR, Math.sin(a) * WR, 1.8); } for (let k = 0; k < 24; k++) for (let j = 1; j < 6; j++) { const a = k / 24 * TAU; bulbP.push(Math.cos(a) * WR * j / 6, Math.sin(a) * WR * j / 6, 1.8); }
  const wheelBulbs = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(bulbP, 3)), new THREE.PointsMaterial({ size: 1.4, map: bulbTex, color: 0xffd8a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); rot.add(wheelBulbs);
  // carousel
  const carousel = new THREE.Group(); carousel.position.set(70, GY, -330); scene.add(carousel);
  { const roofT = texStripes('#d8372d', '#f6efe0', 16); add(new THREE.CylinderGeometry(10, 10, 1.2, 32), natMat({ color: 0xe8d8b8, roughness: 0.7 }, 1), 0, 0.6, 0, carousel); const spin = new THREE.Group(); carousel.add(spin);
    add(new THREE.ConeGeometry(11.5, 5, 32, 1, true), natMat({ map: roofT, roughness: 0.7, side: THREE.DoubleSide }, 1), 0, 9.5, 0, spin); add(new THREE.CylinderGeometry(11.5, 11.5, 1.2, 32, 1, true), natMat({ map: roofT, roughness: 0.7, side: THREE.DoubleSide }, 1), 0, 6.6, 0, spin);
    add(new THREE.CylinderGeometry(1.2, 1.2, 7, 12), natMat({ color: 0xf0c060, roughness: 0.4, metalness: 0.4 }, 1), 0, 4, 0, spin);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; add(new THREE.CylinderGeometry(0.1, 0.1, 6, 5), natMat({ color: 0xf0c060, metalness: 0.6, roughness: 0.3 }), Math.cos(a) * 8, 4, Math.sin(a) * 8, spin, false); const hz = add(box(0.6, 1.2, 2.0), natMat({ color: lin(['#f6f2ea', '#c8372d', '#2f6fb0', '#f0b43a'][k % 4]), roughness: 0.6 }, 1), Math.cos(a) * 8, 2.6 + (k % 2) * 0.6, Math.sin(a) * 8, spin); hz.rotation.y = -a; }
    carousel.userData.spin = spin; }
  // circus tent
  const tent = new THREE.Group(); tent.position.set(130, GY, -300); scene.add(tent);
  { const tT = texStripes('#d8261e', '#f8f4ec', 24); wrap(tT, 1, 1); add(new THREE.CylinderGeometry(17, 17, 8, 40, 1, true), natMat({ map: tT, roughness: 0.8, side: THREE.DoubleSide }, 1), 0, 4, 0, tent); const roof = add(new THREE.ConeGeometry(18.5, 15, 40, 1, true), natMat({ map: tT, roughness: 0.8, side: THREE.DoubleSide }, 1), 0, 15.5, 0, tent); roof.userData.base = 15.5;
    add(new THREE.CylinderGeometry(0.2, 0.2, 6, 5), steelW, 0, 25, 0, tent); add(box(0.1, 1.6, 2.6).translate(0, 0, 1.3), natMat({ color: 0xf0c040 }), 0, 27, 0, tent); tent.userData.roof = roof; }
  // bouncy castle (plastic: it slumps when it melts)
  const castle = new THREE.Group(); castle.position.set(74, GY, -180); scene.add(castle);
  { const pv = (c) => natMat({ color: lin(c), roughness: 0.55 }, 1); add(box(14, 3, 12).translate(0, 1.5, 0), pv('#2f6fd0'), 0, 0, 0, castle); add(box(14, 5, 1.2).translate(0, 2.5, 0), pv('#f0c020'), 0, 3, -5.4, castle);
    for (const [x, z] of [[-6.5, -5.5], [6.5, -5.5], [-6.5, 5.5], [6.5, 5.5]]) { add(new THREE.CylinderGeometry(1.4, 1.4, 9, 12).translate(0, 4.5, 0), pv('#e8352a'), x, 0, z, castle); add(new THREE.ConeGeometry(1.8, 3, 12), pv('#3ab060'), x, 10.5, z, castle); } }
  // stalls: two rows along the fair's path, striped awnings
  const STALLS = []; for (let z = -160; z > -440; z -= 12.5) for (const x of [64, 98]) if (!(Math.abs(z + 330) < 16 && x < 90) && !(Math.abs(z + 180) < 12 && x < 90) && !(Math.abs(z + 250) < 14)) STALLS.push({ x, z, s: x < 80 ? 1 : -1, k: STALLS.length % 3 });
  const stallB = IM(box(7, 3.2, 5).translate(0, 1.6, 0), natMat({ roughness: 0.8 }, 1), STALLS.length); STALLS.forEach((s, i) => { stallB.setMatrixAt(i, M4c(s.x, GY, s.z)); stallB.setColorAt(i, lin(['#f2ead8', '#e8c890', '#d8e0e8', '#c8a070'][i % 4])); }); scene.add(stallB);
  const awnings = [['#d8261e', '#f8f4ec'], ['#2f6fb0', '#f8f4ec'], ['#f0b020', '#f8f4ec']].map((cc, k) => { const list = STALLS.filter((s) => s.k === k); const m = IM(box(7.6, 0.2, 3.4).translate(0, 0, 1.7), natMat({ map: texStripes(cc[0], cc[1], 10), roughness: 0.8 }, 1), list.length); list.forEach((s, i) => m.setMatrixAt(i, M4c(s.x + s.s * 2.4, 3.6, s.z, s.s > 0 ? Math.PI / 2 : -Math.PI / 2, 1, 1, 1, 0.35))); scene.add(m); return m; });
  // string lights: catenaries crossing the fair path, warm bulbs
  const SL = []; for (let z = -165; z > -440; z -= 12.5) if (Math.abs(z + 250) > 14) for (let k = 0; k <= 16; k++) { const u = k / 16, x = lerp(66, 96, u), y = 6.5 - 2.2 * Math.sin(Math.PI * u), zz = z - 6 * u; SL.push(x, y, zz); }
  for (let z = -160; z > -440; z -= 25) for (let k = 0; k < 14; k++) { const u = k / 14; SL.push(lerp(66, 96, u) * 0 + 66 + 30 * ((k * 0.37) % 1), 7.5 + Math.sin(u * 9) * 0.6, z - 12.5 * u); }
  const strLights = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(SL, 3)), new THREE.PointsMaterial({ size: 1.1, map: bulbTex, color: 0xffd090, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); strLights.renderOrder = 6; scene.add(strLights);
  const poleI = IM(new THREE.CylinderGeometry(0.12, 0.15, 8, 5).translate(0, 4, 0), natMat({ color: 0x3a3e44, metalness: 0.4 }, 1), 46); { let k = 0; for (let z = -160; z > -440; z -= 12.5) for (const x of [66, 96]) if (k < 46 && Math.abs(z + 250) > 14) poleI.setMatrixAt(k++, M4c(x, GY, z)); poleI.count = k; } scene.add(poleI);
  // balloons: clusters at the vendors and on the beach
  const BAL = []; { const R = RNG('balloons'); const spots = [[70, -200], [92, -290], [70, -370], [28, -120], [28, -60], [92, -410], [30, -10], [24, 42], [10, 58], [29, 20]]; spots.forEach(([x, z], j) => { for (let k = 0; k < 14; k++) BAL.push({ x: x + R.n(0.9), y: 5.2 + R.r(0, 2.2), z: z + R.n(0.9), c: R.pick(['#e8352a', '#2f6fd0', '#f0c020', '#3ab060', '#e86ab0', '#ffffff', '#f07a20']), t0: T_BURST + R.r(0, 1.6), j }); }); }
  const balloons = IM(new THREE.SphereGeometry(0.55, 10, 8).scale(1, 1.2, 1), STD({ roughness: 0.25, metalness: 0.05 }), BAL.length, false); BAL.forEach((b, i) => balloons.setColorAt(i, lin(b.c))); balloons.instanceMatrix.setUsage(THREE.DynamicDrawUsage); balloons.frustumCulled = false; scene.add(balloons);

  // --- the gas station: canopy, pumps, the shop, a tall price sign
  const station = new THREE.Group(); station.position.set(STATION_P.x, GY, STATION_P.z); scene.add(station);
  const canopy = new THREE.Group(); station.add(canopy);
  { add(box(24, 1.4, 15), natMat({ color: 0xf4f4f0, roughness: 0.6 }, 1), 0, 6.8, 0, canopy); add(box(24.2, 0.6, 15.2), natMat({ color: 0xd8261e, roughness: 0.5 }, 1), 0, 6.1, 0, canopy);
    for (const [x, z] of [[-8, -4], [8, -4], [-8, 4], [8, 4]]) add(box(0.6, 6, 0.6).translate(0, 3, 0), natMat({ color: 0xe8e8e4 }, 1), x, 0, z, station);
    for (const [x, z] of [[-8, -4], [8, -4], [-8, 4], [8, 4]]) add(box(1.2, 1.9, 0.8).translate(0, 0.95, 0), natMat({ color: 0xd8261e, roughness: 0.5 }, 1), x + 2, 0, z, station);
    add(box(14, 5, 9).translate(0, 2.5, 0), natMat({ color: 0xece6da, roughness: 0.8 }, 1), 20, 0, 2, station); add(box(14.2, 1, 9.2), natMat({ color: 0xd8261e }, 1), 20, 4.6, 2, station);
    add(box(0.8, 13, 0.8).translate(0, 6.5, 0), steelB, -15, 0, 8, station); add(box(5, 6, 0.6), natMat({ color: 0xf4f4f0, emissive: 0xffffff, emissiveIntensity: 0.15 }, 1), -15, 15, 8, station); add(box(5.1, 1.5, 0.7), natMat({ color: 0xd8261e }, 1), -15, 17.4, 8, station); }

  // --- the kiosk on the boardwalk, with its popcorn machine
  const kiosk = new THREE.Group(); kiosk.position.set(KIOSK_P.x, 0.6, KIOSK_P.z); scene.add(kiosk);
  { add(box(4, 2.6, 3).translate(0, 1.3, 0), natMat({ color: 0xf2e6cc, roughness: 0.7 }, 1), 0, 0, 0, kiosk); add(box(4.6, 0.3, 3.8).translate(0, 0, 0.3), natMat({ map: texStripes('#d8261e', '#f8f4ec', 8), roughness: 0.8 }, 1), 0, 2.9, 0, kiosk);
    add(box(1.4, 1.3, 1.1).translate(0, 0.65, 0), new THREE.MeshStandardMaterial({ color: 0xfff2c0, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.55, emissive: 0xffc860, emissiveIntensity: 0.25 }), -0.8, 1.0, 1.6, kiosk);
    add(box(1.6, 0.25, 1.3), natMat({ color: 0xd8261e }, 1), -0.8, 2.4, 1.6, kiosk); }
  const POP = []; { const R = RNG('popcorn'); for (let i = 0; i < 360; i++) POP.push({ t0: T_POP + R.r(0, 1.8), vx: R.n(4), vy: R.r(6, 15), vz: R.n(4) + 1, s: R.r(0.22, 0.38), ry: R.r(0, 6) }); }
  const popcorn = IM(new THREE.IcosahedronGeometry(1, 0), STD({ color: 0xfff6e0, roughness: 0.8 }), POP.length, false); popcorn.instanceMatrix.setUsage(THREE.DynamicDrawUsage); popcorn.frustumCulled = false; scene.add(popcorn);

  // --- the beach: umbrellas, towels, loungers, kayaks, beach balls, two lifeguard towers
  const UMB = [], TOW = [], LOU = [], KAY = [], BALLS = []; { const R = RNG('beachH');
    for (let i = 0; i < 4000 && UMB.length < 210; i++) { const x = R.r(SHORE_X + 10, BOARD_X0 - 3), z = R.r(-1150, 70); if (UMB.some((u) => Math.hypot(u.x - x, u.z - z) < 7)) continue; UMB.push({ x, z, c: R.pick(['#e8352a', '#2f6fd0', '#f0c020', '#3ab060', '#f6f2ea', '#e86ab0', '#f07a20', '#5ab0d8']), tilt: R.n(0.08), t: R.f() }); }
    UMB.forEach((u) => { if (R.f() < 0.8) TOW.push({ x: u.x + R.r(-2, 2), z: u.z + R.r(1.5, 3.5), ry: R.r(-0.3, 0.3), c: R.pick(['#e8352a', '#2f6fd0', '#f0c020', '#3ab060', '#e86ab0', '#5ab0d8', '#f6f2ea', '#8a3ab0']) }); if (R.f() < 0.25) LOU.push({ x: u.x + 2.5, z: u.z - 1, ry: R.r(-0.2, 0.2) }); });
    for (let i = 0; i < 16; i++) KAY.push({ x: SHORE_X + R.r(2, 9), z: R.r(-700, 40), ry: R.r(-0.3, 0.3) + Math.PI / 2, c: R.pick(['#f0c020', '#e8352a', '#3ab0e0', '#f07a20']) });
    for (let i = 0; i < 40; i++) BALLS.push({ x: R.r(SHORE_X + 6, BOARD_X0 - 4), z: R.r(-600, 75), t0: T_BURST + R.r(0, 1.5) }); }
  const umbPole = IM(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5).translate(0, 1.3, 0), natMat({ color: 0xe8e8e4 }, 1), UMB.length);
  const umbTop = IM(new THREE.ConeGeometry(1.9, 0.75, 10, 1, true).translate(0, 2.7, 0), natMat({ roughness: 0.8, side: THREE.DoubleSide }, 1), UMB.length);
  UMB.forEach((u, i) => { umbTop.setColorAt(i, lin(u.c)); }); [umbPole, umbTop].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); });
  const towels = IM(box(1, 0.05, 1.9), natMat({ roughness: 0.9 }, 1), TOW.length, false); TOW.forEach((w, i) => { towels.setMatrixAt(i, M4c(w.x, groundH(w.x, w.z) + 0.05, w.z, w.ry)); towels.setColorAt(i, lin(w.c)); }); towels.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(towels);
  const loungeG = mergeG([[box(0.7, 0.12, 1.4), M4c(0, 0.35, 0.2), '#f6f6f2', 1], [box(0.7, 0.12, 0.8), M4c(0, 0.6, -0.75, 0, 1, 1, 1, -0.7), '#f6f6f2', 1], [box(0.08, 0.35, 0.08).translate(0, 0.17, 0), M4c(-0.3, 0, 0.8), '#e8e8e4', 0], [box(0.08, 0.35, 0.08).translate(0, 0.17, 0), M4c(0.3, 0, 0.8), '#e8e8e4', 0]]);
  const lounge = IM(loungeG, natMat({ vertexColors: true, roughness: 0.6 }, 1), LOU.length, false); LOU.forEach((l, i) => lounge.setMatrixAt(i, M4c(l.x, groundH(l.x, l.z), l.z, l.ry))); lounge.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(lounge);
  const kayaks = IM(new THREE.SphereGeometry(1, 10, 6).scale(2.2, 0.3, 0.4), natMat({ roughness: 0.4 }, 1), KAY.length); KAY.forEach((k, i) => { kayaks.setMatrixAt(i, M4c(k.x, groundH(k.x, k.z) + 0.2, k.z, k.ry)); kayaks.setColorAt(i, lin(k.c)); }); kayaks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(kayaks);
  const ballTex = texStripes('#e8352a', '#f8f8f4', 6); const balls = IM(new THREE.SphereGeometry(0.4, 12, 8), STD({ map: ballTex, roughness: 0.4 }), BALLS.length, false); BALLS.forEach((b, i) => balls.setMatrixAt(i, M4c(b.x, groundH(b.x, b.z) + 0.4, b.z, i))); balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(balls);
  const LIFE = [[-4, -90], [-6, -520]]; const lifeG = mergeG([...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => [box(0.25, 4, 0.25).translate(0, 2, 0), M4c(x, 0, z), '#c8a070', 0]), [box(2.6, 0.2, 2.6), M4c(0, 4, 0), '#c8a070', 1], [box(2.4, 2, 2.4).translate(0, 1, 0), M4c(0, 4.1, 0), '#e8352a', 1], [new THREE.ConeGeometry(2.2, 1.2, 4).rotateY(Math.PI / 4), M4c(0, 6.7, 0), '#f6f2ea', 1]]);
  const life = IM(lifeG, natMat({ vertexColors: true, roughness: 0.8 }, 1), LIFE.length); LIFE.forEach(([x, z], i) => life.setMatrixAt(i, M4c(x, groundH(x, z), z, -0.2))); scene.add(life);

  // --- people (beach, boardwalk, fair), cars (driving, parked)
  const FOLK = []; { const R = RNG('folkH'); for (let i = 0; i < 700; i++) { const zone = R.f(); let x, z, lie = false;
      if (zone < 0.5) { const u = R.pick(UMB); x = u.x + R.r(-3, 3); z = u.z + R.r(-1, 4); lie = R.f() < 0.35; } else if (zone < 0.62) { x = SHORE_X + R.r(-6, 3); z = R.r(-900, 60); } else if (zone < 0.8) { x = R.r(BOARD_X0 + 0.5, BOARD_X1 - 0.5); z = R.r(-1100, 80); } else { x = R.r(68, 94); z = R.r(-440, -160); }
      FOLK.push({ x, z, lie, v: R.r(0.6, 1.4) * (R.f() < 0.5 ? 1 : -1), ph: R.r(0, 6), top: R.pick(['#e8e4dc', '#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#2a2a30', '#f2d24a', '#e86ab0', '#5ab0d8']), skin: R.pick(['#e8b898', '#c88a68', '#8a5a40', '#f0c8a8']), s: R.r(0.88, 1.08), run: R.r(4, 6.5), dir: x < 30 ? 1 : R.f() < 0.5 ? 1 : -1, t1: 5 + R.r(0, 2.6) }); } }
  const folkB = IM(new THREE.CapsuleGeometry(0.24, 0.95, 3, 6).translate(0, 0.78, 0), STD({ roughness: 0.8 }), FOLK.length, false), folkH = IM(new THREE.SphereGeometry(0.17, 8, 6).translate(0, 1.66, 0), STD({ roughness: 0.8 }), FOLK.length, false);
  FOLK.forEach((f, i) => { folkB.setColorAt(i, lin(f.top)); folkH.setColorAt(i, lin(f.skin)); }); [folkB, folkH].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  const carShell = profile([[-2.2, 0.32], [2.2, 0.32], [2.25, 0.62], [2.05, 0.82], [1.1, 0.9], [-2.0, 0.92], [-2.25, 0.7]], 1.62), carGlass = profile([[1.05, 0.9], [0.35, 1.38], [-1.2, 1.4], [-1.75, 0.92]], 1.5);
  const CARS = []; { const R = RNG('carsH'); const cols = ['#f2c400', '#d8261e', '#f4f4f0', '#16161a', '#b8bcc4', '#f07a20', '#2a5ac8', '#2e9a4a', '#8a1e2a', '#5ab0d8', '#f4f4f0', '#c8c8c0'];
    for (let i = 0; i < 48; i++) { const lane = i % 2; CARS.push({ x: lane ? 46 : 39.5, z0: R.r(-1150, 95), v: lane ? -R.r(8, 12) : R.r(8, 12), c: cols[i % 12], park: false, t0: T_FUEL + R.r(0, 4) }); }
    for (let z = 90; z > -1150; z -= R.r(7, 16)) if (Math.abs(z - STATION_P.z) > 20 && R.f() < 0.7) CARS.push({ x: 52.5, z0: z, v: 0, c: R.pick(cols), park: true, t0: T_FUEL + R.r(0, 4) });
    for (const [dx, dz] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) CARS.push({ x: STATION_P.x + dx, z0: STATION_P.z + dz, v: 0, c: R.pick(cols), park: true, station: true, t0: T_STATION }); }
  const paint = natMat({ roughness: 0.4, metalness: 0.15 }, 1), glassM = natMat({ color: 0x1e2830, roughness: 0.1, metalness: 0.7 }, 1);
  const carBody = IM(carShell, paint, CARS.length), carTop = IM(carGlass, glassM, CARS.length), wheels = IM(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12).rotateX(Math.PI / 2), STD({ color: 0x16161a, roughness: 0.8 }), CARS.length * 4);
  CARS.forEach((c, i) => carBody.setColorAt(i, lin(c.c))); [carBody, carTop, wheels].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });

  // --- sailboats (hull + mast; sails apart so they can burn away)
  const hullG = mergeG([[profile([[-4, 0.2], [4.6, 0.6], [3.6, -0.6], [-3.6, -0.6]], 2.4, 0.15), M4c(0, 0, 0), '#f6f6f2', 1], [box(4, 0.6, 1.6), M4c(-0.6, 0.85, 0), '#e8e4dc', 1], [new THREE.CylinderGeometry(0.08, 0.1, 11, 5).translate(0, 5.5, 0), M4c(0.4, 0.6, 0), '#d8d8d8', 0]]);
  const sailG = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0.5, 1.6, 0, 0.5, 11.2, 0, -3.6, 1.6, 0, 0.6, 10.6, 0, 0.6, 1.5, 0, 4.3, 1.0, 0], 3)); g.computeVertexNormals(); return g; })();
  const BOATS = []; { const R = RNG('boatsH'); for (let i = 0; i < 400 && BOATS.length < 34; i++) { const z = R.r(-1250, -40), x = shoreAt(z) - R.r(25, 700); if (z < PORT_Z0 + 40 && z > PORT_Z1 - 60 && x > QUAY_X - 80) continue; if (Math.abs(z - PIER_Z) < 18) continue; if (BOATS.some((b) => Math.hypot(b.x - x, b.z - z) < 25)) continue; BOATS.push({ x, z, ry: R.r(0, TAU), v: R.r(0.5, 1.6), s: R.r(0.9, 1.5), c: R.pick(['#ffffff', '#ffffff', '#f6e6c8', '#e8352a', '#2f6fd0']), t0: T_WOOD + R.r(-3, 2) }); } }
  const hulls = IM(hullG, natMat({ vertexColors: true, roughness: 0.6 }, 1), BOATS.length), sails = IM(sailG, natMat({ roughness: 0.8, side: THREE.DoubleSide }, 1), BOATS.length);
  BOATS.forEach((b, i) => sails.setColorAt(i, lin(b.c))); [hulls, sails].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });

  // --- the steel pier: deck segments on braced legs, lamps, a pavilion at the end
  const PIER = []; { const n = 12, L = (BOARD_X0 + 260) / n; for (let k = 0; k < n; k++) { const s = new THREE.Group(), x = BOARD_X0 - (k + 0.5) * L; s.position.set(x, 7, PIER_Z); scene.add(s);
      add(box(L - 0.2, 0.8, 10), natMat({ map: woodTex, roughness: 0.85 }, 1), 0, 0, 0, s); for (const sz of [-1, 1]) add(box(L - 0.2, 1.1, 0.25), steelW, 0, 1, sz * 4.9, s);
      for (const sz of [-1, 1]) { const lg = add(box(0.7, 16, 0.7).translate(0, -8, 0), steelB, -L / 2, 0, sz * 4.4, s); const br = add(box(0.3, Math.hypot(L, 12), 0.3), steelB, 0, -6, sz * 4.4, s); br.rotation.z = Math.atan2(L, 12); }
      if (k % 2) { add(new THREE.CylinderGeometry(0.1, 0.12, 5, 5).translate(0, 2.5, 0), steelB, 0, 0.4, 4.6, s, false); }
      PIER.push({ s, k, x, sp: (hsh(k, 5) - 0.5) * 2 }); }
    const end = PIER[n - 1].s; add(box(16, 6, 14).translate(0, 3, 0), natMat({ color: 0xf2ece0, roughness: 0.7 }, 1), -6, 0.4, 0, end); add(new THREE.ConeGeometry(12, 5, 4).rotateY(Math.PI / 4), natMat({ color: 0x2f6fb0, roughness: 0.6 }, 1), -6, 8.9, 0, end); }

  // --- the port: quay, containers, a moored ship, three gantry cranes, a breakwater with a lighthouse
  const quayW = SHORE_X - QUAY_X + 40; add(box(quayW, 8, PORT_Z0 - PORT_Z1), natMat({ color: 0xb8b2a6, roughness: 0.95 }, 1), QUAY_X + quayW / 2, -1.5, (PORT_Z0 + PORT_Z1) / 2);
  const CONT = []; { const R = RNG('contH'); for (let x = QUAY_X + 45; x < SHORE_X + 20; x += 13.5) for (let z = PORT_Z0 - 20; z > PORT_Z1 + 20; z -= 3.2) if (R.f() < 0.7) { const n = 1 + Math.floor(R.f() * 4); for (let k = 0; k < n; k++) CONT.push([x, 2.5 + 1.3 + k * 2.65, z, R.pick(['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#8a3a2a', '#d8d8d0', '#f07a20', '#4a4a52'])]); } }
  const cont = IM(box(12.2, 2.6, 2.5), natMat({ roughness: 0.7, metalness: 0.2 }, 1), CONT.length); CONT.forEach(([x, y, z, c], i) => { cont.setMatrixAt(i, M4c(x, y, z)); cont.setColorAt(i, lin(c)); }); scene.add(cont);
  { const ship = new THREE.Group(); ship.position.set(QUAY_X - 22, SEA_Y, -905); scene.add(ship); add(box(30, 14, 240), natMat({ color: 0x24344c, roughness: 0.7 }, 1), 0, 3, 0, ship); add(box(30.4, 3, 240.4), natMat({ color: 0xa83228, roughness: 0.7 }, 1), 0, -3, 0, ship);
    add(box(26, 18, 14).translate(0, 9, 0), natMat({ color: 0xf2f0ea, roughness: 0.7 }, 1), 0, 10, 100, ship); const R = RNG('shipC'); for (let z = -100; z < 86; z += 13) for (let x = -11; x <= 11; x += 2.6) { const n = 1 + Math.floor(R.f() * 5); add(box(2.4, 2.6 * n, 12.2).translate(0, 1.3 * n, 0), natMat({ color: lin(R.pick(['#c8372d', '#2f6fb0', '#e0a43a', '#3a8a5a', '#d8d8d0', '#f07a20'])), roughness: 0.7 }, 1), x, 10, z, ship, false); } }
  const CRANES = []; [-800, -880, -960].forEach((cz, i) => { const g = new THREE.Group(); g.position.set(QUAY_X + 14, 2.5, cz); scene.add(g); const mat = i === 1 ? steelW : steelR;
    for (const [x, z] of [[-10, -8], [10, -8], [-10, 8], [10, 8]]) add(box(1.8, 46, 1.8).translate(0, 23, 0), mat, x, 0, z, g);
    for (const z of [-8, 8]) add(box(22, 2.2, 2.2), mat, 0, 46, z, g); for (const x of [-10, 10]) add(box(2.2, 2.2, 18), mat, x, 46, 0, g);
    for (const z of [-8, 8]) { const br = add(box(0.6, 30, 0.6), mat, 0, 22, z, g, false); br.rotation.z = 0.62; const br2 = add(box(0.6, 30, 0.6), mat, 0, 22, z, g, false); br2.rotation.z = -0.62; }
    const boom = new THREE.Group(); boom.position.set(0, 48.5, 0); g.add(boom); add(box(130, 3, 3.4).translate(-35, 0, 0), mat, 0, 0, 0, boom); add(box(10, 6, 9).translate(0, 3, 0), natMat({ color: 0xf2f0ea }, 1), 24, 1.5, 0, boom); add(box(4, 3, 3.6), natMat({ color: 0x2a3440 }, 1), -60, -3, 0, boom);
    const apex = add(box(2.2, 26, 2.2).translate(0, 13, 0), mat, 0, 0, 0, boom); for (const [tx, ty] of [[-100, 0], [30, 0], [-50, 0]]) { const a = new THREE.Vector3(0, 26, 0), b = new THREE.Vector3(tx, ty, 0), m = add(new THREE.CylinderGeometry(0.2, 0.2, 1, 4).translate(0, 0.5, 0), mat, 0, 0, 0, boom, false); m.position.copy(a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); m.scale.set(1, a.distanceTo(b), 1); }
    CRANES.push({ g, boom, i, tf: T_STEEL + 0.4 + i * 0.35 }); });
  { add(box(30, 6, 400), natMat({ color: 0x8a8478, roughness: 1 }, 1), -420, -1, -1240); const lh = new THREE.Group(); lh.position.set(-420, 2, -1050); scene.add(lh); add(new THREE.CylinderGeometry(2.2, 3, 24, 16).translate(0, 12, 0), natMat({ map: texStripes('#f6f2ea', '#d8261e', 6, false), roughness: 0.7 }, 1), 0, 0, 0, lh); add(new THREE.CylinderGeometry(2.6, 2.6, 4, 12), natMat({ color: 0x2a3440, emissive: 0xffe0a0, emissiveIntensity: 0.6 }, 1), 0, 26, 0, lh); }

  // --- the heat: steam, smoke, fire, the cloud and its virga, a fireball, splashes
  const puffTex = texPuff('puffH', 30, 0.4), flameTex = texFlame(), virgaTex = texVirga();
  const pool = (n, map, o = {}) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map, transparent: true, depthWrite: false, opacity: 0 }, o))); s.visible = false; s.renderOrder = o.order ?? 8; scene.add(s); return s; });
  const steam = pool(180, puffTex), smoke = pool(320, puffTex, { order: 7 }), splash = pool(90, puffTex), virga = pool(36, virgaTex, { fog: false }), cloud = pool(46, puffTex, { fog: false, order: -1 });
  // fires: paper on the beach and in the fair, the cars, the station, then wood everywhere at once
  const FIRES = []; { const R = RNG('firesH'); const F = (x, y, z, s, t0, d = 16) => FIRES.push({ x, y, z, s, t0, t1: t0 + d * R.r(0.8, 1.3), ph: R.r(0, 9) });
    TOW.forEach((w) => { if (R.f() < 0.7) F(w.x, groundH(w.x, w.z) + 0.2, w.z, R.r(1.6, 2.6), T_PAPER + R.r(0, 1.4), 7); });
    STALLS.forEach((s) => F(s.x, 3.5, s.z, R.r(3, 5), T_PAPER + R.r(0.2, 1.6), 14)); F(KIOSK_P.x, 3, KIOSK_P.z, 3.4, T_PAPER + 0.3, 10); for (let k = 0; k < 20; k++) F(R.r(BOARD_X0, BOARD_X1), 0.8, R.r(-900, 60), R.r(1.2, 2), T_PAPER + R.r(0, 1.6), 6);
    CARS.forEach((c, i) => { c.fi = FIRES.length; F(c.x, 1.5, c.z0, c.station ? 8 : R.r(4.5, 6.5), c.t0 + 0.05, 18); });
    for (let z = 95; z > -1200; z -= R.r(4, 9)) F(R.r(BOARD_X0 - 1, BOARD_X1 + 1), 1.2, z, R.r(2.5, 8), T_WOOD + R.r(0, 1.3), 16);
    PALMS.forEach(([x, z]) => F(x, 11, z, R.r(7, 10), T_WOOD + R.r(0, 1.0), 12));
    PINES.forEach(([x, y, z, s], i) => { if (i % 2 === 0) F(x, y + 6 * s, z, 10 * s, T_WOOD + R.r(0, 1.2), 15); });
    BOATS.forEach((b) => F(b.x, 2, b.z, 7 * b.s, b.t0 + 3, 14)); LIFE.forEach(([x, z]) => F(x, 4, z, 6, T_WOOD + 0.2, 12));
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; F(70 + Math.cos(a) * 9, 5, -330 + Math.sin(a) * 9, 5, T_WOOD + R.r(0, 0.8), 14); } for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; F(130 + Math.cos(a) * 16, R.r(4, 18), -300 + Math.sin(a) * 16, 7, T_PAPER + 1 + R.r(0, 3), 14); }
    for (let k = 0; k < 10; k++) F(74 + R.r(-6, 6), 4, -180 + R.r(-5, 5), 4, T_PAPER + 3 + R.r(0, 2), 10);
    HOT.forEach((b) => { if (R.f() < 0.55) F(b.x - b.sx / 2 - 0.5, R.r(4, b.h - 2), b.z + R.r(-b.sz / 2, b.sz / 2), R.r(4, 8), T_PAPER + R.r(0, 10), 18); }); }
  const flames = FIRES.map((f) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false })); s.visible = false; s.renderOrder = 9; s.center.set(0.5, 0.25); scene.add(s); return s; });
  const BIGF = FIRES.map((f, i) => i).filter((i) => FIRES[i].s >= 5);
  const fireball = pool(26, puffTex, { order: 10, blending: THREE.AdditiveBlending, fog: false }), pops = pool(BAL.length + BALLS.length, puffTex, { order: 9 });

  G = { cv, r, scene, cam, sky, skyU, clouds, hemi, sun, fireLight, seaMat, sea, roadMat, board, palms, PALMS, pines, PINES, hot, HOT, wheel, rot, cabins, wheelBulbs, carousel, tent, castle, STALLS, stallB, awnings, strLights, BAL, balloons, station, canopy, kiosk, POP, popcorn,
    UMB, umbPole, umbTop, TOW, towels, LOU, lounge, KAY, kayaks, BALLS, balls, FOLK, folkB, folkH, CARS, carBody, carTop, wheels, BOATS, hulls, sails, PIER, CRANES, steam, smoke, splash, virga, cloud, FIRES, BIGF, flames, fireball, pops };
  return G;
}
