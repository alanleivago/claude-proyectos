// =====================================================================
//  styles/amphora-bf/kit.js — black-figure amphora painting, animated like cut-out puppets.
//  Measured from Ref amphora mitologia/5.mp4 and fondo.jpeg: a terracotta-orange ground with darker spots and
//  black/orange friezes (the user's own fondo.jpg, embedded as an asset), figures as near-black silhouettes in
//  strict profile with details incised in the ground's orange, added white and added red for the sides, white
//  italic captions low in the picture. Figures only face and move left or right; limbs are rigid pieces turning
//  at joints (puppets), on 2s. The whole frame wiggles on 3s like the parchment style.
//  Needs from the piece head: W, H. Needs the asset fondo.jpg.
// =====================================================================
const BF = {
  black: '#170b12', black2: '#24121a', inc: '#df7c3c', ground: '#e57d36', spot: '#c9612a',
  white: '#efe2c8', red: '#9a2b1f', gold: '#e8b04a', sea: '#d46c2e',
};
const BF_FONT = '"ITC Garamond Std", "Garamond", "Palatino Linotype", Palatino, Georgia, serif';
const BF_CAPS = '"1689 GLC Garamond Pro", "Trajan Pro", "Baskerville", "Times New Roman", serif';
const BF_TOP = 234, BF_BOT = 1599, BF_FLOOR = 1588;     // the picture lives between the friezes; feet stand on the floor
const AM_CAPS = BF_CAPS;

