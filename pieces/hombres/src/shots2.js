
// ===================== 5. TRENCH (45-51): the front at dusk — empty trenches, helmets, a medic looking round =====================
SHOT_FN.trench = (lt, dur, t) => {
  const S = once('trench', () => { const st = makeStage({ skyTop: '#4a5a7a', skyHor: '#e8a070', hemi: 1.1, sky: 0xc8c0c0, ground: 0x4a3a2a, key: 2.2, keyCol: '#ffb070', box: 16, fog: '#c89878', fogNear: 20, fogFar: 160 }); st.setSun(dirV(70 * DEG, 10 * DEG));
    const mud = wrap(texNoise('mud', '#6a5440', ['rgba(40,30,20,0.4)', 'rgba(140,110,80,0.3)', 'rgba(80,90,60,0.25)'], 14000), 12, 12), mudM = STDm({ map: mud, roughness: 1 });
    [-1, 1].forEach((sd) => plane(st, 60, 120, mudM, sd * 31.1, 0, 0)); const wallM = STDm({ map: wrap(texWood('plank', '#6a5032', '30,20,10'), 4, 1), roughness: 0.95 });
    
    box(st, 2.2, 0.02, 80, STDm({ map: mud }), 0, -1.6, -20, 0, false); [-1, 1].forEach((s) => box(st, 0.15, 1.75, 80, wallM, s * 1.05, -0.8, -20));
    const R = RNG('sand'), bags = IM(new THREE.CapsuleGeometry(0.16, 0.35, 4, 8).rotateZ(Math.PI / 2).scale(1, 0.6, 1), STDm({ color: '#a8946a', roughness: 1 }), 520); for (let i = 0; i < 520; i++) { const s = i % 2 ? 1 : -1; bags.setMatrixAt(i, M4c(s * (1.4 + R.r(0, 0.3)), 0.12 + (i % 3) * 0.17, -60 + ((i >> 1) * 0.31) % 80, R.r(-0.1, 0.1) + Math.PI / 2)); } st.scene.add(bags);
    const wireM = STDm({ color: '#5a5a5a', metalness: 0.6 }); for (let z = -60; z < 20; z += 1.2) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 4, 20), wireM); c.position.set(-4, 0.4, z); c.rotation.y = Math.PI / 2 + 0.3; st.scene.add(c); }
    const helM = STDm({ color: '#4a5a3a', roughness: 0.7 }), uni = STDm({ color: '#5a6a4a', roughness: 1 }); for (let k = 0; k < 16; k++) { const z = -40 + k * 3 + R.r(-1, 1), x = R.r(-0.7, 0.7); const h = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 8, 0, TAU, 0, Math.PI / 2), helM); h.position.set(x, -1.58, z); h.rotation.set(R.r(-1, 1), 0, R.r(-1, 1)); h.castShadow = true; st.scene.add(h);
      box(st, 0.5, 0.06, 0.9, uni, x + R.r(-0.3, 0.3), -1.57, z + 0.6, R.r(0, 3)); box(st, 0.06, 0.06, 0.9, STDm({ color: '#2a2a2a' }), x + 0.3, -1.55, z - 0.4, R.r(0, 3)); }
    const M = makePerson({ female: true, skin: SKINS[3], hair: '#1a1a1a', hairStyle: 'bun', helmet: '#4a5a3a', top: '#5a6a4a', bottom: '#4a5a3a', seed: 31 }); st.scene.add(M.root);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.1, 12), STDm({ color: '#f4f0e8' })); M.arms[0].sh.add(band); band.position.y = -0.12;
    const smoke = []; const st2 = g3Radial([[0, 'rgba(200,190,180,0.35)'], [1, 'rgba(200,190,180,0)']], 64); for (let k = 0; k < 18; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: st2, transparent: true, depthWrite: false })); s.userData = { x: R.r(-30, 30), z: R.r(-70, -20), ph: R.r(0, 6) }; st.scene.add(s); smoke.push(s); }
    return { st, M, smoke }; });
  const { st, M, smoke } = S;
  smoke.forEach((s) => { const u = s.userData, a = mod(lt * 0.1 + u.ph, 1); s.position.set(u.x, 2 + a * 10, u.z); s.scale.setScalar(6 + a * 10); s.material.opacity = 0.5 * Math.sin(a * Math.PI); });
  posePerson(M, { x: 0, y: -1.6, z: -8 + lt * 0.35, yaw: 0, walk: 0.5, ph: lt * 5, headYaw: 0.5 * Math.sin(lt * 0.9), headPitch: 0.1, emo: { fear: 0.4, surprise: 0.5, sad: 0.3 }, look: [Math.sin(lt * 0.9) * 0.6, 0] });
  camLook(st.cam, 0.3, -0.35 + lt * 0.04, -4.2 + lt * 0.35, 0, -0.7, -12 + lt * 0.35); st.cam.fov = 52; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 1, 7);
  renderStage(st, 1.05); bloom(0.3);
};

