// rbx-chess look test: 6 vertical panels staged on the real sets (kingdom, box) with the CHESS cast.
'use strict';
const LOOK = { S: {} };
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, W = 1080, H = 1920;
  const renderer = new T.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.physicallyCorrectLights = true;
  const post = new RBX.Post(renderer, W, H, 2), cam = new T.PerspectiveCamera(50, W / H, 0.1, 4000);
  const put = (scene, name, o) => { const a = CAST.put(scene, name, o); return a; };
  const mark = (S, k) => S.marks[k].p;
  const extras = []; const add = (scene, o) => { scene.add(o); extras.push(o); return o; };

  // studio for character checks
  function studio() {
    if (LOOK.studio) return LOOK.studio;
    const scene = new T.Scene(); scene.background = new T.Color('#8fa8c8');
    const fl = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshStandardMaterial({ color: '#c8c0b0', roughness: 0.8 })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; scene.add(fl);
    scene.add(new T.HemisphereLight('#dfe8ff', '#6a6050', 1.6));
    const k = new T.DirectionalLight('#fff2dc', 5); k.position.set(10, 20, 14); k.castShadow = true; k.shadow.mapSize.set(2048, 2048); Object.assign(k.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); scene.add(k);
    return (LOOK.studio = { scene });
  }

  const K = () => LOOK.S.kingdom, B = () => LOOK.S.box;
  const P = (S, name, mk, o = {}) => put(S.scene, name, Object.assign({ p: S.marks[mk] ? S.marks[mk].p : mk, ry: S.marks[mk] ? S.marks[mk].ry : 0 }, o));
  LOOK.panels = {
    // (a) wide: the kingdom on the board, fog of row eight in the foreground, castle at the far end
    a_kingdom: () => { const S = K(); S.reset(); S.mood('day');
      ['pawn0', 'pawn1', 'pawn2', 'pawn3', 'pawn4', 'pawn5'].forEach((n, i) => put(S.scene, n, { p: [-50 + i * 19, 0, -30 + (i % 2) * 4], ry: i % 2 ? PI / 2 : -PI / 2 }));
      put(S.scene, 'hero', { p: S.marks.p_hero_home.p, ry: PI }); put(S.scene, 'dad', { p: S.marks.p_bakery_roof.p, ry: 0.4 });
      return { scene: S.scene, p: [34, 62, -104], l: [-4, 0, 6], fov: 58, grade: 'day', post: { aperture: 0 } }; },
    // (b) hero pawn + dad knight
    b_family: () => { const S = K(); S.reset(); S.mood('morning'); const h = [S.marks.p_hero_home.p[0], 0, -37.2];
      put(S.scene, 'hero', { p: [h[0] - 1.4, 0, h[2] + 1], ry: 0.3, face: 'neutral', pose: { armR: [-0.2, 0, -0.05] } });
      put(S.scene, 'dad', { p: [h[0] + 2.2, 0, h[2] - 0.6], ry: -0.4, face: 'smile', pose: { armL: [-1.0, 0, 0.9], head: [0.12, -0.3, 0] } });
      return { scene: S.scene, p: [h[0] - 1.2, 4.6, h[2] + 8.8], l: [h[0] + 0.5, 5.8, h[2]], fov: 54, grade: 'morning', f: [h[0] - 1.4, 5.5, h[2] + 1] }; },
    // (c) the citizens: back row queen, king, rook taxi; front row aunt + uncle waving across the square line, baker
    c_citizens: () => { const S = K(); S.reset(); S.mood('day'); const x0 = -22, z0 = -2;
      if (!LOOK.dais) { LOOK.dais = new THREE.Mesh(CHESS.latheGeo([[0, 0], [6.2, 0], [6.4, 0.5], [5.8, 0.8], [5.6, 1.3], [5.9, 1.5], [0, 1.5]], 64), CHESS.lacquer('b')); LOOK.dais.castShadow = LOOK.dais.receiveShadow = true; }
      add(S.scene, LOOK.dais).position.set(x0, 0, z0 - 7.5);
      put(S.scene, 'queen', { p: [x0 - 2.1, 1.5, z0 - 7], ry: 0.25, face: 'haughty' }); put(S.scene, 'king', { p: [x0 + 2.1, 1.5, z0 - 7.4], ry: -0.15, face: 'kindly' });
      put(S.scene, 'baker', { p: [x0 - 4.9, 0, z0 - 3.4], ry: 0.35, face: 'closed' }); put(S.scene, 'rook', { p: [x0 + 4.9, 0, z0 - 3.4], ry: -0.35, face: 'neutral' });
      put(S.scene, 'aunt', { p: [x0 - 2.5, 0, z0 + 1.2], ry: -0.55, face: 'lashes', pose: CAST.POSE.wave }); put(S.scene, 'uncle', { p: [x0 + 2.5, 0, z0 + 1.2], ry: 0.55, face: 'smile', pose: CAST.POSE.waveL });
      return { scene: S.scene, p: [x0, 8.8, z0 + 24], l: [x0, 5.4, z0 - 3], fov: 46, grade: 'day', f: [x0, 5, z0 - 2] }; },
    // (d) game night: the clouds slide back, the Hand comes down over the street
    d_gamenight: () => { const S = K(); S.reset(); S.mood('gamenight'); const c = S.props.lid.c, zs = -32;
      S.props.handAt([c.x - 2, 34, zs], { pinch: 0.3, yaw: PI / 2, tilt: 0.25 });
      put(S.scene, 'hero', { p: [c.x + 54, 0, zs - 2.6], ry: -PI / 2 - 0.25, face: 'scared', pose: CAST.POSE.lookUp });
      [['aunt', 44, 3.5, 0.5], ['uncle', 40, -3.6, -0.4], ['pawn2', 30, 4, 0.2], ['pawn5', 22, -4.5, -0.3], ['pawn0', 16, 3, 0.4], ['baker', 50, 5.5, 0.8]].forEach(([n, dx, dz, r]) => put(S.scene, n, { p: [c.x + dx, 0, zs + dz], ry: -PI / 2 + r, face: 'scared', pose: CAST.POSE.lookUp }));
      return { scene: S.scene, p: [c.x + 68, 5, zs + 0.5], l: [c.x, 44, zs], fov: 72, grade: 'gamenight', f: [c.x, 30, zs], post: { aperture: 0.22 } }; },
    // (e) row eight: the hero at the edge of the fog
    e_fog: () => { const S = K(); S.reset(); S.mood('day'); const m = S.marks.p_fog_edge.p;
      put(S.scene, 'hero', { p: [m[0] + 0.4, 0, m[2] + 0.3], ry: PI + 0.55, face: 'determined', pose: { legL: [0.45, 0, 0], legR: [-0.4, 0, 0], armL: [-0.35, 0, 0], armR: [0.35, 0, 0] } });
      return { scene: S.scene, p: [m[0] - 1.4, 8.5, m[2] + 21], l: [m[0] + 0.2, 6.5, m[2] - 20], fov: 54, grade: 'day', f: [m[0], 4, m[2]] }; },
    // (f) inside the Box: dad on top of the heap, the slit of light
    f_box: () => { const S = B(); const m = S.marks.p_dad_top.p;
      put(S.scene, 'dad', { p: [m[0], m[1] - 1.3, m[2] + 1], ry: -0.5, sit: true, face: 'surprised', pose: { armL: [-0.5, 0, 0.7], armR: [-2.5, 0, -0.4], head: [-0.15, 0, 0.1], legL: [-1.35, 0, 0.15], legR: [-1.6, 0, -0.1] } });
      return { scene: S.scene, p: [m[0] - 5.5, m[1] + 2.6, m[2] + 11], l: [m[0] + 2.5, m[1] + 7.5, m[2] - 8], fov: 60, grade: 'box', f: [m[0], m[1] + 3, m[2] + 1] }; },
    // character turn checks (not in the sheet)
    chars_a: () => { const S = studio(); put(S.scene, 'hero', { p: [-2.6, 0, 0], ry: 0.3 }); put(S.scene, 'dad', { p: [2.6, 0, 0], ry: -0.3 }); return { scene: S.scene, p: [0, 5, 17], l: [0, 4, 0], fov: 50, grade: 'day' }; },
    chars_b: () => { const S = studio(); put(S.scene, 'dad', { p: [0, 0, 0], ry: PI / 2 + 0.5 }); return { scene: S.scene, p: [0, 7.5, 8], l: [0, 6.8, 0], fov: 45, grade: 'day' }; },
    chars_c: () => { const S = studio(); ['rook', 'aunt', 'uncle'].forEach((n, i) => put(S.scene, n, { p: [(i - 1) * 4.4, 0, 0], ry: 0 })); return { scene: S.scene, p: [0, 6, 21], l: [0, 4.5, 0], fov: 50, grade: 'day' }; },
    chars_e: () => { const S = studio(); ['queen', 'king', 'baker'].forEach((n, i) => put(S.scene, n, { p: [(i - 1) * 4.6, 0, 0], ry: 0 })); return { scene: S.scene, p: [0, 6, 21], l: [0, 4.5, 0], fov: 50, grade: 'day' }; },
    chars_d: () => { const S = studio(); ['pawn0', 'pawn1', 'pawn2', 'pawn3'].forEach((n, i) => put(S.scene, n, { p: [(i - 1.5) * 4.2, 0, 0], ry: 0 })); return { scene: S.scene, p: [0, 6, 22], l: [0, 4.5, 0], fov: 50, grade: 'day' }; },
    dadface: () => { const S = studio(); put(S.scene, 'dad', { p: [0, 0, 0], ry: 0.6 }); return { scene: S.scene, p: [1.5, 7.2, 6], l: [0, 6.6, 0], fov: 45, grade: 'day' }; },
    hand2: () => { const S = studio(); if (!LOOK.hand) { LOOK.hand = CHESS.hand(); S.scene.add(LOOK.hand); } const h = LOOK.hand; h.position.set(0, 26, 0); h.rotation.set(0, -0.4, 0); h.userData.pose({ curl: [0.1, 0.12, 0.15, 0.2], thumb: 0.1 }); return { scene: S.scene, p: [8, 18, 22], l: [0, 21, 0], fov: 45, grade: 'day' }; },
    hand: () => { const S = studio(); if (!LOOK.hand) { LOOK.hand = CHESS.hand(); S.scene.add(LOOK.hand); } const h = LOOK.hand; h.position.set(0, 26, 0); h.rotation.set(0, 0.5, 0); h.userData.pinch(0.6); return { scene: S.scene, p: [8, 18, 22], l: [0, 21, 0], fov: 45, grade: 'day' }; },
  };

  window.renderPanel = (k) => {
    try {
      CAST.hideAll(); extras.forEach((o) => o.parent && o.parent.remove(o)); extras.length = 0;
      const c = LOOK.panels[k](); cam.fov = c.fov || 50; cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); if (c.roll) cam.rotateZ(c.roll); cam.updateProjectionMatrix();
      const g = Object.assign({}, KIT.GRADE[c.grade || 'day'], { focus: c.focus || cam.position.distanceTo(V(...(c.f || c.l))) }, c.post || {});
      post.render(c.scene, cam, g); const px = new Uint8Array(4), gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); post.render(c.scene, cam, g); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const ms = Math.round(performance.now() - t);
      return { url: renderer.domElement.toDataURL('image/jpeg', 0.92), ms };
    } catch (e) { console.log('ERR', k, e.message, e.stack); return null; }
  };
  LOOK.add = add; LOOK.put = put; LOOK.mark = mark;
  (async () => {
    const want = (new URLSearchParams(location.search).get('sets') || '').split(',').filter(Boolean);
    for (const n of want) if (SETS[n]) { const t = performance.now(); LOOK.S[n] = await SETS[n]({ renderer }); console.log('set', n, Math.round(performance.now() - t), 'ms'); }
    window.READY = true;
  })().catch((e) => { console.log('ERR', e.message, e.stack); window.READY = 'error'; });
})();
