
// =====================================================================
//  HANDS — two detailed first-person hands: a sculpted palm (lathe + displaced), 3-phalanx fingers with tapered
//  segments and knuckle pads, a 3-segment thumb on a saddle joint, nails with lunulae and cuticles, skin with
//  creases, knuckle wrinkles and pores (colour + bump), veins on the back; a sleeve and wrist.
//  Each hand also holds an inner skeleton (bones) and vessels, shown when the protons vanish (the skin turns glassy).
// =====================================================================
const SKIN_HAND = '#c8906c';
function roundedBox(w, h, d, r, seg = 10) { const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), p = g.attributes.position, hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r, v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.set(clamp(v.x, -hw, hw), clamp(v.y, -hh, hh), clamp(v.z, -hd, hd)); v.sub(c).normalize().multiplyScalar(r).add(c); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }
// skin texture: base tone, pores, palm lines (life/head/heart), knuckle creases; bump uses the same canvas
function texSkin(key, palm) { return g3Tex((x, w, h) => { const R = RNG(key); x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 60; k++) blot(x, R.r(0, w), R.r(0, h), R.r(20, 70), `rgba(${R.f() < 0.5 ? '200,120,110' : '255,230,210'},0.1)`);
  for (let k = 0; k < 9000; k++) { x.fillStyle = `rgba(120,70,60,${R.r(0.04, 0.12)})`; x.fillRect(R.r(0, w), R.r(0, h), 1.2, 1.2); }
  x.lineCap = 'round';
  if (palm) { const crease = (pts, wd) => { x.strokeStyle = 'rgba(120,60,50,0.3)'; x.lineWidth = wd; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a * w, b * h) : x.moveTo(a * w, b * h))); x.stroke(); x.strokeStyle = 'rgba(255,235,220,0.35)'; x.lineWidth = wd * 0.5; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a * w + 1.5, b * h + 1.5) : x.moveTo(a * w + 1.5, b * h + 1.5))); x.stroke(); };
    crease([[0.92, 0.3], [0.7, 0.36], [0.45, 0.33], [0.2, 0.28]], 2.2); crease([[0.88, 0.42], [0.6, 0.5], [0.35, 0.55], [0.15, 0.62]], 2.2); crease([[0.82, 0.48], [0.7, 0.65], [0.62, 0.85], [0.6, 1.0]], 2.5);
    for (let k = 0; k < 60; k++) { const px = R.r(0, w), py = R.r(0, h), a = R.r(0, TAU), L = R.r(6, 22); x.strokeStyle = 'rgba(130,70,60,0.18)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); } }
  else { for (let k = 0; k < 7; k++) { const vx = R.r(0.2, 0.8) * w; x.strokeStyle = 'rgba(110,120,160,0.18)'; x.lineWidth = R.r(4, 8); x.beginPath(); x.moveTo(vx, h); x.bezierCurveTo(vx + R.n(30), h * 0.6, vx + R.n(40), h * 0.3, vx + R.n(30), 0); x.stroke(); } } }, 512, 512); }
