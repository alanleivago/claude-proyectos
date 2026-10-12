
// =====================================================================
//  WORLD — the hill, the valley town, far hills, trees, clouds, the Moon, the debris; the black hole pass is in bh.js
// =====================================================================
// the ground: a grassy hilltop at the origin, the valley floor, rolling far hills (shared by JS and GLSL)
function terrH(x, z) {
  const r2 = (x * x + (z - 10) * (z - 10)) / (140 * 140), hill = HILL * Math.exp(-r2 * 1.6) * (1 + 0.04 * Math.sin(x * 0.07) * Math.sin(z * 0.05));
  const d = Math.hypot(x, z), far = ss(1700, 3600, d) * (90 + 70 * Math.sin(x * 0.0021 + 1.3) * Math.sin(z * 0.0017 + 0.4) + 40 * Math.sin(x * 0.0061 - z * 0.0043));
  return Math.max(hill, 0) + far + 1.5 * Math.sin(x * 0.021) * Math.sin(z * 0.017) + 0.4 * Math.sin(x * 0.13 + z * 0.11);
}
// the town's houses on the valley floor: blocks along a few streets, denser at the centre; [x, z, sx, sz, h, wall, roof, onAt]
function townList() {
  const R = RNG('townBH'), L = [], WALL = ['#e9dcc4', '#d9a77e', '#c97a62', '#f0e6d2', '#a9c0bf', '#e2c87e', '#c99a72', '#d8c2aa', '#b4c0a2', '#d6a6a0', '#f2e2c8'], ROOF = ['#b5523a', '#a8472f', '#c46a48', '#8a4a3a', '#9a5a40', '#6a6a70'];
  const centre = [[60, -620], [-260, -900], [380, -1150], [-80, -1500], [520, -700]];
  for (let i = 0; i < 1400 && L.length < 820; i++) {
    const c = R.pick(centre), a = R.r(0, TAU), rr = Math.pow(R.f(), 0.7) * R.r(120, 420), x = c[0] + Math.cos(a) * rr, z = c[1] + Math.sin(a) * rr * 0.8;
    if (Math.hypot(x, z - 10) < 210 || z > -150) continue;
    const gx = Math.round(x / 14) * 14, gz = Math.round(z / 14) * 14; if (L.some((h) => Math.abs(h[0] - gx) < 10 && Math.abs(h[1] - gz) < 10)) continue;
    const sx = R.r(7, 12), sz = R.r(7, 12), fl = Math.floor(R.r(1, 4.6)) + (Math.hypot(x - c[0], z - c[1]) < 120 ? 1 : 0);
    L.push([gx + R.r(-1.5, 1.5), gz + R.r(-1.5, 1.5), sx, sz, fl * 3.1 + R.r(0.3, 1), R.pick(WALL), R.pick(ROOF)]);
  }
  for (let i = 0; i < 26; i++) { const a = R.r(-2.6, -0.5), rr = R.r(150, 200), x = Math.cos(a) * rr, z = 10 + Math.sin(a) * rr; L.push([x, z, R.r(7, 10), R.r(7, 10), R.r(4, 7.5), R.pick(WALL), R.pick(ROOF)]); }   // a few houses at the foot of the hill
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
  scene.fog = new THREE.Fog(0x4a4a66, 400, 7000);
  const cam = new THREE.PerspectiveCamera(64, W / H, 0.2, 80000); cam.rotation.order = 'YXZ'; scene.add(cam);

  // --- sky dome (no tone mapping): dusk -> night, a warm band where the sun set (left), the golden glow of the disk around the hole
  const skyU = { top: { value: lin('#2a3360') }, mid: { value: lin('#6a5a8a') }, hor: { value: lin('#e8a070') }, sunset: { value: dirV(-55 * DEG, -4 * DEG) }, dusk: { value: 1 },
    bhDir: { value: dirV(BH_AZ, 21 * DEG) }, glow: { value: 0 }, glowW: { value: 0.02 }, gold: { value: lin('#ffcf8a') }, starA: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(70000, 64, 32), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `${SKY_GLSL}
      varying vec3 vDir;
      void main(){ gl_FragColor = vec4(skyColor(normalize(vDir)), 1.0);
        #include <encodings_fragment>
      }` }));
  sky.renderOrder = -3; scene.add(sky);
  const stars = null;   // the stars live in the sky shader (shared with the lensing pass)

  // --- lights: dusk sky dome, moonlight; later the disk's golden light from the hole
  const hemi = new THREE.HemisphereLight(0x8a90c0, 0x3a3028, 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xc8d0ff, 0.7); scene.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 5; key.shadow.blurSamples = 16;
  Object.assign(key.shadow.camera, { left: -420, right: 420, top: 420, bottom: -420, near: 10, far: 4000 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.6;

  // --- terrain: grass, fields, woods and rock by height and noise; cracks of glowing rock open at the end
  const crackU = { value: 0 }, timeU = { value: 0 };
  { const N = 300, g = new THREE.PlaneGeometry(2, 2, N, N); g.rotateX(-Math.PI / 2);
    // denser near the hill: a radial remap from the unit square to +-7000 m
    const p = g.attributes.position, cols = [];
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i), m = Math.max(Math.abs(u), Math.abs(v)) + 1e-9, k = 7000 * Math.pow(m, 2.2) / m; const x = u * k, z = v * k; p.setXYZ(i, x, terrH(x, z), z);
      const y = p.getY(i), nA = 0.5 + 0.5 * Math.sin(x * 0.013) * Math.sin(z * 0.011), nB = 0.5 + 0.5 * Math.sin(x * 0.05 + 1) * Math.sin(z * 0.043);
      const grass = C3('#4f6a34', '#7a8a46', nB), wood = lin('#2f4026'), field = C3('#8a8a4a', '#6a7a3a', nA), rock = lin('#6a6458');
      let c = grass.clone().lerp(field, ss(250, 600, Math.hypot(x, z)) * nA).lerp(wood, ss(0.62, 0.8, nA) * (1 - ss(150, 400, Math.hypot(x, z)) * 0.5)); c.lerp(rock, ss(120, 260, y) * 0.7);
      cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const grassTex = wrap(g3Tex((x, w) => { const R = RNG('grassT'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); speck(x, w, w, 22000, ['rgba(40,60,20,0.25)', 'rgba(200,210,150,0.2)', 'rgba(90,70,40,0.18)'], R, 1, 3);
      for (let k = 0; k < 900; k++) { x.strokeStyle = `rgba(${R.f() < 0.5 ? '50,70,30' : '160,170,110'},0.35)`; x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, w); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(2), py - R.r(4, 10)); x.stroke(); } }, 512, 512));
    grassTex.anisotropy = ANI;
    const m = STD({ vertexColors: true, map: grassTex, roughness: 1 });
    m.onBeforeCompile = (sh) => { sh.uniforms.uCrack = crackU; sh.uniforms.uT = timeU;
      sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;').replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_UV\n vUv = position.xz / 6.0;\n#endif');
      sh.fragmentShader = 'uniform float uCrack, uT; varying vec3 vWp;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec2 q = vWp.xz * 0.045; float c1 = abs(sin(q.x * 1.3 + sin(q.y * 0.7) * 2.0) * sin(q.y * 1.1 + sin(q.x * 0.9) * 2.0)), c2 = abs(sin(q.x * 3.1 - q.y * 2.3 + sin(q.y * 1.7)) );
          float net = (1.0 - smoothstep(0.0, 0.13, c1)) + 0.7 * (1.0 - smoothstep(0.0, 0.08, c2)) * step(0.3, sin(q.x * 0.5 + q.y * 0.3));
          float grow = smoothstep(0.0, 1.0, uCrack * 1.6 - 0.6 * fract(sin(dot(floor(q * 0.5), vec2(12.9, 78.2))) * 437.5));
          vec3 lava = mix(vec3(1.0, 0.3, 0.04), vec3(1.0, 0.78, 0.35), smoothstep(0.5, 1.0, net));
          totalEmissiveRadiance += lava * net * grow * (2.6 + 0.8 * sin(uT * 3.0 + vWp.x * 0.1)); diffuseColor.rgb *= 1.0 - 0.6 * grow; }`); };
    const terr = new THREE.Mesh(g, m); terr.receiveShadow = true; scene.add(terr); }

  // --- houses: one instanced box with a world-sized facade + a light sheet (windows switch on at dusk, flicker, go dark when the grid fails)
  const facTex = wrap(texFacade()), litTex = wrap(texWindowsLit()), roofTex = wrap(texRoof()); facTex.anisotropy = ANI;
  const WINU = { uOn: { value: 0.3 }, uT: { value: 0 }, uPow: { value: 1 } };
  const houseMat = STD({ color: 0xffffff, roughness: 0.9, emissive: 0xffffff }); houseMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uFacM: { value: facTex }, uFacE: { value: litTex }, uOn: WINU.uOn, uWT: WINU.uT, uPow: WINU.uPow });
    sh.vertexShader = 'varying vec2 vFac;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 ip = instanceMatrix[3].xyz; float hs = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 lp = (position + 0.5) * sc; vFac = abs(normal.x) > 0.5 ? vec2(lp.z, lp.y - 4.0) : vec2(lp.x, lp.y - 4.0); vFac = vFac / 24.0 + vec2(floor(hs * 8.0) / 8.0, floor(fract(hs * 7.3) * 8.0) / 8.0);`);
    sh.fragmentShader = 'uniform sampler2D uFacM, uFacE; uniform float uOn, uWT, uPow; varying vec2 vFac;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= texture2D(uFacM, vFac).rgb;')
      .replace('#include <emissivemap_fragment>', `{ vec4 e = texture2D(uFacE, vFac); float th = (e.a - 0.25) / 0.74; float cellH = fract(sin(dot(floor(vFac * 8.0), vec2(41.3, 17.7))) * 9137.1);
        float on = step(th, uOn) * step(0.05, e.a); float tv = step(e.r * 1.2, e.b); float fl = 1.0 - tv * (0.25 + 0.25 * sin(uWT * (5.0 + 9.0 * cellH) + cellH * 40.0));
        float dead = step(uPow, cellH); totalEmissiveRadiance = e.rgb * on * fl * 9.0 * (1.0 - dead) * min(1.0, uPow * 1.5); }`);
  };
  const roofGeo = (() => { const P = [], U = [];
    const q = (a, b, c, d, ua, ub, uc, ud) => { P.push(...a, ...c, ...b, ...a, ...d, ...c); U.push(...ua, ...uc, ...ub, ...ua, ...ud, ...uc); };
    q([-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 1, 0], [-0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1]); q([0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 1, 0], [0.5, 1, 0], [0, 0], [1, 0], [1, 1], [0, 1]);
    P.push(-0.5, 0, 0.5, -0.5, 1, 0, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, 0.5); U.push(0, 0, 0.5, 1, 1, 0, 0, 0, 0.5, 1, 1, 0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals(); return g; })();
  const HL = townList(), houses = IM(new THREE.BoxGeometry(1, 1, 1), houseMat, HL.length), roofs = IM(roofGeo, STD({ color: 0xffffff, roughness: 0.8, map: wrap(roofTex, 3, 2), side: THREE.DoubleSide }), HL.length);
  houses.instanceMatrix.setUsage(THREE.DynamicDrawUsage); roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const hInfo = []; { const R = RNG('houseRot'); HL.forEach(([x, z, sx, sz, h, wc, rc], i) => { const y0 = terrH(x, z) - 0.5, ry = R.f() < 0.5 ? 0 : Math.PI / 2, rh = Math.min(sx, sz) * R.r(0.25, 0.36);
    houses.setMatrixAt(i, M4c(x, y0 + h / 2, z, ry, sx, h, sz)); houses.setColorAt(i, lin(wc)); roofs.setMatrixAt(i, M4c(x, y0 + h, z, ry + Math.PI / 2, sz + 0.5, rh, sx + 0.6)); roofs.setColorAt(i, lin(rc));
    // the house tears free at t0 (nearer the hole's line first), tumbles and is pulled up into the sky
    const t0 = 40 + 10 * clamp((Math.hypot(x, z) - 250) / 1400) + R.r(0, 5), spin = [R.n(0.5), R.n(0.5), R.n(0.5)];
    hInfo.push({ x, z, y0, y: y0 + h, sx, sz, h, ry, rh, c: wc, t0, sp: R.r(0.7, 1.4), spin, dx: R.n(0.25), dz: R.n(0.25) }); }); }
  scene.add(houses, roofs);
  // bare earth round every house (yards, paths, a darker footprint), the grass kept between them
  const dirtTex = g3Tex((x, w) => { const R = RNG('dirt'); const g = x.createRadialGradient(w / 2, w / 2, w * 0.1, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(120,96,70,0.95)'); g.addColorStop(0.55, 'rgba(110,88,62,0.8)'); g.addColorStop(1, 'rgba(100,80,56,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, w); for (let k = 0; k < 3000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '60,46,32' : '170,150,120'},${R.r(0.1, 0.3)})`; x.fillRect(R.r(w * 0.1, w * 0.9), R.r(w * 0.1, w * 0.9), 2, 2); } }, 128, 128);
  const dirt = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: dirtTex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }), HL.length, false);
  { const R = RNG('dirtR'); hInfo.forEach((q, i) => dirt.setMatrixAt(i, M4c(q.x + R.n(1), terrH(q.x, q.z) + 0.05, q.z + R.n(1), R.r(0, 3), q.sx * R.r(1.8, 2.6), 1, q.sz * R.r(1.8, 2.6)))); }
  dirt.receiveShadow = true; scene.add(dirt);
  // a church and a water tower in the town
  { const stone = STD({ color: 0xcfc2a6, roughness: 0.9 }), cx = 60, cz = -640, y0 = terrH(cx, cz);
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(7, 30, 7), stone); t1.position.set(cx, y0 + 15, cz); t1.castShadow = true; scene.add(t1);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(5.5, 12, 4).rotateY(Math.PI / 4), STD({ color: 0x4f6a70 })); sp.position.set(cx, y0 + 36, cz); sp.castShadow = true; scene.add(sp);
    const nave = new THREE.Mesh(new THREE.BoxGeometry(12, 13, 26), stone); nave.position.set(cx, y0 + 6.5, cz - 18); nave.castShadow = true; scene.add(nave);
    const wt = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 7, 16), STD({ color: 0xb8b4ac })); wt.position.set(-260, terrH(-260, -880) + 26, -880); wt.castShadow = true; scene.add(wt);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 22, 8), STD({ color: 0x8a8680 })); leg.position.set(-260, terrH(-260, -880) + 11, -880); scene.add(leg); }
  // street lights in the town's quarters
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,240,210,0.8)'], [0.5, 'rgba(255,190,110,0.18)'], [1, 'rgba(255,170,90,0)']], 64);
  const lampP = []; { const R = RNG('lampsBH'); HL.forEach(([x, z], i) => { if (i % 2) return; lampP.push(x + R.r(-7, 7), terrH(x, z) + 5, z + R.r(-7, 7)); }); }
  // the road down the hill to the town: an asphalt ribbon with a centre line, lamp posts on alternate sides, pools of light, two cars
  const ROADP = []; for (let k = 0; k <= 160; k++) { const u = k / 160, x = 18 * Math.sin(u * 9.0) * (1 - u) + lerp(-6, 60, u * u) + 22 * Math.sin(u * 3.1 + 0.5) * u, z = lerp(-40, -600, u); ROADP.push([x, z]); }
  { const pos = [], uvs = [], idx = []; let acc = 0;
    ROADP.forEach(([x, z], k) => { const [x2, z2] = ROADP[Math.min(k + 1, ROADP.length - 1)], [x0, z0] = ROADP[Math.max(k - 1, 0)], tx = x2 - x0, tz = z2 - z0, L = Math.hypot(tx, tz) || 1, nx = -tz / L, nz = tx / L;
      if (k) acc += Math.hypot(x - ROADP[k - 1][0], z - ROADP[k - 1][1]);
      for (const s of [-1, 1]) { const px = x + nx * 3.2 * s, pz = z + nz * 3.2 * s; pos.push(px, terrH(px, pz) + 0.12, pz); uvs.push(s < 0 ? 0 : 1, acc / 8); } });
    for (let k = 0; k < ROADP.length - 1; k++) { const a = k * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    const roadTex = wrap(g3Tex((x, w, h) => { const R = RNG('roadBH'); x.fillStyle = '#3e3e40'; x.fillRect(0, 0, w, h); speck(x, w, h, 6000, ['rgba(20,20,22,0.3)', 'rgba(140,140,140,0.2)'], R, 1, 2);
      x.fillStyle = 'rgba(235,230,210,0.85)'; x.fillRect(w * 0.48, 0, w * 0.04, h * 0.45); x.fillStyle = 'rgba(220,215,200,0.6)'; x.fillRect(w * 0.03, 0, w * 0.02, h); x.fillRect(w * 0.95, 0, w * 0.02, h); }, 64, 256));
    const road = new THREE.Mesh(g, STD({ map: roadTex, roughness: 0.85 })); road.receiveShadow = true; scene.add(road); }
  const roadLamps = []; for (let k = 4; k < ROADP.length - 2; k += 5) { const [x, z] = ROADP[k], [x2, z2] = ROADP[k + 1], tx = x2 - x, tz = z2 - z, L = Math.hypot(tx, tz), s = (k / 5) % 2 ? 1 : -1; const px = x - tz / L * 4.3 * s, pz = z + tx / L * 4.3 * s; roadLamps.push([px, terrH(px, pz), pz, s, Math.atan2(tx, tz)]); }
  const rlPole = IM(new THREE.CylinderGeometry(0.08, 0.12, 6.5, 8).translate(0, 3.25, 0), STD({ color: 0x2a2e33, metalness: 0.4, roughness: 0.5 }), roadLamps.length), rlArm = IM(new THREE.BoxGeometry(1.6, 0.09, 0.09), STD({ color: 0x2a2e33 }), roadLamps.length), rlHead = IM(new THREE.BoxGeometry(0.55, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }), roadLamps.length, false);
  const poolTex = g3Radial([[0, 'rgba(255,200,130,0.6)'], [0.5, 'rgba(255,170,90,0.22)'], [1, 'rgba(255,160,80,0)']], 64), rlPool = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4 }), roadLamps.length, false);
  roadLamps.forEach(([x, y, z, s, a], i) => { const ox = Math.cos(a) * -s, oz = -Math.sin(a) * -s; rlPole.setMatrixAt(i, M4c(x, y, z)); rlArm.setMatrixAt(i, M4c(x + ox * 0.75, y + 6.45, z + oz * 0.75, a + Math.PI / 2)); rlHead.setMatrixAt(i, M4c(x + ox * 1.5, y + 6.35, z + oz * 1.5, a)); rlPool.setMatrixAt(i, M4c(x + ox * 2.2, terrH(x + ox * 2.2, z + oz * 2.2) + 0.2, z + oz * 2.2, 0, 13, 1, 13)); lampP.push(x + ox * 1.5, y + 6.2, z + oz * 1.5); });
  scene.add(rlPole, rlArm, rlHead, rlPool);
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lampP, 3));
  const lamps = new THREE.Points(lg, new THREE.PointsMaterial({ size: 9, map: glowTex, color: 0xffd7a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); lamps.renderOrder = 6; scene.add(lamps);
  const carLights = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Array(12).fill(0), 3)), new THREE.PointsMaterial({ size: 3.5, map: glowTex, color: 0xfff2d8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); carLights.frustumCulled = false; carLights.renderOrder = 6; scene.add(carLights);
  // trees: real trees, not spheres — broadleaf (a tapered trunk, branches, 7-11 lumpy leaf clusters, darker inside) and conifers (stacked whorls)
  const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo; g2.applyMatrix4(m4); g2.computeVertexNormals();
      const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.62 + 0.38 * clamp(n.getY(i) * 0.5 + 0.5 + (p.getY(i) - shade) * 0.05) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
  const lumpy = (r, R) => { const g = new THREE.IcosahedronGeometry(r, 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + 0.18 * Math.sin(v.x * 3.1 + R) * Math.sin(v.y * 2.7 + R * 2) + 0.12 * Math.sin(v.z * 5.3 + R * 3); p.setXYZ(i, v.x * k, v.y * k * 0.85, v.z * k); } return g; };
  const broadleaf = (seed, leaf) => { const R = RNG('tree', seed), parts = [[new THREE.CylinderGeometry(0.16, 0.32, 4.2, 7).translate(0, 2.1, 0), M4c(0, 0, 0, 0, 1, 1, 1, R.n(0.04), R.n(0.04)), '#4a3828', 0]];
    for (let b = 0; b < 4; b++) { const a = b / 4 * TAU + R.r(0, 1); parts.push([new THREE.CylinderGeometry(0.06, 0.12, 2.2, 5).translate(0, 1.1, 0), M4c(0, 2.8 + R.r(0, 0.8), 0, a, 1, 1, 1, 0.9, 0), '#4a3828', 0]); }
    const n = 7 + Math.floor(R.f() * 5); for (let k = 0; k < n; k++) { const a = R.r(0, TAU), rr = k === 0 ? 0 : R.r(0.8, 2.0), y = 4.6 + R.r(-0.6, 1.6) + (k === 0 ? 0.8 : 0), s = R.r(1.0, 1.6) * (k === 0 ? 1.3 : 1);
      parts.push([lumpy(s, R.r(0, 9)), M4c(Math.cos(a) * rr, y, Math.sin(a) * rr, R.r(0, 3)), R.pick(leaf), 4.2]); }
    return mergeG(parts); };
  const conifer = (seed) => { const R = RNG('conif', seed), parts = [[new THREE.CylinderGeometry(0.1, 0.22, 2, 6).translate(0, 1, 0), M4c(0, 0, 0), '#3e2e22', 0]];
    for (let k = 0; k < 6; k++) { const y = 1.4 + k * 1.05, s = 1 - k / 7; parts.push([new THREE.ConeGeometry(2.0 * s, 2.0, 9, 1).translate(0, 1, 0), M4c(0, y, 0, R.r(0, 3), 1, 1, 1, R.n(0.05), R.n(0.05)), R.pick(['#2e4a2a', '#34522e', '#2a4426']), 1.4 + 3]); }
    return mergeG(parts); };
  const TGEO = [broadleaf(1, ['#4f6e34', '#5a7a38', '#46642e']), broadleaf(2, ['#6a7a3a', '#5f7432', '#73843e']), conifer(3)];
  const treeMat = STD({ vertexColors: true, roughness: 0.9 }), R0 = RNG('treesBH'), trees = [];
  for (let i = 0; i < 1100; i++) { let x, z; if (i < 40) { const a = R0.r(-3.0, 0.2), rr = R0.r(22, 85); x = Math.cos(a) * rr; z = Math.sin(a) * rr; if (z < 0 && Math.abs(x) < 0.9 * -z + 26) continue; } else { x = R0.r(-1700, 1700); z = R0.r(-2500, 300); if (Math.hypot(x, z - 10) < 70) continue; if (ROADP.some(([rx, rz]) => Math.abs(rx - x) < 7 && Math.abs(rz - z) < 7)) continue; }
    trees.push({ x, y: terrH(x, z) - 0.1, z, s: R0.r(0.8, 1.6), ph: R0.f(), near: i < 40, type: R0.f() < 0.28 ? 2 : R0.f() < 0.5 ? 0 : 1 }); }
  const treeI = TGEO.map((geo, k) => { const m = IM(geo, treeMat, trees.filter((t) => t.type === k).length); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; });
  { const cnt = [0, 0, 0]; trees.forEach((tr) => { tr.slot = cnt[tr.type]++; treeI[tr.type].setMatrixAt(tr.slot, M4c(tr.x, tr.y, tr.z, tr.ph * 6, tr.s, tr.s, tr.s)); }); }
  // the hilltop: a wooden fence along the edge, a bench, a lamp post, rocks and grass
  const wood = STD({ color: 0x8a6a48, roughness: 0.85 }), dark = STD({ color: 0x2a2e33, roughness: 0.5, metalness: 0.4 });
  const fenceN = 26, posts = IM(new THREE.BoxGeometry(0.12, 1.1, 0.12).translate(0, 0.55, 0), wood, fenceN), rails = IM(new THREE.BoxGeometry(0.06, 0.08, 2.4), wood, fenceN * 2);
  const fence = []; for (let i = 0; i < fenceN; i++) { const x = (i - fenceN / 2) * 2.3, z = -16 - 0.02 * (i - fenceN / 2) ** 2, y = terrH(x, z); fence.push([x, y, z]); posts.setMatrixAt(i, M4c(x, y, z)); }
  fence.forEach(([x, y, z], i) => { if (i === fenceN - 1) return; const [x2, y2, z2] = fence[i + 1], ang = Math.atan2(x2 - x, z2 - z), len = Math.hypot(x2 - x, z2 - z);
    for (const hh of [0.5, 0.95]) rails.setMatrixAt(i * 2 + (hh > 0.7 ? 1 : 0), M4c((x + x2) / 2, (y + y2) / 2 + hh, (z + z2) / 2, ang, 1, 1, len / 2.4)); });
  scene.add(posts, rails);
  const bench = new THREE.Group(); bench.position.set(-4.2, terrH(-4.2, -10), -10); bench.rotation.y = 0.2; scene.add(bench);
  [[0, 0.45, 0, 1.9, 0.06, 0.5], [0, 0.75, 0.24, 1.9, 0.4, 0.05], [-0.8, 0.22, 0, 0.06, 0.44, 0.45], [0.8, 0.22, 0, 0.06, 0.44, 0.45]].forEach(([x, y, z, a, b, c], k) => { const m = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), k > 1 ? dark : wood); m.position.set(x, y, z); m.castShadow = true; bench.add(m); });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 4.2, 8).translate(0, 2.1, 0), dark); post.position.set(5, terrH(5, -8), -8); post.castShadow = true; scene.add(post);
  const bulb = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([5, terrH(5, -8) + 4.25, -8], 3)), new THREE.PointsMaterial({ size: 2.4, map: glowTex, color: 0xffe0b0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(bulb);
  const RR = RNG('rocksBH'), rockN = 160, rocks = IM(new THREE.DodecahedronGeometry(1, 0), STD({ color: 0x8a8478, roughness: 0.95, flatShading: true }), rockN), rockL = [];
  for (let i = 0; i < rockN; i++) { const a = RR.r(0, TAU), rr = RR.r(3, 60), x = Math.cos(a) * rr, z = 10 + Math.sin(a) * rr * 0.8 - 14, s = RR.r(0.15, 0.9); rockL.push({ x, y: terrH(x, z), z, s, sp: RR.r(0.6, 1.6), t0: RR.r(33.5, 46), rx: RR.r(0, 3), dx: RR.n(0.25), dz: RR.n(0.25) }); }
  rocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); rocks.frustumCulled = false; scene.add(rocks);
  // grass: clumps of curved, tapering blades (dark at the root, light at the tip), dense round the camera
  const clumpG = (() => { const P = [], C = [], R = RNG('blades'); for (let b = 0; b < 11; b++) { const a = R.r(0, TAU), lean = R.r(0.15, 0.55), hgt = R.r(0.22, 0.48), w = R.r(0.012, 0.022), ox = R.n(0.05), oz = R.n(0.05), dx = Math.cos(a), dz = Math.sin(a);
      const seg = 4, pts = []; for (let s = 0; s <= seg; s++) { const u = s / seg, bend = lean * u * u * hgt; pts.push([ox + dx * bend, u * hgt, oz + dz * bend, w * (1 - u * 0.92)]); }
      const px = -dz, pz = dx; for (let s = 0; s < seg; s++) { const [x0, y0, z0, w0] = pts[s], [x1, y1, z1, w1] = pts[s + 1], c0 = lerp(0.35, 1, s / seg), c1 = lerp(0.35, 1, (s + 1) / seg);
        const A = [x0 - px * w0, y0, z0 - pz * w0], B2 = [x0 + px * w0, y0, z0 + pz * w0], Cc = [x1 + px * w1, y1, z1 + pz * w1], D = [x1 - px * w1, y1, z1 - pz * w1];
        P.push(...A, ...B2, ...Cc, ...A, ...Cc, ...D); [c0, c0, c1, c0, c1, c1].forEach((k) => C.push(0.34 * k, 0.46 * k, 0.2 * k)); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; })();
  const tuftN = 14000, tufts = IM(clumpG, STD({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }), tuftN, false), tuftL = [];
  for (let i = 0; i < tuftN; i++) { const a = RR.r(0, TAU), rr = Math.pow(RR.f(), 0.85) * 55, x = Math.cos(a) * rr, z = Math.sin(a) * rr - 14; tuftL.push([x, terrH(x, z), z, RR.r(0.35, 0.75), RR.r(0, 9)]); tufts.setColorAt(i, C3('#c8d0a0', '#ffffff', RR.f())); }
  tufts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tufts.frustumCulled = false; tufts.receiveShadow = true; scene.add(tufts);
  // roof tiles and planks torn from the town and the hill (fall upwards from 34 s)
  const debN = 900, deb = IM(new THREE.BoxGeometry(1, 1, 1), STD({ roughness: 0.8 }), debN, false), debL = [];
  { const R = RNG('debBH'); for (let i = 0; i < debN; i++) { const fromTown = i > 260, h = fromTown ? HL[Math.floor(R.f() * HL.length)] : null;
    const a0 = R.r(0, TAU), r0 = R.r(18, 90), x = fromTown ? h[0] + R.n(4) : Math.cos(a0) * r0, z = fromTown ? h[1] + R.n(4) : 6 + Math.sin(a0) * r0, y = fromTown ? terrH(h[0], h[1]) + h[4] : terrH(x, z);
    const k = fromTown ? 1 : 0.45;
    debL.push({ x, y, z, t0: R.r(34, 50), sp: R.r(0.5, 1.5), s: [R.r(0.3, 1.4) * k, R.r(0.05, 0.25) * k, R.r(0.3, 1.0) * k], c: R.pick(['#b5523a', '#a8472f', '#8a6a48', '#c46a48', '#6a6458', '#d8c2aa']), rx: R.r(1, 4), dx: R.n(0.3), dz: R.n(0.3) }); deb.setColorAt(i, lin(debL[i].c)); } }
  deb.instanceMatrix.setUsage(THREE.DynamicDrawUsage); deb.frustumCulled = false; scene.add(deb);
  // clouds: cumulus heaps made of many billows, lit from above (the glow), shaded below; they stream towards the hole and the camera climbs through them
  const billowTex = [0, 1, 2].map((k) => g3Tex((x, w) => { const R = RNG('billowBH', k);
    for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), d = Math.pow(R.f(), 0.7) * w * 0.3, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.7, s = R.r(w * 0.07, w * 0.18) * (1 - d / (w * 0.45));
      const g = x.createRadialGradient(px, py - s * 0.35, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.62)'); g.addColorStop(0.5, 'rgba(225,225,230,0.45)'); g.addColorStop(0.85, 'rgba(160,160,175,0.2)'); g.addColorStop(1, 'rgba(120,120,140,0)'); x.fillStyle = g; x.fillRect(px - s, py - s, 2 * s, 2 * s); }
    const sh = x.createLinearGradient(0, w * 0.3, 0, w * 0.85); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(40,40,60,0.35)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, w); }, 256, 256));
  const clouds = []; { const R = RNG('cloudsBH2'); for (let c = 0; c < 46; c++) { const cx = R.r(-3000, 3000), cz = R.r(-7000, 500), cy = c < 18 ? R.r(1600, 3600) : R.r(500, 1400), size = R.r(250, 700) * (c < 18 ? 0.8 : 1.6), n = 5 + Math.floor(R.f() * 6);
    for (let k = 0; k < n; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: billowTex[k % 3], transparent: true, depthWrite: false, opacity: 0.6, fog: false }));
      s.userData = { x: cx + R.n(size * 0.6), z: cz + R.n(size * 0.5), y: cy + R.n(size * 0.18) + (k === 0 ? size * 0.15 : 0), w: size * R.r(0.6, 1.1), o: R.r(0.5, 0.85), v: R.r(0.6, 1.4), rot: R.n(0.2) }; s.material.rotation = s.userData.rot; s.renderOrder = 7; scene.add(s); clouds.push(s); } } }
  // the Moon (maps from the luna piece), stretched towards the hole, then a stream of its debris
  const MM = texMoonMaps(), moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), STD({ map: MM.alb, bumpMap: MM.hgt, bumpScale: 0.02, roughness: 1, fog: false, emissive: 0xffffff, emissiveMap: MM.alb, emissiveIntensity: 0.85 })); moon.renderOrder = -1; scene.add(moon);
  const moonL = new THREE.DirectionalLight(0xffffff, 0); scene.add(moonL);
  const streamN = 1400, sp = new Float32Array(streamN * 3), sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stream = new THREE.Points(sgeo, new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, map: glowTex, color: 0xd8d4cc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); stream.frustumCulled = false; stream.renderOrder = -1; scene.add(stream);

  G = { r, cv, scene, cam, sky, skyU, hemi, key, crackU, timeU, WINU, lamps, trees, treeI, rocks, rockL, tufts, tuftL, deb, debL, clouds, moon, moonL, stream, sgeo, hInfo, houses, roofs, dirt, ROADP, carLights };
  return G;
}
