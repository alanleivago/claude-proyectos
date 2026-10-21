
// =====================================================================
//  WORLD — the valley: a storm sky (a scrolling cloud deck, lightning, later a clear golden sky and the sun), the terrain,
//  the lake that rises, the village (stucco houses, tile roofs, the church, the jetty and boats), olive trees and pines; then
//  the Carnian: tree ferns, cycads, conifers, horsetails, lily pads, a volcano and its plume, mist; the Herrerasaurus;
//  our balcony with its wooden railing and foreground fronds
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
  scene.fog = new THREE.Fog(0x7a8288, 200, 6000);
  const cam = new THREE.PerspectiveCamera(64, W / H, 0.1, 90000); cam.rotation.order = 'YXZ'; scene.add(cam);

  // --- sky (no tone mapping): a storm deck (scrolling billows) that greens, then lifts into a clear golden evening with the sun
  const stormTex = wrap(texStorm());
  const skyU = { uStorm: { value: stormTex }, uT: { value: 0 }, top: { value: lin('#4a5058') }, hor: { value: lin('#8a9298') }, sunDir: { value: SUN_DIR.clone() }, sunCol: { value: lin('#fff0d0') },
    clear: { value: 0 }, flash: { value: 0 }, deck: { value: 1 }, tint: { value: lin('#ffffff') } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D uStorm; uniform float uT, clear, flash, deck; uniform vec3 top, hor, sunDir, sunCol, tint; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, -0.1, 1.0);
        vec3 c = mix(hor, top, smoothstep(0.0, 0.6, h));
        vec2 uv = d.xz / max(d.y + 0.08, 0.04) * 0.08 + vec2(uT * 0.006, uT * 0.002); float cl = texture2D(uStorm, uv).r * 0.7 + texture2D(uStorm, uv * 2.3 + 0.37).r * 0.3;
        float dk = smoothstep(0.02, 0.25, h) * deck; c = mix(c, c * (0.45 + 0.8 * cl), dk); c += vec3(0.9, 0.95, 1.0) * flash * (0.4 + 0.6 * cl) * smoothstep(0.0, 0.3, h);
        float s = max(dot(d, sunDir), 0.0); c += sunCol * clear * (pow(s, 1500.0) * 3.0 + pow(s, 40.0) * 0.4 + pow(s, 4.0) * 0.18);
        gl_FragColor = vec4(c * tint, 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xa8b0b8, 0x4a4a40, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe8c8, 0.4); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  Object.assign(sun.shadow.camera, { left: -500, right: 500, top: 500, bottom: -500, near: 10, far: 6000 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.5;
  sun.target.position.set(0, 0, -250); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 2000); sun.target.updateMatrixWorld();

  // --- terrain: grass and scrub on the hills, the village's ground, mud at the shore, rock and forest on the mountains
  const jungleU = { value: 0 };
  { const N = 400, g = new THREE.PlaneGeometry(2, 2, N, N); g.rotateX(-Math.PI / 2); const p = g.attributes.position, cols = [];
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i), m = Math.max(Math.abs(u), Math.abs(v)) + 1e-9, k = 26000 * Math.pow(m, 2.3) / m, x = u * k, z = v * k - 600;
      const y = terrH(x, z); p.setXYZ(i, x, y, z); const nA = 0.5 + 0.5 * Math.sin(x * 0.013) * Math.sin(z * 0.011);
      let c = C3('#5a6a38', '#7a7a46', nA); c.lerp(C3('#6a6658', '#4a4a3e', nA), ss(250, 700, y)); c.lerp(lin('#2e4024'), ss(120, 380, y) * (1 - ss(500, 800, y)) * 0.7); if (y < 3) c = C3('#6a5a44', '#4a3e30', nA); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const m = STD({ vertexColors: true, roughness: 0.95 });
    m.onBeforeCompile = (sh) => { sh.uniforms.uJ = jungleU; sh.fragmentShader = 'uniform float uJ;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.55, 0.85, 0.5), uJ);'); };
    const terr = new THREE.Mesh(g, m); terr.receiveShadow = true; scene.add(terr); }

  // --- the lake: sky reflection, rain rings, the flood's mud, lily-pad green in the Carnian, the sun's path at the end
  const seaU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uTop: { value: lin('#4a5058') }, uHor: { value: lin('#8a9298') }, uBody: { value: lin('#2a3a3e') }, uMud: { value: 0 },
    uRain: { value: 0 }, uSun: { value: SUN_DIR.clone() }, uSunK: { value: 0 }, uFlash: { value: 0 } }]);
  const seaMat = new THREE.ShaderMaterial({ uniforms: seaU, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uMud, uRain, uSunK, uFlash; uniform vec3 uTop, uHor, uBody, uSun; varying vec3 vW;
      #include <fog_pars_fragment>
      float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){ vec2 p = vW.xz; float t = uT, dist = length(p - cameraPosition.xz), fine = 1.0 - smoothstep(60.0, 900.0, dist);
        vec3 n = vec3(0.03 * sin(p.x * 0.05 + t * 0.6) + 0.02 * sin(p.x * 0.17 - p.y * 0.11 + t), 1.0, 0.03 * sin(p.y * 0.06 - t * 0.5) + 0.02 * sin(p.y * 0.2 + p.x * 0.09 - t));
        vec2 cell = floor(p / 2.5), f = fract(p / 2.5) - 0.5; float rings = 0.0;
        for (int k = 0; k < 2; k++) { vec2 o = vec2(hsh(cell + float(k) * 7.1), hsh(cell + float(k) * 3.3)) - 0.5; float ph = fract(t * 1.6 + hsh(cell + float(k))); float d = length(f - o * 0.6);
          float rr = ph * 0.45; rings += smoothstep(0.04, 0.0, abs(d - rr)) * (1.0 - ph); n.xz += normalize(f - o * 0.6 + 0.001) * smoothstep(0.06, 0.0, abs(d - rr)) * (1.0 - ph) * 0.35 * uRain * fine; }
        n = normalize(n);
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
        vec3 skyR = mix(uHor, uTop, pow(clamp(Rf.y, 0.0, 1.0), 0.5)) + vec3(0.6, 0.65, 0.7) * uFlash;
        vec3 body = mix(uBody, vec3(0.36, 0.28, 0.18), uMud);
        vec3 col = mix(body, skyR, clamp(fres * 0.85 + 0.12, 0.0, 0.9)); col += vec3(0.8, 0.82, 0.85) * rings * uRain * fine * 0.25;
        float sd = max(dot(Rf, uSun), 0.0); col += vec3(1.0, 0.85, 0.6) * uSunK * (pow(sd, 400.0) * 5.0 + pow(sd, 30.0) * 0.4);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }` });
  const seaMesh = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000).rotateX(-Math.PI / 2).translate(0, 0, -18000), seaMat); seaMesh.renderOrder = 1; scene.add(seaMesh);

  // --- the village: stucco houses with tile roofs down the slope to the shore, windows lit through the storm; the church;
  //     a jetty with boats; street lamps
  const ST = texStucco(); [ST.alb, ST.lit].forEach((t) => { wrap(t); t.anisotropy = ANI; });
  const WINU = { uOn: { value: 0.4 }, uPow: { value: 1 } };
  const hMat = STD({ color: 0xffffff, roughness: 0.9, emissive: 0xffffff }); hMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uFacM: { value: ST.alb }, uFacE: { value: ST.lit }, uOn: WINU.uOn, uPow: WINU.uPow });
    sh.vertexShader = 'varying vec2 vFac; varying float vTop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + vec3(0.5, 0.0, 0.5)) * sc; vTop = step(0.5, normal.y); vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacE; uniform float uOn, uPow; varying vec2 vFac; varying float vTop;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= texture2D(uFacM, vFac).rgb;')
      .replace('#include <emissivemap_fragment>', `{ vec4 e = texture2D(uFacE, vFac); float th = (e.a - 0.25) / 0.74; float cellH = fract(sin(dot(floor(vFac * 8.0), vec2(41.3, 17.7))) * 9137.1);
        float on = step(th, uOn) * step(0.05, e.a) * (1.0 - vTop) * step(cellH, uPow); totalEmissiveRadiance = e.rgb * on * 4.5; }`);
  };
  const HCOL = ['#f2ece0', '#e8d8b8', '#f0e4c8', '#e0c8a0', '#d8b890', '#f4f0e6', '#c8a478', '#e8c8a8', '#b8c4b0', '#d8a888', '#c8d0d8'];
  const HL = []; { const R = RNG('villageR2'), occ = new Set(), key = (x, z) => `${Math.round(x / 6)},${Math.round(z / 6)}`, ok = (x, z, s2) => { for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if (occ.has(`${Math.round(x / 6) + dx},${Math.round(z / 6) + dz}`)) return false; return true; };
    // terraced rows across the slope, following lanes; a denser centre by the river
    for (let i = 0; i < 30000 && HL.length < 950; i++) { const z = R.r(SHORE_Z + 6, -36), x = R.r(-520, 520) * (0.45 + 0.55 * ss(-36, SHORE_Z, z)), sx = R.r(5, 8.5), sz = R.r(5, 7.5);
      if (Math.abs(z - riverZ(x)) < 14) continue; if (Math.abs(x - 18 * Math.sin(z * 0.02)) < 5) continue; if (!ok(x, z)) continue; occ.add(key(x, z));
      HL.push({ x, z, sx, sz, h: R.r(6.5, 10.5) * (R.f() < 0.15 ? 1.35 : 1), ry: R.n(0.06), c: R.pick(HCOL), chim: R.f() < 0.6 }); }
    for (let i = 0; i < 9000 && HL.length < 1150; i++) { const side = R.f() < 0.5 ? -1 : 1, x = side * R.r(380, 1100), z = R.r(-900, -60), y = terrH(x, z); if (y > 220 || y < 3) continue; const sx = R.r(5, 8), sz = R.r(5, 7); if (!ok(x, z)) continue; occ.add(key(x, z));
      HL.push({ x, z, sx, sz, h: R.r(4, 6.5), ry: R.n(0.3), c: R.pick(HCOL), far: true }); } }
  HL.forEach((q) => { q.y0 = terrH(q.x, q.z) - 0.6; q.rh = Math.min(q.sx, q.sz) * 0.34; });
  const houses = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), hMat, HL.length); houses.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const roofGeo = (() => { const P = [], U = []; const q = (a, b, c, d) => { P.push(...a, ...c, ...b, ...a, ...d, ...c); U.push(0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1); };
    q([-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 1, 0], [-0.5, 1, 0]); q([0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 1, 0], [0.5, 1, 0]); P.push(-0.5, 0, 0.5, -0.5, 1, 0, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, 0.5); U.push(0, 0, 0.5, 1, 1, 0, 0, 0, 0.5, 1, 1, 0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals(); return g; })();
  const roofs = IM(roofGeo, STD({ color: 0xffffff, map: wrap(texTiles(), 2, 2), roughness: 0.8, side: THREE.DoubleSide }), HL.length); roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  HL.forEach((q, i) => { houses.setMatrixAt(i, M4c(q.x, q.y0, q.z, q.ry, q.sx, q.h, q.sz)); houses.setColorAt(i, lin(q.c)); roofs.setMatrixAt(i, M4c(q.x, q.y0 + q.h, q.z, q.ry, q.sx + 0.7, q.rh, q.sz + 0.7)); roofs.setColorAt(i, C3('#ffffff', '#a86a50', hsh(i) * 0.7)); });
  scene.add(houses, roofs);
  // chimneys; low stone walls round the plots; cobbled lanes winding down to the river; a stone bridge
  const CH = HL.filter((q) => q.chim), chims = IM(new THREE.BoxGeometry(0.6, 1.8, 0.6).translate(0, 0.9, 0), STD({ color: 0xd8ccb8, roughness: 0.9 }), CH.length); chims.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  CH.forEach((q, i) => { q.ci = i; chims.setMatrixAt(i, M4c(q.x + q.sx * 0.25, q.y0 + q.h + q.rh * 0.4, q.z, q.ry)); }); scene.add(chims);
  const WL = []; HL.forEach((q, i) => { if (q.far || hsh(i, 6) > 0.55) return; const w = q.sx + 5, d = q.sz + 5; [[0, d / 2, 0, w], [0, -d / 2, 0, w], [-w / 2, 0, Math.PI / 2, d], [w / 2, 0, Math.PI / 2, d]].forEach(([ox, oz, a, L]) => WL.push([q.x + ox, q.z + oz, a, L, i])); });
  const walls = IM(new THREE.BoxGeometry(1, 0.7, 0.35).translate(0, 0.35, 0), STD({ color: 0x8a8070, roughness: 1 }), WL.length); walls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  WL.forEach(([x, z, a, L], i) => walls.setMatrixAt(i, M4c(x, terrH(x, z) - 0.3, z, a, L, 1, 1))); scene.add(walls);
  { const laneM = STD({ color: 0x8a8274, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }); for (const x0 of [-300, -150, 20, 170, 320]) { const pos = [], idx = []; for (let k = 0; k <= 60; k++) { const z = lerp(-34, SHORE_Z, k / 60), x = x0 * (0.45 + 0.55 * ss(-36, SHORE_Z, z)) + 14 * Math.sin(z * 0.02 + x0);
      for (const s2 of [-1.8, 1.8]) pos.push(x + s2, terrH(x + s2, z) + 0.08, z); if (k) { const j = (k - 1) * 2; idx.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, laneM); m.receiveShadow = true; scene.add(m); } }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 40), STD({ color: 0xa89c84, roughness: 1 })); bridge.position.set(20, 2.2, riverZ(20)); bridge.castShadow = true; scene.add(bridge);
  const church = new THREE.Group(); { const stone = STD({ color: 0xc8b896, roughness: 0.9 }), cx = 60, cz = -200, y0 = terrH(cx, cz) - 0.3; church.position.set(cx, y0, cz); scene.add(church);
    const add = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; church.add(o); };
    add(new THREE.BoxGeometry(14, 11, 26), stone, 0, 5.5, 0); add(roofGeo.clone().scale(15, 5, 27), STD({ map: wrap(texTiles(), 3, 3), color: 0xffffff, side: THREE.DoubleSide }), 0, 11, 0);
    add(new THREE.BoxGeometry(7, 26, 7), stone, 0, 13, 14); add(new THREE.BoxGeometry(7.6, 1, 7.6), stone, 0, 26.5, 14); add(new THREE.ConeGeometry(5, 7, 4).rotateY(Math.PI / 4), STD({ color: 0xb8603e }), 0, 30.5, 14); }
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,200,0.8)'], [0.5, 'rgba(255,190,120,0.2)'], [1, 'rgba(255,170,90,0)']], 64);
  const lampP = []; HL.forEach((q, i) => { if (!q.far && i % 3 === 0) lampP.push(q.x + (q.sx / 2 + 2) * (i % 2 ? 1 : -1), q.y0 + 4.5, q.z + 3); });
  const lamps = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lampP, 3)), new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, map: glowTex, color: 0xffd090, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  lamps.renderOrder = 6; scene.add(lamps);
  const jetty = new THREE.Mesh(new THREE.BoxGeometry(5, 0.8, 70), STD({ color: 0x7a6248, roughness: 0.9 })); jetty.position.set(-80, 1.6, SHORE_Z - 30); jetty.castShadow = true; scene.add(jetty);
  const boats = []; { const R = RNG('boatsLl'); for (let i = 0; i < 12; i++) { const L = R.r(5, 9), grp = new THREE.Group(), hull = new THREE.Mesh(new THREE.BoxGeometry(L * 0.34, L * 0.2, L).translate(0, L * 0.1, 0), STD({ color: lin(R.pick(['#c8372d', '#2f6fb0', '#f2efe8', '#2a5a3a', '#e0a43a'])), roughness: 0.6 }));
    grp.add(hull); grp.rotation.order = 'YXZ'; scene.add(grp); boats.push({ grp, x: i < 5 ? -86 + (i % 2) * 12 : R.r(-400, 400), z: i < 5 ? SHORE_Z - 15 - i * 12 : SHORE_Z - R.r(40, 500), yaw: i < 5 ? 0 : R.r(0, 6), L, ph: R.r(0, 6) }); } }

  // --- trees today: olives and umbrella pines on the hills, a dark forest of pines up the mountains
  const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo; g2.applyMatrix4(m4); g2.computeVertexNormals();
      const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.62 + 0.38 * clamp(n.getY(i) * 0.5 + 0.5) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
  const olive = mergeG([[new THREE.CylinderGeometry(0.2, 0.35, 2.4, 6).translate(0, 1.2, 0), M4c(0, 0, 0, 0, 1, 1, 1, 0.1), '#5a4a3a', 0], [new THREE.IcosahedronGeometry(1.8, 1), M4c(0.3, 3.2, 0, 0, 1.2, 0.8, 1.1), '#6a7a4a', 1], [new THREE.IcosahedronGeometry(1.3, 1), M4c(-0.8, 2.8, 0.5), '#5a6a40', 1]]);
  const pine = mergeG([[new THREE.CylinderGeometry(0.25, 0.4, 7, 6).translate(0, 3.5, 0), M4c(0, 0, 0), '#4a3a2a', 0], [new THREE.SphereGeometry(3.2, 10, 6, 0, TAU, 0, Math.PI * 0.5), M4c(0, 6.5, 0, 0, 1.3, 0.6, 1.3), '#3a5030', 1]]);
  const TREES = []; { const R = RNG('treesLl'); for (let i = 0; i < 40000 && TREES.length < 9000; i++) { const x = R.r(-2500, 2500), z = R.r(-5000, 60), y = terrH(x, z); if (y < 4 || y > 650) continue; if (Math.hypot(x, z) < 30) continue;
    if (HL.some((h) => !h.far && Math.abs(h.x - x) < h.sx / 2 + 3 && Math.abs(h.z - z) < h.sz / 2 + 3)) continue; TREES.push({ x, y, z, type: y > 120 || R.f() < 0.4 ? 1 : 0, s: R.r(0.8, 1.5) * (1 + -z / 3000) }); } }
  const treeMat = STD({ vertexColors: true, roughness: 0.9 }), treeI = [olive, pine].map((geo, k) => { const m = IM(geo, treeMat, TREES.filter((t) => t.type === k).length); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; });
  { const cnt = [0, 0]; TREES.forEach((tr, i) => { tr.slot = cnt[tr.type]++; treeI[tr.type].setMatrixAt(tr.slot, M4c(tr.x, tr.y - 0.2, tr.z, i, tr.s, tr.s, tr.s)); }); }

  // --- the Carnian: tree ferns, cycads, tall conifers (Araucaria-like), horsetails at the water, lily pads, foreground fronds
  const frondG = (L, n, droop, col) => { const P = [], C = [], R = RNG('frondL', L * 10 + n); for (let f = 0; f < n; f++) { const a = f / n * TAU + R.r(-0.2, 0.2), Lf = L * R.r(0.8, 1.1), ca = lin(col), cb = lin('#2a4a20');
      const seg = 10, pts = []; for (let s2 = 0; s2 <= seg; s2++) { const u = s2 / seg, rr = Lf * u, y = 0.35 * Lf * Math.sin(u * 2.2) * 0.4 - droop * u * u * Lf * 0.4; pts.push([Math.cos(a) * rr, y, Math.sin(a) * rr, 0.16 * Lf * Math.sin(Math.PI * Math.min(1, u * 1.2)) * (1 - u * 0.4)]); }
      const px = -Math.sin(a), pz = Math.cos(a); for (let s2 = 0; s2 < seg; s2++) { const [x0, y0, z0, w0] = pts[s2], [x1, y1, z1, w1] = pts[s2 + 1]; for (const side of [-1, 1]) { const A = [x0, y0, z0], B = [x1, y1, z1], Cc = [x1 + px * w1 * side, y1 - w1 * 0.3, z1 + pz * w1 * side], D = [x0 + px * w0 * side, y0 - w0 * 0.3, z0 + pz * w0 * side];
        P.push(...A, ...B, ...Cc, ...A, ...Cc, ...D); const k = s2 / seg; for (let q = 0; q < 6; q++) { const cc = ca.clone().lerp(cb, k * 0.5 + (q > 1 ? 0.15 : 0)); C.push(cc.r, cc.g, cc.b); } } } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; };
  const vegMat = STD({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
  const treeFern = mergeG([[new THREE.CylinderGeometry(0.25, 0.4, 5, 7).translate(0, 2.5, 0), M4c(0, 0, 0), '#4a3a28', 0]]), fernCrown = frondG(3.4, 12, 0.9, '#5a8a32'), ground = frondG(1.6, 9, 0.6, '#6a9a3a');
  const conifer = mergeG([[new THREE.CylinderGeometry(0.3, 0.6, 22, 7).translate(0, 11, 0), M4c(0, 0, 0), '#5a4430', 0], ...[0, 1, 2, 3, 4].map((k) => [new THREE.ConeGeometry(3.4 - k * 0.5, 2.2, 8, 1, true).translate(0, 0, 0), M4c(0, 14 + k * 2.2, 0), '#2e4a28', 1])]);
  const cycad = mergeG([[new THREE.CylinderGeometry(0.5, 0.7, 1.6, 8).translate(0, 0.8, 0), M4c(0, 0, 0), '#6a5a3a', 0]]), cycadCrown = frondG(2.2, 14, 0.2, '#4a7a2a');
  const VEG = []; { const R = RNG('carnian'); for (let i = 0; i < 90000 && VEG.length < 12000; i++) { const near = R.f() < 0.45, x = near ? R.r(-260, 260) : R.r(-2200, 2200) * (0.3 + 0.7 * R.f()), z = near ? R.r(-200, 30) : R.r(-4500, 40), y = terrH(x, z); if (y < (near ? 6 : 30) || y > 600) continue; if (Math.hypot(x, z) < 12) continue; const swamp = y < 30;
    const d = Math.hypot(x, z); let kind = R.f(); kind = kind < 0.3 ? 0 : kind < 0.5 ? 1 : kind < 0.75 ? 2 : 3; if (swamp) kind = R.f() < 0.85 || d < 160 ? 0 : 1; else { if (kind === 1 && d < 220) kind = 3; if (kind === 0 && d < 70 && Math.abs(x) < 40) kind = 2; }
    VEG.push({ x, y, z, kind, s: R.r(0.8, 1.6) * (1 + -z / 2500) * (kind === 1 ? 1.3 : 1), ry: R.r(0, 6), t0: 34 + R.f() * 6 }); } }
  const vegI = { fernT: IM(treeFern, vegMat, VEG.filter((v) => v.kind === 0).length), fernC: IM(fernCrown, vegMat, VEG.filter((v) => v.kind === 0).length), con: IM(conifer, vegMat, VEG.filter((v) => v.kind === 1).length),
    cyc: IM(cycad, vegMat, VEG.filter((v) => v.kind === 2).length), cycC: IM(cycadCrown, vegMat, VEG.filter((v) => v.kind === 2).length), gr: IM(ground, vegMat, VEG.filter((v) => v.kind === 3).length, false) };
  Object.values(vegI).forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  { const c = [0, 0, 0, 0]; VEG.forEach((v) => { v.slot = c[v.kind]++; }); }
  const PADS = []; { const R = RNG('pads'); for (let i = 0; i < 1600; i++) PADS.push([R.r(-500, 500), R.r(-600, -60), R.r(0.6, 1.6), R.r(0, 6)]); }
  const pads = IM(new THREE.CircleGeometry(1, 10, 0.3, TAU - 0.3).rotateX(-Math.PI / 2), STD({ color: 0x4a7a2e, roughness: 0.6 }), PADS.length, false); pads.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(pads);
  const horse = IM(new THREE.CylinderGeometry(0.05, 0.08, 1, 5).translate(0, 0.5, 0), STD({ color: 0x5a7a3a }), 2400, false); horse.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(horse);
  // the volcano far up the valley, and the sprites of its plume; mist over the swamp
  const vd = dirV(VOLC.az, 0), vx = vd.x * VOLC.d, vz = vd.z * VOLC.d;
  const volcano = new THREE.Mesh(new THREE.ConeGeometry(2400, 1500, 32, 1, true), STD({ color: 0x4a4038, roughness: 1, flatShading: true })); volcano.position.set(vx, 700, vz); scene.add(volcano);
  const puffTex = texPuff('puffLl', 30, 0.45), pool = (n, map, o = {}) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map, transparent: true, depthWrite: false, opacity: 0 }, o))); s.visible = false; s.renderOrder = o.order ?? 8; scene.add(s); return s; });
  const plume = pool(220, puffTex, { fog: false, order: 2 }), vglow = pool(1, glowTex, { blending: THREE.AdditiveBlending, fog: false, order: 3 }), mist = pool(90, puffTex, { order: 7 });
  const VTOP = new THREE.Vector3(vx, 1450, vz);

  // --- the Herrerasaurus: one skinned body (tail, hips, chest, neck) rebuilt each frame along a bending spine, with a dorsal
  //     ridge, dark stripes over a tan back and a cream belly; a sculpted head (snout, brow ridges, nostrils, eye sockets, slit-
  //     pupil eyes, teeth, a hinged jaw with a red mouth); muscled legs with three-toed clawed feet; small arms with three claws
  const dino = new THREE.Group(); scene.add(dino); dino.visible = false;
  const skin = STD({ color: 0xffffff, vertexColors: true, roughness: 0.7, flatShading: true });
  const SP0 = [[0, 0.32, 4.9], [0, 0.48, 3.9], [0, 0.66, 2.9], [0, 0.86, 1.9], [0, 1.0, 1.0], [0, 1.06, 0.2], [0, 1.02, -0.6], [0, 1.0, -1.25], [0, 1.18, -1.75], [0, 1.55, -2.1], [0, 1.95, -2.32]];
  const SR0 = [0.03, 0.1, 0.19, 0.3, 0.42, 0.5, 0.52, 0.46, 0.3, 0.22, 0.19];
  const RINGS = 56, SEG = 14, bodyGeo = new THREE.BufferGeometry(); { const n = RINGS * SEG, idx = []; bodyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const col = new Float32Array(n * 3);
    for (let r2 = 0; r2 < RINGS; r2++) for (let k = 0; k < SEG; k++) { const u = r2 / (RINGS - 1), a = k / SEG * TAU, up = Math.cos(a), stripe = Math.sin(u * 46) > 0.35 && up > 0.1 ? 0.55 : 1, spot = hsh(r2 * 31 + k, 4) < 0.08 ? 0.75 : 1;
      const c = up > 0.35 ? lin('#6a3a18').multiplyScalar(stripe * spot) : up > -0.35 ? C3('#a8682a', '#c88a40', (up + 0.35) / 0.7).multiplyScalar(up > 0 ? stripe : 1) : C3('#d8b880', '#efd8a8', -up); const q = (r2 * SEG + k) * 3; col[q] = c.r; col[q + 1] = c.g; col[q + 2] = c.b; }
    for (let r2 = 0; r2 < RINGS - 1; r2++) for (let k = 0; k < SEG; k++) { const a0 = r2 * SEG + k, a1 = r2 * SEG + (k + 1) % SEG, b0 = a0 + SEG, b1 = a1 + SEG; idx.push(a0, b0, a1, a1, b0, b1); }
    bodyGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); bodyGeo.setIndex(idx); }
  const body = new THREE.Mesh(bodyGeo, skin); body.castShadow = true; body.frustumCulled = false; dino.add(body);
  const mergeD = (parts) => { const P = [], C = []; parts.forEach(([geo, m4, top, bot]) => { const g2 = (geo.index ? geo.toNonIndexed() : geo.clone()); g2.applyMatrix4(m4); const p = g2.attributes.position; let y0 = 1e9, y1 = -1e9; for (let i = 0; i < p.count; i++) { y0 = Math.min(y0, p.getY(i)); y1 = Math.max(y1, p.getY(i)); }
      const ct = lin(top), cb = lin(bot ?? top); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); const c = cb.clone().lerp(ct, (p.getY(i) - y0) / (y1 - y0 + 1e-6)); C.push(c.r, c.g, c.b); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; };
  const taper = (g, f) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), k = f(z); p.setXYZ(i, p.getX(i) * k[0], p.getY(i) * k[1] + (k[2] || 0), z); } g.computeVertexNormals(); return g; };
  const DP = {}; const head = new THREE.Group(); dino.add(head); DP.head = head;
  { const cran = taper(new THREE.IcosahedronGeometry(1, 3).scale(0.33, 0.3, 0.78).translate(0, 0.02, -0.62), (z) => { const u = clamp((-z - 0.2) / 1.2); return [1 - 0.5 * u, 1 - 0.38 * u, -0.07 * u]; });
    const g = mergeD([[cran, M4c(0, 0, 0), '#5a3214', '#c88a40'], [new THREE.SphereGeometry(0.1, 10, 8).scale(0.9, 0.55, 2.4), M4c(0.19, 0.26, -0.42, 0.15), '#3a200c', '#6a3a18'], [new THREE.SphereGeometry(0.1, 10, 8).scale(0.9, 0.55, 2.4), M4c(-0.19, 0.26, -0.42, -0.15), '#3a200c', '#6a3a18'],
      [new THREE.SphereGeometry(0.03, 6, 5), M4c(0.07, 0.07, -1.08), '#1a0c06'], [new THREE.SphereGeometry(0.03, 6, 5), M4c(-0.07, 0.07, -1.08), '#1a0c06'],
      [new THREE.SphereGeometry(0.11, 10, 8), M4c(0.26, 0.15, -0.34, 0, 0.45, 0.9, 1.1), '#1a0c06'], [new THREE.SphereGeometry(0.11, 10, 8), M4c(-0.26, 0.15, -0.34, 0, 0.45, 0.9, 1.1), '#1a0c06']]);
    head.add(new THREE.Mesh(g, skin));
    const eyeM = new THREE.MeshBasicMaterial({ color: 0xffc41a }); for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), eyeM); e.position.set(sx * 0.29, 0.16, -0.34); head.add(e); const pu = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0x120804 })); pu.position.set(sx * 0.345, 0.16, -0.35); pu.scale.set(0.5, 1.8, 0.5); head.add(pu); }
    const toothM = STD({ color: 0xf2ecd8, roughness: 0.4 }); for (let k = 0; k < 11; k++) for (const sx of [-1, 1]) { const tt = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.13, 4), toothM); tt.position.set(sx * (0.2 - k * 0.012), -0.2, -0.3 - k * 0.09); tt.rotation.x = Math.PI; head.add(tt); }
    DP.jaw = new THREE.Group(); DP.jaw.position.set(0, -0.17, 0.0); head.add(DP.jaw);
    const jg = mergeD([[taper(new THREE.IcosahedronGeometry(1, 2).scale(0.25, 0.11, 0.7).translate(0, -0.04, -0.66), (z) => { const u = clamp(-z / 1.3); return [1 - 0.45 * u, 1 - 0.2 * u, 0.02 * u]; }), M4c(0, 0, 0), '#c88a40', '#efd8a8']]); DP.jaw.add(new THREE.Mesh(jg, skin));
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 1.05).translate(0, 0.04, -0.6), STD({ color: 0x7a1414, roughness: 0.6 })); DP.jaw.add(mouth); const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.6).translate(0, 0.06, -0.45), STD({ color: 0xb84050 })); DP.jaw.add(tongue);
    for (let k = 0; k < 9; k++) for (const sx of [-1, 1]) { const tt = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.11, 4), toothM); tt.position.set(sx * (0.19 - k * 0.01), 0.07, -0.3 - k * 0.11); DP.jaw.add(tt); } }
  const leg = (sx) => { const th = new THREE.Group(); th.position.set(sx * 0.32, 0.95, 0.25); dino.add(th);
    th.add(new THREE.Mesh(mergeD([[new THREE.SphereGeometry(0.4, 10, 8).scale(0.75, 1.45, 1.0), M4c(0, -0.38, 0.05), '#7a4420', '#c88a40']]), skin));
    const sh = new THREE.Group(); sh.position.set(0, -1.05, 0.08); th.add(sh); sh.add(new THREE.Mesh(mergeD([[new THREE.CylinderGeometry(0.11, 0.2, 1.1, 8).translate(0, -0.55, 0), M4c(0, 0, 0), '#6a3a18', '#a8682a']]), skin));
    const mt = new THREE.Group(); mt.position.set(0, -1.08, 0); sh.add(mt); mt.add(new THREE.Mesh(mergeD([[new THREE.CylinderGeometry(0.07, 0.11, 0.62, 7).translate(0, -0.31, 0), M4c(0, 0, 0), '#5a3214', '#8a5424'],
      ...[-1, 0, 1].map((k) => [new THREE.ConeGeometry(0.07, 0.42, 5).rotateX(-Math.PI / 2).translate(0, 0, -0.21), M4c(k * 0.09, -0.62, -0.08, k * 0.35), '#4a2a10']), ...[-1, 0, 1].map((k) => [new THREE.ConeGeometry(0.03, 0.12, 4).rotateX(-Math.PI / 2), M4c(k * 0.15, -0.64, -0.46, k * 0.35), '#1a1008'])]), skin));
    return { th, sh, mt }; };
  DP.legs = [leg(-1), leg(1)];
  DP.arms = [-1, 1].map((sx) => { const a = new THREE.Group(); a.position.set(sx * 0.42, 0.85, -1.05); dino.add(a);
    a.add(new THREE.Mesh(mergeD([[new THREE.CylinderGeometry(0.08, 0.11, 0.55, 6).translate(0, -0.27, 0), M4c(0, 0, 0), '#7a4420', '#c88a40'], [new THREE.CylinderGeometry(0.05, 0.08, 0.45, 6).translate(0, -0.2, 0), M4c(0, -0.52, -0.06, 0, 1, 1, 1, -0.9), '#7a4420', '#c88a40'],
      ...[-1, 0, 1].map((k) => [new THREE.ConeGeometry(0.025, 0.16, 4), M4c(k * 0.04, -0.62, -0.38, 0, 1, 1, 1, -2.0), '#1a1008'])]), skin)); return a; });
  // the dorsal ridge: small scutes along the spine (placed each frame)
  const scutes = IM(new THREE.ConeGeometry(0.06, 0.16, 4), STD({ color: 0x3a1e0a, roughness: 0.7 }), 30, false); scutes.frustumCulled = false; dino.add(scutes);
  DP.SP0 = SP0; DP.SR0 = SR0; DP.bodyGeo = bodyGeo; DP.RINGS = RINGS; DP.SEG = SEG; DP.scutes = scutes;
  // --- our balcony: a wooden railing (rail, balusters, bottom rail) across the bottom of the frame; foreground fronds later
  const bal = new THREE.Group(); scene.add(bal); const by = EYE - 1.62;
  { const wood = STD({ color: 0x6a3a26, roughness: 0.8 }); const top = new THREE.Mesh(new THREE.BoxGeometry(12, 0.12, 0.16), wood); top.position.set(0, by + 1.0, -1.1); bal.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 0.12), wood); bot.position.set(0, by + 0.12, -1.1); bal.add(bot);
    for (let k = 0; k <= 40; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.06), wood); b.position.set(-6 + k * 0.3, by + 0.56, -1.1); bal.add(b); }
    const fl = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 3), STD({ color: 0x8a6448, roughness: 0.9 })); fl.position.set(0, by - 0.1, 0.4); bal.add(fl);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(14, by - HILL + 2, 12).translate(0, (by - HILL) / 2 - 0.5, 6), STD({ color: 0xe8dcc4, roughness: 0.9 })); housing.position.y = HILL; scene.add(housing); }
  const FG = []; { const R = RNG('fgFronds'); for (let i = 0; i < 14; i++) FG.push({ x: R.r(-3.2, 3.2), z: R.r(-2.4, -1.4), y: by - R.r(0.4, 1.2), ry: R.r(0, 6), s: R.r(0.5, 0.9), t0: 38 + R.r(0, 4) }); }
  const fg = IM(frondG(2.2, 7, 0.7, '#4a7a2a'), vegMat, FG.length, false); fg.instanceMatrix.setUsage(THREE.DynamicDrawUsage); fg.frustumCulled = false; scene.add(fg);

  G = { cv, r, scene, cam, chims, CH, walls, WL, bridge, sky, skyU, hemi, sun, jungleU, seaMat, seaMesh, WINU, HL, houses, roofs, church, lamps, jetty, boats, TREES, treeI, VEG, vegI, PADS, pads, horse, volcano, plume, vglow, mist, VTOP, dino, DP, bal, FG, fg, glowTex };
  return G;
}
