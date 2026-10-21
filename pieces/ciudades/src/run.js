
// =====================================================================
//  RUN — pose the world from TT each frame: people vanish, cars drift and crash, the lights go out, nature comes back,
//  the metro and the bridge fall, the towers fall, a forest, an ice age; the HUD, the countdown, the captions, the card
// =====================================================================
const jit = (t, i, f, a) => Math.sin(t * f + i * 1.7) * a + Math.sin(t * f * 1.73 + i * 2.9) * a * 0.6;
const _Y = new THREE.Vector3();
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position;
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const nt = night(t), gk = grassK(t), tk = treeK(t), rk = rustK(t), sn = snowK(t), fk = forestK(t);
  // the sky, the light: day, a night (stars), a cold white winter, a warm last day
  const su = g.skyU; su.top.value.copy(C3('#4f86d0', '#0c1430', nt).lerp(lin('#9aa8b8'), sn)); su.hor.value.copy(C3('#d8e6f2', '#1e2a48', nt).lerp(lin('#e8eef4'), sn)); su.starA.value = nt; su.sunK.value = 1 - nt;
  g.hemi.intensity = lerp(1.0, 0.42, nt) + 0.2 * sn; g.hemi.color.copy(C3('#c4d6ee', '#3a4a7a', nt)); g.sun.intensity = 2.3 * (1 - nt) * (1 - 0.5 * sn);
  g.scene.fog.color.copy(C3('#c8d6e4', '#101830', nt).lerp(lin('#e4eaf0'), sn)); g.scene.fog.far = lerp(9000, 3500, sn) * (1 - 0.4 * ss(42, 47, t) * (1 - ss(50, 54, t)));
  g.r.toneMappingExposure = 1.1 + 0.25 * nt;
  g.clouds.forEach((s) => { const u = s.userData; s.position.set(u.x + t * 30, u.y, u.z); s.scale.set(u.w, u.w * u.a, 1); s.material.opacity = u.o * (1 - 0.8 * nt); s.material.color.copy(C3('#ffffff', '#3a4466', nt)); });
  // the river: still; swells muddy (21-26); frozen in the ice age
  const sea = g.seaMat.uniforms; sea.uT.value = t; sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.uMud.value = 0.6 * ss(21, 23, t) * (1 - ss(26, 30, t)); sea.uIce.value = sn;
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far; g.sea.position.y = -2 + 2.4 * ss(21, 23.5, t) * (1 - ss(26, 30, t));
  NAT.uGrass.value = Math.max(gk * 0.75, fk); NAT.uSnow.value = sn; NAT.uLeaves.value = ss(20, 22, t) * (1 - ss(27, 31, t)); NAT.uRust.value = rk;
  // windows: lit through the evening; the grid fails one district at a time at night; glass shatters later
  g.WINU.uOn.value = 1; g.WINU.uPow.value = lightsOn(t); g.WINU.uBroken.value = 0.4 * ss(36, 46, t);
  g.winMats.forEach((m) => (m.emissiveIntensity = (0.15 + 1.3 * nt) * lightsOn(t)));
  g.lampLights.material.opacity = lightsOn(t) * (0.35 + 0.65 * nt);
  g.billboards.forEach((b, i) => { b.panel.material.emissiveIntensity = 0.7 * (t < 11.5 + i * 0.8 ? 1 : 0); b.grp.visible = t < 41 + i; b.grp.rotation.z = rk * 0.3 * Math.sin(i); });
  // people vanish at 4 s
  g.FOLK.forEach((f, i) => { const on = t < 4, x = f.x + (f.along === 'x' ? f.v * t : 0), z = f.z + (f.along === 'z' ? f.v * t : 0), bob = Math.abs(Math.sin(t * 6 + f.ph)) * 0.05;
    const m = on ? M4c(x, GY + 0.3 + bob, z, f.along === 'z' ? (f.v > 0 ? 0 : Math.PI) : (f.v > 0 ? Math.PI / 2 : -Math.PI / 2), f.s, f.s, f.s) : _hid; g.folkB.setMatrixAt(i, m); g.folkH.setMatrixAt(i, m); });
  g.folkB.instanceMatrix.needsUpdate = true; g.folkH.instanceMatrix.needsUpdate = true;
  // cars: driving; at 4 s nobody steers — they drift, some swerve and crash into each other and the kerbs; then they rust and sink into the grass
  { const LX = [-9, -4, 4, 9]; g.CARS.forEach((cc, i) => { let x, z, ry, v = cc.v, tm = Math.min(t, 4); const a = Math.max(0, t - 4), dec = cc.crash ? 0.6 : 0.25, dist = a > 0 ? (v * (1 - Math.exp(-a * dec)) / dec) : 0;
      if (cc.cross) { x = -130 + mod(cc.x0 + 130 + v * tm, 260) + dist; z = -60 + (v > 0 ? -3 : 3); ry = v > 0 ? 0 : Math.PI; }
      else { z = RIVER_Z0 + 68 + mod(cc.z0 - RIVER_Z0 - 68 + v * tm, 40 - RIVER_Z0 - 48) + dist; x = LX[cc.lane] + (cc.crash ? Math.sign(Math.sin(i * 7)) * 4 * ss(4.4, 6.5, t) : 0.6 * Math.sin(a * 0.5 + i) * ss(4, 8, t)); ry = (v > 0 ? 0 : Math.PI) + Math.PI / 2 + (cc.crash ? 0.9 * Math.sin(i) * ss(5, 6.5, t) : 0); }
      const rust = ss(36 + hsh(i) * 4, 44 + hsh(i) * 4, t), gone = t > 46 + hsh(i, 2) * 8, base = gone ? _hid : M4c(x, GY + 0.02 - 0.5 * rust, z, ry, 1, 1 - 0.3 * rust, 1, 0, 0.05 * rust * Math.sin(i));
      g.carBody.setMatrixAt(i, base); g.carTop.setMatrixAt(i, gone ? _hid : base); g.carBody.setColorAt(i, lin(cc.c).lerp(lin('#6a4a34'), rust * 0.85));
      [[1.45, 0.82], [1.45, -0.82], [-1.45, 0.82], [-1.45, -0.82]].forEach(([a2, c2], k) => g.wheels.setMatrixAt(i * 4 + k, gone || rust > 0.6 ? _hid : base.clone().multiply(M4c(a2, 0.34, c2)))); });
    [g.carBody, g.carTop, g.wheels].forEach((m) => (m.instanceMatrix.needsUpdate = true)); g.carBody.instanceColor.needsUpdate = true; }
  // the metro train: running until 4 s, then it rolls to a stop on the viaduct; the viaduct falls at T_METRO
  { const a = Math.max(0, t - 4); g.train.position.set(-380 + 22 * Math.min(t, 4) + 22 * (1 - Math.exp(-a * 0.4)) / 0.4, METRO_Y + 2.7, METRO_Z); const f = ss(T_METRO, T_METRO + 1.6, t);
    g.metro.position.y = -METRO_Y * 0.9 * f; g.metro.rotation.x = 0.04 * f; g.train.position.y -= METRO_Y * 0.95 * f; g.train.rotation.z = 0.25 * f; g.metro.visible = g.train.visible = t < 56; }
  // the Ferris wheel turns until 4 s, rusts, then topples (40)
  { const W2 = g.wheel, f = ss(40, 41.8, t); W2.userData.rot.rotation.z = -0.05 * Math.min(t, 4) - 0.03 * (1 - Math.exp(-Math.max(0, t - 4) * 0.5)); W2.rotation.x = -1.35 * f * f; W2.position.y = -2 * f; W2.visible = t < 58;
    W2.userData.cabins.forEach((cb, k) => { const a = k / 16 * TAU + W2.userData.rot.rotation.z; cb.position.set(Math.cos(a) * 32, 32 + 6 + Math.sin(a) * 32 - 2.5, 0); cb.visible = t < 40 + hsh(k) * 1.6; }); }
  // the bridge: the stays snap, the deck breaks into segments that drop into the river, the pylon leans and falls (45.2)
  { const a = t - T_BRIDGE; g.stays.forEach((s, k) => (s.visible = a < -0.25 + hsh(k) * 0.2)); g.segs.forEach((sg) => { const d = a - Math.abs(sg.k - 4.5) * 0.08; if (d <= 0) { sg.s.position.y = 8; sg.s.rotation.set(0, 0, 0); return; } const fall = Math.min(1, d * d * 1.6);
      sg.s.position.y = 8 - 15 * fall; sg.s.rotation.set(sg.sp * 0.4 * fall, 0, sg.sp * 0.25 * fall); sg.s.visible = t < 58; });
    const pf = ss(T_BRIDGE + 0.3, T_BRIDGE + 2.6, t); g.pylon.rotation.x = -1.3 * pf * pf; g.pylon.position.y = -6 * pf; g.pylon.visible = t < 58; }
  // the skyline: each tower leans and drops into its own dust (48-54); the stadium crumbles
  g.towers.forEach((tw) => { const a = t - tw.tf, f = ss(0, 2.2, a); tw.grp.rotation.set(0.18 * f * Math.sign(tw.lean), 0, 0.22 * f * tw.lean); tw.grp.position.y = GY - tw.h * 0.75 * f * f; tw.grp.visible = a < 2.3; });
  if (G_ST) { G_ST.visible = t < 50; }
  // near buildings: windows break, then they crumble into mounds the forest covers
  g.BL.forEach((b, i) => { const f = ss(b.tf, b.tf + 1.6, t), h = b.h * (1 - 0.85 * f); g.bld.setMatrixAt(i, f >= 0.99 ? _hid : M4c(b.x, b.y0, b.z, 0, b.sx, h, b.sz, 0.04 * f * Math.sin(i), 0)); });
  g.bld.instanceMatrix.needsUpdate = true;
  { let k = 0; g.BL.forEach((b, i) => { const f = ss(b.tf, b.tf + 1.6, t); g.mound.setMatrixAt(k++, f > 0.05 && fk < 0.98 ? M4c(b.x, GY, b.z, i, b.sx * 0.55, b.h * 0.14 * f * (1 - fk), b.sz * 0.55) : _hid); });
    g.towers.forEach((tw) => { const f = ss(tw.tf + 0.8, tw.tf + 2.2, t); g.mound.setMatrixAt(k++, f > 0.05 ? M4c(tw.x, GY, tw.z, tw.i, tw.w * 1.1, tw.h * 0.12 * f * (1 - 0.5 * fk), tw.w * 1.1) : _hid); }); g.mound.instanceMatrix.needsUpdate = true; }
  // weeds in the cracks (26+), trees growing everywhere (33+), the forest on the far bank (52+); snow on them
  g.WEEDS.forEach(([x, z, s, t0], i) => { const k = ss(t0, t0 + 3, t) * (1 - 0.6 * fk); g.weeds.setMatrixAt(i, k > 0.02 ? M4c(x, GY, z, i, s * k, s * k * (1 - 0.6 * sn), s * k) : _hid); }); g.weeds.instanceMatrix.needsUpdate = true;
  g.TREES.forEach((tr, i) => { const k = ss(tr.t0, tr.t0 + 8, t), sc = tr.s * (0.15 + 0.85 * k), sw = 0.03 * Math.sin(t * 0.8 + i); g.treeI[tr.type].setMatrixAt(tr.slot, k > 0.02 ? M4c(tr.x, groundYAt(tr.x, tr.z), tr.z, tr.ry, sc, sc, sc, sw, sw) : _hid); });
  g.treeI.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // animals wander through their era
  g.ANIM.forEach((an, i) => { const on = t > an.t0 && t < an.t1, a = t - an.t0, x = an.x0 + an.vx * a + Math.sin(a * 0.4 + an.ph) * 6, z = an.z0 + an.vz * a, ry = Math.atan2(an.vx + Math.cos(a * 0.4 + an.ph) * 2.4, an.vz), bob = Math.abs(Math.sin(a * 6 + an.ph)) * 0.06;
    const m = on ? M4c(x, GY + bob, z, ry, an.s, an.s, an.s) : _hid; g.animals.setMatrixAt(i, m);
    for (const s of [0, 1]) g.antlers.setMatrixAt(i * 2 + s, on && an.kind === 'deer' ? m.clone().multiply(M4c(s ? 0.15 : -0.15, 1.85, -1.0, 0, 1, 1, 1, 0, s ? -0.4 : 0.4)) : _hid); });
  g.animals.instanceMatrix.needsUpdate = true; g.antlers.instanceMatrix.needsUpdate = true;
  // dust: the metro, the bridge (and its splash), the towers, the buildings
  g.dust.forEach((s, i) => { let src = null, t0 = 0; if (i < 40) { t0 = T_METRO + 0.3; src = [-200 + i * 10, METRO_Y * 0.3, METRO_Z]; } else if (i < 90) { t0 = T_BRIDGE + 0.2; src = [(hsh(i) - 0.5) * 40, 4, lerp(g.BZ0, g.BZ1, hsh(i, 2))]; }
      else if (i < 200) { const tw = g.towers[i % g.towers.length]; t0 = tw.tf + 0.5; src = [tw.x + (hsh(i) - 0.5) * tw.w, tw.h * 0.15, tw.z]; } else { const b = g.BL[(i * 7) % g.BL.length]; t0 = b.tf + 0.3; src = [b.x, b.h * 0.3, b.z]; }
    const a = t - t0; if (a < 0 || a > 7) { s.visible = false; return; } s.position.set(src[0] + a * 4, src[1] + a * 6, src[2]); const sz = (i < 200 && i >= 90 ? 60 : 24) + a * 18; s.scale.set(sz, sz, 1); s.visible = true;
    s.material.opacity = 0.65 * ss(0, 0.4, a) * (1 - a / 7); s.material.color.copy(C3('#d8d0c0', '#a89c88', hsh(i, 3))); });
  g.splash.forEach((s, i) => { const a = t - T_BRIDGE - 0.35 - hsh(i) * 0.8; if (a < 0 || a > 3) { s.visible = false; return; } s.position.set((hsh(i, 2) - 0.5) * 50, -2 + a * 12, lerp(g.BZ0, g.BZ1, hsh(i, 3))); const sz = 18 + a * 20; s.scale.set(sz, sz * 1.4, 1); s.visible = true; s.material.opacity = 0.8 * (1 - a / 3); s.material.color.set('#f0f4f6'); });

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.filter = 'saturate(1.2) contrast(1.05)'; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}
const groundYAt = (x, z) => (z < RIVER_Z0 - 6 && z > RIVER_Z1 + 6 ? -9 : GY);