function texKnuckle() { return g3Tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); const R = RNG('knk'); for (let k = 0; k < 4000; k++) { x.fillStyle = `rgba(120,70,60,${R.r(0.04, 0.12)})`; x.fillRect(R.r(0, w), R.r(0, h), 1.2, 1.2); }
  for (let k = 0; k < 6; k++) { const y = h * (0.42 + k * 0.03); x.strokeStyle = 'rgba(110,60,50,0.35)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(w * 0.2, y); x.quadraticCurveTo(w * 0.5, y - 6 + k * 2, w * 0.8, y); x.stroke(); } }, 256, 256); }
// one hand. side = -1 (left) / 1 (right). Returns the joint groups for posing and the materials for the effects.
function makeHand(side, o = {}) {
  const skinMap = texSkin('skinB' + side, false), palmMap = texSkin('skinP' + side, true), knMap = texKnuckle();
  const skin = new THREE.MeshPhysicalMaterial({ color: o.skin || SKIN_HAND, roughness: 0.62, side: THREE.DoubleSide, sheen: 0.6, sheenColor: new THREE.Color('#ffb8a0'), sheenRoughness: 0.5, clearcoat: 0.08, clearcoatRoughness: 0.6 }), palmM = new THREE.MeshPhysicalMaterial({ color: '#d8a084', map: palmMap, bumpMap: palmMap, bumpScale: 0.0015, roughness: 0.65, sheen: 0.6, sheenColor: new THREE.Color('#ffc0a8') });
  const knM = STDm({ color: o.skin || SKIN_HAND, map: knMap, bumpMap: knMap, bumpScale: 0.004, roughness: 0.55 }), nailM = STDm({ color: '#e8b8a8', roughness: 0.2, metalness: 0.0 }), lunM = STDm({ color: '#f8eae6', roughness: 0.3 });
  const sleeveM = STDm({ color: o.sleeve || '#2a3a5a', roughness: 0.9, map: g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 3) { x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(i, 0, 1, h); } }, 64, 64) });
  const boneM = new THREE.MeshStandardMaterial({ color: '#f4f0f8', emissive: '#ffffff', emissiveIntensity: 0, transparent: true, opacity: 0, roughness: 0.4 }), vesselM = new THREE.MeshStandardMaterial({ color: '#ff70b0', emissive: '#ff4090', emissiveIntensity: 0, transparent: true, opacity: 0 });
  const skins = [skin, palmM, knM, nailM, lunM];
  const mk = (geo, mat, par, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; par.add(m); return m; };
  const G = (par, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const root = new THREE.Group();
  // forearm + sleeve cuff; wrist
  const fore = G(root); { const pr = [[0.0, 0.012], [0.029, 0.01], [0.03, -0.005], [0.031, -0.03], [0.034, -0.07], [0.039, -0.12], [0.044, -0.19], [0.047, -0.27], [0.046, -0.32]];
    mk(new THREE.LatheGeometry(pr.slice().reverse().map(([r, y]) => new THREE.Vector2(r, y)), 32).scale(1.3, 1, 0.78), skin, fore, 0, 0, 0);
    // the wrist: the ulna bump on the outer side, the tendons' soft ridge on the inner side, a faint flexor crease
    mk(new THREE.SphereGeometry(0.009, 14, 10).scale(1, 1.3, 0.8), skin, fore, side * 0.036, -0.022, 0.006); }
  const wrist = G(fore, 0, 0, 0);
  // palm: a rounded slab (lathe profile scaled flat), slightly cupped; thenar (thumb) and hypothenar pads on the palm side
  const palm = G(wrist, 0, 0.0, 0);
  const pg = roundedBox(0.076, 0.088, 0.028, 0.0135); { const p = pg.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); p.setX(i, x * (0.86 + 0.14 * (y + 0.046) / 0.092)); p.setZ(i, p.getZ(i) - 0.004 * (1 - (x / 0.04) ** 2) * (p.getZ(i) < 0 ? -1 : 0)); p.setY(i, y + 0.046); } pg.computeVertexNormals(); }
  const palmMesh = mk(pg, skin, palm);
  mk(new THREE.SphereGeometry(0.022, 20, 14).scale(1, 1.5, 0.42), skin, palm, side * -0.02, 0.028, -0.005);   // thenar
  mk(new THREE.SphereGeometry(0.017, 20, 14).scale(1, 1.8, 0.4), skin, palm, side * 0.024, 0.034, -0.005);    // hypothenar
  // back-of-hand tendons
  const tend = []; for (let k = 0; k < 0; k++) tend.push(mk(new THREE.CylinderGeometry(0.0022, 0.0028, 0.06, 8).translate(0, 0.03, 0), skin, palm, side * (-0.024 + k * 0.016), 0.03, 0.0138));
  // fingers: [x offset at the knuckle, lengths of the 3 phalanges, radius]
  const FD = [[-0.027, [0.046, 0.028, 0.022], 0.0118], [-0.009, [0.051, 0.032, 0.024], 0.0122], [0.009, [0.048, 0.030, 0.023], 0.0116], [0.026, [0.038, 0.023, 0.02], 0.0104]];
  const fingers = FD.map(([fx, L, r], fi) => { const base = G(palm, side * fx, 0.082 - Math.abs(fx) * 0.22, 0.0); const segs = []; let par = base, rad = r;
    for (let s = 0; s < 3; s++) { const j = G(par, 0, s ? L[s - 1] : 0, 0); j.userData.r = rad;
      
      
      if (s > 0) { const kp = mk(new THREE.PlaneGeometry(rad * 1.5, rad * 1.3), new THREE.MeshStandardMaterial({ map: knMap, transparent: true, opacity: 0.25, color: o.skin || SKIN_HAND, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), j, 0, 0, rad * 0.96); kp.castShadow = false; }
      segs.push(j); par = j; rad *= 0.92; }
    const tip = segs[2], nl = L[2];
    const nail = mk(new THREE.SphereGeometry(rad * 0.95, 16, 10, 0, TAU, 0, Math.PI * 0.35).rotateX(Math.PI / 2).scale(1.0, 1.2, 0.28), nailM, tip, 0, nl * 0.16, rad * 0.58); nail.rotation.x = -0.12;
    mk(new THREE.SphereGeometry(rad * 0.4, 10, 8, 0, TAU, 0, Math.PI * 0.4).rotateX(-Math.PI / 2).scale(1, 0.6, 0.4), lunM, tip, 0, nl * 0.0, rad * 0.6);
    const tipG = G(tip, 0, nl, 0); tipG.userData.r = rad * 0.92; return { base, segs, L, tipG, tube: fingerTube(palm, skin) }; });
  // thumb: a saddle joint low on the palm, 3 segments (metacarpal, proximal, distal)
  const tbase = G(palm, side * -0.033, 0.02, -0.006); tbase.rotation.set(0.1, side * -0.5, side * 0.65);
  const TL = [0.038, 0.032, 0.026], thumb = []; { let par = tbase, rad = 0.0145; for (let s = 0; s < 3; s++) { const j = G(par, 0, s ? TL[s - 1] : 0, 0); j.userData.r = rad; thumb.push(j); par = j; rad *= 0.9; }
    mk(new THREE.SphereGeometry(rad, 16, 10, 0, TAU, 0, Math.PI * 0.35).rotateX(Math.PI / 2).scale(1.0, 1.2, 0.28), nailM, thumb[2], 0, TL[2] * 0.22, rad * 0.58); }
  const thumbTip = G(thumb[2], 0, TL[2], 0); thumbTip.userData.r = 0.0085; const thumbTube = fingerTube(palm, skin);
  // the inner skeleton (bones) and vessels: thin capsules along each segment; fade in when the protons go
  const bones = []; const addBone = (par, L, r) => bones.push(mk(new THREE.CapsuleGeometry(r, L * 0.75, 4, 8).translate(0, L / 2, 0), boneM, par));
  fingers.forEach((F) => F.segs.forEach((j, s) => addBone(j, F.L[s], 0.0042))); thumb.forEach((j, s) => addBone(j, TL[s], 0.0048));
  for (let k = 0; k < 4; k++) { const b = mk(new THREE.CapsuleGeometry(0.0045, 0.055, 4, 8), boneM, palm, side * (-0.026 + k * 0.017), 0.06, 0.0); b.rotation.z = side * (k - 1.5) * 0.06; bones.push(b); }
  mk(new THREE.CapsuleGeometry(0.008, 0.2, 4, 8).translate(0, -0.12, 0), boneM, fore, side * 0.012, 0, 0); mk(new THREE.CapsuleGeometry(0.007, 0.2, 4, 8).translate(0, -0.12, 0), boneM, fore, side * -0.014, 0, 0);
  const vessels = []; { const R = RNG('vess' + side); for (let k = 0; k < 6; k++) { const pts = []; let x = side * R.r(-0.03, 0.03), y = -0.2; for (let s = 0; s < 8; s++) { pts.push(new THREE.Vector3(x, y, R.r(0.004, 0.012))); x += R.n(0.006); y += 0.035; } const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0022, 6), vesselM); fore.add(tb); vessels.push(tb); } }
  root.traverse((m) => { if (m.isMesh) m.receiveShadow = false; });
  return { thumbTip, thumbTube, root, fore, wrist, palm, fingers, thumb, side, skins, boneM, vesselM, bones, vessels, sleeveM };
}
// a finger as one smooth tapered tube through its joints (rebuilt in place each frame): no seams between phalanges
const TUBE_N = 40, TUBE_R = 16;
function fingerTube(par, mat) { const g = new THREE.BufferGeometry(), pos = new Float32Array((TUBE_N * TUBE_R + 1) * 3), idx = [];
  for (let i = 0; i < TUBE_N - 1; i++) for (let j = 0; j < TUBE_R; j++) { const a = i * TUBE_R + j, b = i * TUBE_R + (j + 1) % TUBE_R, c = a + TUBE_R, d = b + TUBE_R; idx.push(a, c, b, b, c, d); }
  const tip = TUBE_N * TUBE_R; for (let j = 0; j < TUBE_R; j++) idx.push((TUBE_N - 1) * TUBE_R + j, (TUBE_N - 1) * TUBE_R + (j + 1) % TUBE_R, tip);
  g.setIndex(idx); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; par.add(m); return m; }
