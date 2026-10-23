
// =====================================================================
//  CITY — the ring of buildings around the park (old domed blocks, the skyline of towers) and its failures:
//  the domes burst open (28-30 s); the towers lean and are drawn toward the centre (44-47 s).
// =====================================================================
function buildCity(st, S, R) {
  // the city around the park: old blocks with domes (each dome in 8 petals that can burst open), towers behind
  S.domes = []; const ow = ['#e0c8a0', '#d8b088', '#ecd8b8', '#c8a07a', '#e4c4a4', '#d0b898']; let k = 0;
  for (let x = -140; x <= 140; x += 22) { const z = -175 - R.r(0, 20), w = R.r(16, 21), fl = 4 + Math.floor(R.f() * 3); building(st, x, z, w, 16, 0, 700 + k, ow[k % 6], fl, Math.max(3, Math.round(w / 3.4)), { gH: 5, balc: true, lit: 0.1, roofCol: '#8a5a40' }); const h = 5 + fl * 3.4 + 0.9;
    if (k % 2 === 0) { const d = new THREE.Group(); d.position.set(x, h + 0.2, z); st.scene.add(d); d.add(mesh(new THREE.CylinderGeometry(3.2, 3.4, 2.4, 24), stoneM('drum', '#e8dcc4'), 0, 1.2, 0)); d.scale.setScalar(1.5); const pet = []; const dm = STDm({ color: k % 4 ? '#5a8a8a' : '#c8a050', metalness: 0.5, roughness: 0.4 });
      for (let q = 0; q < 8; q++) { const pg = new THREE.Group(); pg.position.y = 2.4; pg.rotation.y = q / 8 * TAU; d.add(pg); const pm = mesh(new THREE.SphereGeometry(3.2, 8, 10, -TAU / 16, TAU / 8, 0, Math.PI / 2), dm, 0, 0, 0); pg.add(pm); pet.push(pg); } d.add(mesh(new THREE.ConeGeometry(0.25, 1.6, 8), GOLD(), 0, 6.2, 0)); S.domes.push({ d, pet, ts: 28.3 + (S.domes.length % 3) * 0.2 }); }
    k++; }
  S.towers = []; for (let i = 0; i < 46; i++) { const x = R.r(-360, 360), z = -260 - R.r(0, 260), h = R.r(60, 190), w = R.r(18, 34), m = winLit(R.pick(['#a8b0b8', '#c8c0b4', '#8a929a', '#b8b0a4']), i % 9); m.userData.U.uLit.value = 0.1; const tg = new THREE.Group(); tg.position.set(x, 0, z); st.scene.add(tg); tg.add(mesh(new THREE.BoxGeometry(w, h, w).translate(0, h / 2, 0), m)); if (i % 3 === 0) tg.add(mesh(new THREE.BoxGeometry(w * 0.6, h * 0.2, w * 0.6).translate(0, h * 1.1, 0), m)); S.towers.push({ tg, h, lean: R.r(0.08, 0.2) * (x < 0 ? 1 : -1), lz: R.n(0.08) }); }
  [-1, 1].forEach((s) => { for (let z = 0; z > -160; z -= 24) building(st, s * R.r(95, 110), z, 20, 16, s > 0 ? -Math.PI / 2 : Math.PI / 2, 800 + k++, ow[k % 6], 4 + (k % 3), 5, { gH: 5, balc: true, lit: 0.1, roofCol: '#8a5a40' }); });
}
function poseCity(S, t) {
  // domes can't close: they burst open like petals
  S.domes.forEach((d) => { const k = ss(d.ts, d.ts + 1.2, t); d.pet.forEach((pg, q) => { pg.rotation.order = 'YXZ'; pg.rotation.x = -1.9 * k * (0.8 + 0.2 * Math.sin(q * 2.3)); pg.position.y = 2.4 + 1.2 * k; }); });
  // the planet: the city's towers lean as the ground has too much length
  { const k = ss(44.2, 47.5, t); S.towers.forEach((w) => { w.tg.rotation.z = w.lean * k; w.tg.rotation.x = w.lz * k; }); }
}
