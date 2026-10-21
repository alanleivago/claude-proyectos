
// =====================================================================
//  SUN — a balcony over a seaside plaza (on luna's harbour world, scenes.js). The Sun vanishes; its last light arrives
//  8 min 20 s later (×83): blackout, the Moon goes dark, the stars; then the cold: frost, snow, the sea freezes, the grid fails.
// =====================================================================
const SUNEN = typeof SUN_EN !== 'undefined' && SUN_EN;   // the English version sets SUN_EN = true in its head.html
const LG = (es, en) => (SUNEN ? en : es);
const blot2 = (x, px, py, r, col) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); };
const speck = (x, w, h, n, cols, R, s0 = 1, s1 = 3) => { for (let k = 0; k < n; k++) { x.fillStyle = R.pick(cols); x.fillRect(R.r(0, w), R.r(0, h), R.r(s0, s1), R.r(s0, s1)); } };
const SUN = dirV(LG(12, -16) * DEG, 14 * DEG), MOON_DIR = dirV(LG(-30, 34) * DEG, 20 * DEG);
const T_OUT = 11.0, T_MOON = 14.7, T_CRACK = 60.0;
const BAL = { x: LG(-6, 6), z: -46 }; BAL.y = gH(BAL.x, BAL.z) + 12.6;            // the balcony floor (4th floor of a seafront block)
const PLZ = { x0: -40, x1: 30, z0: -52, z1: -76, y: 3.7 };                         // the raised plaza between the block and the quay
const FOUNT = { x: LG(-4, 6), z: -67 };
const BARRELS = LG([[-16, -60], [5, -70], [-24, -71]], [[18, -61], [-4, -71], [24, -72]]);
const CAMX = BAL.x + 0.6, CAMZ = BAL.z - 1.9;
const coldT = (t) => knots([[0, 15], [25, 15], [33, -18], [41, -30], [49, -45], [57, -73], [70, -73]], t);   // °C
const dayT = (t) => knots([[0, 0], [25, 0], [33, 7], [41, 30], [49, 120], [57, 365], [70, 365]], t);           // days since

// ---- the camera: on the balcony looking down over the plaza to the harbour; it looks at whatever the caption says
// glances [t0, t1, yaw°, pitch°] (yaw + = left)
const GL = LG([[4.6, 11.7, -8, 21], [11.3, 13.9, 2, -12], [13.3, 16.8, 34, 38], [16.4, 19.4, -10, -2], [19.4, 25.2, 14, 45], [25.4, 32.8, 4, -17], [33.2, 40.9, 0, 11], [41.2, 45.6, 44, 13], [45.4, 48.9, -6, -9], [57.0, 63.0, 0, -4]],
  [[4.6, 11.7, 12, 21], [11.3, 13.9, -2, -12], [13.3, 16.8, -34, 38], [16.4, 19.4, 10, -2], [19.4, 25.2, -14, 45], [25.4, 32.8, -4, -17], [33.2, 40.9, 0, 11], [41.2, 45.6, -44, 13], [45.4, 48.9, 6, -9], [57.0, 63.0, 0, -4]]);
function camPoseS(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c;
  let y = 0, p = 0; for (const [a, b, yw, pt] of GL) { const k = ss(a, a + 0.9, t) * (1 - ss(b - 0.9, b, t)); y += yw * k; p += pt * k; }
  y += ss(33.2, 34.2, t) * (1 - ss(40, 40.9, t)) * LG(1, -1) * (14 - 28 * seg(t, 33.5, 40.5));   // sweep along the freezing shore
  y += ss(49.2, 50.2, t) * (1 - ss(56.4, 57.4, t)) * LG(1, -1) * (20 - 40 * seg(t, 49.5, 57));                                                // slow pan over the frozen plaza
  p += ss(49.2, 50.2, t) * (1 - ss(56.4, 57.4, t)) * -8;
  const jolt = ss(T_OUT, T_OUT + 0.1, t) * (1 - ss(T_OUT + 0.3, T_OUT + 1.6, t)), crack = ss(T_CRACK - 0.03, T_CRACK - 0.005, t) * (1 - ss(T_CRACK + 0.4, T_CRACK + 2.2, t)), shiver = 0.25 * ss(28, 40, t);
  const shake = 0.6 * jolt + 1.4 * crack + shiver;
  return {
    x: CAMX + n(0.31, 1, 0.04) + shake * n(29, 0, 0.02), y: BAL.y + 1.65 + n(0.43, 0.3, 0.02) - 0.08 * ss(26, 30, t) + shake * n(33, 2, 0.02), z: CAMZ + n(0.27, 2, 0.04),
    yaw: (LG(-4, 4) + y + n(0.21, 0.7, 0.6) + n(0.57, 2.1, 0.25) + shake * n(23, 3, 0.9)) * DEG,
    pitch: (-14 + p + n(0.33, 1.2, 0.35) + shake * n(37, 1, 1.2)) * DEG,
    roll: (n(0.27, 2.1, 0.35) + shake * n(19, 2, 1.0)) * DEG,
  };
}

function texFrond2() {   // a broad palm frond: midrib + many leaflets, alpha cut-out (from corre)
  return g3Tex((x, w, h) => {
    x.clearRect(0, 0, w, h); const R = RNG('frond');
    for (let i = 0; i < 46; i++) { const v = i / 46, py = h * (0.04 + 0.92 * v), L = w * 0.48 * Math.sin(Math.PI * Math.min(1, v * 1.15 + 0.08)) * R.r(0.85, 1.05);
      for (const s of [-1, 1]) { const g = x.createLinearGradient(w / 2, py, w / 2 + s * L, py + h * 0.06); g.addColorStop(0, '#3c6e2c'); g.addColorStop(1, R.f() < 0.15 ? '#9a8a40' : '#5e9440');
        x.fillStyle = g; x.beginPath(); x.moveTo(w / 2, py); x.quadraticCurveTo(w / 2 + s * L * 0.5, py - h * 0.004, w / 2 + s * L, py + h * 0.07); x.quadraticCurveTo(w / 2 + s * L * 0.5, py + h * 0.03, w / 2, py + h * 0.018); x.fill(); } }
    x.strokeStyle = '#6a7a3a'; x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke();
  }, 256, 512);
}

