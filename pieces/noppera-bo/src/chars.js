// =====================================================================
//  CHARS — the outside path in the rain (a footpath through susuki to the house, a roadside jizō with a red bib and a
//  candle offering, a stone tōrō), the rain, the chōchin; the people: my grandfather (sugegasa, mino, a chōchin in his
//  left fist), the crying woman (the Noppera-bo: a blank egg face that splits into a vertical mouth of human teeth),
//  my grandmother at the irori (the same blank face when she turns). Rig from pieces/gashadokuro and pieces/the-rake.
// =====================================================================
const PATH = [V3(-34, 0, 12), V3(-24, 0, 9.5), V3(-16, 0, 8.2), V3(-10, 0, 5.2), V3(-6.4, 0, 1.2)];
const PCURVE = new THREE.CatmullRomCurve3(PATH);
const PLEN = PCURVE.getLength();
function onPath(s, dx = 0) { const u = clamp(s / PLEN), p = PCURVE.getPointAt(u), tg = PCURVE.getTangentAt(u).setY(0).normalize(), sd = V3(tg.z, 0, -tg.x); p.addScaledVector(sd, dx); p.y = groundAt(p.x, p.z); return { p, tg, sd }; }
const JIZO_S = 17.5;   // where on the path the jizō stands (left side)