// ---- the ground and the frame (the user's background, its friezes opaque over everything)
function bfGround() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!drawAsset('fondo.jpg', 0, 0, W, H, { fit: 'cover' })) { ctx.fillStyle = BF.ground; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
function bfFrame() {
  const img = asset('fondo.jpg'); if (!img) return;
  const sx = img.naturalWidth / W;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(img, 0, 0, img.naturalWidth, BF_TOP * sx, 0, 0, W, BF_TOP);
  ctx.drawImage(img, 0, BF_BOT * sx, img.naturalWidth, (H - BF_BOT) * sx, 0, BF_BOT, W, H - BF_BOT);
  ctx.restore();
}
// the ground's spots again, in front of the figures at low alpha, so the paint looks worn (screen space)
function bfWear(a = 0.35) {
  const img = asset('fondo.jpg'); if (!img) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = a;
  ctx.drawImage(img, 0, 0, W, H); ctx.restore();
}

// ---- paint: a black fill with a slightly wobbly edge, and incised lines in the ground's colour
function bfFill(P, c = BF.black, o = {}) {
  const Q = o.raw ? P : wobble(P, true, o.amt ?? 0.6, o.key ?? 'f' + (P[0][0] | 0) + (P[0][1] | 0), 8);
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; trace(Q, true);
  if (o.sep !== 0) { ctx.strokeStyle = BF.inc; ctx.lineWidth = o.sep ?? 4.5; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.fillStyle = c; ctx.fill(); ctx.restore();
  return Q;
}
function bfInc(P, o = {}) {
  if (P.length < 2) return;
  ctx.save(); ctx.globalAlpha *= o.a ?? 0.95; ctx.strokeStyle = o.c ?? BF.inc; ctx.lineWidth = o.w ?? 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  trace(o.raw ? P : wobble(P, !!o.closed, 0.4, o.key ?? 'i' + (P[0][0] | 0) + (P[0][1] | 0), 6), !!o.closed); ctx.stroke(); ctx.restore();
}
const bfLine = (x1, y1, x2, y2, o = {}) => bfInc([[x1, y1], [x2, y2]], o);
function bfDot(x, y, r, c = BF.black) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
// a tapered limb between joints A and B (radii ra, rb); bulge pushes the middle out on one side (calf, biceps)
function bfLimb(A, B, ra, rb, bulge = 0, c = BF.black) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, P = [];
  for (let i = 0; i <= 8; i++) { const u = i / 8, r = lerp(ra, rb, u) + bulge * Math.sin(Math.PI * u); P.push([A[0] + dx * u + nx * r, A[1] + dy * u + ny * r]); }
  for (let i = 8; i >= 0; i--) { const u = i / 8, r = lerp(ra, rb, u); P.push([A[0] + dx * u - nx * r, A[1] + dy * u - ny * r]); }
  const path = () => { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.moveTo(A[0] + ra, A[1]); ctx.arc(A[0], A[1], ra, 0, TAU); ctx.moveTo(B[0] + rb, B[1]); ctx.arc(B[0], B[1], rb, 0, TAU); };
  ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 4.5; path(); ctx.stroke(); ctx.restore();
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill();
  bfDot(A[0], A[1], ra, c); bfDot(B[0], B[1], rb, c);
}
const bfAt = (A, ang, L) => [A[0] + Math.sin(ang) * L, A[1] + Math.cos(ang) * L];   // ang from straight down, + = forward (local x+)

// =====================================================================
//  the puppet: a figure in strict profile, facing dir (+1 right, -1 left), feet on y.
//  pose: walk phase (radians) and amount, or explicit joint angles. o: kind 'hoplite'|'himation'|'chiton'|'robe',
//  head 'helmet'|'curls'|'bald'|'tiara'|'crown'|'veil', beard, shield emblem, spear, cloak (added colour), s
// =====================================================================
function bfWalkPose(ph, amt = 1, run = 0) {
  const k = amt, sw = Math.sin(ph), cw = Math.cos(ph);
  return {
    th1: (0.42 + run * 0.25) * sw * k, th2: -(0.42 + run * 0.25) * sw * k,
    kn1: (0.15 + Math.max(0, -cw) * (0.7 + run * 0.6)) * k, kn2: (0.15 + Math.max(0, cw) * (0.7 + run * 0.6)) * k,
    ua1: -0.45 * sw * k * (1 + run * 0.6), ua2: 0.45 * sw * k * (1 + run * 0.6), el1: (0.3 + run * 0.9) * k, el2: (0.3 + run * 0.9) * k,
    bob: -Math.abs(Math.cos(ph)) * 10 * k, tor: run * 0.18,
  };
}
const BF_REST = { th1: 0.08, th2: -0.06, kn1: 0.05, kn2: 0.05, ua1: 0.05, ua2: -0.05, el1: 0.25, el2: 0.2, bob: 0, tor: 0 };
function bfFigure(x, y, dir, o = {}) {
  const s = o.s ?? 1, p = { ...BF_REST, ...(o.pose || {}) }, k = o.key ?? 'fig' + (x | 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.rotate(o.rot ?? 0);
  const LEG = 245, SHIN = 235, kind = o.kind ?? 'chiton', far = BF.black;
  const hip = [0, -LEG - SHIN - 22 + p.bob + (p.drop ?? 0)], tor = p.tor ?? 0;
  const tp = (a, b) => [hip[0] + a * Math.cos(tor) - b * Math.sin(tor), hip[1] + a * Math.sin(tor) + b * Math.cos(tor)];
  const shF = tp(86, -268), shB = tp(-80, -268), neck = tp(4, -318);
  const leg = (th, kn) => { const knee = bfAt(hip, th, LEG), ankle = bfAt(knee, th - kn, SHIN); return { knee, ankle }; };
  const L1 = leg(p.th1, p.kn1), L2 = leg(p.th2, p.kn2);
  const arm = (sh, ua, el) => { const elbow = bfAt(sh, ua + tor, 165), wrist = bfAt(elbow, ua + tor + el, 150); return { sh, elbow, wrist, ang: ua + tor + el }; };
  const A1 = o.shield ? arm(shF, 0.35, 1.25) : arm(shF, p.ua1, p.el1), A2 = arm(shB, p.ua2, p.el2);
  const drawLeg = (Lg, c, near) => {
    bfLimb(hip, Lg.knee, 50, 27, 9, c); bfLimb(Lg.knee, Lg.ankle, 27, 14, 15, c);
    ctx.fillStyle = c; trace([[Lg.ankle[0] - 24, Lg.ankle[1] - 8], [Lg.ankle[0] + 22, Lg.ankle[1] - 2], [Lg.ankle[0] + 78, Lg.ankle[1] + 10], [Lg.ankle[0] + 80, Lg.ankle[1] + 18], [Lg.ankle[0] - 26, Lg.ankle[1] + 18]], true); ctx.fill();
    if (!near) return;
    bfInc(arcPts(Lg.knee[0] + 6, Lg.knee[1], 14, -1.2, 1.0, 6), { w: 1.8, key: k + 'kn' });
    bfInc([[lerp(Lg.knee[0], Lg.ankle[0], 0.2) - 16, lerp(Lg.knee[1], Lg.ankle[1], 0.2)], [lerp(Lg.knee[0], Lg.ankle[0], 0.55) - 30, lerp(Lg.knee[1], Lg.ankle[1], 0.55)], [Lg.ankle[0] - 10, Lg.ankle[1] - 20]], { w: 1.8, key: k + 'calf' });
    bfInc([[lerp(hip[0], Lg.knee[0], 0.25) + 26, lerp(hip[1], Lg.knee[1], 0.25)], [lerp(hip[0], Lg.knee[0], 0.8) + 24, lerp(hip[1], Lg.knee[1], 0.8)]], { w: 1.6, key: k + 'thg' });
    for (let i = 0; i < 3; i++) bfInc([[Lg.ankle[0] - 14 + i * 26, Lg.ankle[1] - 10 + i * 3], [Lg.ankle[0] - 4 + i * 26, Lg.ankle[1] + 12]], { w: 1.4, key: k + 'snd' + i });
    if (kind === 'hoplite') { bfInc([[Lg.knee[0] - 22, Lg.knee[1] + 18], [lerp(Lg.knee[0], Lg.ankle[0], 0.55) - 34, lerp(Lg.knee[1], Lg.ankle[1], 0.55)], [Lg.ankle[0] - 16, Lg.ankle[1] - 30], [Lg.ankle[0] + 14, Lg.ankle[1] - 30]], { w: 2, key: k + 'grv' }); }
  };
  const drawArm = (Ar, c, near) => {
    bfLimb(Ar.sh, Ar.elbow, 36, 23, 10, c); bfLimb(Ar.elbow, Ar.wrist, 23, 15, 8, c);
    const hx = Ar.wrist[0] + Math.sin(Ar.ang) * 18, hy = Ar.wrist[1] + Math.cos(Ar.ang) * 18; bfDot(hx, hy, 22, c);
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = c; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx, hy); const fa = Ar.ang + 0.25 - i * 0.2; ctx.lineTo(hx + Math.sin(fa) * 34, hy + Math.cos(fa) * 34); ctx.stroke(); }
    if (near) { bfInc(arcPts(Ar.sh[0] - 4, Ar.sh[1] + 22, 30, -0.4, 1.9, 8), { w: 1.8, key: k + 'dlt' }); bfInc([[lerp(Ar.sh[0], Ar.elbow[0], 0.3) + 14, lerp(Ar.sh[1], Ar.elbow[1], 0.3)], [lerp(Ar.sh[0], Ar.elbow[0], 0.85) + 10, lerp(Ar.sh[1], Ar.elbow[1], 0.85)]], { w: 1.6, key: k + 'bic' }); }
  };
  // spear behind, far limbs (a shade lighter, like a second figure plane), the cloak
  if (o.spear) { const [wx, wy] = A2.wrist; ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(wx - 30, wy + 560); ctx.lineTo(wx + 26, wy - 500); ctx.stroke(); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.moveTo(wx + 14, wy - 498); ctx.lineTo(wx + 32, wy - 600); ctx.lineTo(wx + 40, wy - 496); ctx.fill(); ctx.restore(); }
  drawArm(A2, far, false); drawLeg(L2, far, false);
  if (o.cloak) { const fl = 30 * Math.sin(TT * 2 + x * 0.01) + (p.bob ?? 0); bfFill([shB, tp(-140, -200), tp(-170 + fl, 60), tp(-150 + fl, 200), tp(-60, 210), tp(-40, 0), tp(-20, -300)], o.cloak, { key: k + 'clk' }); for (let i = 0; i < 4; i++) bfInc([tp(-90 - i * 14, -230), tp(-120 - i * 10 + fl, 190)], { w: 1.5, c: BF.black, a: 0.5, key: k + 'clf' + i }); }
  // the torso: frontal, broad shoulders, a narrow waist (the black-figure convention), head and legs in profile
  bfLimb(tp(0, -300), neck, 30, 28, 0, BF.black);
  bfFill([tp(-44, 0), tp(-34, -96), tp(-56, -180), tp(-100, -262), tp(-80, -302), tp(-30, -316), tp(34, -316), tp(84, -302), tp(106, -262), tp(64, -180), tp(38, -96), tp(48, 0)], BF.black, { key: k + 'tor' });
  if (kind === 'hoplite' || kind === 'nude' || kind === 'chiton') {
    bfInc([tp(-60, -246), tp(-30, -214), tp(2, -222)], { w: 2, key: k + 'pcl' }); bfInc([tp(64, -246), tp(36, -214), tp(4, -222)], { w: 2, key: k + 'pcr' });
    bfInc([tp(3, -290), tp(3, -96)], { w: 1.6, key: k + 'stn' });
    for (let i = 0; i < 3; i++) { bfInc(arcPts(tp(-16, -180 + i * 30)[0], tp(-16, -180 + i * 30)[1], 14, 0.3, 2.8, 5), { w: 1.4, key: k + 'abl' + i }); bfInc(arcPts(tp(20, -180 + i * 30)[0], tp(20, -180 + i * 30)[1], 14, 0.3, 2.8, 5), { w: 1.4, key: k + 'abr' + i }); }
    bfInc([tp(-40, -70), tp(0, -20), tp(42, -70)], { w: 1.6, key: k + 'ilc' });
    bfInc([tp(-60, -300), tp(-10, -290)], { w: 1.5, key: k + 'clv1' }); bfInc([tp(66, -300), tp(16, -290)], { w: 1.5, key: k + 'clv2' });
  }
  if (kind === 'hoplite') {   // a muscle cuirass edge, a belt and two rows of hanging strips that swing with the step
    bfInc([tp(-86, -258), tp(-52, -170), tp(-40, -96), tp(42, -96), tp(62, -170), tp(92, -258)], { w: 2.2, key: k + 'cui' });
    bfInc([tp(-48, -84), tp(50, -84)], { w: 3, key: k + 'blt' });
    const swing = 8 * Math.sin((p.bob ?? 0) * 0.3 + TT * 6);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const x0 = -60 + i * 22 + r * 11, y0 = -70 + r * 60; const S = [tp(x0, y0), tp(x0 + 20, y0), tp(x0 + 22 + swing * (i / 6), y0 + 74), tp(x0 + 2 + swing * (i / 6), y0 + 74)]; bfFill(S, BF.black, { key: k + 'pt' + r + i, raw: true }); bfInc([S[1], S[2]], { w: 1.4, raw: true }); bfInc([S[3], S[2]], { w: 1.2, raw: true }); }
  } else if (kind === 'chiton') {   // a short tunic with fine pleats, belted
    const sw = 10 * Math.sin(TT * 4 + x * 0.01);
    bfFill([tp(-56, -100), tp(50, -100), tp(70 + sw, 130), tp(30, 140), tp(-10, 128), tp(-50, 140), tp(-78 + sw, 126)], BF.black, { key: k + 'chs' });
    for (let i = 0; i < 7; i++) bfInc([tp(-46 + i * 15, -88), tp(-62 + i * 20 + sw * 0.5, 126)], { w: 1.3, key: k + 'chp' + i });
    bfInc([tp(-52, -96), tp(48, -96)], { w: 2.6, key: k + 'gird' });
  }
  if (kind === 'himation' || kind === 'robe') drawLeg(L1, BF.black, true);
  if (kind === 'himation' || kind === 'robe') {   // a mantle draped over the far shoulder, archaic zigzag hem
    const ftF = Math.max(L1.ankle[0], L2.ankle[0]) + 30, ftB = Math.min(L1.ankle[0], L2.ankle[0]) - 46, hy = Math.max(L1.ankle[1], L2.ankle[1]) - 34;
    const kf = [Math.max(L1.knee[0], L2.knee[0]) + 46, Math.max(L1.knee[1], L2.knee[1])];
    const R = [shB, tp(-104, -200), tp(-80, -40), [ftB - 16, hy], [ftF + 24, hy], kf, tp(80, -30), tp(96, -180), tp(40, -250), tp(-30, -300)];
    bfFill(R, o.robeC ?? BF.black, { key: k + 'rob' });
    for (let i = 0; i < 16; i++) { const u = i / 15; bfInc([tp(-80 + u * 160, -230 + u * 120), [lerp(ftB, ftF, u) + 6 * Math.sin(i * 1.7), lerp(hy - 260, hy - 14, 0.5 + 0.5 * (i % 2))], [lerp(ftB, ftF, u), hy - 14]], { w: 1.3, key: k + 'rf' + i }); }
    const zz = []; for (let i = 0; i <= 8; i++) zz.push([lerp(tp(-60, -260)[0], tp(92, -100)[0], i / 8) + (i % 2 ? 10 : -10), lerp(tp(-60, -260)[1], tp(92, -100)[1], i / 8)]); bfInc(zz, { w: 2, key: k + 'zz' });
    const hem = []; for (let i = 0; i <= 10; i++) hem.push([lerp(ftB - 14, ftF + 20, i / 10), hy - 10 - (i % 2 ? 14 : 0)]); bfInc(hem, { w: 2, key: k + 'hem' });
    if (o.trim) bfInc([[ftB - 12, hy - 4], [ftF + 18, hy - 4]], { c: o.trim, w: 7, key: k + 'trim' });
  }
  if (!(kind === 'himation' || kind === 'robe')) drawLeg(L1, BF.black, true);
  if (false) { const ftF = Math.max(L1.ankle[0], L2.ankle[0]) + 30, ftB = Math.min(L1.ankle[0], L2.ankle[0]) - 46, hy = Math.max(L1.ankle[1], L2.ankle[1]) - 34; bfFill([[ftB - 16, hy - 200], [ftF + 24, hy - 200], [ftF + 24, hy], [ftB - 16, hy]], o.robeC ?? BF.black, { key: k + 'hm2' }); for (let i = 0; i < 5; i++) bfInc([[lerp(ftB, ftF, i / 4), hy - 196], [lerp(ftB, ftF, i / 4) - 6, hy - 18]], { w: 1.4, key: k + 'hml' + i }); }
  if (o.strap) bfInc([tp(-78, -268), tp(52, -100)], { c: o.strap, w: 8, key: k + 'strap' });
  ctx.save(); ctx.translate(neck[0], neck[1]); ctx.rotate(tor + (o.nod ? 0.04 * Math.sin(TT * 1.3 + x * 0.01) : 0) + (o.headTilt ?? 0)); ctx.scale(0.98, 0.98);
  bfHead(o, k);
  ctx.restore();
  drawArm(A1, BF.black, true);
  if (o.hold) o.hold(A1.wrist, A1.ang);
  if (o.shield) { const c = tp(70, -150); bfShield(c[0], c[1], 150 * (o.shieldS ?? 1), o.shield, { key: k + 'sh', sx: o.shieldSx ?? 1 }); }
  ctx.restore();
  return { hip, neck, A1, A2 };
}
// a profile head, facing local +x, origin at the top of the neck
function bfHead(o, k) {
  const H0 = [[-30, 20], [-48, -10], [-64, -50], [-60, -96], [-32, -130], [0, -142], [32, -134], [48, -110], [54, -90], [53, -84], [64, -62], [70, -52], [60, -47], [58, -42], [62, -37], [55, -33], [59, -27], [52, -21], [56, -12], [48, -2], [25, 6], [14, 18]];
  bfFill(H0, BF.black, { raw: true });
  if (o.beard) bfFill([[-10, -40], [20, -30], [56, -10], [58, 20], [40, 50], [0, 52], [-20, 20]], BF.black, { key: k + 'brd' });
  if (o.beard) for (let i = 0; i < 4; i++) bfInc([[10 + i * 10, -14], [4 + i * 12, 40]], { w: 1.4, key: k + 'brl' + i });
  // the eye: an incised almond with a dot, the brow; an ear
  const blink = mod(TT + (o.key ? o.key.length : 0) * 0.37, 4.1) < 0.12;
  bfInc([[24, -80], [36, -86], [48, -80], [36, -74], [24, -80]], { w: 2, key: k + 'eye' }); if (!blink) bfDot(39, -80, 3.2, BF.inc);
  bfInc([[20, -96], [36, -99], [50, -94]], { w: 2, key: k + 'brw' }); bfInc([[58, -50], [52, -46]], { w: 1.4, key: k + 'nos' }); bfInc([[20, -2], [44, -8]], { w: 1.2, a: 0.6, key: k + 'jaw' });
  bfInc(arcPts(-14, -60, 12, -1.2, 1.9, 8), { w: 1.8, key: k + 'ear' });
  bfInc([[44, -34], [56, -34]], { w: 1.4, key: k + 'mth' });
  const hd = o.head ?? 'curls';
  if (hd === 'curls' || hd === 'wreath') {
    const R = RNG('bfc', k); bfFill([[-30, 18], [-58, -10], [-74, -56], [-66, -108], [-34, -144], [4, -152], [36, -142], [46, -118], [20, -112], [-10, -96], [-20, -60], [-12, -30]], BF.black, { key: k + 'hair', sep: 0 });
    for (let i = 0; i < 44; i++) { const cx = R.r(-66, 36), cy = R.r(-146, 4); if (cx > -24 && cy > -112) continue; bfInc(arcPts(cx, cy, R.r(4, 6.5), R.r(0, 3), R.r(3.8, 5.6), 7), { w: 1.4, key: k + 'cu' + i }); }
    bfInc([[-50, -40], [-30, -120], [26, -128]], { w: 1.6, key: k + 'hl' });
    if (hd === 'wreath') { bfInc([[-64, -84], [-20, -120], [40, -126]], { w: 2.4, key: k + 'fil' }); for (let i = 0; i < 9; i++) { const u = i / 8, lx = lerp(-66, 36, u), ly = lerp(-86, -128, u) - Math.sin(u * Math.PI) * 14; for (const d of [-1, 1]) { const L = ellipsePts(lx + d * 4, ly + d * 10, 13, 5, -0.5 + d * 0.9, 8); bfFill(L, BF.black, { key: k + 'wr' + i + d, raw: true }); bfInc([[lx, ly], [lx + d * 8, ly + d * 14]], { w: 1.1, raw: true }); } } }
  } else if (hd === 'helmet') {   // a Corinthian helmet: rounded dome, nose guard, cheek piece; a curved crest on a stalk
    bfFill([[-66, 6], [-72, -70], [-52, -126], [0, -150], [46, -136], [66, -104], [70, -78], [74, -40], [60, -38], [56, -62], [40, -64], [36, -44], [52, -12], [46, 22], [10, 26], [-30, 20]], BF.black, { key: k + 'hlm' });
    bfInc([[30, -88], [60, -86], [62, -72], [34, -70]], { w: 2.2, key: k + 'hsl' });
    bfInc([[-62, -40], [-30, -66], [20, -62], [40, -64]], { w: 1.8, key: k + 'hrm' });
    bfInc([[-58, -20], [-20, 4], [20, 12]], { w: 1.6, key: k + 'hrm2' });
    bfFill([[-12, -146], [8, -146], [6, -172], [-10, -172]], BF.black, { key: k + 'stk' });
    const fl = 4 * Math.sin(TT * 3);
    const crest = [[-118, -108 + fl], [-104, -170], [-50, -214], [10, -224], [64, -206], [86, -170], [60, -168], [10, -180], [-50, -170], [-92, -128 + fl]];
    bfFill(crest, o.crestC ?? BF.black, { key: k + 'crs' });
    for (let i = 0; i < 10; i++) { const u = i / 9, a0 = lerp(Math.PI * 1.05, Math.PI * 1.9, u); bfInc([[-18 + Math.cos(a0) * 80, -150 + Math.sin(a0) * 58], [-18 + Math.cos(a0) * 96, -150 + Math.sin(a0) * 70]], { w: 1.4, key: k + 'crl' + i }); }
  } else if (hd === 'bald') {
    bfInc([[-50, -70], [-56, -40]], { w: 1.4, key: k + 'bh1' }); for (let i = 0; i < 6; i++) bfInc(arcPts(-44 + (i % 3) * 8, -50 + Math.floor(i / 3) * 12, 4, 0, 5, 5), { w: 1.3, key: k + 'bc' + i });
    bfInc([[-20, -118], [20, -122]], { w: 1.2, a: 0.6, key: k + 'fhl' });
  } else if (hd === 'tiara') {
    bfFill([[-62, -60], [-70, -150], [-30, -230], [30, -220], [52, -130], [44, -96], [-20, -100]], BF.black, { key: k + 'tia' });
    for (let i = 0; i < 3; i++) bfInc([[-62 + i * 6, -110 - i * 40], [46 - i * 8, -116 - i * 38]], { c: BF.gold, w: 4, key: k + 'tb' + i });
    bfFill([[-64, -60], [-50, 30], [-30, 30], [-30, -60]], BF.black, { key: k + 'flp' });
  } else if (hd === 'crown') {
    bfInc([[-50, -40], [-30, -120], [26, -128]], { w: 1.6, key: k + 'hl2' });
    bfFill([[-50, -120], [-54, -170], [-30, -140], [-10, -180], [10, -142], [32, -176], [34, -128]], BF.gold, { key: k + 'crn' });
  } else if (hd === 'veil') {
    bfFill([[-74, 40], [-80, -90], [-40, -150], [24, -146], [40, -110], [-10, -110], [-40, -60], [-44, 60]], BF.white, { key: k + 'veil', a: 0.92 });
  }
}
// a shield seen face-on (round, a bronze rim, an emblem in added colour)
function bfShield(x, y, r, emblem = 'owl', o = {}) {
  const sx = o.sx ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(sx * (o.flip ?? 1), 1);
  ctx.save(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.restore(); bfDot(0, 0, r, BF.black); bfInc(ellipsePts(0, 0, r * 0.86, r * 0.86, 0, 40), { closed: true, w: 2.4, key: (o.key ?? 's') + 'rim' });
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; bfDot(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93, r * 0.018, BF.inc); }
  const k = (o.key ?? 's') + emblem;
  if (emblem === 'owl') {   // a white owl in profile-front, the Athenian device
    const s = r / 150;
    bfFill([[-30, 70], [-48, 30], [-46, -20], [-30, -56], [0, -64], [30, -56], [46, -20], [48, 30], [30, 70]].map(([a, b]) => [a * s, b * s]), BF.white, { key: k + 'b' });
    for (const ex of [-17, 17]) { bfDot(ex * s, -36 * s, 13 * s, BF.black); bfDot(ex * s, -36 * s, 5 * s, BF.white); }
    bfFill([[-5 * s, -26 * s], [5 * s, -26 * s], [0, -14 * s]], BF.black, { raw: true });
    for (let i = 0; i < 6; i++) bfDot((-24 + (i % 3) * 24) * s, (8 + Math.floor(i / 3) * 22) * s, 4 * s, BF.black);
  } else if (emblem === 'lambda') {
    ctx.strokeStyle = BF.red; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-r * 0.4, r * 0.48); ctx.lineTo(0, -r * 0.5); ctx.lineTo(r * 0.4, r * 0.48); ctx.stroke();
  } else if (emblem === 'disc') {
    const s = r / 150; ctx.fillStyle = BF.gold;
    bfDot(0, -6 * s, 22 * s, BF.gold);
    for (const d of [-1, 1]) bfFill([[d * 22, -18], [d * 120, -36], [d * 112, -14], [d * 120, 6], [d * 100, 14], [d * 22, 8]].map(([a, b]) => [a * s, b * s]), BF.gold, { key: k + 'w' + d });
    bfFill([[-18 * s, 18 * s], [18 * s, 18 * s], [0, 70 * s]], BF.gold, { raw: true });
  }
  ctx.restore();
}

