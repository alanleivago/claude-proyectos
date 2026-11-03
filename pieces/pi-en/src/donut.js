// =====================================================================
//  DONUT — a glazed donut (bready dough with a pale belt, drippy pink glaze, sprinkles, torn crumb at the cracks)
//  in three arcs that crack apart, held in your right hand at the bottom right of the frame: the thumb rests on the
//  glaze, the index and middle fingers curl under the rim. Each digit closes until it touches the donut (solved every
//  frame against the donut's surface), so nothing passes through it and nothing floats.
// =====================================================================
const DN_R = 0.045, DN_r = 0.022, DN_SQ = 0.84, DN_GL = 0.0022;          // ring radius, tube radius, squash, glaze thickness
const DN_GRIP = -0.52;                                                      // the ring angle the hand holds (donut-local)
// the dough's tube radius at ring angle th, tube angle al (0 = outer belt, π/2 = top): a hand-made, slightly lumpy ring
function donutRad(th, al) { return DN_r * (1 + 0.05 * Math.sin(3 * th + 0.7) * Math.cos(al) + 0.03 * Math.sin(7 * th + 2.1) + 0.02 * Math.sin(5 * th + 3 * al)); }
function donutPt(th, al, dr, out) { const rr = donutRad(th, al) + dr, s = Math.sin(al), rho = DN_R + 0.0015 * Math.sin(4 * th + 1) + rr * Math.cos(al);
  return out.set(rho * Math.cos(th), rho * Math.sin(th), rr * s * DN_SQ * (s < 0 ? 0.85 : 1)); }                // flatter underneath
// where the glaze ends on the outer side (tube angle), with drips running down
function donutDripLo(th, D) { let lo = 0.12 + 0.07 * Math.sin(9 * th + 1) + 0.04 * Math.sin(23 * th);
  D.forEach(([c, w, d]) => { const a = Math.atan2(Math.sin(th - c), Math.cos(th - c)); lo -= d * Math.exp(-((a / w) ** 2)); }); return lo; }
const donutDripHi = (th) => Math.PI + 0.32 + 0.08 * Math.sin(5 * th + 1);
// a tube patch th ∈ [a0, a0+al], al ∈ [-π/2, 3π/2] with radius offset dr(th, al); analytic-ish normals (finite differences)
function donutTube(a0, al, nu, nv, dr) { const P = [], N = [], U = [], I = [], p = new THREE.Vector3(), q1 = new THREE.Vector3(), q2 = new THREE.Vector3(), e = 1e-3;
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const th = a0 + al * i / nu, a = -Math.PI / 2 + TAU * j / nv, f = (t, b) => donutPt(t, b, dr(t, b), new THREE.Vector3());
    donutPt(th, a, dr(th, a), p); P.push(p.x, p.y, p.z); q1.subVectors(f(th + e, a), f(th - e, a)); q2.subVectors(f(th, a + e), f(th, a - e)); q1.cross(q2).normalize(); N.push(q1.x, q1.y, q1.z); U.push(i / nu * al * 2, j / nv); }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; I.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); return g; }
