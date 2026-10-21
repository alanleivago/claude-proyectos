
// ===================== 10. SCHOOL (78-88): a training classroom; Ana (a teacher) learns to be a line technician =====================
SHOT_FN.school = (lt, dur, t) => {
  const S = once('school', () => { const st = makeStage({ hemi: 0.9, sky: 0xf0ece4, ground: 0x6a5a48, key: 2.0, keyCol: '#fff0d8', box: 10 }); st.setSun(dirV(-60 * DEG, 25 * DEG)); st.scene.background = lin('#c8d0d8');
    plane(st, 14, 14, STDm({ map: wrap(texTiles('ctile', '#c8c0b0', 'rgba(120,110,100,0.4)', 2), 7, 7) }), 0, 0, 0); const wallM = STDm({ color: '#e8e0cc' });
    box(st, 14, 3.2, 0.2, wallM, 0, 1.6, -4); box(st, 0.2, 3.2, 14, wallM, -5, 1.6, 0); box(st, 0.2, 3.2, 14, wallM, 5, 1.6, 0);
    const board = g3Tex((x, w, h) => { x.fillStyle = '#1e3a2a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f4f0e8'; x.lineWidth = 4; x.font = '34px serif'; x.fillStyle = '#f4f0e8'; x.fillText('LÍNEAS DE MEDIA TENSIÓN', 30, 50); x.fillText('V = I · R', 30, 110);
      x.beginPath(); x.moveTo(60, 200); x.lineTo(200, 200); x.lineTo(230, 170); x.lineTo(260, 230); x.lineTo(290, 170); x.lineTo(320, 230); x.lineTo(350, 200); x.lineTo(480, 200); x.lineTo(480, 300); x.lineTo(60, 300); x.closePath(); x.stroke();
      x.beginPath(); x.arc(600, 220, 60, 0, TAU); x.stroke(); x.fillText('kV', 580, 232); for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(720 + i * 50, 160); x.lineTo(720 + i * 50, 300); x.stroke(); } }, 1024, 360);
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.6), STDm({ map: board, roughness: 0.9 })); bm.position.set(0, 1.8, -3.88); st.scene.add(bm);
    const R = RNG('class'), deskM = STDm({ map: texWood('desk', '#b88a58', '60,35,15') }), legM = STDm({ color: '#3a3a3a', metalness: 0.5 }); const students = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -3 + c * 2, z = -1.2 + r * 1.6; box(st, 1.2, 0.05, 0.55, deskM, x, 0.74, z); [-1, 1].forEach((s) => box(st, 0.04, 0.74, 0.5, legM, x + s * 0.55, 0.37, z)); box(st, 0.45, 0.05, 0.45, legM, x, 0.45, z + 0.55);
      if (!(r === 1 && c === 2)) students.push({ x, z: z + 0.55, P: makePerson({ female: true, skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(['bob', 'pony', 'bun', 'long', 'curly']), top: R.pick(['#e8a030', '#f2c230', '#3cae5c']), vest: '#f2c230', bottom: '#2b3a55', seed: 60 + r * 4 + c }) }); }
    students.length = 7; students.forEach((s) => st.scene.add(s.P.root));
    const A = makePerson(Object.assign({}, ANA, { vest: '#f2c230' })), T2 = makePerson({ female: true, skin: SKINS[3], hair: '#b8b0a8', hairStyle: 'bun', top: '#f2f0ea', bottom: '#3a3a3a', helmet: '#f4f4f4', seed: 70 }); st.scene.add(A.root, T2.root);
    const note = box(st, 0.25, 0.01, 0.32, STDm({ color: '#f8f6ee' }), 1.0, 0.77, 0.4, 0.1, false);
    return { st, students, A, T2 }; });
  const { st, students, A, T2 } = S;
  students.forEach(({ x, z, P }, i) => posePerson(P, { x, y: 0.02, z, yaw: Math.PI, sit: 1, armL: [0.9, 0.1, 0.9], armR: [i % 2 ? 1.0 + 0.05 * Math.sin(t * 4 + i) : 0.9, 0.1, 1.0], headPitch: 0.15 * Math.sin(t * 0.7 + i), headYaw: 0.1 * Math.sin(t * 0.5 + i), emo: { determined: 0.5 }, look: [0, 0.2] }));
  const write = Math.sin(lt * 9) * 0.06;
  posePerson(A, { x: 1.0, y: 0.02, z: 0.95, yaw: Math.PI, sit: 1, lean: 0.25, armR: [1.1 + write, -0.1, 1.3], armL: [0.9, 0.15, 1.0], headPitch: lt > 5 ? -0.1 : 0.3, headYaw: lt > 5 ? 0.15 : 0, emo: { determined: 0.9, smile: 0.25 * ss(6, 8, lt) }, look: [0, lt > 5 ? 0.2 : -0.5] });
  posePerson(T2, { x: -1.8 + 0.4 * Math.sin(lt * 0.4), z: -3.2, yaw: 0.2, walk: 0.2, armR: [1.6, 0.4, 0.2], headYaw: -0.3, emo: { smile: 0.3, determined: 0.5 }, look: [0.3, 0] });
  const k = EZ.io(seg(lt, 0, dur)); camLook(st.cam, lerp(3.5, 1.9, k), lerp(1.8, 1.25, k), lerp(4.2, 2.3, k), lerp(0.4, 1.0, k), lerp(1.2, 1.05, k), lerp(-1, 0.6, k)); st.cam.fov = 46; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.5, 12);
  renderStage(st, 1.0); bloom(0.25);
};