// ---- captions: white italic, low in the picture, inking in word by word; a dark soft shadow for legibility
function bfCaption(words, o = {}) {
  const size = o.size ?? 76, maxW = o.maxW ?? 800, lh = size * 1.18;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `italic ${size}px ${BF_FONT}`; ctx.textBaseline = 'alphabetic';
  const sp = ctx.measureText(' ').width, lines = [[]]; let lw = 0;
  for (const w of words) { const ww = ctx.measureText(w.w).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += ww + sp; }
  const y0 = (o.yLast ?? 1440) - (lines.length - 1) * lh;
  lines.forEach((L, i) => {
    const tw = L.reduce((s, w) => s + w.ww, 0) + sp * (L.length - 1); let x = W / 2 - tw / 2; const y = y0 + i * lh;
    for (const w of L) {
      const kk = EZ.o2(clamp((TT - w.t + 0.06) / 0.22));
      if (kk > 0) { ctx.globalAlpha = kk * (o.a ?? 1); ctx.shadowColor = 'rgba(20,6,10,0.85)'; ctx.shadowBlur = 14; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(23,11,18,0.55)'; ctx.strokeText(w.w, x, y + (1 - kk) * 6);
        ctx.shadowBlur = 0; ctx.fillStyle = o.color ?? BF.white; ctx.fillText(w.w, x, y + (1 - kk) * 6); }
      x += w.ww + sp;
    }
  });
  ctx.restore();
}
const bfOverlay = (f) => { if (DEFER) DEFER.push(f); else f(); };

