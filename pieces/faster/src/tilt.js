// =====================================================================
//  TILT — "down" turns south (52–74 s): you grip the +x railing (first-person hands), the horizon rolls, the beach
//  crowd and its clutter slide and tumble south, the ground and the planks crack, the Ferris wheel snaps off its legs
//  and rolls away down the beach and across the bare seabed.
//  TILT(t): the angle (rad) between real down and felt down, used for the camera roll in shots.js.
//  Every pose is a pure function of t. Globals are prefixed TL_ / tl.
// =====================================================================
const TILT = (t) => 0.06 * ss(52, 58, t) + 0.30 * ss(57, 72, t);
const TL_T0 = 52, TL_T1 = 74;
const TL_EYE = { x: 4.55, z: -56.5 };             // standing right at the rail (the shots' x = 3.3 puts it out of reach); z clear of the lamp at z = -59
const TL_RAIL = { x: 4.9, top: 8.10, half: 0.085 }; // the +x top rail: a 0.17 x 0.1 box at y = 8.05 along z (pier.js pierRail)
const TL_HS = 1.1;                               // first-person hands read a little larger than life
const TL_AIM = { yaw: 0.12, pitch: 0.1, late: 0 };       // turn a little toward the rail and down, so the grip sits in the lower frame
const tlIn = (t) => t >= TL_T0 && t < TL_T1;
// the ground under a point (beach plane, promenade, bare seabed)
function tlGround(z) { const bed = typeof BED === 'function' ? BED(z) - 0.2 : -0.2; if (z < 0) return bed; if (z > 58) return lerp(0.3, 1.6, ss(58, 62, z)); return lerp(bed, 0.3, ss(-0.5, 0.5, z)); }

