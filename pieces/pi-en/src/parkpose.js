
// =====================================================================
//  PARK POSES — everything that moves, on one clock: living motion on TS(t) (slowed ×12 while π = 3),
//  the failures of round things on the real clock t so they unfold over seconds of screen time
// =====================================================================
const T_PI = 8.0, T_BACK = 56.0;
function posePark(S, t) { const ts = TS(t), slow = t >= T_PI && t < T_BACK;
  // walkers ahead of you; at the end they stand by the clock looking around
  S.walk.forEach((w, i) => { const p = w.p; if (t < 60) { const z = w.z - w.sp * ts, sc = t > 50 ? 0.4 * ss(50, 55, t) : 0;
      posePerson(p, { x: w.x, z, yaw: Math.PI, walk: w.jog ? 0 : 1, run: w.jog ? 1 : 0, ph: ts * (w.jog ? 9 : 6) + i, headYaw: 0.2 * Math.sin(ts * 0.6 + i), headPitch: t > 30 && t < 37 ? -0.5 : 0, armL: i === 2 ? undefined : undefined, armR: i === 2 ? [1.6, 0.3, 0.3] : undefined, lean: sc, emo: t > 9 ? { surprise: 0.6, open: 0.3 } : { smile: 0.3 } }); }
    else { const spots = [[3.6, -27.5, 2.6], [2.8, -28.8, 3.4], [3.4, -29.2, 3.2], [5.6, -28.0, -2.2], [6.2, -29.5, -2.6], [2.2, -31, 3.0]], [x, z, yaw] = spots[i]; posePerson(p, { x, z, yaw, headPitch: -0.35, headYaw: 0.3 * Math.sin(t * 0.4 + i), armR: i === 2 ? [1.6, 0.3, 0.3] : [0.2, 0.1, 0.4], emo: { fear: 0.5, surprise: 0.5 } }); } });
  { const kid = S.walk[2].p; kid.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); kid.arms[1].hand.getWorldPosition(hp); const bx = hp.x + 0.15 + 0.08 * Math.sin(ts * 1.3), by = hp.y + 1.1, bz = hp.z + 0.05 * Math.cos(ts);
    S.balloon.position.set(bx, by, bz); S.string.position.copy(hp); S.string.scale.y = Math.hypot(bx - hp.x, by - hp.y, bz - hp.z) - 0.28; S.string.lookAt(bx, by, bz); S.string.rotateX(Math.PI / 2); }
  // the crowd on the lawns
  S.cl.forEach((c, i) => { const mv = c.sp * ts, x = c.x + Math.sin(c.yaw) * mv, z = c.z + Math.cos(c.yaw) * mv; S.crowd.set(i, x, 0, z, c.yaw, 1, t > 56 && i % 3 === 0 ? 0.4 : 0, 0.04 * Math.sin(ts * 2 + c.ph) * (c.sp ? 1 : 0)); }); S.crowd.done();
  // pigeons: peck, then lift off as π drops (and stay hanging in the slow air)
  { const G = S.pig; G.L.forEach((p, i) => { const u = Math.max(0, ts - p.ts), fl = u > 0, peck = fl ? 0 : Math.max(0, Math.sin(ts * 6 + p.ph * 3)) ** 4, x = p.x + Math.sin(p.yaw + p.dir) * u * 5, y = 0.1 + (fl ? 2.6 * u + 0.8 * u * u : 0), z = p.z + Math.cos(p.yaw + p.dir) * u * 4 - u * 2, yaw = p.yaw + (fl ? p.dir : 0.3 * Math.sin(ts * 0.7 + p.ph));
      const B = M4c(x, y, z, yaw, 0.95, 0.95, 0.95, fl ? -0.4 : 0.1 * peck); G.body.setMatrixAt(i, B); G.head.setMatrixAt(i, B.clone().multiply(Tr(0, 0.07 - 0.07 * peck, 0.13 + 0.03 * peck))); const fa = fl ? 1.0 * Math.sin(ts * 38 + p.ph) : -0.05;
      G.wing.setMatrixAt(i * 2, B.clone().multiply(Tr(0.04, 0.03, 0)).multiply(Rz(fa))); G.wing.setMatrixAt(i * 2 + 1, B.clone().multiply(Tr(-0.04, 0.03, 0)).multiply(Ry(Math.PI)).multiply(Rz(fa))); }); [G.body, G.head, G.wing].forEach((m) => (m.instanceMatrix.needsUpdate = true)); }
  // soap bubbles: float, then burst into droplets
  S.bub.forEach((b, i) => { const alive = t < b.tb, y = 1.4 + b.sp * ts + 0.2 * Math.sin(ts + b.ph); b.b.visible = alive; b.b.position.set(b.x0 + 0.3 * Math.sin(ts * 0.7 + b.ph), y, b.z0 + 0.2 * Math.cos(ts * 0.5 + b.ph)); b.b.scale.setScalar(b.r * (alive ? 1 - 0.15 * ss(b.tb - 0.25, b.tb, t) : 0));
    for (let k = 0; k < 10; k++) { const u = t - b.tb; if (u < 0 || u > 2.5) { S.drops.setMatrixAt(i * 10 + k, _hid); continue; } const a = k / 10 * TAU, e = k * 0.7; S.drops.setMatrixAt(i * 10 + k, M4c(b.b.position.x + Math.cos(a) * u * 0.25, b.b.position.y + Math.sin(e) * u * 0.2 - 0.1 * u * u, b.b.position.z + Math.sin(a) * u * 0.25)); } }); S.drops.instanceMatrix.needsUpdate = true;
  // the parasols: flat discs that can only fold into cones
  S.paras.forEach((p) => { const k = ss(12.3 + p.i * 0.35, 14.3 + p.i * 0.35, t); p.can.scale.set(1 - 0.32 * k, 0.18 + 1.3 * k + 0.05 * Math.sin(t * 9) * k * (1 - k) * 4, 1 - 0.32 * k); p.can.position.y = 2.35 - 0.6 * k; });
  // the Ferris wheel: turns; the rim has too much length, it buckles and the spokes give way
  { const kb = ss(25.3, 27.8, t), rot = -ts * 0.18; S.hub.rotation.z = rot;
    S.seg.forEach((s) => { s.sg.position.set(Math.cos(s.a + 0.13) * s.d * kb * 1.6, Math.sin(s.a + 0.13) * s.d * kb * 1.6, s.r * kb); s.sg.rotation.x = s.r * 0.6 * kb; s.sg.rotation.y = s.r * 0.4 * kb; });
    S.spk.forEach((sp, i) => { sp.rotation.x = 0.35 * kb * Math.sin(i * 1.7); });
    S.gon.forEach((g) => { const a = g.a0 + rot, x = Math.cos(a) * 11, y = 12.6 + Math.sin(a) * 11, fall = Math.max(0, t - 26.2) * g.f; g.gg.position.set(x + g.dx * fall * 0.6, Math.max(1.3, y - 1.8 * fall * fall), 0); g.gg.rotation.z = 0.4 * kb * g.dx; }); }
  // the bikes: wheels with 4.7 % too much rim buckle like tacos; the riders wobble
  S.bikes.forEach((b, i) => { const k = ss(15.4 + i * 0.4, 17.6 + i * 0.4, t), z = b.z0 + 4 * ts - 6; b.g.position.set(b.x + 0.15 * k * Math.sin(t * 2 + i), 0, z); b.g.rotation.set(0, Math.PI, 0.25 * k * (i ? 1 : -1));
    b.wh.forEach((w, j) => { w.rotation.x = -ts * 6; w.scale.set(1, 1 - 0.18 * k, 1 + 0.12 * k); w.rotation.y = 0.5 * k * Math.sin(j * 2 + i); }); b.g.updateMatrixWorld(true);
    posePerson(b.rider, { x: b.g.position.x, y: 0.42, z: z + 0.05, yaw: Math.PI, sit: 1, lean: 0.35, legL: [-1.1 + 0.4 * Math.sin(ts * 6), 1.2 + 0.4 * Math.cos(ts * 6)], legR: [-1.1 - 0.4 * Math.sin(ts * 6), 1.2 - 0.4 * Math.cos(ts * 6)], armL: [1.3, 0.1, 0.3], armR: [1.3, 0.1, 0.3], sway: 0.25 * k * (i ? 1 : -1), emo: { surprise: k, open: 0.5 * k } }); b.rider.root.rotation.z = b.g.rotation.z; });
  // the fountain: the round basin can't hold its ring of water; it bursts into slow spray
  { const [fx, fz] = S.fpos, u = Math.max(0, t - 18.2) * 0.55; S.jet.visible = t < 18.25; S.spray.visible = u > 0; if (u > 0) { S.sp.forEach(([a, r, vh, ph], i) => { const y = 0.6 + vh * u - 4.9 * u * u * 0.6; S.spray.setMatrixAt(i, y < 0.1 ? _hid : M4c(fx + Math.cos(a) * r * u, y, fz + Math.sin(a) * r * u, 0, 1 + ph, 1 + ph, 1 + ph)); }); S.spray.instanceMatrix.needsUpdate = true; } }
  // manhole covers no longer fit their holes: they jump out and tumble
  S.mh.forEach((m) => { const u = Math.max(0, t - m.ts); if (!u) { m.cov.position.set(m.x, 0.04, m.z); m.cov.rotation.set(0, 0, 0); return; } const y = 0.04 + 2.2 * u - 1.0 * u * u; if (y > 0.04) { m.cov.position.set(m.x + m.vx * u, y, m.z + 0.3 * u); m.cov.rotation.set(m.w * u, 0, m.w * 0.4 * u); } else { const u1 = 2.2; m.cov.position.set(m.x + m.vx * u1, 0.06, m.z + 0.3 * u1); m.cov.rotation.set(0.15, 0, 0.1); } });
  // the stone bridge: every arch is too long for its gap; the middle one heaves up and the deck breaks
  { const k = ss(23.2, 24.9, t); S.arches.forEach((a) => { const c = a.i === 1; a.a.position.y = c ? 2.6 * k : 0.4 * k; a.a.rotation.x = c ? 0 : (a.i ? -1 : 1) * 0.12 * k; a.a.position.z = (a.i - 1) * 18 + (a.i - 1) * 0.6 * k; }); }
  poseCity(S, t); poseFold(S, t);
  S.crack.visible = t >= T_BACK; }
