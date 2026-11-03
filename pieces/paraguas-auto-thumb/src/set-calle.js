// =====================================================================
//  SET CALLE — a colonial street in the rain, and the umbrella that becomes a car.
//  The street runs along +X. Near facades at z = 0 (houses z < 0, facing +Z), sidewalk z 0..2.2 (top y = caY(x)),
//  cobbles z 2.2..9.8 (0.14 lower), far sidewalk z 9.8..12, far facades at z = 12 facing −Z.
//  From x 16 to 28 the street climbs 1.6 m (the "cuesta arriba" beat); houses step up with it.
//  Overcast light, wet stones (low roughness + sky reflections), slanted rain, splashes and puddle ripples.
//  Uses lib-street.js helpers (stRBox, stMerge, stBatch, stTube, stFoliage, stSkyMat ...) through a CA-owned ST object.
// =====================================================================
let CA = null;
const CA_UP0 = 16, CA_UP1 = 28, CA_RISE = 1.6;
const caY = (x) => CA_RISE * ss(CA_UP0, CA_UP1, x);
const caSlope = (x) => { const e = 0.05; return (caY(x + e) - caY(x - e)) / (2 * e); };

// ---------- textures
function caTexStucco() { return g3Tex((x, w, h) => { const R = RNG('ca-stucco'); x.fillStyle = '#c8c8c8'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 40; k++) { const g = x.createRadialGradient(R.r(0, w), R.r(0, h), 0, R.r(0, w), R.r(0, h), R.r(30, 140)); const v = R.f() < 0.5 ? '0,0,0' : '255,255,255'; g.addColorStop(0, `rgba(${v},${R.r(0.04, 0.1)})`); g.addColorStop(1, `rgba(${v},0)`); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  for (let k = 0; k < 14000; k++) { const v = R.r(120, 255); x.fillStyle = `rgba(${v},${v},${v},${R.r(0.08, 0.3)})`; const s = R.r(0.6, 1.8); x.fillRect(R.r(0, w), R.r(0, h), s, s); }
  for (let k = 0; k < 12; k++) { x.strokeStyle = `rgba(40,40,40,${R.r(0.1, 0.3)})`; x.lineWidth = R.r(0.6, 1.4); x.beginPath(); let px = R.r(0, w), py = R.r(0, h); x.moveTo(px, py); for (let s = 0; s < 8; s++) { px += R.n(10); py += R.r(3, 12); x.lineTo(px, py); } x.stroke(); }
}, 512, 512); }
// rain streaks down a wall + darker wet base (applied as a second, multiplied layer through the colour map's alpha-less gradient)
function caTexDamp() { return g3Tex((x, w, h) => { const R = RNG('ca-damp'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 90; k++) { const px = R.r(0, w), l = R.r(h * 0.1, h * 0.5), y0 = R.r(0, h * 0.3); const g = x.createLinearGradient(0, y0, 0, y0 + l); g.addColorStop(0, `rgba(90,90,90,${R.r(0.1, 0.3)})`); g.addColorStop(1, 'rgba(90,90,90,0)'); x.fillStyle = g; x.fillRect(px, y0, R.r(1, 5), l); }
  const g = x.createLinearGradient(0, h, 0, h * 0.72); g.addColorStop(0, 'rgba(70,70,70,0.6)'); g.addColorStop(0.6, 'rgba(110,110,110,0.25)'); g.addColorStop(1, 'rgba(120,120,120,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
}, 256, 512); }
function caTexCobble() { return g3Tex((x, w, h) => { const R = RNG('ca-cobble'); x.fillStyle = '#3a3936'; x.fillRect(0, 0, w, h);
  const rows = 16, rh = h / rows;
  for (let i = 0; i < rows; i++) { let px = (i % 2) * R.r(4, 14); while (px < w + 20) { const sw = R.r(26, 44), v = R.r(95, 165), tint = R.r(-12, 12);
      const cx = px + sw / 2, cy = i * rh + rh / 2, g = x.createRadialGradient(cx - sw * 0.15, cy - rh * 0.2, 1, cx, cy, sw * 0.62);
      g.addColorStop(0, `rgb(${v + 30 + tint},${v + 28},${v + 24 - tint})`); g.addColorStop(0.7, `rgb(${v + tint},${v - 2},${v - 6 - tint})`); g.addColorStop(1, `rgb(${v * 0.6},${v * 0.58},${v * 0.55})`);
      x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, sw / 2 - 2, rh / 2 - 2, R.n(0.08), 0, TAU); x.fill();
      for (let k = 0; k < 6; k++) { x.fillStyle = `rgba(0,0,0,${R.r(0.05, 0.15)})`; x.fillRect(cx + R.n(sw * 0.3), cy + R.n(rh * 0.3), 2, 2); }
      px += sw; } }
  // wrap the edge stones
  x.drawImage(x.canvas, -w, 0); }, 512, 512); }
function caTexSlab() { return g3Tex((x, w, h) => { const R = RNG('ca-slab'); x.fillStyle = '#5a5650'; x.fillRect(0, 0, w, h);
  const n = 4, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = R.r(150, 190); x.fillStyle = `rgb(${v},${v - 6},${v - 14})`; x.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
    for (let k = 0; k < 400; k++) { const q = R.r(80, 230); x.fillStyle = `rgba(${q},${q},${q},0.25)`; x.fillRect(i * s + R.r(2, s - 4), j * s + R.r(2, s - 4), 1.5, 1.5); }
    const g = x.createRadialGradient(i * s + R.r(0, s), j * s + R.r(0, s), 0, i * s + s / 2, j * s + s / 2, s * 0.8); g.addColorStop(0, `rgba(0,0,0,${R.r(0, 0.12)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(i * s, j * s, s, s); }
}, 512, 512); }
// roughness for wet stone: stones glossy, joints rough (white = rough)
function caTexWetRough(src) { return g3Tex((x, w, h) => { x.drawImage(src.image, 0, 0, w, h); const d = x.getImageData(0, 0, w, h), D = d.data; for (let i = 0; i < D.length; i += 4) { const l = (D[i] + D[i + 1] + D[i + 2]) / 3, r = l < 80 ? 200 : 40 + (255 - l) * 0.25; D[i] = D[i + 1] = D[i + 2] = r; } x.putImageData(d, 0, 0); }, 512, 512, false); }
function caTexTile() { return g3Tex((x, w, h) => { const R = RNG('ca-tile'); x.fillStyle = '#6a2c1a'; x.fillRect(0, 0, w, h); const cols = 8, cw = w / cols, rows = 4, rh = h / rows;
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const v = R.r(0.8, 1.1), g = x.createLinearGradient(j * cw, 0, (j + 1) * cw, 0); g.addColorStop(0, `rgb(${110 * v},${45 * v},${28 * v})`); g.addColorStop(0.5, `rgb(${200 * v},${95 * v},${58 * v})`); g.addColorStop(1, `rgb(${120 * v},${50 * v},${30 * v})`); x.fillStyle = g; x.fillRect(j * cw + 1, i * rh, cw - 2, rh - 3);
    x.fillStyle = 'rgba(30,10,5,0.5)'; x.fillRect(j * cw, (i + 1) * rh - 4, cw, 4); for (let k = 0; k < 30; k++) { x.fillStyle = `rgba(60,70,40,${R.r(0, 0.25)})`; x.fillRect(j * cw + R.r(0, cw), i * rh + R.r(0, rh), 2, 2); } }
}, 256, 256); }
function caTexWood() { return g3Tex((x, w, h) => { const R = RNG('ca-wood'); x.fillStyle = '#a0a0a0'; x.fillRect(0, 0, w, h); const n = 5, pw = w / n;
  for (let i = 0; i < n; i++) { const v = R.r(150, 210); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i * pw + 1, 0, pw - 2, h); for (let k = 0; k < 30; k++) { x.strokeStyle = `rgba(40,40,40,${R.r(0.08, 0.25)})`; x.lineWidth = R.r(0.5, 1.5); const px = i * pw + R.r(2, pw - 2); x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + R.n(4), h * 0.3, px + R.n(4), h * 0.7, px + R.n(3), h); x.stroke(); } x.fillStyle = 'rgba(20,20,20,0.6)'; x.fillRect(i * pw, 0, 1.5, h); }
  [0.12, 0.5, 0.88].forEach((y) => { x.fillStyle = 'rgba(30,30,30,0.35)'; x.fillRect(0, h * y - 3, w, 6); }); }, 256, 512); }
function caTexFabric() { return g3Tex((x, w, h) => { const R = RNG('ca-fab'); x.fillStyle = '#c0c0c0'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(255,255,255,${R.r(0.03, 0.09)})`; x.fillRect(i, 0, 1, h); } for (let j = 0; j < h; j += 2) { x.fillStyle = `rgba(0,0,0,${R.r(0.03, 0.08)})`; x.fillRect(0, j, w, 1); }
  for (let k = 0; k < 60; k++) { const g = x.createRadialGradient(R.r(0, w), R.r(0, h), 0, R.r(0, w), R.r(0, h), R.r(6, 22)); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } }, 256, 256); }
