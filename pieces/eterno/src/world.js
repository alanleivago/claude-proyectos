
// =====================================================================
//  WORLD — the bay: sky (day, dusk, a night with the Milky Way), the sea, the ground (forest → farms → town → city, painted
//  per vertex by when each place changes), pines, the fishing town (houses with tile roofs, a church, a lighthouse, the
//  harbour and its boats), the DEATHS TODAY billboard, tower cranes, the towers (land, then sea platforms, then the near
//  slopes), the hero tower, the balcony railing. A second world under the water: the immortal jellyfish and its polyps.
// =====================================================================
let G = null, U = null;
function bayDist(x, z) {   // ~distance from (x, z) to the water (0 inside it)
  if (inSea(x, z)) return 0;
  const e = Math.sqrt(((x - BAY.x) / BAY.rx) ** 2 + ((z - BAY.z) / BAY.rz) ** 2), de = (e - 1) * 0.82 * Math.min(BAY.rx, BAY.rz) * (1 + 0.6 * Math.abs((z - BAY.z) / (e * BAY.rz)));
  const dr = z < -360 ? Math.max(0, x + 800) : x < -800 ? -360 - z : Math.hypot(Math.max(0, x + 800), Math.max(0, -360 - z));
  return Math.max(0, Math.min(de, dr < 0 ? 1e9 : dr));
}
const headK = (x, z) => Math.exp(-((x - CAMP.x) ** 2 / (120 * 120) + (z - CAMP.z - 10) ** 2 / (80 * 80)));
function groundH(x, z) {
  if (inSea(x, z)) { const e = Math.sqrt(((x - BAY.x) / BAY.rx) ** 2 + ((z - BAY.z) / BAY.rz) ** 2); return e < 1 && !(x < -800 && z < -360) ? -1 - 13 * ss(1.0, 0.8, e) : -14; }
  const d = bayDist(x, z), nz = 0.55 + 0.3 * Math.sin(x * 0.004 + 1.3) * Math.sin(z * 0.0035 + 0.4) + 0.15 * Math.sin(x * 0.013 - z * 0.011);
  const hk = headK(x, z); return 1.6 + Math.min(d, 60) * 0.05 + 520 * ss(90, 1100, d) * nz * (1 - hk) + 56 * hk;
}
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const ANI = r.capabilities.getMaxAnisotropy();
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xd8e2ea, 600, 9000);
  const cam = new THREE.PerspectiveCamera(66, W / H, 0.5, 60000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const SUN_DIR = dirV(28 * DEG, 30 * DEG);

  // --- sky: morning blue, a pink dusk, a night with stars and the Milky Way that light pollution washes out
  const skyU = { top: { value: lin('#5a8ad0') }, hor: { value: lin('#dce6ee') }, sunDir: { value: SUN_DIR.clone() }, sunCol: { value: lin('#fff2d8') }, sunK: { value: 1 }, starA: { value: 0 }, glow: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(50000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunK, starA, glow; varying vec3 vDir;
      float sh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(sh(i), sh(i + vec2(1, 0)), f.x), mix(sh(i + vec2(0, 1)), sh(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.1, 1.0); vec3 c = mix(hor, top, smoothstep(0.0, 0.55, pow(max(h, 0.0), 0.75)));
        float s = max(dot(d, sunDir), 0.0); c += sunCol * sunK * (smoothstep(0.9996, 0.9998, s) * 2.5 + pow(s, 80.0) * 0.4 + pow(s, 6.0) * 0.12);
        float lat = asin(clamp(d.y, -1.0, 1.0)), lon = atan(d.x, -d.z); float st = 0.0;
        for (int L = 0; L < 2; L++) { float sc = L == 0 ? 300.0 : 640.0; vec2 uv = vec2(lon * cos(lat), lat) * sc; vec2 cc = floor(uv); float rr = sh(cc + float(L) * 17.3);
          if (rr > 0.93) { vec2 o = vec2(0.2 + 0.6 * sh(cc + 3.1), 0.2 + 0.6 * sh(cc + 7.7)); st += smoothstep(0.24, 0.0, length(fract(uv) - o)) * (0.4 + 0.6 * sh(cc + 11.0)); } }
        vec3 mwAxis = normalize(vec3(0.55, 0.62, -0.56)); float band = exp(-pow(dot(d, mwAxis) / 0.16, 2.0));
        float dust = vn(vec2(lon * 7.0, lat * 9.0)) * 0.6 + vn(vec2(lon * 19.0, lat * 23.0)) * 0.4; vec3 mw = vec3(0.62, 0.66, 0.8) * band * (0.35 + 0.65 * dust) * (1.0 - smoothstep(0.55, 0.75, vn(vec2(lon * 11.0, lat * 13.0)) * band));
        c += (vec3(0.95) * st * (1.0 + band * 1.5) + mw * 0.55) * starA * smoothstep(0.02, 0.25, h);
        c += vec3(1.0, 0.55, 0.25) * glow * exp(-max(h, 0.0) * 9.0) * 0.55;
        gl_FragColor = vec4(c, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  const cloudTex = texCloud(); const clouds = []; { const R = RNG('cloudsF'); for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.7 }));
    s.userData = { x: R.r(-16000, 14000), z: R.r(-30000, -10000), y: R.r(2200, 6000), w: R.r(4000, 9000), a: R.r(0.2, 0.34), o: R.r(0.5, 0.8) }; s.renderOrder = -2; scene.add(s); clouds.push(s); } }
  const hemi = new THREE.HemisphereLight(0xc8d8f0, 0x6a6a52, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  Object.assign(sun.shadow.camera, { left: -1100, right: 1100, top: 1100, bottom: -1100, near: 10, far: 6000 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.6;
  sun.target.position.set(0, 0, -600); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 2800); sun.target.updateMatrixWorld();

  // --- the sea: sky reflection, ripples, the sun's glint, a lit shore at night
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uTop: { value: lin('#5a8ad0') }, uHor: { value: lin('#dce6ee') }, uSunDir: { value: SUN_DIR.clone() }, uSunCol: { value: lin('#fff2d8') }, uBody: { value: lin('#1a5a6e') }, uCity: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uCity; uniform vec3 uTop, uHor, uBody, uSunDir, uSunCol; varying vec3 vW;
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz; float t = uT;
        float dist = length(vW - cameraPosition), fade = 1.0 / (1.0 + dist * 0.004);
        vec3 n = normalize(vec3((0.022 * sin(p.x * 0.11 + p.y * 0.04 + t * 0.9) + 0.014 * sin(p.x * 0.37 - p.y * 0.21 + t * 1.4) + 0.01 * sin(p.x * 0.83 + p.y * 0.61 - t * 2.1)) * fade, 1.0, (0.022 * sin(p.y * 0.09 - p.x * 0.05 - t * 0.7) + 0.014 * sin(p.y * 0.33 + p.x * 0.17 - t) + 0.01 * sin(p.y * 0.77 - p.x * 0.53 + t * 1.8)) * fade));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 col = mix(uBody, mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.5)), clamp(fres * 0.9 + 0.12, 0.0, 0.85));
        col += uSunCol * (pow(max(dot(Rf, uSunDir), 0.0), 240.0) * 2.0 + pow(max(dot(Rf, uSunDir), 0.0), 20.0) * 0.12);
        col += vec3(1.0, 0.7, 0.4) * uCity * 0.12 * smoothstep(-0.05, 0.02, Rf.y) * (1.0 - smoothstep(0.0, 0.25, Rf.y));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000).rotateX(-Math.PI / 2).translate(-8000, 0, -10000), seaMat); sea.position.y = SEA_Y; scene.add(sea);

  // --- the ground: each vertex knows when it turns from forest to farm and from farm to town
  const groundU = { uT: { value: 0 }, uNight: { value: 0 } };
  { const g = new THREE.PlaneGeometry(14000, 14000, 520, 520).rotateX(-Math.PI / 2).translate(0, 0, -4000), p = g.attributes.position, cF = [], cA = [], cU = [], aF = [], aU = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = groundH(x, z), d = bayDist(x, z), hk = hsh(Math.floor(x / 26) + Math.floor(z / 26) * 131), hk2 = hsh(Math.floor(x / 60) + Math.floor(z / 45) * 77, 3); p.setY(i, y);
      const sea = y < -0.5, beach = d < 22, head = headK(x, z) > 0.25;
      const f = sea ? lin('#4a5a50') : beach ? lin('#d8c8a0') : C3('#3e5e2c', '#4e6e34', hk); cF.push(f.r, f.g, f.b);
      const fa = sea || beach ? f : head ? C3('#3e5e2c', '#4e6e34', hk) : lin(['#a8a050', '#c8b860', '#7a9a3a', '#b89a58', '#8aa848', '#d0c070'][Math.floor(hk2 * 6)]); cA.push(fa.r, fa.g, fa.b);
      const u = sea || beach ? f : C3('#c8bca8', '#b0a898', hk); cU.push(u.r, u.g, u.b);
      aF.push(sea || beach || head ? 999 : 17 + 4 * clamp((d - 40) / 1400) + hsh(i, 5) * 0.8); aU.push(sea || beach ? 999 : head ? 56.5 + hsh(i, 6) * 3 : 14 + 11 * clamp((d - 40) / 520) + hsh(i, 7) * 1.5 + (d > 600 ? 16 + 10 * clamp((d - 600) / 1500) : 0)); }
    g.setAttribute('cF', new THREE.Float32BufferAttribute(cF, 3)); g.setAttribute('cA', new THREE.Float32BufferAttribute(cA, 3)); g.setAttribute('cU', new THREE.Float32BufferAttribute(cU, 3)); g.setAttribute('aF', new THREE.Float32BufferAttribute(aF, 1)); g.setAttribute('aU', new THREE.Float32BufferAttribute(aU, 1)); g.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ roughness: 0.95, color: 0xffffff });
    m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, groundU);
      sh.vertexShader = 'attribute vec3 cF, cA, cU; attribute float aF, aU; uniform float uT; varying vec3 vGC;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vGC = mix(mix(cF, cA, smoothstep(aF, aF + 0.8, uT)), cU, smoothstep(aU, aU + 1.0, uT));');
      sh.fragmentShader = 'varying vec3 vGC;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb *= vGC;'); };
    const gr = new THREE.Mesh(g, m); gr.receiveShadow = true; scene.add(gr); }

  const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo.clone(); g2.applyMatrix4(m4); g2.computeVertexNormals();
      const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.6 + 0.4 * clamp(n.getY(i) * 0.5 + 0.5) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
  const add = (geo, mat, x, y, z, parent = scene, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  // a facade material for instanced boxes: the texture laid in world units; windows light up at night per cell
  const facMat = (tex, uw, uh, roof) => { const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, emissive: 0xffffff });
    m.onBeforeCompile = (sh) => { sh.uniforms.uFac = { value: tex }; sh.uniforms.uLit = groundU.uNight;
      sh.vertexShader = 'varying vec2 vFac; varying float vTop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
        vec3 lp = (position + vec3(0.5, 0.0, 0.5)) * sc; vTop = step(0.5, normal.y); vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y); vFac = vFac / vec2(${uw.toFixed(1)}, ${uh.toFixed(1)}) + vec2(floor(hs * 8.0) / 8.0, 0.0);`);
      sh.fragmentShader = 'uniform sampler2D uFac; uniform float uLit; varying vec2 vFac; varying float vTop;\nfloat fh(vec2 p){ return fract(sin(dot(p, vec2(41.3, 17.7))) * 9137.1); }\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>\n vec3 fc = texture2D(uFac, vFac).rgb; diffuseColor.rgb *= vTop > 0.5 ? vec3(${roof}) : fc;`)
        .replace('#include <emissivemap_fragment>', `{ float lum = dot(fc, vec3(0.3, 0.5, 0.2)); float win = (1.0 - vTop) * step(lum, 0.36) * step(fh(floor(vFac * vec2(8.0, 32.0))), 0.5); totalEmissiveRadiance = vec3(1.0, 0.78, 0.48) * win * uLit * 1.2; }`); };
    return m; };

  // --- pines: everywhere on the land; the farm front clears them, the headland keeps its own until the end
  const pineG = mergeG([[new THREE.CylinderGeometry(0.3, 0.5, 7, 6).translate(0, 3.5, 0), M4c(0, 0, 0), '#5a4430', 0], ...[0, 1, 2, 3].map((k) => [new THREE.ConeGeometry(3.4 - k * 0.6, 4, 8).translate(0, 2, 0), M4c(0, 5 + k * 2.4, 0), k % 2 ? '#2e5228' : '#284a24', 1])]);
  const PINES = []; { const R = RNG('pinesF'); for (let i = 0; i < 60000 && PINES.length < 5200; i++) { const head = i % 3 === 0, x = head ? CAMP.x + R.r(-170, 170) : R.r(-2600, 2600), z = head ? CAMP.z + R.r(-90, 60) : R.r(-4200, 200);
      if (inSea(x, z) || bayDist(x, z) < 30) continue; const hk = headK(x, z) > 0.25; if (head && !hk) continue; if (hk && Math.hypot(x - CAMP.x, z - CAMP.z) < 9) continue; const ps = R.r(0.9, 1.8) * (hk ? 1.3 : 1); if (z < CAMP.z - 4 && Math.abs(x - CAMP.x) < 0.55 * (CAMP.z - z) + 8 && groundH(x, z) + 14 * ps > CAMP.y - 0.44 * (CAMP.z - z)) continue;
      const d = bayDist(x, z); PINES.push({ x, y: groundH(x, z), z, s: ps, t1: hk ? 56.2 + R.r(0, 3.4) : 17 + 4 * clamp((d - 40) / 1400) + R.r(0, 0.8), ry: R.r(0, 6) }); } }
  const pines = IM(pineG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), PINES.length); pines.instanceMatrix.setUsage(THREE.DynamicDrawUsage); pines.frustumCulled = false; scene.add(pines);

  // --- the town: whitewashed houses with tile roofs; the old village first, the rest as the births arrive; the hill towns later
  const stTex = texStucco(); wrap(stTex); stTex.anisotropy = ANI;
  const HOUSES = []; { const R = RNG('housesF'); const occ = new Set(), key = (x, z) => Math.round(x / 11) + ',' + Math.round(z / 11);
    for (let i = 0; i < 90000 && HOUSES.length < 4200; i++) { const x = R.r(-1500, 1500), z = R.r(-2400, 110); if (inSea(x, z)) continue; const d = bayDist(x, z); if (d < 12 || d > 700) continue; if (headK(x, z) > 0.2) continue; if (Math.hypot(x - BOARD_P.x, z - BOARD_P.z) < 22) continue;
      const k = key(x, z); if (occ.has(k)) continue; occ.add(k); const old = d < 110 && (z < -560 || x > 140) && R.f() < 0.9;
      HOUSES.push({ x, y: groundH(x, z), z, w: R.r(6, 10), dd: R.r(6, 9), h: R.r(5, 9) * (old ? 1 : R.r(1, 1.6)), ry: Math.round(R.r(-1, 1)) * 0.2 + R.r(-0.1, 0.1), t0: old ? -1 : 14 + 11 * clamp((d - 40) / 520) + R.r(0, 1.5), t1: 999, c: R.pick(['#ffffff', '#fff8ec', '#f8f0e0', '#fff4f0', '#f0f4f8', '#fbe8c8']), rc: R.pick(['#b8502e', '#c4623a', '#a8482a', '#c86e44']) }); } }
  const houses = IM(box(1, 1, 1).translate(0, 0.5, 0), facMat(stTex, 12, 12, '0.8, 0.78, 0.74'), HOUSES.length); houses.instanceMatrix.setUsage(THREE.DynamicDrawUsage); HOUSES.forEach((h, i) => houses.setColorAt(i, lin(h.c))); scene.add(houses);
  const roofs = IM(new THREE.ConeGeometry(0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ roughness: 0.8 }), HOUSES.length); roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); HOUSES.forEach((h, i) => roofs.setColorAt(i, lin(h.rc))); scene.add(roofs);
  // landmarks: a church with a bell tower, a lighthouse on the left point, the harbour (breakwater, a pier, fishing boats)
  const landm = new THREE.Group(); scene.add(landm);
  { const white = new THREE.MeshStandardMaterial({ color: 0xf8f4ec, roughness: 0.8 }), tile = new THREE.MeshStandardMaterial({ color: 0xb8502e, roughness: 0.8 }); const cx = 40, cz = -742, cy = groundH(cx, cz);
    add(box(16, 12, 30).translate(0, 6, 0), white, cx, cy, cz, landm); add(new THREE.CylinderGeometry(0.1, 12, 6, 4, 1).rotateY(Math.PI / 4).scale(0.95, 1, 1.75).translate(0, 15, 0), tile, cx, cy, cz, landm);
    add(box(7, 28, 7).translate(0, 14, 0), white, cx + 9, cy, cz + 12, landm); add(new THREE.ConeGeometry(5.4, 8, 4).rotateY(Math.PI / 4).translate(0, 32, 0), tile, cx + 9, cy, cz + 12, landm);
    const lx = -245, lz = -470, ly = groundH(lx + 30, lz); add(new THREE.CylinderGeometry(2.4, 3.2, 22, 16).translate(0, 11, 0), white, lx + 30, ly, lz, landm); add(new THREE.CylinderGeometry(2.8, 2.8, 3.5, 12).translate(0, 23.5, 0), new THREE.MeshStandardMaterial({ color: 0x2a3440, emissive: 0xffe0a0, emissiveIntensity: 0.5 }), lx + 30, ly, lz, landm);
    add(box(6, 4, 160).translate(0, -1, 0), new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 1 }), 120, 0, -640, landm); add(box(4, 2, 70).translate(0, 0, 0), new THREE.MeshStandardMaterial({ color: 0x8a7258, roughness: 0.9 }), 60, 0.6, -690, landm); }
  const hullG = mergeG([[new THREE.BoxGeometry(7, 1.6, 2.6).translate(0, 0.3, 0), M4c(0, 0, 0), '#f6f6f2', 1], [box(2.4, 1.6, 2), M4c(-1.2, 1.6, 0), '#e8e4dc', 1], [box(7.1, 0.4, 2.7), M4c(0, -0.2, 0), '#2f6fb0', 0]]);
  const BOATS = []; { const R = RNG('boatsF'); for (let i = 0; i < 40 && BOATS.length < 24; i++) { const x = R.r(20, 110), z = R.r(-720, -600); if (!inSea(x, z) || BOATS.some((b) => Math.hypot(b.x - x, b.z - z) < 10)) continue; BOATS.push({ x, z, ry: R.r(0, 6) }); } for (let i = 0; i < 8; i++) BOATS.push({ x: R.r(-120, 40), z: R.r(-450, -250), ry: R.r(0, 6), sail: true }); }
  const boats = IM(hullG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }), BOATS.length); boats.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(boats);

  // --- the DEATHS TODAY billboard on the right shore (its face is a canvas, redrawn when the number changes)
  const bbCv = document.createElement('canvas'); bbCv.width = 512; bbCv.height = 256; const bbTex = new THREE.CanvasTexture(bbCv); bbTex.encoding = THREE.sRGBEncoding;
  const billboard = new THREE.Group(); billboard.position.set(BOARD_P.x, groundH(BOARD_P.x, BOARD_P.z), BOARD_P.z); billboard.rotation.y = Math.atan2(CAMP.x - BOARD_P.x, CAMP.z - BOARD_P.z); billboard.scale.setScalar(1.6); scene.add(billboard);
  { const steel = new THREE.MeshStandardMaterial({ color: 0x3a3e44, metalness: 0.5, roughness: 0.5 }); for (const sx of [-7, 7]) add(box(0.8, 10, 0.8).translate(0, 5, 0), steel, sx, 0, 0, billboard);
    add(box(24, 11, 0.8), steel, 0, 14.5, -0.5, billboard); add(new THREE.PlaneGeometry(23, 10), new THREE.MeshBasicMaterial({ map: bbTex, toneMapped: false }), 0, 14.5, 0, billboard, false); }

  // --- tower cranes (yellow): over the growing town, then beside every rising tower
  const craneG = mergeG([[box(1.6, 1, 1.6).translate(0, 0.5, 0), M4c(0, 0, 0, 0, 1, 60, 1), '#e8b020', 1], [box(46, 1.4, 1.4), M4c(12, 60, 0), '#e8b020', 1], [box(12, 1.2, 1.2), M4c(-14, 60, 0), '#e8b020', 1], [box(4, 3, 3), M4c(-17, 58.6, 0), '#8a8a88', 1], [box(2.2, 2.2, 2.2), M4c(1.6, 58.4, 0), '#f0f0ea', 1], [new THREE.ConeGeometry(1.2, 6, 4), M4c(0, 64, 0), '#e8b020', 1]]);
  const CRANES = []; { const R = RNG('cranesF'); HOUSES.filter((h) => h.t0 > 13).forEach((h, i) => { if (i % 60 === 0) CRANES.push({ x: h.x + 8, y: h.y, z: h.z, t0: h.t0 - 2, t1: h.t0 + 4, s: R.r(0.5, 0.75), ph: R.r(0, 6) }); }); }

  // --- towers: glass and stone, rising from the far hills inward (41-52), on platforms in the bay (52-56), on the headland's slopes (56-59.8)
  const winTex = [0, 1, 2, 3].map((k) => { const t = wrap(texGlass(k)); t.anisotropy = ANI; return t; });
  const TOWERS = []; { const R = RNG('towersF'); const ok = (x, z, w) => !TOWERS.some((t) => Math.abs(t.x - x) < (t.w + w) / 2 + 8 && Math.abs(t.z - z) < (t.w + w) / 2 + 8);
    for (let i = 0; i < 40000 && TOWERS.length < 1100; i++) { const x = R.r(-2600, 2600), z = R.r(-4200, 160); if (inSea(x, z)) continue; const dc = Math.hypot(x - CAMP.x, z - CAMP.z); if (dc < 140) continue; if (headK(x, z) > 0.35 && dc < 260) continue;
      const w = R.r(26, 48); if (!ok(x, z, w)) continue; const near = dc < 420; TOWERS.push({ x, y: groundH(x, z) - 2, z, w, d: w * R.r(0.75, 1.1), h: R.r(70, 240) * (1 + 0.4 * ss(800, 2500, dc)), kind: R.pick([0, 0, 3, 1, 2]), t0: near ? 56.2 + 3.2 * clamp((420 - dc) / 280) + R.r(0, 0.4) : 41 + 10 * clamp((2800 - dc) / 2400) + R.r(-0.6, 0.6), sea: false }); }
    for (let i = 0; i < 4000 && TOWERS.filter((t) => t.sea).length < 70; i++) { const x = R.r(-700, 160), z = R.r(-900, -60); if (!inSea(x, z)) continue; const w = R.r(28, 44); if (!ok(x, z, w)) continue; const dc = Math.hypot(x - CAMP.x, z - CAMP.z);
      TOWERS.push({ x, y: 4, z, w, d: w * R.r(0.8, 1.1), h: R.r(80, 220), kind: R.pick([0, 3, 3, 1]), t0: 52 + 3.6 * clamp((1000 - dc) / 800) + R.r(0, 0.4), sea: true }); } }
  const twMesh = [0, 1, 2, 3].map((k) => { const n = TOWERS.filter((t) => t.kind === k).length, m = IM(box(1, 1, 1).translate(0, 0.5, 0), facMat(winTex[k], 26, 112, '0.55, 0.57, 0.6'), n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m; });
  { const c = [0, 0, 0, 0]; TOWERS.forEach((t) => (t.slot = c[t.kind]++)); }
  TOWERS.forEach((t, i) => { if (i % 9 === 0) CRANES.push({ x: t.x + t.w / 2 + 6, y: t.y, z: t.z, t0: t.t0 - 1.6, t1: t.t0 + 5, s: t.h / 60 * 1.05, ph: hsh(i) * 6, tw: t }); });
  const plat = IM(new THREE.CylinderGeometry(1, 1.1, 1, 12).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0xb8b2a6, roughness: 0.9 }), TOWERS.filter((t) => t.sea).length); plat.instanceMatrix.setUsage(THREE.DynamicDrawUsage); plat.frustumCulled = false; scene.add(plat);
  const cranes = IM(craneG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.2 }), CRANES.length); cranes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cranes.frustumCulled = false; scene.add(cranes);
  // houses give way to the towers that land on them
  HOUSES.forEach((h) => { for (const t of TOWERS) if (!t.sea && Math.abs(t.x - h.x) < t.w / 2 + 14 && Math.abs(t.z - h.z) < t.d / 2 + 14) h.t1 = Math.min(h.t1, t.t0); });
  // the hero: a tower that rises right at the balcony
  { const im = IM(box(1, 1, 1).translate(0, 0.5, 0), facMat(winTex[3], 26, 112, '0.55, 0.57, 0.6'), 1); im.setMatrixAt(0, M4c(HERO_P.x, -400, HERO_P.z, 0.08, 52, 360, 46)); im.frustumCulled = false; scene.add(im); G_HERO = im; }

  // --- the balcony: a wooden floor and railing at the camera
  { const wood = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.85 }), bal = new THREE.Group(); bal.position.set(CAMP.x, CAMP.y - 3.75, CAMP.z - 3.1); scene.add(bal);
    add(box(16, 0.12, 0.12), wood, 0, 1.15, -0.4, bal); add(box(16, 0.07, 0.07), wood, 0, 0.6, -0.4, bal);
    for (let k = -7; k <= 7; k++) add(box(0.07, 1.15, 0.07).translate(0, 0.58, 0), wood, k * 1.05, 0, -0.4, bal); }

  // --- street lights at night (one glow per house, appearing with it) and dust for the rising towers
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,200,0.8)'], [0.5, 'rgba(255,190,120,0.2)'], [1, 'rgba(255,170,90,0)']], 64);
  const LP = []; HOUSES.forEach((h, i) => { if (i % 2 === 0) LP.push(h.x + 5, h.y + 4, h.z + 4); });
  const lampG = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(LP, 3)).setAttribute('color', new THREE.Float32BufferAttribute(new Array(LP.length).fill(0), 3));
  const lamps = new THREE.Points(lampG, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); lamps.renderOrder = 6; lamps.frustumCulled = false; scene.add(lamps);
  const puffTex = texPuff('puffF', 30, 0.4), dust = Array.from({ length: 240 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; s.renderOrder = 8; scene.add(s); return s; });

  G = { cv, r, scene, cam, sky, skyU, clouds, hemi, sun, seaMat, sea, groundU, PINES, pines, HOUSES, houses, roofs, BOATS, boats, bbCv, bbTex, billboard, CRANES, cranes, TOWERS, twMesh, plat, lamps, LP, dust, landm };
  return G;
}
let G_HERO = null;

