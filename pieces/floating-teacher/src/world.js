// =====================================================================
//  WORLD — a wooden mountain-school classroom on a rainy afternoon in 1987: plank floor, wainscot and stained plaster,
//  ceiling boards and beams, four bare bulbs (one flickers), a wall of windows with rain on the glass and cedars in the
//  fog outside, the blackboard (a live canvas: sums, then DON'T LOOK UP), the platform and the teacher's desk, a clock,
//  posters, calligraphy sheets, cubbies, a stove, umbrellas. Thirty pupils (gakuran / sailor uniforms) and the teacher,
//  all on one point rig (pelvis + basis, two-bone IK arms and legs, so feet and hands land exactly where they are put).
//  The teacher: rust cardigan, long pleated skirt, a neck that is a bending chain, red eyes, long hair simulated
//  strand by strand so it always hangs under gravity around her head and body.
// =====================================================================
let R3 = null, WJ = null;
function rend() {
  if (R3) return R3;
  const cv = document.createElement('canvas'); cv.width = YK.LW; cv.height = YK.LH;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(YK.LW, YK.LH, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  R3 = { cv, r }; return R3;
}
const C3s = (a, b, k) => lin(a).lerp(lin(b), clamp(k));
const SM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
const shd = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const capsule = (r, l, mat, n = 8) => shd(new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, n), mat));
const sph = (r, mat, sx = 1, sy = 1, sz = 1) => { const m = shd(new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat)); m.scale.set(sx, sy, sz); return m; };
const bx = (w, h, d, mat, x, y, z, par) => { const m = shd(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); if (par) par.add(m); return m; };
const UCYL = new THREE.CylinderGeometry(0.8, 1, 1, 10);   // unit limb (tapers toward +y), placed with between()
const UCYL1 = new THREE.CylinderGeometry(1, 1, 1, 8);

// ---- the room
const RM = { x0: -5, x1: 5, z0: -4.6, z1: 6.2, h: 3.2 };
const PLAT_Y = 0.18, PLAT = { x0: -3.3, x1: 3.3, z0: -4.6, z1: -3.3 };
const BOARD = { x: 0, y: 1.55, z: -4.545, w: 4.4, h: 1.2, ppm: 250 };
const COLS = [-3.5, -2.5, -0.5, 0.5, 2.5, 3.5], ROWS = [-2.0, -0.8, 0.4, 1.6, 2.8];
const DESK_Y = 0.68, SEAT_Y = 0.38, CHAIR_DZ = 0.44;
const BEAMS = [-3.3, -1.0, 1.4, 3.8];
const BULBS = [V3(-1.5, 2.62, -1.7), V3(1.5, 2.62, -1.7), V3(-1.5, 2.62, 2.5), V3(1.5, 2.62, 2.5), V3(-0.6, 2.7, -3.75)];
const WINS = [[-3.9, -1.9], [-1.6, 0.4], [0.7, 2.7], [3.0, 5.0]], SILL = 0.85, WTOP = 2.7;
const MOTHER = [2, 4], BOY = [0, 2];   // [column, row]
const CLOCK = V3(3.05, 2.63, -4.47);   // the clock face centre

// ---- the point rig: everyone is built from parts placed in world space every frame
const PD = { torso: 0.47, shW: 0.19, hipW: 0.09, uArm: 0.29, fArm: 0.26, thigh: 0.42, shin: 0.42, ank: 0.07, headR: 0.105 };
function mkPerson(kind, o = {}) {
  const s = o.s ?? (kind === 'teacher' ? 1.0 : 0.9), R = RNG('person', o.seed ?? 0), g = new THREE.Group(), P = { kind, s, g, o, parts: {} };
  const skin = SM({ color: o.skin ?? (kind === 'teacher' ? '#b3b2a4' : R.pick(['#a87a56', '#b08460', '#9e7250', '#a67c5a'])), roughness: 0.7 });
  const hairM = SM({ color: '#0b0d10', roughness: 0.6 });
  let top, legs, shin, shoeC = '#16130f';
  if (kind === 'boy') { top = SM({ map: texWool('gak', '#191b20', 'rgba(255,255,255,0.07)') }); legs = top; shin = top; }
  else if (kind === 'girl') { top = SM({ map: texWool('sail', '#1d2438', 'rgba(255,255,255,0.07)') }); legs = SM({ map: texPleat('gskirt', '#1d2438') }); shin = skin; shoeC = '#2a1c12'; }
  else { top = SM({ map: texKnit() }); legs = SM({ color: '#d2cdbd', map: texCloth('stock', '#ffffff', 'rgba(0,0,0,0.08)', [1, 3]) }); shin = legs; }
  P.mat = { skin, top, legs, shin, hairM };
  // torso: pelvis and chest in one group (local: +y up the spine, +z front, +x the person's left)
  const T = new THREE.Group(); g.add(T); P.T = T;
  { const pel = sph(0.15 * s, kind === 'boy' ? legs : (kind === 'girl' ? legs : top), 1.15, 0.72, 0.85); pel.position.y = 0.03 * s; T.add(pel);
    const ch = capsule(0.155 * s, 0.24 * s, top, 12); ch.scale.set(1.2, 1, 0.76); ch.position.y = 0.29 * s; T.add(ch); P.chest = ch;
    { const tag = bx(0.04 * s, 0.016 * s, 0.004, SM({ color: '#e8e4d8' }), 0.065 * s, 0.37 * s, 0.127 * s, T); tag.rotation.y = 0.25; bx(0.04 * s, 0.004 * s, 0.005, SM({ color: '#8e3a24' }), 0.065 * s, 0.38 * s, 0.128 * s, T).rotation.y = 0.25; }   // name tag
    if (kind === 'boy') { const col = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.062 * s, 0.07 * s, 0.06 * s, 12), top)); col.position.y = 0.49 * s; T.add(col);
      const wc = shd(new THREE.Mesh(new THREE.TorusGeometry(0.063 * s, 0.006 * s, 4, 16), SM({ color: '#e8e4d8' }))); wc.rotation.x = Math.PI / 2; wc.position.y = 0.522 * s; T.add(wc);
      const pk = bx(0.05 * s, 0.006 * s, 0.004, SM({ color: '#3f4542' }), -0.07 * s, 0.33 * s, 0.123 * s, T); pk.rotation.y = -0.25;
      const gold = SM({ color: '#c8a050', roughness: 0.4 }); for (let k = 0; k < 5; k++) { const b = sph(0.011 * s, gold); b.position.set(0, (0.13 + k * 0.075) * s, 0.12 * s - Math.max(0, k - 2.5) * 0.004); T.add(b); } }
    if (kind === 'girl') { const sc = SM({ map: txCanvas('sailc', 64, 64, (x, w, h) => { x.fillStyle = '#1d2438'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8e4d8'; [6, 12].forEach((k) => { x.fillRect(k, k, w - 2 * k, 3); x.fillRect(k, k, 3, h - 2 * k); x.fillRect(w - k - 3, k, 3, h - 2 * k); }); }) });
      const flap = bx(0.3 * s, 0.22 * s, 0.012, sc, 0, 0.4 * s, -0.122 * s, T); flap.rotation.x = 0.12;
      [-1, 1].forEach((sd) => { const l = bx(0.045 * s, 0.2 * s, 0.012, sc, sd * 0.045 * s, 0.4 * s, 0.119 * s, T); l.rotation.z = -sd * 0.45; l.rotation.x = -0.12; });
      const red = SM({ color: '#8e3a24' }); const kn = sph(0.026 * s, red, 1.3, 0.8, 0.7); kn.position.set(0, 0.33 * s, 0.125 * s); T.add(kn);
      [-1, 1].forEach((sd) => { const t2 = bx(0.03 * s, 0.09 * s, 0.01, red, sd * 0.015 * s, 0.28 * s, 0.124 * s, T); t2.rotation.z = sd * 0.25; }); }
    if (kind === 'teacher') { const wh = SM({ color: '#d3d6cc' }); [-1, 1].forEach((sd) => { const c = bx(0.07, 0.05, 0.012, wh, sd * 0.04, 0.48, 0.105, T); c.rotation.z = sd * 0.7; c.rotation.x = -0.3; });
      const vee = bx(0.07, 0.2, 0.01, wh, 0, 0.4, 0.114, T); vee.rotation.x = -0.12;
      const btn = SM({ color: '#e6dcc4' }); for (let k = 0; k < 4; k++) { const b = sph(0.01, btn); b.position.set(0, 0.12 + k * 0.07, 0.12); T.add(b); } }
  }
  // head (local: +y crown, +z face, +x the person's left)
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd;
  { const sk = kind === 'teacher' ? shd(new THREE.Mesh(new THREE.SphereGeometry(PD.headR, 40, 30), SM({ color: '#ffffff', map: faceTex(0, 0), roughness: 0.7 }))) : sph(PD.headR * s, skin, 0.9, 1.05, 0.98);
    if (kind === 'teacher') sk.scale.set(0.86, 1.22, 0.95); Hd.add(sk); P.skull = sk;
    [-1, 1].forEach((sd) => { const e = sph(0.022 * s, skin, 0.5, 1, 0.8); e.position.set(sd * 0.094 * s, 0, -0.005); Hd.add(e); });
    const nose = sph(kind === 'teacher' ? 0.009 : 0.007 * s, kind === 'teacher' ? SM({ color: '#c9c6b6' }) : skin, 0.75, kind === 'teacher' ? 1.9 : 1.3, 1.0); nose.position.set(0, kind === 'teacher' ? -0.012 : -0.016 * s, kind === 'teacher' ? 0.093 : 0.1 * s); Hd.add(nose);
    if (kind === 'teacher') {
      // the face is painted on the skull (faceTex): sunken sockets, pin-prick pupils, cracks, a stretched mouth with blackened teeth
      const cap = sph(0.108, hairM, 0.98, 1.12, 1.0); cap.position.set(0, 0.035, -0.014); Hd.add(cap);
      [-1, 1].forEach((sd) => { const side = sph(0.05, hairM, 0.62, 1.9, 1.0); side.position.set(sd * 0.08, -0.02, -0.004); Hd.add(side); });
      // a centre parting: two halves meet in a thin pale line
      const part = bx(0.004, 0.003, 0.09, new THREE.MeshBasicMaterial({ color: '#9c968a' }), 0, 0.152, 0.03, Hd); part.rotation.x = 0.3;
    } else {
      [-1, 1].forEach((sd) => { const wh = new THREE.Mesh(new THREE.CircleGeometry(0.012 * s, 12), new THREE.MeshBasicMaterial({ color: '#cfc8b4' })); wh.position.set(sd * 0.036 * s, 0.01 * s, 0.0985 * s); wh.rotation.y = sd * 0.35; wh.scale.set(1.15, 0.62, 1); Hd.add(wh);
        const e = new THREE.Mesh(new THREE.CircleGeometry(0.0055 * s, 10), new THREE.MeshBasicMaterial({ color: '#120e0c' })); e.position.set(sd * 0.0358 * s, 0.0055 * s, 0.0995 * s); e.scale.set(0.85, 0.9, 1); e.rotation.y = sd * 0.35; Hd.add(e); (P.keyes = P.keyes || []).push({ wh, e, y0: 0.0055 * s });
        const br = bx(0.03 * s, 0.006 * s, 0.006 * s, hairM, sd * 0.037 * s, 0.035 * s, 0.093 * s, Hd); br.rotation.z = -sd * 0.12; });
      const mo = bx(0.022 * s, 0.004 * s, 0.006 * s, SM({ color: '#4a2a22' }), 0, -0.05 * s, 0.094 * s, Hd);
      const cap = sph(0.112 * s, hairM, 0.95, 0.86, 1.02); cap.position.set(0, 0.03 * s, -0.016 * s); Hd.add(cap);
      if (kind === 'boy') { const fr = bx(0.14 * s, 0.03 * s, 0.035 * s, hairM, 0, 0.078 * s, 0.07 * s, Hd); fr.rotation.x = -0.45; [-1, 1].forEach((sd) => { const sb = bx(0.02 * s, 0.05 * s, 0.06 * s, hairM, sd * 0.098 * s, 0.03 * s, 0.01 * s, Hd); sb.rotation.z = sd * 0.1; }); }
      if (kind === 'girl') { const bob = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.11 * s, 0.122 * s, 0.13 * s, 18, 1, true, Math.PI * 0.32, Math.PI * 1.36), SM({ color: '#0b0d10', side: THREE.DoubleSide }))); bob.position.set(0, -0.025 * s, -0.012 * s); Hd.add(bob);
        const fr = bx(0.15 * s, 0.035 * s, 0.03 * s, hairM, 0, 0.07 * s, 0.075 * s, Hd); fr.rotation.x = -0.35; }
      if (o.braids) P.braids = [-1, 1].map((sd) => { const bs = []; for (let k = 0; k < 6; k++) { const b = sph(0.025 * s * (1 - k * 0.05), hairM, 1, 1.15, 1); g.add(b); bs.push(b); }
        const rb = sph(0.019 * s, SM({ color: '#8e3a24' }), 1.6, 0.8, 1); g.add(rb); return { sd, bs, rb }; });
    }
  }
  // neck: a chain of segments (the teacher's can bend and grow); arms; legs; feet
  const nN = kind === 'teacher' ? 12 : 1; P.neck = []; for (let k = 0; k < nN; k++) { const c = shd(new THREE.Mesh(UCYL1, skin)); g.add(c); const j = sph(1, skin); g.add(j); P.neck.push({ c, j }); }
  const mkHand = (sd) => { const hg = new THREE.Group(); g.add(hg);
    if (kind === 'teacher') { const palm = sph(1, skin, 0.04, 0.015, 0.05); palm.position.z = 0.045; hg.add(palm); hg.userData.f = [];
      const wr = sph(1, skin, 0.03, 0.018, 0.03); wr.position.z = 0.0; hg.add(wr);
      for (let f = 0; f < 4; f++) { const kn = sph(0.0095, skin); kn.position.set((f - 1.5) * 0.0175 * -sd, 0.003, 0.088 - Math.abs(f - 1.3) * 0.005); hg.add(kn);
        let par = new THREE.Group(); par.position.copy(kn.position); par.rotation.y = (f - 1.5) * 0.06 * -sd; hg.add(par); const segs = [], k = 1.18 - Math.abs(f - 1.2) * 0.1;
        [0.04, 0.028, 0.022].forEach((L0, j) => { const L = L0 * k, sg = new THREE.Group(); sg.position.z = j ? segs[j - 1].userData.L : 0; par.add(sg); const r = 0.0078 - j * 0.0012, c = capsule(r, L, skin, 6); c.rotation.x = Math.PI / 2; c.position.z = L / 2; sg.add(c); sg.add(sph(r * 1.05, skin)); sg.userData.L = L; segs.push(sg); par = sg; });
        const nl = sph(1, SM({ color: '#8c8478' }), 0.0055, 0.002, 0.008); nl.position.set(0, 0.0055, segs[2].userData.L - 0.004); segs[2].add(nl); hg.userData.f.push(segs); }
      const th = new THREE.Group(); th.position.set(sd * 0.03, -0.008, 0.025); hg.add(th); hg.userData.th = th; hg.userData.ts = []; let par = th;
      [0.034, 0.026].forEach((L, j) => { const sg = new THREE.Group(); sg.position.z = j ? 0.034 : 0; par.add(sg); const c = capsule(0.009 - j * 0.001, L, skin, 6); c.rotation.x = Math.PI / 2; c.position.z = L / 2; sg.add(c); sg.add(sph(0.0095, skin)); hg.userData.ts.push(sg); par = sg; });
      hg.userData.sd = sd; }
    else { const m = sph(1, skin, 0.036 * s, 0.015 * s, 0.042 * s); m.position.z = 0.04 * s; hg.add(m);
      for (let f = 0; f < 4; f++) { const L = (0.052 - Math.abs(f - 1.2) * 0.005) * s, c = capsule(0.0068 * s, L, skin, 5); c.rotation.x = Math.PI / 2 + 0.08; c.position.set((f - 1.5) * 0.0145 * s * -sd, -0.002, 0.075 * s + L / 2); hg.add(c); }
      const th = capsule(0.0075 * s, 0.035 * s, skin, 5); th.rotation.set(Math.PI / 2, 0, 0); th.position.set(sd * 0.034 * s, -0.004, 0.05 * s); th.rotation.y = sd * 0.5; hg.add(th); }
    return hg; };
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg);
    if (kind === 'teacher') { const f = capsule(0.027, 0.16, legs, 8); f.rotation.x = Math.PI / 2; f.scale.set(1.1, 1, 0.75); f.position.set(0, -0.052, 0.045); fg.add(f); const an = sph(1, legs, 0.032, 0.045, 0.034); an.position.set(0, -0.02, -0.005); fg.add(an); }
    else { const sh = bx(0.09 * s, 0.065 * s, 0.25 * s, SM({ color: shoeC, roughness: 0.5 }), 0, -0.0375 * s, 0.05 * s, fg); if (kind === 'girl') { const so = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.052 * s, 0.05 * s, 0.11 * s, 10), SM({ color: '#e6e2d4' }))); so.position.y = 0.03 * s; fg.add(so); } }
    return fg; };
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, top)), fo: shd(new THREE.Mesh(UCYL, top)), sj: sph(1, top), ej: sph(1, top), cuff: kind === 'boy' ? null : null, hand: mkHand(sd === 1 ? -1 : 1) }));
  // hand side: arm[0] = left (local +x), arm[1] = right; the right hand's thumb is on its +x, the left's on its −x
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m)));
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, kind === 'girl' ? skin : legs)), sh: shd(new THREE.Mesh(UCYL, shin)), kj: sph(1, kind === 'girl' ? skin : legs), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  if (kind !== 'boy') { const L = kind === 'teacher' ? [[0.155, 0], [0.175, -0.15], [0.205, -0.5], [0.235, -0.85], [0.24, -1]] : [[0.14, 0], [0.16, -0.2], [0.18, -0.7], [0.19, -1]];
    P.skirt = shd(new THREE.Mesh(new THREE.LatheGeometry(L.map(([r, y]) => new THREE.Vector2(r * s, y)).reverse(), 24), SM({ map: kind === 'teacher' ? texPleat('tskirt', '#232c44') : texPleat('gskirt', '#1d2438'), side: THREE.DoubleSide }))); g.add(P.skirt); }
  if (kind === 'teacher') { mkHair(P); P.headS = 1.0; }
  return P;
}
// the chalk grip (right hand): index and middle over the chalk, thumb under it, ring and little finger curled in (solved in QA)
const HAND_GRIP = { f: [[0.6, 1.3, 1.0], [0.55, 1.2, 1.0], [1.0, 1.4, 1.0], [1.1, 1.4, 1.0]], t: [0.1, -0.1, 0.3, 0.2] };
// the chalk in that grip (hand-local, right hand): pinched between the index pad and the thumb pad, pointing forward and down
let _gripC = null;
function gripChalk() { if (_gripC) return _gripC; const it = fingerTipL(0, HAND_GRIP.f[0]), tt = thumbTipL(HAND_GRIP.t), mid = it.clone().add(tt).multiplyScalar(0.5), D = V3(0.1, -0.35, 1).normalize();
  return (_gripC = { mid, D, center: mid.clone().addScaledVector(D, 0.012), tip: mid.clone().addScaledVector(D, 0.0445) }); }
