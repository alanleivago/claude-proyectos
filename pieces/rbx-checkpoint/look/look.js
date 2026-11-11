// rbx-checkpoint look sheet: panels staged on the sets with the Gneef-style cast. node look/look.mjs [panels] -> look/<panel>.png
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
  const MAIN = ['hero', 'turbo', 'flagman', 'fire1', 'fire2'], SEC = ['rich', 'teacher', 'tuba', 'topguy', 'swim1', 'swim2', 'kidA', 'kidB'];
  const iso = (names, ry, gap = 4, p = [0, 6, 26], l = [0, 3.8, 0], fov = 40) => () => { const S = studio(); lineUp(S, names, { gap, ry }); return { scene: S.scene, p, l, fov, grade: 'day', post: { aperture: 0 } }; };
  [['front', 0], ['side', PI / 2], ['34', 0.75], ['back', PI]].forEach(([k, ry]) => { LOOK.panels['chk_main_' + k] = iso(MAIN, ry, 4.4, [0, 4.5, 30], [0, 3.4, 0], 52); LOOK.panels['chk_sec_' + k] = iso(SEC, ry, 3.6, [0, 4.5, 36], [0, 3.0, 0], 52); });
  LOOK.panels.chk_heads = () => { const S = studio(); lineUp(S, ['hero', 'flagman', 'fire1', 'fire2', 'rich'], { gap: 3.6, ry: 0.25 }); return { scene: S.scene, p: [0, 5.6, 13], l: [0, 5.3, 0], fov: 60, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_heads2 = () => { const S = studio(); lineUp(S, ['teacher', 'tuba', 'topguy', 'swim1', 'swim2'], { gap: 3.6, ry: 0.25 }); return { scene: S.scene, p: [0, 5.0, 13], l: [0, 4.6, 0], fov: 60, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_dog = () => { const S = studio(); const P = DOG.POSE; [['stand', 0.6], ['trip', -0.6], ['sit', 2.0], ['jump', 1.57]].forEach(([k, ry], i) => { const a = put(S.scene, 'turbo', { p: [0, 0, 0], ry });
      const b = DOG.make({ fur: '#e0a050', cream: '#f8e6c4', ear: '#9a5426', patch: '#b8702e', tag: '#1f4fd8' }); add(S.scene, b.root); b.root.position.set((i - 1.5) * 4.5, 0, 0); b.root.rotation.y = ry; b.pose(P[k]); b.setFace(['calm', 'dizzy', 'happy', 'bark'][i]); CP.ground(b); a.root.visible = false; });
    return { scene: S.scene, p: [0, 4, 16], l: [0, 1.8, 0], fov: 55, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_dogside = () => { const S = studio(); const a = put(S.scene, 'turbo', { p: [0, 0, 0], ry: PI / 2 }); return { scene: S.scene, p: [0, 2.2, 9], l: [0, 1.6, 0], fov: 45, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_dogfront = () => { const S = studio(); const a = put(S.scene, 'turbo', { p: [0, 0, 0], ry: 0 }); return { scene: S.scene, p: [0, 2.6, 7.5], l: [0, 1.8, 0], fov: 45, grade: 'day', post: { aperture: 0 } }; };
  LOOK.face1 = (n, ry = 0.3) => () => { const S = studio(); const a = put(S.scene, n, { p: [0, 0, 0], ry }); const h = a.head.getWorldPosition(new T.Vector3()); return { scene: S.scene, p: [h.x + 1.0, h.y + 0.2, h.z + 4.2], l: h.toArray(), fov: 40, grade: 'day', post: { aperture: 0 } }; };
  ['hero', 'fire1', 'rich', 'tuba', 'teacher', 'flagman'].forEach((n) => { LOOK.panels['chk_f_' + n] = LOOK.face1(n); });
  LOOK.panels.chk_crowd = () => { const S = studio(); lineUp(S, Array.from({ length: 10 }, (_, i) => 'crowd' + i), { gap: 3.3 }); return { scene: S.scene, p: [0, 7, 42], l: [0, 3.4, 0], fov: 52, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_props = () => { const S = studio(); add(S.scene, CP.checkpoint({ c: CP.COL.hero, emblem: 'flame', h: 4.5 })).position.set(-5, 0, 0); add(S.scene, CP.poof({ r: 1.6, phase: 0.3 })).position.set(0, 0, 0); add(S.scene, CP.popIn({})).position.set(5, 0, 0); return { scene: S.scene, p: [0, 5, 18], l: [0, 2.5, 0], fov: 50, grade: 'day', post: { aperture: 0 } }; };

  // ---- set overviews (debug) ----
  LOOK.panels.dbg_town = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = false; return { scene: S.scene, p: [0, 14, 42], l: [4, 14, -40], fov: 70, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.dbg_fair = async () => { const S = await LOOK.set('town'); S.mood('sunset'); S.fair.visible = true; S.crack.visible = true; return { scene: S.scene, p: [6, 8, 30], l: [-4, 8, -30], fov: 70, grade: 'sunset', post: { aperture: 0 } }; };
  LOOK.panels.dbg_hole = async () => { const S = await LOOK.set('hole'); return { scene: S.scene, p: [0, 8, 30], l: [0, -26, -6], fov: 70, grade: 'night', post: { aperture: 0 } }; };
  LOOK.panels.dbg_wall = async () => { const S = await LOOK.set('hole'); return { scene: S.scene, p: [0, -14, 10], l: [0, -16, 24], fov: 70, grade: 'night', post: { aperture: 0 } }; };
  LOOK.panels.dbg_crack = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = true; return { scene: S.scene, p: [0.01, 90, 0], l: [0, 0, 0], fov: 60, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.dbg_hole2 = async () => { const c = await LOOK.panels.j_hole(); return Object.assign(c, { p: [0, 30, 20], l: [0, -34, 0], fov: 70, post: { aperture: 0, exposure: 1.4 } }); };
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
