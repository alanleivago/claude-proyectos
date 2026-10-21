
// =====================================================================
//  RUN — pose the world from TT each frame; the HUD, the title, the captions, the flash, the dust, the end card
// =====================================================================
const SKYD = 26000;   // where sky objects (the asteroid, its trail, the burst, the plume) sit
const hsh = (i, k = 1) => mod(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453, 1);
const flashA = (t) => (t < 30.4 ? 0 : t < 31 ? 0.25 * ss(30.4, 31, t) : t < 31.12 ? 1 : Math.exp(-(t - 31.12) * 1.5));
const trainX = (t) => (t < 33 ? -700 + 13 * t : -271 + 13 * 3.5 * (1 - Math.exp(-(t - 33) / 3.5)));
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position;
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const glow = astGlow(t), aD = t < T_BURST ? astDir(t) : BURST.clone(), tb = t - T_BURST, fl = flashA(t);
  const amber = ss(32.5, 38, t) * (1 - ss(44, 52, t)), heat = ss(31, 33, t) * (1 - ss(46, 56, t));
  const dust = t < T_HIT ? 0.22 * ss(53, 57.2, t) : lerp(1, 0.78, ss(57.6, 63, t)), hitK = t >= T_HIT ? 1 : 0;
  const B = cp.clone().addScaledVector(BURST, SKYD);
  // sky: morning; the fireball's glow; the white-out; the heat's amber; the dust
  const su = g.skyU, morn = ss(0, 30, t);
  su.top.value.copy(C3('#5d86c6', '#4f7fc8', morn)); su.mid.value.copy(C3('#a9c0e2', '#a2bfe6', morn)); su.hor.value.copy(C3('#f6d9bc', '#f0dcc8', morn));
  su.fireDir.value.copy(aD);
  su.fire.value = t < T_BURST ? glow * 0.22 : 4.5 * Math.exp(-tb * 1.4) + 0.5 * heat;
  su.fireW.value = t < 21 ? 0.00002 + 0.00006 * glow : t < T_BURST ? 0.0001 + 0.0025 * ss(21, 31, t) : 0.004 + 0.05 * (1 - Math.exp(-tb * 0.8));
  su.fireCol.value.copy(C3('#fff6e8', '#ffb070', ss(31.5, 36, t)));
  su.flash.value = Math.min(1, fl * 0.9); su.amber.value = amber; su.dust.value = dust;
  // fog: blue morning haze -> amber -> brown dust (thick right after the blast, thinning)
  const fog = g.scene.fog; fog.color.copy(C3('#c8cedd', '#e0b890', amber * 0.8).lerp(lin('#8a7056'), dust));
  fog.near = hitK ? lerp(2, 60, ss(57.3, 63, t)) : 500; fog.far = hitK ? lerp(70, 5200, Math.pow(ss(57.4, 62.4, t), 1.3)) : lerp(11000, 6000, ss(52, 57, t));
  // lights
  g.sun.intensity = 2.0 * (1 - 0.85 * dust) * (1 - 0.3 * amber); g.sun.color.copy(C3('#fff0dc', '#ffc890', amber));
  g.hemi.intensity = 0.95 * (1 - 0.4 * dust) + 0.3 * fl; g.hemi.color.copy(C3('#b4c8ee', '#e8c8a8', amber).lerp(lin('#a08a70'), dust));
  g.fireL.intensity = t < 21 ? 0 : t < T_BURST ? 3.2 * Math.pow(ss(21, 31, t), 2.2) : 9 * Math.exp(-tb * 1.3) + 0.9 * heat * (1 - dust);
  g.fireL.color.copy(C3('#fff4e4', '#ff9a50', ss(31.3, 35, t))); g.fireL.position.copy(g.fireL.target.position).addScaledVector(aD, 2500);
  g.r.toneMappingExposure = 1.15 + 0.6 * fl;
  // the river
  const wu = g.waterU; wu.uT.value = t; wu.uTop.value.copy(su.top.value); wu.uHor.value.copy(su.hor.value); wu.uFire.value.copy(aD);
  wu.uFireK.value = t < T_BURST ? glow * 0.6 : 3 * Math.exp(-tb * 1.4); wu.uQuake.value = ss(43, 44, t) * (1 - ss(48, 51, t)); wu.uChurn.value = ss(56.5, 57.6, t); wu.uDust.value = dust;
  wu.fogColor.value.copy(fog.color); wu.fogNear.value = fog.near; wu.fogFar.value = fog.far;

  // ---- the asteroid: a new star, then a fireball sliding down the sky; the burst
  { const pos = cp.clone().addScaledVector(aD, SKYD);
    g.core.position.copy(pos); g.glare.position.copy(pos);
    const cs = t < T_BURST ? SKYD * (0.0035 + 0.006 * glow) : SKYD * 0.06 * Math.exp(-tb * 2.2), gs = t < T_BURST ? SKYD * (0.012 + 0.05 * glow * glow) : SKYD * 0.3 * Math.exp(-tb * 1.6);
    g.core.scale.set(cs, cs, 1); g.glare.scale.set(gs, gs, 1); g.core.visible = g.glare.visible = t > 4.2 && t < 34;
    g.core.material.opacity = clamp(ss(4.2, 6, t)); g.glare.material.opacity = 0.35 + 0.25 * ss(21, 31, t); g.core.material.color.copy(C3('#ffffff', '#fff0d0', ss(21, 31, t))); }
  // the trail: white-hot behind the head, cooling into a twisted column of tan smoke that sags and spreads
  { const NT = g.trail.length;
    g.trail.forEach((s, i) => { const u = i / (NT - 1), ti = 21 + 10 * Math.pow(u, 0.85), a = t - ti; if (a <= 0 || t > 64) { s.visible = false; return; }
      const d = astDir(ti), p = cp.clone().addScaledVector(d, SKYD), tw = Math.sin(u * 40 + a * 0.6) * 60 * Math.min(a, 6);
      p.x += -a * 14 + tw; p.y += -a * 6 + Math.cos(u * 33) * 40 * Math.min(a, 5); s.position.copy(p);
      const sz = (300 + 130 * Math.min(a, 14)) * (0.8 + 0.4 * hsh(i)); s.scale.set(sz, sz, 1); s.visible = true;
      s.material.opacity = 0.78 * ss(0.3, 1.4, a) * (1 - 0.35 * ss(20, 33, a)) * (1 - ss(62, 64, t));
      s.material.color.copy(C3('#fff4e4', '#b8a48e', ss(0.2, 2.5, a)).lerp(lin('#ffb070'), 0.5 * heat * hsh(i, 3)).lerp(lin('#6a5848'), dust * 0.8)); s.material.rotation = hsh(i, 2) * 6; });
    g.trailGlow.forEach((s, i) => { const u = i / (g.trailGlow.length - 1), ti = 21 + 10 * Math.pow(u, 0.85), a = t - ti, L = 3.2; if (a <= 0 || a > L || t > T_BURST + 0.8) { s.visible = false; return; }
      s.position.copy(cp).addScaledVector(astDir(ti), SKYD - 50); const k = 1 - a / L, sz = SKYD * (0.006 + 0.02 * Math.min(glow, 2.5) * k); s.scale.set(sz, sz, 1); s.visible = true; s.material.opacity = 0.65 * Math.pow(k, 1.5) * (t > T_BURST ? 1 - ss(T_BURST, T_BURST + 0.8, t) : 1); s.material.color.copy(C3('#ffffff', '#ffc890', a / L)); }); }
  // the burst's ring (a condensation shell racing outwards) and the plume: a turbulent stem over a dust skirt, a rolling cap
  // (lit on top, dark beneath), glowing orange from inside for the first seconds
  { g.ring.visible = tb > 0 && tb < 5; if (g.ring.visible) { const R = SKYD * 0.6 * (1 - Math.exp(-tb / 1.4)); g.ring.position.copy(B); g.ring.lookAt(cp); g.ring.scale.set(2 * R, 2 * R, 1); g.ring.material.opacity = 0.85 * ss(0, 0.12, tb) * Math.exp(-tb / 1.4); }
    const hC = 1500 * (1 - Math.exp(-tb / 7)) + 50 * Math.max(0, tb), rc = 700 + 2300 * (1 - Math.exp(-tb / 6)), sunSide = SUN_DIR.x < 0 ? -1 : 1;
    g.plume.forEach((s, i) => { const kind = i < 150 ? 0 : i < 380 ? 1 : 2, d0 = kind === 0 ? 0.6 + hsh(i, 5) * 3 : kind === 1 ? hsh(i, 5) * 1.4 : hsh(i, 5) * 0.5, a = tb - d0;
      if (a <= 0 || t > 64 || (kind === 2 && a > 7)) { s.visible = false; return; }
      let p, sz, lit;
      if (kind === 0) { const v = hsh(i, 6), y = lerp(B.y * 0.08, B.y + hC * 0.7, v), wd = lerp(1500, 420, Math.pow(v, 0.5)) + 0.15 * rc * v, ang = hsh(i, 7) * TAU;
        p = new THREE.Vector3(B.x + Math.cos(ang) * wd * 0.5 * Math.sqrt(hsh(i, 8)) + Math.sin(v * 11 + tb * 0.15) * 90, y, B.z + Math.sin(ang) * wd * 0.3); sz = (wd * 1.2 + 550) * (0.7 + 0.5 * hsh(i, 9)); lit = 0.5 + 0.5 * Math.cos(ang) * -sunSide; }
      else { const ang = hsh(i, 9) * TAU, rr = rc * (0.35 + 0.65 * Math.sqrt(hsh(i, 10))), roll = hsh(i, 11) * TAU, up = Math.sin(roll) * 0.32 * rc * (rr / rc);
        p = new THREE.Vector3(B.x + Math.cos(ang) * rr, B.y + hC + up + Math.cos(roll) * 0.1 * rc, B.z + Math.sin(ang) * rr * 0.55); sz = (0.5 * rc + 450) * (0.7 + 0.6 * hsh(i, 12)); lit = clamp(0.5 + 0.5 * Math.sin(roll)) * 0.8 + 0.2 * (0.5 + 0.5 * Math.cos(ang) * -sunSide);
        if (kind === 2) { p.set(B.x + (hsh(i, 13) - 0.5) * rc * 0.6, B.y + hC * 0.8 + (hsh(i, 14) - 0.5) * rc * 0.3, B.z); sz = rc * (0.5 + 0.4 * hsh(i, 15)); } }
      s.position.copy(p); sz *= ss(0, 1.0, a + 0.25); s.scale.set(sz, sz, 1); s.visible = true; s.material.rotation = hsh(i, 16) * 6 + tb * 0.02 * (hsh(i, 17) - 0.5);
      if (kind === 2) { s.material.blending = THREE.AdditiveBlending; s.material.map = g.BT[0]; s.material.opacity = 0.7 * Math.exp(-a / 2.2) * ss(0, 0.3, a); s.material.color.copy(C3('#ffd090', '#ff7a30', a / 4)); return; }
      s.material.opacity = (kind === 0 ? 0.62 : 0.8) * ss(0, 1.0, a) * (1 - ss(62.5, 64, t));
      const hot = Math.exp(-a * 0.7);
      s.material.color.copy(C3('#3e3630', '#b4a698', lit)).lerp(lin('#ffcf90'), hot * 0.85).lerp(lin('#fff8ee'), Math.max(0, 1 - a * 2.5) * 0.8).lerp(lin('#ff9a50'), heat * 0.18 * lit).lerp(lin('#4a3c30'), dust * 0.6); }); }

  // ---- clouds drift; lit peach, then amber, then brown
  g.clouds.forEach((s) => { const u = s.userData; s.position.set(u.x + t * 6, u.y, u.z); s.scale.set(u.w, u.w * (u.flat || 0.42), 1);
    s.material.color.copy(C3('#fff2e6', '#ffd0a0', amber).lerp(lin('#8a7462'), dust)); s.material.opacity = u.o * (1 - 0.6 * dust) * (1 - ss(57.3, 57.8, t) * 0.5); });
  // ---- chimney smoke, then steam off the roofs and haystacks in the heat
  { let k = 0; g.CHIM.forEach((hi, j) => { const q = g.HL[hi]; for (let m = 0; m < 6; m++, k++) { const s = g.smoke[k], age = mod(t * 0.22 + m / 6 + hsh(hi), 1);
      if (t > q.tf || q.z < -760) { s.visible = false; continue; } const wnd = 1 + 3 * ss(49, 56, t);
      s.position.set(q.cx + age * 14 * wnd, q.cy + 1 + age * 22, q.cz + age * 4 * wnd); const sz = 2.2 + age * 12; s.scale.set(sz, sz, 1); s.visible = true;
      s.material.opacity = 0.5 * ss(0, 0.12, age) * (1 - age); s.material.color.copy(C3('#e8e4e0', '#ffd8b0', amber)); s.material.rotation = hsh(k) * 6; } }); }
  g.steam.forEach((s, i) => { const src = i % 3 === 0 && g.HAY.length ? g.HAY[i % g.HAY.length] : null, q = src ? null : g.HL[(i * 7) % g.HL.length];
    const x = src ? src[0] : q.x, z = src ? src[2] : q.z, y = src ? src[1] + 2 : q.y0 + q.h + q.rh * 0.5, t0 = 33.5 + hsh(i) * 3, tf = src ? 57 : q.tf, age = mod((t - t0) * 0.3 + hsh(i, 2), 1);
    if (t < t0 || t > Math.min(tf, 50) || z < -800) { s.visible = false; return; }
    s.position.set(x + age * 8 * (1 + 2 * ss(49, 56, t)), y + age * 16, z); const sz = 2 + age * 9; s.scale.set(sz, sz, 1); s.visible = true;
    s.material.opacity = 0.3 * ss(0, 0.15, age) * (1 - age) * ss(t0, t0 + 1.5, t); s.material.color.copy(lin('#f0e6dc')); });

  // ---- the train crosses the far bank, brakes after the flash, topples when the front passes
  { const X0 = trainX(t); g.train.forEach((o, k) => { const x = X0 - (k ? 6.5 + k * 9.8 : 0), z = railZ(x), y = terrH(x, z) + 0.3, a = Math.max(0, t - frontAt(z)); o.position.set(x, y, z); o.rotation.set(Math.min(1.45, a * 2.5), 0, 0); }); }
  { const X0 = trainX(t), on = 1 - ss(36, 44, t); g.trainSmoke.forEach((s, i) => { const age = mod(t * 0.5 + i / g.trainSmoke.length, 1), te = t - age * 2, xe = trainX(te) + 3, ze = railZ(xe);
      if (on <= 0 || t > 56) { s.visible = false; return; } s.position.set(xe - age * 6, terrH(xe, ze) + 5.5 + age * 24, ze + age * 3); const sz = 3 + age * 16; s.scale.set(sz, sz, 1); s.visible = true;
      s.material.opacity = 0.55 * on * ss(0, 0.06, age) * (1 - age); s.material.color.copy(C3('#f4f0ea', '#8a8480', hsh(i) * 0.4)); s.material.rotation = hsh(i, 3) * 6; }); }

  // ---- villagers: walk, freeze and look up after the flash, run indoors at the quake
  g.PEOPLE.forEach((p, i) => { const tw = Math.min(t, T_BURST) + Math.max(0, t - 43.5) * 3.2, f = clamp(p.j + p.v * tw * 0.055 + p.u0, 1, p.s.length - 2.01), j = Math.floor(f), w = f - j;
    const [x1, z1] = p.s[j], [x2, z2] = p.s[j + 1], x = lerp(x1, x2, w), z = lerp(z1, z2, w), y = terrH(x, z), gone = t > 47 + p.ph * 3, bob = (t < T_BURST || t > 43.5) ? Math.abs(Math.sin(t * (t > 43.5 ? 14 : 7) + p.ph * 9)) * 0.08 : 0;
    const m = gone ? _hid : M4c(x, y + bob, z, Math.atan2(x2 - x1, z2 - z1) * Math.sign(p.v), 2.2, 2.2, 2.2); g.bodies.setMatrixAt(i, m); g.heads.setMatrixAt(i, m); });
  g.bodies.instanceMatrix.needsUpdate = true; g.heads.instanceMatrix.needsUpdate = true;
  // ---- birds: crows circle the river; at the quake a flock bursts from the trees and flees towards us
  g.BIRDS.forEach((b, i) => { let x, y, z, yaw, flap = Math.sin(t * (b.flock ? 16 : 7) + b.ph);
    if (!b.flock && t < 43.3) { const a = b.ph + t * b.w; x = b.cx + Math.cos(a) * b.r; z = b.cz + Math.sin(a) * b.r * 0.6; y = b.cy + 8 * Math.sin(t * 0.5 + b.ph); yaw = -a + (b.w > 0 ? 0 : Math.PI); flap = t % 3 < 1.6 ? flap : 0.3; }
    else { const t0 = b.flock ? b.t0 : 43.3 + hsh(i) * 0.6, a = t - t0; if (a < 0 || a > 14) { g.birds.setMatrixAt(i, _hid); return; }
      x = b.x0 + b.vx * a; z = b.z0 + b.vz * a; y = terrH(b.x0, b.z0) + 12 + b.vy * a; yaw = Math.atan2(b.vx, b.vz); }
    const s = b.s * 2.2; g.birds.setMatrixAt(i, M4c(x, y, z, yaw, s, s * flap, s)); });
  g.birds.instanceMatrix.needsUpdate = true;
  // ---- quake dust puffs off the streets and roofs
  g.groundDust.forEach((s, i) => { const q = g.HL[(i * 13) % g.HL.length], t0 = 43.3 + hsh(i) * 4, a = t - t0; if (a < 0 || a > 5 || q.z < -720) { s.visible = false; return; }
    s.position.set(q.x + (hsh(i, 2) - 0.5) * 16, terrH(q.x, q.z) + 1 + a * 1.2, q.z + (hsh(i, 3) - 0.5) * 16); const sz = 4 + a * 5; s.scale.set(sz, sz * 0.6, 1); s.visible = true;
    s.material.opacity = 0.35 * ss(0, 0.4, a) * (1 - a / 5); s.material.color.copy(lin('#b49a7a')); });

  // ---- the blast front: the forest lies down in a wave, roofs and fences go, the train topples; a boiling wall of dust
  const zf = frontZ(t);
  if (t > 42.9 || g.dirty) { g.dirty = t > 42.9;
    const fall = (tf, k) => (t < tf - 1.5 ? 0 : t < tf ? 0.12 * ss(tf - 1.5, tf, t) : 0.12 + (k - 0.12) * ss(tf, tf + 0.8, t));
    g.trees.forEach((tr) => { const rx = fall(tr.tf, 1.42 + 0.1 * tr.ph); g.treeI[tr.type].setMatrixAt(tr.slot, M4c(tr.x, tr.y, tr.z, tr.ph * 6, tr.s, tr.s, tr.s, rx, 0.15 * (tr.ph - 0.5) * rx)); });
    g.treeI.forEach((m) => (m.instanceMatrix.needsUpdate = true));
    g.FAR.forEach((f) => { const rx = fall(f.tf, 1.45); g.farI[f.k].setMatrixAt(f.slot, f.k ? M4c(f.x, f.y, f.z, f.ph * 6, f.w * 1.4, f.s * 0.42, f.w * 1.4, rx) : M4c(f.x, f.y, f.z, f.ph * 6, f.w, f.s, f.w, rx)); });
    g.farI.forEach((m) => (m.instanceMatrix.needsUpdate = true));
    g.HL.forEach((q, i) => { const a = t - q.tf;
      if (a <= 0) { const sh = 0.05 * ss(43, 44, t) * (1 - ss(48, 50, t)) * Math.sin(t * 40 + i); g.roofs.setMatrixAt(i, M4c(q.x + sh, q.y0 + q.h, q.z, q.ry + Math.PI / 2, q.sz + 0.8, q.rh, q.sx + 1.0)); g.chims.setMatrixAt(i, q.chim ? M4c(q.cx + sh, q.cy, q.cz) : _hid); return; }
      if (a > 4) { g.roofs.setMatrixAt(i, _hid); g.chims.setMatrixAt(i, _hid); return; }
      const v = 40 * q.sp, cx = q.x + q.spin[0] * 6 * a, cz = q.z + v * a, cy = q.y0 + q.h + 10 * a * q.sp - 4.9 * a * a + 6 * a;
      g.roofs.setMatrixAt(i, M4c(cx, cy, cz, q.ry + Math.PI / 2 + q.spin[1] * a, q.sz + 0.8, q.rh, q.sx + 1.0, q.spin[0] * a * 1.5, q.spin[2] * a)); g.chims.setMatrixAt(i, _hid); });
    g.roofs.instanceMatrix.needsUpdate = true; g.chims.instanceMatrix.needsUpdate = true;
    // some houses fold over and slump into heaps after their roofs go
    g.HL.forEach((q, i) => { const k = q.collapse ? ss(0, 0.7, t - q.tf - 0.2) : 0, h = q.h * (1 - 0.6 * k);
      g.houses.setMatrixAt(i, M4c(q.x, q.y0 + h / 2, q.z + k * q.h * 0.3, q.ry, q.sx * (1 + 0.15 * k), h, q.sz * (1 + 0.15 * k), 0.3 * k, q.tilt * k)); });
    g.houses.instanceMatrix.needsUpdate = true;
    g.LIT.forEach((l, i) => g.litter.setMatrixAt(i, t < l.tf ? _hid : M4c(l.x, l.y, l.z, l.ry, l.s[0], l.s[1], l.s[2], l.rx)));
    g.litter.instanceMatrix.needsUpdate = true;
    g.FEN.forEach(([x, z, a, L], i) => { const tf = g.HL.length ? frontAt(z) : 99; g.fences.setMatrixAt(i, M4c(x, terrH(x, z) - 0.1, z, a, L, 1, 1, Math.abs(Math.sin(a)) > 0.5 ? 0 : 1.45 * ss(tf, tf + 0.3, t), Math.abs(Math.sin(a)) > 0.5 ? -1.45 * ss(tf, tf + 0.3, t) : 0)); });
    g.fences.instanceMatrix.needsUpdate = true;
    g.HAY.forEach(([x, y, z, s], i) => { const k = 1 - 0.7 * ss(frontAt(z), frontAt(z) + 0.4, t); g.hay.setMatrixAt(i, M4c(x, y - 0.4, z, i, s * (1 + (1 - k)), s * k, s * (1 + (1 - k)))); });
    g.hay.instanceMatrix.needsUpdate = true; }
  // grass: still in the morning, trembling in the quake, flattened towards us by the blast
  { const wnd = ss(56.4, 57.3, t) * (1 - 0.6 * ss(59, 63, t)), q = ss(43, 44, t) * (1 - ss(48, 50, t));
    g.tuftL.forEach(([x, y, z, s, ph], i) => g.tufts.setMatrixAt(i, M4c(x, y, z, ph, s, s, s, 0.08 * Math.sin(t * 1.2 + ph) + q * 0.15 * Math.sin(t * 30 + ph * 7) + 1.1 * wnd * (0.8 + 0.2 * Math.sin(t * 9 + ph)), 0.05 * Math.sin(t * 0.9 + ph * 2))));
    g.tufts.instanceMatrix.needsUpdate = true; }
  // the dust wall: boiling billows along the front, an opaque curtain behind them
  { const on = t > 47.5 && t < T_HIT + 0.05, az = Math.abs(zf), Hw = 520;
    g.curtain.visible = on; if (on) { g.curtain.position.set(cp.x, -40, zf - 60 - az * 0.02); g.curtain.scale.set(az * 2.4 + 600, Hw * 1.05 + 60, 1); g.curtain.material.color.copy(C3('#c8ae90', '#a08870', ss(52, 57, t))); }
    g.wall.forEach((s, i) => { if (!on) { s.visible = false; return; } const u = hsh(i) * 2 - 1, row = i % 4, x = cp.x + u * (az * 0.8 + 320), z = zf - row * (8 + az * 0.015) + (hsh(i, 2) - 0.5) * 12;
      const hy = Math.pow(hsh(i, 3), 0.9), y = Math.max(terrH(x, Math.min(z, -5)), 0) + hy * Hw * (0.85 + 0.15 * Math.sin(t * 0.7 + i)) - 30, sz = (Hw * (0.45 + 0.4 * hsh(i, 4)) + az * 0.035) * (1 - 0.25 * hy);
      s.position.set(x, y, z); s.scale.set(sz, sz * 0.75, 1); s.visible = true; s.material.rotation = hsh(i, 5) * 6 + t * 0.35 * (hsh(i, 6) - 0.5);
      s.material.opacity = 0.9 * ss(47.5, 48.5, t) * ss(120, 900, az); s.material.color.copy(C3('#9a8268', '#e6d0b0', Math.pow(hy, 1.5) * 0.9 + 0.1 * hsh(i, 7)).lerp(lin('#7a644e'), 0.2 * row)); }); }
  // fires after the blast: flickering flames, dark smoke columns leaning with the wind, embers rising
  { let k = 0; g.FIRES.forEach((f, i) => { const a = t - f.t0, on = a > 0 && t < 63.7, grow = ss(0, 2.5, a);
      for (let j = 0; j < 3; j++, k++) { const sp = g.flames[k]; if (!on) { sp.visible = false; continue; } const fl = 0.75 + 0.25 * Math.sin(t * (9 + j * 3) + f.ph + j) * Math.sin(t * 5.3 + f.ph * 2);
        const sz = f.s * grow * fl * (1 - j * 0.25); sp.position.set(f.x + Math.sin(t * 3 + j * 2 + f.ph) * 0.6, f.y + sz * 0.35 + j * f.s * 0.3 * grow, f.z); sp.scale.set(sz, sz * 1.5, 1); sp.visible = true; sp.material.opacity = 0.9 * grow; } });
    let m = 0; g.FIRES.forEach((f, i) => { for (let j = 0; j < 5; j++, m++) { const sp = g.fireSmoke[m], a = t - f.t0 - 0.4; if (a <= 0 || t > 63.7) { sp.visible = false; continue; }
      const age = mod(a * 0.18 + j / 5, 1), ok = a * 0.18 > age - j / 5 - 1e-6 || a > 5.5; if (!ok) { sp.visible = false; continue; }
      sp.position.set(f.x + age * 40 + Math.sin(age * 5 + f.ph) * 3, f.y + 4 + age * 70, f.z + age * 6); const sz = f.s * (1.4 + age * 5); sp.scale.set(sz, sz, 1); sp.visible = true;
      sp.material.opacity = 0.9 * ss(0, 0.08, age) * (1 - age * 0.8) * ss(0, 1.5, a); sp.material.color.copy(C3('#1e1a16', '#4a423a', age)); sp.material.rotation = hsh(m) * 6 + age; } });
    const P = g.embers.geometry.attributes.position.array, on = t > 57.8 && t < 63.7;
    for (let e = 0; e < 900; e++) { const f = g.FIRES[e % g.FIRES.length], a = t - f.t0, age = mod(a * 0.35 + hsh(e), 1);
      if (!on || a < 0) { P[e * 3 + 1] = -1e5; continue; } P[e * 3] = f.x + age * 14 + Math.sin(age * 9 + e) * 3; P[e * 3 + 1] = f.y + age * 26 + hsh(e, 2) * 3; P[e * 3 + 2] = f.z + (hsh(e, 3) - 0.5) * 6; }
    g.embers.geometry.attributes.position.needsUpdate = true; }
  // debris: shingles, planks and leaves torn off as the front passes, flung past the camera
  g.debL.forEach((q, i) => { const a = t - q.tf; if (a < 0 || a > 3.2) { g.deb.setMatrixAt(i, _hid); return; } const z = q.z + q.v * a; if (z > 6) { g.deb.setMatrixAt(i, _hid); return; }
    g.deb.setMatrixAt(i, M4c(q.x + q.dx * q.v * a, q.y + q.up * a - 4.9 * a * a + 2, z, q.spin[0] * a, q.s[0], q.s[1], q.s[2], q.spin[1] * a, q.spin[2] * a)); });
  g.deb.instanceMatrix.needsUpdate = true;
  // the porch: its carved valance rattles in the quake and tears loose at the blast
  { const a = Math.max(0, t - T_HIT); g.val.rotation.x = 0.02 * ss(43, 44, t) * (1 - ss(48, 50, t)) * Math.sin(t * 37) + Math.min(1.2, a * 3); g.val.position.z = -1.2 + Math.min(0.6, a * 1.5); }

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}
const frontAt = (z) => { let a = 47.5, b = 57.3; if (z < FRONT[0][1]) return 47.5; for (let k = 0; k < 24; k++) { const m = (a + b) / 2; if (frontZ(m) < z) a = m; else b = m; } return b; };

