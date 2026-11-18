// =====================================================================
//  BEINGS — uncanny time (stop-motion holds, head jerks) from teke-teke; the Thing (SCP-087-1: a mouthless pale face,
//  empty sockets, a thin dark body); the janitor (person rig); the flashlight and mop; the flickering stairwell bulbs.
// =====================================================================

// ---------------- uncanny time: her pose holds 2–4 frames, then snaps ----------------
const STUT = (() => { const b = [0]; let f = 0, k = 0; while (f < 1900) { f += 2 + Math.floor(hsh(k++, 41) * 3); b.push(f); } return b; })();
function stutT(t) { const f = Math.floor(t * 24 + 1e-6); let lo = 0, hi = STUT.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (STUT[m] <= f) lo = m; else hi = m; } return STUT[lo] / 24; }
// twitchy head: random targets held for 0.25–1.1 s, snapped to in ~2 frames with an overshoot; sometimes over-rotated
function jerk(t, seed = 0, amp = 1) {
  const tg = (k) => k === 0 ? { r: 0, y: 0, p: 0, s: 0 } : { r: (hsh(k, 52 + seed) - 0.5) * 1.1 + (hsh(k, 53 + seed) > 0.78 ? Math.sign(hsh(k, 57 + seed) - 0.5) * 0.7 : 0), y: (hsh(k, 54 + seed) - 0.5) * 0.7, p: (hsh(k, 55 + seed) - 0.5) * 0.5, s: (hsh(k, 56 + seed) - 0.5) * 0.06 };
  let t0 = 0, k = 0; for (;;) { const d = 0.25 + 0.85 * hsh(k * 7 + seed, 51); if (t0 + d > t) break; t0 += d; k++; }
  const a = tg(Math.max(0, k - 1)), b = tg(k), u = clamp((t - t0) / 0.08), v = k === 0 ? 1 : u < 1 ? 1 + 0.25 * Math.sin(Math.PI * u) * (1 - u) - (1 - u) ** 3 : 1;
  const L = (x, y) => (x + (y - x) * v) * amp; return { roll: L(a.r, b.r), yaw: L(a.y, b.y), pitch: L(a.p, b.p), side: L(a.s, b.s) };
}
// the crawl: cycles of reach (one arm, then the other) → a beat of stillness → the body drags after its hands
const CYC = { slow: { r: 0.3, h: 0.3, d: 0.5, D: 0.5 }, med: { r: 0.16, h: 0.16, d: 0.3, D: 0.7 }, burst: { r: 0.055, h: 0.05, d: 0.12, D: 0.95 } };
function mkCrawl(t0, s0, types, R = 0.98) { const C = []; let t = t0, s = s0; types.forEach((ty) => { const c = CYC[ty]; C.push(Object.assign({ t, s, ty }, c)); t += 2 * c.r + c.h + c.d; s += c.D; }); return { C, R, t1: t, s1: s }; }
function crawlAt(K, t) {
  const C = K.C, R = K.R; let i = 0; while (i < C.length - 1 && t >= C[i + 1].t) i++; const c = C[i], u = t - c.t;
  const prev = i === 0 ? c.s + R * 0.5 : C[i - 1].s + R, nw = c.s + R;
  const hands = [0, 1].map((j) => { const k = u < 0 ? 0 : clamp((u - j * c.r) / c.r), ke = c.ty === 'slow' ? ss(0, 1, k) : easeOut(k); return { s: lerp(prev, nw, ke), lift: k > 0 && k < 1 ? Math.sin(Math.PI * ke) : 0 }; });
  const dk = u < 0 ? 0 : clamp((u - 2 * c.r - c.h) / c.d), s = c.s + c.D * (c.ty === 'slow' ? ss(0, 1, dk) : easeOut(dk));
  return { s, hands, drag: dk > 0 && dk < 1, c };
}

