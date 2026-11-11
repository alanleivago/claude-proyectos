// rbx-library staging: one function per SHOTLIST row (keyed by its first words; repeats get '#2'). fn(set, u, shot)
// places the cast + props and returns the camera { p, l, fov (pre-WIDEN x1.5), roll, f, grade, post, lead, faces:{name:[[u, mood]]}, mood }.
// People act through ENG gb mode; the Late Fee through ENG.actLF (stiff/creepy until she turns kind). Faces keep changing (c.faces + CAST.react).
'use strict';
const STAGES = {};
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), E = (u) => ENG.ease(u), L = (a, b, u) => (Array.isArray(a) ? ENG.lerp(a, b, u) : a + (b - a) * u);
  const cl = (x) => Math.min(1, Math.max(0, x));
  const ST = (k, f) => { STAGES[k] = f; };
  const C = {}; const once = (k, f) => C[k] || (C[k] = f());
  const add = (s, o) => ENG.add(s.scene, o);
  const P = CAST.POSE, LP = LF.POSE, Y = 0.3;   // street sidewalk height
  const PX = {
    hug: { armL: [-1.2, 0, -0.35], armR: [-1.2, 0, 0.35] }, hipsL: { armL: [-0.3, 0, 0.9], armR: [-0.2, 0, -0.15] },
    tiptoe: { armL: [-0.5, 0, 0.75], armR: [-0.5, 0, -0.75], legL: [-0.45, 0, 0.05], legR: [0.25, 0, -0.05], head: [0.15, 0, 0] },
    tiptoeB: { armL: [-1.25, 0, -0.3], armR: [-1.25, 0, 0.3], legL: [0.25, 0, 0.05], legR: [-0.45, 0, -0.05], head: [0.15, 0, 0] },
    shh: { armR: [-2.3, 0, 0.55], armL: [-0.2, 0, 0.2], head: [0.05, 0, 0] }, zip: { armR: [-2.2, 0.3, 0.75], armL: [-0.3, 0, 0.2] },
    sitFloor: { legL: [-1.5, 0, 0.12], legR: [-1.5, 0, -0.12], armL: [-0.4, 0, 0.2], armR: [-0.4, 0, -0.2] },
    sitRead: { legL: [-1.57, 0, 0.05], legR: [-1.57, 0, -0.05], armL: [-1.2, 0, -0.25], armR: [-1.2, 0, 0.25], head: [0.35, 0, 0] },
    slide: { legL: [-1.45, 0, 0.1], legR: [-1.4, 0, -0.1], armL: [-2.9, 0, 0.5], armR: [-2.9, 0, -0.5], body: [-0.35, 0, 0], head: [0.2, 0, 0] },
    bedSit: { legL: [-1.57, 0, 0.05], legR: [-1.57, 0, -0.05], armL: [-1.2, 0, 0.6], armR: [-1.0, 0, -0.7], head: [-0.25, 0, 0] },
    blanket: { legL: [-1.57, 0, 0.05], legR: [-1.57, 0, -0.05], armL: [-1.4, 0, -0.35], armR: [-1.4, 0, 0.35], head: [0.05, 0, 0] },
    offerUp: { armR: [-2.2, 0, -0.15], armL: [-1.25, 0, 0.1], head: [-0.35, 0, 0] }, offer: { armR: [-1.4, 0, 0.1], armL: [-0.2, 0, 0.15] },
    run: { armL: [0.9, 0, 0.1], armR: [-1.2, 0, -0.1], legL: [-0.9, 0, 0], legR: [0.7, 0, 0], body: [0.25, 0, 0] },
    still: { armL: [0, 0, 0.04], armR: [0, 0, -0.04], head: [0, 0, 0] }, nose: { armR: [-2.4, 0.4, 0.75], armL: [-0.3, 0, 0.3], head: [-0.15, 0, 0] },
    lookUp: { head: [-0.55, 0, 0], armL: [-0.3, 0, 0.3], armR: [-0.3, 0, -0.3] }, climb: { armL: [-2.9, 0, 0.2], armR: [-2.2, 0, -0.35], legL: [-1.0, 0, 0.1], legR: [-0.2, 0, -0.1] },
    duck: { body: [0.55, 0, 0], legL: [-1.2, 0, 0.1], legR: [-1.2, 0, -0.1], armL: [-2.6, 0, -0.2], armR: [-2.6, 0, 0.2], head: [-0.3, 0, 0] },
    yawn: { armL: [-2.8, 0, 0.4], armR: [-2.8, 0, -0.4], head: [-0.3, 0, 0] }, carry: { armL: [-1.35, 0, -0.3], armR: [-1.35, 0, 0.3], head: [-0.15, 0, 0] },
    jump: { armL: [-2.8, 0, 0.5], armR: [-2.8, 0, -0.5], legL: [-1.1, 0, 0.1], legR: [0.5, 0, -0.1] }, push: { armL: [-1.5, 0, -0.1], armR: [-1.5, 0, 0.1], body: [0.2, 0, 0] },
    lie: { armL: [0.1, 0, 0.2], armR: [0.1, 0, -0.2], head: [0.1, 0, 0] }, ladder: { armL: [-2.6, 0, 0.1], armR: [-1.4, 0, -0.6], legL: [-0.9, 0, 0.1], legR: [0, 0, -0.1] },
  };
  // put an actor: o { p, ry, pose, mood, walk, keep, ground, sc, sit (LF), rx }
  const put = (s, n, o = {}) => { const pose = o.walk !== undefined ? Object.assign(P.walk(o.walk), o.pose || {}) : o.pose;
    const a = CAST.put(s.scene, n, Object.assign({}, o, { pose })); a.root.scale.setScalar((a.o.scale || 1) * (o.scale || 1)); a.root.rotation.order = 'YXZ';
    if (a.isCreature) { a.keepFace = true; if (o.mood) a.setFace(o.mood); if (a.sit) a.sit(o.sitK || 1); } else if (o.mood) { CAST.face(n, o.mood); if (o.keep) a.keepFace = true; }
    if (o.rx) a.root.rotation.x = o.rx; if (o.ground !== undefined) CP.ground(a, o.ground); if (o.sc) CP.squash(a, o.sc); return a; };
  const head = (n) => { const a = CAST.get(n); a.root.updateMatrixWorld(true); return a.head.getWorldPosition(V(0, 0, 0)); };
  const look = (n, p, k = 0.9) => { const a = CAST.get(n), h = head(n), pp = p.toArray ? p.toArray() : p, t = Math.atan2(pp[0] - h.x, pp[2] - h.z); let d = t - a.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.neck.rotation.y = THREE.MathUtils.clamp(d * k, -1.2, 1.2); };
  const cam = (p, l, fov, o = {}) => Object.assign({ p: p.toArray ? p.toArray() : p, l: l.toArray ? l.toArray() : l, fov }, o);
  const orb = (T0, d, yaw, pitch, fov, o = {}) => Object.assign(ENG.orbit(T0.toArray ? T0.toArray() : T0, d, yaw, pitch, fov), { f: T0.toArray ? T0.toArray() : T0 }, o);
  const fc = (n, d, yaw, pitch, fov, o = {}) => Object.assign(ENG.face(n, d, yaw, pitch, fov), o);
  const prop = (s, k, f, pos, rot, sc) => { const g = once(k, f); g.position.copy(pos.isVector3 ? pos : V(...pos)); g.rotation.set(...(rot || [0, 0, 0])); if (sc) g.scale.setScalar(sc); return add(s, g); };
  const attach = (s, parent, k, f, pos, rot) => { const g = once(k, f); g.position.set(...pos); g.rotation.set(...(rot || [0, 0, 0])); parent.add(g); ENG.extras.push(g); return g; };
  // ---- props ----
  const book = (k, o) => once('bk' + k, () => BOOK.plain(Object.assign({ w: 1.0, h: 1.3, d: 0.22 }, o)));
  const fbook = (k, o) => once('fb' + k, () => BOOK.face(Object.assign({ w: 1.5, h: 2.0, d: 0.32 }, o)));
  const poof = (s, k, pos, ph, r = 1.5, seed = 4) => { const g = once('poof' + k, () => CP.poof({ r, phase: 0.3, seed })); g.position.copy(pos.isVector3 ? pos : V(...pos)); CP.poofSet(g, cl(ph)); return add(s, g); };
  const pages = (s, k, c, ph) => { const g = once('pages' + k, () => { const g2 = new T.Group(), r = RBX.rng(3), pm = new T.MeshStandardMaterial({ color: '#f6eed6', side: T.DoubleSide, roughness: 0.9 }); for (let i = 0; i < 40; i++) { const p = new T.Mesh(new T.PlaneGeometry(0.5, 0.65), pm); const a = r() * PI * 2, d = 0.6 + r() * 1.0; p.userData.d = V(Math.cos(a) * d, (r() - 0.2) * 1.2, Math.sin(a) * d * 0.7); p.rotation.set(r() * 3, r() * 3, r() * 3); g2.add(p); } return g2; });
    g.position.copy(c); g.children.forEach((p) => p.position.copy(p.userData.d).multiplyScalar(1 + ph * 2.4)); return add(s, g); };
  const armStamp = (s, k, at, tilt = 0.3, text = 'LATE') => { const g = once('arm' + k, () => { const g2 = new T.Group(), bone = new T.MeshPhysicalMaterial({ color: '#9a90a6', roughness: 0.55 });
      const fa = new T.Mesh(new T.CylinderGeometry(0.13, 0.17, 7, 10), bone); fa.position.y = 3.5; g2.add(fa); const st = LF.stamp(text === 'LATE' ? {} : { text, ink: '#7a3ad0', knob: '#2a2a30', labelInk: '#5a2ab0' }); st.scale.setScalar(1.18); g2.add(st);
      const ink = new T.PointLight(text === 'LATE' ? '#ff3a3a' : '#a070ff', 26, 8, 1.8); ink.position.y = -3.4; g2.add(ink); ENV.shadow(g2); return g2; });
    g.position.copy(at); g.rotation.set(0, 0, tilt); return add(s, g); };
  const mark = (s, k, text, ink, w, h, pos, rot) => { const m = once('mk' + k, () => LF.mark(text, ink, w, h, 0.1)); m.position.copy(pos.isVector3 ? pos : V(...pos)); m.rotation.set(...rot); return add(s, m); };
  const spider = () => once('spider', () => { const g = new T.Group(), m = new T.MeshStandardMaterial({ color: '#141418', roughness: 0.5 }); const b = new T.Mesh(new T.SphereGeometry(0.18, 12, 10), m); b.scale.set(1, 0.8, 1.2); g.add(b); const hd = new T.Mesh(new T.SphereGeometry(0.1, 10, 8), m); hd.position.z = 0.22; g.add(hd);
    for (let i = 0; i < 8; i++) { const s = i < 4 ? 1 : -1, k = i % 4, leg = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.42, 4), m); leg.position.set(s * 0.22, 0.02, -0.15 + k * 0.1); leg.rotation.set(0, 0, s * 1.1); g.add(leg); const l2 = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.35, 4), m); l2.position.set(s * 0.42, -0.12, -0.15 + k * 0.1); l2.rotation.z = -s * 0.5; g.add(l2); }
    [-1, 1].forEach((s) => { const e = new T.Mesh(new T.SphereGeometry(0.03, 6, 5), new T.MeshBasicMaterial({ color: '#ff3030' })); e.position.set(s * 0.04, 0.05, 0.3); g.add(e); });
    const th = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 20, 3), new T.MeshBasicMaterial({ color: '#d8e0f0', transparent: true, opacity: 0.6 })); th.position.y = 10; g.add(th); return g; });
  const medal = () => once('medal', () => { const g = new T.Group(); const d = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, 0.08, 24), new T.MeshPhysicalMaterial({ color: '#f2c01a', metalness: 1, roughness: 0.25 })); d.rotation.x = PI / 2; g.add(d);
    const rb = new T.Mesh(new T.TorusGeometry(0.6, 0.06, 6, 20, PI), new T.MeshStandardMaterial({ color: '#1f4fd8' })); rb.position.y = 0.55; rb.rotation.z = PI; g.add(rb); return g; });
  const money = () => once('money', () => { const g = new T.Group(); for (let i = 0; i < 3; i++) { const b = new T.Mesh(new T.PlaneGeometry(0.9, 0.42), new T.MeshStandardMaterial({ color: '#7ac070', side: T.DoubleSide })); b.position.set(i * 0.12, i * 0.05, i * 0.02); b.rotation.z = (i - 1) * 0.2; g.add(b); } return g; });
  const shadow = () => once('lfshadow', () => { const t = KIT.textTex(256, 512, (q, W, H) => { q.fillStyle = 'rgba(0,0,0,0)'; q.clearRect(0, 0, W, H); q.fillStyle = 'rgba(4,2,12,0.88)';
      q.beginPath(); q.moveTo(W * 0.12, H); q.quadraticCurveTo(W * 0.3, H * 0.55, W * 0.4, H * 0.36); q.lineTo(W * 0.6, H * 0.36); q.quadraticCurveTo(W * 0.7, H * 0.55, W * 0.88, H); q.fill();
      q.beginPath(); q.ellipse(W * 0.5, H * 0.26, W * 0.1, H * 0.065, 0.3, 0, 7); q.fill(); q.beginPath(); q.arc(W * 0.47, H * 0.18, W * 0.07, 0, 7); q.fill(); q.fillRect(W * 0.47, H * 0.3, W * 0.06, H * 0.08);
      q.lineWidth = 7; q.strokeStyle = 'rgba(4,2,12,0.88)'; [[0.38, 0.38, 0.14, 0.08, 0.1, 0.0], [0.62, 0.38, 0.86, 0.06, 0.9, 0.0]].forEach(([x0, y0, x1, y1]) => { q.beginPath(); q.moveTo(W * x0, H * y0); q.lineTo(W * x1, H * y1); q.stroke(); q.fillRect(W * x1 - 26, H * y1 - 20, 52, 26); });
      [[0.4, 0.13, -0.6], [0.56, 0.12, 0.5]].forEach(([x, y, r]) => { q.save(); q.translate(W * x, H * y); q.rotate(r); q.fillRect(-3, -30, 6, 40); q.restore(); }); });
    return new T.Mesh(new T.PlaneGeometry(9, 18), new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); });
  const ledger = () => once('ledger', () => BOOK.open({ cover: '#5a1a1a', w: 2.6, h: 3.4, left: (q, W) => { q.fillStyle = '#2a1a0a'; q.font = '900 22px Georgia'; q.textAlign = 'center'; q.fillText('RENEWALS 1925', W / 2, 44); for (let i = 0; i < 24; i++) { q.strokeStyle = 'rgba(122,58,208,0.8)'; q.lineWidth = 2; q.strokeRect(24 + (i % 4) * 54, 66 + Math.floor(i / 4) * 40, 44, 28); q.fillStyle = 'rgba(122,58,208,0.8)'; q.font = '900 12px Arial'; q.fillText('DUE', 46 + (i % 4) * 54, 84 + Math.floor(i / 4) * 40); } },
    right: (q, W) => { for (let i = 0; i < 24; i++) { q.strokeStyle = 'rgba(122,58,208,0.8)'; q.lineWidth = 2; q.strokeRect(24 + (i % 4) * 54, 66 + Math.floor(i / 4) * 40, 44, 28); q.fillStyle = 'rgba(122,58,208,0.8)'; q.font = '900 12px Arial'; q.textAlign = 'center'; q.fillText('DUE', 46 + (i % 4) * 54, 84 + Math.floor(i / 4) * 40); } q.fillStyle = '#2a1a0a'; q.font = '900 20px Georgia'; q.fillText('NO: 0', W / 2, 320); } }));
  const cookbook = () => once('cookbook', () => BOOK.open({ cover: '#c8962a', w: 2.6, h: 3.4, left: BOOK.DALE.extraDraw, right: (q, W, H) => { BOOK.portrait(q, W / 2, H / 2, 120, BOOK.DALE.who); q.fillStyle = '#c8962a'; q.font = '900 26px Georgia'; q.textAlign = 'center'; q.fillText('p. 212', W / 2, 40); } }));
  const card = () => once('card', () => LF.card(212, { w: 1.7 }));
  // ---- staging blocks ----
  const DB = V(-13, Y, -8.6), SLOT = V(-13, 2.8, -7.5), BOOKW = V(15, 3.2, -12.3);
  const deskLF = (s, o = {}) => put(s, o.n || 'latefee', Object.assign({ p: [0, 0, -33.2], ry: 0.1, mood: 'blank' }, o));
  const lfEye = (s, k, pos, inten = 1) => { const g = once('eyes' + k, () => { const g2 = new T.Group(); [-0.36, 0.36].forEach((x) => { const d = new T.Mesh(new T.CircleGeometry(0.3, 20), new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })); d.material.color.setScalar(2.2); d.position.x = x; g2.add(d); }); return g2; }); g.position.copy(pos); g.scale.setScalar(inten); return add(s, g); };
  // night library lighting accents per shot (cool key on faces)
  const key = (s, k, p, t, c = '#c8d8ff', i = 120) => { const l = once('key' + k, () => { const sp = new T.SpotLight(c, i, 40, 0.45, 0.6, 1.4); sp.userData.t = new T.Object3D(); sp.target = sp.userData.t; return sp; }); l.position.copy(p); l.userData.t.position.copy(t); add(s, l); add(s, l.userData.t); return l; };

  // ================= OPENING: THE RULE =================
  ST('In this town', (s, u) => { s.mood('morning'); [['crowd3', -6, -8, 1.2], ['crowd5', 6, -9, -1.4], ['crowd8', 9, 8, -2.2]].forEach(([n, x, z, ry], i) => put(s, n, { p: [x + L(0, 2, u) * Math.sin(ry), Y, z + L(0, 2, u) * Math.cos(ry)], ry, walk: u * 6 + i, mood: 'calm' }));
    return cam([L(-22, -18, u), L(30, 26, u), 46], [0, 8, -14], 34, { grade: 'morning' }); });
  ST("you can't return", (s, u) => { s.mood('morning'); const x = L(-4, -8, u); put(s, 'heroBook', { p: [x, Y, -7.5], ry: -PI / 2, walk: u * 5, mood: 'worry', pose: { armL: [-1.3, 0, 0.1] } }); look('heroBook', [-9, 6, -14], 0.8);
    put(s, 'crowd4', { p: [-1, Y, -9.6], ry: -1.2, walk: u * 5 + 2, mood: 'calm' }); return orb(V(x, 3.6, -7.5), 21, 30, 6, 30, { grade: 'morning', faces: { heroBook: [[0, 'worry'], [0.55, 'ohno']] } }); });
  ST('a library book late', (s, u) => { s.mood('morning'); put(s, 'crowd9', { p: [-10.4, Y, -6.0], ry: -2.4, mood: 'shock', pose: P.point }); return cam([-10.4, 3.2, L(-1.0, -2.2, u)], [-13, 2.0, -8.2], 26, { grade: 'morning', lead: 'crowd9' }); });
  ST('If you do', (s, u) => { s.mood('night'); put(s, 'crowd2', { p: [L(-2, 4, u), Y, -7.4], ry: PI / 2, walk: u * 7, mood: 'worry' }); look('crowd2', [0, 12, -14], 0.7);
    return cam([6, 3.6, 14.5], [-2, 8, -12], 38, { grade: 'night' }); });
  ST('at midnight the', (s, u) => { s.mood('night'); return cam([2.5, L(14, 15, u), 2], [0, 19.2, -11.4], L(16, 13, u), { grade: 'night', f: [0, 19.2, -11.4] }); });
  ST('Late Fee comes', (s, u) => { const lf = put(s, 'latefee', { p: [0, 0, L(11.5, 10.5, u)], ry: PI, mood: 'blank', pose: { armL: [0.1, 0, 0.2], armR: [0.1, 0, -0.2] } }); lf.root.scale.setScalar(0.92); CP.ground(lf, 0); key(s, 'hem', V(3, 3, 18), V(0, 1, 11), '#9ab0ff', 160);
    return cam([4.2, 1.8, 18.5], [0, 1.8, 9.8], 30, { grade: 'creep', f: [0, 1, 10.5] }); });
  ST('with a rubber', (s, u) => { armStamp(s, 'L1', V(-1.2, L(4.2, 3.8, u), 11.2), 0.06); armStamp(s, 'R1', V(1.4, L(4.5, 4.1, u), 11.8), -0.08, 'DUE');
    return cam([0.4, 2.2, 18.5], [0.1, 2.0, 11.4], 30, { grade: 'creep', f: [0, 2, 9.4] }); });
  ST('You hear her', (s, u) => { s.mode('hero'); put(s, 'hero', { p: [0, 2.1, -4.8], ry: 0.1, mood: 'worry', pose: PX.bedSit, ground: 2.15 }); look('hero', [7, 4, 4], L(0.2, 0.9, E(u))); key(s, 'hf', V(1, 6, 3), V(0, 5.4, -4.8), '#b8c8ff', 70);
    return fc('hero', 9, 0, 2, 26, { grade: 'creep', faces: { hero: [[0, 'worry'], [0.5, 'shock']] } }); });
  ST('before you see', (s, u) => { lfEye(s, 'top', V(0.3, 15.6 + 0.1 * Math.sin(u * 6), -9.5), 1); key(s, 'st1', V(0, 3, 12), V(0, 10, -8), '#6a5ab8', 40);
    return cam([0.6, 4.2, 14], [0.2, 12.5, -9], L(24, 20, u), { grade: 'creep', f: [0, 14, -9] }); });
  ST('Thunk Thunk', (s, u) => { const k = 4, y = s.stepY(k), z = s.stepZ(k), hit = u < 0.5 ? E(cl(u * 3)) : E(cl((u - 0.5) * 3)); armStamp(s, 'L2', V(-0.6, y + 3.4 + 1.8 * (1 - hit) + 0.4, z), 0.05);
    return cam([1.4, y + 2.4, z + 4.8], [-0.4, y + 0.6, z], 28, { grade: 'creep', f: [-0.6, y, z] }); });
  ST('A stamp on', (s, u) => { return cam([1.2, L(1.0, 1.6, u), 13.0], [0, 8, -4], 32, { grade: 'creep', f: [0, 4, 3] }); });
  ST('If she stamps', (s, u) => { s.mode('nico'); put(s, 'nicoPJ', { p: [0, 2.1, -4.8], ry: 0.15, mood: 'scream', pose: PX.bedSit, ground: 2.15, keep: true }); armStamp(s, 'L3', V(0.6, L(11, 9.2, E(u)), -4.6), 0.3);
    return cam([-1.6, 4.8, 7.5], [0.2, 5.6, -4.6], 36, { grade: 'creep', f: [0, 4, -4.8], lead: 'nicoPJ' }); });
  ST('you become a', (s, u) => { s.mode('nico'); const c = V(0, 3.4, -4.6); poof(s, 'b1', V(0, 2.4, -4.6), 0.2 + u * 0.6, 1.6, 5); pages(s, 'p1', c, u); const m = mark(s, 'splash', 'LATE', '#e01818', 3.4, 1.9, V(0, 4.4 + u * 0.4, -2.8), [0, 0, -0.2]); m.material.emissive = new T.Color('#e01818'); m.material.emissiveIntensity = 0.9;
    const b = prop(s, 'nb1', () => BOOK.face(Object.assign({ w: 1.5, h: 2.0, d: 0.32 }, BOOK.NICO)), V(0, L(3.4, 2.7, u), -4.8), [-0.3, 0.3 + u, 0.4]);
    return cam([-1.6, 4.8, 7.5], [0.2, 4.4, -4.4], 36, { grade: 'creep', f: c.toArray() }); });
  ST('face on the cover', (s, u) => { s.mode('nico'); prop(s, 'nb2', () => BOOK.face(Object.assign({ w: 1.7, h: 2.2, d: 0.34 }, BOOK.NICO)), V(0, 2.85, -6.4), [-1.1, 0, 0.12]); key(s, 'rm1', V(-2, 8, -3), V(0, 2.8, -6.2), '#a8c0ff', 50);
    return cam([L(1.4, 0.9, u), L(6.4, 5.8, u), -1.6], [0, 2.9, -6.4], 30, { grade: 'creep', f: [0, 2.9, -6.4] }); });
  ST("But she's fair", (s, u) => { s.mood('night'); const c = prop(s, 'card1', () => LF.card(48, { w: 1.7 }), V(0.4, 3.78, -29.4), [-PI / 2, 0, 0.2]); armStamp(s, 'R2', V(0.4, L(9.4, 8.0, E(u)), -29.4), 0.0, 'DUE'); key(s, 'd1', V(4, 8, -24), V(0, 4, -29), '#d8ffc8', 80);
    return cam([3.4, 7.0, -24.5], [0.3, 4.6, -29.6], 28, { grade: 'libnight' }); });
  ST('In a hundred', (s, u) => { s.mood('night'); prop(s, 'led', ledger, V(-1.5, 3.76, -29.2), [0, 0.15, 0]); key(s, 'd2', V(0, 9, -25), V(-1.5, 3.8, -29.2), '#ffe8c0', 90);
    return cam([L(-1.0, -1.4, u), 9.4, L(-24.5, -25.5, u)], [-1.5, 3.8, -29.2], 24, { grade: 'libnight' }); });
  ST('she has never', (s, u) => { s.mood('night'); prop(s, 'card2', () => LF.card(60, { w: 1.7 }), V(0.4, 3.78, -29.4), [-PI / 2, 0, 0.2]); armStamp(s, 'R2', V(0.4, L(8.0, 9.6, E(u)), -29.4), 0.05, 'DUE');
    mark(s, 'ren', 'RENEWED', '#7a3ad0', 1.2, 0.5, V(0.4, 3.82, -29.4), [-PI / 2, 0, 0.2]); key(s, 'd1', V(4, 8, -24), V(0, 4, -29), '#d8ffc8', 80);
    return cam([2.8, 6.6, -25.0], [0.3, 4.2, -29.4], 26, { grade: 'libnight' }); });
  ST('to a renewal', (s, u) => { s.mood('night'); prop(s, 'card3', () => LF.card(120, { w: 1.7 }), V(0.4, 3.78, -29.4), [-PI / 2, 0, 0.2]); key(s, 'd3', V(1, 8, -27), V(0.4, 3.8, -29.4), '#fff0d0', 90);
    return cam([0.5, L(6.2, 5.6, u), -27.6], [0.4, 3.8, -29.4], 22, { grade: 'libnight' }); });
  ST('So people here', (s, u) => { s.mood('morning'); put(s, 'pjdad', { p: [-6.6, Y, -10.4], ry: 0.1, mood: 'terror', pose: PX.sitRead, ground: 1.6 }); put(s, 'crowd10', { p: [-4.6, Y, -10.4], ry: -0.1, mood: 'worry', pose: PX.sitRead, ground: 1.6 }); put(s, 'crowd12', { p: [-2.2, Y, -8.4], ry: -0.5, mood: 'strain', pose: PX.hug });
    [['crowd10', 'r1', '#c8302a'], ['crowd12', 'r2', '#2a6a3a']].forEach(([n, k, c]) => attach(s, CAST.get(n).armL, k, () => BOOK.plain({ cover: c, title: 'READ', w: 1.0, h: 1.3, d: 0.2 }), [0, -2.0, 0.6], [-0.4, 0, 0]));
    return cam([-3.4, 4.4, 4.0], [-4.6, 3.0, -9.8], 30, { grade: 'morning', lead: 'crowd12' }); });
  ST('read with a', (s, u) => { s.mood('morning'); put(s, 'pjdad', { p: [-6.6, Y, -10.4], ry: 0.1, mood: 'terror', pose: { legL: [-1.57, 0, 0.05], legR: [-1.57, 0, -0.05], armL: [-1.2, 0, 0.1], armR: [-1.3, 0.3, 0.3], head: [0.25, 0, 0] }, ground: 1.6 });
    return fc('pjdad', 5.0, 25, 10, 26, { grade: 'morning', lead: 'pjdad', faces: { pjdad: [[0, 'worry'], [0.45, 'terror']] } }); });
  ST('At 1159', (s, u) => { s.mood('night'); return cam([1.8, 15.6, L(1.5, 0.5, u)], [0, 19.2, -11.4], 14, { grade: 'night', f: [0, 19.2, -11.4] }); });
  ST('parents line up', (s, u) => { s.mood('night'); put(s, 'pjmom', { p: [-11.0, Y, -7.4], ry: -1.57, mood: 'worry' }); put(s, 'pjdad', { p: [-8.6, Y, -7.0], ry: -1.4, mood: 'terror', pose: { armR: [-1.6, 0.3, 0.2], armL: [-1.1, 0, 0.2] } });
    put(s, 'pjafro', { p: [-6.0, Y, -7.6], ry: -1.5, mood: 'strain', walk: u * 4 }); put(s, 'crowd7', { p: [-3.4, Y, -7.0], ry: -1.4, mood: 'worry' }); put(s, 'crowd13', { p: [-0.8, Y, -7.6], ry: -1.6, mood: 'terror', walk: u * 4 + 1 }); put(s, 'crowd6', { p: [1.8, Y, -7.0], ry: -1.5, mood: 'shock', pose: P.run });
    return cam([L(-1, -3, u), 5.5, 9.5], [-6.6, 3.6, -8], 32, { grade: 'night', lead: 'pjafro' }); });
  ST('at the drop', (s, u) => { s.mood('night'); const pm = put(s, 'pjmom', { p: [-11.4, Y, -6.6], ry: -2.2, mood: 'strain' }); pm.root.updateMatrixWorld(true); GN.aim(pm, 'R', SLOT.clone().add(V(0, 0.1, L(0.9, 0.2, E(u))))); put(s, 'pjdad', { p: [-9.6, Y, -9.4], ry: -2.0, mood: 'terror', pose: { armR: [-1.6, 0.3, 0.2] } });
    return cam([-6.0, 4.2, -11.6], [-12.2, 3.2, -7.0], 30, { grade: 'night', lead: 'pjmom', faces: { pjmom: [[0, 'strain'], [0.55, 'laugh']] } }); });
  ST('in their pajamas', (s, u) => { s.mood('night'); put(s, 'pjdad', { p: [-8.8, Y, -6.6], ry: 0.5, mood: 'terror', pose: PX.hipsL }); put(s, 'pjmom', { p: [-10.6, Y, -7.4], ry: 0.6, mood: 'worry' }); put(s, 'pjafro', { p: [-6.8, Y, -7.0], ry: -0.2, mood: 'strain' });
    return cam([L(-7.2, -7.8, u), 4.6, 2.6], [-8.6, 4.4, -7], 26, { grade: 'night', lead: 'pjdad', faces: { pjdad: [[0, 'terror'], [0.5, 'strain']] } }); });
  ST('Mr Dale was', (s, u) => { s.mood('night'); const x = L(2, -7, u); put(s, 'dale', { p: [x, Y, -6.8], ry: -PI / 2, mood: 'shock', pose: PX.run, keep: true }); attach(s, CAST.get('dale').armR, 'dbk', () => BOOK.plain({ cover: '#8a1e2a', title: 'BIRDS', w: 1.0, h: 1.3, d: 0.2 }), [0, -2.0, 0.3], [0, 0, 0]);
    return orb(V(x, 3.6, -6.8), 15, 30, 5, 30, { grade: 'sepia', lead: 'dale' }); });
  ST('one minute late', (s, u) => { s.mood('night'); put(s, 'dale', { p: [-10.0, Y, -6.6], ry: -1.8, mood: 'terror', keep: true, pose: P.handsHead }); const sh = prop(s, 'sh1', shadow, V(-10, 0.33, -6.0), [-PI / 2, 0, 0.4], L(0.4, 0.9, E(u)));
    return cam([-4.4, 5.0, 2.0], [-10.4, 3.4, -6.6], 30, { grade: 'sepia', lead: 'dale' }); });
  ST("He's in a", (s, u) => { s.mood('day'); prop(s, 'cb1', () => BOOK.face(Object.assign({ w: 1.7, h: 2.2, d: 0.4 }, BOOK.DALE)), V(9.9, 13.6, -6), [0, -PI / 2, 0]);
    return cam([L(4, 5, u), 14.6, -2.2], [9.8, 14.6, -6], 24, { grade: 'story' }); });
  ST('between two soups', (s, u) => { s.mood('day'); prop(s, 'cbo', cookbook, V(0, 3.76, -29.2), [0, 0, 0]);
    return cam([0, L(10.5, 9.5, u), -25.4], [0, 3.8, -29.2], 26, { grade: 'story' }); });
  // ================= THE HERO =================
  ST("I'm the slowest", (s, u) => { s.mood('day'); put(s, 'heroBook', { p: [-6, 0, -6], ry: 0.2, mood: 'calm', pose: PX.sitRead, ground: 1.4 });
    [['kid1', -1, 2, -2.6], ['kid3', 1.5, -1, -2.9], ['kid2', -11, 4, 2.8]].forEach(([n, x, z, ry], i) => { put(s, n, { p: [x + L(0, 4, u) * Math.sin(ry), 0, z + L(0, 4, u) * Math.cos(ry)], ry, walk: u * 7 + i, mood: 'laugh', pose: PX.carry }); attach(s, CAST.get(n).armL, 'st' + n, () => { const g = new T.Group(); for (let k = 0; k < 4; k++) { const b = BOOK.plain({ cover: ['#e84040', '#2a8ad8', '#f2c01a', '#38a060'][k], title: '', w: 1.0, h: 1.3, d: 0.25 }); b.rotation.x = -PI / 2; b.position.y = k * 0.27; g.add(b); } return g; }, [-0.5, -1.9, 0.9], [0, 0, 0]); });
    return cam([-2, 4.6, 9], [-4.4, 2.8, -4], 30, { grade: 'day', faces: { heroBook: [[0, 'calm'], [0.6, 'sleepy']] } }); });
  ST("I've had the", (s, u) => { s.mood('day'); put(s, 'heroBook', { p: [-6, 0, -6], ry: 0.2, mood: 'smug', pose: PX.sitRead, ground: 1.4 }); return fc('heroBook', 9, 10, 4, 26, { grade: 'day', faces: { heroBook: [[0, 'smug'], [0.5, 'grin']] } }); });
  ST('since second grade', (s, u) => { s.mood('sepia'); put(s, 'heroKid', { p: [-2, 0, -4], ry: 0.3, mood: 'laugh', pose: { armL: [-1.4, 0, 0.1], armR: [-2.7, 0, -0.5] } }); attach(s, CAST.get('heroKid').armL, 'kbk', () => BOOK.plain({ cover: '#2a8a5a', title: 'MY BOOK', w: 1.0, h: 1.3, d: 0.22 }), [0, -2.05, 0.45], [-0.2, 0, 0]);
    return fc('heroKid', 8, 15, 6, 30, { grade: 'sepia' }); });
  ST("I've renewed it", (s, u) => { s.mood('day'); put(s, 'heroBook', { p: [1.6, 0, -26.0], ry: -0.4, mood: 'calm', pose: PX.offer }); prop(s, 'card4', () => LF.card(211, { w: 1.7 }), V(0.4, 3.78, -29.0), [-PI / 2, 0, 0.2]); armStamp(s, 'R3', V(0.4, L(9.6, 8.0, E(cl(u * 1.6))), -29.0), 0.0, 'DUE');
    return cam([7.4, 5.0, -18.5], [0.8, 4.6, -27.5], 30, { grade: 'story', faces: { heroBook: [[0, 'calm'], [0.5, 'smug']] } }); });
  ST('two hundred and', (s, u) => { s.mood('day'); prop(s, 'card', card, V(0.4, 3.78, -29.0), [-PI / 2, 0, 0.2]); return cam([0.5, L(6.0, 5.4, u), -27.3], [0.4, 3.8, -29.0], 22, { grade: 'story' }); });
  ST("I'm also the", (s, u) => { s.mood('day'); [['kid1', -4, 4, 0.8, 'scream'], ['kid2', 2, 6, -2.2, 'laugh'], ['kid3', -1, 0, 2.4, 'scream'], ['kid4', 4, 2, -0.6, 'laugh'], ['crowd4', -8, 1, 1.6, 'laugh']].forEach(([n, x, z, ry, m], i) => put(s, n, { p: [x + L(0, 3, u) * Math.sin(ry), 0, z + L(0, 3, u) * Math.cos(ry)], ry, mood: m, pose: i % 2 ? PX.jump : P.cheer, walk: i % 2 ? undefined : u * 8 + i }));
    put(s, 'hero', { p: [0.5, 0, 2.6], ry: 0.1, mood: 'calm', pose: PX.still }); return cam([1, 5.0, 25], [0, 3.0, 2], 34, { grade: 'day', lead: 'kid2' }); });
  ST('quiet game champion', (s, u) => { s.mood('day'); put(s, 'hero', { p: [0.5, 0, 2.6], ry: 0.1, mood: 'calm', pose: PX.shh, keep: true }); put(s, 'kid1', { p: [-3.4, 0, 1.0], ry: 0.6, mood: 'laugh', pose: P.handsHead }); put(s, 'kid4', { p: [3.6, 0, 1.2], ry: -0.6, mood: 'strain', pose: PX.zip });
    return fc('hero', 13, 0, 6, 32, { grade: 'day', lead: 'kid1', faces: { hero: [[0, 'calm']] } }); });
  ST('of recess', (s, u) => { s.mood('day'); put(s, 'hero', { p: [0.5, 0, 2.6], ry: 0.1, mood: 'smug', pose: P.cheer }); attach(s, CAST.get('hero').torso, 'med', medal, [0, 0.2, 0.62], [0, 0, 0]); put(s, 'kid2', { p: [-3, 0, 1.4], ry: 0.5, mood: 'shock' }); put(s, 'kid3', { p: [3.4, 0, 1.6], ry: -0.5, mood: 'laugh', pose: P.cheer });
    return fc('hero', 12, -10, 4, 30, { grade: 'day', faces: { hero: [[0, 'smug'], [0.5, 'laugh']] } }); });
  ST('Once I stayed', (s, u) => { s.mood('drill'); [['kid1', -2, -6, 'scream'], ['kid3', 2, -7, 'scream'], ['kid4', -5, -8, 'terror'], ['crowd4', 4, -9, 'shock']].forEach(([n, x, z, m], i) => put(s, n, { p: [x, 0, z + L(0, 6, u)], ry: 0.1 * i, walk: u * 8 + i, mood: m, pose: PX.run }));
    return cam([2, 6, 14], [0, 5, -10], 34, { grade: 'day', lead: 'kid1' }); });
  ST('in a fire', (s, u) => { s.mood('drill'); put(s, 'fire1', { p: [10.5, 0, L(6, 4, u)], ry: -0.9, mood: 'shout', pose: PX.jump, walk: u * 6 }); put(s, 'fire2', { p: [12.5, 0, L(9, 6.6, u)], ry: -1.1, mood: 'strain', walk: u * 6 + 1 });
    return cam([2, 4.4, 16], [11, 4.4, 3], 30, { grade: 'day', lead: 'fire1' }); });
  ST('the firemen thought', (s, u) => { s.mood('drill'); put(s, 'hero', { p: [3.6, 0, -8.4], ry: 0.2, mood: 'calm', pose: PX.still, keep: true }); put(s, 'fire1', { p: [L(9, 6.8, u), 0, -6.4], ry: -1.3, mood: 'calm', walk: u * 4 }); look('fire1', head('hero'), 0.8);
    return cam([8, 4.4, 4.5], [4.6, 4.0, -8.6], 28, { grade: 'day', lead: 'fire1', faces: { hero: [[0, 'calm']] } }); });
  ST('was a coat', (s, u) => { s.mood('drill'); const r = s.rack.hook; const h = put(s, 'hero', { p: [r.x - 0.2, 0, r.z + 0.6], ry: 0.3, mood: 'calm', keep: true, pose: { armL: [-3.0, 0, 0.1], armR: [0, 0, -0.04] } }); CP.ground(h, L(0.4, 2.6, E(cl(u * 2)))); h.root.rotation.z = 0.08;
    put(s, 'fire1', { p: [r.x + 3.2, 0, r.z + 2.0], ry: -1.0, mood: 'calm', pose: { armR: [-0.5, 0, -0.2], armL: [-0.2, 0, 0.2] } }); look('fire1', [r.x + 9, 4, r.z + 12], 0.8);
    return cam([r.x + 3.5, 5.6, r.z + 16], [r.x + 0.8, 5.4, r.z], 34, { grade: 'day', lead: 'fire1' }); });
  // ================= NICO =================
  ST('My neighbor Nico', (s, u) => { s.mood('morning'); put(s, 'nico', { p: [18, 0, 14.5], ry: PI, mood: 'laugh', pose: P.wave }); put(s, 'hero', { p: [8.6, Y, 8.6], ry: 0.9, mood: 'grin', pose: P.waveL });
    return cam([L(10, 11.5, u), 4.0, -1], [17, 4.4, 14], 30, { grade: 'morning', lead: 'nico' }); });
  ST('is seven', (s, u) => { s.mood('morning'); put(s, 'nico', { p: [18, 0, 14.5], ry: PI, mood: 'grin', pose: { armL: [-1.3, 0, 0.1], armR: [-2.5, 0, -0.9] } }); return fc('nico', 5.0, 10, 4, 24, { grade: 'morning', faces: { nico: [[0, 'grin'], [0.5, 'laugh']] } }); });
  ST('He takes out', (s, u) => { s.mood('day'); put(s, 'nico', { p: [L(-1.5, 0.5, u), 0, L(-22, -18, u)], ry: 0.2, walk: u * 5, mood: 'strain', pose: PX.carry, keep: true }); attach(s, CAST.get('nico').armL, 'five', () => { const g = new T.Group(); for (let k = 0; k < 5; k++) { const b = BOOK.plain({ cover: ['#e84040', '#2a8ad8', '#f2c01a', '#38a060', '#8a3ad0'][k], title: ['ZOO', 'BUS', 'MOON', 'SHARKS', 'BEARS'][k], w: 1.3, h: 1.7, d: 0.3 }); b.rotation.x = -PI / 2; b.rotation.z = (k - 2) * 0.08; b.position.y = k * 0.32; g.add(b); } return g; }, [-0.5, -2.0, 1.0], [0, 0, 0]);
    put(s, 'kid2', { p: [3, 0, -20], ry: -0.5, mood: 'shock' }); return cam([3.4, 3.6, -8.5], [0, 3.6, -19], 30, { grade: 'story', lead: 'kid2' }); });
  ST('just for the', (s, u) => { s.mood('day'); put(s, 'nico', { p: [0, 0, 6.5], ry: 0.2, mood: 'laugh', pose: PX.sitFloor, keep: true }); attach(s, CAST.get('nico').armL, 'shb', () => BOOK.face({ cover: '#2a6ab0', title: 'SHARKS', w: 1.5, h: 1.9, d: 0.2, who: { skin: '#9ab0c8', hair: 'bald', hairC: '#9ab0c8', face: 'F4' } }), [0.4, -2.0, 0.8], [-0.3, 0, 0]);
    return fc('nico', 5.5, 10, 12, 26, { grade: 'story', faces: { nico: [[0, 'laugh'], [0.5, 'grin']] } }); });
  ST('Then one Sunday', (s, u) => { s.mode('nico'); put(s, 'nicoPJ', { p: [0, 2.1, -4.8], ry: 0.1, mood: 'grin', pose: PX.sitRead, ground: 2.15 }); attach(s, CAST.get('nicoPJ').armL, 'shb2', () => BOOK.plain({ cover: '#2a6ab0', title: 'THE BIG BOOK OF SHARKS', w: 1.5, h: 1.9, d: 0.28 }), [0.4, -2.0, 0.8], [-0.4, 0, 0]);
    return cam([-2.2, 5.6, 4.5], [0, 4.4, -4.6], 30, { grade: 'creep', faces: { nicoPJ: [[0, 'grin'], [0.6, 'calm']] } }); });
  ST('he fell asleep', (s, u) => { s.mode('nico'); const n = put(s, 'nicoPJ', { p: [0, 2.7, -1.6], ry: 0, rx: -PI / 2, mood: 'sleepy', keep: true, pose: PX.lie }); n.setFace('F2');
    return cam([3.4, 7.6, 1.5], [0, 2.8, -4.5], 30, { grade: 'creep' }); });
  ST('It was due', (s, u) => { s.mode('nico'); return cam([L(-2.4, -3.2, u), 6.0, -3.0], [-5.2, 6.0, -7.8], 22, { grade: 'creep' }); });
  ST('At 1158', (s, u) => { s.mode('hero'); put(s, 'hero', { p: [0, 2.7, -1.6], ry: 0, rx: -PI / 2, mood: 'calm', keep: true, pose: PX.lie }); return cam([L(-2.2, -2.6, u), 3.6, -3.4], [-3.6, 2.6, -6.3], 20, { grade: 'creep' }); });
  ST('I heard it', (s, u) => { s.mode('hero'); put(s, 'hero', { p: [0, 2.1, -4.8], ry: 0.1, mood: 'ohno', pose: PX.bedSit, ground: 2.15, keep: true }); look('hero', [8, 4, 4], 0.9); key(s, 'hf', V(1, 6, 3), V(0, 5.4, -4.8), '#b8c8ff', 70);
    return fc('hero', 8.5, 0, 2, 26, { grade: 'creep', faces: { hero: [[0, 'shock'], [0.45, 'ohno']] } }); });
  ST('Thunk Thunk Thunk', (s, u) => { const sh = prop(s, 'sh2', shadow, V(-3.12, L(5.5, 9.5, u), L(6, 0, u)), [0, PI / 2, 0], 1.0);
    return cam([1.8, 4.0, 13.5], [-1.0, 8.5, 1], 32, { grade: 'creep' }); });
  ST('Thunk Up his', (s, u) => { const k = 13, lf = put(s, 'latefee', { p: [0, s.stepY(k), s.stepZ(k) + L(0.6, 0, u)], ry: PI, mood: 'blank' }); lf.root.scale.setScalar(0.92); CP.ground(lf, s.stepY(k) + 0.13);
    return cam([1.6, s.stepY(k) - 1.8, s.stepZ(k) + 7.5], [-0.8, s.stepY(k) + 1.8, s.stepZ(k) - 2], 30, { grade: 'creep' }); });
  // ================= THE MORNING =================
  ST('In the morning', (s, u) => { s.mood('morning'); return cam([L(8, 6, u), 4, 13], [4, 8, -14], 36, { grade: 'morning' }); });
  ST('the library window', (s, u) => { s.mood('morning'); put(s, 'hero', { p: [L(9, 13.4, u), Y, -7.6], ry: PI / 2 - 0.4, walk: u * 5, mood: 'calm' }); put(s, 'mom', { p: [L(7, 11.2, u), Y, -6.4], ry: PI / 2 - 0.3, walk: u * 5 + 1, mood: 'calm' });
    return cam([7, 4.2, 6], [13, 3.6, -9], 30, { grade: 'morning', faces: { hero: [[0, 'calm'], [0.6, 'shock']] } }); });
  ST('had a new', (s, u) => { s.mood('morning'); return cam([15, 5.0, L(-4.5, -5.8, u)], [15, 4.6, -12.2], 18, { grade: 'morning' }); });
  ST('Nico was on', (s, u) => { s.mood('morning'); put(s, 'mom', { p: [12.0, Y, -8.6], ry: 0.75, mood: 'terror', pose: P.handsHead }); put(s, 'hero', { p: [17.9, Y, -8.2], ry: -0.55, mood: 'ohno', pose: { armR: [-1.5, 0, 0.6] } }); look('hero', [15, 4, 11]); look('mom', [15, 4, 11], 0.6);
    return cam([15.0, 4.0, 11.5], [15.0, 3.4, -11], 30, { grade: 'morning', f: BOOKW.toArray(), lead: 'mom' }); });
  ST('screaming', (s, u) => { s.mood('morning'); return cam([15, 3.4, L(-7.6, -8.6, u)], [15, 3.2, -12.3], 14, { grade: 'morning', f: BOOKW.toArray() }); });
  ST('We returned the', (s, u) => { s.mood('morning'); const h = put(s, 'hero', { p: [-12.4, Y, -5.4], ry: PI - 0.3, mood: 'worry', pose: PX.push }); attach(s, h.armL, 'sbk', () => BOOK.plain({ cover: '#2a6ab0', title: 'SHARKS', w: 1.0, h: 1.3, d: 0.22 }), [0.4, -2.0, 0.2], [-PI / 2, 0, 0]); put(s, 'mom', { p: [-15.6, Y, -5.6], ry: 2.4, mood: 'worry' });
    return cam([-6.0, 4.2, -11.4], [-12.4, 3.2, -6.4], 30, { grade: 'morning', faces: { hero: [[0, 'worry'], [0.5, 'smug']] } }); });
  ST('It slid back', (s, u) => { s.mood('morning'); const b = prop(s, 'sbk2', () => BOOK.plain({ cover: '#2a6ab0', title: 'SHARKS', w: 1.0, h: 1.3, d: 0.22 }), V(-13, L(2.6, 1.0, E(u)), L(-7.6, -6.2, E(u))), [-PI / 2 + 0.4, 0.2, 0]); put(s, 'hero', { p: [-15.4, Y, -5.0], ry: 2.4, mood: 'shock', pose: P.handsHead });
    return cam([-9.0, 3.6, -3.0], [-12.8, 2.2, -7.0], 26, { grade: 'morning' }); });
  ST('stamped RETURNS ARE', (s, u) => { s.mood('morning'); prop(s, 'sbk3', () => BOOK.plain({ cover: '#2a6ab0', title: 'SHARKS', w: 1.6, h: 2.1, d: 0.3 }), V(-12.6, 0.36, -5.2), [-PI / 2, 0, 0.3]); mark(s, 'raf', 'RETURNS\nARE FINAL'.split('\n').join(' '), '#e01818', 1.4, 0.7, V(-12.6, 0.72, -4.9), [-PI / 2, 0, 0.3]);
    return cam([-12.4, L(4.0, 3.4, u), -3.2], [-12.6, 0.4, -5.0], 22, { grade: 'morning' }); });
  ST('His mom tried', (s, u) => { s.mood('morning'); const m = put(s, 'mom', { p: [-11.8, Y, -5.2], ry: PI - 0.25, mood: 'worry', pose: { armR: [-1.45, 0, 0.1], armL: [-0.4, 0, 0.3] } }); attach(s, m.armR, 'mon', money, [0, -2.0, 0.4], [-PI / 2, 0, 0]); put(s, 'hero', { p: [-16.2, Y, -5.0], ry: 2.2, mood: 'worry' });
    return cam([-6.4, 4.4, -1.0], [-12.2, 3.2, -6.8], 30, { grade: 'morning', lead: 'mom', faces: { mom: [[0, 'worry'], [0.5, 'smug']] } }); });
  const handScene = (s, u, out, inten) => { const gh = once('gh', () => LF.hand({ len: 1.3 })); gh.position.copy(SLOT).add(V(0, -0.3, -0.1)); gh.rotation.set(0.9, 0, 0); gh.scale.setScalar(out); add(s, gh); gh.updateMatrixWorld(true); const pad = gh.localToWorld(V(0, 1.65, 0.8));
    const m = put(s, 'mom', { p: [0, Y, 0], ry: PI / 2, mood: 'terror', keep: true, pose: { armL: [-0.35, 0, 1.25], armR: [-0.4, 0, -0.5] } }); m.root.updateMatrixWorld(true); const g1 = gh.position.clone(); gh.scale.setScalar(1); gh.updateMatrixWorld(true); const pad1 = gh.localToWorld(V(0, 1.65, 0.8)); gh.scale.setScalar(out);
    const hp = m.armL.localToWorld(V(0, -1.9, 0)); m.root.position.x += pad1.x - hp.x; m.root.position.z += pad1.z - hp.z + 0.1; m.root.updateMatrixWorld(true); if (inten) { const mk = attach(s, m.armL, 'mpalm', () => LF.mark('LATE', '#e01818', 0.62, 0.38, 0.15), [0, -1.79, 0.49], [0, 0, 0]); }
    return m.root.position.clone(); };
  ST('A grey hand', (s, u) => { s.mood('morning'); const mp = handScene(s, u, L(0.05, 0.75, E(u)), false); return cam([mp.x + 11, 4.6, mp.z + 1.0], [mp.x - 0.4, 3.4, mp.z - 2.4], 30, { grade: 'morning', f: SLOT.toArray(), faces: { mom: [[0, 'shock']] } }); });
  ST('and stamped her', (s, u) => { s.mood('morning'); const mp = handScene(s, u, 1, u > 0.5); return cam([mp.x + 11, 4.6, mp.z + 1.0], [mp.x - 0.4, 3.4, mp.z - 2.4], 30, { grade: 'morning', faces: { mom: [[0, 'shock'], [0.5, 'terror']] } }); });
  ST('LATE', (s, u) => { s.mood('morning'); const mp = handScene(s, u, 0.4, true); return fc('mom', 5.0, -25, 8, 28, { grade: 'morning', faces: { mom: [[0, 'terror']] } }); });
  ST('That night I', (s, u) => { s.mood('night'); put(s, 'hero', { p: [-12.6, Y + L(0, 1.0, u), -6.6], ry: PI, mood: 'smug', pose: PX.climb }); look('hero', [-6, 4, 4], 0.8);
    return cam([-7.8, 4.6, 1.6], [-12.8, 3.4, -7.4], 30, { grade: 'night', faces: { hero: [[0, 'smug'], [0.5, 'strain']] } }); });
  ST('slid down the', (s, u) => { const g = s.g; g.updateMatrixWorld(true); const h = put(s, 'hero', { mood: 'strain', keep: true, pose: PX.slide }); g.add(h.root); h.root.position.set(0.2, -s.R + 0.25, L(-4, -9, u)); h.root.rotation.set(0, PI, 0);
    const fl = once('chfl', () => new T.PointLight('#9affd0', 40, 14, 1.6)); fl.position.copy(g.localToWorld(V(0, 0.5, -14))); add(s, fl);
    return cam(g.localToWorld(V(-0.6, -0.6, -18.5)), g.localToWorld(V(0.1, -1.0, L(-4, -9, u))), 40, { grade: 'libnight', faces: { hero: [[0, 'strain'], [0.6, 'scream']] } }); });
  // ================= THE NIGHT LIBRARY =================
  const pile = (s) => { for (let i = 0; i < 6; i++) prop(s, 'pile' + i, () => BOOK.plain({ cover: ['#8a1e2a', '#1e3a6a', '#2a5a2e', '#6a2a6a', '#c86a1a', '#1e5a5a'][i], title: '', w: 1.6, h: 2.0, d: 0.35 }), V(-1.4 + (i % 3) * 1.2, 0.2 + Math.floor(i / 3) * 0.35, 13 + (i % 2) * 0.6), [-PI / 2, 0, i * 0.7]); };
  ST('At night the', (s, u) => { s.mood('night'); pile(s); const h = put(s, 'hero', { p: [-0.2, 0, 13.4], ry: 0.3, mood: 'shock', pose: u < 0.4 ? PX.jump : P.open }); CP.ground(h, L(2.8, 0.6, E(cl(u * 2.2)))); key(s, 'n1', V(3, 5, 20), V(0, 3, 13), '#c8d8ff', 90);
    return cam([3.0, 3.4, 24], [0, 4.2, 12], 34, { grade: 'libnight', faces: { hero: [[0, 'scream'], [0.45, 'shock']] } }); });
  ST('shelves go up', (s, u) => { s.mood('night'); put(s, 'hero', { p: [3.4, 0, 9], ry: PI + 0.5, mood: 'shock', pose: PX.lookUp }); return cam([-0.6, 1.4, 17], [0.2, L(6, 30, E(u)), -10], 40, { grade: 'libnight', f: [0, 20, -10] }); });
  ST('full of kids', (s, u) => { s.mood('night'); key(s, 'n2', V(2, 6, 0), V(10, 8, -4), '#c8d8ff', 140); return cam([L(1, 2.4, u), 8, 4], [11, 8.6, -4], 28, { grade: 'libnight', f: [11, 8, -4] }); });
  ST('faces on the', (s, u) => { s.mood('night'); key(s, 'n3', V(5, 7, 0), V(11, 6, -2), '#c8d8ff', 160); return cam([5.6, 4.4, L(3.4, 2.6, u)], [11.2, 4.2, 1.0], 16, { grade: 'libnight', f: [11.2, 6, -2.4] }); });
  ST('And somewhere up', (s, u) => { s.mood('night'); put(s, 'hero', { p: [0.6, 0, 8], ry: PI - 0.3, mood: 'worry', pose: PX.lookUp }); lfEye(s, 'g1', V(L(6, 4.5, u), 38.5, -16), 1.2);
    return cam([-2.4, 1.4, 14], [3.6, 30, -14], 40, { grade: 'libnight' }); });
  ST('thunk Thunk', (s, u) => { s.mood('night'); const h = put(s, 'hero', { p: [0.6, 0, 8], ry: 0.4, mood: 'terror', pose: u > 0.3 ? PX.duck : PX.lookUp }); poof(s, 'dust', V(-2.4, 0.4, 5), 0.2 + u * 0.7, 1.2, 9);
    return fc('hero', 9, 20, 10, 32, { grade: 'libnight', faces: { hero: [[0, 'shock'], [0.3, 'terror']] } }); });
  ST('The books whispered', (s, u) => { s.mood('night'); put(s, 'hero', { p: [7.6, 0, 2], ry: 1.4, mood: 'worry', pose: PX.tiptoe }); key(s, 'n4', V(3, 6, 8), V(10, 5, 2), '#c8d8ff', 140);
    return cam([1.6, 4.4, 12], [9, 4.6, 1], 30, { grade: 'libnight', faces: { hero: [[0, 'worry'], [0.5, 'shock']] } }); });
  ST('for help and', (s, u) => { s.mood('night'); key(s, 'n5', V(6, 5, 4), V(11, 3.4, 0), '#c8d8ff', 160); return cam([7.4, 3.6, L(2.4, 1.6, u)], [11.2, 3.4, 0.4], 18, { grade: 'libnight', f: [11.2, 3.4, 0.4] }); });
  ST('every whisper brought', (s, u) => { s.mood('night'); put(s, 'hero', { p: [7.0, 0, 2], ry: 0.9, mood: 'terror', pose: PX.duck }); lfEye(s, 'g2', V(L(8, 5, u), 27 + 11.2, L(-14, -6, u)), 1.4);
    return cam([1.0, 2.0, 12], [6, 22, -6], 38, { grade: 'libnight', faces: { hero: [[0, 'terror']] } }); });
  ST("I didn't make", (s, u) => { s.mood('night'); put(s, 'hero', { p: [6.6, 0, 1], ry: -0.5, mood: 'calm', keep: true, pose: PX.zip }); key(s, 'n6', V(3, 6, 6), V(6.6, 4.8, 1), '#c8d8ff', 140);
    return fc('hero', 6.5, 10, 6, 26, { grade: 'libnight', lead: 'hero', talk: false }); });
  ST('Not even when', (s, u) => { s.mood('night'); put(s, 'hero', { p: [6.6, 0, 1], ry: -0.5, mood: 'worry', keep: true, pose: PX.still }); const h = head('hero'); prop(s, 'sp', spider, V(h.x + 0.15, L(h.y + 4, h.y + 1.3, E(u)), h.z + 0.9), [0, 0.6, 0]); key(s, 'n6', V(3, 6, 6), V(6.6, 4.8, 1), '#c8d8ff', 140);
    return fc('hero', 6, 10, 10, 28, { grade: 'libnight', talk: false, faces: { hero: [[0, 'calm'], [0.5, 'worry']] } }); });
  ST('landed on my', (s, u) => { s.mood('night'); const a = put(s, 'hero', { p: [6.6, 0, 1], ry: -0.5, mood: 'strain', keep: true, pose: PX.still }); a.root.updateMatrixWorld(true); const n = a.head.localToWorld(V(0, -0.05, 0.75)); prop(s, 'sp', spider, n, [0.4, 0.6, 0]); key(s, 'n6', V(3, 6, 6), V(6.6, 4.8, 1), '#c8d8ff', 140);
    return fc('hero', 3.6, 15, 4, 24, { grade: 'libnight', talk: false, faces: { hero: [[0, 'strain']] } }); });
  ST('I found Nico', (s, u) => { s.mood('night'); const h = put(s, 'hero', { p: [8.4, 0, -4], ry: 1.57, mood: 'grin', pose: { body: [0.5, 0, 0], armL: [-1.6, 0, -0.2], armR: [-1.6, 0, 0.2], legL: [-0.5, 0, 0], legR: [-0.5, 0, 0], head: [0.2, 0, 0] } });
    prop(s, 'nb3', () => BOOK.face(Object.assign({ w: 1.5, h: 2.0, d: 0.32 }, BOOK.NICO)), V(L(10.6, 9.6, E(u)), 0.4, -4), [0, -PI / 2, 0]); key(s, 'n7', V(3, 5, 0), V(9.6, 1.5, -4), '#c8d8ff', 140);
    return cam([3.2, 3.0, 1.5], [9.2, 2.0, -4], 28, { grade: 'libnight', faces: { hero: [[0, 'shock'], [0.5, 'grin']] } }); });
  ST('and tiptoed to', (s, u) => { s.mood('night'); const z = L(-6, -13, u), h = put(s, 'hero', { p: [1.2, 0, z], ry: PI, mood: 'worry', pose: Math.floor(u * 4) % 2 ? PX.tiptoeB : Object.assign({}, PX.tiptoe, { armL: [-1.25, 0, -0.3], armR: [-1.25, 0, 0.3] }) }); CP.ground(h, 0.2); attach(s, h.armL, 'nbh', () => BOOK.face(Object.assign({ w: 1.2, h: 1.6, d: 0.26 }, BOOK.NICO)), [0.5, -2.0, 0.7], [-0.3, 0, 0]);
    return cam([3.6, 3.4, z - 9], [1.0, 3.6, z], 30, { grade: 'libnight', talk: false, faces: { hero: [[0, 'worry'], [0.5, 'strain']] } }); });
  ST('Thunk She', (s, u) => { s.mood('night'); put(s, 'hero', { p: [1.0, 0, -14.6], ry: PI, mood: 'shock', keep: true, pose: PX.hug }); armStamp(s, 'L4', V(-2.0, L(5.6, 3.1, E(cl(u * 3))), -11.4), 0.02); key(s, 'n8', V(4, 4, -22), V(1, 2, -12), '#c8d8ff', 160);
    return cam([2.6, 2.8, -22.5], [1.0, 2.8, -12.5], 30, { grade: 'libnight' }); });
  ST('She was right', (s, u) => { s.mood('night'); put(s, 'hero', { p: [1.0, 0, -14.6], ry: L(PI, PI * 2 - 0.4, E(u)), mood: 'terror', keep: true, pose: PX.hug }); const lf = put(s, 'latefee', { p: [0.6, 0, -9.2], ry: PI, mood: 'blank', pose: { armL: [-0.3, 0, 0.1], armR: [-0.3, 0, -0.1] } });
    key(s, 'n8', V(4, 4, -20), V(1, 3, -12), '#c8d8ff', 160); return cam([2.2, 2.6, -21.5], [0.8, 3.0, -11], 30, { grade: 'libnight', faces: { hero: [[0, 'worry'], [0.6, 'terror']] } }); });
  // ---- the reveal ----
  const reveal = (s, pose, mood) => { s.mood('night'); put(s, 'hero', { p: [3.6, 0, -15.6], ry: -0.2, mood: 'terror', keep: true, pose: PX.hug }); const lf = put(s, 'latefee', { p: [0.4, 0, -9.4], ry: PI + 0.1, mood, pose }); key(s, 'rv', V(-2.5, 2, -17), V(0.4, 11, -9.4), '#c8fff0', 260); key(s, 'rv2', V(-6, 18, -2), V(0.4, 10, -9.4), '#ff6a9a', 80); return lf; };
  ST('Three meters of', (s, u) => { reveal(s, { armL: [-0.35, 0, 0.15], armR: [-0.4, 0, -0.15] }, 'blank'); return cam([1.6, 1.0, -21.5], [0.4, L(2, 11, E(u)), -9.4], 40, { grade: 'libnight' }); });
  ST('glasses on a', (s, u) => { reveal(s, { head: [0.35, 0, 0.45] }, 'tilt'); const h = CAST.get('latefee'); return fc('latefee', L(6.5, 5.2, u), 0, -6, 26, { grade: 'libnight' }); });
  ST('two stamps up', (s, u) => { const lf = reveal(s, LP.high, 'blank'); return cam([2.4, 1.6, -22.5], [0.6, 8.6, -11], 40, { grade: 'libnight', faces: { hero: [[0, 'terror']] } }); });
  // ---- the desk: renewal ----
  const desk = (s, lfPose, lfMood, hp = {}) => { s.mood('night'); const lf = deskLF(s, { pose: lfPose, mood: lfMood }); const h = put(s, 'hero', Object.assign({ p: [2.7, 0, -25.8], ry: -0.75, mood: 'smug' }, hp)); key(s, 'dk', V(3, 4.2, -27), V(0, 12, -32), '#d8ffc8', 160); key(s, 'dkh', V(8, 6, -20), V(2.7, 4, -25.8), '#c8d8ff', 120); return { lf, h }; };
  const nicoOnDesk = (s) => prop(s, 'nb4', () => BOOK.face(Object.assign({ w: 1.6, h: 2.1, d: 0.34 }, BOOK.NICO)), V(-0.6, 3.75, -28.9), [0, 0.45, 0]);
  ST("Here's the thing", (s, u) => { desk(s, LP.high, 'blank', { ry: 0.2, pose: PX.hug }); attach(s, CAST.get('hero').armL, 'nbh2', () => BOOK.face(Object.assign({ w: 1.2, h: 1.6, d: 0.26 }, BOOK.NICO)), [0.5, -2.0, 0.7], [-0.3, 0, 0]); return fc('hero', 7, 0, 4, 28, { grade: 'libnight', faces: { hero: [[0, 'calm'], [0.4, 'smug']] } }); });
  ST('Nobody knows them', (s, u) => { desk(s, LP.high, 'tilt', { ry: 0.2, pose: PX.offerUp }); attach(s, CAST.get('hero').armR, 'cardH', () => LF.card(212, { w: 1.7 }), [0, -2.1, 0.2], [-PI / 2, 0, 0.6]); return fc('hero', 8, -15, 6, 30, { grade: 'libnight', faces: { hero: [[0, 'smug'], [0.5, 'grin']] } }); });
  ST('I put Nico', (s, u) => { desk(s, LP.high, 'blank', { p: [1.4, 0, -26.0], ry: PI - 0.2, pose: PX.push }); nicoOnDesk(s); return cam([6.5, 5.0, -22], [0, 5.6, -29], 30, { grade: 'libnight' }); });
  ST("I'd like to", (s, u) => { desk(s, LP.high, 'tilt', { p: [1.6, 0, -26.0], ry: PI + 0.25, pose: P.open }); nicoOnDesk(s); look('hero', [0, 13, -33], 0.8); return cam([6.5, 3.2, -19.5], [0.2, 9.0, -31], 34, { grade: 'libnight', faces: { hero: [[0, 'grin'], [0.5, 'smug']] } }); });
  ST('She froze', (s, u) => { desk(s, Object.assign({}, LP.high, { head: [0.3, 0, 0.05] }), 'frozen'); nicoOnDesk(s); return fc('latefee', L(7, 5.5, E(u)), 0, -4, 24, { grade: 'libnight', lfStill: true }); });
  ST('She looked at the', (s, u) => { desk(s, Object.assign({}, LP.high, { head: [0.85, -0.3, 0.2] }), 'frozen'); nicoOnDesk(s); return cam([5, 7.6, -22.5], [-0.2, 8.4, -31], 30, { grade: 'libnight' }); });
  ST('She looked at me', (s, u) => { desk(s, Object.assign({}, LP.high, { head: [0.55, 0.6, 0.55] }), 'tilt'); nicoOnDesk(s); return cam([-4.6, 6.6, -22.5], [1.0, 8.0, -30], 30, { grade: 'libnight', faces: { hero: [[0, 'grin']] } }); });
  ST('Then she looked', (s, u) => { desk(s, Object.assign({}, LP.high, { head: [0.9, 0.5, 0.3], body: [0.15, 0, 0] }), 'frozen', { pose: PX.offerUp }); nicoOnDesk(s); attach(s, CAST.get('hero').armR, 'cardH', () => LF.card(212, { w: 1.7 }), [0, -2.1, 0.2], [-PI / 2, 0, 0.6]); return cam([8.5, 4.6, -18.5], [0.6, 7.4, -29], 30, { grade: 'libnight' }); });
  ST('with two hundred', (s, u) => { desk(s, LP.high, 'frozen', { pose: PX.offerUp }); prop(s, 'card', card, V(0.4, 3.78, -28.9), [-PI / 2, 0, 0.2]); return cam([0.6, L(6.0, 5.4, u), -27.2], [0.4, 3.8, -28.9], 20, { grade: 'libnight' }); });
  ST('In a hundred#', (s, u) => { desk(s, { armR: [-2.9, -0.1, -0.2], elbowR: [-0.3, 0, 0], armL: [-0.6, 0, 0.1], head: [0.25, 0, 0.1] }, 'blank'); nicoOnDesk(s); return cam([6, 2.8, -20], [0, 9.6, -31], 34, { grade: 'libnight', faces: { hero: [[0, 'worry'], [0.6, 'grin']] } }); });
  ST('Thunk New', (s, u) => { desk(s, { armR: [L(-2.9, -1.35, E(cl(u * 3))), -0.05, -0.1], elbowR: [L(-0.3, -0.7, E(cl(u * 3))), 0, 0], armL: [-0.6, 0, 0.1], head: [0.6, 0, 0.1] }, 'blank'); nicoOnDesk(s); poof(s, 'th', V(-0.6, 3.8, -28.9), 0.4 + u * 0.4, 0.9, 6);
    return cam([-5, 5.4, -22], [-0.4, 5.6, -29.6], 28, { grade: 'libnight', faces: { hero: [[0, 'shock'], [0.4, 'laugh']] } }); });
  ST('New due date', (s, u) => { s.mood('night'); prop(s, 'nb5', () => BOOK.face(Object.assign({ w: 1.6, h: 2.1, d: 0.34 }, BOOK.NICO)), V(-0.6, 3.75, -28.9), [-PI / 2, 0, 0.45]); mark(s, 'due', 'DUE: +2 WKS', '#7a3ad0', 1.3, 0.6, V(-0.6, 4.12, -28.7), [-PI / 2, 0, 0.45]); key(s, 'dd', V(0, 9, -26), V(-0.6, 4, -28.9), '#fff0d0', 120);
    return cam([-0.2, L(8.0, 7.2, u), -26.4], [-0.6, 4.0, -28.9], 22, { grade: 'libnight' }); });
  ST('And Nico popped', (s, u) => { desk(s, LP.stampDesk, 'frozen'); const n = put(s, 'nicoPJ', { p: [-0.6, 3.75, -28.6], ry: 0.4, mood: 'shock', sc: 1 + 0.4 * (1 - E(cl(u * 2))), pose: PX.jump }); CP.ground(n, 3.8 + 1.2 * Math.sin(PI * cl(u * 1.4))); poof(s, 'pop', V(-0.6, 3.8, -28.6), 0.2 + u * 0.7, 1.4, 3); pages(s, 'p2', V(-0.6, 4.6, -28.6), u);
    return cam([5.5, 6.0, -20.5], [-0.4, 6.4, -29], 30, { grade: 'libnight', lead: 'nicoPJ' }); });
  ST('in his shark', (s, u) => { desk(s, LP.stampDesk, 'tilt'); put(s, 'nicoPJ', { p: [-0.6, 3.75, -28.6], ry: 0.4, mood: 'laugh', pose: P.cheer, ground: 3.8 }); return fc('nicoPJ', 7, 0, 6, 28, { grade: 'libnight', faces: { nicoPJ: [[0, 'laugh'], [0.5, 'grin']] } }); });
  // ---- renewing everyone ----
  ST('Then I renewed', (s, u) => { desk(s, LP.stampDesk, 'blank', { p: [L(6, 3, u), 0, -24.4], ry: -1.1, walk: u * 5, pose: PX.carry, mood: 'strain' }); attach(s, CAST.get('hero').armL, 'arm5', () => { const g = new T.Group(); for (let k = 0; k < 6; k++) { const b = BOOK.face({ w: 1.3, h: 1.7, d: 0.3, cover: ['#8a1e2a', '#1e3a6a', '#2a5a2e', '#6a2a6a', '#8a5a1e', '#1e5a5a'][k], title: ['ROSA', 'BEN', 'AMIR', 'JO', 'LULU', 'MAX'][k], who: BOOK.KID(k + 2) }); b.rotation.x = -PI / 2; b.position.y = k * 0.32; g.add(b); } return g; }, [-0.5, -2.0, 1.0], [0, 0, 0]);
    return cam([9, 4.8, -16], [1.6, 6, -28], 32, { grade: 'libnight' }); });
  ST('on every shelf', (s, u) => { s.mood('night'); const h = put(s, 'hero', { p: [8.6, 6.4 + u, 4.2], ry: 1.57, mood: 'laugh', pose: PX.ladder }); put(s, 'kid3', { p: [5, 0, 6], ry: 0.5, mood: 'laugh', pose: P.cheer }); put(s, 'kid1', { p: [3, 0, 8.5], ry: 0.2, mood: 'grin', pose: P.wave }); key(s, 'sh', V(2, 6, 14), V(8.6, 8, 4), '#c8d8ff', 160);
    return cam([-1.5, 3.6, 16.5], [6, 7.4, 3], 34, { grade: 'libnight' }); });
  ST('Even Mr Dale', (s, u) => { desk(s, LP.stampDesk, 'hum', { p: [5.0, 0, -25], ry: -0.9, mood: 'shock' }); prop(s, 'cbo', cookbook, V(-1.8, 3.76, -28.8), [0, 0.2, 0]); poof(s, 'dp', V(-1.8, 3.8, -28.8), 0.3 + u * 0.5, 1.0, 9); const d = put(s, 'dale', { p: [-1.8, 3.95, -28.6], ry: 0.5, mood: 'laugh', pose: P.cheer, sc: 1 + 0.3 * (1 - E(cl(u * 2))) }); CP.ground(d, 4.1);
    return cam([3.6, 6.0, -19.5], [-1.2, 7.0, -29], 32, { grade: 'libnight', lead: 'dale', faces: { dale: [[0, 'shock'], [0.4, 'laugh']] } }); });
  ST('He smelled like', (s, u) => { desk(s, LP.stampDesk, 'hum', { p: [2.6, 0, -25.4], ry: -0.4, mood: 'strain', keep: true, pose: PX.nose }); put(s, 'dale', { p: [-1.8, 3.95, -28.6], ry: 0.6, mood: 'grin', pose: PX.hipsL, ground: 4.1 });
    return cam([7.8, 5.2, -18.5], [0.4, 5.6, -27], 30, { grade: 'libnight', lead: 'dale', faces: { hero: [[0, 'strain']] } }); });
  ST('Nine hours', (s, u) => { desk(s, LP.stampDesk, 'blank', { p: [3.4, 0, -25.4], ry: -0.5, mood: 'sleepy', pose: PX.yawn }); for (let i = 0; i < 10; i++) prop(s, 'stk' + i, () => BOOK.face({ w: 1.4, h: 1.85, d: 0.3, cover: ['#8a1e2a', '#1e3a6a', '#2a5a2e', '#6a2a6a', '#8a5a1e'][i % 5], title: '', who: BOOK.KID(i + 6) }), V(-4.5 + (i % 2) * 0.3, 3.76 + i * 0.31, -28.8), [-PI / 2, 0, i * 0.3]);
    return cam([7.4, 6.2, -17.5], [-0.8, 7, -29], 32, { grade: 'libnight', faces: { hero: [[0, 'sleepy']] } }); });
  ST('She stamped every', (s, u) => { const ph = (u * 4) % 1; desk(s, { armR: [L(-2.6, -1.35, Math.sin(ph * PI)), -0.05, -0.1], elbowR: [-0.6, 0, 0], armL: [L(-1.4, -2.4, Math.sin(ph * PI)), 0.1, 0.2], elbowL: [-0.6, 0, 0], head: [0.55, 0, 0.1] }, 'blank', { p: [3.6, 0, -25.4] }); poof(s, 'k1', V(-1.0, 3.8, -28.8), ph, 1.0, 11); put(s, 'kid4', { p: [-6, 0, -25], ry: 0.6, mood: 'laugh', pose: P.cheer });
    return cam([1.4, 6.6, -20], [-0.4, 8.0, -30], 34, { grade: 'libnight', lead: 'kid4' }); });
  ST('and by the', (s, u) => { desk(s, LP.read, 'hum'); return fc('latefee', 8.5, 20, -2, 28, { grade: 'libnight' }); });
  // ================= NOW =================
  ST('Now nobody here', (s, u) => { s.mood('morning'); [['crowd3', -6, -8, 1.57, 'laugh'], ['pjdad', -2, -7.4, 1.57, 'grin'], ['mom', 2, -8.4, 1.4, 'laugh'], ['crowd11', 6, -7.6, -1.57, 'calm']].forEach(([n, x, z, ry, m], i) => { put(s, n, { p: [x + L(0, 2.4, u) * Math.sin(ry), Y, z], ry, walk: u * 5 + i, mood: m }); if (n !== 'mom') attach(s, CAST.get(n).armL, 'nb' + n, () => BOOK.plain({ cover: ['#e84040', '#2a8ad8', '#f2c01a', '#38a060'][i], title: 'RENEWED', w: 1.0, h: 1.3, d: 0.22 }), [0, -2.0, 0.5], [-0.3, 0, 0]); });
    return cam([2, 6.0, 15], [0, 6.0, -10], 38, { grade: 'morning', lead: 'mom' }); });
  ST('We just renew', (s, u) => { s.mood('day'); deskLF(s, { n: 'latefeeKind', pose: LP.stampDesk, mood: 'kind' }); [['kid1', 1.4, -25.6], ['kid2', 2.4, -23.4], ['kid3', 3.2, -21.2], ['heroBook', 4.2, -19]].forEach(([n, x, z], i) => put(s, n, { p: [x, 0, z], ry: PI + 0.2, mood: ['laugh', 'grin', 'laugh', 'smug'][i] })); key(s, 'wd', V(6, 8, -20), V(0, 9, -32), '#fff0d0', 100);
    return cam([-4.5, 5.0, -17], [1.0, 6.4, -28], 32, { grade: 'story', lead: 'kid2' }); });
  const story = (s, mood, pose, extra) => { s.mood('day'); const c = s.corner.position; const lf = put(s, 'latefeeKind', { p: [c.x, 0, c.z - 4.6], ry: 0, pose, mood, sitK: 0.62 }); const pb = attach(s, lf.elbowR, 'pbk', () => BOOK.plain({ cover: '#f2c01a', title: 'THE HUNGRY BEAR', w: 2.4, h: 3.0, d: 0.25 }), [0, -2.6, 1.0], [0, PI, 0]);
    const cp0 = [c.x + 0.4, 4.6, c.z + 25]; [['kid1', -3.4, 0.6, 0.75, 'laugh'], ['kid2', -1.4, 2.6, 0.25, 'shock'], ['kid3', 1.4, 2.6, -0.25, 'laugh'], ['kid4', 3.4, 0.6, -0.75, 'grin']].forEach(([n, x, z, ry, m]) => { put(s, n, { p: [c.x + x, 0, c.z + z], ry, mood: m, pose: PX.sitFloor }); look(n, cp0, 0.6); }); return c; };
  ST('On Fridays the', (s, u) => { const c = story(s, 'kind', LP.read); return cam([c.x + L(2, 0, u), 6.6, c.z + 27], [c.x, 5.0, c.z - 1], 34, { grade: 'story', lead: 'kid3' }); });
  ST('reads picture books', (s, u) => { const c = story(s, 'hum', LP.read); return fc('latefeeKind', 10, -40, 4, 30, { grade: 'story' }); });
  ST('She does all', (s, u) => { const c = story(s, 'voices', LP.voices); return cam([c.x + 2, 4.0, c.z + 16], [c.x, 6.0, c.z - 2], 34, { grade: 'story', lead: 'kid1', mood: 'laugh' }); });
  ST('She even gave', (s, u) => { const c = story(s, 'kind', { armL: [-1.35, 0.3, 0.05], elbowL: [-0.4, 0, 0], armR: [-0.6, 0, -0.2] }); put(s, 'heroSticker', { p: [c.x + 2.6, 0, c.z - 1.2], ry: -0.9, mood: 'grin', pose: PX.offer });
    return cam([c.x + 4, 5.6, c.z + 12], [c.x + 1.2, 6.0, c.z - 2.5], 32, { grade: 'story', faces: { heroSticker: [[0, 'shock'], [0.45, 'laugh']] } }); });
  ST('that says GOOD', (s, u) => { s.mood('day'); const h = put(s, 'heroSticker', { p: [0, 0, 8], ry: 0.1, mood: 'smug', pose: P.cheer }); h.root.updateMatrixWorld(true); const p = h.sticker.getWorldPosition(V(0, 0, 0));
    return cam([p.x + 0.4, p.y + 0.2, p.z + L(4.6, 3.8, u)], [p.x, p.y - 0.9, p.z], 24, { grade: 'story', f: p.toArray(), faces: { heroSticker: [[0, 'smug']] } }); });
  ST('I finally finished', (s, u) => { s.mood('day'); put(s, 'heroBook', { p: [-6, 0, -6], ry: 0.2, mood: 'laugh', pose: u < 0.5 ? PX.sitRead : Object.assign({}, PX.sitRead, { armL: [-2.6, 0, 0.3], armR: [-2.6, 0, -0.3] }), ground: 1.4 });
    return fc('heroBook', 7.5, 15, 6, 28, { grade: 'day', faces: { heroBook: [[0, 'calm'], [0.5, 'laugh']] } }); });
  ST('I renewed it', (s, u) => { s.mood('day'); deskLF(s, { n: 'latefeeKind', pose: { armR: [L(-2.6, -1.35, E(cl(u * 2))), -0.05, -0.1], elbowR: [-0.6, 0, 0], armL: [-0.5, 0, 0.1] }, mood: 'kind' }); put(s, 'heroBook', { p: [1.8, 0, -25.8], ry: -0.5, mood: 'smug', pose: PX.offer }); key(s, 'wd', V(6, 8, -20), V(0, 9, -32), '#fff0d0', 100);
    return cam([7.6, 5.0, -19.5], [0.4, 6.4, -28.5], 32, { grade: 'story', faces: { heroBook: [[0, 'smug'], [0.5, 'grin']] } }); });
  ST('And every two', (s, u) => { s.mood('morning'); const x = L(4, -2, u); put(s, 'hero', { p: [x, Y, -8.0], ry: -PI / 2, walk: u * 5, mood: 'grin' }); put(s, 'nico', { p: [x + 2.2, Y, -7.2], ry: -PI / 2, walk: u * 5 + 1.5, mood: 'laugh' });
    return orb(V(x + 1, 3.4, -7.6), 15, 25, 6, 30, { grade: 'morning' }); });
  ST('She stamps his', (s, u) => { s.mood('day'); deskLF(s, { n: 'latefeeKind', pose: { armR: [L(-2.2, -1.25, E(cl(u * 1.8))), -0.1, -0.1], elbowR: [-0.5, 0, 0], armL: [-0.4, 0, 0.1], head: [0.5, 0, 0.1] }, mood: 'kind' }); const n = put(s, 'nico', { p: [0.4, 3.75, -29.0], ry: 0.2, mood: 'calm', ground: 3.8, pose: P.open }); key(s, 'wd', V(6, 8, -20), V(0, 9, -32), '#fff0d0', 100);
    return cam([6.4, 5.4, -20], [0.2, 7.0, -30], 30, { grade: 'story', lead: 'nico', faces: { nico: [[0, 'calm'], [0.55, 'laugh']] } }); });
  ST('and he giggles', (s, u) => { s.mood('day'); deskLF(s, { n: 'latefeeKind', pose: LP.read, mood: 'hum' }); const n = put(s, 'nico', { p: [0.4, 3.75, -29.0], ry: 0.2, mood: 'laugh', ground: 3.8, pose: P.handsHead }); attach(s, n.head, 'fh', () => LF.mark('DUE', '#7a3ad0', 0.62, 0.36, -0.1), [0, 0.36, 0.62], [0, 0, 0]);
    return fc('nico', 5, 10, 4, 26, { grade: 'story', faces: { nico: [[0, 'laugh'], [0.5, 'grin']] } }); });
  ST("He's due back", (s, u) => { s.mood('day'); deskLF(s, { n: 'latefeeKind', pose: { armR: [-2.7, 0, -0.6], elbowR: [-0.3, 0, 0], armL: [-0.4, 0, 0.1] }, mood: 'kind' }); const n = put(s, 'nico', { p: [0.4, 3.75, -29.0], ry: 0.2, mood: 'laugh', ground: 3.8, pose: P.wave }); attach(s, n.head, 'fh', () => LF.mark('DUE', '#7a3ad0', 0.62, 0.36, -0.1), [0, 0.36, 0.62], [0, 0, 0]);
    put(s, 'heroSticker', { p: [2.8, 0, -25.8], ry: -0.4, mood: 'laugh', pose: P.waveL }); key(s, 'wd', V(6, 8, -20), V(0, 9, -32), '#fff0d0', 100);
    return cam([L(7, 6, u), 5.4, L(-16.5, -18, u)], [0.6, 6.8, -29], 32, { grade: 'story', faces: { heroSticker: [[0, 'laugh'], [0.5, 'grin']] } }); });
})();
