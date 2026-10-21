
// =====================================================================
//  PARK — a Central-Park-like lake: a dense woodland of lumpy trees, a lakeside promenade with benches and lamps,
//  people walking, jogging, sitting on the lawn, a dog; rowboats; slender towers past the far trees;
//  and the city around it as a grid of blocks with windows (seen from above in the rise).
// =====================================================================
const PK = { X: 430, Z0: -640, Z1: 2300, LCX: 0, LCZ: -100, LRX: 270, LRZ: 82 };
const inLake = (x, z, m = 0) => ((x - PK.LCX) / (PK.LRX + m)) ** 2 + ((z - PK.LCZ) / (PK.LRZ + m)) ** 2 < 1;
// a lumpy blob for crowns and shrubs: an icosphere pushed by value noise (baked once)
function lumpyGeo(detail, amp, seed) { const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position, R = RNG('lump' + seed), K = [];
  for (let k = 0; k < 7; k++) K.push([new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(), R.r(0.4, 1)]);
  for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).normalize(); let d = 1; K.forEach(([c, a]) => (d += amp * a * Math.max(0, _v.dot(c)) ** 3)); d += amp * 0.25 * Math.sin(_v.x * 9 + seed) * Math.sin(_v.y * 8) * Math.sin(_v.z * 7 + seed); p.setXYZ(i, _v.x * d, _v.y * d * 0.85, _v.z * d); }
  g.computeVertexNormals(); return g; }