// ---------------- THE THING (SCP-087-1): a pale stretched face with no mouth, empty sockets, a thin dark body ----------------
function texThingFace() { return txCanvas('thing2', 512, 256, (x, w, h, R) => {
  // grey-yellow waxy skin: mottling, pores, temple veins, sunken wet sockets, and the mouth sealed over with puckered scar folds
  x.fillStyle = '#9c9474'; x.fillRect(0, 0, w, h); const fx = w / 2;
  for (let i = 0; i < 140; i++) { x.fillStyle = R.pick(['rgba(120,110,80,0.22)', 'rgba(170,160,124,0.18)', 'rgba(96,100,92,0.2)', 'rgba(140,110,90,0.16)', 'rgba(80,84,70,0.18)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 22), R); x.fill(); }
  const rg = (cx, cy, rx, ry, c0, c1 = 'rgba(0,0,0,0)') => { x.save(); x.translate(cx, cy); x.scale(1, ry / rx); const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, TAU); x.fill(); x.restore(); };
  rg(fx - 30, 116, 42, 40, 'rgba(30,26,20,0.9)'); rg(fx + 31, 106, 36, 30, 'rgba(30,26,20,0.85)');   // sunken sockets, uneven
  rg(fx - 30, 116, 22, 20, 'rgba(60,20,18,0.6)'); rg(fx + 31, 106, 19, 16, 'rgba(60,20,18,0.55)');   // raw wet rims
  for (let i = 0; i < 22; i++) { const sd = i % 2 ? 1 : -1, cx = fx + (sd < 0 ? -30 : 31), cy = sd < 0 ? 116 : 106, a = R.r(0, TAU), rr = R.r(14, 20); x.fillStyle = 'rgba(220,214,190,0.55)'; x.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9, R.r(1, 3), 1); }   // wet glints on the rims
  rg(fx - 48, 166, 34, 46, 'rgba(40,40,30,0.8)'); rg(fx + 44, 160, 26, 38, 'rgba(50,50,38,0.55)');   // one cheek far more sunken
  const vein = (px, py, n, sx, sy) => { x.strokeStyle = 'rgba(56,64,92,0.55)'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < n; k++) { px += sx + R.n(5); py += sy + R.n(5); x.lineTo(px, py); } x.stroke(); };
  for (let i = 0; i < 9; i++) { vein(fx - 78 + R.n(6), R.r(70, 110), 6, -R.r(1, 4), R.n(4)); vein(fx + 80 + R.n(6), R.r(70, 110), 6, R.r(1, 4), R.n(4)); }   // temples
  for (let i = 0; i < 12; i++) vein(fx + R.pick([-30, 31]) + R.n(18), R.r(96, 132), 4, R.n(6), R.n(6));   // round the sockets
  x.strokeStyle = 'rgba(30,28,22,0.7)'; x.lineWidth = 2; x.beginPath(); x.moveTo(fx - 34, 132); x.lineTo(fx - 38, 152); x.lineTo(fx - 33, 172); x.stroke();   // a crack
  x.strokeStyle = 'rgba(70,64,50,0.6)'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(fx - 1, 116); x.lineTo(fx - 3, 146); x.stroke(); x.fillStyle = 'rgba(30,26,20,0.75)'; x.fillRect(fx - 8, 148, 3, 2); x.fillRect(fx + 3, 148, 3, 2);
  // the sealed mouth: a ragged seam with radial pucker folds and darker stretched skin
  rg(fx, 180, 52, 18, 'rgba(110,90,70,0.55)'); x.strokeStyle = 'rgba(40,30,24,0.85)'; x.lineWidth = 2; x.beginPath(); x.moveTo(fx - 34, 180); for (let k = -34; k <= 34; k += 4) x.lineTo(fx + k, 180 + R.n(1.6) + 0.002 * k * k); x.stroke();
  for (let i = 0; i < 46; i++) { const u = R.r(-1, 1), sx = fx + u * 34, sy = 180 + 0.002 * (u * 34) ** 2, sd = R.f() < 0.5 ? -1 : 1, len = R.r(5, 16) * (1.1 - Math.abs(u) * 0.5); x.strokeStyle = R.pick(['rgba(50,40,30,0.6)', 'rgba(70,58,44,0.5)']); x.lineWidth = R.r(0.7, 1.5); x.beginPath(); x.moveTo(sx, sy + sd * 2); x.lineTo(sx + R.n(3) + u * 4, sy + sd * len); x.stroke();
    x.strokeStyle = 'rgba(200,190,160,0.35)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(sx + 1.5, sy + sd * 3); x.lineTo(sx + 1.5 + u * 4, sy + sd * len * 0.8); x.stroke(); }   // folds: a dark crease with a pale ridge beside it
  [-1, 1].forEach((sd) => { for (let k = 0; k < 4; k++) { x.strokeStyle = 'rgba(56,48,36,0.55)'; x.lineWidth = 1; x.beginPath(); x.moveTo(fx + sd * 38, 176 + k * 3); x.quadraticCurveTo(fx + sd * 50, 182 + k * 4, fx + sd * 60, 172 + k * 6); x.stroke(); } });   // stretched corners
  for (let i = 0; i < 9000; i++) { x.fillStyle = R.pick(['rgba(60,56,40,0.35)', 'rgba(200,192,160,0.22)', 'rgba(90,80,60,0.3)']); x.fillRect(R.r(0, w), R.r(0, h), 1, 1); }   // pores
  x.fillStyle = 'rgba(20,20,16,0.5)'; x.fillRect(0, 0, w * 0.24, h); x.fillRect(w * 0.76, 0, w * 0.24, h);
}, [1, 1]); }
const TH = { legL: 1.0, torso: 0.62, neck: 0.3, shW: 0.14, uArm: 0.44, fArm: 0.44, headR: 0.12 };
function mkThing(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const body = SM({ color: '#24262a', roughness: 0.9 }), pale = SM({ color: '#8c8468', roughness: 0.9 }), T = { g };
  const H = new THREE.Group(); g.add(H); T.head = H; const r = TH.headR, SC = V3(0.98, 1.5, 0.84);
  // the skull: the sphere baked into head space, then pushed: one cheek caved in, the jaw skewed, the temples pinched
  const geo = new THREE.SphereGeometry(r, 36, 26); geo.scale(SC.x, SC.y, SC.z); geo.rotateY(-Math.PI / 2);
  { const P = geo.attributes.position; for (let i = 0; i < P.count; i++) { let px = P.getX(i), py = P.getY(i), pz = P.getZ(i); const fr = Math.max(0, pz / (r * 0.84));
    { const lo = Math.max(0, -py / (r * 1.5)), nz = 1 + 0.07 * (fbm2(px * 30 + 3, py * 30 + pz * 20) - 0.5); px *= (1 - 0.22 * lo * lo) * nz; pz *= (1 - 0.1 * lo) * nz; py *= 1 + 0.03 * (fbm2(px * 25, pz * 25) - 0.5); }   // a narrow jaw under a wide cranium, a lumpy uneven outline
    px += 0.016 * Math.max(0, -py / (r * 1.5)) ** 1.3;   // jaw skew
    const ck = Math.exp(-(((px + 0.045) / 0.035) ** 2 + ((py + 0.03) / 0.05) ** 2)) * fr; pz -= 0.016 * ck; px += 0.006 * ck;   // the caved cheek (its left)
    const ck2 = Math.exp(-(((px - 0.045) / 0.035) ** 2 + ((py + 0.03) / 0.05) ** 2)) * fr; pz -= 0.006 * ck2;
    const tp = Math.exp(-(((py - 0.05) / 0.05) ** 2)) * (1 - fr) * 0.6; px *= 1 - 0.08 * tp;
    const br = Math.exp(-(((py - 0.042) / 0.016) ** 2)) * fr * (Math.abs(px) < 0.07 ? 1 : 0.3); pz += 0.008 * br;   // a brow ledge over the sockets
    P.setXYZ(i, px, py, pz); } geo.computeVertexNormals(); }
  const skinM = SM({ map: texThingFace(), color: '#ffffff', roughness: 0.95 }), sk = shd(new THREE.Mesh(geo, skinM)); H.add(sk); T.skull = sk;
  const onSk = (px, py, rr) => { const u = 0.5 - px / 512, phi = u * TAU, th = Math.PI * py / 256; return V3(-Math.cos(phi) * Math.sin(th) * rr, Math.cos(th) * rr, Math.sin(phi) * Math.sin(th) * rr).multiply(SC).applyAxisAngle(V3(0, 1, 0), -Math.PI / 2); };
  const blk = SM({ color: '#010101', roughness: 1 }), wet = SM({ color: '#2a0e0c', roughness: 0.15 });
  T.sockets = [[-30, 116, 0.026, 0.032, 0.35], [31, 106, 0.021, 0.024, -0.2]].map(([px, py, a, b, rz]) => { const q = onSk(px, py, r * 0.86), s = sph(1, blk, 1, 1, 1, 14); s.position.copy(q); s.lookAt(V3(0, 0, 0)); s.rotateZ(rz); s.scale.set(a, b, 0.03); H.add(s); s.castShadow = false;
    const rim = sph(1, wet, 1, 1, 1, 14); rim.position.copy(onSk(px, py, r * 0.84)); rim.lookAt(V3(0, 0, 0)); rim.rotateZ(rz); rim.scale.set(a * 1.22, b * 1.2, 0.024); rim.castShadow = false; H.add(rim); return s; });
  T.glint = sph(0.004, BM('#ff2a14', { fog: false }), 1, 1, 1, 6); T.glint.position.copy(onSk(31, 108, r * 0.8)); H.add(T.glint);
  { const sk2 = SM({ color: '#8a8264', roughness: 0.95 }); [[-1, 0.012, 0.16], [1, 0.0, 0.2]].forEach(([sd, dy, s2]) => { const c = sph(r * s2, sk2, 0.7, 0.6, 0.8, 10); c.position.set(sd * r * 0.6, r * dy, r * 0.42); H.add(c); }); }   // cheekbones (hard shadows under them)
  // thin lank hair: sparse strands from the crown and sides, hanging with gravity (posed in poseThing)
  { const hm = SM({ color: '#2a2820', roughness: 0.8 }), R = RNG('thhair'); T.hair = [...Array(16)].map((_, i) => { const az = (i % 2 ? 1 : -1) * R.r(1.25, 2.9), el = R.r(0.1, 1.0); return { root: V3(Math.sin(az) * Math.cos(el) * r * 0.95, r * (0.55 + Math.sin(el) * 0.8), Math.cos(az) * Math.cos(el) * r * 0.82 - r * 0.15), L: R.r(0.12, 0.3), segs: [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(UCYL1, hm); m.castShadow = true; g.add(m); return m; }), sw: R.r(0, TAU) }; }); }
  T.neck = shd(new THREE.Mesh(UCYL, pale)); g.add(T.neck); T.neck2 = shd(new THREE.Mesh(UCYL, body)); g.add(T.neck2);
  T.torso = capsule(0.085, TH.torso - 0.12, body, 10); g.add(T.torso); T.ribs = [...Array(5)].map(() => { const m = sph(1, body, 1, 1, 1, 8); g.add(m); return m; });
  T.pelvis = sph(0.08, body, 1.1, 0.7, 0.75); g.add(T.pelvis);
  T.arms = [0, 1].map(() => ({ up: shd(new THREE.Mesh(UCYL, body)), fo: shd(new THREE.Mesh(UCYL, body)), sj: sph(0.03, body), ej: sph(0.024, body), palm: sph(1, pale, 1, 1, 1, 8), f: [...Array(5)].map(() => [0, 1, 2].map(() => shd(new THREE.Mesh(UCYL1, pale)))), k: [...Array(15)].map(() => sph(1, pale, 1, 1, 1, 6)), nl: [...Array(5)].map(() => sph(1, SM({ color: '#2a2418' }), 1, 1, 1, 6)) }));
  T.arms.forEach((A) => { [A.up, A.fo, A.sj, A.ej, A.palm, ...A.k, ...A.nl].forEach((m) => g.add(m)); A.f.forEach((F) => F.forEach((m) => g.add(m))); });
  T.legs = [0, 1].map(() => ({ th: shd(new THREE.Mesh(UCYL, body)), sh: shd(new THREE.Mesh(UCYL, body)), ft: sph(1, body, 1, 1, 1, 8) })); T.legs.forEach((L) => [L.th, L.sh, L.ft].forEach((m) => g.add(m)));
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); g.visible = false; return T;
}
// o: { base (feet centre on the floor), F (facing, horizontal), look (world point it stares at), roll, lean (0..1 over the rail), hands?: [W, W], t (its time), glint }
function poseThing(Wd, o) {
  const T = Wd.thing; T.g.visible = true; const F = o.F.clone().setY(0).normalize(), X = UPV.clone().cross(F).normalize(), tt = o.t ?? TT, lean = o.lean ?? 0;
  const pel = o.base.clone().add(V3(0, TH.legL, 0)).addScaledVector(F, -0.06 * lean); const U = UPV.clone().addScaledVector(F, 0.55 * lean).normalize(), chest = pel.clone().addScaledVector(U, TH.torso);
  T.pelvis.position.copy(pel); T.pelvis.quaternion.copy(qBasis(X, U, U.clone().cross(X)));
  between(T.torso, pel, chest, 1, 1); T.torso.scale.set(1, 1, 0.62); T.torso.position.copy(pel.clone().lerp(chest, 0.5));
  T.ribs.forEach((m, i) => { m.position.copy(pel.clone().lerp(chest, 0.45 + i * 0.1)).addScaledVector(U.clone().cross(X), 0.05); m.scale.set(0.09 - i * 0.004, 0.014, 0.03); m.quaternion.copy(T.pelvis.quaternion); });
  const nb = chest.clone().addScaledVector(U, -0.02), look = (o.look.clone().sub(nb)).normalize(), nd = U.clone().lerp(look, 0.55 + 0.25 * lean).normalize(), hc = nb.clone().addScaledVector(nd, TH.neck + TH.headR * 0.9);
  const Z = look.clone(), Yh = UPV.clone().addScaledVector(Z, -UPV.dot(Z)).normalize(); const f = frameOf(Yh.lengthSq() > 0.01 ? Yh : F.clone().negate(), Z); let hq = qBasis(f.X, f.Y, f.Z); if (o.roll) hq = hq.multiply(new THREE.Quaternion().setFromAxisAngle(V3(0, 0, 1), o.roll));
  T.head.position.copy(hc); T.head.quaternion.copy(hq); T.head.updateMatrixWorld(true); { const nt = T.head.localToWorld(V3(0.004, -TH.headR * 1.15, -0.03)), nm = nb.clone().lerp(nt, 0.45); between(T.neck, nm, nt, 0.036); between(T.neck2, nb, nm, 0.03, 0.03); }   // the neck: pale where the light is, going dark into the body
  T.hair.forEach((hh, j) => { let p = T.head.localToWorld(hh.root.clone()); const out = p.clone().sub(T.head.position).normalize(); let d = out.clone().multiplyScalar(0.8).add(V3(0, -0.4, 0)).normalize(); const sg = hh.L / 4;
    hh.segs.forEach((m, k) => { d = d.lerp(V3(0, -1, 0), 0.45).normalize(); let q = p.clone().addScaledVector(d, sg).add(V3(0.004 * Math.sin(tt * 0.7 + hh.sw + k), 0, 0)); const lq = T.head.worldToLocal(q.clone()), e = (lq.x / (TH.headR * 1.02)) ** 2 + (lq.y / (TH.headR * 1.55)) ** 2 + (lq.z / (TH.headR * 1.0)) ** 2; if (e < 1) { lq.multiplyScalar(1.02 / Math.sqrt(e)); q = T.head.localToWorld(lq); } between(m, p, q, 0.003 - k * 0.0004); p = q; }); });
  T.glint.material.color.set((o.glint ?? 1) > 0.5 ? '#ff2a14' : '#3a0a06');
  T.arms.forEach((A, i) => { const sd = i ? -1 : 1, S = chest.clone().addScaledVector(X, sd * TH.shW).addScaledVector(U, -0.04), W = o.hands ? o.hands[i].clone() : S.clone().add(V3(0, -0.8, 0)).addScaledVector(F, 0.12 + 0.3 * lean).addScaledVector(X, sd * 0.05);
    const dd = W.clone().sub(S); if (dd.length() > TH.uArm + TH.fArm - 0.01) W.copy(S).addScaledVector(dd.normalize(), TH.uArm + TH.fArm - 0.01);
    const { E } = twoBone(S, W, TH.uArm, TH.fArm, F.clone().multiplyScalar(-1).addScaledVector(X, sd * 0.6)); between(A.up, S, E, 0.022); between(A.fo, E, W, 0.017); A.sj.position.copy(S); A.ej.position.copy(E);
    const hz = W.clone().sub(E).normalize(), hy = F.clone().addScaledVector(hz, -F.dot(hz)).normalize(), hx = hy.clone().cross(hz); A.palm.position.copy(W).addScaledVector(hz, 0.035); A.palm.quaternion.copy(qBasis(hx, hy, hz)); A.palm.scale.set(0.028, 0.009, 0.045);
    A.f.forEach((Fs, k) => { const th = k === 4; let p = th ? W.clone().addScaledVector(hz, 0.03).addScaledVector(hx, sd * 0.03) : W.clone().addScaledVector(hz, 0.075).addScaledVector(hx, (k - 1.5) * 0.016), d = th ? hz.clone().addScaledVector(hx, sd * 0.6).normalize() : hz.clone(); const tw = 0.25 + 0.3 * Math.max(0, Math.sin(tt * (3 + k * 1.7) + k * 2 + i)) ** 3 + (o.curl ?? 0);
      Fs.forEach((m, j) => { d = d.clone().applyAxisAngle(hx, tw * (j ? 0.7 : 0.35)); const q2 = p.clone().addScaledVector(d, (th ? [0.04, 0.035, 0.03] : [0.075, 0.06, 0.05])[j]); between(m, p, q2, 0.0075 - j * 0.0012); A.k[k * 3 + j].position.copy(p); A.k[k * 3 + j].scale.setScalar(0.0088 - j * 0.0012); p = q2; }); A.nl[k].position.copy(p).addScaledVector(d, -0.008).addScaledVector(hy, 0.004); A.nl[k].scale.set(0.006, 0.003, 0.008); A.nl[k].quaternion.copy(qBasis(hx, hy, hz)); }); });
  T.legs.forEach((L, i) => { const sd = i ? -1 : 1, Hj = pel.clone().addScaledVector(X, sd * 0.07), A = o.base.clone().addScaledVector(X, sd * 0.1).add(V3(0, 0.05, 0)); const { E } = twoBone(Hj, A, 0.5, 0.5, F); between(L.th, Hj, E, 0.032); between(L.sh, E, A, 0.024); L.ft.position.copy(A).addScaledVector(F, 0.05).add(V3(0, -0.03, 0)); L.ft.scale.set(0.035, 0.022, 0.09); L.ft.quaternion.copy(qBasis(X, UPV, F)); });
  T.g.updateMatrixWorld(true); return T;
}

