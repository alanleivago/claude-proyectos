// =====================================================================
//  RUN — pose the world from TT each frame: far ranges rise as the horizon goes flat; the camera leans with "down"; the lake
//  piles toward the centre; everything rolls; the clouds stream away; the rim interlude; the rim curls up and reaches us;
//  the HUD (how far you can see, gravity's tilt, the risen edges), captions, the card
// =====================================================================
const mixK = (stops, t) => { let c = lin(stops[0][1]); for (let i = 1; i < stops.length; i++) c.lerp(lin(stops[i][1]), ss(stops[i][0], stops[i][2], t)); return c; };
let lu_run = 0;
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position;
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const fk = flatK(t), rk = runK(t), ok = rollK(t), ak = airK(t), bk = bowlK(t);
  const su = g.skyU; su.top.value.copy(C3('#4a5aa0', '#141638', ak)); su.hor.value.copy(C3('#f8c890', '#d89070', ak)); su.sunK.value = 1 - 0.4 * bk;
  g.hemi.intensity = 0.95 - 0.25 * ak - 0.35 * bk; g.sun.intensity = 2.5 * (1 - 0.65 * bk) * (1 - 0.2 * ak);
  g.scene.fog.color.copy(su.hor.value); g.scene.fog.far = lerp(9000, 60000, fk); g.scene.fog.near = lerp(800, 4000, fk);
  g.clouds.forEach((s, i) => { const u = s.userData, run = ak * ak * 26000 * (0.6 + 0.4 * hsh(i)); s.position.set(u.x + t * 25 - run, u.y, u.z); s.scale.set(u.w * (1 + 2.2 * ak), u.w * u.a * (1 - 0.5 * ak), 1); s.material.opacity = u.o * (1 - 0.7 * ak) * (1 - bk); });
  // far ranges rise into view as the curvature goes away
  g.RINGS.forEach((R, k) => { const kk = ss(4 + k * 1.6, 11 + k * 2.2, t); R.m.position.y = -R.hh * 1.3 * (1 - kk); R.m.visible = kk > 0.001 && bk < 0.9; });
  // the lake piles toward the centre (left): the plane tilts, the right side drains; streaks flow left
  const stp = ss(31, 34, t) * (1 - ss(43.8, 44.2, t)); g.lake.rotation.z = -0.04 * rk - 0.11 * stp; g.lake.position.y = LAKE_Y - 1.5 * rk - 14 * stp; lu_run = rk + 1.5 * stp; const lu = g.lakeMat.uniforms; lu.uT.value = t; lu.uRun.value = lu_run; lu.uTop.value.copy(su.top.value); lu.uHor.value.copy(su.hor.value);
  lu.fogColor.value.copy(g.scene.fog.color); lu.fogNear.value = g.scene.fog.near; lu.fogFar.value = g.scene.fog.far;
  // everything rolls toward the centre: rocks and bales roll, animals slide and tumble
  { const cnt = {}; g.ROLL.forEach((o) => { const d = -ok * ok * 520 * o.w * (o.kind === 'rock' ? 1.2 : o.kind === 'hay' ? 1.4 : 0.8), x = o.x + d, y = Math.max(groundH(x, o.z), LAKE_Y - 3);
      const rad = o.kind === 'hay' ? 1.0 : o.kind === 'rock' ? 1.4 : 1.0, spin = d / rad, s = o.s;
      const m = o.kind === 'rock' ? M4c(x, y + 0.8 * s, o.z, o.ry, s, s * 0.8, s, 0, -spin) : o.kind === 'hay' ? M4c(x, y + 1.0, o.z, o.ry * 0.2, s, s, s, -spin, 0) : M4c(x, y + (ok > 0.3 ? 0.3 : 0), o.z, o.ry + Math.sin(t * 3 + o.ph) * 0.3 * ok, s, s, s, Math.sin(t * 5 + o.ph) * 0.6 * ok * ok, -ok * ok * 1.4 * Math.sin(o.ph));
      g.rollI[o.kind].setMatrixAt(o.slot, m); }); Object.values(g.rollI).forEach((m) => (m.instanceMatrix.needsUpdate = true)); }
  g.est.userData.fan.rotation.z = t * (2.5 + 9 * ak);
  // the bowl: the disc's rim curls up around us, closes, and the near lip sweeps in at the hero
  { const b = g.bowlU; g.bowl.visible = t >= 46.6; const hk = ss(T_HERO, T_HERO + 1.1, t); b.uT.value = t; b.uR0.value = lerp(lerp(42000, 1500, Math.pow(bk, 0.6)), 260, hk) - 160 * ss(T_HERO + 2, 64, t); b.uH.value = 34000 * Math.pow(bk, 0.85) + 6000 * hk; b.uC.value = bk; b.uAsp.value = clamp(b.uH.value / Math.max(b.uR0.value, 1) * 0.35, 1, 70); b.uSky.value.copy(su.hor.value); b.uCam.value.set(cp.x, 0, cp.z); }
  // the spray of the oceans arriving with the wall
  // the chaos: rock flying out of the arriving wall, dust billowing, the sky going dark
  const ck = ss(T_HERO, T_HERO + 0.8, t);
  g.DEB.forEach((d, i) => { const a = t - d.t0; if (a < 0 || a > 3.5) { g.debris.setMatrixAt(i, _hid); return; } const rr = d.r0 - d.v * a, y = 20 + d.up * a - 90 * a * a;
    g.debris.setMatrixAt(i, M4c(cp.x + Math.cos(d.a) * rr, Math.max(-5, y), cp.z + Math.sin(d.a) * rr, d.ax + a * d.sp, d.s, d.s * 0.8, d.s, a * d.sp * 0.7, 0)); }); g.debris.instanceMatrix.needsUpdate = true;
  g.dust.forEach((s, i) => { const a = t - T_HERO - hsh(i) * 1.5; if (a < 0 || a > 4.5) { s.visible = false; return; } const ang = -Math.PI / 2 + (hsh(i, 2) - 0.5) * 2.4, rr = 700 - 380 * ss(0, 3, a);
    s.position.set(cp.x + Math.cos(ang) * rr, 30 + a * 40 + hsh(i, 3) * 100, cp.z + Math.sin(ang) * rr); const sz = 160 + a * 120; s.scale.set(sz, sz * 0.8, 1); s.visible = true; s.material.opacity = 0.9 * ss(0, 0.4, a) * (1 - a / 4.5); s.material.color.copy(C3('#5a4030', '#2a1e16', hsh(i, 4))); });
  g.bowlU.uDark.value = ck; if (ck > 0) { su.top.value.lerp(lin('#1a0c08'), ck * 0.8); su.hor.value.lerp(lin('#5a2a18'), ck * 0.7); g.hemi.intensity *= 1 - 0.4 * ck; g.scene.fog.color.copy(su.hor.value); g.scene.fog.far = lerp(g.scene.fog.far, 2500, ck); g.scene.fog.near = lerp(g.scene.fog.near, 200, ck); lu.fogColor.value.copy(su.hor.value); lu.fogFar.value = g.scene.fog.far; lu.fogNear.value = g.scene.fog.near; g.bowlU.uSky.value.copy(su.hor.value); }
  g.r.render(g.scene, g.cam);
  // the round Earth at the start: the picture bows (the horizon falls away at the sides), then snaps flat at ~2 s
  const amp = 150 * (1 - ss(1.7, 2.4, t));
  ctx.save(); screen(); ctx.filter = 'saturate(1.15) contrast(1.04)';
  if (amp < 0.5) ctx.drawImage(g.cv, 0, 0, W, H);
  else for (let x = 0; x < W; x += 6) { const u = (x + 3 - CX) / CX, dy = amp * u * u; ctx.drawImage(g.cv, x, 0, 6, H, x, dy - amp, 6, H + amp); }
  ctx.restore();
}