// ===================== 11. POLE (88-100): night; Ana up a utility pole with a head torch; the city comes back on; Lucía at the window =====================
SHOT_FN.pole = (lt, dur, t) => {
  const S = once('pole', () => { const st = makeStage({ hemi: 0.25, sky: 0x3a4a7a, ground: 0x10141c, key: 0.35, keyCol: '#8aa0d8', box: 30, fog: '#0a1228', fogNear: 60, fogFar: 600 }); st.setSun(dirV(40 * DEG, 40 * DEG)); st.scene.background = lin('#0a1228');
    plane(st, 400, 400, STDm({ color: '#14161c' }), 0, 0, 0); const R = RNG('cityn'), bld = IM(new THREE.BoxGeometry(1, 1, 1), STDm({ roughness: 0.8 }), 220), wins = [];
    for (let i = 0; i < 220; i++) { const a = R.r(-1.0, 1.0), d = R.r(25, 160), x = Math.sin(a) * d, z = Math.cos(a) * d + 10, w = R.r(8, 20), h = R.r(8, 60); bld.setMatrixAt(i, M4c(x, h / 2, z, 0, w, h, w)); R.r(0, 1); bld.setColorAt(i, lin(R.pick(['#2a2e38', '#22262e', '#30343e'])));
      for (let k = 0; k < Math.floor(h / 4); k++) for (let j = 0; j < 3; j++) if (R.f() < 0.8) wins.push([x + R.r(-w / 2, w / 2), 2 + k * 3.5, z - w / 2 - 0.2, R.f()]); }
    st.scene.add(bld); const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wins.flatMap((w) => w.slice(0, 3)), 3)); const wp = new THREE.Points(wg, new THREE.PointsMaterial({ size: 4.5, color: 0xffd890, map: glowTex(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); wp.frustumCulled = false; st.scene.add(wp);
    const order = new Float32Array(wins.length); wins.forEach((w, i) => (order[i] = Math.hypot(w[0], w[2] - 10) / 230 + w[3] * 0.15));
    const poleM = STDm({ map: texWood('pole', '#5a4632', '30,20,10'), roughness: 0.95 }); cyl(st, 0.14, 0.18, 10, poleM, 0, 5, 0, 12); box(st, 2.6, 0.12, 0.12, poleM, 0, 9.2, 0);
    const wireM = STDm({ color: '#101010' }); [-1.2, 0, 1.2].forEach((x) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 140, 4).rotateX(Math.PI / 2), wireM); c.position.set(x, 9.4, -60); st.scene.add(c); cyl(st, 0.05, 0.05, 0.2, STDm({ color: '#e8e8e0' }), x, 9.3, 0, 8); });
    const tf = cyl(st, 0.35, 0.35, 0.9, STDm({ color: '#6a6e74', metalness: 0.5 }), -0.5, 7.6, 0.3); const spark = new THREE.PointLight(0x9ad0ff, 0, 6, 2); spark.position.set(0.4, 8.6, 0.4); st.scene.add(spark);
    const A = makePerson(Object.assign({}, ANA, { helmet: '#f2c230', vest: '#f2c230', top: '#2a3a5a', bottom: '#2a3a5a' })); st.scene.add(A.root);
    const fillA = new THREE.PointLight(0xffe0b0, 1.4, 4, 2); fillA.position.set(0.8, 8.3, -1.0); st.scene.add(fillA); const torch = new THREE.SpotLight(0xfff4e0, 3, 12, 0.45, 0.5); A.head.add(torch); torch.position.set(0, 0.18, 0.1); torch.target.position.set(0, -0.3, 2); A.head.add(torch.target);
    // Lucía's window in the next building (camera cuts to it at the end)
    const facM = STDm({ color: '#3a3e48' }); box(st, 12, 6.15, 0.3, facM, 6, 3.07, -7.9); box(st, 12, 6.15, 0.3, facM, 6, 10.93, -7.9); box(st, 2.25, 1.7, 0.3, facM, 2.12, 7.0, -7.9); box(st, 7.25, 1.7, 0.3, facM, 8.37, 7.0, -7.9); const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ color: '#ffd8a0', toneMapped: false })); win.position.set(4, 7, -9.3); st.scene.add(win);
    const L = makePerson(LUCIA); st.scene.add(L.root); const roomL = new THREE.PointLight(0xffc880, 0, 5, 2); roomL.position.set(4.2, 7.4, -7.0); st.scene.add(roomL);
    return { st, wp, order, A, spark, L, win, roomL }; });
  const { st, wp, order, A, spark, L, win, roomL } = S, ON = 5.0, on = lt > ON;
  // the city lights come on in a wave from the pole outward
  const wl = seg(lt, ON, ON + 2.5); wp.material.opacity = on ? 1 : 0.0; { const pos = wp.geometry.attributes.position; if (!wp.userData.y0) wp.userData.y0 = Float32Array.from(pos.array); for (let i = 0; i < order.length; i++) pos.array[i * 3 + 1] = order[i] < wl * 1.2 ? wp.userData.y0[i * 3 + 1] : -1e4; pos.needsUpdate = true; }
  spark.intensity = lt > ON - 0.4 && lt < ON + 0.2 ? 4 * (0.5 + 0.5 * Math.sin(lt * 80)) : 0; st.hemi.intensity = 0.45 + 0.25 * ss(ON, ON + 2.5, lt);
  posePerson(A, { x: 0.32, y: 7.15, z: 0.34, yaw: 2.55, armL: [2.0, -0.2, 1.1], armR: [1.6, 0.3, 1.3 + 0.2 * Math.sin(lt * 3)], legL: [-0.6, 0.9], legR: [-0.1, 0.3], headPitch: -0.1, headYaw: 0.15, emo: { determined: 0.9, smile: 0.9 * ss(ON + 0.4, ON + 1.4, lt), open: 0.4 * ss(ON + 0.4, ON + 1.4, lt) }, look: [0.2, 0.3] });
  // Lucía at her window, looking out; her room lights up and she smiles
  const winOn = ss(ON + 1.2, ON + 1.6, lt); win.material.color.set(winOn ? '#ffd8a0' : '#181c26'); roomL.intensity = 1.8 * winOn;
  posePerson(L, { x: 4, y: 6.15, z: -8.3, yaw: 0, armL: [0.9, 0.25, 1.3], armR: [0.9, 0.25, 1.3], headPitch: 0.1, emo: { smile: winOn, open: 0.5 * winOn, surprise: 0.3 * (1 - winOn) }, look: [-0.5, 0.2] });
  if (lt < 8.4) { const k = EZ.io(seg(lt, 0, 8.4)); camLook(st.cam, lerp(1.25, 1.9, k), lerp(8.35, 8.0, k), lerp(-1.6, -3.6, k), lerp(0.35, 0.3, k), lerp(8.45, 8.3, k), lerp(0.3, 3, k)); st.cam.fov = lerp(40, 52, k); }
  else { camLook(st.cam, 4.05, 7.15, -5.7, 4, 7.0, -8.3); st.cam.fov = 38; }
  st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.6, 13);
  renderStage(st, 1.25); bloom(0.55);
};