// ===================== 6. HALL (51-58): a parliament of empty seats; two women stand among them =====================
SHOT_FN.hall = (lt, dur, t) => {
  const S = once('hall', () => { const st = makeStage({ hemi: 0.6, sky: 0xe8dcc8, ground: 0x4a3020, key: 1.8, keyCol: '#fff0d8', box: 24, boxFar: 200 }); st.setSun(new THREE.Vector3(0.2, 1, 0.1)); st.scene.background = lin('#0e0c10');
    plane(st, 80, 80, STDm({ color: '#3a1e1a', roughness: 0.9 }), 0, 0, 0); cyl(st, 4.5, 4.5, 0.3, STDm({ color: '#c8a868' }), 0, 0.15, 0, 40);
    const R = RNG('flowers'), NF = 900, fl = IM(new THREE.DodecahedronGeometry(0.09, 0).scale(1, 0.6, 1), STDm({ roughness: 0.7 }), NF), ctr = IM(new THREE.SphereGeometry(0.035, 8, 6), STDm({ color: '#f2c230' }), NF, false), stem = IM(new THREE.CylinderGeometry(0.008, 0.01, 0.4, 5).translate(0, -0.2, 0), STDm({ color: '#3a6a2a' }), NF, false), leaf = IM(new THREE.PlaneGeometry(0.16, 0.06), STDm({ color: '#4a8a34', side: THREE.DoubleSide }), NF * 2, false);
    for (let i = 0; i < NF; i++) { const a = R.r(0, TAU), r = Math.sqrt(R.f()) * 4.2, h = 0.5 + R.r(0, 0.25), x = Math.cos(a) * r, z = Math.sin(a) * r; fl.setMatrixAt(i, M4c(x, h, z, R.r(0, 6), 1, 1, 1, R.r(-0.3, 0.3))); ctr.setMatrixAt(i, M4c(x, h + 0.03, z)); stem.setMatrixAt(i, M4c(x, h, z)); for (let k = 0; k < 2; k++) leaf.setMatrixAt(i * 2 + k, M4c(x, h - 0.15 - k * 0.1, z, R.r(0, 6), 1, 1, 1, R.r(-0.6, 0.6)));
      fl.setColorAt(i, lin(R.pick(['#e8508a', '#f4f0e8', '#c8372d', '#f28aa8', '#a85ac8', '#f2c230']))); } st.scene.add(fl, ctr, stem, leaf);
    const desks = IM(new THREE.BoxGeometry(1.1, 0.7, 0.5), STDm({ color: '#e8e0d0', roughness: 0.5 }), 400), chairs = IM(new THREE.BoxGeometry(0.52, 0.1, 0.5), STDm({ color: '#7a1e22', roughness: 0.55 }), 400), backs = IM(new THREE.BoxGeometry(0.52, 0.75, 0.1).translate(0, 0.42, -0.22), STDm({ color: '#7a1e22', roughness: 0.55 }), 400), chairLeg = IM(new THREE.CylinderGeometry(0.03, 0.05, 0.42, 8).translate(0, -0.21, 0), STDm({ color: '#c8a868', metalness: 0.6, roughness: 0.3 }), 400), papers = IM(new THREE.PlaneGeometry(0.3, 0.4).rotateX(-Math.PI / 2), STDm({ color: '#ffffff' }), 400, false), lamps = [];
    let n = 0; for (let r = 0; r < 7; r++) { const rad = 6.5 + r * 2.2, cnt = Math.floor(rad * 2.6), y = r * 0.45; { const rg = new THREE.Mesh(new THREE.RingGeometry(rad - 0.9, rad + 1.3, 64).rotateX(-Math.PI / 2), STDm({ color: '#4a2620', side: THREE.DoubleSide })); rg.position.y = y + 0.001; rg.receiveShadow = true; st.scene.add(rg); } for (let k = 0; k < cnt && n < 400; k++) { const a = k / cnt * TAU, x = Math.cos(a) * rad, z = Math.sin(a) * rad, yaw = -a - Math.PI / 2;
      desks.setMatrixAt(n, M4c(x, y + 0.35, z, yaw + Math.PI / 2)); { const cm = M4c(Math.cos(a) * (rad + 0.65), y + 0.46, Math.sin(a) * (rad + 0.65), yaw - Math.PI / 2 + R.r(-0.5, 0.5)); chairs.setMatrixAt(n, cm); backs.setMatrixAt(n, cm); chairLeg.setMatrixAt(n, cm); }
      papers.setMatrixAt(n, M4c(x + R.r(-0.2, 0.2), y + 0.71, z + R.r(-0.1, 0.1), R.r(0, TAU))); if (n % 9 === 0) lamps.push([x, y + 0.9, z]); n++; } }
    desks.count = chairs.count = backs.count = chairLeg.count = papers.count = n; st.scene.add(desks, chairs, backs, chairLeg, papers); pts(st, lamps, 0.5, 0xffd8a0);
    const W1 = makePerson({ female: true, skin: SKINS[4], hair: '#1a1a1a', hairStyle: 'curly', top: '#1f2d3d', coat: '#1f2d3d', bottom: '#1f2d3d', seed: 41, glasses: true }), W2 = makePerson({ female: true, skin: SKINS[0], hair: '#c9a060', hairStyle: 'bob', top: '#8a2a3a', coat: '#8a2a3a', skirt: '#2a2a3a', seed: 42 });
    st.scene.add(W1.root, W2.root); return { st, W1, W2 }; });
  const { st, W1, W2 } = S;
  posePerson(W1, { x: 7.4, y: 0.45, z: 1.2, yaw: -2.2, headYaw: 0.6 * Math.sin(lt * 0.6), emo: { surprise: 0.4, sad: 0.4 }, armR: [0.4, 0.1, 1.6], look: [0.4 * Math.sin(lt), 0.1] });
  posePerson(W2, { x: 9.2, y: 0.9, z: -2.8, yaw: -1.8, headYaw: -0.4, headPitch: -0.1, emo: { fear: 0.4, sad: 0.6 }, armL: [0.9, 0.2, 1.8], armR: [0.9, 0.2, 1.8], look: [-0.3, 0] });
  const a = 0.6 + lt * 0.05, k = EZ.io(seg(lt, 0, dur)); camLook(st.cam, Math.cos(a) * lerp(26, 14, k), lerp(26, 6, k), Math.sin(a) * lerp(26, 14, k), lerp(0, 7, k), lerp(0, 1, k), lerp(0, -0.5, k)); st.cam.fov = 50; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.5, 8);
  renderStage(st, 1.05); bloom(0.35);
};