// ---------------- props: the flashlight (held in the fist, beam along the hand's X) and the mop ----------------
function mkTorch(Wd) { const g = new THREE.Group(); Wd.scene.add(g); const blk = SM({ color: '#1c1e20', roughness: 0.4 }), ylw = SM({ color: '#8a7a3a', roughness: 0.4 });
  const b = cyl(0.017, 0.017, 0.2, blk, 10); b.rotation.z = -Math.PI / 2; b.position.x = 0.01; g.add(b); const hd = cyl(0.028, 0.02, 0.05, ylw, 12); hd.rotation.z = -Math.PI / 2; hd.position.x = 0.13; g.add(hd);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.024, 12), BM('#fff4d8', { fog: false })); lens.rotation.y = Math.PI / 2; lens.position.x = 0.156; g.add(lens); g.userData.lens = lens; const sw = bx(0.02, 0.01, 0.012, SM({ color: '#6a2a1a' }), 0.04, 0.018, 0, g); void sw;
  g.traverse((m) => { if (m.isMesh) { m.frustumCulled = false; m.castShadow = true; } }); g.visible = false; return g; }
function mkMop(Wd) { const g = new THREE.Group(); Wd.scene.add(g); const h = cyl(0.013, 0.013, 1.35, SM({ color: '#8a8a7a' }), 8); h.position.y = 0.72; g.add(h); const hd = bx(0.32, 0.03, 0.06, SM({ color: '#3a6a5a' }), 0, 0.04, 0, g); void hd;
  const sm = SM({ color: '#b8b4a0' }); for (let i = 0; i < 26; i++) { const s = cyl(0.01, 0.012, 0.16, sm, 4); s.position.set(-0.15 + (i % 13) * 0.025, 0.02, (i < 13 ? -1 : 1) * 0.035); s.rotation.z = Math.PI / 2 + (hsh(i, 3) - 0.5) * 0.6; s.rotation.y = (i < 13 ? 1 : -1) * 0.6; g.add(s); }
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); g.visible = false; return g; }

