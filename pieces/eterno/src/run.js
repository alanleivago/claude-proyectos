// =====================================================================
//  RUN — pose the world from TT each frame: the billboard drops to 0, births fill the town, forests turn to farms, the town
//  climbs the hills, night and the fading stars, the dive into the bay and the jellyfish, the towers on land, on the sea,
//  on the headland, the hero tower at the balcony; the HUD (population · year, jellyfish age, nearest tower), captions, card
// =====================================================================
const mixK = (stops, t) => { let c = lin(stops[0][1]); for (let i = 1; i < stops.length; i++) c.lerp(lin(stops[i][1]), ss(stops[i][0], stops[i][2], t)); return c; };
let _bbN = -1;
function drawBoard(g, n) {
  if (n === _bbN) return; _bbN = n; const x = g.bbCv.getContext('2d'), w = 512, h = 256;
  x.fillStyle = '#0c1418'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a3a40'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8);
  x.fillStyle = '#e8f0f0'; x.font = '700 34px Helvetica, Arial, sans-serif'; x.textAlign = 'center'; x.fillText('MUERTES HOY', w / 2, 56);
  x.fillStyle = n === 0 ? '#3cff8a' : '#ff6a4a'; x.shadowColor = x.fillStyle; x.shadowBlur = 24; x.font = '700 150px Helvetica, Arial, sans-serif'; x.fillText(String(n), w / 2, 205); x.shadowBlur = 0;
  x.fillStyle = '#8aa0a8'; x.font = '600 20px Helvetica, Arial, sans-serif'; x.fillText('EN TODO EL MUNDO', w / 2, 238); g.bbTex.needsUpdate = true;
}
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position;
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const nk = nightK(t), dk = duskK(t), late = ss(48, 53, t);
  const su = g.skyU;
  su.top.value.copy(mixK([[0, '#5a8ad0'], [14, '#4f86d0', 16], [21, '#6a7cc0', 24], [24.2, '#070b1c', 25.6], [40.5, '#4a3a7a', 41.5], [47, '#7a96c8', 51]], t));
  su.hor.value.copy(mixK([[0, '#dce6ee'], [14, '#d8e6f2', 16], [21, '#f4c494', 24], [24.2, '#1a2038', 25.6], [40.5, '#f0a0a8', 41.5], [47, '#e8e0d8', 51]], t));
  su.sunK.value = 1 - nk; su.starA.value = nk * (1 - 0.92 * polK(t)); su.glow.value = nk * (0.3 + 0.7 * polK(t)) + 0.4 * dk;
  su.sunCol.value.copy(mixK([[0, '#fff2d8'], [21, '#ffc890', 24], [40.5, '#ffb0a0', 41.5], [47, '#fff2d8', 51]], t));
  g.hemi.intensity = lerp(1.0, 0.55, nk) - 0.15 * dk; g.hemi.color.copy(C3('#c8d8f0', '#3a4a7a', nk).lerp(lin('#e8b8c8'), dk)); g.sun.intensity = 2.4 * (1 - nk) * (1 - 0.4 * dk) + 0.6 * nk; g.sun.color.copy(su.sunCol.value).lerp(lin('#8aa0d8'), nk);
  g.scene.fog.color.copy(su.hor.value); g.scene.fog.far = 9000 - 3500 * late; g.r.toneMappingExposure = 1.05 + 0.3 * nk;
  g.clouds.forEach((s) => { const u = s.userData; s.position.set(u.x + t * 30, u.y, u.z); s.scale.set(u.w, u.w * u.a, 1); s.material.opacity = u.o * (1 - 0.85 * nk); s.material.color.copy(C3('#ffffff', '#2a3050', nk).lerp(lin('#f8c0c8'), dk)); });
  const sea = g.seaMat.uniforms; sea.uT.value = t; sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.uSunCol.value.copy(su.sunCol.value).multiplyScalar(su.sunK.value); sea.uCity.value = nk + dk;
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  g.groundU.uT.value = t; const lit = Math.max(nk, 0.15 * dk, 0.2 * ss(21, 24, t) * (1 - ss(29.5, 30.5, t))); g.groundU.uNight.value = lit;
  // pines: cleared by the farms (17-21); the headland's own go last (56-59.6)
  g.PINES.forEach((p, i) => { const k = 1 - ss(p.t1 - 0.5, p.t1, t); g.pines.setMatrixAt(i, k > 0.02 ? M4c(p.x, p.y, p.z, p.ry, p.s, p.s * k, p.s) : _hid); }); g.pines.instanceMatrix.needsUpdate = true;
  // houses pop up as the births arrive and give way to towers
  g.HOUSES.forEach((h, i) => { const k = ss(h.t0, h.t0 + 0.7, t), gone = t > h.t1 + 0.4; if (k < 0.02 || gone) { g.houses.setMatrixAt(i, _hid); g.roofs.setMatrixAt(i, _hid); return; }
    g.houses.setMatrixAt(i, M4c(h.x, h.y - 0.5, h.z, h.ry, h.w, h.h * k + 0.5, h.dd)); g.roofs.setMatrixAt(i, M4c(h.x, h.y + h.h * k, h.z, h.ry, h.w * 1.05, 2.6 * k, h.dd * 1.05)); });
  g.houses.instanceMatrix.needsUpdate = true; g.roofs.instanceMatrix.needsUpdate = true;
  g.BOATS.forEach((b, i) => g.boats.setMatrixAt(i, t < 52.5 ? M4c(b.x + (b.sail ? Math.sin(t * 0.05 + i) * 20 : 0), 0.2 + 0.15 * Math.sin(t * 1.4 + i), b.z, b.ry + (b.sail ? t * 0.02 : 0), 1, 1, 1, 0.03 * Math.sin(t * 1.1 + i), 0) : _hid)); g.boats.instanceMatrix.needsUpdate = true;
  drawBoard(g, deathsNow(t)); g.billboard.visible = t < 56.6; g.landm.visible = t < 47;
  // cranes over the growing town and beside each rising tower (the jib turns)
  g.CRANES.forEach((cr, i) => { const on = t > cr.t0 && t < cr.t1, k = ss(cr.t0, cr.t0 + 0.6, t) * (1 - ss(cr.t1 - 0.6, cr.t1, t)); g.cranes.setMatrixAt(i, on && k > 0.02 ? M4c(cr.x, cr.y, cr.z, cr.ph + 0.35 * (t - cr.t0), cr.s, cr.s * k, cr.s) : _hid); }); g.cranes.instanceMatrix.needsUpdate = true;
  // towers: each rises out of the ground (or its sea platform) in ~2.4 s with a little overshoot
  { let pk = 0; g.TOWERS.forEach((tw) => { const a = t - tw.t0, k = a <= 0 ? 0 : a >= 2.4 ? 1 : 1 - Math.pow(1 - a / 2.4, 3) + 0.04 * Math.sin(Math.PI * a / 2.4), m = g.twMesh[tw.kind];
      m.setMatrixAt(tw.slot, k > 0.01 ? M4c(tw.x, tw.y, tw.z, 0, tw.w, tw.h * k, tw.d) : _hid);
      if (tw.sea) { const kp = ss(tw.t0 - 0.9, tw.t0, t); g.plat.setMatrixAt(pk++, kp > 0.01 ? M4c(tw.x, -2, tw.z, 0, tw.w * 0.8, 6 * kp, tw.w * 0.8) : _hid); } });
    g.twMesh.forEach((m) => (m.instanceMatrix.needsUpdate = true)); g.plat.instanceMatrix.needsUpdate = true; }
  // the hero tower bursts up at the balcony
  { const a = t - T_HERO, k = a <= 0 ? 0 : 1 - Math.pow(1 - Math.min(1, a / 1.3), 4); G_HERO.setMatrixAt(0, k > 0 ? M4c(HERO_P.x, lerp(-372, -8, k), HERO_P.z, 0.08, 52, 360, 46) : _hid); G_HERO.instanceMatrix.needsUpdate = true; }
  // street lights: one per (even) house, on while it stands, bright at night and at dusk
  { const col = g.lamps.geometry.attributes.color; let j = 0; g.HOUSES.forEach((h, i) => { if (i % 2) return; const on = t > h.t0 + 0.5 && t < h.t1 ? lit : 0; col.setXYZ(j++, on, on * 0.8, on * 0.55); }); col.needsUpdate = true; }
  // dust where towers land near us and where the hero breaks through
  g.dust.forEach((s, i) => { let src, t0; if (i < 60) { t0 = T_HERO + hsh(i) * 0.4; src = [HERO_P.x + (hsh(i, 2) - 0.5) * 70, groundH(HERO_P.x, HERO_P.z) + 2, HERO_P.z + (hsh(i, 3) - 0.5) * 40]; }
      else { const near = g.TOWERS.filter((tw) => tw.t0 > 52); const tw = near[(i * 13) % Math.max(1, near.length)]; if (!tw) { s.visible = false; return; } t0 = tw.t0 + hsh(i) * 0.3; src = [tw.x + (hsh(i, 2) - 0.5) * tw.w, tw.y + 3, tw.z + (hsh(i, 3) - 0.5) * tw.w]; }
    const a = t - t0; if (a < 0 || a > 5) { s.visible = false; return; } s.position.set(src[0] + a * 3, src[1] + a * (i < 60 ? 9 : 5), src[2]); const sz = (i < 60 ? 26 : 18) + a * (i < 60 ? 22 : 12); s.scale.set(sz, sz * 0.8, 1); s.visible = true;
    s.material.opacity = 0.7 * ss(0, 0.3, a) * (1 - a / 5); s.material.color.copy(C3('#d8d0c4', '#b8ac9c', hsh(i, 4))); });
  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.filter = 'saturate(1.15) contrast(1.04)'; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- under the water: the jellyfish (31-41)
