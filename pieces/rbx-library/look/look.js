// rbx-library look sheet: panels staged on the sets with the dino hero, the Gneef-style cast and the Late Fee. node look/look.mjs [panels] -> look/<panel>.png
'use strict';
const LOOK = { S: {} };
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, W = 1080, H = 1920;
  const renderer = new T.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.physicallyCorrectLights = true;
  const post = new RBX.Post(renderer, W, H, 2), cam = new T.PerspectiveCamera(50, W / H, 0.1, 4000);
  const extras = []; const add = (scene, o) => { scene.add(o); extras.push(o); return o; };
  const put = (scene, name, o = {}) => { const a = CAST.put(scene, name, o); a.root.scale.setScalar(a.o.scale || 1); if (o.ground !== undefined) CP.ground(a, o.ground); return a; };
  LOOK.set = async (k) => LOOK.S[k] || (LOOK.S[k] = await SETS[k]({ renderer }));
  function studio(bg = '#9fb8d8') {
    if (LOOK.studio) return LOOK.studio;
    const scene = new T.Scene(); ENV.sky(scene, renderer, { top: '#6a9ad8', mid: '#a8c8ec', hor: '#dce8f4', env: true }); scene.background = new T.Color(bg);
    const fl = new T.Mesh(new T.PlaneGeometry(300, 300), new T.MeshStandardMaterial({ color: '#c8c0b0', roughness: 0.8 })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; scene.add(fl);
    scene.add(new T.HemisphereLight('#dfe8ff', '#6a6050', 1.5));
    const k = new T.DirectionalLight('#fff2dc', 5); k.position.set(10, 22, 16); k.castShadow = true; k.shadow.mapSize.set(4096, 4096); k.shadow.bias = -0.0004; Object.assign(k.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); scene.add(k);
    const f = new T.DirectionalLight('#cfe0ff', 1.4); f.position.set(-12, 8, 10); scene.add(f);
    return (LOOK.studio = { scene });
  }
  LOOK.studioScene = () => studio().scene;
  const lineUp = (S, names, o = {}) => { const gap = o.gap || 3.2, x0 = -((names.length - 1) * gap) / 2;
    return names.map((n, i) => put(S.scene, n, { p: [x0 + i * gap, 0, 0], ry: o.ry ?? 0, face: o.faces ? o.faces[i] : undefined, pose: o.poses ? o.poses[i] : undefined })); };
  LOOK.lineUp = lineUp;
  LOOK.panels = {};
  // ---- self-check panels (isolated: front / side / 3-4 / back) ----
  const MAIN = ['hero', 'nico', 'nicoPJ', 'mom', 'dale'], SEC = ['pjdad', 'pjmom', 'pjafro', 'kid1', 'kid2', 'kid3', 'kid4'];
  const iso = (names, ry, gap = 4, p = [0, 6, 26], l = [0, 3.8, 0], fov = 40) => () => { const S = studio(); lineUp(S, names, { gap, ry }); return { scene: S.scene, p, l, fov, grade: 'day', post: { aperture: 0 } }; };
  [['front', 0], ['side', PI / 2], ['34', 0.75], ['back', PI]].forEach(([k, ry]) => { LOOK.panels['chk_main_' + k] = iso(MAIN, ry, 4.4, [0, 4.5, 30], [0, 3.4, 0], 52); LOOK.panels['chk_sec_' + k] = iso(SEC, ry, 3.4, [0, 4.0, 30], [0, 2.6, 0], 52);
    LOOK.panels['chk_lf_' + k] = () => { const S = studio(); const a = put(S.scene, 'latefee', { p: [-4.2, 0, 0], ry }); const b = put(S.scene, 'latefeeKind', { p: [4.2, 0, 0], ry }); const h = put(S.scene, 'hero', { p: [0, 0, 3], ry }); return { scene: S.scene, p: [0, 8, 34], l: [0, 6.8, 0], fov: 50, grade: 'day', post: { aperture: 0 } }; };
    LOOK.panels['chk_lfhigh_' + k] = () => { const S = studio(); const a = put(S.scene, 'latefee', { p: [0, 0, 0], ry, pose: LF.POSE.high }); return { scene: S.scene, p: [0, 8, 30], l: [0, 8, 0], fov: 50, grade: 'day', post: { aperture: 0 } }; }; });
  LOOK.face1 = (n, ry = 0.3) => () => { const S = studio(); const a = put(S.scene, n, { p: [0, 0, 0], ry }); a.root.updateMatrixWorld(true); const h = a.head.getWorldPosition(new T.Vector3()); const d = a.isCreature ? 7 : 4.2; return { scene: S.scene, p: [h.x + 1.0, h.y + 0.2, h.z + d], l: h.toArray(), fov: 40, grade: 'day', post: { aperture: 0 } }; };
  ['hero', 'nico', 'nicoPJ', 'mom', 'dale', 'pjdad', 'pjmom', 'pjafro', 'latefee', 'latefeeKind'].forEach((n) => { LOOK.panels['chk_f_' + n] = LOOK.face1(n); LOOK.panels['chk_fs_' + n] = LOOK.face1(n, 1.2); });
  LOOK.panels.chk_nicobook = () => { const S = studio(); const b = add(S.scene, BOOK.face(Object.assign({ w: 2.4, h: 3.2, d: 0.5 }, BOOK.NICO))); const c = add(S.scene, BOOK.face(Object.assign({ w: 2.4, h: 3.2, d: 0.5 }, BOOK.DALE))); c.position.x = 2.8; b.position.x = -0.4; return { scene: S.scene, p: [1.2, 1.8, 7], l: [1.2, 1.6, 0], fov: 45, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_heads = () => { const S = studio(); lineUp(S, ['hero', 'nico', 'mom', 'dale', 'pjmom'], { gap: 3.6, ry: 0.25 }); return { scene: S.scene, p: [0, 5.6, 13], l: [0, 5.0, 0], fov: 60, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_books = () => { const S = studio(); const C = BOOK.covers(32); [BOOK.NICO, BOOK.DALE].forEach((o, i) => { const b = add(S.scene, BOOK.face(Object.assign({ w: 2.4, h: 3.2, d: 0.5 }, o))); b.position.set(-1.5 + i * 3, 0, 0); });
    for (let i = 0; i < 8; i++) { const b = add(S.scene, BOOK.face(Object.assign({ w: 1.5, h: 2.0, d: 0.35 }, { cover: '#6a2a6a', title: 'KID ' + i, who: BOOK.KID(i), seed: i }))); b.position.set(-6 + i * 1.7, 0, 3); }
    return { scene: S.scene, p: [0, 3, 12], l: [0, 1.6, 0], fov: 50, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_hand = () => { const S = studio(); const h = add(S.scene, LF.hand()); h.rotation.x = 0.3; return { scene: S.scene, p: [3, 4, 5], l: [0, 2.8, 0], fov: 45, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_stamps = () => { const S = studio(); const a = put(S.scene, 'latefee', { p: [0, 0, 0], ry: 0, pose: { armL: [-1.5, 0, 0.3], armR: [-1.5, 0, -0.3], elbowL: [0, 0, 0], elbowR: [0, 0, 0] } }); return { scene: S.scene, p: [0, 2, 10], l: [0, 5, 0], fov: 55, grade: 'day', post: { aperture: 0 } }; };

  window.renderPanel = async (k) => {
    try {
      CAST.hideAll(); extras.forEach((o) => o.parent && o.parent.remove(o)); extras.length = 0;
      const c = await LOOK.panels[k](); cam.fov = c.fov || 50; cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); if (c.roll) cam.rotateZ(c.roll); cam.near = c.near || 0.1; cam.far = c.far || 4000; cam.updateProjectionMatrix();
      const g = Object.assign({}, KIT.GRADE[c.grade || 'day'], { focus: c.focus || cam.position.distanceTo(V(...(c.f || c.l))) }, c.post || {});
      post.render(c.scene, cam, g); const px = new Uint8Array(4), gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); post.render(c.scene, cam, g); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const ms = Math.round(performance.now() - t);
      return { url: renderer.domElement.toDataURL(window.FMT || 'image/png'), ms };
    } catch (e) { console.log('ERR', k, e.message, e.stack); return null; }
  };
  LOOK.faceCam = (a, cp, k = 1) => { const h = a.head.getWorldPosition(new THREE.Vector3()), t = Math.atan2(cp[0] - h.x, cp[2] - h.z); let d = t - a.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.neck.rotation.y = THREE.MathUtils.clamp(d * k, -1.2, 1.2); };
  LOOK.add = add; LOOK.put = put; LOOK.V = V; LOOK.extras = extras;
  window.READY = true;
})();