// ---- 2D: birds over the city; rain on the lens for the leaves season; snow falling in the ice age
function sky2D(t) {
  const R = RNG('birdsC'); ctx.save(); screen(); ctx.strokeStyle = 'rgba(30,30,36,0.8)'; ctx.lineWidth = 2; const n = t < 4 ? 6 : t < 17 ? 0 : 14;
  for (let i = 0; i < n; i++) { const x = mod(R.r(0, W) + t * R.r(20, 60), W + 200) - 100, y = R.r(250, 700) + Math.sin(t * 0.7 + i) * 20, s = R.r(6, 12), fl = Math.sin(t * 9 + i) * 0.6; ctx.beginPath(); ctx.moveTo(x - s, y - s * fl); ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.4, x, y); ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.4, x + s, y - s * fl); ctx.stroke(); }
  const rn = ss(21, 22, t) * (1 - ss(25.5, 26.5, t)); if (rn > 0) { const Rr = RNG('rainC'); ctx.strokeStyle = 'rgba(210,220,228,0.25)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < 260 * rn; i++) { const x0 = Rr.r(-100, W + 100), ph = mod(t * 2.6 + Rr.f(), 1), y = ph * (H + 300) - 150; ctx.moveTo(x0 - ph * 80, y); ctx.lineTo(x0 - ph * 80 + 8, y - 80); } ctx.stroke(); }
  const sn = snowK(t); if (sn > 0) { const Rs = RNG('snowC'); ctx.fillStyle = `rgba(255,255,255,${0.85 * sn})`; for (let i = 0; i < 420; i++) { const x = mod(Rs.r(0, W) + Math.sin(t * 0.8 + i) * 30 + t * 20, W), y = mod(Rs.r(0, H) + t * Rs.r(60, 160), H), r = Rs.r(1.5, 4.5); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } }
  ctx.restore();
}

