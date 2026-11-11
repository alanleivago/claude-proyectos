// rbx-library look sheet panels (staged on the sets). Uses LOOK.put / LOOK.add from look.js.
'use strict';
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, P = CAST.POSE, LP = LF.POSE;
  const put = (S, n, o = {}) => { const a = LOOK.put(S.scene, n, o); if (o.mood) { if (a.isCreature) a.setFace(CAST.EXPR[n][o.mood] || o.mood); else CAST.face(n, o.mood, !!o.talk); }
    if (a.sit) a.sit(o.sitK || 1); CP.ground(a, o.ground ?? (o.p ? o.p[1] : 0)); if (a.fixLabels) a.fixLabels(); return a; };
  const add = (S, o) => LOOK.add(S.scene, o);
  const head = (a) => { a.root.updateMatrixWorld(true); return a.head.getWorldPosition(new T.Vector3()); };
  const look = (a, cp, k = 0.8) => LOOK.faceCam(a, cp, k);
  const lookAt = (a, p, k = 1) => { const h = head(a), t = Math.atan2(p.x - h.x, p.z - h.z); let d = t - a.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.neck.rotation.y = THREE.MathUtils.clamp(d * k, -1.2, 1.2); };
  const ryTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);
  const hand = (a, k = 'R') => { a.root.updateMatrixWorld(true); const arm = k === 'L' ? a.armL : a.armR; return arm.localToWorld(V(0, -1.9, 0)); };
  const PX = {
    tiptoe: { armL: [-0.5, 0, 0.75], armR: [-0.5, 0, -0.75], legL: [-0.45, 0, 0.05], legR: [0.25, 0, -0.05], head: [0.15, 0, 0] },
    shh: { armR: [-2.3, 0, 0.55], armL: [-0.2, 0, 0.2], head: [0.05, 0, 0] },
    sitFloor: { legL: [-1.5, 0, 0.12], legR: [-1.5, 0, -0.12], armL: [-0.4, 0, 0.2], armR: [-0.4, 0, -0.2] },
    slide: { legL: [-1.45, 0, 0.1], legR: [-1.4, 0, -0.1], armL: [-2.9, 0, 0.5], armR: [-2.9, 0, -0.5], body: [-0.35, 0, 0], head: [0.2, 0, 0] },
    bedSit: { legL: [-1.57, 0, 0.05], legR: [-1.57, 0, -0.05], armL: [-1.2, 0, 0.6], armR: [-1.0, 0, -0.7], head: [-0.25, 0, 0] },
    glass: { armL: [-1.9, 0, -0.2], armR: [-1.9, 0, 0.2], head: [0.05, 0, 0] },
    palm: { armR: [-1.45, 0.2, 0], armL: [-0.6, 0, 0.5] },
    offerUp: { armR: [-2.2, 0, -0.15], armL: [-1.25, 0, 0.1], head: [-0.35, 0, 0] },
    hipsL: { armL: [-0.3, 0, 0.9], armR: [-0.2, 0, -0.15] },
  };
  LOOK.PX = PX;
  const Lp = LOOK.panels;
  // dark studio for the creature turnaround (rim lit)
  function dark() { if (LOOK.dark) return LOOK.dark; const s = new T.Scene(); s.background = new T.Color('#120e1c'); s.fog = new T.Fog('#120e1c', 40, 90);
    const fl = new T.Mesh(new T.CircleGeometry(30, 48), new T.MeshStandardMaterial({ color: '#2a2234', roughness: 0.6 })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; s.add(fl);
    s.add(new T.HemisphereLight('#7a7ad8', '#1a1020', 1.0)); const k = new T.DirectionalLight('#d8d0ff', 3.2); k.position.set(8, 22, 18); k.castShadow = true; k.shadow.mapSize.set(2048, 2048); Object.assign(k.shadow.camera, { left: -20, right: 20, top: 25, bottom: -5 }); s.add(k);
    const rim = new T.DirectionalLight('#6affd0', 4); rim.position.set(-10, 14, -16); s.add(rim); const rim2 = new T.DirectionalLight('#ff8ab0', 2); rim2.position.set(12, 8, -14); s.add(rim2);
    return (LOOK.dark = { scene: s }); }

  // ===== a: main cast in front of the library (morning) =====
  Lp.a_cast = async () => { const S = await LOOK.set('street'); S.mood('morning'); const y = 0.3;
    put(S, 'mom', { p: [-3.9, y, -9.8], ry: 0.25, mood: 'calm', pose: PX.hipsL });
    put(S, 'dale', { p: [4.0, y, -9.8], ry: -0.3, mood: 'laugh', pose: P.open });
    put(S, 'nico', { p: [-2.1, y, -7.0], ry: 0.25, mood: 'laugh', pose: { armL: [-1.3, 0, 0.1], armR: [-2.7, 0, -0.5] } });
    put(S, 'heroBook', { p: [0.4, y, -6.6], ry: 0, mood: 'grin', pose: { armL: [-1.25, 0, 0.1], armR: [-2.75, 0, -0.9] } });
    put(S, 'nicoPJ', { p: [2.6, y, -6.9], ry: -0.3, mood: 'grin', pose: P.cheer });
    const cp = [0.2, 4.0, 12.5]; ['mom', 'dale', 'nico', 'heroBook', 'nicoPJ'].forEach((n) => look(CAST.get(n), cp, 0.6));
    return { scene: S.scene, p: cp, l: [0.2, 5.4, -8], fov: 50, grade: 'morning', f: [0, 3, -7], post: { aperture: 0.4 } }; };

  // ===== b: the Late Fee in the night library: mantis pose, stamps over the hero =====
  Lp.b_lfcreep = async () => { const S = await LOOK.set('lib'); S.mood('night');
    const lf = put(S, 'latefee', { p: [-0.6, 0, -23], ry: 0.15, pose: LP.high, mood: 'blank' });
    const h = put(S, 'hero', { p: [1.7, 0, -17.2], ry: PI - 0.45, mood: 'terror', pose: { armL: [-0.6, 0, 0.4], armR: [-0.7, 0, -0.4], head: [-0.4, 0, 0] } });
    const cp = [4.2, 1.8, -2.0]; look(h, cp, 0.55);
    const L1 = new T.PointLight('#8affd8', 60, 22, 1.6); L1.position.set(-3, 3, -20); L1.intensity = 12; add(S, L1); const L2 = new T.PointLight('#ff6a8a', 30, 18, 1.8); L2.position.set(-6, 14, -24); add(S, L2); const L3 = new T.SpotLight('#c8fff0', 160, 30, 0.3, 0.6, 1.4); L3.position.set(2, 2, -12); L3.target.position.set(0, 11, -23); add(S, L3); add(S, L3.target);
    return { scene: S.scene, p: cp, l: [-0.4, 8.6, -23], fov: 60, grade: 'libnight', f: [0, 8, -23], post: { aperture: 0.3 } }; };

  // ===== c: turnaround (creepy front / side / 3-4, friendly front) - tiled by sheet.py =====
  [['c1', 'latefee', 0, null, 'blank'], ['c2', 'latefee', PI / 2, LP.high, 'tilt'], ['c3', 'latefee', 0.7, LP.creep, 'blank'], ['c4', 'latefeeKind', 0.3, LP.read, 'kind']].forEach(([k, n, ry, pose, mood]) => {
    Lp[k] = () => { const S = dark(); const a = put(S, n, { p: [0, 0, 0], ry, pose, mood }); const hero = put(S, 'hero', { p: [n === 'latefeeKind' ? 4.2 : 4.6, 0, 2.5], ry: n === 'latefeeKind' ? -0.5 : -0.3, mood: n === 'latefeeKind' ? 'laugh' : 'ohno' }); look(hero, [0, 6, 30], 0.4);
      return { scene: S.scene, p: [1.5, 7.5, 32], l: [1.5, 7.2, 0], fov: 42, grade: 'night', post: { aperture: 0, exposure: 1.3 } }; }; });

  // ===== d: expressions (x_<who>_<mood>) =====
  LOOK.EXPR_GRID = { hero: ['calm', 'ohno', 'scream', 'smug', 'laugh'], nico: ['grin', 'laugh-talk', 'scream', 'sad', 'shock'], latefee: ['blank', 'tilt', 'frozen', 'hum', 'voices'] };
  Object.entries(LOOK.EXPR_GRID).forEach(([n, moods]) => moods.forEach((m) => { Lp['x_' + n + '_' + m] = async () => {
    const [mood, talk] = m.split('-'), kindFace = n === 'latefee' && (mood === 'hum' || mood === 'voices');
    const S = await LOOK.set(n === 'latefee' ? 'lib' : 'street'); if (n === 'latefee') S.mood(kindFace ? 'day' : 'night'); else S.mood('morning');
    const who = n === 'latefee' && kindFace ? 'latefeeKind' : n, z = n === 'latefee' ? -10 : 12;
    const a = put(S, who, { p: [0, n === 'latefee' ? 0 : 0.3, z], ry: 0.25, pose: n === 'latefee' ? (mood === 'tilt' ? { head: [0.25, 0, 0.6] } : mood === 'frozen' ? { head: [-0.05, 0, 0.05] } : undefined) : undefined });
    if (a.isCreature) a.setFace(mood); else CAST.face(who, mood, !!talk);
    const h = head(a), d = a.isCreature ? 6.5 : 4.0;
    return { scene: S.scene, p: [h.x + d * 0.25, h.y + 0.25, h.z + d], l: [h.x, h.y - (a.isCreature ? 0.3 : 0.25), h.z], fov: 40, grade: n === 'latefee' ? (kindFace ? 'story' : 'libnight') : 'morning', f: h.toArray(), post: { aperture: 1.0, maxCoc: 16 } }; }; }));

  // ===== e: stamp -> book (e1 stamp comes down on Nico in bed, e2 POOF of pages + ink, e3 the book on the pillow) =====
  // the bony forearm + giant LATE stamp coming down from above (only the arm enters the frame)
  const armStamp = (S, at, tilt = 0.35) => { const g = new T.Group(), bone = new T.MeshPhysicalMaterial({ color: '#9a90a6', roughness: 0.55 });
    const fa = new T.Mesh(new T.CylinderGeometry(0.13, 0.17, 6, 10), bone); fa.position.y = 3; g.add(fa); const st = LF.stamp({}); st.scale.setScalar(1.18); g.add(st);
    const ink = new T.PointLight('#ff3a3a', 30, 8, 1.8); ink.position.y = -3.4; g.add(ink); g.position.copy(at); g.rotation.z = tilt; ENV.shadow(g); return add(S, g); };
  Lp.e1 = async () => { const S = await LOOK.set('room'); const n = put(S, 'nicoPJ', { p: [0, 2.1, -4.8], ry: 0.15, mood: 'scream', pose: PX.bedSit }); n.root.position.y = 2.1;
    armStamp(S, V(0.6, 9.4, -4.6), 0.3); const sh = new T.SpotLight('#ff4a5a', 60, 14, 0.5, 0.7, 1.5); sh.position.set(0.5, 8, -3); sh.target.position.set(0, 3, -4.8); add(S, sh); add(S, sh.target);
    const fl = new T.PointLight('#8aa8ff', 20, 12, 1.8); fl.position.set(-2, 5, 2); add(S, fl);
    return { scene: S.scene, p: [-1.6, 4.8, 7.5], l: [0.2, 5.6, -4.6], fov: 52, grade: 'creep', f: [0, 4, -4.8], post: { aperture: 0.3 } }; };
  Lp.e2 = async () => { const S = await LOOK.set('room');
    const c = V(0, 3.4, -4.6), pf = add(S, CP.poof({ r: 1.6, phase: 0.3, seed: 5 })); pf.position.set(c.x, 2.4, c.z);
    const r = RBX.rng(3), pm = new T.MeshStandardMaterial({ color: '#f6eed6', side: T.DoubleSide, roughness: 0.9 }); for (let i = 0; i < 46; i++) { const p = new T.Mesh(new T.PlaneGeometry(0.5, 0.65), pm); const a = r() * PI * 2, d = 1 + r() * 3.2; p.position.set(c.x + Math.cos(a) * d, c.y + (r() - 0.3) * 3.4, c.z + Math.sin(a) * d * 0.7); p.rotation.set(r() * 3, r() * 3, r() * 3); p.castShadow = true; add(S, p); }
    const ink = LF.mark('LATE', '#e01818', 3.6, 2.0, -0.2); ink.position.set(c.x, c.y + 1.0, c.z + 1.8); ink.material.emissive = new T.Color('#e01818'); ink.material.emissiveIntensity = 0.9; add(S, ink);
    const b = add(S, BOOK.face(Object.assign({ w: 1.5, h: 2.0, d: 0.32 }, BOOK.NICO))); b.position.set(c.x, 2.7, c.z - 0.2); b.rotation.set(-0.3, 0.3, 0.4);
    armStamp(S, V(1.2, 9.9, -4.2), 0.5);
    const L1 = new T.PointLight('#ffe0c0', 40, 12, 1.6); L1.position.set(0, 5, -1.5); add(S, L1);
    return { scene: S.scene, p: [-1.6, 4.8, 7.5], l: [0.2, 4.6, -4.4], fov: 52, grade: 'creep', f: [0, 3.4, -4.6], post: { aperture: 0.2 } }; };
  Lp.e3 = async () => { const S = await LOOK.set('room'); const b = add(S, BOOK.face(Object.assign({ w: 1.7, h: 2.2, d: 0.34 }, BOOK.NICO))); b.position.set(0, 2.85, -6.4); b.rotation.set(-1.1, 0, 0.12);
    const L1 = new T.SpotLight('#a8c0ff', 40, 12, 0.35, 0.6, 1.5); L1.position.set(-2, 8, -3); L1.target.position.set(0, 2.8, -6.2); add(S, L1); add(S, L1.target);
    return { scene: S.scene, p: [1.2, 6.2, -1.6], l: [0, 2.9, -6.4], fov: 45, grade: 'creep', f: [0, 2.9, -6.4], post: { aperture: 0.6 } }; };

  // ===== f: 11:59 at the drop box: pyjama parents queue, library clock =====
  Lp.f_street = async () => { const S = await LOOK.set('street'); S.mood('night'); const y = 0.3, slot = S.db.localToWorld(V(0, 2.4, 1.1));
    const pm = put(S, 'pjmom', { p: [-10.9, y, -7.4], ry: ryTo([-10.9, 0, -7.4], [-13, 0, -7.6]), mood: 'worry' }); pm.root.updateMatrixWorld(true); GN.aim(pm, 'R', slot.clone().add(V(0, 0.2, 0.6)));
    put(S, 'pjdad', { p: [-9.6, y, -6.6], ry: -0.9, mood: 'terror', pose: { armR: [-1.6, 0.3, 0.2], armL: [-1.1, 0, 0.2], head: [0.3, 0, 0] } });
    put(S, 'pjafro', { p: [-6.6, y, -7.6], ry: -1.1, mood: 'strain', pose: { armR: [-1.2, 0, 0], armL: [-0.2, 0, 0.1] } });
    put(S, 'crowd7', { p: [-4.0, y, -6.8], ry: -1.3, mood: 'worry' }); put(S, 'crowd2', { p: [-1.6, y, -7.8], ry: -1.4, mood: 'terror' }); put(S, 'crowd9', { p: [0.8, y, -7.0], ry: -1.5, mood: 'shock' });
    const cp = [-9.0, 3.8, 13]; ['pjdad', 'pjafro', 'crowd7', 'crowd2', 'crowd9'].forEach((n) => look(CAST.get(n), cp, 0.5)); look(pm, cp, 0.3);
    return { scene: S.scene, p: cp, l: [-10.2, 8.6, -12], fov: 62, grade: 'night', f: [-9, 3, -7], post: { aperture: 0.3 } }; };

  // ===== g: Nico's stairs: a LATE on every step, she climbs, head turned back over her shoulder =====
  Lp.g_stairs = async () => { const S = await LOOK.set('stairs'); const k = 7, sy = S.stepY(k), sz = S.stepZ(k);
    const lf = put(S, 'latefee', { p: [0, sy, sz], ry: PI, pose: { armR: [-2.5, 0.2, -0.4], elbowR: [2.2, 0, 0], armL: [0.2, 0, 0.15], elbowL: [-0.2, 0, 0], head: [0.25, 2.3, 0.4] }, mood: 'blank' }); lf.root.scale.setScalar(0.92); CP.ground(lf, sy + 0.13);
    S.scene.children.forEach((c) => { if (c.material && c.material.map && c.geometry && c.geometry.type === 'PlaneGeometry' && c.position.y > S.stepY(k) - 0.2 && c.rotation.x === -PI / 2 && c.material.transparent) c.visible = false; });
    const L1 = new T.PointLight('#ff6a8a', 18, 14, 1.8); L1.position.set(-2.4, sy + 5, sz + 5); add(S, L1); const L2 = new T.SpotLight('#9ab8ff', 120, 30, 0.35, 0.6, 1.4); L2.position.set(2.5, 4, 16); L2.target.position.set(0, sy + 9, sz); add(S, L2); add(S, L2.target);
    return { scene: S.scene, p: [1.2, 5.4, 18.5], l: [-0.2, 11.5, -2], fov: 58, grade: 'creep', f: [0, sy + 8, sz], post: { aperture: 0.25 } }; };

  // ===== h: morning, the library window: Nico on the cover, screaming =====
  Lp.h_window = async () => { const S = await LOOK.set('street'); S.mood('morning'); const y = 0.3;
    const m = put(S, 'mom', { p: [12.0, y, -8.6], ry: 0.75, mood: 'terror', pose: P.handsHead });
    const h = put(S, 'hero', { p: [17.9, y, -8.2], ry: -0.55, mood: 'ohno', pose: { armR: [-1.5, 0, 0.6], armL: [-0.2, 0, 0.15] } });
    const cp = [15.0, 4.0, 11.5]; look(h, cp, 0.6); lookAt(m, V(15, 3.5, 11.5), 0.6);
    return { scene: S.scene, p: cp, l: [15.0, 3.4, -11], fov: 44, grade: 'morning', f: [15, 2.8, -12], post: { aperture: 0.5 } }; };

  // ===== i: the grey hand out of the drop box stamps mom's palm =====
  Lp.i_hand = async () => { const S = await LOOK.set('street'); S.mood('morning'); const y = 0.3, slot = S.db.localToWorld(V(0, 2.5, 1.0));
    const gh = add(S, LF.hand({ len: 1.3 })); gh.position.copy(slot); gh.rotation.set(0.9, 0, 0); gh.updateMatrixWorld(true); const pad = gh.localToWorld(V(0, 1.65, 0.8));
    const m = put(S, 'mom', { p: [0, y, 0], ry: PI / 2, mood: 'terror', pose: { armL: [-0.35, 0, 1.25], armR: [-0.4, 0, -0.5] } }); m.root.updateMatrixWorld(true); const hp = m.armL.localToWorld(V(0, -1.9, 0));
    m.root.position.x += pad.x - hp.x; m.root.position.z += pad.z - hp.z + 0.1; m.root.updateMatrixWorld(true);
    const mk = LF.mark('LATE', '#e01818', 0.62, 0.38, 0.15); mk.position.set(0, -1.79, 0.49); m.armL.inner.add(mk); LOOK.extras.push(mk);
    const mp = m.root.position, cp = [mp.x + 12, 4.6, mp.z + 1.0]; lookAt(m, V(...cp), 0.9);
    return { scene: S.scene, p: cp, l: [mp.x - 0.4, 3.4, mp.z - 2.4], fov: 44, grade: 'morning', f: pad.toArray(), post: { aperture: 0.5 } }; };

  // ===== j: down the drop-box chute =====
  Lp.j_chute = async () => { const S = await LOOK.set('chute'); const g = S.g; g.updateMatrixWorld(true);
    const h = put(S, 'hero', { p: [0, 0, 0], ry: PI, mood: 'strain', pose: PX.slide }); g.add(h.root); h.root.position.set(0.2, -S.R + 0.25, -7); h.root.rotation.set(0, PI, 0); h.root.scale.setScalar(0.95);
    const cp = g.localToWorld(V(-0.6, -0.6, -16.5)), lk = g.localToWorld(V(0.1, -1.0, -6)); const fl = new T.PointLight('#9affd0', 40, 14, 1.6); fl.position.copy(g.localToWorld(V(0, 0.5, -12))); add(S, fl);
    return { scene: S.scene, p: cp.toArray(), l: lk.toArray(), fov: 62, grade: 'libnight', f: lk.toArray(), post: { aperture: 0.4 } }; };

  // ===== k: the night shelves go up forever; the hero tiptoes, she's up there =====
  Lp.k_shelves = async () => { const S = await LOOK.set('lib'); S.mood('night');
    const h = put(S, 'hero', { p: [0.4, 0, 8.5], ry: 0.35, mood: 'worry', pose: PX.tiptoe }); CP.ground(h, 0.15); const hl = new T.PointLight('#c8fff0', 30, 10, 1.8); hl.position.set(-1, 4, 12); add(S, hl);
    const lf = put(S, 'latefee', { p: [10.4, 13.5, -3], ry: -PI / 2 + 0.45, pose: { head: [0.6, 0, 0.35], armL: [-0.5, 0, 0.1], armR: [-0.9, 0, -0.2], elbowR: [-0.6, 0, 0] }, mood: 'blank', ground: 13.5 }); CP.ground(lf, 13.5); lf.fixLabels();
    const cp = [-2.5, 2.0, 21]; look(h, cp, 0.7);
    const L1 = new T.SpotLight('#c8fff0', 400, 40, 0.25, 0.5, 1.3); L1.position.set(3, 12, 6); L1.target.position.set(9.5, 22, -3); const rim = new T.SpotLight('#9ab0ff', 300, 30, 0.35, 0.5, 1.3); rim.position.set(6, 30, -14); rim.target.position.set(10, 22, -3); add(S, rim); add(S, rim.target); add(S, L1); add(S, L1.target); const L2 = new T.PointLight('#ff6a8a', 30, 14, 1.8); L2.position.set(7, 24, 0); add(S, L2);
    return { scene: S.scene, p: cp, l: [3.0, 14, -6], fov: 62, grade: 'libnight', f: [1, 3, 6], post: { aperture: 0.2 } }; };

  // ===== l: the front desk: Nico on the counter, the card with 212 stamps =====
  Lp.l_desk = async () => { const S = await LOOK.set('lib'); S.mood('night');
    const lf = put(S, 'latefee', { p: [0, 0, -33.2], ry: 0.1, pose: LP.high, mood: 'frozen' });
    const h = put(S, 'hero', { p: [2.7, 0, -25.6], ry: -0.75, mood: 'smug', pose: PX.offerUp });
    const card = LF.card(212, { w: 1.7 }); card.position.set(0, -2.1, 0.2); card.rotation.set(-PI / 2, 0, 0.6); h.armR.inner.add(card); LOOK.extras.push(card);
    const nb = add(S, BOOK.face(Object.assign({ w: 1.6, h: 2.1, d: 0.34 }, BOOK.NICO))); nb.position.set(-0.6, 3.75, -28.9); nb.rotation.y = 0.45;
    const cp = [7.5, 4.2, -11.0]; look(h, cp, 0.7);
    const L1 = new T.PointLight('#8affd8', 40, 16, 1.6); L1.position.set(5, 5, -24); add(S, L1); const L3 = new T.SpotLight('#d8ffc8', 160, 24, 0.3, 0.6, 1.4); L3.position.set(3, 4.2, -27); L3.target.position.set(0, 12, -32); add(S, L3); add(S, L3.target);
    return { scene: S.scene, p: cp, l: [-0.8, 8.0, -30], fov: 60, grade: 'libnight', f: [0, 6, -28], post: { aperture: 0.25 } }; };

  // ===== m: Friday story time: she does all the voices; GOOD READER sticker; Nico stamped DUE on the forehead =====
  Lp.m_story = async () => { const S = await LOOK.set('lib'); S.mood('day'); const c = S.corner.position;
    const lf = put(S, 'latefeeKind', { p: [c.x, 0, c.z - 4.6], ry: 0, pose: LP.voices, mood: 'voices', sitK: 0.62 }); lf.root.updateMatrixWorld(true);
    const pb = BOOK.plain({ cover: '#f2c01a', title: 'THE HUNGRY BEAR', w: 2.4, h: 3.0, d: 0.25 }); pb.position.set(0, -2.6, 1.0); pb.rotation.set(0.0, PI, 0); lf.elbowR.add(pb); LOOK.extras.push(pb);
    const cp0 = [c.x + 0.4, 4.6, c.z + 25];
    [['kid1', -3.4, 0.6, 0.75, 'laugh'], ['kid2', -1.4, 2.6, 0.25, 'shock'], ['kid3', 1.4, 2.6, -0.25, 'laugh'], ['kid4', 3.4, 0.6, -0.75, 'grin']].forEach(([n, x, z, ry, m]) => { const k = put(S, n, { p: [c.x + x, 0, c.z + z], ry, mood: m, pose: PX.sitFloor }); look(k, cp0, 0.7); });
    const n = put(S, 'nicoPJ', { p: [c.x - 4.6, 0, c.z + 3.6], ry: 2.5, mood: 'laugh', pose: PX.sitFloor }); const due = LF.mark('DUE', '#7a3ad0', 0.62, 0.36, -0.1); due.position.set(0, 0.36, 0.62); n.head.add(due); LOOK.extras.push(due);
    const h = put(S, 'heroSticker', { p: [c.x + 5.4, 0, c.z + 3.4], ry: -0.7, mood: 'grin', pose: { armL: [-1.2, 0, 0.1], armR: [-0.2, 0, -0.15] } });
    const cp = [c.x + 0.4, 4.6, c.z + 25]; look(h, cp, 0.6); look(n, cp, 0.5);
    return { scene: S.scene, p: cp, l: [c.x + 0.4, 5.2, c.z - 1], fov: 54, grade: 'story', f: [0, 4, c.z], post: { aperture: 0.3 } }; };

  // ===== n: renewing every kid: Mr. Dale steps out of the cookbook, smelling of soup =====
  Lp.n_dale = async () => { const S = await LOOK.set('lib'); S.mood('night');
    const lf = put(S, 'latefee', { p: [0, 0, -33.2], ry: 0.15, pose: LP.stampDesk, mood: 'hum' }); lf.notes.visible = true;
    const ob = add(S, BOOK.open({ cover: '#c8962a', w: 2.6, h: 3.4, left: BOOK.DALE.extraDraw, right: (q, W, H) => { q.fillStyle = '#c8962a'; q.font = '900 30px Georgia'; q.textAlign = 'center'; q.fillText('SOUPS', W / 2, 40); } })); ob.position.set(-1.8, 3.76, -28.8); ob.rotation.y = 0.2;
    const pf = add(S, CP.poof({ r: 1.0, phase: 0.55, seed: 9 })); pf.position.set(-1.8, 3.8, -28.8);
    const d = put(S, 'dale', { p: [-1.8, 3.95, -28.6], ry: 0.5, mood: 'laugh', pose: P.cheer, ground: 4.1 });
    // stack of face-books waiting + renewed kids
    for (let i = 0; i < 7; i++) { const b = add(S, BOOK.face({ w: 1.4, h: 1.85, d: 0.3, cover: ['#8a1e2a', '#1e3a6a', '#2a5a2e', '#6a2a6a', '#8a5a1e', '#1e5a5a', '#5a2a1e'][i], title: ['ROSA', 'BEN', 'AMIR', 'JO', 'LULU', 'MAX', 'ZOE'][i], who: BOOK.KID(i + 2), sub: 'LATE' })); b.rotation.set(-PI / 2, 0, (i - 3) * 0.1); b.position.set(3.2, 3.76 + i * 0.31, -28.6 - 0.92); }
    put(S, 'kid2', { p: [5.6, 0, -24.4], ry: -0.4, mood: 'laugh', pose: P.cheer }); put(S, 'kid4', { p: [3.6, 0, -23.2], ry: -0.2, mood: 'shock' });
    const cp = [3.2, 5.6, -17.5]; look(d, cp, 0.6); ['kid2', 'kid4'].forEach((k) => look(CAST.get(k), cp, 0.6));
    const L1 = new T.PointLight('#ffd8a0', 40, 14, 1.6); L1.position.set(-1, 7, -24); add(S, L1);
    return { scene: S.scene, p: cp, l: [-0.6, 7.6, -30], fov: 56, grade: 'libnight', f: [-1.8, 5, -28.6], post: { aperture: 0.3 } }; };

  // ---- set overviews (debug) ----
  Lp.dbg_street = async () => { const S = await LOOK.set('street'); S.mood('night'); return { scene: S.scene, p: [0, 10, 40], l: [0, 8, -14], fov: 60, grade: 'night', post: { aperture: 0 } }; };
  Lp.dbg_lib = async () => { const S = await LOOK.set('lib'); S.mood('night'); return { scene: S.scene, p: [0, 6, 20], l: [0, 20, -30], fov: 70, grade: 'libnight', post: { aperture: 0 } }; };
  Lp.dbg_libday = async () => { const S = await LOOK.set('lib'); S.mood('day'); return { scene: S.scene, p: [0, 6, 22], l: [0, 6, -10], fov: 60, grade: 'story', post: { aperture: 0 } }; };
  Lp.dbg_stairs = async () => { const S = await LOOK.set('stairs'); return { scene: S.scene, p: [1.6, 2.6, 13.5], l: [0, 8, -4], fov: 62, grade: 'creep', post: { aperture: 0 } }; };
  Lp.dbg_room = async () => { const S = await LOOK.set('room'); return { scene: S.scene, p: [-2.6, 5.4, 6.5], l: [0.8, 4, -3.6], fov: 60, grade: 'creep', post: { aperture: 0 } }; };
  Lp.dbg_chute = async () => { const S = await LOOK.set('chute'); const g = S.g; g.updateMatrixWorld(true); return { scene: S.scene, p: g.localToWorld(V(0, 0, -16)).toArray(), l: g.localToWorld(V(0, -1, -6)).toArray(), fov: 62, grade: 'libnight', post: { aperture: 0 } }; };
})();
// ===== thumbnail background: the giant Late Fee, stamps raised over the terrified dino-hood hero, face-books around =====
(function () { const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI;
  LOOK.panels.t_thumb = async () => { const S = await LOOK.set('lib'); S.mood('night');
    const lf = LOOK.put(S.scene, 'latefee', { p: [0, 0, -12], ry: 0.05, pose: LF.POSE.high }); lf.setFace('blank'); CP.ground(lf, 0); lf.fixLabels();
    const h = LOOK.put(S.scene, 'hero', { p: [2.6, 0, -6.0], ry: -0.35, pose: { armL: [-2.75, 0, -0.12], armR: [-2.75, 0, 0.12] } }); CAST.face('hero', 'scream'); CP.ground(h, 0);
    [[-3.2, 0.2, -3, 0.5, 1], [3.6, 0.2, -2.6, -0.5, 4], [-4.4, 2.4, -6, 0.6, 7]].forEach(([x, y, z, r, k]) => { const b = BOOK.face({ w: 1.6, h: 2.1, d: 0.32, cover: ['#8a1e2a', '#1e3a6a', '#2a5a2e'][k % 3], title: ['ROSA', 'BEN', 'AMIR'][k % 3], who: BOOK.KID(k), sub: 'LATE' }); b.position.set(x, y, z); b.rotation.set(-0.1, r, 0.15 * r); LOOK.add(S.scene, b); });
    const sp = new T.SpotLight('#d8ffe8', 220, 40, 0.3, 0.6, 1.3); sp.position.set(-3, 1.5, 0); sp.target.position.set(0, 10, -12); LOOK.add(S.scene, sp); LOOK.add(S.scene, sp.target);
    const sp2 = new T.SpotLight('#fff0d8', 22, 20, 0.4, 0.6, 1.4); sp2.position.set(-1, 6, 4); sp2.target.position.set(2.6, 5, -6.0); LOOK.add(S.scene, sp2); LOOK.add(S.scene, sp2.target);
    const rd = new T.PointLight('#ff3a5a', 60, 20, 1.6); rd.position.set(-5, 14, -8); LOOK.add(S.scene, rd);
    return { scene: S.scene, p: [0.6, 1.2, 6.0], l: [0.8, 8.4, -10], fov: 60, grade: 'libnight', f: [0.6, 5, -4.5], post: { aperture: 0.15 } }; }; })();
