
// =====================================================================
//  RUN — pose the world from TT each frame: Saturn's approach, the tide, the ice rain, the Roche cracks, the fall into the
//  clouds; the HUD, the title, the captions, the ending, the end card
// =====================================================================
const jit = (t, i, f, a) => Math.sin(t * f + i * 1.7) * a + Math.sin(t * f * 1.73 + i * 2.9) * a * 0.6;
const _y = new THREE.Vector3(0, 1, 0);
function toScreen(p) { const g = g3(), v = p.clone().project(g.cam); return { x: (v.x * 0.5 + 0.5) * W, y: (0.5 - v.y * 0.5) * H, on: v.z < 1 && v.z > -1 }; }
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position, sk = shake(t);
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const R = satR(t), sd = satDir(t), big = ss(9, 30, t), gold = ss(53, 59.5, t), lev = seaLevel(t);
  // Saturn: centred on its direction; radius from its angular size; the ring plane tilted towards us
  { const D = SKYD, rad = D * Math.sin(Math.min(R, 84 * DEG)); g.SAT.position.copy(cp).addScaledVector(sd, D); g.SAT.lookAt(cp); g.SAT.scale.setScalar(rad); g.SAT.visible = t > 8;
    const inner = g.planet.parent === g.SAT ? null : null; g.planet.rotation.set(0, t * 0.02, 0);
    g.rings.rotation.set(-Math.PI / 2 + RING_TILT, 0, 0); g.planet.rotation.x = RING_TILT; g.SAT.rotateZ(-0.32);
    g.SAT.updateMatrixWorld(); g.satU.uRingN.value.set(0, 1, 0).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(RING_TILT, 0, 0))).applyQuaternion(g.SAT.quaternion).normalize();
    g.satU.uDim.value = 1 - 0.25 * gold; g.ringU.uDim.value = 1 - 0.5 * gold; }
  // the sky: dusk deepening; Saturn's glow; stars fade as it brightens; at the end, its bands are the sky
  const su = g.skyU; su.satDir.value.copy(sd); su.satGlow.value = 0.25 + 0.9 * big; su.satW.value = Math.pow(R * 2.6 + 0.01, 2); su.starA.value = 1 - 0.8 * big; su.gold.value = gold * 0.9;
  su.hor.value.copy(C3('#d88a7a', '#a87a6a', ss(0, 30, t)).lerp(lin('#c89a6a'), big * 0.4)); su.mid.value.copy(C3('#3a4a86', '#2a3466', ss(0, 30, t)));
  g.scene.fog.color.copy(C3('#5a6488', '#8a7a68', big * 0.6).lerp(lin('#b89a6a'), gold)); g.scene.fog.far = lerp(22000, 3000, gold); g.scene.fog.near = lerp(800, 100, gold);
  // light: Saturn's golden reflected light grows into the key; the dome warms
  g.key.position.copy(g.key.target.position).addScaledVector(sd, 3000); g.key.intensity = 0.15 + 1.6 * big + 0.6 * gold; g.key.color.copy(C3('#ffe0b0', '#ffc888', gold));
  g.hemi.intensity = 1.0 + 0.3 * big; g.hemi.color.copy(C3('#8a96d0', '#c8a888', big * 0.8)); g.r.toneMappingExposure = 1.1 - 0.08 * big;
  // the town: windows on through the dusk; the power fails as the ground breaks
  g.WINU.uOn.value = lerp(0.35, 1, ss(0, 18, t)); g.WINU.uPow.value = 1 - ss(46.5, 52, t) * (0.6 + 0.4 * Math.sign(Math.sin(t * 23)));
  g.lamps.material.opacity = 1 - ss(47, 52, t); g.bulbs.material.opacity = (0.85 + 0.15 * Math.sin(t * 0.7)) * (1 - ss(47, 50, t) * (0.5 + 0.5 * Math.sin(t * 31)));
  g.crackU.value = ss(45.5, 51, t); g.timeU.value = t; g.snowU.value = 1 - 0.45 * ss(36, 50, t);
  // the fjord's water
  const sea = g.seaMat.uniforms; g.seaMesh.position.y = lev; sea.uT.value = t; sea.uLevel.value = lev; sea.uSat.value.copy(sd); sea.uSatK.value = 0.3 + 1.2 * big; sea.uChurn.value = 0.3 * ss(25, 30, t) + 0.5 * ss(32, 40, t) + 0.6 * ss(53, 58, t); sea.uGold.value = gold;
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  // houses: shudder; the flood lifts and turns the ones on the shore; at the Roche limit some fold; at the end they lift
  g.HL.forEach((q, i) => { const a = sk * 0.06 * (q.far ? 0.3 : 1), dx = jit(t, i, 9 + (i % 5), a), dz = jit(t, i + 3, 8 + (i % 7), a), wet = clamp((lev - q.y0) / 6), fold = hsh(i, 9) < 0.35 ? ss(47 + hsh(i, 3) * 6, 48.5 + hsh(i, 3) * 6, t) : 0;
    const up = Math.max(0, t - (52.4 + hsh(i, 4) * 4.5 + (q.far ? 1.5 : 0))), lift = up * up * (q.far ? 7 : 6), h = q.h * (1 - 0.6 * fold);
    const x = q.x + dx + sd.x * lift * 0.3, y = q.y0 + Math.max(0, lev - q.y0 - 1) * 0.6 * wet * (up > 0 ? 0 : 1) + lift, z = q.z + dz + wet * 6 + sd.z * lift * 0.5, rx = wet * 0.2 * Math.sin(i) + fold * 0.2 + up * 0.8, rz = wet * 0.15 * Math.cos(i) + up * 0.5;
    g.houses.setMatrixAt(i, M4c(x, y, z, q.ry + wet * 0.4 * Math.sin(i * 2) + up * 0.6, q.sx, h, q.sz, rx, rz)); g.roofs.setMatrixAt(i, M4c(x, y + h, z, q.ry + wet * 0.4 * Math.sin(i * 2) + up * 0.6, q.sx + 0.8, q.rh, q.sz + 0.8, rx, rz)); });
  g.houses.instanceMatrix.needsUpdate = true; g.roofs.instanceMatrix.needsUpdate = true;
  // boats ride the tide: they settle on the mud as it drains, then the surge carries them up the slope towards us
  g.boats.forEach((b) => { const surge = ss(26, 32, t), x = b.x, z = b.z + surge * (b.L > 40 ? 12 : 22) * (0.6 + 0.4 * Math.sin(b.ph)), bed = terrH(x, z), y = Math.max(lev - 0.2 * b.L * 0.16, bed) + 0.2 * Math.sin(t * 1.1 + b.ph);
    const up = Math.max(0, t - 53.8 - b.ph * 0.5); b.grp.position.set(x + sd.x * up * up * 3, y + up * up * 6, z + sd.z * up * up * 3); b.grp.rotation.set(0.05 * Math.sin(t + b.ph) + up * 1.2, b.yaw + surge * 0.8 * Math.sin(b.ph), 0.06 * Math.sin(t * 1.3 + b.ph) * b.roll + (lev < bed + 0.5 ? 0.3 * b.roll : 0) + up * 0.9); });
  // the ice rain: a flash on impact, steam or a white splash column climbing, fading
  g.ICE.forEach((h, i) => { const a = t - h.t, fl = g.flashes[i]; if (a < 0 || a > 6) { fl.visible = false; g.steam[i * 2].visible = g.steam[i * 2 + 1].visible = false; return; }
    const y0 = h.water ? lev : h.y; fl.position.set(h.x, y0 + 10, h.z); const fs = (h.big ? 900 : 380) * (0.5 + a * 2) * Math.exp(-a * 3); fl.scale.set(fs, fs, 1); fl.visible = a < 1.2; fl.material.opacity = Math.exp(-a * 3); fl.material.color.copy(C3('#e8f6ff', '#ffd8a0', a));
    for (const k of [0, 1]) { const s = g.steam[i * 2 + k], sz = (h.big ? 260 : 110) * (0.6 + a * (h.water ? 0.9 : 0.6)) * (1 + k * 0.4); s.position.set(h.x + k * 20, y0 + (h.water ? 40 : 20) + a * (h.water ? 70 : 30) * (1 + k), h.z); s.scale.set(sz, sz * (h.water ? 1.6 : 1), 1); s.visible = true;
      s.material.opacity = 0.75 * ss(0, 0.3, a) * (1 - a / 6); s.material.color.copy(h.water ? C3('#f4f8fa', '#c8d0d8', a / 6) : C3('#e8ecf0', '#8a8680', a / 6)); } });
  // the lighthouse beam sweeps until the power fails
  g.LH.beam.rotation.y = t * 0.9; g.LH.beam.visible = t < 48; g.LH.beam.material.opacity = 0.8 * (1 - big * 0.6);
  // rock and ice chunks flung out of every impact, falling back; sparks of ice
  g.CHUNK.forEach((c, i) => { const a = t - c.h.t; if (a < 0 || a > 6) { g.chunks.setMatrixAt(i, _hid); return; } const y0 = c.h.water ? seaLevel(c.h.t) : c.h.y, y = y0 + c.vy * a - 9.8 * a * a * 2.2;
    if (y < y0 - 2) { g.chunks.setMatrixAt(i, _hid); return; } g.chunks.setMatrixAt(i, M4c(c.h.x + c.vx * a, y, c.h.z + c.vz * a, a * c.sp, c.s, c.s * 0.7, c.s, a * c.sp * 0.6)); });
  g.chunks.instanceMatrix.needsUpdate = true;
  { const P = g.sparks.geometry.attributes.position.array; for (let k = 0; k < 2400; k++) { const h = g.ICE[k % g.ICE.length], a = t - h.t; if (a < 0 || a > 2.2) { P[k * 3 + 1] = -1e5; continue; }
      const ang = hsh(k, 1) * TAU, v = 60 + hsh(k, 2) * 200, y0 = h.water ? seaLevel(h.t) : h.y; P[k * 3] = h.x + Math.cos(ang) * v * a; P[k * 3 + 1] = y0 + (40 + hsh(k, 3) * 160) * a - 9.8 * 1.5 * a * a; P[k * 3 + 2] = h.z + Math.sin(ang) * v * a; }
    g.sparks.geometry.attributes.position.needsUpdate = true; g.sparks.material.opacity = 0.9; }
  // avalanches: snow pouring down the walls (40-48)
  g.aval.forEach((s, i) => { const lane = i % 12, a = t - (39.5 + (lane * 0.7) % 7) - Math.floor(i / 12) * 0.25; if (a < 0 || a > 7) { s.visible = false; return; }
    const z = -900 - lane * 650, side = lane % 2 ? 1 : -1, dx0 = 520 - a * 60, x = fjordX(z) + side * (halfW(z) + Math.max(40, dx0)), y = terrH(x, z) + 15; s.position.set(x, y, z); const sz = 90 + a * 40; s.scale.set(sz, sz * 0.7, 1); s.visible = true;
    s.material.opacity = 0.85 * ss(0, 0.5, a) * (1 - a / 7); s.material.color.set('#f2f4f8'); });
  // trees torn out of the slopes and pulled up (from 52.5 s)
  if (t > 52.4 || g.pdirty) { g.pdirty = t > 52.4; g.PINES.forEach(([x, y, z, sc], i) => { const up = Math.max(0, t - (52.5 + hsh(i, 7) * 5)), l = up * up * 5; g.pines.setMatrixAt(i, M4c(x, y - 0.5 + l, z, i + up * 2, sc * 0.35, sc, sc * 0.35, up * 1.4, up * 0.8)); }); g.pines.instanceMatrix.needsUpdate = true; }
  // the end: everything loose lifts towards Saturn; columns of spray tear off the fjord
  g.DEB.forEach((d, i) => { const a = t - d.t0; if (a < 0) { g.deb.setMatrixAt(i, _hid); return; } const up = a * a * 3 * d.sp;
    g.deb.setMatrixAt(i, M4c(d.x + sd.x * up * 0.6, d.y + up, d.z + sd.z * up * 0.6, a * d.spin, d.s[0], d.s[1], d.s[2], a * d.spin * 0.7, a * d.spin * 0.4)); });
  g.deb.instanceMatrix.needsUpdate = true;
  g.spray.forEach((s, i) => { const a = t - (53 + hsh(i) * 6); if (a < 0) { s.visible = false; return; } const z = -150 - hsh(i, 2) * 4000, x = fjordX(z) + (hsh(i, 3) * 2 - 1) * halfW(z) * 0.9, y = lev + a * a * 25 * (0.6 + hsh(i, 4));
    s.position.set(x, y, z); const sz = 30 + a * 30 + -z * 0.02; s.scale.set(sz, sz * 1.5, 1); s.visible = true; s.material.opacity = 0.6 * ss(0, 0.6, a); s.material.color.copy(C3('#e8ecef', '#d8c4a0', gold)); });

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: Saturn as a golden star while it is far; the ice meteors' streaks; the fall into the clouds
function star2D(t) {
  if (t > 10.5) return; const g = g3(), p = toScreen(g.cam.position.clone().addScaledVector(satDir(t), SKYD)); if (!p.on) return;
  const k = ss(0.5, 2.5, t) * (1 - ss(9, 10.5, t)), r = 3 + 6 * ss(4, 10, t), tw = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 4.1);
  ctx.save(); screen(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k; pvGlow(p.x, p.y, r * 7 * tw, 'rgba(255,210,140,0.45)'); pvGlow(p.x, p.y, r * 1.6, 'rgba(255,246,220,1)');
  for (const [dx, dy] of [[1, 0], [0, 1]]) { const L = r * 9 * tw, gr = ctx.createLinearGradient(p.x - dx * L, p.y - dy * L, p.x + dx * L, p.y + dy * L); gr.addColorStop(0, 'rgba(255,240,210,0)'); gr.addColorStop(0.5, 'rgba(255,240,210,0.7)'); gr.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = gr; ctx.fillRect(p.x - dx * L - dy, p.y - dy * L - dx, dx * 2 * L + dy * 2, dy * 2 * L + dx * 2); }
  ctx.restore();
}
function meteors(t) {
  if (t < 29.5 || t > 58) return; const g = g3(), sd = satDir(t), back = sd.clone().multiply(new THREE.Vector3(0.6, 1, 0.6)).normalize();
  ctx.save(); screen(); ctx.lineCap = 'round';
  g.ICE.forEach((h) => { const a = h.t - t, dur = h.big ? 1.6 : 1.1; if (a < 0 || a > dur) return; const y0 = h.water ? seaLevel(t) : h.y, end = new THREE.Vector3(h.x, y0, h.z), sp = h.big ? 2600 : 3200;
    const head = end.clone().addScaledVector(back, a * sp), tail = head.clone().addScaledVector(back, (h.big ? 1800 : 1100) * (1 - a / dur * 0.4)); const P = toScreen(head), Q = toScreen(tail); if (!P.on || !Q.on) return;
    const wd = (h.big ? 18 : 8) * (0.5 + 0.5 * (1 - a / dur)); ctx.globalCompositeOperation = 'lighter';
    for (const [w2, col, al] of [[wd * 4, '120,180,255', 0.18], [wd * 1.8, '190,225,255', 0.45], [wd * 0.7, '245,252,255', 0.95]]) { const gr = ctx.createLinearGradient(P.x, P.y, Q.x, Q.y); gr.addColorStop(0, `rgba(${col},${al})`); gr.addColorStop(1, `rgba(${col},0)`);
      ctx.strokeStyle = gr; ctx.lineWidth = w2; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(Q.x, Q.y); ctx.stroke(); }
    pvGlow(P.x, P.y, wd * 4, 'rgba(230,245,255,0.9)', 0.8); });
  // the far ice: a fine rain of thin streaks across the whole sky
  const R = RNG('fineIce'), n = Math.round(160 * iceRate(t)); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const ph = mod(t * R.r(0.5, 1.2) + R.f(), 1), x0 = R.r(-200, W + 200), y0 = R.r(-300, H * 0.5), L = R.r(40, 160), dx = -R.r(0.2, 0.6), x = x0 + dx * ph * 900, y = y0 + ph * 900;
    ctx.strokeStyle = `rgba(210,235,255,${0.5 * Math.sin(ph * Math.PI)})`; ctx.lineWidth = R.r(1, 2.5); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx * L, y - L); ctx.stroke(); }
  ctx.restore();
}
// inside the clouds: golden-brown bands and billows rushing up past the lens, darkening
function insideSaturn(t) {
  const a = t - T_HIT; ctx.save(); screen(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#c8a670'); g.addColorStop(0.5, '#8a6a44'); g.addColorStop(1, '#4a3622'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const R = RNG('cloudBands'); for (let i = 0; i < 40; i++) { const y = mod(R.r(0, H * 1.6) - a * R.r(1200, 2600), H * 1.6) - H * 0.3, hh = R.r(40, 220), col = R.pick(['rgba(240,220,180,0.5)', 'rgba(200,160,110,0.5)', 'rgba(120,90,60,0.5)', 'rgba(250,236,206,0.4)']);
    const gr = ctx.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(0, y, W, hh); }
  for (let i = 0; i < 26; i++) { const x = R.r(0, W), y = mod(R.r(0, H * 1.4) - a * R.r(1500, 3000), H * 1.4) - H * 0.2, r = R.r(120, 380); pvGlow(x, y, r, R.pick(['rgba(250,236,206,0.5)', 'rgba(170,130,90,0.5)']), 0.7); }
  ctx.fillStyle = `rgba(20,14,8,${clamp(a / 2.2) * 0.75})`; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// frost creeping over the lens from the edges
function frost(a) {
  const k = ss(0, 1.2, a), R = RNG('frost'); ctx.save(); screen(); const v = ctx.createRadialGradient(W / 2, H / 2, H * (0.55 - 0.3 * k), W / 2, H / 2, H * 0.8); v.addColorStop(0, 'rgba(230,240,248,0)'); v.addColorStop(1, `rgba(230,240,248,${0.6 * k})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = `rgba(240,248,255,${0.5 * k})`; ctx.lineWidth = 1.2; for (let i = 0; i < 70; i++) { const ang = R.r(0, TAU), r0 = H * 0.75 - R.r(0, 400) * k, x = W / 2 + Math.cos(ang) * r0 * 0.6, y = H / 2 + Math.sin(ang) * r0; let px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py);
    for (let s = 0; s < 6; s++) { px += -Math.cos(ang) * R.r(10, 30) * k + R.n(8); py += -Math.sin(ang) * R.r(10, 30) * k + R.n(8); ctx.lineTo(px, py); } ctx.stroke(); }
  ctx.restore();
}

// ---- HUD
const fmtN = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function hud() {
  const t = TT; if (t < 0.6 || t >= 62.3) return; const a = ev(0.6, 0.5) * (t > 61.9 ? 1 - ev(61.9, 0.4) : 1);
  if (t < 22) { const m = milesAt(t); const km = m * 1.609; return pvHud('Saturno', `${pvNum(km >= 1e6 ? Math.round(km / 1e5) * 1e5 : Math.round(km / 1000) * 1000)} km`, 'y acercándose', a); }
  if (t < 30) { const mm = Math.round(seaLevel(t)); return pvHud('Marea', `${mm > 0 ? '+' : mm < 0 ? '−' : ''}${Math.abs(mm)} m`, t < 25.5 ? 'el fiordo se vacía' : 'y subiendo', a); }
  if (t < 46) { const n = Math.round(knots([[30, 0], [32, 40], [38, 2600], [46, 40000]], t)); return pvHud('Impactos de los anillos', pvNum(n), 'y contando', a); }
  if (t < T_HIT) { const km = milesAt(t) * 1.609; return pvHud('Saturno', `${pvNum(Math.max(0, km >= 1000 ? Math.round(km / 100) * 100 : Math.round(km)))} km`, t < 53 ? 'dentro del límite de Roche' : 'hasta sus nubes', a); }
  pvHud('Dentro de', 'SATURNO', '', a);
}
function endCard() {
  const a = ev(62.8, 0.8), b = ev(64.0, 0.8), c = ev(65.4, 0.8), e = ev(66.8, 0.7);
  const f = () => {
    const R = RNG('cardIce'); ctx.save(); screen(); for (let i = 0; i < 50; i++) { const x = mod(R.r(0, W) - (TT - 62) * R.r(10, 30), W), y = mod(R.r(0, H) + (TT - 62) * R.r(20, 60), H), r = R.r(1, 3);
      ctx.globalAlpha = R.r(0.1, 0.35) * a; ctx.fillStyle = '#d8c4a0'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.restore();
    pvText('¿Qué pasaría si Saturno', CX, 840, 56, { align: 'center', alpha: a });
    pvText('chocara contra la Tierra?', CX, 912, 56, { align: 'center', alpha: a });
    pvText('TRANQUILO: SATURNO NUNCA SE ACERCA', CX, 1018, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('A MENOS DE 1.200 MILLONES DE KM', CX, 1056, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('Y es tan liviano', CX, 1160, 46, { italic: true, align: 'center', alpha: c });
    pvText('que flotaría en el agua.', CX, 1218, 46, { italic: true, align: 'center', alpha: c });
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
function sceneSaturn() {
  const t = TT;
  if (t < T_HIT) { update(t); star2D(t); meteors(t); }
  // Saturn's gold through the haze at the end; a warm cast
  if (t > 53 && t < T_HIT) pvTint('#c89a5a', 0.25 * ss(53, 59.5, t));
  if (t > 59.0 && t < T_HIT) pvTint('#2a1e12', 0.5 * ss(59.0, T_HIT, t));
  if (t >= T_HIT && t < 62.5) { insideSaturn(t); frost(t - T_HIT); for (const [n, dt] of [[0, 0.2], [1, 0.85]]) if (t >= T_HIT + dt) crackedLens(t - T_HIT - dt, n); }
  if (t >= T_HIT && t < T_HIT + 0.3) pvTint('#fff2d8', 1 - ss(T_HIT, T_HIT + 0.3, t));
  if (t >= 62.0 && t < 62.5) pvTint('#060404', ss(62.0, 62.5, t));
  if (t >= 62.5) { fillAll('#060404'); pvGlow(CX, 960, 900, 'rgba(90,64,34,0.35)', ev(62.5, 1.2)); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si', 'Saturno chocara', 'contra la Tierra?'], 0.3, 5.0);
  caption2('Un planeta con anillos', 'viene hacia nosotros.', 5.5, 13.6);
  caption2('Tiene 95 veces', 'la masa de la Tierra.', 14.4, 21.6);
  caption2('No cae hacia nosotros.', 'Nosotros caemos hacia él.', 22.4, 29.6);
  caption2('Primero llegan los anillos.', 'Son de hielo.', 30.4, 37.6);
  caption2('Miles de millones de trozos.', 'Algunos del tamaño de casas.', 38.4, 45.6);
  caption2('Sus mareas empiezan', 'a desgarrar la Tierra.', 46.4, 52.6);
  caption2('Caemos dentro', 'de sus nubes.', 53.4, 58.8);
}
