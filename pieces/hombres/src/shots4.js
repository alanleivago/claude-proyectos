
// ===================== 14. LAB (128-140): a sperm bank — rows of liquid-nitrogen tanks breathing cold mist =====================
SHOT_FN.lab = (lt, dur, t) => {
  const S = once('lab', () => { const st = makeStage({ hemi: 1.1, sky: 0xe8f0f8, ground: 0x8a9098, key: 0.9, keyCol: '#f0f6ff', box: 14 }); st.setSun(new THREE.Vector3(0.3, 1, 0.5)); st.scene.background = lin('#d0dce8');
    plane(st, 30, 40, STDm({ map: wrap(texTiles('labt', '#d8dee4', 'rgba(140,150,160,0.5)', 2), 15, 20), roughness: 0.2, metalness: 0.1 }), 0, 0, -10);
    const steel = STDm({ color: '#c8ccd2', metalness: 0.75, roughness: 0.25 }), tanks = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -3.6 + c * 2.4, z = -2 - r * 3.2; cyl(st, 0.62, 0.62, 1.25, steel, x, 0.625, z, 28); cyl(st, 0.4, 0.62, 0.2, steel, x, 1.35, z, 28); cyl(st, 0.22, 0.22, 0.18, STDm({ color: '#2f6fd1' }), x, 1.52, z, 18);
      box(st, 0.5, 0.18, 0.02, STDm({ color: '#f4f4f4' }), x, 0.85, z + 0.62, 0, false); tanks.push([x, 1.6, z]); }
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.18), STDm({ map: g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1f4e8a'; x.font = 'bold 40px sans-serif'; x.fillText('LN2', 20, 52); x.fillStyle = '#c8372d'; x.fillRect(w - 60, 10, 40, 50); }, 256, 72) })); lab.position.set(-1.2, 0.85, -1.37); st.scene.add(lab);
    for (let z = -12; z < 2; z += 3) box(st, 3, 0.04, 0.5, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 0, 3.4, z, 0, false);
    const mist = []; const mt = g3Radial([[0, 'rgba(240,248,255,0.5)'], [1, 'rgba(240,248,255,0)']], 64); tanks.forEach((p, i) => { for (let k = 0; k < 4; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mt, transparent: true, depthWrite: false })); s.userData = { p, ph: k / 4 + i * 0.13 }; st.scene.add(s); mist.push(s); } });
    // the scientist lifts a rack of straws from an open tank
    const SC = makePerson({ female: true, skin: SKINS[1], hair: '#c9a060', hairStyle: 'bun', top: '#f4f6f8', coat: '#f4f6f8', bottom: '#4a5a7a', seed: 101, glasses: true }); st.scene.add(SC.root);
    const rack = new THREE.Group(); st.scene.add(rack); box(rack, 0.08, 0.7, 0.08, steel, 0, 0, 0); const R = RNG('straw'); for (let k = 0; k < 10; k++) box(rack, 0.012, 0.25, 0.012, STDm({ color: R.pick(['#e8508a', '#f2c230', '#3a8ae8', '#3cae5c']) }), R.r(-0.05, 0.05), -0.2 + k * 0.04, 0.05, 0, false);
    return { st, mist, SC, rack }; });
  const { st, mist, SC, rack } = S;
  mist.forEach((s) => { const u = s.userData, a = mod(lt * 0.25 + u.ph, 1); s.position.set(u.p[0] + 0.2 * Math.sin(a * 5), u.p[1] + a * 0.9, u.p[2]); s.scale.setScalar(0.4 + a * 1.2); s.material.opacity = 0.5 * Math.sin(a * Math.PI); });
  const lift = ss(3, 6, lt); posePerson(SC, { x: -1.2, z: -0.6, yaw: Math.PI + 0.3, armR: [1.5 + 0.6 * lift, -0.2, 0.8], armL: [1.2, 0.1, 1.2], headPitch: -0.2 * lift, emo: { determined: 0.6, smile: 0.35 * lift }, look: [0, 0.3 * lift] });
  SC.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); SC.arms[1].hand.getWorldPosition(hp); rack.position.set(hp.x, hp.y - 0.25, hp.z);
  const k = EZ.io(seg(lt, 0, dur)); camLook(st.cam, lerp(2.6, 0.6, k), lerp(2.6, 1.6, k), lerp(3.6, 1.6, k), -1.1, lerp(1.0, 1.4, k), -1.2); st.cam.fov = 48; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.4, 16);
  renderStage(st, 1.0); bloom(0.35);
};

