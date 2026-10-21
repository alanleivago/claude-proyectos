
// =====================================================================
//  RUN — pose the world from TT each frame; the HUD, the title, the captions, the underwater ending, the end card
// =====================================================================
let TF_READY = false;
function prepTimes(g) {   // when the wall reaches each building, tank, tower (once)
  if (TF_READY) return; TF_READY = true;
  g.BL.forEach((b) => { b.tf = waveAt(b.z + b.sz / 2); }); g.towers.forEach((tw) => { tw.tf = waveAt(tw.front); });
}
function update(t) {
  const g = g3(), c = camPose(t), cp = g.cam.position; prepTimes(g);
  cp.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.updateMatrixWorld();
  g.sky.position.copy(cp);
  const on = t >= 24, wv = waveVis(t), zw = wv.zw, Hv = wv.Hv, lev = seaLevel(t);
  // the wall's shadow over us: how much sky it covers
  const crestAng = on ? Math.atan2(Hv * 1.05 - c.y, c.z - zw) : 0, cover = ss(4 * DEG, 40 * DEG, crestAng);
  // dusk deepens: the sun sinks, the city lights come on (windows, towers, streets, the bridges, our string lights)
  const dusk = ss(0, 40, t), su = g.skyU;
  su.top.value.copy(C3('#2f437e', '#22305e', dusk)); su.mid.value.copy(C3('#8a8cbc', '#6a6a9a', dusk)); su.hor.value.copy(C3('#f4b48e', '#e89a7e', dusk)); su.dark.value = 0.3 * cover;
  su.sunDir.value.copy(dirV(68 * DEG, lerp(4.5, 2.2, dusk) * DEG));
  g.WINU.uOn.value = lerp(0.32, 1, ss(0, 30, t)); g.winMats.forEach((m) => (m.emissiveIntensity = lerp(0.25, 1.3, ss(0, 30, t))));
  g.streetLights.material.opacity = ss(2, 14, t); g.bridgeLamps.material.opacity = ss(0, 10, t) * (t < waveAt(-13700) ? 1 : 0); g.bulbs.material.opacity = 0.8 + 0.2 * Math.sin(t * 0.7);
  g.sun.intensity = lerp(2.4, 1.6, dusk) * (1 - 0.7 * cover); g.hemi.intensity = lerp(0.8, 0.6, dusk) * (1 - 0.45 * cover);
  g.r.toneMappingExposure = 1.1 - 0.3 * cover;
  const fogC = C3('#c7a8a4', '#9a8a98', dusk).lerp(lin('#6a7a80'), cover * 0.6); g.scene.fog.color.copy(fogC); g.scene.fog.far = lerp(30000, 9000, ss(50, 62, t)); g.scene.fog.near = lerp(1500, 400, ss(50, 62, t));
  // clouds drift slowly
  g.clouds.forEach((s) => { const u = s.userData; s.position.set(u.x + t * 12, u.y, u.z); s.scale.set(u.w, u.w * u.a, 1); s.material.opacity = u.o * (1 - 0.5 * cover); s.material.color.copy(C3('#ffd0c0', '#c89aa8', dusk)); });
  // the water drains
  const sea = g.seaMat.uniforms; g.seaMesh.position.y = lev; sea.uT.value = t; sea.uLevel.value = lev; sea.uDark.value = 0.3 * cover; sea.uChurn.value = ss(55, 62, t);
  sea.fogColor.value.copy(fogC); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  // the wave: rebuild the swept wall
  g.wave.visible = on;
  if (on) {
    const { wPos, wUv, wX, wProf, wArc, WNX, WNS } = g, Y0 = -18;
    for (let i = 0; i < WNX; i++) { const x = wX[i], hx = 1 + 0.035 * Math.sin(x * 0.0011 + 1.3) + 0.02 * Math.sin(x * 0.0037 + 0.4), cr = Hv * hx, zo = zw - x * x / 260000 + 0.02 * Hv * Math.sin(x * 0.0009 + 0.5);
      for (let j = 0; j < WNS; j++) { const k = i * WNS + j, [dn, yn] = wProf[j]; wPos[k * 3] = x; wPos[k * 3 + 1] = Y0 + yn * (cr - Y0); wPos[k * 3 + 2] = zo + dn * cr; wUv[k * 2] = x / 220; wUv[k * 2 + 1] = wArc[j] * (cr - Y0) / 220; } }
    g.wGeo.attributes.position.needsUpdate = true; g.wGeo.attributes.uv.needsUpdate = true; g.wGeo.computeVertexNormals();
    const wu = g.waveU; wu.uT.value = t; wu.uFogC.value.copy(fogC); wu.uFogNear.value = g.scene.fog.near; wu.uFogFar.value = Math.max(g.scene.fog.far, 6000); wu.uFogK.value = 0.55 * (1 - ss(40, 55, t)) + 0.1; wu.uLight.value = 1 - 0.3 * cover;
  }
  const hitK = (z0, lead = 0) => on ? clamp((zw + 0.3 * Hv + lead - z0) / 60) : 0;
  // boats: they cruise, settle on the mud as the harbour drains, and are thrown when the wall arrives
  g.boats.forEach((b) => { const tm = Math.min(t, 12), dx = Math.sin(b.yaw) * b.v * tm, dz = Math.cos(b.yaw) * b.v * tm, x = b.x + dx, z = b.z + dz, bc = bedH(x, z), fy = lev - 0.4 * b.D, gnd = ss(-0.05, 0.8, bc - fy), hk = hitK(z);
    let y = Math.max(fy, bc - 0.1 * b.D * gnd) + (1 - gnd) * 0.15 * Math.sin(t * 0.9 + b.ph); let roll = b.roll * 0.25 * gnd + (1 - gnd) * 0.03 * Math.sin(t * 1.1 + b.ph), pitch = gnd * 0.04 * b.roll;
    y += hk * hk * Hv * 0.4; roll += hk * 2.5 * b.roll; pitch += hk * 1.2;
    b.grp.position.set(x, y, z + hk * 60); b.grp.rotation.set(pitch, b.yaw + hk * 0.8, roll); b.grp.visible = hk < 1; });
  // the Verrazzano goes under; towers and the Statue lean, sink and vanish once the wall rolls over them
  g.verraz.visible = t < waveAt(-13700) + 1.5;
  g.towers.forEach((tw) => { const k = ss(tw.tf - 0.3, tw.tf + 2.4, t), d = ss(tw.tf + 0.6, tw.tf + 3.6, t);
    tw.grp.visible = t < tw.tf + 3.8; tw.grp.rotation.x = (tw.statue ? 0.5 : 0.32) * k; tw.grp.position.y = LAND_Y - tw.h * 0.55 * d;
    if (tw.hero && tw.grp.userData.beacon) tw.grp.userData.beacon.visible = Math.sin(t * 3.1) > 0.3; });
  // buildings, tanks and AC units go under the wall
  {   // every frame (Staten Island goes under from ~37 s, Manhattan from ~53 s)
    g.BL.forEach((b, i) => { const k = ss(b.tf, b.tf + 0.9, t); g.bld.setMatrixAt(i, k >= 1 ? _hid : M4c(b.x, b.y0 - b.h * 0.3 * k, b.z + 8 * k, 0, b.sx, b.h, b.sz, 0.25 * k)); });
    g.bld.instanceMatrix.needsUpdate = true;
    g.TK.forEach(([b], j) => { const k = ss(b.tf - 0.4, b.tf + 0.3, t), s = b.tk[2]; g.tanks.setMatrixAt(j, k >= 1 ? _hid : M4c(b.tk[0], b.y0 + b.h + 6 * k, b.tk[1] + 25 * k, k * 2, s, s, s, k * 1.5)); });
    g.tanks.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < g.acN; i++) { const b = g.BL[i]; if (t > b.tf) g.ac.setMatrixAt(i, _hid); else g.ac.setMatrixAt(i, M4c(b.x + (hsh(i, 5) - 0.5) * b.sx * 0.6, b.y0 + b.h, b.z + (hsh(i, 6) - 0.5) * b.sz * 0.6, 0, 2 + hsh(i, 7) * 3, 1.5 + hsh(i, 8) * 2.5, 2 + hsh(i, 9) * 3)); }
    g.ac.instanceMatrix.needsUpdate = true; }
  // traffic: moving until the panic (a jam from 50 s), gone under the wall
  { const P = g.cars.geometry.attributes.position.array, tm = Math.min(t, 50) + 0.15 * Math.max(0, Math.min(t, 53) - 50);
    g.CARS.forEach((cc, i) => { const z = -3900 + mod(cc.z0 + 3900 + cc.v * tm, 4600); const gone = on && z < zw + 40; P.set(gone ? [0, -1e5, 0] : [cc.x, LAND_Y + 1, z], i * 3); }); g.cars.geometry.attributes.position.needsUpdate = true; }
  // the helicopter comes up the Hudson, then banks away north fast when the wall appears
  { const a = Math.max(0, t - 30); g.heli.position.set(1900 - 200 * Math.sin(t * 0.05) - a * a * 2, 260 + a * 6, -4200 + t * 45 + a * a * 18); g.heli.rotation.set(0, -Math.PI / 2 + 0.3 * ss(30, 34, t), 0.2 * ss(30, 33, t)); g.heli.visible = t < 46;
    g.heli.userData.blink.visible = Math.sin(t * 6) > 0.5; }
  // people: on our roof and the neighbours' roofs; they watch, then run (our neighbours at the parapet back away towards the door)
  g.FOLK.forEach((f, i) => { const [x0, z0, s, y0 = ROOF] = f, ours = false, run = Math.max(0, t - (ours ? 55 + i * 0.4 : 50 + hsh(i) * 4)), gone = run > (ours ? 2.2 : 3.5) || (!ours && t > waveAt(z0));
    const x = x0 + (ours ? (i - 1) * run * 2 : 0), z = z0 + run * (ours ? 6 : 3), bob = run > 0 ? Math.abs(Math.sin(t * 13 + i)) * 0.1 : 0.01 * Math.sin(t * 1.3 + i);
    const m = gone ? _hid : M4c(x, y0 + bob, z, run > 0 ? 0 : Math.PI, s, s, s); g.folkB.setMatrixAt(i, m); g.folkH.setMatrixAt(i, m); });
  g.folkB.instanceMatrix.needsUpdate = true; g.folkH.instanceMatrix.needsUpdate = true;

  // spray: mist along the lip, churn at the toe, bursts where it hits the bridge, the towers, the Statue and the boats; the impact
  let si = 0; const SP = g.sprays, put = (x, y, z, sc, op, col) => { if (si >= SP.length || op <= 0.005) return; const s = SP[si++]; s.visible = true; s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.min(1, op); s.material.color.set(col || '#ffffff'); };
  if (on && Hv > 40) {
    const dist = c.z - zw, half = dist * 0.45 + 0.3 * Hv, front = zw + 0.15 * Hv, lipA = ss(60, 220, Hv), R = RNG('lipNY');
    for (let k = 0; k < 80; k++) { const u = R.f(), age = mod(t * R.r(0.12, 0.22) + R.f(), 1), x = c.x + (u * 2 - 1) * half, zo = -x * x / 260000;
      put(x, Hv * (1.0 + 0.04 * Math.sin(x * 0.0011 + 1.3)) + age * 0.12 * Hv, front + zo + 8, Hv * R.r(0.12, 0.22) * (0.7 + age), 0.55 * lipA * Math.sin(age * Math.PI), '#f2eeec'); }
    for (let k = 0; k < 50; k++) { const u = R.f(), age = mod(t * R.r(0.2, 0.35) + R.f(), 1), x = c.x + (u * 2 - 1) * half, zo = -x * x / 260000;
      put(x, Math.max(lev, -10) + age * 0.1 * Hv, zw + 0.36 * Hv + zo + 6, Hv * R.r(0.12, 0.2) * (0.6 + age), 0.4 * lipA * Math.sin(age * Math.PI), '#e8eeee'); }
    const splash = (x, w, th, key) => { if (th < -40 || th > 520) return; const a = clamp((th + 40) / 560), Rt = RNG('splNY', key), fz = (y) => zw + (0.035 + 0.1 * (y / Hv) ** 2) * Hv + 22, inA = ss(0, 0.06, a);
      for (let j = 0; j < 7; j++) { const y = 4 + a * 0.22 * Hv + Rt.r(0, 0.08) * Hv; put(x + Rt.n(w * 0.9), y, fz(y), Hv * (0.12 + 0.32 * a) * Rt.r(0.7, 1.2), 0.95 * inA * Math.pow(1 - a, 0.6), '#ffffff'); }
      for (let col = 0; col < 5; col++) { const cx = x + Rt.n(w * 1.2), top = Rt.r(0.45, 0.95) * Hv * Math.pow(a, 0.6);
        for (let j = 0; j < 4; j++) { const y = 4 + top * (j + 1) / 4; put(cx + Rt.n(6), y, fz(y), w * 2.5 + Hv * 0.1 * (1 + j * 0.3), 0.85 * inA * (1 - a) * (0.6 + 0.4 * (1 - j / 4)), '#f8fbfc'); } } };
    g.towers.forEach((tw, ti) => splash(tw.x, tw.w, zw + 0.05 * Hv - tw.front, ti));
    for (const bx of [1400, 2050, 2700]) splash(bx, 60, zw + 0.05 * Hv + 13700, 900 + bx);
    g.boats.forEach((b, bi) => { const hk = hitK(b.grp.position.z, 20); if (hk <= 0 || hk >= 1) return; const Rb = RNG('bspNY', bi); for (let j = 0; j < 3; j++) put(b.grp.position.x + Rb.n(6), hk * 40 + j * 10, b.grp.position.z + 14, 16 + hk * 30, 0.5 * Math.sin(hk * Math.PI), '#ffffff'); });
  }
  if (t > 61.6) { const k = ss(61.6, T_HIT, t), R = RNG('impactNY');
    for (let j = 0; j < 60; j++) { const a = R.f(), x = c.x + R.n(30 + 60 * k), y = ROOF + R.r(-30, 60) * (0.4 + k), z = lerp(zw + 40, c.z - 10, a * k); put(x, y, z, R.r(20, 60) * (0.5 + k), k * R.r(0.5, 0.95), '#f4f6f6'); } }
  for (; si < SP.length; si++) SP[si].visible = false;
  // debris carried up the face
  { const D = g.debris, R = RNG('debrisNY'), act = on && t > 50 && Hv > 200;
    for (let i = 0; i < 160; i++) { if (!act) { D.setMatrixAt(i, _hid); continue; }
      const dist = c.z - zw, x = c.x + R.n(dist * 0.35 + 60), age = mod(t * R.r(0.12, 0.25) + R.f(), 1), sz = R.r(1, 8) * (1 + dist / 600);
      D.setMatrixAt(i, M4c(x, -2 + age * 0.55 * Hv, zw + 0.03 * Hv + 8 + age * 0.06 * Hv, t * R.r(1, 3), sz, sz * R.r(0.2, 0.6), sz * R.r(0.4, 1), t * R.r(1, 3), t * R.r(0.5, 2))); }
    D.instanceMatrix.needsUpdate = true; }

  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// gulls over the harbour; they lift off and flee at the line