function caTexTarp() { return g3Tex((x, w, h) => { const R = RNG('ca-tarp'); x.fillStyle = '#b8b8b8'; x.fillRect(0, 0, w, h); for (let k = 0; k < 70; k++) { const px = R.r(0, w), g = x.createLinearGradient(px - 18, 0, px + 18, 0), v = R.f() < 0.5 ? '255,255,255' : '0,0,0'; g.addColorStop(0, `rgba(${v},0)`); g.addColorStop(0.5, `rgba(${v},${R.r(0.04, 0.12)})`); g.addColorStop(1, `rgba(${v},0)`); x.fillStyle = g; x.fillRect(px - 18, 0, 36, h); }
  for (let k = 0; k < 3; k++) { x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, h * (0.06 + k * 0.44), w, 2); x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(0, h * (0.06 + k * 0.44) + 2, w, 1); } }, 512, 256); }
function caTexBrick() { return g3Tex((x, w, h) => { const R = RNG('ca-brick'); x.fillStyle = '#d4d0c8'; x.fillRect(0, 0, w, h); const rows = 16, bh = h / rows, bw = w / 4;
  for (let i = 0; i < rows; i++) for (let j = -1; j < 5; j++) { const x0 = j * bw + (i % 2) * bw / 2, v = R.r(150, 215); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(x0 + 2, i * bh + 2, bw - 4, bh - 3); for (let k = 0; k < 24; k++) { const q = R.r(0, 1) < 0.5 ? 0 : 255; x.fillStyle = `rgba(${q},${q},${q},${R.r(0.04, 0.12)})`; x.fillRect(x0 + R.r(2, bw - 4), i * bh + R.r(2, bh - 4), 2, 2); } } }, 256, 256); }
function caTexDrop() { return g3Tex((x, w) => { const c = w / 2, g = x.createRadialGradient(c - w * 0.12, c - w * 0.14, 0, c, c, c); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.25, 'rgba(220,235,245,0.55)'); g.addColorStop(0.75, 'rgba(120,140,160,0.35)'); g.addColorStop(0.92, 'rgba(30,40,50,0.55)'); g.addColorStop(1, 'rgba(30,40,50,0)'); x.fillStyle = g; x.beginPath(); x.arc(c, c, c, 0, TAU); x.fill(); }, 64, 64); }
function caTexRing() { return g3Tex((x, w) => { const c = w / 2; x.strokeStyle = 'rgba(255,255,255,1)'; x.lineWidth = w * 0.05; x.beginPath(); x.arc(c, c, c * 0.8, 0, TAU); x.stroke(); x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = w * 0.04; x.beginPath(); x.arc(c, c, c * 0.55, 0, TAU); x.stroke(); }, 64, 64, false); }