// ---- the wiggle (same as the parchment style): turbulence displacement, re-seeded every 3 frames
let BF_WIG = null;
function bfWiggle(px = 2.6) {
  if (typeof document === 'undefined') return;
  if (!BF_WIG) {
    const NS = 'http' + '://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
    for (let i = 0; i < 4; i++) {
      const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', 'bfwig' + i); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '1'); f.setAttribute('height', '1');
      const t = document.createElementNS(NS, 'feTurbulence'); t.setAttribute('type', 'fractalNoise'); t.setAttribute('baseFrequency', '0.022'); t.setAttribute('numOctaves', '2'); t.setAttribute('seed', String(3 + i * 7)); t.setAttribute('result', 'n');
      const d = document.createElementNS(NS, 'feDisplacementMap'); d.setAttribute('in', 'SourceGraphic'); d.setAttribute('in2', 'n'); d.setAttribute('scale', String(px * 2)); d.setAttribute('xChannelSelector', 'R'); d.setAttribute('yChannelSelector', 'G');
      f.appendChild(t); f.appendChild(d); svg.appendChild(f);
    }
    document.body.appendChild(svg);
    BF_WIG = document.createElement('canvas'); BF_WIG.width = W; BF_WIG.height = H;
  }
  const g = BF_WIG.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `url(#bfwig${Math.floor(F / 3) % 4})`; ctx.drawImage(BF_WIG, 0, 0); ctx.filter = 'none'; ctx.restore();
}


