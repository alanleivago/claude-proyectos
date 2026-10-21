
// =====================================================================
//  PLAZA — behind your bench: a lawn strip and lawns of real grass blades (instanced tufts, colour from root to tip,
//  swaying in the wind), detailed trees (a curved trunk, branches, lumpy leaf masses with ragged leaf cards),
//  and a stone fountain: a mosaic basin with rippling water, a two-tier centre that spills a curtain, a tall centre jet
//  and a ring of arcing jets made of streams and droplets. Every bit of water here can vanish.
// =====================================================================
const PLZ = { FX: -8, FZ: 16, FR: 4.6 };
const LAWNS = [[-60, 60, 1.6, 5.4], [8, 40, 8, 30], [-44, -22, 8, 30]];
const inLawn = (x, z) => LAWNS.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1) && !(z < 5.6 && (Math.abs(x + 12) < 2 || Math.abs(x - 12) < 2));
function grassTuftGeo(seed, n = 12) { const R = RNG('tuft' + seed), pos = [], col = [], idx = []; const base = lin('#2f5a1e'), mid = lin('#4f8a2c'), tip = lin('#a8c45a');
  for (let b = 0; b < n; b++) { const a = R.r(0, TAU), r = R.r(0, 0.09), h = R.r(0.07, 0.17), w0 = R.r(0.006, 0.011), lean = R.r(0.1, 0.5), dir = R.r(0, TAU), bx = Math.cos(a) * r, bz = Math.sin(a) * r, i0 = pos.length / 3, tipC = tip.clone().lerp(lin(R.pick(['#c8c070', '#7aa840', '#94b84a'])), R.r(0, 0.6));
    for (let s = 0; s <= 4; s++) { const u = s / 4, y = h * u, off = lean * h * u * u, w = w0 * (1 - u * 0.92), px = bx + Math.cos(dir) * off, pz = bz + Math.sin(dir) * off, nx = -Math.sin(dir) * w, nz = Math.cos(dir) * w;
      pos.push(px - nx, y, pz - nz, px + nx, y, pz + nz); const c = u < 0.5 ? base.clone().lerp(mid, u * 2) : mid.clone().lerp(tipC, (u - 0.5) * 2); col.push(c.r, c.g, c.b, c.r, c.g, c.b); }
    for (let s = 0; s < 4; s++) { const p = i0 + s * 2; idx.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
const WIND = { value: 0 };
function windMat(o) { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.75 }, o));
  m.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    { vec2 ip = vec2(0.0);
#ifdef USE_INSTANCING
    ip = instanceMatrix[3].xz;
#endif
    float hk = transformed.y * transformed.y * 14.0; transformed.x += hk * (0.05 * sin(uWind * 1.7 + ip.x * 0.35 + ip.y * 0.21) + 0.02 * sin(uWind * 4.1 + ip.x * 1.3)); transformed.z += hk * 0.03 * sin(uWind * 1.3 + ip.y * 0.4); }`);
    sh.vertexShader = sh.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n objectNormal = normalize(objectNormal + vec3(0.0, 1.2, 0.0));'); }; return m; }
function leafCardTex() { return g3Tex((x, w) => { x.clearRect(0, 0, w, w); const R = RNG('leafcard'); for (let k = 0; k < 300; k++) { const rr = Math.sqrt(R.f()) * w * 0.46, aa = R.r(0, TAU), cx = w / 2 + Math.cos(aa) * rr, cy = w / 2 + Math.sin(aa) * rr, a = R.r(0, TAU), L = R.r(8, 14);
  x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = `hsl(${R.r(78, 112)},${R.r(32, 55)}%,${R.r(18, 40)}%)`; x.beginPath(); x.moveTo(-L, 0); x.quadraticCurveTo(0, -L * 0.48, L, 0); x.quadraticCurveTo(0, L * 0.48, -L, 0); x.fill(); x.strokeStyle = 'rgba(20,40,10,0.35)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(-L, 0); x.lineTo(L, 0); x.stroke(); x.restore(); } }, 256, 256); }
function dropTex() { return g3Radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(230,242,255,0.85)'], [1, 'rgba(200,225,255,0)']], 64); }

function buildPlaza(st) {
  const R = RNG('plaza'), S = {};
  // lawn soil and grass
  const soil = wrap(texNoise('soil', '#4a6e2c', ['rgba(30,45,15,0.5)', 'rgba(90,110,50,0.4)', 'rgba(60,50,30,0.3)'], 20000), 1, 1);
  LAWNS.forEach(([x0, x1, z0, z1]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2), STDm({ map: wrap(soil.clone(), (x1 - x0) / 4, (z1 - z0) / 4), roughness: 0.95 })); m.position.set((x0 + x1) / 2, 0.012, (z0 + z1) / 2); m.receiveShadow = true; st.scene.add(m);
    const kerb = STDm({ color: '#9a948a' }); [[x0, x1, z0], [x0, x1, z1]].forEach(([a, b, z]) => { const k = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.12, 0.12), kerb); k.position.set((a + b) / 2, 0.06, z); k.castShadow = k.receiveShadow = true; st.scene.add(k); }); });
  const tuftM = windMat({ roughness: 0.7 }), tufts = [0, 1, 2].map((k) => IM(grassTuftGeo(k, 14), tuftM, 40000, false)); const tn = [0, 0, 0];
  for (let i = 0; i < 400000; i++) { const near = i < 260000, x = near ? R.r(-24, 24) : R.r(-60, 60), z = near ? R.r(1.6, 26) : R.r(1.6, 30); if (!inLawn(x, z)) continue; const k = i % 3; if (tn[k] >= 40000) continue;
    const s = R.r(0.8, 1.3); tufts[k].setMatrixAt(tn[k]++, M4c(x, 0.01, z, R.r(0, TAU), s, R.r(0.75, 1.35), s)); }
  tufts.forEach((m, k) => { m.count = tn[k]; m.receiveShadow = true; st.scene.add(m); });
  // trees: a curved trunk + branches; lumpy leaf masses + ragged leaf cards
  const bark = STDm({ color: '#5a4a3a', roughness: 0.95, map: wrap(g3Tex((x, w) => { const Rb = RNG('bark'); x.fillStyle = '#6a5848'; x.fillRect(0, 0, w, w); for (let k = 0; k < 400; k++) { x.strokeStyle = `rgba(${Rb.f() < 0.5 ? '30,24,18' : '140,125,105'},${Rb.r(0.2, 0.5)})`; x.lineWidth = Rb.r(1, 3); x.beginPath(); const bx = Rb.r(0, w); x.moveTo(bx, 0); x.lineTo(bx + Rb.n(6), w); x.stroke(); } }, 128, 256), 2, 1) });
  const crowns = IM(lumpyGeo(4, 0.2, 11), STDm({ map: leafTex('leafP', '#2e5a22'), roughness: 0.95 }), 900), cards = IM(new THREE.PlaneGeometry(1, 1), STDm({ map: leafCardTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), 24000);
  let nc = 0, nk = 0; const tree = (x, z, h) => { const g = new THREE.Group(); g.position.set(x, 0, z); st.scene.add(g); const Rt = RNG('tree', Math.round(x * 13 + z * 7));
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.022, h * 0.04, h * 0.55, 10, 4).translate(0, h * 0.275, 0), bark); tr.castShadow = true; g.add(tr);
    for (let b = 0; b < 5; b++) { const br = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.008, h * 0.018, h * 0.3, 7).translate(0, h * 0.15, 0), bark); br.position.y = h * Rt.r(0.42, 0.55); br.rotation.set(Rt.r(0.5, 0.9), Rt.r(0, TAU), 0, 'YXZ'); br.castShadow = true; g.add(br); }
    const cr = h * 0.3; for (let j = 0; j < 9; j++) { const a = Rt.r(0, TAU), r = j ? Rt.r(0.35, 0.8) * cr : 0, y = h * 0.66 + (j ? Rt.r(-0.12, 0.22) * h : 0), s = cr * (j ? Rt.r(0.4, 0.6) : 0.72); crowns.setMatrixAt(nc, M4c(x + Math.cos(a) * r, y, z + Math.sin(a) * r, Rt.r(0, 6), s, s * 0.85, s)); crowns.setColorAt(nc++, lin(Rt.pick(['#4a5a40', '#3e4e36', '#52624a']))); }
    for (let j = 0; j < 380; j++) { const v = new THREE.Vector3(Rt.n(1), Rt.n(0.75), Rt.n(1)).normalize(), rr = Rt.r(0.75, 1.25); cards.setMatrixAt(nk, M4c(x + v.x * cr * rr, h * 0.68 + v.y * cr * rr * 0.9, z + v.z * cr * rr, Rt.r(0, TAU), cr * 0.6, cr * 0.6, cr * 0.6, Rt.r(-1.2, 1.2))); cards.setColorAt(nk++, lin('#ffffff').multiplyScalar(0.75 + 0.45 * Math.max(0, v.y) + Rt.r(-0.1, 0.1))); } };
  [[-6.2, 2.6, 10.5], [3.2, 2.3, 11], [4.7, -5.2, 9.5], [-4.9, -6.4, 9], [12, -6, 10], [-13, -5.6, 9.5]].forEach(([x, z, h]) => { tree(x, z, h); if (z < 0) { const gr = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 1.4), STDm({ color: '#2a2c2e', metalness: 0.6, roughness: 0.5 })); gr.position.set(x, 0.011, z); st.scene.add(gr); } });
  for (let x = -56; x <= 56; x += 9.5) if (Math.abs(x) > 6) tree(x + R.n(0.6), 3.6 + R.n(0.4), R.r(8, 10.5));
  [[14, 12], [22, 16], [32, 11], [18, 25], [30, 26], [-30, 12], [-38, 20], [-28, 27], [-8, 30], [6, 31]].forEach(([x, z]) => tree(x, z, R.r(9, 12)));
  crowns.count = nc; cards.count = nk; st.scene.add(crowns, cards);
  // seafront buildings behind the plaza: facades with windows, balconies, shop awnings
  const facade = (base, shut, seed) => g3Tex((x, w) => { const Rf = RNG('fac' + seed); x.fillStyle = base; x.fillRect(0, 0, w, w); speck(x, w, w, 6000, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.08)'], Rf, 1, 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x0 = c * w / 3 + w / 3 * 0.26, y0 = r * w / 3 + w / 3 * 0.18, ww = w / 3 * 0.48, hh = w / 3 * 0.6;
      x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(x0 - 6, y0 - 6, ww + 12, hh + 14); x.fillStyle = '#f4f0e8'; x.fillRect(x0 - 4, y0 - 4, ww + 8, hh + 8);
      const g = x.createLinearGradient(x0, y0, x0 + ww, y0 + hh); g.addColorStop(0, '#9ec4e0'); g.addColorStop(0.45, '#4a6a88'); g.addColorStop(0.55, '#c8dcec'); g.addColorStop(1, '#30465c'); x.fillStyle = g; x.fillRect(x0, y0, ww, hh);
      if (Rf.f() < 0.4) { x.fillStyle = Rf.pick(['#f0e8d8', '#e8d0c0', '#d8e0e8']); x.fillRect(x0, y0, ww * Rf.r(0.2, 0.5), hh); }
      x.fillStyle = '#f4f0e8'; x.fillRect(x0 + ww / 2 - 2, y0, 4, hh); x.fillRect(x0, y0 + hh * 0.4, ww, 4); x.fillStyle = '#d8d0c4'; x.fillRect(x0 - 8, y0 + hh + 4, ww + 16, 8);
      if (shut && Rf.f() < 0.7) { x.fillStyle = shut; [x0 - ww * 0.42 - 6, x0 + ww + 6].forEach((sx) => { x.fillRect(sx, y0 - 2, ww * 0.42, hh + 4); x.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 9; k++) x.fillRect(sx, y0 + k * hh / 9, ww * 0.42, 2); x.fillStyle = shut; }); } } }, 512, 512);
  const facM = [['#efe6d6', '#3a6a4a'], ['#e6d2b8', '#2a4a6a'], ['#f2efe8', null], ['#d8b890', '#8a3a2a'], ['#e8d8c8', '#3a6a4a'], ['#cfd8dc', null]].map(([c, sh], i) => facade(c, sh, i)), awn = ['#c8372d', '#2a6a8a', '#e8a838', '#3a7a4a'];
  const shopT = g3Tex((x, w, h) => { x.fillStyle = '#3a3430'; x.fillRect(0, 0, w, h); for (let c = 0; c < 4; c++) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6a8aa0'); g.addColorStop(1, '#2a3a48'); x.fillStyle = g; x.fillRect(c * w / 4 + 8, 12, w / 4 - 16, h - 24); x.fillStyle = 'rgba(255,230,180,0.35)'; x.fillRect(c * w / 4 + 8, h * 0.5, w / 4 - 16, h * 0.5 - 12); } }, 256, 64);
  for (let x = -70, k = 0; x < 70; k++) { const w = R.r(12, 20), h = R.r(14, 28), d = 14; const ft = R.pick(facM).clone(); ft.needsUpdate = true; wrap(ft, w / 10.5, (h - 4) / 10.8); ft.offset.y = 0; const fm = STDm({ map: ft, roughness: 0.8 }), b = new THREE.Mesh(new THREE.BoxGeometry(w, h - 4, d).translate(0, (h - 4) / 2 + 4, 0), fm); const shop = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d - 0.4).translate(0, 2, 0), STDm({ map: wrap(shopT.clone(), w / 12, 1), roughness: 0.4 })); shop.position.set(x + w / 2, 0, 44 + d / 2 + 0.2); shop.material.map.needsUpdate = true; st.scene.add(shop); b.position.set(x + w / 2, 0, 44 + d / 2); b.castShadow = b.receiveShadow = true; st.scene.add(b);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.6, d + 0.6), STDm({ color: '#8a5a44' })); roof.position.set(x + w / 2, h + 0.3, 44 + d / 2); st.scene.add(roof);
    const aw = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.12, 2.2).rotateX(-0.25), STDm({ color: awn[k % 4], roughness: 0.8 })); aw.position.set(x + w / 2, 3.4, 43.0); aw.castShadow = true; st.scene.add(aw);
    for (let fy = 6.6; fy < h - 2; fy += 3.6) { const bal = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.12, 0.9), STDm({ color: '#d8d4cc' })); bal.position.set(x + w / 2, fy, 43.6); st.scene.add(bal); const rail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.9, 0.04), STDm({ color: '#2c3036', metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.85 })); rail.position.set(x + w / 2, fy + 0.5, 43.15); st.scene.add(rail); }
    x += w + R.r(0, 1.5); }
  // the fountain
  const FX = PLZ.FX, FZ = PLZ.FZ, FR = PLZ.FR, stone = STDm({ color: '#cfc6b6', roughness: 0.6, map: wrap(texNoise('fstone', '#cfc6b6', ['rgba(90,80,70,0.25)', 'rgba(250,245,235,0.3)']), 4, 1) });
  const f = new THREE.Group(); f.position.set(FX, 0, FZ); st.scene.add(f); S.fountain = f;
  const rim = new THREE.Mesh(new THREE.LatheGeometry([[FR - 0.05, 0], [FR + 0.25, 0], [FR + 0.3, 0.42], [FR + 0.32, 0.52], [FR - 0.05, 0.52], [FR - 0.1, 0.45], [FR - 0.12, 0.08]].map(([r, y]) => new THREE.Vector2(r, y)), 64), stone); rim.castShadow = rim.receiveShadow = true; f.add(rim);
  const mosaic = g3Tex((x, w) => { const Rm = RNG('mosaic'); for (let i = 0; i < 64; i++) for (let j = 0; j < 64; j++) { const r = Math.hypot(i - 32, j - 32); x.fillStyle = r % 9 < 1.2 ? '#f0e8d0' : Rm.pick(['#3a7aa8', '#2f6a98', '#4a8ab8', '#5a9ac0', '#2a5a88']); x.fillRect(i * 8 + 0.5, j * 8 + 0.5, 7, 7); } }, 512, 512);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(FR - 0.08, 64).rotateX(-Math.PI / 2), STDm({ map: mosaic, roughness: 0.45 })); floor.position.y = 0.09; floor.receiveShadow = true; f.add(floor);
  const coins = IM(new THREE.CylinderGeometry(0.012, 0.012, 0.002, 10), STDm({ color: '#c8a050', metalness: 0.9, roughness: 0.3 }), 60, false); for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), r = R.r(0.8, FR - 0.4); coins.setMatrixAt(i, M4c(Math.cos(a) * r, 0.1, Math.sin(a) * r, R.r(0, 6))); } f.add(coins);
  const ped = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.75, 0], [0.62, 0.25], [0.32, 0.5], [0.26, 1.2], [0.45, 1.35], [1.5, 1.5], [1.55, 1.62], [0.3, 1.62], [0.2, 1.9], [0.16, 2.4], [0.55, 2.55], [0.6, 2.63], [0.1, 2.63], [0.08, 2.9]].map(([r, y]) => new THREE.Vector2(r, y)), 48), stone); ped.castShadow = ped.receiveShadow = true; f.add(ped);
  // water: the basin surface, the bowls' surfaces, the spill curtains
  const FU = { uT: { value: 0 } }, rippleMat = new THREE.ShaderMaterial({ uniforms: FU, transparent: true, depthWrite: false,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT; varying vec3 vW; void main(){ vec2 p = vW.xz - vec2(${FX.toFixed(1)}, ${FZ.toFixed(1)}); float r = length(p);
      float h = 0.0; for (int i = 0; i < 12; i++) { float a = float(i) * 0.5236; vec2 c = vec2(cos(a), sin(a)) * 2.4; h += sin(length(p - c) * 22.0 - uT * 9.0) * 0.5 / (1.0 + length(p - c) * 3.0); } h += sin(r * 14.0 - uT * 6.0) * 0.6 / (1.0 + r);
      vec3 n = normalize(vec3(dFdx(h) * 6.0, 1.0, dFdy(h) * 6.0)); vec3 V = normalize(vW - cameraPosition); vec3 Rf = reflect(V, n); float fr = 0.04 + 0.96 * pow(1.0 - max(dot(-V, n), 0.0), 4.0);
      vec3 sky = mix(vec3(0.85, 0.9, 0.96), vec3(0.3, 0.5, 0.82), clamp(Rf.y * 2.0, 0.0, 1.0)); vec3 col = mix(vec3(0.2, 0.45, 0.6), sky, fr); col += pow(max(dot(Rf, normalize(vec3(-0.45, 0.7, -0.55))), 0.0), 200.0) * 3.0;
      gl_FragColor = vec4(col, 0.55 + 0.4 * fr);
#include <encodings_fragment>
}` });
  const basinW = new THREE.Mesh(new THREE.CircleGeometry(FR - 0.1, 64).rotateX(-Math.PI / 2), rippleMat); basinW.position.y = 0.4; f.add(basinW);
  const bowlW = new THREE.Mesh(new THREE.CircleGeometry(1.45, 40).rotateX(-Math.PI / 2), rippleMat); bowlW.position.y = 1.58; f.add(bowlW); const bowl2 = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24).rotateX(-Math.PI / 2), rippleMat); bowl2.position.y = 2.6; f.add(bowl2);
  const curT = g3Tex((x, w, h) => { const Rc = RNG('curtain'); x.clearRect(0, 0, w, h); for (let k = 0; k < 220; k++) { const cx = Rc.r(0, w); x.strokeStyle = `rgba(235,245,255,${Rc.r(0.15, 0.55)})`; x.lineWidth = Rc.r(1, 3); x.beginPath(); x.moveTo(cx, 0); x.lineTo(cx + Rc.n(2), h); x.stroke(); } }, 256, 256);
  wrap(curT, 6, 1); const curtains = [[1.55, 0.4, 1.6], [0.6, 1.62, 2.62]].map(([r, y0, y1]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.03, r * 1.12, y1 - y0, 48, 1, true), new THREE.MeshBasicMaterial({ map: curT.clone(), transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.material.map.wrapS = m.material.map.wrapT = THREE.RepeatWrapping; m.material.map.repeat.set(8, 1); m.position.y = (y0 + y1) / 2; f.add(m); return m; });
  // jets: streams (thin tubes) + droplets (points)
  const jets = []; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, p0 = new THREE.Vector3(Math.cos(a) * (FR - 0.15), 0.5, Math.sin(a) * (FR - 0.15)), v = new THREE.Vector3(-Math.cos(a) * 1.7, 4.4, -Math.sin(a) * 1.7); jets.push({ p0, v, T: 2 * v.y / 9.8 * 0.93 }); }
  jets.push({ p0: new THREE.Vector3(0, 2.9, 0), v: new THREE.Vector3(0, 7.2, 0), T: 2 * 7.2 / 9.8 * 0.92 });
  const streamM = new THREE.MeshStandardMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.45, roughness: 0.05, metalness: 0.1, depthWrite: false });
  jets.forEach((J) => { const pts = []; for (let i = 0; i <= 24; i++) { const s = i / 24 * J.T; pts.push(J.p0.clone().add(J.v.clone().multiplyScalar(s)).add(new THREE.Vector3(0, -4.9 * s * s, 0))); }
    J.mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, J.v.x === 0 ? 0.035 : 0.022, 8), streamM); f.add(J.mesh); });
  const ND = 1400, dpos = new Float32Array(ND * 3), dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const drops = new THREE.Points(dgeo, new THREE.PointsMaterial({ map: dropTex(), size: 0.07, transparent: true, depthWrite: false, color: 0xeef6ff })); f.add(drops); const dL = []; for (let i = 0; i < ND; i++) dL.push({ j: i % jets.length, u: R.f(), sp: [R.n(0.25), R.n(0.15), R.n(0.25)] });
  Object.assign(S, { tufts, FU, basinW, bowlW, bowl2, curtains, jets, drops, dL, dpos, dgeo, waterParts: [basinW, bowlW, bowl2, ...curtains, drops, ...jets.map((J) => J.mesh)] }); return S;
}
function posePlaza(S, ts, k) {
  WIND.value = ts; S.FU.uT.value = ts; S.waterParts.forEach((m) => (m.visible = k > 0.5)); if (k < 0.5) return;
  S.curtains.forEach((c, i) => (c.material.map.offset.y = -ts * (1.4 + i * 0.4)));
  S.dL.forEach((d, i) => { const J = S.jets[d.j], s = mod(d.u + ts / J.T * 0.9, 1) * J.T * 1.08; S.dpos[i * 3] = J.p0.x + J.v.x * s + d.sp[0] * s; S.dpos[i * 3 + 1] = Math.max(0.4, J.p0.y + J.v.y * s - 4.9 * s * s + d.sp[1] * s); S.dpos[i * 3 + 2] = J.p0.z + J.v.z * s + d.sp[2] * s; }); S.dgeo.attributes.position.needsUpdate = true;
}
