// rbx-followers helpers: the follower counter above a head (Roblox BillboardGui look: footprints icon + big number),
// the mass crowd (near = posed clones of the Gneef crowd kit, far = instanced R6 dummies in the same palette),
// a school backpack and the dad's one old shoe.
'use strict';
const FOL = {};
(function () {
  const T = THREE, { cnv, tex, rng } = RBX, V = (x, y, z) => new T.Vector3(x, y, z);
  // ---- counter: sprite parented to the avatar root, floats over the hair ----
  const foot = (g, x, y, s, flip) => { g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.beginPath(); g.ellipse(0, 0, 10, 16, -0.15, 0, 7); g.fill(); g.stroke();
    [[-8, -22, 4], [-1, -25, 4.5], [6, -23, 4], [11, -18, 3.4], [14, -11, 3]].forEach(([a, b, r]) => { g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); g.stroke(); }); g.restore(); };
  FOL.counterTex = (text) => { const c = cnv(1024, 256), g = c.getContext('2d'); g.lineJoin = 'round';
    let fs = 170; g.font = `900 ${fs}px "Arial Black", Arial, sans-serif`; while (g.measureText(text).width > 760 && fs > 60) { fs -= 6; g.font = `900 ${fs}px "Arial Black", Arial, sans-serif`; }
    const tw = g.measureText(text).width, icon = 150, x0 = 512 - (tw + icon) / 2;
    g.fillStyle = '#ffffff'; g.strokeStyle = '#000'; g.lineWidth = 3.2; foot(g, x0 + 42, 160, 2.0, false); foot(g, x0 + 100, 116, 2.0, true);
    g.textBaseline = 'middle'; g.lineWidth = 26; g.strokeText(text, x0 + icon, 136); g.fillText(text, x0 + icon, 136); return tex(c); };
  FOL.counter = (av, text, o = {}) => { if (!av.counter) { const s = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthWrite: false, toneMapped: false, fog: false })); s.renderOrder = 20; av.root.add(s); av.counter = s; }
    const s = av.counter; if (s.userData.text !== text) { s.material.map = FOL.counterTex(text); s.material.needsUpdate = true; s.userData.text = text; }
    const k = (o.k || 1) * 1.35 / av.root.scale.x; s.scale.set(4.4 * k, 1.1 * k, 1); s.position.set(0, (o.y ?? 8.0) / 1, 0); s.material.color.setScalar(o.bright ?? 1.15); s.visible = true; return s; };
  FOL.noCounter = (av) => { if (av.counter) av.counter.visible = false; };

  // ---- backpack (hero) ----
  FOL.backpack = (c = '#F2C94C', strap = '#1A3E9E') => (av) => { const m = GN.mat('tee', { c, tile: 1 }), s = GN.mat('flat', { c: strap });
    av.body.add(GN.box(1.5, 1.7, 0.7, m, 0, 0.0, -0.85, 0.2)); av.body.add(GN.box(1.1, 0.7, 0.3, m, 0, -0.35, -1.3, 0.12));
    [-1, 1].forEach((k) => { av.body.add(GN.box(0.18, 2.0, 0.06, s, k * 0.45, 0, 0.53, 0.02)); }); };
  // ---- the dad's one old shoe (left foot): scuffed brown, a strip of silver tape, sole flapping ----
  FOL.oldShoe = () => (av) => { const L = av.legL, br = GN.mat('tee', { c: '#6a4a2e', tile: 0.5, rough: 0.95 }), tape = GN.mat('flat', { c: '#b8bcc4', rough: 0.35, metalness: 0.5 });
    L.children.slice(1).forEach((m) => { m.visible = false; });
    L.add(GN.box(1.08, 0.36, 1.2, br, 0, -1.83, 0.06, 0.1)); L.add(GN.box(1.1, 0.1, 1.2, GN.mat('flat', { c: '#2a2018', rough: 0.9 }), 0, -1.98, 0.02, 0.03));
    const flap = GN.box(1.06, 0.07, 0.5, GN.mat('flat', { c: '#2a2018' }), 0, -2.0, 0.55, 0.02); flap.rotation.x = 0.18; L.add(flap);
    L.add(GN.box(1.12, 0.14, 0.2, tape, 0, -1.8, 0.3, 0.02)); };

  // ---- mass crowd ----
  // near: real avatars (crowd kit) posed + faced, cloned (geometry/materials shared, face material per clone)
  const VAR = {};
  const FACES = ['F1', 'F5', 'F7', 'F3', 'F6', 'F10', 'F2', 'F8', 'F11', 'F13'];
  const POSES = [{}, { armR: [-1.4, 0, 0.1] }, { armL: [-0.3, 0, 0.6], armR: [-0.3, 0, -0.6] }, { armR: [-2.7, 0, -0.4] }, { armL: [-1.3, 0, -0.4], armR: [-1.3, 0, 0.4] }, { head: [-0.15, 0.3, 0] }];
  const variant = (type, k) => { const key = type + '|' + k; if (VAR[key]) return VAR[key];
    const a = CAST.get('crowd' + type), r = rng(type * 31 + k * 7 + 3); a.pose(Object.assign({}, POSES[Math.floor(r() * POSES.length)], { legL: [(r() - 0.5) * 0.3, 0, 0], legR: [(r() - 0.5) * 0.3, 0, 0] }));
    const cl = a.root.clone(true); cl.visible = true; const f = FACES[Math.floor(r() * FACES.length)];
    cl.traverse((m) => { if (m.isMesh && m.material === a.faceMat) m.material = new T.MeshStandardMaterial({ map: GN.faceTex(f, { lash: a.lash, tierA: a.tierA }), transparent: true, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false }); });
    return (VAR[key] = cl); };
  // far: instanced dummies (torso, legs, arms, head, hair blob) in crowd colours
  const SK = ['#F5CD30', '#F4A878', '#F3D9C2', '#F0A0A0', '#7A3E26', '#E89A84', '#F08A62'];
  const TOPS = ['#1E6FE0', '#E0101A', '#f4f2ee', '#F2C94C', '#2a3a7a', '#FF8A1E', '#d0202a', '#4B3DA0', '#3a6a3a', '#A9A5AE', '#E86A9A', '#9ad0f0', '#2E9A3A', '#d06a2a', '#C8F000', '#7a1f2a'];
  const LEGS = ['#7ED321', '#2a2a2a', '#3a4a6a', '#1a2a5a', '#C1121F', '#2e3e5e', '#4a4038', '#0F7C73', '#3a2a20', '#2D4FA0'];
  const HAIR = ['#3a2418', '#111111', '#F5D400', '#E040A8', '#C1121F', '#E5E1DA', '#6a3a1e', '#F06A12', '#1A1210', '#B9B9C0'];
  let DUMMY = null;
  const dummyGeo = () => DUMMY || (DUMMY = {
    torso: new T.BoxGeometry(2, 2, 1).translate(0, 3, 0), legs: new T.BoxGeometry(2, 2, 1).translate(0, 1, 0),
    arms: new T.BoxGeometry(4, 2, 1).translate(0, 3, 0), head: new T.CylinderGeometry(0.6, 0.6, 1.2, 12).translate(0, 4.65, 0), hair: new T.SphereGeometry(0.85, 10, 8).scale(1.05, 0.75, 1.05).translate(0, 5.25, -0.08) });
  FOL.farCrowd = (scene, spots, seed = 5) => { const G = dummyGeo(), n = spots.length, r = rng(seed), g = new T.Group(), mat = () => new T.MeshStandardMaterial({ roughness: 0.75 });
    const parts = { legs: LEGS, torso: TOPS, arms: TOPS, head: SK, hair: HAIR }, M = {}; Object.keys(parts).forEach((k) => { M[k] = new T.InstancedMesh(G[k], mat(), n); M[k].castShadow = true; M[k].receiveShadow = true; g.add(M[k]); });
    const m4 = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), c = new T.Color();
    spots.forEach((p, i) => { const sc = 0.82 + r() * 0.3; q.setFromAxisAngle(V(0, 1, 0), p.ry ?? 0); s.setScalar(sc); m4.compose(V(p.x, p.y || 0, p.z), q, s);
      const ti = Math.floor(r() * TOPS.length), skin = SK[Math.floor(r() * SK.length)];
      Object.entries(parts).forEach(([k, pal]) => { M[k].setMatrixAt(i, m4); c.set(k === 'arms' ? (r() < 0.25 ? skin : TOPS[ti]) : k === 'torso' ? TOPS[ti] : k === 'head' ? skin : pal[Math.floor(r() * pal.length)]); M[k].setColorAt(i, c); }); });
    Object.values(M).forEach((m) => { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }); scene.add(g); return g; };
  // fill a rectangle with standing people facing a target point; near (within nearR of `focus`) = avatars, rest = dummies
  // o: { x0, x1, z0, z1, gap, y(x,z), face:[x,z], focus:[x,z], nearR, skip(x,z), seed, max }
  const CC = {};
  FOL.crowd = (scene, add, o) => { if (o.key && CC[o.key]) { add(CC[o.key]); return CC[o.key]; } const grp = new T.Group(), add0 = add; add = (x) => grp.add(x); const r = rng(o.seed || 9), gap = o.gap || 2.6, near = [], far = [];
    for (let x = o.x0; x <= o.x1; x += gap) for (let z = o.z0; z <= o.z1; z += gap) {
      const px = x + (r() - 0.5) * gap * 0.7, pz = z + (r() - 0.5) * gap * 0.7; if (o.skip && o.skip(px, pz)) continue;
      const fx = o.face ? o.face[0] : 0, fz = o.face ? o.face[1] : 0, ry = Math.atan2(fx - px, fz - pz) + (r() - 0.5) * 0.5, py = o.y ? o.y(px, pz) : 0;
      const d = o.focus ? Math.hypot(px - o.focus[0], pz - o.focus[1]) : 0; (d < (o.nearR ?? 0) ? near : far).push({ x: px, y: py, z: pz, ry, d }); }
    near.sort((a, b) => a.d - b.d); const nmax = o.max ?? 140; near.slice(nmax).forEach((p) => far.push(p));
    near.slice(0, nmax).forEach((p, i) => { const cl = variant(i % CAST.CROWD.length, Math.floor(r() * 3)).clone(true); cl.position.set(p.x, p.y, p.z); cl.rotation.set(0, p.ry, 0); cl.scale.multiplyScalar(0.92 + r() * 0.16); add(cl); });
    if (far.length) add(FOL.farCrowd(new T.Group(), far, (o.seed || 9) + 1));
    if (o.key) CC[o.key] = grp; add0(grp); return grp; };
})();