// ---------------- the stairwell bulbs: most are dead; the live ones stutter. Three point lights go to the live bulbs nearest the shot ----------------
function flick(i, t, bad0 = 0.45) {   // irregular buzz: long good stretches, then bad windows where the filament stutters off and on
  const bad = hsh(Math.floor(t * 0.9) + i * 13, 72) > bad0, h = hsh(Math.floor(t * 15) + i * 101, 71), h2 = hsh(Math.floor(t * 4) + i * 17, 73);
  if (!bad) return h2 > 0.93 ? 0.35 : 1; return h < 0.42 ? 0.04 : h < 0.58 ? 0.45 : 1;
}
function mkLamps(Wd) { Wd.slamps = [0, 1, 2].map(() => { const s = new THREE.PointLight('#ffd890', 0, 4.5, 1.6); Wd.scene.add(s); return s; }); }
function setBulbs(Wd, focus, t, on = 1) {
  const live = Wd.bulbs.filter((b) => b.live).sort((a, b) => a.p.distanceToSquared(focus) - b.p.distanceToSquared(focus));
  Wd.bulbs.forEach((b) => (b.m.material.emissiveIntensity = b.live ? 1.4 * flick(b.n, t) * on : 0));
  Wd.slamps.forEach((s, i) => { const b = live[i]; if (!b) { s.intensity = 0; return; } s.position.copy(b.p).add(V3(0, -0.08, 0)); s.intensity = 0.8 * flick(b.n, t) * on; s.distance = 4; });
}
// ---------------- PEOPLE: the night janitor (adult build, grey-blue work uniform, cap, a tired middle-aged face) ----------------
function texGakuran(key, base) { return txCanvas('gak' + key, 128, 128, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const px = R.r(0, w); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(px, R.r(0, 40), R.r(1, 2.5), R.r(40, 128)); x.fillStyle = 'rgba(120,130,150,0.12)'; x.fillRect(px + 2, R.r(0, 40), 1, R.r(30, 100)); }   // folds
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, R.r(0, h), w, 1); }
  speckle(x, R, w, h, 220, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.15)', 'rgba(220,235,235,0.2)']); }, [2, 2]); }