// ===================== 7. HOSPITAL (58-66): the nurses keep going =====================
SHOT_FN.hospital = (lt, dur, t) => {
  const S = once('hospital', () => { const st = makeStage({ hemi: 1.0, sky: 0xf0f4f8, ground: 0x8a8a80, key: 1.2, keyCol: '#fff8f0', box: 12 }); st.setSun(new THREE.Vector3(0.6, 1, 0.4)); st.scene.background = lin('#d8dce0');
    plane(st, 6, 60, STDm({ map: wrap(texTiles('htile', '#d8d4cc', 'rgba(140,136,128,0.6)', 4), 3, 30), roughness: 0.3, metalness: 0.05 }), 0, 0, -20);
    const wallM = STDm({ color: '#e8eee8' }), stripe = STDm({ color: '#5a9a8a' }); [-1, 1].forEach((s) => { box(st, 0.2, 3.2, 60, wallM, s * 3, 1.6, -20); box(st, 0.22, 0.25, 60, stripe, s * 2.98, 1.0, -20, 0, false); for (let z = -45; z < 10; z += 7) box(st, 0.25, 2.2, 1.3, STDm({ color: '#c8b898' }), s * 2.92, 1.1, z); });
    box(st, 6, 0.2, 60, STDm({ color: '#f4f6f4' }), 0, 3.2, -20, 0, false); for (let z = -45; z < 10; z += 4) { box(st, 1.2, 0.04, 0.4, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 0, 3.08, z, 0, false); const l = new THREE.PointLight(0xfff8f0, 0.6, 8, 2); l.position.set(0, 2.9, z); st.scene.add(l); }
    const N1 = makePerson({ female: true, skin: SKINS[2], hair: '#2a1d16', hairStyle: 'bun', top: '#4aa0a8', bottom: '#4aa0a8', shoe: '#f4f4f4', seed: 51 }), N2 = makePerson({ female: true, skin: SKINS[5], hair: '#1a1a1a', hairStyle: 'pony', top: '#4aa0a8', bottom: '#4aa0a8', shoe: '#f4f4f4', seed: 52, glasses: true });
    const OLD = makePerson({ female: true, skin: SKINS[0], hair: '#d8d4d0', hairStyle: 'bob', top: '#c8a8c8', bottom: '#6a6a7a', seed: 53, height: 0.95 });
    const wc = new THREE.Group(); st.scene.add(wc); const chrome = STDm({ color: '#b8bcc0', metalness: 0.7, roughness: 0.3 }); [-1, 1].forEach((s) => { const w = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 24), chrome); w.position.set(s * 0.3, 0.3, 0); w.rotation.y = Math.PI / 2; wc.add(w); }); box(wc, 0.5, 0.06, 0.45, STDm({ color: '#2a2a3a' }), 0, 0.5, 0); box(wc, 0.5, 0.55, 0.05, STDm({ color: '#2a2a3a' }), 0, 0.8, 0.22);
    [N1, N2, OLD].forEach((p) => st.scene.add(p.root)); return { st, N1, N2, OLD, wc }; });
  const { st, N1, N2, OLD, wc } = S, z = 2 - lt * 0.9;
  wc.position.set(-0.4, 0, z); posePerson(OLD, { x: -0.4, y: 0.06, z: z + 0.02, yaw: Math.PI, sit: 1, emo: { smile: 0.4, sad: 0.3 }, headYaw: 0.4, look: [0.4, 0.1], armL: [0.6, 0.1, 0.8], armR: [0.6, 0.1, 0.8] });
  posePerson(N1, { x: -0.4, z: z + 0.75, yaw: Math.PI, walk: 0.6, ph: lt * 5.5, lean: 0.12, armL: [0.9, 0.15, 0.5], armR: [0.9, 0.15, 0.5], headYaw: -0.3, emo: { determined: 0.6, sad: 0.25 }, look: [-0.2, 0] });
  posePerson(N2, { x: 1.4, z: z - 3 + lt * 0.2, yaw: 0.2, walk: 0.5, ph: lt * 5.0, armL: [1.1, 0.1, 1.6], armR: [0.2, 0.1, 0.3], headPitch: 0.25, emo: { determined: 0.7 }, look: [0, -0.6] });
  camLook(st.cam, 0.9, 1.5, z - 2.6, -0.2, 1.0, z + 0.3); st.cam.fov = 48; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.7, 9);
  renderStage(st, 1.0); bloom(0.25);
};