// ===================== 12. WORK (100-112): month 3 — a woman takes the wheel of a big rig; women on a building site =====================
SHOT_FN.work = (lt, dur, t) => {
  const S = once('work', () => { const st = makeStage({ skyTop: '#5a8ad0', skyHor: '#f0dcc0', hemi: 0.8, key: 2.8, keyCol: '#ffe8c8', box: 30, fog: '#e8dcc8', fogNear: 60, fogFar: 400 }); st.setSun(dirV(-120 * DEG, 30 * DEG));
    plane(st, 300, 300, STDm({ map: wrap(texNoise('lot', '#7a7468', ['rgba(40,40,40,0.3)', 'rgba(160,150,130,0.3)']), 30, 30) }), 0, 0, 0);
    // the truck: a cab and a long trailer
    const truck = new THREE.Group(); truck.position.set(0, 0, 0); st.scene.add(truck); const red = STDm({ color: '#c8372d', roughness: 0.35, metalness: 0.3 }), chrome = STDm({ color: '#d8dce0', metalness: 0.8, roughness: 0.25 }), blk = STDm({ color: '#1a1a1a' });
    box(truck, 2.5, 2.6, 2.4, red, 0, 2.2, 1.6); box(truck, 2.5, 1.4, 1.6, red, 0, 1.6, 3.4); box(truck, 2.3, 1.0, 0.05, STDm({ color: '#2a3a4a', roughness: 0.1, metalness: 0.5 }), 0, 2.7, 2.81); box(truck, 2.6, 0.4, 0.3, chrome, 0, 0.9, 4.25);
    box(truck, 2.6, 3.0, 12, STDm({ color: '#e8e4dc' }), 0, 2.6, -5.5); [[-1.1, 3.5], [1.1, 3.5], [-1.1, 0.8], [1.1, 0.8], [-1.1, -9], [1.1, -9], [-1.1, -10.3], [1.1, -10.3]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 20).rotateZ(Math.PI / 2), blk); w.position.set(x, 0.55, z); w.castShadow = true; truck.add(w); });
    box(truck, 0.3, 0.12, 0.3, chrome, -1.32, 1.3, 2.2); box(truck, 0.3, 0.12, 0.3, chrome, -1.32, 1.65, 2.2); const door = box(truck, 0.05, 1.6, 1.4, red, -1.27, 2.3, 1.9);
    // a building site behind: a crane, steel frame, beams
    const steel = STDm({ color: '#c86a2a', metalness: 0.4, roughness: 0.5 }), yel = STDm({ color: '#f2c230', metalness: 0.3, roughness: 0.5 });
    for (let x = -12; x <= 12; x += 6) for (let z = -40; z <= -28; z += 6) box(st, 0.4, 24, 0.4, steel, x + 18, 12, z); for (let y = 4; y <= 24; y += 4) [-34, -28, -40].forEach((z) => box(st, 24.4, 0.4, 0.4, steel, 18, y, z));
    box(st, 1.2, 50, 1.2, yel, -14, 25, -40); box(st, 40, 1.2, 1.2, yel, -4, 50, -40); const hook = box(st, 0.1, 18, 0.1, blk, 6, 41, -40);
    const D = makePerson({ female: true, skin: SKINS[3], hair: '#2a1d16', hairStyle: 'long', top: '#2f6fd1', bottom: '#2b3a55', vest: '#f2c230', seed: 81, cap: '#c8372d' }); st.scene.add(D.root);
    const crew = [0, 1, 2].map((i) => { const P = makePerson({ female: true, skin: SKINS[[0, 4, 2][i]], hair: HAIRS[i], hairStyle: ['pony', 'bun', 'curly'][i], top: '#e8742a', bottom: '#2b3a55', vest: '#f2c230', helmet: ['#f4f4f4', '#f2c230', '#e8742a'][i], seed: 82 + i }); st.scene.add(P.root); return P; });
    return { st, truck, door, D, crew }; });
  const { st, truck, door, D, crew } = S;
  if (lt < 6) { // by the cab: she grabs the handle, turns to us with a grin, then pulls herself up
    const up = ss(3.6, 5.2, lt); door.rotation.y = 0;
    posePerson(D, { x: -1.75, y: 0.55 * up, z: 2.5, yaw: lerp(-0.7, Math.PI / 2, up), armR: [2.3, 0.15, 0.4], armL: [lt < 3 ? 0.3 : 1.6, 0.4, lt < 3 ? 0.3 : 1.9], legL: [-1.0 * up, 1.2 * up], headYaw: lerp(0, -1.0, up), emo: { determined: 0.6, smile: ss(1.2, 2.2, lt), open: 0.35 * ss(1.2, 2.2, lt) }, look: [-0.1, 0] });
    camLook(st.cam, -3.4 - 0.1 * lt, 1.75, 4.6, -1.8, 1.55 + 0.2 * up, 2.4); st.cam.fov = 40; crew.forEach((P) => (P.root.visible = false)); D.root.visible = true; }
  else { // the building site: three women in helmets, one points up, beams swing
    D.root.visible = false; crew.forEach((P, i) => { P.root.visible = true; posePerson(P, { x: 4 + i * 1.3, z: -18 - i * 0.8, yaw: Math.PI + 0.3 * (i - 1), armR: i === 1 ? [2.4, 0.3, 0.1] : [0.6, 0.2, 0.8], armL: [0.4, 0.2, 0.6], headPitch: -0.4, headYaw: 0.2 * (i - 1), emo: { determined: 0.8, smile: 0.5 * (i % 2) }, look: [0, 0.6] }); });
    camLook(st.cam, 5.0, 1.5, -13.0 + (lt - 6) * 0.1, 5.4, 2.0 + (lt - 6) * 0.5, -20); st.cam.fov = 50; }
  st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.6, 14); renderStage(st, 1.05); bloom(0.3);
};