// ---------------------------------------------------------------- the hands on the rail
function tlDenim() { return wrap(g3Tex((x, w, h) => { const R = RNG('tldenim'); x.fillStyle = '#24345a'; x.fillRect(0, 0, w, h);
  for (let i = -h; i < w; i += 3) { x.strokeStyle = `rgba(${R.f() < 0.5 ? '10,18,40' : '120,140,180'},0.22)`; x.lineWidth = 1; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); }
  for (let k = 0; k < 2500; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '200,210,230' : '8,12,30'},${R.r(0.05, 0.16)})`; x.fillRect(R.r(0, w), R.r(0, h), 1, R.r(1, 3)); }
  for (let k = 0; k < 9; k++) { const y = R.r(0, h); x.strokeStyle = 'rgba(8,12,28,0.35)'; x.lineWidth = R.r(2, 5); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + R.n(30), w * 0.7, y + R.n(30), w, y + R.n(10)); x.stroke(); x.strokeStyle = 'rgba(150,170,210,0.07)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, y - 4); x.bezierCurveTo(w * 0.3, y - 4 + R.n(20), w * 0.7, y - 4 + R.n(20), w, y - 4); x.stroke(); }
  x.strokeStyle = 'rgba(200,150,70,0.6)'; x.setLineDash([6, 4]); x.lineWidth = 2; x.beginPath(); x.moveTo(w * 0.5, 0); x.lineTo(w * 0.5, h); x.stroke(); }, 256, 256), 1, 1); }
// A procedural hand rebuilt each frame in world space around the rail (its own model, not hands.js): a lofted palm with a
// domed back, knuckle bumps and tendons; four fingers whose joints are laid explicitly over the rail (the proximal phalanx on
// the top, the middle and distal ones down the far face); a thumb on top / over the near edge; nails with a pale free edge;
// a wrist with the ulna bump, and a denim sleeve with a rolled cuff and bunched folds. Skin warmth comes from vertex colours.
const TL_E = TL_RAIL.half, TL_RH = 0.1;               // the top rail: half width, height
function tlLoftGeo(nU, nV) { const g = new THREE.BufferGeometry(), N = nU * nV, uv = new Float32Array(N * 2), idx = [];
  for (let i = 0; i < nU; i++) for (let j = 0; j < nV; j++) { uv[(i * nV + j) * 2] = i / (nU - 1); uv[(i * nV + j) * 2 + 1] = j / nV; }
  for (let i = 0; i < nU - 1; i++) for (let j = 0; j < nV; j++) { const a = i * nV + j, b = i * nV + (j + 1) % nV, c = a + nV, d = b + nV; idx.push(a, c, b, b, c, d); }
  g.setIndex(idx); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.userData = { nU, nV }; return g; }
const _lT = new THREE.Vector3(), _lU = new THREE.Vector3(), _lL = new THREE.Vector3(), _lC = new THREE.Vector3(), _lO = { l: 0, u: 0, t: 0, r: 1, g: 1, b: 1 };
// a frame along the curve: T tangent, U "up" (from upFn), L = T x U; secFn(u, s, cos, sin, o) fills o.l / o.u / o.t offsets and o.r/g/b
function tlFrame(curve, u, upFn) { curve.getPointAt(u, _lC); curve.getTangentAt(u, _lT).normalize(); upFn(_lC, _lU); _lU.addScaledVector(_lT, -_lU.dot(_lT)).normalize(); _lL.crossVectors(_lT, _lU); }
function tlLoftSet(m, curve, upFn, secFn) { const g = m.geometry, { nU, nV } = g.userData, P = g.attributes.position.array, C = g.attributes.color.array, o = _lO, len = curve.getLength();
  for (let i = 0; i < nU; i++) { const u = i / (nU - 1); tlFrame(curve, u, upFn);
    for (let j = 0; j < nV; j++) { const th = j / nV * TAU; o.t = 0; secFn(u, u * len, Math.cos(th), Math.sin(th), o); const k = (i * nV + j) * 3;
      P[k] = _lC.x + _lL.x * o.l + _lU.x * o.u + _lT.x * o.t; P[k + 1] = _lC.y + _lL.y * o.l + _lU.y * o.u + _lT.y * o.t; P[k + 2] = _lC.z + _lL.z * o.l + _lU.z * o.u + _lT.z * o.t;
      C[k] = o.r; C[k + 1] = o.g; C[k + 2] = o.b; } }
  g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.computeVertexNormals(); }
// skin colours (linear) and a pore/crease bump
const TL_SK = { back: lin('#c4967c'), palm: lin('#dfb7a2'), red: lin('#c07a6a'), pale: lin('#ead0c0'), crease: lin('#9a5a48'), vein: lin('#a08a98'), tend: lin('#d9a080'), arm: lin('#be9076') };
function tlSkinBump() { return wrap(g3Tex((x, w, h) => { const R = RNG('tlpore'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 2600; k++) { x.fillStyle = `rgba(${R.f() < 0.6 ? '0,0,0' : '255,255,255'},${R.r(0.05, 0.22)})`; const s = R.r(0.8, 2); x.fillRect(R.r(0, w), R.r(0, h), s, s); }
  for (let k = 0; k < 160; k++) { const px = R.r(0, w), py = R.r(0, h), a = R.r(0, TAU), L = R.r(4, 14); x.strokeStyle = `rgba(0,0,0,${R.r(0.08, 0.2)})`; x.lineWidth = 0.8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); } }, 256, 256, false), 5, 2); }
function tlCol(o, c) { o.r = c.r; o.g = c.g; o.b = c.b; }
function tlMix(o, c, k) { o.r += (c.r - o.r) * k; o.g += (c.g - o.g) * k; o.b += (c.b - o.b) * k; }
// a point pushed out of the rail's rounded box (the rail runs along z): fingers/arms never pass into it
function tlOut(p, r) { const x = p.x - TL_RAIL.x, y = p.y - TL_RAIL.top; if (x > -TL_E - r && x < TL_E + r && y > -TL_RH - r && y < r) {
    const dx = Math.max(Math.abs(x) - TL_E, 0), dy = Math.max(y, -TL_RH - y, 0); if (dx > 0 && y > 0 && Math.hypot(dx, y) < r) { const k = r / Math.hypot(dx, y); p.x = TL_RAIL.x + Math.sign(x) * (TL_E + dx * k); p.y = TL_RAIL.top + y * k; }
    else if (dx === 0 && y > -0.03) p.y = TL_RAIL.top + r; else if (dx < r && y <= 0) p.x = TL_RAIL.x + Math.sign(x) * (TL_E + r); } return p; }
// the rounded-box normal of the rail around a point = the finger's back (dorsal) direction
function tlDorsal(p, out) { const x = p.x - TL_RAIL.x, y = p.y - TL_RAIL.top, rho = 0.03; out.set(x - clamp(x, -TL_E + rho, TL_E - rho), y - clamp(y, -TL_RH + rho, -rho), 0); if (out.lengthSq() < 1e-10) out.set(0, 1, 0); return out.normalize(); }
const TL_FD = [ // index..pinky: lateral (thumb side +), knuckle setback, radius, [mid, distal] lengths
  [0.0285, 0.004, 0.0097, [0.026, 0.022]], [0.0095, 0, 0.0100, [0.030, 0.024]], [-0.0095, 0.003, 0.0094, [0.029, 0.023]], [-0.0275, 0.012, 0.0083, [0.021, 0.020]]];
function tlArm(st, side, denim) {
  const bump = tlSkinBump();
  const skin = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.52, bumpMap: bump, bumpScale: 0.002, sheen: 0.5, sheenColor: new THREE.Color('#ff9478'), sheenRoughness: 0.55, clearcoat: 0.07, clearcoatRoughness: 0.45, emissive: new THREE.Color('#3a1206'), emissiveIntensity: 0.35 });
  const nailM = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.25, clearcoat: 0.6, clearcoatRoughness: 0.2, emissive: new THREE.Color('#3a1810'), emissiveIntensity: 0.3 });
  const sleeveM = new THREE.MeshStandardMaterial({ map: denim, vertexColors: true, roughness: 0.95, side: THREE.DoubleSide });
  const mk = (nU, nV, mat) => { const m = new THREE.Mesh(tlLoftGeo(nU, nV), mat); m.castShadow = true; m.receiveShadow = false; m.frustumCulled = false; m.visible = false; st.scene.add(m); return m; };
  const palm = mk(40, 36, skin), fingers = TL_FD.map(() => mk(56, 18, skin)), thumb = mk(44, 18, skin), fore = mk(36, 30, skin), sl = mk(64, 40, sleeveM);
  const nailG = new THREE.SphereGeometry(1, 14, 6, 0, TAU, 0, Math.PI * 0.42).rotateX(Math.PI / 2).translate(0, 0, -1); { const p = nailG.attributes.position, c = new Float32Array(p.count * 3), base = lin('#e2a89a'), tip = lin('#f4e8e0'), lun = lin('#f0d4cc');
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), col = base.clone().lerp(tip, ss(0.55, 0.8, y)).lerp(lun, ss(-0.55, -0.85, y) * 0.6); c.set([col.r, col.g, col.b], i * 3); } nailG.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
  const nails = [0, 1, 2, 3, 4].map(() => { const m = new THREE.Mesh(nailG, nailM); m.castShadow = false; m.frustumCulled = false; m.visible = false; st.scene.add(m); return m; });
  return { side, palm, fingers, thumb, fore, sl, nails, sl0: sl, H: null }; }
const _tlUp = new THREE.Vector3(0, 1, 0);
function tlSetNail(n, curve, upFn, u, r, len) { tlFrame(curve, u, upFn); n.visible = true; n.position.copy(_lC).addScaledVector(_lU, r * 0.9);
  n.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(_lL, _lT, _lU)); n.scale.set(r * 0.82, len * 0.5, r * 0.32); }
// the hand: g = { side, z, a (yaw of the hand from +x toward +z), roll, slip, shoulder (camera space) }
function tlPoseArm(A, t, cam, g) { const strain = ss(54, 72, t), sh = 0.0012 + 0.0045 * strain, ph = A.side * 3.1, HS = TL_HS, ts = -A.side;
  const jit = (f, o) => Math.sin(t * f + o) * 0.6 + Math.sin(t * f * 2.31 + o * 1.7) * 0.4;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const ox = TL_RAIL.x, oy = TL_RAIL.top, oz = g.z - g.slip * (0.45 * ss(68.6, 68.85, t) + 0.55 * ss(69.8, 70.1, t));
  const J = V(sh * jit(31, ph), sh * 0.4 * jit(27, ph + 1), sh * jit(23, ph + 2));
  const d = V(Math.cos(g.a), 0, Math.sin(g.a)), Lt = V(-d.z, 0, d.x), Y = _tlUp;
  // the palm: from the wrist (Wc) to the knuckle line; the middle finger's knuckle sits one proximal phalanx short of the far edge
  const r1 = TL_FD[1][2] * HS, LP = 0.1 * HS, hb = 0.0125 * HS, ht = 0.0165 * HS;
  const Kc = V(ox + TL_E + 0.7 * r1 - 0.05 * HS * d.x, oy + hb + 0.003, oz).add(J), Wc = Kc.clone().addScaledVector(d, -LP);
  const up = Y.clone().addScaledVector(Lt, -ts * 0.12).normalize(), upC = (p, o) => o.copy(up);
  const fl = TL_FD.map((f) => f[0] * ts * HS);                       // lateral of each knuckle (metres, along Lt)
  const pc = new THREE.CatmullRomCurve3([Wc.clone().addScaledVector(d, -0.01), Wc.clone().addScaledVector(d, LP * 0.5).addScaledVector(Y, 0.0015), Wc.clone().addScaledVector(d, LP * 1.04)]);
  tlLoftSet(A.palm, pc, upC, (u, s, cs, sn, o) => { const e = u > 0.84 ? Math.sqrt(Math.max(0, 1 - ((u - 0.84) / 0.16) ** 2)) : 1;
    const c = HS * (0.0255 + 0.018 * ss(0.05, 0.6, u)) * (0.62 + 0.38 * e); let l = c * cs; const w = l;
    let hu = sn > 0 ? ht * (1 - 0.002 / 0.0165 * u) * sn * (1 - 0.32 * cs * cs) : hb * sn;
    // thenar pad on the thumb side underneath, the pinky-side edge a touch rounder
    l += ts * HS * 0.007 * Math.exp(-(((u - 0.32) / 0.2) ** 2)) * Math.max(0, cs * ts) * (sn < 0.3 ? 1 : 0.4);
    let kn = 0, td = 0; if (sn > 0) fl.forEach((li, i) => { kn += Math.exp(-(((w - li) / (0.0078 * HS)) ** 2) - (((u - 0.9 + TL_FD[i][1] * 2) / 0.07) ** 2));
      td += Math.exp(-(((w - li * lerp(0.35, 1, u)) / (0.0024 * HS)) ** 2)) * ss(0.12, 0.42, u) * (1 - ss(0.8, 0.92, u)); });
    hu = hu * e + (sn > 0 ? sn * HS * ((0.0058 + 0.0016 * strain) * kn + 0.0014 * (1 + 0.9 * strain) * td) : 0);
    o.l = l; o.u = hu;
    tlCol(o, TL_SK.back); tlMix(o, TL_SK.palm, ss(0.2, -0.6, sn)); tlMix(o, TL_SK.red, 0.8 * kn * (1 - 0.7 * strain)); if (sn > 0 && u > 0.7) tlMix(o, TL_SK.crease, 0.3 * ss(0.7, 0.9, u) * (1 - Math.min(1, kn * 1.4)) * sn); tlMix(o, TL_SK.pale, 0.55 * kn * strain); tlMix(o, TL_SK.tend, 0.5 * td);
    if (sn > 0.3) { const vv = Math.exp(-(((w - ts * HS * 0.012 * (1 - u) - 0.004 * Math.sin(u * 9)) / (0.002 * HS)) ** 2)) * ss(0.05, 0.3, u) * (1 - ss(0.5, 0.7, u)); tlMix(o, TL_SK.vein, 0.35 * vv); }
    if (u > 0.9) tlMix(o, TL_SK.red, 0.25 * ss(0.9, 1, u)); });
  A.palm.visible = true;
  // the fingers: knuckle -> over the top -> round the far edge -> down the far face
  TL_FD.forEach(([lat, back, rr, [Lm, Ld]], i) => { const r = rr * HS, M = Kc.clone().addScaledVector(Lt, fl[i]).addScaledVector(d, -back * HS);
    const tw = 0.0006 * strain * jit(17 + i * 3, i + ph);
    M.y = oy + r + 0.005; const kx = ox + TL_E + 0.9 * r, run = (kx - M.x) / d.x, P = M.clone().addScaledVector(d, run).addScaledVector(Lt, fl[i] * 0.3); P.y = oy + 0.5 * r;
    const D = V(ox + TL_E + r * 1.45, P.y - Lm * HS * 0.9, P.z + d.z * 0.15 * Lm * HS), Tp = V(ox + TL_E + r * 1.0 - tw, D.y - Ld * HS * 0.9, D.z + d.z * 0.08 * Ld * HS);
    const M0 = M.clone().addScaledVector(d, -0.03 * HS); M0.y -= 0.002;
    const pts = [M0, M, M.clone().lerp(P, 0.5), P, P.clone().lerp(D, 0.5), D, D.clone().lerp(Tp, 0.5), Tp];
    pts.forEach((p, k) => k > 1 && tlOut(p, r * 0.98));
    const crv = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), L = crv.getLength(), seg = (a, b) => a.distanceTo(b);
    const uM = seg(M0, M) / L, uP = uM + seg(M, P) / L, uD = uP + seg(P, D) / L, uTipR = 1 - (r * 0.8) / L, uN0 = 1 - (Ld * HS * 0.62) / L;
    const dor = (p, o) => tlDorsal(p, o);
    tlLoftSet(A.fingers[i], crv, dor, (u, s, cs, sn, o) => { let rad = r * lerp(1, 0.84, ss(uM, 1, u));
      const jM = Math.exp(-(((u - uM - 0.02) / 0.05) ** 2)), jP = Math.exp(-(((u - uP) / 0.04) ** 2)), jD = Math.exp(-(((u - uD) / 0.035) ** 2)), mid = Math.sin(Math.PI * clamp((u - uP) / (uD - uP), 0, 1));
      rad *= 1 - 0.05 * (1 - jP) * (u > uM && u < uP ? Math.sin(Math.PI * (u - uM) / (uP - uM)) : 0) - 0.03 * mid;
      if (u > uTipR) rad *= Math.sqrt(Math.max(0.0, 1 - ((u - uTipR) / (1 - uTipR)) ** 2 * 0.985));
      let up = sn * rad * (sn > 0 ? 1 + (0.16 * (jP + 0.7 * jD) + 0.12 * jM) * sn : 1 - 0.14 * sn * sn); if (u > uN0 && sn > 0.2) up -= rad * 0.12 * ss(0.2, 0.8, sn) * ss(uN0, uN0 + 0.03, u);
      o.l = rad * 1.05 * cs; o.u = up; if (u < uM) o.u -= 0.25 * r * (1 - u / uM) * (sn > 0 ? 1 : 0);
      tlCol(o, TL_SK.back); tlMix(o, TL_SK.palm, ss(0.1, -0.7, sn));
      const kk = (jP + 0.7 * jD + 0.6 * jM) * Math.max(0, sn); tlMix(o, TL_SK.red, 0.55 * kk * (1 - 0.7 * strain)); tlMix(o, TL_SK.pale, 0.5 * kk * strain);
      if (sn > 0.3) { const wr = (jP + jD) * (0.5 + 0.5 * Math.sin((u * L) / 0.0017 * TAU)); tlMix(o, TL_SK.crease, 0.25 * wr * sn); }
      if (sn < -0.4) tlMix(o, TL_SK.crease, 0.35 * (Math.exp(-(((u - uP) / 0.012) ** 2)) + Math.exp(-(((u - uD) / 0.012) ** 2))));
      tlMix(o, TL_SK.red, 0.45 * ss(uN0 - 0.05, 1, u)); if (u > uN0 - 0.015 && sn > 0.5) tlMix(o, TL_SK.red, 0.3); });
    A.fingers[i].visible = true; tlSetNail(A.nails[i], crv, dor, lerp(uN0, 1, 0.42) + 0.01, r * 0.86, Ld * HS * 0.5); });
  // the thumb: from the heel of the hand along the top, toward and over the near edge
  { const r = 0.0098 * HS, C0 = Wc.clone().addScaledVector(d, 0.03 * HS).addScaledVector(Lt, ts * 0.012 * HS); C0.y = oy + hb * 0.9;
    const td = d.clone().multiplyScalar(g.td[0]).addScaledVector(Lt, ts * g.td[1]).add(V(-g.td[2], 0, 0)).normalize();
    const M = Wc.clone().addScaledVector(d, 0.058 * HS).addScaledVector(Lt, ts * 0.04 * HS); M.y = oy + r + 0.003;
    const I = M.clone().addScaledVector(td, 0.03 * HS), Tp = I.clone().addScaledVector(td.clone().lerp(d, 0.35).normalize(), 0.025 * HS); Tp.y -= 0.004;
    const drape = (p) => { const x = p.x - ox; if (x < -TL_E) { const ov = -TL_E - x; p.x = ox - TL_E - r * 0.95; p.y = oy + r * 0.6 - ov * 1.2; } else p.y = Math.max(p.y, oy + r); return p; };
    drape(I); drape(Tp); const pts = [C0, M.clone().lerp(C0, 0.4), M, M.clone().lerp(I, 0.5), I, I.clone().lerp(Tp, 0.5), Tp].map((p, k) => (k > 1 ? tlOut(p, r * 0.98) : p));
    const crv = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), L = crv.getLength(), uM = (C0.distanceTo(M)) / L, uI = uM + M.distanceTo(I) / L, uTipR = 1 - r * 0.8 / L, uN0 = 1 - 0.03 * HS * 0.62 / L;
    const dor = (p, o) => { tlDorsal(p, o); return o.addScaledVector(Lt, ts * 0.35).normalize(); };
    tlLoftSet(A.thumb, crv, dor, (u, s, cs, sn, o) => { let rad = r * lerp(1.3, 0.86, ss(0, 0.6, u)); const jI = Math.exp(-(((u - uI) / 0.05) ** 2));
      if (u > uTipR) rad *= Math.sqrt(Math.max(0, 1 - ((u - uTipR) / (1 - uTipR)) ** 2 * 0.985));
      let up = sn * rad * (sn > 0 ? 1 + 0.12 * jI * sn : 1 - 0.1 * sn * sn); if (u > uN0 && sn > 0.2) up -= rad * 0.12 * ss(0.2, 0.8, sn) * ss(uN0, uN0 + 0.03, u);
      o.l = rad * 1.08 * cs; o.u = up * (u < uM ? 0.8 : 1);
      tlCol(o, TL_SK.back); tlMix(o, TL_SK.palm, ss(0.1, -0.7, sn)); tlMix(o, TL_SK.red, 0.4 * jI * Math.max(0, sn) + 0.4 * ss(uN0 - 0.05, 1, u)); });
    A.thumb.visible = true; tlSetNail(A.nails[4], crv, dor, lerp(uN0, 1, 0.42) + 0.01, r * 0.84, 0.03 * HS * 0.52); }
  // the forearm: out of the wrist toward the elbow (the shoulder point in camera space), resting on the rail where it crosses it
  const S = g.shoulder.clone().applyMatrix4(cam.matrixWorld), f = S.clone().sub(Wc).normalize();
  const fa = (s) => { const dir = d.clone().multiplyScalar(-1).lerp(f, ss(0, 0.07, s)).normalize(); return dir; };
  const fpts = [Wc.clone().addScaledVector(d, 0.03 * HS)]; { let p = Wc.clone(); fpts.push(p.clone()); for (let k = 1; k <= 6; k++) { p = p.clone().addScaledVector(fa(k * 0.027), 0.027 * HS); const q = p.clone(), x = q.x - ox; if (x > -TL_E - 0.035 && x < TL_E + 0.035) q.y = Math.max(q.y, oy + 0.03 * HS); fpts.push(q); } }
  const fc = new THREE.CatmullRomCurve3(fpts, false, 'centripetal'), fL = fc.getLength(), s0 = 0.03 * HS, cuff = 0.085 * HS;
  tlLoftSet(A.fore, fc, upC, (u, s, cs, sn, o) => { const sw = s - s0, g2 = ss(-0.01, 0.16, sw); let a = HS * (0.0275 + 0.009 * g2), b = HS * (0.0185 + 0.009 * g2);
    if (sw < 0) { a *= 0.97; b *= 0.95; } const ul = Math.exp(-(((sw - 0.012 * HS) / 0.008) ** 2)) * Math.max(0, -cs * ts) * Math.max(0, sn);
    o.l = a * cs; o.u = b * sn * (sn > 0 ? 1 - 0.15 * cs * cs : 1) + ul * HS * 0.009 * sn;
    tlCol(o, TL_SK.arm); tlMix(o, TL_SK.palm, ss(0.1, -0.7, sn)); tlMix(o, TL_SK.red, 0.25 * ul);
    if (sw < 0.006 && sw > -0.004 && sn < -0.2) tlMix(o, TL_SK.crease, 0.3); });
  A.fore.visible = true;
  // the sleeve: from the cuff (rolled hem, bunched folds) to past the shoulder
  { const c0 = fc.getPointAt(clamp((s0 + cuff) / fL, 0, 1)), dir = fc.getTangentAt(clamp((s0 + cuff) / fL, 0, 1)).normalize().multiplyScalar(-1);
    const e = S.clone().sub(c0).normalize().lerp(dir.clone().negate(), 0.3).normalize(), sp = [-0.004, 0, 0.08, 0.2, 0.45, 0.8].map((k) => c0.clone().addScaledVector(e, k));
    const scv = new THREE.CatmullRomCurve3(sp, false, 'centripetal'), R = RNG('tlfold' + A.side), F = [0, 1, 2, 3, 4, 5].map((k) => [0.016 + k * 0.024 + R.r(-0.005, 0.005), R.r(0, TAU), R.r(0.6, 1)]);
    tlLoftSet(A.sl, scv, upC, (u, s, cs, sn, o) => { const s1 = s - 0.004; let a = HS * (0.039 + 0.014 * ss(0, 0.35, s1)), b = HS * (0.034 + 0.015 * ss(0, 0.35, s1));
      const hem = s1 < 0 ? lerp(0.86, 1.07, clamp(s / 0.004)) : s1 < 0.012 ? lerp(1.07, 1.0, s1 / 0.012) : 1; let fold = 0;
      F.forEach(([sk, ak, amp]) => { fold += amp * Math.exp(-(((s1 - sk) / 0.0075) ** 2)) * (0.45 + 0.55 * Math.cos(Math.atan2(sn, cs) - ak)); });
      fold *= 1 - ss(0.12, 0.2, s1); const cr = 0.5 + 0.5 * Math.sin(Math.atan2(sn, cs) * 3 + s1 * 23); const k = hem * (1 + 0.075 * fold + 0.02 * cr * ss(0.02, 0.1, s1));
      o.l = a * cs * k; o.u = b * sn * k; const ao = clamp(0.62 + 0.42 * fold + 0.15 * cr - (s1 < 0 ? 0.3 : 0), 0.35, 1.1); o.r = o.g = o.b = ao * (s1 > -0.003 && s1 < 0.007 ? 1.25 : 1); });
    A.sl.visible = true; }
}
function tlHideArm(A) { [A.palm, A.thumb, A.fore, A.sl, ...A.fingers, ...A.nails].forEach((m) => { m.visible = false; }); }
const TL_GRIP = [
  { side: -1, z: TL_EYE.z + 0.8, a: 0.6, td: [0.85, 0.6, 0.3], slip: 0.42, shoulder: new THREE.Vector3(0.12, -0.5, 0.05) },
  { side: 1, z: TL_EYE.z + 1.2, a: 0.75, td: [1, 0.45, 0.25], slip: 0.5, shoulder: new THREE.Vector3(0.36, -0.52, 0.05) },
];

// ---------------------------------------------------------------- sliding: people and beach clutter
// a slide that starts at t0 and accelerates (the pull south grows): distance along -z
const tlSlideD = (t, t0, A) => { const u = Math.max(0, t - t0); return A * u * u * (1 + 0.1 * u); };
const tlAwayPier = (x, z) => (z < PIER.Z0 + 2 && Math.abs(x) < 6.2 ? Math.sign(x || 1) * 6.2 : x);
function tlPersonParams(R) { return { t0: 55.4 + R.r(0, 7.5), A: R.r(0.22, 0.75), dx: R.n(0.18), mode: R.f() < 0.55 ? 0 : R.f() < 0.7 ? 1 : 2, roll: R.r(0.45, 0.8), spin: R.n(1.6), ph: R.r(0, TAU) }; }
// one instanced-crowd person: standing → wobbling → tumbling head over heels / fallen and sliding on the back / skiing upright, flailing
function tlCrowdSet(C, i, x0, y0, z0, yaw0, p, t) {
  const d = tlSlideD(t, p.t0, p.A), wob = ss(p.t0 - 2.5, p.t0, t); let x = tlAwayPier(x0 + p.dx * d, z0 - d), z = z0 - d;
  const g = y0 + tlGround(z) - tlGround(z0);
  let yaw = yaw0, th = 0, arms = 0.3 * wob;
  if (d > 0.05) { yaw = lerp(yaw0, Math.PI / 2, ss(0, 1.2, d)) + p.spin * Math.max(0, d - 2) * 0.05;
    if (p.mode === 0) { th = -Math.max(0, d - 0.4) / p.roll; arms = 1; }
    else if (p.mode === 1) { th = -Math.min(Math.PI / 2, ((Math.max(0, d - 0.2) / 0.9) ** 1.5) * Math.PI / 2); arms = 0.6 + 0.4 * Math.sin(t * 7 + p.ph); }
    else { th = -0.35 * Math.min(1, d / 3) - 0.25 * Math.sin(t * 5 + p.ph) * ss(0, 2, d); arms = 1; if (d > 9) th = -Math.min(Math.PI / 2, (d - 9) * 0.8); } }
  else th = -0.08 * wob * Math.sin(t * 4 + p.ph) - 0.1 * wob;
  // pivot about the body's middle (0.7 m up) so it stays on the ground at every angle
  const c = Math.cos(th), sn = Math.sin(th), hc = 0.2 + 0.5 * Math.abs(c), lx = Math.cos(yaw), lz = -Math.sin(yaw), ox = -0.7 * sn;
  x -= ox * lx; z -= ox * lz;
  C.set(i, x, g + hc - 0.7 * c, z, yaw, 1, arms, th); }
// clutter: each type is centred on its own middle; hc = centre height standing, r = centre height tumbling
function tlStripeTex(cols, n = 6, vertical = true) { return g3Tex((x, w, h) => { for (let k = 0; k < n; k++) { x.fillStyle = cols[k % cols.length]; if (vertical) x.fillRect(k * w / n, 0, w / n + 1, h); else x.fillRect(0, k * h / n, w, h / n + 1); } const R = RNG('tlst' + n); for (let k = 0; k < 1500; k++) { x.fillStyle = `rgba(0,0,0,${R.r(0.02, 0.07)})`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); } }, 128, 128); }
function tlDebrisTypes() { const wood = STDm({ color: '#a87a4a', roughness: 0.8 }), alu = STDm({ color: '#c8ccd0', metalness: 0.6, roughness: 0.35 }), tube = STDm({ roughness: 0.4, metalness: 0.4 });
  const canvas = STDm({ map: tlStripeTex(['#ffffff', '#e4e4e4'], 8), roughness: 0.85, side: THREE.DoubleSide });
  return {
    parasol: { n: 70, hc: 1.1, r: 0.55, cols: ['#e04848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#ef8a3a', '#f4f1ea', '#e86fa8'], parts: [
      [new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), alu, false], [new THREE.ConeGeometry(1.15, 0.42, 16, 1, true).translate(0, 0.86, 0), canvas, true], [new THREE.SphereGeometry(0.05, 6, 4).translate(0, 1.08, 0), wood, false]] },
    chair: { n: 90, hc: 0.42, r: 0.3, cols: ['#2f6fd1', '#e04848', '#2a9d8f', '#f0c33c', '#3cae5c', '#e86fa8'], parts: [
      [new THREE.BoxGeometry(0.56, 0.02, 1.25).rotateX(-0.75), STDm({ map: tlStripeTex(['#ffffff', '#c8c8c8'], 6), roughness: 0.85 }), true],
      [new THREE.BoxGeometry(0.62, 0.035, 1.3).rotateX(-0.75).translate(0, -0.02, 0), wood, false],
      [new THREE.BoxGeometry(0.6, 0.04, 0.04).translate(0, -0.4, 0.55), wood, false], [new THREE.BoxGeometry(0.04, 0.8, 0.04).rotateX(0.5).translate(0.28, -0.05, 0.2), wood, false], [new THREE.BoxGeometry(0.04, 0.8, 0.04).rotateX(0.5).translate(-0.28, -0.05, 0.2), wood, false]] },
    towel: { n: 130, hc: 0.012, r: 0.03, flat: true, cols: ['#e04848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#ef8a3a', '#3cae5c'], parts: [[new THREE.BoxGeometry(0.85, 0.012, 1.7), STDm({ map: tlStripeTex(['#ffffff', '#ffffff', '#b8b8b8'], 9, false), roughness: 0.95 }), true]] },
    bin: { n: 18, hc: 0.45, r: 0.3, cols: ['#1f5a3a'], parts: [[new THREE.CylinderGeometry(0.3, 0.26, 0.9, 14), STDm({ roughness: 0.5, metalness: 0.3 }), true], [new THREE.CylinderGeometry(0.31, 0.31, 0.06, 14).translate(0, 0.46, 0), STDm({ color: '#222222', roughness: 0.6 }), false]] },
    ball: { n: 45, hc: 0.2, r: 0.2, roll: true, cols: ['#ffffff'], parts: [[new THREE.IcosahedronGeometry(0.2, 2), STDm({ map: tlStripeTex(['#e04848', '#ffffff', '#2f6fd1', '#f0c33c', '#ffffff', '#3cae5c'], 6), roughness: 0.4 }), false]] },
    cooler: { n: 30, hc: 0.2, r: 0.22, cols: ['#2f6fd1', '#e04848', '#2a9d8f', '#f4f1ea'], parts: [[new THREE.BoxGeometry(0.6, 0.36, 0.38), STDm({ roughness: 0.5 }), true], [new THREE.BoxGeometry(0.62, 0.05, 0.4).translate(0, 0.2, 0), STDm({ color: '#f4f4f4', roughness: 0.5 }), false]] },
    bike: { n: 14, hc: 0.36, r: 0.36, cols: ['#e04848', '#2f6fd1', '#1f2d3d', '#3cae5c'], parts: [
      [new THREE.TorusGeometry(0.33, 0.025, 6, 20).rotateY(Math.PI / 2).translate(0, 0, 0.52), STDm({ color: '#1a1a1a', roughness: 0.7 }), false], [new THREE.TorusGeometry(0.33, 0.025, 6, 20).rotateY(Math.PI / 2).translate(0, 0, -0.52), STDm({ color: '#1a1a1a', roughness: 0.7 }), false],
      [new THREE.BoxGeometry(0.04, 0.04, 1.0).translate(0, 0.25, 0), tube, true], [new THREE.BoxGeometry(0.04, 0.55, 0.04).rotateX(0.35).translate(0, 0.18, -0.2), tube, true], [new THREE.BoxGeometry(0.5, 0.03, 0.03).translate(0, 0.62, 0.42), alu, false]] } }; }
function tlBuildDebris(st, R) { const D = { types: [] }, TY = tlDebrisTypes();
  Object.entries(TY).forEach(([key, ty]) => { const ims = ty.parts.map(([geo, mat, tint]) => { const m = IM(geo, mat, ty.n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; st.scene.add(m); return { m, tint }; });
    const it = []; for (let i = 0; i < ty.n; i++) { const deck = (key === 'bin' && i < 3) || (key === 'cooler' && i < 3) || (key === 'ball' && i < 3);
      const o = { x: deck ? R.r(3.0, 4.3) : R.r(7, 115), z: deck ? R.r(-50, -36) : R.r(1.5, 56), yaw: R.r(0, TAU), deck, t0: (deck ? 58 : 55.5) + R.r(0, 7), A: R.r(0.3, 0.95) * (key === 'ball' ? 1.4 : 1), dx: R.n(0.15),
        ax: new THREE.Vector3(R.n(0.4), R.n(0.3), 1).normalize(), rate: R.r(0.25, 0.9) / Math.max(0.15, ty.r), fly: ty.flat && R.f() < 0.35 ? R.r(0.5, 3) : 0, ph: R.r(0, TAU), col: lin(R.pick(ty.cols)) };
      if (!o.deck) o.x = tlAwayPier(o.x, o.z); it.push(o); ims.forEach(({ m, tint }) => { if (tint) m.setColorAt(i, o.col); }); }
    ims.forEach(({ m }) => { if (m.instanceColor) m.instanceColor.needsUpdate = true; }); D.types.push({ key, ty, ims, it }); });
  return D; }
const _tlM4 = new THREE.Matrix4(), _tlQa = new THREE.Quaternion(), _tlQb = new THREE.Quaternion(), _tlP = new THREE.Vector3(), _tlS1 = new THREE.Vector3(1, 1, 1), _tlY = new THREE.Vector3(0, 1, 0), _tlE = new THREE.Euler();
function tlDebrisAt(o, ty, t) { const d = tlSlideD(t, o.t0, o.A); let x = o.x + o.dx * d, z = o.z - d;
  if (o.deck) { x = clamp(x, 3.0, 4.3); if (z < TL_EYE.z + 3) z = TL_EYE.z + 3 - (TL_EYE.z + 3 - z) * 0.05; }   // piles up against your legs (out of frame)
  else x = tlAwayPier(x, z); return { d, x, z, g: o.deck ? PIER.DECK : tlGround(z) }; }
function tlPoseDebris(D, t) { D.types.forEach(({ ty, ims, it }) => { it.forEach((o, i) => {
    const { d, x, z, g } = tlDebrisAt(o, ty, t), wob = ss(o.t0 - 2, o.t0, t); let y;
    _tlQa.setFromAxisAngle(_tlY, o.yaw + 0.04 * wob * Math.sin(t * 13 + o.ph));
    if (ty.flat) { y = g + ty.hc + o.fly * ss(0, 6, d) * (0.6 + 0.4 * Math.sin(t * 3 + o.ph)); const f = o.fly ? 1 : 0.15; _tlQb.setFromEuler(_tlE.set(0.4 * Math.sin(t * 6 + o.ph) * ss(0, 3, d) * f, 0, 0.5 * Math.sin(t * 5 + o.ph * 2) * ss(0, 3, d) * f)); }
    else { const ang = d * o.rate * (ty.roll ? 1 : ss(0, 1.5, d)); y = g + lerp(ty.hc, ty.r, ss(0, 1.2, d)) + (ty.roll ? 0 : 0.25 * Math.abs(Math.sin(ang)) * ss(0, 2, d)); _tlQb.setFromAxisAngle(o.ax, ang); }
    _tlQa.multiply(_tlQb); _tlM4.compose(_tlP.set(x, y, z), _tlQa, _tlS1); ims.forEach(({ m }) => m.setMatrixAt(i, _tlM4)); });
  ims.forEach(({ m }) => (m.instanceMatrix.needsUpdate = true)); }); }

// ---------------------------------------------------------------- the Ferris wheel breaking loose
const TL_HANG = 1.4;   // a gondola hangs this far below its pivot on the rim (the pier file's cab offset)
const TL_WPATH = [[48, 28], [47.5, 14], [45, -3], [42, -22], [46, -42], [60, -62], [85, -80], [120, -95], [170, -108], [240, -118]];
function tlWheelBuild(st, S) { const fw = S.wheel; if (!fw || !S.rim) return null; fw.updateMatrixWorld(true);
  const hubY = S.rim.position.y, bb = new THREE.Box3().setFromObject(S.rim), R = Math.max(5, (bb.max.y - bb.min.y) / 2);
  const W = { fw, hubY, R, legs: [], cabs: [] }; W.g = new THREE.Group(); st.scene.add(W.g); W.spin = new THREE.Group(); W.g.add(W.spin); W.off = new THREE.Group(); W.off.position.y = -hubY; W.spin.add(W.off); W.cabG = new THREE.Group(); W.cabG.position.y = -hubY; W.g.add(W.cabG);
  const by = fw.position.y; fw.children.slice().forEach((c) => {
    if ((S.cabs || []).includes(c)) { W.cabG.add(c); W.cabs.push(c); return; }
    if (c === S.rim) { W.off.add(c); return; }
    const b = new THREE.Box3().setFromObject(c); if (b.isEmpty()) return;
    if (b.min.y < by + 3 && b.max.y - b.min.y > 6) { W.legs.push({ o: c, r0: c.rotation.clone(), R: RNG('tlleg', W.legs.length) }); return; }   // legs stay at the base and snap
    if (b.max.y < by + 4) return;                                                                                                              // ground clutter stays
    W.off.add(c); });
  const L = [0]; for (let i = 1; i < TL_WPATH.length; i++) L.push(L[i - 1] + Math.hypot(TL_WPATH[i][0] - TL_WPATH[i - 1][0], TL_WPATH[i][1] - TL_WPATH[i - 1][1])); W.L = L;
  return W; }
function tlPathAt(W, s) { const P = TL_WPATH, L = W.L; s = clamp(s, 0, L[L.length - 1] - 0.01); let i = 0; while (s > L[i + 1]) i++; const u = (s - L[i]) / (L[i + 1] - L[i]); return { x: lerp(P[i][0], P[i + 1][0], u), z: lerp(P[i][1], P[i + 1][1], u) }; }
// smoothed position and heading: average the polyline over a window (rounds the corners)
function tlPathS(W, s) { let x = 0, z = 0; for (let k = -4; k <= 4; k++) { const p = tlPathAt(W, s + k * 2); x += p.x; z += p.z; } return { x: x / 9, z: z / 9 }; }
function tlHeading(W, s) { const p0 = tlPathS(W, s - 3), p1 = tlPathS(W, s + 3); return Math.atan2(-(p1.z - p0.z), p1.x - p0.x); }
const tlWheelS = (t) => { const u = Math.max(0, t - 65), v = Math.max(0, t - 70); return 1.5 * u * u + 2.5 * u + 4 * v * v; };
function tlWheelState(W, t) { const fw = W.fw, R = W.R, s = tlWheelS(t), p = s > 0 ? tlPathS(W, s) : { x: fw.position.x, z: fw.position.z }, drop = ss(64.15, 65.2, t), rollK = ss(64.8, 66.2, t);
  const p0 = { x: fw.position.x, z: fw.position.z }, px = lerp(p0.x, p.x, rollK), pz = lerp(p0.z, p.z, rollK);
  const shake = 0.25 * ss(60, 64, t) * (1 - drop) + 0.4 * drop * (1 - rollK);
  const jx = shake * Math.sin(t * 23.1), jz = shake * Math.sin(t * 19.7 + 1), jy = shake * 0.5 * Math.sin(t * 29.3 + 2);
  const yaw = lerp(fw.rotation.y, tlHeading(W, Math.max(s, 6)), ss(64.3, 65.8, t));
  const bank = lerp(-0.06 * ss(60, 64, t), -0.3 + 0.13 * Math.sin((t - 65) * 1.6), drop);
  const g0 = fw.position.y, ground = lerp(g0, tlGround(pz), rollK), hubH = lerp(g0 + W.hubY, ground + R * Math.cos(bank) + 0.35, drop);
  return { x: px + jx, y: hubH + jy, z: pz + jz, yaw, bank, spin: -s / R, drop, s }; }
function tlPoseWheel(W, t) { const Z = tlWheelState(W, t);
  W.g.position.set(Z.x, Z.y, Z.z); W.g.rotation.set(Z.bank, Z.yaw, 0, 'YXZ'); W.spin.rotation.z = Z.spin; W.g.updateMatrixWorld(true);
  // legs snap at the base and topple onto the beach, one after the other
  W.legs.forEach((Lg, k) => { const k0 = 64.05 + k * 0.22 + Lg.R.r(0, 0.15), f = EZ.i2(seg(t, k0, k0 + 1.1)), bounce = t > k0 + 1.1 ? 0.06 * Math.sin(seg(t, k0 + 1.1, k0 + 1.7) * Math.PI) : 0;
    Lg.o.rotation.set(Lg.r0.x - (1.48 - bounce) * f, Lg.r0.y, Lg.r0.z * (1 - 0.6 * f) + (k % 2 ? 0.25 : -0.25) * f); });
  // gondolas: pivots ride the rolling rim, the cars hang along real down and swing harder as it goes
  const inv = W.g.quaternion.clone().invert(), down = new THREE.Vector3(0, -1, 0).applyQuaternion(inv), cs = Math.cos(Z.spin), sn = Math.sin(Z.spin), sw = 0.05 + 0.25 * ss(60, 64, t) + 0.45 * Z.drop;
  W.cabs.forEach((c, k) => { const px = c.position.x, py = c.position.y + TL_HANG - W.hubY;   // pivot relative to the hub (posePier wrote the hanging pose)
    const rx = px * cs - py * sn, ry = px * sn + py * cs, a1 = sw * Math.sin(t * 2.6 + k * 1.3), a2 = sw * 0.7 * Math.sin(t * 2.1 + k * 0.7);
    const d = down.clone().add(new THREE.Vector3(a1, 0, a2)).normalize(); c.position.set(rx, ry + W.hubY, 0).addScaledVector(d, TL_HANG); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d); });
  return Z; }

// ---------------------------------------------------------------- cracks (ground, planks) and dust
// crack decal: the alpha stores how early each part of the crack opens (1 = first), so alphaTest grows it from the centre
function tlCrackTex(seed, dark = '#2a2018') { return g3Tex((x, w, h) => { const R = RNG('tlcrack', seed); x.clearRect(0, 0, w, h); x.lineCap = 'round'; x.lineJoin = 'round';
  const branch = (px, py, a, len, wd, d0, depth) => { let d = d0; for (let k = 0; k < len; k++) { const nx = px + Math.cos(a) * 9, ny = py + Math.sin(a) * 9; const al = clamp(1 - d / 520, 0.06, 1);
      x.strokeStyle = `rgba(70,52,36,${al})`; x.lineWidth = wd; x.beginPath(); x.moveTo(px, py); x.lineTo(nx, ny); x.stroke(); px = nx; py = ny; d += 9; a += R.n(0.45); wd = Math.max(1, wd * 0.985);
      if (depth < 3 && R.f() < 0.07) branch(px, py, a + R.n(1.3), Math.floor(len * R.r(0.2, 0.5)), wd * 0.6, d, depth + 1); if (px < 0 || py < 0 || px > w || py > h) break; } };
  for (let k = 0; k < 2; k++) branch(w / 2, h / 2, k * Math.PI + R.n(0.4), 40, 3.5, 0, 0); for (let k = 0; k < 2; k++) branch(w / 2, h / 2, R.r(0, TAU), 20, 2.2, 0, 1); }, 512, 512); }
function tlDustTex() { return g3Radial([[0, 'rgba(255,255,255,0.9)'], [0.35, 'rgba(255,255,255,0.5)'], [0.7, 'rgba(255,255,255,0.15)'], [1, 'rgba(255,255,255,0)']], 64); }

function buildTilt(st, S) { const T = { st, S }, R = RNG('tilt'), denim = tlDenim();
  T.arms = TL_GRIP.map((g) => tlArm(st, g.side, denim));
  // the pier's crowd gets slide parameters; an extra crowd fills the beach in front of the wheel
  T.clP = (S.cl || []).map((c, i) => tlPersonParams(RNG('tlcl', i)));
  T.crowd = makeCrowd(300, { seed: 77 }); st.scene.add(T.crowd.grp); T.cx = [];
  for (let i = 0; i < 300; i++) { const z = R.r(2, 57); T.cx.push({ x: tlAwayPier(R.r(7, 125), z), z, yaw: R.r(0, TAU), ph: R.r(0, 6), p: tlPersonParams(RNG('tlcx', i)) }); }
  T.walkP = (S.walk || []).map((p, i) => tlPersonParams(RNG('tlwk', i)));
  T.deb = tlBuildDebris(st, R);
  T.W = tlWheelBuild(st, S);
  // cracks: on the beach (opening 59–72) and in the planks right in front of you (66–72)
  T.cracks = []; const crackAt = (x, y, z, w, d, ry, t0, t1, seed, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat || STDm({ map: tlCrackTex(seed), transparent: false, alphaTest: 1, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; m.userData = { t0, t1 }; st.scene.add(m); T.cracks.push(m); return m; };
  for (let k = 0; k < 16; k++) { const x = R.r(9, 110), z = R.r(4, 52), s = R.r(8, 26); crackAt(tlAwayPier(x, z), 0.315, z, s, s, R.r(0, TAU), R.r(58.5, 66), 0, k); }
  for (let k = 0; k < 6; k++) { const z = R.r(-30, -4), s = R.r(8, 18); crackAt(R.r(14, 90), tlGround(z) + 0.03, z, s, s, R.r(0, TAU), R.r(61, 68), 0, 20 + k); }
  if (T.W) crackAt(T.W.fw.position.x, T.W.fw.position.y + 0.02, T.W.fw.position.z, 30, 30, 0, 64.1, 0, 40);
  crackAt(3.6, PIER.DECK + 0.006, TL_EYE.z + 5, 2.4, 6, 0.05, 63.98, 0, 50); crackAt(2.4, PIER.DECK + 0.006, TL_EYE.z + 11, 3, 7, -0.1, 66, 0, 51);
  // splintering planks next to the crack
  const plankM = STDm({ map: wrap(texNoise('tlplank', '#8a6a4a', ['#7a5a3e', '#9a7a58', '#6a4a30'], 3000), 1, 4), roughness: 0.85 });
  T.planks = [0, 1, 2].map((k) => { const m = mesh(new THREE.BoxGeometry(0.22, 0.05, 2.4).translate(0, 0, -1.2), plankM, 3.3 + k * 0.24, PIER.DECK + 0.02, TL_EYE.z + 6.5 + k * 0.9); m.userData.k0 = 66.2 + k * 0.7; st.scene.add(m); return m; });
  // dust puffs
  const dm = new THREE.SpriteMaterial({ map: tlDustTex(), color: '#d6c8ae', transparent: true, depthWrite: false, opacity: 0, fog: true });
  T.dust = []; const puff = (tb, life, p, v, s0, s1, a) => { const sp = new THREE.Sprite(dm.clone()); sp.visible = false; st.scene.add(sp); T.dust.push({ sp, tb, life, p, v, s0, s1, a }); };
  if (T.W) { const fp = T.W.fw.position; for (let k = 0; k < 14; k++) puff(64.05 + R.r(0, 1.4), R.r(2.5, 4), new THREE.Vector3(fp.x + R.n(7), fp.y + 0.5, fp.z + R.n(4)), new THREE.Vector3(R.n(2), R.r(0.6, 2), R.n(2) - 1), 3, R.r(9, 16), 0.75);
    for (let k = 0; k < 44; k++) { const tb = 65.2 + k * 0.2; puff(tb, R.r(2.2, 3.5), null, new THREE.Vector3(R.n(1.5), R.r(0.6, 1.8), R.n(1.5)), 4, R.r(10, 18), 0.6); } }
  for (let k = 0; k < 60; k++) { const ty = T.deb.types[k % T.deb.types.length], o = R.pick(ty.it); puff(Math.max(o.t0 + 0.6, 56.5) + R.r(0, 9), R.r(1.5, 2.6), { o, ty }, new THREE.Vector3(R.n(0.8), R.r(0.3, 1), R.n(0.8)), 0.8, R.r(2.5, 5), 0.5); }
  T.shadowW = null;
  return T; }

function tlPoseDust(T, t) { T.dust.forEach((D) => { const u = (t - D.tb) / D.life; if (u < 0 || u > 1 || t >= TL_T1) { D.sp.visible = false; return; }
  let p0 = D.p; if (!p0 && T.W) { const Z = tlWheelState(T.W, D.tb); const yaw = Z.yaw; p0 = new THREE.Vector3(Z.x, tlGround(Z.z) + 0.6, Z.z); }
  else if (p0 && p0.o) { const q = tlDebrisAt(p0.o, p0.ty.ty, D.tb); p0 = new THREE.Vector3(q.x, q.g + 0.3, q.z); }
  if (!p0) { D.sp.visible = false; return; }
  const age = t - D.tb; D.sp.visible = true; D.sp.position.copy(p0).addScaledVector(D.v, age * (1 - 0.3 * u)); const s = lerp(D.s0, D.s1, EZ.o2(u)); D.sp.scale.set(s, s * 0.8, 1); D.sp.material.opacity = D.a * Math.sin(Math.PI * Math.min(1, u * 3)) * (1 - u); }); }

// keep the key light's shadow box over what we see (the wheel is ~100 m off), then hand it back unchanged
function tlShadow(T, t, cam, Z) { const k = T.st.key;
  if (T.shadowW && k.target.position.equals(T.shadowW.mine)) { k.target.position.copy(T.shadowW.t0); k.position.copy(T.shadowW.p0); Object.assign(k.shadow.camera, T.shadowW.box); k.shadow.camera.updateProjectionMatrix(); k.target.updateMatrixWorld(); }
  T.shadowW = null; if (!Z || t < 56 || t >= TL_T1) return;
  const sc = k.shadow.camera, t0 = k.target.position.clone(), p0 = k.position.clone(), box = { left: sc.left, right: sc.right, top: sc.top, bottom: sc.bottom, far: sc.far };
  const mid = new THREE.Vector3(lerp(cam.position.x, Z.x, 0.55), 2, lerp(cam.position.z, Z.z, 0.55)), half = Math.max(box.right, 0.5 * Math.hypot(Z.x - cam.position.x, Z.z - cam.position.z) + 35);
  k.position.copy(mid).add(p0.clone().sub(t0)); k.target.position.copy(mid); k.target.updateMatrixWorld(); Object.assign(sc, { left: -half, right: half, top: half, bottom: -half, far: Math.max(box.far, p0.distanceTo(t0) + half * 2) }); sc.updateProjectionMatrix();
  T.shadowW = { mine: mid.clone(), t0, p0, box }; }

function poseTilt(T, t, cam) { const st = T.st, S = T.S;
  // the crowd, the walkers and the clutter slide south (deterministic from t; before ~55 s this is the pier's own pose)
  if (S.crowd && S.cl) { S.cl.forEach((c, i) => t >= T.clP[i].t0 - 2.5 && tlCrowdSet(S.crowd, i, c.x, c.y ?? 0.3, c.z, c.yaw, T.clP[i], t)); S.crowd.done(); }
  T.cx.forEach((c, i) => { if (t < c.p.t0 - 2.5) T.crowd.set(i, c.x, tlGround(c.z), c.z, c.yaw, 1, 0, 0.03 * Math.sin(t * 2 + c.ph)); else tlCrowdSet(T.crowd, i, c.x, tlGround(c.z), c.z, c.yaw, c.p, t); }); T.crowd.done();
  (S.walk || []).forEach((p, i) => { const q = T.walkP[i], d = tlSlideD(t, q.t0, q.A); if (d <= 0) return; p.root.position.z -= d; p.root.position.x = clamp(p.root.position.x + q.dx * d, -4.3, 4.3);
    const th = Math.min(Math.PI / 2 - 0.12, d * 0.5); p.root.rotation.set(-th, Math.PI, 0, 'YXZ'); p.root.position.y = PIER.DECK + 0.25 * Math.sin(th); });
  tlPoseDebris(T.deb, t);
  const Z = T.W ? tlPoseWheel(T.W, t) : null;
  T.cracks.forEach((m) => { const g = clamp((t - m.userData.t0) / 4.5); m.visible = g > 0.01; m.material.alphaTest = 1 - 0.94 * EZ.o2(g); });
  T.planks.forEach((m) => { const f = EZ.back(seg(t, m.userData.k0, m.userData.k0 + 0.8)); m.rotation.set(0.12 * f + 0.01 * Math.sin(t * 30) * f, 0.05 * f, (m.userData.k0 % 2 ? 0.08 : -0.06) * f); m.position.y = PIER.DECK + 0.02 + 0.03 * f; });
  tlPoseDust(T, t);
  if (!tlIn(t)) { T.arms.forEach(tlHideArm); tlShadow(T, t, cam, null); return; }
  // stand at the rail, lean in as the pull grows; from 64 s the head follows the wheel
  cam.position.set(TL_EYE.x, cam.position.y - 0.12 * ss(55, 63, t), TL_EYE.z);
  cam.rotation.y += TL_AIM.yaw; cam.rotation.x -= TL_AIM.pitch + TL_AIM.late * ss(69.5, 72, t);   // look down at your hands again as you hang on
  if (Z && t >= 64) { const brg = Math.atan2(Z.x - cam.position.x, Z.z - cam.position.z);
    // cam yaw convention: rotation.y = atan2(-dx, -dz); keep the hub within ~9° of the centre line
    const camB = Math.atan2(-Math.sin(cam.rotation.y), -Math.cos(cam.rotation.y)); let dB = Math.atan2(Math.sin(brg - camB), Math.cos(brg - camB)); const lim = 0.16;
    const pull = dB > lim ? dB - lim : dB < -lim ? dB + lim : 0; cam.rotation.y += pull * ss(64, 65, t); }
  cam.updateMatrixWorld(true);
  T.arms.forEach((A, i) => tlPoseArm(A, t, cam, TL_GRIP[i]));
  tlShadow(T, t, cam, Z); }

// 2D: a tightening vignette while you hold on
function tiltOverlay(t) { if (!tlIn(t)) return; const k = ss(53, 70, t); if (k <= 0) return;
  ctx.save(); screen(); const g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H * 0.5, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,6,4,${0.45 * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
