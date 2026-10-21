
// =====================================================================
//  PEOPLE — hero characters with real faces (eyes that blink and look, lids, brows, a mouth that smiles, opens,
//  trembles; tears), hands, hair styles, clothes; a pose/emotion API; and an instanced crowd for the big scenes.
// =====================================================================
const SKINS = ['#f3d2b5', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'];
const HAIRS = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#a8402a', '#b8b0a8'];
// one hero character. o: { skin, hair, hairStyle: 'bob'|'pony'|'bun'|'long'|'short'|'pigtails'|'curly'|'none', top, bottom, shoe,
// kid (scale), height, female, sleeve: 'short'|'long', skirt, helmet, vest, glasses, coat }
function makePerson(o = {}) {
  const P0 = {};
  const S = o.kid ? (o.kidScale || 0.68) : (o.height || 1), headR = o.kid ? 0.15 : 0.128;
  const skin = STDm({ color: o.skin || '#e8bb94', roughness: 0.65 }), cloth = STDm({ color: o.top || '#3a6ab0', roughness: 0.85 }), pants = STDm({ color: o.bottom || '#2b3a55', roughness: 0.85 }), shoeM = STDm({ color: o.shoe || '#1e1e22', roughness: 0.6 });
  const hairM = STDm({ color: o.hair || '#2a1d16', roughness: 0.7 }), dark = STDm({ color: '#141010', roughness: 0.4 }), white = STDm({ color: '#f8f6f2', roughness: 0.25 });
  const mk = (geo, mat, par, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; par.add(m); return m; };
  const G = (par, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const root = new THREE.Group(); root.scale.setScalar(S);
  const lath = (pts, seg = 14) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  // hips and legs
  const hips = G(root, 0, 0.92, 0); mk(new THREE.CylinderGeometry(0.15, 0.16, 0.2, 16).scale(1, 1, 0.72), o.skirt ? cloth : pants, hips, 0, 0, 0);
  if (o.skirt) mk(new THREE.CylinderGeometry(0.16, 0.26, 0.42, 18, 1, true), STDm({ color: o.skirt, side: THREE.DoubleSide }), hips, 0, -0.2, 0);
  const legs = [-1, 1].map((s) => { const th = G(hips, s * 0.085, -0.04, 0); mk(lath([[0.001, 0.02], [0.075, 0.0], [0.072, -0.12], [0.06, -0.38], [0.05, -0.44], [0.001, -0.45]]), o.shorts ? skin : pants, th);
    if (o.shorts) mk(lath([[0.001, 0.02], [0.082, 0.0], [0.08, -0.16], [0.001, -0.17]]), pants, th);
    const kn = G(th, 0, -0.43, 0); mk(lath([[0.001, 0.0], [0.055, -0.02], [0.05, -0.2], [0.04, -0.4], [0.001, -0.42]]), o.shorts || o.skirt ? skin : pants, kn);
    const ft = G(kn, 0, -0.42, 0); mk(new THREE.CapsuleGeometry(0.048, 0.12, 4, 10).rotateX(Math.PI / 2).scale(1.1, 0.75, 1), shoeM, ft, 0, -0.01, 0.05); return { th, kn, ft }; });
  // torso, chest, neck, head
  const spine = G(hips, 0, 0.08, 0), torso = mk(lath([[0.001, -0.02], [o.female ? 0.165 : 0.155, 0.0], [0.142, 0.12], [o.female ? 0.16 : 0.168, 0.28], [o.female ? 0.175 : 0.19, 0.38], [0.17, 0.45], [0.11, 0.51], [0.001, 0.53]], 24).scale(1, 1, 0.66), o.coat ? STDm({ color: o.coat }) : cloth, spine);
  if (o.vest) { mk(lath([[0.001, 0.05], [0.165, 0.05], [0.175, 0.3], [0.18, 0.44], [0.001, 0.45]], 18).scale(1.04, 1, 0.7), STDm({ color: o.vest, emissive: o.vest, emissiveIntensity: 0.15 }), spine); mk(new THREE.CylinderGeometry(0.182, 0.182, 0.035, 18).scale(1, 1, 0.71), STDm({ color: '#e8e8e0', emissive: '#c8c8c0', emissiveIntensity: 0.4 }), spine, 0, 0.22, 0); }
  if (o.pregnant) { const b = mk(new THREE.SphereGeometry(0.14, 20, 16).scale(0.95, 1.0, 0.9), o.coat ? STDm({ color: o.coat }) : cloth, spine, 0, 0.13, 0.07); P0.belly = b; }
  const neck = G(spine, 0, 0.5, 0); mk(new THREE.CylinderGeometry(0.048, 0.055, 0.08, 12), skin, neck, 0, 0.02, 0);
  const head = G(neck, 0, 0.04 + headR * 0.95, 0.01);
  mk(new THREE.SphereGeometry(headR, 32, 24).scale(0.92, 1.05, 1.0), skin, head);
  mk(new THREE.SphereGeometry(headR * 0.58, 16, 12).scale(0.95, 0.6, 0.9), skin, head, 0, -headR * 0.55, headR * 0.12);   // jaw / chin
  [-1, 1].forEach((s) => mk(new THREE.SphereGeometry(headR * 0.2, 10, 8).scale(0.45, 1, 0.75), skin, head, s * headR * 0.9, -0.005, -0.005));      // ears
  mk(new THREE.SphereGeometry(headR * 0.13, 12, 10).scale(0.85, 0.9, 1.1), skin, head, 0, -headR * 0.18, headR * 0.98);                          // nose
  // eyes: white, iris + pupil + highlight (move with the gaze), lids (skin caps that close), brows
  const eyeR = headR * 0.235, eyes = [-1, 1].map((s) => { const e = G(head, s * headR * 0.38, headR * 0.08, headR * 0.76);
    mk(new THREE.SphereGeometry(eyeR, 18, 14), white, e);
    const ir = G(e, 0, 0, 0), iris = mk(new THREE.CircleGeometry(eyeR * 0.62, 20), STDm({ color: o.iris || '#4a3020', roughness: 0.3 }), ir, 0, 0, eyeR * 1.01); const pup = mk(new THREE.CircleGeometry(eyeR * 0.3, 16), dark, ir, 0, 0, eyeR * 1.015);
    mk(new THREE.CircleGeometry(eyeR * 0.13, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), ir, eyeR * 0.2, eyeR * 0.22, eyeR * 1.02);
    const lidGeo = new THREE.SphereGeometry(eyeR * 1.12, 18, 10, 0, TAU, 0, Math.PI / 2), up = G(e), lo = G(e); mk(lidGeo, skin, up); const lw = mk(lidGeo, skin, lo); lw.rotation.x = Math.PI;
    const lash = mk(new THREE.TorusGeometry(eyeR * 1.13, eyeR * 0.075, 5, 16, Math.PI * 0.8), dark, up); lash.rotation.set(Math.PI / 2, 0, Math.PI * 0.1); lash.castShadow = false;
    const brow = G(head, s * headR * 0.37, headR * 0.36, headR * 0.86); mk(new THREE.CapsuleGeometry(eyeR * 0.24, eyeR * 1.3, 4, 8).rotateZ(Math.PI / 2), hairM, brow);
    return { e, ir, up, lo, brow, s }; });
  // the mouth: a filled shape rebuilt each frame (corners, upper and lower lip), dark inside, teeth when it opens
  const mouthG = G(head, 0, -headR * 0.46, headR * 0.9); mouthG.rotation.x = -0.18;
  const mouthM = new THREE.MeshStandardMaterial({ color: '#5a1e1e', roughness: 0.6, side: THREE.DoubleSide }), mouth = new THREE.Mesh(new THREE.BufferGeometry(), mouthM); mouthG.add(mouth);
  const teeth = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#f4f0e6', side: THREE.DoubleSide })); teeth.position.z = 0.0008; mouthG.add(teeth);
  const lipM = STDm({ color: o.lips || (o.female ? '#b05a5a' : '#a8705a'), roughness: 0.5 });
  const lipU = new THREE.Mesh(new THREE.BufferGeometry(), lipM), lipL = new THREE.Mesh(new THREE.BufferGeometry(), lipM); lipU.position.z = lipL.position.z = 0.0015; mouthG.add(lipU, lipL);
  const cheeks = [-1, 1].map((s) => { const c = mk(new THREE.SphereGeometry(headR * 0.16, 10, 8).scale(1, 0.7, 0.4), STDm({ color: '#e07a70', transparent: true, opacity: 0 }), head, s * headR * 0.55, -headR * 0.2, headR * 0.78); c.castShadow = false; return c; });
  const tearM = new THREE.MeshStandardMaterial({ color: '#cfe8ff', roughness: 0.05, transparent: true, opacity: 0.85 }), tears = [-1, 1].map((s) => { const g = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.05, 8, 6).scale(0.8, 1.3, 0.8), tearM); head.add(g); g.visible = false; return { g, s }; });
  // hair
  const hs = o.hairStyle || 'short', cap = (r, th = 0.62) => new THREE.SphereGeometry(r, 28, 18, 0, TAU, 0, Math.PI * th);
  if (hs !== 'none' && !o.helmet) { const hc = mk(cap(headR * 1.08, hs === 'short' ? 0.5 : 0.55), hairM, head, 0, headR * 0.06, -headR * 0.06); hc.rotation.x = -0.28;
    if (hs === 'bob' || hs === 'long' || hs === 'pigtails' || hs === 'pony' || hs === 'bun' || hs === 'curly') mk(new THREE.SphereGeometry(headR * 1.05, 20, 14).scale(1.02, 1.0, 0.85), hairM, head, 0, -headR * 0.05, -headR * 0.32);
    if (hs === 'bob') [-1, 1].forEach((s) => mk(new THREE.CapsuleGeometry(headR * 0.3, headR * 0.7, 4, 10), hairM, head, s * headR * 0.85, -headR * 0.35, -headR * 0.1));
    if (hs === 'long') { mk(new THREE.BoxGeometry(headR * 1.8, headR * 2.4, headR * 0.5), hairM, head, 0, -headR * 1.25, -headR * 0.55); [-1, 1].forEach((s) => mk(new THREE.CapsuleGeometry(headR * 0.28, headR * 1.6, 4, 10), hairM, head, s * headR * 0.86, -headR * 0.7, -headR * 0.05)); }
    if (hs === 'pony') { const p = mk(new THREE.CapsuleGeometry(headR * 0.28, headR * 1.3, 4, 10), hairM, head, 0, -headR * 0.5, -headR * 1.18); p.rotation.x = 0.35; mk(new THREE.TorusGeometry(headR * 0.24, headR * 0.06, 6, 12), STDm({ color: o.tie || '#e8508a' }), head, 0, headR * 0.12, -headR * 1.05).rotation.x = 1.2; }
    if (hs === 'bun') mk(new THREE.SphereGeometry(headR * 0.42, 14, 10), hairM, head, 0, headR * 0.75, -headR * 0.75);
    if (hs === 'pigtails') [-1, 1].forEach((s) => { const p = mk(new THREE.CapsuleGeometry(headR * 0.22, headR * 0.9, 4, 10), hairM, head, s * headR * 1.08, -headR * 0.35, -headR * 0.35); p.rotation.z = s * 0.35; mk(new THREE.SphereGeometry(headR * 0.12, 8, 6), STDm({ color: o.tie || '#e8508a' }), head, s * headR * 1.02, headR * 0.1, -headR * 0.35); });
    if (hs === 'curly') { const Rc = RNG('curl', o.seed || 1); for (let k = 0; k < 26; k++) { const a = Rc.r(0, TAU), el = Rc.r(-0.3, 1.2); mk(new THREE.SphereGeometry(headR * Rc.r(0.28, 0.4), 10, 8), hairM, head, Math.cos(a) * Math.cos(el) * headR * 1.05, Math.sin(el) * headR * 1.0 + headR * 0.05, Math.sin(a) * Math.cos(el) * headR * 1.0 - headR * 0.2); } } }
  if (o.helmet) { const hm = mk(cap(headR * 1.18, 0.5), STDm({ color: o.helmet, roughness: 0.4 }), head, 0, headR * 0.08, 0); mk(new THREE.CylinderGeometry(headR * 1.32, headR * 1.32, headR * 0.06, 24, 1, false, -Math.PI / 2, Math.PI), STDm({ color: o.helmet }), head, 0, headR * 0.1, headR * 0.1).rotation.y = 0; }
  if (o.glasses) [-1, 1].forEach((s) => { const r = mk(new THREE.TorusGeometry(eyeR * 1.35, eyeR * 0.12, 6, 18), dark, head, s * headR * 0.36, headR * 0.1, headR * 1.0); r.castShadow = false; });
  if (o.cap) { mk(cap(headR * 1.1, 0.45), STDm({ color: o.cap }), head, 0, headR * 0.12, 0); mk(new THREE.CylinderGeometry(headR * 0.7, headR * 0.7, headR * 0.05, 18, 1, false, -Math.PI / 2, Math.PI), STDm({ color: o.cap }), head, 0, headR * 0.35, headR * 0.6).rotation.x = -0.15; }
  // arms and hands
  const arms = [-1, 1].map((s) => { const sh = G(spine, s * 0.19, 0.42, 0); mk(new THREE.SphereGeometry(0.066, 14, 10), o.coat ? STDm({ color: o.coat }) : cloth, sh, 0, 0.0, 0); mk(lath([[0.001, 0.02], [0.058, 0.0], [0.052, -0.13], [0.045, -0.27], [0.001, -0.29]], 12), o.sleeve === 'short' ? cloth : cloth, sh);
    const el = G(sh, 0, -0.28, 0); mk(new THREE.SphereGeometry(0.046, 10, 8), o.sleeve === 'short' ? skin : (o.coat ? STDm({ color: o.coat }) : cloth), el); mk(lath([[0.001, 0.0], [0.043, -0.01], [0.04, -0.12], [0.033, -0.25], [0.001, -0.26]], 12), o.sleeve === 'short' ? skin : (o.coat ? STDm({ color: o.coat }) : cloth), el);
    const hand = G(el, 0, -0.27, 0); mk(new THREE.SphereGeometry(0.05, 12, 10).scale(0.85, 1.15, 0.55), skin, hand, 0, -0.045, 0); mk(new THREE.CapsuleGeometry(0.014, 0.03, 4, 6), skin, hand, s * -0.03, -0.025, 0.012).rotation.z = s * 0.6;
    if (o.sleeve === 'short') mk(lath([[0.001, 0.02], [0.064, 0.0], [0.06, -0.12], [0.001, -0.13]], 12), cloth, sh);
    return { sh, el, hand, s }; });
  const P = { belly: P0.belly, root, hips, spine, neck, head, legs, arms, eyes, mouth, mouthG, teeth, lipU, lipL, cheeks, tears, headR, eyeR, o, seed: o.seed || 1, held: null };
  return P;
}
// rebuild the mouth: smile (+ corners up), sad (corners down), open (0..1), wide, tremble
function setMouth(P, e) {
  const r = P.headR, w = r * (0.3 + 0.08 * (e.smile || 0) + 0.06 * (e.open || 0) - 0.05 * (e.pout || 0)), cy = r * (0.11 * (e.smile || 0) - 0.1 * (e.sad || 0) - 0.04 * (e.fear || 0)), open = r * (0.42 * (e.open || 0)) + 0.0015;
  const tr = (e.tremble || 0) * r * 0.012 * Math.sin(TT * 37 + P.seed);
  const top = r * (0.02 + 0.03 * (e.smile || 0)) + open * 0.15, bot = -open - r * 0.025 * (e.smile || 0) + tr;
  const N = 14, ptsU = [], ptsL = [];
  for (let i = 0; i <= N; i++) { const u = i / N * 2 - 1, k = 1 - u * u; ptsU.push([u * w, cy * Math.abs(u) ** 1.5 + top * k]); ptsL.push([u * w, cy * Math.abs(u) ** 1.5 + bot * k]); }
  const shape = new THREE.Shape(); ptsU.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y))); for (let i = N; i >= 0; i--) shape.lineTo(ptsL[i][0], ptsL[i][1]);
  P.mouth.geometry.dispose(); P.mouth.geometry = new THREE.ShapeGeometry(shape);
  const lip = (pts, dy, th) => { const s2 = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s2.lineTo(x, y + dy) : s2.moveTo(x, y + dy))); for (let i = pts.length - 1; i >= 0; i--) { const k = 1 - (i / N * 2 - 1) ** 2; s2.lineTo(pts[i][0], pts[i][1] + dy + th * (0.3 + 0.7 * k)); } return new THREE.ShapeGeometry(s2); };
  P.lipU.geometry.dispose(); P.lipU.geometry = lip(ptsU, 0, r * 0.035); P.lipL.geometry.dispose(); P.lipL.geometry = lip(ptsL, 0, -r * 0.05);
  const tv = (e.open || 0) > 0.12 && (e.smile || 0) > 0.2; P.teeth.visible = tv; if (tv) { P.teeth.scale.set(w * 1.3, open * 0.35, 1); P.teeth.position.set(0, top * 0.6 - open * 0.12, 0.0009); }
}
// pose a hero. q: { x, y, z, yaw, walk, ph, run, sit, kneel, lean, crouch, headYaw, headPitch, headRoll, armL/armR: [fwd, out, elbow, twist],
// legL/legR override, look: [x, y], emo: { smile, sad, fear, surprise, angry, cry, open, tremble, blink }, hug }
function posePerson(P, q) {
  const t = TT, w = q.walk || 0, run = q.run || 0, ph = q.ph ?? t * (6 + 4 * run), sit = q.sit || 0, kneel = q.kneel || 0, A = 0.45 * w + 0.6 * run;
  P.root.position.set(q.x || 0, (q.y || 0) - 0.44 * kneel * P.root.scale.y - 0.42 * sit * P.root.scale.y * 0, q.z || 0); P.root.rotation.set(0, q.yaw || 0, 0);
  const bob = (w + run) * 0.025 * Math.abs(Math.sin(ph)); P.hips.position.y = 0.92 + bob - 0.42 * sit - 0.44 * kneel;
  P.legs.forEach((L, i) => { const s = i ? 1 : -1, sw = Math.sin(ph + (i ? Math.PI : 0)), ov = i ? q.legR : q.legL;
    let hip = lerp(-sw * A, -1.5, sit), knee = lerp(Math.max(0, Math.sin(ph + 1.6 + (i ? Math.PI : 0))) * (0.7 * w + 1.2 * run), 1.55, Math.max(sit, kneel));
    if (kneel) hip = lerp(hip, i ? -1.4 : 0.0, kneel), knee = lerp(knee, i ? 1.5 : 1.6, kneel);
    if (ov) { hip = ov[0]; knee = ov[1]; }
    L.th.rotation.set(hip, 0, s * 0.03); L.kn.rotation.set(knee, 0, 0); L.ft.rotation.set(-knee * 0.4 - hip * 0.3 + (sit ? 0.0 : 0), 0, 0); });
  P.spine.rotation.set((q.lean || 0) + 0.15 * run + 0.25 * (q.crouch || 0), (q.twist || 0) + 0.12 * Math.sin(ph) * (w + run), (q.sway || 0));
  P.head.rotation.set((q.headPitch || 0) - 0.5 * (q.lean || 0) * 0.5, q.headYaw || 0, q.headRoll || 0);
  P.arms.forEach((Ar, i) => { const s = i ? 1 : -1, sw = Math.sin(ph + (i ? 0 : Math.PI)), ov = i ? q.armR : q.armL;
    let fwd = -sw * 0.5 * (w + 1.2 * run), out = 0.08, elbow = 0.15 + 0.6 * run + 0.15 * w, tw = 0;
    if (sit) { fwd = -0.55; elbow = 0.7; }
    if (ov) { fwd = ov[0]; out = ov[1]; elbow = ov[2]; tw = ov[3] || 0; }
    Ar.sh.rotation.set(-fwd, tw * s, s * out); Ar.el.rotation.set(-elbow, 0, 0); });
  // face
  const e = q.emo || {}, R = RNG('blink', P.seed), per = R.r(2.6, 4.2), bp = mod(t + R.r(0, 3), per), blinkK = e.blink ?? (bp < 0.14 ? Math.sin(bp / 0.14 * Math.PI) : 0);
  const lidUp = clamp(0.25 + 0.35 * (e.sad || 0) + 0.25 * (e.smile || 0) * 0.4 - 0.3 * (e.surprise || 0) - 0.15 * (e.fear || 0) + 0.25 * (e.cry || 0) + 0.35 * (e.angry || 0) + (e.sleepy || 0) * 0.5), lidK = Math.max(lidUp, blinkK);
  const look = q.look || [0, 0];
  P.eyes.forEach((E) => { E.up.rotation.x = lerp(-1.25, 0.2, lidK); E.lo.rotation.x = lerp(1.35, 0.95, clamp(0.4 * (e.smile || 0) + 0.3 * (e.cry || 0))) ;
    E.ir.rotation.set(-look[1] * 0.35, look[0] * 0.45, 0);
    const inner = (e.sad || 0) * 0.35 + (e.fear || 0) * 0.3 + (e.cry || 0) * 0.3 - (e.angry || 0) * 0.45 - (e.determined || 0) * 0.25;
    E.brow.rotation.z = -E.s * inner; E.brow.position.y = P.headR * (0.36 + 0.09 * (e.surprise || 0) + 0.05 * (e.fear || 0) - 0.03 * (e.angry || 0) - 0.02 * (e.determined || 0) + 0.02 * (e.sad || 0)); });
  setMouth(P, { smile: (e.smile || 0) * (1 - (e.cry || 0)), sad: Math.max(e.sad || 0, e.cry || 0) * 0.9 + (e.fear || 0) * 0.3, fear: e.fear || 0, open: Math.max(e.open || 0, (e.surprise || 0) * 0.55, (e.fear || 0) * 0.35, (e.cry || 0) * (0.25 + 0.2 * Math.max(0, Math.sin(t * 5 + P.seed)))), tremble: Math.max(e.tremble || 0, (e.cry || 0) * 0.8) });
  P.cheeks.forEach((c) => (c.material.opacity = 0.35 * (e.smile || 0) + 0.25 * (e.cry || 0) + (P.o.kid ? 0.12 : 0)));
  P.tears.forEach(({ g, s }, i) => { const c = e.cry || 0; g.visible = c > 0.2; if (!g.visible) return; const a = mod(t * 0.6 + i * 0.37, 1); g.position.set(s * P.headR * 0.4, P.headR * (0.0 - a * 0.7), P.headR * 0.92 - a * P.headR * 0.08); g.material.opacity = 0.85 * Math.sin(a * Math.PI); });
  if (q.cryShake) P.spine.rotation.x += 0.04 * Math.sin(t * 9 + P.seed) * q.cryShake;
}
// hide every part above a cut height (the vanishing: a body dissolves from the feet up into light motes) — implemented by scaling
function vanish(P, k) { P.root.visible = k < 0.999; P.root.traverse((m) => { if (m.isMesh) { if (!m.userData.mat0) { m.userData.mat0 = m.material; m.material = m.material.clone(); m.material.transparent = true; } m.material.opacity = 1 - k; } }); }

