// =====================================================================
//  RUN — pose the world from TT each frame: everyone runs, the asphalt softens, things burst, the sea boils, plastic melts,
//  a cloud whose rain never lands, popcorn, paper, petrol, wood ignite; smoke, char, the glow; the steel gives way;
//  the heat shimmer, embers, the HUD temperature, the captions, the card
// =====================================================================
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position;
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const hz = ss(7, 24, t), sk = ss(27, 46, t), gl = glowK(t), ch = charK(t);
  // the sky: golden hour → a white heat haze → orange smoke, a red sun → a dark red glow
  const su = g.skyU; su.top.value.copy(C3('#6f7fc0', '#a4a6c4', hz).lerp(lin('#5a3c30'), sk).lerp(lin('#1e100c'), gl)); su.hor.value.copy(C3('#f6c890', '#fae2b8', hz).lerp(lin('#d0763a'), sk).lerp(lin('#6a2010'), gl));
  su.sunCol.value.copy(C3('#fff0c8', '#ff7038', sk).lerp(lin('#ff3a18'), gl)); su.sunK.value = 1 - 0.35 * sk;
  g.hemi.intensity = 0.85 + 0.15 * hz - 0.3 * sk - 0.35 * gl; g.hemi.color.copy(C3('#c8d0f0', '#f0d8c0', hz).lerp(lin('#d89060'), sk)); g.hemi.groundColor.copy(C3('#8a6a50', '#a04a20', sk));
  g.sun.intensity = 2.6 - 1.3 * sk - 1.1 * gl; g.sun.color.copy(C3('#ffd8a8', '#ff8040', sk));
  g.scene.fog.color.copy(su.hor.value); g.scene.fog.far = 7000 - 3800 * sk + 600 * gl; g.scene.fog.near = 500 - 300 * sk;
  g.r.toneMappingExposure = 1.05 + 0.1 * gl;
  g.clouds.forEach((s) => { const u = s.userData; s.position.set(u.x + t * 25, u.y, u.z); s.scale.set(u.w, u.w * u.a, 1); s.material.opacity = u.o * (1 - sk); s.material.color.copy(C3('#fff4e8', '#ffffff', hz)); });
  NAT.uDry.value = dryK(t); NAT.uChar.value = ch; NAT.uGlow.value = gl; NAT.uSoot.value = ss(T_WOOD, 50, t);
  const sea = g.seaMat.uniforms; sea.uT.value = t; sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.uSunCol.value.copy(su.sunCol.value).multiplyScalar(su.sunK.value); sea.uBoil.value = clamp((t - T_BOIL) / 38); sea.uGlow.value = gl;
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  // the road goes soft and glossy (~50 °C)
  const so = softK(t); g.roadMat.color.copy(C3('#ffffff', '#6a6a6c', so)); g.roadMat.roughness = 0.9 - 0.55 * so; g.roadMat.metalness = 0.1 * so;
  // people: at 4 s everyone runs for the buildings; the ones lying down get up first; all inside by ~7.6 s
  g.FOLK.forEach((f, i) => { const a = Math.max(0, t - 4.3), up = f.lie ? ss(4.2, 4.8, t) : 1, run = f.run * Math.max(0, a - (f.lie ? 0.5 : 0));
    const fair = f.x > 60, x = f.x + (t < 4.3 ? (fair ? 0 : 0.3 * Math.sin(t * 0.5 + f.ph)) : run * (fair ? 0.6 : 1)), z = f.z + (t < 4.3 ? f.v * t : (fair ? f.dir * run * 0.8 : 0.25 * run * f.dir)) + (t >= 4.3 ? f.v * 4.3 : 0);
    const on = t < f.t1, bob = Math.abs(Math.sin(t * (t > 4.3 ? 14 : 6) + f.ph)) * (t > 4.3 ? 0.12 : 0.05);
    const m = on ? M4c(x, groundH(x, z) + 0.05 + bob, z, t > 4.3 ? -Math.PI / 2 : f.v > 0 ? 0 : Math.PI, f.s, f.s, f.s, f.lie ? -Math.PI / 2 * (1 - up) : 0) : _hid; g.folkB.setMatrixAt(i, m); g.folkH.setMatrixAt(i, m); });
  g.folkB.instanceMatrix.needsUpdate = true; g.folkH.instanceMatrix.needsUpdate = true;
  // cars: driving until 4 s, stopping; sinking in the soft asphalt; each one catches fire when its petrol fumes ignite
  g.CARS.forEach((cc, i) => { const a = Math.max(0, t - 4), dist = cc.v * (Math.min(t, 4) + (1 - Math.exp(-a * 1.6)) / 1.6), z = cc.park ? cc.z0 : -1150 + mod(cc.z0 + 1150 + dist, 1245);
    const fa = t - cc.t0, jump = fa > 0 && fa < 0.6 ? Math.sin(fa / 0.6 * Math.PI) * (cc.station ? 3 : 0.9) : 0, sink = 0.22 * so;
    const base = M4c(cc.x, 0.06 - sink + jump, z, (cc.v < 0 ? Math.PI : 0) + Math.PI / 2 + (cc.park ? 0 : 0) + (fa > 0 ? 0.15 * Math.sin(i) * ss(0, 0.6, fa) : 0), 1, 1, 1, 0.02 * so * Math.sin(i * 3), 0.03 * so * Math.cos(i));
    g.carBody.setMatrixAt(i, base); g.carTop.setMatrixAt(i, fa > 0.1 ? _hid : base); g.carBody.setColorAt(i, lin(cc.c).lerp(lin('#141210'), ss(0, 4, fa)));
    [[1.45, 0.82], [1.45, -0.82], [-1.45, 0.82], [-1.45, -0.82]].forEach(([a2, c2], k) => g.wheels.setMatrixAt(i * 4 + k, fa > 1 ? _hid : base.clone().multiply(M4c(a2, 0.34, c2)))); });
  [g.carBody, g.carTop, g.wheels].forEach((m) => (m.instanceMatrix.needsUpdate = true)); g.carBody.instanceColor.needsUpdate = true;
  // the fair: the wheel and the carousel coast to a stop; the bulbs die; plastic slumps; canvas burns away
  { const sp = Math.min(t, 4) + (1 - Math.exp(-Math.max(0, t - 4) * 0.6)) / 0.6; g.rot.rotation.z = -0.05 * sp; const f = ss(T_STEEL + 0.2, T_STEEL + 2.8, t);
    g.cabins.forEach((cb, k) => { const a = k / 24 * TAU + g.rot.rotation.z, R = 34 * (1 - 0.18 * f); cb.position.set(Math.cos(a) * R, 41 + Math.sin(a) * R * (1 - 0.25 * f), 0); cb.rotation.z = 0.2 * f * Math.sin(k); cb.visible = t < T_STEEL + 0.6 + hsh(k) * 1.5; });
    g.rot.scale.set(1 + 0.05 * f, 1 - 0.12 * f, 1); g.wheel.rotation.z = 1.45 * f * f; g.wheel.position.y = -1.5 * f;
    const bulbs = t < 24.5 ? 1 : t < 26.5 ? (hsh(Math.floor(t * 12)) > 0.5 ? 1 : 0.2) : 0; g.wheelBulbs.material.opacity = bulbs; g.strLights.material.opacity = bulbs;
    g.carousel.userData.spin.rotation.y = 0.35 * (Math.min(t, 4) + (1 - Math.exp(-Math.max(0, t - 4) * 0.8)) / 0.8); g.carousel.visible = t < 46;
    const mk = meltK(t); g.castle.scale.set(1 + 0.25 * mk, 1 - 0.78 * mk, 1 + 0.25 * mk); g.castle.visible = t < 40;
    const tb = ss(T_PAPER + 4, T_PAPER + 10, t); g.tent.userData.roof.scale.set(1 - 0.2 * tb, 1 - 0.85 * tb, 1 - 0.2 * tb); g.tent.userData.roof.position.y = 15.5 - 9 * tb; g.tent.visible = t < 44;
    g.STALLS.forEach((s, i) => g.stallB.setMatrixAt(i, M4c(s.x, GY, s.z, 0, 1, 1 - 0.7 * ss(T_PAPER + 6, T_PAPER + 14, t), 1))); g.stallB.instanceMatrix.needsUpdate = true;
    g.awnings.forEach((m) => (m.visible = t < T_PAPER + 3));
    g.BAL.forEach((b, i) => { const on = t < b.t0, sw = Math.sin(t * 1.3 + i) * 0.2; g.balloons.setMatrixAt(i, on ? M4c(b.x + sw, b.y + Math.sin(t * 1.7 + i * 2) * 0.12 + 0.6 * ss(6, 10, t), b.z, 0, 1 + 0.25 * ss(6, b.t0, t), 1 + 0.25 * ss(6, b.t0, t), 1 + 0.25 * ss(6, b.t0, t)) : _hid); }); g.balloons.instanceMatrix.needsUpdate = true; }
  // the gas station: the fumes go up at T_STATION — the canopy lifts, tips and drops
  { const a = t - T_STATION; if (a > 0) { const up = Math.min(a, 1.4), y = 14 * up - 0.5 * 20 * up * up; g.canopy.position.y = Math.max(-5.8, y); g.canopy.rotation.set(0.5 * ss(0, 1.2, a), 0, 0.35 * ss(0, 1.2, a)); } else { g.canopy.position.y = 0; g.canopy.rotation.set(0, 0, 0); } }
  // popcorn: kernels burst out of the machine and rain over the boardwalk; the kiosk burns with the paper
  { const o = [KIOSK_P.x - 0.8, 1.6 + 0.6, KIOSK_P.z + 1.6]; g.POP.forEach((p, i) => { const a = t - p.t0; if (a < 0 || t > T_PAPER + 1.5) { g.popcorn.setMatrixAt(i, _hid); return; } const tl = Math.min(a, (p.vy + Math.sqrt(p.vy * p.vy + 2 * 9.8 * (o[1] - 0.65))) / 9.8);
      const x = o[0] + p.vx * tl, y = Math.max(0.65, o[1] + p.vy * tl - 4.9 * tl * tl), z = o[2] + p.vz * tl; g.popcorn.setMatrixAt(i, M4c(x, y, z, p.ry + a * 3, p.s, p.s, p.s)); }); g.popcorn.instanceMatrix.needsUpdate = true; g.kiosk.visible = t < T_PAPER + 9; }
  // the beach: umbrellas sag as the plastic melts, then burn; towels char; loungers and kayaks slump; balls burst
  { const mk0 = T_MELT; g.UMB.forEach((u, i) => { const m = ss(mk0 + u.t * 1.2, mk0 + 1.6 + u.t * 1.2, t), gone = t > T_PAPER + 0.8 + u.t * 2.2, y = groundH(u.x, u.z);
      g.umbPole.setMatrixAt(i, M4c(u.x, y, u.z, 0, 1, 1 - 0.3 * m, 1, u.tilt + 0.25 * m * Math.sin(i), 0)); g.umbTop.setMatrixAt(i, gone ? _hid : M4c(u.x, y - 1.1 * m, u.z, i, 1 - 0.55 * m, 1 + 0.9 * m, 1 - 0.55 * m, u.tilt + 0.35 * m * Math.sin(i), 0.3 * m * Math.cos(i))); });
    g.umbPole.instanceMatrix.needsUpdate = true; g.umbTop.instanceMatrix.needsUpdate = true;
    g.TOW.forEach((w, i) => g.towels.setColorAt(i, lin(g.TOW[i].c).lerp(lin('#1a1612'), ss(T_PAPER + 0.5, T_PAPER + 4, t)))); g.towels.instanceColor.needsUpdate = true;
    const mk = meltK(t); g.LOU.forEach((l, i) => g.lounge.setMatrixAt(i, M4c(l.x, groundH(l.x, l.z), l.z, l.ry, 1 + 0.3 * mk, 1 - 0.75 * mk, 1 + 0.1 * mk))); g.lounge.instanceMatrix.needsUpdate = true;
    g.KAY.forEach((k, i) => g.kayaks.setMatrixAt(i, M4c(k.x, groundH(k.x, k.z) + 0.2 - 0.12 * mk, k.z, k.ry, 1 + 0.1 * mk, 1 - 0.6 * mk, 1 + 0.6 * mk))); g.kayaks.instanceMatrix.needsUpdate = true;
    g.BALLS.forEach((b, i) => g.balls.setMatrixAt(i, t < b.t0 ? M4c(b.x, groundH(b.x, b.z) + 0.4, b.z, i, 1 + 0.15 * ss(6, b.t0, t), 1 + 0.15 * ss(6, b.t0, t), 1 + 0.15 * ss(6, b.t0, t)) : _hid)); g.balls.instanceMatrix.needsUpdate = true; }
  // boats: rocking; the boiling sea shakes them; their sails burn
  g.BOATS.forEach((b, i) => { const bk = clamp((t - T_BOIL) / 38) * 2600 > (shoreAt(b.z) - b.x) ? 1 : 0, rk = 0.04 + 0.1 * bk, a = b.ry + 0.05 * Math.sin(t * 0.2 + i), x = b.x + Math.sin(a) * b.v * Math.min(t, 6), z = b.z - Math.cos(a) * b.v * Math.min(t, 6);
    const m = M4c(x, SEA_Y + 0.1 + 0.2 * Math.sin(t * 1.7 + i) * (1 + 2 * bk) - 0.6 * ss(b.t0 + 8, b.t0 + 16, t), z, a, b.s, b.s, b.s, rk * Math.sin(t * 1.1 + i), rk * Math.sin(t * 1.4 + i * 2)); g.hulls.setMatrixAt(i, m); g.sails.setMatrixAt(i, t < b.t0 + 4.5 ? m : _hid); });
  g.hulls.instanceMatrix.needsUpdate = true; g.sails.instanceMatrix.needsUpdate = true;
  // the steel: the pier sags into the sea, the cranes' booms fold and the frames lean over the water (T_STEEL)
  g.PIER.forEach((p) => { const d = t - T_STEEL - Math.abs(p.k - 5.5) * 0.07; if (d <= 0) { p.s.position.y = 7; p.s.rotation.set(0, 0, 0); return; } const f = Math.min(1, d * d * 1.4); p.s.position.y = 7 - 12 * f; p.s.rotation.set(p.sp * 0.3 * f, 0, p.sp * 0.35 * f); });
  g.CRANES.forEach((cr) => { const a = t - cr.tf, f = ss(0, 1.6, a), f2 = ss(0.6, 3.2, a); cr.boom.rotation.z = 0.55 * f * f; cr.g.rotation.z = 0.75 * f2 * f2; cr.g.position.y = 2.5 - 14 * f2; });
  // steam off the boiling sea
  g.steam.forEach((s, i) => { const a0 = t - T_BOIL - hsh(i) * 4; if (a0 < 0) { s.visible = false; return; } const per = 6, a = mod(a0, per), cyc = Math.floor(a0 / per), front = clamp((t - a - T_BOIL) / 38) * 2600;
    const z = lerp(-1300, 60, hsh(i * 7 + cyc, 2)), x = shoreAt(z) - 4 - hsh(i * 3 + cyc, 3) * Math.min(front, 900); s.position.set(x + a * 3, SEA_Y + 2 + a * 9, z); const sz = 10 + a * 9 + Math.min(front, 600) * 0.02; s.scale.set(sz, sz * 0.8, 1); s.visible = true;
    s.material.opacity = 0.38 * ss(0, 1, a) * (1 - a / per) * (1 - 0.6 * sk); s.material.color.copy(C3('#f4f4f2', '#d8b8a0', sk)); });
  // the cloud the steam builds a kilometre up, and its rain that never reaches the ground
  { const ck = cloudK(t); g.cloud.forEach((s, i) => { if (ck <= 0.01) { s.visible = false; return; } const u = hsh(i, 2), v = hsh(i, 3), lay = hsh(i, 4), rr = 420 * (1 - 0.65 * lay) * Math.sqrt(u), an = v * TAU, x = -320 + Math.cos(an) * rr, z = -1500 + Math.sin(an) * rr * 0.5, y = 330 + lay * 330 * ck; s.position.set(x + t * 3, y, z); const sz = (230 + 170 * hsh(i, 5)) * (0.35 + 0.65 * ck) * (1 - 0.3 * lay); s.scale.set(sz * 1.2, sz, 1); s.visible = true;
      s.material.opacity = 0.75 * ck; s.material.color.copy(C3('#ffffff', '#b8b4b0', hsh(i, 6) * 0.5 + 0.5 * (1 - lay)).lerp(lin('#c0703a'), sk)); });
    const vk = virgaK(t); g.virga.forEach((s, i) => { if (vk <= 0.01) { s.visible = false; return; } if (i >= 16) { s.visible = false; return; } const x = -320 + (hsh(i, 7) - 0.5) * 560, z = -1500 + (hsh(i, 8) - 0.5) * 300; s.position.set(x + t * 3, 230, z); s.scale.set(110, 170 + 60 * hsh(i, 9), 1); s.visible = true; s.material.opacity = 0.5 * vk; }); }
  // fires: each lights at its own time, burns, then glows as embers until the steel goes
  let act = 0; g.FIRES.forEach((f, i) => { const s = g.flames[i], a = t - f.t0; if (a < 0 || t > 64.2) { s.visible = false; return; } const burn = a < f.t1 - f.t0, k = burn ? ss(0, 0.5, a) * (1 - ss(f.t1 - f.t0 - 2, f.t1 - f.t0, a)) : 0;
    const em = !burn ? 0.35 * (1 - ss(54, 60, t)) : 0, fl = 0.75 + 0.25 * Math.sin(t * 17 + f.ph) * Math.sin(t * 11.3 + f.ph * 2);
    const sz = f.s * (burn ? (0.4 + 0.6 * ss(0, 1.2, a)) * fl : 0.35); if (k + em < 0.02) { s.visible = false; return; } act += k * f.s;
    s.position.set(f.x, f.y, f.z); s.scale.set(sz, sz * 1.9, 1); s.visible = true; s.material.opacity = Math.min(1, k + em); s.material.color.copy(burn ? C3('#ffffff', '#ffb070', hsh(i, 3)) : lin('#ff4a18')); });
  g.fireLight.intensity = Math.min(4, act / 1800) * 2.2; g.fireLight.position.set(40 + 30 * Math.sin(t * 2.3), 30, -180);
  // smoke from the biggest fires, leaning with the wind
  g.smoke.forEach((s, i) => { const f = g.FIRES[g.BIGF[(i * 37) % g.BIGF.length]], a0 = t - f.t0 - hsh(i) * 2; if (a0 < 0 || t > 64.2) { s.visible = false; return; } const per = 9, a = mod(a0, per), age = a0 - a;
    if (age > (f.t1 - f.t0) + 6) { s.visible = false; return; } s.position.set(f.x + a * 6, f.y + 4 + a * 11, f.z - a * 2); const sz = f.s * 2 + a * 9; s.scale.set(sz, sz, 1); s.visible = true;
    s.material.opacity = 0.55 * ss(0, 1, a) * (1 - a / per); s.material.color.copy(C3('#3a3632', '#7a6c60', hsh(i, 4)).lerp(lin('#2a1008'), gl)); });
  // pops: each balloon and ball bursts in a quick white puff
  { const P = g.BAL.map((b) => [b.x, b.y, b.z, b.t0, 1.4]).concat(g.BALLS.map((b) => [b.x, groundH(b.x, b.z) + 0.4, b.z, b.t0, 1.1])); g.pops.forEach((s, i) => { const [x, y, z, t0, k] = P[i], a = t - t0; if (a < 0 || a > 0.45) { s.visible = false; return; }
    s.position.set(x, y, z); const sz = k * (1 + 5 * ss(0, 0.3, a)); s.scale.set(sz, sz, 1); s.visible = true; s.material.opacity = 0.9 * (1 - a / 0.45); s.material.color.set('#ffffff'); }); }
  // the gas station's fireball
  g.fireball.forEach((s, i) => { const a = t - T_STATION - hsh(i) * 0.25; if (a < 0 || a > 3.4) { s.visible = false; return; } const ang = hsh(i, 2) * TAU, r = 6 + 14 * ss(0, 1, a);
    s.position.set(STATION_P.x + Math.cos(ang) * r * 0.6, 5 + a * 14 + hsh(i, 3) * 8, STATION_P.z + Math.sin(ang) * r * 0.6); const sz = 14 + a * 22; s.scale.set(sz, sz, 1); s.visible = true;
    s.material.opacity = 0.9 * (1 - a / 3.4); s.material.color.copy(C3('#fff0c0', '#ff5a10', ss(0, 0.8, a)).lerp(lin('#3a2010'), ss(1.2, 3.2, a))); });
  // spray and steam where the steel hits the sea
  g.splash.forEach((s, i) => { const k = i % 3, a = t - (k === 0 ? T_STEEL + 0.6 : k === 1 ? g.CRANES[i % 3].tf + 1.4 : T_STEEL + 1.6) - hsh(i) * 0.6; if (a < 0 || a > 4) { s.visible = false; return; }
    const src = k === 0 ? [lerp(-230, 20, hsh(i, 2)), PIER_Z] : k === 1 ? [QUAY_X - 30 - hsh(i, 2) * 70, g.CRANES[i % 3].g.position.z] : [WHEEL_P.x - 10 - hsh(i, 2) * 70, WHEEL_P.z];
    s.position.set(src[0], (k === 2 ? 1 : SEA_Y) + a * (k === 2 ? 5 : 10), src[1] + (hsh(i, 3) - 0.5) * 16); const sz = (k === 2 ? 10 : 16) + a * (k === 2 ? 10 : 18); s.scale.set(sz, sz * (k === 2 ? 0.7 : 1.2), 1); s.visible = true;
    s.material.opacity = (k === 2 ? 0.6 : 0.75) * (1 - a / 4); s.material.color.copy(k === 2 ? C3('#6a3a24', '#2a1a12', hsh(i, 4)) : C3('#f0e8e0', '#c08060', gl)); });

  g.r.render(g.scene, g.cam);
  // the heat shimmer: the picture wavers in strips as the air heats up
  const amp = 2.2 * ss(8, 24, t) + 2.5 * ss(30, 50, t);
  ctx.save(); screen(); ctx.filter = 'saturate(1.25) contrast(1.05)';
  if (amp < 0.05) ctx.drawImage(g.cv, 0, 0, W, H);
  else for (let y = 0; y < H; y += 8) { const dx = amp * Math.sin(y * 0.045 + t * 9) * Math.sin(y * 0.013 + t * 2.1) * (0.4 + 0.6 * y / H); ctx.drawImage(g.cv, 0, y, W, 8, dx, y, W, 8); }
  ctx.restore();
}

