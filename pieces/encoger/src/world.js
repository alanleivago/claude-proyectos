
// =====================================================================
//  WORLDS — one renderer (logarithmic depth: the forest spans metres to tenths of a millimetre), seven scenes:
//  F the Valdivian forest floor and its mossy log (moss shoots, sporophytes, dewdrops, a beetle, ants, springtails, a snail);
//  D inside a dewdrop (diatoms, paramecia, rotifers, specks) and the tardigrade; C inside a cell (mitochondria, vesicles,
//  ribosomes, filaments, the nucleus, chromatin); N the DNA double helix; A the atom's electron cloud; P the nucleus;
//  Q the quarks inside a proton (glowing colour charges, gluon strings, flickering virtual particles).
// =====================================================================
let R3 = null, WF = null, WD = null, WC = null, WN = null, WA = null, WP = null, WQ = null;
function rend() {
  if (R3) return R3;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  R3 = { cv, r }; return R3;
}
const mergeG = (parts) => { const P2 = [], N2 = [], C2 = []; parts.forEach(([geo, m4, col, shade]) => { let g2 = geo.clone(); if (!g2.attributes.normal) g2.computeVertexNormals(); g2.applyMatrix4(m4); if (g2.index) g2 = g2.toNonIndexed();
    const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P2.push(p.getX(i), p.getY(i), p.getZ(i)); N2.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.6 + 0.4 * clamp(n.getY(i) * 0.5 + 0.5) : 1; C2.push(cc.r * k, cc.g * k, cc.b * k); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N2, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C2, 3)); return g; };
// a curved blade with a colour gradient (base → tip), for moss leaves and stems
function blade(len, wid, bend, cb, ct, segs = 8) { const g = new THREE.PlaneGeometry(wid, len, 1, segs).translate(0, len / 2, 0), p = g.attributes.position, col = [], A = lin(cb), B = lin(ct);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), u = y / len, x = p.getX(i) * (1 - 0.85 * u * u); p.setXYZ(i, x, y, bend * u * u * len); const c = A.clone().lerp(B, Math.pow(u, 0.8)); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g; }
function mergeC(parts) { const P2 = [], N2 = [], C2 = []; parts.forEach(([geo, m4]) => { let g2 = geo.clone(); if (!g2.attributes.normal) g2.computeVertexNormals(); g2.applyMatrix4(m4); if (g2.index) g2 = g2.toNonIndexed(); const p = g2.attributes.position, n = g2.attributes.normal, c = g2.attributes.color;
    for (let i = 0; i < p.count; i++) { P2.push(p.getX(i), p.getY(i), p.getZ(i)); N2.push(n.getX(i), n.getY(i), n.getZ(i)); C2.push(c ? c.getX(i) : 1, c ? c.getY(i) : 1, c ? c.getZ(i) : 1); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N2, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C2, 3)); return g; }
const tint = (geo, col) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(), c = lin(col), a = []; for (let i = 0; i < g.attributes.position.count; i++) a.push(c.r, c.g, c.b); g.setAttribute('color', new THREE.Float32BufferAttribute(a, 3)); return g; };
// an ant body (head with mandibles and eyes, three-part thorax, petiole, a glossy gaster), legs apart so they can walk
function antBody() { const ell = (rx, ry, rz) => new THREE.SphereGeometry(1, 28, 20).scale(rx, ry, rz);
  return mergeC([[tint(ell(0.46, 0.4, 0.5), '#4a140a'), M4c(0, 0.62, 1.15)], [tint(ell(0.14, 0.12, 0.12), '#0a0606'), M4c(0.36, 0.72, 1.28)], [tint(ell(0.14, 0.12, 0.12), '#0a0606'), M4c(-0.36, 0.72, 1.28)],
    [tint(new THREE.ConeGeometry(0.07, 0.42, 8).rotateX(Math.PI / 2), '#2a0a04'), M4c(0.14, 0.48, 1.6, -0.35)], [tint(new THREE.ConeGeometry(0.07, 0.42, 8).rotateX(Math.PI / 2), '#2a0a04'), M4c(-0.14, 0.48, 1.6, 0.35)],
    [tint(ell(0.26, 0.24, 0.34), '#5a1a0c'), M4c(0, 0.62, 0.55)], [tint(ell(0.22, 0.2, 0.28), '#5a1a0c'), M4c(0, 0.58, 0.18)], [tint(ell(0.2, 0.22, 0.2), '#521608'), M4c(0, 0.55, -0.12)],
    [tint(ell(0.12, 0.16, 0.1), '#4a1408'), M4c(0, 0.6, -0.36)], [tint(ell(0.58, 0.5, 0.72), '#3a0e06'), M4c(0, 0.62, -1.1)]]); }
function antLegGeo() { return mergeC([[tint(new THREE.CylinderGeometry(0.045, 0.06, 0.55, 8).translate(0, -0.27, 0), '#3a1008'), M4c(0, 0, 0, 0, 1, 1, 1, 0, 1.1)], [tint(new THREE.CylinderGeometry(0.03, 0.045, 0.7, 8).translate(0, -0.35, 0), '#2a0a04'), M4c(0.5, -0.22, 0, 0, 1, 1, 1, 0, 0.25)]]); }
const addM = (scene, geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); scene.add(m); return m; };
const glowTex = () => g3Radial([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.55)'], [0.6, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']], 128);
const sprites = (scene, n, map, o = {}) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map, transparent: true, depthWrite: false, opacity: 0 }, o))); s.visible = false; scene.add(s); return s; });