function updateUW(t) {
  const g = g3(), u = uw3(), cam = u.cam, a0 = t - UW0;
  u.bg.material.uniforms.uT.value = t; u.bedU.uT.value = t;
  // the jellyfish: rising and pulsing (31-35.5), ageing: shrinking, whitening, tentacles in, sinking (35.5-37.6); then a blob
  const age = ss(35.4, 37.5, t), pulse = 1 + 0.08 * Math.sin(TAU * 0.9 * t) * (1 - age), sc = (1 - 0.65 * age);
  const jy = lerp(2 + 0.35 * Math.min(a0, 4.5), -12.4, ss(35.6, 37.6, t)), jx = Math.sin(t * 0.4) * 0.6;
  u.jelly.position.set(jx, jy, 0); u.jelly.scale.set(sc * pulse, sc / Math.pow(pulse, 1.4), sc * pulse); u.jelly.rotation.set(0.08 * Math.sin(t * 0.7), t * 0.15, 0.06 * Math.sin(t * 0.5)); u.jelly.visible = t < 37.6;
  u.bell.material.opacity = 0.32 + 0.45 * age; u.bell.material.color.copy(C3('#e8fbff', '#f4f0e8', age));
  for (let k = 0; k < u.NB; k++) { const a = k / u.NB * TAU; u.bulbs.setMatrixAt(k, M4c(Math.cos(a) * 3.05, -1.62, Math.sin(a) * 3.05)); } u.bulbs.instanceMatrix.needsUpdate = true;
  { const pos = u.tents.geometry.attributes.position, L = 9.5 * (1 - age) * (t < 37.6 ? 1 : 0); let v = 0; const sy = sc / Math.pow(pulse, 1.4);
    for (let k = 0; k < u.NT; k++) { const a = k / u.NT * TAU + t * 0.15, r0 = 3.0 * sc * pulse; let px = jx + Math.cos(a) * r0, py = jy - 1.6 * sy, pz = Math.sin(a) * r0, prev = [px, py, pz];
      for (let j = 1; j < u.TP; j++) { const f = j / (u.TP - 1), sw = Math.sin(j * 0.45 - t * 2.2 + k * 0.7) * 0.18 * f * L * 0.12, inn = 0.25 * f * (1 + 0.5 * Math.sin(TAU * 0.9 * t - j * 0.3));
        const nx = jx + Math.cos(a) * r0 * (1 - inn) + sw * Math.cos(a + 1.6), ny = jy - 1.6 * sy - f * L * (0.9 + 0.1 * Math.cos(TAU * 0.9 * t - j * 0.2)), nz = Math.sin(a) * r0 * (1 - inn) + sw * Math.sin(a + 1.6) + Math.sin(t * 0.8 + j * 0.2) * 0.25 * f;
        pos.setXYZ(v++, prev[0], prev[1], prev[2]); pos.setXYZ(v++, nx, ny, nz); prev = [nx, ny, nz]; } }
    pos.needsUpdate = true; u.tents.visible = L > 0.05; }
  // the blob on the seabed; the stolon spreads; polyps sprout; buds swim up
  const bk = ss(37.3, 37.8, t) * (1 - 0.35 * ss(38.5, 40, t)); u.blob.visible = t >= 37.3; u.blob.position.set(0, -13.3, 1); u.blob.scale.setScalar(0.95 * bk + 0.01);
  u.stolons.forEach((m, i) => { const k = ss(37.9 + i * 0.05, 38.9 + i * 0.05, t); m.geometry.setDrawRange(0, Math.floor(k * m.geometry.index.count / 3) * 3); m.position.y = -13.6; });
  u.POLYPS.forEach((p, i) => { const pp = u.polyp[i], k = ss(p.t0, p.t0 + 1.1, t); pp.g.visible = k > 0.01; pp.g.position.set(p.x, -13.6, p.z); pp.g.rotation.set(p.lean * 0.4, 0, p.lean);
    const h = p.h * k, sw = Math.sin(t * 1.3 + p.ph) * 0.06; pp.stalk.scale.set(1, h, 1); pp.head.position.set(sw * h, h + 0.3, 0); pp.head.scale.setScalar(0.3 + 0.7 * k);
    pp.crown.forEach((tn, j) => { const a = j / pp.crown.length * TAU; tn.position.set(sw * h, h + 0.65, 0); tn.rotation.set(Math.cos(a) * (0.4 + 0.9 * k), 0, Math.sin(a) * (0.4 + 0.9 * k) + 0.1 * Math.sin(t * 2 + j)); tn.scale.set(1, 0.2 + 0.8 * k, 1); }); });
  u.BUDS.forEach((b, i) => { const s = u.buds[i], a = t - b.t0, p = u.POLYPS[b.p]; if (a < 0) { s.visible = false; return; } s.visible = true; const pu = 1 + 0.12 * Math.sin(TAU * 1.4 * t + b.ph);
    s.position.set(p.x + b.vx * a, -13.6 + p.h + 0.8 + b.vy * a, p.z + b.vz * a); s.scale.set(b.s * pu * Math.min(1, a * 3 + 0.3), b.s / pu * Math.min(1, a * 3 + 0.3), b.s * pu * Math.min(1, a * 3 + 0.3)); });
  u.FISH.forEach((f, i) => u.fish.setMatrixAt(i, M4c(mod(f.x0 + f.v * t + 70, 140) - 70, f.y + Math.sin(t + i) * 0.4, f.z, f.v > 0 ? 0 : Math.PI, f.s, f.s, f.s, 0, 0.05 * Math.sin(t * 6 + i)))); u.fish.instanceMatrix.needsUpdate = true;
  u.snow.position.y = -((t * 0.4) % 10); u.snow.rotation.y = t * 0.01;
  u.weeds.forEach((w) => { w.rotation.z = 0.12 * Math.sin(t * 0.9 + w.userData.ph); w.rotation.x = 0.08 * Math.sin(t * 0.7 + w.userData.ph * 2); });
  // the camera: on the jellyfish, following it down; then on the polyps; then up with the buds
  const follow = ss(35.4, 37.6, t), down = ss(37.4, 38.4, t), rise = ss(39.6, 41, t);
  const ty = lerp(lerp(jy - 2.4, -12.4, down), -9.5, rise), cz = lerp(lerp(17 - 0.4 * a0, 13, follow), 12.5, down), cy = lerp(lerp(jy - 0.6, -8.5, down), -6, rise);
  cam.position.set(0.8 * Math.sin(t * 0.3), cy + 0.3 * Math.sin(t * 0.5), cz); cam.lookAt(0, ty, 0); cam.updateMatrixWorld();
  g.r.render(u.scene, cam);
  ctx.save(); screen(); ctx.filter = 'saturate(1.1)'; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: gulls in the morning
function sky2D(t) {
  if (t > 24) return; const R = RNG('gullsF'); ctx.save(); screen(); ctx.strokeStyle = `rgba(250,248,244,${0.9 * (1 - ss(20, 24, t))})`; ctx.lineWidth = 2.4;
  for (let i = 0; i < 8; i++) { const x = mod(R.r(0, W) + t * R.r(25, 60), W + 200) - 100, y = R.r(420, 860) + Math.sin(t * 0.7 + i) * 20, s = R.r(8, 14), fl = Math.sin(t * 7 + i) * 0.6; ctx.beginPath(); ctx.moveTo(x - s, y - s * fl); ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.4, x, y); ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.4, x + s, y - s * fl); ctx.stroke(); }
  ctx.restore();
}

