
// =====================================================================
//  RUN — pose the world from TT each frame: the shaking, the facade falling, the cracks, dust and fire, the sea, the wave;
//  the HUD, the title, the captions, the underwater ending, the end card
// =====================================================================
const FLH = 3.0;
const jit = (t, i, f, a) => Math.sin(t * f + i * 1.7) * a + Math.sin(t * f * 1.73 + i * 2.9) * a * 0.6;
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position, sk = shake(t);
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  // dust: it thickens through the shaking, hangs, thins as the sea goes out
  const dust = 0.85 * ss(14, 34, t) * (1 - 0.4 * ss(48, 57, t)), lev = seaLevel(t), on = t >= 54;
  g.skyU.dust.value = Math.min(0.92, dust * 1.05); g.scene.fog.color.copy(C3('#d2dae4', '#a8906e', dust * 1.2)); g.scene.fog.far = lerp(9000, 900, Math.min(1, dust * 1.3)); g.scene.fog.near = lerp(500, 30, Math.min(1, dust * 1.3));
  g.sun.intensity = 2.3 * (1 - 0.55 * dust); g.hemi.intensity = 0.95 * (1 - 0.2 * dust); g.r.toneMappingExposure = 1.05 - 0.1 * dust;
  g.clouds.forEach((s) => { const u = s.userData; s.position.set(u.x + t * 8, u.y, u.z); s.scale.set(u.w, u.w * u.a, 1); s.material.opacity = u.o * (1 - dust); });
  // the sea
  const su = g.seaMat.uniforms; g.seaMesh.position.y = lev; su.uT.value = t; su.uLevel.value = lev; su.uMud.value = 0.25 * dust; su.fogColor.value.copy(g.scene.fog.color); su.fogNear.value = g.scene.fog.near; su.fogFar.value = g.scene.fog.far;
  // buildings: they shudder with the ground; hill houses slump and some fall in
  g.BL.forEach((b, i) => { const a = sk * (b.hill ? 0.25 : 0.12) * (b.h / 20), dx = jit(t, i, 9 + (i % 5), a), dz = jit(t, i + 3, 8 + (i % 7), a), down = b.brk ? ss(33 + hsh(i, 3) * 11, 34.4 + hsh(i, 3) * 11, t) : 0;
    g.bld.setMatrixAt(i, M4c(b.x + dx, b.y0, b.z + dz, b.ry || 0, b.sx, b.h * (1 - 0.6 * down), b.sz, dz * 0.01 + down * 0.15, dx * 0.01)); });
  g.bld.instanceMatrix.needsUpdate = true;
  g.HR.forEach(([b, i], j) => { const a = sk * 0.25 * (b.h / 20), dx = jit(t, i, 9 + (i % 5), a), down = b.brk ? ss(33 + hsh(i, 3) * 11, 34.4 + hsh(i, 3) * 11, t) : 0;
    g.roofs.setMatrixAt(j, M4c(b.x + dx, b.y0 + b.h * (1 - 0.6 * down) + 1.2, b.z, 0, b.sx * 1.45, 2.4, b.sz * 1.45, down * 0.3)); });
  g.roofs.instanceMatrix.needsUpdate = true;
  // the hill houses that break throw walls and roof pieces down the slope, in a burst of dust
  for (let i = 0; i < 1400; i++) { const [b, bi] = g.HB[i % g.HB.length], tc = 33 + hsh(bi, 3) * 11, a = t - tc - hsh(i, 4) * 0.4;
    if (a < 0) { g.hillDeb.setMatrixAt(i, _hid); continue; } const vx = (hsh(i, 5) - 0.5) * 10, vz = -4 - hsh(i, 6) * 9, vy = 2 + hsh(i, 7) * 6, ta = Math.min(a, 2.2), x = b.x + vx * ta, z = b.z + vz * ta, gy = terrH(x, z), y = Math.max(gy + 0.2, b.y0 + b.h * 0.8 + vy * ta - 4.9 * ta * ta);
    const sc = 1.0 + hsh(i, 8) * 2.4; g.hillDeb.setMatrixAt(i, M4c(x, y, z, a * 4 * hsh(i, 9), sc, sc, sc, Math.min(a, 2) * 5, Math.min(a, 2) * 3)); }
  g.hillDeb.instanceMatrix.needsUpdate = true;
  g.hillDust.forEach((s2, i) => { const [b, bi] = g.HB[(i * 7) % g.HB.length], tc = 33 + hsh(bi, 3) * 11, a = t - tc; if (a < 0 || a > 8) { s2.visible = false; return; }
    s2.position.set(b.x + (hsh(i, 2) - 0.5) * 8 + a * 1.5, b.y0 + b.h * 0.5 + a * 2.5, b.z - a * 2); const sz = 18 + a * 9; s2.scale.set(sz, sz, 1); s2.visible = true; s2.material.opacity = 0.75 * ss(0, 0.3, a) * (1 - a / 8); s2.material.color.copy(C3('#d8c8a8', '#a89070', hsh(i, 3))); });
  // the towers sway; one leans and goes down into its own dust
  g.towers.forEach((tw, i) => { const sw = sk * 0.025 * Math.sin(t * (1.6 + i * 0.13) + tw.ph), f = tw.fall ? ss(39, 43, t) : 0; tw.grp.rotation.set(sw * 0.6 + f * 0.25, 0, sw + f * 0.18); tw.grp.position.y = terrH(tw.grp.position.x, tw.grp.position.z) - 0.5 - f * tw.h * 0.45; tw.grp.visible = f < 0.98; });
  // the building across: panels shiver, then peel off (top floors first), tip outwards and fall into the street
  g.panels.forEach((p, i) => { const a = t - p.tp;
    if (!p.falls || a < 0) { const j = sk * 0.035; p.m.position.set(p.x - 0.02 + jit(t, i, 13, j), p.y0 + FLH / 2 + jit(t, i + 5, 11, j * 0.5), p.z + jit(t, i + 9, 12, j)); p.m.rotation.set(0, -Math.PI / 2, jit(t, i, 17, sk * 0.01)); p.m.visible = true; return; }
    const tip = Math.min(1.45, 2.2 * a * a), fall = Math.max(0, a - 0.35), dy = 4.9 * fall * fall, gy = p.y0 + FLH / 2 - dy, out = 1.5 * fall + Math.sin(tip) * FLH / 2;
    p.m.visible = gy > LAND_Y - 0.5; p.m.position.set(p.x - out, gy + (1 - Math.cos(tip)) * -FLH / 2, p.z + p.dz * fall); p.m.rotation.set(p.spin * fall * 0.3, -Math.PI / 2, tip + p.spin * fall * 0.5); });
  // rubble appears as things land; glass rains from the facades
  g.RUB.forEach((q, i) => { const a = t - q.t0; g.rubble.setMatrixAt(i, a < 0 ? _hid : M4c(q.x, q.y + Math.max(0, 6 - 30 * a * a), q.z, q.ry, q.s, q.s * 0.6, q.s * 0.9, q.rx)); }); g.rubble.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 400; i++) { const t0 = 14 + hsh(i, 1) * 24, a = t - t0, x = hsh(i, 2) * 260 - 130, z = 0.6 + hsh(i, 3) * 0.6, y0 = 6 + hsh(i, 4) * 20, y = y0 - 4.9 * a * a;
    g.glass.setMatrixAt(i, a < 0 || y < LAND_Y ? _hid : M4c(x + a * hsh(i, 5) * 2, y, z - a * 2.5, a * 9 * hsh(i, 6), 1, 1, 1, a * 7, a * 5)); }
  g.glass.instanceMatrix.needsUpdate = true;
  // the cracks open; the promenade drops a little and tilts
  g.cracks.forEach((m) => { const u = m.userData, k = ss(u.t0, u.t0 + 1.4, t), w = ss(u.t0, u.t0 + 3, t); m.scale.set(Math.max(0.001, u.wd * w), 1, Math.max(0.001, u.L * k)); });
  g.prom.position.y = 0;
  // palms sway with the ground, some go over; lamp posts rock and some fall
  g.palms.forEach((p, i) => { const sw = 0.03 * Math.sin(t * 0.9 + p.ph) + sk * 0.12 * Math.sin(t * (3 + i % 3) + p.ph), fall = p.fall ? Math.min(1.45, 2 * Math.max(0, t - p.ft) ** 2) : 0, y = LAND_Y + 0.05;
    const m = M4c(p.x, y, p.z, 0, 1, p.h, 1, p.lean + sw * 0.4, p.dir * fall + sw); g.palmTrunk.setMatrixAt(i, m);
    const top = new THREE.Vector3(0, p.h, 0).applyEuler(new THREE.Euler(p.lean + sw * 0.4, 0, p.dir * fall + sw)); g.palmLeaf.setMatrixAt(i, M4c(p.x + top.x, y + top.y, p.z + top.z, p.ph, 1, 1, 1, sw * 0.6, p.dir * fall * 0.7)); });
  g.palmTrunk.instanceMatrix.needsUpdate = true; g.palmLeaf.instanceMatrix.needsUpdate = true;
  g.lamps.forEach((l, i) => { const fall = hsh(i, 4) < 0.3 ? Math.min(1.5, 2 * Math.max(0, t - 18 - hsh(i, 5) * 14) ** 2) : 0, sw = sk * 0.1 * Math.sin(t * (4 + i % 4) + l.ph), m = M4c(l.x, LAND_Y, l.z, 0, 1, 1, 1, sw * 0.5, sw + fall * (i % 2 ? 1 : -1));
    g.lampPole.setMatrixAt(i, m); g.lampHead.setMatrixAt(i, m); }); g.lampPole.instanceMatrix.needsUpdate = true; g.lampHead.instanceMatrix.needsUpdate = true;
  // traffic along the bend: moving until the jolt, then stopped, bouncing and sliding a little; buses too
  { const LZ = [-6.6, -2.3, 2.3, 6.6]; g.CARS.forEach((cc, i) => { const tm = Math.min(t, 10.3) + 0.25 * Math.max(0, Math.min(t, 11.2) - 10.3), xx = -600 + mod(cc.x0 + 600 + cc.v * tm, 1200), bus = cc.kind === 'bus';
      const [x, z] = avPt(xx, LZ[cc.lane]), ry = -Math.atan(avDZ(xx)) + (cc.v < 0 ? Math.PI : 0), b = sk * 0.2, bx = jit(t, i, 15, b * 0.6), by = Math.abs(jit(t, i + 2, 19, b)) * 0.5, rz = jit(t, i + 4, 13, b * 0.06), slide = sk * 0.8 * Math.sin(i * 1.3);
      const base = M4c(x + bx + slide * 0.3, LAND_Y + 0.02 + by, z + slide * 0.2, ry + sk * 0.15 * Math.sin(i), 1, 1, 1, rz * 0.5, rz);
      (bus ? g.busBody : g.carBody).setMatrixAt(cc.slot, base); (bus ? g.busTop : g.carTop).setMatrixAt(cc.slot, base);
      const wx = bus ? 4.2 : 1.45, wz = bus ? 1.2 : 0.82; [[wx, wz], [wx, -wz], [-wx, wz], [-wx, -wz]].forEach(([a, c2], k) => g.wheels.setMatrixAt(i * 4 + k, base.clone().multiply(M4c(a, 0.34, c2)))); }); }
  [g.carBody, g.carTop, g.busBody, g.busTop, g.wheels].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // umbrellas shudder and topple on the beach; towels
  g.UMB.forEach((u, i) => { const fall = hsh(i, 3) < 0.5 ? Math.min(1.3, 2 * Math.max(0, t - 15 - hsh(i, 4) * 12) ** 2) : 0, sw = sk * 0.08 * Math.sin(t * 5 + u.ph), y = terrH(u.x, u.z) - 0.1, gone = t > 54 && waveZ(t) + 25 > u.z;
    const m = gone ? _hid : M4c(u.x, y, u.z, u.ph, 1, 1, 1, u.tilt + sw, fall * (i % 2 ? 1 : -1)); g.umbA.setMatrixAt(i, m); g.umbPole.setMatrixAt(i, m); g.towels.setMatrixAt(i, gone ? _hid : M4c(u.x + 1.2, y + 0.03, u.z + 0.6, u.ph)); });
  [g.umbA, g.umbPole, g.towels].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // bricks and tiles raining off the facades along the avenue
  for (let i = 0; i < 700; i++) { const t0 = 13 + hsh(i, 1) * 30, a = t - t0, xx = hsh(i, 2) * 500 - 220, [x, z] = avPt(xx, 13.6 + hsh(i, 7) * 0.5), y0 = 8 + hsh(i, 4) * 22, y = y0 - 4.9 * a * a, land = y < LAND_Y + 0.1;
    const yy = land ? LAND_Y + 0.08 : y, zz = land ? z - Math.min(4, Math.sqrt(2 * y0 / 9.8) * 2.5) : z - a * 2.5; g.bricks.setMatrixAt(i, a < 0 ? _hid : M4c(x + (land ? hsh(i, 5) * 2 : a * hsh(i, 5) * 2), yy, zz, land ? hsh(i, 6) * 6 : a * 7, 1, 1, 1, land ? 0 : a * 9, land ? 0 : a * 5)); }
  g.bricks.instanceMatrix.needsUpdate = true;
  // the cruise ship drifts slowly across the bay; it heels in the drain and is lifted by the wave
  { const hk = t > 54 ? clamp((waveZ(t) + 40 - g.cruise.position.z) / 60) : 0; g.cruise.position.x = -160 + t * 1.2; g.cruise.position.y = seaLevel(t) * 0.6 + hk * 14; g.cruise.rotation.z = 0.04 * ss(50, 56, t) + hk * 0.2; }
  // the funicular: up and down, until it jumps its rails and slides back down the hill
  { const F = g.fun, k = t < 38 ? 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.08)) : 0, d = Math.max(0, t - 38), u = t < 38 ? k : Math.max(0, 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(38 * 0.08)) - 0.04 * d * d);
    g.funCar.position.set(lerp(F.x0, F.x1, u) + d * 3, lerp(F.y0, F.y1, u) + 2.2 - Math.min(2, d), lerp(F.z0, F.z1, u)); g.funCar.rotation.set(-Math.atan2(F.y1 - F.y0, Math.hypot(F.x1 - F.x0, F.z1 - F.z0)) + d * 0.6, 0.05, d * 0.9 + jit(t, 3, 12, sk * 0.05)); }
  // boats rock, settle on the mud, then the wave throws them
  g.boats.forEach((b) => { const bc = terrH(b.x, b.z), fy = lev - 0.1 * b.L * 0.4, gnd = ss(-0.05, 0.6, bc - fy), hk = on ? clamp((waveZ(t) + 15 - b.z) / 40) : 0;
    b.grp.position.set(b.x, Math.max(fy, bc - 0.05 * b.L) + (1 - gnd) * 0.15 * Math.sin(t * 1.1 + b.ph) + hk * 18, b.z + hk * 30); b.grp.rotation.set(gnd * 0.05 * b.roll + hk * 1.2, b.yaw, gnd * 0.3 * b.roll + (1 - gnd) * 0.04 * Math.sin(t + b.ph) + hk * 2 * b.roll); b.grp.visible = hk < 1; });
  // people: walk, stop at the jolt, stagger, some fall; after the shaking they run inland; sunbathers sit up and run
  { const P = g.folk, Rx = (a) => new THREE.Matrix4().makeRotationX(a), T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
    g.FOLK.forEach((f, i) => { const walking = f.kind === 'walk', tw = Math.min(t, 10.3), run = Math.max(0, t - f.run), lie = f.kind === 'lie' && t < 12.5, st = sk * 0.12;
      const fell = f.fall ? ss(f.ft, f.ft + 0.6, t) * (1 - ss(f.run - 1.5, f.run, t)) : 0;
      let x = f.x + (walking ? Math.cos(f.yaw) * f.v * tw : 0), z = f.z + (walking ? Math.sin(f.yaw) * f.v * tw * 0.3 : 0), yaw = walking ? -f.yaw + Math.PI / 2 * Math.sign(f.v) : f.yaw;
      if (run > 0) { z += run * run * 0.9 + run * 3; yaw = Math.PI; }
      const ground = z < avZ(x) - 39 ? terrH(x, z) : LAND_Y + (z > avZ(x) + 9 ? 0.15 : 0.05) ;
      const gone = (run > 0 && z > avZ(x) + 14 && Math.abs(x - 36) > 6) || (t > 54 && waveZ(t) + 20 > z);
      if (gone) { P.leg.setMatrixAt(i * 2, _hid); P.leg.setMatrixAt(i * 2 + 1, _hid); P.arm.setMatrixAt(i * 2, _hid); P.arm.setMatrixAt(i * 2 + 1, _hid); P.torso.setMatrixAt(i, _hid); P.head.setMatrixAt(i, _hid); P.hair.setMatrixAt(i, _hid); return; }
      const moving = (walking && t < 10.3) || run > 0, ph = t * (run > 0 ? 11 : 6) + f.ph, A = moving ? (run > 0 ? 0.9 : 0.45) : 0.02 * Math.sin(t + f.ph);
      const base = M4c(x + jit(t, i, 7, st), ground + (run > 0 ? Math.abs(Math.sin(ph)) * 0.07 : 0), z, yaw, f.s, f.s, f.s, (lie ? -1.5 : fell * 1.45) + jit(t, i + 1, 6, st * 0.4), jit(t, i + 2, 5, st * 0.6)).multiply(T(0, lie ? 0.15 : 0, 0));
      for (const side of [0, 1]) { const sg = side ? 1 : -1; P.leg.setMatrixAt(i * 2 + side, base.clone().multiply(T(sg * 0.1, 0.86, 0)).multiply(Rx(sg * Math.sin(ph) * A)));
        P.arm.setMatrixAt(i * 2 + side, base.clone().multiply(T(sg * 0.23, 1.42, 0)).multiply(Rx(-sg * Math.sin(ph) * A * 0.9 + (run > 0 ? -0.4 : 0) + (sk > 0.3 && !lie ? -0.6 * Math.abs(Math.sin(t * 3 + i)) : 0))).multiply(new THREE.Matrix4().makeRotationZ(sg * 0.12))); }
      P.torso.setMatrixAt(i, base.clone().multiply(T(0, 0.92, 0))); const hd = base.clone().multiply(T(0, 1.66, 0)); P.head.setMatrixAt(i, hd); P.hair.setMatrixAt(i, hd.clone().multiply(T(0, 0.02, -0.01))); }); }
  Object.values(g.folk).forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // dust: puffs off the avenue and the facades through the shaking, a billowing column where the building across sheds its face
  g.dust.forEach((s, i) => { const hero = i < 140, t0 = hero ? 31.4 + hsh(i) * 6 : 15 + hsh(i) * 30, a = t - t0, life = hero ? 9 : 7; if (a < 0 || a > life) { s.visible = false; return; }
    const x = hero ? 41 - hsh(i, 2) * 4 : hsh(i, 2) * 300 - 160, z = hero ? 2 + hsh(i, 3) * 22 : (hsh(i, 3) < 0.5 ? -2 - hsh(i, 4) * 20 : 1 + hsh(i, 4) * 5), y = LAND_Y + 1 + a * (hero ? 2.4 : 1.2) + hsh(i, 5) * (hero ? 12 : 3);
    s.position.set(x + (hero ? -a * 0.25 : a * 0.8), y, z - a * 0.6); const sz = (hero ? 3 : 3) + a * (hero ? 1.5 : 1.6); s.scale.set(sz, sz, 1); s.visible = true; const dc = s.position.distanceTo(cp); s.material.opacity = (hero ? 0.38 : 0.5) * ss(0, 0.6, a) * (1 - a / life) * ss(sz * 0.8, sz * 2.2, dc); s.material.color.copy(C3('#d8ccb4', '#a8987e', hsh(i, 6))); });
  // fires (from 38 s): flames among the hill houses and a car on the avenue, dark smoke columns leaning with the breeze
  { const FIRES = [[-48, -12.5, 2.5], [300, 40, 6], [520, -120, 7], [680, 60, 8], [140, 120, 5], [-260, 60, 6]];
    g.flames.forEach((s, i) => { const f = FIRES[i % FIRES.length], j = Math.floor(i / FIRES.length), t0 = 38 + (i % FIRES.length) * 0.8, a = t - t0; if (a < 0 || t > T_HIT) { s.visible = false; return; }
      const y0 = f[1] < 0 && f[0] < 0 ? LAND_Y : terrH(f[0], f[1]) + 6, fl = 0.75 + 0.25 * Math.sin(t * (9 + j) + i), sz = f[2] * ss(0, 2.5, a) * fl * (1 - j * 0.06);
      s.position.set(f[0] + Math.sin(t * 3 + j) * 0.6, y0 + sz * 0.3 + j * f[2] * 0.12, f[1]); s.scale.set(sz, sz * 1.5, 1); s.visible = true; s.material.opacity = 0.9; });
    g.smoke.forEach((s, i) => { const f = FIRES[i % FIRES.length], t0 = 38.5 + (i % FIRES.length) * 0.8, a = t - t0; if (a < 0 || t > T_HIT) { s.visible = false; return; }
      const age = mod(a * 0.15 + i / g.smoke.length * 6, 1), y0 = f[1] < 0 && f[0] < 0 ? LAND_Y : terrH(f[0], f[1]) + 6; s.position.set(f[0] + age * 40, y0 + 4 + age * 60, f[1] + age * 6); const sz = f[2] * (1.5 + age * 6); s.scale.set(sz, sz, 1); s.visible = true;
      s.material.opacity = 0.75 * ss(0, 0.08, age) * (1 - age) * ss(0, 1.5, a); s.material.color.copy(C3('#2a2420', '#5a5048', age)); }); }
  // the wave: a 25 m wall rolling in over the drained bay, foam and spray
  g.wave.visible = on;
  if (on) { const { wPos, wUv, wX, wProf, wArc, WNX, WNS } = g, zw = waveZ(t), Hv = WAVE_H, Y0 = -12;
    for (let i = 0; i < WNX; i++) { const x = wX[i], cr = Hv * (1 + 0.04 * Math.sin(x * 0.01 + 1.3)), zo = zw - x * x / 90000 + 1.2 * Math.sin(x * 0.02);
      for (let j = 0; j < WNS; j++) { const k = i * WNS + j, [dn, yn] = wProf[j]; wPos[k * 3] = x; wPos[k * 3 + 1] = Y0 + yn * (cr - Y0); wPos[k * 3 + 2] = zo + dn * cr; wUv[k * 2] = x / 40; wUv[k * 2 + 1] = wArc[j] * (cr - Y0) / 40; } }
    g.wGeo.attributes.position.needsUpdate = true; g.wGeo.attributes.uv.needsUpdate = true; g.wGeo.computeVertexNormals(); g.waveU.uT.value = t; g.waveU.uFogC.value.copy(g.scene.fog.color);
    const R = RNG('lipEQ'); g.sprays.forEach((s, k) => { const u = R.f(), age = mod(t * R.r(0.2, 0.35) + R.f(), 1), x = c.x + (u * 2 - 1) * (Math.max(60, c.z - zw) * 0.9 + 40), top = k < 220;
      s.position.set(x, top ? Hv * (1.02 + age * 0.25) : Math.max(lev, -4) + age * 8, (top ? zw + 0.15 * Hv : zw + 0.36 * Hv) + 4 - x * x / 90000); const sz = (top ? 8 : 10) * (0.7 + age * 1.4); s.scale.set(sz, sz, 1); s.visible = true;
      s.material.opacity = (top ? 0.6 : 0.45) * Math.sin(age * Math.PI); s.material.color.set(top ? '#f2f0ea' : '#d8d4c8'); }); }
  else g.sprays.forEach((s) => (s.visible = false));

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// gulls over the bay before the jolt; they lift off at 10 s
function gulls() {
  if (TT > 18) return;
  const R = RNG('gullsEQ'); ctx.save(); screen(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 7; i++) { const cx = R.r(160, 940), cy = R.r(300, 700), rr = R.r(60, 180), sp = R.r(0.15, 0.35) * (R.f() < 0.5 ? 1 : -1), a = TT * sp + R.r(0, TAU), s = R.r(10, 18), flee = ss(10.2, 13, TT);
    const x = cx + Math.cos(a) * rr + flee * (cx - 540) * 3, y = cy + Math.sin(a) * rr * 0.35 - flee * 700, fl = Math.sin(TT * (6 + 8 * flee) + i * 1.3) * 0.7; ctx.globalAlpha = 1 - ss(14, 17, TT);
    ctx.fillStyle = 'rgba(246,244,240,0.95)'; ctx.strokeStyle = 'rgba(70,64,74,0.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - s, y - s * fl * 0.6); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.45, x, y); ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.45, x + s, y - s * fl * 0.6);
    ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.18, x, y + s * 0.12); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.18, x - s, y - s * fl * 0.6); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