// the torn face of a crack at ring angle th: a jagged disc filling the tube's cross-section
function donutCap(th, R) { const P = [], U = [], I = [], nv = 28, rings = 4, c = new THREE.Vector3(DN_R * Math.cos(th), DN_R * Math.sin(th), 0), tg = new THREE.Vector3(-Math.sin(th), Math.cos(th), 0), p = new THREE.Vector3();
  P.push(c.x, c.y, c.z); U.push(0.5, 0.5);
  for (let k = 1; k <= rings; k++) for (let j = 0; j < nv; j++) { const a = -Math.PI / 2 + TAU * j / nv, q = k / rings; donutPt(th, a, -0.0004, p).sub(c).multiplyScalar(q).add(c).addScaledVector(tg, R.n(0.0032) * (k < rings ? 1 : 0.25)); P.push(p.x, p.y, p.z); U.push(0.5 + 0.5 * q * Math.cos(a), 0.5 + 0.5 * q * Math.sin(a)); }
  for (let j = 0; j < nv; j++) I.push(0, 1 + j, 1 + (j + 1) % nv);
  for (let k = 1; k < rings; k++) for (let j = 0; j < nv; j++) { const a = 1 + (k - 1) * nv + j, b = 1 + (k - 1) * nv + (j + 1) % nv; I.push(a, a + nv, b, b, a + nv, b + nv); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals(); return g; }
// textures: fried dough (golden top and bottom, a pale belt round the middle, pores) and the airy crumb inside
function donutDoughTex() { return g3Tex((x, w, h) => { const R = RNG('dndough');
  for (let y = 0; y < h; y++) { const a = -Math.PI / 2 + TAU * (1 - y / h), s = Math.sin(a), c = Math.cos(a), belt = Math.exp(-((s / 0.3) ** 2)) * (c > 0 ? 1 : 0.55);
    const col = new THREE.Color('#b8702c').lerp(new THREE.Color('#9a5a22'), Math.max(0, -s) * 0.6).lerp(new THREE.Color('#f0d7a4'), belt); x.fillStyle = col.getStyle(); x.fillRect(0, y, w, 1); }
  for (let k = 0; k < 50; k++) blot(x, R.r(0, w), R.r(0, h), R.r(8, 30), `rgba(${R.f() < 0.5 ? '120,60,20' : '250,220,170'},0.1)`);
  for (let k = 0; k < 5000; k++) { x.fillStyle = R.f() < 0.6 ? `rgba(90,45,15,${R.r(0.08, 0.25)})` : `rgba(255,235,200,${R.r(0.08, 0.2)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(0.4, 1.4), R.r(0.4, 1.1), R.r(0, 3), 0, TAU); x.fill(); } }, 256, 256); }
function donutCrumbTex() { return g3Tex((x, w, h) => { const R = RNG('dncrumb'); x.fillStyle = '#ecd5a2'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 700; k++) { const px = R.r(0, w), py = R.r(0, h), r = R.r(0.8, 4); x.fillStyle = `rgba(170,120,60,${R.r(0.25, 0.6)})`; x.beginPath(); x.ellipse(px, py, r, r * R.r(0.5, 1), R.r(0, 3), 0, TAU); x.fill(); x.fillStyle = 'rgba(255,245,220,0.5)'; x.beginPath(); x.ellipse(px + 0.6, py + 0.8, r * 0.5, r * 0.3, 0, 0, TAU); x.fill(); } }, 128, 128); }
// a glazed donut with sprinkles, in three arcs that can split apart (g.parts[i].p, .a = mid angle; parts[0] is the one in your hand)
function makeDonut() { const g = new THREE.Group(), R = RNG('dn'), dt = donutDoughTex(), ct = donutCrumbTex();
  dt.wrapS = dt.wrapT = THREE.RepeatWrapping;
  const dough = STDm({ map: dt, bumpMap: dt, bumpScale: 0.0012, roughness: 0.78 }), crumb = STDm({ map: ct, bumpMap: ct, bumpScale: 0.0025, roughness: 0.9, side: THREE.DoubleSide });
  const glaze = new THREE.MeshPhysicalMaterial({ color: '#ee7aa6', roughness: 0.32, clearcoat: 0.45, clearcoatRoughness: 0.25, sheen: 0.3, sheenColor: new THREE.Color('#ffd0e0') });
  const spM = ['#ffffff', '#3a8ae8', '#f0c030', '#3ab05a', '#e83a3a', '#8a4ad8'].map((c) => STDm({ color: c, roughness: 0.45 })), spG = new THREE.CapsuleGeometry(0.0012, 0.0045, 2, 6);
  const D = []; for (let k = 0; k < 16; k++) D.push([R.r(0, TAU), R.r(0.035, 0.075), R.r(0.25, 0.85)]);
  const glazeDr = (th, a) => { const lo = donutDripLo(th, D), hi = donutDripHi(th), f = ss(lo - 0.03, lo + 0.06, a) * (1 - ss(hi - 0.1, hi, a)); return lerp(-0.004, DN_GL + 0.0012 * Math.exp(-(((a - lo - 0.05) / 0.06) ** 2)), f); };   // a bead along the drip edge
  g.parts = []; g.crumbs = [];
  for (let k = 0; k < 3; k++) { const p = new THREE.Group(); g.add(p); const al = TAU / 3, a0 = DN_GRIP - al / 2 + k * al;
    p.add(mesh(donutTube(a0, al, 72, 36, () => 0), dough)); p.add(mesh(donutTube(a0, al, 140, 56, glazeDr), glaze));
    [a0, a0 + al].forEach((th) => p.add(mesh(donutCap(th, R), crumb)));
    for (let s = 0; s < 34; s++) { const th = a0 + R.r(0.03, al - 0.03), lo = donutDripLo(th, D) + 0.22, hi = donutDripHi(th) - 0.25, a = R.r(lo, hi), P = donutPt(th, a, DN_GL + 0.0004, new THREE.Vector3());
      const n = donutPt(th, a, DN_GL + 0.003, new THREE.Vector3()).sub(P).normalize(), tg = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).cross(n).normalize();
      const sp = mesh(spG, R.pick(spM), P.x, P.y, P.z); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg); sp.castShadow = false; p.add(sp); }
    g.parts.push({ p, a: a0 + al / 2 }); }
  // crumbs: they break off at the three cracks and fall
  for (let i = 0; i < 18; i++) { const th = DN_GRIP + TAU / 6 + (i % 3) * TAU / 3 + R.n(0.06), a = R.r(-0.5, 2.2), P = donutPt(th, a, -0.002, new THREE.Vector3()), m = mesh(lumpyGeo(1, 0.45, 40 + i), R.f() < 0.25 ? glaze : crumb, P.x, P.y, P.z);
    m.scale.setScalar(R.r(0.0015, 0.0038)); m.castShadow = false; m.visible = false; g.add(m);
    g.crumbs.push({ m, p0: P, v: new THREE.Vector3(Math.cos(th) * R.r(0.3, 1), Math.sin(th) * R.r(0.3, 1), R.r(0.2, 1)).add(new THREE.Vector3(-Math.sin(th), Math.cos(th), 0).multiplyScalar(R.n(0.8))), d: R.r(0, 0.25), sp: R.r(-12, 12) }); }
  return g; }
// a sleeve over the forearm (once): cloth with soft folds and a cuff
function donutSleeve(H) { const g = new THREE.CylinderGeometry(0.062, 0.07, 0.46, 36, 14, true), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), f = 1 + 0.06 * Math.sin(6 * a + y * 25) * Math.sin(y * 14 + 1) + 0.03 * Math.sin(11 * a - y * 9); p.setXYZ(i, x * f, y, z * f); }
  g.translate(0, -0.36, 0).scale(1.2, 1, 0.85); g.computeVertexNormals();
  const s = mesh(g, H.sleeveM); H.sleeveM.side = THREE.DoubleSide; H.fore.add(s); s.add(mesh(new THREE.TorusGeometry(0.06, 0.008, 10, 36).rotateX(Math.PI / 2).scale(1.2, 1, 0.85), H.sleeveM, 0, -0.13, 0)); return s; }
// ---- contact: distance from a world point to the donut's surface (glaze included); a digit's clearance along its chain
const _dnI = new THREE.Matrix4(), _dnP = new THREE.Vector3(), _dnA = new THREE.Vector3(), _dnB = new THREE.Vector3(), _dnC = new THREE.Vector3();
function donutDist(w) { _dnP.copy(w).applyMatrix4(_dnI); const rho = Math.hypot(_dnP.x, _dnP.y), th = Math.atan2(_dnP.y, _dnP.x), sq = DN_SQ * (_dnP.z < 0 ? 0.85 : 1), dx = rho - DN_R, dz = _dnP.z / sq, q = Math.hypot(dx, dz), al = Math.atan2(dz, dx);
  const f = q - donutRad(th, al) - (_dnP.z > 0 ? DN_GL : 0); return f * q / Math.max(1e-6, Math.hypot(dx, dz / sq)); }
// fingers also keep out of the hole as seen from the camera (_dnV: the eye in donut space), or they'd show through it
const _dnV = new THREE.Vector3();
function donutDistF(w) { const d = donutDist(w), k = _dnP.z / _dnV.z; return Math.min(d, Math.hypot(_dnP.x - _dnV.x * k, _dnP.y - _dnV.y * k) - 0.032); }
function donutGap(J, hole) { const D = hole ? donutDistF : donutDist; let m = 1; for (let i = 0; i < J.length; i++) { J[i][0].getWorldPosition(_dnA); m = Math.min(m, D(_dnA) - J[i][1]);
    if (i) for (let s = 1; s < 4; s++) { _dnC.lerpVectors(_dnB, _dnA, s / 4); m = Math.min(m, D(_dnC) - lerp(J[i - 1][1], J[i][1], s / 4)); } _dnB.copy(_dnA); } return m; }
// a digit (set(k), k = lo … hi): scan its range for the pose that rests on the donut (clear, nearest to touching), refine at the contact
function donutTouch(set, J, lo, hi, hole) { const n = 24, g = []; for (let i = 0; i <= n; i++) { set(lo + (hi - lo) * i / n); g.push(donutGap(J, hole)); }
  let b = -1; g.forEach((v, i) => { if (v > 0 && (b < 0 || v < g[b])) b = i; }); if (b < 0) { b = g.indexOf(Math.max(...g)); set(lo + (hi - lo) * b / n); return lo + (hi - lo) * b / n; }
  const nb = [b - 1, b + 1].filter((i) => i >= 0 && i <= n && g[i] <= 0)[0]; let a = lo + (hi - lo) * b / n;
  if (nb !== undefined) { let c = lo + (hi - lo) * nb / n; for (let it = 0; it < 12; it++) { const m = (a + c) / 2; set(m); if (donutGap(J, hole) > 0.0004) a = m; else c = m; } } set(a); return a; }
// the hand's palm frame in donut-local space: outside the rim at DN_GRIP, below it, thumb side up, palm facing the hole
const DN_HAND = { r: 0.133, t: 0.0, z: -0.021, rx: 0.609, ry: -0.532, rz: 0.534, wrist: [0.4, 0, -0.5], thumb: [-1.041, 0.342] };
// your right hand with the donut at the bottom right of the frame; k = 0 (out of view) … 1; split = 0 (whole) … 1 (cracked)
function placeDonut(S, cam, k, split, t) { const H = S.HR, Dn = S.donut, vis = k > 0.01; H.root.visible = Dn.visible = vis; if (!vis) return; cam.updateMatrixWorld(true);
  if (!H.donutSleeve) H.donutSleeve = donutSleeve(H);
  const e = ss(0, 1, k), ts = TS(t), tr = (f, p) => Math.sin(t * f + p) * 0.6 + Math.sin(t * f * 2.3 + p * 1.7) * 0.4;   // tremble keeps real time even in slow motion
  // the donut in camera space: low on the right, tilted toward you so the hole and the glaze show; rises from below with k
  const bob = 0.008 * Math.sin(ts * 11 - 0.9), sway = 0.005 * Math.sin(ts * 5.5 + 0.4);
  const pc = new THREE.Vector3(0.1 + sway + 0.04 * (1 - e), lerp(-0.62, -0.245, e) + bob + 0.0012 * tr(7, 1), -0.72);
  const n = new THREE.Vector3(-0.2 + 0.006 * tr(5, 2), 0.66 + 0.5 * (1 - e) + 0.01 * Math.sin(ts * 5.5), 0.74).normalize(), xa = new THREE.Vector3(1, 0, 0).addScaledVector(n, -n.x).normalize().applyAxisAngle(n, 0.008 * tr(6, 3)), ya = new THREE.Vector3().crossVectors(n, xa);
  Dn.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xa, ya, n)).premultiply(cam.quaternion); Dn.position.copy(pc.applyQuaternion(cam.quaternion)).add(cam.position); Dn.updateMatrixWorld(true);
  // the cracked pieces: the one in your hand stays, the others slip outward and tilt away; crumbs fall
  const sp = ss(0, 1, split);
  Dn.parts.forEach((P, i) => { const ca = Math.cos(P.a), sa = Math.sin(P.a), pv = new THREE.Vector3(DN_R * ca, DN_R * sa, 0), q = new THREE.Quaternion();
    if (i) q.setFromAxisAngle(new THREE.Vector3(-sa, ca, 0), (i === 1 ? -0.32 : -0.12) * sp).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (i === 1 ? 0.05 : -0.04) * sp));
    else q.setFromAxisAngle(new THREE.Vector3(-sa, ca, 0), 0.03 * sp);
    P.p.quaternion.copy(q); P.p.position.copy(pv).sub(pv.clone().applyQuaternion(q)).add(new THREE.Vector3(ca, sa, 0).multiplyScalar(i ? 0.011 * sp : 0.002 * sp)).add(new THREE.Vector3(0, 0, i ? -0.006 * sp : 0)); });
  const gl = new THREE.Vector3(0, -1, 0).applyQuaternion(Dn.quaternion.clone().invert());
  Dn.crumbs.forEach((C) => { const s = clamp((split - C.d) / (1 - C.d)); C.m.visible = s > 0.001 && s < 0.999; if (!C.m.visible) return;
    C.m.position.copy(C.p0).addScaledVector(C.v, 0.035 * s).addScaledVector(gl, 0.45 * s * s); C.m.rotation.set(C.sp * s, C.sp * 0.7 * s, 0); });
  Dn.updateMatrixWorld(true); _dnI.copy(Dn.matrixWorld).invert(); _dnV.copy(cam.position).applyMatrix4(_dnI).normalize();
  // the palm frame (donut-local) → world; the forearm is set back through the wrist angles so it comes from the bottom-right corner
  const h = DN_HAND, rad = new THREE.Vector3(Math.cos(DN_GRIP), Math.sin(DN_GRIP), 0), tan = new THREE.Vector3(-Math.sin(DN_GRIP), Math.cos(DN_GRIP), 0), zd = new THREE.Vector3(0, 0, 1);
  const palmQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(tan.clone().negate(), rad.clone().negate(), zd.clone().negate())).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(h.rx, h.ry, h.rz)));
  const palmP = rad.clone().multiplyScalar(h.r).addScaledVector(tan, h.t).addScaledVector(zd, h.z);
  const wq = new THREE.Quaternion().setFromEuler(new THREE.Euler(h.wrist[0], h.wrist[1], h.wrist[2]));
  H.root.quaternion.copy(Dn.quaternion).multiply(palmQ).multiply(wq.clone().invert()); H.root.position.copy(palmP.applyMatrix4(Dn.matrixWorld));
  H.wrist.rotation.set(h.wrist[0], h.wrist[1], h.wrist[2]); H.root.updateMatrixWorld(true);
  // digits: thumb down onto the glaze, index and middle curled under the rim; ring and little finger tucked
  H.thumb[0].rotation.y = h.thumb[0]; H.thumb[0].rotation.z = h.thumb[1];
  const setT = (f) => { H.thumb[0].rotation.x = -0.15 - 0.4 * f; H.thumb[1].rotation.x = -0.6 * f - 0.1; H.thumb[2].rotation.x = -0.7 * f - 0.15; H.thumb[0].updateMatrixWorld(true); };
  const tf = donutTouch(setT, [[H.thumb[0], H.thumb[0].userData.r], [H.thumb[1], H.thumb[1].userData.r], [H.thumb[2], H.thumb[2].userData.r], [H.thumbTip, 0.006]], -0.8, 1.4);
  const curl = H.fingers.map((F, i) => { const set = (c) => { F.base.rotation.set(-c * 1.35, 0, (i - 1.5) * 0.11 * 0.15); F.segs[1].rotation.x = -c * 1.55; F.segs[2].rotation.x = -c * 1.15; F.base.updateMatrixWorld(true); };
    return donutTouch(set, [[F.base, F.segs[0].userData.r * 1.05], [F.segs[1], F.segs[1].userData.r], [F.segs[2], F.segs[2].userData.r], [F.tipG, F.tipG.userData.r * 0.7]], 0.0, 1.0, 1); });
  poseHand(H, { curl, spread: 0.15, thumb: tf, wristPitch: h.wrist[0], wristYaw: h.wrist[1], wristRoll: h.wrist[2] }); }