// ---- screen-space: where a sky direction lands on the frame
function toScreen(dir) { const g = g3(), p = g.cam.position.clone().addScaledVector(dir, SKYD).project(g.cam); return { x: (p.x * 0.5 + 0.5) * W, y: (0.5 - p.y * 0.5) * H, on: p.z < 1 }; }
// ---- the HUD: altitude, then the shockwave's countdown
const fmtN = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const mss = (s) => { s = Math.ceil(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function hud() {
  const t = TT; if (t < 0.6 || t >= 62.6) return; const a = ev(0.6, 0.5) * (1 - ev(62.1, 0.5));
  if (t < T_BURST) { const km = altMi(t) * 1.609; pvHud('Altitud', `${km >= 100 ? pvNum(km) : km.toFixed(km >= 10 ? 0 : 1).replace('.', ',')} km`, `${pvNum(Math.round(knots([[0, 33500], [21, 33500], [31, 29800]], t) * 1.609 / 100) * 100)} km/h`, a); }
  else if (t < T_HIT) { const km = shockMi(t) * 1.609; pvHud('Onda expansiva', mss(shockS(t)), `a ${km >= 1 ? Math.round(km) : km.toFixed(1).replace('.', ',')} km`, a); }
  else pvHud('Onda expansiva', '0:00', 'aquí', a);
}
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(96, Math.floor(100 * 740 / wmax)), lh = size * 1.12, y0 = 430;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 62, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  // the lines arrive one by one, a little dust still drifting through the dark; the user's words, then "...o si?" a second later
  const a = ev(63.4, 0.8), a2 = ev(63.9, 0.8), b = ev(64.7, 0.8), c = ev(65.6, 0.8), d = ev(66.8, 0.6), e = ev(67.8, 0.7);
  const f = () => {
    const R = RNG('cardDust'); ctx.save(); screen(); for (let i = 0; i < 60; i++) { const x = mod(R.r(0, W) + (TT - 63) * R.r(10, 40), W), y = mod(R.r(0, H) - (TT - 63) * R.r(4, 18), H), r = R.r(1, 3.5);
      ctx.globalAlpha = R.r(0.08, 0.28) * a; ctx.fillStyle = '#c8b090'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.restore();
    pvText('¿Que pasaría si un meteorito', CX, 760, 54, { align: 'center', alpha: a });
    pvText('cayera en tu ciudad?', CX, 832, 54, { align: 'center', alpha: a2 });
    pvText('TUNGUSKA, SIBERIA · 1908', CX, 920, 24, { font: PV.sans, weight: 600, spacing: 5, align: 'center', alpha: b * 0.8 });
    pvText('80 MILLONES DE ÁRBOLES DERRIBADOS', CX, 962, 24, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('Tranquilo, esto no sucederá', CX, 1090, 50, { italic: true, align: 'center', alpha: c });
    pvText('de nuevo pronto.', CX, 1154, 50, { italic: true, align: 'center', alpha: c });
    pvText('...o si?', CX, 1262, 64, { italic: true, align: 'center', alpha: d });
    pvText('ALTERBASETV', CX, 1480, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
function crackedLens(a) {
  const R = RNG('crack'), cx = 690, cy = 1080, grow = ss(0, 0.12, a), arms = [];
  ctx.save(); screen(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (let i = 0; i < 17; i++) { const ang = i / 17 * TAU + R.r(-0.15, 0.15), L = R.r(380, 1500) * grow, pts = [[cx, cy]]; let x = cx, y = cy, aa = ang;
    for (let k = 0; k < 9; k++) { aa += R.r(-0.22, 0.22); const st = L / 9; x += Math.cos(aa) * st; y += Math.sin(aa) * st; pts.push([x, y]); }
    arms.push(pts);
    if (R.f() < 0.6) { const j = 2 + Math.floor(R.f() * 5), [bx, by] = pts[j], ba = ang + R.r(0.4, 0.9) * (R.f() < 0.5 ? -1 : 1), bl = R.r(80, 320) * grow; arms.push([[bx, by], [bx + Math.cos(ba) * bl * 0.5 + R.n(10), by + Math.sin(ba) * bl * 0.5 + R.n(10)], [bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl]]); } }
  // rings: short jagged arcs between neighbouring arms
  const rings = []; for (const rr of [70, 150, 260, 400]) for (let i = 0; i < 17; i++) { if (R.f() < 0.35) continue; const a0 = i / 17 * TAU + R.r(-0.1, 0.1), a1 = a0 + TAU / 17 * R.r(0.7, 1.1), r0 = rr * R.r(0.85, 1.15) * grow; rings.push([[cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0], [cx + Math.cos((a0 + a1) / 2) * r0 * R.r(0.92, 1.08), cy + Math.sin((a0 + a1) / 2) * r0 * R.r(0.92, 1.08)], [cx + Math.cos(a1) * r0, cy + Math.sin(a1) * r0]]); }
  const stroke = (P, w, c, ox = 0, oy = 0) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); P.forEach(([x, y], k) => (k ? ctx.lineTo(x + ox, y + oy) : ctx.moveTo(x + ox, y + oy))); ctx.stroke(); };
  // shards: a few facets near the centre catch the light differently
  for (let i = 0; i < 9; i++) { const a0 = R.r(0, TAU), r0 = R.r(20, 160) * grow; ctx.fillStyle = `rgba(${R.f() < 0.5 ? '255,250,240' : '30,24,18'},${R.r(0.06, 0.16)})`;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0); ctx.lineTo(cx + Math.cos(a0 + 0.4) * r0 * 1.2, cy + Math.sin(a0 + 0.4) * r0 * 1.2); ctx.closePath(); ctx.fill(); }
  [...arms, ...rings].forEach((P) => { stroke(P, 4.5, 'rgba(20,16,12,0.35)', 1.5, 1.5); stroke(P, 2.2, 'rgba(255,252,245,0.75)'); stroke(P, 0.8, 'rgba(255,255,255,0.95)', -0.8, -0.8); });
  pvGlow(cx, cy, 70 * grow, 'rgba(255,255,255,0.8)', 0.7); ctx.fillStyle = 'rgba(240,236,228,0.55)'; ctx.beginPath(); ctx.arc(cx, cy, 18 * grow, 0, TAU); ctx.fill();
  ctx.restore();
}
function sceneBurst() {
  const t = TT;
  if (t < 63.6) update(t);
  // the fireball's glare on the lens; the burst's rays ("the sky tears open")
  if (t > 4.5 && t < 34) { const p = toScreen(t < T_BURST ? astDir(t) : BURST), gl = astGlow(t), k = t < T_BURST ? gl : 4.5 * Math.exp(-(t - T_BURST) * 1.2);
    if (p.on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; pvGlow(p.x, p.y, 60 + 220 * k, 'rgba(255,200,130,0.8)', clamp(0.2 + 0.25 * k)); pvGlow(p.x, p.y, 420 + 600 * k, 'rgba(255,220,170,0.4)', clamp(0.12 * k)); ctx.restore();
      if (t > 21) { const a = clamp(ss(21, 23, t)), rr = 10 + 16 * Math.min(k, 3); pvGlow(p.x, p.y, rr * 2.4, 'rgba(255,150,60,0.9)', a); ctx.save(); screen(); ctx.globalAlpha = a; ctx.fillStyle = '#fffaf0'; ctx.shadowColor = 'rgba(255,180,90,1)'; ctx.shadowBlur = rr; ctx.beginPath(); ctx.arc(p.x, p.y, rr * 0.55, 0, TAU); ctx.fill(); ctx.restore(); } }
    if (t > T_BURST && t < 33.6 && p.on) { const a = (1 - ss(31.2, 33.6, t)), R = RNG('rays'); ctx.save(); screen(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 28; i++) { const ang = R.r(0, TAU), w = R.r(0.02, 0.06), L = R.r(900, 2400) * (0.6 + 0.4 * ss(31, 32, t)); const gr = ctx.createLinearGradient(p.x, p.y, p.x + Math.cos(ang) * L, p.y + Math.sin(ang) * L);
        gr.addColorStop(0, `rgba(255,250,235,${0.35 * a})`); gr.addColorStop(1, 'rgba(255,250,235,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(ang - w) * L, p.y + Math.sin(ang - w) * L); ctx.lineTo(p.x + Math.cos(ang + w) * L, p.y + Math.sin(ang + w) * L); ctx.closePath(); ctx.fill(); }
      ctx.restore(); } }
  // the new star: a sharp twinkling point with four spikes (it is still in space: 4.5-21)
  if (t > 4.5 && t < 22) { const p = toScreen(astDir(t)), k = clamp(ss(4.5, 6, t)) * (1 - ss(21, 22, t)), gl = astGlow(t), tw = 0.85 + 0.15 * Math.sin(t * 9.3) * Math.sin(t * 5.1);
    if (p.on) { const r = (3 + 9 * Math.sqrt(gl)) * tw; ctx.save(); screen(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k;
      pvGlow(p.x, p.y, r * 5, 'rgba(255,250,236,0.55)'); pvGlow(p.x, p.y, r * 1.6, 'rgba(255,255,255,1)');
      for (const [dx, dy] of [[1, 0], [0, 1]]) { const L = r * (6 + 10 * gl), gr = ctx.createLinearGradient(p.x - dx * L, p.y - dy * L, p.x + dx * L, p.y + dy * L);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gr; ctx.fillRect(p.x - dx * L - dy * 1.2, p.y - dy * L - dx * 1.2, dx * 2 * L + dy * 2.4, dy * 2 * L + dx * 2.4); }
      ctx.restore(); } }
  // the meteor's streak: a tapered white-hot line along its path behind the head (21-31), fading after the burst
  if (t > 21 && t < T_BURST + 0.8) { const pts = []; for (let k = 0; k <= 24; k++) { const tk = lerp(Math.max(21, t - 4.5), Math.min(t, T_BURST), k / 24); pts.push(toScreen(astDir(tk))); }
    const fade = t > T_BURST ? 1 - ss(T_BURST, T_BURST + 0.8, t) : ss(21, 22, t), gl = Math.min(astGlow(t), 3);
    ctx.save(); screen(); ctx.lineCap = 'round'; ctx.filter = 'blur(3px)';
    for (const [wd, col, al] of [[54, '255,150,70', 0.22], [24, '255,205,140', 0.5], [9, '255,252,240', 0.95]]) for (let k = 1; k < pts.length; k++) { const u = k / (pts.length - 1);
      ctx.strokeStyle = `rgba(${col},${al * fade * u})`; ctx.lineWidth = wd * (0.4 + 0.6 * u) * (0.6 + 0.25 * gl); ctx.beginPath(); ctx.moveTo(pts[k - 1].x, pts[k - 1].y); ctx.lineTo(pts[k].x, pts[k].y); ctx.stroke(); }
    ctx.restore(); }
  // the heat: an amber cast
  { const am = ss(32.5, 38, t) * (1 - ss(44, 52, t)); pvTint('#ff8a3a', 0.06 * am, 'overlay'); pvTint('#ffb070', 0.04 * am); }
  // the last second before the blast: the wall is on us, a rolling brown gradient climbing over the frame
  if (t > 56.0 && t < T_HIT) { const k = ss(56.0, T_HIT, t), y0 = lerp(H * 0.9, -H * 0.3, Math.pow(k, 1.3)); ctx.save(); screen(); const gr = ctx.createLinearGradient(0, y0 - 500, 0, y0 + 300);
    gr.addColorStop(0, 'rgba(150,124,96,0)'); gr.addColorStop(0.55, 'rgba(146,118,90,0.85)'); gr.addColorStop(1, 'rgba(126,100,76,0.97)'); ctx.fillStyle = gr; ctx.fillRect(0, y0 - 500, W, H - y0 + 500 + 400);
    const R = RNG('wallTop'); for (let i = 0; i < 14; i++) { const x = R.r(-100, W + 100), r = R.r(140, 320); const px = x + Math.sin(t * 2 + i) * 30, py = y0 - 140 + R.n(60), g2 = ctx.createRadialGradient(px, py, 0, px, py, r); g2.addColorStop(0, 'rgba(156,128,100,0.85)'); g2.addColorStop(1, 'rgba(156,128,100,0)'); ctx.fillStyle = g2; ctx.fillRect(px - r, py - r, 2 * r, 2 * r); }
    ctx.restore(); }
  // the flash
  pvTint('#fffaf0', flashA(t) * 0.92);
  // the blast: a brown-out, dust motes and grit streaking past
  if (t >= T_HIT && t < 64) { const a = t - T_HIT; pvTint('#8a6e52', clamp(0.92 * Math.exp(-a * 1.1) + 0.1));
    const R = RNG('motes'); ctx.save(); screen(); for (let i = 0; i < 70; i++) { const sp = R.r(200, 900), x = mod(R.r(0, W) + a * sp, W + 200) - 100, y = mod(R.r(0, H) + a * sp * R.r(-0.15, 0.25), H), r = R.r(3, 26);
      ctx.globalAlpha = R.r(0.12, 0.4) * (1 - ss(60, 63.5, t) * 0.7); const g2 = ctx.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, 'rgba(60,44,30,0.9)'); g2.addColorStop(1, 'rgba(60,44,30,0)'); ctx.fillStyle = g2; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    ctx.restore(); }
  // the blast on the lens: debris tumbling past right in front of the camera (planks, shingles, branches, leaves), blurred by speed
  if (t >= T_HIT - 0.15 && t < 60.5) { const R = RNG('flyby'); ctx.save(); screen();
    for (let i = 0; i < 46; i++) { const t0 = T_HIT - 0.15 + R.r(0, 2.4) * Math.pow(R.f(), 1.6), a = t - t0, dur = R.r(0.25, 0.7), kind = R.f(), sx = R.r(-300, W + 300), sy = R.r(-200, H * 0.9), vx = R.r(1400, 3600) * (R.f() < 0.8 ? 1 : -1), vy = R.r(-500, 900), sc = R.r(0.6, 2.4), sp = R.r(-12, 12), col = R.pick(['#3a2a1e', '#4a3826', '#2e241c', '#5a4a38', '#6a5a2a']);
      if (a < 0 || a > dur) continue; const x = sx + vx * (a - dur / 2), y = sy + vy * a + 600 * a * a;
      ctx.save(); ctx.translate(x, y); ctx.rotate(sp * a); ctx.globalAlpha = 0.9 * (1 - ss(dur * 0.7, dur, a)); ctx.filter = `blur(${Math.round(2 + sc * 2)}px)`; ctx.fillStyle = col;
      if (kind < 0.45) ctx.fillRect(-90 * sc, -9 * sc, 180 * sc, 18 * sc); else if (kind < 0.7) ctx.fillRect(-28 * sc, -20 * sc, 56 * sc, 40 * sc);
      else if (kind < 0.85) { ctx.lineWidth = 7 * sc; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(-80 * sc, 0); ctx.lineTo(0, 10 * sc); ctx.lineTo(60 * sc, -20 * sc); ctx.moveTo(0, 10 * sc); ctx.lineTo(30 * sc, 40 * sc); ctx.stroke(); }
      else { ctx.fillStyle = R.pick(['#c9a038', '#a8782a', '#8a6a2a']); ctx.beginPath(); ctx.ellipse(0, 0, 16 * sc, 7 * sc, 0, 0, TAU); ctx.fill(); }
      ctx.restore(); }
    ctx.restore(); }
  // ...and one piece strikes the lens: the glass cracks (a star of jagged cracks, rings between them, chipped shards) and stays cracked
  if (t >= T_HIT + 0.12 && t < 63.6) crackedLens(t - T_HIT - 0.12);
  // to black and the end card
  if (t >= 62.6) pvTint('#050403', ss(62.6, 63.6, t));
  if (t >= 63.6) { fillAll('#050403'); endCard(); }
  hud();
  bigTitle(['¿Que pasaría si', 'un meteorito cayera', 'en tu ciudad?'], 0.3, 4.8);
  pvCaption('Una estrella nueva sale con el sol.', 5.4, 12.6);
  pvCaption('Cada segundo brilla más.', 13.4, 20.6);
  pvCaption('Entra en la atmósfera.', 21.4, 27.6);
  pvCaption('Ni un solo sonido.', 28.2, 30.9);
  pvCaption('El cielo se rasga.', 32.0, 36.8);
  pvCaption('Primero llega el calor.', 37.4, 42.8);
  pvCaption('Luego tiembla el suelo.', 43.4, 48.8);
  pvCaption('El bosque cae hacia un lado.', 49.4, 54.8);
  pvCaption('Tápate los oídos.', 55.2, 57.2);
  pvCaption('Esto pasó de verdad. En 1908.', 59.2, 62.5);
}