function texBib() { return txCanvas('bib', 32, 32, (x, w, h, R) => { x.fillStyle = '#8e2a1c'; x.fillRect(0, 0, w, h); speckle(x, R, w, h, 80, ['rgba(0,0,0,0.25)', 'rgba(255,200,180,0.1)']); }, [1, 1]); }
function mkPathSet(Wd) {
  const S = Wd.scene;
  // the footpath: a strip of wet packed earth just above the ground
  { const P = [], UV = [], idx = []; const n = 160; for (let i = 0; i <= n; i++) { const s = (i / n) * PLEN; [-0.75, 0, 0.75].forEach((dx, k) => { const q = onPath(s, dx).p; P.push(q.x, q.y + 0.02 + (k === 1 ? 0.005 : 0), q.z); UV.push(k / 2, s / 2); });
      if (i) { const a = (i - 1) * 3; for (let k = 0; k < 2; k++) idx.push(a + k, a + k + 1, a + k + 3, a + k + 1, a + k + 4, a + k + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals();
    if (g.attributes.normal.getY(4) < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.computeVertexNormals(); }
    const m = new THREE.Mesh(g, SM({ map: texDirt(), color: '#6a5a48', roughness: 0.4 })); m.receiveShadow = true; S.add(m); }
  // the jizō: a small stone monk on a base, a red bib, a little roof of planks, a candle and a cup of offerings
  { const { p, tg, sd } = onPath(JIZO_S, -1.35), g = new THREE.Group(); g.position.copy(p); g.rotation.y = Math.atan2(sd.x, sd.z); S.add(g); const st = SM({ map: texStone('jizo2', 0.6), color: '#6e6e66', roughness: 0.9 });
    bx(0.5, 0.25, 0.4, st, 0, 0.12, 0, g); const body = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.5, 10), st)); body.position.y = 0.5; g.add(body);
    const hd = sph(0.13, st, 1, 1.05, 1); hd.position.y = 0.86; g.add(hd); const bib = shd(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.26, 10, 1, true, -1.3, 2.6), SM({ map: texBib(), side: THREE.DoubleSide }))); bib.position.set(0, 0.62, 0.01); bib.rotation.x = Math.PI; g.add(bib);
    const wd = SM({ map: texPlank('jroof', '#3a2c1e') }); [-1, 1].forEach((k) => bx(0.04, 1.1, 0.04, wd, k * 0.32, 0.55, -0.25, g)); const rf = bx(0.8, 0.04, 0.6, wd, 0, 1.12, -0.05, g); rf.rotation.x = 0.25;
    const cd = cyl(0.012, 0.012, 0.09, SM({ color: '#e8e0d0' }), 6); cd.position.set(-0.15, 0.3, 0.16); g.add(cd);
    Wd.jizo = { g }; g.updateMatrixWorld(true); Wd.candleAt = g.localToWorld(V3(-0.15, 0.38, 0.16)); }
  // a stone tōrō by the house
  { const p = onPath(PLEN - 4.5, 1.4).p, st = SM({ map: texStone('toro', 0.8) }), g = new THREE.Group(); g.position.copy(p); S.add(g);
    const base = cyl(0.3, 0.34, 0.18, st, 6); base.position.y = 0.09; g.add(base); const post = cyl(0.1, 0.12, 0.8, st, 8); post.position.y = 0.6; g.add(post); const box = bx(0.32, 0.32, 0.32, st, 0, 1.15, 0, g); void box; const rf = shd(new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.25, 6), st)); rf.position.y = 1.45; g.add(rf); }
  // susuki along the path (short near it), wet
  const PS = []; for (let s = 0; s <= PLEN; s += 0.8) PS.push(onPath(s).p);
  Wd.grass = mkGrass(Wd, 26000, [-40, 0, -6, 24], (x, z) => groundAt(x, z), (x, z) => { if (inHouse(x, z) || x > HS.eng - 0.6) return false; let d = 9; PS.forEach((pp) => (d = Math.min(d, Math.hypot(x - pp.x, z - pp.z)))); if (d < 0.9) return false; if (d < 1.6) return 'short'; return true; }, ['#5a5a40', '#4a4c36', '#6a6448', '#3e4232', '#5e5640'], 'susuki', [0.3, 0.9]);
  // the rain: streaks in a box round the camera
  { const R = RNG('rain'), n = 1400, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3)); Wd.rainP = [...Array(n)].map(() => ({ x: R.r(-1, 1), y: R.r(0, 1), z: R.r(-1, 1), v: R.r(0.85, 1.15) }));
    Wd.rain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#9ab4b4', transparent: true, opacity: 0.55, depthWrite: false })); Wd.rain.frustumCulled = false; S.add(Wd.rain); }
}
function animRain(Wd, t, k, B = 7) {
  Wd.rain.visible = k > 0; if (!k) return; const cam = Wd.cam.position, P = Wd.rain.geometry.attributes.position; Wd.rain.material.opacity = 0.55 * k;
  Wd.rainP.forEach((q, i) => { const y = mod(q.y - t * 1.1 * q.v, 1), x = cam.x + q.x * B, z = cam.z + q.z * B, yy = cam.y - B * 0.4 + y * B; P.setXYZ(i * 2, x, yy, z); P.setXYZ(i * 2 + 1, x + 0.02, yy - 0.28, z + 0.01); }); P.needsUpdate = true;
}
// the chōchin on a short pole (stick along local X, the paper lantern hangs from its far end)
function mkChochin(Wd, P) {
  const g = new THREE.Group(); Wd.scene.add(g); const r = gripFit(P).r * 0.98, wood = SM({ map: texCedarBark(), color: '#a08060' });
  const st = cyl(r, r * 0.7, 0.5, wood, 7); st.rotation.z = Math.PI / 2; st.position.x = -0.2; g.add(st);
  const body = new THREE.Group(); Wd.scene.add(body); Wd.paperM = SM({ map: texLantern(), emissive: '#a0602a', emissiveIntensity: 1.0 }); const lm = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), Wd.paperM); lm.scale.set(0.085, 0.12, 0.085); body.add(lm); lm.castShadow = false;
  [-0.115, 0.115].forEach((y) => { const c = cyl(0.055, 0.055, 0.022, SM({ color: '#16110c' }), 10); c.position.y = y; c.castShadow = false; body.add(c); });
  const cord = new THREE.Mesh(UCYL1, SM({ color: '#16110c' })); Wd.scene.add(cord);
  return { g, body, cord, tip: V3(-0.44, 0, 0) };
}