// ---- the plaza (built once on top of the harbour world)
let GS = null;
function gS() {
  if (GS) return GS;
  const g = g3(), scene = g.scene, R = RNG('plaza');
  // clear the luna houses where the plaza and the block stand; hide luna's roof terrace, its people, the wave, the car
  const inside = (hx, hz) => hx > PLZ.x0 - 4 && hx < PLZ.x1 + 4 && hz > -80 && hz < -24;
  for (let i = 0; i < g.nH; i++) { const [hx, hz] = g.hPos[i]; if (inside(hx, hz)) { g.hMat[i] = _hid.clone(); g.rMat[i] = _hid.clone(); g.houses.setMatrixAt(i, _hid); g.roofs.setMatrixAt(i, _hid); } }
  g.chim.forEach((ch, i) => { const [hx, hz] = g.hPos[ch[5]]; if (inside(hx, hz)) { g.cMat[i] = _hid.clone(); g.kMat[i] = _hid.clone(); g.chimI.setMatrixAt(i, _hid); g.capI.setMatrixAt(i, _hid); } });
  g.ants.forEach((a, i) => { const [hx, hz] = g.hPos[a[3]]; if (inside(hx, hz)) for (let k = 0; k < 3; k++) { g.aMat[i * 3 + k] = _hid.clone(); g.antI.setMatrixAt(i * 3 + k, _hid); } });
  [g.houses, g.roofs, g.chimI, g.capI, g.antI].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  scene.children.forEach((ch) => { if (ch.isGroup && Math.abs(ch.position.x - TERR.x) < 0.01 && Math.abs(ch.position.z - TERR.z) < 0.01) ch.visible = false; });
  for (const k in g.PM) { const m = g.PM[k]; for (let i = 0; i < m.count; i++) m.setMatrixAt(i, _hid); m.instanceMatrix.needsUpdate = true; }
  g.wave.visible = false; g.church.visible = false; g.car.visible = false; g.clouds.forEach((s) => (s.visible = false)); g.rubble.visible = false; g.debris.visible = false;
  // textures: stone paving (slabs, joints, wear), plaster, wood grain, bark rings
  const paving = wrap(g3Tex((x, w) => { const Rp = RNG('paving'); const n = 4, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = Rp.r(-16, 16); x.fillStyle = `rgb(${172 + v},${162 + v},${146 + v})`; x.fillRect(i * s, j * s, s, s);
      for (let k = 0; k < 6; k++) blot2(x, i * s + Rp.r(0, s), j * s + Rp.r(0, s), Rp.r(6, 26), `rgba(${Rp.f() < 0.5 ? '120,110,96' : '250,244,230'},0.16)`); }
    speck(x, w, w, 9000, ['rgba(80,70,60,0.18)', 'rgba(255,255,255,0.18)', 'rgba(140,120,100,0.15)'], Rp, 1, 2);
    x.fillStyle = 'rgba(70,62,54,0.75)'; for (let i = 0; i <= n; i++) { x.fillRect(i * s - 1.5, 0, 3, w); x.fillRect(0, i * s - 1.5, w, 3); } }, 256, 256), (PLZ.x1 - PLZ.x0) / 4, (PLZ.z0 - PLZ.z1) / 4);
  const plaster = wrap(g3Tex((x, w) => { const Rp = RNG('plaster'); x.fillStyle = '#ece0c8'; x.fillRect(0, 0, w, w); for (let k = 0; k < 40; k++) blot2(x, Rp.r(0, w), Rp.r(0, w), Rp.r(10, 60), `rgba(${Rp.f() < 0.5 ? '120,100,80' : '255,250,235'},0.12)`); speck(x, w, w, 18000, ['rgba(90,80,70,0.18)', 'rgba(255,255,255,0.2)'], Rp, 1, 2); }, 256, 256), 2, 1);
  const texGrain = (key, base, dark) => g3Tex((x, w, h) => { const Rg = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, h); for (let k = 0; k < 140; k++) { const y0 = Rg.r(0, h), a = Rg.r(0.05, 0.22); x.strokeStyle = `rgba(${dark},${a})`; x.lineWidth = Rg.r(0.6, 2.2); x.beginPath(); x.moveTo(0, y0); for (let s = 0; s <= w; s += 8) x.lineTo(s, y0 + Math.sin(s * 0.03 + k) * Rg.r(1, 5) + Math.sin(s * 0.11 + k * 2) * 1.2); x.stroke(); } }, 256, 256);
  const bark = wrap(g3Tex((x, w, h) => { const Rb = RNG('bark'); x.fillStyle = '#8a7458'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const y = i * h / 16; x.fillStyle = 'rgba(60,46,32,0.6)'; x.fillRect(0, y, w, 3); for (let k = 0; k < 20; k++) blot2(x, Rb.r(0, w), y + Rb.r(4, h / 16), Rb.r(3, 9), 'rgba(170,150,120,0.25)'); } speck(x, w, h, 3000, ['rgba(40,30,20,0.25)', 'rgba(200,180,150,0.2)'], Rb, 1, 3); }, 128, 256), 1, 1);
  const stoneM = STD({ map: paving, bumpMap: paving, bumpScale: 0.8, roughness: 0.85 }), plasterM = STD({ map: plaster, bumpMap: plaster, bumpScale: 1.2, roughness: 0.9 }), metal = STD({ color: 0x2a2e33, metalness: 0.6, roughness: 0.4 });
  const woodM = STD({ map: texGrain('bench', '#8a5a34', '40,22,10'), bumpMap: texGrain('bench', '#808080', '0,0,0'), bumpScale: 0.5, roughness: 0.7 });
  // the plaza slab, its edge wall and balustrade over the promenade; steps down at the front
  const slab = new THREE.Mesh(new THREE.BoxGeometry(PLZ.x1 - PLZ.x0, 8, PLZ.z0 - PLZ.z1), [plasterM, plasterM, stoneM, plasterM, plasterM, plasterM]); slab.position.set((PLZ.x0 + PLZ.x1) / 2, PLZ.y - 4, (PLZ.z0 + PLZ.z1) / 2); slab.receiveShadow = true; scene.add(slab);
  const balus = IM(new THREE.CylinderGeometry(0.07, 0.1, 0.75, 8), plasterM, 240), railTop = new THREE.Mesh(new THREE.BoxGeometry(PLZ.x1 - PLZ.x0, 0.12, 0.32), plasterM);
  { let n = 0; for (let x = PLZ.x0 + 0.3; x < PLZ.x1 && n < 240; x += 0.3) if (Math.abs(x - LG(10, -12)) > 2.5) balus.setMatrixAt(n++, M4c(x, PLZ.y + 0.38, PLZ.z1 + 0.2)); balus.count = n; }
  railTop.position.set((PLZ.x0 + PLZ.x1) / 2, PLZ.y + 0.8, PLZ.z1 + 0.2); railTop.castShadow = true; scene.add(balus, railTop);
  // the block you stand in: a plastered façade with windows, balconies on every floor; yours has a glass-and-steel railing
  const facT = wrap(texFacade(), 2, 2);
  const block = new THREE.Mesh(new THREE.BoxGeometry(22, BAL.y + 6, 16), STD({ map: facT, color: 0xf0e2c8, roughness: 0.9 })); block.position.set(BAL.x, (BAL.y + 6) / 2 + 0.5, BAL.z + 8); block.castShadow = true; block.receiveShadow = true; scene.add(block);
  const balS = IM(new THREE.BoxGeometry(4.2, 0.22, 2.0), plasterM, 12), balR = IM(new THREE.BoxGeometry(4.2, 0.06, 0.06), metal, 12), balG = IM(new THREE.BoxGeometry(4.2, 0.95, 0.03), new THREE.MeshPhysicalMaterial({ color: 0xbfd8e0, roughness: 0.05, transparent: true, opacity: 0.22 }), 12, false);
  { let n = 0; for (const fl of [0, -3.2, -6.4]) for (const dx of [-7, 0, 7]) { const x = BAL.x + dx, y = BAL.y + fl; balS.setMatrixAt(n, M4c(x, y - 0.11, BAL.z - 1.0)); balR.setMatrixAt(n, M4c(x, y + 1.05, BAL.z - 1.95)); balG.setMatrixAt(n, M4c(x, y + 0.55, BAL.z - 1.95)); n++; } balS.count = balR.count = balG.count = n; }
  scene.add(balS, balR, balG);
  const balPosts = IM(new THREE.BoxGeometry(0.05, 1.05, 0.05), metal, 12); for (let k = 0; k < 12; k++) balPosts.setMatrixAt(k, M4c(BAL.x - 2.05 + k * 0.37, BAL.y + 0.52, BAL.z - 1.95)); scene.add(balPosts);
  // the fountain: a stone basin, a pedestal, a bowl and a finial; the water in the basin; icicles that will grow from the bowl
  const F = new THREE.Group(); F.position.set(FOUNT.x, PLZ.y, FOUNT.z); scene.add(F);
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.5, 0.7, 48, 1, true), plasterM); basin.position.y = 0.35; basin.castShadow = true; F.add(basin);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.35, 0.2, 8, 64), plasterM); rim.rotation.x = Math.PI / 2; rim.position.y = 0.7; F.add(rim);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x2a7a96, roughness: 0.08, metalness: 0.1 }); const water = new THREE.Mesh(new THREE.CircleGeometry(4.25, 48), waterM); water.rotation.x = -Math.PI / 2; water.position.y = 0.55; F.add(water);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 1.8, 20), plasterM); ped.position.y = 0.9; ped.castShadow = true; F.add(ped);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 0.6, 0.5, 32), plasterM); bowl.position.y = 2.0; bowl.castShadow = true; F.add(bowl);
  const bowlW = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), waterM); bowlW.rotation.x = -Math.PI / 2; bowlW.position.y = 2.22; F.add(bowlW);
  const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.9, 12), plasterM); fin.position.y = 2.65; F.add(fin);
  const iceM = STD({ color: 0xdff0ff, roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.85 });
  const icicles = IM(new THREE.ConeGeometry(0.06, 1, 6).translate(0, -0.5, 0), iceM, 60, false); const icL = []; { const Ri = RNG('icicle'); for (let i = 0; i < 60; i++) { const a = i / 60 * TAU + Ri.r(0, 0.08), big = i < 36; icL.push({ a, r: big ? 1.68 : 4.4, y: big ? 1.76 : 0.6, L: big ? Ri.r(0.3, 1.2) : Ri.r(0.15, 0.4), t0: 27 + Ri.r(0, 4) }); } }
  icicles.frustumCulled = false; F.add(icicles);
  // the jets as real water: a central column and 8 arcs (tubes with streaks that flow; they stop and turn to ice)
  const streak = wrap(g3Tex((x, w, h) => { const Rs = RNG('streak'); x.fillStyle = '#9fc8e0'; x.fillRect(0, 0, w, h); for (let k = 0; k < 70; k++) { x.fillStyle = `rgba(255,255,255,${Rs.r(0.2, 0.7)})`; x.fillRect(Rs.r(0, w), Rs.r(0, h), Rs.r(1, 4), Rs.r(10, 50)); } }, 64, 256), 2, 3);
  const jetM = new THREE.MeshStandardMaterial({ map: streak, color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.1, emissive: 0x6a8aa0, emissiveIntensity: 0.25, depthWrite: false });
  const jets = [];
  { const pts = []; for (let k = 0; k <= 12; k++) pts.push(new THREE.Vector3(0, 2.4 + 3.2 * k / 12, 0)); const col = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.09, 8), jetM); F.add(col); jets.push(col);
    for (let j = 0; j < 8; j++) { const a = j / 8 * TAU, q = []; for (let k = 0; k <= 16; k++) { const u = k / 16, r = 4.05 - 2.5 * u; q.push(new THREE.Vector3(Math.sin(a) * r, 0.62 + 1.25 * Math.sin(u * Math.PI) - 0.2 * u, Math.cos(a) * r)); }
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(q), 24, 0.045, 6), jetM); F.add(m); jets.push(m); } }
  // palms around the plaza: ringed trunks, a crown of broad fronds (they brown and droop in the long cold)
  const PALMS = LG([[-36, -56], [-36, -72], [-22, -54], [12, -54], [26, -56], [26, -72], [-12, -74], [16, -74], [-28, -64], [22, -64]], [[-36, -58], [-36, -73], [-18, -54], [16, -54], [26, -58], [27, -73], [-16, -74], [10, -74], [-27, -65], [21, -64]]);
  const trunkM = STD({ map: bark, bumpMap: bark, bumpScale: 1.5, roughness: 0.95 }), frondM = STD({ map: texFrond2(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 });
  const ringI = IM(new THREE.CylinderGeometry(0.2, 0.25, 0.95, 10).translate(0, 0.45, 0), trunkM, PALMS.length * 10), frI = IM(new THREE.PlaneGeometry(1.6, 4.8).translate(0, 2.4, 0), frondM, PALMS.length * 14);
  const palmL = []; { const Rp = RNG('palms'); PALMS.forEach(([x, z], i) => { const hgt = Rp.r(7.5, 11), lean = Rp.r(-0.1, 0.1), leanZ = Rp.r(-0.08, 0.08);
    for (let k = 0; k < 10; k++) { const f = k / 10; ringI.setMatrixAt(i * 10 + k, M4c(x + lean * hgt * f * f, PLZ.y + f * hgt, z + leanZ * hgt * f * f, k * 0.7, 1 - f * 0.35, hgt / 9.5, 1 - f * 0.35, leanZ * 2 * f, -lean * 2 * f)); }
    const fr = []; for (let k = 0; k < 14; k++) fr.push({ a: k / 14 * TAU + Rp.r(0, 0.4), droop: Rp.r(0.55, 1.2), s: Rp.r(0.85, 1.15), ph: Rp.r(0, TAU) });
    palmL.push({ x: x + lean * hgt, z: z + leanZ * hgt, y: PLZ.y + hgt, fr }); }); }
  scene.add(ringI, frI); frI.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // benches round the fountain and along the sides; planters with shrubs; bins; plaza lanterns
  const BEN = []; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + 0.2; BEN.push([FOUNT.x + Math.sin(a) * 7.2, FOUNT.z + Math.cos(a) * 7.2, a + Math.PI]); }
  [[-31, -60, Math.PI / 2], [-31, -68, Math.PI / 2], [21, -60, -Math.PI / 2], [21, -68, -Math.PI / 2]].forEach((b) => BEN.push(b));
  const benS = IM(new THREE.BoxGeometry(1.8, 0.06, 0.5), woodM, BEN.length), benB = IM(new THREE.BoxGeometry(1.8, 0.45, 0.05), woodM, BEN.length), benL = IM(new THREE.BoxGeometry(0.06, 0.45, 0.5), metal, BEN.length * 2);
  BEN.forEach(([x, z, ry], i) => { benS.setMatrixAt(i, M4c(x, PLZ.y + 0.45, z, ry)); benB.setMatrixAt(i, M4c(x - Math.sin(ry) * 0.25, PLZ.y + 0.75, z - Math.cos(ry) * 0.25, ry)); for (const s of [-1, 1]) benL.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), M4c(x + Math.cos(ry) * 0.8 * s, PLZ.y + 0.22, z - Math.sin(ry) * 0.8 * s, ry)); });
  scene.add(benS, benB, benL);
  const potM = plasterM, leafM = STD({ color: 0x3a6a34, roughness: 0.9 }), shrubs = IM(new THREE.IcosahedronGeometry(0.5, 1), leafM, 80), pots = IM(new THREE.BoxGeometry(3.2, 0.6, 1.2), potM, 10);
  { const Rs = RNG('shrubs'); let n = 0; LG([[-30, -54], [-6, -54], [4, -54], [18, -66], [-18, -76.8 + 1.4], [6, -75.4]], [[30 - 60, -54], [6, -54], [-8, -54], [-20, -66], [18, -75.4], [-6, -75.4]]).forEach(([x, z], i) => { pots.setMatrixAt(i, M4c(x, PLZ.y + 0.3, z)); for (let k = 0; k < 9; k++) shrubs.setMatrixAt(n++, M4c(x + Rs.r(-1.3, 1.3), PLZ.y + 0.85 + Rs.r(0, 0.3), z + Rs.r(-0.4, 0.4), Rs.r(0, 6), Rs.r(0.7, 1.1), Rs.r(0.6, 0.9), Rs.r(0.7, 1.1))); }); pots.count = 6; shrubs.count = n; }
  scene.add(pots, shrubs);
  const LANT = []; for (let i = 0; i < 4; i++) for (const z of [-55, -73]) LANT.push([PLZ.x0 + 6 + i * 19.5, z]);
  const lpole = IM(new THREE.CylinderGeometry(0.07, 0.11, 4.2, 8).translate(0, 2.1, 0), metal, LANT.length), lhead = IM(new THREE.CylinderGeometry(0.25, 0.15, 0.55, 6), new THREE.MeshStandardMaterial({ color: 0x1a1c1e, emissive: 0xffd6a0, emissiveIntensity: 0 }), LANT.length);
  LANT.forEach(([x, z], i) => { lpole.setMatrixAt(i, M4c(x, PLZ.y, z)); lhead.setMatrixAt(i, M4c(x, PLZ.y + 4.4, z)); }); scene.add(lpole, lhead);
  const lantL = LANT.filter((_, i) => i % 2 === 0 || i === 3).map(([x, z]) => { const l = new THREE.PointLight(0xffc890, 0, 26, 1.6); l.position.set(x, PLZ.y + 4.2, z); scene.add(l); return l; });
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,200,0.85)'], [0.5, 'rgba(255,190,110,0.2)'], [1, 'rgba(255,170,90,0)']], 64);
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(LANT.flatMap(([x, z]) => [x, PLZ.y + 4.4, z]), 3));
  const lantGlow = new THREE.Points(lg, new THREE.PointsMaterial({ size: 3.2, map: glowTex, color: 0xffd7a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); lantGlow.renderOrder = 6; scene.add(lantGlow);
  const lpools = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), g.pools.material, LANT.length, false); LANT.forEach(([x, z], i) => lpools.setMatrixAt(i, M4c(x, PLZ.y + 0.03, z, 0, 12, 1, 12))); scene.add(lpools);
  // café tables with parasols on one side, an ice-cream cart; rusty oil drums (lit when the grid fails)
  const canvasT = g3Tex((x, w) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 3) { x.fillStyle = 'rgba(0,0,0,0.07)'; x.fillRect(i, 0, 1, w); x.fillRect(0, i, w, 1); } }, 128, 128);
  const paraC = STD({ map: canvasT, bumpMap: canvasT, bumpScale: 0.5, roughness: 0.85, side: THREE.DoubleSide });
  const CAFE = LG([[14, -58, '#c8372d'], [18, -62, '#f2ead8'], [14, -66, '#2a6a62'], [18, -70, '#c8372d']], [[-24, -58, '#1f4e8a'], [-28, -62, '#e8b23a'], [-24, -66, '#f2ead8'], [-28, -70, '#1f4e8a']]);
  const cafeT = IM(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 20), woodM, CAFE.length), cafeL = IM(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 8), metal, CAFE.length);
  const paras = CAFE.map(([x, z, c], i) => { cafeT.setMatrixAt(i, M4c(x, PLZ.y + 0.76, z)); cafeL.setMatrixAt(i, M4c(x, PLZ.y + 0.38, z)); const grp = new THREE.Group(); grp.position.set(x, PLZ.y, z); scene.add(grp);
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.6, 8), metal); pl.position.y = 1.3; grp.add(pl); const cn = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 12, 1, true), paraC.clone()); cn.material.color.set(c); cn.position.y = 2.55; cn.castShadow = true; grp.add(cn); return grp; });
  scene.add(cafeT, cafeL);
  const cart = new THREE.Group(); cart.position.set(LG(-20, 20), PLZ.y, -73); scene.add(cart); { const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.95, 0.9), STD({ color: 0xf2efe8, roughness: 0.5 })); body.position.y = 0.75; body.castShadow = true; cart.add(body);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.18, 0.92), STD({ color: 0xe86fa8 })); stripe.position.y = 0.95; cart.add(stripe); for (const s of [-1, 1]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), metal); wh.rotation.x = Math.PI / 2; wh.position.set(s * 0.6, 0.28, 0.48); cart.add(wh); }
    const um = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.5, 10, 1, true), paraC.clone()); um.material.color.set('#f2c94c'); um.position.y = 2.4; cart.add(um); const up = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), metal); up.position.y = 1.7; cart.add(up); }
  const drumT = wrap(g3Tex((x, w, h) => { const Rd = RNG('drum'); x.fillStyle = '#5a3a24'; x.fillRect(0, 0, w, h); for (let k = 0; k < 60; k++) blot2(x, Rd.r(0, w), Rd.r(0, h), Rd.r(4, 18), Rd.pick(['rgba(140,70,30,0.4)', 'rgba(40,30,25,0.4)', 'rgba(90,100,90,0.3)'])); x.fillStyle = 'rgba(30,20,15,0.6)'; for (const y of [0.15, 0.5, 0.85]) x.fillRect(0, y * h, w, 4); }, 128, 128), 1, 1);
  const drums = BARRELS.map(([x, z]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), STD({ map: drumT, bumpMap: drumT, bumpScale: 1, roughness: 0.7, metalness: 0.3 })); m.position.set(x, PLZ.y + 0.45, z); m.castShadow = true; scene.add(m);
    const light = new THREE.PointLight(0xff8a40, 0, 16, 2); light.position.set(x, PLZ.y + 1.6, z); scene.add(light); return { m, light, x, z }; });
  // people: walkers, people on the benches, kids round the fountain, couples at the balustrade, two neighbours on the balconies
  const PG = g.PG, NP = 64, PMs = {}; for (const k in PG) { const [geo, n, , mat] = PG[k]; const m = IM(geo.clone(), mat.clone(), NP * n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); PMs[k] = m; }
  const SHIRT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#c2185b', '#f4f1ea', '#a8402a'], PANTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#4a3a2a', '#6a7a8a'], SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'], HAIR = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#b8b0a8'];
  const pp = [], RP = RNG(LG('plazaPeople', 'plazaPeopleEN'));
  const mk = (o) => { const skin = lin(RP.pick(SKIN)), shirt = lin(RP.pick(SHIRT)), pants = lin(RP.pick(PANTS)), shorts = RP.f() < 0.35, longS = RP.f() < 0.3;
    const c = { skin, shirt, pants, shin: shorts ? skin : pants, sleeve: shirt, fore: longS ? shirt : skin, shoe: lin(RP.pick(['#1e1e22', '#f2f0ea', '#5a4030'])), hair: lin(RP.pick(HAIR)) };
    const bi = pp.length % BARRELS.length;
    pp.push(Object.assign({ s: RP.r(0.94, 1.06), w: RP.r(0.9, 1.15), ph: RP.r(0, TAU), c, react: RP.r(0.15, 0.6), phone: RP.f() < 0.45, point: RP.f() < 0.2, panic: RP.f() < 0.55, kneels: RP.f() < 0.2, runs: RP.f() < 0.55,
      barrel: bi, slotA: RP.r(0, TAU), slotR: RP.r(1.1, 2.0), dG: RP.r(0, 1.2), dL: RP.r(0, 2.4), edge: RP.f() < 0.5 ? -1 : 1 }, o)); };
  { let tries = 0; while (pp.length < 30 && tries++ < 500) { const x = RP.r(PLZ.x0 + 3, PLZ.x1 - 3), z = RP.r(PLZ.z1 + 2, PLZ.z0 - 2), a = RP.r(0, TAU), v = RP.r(0.9, 1.5), L = v * T_OUT;
    const x1 = x + Math.sin(a) * L, z1 = z + Math.cos(a) * L; if (x1 < PLZ.x0 + 2 || x1 > PLZ.x1 - 2 || z1 > PLZ.z0 - 1.5 || z1 < PLZ.z1 + 1.5) continue; if (Math.hypot(x - FOUNT.x, z - FOUNT.z) < 5.5 || Math.hypot(x1 - FOUNT.x, z1 - FOUNT.z) < 5.5) continue;
    mk({ kind: 'walk', x, z, a, v, kid: false }); } }
  BEN.forEach(([x, z, ry], i) => { if (i % 3 === 2) return; mk({ kind: 'sit', x: x + Math.cos(ry) * 0.4, z: z - Math.sin(ry) * 0.4, yaw: ry, runs: i % 2 === 1 }); if (i % 2 === 0) mk({ kind: 'sit', x: x - Math.cos(ry) * 0.45, z: z + Math.sin(ry) * 0.45, yaw: ry, runs: false }); });
  for (let k = 0; k < 4; k++) mk({ kind: 'kid', a0: k * 1.6, r: 5.4 + k * 0.3, v: 0.55 + k * 0.05, s: RP.r(0.6, 0.72), kid: true, runs: k % 2 === 0 });
  LG([[-8, -75.2], [-7.4, -75.2], [8, -75.3], [8.6, -75.3], [-26, -75.2]], [[10, -75.2], [10.6, -75.2], [-6, -75.3], [-5.4, -75.3], [22, -75.2]]).forEach(([x, z]) => mk({ kind: 'stand', x, z, yaw: 0, runs: false }));
  CAFE.forEach(([x, z], i) => { mk({ kind: 'sit', x: x + 0.75, z, yaw: -Math.PI / 2, runs: false }); if (i % 2 === 0) mk({ kind: 'sit', x: x - 0.75, z, yaw: Math.PI / 2, runs: false }); });
  // two neighbours right by you: one on your balcony at the rail, one on the next balcony
  mk({ kind: 'near', x: BAL.x - 1.3, z: BAL.z - 1.55, y: BAL.y, yaw: 0.3, phone: true, point: false, panic: false, kneels: false, runs: false, inT: 47.5 });
  mk({ kind: 'near', x: BAL.x + LG(7.4, -7.4), z: BAL.z - 1.5, y: BAL.y, yaw: LG(0.5, -0.5), phone: false, point: true, panic: true, kneels: false, runs: false, inT: 46.2 });
  pp.length = Math.min(pp.length, NP);
  pp.forEach((q, i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PMs[k].setColorAt(i * PG[k][1] + j, q.c[PG[k][2]]); });
  // volumetric afternoon clouds (unlit sprites — they vanish into the black with the light)
  const cloudTex = [0, 1, 2].map((v) => g3Tex((x, w) => { const Rs = RNG('cloudV', v);
    for (let i = 0; i < 160; i++) { const a = Rs.r(0, TAU), d = Math.pow(Rs.f(), 0.6) * w * 0.36, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.62, s = Rs.r(w * 0.05, w * 0.13) * (1.15 - d / (w * 0.5));
      const g2 = x.createRadialGradient(px, py - s * 0.45, 0, px, py, s), top = py < w / 2; g2.addColorStop(0, `rgba(255,255,255,${top ? 0.6 : 0.34})`); g2.addColorStop(0.6, `rgba(${top ? '238,236,240' : '170,176,196'},${Rs.r(0.18, 0.3)})`); g2.addColorStop(1, 'rgba(150,160,180,0)');
      x.fillStyle = g2; x.fillRect(px - s, py - s, 2 * s, 2 * s); } }, 256, 256));
  const vclouds = []; { const Rv = RNG(LG('vcloudSun', 'vcloudSunEN')); for (let c = 0; c < 16; c++) { const az = Rv.r(-60, 60) * DEG, D = Rv.r(1400, 5200), cx = Math.sin(az) * D, cz = CAMZ - Math.cos(az) * D, cy = Rv.r(380, 1100), size = Rv.r(260, 620), n = 6 + Math.floor(Rv.f() * 6);
    for (let k = 0; k < n; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex[k % 3], transparent: true, depthWrite: false, fog: false, opacity: 0.8 }));
      s.position.set(cx + Rv.n(size * 0.55), cy + Rv.n(size * 0.14) + (k === 0 ? size * 0.12 : 0), cz + Rv.n(size * 0.4)); s.userData = { w: size * Rv.r(0.6, 1.05), o: Rv.r(0.55, 0.9) }; s.scale.set(s.userData.w, s.userData.w * 0.62, 1); s.renderOrder = 2; scene.add(s); vclouds.push(s); } } }
  // the Sun: a white-hot disc and a warm glow (sprites far out along SUN)
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.45, 'rgba(255,255,250,1)'], [0.55, 'rgba(255,248,230,0.6)'], [1, 'rgba(255,240,210,0)']], 128), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff0d8, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.6 }));
  [sunDisc, sunGlow].forEach((s) => { s.renderOrder = -1; scene.add(s); });
  // the Milky Way: a dense band of faint stars and a soft glow along a great circle
  const mw = (() => { const Rm = RNG('milky'), n = 12000, hz = 5000, p = new Float32Array((n + hz) * 3), col = new Float32Array((n + hz) * 3);
    const u = dirV(LG(-75, 75) * DEG, 4 * DEG), v0 = dirV(LG(-10, 10) * DEG, 31 * DEG), w = new THREE.Vector3().crossVectors(u, v0).normalize(), v = new THREE.Vector3().crossVectors(w, u).normalize();
    for (let i = 0; i < n + hz; i++) { const a = Rm.r(0, TAU), core = 0.5 + 0.5 * Math.cos(a - 0.6), sp = (i < n ? 0.07 : 0.1) * (0.6 + 0.8 * core) * Rm.n(1) * (1 + 0.3 * Math.sin(a * 5));
      const d = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a)).addScaledVector(w, sp).normalize().multiplyScalar(19000); p.set([d.x, d.y, d.z], i * 3);
      const b = i < n ? Rm.r(0.15, 0.7) ** 2 * (0.6 + 0.6 * core) : 0.011 * (0.4 + core); const warm = Rm.f() < 0.4; col.set([b * (warm ? 1 : 0.8), b * 0.88, b * (warm ? 0.75 : 1)], i * 3); }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(p.subarray(0, n * 3), 3)); gg.setAttribute('color', new THREE.BufferAttribute(col.subarray(0, n * 3), 3));
    const tex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']], 32);
    const m1 = new THREE.Points(gg, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, map: tex, blending: THREE.AdditiveBlending }));
    const gh = new THREE.BufferGeometry(); gh.setAttribute('position', new THREE.BufferAttribute(p.slice(n * 3), 3)); gh.setAttribute('color', new THREE.BufferAttribute(col.slice(n * 3), 3));
    const m2 = new THREE.Points(gh, new THREE.PointsMaterial({ size: 70, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, map: g3Radial([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], 64), blending: THREE.AdditiveBlending }));
    const grp = new THREE.Group(); grp.add(m1, m2); m1.renderOrder = m2.renderOrder = -1; scene.add(grp); return { grp, m1, m2 }; })();
  // snow: flakes in a box round the camera, falling and drifting (wrapped)
  const SNN = 6000, snP = new Float32Array(SNN * 3), snG = new THREE.BufferGeometry(); snG.setAttribute('position', new THREE.BufferAttribute(snP, 3));
  const snow = new THREE.Points(snG, new THREE.PointsMaterial({ size: 0.11, map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']], 32), color: 0xe8eef8, transparent: true, depthWrite: false, fog: true })); snow.frustumCulled = false; snow.renderOrder = 7; scene.add(snow);
  const snL = []; { const Rn = RNG('snow'); for (let i = 0; i < SNN; i++) snL.push([Rn.r(-35, 35), Rn.r(0, 50), Rn.r(-60, 4), Rn.r(0.8, 1.6), Rn.r(0, TAU), Rn.r(0.6, 1.6)]); }
  GS = { lantL, jets, jetM, streak, slab, F, water, bowlW, waterM, icicles, icL, iceM, ringI, frI, frondM, palmL, lhead, lantGlow, lpools, LANT, drums, PMs, pp, vclouds, sunDisc, sunGlow, mw, snow, snP, snG, snL, glowTex, BEN };
  return GS;
}

// a person: walk / sit; ears = hands to the head (panic); bend; kneel; lie; lookUp; point (right arm up at the sky);
// phone (left forearm up, a screen light in the hand); hug (arms wrapped round the chest, cold); warm (hands out to a fire)
function poseS(PMx, PG, i, o) {
  const { x, y, z, yaw, s, w } = o, walk = o.walk || 0, p = o.p || 0, ears = o.ears || 0, sit = !!o.sit, bend = o.bend || 0, kneel = o.kneel || 0, lie = o.lie || 0, sway = o.sway || 0;
  const lookUp = o.lookUp || 0, point = o.point || 0, phone = o.phone || 0, hug = o.hug || 0, warm = o.warm || 0;
  const rock = (bend + kneel) * 0.08 * Math.sin(TT * 3.1 + sway) + hug * 0.03 * Math.sin(TT * 9 + sway);
  let base = M4().compose(_v.set(x, y - 0.44 * kneel, z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(s * w, s, s * w)), put = (k, j, m) => PMx[k].setMatrixAt(i * PG[k][1] + j, _m.copy(m));
  if (lie > 0) base = base.multiply(Tr(0, 0.15 * lie, 0)).multiply(Rz(1.45 * lie * (sway > Math.PI ? 1 : -1)));
  const A = 0.42 * walk, Ak = 0.5 * walk, Aa = 0.35 * walk, by = sit ? 0.5 : 0.92, up = base.clone().multiply(Tr(0, by, 0)).multiply(Rx(0.85 * bend + rock - 0.12 * lookUp)).multiply(Tr(0, -by, 0));
  let hand = null;
  for (const j of [0, 1]) { const hip = sit ? -1.45 : lerp((j ? 1 : -1) * Math.sin(p) * A, -0.05, kneel), knee = sit ? 1.5 : lerp(0.04 + Ak * Math.max(0, Math.sin(p + 1.7 + (j ? Math.PI : 0))), 1.62, kneel);
    const hipY = sit ? 0.48 : 0.9, th = base.clone().multiply(Tr(j ? 0.095 : -0.095, hipY, 0)).multiply(Rx(hip)), sn = th.clone().multiply(Tr(0, -0.44, 0)).multiply(Rx(knee));
    put('thigh', j, th); put('shin', j, sn); put('shoe', j, sn.clone().multiply(Rx(sit ? -0.1 : -knee * 0.4 - hip * 0.3)));
    const pt = j === 1 ? point : 0, ph = j === 0 ? phone : 0, free = (1 - ears) * (1 - pt) * (1 - ph);
    const sh = ((j ? -1 : 1) * Math.sin(p) * Aa - (sit ? 0.5 : 0)) * free * (1 - hug) * (1 - warm) - 0.25 * ears - 2.7 * pt - 0.55 * ph - 0.75 * hug - 1.05 * warm, sg = j ? 1 : -1, side = sg * (0.09 + 1.25 * ears + 0.25 * pt - 0.12 * hug);
    const ua = up.clone().multiply(Tr(j ? 0.2 : -0.2, (sit ? 0.98 : 1.4), 0)).multiply(Rz(side)).multiply(Rx(sh));
    const fa = ua.clone().multiply(Tr(0, -0.29, 0)).multiply(Rz(-sg * 2.45 * ears - sg * 1.75 * hug)).multiply(Rx(-0.3 * free * (1 - hug) - 1.25 * ph - 0.4 * warm - 0.9 * hug));
    put('uarm', j, ua); put('farm', j, fa); put('hand', j, fa); if (ph > 0.5) hand = new THREE.Vector3().setFromMatrixPosition(fa.clone().multiply(Tr(0, -0.32, 0))); }
  put('hips', 0, base.clone().multiply(Tr(0, by, 0))); put('torso', 0, up.clone().multiply(Tr(0, by + 0.02, 0)).multiply(Rx(0.06 * ears)));
  put('neck', 0, up.clone().multiply(Tr(0, by + 0.53, 0))); const hd = up.clone().multiply(Tr(0, by + 0.68, 0)).multiply(Rx(0.18 * ears + 0.25 * bend - 0.62 * lookUp + 0.35 * phone * (1 - lookUp) + 0.2 * hug)).multiply(M4().makeRotationY(0.25 * Math.sin(TT * 2.3 + sway) * ears));
  put('head', 0, hd); put('hair', 0, hd.clone().multiply(Tr(0, 0.025, -0.012))); put('hairB', 0, hd.clone().multiply(Tr(0, -0.08, -0.07)));
  return { hand, head: new THREE.Vector3().setFromMatrixPosition(hd) };
}

// one plaza person's state at time t (pure function of t): where they are and how they react
function plazaPose(q, t) {
  const r = q.react, stop = T_OUT + r;
  let x = q.x, z = q.z, yaw = q.yaw || 0, walk = 0, sit = q.kind === 'sit', y = q.y !== undefined ? q.y : PLZ.y, p = t * 5.6 + q.ph, hidden = false;
  if (q.kind === 'walk') { const tw = Math.min(t, stop); x = q.x + Math.sin(q.a) * q.v * tw; z = q.z + Math.cos(q.a) * q.v * tw; yaw = q.a; walk = t < stop ? 1 : 0; }
  if (q.kind === 'kid') { const tw = Math.min(t, stop), a = q.a0 + q.v * tw / q.r * 3; x = FOUNT.x + Math.sin(a) * q.r; z = FOUNT.z + Math.cos(a) * q.r; yaw = a + Math.PI / 2; walk = t < stop ? 1.3 : 0; p = tw * 8 + q.ph;
    if (t > 12.2) { const k = ss(12.2, 13.2, t); yaw = a + Math.PI / 2 + k * 1.2; } }
  // runners: panic at 15.5 — they run off the plaza's sides
  const go = (t0, v, ex) => { const a = t - t0; if (a <= 0) return false; const tx = ex * 56, d = Math.abs(tx - x), k = Math.min(1, (v * a) / Math.max(1, d)); x = lerp(x, tx, k); yaw = ex > 0 ? Math.PI / 2 : -Math.PI / 2; walk = k < 1 ? v / 2.4 : 0; p = a * 9 + q.ph; sit = false; if (Math.abs(x) > 50) hidden = true; return true; };
  if (q.runs && go(T_OUT + 0.5 + q.dG * 1.2, 5.2, q.edge)) return { x, y, z, yaw, walk, p, sit: false, hidden, run: 1 };
  if (q.kind === 'near') { if (t > q.inT) hidden = true; }
  // the fires: from 41.5 people walk to the oil drums and stand in a ring, hands out
  const g0 = 41.6 + q.dG, inRing = q.kind !== 'near' && t > g0;
  if (inRing) { const [bx, bz] = BARRELS[q.barrel], sx = bx + Math.sin(q.slotA) * q.slotR, sz = bz + Math.cos(q.slotA) * q.slotR, k = EZ.io(seg(t, g0, g0 + 2.4));
    x = lerp(x, sx, k); z = lerp(z, sz, k); sit = false; walk = k > 0 && k < 1 ? 1 : 0; yaw = k < 1 ? Math.atan2(sx - x, sz - z) : Math.atan2(bx - sx, bz - sz); p = t * 6 + q.ph;
    // the fires die (51-52.5): they leave, one by one
    if (go(52.2 + q.dL, 2.0, q.edge)) return { x, y, z, yaw, walk, p, sit: false, hidden, run: 0 }; }
  const lookUp = ss(stop + 0.4, stop + 1.0, t) * (1 - ss(18.6, 19.6, t)) + 0.85 * ss(19.8, 21, t) * (1 - ss(24.4, 25.6, t));
  return { x, y, z, yaw, walk, p, sit, hidden, run: 0, lookUp,
    ears: q.panic ? ss(stop + 0.2, stop + 0.6, t) * (1 - ss(17.4, 18.4, t)) : 0,
    point: q.point ? ss(12.6, 13.1, t) * (1 - ss(15.4, 16, t)) + ss(20, 20.6, t) * (1 - ss(23.6, 24.4, t)) : 0,
    phone: q.phone ? ss(11.8 + r, 12.3 + r, t) * (1 - ss(24, 25, t)) : 0,
    kneel: q.kneels && !sit ? ss(12.0, 12.8, t) * (1 - ss(18, 18.8, t)) : 0, bend: q.panic ? 0.35 * ss(stop + 0.5, stop + 1.2, t) * (1 - ss(17.4, 18.4, t)) : 0,
    hug: ss(26 + r * 3, 28 + r * 3, t) * (1 - ss(g0, g0 + 1, t) * (q.kind !== 'near' ? 1 : 0)),
    warm: q.kind !== 'near' ? ss(g0 + 2.4, g0 + 3, t) * (1 - ss(51.2, 52, t)) : 0 };
}

// ---- the frame
function updateSun() {
  const g = g3(), o = gS(), t = TT, c = camPoseS(t);
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.fov = 64; g.cam.updateProjectionMatrix();
  g.sky.position.copy(g.cam.position); g.stars.position.copy(g.cam.position); o.mw.grp.position.copy(g.cam.position);
  const day = 1 - ss(T_OUT, T_OUT + 0.12, t), adapt = ss(13, 22, t), grid = ss(11.7, 12.3, t) * (1 - ss(44.8, 45.6, t)), snowing = ss(33, 35, t) * (1 - 0.6 * ss(47, 50, t)), snowCover = ss(27, 33, t) * 0.3 + ss(34, 41, t) * 0.6;
  const fires = ss(42.2, 43.2, t) * (1 - ss(51, 52.5, t)), cold = clamp((15 - coldT(t)) / 88);
  // the sky: afternoon blue → black in a blink; the stars and the Milky Way come out as your eyes adjust
  const su = g.skyU, night = { top: '#010206', mid: '#03050b', hor: '#060912' };
  su.top.value.copy(C3(night.top, LG('#3a78d0', '#5a6ab8'), day)); su.mid.value.copy(C3(night.mid, LG('#7fb2ea', '#a8a8dc'), day)); su.hor.value.copy(C3(night.hor, LG('#d6e6f2', '#f0d8c8'), day));
  su.moonDir.value.copy(SUN); su.halo.value = 1.1 * day; su.haloW.value = 0.003; su.fire.value = 0.22 * grid * (1 - day); su.fireCol.value.copy(lin('#3a2614')); su.dark.value = 0;
  g.stars.material.opacity = ss(12.6, 21, t); g.stars.material.size = 3.6; g.stars.material.color.setScalar(1.8); o.mw.m1.material.color.setScalar(2.2); g.stars.visible = t > 12.5; o.mw.grp.visible = t > 17; o.mw.m1.material.opacity = ss(18, 24, t); o.mw.m2.material.opacity = ss(19, 25, t) * 0.9;
  o.sunDisc.visible = o.sunGlow.visible = day > 0; o.sunDisc.position.copy(g.cam.position).addScaledVector(SUN, 15000); o.sunDisc.scale.setScalar(15000 * 0.03); o.sunGlow.position.copy(o.sunDisc.position); o.sunGlow.scale.setScalar(15000 * 0.22); o.sunGlow.material.opacity = 0.55 * day;
  o.vclouds.forEach((s) => { s.visible = day > 0; s.material.opacity = s.userData.o * day; });
  // the Moon: pale in the afternoon sky; lit until the last sunlight it reflects reaches you (12.4 s), then dark
  const mDir = MOON_DIR, RM = MOON_D * Math.sin(1.6 * DEG); g.moonG.visible = t < 20; g.moonG.position.copy(g.cam.position).addScaledVector(mDir, MOON_D); g.moonG.scale.setScalar(RM); g.moonG.lookAt(g.cam.position);
  const mu = g.moonU; mu.uCrack.value = 0; mu.uHeat.value = 0; mu.uCool.value = 0; mu.uLit.value = lerp(0.85, 1.6, 1 - day) * (1 - ss(T_MOON, T_MOON + 0.5, t)) + 0.0;
  // fog and light
  g.scene.fog.color.copy(C3('#05070c', LG('#cfe0ee', '#ecdcd0'), day).lerp(lin('#151a22'), snowing * 0.8)); g.scene.fog.near = lerp(lerp(300, 400, day), 30, snowing); g.scene.fog.far = lerp(lerp(7000, 14000, day), 700, snowing) + 2000 * ss(49, 55, t);
  g.key.target.position.set(-5, 0, -64); g.key.target.updateMatrixWorld(); g.key.position.copy(g.key.target.position).addScaledVector(SUN.clone().setY(0.25).normalize(), 500);
  if (!g.key.userData.boxed) { Object.assign(g.key.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 200, far: 900 }); g.key.shadow.camera.updateProjectionMatrix(); g.key.shadow.bias = -0.0004; g.key.shadow.normalBias = 0.4; g.key.userData.boxed = true; }
  g.key.color.set(LG('#fff0d8', '#ffe2c0')); g.key.intensity = 2.6 * day;
  g.fill.intensity = 0; g.hemi.color.copy(C3('#5a6e98', LG('#b8d4f4', '#d8c8e8'), day)); g.hemi.groundColor.copy(C3('#0a0c10', '#7a6a58', day)); g.hemi.intensity = day * 0.7 + (1 - day) * (0.2 + 0.22 * adapt + 0.25 * snowCover);
  g.r.toneMappingExposure = 1.0 + (1 - day) * (0.5 * adapt) - 0.9 * ss(61.5, 62.8, t);
  // the town's lights: a few windows by day; every window and street lamp on in the dark; the grid fails block by block (41.5-47)
  WIN.uOn.value = lerp(0.22, 0.78, ss(11.7, 12.8, t)); WIN.uT.value = t; WIN.uPow.value = lerp(0.12, 1.0, 1 - day) * (t > 11.6 && t < 12.4 ? (Math.sin(t * 61) > -0.2 ? 1 : 0.2) : 1); WIN.uDead.value = 1.02 * seg(t, 41.6, 47.2) + (t > 47.2 ? 0.1 : 0);
  g.lamps.material.opacity = 0.55 * grid; g.hillL.material.opacity = 0.5 * grid * (1 - ss(42, 44, t) * 0.3); g.pools.visible = grid > 0.05; g.pools.material.opacity = grid;
  o.lantGlow.material.opacity = grid * (t > 44.2 && t < 45.6 ? (Math.sin(t * 47) > 0 ? 1 : 0.15) : 1); o.lhead.material.emissiveIntensity = 1.6 * o.lantGlow.material.opacity; o.lpools.visible = grid > 0.05; o.lantL.forEach((l) => (l.intensity = 1.1 * o.lantGlow.material.opacity));
  g.beamPivot.visible = t > 13 && t < 44.5; g.beamPivot.rotation.y = t * 1.1; g.beamMat.uniforms.uA.value = ss(13, 14, t) * (1 - ss(43.8, 44.5, t));
  // snow settles; the fountain freezes; icicles grow; the palms brown and droop
  SNOW.value = snowCover;
  o.waterM.color.copy(C3('#2a7a96', '#c8dce8', ss(26.5, 30, t))); o.waterM.roughness = lerp(0.08, 0.5, ss(26.5, 30, t));
  { const I = o.icicles; o.icL.forEach((k, i) => { const L = k.L * ss(k.t0, k.t0 + 4, t); I.setMatrixAt(i, L < 0.01 ? _hid : M4c(Math.sin(k.a) * k.r, k.y, Math.cos(k.a) * k.r, 0, 1, L, 1)); }); I.instanceMatrix.needsUpdate = true; }
  { const dead = ss(48, 56, t), sag = ss(30, 56, t) * 0.4 + dead * 0.6; o.frondM.color.copy(C3('#ffffff', '#8a6a3a', dead * 0.85)); let n = 0;
    o.palmL.forEach((pl) => pl.fr.forEach((f) => { const wind = day * 0.06 * Math.sin(t * 1.3 + f.ph); o.frI.setMatrixAt(n++, new THREE.Matrix4().compose(_v.set(pl.x, pl.y, pl.z), _q.setFromEuler(_e.set(f.droop + sag * (1.9 - f.droop) * 0.8 + wind, f.a, 0, 'YXZ')), _s.set(f.s, f.s * (1 - 0.15 * dead), f.s))); })); o.frI.instanceMatrix.needsUpdate = true; }
  // the sea: blue with sun glitter; black; then the ice grows out from the shore (33-41) and the boats lock in
  const ice = t < 33.2 ? 0 : 0.02 + 0.98 * EZ.io(seg(t, 33.2, 41.5)), sea = g.seaMat.uniforms; sea.uT.value = t < 25 ? t : 25 + (t - 25) * 0.35; sea.uLevel.value = 0.3; g.seaMesh.position.y = 0.3;
  sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.uFire.value = 0; sea.uDark.value = 0; sea.uToeOn.value = 0; sea.uFlood.value = 0; sea.uChurn.value = 0;
  sea.uMoon.value.copy(day > 0 ? SUN : MOON_DIR); sea.uMoonCol.value.copy(lin(day > 0 ? '#fff4e0' : '#c8d4ff')); sea.uGlit.value = day > 0 ? 1.5 : 0.5 * (1 - ss(T_MOON, T_MOON + 0.5, t)); sea.uGK.value = 300;
  sea.uShallow.value.copy(C3('#060a10', LG('#1f8a9a', '#2a8a8a'), day)); sea.uMid.value.copy(C3('#04070c', LG('#1260a0', '#1a5a8a'), day)); sea.uDeep.value.copy(C3('#03050a', LG('#0a3e7a', '#0e3a6a'), day)); sea.uFar.value.copy(C3('#05070c', LG('#8ab4d8', '#c8b0b0'), day));
  sea.uIce.value = ice; sea.uIceCol.value.copy(lin('#34404e').lerp(lin('#56647a'), snowCover).multiplyScalar(1 - 0.35 * ss(44.8, 46, t) + 0.15 * fires));
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  g.boats.forEach((b) => { const frozen = ss(-30, 0, ice * 2600 - (QZ - b.z) + 30 * Math.sin(b.x * 0.013)), lock = Math.min(frozen, 1), tb = lerp(t, 34 + (QZ - b.z) / 2600 * 8, lock);
    b.grp.position.set(b.x, 0.3 - 0.4 * b.D + 0.08 * Math.sin(tb * 1.3 + b.ph) + 0.1 * lock, b.z); b.grp.rotation.set(0.04 * lock * b.roll, b.yaw, 0.04 * Math.sin(tb * 1.1 + b.ph) + 0.05 * lock * b.roll); });
  // people
  const PG = g.PG, PMs = o.PMs, hands = [], heads = [];
  o.pp.forEach((q, i) => { const st = plazaPose(q, t); if (st.hidden) { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PMs[k].setMatrixAt(i * PG[k][1] + j, _hid); return; }
    const r = poseS(PMs, PG, i, { x: st.x, y: st.y, z: st.z, yaw: st.yaw, s: q.s, w: q.w, walk: st.walk, p: st.p, sit: st.sit, ears: st.ears, bend: 0.25 * (st.hug || 0) + (st.bend || 0), kneel: st.kneel, sway: q.ph, lookUp: st.lookUp, point: st.point, phone: st.phone, hug: st.hug, warm: st.warm });
    if (r.hand && t > 11.8) hands.push([r.hand, q.ph]); if (t > 25.5 && t < 57) heads.push([r.head, q.ph, st.yaw]); });
  for (const k in PMs) PMs[k].instanceMatrix.needsUpdate = true;
  // fires in the oil drums: warm light on the snow and the faces
  o.drums.forEach((d, i) => { d.light.intensity = 5 * fires * (0.85 + 0.15 * Math.sin(t * 11 + i * 2) + 0.08 * Math.sin(t * 23 + i)); });
  // snow falling round the camera
  o.snow.visible = snowing > 0.02; if (o.snow.visible) { const P = o.snP; o.snL.forEach(([x0, y0, z0, v, ph, dr], i) => { const yy = mod(y0 - v * t, 50) - 25; P[i * 3] = c.x + mod(x0 + Math.sin(t * 0.6 * dr + ph) * 1.2 + t * 0.8 + 35, 70) - 35; P[i * 3 + 1] = c.y + yy; P[i * 3 + 2] = c.z + z0 + Math.cos(t * 0.5 * dr + ph) * 0.8; });
    o.snG.attributes.position.needsUpdate = true; o.snow.material.opacity = snowing * 0.95; o.snow.material.color.copy(C3('#5a6070', '#e8eef8', 0.3 + 0.7 * Math.max(adapt, fires * 0.5))); }
  // ---- sprites: fountain jets (they freeze in place), phone screens, breath, drum fires and smoke
  let si = 0, fi = 0, mi = 0, bi = 0; const SP = g.sprays, FL = g.flames, SM = g.smokes, BL = g.billows;
  const put = (pool, idx, x, y, z, sc, op, col, rot = 0) => { if (idx >= pool.length || op <= 0.004) return idx; const s = pool[idx]; s.visible = true; s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.min(1, op); s.material.color.set(col); s.material.rotation = rot; return idx + 1; };
  { const fz = ss(26.5, 29.5, t); o.streak.offset.y = -(t < 27.5 ? t : 27.5 + 0.5 * Math.min(1, (t - 27.5) / 2) * 2) * 1.6; o.jetM.color.copy(C3('#ffffff', '#e8f6ff', fz)); o.jetM.opacity = lerp(0.6, 0.92, fz); o.jetM.emissive.copy(C3('#6a8aa0', '#9ab8d0', fz)); o.jetM.emissiveIntensity = day > 0 ? 0.25 : 0.12 + 0.35 * fz * Math.max(adapt, snowCover); o.jetM.roughness = lerp(0.1, 0.35, fz); }
  { const fz = ss(26.5, 29.5, t), tj = t < 27.5 ? t : 27.5 + (t - 27.5) * Math.max(0, 1 - (t - 27.5) / 2) * 0.5, Fx = FOUNT.x, Fz = FOUNT.z, Y = PLZ.y, R = RNG('jets');
    const jcol = day > 0 ? '#ffffff' : C3('#3a4a5a', '#cfe6ff', fz * (0.4 + 0.6 * Math.max(adapt, snowCover))).getStyle(), jop = (day > 0 ? 0.55 : 0.18 + 0.4 * fz * adapt);
    for (let k = 0; k < 30; k++) { const a = mod(tj * 0.9 + k / 30, 1), h = 2.4 + 3.2 * (a * (2 - a)); si = put(SP, si, Fx + R.n(0.05) * (1 + a), Y + h * Math.min(1, a * 3), Fz + R.n(0.05) * (1 + a), 0.4 + 0.5 * a, jop * 0.4 * (1 - a * 0.5) * (1 - 0.7 * fz), jcol, R.r(0, 6)); }
    for (let j = 0; j < 8; j++) { const ang = j / 8 * TAU; for (let k = 0; k < 4; k++) { const a = mod(tj * 0.8 + k / 4 + j * 0.13, 1), r = 4.0 - 2.4 * a, hh = 0.7 + 1.1 * Math.sin(a * Math.PI); si = put(SP, si, Fx + Math.sin(ang) * r, Y + hh, Fz + Math.cos(ang) * r, 0.3 + 0.2 * a, jop * 0.35 * (1 - fz), jcol, R.r(0, 6)); } }
    if (t < 30) for (let k = 0; k < 14; k++) { const a = mod(t * 1.3 + k / 14, 1); si = put(SP, si, Fx + R.n(1.2), Y + 2.25 + a * 0.2, Fz + R.n(1.2), 0.5 + a, 0.3 * (1 - a) * day + 0.1 * (1 - fz) * (1 - day), jcol, R.r(0, 6)); } }
  hands.forEach(([h, ph]) => { const fl = grid > 0.5 || t < 25 ? 1 : 0.6; fi = put(FL, fi, h.x, h.y, h.z, 0.4, 0.95 * fl, '#eef4ff'); fi = put(FL, fi, h.x, h.y, h.z, 1.8, 0.22 * fl, '#b8c8ff'); });
  heads.forEach(([h, ph, yaw]) => { const a = mod(t * 0.33 + ph / TAU, 1); if (a > 0.45) return; const k = a / 0.45; mi = put(SM, mi, h.x + Math.sin(yaw) * (0.15 + 0.4 * k), h.y - 0.02 + 0.12 * k, h.z + Math.cos(yaw) * (0.15 + 0.4 * k), 0.12 + 0.35 * k, 0.28 * Math.sin(k * Math.PI) * (0.4 + 0.6 * Math.max(adapt, fires)), '#dfe6ee', ph); });
  o.drums.forEach((d, i) => { const R = RNG('drumfl', i); if (fires > 0) for (let k = 0; k < 16; k++) { const u = R.r(-0.18, 0.18), w = R.r(-0.18, 0.18), age = mod(t * R.r(1.4, 2.4) + R.f(), 1), h = 0.05 + age * R.r(0.5, 1.1);
      fi = put(FL, fi, d.x + u + Math.sin(t * 7 + k) * 0.04, PLZ.y + 0.92 + h, d.z + w, R.r(0.3, 0.55) * (1 - age * 0.6), fires * 0.6 * Math.sin(age * Math.PI), age < 0.4 ? '#ffd080' : '#ff7a30'); }
    if (t > 42.5 && t < 57) for (let k = 0; k < 10; k++) { const a = mod(t * 0.35 + k / 10, 1); mi = put(SM, mi, d.x + Math.sin(a * 3 + k) * 0.2 * a, PLZ.y + 1.5 + a * 4.5, d.z + a * 0.6, 0.4 + a * 1.6, 0.45 * (1 - a) * Math.max(fires, 0.6 * ss(51, 52, t) * (1 - ss(54, 57, t))), fires > 0.3 ? '#5a4a40' : '#9a9a9a', a * 2); } });
  for (; si < SP.length; si++) SP[si].visible = false; for (; fi < FL.length; fi++) FL[fi].visible = false; for (; mi < SM.length; mi++) SM[mi].visible = false; for (; bi < BL.length; bi++) BL[bi].visible = false;
  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: motion blur, bloom, the sun's lens flare, your breath, frost on the glass and its crack, HUD, title, captions, end card
function motionBlur(t) {
  const a = camPoseS(t), b = camPoseS(t - 1 / 48), f = (H / 2) / Math.tan(32 * DEG);
  let dx = -Math.atan2(Math.sin(a.yaw - b.yaw), Math.cos(a.yaw - b.yaw)) * f, dy = (a.pitch - b.pitch) * f; const L = Math.hypot(dx, dy); if (L < 3) return;
  const k = Math.min(1, 90 / L); dx *= k; dy *= k; const g = g3(); ctx.save(); screen();
  for (let i = 1; i <= 6; i++) { ctx.globalAlpha = 0.16 * (1 - i / 8); ctx.drawImage(g.cv, -dx * i / 6, -dy * i / 6, W, H); } ctx.restore();
}
let BLC = null;
function bloom(amt) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = 'brightness(0.62) contrast(2.4) blur(9px)'; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
function lensFlare(t) {
  if (t >= T_OUT) return; const g = g3(), s = g.cam.position.clone().addScaledVector(SUN, 5000).project(g.cam); if (s.z > 1) return;
  const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, on = clamp(1.4 - Math.hypot(s.x, s.y) * 0.8); if (on <= 0.01) return;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  pvGlow(x, y, 560, 'rgba(255,250,236,0.55)', on); pvGlow(x, y, 130, 'rgba(255,255,255,0.95)', on);
  ctx.globalAlpha = 0.35 * on; ctx.strokeStyle = '#fff8ee'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI + 0.2, L = 280 + 120 * Math.sin(i * 2.1); ctx.lineWidth = i % 3 ? 1.5 : 3; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * L, y - Math.sin(a) * L); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke(); }
  const vx = CX - x, vy = H / 2 - y; [[0.35, 46, '255,210,150', 0.2], [0.6, 90, '170,210,255', 0.12], [0.85, 30, '255,180,130', 0.25], [1.25, 130, '200,180,255', 0.08], [1.6, 60, '255,220,160', 0.14], [1.9, 18, '255,255,255', 0.3]].forEach(([f, r, col, a]) => {
    const gx = x + vx * f, gy = y + vy * f, gr = ctx.createRadialGradient(gx, gy, r * 0.5, gx, gy, r); gr.addColorStop(0, `rgba(${col},${a * 0.4 * on})`); gr.addColorStop(0.85, `rgba(${col},${a * on})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, r, 0, TAU); ctx.fill(); });
  ctx.restore();
}
// your own breath in the cold: a soft cloud rising from the bottom of the frame every ~3.4 s
function breath2D(t) { const on = ss(25.5, 28, t) * (1 - ss(57.5, 59, t)); if (on <= 0) return; const a = mod(t + 0.6, 3.4); if (a > 1.6) return; const k = a / 1.6, R = RNG('breath', Math.floor((t + 0.6) / 3.4));
  ctx.save(); screen(); for (let i = 0; i < 14; i++) { const x = CX + R.n(120) + R.n(60) * k, y = H + 60 - k * R.r(420, 720), r = R.r(120, 260) * (0.5 + k); const g2 = ctx.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, `rgba(225,232,240,${0.06 * on * Math.sin(k * Math.PI)})`); g2.addColorStop(1, 'rgba(225,232,240,0)'); ctx.fillStyle = g2; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); } ctx.restore(); }
// frost on the lens: feathery ice ferns grow in from the edges (54-61), then the glass cracks (T_CRACK)
let FROST = null;
function frostCanvas() { if (FROST) return FROST; FROST = document.createElement('canvas'); FROST.width = W; FROST.height = H; const x = FROST.getContext('2d'), R = RNG('frost');
  const fern = (px, py, a, L, w, depth) => { let cx = px, cy = py, ang = a; const st = 9; for (let s = 0; s * st < L; s++) { const nx = cx + Math.cos(ang) * st, ny = cy + Math.sin(ang) * st; x.strokeStyle = `rgba(236,244,255,${0.35 + 0.3 * (1 - s * st / L)})`; x.lineWidth = w * (1 - 0.6 * s * st / L); x.beginPath(); x.moveTo(cx, cy); x.lineTo(nx, ny); x.stroke();
      if (depth > 0 && s % 2 === 1) for (const sd of [-1, 1]) fern(nx, ny, ang + sd * R.r(0.9, 1.15), (L - s * st) * R.r(0.25, 0.42), w * 0.6, depth - 1); cx = nx; cy = ny; ang += R.n(0.08); } };
  x.lineCap = 'round';
  for (let i = 0; i < 110; i++) { const side = i % 4, u = R.f(); let px, py, a; if (side === 0) { px = u * W; py = -10; a = Math.PI / 2; } else if (side === 1) { px = W + 10; py = u * H; a = Math.PI; } else if (side === 2) { px = u * W; py = H + 10; a = -Math.PI / 2; } else { px = -10; py = u * H; a = 0; }
    fern(px, py, a + R.n(0.5), R.r(180, 520), R.r(2, 4), 2); }
  for (let i = 0; i < 4000; i++) { const px = R.r(0, W), py = R.r(0, H), e = Math.min(px, W - px, py, H - py) / (H / 2); if (R.f() < e * 1.8) continue; x.fillStyle = `rgba(240,248,255,${R.r(0.1, 0.4)})`; x.fillRect(px, py, R.r(1, 3), R.r(1, 3)); }
  return FROST; }
let FRM = null;
function frost2D(t) { const k = ss(53.5, 61, t); if (k <= 0) return; if (!FRM) { FRM = document.createElement('canvas'); FRM.width = W; FRM.height = H; } const m = FRM.getContext('2d'), fc = frostCanvas();
  m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.fillStyle = `rgba(215,228,240,${0.28 * k})`; m.fillRect(0, 0, W, H); m.drawImage(fc, 0, 0);
  const r0 = lerp(1.25, 0.12, k) * H / 2, gm = m.createRadialGradient(CX, H * 0.47, r0 * 0.75, CX, H * 0.47, r0 * 1.15 + 40); gm.addColorStop(0, 'rgba(0,0,0,0)'); gm.addColorStop(1, 'rgba(0,0,0,1)');
  m.globalCompositeOperation = 'destination-in'; m.fillStyle = gm; m.fillRect(0, 0, W, H); m.globalCompositeOperation = 'source-over';
  ctx.save(); screen(); ctx.drawImage(FRM, 0, 0); ctx.restore();
  if (t >= T_CRACK - 0.02) crackGlass(t); }
function crackGlass(t) {
  const R = RNG('crack'), cx = CX - 120, cy = H * 0.46, grow = t >= T_CRACK - 0.02 ? 1 : 0, rays = [];
  ctx.save(); screen(); ctx.lineCap = 'round';
  for (let i = 0; i < 19; i++) { const a0 = i / 19 * TAU + R.n(0.15), L = R.r(500, 1400) * grow, pts = [[cx, cy]]; let a = a0, px = cx, py = cy;
    for (let s = 0; s < 14; s++) { a += R.n(0.12); const st = L / 14; px += Math.cos(a) * st; py += Math.sin(a) * st; pts.push([px, py]); } rays.push(pts); }
  const line = (pts, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
  rays.forEach((p) => { line(p, 5, 'rgba(20,30,40,0.3)'); line(p, 2, 'rgba(240,248,255,0.9)'); });
  for (let ring = 1; ring <= 5; ring++) for (let i = 0; i < rays.length; i++) { const A = rays[i], B = rays[(i + 1) % rays.length], idx = Math.min(A.length - 1, ring * 2 + (R.f() < 0.5 ? 1 : 0)); if (R.f() < 0.25) continue;
    const p = [A[idx], [(A[idx][0] + B[idx][0]) / 2 + R.n(12), (A[idx][1] + B[idx][1]) / 2 + R.n(12)], B[Math.min(B.length - 1, idx + (R.f() < 0.5 ? 0 : 1))]]; line(p, 3, 'rgba(20,30,40,0.25)'); line(p, 1.3, 'rgba(240,248,255,0.75)'); }
  const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80); g2.addColorStop(0, 'rgba(255,255,255,0.8)'); g2.addColorStop(0.5, 'rgba(235,245,255,0.35)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fillRect(cx - 80, cy - 80, 160, 160);
  for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), d = R.r(10, 120), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; ctx.fillStyle = `rgba(255,255,255,${R.r(0.3, 0.8)})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + R.n(8), y + R.n(8)); ctx.lineTo(x + R.n(8), y + R.n(8)); ctx.fill(); }
  ctx.restore();
}
const fmtT = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function hud() { const t = TT;
  if (t >= 4.4 && t < T_OUT + 0.6) { const s = t < 5 ? 500 : Math.max(0, 500 * (1 - (t - 5) / (T_OUT - 5))); pvHud(LG('Última luz del Sol en', "The Sun's last light in"), fmtT(s), LG('cámara rápida ×83', 'sped up 83×'), ev(4.4, 0.5) * (1 - ev(T_OUT + 0.2, 0.3))); }
  if (t >= 12.8 && t < 24.9) pvHud(LG('Velocidad de la Tierra', "Earth's speed"), LG('107.000 km/h', '67,000 mph'), LG('ya sin órbita', 'no orbit anymore'), ev(12.8, 0.5) * (1 - ev(24.5, 0.4)));
  if (t >= 25.2 && t < 57.4) { const T = coldT(t), d = dayT(t), sub = d < 1 ? LG('hoy', 'today') : d < 60 ? LG(`día ${Math.round(d)}`, `day ${Math.round(d)}`) : d < 364 ? LG(`mes ${Math.round(d / 30.4)}`, `month ${Math.round(d / 30.4)}`) : LG('un año después', 'one year later');
    const v = SUNEN ? `${Math.round(T * 9 / 5 + 32)} °F` : `${T < -0.5 ? '−' : ''}${Math.abs(Math.round(T))} °C`; pvHud(LG('Temperatura', 'Temperature'), v, sub, ev(25.2, 0.5) * (1 - ev(57.0, 0.4))); } }
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(112, Math.floor(100 * 740 / wmax)), lh = size * 1.14, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 62, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  const a = ev(63.8, 0.7), b = ev(64.4, 0.8), c2 = ev(65.0, 0.8), d = ev(66.6, 0.6), d2 = ev(67.6, 0.5), e = ev(68.3, 0.6);
  const f = () => {
    pvGlow(CX, 760, 520 + 90 * Math.max(0, TT - 63.8), 'rgba(255,214,150,0.28)', a * (0.75 + 0.25 * Math.sin(TT * 1.3)));
    pvFeather(CX, 760, 520, 280, 0.8 * a);
    pvText(LG('La luz del Sol tarda', 'Sunlight takes'), CX, 630, 56, { italic: true, align: 'center', alpha: a });
    pvText(LG('8 min 20 s', '8 min 20 s'), CX, 770, 116, { align: 'center', alpha: b });
    pvText(LG('en llegar hasta ti.', 'to reach your eyes.'), CX, 890, 54, { align: 'center', alpha: c2 });
    ctx.save(); screen(); ctx.globalAlpha = 0.5 * c2; ctx.fillStyle = '#e0c8a0'; ctx.fillRect(CX - 60, 935, 120, 3); ctx.restore();
    pvFeather(CX, 1090, 500, 110, 0.7 * d);
    pvText(LG('y tranquilo, esto nunca pasará', "and relax, this will never happen"), CX, 1080, LG(48, 46), { italic: true, align: 'center', alpha: d });
    pvText(LG('... o si?', '... or will it?'), CX, 1150, 58, { italic: true, align: 'center', alpha: d2 });
    pvText(LG('ALTERBASE.ESP', 'ALTERBASE'), CX, 1450, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
// captions sized to stay clear of the phone UI on the right (≤ 760 px wide)
function capFit(str, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w));
    pvFeather(CX, 1374, 570, 120, a); pvText(str, CX, 1390, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function sceneSun() {
  const t = TT;
  if (t < 62.95) { updateSun(); motionBlur(t); lensFlare(t); bloom(0.3 + 0.2 * (t > T_OUT ? 1 : 0)); breath2D(t); frost2D(t); }
  if (t >= T_OUT && t < T_OUT + 0.25) pvTint('#000000', 0.6 * (1 - seg(t, T_OUT, T_OUT + 0.25)));
  if (t >= T_CRACK - 0.02 && t < T_CRACK + 0.2) pvTint('#eef6ff', 0.6 * (1 - seg(t, T_CRACK - 0.02, T_CRACK + 0.2)));
  if (t >= 62 && t < 63) pvTint('#030406', ss(62, 62.95, t));
  if (t >= 62.95) fillAll('#030406');
  if (t >= 63.6) endCard();
  hud();
  bigTitle(LG(['¿Que pasaría si el', 'Sol desapareciera?'], ['What if the Sun', 'just disappeared?']), 0.3, 4.8);
  capFit(LG('El Sol ya no existe.', 'The Sun is gone.'), 5.3, 8.0);
  capFit(LG('Su última luz aún viene en camino.', 'Its last light is still on its way.'), 8.2, 10.9);
  capFit(LG('Todo queda a oscuras.', 'Everything goes dark.'), 11.5, 13.7);
  capFit(LG('La Luna también se apaga.', 'The Moon goes dark too.'), 13.9, 18.8);
  capFit(LG('La Tierra sale disparada en línea recta.', 'Earth flies off in a straight line.'), 19.4, 24.9);
  capFit(LG('Entonces llega el frío.', 'Then the cold sets in.'), 25.4, 32.8);
  capFit(LG('El mar se congela.', 'The sea freezes over.'), 33.4, 40.8);
  capFit(LG('La red eléctrica falla.', 'The power grid fails.'), 41.4, 48.8);
  capFit(LG('Y sigue haciendo más frío.', 'And it keeps getting colder.'), 49.4, 56.8);
}
