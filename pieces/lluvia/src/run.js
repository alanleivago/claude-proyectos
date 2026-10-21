
// =====================================================================
//  RUN — pose the world from TT each frame: the storm, the flood, the jungle, the jump to the Carnian, the volcano, the rain
//  stopping, the dinosaur; the rain and lightning in 2D, the HUD, the captions, the end card
// =====================================================================
const jit = (t, i, f, a) => Math.sin(t * f + i * 1.7) * a + Math.sin(t * f * 1.73 + i * 2.9) * a * 0.6;
function toScreen(p) { const g = g3(), v = p.clone().project(g.cam); return { x: (v.x * 0.5 + 0.5) * W, y: (0.5 - v.y * 0.5) * H, on: v.z < 1 && v.z > -1 }; }
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position;
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const tri = triassic(t), clr = clearSky(t), rk = rainK(t), lv = lakeLevel(t), jg = Math.max(jungle(t), tri), fl = lightning(t), vil = village(t), plumeK = ss(47.5, 50.5, t);
  // sky and light: storm grey -> a green-grey jungle sky -> the Carnian's hazy light -> a clear golden evening
  const su = g.skyU; su.uT.value = t; su.deck.value = (1 - clr) * (1 - 0.35 * tri);
  su.top.value.copy(C3('#3e444c', '#3e4a40', ss(34, 42, t)).lerp(lin('#7a8478'), tri * 0.6).lerp(lin('#6a8ab8'), clr)); su.hor.value.copy(C3('#7a8288', '#7a8a72', ss(34, 42, t)).lerp(lin('#c8c4a8'), tri * 0.6).lerp(lin('#f4c890'), clr));
  su.flash.value = fl * (1 - clr); su.clear.value = clr;
  const fogC = C3('#6a7278', '#5a6a58', ss(34, 42, t)).lerp(lin('#a8a890'), tri * 0.5).lerp(lin('#d8c8a0'), clr); g.scene.fog.color.copy(fogC);
  g.scene.fog.near = lerp(lerp(400, 120, rk), 600, clr); g.scene.fog.far = lerp(lerp(9000, 3200, rk), 11000, clr);
  g.hemi.intensity = lerp(0.95, 0.8, rk) + 1.4 * fl + 0.3 * clr; g.hemi.color.copy(C3('#a8b0b8', '#b8c4a0', jg).lerp(lin('#ffe0b0'), clr));
  g.sun.intensity = 0.25 + 2.2 * clr; g.sun.color.copy(C3('#c8d0d8', '#ffd8a0', clr)); g.r.toneMappingExposure = 1.1 + 0.2 * fl;
  // the lake
  const sea = g.seaMat.uniforms; g.seaMesh.position.y = lv; sea.uT.value = t; sea.uRain.value = rk; sea.uMud.value = 0.65 * ss(14, 22, t) * (1 - ss(34, 42, t) * 0.6) * (1 - tri * 0.6); sea.uSunK.value = clr; sea.uFlash.value = fl;
  sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.fogColor.value.copy(fogC); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  g.jungleU.value = jg * 0.8;
  // the village: lit windows; the power goes as the water rises; houses go under and crumble; gone by the Carnian
  g.WINU.uOn.value = lerp(0.4, 1, ss(0.5, 7, t)); g.WINU.uPow.value = 1 - ss(19, 27, t); g.lamps.material.opacity = 1 - ss(17, 24, t);
  g.HL.forEach((q, i) => { const wet = clamp((lv - q.y0) / q.h), cr = 1 - (1 - vil) * (0.55 + 0.4 * hsh(i)), hide = tri > 0.5 || (vil <= 0 && !q.far) || (q.far && t > 40);
    const h = q.h * cr * (q.far ? 1 : 1), m = hide ? _hid : M4c(q.x, q.y0 - (1 - vil) * 3, q.z, q.ry + (1 - vil) * 0.2 * Math.sin(i), q.sx, h, q.sz, (1 - vil) * 0.15 * Math.sin(i * 3), 0);
    g.houses.setMatrixAt(i, m); g.roofs.setMatrixAt(i, hide || wet > 1.4 ? _hid : M4c(q.x, q.y0 + h - (1 - vil) * 3, q.z, q.ry, q.sx + 0.8, q.rh, q.sz + 0.8, (1 - vil) * 0.25 * Math.sin(i * 2), 0)); });
  g.houses.instanceMatrix.needsUpdate = true; g.roofs.instanceMatrix.needsUpdate = true;
  { const vis = tri < 0.5 && vil > 0; g.chims.visible = vis && lv < 20; g.walls.visible = vis && lv < 8; g.bridge.visible = lv < 3.5 && tri < 0.5; }
  g.bal.position.y = eyeAt(t) - EYE1;
  g.church.visible = tri < 0.5 && t < 33.2; g.church.position.y = terrH(60, -200) - 0.3 - 4 * ss(30, 33, t); g.church.rotation.z = 0.06 * ss(30, 33, t);
  g.jetty.visible = lv < 4 && tri < 0.5;
  g.boats.forEach((b) => { const y = Math.max(lv, terrH(b.x, b.z)) + 0.05 * Math.sin(t * 1.3 + b.ph); b.grp.position.set(b.x + Math.sin(t * 0.07 + b.ph) * 3, y, b.z); b.grp.rotation.set(0.04 * Math.sin(t + b.ph), b.yaw + 0.1 * Math.sin(t * 0.2 + b.ph), 0.06 * Math.sin(t * 1.4 + b.ph)); b.grp.visible = tri < 0.5 && t < 31; });
  // today's trees drown or vanish; the Carnian's ferns, cycads and conifers grow in
  { const cnt = [0, 0]; g.TREES.forEach((tr, i) => { const gone = tri > 0.5 || tr.y < lv + 0.5 || (t > 36 && hsh(i, 5) < ss(36, 42, t)); g.treeI[tr.type].setMatrixAt(tr.slot, gone ? _hid : M4c(tr.x, tr.y - 0.2, tr.z, i + jit(t, i, 1.5, 0.02 * rk), tr.s, tr.s, tr.s, jit(t, i, 2.1, 0.04 * rk))); });
    g.treeI.forEach((m) => (m.instanceMatrix.needsUpdate = true)); }
  { const V = g.vegI; g.VEG.forEach((v, i) => { const k = Math.max(ss(v.t0, v.t0 + 3, t) * jungle(t), tri), on = k > 0.01 && (v.y > lv + 0.3 || v.kind < 2), sc = v.s * (0.2 + 0.8 * k), sw = 0.05 * Math.sin(t * 1.3 + i) * (0.4 + rk), by = Math.max(v.y, lv - 0.6);
      const m = on ? M4c(v.x, by - 0.2, v.z, v.ry, sc, sc, sc, sw, sw * 0.6) : _hid;
      if (v.kind === 0) { V.fernT.setMatrixAt(v.slot, m); V.fernC.setMatrixAt(v.slot, on ? M4c(v.x, by - 0.2 + 5 * sc, v.z, v.ry + t * 0.02, sc, sc, sc, sw, sw) : _hid); }
      else if (v.kind === 1) V.con.setMatrixAt(v.slot, m);
      else if (v.kind === 2) { V.cyc.setMatrixAt(v.slot, m); V.cycC.setMatrixAt(v.slot, on ? M4c(v.x, v.y - 0.2 + 1.5 * sc, v.z, v.ry, sc, sc, sc, sw, sw) : _hid); }
      else V.gr.setMatrixAt(v.slot, m); });
    Object.values(V).forEach((m) => (m.instanceMatrix.needsUpdate = true)); }
  g.PADS.forEach(([x, z, s, ry], i) => g.pads.setMatrixAt(i, jg > 0.05 && terrH(x, z) < lv - 0.2 ? M4c(x, lv + 0.04, z, ry + Math.sin(t * 0.3 + i) * 0.1, s * jg, 1, s * jg) : _hid)); g.pads.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 2400; i++) { const x = (hsh(i, 1) - 0.5) * 900, z = -80 - hsh(i, 2) * 500, b = terrH(x, z), on = jg > 0.05 && Math.abs(b - lv) < 3; g.horse.setMatrixAt(i, on ? M4c(x, lv - 0.3, z, 0, 1, (1 + hsh(i, 3) * 2.5) * jg, 1, jit(t, i, 1.4, 0.05)) : _hid); } g.horse.instanceMatrix.needsUpdate = true;
  // the volcano and its plume: a dark column that boils up and leans with the wind, glowing at the base
  g.volcano.visible = tri > 0.5;
  g.plume.forEach((s, i) => { const a = t - 47.5 - hsh(i) * 2.5; if (a < 0 || tri < 0.5) { s.visible = false; return; } const age = mod(a * 0.05 + hsh(i, 2), 1), y = g.VTOP.y + age * 3400 * ss(0, 3, a), sz = 500 + age * 1600;
    s.position.set(g.VTOP.x - age * 900 + (hsh(i, 3) - 0.5) * 300 * (0.3 + age), y, g.VTOP.z + (hsh(i, 4) - 0.5) * 300); s.scale.set(sz, sz, 1); s.visible = true; s.material.opacity = 0.9 * ss(0, 0.05, age) * ss(0, 1.5, a);
    s.material.color.copy(C3('#ff8a40', '#2a2420', ss(0, 0.12, age)).lerp(lin('#4a3e34'), ss(0.5, 1, age))); s.material.rotation = hsh(i, 5) * 6; });
  { const gl = g.vglow[0]; gl.visible = tri > 0.5 && t > 47.5; gl.position.copy(g.VTOP); gl.scale.set(1500 * plumeK, 900 * plumeK, 1); gl.material.opacity = 0.9 * plumeK * (0.8 + 0.2 * Math.sin(t * 7)); gl.material.color.set('#ff7a30'); }
  // mist over the swamp in the Carnian, golden at the end
  g.mist.forEach((s, i) => { if (tri < 0.3) { s.visible = false; return; } const x = (hsh(i) - 0.5) * 1200 + Math.sin(t * 0.05 + i) * 30, z = -100 - hsh(i, 2) * 900; s.position.set(x, lv + 6 + hsh(i, 3) * 10, z); const sz = 90 + hsh(i, 4) * 120; s.scale.set(sz * 2.2, sz * 0.5, 1); s.visible = true;
    s.material.opacity = 0.45 * tri * (0.6 + 0.4 * clr); s.material.color.copy(C3('#d8dcd0', '#ffe8c0', clr)); });
  // the dinosaur: out of the swamp, up the hill to the railing; it looks at us, rears its head, roars
  { const D = g.dino, P = g.DP, on = t > 56.8; D.visible = on;
    if (on) { const z = dinoZ(t), moving = t < 62.6, x = 0.4 + 2.2 * ss(61.6, 62.6, t) + 0.6 * Math.sin(t * 0.4), gy = terrH(x, z), ph = t * 4.2, roar = t >= T_HIT ? ss(T_HIT, T_HIT + 0.25, t) * (1 - ss(T_HIT + 1.0, T_HIT + 1.4, t)) : 0, look = ss(61.6, 62.6, t), S = 1.6;
      D.scale.setScalar(S); D.position.set(x, gy + 1.8 * S + (moving ? Math.abs(Math.sin(ph)) * 0.08 : 0.04 * Math.sin(t * 2)), z); D.rotation.set(0, Math.PI - 0.32 - 0.1 * look + 0.06 * Math.sin(t * 0.4), 0);
      // the spine: neck raised as it looks at us, lunging on the roar; the tail swaying
      const raise = 0.1 + 0.3 * look - 0.15 * roar, sway = (moving ? 0.35 : 0.18), sp = P.SP0.map(([px, py, pz], i) => { let X = px, Y = py, Z = pz; if (i <= 4) { const k = (4 - i) / 4; X += Math.sin(t * 2.2 - i * 0.7) * sway * k * k * 1.2; Y += 0.05 * Math.sin(t * 2.2 - i) * k; }
        if (i >= 8) { const k = (i - 7) / 3, ang = raise * k; const dz = Z - P.SP0[7][2], dy = Y - P.SP0[7][1]; Z = P.SP0[7][2] + dz * Math.cos(ang) - dy * Math.sin(ang) * 0.3; Y = P.SP0[7][1] + dy + Math.abs(dz) * Math.sin(ang) * 0.8; Z -= roar * 0.35 * k; }
        Y += moving ? 0.04 * Math.sin(ph * 2) : 0; return new THREE.Vector3(X, Y, Z); });
      const crv = new THREE.CatmullRomCurve3(sp), pos = P.bodyGeo.attributes.position, RN = P.RINGS, SG = P.SEG, rad = (u) => { const f = u * (P.SR0.length - 1), i = Math.min(P.SR0.length - 2, Math.floor(f)); return lerp(P.SR0[i], P.SR0[i + 1], f - i); };
      const up0 = new THREE.Vector3(0, 1, 0); for (let r2 = 0; r2 < RN; r2++) { const u = r2 / (RN - 1), c = crv.getPointAt(u), tg = crv.getTangentAt(u).normalize(), side = new THREE.Vector3().crossVectors(tg, up0).normalize(), up = new THREE.Vector3().crossVectors(side, tg).normalize(), rr = rad(u);
        for (let k = 0; k < SG; k++) { const a = k / SG * TAU, ca = Math.cos(a), sa = Math.sin(a), belly = ca < 0 ? 0.85 : 1, ridge = ca > 0.95 ? 0.08 : 0; const p = c.clone().addScaledVector(up, ca * rr * belly + ridge * (u > 0.15 && u < 0.85 ? 1 : 0)).addScaledVector(side, sa * rr * 0.82); pos.setXYZ(r2 * SG + k, p.x, p.y, p.z); } }
      pos.needsUpdate = true; P.bodyGeo.computeVertexNormals(); P.bodyGeo.computeBoundingSphere();
      for (let k = 0; k < 30; k++) { const u = 0.12 + k / 30 * 0.72, c = crv.getPointAt(u), r = rad(u); P.scutes.setMatrixAt(k, M4c(c.x, c.y + r + 0.06, c.z, 0, 1 + r, 1 + r, 1 + r)); } P.scutes.instanceMatrix.needsUpdate = true;
      // the head at the neck's end, along its tangent; the jaw
      const hp = crv.getPointAt(1), ht = crv.getTangentAt(1).normalize(); P.head.position.copy(hp); P.head.rotation.set(-0.12 - 0.08 * look + 0.3 * roar, 0.15 * Math.sin(t * 0.9) * (1 - look) - 0.55 * look, 0.06 * Math.sin(t * 1.3) * (1 - roar), 'YXZ');
      P.jaw.rotation.x = -(0.07 * Math.max(0, Math.sin(t * 1.1)) + 0.42 * roar);
      const A = moving ? 0.6 : 0.05; P.legs.forEach((L, k) => { const s2 = k ? 1 : -1, w = Math.sin(ph + (k ? Math.PI : 0)); L.th.rotation.x = -w * A + 0.15; L.sh.rotation.x = 0.35 + Math.max(0, Math.sin(ph + (k ? Math.PI : 0) + 1.6)) * A; L.mt.rotation.x = -0.5 - 0.2 * Math.max(0, w) * (moving ? 1 : 0); });
      P.arms.forEach((a, k) => (a.rotation.x = 0.5 + 0.12 * Math.sin(t * 2 + k) + 0.4 * roar)); } }
  // foreground fronds grow up in front of the railing in the jungle and the Carnian
  g.FG.forEach((f, i) => { const k = ss(f.t0, f.t0 + 2.5, t), sw = 0.06 * Math.sin(t * 1.6 + i) * (0.4 + rk); g.fg.setMatrixAt(i, k > 0.01 ? M4c(f.x, f.y, f.z, f.ry, f.s * k, f.s * k, f.s * k, sw, sw) : _hid); }); g.fg.instanceMatrix.needsUpdate = true;

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.filter = 'saturate(1.4) contrast(1.04)'; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: rain (three layers of streaks), drops on the lens, lightning bolts
function rain2D(t) {
  const rk = rainK(t); if (rk <= 0.01) return; ctx.save(); screen(); ctx.lineCap = 'round';
  for (const [n, L, wd, sp, al, key] of [[260, 70, 1.2, 2400, 0.22, 'rainA'], [140, 140, 2.0, 3200, 0.28, 'rainB'], [40, 260, 3.2, 4200, 0.3, 'rainC']]) {
    const R = RNG(key), m = Math.round(n * rk); ctx.strokeStyle = `rgba(210,220,228,${al})`; ctx.lineWidth = wd; ctx.beginPath();
    for (let i = 0; i < m; i++) { const x0 = R.r(-200, W + 200), ph = mod(t * sp / H + R.f(), 1), y = ph * (H + 400) - 200, x = x0 - ph * 160; ctx.moveTo(x, y); ctx.lineTo(x + L * 0.12, y - L); }
    ctx.stroke(); }
  // drops on the lens
  const R = RNG('lensDrops'); for (let i = 0; i < Math.round(26 * rk); i++) { const x = R.r(0, W), y0 = R.r(0, H), life = R.r(1.5, 4), a = mod(t + R.f() * life, life) / life, y = y0 + a * a * R.r(0, 200), r = R.r(4, 16);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${0.35 * (1 - a)})`); g.addColorStop(0.7, `rgba(180,190,200,${0.15 * (1 - a)})`); g.addColorStop(1, 'rgba(60,70,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function bolts(t) {
  for (const [t0, wx, wz] of BOLTS) { const a = t - t0; if (a < 0 || a > 0.4 || t > 53) continue; const R = RNG('bolt', t0), al = Math.exp(-a * 7) * (0.7 + 0.3 * Math.sign(Math.sin(a * 70)));
    const P = toScreen(new THREE.Vector3(wx, terrH(wx, wz) + 2, wz)); if (!P.on) continue; const tx = P.x, ty = P.y;
    ctx.save(); screen(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; let x = tx + R.n(160), y = -40; const pts = [[x, y]], n = 14;
    for (let k = 1; k <= n; k++) { const u = k / n; x = lerp(pts[0][0], tx, u) + (k < n ? R.n(34) * (1 - u * 0.5) : 0); y = lerp(-40, ty, u); pts.push([x, y]); }
    const draw = (Q, w0) => { for (const [w2, c2] of [[w0 * 8, 'rgba(160,190,255,0.22)'], [w0 * 3, 'rgba(210,225,255,0.6)'], [w0, 'rgba(255,255,255,1)']]) { ctx.strokeStyle = c2; ctx.lineWidth = w2; ctx.globalAlpha = al; ctx.beginPath(); Q.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); } };
    draw(pts, 2.4); for (let bI = 0; bI < 3; bI++) { const j = 3 + Math.floor(R.f() * 8), [bx, by] = pts[j], br = [[bx, by]]; let qx = bx, qy = by; for (let k = 0; k < 5; k++) { qx += R.r(14, 40) * (bI % 2 ? -1 : 1); qy += R.r(20, 50); br.push([qx, qy]); } draw(br, 1.2); }
    pvGlow(tx, ty, 160, 'rgba(220,230,255,0.9)', al); pvGlow(tx, ty, 420, 'rgba(180,200,255,0.35)', al); ctx.restore(); }
}
// ---- HUD
const durTxt = (s) => s < 3600 ? `${Math.max(1, Math.round(s / 60))} min` : s < 86400 * 2 ? `${Math.round(s / 3600)} ${Math.round(s / 3600) === 1 ? 'hora' : 'horas'}` : s < 86400 * 365 ? `${Math.round(s / 86400)} ${Math.round(s / 86400) === 1 ? 'día' : 'días'}` : `${pvNum(Math.round(s / (86400 * 365) / (s > 3.15e9 ? 100 : 1)) * (s > 3.15e9 ? 100 : 1))} años`;
const RAINED = [[5, Math.log10(60)], [8, Math.log10(7200)], [12, Math.log10(2 * 86400)], [17, Math.log10(13 * 86400)], [22, Math.log10(40 * 86400)], [27, Math.log10(4 * 3.15e7)], [32, Math.log10(100 * 3.15e7)], [37, Math.log10(1e4 * 3.15e7)], [42.9, Math.log10(5.15e4 * 3.15e7)]];
function hud() {
  const t = TT; if (t < 0.6 || t >= 64.2) return; const a = ev(0.6, 0.5) * (t > 63.8 ? 1 - ev(63.8, 0.4) : 1);
  if (t < 5) return pvHud('Tormenta', `a ${knots([[0.6, 1.4], [5, 0.1]], t).toFixed(1).replace('.', ',')} km`, 'acercándose', a);
  if (t < 43) return pvHud('Llueve desde hace', durTxt(Math.pow(10, knots(RAINED, t))), 'sin parar', a);
  if (t < 48) return pvHud('Hace', `${pvNum(Math.round(knots([[43, 0], [44.4, 2.2e8], [45.2, 2.32e8]], t) / 1000) * 1000)} años`, 'el Carniense', a);
  if (t < 53) return pvHud('Ha llovido', `${pvNum(Math.round(knots([[48, 168000], [53, 1425000]], t) / 1000) * 1000)} años`, 'a ratos', a);
  if (t < 57) return pvHud('Ha llovido', '2.000.000 años', 'y paró', a);
  if (t < T_HIT) { const d = Math.max(0, -dinoZ(t)); return pvHud('El dinosaurio', `a ${d >= 10 ? Math.round(d) : d.toFixed(1).replace('.', ',')} m`, 'acercándose', a); }
  pvHud('El dinosaurio', 'AQUÍ', '', a);
}
function endCard() {
  const a = ev(65.0, 0.8), b = ev(66.1, 0.8), e = ev(67.4, 0.7);
  const f = () => {
    pvText('¿Qué pasaría si lloviera', CX, 820, 56, { align: 'center', alpha: a });
    pvText('durante 2 millones de años?', CX, 892, 56, { align: 'center', alpha: a });
    pvText('HACE UNOS 234–232 MILLONES DE AÑOS', CX, 992, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('UN CLIMA MÁS HÚMEDO TRANSFORMÓ LA TIERRA', CX, 1030, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
    pvText('LA LLUVIA LLEGÓ EN PULSOS, NO SIN PARAR', CX, 1068, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.85 });
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
function sceneRain() {
  const t = TT;
  if (t < 64.5) { update(t); rain2D(t); bolts(t); }
  // the jump to the Carnian: a white flash
  if (t > 42.6 && t < 44.2) pvTint('#f4f6f0', ss(42.6, 43.0, t) * (1 - ss(43.2, 44.2, t)));
  // a warm golden haze when the sky clears
  if (t > 53 && t < 64.5) pvTint('#ffcf8a', 0.12 * clearSky(t), 'overlay');
  // the roar: a dark pulse and a breath of mist in front of the lens
  if (t >= T_HIT && t < 64.5) { const a = t - T_HIT; pvTint('#1a1008', 0.25 * Math.exp(-a * 3)); for (let i = 0; i < 6; i++) pvGlow(540 + Math.sin(i * 2.3) * 160, 900 + Math.cos(i * 1.7) * 120, 200 + a * 300, 'rgba(240,236,226,0.45)', 0.5 * Math.exp(-a * 2.2)); }
  if (t >= 64.0 && t < 64.5) pvTint('#06080a', ss(64.0, 64.5, t));
  if (t >= 64.5) { fillAll('#06080a'); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si lloviera', 'durante 2 millones', 'de años?'], 0.3, 5.0);
  pvCaption('Empieza a llover.', 5.5, 9.8);
  caption2('Y no parará en', '2 millones de años.', 10.3, 14.8);
  caption2('Semana 1:', 'las calles son ríos.', 15.3, 19.8);
  caption2('Día 40: el lago', 'se traga el pueblo.', 20.3, 24.8);
  caption2('Año 1: solo', 'quedan los tejados.', 25.3, 29.8);
  caption2('Año 100: el pueblo', 'ha desaparecido.', 30.3, 33.8);
  caption2('Año 10.000:', 'la selva lo cubre todo.', 34.3, 38.8);
  caption2('Helechos más altos', 'que las casas.', 39.3, 42.6);
  caption2('La Tierra vivió', 'algo así de verdad.', 44.0, 47.8);
  caption2('Volcanes gigantes', 'la habrían desatado.', 48.3, 52.8);
  pvCaption('Cuando por fin paró...', 53.4, 56.8);
  pvCaption('...algo nuevo había llegado.', 57.3, 59.9);
  pvCaption('Los dinosaurios.', 60.3, 62.5);
}
