
// =====================================================================
//  CITY — a downtown of glass towers (curtain-wall facades that reflect the sky), a river with a cable-stayed bridge,
//  an avenue with a traffic jam (cars, a city bus, a delivery truck), people on the sidewalks, birds.
//  The avenue runs along x at z = 0; the river crosses at x = 260; towers stand on both sides.
// =====================================================================
const SUN_DAY = dirV(-30 * DEG, 38 * DEG);
function curtainTex(base, seed) { return g3Tex((x, w, h) => { const R = RNG('curt' + seed); x.fillStyle = base; x.fillRect(0, 0, w, h); const cw = w / 8, ch = h / 16;
  for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { const l = R.r(-18, 18), g = x.createLinearGradient(c * cw, r * ch, c * cw + cw, r * ch + ch); g.addColorStop(0, `rgba(${150 + l},${185 + l},${215 + l},0.9)`); g.addColorStop(1, `rgba(${60 + l},${90 + l},${120 + l},0.9)`); x.fillStyle = g; x.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 6);
    if (R.f() < 0.15) { x.fillStyle = 'rgba(255,240,210,0.35)'; x.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 6); } }
  x.fillStyle = 'rgba(30,34,40,0.9)'; for (let r = 0; r <= 16; r++) x.fillRect(0, r * ch - 2, w, 4); for (let c = 0; c <= 8; c++) x.fillRect(c * cw - 1, 0, 2, h); }, 256, 512); }