const PDM = { torso: 0.54, shW: 0.185, hipW: 0.095, uArm: 0.3, fArm: 0.275, thigh: 0.47, shin: 0.45, headR: 0.088, hs: 0.95, fk: 1.0, fr: 0.95, ank: 0.075, gripR: 0.015, legR: [0.058, 0.047, 0.052] };
function mkPerson(o = {}) {
  const pd = Object.assign({}, PDM, o.pd || {}), g = new THREE.Group(), P = { kind: 'man', pd, g };
  const skin = SM({ color: o.skin || '#b0805a', roughness: 0.7 }), nail = SM({ color: '#c09a80' });
  const jac = SM({ map: texGakuran(o.key || 'g', o.jacket || '#1a1d24') }), pants = SM({ map: texGakuran((o.key || 'p') + 'p', o.pants || '#16181d') }), boot = SM({ color: '#14110c' }), hairM = SM({ color: o.hair || '#15181d', roughness: 0.5 }), gold = SM({ color: '#cfae78', roughness: 0.3, emissive: '#3a2810', emissiveIntensity: 0.3 });
  P.mat = { skin, top: jac };
  const T = new THREE.Group(); g.add(T); P.T = T;
  const ch = capsule(0.115, pd.torso - 0.24, jac, 12); ch.scale.set(1.18, 1, 0.74); ch.position.y = pd.torso * 0.56; T.add(ch); P.chest = ch;
  const hem = cyl(0.148, 0.165, 0.2, jac, 14); hem.scale.set(1.04, 1, 0.74); hem.position.y = 0.05; T.add(hem);
  const pel = sph(0.118, pants, 1.08, 0.7, 0.82); T.add(pel);
  const stand = cyl(0.064, 0.07, 0.07, jac, 12); stand.position.y = pd.torso + 0.005; T.add(stand);   // the stand collar
  if (o.old) { bx(0.008, 0.36, 0.006, SM({ color: '#1e2426' }), 0, pd.torso * 0.5, 0.1, T); [-1, 1].forEach((sd) => { const pk = bx(0.07, 0.07, 0.008, jac, sd * 0.065, pd.torso * 0.66, 0.098, T); pk.rotation.y = sd * 0.25; bx(0.074, 0.016, 0.01, jac, sd * 0.065, pd.torso * 0.66 + 0.04, 0.1, T).rotation.y = sd * 0.25; });
    bx(0.05, 0.022, 0.006, SM({ color: '#d8d4c4' }), 0.07, pd.torso * 0.76, 0.1, T).rotation.y = 0.28; const belt = cyl(0.152, 0.152, 0.03, SM({ color: '#1a1612' }), 14); belt.scale.set(1.04, 1, 0.76); belt.position.y = 0.1; T.add(belt); const kc = sph(0.016, SM({ color: '#a89870', roughness: 0.3 }), 1, 1, 0.5, 6); kc.position.set(0.15, 0.06, 0.04); T.add(kc); }   // zip, chest pockets, name tag, belt, key ring
  else for (let i = 0; i < 5; i++) { const b = sph(0.008, gold, 1, 1, 0.6, 6); b.position.set(0, 0.13 + i * 0.07, 0.093); T.add(b); }
  if (o.scarf) { const sc = SM({ map: texCloth((o.key || 's') + 'scarf', o.scarf, { check: o.scarfC }) }); const ring = shd(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.032, 6, 14), sc)); ring.rotation.x = Math.PI / 2; ring.position.y = pd.torso - 0.015; ring.scale.set(1.15, 1, 1); T.add(ring);
    const tp = new THREE.Group(); tp.position.set(0.05, pd.torso - 0.03, 0.1); T.add(tp); const tail = bx(0.065, 0.3, 0.022, sc, 0, -0.15, 0, tp); void tail; P.scarfTail = tp; }
  if (o.bag) { const bm = SM({ map: texBag(o.key, o.bag) }); bx(0.32, 0.26, 0.1, bm, 0, pd.torso * 0.5, -0.155, T); [-1, 1].forEach((sd) => { const s = bx(0.032, 0.36, 0.014, SM({ color: '#14110c' }), sd * 0.075, pd.torso * 0.62, 0.092, T); s.rotation.x = 0.1; }); }
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd; const r = pd.headR;
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), SM({ map: texFacePlain(o.key, o.skin || '#b0805a'), color: '#ffffff', roughness: 0.7 }))); sk.scale.set(0.8, 1.1, 0.9); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
  const jaw = sph(r * 0.62, skin, 0.92, 0.62, 0.9); jaw.position.set(0, -r * 0.66, r * 0.16); Hd.add(jaw); const chin = sph(r * 0.22, skin, 1.1, 0.8, 0.9); chin.position.set(0, -r * 0.98, r * 0.55); Hd.add(chin);
  [-1, 1].forEach((sd) => { const cb = sph(r * 0.2, skin, 1.2, 0.7, 0.8); cb.position.set(sd * r * 0.5, -r * 0.18, r * 0.72); Hd.add(cb); });
  [-1, 1].forEach((sd) => { const ear = sph(0.016, skin, 0.5, 1, 0.8); ear.position.set(sd * r * 0.86, -0.006, -0.004); Hd.add(ear); });
  // hair: a cap with volume clumps and a few strands over the forehead
  if (o.cap) { const cm = SM({ map: texCloth('cap' + o.key, o.cap) }), cp = sph(r * 1.1, cm, 0.93, 0.62, 1.0, 18); cp.position.set(0, r * 0.42, -r * 0.08); Hd.add(cp); const br = cyl(r * 0.62, r * 0.66, 0.008, cm, 16); br.scale.set(1, 1, 0.75); br.position.set(0, r * 0.4, r * 0.86); br.rotation.x = 0.18; Hd.add(br);
    const bnd = cyl(r * 1.0, r * 1.02, 0.03, SM({ color: '#141c24' }), 18); bnd.scale.set(0.93, 1, 1.0); bnd.position.set(0, r * 0.36, -r * 0.08); Hd.add(bnd); const bdg = bx(0.03, 0.02, 0.005, SM({ color: '#b8a878' }), 0, r * 0.62, r * 1.0, Hd); bdg.rotation.x = -0.3;
    const R = RNG('hair' + o.key); for (let i = 0; i < 16; i++) { const a = R.r(1.2, 2.9) * (i % 2 ? 1 : -1), m = sph(r * R.r(0.16, 0.24), hairM, 1, 1.4, 1); m.position.set(Math.sin(a) * r * 0.86, r * R.r(0.0, 0.3), Math.cos(a) * r * 0.86 - r * 0.08); Hd.add(m); } }   // grey hair at the sides and back under the cap
  else { const R = RNG('hair' + o.key); const cap = sph(r * 1.07, hairM, 0.92, 0.82, 1.0); cap.position.set(0, r * 0.32, -r * 0.14); Hd.add(cap);
    for (let i = 0; i < 9; i++) { const a = R.r(-2.4, 2.4), e = R.r(0.25, 1.1), m = sph(r * R.r(0.38, 0.55), hairM, 1, R.r(0.5, 0.8), 1.2); m.position.set(Math.sin(a) * Math.cos(e) * r * 0.92, r * 0.25 + Math.sin(e) * r * 0.75, Math.cos(a) * Math.cos(e) * r * 0.9 - r * 0.2); m.rotation.set(R.n(0.5), a, R.n(0.4)); Hd.add(m); }
    for (let i = 0; i < 14; i++) { const a = R.r(-2.6, 2.6), m = shd(new THREE.Mesh(new THREE.ConeGeometry(r * R.r(0.07, 0.12), r * R.r(0.5, 0.9), 4), hairM)); m.position.set(Math.sin(a) * r * 0.86, r * 0.18, Math.cos(a) * r * 0.82 - r * 0.12); m.rotation.set(Math.PI + Math.cos(a) * 0.3 + R.n(0.2), 0, -Math.sin(a) * 0.3 + R.n(0.2)); if (Math.abs(a) > 0.9) Hd.add(m); }   // side strands
    for (let i = 0; i < 9; i++) { const x0 = (i - 4) * r * 0.17 + R.n(r * 0.05), m = shd(new THREE.Mesh(new THREE.ConeGeometry(r * R.r(0.07, 0.12), r * R.r(0.45, 0.85), 4), hairM)); m.position.set(x0, r * 0.62, r * 0.78); m.rotation.set(Math.PI - 0.35 + R.n(0.15), 0, R.n(0.35) - x0 * 2); Hd.add(m); } }
  // the face: almond eyes (whites, irises, upper lids), brows, a nose, lips; a mouth that drops open in fear
  { const sM = SM({ color: o.skin || '#b0805a', roughness: 0.7 }), wM = SM({ color: '#d4d0c2', roughness: 0.4 }), iM = SM({ color: '#1a120c' }), bM = SM({ color: o.hair || '#15181d' }), mM = SM({ color: '#140606' }), tM = SM({ color: '#d0c8b0' }), lM = SM({ color: '#8a5a4a' }), F = { eyes: [], irises: [], lids: [], brows: [] };
    [-1, 1].forEach((sd) => { const e = sph(0.0098, wM, 1.15, 0.6, 0.55, 10); e.position.set(sd * 0.028, -0.002, 0.078); Hd.add(e); F.eyes.push(e); const ir = sph(0.0046, iM, 1, 1, 0.45, 8); ir.position.set(sd * 0.028, -0.002, 0.0838); Hd.add(ir); F.irises.push(ir);
      const lid = sph(0.0122, sM, 1.25, 0.6, 0.72, 10); lid.position.set(sd * 0.028, 0.0045, 0.079); Hd.add(lid); F.lids.push(lid); const br = bx(0.028, 0.006, 0.008, bM, sd * 0.029, 0.02, 0.085, Hd); br.rotation.z = sd * 0.08; F.brows.push(br); });
    const no = sph(0.0095, sM, 0.75, 1.6, 1.15, 8); no.position.set(0, -0.019, 0.088); Hd.add(no); const nt = sph(0.006, sM, 1.3, 0.8, 1); nt.position.set(0, -0.032, 0.092); Hd.add(nt);
    const mo = sph(0.016, mM, 1, 0.12, 0.4, 12); mo.position.set(0, -0.05, 0.083); Hd.add(mo); F.mouth = mo; const te = bx(0.02, 0.004, 0.004, tM, 0, -0.046, 0.088, Hd); F.teeth = te; const ll = bx(0.022, 0.004, 0.006, lM, 0, -0.053, 0.086, Hd); F.lip = ll;
    const ul = bx(0.026, 0.004, 0.006, lM, 0, -0.043, 0.088, Hd); F.ulip = ul;
    if (o.old) { const mu = sph(0.02, SM({ color: '#4a4844' }), 1.2, 0.32, 0.5, 10); mu.position.set(0, -0.037, 0.089); Hd.add(mu); }
    P.fface = F; P.setFear = (k) => { F.eyes.forEach((e) => e.scale.set(1.15, 0.6 + 0.42 * k, 0.55)); F.lids.forEach((l) => { l.position.y = 0.0045 + 0.0075 * k; l.scale.set(1.25, 0.6 - 0.32 * k, 0.72); }); F.ulip.position.y = -0.043 + 0.002 * k;
      F.brows.forEach((b, i) => { b.position.y = 0.02 + 0.01 * k; b.rotation.z = (i ? 1 : -1) * (0.08 + 0.45 * k) * -1; b.position.x = (i ? 1 : -1) * (0.029 - 0.006 * k); });
      F.mouth.scale.set(1.05 + 0.2 * k, 0.12 + 0.5 * k, 0.4); F.mouth.position.y = -0.05 - 0.005 * k; F.teeth.visible = k > 0.3; F.teeth.position.y = -0.0455; F.lip.position.y = -0.053 - 0.011 * k; F.irises.forEach((r2) => r2.scale.setScalar(1 - 0.5 * k)); }; P.setFear(0); }
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.043, 0.036, 0.056, 0.042];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, jac)), fo: shd(new THREE.Mesh(UCYL, jac)), sj: sph(1, jac), ej: sph(1, jac), hand: mkHand(P, sd === 1 ? -1 : 1, skin, nail) }));
  P.arm.forEach((a) => { a.bu = sph(1, jac, 1, 1, 1, 10); a.fb = sph(1, jac, 1, 1, 1, 10); [a.up, a.fo, a.sj, a.ej, a.bu, a.fb].forEach((m) => g.add(m)); });   // sleeve volume over the upper arm and forearm (not tubes) P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, jac, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); const b = capsule(0.038, 0.15, boot, 6); b.rotation.x = Math.PI / 2; b.scale.set(1.05, 1, 0.8); b.position.set(0, -0.04, 0.05); fg.add(b); bx(0.08, 0.02, 0.25, boot, 0, -0.068, 0.05, fg); return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, pants)), sh: shd(new THREE.Mesh(UCYL, pants)), kj: sph(1, pants), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); return P;
}

