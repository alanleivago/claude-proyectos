
// =====================================================================
//  FAIR — a seaside fair at night: a boardwalk (planks, railing, lamp posts), stalls with striped awnings and glass,
//  a lit Ferris wheel on the pier, a drone show over the bay, a lighthouse with a rotating beam, port cranes, the city
//  across the water (lit windows), the sea with real reflections. The sky is one dome shader: stars, the pulsar, its
//  sweeping X-ray beam, auroras, the giant flare's violet glow, falling satellites, the brown sky.
//  You stand at the railing (0, 1.65, 1.2) looking out over the bay (-z).
// =====================================================================
const FAIR = { WATER: -2.4 };
const PULSAR_DIR = dirV(18 * DEG, 34 * DEG);
const SKY = { P: { value: PULSAR_DIR.clone() }, uP: { value: 0 }, uQ: { value: new THREE.Vector3(1, 0, 0) }, uBeam: { value: 0 }, uAur: { value: 0 }, uFlare: { value: 0 }, uBrown: { value: 0 }, uT: { value: 0 }, uSat: { value: 0 }, uOut: { value: 0 } };
function skyDome(st) { const m = new THREE.Mesh(new THREE.SphereGeometry(30000, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: SKY,
  vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
  fragmentShader: `uniform vec3 P, uQ; uniform float uP, uBeam, uAur, uFlare, uBrown, uT, uSat, uOut; varying vec3 vD;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * vn(p); p = p * 2.03 + 1.7; m *= 0.5; } return a; }
void main(){ vec3 d = normalize(vD); float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(vec3(0.07, 0.07, 0.14), vec3(0.015, 0.02, 0.06), pow(h, 0.5)); col += vec3(0.16, 0.1, 0.08) * exp(-h * 10.0) * (1.0 - uOut);            // city glow at the horizon
  // stars and a faint milky band
  vec2 sp = vec2(atan(d.x, -d.z) * 300.0, d.y * 300.0); float s = step(0.9965, h2(floor(sp))) * smoothstep(0.02, 0.2, d.y); col += vec3(0.85, 0.9, 1.0) * s * (0.6 + 0.4 * h2(floor(sp) + 3.0));
  col += vec3(0.08, 0.07, 0.1) * fbm(vec2(atan(d.x, -d.z) * 3.0, d.y * 6.0)) * smoothstep(0.1, 0.5, d.y) * exp(-pow((d.y - 0.45 - 0.15 * sin(atan(d.x, -d.z))), 2.0) * 20.0);
  // auroras: green and magenta curtains, rippling
  float az = atan(d.x, -d.z), cur = fbm(vec2(az * 4.0 + uT * 0.15, uT * 0.05)), band = smoothstep(0.08, 0.2, d.y) * (1.0 - smoothstep(0.35, 0.75, d.y));
  float rays = 0.5 + 0.5 * sin(az * 90.0 + fbm(vec2(az * 10.0, uT * 0.3)) * 8.0); float a = band * smoothstep(0.45, 0.8, cur) * (0.5 + 0.5 * rays) * uAur;
  col += mix(vec3(0.1, 1.0, 0.45), vec3(0.9, 0.2, 0.8), smoothstep(0.18, 0.5, d.y)) * a * 0.9;
  // the pulsar: a hard white-violet point with a halo
  float dp = acos(clamp(dot(d, P), -1.0, 1.0)); col += vec3(0.85, 0.85, 1.0) * (smoothstep(0.006, 0.003, dp) * 8.0 + exp(-dp * 40.0) * 0.8 + exp(-dp * 8.0) * 0.15) * uP;
  // the beam: both ways along the great circle through P toward uQ, fading with angle
  vec3 n = normalize(cross(P, uQ)); float off = abs(dot(d, n)), along = acos(clamp(dot(d, P), -1.0, 1.0)); float bm = exp(-off * off * 9000.0) * exp(-along * 1.3) + exp(-off * off * 900.0) * exp(-along * 2.5) * 0.25;
  col += vec3(0.62, 0.45, 1.0) * bm * uBeam * 2.2;
  // the giant flare: the whole sky violet, brightest around P
  col = mix(col, vec3(0.55, 0.32, 0.95) + vec3(0.6, 0.55, 0.8) * exp(-dp * 2.0), uFlare * (0.75 + 0.25 * h)); col += vec3(1.0) * uFlare * exp(-dp * 6.0) * 1.5;
  // satellites burning up: thin falling streaks
  for (int i = 0; i < 7; i++) { float fi = float(i); vec2 c = vec2(sin(fi * 2.3) * 1.2, 0.55 + 0.25 * sin(fi * 1.7)); float ph = fract(uT * 0.22 + fi * 0.37); vec2 hp = c + vec2(ph * 0.5, -ph * 0.45);
    vec2 q = vec2(az, d.y) - hp; vec2 dir = normalize(vec2(0.5, -0.45)); float tl = dot(q, -dir), w = abs(q.x * dir.y - q.y * dir.x); col += vec3(1.0, 0.75, 0.45) * (smoothstep(0.01, 0.0, w) * 2.0 + smoothstep(0.035, 0.0, w) * 0.5) * smoothstep(0.35, 0.0, tl) * step(0.0, tl) * uSat * 3.0; }
  // the brown sky of the morning after
  col = mix(col, mix(vec3(0.42, 0.28, 0.16), vec3(0.22, 0.15, 0.12), h), uBrown);
  if (d.y < 0.0) col *= 0.6;
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); return m; }
function stripeTex(c1, c2) { return g3Tex((x, w) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? c1 : c2; x.fillRect(i * w / 8, 0, w / 8, w); } }, 256, 256); }
function buildFair() {
  const st = makeStage({ hemi: 0.35, sky: 0x4a5080, ground: 0x2a2018, key: 0.45, keyCol: '#a8b8e0', box: 40, boxFar: 200, sunDist: 120, far: 60000 }); st.setSun(dirV(-60 * DEG, 40 * DEG), new THREE.Vector3(0, 0, 0)); if (st.sky) st.sky.visible = false; st.scene.background = null;
  skyEnv(st, '#0a0c1a', '#2a2030', dirV(-60 * DEG, 40 * DEG), '#4a5a80'); const R = RNG('fair'), S = { st }; S.sky = skyDome(st);
  // the boardwalk: planks, its front edge over the water, the railing, lamp posts
  const planks = wrap(g3Tex((x, w) => { const Rp = RNG('pl'); for (let i = 0; i < 16; i++) { const l = Rp.r(-14, 14); x.fillStyle = `rgb(${110 + l},${82 + l},${58 + l})`; x.fillRect(i * w / 16, 0, w / 16 - 2, w); for (let k = 0; k < 40; k++) { x.strokeStyle = `rgba(50,30,18,${Rp.r(0.1, 0.3)})`; x.lineWidth = 1; const xx = i * w / 16 + Rp.r(1, w / 16 - 3); x.beginPath(); x.moveTo(xx, Rp.r(0, w)); x.lineTo(xx + Rp.n(1), Rp.r(0, w)); x.stroke(); } } }, 512, 512), 40, 4);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(200, 0.3, 16).translate(0, -0.15, 8), STDm({ map: planks, roughness: 0.75 })); deck.receiveShadow = true; st.scene.add(deck);
  for (let x = -100; x <= 100; x += 4) st.scene.add(mesh(new THREE.CylinderGeometry(0.18, 0.18, 4, 8), STDm({ color: '#3a2a1e' }), x, -2.2, 0.2));
  const iron = STDm({ color: '#1e2226', metalness: 0.6, roughness: 0.4 }); for (let x = -60; x <= 60; x += 1.4) st.scene.add(mesh(new THREE.BoxGeometry(0.05, 1.0, 0.05), iron, x, 0.5, 0.15)); st.scene.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 120, 8).rotateZ(Math.PI / 2), iron, 0, 1.02, 0.15)); st.scene.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 120, 6).rotateZ(Math.PI / 2), iron, 0, 0.55, 0.15));
  S.lampHeads = []; for (let x = -54; x <= 54; x += 12) { if (Math.abs(x) < 7) continue; st.scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.1, 4.2, 10), iron, x, 2.1, 0.6)); const hd = mesh(new THREE.SphereGeometry(0.22, 14, 10), new THREE.MeshStandardMaterial({ color: '#fff0c8', emissive: '#ffd890', emissiveIntensity: 2.2 }), x, 4.3, 0.6); st.scene.add(hd); S.lampHeads.push(hd); }
  S.lights = [[-12, 4.2, 1.2], [12, 4.2, 1.2], [0, 3.5, 9]].map(([x, y, z]) => { const L = new THREE.PointLight(0xffd090, 3.2, 26, 1.4); L.position.set(x, y, z); st.scene.add(L); return L; });
  // stalls behind you (with glass displays) and string lights over the boardwalk
  S.glass = []; const stalls = [['#c8372d', '#f4f0e8', 'CHURROS'], ['#2a6aa8', '#f4f0e8', 'HELADOS'], ['#e8a838', '#3a2a1a', 'TÓMBOLA'], ['#3a8a5a', '#f4f0e8', 'GOFRES'], ['#7b4fc9', '#f4f0e8', 'ALGODÓN'], ['#c8372d', '#ffe8a0', 'TIRO']];
  stalls.forEach(([c1, c2, name], i) => { const x = -16 + i * 6.4, z = 11, g = new THREE.Group(); g.position.set(x, 0, z); st.scene.add(g); g.add(mesh(new THREE.BoxGeometry(4.6, 1.1, 1.6), STDm({ color: '#e8e2d6', roughness: 0.6 }), 0, 0.55, 0)); g.add(mesh(new THREE.BoxGeometry(4.6, 2.4, 0.1), STDm({ color: '#d8d0c4' }), 0, 1.8, 0.9));
    const roof = mesh(new THREE.BoxGeometry(5.0, 0.08, 2.4).rotateX(0.22), STDm({ map: stripeTex(c1, c2), roughness: 0.8 }), 0, 3.0, -0.3); g.add(roof); sign(g, [name], 0, 3.45, -1.2, 3.0, 0.6, { bg: c1, fg: c2, size: 72, glow: 0.9, ry: Math.PI });
    const gl = mesh(new THREE.BoxGeometry(4.2, 0.6, 0.03), new THREE.MeshPhysicalMaterial({ color: '#d8ecf4', roughness: 0.05, transmission: 0.8, transparent: true, opacity: 0.5 }), 0, 1.4, -0.75); g.add(gl); S.glass.push({ gl, g, x, z: z - 0.75 });
    for (let k = 0; k < 8; k++) g.add(mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: k % 2 ? '#ffe0a0' : '#ff9a6a', toneMapped: false }), -2.2 + k * 0.63, 2.75, -1.45)); });
  S.bulbs = IM(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), 300, false); let nb = 0; const pal = ['#ffd890', '#ff8a6a', '#8ad0ff', '#ffe8b0', '#d890ff'];
  [[-40, 2.2, 40, 2.2], [-40, 8.6, 40, 8.6], [-12, 2.2, -12, 8.6], [12, 2.2, 12, 8.6]].forEach(([ax, az, bx, bz]) => { const L = Math.hypot(bx - ax, bz - az), n = Math.round(L / 0.7); for (let i = 0; i <= n && nb < 300; i++) { const u = i / n, seg2 = (u * L / 12) % 1; S.bulbs.setMatrixAt(nb, M4c(lerp(ax, bx, u), 4.0 - 0.6 * 4 * seg2 * (1 - seg2), lerp(az, bz, u))); S.bulbs.setColorAt(nb++, lin(R.pick(pal))); } });
  S.bulbs.count = nb; st.scene.add(S.bulbs); S.nb = nb;
  // the Ferris wheel on the pier at the left
  { const g = new THREE.Group(); g.position.set(-26, 0, -14); st.scene.add(g); S.wheelG = g; const steel = STDm({ color: '#d8dce0', metalness: 0.6, roughness: 0.35 }), Rw = 15, Hc = Rw + 3;
    st.scene.add(mesh(new THREE.BoxGeometry(20, 0.4, 24), STDm({ map: planks, roughness: 0.8 }), -26, -0.2, -14));
    [-1, 1].forEach((s) => { const lg = mesh(new THREE.CylinderGeometry(0.3, 0.45, Hc * 1.12, 10), steel, s * 6.5, Hc / 2, 0); lg.rotation.z = s * 0.36; g.add(lg); const lg2 = mesh(new THREE.CylinderGeometry(0.3, 0.45, Hc * 1.12, 10), steel, s * 6.5, Hc / 2, 0); lg2.rotation.z = s * 0.36; lg2.position.z = 2.4; g.add(lg2); });
    const wheel = new THREE.Group(); wheel.position.set(0, Hc, 1.2); g.add(wheel); S.wheel = wheel;
    [-1.2, 1.2].forEach((z) => { const rim = mesh(new THREE.TorusGeometry(Rw, 0.12, 8, 96), steel, 0, 0, z); wheel.add(rim); const rim2 = mesh(new THREE.TorusGeometry(Rw * 0.82, 0.07, 6, 80), steel, 0, 0, z); wheel.add(rim2); for (let k = 0; k < 24; k++) { const sp = mesh(new THREE.CylinderGeometry(0.05, 0.05, Rw, 6).translate(0, Rw / 2, 0), steel, 0, 0, z); sp.rotation.z = k / 24 * TAU; wheel.add(sp); } });
    wheel.add(mesh(new THREE.CylinderGeometry(0.8, 0.8, 3, 16).rotateX(Math.PI / 2), steel));
    S.gond = []; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, gd = new THREE.Group(); gd.position.set(Math.cos(a) * Rw, Math.sin(a) * Rw, 0); wheel.add(gd); const c = mesh(new THREE.CylinderGeometry(0.9, 0.8, 1.3, 12, 1, true), STDm({ color: pal[k % 5] === '#ffd890' ? '#c8372d' : ['#2a6aa8', '#e8a838', '#3a8a5a', '#7b4fc9', '#c8372d'][k % 5], side: THREE.DoubleSide }), 0, -1.4, 0); gd.add(c); gd.add(mesh(new THREE.ConeGeometry(1.0, 0.5, 12), STDm({ color: '#f4f0e8' }), 0, -0.55, 0)); gd.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), steel, 0, -0.4, 0)); S.gond.push(gd); }
    S.wb = IM(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), 480, false); let n = 0; for (let k = 0; k < 96; k++) { const a = k / 96 * TAU; [-1.2, 1.2].forEach((z) => { S.wb.setMatrixAt(n, M4c(Math.cos(a) * Rw, Math.sin(a) * Rw, z)); S.wb.setColorAt(n++, lin(k % 3 ? '#ffd890' : '#ff6aa8')); }); }
    for (let k = 0; k < 24; k++) for (let j = 1; j < 12; j++) { const a = k / 24 * TAU, r = j / 12 * Rw; S.wb.setMatrixAt(n, M4c(Math.cos(a) * r, Math.sin(a) * r, 1.25)); S.wb.setColorAt(n++, lin(['#ffd890', '#8ad0ff', '#ff6aa8'][k % 3])); }
    S.wb.count = n; S.wbn = n; wheel.add(S.wb); }
  // the drone show: 420 lights over the bay
  { const N = 420, p = new Float32Array(N * 3), c = new Float32Array(N * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    S.drones = new THREE.Points(g, new THREE.PointsMaterial({ map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']], 64), size: 2.6, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); S.drones.frustumCulled = false; st.scene.add(S.drones); S.dp = p; S.dc = c; S.dg = g; S.ND = N; }
  // the lighthouse on the breakwater: stone tower with bands, windows, gallery railing, glazed lantern, dome; keeper's house; a soft beam
  { const lh = new THREE.Group(); lh.position.set(70, 0, -150); st.scene.add(lh); const rk = new THREE.Mesh(lumpyGeo(3, 0.3, 77), STDm({ color: '#4a4a4c', roughness: 1 })); rk.scale.set(22, 5, 12); rk.position.y = -3; lh.add(rk);
    const stone = wrap(g3Tex((x, w, h) => { const Rs = RNG('lhs'); x.fillStyle = '#e8e4dc'; x.fillRect(0, 0, w, h); for (let r = 0; r < 24; r++) for (let c = 0; c < 12; c++) { const l = Rs.r(-12, 12); x.fillStyle = `rgb(${226 + l},${222 + l},${212 + l})`; x.fillRect(c * w / 12 + (r % 2) * w / 24 + 1, r * h / 24 + 1, w / 12 - 2, h / 24 - 2); } speck(x, w, h, 4000, ['rgba(60,60,60,0.12)'], Rs, 1, 2); }, 256, 512), 2, 1);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.1, 22, 32), STDm({ map: stone, roughness: 0.85 })); tower.position.y = 11; lh.add(tower);
    const redM = STDm({ color: '#b8282a', roughness: 0.6 }); [7, 14.5].forEach((y) => lh.add(mesh(new THREE.CylinderGeometry(2.78 - y * 0.03, 2.84 - y * 0.03, 2.4, 32), redM, 0, y, 0)));
    const winM = new THREE.MeshStandardMaterial({ color: '#2a2418', emissive: '#ffcc70', emissiveIntensity: 1.2 }); [4.5, 10, 17.5].forEach((y, k) => { const a = 2.2 + k * 0.5, r = 3.0 - y * 0.036; lh.add(mesh(new THREE.BoxGeometry(0.5, 0.9, 0.12), winM, -Math.sin(a) * r, y, Math.cos(a) * r, { ry: -a })); });
    lh.add(mesh(new THREE.CylinderGeometry(2.9, 2.9, 0.3, 32), STDm({ color: '#2a2c30', metalness: 0.5 }), 0, 22.2, 0)); for (let k = 0; k < 28; k++) { const a = k / 28 * TAU; lh.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), STDm({ color: '#2a2c30' }), Math.cos(a) * 2.8, 22.8, Math.sin(a) * 2.8)); } lh.add(mesh(new THREE.TorusGeometry(2.8, 0.04, 6, 48).rotateX(Math.PI / 2), STDm({ color: '#2a2c30' }), 0, 23.25, 0));
    lh.add(mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.6, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#fff8e0', emissive: '#ffe6a0', emissiveIntensity: 2.4, transparent: true, opacity: 0.9, side: THREE.DoubleSide }), 0, 23.7, 0));
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; lh.add(mesh(new THREE.BoxGeometry(0.06, 2.6, 0.06), STDm({ color: '#1e2024' }), Math.cos(a) * 1.62, 23.7, Math.sin(a) * 1.62)); }
    lh.add(mesh(new THREE.SphereGeometry(1.8, 24, 12, 0, TAU, 0, Math.PI / 2), redM, 0, 25.0, 0)); lh.add(mesh(new THREE.ConeGeometry(0.12, 1.2, 8), STDm({ color: '#2a2c30' }), 0, 27.2, 0));
    const house = new THREE.Group(); house.position.set(-8, 0, 3); lh.add(house); house.add(mesh(new THREE.BoxGeometry(7, 4, 5).translate(0, 2, 0), STDm({ color: '#e8e2d6' }))); const rf = new THREE.Shape(); rf.moveTo(-4, 0); rf.lineTo(4, 0); rf.lineTo(0, 2.2); rf.closePath(); const rg = new THREE.ExtrudeGeometry(rf, { depth: 5.4, bevelEnabled: false }); rg.translate(0, 0, -2.7); house.add(mesh(rg, redM, 0, 4, 0)); [-2, 2].forEach((x) => house.add(mesh(new THREE.BoxGeometry(1, 1.1, 0.1), winM, x, 2.2, 2.55)));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,245,210,1)'], [0.25, 'rgba(255,230,170,0.45)'], [1, 'rgba(255,220,150,0)']], 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); glow.scale.setScalar(26); glow.position.y = 23.7; lh.add(glow);
    const beamT = g3Tex((x, w, h) => { const im = x.createImageData(w, h); for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) { const u = px / (w - 1), v = py / (h - 1), radial = Math.pow(Math.sin(Math.PI * u), 2.5), along = Math.pow(1 - v, 1.6); const o = (py * w + px) * 4; im.data[o] = 255; im.data[o + 1] = 244; im.data[o + 2] = 210; im.data[o + 3] = radial * along * 255; } x.putImageData(im, 0, 0); }, 64, 256, false);
    S.lhBeam = new THREE.Group(); S.lhBeam.position.y = 23.7; lh.add(S.lhBeam); [[14, 0.14], [26, 0.06]].forEach(([r, op]) => { const b = new THREE.Mesh(new THREE.ConeGeometry(r, 300, 32, 1, true).translate(0, -150, 0).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ map: beamT, color: '#fff4d0', transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); S.lhBeam.add(b); }); }
  { const red = new THREE.MeshBasicMaterial({ color: '#ff3030', toneMapped: false }), cm = STDm({ color: '#4a4c50' }); S.blink = []; for (let k = 0; k < 4; k++) { const g = new THREE.Group(); g.position.set(150 + k * 45, 0, -320 - k * 20); st.scene.add(g); [-4, 4].forEach((x) => g.add(mesh(new THREE.BoxGeometry(1.2, 40, 1.2), cm, x, 20, 0))); g.add(mesh(new THREE.BoxGeometry(12, 3, 3), cm, 0, 40, 0)); const boom = mesh(new THREE.BoxGeometry(70, 2, 2), cm, -18, 46, 0); boom.rotation.z = 0.08; g.add(boom); const b = mesh(new THREE.SphereGeometry(0.8, 8, 6), red, -50, 50, 0); g.add(b); S.blink.push(b); } }
  // the city across the bay
  const QZ = -1250, LAND = FAIR.WATER + 4; const cols = ['#4a5260', '#5a5650', '#6a6a70', '#3a4048', '#7a7068']; S.towers = [];
  for (let k = 0; k < 300; k++) { const x = R.r(-2600, 2600), z = QZ - R.r(60, 1500) * (0.4 + 0.6 * R.f()), h = R.r(25, 80) + 220 * Math.exp(-(((x + 250) / 700) ** 2)) * R.f() * ss(QZ - 120, QZ - 500, z); const m = litMat(R.pick(cols), k % 17); const b = new THREE.Mesh(new THREE.BoxGeometry(R.r(25, 50), h, R.r(25, 50)).translate(0, h / 2, 0), m); b.position.set(x, LAND, z); st.scene.add(b); S.towers.push(m); }
  const land = new THREE.Mesh(new THREE.BoxGeometry(9000, 6, 3000).translate(0, -3, -1500), STDm({ color: '#22222a', roughness: 1 })); land.position.set(0, LAND, QZ); st.scene.add(land);
  const quay = new THREE.Mesh(new THREE.BoxGeometry(9000, 4.6, 6), STDm({ color: '#6a6a70', roughness: 0.9 })); quay.position.set(0, FAIR.WATER + 1.9, QZ + 3); st.scene.add(quay);
  S.quayL = IM(new THREE.SphereGeometry(1.2, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd890', toneMapped: false }), 240, false); for (let i = 0; i < 240; i++) S.quayL.setMatrixAt(i, M4c(-2600 + i * 22, LAND + 6, QZ + 2)); st.scene.add(S.quayL);
  const trees = IM(lumpyGeo(1, 0.3, 33), STDm({ color: '#14201a', roughness: 1 }), 300, false); for (let i = 0; i < 300; i++) { const s2 = R.r(8, 14); trees.setMatrixAt(i, M4c(-2600 + i * 17.3 + R.n(4), LAND + s2 * 0.7, QZ - 14 - R.r(0, 10), R.r(0, 6), s2, s2 * 0.8, s2)); } st.scene.add(trees);
  // the sea with real reflections
  S.RT = new THREE.WebGLRenderTarget(540, 960); S.rcam = new THREE.PerspectiveCamera(); S.WU = { uT: { value: 0 }, uRef: { value: S.RT.texture }, uRM: { value: new THREE.Matrix4() } };
  S.water = new THREE.Mesh(new THREE.PlaneGeometry(9000, 3000).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: S.WU,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT; uniform sampler2D uRef; uniform mat4 uRM; varying vec3 vW;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
void main(){ vec2 p = vW.xz; float d = length(vW - cameraPosition); vec2 n = vec2(vn(p * 0.6 + uT * 0.3) - 0.5, vn(p * 0.6 - uT * 0.25 + 7.0) - 0.5) + 0.5 * vec2(vn(p * 2.3 + uT) - 0.5, vn(p * 2.1 - uT + 3.0) - 0.5);
  vec4 rc = uRM * vec4(vW, 1.0); vec2 uv = rc.xy / rc.w * 0.5 + 0.5; uv += n * vec2(0.012, 0.05) / (1.0 + d * 0.01); vec3 r = texture2D(uRef, clamp(uv, 0.001, 0.999)).rgb;
  vec3 V = normalize(vW - cameraPosition); float fr = 0.25 + 0.75 * pow(1.0 - max(-V.y, 0.0), 4.0); vec3 col = mix(vec3(0.004, 0.008, 0.016), r, fr);
  gl_FragColor = vec4(col, 1.0);
#include <encodings_fragment>
}` })); S.water.position.set(0, FAIR.WATER, -1500); st.scene.add(S.water);
  // people at the railing and on the boardwalk; a crowd along the front
  S.ppl = [[-3.2, 1.0, 'film'], [-2.3, 1.1, 'lean'], [2.4, 0.9, 'point'], [3.3, 1.2, 'hug'], [4.1, 1.15, 'hug2'], [-5.8, 2.6, 'kid'], [6.8, 3.2, 'walk'], [-1.0, 4.6, 'walk2'], [-3.0, 8.6, 'stall'], [1.4, 8.4, 'stall'], [4.4, 8.8, 'stall'], [-6.4, 7.6, 'walk']].map(([x, z, role], i) => { const P = (i % 2 ? man : woman)(R, { kid: role === 'kid', seed: 800 + i }); st.scene.add(P.root); return { P, x, z, role, ph: R.r(0, 6) }; });
  { const bal = new THREE.Group(); bal.add(mesh(new THREE.SphereGeometry(0.22, 16, 12).scale(1, 1.2, 1), new THREE.MeshPhysicalMaterial({ color: '#e83a5a', roughness: 0.2, clearcoat: 1 }), 0, 1.4, 0)); bal.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.2, 4), STDm({ color: '#f4f4f4' }), 0, 0.6, 0)); S.ppl[5].P.arms[1].hand.add(bal); S.balloon = bal; }
  S.crowd = makeCrowd(260, { seed: 9 }); st.scene.add(S.crowd.grp); S.cl = []; for (let i = 0; i < 260; i++) S.cl.push({ x: R.f() < 0.5 ? R.r(-55, -7) : R.r(7, 55), z: R.r(0.7, 5), yaw: Math.PI + R.n(0.4), ph: R.r(0, 6) });
  // shards (glass) and sparks (bulbs) for the shock
  { const N = 900, p = new Float32Array(N * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); S.shards = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdcecff, size: 0.05, transparent: true, opacity: 0.9 })); S.shards.frustumCulled = false; st.scene.add(S.shards); S.shp = p; S.shg = g;
    S.shL = []; const RS = RNG('shards'); for (let i = 0; i < N; i++) { const gl = S.glass[i % S.glass.length]; S.shL.push({ x: gl.x + RS.r(-2.1, 2.1), y: 1.4 + RS.r(-0.3, 0.3), z: gl.z, vx: RS.n(1.2), vy: RS.r(0.5, 2.5), vz: RS.r(-3.5, -0.5) }); } }
  return S; }
