// rbx-thursday staging: one function per SHOTLIST row (keyed by its first words). fn(set, u, shot) places the cast,
// props and moon, and returns the camera { p, l, fov, roll(deg), f(focus point), grade, post }.
'use strict';
const STAGES = {};
(function () {
  const O = (...a) => ENG.orbit(...a), L = (a, b, u) => ENG.lerp(a, b, u), E = (u) => ENG.ease(u);
  const P = () => (typeof PROPS !== 'undefined' ? PROPS : {});
  const put = (set, name, o) => CAST.put(set.scene, name, o);
  const prop = (set, fn, args, pos, ry = 0, s = 1) => ENG.prop(set, fn, args, pos, ry, s);
  const head = (p, k = 1) => [p[0], p[1] + 4.85 * k, p[2]];   // head centre above a root position (scale k)
  const M = (set, k) => set.marks[k].p;

  // ---------------- bedroom ----------------
  STAGES['Me?'] = (s, u) => {
    const p = [0.5, 0.06, -2.4]; put(s, 'hero', { p, ry: 0.5 - 0.5 * E(u), face: u < 0.3 ? 'surprised' : 'neutral' });
    prop(s, 'numberBalloon', ['10'], [-1.6, 0.06, -3.0], 0.3);
    return Object.assign(O(head(p), L([7.5], [4.2], E(u))[0], 12, -4, 42), { f: head(p) });
  };
  STAGES['I wear this hood'] = (s, u) => {
    const p = [0.5, 0.06, -2.4]; put(s, 'hero', { p, ry: 0.2, face: 'smile', pose: { head: [-0.08, 0, 0] } });
    return O([p[0], p[1] + 3.8, p[2]], 6.0, 140 - 120 * u, 4, 44);
  };
  STAGES['in the whole school'] = (s, u) => {
    const m = M(s, 'm_shelf'); [0, 1, 2, 3].forEach((i) => prop(s, 'trophy', [i], [m[0] + 0.05, m[1] + 0.1, m[2] - 1.2 + i * 0.8], Math.PI / 2, 0.9 + (i % 2) * 0.2));
    return { p: L([-2.8, 7.4, 3.6], [-4.4, 7.0, 3.4], E(u)), l: [m[0], m[1] + 1.0, m[2]], fov: 40 };
  };
  STAGES['Not once'] = (s, u) => {
    const p = [0.5, 0.06, -2.4]; put(s, 'hero', { p, face: 'staring-hard' });
    return Object.assign(O(head(p), 2.4 - 0.4 * u, 6, 0, 38, -12), {});
  };
  STAGES['Not even against my cat'] = (s, u) => {
    // on the rug: hero kneels (sits low) nose to nose with the cat on a toy block
    put(s, 'hero', { p: [-1.6, -1.44, -1.2], ry: Math.PI / 2, sit: true, face: 'staring-hard', pose: { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0], body: [0.25, 0, 0], head: [0.1, 0, 0] } });
    const cat = prop(s, 'cat', [{ pose: 'sit' }], [1.4, 0.06, -1.2], -Math.PI / 2, 1.3); if (cat && cat.userData.setFace) cat.userData.setFace('stare');
    return { p: L([0.0, 2.4, 8.4], [0.0, 2.5, 7.2], E(u)), l: [0.0, 2.6, -1.2], fov: 40 };
  };
  STAGES['My little sister Pip'] = (s, u) => {
    const p = M(s, 'p_pip_bed'); put(s, 'pip', { p, ry: -0.6, sit: true, face: 'happy', pose: CAST.POSE.hold });
    prop(s, 'plush', [], [p[0] - 0.5, p[1] + 2.4, p[2] + 0.8], -0.6, 0.8);
    return Object.assign(O([p[0] - 0.4, 3.9, p[2]], 6.5 - 1.2 * E(u), -62, 6, 44), {});
  };
  STAGES["She doesn't get the rule"] = (s, u) => {
    const pp = M(s, 'p_pip_window'); put(s, 'pip', { p: [pp[0], 0, pp[2] + 0.4], ry: Math.PI, face: 'happy', pose: CAST.POSE.wave });
    put(s, 'hero', { p: [-1.4, 0.06, -3.6], ry: 2.2, face: 'worried', pose: CAST.POSE.facepalm });
    s.props.haze.visible = false;
    return { p: [5.4, 4.2, 2.4], l: [1.4, 3.8, -6.0], fov: 50 };
  };
  STAGES['She thinks the boards'] = (s, u) => {
    const pp = M(s, 'p_pip_window'); put(s, 'pip', { p: [pp[0] + 0.4, 0, pp[2] + 0.2], ry: Math.PI + 0.2, face: 'happy', pose: { armR: [-2.1, 0, -0.1], armL: [-2.1, 0, 0.1] } });
    s.props.haze.visible = false;
    return { p: L([-1.8, 3.6, -3.2], [-1.2, 3.8, -4.0], E(u)), l: [3.0, 4.0, -8.4], fov: 46 };
  };
  STAGES['I woke up at midnight'] = (s, u) => {
    const hp = M(s, 'p_hero_bed'); put(s, 'hero', { p: hp, ry: 0.75, sit: true, face: 'surprised', pose: { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0], head: [-0.05, 0.25, 0] } });
    const c = prop(s, 'alarmClock', [12, 0], [-3.4, 2.72, -2.2], 0.6, 1.3); if (c && c.userData.setTime) c.userData.setTime(12, 0);
    s.props.haze.visible = false;
    return { p: [-1.7, 3.3, -0.4], l: [-4.6, 5.0, -4.4], fov: 50, f: head(hp), post: { aperture: 1.4 } };
  };
  STAGES['Pip was at the window'] = (s, u) => {
    put(s, 'pip', { p: M(s, 'p_pip_window'), ry: Math.PI, face: 'neutral', pose: CAST.POSE.lookUp });
    s.props.haze.visible = false; s.props.bmat.uniforms.k.value = 0.08;
    return { p: L([-4.8, 5.6, -0.8], [-4.0, 5.2, -1.6], E(u)), l: [2.7, 4.0, -8.4], fov: 46 };
  };
  STAGES["She'd pulled one board"] = (s, u) => {
    const b = s.props.looseBoard; b.position.z += 0.9; b.position.y -= 0.35; b.rotation.z = 0.35; b.rotation.x = 0.25;
    put(s, 'pip', { p: [2.6, 0, -7.0], ry: Math.PI, face: 'neutral', pose: { armL: [-1.7, 0, 0.1], armR: [-1.7, 0, -0.1], head: [-0.2, 0, 0] } });
    s.props.haze.visible = false; s.props.beams.forEach((b) => { b.visible = false; }); s.scene.userData.sky.material.color.setScalar(0.6);
    return { p: [-1.0, 4.6, -3.2], l: [2.7, 5.0, -8.6], fov: 44 };
  };
  STAGES['Just one'] = (s, u) => {
    const b = s.props.looseBoard, m = M(s, 'm_floor_board'); b.position.set(m[0], m[1] + 0.06 + 0.25 * (1 - u), m[2]); b.rotation.set(-Math.PI / 2, 0, 0); b.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.5);
    put(s, 'pip', { p: [3.4, 0, -7.9], ry: Math.PI, face: 'neutral', pose: CAST.POSE.lookUp }); s.props.haze.visible = false;
    const L0 = s.props.eyeLight; L0.color.set('#a8c4ff'); L0.intensity = 320; L0.position.set(2.7, 6.5, -8.6); L0.target.position.set(...m);
    if (!b.userData.lit) { b.userData.lit = b.material.clone(); b.userData.lit.emissive = new THREE.Color('#5a4a3a'); b.userData.lit.emissiveIntensity = 1; b.userData.m0 = b.material; } b.material = b.userData.lit;
    return { p: [1.4, 1.5, -4.2], l: [2.4, 0.2, -6.6], fov: 50, roll: 8, f: m };
  };
  STAGES['And something was looking back'] = (s, u) => {
    s.props.looseBoard.visible = false; s.scene.userData.sky.visible = false; s.props.haze.visible = false;
    ENG.moon(s.scene, { p: [4, 26, -70], s: 14, look: [2.7, 5.6, -7] });
    return { p: L([2.7, 5.2, -6.2], [2.7, 5.4, -7.4], E(u)), l: [3.2, 9.5, -30], fov: 36, f: [3.2, 9.5, -30] };
  };
  STAGES['I grabbed her'] = (s, u) => {
    s.props.looseBoard.visible = false; s.scene.userData.sky.visible = false; s.props.haze.visible = false; ENG.moon(s.scene, { p: [4, 26, -70], s: 14, look: [2.7, 5.6, -7] });
    put(s, 'pip', { p: [2.5, 0, -5.6], ry: Math.PI + 0.2, face: 'scared', pose: { body: [-0.3, 0, 0], armL: [-0.6, 0, 0.6], armR: [-0.6, 0, -0.6] } });
    put(s, 'hero', { p: [2.2, 0.06, -3.6], ry: Math.PI + 0.15, face: 'scared', pose: { armL: [-1.45, 0, 0.15], armR: [-1.45, 0, -0.15], body: [-0.2, 0, 0] } });
    s.props.beams.forEach((b) => { b.visible = false; });
    return { p: [4.2, 4.4, -7.8], l: [2.3, 3.8, -4.4], fov: 46, roll: -10, post: { exposure: 0.85, bloom: 0.25 } };
  };
  STAGES['but it was too late'] = (s, u) => {
    s.props.looseBoard.visible = false; s.scene.userData.sky.visible = false; s.props.haze.visible = false; const m = ENG.moon(s.scene, { p: [2.7, 10, -46], s: 10, look: [2.7, 5.6, -6], yaw: -0.15 + 0.25 * u });
    m.updateMatrixWorld(true); const e = m.localToWorld(m.userData.eyes[0].c.clone());
    return { p: [2.7, 5.5, -7.6], l: e.toArray(), fov: 26, f: e.toArray() };
  };
  STAGES['It had seen us'] = (s, u) => {
    s.props.looseBoard.visible = false; s.props.eyeLight.intensity = 260; s.props.lamp && (s.props.lamp.intensity = 25);
    put(s, 'pip', { p: [1.0, -1.4, -4.2], ry: 0.2, sit: true, face: 'scared', pose: { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0], armL: [-0.6, 0, 0.3], armR: [-0.6, 0, -0.3] } });
    put(s, 'hero', { p: [2.6, -1.44, -4.6], ry: -0.15, sit: true, face: 'scared', pose: { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0], armL: [-0.5, 0, 0.2] } });
    return { p: L([1.8, 2.6, 2.2], [1.8, 2.5, 1.0], E(u)), l: [1.8, 3.0, -4.5], fov: 44 };
  };
  STAGES['I tried everything'] = (s, u) => {
    const p = M(s, 'p_hero_desk'); put(s, 'hero', { p, ry: -Math.PI / 2, sit: true, face: 'determined', pose: { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0], armL: [-1.2, 0, 0], armR: [-1.4, 0, 0] } });
    const d = [-6.2, 3.45, 3.4];
    prop(s, 'book', ['HOW TO SCARE A MOON'], [d[0] + 0.3, d[1], d[2] + 0.2], Math.PI / 2 + 0.3);
    prop(s, 'flashlight', [], [d[0] - 0.6, d[1] + 0.1, d[2] - 0.7], 0.8); prop(s, 'sunglasses', [], [d[0] - 0.4, d[1] + 0.05, d[2] + 0.8], 1.9);
    return { p: L([-7.5, 8.4, 3.2], [-7.3, 7.8, 3.3], E(u)), l: [-4.4, 4.6, 3.4], fov: 46 };
  };
  STAGES["I covered Pip's window"] = (s, u) => {
    s.props.blankets.visible = true; s.props.beams.forEach((b) => { b.visible = false; }); s.props.haze.visible = false;
    put(s, 'hero', { p: M(s, 'p_stool'), ry: Math.PI, face: 'determined', pose: { armL: [-2.6, 0, 0.3], armR: [-2.3, 0, -0.2] } });
    prop(s, 'stool', [], [2.7, 0, -7.2]);
    put(s, 'pip', { p: [5.2, 0, -3.6], ry: -2.6, face: 'worried', pose: CAST.POSE.hold }); prop(s, 'plush', [], [5.0, 2.6, -4.2], -2.6, 0.7);
    return { p: L([-1.6, 3.0, 1.2], [-0.8, 3.4, 0.2], E(u)), l: [2.7, 5.2, -8.6], fov: 50 };
  };
  STAGES['And it pressed one giant eye'] = (s, u) => {
    s.scene.userData.sky.visible = false; s.props.eyeLight.intensity = 400; s.props.beams.forEach((b) => { b.visible = false; }); s.props.haze.visible = false; s.props.lamp && (s.props.lamp.intensity = 20);
    const m = ENG.moon(s.scene, { p: [0, 0, -60], s: 24, look: [2.7, 5.7, 30] });
    m.updateMatrixWorld(true); const e = m.localToWorld(m.userData.eyes[1].c.clone()), w = new THREE.Vector3(2.7, 5.7, -10.2); m.position.add(w.sub(e));
    s.props.boards.forEach((b) => { b.visible = false; });
    put(s, 'hero', { p: [1.3, 0.06, -3.6], ry: Math.PI, face: 'scared', pose: CAST.POSE.scared }); put(s, 'pip', { p: [3.6, 0, -3.2], ry: Math.PI, face: 'scared', pose: CAST.POSE.scared });
    return { p: L([2.4, 2.4, 6.5], [2.5, 2.8, 4.8], E(u)), l: [2.7, 5.4, -9], fov: 54 };
  };
  STAGES["And that's when I realized"] = (s, u) => {
    s.props.eyeLight.intensity = 200; s.props.lamp && (s.props.lamp.intensity = 30);
    const p = [0.5, 0.06, -2.4]; put(s, 'hero', { p, ry: 0, face: u < 0.45 ? 'scared' : 'determined' });
    return O(head(p), 5.0 - 1.6 * E(u), -10, 2, 38);
  };
  STAGES['if you don\'t stop'] = STAGES['Not once'];
})();