// ---- 2D: gulls before the heat; embers and ash rising; a hot vignette
function sky2D(t) {
  ctx.save(); screen();
  if (t < 6) { const R = RNG('gullsH'); ctx.strokeStyle = `rgba(250,246,240,${0.9 * (1 - ss(4.5, 6, t))})`; ctx.lineWidth = 2.4; for (let i = 0; i < 9; i++) { const x = mod(R.r(0, W) + t * R.r(30, 70) * (t > 4 ? 2.5 : 1), W + 200) - 100, y = R.r(380, 820) + Math.sin(t * 0.7 + i) * 20, s = R.r(8, 14), fl = Math.sin(t * 7 + i) * 0.6; ctx.beginPath(); ctx.moveTo(x - s, y - s * fl); ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.4, x, y); ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.4, x + s, y - s * fl); ctx.stroke(); } }
  const ek = ss(T_PAPER, 34, t) * (1 - ss(62, 64.2, t)); if (ek > 0) { const R = RNG('embersH'); for (let i = 0; i < 160 * ek; i++) { const sp = R.r(60, 220), x = mod(R.r(0, W) + Math.sin(t * 1.3 + i) * 30 + t * 25, W), y = H - mod(R.r(0, H) + t * sp, H + 40), r = R.r(1.2, 3.4), fl = 0.5 + 0.5 * Math.sin(t * 13 + i * 3);
      ctx.fillStyle = i % 4 ? `rgba(255,${140 + 80 * fl},60,${0.8 * fl})` : `rgba(60,54,50,0.7)`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } }
  const v = 0.25 * ss(20, 40, t) + 0.12 * glowK(t); if (v > 0) { const g = ctx.createRadialGradient(CX, H * 0.55, H * 0.3, CX, H * 0.55, H * 0.75); g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(1, `rgba(${lerp(220, 120, glowK(t))},${lerp(70, 20, glowK(t))},10,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

// ---- HUD: the temperature
const SUBS = [[0, 'tarde de verano'], [4, '+10 °C por segundo'], [6.6, 'el asfalto · blando'], [T_BURST, 'lo cerrado · revienta'], [T_BOIL, 'el agua · hierve'], [T_MELT, 'el plástico · se derrite'], [16.5, 'nube a 1 km'], [T_POP, 'palomitas · solas'], [21.8, 'sin fuego · todavía'], [T_PAPER, 'el papel · arde solo'], [27.5, 'la gasolina · se enciende'], [T_WOOD, 'la madera · arde'], [40, 'todo lo que arde · arde'], [T_VENUS, 'más que Venus'], [T_DRAPER, 'todo brilla · en rojo'], [T_STEEL, 'el acero · cede'], [60, 'y sigue subiendo']];
function hud() {
  const t = TT; if (t < 0.4 || t >= 64.5) return; const a = ev(0.4, 0.4) * (t > 64 ? 1 - ev(64, 0.4) : 1);
  let sub = SUBS[0][1]; for (const [t0, s] of SUBS) if (t >= t0) sub = s;
  pvHud('Temperatura', `${Math.round(tempC(t))} °C`, sub, a);
}
function endCard() {
  const a = ev(64.8, 0.8), b = ev(66.0, 0.8), b2 = ev(67.2, 0.5), e = ev(68.2, 0.7);
  const f = () => {
    pvText('¿Qué pasaría si', CX, 780, 52, { align: 'center', alpha: a });
    pvText('la temperatura subiera', CX, 848, 52, { align: 'center', alpha: a });
    pvText('10 grados cada segundo?', CX, 916, 52, { align: 'center', alpha: a });
    pvText('Pero tranquilo, esto no puede suceder...', CX, 1060, 40, { italic: true, align: 'center', alpha: b * 0.92 });
    pvText('¿o sí?', CX, 1140, 58, { italic: true, align: 'center', alpha: b2 });
    pvText('ALTERBASETV', CX, 1460, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(84, Math.floor(100 * 760 / wmax)), lh = size * 1.14, y0 = 420;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 60, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function caption2(l1, l2, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { pvFeather(CX, 1360, 560, 150, a); pvText(l1, CX, 1350, 50, { italic: true, align: 'center', alpha: a }); pvText(l2, CX, 1414, 50, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function sceneHeat() {
  const t = TT;
  if (t < 64.5) { update(t); sky2D(t); }
  if (t >= T_STATION && t < T_STATION + 0.5) pvTint('#ffd8a0', 0.45 * (1 - ss(T_STATION, T_STATION + 0.5, t)));
  if (t >= T_STEEL && t < T_STEEL + 0.4) pvTint('#ffffff', 0.35 * (1 - ss(T_STEEL, T_STEEL + 0.4, t)));
  if (t >= 64 && t < 64.5) pvTint('#08050a', ss(64, 64.5, t));
  if (t >= 64.5) { fillAll('#08050a'); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si', 'la temperatura subiera', '10 grados cada segundo?'], 0.2, 3.7);
  caption2('Sube 10 grados cada segundo.', 'Todos corren a refugiarse.', 4.3, 6.5);
  caption2('El asfalto se ablanda.', 'Los autos se hunden.', 6.8, 9.8);
  pvCaption('Lo que está cerrado revienta.', 10.0, 11.5);
  caption2('A 100 °C,', 'el mar hierve en la orilla.', 11.8, 14.4);
  pvCaption('El plástico se derrite.', 14.7, 16.4);
  caption2('El vapor forma una nube.', 'Llueve, pero ninguna gota llega.', 16.7, 19.5);
  caption2('A 180 °C, las palomitas', 'revientan solas.', 19.7, 21.6);
  caption2('Nada se ha quemado todavía.', 'No hubo ninguna chispa.', 21.9, 25.1);
  caption2('A 233 °C,', 'el papel arde solo.', 25.4, 27.4);
  caption2('Los vapores de gasolina', 'se encienden solos.', 27.6, 31.4);
  caption2('A 300 °C arde la madera.', 'Todos los árboles a la vez.', 31.8, 36.2);
  caption2('El humo tapa el sol.', 'Todo lo que puede arder, arde.', 36.6, 42.2);
  pvCaption('El mar humea hasta el horizonte.', 42.6, 47.6);
  caption2('A 464 °C, ya hace más calor', 'que en Venus.', 48.2, 52.2);
  caption2('A 525 °C, todo empieza', 'a brillar en rojo.', 52.6, 55.9);
  caption2('A 550 °C,', 'el acero cede.', 56.8, 60.0);
  caption2('Y sigue subiendo...', '10 grados cada segundo.', 60.4, 63.9);
}