const _w = new THREE.Vector3();
function updateTube(tube, joints, par) { // joints: groups (with userData.r) from the base to the tip
  const P = joints.map((j) => { j.getWorldPosition(_w); return par.worldToLocal(_w.clone()); }), Rr = joints.map((j) => j.userData.r);
  const curve = new THREE.CatmullRomCurve3(P, false, 'centripetal'), pos = tube.geometry.attributes.position.array;
  let prevN = null; for (let i = 0; i < TUBE_N; i++) { const u = i / (TUBE_N - 1), c = curve.getPointAt(u), tg = curve.getTangentAt(u).normalize();
    const segF = u * (P.length - 1), k = Math.min(P.length - 2, Math.floor(segF)), f = segF - k; let r = lerp(Rr[k], Rr[k + 1], f);
    r *= 1 + 0.06 * Math.sin(f * Math.PI) - 0.05 * Math.pow(Math.cos(f * Math.PI), 8) * (k > 0 ? 1 : 0);          // swell mid-phalanx, slim at the creases
    if (u > 0.86) r *= Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.86) / 0.14, 2) * 0.96));                              // round the fingertip
    let n = prevN ? prevN.clone().sub(tg.clone().multiplyScalar(prevN.dot(tg))).normalize() : new THREE.Vector3(1, 0, 0).sub(tg.clone().multiplyScalar(tg.x)).normalize(); prevN = n; const b = new THREE.Vector3().crossVectors(tg, n);
    for (let j = 0; j < TUBE_R; j++) { const a = j / TUBE_R * TAU, ca = Math.cos(a), sa = Math.sin(a), rr = r * (1 - 0.1 * Math.max(0, sa)) ; const o = (i * TUBE_R + j) * 3; pos[o] = c.x + (n.x * ca + b.x * sa * 0.88) * rr; pos[o + 1] = c.y + (n.y * ca + b.y * sa * 0.88) * rr; pos[o + 2] = c.z + (n.z * ca + b.z * sa * 0.88) * rr; } }
  const e = curve.getPointAt(1), te = curve.getTangentAt(1).normalize(), o = TUBE_N * TUBE_R * 3; pos[o] = e.x + te.x * Rr[Rr.length - 1] * 0.0; pos[o + 1] = e.y + te.y * Rr[Rr.length - 1] * 0.0; pos[o + 2] = e.z + te.z * Rr[Rr.length - 1] * 0.0;
  tube.geometry.attributes.position.needsUpdate = true; tube.geometry.computeVertexNormals(); }