// ---------- materials, sky, light
function caBuild(g) {
  ST = CA = { scene: new THREE.Scene(), trees: [], treeG: [], mat: {}, grp: {}, lamps: [] };
  const S = CA.scene, M = CA.mat, SM = (o) => new THREE.MeshStandardMaterial(o), rep = (t, sx, sy = sx) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(sx, sy); t.anisotropy = Math.min(8, g.ani); return t; };
  const es = new THREE.Scene(), skyE = stSkyMat(0.6); skyE.uniforms.storm.value = 0.5; es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), skyE));
  const pm = new THREE.PMREMGenerator(g.r); CA.env = pm.fromScene(es, 0.02).texture;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), stSkyMat()); sky.renderOrder = -10; sky.frustumCulled = false; S.add(sky); CA.sky = sky;
  const u = sky.material.uniforms; u.storm.value = 0.62; u.sun.value.set(0.5, 0.35, -0.8).normalize();
  S.fog = new THREE.FogExp2(lin('#9aa6ae'), 0.016);
  const key = new THREE.DirectionalLight(lin('#e9eef4'), 1.25); key.castShadow = true; key.target.position.set(10, 0, 4); key.position.set(10 + 30, 60, 4 + 34);
  key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 9; key.shadow.blurSamples = 16; key.shadow.bias = -0.0006;
  Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 20, far: 160 });
  const hemi = new THREE.HemisphereLight(lin('#c9d3de'), lin('#5d5a52'), 1.35);
  S.add(key, key.target, hemi); CA.key = key; CA.hemi = hemi;
  const T = { stucco: rep(caTexStucco(), 1 / 3), damp: caTexDamp(), cob: rep(caTexCobble(), 1 / 1.1), slab: rep(caTexSlab(), 1 / 2.4), tile: rep(caTexTile(), 1 / 1.6, 1 / 1.1), wood: caTexWood(), fab: rep(caTexFabric(), 1), leaf: stTexLeaf(), leafT: rep(stTexLeafTile(), 1), bark: rep(stTexBark(), 2, 0.6), win: stTexWindow(), tarp: caTexTarp(), brick: rep(caTexBrick(), 1 / 1.0, 1 / 1.1), asph: rep(stTexAsphalt(), 1 / 4.5), grass: rep(stTexGrass(), 1 / 0.9), shingle: rep(stTexShingle(), 1 / 1.1, 1 / 1.3) };
  T.asphR = rep(caTexWetRough(T.asph), 1 / 4.5);
  T.cobR = rep(caTexWetRough(T.cob), 1 / 1.1); T.slabR = rep(caTexWetRough(T.slab), 1 / 2.4);
  M.stucco = SM({ vertexColors: true, map: T.stucco, bumpMap: T.stucco, bumpScale: 0.7, roughness: 0.82, envMap: CA.env, envMapIntensity: 0.35 });
  M.damp = new THREE.MeshBasicMaterial({ map: T.damp, transparent: true, blending: THREE.MultiplyBlending, premultipliedAlpha: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  M.trim = SM({ vertexColors: true, roughness: 0.55, envMap: CA.env, envMapIntensity: 0.5 });
  M.paint = M.trim;
  M.wood = SM({ vertexColors: true, map: T.wood, bumpMap: T.wood, bumpScale: 0.8, roughness: 0.5, envMap: CA.env, envMapIntensity: 0.6 });
  M.iron = SM({ color: lin('#1d1e20'), roughness: 0.38, metalness: 0.6, envMap: CA.env, envMapIntensity: 1.2 });
  M.glass = SM({ map: T.win, roughness: 0.04, metalness: 0.15, envMap: CA.env, envMapIntensity: 2.4, color: lin('#8d9aa6') });
  M.tile = SM({ map: T.tile, bumpMap: T.tile, bumpScale: 1.2, roughness: 0.42, envMap: CA.env, envMapIntensity: 0.9 });
  M.cob = SM({ map: T.cob, bumpMap: T.cob, bumpScale: 2.2, roughnessMap: T.cobR, roughness: 1, envMap: CA.env, envMapIntensity: 1.6, color: lin('#a8a49c') });
  M.slab = SM({ map: T.slab, bumpMap: T.slab, bumpScale: 1.2, roughnessMap: T.slabR, roughness: 1, envMap: CA.env, envMapIntensity: 1.4, color: lin('#958f84') });
  M.brick = SM({ vertexColors: true, map: T.brick, bumpMap: T.brick, bumpScale: 0.8, roughness: 0.75, envMap: CA.env, envMapIntensity: 0.4 });
  M.roof = SM({ color: lin('#6d7178'), map: T.shingle, bumpMap: T.shingle, bumpScale: 1.0, roughness: 0.4, envMap: CA.env, envMapIntensity: 1.0 });
  M.asph = SM({ map: T.asph, roughnessMap: T.asphR, roughness: 0.75, envMap: CA.env, envMapIntensity: 1.5, color: lin('#8a8a8c') });
  M.lawn = SM({ color: lin('#6f9a3a'), map: T.grass, roughness: 0.7, envMap: CA.env, envMapIntensity: 0.5 });
  M.puddle = SM({ color: lin('#2b3036'), roughness: 0.02, metalness: 0.4, envMap: CA.env, envMapIntensity: 2.2, transparent: true, opacity: 0.88, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  M.fol = stSoft(SM({ vertexColors: true, map: T.leafT, roughness: 0.6 }), 0.45, false, 'cafol', 0.9);
  M.leaf = stSoft(SM({ vertexColors: true, map: T.leaf, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.5 }), 0.45, true, 'caleaf', 1.2);
  M.bark = SM({ color: lin('#7a6c60'), map: T.bark, bumpMap: T.bark, bumpScale: 1.5, roughness: 0.8 });
  M.blob = new THREE.MeshBasicMaterial({ map: g3Radial([[0, 'rgba(10,12,14,0.6)'], [0.5, 'rgba(10,12,14,0.3)'], [1, 'rgba(10,12,14,0)']]), transparent: true, depthWrite: false });
  M.lampGlow = new THREE.MeshBasicMaterial({ color: lin('#ffd9a0'), toneMapped: false });
  M.carPaint = SM({ envMap: CA.env, vertexColors: true, roughness: 0.18, metalness: 0.25, envMapIntensity: 2.2 });
  M.carGlass = SM({ envMap: CA.env, color: lin('#1c242c'), roughness: 0.04, metalness: 0.2, envMapIntensity: 2.6 });
  M.rubber = SM({ color: lin('#232325'), roughness: 0.6 });
  M.chrome = SM({ envMap: CA.env, color: lin('#d8dadc'), roughness: 0.18, metalness: 1, envMapIntensity: 2.2 });
  M.carSeat = SM({ vertexColors: true, roughness: 0.6 });
  // contraption materials
  M.canopy = SM({ vertexColors: true, map: T.fab, roughness: 0.32, side: THREE.DoubleSide, envMap: CA.env, envMapIntensity: 0.9 });
  M.wall = SM({ color: lin('#2f5fae'), map: T.tarp, roughness: 0.3, side: THREE.DoubleSide, envMap: CA.env, envMapIntensity: 1.0 });
  M.frame = SM({ color: lin('#e6b23a'), roughness: 0.28, metalness: 0.35, envMap: CA.env, envMapIntensity: 1.4 });
  M.metal = SM({ color: lin('#6f7479'), roughness: 0.3, metalness: 0.8, envMap: CA.env, envMapIntensity: 1.4 });
  M.cream = SM({ color: lin('#efe4cc'), roughness: 0.35, envMap: CA.env, envMapIntensity: 0.9 });
  M.seat = SM({ color: lin('#8a3b2a'), roughness: 0.45, envMap: CA.env, envMapIntensity: 0.8 });
  M.handle = SM({ color: lin('#7a4a28'), roughness: 0.35, envMap: CA.env, envMapIntensity: 1.0 });
  M.shield = new THREE.MeshPhysicalMaterial({ color: lin('#cfe0ea'), roughness: 0.03, metalness: 0, transmission: 0, transparent: true, opacity: 0.22, envMap: CA.env, envMapIntensity: 2.4, side: THREE.DoubleSide, depthWrite: false });
  M.led = new THREE.MeshBasicMaterial({ color: lin('#7dffb0'), toneMapped: false });
  CA.tireGeo = ST.tireGeo = new THREE.TorusGeometry(0.25, 0.11, 10, 26); ST.rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 22);
  CA.T = T;
  caGround(); caHouses(); caProps(); caRain(); caSplash(); caRig();
  CH_COL.jeans = '#c2beb5'; CH_COL.jeansL = '#d6d2c9';   // light grey chinos: the wet line reads on them (as in the reference)
  CA.ch = chBuild(); S.add(CA.ch.root); CA.chBlob = stShadowBlob(0, 0, 0.8, 0.6, 0, 0.55, 0.03);
  return CA;
}

// ---------- ground: paving-slab sidewalks, curbs, wet asphalt, front lawns, puddles — all following caY(x)
function caStrip(x0, x1, z0, z1, dy, mat, nx = 120) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, 2); geo.rotateX(-Math.PI / 2); geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const P = geo.attributes.position, U = geo.attributes.uv; for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); P.setY(i, caY(x) + dy); U.setXY(i, x, z); }
  geo.computeVertexNormals(); const me = new THREE.Mesh(geo, mat); me.receiveShadow = true; CA.scene.add(me); return me;
}
const CA_X0 = -60, CA_X1 = 190, CA_NF = -3.6, CA_FF = 15.9;   // near / far facade lines
function caGround() {
  const X0 = CA_X0, X1 = CA_X1;
  caStrip(X0, X1, -0.4, 2.2, 0, CA.mat.slab); caStrip(X0, X1, 9.8, 12.4, 0, CA.mat.slab); caStrip(X0, X1, 2.2, 9.8, -0.14, CA.mat.asph, 250);
  caStrip(X0, X1, CA_NF - 0.2, -0.4, 0.02, CA.mat.lawn); caStrip(X0, X1, 12.4, CA_FF + 0.2, 0.02, CA.mat.lawn);
  const cb = stBatch(), ln = stBatch(); for (let x = X0; x < X1; x += 1.0) { const y = caY(x + 0.5), a = Math.atan(caSlope(x + 0.5)); [2.2, 9.8].forEach((z) => cb.add(stRBox(1.0, 0.24, 0.2, 0.03), stM(x + 0.5, y - 0.1, z, 0, 0, a), '#b9b5ac')); }
  for (let x = X0; x < X1; x += 6) ln.add(stRBox(3, 0.01, 0.12, 0.004), stM(x + 1.5, caY(x + 1.5) - 0.133, 6.0, 0, 0, Math.atan(caSlope(x + 1.5))), '#e8e6e0');
  for (let x = X0; x < X1; x += 1.2) [2.55, 9.45].forEach((z) => ln.add(stRBox(0.6, 0.01, 0.08, 0.004), stM(x + 0.3, caY(x + 0.3) - 0.133, z, 0, 0, Math.atan(caSlope(x + 0.3))), '#e9c94a'));
  CA.scene.add(cb.mesh(CA.mat.trim)); const lm = ln.mesh(CA.mat.trim, false, true); CA.scene.add(lm);
  const R = RNG('ca-pud'); CA.puddles = [];
  const add = (x, z, rx, rz) => { const gm = new THREE.CircleGeometry(1, 40); const P = gm.attributes.position; for (let i = 0; i < P.count; i++) { const a = Math.atan2(P.getY(i), P.getX(i)); const k = 1 + 0.18 * Math.sin(a * 3 + x) + 0.1 * Math.sin(a * 5 + z); P.setXY(i, P.getX(i) * k, P.getY(i) * k); }
    gm.rotateX(-Math.PI / 2); const me = new THREE.Mesh(gm, CA.mat.puddle); me.scale.set(rx, 1, rz); me.position.set(x, caY(x) + (z > 2.2 && z < 9.8 ? -0.135 : 0.006), z); me.renderOrder = 2; CA.scene.add(me); CA.puddles.push([x, z, rx, rz]); };
  [[2.5, 1.5, 0.8, 0.45], [-3, 2.9, 1.4, 0.5], [6, 3.0, 1.8, 0.6], [11, 2.8, 1.1, 0.45], [14, 7.5, 2.2, 1.0], [-8, 6.8, 1.6, 0.8], [20, 3.0, 1.2, 0.5], [33, 5.5, 2.0, 1.0], [40, 2.8, 1.3, 0.5], [48, 6.3, 2.4, 1.1], [56, 3.0, 1.5, 0.6], [66, 5.0, 2.0, 0.9], [78, 3.0, 1.4, 0.6], [86, 7.2, 1.8, 0.9], [-14, 1.2, 0.9, 0.5], [9, 10.9, 1.0, 0.5], [27, 11.2, 1.2, 0.5]].forEach((p) => add(...p));
  for (let i = 0; i < 30; i++) add(R.r(X0 + 10, X1 - 20), R.r(2.7, 9.3), R.r(0.4, 1.4), R.r(0.25, 0.6));
}

