// rbx-rope look sheet: panels staged on the real sets with the Gneef-style cast. node look/look.mjs [panels] -> look/<panel>.png
'use strict';
const LOOK = { S: {} };
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, W = 1080, H = 1920;
  const renderer = new T.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.physicallyCorrectLights = true;
  const post = new RBX.Post(renderer, W, H, 2), cam = new T.PerspectiveCamera(50, W / H, 0.1, 4000);
  const extras = []; const add = (scene, o) => { scene.add(o); extras.push(o); return o; };
  const put = (scene, name, o) => CAST.put(scene, name, o);
  LOOK.set = async (k) => LOOK.S[k] || (LOOK.S[k] = await SETS[k]({ renderer }));

  function studio(bg = '#9fb8d8') {
    if (LOOK.studio) return LOOK.studio;
    const scene = new T.Scene(); scene.background = new T.Color(bg);
    const fl = new T.Mesh(new T.PlaneGeometry(300, 300), new T.MeshStandardMaterial({ color: '#c8c0b0', roughness: 0.8 })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; scene.add(fl);
    scene.add(new T.HemisphereLight('#dfe8ff', '#6a6050', 1.5));
    const k = new T.DirectionalLight('#fff2dc', 5); k.position.set(10, 22, 16); k.castShadow = true; k.shadow.mapSize.set(4096, 4096); k.shadow.bias = -0.0004; Object.assign(k.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); scene.add(k);
    const f = new T.DirectionalLight('#cfe0ff', 1.4); f.position.set(-12, 8, 10); scene.add(f);
    return (LOOK.studio = { scene });
  }
  // a straight test rope through the studio along +z (toward the camera = toward the Fog)
  function studioRope(S, x, y, z0, z1) { const r = ROPE.make([V(x, y, z0), V(x, y - 0.15, (z0 + z1) / 2), V(x, y, z1)], 0.28); return add(S.scene, r); }
  const lineUp = (S, names, o = {}) => { const gap = o.gap || 3.2, x0 = -((names.length - 1) * gap) / 2;
    names.forEach((n, i) => put(S.scene, n, { p: [x0 + i * gap, o.y || 0, 0], ry: o.ry ?? 0, face: o.faces ? o.faces[i] : undefined, pose: o.poses ? o.poses[i] : undefined })); };

  LOOK.panels = {
    // ---- character checks (not in the sheet) ----
    t_cast: () => { const S = studio(); lineUp(S, ['hero', 'oona', 'girl', 'gran2'], { gap: 4 }); return { scene: S.scene, p: [0, 6, 26], l: [0, 4.2, 0], fov: 40, grade: 'day' }; },
    t_gags: () => { const S = studio(); lineUp(S, ['bride', 'groom', 'baby', 'sneezer'], { gap: 4 }); return { scene: S.scene, p: [0, 6, 26], l: [0, 4.2, 0], fov: 40, grade: 'day' }; },
    t_crowd1: () => { const S = studio(); lineUp(S, ['crowd0', 'crowd1', 'crowd2', 'crowd3', 'crowd4', 'crowd5', 'crowd6', 'crowd7'], { gap: 3.4 }); return { scene: S.scene, p: [0, 9, 40], l: [0, 3.6, 0], fov: 75, grade: 'day' }; },
    t_crowd2: () => { const S = studio(); lineUp(S, ['crowd8', 'crowd9', 'crowd10', 'crowd11', 'crowd12', 'crowd13', 'crowd14', 'crowd15'], { gap: 3.4 }); return { scene: S.scene, p: [0, 9, 40], l: [0, 3.6, 0], fov: 75, grade: 'day' }; },
    t_heads: () => { const S = studio(); lineUp(S, ['hero', 'oona', 'girl', 'gran2'], { gap: 4 }); return { scene: S.scene, p: [0, 5.4, 12], l: [0, 5.0, 0], fov: 45, grade: 'day' }; },
    t_side: () => { const S = studio(); lineUp(S, ['hero', 'oona', 'girl', 'gran2'], { gap: 4, ry: PI / 2 + 0.5 }); return { scene: S.scene, p: [0, 6, 22], l: [0, 4.6, 0], fov: 40, grade: 'day' }; },
    t_back: () => { const S = studio(); lineUp(S, ['hero', 'oona', 'girl', 'gran2'], { gap: 4, ry: PI - 0.4 }); return { scene: S.scene, p: [0, 6, 22], l: [0, 4.6, 0], fov: 40, grade: 'day' }; },
    t_faces: () => { const S = studio(); const F = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']; F.forEach((f, i) => put(S.scene, 'crowd' + (16 + i), { p: [(i % 4 - 1.5) * 3.2, Math.floor(i / 4) * -4.2 + 4.2, 0], face: f })); return { scene: S.scene, p: [0, 7.4, 16], l: [0, 7.2, 0], fov: 60, grade: 'day' }; },
    t_grip: () => { const S = studio(); const P0 = V(0, 0, 0); studioRope(S, 0, 2.9, -14, 14);
      ['hero', 'oona', 'crowd3', 'baby'].forEach((n, i) => { const z = 9 - i * 4.2, base = n === 'baby' ? 1.4 : 0; put(S.scene, n, { rope: { P: V(0, 2.9, z), D: V(0, 0, 1), side: i % 2 ? -1 : 1, ground: base } }); });
      return { scene: S.scene, p: [9, 6, 16], l: [0, 3, 2], fov: 45, grade: 'day' }; },
  };

  // ---- sheet panels ----
  const crowdRun = (S, z0, z1, step, start, faces, tags = {}) => { const E = []; let i = 0; for (let z = z0; z <= z1; z += step, i++) E.push({ name: 'crowd' + (start + i), s: S.sAt(z), face: faces ? faces[i % faces.length] : undefined, tag: tags[i] }); return E; };
  LOOK.panels.c_city = async () => { const S = await LOOK.set('city');
    const E = crowdRun(S, -8, 60, 2.7, 0, null, { 0: 'PRIYA', 1: 'GUS', 2: 'NOOB_77', 3: 'MRS. ODA', 4: 'TEO' });
    const A = LINE.stage(S.scene, S.rope, E, (o) => add(S.scene, o));
    LINE.repeat([...A, ...A.knots], V(0, 0, 70.2), 4, (o) => add(S.scene, o));
    const m = ROPE.mail({ to: 'TO: AUNT MAE, END' }); const p = S.rope.userData.curve.getPointAt(S.sAt(-11.5) / S.rope.userData.len); m.position.set(p.x, p.y, p.z); add(S.scene, m);
    return { scene: S.scene, p: [2.2, 4.6, -15.5], l: [-0.6, 3.6, 12], fov: 60, grade: 'day', f: [0, 3, -9], post: { aperture: 0.6 } }; };
  LOOK.panels.d_gags = async () => { const S = await LOOK.set('city');
    const stool = add(S.scene, new THREE.Group()); { const w = ENV.mt(ENV.T.wood('#9a6a3a'), 1); const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 1.5), w); top.position.y = 1.38; stool.add(top); [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.3, 0.22), w); l.position.set(x, 0.65, z); stool.add(l); }); ENV.shadow(stool); }
    const E = [      { name: 'bride', s: S.sAt(-1.6), face: 'F5', side: -1, hands: 'R', pose: CAST.POSE.ringUp, tag: 'MR & MRS' }, { name: 'groom', s: S.sAt(0.2), face: 'F6', side: 1, hands: 'L', pose: CAST.POSE.waveUpR, noKnot: true },
      { name: 'baby', s: S.sAt(-5.2), face: 'F7', side: 1, grounds: [1.6, 1.8, 1.4, 2.0, 1.2, 2.2, 1.0, 2.4], reach: 1.3, tag: 'DAY 1', lean: 0.05 }, { name: 'crowd2', s: S.sAt(6.8), face: 'F13', side: 1 }, { name: 'crowd12', s: S.sAt(9.6), face: 'F6', side: -1 }, { name: 'crowd3', s: S.sAt(12.4), face: 'F5', side: 1 }];
    const A = LINE.stage(S.scene, S.rope, E, (o) => add(S.scene, o));
    const b = CAST.get('baby'); stool.position.set(b.root.position.x, 0, b.root.position.z); stool.scale.y = b.ground / 1.5;
    E.slice(6).forEach(() => {}); const back = LINE.stage(S.scene, S.rope, crowdRun(S, 15.2, 40, 2.8, 30), (o) => add(S.scene, o));
    return { scene: S.scene, p: [-3.0, 4.2, -14.5], l: [0.6, 2.8, 0], fov: 54, grade: 'day', f: [0, 3.4, 0], post: { aperture: 0.6 } }; };
  LOOK.panels.e_coast = async () => { const S = await LOOK.set('coast'); const E = []; let i = 0;
    for (let z = -42; z <= 30; z += 2.9, i++) E.push({ name: 'crowd' + (40 + i), s: S.sAt(z), ground: S.ground(z), face: ['F14', 'F11', 'F1', 'F12'][i % 4] });
    const A = LINE.stage(S.scene, S.rope, E, (o) => add(S.scene, o));
    const cv = S.rope.userData.curve; [[-120, 'TO: GRANDPA LU'], [-260, 'HAPPY 9TH B-DAY']].forEach(([z, t]) => { const m = ROPE.mail({ to: t }); const p = cv.getPointAt(S.sAt(z) / S.rope.userData.len); m.position.copy(p); m.scale.setScalar(1.6); add(S.scene, m); });
    return { scene: S.scene, p: [5.6, 5.4, -55], l: [-0.6, 4.6, -28], fov: 60, grade: 'sunset', f: [0, 4.5, -40], post: { aperture: 0.4 } }; };
  const frontLine = (S, crowdFrom = 0) => { const E = [{ name: 'oona', s: S.sAt(-11.2), face: 'F2', side: 1, tag: 'OONA' }, { name: 'hero', s: S.sAt(-7.9), face: 'F1', side: -1 }]; let i = 0;
    for (let z = crowdFrom; z <= 46; z += 2.9, i++) E.push({ name: 'crowd' + (70 + i), s: S.sAt(z), face: ['F1', 'F10', 'F2', 'F3'][i % 4] });
    return LINE.stage(S.scene, S.rope, E, (o) => add(S.scene, o)); };
  LOOK.panels.f_front = async () => { const S = await LOOK.set('front'); S.mood('night'); frontLine(S); CAST.face('oona', 'calm', true); CAST.face('hero', 'worry');
    const o = CAST.get('oona').head.getWorldPosition(new THREE.Vector3());
    return { scene: S.scene, p: [o.x + 3.4, o.y + 1.2, o.z - 9.5], l: [o.x - 0.9, o.y - 0.6, o.z + 4], fov: 56, grade: 'night', f: o.toArray(), post: { aperture: 0.5, exposure: 0.82 } }; };
  // inside the Fog: hand over hand, can't see his own fingers; the rope fades both ways in a few metres
  LOOK.panels.g_fog = async () => { const S = await LOOK.set('front'); S.mood('inside'); S.bank.visible = false; S.fogW.visible = false;
    const a = CAST.put(S.scene, 'hero', { face: 'F10', rope: { P: S.rope.userData.curve.getPointAt(S.sAt(-46) / S.rope.userData.len), D: S.rope.userData.curve.getTangentAt(S.sAt(-46) / S.rope.userData.len), side: 1, lean: 0.05, ground: 0 } });
    // hand over hand: the front arm reaches further along the rope, the back hand still grips
    const hp = a.grip.hands; const fwd = S.rope.userData.curve.getTangentAt(S.sAt(-46) / S.rope.userData.len);
    const front = Object.keys(hp).reduce((b, k) => (hp[k].dot(fwd) > hp[b].dot(fwd) ? k : b)); a.neck.rotation.x = -0.12;
    add(S.scene, ROPE.knot(S.rope.userData.curve, S.sAt(-43.5) / S.rope.userData.len, 0.32, { tag: 'MEET HALFWAY?' }));
    const h = a.head.getWorldPosition(new THREE.Vector3());
    a.root.updateMatrixWorld(true); const hm = [a.armL, a.armR].map((q) => q.inner.localToWorld(new THREE.Vector3(0, -1.8, 0))), mid = hm[0].clone().add(hm[1]).multiplyScalar(0.5);
    const tp = a.torso.getWorldPosition(new THREE.Vector3()), dir = mid.clone().sub(tp).setY(0).normalize(), cp = mid.clone().addScaledVector(dir, 3.4).add(new THREE.Vector3(0, 0.9, 0)).addScaledVector(fwd, -1.2); LOOK.faceCam(a, cp.toArray(), 0.6);
    return { scene: S.scene, p: cp.toArray(), l: [mid.x, mid.y + 0.9, mid.z], fov: 60, grade: 'fog', f: mid.toArray(), post: { aperture: 0.7 } }; };
  const ridgeLines = (S, ours, theirs) => { const g = (P) => S.H(P.x, P.z); const A = LINE.stage(S.scene, S.rope, ours, (o) => add(S.scene, o), { ground: g });
    const B = LINE.stage(S.scene, S.rope, theirs, (o) => add(S.scene, o), { ground: g, flip: true }); return [A, B]; };
  const theirCrowd = (S, z0, z1, step, start) => { const E = []; let i = 0; for (let z = z0; z >= z1; z -= step, i++) E.push({ name: 'other' + (start + i), s: S.sAt(z), face: ['F14', 'F12', 'F13', 'F10', 'F8'][i % 5] }); return E; };
  LOOK.panels.h_ridge = async () => { const S = await LOOK.set('ridge'); S.mood('dawn'); const c = S.crest(0);
    ridgeLines(S, [{ name: 'hero', s: S.sAt(3.2), face: 'F8', side: 1, lean: 0.05 }],
      [{ name: 'girl', s: S.sAt(-7.5), face: 'F7', side: -1, tag: 'KNOT No.1' }, { name: 'gran2', s: S.sAt(-11), face: 'F13', side: 1 }, { name: 'other30', s: S.sAt(-14.2) }, ...theirCrowd(S, -44, -120, 3.0, 0)]);
    const gl = CAST.get('girl'), gh = gl.head.getWorldPosition(new THREE.Vector3()), cp = [gh.x + 2.2, gh.y + 3.2, gh.z + 6.5]; LOOK.faceCam(gl, cp); gl.neck.rotation.x = -0.35; LOOK.faceCam(CAST.get('gran2'), cp, 0.7);
    return { scene: S.scene, p: cp, l: [gh.x - 0.6, gh.y - 3.2, gh.z - 8], fov: 60, grade: 'sunset', f: gh.toArray(), post: { aperture: 0.45 } }; };
  LOOK.panels.i_waveday = async () => { const S = await LOOK.set('ridge'); S.mood('day'); const c = S.crest(0);
    ridgeLines(S, [{ name: 'oona', s: S.sAt(2.6), face: 'F5', side: 1, hands: 'L', pose: CAST.POSE.waveUpR, tag: 'OONA' }, { name: 'hero', s: S.sAt(5.8), face: 'F5', side: -1 }, ...crowdRun(S, 9, 40, 3, 100).map((e, i) => Object.assign(e, { face: ['F5', 'F6', 'F2'][i % 3] }))],
      [{ name: 'gran2', s: S.sAt(-3.4), face: 'F5', side: -1, hands: 'R', pose: CAST.POSE.waveL }, { name: 'girl', s: S.sAt(-6.6), face: 'F6', side: 1 }, ...theirCrowd(S, -10, -15, 3.2, 40), ...theirCrowd(S, -44, -90, 3.2, 50).map((e, i) => Object.assign(e, { face: ['F5', 'F6', 'F2'][i % 3] }))]);
    const cp = [13, c + 5.2, 12]; ['oona', 'gran2'].forEach((n) => LOOK.faceCam(CAST.get(n), cp));
    return { scene: S.scene, p: cp, l: [-1.6, c + 3.6, -3.5], fov: 54, grade: 'day', f: [0, c + 2.5, 0], post: { aperture: 0.35 } }; };
  // ---- a: cast line-up (class photo on wooden bleachers, on a suburban lawn) ----
  LOOK.panels.a_cast = async () => { const S = await LOOK.set('lawn'), sc = S.scene;
    const at = (tier, x) => [x, [0.8, 2.5, 4.2, 5.9][tier], [0, -2.4, -4.8, -7.2][tier]], LOW = { armL: [-0.45, 0, 0.12], armR: [-0.45, 0, -0.12] };
    const ppl = [['bride', 2, -3.1, 'F5', LOW], ['groom', 2, 0, 'F6', CAST.POSE.waveUpR], ['crowd8', 2, 3.1, 'F14', LOW],
      ['gran2', 1, -3.1, 'F5', LOW], ['sneezer', 1, 0, 'F12', LOW], ['crowd2', 1, 3.1, 'F13', LOW],
      ['girl', 0, -3.1, 'F2', LOW], ['hero', 0, 0, 'F1', LOW], ['oona', 0, 3.1, 'F2', LOW]];
    ppl.forEach(([n, t, x, f, po]) => put(sc, n, { p: at(t, x), ry: 0, face: f, pose: po }));
    put(sc, 'baby', { p: [-1.5, 0, 2.7], ry: 0.2, face: 'F7', pose: { armL: [-2.6, 0, 0.3], armR: [-2.6, 0, -0.3] } });
    // a length of the rope across the front row's hands
    const rp = add(sc, ROPE.make([V(-6.5, 2.75, 2.0), V(0, 2.65, 2.15), V(6.5, 2.75, 2.0)], 0.32)); add(sc, ROPE.knot(rp.userData.curve, 0.5, 0.32, { tag: 'KNOT No.1' }));
    const cp = [0, 6.4, 15.5]; ['bride', 'groom', 'crowd8', 'gran2', 'sneezer', 'crowd2'].forEach((n) => LOOK.faceCam(CAST.get(n), cp, 0.8));
    return { scene: sc, p: cp, l: [0, 5.2, -2.0], fov: 56, grade: 'day', f: [0, 5, -1], post: { aperture: 0.6 } }; };
  // ---- b: face close-ups (one render per head; sheet.py tiles them 2x3 into b_faces.png) ----
  const FC = { fc1: ['hero', 'F8'], fc2: ['oona', 'F2'], fc3: ['sneezer', 'F12'], fc4: ['girl', 'F5'], fc5: ['crowd8', 'F14'], fc6: ['crowd2', 'F13'], fc7: ['crowd5', 'F11'], fc8: ['gran2', 'F6'] };
  Object.entries(FC).forEach(([k, [n, f]]) => { LOOK.panels[k] = async () => { const S = await LOOK.set('lawn'); const a = put(S.scene, n, { p: [0, 0, 8], ry: 0.25, face: f });
    const h = a.head.getWorldPosition(new THREE.Vector3()), d = 4.3 * (a.root.scale.x) * (a.o.headScale || 1);
    return { scene: S.scene, p: [h.x + d * 0.28, h.y + 0.15, h.z + d], l: [h.x, h.y + 0.1, h.z], fov: 40, grade: 'day', f: h.toArray(), post: { aperture: 1.2, maxCoc: 18 } }; }; });
  // ---- j: the same character changes expression (Gneef): hero, Oona, girl x 5 moods (+ talk frames). sheet.py tiles them. ----
  LOOK.EXPR_GRID = { hero: ['calm', 'ohno', 'strain', 'laugh', 'scream'], oona: ['calm', 'laugh', 'sad', 'terror', 'calm-talk'], girl: ['calm', 'shock', 'grin', 'worry', 'laugh-talk'] };
  Object.entries(LOOK.EXPR_GRID).forEach(([n, moods]) => moods.forEach((m) => { LOOK.panels['x_' + n + '_' + m] = async () => { const S = await LOOK.set('lawn');
    const a = put(S.scene, n, { p: [0, 0, 8], ry: 0.2 }); const [mood, talk] = m.split('-'); CAST.face(n, mood, !!talk);
    const h = a.head.getWorldPosition(new THREE.Vector3()), d = 4.0 * a.root.scale.x * (a.o.headScale || 1);
    return { scene: S.scene, p: [h.x + d * 0.24, h.y + 0.2, h.z + d], l: [h.x, h.y + 0.15, h.z], fov: 40, grade: 'day', f: h.toArray(), post: { aperture: 1.2, maxCoc: 16 } }; }; }));
  window.renderPanel = async (k) => { if (LOOK.S.front) { LOOK.S.front.bank.visible = true; LOOK.S.front.fogW.visible = true; }
    try {
      CAST.hideAll(); extras.forEach((o) => o.parent && o.parent.remove(o)); extras.length = 0;
      const c = await LOOK.panels[k](); cam.fov = c.fov || 50; cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); if (c.roll) cam.rotateZ(c.roll); cam.near = c.near || 0.1; cam.far = c.far || 4000; cam.updateProjectionMatrix();
      const g = Object.assign({}, KIT.GRADE[c.grade || 'day'], { focus: c.focus || cam.position.distanceTo(V(...(c.f || c.l))) }, c.post || {});
      post.render(c.scene, cam, g); const px = new Uint8Array(4), gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); post.render(c.scene, cam, g); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const ms = Math.round(performance.now() - t);
      return { url: renderer.domElement.toDataURL(window.FMT || 'image/png'), ms };
    } catch (e) { console.log('ERR', k, e.message, e.stack); return null; }
  };
  LOOK.faceCam = (a, cp, k = 1) => { const h = a.head.getWorldPosition(new THREE.Vector3()), t = Math.atan2(cp[0] - h.x, cp[2] - h.z); let d = t - a.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.neck.rotation.y = THREE.MathUtils.clamp(d * k, -1.4, 1.4); };
  LOOK.add = add; LOOK.put = put; LOOK.V = V;
  window.READY = true;
})();
LOOK.panels.t_hero = () => { const S = (LOOK.studio || null); const sc = LOOK.panels.t_heads(); CAST.hideAll(); ['hero', 'girl'].forEach((n, i) => LOOK.put(sc.scene, n, { p: [i ? 2.2 : -2.2, 0, 0], ry: i ? -0.6 : 0.6, face: i ? 'F5' : 'F1' })); return { scene: sc.scene, p: [0, 5.2, 9], l: [0, 4.9, 0], fov: 62, grade: 'day' }; };
LOOK.panels.t_heroback = () => { const sc = LOOK.panels.t_heads(); CAST.hideAll(); ['hero', 'girl'].forEach((n, i) => LOOK.put(sc.scene, n, { p: [i ? 2.2 : -2.2, 0, 0], ry: i ? PI_ * 0.8 : PI_ * 1.3 })); return { scene: sc.scene, p: [0, 5.6, 9], l: [0, 4.9, 0], fov: 62, grade: 'day' }; };
const PI_ = Math.PI;
LOOK.panels.dbg_top = async () => { const S = await LOOK.set('city'); return { scene: S.scene, p: [0.01, 30, 5], l: [0, 0, 5], fov: 60, grade: 'day' }; };
LOOK.panels.dbg_rope = async () => { const S = await LOOK.set('city'); return { scene: S.scene, p: [3, 4, 0], l: [0, 2.8, 0], fov: 60, grade: 'day' }; };
LOOK.panels.dbg_ctop = async () => { const c = await LOOK.panels.c_city(); return { scene: c.scene, p: [0.01, 40, 10], l: [0, 0, 10], fov: 60, grade: 'day' }; };
LOOK.panels.t_iso = (names, ry = 0.35) => { const sc = LOOK.panels.t_heads(); CAST.hideAll(); names.forEach((n, i) => LOOK.put(sc.scene, n, { p: [(i - (names.length - 1) / 2) * 3.6, 0, 0], ry })); return { scene: sc.scene, p: [0, 4.6, 15], l: [0, 3.6, 0], fov: 62, grade: 'day' }; };
LOOK.panels.t_gags2 = () => LOOK.panels.t_iso(['bride', 'groom', 'baby']);
LOOK.panels.t_gags3 = () => LOOK.panels.t_iso(['sneezer', 'oona', 'gran2']);
LOOK.panels.dbg_ridge = async () => { const c = await LOOK.panels.h_ridge(); return { scene: c.scene, p: [260, 50, -30], l: [0, 40, -30], fov: 40, grade: 'sunset', post: { aperture: 0 } }; };
// self-check: arms attached in every pose (front / side / 3-4) and moustache shapes
LOOK.chk = (ry) => { const sc = LOOK.panels.t_heads(); CAST.hideAll(); const P = CAST.POSE;
  [['hero', { armL: [-0.45, 0, 0.12], armR: [-1.2, 0, 0.25] }], ['girl', P.waveUpR], ['oona', P.cheer], ['crowd2', P.crossed]].forEach(([n, po], i) => LOOK.put(sc.scene, n, { p: [(i % 2 - 0.5) * 4.2, 0, i < 2 ? 0 : -7], ry, pose: po }));
  return { scene: sc.scene, p: [0, 7.5, 17], l: [0, 5.5, -3], fov: 62, grade: 'day' }; };
LOOK.panels.chk_front = () => LOOK.chk(0); LOOK.panels.chk_side = () => LOOK.chk(Math.PI / 2); LOOK.panels.chk_34 = () => LOOK.chk(0.75);
LOOK.panels.chk_grip = () => LOOK.panels.t_grip();
LOOK.panels.chk_stache = () => { const sc = LOOK.panels.t_heads(); CAST.hideAll(); ['crowd2', 'crowd8', 'sneezer'].forEach((n, i) => LOOK.put(sc.scene, n, { p: [(i - 1) * 3.4, 0, 0], ry: (i - 1) * -0.35, face: 'F1' })); return { scene: sc.scene, p: [0, 5.0, 11], l: [0, 4.9, 0], fov: 60, grade: 'day' }; };
LOOK.panels.chk_w = () => { const sc = LOOK.panels.t_heads(); CAST.hideAll(); ['crowd8', 'crowd8'].slice(0, 1).forEach((n) => LOOK.put(sc.scene, n, { p: [0, 0, 0], ry: 0.9, face: 'F1' })); return { scene: sc.scene, p: [0, 5.2, 6.5], l: [0, 4.9, 0], fov: 50, grade: 'day' }; };