// ---------------- THE JANITOR (rebuilt): a profiled torso with sloped trapezius and shoulders, deltoids, a sculpted
// middle-aged Japanese face (deformed skull, eye sockets, nose, cheekbones, jaw) with a real mouth that opens (jaw blend),
// eyeballs with irises and lids, brows; a work cap, a loose grey-blue work jacket, a tenugui, work trousers, rubber boots ----------------
const JHD = { x: 0.074, y: 0.104, z: 0.093 };   // head half-sizes
const jFront = (x, y) => { const ux = x / JHD.x, uy = y / JHD.y, uz = Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy)); return [mod(Math.atan2(uz, -ux) / TAU, 1), Math.acos(clamp(uy, -1, 1)) / Math.PI]; };
function texJanFace() { return txCanvas('janface', 512, 256, (x, w, h, R) => {
  x.fillStyle = '#b48c6c'; x.fillRect(0, 0, w, h);
  const at = (px, py) => { const [u, v] = jFront(px, py); return [u * w, v * h]; };
  const rg = (px, py, rx, ry, c0) => { const [cx, cy] = at(px, py); x.save(); x.translate(cx, cy); x.scale(1, ry / rx); const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, c0); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, TAU); x.fill(); x.restore(); };
  for (let i = 0; i < 160; i++) { x.fillStyle = R.pick(['rgba(150,100,70,0.16)', 'rgba(200,160,130,0.14)', 'rgba(120,80,60,0.14)', 'rgba(170,110,90,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 16), R); x.fill(); }
  // hair under the cap: short, dark grey, greying at the temples; the back and sides of the head
  for (let px = 0; px < w; px++) { const front = Math.abs(mod(px / w - 0.25 + 0.5, 1) - 0.5); if (front < 0.17) continue; const vEnd = front < 0.24 ? 0.36 : 0.52; x.fillStyle = front < 0.26 ? '#6a6660' : '#34302c'; x.fillRect(px, 0, 1, vEnd * h - 4 * Math.sin(px * 0.7) - 3); }   // short hair, solid under the speckle (the back of the head is never bare skin)
  for (let i = 0; i < 6000; i++) { const u = R.f(), v = R.r(0.05, 0.5), front = Math.abs(mod(u - 0.25 + 0.5, 1) - 0.5); if (front < 0.16 && v < 0.5) continue; if (front < 0.21 && v > 0.36) continue; x.fillStyle = R.f() < (front < 0.26 ? 0.55 : 0.25) ? 'rgba(170,166,158,0.9)' : 'rgba(40,36,32,0.9)'; x.fillRect(u * w, v * h, 1.5, 1.5); }
  rg(0, -0.07, 60, 34, 'rgba(110,80,60,0.25)');   // a darker jaw
  for (let i = 0; i < 2600; i++) { const px = R.r(-0.06, 0.06), py = R.r(-0.1, -0.035); if (Math.abs(px) < 0.026 && py > -0.064 && py < -0.044) continue; if (py > -0.04 && Math.abs(px) < 0.02) continue; const [u, v] = at(px, py); x.fillStyle = R.pick(['rgba(50,44,40,0.55)', 'rgba(130,126,120,0.5)', 'rgba(70,60,52,0.5)']); x.fillRect(u, v, 1, 1); }   // grey stubble
  [-1, 1].forEach((sd) => { rg(sd * 0.031, -0.002, 12, 4, 'rgba(90,56,44,0.3)'); rg(sd * 0.03, 0.022, 18, 6, 'rgba(120,80,60,0.25)');   // tired eye bags, lid shade
    const pts = [[sd * 0.016, -0.03], [sd * 0.024, -0.042], [sd * 0.028, -0.056]]; x.strokeStyle = 'rgba(80,50,36,0.55)'; x.lineWidth = 1.6; x.beginPath(); pts.forEach(([a, b], k) => { const [u, v] = at(a, b); k ? x.lineTo(u, v) : x.moveTo(u, v); }); x.stroke();   // nasolabial folds
    for (let k = 0; k < 3; k++) { const [u, v] = at(sd * (0.05 + k * 0.003), 0.012 - k * 0.006); x.strokeStyle = 'rgba(90,60,44,0.45)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(u, v); x.lineTo(u + sd * 6, v - 1 + k); x.stroke(); }   // crow's feet
    const [nu, nv] = at(sd * 0.008, -0.036); x.fillStyle = 'rgba(40,22,16,0.8)'; x.beginPath(); x.ellipse(nu, nv, 2.2, 1.2, 0, 0, TAU); x.fill(); });   // nostrils
  { const [u0, v0] = at(-0.022, -0.053), [u1] = at(0.022, -0.053); x.fillStyle = 'rgba(130,70,60,0.45)'; x.fillRect(u0, v0 - 2.5, u1 - u0, 5); x.fillStyle = 'rgba(60,30,24,0.7)'; x.fillRect(u0, v0 - 0.5, u1 - u0, 1); }   // lips
  for (let k = 0; k < 3; k++) { const [u0, v0] = at(-0.03, 0.055 + k * 0.006), [u1] = at(0.03, 0.055); x.strokeStyle = 'rgba(100,66,50,0.35)'; x.lineWidth = 0.9; x.beginPath(); x.moveTo(u0, v0); x.quadraticCurveTo((u0 + u1) / 2, v0 - 2, u1, v0); x.stroke(); }   // forehead lines
}, [1, 1]); }
function texWorkJacket() { return txCanvas('wjack', 256, 256, (x, w, h, R) => { x.fillStyle = '#56666c'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { const px = R.r(0, w); x.fillStyle = 'rgba(20,26,30,0.22)'; x.fillRect(px, R.r(0, 120), R.r(1, 3), R.r(60, 200)); x.fillStyle = 'rgba(160,176,182,0.12)'; x.fillRect(px + 2, R.r(0, 120), 1, R.r(40, 160)); }   // folds
  for (let i = 0; i < 12; i++) { x.strokeStyle = 'rgba(20,26,30,0.25)'; x.lineWidth = 1.2; x.beginPath(); const yy = R.r(0, h); x.moveTo(R.r(0, w), yy); x.quadraticCurveTo(R.r(0, w), yy + R.n(14), R.r(0, w), yy + R.n(10)); x.stroke(); }
  x.fillStyle = '#2a3236'; x.fillRect(w * 0.25 - 1.5, 0, 3, h); x.fillStyle = 'rgba(180,180,170,0.4)'; for (let y = 0; y < h; y += 4) x.fillRect(w * 0.25 - 1, y, 2, 1);   // the zip (front = u 0.25)
  [-1, 1].forEach((sd) => { const px = w * 0.25 + sd * 26; x.strokeStyle = 'rgba(24,30,34,0.7)'; x.lineWidth = 1.5; x.strokeRect(px - 13, h * 0.66 - 64, 26, 30); x.fillStyle = 'rgba(30,38,42,0.5)'; x.fillRect(px - 14, h * 0.66 - 66, 28, 6); x.strokeRect(px - 16, h * 0.22, 32, 36); });   // chest and hip pockets
  x.fillStyle = '#d8d4c4'; x.fillRect(w * 0.25 + 14, h * 0.66 - 80, 18, 7); x.fillStyle = '#2a2420'; x.font = '6px ' + JPG; x.fillText('用務', w * 0.25 + 16, h * 0.66 - 74.5);   // name tag: "custodian"
  x.fillStyle = 'rgba(20,24,26,0.5)'; x.fillRect(0, h * 0.14, w, 3);   // waistband seam
  speckle(x, R, w, h, 1600, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.15)', 'rgba(90,70,50,0.12)']); }, [1, 1]); }
function profTorso(L, prof, mat, n = 28) {   // a body section from elliptical rings: prof = [[y, halfWidth, frontDepth, backDepth], ...]
  const P = [], UV = [], idx = [], m = prof.length;
  prof.forEach(([y, hw, df, db], j) => { for (let k = 0; k <= n; k++) { const a = k / n * TAU, c = Math.cos(a), s = Math.sin(a), d = s > 0 ? df : db, blade = s < 0 ? 0.008 * Math.exp(-(((Math.abs(c) - 0.45) / 0.18) ** 2)) * ss(L * 0.55, L * 0.8, y) : 0; P.push(hw * c, y, (d + blade) * s); UV.push(k / n, y / L); } });
  for (let j = 0; j < m - 1; j++) for (let k = 0; k < n; k++) { const a = j * (n + 1) + k, b = a + n + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(idx); g.computeVertexNormals(); return shd(new THREE.Mesh(g, mat));
}
function mkJanitor() {
  const pd = Object.assign({}, PDM, { torso: 0.55, shW: 0.15, hipW: 0.09, uArm: 0.3, fArm: 0.27, legR: [0.07, 0.056, 0.06] }), g = new THREE.Group(), P = { kind: 'man', pd, g }, L = pd.torso;
  const skin = SM({ color: '#b48c6c', roughness: 0.75 }), nail = SM({ color: '#c8a088' }), jac = SM({ map: texWorkJacket(), roughness: 0.9 }), pants = SM({ map: texCloth('wpants', '#3e4a4e'), roughness: 0.9 }), boot = SM({ color: '#2a302c', roughness: 0.5 }), capM = SM({ color: '#2a3440', roughness: 0.85 });
  P.mat = { skin, top: jac };
  const T = new THREE.Group(); g.add(T); P.T = T;
  // the jacket body: hips → belly → chest → shoulders, sloping up the trapezius to the neck
  T.add(profTorso(L, [[0.02, 0.17, 0.125, 0.12], [0.1, 0.162, 0.125, 0.112], [0.2, 0.158, 0.128, 0.105], [0.3, 0.168, 0.122, 0.104], [0.4, 0.178, 0.118, 0.106], [0.46, 0.176, 0.108, 0.102], [0.5, 0.162, 0.096, 0.094], [0.525, 0.128, 0.082, 0.084], [0.542, 0.088, 0.064, 0.066], [0.556, 0.058, 0.052, 0.056]], jac));
  { const hem = cyl(0.176, 0.182, 0.06, jac, 24, true); hem.scale.set(1, 1, 0.72); hem.position.y = 0.0; T.add(hem); }
  // the collar: a turned-down band round the neck, two points in front; the tenugui towel round the neck
  { const col = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.078, 0.04, 20, 1, true), jac)); col.position.y = L + 0.0; col.scale.set(1, 1, 0.92); T.add(col); [-1, 1].forEach((sd) => { const pt = bx(0.04, 0.05, 0.006, jac, sd * 0.03, L - 0.03, 0.068, T); pt.rotation.set(-0.35, 0, sd * 0.5); });
    const tw = SM({ map: texCloth('tenugui', '#c8c4b0', { check: '#5a6e8a' }) }), ring = shd(new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.016, 6, 18), tw)); ring.rotation.x = Math.PI / 2 - 0.15; ring.position.set(0, L + 0.012, -0.004); ring.scale.set(1.08, 0.95, 1); T.add(ring);
    [-1, 1].forEach((sd) => { const end = bx(0.04, 0.16, 0.008, tw, sd * 0.05, L - 0.07, 0.085, T); end.rotation.set(-0.12, 0, sd * 0.1); }); }
  // belt, key ring
  { const belt = cyl(0.166, 0.166, 0.03, SM({ color: '#1a1612' }), 20); belt.scale.set(1, 1, 0.76); belt.position.y = 0.075; T.add(belt); const kc = sph(0.016, SM({ color: '#a89870', roughness: 0.3 }), 1, 1, 0.5, 6); kc.position.set(0.16, 0.04, 0.03); T.add(kc); }
  // hips / trousers seat: an upright group (the torso leans and twists over it at the waist)
  { const Hp = new THREE.Group(); g.add(Hp); P.Hp = Hp; Hp.add(profTorso(0.2, [[-0.12, 0.12, 0.09, 0.1], [-0.06, 0.155, 0.11, 0.12], [0.02, 0.165, 0.115, 0.118], [0.1, 0.16, 0.115, 0.11]], pants)); }
  // the head
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd; Hd.scale.setScalar(1.1); const geoS = new THREE.SphereGeometry(1, 48, 40), ub = Math.cos(27 * Math.PI / 40);
  const deform = (ux, uy, uz) => { let x = ux * JHD.x, y = uy * JHD.y, z = uz * JHD.z; const fr = ss(0.0, 0.55, uz), G = (cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
    if (uz < 0) z *= 1.06; const lo = ss(-0.2, -0.95, uy); x *= 1 - 0.2 * lo; z *= 1 - 0.06 * lo * (1 - fr);   // narrower jaw, fuller cranium
    z += fr * (-0.0085 * (G(-0.03, 0.012, 0.014, 0.01) + G(0.03, 0.012, 0.014, 0.01)) + 0.004 * G(0, 0.028, 0.04, 0.006) + 0.003 * (G(-0.048, -0.012, 0.012, 0.012) + G(0.048, -0.012, 0.012, 0.012))
      + 0.011 * Math.exp(-((x / 0.0075) ** 2)) * ss(0.016, 0.0, y) * ss(-0.042, -0.03, y) + 0.012 * G(0, -0.03, 0.011, 0.009) + 0.0035 * G(0, -0.053, 0.02, 0.008) + 0.006 * G(0, -0.088, 0.016, 0.012) - 0.0028 * (G(-0.044, -0.052, 0.012, 0.016) + G(0.044, -0.052, 0.012, 0.016)));
    x += fr * 0.003 * (G(-0.048, -0.012, 0.012, 0.012) * -1 + G(0.048, -0.012, 0.012, 0.012));
    return V3(x, y, z); };
  const gN = geoS.toNonIndexed(), PP = gN.attributes.position, base = new Float32Array(PP.count * 3), wJ = new Float32Array(PP.count), wC = new Float32Array(PP.count), wU = new Float32Array(PP.count);
  for (let t3 = 0; t3 < PP.count; t3 += 3) { let cy = 0; for (let k = 0; k < 3; k++) cy += PP.getY(t3 + k) / 3; const lower = cy < ub;
    for (let k = 0; k < 3; k++) { const i = t3 + k, ux = PP.getX(i), uy = PP.getY(i), uz = PP.getZ(i), p = deform(ux, uy, uz); base.set([p.x, p.y, p.z], i * 3);
      const slit = (1 - ss(0.13, 0.27, Math.abs(ux))) * ss(0.4, 0.6, uz) * (uy > ub - 0.12 ? 1 : 0); wJ[i] = lower ? clamp(Math.max(ss(ub, ub - 0.32, uy), slit)) * ss(-0.3, 0.3, uz) : 0;
      wC[i] = Math.exp(-(((Math.abs(ux) - 0.28) / 0.1) ** 2 + ((uy - ub) / 0.09) ** 2)) * ss(0.4, 0.6, uz); wU[i] = lower ? 0 : (1 - ss(0.1, 0.24, Math.abs(ux))) * ss(ub + 0.09, ub, uy) * ss(0.4, 0.6, uz); PP.setXYZ(i, p.x, p.y, p.z); } }   // mouth corners pulled down, upper lip lifted (terror)
  gN.computeVertexNormals(); const head = shd(new THREE.Mesh(gN, SM({ map: texJanFace(), color: '#ffffff', roughness: 0.75 }))); Hd.add(head); P.skull = head;
  const surfZ = (x, y) => { let best = 1e9, bz = 0; for (let i = 0; i < PP.count; i++) { const bx2 = base[i * 3], by = base[i * 3 + 1], bz2 = base[i * 3 + 2]; if (bz2 < 0) continue; const d = (bx2 - x) ** 2 + (by - y) ** 2; if (d < best) { best = d; bz = bz2; } } return bz; };
  const ym = ub * JHD.y, piv = V3(0, ym + 0.012, -0.03), mz = surfZ(0, ym);
  { const cav = sph(1, SM({ color: '#1a0806' }), 1, 1, 1, 12); cav.scale.set(0.02, 0.016, 0.016); cav.position.set(0, ym - 0.008, mz - 0.03); Hd.add(cav); }
  const tM = SM({ color: '#d0c8b0', roughness: 0.4 }); bx(0.03, 0.007, 0.007, tM, 0, ym - 0.001, mz - 0.014, Hd);
  const jawG = new THREE.Group(); jawG.position.copy(piv); Hd.add(jawG); bx(0.026, 0.006, 0.007, tM, 0, ym - 0.009 - piv.y, mz - 0.018 - piv.z, jawG);
  // eyes: eyeballs set in the sockets, brown irises, pupils, a catchlight; upper and lower lids; brows
  const F = { lidU: [], lidL: [], brows: [], eyes: [] }, white = SM({ color: '#d4cec0', roughness: 0.3 }), iris = BM('#3a2618'), pup = BM('#080606'), lidM = SM({ color: '#a88066', roughness: 0.75 }), browM = SM({ color: '#2c2824', roughness: 0.9 });
  [-1, 1].forEach((sd) => { const ex = sd * 0.0305, ey = 0.012, ez = surfZ(ex, ey) - 0.0085, er = 0.0115, E = new THREE.Group(); E.position.set(ex, ey, ez); Hd.add(E); F.eyes.push(E);
    E.add(sph(er, white, 1, 1, 1, 14)); const ir = new THREE.Mesh(new THREE.CircleGeometry(0.0059, 14), iris); ir.position.z = er + 0.0002; E.add(ir); const pp = new THREE.Mesh(new THREE.CircleGeometry(0.0022, 10), pup); pp.position.z = er + 0.0004; E.add(pp); const cl = new THREE.Mesh(new THREE.CircleGeometry(0.0008, 6), BM('#f0ece0')); cl.position.set(0.0018, 0.0018, er + 0.0006); E.add(cl);
    const lu = shd(new THREE.Mesh(new THREE.SphereGeometry(er * 1.12, 18, 8, 0, TAU, 0, Math.PI * 0.5), lidM)); lu.position.set(ex, ey, ez); Hd.add(lu); F.lidU.push(lu);
    const ll = shd(new THREE.Mesh(new THREE.SphereGeometry(er * 1.1, 18, 6, 0, TAU, Math.PI * 0.68, Math.PI * 0.32), lidM)); ll.position.set(ex, ey, ez); Hd.add(ll); F.lidL.push(ll);
    const br = new THREE.Group(); br.position.set(sd * 0.03, 0.029, surfZ(sd * 0.03, 0.029) + 0.001); Hd.add(br); [[0, 0.016], [sd * 0.011, 0.012]].forEach(([dx, wd], k) => { const b = bx(wd, 0.0042, 0.005, browM, dx + sd * -0.004, k ? -0.0015 : 0, 0, br); b.rotation.z = sd * (k ? -0.25 : 0.05); }); F.brows.push(br);
    const ear = sph(1, skin, 1, 1, 1, 10); ear.scale.set(0.009, 0.026, 0.017); ear.position.set(sd * 0.074, -0.004, -0.008); ear.rotation.y = sd * 0.3; Hd.add(ear); });
  { const nw = [-1, 1].map((sd) => { const m = sph(0.0065, skin, 1, 0.8, 1, 8); m.position.set(sd * 0.0105, -0.034, surfZ(sd * 0.0105, -0.034) - 0.002); Hd.add(m); return m; }); void nw; }   // nose wings
  // the work cap: a crown that sits on the skull, a stiff curved brim, a button
  { const crown = shd(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12, 0, TAU, 0, Math.PI * 0.44), capM)); crown.scale.set(JHD.x * 1.09, JHD.y * 0.82, JHD.z * 1.07); crown.position.set(0, 0.034, -0.004); Hd.add(crown);
    const band = shd(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 28, 1, true), capM)); band.scale.set(JHD.x * 1.09 * 0.99, 0.012, JHD.z * 1.07 * 0.99); band.position.set(0, 0.034 + JHD.y * 0.82 * Math.cos(Math.PI * 0.44) - 0.005, -0.004); Hd.add(band);
    const brimG = new THREE.CylinderGeometry(0.07, 0.07, 0.009, 20, 1, false, -Math.PI / 2, Math.PI); { const Pb = brimG.attributes.position; for (let i = 0; i < Pb.count; i++) { const bx2 = Pb.getX(i), bz2 = Pb.getZ(i); Pb.setY(i, Pb.getY(i) - 1.6 * bx2 * bx2 - 0.25 * bz2 * bz2); } brimG.computeVertexNormals(); }
    const brim = shd(new THREE.Mesh(brimG, capM)); brim.scale.set(1, 1, 0.95); brim.position.set(0, band.position.y - 0.003, JHD.z * 1.07 * 0.8); brim.rotation.x = 0.12; Hd.add(brim);
    const btn = sph(0.006, capM, 1, 0.5, 1, 8); btn.position.set(0, 0.034 + JHD.y * 0.82, -0.004); Hd.add(btn); }
  // expressions: k 0 tired / neutral, ~0.5 worried, 1 terrified (brows up and together, eyes wide, jaw open showing teeth)
  P.fface = F; P.setFear = (k) => { if (P._fk === k) return; P._fk = k; const ja = 0.33 * ss(0.65, 1, k), kt = ss(0.65, 1, k), c = Math.cos(ja), s = Math.sin(ja);
    for (let i = 0; i < PP.count; i++) { const bx2 = base[i * 3], by0 = base[i * 3 + 1], bz = base[i * 3 + 2], w2 = wJ[i], by = by0 - 0.006 * kt * wC[i] + 0.0035 * kt * wU[i]; if (!w2) { PP.setXYZ(i, bx2, by, bz); continue; } const ry = by - piv.y, rz = bz - piv.z, nyy = piv.y + ry * c - rz * s, nzz = piv.z + ry * s + rz * c; PP.setXYZ(i, lerp(bx2, bx2, w2), lerp(by, nyy, w2), lerp(bz, nzz, w2)); }
    PP.needsUpdate = true; gN.computeVertexNormals(); jawG.rotation.x = ja;
    F.lidU.forEach((l) => (l.rotation.x = lerp(0.12, -0.6, ss(0.1, 1, k)))); F.lidL.forEach((l) => (l.rotation.x = lerp(-0.32, 0.1, k)));
    F.brows.forEach((b, i) => { const sd = i ? 1 : -1; b.position.y = 0.029 + 0.006 * k; b.rotation.z = sd * -0.3 * ss(0.2, 0.8, k); }); };
  P._fk = -1; P.setFear(0);
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.046, 0.04, 0.058, 0.044];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, jac)), fo: shd(new THREE.Mesh(UCYL, jac)), sj: sph(1, jac, 1, 1, 1, 14), ej: sph(1, jac, 1, 1, 1, 10), hand: mkHand(P, sd === 1 ? -1 : 1, skin, nail) }));
  P.arm.forEach((a) => { a.bu = sph(1, jac, 1, 1, 1, 12); a.fb = sph(1, jac, 1, 1, 1, 12); a.cuff = cyl(1, 1, 1, jac, 12, true); [a.up, a.fo, a.sj, a.ej, a.bu, a.fb, a.cuff].forEach((m) => g.add(m)); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); const b = capsule(0.045, 0.16, boot, 8); b.rotation.x = Math.PI / 2; b.scale.set(1.05, 1, 0.75); b.position.set(0, -0.035, 0.05); fg.add(b); bx(0.095, 0.022, 0.28, SM({ color: '#141614' }), 0, -0.066, 0.05, fg); return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, pants)), sh: shd(new THREE.Mesh(UCYL, pants)), kj: sph(1, pants), foot: mkFoot(), boot: shd(new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.054, 1, 12), boot)) }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj, l.boot].forEach((m) => g.add(m)));
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); return P;
}