// ---------- brick terraced house (the reference's suburb). Local frame: facade at z = 0 facing +z, front garden to z = 3.2.
// o: x, side (+1 near / −1 far), w, brick (tint), door, seed, num, bay
function caHouse(o) {
  const near = o.side > 0, G = new THREE.Group(); G.position.set(o.x, caY(o.x), near ? CA_NF : CA_FF); G.rotation.y = near ? 0 : Math.PI; CA.scene.add(G);
  const R = RNG('ca-house', o.seed), w = o.w, h = 5.5, D = 7, low = 2.2, ridge = 2.5;
  const br = stBatch(), wt = stBatch(), st = stBatch(), gl = stBatch(), rf = stBatch(), dr = stBatch(), dk = stBatch();
  br.add(stRBox(w, h + low, D, 0.02), stM(0, (h - low) / 2, -D / 2), o.brick);
  // gable roof along x: two slate slopes + ridge, eaves overhang; a chimney on the party wall
  const run = D / 2 + 0.35, sl = Math.hypot(run, ridge), ang = Math.atan2(ridge, run);
  [-1, 1].forEach((s) => rf.add(stRBox(w + 0.04, 0.12, sl, 0.02), stM(0, h + ridge / 2 - 0.05, -D / 2 + s * run / 2, 0, s * ang, 0), '#ffffff'));
  dk.add(stRBox(w + 0.06, 0.16, 0.22, 0.06), stM(0, h + ridge - 0.02, -D / 2), '#5a5652');
  wt.add(stRBox(w + 0.04, 0.22, 0.12, 0.02), stM(0, h - 0.05, 0.36), '#f2f0ea');   // white fascia
  br.add(stRBox(0.7, 1.6, 0.6, 0.02), stM(w / 2 - 0.35, h + ridge - 0.2, -D / 2 - 0.9), o.brick);
  [-0.15, 0.15].forEach((dx) => st.add(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 10), stM(w / 2 - 0.35 + dx, h + ridge + 0.75, -D / 2 - 0.9), '#b8603e'));
  // door bay (with a little canopy) + window bays; uPVC white frames, stone sills, soldier-course lintels
  const db = o.doorLeft ? -1 : 1, dx = db * (w / 2 - 1.0);
  wt.add(stRBox(1.12, 2.28, 0.1, 0.02), stM(dx, 1.14, 0.03), '#f4f2ec'); dr.add(stRBox(0.92, 2.0, 0.06, 0.02), stM(dx, 1.02, 0.07), o.door);
  gl.add(new THREE.PlaneGeometry(0.5, 0.5), stM(dx, 1.45, 0.105), null); wt.add(stRBox(0.06, 0.02, 0.02, 0.01), stM(dx + 0.3, 1.0, 0.12), '#d8c070');
  wt.add(stRBox(1.5, 0.1, 0.7, 0.03), stM(dx, 2.48, 0.35), '#f4f2ec'); [-1, 1].forEach((s) => wt.add(stRBox(0.05, 0.3, 0.5, 0.01), stM(dx + s * 0.62, 2.3, 0.25, 0, 0, 0), '#f4f2ec'));
  st.add(stRBox(1.3, 0.16, 0.5, 0.02), stM(dx, 0.08, 0.25), '#aaa59c');
  if (o.num) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), new THREE.MeshStandardMaterial({ map: stTextTex(o.num, '#d8c070', '#1a1a1a', 128, 96, 'bold 64px Georgia'), roughness: 0.4 })); pl.position.set(dx, 1.62, 0.115); G.add(pl); }
  const win = (cx, cy, ww, wh) => {
    wt.add(stRBox(ww + 0.12, wh + 0.12, 0.1, 0.015), stM(cx, cy, 0.02), '#f4f2ec'); gl.add(stWinGeo(ww - 0.04, wh - 0.04, R.i(0, 3)), stM(cx, cy, 0.075), null);
    wt.add(stRBox(0.05, wh, 0.03, 0.01), stM(cx, cy, 0.09), '#f4f2ec'); wt.add(stRBox(ww, 0.05, 0.03, 0.01), stM(cx, cy + wh * 0.18, 0.09), '#f4f2ec');
    st.add(stRBox(ww + 0.3, 0.09, 0.2, 0.02), stM(cx, cy - wh / 2 - 0.1, 0.1), '#d6d0c4'); br.add(stRBox(ww + 0.24, 0.2, 0.06, 0.01), stM(cx, cy + wh / 2 + 0.16, 0.03), pvMix(o.brick, '#3a2a22', 0.25));
  };
  const wx = -db * (w / 2 - 1.55);
  if (o.bay) { // a ground-floor bay window with its own little roof
    const bw = 2.2, bd = 0.7; br.add(stRBox(bw, 0.8, bd, 0.02), stM(wx, 0.4, bd / 2), o.brick); wt.add(stRBox(bw, 1.3, bd - 0.05, 0.02), stM(wx, 1.45, bd / 2 - 0.02), '#f4f2ec');
    [-0.72, 0, 0.72].forEach((k) => gl.add(stWinGeo(0.62, 1.15, R.i(0, 3)), stM(wx + k, 1.45, bd + 0.0), null)); rf.add(stRBox(bw + 0.2, 0.1, bd + 0.2, 0.02), stM(wx, 2.2, bd / 2, 0, -0.25, 0), '#ffffff');
  } else win(wx, 1.45, 1.5, 1.3);
  win(wx, 4.0, 1.4, 1.2); win(dx, 4.0, 0.8, 1.05);
  // front garden: low brick wall with a gate gap, a hedge behind it, a path to the door
  const gz = 3.25, gap0 = dx - 0.6, gap1 = dx + 0.6;
  [[-w / 2, gap0], [gap1, w / 2]].forEach(([a, b]) => { if (b - a < 0.2) return; br.add(stRBox(b - a, 0.5, 0.24, 0.02), stM((a + b) / 2, 0.25, gz), o.wall ?? o.brick); st.add(stRBox(b - a, 0.06, 0.3, 0.02), stM((a + b) / 2, 0.52, gz), '#cfc9bd');
    if (o.hedge !== false) stFoliage({ c: [o.x + (near ? 1 : -1) * (a + b) / 2, caY(o.x) + 1.0, near ? CA_NF + gz - 0.45 : CA_FF - gz + 0.45], r: [(b - a) / 2 + 0.05, 0.6, 0.38], n: Math.max(3, Math.round((b - a) * 1.4)), cr: [0.32, 0.46], cards: Math.round((b - a) * 70), cs: [0.18, 0.28], pal: ST_PAL.hedge, seed: 'hd' + o.seed + a, det: 2, box: true }); });
  st.add(stRBox(1.1, 0.04, gz - 0.5, 0.01), stM(dx, 0.02, 0.5 + (gz - 0.5) / 2), '#b4afa6');
  const add = (b, m, cast = true) => { const me = b.mesh(m, cast, true); if (me) G.add(me); return me; };
  add(br, CA.mat.brick); add(wt, CA.mat.trim); add(st, CA.mat.trim); add(gl, CA.mat.glass, false); add(rf, CA.mat.roof); add(dr, CA.mat.trim); add(dk, CA.mat.trim);
  return { G, doorX: o.x + (near ? 1 : -1) * dx };
}
const CA_BRICK = ['#c0624a', '#d9be8e', '#b25640', '#e0c79a', '#a8553e', '#c98a62'];
function caHouses() {
  [[1, 'n'], [-1, 'f']].forEach(([side, tag]) => {
    let x = -50, i = 0; const R = RNG('ca-row', tag);
    while (x < 180) { const w = R.r(5.4, 6.4), pair = i % 2, home = side > 0 && x + w / 2 > 96 && x + w / 2 < 104 && !CA.homeX;
      const brick = CA_BRICK[(Math.floor(i / 2) * 3 + (side > 0 ? 0 : 1)) % CA_BRICK.length];
      const H = caHouse({ x: x + w / 2, side, w, brick, door: home ? '#b8322a' : ['#2f6b3a', '#23466e', '#1f1f22', '#6a3a5a', '#2f6b3a', '#b8322a'][R.i(0, 5)], seed: tag + i, doorLeft: pair === (side > 0 ? 0 : 1), bay: R.f() < 0.5, num: home ? '12' : String(2 * i + (side > 0 ? 0 : 1)), hedge: R.f() < 0.85 });
      if (home) CA.homeX = H.doorX;
      x += w; i++; }
  });
}
// ---------- props: concrete street lamps (far side), street trees, the crash hedge, parked cars, wheelie bins
function caProps() {
  const S = CA.scene, lp = stBatch();
  for (let x = -40; x < 170; x += 24) { const y = caY(x), z = 10.15; lp.add(new THREE.CylinderGeometry(0.07, 0.1, 6, 10), stM(x, y + 3, z), null).add(stTube(stCurve([[x, y + 5.9, z], [x, y + 6.25, z - 0.4], [x, y + 6.25, z - 1.2]], 8), Array(9).fill(0.05), 6), new THREE.Matrix4(), null).add(stRBox(0.32, 0.12, 0.6, 0.04), stM(x, y + 6.2, z - 1.35), null);
    const b = new THREE.Mesh(stRBox(0.26, 0.04, 0.5, 0.01), CA.mat.lampGlow); b.position.set(x, y + 6.13, z - 1.35); S.add(b); CA.lamps.push(b); }
  S.add(lp.mesh(CA.mat.metal));
  [[-24, 11.7], [-4, 11.7], [18, 11.7], [52, 11.7], [74, 11.7], [118, 11.7]].forEach(([x, z], k) => { stTree('ca' + k, x, z, 0.75, k % 2 ? 'green' : 'lime', 1); CA.treeG[CA.treeG.length - 1].g.position.y = caY(x); });
  [[-12, -0.9], [8, -0.9], [60, -0.9], [88, -0.9]].forEach(([x, z], k) => { stTree('cn' + k, x, z, 0.62, 'deep', 1); CA.treeG[CA.treeG.length - 1].g.position.y = caY(x); });
  // the crash hedge: a planted build-out at the kerb (x 41.8..45)
  { const x = 43.4, z = 3.7, y = caY(x) - 0.14, pb = stBatch(); pb.add(stRBox(3.2, 0.3, 1.3, 0.06), stM(x, y + 0.15, z), '#b9b5ac'); S.add(pb.mesh(CA.mat.trim));
    CA.hedge = stFoliage({ c: [x, y + 0.95, z], r: [1.55, 0.7, 0.6], n: 14, cr: [0.35, 0.55], cards: 700, cs: [0.18, 0.3], pal: ST_PAL.hedge, seed: 'hedge', det: 2, box: true }); CA.hedgeX = x; CA.hedgeZ = z; }
  [[-20, 8.8, 0, '#b8423a'], [30, 8.8, 0, '#e8e2d2'], [74, 8.8, Math.PI, '#3a6a8a'], [124, 8.8, 0, '#4a4f58']].forEach(([x, z, r, c]) => { const car = stCar(x, z, r, c); car.position.y = caY(x) - 0.14; car.rotation.z = Math.atan(caSlope(x)) * (r ? -1 : 1); });
  const bn = stBatch(); [[-6, -1.0, '#3a5a3a'], [-5.3, -1.0, '#3a3a3e'], [24, -1.0, '#2f4a6a'], [70, -1.0, '#3a5a3a']].forEach(([x, z, c]) => { bn.add(stRBox(0.58, 1.05, 0.72, 0.05), stM(x, caY(x) + 0.53, z), c).add(stRBox(0.62, 0.06, 0.78, 0.03), stM(x, caY(x) + 1.08, z), c); }); S.add(bn.mesh(CA.mat.trim));
}

