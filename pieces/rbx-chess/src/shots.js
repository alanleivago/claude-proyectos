// rbx-chess staging: one function per SHOTLIST row (keyed by its first words). fn(set, u, shot) places the cast and
// props and returns the camera { p, l, fov, roll(deg), f(focus point), grade, post, lead, zoom, widen }.
'use strict';
const STAGES = {};
(function () {
  const L = (a, b, u) => ENG.lerp(a, b, u), E = (u) => ENG.ease(u), PI = Math.PI;
  const put = (s, name, o) => CAST.put(s.scene, name, o);
  const ST = (k, f) => { STAGES[k] = f; };
  const C = {}; const once = (k, f) => C[k] || (C[k] = f());
  const addC = (s, k, f, pos, ry = 0, rx = 0, rz = 0, sc = 1) => { const o = once(k, f); o.position.set(...pos); o.rotation.set(rx, ry, rz); o.scale.setScalar(sc); return ENG.add(s.scene, o); };
  const lamp = (s, key, pos, col, I, dist = 8) => { const o = once('lamp|' + key, () => new THREE.PointLight(col, I, dist, 2)); o.color.set(col); o.intensity = I; o.distance = dist; o.position.set(...pos); return ENG.add(s.scene, o); };
  const SQ = 16, FX = (f) => -56 + SQ * f, RZ = (r) => 56 - SQ * (r - 1);
  const SIT = { legL: [-PI / 2, 0, 0], legR: [-PI / 2, 0, 0] };
  const JUMP = { armL: [-2.7, 0, 0.35], armR: [-2.7, 0, -0.35], legL: [-1.3, 0, 0], legR: [0.5, 0, 0] };
  const LAND = { armL: [-0.6, 0, 1.1], armR: [-0.6, 0, -1.1], legL: [-0.7, 0, 0.1], legR: [0.5, 0, -0.1], body: [0.3, 0, 0] };
  const GUARD = { armL: [-0.2, 0, 1.45], armR: [-0.2, 0, -1.45] };
  const STIFF = { armL: [0, 0, 0.04], armR: [0, 0, -0.04] };
  const W = CAST.POSE.walk;
  // local (dad/cart frame, facing ry) -> world
  const tw = (p, ry, lx, ly, lz) => [p[0] + Math.cos(ry) * lx + Math.sin(ry) * lz, p[1] + ly, p[2] - Math.sin(ry) * lx + Math.cos(ry) * lz];
  const arc = (a, b, u, h) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 4 * h * u * (1 - u), a[2] + (b[2] - a[2]) * u];
  const yawTo = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);
  const top = (T, h, yaw = 0, fov = 50) => ENG.orbit(T, h, yaw, 84, fov);   // near-top-down (84 deg) over T

  // ---------------- glowing move paths on the squares ----------------
  const glowM = (col, k = 1.6) => once('glowM' + col + k, () => new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0.9, depthWrite: false }));
  const path = (s, key, pts, col = '#ffd23a', o = {}) => ENG.add(s.scene, once('path|' + key, () => {
    const g = new THREE.Group(), w = o.w || 1.6, y = o.y ?? 0.14, m = glowM(col), dash = o.dash || 0;
    for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), last = i + 2 === pts.length, end = last && o.arrow !== false ? len - 2.6 : len;
      const step = dash ? dash * 2 : end, seg = dash || end; for (let t = 0; t < end - 0.01; t += step) { const l = Math.min(seg, end - t), me = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, l + (dash ? 0 : w * 0.5)), m); me.position.set(a[0] + dx / len * (t + l / 2), y, a[1] + dz / len * (t + l / 2)); me.rotation.y = Math.atan2(dx, dz); me.renderOrder = 6; g.add(me); }
      if (last && o.arrow !== false) { const sh = new THREE.Shape([new THREE.Vector2(-w * 1.6, 0), new THREE.Vector2(w * 1.6, 0), new THREE.Vector2(0, 3.2)]), ar = new THREE.Mesh(new THREE.ShapeGeometry(sh), m); ar.rotation.order = 'YXZ'; ar.rotation.set(-PI / 2, Math.atan2(dx, dz), 0); ar.position.set(b[0] - dx / len * 3.0, y, b[1] - dz / len * 3.0); ar.renderOrder = 6; g.add(ar); } }
    return g; }));
  const sqGlow = (s, key, x, z, col = '#ffd23a', w = 0.7) => ENG.add(s.scene, once('sq|' + key, () => { const g = new THREE.Group(), m = glowM(col);
    [[0, -8, 16, w], [0, 8, 16, w], [-8, 0, w, 16], [8, 0, w, 16]].forEach(([dx, dz, a, b]) => { const me = new THREE.Mesh(new THREE.BoxGeometry(a, 0.1, b), m); me.position.set(x + dx, 0.15, z + dz); g.add(me); });
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), once('sqFill' + col, () => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false }))); fill.rotation.x = -PI / 2; fill.position.set(x, 0.12, z); g.add(fill); return g; }));
  const star = (s, key, c, len, col = '#ffd23a', dirs = 8) => { for (let i = 0; i < dirs; i++) { const a = i * PI * 2 / dirs, r0 = 3.2; path(s, key + i, [[c[0] + Math.sin(a) * r0, c[2] + Math.cos(a) * r0], [c[0] + Math.sin(a) * (len + r0), c[2] + Math.cos(a) * (len + r0)]], col, { y: (c[1] || 0) + 0.14 }); } };

  // ---------------- props built here ----------------
  const cartObj = () => once('cart', () => { const g = new THREE.Group(), T = THREE, SM = (o) => new T.MeshStandardMaterial(o);
    const yel = SM({ color: '#f6c21c', roughness: 0.45 }), blk = SM({ color: '#1b1b1d', roughness: 0.5 }), wood = SM({ color: '#6a4222', roughness: 0.7 }), red = SM({ color: '#8a1c22', roughness: 0.8 });
    const chk = (() => { const c = RBX.cnv(256, 64), q = c.getContext('2d'); q.fillStyle = '#f6c21c'; q.fillRect(0, 0, 256, 64); q.fillStyle = '#141414'; for (let i = 0; i < 16; i++) { q.fillRect(i * 16, (i % 2) * 32, 16, 32); } return SM({ map: RBX.tex(c), roughness: 0.5 }); })();
    const B = (w, h, d, m, x, y, z) => { const me = new T.Mesh(RBX.rbox(w, h, d, 0.12, 4), m); me.position.set(x, y, z); g.add(me); return me; };
    B(4.4, 0.5, 2.6, yel, 0, 2.2, 0); B(4.4, 2.4, 0.4, chk, 0, 3.4, -1.2); B(4.0, 0.3, 2.2, red, 0, 2.55, 0.1); B(0.3, 1.2, 2.4, yel, 2.1, 3.0, 0); B(0.3, 1.2, 2.4, yel, -2.1, 3.0, 0);
    [-1, 1].forEach((s) => { const wh = new T.Mesh(new T.TorusGeometry(1.5, 0.22, 10, 24), blk); wh.rotation.y = PI / 2; wh.position.set(s * 2.55, 1.6, -0.2); g.add(wh);
      for (let k = 0; k < 6; k++) { const sp = new T.Mesh(new T.BoxGeometry(0.08, 2.9, 0.08), wood); sp.position.copy(wh.position); sp.rotation.x = k * PI / 6; g.add(sp); }
      const sh = new T.Mesh(new T.BoxGeometry(0.22, 0.22, 4.6), wood); sh.position.set(s * 1.25, 2.4, 3.2); sh.rotation.x = 0.12; g.add(sh); });
    const sg = (() => { const c = RBX.cnv(256, 96), q = c.getContext('2d'); q.fillStyle = '#ffd23a'; q.fillRect(0, 0, 256, 96); q.font = '900 60px "Arial Black", sans-serif'; q.fillStyle = '#141414'; q.textAlign = 'center'; q.fillText('TAXI', 128, 72); return SM({ map: RBX.tex(c), emissive: new T.Color('#ffffff'), emissiveIntensity: 0.3, roughness: 0.4 }); })();
    sg.emissiveMap = sg.map; B(2.4, 0.9, 0.2, sg, 0, 5.1, -1.2);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; });
  // taxi: cart at p facing ry; rook between the shafts, passengers on the bench
  const taxi = (s, p, ry, o = {}) => { const c = ENG.add(s.scene, cartObj()); c.position.set(...p); c.rotation.set(0, ry, 0);
    const rk = o.rook || 'rook'; put(s, rk, { p: tw(p, ry, 0, 0, 4.9), ry, face: o.rface || 'determined', pose: o.rpose || (o.run ? Object.assign(W(o.ph || 0), { armL: [-0.7, 0, 0.12], armR: [-0.7, 0, -0.12] }) : { armL: [-0.7, 0, 0.12], armR: [-0.7, 0, -0.12] }) });
    (o.pass || ['pawn2', 'pawn5']).forEach((n, i) => put(s, n, { p: tw(p, ry, i ? -1.05 : 1.05, 0.55, 0.1), ry, face: (o.pface || [])[i] || 'smile', pose: Object.assign({}, SIT, (o.ppose || [])[i] || { armL: [-0.4, 0, 0.1], armR: [-0.4, 0, -0.1] }) })); };
  const crown = (s, k = 1) => { const h = CAST.get('hero'), c = once('heroCrown', () => { const g = CHESS.queenCrown(); return g; }); h.head.add(c); c.position.set(0, 0.98, -0.05); c.rotation.set(-0.15, 0, 0); c.scale.setScalar(0.62 * k); ENG.extras.push(c); return c; };
  const glowTex = () => once('glowTex', () => { const c = RBX.cnv(256, 256), q = c.getContext('2d'), g = q.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,240,190,1)'); g.addColorStop(0.3, 'rgba(255,200,90,0.6)'); g.addColorStop(1, 'rgba(255,160,40,0)'); q.fillStyle = g; q.fillRect(0, 0, 256, 256); return RBX.tex(c); });
  const glow = (s, key, pos, sc, op = 1) => { const sp = once('glow|' + key, () => new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }))); sp.material.opacity = op; sp.position.set(...pos); sp.scale.setScalar(sc); return ENG.add(s.scene, sp); };
  const beamDown = (s, key, pos, w, len, k = 0.15) => { const b = once('beam|' + key, () => RBX.beam(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0.001), w, w, len, RBX.beamMat('#ffe0a0', k))); b.position.set(...pos); return ENG.add(s.scene, b); };

  // ---------------- set prep ----------------
  const K = (s, m = 'day') => { s.mood(m); };
  const night = (s) => { s.mood('gamenight'); };
  const H0 = [8, 0, -35];          // hero's yard (e7)
  const BOX = [-122, -7, -10];     // the Box on the table
  // gamenight street: citizens frozen on their squares, looking up
  const frozen = (s, skip = []) => [['pawn0', FX(1), -36, 0.2], ['pawn1', FX(2) + 2, -29, PI - 0.3], ['pawn3', FX(5), -36.5, -0.2], ['pawn4', FX(6) - 1, -29, PI + 0.3], ['pawn6', FX(3), -36, 0.3], ['pawn7', FX(0) + 3, -29.5, PI], ['baker', FX(4) + 3.6, -27.2, PI], ['aunt', -22, -28, PI / 2], ['uncle', -10, -28, -PI / 2]]
    .filter(([n]) => !skip.includes(n)).forEach(([n, x, z, ry]) => put(s, n, { p: [x, 0, z], ry, face: 'scared', pose: Object.assign({ head: [-0.45, 0, 0] }, STIFF) }));

  // ================= the rule of the world =================
  ST('In this kingdom', (s, u) => { K(s); s.props.setRoom(true); s.props.setFog(0.6);
    return { p: L([190, 150, 150], [150, 115, 120], E(u)), l: [-20, -20, -20], fov: 46, post: { aperture: 0 } }; });
  ST('you can only move', (s, u) => { K(s);   // fountain square, ranks 3-5
    put(s, 'rook2', { p: [FX(2), 0, RZ(4) + 2], ry: PI / 2, face: 'neutral' }); path(s, 'rk1', [[FX(2) + 3, RZ(4) + 2], [FX(2) + 30, RZ(4) + 2]], '#ffd23a');
    put(s, 'aunt', { p: [FX(5), 0, RZ(4)], ry: PI * 0.75, face: 'lashes' }); path(s, 'bi1', [[FX(5) - 2.4, RZ(4) - 2.4], [FX(5) - 22, RZ(4) - 22]], '#c89cff');
    put(s, 'pawn3', { p: [FX(3), 0, RZ(3)], ry: PI, face: 'neutral' }); path(s, 'pw1', [[FX(3), RZ(3) - 3], [FX(3), RZ(3) - 15]], '#7fe08a');
    return top([FX(3) + 2 - 4 * u, 0, RZ(4) + 2], 46 - 5 * E(u), 0, 50); });
  ST('Rooks are the taxis', (s, u) => { K(s); const p = [FX(6) - 20 + 9 * u, 0, -31.5]; taxi(s, p, PI / 2, { run: true, ph: u * 4 });
    return { p: [p[0] + 13, 3.6, -27.4], l: [p[0] + 1, 3.6, p[2]], fov: 46, lead: 'rook' }; });
  ST('straight lines only', (s, u) => { K(s); const p = [FX(1) + 6 + 14 * u, 0, -31.5]; taxi(s, p, PI / 2, { run: true, ph: u * 5 }); path(s, 'taxi1', [[FX(1) + 12, -31.5], [FX(4) + 4, -31.5]], '#ffd23a');
    return top([p[0] + 5, 0, -31.5], 22, -90, 50); });
  ST('Fastest ride in the', (s, u) => { K(s); const p = [FX(3) - 14 + 22 * u, 0, -31]; taxi(s, p, PI / 2, { run: true, ph: u * 6, pface: ['happy', 'surprised'], ppose: [{ armL: [-2.6, 0, 0.3], armR: [-1.0, 0, 0] }, { armL: [-0.9, 0, 0.2], armR: [-2.4, 0, -0.4] }] });
    return { p: [FX(3) + 6, 1.0, -36], l: [p[0] + 2, 3.0, -31], fov: 52, roll: -10, lead: 'pawn2' }; });
  ST('as long as you', (s, u) => { K(s); const p = [FX(6) - 4, 0, -31]; taxi(s, p, PI / 2, { rface: 'neutral', rpose: CAST.POSE.shrug, pface: ['angry', 'worried'], ppose: [{ armR: [-1.6, 0, -0.9] }, {}] });
    return { p: [p[0] + 12, 5.0, p[2] + 7], l: [p[0] + 1, 3.6, p[2]], fov: 46, lead: 'rook' }; });
  // ================= the bishops =================
  const AU = [-19, 0, -29], UN = [-13, 0, -29];   // c6 light / d6 dark, either side of the brass line x=-16
  ST('My aunt is a', (s, u) => { K(s); put(s, 'aunt', { p: AU, ry: 0.5, face: 'lashes', pose: CAST.POSE.wave }); sqGlow(s, 'c6', FX(2), RZ(6), '#fff3c8');
    return Object.assign(ENG.face('aunt', 7.0 - 1.2 * E(u), -20, 4, 44), { lead: 'aunt' }); });
  ST('She married a black', (s, u) => { K(s); put(s, 'uncle', { p: UN, ry: -0.5, face: 'smile', pose: CAST.POSE.waveL }); put(s, 'aunt', { p: AU, ry: 0.5, face: 'lashes' }); sqGlow(s, 'd6', FX(3), RZ(6), '#c89cff');
    return Object.assign(ENG.face('uncle', 7.4 - 1.2 * E(u), 20, 4, 44), { lead: 'uncle' }); });
  ST('They\'ve never held hands', (s, u) => { K(s); put(s, 'aunt', { p: [-18.4, 0, -29], ry: PI / 2, face: 'lashes', pose: { armL: [-1.5, 0, 0.1], armR: [-1.5, 0, -0.1] } }); put(s, 'uncle', { p: [-13.6, 0, -29], ry: -PI / 2, face: 'worried', pose: { armL: [-1.5, 0, 0.1], armR: [-1.5, 0, -0.1] } });
    sqGlow(s, 'c6b', FX(2), RZ(6), '#fff3c8'); sqGlow(s, 'd6b', FX(3), RZ(6), '#c89cff');
    return top([-16, 0, -27], 30 - 4 * E(u), 0, 50); });
  ST('They wave', (s, u) => { K(s); put(s, 'aunt', { p: AU, ry: 0.45, face: 'lashes', pose: CAST.POSE.wave }); put(s, 'uncle', { p: UN, ry: -0.45, face: 'smile', pose: CAST.POSE.waveL });
    return { p: [-16, 4.6, -15 - 2 * E(u)], l: [-16, 4.4, -29], fov: 50, lead: 'aunt' }; });
  // ================= game night =================
  ST('And every Sunday', (s, u) => { night(s); s.props.openLid(0); frozen(s); put(s, 'hero', { p: [FX(4) + 2, 0, -33], ry: PI / 2 + 0.3, face: 'scared', pose: CAST.POSE.lookUp });
    lamp(s, 'sun1', [FX(4) + 6, 8, -30], '#ffc890', 90, 18); lamp(s, 'sun2', [FX(2), 10, -32], '#8fa0ff', 120, 30);
    return { p: L([FX(4) + 9, 5, -30], [FX(4) + 8, 4.6, -30.5], E(u)), l: [FX(2), 8, -33], fov: 56, grade: 'gamenight', post: { exposure: 2.0 }, lead: 'hero' }; });
  ST('The clouds slide back', (s, u) => { night(s); s.props.openLid(0.15 + 0.85 * E(u)); const c = s.props.lid.c;
    return { p: [c.x + 30, 4, c.z + 4], l: [c.x - 10, 150, c.z - 10], fov: 60, grade: 'gamenight', post: { aperture: 0 } }; });
  ST('A hand comes down', (s, u) => { night(s); const c = s.props.lid.c; s.props.handAt([c.x - 4, 100 - 46 * E(u), c.z], { pinch: 0.2, yaw: PI / 2, tilt: 0.3 });
    frozen(s); return { p: [c.x + 44, 4, c.z + 1], l: [c.x - 4, 66 - 16 * u, c.z], fov: 62, grade: 'gamenight', post: { aperture: 0.2 } }; });
  ST('and it drops one', (s, u) => { night(s); const b = [BOX[0], 46, BOX[2]]; s.props.handAt([b[0], b[1] + 8, b[2]], { pinch: 0.9 - 0.7 * E(Math.min(1, Math.max(0, u * 2 - 0.6))), yaw: PI / 2, tilt: 0.15 });
    const fall = Math.max(0, u - 0.45) / 0.55; put(s, 'pawn4', { p: [b[0], b[1] + 8 - 6.0 - 14 * fall * fall, b[2]], ry: 1.2, face: 'scared', pose: { armL: [-2.8, 0, 0.4], armR: [-2.8, 0, -0.4], legL: [-0.4, 0, 0], legR: [0.3, 0, 0] } });
    lamp(s, 'drop', [b[0] + 16, b[1] + 6, b[2] + 16], '#ffd0a0', 600, 60); lamp(s, 'drop2', [b[0] + 30, 30, b[2] + 30], '#8090d0', 900, 80);
    return { p: [b[0] + 44, 40, b[2] + 44], l: [b[0], 30, b[2]], fov: 52, grade: 'gamenight', lead: 'pawn4' }; });
  ST('Nothing comes back out', (s, u) => { K(s); return { p: L([BOX[0] + 44, -5, BOX[2] + 40], [BOX[0] + 38, -5.5, BOX[2] + 33], E(u)), l: [BOX[0], 18, BOX[2]], fov: 54, post: { exposure: 0.85 } }; });
  // ================= dad =================
  ST('My dad\'s a knight', (s, u) => { K(s, 'morning'); put(s, 'dad', { p: [H0[0] + 2, 0, -32], ry: -PI / 2 + 0.2, face: 'smile', pose: { armL: [-0.2, 0, 0.2], armR: [-0.2, 0, -0.2] } });
    return Object.assign(ENG.face('dad', 7.5 - 1.2 * E(u), 15, 2, 44), { grade: 'morning', lead: 'dad' }); });
  const LA = [FX(1) + 2, 0, RZ(3) + 4], LB = [FX(3), 0, RZ(3) + 4], LC = [FX(3), 0, RZ(4) + 4];   // L: two over (+x), one up (-z)
  ST('He moves in an', (s, u) => { K(s, 'morning'); path(s, 'L1', [[LA[0], LA[2]], [LB[0], LB[2]], [LC[0], LC[2]]], '#ffb43a', { w: 2.0 });
    const k = E(u), q = k < 0.66 ? arc(LA, LB, k / 0.66, 9) : arc(LB, LC, (k - 0.66) / 0.34, 5); put(s, 'dad', { p: q, ry: k < 0.66 ? PI / 2 : PI, face: 'happy', pose: JUMP });
    return Object.assign(top([FX(2) + 2, 0, RZ(3) - 2], 66, 0, 50), { grade: 'morning', lead: 'dad' }); });
  ST('and he can jump', (s, u) => { K(s, 'morning'); const a = [FX(2) - 4, 0, -35], b = [FX(3) - 4, 0, -35], q = arc(a, b, 0.15 + 0.4 * u, 16);   // over the c7 cottage
    q[2] = -43; put(s, 'dad', { p: q, ry: PI / 2, face: 'happy', pose: JUMP });
    return { p: [q[0] + 1, 2, -29], l: [q[0], q[1] + 2, -43], fov: 54, grade: 'morning', roll: 8, lead: 'dad' }; });
  ST('So some mornings he', (s, u) => { K(s, 'morning'); const r = s.marks.p_bakery_roof.p, a = [r[0] - 22, r[1] + 2, r[2] - 8], k = Math.min(1, E(u) * 1.25), q = arc(a, r, k, 10);
    put(s, 'dad', { p: q, ry: yawTo(a, r), face: 'happy', pose: k < 1 ? JUMP : LAND }); put(s, 'baker', { p: s.marks.p_baker_door.p, ry: PI, face: 'closed', pose: { armL: [-1.2, 0, -0.3], armR: [-1.2, 0, 0.3] } });
    return { p: [r[0] + 10, r[1] + 2, -33], l: [r[0] - 4, r[1] + 3, r[2]], fov: 54, grade: 'morning', lead: 'dad' }; });
  // ================= the hero =================
  ST('I\'m a pawn', (s, u) => { K(s, 'morning'); put(s, 'hero', { p: H0, ry: 0.15, face: 'neutral' });
    return Object.assign(ENG.face('hero', 6.0 - 1.4 * E(u), 12, 0, 42, 0, -0.9), { grade: 'morning', lead: 'hero' }); });
  ST('One square a day', (s, u) => { K(s, 'morning'); const k = E(Math.min(1, u * 1.6)); put(s, 'hero', { p: [H0[0], 0, -36 + 6 * k], ry: 0, face: 'determined', pose: k < 1 ? W(u * 6) : {} });
    sqGlow(s, 'e6one', FX(4), RZ(6) - 4.5, '#7fe08a'); path(s, 'one', [[H0[0], -33], [H0[0], -27]], '#7fe08a', { w: 1.4 });
    return Object.assign(top([H0[0], 0, -31], 34, 0, 48), { grade: 'morning', lead: 'hero' }); });
  ST('I\'m on row seven', (s, u) => { K(s, 'morning'); put(s, 'hero', { p: [61, 0, -36], ry: 1.2, face: 'smile', pose: CAST.POSE.point });
    return { p: L([75, 7.5, -40], [74, 7.0, -40], E(u)), l: [67.5, 1.2, -40], fov: 46, widen: 1.2, roll: 0.01, grade: 'morning', f: [68.5, 0.9, -40], lead: 'hero' }; });
  ST('Dad never could walk', (s, u) => { K(s, 'morning'); put(s, 'hero', { p: [H0[0] - 1.5, 0, -35.5], ry: 1.1, face: 'neutral', pose: { head: [-0.25, 0, 0] } });
    put(s, 'dad', { p: [H0[0] + 2.2, 0, -36], ry: -0.7, face: 'worried', pose: { head: [0.3, 0, 0], armL: [-0.3, 0, 0.1] } });
    return { p: L([H0[0] + 9, 5.6, -29], [H0[0] + 7.5, 5.4, -30], E(u)), l: [H0[0] + 0.3, 4.8, -36], fov: 50, grade: 'morning', lead: 'dad' }; });
  const SA = [FX(4), 0, RZ(5) + 2], SB = [FX(5) + 4, 0, RZ(5) + 2];   // dad's flashback jump toward school
  ST('Jump', (s, u) => { K(s, 'morning'); const k = E(u), q = arc(SA, SB, Math.min(1, k * 1.3), 9); put(s, 'dad', { p: q, ry: PI / 2, face: 'happy', pose: k * 1.3 < 1 ? JUMP : LAND });
    put(s, 'hero', { p: [SA[0] + 2 * u, 0, SA[2] + 2], ry: PI / 2, face: 'neutral', pose: W(u * 4) });
    return { p: [SA[0] - 7, 7, SA[2] + 16], l: [SA[0] + 9, 5, SA[2] - 1], fov: 50, grade: 'morning', lead: 'dad' }; });
  ST('wait for me', (s, u) => { K(s, 'morning'); put(s, 'dad', { p: SB, ry: -PI / 2, face: 'tired', pose: CAST.POSE.crossed }); put(s, 'hero', { p: [SA[0] - 2 + 4 * u, 0, SA[2] + 1], ry: PI / 2, face: 'determined', pose: W(u * 4) });
    sqGlow(s, 'wait', FX(4), RZ(5), '#7fe08a'); return Object.assign(top([FX(5), 0, RZ(5) + 2], 44 + 10 * u, 0, 50), { grade: 'morning', lead: 'dad' }); });
  // ================= the rulebook =================
  const RB = (s) => { const t = s.props.rulebook.userData.top; s.props.rulebook.updateMatrixWorld(true); return t; };
  const RBW = (s, x, y, z) => RB(s).localToWorld(new THREE.Vector3(x, y, z)).toArray();
  ST('However tiny print at', (s, u) => { K(s); const t = RBW(s, 0, 0.2, 0); const h = RBW(s, 2.6, 0, 3.0); put(s, 'hero', { p: [h[0], 0, h[2]], ry: 0.5 + PI + 0.5, face: 'neutral', pose: { head: [0.35, 0, 0] } });
    return { p: L(RBW(s, -1.5, 6.5, 7), RBW(s, -0.6, 4.4, 4.0), E(u)), l: t, fov: 50, lead: 'hero' }; });
  ST('If a pawn reaches', (s, u) => { K(s); const t = RBW(s, 0.86, 0.2, 0.92); const t2 = RBW(s, 0.62, 0.2, 0.87); return { p: RBW(s, 0.62, 3.6 - 0.3 * E(u), 0.4 + 0.15 * E(u)), l: t2, fov: 26, widen: 1.0, f: t2, roll: 180 }; });
  ST('it can become anything', (s, u) => { K(s); const h = RBW(s, 0, 0, 4.2); put(s, 'hero', { p: [h[0], 0, h[2]], ry: 0.5 + PI, face: 'surprised', pose: { head: [0.2, 0, 0] } });
    lamp(s, 'book', RBW(s, 0, 1.0, 0.6), '#fff0c8', 6, 6); return Object.assign(ENG.face('hero', 2.8 - 0.3 * E(u), 20, 2, 44, 0, -0.4), { lead: 'hero' }); });
  ST('No pawn ever has', (s, u) => { K(s); [['pawn0', -1.6, -45.5, PI + 0.2], ['pawn3', 1.8, -45, PI - 0.2], ['pawn6', 0.2, -42.5, PI]].forEach(([n, x, z, ry]) => put(s, n, { p: [x, 0, z], ry, face: 'worried', pose: STIFF }));
    return { p: L([0.4, 9, -33], [0.2, 8.4, -34.5], E(u)), l: [0, 4.5, -62], fov: 54, lead: 'pawn6' }; });
  ST('We get captured first', (s, u) => { night(s); const p = [FX(2), 0, RZ(4) + 2], k = E(u); s.props.handAt([p[0], 6.6 + 14 * k, p[2]], { pinch: 0.85, yaw: 0.6, tilt: 0.2 });
    put(s, 'pawn6', { p: [p[0], 14 * k, p[2]], ry: 0.4, face: 'scared', pose: { armL: [-0.5, 0, 0.5], armR: [-0.5, 0, -0.5], legL: [-0.3 * k, 0, 0], legR: [0.3 * k, 0, 0] } }); sqGlow(s, 'capt', FX(2), RZ(4), '#ff5a4a');
    return { p: [p[0] + 18, 4, p[2] + 20], l: [p[0], 9, p[2]], fov: 54, grade: 'gamenight', lead: 'pawn6' }; });
  // ================= the incident =================
  const HC = [8, 0, -36.5];   // hero during the incident
  ST('This Sunday', (s, u) => { night(s); frozen(s); put(s, 'hero', { p: HC, ry: -PI / 2, face: 'scared', pose: CAST.POSE.lookUp });
    s.props.handAt([-6, 62 - 22 * E(u), -32], { pinch: 0.25, yaw: PI / 2, tilt: 0.3 });
    return { p: [HC[0] + 10, 2.2, -31], l: [-2, 20, -33], fov: 62, grade: 'gamenight', post: { aperture: 0.2 }, lead: 'hero' }; });
  ST('Past the bakery', (s, u) => { night(s); frozen(s); s.props.handAt([FX(4) - 10 + 12 * u, 30, -30], { pinch: 0.3, yaw: PI / 2, tilt: 0.3 });
    return { p: [FX(4) + 8, 4, -36], l: [FX(4) - 2, 16, -24], fov: 60, grade: 'gamenight' }; });
  ST('Past my aunt and', (s, u) => { night(s); frozen(s, ['aunt', 'uncle']); s.props.handAt([-26 + 14 * u, 26, -30], { pinch: 0.3, yaw: PI / 2, tilt: 0.3 });
    put(s, 'aunt', { p: AU, ry: 0.7, face: 'worried', pose: CAST.POSE.wave }); put(s, 'uncle', { p: UN, ry: -0.7, face: 'worried', pose: CAST.POSE.waveL });
    return { p: [-16, 3.6, -16], l: [-16, 11, -29], fov: 60, grade: 'gamenight', lead: 'aunt' }; });
  ST('And it stopped right', (s, u) => { night(s); frozen(s); put(s, 'hero', { p: HC, ry: PI, face: 'scared', pose: CAST.POSE.lookUp });
    s.props.handAt([HC[0] - 3.5, 15, HC[2] + 3.5], { pinch: 0.15, yaw: -0.6, tilt: -0.4 });
    return { p: [HC[0] + 0.5, 19 - 2 * E(u), HC[2] + 6], l: [HC[0], 2, HC[2] - 0.5], fov: 48, grade: 'gamenight', lead: 'hero' }; });
  const DJ0 = [-20, 0, -30.5], DJ1 = [4.8, 0, -30.5], DJ2 = [4.8, 0, -36.5];   // dad's L: two over (+x), one up (-z) to land in front of the hero
  ST('Dad jumped', (s, u) => { night(s); frozen(s); put(s, 'hero', { p: HC, ry: -PI / 2, face: 'scared', pose: CAST.POSE.lookUp }); path(s, 'dadL', [[DJ0[0], DJ0[2]], [DJ1[0], DJ1[2]], [DJ2[0], DJ2[2] - 1]], '#ffb43a', { w: 1.6 });
    const k = E(u), q = k < 0.75 ? arc(DJ0, DJ1, k / 0.75, 16) : arc(DJ1, DJ2, (k - 0.75) / 0.25, 3); put(s, 'dad', { p: q, ry: k < 0.75 ? PI / 2 : PI, face: 'determined', pose: JUMP });
    return Object.assign(top([-4 + 6 * u, 0, -33], 38, 0, 50), { grade: 'gamenight', lead: 'dad' }); });
  ST('Right in front of', (s, u) => { night(s); frozen(s); put(s, 'hero', { p: HC, ry: -PI / 2, face: 'scared', pose: CAST.POSE.lookUp }); put(s, 'dad', { p: DJ2, ry: -PI / 2, face: 'determined', pose: Object.assign({ head: [-0.4, 0, 0] }, GUARD) });
    s.props.handAt([DJ2[0] - 6, 17, HC[2]], { pinch: 0.15, yaw: PI / 2, tilt: 0.35 }); lamp(s, 'rf', [6, 6, -30], '#ffc890', 60, 14);
    return { p: L([9.5, 3.0, -27.2], [9.2, 3.2, -28], E(u)), l: [4, 8, -36.5], fov: 62, grade: 'gamenight', lead: 'dad' }; });
  ST('The hand took him', (s, u) => { night(s); frozen(s); const k = E(u), dy = 22 * k; put(s, 'hero', { p: HC, ry: -PI / 2, face: 'crying', pose: { armL: [-2.9, 0, 0.2], armR: [-2.9, 0, -0.2], head: [-0.5, 0, 0] } });
    put(s, 'dad', { p: [DJ2[0], dy, DJ2[2]], ry: PI / 2, face: 'worried', pose: { armL: [-0.3, 0, 0.4], armR: [-2.6, 0, -0.3], legL: [0.3 * k, 0, 0], legR: [-0.3 * k, 0, 0] } });
    s.props.handAt([DJ2[0], 7.4 + dy, DJ2[2]], { pinch: 0.9, yaw: PI / 2, tilt: 0.2 }); lamp(s, 'rf', [6, 6, -30], '#ffc890', 60, 14);
    return { p: [7, 2.4, -27.2], l: [6, 8 + 8 * k, -36.5], fov: 62, grade: 'gamenight', lead: 'hero' }; });
  // ================= asking for help =================
  ST('I tried everything', (s, u) => { K(s); put(s, 'hero', { p: [H0[0], 0, -33], ry: 0, face: 'crying', pose: CAST.POSE.headDown(0) }); sqGlow(s, 'alone', FX(4), RZ(7), '#7fe08a');
    return top([H0[0], 0, -34], 40 + 14 * E(u), 30, 48); });
  const RK = [FX(6) - 3, 0, -28.5];
  ST('I asked a rook', (s, u) => { K(s); const h = [RK[0] + 7 - 2 * u, 0, RK[2] - 3]; put(s, 'rook', { p: RK, ry: yawTo(RK, h), face: 'neutral', pose: CAST.POSE.crossed }); put(s, 'hero', { p: h, ry: yawTo(h, RK), face: 'worried', pose: W(u * 3) });
    return { p: [RK[0] - 1.5, 4.6, -37.5], l: [RK[0] + 3, 4.0, RK[2] - 1.5], fov: 52, lead: 'hero' }; });
  ST('Straight lines only kid', (s, u) => { K(s); const h = [RK[0] + 4.5, 0, RK[2] - 3]; put(s, 'rook', { p: RK, ry: yawTo(RK, h) - 0.4, face: 'neutral', pose: CAST.POSE.point }); put(s, 'hero', { p: h, ry: yawTo(h, RK), face: 'worried' });
    return Object.assign(ENG.face('rook', 6.4, -15, -2, 44), { lead: 'rook' }); });
  ST('The box is diagonal', (s, u) => { K(s); put(s, 'rook', { p: [FX(2), 0, -31], ry: -PI / 2, face: 'neutral', pose: CAST.POSE.point }); put(s, 'hero', { p: [FX(2) + 3.5, 0, -32], ry: -PI / 2, face: 'worried' });
    path(s, 'rkS1', [[FX(2) - 4, -31], [FX(0) - 4, -31]], '#ffd23a'); path(s, 'rkS2', [[FX(2), -27], [FX(2), 4]], '#ffd23a');
    path(s, 'diagBox', [[FX(2) - 2, -27], [-96, 0]], '#ff4a3a', { dash: 2.4 });
    return Object.assign(top([-58, 0, -14], 112 - 10 * E(u), 0, 50), { lead: 'rook' }); });
  const AD = [-25, 0, -30];
  ST('I asked my aunt', (s, u) => { K(s); put(s, 'aunt', { p: AD, ry: PI - 0.6, face: 'lashes', pose: { armL: [-0.4, 0, 0.3] } }); const h = [AD[0] + 3.5, 0, AD[2] - 4]; put(s, 'hero', { p: h, ry: yawTo(h, AD), face: 'worried', pose: CAST.POSE.offer });
    return { p: L([AD[0] - 3.5, 4.6, AD[2] - 8.4], [AD[0] - 3, 4.4, AD[2] - 8], E(u)), l: [AD[0] + 1.5, 4.0, AD[2] - 2], fov: 50, lead: 'hero' }; });
  ST('She can go diagonal', (s, u) => { K(s); const a = [FX(2) + 4, 0, RZ(4) - 4], b = [FX(4) + 4, 0, RZ(4) - 36], q = L(a, b, 0.2 + 0.5 * u);
    put(s, 'aunt', { p: q, ry: yawTo(a, b), face: 'lashes', pose: W(u * 6) }); path(s, 'auD', [[a[0], a[2]], [b[0], b[2]]], '#c89cff', { w: 2 });
    return Object.assign(top([FX(3) + 4, 0, RZ(5) + 4], 60, 0, 50), { lead: 'aunt' }); });
  ST('She can\'t carry a', (s, u) => { K(s); const w = Math.sin(u * 40) * 0.05; put(s, 'hero', { p: [AD[0] + 1.6, 0.15 + Math.abs(w), AD[2] - 0.6], ry: -PI / 2, face: 'worried', pose: { armL: [-0.3, 0, 0.5], armR: [-0.3, 0, -0.5] } });
    put(s, 'aunt', { p: [AD[0] - 1.4, 0, AD[2] - 0.6], ry: PI / 2, face: 'angry', pose: { armL: [-1.25, 0, -0.35], armR: [-1.25, 0, 0.35], body: [-0.25 + w, 0, 0], head: [-0.3, 0, 0] } });
    return { p: [AD[0] + 0.3, 4.2, AD[2] - 7.8], l: [AD[0] + 0.2, 3.4, AD[2] - 0.6], fov: 66, lead: 'aunt' }; });
  // ================= the queen =================
  const QF = [0, 0, 33];
  ST('I went all the', (s, u) => { K(s); put(s, 'hero', { p: [QF[0], 0, QF[2] - 6 + 4 * u], ry: 0, face: 'determined', pose: W(u * 4) }); put(s, 'queen', { p: s.marks.p_queen.p, ry: PI, face: 'haughty' });
    return { p: L([QF[0] - 6, 1.2, QF[2] - 22], [QF[0] - 5, 1.4, QF[2] - 18], E(u)), l: [0, 22, 52], fov: 56, lead: 'hero' }; });
  ST('She can go anywhere', (s, u) => { K(s); const q = s.marks.p_queen.p; put(s, 'queen', { p: q, ry: PI, face: 'haughty', pose: CAST.POSE.openT }); star(s, 'qs', q, 14, '#ffd23a');
    return { p: L([q[0] + 8, q[1] + 32, q[2] - 22], [q[0] + 6, q[1] + 28, q[2] - 18], E(u)), l: [q[0], q[1], q[2] - 3], fov: 52, lead: 'queen' }; });
  ST('She looked down at', (s, u) => { K(s); const q = s.marks.p_queen.p; put(s, 'queen', { p: q, ry: PI, face: 'haughty', pose: { head: [0.45, 0, 0] } }); put(s, 'hero', { p: [QF[0] + 0.5, 0, QF[2] + 1], ry: 0, face: 'worried', pose: CAST.POSE.lookUp });
    return { p: L([q[0] - 2.2, q[1] + 8.4, q[2] + 3.6], [q[0] - 2.0, q[1] + 8.0, q[2] + 2.8], E(u)), l: [QF[0] + 0.5, 3, QF[2] + 1], fov: 46, lead: 'queen' }; });
  ST('Pawns don\'t get rescues', (s, u) => { K(s); const q = s.marks.p_queen.p; put(s, 'queen', { p: q, ry: PI, face: 'haughty', pose: { head: [0.3, 0, 0] } });
    return Object.assign(ENG.face('queen', 8 - 1.5 * E(u), -12, -22, 42), { lead: 'queen' }); });
  // ================= the king's kitchen =================
  ST('I even asked the', (s, u) => { const k = s.marks.p_king_stove.p; put(s, 'king', { p: k, ry: PI + 0.3, face: 'kindly', pose: { armR: [-1.3, 0, 0.1], armL: [-1.1, 0, -0.2] } }); put(s, 'hero', { p: [10, 0, 2], ry: -2.0, face: 'worried' });
    return { p: L([12, 8, 10], [11, 7.6, 9], E(u)), l: [-2, 4, -6], fov: 58, lead: 'hero' }; });
  ST('He said he\'d love', (s, u) => { const k = s.marks.p_king_stove.p; put(s, 'king', { p: [k[0] + 0.6, 0, k[2] + 0.6], ry: 0.5, face: 'kindly', pose: CAST.POSE.open });
    return Object.assign(ENG.face('king', 7 - 1.2 * E(u), -10, 2, 44), { lead: 'king' }); });
  ST('but he\'s been trying', (s, u) => { const a = [3, 0, 1], b = [6.5, 0, 1]; put(s, 'king', { p: L(a, b, E(u)), ry: PI / 2, face: 'tired', pose: W(u * 3) });
    return { p: [2, 6.5, -6], l: [9, 4.2, 2], fov: 54, lead: 'king' }; });
  ST('since 1987', (s, u) => { const c = s.marks.m_calendar.p; return { p: [c[0] + 0.3 - 0.4 * u, c[1] + 0.1, c[2] + 7 - 1.4 * E(u)], l: [c[0], c[1], c[2]], fov: 40, widen: 1.0 }; });
  // ================= row eight =================
  const R8 = [0, 0, -50.5];   // fog edge (in the alley between d7 and e7 cottages, at the low wall gap)
  ST('And I can only', (s, u) => { K(s); put(s, 'hero', { p: [H0[0], 0, -34], ry: 0, face: 'tired' }); sqGlow(s, 'onlyA', FX(4), RZ(6), '#7fe08a');
    return top([H0[0], 0, -30], 30 + 6 * E(u), 20, 46); });
  ST('So I looked at', (s, u) => { K(s); put(s, 'hero', { p: [R8[0] + 0.4, 0, R8[2] + 6], ry: PI + 0.2, face: 'determined' });
    return { p: L([R8[0] - 1.4, 7.5, R8[2] + 22], [R8[0] - 1.0, 7.0, R8[2] + 19], E(u)), l: [R8[0], 6, R8[2] - 20], fov: 54, f: [R8[0], 4, R8[2] + 6], lead: 'hero' }; });
  ST('Nothing but fog', (s, u) => { K(s); put(s, 'hero', { p: [R8[0], 0, R8[2] + 3], ry: PI + 0.15, face: 'worried' });
    return { p: L([R8[0] + 1.6, 2.4, R8[2] + 11], [R8[0] + 1.4, 2.6, R8[2] + 9.5], E(u)), l: [R8[0] - 1.5, 5, R8[2] - 20], fov: 56, f: [R8[0], 5, R8[2] + 3], lead: 'hero' }; });
  ST('No pawn has ever', (s, u) => { K(s); put(s, 'hero', { p: [R8[0], 0, R8[2] + 3], ry: PI, face: 'determined', pose: { head: [0.3, 0, 0] } });
    return { p: L([R8[0] - 2.6, 1.6, R8[2] - 4], [R8[0] - 2.2, 1.8, R8[2] - 3], E(u)), l: [R8[0], 3.0, R8[2] + 3], fov: 54, lead: 'hero' }; });
  ST('I took one step', (s, u) => { K(s); const k = E(u); put(s, 'hero', { p: [R8[0], 0, R8[2] + 2.5 - 4 * k], ry: PI, face: 'determined', pose: W(u * 4) });
    return { p: [R8[0] + 4, 2.2, R8[2] + 9], l: [R8[0], 1.8, R8[2] - 2], fov: 48, widen: 1.3, lead: 'hero' }; });
  const HR8 = [0, 0, -56];
  ST('The fog cleared', (s, u) => { K(s); s.props.setFog(1 - E(u), [HR8[0], HR8[2]]); put(s, 'hero', { p: HR8, ry: 0, face: 'surprised' });
    return { p: L([HR8[0] + 3, 6, HR8[2] - 20], [HR8[0] + 4, 7.5, HR8[2] - 26], E(u)), l: [HR8[0], 4, HR8[2]], fov: 52, lead: 'hero' }; });
  // the crowd on rank seven/eight in front of the hero (who faces +z, back to the cleared row eight)
  const CROWD = [['pawn0', -9, -48.5], ['pawn1', -5, -47], ['pawn2', 4.5, -47], ['pawn3', 9, -48.5], ['pawn4', -13, -50.5], ['pawn5', 13, -50.5], ['baker', -2, -45.5], ['aunt', -17, -53], ['uncle', 17, -53], ['pawn6', 1.5, -44], ['pawn7', -7, -43.5]];
  const crowd = (s, face = 'surprised', skip = []) => CROWD.filter(([n]) => !skip.includes(n)).forEach(([n, x, z]) => put(s, n, { p: [x, 0, z], ry: yawTo([x, 0, z], HR8) + 0.0, face, pose: STIFF }));
  const rooks = (s, face = 'smile') => { put(s, 'rook', { p: [-5, 0, -51.5], ry: yawTo([-5, 0, -51.5], HR8), face, pose: CAST.POSE.crossed }); put(s, 'rook2', { p: [5, 0, -51.5], ry: yawTo([5, 0, -51.5], HR8), face, pose: CAST.POSE.crossed }); };
  ST('and the whole kingdom', (s, u) => { K(s); s.props.setFog(0); crowd(s); rooks(s, 'surprised'); put(s, 'hero', { p: HR8, ry: 0, face: 'surprised' });
    return { p: L([HR8[0] + 5, 8.5, HR8[2] - 8], [HR8[0] + 4.5, 8, HR8[2] - 6.5], E(u)), l: [0, 4.0, -46], fov: 56, f: [0, 4, -48] }; });
  ST('Well everyone who', (s, u) => { K(s); s.props.setFog(0); put(s, 'pawn0', { p: [-12, 0, -40 + 2 * u], ry: PI, face: 'tired', pose: W(u * 3) }); put(s, 'pawn5', { p: [-4, 0, -38 + 2 * u], ry: PI, face: 'tired', pose: W(1 + u * 3) });
    const a = [-30 + 5 * u, 0, -28 - 5 * u], b = [-24 + 5 * u, 0, -24 - 5 * u]; put(s, 'aunt', { p: a, ry: PI * 0.75, face: 'worried', pose: W(u * 4) }); put(s, 'uncle', { p: b, ry: PI * 0.75, face: 'worried', pose: W(1 + u * 4) });
    path(s, 'late1', [[-36, -22], [-16, -42]], '#c89cff', { dash: 2 });
    return { p: [-14, 9, -46], l: [-20, 3, -30], fov: 56, lead: 'aunt' }; });
  ST('The rooks got there', (s, u) => { K(s); s.props.setFog(0); crowd(s, 'neutral'); rooks(s, 'smile'); taxi(s, [-10, 0, -55], PI * 0.5 + 0.3, { rook: 'rook2', rface: 'smile', pass: ['pawn6', 'pawn7'], rpose: CAST.POSE.crossed });
    return Object.assign(ENG.face('rook', 6.6 - 1 * E(u), -10, 0, 46), { lead: 'rook' }); });
  ST('A voice from the', (s, u) => { K(s); s.props.setFog(0); s.props.openLid(0.35 + 0.15 * u); beamDown(s, 'voice2', [HR8[0], 160, HR8[2]], 22, 160, 0.7); crowd(s); put(s, 'hero', { p: HR8, ry: 0, face: 'surprised', pose: CAST.POSE.lookUp });
    lamp(s, 'voiceL', [HR8[0], 14, HR8[2]], '#ffe0a0', 400, 30); glow(s, 'voiceG', [HR8[0], 3, HR8[2]], 16, 0.6);
    return { p: L([HR8[0] + 8, 3, HR8[2] - 10], [HR8[0] + 7, 3.2, HR8[2] - 9], E(u)), l: [HR8[0], 13, HR8[2]], fov: 62, lead: 'hero', post: { exposure: 1.05 } }; });
  ST('Everybody expected a', (s, u) => { K(s); s.props.setFog(0); crowd(s, 'smile'); rooks(s, 'smile'); put(s, 'hero', { p: HR8, ry: 0.4, face: 'determined' });
    return { p: L([8, 4.6, -60], [7, 4.4, -58], E(u)), l: [-2, 4.2, -47], fov: 56, f: [0, 4, -48] }; });
  ST('queen', (s, u) => { K(s); s.props.setFog(0); crowd(s); put(s, 'hero', { p: HR8, ry: 0, face: 'happy', pose: CAST.POSE.armsUp }); crown(s, Math.min(1, 0.3 + u * 2));
    const h = CAST.get('hero'); h.root.updateMatrixWorld(true); const hp = h.head.getWorldPosition(new THREE.Vector3()).toArray();
    glow(s, 'q', [hp[0], hp[1] + 1.2, hp[2]], 14 * (1.2 - u * 0.4), 0.8); lamp(s, 'qg', [hp[0], hp[1] + 3, hp[2] + 3], '#ffd890', 160, 16); beamDown(s, 'qb', [HR8[0], 120, HR8[2]], 9, 120, 0.25);
    return Object.assign(ENG.face('hero', 7.6 - 1.4 * E(u), 0, -6, 46, 0, 0.8), { lead: 'hero' }); });
  // ================= the queen's walk =================
  const QW = [0, 0, -56];
  ST('And I walked sideways', (s, u) => { K(s); s.props.setFog(0); put(s, 'hero', { p: [QW[0] - 4 - 14 * E(u), 0, QW[2]], ry: -PI / 2, face: 'happy', pose: W(u * 5) }); crown(s);
    path(s, 'side', [[QW[0] - 3, QW[2]], [QW[0] - 30, QW[2]]], '#ffd23a', { w: 1.6 }); return Object.assign(top([QW[0] - 12, 0, QW[2]], 30, 0, 48), { lead: 'hero' }); });
  ST('Then backwards', (s, u) => { K(s); s.props.setFog(0); const p = [-20, 0, -56 + 10 * E(u)]; put(s, 'hero', { p, ry: PI, face: 'happy', pose: W(u * 5) }); crown(s);
    [['pawn1', -28, -46], ['pawn2', -12, -44], ['baker', -24, -42]].forEach(([n, x, z]) => put(s, n, { p: [x, 0, z], ry: yawTo([x, 0, z], p), face: 'surprised', pose: STIFF }));
    return { p: [p[0] + 3, 1.6, p[2] + 9], l: [p[0], 4.2, p[2]], fov: 52, lead: 'hero' }; });
  ST('Then diagonally', (s, u) => { K(s); s.props.setFog(0); const a = [-20, 0, -46], b = [-52, 0, -14], q = L(a, b, 0.15 + 0.4 * E(u)); put(s, 'hero', { p: q, ry: yawTo(a, b), face: 'happy', pose: W(u * 5) }); crown(s);
    path(s, 'diag', [[a[0], a[2]], [b[0], b[2]]], '#ffd23a', { w: 1.6 }); return Object.assign(top([q[0] - 4, 0, q[2] + 6], 46, 0, 48), { lead: 'hero' }); });
  ST('all the way across', (s, u) => { K(s); s.props.setFog(0); s.props.setRoom(true); const pts = [[-3, -56], [-20, -56], [-20, -46], [-52, -14], [-66, -14], [-96, -10]], k = E(u);
    const q = [L([-52, 0, -14], [-66, 0, -12], k)[0], 0, -14]; put(s, 'hero', { p: q, ry: -PI / 2, face: 'happy', pose: W(u * 5) }); crown(s);
    path(s, 'across', pts, '#ffd23a', { w: 2.2, y: 1.6 });
    return { p: L([60, 95, -150], [40, 80, -130], k), l: [-50, -4, -14], fov: 46, post: { aperture: 0 } }; });
  ST('straight to the box', (s, u) => { K(s); const p = [BOX[0] + 36 - 8 * E(u), BOX[1], BOX[2] + 6]; put(s, 'hero', { p, ry: -PI / 2, face: 'determined', pose: W(u * 5) }); crown(s);
    return { p: [p[0] + 7, BOX[1] + 1.4, p[2] + 7], l: [BOX[0] + 18, BOX[1] + 12, BOX[2] + 2], fov: 58, f: [p[0], BOX[1] + 4, p[2]], lead: 'hero' }; });
  // ================= inside the Box =================
  const DT = (s) => s.marks.p_dad_top.p, hy = (s, x, z) => Math.max(0, s.props.heapH(x, z) - 1.5);
  const dadTop = (s, face = 'surprised', pose) => { const m = DT(s); return put(s, 'dad', { p: [m[0], m[1] - 1.3, m[2] + 1], ry: -0.1, sit: true, face, pose: pose || { armL: [-0.5, 0, 0.7], armR: [-2.6, 0, -0.4], head: [0.15, 0, 0.1], legL: [-1.35, 0, 0.15], legR: [-1.6, 0, -0.1] } }); };
  ST('Inside', (s, u) => { const p = [3, hy(s, 3, 18), 18]; put(s, 'hero', { p, ry: PI, face: 'scared', pose: CAST.POSE.lookUp }); crown(s);
    return { p: L([p[0] + 3, p[1] + 5, 24], [p[0] + 2, p[1] + 5.5, 23], E(u)), l: [0, 14, -10], fov: 62, lead: 'hero' }; });
  ST('and stacked to the', (s, u) => { dadTop(s); return { p: [2, 14, 23], l: L([0, 12, 0], [0, 28, -20], E(u)), fov: 58 }; });
  ST('Some had been in', (s, u) => { const x = -12, z = 2, y = s.props.heapH(x, z); return { p: L([x + 6, y + 5, z + 8], [x + 4.8, y + 4.2, z + 6.4], E(u)), l: [x, y, z], fov: 44 }; });
  ST('Dad was right', (s, u) => { dadTop(s, 'happy'); const m = DT(s); return { p: L([m[0] + 4, m[1] + 6, m[2] + 14], [m[0] + 3, m[1] + 5.5, m[2] + 11], E(u)), l: [m[0], m[1] + 3.5, m[2]], fov: 48, lead: 'dad' }; });
  ST('But the walls were', (s, u) => { const p = [17, hy(s, 17, 20), 20]; put(s, 'hero', { p, ry: PI / 2 + 0.5, face: 'worried', pose: CAST.POSE.lookUp }); crown(s);
    return { p: [10, p[1] + 1.2, 23], l: L([21, p[1] + 9, 17], [21, p[1] + 16, 16], E(u)), fov: 64, lead: 'hero', post: { bloom: 0.3 } }; });
  ST('A queen can go', (s, u) => { const p = [10, hy(s, 10, 18), 18]; put(s, 'hero', { p, ry: PI / 2, face: 'determined', pose: CAST.POSE.openT }); crown(s); for (let i = 0; i < 8; i++) { const a = i * PI / 4, len = [6, 8, 8, 4, 3, 4, 8, 6][i];
      path(s, 'bx' + i, [[p[0] + Math.sin(a) * 3, p[2] + Math.cos(a) * 3], [p[0] + Math.sin(a) * (3 + len), p[2] + Math.cos(a) * (3 + len)]], '#ffd23a', { y: p[1] + 1.2, w: 1.0 }); }
    lamp(s, 'bxq', [p[0], p[1] + 8, p[2] + 2], '#fff0d0', 35, 16);
    return Object.assign(top([p[0], p[1], p[2]], 15, 0, 52), { lead: 'hero' }); });
  ST('as long as nothing\'s', (s, u) => { const p = [20.2, hy(s, 20, 16), 16]; put(s, 'hero', { p, ry: PI / 2, face: 'angry', pose: { armL: [-1.6, 0, 0.1], armR: [-1.6, 0, -0.1], body: [0.25, 0, 0], legL: [0.4, 0, 0], legR: [-0.4, 0, 0] } }); crown(s);
    path(s, 'wallA', [[12, 16], [21.4, 16]], '#ff4a3a', { w: 1.2, y: p[1] + 0.5, arrow: false });
    return { p: [13, p[1] + 4, 22], l: [20, p[1] + 3.6, 15], fov: 50, lead: 'hero' }; });
  ST('A knight can jump', (s, u) => { dadTop(s, 'determined', { armL: [-0.4, 0, 0.3], armR: [-0.4, 0, -0.3], legL: [-1.35, 0, 0.15], legR: [-1.6, 0, -0.1] }); return Object.assign(ENG.face('dad', 6 - 1.2 * E(u), 20, 2, 42), { lead: 'dad' }); });
  ST('Dad grabbed me and', (s, u) => { const p = [12, hy(s, 12, 18), 18], ry = PI / 2 + 0.3; put(s, 'dad', { p, ry, face: 'determined', pose: { armR: [-1.0, 0, -0.5], armL: [-0.4, 0, 0.3], legL: [-0.6, 0, 0], legR: [0.4, 0, 0], body: [0.3, 0, 0] } });
    put(s, 'hero', { p: tw(p, ry, -2.4, 1.5, 0.6), ry, face: 'surprised', pose: { armL: [-2.6, 0, 0.3], armR: [-0.4, 0, -0.6], legL: [-0.4, 0, 0], legR: [0.3, 0, 0] } }); crown(s);
    return { p: [p[0] - 5, p[1] + 3.5, 24], l: [p[0], p[1] + 4.5, p[2]], fov: 50, lead: 'dad' }; });
  // ================= the escape =================
  const carry = (s, p, ry, pose = JUMP) => { put(s, 'dad', { p, ry, face: 'determined', pose: Object.assign({}, pose, { armR: [-1.0, 0, -0.5] }) });
    put(s, 'hero', { p: tw(p, ry, -2.4, 1.5, 0.6), ry, face: 'happy', pose: { armL: [-2.7, 0, 0.3], armR: [-0.4, 0, -0.6], legL: [-0.5, 0, 0], legR: [0.3, 0, 0] } }); crown(s); };
  const ESC0 = [BOX[0] + 10, 20, BOX[2]], ESC1 = s0 => s0.marks.p_bakery_roof.p;
  ST('Over the wall', (s, u) => { K(s); s.props.boxLid.rotation.z = 0.12; const b = ESC1(s), q = arc(ESC0, b, 0.1 + 0.55 * E(u), 30); carry(s, q, yawTo(ESC0, b));
    return { p: [q[0] - 6, q[1] + 6, q[2] + 26], l: [q[0], q[1] - 4, q[2]], fov: 54, lead: 'dad' }; });
  ST('Over the street', (s, u) => { K(s); const b = ESC1(s), q = arc(ESC0, b, 0.55 + 0.25 * u, 30); carry(s, q, yawTo(ESC0, b)); frozen(s, ['aunt', 'uncle']);
    return { p: [q[0] + 6, q[1] + 12, q[2] - 18], l: [q[0], q[1] - 20, q[2] + 2], fov: 56, lead: 'hero', grade: 'day' }; });
  ST('Onto the baker\'s roof', (s, u) => { K(s); const b = ESC1(s), k = Math.min(1, 0.85 + 0.3 * E(u)), q = arc(ESC0, b, k, 30); carry(s, q, yawTo(ESC0, b), k < 1 ? JUMP : LAND);
    return { p: [b[0] + 12, b[1] + 5, b[2] - 14], l: [b[0], b[1] + 3, b[2]], fov: 50, lead: 'dad' }; });
  ST('The baker didn\'t even', (s, u) => { K(s); const b = ESC1(s); carry(s, [b[0] - 1, b[1], b[2] - 1], -PI / 4, { legL: [0, 0, 0], legR: [0, 0, 0] }); put(s, 'baker', { p: s.marks.p_baker_door.p, ry: PI, face: 'closed', pose: { armL: [-1.2, 0, -0.3], armR: [-1.2, 0, 0.3], head: [0.2, 0, 0] } });
    return { p: [FX(4) + 9, 2.4, -35], l: [FX(4) + 2, 7, -24], fov: 58, lead: 'baker' }; });
  ST('Up in the sky', (s, u) => { K(s); s.props.openLid(0.5); s.props.handAt([FX(4) - 6, 70, -30], { pinch: 0.2, yaw: PI / 2, tilt: 0.25 });
    return { p: [FX(4) + 30, 3, -31], l: [FX(4) - 6, 74, -30], fov: 58 }; });
  ST('Then it slowly went', (s, u) => { K(s); s.props.openLid(0.5 - 0.4 * E(u)); s.props.handAt([FX(4) - 6, 75 + 70 * E(u), -30], { pinch: 0.1, yaw: PI / 2, tilt: 0.25 });
    const b = ESC1(s); carry(s, [b[0] - 1, b[1], b[2] - 1], -PI / 4, { legL: [0, 0, 0], legR: [0, 0, 0], armL: [-2.6, 0, 0.3] });
    return { p: [b[0] + 4, b[1] + 1.5, b[2] - 8], l: [FX(4) - 6, 90, -30], fov: 64, lead: 'hero' }; });
  ST('Now I can go', (s, u) => { K(s); const p = [FX(3), 0, RZ(4) - 4]; put(s, 'hero', { p, ry: 0, face: 'happy', pose: CAST.POSE.armsUp }); crown(s); star(s, 'free', p, 22 + 8 * u, '#ffd23a');
    return Object.assign(top(p, 46 + 10 * E(u), 0, 50), { lead: 'hero' }); });
  ST('as far as I', (s, u) => { K(s); const A = [FX(7), 0, RZ(2) + 8], B = [FX(0) + 4, 0, RZ(8) + 4], p = L(A, B, 0.2 + 0.06 * u); put(s, 'hero', { p, ry: yawTo(A, B), face: 'happy', pose: W(u * 6) }); crown(s);
    path(s, 'far', [[A[0], A[2]], [B[0], B[2]]], '#ffd23a', { w: 2.4 });
    return { p: [p[0] + 6, 5, p[2] + 7.5], l: [p[0] - 22, 2, p[2] - 20], fov: 54, lead: 'hero' }; });
  // ================= ending: morning walk to school =================
  ST('But every morning', (s, u) => { K(s, 'morning'); put(s, 'hero', { p: [H0[0] - 1.4, 0, -36 + 2 * u], ry: 0.5, face: 'happy', pose: W(u * 3) }); crown(s); put(s, 'dad', { p: [H0[0] + 2.2, 0, -36.6 + 2 * u], ry: 0.2, face: 'smile', pose: W(1 + u * 3) });
    return { p: L([H0[0] + 9, 5.0, -28.5], [H0[0] + 7.5, 4.8, -29.5], E(u)), l: [H0[0] + 0.4, 4.6, -36], fov: 50, grade: 'morning', lead: 'hero' }; });
  const MA = [FX(4), 0, RZ(5) + 4], MB = [FX(6) - 3, 0, RZ(5) + 4], MC = [FX(6) - 3, 0, RZ(4) - 8];
  ST('dad and I still', (s, u) => { K(s, 'morning'); path(s, 'mL', [[MA[0], MA[2]], [MB[0], MB[2]], [MC[0], MC[2] - 2]], '#ffb43a', { w: 1.8 });
    put(s, 'dad', { p: MB, ry: PI, face: 'smile', pose: CAST.POSE.wave }); put(s, 'hero', { p: L(MA, MB, 0.2 + 0.2 * u), ry: PI / 2, face: 'happy', pose: W(u * 4) }); crown(s);
    return Object.assign(top([FX(5), 0, RZ(5) + 4], 58, 0, 50), { grade: 'morning', lead: 'hero' }); });
  ST('jump', (s, u) => { K(s, 'morning'); const k = E(u), q = arc(MA, MB, Math.min(1, k * 1.4), 8); put(s, 'dad', { p: q, ry: PI / 2, face: 'happy', pose: k * 1.4 < 1 ? JUMP : LAND });
    put(s, 'hero', { p: [MA[0] - 1 + 3 * u, 0, MA[2] + 2], ry: PI / 2, face: 'happy', pose: W(u * 5) }); crown(s);
    return { p: [MA[0] - 8, 8, MA[2] + 20], l: [MA[0] + 12, 5, MA[2] - 1], fov: 50, grade: 'morning', lead: 'dad' }; });
  ST('It takes us forever', (s, u) => { K(s, 'morning'); put(s, 'dad', { p: MB, ry: -PI / 2, face: 'smile', pose: CAST.POSE.crossed }); put(s, 'hero', { p: [MA[0] + 4 + 2 * u, 0, MA[2]], ry: PI / 2, face: 'happy', pose: W(u * 4) }); crown(s);
    return { p: L([MA[0] - 6, 8, MA[2] + 16], [MA[0] - 5, 7.5, MA[2] + 14], E(u)), l: [MA[0] + 12, 4, MA[2] - 1], fov: 50, grade: 'morning', lead: 'hero' }; });
  ST('Best part of my', (s, u) => { K(s, 'morning'); const p = [FX(5) + 2, 0, RZ(5) + 6]; put(s, 'hero', { p, ry: 0.35, face: 'happy' }); crown(s); put(s, 'dad', { p: [p[0] + 3.6, 0, p[2] - 0.8], ry: -0.4, face: 'smile', pose: { armL: [-1.0, 0, 0.9], head: [0.15, -0.3, 0] } });
    return { p: L([p[0] + 1.4, 5.0, p[2] + 9.5], [p[0] + 1.6, 5.4, p[2] + 8], E(u)), l: [p[0] + 1.8, 5.2, p[2]], fov: 52, grade: 'morning', lead: 'hero' }; });
})();