// ---- the rim of the world (34-44): we stand at the edge; "down" points sideways
function updateEdge(t) {
  const g = g3(), e = edge3(), cam = e.cam, a = t - EDGE0, n = (f, p, k) => Math.sin(t * f + p) * k;
  // like the reference: beside the slab, looking along it (ocean on top, the crust band, the glowing mantle on its face, space);
  // a slow rise and push, then at the end it swings over — "down" points sideways
  const k = (t - EDGE0) / (EDGE1 - EDGE0), sw = ss(0.72, 1, k);
  cam.position.set(lerp(1500, 900, sw) + n(0.3, 1, 6), lerp(450, 1300, ss(0, 0.75, k)) - 500 * sw + n(0.4, 2, 5), lerp(6000, -3000, k)); cam.up.set(0, 1, 0);
  cam.lookAt(lerp(-500, -900, sw), lerp(-800, -200, ss(0, 0.75, k)) - 1500 * sw, cam.position.z - 22000); cam.rotateZ(32 * DEG * sw + n(0.25, 1.3, 0.4) * DEG); cam.updateMatrixWorld();
  e.oceanU.uT.value = t; e.wallU.uT.value = t;
  e.spray.forEach((s, i) => { const ph = mod(t * 0.35 + hsh(i), 1); s.position.set(-250 + hsh(i, 2) * 300, 60 + ph * 160, cam.position.z - 3000 - hsh(i, 3) * 20000); const sz = 200 + ph * 300; s.scale.set(sz, sz, 1); s.material.opacity = 0.6 * Math.sin(Math.PI * ph); });
  g.r.render(e.scene, cam);
  ctx.save(); screen(); ctx.filter = 'saturate(1.1)'; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: a flock bursting up from the shore when the Earth snaps flat (2-8 s); condors gliding (0-22)
function flock(t) {
  if (t < 1.9 || t > 9) return; const R = RNG('flockP'); ctx.save(); screen(); ctx.strokeStyle = 'rgba(30,26,28,0.85)'; ctx.lineWidth = 2;
  for (let i = 0; i < 90; i++) { const t0 = 1.9 + R.r(0, 0.6), a = t - t0; if (a < 0) continue; const x0 = R.r(150, 900), y0 = R.r(1050, 1180), vx = R.r(-60, 140), vy = R.r(-230, -110), x = x0 + vx * a + Math.sin(a * 2 + i) * 20, y = y0 + vy * a + 9 * a * a, s = R.r(5, 9) * (1 - 0.3 * Math.min(1, a / 6)), fl = Math.sin(t * 16 + i) * 0.8;
    if (y < 120) continue; ctx.beginPath(); ctx.moveTo(x - s, y - s * fl); ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.3, x, y); ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.3, x + s, y - s * fl); ctx.stroke(); }
  ctx.restore();
}
function sky2D(t) {
  flock(t);
  if (t > 22) return; const R = RNG('condors'); ctx.save(); screen(); ctx.fillStyle = `rgba(28,24,26,${0.85 * (1 - ss(19, 22, t))})`;
  for (let i = 0; i < 4; i++) { const x = mod(R.r(0, W) + t * R.r(12, 30), W + 300) - 150, y = R.r(380, 760) + Math.sin(t * 0.4 + i) * 30, s = R.r(16, 28), fl = 0.12 * Math.sin(t * 1.2 + i);
    ctx.beginPath(); ctx.moveTo(x - s * 2.2, y - s * (0.15 + fl)); ctx.quadraticCurveTo(x - s * 0.8, y - s * 0.35, x, y); ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.35, x + s * 2.2, y - s * (0.15 + fl)); ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.12, x, y + s * 0.18); ctx.quadraticCurveTo(x - s * 0.8, y - s * 0.12, x - s * 2.2, y - s * (0.15 + fl)); ctx.fill(); }
  ctx.restore();
}