// ---------- rain: slanted streaks in a box around the camera; wind slants them (wind = metres of drift per metre of fall)
function caRain(n = 5200) {
  const g = new THREE.PlaneGeometry(0.012, 0.6), g2 = g.clone().rotateY(Math.PI / 2), geo = stMerge([[g, new THREE.Matrix4(), '#ffffff'], [g2, new THREE.Matrix4(), '#ffffff']]);
  const m = new THREE.MeshBasicMaterial({ color: lin('#dfe7ee'), transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const im = new THREE.InstancedMesh(geo, m, n); im.frustumCulled = false; im.renderOrder = 8; CA.scene.add(im);
  const R = RNG('ca-rain'); im.userData.p = Array.from({ length: n }, () => [R.f(), R.f(), R.f(), R.r(0.85, 1.2)]); CA.rain = im;
}
function caRainUpdate(t, cam, wind = 0.15, dens = 1) {
  const im = CA.rain, B = [30, 18, 30], c = cam.position, m = new THREE.Matrix4(), sv = V3(1, 1, 1), pv = V3(0, 0, 0), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.atan(wind)));
  const sp = 11, N = im.count;
  im.userData.p.forEach(([a, b, d, s], i) => {
    const fall = t * sp * s, y = ((((b * B[1] - fall) % B[1]) + B[1]) % B[1]) + c.y - B[1] * 0.45;
    const xw = a * B[0] + fall * wind, xx = c.x + ((((xw - c.x) % B[0]) + B[0]) % B[0]) - B[0] / 2, zz = c.z + ((((d * B[2] - c.z) % B[2]) + B[2]) % B[2]) - B[2] / 2;
    const k = i < N * dens ? 1 : 0; pv.set(xx, y, zz); sv.set(k, k * s, k); m.compose(pv, q, sv); im.setMatrixAt(i, m);
  });
  im.instanceMatrix.needsUpdate = true;
}
// ---------- splashes: expanding rings on the ground (additive, faded through instance colour); denser in puddles
function caSplash(n = 900) {
  const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), m = new THREE.MeshBasicMaterial({ map: caTexRing(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: lin('#9fb0bf') });
  const im = new THREE.InstancedMesh(geo, m, n); im.frustumCulled = false; im.renderOrder = 3; im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3); CA.scene.add(im); CA.splash = im;
  const R = RNG('ca-spl'); im.userData.p = Array.from({ length: n }, (_, i) => { if (i % 3 === 0) { const P = CA.puddles[R.i(0, CA.puddles.length - 1)]; const a = R.r(0, TAU), r = Math.sqrt(R.f()); return [P[0] + Math.cos(a) * r * P[2] * 0.85, P[1] + Math.sin(a) * r * P[3] * 0.85, R.f(), R.r(0.5, 0.8), 1]; } return [R.r(-60, 190), R.r(-0.1, 12), R.f(), R.r(0.4, 0.7), 0]; });
}
function caSplashUpdate(t, cam, rate = 1) {
  const im = CA.splash, m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = V3(1, 1, 1), pv = V3(0, 0, 0), c = cam.position, col = new THREE.Color();
  im.userData.p.forEach(([x, z, ph, per, pud], i) => {
    if (Math.abs(x - c.x) > 26) { sv.set(0, 0, 0); m.compose(pv, q, sv); im.setMatrixAt(i, m); return; }
    const u = ((t / per + ph) % 1), cyc = Math.floor(t / per + ph), R = RNG('sp', i * 977 + cyc), jx = x + R.n(0.6), jz = z + R.n(0.6);
    const road = jz > 2.2 && jz < 9.8, y = caY(jx) + (road ? -0.13 : 0.012), r = (pud ? 0.32 : 0.16) * EZ.o3(u);
    pv.set(jx, y, jz); sv.set(r, 1, r); m.compose(pv, q, sv); im.setMatrixAt(i, m); const a = (1 - u) * (pud ? 0.8 : 0.45) * rate; col.setRGB(a, a, a); im.setColorAt(i, col);
  });
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
}

