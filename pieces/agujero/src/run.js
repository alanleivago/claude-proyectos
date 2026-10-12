
// =====================================================================
//  RUN — pose the world from TT each frame, the HUD countdown, the title, the captions, the end card
// =====================================================================
const SKYD = 20000;   // where sky objects (the Moon, the hole) sit for the scene's geometry
function update(t) {
  const g = g3(), c = camPose(t);
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll);
  g.sky.position.copy(g.cam.position);
  const night = ss(0, 11, t), gold = diskOn(t) * (0.35 + 0.65 * ss(13, 55, t)), rA = bhR(t), bhD = dirV(BH_AZ, bhEl(t));
  // sky: dusk -> night -> gold
  const su = g.skyU; su.top.value.copy(C3('#2a3360', '#070a18', night).lerp(lin('#140e0a'), gold * 0.7)); su.mid.value.copy(C3('#6a5a8a', '#121a33', night).lerp(lin('#3a2616'), gold * 0.8));
  su.hor.value.copy(C3('#e8a070', '#2a3050', night).lerp(lin('#9a6234'), gold)); su.dusk.value = 1 - night; su.bhDir.value.copy(bhD);
  su.glow.value = gold * (0.5 + 1.2 * ss(23, 60, t)); su.glowW.value = Math.max(0.0005, Math.pow(rA * 7, 2));
  su.starA.value = ss(1.5, 8, t) * (1 - 0.75 * gold);
  g.scene.fog.color.copy(C3('#6a5a70', '#141826', night).lerp(lin('#7a4a2a'), gold)); g.scene.fog.near = lerp(400, 900, gold); g.scene.fog.far = lerp(7000, 12000, gold);
  // lights: dusk dome -> dim night; moonlight; then the disk's golden light from the hole
  g.hemi.color.copy(C3('#9aa0d0', '#3a4470', night).lerp(lin('#ffb070'), gold)); g.hemi.groundColor.copy(C3('#4a3a30', '#141418', night).lerp(lin('#2a1a10'), gold)); g.hemi.intensity = lerp(lerp(0.9, 0.2, night), 0.42, gold);
  const kd = bhD.clone(); g.key.position.copy(g.cam.position).addScaledVector(kd, 600); g.key.target.position.set(c.x, 20, c.z - 300); g.key.position.copy(g.key.target.position).addScaledVector(kd, 1500); g.key.target.updateMatrixWorld();
  g.key.color.copy(C3('#c8d0ff', '#ffc070', gold)); g.key.intensity = lerp(lerp(0.6, 0.3, night), 1.05, gold);
  // the town: windows switch on at dusk; the grid fails (flicker 25-33, dark by ~40); street lights too
  g.WINU.uOn.value = lerp(0.3, 1, ss(1, 10, t)); g.WINU.uT.value = t;
  const fail = t < 25 ? 1 : t < 33 ? 0.7 + 0.3 * Math.sign(Math.sin(t * 23) + Math.sin(t * 37) * 0.6) : Math.max(0, 0.7 - (t - 33) * 0.1);
  g.WINU.uPow.value = Math.max(0, fail); g.lamps.material.opacity = clamp(fail);
  g.crackU.value = ss(40, 49, t); g.timeU.value = t;
  // the Moon: beside the hole, stretched along the line to it (5-11), pulled apart (11-13.5); its stream feeds the disk
  { const m0 = dirV(MOON_AZ0, MOON_EL0), k = ss(5, 12.5, t), mDir = m0.clone().lerp(bhD, 0.35 * k).normalize(), rm = SKYD * Math.tan(0.6 * DEG);   // the Moon drawn ~2x its true size so it reads on a phone
    const ax = bhD.clone().sub(m0).normalize(), st = 1 + 2.5 * k * k; g.moon.position.copy(g.cam.position).addScaledVector(mDir, SKYD);
    g.moon.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), ax); g.moon.scale.set(rm * st, rm / Math.sqrt(st), rm / Math.sqrt(st));
    g.moon.visible = t < 13.6; g.moon.material.transparent = true; g.moon.material.opacity = 1 - ss(11.5, 13.5, t);
    g.moonL.position.copy(g.moon.position).add(new THREE.Vector3(-SKYD, SKYD * 0.3, SKYD)); g.moonL.target = g.moon; g.moonL.intensity = 0;
    const P = g.sgeo.attributes.position.array, R = RNG('stream'), on = ss(7, 10, t) * (1 - ss(19, 23, t)), bp = g.cam.position.clone().addScaledVector(bhD, SKYD);
    for (let i = 0; i < P.length / 3; i++) { const u = mod(R.f() + t * R.r(0.05, 0.12), 1), sp = Math.pow(u, 1.4), sw = (1 - sp) * SKYD * Math.tan(rA * 6 + 0.6 * DEG);
      const q = g.moon.position.clone().lerp(bp, sp), side = new THREE.Vector3().crossVectors(ax, new THREE.Vector3(0, 0, 1)).normalize();
      q.addScaledVector(side, Math.sin(sp * Math.PI) * sw * 0.8 + R.n(SKYD * 0.0012)).addScaledVector(new THREE.Vector3(0, 1, 0), R.n(SKYD * 0.0009));
      if (on <= 0 || R.f() > on) q.set(0, -1e6, 0); P.set([q.x, q.y, q.z], i * 3); }
    g.sgeo.attributes.position.needsUpdate = true; }
  // wind: grass tufts and trees lean towards the hole; near trees and rocks are torn out and fall upwards
  const wind = ss(22, 34, t) + 0.6 * ss(40, 50, t), lift = (t0, a) => (a > 0 ? 0.5 * 9.8 * 0.6 * a * a : 0);
  g.tuftL.forEach(([x, y, z, s, ph], i) => g.tufts.setMatrixAt(i, M4c(x, y, z, ph, s, s, s, -0.5 * wind * (0.7 + 0.3 * Math.sin(t * 4 + ph)) * 0.9, 0.2 * wind * Math.sin(t * 3 + ph))));
  g.tufts.instanceMatrix.needsUpdate = true;
  g.trees.forEach((tr) => { let y = tr.y, sway = wind * 0.1 * Math.sin(t * 1.3 + tr.ph * 6), rx = 0;
    const a = t - (tr.near ? 38 + tr.ph * 8 : 44 + tr.ph * 10); if (a > 0) { y += lift(0, a) * (0.6 + tr.ph); rx = a * (0.8 + tr.ph); }
    g.treeI[tr.type].setMatrixAt(tr.slot, M4c(tr.x, y, tr.z, tr.ph * 6, tr.s, tr.s, tr.s, -sway * 0.6 + rx, sway * 0.3)); });
  g.treeI.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // the houses tear free of the ground, tumble and are pulled up towards the hole (their yards stay behind, cracked)
  g.hInfo.forEach((q, i) => { const a = t - q.t0; if (a <= 0 && t > 39) { const shake = 0.06 * ss(q.t0 - 3, q.t0, t) * Math.sin(t * 40 + i); g.houses.setMatrixAt(i, M4c(q.x + shake, q.y0 + q.h / 2, q.z, q.ry, q.sx, q.h, q.sz)); g.roofs.setMatrixAt(i, M4c(q.x + shake, q.y0 + q.h, q.z, q.ry + Math.PI / 2, q.sz + 0.5, q.rh, q.sx + 0.6)); return; }
    if (a <= 0) return; const up = lift(0, a) * q.sp * 1.4, cx = q.x + (q.dx + bhD.x * 0.4) * up, cz = q.z + (q.dz + bhD.z * 0.4) * up, cy = q.y0 + q.h / 2 + up;
    const rot = new THREE.Euler(q.spin[0] * a, q.ry + q.spin[1] * a, q.spin[2] * a), qq = new THREE.Quaternion().setFromEuler(rot), base = M4().compose(_v.set(cx, cy, cz), qq, _s.set(1, 1, 1));
    g.houses.setMatrixAt(i, base.clone().multiply(M4().makeScale(q.sx, q.h, q.sz))); g.roofs.setMatrixAt(i, base.clone().multiply(Tr(0, q.h / 2, 0)).multiply(M4().makeRotationY(Math.PI / 2)).multiply(M4().makeScale(q.sz + 0.5, q.rh, q.sx + 0.6))); });
  if (t > 39) { g.houses.instanceMatrix.needsUpdate = true; g.roofs.instanceMatrix.needsUpdate = true; }
  // two cars driving down the road with their headlights (until the grid fails and the road breaks)
  { const P = g.carLights.geometry.attributes.position.array, RP = g.ROADP;
    [[0.0, 0.035, 1], [0.45, 0.028, -1]].forEach(([u0, v, dir], k) => { const u = mod(u0 + dir * v * t, 1), f = u * (RP.length - 1), j = Math.min(RP.length - 2, Math.floor(f)), w = f - j;
      const x = lerp(RP[j][0], RP[j + 1][0], w), z = lerp(RP[j][1], RP[j + 1][1], w), tx = RP[j + 1][0] - RP[j][0], tz = RP[j + 1][1] - RP[j][1], L = Math.hypot(tx, tz), nx = -tz / L, nz = tx / L, side = 1.6 * dir, on = t < 36 ? 1 : 0;
      for (const s of [-0.7, 0.7]) { const px = x + nx * (side + s), pz = z + nz * (side + s); P.set(on ? [px, terrH(px, pz) + 0.8, pz] : [0, -1e5, 0], (k * 2 + (s > 0 ? 1 : 0)) * 3); } });
    g.carLights.geometry.attributes.position.needsUpdate = true; }
  g.rockL.forEach((q, i) => { const a = t - q.t0, up = lift(0, a) * q.sp; g.rocks.setMatrixAt(i, M4c(q.x + q.dx * up, q.y + up, q.z + q.dz * up, q.rx + Math.max(0, a) * 2, q.s, q.s * 0.7, q.s)); });
  g.rocks.instanceMatrix.needsUpdate = true;
  g.debL.forEach((q, i) => { const a = t - q.t0; if (a < 0) { g.deb.setMatrixAt(i, _hid); return; } const up = lift(0, a) * q.sp * 1.6;
    g.deb.setMatrixAt(i, M4c(q.x + q.dx * up + bhD.x * up * 0.3, q.y + up, q.z + q.dz * up + bhD.z * up * 0.3, a * q.rx, q.s[0], q.s[1], q.s[2], a * q.rx * 0.7, a * q.rx * 0.4)); });
  g.deb.instanceMatrix.needsUpdate = true;
  // clouds stream towards the hole and stretch; they turn gold
  g.clouds.forEach((s, i) => { const u = s.userData, drift = t * 18 * u.v + 260 * ss(20, 62, t) * u.v * (t - 20) * 0.08;
    s.position.set(u.x + bhD.x * drift, u.y, u.z + bhD.z * drift); const st = 1 + 1.4 * ss(25, 55, t); s.scale.set(u.w * st, u.w * 0.42, 1);
    s.material.color.copy(C3('#d8c8e0', '#5a5e78', night).lerp(lin('#4a3424'), gold * 0.85)); s.material.opacity = u.o * 0.5 * (1 - 0.35 * gold); });
  renderHole(t);
  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- the HUD: time to arrival and distance