// formations for the drones (centre over the bay)
function droneForm(k, i, N) { const u = i / N, cx = 6, cy = 62, cz = -150;
  if (k === 0) { const g = Math.ceil(Math.sqrt(N)), x = (i % g) / g - 0.5, y = Math.floor(i / g) / g - 0.5; return [cx + x * 70, cy + y * 34, cz]; }
  if (k === 1) { const a = u * TAU, x = 16 * Math.sin(a) ** 3, y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); return [cx + x * 2.3, cy + y * 2.3, cz]; }
  const r = 26 * Math.sqrt(u), a = i * 2.39996; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9, cz + Math.sin(a * 0.5) * 4]; }
function poseFair(S, t, o) { const st = S.st; SKY.uT.value = t; S.WU.uT.value = t; WIND.value = t;
  // drones: grid -> heart -> sunflower; they fall into the sea after the flare
  const f1 = ss(2, 5, t), f2 = ss(9, 12, t), fall = Math.max(0, t - 44.3);
  for (let i = 0; i < S.ND; i++) { const a = droneForm(0, i, S.ND), b = droneForm(1, i, S.ND), c = droneForm(2, i, S.ND); let x = lerp(lerp(a[0], b[0], f1), c[0], f2), y = lerp(lerp(a[1], b[1], f1), c[1], f2), z = lerp(lerp(a[2], b[2], f1), c[2], f2);
    if (fall > 0) { const d = (i * 0.137) % 1 * 0.6; const s = Math.max(0, fall - d); y = Math.max(FAIR.WATER - 1, y - 4.9 * s * s); x += Math.sin(i) * s * 2; }
    S.dp[i * 3] = x; S.dp[i * 3 + 1] = y + 0.3 * Math.sin(t * 2 + i); S.dp[i * 3 + 2] = z; const pink = f1 > 0.5 && f2 < 0.5, off = fall > 0 && ((i * 0.37) % 1) < ss(0, 1.5, fall); const cc = off ? [0, 0, 0] : pink ? [1.0, 0.45, 0.6] : [0.85, 0.9, 1.0]; S.dc[i * 3] = cc[0]; S.dc[i * 3 + 1] = cc[1]; S.dc[i * 3 + 2] = cc[2]; }
  S.dg.attributes.position.needsUpdate = S.dg.attributes.color.needsUpdate = true;
  S.wheel.rotation.z = t * 0.06; S.gond.forEach((g) => (g.rotation.z = -S.wheel.rotation.z)); S.lhBeam.rotation.y = t * 0.9; S.lhBeam.visible = o.out < 0.5; S.blink.forEach((b, i) => (b.visible = Math.sin(t * 3 + i) > 0 && o.out < 0.5));
  // the shock: bulbs pop, lamps die, glass breaks, the city goes dark
  const out = o.out; const pop = (i, n) => ((i * 0.6180339) % 1) < out; for (let i = 0; i < S.nb; i++) { if (pop(i)) S.bulbs.setMatrixAt(i, _hid); } S.bulbs.instanceMatrix.needsUpdate = true; for (let i = 0; i < S.wbn; i++) if (pop(i + 7)) S.wb.setMatrixAt(i, _hid); S.wb.instanceMatrix.needsUpdate = true;
  S.lampHeads.forEach((h, i) => (h.material.emissiveIntensity = pop(i * 13) ? 0 : 2.2)); S.lights.forEach((L, i) => (L.intensity = pop(i * 29 + 3) ? 0 : 3.2)); S.towers.forEach((m) => (m.userData.U.uLit.value = 1 - out)); S.quayL.visible = out < 0.6; SKY.uOut.value = out;
  const sh = Math.max(0, t - 52.2); S.glass.forEach((g) => (g.gl.visible = sh <= 0)); S.shards.visible = sh > 0; if (sh > 0) { S.shL.forEach((d, i) => { const y = Math.max(0.01, d.y + d.vy * sh - 4.9 * sh * sh); S.shp[i * 3] = d.x + d.vx * sh * (y > 0.02 ? 1 : 0.4); S.shp[i * 3 + 1] = y; S.shp[i * 3 + 2] = d.z + d.vz * Math.min(sh, 0.6); }); S.shg.attributes.position.needsUpdate = true; }
  // people
  const look = o.look, panic = o.panic; S.ppl.forEach((p, i) => { const ph = t + p.ph; let q = { x: p.x, z: p.z, yaw: Math.PI, headPitch: -0.55 * look, emo: { smile: 0.5 * (1 - look), surprise: look * 0.6, open: look * 0.3 } };
    if (p.role === 'film') q.armR = [1.7 + 0.3 * look, 0.0, 1.5 - 0.6 * look]; if (p.role === 'lean') Object.assign(q, { lean: 0.15 * (1 - look), armL: [1.1, 0.2, 0.5], armR: [1.1, 0.2, 0.5] }); if (p.role === 'point') q.armR = look > 0.2 ? [2.5, 0.3, 0.2] : null;
    if (p.role === 'hug' || p.role === 'hug2') q.armL = [0.6, -0.3, 0.9]; if (p.role === 'stall') Object.assign(q, { yaw: i % 2 ? 0.4 : -0.3, armR: [0.9, 0.1, 1.5] }); if (p.role === 'kid') q.armR = [1.6, 0.1, 0.6];
    if (p.role === 'walk' || p.role === 'walk2') Object.assign(q, { x: p.x + Math.sin(ph * 0.2) * 3, yaw: Math.PI / 2, walk: 1 - look, ph: t * 6, headYaw: -1.2 * look });
    if (panic > 0.02) { if (i % 3 === 0) Object.assign(q, { kneel: panic, lean: 0.7 * panic, armL: [2.8, 0.3, 2.3], armR: [2.8, 0.3, 2.3], headPitch: 0.4 * panic, emo: { fear: panic, open: 0.7 * panic, blink: 0.6 * panic } });
      else if (i % 3 === 1) Object.assign(q, { yaw: 0, run: panic, walk: 0, ph: t * 10, z: p.z + 3 * panic * Math.max(0, t - 52.5), armL: [2.6, 0.2, 2.2], emo: { fear: panic, open: panic } });
      else Object.assign(q, { armL: [1.4, 0.1, 2.3], armR: [1.4, 0.1, 2.3], headPitch: 0.2, emo: { fear: panic, blink: 0.8 * panic, open: 0.5 * panic } }); }
    posePerson(p.P, q); });
  if (S.balloon) S.balloon.visible = t < 52.4;
  S.cl.forEach((c, i) => S.crowd.set(i, c.x + (panic > 0.5 && i % 2 ? 4 * (t - 52.5) : 0), 0, c.z + (panic > 0.5 ? 3 * Math.max(0, t - 52.5) * (i % 3 ? 1 : 0) : 0), c.yaw, 1, look * (i % 4 === 0 ? 0.8 : 0) + (panic > 0.5 && i % 3 === 0 ? 1 : 0), 0.05 * Math.sin(t * 3 + c.ph))); S.crowd.done();
  // night light; violet during the flare; brown morning
  const fl = o.flare, br = o.brown; st.hemi.intensity = 0.35 + 2.4 * fl + 0.5 * br; st.hemi.color.copy(lin('#4a5080').lerp(lin('#b080ff'), fl).lerp(lin('#a87a52'), br)); st.key.intensity = 0.45 + 1.5 * br; st.key.color.copy(lin('#a8b8e0').lerp(lin('#c89a6a'), br)); }
const _rp = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FAIR.WATER), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
function renderReflectionF(S, st) { if (CAMONLY) return; const cam = st.cam, rc = S.rcam, Rr = r3(); cam.updateMatrixWorld(true); rc.copy(cam); const L = FAIR.WATER; rc.position.set(cam.position.x, 2 * L - cam.position.y, cam.position.z); cam.getWorldDirection(_v1); _v2.copy(cam.position).add(_v1); _v2.y = 2 * L - _v2.y; rc.up.set(0, -1, 0); rc.lookAt(_v2); rc.up.set(0, 1, 0);
  rc.updateMatrixWorld(true); rc.updateProjectionMatrix(); S.WU.uRM.value.multiplyMatrices(rc.projectionMatrix, rc.matrixWorldInverse); S.water.visible = false; Rr.r.clippingPlanes = [_rp]; Rr.r.setRenderTarget(S.RT); Rr.r.clear(); Rr.r.render(st.scene, rc); Rr.r.setRenderTarget(null); Rr.r.clippingPlanes = []; S.water.visible = true; }
