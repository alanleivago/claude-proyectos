// rbx-thursday staging for the kitchen + classroom shots, and the window shot seen from outside the bedroom.
'use strict';
(function () {
  const O = (...a) => ENG.orbit(...a), L = (a, b, u) => ENG.lerp(a, b, u), E = (u) => ENG.ease(u);
  const P = () => (typeof PROPS !== 'undefined' ? PROPS : {});
  const put = (set, name, o) => CAST.put(set.scene, name, o);
  const prop = (set, fn, args, pos, ry = 0, s = 1) => ENG.prop(set, fn, args, pos, ry, s);
  const head = (p, k = 1) => [p[0], p[1] + 4.85 * k, p[2]];
  const M = (set, k, def) => (set.marks && set.marks[k] ? set.marks[k].p : def);
  const call = (s, fn, ...a) => { if (s.props && typeof s.props[fn] === 'function') s.props[fn](...a); };
  const STAGE = (k, f) => { STAGES[k] = f; };
  const SIT = { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0] };

  // ---------------- kitchen ----------------
  const cal = (n, roll) => (s, u) => { if (s.mood) s.mood(n === 3 ? 'late' : n === 2 ? 'more' : 'night'); call(s, 'setCalendar', n);
    const c = s.marks.cam_calendar || { p: [-7, 5.6, 2.65], l: [-10, 5.6, 2.65] };
    const d = new THREE.Vector3(...c.p).sub(new THREE.Vector3(...c.l));
    return { p: new THREE.Vector3(...c.l).addScaledVector(d, 1.25 - 0.3 * E(u)).toArray(), l: c.l, fov: 46, roll }; };
  STAGE('So on Thursdays', cal(1, 0));
  STAGE('On the last Thursday', cal(3, -8));
  STAGE('Dad nailed more boards', (s, u) => { if (s.mood) s.mood('more'); call(s, 'setBoards', 2); const p = M(s, 'p_dad', [-4, 1, -6.65]);
    put(s, 'dad', { p, ry: Math.PI, face: 'angry', pose: CAST.POSE.hammer(u < 0.5 ? 1 : 0.35) });
    return ENG.face('dad', 6, 105, -22, 46); });
  STAGE('Then more', (s, u) => { if (s.mood) s.mood('late'); call(s, 'setBoards', 3); const p = M(s, 'p_dad', [-4, 1, -6.65]);
    put(s, 'dad', { p: [p[0] + 2.4, 0, p[2] + 2.2], ry: Math.PI + 0.5, face: 'tired', pose: { armR: [-0.3, 0, 0], head: [-0.2, 0, 0] } });
    return { p: L([p[0] + 1, 6, p[2] + 13], [p[0] + 1, 6, p[2] + 11], E(u)), l: [p[0], 5.2, p[2] - 1], fov: 50 }; });
  STAGE('Mom stopped sleeping', (s, u) => { if (s.mood) s.mood('late'); const p = M(s, 'p_mom', [1.8, 0, -0.2]);
    put(s, 'mom', { p, ry: 0, sit: true, face: 'tired', pose: Object.assign({}, SIT, { armL: [-1.4, 0, 0.1], armR: [-1.4, 0, -0.1], head: [0.12, 0, 0.12] }) });
    const c = s.marks.cam_mom; if (c) return { p: L(c.p, ENG.lerp(c.p, c.l, 0.2), E(u)), l: c.l, fov: 46, f: head(p) };
    return O(head(p), 7 - u, 20, 4, 46); });

  // ---------------- classroom ----------------
  const desk = (s, c, r) => M(s, `p_desk_${c + 1}_${r + 1}`, [[-7.5, -2.5, 2.5, 7.5][c], 0, [-2, 2.5, 7][r]]);
  const kids = (s, pose, face) => { let k = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { if (c === 2 && r === 1) continue; if (k > 7) return; put(s, 'kid' + k, { p: desk(s, c, r), ry: Math.PI, sit: true, face, pose: Object.assign({}, SIT, pose) }); k++; } };
  const heroDesk = (s) => M(s, 'p_hero', desk(s, 2, 1));
  STAGE("And there's a rule at school", (s, u) => { call(s, 'setBoard', ['THURSDAY RULES', '1. HEAR THE BELL → HEAD ON DESK', '2. COUNT TO 1000', "3. DON'T LOOK UP"]);
    kids(s, {}, 'neutral'); put(s, 'hero', { p: heroDesk(s), ry: Math.PI, sit: true, pose: SIT }); put(s, 'teacher', { p: M(s, 'p_teacher', [0, 0, -7]), ry: 0, face: 'neutral' });
    return { p: L([9, 9, 11], [6, 8, 6], E(u)), l: [0, 6, -10], fov: 50 }; });
  STAGE('If you hear the bell', (s, u) => { const b = s.props && s.props.bell; const bp = b ? b.getWorldPosition(new THREE.Vector3()).toArray() : [12, 8, 0];
    if (b) b.rotation.x = 0.08 * Math.sin(u * 60);
    return { p: [bp[0] - 3.4, bp[1] - 0.6, bp[2] + 0.6], l: bp, fov: 44, roll: 3 * Math.sin(u * 50) }; });
  STAGE('you put your head on the desk', (s, u) => { kids(s, CAST.POSE.headOnDesk, 'closed'); put(s, 'hero', { p: heroDesk(s), ry: Math.PI, sit: true, face: 'counting', pose: CAST.POSE.headOnDesk });
    put(s, 'teacher', { p: M(s, 'p_teacher', [0, 0, -7]), ry: 0, face: 'closed', pose: { head: [0.6, 0, 0], body: [0.3, 0, 0] } });
    return { p: [1, 11.2 - 0.8 * E(u), 10.5], l: [0, 2, 0], fov: 56 }; });
  STAGE('and count to a thousand', (s, u) => { const p = heroDesk(s); kids(s, CAST.POSE.headOnDesk, 'closed'); put(s, 'hero', { p, ry: Math.PI, sit: true, face: 'counting', pose: CAST.POSE.headOnDesk });
    const h = CAST.get('hero').head.getWorldPosition(new THREE.Vector3()); return { p: [h.x + 0.3, 4.6, h.z - 3.6 + 0.4 * u], l: h.toArray(), fov: 46, f: h.toArray() }; });
  STAGE('Nobody knows what it looks', (s, u) => { const v = s.views.drawings; const c = new THREE.Vector3(...v.l), cam = new THREE.Vector3(...v.p);
    return { p: cam.lerp(c, 0.15 * E(u)).toArray(), l: v.l, fov: v.fov || 48 }; });
  STAGE("and I'm the best staring", (s, u) => { const a = M(s, 'p_stare_a', [-0.75, 0, 4.7]), b = M(s, 'p_stare_b', [0.75, 0, 4.7]);
    kids(s, {}, 'surprised'); CAST.get('kid5').root.visible = false;
    put(s, 'hero', { p: a, ry: Math.PI / 2, face: 'staring-hard', pose: { body: [0.1, 0, 0] } }); put(s, 'kid5', { p: b, ry: -Math.PI / 2, face: 'staring-hard', pose: { body: [0.1, 0, 0] } });
    const c = [(a[0] + b[0]) / 2, 4.9, a[2]]; return { p: [c[0], 5.0, c[2] - L([9], [7.5], E(u))[0]], l: c, fov: 40 }; });
  STAGE("I've never blinked", (s, u) => { const b = M(s, 'p_stare_b', [0.75, 0, 0.25]); kids(s, {}, 'surprised'); CAST.get('kid5').root.visible = false;
    put(s, 'kid5', { p: b, ry: -Math.PI / 2, face: 'blink', pose: { body: [-0.1, 0, 0], head: [0.2, 0, 0] } });
    return Object.assign(ENG.face('kid5', 4.6 - 0.6 * E(u), 18, -10, 42), { post: { exposure: 0.8 } }); });
  STAGE('The rule says it comes', (s, u) => { call(s, 'setBoard', ['THE WATCHER RULE:', 'IF IT CATCHES YOU', 'LOOKING UP,', 'IT COMES DOWN.']);
    return { p: L([0, 6.2, -2.5], [0, 6.2, -4.0], E(u)), l: [0, 6.2, -10], fov: 50 }; });
  STAGE('but it never says', (s, u) => { call(s, 'setBoard', ['THE WATCHER RULE:', 'IF IT CATCHES YOU', 'LOOKING UP,', 'IT COMES DOWN.', '                   ?']);
    put(s, 'hero', { p: [2.6, 0, -8.2], ry: Math.PI - 0.3, face: 'determined', pose: { armR: [-2.4, 0, -0.2] } });
    return { p: L([-3, 6.0, -1.0], [-2.2, 6.0, -2.4], E(u)), l: [1.2, 5.8, -10], fov: 50 }; });

  // ---------------- bedroom window from outside ----------------
  STAGE('And she was looking up', (s, u) => { s.scene.userData.sky.visible = false; s.props.looseBoard.visible = false; s.props.haze.visible = false; s.props.beams.forEach((b) => { b.visible = false; });
    put(s, 'pip', { p: [2.7, 0, -7.9], ry: Math.PI, face: 'surprised', pose: { head: [-0.55, 0, 0] } });
    return ENG.face('pip', 3.6 - 0.4 * E(u), 85, -14, 46); });
})();