// ---- HUD: the countdown, then the time without humans
function timeTxt(s) { if (s < 60) return `${Math.round(s)} s`; if (s < 3600) return `${Math.round(s / 60)} min`; if (s < 86400) { const h = Math.round(s / 3600); return `${h} ${h === 1 ? 'hora' : 'horas'}`; }
  if (s < 86400 * 60) { const d = Math.round(s / 86400); return `${d} ${d === 1 ? 'día' : 'días'}`; } if (s < 3.15e7 * 1.5) { const m = Math.max(1, Math.round(s / 2.63e6)); return m >= 12 ? '1 año' : `${m} ${m === 1 ? 'mes' : 'meses'}`; }
  const y = s / 3.15e7, r = y < 100 ? Math.round(y) : y < 1e4 ? Math.round(y / 10) * 10 : y < 1e5 ? Math.round(y / 100) * 100 : Math.round(y / 1e4) * 1e4; return `${pvNum(r)} años`; }
const SUBS = [[4, 'todos se fueron'], [7, 'nadie al volante'], [11, 'red eléctrica · cayendo'], [17, 'luces de la ciudad · apagadas'], [21, 'perros sueltos'], [26, 'desagües · tapados'], [31, 'la maleza avanza'], [36, 'la naturaleza vuelve'], [42, 'el acero cede'], [45.2, 'el puente · caído'], [48, 'rascacielos · cayendo'], [54, 'un bosque'], [59, 'glaciación'], [63, 'casi sin rastro']];
function hud() {
  const t = TT; if (t < 0.4 || t >= 66.2) return; const a = ev(0.4, 0.4) * (t > 65.8 ? 1 - ev(65.8, 0.4) : 1);
  if (t < 4) { const f = () => { const n = 3 - Math.floor(t * 0.75 + 0.0001), k = mod(t * 0.75, 1); pvFeather(CX, 1000, 380, 170, a); pvText('La humanidad desaparece en', CX, 930, 34, { align: 'center', alpha: a }); pvText(String(Math.max(1, n)), CX, 1090, 130 * (1 + 0.15 * (1 - k)), { align: 'center', alpha: a * (0.6 + 0.4 * (1 - k)) }); }; if (DEFER) DEFER.push(f); else f(); return; }
  let sub = SUBS[0][1]; for (const [t0, s] of SUBS) if (t >= t0) sub = s;
  pvHud('Tiempo sin humanos', timeTxt(clockS(t)), sub, a);
}
function endCard() {
  const a = ev(66.4, 0.8), b = ev(67.4, 0.8), e = ev(68.4, 0.7);
  const f = () => {
    pvText('¿Qué pasaría con las ciudades', CX, 820, 52, { align: 'center', alpha: a });
    pvText('si todos los humanos', CX, 888, 52, { align: 'center', alpha: a });
    pvText('desaparecieran?', CX, 956, 52, { align: 'center', alpha: a });
    pvText('LAS ÚLTIMAS SEÑALES DE NOSOTROS:', CX, 1056, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('VIDRIO ENTERRADO, PLÁSTICO...', CX, 1094, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('Y NUESTRAS HUELLAS EN LA LUNA', CX, 1132, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
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
// a caption on two lines (for the long one)
function caption2(l1, l2, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { pvFeather(CX, 1360, 560, 150, a); pvText(l1, CX, 1350, 50, { italic: true, align: 'center', alpha: a }); pvText(l2, CX, 1414, 50, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function sceneCity() {
  const t = TT;
  if (t < 66.2) { update(t); sky2D(t); }
  if (t >= 3.95 && t < 4.4) pvTint('#ffffff', 0.7 * (1 - ss(3.95, 4.4, t)));   // the moment everyone vanishes: a soft white blink
  if (t >= 65.6 && t < 66.2) pvTint('#06080a', ss(65.6, 66.2, t));
  if (t >= 66.2) { fillAll('#06080a'); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría con las ciudades', 'si todos los humanos', 'desaparecieran?'], 0.2, 3.6);
  caption2('En un instante, 8.200 millones', 'de personas ya no están.', 4.4, 6.9);
  caption2('Los autos siguen andando', 'sin nadie al volante.', 7.3, 10.8);
  caption2('Sin nadie que las opere,', 'las centrales se apagan.', 11.4, 16.6);
  caption2('Los perros vagan', 'buscando comida.', 17.3, 20.8);
  caption2('Las hojas tapan los desagües.', 'Nadie los limpia.', 21.3, 25.8);
  pvCaption('La maleza rompe el asfalto.', 26.3, 30.8);
  caption2('El pasto cubre las calles.', 'Llegan los ciervos.', 31.3, 35.8);
  caption2('El acero se oxida', 'y los vidrios estallan.', 36.3, 41.8);
  caption2('Tras unos 300 años,', 'cae el puente.', 45.6, 47.8);
  caption2('Los rascacielos', 'caen uno a uno.', 48.3, 53.8);
  caption2('Un bosque se traga', 'las ruinas.', 54.3, 58.8);
  caption2('Llegan las glaciaciones', 'y lo muelen todo.', 59.3, 62.8);
  caption2('Tras un millón de años, casi', 'no queda rastro de nosotros.', 63.2, 65.6);
}
