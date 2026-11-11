// rbx-checkpoint staging: one function per SHOTLIST row (keyed by its first words; repeats get '#2', '#3'). fn(set, u, shot)
// places the cast + props and returns the camera { p, l, fov (pre-WIDEN), roll, f, grade, post, lead, faces:{name:[[u, mood]]}, mood }.
// Everyone keeps acting (ENG gb mode adds body acting; CAST.react swaps faces of the rest; dogs get DOG.act).
'use strict';
const STAGES = {};
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), E = (u) => ENG.ease(u), L = (a, b, u) => (Array.isArray(a) ? ENG.lerp(a, b, u) : a + (b - a) * u);
  const cl = (x) => Math.min(1, Math.max(0, x));
  const ST = (k, f) => { STAGES[k] = f; };
  const C = {}; const once = (k, f) => C[k] || (C[k] = f());
  const add = (s, o) => ENG.add(s.scene, o);
  const P = CAST.POSE, DP = DOG.POSE;
  const PX = {
    trip: { body: [1.0, 0, 0.12], armL: [-2.6, 0, 0.5], armR: [-2.2, 0, -0.7], legL: [-0.2, 0, 0.1], legR: [1.3, 0, -0.1], head: [-0.5, 0, 0] },
    hipsL: { armL: [-0.3, 0, 0.9], armR: [-0.2, 0, -0.15] }, salute: { armR: [-2.4, 0.4, -1.15], armL: [-0.1, 0, 0.1] },
    sitEdge: { legL: [-1.45, 0, 0.08], legR: [-1.35, 0, -0.1], armL: [-0.15, 0, 0.35], armR: [-0.2, 0, -0.35], head: [0.35, 0, 0] },
    climb: { armL: [-2.9, 0, 0.2], armR: [-2.2, 0, -0.35], legL: [-1.0, 0, 0.1], legR: [-0.2, 0, -0.1] },
    climb2: { armL: [-2.2, 0, 0.35], armR: [-2.9, 0, -0.2], legL: [-0.2, 0, 0.1], legR: [-1.0, 0, -0.1] },
    hang: { armR: [-3.05, 0, -0.1], armL: [-0.9, 0, 0.8], legL: [-0.5, 0, 0.25], legR: [0.25, 0, -0.2], body: [0.1, 0, 0.12] },
    cannon: { legL: [-2.2, 0, 0.1], legR: [-2.2, 0, -0.1], armL: [-1.9, 0, -0.5], armR: [-1.9, 0, 0.5], body: [0.25, 0, 0] },
    run: { armL: [0.9, 0, 0.1], armR: [-1.2, 0, -0.1], legL: [-0.9, 0, 0], legR: [0.7, 0, 0], body: [0.25, 0, 0] },
    stepDown: { legL: [-0.6, 0, 0.05], legR: [0.3, 0, -0.05], armL: [0.3, 0, 0.15], armR: [-0.3, 0, -0.15], head: [0.35, 0, 0] },
    tuba: { armL: [-0.75, 0, 0.12], armR: [-1.05, 0, -0.2] }, carry: { armL: [-1.2, 0, -0.35], armR: [-1.2, 0, 0.35] },
    tired: { body: [0.45, 0, 0], armL: [-0.5, 0, 0.1], armR: [-0.5, 0, -0.1], legL: [-0.25, 0, 0.1], legR: [-0.25, 0, -0.1], head: [-0.35, 0, 0] },
    jump: { armL: [-2.8, 0, 0.5], armR: [-2.8, 0, -0.5], legL: [-1.1, 0, 0.1], legR: [0.5, 0, -0.1] }, bars: { armL: [-3.1, 0, 0.12], armR: [-3.1, 0, -0.12], legL: [-1.3, 0, 0.1], legR: [-1.0, 0, -0.1] },
    flail: { armL: [-2.9, 0, 0.9], armR: [-2.6, 0, -1.0], legL: [-0.8, 0, 0.3], legR: [0.5, 0, -0.3], body: [-0.3, 0, 0] },
    throw: { armR: [-2.6, 0, -0.3], armL: [-1.4, 0, 0.2], body: [0.15, 0, 0] }, lower: { armL: [-1.3, 0, -0.1], armR: [-1.5, 0, 0.1], body: [0.35, 0, 0], head: [0.4, 0, 0] },
    shout: { armL: [-2.6, 0, 0.75], armR: [-2.6, 0, -0.75], head: [0.15, 0, 0] }, fingerUp: { armR: [-2.95, 0, -0.15], armL: [-0.2, 0, 0.15] },
    stab: { armL: [-2.2, 0, -0.4], armR: [-2.2, 0, 0.4], body: [0.25, 0, 0] }, lookUp: { head: [-0.5, 0, 0] }, untie: { armL: [-1.5, 0, -0.3], armR: [-1.3, 0, 0.3], body: [0.6, 0, 0], legL: [-0.5, 0, 0], legR: [0.3, 0, 0], head: [0.3, 0, 0] },
  };
  const mixP = (A, B, f) => { const o = {}; new Set([...Object.keys(A), ...Object.keys(B)]).forEach((k) => { const a = A[k] || [0, 0, 0], b = B[k] || [0, 0, 0]; o[k] = a.map((x, i) => x + (b[i] - x) * f); }); return o; };
  const climbAt = (u, sp = 2) => mixP(PX.climb, PX.climb2, 0.5 - 0.5 * Math.cos(u * PI * 2 * sp));
  // put an actor: o { p, ry, pose, mood, dog (dog pose), walk, keep, ground (re-plant feet at y), sc (squash) }
  const put = (s, n, o = {}) => { const pose = o.walk !== undefined ? Object.assign(P.walk(o.walk), o.pose || {}) : o.pose;
    const a = CAST.put(s.scene, n, Object.assign({}, o, { pose })); a.root.scale.setScalar(a.o.scale || 1); a.root.rotation.order = 'YXZ'; if (a.blow) a.blow(false); a.noAct = false; a.actK = 1;
    if (o.dog) a.pose(o.dog); if (o.mood) { CAST.face(n, o.mood); if (o.keep) a.keepFace = true; }
    if (o.rx) a.root.rotation.x = o.rx; if (o.ground !== undefined) CP.ground(a, o.ground); if (o.sc) CP.squash(a, o.sc); return a; };
  const head = (n) => { const a = CAST.get(n); a.root.updateMatrixWorld(true); return a.head.getWorldPosition(V(0, 0, 0)); };
  const torso = (n) => { const a = CAST.get(n); a.root.updateMatrixWorld(true); return a.torso.getWorldPosition(V(0, 0, 0)); };
  const look = (n, p, k = 0.9) => { const a = CAST.get(n), h = head(n), t = Math.atan2(p[0] - h.x, p[2] - h.z); let d = t - a.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.neck.rotation.y = THREE.MathUtils.clamp(d * k, -1.2, 1.2); };
  const cam = (p, l, fov, o = {}) => Object.assign({ p: p.toArray ? p.toArray() : p, l: l.toArray ? l.toArray() : l, fov }, o);
  const orb = (T0, d, yaw, pitch, fov, o = {}) => Object.assign(ENG.orbit(T0.toArray ? T0.toArray() : T0, d, yaw, pitch, fov), { f: T0.toArray ? T0.toArray() : T0 }, o);
  const faceCam = (n, d, yaw, pitch, fov, o = {}) => Object.assign(ENG.face(n, d, yaw, pitch, fov), o);
  // cached effects
  const poof = (s, k, pos, ph, r = 1.5, seed = 4) => { const g = once('poof' + k, () => CP.poof({ r, phase: 0.3, seed })); g.position.copy(pos.isVector3 ? pos : V(...pos)); CP.poofSet(g, cl(ph)); return add(s, g); };
  const pop = (s, k, pos, ph, c, r = 1.4) => { const g = once('pop' + k, () => CP.popIn({ r, h: 8, c })); g.position.copy(pos.isVector3 ? pos : V(...pos)); CP.popSet(g, cl(ph)); return add(s, g); };
  const prop = (s, k, f, pos, rot) => { const g = once(k, f); g.position.copy(pos.isVector3 ? pos : V(...pos)); if (rot) g.rotation.set(...rot); return add(s, g); };
  const cloth = (k, c = CP.COL.town, w = 2.4, amp = 0.2) => once('cloth' + k, () => { const f = CP.flag({ c, emblem: 'star', h: 0.1, w, pad: false, amp, ph: 0.8 }); f.children.forEach((q) => { if (q !== f.cloth) q.visible = false; }); return f; });
  const pebbles = () => once('pebbles', () => { const g = new T.Group(); for (let i = 0; i < 9; i++) { const m = new T.Mesh(new T.DodecahedronGeometry(0.12 + (i % 3) * 0.08, 0), ENV.mt(ENV.T.rock('#8a7462'), 1)); m.position.set(Math.sin(i * 2.3) * 0.8, -i * 0.5, Math.cos(i * 1.7) * 0.4); m.castShadow = true; g.add(m); } return g; });
  const shake = (u, k = 1) => (Math.sin(u * 61) * 2.2 + Math.sin(u * 37) * 1.4) * k;
  // town helpers
  const TY = 1.72;   // top of the town pad
  const flagTop = (s) => { s.tower.updateMatrixWorld(true); return s.tower.heroFlag.getWorldPosition(V(0, 0, 0)); };
  const tinyPole = (s) => flagTop(s).add(V(-0.94, 0, -0.94));
  const step = (s, n) => { const L0 = s.tower.stepList, i0 = Math.max(0, Math.min(L0.length - 2, Math.floor(n))), f = Math.min(1, Math.max(0, n - i0)), A0 = L0[i0], A1 = L0[i0 + 1]; s.tower.updateMatrixWorld(true);
    const p = s.tower.localToWorld(A0.p.clone().lerp(A1.p, f)).add(V(0, 0.17, 0)); return { p, a: A0.a }; };
  const crowdWalk = (s, list, u) => list.forEach(([n, x, z, ry, sp, mood], i) => { const d = (u * 1.1 + i * 0.13) * sp; put(s, n, { p: [x + Math.sin(ry) * d, 0, z + Math.cos(ry) * d], ry, walk: i, mood }); });
  const sepia = (o) => Object.assign(o, { grade: 'sepia' });

  // ================= TOWN: the rule =================
  ST('In this town', (s, u) => { s.mood('day');
    crowdWalk(s, [['crowd0', -12, 8, 0.6, 3, 'calm'], ['crowd1', 10, 4, -1.2, 3, 'laugh'], ['crowd3', -4, 16, 2.8, 2.5, 'grin'], ['crowd5', 14, 14, -2.4, 3, 'calm'], ['crowd6', -16, -10, 1.4, 3, 'smug'], ['crowd8', 6, -14, 0.2, 2.8, 'calm']], u);
    return cam([L(34, 30, u), L(30, 27, u), 58], [2, 10, -18], 38, { grade: 'day' }); });
  ST('if you fall', (s, u) => { s.mood('day'); const k = E(cl(u * 1.4)); const a = put(s, 'crowd14', { p: [5, 0, 9], ry: 0.6, mood: 'scream', keep: true, pose: { body: [L(0.2, 1.15, k), 0, 0.15], armL: [-2.6, 0, 0.6], armR: [-2.2, 0, -0.8], legL: [-0.2, 0, 0], legR: [L(0.3, 1.3, k), 0, 0], head: [-0.5, 0, 0] } }); CP.ground(a, L(0.3, 0.9, k));
    put(s, 'crowd2', { p: [10, 0, 4], ry: -0.9, mood: 'shock' }); put(s, 'crowd4', { p: [0, 0, 5], ry: 0.8, mood: 'laugh' });
    return orb(torso('crowd14'), 11, 40, 10, 32, { lead: 'crowd2' }); });
  ST('you go back', (s, u) => { s.mood('day'); const a = put(s, 'crowd14', { p: [1.6, TY, 1.6], ry: 0.8, mood: 'shock', keep: true, sc: 1 + 0.18 * (1 - E(cl(u * 2))) }); pop(s, 'a', [1.6, TY, 1.6], u * 1.2);
    poof(s, 'far', [5, 0, 9], 0.4 + u * 0.6); put(s, 'crowd4', { p: [-4.5, 0, 3.5], ry: 0.9, mood: 'laugh', pose: P.point });
    return orb(V(1.6, 4.2, 1.6), 12, 25, 12, 34, { lead: 'crowd4' }); });
  ST('Touch a flag', (s, u) => { s.mood('day'); const a = put(s, 'crowd7', { p: [1.0, TY, 1.6], ry: PI + 0.45, mood: 'grin' }); a.root.updateMatrixWorld(true); GN.aim(a, 'R', V(0.18, L(4.6, 4.2, E(cl(u * 2))), 0.2));
    return orb(V(0.6, 3.6, 0.9), 9, -75, 6, 32, { lead: 'crowd7' }); });
  ST('and it saves', (s, u) => { s.mood('day'); put(s, 'crowd7', { p: [1.0, TY, 1.6], ry: 0.4, mood: 'laugh', pose: P.cheer }); pop(s, 'b', [1.0, TY, 1.6], 0.35 + u * 0.4, '#38f08a', 1.8);
    put(s, 'crowd9', { p: [-4, 0, 6], ry: 0.6, mood: 'grin' }); return orb(V(0.5, 3.5, 1), 13, -20, 6, 36, { lead: 'crowd7' }); });
  ST('Trip on the', (s, u) => { s.mood('day'); const k = E(cl(u * 1.3)); const a = put(s, 'hero', { p: [L(-16, -14.5, u), 0, -37.5], ry: PI / 2, pose: { body: [L(0.15, 1.05, k), 0, 0.12], armL: [-2.6, 0, 0.5], armR: [-2.2, 0, -0.7], legL: [-0.2, 0, 0.1], legR: [L(0.2, 1.3, k), 0, -0.1], head: [-0.5, 0, 0] } }); CP.ground(a, L(0, 0.9, k));
    prop(s, 'icecream', () => { const g = new T.Group(), cone = new T.Mesh(new T.ConeGeometry(0.28, 0.8, 12), TK.SM('#d8a060')); cone.rotation.z = -1.4; g.add(cone); const sc = new T.Mesh(new T.SphereGeometry(0.34, 14, 10), TK.SM('#f8b8d0', 0.6)); sc.position.set(0.4, 0.1, 0); g.add(sc); return g; }, [L(-14, -11.5, k), L(4.8, 0.3, k), -37], [0, 0, k * 4]);
    put(s, 'crowd10', { p: [-9, 0, -39.5], ry: -1.2, mood: 'shock' });
    return cam([-8, 2.6, -29], [-14.5, 2.0, -38], 36, { lead: 'hero', faces: { hero: [[0, 'ohno'], [0.3, 'scream']] } }); });
  ST('poof', (s, u) => { s.mood('day'); poof(s, 'hero1', [-14.2, 0, -37.5], u, 1.6, 7);
    if (u < 0.18) { const a = put(s, 'hero', { p: [-14.2, 0, -37.5], ry: PI / 2, pose: PX.trip, mood: 'scream', keep: true }); CP.ground(a, 0.6); a.root.scale.multiplyScalar(1 - u * 4); }
    prop(s, 'icecream', () => new T.Group(), [-11.5, 0.3, -37], [0, 0, 4]); put(s, 'crowd10', { p: [-9, 0, -39.5], ry: -1.2, mood: 'shock', keep: true });
    return cam([-9, 2.4, -30], [-13.5, 2.2, -38], 34, { lead: 'crowd10' }); });
  ST("you're back at", (s, u) => { s.mood('day'); const fp = flagTop(s); const a = put(s, 'hero', { p: [fp.x, fp.y + 0.48, fp.z], ry: 0.25, mood: 'ohno', pose: { armL: [-0.6, 0, 0.9], armR: [-0.6, 0, -0.9] }, sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) });
    pop(s, 'tower', [fp.x, fp.y + 0.48, fp.z], u, '#38f08a'); const cp = [fp.x + 4, fp.y + 5, fp.z + 13]; look('hero', cp);
    return cam(cp, [fp.x, fp.y + 2.4, fp.z], 34, { lead: 'hero', faces: { hero: [[0, 'ohno'], [0.55, 'sad']] } }); });
  // ================= HOUSE =================
  const inBed = (s, n, mood, k = 0) => { const a = put(s, n, { p: [-6, 11.75, -8.2], ry: 0, mood, keep: true, pose: { armL: [-0.2, 0, 0.25], armR: [-0.2, 0, -0.25] } }); a.root.rotation.x = -PI / 2 + k; a.stagePose._hold = true; s.covers.position.y = 3.25; return a; };
  ST('Rich people keep', (s, u) => { inBed(s, 'rich', 'calm'); const z = prop(s, 'zzz', () => PROPS.notes('#ffffff', 3), [-5, 13.5 + u * 0.8, -11.5]);
    return cam([-1.6, 16.0, -12.2], [-6, 12.0, -12.6], 34, { lead: 'rich', faces: { rich: [[0, 'calm']] }, talk: false, post: { exposure: 0.92, bloom: 0.12 } }); });
  ST('They fall downstairs', (s, u) => { const k = 2 + u * 13, st = s.stairs(Math.floor(k)); const a = put(s, 'rich', { p: [4, st.y, st.z], ry: 0, mood: 'laugh', keep: true, pose: { body: [1.2 + u * 2.5, 0, 0.3], armL: [-2.8, 0, 0.7], armR: [-2.4, 0, -0.9], legL: [-0.4, 0, 0.3], legR: [0.9, 0, -0.2] } }); CP.ground(a, st.y + 0.3);
    return cam([12.5, st.y + 3.5, st.z + 5.5], [4, st.y + 1.2, st.z], 34, { lead: 'rich', roll: -8, post: { exposure: 0.95, bloom: 0.15 }, faces: { rich: [[0, 'laugh'], [0.5, 'smug']] } }); });
  ST('to get back', (s, u) => { inBed(s, 'rich', 'smug'); poof(s, 'bed', [-3.4, 11.4, -10.5], 0.45 + u * 0.55, 1.0); const a = CAST.get('rich');
    return cam([-1.8, 15.4, -13.6], [-6, 12.0, -12.4], 32, { lead: 'rich', faces: { rich: [[0, 'smug'], [0.5, 'laugh']] }, post: { exposure: 0.92, bloom: 0.12 } }); });
  // ================= SCHOOL =================
  ST("The school's checkpoint", (s, u) => { put(s, 'teacher', { p: [-1.5, 0, -8.0], ry: 0.25, mood: 'strict', pose: { armL: [-2.0, -0.3, -0.2] } });
    [['kidB', 7.5, -1.2, 0.2, 'calm'], ['crowd9', 1.5, -1.2, 0.1, 'worry'], ['crowd14', -4.5, 4.3, 0.2, 'calm'], ['crowd4', 1.5, 4.3, -0.1, 'sleepy']].forEach(([n, x, z, ry, m]) => { const a = put(s, n, { p: [x, 0, z], ry, mood: m === 'sleepy' ? 'calm' : m, pose: P.sit }); CP.ground(a, 1.5); });
    return cam([L(-4.5, -3, u), 7.6, 15.5], [L(4, 5, u), 3.6, -7], 40, { lead: 'teacher' }); });
  ST('Trip in the', (s, u) => { const k = E(cl(u * 1.4)); const a = put(s, 'kidA', { p: [19, 0, L(6, 3, u)], ry: PI, mood: 'scream', keep: true, pose: { body: [L(0.2, 1.1, k), 0, 0.1], armL: [-2.6, 0, 0.5], armR: [-2.2, 0, -0.7], legL: [-0.2, 0, 0.1], legR: [L(0.2, 1.3, k), 0, -0.1], head: [-0.5, 0, 0] } }); CP.ground(a, L(0, 0.6, k));
    put(s, 'crowd19', { p: [21.5, 0, -2], ry: -0.3, mood: 'laugh', pose: P.point }); return cam([17.5, 3.6, -6], [19.5, 1.6, 4], 38, { lead: 'crowd19' }); });
  ST('back to fractions', (s, u) => { const c = s.cpk.position; put(s, 'kidA', { p: [c.x, 0.32, c.z], ry: -0.7, mood: 'ohno', keep: true, pose: { armL: [-0.5, 0, 0.8], armR: [-0.5, 0, -0.8] }, sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); pop(s, 'school', [c.x, 0.32, c.z], u, '#c080ff', 1.2);
    put(s, 'teacher', { p: [-1.5, 0, -8.0], ry: 0.25, mood: 'strict', pose: { armL: [-2.0, -0.3, -0.2] } }); const kb = put(s, 'kidB', { p: [7.5, 0, -1.2], ry: 0.4, mood: 'laugh', pose: P.sit }); CP.ground(kb, 1.5);
    return cam([-3.5, 7.0, 13.5], [4.0, 3.4, -7], 40, { lead: 'teacher', faces: { teacher: [[0, 'strict'], [0.5, 'rage']] } }); });
  // ================= POOL =================
  ST('Kids save on', (s, u) => { const ry0 = s.roofY, tw = s.tower.position; const a = put(s, 'swim1', { p: [tw.x - 1.0, ry0, tw.z - 1.0], ry: -0.6, mood: 'laugh' }); a.root.updateMatrixWorld(true); GN.aim(a, 'R', V(tw.x - 2.4 * 1, ry0 + L(3.0, 2.2, E(cl(u * 2))), tw.z - 1.8));
    put(s, 'swim2', { p: [tw.x + 1.6, ry0, tw.z + 1.6], ry: 0.3, mood: 'grin', pose: P.cheer }); put(s, 'crowd19', { p: [tw.x - 3.4, ry0, tw.z + 2.4], ry: 0.6, mood: 'grin', pose: P.wave });
    const cp = [tw.x + 3, ry0 + 4.5, tw.z + 14]; ['swim2', 'crowd19'].forEach((n) => look(n, cp, 0.6)); return cam(cp, [tw.x - 1, ry0 + 1.8, tw.z], 34, { lead: 'swim1' }); });
  ST('Then they jump', (s, u) => { const ry0 = s.roofY, tw = s.tower.position, k = E(u); const a = put(s, 'swim2', { p: [tw.x + L(2.5, 5.5, k), 0, tw.z + L(5, 12, k)], ry: -0.3, mood: 'scream', keep: true, pose: PX.cannon }); a.root.position.y = L(ry0 + 0.5, 3, u * u);
    put(s, 'swim1', { p: [tw.x - 0.8, ry0, tw.z + 3.6], ry: 0.15, mood: 'laugh', pose: P.cheer }); if (u > 0.75) prop(s, 'splash', () => PROPS.puff(8, '#e8fbff'), [tw.x + 5.5, 0, tw.z + 12.5]);
    return cam([tw.x + 7, 2.6, tw.z + 25], [tw.x + 2, L(12, 7, u), tw.z + 5], 40, { lead: 'swim1' }); });
  // ================= TOWN: the Flagman =================
  ST('The big flag', (s, u) => { s.mood('day'); put(s, 'crowd3', { p: [3, 0, 9], ry: PI + 0.2, mood: 'calm', pose: PX.lookUp });
    return cam([7, 1.6, 15], [0, L(16, 22, u), -2], 40); });
  ST('belongs to the', (s, u) => { s.mood('day'); put(s, 'flagman', { p: [-2.0, 0, 5.8], ry: 0.45, mood: 'proud', pose: PX.salute, keep: true }); const h = head('flagman');
    return cam([h.x + 5, h.y - 1.6, h.z + 9], [h.x - 1.5, h.y + 2.5, h.z - 3], 38, { lead: 'flagman', talk: false }); });
  ST('A flag is', (s, u) => { s.mood('day'); put(s, 'flagman', { p: [-2.0, 0, 5.8], ry: 0.3, pose: PX.fingerUp });
    return faceCam('flagman', 6.5, 10, -4, 30, { lead: 'flagman', faces: { flagman: [[0, 'proud'], [0.25, 'shout'], [0.7, 'grin']] } }); });
  // ================= PARADE (sepia flashback) =================
  const parade = (s, u, o = {}) => { s.mood('day'); s.big.cloth.visible = !o.bare; const x0 = o.x0 ?? -6;
    const fm = put(s, 'flagman', { p: [x0 + u * 1.5, 0, 12], ry: PI / 2, walk: 0, pose: PX.carry, mood: 'proud' }); const cw = prop(s, 'carryCloth', () => cloth('carry', CP.COL.town, 4.5, 0.3), [0, 0, 0]); cw.position.copy(torso('flagman')).add(V(0.9, 0.2, 0.9)); cw.rotation.set(0, PI / 2 + 0.3, -1.2);
    put(s, 'tuba', { p: [x0 - 4 + u * 1.5, 0, 12.5], ry: PI / 2, walk: 1, pose: PX.tuba, mood: 'strain' });
    const lin = ['crowd20', 'crowd21', 'crowd22', 'crowd23', 'crowd24', 'crowd25']; lin.forEach((n, i) => put(s, n, { p: [-14 + i * 4, 0, 6.5 - (i % 2)], ry: 0, mood: ['laugh', 'grin', 'calm', 'laugh', 'grin', 'smug'][i], pose: i % 2 ? P.cheer : P.wave }));
    prop(s, 'paradeBunt', () => CP.bunting(V(-20, 8, 8), V(16, 8, 8), 1.6, 24), [0, 0, 0]); return fm; };
  ST('Once at a', (s, u) => { parade(s, u); return sepia(cam([4, 6, 34], [-4, 4, 12], 40, { lead: 'flagman' })); });
  ST('he carried it', (s, u) => { parade(s, u, { bare: true, x0: -3 }); return sepia(cam([6, 3.2, 22], [-2, 6, 6], 40, { lead: 'flagman' })); });
  ST('and everyone who', (s, u) => { parade(s, u, { bare: true }); [['crowd20', -14], ['crowd22', -6], ['crowd24', 2]].forEach(([n, x], i) => { const a = put(s, n, { p: [x, 0, 6.5], ry: 0, mood: 'scream', keep: true, pose: PX.trip }); CP.ground(a, 0.5); poof(s, 'pa' + i, [x, 0, 7], cl(u * 1.6 - i * 0.15), 1.4, 9 + i); });
    return sepia(cam([0, 5, 30], [-5, 2.5, 8], 40, { lead: 'flagman' })); });
  ST('landed behind the', (s, u) => { parade(s, u, { bare: true }); const tx = -10 + u * 1.5; [0, 1, 2].forEach((i) => { const n = ['crowd20', 'crowd22', 'crowd24'][i], x = tx - 2.5 - i * 2.2; put(s, n, { p: [x, 0, 12 + (i - 1) * 1.6], ry: PI / 2, mood: 'shock', keep: true, sc: 1 + 0.15 * (1 - E(cl(u * 2 - i * 0.2))) }); pop(s, 'pb' + i, [x, 0, 12 + (i - 1) * 1.6], cl(u * 1.3 - i * 0.12), '#f8e8b0'); });
    return sepia(cam([tx + 4.5, 3.4, 20], [tx - 0.8, 3.2, 12.5], 36, { lead: 'tuba' })); });
  // ================= the hero + the Clock Tower =================
  ST("I've touched one", (s, u) => { s.mood('day'); put(s, 'hero', { p: [6, 0, -20], ry: PI - 0.3, pose: PX.lookUp });
    return cam([8.5, 1.5, -12.5], [20, L(30, 40, u), -66], 42, { lead: 'hero', faces: { hero: [[0, 'calm'], [0.5, 'smug']] } }); });
  ST('I was four', (s, u) => { s.mood('day'); const fp = flagTop(s); const a = put(s, 'hero4', { p: [fp.x - 1.4, fp.y, fp.z + 0.6], ry: -2.4, mood: 'laugh', keep: true }); a.root.updateMatrixWorld(true); GN.aim(a, 'R', tinyPole(s).add(V(0, L(2.2, 1.6, E(cl(u * 2))), 0)));
    return sepia(cam([fp.x + 3.5, fp.y + 3.5, fp.z + 8.5], [fp.x - 1, fp.y + 1.4, fp.z - 0.5], 34, { lead: 'hero4' })); });
  ST("It's on top", (s, u) => { s.mood('day'); const fp = flagTop(s); const tp = tinyPole(s); return cam([fp.x + 28, fp.y - 14, fp.z + 70], [tp.x, tp.y + 1.8, tp.z], L(6, 3.2, E(u)), { zoom: 1 }); });
  ST('And I trip', (s, u) => { s.mood('day'); const k = E(cl(u * 1.5)); const a = put(s, 'hero', { p: [8, 0, -24], ry: -0.4, pose: { body: [L(0.2, 1.1, k), 0, -0.15], armL: [-2.6, 0, 0.5], armR: [-2.2, 0, -0.7], legL: [L(0.2, 1.2, k), 0, 0.1], legR: [-0.2, 0, -0.1], head: [-0.5, 0, 0] } }); CP.ground(a, L(0, 0.8, k));
    return orb(torso('hero'), 10, 20, 8, 32, { lead: 'hero', faces: { hero: [[0, 'ohno'], [0.4, 'scream']] } }); });
  ST('Three hundred steps', (s, u) => { s.mood('day'); const st = step(s, 92 - u * 3), a = put(s, 'hero', { p: [st.p.x, st.p.y, st.p.z], ry: st.a - PI / 2, walk: 0, mood: 'sad' }); CP.ground(a, st.p.y);
    const h = head('hero'), c0 = s.tower.position, out = V(h.x - c0.x, 0, h.z - c0.z).normalize(), tg = V(-out.z, 0, out.x); return cam(h.clone().addScaledVector(out, 15).addScaledVector(tg, -5).add(V(0, -3, 0)), h.clone().add(V(0, 2, 0)), 40, { lead: 'hero', faces: { hero: [[0, 'sad'], [0.5, 'worry']] } }); });
  ST('every time', (s, u) => { s.mood('day'); const st = step(s, 0); put(s, 'hero', { p: [st.p.x + 2, 0, st.p.z + 3], ry: 0.4, pose: PX.tired, mood: 'worry', keep: true }); CP.ground(CAST.get('hero'), 0);
    return faceCam('hero', 6, 25, -8, 34, { lead: 'hero', talk: false }); });
  // ================= YARD: floor is lava =================
  ST('So at recess', (s, u) => { crowdWalk(s, [['crowd4', -10, 8, 0.8, 4, 'laugh'], ['crowd9', 6, 12, -0.6, 4, 'grin'], ['crowd14', 2, 4, 2.5, 3.5, 'laugh'], ['crowd19', -4, 16, -2.2, 4, 'scream'], ['crowd24', 10, 2, -1.6, 3.5, 'grin']], u);
    put(s, 'hero', { p: [-2, 1.55, 14.2], ry: 0.3, pose: P.cheer, mood: 'grin' }); return cam([14, 9, 30], [-1, 3, 2], 40, { lead: 'hero' }); });
  ST("I'm the floor", (s, u) => { s.lava(true); const b0 = s.benches[0].position, b1 = s.benches[1].position, k = E(u), p = b0.clone().lerp(b1, k); p.y = 1.55 + Math.sin(PI * u) * 3.2;
    put(s, 'hero', { p: p.toArray(), ry: 1.4, pose: PX.jump, mood: 'grin', keep: true }); [['crowd4', -7, 2, 'scream', P.cheer, 2.0], ['crowd9', 8, 8, 'laugh', P.cheer, 0.4], ['crowd14', 1, 3, 'shock', P.handsHead, 0.8]].forEach(([n, x, z, m, po, y]) => put(s, n, { p: [x, y, z], ry: Math.atan2(-x, 10 - z), mood: m, pose: po }));
    return cam([0, 5, 22], [p.x, p.y + 1, p.z], 40, { lead: 'hero', faces: { hero: [[0, 'grin'], [0.5, 'laugh']] } }); });
  ST("I've never touched", (s, u) => { s.lava(true); const x = L(-4, 2, u); const a = put(s, 'hero', { p: [x, 1.65, -6], ry: PI / 2, pose: PX.bars, mood: 'smug', keep: true }); a.root.position.y = 6.6 - 4.85 * 0.9;
    [['crowd4', -8, -6, 'laugh', P.cheer, 4.2], ['crowd9', 8, -6, 'grin', P.cheer, 4.2]].forEach(([n, x2, z, m, po, y]) => put(s, n, { p: [x2, y, z], ry: 0, mood: m, pose: po }));
    return cam([x + 2, 4.5, 8], [x, 4.6, -6], 38, { lead: 'hero', faces: { hero: [[0, 'smug'], [0.5, 'laugh']] } }); });
  // ================= Turbo in the square =================
  ST('My dog Turbo', (s, u) => { s.mood('day'); const a = put(s, 'turbo', { p: [3, 0, 8], ry: -0.3, mood: 'happy', dog: DP.sit }); const h = head('turbo');
    return cam([h.x - 1.2, h.y + 0.3, h.z + 4.6], [h.x, h.y - 0.3, h.z], 30, { lead: 'turbo', talk: false, faces: { turbo: [[0, 'happy'], [0.6, 'calm']] } }); });
  ST('touches the square', (s, u) => { s.mood('day'); const k = E(cl(u * 1.8)); put(s, 'turbo', { p: [0, TY, L(-3.4, -2.62, k)], ry: 0, mood: 'happy', dog: Object.assign({}, DP.wag(u * 20), { head: [L(0, 0.15, k), 0, 0] }) });
    if (u > 0.5) pop(s, 'boop', [0, TY, 0], (u - 0.5) * 1.6, '#38f08a', 1.1); return cam([9.0, 3.4, 8.5], [-0.4, 3.6, -1.5], 34, { lead: 'turbo', talk: false }); });
  ST('fifty times a', (s, u) => { s.mood('day'); const x = L(-10, 6, u); put(s, 'turbo', { p: [x, 0, 8], ry: PI / 2, mood: 'happy', dog: DP.run(u * 30) }); CP.ground(CAST.get('turbo'), Math.abs(Math.sin(u * 15)) * 0.5);
    return cam([x - 3, 2.6, 19], [x + 1, 1.8, 8], 36, { lead: 'turbo', talk: false }); });
  ST('He trips on', (s, u) => { s.mood('day'); const k = E(cl(u * 1.6)); const a = put(s, 'turbo', { p: [6, 0, 8], ry: PI / 2 + 0.3, mood: u < 0.35 ? 'shock' : 'dizzy', keep: true, dog: k < 0.5 ? DP.run(u * 30) : DP.trip }); CP.ground(a, 0);
    return cam([12.5, 2.0, 14.5], [6, 1.2, 8], 34, { lead: 'turbo', talk: false }); });
  ST('poof#2', (s, u) => { s.mood('day'); poof(s, 'turbo1', [6.5, 0, 8], u, 1.3, 13); if (u < 0.2) { const a = put(s, 'turbo', { p: [6, 0, 8], ry: PI / 2 + 0.3, mood: 'dizzy', keep: true, dog: DP.trip }); CP.ground(a, 0); a.root.scale.multiplyScalar(1 - u * 4); }
    return cam([10, 1.8, 13], [6.2, 1.4, 8], 32); });
  ST('back in the', (s, u) => { s.mood('day'); put(s, 'turbo', { p: [1.8, TY, 1.8], ry: 0.7, mood: 'happy', dog: DP.wag(u * 22), sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); pop(s, 'tb', [1.8, TY, 1.8], u, '#38f08a', 1.2);
    put(s, 'crowd5', { p: [-5, 0, 4], ry: 0.8, mood: 'laugh', pose: P.point }); return cam([6.5, 4.5, 11], [1.8, 2.8, 1.8], 32, { lead: 'crowd5', faces: { turbo: [[0, 'happy']] } }); });
  // ================= the Fair =================
  const fairCrowd = (s, scared) => [['crowd10', -6, 8, 0.4], ['crowd11', -2.5, 10, 0.2], ['crowd12', 3.5, 7.5, -0.5], ['crowd13', 7.5, 9.5, -0.6], ['crowd15', -10, 4, 0.9], ['crowd16', 10, 3, -1.0]].forEach(([n, x, z, ry], i) =>
    put(s, n, { p: [x, 0, z], ry, mood: scared ? ['terror', 'scream', 'shock'][i % 3] : ['laugh', 'grin', 'calm'][i % 3], pose: scared ? [P.handsHead, P.cheer, PX.run][i % 3] : [P.wave, undefined, P.point][i % 3] }));
  ST('Then came the', (s, u) => { s.mood('sunset'); s.fair.visible = true; fairCrowd(s, false); put(s, 'turbo', { p: [1.6, 0, 16], ry: 0.2, mood: 'happy', dog: DP.wag(u * 20) }); put(s, 'hero', { p: [-1.4, 0, 17], ry: 0.1, mood: 'laugh', pose: P.wave });
    return cam([L(4, 1, u), 9, 38], [-3, 6, -10], 44, { lead: 'hero', grade: 'sunset' }); });
  ST('The ground cracked', (s, u) => { s.mood('sunset'); s.fair.visible = true; s.crack.visible = true; fairCrowd(s, true); put(s, 'turbo', { p: [1.6, 0, 19.6], ry: 0.2, mood: 'shock', dog: DP.stand }); put(s, 'hero', { p: [-1.4, 0, 21], ry: 0.05, pose: { armL: [-0.4, 0, 0.6], armR: [-1.6, 0, -0.2] } });
    return cam([2, 11, 37], [-1.5, 3.5, -8], 44, { lead: 'hero', grade: 'sunset', roll: shake(u, 1.4), faces: { hero: [[0, 'ohno'], [0.4, 'scream']] } }); });
  // ================= the hole (dusk -> night) =================
  const slabs = () => once('slabs', () => { const g = new T.Group(); for (let i = 0; i < 26; i++) { const m = new T.Mesh(new T.BoxGeometry(2 + (i % 3), 0.5, 1.6 + (i % 2)), ENV.mt(ENV.T.cobble(), 2.2)); m.position.set(Math.sin(i * 2.1) * 14, -i * 1.1, Math.cos(i * 1.3) * 14); m.rotation.set(i, i * 0.7, i * 1.3); m.castShadow = true; g.add(m); } return g; });
  const dust = () => once('dust', () => { const g = new T.Group(); for (let i = 0; i < 10; i++) { const p = PROPS.puff(7, '#e8d8c0'); const a = (i / 10) * PI * 2; p.position.set(Math.cos(a) * 22, 0.8, Math.sin(a) * 22); p.scale.setScalar(2.4); g.add(p); } return g; });
  const bottom = (s, D, list, scared = 'terror') => list.forEach((n, i) => { const a = i * 2.39, d = 5 + (i % 7) * 2.1; put(s, n, { p: [Math.cos(a) * d, -D, Math.sin(a) * d + 2], ry: Math.atan2(-Math.cos(a), -Math.sin(a)) + PI + (i % 3 - 1) * 0.4, mood: ['terror', 'worry', 'sad', 'shock', 'scream', 'worry'][i % 6], pose: i % 4 === 0 ? P.handsHead : i % 4 === 1 ? P.cheer : i % 4 === 2 ? PX.lookUp : undefined }); });
  const BOT = Array.from({ length: 18 }, (_, i) => 'crowd' + (30 + i));
  ST('and the square', (s, u) => { s.mood('dusk'); const sl = prop(s, 'slabsP', slabs, [0, -4 - u * 14, 0]); prop(s, 'dustP', dust, [0, 0, 0]).scale.setScalar(1 + u * 0.4);
    return cam([6, 22, 44], [0, -20, -4], 44, { grade: 'sunset', roll: shake(u, 1.6) }); });
  ST('The pole the', (s, u) => { s.mood('dusk'); const k = E(u); s.big.position.set(-2, L(-6, -26, k), -4); s.big.rotation.set(L(0.15, 0.6, k), 0.9, L(0.25, 1.2, k));
    return cam([14, 10, 34], [-2, L(0, -14, k), -4], 46, { grade: 'sunset' }); });
  ST('the cotton candy', (s, u) => { s.mood('dusk'); const k = E(u); s.candy.position.set(9, L(-4, -26, k), 2); s.candy.rotation.set(L(0.2, 1.6, k), -0.9, L(0.3, 2.4, k));
    return cam([20, 0, 22], [9, L(-3, -18, k), 2], 40, { grade: 'sunset' }); });
  ST('Turbo', (s, u) => { s.mood('dusk'); const k = E(u); const a = put(s, 'turbo', { p: [3, L(-8, -22, k), 10], ry: 0.4, mood: 'shock', keep: true, dog: DP.jump }); a.root.rotation.x = 0.6 + u * 1.5; a.noAct = false; a.actK = 2.5;
    const h = head('turbo'); return cam([h.x + 2, h.y + 4, h.z + 8], [h.x, h.y - 1, h.z], 34, { grade: 'sunset', talk: false }); });
  ST('Now anyone who', (s, u) => { s.mood('sunset'); const k = E(cl(u * 1.4)); const a = put(s, 'crowd12', { p: [33, 0, 2], ry: -PI / 2, mood: 'scream', keep: true, pose: { body: [L(0.2, 1.1, k), 0, 0.1], armL: [-2.6, 0, 0.5], armR: [-2.2, 0, -0.7], legL: [-0.2, 0, 0], legR: [L(0.2, 1.3, k), 0, 0], head: [-0.5, 0, 0] } }); CP.ground(a, L(0, 0.8, k));
    if (u > 0.6) poof(s, 'anyone', [32.5, 0, 2], (u - 0.6) * 2.5, 1.4, 21); return orb(V(32.5, 2, 2), 11, -60, 8, 34, { grade: 'sunset' }); });
  ST('landed at the', (s, u) => { s.mood('dusk'); bottom(s, s.D, BOT.slice(0, 8)); put(s, 'crowd12', { p: [4, -s.D, 12], ry: PI, mood: 'shock', keep: true, sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); pop(s, 'land', [4, -s.D, 12], u, '#38f08a');
    return cam([2, -s.D + 3.6, 2.5], [4, -s.D + 2.8, 12], 40, { grade: 'sunset', lead: 'crowd12' }); });
  ST('By sunset half', (s, u) => { s.mood('dusk'); bottom(s, s.D, BOT); return cam([3, L(26, 22, u), 37], [0, -32, -6], 46, { grade: 'sunset', post: { exposure: 1.2 } }); });
  ST('The Flagman too', (s, u) => { s.mood('dusk'); bottom(s, s.D, BOT.slice(0, 10)); put(s, 'flagman', { p: [1.5, -s.D, 4.5], ry: 0.2, mood: 'sad', keep: true, pose: { armR: [-1.0, 0, 0.35] } });
    return faceCam('flagman', 7, 15, 4, 34, { grade: 'sunset', lead: 'flagman', talk: false }); });
  // night
  const A12 = 1.2, rim = (a, r = 25.5) => V(Math.cos(a) * r, 0, Math.sin(a) * r), inward = (a) => Math.atan2(-Math.cos(a), -Math.sin(a));
  ST('The firemen lowered', (s, u) => { s.mood('night'); const p1 = rim(A12 - 0.12), p2 = rim(A12 + 0.12); put(s, 'fire1', { p: p1.toArray(), ry: inward(A12), mood: 'strain', pose: PX.lower }); put(s, 'fire2', { p: p2.toArray(), ry: inward(A12), mood: 'strain', pose: PX.lower });
    const lad = prop(s, 'heldLadder', () => CP.ladder(14, { red: true }), rim(A12, 24.4).add(V(0, 2.4, 0))); lad.rotation.set(0, 0, 0); lad.lookAt(0, lad.position.y, 0); lad.rotateX(PI / 2 + L(-1.2, -0.25, E(u))); lad.rotateX(0);
    const tp = rim(A12, 15).add(V(0, -4, 0)); return cam([tp.x, tp.y, tp.z], [Math.cos(A12) * 23, -1.5, Math.sin(A12) * 23], 42, { grade: 'night', lead: 'fire1', post: { exposure: 1.4 } }); });
  const ladderAt = (a, y) => V(Math.cos(a) * 23.6, y, Math.sin(a) * 23.6);
  ST('People climbed halfway', (s, u) => { s.mood('night'); ['crowd31', 'crowd33', 'crowd35'].forEach((n, i) => { const p = ladderAt(A12, -12 + i * 3.6 + u * 0.8); put(s, n, { p: p.toArray(), ry: inward(A12) + PI, mood: ['strain', 'worry', 'strain'][i], pose: i % 2 ? PX.climb2 : PX.climb }); });
    const c = rim(A12, 10).add(V(0, -10, 0)); return cam(c, ladderAt(A12, -6), 42, { grade: 'night', post: { exposure: 1.2 } }); });
  ST('slipped', (s, u) => { s.mood('night'); const p = ladderAt(A12, -3.6 - u * 9).add(V(-Math.cos(A12) * u * 2, 0, -Math.sin(A12) * u * 2)); put(s, 'crowd35', { p: p.toArray(), ry: inward(A12) + PI, mood: 'scream', keep: true, pose: PX.flail });
    put(s, 'crowd33', { p: ladderAt(A12, -8.4).toArray(), ry: inward(A12) + PI, mood: 'shock', pose: PX.climb }); const c = rim(A12, 7).add(V(0, -8, 0)); return cam(c, ladderAt(A12, -7), 42, { grade: 'night', post: { exposure: 1.2 } }); });
  ST('and poof back', (s, u) => { s.mood('night'); bottom(s, s.D, BOT.slice(0, 8)); const b = rim(A12, 17).add(V(0, -s.D, 0)); put(s, 'crowd35', { p: b.toArray(), ry: inward(A12), mood: 'sad', keep: true, sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); pop(s, 'lad', b, u);
    return cam(b.clone().multiplyScalar(0.45).add(V(0, -s.D * 0.55 + 3.6, 0)), b.clone().add(V(0, 2.6, 0)), 36, { grade: 'night', lead: 'crowd35', post: { exposure: 1.2 } }); });
  ST('We threw ropes', (s, u) => { s.mood('night'); const a0 = PI / 2 + 0.1; put(s, 'hero', { p: rim(a0, 25.2).toArray(), ry: inward(a0), pose: PX.throw }); put(s, 'crowd6', { p: rim(a0 + 0.12, 25.6).toArray(), ry: inward(a0 + 0.12), mood: 'strain', pose: PX.throw }); put(s, 'crowd8', { p: rim(a0 - 0.14, 25.8).toArray(), ry: inward(a0 - 0.14), mood: 'worry', pose: PX.lower });
    const hp = head('hero'), end = V(hp.x * 0.5 + 7, L(0, -24, E(u)), hp.z * 0.62); const r = CP.rope([hp.clone().add(V(0, 1.2, -0.6)), hp.clone().lerp(end, 0.4).add(V(0, 3 - u * 4, 0)), end], 0.1); ENG.add(s.scene, r); C.ropeTmp && C.ropeTmp.geometry.dispose(); C.ropeTmp = r;
    return cam([hp.x * 0.5, -7, hp.z * 0.5], [hp.x, hp.y - 0.5, hp.z], 40, { grade: 'night', lead: 'hero', faces: { hero: [[0, 'strain'], [0.5, 'grin']] }, post: { exposure: 1.2 } }); });
  const A9 = 0.9;
  ST('One guy made', (s, u) => { s.mood('night'); const p = V(Math.cos(A9) * 22.8, L(-8, -4.5, u), Math.sin(A9) * 22.8); put(s, 'topguy', { p: p.toArray(), ry: inward(A9) + PI, mood: 'strain', pose: climbAt(u) });
    prop(s, 'rope9', () => CP.rope([V(Math.cos(A9) * 25.8, 0.6, Math.sin(A9) * 25.8), V(Math.cos(A9) * 24.2, 0.1, Math.sin(A9) * 24.2), V(Math.cos(A9) * 23.2, -10, Math.sin(A9) * 23.2), V(Math.cos(A9) * 23.0, -20, Math.sin(A9) * 23.0)], 0.1), [0, 0, 0]);
    const c = V(Math.cos(A9) * 13, -12, Math.sin(A9) * 13); return cam(c, p.clone().add(V(0, 3, 0)), 40, { grade: 'night', lead: 'topguy', post: { exposure: 1.25 } }); });
  ST('waved at us', (s, u) => { s.mood('night'); const p = V(Math.cos(A9) * 23.2, -3.9, Math.sin(A9) * 23.2); put(s, 'topguy', { p: p.toArray(), ry: inward(A9), mood: 'grin', keep: true, pose: { armR: [-3.0, 0, -0.1], armL: [-2.7, 0, 0.6 + 0.4 * Math.sin(u * 20)], legL: [-0.4, 0, 0], legR: [0.2, 0, 0] } });
    const c = V(Math.cos(A9) * 13, -8.5, Math.sin(A9) * 13); return cam(c, p.clone().add(V(0, 2.4, 0)), 34, { grade: 'night', lead: 'topguy', talk: false, post: { exposure: 1.25 } }); });
  ST('slipped and poofed', (s, u) => { s.mood('night'); const k = E(u), p = V(Math.cos(A9) * L(23, 19, k), L(-3.9, -20, k), Math.sin(A9) * L(23, 19, k)); put(s, 'topguy', { p: p.toArray(), ry: inward(A9), mood: 'ohno', keep: true, pose: PX.flail }); CAST.get('topguy').root.rotation.x = -u * 2;
    if (u > 0.55) poof(s, 'top', p, (u - 0.55) * 2.2, 1.5, 31); const c = V(Math.cos(A9) * 10, -10, Math.sin(A9) * 10); return cam(c, p.clone().add(V(0, 2, 0)), 42, { grade: 'night', lead: 'topguy', talk: false, post: { exposure: 1.25 } }); });
  // Turbo jump-poof at the wall
  const TB = (s) => V(0, -s.D, 19.5);
  const tJump = (s, u, hi) => { const b = TB(s), y = Math.sin(PI * cl(u * 1.2)) * hi; const a = put(s, 'turbo', { p: [b.x, b.y + y, b.z], ry: 0, mood: 'bark', keep: true, dog: DP.jump }); a.actK = 2; return b; };
  ST('Turbo kept jumping', (s, u) => { s.mood('night'); const b = tJump(s, u, 3); return cam(b.clone().add(V(6, 3, -8)), b.clone().add(V(0, 3, 0)), 36, { grade: 'night', lead: 'turbo', talk: false, post: { exposure: 1.3, saturation: 1.1 } }); });
  ST('Jump', (s, u) => { s.mood('night'); const b = tJump(s, 0.4 + u * 0.3, 6); return cam(b.clone().add(V(5, 1, -7)), b.clone().add(V(0, 6, 0)), 36, { grade: 'night', lead: 'turbo', talk: false, post: { exposure: 1.3, saturation: 1.1 } }); });
  ST('Poof', (s, u) => { s.mood('night'); const b = TB(s); poof(s, 'tj1', b.clone().add(V(0, 5, 0)), u * 1.3, 1.3, 41); put(s, 'turbo', { p: [b.x + 1.5, b.y, b.z - 2], ry: 0.3, mood: 'dizzy', keep: true, dog: DP.sit, sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); pop(s, 'tj1', [b.x + 1.5, b.y, b.z - 2], u, '#38f08a', 1.1);
    return cam(b.clone().add(V(6, 2.5, -9)), b.clone().add(V(0.5, 3, -1)), 38, { grade: 'night', talk: false, post: { exposure: 1.3, saturation: 1.1 } }); });
  ST('Jump#2', (s, u) => { s.mood('night'); const b = tJump(s, 0.3 + u * 0.4, 5.5); return cam(b.clone().add(V(-5, 2, -7)), b.clone().add(V(0, 5, 0)), 36, { grade: 'night', lead: 'turbo', talk: false, roll: 8, post: { exposure: 1.3, saturation: 1.1 } }); });
  ST('Poof#2', (s, u) => { s.mood('night'); const b = TB(s); poof(s, 'tj2', b.clone().add(V(0, 4.5, 0)), u * 1.3, 1.3, 43); put(s, 'turbo', { p: [b.x - 1.5, b.y, b.z - 2], ry: -0.3, mood: 'dizzy', keep: true, dog: DP.trip, sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); CP.ground(CAST.get('turbo'), b.y); pop(s, 'tj2', [b.x - 1.5, b.y, b.z - 2], u, '#38f08a', 1.1);
    return cam(b.clone().add(V(-6, 2.5, -9)), b.clone().add(V(-0.5, 3, -1)), 38, { grade: 'night', talk: false, post: { exposure: 1.3, saturation: 1.1 } }); });
  const rimCrowd = (s, a0, list, mood = 'worry') => list.forEach((n, i) => { const a = a0 + (i - (list.length - 1) / 2) * 0.09; put(s, n, { p: rim(a, 25.4 + (i % 2) * 1.5).toArray(), ry: inward(a), mood: [mood, 'sad', 'worry', 'terror'][i % 4], pose: PX.lower }); });
  ST('Nobody could go', (s, u) => { s.mood('night'); rimCrowd(s, PI / 2, ['crowd1', 'crowd3', 'crowd5', 'crowd7', 'crowd9', 'crowd11']); return cam([0, -1.5, 16], [0, 3.2, 25], 40, { grade: 'night', post: { exposure: 1.25 } }); });
  ST('If you fell', (s, u) => { s.mood('night'); const a = put(s, 'hero', { p: [0.4, 0, 25.0], ry: PI, pose: PX.lower, mood: 'worry' }); prop(s, 'peb', pebbles, [0.2, -0.3 - u * 3, 23.6]);
    return cam([1.2, -2.5, 20.5], [0.4, 2.6, 24.6], 36, { grade: 'night', lead: 'hero', talk: false, post: { exposure: 1.25 } }); });
  ST("I lowered Turbo's", (s, u) => { s.mood('night'); put(s, 'hero', { p: [0.4, 0, 25.0], ry: PI, pose: PX.lower, mood: 'worry' }); const hh = CAST.get('hero'); hh.root.updateMatrixWorld(true); const hp = hh.armR.inner.localToWorld(V(0, -1.8, 0)), end = V(0.6, L(-2, -26, E(u)), 21.5); const r = CP.rope([hp, hp.clone().lerp(end, 0.5).add(V(0.4, 0, 0)), end], 0.06, '#e8202a'); ENG.add(s.scene, r); C.leashTmp && C.leashTmp.geometry.dispose(); C.leashTmp = r;
    return cam([1.5, -7, 15], [0.4, 1.5, 24], 40, { grade: 'night', lead: 'hero', faces: { hero: [[0, 'worry'], [0.5, 'calm']] }, post: { exposure: 1.25 } }); });
  ST('He chewed through', (s, u) => { s.mood('night'); const b = TB(s), a = put(s, 'turbo', { p: [b.x, b.y, b.z - 1.5], ry: PI + 0.2, mood: 'happy', keep: true, dog: Object.assign({}, DP.sit, { head: [0.25 + 0.15 * Math.sin(u * 30), 0, 0] }) }); const h = head('turbo');
    const end = h.clone().add(V(0.1, -0.35, 0.7)), r = CP.rope([V(0.6, b.y + 18, 21.2), V(0.5, b.y + 6, 20.4), end], 0.06, '#e8202a'); ENG.add(s.scene, r); C.leash2 && C.leash2.geometry.dispose(); C.leash2 = r; if (u > 0.6) { r.visible = false; }
    return cam([h.x + 3.5, h.y + 1.2, h.z - 6.5], [h.x, h.y - 0.2, h.z], 34, { grade: 'night', lead: 'turbo', talk: false, post: { exposure: 1.3 } }); });
  ST('That night I', (s, u) => { s.mood('night'); const h = put(s, 'hero', { p: [0.6, 0, 24.6], ry: PI, mood: 'sad', pose: PX.sitEdge }); h.root.position.y = -0.55; bottom(s, s.D, BOT.slice(0, 14)); put(s, 'flagman', { p: [1.5, -s.D, -1.5], ry: 0.3, mood: 'sad' });
    return cam([2.5, L(21, 19, u), 34], [0, -27, -5], 46, { grade: 'night', lead: 'hero', talk: false, post: { exposure: 1.25, aperture: 0 } }); });
  ST('staring at the', (s, u) => { s.mood('night'); return cam([L(3, 1.5, u), -28.5, 15], [8, -33, 5], 34, { grade: 'night', post: { exposure: 1.35 } }); });
  ST('And I thought', (s, u) => { s.mood('night'); const h = put(s, 'hero', { p: [0.6, 0, 24.6], ry: PI, pose: PX.sitEdge }); h.root.position.y = -0.55;
    return faceCam('hero', 4.5, 25, 5, 30, { grade: 'night', lead: 'hero', talk: false, faces: { hero: [[0, 'sad'], [0.5, 'worry']] }, post: { exposure: 1.35 } }); });
  ST("The pole doesn't", (s, u) => { parade(s, u, { bare: true, x0: 2 }); return sepia(cam([-1, 3.5, 32], [1, 9, 0], 42, { lead: 'flagman' })); });
  ST('The cloth does', (s, u) => { parade(s, u, { bare: true, x0: -6 }); const t = torso('flagman'); [0, 1].forEach((i) => { const p = V(-11 + u * 1.5 - i * 2.4, 0, 12.5 + (i ? 1.5 : -1.5)); put(s, ['crowd20', 'crowd22'][i], { p: p.toArray(), ry: PI / 2, mood: 'shock', keep: true }); pop(s, 'cd' + i, p, cl(u * 1.3 - i * 0.2), '#f8e8b0'); });
    return sepia(cam([t.x + 4, t.y + 0.5, t.z + 6], [t.x - 1.5, t.y, t.z], 32, { lead: 'flagman' })); });
  ST('And if I', (s, u) => { s.mood('night'); const h = put(s, 'hero', { p: [0.6, 0, 24.6], ry: PI, pose: PX.sitEdge }); h.root.position.y = -0.55;
    return faceCam('hero', 4.0, -20, 3, 30, { grade: 'night', lead: 'hero', faces: { hero: [[0, 'worry'], [0.4, 'smug']] }, post: { exposure: 1.35 } }); });
  ST("I'd only end", (s, u) => { s.mood('sunset'); const fp = flagTop(s); return cam([fp.x + 8, fp.y + 3, fp.z + 14], [fp.x - 1, fp.y + 1.6, fp.z - 1], L(30, 24, u), { grade: 'sunset' }); });
  // the climb down + up (near wall, +z, angle PI/2): wallR(y) gives the wall radius at height y
  const onWall = (s, n, y, o = {}) => { const a0 = PI / 2 + (o.da || 0), rr = s.wallR(y) - 1.25; return put(s, n, Object.assign({ p: [Math.cos(a0) * rr, y, Math.sin(a0) * rr], ry: -PI / 2 }, o)); };
  const wcam = (n, dy, d = 1, fov = 38, o = {}) => { const h = head(n); return cam([h.x - 5.2 * d, h.y + dy, h.z - 4.4 * d], [h.x, h.y + dy * 0.35 - 0.4, h.z], fov, Object.assign({ grade: 'night', lead: n, talk: false, post: { exposure: 1.3 } }, o)); };
  const teeth = (n, k = 'teeth') => { const a = CAST.get(n), c = cloth(k, CP.COL.town, 1.7, 0.18); c.cloth.position.set(0, 0, 0); c.cloth.rotation.set(0, 0.35, -0.2); c.position.set(0.02, -0.24, 0.64); a.head.add(c); ENG.extras.push(c); };
  ST('So I climbed', (s, u) => { s.mood('night'); onWall(s, 'hero', L(-1.0, -4.5, E(u)), { pose: PX.climb, mood: 'strain' }); return wcam('hero', -1.5, 1.1); });
  ST('Floor is lava', (s, u) => { s.mood('night'); onWall(s, 'hero', L(-8, -10, u), { pose: climbAt(u), mood: 'smug' }); return wcam('hero', -3, 0.8, 38); });
  ST('Rock to rock', (s, u) => { s.mood('night'); onWall(s, 'hero', L(-13, -17, u), { pose: climbAt(u), mood: 'strain' }); return wcam('hero', 1, 1.3, 40); });
  ST('root to root', (s, u) => { s.mood('night'); onWall(s, 'hero', L(-20, -23, u), { pose: climbAt(u + 0.25), mood: 'smug' }); return wcam('hero', 2.5, 0.9, 36); });
  ST('At the bottom', (s, u) => { s.mood('night'); const b = V(1, -s.D, 18); const a = put(s, 'hero', { p: [b.x, b.y + Math.max(0, 1.5 - u * 3), b.z], ry: PI, pose: u < 0.4 ? PX.jump : PX.hipsL, mood: 'smug' }); bottom(s, s.D, BOT.slice(0, 10)); BOT.slice(0, 10).forEach((n) => look(n, b.toArray(), 1));
    return cam([b.x - 4, b.y + 4, b.z - 9], [b.x, b.y + 2.4, b.z], 40, { grade: 'night', lead: 'hero', talk: false, post: { exposure: 1.3 } }); });
  ST('the Flagman held', (s, u) => { s.mood('night'); const y = -s.D; put(s, 'flagman', { p: [6, y, -1.2], ry: 0.2, mood: 'proud', pose: { armL: [-1.4, 0, -0.2], armR: [-1.4, 0, 0.2], body: [0.3, 0, 0] } }); CP.ground(CAST.get('flagman'), y);
    put(s, 'hero', { p: [10.5, y, 4.5], ry: -2.0, pose: PX.untie, mood: 'strain' }); CP.ground(CAST.get('hero'), y);
    return cam([14, y + 5, 14], [8, y + 1.5, 3], 40, { grade: 'night', lead: 'hero', faces: { flagman: [[0, 'proud'], [0.5, 'grin']] }, talk: false, post: { exposure: 1.3 } }); });
  ST('I put it', (s, u) => { s.mood('night'); s.big.cloth.visible = false; put(s, 'hero', { p: [10.5, -s.D, 6], ry: 0.4, mood: 'smug' }); teeth('hero'); return faceCam('hero', 4.2, 20, 4, 30, { grade: 'night', lead: 'hero', talk: false, post: { exposure: 1.35 } }); });
  ST('and climbed back', (s, u) => { s.mood('night'); s.big.cloth.visible = false; onWall(s, 'hero', L(-24, -19, u), { pose: climbAt(u), mood: 'strain', keep: true }); teeth('hero'); return wcam('hero', -2, 1.1, 38); });
  ST('Halfway a rock', (s, u) => { s.mood('night'); s.big.cloth.visible = false; onWall(s, 'hero', -15, { pose: { armL: [-2.9, 0, 0.2], armR: [-2.8, 0, -0.3], legL: [L(-0.6, 0.3, u), 0, 0.2], legR: [0.5, 0, -0.2] }, mood: u < 0.3 ? 'shock' : 'ohno', keep: true }); teeth('hero'); const t = torso('hero');
    prop(s, 'brk', pebbles, [t.x, t.y - 3 - u * 6, t.z + 0.6]).scale.setScalar(2.2); return wcam('hero', -3, 1.1, 40, { roll: shake(u, 0.8) }); });
  const hangRock = (s, a) => { a.root.updateMatrixWorld(true); const sh = a.armR.getWorldPosition(V(0, 0, 0)), grip = sh.clone().add(V(0, 2.0, 0.55)); prop(s, 'hangRock', () => { const m = new T.Mesh(new T.DodecahedronGeometry(0.9, 0), ENV.mt(ENV.T.rock('#8a7462'), 2)); m.scale.set(1.6, 0.6, 1.1); m.castShadow = m.receiveShadow = true; return m; }, grip.clone().add(V(0, 0.55, 0.45))); GN.aim(a, 'R', grip); };
  ST('I hung there', (s, u) => { s.mood('night'); s.big.cloth.visible = false; const a = onWall(s, 'hero', -15.6, { ry: -PI / 2 - 0.95, pose: PX.hang, mood: 'strain', keep: true, da: 0.06 }); a.root.rotation.z = 0.08 * Math.sin(u * 6); hangRock(s, a); teeth('hero'); a.neck.rotation.set(0.3, 0, 0); const h = head('hero');
    return cam([h.x + 2.5, h.y - 1.8, h.z - 9.5], [h.x - 0.2, h.y - 0.6, h.z + 0.4], 40, { grade: 'night', lead: 'hero', talk: false, post: { exposure: 1.3 } }); });
  ST("I didn't fall", (s, u) => { s.mood('night'); s.big.cloth.visible = false; const a = onWall(s, 'hero', -15.6, { ry: -PI / 2 - 0.95, pose: PX.hang, mood: 'strain', keep: true, da: 0.06 }); hangRock(s, a); teeth('hero'); a.neck.rotation.set(0.2, 0, 0); const h = head('hero');
    return cam([h.x + 1.6, h.y + 0.2, h.z - 4.4], [h.x, h.y - 0.1, h.z], 28, { grade: 'night', lead: 'hero', talk: false, post: { exposure: 1.35 } }); });
  ST('I never touch', (s, u) => { s.mood('night'); s.big.cloth.visible = false; onWall(s, 'hero', L(-15, -12.5, E(u)), { pose: PX.climb, mood: 'smug', keep: true }); teeth('hero'); return wcam('hero', -1, 0.9, 34); });
  // at the top: the cloth on a stick in the dirt = the new checkpoint
  const RIMF = V(-2.2, 0, 26.2);
  const stick = (s, on) => { prop(s, 'stickFlag', () => CP.flag({ c: CP.COL.town, emblem: 'star', h: 4.6, w: 1.9, pole: 0.08, pad: false, poleC: '#8a5a30', ph: 1.5 }), RIMF.clone(), [0, PI + 0.4, 0]); if (on) prop(s, 'stickPad', () => CP.pad({ s: 1.0 }), RIMF.clone().add(V(0, -0.05, 0))); };
  ST('At the top', (s, u) => { s.mood('night'); s.big.cloth.visible = false; stick(s, u > 0.5); if (u > 0.5) pop(s, 'stickpop', RIMF, (u - 0.5) * 2, '#38f08a', 1.4); put(s, 'hero', { p: [-0.6, 0, 26.6], ry: -1.4, pose: PX.stab, mood: 'strain' });
    return cam([-7, 2.8, 31.5], [-1.4, 2.4, 26.2], 34, { grade: 'night', lead: 'hero', talk: false, faces: { hero: [[0, 'strain'], [0.5, 'smug']] }, post: { exposure: 1.25 } }); });
  ST('and yelled Everybody', (s, u) => { s.mood('night'); s.big.cloth.visible = false; stick(s, true); put(s, 'hero', { p: [0.2, 0, 25.0], ry: PI, pose: PX.shout, mood: 'scream' });
    return cam([0.6, 1.2, 16.5], [0.2, 4.0, 25], 38, { grade: 'night', lead: 'hero', faces: { hero: [[0, 'scream']] }, post: { exposure: 1.3 } }); });
  ST('The Flagman blew', (s, u) => { s.mood('night'); bottom(s, s.D, BOT.filter((n) => n !== 'crowd35').slice(0, 8)); const a = put(s, 'flagman', { p: [-3, -s.D, -2], ry: 0.4, mood: 'strain', keep: true, pose: { armR: [-1.9, 0, 0.5] } }); a.blow(true);
    return faceCam('flagman', 6, 15, 8, 32, { grade: 'night', lead: 'flagman', talk: false, post: { exposure: 1.3, bloom: 0.2 } }); });
  ST('and shouted A', (s, u) => { s.mood('night'); bottom(s, s.D, BOT.filter((n) => n !== 'crowd35').slice(0, 8)); put(s, 'flagman', { p: [-3, -s.D, -2], ry: 0.4, pose: PX.fingerUp });
    return faceCam('flagman', 7, -10, -6, 32, { grade: 'night', lead: 'flagman', faces: { flagman: [[0, 'shout'], [0.6, 'proud']] }, post: { exposure: 1.3, bloom: 0.2 } }); });
  const fallFlat = (s, list, k) => list.forEach((n, i) => { const a = CAST.get(n); if (!a.root.visible) return; a.root.rotation.x = -L(0, PI / 2 - 0.05, E(cl(k * 1.6 - (i % 5) * 0.12))); CAST.face(n, 'scream'); a.keepFace = true; });
  ST('Two hundred people', (s, u) => { s.mood('night'); bottom(s, s.D, BOT); put(s, 'flagman', { p: [1.5, -s.D, 6], ry: 0.4 }); fallFlat(s, [...BOT, 'flagman'], u); return cam([4, -14, 30], [0, -32, 0], 46, { grade: 'night', post: { exposure: 1.3 } }); });
  ST('Poof#3', (s, u) => { s.mood('night'); bottom(s, s.D, BOT.slice(6)); fallFlat(s, BOT.slice(6), 1); for (let i = 0; i < 6; i++) { const a = i * 2.39, d = 5 + (i % 7) * 2.1; poof(s, 'bp' + i, [Math.cos(a) * d, -s.D, Math.sin(a) * d + 2], cl(u * 1.4 - i * 0.1), 1.6, 50 + i); }
    return cam([4, -16, 28], [0, -33, 2], 46, { grade: 'night', post: { exposure: 1.3 } }); });
  const rimPop = (s, list, u, d0 = 0) => list.forEach((n, i) => { const a = PI / 2 + (i - (list.length - 1) / 2) * 0.13, p = rim(a, 27.5 + (i % 2) * 1.8); put(s, n, { p: p.toArray(), ry: inward(a) + PI, mood: ['shock', 'laugh', 'grin'][i % 3], keep: true, sc: 1 + 0.15 * (1 - E(cl(u * 2.5 - i * 0.2))) }); pop(s, 'rp' + n, p, cl(u * 1.3 - i * 0.12 - d0)); });
  ST('Poof#4', (s, u) => { s.mood('night'); stick(s, true); put(s, 'hero', { p: [0.2, 0, 26.0], ry: 0.2, mood: 'laugh', pose: P.cheer }); rimPop(s, ['crowd30', 'crowd31', 'crowd32'], u); return cam([3, 4.5, 40], [0, 2.5, 27], 40, { grade: 'night', lead: 'hero', post: { exposure: 1.25 } }); });
  ST('Poof#5', (s, u) => { s.mood('night'); stick(s, true); put(s, 'hero', { p: [0.2, 0, 26.0], ry: 0.2, mood: 'laugh', pose: P.cheer }); rimPop(s, ['crowd30', 'crowd31', 'crowd32'], 1); rimPop(s, ['crowd33', 'crowd34', 'crowd35', 'crowd36'], u); return cam([-3, 3.5, 37], [0, 2.8, 27], 38, { grade: 'night', lead: 'hero', post: { exposure: 1.25 } }); });
  ST('The whole town', (s, u) => { s.mood('night'); stick(s, true); put(s, 'hero', { p: [0.2, 0, 26.0], ry: 0.2, mood: 'laugh', pose: P.cheer }); const L2 = BOT.slice(0, 12); L2.forEach((n, i) => { const a = PI / 2 + (i - 5.5) * 0.1, p = rim(a, 28 + (i % 3) * 1.8); put(s, n, { p: p.toArray(), ry: inward(a) + PI, mood: ['laugh', 'grin', 'laugh'][i % 3], pose: i % 2 ? P.cheer : P.wave }); });
    put(s, 'flagman', { p: [-4, 0, 28], ry: 0.4, mood: 'laugh', pose: PX.salute }); return cam([4, 7, 46], [0, 3, 27], 44, { grade: 'night', lead: 'hero', post: { exposure: 1.25 } }); });
  const turboPole = (s) => { const a = CAST.get('turbo'), g = once('tpole', () => { const m = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 7, 10), new T.MeshStandardMaterial({ color: '#e8e8ec', metalness: 0.8, roughness: 0.25 })); m.rotation.z = PI / 2; m.castShadow = true; const gg = new T.Group(); gg.add(m); const f = new T.Mesh(new T.SphereGeometry(0.28, 12, 10), new T.MeshStandardMaterial({ color: '#e8b830', metalness: 1, roughness: 0.2 })); f.position.x = 3.5; gg.add(f); return gg; }); g.position.set(0.6, -0.4, 0.95); a.head.add(g); ENG.extras.push(g); };
  ST('Turbo came up', (s, u) => { s.mood('night'); stick(s, true); put(s, 'hero', { p: [1.0, 0, 27.5], ry: -0.5, mood: 'laugh', pose: P.point }); put(s, 'turbo', { p: [-2.0, 0, 28.6], ry: 0.6, mood: 'happy', dog: DP.wag(u * 20), sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); pop(s, 'tbl', [-2.0, 0, 28.6], u, '#38f08a', 1.2); turboPole(s);
    return cam([3, 3.2, 37], [-1, 2.0, 28], 36, { grade: 'night', lead: 'hero', post: { exposure: 1.25 } }); });
  ST('with the old', (s, u) => { s.mood('night'); put(s, 'turbo', { p: [-2.0, 0, 28.6], ry: 0.6, mood: 'happy', dog: DP.wag(u * 20) }); turboPole(s); const h = head('turbo');
    return cam([h.x + 3, h.y + 0.8, h.z + 5.5], [h.x + 0.6, h.y - 0.4, h.z], 32, { grade: 'night', talk: false, post: { exposure: 1.3 } }); });
  ST("Best stick he's", (s, u) => { s.mood('night'); put(s, 'turbo', { p: [-2.0, 0, 28.6], ry: 0.3, mood: 'happy', dog: Object.assign({}, DP.wag(u * 24), { head: [-0.15, 0, 0] }) }); turboPole(s); put(s, 'hero', { p: [1.6, 0, 27.6], ry: -0.8, mood: 'laugh' }); const h = head('turbo');
    return cam([h.x + 1.2, h.y + 1.2, h.z + 8.5], [h.x + 1.2, h.y + 0.4, h.z], 34, { grade: 'night', lead: 'hero', post: { exposure: 1.25 } }); });
  // ================= ending: morning =================
  ST('Now everyone carries', (s, u) => { s.mood('morning'); ['pcrowd3', 'pcrowd5', 'pcrowd8', 'pcrowd11'].forEach((n, i) => put(s, n, { p: [-6 + i * 3.6 + u * 0.8, 0, -36 + (i % 2) * 1.5], ry: 0.3 - i * 0.15, walk: i, mood: ['laugh', 'grin', 'calm', 'laugh'][i] }));
    return cam([L(2, 0.5, u), 3.8, -24], [-0.5, 3.6, -37], 36, { grade: 'morning' }); });
  ST('And every morning', (s, u) => { s.mood('morning'); const st = step(s, 70 + u * 3), a = put(s, 'hero', { p: st.p.toArray(), ry: st.a + PI / 2, walk: 0, mood: 'laugh' }); CP.ground(a, st.p.y); const st2 = step(s, 67 + u * 3), d = put(s, 'turbo', { p: st2.p.toArray(), ry: st2.a + PI / 2, mood: 'happy', dog: DP.run(u * 25) }); CP.ground(d, st2.p.y);
    const h = head('hero'), c0 = s.tower.position, out = V(h.x - c0.x, 0, h.z - c0.z).normalize(), tg = V(-out.z, 0, out.x); return cam(h.clone().addScaledVector(out, 14).addScaledVector(tg, 4).add(V(0, 1.5, 0)), h.clone().add(V(0, -0.6, 0)), 38, { grade: 'morning', lead: 'hero' }); });
  const balcony = (s, u, o = {}) => { const fp = flagTop(s), pole = tinyPole(s);
    put(s, 'hero', { p: [fp.x - 5.6, fp.y, fp.z + 0.45], ry: PI / 2 - 0.7, mood: 'laugh', pose: o.heroPose || { armL: [-0.3, 0, 0.3], armR: [-2.6, 0, -0.6] } }); return { fp, pole }; };
  const bcam = (fp, dx, o = {}) => cam([fp.x - 4.3, fp.y + 7.2, fp.z + 10.5], [fp.x - 4.0, fp.y + 1.4, fp.z], 40, Object.assign({ grade: 'morning', lead: 'hero' }, o));
  ST('and touches my', (s, u) => { s.mood('morning'); const { fp, pole } = balcony(s, u); const k = E(cl(u * 1.6)); const t = put(s, 'turbo', { p: [pole.x - L(3.2, 2.45, k), fp.y, pole.z + 0.15], ry: PI / 2, mood: 'happy', dog: Object.assign({}, DP.wag(u * 20), { head: [0.12, 0, 0] }) });
    if (u > 0.55) pop(s, 'boop2', [fp.x, fp.y + 0.48, fp.z], (u - 0.55) * 1.6, '#38f08a', 0.8); return bcam(fp, -1.5, { faces: { turbo: [[0, 'happy']] } }); });
  ST('So when he', (s, u) => { s.mood('morning'); const { fp } = balcony(s, u); const k = E(cl(u * 1.6)); const t = put(s, 'turbo', { p: [fp.x - 3.6, fp.y, fp.z + 0.2], ry: PI / 2, mood: u < 0.4 ? 'shock' : 'dizzy', keep: true, dog: k < 0.5 ? DP.run(u * 30) : DP.trip }); CP.ground(t, fp.y);
    return bcam(fp, -3, { faces: { hero: [[0, 'shock'], [0.5, 'laugh']] } }); });
  ST('he lands next', (s, u) => { s.mood('morning'); const { fp } = balcony(s, u); poof(s, 'tb3', [fp.x - 3.6, fp.y, fp.z + 0.2], u * 1.3, 1.2, 61); const p = V(fp.x - 4.4, fp.y, fp.z + 0.3); put(s, 'turbo', { p: p.toArray(), ry: -PI / 2 + 0.3, mood: 'happy', dog: DP.wag(u * 22), sc: 1 + 0.15 * (1 - E(cl(u * 2.5))) }); pop(s, 'tb3', p, u, '#38f08a', 1.0);
    return bcam(fp, -3.5, { faces: { hero: [[0, 'laugh']] } }); });
  ST('He trips a', (s, u) => { s.mood('morning'); const { fp } = balcony(s, u); const t = put(s, 'turbo', { p: [fp.x - 3.0, fp.y, fp.z + 0.2], ry: PI / 2 + 0.4, mood: u < 0.5 ? 'happy' : 'dizzy', keep: true, dog: u < 0.4 ? DP.run(u * 30) : DP.trip }); CP.ground(t, fp.y);
    return bcam(fp, -2.5, { faces: { hero: [[0, 'laugh'], [0.5, 'grin']] } }); });
  ST("I'm pretty sure", (s, u) => { s.mood('morning'); const { fp } = balcony(s, u, { heroPose: P.crossed }); const p = V(fp.x - 3.8, fp.y, fp.z + 0.3); put(s, 'turbo', { p: p.toArray(), ry: 0.5, mood: u < 0.45 ? 'calm' : 'happy', keep: true, dog: DP.sit }); CP.ground(CAST.get('turbo'), fp.y);
    const h = head('turbo'); return cam([h.x - 0.4, h.y + L(2.4, 3.4, u), h.z + L(7, 10, u)], [h.x - 1.0, h.y + 0.9, h.z - 0.4], 36, { grade: 'morning', lead: 'hero', faces: { hero: [[0, 'smug'], [0.5, 'laugh']] } }); });
  STAGES._PX = PX;
})();