function gulls() {
  if (TT > 40) return;
  const R = RNG('gullsNY'); ctx.save(); screen(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const gull = (x, y, s, fl, a) => { ctx.globalAlpha = a; ctx.fillStyle = 'rgba(246,240,236,0.95)'; ctx.strokeStyle = 'rgba(70,64,74,0.8)'; ctx.lineWidth = Math.max(1.2, s * 0.09);
    ctx.beginPath(); ctx.moveTo(x - s, y - s * fl * 0.6); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.45, x, y); ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.45, x + s, y - s * fl * 0.6);
    ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.18, x, y + s * 0.12); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.18, x - s, y - s * fl * 0.6); ctx.fill(); ctx.stroke(); };
  for (let i = 0; i < 8; i++) { const cx = R.r(120, 960), cy = R.r(500, 900), rr = R.r(60, 200), sp = R.r(0.15, 0.35) * (R.f() < 0.5 ? 1 : -1), a = TT * sp + R.r(0, TAU), s = R.r(10, 18), flee = ss(26, 30, TT);
    gull(cx + Math.cos(a) * rr + flee * (cx - 540) * 3, cy + Math.sin(a) * rr * 0.35 - flee * 700, s * (1 + flee), Math.sin(TT * (6 + 6 * flee) + i * 1.3) * 0.7, 1 - ss(31, 34, TT)); }
  if (TT > 26.5 && TT < 38) for (let i = 0; i < 40; i++) { const t0 = 26.5 + R.r(0, 7), k = (TT - t0) / R.r(2.2, 3.8); if (k < 0 || k > 1) continue;
    const ang = R.r(-2.6, -0.5), sx = 540 + R.n(160), sy = 980 + R.n(40), d = Math.pow(k, 1.6) * R.r(700, 1300); gull(sx + Math.cos(ang) * d * 1.2, sy + Math.sin(ang) * d, 4 + k * k * R.r(26, 54), Math.sin(TT * 14 + i) * 0.8, ss(0, 0.15, k)); }
  ctx.restore();
}