// ---- HUD: the magnitude climbing, the shaking's length, then the tsunami, then HERE
const magTxt = (m) => m.toFixed(1).replace('.', ',');
function hud() {
  const t = TT; if (t < 0.6 || t >= 63.6) return; const a = ev(0.6, 0.5) * (t > 63.2 ? 1 - ev(63.2, 0.4) : 1);
  if (t < 50) { const m = magAt(t), sub = t < 10 ? 'la falla está bloqueada' : t < 14 ? 'llegan las primeras ondas' : t < 19 ? 'la ruptura avanza' : t < 33.5 ? `ruptura de ${pvNum(Math.round(knots([[19, 120], [25, 450], [33.5, 1000]], t) / 10) * 10)} km`
      : t < 45.5 ? `temblando ${Math.floor(knots([[33.5, 240], [45.5, 600]], t) / 60)} min ${String(Math.floor(knots([[33.5, 240], [45.5, 600]], t) % 60)).padStart(2, '0')} s` : 'la tierra se detiene';
    return pvHud('Magnitud', magTxt(m), sub, a); }
  if (t < 60.0) { const km = Math.max(0, (CAMZ - waveZ(t)) / 1000); return pvHud('Tsunami', '25 m', t < 54 ? 'el mar se retira' : km >= 1 ? `a ${km.toFixed(1).replace('.', ',')} km` : `a ${pvNum(Math.round(km * 100) * 10)} m`, a); }
  if (t < T_HIT) return;
  pvHud('El mar', 'AQUÍ', '', a);
}
function endCard() {
  const a = ev(64.3, 0.8), b = ev(65.4, 0.8), e = ev(66.6, 0.7);
  const f = () => {
    const R = RNG('cardBubblesEQ'); ctx.save(); screen(); for (let i = 0; i < 50; i++) { const x = R.r(0, W) + Math.sin(TT * R.r(0.5, 1.5) + i) * 12, y = mod(R.r(0, H) - (TT - 64) * R.r(30, 90), H), r = R.r(1.5, 5);
      ctx.globalAlpha = R.r(0.1, 0.3) * a; ctx.strokeStyle = '#9ad0d8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); } ctx.restore();
    pvText('¿Qué pasaría si el mayor', CX, 820, 56, { align: 'center', alpha: a });
    pvText('terremoto de la historia', CX, 892, 56, { align: 'center', alpha: a });
    pvText('golpeara tu ciudad?', CX, 964, 56, { align: 'center', alpha: a });
    pvText('VALDIVIA, CHILE, 1960 · MAGNITUD 9,5', CX, 1062, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('LA TIERRA TEMBLÓ DIEZ MINUTOS', CX, 1102, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('ALTERBASETV', CX, 1460, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
const mss = (s) => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(84, Math.floor(100 * 760 / wmax)), lh = size * 1.14, y0 = 420;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 60, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
// a caption on two lines (for the long one)
function caption2(l1, l2, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { pvFeather(CX, 1360, 560, 150, a); pvText(l1, CX, 1350, 50, { italic: true, align: 'center', alpha: a }); pvText(l2, CX, 1414, 50, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function crackedLens(a, n = 0) {
  const R = RNG('crackNY', n), [cx, cy] = [[640, 980], [300, 560], [820, 1540]][n], grow = ss(0, 0.12, a) * [1, 0.8, 0.65][n], arms = [];
  ctx.save(); screen(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (let i = 0; i < 17; i++) { const ang = i / 17 * TAU + R.r(-0.15, 0.15), L = R.r(380, 1500) * grow, pts = [[cx, cy]]; let x = cx, y = cy, aa = ang;
    for (let k = 0; k < 9; k++) { aa += R.r(-0.22, 0.22); const st = L / 9; x += Math.cos(aa) * st; y += Math.sin(aa) * st; pts.push([x, y]); }
    arms.push(pts);
    if (R.f() < 0.6) { const j = 2 + Math.floor(R.f() * 5), [bx, by] = pts[j], ba = ang + R.r(0.4, 0.9) * (R.f() < 0.5 ? -1 : 1), bl = R.r(80, 320) * grow; arms.push([[bx, by], [bx + Math.cos(ba) * bl * 0.5 + R.n(10), by + Math.sin(ba) * bl * 0.5 + R.n(10)], [bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl]]); } }
  const rings = []; for (const rr of [70, 150, 260, 400]) for (let i = 0; i < 17; i++) { if (R.f() < 0.35) continue; const a0 = i / 17 * TAU + R.r(-0.1, 0.1), a1 = a0 + TAU / 17 * R.r(0.7, 1.1), r0 = rr * R.r(0.85, 1.15) * grow; rings.push([[cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0], [cx + Math.cos((a0 + a1) / 2) * r0 * R.r(0.92, 1.08), cy + Math.sin((a0 + a1) / 2) * r0 * R.r(0.92, 1.08)], [cx + Math.cos(a1) * r0, cy + Math.sin(a1) * r0]]); }
  const stroke = (P, w, col, ox = 0, oy = 0) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); P.forEach(([x, y], k) => (k ? ctx.lineTo(x + ox, y + oy) : ctx.moveTo(x + ox, y + oy))); ctx.stroke(); };
  [...arms, ...rings].forEach((P) => { stroke(P, 4.5, 'rgba(4,16,18,0.45)', 1.5, 1.5); stroke(P, 2.2, 'rgba(200,236,236,0.7)'); stroke(P, 0.8, 'rgba(240,255,255,0.9)', -0.8, -0.8); });
  pvGlow(cx, cy, 70 * grow, 'rgba(220,250,250,0.7)', 0.7); ctx.fillStyle = 'rgba(210,240,240,0.5)'; ctx.beginPath(); ctx.arc(cx, cy, 16 * grow, 0, TAU); ctx.fill();
  ctx.restore();
}
// under the water: dark teal, light shafts from above, bubbles and silhouettes of debris tumbling past, silt
function underwater(t) {
  const a = t - T_HIT; ctx.save(); screen();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a6a6a'); g.addColorStop(0.45, '#123c42'); g.addColorStop(1, '#06181c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; const R = RNG('shafts');
  for (let i = 0; i < 7; i++) { const x0 = R.r(-100, W + 100) + Math.sin(t * 0.7 + i) * 40, w = R.r(60, 180), gr = ctx.createLinearGradient(0, 0, 0, H * 0.8); gr.addColorStop(0, `rgba(140,220,210,${0.12 * Math.exp(-a * 0.5)})`); gr.addColorStop(1, 'rgba(140,220,210,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + w, 0); ctx.lineTo(x0 + w * 2.5 + 200, H * 0.8); ctx.lineTo(x0 + 200, H * 0.8); ctx.closePath(); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
  const D = RNG('debUW'); for (let i = 0; i < 26; i++) { const sx = D.r(-200, W + 200), sy = D.r(-200, H), vx = D.r(-600, 600) * Math.exp(-a * 0.6), vy = D.r(-300, 500), x = sx + vx * a, y = sy + vy * a * 0.6, s = D.r(20, 140) * (1 + a * 0.3);
    ctx.save(); ctx.translate(x, y); ctx.rotate(D.r(0, 6) + a * D.r(-2, 2)); ctx.globalAlpha = D.r(0.25, 0.6) * Math.exp(-a * 0.35); ctx.filter = `blur(${Math.round(D.r(2, 8))}px)`; ctx.fillStyle = D.pick(['#041214', '#0a2024', '#1a2a28', '#2a1a14']);
    if (D.f() < 0.5) ctx.fillRect(-s, -s * 0.15, 2 * s, s * 0.3); else { ctx.beginPath(); ctx.ellipse(0, 0, s * 0.6, s * 0.4, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
  const B = RNG('bubUW'); for (let i = 0; i < 120; i++) { const x = B.r(0, W) + Math.sin(t * B.r(1, 3) + i) * 10, y = mod(B.r(0, H) - a * B.r(150, 600), H), r = B.r(2, 14) * (B.f() < 0.1 ? 2 : 1);
    ctx.globalAlpha = B.r(0.2, 0.6) * Math.exp(-a * 0.25); ctx.strokeStyle = '#bfeee8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.globalAlpha *= 0.6; ctx.fillStyle = '#e8fffa'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1; const S = RNG('siltUW'); for (let i = 0; i < 300; i++) { ctx.fillStyle = `rgba(150,180,170,${S.r(0.05, 0.2)})`; ctx.fillRect(S.r(0, W) + a * S.r(-30, 30), S.r(0, H) + a * S.r(-20, 40), 2, 2); }
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,6,8,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function sceneQuake() {
  const t = TT;
  if (t < T_HIT) { update(t); gulls(); }
  // dust in the air between the lens and the city through the worst of it
  if (t > 14 && t < T_HIT) { const k = 0.32 * ss(14, 32, t) * (1 - 0.5 * ss(48, 56, t)); pvTint('#9a7a58', k * 0.6, 'multiply'); pvTint('#b89a74', k * 0.7); const R = RNG('motesEQ'); ctx.save(); screen();
    for (let i = 0; i < 60; i++) { const x = mod(R.r(0, W) + t * R.r(10, 50), W), y = mod(R.r(0, H) + t * R.r(-10, 25), H), r = R.r(2, 12); ctx.globalAlpha = R.r(0.08, 0.3) * k * 3; ctx.fillStyle = '#6a5a48'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.restore(); }
  if (t > 60.2 && t < T_HIT) pvTint('#2a4a48', 0.6 * ss(60.2, T_HIT, t));
  if (t >= T_HIT && t < 64.0) { underwater(t); for (const [n, dt] of [[0, 0.15], [1, 0.8], [2, 1.45]]) if (t >= T_HIT + dt) crackedLens(t - T_HIT - dt, n); }
  if (t >= T_HIT && t < T_HIT + 0.35) pvTint('#eaf2ee', 1 - ss(T_HIT, T_HIT + 0.35, t));
  if (t >= 63.5 && t < 64.0) pvTint('#04080a', ss(63.5, 64.0, t));
  if (t >= 64.0) { fillAll('#04080a'); pvGlow(CX, 960, 900, 'rgba(20,60,66,0.5)', ev(64.0, 1.2)); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si el mayor', 'terremoto de la historia', 'golpeara tu ciudad?'], 0.3, 5.0);
  caption2('Una tarde tranquila', 'en la costa.', 5.5, 9.8);
  caption2('El suelo da una', 'pequeña sacudida.', 10.4, 13.8);
  pvCaption('Y luego no se detiene.', 14.3, 18.8);
  caption2('La falla bajo el mar', 'mide mil kilómetros.', 19.3, 24.6);
  pvCaption('Todo se rompe a la vez.', 25.4, 30.8);
  caption2('Nada se construyó', 'para moverse así.', 31.4, 36.8);
  pvCaption('El temblor dura diez minutos.', 37.4, 44.6);
  pvCaption('Luego todo queda en silencio.', 45.4, 49.8);
  pvCaption('Y el mar se retira.', 50.4, 55.6);
  pvCaption('Ya viene de vuelta.', 56.2, 59.9);
  pvCaption('Nada queda en pie.', 61.3, 63.5);
}