// =====================================================================
//  v2 (proven on pieces/troya-bf, 2026-10-20) — THE DEFAULT WAY TO MAKE AN amphora-bf PIECE
//  Figures and sets are Nano Banana 2 layers (Flow MCP, on magenta, keyed) drawn with bfLay; scenes sit on one
//  frieze that slides right (bfStripStage); captions are Ludovico W03 Woodcut written by hand on the voice's words
//  (bfCaptions); the title rides a ribbon (bfRibbon); the end card is bfSignoff. The older code puppets
//  (bfFigure & co. above) still work for small extras.
// =====================================================================
const bfFadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
let BF_PDX = 0;   // the x offset of the panel being drawn (the strip slides right between scenes)
const BF_SLIDE = 0.9;
function bfStripPos() { let p = 0; for (let i = 1; i < TB.length; i++) p += EZ.io(clamp((TT - (TB[i] - BF_SLIDE / 2)) / BF_SLIDE)); return p; }
function bfCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 - c.z * c.cx + BF_PDX, H / 2 - c.z * c.cy); }

// ---- a painted layer: anchored at its feet (ax, ay = 0.5, 1), height h; flip, rotation, squash, alpha, an orange ring
function bfLay(name, x, y, h, o = {}) {
  const im = asset(name); if (!im || h <= 0) return;
  const w = h * im.naturalWidth / im.naturalHeight, ax = o.ax ?? 0.5, ay = o.ay ?? 1;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.scale((o.flip ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
  if (o.a != null) ctx.globalAlpha *= clamp(o.a);
  if (o.ring) ctx.filter = 'drop-shadow(4px 0 0 #e57d36) drop-shadow(-4px 0 0 #e57d36) drop-shadow(0 4px 0 #e57d36) drop-shadow(0 -4px 0 #e57d36)';
  if (o.clipTop != null) { ctx.beginPath(); ctx.rect(-w * ax - 5, -h * ay + h * o.clipTop, w + 10, h * (1 - o.clipTop) + 5); ctx.clip(); }
  ctx.drawImage(im, -w * ax, -h * ay, w, h);
  ctx.restore();
}

// ---- captions: white Ludovico W03 Woodcut, one chunk at a time, inking in word by word, a dark soft shadow
const BF_CAP_FONT = '"LudovicoW03-Woodcut", "Ludovico W03 Woodcut", "Garamond", Georgia, serif';
// a word written by hand: revealed left to right behind a slanted pen edge, with a soft drop shadow
function bfPen(str, x, y, ww, prog, size, fill = '#f7efe2') {
  if (prog <= 0) return;
  ctx.save();
  if (prog < 1) { const xe = x - 6 + (ww + 12) * EZ.io(prog), sl = size * 0.25;
    ctx.beginPath(); ctx.moveTo(x - 40, y + size * 0.8); ctx.lineTo(xe - sl * 0.6, y + size * 0.8); ctx.lineTo(xe + sl, y - size * 1.2); ctx.lineTo(x - 40, y - size * 1.2); ctx.closePath(); ctx.clip(); }
  ctx.shadowColor = 'rgba(18,5,8,0.95)'; ctx.shadowBlur = 16; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 5;
  ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(23,11,18,0.65)'; ctx.strokeText(str, x, y);
  ctx.shadowColor = 'rgba(18,5,8,0.7)'; ctx.shadowBlur = 3; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3; ctx.fillStyle = fill; ctx.fillText(str, x, y);
  ctx.restore();
}
function bfCaptions(pi) {
  const id = IDS[pi], dx = BF_PDX; if (id === 'banner' || id === 'sign') return;
  for (let k = 0; k < CAPS.length; k++) {
    const t0 = CAPS[k][0], t1 = k + 1 < CAPS.length ? CAPS[k + 1][0] : SUBEND(id);
    if (t0 < TB[pi] - 0.01 || t0 >= SUBEND(id) - 0.01) continue;   // this panel's chunks only
    const last = k + 1 >= CAPS.length || CAPS[k + 1][0] >= SUBEND(id) - 0.01;
    const tEnd = last ? SUBEND(id) - BF_SLIDE / 2 : t1 - 0.06;          // gone before the next chunk / before the slide
    if (TT < t0 - 0.05 || TT >= tEnd) continue;
    const words = CAPS[k][1].split(' '), wt = CAPS[k][2], a = bfFadeOut(tEnd - 0.12, 0.1);
    bfOverlay(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, dx, 0); ctx.font = `100px ${BF_CAP_FONT}`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '5px';
      let sz = 100, sp = ctx.measureText(' ').width, ws = words.map((w) => ({ w, ww: ctx.measureText(w).width })), tw = ws.reduce((s, w) => s + w.ww, 0) + sp * (ws.length - 1);
      if (tw > 780) { const f = 780 / tw; sz = Math.floor(100 * f); ctx.font = `${sz}px ${BF_CAP_FONT}`; ctx.letterSpacing = 5 * f + 'px'; sp *= f; ws.forEach((w) => (w.ww *= f)); tw *= f; }
      let x = W / 2 - tw / 2; const y = 1180;
      ctx.globalAlpha = a;
      ws.forEach((w, i) => {
        const next = i + 1 < wt.length ? wt[i + 1] : wt[i] + 0.45, dur = clamp((next - wt[i]) * 0.85, 0.16, 0.42);
        bfPen(w.w, x, y, w.ww, clamp((TT - wt[i] + 0.04) / dur), sz);
        x += w.ww + sp;
      });
      ctx.restore();
    });
  }
}
// one long frieze: panel i sits at x = i*W and the camera slides right at every boundary (no cuts). The friezes stay
// put; each panel's captions ride with it and fade before the slide. Needs IDS, TB, SUBEND, CAPS from the head.
function bfStripStage(SCENES) {
  const p = bfStripPos(), off = p * W, i0 = Math.min(IDS.length - 1, Math.floor(p)), i1 = Math.min(IDS.length - 1, i0 + 1);
  for (const i of i0 === i1 ? [i0] : [i0, i1]) {
    BF_PDX = i * W - off;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, BF_PDX, 0);
    if (!drawAsset('fondo.jpg', 0, 0, W, H, { fit: 'cover' })) { ctx.fillStyle = BF.ground; ctx.fillRect(0, 0, W, H); }
    ctx.beginPath(); ctx.rect(0, BF_TOP, W, BF_BOT - BF_TOP); ctx.clip();
    SCENES[IDS[i]]();
    ctx.restore();
    bfCaptions(i);
  }
  BF_PDX = 0;
  bfWear(0.3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bfOverlay(() => bfFrame());
}
// the title ribbon (assets/ribbon.png, from Ref amphora mitologia/ribbon.jpeg, green-keyed): it drops in, unrolls from the
// centre outwards with two rolls travelling to the ends, then the title is written by hand inside the band (never outside it)
function bfRibbon(text, t0, tEnd) {
  const im = asset('ribbon.png'), dx = BF_PDX; if (!im || TT < t0) return;
  bfOverlay(() => {
    const w = 1000, h = w * im.naturalHeight / im.naturalWidth, mid = 0.64;
    const open = EZ.io(clamp((TT - t0) / 1.1)), pop = EZ.back(clamp((TT - t0) / 0.45)), drop = EZ.o2(clamp((TT - t0) / 0.6));
    const cy = lerp(640, 720, drop) + 6 * Math.sin((TT - t0) * 1.4);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, dx, 0); ctx.globalAlpha *= bfFadeOut(tEnd - BF_SLIDE / 2 - 0.3, 0.3); ctx.translate(540, cy); ctx.rotate(0.012 * Math.sin((TT - t0) * 1.1)); ctx.scale(lerp(0.85, 1, pop), lerp(0.35, 1, pop));
    ctx.shadowColor = 'rgba(30,10,5,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 * open - 2, -h, w * open + 4, h * 2); ctx.clip();
    ctx.drawImage(im, -w / 2, -h * mid, w, h); ctx.restore();
    ctx.shadowColor = 'transparent';
    // the two rolls travelling outwards while it opens
    if (open < 1) for (const sgn of [-1, 1]) { const x = sgn * w / 2 * open, y = -h * 0.08 + (1 - Math.abs(open - 0.5) * 2) * -h * 0.06;
      ctx.beginPath(); ctx.ellipse(x, y, 16 + 10 * (1 - open), h * 0.36, 0, 0, TAU); ctx.fillStyle = '#c99a55'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#3a2208'; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y, 6, h * 0.22, 0, 0, TAU); ctx.stroke(); }
    // the name, letter by letter once the ribbon is open, with a glint passing over it
    const k = clamp((TT - t0 - 0.85) / 1.0), str = text;
    if (k > 0) { let sz = 74; ctx.font = `${sz}px ${BF_CAP_FONT}`; ctx.letterSpacing = '4px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      let tw = ctx.measureText(str).width; const maxW = w * 0.56; if (tw > maxW) { sz = Math.floor(sz * maxW / tw); ctx.font = `${sz}px ${BF_CAP_FONT}`; tw = ctx.measureText(str).width; }
      const x0 = -tw / 2, y = h * 0.02;
      ctx.save(); ctx.beginPath(); ctx.rect(-w * 0.34, -h * 0.24, w * 0.68, h * 0.5); ctx.clip();   // never outside the band
      bfPen(str, x0, y, tw, k, sz, '#fbf3e0');
      if (TT > t0 + 2.0) { const gx = x0 + mod((TT - t0 - 2.0) * 0.5, 1.6) * tw, g = ctx.createLinearGradient(gx - 50, 0, gx + 50, 0);
        g.addColorStop(0, 'rgba(255,240,190,0)'); g.addColorStop(0.5, 'rgba(255,240,190,0.85)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillText(str, x0, y); }
      ctx.restore(); }
    ctx.restore();
  });
}
// the sign-off card: the apple (assets/apple.png) lands, AMPHORUS in gold Roman capitals with a glint
function bfSignoff(t0) {
  bfCam({ cx: 540, cy: 960, z: 1 });
  const k = springMove(t0, 0, 1, SPRING.heavy), bob = 10 * Math.sin((TT - t0) * 1.6), sz = 460 * k;
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(540, 880 + bob); ctx.rotate(0.03 * Math.sin((TT - t0) * 1.2)); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  const dx = BF_PDX; bfOverlay(() => { ctx.save(); ctx.setTransform(1, 0, 0, 1, dx, 0); ctx.globalAlpha = EZ.o2(clamp((TT - t0 - 0.4) / 0.8)); bfLogo('AMPHORUS', 540, 1250, 100, t0); ctx.restore(); });
}
function bfLogo(str, x, y, size, t0 = 0) {
  ctx.save(); ctx.font = `${size}px ${BF_CAPS}`; ctx.textAlign = 'center'; ctx.letterSpacing = size * 0.12 + 'px';
  const w = ctx.measureText(str).width;
  ctx.fillStyle = 'rgba(30,10,5,0.6)'; ctx.fillText(str, x + 4, y + 6);
  const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.1); g.addColorStop(0, '#f6dd94'); g.addColorStop(0.45, '#d6a64a'); g.addColorStop(0.55, '#a8761f'); g.addColorStop(1, '#e3bd68');
  ctx.fillStyle = g; ctx.fillText(str, x, y); ctx.lineWidth = 2; ctx.strokeStyle = '#3a2208'; ctx.strokeText(str, x, y);
  const sx = x - w / 2 + mod((TT - t0) * 0.6, 1.6) * w, s = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
  s.addColorStop(0, 'rgba(255,250,220,0)'); s.addColorStop(0.5, 'rgba(255,250,220,0.8)'); s.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = s; ctx.fillText(str, x, y); ctx.restore();
}


const STYLE = {
  name: 'amphora-bf',
  paper: BF.ground,
  backdrop() { bfGround(); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { bfFill(P, c); },
  hero(x, y, r) { bfShield(x, y, r, 'owl'); },
  heroColor: BF.black,
  post() { bfWiggle(); },
  ones: false,
};
