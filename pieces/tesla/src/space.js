
// =====================================================================
//  SPACE — the Earth (continents, clouds, ice; a glowing atmosphere rim; city lights on the night side), the Sun, stars;
//  and Starman: the cherry-red 2008 Roadster (low open two-seater) with a spacesuited mannequin at the wheel, one arm on the door.
//  Units: 1 = 1 m near the cars; the Earth is a 6371 km sphere scaled into view (radius ER, far below).
// =====================================================================
const SUN_SPACE = new THREE.Vector3(0.22, 0.16, -0.96).normalize();
const ER = 900;
function earthTex() { const hs = (i, j, q) => { const v = Math.sin(i * 127.1 + j * 311.7 + q * 74.7) * 43758.5453; return v - Math.floor(v); }, vn = (x, y, q, P) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hs(i % P, j, q), hs((i + 1) % P, j, q), u), lerp(hs(i % P, j + 1, q), hs((i + 1) % P, j + 1, q), u), v); }, fbm = (x, y, q, P) => { let a = 0, m = 0.5, f = 1; for (let o = 0; o < 6; o++) { a += m * vn(x * f, y * f, q, P * f); m *= 0.5; f *= 2; } return a; };
  return g3Tex((x, w, h) => { const im = x.createImageData(w, h); for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) { const X = px / w * 5, Y = py / h * 2.5, lat = Math.abs(py / h - 0.5) * 2, e = (fbm(X, Y, 1, 5) - 0.5) * 2.6 + 0.5, cl = fbm(X * 2.3, Y * 2.3, 7, 14); let r, g, b;
    if (e > 0.46) { const k = clamp((e - 0.46) * 2.5); r = 44 + 50 * k; g = 96 + 40 * k; b = 38 + 14 * k; if (lat < 0.3 && e > 0.92) { r = 176; g = 150; b = 100; } } else { const k = clamp(e / 0.46); r = 8 + 14 * k; g = 30 + 46 * k; b = 72 + 70 * k; }
    if (lat > 0.84) r = g = b = 236; const c = clamp((cl - 0.57) * 2.6); const o = (py * w + px) * 4; im.data[o] = lerp(r, 248, c); im.data[o + 1] = lerp(g, 250, c); im.data[o + 2] = lerp(b, 255, c); im.data[o + 3] = 255; } x.putImageData(im, 0, 0); }, 2048, 1024); }
function buildStarman() {
  const g = new THREE.Group(), red = STDm({ color: '#b8141a', roughness: 0.28, metalness: 0.35 }), blk = STDm({ color: '#141416', roughness: 0.5 }), suit = STDm({ color: '#f2f2ee', roughness: 0.55 }), dark = STDm({ color: '#1a1a1e', roughness: 0.4 });
  // the 2008 Roadster: a low wedge, rounded nose, two humps behind the seats, open cockpit
  const body = roundBody((s) => { s.moveTo(-1.95, 0.3); s.lineTo(1.85, 0.3); s.quadraticCurveTo(2.08, 0.34, 2.02, 0.52); s.quadraticCurveTo(1.7, 0.7, 0.7, 0.76); s.lineTo(-0.2, 0.8); s.quadraticCurveTo(-1.5, 0.92, -1.98, 0.78); s.quadraticCurveTo(-2.06, 0.5, -1.95, 0.3); }, 1.5, 0.12, 0.25, 1.4);
  g.add(mesh(body, red)); const tub = mesh(new THREE.BoxGeometry(1.25, 0.4, 1.2), blk, -0.25, 0.68, 0); g.add(tub);
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.32, 1.25), STDm({ color: '#20262e', roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.6 }), 0.42, 0.95, 0, { rz: -0.5 }));
  [-0.35, 0.35].forEach((z) => g.add(mesh(new THREE.SphereGeometry(0.2, 16, 12).scale(1.6, 0.8, 1), red, -1.05, 0.85, z)));
  [-0.55, 0.55].forEach((z) => g.add(mesh(new THREE.SphereGeometry(0.1, 14, 10), STDm({ color: '#f4f4ee', emissive: '#ffffff', emissiveIntensity: 0.3 }), 1.85, 0.55, z)));
  for (const [x, z] of [[1.3, 0.78], [1.3, -0.78], [-1.3, 0.8], [-1.3, -0.8]]) { const w = buildWheel(0.32, 0.24, '#c8ccd2'); w.position.set(x, 0.32, z); if (z < 0) w.rotation.y = Math.PI; g.add(w); }
  const wheel = mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 24), blk, 0.05, 0.92, -0.3, { ry: Math.PI / 2 }); wheel.rotation.set(0, Math.PI / 2, 0); wheel.rotateX(0.5); g.add(wheel);
  // Starman: a white suit with black panels, a helmet with a dark gold-tinted visor
  const sm = new THREE.Group(); sm.position.set(-0.35, 0.55, -0.3); g.add(sm);
  sm.add(mesh(new THREE.CapsuleGeometry(0.2, 0.35, 6, 16), suit, 0, 0.45, 0)); sm.add(mesh(new THREE.BoxGeometry(0.18, 0.2, 0.42), blk, 0.08, 0.5, 0));
  const helm = new THREE.Group(); helm.position.set(0, 0.95, 0); sm.add(helm); helm.add(mesh(new THREE.SphereGeometry(0.17, 24, 18), suit)); helm.add(mesh(new THREE.SphereGeometry(0.155, 24, 18, -0.9, 1.8, 0.7, 1.2), STDm({ color: '#2a2418', metalness: 0.95, roughness: 0.08 }), 0.03, 0, 0, { ry: Math.PI / 2 }));
  // legs forward into the footwell, the left arm to the wheel, the right arm resting on the door
  [-0.12, 0.12].forEach((z) => { sm.add(mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 10), suit, 0.3, 0.12, z, { rz: Math.PI / 2 - 0.15 })); sm.add(mesh(new THREE.CapsuleGeometry(0.065, 0.36, 4, 10), suit, 0.62, -0.08, z, { rz: 0.4 })); });
  sm.add(mesh(new THREE.CapsuleGeometry(0.06, 0.4, 4, 10), suit, 0.22, 0.5, 0.0, { rz: Math.PI / 2 - 0.5 })); sm.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), blk, 0.42, 0.38, 0.0));
  const arm = mesh(new THREE.CapsuleGeometry(0.06, 0.36, 4, 10), suit, 0.05, 0.62, -0.32, { rx: -1.2 }); sm.add(arm); sm.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), blk, 0.1, 0.48, -0.5));
  g.traverse((m) => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); return g; }
