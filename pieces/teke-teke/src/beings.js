// =====================================================================
//  BEINGS — the girl (a long hunched torso, spidery hyper-extending arms, a hidden face with one eye, heavy wet hair
//  clumps with lag and drips) and her uncanny motion (stop-motion holds, head jerks, reach-plant-hold-drag crawl);
//  the boys (teen rig, modelled faces and hair); the street lamps (pools of sodium / fluorescent light, some flicker).
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

// ---------------- THE GIRL ----------------
const GL = { uArm: 0.47, fArm: 0.47, shW: 0.14, fl: 0.7 };
function texGirlFace() { return txCanvas('gface2', 512, 256, (x, w, h, R) => {
  x.fillStyle = '#7a8a94'; x.fillRect(0, 0, w, h); const fx = w / 2;
  for (let i = 0; i < 80; i++) { x.fillStyle = R.pick(['rgba(70,84,110,0.2)', 'rgba(120,130,124,0.2)', 'rgba(60,66,90,0.22)', 'rgba(150,160,160,0.16)', 'rgba(90,70,90,0.15)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 22), R); x.fill(); }
  const rg = (cx, cy, rx, ry, c0, c1 = 'rgba(0,0,0,0)') => { x.save(); x.translate(cx, cy); x.scale(1, ry / rx); const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, TAU); x.fill(); x.restore(); };
  [-1, 1].forEach((sd) => rg(fx + sd * 50, 150, 30, 34, 'rgba(20,26,40,0.6)'));
  const vein = (px, py, n, sx, sy, col = 'rgba(20,24,46,0.7)', lw = 1.3) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < n; k++) { px += sx + R.n(4); py += sy + R.n(4); x.lineTo(px, py); if (R.f() < 0.3) { x.moveTo(px, py); } } x.stroke(); };
  // the visible eye (viewer's left): a deep socket, a bloodshot white, a tiny pupil with a red pin of light; veins around it
  const ex = fx - 30, ey = 116; rg(ex, ey, 30, 22, 'rgba(6,8,12,0.95)', 'rgba(14,18,24,0)'); rg(ex, ey, 14, 9, 'rgba(4,4,6,1)', 'rgba(8,8,10,0.6)');
  for (let i = 0; i < 10; i++) vein(ex + R.n(10), ey + R.n(8), 4, R.n(6), R.n(6));
  x.fillStyle = '#c8bcae'; x.beginPath(); x.ellipse(ex, ey, 9, 4.6, -0.08, 0, TAU); x.fill(); x.strokeStyle = 'rgba(170,40,36,0.85)'; x.lineWidth = 0.8; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(ex + (i % 2 ? 9 : -9), ey + R.n(2)); x.lineTo(ex + R.n(4), ey + R.n(2)); x.stroke(); }
  x.fillStyle = '#1a1414'; x.beginPath(); x.arc(ex + 1, ey + 0.5, 1.8, 0, TAU); x.fill(); x.fillStyle = '#ff2a14'; x.fillRect(ex + 0.5, ey, 1.2, 1.2);
  x.strokeStyle = 'rgba(10,10,14,0.9)'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(ex, ey - 1, 10, 5.5, 0, Math.PI * 1.02, Math.PI * 1.98); x.stroke();
  x.fillStyle = 'rgba(24,20,22,0.85)'; x.save(); x.translate(ex - 2, 98); x.rotate(0.22); x.fillRect(-13, -1.5, 26, 3); x.restore();
  rg(fx + 30, 118, 26, 20, 'rgba(6,8,12,0.95)'); x.fillStyle = '#9a9488'; x.fillRect(fx + 24, 117, 12, 2);   // the other eye, half shut (under the hair)
  // the mouth: a dark slit far too wide, thin cracked lips; it opens in 3D (mkGirl.mouth)
  const W2 = 70, up = (u) => 168 - 6 * Math.pow(Math.abs(u), 2.4);
  x.fillStyle = '#4c3e4a'; x.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 20 - 1; x.lineTo(fx + u * (W2 + 3), up(u) - 2.6); } for (let i = 40; i >= 0; i--) { const u = i / 20 - 1; x.lineTo(fx + u * (W2 + 3), up(u) + 2.8); } x.fill();
  x.fillStyle = '#070304'; x.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 20 - 1; x.lineTo(fx + u * W2, up(u) - 0.8); } for (let i = 40; i >= 0; i--) { const u = i / 20 - 1; x.lineTo(fx + u * W2, up(u) + 1.0); } x.fill();
  x.strokeStyle = 'rgba(200,190,196,0.5)'; x.lineWidth = 0.8; for (let i = 0; i < 26; i++) { const u = R.r(-1, 1), y0 = up(u) + (R.f() < 0.5 ? -2.6 : 1.2); x.beginPath(); x.moveTo(fx + u * W2, y0); x.lineTo(fx + u * W2 + R.n(1), y0 + 1.6); x.stroke(); }
  for (let i = 0; i < 14; i++) vein(fx + R.n(60), R.r(196, 232), 5, R.n(6), R.r(2, 6));   // veins under the jaw
  x.fillStyle = 'rgba(40,46,56,0.5)'; x.fillRect(fx - 6, 146, 3, 3); x.fillRect(fx + 3, 146, 3, 3);
  x.fillStyle = 'rgba(8,10,14,0.65)'; x.fillRect(0, 0, w * 0.22, h); x.fillRect(w * 0.78, 0, w * 0.22, h);
}, [1, 1]); }
function mkGirl(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const skin = SM({ color: '#8a98a2', roughness: 0.4, emissive: '#0e1218', emissiveIntensity: 0.1 }), blouse = SM({ map: texBlouse() }), navy = SM({ map: texCollar() }), nailM = SM({ color: '#1a1414' }), G = { g, skin };
  G.torso = sph(1, blouse, 1, 1, 1, 18); g.add(G.torso); G.hunch = sph(1, blouse, 1, 1, 1, 14); g.add(G.hunch);
  G.blades = [0, 1].map(() => { const m = sph(1, blouse, 1, 1, 1, 10); g.add(m); return m; }); G.spine = [...Array(9)].map(() => { const m = sph(0.016, blouse, 1, 1, 1, 6); g.add(m); return m; });
  G.hem = shd(new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, 1, 16, 1, true), SM({ map: texBlouse(), alphaMap: texRag('hem'), alphaTest: 0.5, side: THREE.DoubleSide }))); g.add(G.hem);
  G.hemIn = sph(1, SM({ color: '#030304' }), 1, 1, 1, 10); g.add(G.hemIn);
  G.collar = bx(1, 1, 1, navy, 0, 0, 0, g); G.collarF = [0, 1].map(() => bx(1, 1, 1, navy, 0, 0, 0, g)); G.tie = sph(1, SM({ color: '#6a2a1c' }), 1, 1, 1, 8); g.add(G.tie);
  G.neck = shd(new THREE.Mesh(UCYL1, skin)); g.add(G.neck);
  const H = new THREE.Group(); g.add(H); G.head = H; const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), SM({ map: texGirlFace(), color: '#ffffff', roughness: 0.45 }))); sk.scale.set(0.8, 1.15, 0.9); sk.rotation.y = -Math.PI / 2; H.add(sk); G.skull = sk;
  { const cap = sph(0.104, SM({ color: '#050608', roughness: 0.3 }), 0.84, 0.92, 0.92, 16); cap.position.set(0, 0.05, -0.03); H.add(cap); }
  { const u = 0.5 - 30 / 512, phi = u * TAU, th = Math.PI * 116 / 256, r = 0.1012; G.glint = sph(0.0018, BM('#ff3018', { fog: false }), 1, 1, 1, 6); G.glint.position.set(-Math.cos(phi) * Math.sin(th) * r, Math.cos(th) * r, Math.sin(phi) * Math.sin(th) * r); sk.add(G.glint); }
  // the mouth that opens: a dark cavity behind the slit, dark gums, small uneven teeth (upper hang down, lower rise with the jaw)
  { const mo = new THREE.Group(); mo.position.set(0, -0.054, 0.0); H.add(mo); G.mouth = mo; mo.add(G.mcav = sph(1, SM({ color: '#050203' }), 1, 1, 1, 14)); G.mcav.position.z = 0.074;
    const tM = SM({ color: '#a8a088' }), gM = SM({ color: '#2a0c10' }); G.gumU = bx(0.09, 0.004, 0.006, gM, 0, 0.002, 0.084, mo); G.gumL = bx(0.08, 0.004, 0.006, gM, 0, -0.004, 0.083, mo);
    G.tU = []; G.tL = []; for (let i = 0; i < 15; i++) { const u = i / 14 - 0.5; if (hsh(i, 81) < 0.12) continue; const tt = bx(0.0045, 0.006 + 0.003 * hsh(i, 82), 0.004, tM, u * 0.08, -0.002, 0.085 - 0.015 * u * u, mo); G.tU.push(tt); }
    for (let i = 0; i < 13; i++) { const u = i / 12 - 0.5; if (hsh(i, 83) < 0.15) continue; const tt = bx(0.004, 0.005 + 0.002 * hsh(i, 84), 0.004, tM, u * 0.07, -0.006, 0.084 - 0.015 * u * u, mo); G.tL.push(tt); } }
  // heavy soaked hair: layered tapered clump tubes, darker at the roots (geometry rebuilt each frame from a lagging chain)
  { const R = RNG('hair3'), hm = SM({ vertexColors: true, color: '#ffffff', roughness: 0.25 }); G.hc = [];
    const add = (root, L, w, front, fx0) => { const n = 12, S = 6, P = new Float32Array((n + 1) * S * 3), Cc = new Float32Array((n + 1) * S * 3), idx = [];
      for (let j = 0; j <= n; j++) for (let k = 0; k < S; k++) { const c = lin('#020304').lerp(lin('#14181e'), Math.pow(j / n, 0.7)), q = (j * S + k) * 3; Cc[q] = c.r; Cc[q + 1] = c.g; Cc[q + 2] = c.b; }
      for (let j = 0; j < n; j++) for (let k = 0; k < S; k++) { const a = j * S + k, b = j * S + (k + 1) % S, c2 = a + S, d = b + S; idx.push(a, c2, b, b, c2, d); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); geo.setIndex(idx);
      const m = new THREE.Mesh(geo, hm); m.castShadow = true; m.frustumCulled = false; g.add(m); G.hc.push({ m, n, S, root, L, w, front, fx0, ph: R.r(0, TAU), wav: R.r(0.5, 1.5) }); };
    for (let i = 0; i < 22; i++) { const az = Math.PI + R.n(2.2), el = R.r(0.05, 1.25); add(V3(Math.sin(az) * Math.cos(el) * 0.085, 0.03 + Math.sin(el) * 0.1, Math.cos(az) * Math.cos(el) * 0.09 - 0.015), R.r(0.75, 1.35), R.r(0.02, 0.034), false); }   // back and sides: much longer than her torso
    [[-0.064, 0.95, 0.03], [-0.08, 0.85, 0.028], [-0.092, 0.7, 0.022], [-0.006, 0.62, 0.012], [0.01, 0.85, 0.03], [0.03, 0.9, 0.032], [0.05, 1.0, 0.034], [0.068, 0.85, 0.03], [0.085, 0.75, 0.024]].forEach(([fx0, L, w]) => add(V3(fx0, 0.1, 0.04), L, w, true, fx0));   // over the face: a gap only at her left eye (x ≈ −0.03)
    G.drips = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(60 * 3).fill(-999), 3)), new THREE.PointsMaterial({ color: '#b8c8d0', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })); G.drips.frustumCulled = false; g.add(G.drips); }
  G.arms = [0, 1].map(() => ({ up: shd(new THREE.Mesh(UCYL, blouse)), fo: shd(new THREE.Mesh(UCYL, skin)), sj: sph(1, blouse, 1, 1, 1, 10), ej: sph(1, skin, 1, 0.75, 1.4, 8), ej2: sph(1, skin, 1, 1, 1, 6), cuff: cyl(1, 1, 1, SM({ map: texBlouse(), alphaMap: texRag('cuff'), alphaTest: 0.5, side: THREE.DoubleSide }), 10, true), wr: sph(1, skin, 1, 0.7, 1, 8), palm: sph(1, skin, 1, 1, 1, 10),
    f: [...Array(5)].map(() => ({ s: [...Array(4)].map(() => shd(new THREE.Mesh(UCYL1, skin))), k: [...Array(4)].map(() => sph(1, skin, 1, 1, 1, 6)), nail: shd(new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), nailM)) })) }));
  G.arms.forEach((A) => { [A.up, A.fo, A.sj, A.ej, A.ej2, A.cuff, A.wr, A.palm].forEach((m) => g.add(m)); A.f.forEach((F) => { F.s.forEach((m) => g.add(m)); F.k.forEach((m) => g.add(m)); g.add(F.nail); }); });
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); g.visible = false; return G;
}
const GFR = [0.0062, 0.0068, 0.0064, 0.0056, 0.007];
function fingerPtsG(o, i, t) {   // long jointed fingers; each finger drums/digs on its own clock (out of sync)
  const L = [0.07, 0.055, 0.045, 0.038].map((l) => l * (o.fl ?? 1)), pts = [], sp = i < 4 ? (i - 1.5) * 0.19 : 1.1, base = o.O.clone().addScaledVector(o.Z, i < 4 ? 0.07 : 0.025).addScaledVector(o.X, i < 4 ? (i - 1.5) * 0.017 : -0.03);
  let d = o.Z.clone().applyAxisAngle(o.Y, sp * (o.spread ?? 1)); const ax = o.Y.clone().cross(d).normalize(); pts.push(base.clone()); const p = base.clone();
  const fq = 6 + 9 * hsh(i, 91), lift = o.tap ? Math.pow(Math.max(0, Math.sin(t * fq + i * 2.3 + hsh(i, 92) * 6)), 3) * o.tap : 0;
  L.forEach((l, j) => { const c = (o.curl ?? 0.3) * (j === 0 ? 0.3 : 1) - (j === 0 ? lift * 0.9 : 0) + (j === 3 ? 0.2 : 0) + (j > 0 ? lift * 0.25 : 0); d = d.clone().applyAxisAngle(ax, c); p.addScaledVector(d, l); pts.push(p.clone()); }); return pts;
}
const _inWall = (p) => p.x < WX1 + 0.15 && p.z < WZ + 0.016 && p.z > WZ - 0.18 && p.y < WT + 0.016;
// st: { chest, waist, N, head { p, Y, Z }, roll, side, arms: [{ W, E?, pole?, hand }], gy, vel (head velocity), F (travel dir), open (mouth 0..1), t (her time) }
function poseGirl(Wd, st) {
  const G = Wd.girl; G.g.visible = true; const N = st.N.clone().normalize(), sp = st.chest.clone().sub(st.waist), sL = sp.length(), U = sp.clone().normalize(), X = U.clone().cross(N).normalize(), Nn = X.clone().cross(U).normalize(), q = qBasis(X, U, Nn), tt = st.t ?? TT;
  G.torso.position.copy(st.waist.clone().lerp(st.chest, 0.47)); G.torso.quaternion.copy(q); G.torso.scale.set(0.115, sL * 0.56, 0.075);
  G.hunch.position.copy(st.waist.clone().lerp(st.chest, 0.78)).addScaledVector(Nn, 0.045); G.hunch.quaternion.copy(q); G.hunch.scale.set(0.11, sL * 0.2, 0.07);
  G.blades.forEach((b, i) => { b.position.copy(st.waist.clone().lerp(st.chest, 0.82)).addScaledVector(Nn, 0.085).addScaledVector(X, (i ? -1 : 1) * 0.062); b.quaternion.copy(q); b.scale.set(0.042, 0.06, 0.022); });
  G.spine.forEach((k, i) => k.position.copy(st.waist.clone().lerp(st.chest, 0.1 + i * 0.1)).addScaledVector(Nn, 0.072 + 0.03 * Math.sin(Math.PI * (0.1 + i * 0.1)) * (i > 5 ? 1.4 : 1)));
  G.hem.position.copy(st.waist).addScaledVector(U, -0.02); G.hem.quaternion.copy(q); G.hem.scale.set(0.11, 0.22, 0.075); G.hemIn.position.copy(st.waist).addScaledVector(U, 0.02); G.hemIn.quaternion.copy(q); G.hemIn.scale.set(0.1, 0.03, 0.065);
  const sh = st.chest.clone().addScaledVector(U, -0.03); G.collar.position.copy(sh).addScaledVector(Nn, 0.09).addScaledVector(U, -0.09); G.collar.quaternion.copy(q); G.collar.scale.set(0.22, 0.16, 0.012);
  G.collarF.forEach((c, i) => { const sd = i ? 1 : -1; c.position.copy(sh).addScaledVector(Nn, -0.068).addScaledVector(X, sd * 0.045).addScaledVector(U, -0.06); c.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, sd * 0.5))); c.scale.set(0.035, 0.14, 0.012); });
  G.tie.position.copy(sh).addScaledVector(Nn, -0.08).addScaledVector(U, -0.12); G.tie.quaternion.copy(q); G.tie.scale.set(0.03, 0.026, 0.018);
  const f = frameOf(st.head.Y, st.head.Z); let hq = qBasis(f.X, f.Y, f.Z); if (st.roll) hq = hq.multiply(new THREE.Quaternion().setFromAxisAngle(V3(0, 0, 1), st.roll));
  G.head.position.copy(st.head.p).addScaledVector(f.X, st.side ?? 0); G.head.quaternion.copy(hq); G.head.updateMatrixWorld(true);
  const hb = G.head.localToWorld(V3(0, -0.08, -0.03)), nb = st.chest.clone().addScaledVector(U, 0.0).addScaledVector(Nn, 0.02); between(G.neck, nb, hb, 0.026);
  // the mouth (0 = a closed slit)
  { const o = st.open ?? 0; G.mcav.scale.set(0.05, 0.0015 + 0.022 * o, 0.012); G.mcav.position.y = -0.011 * o; G.mouth.visible = true; [...G.tU, G.gumU].forEach((m) => (m.visible = o > 0.08)); [...G.tL, G.gumL].forEach((m) => { m.visible = o > 0.08; m.position.y = (m === G.gumL ? -0.004 : -0.006) - 0.02 * o; }); }
  // hair: a gravity chain per clump, lagging behind the head's motion, lying on the snow / the wall top, hanging down the wall face
  { const down = V3(0, -1, 0), vel = st.vel || V3(0, 0, 0), Fd = (st.F || V3(1, 0, 0)).clone().setY(0).normalize(), gy = st.gy, tips = [];
    G.hc.forEach((c) => { const pts = [], seg = c.L / c.n; let p, d;
      if (c.front) { p = G.head.localToWorld(V3(c.fx0, 0.1, 0.05)); pts.push(p.clone()); d = down.clone(); }
      else { p = G.head.localToWorld(c.root.clone()); pts.push(p.clone()); d = p.clone().sub(G.head.position).normalize().multiplyScalar(0.7).add(down).normalize(); }
      let onG = false;
      while (pts.length <= c.n) { const j = pts.length; d = d.clone().lerp(onG ? Fd.clone().negate().add(V3(0, -0.05, 0)) : down, onG ? 0.5 : 0.32).normalize();
        let q2 = p.clone().addScaledVector(d, seg); const lag = Math.min(0.3, 0.028 * j) - Math.min(0.3, 0.028 * (j - 1)); q2.addScaledVector(vel, -lag); q2.addScaledVector(f.X, 0.012 * Math.sin(tt * 1.6 + c.ph + j * 0.45) * (j / c.n));
        if (gy) { const g0 = gy(q2.x, q2.z) + 0.016; if (q2.y < g0) { q2.y = g0; onG = true; } }
        if (j < 6) { const lq = G.head.worldToLocal(q2.clone()), ex = 0.082 + 0.014, ey = 0.118 + 0.014, ez = 0.094 + 0.014, e = (lq.x / ex) ** 2 + (lq.y / ey) ** 2 + (lq.z / ez) ** 2; if (e < 1) { lq.multiplyScalar(1 / Math.sqrt(e)); q2.copy(G.head.localToWorld(lq)); } }   // drape over the head, never through it
        if (_inWall(q2)) { if (p.y > WT && q2.z < WZ - 0.01) q2.y = WT + 0.018; else q2.z = WZ + 0.018; }
        d = q2.clone().sub(p).normalize(); pts.push(q2); p = q2; }
      const P = c.m.geometry.attributes.position;
      for (let j = 0; j <= c.n; j++) { const a = pts[Math.max(0, j - 1)], b = pts[Math.min(c.n, j + 1)], tg = b.clone().sub(a).normalize(), n1 = Math.abs(tg.y) > 0.9 ? V3(1, 0, 0).cross(tg).normalize() : V3(0, 1, 0).cross(tg).normalize(), n2 = tg.clone().cross(n1).normalize();
        const u = j / c.n, r = c.w * Math.pow(1 - u, 0.75) * (0.7 + 0.3 * Math.sin(u * 9 * c.wav + c.ph)) + 0.0015;
        for (let k = 0; k < c.S; k++) { const ang = k / c.S * TAU, v = pts[j].clone().addScaledVector(n1, Math.cos(ang) * r).addScaledVector(n2, Math.sin(ang) * r * 0.6); P.setXYZ(j * c.S + k, v.x, v.y, v.z); } }
      P.needsUpdate = true; c.m.geometry.computeVertexNormals(); c.m.geometry.computeBoundingSphere(); tips.push(pts[c.n]); });
    const D = G.drips.geometry.attributes.position; for (let k = 0; k < 60; k++) { const tp = tips[(k * 7) % tips.length], age = mod(tt * 0.9 + hsh(k, 61), 1), y = tp.y - 4.9 * (age * 0.5) ** 2; const g0 = gy ? gy(tp.x, tp.z) : (tp.z > WZ && tp.x < WX1 ? 0 : -9); D.setXYZ(k, tp.x, y > g0 ? y : -999, tp.z); } D.needsUpdate = true; }
  // arms: shoulder → elbow (knobby, slightly hyper-extended when planted far out; up and out like a spider's when compressed) → wrist → hand
  G.arms.forEach((A, ai) => { const a = st.arms[ai], sd = ai ? -1 : 1, S = st.chest.clone().addScaledVector(X, sd * GL.shW).addScaledVector(U, 0.03).addScaledVector(Nn, 0.03); A.S = S;
    { const dd = a.W.clone().sub(S), Lm = GL.uArm + GL.fArm - 0.012; if (!a.E && dd.length() > Lm) a.W = S.clone().addScaledVector(dd.normalize(), Lm); }
    let E = a.E; if (!E) { const dd = a.W.distanceTo(S), comp = 1 - dd / (GL.uArm + GL.fArm), inward = X.clone().multiplyScalar(-sd), pole = a.pole || V3(0, -0.6, 0).addScaledVector(inward, 0.6).lerp(V3(0, 1, 0).addScaledVector(inward, -0.9), ss(0.05, 0.3, comp)); E = twoBone(S, a.W, GL.uArm, GL.fArm, pole).E; }
    A.E = E; between(A.up, S, E, 0.026, 0.026); between(A.fo, E, a.W, 0.018); A.sj.position.copy(S); A.sj.scale.setScalar(0.03);
    const dU = E.clone().sub(S).normalize(), dW = a.W.clone().sub(E).normalize(); A.ej.position.copy(E).addScaledVector(dU, 0.006); A.ej.quaternion.setFromUnitVectors(V3(0, 0, 1), dW); A.ej.scale.set(0.026, 0.022, 0.036); A.ej2.position.copy(E).addScaledVector(dU.clone().add(dW).normalize(), -0.012).addScaledVector(dU.clone().cross(dW).normalize(), 0.01); A.ej2.scale.setScalar(0.014);
    between(A.cuff, E.clone().addScaledVector(dU, -0.06), E.clone().addScaledVector(dU, 0.0), 0.031); A.wr.position.copy(a.W); A.wr.scale.setScalar(0.02);
    const hd = a.hand, hz = hd.Z.clone().normalize(), hy = hd.Y.clone().addScaledVector(hz, -hd.Y.dot(hz)).normalize(), hx = hy.clone().cross(hz).multiplyScalar(sd);
    A.palm.position.copy(a.W).addScaledVector(hz, 0.04); A.palm.quaternion.copy(qBasis(hy.clone().cross(hz), hy, hz)); A.palm.scale.set(0.032, 0.011, 0.05);
    A.f.forEach((F, i) => { const P2 = fingerPtsG(Object.assign({ X: hx, Y: hy, Z: hz, O: a.W, fl: GL.fl }, hd), i, tt + ai * 0.7);
      F.s.forEach((m, j) => between(m, P2[j], P2[j + 1], GFR[i] * (1 - j * 0.15))); F.k.forEach((k2, j) => { k2.position.copy(P2[j + 1]); k2.scale.setScalar(GFR[i] * (1.25 - j * 0.12)); });
      const dd = P2[4].clone().sub(P2[3]).normalize(), nl = 0.01 * (0.4 + hsh(i + ai * 5, 8)); F.nail.position.copy(P2[4]).addScaledVector(dd, nl * 0.4); F.nail.quaternion.setFromUnitVectors(V3(0, 1, 0), dd); F.nail.scale.set(GFR[i] * 0.8, nl, GFR[i] * 0.8); F.tip = P2[4].clone().addScaledVector(dd, nl * 0.9); }); });
  G.g.updateMatrixWorld(true); G.st = st; return G;
}

