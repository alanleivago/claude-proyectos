// rbx-checkpoint look sheet panels (staged on the sets). Uses LOOK.put / LOOK.add from look.js.
'use strict';
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, P = CAST.POSE, DP = DOG.POSE;
  const put = (S, n, o = {}) => { const a = LOOK.put(S.scene, n, o); if (a.blow) a.blow(false); if (o.mood) CAST.face(n, o.mood, !!o.talk); if (o.dog) { a.pose(o.dog); } if (o.ground !== undefined || o.dog) CP.ground(a, o.ground ?? (o.p ? o.p[1] : 0)); return a; };
  const add = (S, o) => LOOK.add(S.scene, o);
  const head = (a) => { a.root.updateMatrixWorld(true); return a.head.getWorldPosition(new T.Vector3()); };
  const look = (a, cp, k = 0.8) => LOOK.faceCam(a, cp, k);
  const lookAt = (a, p) => { const h = head(a), t = Math.atan2(p.x - h.x, p.z - h.z); let d = t - a.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.neck.rotation.y = THREE.MathUtils.clamp(d, -1.1, 1.1); };
  // hold a vertical pole with both hands (aim the arms at two points on it)
  const holdPole = (a, x, z, y1, y2) => { a.root.updateMatrixWorld(true); GN.aim(a, 'R', V(x, y1, z)); GN.aim(a, 'L', V(x, y2, z)); };
  const crowd = (S, list) => list.map(([n, x, y, z, ry, mood, pose]) => put(S, n, { p: [x, y, z], ry, mood, pose }));
  // extra poses (R6: arms/legs rotate at the joints, body pitch at the torso centre; CP.ground re-plants the feet)
  const PX = {
    trip: { body: [1.0, 0, 0.12], armL: [-2.6, 0, 0.5], armR: [-2.2, 0, -0.7], legL: [-0.2, 0, 0.1], legR: [1.3, 0, -0.1], head: [-0.5, 0, 0] },
    hipsL: { armL: [-0.3, 0, 0.9], armR: [-0.2, 0, -0.15] }, salute: { armR: [-2.4, 0.4, -1.15], armL: [-0.1, 0, 0.1] },
    sitEdge: { legL: [-1.45, 0, 0.08], legR: [-1.35, 0, -0.1], armL: [-0.15, 0, 0.35], armR: [-0.2, 0, -0.35], head: [0.35, 0, 0] },
    climb: { armL: [-2.9, 0, 0.2], armR: [-2.0, 0, -0.35], legL: [-1.0, 0, 0.1], legR: [-0.2, 0, -0.1] },
    hang: { armR: [-3.05, 0, -0.1], armL: [-0.9, 0, 0.8], legL: [-0.5, 0, 0.25], legR: [0.25, 0, -0.2], body: [0.1, 0, 0.12] },
    cannon: { legL: [-2.2, 0, 0.1], legR: [-2.2, 0, -0.1], armL: [-1.9, 0, -0.5], armR: [-1.9, 0, 0.5], body: [0.25, 0, 0] },
    run: { armL: [0.9, 0, 0.1], armR: [-1.2, 0, -0.1], legL: [-0.9, 0, 0], legR: [0.7, 0, 0], body: [0.25, 0, 0] },
    stepDown: { legL: [-0.6, 0, 0.05], legR: [0.3, 0, -0.05], armL: [0.3, 0, 0.15], armR: [-0.3, 0, -0.15], head: [0.35, 0, 0] },
    hug: { armL: [-0.75, 0, 0.12], armR: [-1.05, 0, -0.2] }, kneel: { legL: [-1.5, 0, 0.05], legR: [0.2, 0, -0.05], armL: [-1.0, 0, -0.2], armR: [-1.4, 0, 0.3] },
  };
  LOOK.PX = PX;
  const L = LOOK.panels;
  // ===== a: main cast line-up in the square =====
  L.a_cast = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = false;
    const fm = put(S, 'flagman', { p: [-2.6, 0, 8.6], ry: 0.2, mood: 'proud', pose: PX.hipsL });
    const bf = add(S, CP.flag({ c: CP.COL.town, emblem: 'star', h: 9.5, w: 3.4, pole: 0.09, pad: false, ph: 1.2 })); fm.root.updateMatrixWorld(true); const cup = fm.flagCup.getWorldPosition(new T.Vector3()); bf.position.set(cup.x, cup.y - 0.25, cup.z); GN.aim(fm, 'R', V(cup.x, cup.y + 1.9, cup.z));
    put(S, 'hero', { p: [-0.4, 0, 13.4], ry: -0.1, mood: 'grin', pose: { armL: [-0.3, 0, 0.25], armR: [-2.75, 0, -0.95], head: [-0.05, 0, 0] } });
    put(S, 'turbo', { p: [2.4, 0, 14.4], ry: -0.5, mood: 'happy', dog: DP.sit });
    put(S, 'fire1', { p: [3.6, 0, 8.4], ry: -0.3, mood: 'calm', pose: P.crossed });
    put(S, 'fire2', { p: [6.6, 0, 9.2], ry: -0.45, mood: 'laugh', pose: P.waveUpR });
    put(S, 'rich', { p: [-6.2, 0, 10.0], ry: 0.4, mood: 'smug', pose: { armL: [-0.4, 0, 0.1], armR: [-1.3, 0, 0.2] } });
    const cp = [0.6, 5.0, 34]; ['flagman', 'hero', 'fire1', 'fire2', 'rich'].forEach((n) => look(CAST.get(n), cp, 0.6)); look(CAST.get('turbo'), cp, 0.7);
    return { scene: S.scene, p: cp, l: [0.6, 5.0, 4], fov: 50, grade: 'day', f: [0, 4, 11], post: { aperture: 0.5 } }; };
  // ===== b: secondary cast (school, water park, parade, the top guy) in front of the shops =====
  L.b_cast2 = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = false;
    put(S, 'teacher', { p: [-5.4, 0, -28], ry: 0.3, mood: 'strict', pose: { armR: [-1.6, 0, 0.1], armL: [-0.2, 0, 0.1] } });
    put(S, 'tuba', { p: [-2.2, 0, -29.5], ry: 0.15, mood: 'strain', pose: PX.hug });
    put(S, 'topguy', { p: [2.4, 0, -29], ry: -0.15, mood: 'grin', pose: P.wave });
    put(S, 'swim1', { p: [6.0, 0, -26.8], ry: -0.35, mood: 'laugh', pose: P.cheer });
    put(S, 'swim2', { p: [7.0, 0, -25.4], ry: -0.5, mood: 'smug', pose: PX.hipsL });
    put(S, 'kidA', { p: [-4.6, 0, -24.4], ry: 0.25, mood: 'shock', pose: P.handsHead });
    put(S, 'kidB', { p: [-1.6, 0, -23.6], ry: 0.1, mood: 'grin', pose: P.waveL });
    put(S, 'crowd4', { p: [1.6, 0, -23.8], ry: -0.1, mood: 'laugh' });
    const cp = [0.8, 4.4, 1]; ['teacher', 'tuba', 'topguy', 'swim1', 'swim2', 'kidA', 'kidB', 'crowd4'].forEach((n) => look(CAST.get(n), cp, 0.5));
    return { scene: S.scene, p: cp, l: [0.8, 3.9, -40], fov: 54, grade: 'day', f: [0, 3, -26], post: { aperture: 0.5 } }; };
  // ===== c: expressions (tiled by sheet.py from x_<who>_<mood>.png) =====
  LOOK.EXPR_GRID = { hero: ['calm', 'ohno', 'laugh', 'scream', 'calm-talk'], turbo: ['calm', 'happy', 'shock', 'sad', 'bark'], flagman: ['proud', 'shout-talk', 'laugh', 'terror', 'whistle'] };
  Object.entries(LOOK.EXPR_GRID).forEach(([n, moods]) => moods.forEach((m) => { L['x_' + n + '_' + m] = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = false;
    const a = put(S, n, { p: [0, 0, 16], ry: 0.25, dog: n === 'turbo' ? DP.stand : undefined }); const [mood, talk] = m.split('-');
    if (m === 'whistle') { CAST.face(n, 'strain'); a.blow(true); } else CAST.face(n, mood, !!talk);
    if (n === 'turbo') { if (mood === 'sad') a.pose({ ears: [[0.25, 0, 0.25], [0.25, 0, -0.25]], tail: [-2.2, 0, 0] }); if (mood === 'happy') a.pose(DP.wag(1)); if (mood === 'shock') a.pose({ ears: [[0, 0, 0.6], [0, 0, -0.6]], earsLo: [[0, 0, 0.3], [0, 0, -0.3]] }); }
    const h = head(a), d = n === 'turbo' ? 3.6 : 4.0 * a.root.scale.x * (a.o.headScale || 1);
    return { scene: S.scene, p: [h.x + d * 0.25, h.y + 0.25, h.z + d], l: [h.x, h.y + (n === 'flagman' ? 0.05 : n === 'turbo' ? -0.2 : -0.25), h.z], fov: 40, grade: 'day', f: h.toArray(), post: { aperture: 1.0, maxCoc: 16 } }; }; }));
  // ===== d: POOF (d1 trip on the sidewalk -> poof; d2 pop-in at his flag on the Clock Tower) =====
  L.d1_trip = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = false;
    const a = put(S, 'hero', { p: [-20, 0, 16], ry: 0.7, mood: 'scream', pose: PX.trip }); CP.ground(a, 0); a.root.position.y += 0.9;
    const pf = add(S, CP.poof({ r: 1.5, phase: 0.15, seed: 4 })); const t = a.torso.getWorldPosition(new T.Vector3()); pf.position.set(t.x - 0.4, 0, t.z - 0.9);
    const k = add(S, PROPS.puff(5)); k.position.set(t.x - 2.2, 0.4, t.z - 1.6); k.scale.setScalar(0.6);
    // the curb he tripped on + a dropped ice cream
    const ic = new T.Group(); const cone = new T.Mesh(new T.ConeGeometry(0.28, 0.8, 12), TK.SM('#d8a060')); cone.rotation.z = 1.9; ic.add(cone); const sc = new T.Mesh(new T.SphereGeometry(0.34, 14, 10), TK.SM('#f8b8d0', 0.6)); sc.position.set(-0.4, 0.1, 0); ic.add(sc); ic.position.set(t.x + 1.4, 0.3, t.z + 1.2); add(S, ic);
    const cp = [t.x + 8.5, 2.8, t.z + 10];
    return { scene: S.scene, p: cp, l: [t.x - 0.4, 1.8, t.z], fov: 50, grade: 'day', f: t.toArray(), post: { aperture: 0.6 } }; };
  L.d2_pop = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = false;
    const tw = S.tower; tw.updateMatrixWorld(true); const fp = tw.heroFlag.getWorldPosition(new T.Vector3());
    const a = put(S, 'hero', { p: [fp.x, fp.y + 0.32, fp.z], ry: 0.2, mood: 'ohno', pose: { armL: [-0.6, 0, 0.9], armR: [-0.6, 0, -0.9] } }); CP.squash(a, 1.12);
    const pi = add(S, CP.popIn({ r: 1.4, h: 8 })); pi.position.set(fp.x, fp.y + 0.33, fp.z);
    const cp = [fp.x + 4, fp.y + 6.5, fp.z + 16]; look(a, cp, 0.9);
    return { scene: S.scene, p: cp, l: [fp.x, fp.y + 2.4, fp.z], fov: 50, grade: 'day', f: [fp.x, fp.y + 2, fp.z], post: { aperture: 0.5 } }; };
  // ===== e: the square: Turbo boops the big flag (50 times a day), others pop in at the town pad, Flagman proud =====
  L.e_square = async () => { const S = await LOOK.set('town'); S.mood('day'); S.fair.visible = false; S.crack.visible = false; const y = S.plinthTop;
    const tb = put(S, 'turbo', { p: [0.0, y, -2.62], ry: 0, mood: 'happy', dog: Object.assign({}, DP.wag(0.8), { head: [0.12, 0, 0] }) });
    const fm = CAST.get('flagman');
    put(S, 'crowd2', { p: [-1.9, y, -1.9], ry: 1.0, mood: 'shock' }); CP.squash(CAST.get('crowd2'), 1.1); const pi = add(S, CP.popIn({ r: 1.3, h: 7, seed: 9 })); pi.position.set(-1.9, y, -1.9);
    const pf = add(S, CP.poof({ r: 1.2, phase: 0.5, seed: 11 })); pf.position.set(-1.8, y, 1.8); pf.scale.setScalar(0.7);
    crowd(S, [['crowd3', -8, 0, -4, 0.6, 'laugh', P.point], ['crowd5', -7, 0, 6, 1.0, 'calm'], ['crowd6', -8, 0, -2, 0.9, 'grin'], ['crowd7', 4, 0, -9, -0.3, 'smug', PX.hipsL]]);
    const cp = [11.0, 3.4, 11.5]; look(CAST.get('crowd3'), [0, 3, 0], 0.8);
    return { scene: S.scene, p: cp, l: [-0.8, 5.4, -1], fov: 64, grade: 'day', f: [0, 2.6, -1], post: { aperture: 0.5 } }; };
  // ===== f: school: trip in the hall -> back to fractions (pop-in at the purple pad), teacher at the board =====
  L.f_school = async () => { const S = await LOOK.set('school'); const c = S.cpk.position;
    const k = put(S, 'kidA', { p: [c.x, 0.32, c.z], ry: -0.7, mood: 'ohno', pose: { armL: [-0.5, 0, 0.8], armR: [-0.5, 0, -0.8] } }); CP.squash(k, 1.1); const pi = add(S, CP.popIn({ r: 1.2, h: 7, c: '#c080ff' })); pi.position.set(c.x, 0.32, c.z);
    put(S, 'teacher', { p: [-1.5, 0, -8.0], ry: 0.25, mood: 'strict', pose: { armL: [-2.0, -0.3, -0.2], armR: [-0.2, 0, -0.1] } });
    const kb = put(S, 'kidB', { p: [7.5, 0, -1.2], ry: 0.4, mood: 'laugh', pose: P.sit }); CP.ground(kb, 1.5);
    const k2 = put(S, 'crowd9', { p: [1.5, 0, -1.2], ry: 0.1, mood: 'worry', pose: P.sit }); CP.ground(k2, 1.5);
    const k3 = put(S, 'crowd14', { p: [-4.5, 0, 4.3], ry: 0.2, mood: 'calm', pose: P.sit }); CP.ground(k3, 1.5);
    const cp = [-4.5, 7.6, 15.5]; ['teacher', 'kidB', 'crowd9', 'crowd14'].forEach((n) => look(CAST.get(n), [c.x, 4, c.z], 0.6)); look(k, cp, 0.6);
    return { scene: S.scene, p: cp, l: [3.0, 3.4, -7], fov: 60, grade: 'day', f: [4, 3, -6], post: { aperture: 0.3 } }; };
  // ===== g: water park roof: save at the cyan flag, then jump =====
  L.g_pool = async () => { const S = await LOOK.set('pool'); const ry0 = S.roofY, tw = S.tower.position;
    const s1 = put(S, 'swim1', { p: [tw.x - 0.8, ry0, tw.z + 3.6], ry: 0.15, mood: 'laugh', pose: P.cheer });
    const s3 = put(S, 'crowd19', { p: [tw.x - 3.6, ry0, tw.z + 0.6], ry: 0.4, mood: 'grin', pose: P.point });
    const s2 = put(S, 'swim2', { p: [tw.x + 5.5, 0, tw.z + 11.5], ry: -0.3, mood: 'scream', pose: PX.cannon }); s2.root.position.y = 7.5;
    const sp = add(S, PROPS.puff(6, '#ffffff')); sp.position.set(tw.x + 5, 0, tw.z + 16); sp.scale.setScalar(1.4);
    const cp = [tw.x + 7, 2.6, tw.z + 25]; [s1, s3, s2].forEach((a) => look(a, cp, 0.7));
    return { scene: S.scene, p: cp, l: [tw.x + 1.5, 9.5, tw.z + 4], fov: 60, grade: 'day', f: [tw.x + 1, 12, tw.z + 5], post: { aperture: 0.3 } }; };
  // ===== h: the Clock Tower at sunset: three hundred steps down (hero trudging down the winding stair, his tiny flag above) =====
  L.h_tower = async () => { const S = await LOOK.set('town'); S.mood('sunset'); S.fair.visible = false; S.crack.visible = false;
    const tw = S.tower; tw.updateMatrixWorld(true); const W = 9;
    // the stair step at ~ y 40 on the front face (+z local, facing the square): find it
    let best = null; tw.children.forEach((m) => { if (m.isMesh && m.geometry.parameters && m.geometry.parameters.depth === 1.8 && m.position.y > 36 && m.position.y < 40) { const wp = m.getWorldPosition(new T.Vector3()); if (!best || wp.z > best.z + 0.5) best = wp; } });
    const a = put(S, 'hero', { p: [best.x, best.y + 0.11, best.z], ry: -PI / 2, mood: 'sad', pose: PX.stepDown }); CP.ground(a, best.y + 0.11);
    const cp = [best.x + 7, best.y - 3, best.z + 16]; look(a, cp, 0.7);
    return { scene: S.scene, p: cp, l: [best.x - 2.5, best.y + 6, best.z - 3], fov: 62, grade: 'sunset', f: head(a).toArray(), post: { aperture: 0.25 } }; };
  // ===== i: the Fair, the ground cracks =====
  L.i_fair = async () => { const S = await LOOK.set('town'); S.mood('sunset'); S.fair.visible = true; S.crack.visible = true;
    crowd(S, [['crowd10', -6, 0, 8, 0.4, 'terror', P.handsHead], ['crowd11', -2.5, 0, 10, 0.2, 'scream', P.cheer], ['crowd12', 3.5, 0, 7.5, -0.5, 'shock', P.handsHead], ['crowd13', 7.5, 0, 9.5, -0.6, 'terror', PX.run], ['crowd15', -10, 0, 4, 0.9, 'scream', PX.run], ['crowd16', 10, 0, 3, -1.0, 'worry']]);
    put(S, 'turbo', { p: [1.6, 0, 19.6], ry: 0.2, mood: 'shock', dog: DP.stand });
    put(S, 'hero', { p: [-1.4, 0, 21.0], ry: 0.05, mood: 'ohno', pose: { armL: [-0.4, 0, 0.6], armR: [-1.6, 0, -0.2] } });
    const cp = [2.0, 11, 37]; ['crowd12', 'crowd16'].forEach((n) => look(CAST.get(n), [0, 0, 6], 0.8));
    return { scene: S.scene, p: cp, l: [-1.5, 3.5, -8], fov: 62, grade: 'sunset', f: [0, 3, 12], post: { aperture: 0.35 } }; };
  // ===== j: the sinkhole at night: hero on the rim, the town at the bottom, the Flagman with his whistle =====
  L.j_hole = async () => { const S = await LOOK.set('hole'); const D = S.D, y0 = -D;
    const h = put(S, 'hero', { p: [0.6, 0, 24.6], ry: PI, mood: 'sad', pose: PX.sitEdge }); CP.ground(h, -0.6); h.root.position.y = -0.55 + 0;
    const fm = put(S, 'flagman', { p: [1.5, y0, -1.5], ry: 0.3, mood: 'sad', pose: { armR: [-1.2, 0, 0.3] } });
    const tb = put(S, 'turbo', { p: [3.0, y0, 17.5], ry: 0.15, mood: 'bark', dog: DP.jump }); tb.root.position.y = y0 + 1.6;
    const moods = ['terror', 'worry', 'sad', 'shock', 'scream', 'worry', 'terror', 'rage'], L2 = [];
    for (let i = 0; i < 22; i++) { const a = i * 2.39, d = 5 + (i % 7) * 2.1; L2.push(['crowd' + (20 + i), Math.cos(a) * d, y0, Math.sin(a) * d + 2, Math.atan2(-Math.cos(a), -Math.sin(a)) + PI + (i % 3 - 1) * 0.4, moods[i % moods.length], i % 4 === 0 ? P.handsHead : i % 4 === 1 ? P.cheer : undefined]); }
    crowd(S, L2); put(S, 'fire1', { p: [-10.5, 0, 23.5], ry: PI + 0.5, mood: 'worry', pose: P.point }); put(S, 'fire2', { p: [11.0, 0, 24.0], ry: PI - 0.5, mood: 'strain', pose: P.hold });
    const cp = [2, 23, 32]; look(fm, cp, 0.6);
    return { scene: S.scene, p: cp, l: [0, -32, -9], fov: 64, grade: 'night', f: [0, -30, 0], post: { aperture: 0.05, exposure: 1.3 } }; };
  // ===== k: climbing down, rock to rock, root to root (flag cloth in his teeth on the way up: shown here hanging by one hand) =====
  L.k_climb = async () => { const S = await LOOK.set('hole'); const a0 = PI / 2 + 0.06, y = -15, rr = S.wallR(y) - 1.25;
    // hero side-on to the wall (wall on his right), hanging by his right hand from a rock, feet scrabbling on a root, the cloth in his teeth
    const h = put(S, 'hero', { p: [Math.cos(a0) * rr, y, Math.sin(a0) * rr], ry: -PI / 2 - 0.95, mood: 'strain', pose: PX.hang });
    h.root.updateMatrixWorld(true); const sh = h.armR.getWorldPosition(new T.Vector3()), grip = sh.clone().add(V(0, 2.0, 0.55));
    const rk = add(S, new T.Mesh(new T.DodecahedronGeometry(0.9, 0), ENV.mt(ENV.T.rock('#8a7462'), 2))); rk.scale.set(1.5, 0.6, 1.0); rk.position.copy(grip).add(V(0, 0.55, 0.6)); rk.castShadow = rk.receiveShadow = true;
    GN.aim(h, 'R', grip);
    const cl = CP.flag({ c: CP.COL.town, emblem: 'star', h: 0.1, w: 1.6, pad: false, amp: 0.25, ph: 0.6 }); cl.children.forEach((c) => { if (c !== cl.cloth) c.visible = false; }); cl.cloth.rotation.set(0, 0.5, -0.3); cl.position.set(0.05, -0.22, 0.66); h.head.add(cl); LOOK.extras.push(cl);
    h.neck.rotation.set(0.3, 0, 0);
    const hp = head(h), cp = [hp.x + 2.5, hp.y - 1.6, hp.z - 9.0];
    return { scene: S.scene, p: cp, l: [hp.x - 0.2, hp.y - 1.0, hp.z + 0.4], fov: 60, grade: 'night', f: hp.toArray(), post: { aperture: 0.5, exposure: 1.3 } }; };
  L.l_end = async () => { const S = await LOOK.set('town'); S.mood('morning'); S.fair.visible = false; S.crack.visible = false;
    const tw = S.tower; tw.updateMatrixWorld(true); const fp = tw.heroFlag.getWorldPosition(new T.Vector3());
    const tb = put(S, 'turbo', { p: [fp.x - 2.0, fp.y, fp.z - 1.4], ry: PI * 0.75 - PI, mood: 'happy', dog: Object.assign({}, DP.sniff, { tail: [-0.8, 0, 0.6] }) });
    { const pole = V(fp.x - 0.625, tb.root.position.y, fp.z - 0.625), d = V(-0.93, 0, 0.36).normalize(); tb.root.position.set(pole.x + d.x * 2.5, tb.root.position.y, pole.z + d.z * 2.5); tb.root.lookAt(pole); }
    const h = put(S, 'hero', { p: [fp.x + 1.2, fp.y, fp.z - 3.4], ry: -0.4, mood: 'laugh', pose: { armL: [-0.3, 0, 0.3], armR: [-2.6, 0, -0.6] } });
    const pc = put(S, 'pcrowd3', { p: [fp.x - 5.5, fp.y, fp.z - 3.0], ry: 0.9, mood: 'grin', pose: P.wave });
    const cp = [fp.x + 3, fp.y + 9, fp.z + 11]; look(h, cp, 0.6); look(pc, cp, 0.6);
    return { scene: S.scene, p: cp, l: [fp.x - 1.8, fp.y + 0.6, fp.z - 1.6], fov: 60, grade: 'morning', f: [fp.x - 2, fp.y + 2, fp.z], post: { aperture: 0.4 } }; };
})();
// self-check: poses used on the sheet, isolated, front / side / 3-4 (arms on the torso, feet planted, ears/legs grounded)
(function () { const P = CAST.POSE, PX = LOOK.PX, DP = DOG.POSE;
  const pose = (ry) => async () => { const sc = LOOK.studioScene(); const set = [['hero', PX.trip], ['flagman', PX.salute], ['tuba', PX.hug], ['fire1', P.point], ['swim2', PX.cannon], ['hero2', null]];
    [['hero', PX.hang, -6], ['flagman', PX.salute, -2], ['tuba', PX.hug, 2], ['teacher', { armL: [-2.0, -0.3, -0.2] }, 6]].forEach(([n, po, x]) => { const a = LOOK.put(sc, n, { p: [x, 0, 0], ry, pose: po }); CP.ground(a, 0); });
    const d = LOOK.put(sc, 'turbo', { p: [0, 0, 5], ry }); d.pose(DP.trip); d.setFace('dizzy'); CP.ground(d, 0);
    return { scene: sc, p: [0, 5, 26], l: [0, 3.2, 1], fov: 50, grade: 'day', post: { aperture: 0 } }; };
  LOOK.panels.chk_pose_front = pose(0); LOOK.panels.chk_pose_side = pose(Math.PI / 2); LOOK.panels.chk_pose_34 = pose(0.75);
})();