// ===================== 15. SCAN (140-152): Ana's ultrasound — "It's a boy." Lucía beside her =====================
SHOT_FN.scan = (lt, dur, t) => {
  const S = once('scan', () => { const st = makeStage({ hemi: 0.75, sky: 0xf4ece0, ground: 0x7a6a58, key: 1.0, keyCol: '#fff0e0', box: 6 }); st.setSun(dirV(-40 * DEG, 30 * DEG)); st.scene.background = lin('#b8c4c0');
    plane(st, 10, 10, STDm({ map: wrap(texTiles('scant', '#e0dccc', 'rgba(150,140,120,0.5)', 2), 5, 5) }), 0, 0, 0); const wallM = STDm({ color: '#d8e4dc' }); box(st, 10, 3, 0.2, wallM, 0, 1.5, -2.2); box(st, 0.2, 3, 10, wallM, -2.6, 1.5, 0);
    box(st, 0.8, 0.6, 2.0, STDm({ color: '#2a8a8a' }), 0, 0.3, 0); box(st, 0.82, 0.12, 2.0, STDm({ color: '#f4f0e8' }), 0, 0.66, 0); box(st, 0.8, 0.12, 0.6, STDm({ color: '#f4f0e8' }), 0, 0.78, -0.75, 0).rotation.x = -0.4;
    const mon = new THREE.Group(); mon.position.set(-1.0, 1.55, -1.0); mon.rotation.y = 0.6; st.scene.add(mon); box(mon, 0.8, 0.55, 0.06, STDm({ color: '#1a1a1e' }), 0, 0, 0);
    const sc = document.createElement('canvas'); sc.width = 320; sc.height = 220; const stx = new THREE.CanvasTexture(sc); stx.encoding = THREE.sRGBEncoding; const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.48), new THREE.MeshBasicMaterial({ map: stx, toneMapped: false })); scr.position.z = 0.035; mon.add(scr);
    const cart = box(st, 0.6, 0.9, 0.5, STDm({ color: '#e8ece8' }), -1.0, 0.45, -1.0, 0.6); const A = makePerson(Object.assign({}, ANA, { pregnant: true })), L = makePerson(LUCIA), D = makePerson({ female: true, skin: SKINS[5], hair: '#1a1a1a', hairStyle: 'bun', top: '#2a8a8a', bottom: '#2a8a8a', seed: 111, glasses: true });
    const chair = cyl(st, 0.25, 0.25, 0.08, STDm({ color: '#1a1a1a' }), -0.75, 0.48, -0.1); st.scene.add(A.root, L.root, D.root);
    return { st, sc, stx, A, L, D }; });
  const { st, sc, stx, A, L, D } = S;
  { const x = sc.getContext('2d'), w = sc.width, h = sc.height; x.fillStyle = '#05070a'; x.fillRect(0, 0, w, h); x.save(); x.beginPath(); x.moveTo(w / 2, 10); x.arc(w / 2, 10, h * 0.95, Math.PI * 0.25, Math.PI * 0.75); x.closePath(); x.clip(); const R = RNG('us', Math.floor(t * 12));
    for (let i = 0; i < 2600; i++) { const g = R.r(0, 120); x.fillStyle = `rgb(${g},${g},${g})`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); } x.fillStyle = 'rgba(220,220,220,0.85)'; x.beginPath(); x.ellipse(w / 2 + 10, h * 0.55, 46, 30, 0.3, 0, TAU); x.fill(); x.beginPath(); x.arc(w / 2 - 34, h * 0.5, 22, 0, TAU); x.fill(); x.restore();
    x.fillStyle = '#9ad0ff'; x.font = '14px monospace'; x.fillText('18w 3d', 10, 20); if (lt > 4) { x.fillStyle = '#ffffff'; x.font = 'bold 22px sans-serif'; x.fillText("ES UN NIÑO", w / 2 - 64, h - 18); } stx.needsUpdate = true; }
  const news = ss(4.2, 5.2, lt);
  posePerson(A, { x: 0.35, y: 0.2, z: 0.2, yaw: 1.2, sit: 1, lean: -0.15, headYaw: -0.7 * (1 - news), headPitch: -0.05, armL: [0.55, 0.05, 1.25], armR: [1.0 + 0.4 * news, 0.3, 1.2 + 0.6 * news], emo: { surprise: 0.5 * news * (1 - ss(6, 7, lt)), smile: news, cry: 0.4 * ss(6, 8, lt), open: 0.4 * news }, look: [-0.6 * (1 - news), 0.2] });
  posePerson(L, { x: 1.25, z: -0.55, yaw: -1.2, headPitch: -0.1, emo: { surprise: news * (1 - ss(7, 8, lt)), smile: ss(7, 8, lt), open: 0.6 * news }, armL: [2.4 * ss(8, 8.6, lt), 0.4, 0.4], armR: [2.4 * ss(8, 8.6, lt), 0.4, 0.4], look: [-0.6, 0] });
  posePerson(D, { x: -0.75, y: 0.0, z: -0.1, yaw: 1.1, sit: 1, armR: [1.0, -0.2, 0.6], armL: [1.4, 0.2, 1.2], headYaw: -0.6 + 0.6 * ss(4, 5, lt), emo: { smile: 0.6 * news, determined: 0.4 }, look: [0.3, 0] });
  camLook(st.cam, 2.6, 1.35, 1.2 - lt * 0.03, 0.4, 1.1, 0.0); st.cam.fov = 42; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.4, 17);
  renderStage(st, 1.0); bloom(0.3);
};

