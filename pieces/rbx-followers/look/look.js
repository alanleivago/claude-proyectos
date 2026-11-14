// rbx-followers look test: panels staged on the real sets with the Gneef-style cast. node look/look.mjs [panels] -> look/<panel>.png
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
  const walk = (ph) => CAST.POSE.walk(ph);
  const P = {};
  // a: cast line-up on the sidewalk in front of the houses (day)
  P.a_cast = async () => { const S = await LOOK.set('street'), sc = S.scene, LOW = { armL: [-0.45, 0, 0.12], armR: [-0.45, 0, -0.12] };
    [['date', -8.6, 'F5', LOW], ['popstar', -5.2, 'F6', CAST.POSE.waveUpR], ['hero', -1.6, 'F1', LOW], ['dad', 2.2, 'F2', LOW], ['teacher', 6.0, 'F10', CAST.POSE.crossed]].forEach(([n, z, f, po]) => put(sc, n, { p: [-8.6, 0.25, z], ry: PI / 2, face: f, pose: po }));
    FOL.counter(CAST.get('hero'), '1'); FOL.counter(CAST.get('popstar'), '90,000,000'); FOL.counter(CAST.get('dad'), '0');
    const cp = [12.5, 5.6, -1.2]; ['date', 'popstar', 'hero', 'dad', 'teacher'].forEach((n) => faceCam(n, cp, 0.7));
    return { scene: sc, p: cp, l: [-8.6, 4.6, -1.2], fov: 82, grade: 'day', f: [-8.6, 4, -1.2], post: { aperture: 0.5 } }; };
  // b: "I opened the front door, and the whole street was full" — over the hero's shoulder from the porch, morning
  P.b_street = async () => { const S = await LOOK.set('street'), sc = S.scene, z0 = S.HZ; S.house.visible = false;
    put(sc, 'hero', { p: [15.2, 0.5, z0 + 0.9], ry: -PI / 2 - 0.12, face: 'F7', pose: { armR: [-0.4, 0, -0.5], armL: [-0.2, 0, 0.3] } }); FOL.counter(CAST.get('hero'), '3,000,001', { k: 0.6 });
    const sidewalk = (x) => (Math.abs(x) > 7.1 && Math.abs(x) < 10 ? 0.25 : 0);
    FOL.crowd(sc, (o) => add(sc, o), { x0: -15, x1: 15, z0: z0 - 90, z1: z0 + 90, gap: 2.4, face: [16, z0], focus: [16, z0], nearR: 34, max: 150, seed: 11, y: (x) => sidewalk(x),
      skip: (x, z) => (x > 9.5 && Math.abs(z - z0) < 6) || (x > 12.5 && Math.abs(z - z0) < 9) });
    return { scene: sc, p: [19.6, 9.2, z0 + 0.2], l: [-4, 1.2, z0 - 1.5], fov: 66, grade: 'morning', f: [6, 4, z0 - 1], post: { aperture: 0.45 } }; };
  // c: the hero with his ONE follower (counter "1"); the follower walks three steps behind, hidden behind him
  P.c_one = async () => { const S = await LOOK.set('street'), sc = S.scene, z = -20;
    put(sc, 'hero', { p: [-8.6, 0.25, z], ry: 0, face: 'F1', pose: walk(0.9) }); FOL.counter(CAST.get('hero'), '1');
    put(sc, 'dad', { p: [-8.6, 0.25, z - 4.4], ry: 0, face: 'F2', pose: walk(0.9 + PI) });
    const h = head('hero'); return { scene: sc, p: [-8.4, 2.4, z + 10.5], l: [h.x, h.y + 0.2, h.z], fov: 52, grade: 'day', f: h.toArray(), post: { aperture: 0.9 } }; };
  // d: the dad's notes on the fridge at night ("every note ends the same way")
  P.d_fridge = async () => { const S = await LOOK.set('kitchen'), sc = S.scene, F = S.fridge;
    put(sc, 'hero', { p: [F.x + 2.3, 0, F.z + 2.2], ry: Math.atan2(-2.3, -2.2), face: 'F9', pose: { armL: [-1.1, 0, -0.2] } });
    return { scene: sc, p: [F.x + 3.6, 6.7, F.z + 7.4], l: [F.x - 0.2, 5.6, F.z], fov: 48, grade: 'night', f: [F.x, 6.15, F.z], post: { aperture: 1.0, exposure: 1.25 } }; };
  // e: "I jumped on the subway. Three million people got on behind me."
  P.e_subway = async () => { const S = await LOOK.set('subway'), sc = S.scene;
    put(sc, 'hero', { p: [0.6, 0, 3.0], ry: 0.25, face: 'F8', pose: { armL: [-2.6, 0, 0.5], armR: [-0.5, 0, -0.7] } }); FOL.noCounter(CAST.get('hero'));
    FOL.crowd(sc, (o) => add(sc, o), { x0: -5, x1: 5, z0: -84, z1: 0.0, gap: 2.0, face: [0.6, 3.0], focus: [0.6, 3.0], nearR: 46, max: 130, seed: 21 });
    return { scene: sc, p: [-0.9, 6.2, 7.5], l: [0.3, 4.0, -10], fov: 66, grade: 'day', f: head('hero').toArray(), post: { aperture: 0.4, exposure: 1.0 } }; };
  // f: the bridge at dusk, three days in: three million strangers behind him, counter 3,000,001
  P.f_bridge = async () => { const S = await LOOK.set('bridge'), sc = S.scene; S.mood('dusk');
    put(sc, 'hero', { p: [0, 0, 0], ry: PI, face: 'F10', pose: { armL: [-0.15, 0, 0.1], armR: [-0.15, 0, -0.1] } }); FOL.counter(CAST.get('hero'), '3,000,001', { k: 1.2 });
    FOL.crowd(sc, (o) => add(sc, o), { x0: -8.2, x1: 8.2, z0: 4.5, z1: 330, gap: 2.3, face: [0, 0], focus: [0, 0], nearR: 26, max: 110, seed: 31 });
    return { scene: sc, p: [1.4, 12, -14], l: [0, 3, 34], fov: 60, grade: 'sunset', f: [0, 4, 0], post: { aperture: 0.25 } }; };
  // g: dawn, he turned around: counter 0, the crowd walking away, and three steps back: Dad (night-shift vest, one old shoe)
  P.g_dad = async () => { const S = await LOOK.set('bridge'), sc = S.scene; S.mood('dawn');
    put(sc, 'hero', { p: [-1.4, 0, 0], ry: 0.26, face: 'F7', pose: { armL: [-0.2, 0, 0.15], armR: [-0.2, 0, -0.15] } }); FOL.counter(CAST.get('hero'), '0', { k: 0.8 });
    put(sc, 'dad', { p: [-0.2, 0, 4.6], ry: PI + 0.1, face: 'F2', pose: { armL: [-0.1, 0, 0.1], armR: [-0.35, 0, -0.25] } });
    const spots = []; const r = RBX.rng(4); for (let i = 0; i < 160; i++) spots.push({ x: (r() - 0.5) * 16, z: 60 + r() ** 0.7 * 240, ry: (r() - 0.5) * 0.6 }); add(sc, FOL.farCrowd(new THREE.Group(), spots, 41));
    const d = head('dad'); return { scene: sc, p: [6.5, 8.5, -11], l: [-0.8, 4.2, 3], fov: 54, grade: 'morning', f: [-0.2, 3.5, 4.6], post: { aperture: 0.8 } }; };
  // face checks for the two leads
  P.x_hero = async () => { const S = await LOOK.set('street'); const a = put(S.scene, 'hero', { p: [-8.6, 0.25, 0], ry: PI / 2 + 0.25, face: 'F7' }); FOL.counter(a, '1'); const h = head('hero');
    return { scene: S.scene, p: [h.x + 4.4, h.y + 0.6, h.z + 1.0], l: [h.x, h.y + 0.6, h.z], fov: 46, grade: 'day', f: h.toArray(), post: { aperture: 1.2 } }; };
  P.x_dad = async () => { const S = await LOOK.set('street'); put(S.scene, 'dad', { p: [-8.6, 0.25, 0], ry: PI / 2 + 0.3, face: 'F2' }); const h = head('dad');
    return { scene: S.scene, p: [h.x + 9, h.y - 1.6, h.z + 2.4], l: [h.x, h.y - 2.6, h.z], fov: 50, grade: 'day', f: h.toArray(), post: { aperture: 0.8 } }; };
  LOOK.panels = P;
  window.renderPanel = async (k) => {
    try {
      for (const k in LOOK.S) if (LOOK.S[k].house) LOOK.S[k].house.visible = true; CAST.hideAll(); CAST.names().forEach((n) => FOL.noCounter(CAST.get(n))); extras.forEach((o) => o.parent && o.parent.remove(o)); extras.length = 0;
      const c = await P[k](); cam.fov = c.fov || 50; cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); if (c.roll) cam.rotateZ(c.roll); cam.near = c.near || 0.1; cam.far = c.far || 5000; cam.updateProjectionMatrix();
      const g = Object.assign({}, KIT.GRADE[c.grade || 'day'], { focus: c.focus || cam.position.distanceTo(V(...(c.f || c.l))) }, c.post || {});
      post.render(c.scene, cam, g); const t = performance.now(); post.render(c.scene, cam, g); const ms = Math.round(performance.now() - t);
      return { url: renderer.domElement.toDataURL('image/png'), ms };
    } catch (e) { console.log('ERR', k, e.message, e.stack); return null; }
  };
  window.READY = true;
})();