const hms = (s) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; };
function hud() {
  const t = TT; if (t < 5 || t >= 61) return;
  const km = kmLeft(t); pvHud('Llegada', hms(etaS(t)), km >= 1000 ? `a ${pvNum(Math.round(km / 100) * 100)} km` : `a ${pvNum(Math.round(km))} km`, ev(5, 0.5) * (1 - ev(60.6, 0.4)));
}
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(108, Math.floor(100 * 800 / wmax)), lh = size * 1.14, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 62, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
// the end card, in the user's words: "Tranquilo, El agujero negro más cercano es Gaia BH1 y esta a 1.560 años luz." then "...o no?" (2 s later), then "alterbase"
function endCard() {
  const a = ev(64.3, 0.7), b = ev(64.9, 0.8), c2 = ev(65.5, 0.8), d = ev(67.5, 0.5), e = ev(68.4, 0.6);
  const f = () => {
    pvGlow(CX, 900, 520 + 90 * Math.max(0, TT - 64), 'rgba(160,110,60,0.3)', a * (0.75 + 0.25 * Math.sin(TT * 1.3)));
    pvFeather(CX, 900, 540, 330, 0.8 * a);
    pvText('Tranquilo,', CX, 700, 54, { italic: true, align: 'center', alpha: a });
    pvText('El agujero negro más cercano', CX, 790, 50, { align: 'center', alpha: a });
    pvText('es Gaia BH1', CX, 915, 104, { align: 'center', alpha: b });
    pvText('y esta a 1.560 años luz.', CX, 1010, 52, { align: 'center', alpha: c2 });
    pvText('...o no?', CX, 1130, 64, { italic: true, align: 'center', alpha: d });
    pvText('ALTERBASE', CX, 1450, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}

function sceneHole() {
  const t = TT;
  if (t < 62.55) update(t);
  // the last metres: the shadow swallows the view; the crossing (62.5) is a white flash, then black
  if (t >= 61 && t < 62.55) pvTint('#000000', 0.55 * ss(61, 62.5, t));
  if (t >= 62.5 && t < 64) { const k = Math.exp(-(t - 62.5) * 3.2); fillAll('#000000'); pvTint('#fff4e0', k); pvGlow(CX, H * 0.45, 400 + 1200 * k, '#ffffff', k); }
  if (t >= 64) { fillAll('#050403'); endCard(); }
  hud();
  bigTitle(['¿Que pasaría si la', 'Tierra cayera en un', 'agujero negro?'], 0.3, 4.8);
  pvCaption('La Luna está cayendo.', 5.4, 9.4);
  pvCaption('Se deshace.', 9.6, 12.8);
  pvCaption('Ahora tiene un anillo.', 14.5, 22.6);
  pvCaption('La gravedad tira del suelo.', 23.5, 32.6);
  pvCaption('Todo lo suelto cae hacia arriba.', 33.6, 42.6);
  pvCaption('La Tierra es la siguiente.', 43.6, 52.6);
  pvCaption('Desde fuera, te verían congelado.', 53.6, 60.6);
}