// ---------- F: the forest floor ----------
const LOG = { y: 0.45, z: -1.6, r: 0.45 };
const logTop = (z) => LOG.y + Math.sqrt(Math.max(0, LOG.r * LOG.r - (z - LOG.z) ** 2));
const SPOT = { x: 0.02, z: -1.56 };                 // where we shrink into the moss
const DEW = { x: 0.021, z: -1.5655, r: 0.0014 };    // the dewdrop we fall into
const inLane = (x, z) => Math.hypot(x - DEW.x, z - DEW.z) < 0.009 || z > DEW.z - 0.003 && z < SPOT.z + 0.05 && Math.abs(x - lerp(DEW.x, SPOT.x, clamp((z - DEW.z) / (SPOT.z - DEW.z)))) < 0.0038 + 0.15 * Math.max(0, z - SPOT.z) + 0.004 * ss(SPOT.z, DEW.z, z);
function forest3() {
  if (WF) return WF;
  const scene = new THREE.Scene(); scene.background = lin('#9aae80'); scene.fog = new THREE.Fog(0x9aae80, 3, 45);
  const cam = new THREE.PerspectiveCamera(62, W / H, 0.00002, 400); scene.add(cam);
  const hemi = new THREE.HemisphereLight(0xe8f0d0, 0x3a3a22, 0.85); scene.add(hemi); const sun = new THREE.DirectionalLight(0xfff0c8, 2.2); sun.position.set(3, 8, 4); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 3; sun.shadow.blurSamples = 10; rend().r.shadowMap.enabled = true; rend().r.shadowMap.type = THREE.VSMShadowMap;
  // textures: leaf litter, bark with fissures and lichen, fine moss
  const ANI = rend().r.capabilities.getMaxAnisotropy();
  const litter = g3Tex((x, w, h) => { const R = RNG('litter'); x.fillStyle = '#3a2a1a'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 1500; k++) { const px = R.r(0, w), py = R.r(0, h), l = R.r(14, 40), wd = l * R.r(0.3, 0.5), a = R.r(0, TAU), c = R.pick(['#7a4a22', '#9a6028', '#5a3a1e', '#b07838', '#6a5028', '#8a3a1a', '#a88a48', '#4a3a20']);
      x.save(); x.translate(px, py); x.rotate(a); x.fillStyle = c; x.beginPath(); x.ellipse(0, 0, l / 2, wd / 2, 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(30,18,8,0.5)'; x.lineWidth = 1; x.beginPath(); x.moveTo(-l / 2, 0); x.lineTo(l / 2, 0); x.stroke();
      for (let v = -2; v <= 2; v++) { if (!v) continue; x.beginPath(); x.moveTo(v * l / 6, 0); x.lineTo(v * l / 6 + l / 10, (v > 0 ? 1 : -1) * wd * 0.4); x.stroke(); } x.fillStyle = 'rgba(0,0,0,0.18)'; x.beginPath(); x.ellipse(1.5, 1.5, l / 2, wd / 2, 0, 0, TAU); x.globalCompositeOperation = 'destination-over'; x.fill(); x.globalCompositeOperation = 'source-over'; x.restore(); }
    x.strokeStyle = 'rgba(60,40,24,0.9)'; for (let k = 0; k < 60; k++) { x.lineWidth = R.r(1, 3); x.beginPath(); const px = R.r(0, w), py = R.r(0, h), a = R.r(0, TAU), l = R.r(20, 70); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } }, 1024, 1024);
  wrap(litter, 50, 50); litter.anisotropy = ANI;
  const barkT = g3Tex((x, w, h) => { const R = RNG('bark'); x.fillStyle = '#5a4c3e'; x.fillRect(0, 0, w, h); for (let k = 0; k < 90; k++) { const px = R.r(0, w), wd = R.r(2, 7); x.strokeStyle = `rgba(${R.f() < 0.5 ? '30,22,16' : '120,104,88'},${R.r(0.4, 0.8)})`; x.lineWidth = wd; x.beginPath(); for (let py = 0; py <= h; py += 8) { const xx = px + 8 * Math.sin(py * 0.02 + k) + R.n(1.5); py ? x.lineTo(xx, py) : x.moveTo(xx, py); } x.stroke(); }
    for (let k = 0; k < 160; k++) { const px = R.r(0, w), py = R.r(0, h), r = R.r(4, 18); x.fillStyle = R.f() < 0.55 ? `rgba(170,190,150,${R.r(0.4, 0.8)})` : `rgba(80,120,40,${R.r(0.5, 0.9)})`; x.beginPath(); x.ellipse(px, py, r, r * R.r(0.6, 1), R.r(0, 3), 0, TAU); x.fill(); } speck(x, w, h, 9000, ['rgba(20,14,10,0.3)', 'rgba(200,190,170,0.15)'], R, 1, 3); }, 512, 1024);
  const mossT = g3Tex((x, w, h) => { const R = RNG('mossT'); x.fillStyle = '#4a7a22'; x.fillRect(0, 0, w, h); for (let k = 0; k < 9000; k++) { const px = R.r(0, w), py = R.r(0, h), c = R.pick(['#6aa030', '#3a6a1a', '#8ac040', '#2e5a14', '#5a8a2a']); x.strokeStyle = c; x.lineWidth = 1.2; for (let j = 0; j < 5; j++) { const a = j / 5 * TAU + R.r(0, 1), l = R.r(2, 5); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } } }, 512, 512);
  // the ground
  { const g = new THREE.PlaneGeometry(120, 120, 240, 240).rotateX(-Math.PI / 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.04 * Math.sin(x * 1.3) * Math.sin(z * 1.1) + 0.02 * Math.sin(x * 4.1 + z * 3.3) + 0.6 * ss(10, 40, Math.hypot(x, z)) * Math.sin(x * 0.2 + z * 0.13)); } g.computeVertexNormals();
    const gr = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: litter, roughness: 0.95 })); gr.receiveShadow = true; scene.add(gr); }
  // the log: bark, and a moss blanket over its top
  { const bt = barkT.clone(); bt.needsUpdate = true; wrap(bt, 3, 6); bt.anisotropy = ANI; const g = new THREE.CylinderGeometry(LOG.r - 0.004, LOG.r - 0.004, 7, 360, 30).rotateZ(Math.PI / 2);
    const lg = addM(scene, g, new THREE.MeshStandardMaterial({ map: bt, roughness: 0.95 }), 0, LOG.y, LOG.z); lg.castShadow = lg.receiveShadow = true;
    const mt = mossT.clone(); mt.needsUpdate = true; wrap(mt, 900, 160); mt.anisotropy = ANI; const cap = new THREE.CylinderGeometry(LOG.r, LOG.r, 7, 1440, 1, true, Math.PI * 0.08, Math.PI * 0.84).rotateZ(Math.PI / 2);
    const cm = addM(scene, cap, new THREE.MeshStandardMaterial({ map: mt, roughness: 0.85, side: THREE.DoubleSide }), 0, LOG.y, LOG.z); cm.receiveShadow = true;
    for (const ex of [-3.5, 3.5]) { const end = addM(scene, new THREE.CircleGeometry(LOG.r - 0.004, 48).rotateY(ex > 0 ? Math.PI / 2 : -Math.PI / 2), new THREE.MeshStandardMaterial({ map: g3Tex((x, w) => { x.fillStyle = '#a8845a'; x.fillRect(0, 0, w, w); for (let k = 1; k < 18; k++) { x.strokeStyle = `rgba(90,60,30,${0.3 + 0.3 * (k % 2)})`; x.lineWidth = 2; x.beginPath(); x.arc(w / 2, w / 2, k * w / 36, 0, TAU); x.stroke(); } }, 256, 256), roughness: 0.9 }), ex, LOG.y, LOG.z); } }
  // big coihue trees with bark, lichen beards hanging, ferns, colihue canes, mushrooms, light shafts, fallen leaves
  { const R = RNG('treesE'); const TR = []; for (let i = 0; i < 400 && TR.length < 46; i++) { const a = R.r(0, TAU), d = R.r(4.5, 40), x = Math.cos(a) * d, z = Math.sin(a) * d - 6, r0 = R.r(0.4, 1.5); if (z > -1 && Math.abs(x) < 6) continue; TR.push([x, z, r0]); }
    const LB = []; TR.forEach(([x, z, r0], i) => { const bt = barkT.clone(); bt.needsUpdate = true; wrap(bt, Math.max(1, Math.round(r0 * 3)), 12); const g = new THREE.CylinderGeometry(r0 * 0.75, r0, 40, 32, 20), p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const y = p.getY(k), f = 1 + 0.6 * ss(-14, -20, y) + 0.06 * Math.sin(Math.atan2(p.getZ(k), p.getX(k)) * 7); p.setX(k, p.getX(k) * f); p.setZ(k, p.getZ(k) * f); } g.computeVertexNormals();
      const t2 = addM(scene, g, new THREE.MeshStandardMaterial({ map: bt, roughness: 1 }), x, 20, z); t2.castShadow = true; t2.receiveShadow = true;
      if (i % 2 === 0) for (let k = 0; k < 40; k++) { const a = R.r(0, TAU), yy = R.r(2, 9), l = R.r(0.3, 1.2); LB.push(x + Math.cos(a) * r0 * 0.95, yy, z + Math.sin(a) * r0 * 0.95, x + Math.cos(a) * (r0 + 0.05), yy - l, z + Math.sin(a) * (r0 + 0.05)); } });
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(LB, 3)), new THREE.LineBasicMaterial({ color: 0xb8c8a0 })));
    // pinnate fern fronds: a curved rachis with leaflet pairs, a gradient from dark to bright
    const pin = []; for (let k = 0; k < 26; k++) { const u = k / 26, y = 0.2 + u * 1.6, len = 0.36 * Math.sin(Math.PI * (0.15 + 0.85 * u)) + 0.04; for (const sd of [-1, 1]) pin.push([blade(len, 0.07, 0.12, '#2e5a1a', u > 0.6 ? '#8ac04a' : '#5a9a30', 3), M4c(0, y, 0.15 * u * u * 1.6, 0, 1, 1, 1, 0, sd * (1.25 - 0.3 * u))]); }
    pin.push([blade(1.8, 0.03, 0.4, '#3a4a1a', '#6a8a2a', 10), M4c(0, 0, 0)]); const frondOne = mergeC(pin);
    const frond = mergeC(Array.from({ length: 8 }, (_, k) => [frondOne, M4c(0, 0, 0, k / 8 * TAU + (k % 2) * 0.2, 1, 1, 1, 0.75 + 0.15 * (k % 3), 0)]));
    const FERN = []; for (let i = 0; i < 600 && FERN.length < 110; i++) { const x = R.r(-12, 12), z = R.r(-14, 3); if (Math.abs(x) < 3.2 && z > -2.8) continue; FERN.push([x, z, R.r(0.7, 1.5)]); }
    const ferns = IM(frond, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide }), FERN.length, true); FERN.forEach(([x, z, sc], i) => ferns.setMatrixAt(i, M4c(x, 0, z, i, sc, sc, sc))); scene.add(ferns);
    const caneT = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#6a7a30'); g.addColorStop(0.5, '#b8c060'); g.addColorStop(1, '#5a6a28'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,50,20,0.8)'; for (let k = 0; k < 8; k++) x.fillRect(0, k * h / 8, w, 3); }, 32, 256); wrap(caneT, 1, 1);
    const CANE = []; for (let k = 0; k < 7; k++) { const cx = R.r(-10, 10), cz = R.r(-16, -4); for (let j = 0; j < 60; j++) CANE.push([cx + R.n(0.6), cz + R.n(0.6), R.r(2.5, 6)]); }
    const canes = IM(new THREE.CylinderGeometry(0.015, 0.02, 1, 8).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ map: caneT, roughness: 0.5 }), CANE.length, true); CANE.forEach(([x, z, hh], i) => canes.setMatrixAt(i, M4c(x, 0, z, 0, 1, hh, 1, R.n(0.08), R.n(0.08)))); scene.add(canes);
    const capT = g3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, '#f0b050'); g.addColorStop(0.7, '#d86a22'); g.addColorStop(1, '#a84a18'); x.fillStyle = g; x.fillRect(0, 0, w, h); speck(x, w, h, 300, ['rgba(255,240,200,0.6)'], RNG('cap'), 1, 3); }, 128, 128);
    for (let i = 0; i < 26; i++) { const x = R.r(-2.4, 2.4), z = LOG.z + R.r(0.25, 0.42) * (R.f() < 0.5 ? 1 : -1), y = logTop(z) - 0.02; if (Math.abs(x - SPOT.x) < 0.3) continue; const sc = R.r(0.02, 0.06);
      const st = addM(scene, new THREE.CylinderGeometry(sc * 0.12, sc * 0.18, sc * 1.2, 10).translate(0, sc * 0.6, 0), new THREE.MeshStandardMaterial({ color: 0xf0e0c8, roughness: 0.7 }), x, y, z); st.castShadow = true;
      const cp = addM(scene, new THREE.SphereGeometry(sc * 0.7, 24, 12, 0, TAU, 0, Math.PI / 2).scale(1, 0.5, 1), new THREE.MeshStandardMaterial({ map: capT, roughness: 0.55 }), x, y + sc * 1.1, z); cp.castShadow = true;
      const gills = addM(scene, new THREE.CircleGeometry(sc * 0.68, 24).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe8d0a0, roughness: 0.8, side: THREE.DoubleSide }), x, y + sc * 1.1, z); }
    const leafT = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#9a5a24'; x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.45, h * 0.22, 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(60,30,10,0.7)'; x.lineWidth = 2; x.beginPath(); x.moveTo(w * 0.05, h / 2); x.lineTo(w * 0.95, h / 2); x.stroke(); }, 128, 64);
    const LV = []; for (let i = 0; i < 1600; i++) { const x = R.r(-3, 3), z = R.r(-3.5, 1.5); if (Math.abs(z - LOG.z) < LOG.r + 0.05) continue; LV.push([x, z, R.r(0.03, 0.07), R.r(0, 6)]); }
    const leaves = IM(new THREE.PlaneGeometry(1, 0.5).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: leafT, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 }), LV.length, false); LV.forEach(([x, z, sc, ry], i) => { leaves.setMatrixAt(i, M4c(x, 0.06, z, ry, sc, sc, sc, R.n(0.2), R.n(0.2))); leaves.setColorAt(i, lin(R.pick(['#ffffff', '#d8c0a0', '#f0b080', '#c89060']))); }); leaves.receiveShadow = true; scene.add(leaves);
    const shaft = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,250,220,0)'); g.addColorStop(0.5, 'rgba(255,250,220,0.35)'); g.addColorStop(1, 'rgba(255,250,220,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 8);
    for (let i = 0; i < 7; i++) { const m = addM(scene, new THREE.PlaneGeometry(1.2, 30), new THREE.MeshBasicMaterial({ map: shaft, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }), R.r(-8, 8), 12, R.r(-14, -3)); m.rotation.set(0, R.r(0, 3), -0.35); } }
  // moss on the log top: leafy shoots, sporophytes with capsules, dewdrops
  const shootG = mergeC([[blade(1, 0.06, 0.05, '#3a6a1a', '#6aa030', 6), M4c(0, 0, 0)], ...Array.from({ length: 16 }, (_, k) => [blade(0.42, 0.11, 0.35, '#3e7a20', k % 3 ? '#9ad048' : '#7ab83a', 6), M4c(0, 0.18 + k * 0.05, 0, k * 2.4, 1, 1, 1, 0.75 - k * 0.02, 0)])]);
  const SHOOT = []; { const R = RNG('moss'); for (let i = 0; i < 26000; i++) { const near = i < 18000, x = SPOT.x + (near ? R.n(0.012) : R.r(-0.35, 0.35)), z = LOG.z + (near ? (SPOT.z - LOG.z) + R.n(0.012) : R.r(-0.3, 0.3)), y = logTop(z), nx = 0, nz = (z - LOG.z) / LOG.r;
    if (inLane(x, z)) continue; SHOOT.push([x, y - 0.0005, z, R.r(0.004, 0.012), R.r(0, 6), Math.asin(clamp(nz)) ]); } }
  const shoots = IM(shootG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, side: THREE.DoubleSide, emissive: 0x1a3a08, emissiveIntensity: 0.35 }), SHOOT.length, false); SHOOT.forEach(([x, y, z, h, ry, tilt], i) => shoots.setMatrixAt(i, M4c(x, y, z, ry, h, h, h, tilt * 0.9 + Math.sin(i) * 0.25, Math.cos(i) * 0.25))); shoots.frustumCulled = false; scene.add(shoots);
  const sporoG = mergeG([[new THREE.CylinderGeometry(0.01, 0.015, 1, 5).translate(0, 0.5, 0), M4c(0, 0, 0), '#b8562a', 0], [new THREE.CapsuleGeometry(0.035, 0.09, 4, 8), M4c(0.02, 1.02, 0, 0, 1, 1, 1, 0, -0.5), '#8a5a2a', 1], [new THREE.ConeGeometry(0.03, 0.05, 8), M4c(0.05, 1.1, 0, 0, 1, 1, 1, 0, -0.5), '#d8b878', 1]]);
  const SPORO = []; { const R = RNG('sporo'); for (let i = 0; i < 700; i++) { const x = SPOT.x + R.n(i < 400 ? 0.015 : 0.2), z = SPOT.z + R.n(i < 400 ? 0.015 : 0.15); if (inLane(x, z)) continue; SPORO.push([x, logTop(z), z, R.r(0.012, 0.03), R.r(0, 6)]); } }
  const sporos = IM(sporoG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }), SPORO.length, false); SPORO.forEach(([x, y, z, h, ry], i) => sporos.setMatrixAt(i, M4c(x, y, z, ry, h, h, h, Math.sin(i * 3) * 0.2, Math.cos(i * 2) * 0.2))); sporos.frustumCulled = false; scene.add(sporos);
  const dewM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 0.96, ior: 1.33, thickness: 0.0012, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.6 });
  const DEWS = []; { const R = RNG('dews'); for (let i = 0; i < 260; i++) { const x = SPOT.x + R.n(0.03), z = SPOT.z + R.n(0.03); if (inLane(x, z)) continue; DEWS.push([x, logTop(z) + R.r(0.003, 0.009), z, R.r(0.0006, 0.002)]); } DEWS.push([DEW.x, logTop(DEW.z) + DEW.r * 0.82, DEW.z, DEW.r]); }
  const dews = IM(new THREE.SphereGeometry(1, 20, 14).scale(1, 0.85, 1), dewM, DEWS.length, false); DEWS.forEach(([x, y, z, r], i) => dews.setMatrixAt(i, M4c(x, y, z, 0, r, r, r))); dews.frustumCulled = false; scene.add(dews);
  // the locals: a ground beetle, ants, springtails, a snail
  const antM = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.3 });
  const beetle = new THREE.Group(); scene.add(beetle);
  { beetle.add(new THREE.Mesh(antBody(), antM)); const legs = []; [[0.2, 0.62], [0.2, 0.18], [0.18, -0.12]].forEach(([x, z], k) => { for (const s of [-1, 1]) { const lg = new THREE.Group(); lg.position.set(s * x, 0.55, z); lg.scale.set(s, 1, 1); beetle.add(lg); lg.add(new THREE.Mesh(antLegGeo(), antM)); lg.rotation.y = s * (k - 1) * 0.5; legs.push(lg); } });
    for (const s of [-1, 1]) { const an = new THREE.Group(); an.position.set(s * 0.18, 0.86, 1.4); beetle.add(an); const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.7, 6).translate(0, 0.35, 0), antM); a1.rotation.set(0.9, 0, -s * 0.5); an.add(a1); const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.8, 6).translate(0, 0.4, 0), antM); a2.position.set(-s * 0.32, 0.47, 0.4); a2.rotation.set(1.8, 0, -s * 0.2); an.add(a2); }
    beetle.userData.legs = legs; beetle.scale.setScalar(0.0021); }
  const antG = mergeC([[antBody(), M4c(0, 0, 0)], ...[0.62, 0.18, -0.12].flatMap((z) => [-1, 1].map((s2) => [antLegGeo(), M4c(s2 * 0.2, 0.55, z, 0, s2, 1, 1)]))]);
  const ANTS = []; { const R = RNG('ants'); for (let i = 0; i < 14; i++) { const sd = i % 2 ? 1 : -1; ANTS.push({ x0: SPOT.x + sd * R.r(0.012, 0.04), z0: SPOT.z + R.r(-0.05, -0.01), vx: R.r(-0.002, 0.002), vz: R.r(0.001, 0.003), s: R.r(0.0016, 0.0022), ph: R.r(0, 6) }); } }
  const ants = IM(antG, antM, ANTS.length, false); ants.instanceMatrix.setUsage(THREE.DynamicDrawUsage); ants.frustumCulled = false; scene.add(ants);
  const SPRING = []; { const R = RNG('springtails'); for (let i = 0; i < 18; i++) SPRING.push({ x: SPOT.x + R.n(0.008), z: SPOT.z + R.n(0.008) - 0.002, t0: R.r(10, 18), s: R.r(0.00025, 0.0005) }); }
  const springs = IM(new THREE.CapsuleGeometry(0.3, 1, 4, 8).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7a6a8a, roughness: 0.5 }), SPRING.length, false); springs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); springs.frustumCulled = false; scene.add(springs);
  const snail = new THREE.Group(); scene.add(snail); { const sh = new THREE.TorusKnotGeometry(0.5, 0.28, 80, 12, 1, 3).scale(1, 1, 0.6); addM(snail, sh, new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.4 }), 0, 0.8, 0); addM(snail, new THREE.CapsuleGeometry(0.3, 1.6, 4, 10).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8b090, roughness: 0.3 }), 0, 0.25, 0.4); snail.scale.setScalar(0.012); snail.position.set(SPOT.x - 0.05, logTop(SPOT.z - 0.04) - 0.001, SPOT.z - 0.04); snail.rotation.y = 0.8; }
  const pollen = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 3000 }, (_, i) => [SPOT.x + (hsh(i) - 0.5) * 0.2, logTop(SPOT.z) + hsh(i, 2) * 0.1, SPOT.z + (hsh(i, 3) - 0.7) * 0.3]).flat(), 3)), new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: 0xfff8d8, transparent: true, opacity: 0.6 })); scene.add(pollen);
  scene.traverse((o) => { if (o.isMesh && o.material && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
  { const env = new THREE.Scene(); env.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = mix(vec3(0.25, 0.35, 0.15), vec3(0.9, 1.0, 0.8), smoothstep(-0.3, 0.8, h)); c += vec3(1.6, 1.5, 1.2) * smoothstep(0.985, 0.995, dot(normalize(vP), normalize(vec3(0.3, 0.8, 0.4)))); gl_FragColor = vec4(c, 1.0); }' })));
    const pm = new THREE.PMREMGenerator(rend().r); scene.environment = pm.fromScene(env, 0.02).texture; }
  WF = { scene, cam, sun, beetle, ANTS, ants, SPRING, springs, snail }; return WF;
}

// ---------- D: inside the dewdrop (units: 10 µm); the tardigrade ----------
function drop3() {
  if (WD) return WD;
  const scene = new THREE.Scene(); scene.background = lin('#7ab8a8'); scene.fog = new THREE.FogExp2(0x86c4b0, 0.0045);
  const cam = new THREE.PerspectiveCamera(60, W / H, 0.05, 4000); scene.add(cam);
  scene.add(new THREE.HemisphereLight(0xf0ffff, 0x4a7a6a, 1.25)); const sun = new THREE.DirectionalLight(0xffffff, 1.0); sun.position.set(1, 5, 2); scene.add(sun);
  // the drop's surface overhead: a bright curved skin
  const skin = addM(scene, new THREE.SphereGeometry(300, 64, 32), new THREE.MeshBasicMaterial({ color: 0xe8fff8, side: THREE.BackSide, transparent: true, opacity: 0.35, fog: false }), 0, -180, -60);
  const skinRim = addM(scene, new THREE.TorusGeometry(260, 6, 8, 96).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, fog: false }), 0, 0, -60);
  // the moss leaf below: big cells, like a floor of green tiles
  { const cells = g3Tex((x, w, h) => { const R = RNG('leafcells'), pts = []; for (let i = 0; i < 26; i++) pts.push([R.r(0, w), R.r(0, h)]); const img = x.createImageData(w, h);
      for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) { let d1 = 1e9, d2 = 1e9, k1 = 0; for (let k = 0; k < pts.length; k++) for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { const dx = px - pts[k][0] - ox, dy = py - pts[k][1] - oy, d = dx * dx + dy * dy; if (d < d1) { d2 = d1; d1 = d; k1 = k; } else if (d < d2) d2 = d; }
        const e = Math.sqrt(d2) - Math.sqrt(d1), wall = e < 2.2 ? 1 : 0, inner = Math.min(1, Math.sqrt(d1) / 40), v = hsh(k1, 3) * 0.08, o = (py * w + px) * 4;
        img.data[o] = wall ? 200 : (70 + 40 * inner + 60 * v) | 0; img.data[o + 1] = wall ? 240 : (150 + 30 * inner + 40 * v) | 0; img.data[o + 2] = wall ? 220 : (110 + 20 * inner) | 0; img.data[o + 3] = 255; } x.putImageData(img, 0, 0);
      x.fillStyle = 'rgba(40,120,60,0.55)'; for (let k = 0; k < 160; k++) { const [cx, cy] = pts[k % pts.length]; x.beginPath(); x.ellipse(cx + R.n(14), cy + R.n(14), R.r(3, 6), R.r(2, 4), R.r(0, 3), 0, TAU); x.fill(); } }, 256, 256);
    cells.wrapS = cells.wrapT = THREE.RepeatWrapping; cells.repeat.set(10, 10); const fl = addM(scene, new THREE.PlaneGeometry(1600, 1600).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: cells, roughness: 0.6, transparent: true, opacity: 0.9 }), 0, -60, -200); }
  // diatoms (glassy boats with ribs), paramecia (cilia), rotifers (wheel crowns), specks
  const ribs = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2, r = w * 0.48; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(250,220,150,0.5)'); g.addColorStop(0.8, 'rgba(220,170,80,0.7)'); g.addColorStop(1, 'rgba(160,110,40,0.95)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(120,80,20,0.55)'; x.lineWidth = 1.2; for (let k = 0; k < 72; k++) { const a2 = k / 72 * TAU; x.beginPath(); x.moveTo(cx + Math.cos(a2) * r * 0.22, cy + Math.sin(a2) * r * 0.22); x.lineTo(cx + Math.cos(a2) * r * 0.97, cy + Math.sin(a2) * r * 0.97); x.stroke(); }
    for (const f of [0.22, 0.5, 0.75, 0.97]) { x.lineWidth = 2; x.strokeStyle = 'rgba(255,240,200,0.7)'; x.beginPath(); x.arc(cx, cy, r * f, 0, TAU); x.stroke(); } x.fillStyle = 'rgba(120,80,20,0.4)'; for (let k = 0; k < 140; k++) { const a2 = k * 2.39996, rr = Math.sqrt(k / 140) * r * 0.2; x.beginPath(); x.arc(cx + Math.cos(a2) * rr, cy + Math.sin(a2) * rr, 1.6, 0, TAU); x.fill(); } }, 256, 256);
  const striae = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(160,120,50,0.9)'); g.addColorStop(0.5, 'rgba(240,210,140,0.6)'); g.addColorStop(1, 'rgba(160,120,50,0.9)'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(110,70,20,0.6)'; for (let k = 0; k < 60; k++) x.fillRect(k * w / 60, 0, 1.5, h); x.fillStyle = 'rgba(255,245,215,0.8)'; x.fillRect(0, h * 0.47, w, h * 0.06); }, 256, 64);
  const DIA = []; { const R = RNG('diatoms'); for (let i = 0; i < 70; i++) DIA.push({ x: R.r(-160, 160), y: R.r(-50, 90), z: R.r(-500, -20), s: R.r(2, 9), ry: R.r(0, 6), rz: R.r(0, 6), v: R.r(-0.6, 0.6), kind: R.f() < 0.6 ? 0 : 1 }); }
  const diaG = [new THREE.CapsuleGeometry(0.5, 4, 6, 18).rotateZ(Math.PI / 2).scale(1, 1, 0.45), new THREE.CylinderGeometry(2, 2, 0.5, 48).rotateX(Math.PI / 2)];
  const diaMat = [new THREE.MeshStandardMaterial({ map: striae, color: 0xffffff, roughness: 0.25, transparent: true, opacity: 0.85, emissive: 0x6a4a10, emissiveIntensity: 0.25, depthWrite: false }), [new THREE.MeshStandardMaterial({ color: 0xc89a40, roughness: 0.3, transparent: true, opacity: 0.6, depthWrite: false }), new THREE.MeshStandardMaterial({ map: ribs, transparent: true, roughness: 0.2, emissive: 0x6a4a10, emissiveIntensity: 0.3, depthWrite: false, side: THREE.DoubleSide }), new THREE.MeshStandardMaterial({ map: ribs, transparent: true, roughness: 0.2, emissive: 0x6a4a10, emissiveIntensity: 0.3, depthWrite: false, side: THREE.DoubleSide })]];
  const diatoms = diaG.map((g, k) => { const list = DIA.filter((d) => d.kind === k); list.forEach((d, i) => (d.slot = i)); const m = IM(g, diaMat[k], list.length, false); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m; });
  // heliozoans: little suns with needle rays
  const helioG = mergeG([[new THREE.SphereGeometry(1, 20, 14), M4c(0, 0, 0), '#e8f0d8', 1], ...Array.from({ length: 80 }, (_, k) => { const v = new THREE.Vector3(Math.cos(k * 2.39996) * Math.sqrt(1 - ((k + 0.5) / 80 * 2 - 1) ** 2), (k + 0.5) / 80 * 2 - 1, Math.sin(k * 2.39996) * Math.sqrt(1 - ((k + 0.5) / 80 * 2 - 1) ** 2)); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); return [new THREE.CylinderGeometry(0.012, 0.03, 3.2, 3).translate(0, 1.6 + 0.9, 0), new THREE.Matrix4().makeRotationFromQuaternion(q), '#f4fff0', 0]; })]);
  const HEL = []; { const R = RNG('helio'); for (let i = 0; i < 8; i++) HEL.push([R.r(-140, 140), R.r(-30, 80), R.r(-420, -60), R.r(5, 9)]); }
  const helios = IM(helioG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, transparent: true, opacity: 0.8 }), HEL.length, false); HEL.forEach(([x, y, z, sc], i) => helios.setMatrixAt(i, M4c(x, y, z, i, sc, sc, sc))); scene.add(helios);
  const PARA = []; { const R = RNG('paramecia'); for (let i = 0; i < 9; i++) PARA.push({ x: R.r(-150, 150), y: R.r(-30, 70), z: R.r(-450, -80), ry: R.r(0, 6), v: R.r(4, 9), s: R.r(10, 18) }); }
  const paraG = mergeG([[new THREE.CapsuleGeometry(1, 3.2, 8, 16).rotateX(Math.PI / 2).scale(0.9, 0.7, 1), M4c(0, 0, 0), '#c8e8d0', 1], [new THREE.SphereGeometry(0.5, 10, 8), M4c(0.2, 0, 0.4), '#8ab89a', 1], [new THREE.SphereGeometry(0.35, 8, 6), M4c(-0.3, 0.1, -0.8), '#e8f0c0', 1]]);
  const paras = IM(paraG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, transparent: true, opacity: 0.75 }), PARA.length, false); paras.instanceMatrix.setUsage(THREE.DynamicDrawUsage); paras.frustumCulled = false; scene.add(paras);
  const specks = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 5000 }, (_, i) => [(hsh(i) - 0.5) * 500, (hsh(i, 2) - 0.4) * 220, -hsh(i, 3) * 600]).flat(), 3)), new THREE.PointsMaterial({ size: 0.6, color: 0xf0fff0, transparent: true, opacity: 0.7 })); scene.add(specks);
  // the tardigrade: a plump segmented body, four pairs of stubby legs with claws, a snout, eye spots
  const tardi = new THREE.Group(); scene.add(tardi);
  { const tTex = g3Tex((x, w, h) => { const R = RNG('tardiskin'); x.fillStyle = '#d6ae80'; x.fillRect(0, 0, w, h); for (let k = 0; k < 26000; k++) { x.fillStyle = R.f() < 0.5 ? `rgba(255,240,210,${R.r(0.2, 0.6)})` : `rgba(140,96,56,${R.r(0.15, 0.45)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(0.8, 2.2), R.r(0.8, 2.2)); }
      x.strokeStyle = 'rgba(120,80,44,0.55)'; x.lineWidth = 2.2; for (let k = 1; k < 14; k++) { x.beginPath(); for (let px = 0; px <= w; px += 4) { const py = k * h / 14 + 4 * Math.sin(px * 0.05 + k * 1.3) + 2 * Math.sin(px * 0.13 + k); px ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); } }, 1024, 512);
    const skinM = new THREE.MeshStandardMaterial({ map: tTex, color: 0xffffff, roughness: 0.8 }); const bumpy = (g, amp) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + amp * (Math.sin(v.x * 9) * Math.sin(v.y * 7 + v.z * 5) * 0.6 + Math.sin(v.z * 17 + v.x * 3) * 0.4); p.setXYZ(i, v.x * k, v.y * k, v.z * k); } g.computeVertexNormals(); return g; };
    const segs = []; for (let k = 0; k < 5; k++) { const z = 1.6 - k * 0.85, rr = [0.75, 0.95, 1.0, 0.95, 0.8][k]; const m = addM(tardi, bumpy(new THREE.SphereGeometry(1, 28, 20).scale(rr * 1.05, rr * 0.92, 0.75), 0.04), skinM, 0, 0, z); segs.push(m); }
    const head = addM(tardi, bumpy(new THREE.SphereGeometry(1, 24, 18).scale(0.7, 0.62, 0.7), 0.03), skinM, 0, 0.05, 2.3); const snout = addM(tardi, new THREE.CylinderGeometry(0.16, 0.28, 0.5, 14).rotateX(Math.PI / 2), skinM, 0, -0.05, 2.95);
    addM(tardi, new THREE.TorusGeometry(0.17, 0.07, 12, 24), skinM, 0, -0.08, 3.2);
    for (const s of [-1, 1]) addM(tardi, new THREE.SphereGeometry(0.12, 14, 10), new THREE.MeshStandardMaterial({ color: 0x0a0606, roughness: 0.15 }), s * 0.34, 0.3, 2.86);
    const legs = []; for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { const lg = new THREE.Group(); lg.position.set(s * 0.75, -0.55, 1.5 - k * 1.0); tardi.add(lg); addM(lg, bumpy(new THREE.CylinderGeometry(0.26, 0.32, 0.8, 12).translate(0, -0.4, 0), 0.05), skinM, 0, 0, 0);
      for (let c = 0; c < 4; c++) { const cl = addM(lg, new THREE.ConeGeometry(0.035, 0.32, 5).translate(0, -0.16, 0), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }), (c - 1.5) * 0.08, -0.82, 0.05); cl.rotation.x = 0.5; } lg.rotation.z = s * 0.25; legs.push({ lg, k, s }); }
    tardi.userData = { legs, segs }; tardi.scale.setScalar(6); }
  WD = { scene, cam, DIA, diatoms, PARA, paras, specks, tardi, skin }; return WD;
}

// ---------- C: inside a cell (units: 0.1 µm) ----------
const away = (x, y, r) => { const d = Math.hypot(x, y); return d >= r ? { x, y } : { x: x / (d || 1) * r * (1 + 0.3 * hsh(x)), y: y / (d || 1) * r * (1 + 0.3 * hsh(y)) }; };
function cell3() {
  if (WC) return WC;
  const scene = new THREE.Scene(); scene.background = lin('#c88aa0'); scene.fog = new THREE.FogExp2(0xc890a6, 0.012);
  const cam = new THREE.PerspectiveCamera(60, W / H, 0.05, 2000); scene.add(cam);
  scene.add(new THREE.HemisphereLight(0xfff0f4, 0x6a3a50, 1.2)); const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(2, 4, 3); scene.add(sun);
  const cristae = g3Tex((x, w, h) => { x.fillStyle = '#c8603a'; x.fillRect(0, 0, w, h); for (let k = 0; k < 22; k++) { x.strokeStyle = k % 2 ? 'rgba(255,200,150,0.85)' : 'rgba(120,40,20,0.6)'; x.lineWidth = k % 2 ? 3 : 2; x.beginPath(); for (let py = 0; py <= h; py += 2) { const px = k * w / 22 + 5 * Math.sin(py * 0.12 + k) + 3 * Math.sin(py * 0.31); py ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); } speck(x, w, h, 1500, ['rgba(255,220,180,0.2)', 'rgba(80,20,10,0.2)'], RNG('cr'), 1, 2); }, 256, 128);
  const MITO = []; { const R = RNG('mito'); for (let i = 0; i < 46; i++) MITO.push({ ...away(R.r(-60, 60), R.r(-40, 40), 16), z: R.r(-260, 20), ry: R.r(0, 6), rx: R.r(0, 6), s: R.r(3, 6) }); }
  const mitos = IM(new THREE.CapsuleGeometry(1, 2.6, 8, 16).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ map: cristae, roughness: 0.45 }), MITO.length, false); MITO.forEach((m, i) => mitos.setMatrixAt(i, M4c(m.x, m.y, m.z, m.ry, m.s, m.s, m.s, m.rx, 0))); mitos.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(mitos);
  const VES = []; { const R = RNG('ves'); for (let i = 0; i < 80; i++) { const q = away(R.r(-70, 70), R.r(-45, 45), 10); VES.push([q.x, q.y, R.r(-280, 20), R.r(1.5, 5)]); } }
  const ves = IM(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf4e0a0, roughness: 0.2, transparent: true, opacity: 0.6, emissive: 0x6a5a20, emissiveIntensity: 0.2 }), VES.length, false); VES.forEach(([x, y, z, r], i) => ves.setMatrixAt(i, M4c(x, y, z, 0, r, r, r))); scene.add(ves);
  const RING = []; { const R = RNG('rings'); for (let i = 0; i < 70; i++) RING.push([...Object.values(away(R.r(-70, 70), R.r(-45, 45), 9)), R.r(-330, 20), R.r(2, 4), R.r(0, 6), R.r(0, 6)]); }
  const rings = IM(new THREE.TorusGeometry(1, 0.38, 16, 32), new THREE.MeshStandardMaterial({ color: 0xe8d0f0, roughness: 0.35 }), RING.length, false); RING.forEach(([x, y, z, r, a, b], i) => rings.setMatrixAt(i, M4c(x, y, z, a, r, r, r, b, 0))); scene.add(rings);
  { const R = RNG('tubules'); for (let i = 0; i < 8; i++) { const q = away(R.r(-50, 50), R.r(-30, 30), 30); const m = addM(scene, new THREE.CylinderGeometry(0.5, 0.5, 260, 10), new THREE.MeshStandardMaterial({ color: 0xd8c8d8, roughness: 0.4 }), q.x, q.y, R.r(-300, -40)); m.rotation.set(R.r(-0.4, 0.4), 0, R.r(0, 3)); } }
  const ribo = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 9000 }, (_, i) => [(hsh(i) - 0.5) * 160, (hsh(i, 2) - 0.5) * 110, 30 - hsh(i, 3) * 320]).flat(), 3)), new THREE.PointsMaterial({ size: 0.5, color: 0x8a3a5a, map: glowTex(), transparent: true, depthWrite: false })); scene.add(ribo);
  const FIL = []; { const R = RNG('fil'); for (let i = 0; i < 40; i++) { const a = new THREE.Vector3(R.r(-80, 80), R.r(-50, 50), R.r(-300, 20)), b = a.clone().add(new THREE.Vector3(R.n(80), R.n(50), R.n(80))); FIL.push(a.x, a.y, a.z, b.x, b.y, b.z); } }
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(FIL, 3)), new THREE.LineBasicMaterial({ color: 0xf8d8e8, transparent: true, opacity: 0.5 })));
  // the endoplasmic reticulum: folded sheets
  { const R = RNG('er'); for (let i = 0; i < 6; i++) { const g = new THREE.PlaneGeometry(60, 30, 40, 10), p = g.attributes.position; for (let k = 0; k < p.count; k++) p.setZ(k, 4 * Math.sin(p.getX(k) * 0.2 + i) * Math.cos(p.getY(k) * 0.15)); g.computeVertexNormals(); const m = addM(scene, g, new THREE.MeshStandardMaterial({ color: 0xb85a8a, roughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }), (R.f() < 0.5 ? -1 : 1) * R.r(45, 70), R.r(-30, 30), R.r(-220, -60)); m.rotation.set(R.r(0, 3), R.r(0, 3), 0); } }
  // the nucleus: a great sphere with pores; inside, chromatin
  const nuc = addM(scene, new THREE.SphereGeometry(70, 64, 48), new THREE.MeshStandardMaterial({ color: 0x8a4a9a, roughness: 0.6, side: THREE.FrontSide }), 0, 0, -420);
  { const pores = []; const R = RNG('pores'); for (let i = 0; i < 260; i++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize().multiplyScalar(70.4); pores.push(v.x, v.y, v.z - 420); } scene.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pores, 3)), new THREE.PointsMaterial({ size: 2.2, color: 0xe8c8f0, map: glowTex(), transparent: true, depthWrite: false }))); }
  const chrom = new THREE.Group(); chrom.position.set(0, 0, -420); scene.add(chrom); { const R = RNG('chrom'), m = new THREE.MeshStandardMaterial({ color: 0x9a80a8, roughness: 0.6 }); for (let i = 0; i < 40; i++) { const pts = []; let p = new THREE.Vector3(R.n(26), R.n(26), R.n(26) - 10); for (let k = 0; k < 12; k++) { pts.push(p.clone()); p.add(new THREE.Vector3(R.n(9), R.n(9), R.n(9))); } chrom.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, R.r(0.8, 1.6), 8), m)); } }
  WC = { scene, cam, mitos, MITO, nuc, chrom }; return WC;
}

// ---------- N: the DNA double helix (units: 1 nm), grey ----------
function dna3() {
  if (WN) return WN;
  const scene = new THREE.Scene(); scene.background = lin('#3a3a3c'); scene.fog = new THREE.FogExp2(0x3a3a3c, 0.012);
  const cam = new THREE.PerspectiveCamera(60, W / H, 0.05, 2000); scene.add(cam);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2a2a, 1.2)); const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(3, 5, 4); scene.add(sun);
  const mat = new THREE.MeshStandardMaterial({ color: 0xececec, roughness: 0.45 }), rungM = new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.6, side: THREE.DoubleSide });
  const helix = (z0, z1, rad, ph, seg) => new THREE.CatmullRomCurve3(Array.from({ length: seg }, (_, i) => { const u = i / (seg - 1), z = lerp(z0, z1, u), a = (z0 - z) / 3.4 * TAU + ph; return new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, z); }));
  const mkDNA = (grp, z0, z1, sc) => { for (const ph of [0, 2.4]) { const c = helix(z0, z1, 1.0, ph, Math.round((z0 - z1) * 6)); grp.add(new THREE.Mesh(new THREE.TubeGeometry(c, Math.round((z0 - z1) * 10), 0.24, 14), mat));
      const nb = Math.round((z0 - z1) / 0.34); const beads = IM(new THREE.SphereGeometry(0.3, 14, 10), mat, nb, false); for (let i = 0; i < nb; i++) beads.setMatrixAt(i, M4c(...c.getPointAt(i / nb).toArray())); grp.add(beads); }
    const nr = Math.round((z0 - z1) / 0.34), rungs = IM(new THREE.BoxGeometry(1.7, 0.06, 0.22), rungM, nr, false); for (let i = 0; i < nr; i++) { const z = z0 - i * 0.34, a = (z0 - z) / 3.4 * TAU + 1.2; rungs.setMatrixAt(i, M4c(0, 0, z, 0, 1, 1, 1, 0, a)); } grp.add(rungs); grp.scale.setScalar(sc); };
  const main = new THREE.Group(); scene.add(main); mkDNA(main, 60, -200, 1);
  for (let k = 0; k < 7; k++) { const g = new THREE.Group(); g.position.set((hsh(k) - 0.5) * 60, (hsh(k, 2) - 0.5) * 50, -40 - hsh(k, 3) * 140); g.rotation.set(hsh(k, 4) * 3, hsh(k, 5) * 3, 0); scene.add(g); mkDNA(g, 30, -30, 0.5); }
  const backs = new THREE.Group(); scene.add(backs); { const R = RNG('dnaback'), m = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.5 }); for (let i = 0; i < 14; i++) { const pts = []; let p = new THREE.Vector3(R.r(-40, 40), R.r(-30, 30), R.r(-300, 20)); for (let k = 0; k < 10; k++) { pts.push(p.clone()); p.add(new THREE.Vector3(R.n(14), R.n(14), R.n(14))); } backs.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 1.1, 8), m)); } }
  WN = { scene, cam }; return WN;
}

// ---------- A: the atom's electron cloud with a speck of a nucleus; P: the nucleus ----------
function atom3() {
  if (WA) return WA;
  const scene = new THREE.Scene(); scene.background = lin('#0c0c0e');
  const cam = new THREE.PerspectiveCamera(60, W / H, 0.01, 4000); scene.add(cam);
  const gt = glowTex(); const PTS = [], R = RNG('cloud');
  for (let i = 0; i < 220000; i++) { const shell = R.f(); let r = shell < 0.55 ? Math.abs(R.n(9)) + Math.abs(R.n(4)) : 30 + R.n(10); const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(); if (shell > 0.35 && shell < 0.7) v.set(v.x, v.y * 1.8, v.z).normalize(); PTS.push(v.x * r, v.y * r, v.z * r); }
  const cloud = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(PTS, 3)), new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: 0xe8e8ee, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(cloud);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); core.scale.setScalar(2.4); scene.add(core);
  WA = { scene, cam, cloud, core }; return WA;
}
function nuc3() {
  if (WP) return WP;
  const scene = new THREE.Scene(); scene.background = lin('#101012');
  const cam = new THREE.PerspectiveCamera(55, W / H, 0.01, 400); scene.add(cam);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 0.9)); const sun = new THREE.DirectionalLight(0xffffff, 2.0); sun.position.set(4, 6, 5); scene.add(sun); const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(-5, -2, -4); scene.add(rim);
  const R = RNG('nucleons'), NUC = []; for (let i = 0; i < 27; i++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize().multiplyScalar(Math.cbrt(R.f()) * 2.0); NUC.push({ p: v, proton: i < 13, ph: R.r(0, 6) }); }
  const mottle = (seed, base) => { const t = g3Tex((x, w, h) => { const R2 = RNG('mottle', seed); x.fillStyle = base; x.fillRect(0, 0, w, h); for (let k = 0; k < 900; k++) { const px = R2.r(0, w), py = R2.r(0, h), r = R2.r(2, 26), g = x.createRadialGradient(px, py, 0, px, py, r), l = R2.f() < 0.5; g.addColorStop(0, l ? 'rgba(255,255,255,0.22)' : 'rgba(40,40,46,0.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); } }, 512, 256); return t; };
  const mk = (proton) => new THREE.MeshStandardMaterial({ map: mottle(proton ? 1 : 2, proton ? '#d8d0cc' : '#a8b0bc'), roughness: 0.7, metalness: 0.05 });
  const MP = mk(true), MN = mk(false); const balls = NUC.map((nu, i) => { const m = addM(scene, new THREE.SphereGeometry(1.0, 48, 32), nu.proton ? MP : MN, nu.p.x, nu.p.y, nu.p.z); m.rotation.set(i, i * 2, 0); return m; });
  WP = { scene, cam, NUC, balls }; return WP;
}

// ---------- Q: the quarks inside a proton ----------
function quark3() {
  if (WQ) return WQ;
  const scene = new THREE.Scene(); scene.background = lin('#060608');
  const cam = new THREE.PerspectiveCamera(58, W / H, 0.01, 1000); scene.add(cam);
  const gt = glowTex(), cols = ['#ff4a3a', '#3aff7a', '#4a7aff'];
  const quarks = cols.map((c) => { const g = new THREE.Group(); scene.add(g); const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), new THREE.MeshBasicMaterial({ color: lin(c).lerp(lin('#ffffff'), 0.6) })); g.add(core);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: lin(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(2.6); g.add(halo);
    const halo2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: lin(c), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); halo2.scale.setScalar(8); g.add(halo2); return { g, halo, halo2 }; });
  const SEG = 50, gl = [0, 1, 2].map(() => { const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array((SEG + 1) * 3), 3)); const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xf0ecff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })); scene.add(line);
    const NS = 260, sp = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 3), 3)), new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, map: gt, color: 0xf4f0ff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(sp);
    const beads = Array.from({ length: 10 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: 0xe8e0ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 })); s.scale.setScalar(0.5); scene.add(s); return s; }); return { line, sp, NS, beads }; });
  const VP = Array.from({ length: 900 }, (_, i) => [(hsh(i) - 0.5) * 16, (hsh(i, 2) - 0.5) * 16, (hsh(i, 3) - 0.5) * 16]).flat();
  const vgeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(VP, 3)).setAttribute('color', new THREE.Float32BufferAttribute(new Array(VP.length).fill(0), 3));
  const virt = new THREE.Points(vgeo, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, map: gt, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(virt);
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 1400 }, (_, i) => { const v = new THREE.Vector3(hsh(i, 4) - 0.5, hsh(i, 5) - 0.5, hsh(i, 6) - 0.5).normalize().multiplyScalar(14 + hsh(i, 7) * 60); return [v.x, v.y, v.z]; }).flat(), 3)), new THREE.PointsMaterial({ size: 0.35, map: gt, color: 0xd8d8e8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 })); scene.add(stars);
  WQ = { scene, cam, quarks, gl, SEG, virt, stars }; return WQ;
}