const leafTex = (key, base) => g3Tex((x, w) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let k = 0; k < 1400; k++) { const l = R.r(-40, 40); x.fillStyle = `hsl(${R.r(85, 120)}, ${R.r(35, 60)}%, ${R.r(16, 42) + l * 0.1}%)`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), R.r(2, 6), R.r(1, 3), R.r(0, TAU), 0, TAU); x.fill(); } }, 256, 256);
// the city's windows: drawn in the material from world position (any box size keeps square windows)
function windowsMat(col) { const m = STDm({ color: col, roughness: 0.75 });
  m.onBeforeCompile = (sh) => { sh.vertexShader = 'varying vec3 vWp; varying vec3 vWn;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n { mat4 IM4 = modelMatrix; \n#ifdef USE_INSTANCING\n IM4 = modelMatrix * instanceMatrix;\n#endif\n vWp = (IM4 * vec4(transformed, 1.0)).xyz; vWn = normalize(mat3(IM4) * objectNormal); }');
    sh.fragmentShader = 'varying vec3 vWp; varying vec3 vWn;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      if (abs(vWn.y) < 0.5) { float u = abs(vWn.x) > 0.5 ? vWp.z : vWp.x; vec2 c = vec2(floor(u / 3.2), floor(vWp.y / 3.6)); float h = fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453);
        float wx = fract(u / 3.2), wy = fract(vWp.y / 3.6), win = step(0.2, wx) * step(wx, 0.8) * step(0.22, wy) * step(wy, 0.82) * step(5.0, vWp.y), fade = smoothstep(1800.0, 500.0, length(vWp - cameraPosition));
        diffuseColor.rgb = mix(diffuseColor.rgb, mix(diffuseColor.rgb * 0.55, vec3(0.12, 0.16, 0.22) + 0.12 * h, 0.5 + 0.5 * fade), win * (0.35 + 0.6 * fade)); }
      else diffuseColor.rgb *= 0.7;`); }; return m; }

function buildPark() {
  const st = makeStage({ skyTop: '#4a88d8', skyHor: '#dbe7f0', hemi: 0.85, sky: 0xcfe0f0, ground: 0x5a6a40, key: 2.7, keyCol: '#fff0d8', box: 30, boxFar: 300, fog: '#d6e0e8', fogNear: 250, fogFar: 3200, sunDist: 150, far: 40000 });
  st.setSun(dirV(-35 * DEG, 45 * DEG), new THREE.Vector3(0, 0, -12));
  const R = RNG('park2');
  // ground: the park's lawn, the city's asphalt around it, the shore promenade and a few paths
  const grassT = wrap(texNoise('grass', '#5a8a3a', ['rgba(40,70,20,0.4)', 'rgba(140,170,70,0.35)', 'rgba(90,130,40,0.3)'], 16000), PK.X * 2 / 6.5, (PK.Z1 - PK.Z0) / 6.5);
  plane(st, PK.X * 2, PK.Z1 - PK.Z0, STDm({ map: grassT, roughness: 0.95 }), 0, 0, (PK.Z0 + PK.Z1) / 2);
  plane(st, 16000, 16000, STDm({ color: '#6a6c70', roughness: 0.95 }), 0, -0.05, 0);
  const pathM = STDm({ map: wrap(texNoise('path', '#bfb4a0', ['rgba(120,100,80,0.35)', 'rgba(230,220,200,0.3)']), 1, 40), roughness: 0.9 });
  const prom = plane(st, 3.6, 340, pathM, 0, 0.012, -16.0); prom.rotation.y = Math.PI / 2;
  [[-60, 300, 0.4], [80, 900, -0.3], [-200, 1400, 0.15], [210, -400, -0.5], [-150, -450, 0.6]].forEach(([x, z, r]) => { const p = plane(st, 4, 600, pathM, x, 0.011, z); p.rotation.y = r; });
  // the lake: a rounded basin with a stone edge near you
  const waterU = { uT: { value: 0 } };
  const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 96).rotateX(-Math.PI / 2).scale(PK.LRX, 1, PK.LRZ), new THREE.ShaderMaterial({ uniforms: Object.assign(waterU, THREE.UniformsLib.fog), fog: true,
    vertexShader: 'varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'uniform float uT; varying vec3 vW;\n#include <fog_pars_fragment>\nvoid main(){ vec2 p = vW.xz; vec3 n = normalize(vec3(0.05 * sin(p.x * 1.3 + uT * 1.7) + 0.03 * sin(p.x * 3.1 - p.y * 2.3 + uT * 2.6), 1.0, 0.05 * sin(p.y * 1.7 - uT * 1.4) + 0.03 * sin(p.y * 4.1 + p.x * 1.1 + uT * 3.1)));\n vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);\n vec3 sky = mix(vec3(0.5, 0.62, 0.74), vec3(0.25, 0.45, 0.75), clamp(Rf.y * 1.6, 0.0, 1.0)); vec3 body = vec3(0.06, 0.2, 0.25);\n vec3 col = mix(body, sky, clamp(fres * 0.7 + 0.08, 0.0, 1.0)); col += vec3(1.0, 0.95, 0.85) * pow(max(dot(Rf, normalize(vec3(-0.4, 0.55, -0.73))), 0.0), 300.0) * 2.0;\n gl_FragColor = vec4(col, 1.0);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n#include <fog_fragment>\n}' }));
  lake.position.set(PK.LCX, 0.05, PK.LCZ); st.scene.add(lake);
  const stoneM = STDm({ color: '#a8a094', roughness: 0.9 }); box(st, 90, 0.5, 1.0, stoneM, 0, 0.1, -18.4);
  // trees: lumpy crowns (instanced, coloured), trunks; near trees get leaf cards on the crown for a ragged edge
  const crownNear = IM(lumpyGeo(3, 0.35, 1), STDm({ map: leafTex('leafA', '#3e6a2a'), roughness: 0.9 }), 1400), crownMid = IM(lumpyGeo(2, 0.32, 4), STDm({ map: leafTex('leafM', '#3e6a2a'), roughness: 0.92 }), 14000), crownFar = IM(lumpyGeo(1, 0.3, 2), STDm({ map: leafTex('leafF', '#3e6a2a'), roughness: 0.95 }), 26000);
  const trunks = IM(new THREE.CylinderGeometry(0.16, 0.3, 1, 8).translate(0, 0.5, 0), STDm({ color: '#4a3a2c', roughness: 0.95 }), 6600);
  const cardT = g3Tex((c, w) => { c.clearRect(0, 0, w, w); const Rt = RNG('leafc'); for (let k = 0; k < 110; k++) { c.fillStyle = `hsl(${Rt.r(85, 115)}, ${Rt.r(35, 55)}%, ${Rt.r(20, 40)}%)`; c.beginPath(); c.ellipse(Rt.r(8, w - 8), Rt.r(8, w - 8), Rt.r(4, 9), Rt.r(2, 5), Rt.r(0, TAU), 0, TAU); c.fill(); } }, 128, 128);
  const cards = IM(new THREE.PlaneGeometry(1, 1), STDm({ map: cardT, alphaTest: 0.45, side: THREE.DoubleSide }), 6000);
  let nN = 0, nM = 0, nF = 0, nT = 0, nC = 0; const greens = ['#3b6a2a', '#4a7a30', '#2f5a24', '#557f35', '#628a3c', '#3f7040', '#6a8a30'];
  const tree = (x, z, h) => { const near = Math.hypot(x, z + 11) < 90; trunks.setMatrixAt(nT++, M4c(x, 0, z, 0, h / 9, h * 0.55, h / 9)); const n = near ? 7 : 4, cr = h * 0.3;
    for (let j = 0; j < n; j++) { const a = R.r(0, TAU), r = j ? R.r(0.3, 0.75) * cr : 0, y = h * 0.62 + (j ? R.r(-0.15, 0.25) * h : 0.05 * h), s = cr * (j ? R.r(0.55, 0.8) : 0.95), col = lin(R.pick(greens));
      const M = M4c(x + Math.cos(a) * r, y, z + Math.sin(a) * r, R.r(0, TAU), s, s, s); if (near && nN < 1400) { crownNear.setMatrixAt(nN, M); crownNear.setColorAt(nN++, col.clone().multiplyScalar(2.2)); } else if (Math.hypot(x, z + 11) < 520 && nM < 14000) { crownMid.setMatrixAt(nM, M); crownMid.setColorAt(nM++, col.clone().multiplyScalar(2.2)); } else if (nF < 26000) { crownFar.setMatrixAt(nF, M); crownFar.setColorAt(nF++, col.clone().multiplyScalar(2.2)); } }
    if (near) for (let j = 0; j < 30 && nC < 6000; j++) { const v = new THREE.Vector3(R.n(1), R.n(0.8), R.n(1)).normalize(); cards.setMatrixAt(nC++, M4c(x + v.x * cr * 1.25, h * 0.66 + v.y * cr, z + v.z * cr * 1.25, R.r(0, TAU), cr * 0.45, cr * 0.45, cr * 0.45, R.r(-1, 1))); } };
  // framing trees by you (left and right), then the woodland: a ring around the lake and the rest of the park
  [[-9, -9, 11], [10, -8, 12], [-14, -13, 10], [15, -12, 11], [-4, 3, 12], [6, 6, 11]].forEach(([x, z, h]) => tree(x, z, h));
  for (let k = 0; k < 9000 && nT < 6500; k++) { const ring = k % 3 !== 0, a = R.r(0, TAU), x = ring ? clamp(PK.LCX + Math.cos(a) * PK.LRX * R.r(1.03, 1.9), -PK.X + 8, PK.X - 8) : R.r(-PK.X + 8, PK.X - 8), z = ring ? PK.LCZ + Math.sin(a) * PK.LRZ * R.r(1.05, 6) : R.r(PK.Z0 + 8, PK.Z1 - 8);
    if (z < PK.Z0 + 6 || z > PK.Z1 - 6 || inLake(x, z, 7) || (Math.abs(z + 16) < 6 && Math.abs(x) < 170) || Math.hypot(x - 0.4, z + 11) < 22) continue; tree(x, z, R.r(13, 24) * (z < -170 && z > -400 ? 1.15 : 1)); }
  crownNear.count = nN; crownMid.count = nM; crownFar.count = nF; st.scene.add(crownMid); trunks.count = nT; cards.count = nC; st.scene.add(crownNear, crownFar, trunks, cards);
  // shrubs along the shore and paths
  const shrubs = IM(lumpyGeo(2, 0.3, 3), STDm({ map: leafTex('leafS', '#3a6a28'), roughness: 0.9 }), 900); let nS = 0;
  for (let k = 0; k < 900; k++) { const a = R.r(0, TAU), onShore = k < 500, x = onShore ? PK.LCX + Math.cos(a) * (PK.LRX + R.r(3, 10)) : R.r(-PK.X, PK.X), z = onShore ? PK.LCZ + Math.sin(a) * (PK.LRZ + R.r(3, 10)) : R.r(-14, -6) * 0 + R.r(PK.Z0, -20);
    if (z > -40 && Math.abs(x) < 70) continue; const s = R.r(0.8, 2.2); shrubs.setMatrixAt(nS, M4c(x, s * 0.35, z, R.r(0, 6), s * 1.3, s, s * 1.2)); shrubs.setColorAt(nS++, lin(R.pick(greens)).multiplyScalar(2.2)); }
  shrubs.count = nS; st.scene.add(shrubs);
  // grass tufts on the near lawn
  const bladeT = g3Tex((x, w) => { x.clearRect(0, 0, w, w); const Rb = RNG('blade'); for (let k = 0; k < 40; k++) { const bx = Rb.r(4, w - 4); x.strokeStyle = Rb.pick(['#4a7a2a', '#5a8a32', '#6a9a3a', '#3a6a22', '#7aa84a']); x.lineWidth = Rb.r(2, 4); x.beginPath(); x.moveTo(bx, w); x.quadraticCurveTo(bx + Rb.n(6), w * 0.5, bx + Rb.n(14), Rb.r(4, w * 0.5)); x.stroke(); } }, 128, 128);
  const tufts = IM(new THREE.PlaneGeometry(0.15, 0.07).translate(0, 0.035, 0), STDm({ map: bladeT, alphaTest: 0.4, side: THREE.DoubleSide }), 9000, false); let nG = 0;
  for (let i = 0; i < 9000; i++) { const x = R.r(-14, 14), z = R.r(-14.2, 4); if (Math.hypot(x - 0.4, z + 11) < 2.5) continue; tufts.setMatrixAt(nG++, M4c(x, 0, z, R.r(0, 6), R.r(0.7, 1.3), R.r(0.7, 1.4), 1)); } tufts.count = nG; st.scene.add(tufts);
  // the city: blocks outside the park; slender tall towers on the far (south) side — seen across the lake
  const bms = ['#c8ccd4', '#b4b8c0', '#d4cfc6', '#a8b0bc', '#c9b8a4', '#9aa4b0', '#d8d4cc'];
  const blocks = bms.map((c) => IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), windowsMat(c), 3000)); const bn = bms.map(() => 0);
  for (let gx = -3000; gx < 3000; gx += 95) for (let gz = -3600; gz < 4600; gz += 72) { const cx = gx + 40, cz = gz + 30;
    if (Math.abs(cx) < PK.X + 40 && cz > PK.Z0 - 40 && cz < PK.Z1 + 40) continue;
    const south = cz < PK.Z0 - 350 && cz > PK.Z0 - 800 && Math.abs(cx) < 1100, dC = Math.hypot(cx, cz - 800);
    for (let j = 0; j < 2; j++) { const k = R.int ? R.int(0, bms.length - 1) : Math.floor(R.f() * bms.length); if (bn[k] >= 3000) continue;
      const tall = south && R.f() < 0.22, h = tall ? R.r(160, 430) : R.r(18, 60) * (1 + 1.6 * Math.max(0, 1 - dC / 3500)) * (R.f() < 0.1 ? 2.2 : 1), w = tall ? R.r(22, 32) : R.r(34, 40), d = tall ? R.r(22, 32) : R.r(50, 58);
      blocks[k].setMatrixAt(bn[k]++, M4c(cx - 20 + j * 40, 0, cz, 0, w, h, d)); } }
  blocks.forEach((b, k) => { b.count = bn[k]; b.castShadow = false; st.scene.add(b); });
  // rowboats with people
  const boats = []; for (let k = 0; k < 9; k++) { const g = new THREE.Group(); const a = R.r(0, TAU), r = R.r(0.2, 0.75); g.position.set(PK.LCX + Math.cos(a) * PK.LRX * r, 0.1, PK.LCZ + Math.sin(a) * PK.LRZ * r * 0.8 - 6); g.rotation.y = R.r(0, TAU); st.scene.add(g);
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 2.2, 4, 12).rotateZ(Math.PI / 2).scale(1, 0.45, 0.8), STDm({ color: R.pick(['#2f6fd1', '#c8372d', '#f2efe8', '#2a8a5a']) })); hull.castShadow = true; g.add(hull);
    const P = makePerson({ female: R.f() < 0.5, skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(['short', 'pony', 'bob']), top: R.pick(['#f2c230', '#e86fa8', '#f4f1ea', '#3cae5c']), seed: 200 + k }); g.add(P.root); boats.push({ g, P, ph: R.r(0, 6) }); }
  // the promenade: benches (facing the lake) and park lamps
  const wood = STDm({ color: '#7a5634', roughness: 0.8 }), iron = STDm({ color: '#1e2a24', metalness: 0.5, roughness: 0.45 }), glassM = STDm({ color: '#f4ecd8', emissive: '#ffe8c0', emissiveIntensity: 0.25, roughness: 0.2 });
  for (let x = -60; x <= 60; x += 9) { if (Math.abs(x - 0.4) < 3) continue; const z = -17.4; box(st, 1.8, 0.06, 0.5, wood, x, 0.45, z); box(st, 1.8, 0.4, 0.05, wood, x, 0.72, z - 0.25); [-0.8, 0.8].forEach((dx) => box(st, 0.06, 0.45, 0.5, iron, x + dx, 0.22, z)); }
  for (let x = -64; x <= 64; x += 18) { const z = -14.6; cyl(st, 0.05, 0.09, 3.4, iron, x + 4.5, 1.7, z, 10); cyl(st, 0.12, 0.08, 0.38, glassM, x + 4.5, 3.6, z, 8); cyl(st, 0.02, 0.16, 0.14, iron, x + 4.5, 3.85, z, 8); }
  // people: walkers and joggers on the promenade, a dog walker, people sitting on the lawn, a crowd on the far paths
  const tops = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#f4f1ea', '#ef8a3a'];
  const walkers = []; for (let k = 0; k < 12; k++) { const jog = k % 4 === 3, P = makePerson({ female: k % 2 === 0, skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(['bob', 'pony', 'short', 'curly', 'long']), top: R.pick(tops), bottom: R.pick(['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d']), shorts: jog, seed: 300 + k }); st.scene.add(P.root);
    walkers.push({ P, z0: -16.0 + R.r(-1.2, 1.2), x0: R.r(-30, 30), v: (jog ? R.r(2.6, 3.2) : R.r(0.9, 1.3)) * (k % 2 ? 1 : -1), jog, ph: R.r(0, 6) }); }
  const sitters = []; [[-5.5, -12.5, 0.3], [-6.4, -12.1, -0.4], [6.0, -11.8, -0.2], [6.9, -12.6, 0.5], [-10, -6, 2.6], [11, -5, -2.4], [-2.5, -13.4, 0.1]].forEach(([x, z, yaw], k) => { const P = makePerson({ female: k % 2 === 1, skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(['bob', 'long', 'curly', 'short']), top: R.pick(tops), seed: 400 + k }); st.scene.add(P.root); sitters.push({ P, x, z, yaw: Math.PI + yaw }); });
  const blanket = plane(st, 1.8, 1.4, STDm({ color: '#c84848', roughness: 0.95 }), -6, 0.02, -12.4); blanket.rotation.y = 0.3; plane(st, 1.8, 1.4, STDm({ color: '#3a6ab0', roughness: 0.95 }), 6.4, 0.02, -12.3);
  const crowd = makeCrowd(260, { seed: 3 }); st.scene.add(crowd.grp); const cl = []; for (let i = 0; i < 260; i++) { const a = R.r(0, TAU), r = R.r(1.04, 1.12), s1 = Math.sin(a) < -0.1 ? 1 : -1; cl.push({ x: PK.LCX + Math.cos(a) * PK.LRX * r, z: PK.LCZ + Math.sin(a) * PK.LRZ * r + (s1 < 0 && Math.abs(Math.cos(a)) < 0.5 ? -30 : 0), yaw: R.r(0, TAU), v: R.r(-1, 1), sit: R.f() < 0.3 }); }
  // the dog: a golden retriever on a lead
  const dog = makeDog(); st.scene.add(dog.root);
  const owner = makePerson({ female: true, skin: SKINS[1], hair: HAIRS[3], hairStyle: "pony", top: "#8ab8e8", bottom: "#2b3a55", seed: 501 }), jogger = makePerson({ skin: SKINS[3], hair: HAIRS[0], top: "#e84a3a", bottom: "#1a1a1a", shorts: true, seed: 502 }), jogger2 = makePerson({ skin: SKINS[0], hair: HAIRS[4], cap: "#d03a2a", top: "#e86a2a", bottom: "#1a1a1a", shorts: true, seed: 503 }); st.scene.add(owner.root, jogger.root, jogger2.root);
  // ducks / geese near the shore
  const ducks = IM(new THREE.CapsuleGeometry(0.1, 0.22, 4, 8).rotateZ(Math.PI / 2), STDm({ color: '#f4f0e8' }), 18), dheads = IM(new THREE.SphereGeometry(0.07, 10, 8), STDm({ color: '#2a2a2a' }), 18); st.scene.add(ducks, dheads);
  const duckL = []; for (let k = 0; k < 18; k++) duckL.push({ x: R.r(-8, 9), z: R.r(-27, -19.8), ph: R.r(0, 6), fly: k < 6 });
  const HL = makeHand(-1), HR = makeHand(1); st.scene.add(HL.root, HR.root);
  return { st, waterU, boats, walkers, sitters, crowd, cl, dog, owner, jogger, jogger2, ducks, dheads, duckL, HL, HR };
}
function makeDog() { const fur = new THREE.MeshPhysicalMaterial({ color: '#c88a3a', roughness: 0.85, sheen: 0.8, sheenColor: new THREE.Color('#f0c070') }), dark = STDm({ color: '#1a1410' }), root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mk = (g, x, y, z, par = body) => { const m = new THREE.Mesh(g, fur); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; };
  mk(new THREE.CapsuleGeometry(0.15, 0.45, 6, 14).rotateX(Math.PI / 2).scale(1, 1.05, 1), 0, 0.5, 0); mk(new THREE.SphereGeometry(0.15, 16, 12).scale(1, 1.1, 1), 0, 0.6, 0.24);
  const head = new THREE.Group(); head.position.set(0, 0.74, 0.4); body.add(head); mk(new THREE.SphereGeometry(0.11, 16, 12), 0, 0, 0, head); mk(new THREE.CapsuleGeometry(0.05, 0.1, 4, 10).rotateX(Math.PI / 2), 0, -0.035, 0.12, head);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), dark); nose.position.set(0, -0.02, 0.21); head.add(nose); [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), dark); e.position.set(s * 0.05, 0.03, 0.09); head.add(e); mk(new THREE.SphereGeometry(0.05, 10, 8).scale(0.5, 1.4, 0.8), s * 0.1, -0.03, -0.01, head).rotation.z = s * 0.3; });
  const legs = []; [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([s, f]) => { const L = new THREE.Group(); L.position.set(s * 0.09, 0.44, f * 0.2); body.add(L); mk(new THREE.CapsuleGeometry(0.04, 0.3, 4, 8).translate(0, -0.2, 0), 0, 0, 0, L); legs.push(L); });
  const tail = new THREE.Group(); tail.position.set(0, 0.6, -0.3); body.add(tail); mk(new THREE.CapsuleGeometry(0.035, 0.28, 4, 8).translate(0, 0.16, 0), 0, 0, 0, tail); tail.rotation.x = -0.9;
  return { root, body, head, legs, tail }; }
function poseDog(D, x, z, yaw, ph, run = 0) { D.root.position.set(x, 0, z); D.root.rotation.y = yaw; const a = 0.5 + 0.4 * run; D.legs.forEach((L, i) => (L.rotation.x = a * Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)))); D.body.position.y = 0.02 * Math.abs(Math.sin(ph)); D.tail.rotation.z = 0.5 * Math.sin(ph * 1.5); D.head.rotation.x = 0.1 * Math.sin(ph); }
function drawPark(t) {
  const S = once('park', buildPark), { st, waterU, boats, walkers, sitters, crowd, cl, dog, ducks, dheads, duckL } = S, ts = sceneT(t), pk = ss(T_BACK + 0.3, T_BACK + 1.2, t), after = Math.max(0, t - T_BACK - 0.5);
  waterU.uT.value = ts;
  boats.forEach((b, i) => { b.g.position.y = 0.1 + 0.04 * Math.sin(ts * 1.3 + b.ph); b.g.rotation.z = 0.04 * Math.sin(ts * 1.1 + b.ph); posePerson(b.P, { y: -0.15, sit: 1, ph: ts * 6, armL: [1.2 + 0.4 * Math.sin(ts * 2 + i), 0.5, 0.4], armR: [1.2 + 0.4 * Math.sin(ts * 2 + i), 0.5, 0.4], emo: pk ? { fear: pk, open: pk } : { smile: 0.6 } }); });
  // when the protons come back, people panic: the walkers run, the sitters scramble up
  walkers.forEach((w, i) => { const run = w.jog ? 1 : pk * (i % 2), x = ((w.x0 + w.v * ts + w.v * 2.0 * run * after * (w.jog ? 0 : 1) + 36) % 72 + 72) % 72 - 36; posePerson(w.P, { x, z: w.z0, yaw: w.v > 0 ? Math.PI / 2 : -Math.PI / 2, walk: 1 - run, run, ph: ts * (6 + 4 * run) + w.ph, headYaw: pk * (i % 2 ? 0 : 0.9), emo: pk ? { fear: pk, open: pk * 0.8, tremble: pk } : { smile: 0.4 } }); });
  sitters.forEach((s, i) => { const up = i % 3 === 0 ? 0 : pk; posePerson(s.P, { x: s.x, y: -0.44 * (1 - up), z: s.z, yaw: s.yaw, sit: 1 - up, legL: up ? null : [-1.45, i % 2 ? 0.25 : 1.2], legR: up ? null : [-1.5, 0.15], armL: [0.4, 0.3, 0.6], armR: [0.6 + 0.3 * Math.sin(ts + i), 0.2, 0.9], headYaw: Math.sin(ts * 0.4 + i) * 0.3 + pk * 0.6, emo: pk ? { fear: pk, open: pk * 0.9 } : { smile: 0.7 } }); });
  cl.forEach((c, i) => crowd.set(i, c.x + (c.sit ? 0 : c.v * ts), c.sit ? -0.4 : 0, c.z, c.yaw + (c.v > 0 ? 0 : Math.PI), 1, pk * (i % 3 === 0 ? 1 : 0), 0.05 * Math.sin(ts * 3 + i))); crowd.done();
  const dogX = -9 + 1.1 * ts + 3 * pk * after; S.dogX = dogX; poseDog(dog, dogX, -15.2, Math.PI / 2, ts * 9, pk);
  posePerson(S.owner, { x: dogX + 0.7, z: -15.9, yaw: Math.PI / 2, walk: 1 - pk, run: pk, ph: ts * 6, armR: [0.7, 0.1, 0.3], headYaw: pk * 0.8, emo: pk ? { fear: pk, open: pk } : { smile: 0.5 } });
  posePerson(S.jogger, { x: -24 + 3.0 * ts, z: -14.9, yaw: Math.PI / 2, run: 1, ph: ts * 10, emo: pk ? { fear: pk, open: pk } : { determined: 0.5 } });
  posePerson(S.jogger2, { x: -42 + 3.4 * Math.max(0, t - T_BACK), z: -15.2, yaw: Math.PI / 2, run: 1, ph: t * 10, emo: { fear: pk, open: pk * 0.8 } });
  duckL.forEach((d, i) => { let x = d.x + Math.sin(ts * 0.3 + d.ph) * 0.5, y = 0.12, z = d.z; const fl = d.fly ? Math.max(ts > 6 ? ts - 6 : 0, t > T_BACK ? t - T_BACK + 0.3 : 0) : 0; if (fl) { y += fl * 1.5; z -= fl * 3; x += fl * (i - 2); }
    ducks.setMatrixAt(i, M4c(x, y, z, d.ph)); dheads.setMatrixAt(i, M4c(x + Math.cos(d.ph) * 0.17, y + 0.13, z - Math.sin(d.ph) * 0.17)); }); ducks.instanceMatrix.needsUpdate = dheads.instanceMatrix.needsUpdate = true;
  return S;
}
