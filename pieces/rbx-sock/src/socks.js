// rbx-sock: socks everywhere. Knit sock textures, socks on R6 legs, a loose sock geometry (instanceable),
// the Sock Man's arm (a long grey arm made of old socks, sock fingers) and the Sock Man himself (sitting, sock-puppet head).
'use strict';
const SOCKS = {};
(function () {
  const { cnv, rng, fbm } = RBX, V = (x, y, z) => new THREE.Vector3(x, y, z);
  // ---------------- textures: 256x256 knit tile, top of the canvas = top of the sock (cuff) ----------------
  const KINDS = {
    dino: { base: '#4fb35c', cuff: '#f28a1e' }, pizza: { base: '#d8402e', cuff: '#f6c544' }, duck: { base: '#ffd332', cuff: '#ffffff' },
    knit: { base: '#b0486a', cuff: '#f1e4c8' }, knit2: { base: '#3f7f8f', cuff: '#f1e4c8' }, stripe: { base: '#e94b3c', cuff: '#2a2a2a' }, dots: { base: '#22356e', cuff: '#ffffff' },
    argyle: { base: '#6b4a8a', cuff: '#2c1f3a' }, gym: { base: '#f2f0ea', cuff: '#f2f0ea' }, baby: { base: '#a8d8f0', cuff: '#ffffff' }, red: { base: '#c8262c', cuff: '#7a1418' },
    green: { base: '#2f8f4a', cuff: '#1c5a2c' }, grey: { base: '#8c8a86', cuff: '#6c6a66', old: 1 }, grey2: { base: '#5e5d5c', cuff: '#4a4948', old: 1 },
    oat: { base: '#b9ad94', cuff: '#9c917a', old: 1 }, fadeblue: { base: '#7d8ea0', cuff: '#65768a', old: 1 }, fadestripe: { base: '#9a948a', cuff: '#7c3a34', old: 1 },
    mail: { base: '#1f3a68', cuff: '#c8262c' }, grandpa: { base: '#5a4a32', cuff: '#3a2e1e', old: 1 }, star: { base: '#2a2a40', cuff: '#f2c14e' },
  };
  SOCKS.KINDS = Object.keys(KINDS);
  const motif = {
    dino(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#1f6a2c';
      g.beginPath(); g.ellipse(0, 0, 26, 15, 0, 0, 7); g.fill();                        // body
      g.beginPath(); g.moveTo(-20, -4); g.quadraticCurveTo(-46, -8, -54, 6); g.quadraticCurveTo(-36, 4, -20, 8); g.fill();   // tail
      g.beginPath(); g.moveTo(16, -8); g.quadraticCurveTo(24, -30, 30, -34); g.lineTo(40, -30); g.quadraticCurveTo(30, -18, 26, 0); g.fill();   // neck
      g.beginPath(); g.ellipse(38, -34, 12, 8, 0.1, 0, 7); g.fill();                    // head
      g.fillRect(-14, 8, 8, 16); g.fillRect(8, 8, 8, 16);                               // legs
      g.fillStyle = '#f28a1e'; for (let i = 0; i < 4; i++) { const px = -14 + i * 9; g.beginPath(); g.moveTo(px - 5, -13); g.lineTo(px, -24); g.lineTo(px + 5, -13); g.fill(); }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(41, -36, 3, 0, 7); g.fill(); g.restore(); },
    pizza(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#b5701f'; g.beginPath(); g.moveTo(-28, -26); g.quadraticCurveTo(0, -36, 28, -26); g.lineTo(28, -18); g.lineTo(-28, -18); g.fill();
      g.fillStyle = '#ffd54a'; g.beginPath(); g.moveTo(-26, -20); g.lineTo(26, -20); g.lineTo(0, 30); g.closePath(); g.fill();
      g.fillStyle = '#c0281e'; [[-9, -10], [9, -9], [0, 8], [-3, -1]].forEach(([a, b]) => { g.beginPath(); g.arc(a, b, 5.5, 0, 7); g.fill(); });
      g.fillStyle = '#3e8a3a'; [[6, 2], [-12, -15]].forEach(([a, b]) => g.fillRect(a, b, 4, 3)); g.restore(); },
    duck(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#fffaf0';
      g.beginPath(); g.ellipse(0, 6, 24, 15, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-20, 4); g.lineTo(-32, -6); g.lineTo(-22, 12); g.fill();
      g.beginPath(); g.arc(16, -14, 12, 0, 7); g.fill();
      g.fillStyle = '#ff8a1e'; g.beginPath(); g.moveTo(26, -16); g.lineTo(38, -12); g.lineTo(26, -8); g.fill();
      g.fillStyle = '#141414'; g.beginPath(); g.arc(19, -17, 2.8, 0, 7); g.fill();
      g.strokeStyle = '#e8c860'; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, 4); g.quadraticCurveTo(4, 14, 12, 2); g.stroke(); g.restore(); },
    star(g, x, y, s) { g.fillStyle = '#f2c14e'; KIT.star(g, x, y, 22 * s); g.fill(); },
  };
  function knitTile(kind, seed = 3) {
    const K = KINDS[kind] || KINDS.grey, S = 256;
    return KIT.texPair(S, (g, hg) => {
      g.fillStyle = K.base; g.fillRect(0, 0, S, S);
      const r = rng(seed + kind.length * 13);
      if (kind === 'stripe') ['#e94b3c', '#f6a623', '#f8e04a', '#4cb85c', '#3a8ee6', '#8e5ad0'].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, 40 + i * 36, S, 36); });
      if (kind === 'fadestripe') [0, 1, 2].forEach((i) => { g.fillStyle = 'rgba(124,58,52,0.75)'; g.fillRect(0, 70 + i * 60, S, 16); });
      if (kind === 'dots') for (let y = 52; y < S; y += 42) for (let x = 18 + ((y / 42) % 2) * 21; x < S; x += 42) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); }
      if (kind === 'argyle') { for (let y = 40; y < S + 60; y += 90) for (let x = 0; x < S + 64; x += 128) { g.fillStyle = (x / 128 + y / 90) % 2 ? '#9a74c0' : '#4c3268'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 64, y + 45); g.lineTo(x, y + 90); g.lineTo(x - 64, y + 45); g.fill(); }
        g.strokeStyle = '#f2e9a0'; g.lineWidth = 2; for (let k = -2; k < 4; k++) { g.beginPath(); g.moveTo(k * 128, 40); g.lineTo(k * 128 + 300, 40 + 210); g.stroke(); g.beginPath(); g.moveTo(k * 128 + 300, 40); g.lineTo(k * 128, 40 + 210); g.stroke(); } }
      if (kind === 'gym') { g.fillStyle = '#d3262c'; g.fillRect(0, 40, S, 14); g.fillStyle = '#2a5ab0'; g.fillRect(0, 62, S, 14); }
      if (kind === 'baby') for (let y = 60; y < S; y += 50) for (let x = 20; x < S; x += 60) { g.fillStyle = '#ffffff'; KIT.star(g, x + (y % 100 ? 30 : 0), y, 10); g.fill(); }
      if (kind === 'knit' || kind === 'knit2') { // chunky zigzag bands
        [70, 150, 220].forEach((yy, i) => { g.strokeStyle = i === 1 ? '#f2c14e' : '#f1e4c8'; g.lineWidth = 12; g.beginPath(); for (let x = -16; x <= S + 16; x += 32) g.lineTo(x, yy + ((x / 32) % 2 ? 12 : -12)); g.stroke(); }); }
      if (kind === 'mail') { g.fillStyle = '#c8262c'; g.fillRect(0, 60, S, 10); g.fillStyle = '#ffffff'; g.fillRect(0, 72, S, 6); }
      if (motif[kind]) { const s = kind === 'duck' ? 1.25 : 1.2; motif[kind](g, 72, 100, s); motif[kind](g, 190, 190, s); }
      if (kind === 'star') { motif.star(g, 70, 110, 1); motif.star(g, 190, 190, 1); }
      // cuff band at the top
      g.fillStyle = K.cuff; g.fillRect(0, 0, S, 30);
      // knit: vertical rib columns + V stitches
      for (let x = 0; x < S; x += 8) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x, 0, 2, S); hg.fillStyle = '#3a3a3a'; hg.fillRect(x, 0, 2, S); hg.fillStyle = '#b8b8b8'; hg.fillRect(x + 3, 0, 3, S); }
      for (let y = 0; y < S; y += 6) for (let x = 0; x < S; x += 8) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x + 2, y, 3, 3); }
      for (let x = 0; x < S; x += 5) { hg.fillStyle = '#202020'; hg.fillRect(x, 0, 2, 30); }   // ribbed cuff
      KIT.noiseOver(g, S, S, seed + 9, K.old ? 0.6 : 0.25, 8, 4);
      if (K.old) for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(40,34,26,${0.12 + r() * 0.15})`; g.beginPath(); g.ellipse(r() * S, 40 + r() * (S - 40), 6 + r() * 20, 4 + r() * 12, r() * 3, 0, 7); g.fill(); }
    });
  }
  const MATS = {};
  // mat(kind, {repeat, lit}) -> cached MeshStandardMaterial; lit = a little self-emission so patterns read at night
  SOCKS.mat = function (kind, o = {}) {
    const k = kind + '|' + (o.repeat || [1, 1]).join('x') + '|' + (o.lit ?? 0.1); if (MATS[k]) return MATS[k];
    const t = knitTile(kind), m = RBX.pbr(t.c, t.h, { rough: 0.95, bump: 2.5, nscale: 0.6, repeat: o.repeat || [1, 1] });
    m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; if (m.normalMap) { m.normalMap.wrapS = m.normalMap.wrapT = THREE.RepeatWrapping; }
    m.emissive = new THREE.Color(1, 1, 1); m.emissiveMap = m.map; m.emissiveIntensity = o.lit ?? 0.1; m.side = THREE.DoubleSide;
    return (MATS[k] = m);
  };
  // ---------------- socks on R6 legs ----------------
  const soleBox = new THREE.BoxGeometry(1.0, 0.06, 1.4), legBox = RBX.rbox(1.06, 0.9, 1.06, 0.08, 6), cuffBox = RBX.rbox(1.1, 0.16, 1.1, 0.06, 6), toeBox = RBX.rbox(0.96, 0.42, 0.34, 0.14, 6);
  const skinMats = {};
  const bareMat = (skin) => skinMats[skin] || (skinMats[skin] = (() => { const c = cnv(128, 128), g = c.getContext('2d'); g.fillStyle = skin; g.fillRect(0, 0, 128, 128);
    return new THREE.MeshStandardMaterial({ map: RBX.tex(c), roughness: 0.6 }); })());
  const toesMat = {};
  const toeMat = (skin) => toesMat[skin] || (toesMat[skin] = (() => { const c = cnv(256, 128), g = c.getContext('2d'); g.fillStyle = skin; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = 'rgba(90,40,20,0.55)'; g.lineWidth = 5; [52, 104, 152, 196].forEach((x) => { g.beginPath(); g.moveTo(x, 10); g.lineTo(x, 60); g.stroke(); });
    g.fillStyle = 'rgba(255,230,220,0.9)'; [[26, 30], [78, 32], [128, 34], [174, 36], [222, 40]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 13, 9, 0, 0, 7); g.fill(); });
    return new THREE.MeshStandardMaterial({ map: RBX.tex(c), roughness: 0.6 }); })());
  // dress(av, left, right, o): kind | 'bare' | null for each leg. o: { skin, string: true (mailman), lit }
  SOCKS.dress = function (av, left, right, o = {}) {
    av.socks = av.socks || {};
    [['L', av.legL, left], ['R', av.legR, right]].forEach(([s, leg, kind]) => {
      if (av.socks[s]) { leg.remove(av.socks[s]); av.socks[s] = null; }
      if (!kind) return;
      const g = new THREE.Group(); g.name = 'sock' + s;
      if (kind === 'bare') { const m = new THREE.Mesh(legBox, bareMat(o.skin || '#EFCFA8')); m.position.y = -1.55; g.add(m); const t = new THREE.Mesh(toeBox, toeMat(o.skin || '#EFCFA8')); t.position.set(0, -1.79, 0.56); g.add(t); }
      else { const mt = SOCKS.mat(kind, { lit: o.lit ?? 0.14 });
        const m = new THREE.Mesh(legBox, mt); m.position.y = -1.55; g.add(m);
        const c = new THREE.Mesh(cuffBox, SOCKS.mat(kind, { repeat: [1, 0.12], lit: o.lit ?? 0.14 })); c.position.y = -1.1; g.add(c);
        const t = new THREE.Mesh(toeBox, mt); t.position.set(0, -1.79, 0.56); g.add(t);
        const so = new THREE.Mesh(soleBox, SOCKS.mat(kind, { repeat: [1, 0.5], lit: o.lit ?? 0.14 })); so.position.set(0, -2.0, 0.2); g.add(so);
        if (o.string) { const tor = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.045, 6, 24), new THREE.MeshStandardMaterial({ color: '#d8c49a', roughness: 0.9 })); tor.rotation.x = Math.PI / 2; tor.position.y = -1.32; g.add(tor);
          [-0.3, 0.3].forEach((a) => { const l = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 6, 12), tor.material); l.position.set(a * 0.6, -1.32, 0.62); l.rotation.z = a * 2; g.add(l); });
          const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), tor.material); tail.position.set(0.05, -1.55, 0.6); tail.rotation.z = 0.3; g.add(tail); } }
      g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      leg.add(g); av.socks[s] = g;
    });
    return av;
  };
  // ---------------- loose sock geometry (cuff at origin top, leg down -y, foot forward +z) ----------------
  // a flattened tube with a variable radius profile + a rounded toe; UV u around (0..2), v along (0..3)
  SOCKS.geo = (() => { const GC = {}; return function (flat = 0.5) {
    if (GC[flat]) return GC[flat]; let G;
    const curve = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0, -0.8, 0), V(0, -1.45, 0.02), V(0, -1.72, 0.3), V(0, -1.78, 0.9), V(0, -1.76, 1.45)]);
    const NS = 40, NR = 14, Lc = curve.getLength(), pos = [], uv = [], idx = [], fr = curve.computeFrenetFrames(NS, false);
    const rad = (t) => { const r0 = 0.3; if (t > 0.86) { const k = (t - 0.86) / 0.14; return r0 * Math.sqrt(Math.max(0, 1 - k * k)) + 0.001; } return r0 * (t < 0.05 ? 1.06 : 1) * (t > 0.45 && t < 0.62 ? 1.05 : 1); };
    for (let i = 0; i <= NS; i++) { const t = i / NS, P = curve.getPointAt(t), N = fr.normals[i], B = fr.binormals[i], r = rad(t);
      for (let j = 0; j <= NR; j++) { const a = (j / NR) * Math.PI * 2, cx = Math.cos(a) * r * flat, cy = Math.sin(a) * r;
        pos.push(P.x + N.x * cy + B.x * cx, P.y + N.y * cy + B.y * cx, P.z + N.z * cy + B.z * cx); uv.push((j / NR) * 2, 3 - t * 3 * (Lc / 3.2)); } }
    for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); G.setIndex(idx); G.computeVertexNormals();
    return (GC[flat] = G); }; })();
  // one loose sock mesh (prop): kind, scale
  SOCKS.one = function (kind, s = 1, flat = 0.5) { const m = new THREE.Mesh(SOCKS.geo(flat), SOCKS.mat(kind, { repeat: [1, 1], lit: 0.12 })); m.scale.setScalar(s); m.castShadow = true; m.receiveShadow = true; const g = new THREE.Group(); g.add(m); g.userData.kind = kind; return g; };
  // a sock lying on its side on the floor (pos = floor point): kind, scale, yaw
  SOCKS.lying = function (kind, s = 1, ry = 0) { const o = SOCKS.one(kind, s); const m = o.children[0]; m.rotation.set(0, 0, Math.PI / 2); m.position.set(0.18 * s, 0.17 * s, 0); o.rotation.y = ry; return o; };
  // a pile/cloud of socks as instanced meshes: list of {kind, m: Matrix4}; returns Group with one InstancedMesh per kind
  SOCKS.instanced = function (items, o = {}) {
    const by = {}; items.forEach((it) => { (by[it.kind] = by[it.kind] || []).push(it.m); });
    const g = new THREE.Group();
    Object.entries(by).forEach(([k, ms]) => { const im = new THREE.InstancedMesh(SOCKS.geo(), SOCKS.mat(k, { lit: o.lit ?? 0.08 }), ms.length); ms.forEach((m, i) => im.setMatrixAt(i, m)); im.instanceMatrix.needsUpdate = true; im.castShadow = o.cast ?? true; im.receiveShadow = true; im.frustumCulled = false; g.add(im); });
    return g;
  };
  // ---------------- the Sock Man's arm ----------------
  // arm(o) -> Group with userData.set(points[], curl): a fabric core tube + hundreds of old socks wrapped along it + a hand of 5 sock fingers.
  const GREYS = ['grey', 'grey2', 'oat', 'fadeblue', 'fadestripe', 'grey', 'grey2', 'grandpa'];
  const coreMat = () => SOCKS.mat('grey2', { repeat: [3, 12], lit: 0.05 });
  SOCKS.arm = function (o = {}) {
    const N = o.n || 420, R0 = o.r || 0.75, root = new THREE.Group(), r = rng(o.seed || 5), per = {};
    GREYS.forEach((k) => { if (!per[k]) per[k] = 0; });
    const plan = []; for (let i = 0; i < N; i++) { const k = GREYS[Math.floor(r() * GREYS.length)]; plan.push({ k, t: r(), a: r() * Math.PI * 2, tw: (r() - 0.5) * 1.2 * (o.tw ?? 1), s: (0.8 + r() * 0.35) * (o.ss ?? 1), flip: r() < 0.5, lift: r() }); per[k]++; }
    const IM = {}; Object.entries(per).forEach(([k, n]) => { if (!n) return; const im = new THREE.InstancedMesh(SOCKS.geo(), SOCKS.mat(k, { lit: 0.06 }), n); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; root.add(im); IM[k] = im; });
    const core = new THREE.Mesh(new THREE.BufferGeometry(), coreMat()); core.castShadow = true; root.add(core);
    // fingers: 4 + thumb, each a sock (toe = fingertip); a palm blob of socks
    const hand = new THREE.Group(); root.add(hand); hand.scale.setScalar(o.hand || 1); root.userData.hand = hand;
    const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), coreMat()); palm.scale.set(R0 * 1.25, R0 * 0.75, R0 * 1.35); hand.add(palm);
    const fingers = [0, 1, 2, 3, 4].map((i) => { const piv = new THREE.Group(); hand.add(piv); const f = SOCKS.one(GREYS[(i * 3 + 1) % GREYS.length], 0.5, 0.9); piv.add(f); piv.userData.f = f; return piv; });
    const tmpM = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), sc = new THREE.Vector3(), up = V(0, 1, 0), zA = V(0, 0, 1);
    root.userData.set = function (pts, curl = 0.3, o2 = {}) {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => V(...p))), L = curve.getLength();
      const taper = (t) => R0 * (1 - 0.35 * t);   // thinner toward the wrist
      core.geometry.dispose(); core.geometry = new THREE.TubeGeometry(curve, Math.max(20, Math.round(L * 4)), R0 * 0.72, 12, false);
      const cnt = {}; plan.forEach((pl) => {
        if (pl.t > (o2.show ?? 1)) { tmpM.makeScale(0, 0, 0); } else {
        const t = pl.t * 0.97, P = curve.getPointAt(t), T = curve.getTangentAt(t).normalize();
        let N = new THREE.Vector3().crossVectors(T, up); if (N.lengthSq() < 1e-4) N.set(1, 0, 0); N.normalize(); const B = new THREE.Vector3().crossVectors(T, N);
        const rr = R0 * 0.7 + 0.04 + 0.12 * pl.lift, dir = N.clone().multiplyScalar(Math.cos(pl.a)).addScaledVector(B, Math.sin(pl.a));
        const pos = P.clone().addScaledVector(dir, rr);
        // the sock's long axis (-y of the geo) lies along the tangent, its belly facing out, twisted a little
        const along = T.clone().applyAxisAngle(dir, pl.tw).multiplyScalar(pl.flip ? 1 : -1);
        const Yb = along.clone().negate(), Zb = new THREE.Vector3().crossVectors(dir, Yb).normalize(), m = new THREE.Matrix4().makeBasis(dir, Yb, Zb); q.setFromRotationMatrix(m);
        sc.setScalar(pl.s * (1 - 0.35 * t)); tmpM.compose(pos.addScaledVector(along, 0.6 * pl.s).addScaledVector(Zb, -0.5 * pl.s), q, sc); }
        const k = pl.k; cnt[k] = cnt[k] || 0; IM[k].setMatrixAt(cnt[k]++, tmpM);
      });
      Object.values(IM).forEach((im) => { im.instanceMatrix.needsUpdate = true; });
      // hand at the end, oriented along the last tangent; fingers spread forward then curl (curl 0 open .. 1 fist)
      const E = curve.getPointAt(1), TE = curve.getTangentAt(1).normalize(); hand.position.copy(E); q2.setFromUnitVectors(zA, TE); hand.quaternion.copy(q2); if (o2.roll) hand.rotateZ(o2.roll);
      fingers.forEach((piv, i) => { const thumb = i === 4, x = thumb ? R0 * 1.1 : (-1.5 + i) * R0 * 0.55;
        piv.position.set(x, thumb ? -R0 * 0.2 : R0 * 0.1, R0 * (thumb ? 0.4 : 1.0)); piv.rotation.set(0, thumb ? -0.9 : (i - 1.5) * 0.08, 0);
        const f = piv.userData.f; // sock lies along +z: rotate the geo so cuff is at the knuckle and the toe is the tip, curled down
        f.rotation.set(Math.PI / 2 + 0.15 + curl * 1.6, 0, 0); f.position.set(0, 0, 0); });
      return root;
    };
    return root;
  };
  // ---------------- the Sock Man ----------------
  // a giant R6 body sewn from old socks (patchwork knit), a knit head with two mismatched button eyes + a stitched mouth,
  // and two long sock arms (SOCKS.arm). Sitting (legs forward) by default. Height ~ 3x an avatar.
  let PATCH = null;
  const patchMat = () => PATCH || (PATCH = (() => {
    const S = 512, c = cnv(S, S), g = c.getContext('2d'), h = cnv(S, S), hg = h.getContext('2d'), r = rng(77), olds = ['grey', 'grey2', 'oat', 'fadeblue', 'fadestripe', 'grandpa', 'grey', 'grey2'];
    hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, S);
    const tiles = olds.map((k) => knitTile(k, 3));
    for (let y = 0; y < S; y += 128) for (let x = 0; x < S; x += 128) { const t = tiles[Math.floor(r() * tiles.length)], w = 128, hh = 128;
      g.save(); g.translate(x + 64, y + 64); g.rotate(r() < 0.5 ? 0 : Math.PI / 2); g.drawImage(t.c, 0, 40 + r() * 80, 256, 128, -64, -64, w, hh); g.restore();
      hg.save(); hg.translate(x + 64, y + 64); hg.drawImage(t.h, 0, 40, 256, 128, -64, -64, w, hh); hg.restore();
      g.strokeStyle = 'rgba(30,26,22,0.9)'; g.lineWidth = 3; g.setLineDash([7, 6]); g.strokeRect(x + 3, y + 3, w - 6, hh - 6); g.setLineDash([]);
      hg.fillStyle = '#000'; hg.fillRect(x, y, w, 3); hg.fillRect(x, y, 3, hh); }
    const m = RBX.pbr(c, h, { rough: 0.96, bump: 3, nscale: 0.8, repeat: [1, 1] }); m.emissive = new THREE.Color(1, 1, 1); m.emissiveMap = m.map; m.emissiveIntensity = 0.05; return m; })());
  SOCKS.man = function (o = {}) {
    const g = new THREE.Group(), K = o.k || 2.6, r = rng(o.seed || 9);
    const pm = patchMat(), box = (w, h, d) => new THREE.Mesh(KIT.uvBox(RBX.rbox(w, h, d, 0.1, 6), w, h, d), (() => { const m = pm.clone(); ['map', 'normalMap'].forEach((q) => { m[q] = pm[q].clone(); m[q].repeat.set(1 / 4, 1 / 4); m[q].needsUpdate = true; }); return m; })());
    const body = new THREE.Group(); body.position.y = 3 * K; g.add(body);
    const torso = box(2.2 * K, 2.2 * K, 1.2 * K); torso.rotation.x = 0.25; body.add(torso);   // hunched
    const legs = [-0.55, 0.55].map((x) => { const piv = new THREE.Group(); piv.position.set(x * K, -1 * K, 0); const m = box(1 * K, 2 * K, 1 * K); m.position.y = -1 * K; piv.add(m); body.add(piv);
      const sk = new THREE.Mesh(legBox, SOCKS.mat(x < 0 ? 'grey' : 'oat', { lit: 0.06 })); sk.scale.setScalar(K); sk.position.y = -1.55 * K; piv.add(sk); return piv; });
    // head: bevelled knit cylinder (R6) with buttons
    const neck = new THREE.Group(); neck.position.set(0, 1.25 * K, 0.35 * K); body.add(neck);
    const hk = 1.35 * K, head = new THREE.Mesh(new THREE.CylinderGeometry(0.62 * hk, 0.62 * hk, 1.2 * hk, 32, 1), SOCKS.mat('grey', { repeat: [3, 1.2], lit: 0.07 }));
    head.position.y = 0.6 * hk; neck.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.62 * hk, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2), head.material); cap.scale.y = 0.35; cap.position.y = 1.2 * hk; neck.add(cap);
    const btnTex = KIT.textTex(128, 128, (bg) => { bg.fillStyle = '#f4f0e6'; bg.beginPath(); bg.arc(64, 64, 60, 0, 7); bg.fill(); bg.strokeStyle = '#cfc8b8'; bg.lineWidth = 8; bg.beginPath(); bg.arc(64, 64, 46, 0, 7); bg.stroke();
      bg.fillStyle = '#1a1a1a'; [[48, 48], [80, 48], [48, 80], [80, 80]].forEach(([x, y]) => { bg.beginPath(); bg.arc(x, y, 8, 0, 7); bg.fill(); }); });
    const btnM = new THREE.MeshStandardMaterial({ map: btnTex, roughness: 0.35, emissive: new THREE.Color('#ffffff'), emissiveMap: btnTex, emissiveIntensity: 0.9 }), rimM = new THREE.MeshStandardMaterial({ color: '#d8d2c4' });
    const eyes = [[-0.26, 0.72, 0.17], [0.27, 0.74, 0.24]].map(([x, y, rr], i) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(rr * hk, rr * hk, 0.06 * hk, 28), [rimM, btnM, btnM]); b.rotation.set(Math.PI / 2, 0, 0); b.position.set(x * hk, y * hk, 0.62 * hk); neck.add(b); return b; });
    eyes[1].rotation.y = 0.5;   // the big one is cocked: confused
    const st = new THREE.MeshStandardMaterial({ color: '#1e1a16', roughness: 0.9 });
    for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.12 * hk, 0.03 * hk, 0.04 * hk), st); s.position.set((-0.24 + i * 0.095) * hk, (0.36 + Math.sin(i * 1.7) * 0.025) * hk, 0.63 * hk); s.rotation.z = i % 2 ? 0.5 : -0.5; neck.add(s); }
    // a few loose socks dangling from the shoulders + a sock tied round the head like a bandana
    const items = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, x = Math.cos(a) * 1.15 * K, z = Math.sin(a) * 0.65 * K;
      items.push({ kind: GREYS[i % GREYS.length], m: new THREE.Matrix4().compose(V(x, 1.12 * K, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, -a + Math.PI / 2, (r() - 0.5) * 0.4)), V(1, 1, 1).multiplyScalar(0.9 * K * 0.5)) }); }
    body.add(SOCKS.instanced(items, { lit: 0.05 }));
    const arms = [1, -1].map((sd, i) => { const a = SOCKS.arm({ n: 260, r: 0.42 * K, seed: 31 + i * 6 }); g.add(a); return a; });
    g.userData.setArms = (L, R, curl = 0.7) => { arms[0].userData.set(L, curl); arms[1].userData.set(R, curl); };
    // default: sitting, both hands up in front of the chest
    const sit = () => { legs.forEach((l) => l.rotation.set(-Math.PI / 2, 0, 0)); body.position.y = 1 * K + 0.2; };
    g.userData.sit = sit; sit();
    const sh = (sd) => [sd * 1.25 * K, body.position.y + 0.7 * K, 0.1 * K];
    g.userData.setArms([sh(1), [1.9 * K, body.position.y - 0.4 * K, 0.6 * K], [1.5 * K, body.position.y - 0.2 * K, 1.6 * K], [0.75 * K, body.position.y + 0.25 * K, 2.0 * K]],
      [sh(-1), [-1.9 * K, body.position.y - 0.4 * K, 0.6 * K], [-1.5 * K, body.position.y - 0.2 * K, 1.6 * K], [-0.75 * K, body.position.y + 0.25 * K, 2.0 * K]]);
    const held = [['duck', 1], ['pizza', -1]].map(([k, sd]) => { const s2 = SOCKS.one(k, 0.55 * K, 0.6); s2.position.set(sd * 0.7 * K, body.position.y + 0.9 * K, 2.15 * K); s2.rotation.set(0.1, 0, sd * 0.25); g.add(s2); return s2; });
    g.userData.held = held; g.userData.head = neck; g.userData.eyes = eyes; g.userData.arms = arms; g.userData.body = body;
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  };
})();