// =====================================================================
//  THE CONTRAPTION — one rig, built once, every stage a parameter.
//  Local frame: travel along +X, floor at y = 0, centre at the origin; the box is L (x) × Wd (z) with walls up to y = WALL.
//  P: { r: canopy radius, hold: 1 = in the hand (canopy follows the grip), walls 0..1 (drop), box 0 cylinder → 1 rounded box,
//       sail 0..1 (wind bulge), frame 0..1 (snap-on, staggered), wheels 0..1, motor, seat, glass, wiper (angle 0..1), steer, door 0..1 }
// =====================================================================
const CA_L = 1.9, CA_WD = 1.35, CA_WALL0 = 0.38, CA_WALL1 = 1.95, CA_TOP = 2.2;
function caCanopyGeo() {   // a scalloped 8-gore dome, radius 1, crown at y = 0.32; gore colours alternate
  const NA = 96, NR = 14, pos = [], col = [], uv = [], idx = [], A = stC('#2f5fae'), Bc = stC('#3a6cbd');
  for (let j = 0; j <= NR; j++) for (let i = 0; i <= NA; i++) { const a = i / NA * TAU, u = j / NR, rib = Math.abs(Math.cos(a * 4)), sag = (1 - Math.pow(rib, 0.6)) * 0.06 * u * u;
    const r = u * (1 - (1 - rib) * 0.035 * u), y = 0.32 * (1 - u * u) - sag - 0.02 * u;
    pos.push(Math.cos(a) * r, y, Math.sin(a) * r); const gore = Math.floor(((a + Math.PI / 8) / (Math.PI / 4))) % 2; col.push(...(gore ? A : Bc)); uv.push(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2); }
  for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + NA + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function caRig() {
  const M = CA.mat, R = new THREE.Group(); CA.scene.add(R); CA.rig = R;
  // umbrella: its own group (moved to the hand or to the roof)
  const U = new THREE.Group(); CA.scene.add(U); CA.umb = U;
  const can = new THREE.Mesh(caCanopyGeo(), M.canopy); can.castShadow = can.receiveShadow = true; U.add(can); CA.can = can;
  const ub = stBatch(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + Math.PI / 8 * 0; const pts = []; for (let j = 0; j <= 6; j++) { const u = 0.08 + j / 6 * 0.9; pts.push(V3(Math.cos(a) * u, 0.32 * (1 - u * u) - 0.035 - 0.02 * u, Math.sin(a) * u)); } ub.add(stTube(pts, pts.map(() => 0.008), 5), new THREE.Matrix4(), '#2a2a2a'); ub.add(new THREE.SphereGeometry(0.016, 8, 6), stM(Math.cos(a) * 0.98, -0.045, Math.sin(a) * 0.98), '#e8e2d0'); }
  const ribs = ub.mesh(M.metal); U.add(ribs); CA.ribs = ribs;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.12, 8), M.metal); tip.position.y = 0.38; U.add(tip);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), M.metal); shaft.castShadow = true; U.add(shaft); CA.shaft = shaft;
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.017, 8, 18, Math.PI), M.handle); hook.castShadow = true; U.add(hook); CA.hook = hook;
  // walls: an open cylinder whose vertices are re-shaped every frame (circle → rounded box, sail bulge, flutter)
  // three pieces of one skirt: sides, a back flap (rolls up once the frame is on, so he can push and step out) and a front flap (rolls up for the windshield)
  // CylinderGeometry: x = sin(θ), z = cos(θ); back (−X) is θ = 3π/2, front (+X) is θ = π/2
  const mk = (t0, len, seg) => { const g = new THREE.CylinderGeometry(1, 1, 1, seg, 10, true, t0, len), m = new THREE.Mesh(g, M.wall); m.castShadow = true; m.receiveShadow = false; m.userData.base = g.attributes.position.array.slice(); R.add(m); return m; };
  const hw = 0.62;
  CA.wallParts = [{ m: mk(Math.PI / 2 + hw, Math.PI - 2 * hw, 24), roll: 'none' }, { m: mk(3 * Math.PI / 2 - hw, 2 * hw, 12), roll: 'back' }, { m: mk(3 * Math.PI / 2 + hw, Math.PI - 2 * hw, 24), roll: 'none' }, { m: mk(Math.PI / 2 - hw, 2 * hw, 12), roll: 'front' }];
  CA.wall = CA.wallParts[0].m;
  const hem = new THREE.Mesh(new THREE.TorusGeometry(1, 0.015, 6, 64), M.cream); hem.rotation.x = Math.PI / 2; R.add(hem); CA.hem = hem;
  // frame: 12 box edges + 2 handle bars, each its own mesh (snap-on stagger)
  const L = CA_L / 2 + 0.04, Wz = CA_WD / 2 + 0.04, y0 = CA_WALL0 - 0.05, y1 = CA_WALL1 + 0.05, E = [];
  [[-L, -Wz], [L, -Wz], [-L, Wz], [L, Wz]].forEach(([x, z]) => E.push([[x, y0, z], [x, y1, z]]));
  [y0, y1].forEach((y) => { E.push([[-L, y, -Wz], [L, y, -Wz]], [[-L, y, Wz], [L, y, Wz]], [[-L, y, -Wz], [-L, y, Wz]], [[L, y, -Wz], [L, y, Wz]]); });
  E.push([[-L - 0.02, 1.05, -Wz], [-L - 0.02, 1.05, Wz]]);   // push bar at the back
  CA.frame = E.map(([a, b], i) => { const A = V3(...a), B = V3(...b), len = A.distanceTo(B), m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 12), M.frame); m.castShadow = true; const G = new THREE.Group(); G.position.copy(A).lerp(B, 0.5); G.quaternion.setFromUnitVectors(V3(0, 1, 0), B.clone().sub(A).normalize()); G.add(m); R.add(G); return G; });
  const jb = stBatch(); [[-L, -Wz], [L, -Wz], [-L, Wz], [L, Wz]].forEach(([x, z]) => [y0, y1].forEach((y) => jb.add(new THREE.SphereGeometry(0.055, 12, 8), stM(x, y, z), null))); CA.joints = jb.mesh(M.frame); R.add(CA.joints);
  // mast from the roof to the canopy (the umbrella shaft sits in it once mounted)
  // wheels
  CA.wheels = [[L - 0.12, -Wz - 0.06], [L - 0.12, Wz + 0.06], [-L + 0.12, -Wz - 0.06], [-L + 0.12, Wz + 0.06]].map(([x, z]) => { const G = new THREE.Group(), s = Math.sign(z); const tire = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.085, 12, 30), M.rubber); tire.castShadow = true; const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 20), M.cream); rim.rotation.x = Math.PI / 2; const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), M.metal); hub.rotation.x = Math.PI / 2;
    const spk = stBatch(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; spk.add(stRBox(0.03, 0.15, 0.02, 0.008), stM(Math.cos(a) * 0.075, Math.sin(a) * 0.075, 0, 0, 0, a + Math.PI / 2), null); } const sp = spk.mesh(M.frame); sp.position.z = s * 0.035;
    const W2 = new THREE.Group(); W2.add(tire, rim, hub, sp); G.add(W2); G.position.set(x, 0.285, z); G.userData = { spin: W2, x, z }; R.add(G); return G; });
  // motor + battery
  { const G = new THREE.Group(), mb = stBatch(); mb.add(new THREE.CylinderGeometry(0.13, 0.13, 0.26, 20), stM(-L + 0.12, 0.285, -Wz + 0.22, 0, Math.PI / 2, 0), null).add(stRBox(0.42, 0.24, 0.5, 0.04), stM(-L + 0.5, 0.42, 0), null);
    const me = mb.mesh(M.metal); G.add(me); const bat = new THREE.Mesh(stRBox(0.4, 0.22, 0.46, 0.04), M.frame); bat.position.set(-L + 0.5, 0.42, 0); bat.scale.set(1.04, 1.04, 1.04); G.add(bat);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), M.led); led.position.set(-L + 0.5, 0.55, 0.24); G.add(led); CA.led = led;
    const cab = new THREE.Mesh(stTube(stCurve([[-L + 0.5, 0.45, -0.22], [-L + 0.3, 0.38, -0.4], [-L + 0.14, 0.3, -Wz + 0.12]], 10), Array(11).fill(0.018), 6), M.rubber); G.add(cab); R.add(G); CA.motor = G; }
  // floor grille + seat
  { const fb = stBatch(); for (let k = -6; k <= 6; k++) fb.add(stRBox(CA_L, 0.025, 0.025, 0.008), stM(0, CA_WALL0 - 0.04, k * 0.1), null); for (let k = -8; k <= 8; k++) fb.add(stRBox(0.025, 0.025, CA_WD, 0.008), stM(k * 0.11, CA_WALL0 - 0.04, 0), null); CA.floor = fb.mesh(M.metal); R.add(CA.floor);
    const G = new THREE.Group(), sb = stBatch(); sb.add(stRBox(0.55, 0.14, 0.6, 0.06), stM(0, 0.62, 0), null).add(stRBox(0.12, 0.62, 0.58, 0.06), stM(-0.3, 0.95, 0, 0, 0, 0.12), null);
    const sp = stBatch(); sp.add(new THREE.CylinderGeometry(0.03, 0.03, 0.27, 8), stM(0, 0.47, 0), null).add(stRBox(0.4, 0.03, 0.4, 0.01), stM(0, 0.345, 0), null);
    G.add(sb.mesh(M.seat), sp.mesh(M.metal)); G.position.x = -0.25; R.add(G); CA.seat = G; }
  // windshield (front wall at +X), its drops, the wiper, the steering wheel
  { const G = new THREE.Group(), gl = new THREE.Mesh(new THREE.PlaneGeometry(CA_WD - 0.04, CA_WALL1 - 0.9), M.shield); gl.rotation.y = Math.PI / 2; gl.position.set(CA_L / 2 + 0.035, (CA_WALL1 + 0.9) / 2, 0); gl.renderOrder = 6; G.add(gl);
    const fb = stBatch(); fb.add(stRBox(0.05, 0.06, CA_WD, 0.02), stM(CA_L / 2 + 0.04, 0.9, 0), null).add(stRBox(0.05, 0.06, CA_WD, 0.02), stM(CA_L / 2 + 0.04, CA_WALL1, 0), null); [-1, 1].forEach((s) => fb.add(stRBox(0.05, CA_WALL1 - 0.9, 0.06, 0.02), stM(CA_L / 2 + 0.04, (CA_WALL1 + 0.9) / 2, s * (CA_WD / 2 - 0.01)), null)); G.add(fb.mesh(M.rubber));
    R.add(G); CA.shield = G;
    const dt = caTexDrop(), dm = new THREE.MeshBasicMaterial({ map: dt, transparent: true, depthWrite: false }); const di = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), dm, 260); di.renderOrder = 7; di.frustumCulled = false; R.add(di); CA.drops = di; const Rd = RNG('ca-drop'); di.userData.p = Array.from({ length: 260 }, () => [Rd.r(-0.6, 0.6), Rd.r(0.95, 1.9), Rd.r(0.022, 0.055), Rd.f(), Rd.r(0.6, 1.4)]);
    const wp = new THREE.Group(), blade = new THREE.Mesh(stRBox(0.03, 0.82, 0.03, 0.01), M.rubber); blade.position.y = 0.41; wp.add(blade); const arm = new THREE.Mesh(stRBox(0.02, 0.8, 0.02, 0.008), M.metal); arm.position.set(0.01, 0.4, 0); wp.add(arm); wp.position.set(CA_L / 2 + 0.07, 0.96, 0.05); R.add(wp); CA.wiper = wp;
    const sw = new THREE.Group(), ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 10, 30), M.rubber); sw.add(ring); [0, 1, 2].forEach((k) => { const sp = new THREE.Mesh(stRBox(0.15, 0.02, 0.02, 0.006), M.metal); sp.rotation.z = k / 3 * TAU + 0.3; sp.position.set(Math.cos(k / 3 * TAU + 0.3) * 0.08, Math.sin(k / 3 * TAU + 0.3) * 0.08, 0); sw.add(sp); });
    const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), M.metal); col2.position.set(0, -0.3, -0.02); col2.rotation.x = 0; sw.add(col2);
    const swp = new THREE.Group(); swp.add(sw); sw.rotation.y = Math.PI / 2; swp.rotation.z = 0.55; swp.position.set(0.42, 1.12, 0); R.add(swp); CA.steer = swp; CA.steerW = sw; }
  CA.rigBlob = stShadowBlob(0, 0, 2.6, 2.0, 0, 0.5, 0.025);
}
// shape the walls: k = box-ness, sail = bulge downwind (+X), flutter phase
function caWallShape(t, k, sail, drop, wallTop, roll = {}) {
  const a = CA_L / 2, b = CA_WD / 2, rc = CA.rc ?? 0.82, yb0 = lerp(0.05, CA_WALL0, k), yt = wallTop;
  CA.wallParts.forEach((W) => {
    const P = W.m.geometry.attributes.position, B = W.m.userData.base, up = W.roll === 'none' ? 0 : (roll[W.roll] ?? 0), yb = lerp(yb0, yt - 0.08, EZ.io(up));
    W.m.visible = up < 0.995;
    for (let i = 0; i < P.count; i++) {
      const bx = B[i * 3], by = B[i * 3 + 1] + 0.5, bz = B[i * 3 + 2], ang = Math.atan2(bz, bx), ca = Math.cos(ang), sa = Math.sin(ang);
      const n = 8, rr = Math.pow(Math.pow(Math.abs(ca) / a, n) + Math.pow(Math.abs(sa) / b, n), -1 / n);
      let x = lerp(rc * ca, rr * ca, k), z = lerp(rc * sa, rr * sa, k), y = lerp(yb, yt, by);
      y += (1 - drop) * (1.4 + by * 0.4);
      const bell = Math.sin(by * Math.PI * 0.95 + 0.1);
      x += sail * (0.55 + 0.35 * ca) * bell * (0.6 + 0.1 * Math.sin(t * 9 + by * 4 + ang * 2)); z += sail * sa * 0.18 * bell;
      const fl = (1 - k * 0.85) * 0.012 * Math.sin(t * 13 + ang * 5 + by * 7) + up * (1 - up) * 0.05 * Math.sin(by * 9);   // loose flutter; a rolled flap bunches
      x += ca * fl; z += sa * fl;
      P.setXYZ(i, x, y, z);
    }
    P.needsUpdate = true; W.m.geometry.computeVertexNormals();
  });
  CA.hem.scale.set(lerp(rc, a * 1.02, k), lerp(rc, b * 1.02, k), 1); CA.hem.position.y = yb0 + (1 - drop) * 1.4; CA.hem.visible = k < 0.5;
}
// pose the contraption. at = [x, z, yaw (rad)], P = stages, t = time
function caPose(at, P, t) {
  const R = CA.rig, x = at[0], z = at[1], yaw = at[2] ?? 0, gy = caY(x), pitch = Math.atan(caSlope(x)) * Math.cos(yaw);
  R.position.set(x, gy + (at[3] ?? 0), z); R.rotation.set(0, yaw, pitch + (at[4] ?? 0), 'YZX'); R.visible = true;
  const vis = (o, v) => { o.visible = v > 0.001; return v; };
  // walls
  CA.rc = (P.r ?? 1) * 0.97;
  const wv = P.walls ?? 0; CA.wallParts.forEach((W) => vis(W.m, wv)); vis(CA.hem, wv);
  if (wv > 0) caWallShape(t, P.box ?? 0, P.sail ?? 0, EZ.o3(wv), P.top ?? CA_WALL1, { back: P.backUp ?? 0, front: P.frontUp ?? 0 });
  CA.wall.material.opacity = 1;
  // frame snap-on: each bar scales in with a spring, staggered
  const fr = P.frame ?? 0; CA.frame.forEach((G, i) => { const k = clamp(fr * 1.6 - i * 0.045); G.visible = k > 0.001; const s = k <= 0 ? 0 : springEase(k * 0.9, 240, 12); G.scale.set(1, Math.max(0.001, s), 1); }); CA.joints.visible = fr > 0.6;
  // wheels: drop from above and bounce; spin with distance
  const wh = P.wheels ?? 0; CA.wheels.forEach((G, i) => { const k = clamp(wh * 1.5 - i * 0.12); G.visible = k > 0.001; G.position.y = 0.285 + (1 - springEase(k * 1.2, 180, 9)) * 1.6; G.userData.spin.rotation.z = -(P.roll ?? 0) / 0.285; });
  vis(CA.motor, P.motor ?? 0); CA.motor.scale.setScalar(Math.max(0.001, springEase((P.motor ?? 0) * 1.0, 220, 11))); CA.led.visible = (P.motor ?? 0) > 0.9 && Math.sin(t * 8) > -0.2;
  vis(CA.floor, P.seat ?? 0); vis(CA.seat, P.seat ?? 0); CA.seat.position.y = (1 - springEase((P.seat ?? 0), 220, 10)) * 1.5;
  const gs = vis(CA.shield, P.glass ?? 0); CA.shield.position.y = (1 - springEase(gs, 200, 11)) * 1.8;
  // drops on the glass: grow with rain, cleared under the wiper's sweep
  const dr = CA.drops, wipe = P.wiper ?? 0, wa = Math.sin(wipe * Math.PI * 2 * (P.wipes ?? 1)) * 1.1; dr.visible = gs > 0.95 && (P.drops ?? 0) > 0;
  if (dr.visible) { const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), sv = V3(1, 1, 1), pv = V3(0, 0, 0);
    dr.userData.p.forEach(([dz, dy, s, ph, sl], i) => { const cyc = Math.floor(t * 0.5 * sl + ph), u = (t * 0.5 * sl + ph) % 1; let k = clamp((P.drops ?? 0) * 1.4 - ph * 0.4); const ang = Math.atan2(dz - 0.05, dy - 0.96), swept = (P.wiper ?? 0) > 0 && Math.abs(ang) < Math.abs(wa) + 0.08 && Math.sign(ang) * Math.sign(wa) >= 0 && Math.hypot(dz - 0.05, dy - 0.96) < 0.86;
      if (swept) k *= 0.0; const yy = dy - (u > 0.7 ? (u - 0.7) * 0.6 * sl : 0); pv.set(CA_L / 2 + 0.05, yy, dz); const ss2 = s * k * (0.7 + 0.3 * Math.sin(cyc)); sv.set(ss2, ss2 * (u > 0.7 ? 1.5 : 1), 1); m.compose(pv, q, sv); dr.setMatrixAt(i, m); });
    dr.instanceMatrix.needsUpdate = true; }
  vis(CA.wiper, P.wiper != null ? 1 : 0); CA.wiper.rotation.x = -wa; CA.wiper.visible = (P.wiperOn ?? 0) > 0; CA.wiper.scale.setScalar(Math.max(0.001, springEase(P.wiperOn ?? 0, 220, 11)));
  vis(CA.steer, P.steer ?? 0); CA.steer.scale.setScalar(Math.max(0.001, springEase(P.steer ?? 0, 220, 11))); CA.steerW.rotation.z = P.turn ?? 0;
  CA.rigBlob.visible = (P.walls ?? 0) > 0.3 || wh > 0; CA.rigBlob.position.set(x, gy + 0.03, z); CA.rigBlob.rotation.y = yaw;
}
// umbrella: radius r, placed either in the hero's right hand (hold) or on the rig's roof
function caHoldPos(r) { const gp = CA.ch.arms.R.grip.getWorldPosition(V3(0, 0, 0)); return V3(gp.x, gp.y + 0.78 - 0.3 + 0.02, gp.z); }
const caEdgeY = (r) => -0.055 * (0.9 + r * 0.25);   // canopy rim height below the umbrella origin
// umbrella: radius r; k = 0 in the right hand, 1 on the rig's roof (blends while the frame takes it)
function caUmbrella(r, k, t, o = {}) {
  const U = CA.umb, sh = CA.shaft, hk = CA.hook; U.visible = true;
  CA.can.scale.set(r, 0.9 + r * 0.25, r); CA.ribs.scale.set(r, 0.9 + r * 0.25, r);
  const len = 0.78; sh.scale.y = len; sh.position.y = 0.3 - len / 2; hk.position.set(0.055, 0.3 - len, 0); hk.rotation.set(0, 0, Math.PI); hk.visible = k < 0.5;
  const hp = caHoldPos(r), R = CA.rig, rp = R.localToWorld(V3(0, CA_TOP - 0.3, 0));
  U.position.copy(hp).lerp(rp, k); U.rotation.set(lerp(o.tiltX ?? 0, R.rotation.x, k), lerp(o.yaw ?? 0, R.rotation.y, k), lerp(o.tiltZ ?? 0, R.rotation.z, k), 'YZX');
  if (o.wob) { U.rotation.z += o.wob * Math.sin(t * 7); U.rotation.x += o.wob * 0.6 * Math.sin(t * 5.3 + 1); }
}
function caHero(o) { const c = CA.ch; c.root.visible = true; chPose(o); c.root.updateMatrixWorld(true); const p = o.pos ?? [0, 0, 0]; CA.chBlob.visible = o.blob !== false; CA.chBlob.position.set(p[0], caY(p[0]) + 0.03, p[2]); return c; }
// lamps glow a touch through the rain
function caLamps(on = 1) { CA.lamps.forEach((b) => { b.material.color.setRGB(1.0 * on + 0.2, 0.85 * on + 0.15, 0.6 * on + 0.1); }); }