// ===================== 8. MARKET (66-72): empty shelves; Ana and Lucía with a nearly empty cart =====================
SHOT_FN.market = (lt, dur, t) => {
  const S = once('market', () => { const st = makeStage({ hemi: 1.0, sky: 0xf4f4f0, ground: 0x8a8478, key: 0.8, box: 12 }); st.setSun(new THREE.Vector3(0.3, 1, 0.2)); st.scene.background = lin('#c8c8c4');
    plane(st, 30, 60, STDm({ map: wrap(texTiles('mtile', '#e4e0d8', 'rgba(160,156,148,0.6)', 2), 15, 30), roughness: 0.35 }), 0, 0, -20);
    const shelfM = STDm({ color: '#f4f6f6', metalness: 0.2, roughness: 0.4 }), backM = STDm({ color: '#3a4652', roughness: 0.7 }), R = RNG('shelf'), prod = IM(new THREE.BoxGeometry(0.18, 0.26, 0.14), STDm({ roughness: 0.6 }), 900); let n = 0;
    [-2.2, 2.2].forEach((x) => { box(st, 0.12, 2.1, 30, backM, x + Math.sign(x) * 0.42, 1.05, -12); box(st, 0.9, 0.22, 30, shelfM, x, 0.11, -12); for (let z = -26; z <= 2; z += 1.4) box(st, 0.9, 2.1, 0.04, shelfM, x, 1.05, z, 0, false);
      for (let lv = 0; lv < 4; lv++) { box(st, 0.9, 0.035, 30, shelfM, x, 0.3 + lv * 0.48, -12, 0, false); box(st, 0.02, 0.05, 30, STDm({ color: ['#f2c230', '#e83a3a', '#3a8ae8', '#3cae5c'][lv] }), x - Math.sign(x) * 0.45, 0.28 + lv * 0.48, -12, 0, false);
      for (let z = -26; z < 2; z += 0.22) if (R.f() < 0.1 && n < 900) { prod.setMatrixAt(n, M4c(x - Math.sign(x) * 0.5, 0.45 + lv * 0.48, z, R.r(-0.3, 0.3), 1, 1, 1, 0, R.f() < 0.3 ? 1.4 : 0)); prod.setColorAt(n, lin(R.pick(['#c8372d', '#f2c230', '#2f6fd1', '#f4f0e8', '#3a8a4a']))); n++; } } });
    prod.count = n; st.scene.add(prod); const trash = IM(new THREE.PlaneGeometry(0.2, 0.15).rotateX(-Math.PI / 2), STDm({ color: '#f4f0e8' }), 80, false); for (let i = 0; i < 80; i++) trash.setMatrixAt(i, M4c(R.r(-1.5, 1.5), 0.01, R.r(-25, 2), R.r(0, 6))); st.scene.add(trash);
    for (let z = -26; z < 4; z += 4) box(st, 0.3, 0.05, 2.6, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 0, 3.4, z, 0, false);
    [-4, -14].forEach((z, i) => { const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), new THREE.MeshBasicMaterial({ map: g3Tex((x, w, h) => { x.fillStyle = ['#c8372d', '#1f6a4a'][i]; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center'; x.fillText(['PASILLO 2', 'PASILLO 3'][i], w / 2, 62); }, 256, 84), toneMapped: false })); sg.position.set(0, 2.8, z); st.scene.add(sg); });
    const cart = new THREE.Group(); st.scene.add(cart); const wire = STDm({ color: '#b8bcc0', metalness: 0.7, roughness: 0.3 });
    box(cart, 0.55, 0.42, 0.8, STDm({ color: '#b8bcc0', metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.55 }), 0, 0.75, 0); [-1, 1].forEach((s) => [-1, 1].forEach((u) => cyl(cart, 0.05, 0.05, 0.03, STDm({ color: '#1a1a1a' }), s * 0.22, 0.05, u * 0.32, 10))); box(cart, 0.04, 0.6, 0.04, wire, 0.25, 0.4, 0.38); box(cart, 0.04, 0.6, 0.04, wire, -0.25, 0.4, 0.38); box(cart, 0.55, 0.04, 0.04, wire, 0, 1.05, 0.42);
    box(cart, 0.15, 0.2, 0.1, STDm({ color: '#f2c230' }), 0.1, 0.65, -0.1);
    const A = makePerson(ANA), L = makePerson(LUCIA); st.scene.add(A.root, L.root); return { st, A, L, cart }; });
  const { st, A, L, cart } = S, z = -2 - lt * 0.5;
  cart.position.set(-0.2, 0, z - 0.55); posePerson(A, { x: -0.2, z, yaw: Math.PI, walk: 0.45, ph: lt * 4.5, armL: [0.9, 0.12, 0.6], armR: [0.9, 0.12, 0.6], headYaw: 0.5 * Math.sin(lt * 0.7), emo: { sad: 0.5, fear: 0.3, determined: 0.3 }, look: [0.4 * Math.sin(lt * 0.7), 0] });
  posePerson(L, { x: 0.45, z: z + 0.3, yaw: Math.PI, walk: 0.5, ph: lt * 5.5, armL: [0.6, 0.35, 0.3], headYaw: -0.6, headPitch: -0.3, emo: { sad: 0.6, fear: 0.3 }, look: [-0.4, 0.5] });
  camLook(st.cam, 0.4, 1.55, z - 5.8, 0.1, 1.0, z); st.cam.fov = 58; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.7, 10);
  renderStage(st, 1.0); bloom(0.25); if (Math.sin(lt * 23) > 0.92) pvTint('#000000', 0.25);
};

// ===================== 9. BLACKOUT (72-78): the apartment at dusk; the power goes; a lantern; Ana holds Lucía =====================
SHOT_FN.blackout = (lt, dur, t) => {
  const S = once('blackout', () => { const st = makeStage({ hemi: 0.5, sky: 0xb8c0d8, ground: 0x4a3a30, key: 0.6, keyCol: '#b8c8f0', box: 8 }); st.setSun(dirV(10 * DEG, 20 * DEG)); st.scene.background = lin('#1a2238');
    plane(st, 10, 10, STDm({ map: wrap(texWood('floorw', '#8a6a48', '50,30,15'), 4, 4), roughness: 0.6 }), 0, 0, 0); const wallM = STDm({ color: '#d8c8b0' });
    box(st, 10, 3, 0.2, wallM, 0, 1.5, -3); box(st, 0.2, 3, 10, wallM, -3.5, 1.5, 0); const win = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshBasicMaterial({ toneMapped: false })); win.position.set(0.6, 1.6, -2.88); st.scene.add(win);
    const skyline = (lit) => g3Tex((x, w, h) => { const R = RNG('cityw'); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, lit ? '#3a4a78' : '#2a3458'); g.addColorStop(1, lit ? '#c87858' : '#8a5a48'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let k = 0; k < 14; k++) { const bx = R.r(0, w), bw = R.r(30, 80), bh = R.r(60, h * 0.8); x.fillStyle = lit ? '#141a2a' : '#0c101a'; x.fillRect(bx, h - bh, bw, bh); for (let i = 0; i < 40; i++) { const on = R.f() < 0.5, wx = R.r(4, bw - 8), wy = R.r(6, bh - 8); if (on && lit) { x.fillStyle = '#ffd890'; x.fillRect(bx + wx, h - bh + wy, 5, 6); } } } }, 512, 340);
    const city = skyline(true), cityDark = skyline(false); win.material.map = city;
    box(st, 2.6, 0.12, 0.25, STDm({ color: '#f4f0e8' }), 0.6, 0.75, -2.85); box(st, 0.08, 1.7, 0.1, STDm({ color: '#f4f0e8' }), 0.6, 1.6, -2.84);
    box(st, 1.4, 0.06, 0.9, STDm({ map: texWood('tbl', '#6a4a2a', '30,18,8') }), -0.6, 0.75, -0.5); [-1, 1].forEach((s) => [-1, 1].forEach((u) => box(st, 0.05, 0.75, 0.05, STDm({ color: '#3a2a1a' }), -0.6 + s * 0.62, 0.37, -0.5 + u * 0.38)));
    const lampL = new THREE.PointLight(0xffd8a0, 2.5, 9, 2); lampL.position.set(-0.6, 2.6, -0.5); st.scene.add(lampL); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff0c8' })); bulb.position.copy(lampL.position); st.scene.add(bulb);
    const lant = new THREE.Group(); st.scene.add(lant); const lm = STDm({ color: '#f4efe4', emissive: '#ffd890', emissiveIntensity: 0 }); cyl(lant, 0.08, 0.09, 0.22, lm, 0, 0.11, 0); const ll = new THREE.PointLight(0xffd8a0, 0, 5, 2); ll.position.y = 0.25; lant.add(ll); lant.position.set(-0.35, 0.78, -0.4);
    const A = makePerson(ANA), L = makePerson(LUCIA); st.scene.add(A.root, L.root); return { st, A, L, lampL, bulb, lm, ll, win, city, cityDark }; });
  const { st, A, L, lampL, bulb, lm, ll, win, city, cityDark } = S, off = lt > 1.4, lantOn = ss(3.0, 3.4, lt);
  lampL.intensity = off ? 0 : 2.5; bulb.visible = !off; win.material.map = off ? cityDark : city; win.material.needsUpdate = true; ll.intensity = 2.2 * lantOn; lm.emissiveIntensity = 1.5 * lantOn; st.hemi.intensity = off ? 0.12 + 0.12 * lantOn : 0.5;
  const fear = ss(1.5, 2.0, lt), hold = ss(3.6, 5.0, lt);
  posePerson(A, { x: -0.2, z: 0.1, yaw: 0.3, kneel: hold, headYaw: lt > 1.5 ? -0.6 * (1 - hold) : 0, emo: { fear: 0.4 * fear * (1 - hold), determined: 0.6 * hold, smile: 0.3 * hold, sad: 0.2 }, armR: [0.9 * (1 - hold) + 1.1 * hold, -0.3 * hold, 1.2 * hold + 0.3], armL: [0.3 + 0.6 * hold, 0.2, 0.6], look: [-0.5 * (1 - hold), 0] });
  posePerson(L, { x: 0.45, z: 0.25, yaw: -0.25, headYaw: -0.4 * hold, emo: { fear: fear * (1 - 0.5 * hold), sad: 0.3 * hold, surprise: 0.5 * fear * (1 - hold) }, armL: [0.8, 0.2, 1.4 * fear], armR: [0.8, 0.2, 1.4 * fear], look: [0.3, 0.3] });
  camLook(st.cam, 0.35, 1.2, 3.1 - lt * 0.08, 0.1, 1.05, 0); st.cam.fov = 48; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.6, 11);
  renderStage(st, off ? 1.3 : 1.0); bloom(off ? 0.5 : 0.3);
};