// ---- HUD: population and year; the jellyfish's age; the nearest tower
function jellyDays(t) { return t < 35.5 ? Math.round(1 + 47 * ss(31, 35.5, t)) : t < 38 ? Math.round(48 * (1 - ss(35.5, 38, t))) : 0; }
function hud() {
  const t = TT; if (t < 0.4 || t >= 64.5) return; const a = ev(0.4, 0.4) * (t > 64 ? 1 - ev(64, 0.4) : 1) * (t > 30.3 && t < 31.2 ? 0 : 1) * (t > 40.6 && t < 41.3 ? 0 : 1);
  if (isUW(t)) { const d = jellyDays(t); pvHud('Edad de la medusa', `${d} ${d === 1 ? 'día' : 'días'}`, t < 35.5 ? 'Turritopsis dohrnii' : t < 38 ? 'rejuveneciendo' : 'otra vez pólipo', a); return; }
  if (t >= T_HERO) { pvHud('Torre más cercana', 'AQUÍ', `año ${yearN(t)}`, a); return; }
  if (t >= 49) { const m = nearM(t); pvHud('Torre más cercana', m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(m / 10) * 10} m`, `año ${yearN(t)}`, a); return; }
  pvHud('Población mundial', pvNum(Math.round(popN(t) / 1000) * 1000 + Math.floor(hsh(Math.floor(t * 24)) * 999)), `año ${yearN(t)}`, a);
}
function endCard() {
  const a = ev(64.8, 0.8), b = ev(65.8, 0.8), c = ev(66.8, 0.7), c2 = ev(67.7, 0.5), e = ev(68.4, 0.6);
  const f = () => {
    pvText('¿Qué pasaría si', CX, 760, 54, { align: 'center', alpha: a });
    pvText('todos viviéramos', CX, 830, 54, { align: 'center', alpha: a });
    pvText('para siempre?', CX, 900, 54, { align: 'center', alpha: a });
    pvText('LA PERSONA MÁS LONGEVA VERIFICADA,', CX, 1000, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('JEANNE CALMENT, VIVIÓ 122 AÑOS Y 164 DÍAS', CX, 1038, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('Pero tranquilo, esto no sucederá...', CX, 1160, 42, { italic: true, align: 'center', alpha: c * 0.92 });
    pvText('¿o sí?', CX, 1240, 58, { italic: true, align: 'center', alpha: c2 });
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
function sceneForever() {
  const t = TT;
  if (t < 64.5) { if (isUW(t)) updateUW(t); else { update(t); sky2D(t); } }
  if (t >= 30.3 && t < UW0) pvTint('#1a8a98', ss(30.3, UW0, t));
  if (t >= UW0 && t < UW0 + 0.5) pvTint('#1a8a98', 1 - ss(UW0, UW0 + 0.5, t));
  if (t >= 40.5 && t < UW1) pvTint('#e8fbff', ss(40.5, UW1, t));
  if (t >= UW1 && t < UW1 + 0.6) pvTint('#e8fbff', 1 - ss(UW1, UW1 + 0.6, t));
  if (t >= T_HERO && t < T_HERO + 0.3) pvTint('#ffffff', 0.3 * (1 - ss(T_HERO, T_HERO + 0.3, t)));
  if (t >= 64 && t < 64.5) pvTint('#0a0d12', ss(64, 64.5, t));
  if (t >= 64.5) { fillAll('#0a0d12'); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si', 'todos viviéramos', 'para siempre?'], 0.2, 3.7);
  pvCaption('Nadie en la Tierra muere más.', 4.2, 6.8);
  pvCaption('Ni siquiera de viejo.', 7.2, 9.8);
  caption2('62 millones de muertes al año...', '...simplemente se detienen.', 10.2, 13.8);
  caption2('Y siguen naciendo', '132 millones de bebés al año.', 14.2, 16.8);
  pvCaption('Cada bosque se vuelve granja.', 17.2, 20.8);
  pvCaption('El pueblo trepa por cada colina.', 21.2, 24.8);
  pvCaption('Las estrellas desaparecen.', 25.4, 28.9);
  pvCaption('Un animal ya vive para siempre.', 29.2, 30.4);
  pvCaption('La medusa inmortal.', 31.6, 35.0);
  pvCaption('Cuando envejece...', 35.3, 37.6);
  pvCaption('...vuelve a ser un bebé.', 37.9, 40.5);
  caption2('En 2100:', '18.000 millones de personas.', 41.6, 44.9);
  pvCaption('Las torres no dejan de subir.', 45.2, 48.9);
  pvCaption('Hasta que se acaba la tierra.', 49.2, 51.9);
  caption2('Entonces construimos', 'sobre el mar.', 52.2, 55.9);
  caption2('Después,', 'en la última colina verde.', 56.2, 59.7);
  caption2('Hasta que la ciudad', 'llega a ti.', 60.9, 63.8);
}