// ---- the crowd: thousands of simple instanced people (body, head, hair, arms up/down), coloured, posed in bulk
function makeCrowd(n, o = {}) {
  const R = RNG('crowd', o.seed || 1), grp = new THREE.Group();
  const body = IM(new THREE.CapsuleGeometry(0.17, 0.62, 4, 10).translate(0, 0.62, 0), STDm({ roughness: 0.85 }), n), head = IM(new THREE.SphereGeometry(0.115, 12, 10).translate(0, 1.24, 0), STDm({ roughness: 0.7 }), n), hair = IM(new THREE.SphereGeometry(0.125, 12, 8, 0, TAU, 0, Math.PI * 0.55).translate(0, 1.27, -0.01), STDm({ roughness: 0.7 }), n);
  const armG = new THREE.CapsuleGeometry(0.045, 0.5, 3, 6).translate(0, -0.25, 0), armL = IM(armG, STDm({ roughness: 0.85 }), n), armR = IM(armG, STDm({ roughness: 0.85 }), n);
  [body, head, hair, armL, armR].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; grp.add(m); });
  const L = []; const tops = o.tops || ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#c2185b', '#f4f1ea', '#a8402a', '#1e5aa8', '#f2c94c'];
  for (let i = 0; i < n; i++) { const q = { i, x: 0, y: 0, z: 0, yaw: 0, s: R.r(0.92, 1.06) * (R.f() < (o.kids || 0) ? 0.7 : 1), male: R.f() < (o.males ?? 0.5), ph: R.r(0, TAU), top: R.pick(tops), skin: R.pick(SKINS), hair: R.pick(HAIRS), long: R.f() < 0.5 };
    body.setColorAt(i, lin(q.top)); head.setColorAt(i, lin(q.skin)); hair.setColorAt(i, lin(q.hair)); armL.setColorAt(i, lin(q.top)); armR.setColorAt(i, lin(q.top)); L.push(q); }
  const C = { grp, L, body, head, hair, armL, armR,
    set(i, x, y, z, yaw, s, armsUp = 0, sway = 0, gone = 0) { const q = L[i]; if (gone >= 1) { [body, head, hair, armL, armR].forEach((m) => m.setMatrixAt(i, _hid)); return; } const k = s * q.s * (1 - gone);
      const B = M4().compose(_v.set(x, y, z), _q.setFromEuler(_e.set(0, yaw, sway)), _s.set(k, k, k)); body.setMatrixAt(i, B); head.setMatrixAt(i, B); hair.setMatrixAt(i, B);
      [armL, armR].forEach((m, j) => { const sg = j ? 1 : -1, up = armsUp * (0.8 + 0.2 * Math.sin(TT * 6 + q.ph + j)); m.setMatrixAt(i, B.clone().multiply(Tr(sg * 0.21, 1.02, 0)).multiply(Rz(sg * (0.12 + 2.6 * up))).multiply(Rx(-0.3 * up))); }); },
    done() { [body, head, hair, armL, armR].forEach((m) => (m.instanceMatrix.needsUpdate = true)); } };
  return C;
}