// forward kinematics of the teacher's hand (hand-local, mirrors mkHand): fingertip f (0 = index) and thumb tip, sd = +1 right
function fingerTipL(f, A, sd = 1) { const k = 1.18 - Math.abs(f - 1.2) * 0.1, L = [0.04, 0.028, 0.022].map((v) => v * k), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (f - 1.5) * 0.06 * -sd, 0));
  const p = V3((f - 1.5) * 0.0175 * -sd, 0.003, 0.088 - Math.abs(f - 1.3) * 0.005); for (let j = 0; j < 3; j++) { q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(A[j], 0, 0))); p.add(V3(0, 0, L[j]).applyQuaternion(q)); } return p; }
function thumbTipL(T, sd = 1) { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(T[0], sd * T[1], 0)), p = V3(sd * 0.03, -0.008, 0.025);
  q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(T[2], 0, 0))); p.add(V3(0, 0, 0.034).applyQuaternion(q)); q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(T[3], 0, 0))); p.add(V3(0, 0, 0.026).applyQuaternion(q)); return p; }
// the teacher's face, painted onto the skull sphere (u: around, front at u = 0.25; v: up). mouth 0..3 (closed → wide), red 0/1
const _face = {};
function faceTex(mouth, red) {
  const key = mouth + '_' + red; if (_face[key]) return _face[key];
  const t = g3Tex((x, w, h) => {
    const R = RNG('face'), cx = w * 0.25, ey = h * 0.465, ex = 36, my = h * 0.655;
    x.fillStyle = '#d6d2c2'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { x.fillStyle = R.pick(['rgba(120,130,120,0.10)', 'rgba(150,140,120,0.10)', 'rgba(240,238,228,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 22), RNG('fb', i)); x.fill(); }
    { const gs = x.createLinearGradient(cx - 90, 0, cx + 90, 0); gs.addColorStop(0, 'rgba(80,84,78,0.55)'); gs.addColorStop(0.3, 'rgba(80,84,78,0)'); gs.addColorStop(0.7, 'rgba(80,84,78,0)'); gs.addColorStop(1, 'rgba(80,84,78,0.55)'); x.fillStyle = gs; x.fillRect(0, 0, w, h); }
    // veins at the temples and forehead
    for (let i = 0; i < 14; i++) { let px = cx + (i % 2 ? 1 : -1) * R.r(40, 70), py = R.r(h * 0.25, h * 0.55); x.strokeStyle = 'rgba(90,110,130,0.45)'; x.lineWidth = R.r(0.8, 1.6); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += R.n(8); py += R.r(-10, 10); x.lineTo(px, py); } x.stroke(); }
    // sunken cheeks and temples
    [-1, 1].forEach((sd) => { const g = x.createRadialGradient(cx + sd * 40, my - 18, 2, cx + sd * 40, my - 18, 26); g.addColorStop(0, 'rgba(70,64,56,0.55)'); g.addColorStop(1, 'rgba(70,64,56,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    // sockets: deep, dark, wider than the eyes; the eyes small, dull, with pin-prick pupils
    [-1, 1].forEach((sd) => { const ox = cx + sd * ex, ey0 = ey; { const ey = ey0 + (sd < 0 ? 4 : 0); x.save(); x.translate(ox, ey); x.scale(sd < 0 ? 1.35 : 1.2, sd < 0 ? 1.12 : 1); const g = x.createRadialGradient(0, 2, 2, 0, 2, 26); g.addColorStop(0, 'rgba(8,6,6,1)'); g.addColorStop(0.55, 'rgba(24,18,16,0.95)'); g.addColorStop(1, 'rgba(60,50,44,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 2, 26, 0, TAU); x.fill(); x.restore();
      x.fillStyle = '#b4ab94'; x.beginPath(); x.moveTo(ox - 11, ey + 3); x.quadraticCurveTo(ox, ey - 3.5, ox + 11, ey + 2 - sd); x.quadraticCurveTo(ox, ey + 7, ox - 11, ey + 3); x.fill(); x.strokeStyle = 'rgba(150,40,30,0.7)'; x.lineWidth = 1; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(ox - sd * 10, ey + 2 + R.n(2)); x.lineTo(ox - sd * 4, ey + 2 + R.n(3)); x.stroke(); }
      if (red) { x.fillStyle = '#b3271c'; x.beginPath(); x.arc(ox + sd * 0.5, ey + 2, 2.6, 0, TAU); x.fill(); }
      x.fillStyle = '#050304'; x.beginPath(); x.arc(ox + sd * 0.5, ey + 2, 1.3, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(14,10,10,0.95)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(ox - 12, ey + 3); x.quadraticCurveTo(ox, ey - 4, ox + 12, ey + 1); x.stroke();   // the upper lid pressing down
      x.strokeStyle = 'rgba(40,34,30,0.6)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(ox - 10, ey + 13); x.quadraticCurveTo(ox, ey + 17, ox + 11, ey + 12); x.stroke(); } });   // bags under the eyes
    // nose: two dark nostril slits
    [-1, 1].forEach((sd) => { x.fillStyle = 'rgba(30,24,20,0.9)'; x.fillRect(cx + sd * 4 - 1, my - 26, 3, 2); });
    // cracks in the skin (from the mouth corners toward the ears too)
    x.lineCap = 'round';
    const crack = (px, py, n, dx, dy) => { x.strokeStyle = 'rgba(28,22,18,0.85)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < n; k++) { px += dx + R.n(4); py += dy + R.n(4); x.lineTo(px, py); } x.stroke(); };
    for (let i = 0; i < 10; i++) crack(cx + R.n(70), R.r(h * 0.22, h * 0.8), 5, R.n(5), R.r(2, 6));
    // the mouth: far too wide, slit up into the cheeks at both corners; open, it shows blackened teeth (ohaguro) and a dark throat
    const mw = 52, oh = [0, 10, 22, 36][mouth];
    [-1, 1].forEach((sd) => { x.strokeStyle = 'rgba(70,20,16,0.9)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx + sd * (mw - 4), my - 2); x.quadraticCurveTo(cx + sd * (mw + 10), my - 10, cx + sd * (mw + 22), my - 26); x.stroke();
      x.strokeStyle = 'rgba(20,10,8,0.95)'; x.lineWidth = 1.5; x.stroke(); });
    x.save(); x.translate(cx, my);
    const lens = () => { x.beginPath(); x.moveTo(-mw, -2); x.quadraticCurveTo(-mw * 0.5, -6, 0, -4 - oh * 0.15); x.quadraticCurveTo(mw * 0.5, -6, mw, -2); x.quadraticCurveTo(mw * 0.6, oh * 0.9 + 3, 0, oh + 4); x.quadraticCurveTo(-mw * 0.6, oh * 0.9 + 3, -mw, -2); x.closePath(); };
    x.fillStyle = '#5a3e40'; lens(); x.fill(); x.save(); x.scale(0.95, 0.85); x.fillStyle = '#0c0405'; lens(); x.fill(); x.restore();
    if (oh > 0) { x.save(); x.scale(0.95, 0.85); lens(); x.clip(); x.fillStyle = '#6a1e18'; x.fillRect(-mw, -12, 2 * mw, 7); x.fillRect(-mw, oh * 0.8, 2 * mw, 14);
      const T = RNG('teeth'); for (let k = -7; k <= 7; k++) { const tx = k * 6.6 + T.n(1), lu = 5 + T.r(0, 5) + oh * 0.12, ll = 4 + T.r(0, 4) + oh * 0.1;
        x.fillStyle = k % 2 ? '#2e2622' : '#3a312c'; x.fillRect(tx - 2.6, -6, 5.2, lu); x.fillStyle = '#a49c8c'; x.fillRect(tx - 1.6, -5, 1.6, lu - 2); x.fillStyle = '#0a0606'; x.fillRect(tx + 2.6, -6, 1.4, lu);
        x.fillStyle = k % 2 ? '#2a221e' : '#342c27'; x.fillRect(tx - 2.6, oh + 3 - ll, 5.2, ll); x.fillStyle = '#8a8274'; x.fillRect(tx - 1.6, oh + 4 - ll, 1.6, ll - 2); }
      x.restore(); }
    else { x.fillStyle = '#100808'; x.fillRect(-mw, -4, 2 * mw, 3); }
    x.restore();
    // wet black strands stuck across the face (over her right eye and down the cheek)
    for (let i = 0; i < 7; i++) { let px = cx - 18 - i * 6 + R.n(4), py = h * 0.24; x.strokeStyle = 'rgba(8,9,11,0.95)'; x.lineWidth = R.r(1.6, 3); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 8; k++) { px += R.r(-3, 4) - 0.6; py += h * 0.07; x.lineTo(px, py); } x.stroke(); }
    // the throat side and the back are greyer
    const g2 = x.createLinearGradient(0, h * 0.8, 0, h); g2.addColorStop(0, 'rgba(90,86,76,0)'); g2.addColorStop(1, 'rgba(90,86,76,0.6)'); x.fillStyle = g2; x.fillRect(0, 0, w, h);
  }, 512, 256);
  t.magFilter = THREE.LinearFilter; return (_face[key] = t);
}
// basis helpers
const qBasis = (X, Y, Z) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
function frameOf(U, F) { const u = U.clone().normalize(), f = F.clone().addScaledVector(u, -F.dot(u)).normalize(), x = u.clone().cross(f); return { X: x, Y: u, Z: f }; }
// place a person. st: { pos (pelvis), U, F, head: { Y, Z } | { pitch, yaw, roll }, hands: [wristL, wristR], hdir: [{ Z, Y }, ...], epole: [...],
//   feet: [ankleL, ankleR], fdir: [{ Z, Y }, ...], kpole: V3, neck: { len, c1, c2 } (teacher), breath, curl, skirtTo }
function poseP(P, st) {
  const s = P.s, B = frameOf(st.U, st.F), q = qBasis(B.X, B.Y, B.Z);
  P.g.visible = true; P.T.position.copy(st.pos); P.T.quaternion.copy(q);
  if (P.chest) P.chest.scale.set(1.2 * (1 + 0.02 * (st.breath ?? 0)), 1, 0.76 * (1 + 0.05 * (st.breath ?? 0)));
  const top = st.pos.clone().addScaledVector(B.Y, PD.torso * s);
  // head frame
  let HY, HZ; if (st.head && st.head.Y) { const f = frameOf(st.head.Y, st.head.Z); HY = f.Y; HZ = f.Z; }
  else { const h = st.head || {}, e = new THREE.Euler(h.pitch ?? 0, h.yaw ?? 0, h.roll ?? 0, 'YXZ'), hq = q.clone().multiply(new THREE.Quaternion().setFromEuler(e)); HY = V3(0, 1, 0).applyQuaternion(hq); HZ = V3(0, 0, 1).applyQuaternion(hq); }
  const HF = frameOf(HY, HZ); P.H.quaternion.copy(qBasis(HF.X, HF.Y, HF.Z));
  const nb = top.clone().addScaledVector(B.Y, -0.01 * s);
  let Hc;
  if (st.headPos) Hc = st.headPos.clone(); else { const nl = (st.neck && st.neck.len) ?? 0.075 * s; Hc = nb.clone().addScaledVector(HF.Y, nl + 0.095 * s * (P.headS ?? 1)); }
  P.H.position.copy(Hc);
  const hsc = P.headS ?? 1, hb = Hc.clone().addScaledVector(HF.Y, (P.kind === 'teacher' ? -0.068 : -0.08) * s * hsc).addScaledVector(HF.Z, (P.kind === 'teacher' ? -0.05 : -0.015) * s * hsc);
  { const n = P.neck.length, c1 = st.neck && st.neck.c1 ? st.neck.c1 : nb.clone().lerp(hb, 0.33).addScaledVector(B.Y, 0.0), c2 = st.neck && st.neck.c2 ? st.neck.c2 : nb.clone().lerp(hb, 0.66);
    const bez = (t) => { const a = 1 - t; return nb.clone().multiplyScalar(a * a * a).addScaledVector(c1, 3 * a * a * t).addScaledVector(c2, 3 * a * t * t).addScaledVector(hb, t * t * t); };
    const r = (P.kind === 'teacher' ? 0.034 : 0.045 * s);
    if (n === 1) { between(P.neck[0].c, nb, hb.clone().addScaledVector(HF.Y, 0.03 * s), r); P.neck[0].j.visible = false; }
    else { let prev = bez(0); P.neckPts = [prev]; for (let k = 0; k < n; k++) { const nx = bez((k + 1) / n); between(P.neck[k].c, prev, nx, r * (1 - 0.12 * k / n)); P.neck[k].j.position.copy(nx); P.neck[k].j.scale.setScalar(r * (1 - 0.12 * (k + 1) / n)); prev = nx; P.neckPts.push(nx); } } }
  // arms (two-bone IK to the wrist targets)
  P.arm.forEach((a, i) => {
    const S = top.clone().addScaledVector(B.X, a.sd * PD.shW * s).addScaledVector(B.Y, -0.035 * s), Wt = st.hands[i];
    const pole = (st.epole && st.epole[i]) || B.X.clone().multiplyScalar(a.sd * 0.4).addScaledVector(B.Z, -1).addScaledVector(B.Y, -0.3);
    const { E, W } = twoBone(S, Wt, PD.uArm * s, PD.fArm * s, pole); a.S = S; a.E = E; a.W = W;
    between(a.up, S, E, 0.058 * s); between(a.fo, E, W, 0.047 * s); a.sj.position.copy(S); a.sj.scale.setScalar(0.062 * s); a.ej.position.copy(E); a.ej.scale.setScalar(0.05 * s);
    const hd = (st.hdir && st.hdir[i]) || { Z: W.clone().sub(E).normalize(), Y: B.X.clone().multiplyScalar(a.sd) };
    const f = frameOf(hd.Y, hd.Z); a.hand.position.copy(W); a.hand.quaternion.copy(qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z)); a.hand.scale.setScalar(P.kind === 'teacher' ? 1 : 1);
    if (a.hand.userData.f) { const U = a.hand.userData, c = st.curl ? st.curl[i] : 0.3, G = st.grip && i === 1 ? HAND_GRIP : null;
      U.f.forEach((segs, k) => segs.forEach((sg, j) => (sg.rotation.x = G ? G.f[k][j] : c * [0.55, 0.8, 0.6][j] * (1 + 0.12 * k) + 0.05 * Math.sin(TT * 1.7 + k + i))));
      const tp = G ? G.t : [0.35 + 0.3 * c, -0.25, 0.25 * c, 0.3 * c]; U.th.rotation.set(tp[0], U.sd * tp[1], 0); U.ts[0].rotation.x = tp[2]; U.ts[1].rotation.x = tp[3]; }
  });
  // legs (two-bone IK to the ankle targets)
  P.leg.forEach((l, i) => {
    const Hj = st.pos.clone().addScaledVector(B.X, l.sd * PD.hipW * s).addScaledVector(B.Y, -0.03 * s), A = st.feet[i];
    const { E: K, W: Aw } = twoBone(Hj, A, PD.thigh * s, PD.shin * s, st.kpole || B.Z.clone().addScaledVector(B.Y, 0.2));
    l.H = Hj; l.K = K; l.A = Aw;
    const tch = P.kind === 'teacher'; between(l.th, Hj, K, (tch ? 0.062 : 0.078) * s); between(l.sh, K, Aw, (tch ? 0.042 : 0.056) * s); l.kj.position.copy(K); l.kj.scale.setScalar((tch ? 0.046 : 0.06) * s);
    const fd = (st.fdir && st.fdir[i]) || { Z: V3(B.Z.x, 0, B.Z.z).normalize(), Y: V3(0, 1, 0) }, f = frameOf(fd.Y, fd.Z);
    l.foot.position.copy(Aw); l.foot.quaternion.copy(qBasis(f.Y.clone().cross(f.Z), f.Y, f.Z));
  });
  if (P.skirt) { const w0 = st.pos.clone().addScaledVector(B.Y, 0.07 * s), kn = P.leg[0].K.clone().add(P.leg[1].K).multiplyScalar(0.5), an = P.leg[0].A.clone().add(P.leg[1].A).multiplyScalar(0.5);
    const to = P.kind === 'teacher' ? w0.clone().lerp(an, 0.72) : kn.clone().addScaledVector(kn.clone().sub(w0).normalize(), 0.03);
    const A = to.clone().sub(w0), L = A.length(); A.normalize(); const X = B.X.clone().addScaledVector(A, -B.X.dot(A)).normalize(), Y = A.clone().negate(), Z = X.clone().cross(Y);
    P.skirt.position.copy(w0); P.skirt.quaternion.copy(qBasis(X, Y, Z)); P.skirt.scale.set(1, L, P.kind === 'teacher' ? (st.skirtFlat ? 0.5 : 0.95) : 0.62); if (st.skirtFlat) P.skirt.position.y -= 0.05; }
  if (P.braids) { P.H.updateMatrixWorld(true); const cs = [[Hc, 0.118 * s], [st.pos.clone().addScaledVector(B.Y, 0.3 * s), 0.17 * s], [P.arm[0].S, 0.07 * s], [P.arm[1].S, 0.07 * s]];
    P.braids.forEach((br) => { let p = P.H.localToWorld(V3(br.sd * 0.085 * s, -0.07 * s, -0.04 * s)); br.bs.forEach((b, k) => { if (k) { p = p.clone().add(V3(0, -0.045 * s, 0)).addScaledVector(HF.Z, -0.006); for (const [c, r] of cs) { const d = p.clone().sub(c); if (d.length() < r) p.copy(c).addScaledVector(d.normalize(), r); } } b.position.copy(p); }); br.rb.position.copy(p).add(V3(0, -0.03 * s, 0)); }); }
  if (P.keyes) { const ew = st.eyesWide ?? 0; P.keyes.forEach((q) => { q.wh.scale.set(1.15, 0.62 + 0.55 * ew, 1); q.e.position.y = q.y0 + 0.004 * ew * s; }); }
  if (P.kind === 'teacher') P.skull.material.map = faceTex(Math.round(clamp(st.mouth ?? 0.15) * 3), (st.eyeRed ?? 1) > 0.5 ? 1 : 0);
  P.st = st; P.top = top;
}

// ---- the teacher's hair: strands rooted on the scalp, hanging under gravity, pushed out of her head, neck and body
function mkHair(P) {
  const R = RNG('hair'), roots = [];
  while (roots.length < 200) { const d = V3(R.n(1), R.n(1), R.n(1)); if (d.length() > 1 || d.length() < 0.2) continue; d.normalize();
    if (d.y < -0.3) continue; if (d.z > 0.25 && d.y < 0.62) continue; if (d.z > 0.1 && d.y < 0.3) continue; roots.push({ d, L: R.r(0.55, 0.92), ph: R.r(0, TAU), w: R.r(0.014, 0.024) }); }
  const K = 12, n = roots.length, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * (K - 1) * 6 * 3), 3)); geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * (K - 1) * 6 * 3), 3));
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: '#0c0e11', side: THREE.DoubleSide })); m.frustumCulled = false; m.castShadow = true; P.g.add(m);
  P.hair = { roots, K, m };
}
function updateHair(P, cam) {
  if (!P.hair || !P.g.visible) return; const { roots, K, m } = P.hair, s = P.s, Hc = P.H.position, hq = P.H.quaternion, st = P.st;
  const B = frameOf(st.U, st.F), g = V3(0, -1, 0), sw = P.sway ?? 1;
  const hs = P.headS ?? 1, hqi = hq.clone().invert(), ER = V3(0.116, 0.162, 0.124), EC = V3(0, 0.03, -0.012), cols = [[Hc, 0.0], [st.pos.clone().addScaledVector(B.Y, 0.2 * s).addScaledVector(B.Z, -0.01), 0.165], [st.pos.clone().addScaledVector(B.Y, 0.36 * s), 0.17], [P.arm[0].S, 0.075], [P.arm[1].S, 0.075]];
  (P.neckPts || []).forEach((p, k) => { if (k > 0) cols.push([p, 0.05]); });
  const pos = m.geometry.attributes.position.array, nor = m.geometry.attributes.normal.array, cp = cam.position; let o = 0;
  const pushE = (q) => { const l = q.clone().sub(Hc).applyQuaternion(hqi).sub(EC), u = V3(l.x / ER.x, l.y / ER.y, l.z / ER.z), n = u.length(); if (n < 1) { u.multiplyScalar(1 / n); q.copy(V3(u.x * ER.x, u.y * ER.y, u.z * ER.z).add(EC).applyQuaternion(hq).add(Hc)); } };
  const push = (q) => { for (let it = 0; it < 2; it++) { pushE(q); for (const [c, r] of cols) { if (!r) continue; const d = q.clone().sub(c), l = d.length(); if (l < r) q.copy(c).addScaledVector(d.normalize(), r); } } };
  roots.forEach((rt, i) => {
    const n = rt.d.clone().applyQuaternion(hq), p0 = V3(rt.d.x * ER.x, rt.d.y * ER.y, rt.d.z * ER.z).multiplyScalar(0.97).add(EC).applyQuaternion(hq).add(Hc); const loc = rt.d;
    const tl = V3(Math.abs(loc.x) < 0.05 ? (i % 2 ? 0.15 : -0.15) : Math.sign(loc.x) * 0.3, -0.2, -0.6).normalize().applyQuaternion(hq);
    let dir = n.clone().multiplyScalar(0.4).addScaledVector(tl, clamp(V3(0, 1, 0).applyQuaternion(hq).y * 1.2)).normalize(); const seg = rt.L * (P.hairLen ?? 1) / (K - 1), pts = [p0];
    const swayV = V3(Math.sin(TT * 1.3 + rt.ph) * 0.07, 0, Math.cos(TT * 1.1 + rt.ph * 1.3) * 0.07).multiplyScalar(sw);
    for (let k = 1; k < K; k++) { const p = pts[k - 1], rad = p.clone().sub(Hc).setY(0); if (rad.lengthSq() > 1e-6) rad.normalize(); dir = dir.multiplyScalar(0.45).add(g.clone().multiplyScalar(0.55)).add(swayV.clone().multiplyScalar(k / K)).addScaledVector(rad, 0.07 * k / K).normalize();
      let qn = p.clone().addScaledVector(dir, seg); push(qn); qn = p.clone().addScaledVector(qn.sub(p).normalize(), seg); push(qn); dir = qn.clone().sub(p).normalize(); pts.push(qn); }
    for (let k = 0; k < K - 1; k++) { const a = pts[k], b = pts[k + 1], d = b.clone().sub(a), v = cp.clone().sub(a).normalize(), side = d.clone().cross(v).normalize(), w0 = rt.w * (1 - 0.45 * k / K) * 0.5, w1 = rt.w * (1 - 0.45 * (k + 1) / K) * 0.5;
      const A1 = a.clone().addScaledVector(side, -w0), A2 = a.clone().addScaledVector(side, w0), B1 = b.clone().addScaledVector(side, -w1), B2 = b.clone().addScaledVector(side, w1);
      [A1, A2, B2, A1, B2, B1].forEach((pp) => { pos[o] = pp.x; pos[o + 1] = pp.y; pos[o + 2] = pp.z; nor[o] = v.x; nor[o + 1] = v.y; nor[o + 2] = v.z; o += 3; }); }
  });
  m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.normal.needsUpdate = true; m.geometry.computeBoundingSphere();
}
function twoBone(S, T, L1, L2, pole) {
  const d = T.clone().sub(S), len = clamp(d.length(), 0.02, L1 + L2 - 0.002), dir = d.normalize(), a = (L1 * L1 - L2 * L2 + len * len) / (2 * len), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const po = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize(); return { E: S.clone().addScaledVector(dir, a).addScaledVector(po, h), W: S.clone().addScaledVector(dir, len) };
}