function buildSpace(st) {
  const S = { st }; st.scene.background = lin('#010104');
  const earthG = new THREE.SphereGeometry(1, 128, 96), earthM = STDm({ map: earthTex(), roughness: 0.75 });
  earthM.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
    { vec3 nW = normalize(vNormal); float night = smoothstep(0.05, -0.25, dot(nW, normalize((viewMatrix * vec4(${SUN_SPACE.x.toFixed(3)}, ${SUN_SPACE.y.toFixed(3)}, ${SUN_SPACE.z.toFixed(3)}, 0.0)).xyz)));
      float lights = step(0.62, fract(sin(dot(floor(vUv * vec2(900.0, 450.0)), vec2(12.9898, 78.233))) * 43758.5453)) * step(0.55, diffuseColor.g + diffuseColor.r - diffuseColor.b * 0.8);
      totalEmissiveRadiance += vec3(1.0, 0.75, 0.4) * lights * night * step(diffuseColor.b, 0.45) * 0.8; }`); };
  S.earth = new THREE.Mesh(earthG, earthM); S.earth.scale.setScalar(ER); st.scene.add(S.earth);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(1.025, 128, 96), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { sun: { value: SUN_SPACE } },
    vertexShader: 'varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 sun; varying vec3 vN; varying vec3 vW; void main(){ vec3 V = normalize(cameraPosition - vW); float rim = pow(1.0 - abs(dot(V, -vN)), 3.0); float lit = smoothstep(-0.3, 0.5, dot(-vN, sun)); gl_FragColor = vec4(vec3(0.35, 0.62, 1.0) * rim * (0.25 + lit) * 2.2, rim); }' }));
  atm.scale.setScalar(ER); S.atm = atm; st.scene.add(atm);
  const R = RNG('stars'), sp = []; for (let i = 0; i < 6000; i++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize().multiplyScalar(30000); sp.push(v.x, v.y, v.z); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  S.stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0.9 })); st.scene.add(S.stars);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff8e8', toneMapped: false })); sun.position.copy(SUN_SPACE).multiplyScalar(25000); st.scene.add(sun); const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xfff2d8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); halo.position.copy(sun.position); halo.scale.setScalar(9000); st.scene.add(halo);
  S.star = buildStarman(); st.scene.add(S.star); return S; }
// alt: your altitude in km above the surface (the Earth sits below at -ER - alt)
function poseSpace(S, ts, alt) { S.earth.position.set(0, -(ER + alt), -260); S.atm.position.copy(S.earth.position); S.earth.rotation.set(1.25, 3.4 + ts * 0.004, 0.2); }