// ---- HUD: arrival, then sea level, then the wave's height and distance, then HERE
const mss = (s) => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function hud() {
  const t = TT; if (t < 0.6 || t >= 65.2) return; const a = ev(0.6, 0.5) * (t > 64.8 ? 1 - ev(64.8, 0.4) : 1);
  if (t < 11) return pvHud('Llegada', mss(T_HIT - t), 'nadie lo sabe aún', a);
  if (t < 24) { const lv = Math.round(seaLevel(t)); return pvHud('Nivel del mar', `${lv < 0 ? '−' : ''}${Math.abs(lv)} m`, t < 20.5 ? 'el puerto se vacía' : 'el mar se ha ido', a); }
  if (t < 62.0) { const hm = Math.round(waveHm(t) / 2) * 2, km = (CAMZ - waveZ(t)) / 1000; return pvHud('Altura de la ola', `${pvNum(hm)} m`, km >= 1 ? `a ${km >= 9.95 ? Math.round(km) : km.toFixed(1).replace('.', ',')} km` : `a ${pvNum(Math.round(km * 100) * 10)} m`, a); }
  if (t < T_HIT) return;
  pvHud('La ola', 'AQUÍ', '', a);
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
function endCard() {
  const a = ev(65.8, 0.8), b = ev(66.9, 0.8), e = ev(68.0, 0.7);
  const f = () => {
    const R = RNG('cardBubbles'); ctx.save(); screen(); for (let i = 0; i < 50; i++) { const x = R.r(0, W) + Math.sin(TT * R.r(0.5, 1.5) + i) * 12, y = mod(R.r(0, H) - (TT - 65) * R.r(30, 90), H), r = R.r(1.5, 5);
      ctx.globalAlpha = R.r(0.1, 0.3) * a; ctx.strokeStyle = '#9ad0d8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); } ctx.restore();
    pvText('¿Qué pasaría si un tsunami', CX, 820, 54, { align: 'center', alpha: a });
    pvText('más alto que un rascacielos', CX, 890, 54, { align: 'center', alpha: a });
    pvText('golpeara Nueva York?', CX, 960, 54, { align: 'center', alpha: a });
    pvText('BAHÍA LITUYA, ALASKA, 1958', CX, 1060, 24, { font: PV.sans, weight: 600, spacing: 5, align: 'center', alpha: b * 0.85 });
    pvText('UNA OLA SUBIÓ 524 METROS', CX, 1102, 24, { font: PV.sans, weight: 600, spacing: 5, align: 'center', alpha: b * 0.85 });
    pvText('ALTERBASETV', CX, 1460, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
// the lens cracks under the water: stars of jagged cracks with rings between them
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

function sceneNY() {
  const t = TT;
  if (t < T_HIT) { update(t); gulls(); }
  // the last half second: the wall's shadow and spray close in
  if (t > 61.8 && t < T_HIT) pvTint('#16343c', 0.6 * ss(61.8, T_HIT, t));
  if (t >= T_HIT && t < 65.6) { underwater(t); for (const [n, dt] of [[0, 0.15], [1, 0.8], [2, 1.45]]) if (t >= T_HIT + dt) crackedLens(t - T_HIT - dt, n); }
  if (t >= T_HIT && t < T_HIT + 0.35) pvTint('#eaf6f4', 1 - ss(T_HIT, T_HIT + 0.35, t));   // the white smash of water
  if (t >= 65.1 && t < 65.6) pvTint('#04080a', ss(65.1, 65.6, t));
  if (t >= 65.6) { fillAll('#04080a'); pvGlow(CX, 960, 900, 'rgba(20,60,66,0.5)', ev(65.6, 1.2)); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si un tsunami', 'más alto que un rascacielos', 'golpeara Nueva York?'], 0.3, 5.2);
  caption2('Una tarde cualquiera', 'en Nueva York.', 5.6, 10.8);
  caption2('Entonces el puerto', 'empieza a vaciarse.', 11.4, 17.6);
  pvCaption('El mar se retira.', 18.2, 23.6);
  pvCaption('Aparece una línea en el horizonte.', 24.4, 30.6);
  pvCaption('No es una línea. Es un muro.', 31.4, 36.6);
  pvCaption('Se traga el puente entero.', 37.4, 42.6);
  caption2('La Estatua de la Libertad', 'mide 93 metros.', 43.4, 48.6);
  pvCaption('La ola mide 524.', 49.2, 52.8);
  pvCaption('Llega a Battery Park.', 53.4, 57.6);
  pvCaption('Las torres no la frenan.', 58.2, 61.9);
  pvCaption('Nada queda en pie.', 63.3, 65.1);
}