// =====================================================================
//  UNDER THE WATER — the immortal jellyfish: a translucent bell that pulses, its red-orange stomach, an orange ring of
//  bulbs and long white tentacles; it ages, shrinks, sinks and melts into a blob on the seabed; a stolon spreads and
//  polyps sprout (stalks, orange heads, white crowns); tiny new medusae bud off and swim up. Light rays, caustics, snow, fish.
// =====================================================================
function uw3() {
  if (U) return U;
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x1a8a98, 0.022);
  const cam = new THREE.PerspectiveCamera(58, W / H, 0.1, 400); cam.rotation.order = 'YXZ'; scene.add(cam);
  const bg = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uT: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uT; varying vec3 vD; void main(){ vec3 d = normalize(vD); vec3 c = mix(vec3(0.03, 0.22, 0.3), vec3(0.32, 0.86, 0.88), smoothstep(-0.4, 0.9, d.y));
      float ray = 0.0; for (int k = 0; k < 5; k++) { float fk = float(k); ray += smoothstep(0.035, 0.0, abs(sin(atan(d.x, -d.z) * (3.0 + fk) + uT * 0.12 * (fk + 1.0) + fk * 1.7) * 0.5)) * 0.08; }
      c += vec3(0.6, 0.95, 0.95) * ray * smoothstep(-0.2, 0.8, d.y); gl_FragColor = vec4(c, 1.0);
      #include <encodings_fragment>
      }` })); bg.renderOrder = -5; scene.add(bg);
  const hemi = new THREE.HemisphereLight(0xc8f4f8, 0x2a5a58, 1.3); scene.add(hemi); const sun = new THREE.DirectionalLight(0xe8ffff, 1.2); sun.position.set(4, 30, 6); scene.add(sun);
  // the seabed: dunes and rocks, with caustics
  const bedU = { uT: { value: 0 } };
  const bedG = new THREE.PlaneGeometry(220, 220, 160, 160).rotateX(-Math.PI / 2); { const p = bedG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 1.2 * Math.sin(x * 0.18) * Math.sin(z * 0.14) + 0.5 * Math.sin(x * 0.5 + z * 0.3) + 4 * ss(30, 90, Math.hypot(x, z))); } bedG.computeVertexNormals(); }
  const bedM = new THREE.MeshStandardMaterial({ color: 0x9ab89a, roughness: 1 }); bedM.onBeforeCompile = (sh) => { sh.uniforms.uT = bedU.uT; sh.vertexShader = 'varying vec3 vBW;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vBW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'uniform float uT; varying vec3 vBW;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { vec2 p = vBW.xz * 0.6; float c = 0.0; for (int k = 0; k < 3; k++) { float fk = float(k) + 1.0; c += abs(sin(p.x * fk * 0.9 + sin(p.y * fk * 0.7 + uT * 0.8) + uT * 0.6 * fk)) * abs(sin(p.y * fk * 0.8 + sin(p.x * fk * 0.6 - uT * 0.7))); }
        totalEmissiveRadiance += vec3(0.5, 0.9, 0.85) * pow(clamp(1.0 - c / 3.0, 0.0, 1.0), 6.0) * 0.9; }`); };
  const bed = new THREE.Mesh(bedG, bedM); bed.position.y = -14; scene.add(bed);
  { const R = RNG('rocksU'); const rm = new THREE.MeshStandardMaterial({ color: 0x5a7a6a, roughness: 1, flatShading: true }); for (let i = 0; i < 40; i++) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(R.r(0.6, 3), 0), rm); const a = R.r(0, TAU), d = R.r(8, 70); r.position.set(Math.cos(a) * d, -14 + R.r(-0.5, 0.8), Math.sin(a) * d - 10); r.rotation.set(R.r(0, 3), R.r(0, 3), 0); scene.add(r); }
    const weed = new THREE.MeshStandardMaterial({ color: 0x3a8a4a, roughness: 0.8 }); for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), d = R.r(6, 50), h = R.r(2, 7); const w = new THREE.Mesh(new THREE.ConeGeometry(0.25, h, 4).translate(0, h / 2, 0), weed); w.position.set(Math.cos(a) * d, -14, Math.sin(a) * d - 8); w.userData.ph = R.r(0, 6); scene.add(w); } }
  // the jellyfish: bell (lathe), inner bell, stomach + gonads, the bulb ring, tentacles
  const jelly = new THREE.Group(); scene.add(jelly);
  const prof = []; for (let k = 0; k <= 24; k++) { const a = k / 24 * Math.PI * 0.55; prof.push(new THREE.Vector2(Math.sin(a) * 3.0 + (k > 20 ? (k - 20) * 0.04 : 0), Math.cos(a) * 3.2 - 1.2)); }
  const bellM = new THREE.MeshStandardMaterial({ color: 0xe8fbff, roughness: 0.15, metalness: 0.0, transparent: true, opacity: 0.32, side: THREE.DoubleSide, emissive: 0x9ae8f0, emissiveIntensity: 0.18, depthWrite: false });
  const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), bellM); jelly.add(bell); const bell2 = new THREE.Mesh(new THREE.LatheGeometry(prof.map((v) => v.clone().multiplyScalar(0.86)), 40), bellM.clone()); bell2.material.opacity = 0.18; bell2.position.y = -0.1; jelly.add(bell2);
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6a3a, roughness: 0.5, emissive: 0xff4a20, emissiveIntensity: 0.25, transparent: true, opacity: 0.85 });
  const stom = new THREE.Mesh(new THREE.LatheGeometry([0.05, 0.35, 0.55, 0.6, 0.45, 0.2].map((r, k) => new THREE.Vector2(r, 0.9 - k * 0.42)), 20), orange); jelly.add(stom);
  for (let k = 0; k < 4; k++) { const gd = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8).scale(1, 0.55, 1.9), orange); const a = k / 4 * TAU; gd.position.set(Math.cos(a) * 0.7, 0.55, Math.sin(a) * 0.7); gd.rotation.y = -a; jelly.add(gd); }
  const NB = 56, bulbs = IM(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff7a30, emissive: 0xff5a10, emissiveIntensity: 0.5 }), NB, false); jelly.add(bulbs);
  const NT = 72, TP = 26, tenG = new THREE.BufferGeometry(); tenG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NT * (TP - 1) * 2 * 3), 3));
  const tents = new THREE.LineSegments(tenG, new THREE.LineBasicMaterial({ color: 0xf4ffff, transparent: true, opacity: 0.75 })); tents.frustumCulled = false; scene.add(tents);
  // the blob it melts into, the stolon and the polyps, the buds
  const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14).scale(1, 0.55, 1), new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.5, emissive: 0xffa070, emissiveIntensity: 0.08 })); blob.visible = false; scene.add(blob);
  const POLYPS = []; { const R = RNG('polyps'); for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + R.r(-0.2, 0.2), d = R.r(1.6, 6.5); POLYPS.push({ x: Math.cos(a) * d, z: Math.sin(a) * d * 0.7 + 1, h: R.r(1.8, 3.6), t0: 38.0 + i * 0.12 + R.r(0, 0.4), lean: R.r(-0.25, 0.25), ph: R.r(0, 6) }); } }
  const polyp = POLYPS.map((p) => { const g = new THREE.Group(); scene.add(g); const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1, 6).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0xe8d8c0, roughness: 0.6 })); g.add(stalk);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10).scale(1, 1.5, 1), orange); g.add(head); const crown = [];
    for (let k = 0; k < 14; k++) { const tn = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 1.1, 4).translate(0, 0.55, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.15 })); g.add(tn); crown.push(tn); }
    return { g, stalk, head, crown }; });
  const stolonM = new THREE.MeshStandardMaterial({ color: 0xe8c8a0, roughness: 0.6 }); const stolons = POLYPS.map((p) => { const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 1), new THREE.Vector3(p.x * 0.5 + 0.6, 0.2, p.z * 0.5), new THREE.Vector3(p.x, 0, p.z)); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.07, 6), stolonM); m.geometry.setDrawRange(0, 0); scene.add(m); return m; });
  const BUDS = []; { const R = RNG('buds'); for (let i = 0; i < 14; i++) BUDS.push({ p: i % POLYPS.length, t0: 39.3 + R.r(0, 1.4), vx: R.n(0.6), vy: R.r(1.4, 2.6), vz: R.n(0.4), s: R.r(0.18, 0.3), ph: R.r(0, 6) }); }
  const budG = new THREE.LatheGeometry(prof, 20); const buds = BUDS.map(() => { const g = new THREE.Group(); const b = new THREE.Mesh(budG, bellM.clone()); b.material.opacity = 0.45; g.add(b); const c = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), orange); c.position.y = 0.3; g.add(c); g.visible = false; scene.add(g); return g; });
  // marine snow and fish
  const SN = []; { const R = RNG('snowU'); for (let i = 0; i < 900; i++) SN.push(R.r(-40, 40), R.r(-14, 30), R.r(-50, 20)); }
  const snow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(SN, 3)), new THREE.PointsMaterial({ size: 0.12, color: 0xe8ffff, transparent: true, opacity: 0.6, depthWrite: false })); scene.add(snow);
  const fishG = mergeG0([[new THREE.SphereGeometry(1, 8, 6).scale(1.2, 0.45, 0.25), M4c(0, 0, 0), '#3a5a6a'], [new THREE.ConeGeometry(0.4, 0.8, 4).rotateZ(Math.PI / 2), M4c(-1.4, 0, 0), '#3a5a6a']]);
  const FISH = []; { const R = RNG('fishU'); for (let i = 0; i < 24; i++) FISH.push({ y: R.r(-8, 16), z: R.r(-45, -18), x0: R.r(-60, 60), v: R.r(2, 5) * (R.f() < 0.5 ? 1 : -1), s: R.r(0.4, 0.9) }); }
  const fish = IM(fishG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }), FISH.length, false); fish.instanceMatrix.setUsage(THREE.DynamicDrawUsage); fish.frustumCulled = false; scene.add(fish);
  const weeds = scene.children.filter((o) => o.userData && o.userData.ph !== undefined);
  U = { scene, cam, bg, bedU, jelly, bell, bell2, stom, bulbs, NB, tents, NT, TP, blob, POLYPS, polyp, stolons, BUDS, buds, snow, FISH, fish, weeds };
  return U;
}
function mergeG0(parts) { const P = [], N = [], C = []; parts.forEach(([geo, m4, col]) => { const g2 = geo.index ? geo.toNonIndexed() : geo.clone(); g2.applyMatrix4(m4); g2.computeVertexNormals(); const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); C.push(cc.r, cc.g, cc.b); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; }
