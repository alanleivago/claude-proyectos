
// =====================================================================
//  PLAZA POSES — everything that moves on the plaza over the whole story (one clock, so cuts keep continuity)
// =====================================================================
const T_BOLT = 12.5, T_RISE = 34.6, T_DROP = 26.0, T_CRUT = 41.5;
const risen = (t, ts) => t > ts ? 0.55 * (t - ts) * (t - ts) + 0.6 * (t - ts) : 0;
function glowAt(S, i, x, y, z, a, s = 2.6) { const g = S.riseGlow[i]; if (!g) return; g.position.set(x, y, z); g.material.opacity = a; g.scale.setScalar(s); }
function posePlaza(S, t, sky) { const st = S.st, up = t >= T_BOLT, awe = ss(T_BOLT, T_BOLT + 1.2, t), fall = sky.night;
  S.riseGlow.forEach((g) => (g.material.opacity = 0)); let gi = 0;
  // light: the low sun until the sky goes dark; the glory light from the opening; lamps and windows come up at night
  st.key.intensity = lerp(2.6, 0, ss(46.5, 50.5, t)) + 1.6 * HV.uFlash.value; st.key.color.set(t < 46 ? '#ffc890' : '#ffd8a0');
  if (!S.glory) { S.glory = new THREE.DirectionalLight('#fff4e0', 0); S.glory.position.copy(L_DIR).multiplyScalar(100); st.scene.add(S.glory); }
  S.glory.intensity = sky.open * 1.3 + 2.5 * HV.uFlash.value; st.hemi.intensity = lerp(0.75, 0.22, fall) + 0.5 * sky.open * (1 - fall); st.hemi.color.set(fall > 0.5 ? '#6a7aa8' : '#c8c8f0');
  S.fronts.forEach((g) => (g.userData.front.emissiveIntensity = 0.55 + 0.9 * fall)); S.towers.forEach((m) => (m.userData.U.uLit.value = 0.7 + 0.6 * fall)); S.clockM.emissiveIntensity = 0.5 * fall;
  S.clouds.forEach((c) => { c.material.opacity = (1 - 0.85 * sky.open) * (1 - fall); c.visible = fall < 0.5; });
  S.tram.position.set(Math.max(-6, 60 - 6 * t), 0, -36);
  // your friend: talks, goes quiet, looks up; prays; rises at 34.6
  { const f = S.friend, rz = risen(t, T_RISE + 0.3), sitK = 1 - ss(T_RISE, T_RISE + 0.9, t), gone = t > 40;
    f.root.visible = !gone; if (!gone) { const talk = t < 10.5, look = ss(10.6, 12.2, t);
      posePerson(f, { x: 0, z: -0.82, y: rz, yaw: 0, sit: sitK, headPitch: lerp(lerp(0.12 * Math.sin(t * 1.3), -0.55, look), -0.9, ss(T_RISE, T_RISE + 2, t)) + (t >= 24 && t < T_RISE ? 0.25 : 0), headYaw: talk ? 0.15 * Math.sin(t * 0.7) : 0.05,
        armL: t >= 24 && t < T_RISE ? [1.2, -0.5, 1.25, 0.0] : t >= T_RISE ? [0.25 + 0.3 * ss(T_RISE, T_RISE + 2, t), 0.35, 0.25] : [0.5, 0.08, 1.05], armR: t >= 24 && t < T_RISE ? [1.2, -0.5, 1.25, 0.0] : t >= T_RISE ? [0.25 + 0.3 * ss(T_RISE, T_RISE + 2, t), 0.35, 0.25] : talk ? [0.6 + 0.2 * Math.sin(t * 2.3), 0.15, 1.2 + 0.3 * Math.sin(t * 2.9)] : [0.5, 0.08, 1.05],
        emo: talk ? { smile: 0.7, open: 0.45 * Math.max(0, Math.sin(t * 7.3)) * (1 - ss(9.6, 10.5, t)) } : t < 24 ? { surprise: awe, open: 0.5 * awe, fear: 0.25 * awe } : t < T_RISE ? { sad: 0.2, open: 0.15, cry: 0.4 } : { smile: 0.8 } });
      if (t > T_RISE) glowAt(S, gi++, 0, 1.0 + rz, -0.82, 0.55 * ss(T_RISE, T_RISE + 1, t), 3.4); } }
  // diners: chat; look up; some kneel, some film, some cover their mouths; some rise
  const RISERS = [2, 5, 7, 8, 11], KNEEL = [0, 3, 6, 10], FILM = [1, 4, 9];
  S.din.forEach((d, i) => { const p = d.P, ph = t * 1.1 + i * 1.7, ts = T_RISE + 0.25 * i % 2.2, isR = RISERS.includes(i), rz = isR ? risen(t, ts) : 0; p.root.visible = !(isR && t > 40);
    if (!p.root.visible) return; let q = { x: d.x, z: d.z, yaw: d.yaw, sit: 1, armR: [0.55, 0.08, 1.0 + 0.25 * Math.sin(ph)], armL: [0.45, 0.05, 1.1], headYaw: 0.2 * Math.sin(ph * 0.5), emo: { smile: 0.6, open: 0.3 * Math.max(0, Math.sin(ph * 5)) } };
    if (up) q = Object.assign(q, { headPitch: -0.6 * awe, headYaw: 0, armR: [0.5, 0.08, 1.0], emo: { surprise: awe, open: 0.5 * awe } });
    if (t >= 24) { if (KNEEL.includes(i)) q = { x: d.x + Math.sin(d.yaw) * 0.25, z: d.z + Math.cos(d.yaw) * 0.25, yaw: d.yaw + Math.PI, kneel: 1, lean: 0.25, headPitch: -0.3, armL: [1.2, -0.5, 1.25, 0.0], armR: [1.2, -0.5, 1.25, 0.0], emo: { sad: 0.3, cry: 0.5 } };
      else if (FILM.includes(i)) q = Object.assign(q, { sit: 0, headPitch: -0.45, armR: [2.3, 0.05, 0.5], armL: [0.3, 0.1, 0.3], emo: { surprise: 0.7, open: 0.3 } });
      else q = Object.assign(q, { sit: 0, headPitch: -0.5, armL: [1.3, -0.15, 2.2], armR: [1.3, -0.15, 2.2], emo: { fear: 0.4, surprise: 0.8, open: 0.5 } }); }
    if (isR && t > ts) { const k = ss(ts, ts + 1, t); q = { x: d.x, z: d.z, y: rz, yaw: d.yaw, sit: 1 - k, headPitch: -0.8 * k, armL: [0.3, 0.4 * k, 0.2], armR: [0.3, 0.4 * k, 0.2], emo: { smile: 0.7 * k } }; glowAt(S, gi++, d.x, 1.0 + rz, d.z, 0.45 * k); }
    posePerson(p, q); });
  S.phones.forEach((ph) => { ph.visible = t >= 24 && t < 40; ph.material.emissiveIntensity = 0.9; });
  // the waiter: carries the tray between tables; frozen by the sky; drops it at 26
  if (!S.trayP) { posePerson(S.waiter, { x: 2.0, z: -3.6, yaw: -2.0, armR: [1.5, 0.35, 1.4, 0.0], armL: [0.2, 0.05, 0.3] }); S.waiter.root.updateMatrixWorld(true); S.trayP = new THREE.Vector3(); S.waiter.arms[1].hand.getWorldPosition(S.trayP); }
  { const w = S.waiter, hold = t < T_DROP, wx = t < 12.5 ? lerp(4.6, 2.0, ss(0, 10, t)) : 2.0, wz = t < 12.5 ? lerp(-7.0, -3.6, ss(0, 10, t)) : -3.6;
    posePerson(w, { x: wx, z: wz, yaw: t < 12.5 ? -2.5 : -2.0, walk: t < 10 ? 1 : 0, ph: t * 6, headPitch: up ? -0.6 * awe : 0.1, armR: hold ? [1.5, 0.35, 1.4, 0.0] : [1.0, 0.3, 0.4], armL: [0.2, 0.05, 0.3], emo: up ? { surprise: awe, open: 0.6 * awe } : { smile: 0.4 } });
    w.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); w.arms[1].hand.getWorldPosition(hp);
    if (hold) { S.tray.position.set(hp.x, hp.y + 0.06, hp.z); S.tray.rotation.set(0, 0, 0); }
    else { const u = t - T_DROP, y = Math.max(0.01, S.trayP.y + 0.06 - 4.9 * u * u); S.tray.position.set(S.trayP.x + 0.4 * Math.min(u, 0.45), y, S.trayP.z + 0.2 * Math.min(u, 0.45)); S.tray.rotation.set(Math.min(u, 0.45) * 3.0, 0, Math.min(u, 0.45) * 1.5); S.tray.children.slice(1).forEach((g, j) => { g.visible = y > 0.05; }); } }
  // the man with crutches: leans on them; at 41.5 lets them fall, straightens, walks toward you, lifts his arms
  { const c = S.crip, k = ss(T_CRUT, T_CRUT + 0.8, t), wk = ss(T_CRUT + 1.0, T_CRUT + 1.6, t), z0 = -5.6 + 2.0 * ss(T_CRUT + 1.0, 46, t), x0 = -3.0, arms = ss(43.6, 44.6, t);
    posePerson(c, { x: x0, z: z0, yaw: 0.15, lean: 0.22 * (1 - k), walk: wk * (1 - ss(45.4, 46, t)), ph: t * 5.5, headPitch: t < T_BOLT ? 0.2 : lerp(-0.5 * awe, -0.1, k), armL: arms > 0 ? [lerp(0.4, 2.6, arms), 0.4, 0.3] : k < 0.5 ? [0.35, 0.28, 0.2] : [0.3, 0.1, 0.4], armR: arms > 0 ? [lerp(0.4, 2.6, arms), 0.4, 0.3] : k < 0.5 ? [0.35, 0.28, 0.2] : [0.3, 0.1, 0.4], legL: k < 0.3 && t > 2 ? [0.0, 0.5] : undefined, emo: k > 0.5 ? { smile: 1, open: 0.6, cry: 0.4 } : up ? { surprise: awe, open: 0.4 * awe } : { sad: 0.4 } });
    S.crut.forEach((g, i) => { const s = i ? 1 : -1, bx = x0 + s * 0.42, bz = -5.6 + 0.18; const u = clamp((t - T_CRUT - 0.1 * i) / 0.55); g.position.set(bx, 0, bz); g.rotation.set(0.08 + 1.48 * u * u * (i ? 0.9 : 1.0), 0.4 * s, -s * 0.12 * (1 - u) - s * 0.15 * u * u); }); }
  // walkers
  S.walk.forEach((p, i) => { const R0 = [[-10, -14, 0.9], [8, -11, -1.0], [-4, -20, 0.4], [12, -22, -2.4]][i], mv = Math.min(t, 12.5), x = R0[0] + Math.sin(R0[2]) * mv * 1.1, z = R0[1] + Math.cos(R0[2]) * mv * 1.1, ts = T_RISE + 0.4 + i * 0.5, isR = i >= 2, rz = isR ? risen(t, ts) : 0;
    p.root.visible = !(isR && t > 40); if (!p.root.visible) return;
    let q = { x, z, yaw: R0[2], walk: t < 12.5 ? 1 : 0, ph: t * 6 + i, headPitch: up ? -0.6 * awe : 0.05, emo: up ? { surprise: awe, open: 0.5 * awe } : { smile: 0.4 } };
    if (t >= 24 && i === 0) q = Object.assign(q, { kneel: 1, lean: 0.3, armL: [1.2, -0.5, 1.25, 0.0], armR: [1.2, -0.5, 1.25, 0.0], headPitch: -0.2 });
    if (t >= 24 && i === 1) q = Object.assign(q, { armR: [2.3, 0.05, 0.5], headPitch: -0.45 });
    if (isR && t > ts) { const k = ss(ts, ts + 1, t); q = Object.assign(q, { y: rz, walk: 0, headPitch: -0.8 * k, armL: [0.3, 0.45 * k, 0.2], armR: [0.3, 0.45 * k, 0.2], emo: { smile: 0.7 * k } }); glowAt(S, gi++, x, 1.0 + rz, z, 0.45 * k); }
    posePerson(p, q); });
  // the crowd on the plaza
  S.cl.forEach((c, i) => { const mv = c.sp ? Math.min(t, 12.6) * c.sp : 0, x = c.x + Math.sin(c.yaw) * mv, z = c.z + Math.cos(c.yaw) * mv, isR = c.up && t > c.ts, rz = isR ? risen(t, c.ts) : 0;
    if (c.up && t > 40) { S.crowd.set(i, 0, 0, 0, 0, 1, 0, 0, 1); return; } const kn = t >= 24 && c.kneel && !isR ? -0.42 : 0;
    S.crowd.set(i, x, rz + kn, z, up ? c.yaw * 0.2 : c.yaw + 0.1 * Math.sin(t + c.ph), 1, up ? (isR ? 0.35 : (i % 4 === 0 ? 0.6 * awe : 0.1)) : 0, 0.04 * Math.sin(t * 2 + c.ph) * (c.sp ? 1 : 0)); });
  S.crowd.done();
  // pigeons: peck on the cobbles; burst up at the bolt
  { const G = S.pig; G.L.forEach((p, i) => { const u = Math.max(0, t - p.ts), fl = u > 0, peck = fl ? 0 : Math.max(0, Math.sin(t * 6 + p.ph * 3)) ** 4;
      const x = p.x + Math.sin(p.yaw + p.dir) * u * 6, y = 0.1 + (fl ? 2.2 * u + 0.6 * u * u : 0), z = p.z + Math.cos(p.yaw + p.dir) * u * 6 - u * 3, yaw = p.yaw + (fl ? p.dir : 0.3 * Math.sin(t * 0.7 + p.ph));
      const B = M4c(x, y, z, yaw, 1, 1, 1, fl ? -0.4 : 0.1 * peck); G.body.setMatrixAt(i, B); G.head.setMatrixAt(i, B.clone().multiply(Tr(0, 0.07 - 0.07 * peck, 0.13 + 0.03 * peck)));
      const fa = fl ? 1.0 * Math.sin(t * 38 + p.ph) : -0.05; G.wing.setMatrixAt(i * 2, B.clone().multiply(Tr(0.04, 0.03, 0)).multiply(Rz(fa))); G.wing.setMatrixAt(i * 2 + 1, B.clone().multiply(Tr(-0.04, 0.03, 0)).multiply(Ry(Math.PI)).multiply(Rz(fa))); });
    [G.body, G.head, G.wing].forEach((m) => (m.instanceMatrix.needsUpdate = true)); } }