// ---------------------------------------------------------------------
//  people: o = { kim: [base, patches], top (kasuri colour), skin, hair, bun, hat, mino, blank }
// ---------------------------------------------------------------------
function texBlank(k) { return txCanvas('blank' + k, 256, 128, (x, w, h, R) => { x.fillStyle = k.startsWith('gran') ? '#b89a82' : '#c4a68c'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) { x.fillStyle = R.pick(['rgba(140,110,90,0.12)', 'rgba(255,240,230,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 20), R); x.fill(); }
  const fx = w * 0.5; x.fillStyle = 'rgba(120,90,80,0.18)'; x.beginPath(); x.ellipse(fx, h * 0.62, 6, 18, 0, 0, TAU); x.fill(); }, [1, 1]); }   // the faintest dent where a nose should be
function mkPerson(o) {
  const pd = Object.assign({}, PDS.girl, o.pd || {}), g = new THREE.Group(), P = { kind: 'girl', pd, g };
  const skin = SM({ color: o.skin || '#a87a56', roughness: 0.75 }), nail = SM({ color: '#c09a80' }), kim = SM({ map: texKimono(o.key + 'k', o.kim[0], o.kim[1]) }), kim2 = SM({ map: texKimono(o.key + 'k2', o.kim[0], o.kim[1]), side: THREE.DoubleSide });
  const han = SM({ map: texKasuri(o.key + 'h', o.top), side: THREE.DoubleSide }), hairM = SM({ color: o.hair || '#0b0d10', roughness: 0.55 });
  const T = new THREE.Group(); g.add(T); P.T = T;
  const ch = capsule(0.1, pd.torso - 0.2, han, 12); ch.scale.set(1.15, 1, 0.82); ch.position.y = pd.torso * 0.55; T.add(ch); P.chest = ch;
  const pel = sph(0.11, kim, 1.1, 0.7, 0.9); pel.position.y = 0.03; T.add(pel);
  const obi = cyl(0.112, 0.112, 0.07, SM({ color: o.obi || '#8e3a24' }), 14); obi.scale.set(1.1, 1, 0.82); obi.position.y = 0.14; T.add(obi);
  const hL = [[0.15, 0.02], [0.14, 0.2], [0.13, pd.torso - 0.04], [0.07, pd.torso + 0.03]];
  const hm = shd(new THREE.Mesh(new THREE.LatheGeometry(hL.map(([r, y]) => new THREE.Vector2(r, y)), 20, 0.5, TAU - 1.0), han)); hm.scale.set(1.05, 1, 0.82); T.add(hm);
  if (o.mino) { const mL = [[0.3, -0.24], [0.26, 0.04], [0.21, 0.2], [0.16, pd.torso - 0.03], [0.07, pd.torso + 0.04]]; const mm = shd(new THREE.Mesh(new THREE.LatheGeometry(mL.map(([r, y]) => new THREE.Vector2(r, y)), 22, 0.62, TAU - 1.24), SM({ map: texMino(), alphaMap: texRag('mino'), alphaTest: 0.5, side: THREE.DoubleSide, color: '#b8a888' }))); mm.scale.set(1, 1, 0.85); mm.position.z = -0.02; T.add(mm); }
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(pd.headR, 24, 18), SM({ map: o.blank ? texBlank(o.key) : texFaceOf(o.face || 'girl'), color: '#ffffff', roughness: 0.6 }))); sk.scale.set(0.9, 1.08, 0.98); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
  const cap = sph(0.1, hairM, 0.95, 0.85, 0.95); cap.position.set(0, 0.03, -0.03); Hd.add(cap);
  if (o.bun) { const bun = sph(o.bun, hairM, 1.3, 0.8, 0.9); bun.position.set(0, 0.07, -0.1); Hd.add(bun); [-1, 1].forEach((s) => { const wg = sph(0.04, hairM, 0.7, 0.8, 1.1); wg.position.set(s * 0.085, 0.0, -0.03); Hd.add(wg); });
    const kg = cyl(0.004, 0.004, 0.2, SM({ color: '#c8a050' }), 5); kg.rotation.z = Math.PI / 2; kg.position.set(0, 0.08, -0.1); Hd.add(kg); }
  if (o.hat) { const hat = shd(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.13, 24, 1, true), SM({ map: texStraw(), color: '#c8b890', side: THREE.DoubleSide }))); hat.position.y = 0.125; Hd.add(hat); }
  if (o.blank) {   // the face that is not there: two skin flaps over the front of the head split down a vertical seam and swing open
    // like eyelids (k 0..1); under them raw flesh, two sunken eyes that look at you, a grin of human teeth on red gums, strands of
    // flesh stretched between the flaps
    const R = pd.headR, Fg = new THREE.Group(); Fg.scale.set(0.9, 1.08, 0.98); Hd.add(Fg); P.mouth = Fg;
    const skinF = SM({ map: texBlank(o.key + 'f'), color: '#ffffff', roughness: 0.6, side: THREE.DoubleSide }), raw = SM({ color: '#5a1a12', roughness: 0.35 }), wet = SM({ color: '#7a2418', roughness: 0.2 });
    const dark = BM('#040203'), gum = SM({ color: '#6a1e16', roughness: 0.3 }), tooth = SM({ color: '#d8cfb4', roughness: 0.35 });
    const In = new THREE.Group(); Fg.add(In); P.mIn = In;
    const fl = sph(1, raw, 0.068, 0.085, 0.022); fl.position.set(0, -0.004, R - 0.022); In.add(fl);
    for (let i = 0; i < 7; i++) { const v = bx(0.003, 0.05, 0.003, wet, (i - 3) * 0.02, 0.06 - Math.abs(i - 3) * 0.004, R - 0.0015, In); v.scale.y = 0.45; v.rotation.z = (i - 3) * 0.18; }
    [[-0.026, 0.028, 0.008, 0.012, 0.4], [0.025, 0.018, 0.01, 0.014, -0.3]].forEach(([x, y, sx, sy, rz]) => { const rim = sph(1, wet, sx * 1.6, sy * 1.45, 0.007); rim.position.set(x, y, R - 0.001); rim.rotation.z = rz; In.add(rim); const s = sph(1, dark, sx, sy, 0.008); s.position.set(x, y, R + 0.001); s.rotation.z = rz; In.add(s); const p = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 6, 4), BM(x > 0 ? '#c8261a' : '#e4e8e0')); p.position.set(x + 0.0015, y - 0.003, R + 0.009); In.add(p); }); [[0.034, 0.034, 0.7], [0.018, 0.006, -0.5], [0.04, 0.008, 1.9]].forEach(([x, y, r]) => { const cr = bx(0.0025, 0.016, 0.003, dark, x, y, R + 0.006, In); cr.rotation.z = r; });
    const gu = bx(0.084, 0.007, 0.006, gum, 0, -0.026, R + 0.004, In), gl = bx(0.076, 0.007, 0.006, gum, 0, -0.058, R + 0.002, In); void gu; void gl;
    const pit = sph(1, dark, 0.048, 0.016, 0.006); pit.position.set(0, -0.042, R + 0.002); In.add(pit);
    const RT = RNG('teeth' + o.key); for (let i = 0; i < 14; i++) { const x = (i - 6.5) * 0.0066, hh = RT.r(0.011, 0.021), t = shd(new THREE.Mesh(new THREE.BoxGeometry(0.0056, hh, 0.004), tooth)); t.position.set(x, -0.03 - hh / 2 + 0.006, R + 0.007 - x * x * 2); t.rotation.z = RT.n(0.14); In.add(t); }
    for (let i = 0; i < 13; i++) { const x = (i - 6) * 0.0066, hh = RT.r(0.01, 0.019), t = shd(new THREE.Mesh(new THREE.BoxGeometry(0.0054, hh, 0.004), tooth)); t.position.set(x, -0.054 + hh / 2 - 0.004, R + 0.005 - x * x * 2); t.rotation.z = RT.n(0.14); In.add(t); }
    // the flaps: front quarters of a shell a little larger than the skull, hinged at their outer edge
    const Rs = R * 1.06, half = 0.95, th0 = 0.55, thL = 1.9;
    P.mFlaps = [-1, 1].map((sd) => { const ph0 = sd > 0 ? Math.PI / 2 : Math.PI / 2 - half, geo = new THREE.SphereGeometry(Rs, 12, 12, ph0, half, th0, thL); const edge = sd > 0 ? ph0 + half : ph0;
      const hinge = V3(-Math.cos(edge) * Rs * 0.92, 0, Math.sin(edge) * Rs * 0.92), G = new THREE.Group(); G.position.copy(hinge); Fg.add(G); const m = shd(new THREE.Mesh(geo, skinF)); m.position.copy(hinge).negate(); G.add(m); G.userData = { sd }; return G; });
    P.mStr = [...Array(6)].map((_, i) => { const m = new THREE.Mesh(UCYL1, wet); Fg.add(m); m.userData = { y: -0.06 + i * 0.024, ph: i * 1.7 }; return m; });
  }
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.046, 0.04, 0.05, 0.042];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, han)), fo: shd(new THREE.Mesh(UCYL, han)), sj: sph(1, han), ej: sph(1, han), hand: mkHand(P, sd === 1 ? -1 : 1, skin, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m)));
  P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, han, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); if (o.hat) bx(0.075, 0.016, 0.2, SM({ map: texStraw() }), 0, -0.052, 0.04, fg); const ft = capsule(0.03, 0.15, o.hat ? SM({ color: '#d8d4c8' }) : skin, 6); ft.rotation.x = Math.PI / 2; ft.scale.set(1.1, 1, 0.7); ft.position.set(0, -0.035, 0.05); fg.add(ft); return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, kim)), sh: shd(new THREE.Mesh(UCYL, kim)), kj: sph(1, kim), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  const L = [[0.12, 0.02], [0.14, -0.12], [0.165, -0.42], [0.18, -0.62]]; P.skirt = shd(new THREE.Mesh(new THREE.LatheGeometry(L.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 20), kim2)); g.add(P.skirt);
  return P;
}
function openMouth(P, k) {   // the flaps swing open about their hinges; the strands stretch between their inner edges and snap as they part
  if (!P.mouth) return; P.mIn.visible = k > 0.01; const a = 1.2 * k, R = P.pd.headR * 1.06;
  P.mFlaps.forEach((G) => (G.rotation.y = G.userData.sd * a));
  P.mStr.forEach((m) => { const y = m.userData.y, w = 0.006 + 0.003 * Math.sin(TT * 3 + m.userData.ph), snap = k > 0.55 + 0.07 * Math.sin(m.userData.ph * 3); m.visible = k > 0.03 && !snap;
    if (!m.visible) return; const e = P.mFlaps.map((G) => { G.updateMatrix(); G.children[0].updateMatrix(); const p = V3(0, y, R * 0.995).applyMatrix4(G.children[0].matrix).applyMatrix4(G.matrix); return p; }); between(m, e[0], e[1], w * (1 - k * 0.8), w * (1 - k * 0.8)); });
}
// kneeling (seiza): pelvis on the heels, knees forward, shins on the floor. o: { at (floor point), F, lean, pitch, yaw, hands: [L, R], hdir, curl }
function kneel(P, o) {
  const pd = P.pd, F = o.F.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), base = o.at.clone(); base.y = groundAt(base.x, base.z) + (o.floor ?? 0);
  const lean = o.lean ?? 0.1, U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize(), B = frameOf(U, F);
  const pos = base.clone().add(V3(0, 0.27, 0)), top = pos.clone().addScaledVector(B.Y, pd.torso);
  const feet = [1, -1].map((sd) => base.clone().addScaledVector(F, -0.12).addScaledVector(Lx, sd * 0.09).add(V3(0, 0.05, 0)));
  const hL = o.hands ? o.hands[0] : base.clone().addScaledVector(F, 0.3).addScaledVector(Lx, 0.12).add(V3(0, 0.33, 0)), hR = o.hands ? o.hands[1] : base.clone().addScaledVector(F, 0.3).addScaledVector(Lx, -0.12).add(V3(0, 0.33, 0));
  poseP(P, { pos, U, F, head: headRel(B, o.pitch ?? 0.1, o.yaw ?? 0, o.roll ?? 0), hands: [hL, hR], hdir: o.hdir, epole: [Lx.clone().addScaledVector(DOWN, 0.6), Lx.clone().negate().addScaledVector(DOWN, 0.6)],
    feet, fdir: [{ Z: F.clone().negate().addScaledVector(DOWN, 0.6).normalize(), Y: UPV.clone() }, { Z: F.clone().negate().addScaledVector(DOWN, 0.6).normalize(), Y: UPV.clone() }], kpole: F.clone(), curl: o.curl || [0.4, 0.4], grip: o.grip || [false, false], breath: Math.sin(TT * (o.br ?? 2.4)), skirtLen: 0.45, skirtW: 1.25 });
  return { pos, top, B, F, Lx };
}
// walking with the chōchin in the left fist (walkGirl from pieces/gashadokuro)
function walkMan(Wd, o) {
  const P = Wd.man, pd = P.pd, F = o.D.clone().setY(0).normalize(), Lx = UPV.clone().cross(F), s = o.s, L = o.L ?? 0.46, ph = s / L;
  const feet = [], fdir = [];
  [0, 1].forEach((j) => { const oj = j * 0.5, u = ph - oj, n = Math.floor(u), f = u - n, side = j === 0 ? 1 : -1; let sp, lift = 0, pit = 0;
    if (f < 0.4) { const k = ss(0, 1, f / 0.4); sp = lerp((n - 0.32 + oj) * L, (n + 0.68 + oj) * L, k); lift = 0.07 * Math.sin(Math.PI * k); pit = 0.3 * Math.sin(Math.PI * k) * (1 - 2 * k); } else sp = (n + 0.68 + oj) * L;
    if (o.plant) sp = o.plant[j], lift = 0, pit = 0;
    const g = o.O.clone().addScaledVector(F, sp).addScaledVector(Lx, side * 0.08), gy = groundAt(g.x, g.z) + 0.02; feet.push(g.setY(gy + pd.ank + lift)); fdir.push({ Z: F.clone().applyAxisAngle(Lx, pit), Y: UPV.clone().applyAxisAngle(Lx, pit) }); });
  const mid = feet[0].clone().add(feet[1]).multiplyScalar(0.5), bob = o.plant ? 0 : 0.014 * Math.cos(TAU * 2 * ph), sway = o.plant ? 0 : 0.016 * Math.sin(TAU * ph);
  const lean = o.lean ?? 0.1, U = UPV.clone().multiplyScalar(Math.cos(lean)).addScaledVector(F, Math.sin(lean)).normalize();
  const pos = o.O.clone().addScaledVector(F, o.plant ? (o.plant[0] + o.plant[1]) / 2 : s).addScaledVector(Lx, sway).setY(mid.y - pd.ank + (pd.thigh + pd.shin) * 0.95 + bob);
  const B = frameOf(U, F), top = pos.clone().addScaledVector(B.Y, pd.torso), R = B.X.clone().negate(), SR = top.clone().addScaledVector(R, pd.shW), SL = top.clone().addScaledVector(B.X, pd.shW), swing = o.plant ? 0 : Math.sin(TAU * ph) * 0.13;
  const hL = SL.clone().addScaledVector(DOWN, 0.27).addScaledVector(F, 0.22).addScaledVector(B.X, -0.02), hR = o.handR || SR.clone().addScaledVector(DOWN, 0.38).addScaledVector(F, -swing + 0.04).addScaledVector(R, 0.04);
  poseP(P, { pos, U, F, head: o.head || headRel(B, o.pitch ?? 0.1, o.look ?? 0, 0), hands: [hL, hR], hdir: [{ Z: DOWN.clone().addScaledVector(F, 0.1).normalize(), Y: B.X.clone() }, o.hdR || { Z: DOWN.clone().addScaledVector(F, 0.15), Y: R.clone() }],
    epole: [B.X.clone().multiplyScalar(0.5).addScaledVector(DOWN, 0.6), R.clone().multiplyScalar(0.5).addScaledVector(F, -0.5).addScaledVector(DOWN, 0.4)], feet, fdir, kpole: F.clone().addScaledVector(UPV, 0.2), curl: [0, o.curlR ?? 0.45], grip: [true, false], breath: Math.sin(TT * 2.6), skirtLen: 0.7, skirtW: 1.0 });
  return { P, B, top, pos, F };
}
function holdChochin(Wd, k) {   // the lantern in his left fist; its light flickers with the flame
  const P = Wd.man, L = Wd.lant; [L.g, L.body, L.cord].forEach((m) => (m.visible = true)); holdProp(P, 0, L.g);
  const tip = L.g.localToWorld(L.tip.clone()), sw = V3(0.03 * Math.sin(TT * 2.6), 0, 0.03 * Math.cos(TT * 2.1)), c = tip.clone().add(V3(0, -0.2, 0)).add(sw);
  L.body.position.copy(c); L.body.rotation.set(sw.z * 2, 0, -sw.x * 2); between(L.cord, tip, c.clone().add(V3(0, 0.12, 0)), 0.003);
  const f = k * flick(TT, 21); Wd.matchL.position.copy(c); Wd.matchL.intensity = 3.6 * f; Wd.matchL.distance = 9; Wd.paperT.emissiveIntensity = 1.0 * f; Wd.paperT.emissive.set(k > 0.02 ? '#a0602a' : '#000000'); return c;
}