// ===================== 16. WARD (152-162): the maternity ward — Lucía meets her baby brother =====================
SHOT_FN.ward = (lt, dur, t) => {
  const S = once('ward', () => { const st = makeStage({ hemi: 0.85, sky: 0xfff4e0, ground: 0x8a7a68, key: 2.4, keyCol: '#ffe8c8', box: 6 }); st.setSun(dirV(-70 * DEG, 18 * DEG)); st.scene.background = lin('#f0e8d8');
    plane(st, 10, 10, STDm({ map: wrap(texTiles('wardt', '#e8e0d0', 'rgba(150,140,120,0.4)', 2), 5, 5) }), 0, 0, 0); const wallM = STDm({ color: '#f0e8dc' }); box(st, 10, 3, 0.2, wallM, 0, 1.5, -2); box(st, 0.2, 3, 10, wallM, -2.4, 1.5, 0);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), new THREE.MeshBasicMaterial({ color: '#fff4d8', toneMapped: false })); win.position.set(-2.28, 1.7, 0); win.rotation.y = Math.PI / 2; st.scene.add(win);
    box(st, 1.0, 0.5, 2.0, STDm({ color: '#d8dcdc', metalness: 0.4 }), 0, 0.35, 0); const sheet = box(st, 1.02, 0.2, 2.02, STDm({ map: wrap(g3Tex((x, w) => { x.fillStyle = '#c8dcf0'; x.fillRect(0, 0, w, w); x.strokeStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, w); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }, 128, 128), 3, 3) }), 0, 0.7, 0.2);
    box(st, 1.0, 0.6, 0.12, STDm({ color: '#f4f4f4' }), 0, 0.9, -0.98);
    const A = makePerson(Object.assign({}, ANA, { top: '#d8e4f0' })), L = makePerson(LUCIA); st.scene.add(A.root, L.root);
    // the baby: a little face in a soft blue blanket bundle
    const baby = new THREE.Group(); st.scene.add(baby); const bl = STDm({ color: '#8ac0e8', roughness: 0.9 }); const bun = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.16, 6, 12).rotateX(Math.PI / 2), bl); bun.castShadow = true; baby.add(bun);
    const bf = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), STDm({ color: SKINS[1] })); bf.position.set(0, 0.03, 0.12); baby.add(bf); const hood = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 10, 0, TAU, 0, Math.PI * 0.6), bl); hood.position.set(0, 0.035, 0.11); hood.rotation.x = -1.1; baby.add(hood);
    [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.003, 4, 8, Math.PI), STDm({ color: '#3a2a20' })); e.position.set(s * 0.022, 0.045, 0.18); e.rotation.z = Math.PI; baby.add(e); });
    return { st, A, L, baby }; });
  const { st, A, L, baby } = S, lean = ss(1.5, 3.5, lt);
  posePerson(A, { x: 0.62, y: 0.32, z: 0.3, yaw: Math.PI / 2, sit: 1, headPitch: 0.35, headYaw: 0.25, armL: [0.9, 0.35, 1.75], armR: [0.9, 0.35, 1.75], emo: { smile: 0.8, cry: 0.25, sleepy: 0.2 }, look: [0.5, -0.3] });
  A.root.updateMatrixWorld(true); const bp = new THREE.Vector3(0.0, 0.88, 0.3).applyMatrix4(A.root.matrixWorld); baby.position.copy(bp); baby.rotation.set(0.9, Math.PI / 2 + 0.3, 0);
  posePerson(L, { x: 1.45, z: 0.9, yaw: -2.2, lean: 0.3 * lean, headPitch: 0.3 * lean, emo: { smile: lean, open: 0.3 * lean, surprise: 0.4 * (1 - lean) }, armL: [0.9 * lean, 0.3, 0.6], armR: [1.4 * ss(5, 6, lt), 0.1, 0.4], look: [-0.4, -0.5] });
  camLook(st.cam, 2.9, 1.3, -0.2, 0.9, 1.1, 0.5); st.cam.fov = 40; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.4, 18);
  renderStage(st, 1.05); bloom(0.4);
};