// ---------------- PEOPLE: the two boys (teen build, gakuran, scarves, bags, modelled faces, hair with volume) ----------------
function texGakuran(key, base) { return txCanvas('gak' + key, 128, 128, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const px = R.r(0, w); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(px, R.r(0, 40), R.r(1, 2.5), R.r(40, 128)); x.fillStyle = 'rgba(120,130,150,0.12)'; x.fillRect(px + 2, R.r(0, 40), 1, R.r(30, 100)); }   // folds
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, R.r(0, h), w, 1); }
  speckle(x, R, w, h, 220, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.15)', 'rgba(220,235,235,0.2)']); }, [2, 2]); }
const PDM = { torso: 0.5, shW: 0.16, hipW: 0.085, uArm: 0.29, fArm: 0.265, thigh: 0.47, shin: 0.45, headR: 0.088, hs: 0.95, fk: 1.0, fr: 0.95, ank: 0.075, gripR: 0.015, legR: [0.058, 0.047, 0.052] };
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
  for (let i = 0; i < 5; i++) { const b = sph(0.008, gold, 1, 1, 0.6, 6); b.position.set(0, 0.13 + i * 0.07, 0.093); T.add(b); }
  if (o.scarf) { const sc = SM({ map: texCloth((o.key || 's') + 'scarf', o.scarf, { check: o.scarfC }) }); const ring = shd(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.032, 6, 14), sc)); ring.rotation.x = Math.PI / 2; ring.position.y = pd.torso - 0.015; ring.scale.set(1.15, 1, 1); T.add(ring);
    const tp = new THREE.Group(); tp.position.set(0.05, pd.torso - 0.03, 0.1); T.add(tp); const tail = bx(0.065, 0.3, 0.022, sc, 0, -0.15, 0, tp); void tail; P.scarfTail = tp; }
  if (o.bag) { const bm = SM({ map: texBag(o.key, o.bag) }); bx(0.32, 0.26, 0.1, bm, 0, pd.torso * 0.5, -0.155, T); [-1, 1].forEach((sd) => { const s = bx(0.032, 0.36, 0.014, SM({ color: '#14110c' }), sd * 0.075, pd.torso * 0.62, 0.092, T); s.rotation.x = 0.1; }); }
  const Hd = new THREE.Group(); g.add(Hd); P.H = Hd; const r = pd.headR;
  const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), SM({ map: texFacePlain(o.key, o.skin || '#b0805a'), color: '#ffffff', roughness: 0.7 }))); sk.scale.set(0.8, 1.1, 0.9); sk.rotation.y = -Math.PI / 2; Hd.add(sk); P.skull = sk;
  const jaw = sph(r * 0.62, skin, 0.92, 0.62, 0.9); jaw.position.set(0, -r * 0.66, r * 0.16); Hd.add(jaw); const chin = sph(r * 0.22, skin, 1.1, 0.8, 0.9); chin.position.set(0, -r * 0.98, r * 0.55); Hd.add(chin);
  [-1, 1].forEach((sd) => { const cb = sph(r * 0.2, skin, 1.2, 0.7, 0.8); cb.position.set(sd * r * 0.5, -r * 0.18, r * 0.72); Hd.add(cb); });
  [-1, 1].forEach((sd) => { const ear = sph(0.016, skin, 0.5, 1, 0.8); ear.position.set(sd * r * 0.86, -0.006, -0.004); Hd.add(ear); });
  // hair: a cap with volume clumps and a few strands over the forehead
  { const R = RNG('hair' + o.key); const cap = sph(r * 1.07, hairM, 0.92, 0.82, 1.0); cap.position.set(0, r * 0.32, -r * 0.14); Hd.add(cap);
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
    P.fface = F; P.setFear = (k) => { F.eyes.forEach((e) => e.scale.set(1.15, 0.6 + 0.42 * k, 0.55)); F.lids.forEach((l) => { l.position.y = 0.0045 + 0.0075 * k; l.scale.set(1.25, 0.6 - 0.32 * k, 0.72); }); F.ulip.position.y = -0.043 + 0.002 * k;
      F.brows.forEach((b, i) => { b.position.y = 0.02 + 0.01 * k; b.rotation.z = (i ? 1 : -1) * (0.08 + 0.45 * k) * -1; b.position.x = (i ? 1 : -1) * (0.029 - 0.006 * k); });
      F.mouth.scale.set(1.05 + 0.2 * k, 0.12 + 0.5 * k, 0.4); F.mouth.position.y = -0.05 - 0.005 * k; F.teeth.visible = k > 0.3; F.teeth.position.y = -0.0455; F.lip.position.y = -0.053 - 0.011 * k; F.irises.forEach((r2) => r2.scale.setScalar(1 - 0.5 * k)); }; P.setFear(0); }
  P.neck = { c: shd(new THREE.Mesh(UCYL1, skin)) }; g.add(P.neck.c);
  P.armR = [0.045, 0.039, 0.05, 0.041];
  P.arm = [1, -1].map((sd) => ({ sd, up: shd(new THREE.Mesh(UCYL, jac)), fo: shd(new THREE.Mesh(UCYL, jac)), sj: sph(1, jac), ej: sph(1, jac), hand: mkHand(P, sd === 1 ? -1 : 1, skin, nail) }));
  P.arm.forEach((a) => [a.up, a.fo, a.sj, a.ej].forEach((m) => g.add(m))); P.arm.forEach((a) => { a.cuff = cyl(1, 1, 1, jac, 10); g.add(a.cuff); });
  const mkFoot = () => { const fg = new THREE.Group(); g.add(fg); const b = capsule(0.038, 0.15, boot, 6); b.rotation.x = Math.PI / 2; b.scale.set(1.05, 1, 0.8); b.position.set(0, -0.04, 0.05); fg.add(b); bx(0.08, 0.02, 0.25, boot, 0, -0.068, 0.05, fg); return fg; };
  P.leg = [1, -1].map((sd) => ({ sd, th: shd(new THREE.Mesh(UCYL, pants)), sh: shd(new THREE.Mesh(UCYL, pants)), kj: sph(1, pants), foot: mkFoot() }));
  P.leg.forEach((l) => [l.th, l.sh, l.kj].forEach((m) => g.add(m)));
  g.traverse((m) => { if (m.isMesh) m.frustumCulled = false; }); return P;
}