// ===================== 13. NIGHT (112-128): 3 AM; Sofía walks home alone with her headphones, calm =====================
const SOFIA = { female: true, skin: SKINS[4], hair: '#1a1a1a', hairStyle: 'curly', top: '#c8372d', bottom: '#1f2d3d', shoe: '#f4f4f4', seed: 91, coat: '#8a2a3a' };
SHOT_FN.night = (lt, dur, t) => {
  const S = once('night', () => { const st = makeStage({ hemi: 0.22, sky: 0x4a5a8a, ground: 0x10121a, key: 0.3, keyCol: '#7a90c8', box: 30, fog: '#0a0e18', fogNear: 15, fogFar: 120 }); st.setSun(dirV(30 * DEG, 50 * DEG)); st.scene.background = lin('#070a14');
    const wet = wrap(texNoise('wetst', '#2a2c32', ['rgba(10,10,12,0.4)', 'rgba(90,90,100,0.25)']), 4, 40); plane(st, 10, 200, STDm({ map: wet, roughness: 0.25, metalness: 0.2 }), 0, 0, -60);
    [-1, 1].forEach((s) => { plane(st, 3, 200, STDm({ map: wrap(texTiles('nwalk', '#5a5852', 'rgba(20,20,20,0.5)', 4), 1, 60) }), s * 6.5, 0.12, -60); });
    const R = RNG('nst'); const lamps = []; for (let z = 10; z > -150; z -= 14) [-1, 1].forEach((s) => { const x = s * 5.4; cyl(st, 0.07, 0.09, 4.6, STDm({ color: '#1a1a1e' }), x, 2.3, z + (s > 0 ? 7 : 0), 8); lamps.push([x - s * 0.4, 4.5, z + (s > 0 ? 7 : 0)]); });
    pts(st, lamps, 1.8, 0xffd8a0); lamps.slice(0, 10).forEach(([x, y, z]) => { const l = new THREE.PointLight(0xffc880, 1.6, 16, 2); l.position.set(x, y, z); st.scene.add(l); });
    for (let z = 10; z > -150; z -= R.r(9, 13)) [-1, 1].forEach((s) => { const h = R.r(8, 18); box(st, 5, h, R.r(8, 11), STDm({ color: R.pick(['#3a3438', '#2e3036', '#40383a']) }), s * 10.5, h / 2, z); for (let k = 0; k < 4; k++) if (R.f() < 0.35) box(st, 0.05, 1.1, 0.9, new THREE.MeshBasicMaterial({ color: '#ffd890' }), s * 7.97, 3 + k * 3, z + R.r(-2, 2), 0, false); if (R.f() < 0.5) box(st, 0.05, 1.6, 3, new THREE.MeshBasicMaterial({ color: R.pick(['#ffd8a0', '#a8d8ff', '#ffb0c8']) }), s * 7.97, 1.0, z, 0, false); });
    const Sf = makePerson(SOFIA); st.scene.add(Sf.root); const ph = new THREE.Group(); Sf.head.add(ph); const band = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.012, 6, 18, Math.PI), STDm({ color: '#f4f4f4' })); band.rotation.z = 0; band.position.y = 0.02; ph.add(band);
    [-1, 1].forEach((s) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 14).rotateZ(Math.PI / 2), STDm({ color: '#f4f4f4' })); c.position.set(s * 0.135, 0.0, 0); ph.add(c); });
    const fl = new THREE.PointLight(0xffc890, 2.4, 6, 2); st.scene.add(fl);
    return { st, Sf, fl }; });
  const { st, Sf } = S, z = 2 - lt * 1.1;
  posePerson(Sf, { x: 0.6, z, yaw: Math.PI, walk: 0.7, ph: lt * 6.2, armL: [0.1 * Math.sin(lt * 6.2), 0.12, 0.3], armR: [-0.1 * Math.sin(lt * 6.2), 0.12, 0.3], headPitch: lt > 9 ? -0.35 * ss(9, 10, lt) * (1 - ss(12, 13, lt)) : 0, headYaw: 0.15 * Math.sin(lt * 0.5), emo: { smile: 0.45 + 0.3 * ss(9, 10, lt), sleepy: 0.15 }, look: [0.1 * Math.sin(lt), lt > 9 && lt < 12.5 ? 0.6 : 0] });
  camLook(st.cam, 0.3 + 0.3 * Math.sin(lt * 0.2), 1.55, z - 2.2, 0.6, 1.4, z); st.cam.fov = 40; S.fl.position.set(0.6, 2.4, z - 1.2); st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.7, 15);
  renderStage(st, 1.25); bloom(0.45);
};