function buildCity(st) {
  const R = RNG('city'), S = { st };
  const blocksT = wrap(g3Tex((x, w) => { const Rb = RNG('blocks'); x.fillStyle = '#5a5c60'; x.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = Rb.pick(['#8a8478', '#7a7a74', '#9a9288', '#5f7a48', '#6a8450', '#8a8c90']); x.fillRect(i * 64 + 6, j * 64 + 6, 52, 52); } }, 512, 512), 60, 60); const ground = new THREE.Mesh(new THREE.PlaneGeometry(24000, 24000).rotateX(-Math.PI / 2), STDm({ map: blocksT, roughness: 0.95 })); ground.receiveShadow = true; st.scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(24000, 16).rotateX(-Math.PI / 2), STDm({ map: wrap(asphaltTex(), 3000, 2), roughness: 0.9 })); road.position.y = 0.02; road.receiveShadow = true; st.scene.add(road);
  const lm = STDm({ color: '#f0f0ea' }); for (let x = -2000; x < 2000; x += 8) [-2.6, 2.6].forEach((z) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.15).rotateX(-Math.PI / 2), lm); l.position.set(x, 0.03, z); st.scene.add(l); });
  [-9, 9].forEach((z) => { const w = new THREE.Mesh(new THREE.BoxGeometry(4000, 0.2, 2).translate(0, 0.1, 0), STDm({ color: '#b8b2a6' })); w.position.z = z; w.receiveShadow = true; st.scene.add(w); });
  // towers: curtain-wall glass (metallic, reflects the env map), stone towers with windows, setbacks and crowns
  const glassMs = ['#2a3a4a', '#3a4a58', '#24323e', '#4a5560'].map((c, i) => STDm({ map: wrap(curtainTex(c, i), 1, 1), metalness: 0.75, roughness: 0.15, envMapIntensity: 1.2 })), stoneMs = ['#d8d0c4', '#c8bca8', '#e0d8cc', '#b8b0a4'].map((c) => windowsMat(c));
  const tower = (x, z, w, d, h) => { const glassy = R.f() < 0.6, m = glassy ? R.pick(glassMs).clone() : R.pick(stoneMs); if (glassy) { m.map = m.map.clone(); m.map.needsUpdate = true; m.map.repeat.set(w / 12, h / 24); }
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), m); b.position.set(x, 0, z); b.castShadow = b.receiveShadow = true; st.scene.add(b);
    if (h > 90 && R.f() < 0.6) { const h2 = R.r(15, 40), b2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h2, d * 0.7).translate(0, h2 / 2, 0), m); b2.position.set(x, h, z); b2.castShadow = true; st.scene.add(b2); const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, R.r(10, 30), 8).translate(0, 10, 0), STDm({ color: '#c8ccd2', metalness: 0.8, roughness: 0.3 })); sp.position.set(x, h + h2, z); st.scene.add(sp); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 1.2, d + 0.6), STDm({ color: '#3a3e44' })); top.position.set(x, h + 0.6, z); st.scene.add(top); };
  for (let x = -600; x < 240; x += R.r(26, 40)) [-1, 1].forEach((s) => { const w = R.r(18, 28), d = R.r(18, 28), nearC = Math.exp(-(((x - 0) / 260) ** 2)); tower(x, s * (11 + d / 2 + R.r(0, 4)), w, d, R.r(30, 70) + nearC * R.r(60, 190)); });
  for (let k = 0; k < 220; k++) { const x = R.r(-900, 900), z = R.f() < 0.5 ? R.r(-700, -60) : R.r(60, 700); if (Math.abs(x - 260) < 70) continue; tower(x, z, R.r(20, 40), R.r(20, 40), R.r(25, 160) * Math.exp(-((Math.hypot(x, z) / 700) ** 2)) + 20); }
  // street trees along both sidewalks
  { const tr = STDm({ color: '#4a3a2c' }), crowns = IM(lumpyGeo(3, 0.25, 31), STDm({ map: leafTex('ctl', '#2e5a22'), roughness: 0.95 }), 900), cards = IM(new THREE.PlaneGeometry(1, 1), STDm({ map: leafCardTex(), alphaTest: 0.5, side: THREE.DoubleSide }), 18000), trunks = IM(new THREE.CylinderGeometry(0.12, 0.2, 1, 8).translate(0, 0.5, 0), tr, 160); let nc = 0, nk = 0, nt = 0;
    for (let x = -700; x < 700 && nt < 160; x += 9) { if (Math.abs(x - 260) < 75) continue; [-10.6, 10.6].forEach((z) => { if (nt >= 160) return; const h = R.r(6, 8.5), cr = h * 0.3; trunks.setMatrixAt(nt++, M4c(x + R.n(0.8), 0.2, z, 0, 1, h * 0.6, 1));
      for (let j = 0; j < 5; j++) { const a = R.r(0, TAU), r = j ? R.r(0.3, 0.7) * cr : 0, s = cr * (j ? 0.55 : 0.75); crowns.setMatrixAt(nc, M4c(x + Math.cos(a) * r, h * 0.7, z + Math.sin(a) * r, R.r(0, 6), s, s * 0.85, s)); crowns.setColorAt(nc++, lin('#4a5a40')); }
      for (let j = 0; j < 110; j++) { const v = new THREE.Vector3(R.n(1), R.n(0.75), R.n(1)).normalize(); cards.setMatrixAt(nk, M4c(x + v.x * cr, h * 0.7 + v.y * cr * 0.85, z + v.z * cr, R.r(0, TAU), cr * 0.6, cr * 0.6, cr * 0.6, R.r(-1.2, 1.2))); cards.setColorAt(nk++, lin('#ffffff').multiplyScalar(0.75 + 0.4 * Math.max(0, v.y))); } }); }
    trunks.count = nt; crowns.count = nc; cards.count = nk; trunks.castShadow = crowns.castShadow = cards.castShadow = true; st.scene.add(trunks, crowns, cards); }
  S.clouds = addSkyClouds(st, 40, 0, 0, 2500, 7000, 900, 1700, 'city');
  // the river and the bridge (the avenue becomes the bridge deck)
  const rv = new THREE.Mesh(new THREE.PlaneGeometry(120, 24000).rotateX(-Math.PI / 2), STDm({ color: '#1e4a5a', metalness: 0.6, roughness: 0.12, envMapIntensity: 1.4 })); rv.position.set(260, -6, 0); st.scene.add(rv);
  const bankM = STDm({ color: '#8a8478' }); [200, 320].forEach((x) => { const bk = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 24000), bankM); bk.position.set(x, -2, 0); st.scene.add(bk); });
  const cut = new THREE.Mesh(new THREE.BoxGeometry(120, 7.9, 24000), STDm({ color: '#1e4a5a' })); cut.position.set(260, -10, 0); st.scene.add(cut); ground.position.y = 0; // the ground is above the river trench at the banks
  const deck = new THREE.Mesh(new THREE.BoxGeometry(124, 1.2, 18), STDm({ color: '#9a968e' })); deck.position.set(260, -0.6, 0); deck.castShadow = true; st.scene.add(deck);
  const steel = STDm({ color: '#e8e6e0', metalness: 0.5, roughness: 0.4 }); [[235, 0], [285, 0]].forEach(([x]) => { [-10, 10].forEach((z) => { const t = new THREE.Mesh(new THREE.BoxGeometry(2.2, 48, 2.2).translate(0, 24, 0), steel); t.position.set(x, 0, z); t.castShadow = true; st.scene.add(t); });
    const cross = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 22), steel); cross.position.set(x, 44, 0); st.scene.add(cross);
    for (let k = 1; k <= 9; k++) [-1, 1].forEach((dir) => [-10, 10].forEach((z) => { const a = new THREE.Vector3(x, 46 - k * 3.6, z), b = new THREE.Vector3(x + dir * k * 5.5, 0.6, z); const L = a.distanceTo(b), c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, L, 6), steel); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); st.scene.add(c); })); });
  // the jam: cars in four lanes, a city bus, a truck; drivers looking up
  S.jam = []; const cols = ['#c8372d', '#2a2e36', '#e8e6e0', '#2f6fd1', '#7a8a96', '#1f3a2a', '#d8b030', '#5a2a4a'];
  for (let k = 0; k < 70; k++) { const lane = [-6.5, -2.2, 2.2, 6.5][k % 4], x = -160 + Math.floor(k / 4) * 9 + R.r(-1.5, 1.5); if (Math.abs(x - 40) < 9 && Math.abs(lane - 2.2) < 0.1) continue; const c = buildSedan(R.pick(cols)); c.position.set(x, 0, lane); c.rotation.y = lane > 0 ? 0 : Math.PI; st.scene.add(c); S.jam.push(c); }
  const bus = new THREE.Group(); { const bm = STDm({ color: '#e8b830', roughness: 0.4, metalness: 0.2 }), win = STDm({ color: '#1a2430', roughness: 0.1, metalness: 0.5 }); const b = new THREE.Mesh(new THREE.BoxGeometry(12, 3.0, 2.6).translate(0, 1.8, 0), bm); b.castShadow = true; bus.add(b); const w = new THREE.Mesh(new THREE.BoxGeometry(11.6, 1.1, 2.62).translate(0, 2.3, 0), win); bus.add(w);
    [-4, 4].forEach((x) => [-1.2, 1.2].forEach((z) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 20), STDm({ color: '#16161a' })); t.rotation.x = Math.PI / 2; t.position.set(x, 0.5, z); bus.add(t); })); bus.position.set(40, 0, 2.2); st.scene.add(bus); } S.bus = bus;
  const tr = buildTruck(); tr.position.set(70, 0, -2.2); tr.rotation.y = Math.PI; st.scene.add(tr);
  // drivers out of their cars, looking up; people on the sidewalks
  S.ppl = []; for (let k = 0; k < 16; k++) { const P = makePerson({ female: R.f() < 0.5, skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(['bob', 'short', 'pony', 'curly', 'long']), top: R.pick(['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f1ea', '#1f2d3d']), bottom: R.pick(['#2b3a55', '#3a3a3a', '#c8b89a']), seed: 600 + k }); st.scene.add(P.root); S.ppl.push({ P, x: R.r(10, 80), z: R.f() < 0.5 ? R.r(8.4, 9.6) : -R.r(8.4, 9.6), ph: R.r(0, 6), k }); }
  return S; }
function poseCity(S, ts, carX) { S.ppl.forEach((p) => { const look = clamp(1 - Math.abs(p.x - carX) / 40); posePerson(p.P, { x: p.x, z: p.z, yaw: p.z > 0 ? Math.PI : 0, headPitch: -0.5 * look, headYaw: 0.4 * Math.sin(p.ph) * look, armL: look > 0.4 && p.k % 3 === 0 ? [2.2, 0.3, 1.6] : null, armR: look > 0.4 && p.k % 2 === 0 ? [1.5, 0.1, 1.4] : null, emo: { surprise: look, open: look * 0.8 } }); }); }