// ---- HUD
const degTxt = (d) => (d < 10 ? d.toFixed(1).replace('.', ',') : Math.round(d)) + '°';
function hud() {
  const t = TT; if (t < 0.4 || t >= 64.5) return; const a = ev(0.4, 0.4) * (t > 64 ? 1 - ev(64, 0.4) : 1) * (t > 33.7 && t < 34.4 ? 0 : 1) * (t > 43.7 && t < 44.4 ? 0 : 1);
  if (t >= T_HERO) { pvHud('Bordes elevados', 'AQUÍ', 'la Tierra se cierra', a); return; }
  if (t >= 44) { pvHud('Bordes elevados', `${pvNum(Math.round(edgeKm(t)))} km`, 'hacia nosotros', a); return; }
  if (isEdge(t)) { pvHud('Inclinación de la gravedad', '71°', 'en el borde del mundo', a); return; }
  if (t >= 18) { pvHud('Inclinación de la gravedad', degTxt(tiltDeg(t)), t < 31 ? 'hacia el centro' : 'más cerca del borde', a); return; }
  pvHud('Alcance de la vista', `${pvNum(Math.round(viewKm(t)))} km`, t < 2 ? 'tierra redonda' : 'tierra plana', a);
}
function endCard() {
  const a = ev(64.8, 0.8), b = ev(65.8, 0.8), c = ev(66.9, 0.7), c2 = ev(67.8, 0.5), e = ev(68.5, 0.6);
  const f = () => {
    pvText('¿Qué pasaría si', CX, 740, 54, { align: 'center', alpha: a });
    pvText('la Tierra', CX, 810, 54, { align: 'center', alpha: a });
    pvText('fuera plana?', CX, 880, 54, { align: 'center', alpha: a });
    pvText('LA GRAVEDAD EMPUJA A LOS MUNDOS GRANDES', CX, 980, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('A SER ESFERAS. EL TAMAÑO NECESARIO', CX, 1018, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('DEPENDE DE QUÉ ESTÉN HECHOS.', CX, 1056, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('Pero tranquilo, esto no puede pasar...', CX, 1170, 42, { italic: true, align: 'center', alpha: c * 0.92 });
    pvText('¿o sí?', CX, 1250, 58, { italic: true, align: 'center', alpha: c2 });
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
function sceneFlat() {
  const t = TT;
  if (t < 64.5) { if (isEdge(t)) updateEdge(t); else { update(t); sky2D(t); } }
  if (t >= 33.6 && t < EDGE0) pvTint('#05060c', ss(33.6, EDGE0, t));
  if (t >= EDGE0 && t < EDGE0 + 0.5) pvTint('#05060c', 1 - ss(EDGE0, EDGE0 + 0.5, t));
  if (t >= 43.6 && t < EDGE1) pvTint('#05060c', ss(43.6, EDGE1, t));
  if (t >= EDGE1 && t < EDGE1 + 0.5) pvTint('#05060c', 1 - ss(EDGE1, EDGE1 + 0.5, t));
  if (t >= T_HERO && t < T_HERO + 0.35) pvTint('#ffffff', 0.35 * (1 - ss(T_HERO, T_HERO + 0.35, t)));
  if (t >= T_HERO && t < 64) { const ph = mod((t - T_HERO) * 2.3, 1), k = hsh(Math.floor((t - T_HERO) * 2.3), 9); if (k > 0.55) pvTint(k > 0.8 ? '#ffffff' : '#ff9a50', 0.18 * (1 - ss(0, 0.35, ph)) * (1 - ss(62, 64, t))); }
  if (t >= 64 && t < 64.5) pvTint('#0a0d12', ss(64, 64.5, t));
  if (t >= 64.5) { fillAll('#0a0d12'); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si', 'la Tierra', 'fuera plana?'], 0.2, 3.7);
  pvCaption('El horizonte se vuelve plano.', 4.2, 7.8);
  pvCaption('La Tierra ahora es un disco.', 8.2, 10.8);
  caption2('Aparecen montañas', 'a miles de kilómetros.', 11.2, 14.8);
  caption2('El horizonte de siempre', 'desapareció.', 15.2, 17.8);
  caption2('Pero "abajo"', 'empieza a inclinarse.', 18.2, 21.8);
  pvCaption('El lago corre hacia el centro.', 22.2, 24.8);
  pvCaption('Todo rueda hacia el mismo lado.', 25.2, 27.8);
  pvCaption('Hasta el aire se escurre.', 28.2, 30.8);
  caption2('Cuanto más lejos del centro,', 'más empinado.', 31.2, 33.6);
  pvCaption('Mientras tanto, en el borde...', 34.6, 37.4);
  pvCaption('Los océanos no se caen.', 37.7, 39.6);
  caption2('La gravedad', 'los arrastra de vuelta.', 39.9, 41.6);
  caption2('Aquí, "abajo"', 'apunta hacia el costado.', 41.8, 43.6);
  caption2('La gravedad odia', 'las cosas planas.', 44.4, 46.8);
  caption2('Los bordes empiezan', 'a levantarse.', 47.2, 50.8);
  caption2('Los océanos se vienen', 'hacia nosotros.', 51.2, 54.8);
  caption2('Se aplasta a sí misma', 'hasta formar una bola.', 55.2, 58.7);
  caption2('La Tierra quiere', 'ser redonda.', 60.0, 63.8);
}
