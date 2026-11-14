// rbx-crossing look test: panels staged on the real sets with the Gneef-style cast. node look/look.mjs [panels] -> look/<panel>.png
'use strict';
const LOOK = { S: {} };
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, W = 1080, H = 1920;
  const renderer = new T.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.physicallyCorrectLights = true;
  const post = new RBX.Post(renderer, W, H, 2), cam = new T.PerspectiveCamera(50, W / H, 0.1, 5000);
  const extras = []; const add = (scene, o) => { scene.add(o); extras.push(o); return o; };
  const put = (scene, name, o) => CAST.put(scene, name, o);
  LOOK.set = async (k) => LOOK.S[k] || (LOOK.S[k] = await SETS[k]({ renderer }));
  const head = (n) => { const a = CAST.get(n); a.root.updateMatrixWorld(true); return a.head.getWorldPosition(V(0, 0, 0)); };
  const faceCam = (n, cp, k = 1) => { const a = CAST.get(n), h = head(n), t = Math.atan2(cp[0] - h.x, cp[2] - h.z); let d = t - a.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.neck.rotation.y = THREE.MathUtils.clamp(d * k, -1.4, 1.4); };
  const hold = (n, obj, arm = 'R', o = [0, -2.0, 0.3]) => { const a = CAST.get(n), A = arm === 'R' ? a.armR : a.armL; A.inner.add(obj); extras.push(obj); obj.position.set(...o); return obj; };
  const sign = (n, up) => { const g = hold(n, PROPS.stopSign(), 'R', [0, -1.9, 0.25]); if (up === true) g.rotation.z = PI; if (up === 'flip') g.rotation.y = PI; return g; };
  // a line of kids (crowd kit clones, child scale) from (x, z0) to (x, z1), facing dir
  const kids = (S, x, z0, z1, ry, seed, o = {}) => { const g = FOL.crowd(S.scene, (q) => add(S.scene, q), { x0: x, x1: x + 0.01, z0, z1, gap: o.gap || 1.9, face: [x + Math.sin(ry) * 999, (z0 + z1) / 2 + Math.cos(ry) * 999], focus: [x, z0], nearR: 999, max: 40, seed, y: () => o.y ?? 0.3 });
    g.children.forEach((c) => { c.scale.multiplyScalar(0.6); c.rotation.y = ry; }); return g; };
  const LOW = { armL: [-0.45, 0, 0.12], armR: [-0.45, 0, -0.12] }, P = {};
  P.a_cast = async () => { const S = await LOOK.set('road'), sc = S.scene; S.mood('fall'); S.carsAt(3);
    [['twinA', -9, 'F5', CAST.POSE.waveUpR], ['teacher', -5.6, 'F5', LOW], ['rudy', -2.4, 'F1', LOW], ['wes', 0.8, 'F6', LOW], ['missdot', 4.4, 'F2', { armR: [-0.9, 0, 0.1] }], ['twinB', 8, 'F5', LOW]].forEach(([n, x, f, po]) => put(sc, n, { p: [x, 0.3, 14.4], ry: PI, face: f, pose: po }));
    sign('missdot'); const cp = [0, 5.6, -2]; ['twinA', 'teacher', 'rudy', 'wes', 'missdot', 'twinB'].forEach((n) => faceCam(n, cp, 0.7));
    return { scene: sc, p: cp, l: [0, 4.4, 14.4], fov: 70, grade: 'day', f: [0, 4, 14.4], post: { aperture: 0.5 } }; };
  P.b_road = async () => { const S = await LOOK.set('road'), sc = S.scene; S.mood('fall'); S.carsAt(1.3);
    return { scene: sc, p: [60, 46, 50], l: [-30, 0, -6], fov: 50, grade: 'day', post: { aperture: 0 } }; };
  P.c_dot = async () => { const S = await LOOK.set('road'), sc = S.scene; S.mood('fall'); S.carsAt(2, { stop: true });
    put(sc, 'missdot', { p: [1.2, 0, 1.0], ry: PI / 2 - 0.5, face: 'F2', pose: { armR: [-2.7, 0, -0.2] } }); sign('missdot', true);
    kids(S, -1.0, -9, 11, PI, 7);
    return { scene: sc, p: [8.5, 1.6, 7.5], l: [-0.5, 5.0, -1], fov: 62, grade: 'day', f: head('missdot').toArray(), post: { aperture: 0.6 } }; };
  P.d_count = async () => { const S = await LOOK.set('road'), sc = S.scene; S.mood('fall'); S.carsAt(4);
    put(sc, 'rudy', { p: [-2.0, 0.3, 14.2], ry: PI - 0.3, face: 'F3', pose: { armR: [-1.3, 0, 0.4], armL: [-1.1, 0, -0.3] } }); kids(S, -0.4, 13.6, 30, PI, 9, { gap: 2.1 });
    const h = head('rudy'); return { scene: sc, p: [h.x - 1.4, h.y + 0.2, h.z - 4.6], l: [h.x + 0.8, h.y - 0.8, h.z + 4], fov: 48, grade: 'day', f: h.toArray(), post: { aperture: 1.0 } }; };
  P.e_snow = async () => { const S = await LOOK.set('road'), sc = S.scene; S.mood('snow'); S.carsAt(5); S.snowAt(3);
    put(sc, 'missdot', { p: [1.6, 0.3, 12.6], ry: -PI / 2 + 0.4, face: 'F6', pose: { armR: [-0.9, 0, 0.1] } }); sign('missdot');
    kids(S, -0.6, 13.4, 27, PI, 11, { gap: 2.0 }); put(sc, 'wes', { p: [-0.6, 0.3, 29.5], ry: PI, face: 'F6' }); put(sc, 'rudy', { p: [-0.9, 0.3, 26.8], ry: PI - 0.6, face: 'F10' });
    return { scene: sc, p: [7, 5, 38], l: [-0.5, 3.4, 20], fov: 56, grade: 'snow', f: [-0.5, 4, 26], post: { aperture: 0.6 } }; };
  P.f_hall = async () => { const S = await LOOK.set('hallway'), sc = S.scene; S.photo(2); put(sc, 'rudy', { p: [31, 0, -2.6], ry: PI - 0.5, face: 'F9' }); FOL.noCounter(CAST.get('rudy'));
    const n = S.newest; return { scene: sc, p: [38.5, 6.0, 2.6], l: [n[0] - 4, n[1] - 0.6, n[2] + 0.4], fov: 56, grade: 'day', f: n, post: { aperture: 0.8 } }; };
  P.g_end = async () => { const S = await LOOK.set('road'), sc = S.scene; S.mood('snow'); S.carsAt(7, { gap: 14 }); S.snowAt(5);
    put(sc, 'rudyV', { p: [0, 0.3, 12.8], ry: PI, face: 'F1', pose: { armR: [-0.9, 0, 0.1] } }); sign('rudyV', 'flip');
    kids(S, 0, 14.6, 30, PI, 13, { gap: 1.9 }); put(sc, 'missdot', { p: [4.2, 0.3, 15.4], ry: -PI / 2 - 0.6, face: 'F3' });
    const h = head('rudyV'); return { scene: sc, p: [h.x - 2.8, h.y - 0.2, h.z - 7.0], l: [h.x - 0.2, h.y + 0.2, h.z + 2], fov: 50, grade: 'snow', f: h.toArray(), post: { aperture: 0.8 } }; };
  LOOK.panels = P;
  window.renderPanel = async (k) => {
    try {
      CAST.hideAll(); extras.forEach((o) => o.parent && o.parent.remove(o)); extras.length = 0;
      const c = await P[k](); cam.fov = c.fov || 50; cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); if (c.roll) cam.rotateZ(c.roll); cam.near = 0.1; cam.far = 5000; cam.updateProjectionMatrix();
      const g = Object.assign({}, KIT.GRADE[c.grade || 'day'], { focus: c.focus || cam.position.distanceTo(V(...(c.f || c.l))) }, c.post || {});
      post.render(c.scene, cam, g); post.render(c.scene, cam, g);
      return { url: renderer.domElement.toDataURL('image/png'), ms: 0 };
    } catch (e) { console.log('ERR', k, e.message, e.stack); return null; }
  };
  window.READY = true;
})();