// pose a hand. q: { curl: [i, m, r, p] 0..1 (or one number), spread 0..1, thumb 0..1 (fold), wristPitch, wristYaw, wristRoll, tremble }
function poseHand(H, q) {
  const c = Array.isArray(q.curl) ? q.curl : [q.curl || 0, q.curl || 0, q.curl || 0, q.curl || 0], sp = q.spread ?? 0.3, tr = q.tremble || 0;
  H.fingers.forEach((F, i) => { const k = c[i] + tr * 0.06 * Math.sin(TT * (17 + i * 3) + i * 1.7 + H.side); F.base.rotation.set(-k * 1.35, 0, H.side * (i - 1.5) * 0.11 * sp);
    F.segs[1].rotation.x = -k * 1.55; F.segs[2].rotation.x = -k * 1.15; });
  const tf = q.thumb || 0; H.thumb[0].rotation.x = -0.15 - 0.4 * tf; H.thumb[1].rotation.x = -0.6 * tf - 0.1; H.thumb[2].rotation.x = -0.7 * tf - 0.15;
  H.wrist.rotation.set(q.wristPitch || 0, q.wristYaw || 0, q.wristRoll || 0);
  H.root.updateMatrixWorld(true); H.fingers.forEach((F) => { const b0 = F.base; b0.userData.r = F.segs[0].userData.r * 1.05; updateTube(F.tube, [b0, ...F.segs.slice(1), F.tipG], H.palm); });
  updateTube(H.thumbTube, [H.thumb[0], H.thumb[1], H.thumb[2], H.thumbTip], H.palm);
}
// the protons-gone look: glassy skin, glowing bones and vessels, a pale rim; crack = 0..1 (voronoi cracks in the skin, see shots)
function handsGlass(H, k) { H.skins.forEach((m) => { m.transparent = k > 0.001; m.opacity = 1 - 0.55 * k; m.depthWrite = k < 0.5; }); H.boneM.opacity = 0.9 * k; H.boneM.emissiveIntensity = 0; H.boneM.color.set('#0c0a10'); // dark here = glowing white once the frame is inverted
  H.vesselM.opacity = 0.8 * k; H.vesselM.emissiveIntensity = 1.4 * k; }