// ===================== 17. STREET2 (162-172): years later — same street, same bike; Lucía lets go, her brother rides on =====================
SHOT_FN.street2 = (lt, dur, t) => {
  const S = once('street2', () => { const st = makeStage({ skyTop: '#7aa8d8', skyHor: '#f0dcc0', hemi: 0.75, key: 2.6, keyCol: '#ffe0b8', box: 18, fog: '#e8d8c0', fogNear: 40, fogFar: 220 }); suburb(st);
    const L = makePerson(Object.assign({}, LUCIA, { kidScale: 0.9, top: '#2a6a9a', hairStyle: 'pony' })), Bo = makePerson({ kid: true, kidScale: 0.62, skin: SKINS[1], hair: '#4a3020', hairStyle: 'short', top: '#c8372d', bottom: '#3a6ab0', shorts: true, iris: '#3a5a2a', seed: 121 }), B = bike('#2a9d8f');
    const A = makePerson(Object.assign({}, ANA, { top: '#3cae5c' })); [L.root, Bo.root, B.g, A.root].forEach((m) => st.scene.add(m)); return { st, L, Bo, B, A }; });
  const { st, L, Bo, B, A } = S, LET = 4.0, run = lt * 1.9, z = 6 - run, ph = lt * 5.0;
  rideBike(Bo, B, 0.4 + 0.04 * Math.sin(lt * 3), z, Math.PI, ph, { smile: 1, open: 0.5 }, [0, 0], lt > LET + 2 ? 0.0 : 0);
  const keep = lt < LET ? 1 : 0, lz = lt < LET ? z + 0.25 : z + 0.25 + (lt - LET) * 1.9 * (1 - ss(LET, LET + 2.5, lt)) * 0.0 + Math.min(lt - LET, 2.5) * 1.2;
  posePerson(L, { x: 1.05, z: lt < LET ? z + 0.25 : (6 - LET * 1.9 + 0.25) - Math.min(lt - LET, 1.2) * 1.0, yaw: Math.PI, run: lt < LET ? 0.5 : 0.3 * (1 - ss(LET + 0.5, LET + 1.5, lt)), ph: lt * 9, lean: 0.3 * keep, armL: keep ? [0.9, 0.25, 0.4] : [2.5 * ss(LET + 1.5, LET + 2.2, lt), 0.3, 0.2], armR: keep ? [0.4, 0.1, 0.3] : [2.5 * ss(LET + 1.5, LET + 2.2, lt), 0.3, 0.2], emo: { smile: 1, open: 0.4 + 0.3 * ss(LET + 1, LET + 2, lt) }, look: [-0.3, -0.1] });
  posePerson(A, { x: -4.6, y: 0.06, z: 1.8, yaw: Math.PI - 0.5, armR: [0.6, 0.3, 1.4], armL: [0.3, 0.2, 0.5], emo: { smile: 0.8, cry: 0.2 }, headYaw: 0.3, look: [0.4, 0] });
  const cz = z - 3.6; camLook(st.cam, 0.6 + 0.3 * Math.sin(lt * 0.3), 1.05 + 0.6 * ss(6, 10, lt), cz + 1.5 * ss(6, 10, lt), 0.5, 0.8, z + 1.5); st.cam.fov = 48; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.7, 19);
  st.setSun(dirV(-130 * DEG, 24 * DEG), new THREE.Vector3(0, 0, z)); renderStage(st, 1.05); bloom(0.3);
};