// ---- props
function mkDesk(R) {
  const g = new THREE.Group(), top = SM({ map: texDesk(), color: '#c8a878' }), frame = SM({ color: '#3f4542', roughness: 0.5, metalness: 0.3 }), ply = SM({ color: '#7a5a3c', map: texDesk() });
  bx(0.62, 0.025, 0.44, top, 0, DESK_Y - 0.0125, 0, g);
  bx(0.58, 0.012, 0.36, ply, 0, 0.565, -0.03, g); bx(0.58, 0.09, 0.012, ply, 0, 0.61, -0.21, g); [-1, 1].forEach((sd) => bx(0.012, 0.09, 0.36, ply, sd * 0.29, 0.61, -0.03, g));
  [[-0.29, -0.2], [0.29, -0.2], [-0.29, 0.2], [0.29, 0.2]].forEach(([x, z]) => bx(0.025, DESK_Y - 0.025, 0.025, frame, x, (DESK_Y - 0.025) / 2, z, g));
  [-0.29, 0.29].forEach((x) => bx(0.02, 0.02, 0.4, frame, x, 0.12, 0, g));
  // books in the shelf, a notebook and a pencil case on top
  const bk = SM({ map: texBooks() }); bx(0.4, 0.07, 0.26, bk, R.r(-0.05, 0.05), 0.607, -0.06, g);
  const bk2 = new THREE.Group(); bk2.position.set(R.r(-0.04, 0.04), DESK_Y, R.r(-0.02, 0.03)); bk2.rotation.y = R.n(0.12); g.add(bk2); g.userData.notebook = bk2;
  [-1, 1].forEach((sd) => { const pg = bx(0.15, 0.008, 0.21, SM({ map: texPaper() }), sd * 0.074, 0.006, 0, bk2); pg.rotation.z = -sd * 0.07; });
  bx(0.31, 0.004, 0.22, SM({ color: R.pick(['#26304a', '#8e3a24', '#346c76']) }), 0, 0.002, 0, bk2);
  { const sx = Math.sign(R.f() - 0.5) || 1, bag = new THREE.Group(); bag.position.set(sx * 0.335, 0.47, 0.02); g.add(bag); const bc = R.pick(['#2b2219', '#3c2c1e', '#191b18', '#5a2418']);
    bx(0.05, 0.22, 0.3, SM({ color: bc, roughness: 0.6 }), 0, -0.11, 0, bag); bx(0.054, 0.08, 0.3, SM({ color: bc, roughness: 0.4 }), 0, -0.02, 0, bag); bx(0.056, 0.02, 0.03, SM({ color: '#b8995a' }), 0, -0.06, 0, bag);
    const st2 = shd(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.007, 4, 10, Math.PI), SM({ color: bc }))); st2.rotation.y = Math.PI / 2; st2.position.y = 0.0; bag.add(st2); bx(0.02, 0.02, 0.02, SM({ color: '#848a8b' }), -sx * 0.02, 0.06, 0, bag); }
  const pc = bx(0.2, 0.025, 0.06, SM({ color: R.pick(['#8e3a24', '#26304a', '#346c76', '#a07c50']) }), R.r(0.12, 0.18), DESK_Y + 0.0125, -0.14, g); pc.rotation.y = R.n(0.1);
  const pen = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.15, 6), SM({ color: '#c4a458' }))); pen.rotation.z = Math.PI / 2; pen.rotation.y = R.n(0.4); pen.position.set(R.r(-0.05, 0.1), DESK_Y + 0.004, -0.06); g.add(pen); g.userData.pen = pen;
  return g;
}
function mkChair() {
  const g = new THREE.Group(), wood = SM({ map: texDesk(), color: '#b08a5a' }), frame = SM({ color: '#3f4542', roughness: 0.5, metalness: 0.3 });
  bx(0.38, 0.02, 0.36, wood, 0, SEAT_Y - 0.01, 0, g); bx(0.36, 0.16, 0.02, wood, 0, 0.66, 0.19, g);
  [[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]].forEach(([x, z]) => bx(0.02, SEAT_Y - 0.02, 0.02, frame, x, (SEAT_Y - 0.02) / 2, z, g));
  [-0.17, 0.17].forEach((x) => bx(0.02, 0.32, 0.02, frame, x, SEAT_Y + 0.14, 0.18, g));
  return g;
}
function mkShoe(sd) {   // a woman's strap shoe (local: sole on y = 0, toe toward +z): rounded sole, toe cap, quarters, heel counter, strap
  const g = new THREE.Group(), m = SM({ color: '#4a3020', roughness: 0.3 }), inn = SM({ color: '#120c08', side: THREE.DoubleSide }), sole = SM({ color: '#140e0a' });
  const sh = new THREE.Shape(); sh.moveTo(0, -0.115); sh.bezierCurveTo(0.04, -0.115, 0.038, -0.03, 0.044, 0.04); sh.bezierCurveTo(0.048, 0.12, 0.01, 0.135, 0, 0.135); sh.bezierCurveTo(-0.012, 0.135, -0.046, 0.12, -0.042, 0.04); sh.bezierCurveTo(-0.038, -0.03, -0.04, -0.115, 0, -0.115);
  const so = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: false, curveSegments: 10 }), sole)); so.rotation.x = Math.PI / 2; so.position.y = 0.014; so.scale.z = 1; g.add(so);
  const ins = new THREE.Mesh(new THREE.ShapeGeometry(sh, 10), inn); ins.rotation.x = Math.PI / 2; ins.position.y = 0.0145; ins.scale.set(0.9, 0.95, 1); g.add(ins);
  const cap = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 18, 8, 0, TAU, 0, Math.PI / 2), m)); cap.scale.set(0.043, 0.04, 0.066); cap.position.set(0, 0.014, 0.068); g.add(cap);
  const wall = new THREE.Shape(sh.getPoints(24)), hole = new THREE.Path(sh.getPoints(24).map((p) => new THREE.Vector2(p.x * 0.86, p.y * 0.93 + 0.004))); wall.holes.push(hole);
  const wl = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(wall, { depth: 0.03, bevelEnabled: false }), m)); wl.rotation.x = Math.PI / 2; wl.position.y = 0.044; g.add(wl);
  const strap = bx(0.092, 0.007, 0.014, m, 0, 0.056, 0.0, g); const bk = bx(0.012, 0.012, 0.016, SM({ color: '#b8995a', roughness: 0.3 }), sd * 0.047, 0.05, 0.0, g);
  const heel = bx(0.05, 0.022, 0.045, sole, 0, 0.011, -0.088, g); void strap; void bk; void heel; void inn;
  return g;
}
function boardCanvas() {
  const c = document.createElement('canvas'); c.width = Math.round(BOARD.w * BOARD.ppm); c.height = Math.round(BOARD.h * BOARD.ppm); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return { c, t, key: '' };
}
// the sums (one line each), the layout in board pixels
const SUMS = ['問1  27 + 48 = 75', '問2  96 - 39 = 57', '問3  13 × 7 = 91', '問4  144 ÷ 12 = 1'];
const JPM = "'Hiragino Mincho ProN', serif", JPR = "'Hiragino Maru Gothic ProN', sans-serif";   // macOS system fonts (no web fonts)
const SUMX = 360, SUMY0 = 92, SUMDY = 52, SUMF = "600 34px " + JPR, BIGF = "600 104px " + JPM, BIG2F = "600 52px " + JPM;
function chalkify(x, w, h, seed, k = 0.35) {   // erode chalk strokes with noise so they read as chalk, not ink
  const R = RNG('chalk', seed); x.save(); x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < w * h * 0.004 * k; i++) { x.fillStyle = 'rgba(0,0,0,' + R.r(0.3, 0.9).toFixed(2) + ')'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 2)); } x.restore();
}
// brush chalk: the text stamped a few times along the stroke direction, then dry-brush gaps scraped out
let _brush = null;
function brushText(x, str, font, px, py, clipW, seed, alpha = 1) {
  const W2 = x.canvas.width, H2 = x.canvas.height; if (!_brush) { const c = document.createElement('canvas'); c.width = W2; c.height = H2; _brush = c.getContext('2d'); }
  const b = _brush, R = RNG('brush', seed); b.clearRect(0, 0, W2, H2); b.save(); b.beginPath(); b.rect(0, 0, clipW, H2); b.clip(); b.font = font; b.textAlign = 'left'; b.textBaseline = 'alphabetic'; b.fillStyle = '#f2f4ec';
  [[0, 0], [2, 1], [-1, 2], [3, -1]].forEach(([dx, dy]) => b.fillText(str, px + dx, py + dy)); b.restore();
  b.save(); b.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 260; i++) { const yy = R.r(0, H2), xx = R.r(0, W2); b.fillStyle = 'rgba(0,0,0,' + R.r(0.4, 0.95).toFixed(2) + ')'; b.fillRect(xx, yy, R.r(20, 90), R.r(1, 2.5)); }   // dry-brush streaks
  b.restore(); x.save(); x.globalAlpha = alpha; x.drawImage(b.canvas, 0, 0); x.restore();
}
function vText(x, str, px, py, size, font) { x.font = size + 'px ' + font; x.textAlign = 'center'; [...str].forEach((ch, i) => x.fillText(ch, px, py + i * size * 1.05)); }
// st: { lines: [chars shown per line], erase: 0..1, big: 0..1 (見上げるな / DON'T LOOK UP), ghost: 0..1 (old writing in the abandoned room) }
function drawBoard(Wd, st) {
  const Bc = Wd.board, key = JSON.stringify(st); if (Bc.key === key) return; Bc.key = key;
  const x = Bc.c.getContext('2d'), w = Bc.c.width, h = Bc.c.height, R = RNG('board');
  x.fillStyle = '#2f5650'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { x.fillStyle = R.pick(['rgba(200,220,210,0.07)', 'rgba(0,0,0,0.07)', 'rgba(220,230,220,0.06)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 60), RNG('bs', i)); x.fill(); }
  for (let i = 0; i < 16; i++) { x.strokeStyle = 'rgba(210,225,215,' + R.r(0.06, 0.14).toFixed(2) + ')'; x.lineWidth = R.r(30, 60); x.beginPath(); const cx = R.r(0, w), cy = R.r(0, h); x.arc(cx, cy, R.r(60, 180), R.r(0, 3), R.r(3, 6)); x.stroke(); }
  for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(215,228,220,0.07)'; x.fillRect(R.r(-100, w), R.r(0, h), R.r(200, 500), R.r(30, 60)); }
  // the date and the day's duty (日直) down the right edge, in vertical writing
  const gA = st.ghost ? 0.35 : 1;
  x.save(); x.globalAlpha = gA; x.fillStyle = 'rgba(232,236,226,0.85)'; x.font = "500 28px " + JPM; x.textAlign = 'right'; x.fillText('11月12日（木）', w - 30, 42);
  vText(x, '日直', w - 50, 92, 28, JPM); vText(x, '佐藤', w - 92, 92, 26, JPM); vText(x, '山田', w - 92, 168, 26, JPM);
  x.strokeStyle = 'rgba(232,236,226,0.6)'; x.lineWidth = 3; x.beginPath(); x.moveTo(w - 125, 62); x.lineTo(w - 125, h - 30); x.stroke(); x.restore();
  // the lesson: 数学 and the sums
  const ea = 1 - (st.erase ?? 0) - (st.ghost ? 1 - st.ghost : 0), lines = st.lines || [];
  if (ea > 0.01) { x.save(); x.globalAlpha = clamp(ea) * (st.ghost ? 0.45 : 1); x.fillStyle = '#eef0e6'; x.font = SUMF; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    lines.forEach((n, i) => { const s = SUMS[i].slice(0, Math.max(0, Math.floor(n))); if (s) x.fillText(s, SUMX, SUMY0 + i * SUMDY); });
    x.font = "600 54px " + JPM; x.fillText('数学', 70, 80); x.font = "500 26px " + JPM; x.fillText('わり算・かけ算', 50, 120); x.restore(); }
  if ((st.erase ?? 0) > 0 && (st.erase ?? 0) < 1.01) { x.save(); const e = st.erase; x.fillStyle = 'rgba(200,215,205,0.10)'; for (let k = 0; k < 7; k++) { const yy = 30 + k * 40; x.fillRect(30, yy, (w - 180) * clamp(e * 1.4 - k * 0.05), 34); } x.restore(); }
  // 見上げるな / DON'T LOOK UP, written by nothing, in brush chalk
  if ((st.big ?? 0) > 0) { const L1 = '見上げるな', L2 = "DON'T LOOK UP"; x.font = BIGF; const w1 = x.measureText(L1).width; x.font = BIG2F; const w2 = x.measureText(L2).width;
    const y1 = 158, y2 = 248, p = st.big * 2, x1 = (w - 130 - w1) / 2, x2 = (w - 130 - w2) / 2, a = st.ghost ? 0.5 * st.ghost : 1;
    brushText(x, L1, BIGF, x1, y1, x1 + w1 * clamp(p) + 4, 1, a); if (p > 1) brushText(x, L2, BIG2F, x2, y2, x2 + w2 * clamp(p - 1) + 4, 2, a);
    Bc.bigEnd = p < 1 ? [x1 + w1 * clamp(p), y1 - 60] : [x2 + w2 * clamp(p - 1), y2 - 24]; }
  chalkify(x, w, h, 1, 0.5); x.fillStyle = 'rgba(0,0,0,0)';
  Bc.t.needsUpdate = true;
}
// board pixel → world point on the board surface
const boardPt = (px, py, dz = 0) => V3(BOARD.x - BOARD.w / 2 + px / BOARD.ppm, BOARD.y + BOARD.h / 2 - py / BOARD.ppm, BOARD.z + dz);
let _mctx = null;
function sumX(i, n) { if (!_mctx) _mctx = document.createElement('canvas').getContext('2d'); _mctx.font = SUMF; return SUMX + _mctx.measureText(SUMS[i].slice(0, Math.max(0, Math.floor(n)))).width; }

function mkRoom(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); Wd.room = g;
  const floorM = SM({ map: texFloor() }), wains = SM({ map: texWainscot() }), plas = SM({ map: texPlaster(), color: '#c8ccc2' }), ceil = SM({ map: texCeiling() }), wood = SM({ color: '#4e3a28', map: texWainscot() }), dark = SM({ color: '#2b2219' });
  const W = RM.x1 - RM.x0, D = RM.z1 - RM.z0, cz = (RM.z0 + RM.z1) / 2;
  const fl = shd(new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorM)); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, cz); g.add(fl); floorM.map.repeat.set(3, 3.3);
  const ce = shd(new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceil)); ce.rotation.x = Math.PI / 2; ce.position.set(0, RM.h, cz); g.add(ce);
  BEAMS.forEach((z) => bx(W, 0.16, 0.14, dark, 0, RM.h - 0.08, z, g));
  bx(0.14, 0.16, D, dark, RM.x0 + 0.07, RM.h - 0.08, cz, g); bx(0.14, 0.16, D, dark, RM.x1 - 0.07, RM.h - 0.08, cz, g);
  // walls: wainscot below 0.9, plaster above, a dark rail between
  const wall = (x, y, z, w, h, d, m) => bx(w, h, d, m, x, y, z, g);
  wall(0, 0.45, RM.z0 - 0.05, W, 0.9, 0.1, wains); wall(0, 2.05, RM.z0 - 0.05, W, 2.3, 0.1, plas);
  wall(0, 0.45, RM.z1 + 0.05, W, 0.9, 0.1, wains); wall(0, 2.05, RM.z1 + 0.05, W, 2.3, 0.1, plas);
  wall(RM.x1 + 0.05, 0.45, cz, 0.1, 0.9, D, wains); wall(RM.x1 + 0.05, 2.05, cz, 0.1, 2.3, D, plas);
  [[0, RM.z0 + 0.01, W, 0.02], [0, RM.z1 - 0.01, W, 0.02]].forEach(([x, z, w, d]) => wall(x, 0.9, z, w, 0.05, d + 0.02, dark));
  wall(RM.x1 - 0.01, 0.9, cz, 0.04, 0.05, D, dark);
  // the window wall: low wall, piers, a header; sashes with muntins; glass with rain; the sill
  wall(RM.x0 - 0.05, SILL / 2, cz, 0.1, SILL, D, wains); wall(RM.x0 - 0.05, (WTOP + RM.h) / 2, cz, 0.1, RM.h - WTOP, D, plas);
  const piers = [[RM.z0, WINS[0][0]], ...WINS.slice(0, -1).map((w, i) => [w[1], WINS[i + 1][0]]), [WINS[WINS.length - 1][1], RM.z1]];
  piers.forEach(([a, b]) => wall(RM.x0 - 0.05, (SILL + WTOP) / 2, (a + b) / 2, 0.1, WTOP - SILL, b - a, plas));
  bx(0.16, 0.04, D, wood, RM.x0 + 0.06, SILL, cz, g);
  Wd.glass = []; const glassM = shaderMat({ t: { value: 0 }, k: { value: 1 } }, `uniform float t, k;
    void main(){ vec2 u=vUv*vec2(6.,5.); float c=floor(u.x*5.); float sp=0.3+h2(vec2(c,3.))*0.7; float y=fract(u.y*0.35+t*sp*0.25+h2(vec2(c,7.)));
      float streak=smoothstep(0.92,1.,y)*step(0.55,h2(vec2(c,floor(u.y*0.35+t*sp*0.25+h2(vec2(c,7.))))));
      float drop=step(0.985,h2(floor(vUv*vec2(90.,70.))+floor(t*0.5)));
      float a=(0.16+0.6*streak+0.5*drop)*k; gl_FragColor=vec4(mix(vec3(0.5,0.62,0.64),vec3(0.86,0.92,0.92),streak+drop),a);
      #END
    }`, { mat: { transparent: true, depthWrite: false, side: THREE.DoubleSide } }); Wd.glassM = glassM;
  const frM = SM({ color: '#5a4430', map: texWainscot() });
  WINS.forEach(([a, b], wi) => { const wz = b - a, mz = (a + b) / 2, wy = WTOP - SILL, my = (SILL + WTOP) / 2;
    [[a + 0.03, 0.06], [b - 0.03, 0.06], [mz, 0.05]].forEach(([z, t]) => bx(0.07, wy, t, frM, RM.x0 - 0.02, my, z, g));
    [SILL + 0.03, WTOP - 0.03].forEach((y) => bx(0.07, 0.06, wz, frM, RM.x0 - 0.02, y, mz, g));
    for (let k = 1; k < 3; k++) bx(0.04, 0.025, wz, frM, RM.x0 - 0.02, SILL + (wy * k) / 3, mz, g);
    [a + wz * 0.25, b - wz * 0.25].forEach((z) => bx(0.04, wy, 0.025, frM, RM.x0 - 0.02, my, z, g));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const pm = new THREE.Mesh(new THREE.PlaneGeometry(wz / 4 - 0.03, wy / 3 - 0.03), glassM); pm.rotation.y = Math.PI / 2; pm.position.set(RM.x0 - 0.03, SILL + (wy * (r + 0.5)) / 3, a + (wz * (c + 0.5)) / 4); pm.renderOrder = 4; g.add(pm); Wd.glass.push({ m: pm, wi, r, c }); } });
  // outside: wet ground, cedars in the fog, rain
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), SM({ color: '#1f2a22' })); ground.rotation.x = -Math.PI / 2; ground.position.set(RM.x0 - 20, -0.6, cz); Wd.scene.add(ground);
  Wd.forest = new THREE.Mesh(new THREE.PlaneGeometry(44, 16), new THREE.MeshBasicMaterial({ map: texForest(), fog: false })); Wd.forest.rotation.y = Math.PI / 2; Wd.forest.position.set(RM.x0 - 9, 4.0, cz); Wd.scene.add(Wd.forest);
  { const n = 1600, R = RNG('rain'); Wd.rainP = []; for (let i = 0; i < n; i++) Wd.rainP.push({ x: R.r(-8.5, -5.4), y: R.f(), z: R.r(-6, 8), v: R.r(0.8, 1.2) });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3)); Wd.rain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#b9cbc6', transparent: true, opacity: 0.5, depthWrite: false })); Wd.rain.frustumCulled = false; Wd.scene.add(Wd.rain); }
  // the platform and the blackboard wall
  bx(PLAT.x1 - PLAT.x0, PLAT_Y, PLAT.z1 - PLAT.z0, SM({ map: texFloor(), color: '#c8a878' }), 0, PLAT_Y / 2, (PLAT.z0 + PLAT.z1) / 2, g);
  bx(PLAT.x1 - PLAT.x0, 0.02, 0.03, dark, 0, PLAT_Y - 0.01, PLAT.z1, g);
  Wd.board = boardCanvas(); const bm = shd(new THREE.Mesh(new THREE.PlaneGeometry(BOARD.w, BOARD.h), SM({ map: Wd.board.t, roughness: 0.95 }))); bm.position.set(BOARD.x, BOARD.y, BOARD.z); g.add(bm); Wd.boardMesh = bm;
  const bf = SM({ color: '#6a5038', map: texWainscot() });
  bx(BOARD.w + 0.12, 0.06, 0.05, bf, 0, BOARD.y + BOARD.h / 2 + 0.03, RM.z0 + 0.025, g); bx(0.06, BOARD.h + 0.12, 0.05, bf, -BOARD.w / 2 - 0.03, BOARD.y, RM.z0 + 0.025, g); bx(0.06, BOARD.h + 0.12, 0.05, bf, BOARD.w / 2 + 0.03, BOARD.y, RM.z0 + 0.025, g);
  bx(BOARD.w + 0.12, 0.03, 0.11, bf, 0, BOARD.y - BOARD.h / 2 - 0.02, RM.z0 + 0.055, g);
  { const R = RNG('tray'), chalkC = ['#eeeadb', '#eeeadb', '#cfae78', '#b3271c', '#eeeadb']; for (let k = 0; k < 7; k++) { const c = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, R.r(0.04, 0.08), 6), SM({ color: R.pick(chalkC) }))); c.rotation.z = Math.PI / 2; c.rotation.y = R.n(0.3); c.position.set(R.r(-1.9, 1.9), BOARD.y - BOARD.h / 2 + 0.0, RM.z0 + 0.06); g.add(c); }
    [-1.3, 1.6].forEach((x) => { bx(0.13, 0.03, 0.05, SM({ color: '#26304a' }), x, BOARD.y - BOARD.h / 2 + 0.008, RM.z0 + 0.065, g); bx(0.13, 0.012, 0.05, SM({ color: '#d3d6cc' }), x, BOARD.y - BOARD.h / 2 - 0.012, RM.z0 + 0.065, g); }); }
  // the class motto over the board, the clock, a speaker box, a pointer and a big triangle ruler
  { const mt = txCanvas('motto2', 300, 60, (x, w, h, R) => { x.fillStyle = '#e8e2cc'; x.fillRect(0, 0, w, h); x.fillStyle = '#14110e'; x.font = "600 30px 'Hiragino Mincho ProN', serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('誠実・努力・友愛', w / 2, h / 2 + 1); });
    bx(1.36, 0.42, 0.03, dark, 0, 2.6, RM.z0 + 0.015, g); const mm = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.34), SM({ map: mt })); mm.position.set(0, 2.6, RM.z0 + 0.032); g.add(mm); }
  // the pendulum wall clock (柱時計) on a wooden panel, with a 1987 calendar beside it
  { const wood = SM({ color: '#8a6040', map: texDesk() }), dk = SM({ color: '#3c2c1e', map: texWainscot() }), brass = SM({ color: '#c8a050', roughness: 0.35, metalness: 0.3 });
    const pan = bx(0.86, 1.36, 0.012, SM({ map: texWainscot(), color: '#8a6a4a' }), CLOCK.x, 2.3, RM.z0 + 0.006, g); void pan;
    const cg = new THREE.Group(); cg.position.set(CLOCK.x, 0.18, RM.z0 + 0.012); g.add(cg);
    bx(0.42, 0.95, 0.015, dk, 0, 2.2, 0.0075, cg); bx(0.44, 0.48, 0.12, wood, 0, 2.45, 0.06, cg);
    [-1, 1].forEach((sd) => bx(0.03, 0.47, 0.12, wood, sd * 0.205, 1.975, 0.06, cg)); bx(0.44, 0.045, 0.12, wood, 0, 1.74, 0.06, cg); bx(0.5, 0.05, 0.14, dk, 0, 2.715, 0.06, cg);
    bx(0.4, 0.02, 0.125, wood, 0, 2.205, 0.062, cg);
    [[0, 2.198, 0.4, 0.016], [0, 1.756, 0.4, 0.016]].forEach(([x0, y0, ww, hh]) => bx(ww, hh, 0.01, dk, x0, y0, 0.122, cg)); [-1, 1].forEach((sd) => bx(0.016, 0.44, 0.01, dk, sd * 0.192, 1.977, 0.122, cg));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.42), new THREE.MeshBasicMaterial({ color: '#b9cbc6', transparent: true, opacity: 0.12, depthWrite: false })); glass.position.set(0, 1.977, 0.121); cg.add(glass);
    const gl2 = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.4), new THREE.MeshBasicMaterial({ color: '#eef6f4', transparent: true, opacity: 0.18, depthWrite: false })); gl2.position.set(-0.1, 1.98, 0.1215); gl2.rotation.z = -0.3; cg.add(gl2);
    Wd.pend = new THREE.Group(); Wd.pend.position.set(0, 2.17, 0.055); cg.add(Wd.pend); bx(0.012, 0.27, 0.006, brass, 0, -0.135, 0, Wd.pend);
    const bob = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 24), brass)); bob.rotation.x = Math.PI / 2; bob.position.y = -0.28; Wd.pend.add(bob);
    const bez = shd(new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.016, 6, 32), dk)); bez.position.set(0, 2.45, 0.122); cg.add(bez);
    const cl = new THREE.Group(); cl.position.copy(CLOCK); cl.position.z = RM.z0 + 0.012 + 0.121; g.add(cl);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), SM({ map: texClock() })); cl.add(face);
    const hand = (L, w, c) => { const h = new THREE.Group(); h.position.z = 0.004; cl.add(h); const b = new THREE.Mesh(new THREE.BoxGeometry(w, L, 0.003), new THREE.MeshBasicMaterial({ color: c })); b.position.y = L / 2 - 0.015; h.add(b); return h; };
    Wd.clock = { h: hand(0.085, 0.012, '#14110e'), m: hand(0.125, 0.008, '#14110e'), s: hand(0.135, 0.003, '#b3271c') }; const pin = sph(0.008, brass); pin.position.z = 0.008; cl.add(pin);
    // the calendar: Shōwa 62 (1987), November
    const calT = txCanvas('cal', 192, 280, (x, w, h, R) => { x.fillStyle = '#e8e2cc'; x.fillRect(0, 0, w, h); x.fillStyle = '#8e3a24'; x.fillRect(0, 0, w, 46); x.fillStyle = '#f2ead4'; x.font = "600 26px 'Hiragino Mincho ProN', serif"; x.textAlign = 'center'; x.fillText('昭和62年', w / 2, 33);
      x.fillStyle = '#14110e'; x.font = "700 92px 'Hiragino Mincho ProN', serif"; x.fillText('11', w / 2 - 22, 136); x.font = "600 26px 'Hiragino Mincho ProN', serif"; x.fillText('月', w / 2 + 52, 132);
      const dn = '日月火水木金土'; x.font = "500 15px 'Hiragino Maru Gothic ProN', sans-serif"; for (let k = 0; k < 7; k++) { x.fillStyle = k === 0 ? '#b3271c' : '#14110e'; x.fillText(dn[k], 18 + k * 26, 166); }
      for (let d = 1; d <= 30; d++) { const c = d % 7, r = Math.floor(d / 7); x.fillStyle = c === 0 ? '#b3271c' : '#2b2219'; x.fillText(String(d), 18 + c * 26, 190 + r * 20); }
      x.strokeStyle = '#b3271c'; x.lineWidth = 2; x.beginPath(); x.arc(18 + 4 * 26, 188 + 20, 11, 0, TAU); x.stroke(); });
    const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.44), SM({ map: calT })); cal.position.set(CLOCK.x + 0.62, 2.22, RM.z0 + 0.01); cal.rotation.z = 0.02; g.add(cal);
    const nail = sph(0.008, brass); nail.position.set(CLOCK.x + 0.62, 2.47, RM.z0 + 0.012); g.add(nail);
    // rain light: streak shadows sliding down the wall around the clock
    Wd.rainWall = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), shaderMat({ t: { value: 0 }, k: { value: 1 } }, `uniform float t, k;
      void main(){ vec2 u=vUv*vec2(26.,3.); float c=floor(u.x); float y=fract(u.y*0.6+t*(0.25+h2(vec2(c,1.))*0.3)+h2(vec2(c,2.))); float st=smoothstep(0.75,1.,y)*step(0.4,h2(vec2(c,5.)));
        float blob=smoothstep(0.55,0.8,n2(vUv*vec2(6.,4.)+vec2(0.,t*0.4)));
        float edge=smoothstep(0.,0.15,vUv.x)*smoothstep(1.,0.85,vUv.x)*smoothstep(0.,0.15,vUv.y)*smoothstep(1.,0.85,vUv.y);
        gl_FragColor=vec4(vec3(0.03,0.06,0.07),(st*0.28+blob*0.12)*edge*k);
        #END
      }`, { mat: { transparent: true, depthWrite: false } })); Wd.rainWall.position.set(3.55, 2.05, RM.z0 + 0.14); Wd.rainWall.renderOrder = 5; g.add(Wd.rainWall);
    Wd.wallLight = new THREE.PointLight('#f2d39a', 0, 3.5, 1.5); Wd.wallLight.position.set(2.55, 2.55, -3.75); g.add(Wd.wallLight); }
  bx(0.4, 0.3, 0.18, SM({ color: '#a07c50', map: texDesk() }), -3.7, 2.7, RM.z0 + 0.09, g); bx(0.3, 0.2, 0.01, SM({ color: '#2b2219' }), -3.7, 2.7, RM.z0 + 0.185, g);
  { const tri = new THREE.Shape(); tri.moveTo(0, 0); tri.lineTo(0.6, 0); tri.lineTo(0, 0.42); tri.lineTo(0, 0); const hole = new THREE.Path(); hole.moveTo(0.08, 0.06); hole.lineTo(0.4, 0.06); hole.lineTo(0.08, 0.28); hole.lineTo(0.08, 0.06); tri.holes.push(hole);
    const tm = shd(new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.01, bevelEnabled: false }), SM({ color: '#cfae78' }))); tm.position.set(-3.0, 1.2, RM.z0 + 0.005); g.add(tm);
    const pt = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 1.0, 6), SM({ color: '#a07c50' }))); pt.position.set(2.5, 0.68, RM.z0 + 0.05); pt.rotation.z = 0.15; g.add(pt); }
  // the teacher's desk on the platform: drawers, the register, a vase with dry flowers, books
  { const td = new THREE.Group(); td.position.set(2.2, PLAT_Y, -3.95); g.add(td); const tw = SM({ map: texDesk(), color: '#8a6a46' });
    bx(1.1, 0.04, 0.6, tw, 0, 0.74, 0, td); bx(0.04, 0.72, 0.58, tw, -0.53, 0.36, 0, td); bx(0.4, 0.72, 0.58, tw, 0.33, 0.36, 0, td); bx(1.06, 0.4, 0.02, tw, 0, 0.52, 0.28, td);
    for (let k = 0; k < 3; k++) { bx(0.36, 0.2, 0.01, SM({ color: '#6a5038' }), 0.33, 0.12 + k * 0.22, 0.295, td); bx(0.08, 0.015, 0.02, SM({ color: '#848a8b' }), 0.33, 0.15 + k * 0.22, 0.305, td); }
    bx(0.3, 0.03, 0.22, SM({ color: '#26304a' }), -0.2, 0.775, 0.05, td); bx(0.26, 0.05, 0.2, SM({ map: texBooks() }), 0.25, 0.785, -0.1, td);
    const vase = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.18, 10), SM({ color: '#346c76' }))); vase.position.set(0.4, 0.85, 0.12); td.add(vase);
    const R = RNG('flowers'); for (let k = 0; k < 6; k++) { const st = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.22, 4), SM({ color: '#5a4430' }))); st.position.set(0.4 + R.n(0.03), 1.02, 0.12 + R.n(0.03)); st.rotation.set(R.n(0.3), 0, R.n(0.3)); td.add(st); const fl = sph(0.018, SM({ color: R.pick(['#cfae78', '#8e3a24', '#a07c50']) })); fl.position.set(st.position.x + Math.sin(st.rotation.z) * -0.11, 1.12, st.position.z + Math.sin(st.rotation.x) * 0.11); td.add(fl); } }
  // the right wall: sliding doors, corridor transoms, posters, a cork board; the back: cubbies, calligraphy, a cork board
  { const dm = SM({ color: '#5a4430', map: texWainscot() }), dg = SM({ color: '#0b1a22' });
    [[-3.3, -2.0], [4.5, 5.8]].forEach(([a, b]) => { const mz = (a + b) / 2, wz = b - a; bx(0.04, 2.0, wz, dm, RM.x1 - 0.02, 1.0, mz, g); [a + wz * 0.25, b - wz * 0.25].forEach((z) => { bx(0.02, 0.6, wz * 0.38, dg, RM.x1 - 0.045, 1.55, z, g); });
      bx(0.06, 0.06, wz + 0.1, dark, RM.x1 - 0.03, 2.03, mz, g); bx(0.06, 2.05, 0.06, dark, RM.x1 - 0.03, 1.02, a - 0.03, g); bx(0.06, 2.05, 0.06, dark, RM.x1 - 0.03, 1.02, b + 0.03, g); });
    for (let k = 0; k < 9; k++) { const z = RM.z0 + 0.6 + k * 1.15; bx(0.03, 0.38, 1.0, dg, RM.x1 - 0.02, 2.55, z, g); bx(0.04, 0.42, 0.04, dark, RM.x1 - 0.03, 2.55, z - 0.52, g); }
    [-0.9, 0.3, 1.5].forEach((z, i) => { const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), SM({ map: texPoster(i) })); pm.rotation.y = -Math.PI / 2; pm.position.set(RM.x1 - 0.005, 1.55, z); g.add(pm); });
    bx(0.02, 0.8, 1.4, SM({ color: '#a07c50' }), RM.x1 - 0.01, 1.5, 3.2, g); for (let k = 0; k < 5; k++) { const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.32), SM({ map: texPoster(k + 3) })); pm.rotation.y = -Math.PI / 2; pm.position.set(RM.x1 - 0.025, 1.5 + (k % 2 ? 0.18 : -0.15), 2.7 + k * 0.25); pm.rotation.x = (k - 2) * 0.04; g.add(pm); }
    const cub = SM({ map: texDesk(), color: '#8a6a46' }); for (let c = 0; c <= 12; c++) bx(0.03, 1.0, 0.36, cub, -4.6 + c * 0.75, 0.5, RM.z1 - 0.18, g); [0.02, 0.5, 0.98].forEach((y) => bx(9.1, 0.03, 0.36, cub, -0.1, y, RM.z1 - 0.18, g));
    const R = RNG('bags'); for (let c = 0; c < 12; c++) for (let r = 0; r < 2; r++) if (R.f() < 0.8) { const bag = bx(R.r(0.3, 0.5), R.r(0.2, 0.36), 0.22, SM({ color: R.pick(['#2b2219', '#5a2418', '#26304a', '#3c2c1e', '#1f3c44', '#a07c50']) }), -4.6 + c * 0.75 + 0.375, 0.04 + r * 0.48 + 0.12, RM.z1 - 0.2, g); bag.position.y = r * 0.48 + 0.035 + bag.geometry.parameters.height / 2; }
    for (let k = 0; k < 12; k++) { const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.6), SM({ map: texShuji(k) })); pm.rotation.y = Math.PI; pm.position.set(-4.2 + k * 0.72, 1.75, RM.z1 - 0.005); pm.rotation.z = Math.sin(k * 3.1) * 0.03; g.add(pm); }
    bx(9.4, 0.02, 0.02, dark, 0, 2.06, RM.z1 - 0.01, g);
    // umbrellas in a stand by the back door
    const st = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.45, 12, 1, true), SM({ color: '#3f4542', side: THREE.DoubleSide }))); st.position.set(4.6, 0.225, 4.0); g.add(st);
    for (let k = 0; k < 5; k++) { const u = new THREE.Group(); u.position.set(4.6 + Math.cos(k * 1.3) * 0.08, 0.05, 4.0 + Math.sin(k * 1.3) * 0.08); u.rotation.set(Math.sin(k) * 0.12, 0, Math.cos(k * 2) * 0.12); g.add(u);
      const cn = shd(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.7, 8), SM({ color: ['#26304a', '#8e3a24', '#191b18', '#346c76', '#5a4430'][k] }))); cn.position.y = 0.45; cn.rotation.x = Math.PI; u.add(cn);
      const hd = shd(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 4, 10, Math.PI), SM({ color: '#2b2219' }))); hd.position.set(0.035, 0.85, 0); u.add(hd); const sh2 = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 4), SM({ color: '#2b2219' }))); sh2.position.y = 0.82; u.add(sh2); } }
  // the stove: a round iron body, a kettle, a pipe up and out through the wall, a guard rail
  { const iron = SM({ color: '#2b2d29', roughness: 0.5, metalness: 0.4 }); const stv = new THREE.Group(); stv.position.set(4.45, 0, 0.6); g.add(stv);
    const bd = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.62, 16), iron)); bd.position.y = 0.42; stv.add(bd); bx(0.5, 0.06, 0.5, iron, 0, 0.06, 0, stv);
    const lid = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.04, 16), iron)); lid.position.y = 0.75; stv.add(lid);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshBasicMaterial({ color: '#cf7a3a' })); glow.position.set(-0.23, 0.32, 0); glow.rotation.y = -Math.PI / 2; stv.add(glow); Wd.stoveGlow = glow;
    const ket = shd(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), SM({ color: '#848a8b', metalness: 0.5, roughness: 0.4 }))); ket.scale.y = 0.7; ket.position.y = 0.84; stv.add(ket);
    const pipe = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.95, 10), iron)); pipe.position.y = 1.75; stv.add(pipe);
    const pipe2 = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 10), iron)); pipe2.rotation.z = Math.PI / 2; pipe2.position.set(0.28, 2.72, 0); stv.add(pipe2); const elb = sph(0.065, iron); elb.position.y = 2.72; stv.add(elb);
    for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; const r = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 5), SM({ color: '#848a8b' }))); r.position.set(Math.cos(a) * 0.42, 0.35, Math.sin(a) * 0.42); stv.add(r); }
    const ring = shd(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.012, 4, 24), SM({ color: '#848a8b' }))); ring.rotation.x = Math.PI / 2; ring.position.y = 0.7; stv.add(ring); }
  // bulbs on cords, with glows and warm point lights
  Wd.bulbs = BULBS.map((p, i) => { const cord = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, RM.h - p.y, 4), SM({ color: '#14110e' }))); cord.position.set(p.x, (RM.h + p.y) / 2 + 0.05, p.z); g.add(cord);
    const sock = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.06, 8), SM({ color: '#2b2219' }))); sock.position.set(p.x, p.y + 0.07, p.z); g.add(sock);
    const shade = shd(new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.1, 16, 1, true), SM({ color: '#d3d6cc', side: THREE.DoubleSide }))); shade.position.set(p.x, p.y + 0.06, p.z); g.add(shade);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshBasicMaterial({ color: '#fbf1d0' })); b.position.copy(p); g.add(b);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,250,225,1)'], [0.25, 'rgba(255,235,190,0.45)'], [1, 'rgba(255,220,170,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.7); s.position.copy(p); g.add(s);
    const l = new THREE.PointLight('#f2d39a', 1.4, 7, 1.4); l.position.copy(p).add(V3(0, -0.06, 0)); g.add(l); return { b, s, l, i }; });
  // desks, chairs and the pupils
  Wd.desks = []; Wd.kids = [];
  ROWS.forEach((z, ri) => COLS.forEach((x, ci) => { const R = RNG('desk', ri, ci), d = mkDesk(R); d.position.set(x, 0, z); g.add(d); const c = mkChair(); c.position.set(x, 0, z + CHAIR_DZ); g.add(c);
    const isM = ci === MOTHER[0] && ri === MOTHER[1], isB = ci === BOY[0] && ri === BOY[1], kind = isM ? 'girl' : isB ? 'boy' : (R.f() < 0.5 ? 'girl' : 'boy');
    const kid = mkPerson(kind, { seed: ri * 10 + ci, braids: isM || (kind === 'girl' && R.f() < 0.25), s: R.r(0.88, 0.94) }); Wd.scene.add(kid.g);
    kid.desk = d; kid.chair = c; kid.ci = ci; kid.ri = ri; kid.ph = R.r(0, TAU); kid.bow = R.r(0.35, 0.6); kid.yaw = R.n(0.12);
    Wd.desks.push({ d, c, x, z, R0: { dp: d.position.clone(), cp: c.position.clone() } }); Wd.kids.push(kid); if (isM) Wd.mother = kid; if (isB) Wd.boy = kid; }));
}
function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene }; WJ = Wd;
  scene.background = lin('#0b1a22'); scene.fog = new THREE.Fog('#172728', 8, 30);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.05, 200);
  Wd.hemi = new THREE.HemisphereLight('#4e8389', '#221c15', 0.6); scene.add(Wd.hemi);
  const sun = new THREE.DirectionalLight('#b9cbc6', 0.9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 0.5; sc.far = 40; sun.shadow.bias = -0.0008;
  sun.position.set(-14, 9, 1.5); sun.target.position.set(0, 0, 1); scene.add(sun); scene.add(sun.target); Wd.sun = sun;
  mkRoom(Wd);
  Wd.spot = new THREE.PointLight('#f2d39a', 0, 2.4, 1.5); scene.add(Wd.spot);
  Wd.T = mkPerson('teacher', { seed: 99 }); scene.add(Wd.T.g);
  Wd.shoes = [-1, 1].map((sd) => { const sh = mkShoe(sd); scene.add(sh); return sh; });
  Wd.chalk = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.065, 6), SM({ color: '#eeeadb' }))); scene.add(Wd.chalk);
  Wd.chalk2 = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.04, 6), SM({ color: '#eeeadb' }))); scene.add(Wd.chalk2); Wd.chalk2.visible = false;
  // dust motes in the air; chalk dust that falls from the ceiling
  { const n = 600, R = RNG('motes'), p = new Float32Array(n * 3); Wd.moteP = []; for (let i = 0; i < n; i++) Wd.moteP.push({ x: R.r(-4.8, 4.8), y: R.r(0.2, 3.1), z: R.r(-4.5, 6), ph: R.r(0, TAU) });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); Wd.motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#b9cbc6', size: 1, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false })); Wd.motes.frustumCulled = false; scene.add(Wd.motes); }
  { const n = 260, R = RNG('cdust'); Wd.dustP = []; for (let i = 0; i < n; i++) Wd.dustP.push({ x: R.n(0.6), z: R.n(0.35), v: R.r(0.15, 0.4), ph: R.f() });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#eeeadb', size: 1, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })); Wd.dust.frustumCulled = false; Wd.dust.visible = false; scene.add(Wd.dust); }
  // the abandoned room: fallen leaves and papers on the floor, a sagging ceiling board
  { const R = RNG('leaves'), n = 260, lm = IM(new THREE.PlaneGeometry(0.07, 0.05).rotateX(-Math.PI / 2), SM({ color: '#ffffff', side: THREE.DoubleSide }), n, false);
    for (let i = 0; i < n; i++) { const x = R.f() < 0.6 ? R.r(-4.9, -2.5) : R.r(-4.9, 4.9); lm.setMatrixAt(i, M4c(x, 0.004 + (i % 7) * 0.0004, R.r(-3.2, 6), R.r(0, TAU), R.r(0.7, 1.5), 1, R.r(0.7, 1.5), R.n(0.2), R.n(0.2))); lm.setColorAt(i, lin(R.pick(['#5a4430', '#8e3a24', '#a07c50', '#3c2c1e', '#5a2418']))); }
    Wd.leaves = lm; scene.add(lm); lm.visible = false;
    const lp = IM(new THREE.PlaneGeometry(0.07, 0.05).rotateX(-Math.PI / 2), SM({ color: '#ffffff', side: THREE.DoubleSide }), 40, false);
    for (let i = 0; i < 40; i++) { lp.setMatrixAt(i, M4c(R.r(-3, 3), PLAT_Y + 0.003 + (i % 5) * 0.0004, R.r(-4.5, -3.35), R.r(0, TAU), R.r(0.7, 1.4), 1, R.r(0.7, 1.4))); lp.setColorAt(i, lin(R.pick(['#5a4430', '#8e3a24', '#a07c50', '#3c2c1e']))); } Wd.leavesP = lp; scene.add(lp); lp.visible = false;
    const pp = IM(new THREE.PlaneGeometry(0.21, 0.29).rotateX(-Math.PI / 2), SM({ map: texPaper(), side: THREE.DoubleSide }), 30, false); for (let i = 0; i < 30; i++) pp.setMatrixAt(i, M4c(R.r(-4, 4.5), 0.003 + i * 0.0003, R.r(-3, 5.5), R.r(0, TAU), 1, 1, 1, R.n(0.08), R.n(0.08))); Wd.papers = pp; scene.add(pp); pp.visible = false;
    Wd.sag = bx(1.6, 0.03, 0.4, SM({ map: texCeiling() }), 2.6, 2.8, 3.0); Wd.sag.rotation.z = 0.45; Wd.sag.rotation.x = 0.1; scene.add(Wd.sag); Wd.sag.visible = false; }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map(); scene.traverse((m) => { if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return; const o = m.material;
    if (!done.has(o)) done.set(o, new THREE.MeshToonMaterial({ color: o.color, map: o.map, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent })); m.material = done.get(o); });
  return Wd;
}
const LIGHT = {
  rain:  { hemS: '#4e8389', hemG: '#221c15', hemI: 0.62, sunC: '#b9cbc6', sunI: 0.95, bulb: 1.5, fog: '#172728', fn: 9, ff: 32, bg: '#0b1a22', exp: 1.0, forest: 1 },
  dim:   { hemS: '#346c76', hemG: '#191b18', hemI: 0.45, sunC: '#8fb1b0', sunI: 0.7, bulb: 1.2, fog: '#0b1a22', fn: 7, ff: 28, bg: '#06090f', exp: 1.0, forest: 0.8 },
  today: { hemS: '#b9cbc6', hemG: '#5a4430', hemI: 2.1, sunC: '#d3d6cc', sunI: 2.2, bulb: 0, fog: '#56706c', fn: 6, ff: 30, bg: '#56706c', exp: 1.0, forest: 1.2 },
};
function setLight(Wd, L) {
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI; Wd.sun.color.set(L.sunC); Wd.sun.intensity = L.sunI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff; Wd.scene.background.set(L.bg); rend().r.toneMappingExposure = L.exp;
  Wd.forest.material.color.setScalar(L.forest);
}
// per frame: rain, motes, bulbs (one flickers), clock, glass
function animWorld(Wd, t, o = {}) {
  Wd.glassM.uniforms.t.value = t;
  { const P = Wd.rain.geometry.attributes.position, Sz = 6; Wd.rainP.forEach((q, i) => { const y = 5.5 - mod(q.y * 6.5 + t * 9 * q.v, 6.5); P.setXYZ(i * 2, q.x, y, q.z); P.setXYZ(i * 2 + 1, q.x - 0.03, y - 0.28, q.z); }); P.needsUpdate = true; void Sz; }
  { const P = Wd.motes.geometry.attributes.position; Wd.moteP.forEach((q, i) => P.setXYZ(i, q.x + 0.15 * Math.sin(t * 0.21 + q.ph), q.y + 0.1 * Math.sin(t * 0.17 + q.ph * 2), q.z + 0.15 * Math.cos(t * 0.19 + q.ph))); P.needsUpdate = true; Wd.motes.material.opacity = o.motes ?? 0.45; }
  const bl = o.bulb ?? 1; Wd.bulbs.forEach(({ b, s, l, i }) => { let k = bl; if (i === (o.flickerBulb ?? 1) && o.flicker) { const f = o.flicker, n = Math.sin(t * 37) + Math.sin(t * 23.3 + 1) + Math.sin(t * 61.7); k *= n > 1.6 * (1 - f) + 0.2 ? 0.15 : 1; }
    l.intensity = 1.25 * k * (o.bulbI ?? 1); b.material.color.set(k > 0.5 ? '#fbf1d0' : '#3c2c1e'); s.visible = k > 0.5; });
  // the clock reads 3:41 and ticks; it stops at the cue
  { const tc = Math.min(t, o.clockStop ?? 1e9); Wd.pend.rotation.z = 0.16 * Math.sin(Math.PI * tc); Wd.rainWall.material.uniforms.t.value = t; Wd.wallLight.intensity = o.wallLight ?? 0; }
  { const ts = Math.floor(Math.min(t, o.clockStop ?? 1e9)), sec = 22 + ts, mn = 41 + sec / 60, hr = 3 + mn / 60; Wd.clock.s.rotation.z = -(sec / 60) * TAU; Wd.clock.m.rotation.z = -(mn / 60) * TAU; Wd.clock.h.rotation.z = -(hr / 12) * TAU; }
}