// ---------------- street lamps: pools of light that come and go ----------------
const LAMPS = [[-36, '#ffb060', 0], [-27, '#cfe8e0', 1], [-18, '#ffb060', 0], [-9, '#cfe8e0', 1], [0, '#ffb060', 0], [8.6, '#ffc070', 1], [XC + 3.6, '#cfe8e0', 0]].map(([x, c, fl], i) => ({ p: x > XC ? V3(x, 4.5, TZ + 3.0) : V3(x, 4.5, WZ + 1.0), c, fl, i }));
function flick(L, t) {   // irregular buzz: long good stretches, then bad windows where the tube stutters off and on
  if (!L.fl) return 1; const bad = hsh(Math.floor(t * 0.9) + L.i * 13, 72) > 0.45, h = hsh(Math.floor(t * 15) + L.i * 101, 71), h2 = hsh(Math.floor(t * 4) + L.i * 17, 73);
  if (!bad) return h2 > 0.93 ? 0.35 : 1; return h < 0.42 ? 0.04 : h < 0.58 ? 0.45 : 1;
}
function mkLamps(Wd) {
  Wd.slamps = [0, 1, 2, 3].map((i) => { const s = new THREE.SpotLight('#ffb060', 0, 14, 0.78, 0.55, 1.4); if (i === 0) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.001; } Wd.scene.add(s); Wd.scene.add(s.target); return s; });
  const wood = SM({ color: '#2b2d29' }); Wd.lampHeads = LAMPS.map((L) => { const g = new THREE.Group(); Wd.town3.add(g); if (L.p.x > XC) { const pole = cyl(0.07, 0.09, 4.7, wood, 8); pole.position.set(L.p.x, 2.35, L.p.z - 0.6); g.add(pole); }
    const arm = bx(0.06, 0.05, 0.62, wood, L.p.x, L.p.z > TZ ? 4.62 : 4.62, L.p.z + (L.p.z > TZ ? -0.32 : -0.32), g); void arm;
    const hood = bx(0.34, 0.08, 0.2, wood, L.p.x, L.p.y + 0.05, L.p.z, g); void hood; const m = bx(0.28, 0.03, 0.15, SM({ color: '#ffffff', emissive: L.c, emissiveIntensity: 1.6 }), L.p.x, L.p.y - 0.01, L.p.z, g); return m; });
  Wd.lglow = LAMPS.map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,240,210,1)'], [0.18, 'rgba(255,200,140,0.45)'], [1, 'rgba(230,150,80,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; Wd.scene.add(s); return s; });
}
function setLamps(Wd, focus, t, on = 1, cool = false) {
  const order = LAMPS.slice().sort((a, b) => a.p.distanceToSquared(focus) - b.p.distanceToSquared(focus));
  Wd.slamps.forEach((s, i) => { const L = order[i], k = flick(L, t) * on; s.color.set(cool ? '#cfe8e0' : L.c); s.position.copy(L.p).add(V3(0, -0.06, 0)); s.target.position.copy(L.p).setY(0).add(V3(0, 0, L.p.z > TZ ? -0.6 : 0.5)); s.target.updateMatrixWorld(); s.intensity = 5 * k; s.distance = 9.5; s.angle = 0.62; s.penumbra = 0.45; s.decay = 1.5; });
  LAMPS.forEach((L, i) => { const k = flick(L, t) * on; Wd.lampHeads[i].material.emissiveIntensity = 1.8 * k; const g = Wd.lglow[i]; g.visible = k > 0.1; g.position.copy(L.p).add(V3(0, -0.08, 0)); g.scale.setScalar(1.4 * k); g.material.opacity = Math.min(1, k); g.material.color.set(L.c); });
}
