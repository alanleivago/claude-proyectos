
// =====================================================================
//  RUN — pose the worlds from TT each frame, the 2D lens effects, the HUD and the text
// =====================================================================
const VIEW = { vx: CX, vy: H * 0.5 };   // where "straight ahead" lands on screen (zoom blur centre, the light ring)

function updateGround() {
  const g = g3(), t = TT, c = camPose(t);
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll);
  g.cam.fov = 66 + 9 * ss(22.8, 24.6, t) * (1 - ss(28.6, 31, t)); g.cam.updateProjectionMatrix();   // the view stretches wide in the towers
  g.sky.position.copy(g.cam.position);
  const pl = ss(31, 36.5, t); g.skyU.plasma.value = pl;
  g.scene.fog.color.copy(C3('#f6dcc0', '#ff9a50', pl)); g.scene.fog.near = lerp(150, 40, pl); g.scene.fog.far = lerp(9000, 2500, pl);
  g.seaU.uT.value = t;
  // the sun light follows you (shadow box around the camera)
  g.key.position.set(c.x + SUN.x * 400, SUN.y * 400, c.z + SUN.z * 400 - 20); g.key.target.position.set(c.x, 0, c.z - 20); g.key.target.updateMatrixWorld();
  g.key.color.copy(C3('#ffd6a8', '#ff9a5a', pl)); g.hemi.intensity = 0.75 + 0.4 * pl;
  g.clouds.forEach((s) => { const u = s.userData; s.position.set(c.x + u.x, u.y, c.z + u.z); s.scale.set(u.w, u.w * 0.4, 1); s.material.opacity = u.o * (1 - 0.6 * pl); });
  // cars
  const near = (z) => Math.abs(z - c.z) < 700;
  g.cars.forEach(([x, z0, v, , kind], i) => { const z = z0 + v * t, yaw = v < 0 ? 0 : Math.PI;
    if (!near(z)) { g.carB.setMatrixAt(i, _hid); g.carC.setMatrixAt(i, _hid); g.carT.setMatrixAt(i, _hid); for (let k = 0; k < 4; k++) { g.carW.setMatrixAt(i * 4 + k, _hid); g.carL.setMatrixAt(i * 4 + k, _hid); g.carRim.setMatrixAt(i * 4 + k, _hid); }
      g.CAR_PARTS.forEach(({ m, L: PL }) => PL.forEach((_, k) => m.setMatrixAt(i * PL.length + k, _hid))); return; }
    const L = kind ? 4.9 : 4.4, base = M4().compose(_v.set(x, 0, z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(1, 1, kind ? 1.12 : 1));
    const vs = M4().makeScale(1, kind ? 1.18 : 1, 1);   // kind 1 = a taller SUV
    g.carB.setMatrixAt(i, base.clone().multiply(vs)); g.carC.setMatrixAt(i, base.clone().multiply(vs)); g.carT.setMatrixAt(i, base.clone().multiply(Tr(0, 0.3, 0)));
    const spin = -v * t / 0.33;
    [[-0.86, 1.35], [0.86, 1.35], [-0.86, -1.35], [0.86, -1.35]].forEach(([wx, wz], k) => { g.carW.setMatrixAt(i * 4 + k, base.clone().multiply(Tr(wx, 0.33, wz)).multiply(M4().makeRotationX(spin)));
      g.carRim.setMatrixAt(i * 4 + k, base.clone().multiply(Tr(wx * 1.02, 0.33, wz)).multiply(M4().makeRotationX(spin))); });
    g.CAR_PARTS.forEach(({ m, L: PL }) => PL.forEach(([px, py, pz, sx, sy, sz], k) => m.setMatrixAt(i * PL.length + k, base.clone().multiply(vs).multiply(Tr(px, py, pz)).multiply(M4().makeScale(sx, sy, sz)))));
    [[-0.6, -2.21], [0.6, -2.21], [-0.62, 2.21], [0.62, 2.21]].forEach(([lx, lz], k) => g.carL.setMatrixAt(i * 4 + k, base.clone().multiply(Tr(lx, 0.75, lz)))); });
  [g.carB, g.carC, g.carT, g.carW, g.carL, g.carRim, ...g.CAR_PARTS.map((p) => p.m)].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // people
  const PM = g.PM, PG = g.PG, hide = (i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setMatrixAt(i * PG[k][1] + j, _hid); };
  g.ppl.forEach((q, i) => {
    const st = personPose(q, t); if (st.z > c.z + 60 || st.z < c.z - 500 || t > 31) return hide(i);
    const { x, z, yaw, p, walk, run, y } = st, s = q.s, w = q.w;
    const base = M4().compose(_v.set(x, y + (run ? Math.abs(Math.sin(p)) * 0.05 * run : 0), z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(s * w, s, s * w));
    if (run) base.multiply(Rx(0.12 * run));
    const A = 0.42 * walk + 0.85 * run, Ak = 0.5 * walk + 1.3 * run, Aa = 0.35 * walk + 0.75 * run, breathe = 0.02 * Math.sin(t * 1.7 + q.ph);
    const hip = (j) => (j ? 1 : -1) * Math.sin(p) * A, knee = (j) => 0.04 + Ak * Math.max(0, Math.sin(p + 1.7 + (j ? Math.PI : 0)));
    const sh = (j) => (j ? -1 : 1) * Math.sin(p) * Aa + breathe, elb = (j) => 0.18 + 0.15 * walk + 1.25 * run;
    const put = (k, j, m) => PM[k].setMatrixAt(i * PG[k][1] + j, _m.copy(m));
    for (const j of [0, 1]) {
      const th = base.clone().multiply(Tr(j ? 0.095 : -0.095, 0.9, 0)).multiply(Rx(hip(j))), sn = th.clone().multiply(Tr(0, -0.44, 0)).multiply(Rx(knee(j)));
      put('thigh', j, th); put('shin', j, sn); put('shoe', j, sn.clone().multiply(Rx(-knee(j) * 0.4 - hip(j) * 0.3)));
      const ua = base.clone().multiply(Tr(j ? 0.2 : -0.2, 1.4, 0)).multiply(Rz((j ? 1 : -1) * (0.09 + 0.06 * run))).multiply(Rx(sh(j))), fa = ua.clone().multiply(Tr(0, -0.29, 0)).multiply(Rx(-elb(j)));
      put('uarm', j, ua); put('farm', j, fa); put('hand', j, fa);
    }
    // heads turn towards you as you go past (once you are fast)
    const dz = z - c.z, turn = clamp((Math.atan2(c.x - x, dz) - yaw + Math.PI * 3) % TAU - Math.PI, -1.1, 1.1) * ss(9, 12, t) * (Math.abs(dz) < 40 ? 1 : 0);
    put('hips', 0, base.clone().multiply(Tr(0, 0.92, 0))); put('torso', 0, base.clone().multiply(Tr(0, 0.94, 0)));
    put('neck', 0, base.clone().multiply(Tr(0, 1.45, 0))); const hd = base.clone().multiply(Tr(0, 1.6, 0)).multiply(M4().makeRotationY(turn));
    put('head', 0, hd); put('hair', 0, hd.clone().multiply(Tr(0, 0.025, -0.012))); put('hairB', 0, q.longHair ? hd.clone().multiply(Tr(0, -0.08, -0.07)) : _hid);
  });
  for (const k in PM) PM[k].instanceMatrix.needsUpdate = true;
  // gulls glide and flap over the beach
  { const R = RNG('gullsD'); for (let i = 0; i < 18; i++) { const z0 = R.r(60, -ZB), x = R.r(-60, -16), y = R.r(6, 22), v = R.r(4, 8), fl = Math.sin(t * R.r(5, 8) + i) * 0.35;
    g.gulls.setMatrixAt(i, M4c(x + Math.sin(t * 0.3 + i) * 6, y + Math.sin(t * 0.7 + i) * 1.5, z0 - v * t, 0.4 * Math.sin(t * 0.2 + i), 0.9, 0.9 + fl, 0.9, 0, fl)); }
    g.gulls.instanceMatrix.needsUpdate = true; }
  // shards: fly out, fall, glint in the sun
  { const P = g.shardGeo.attributes.position.array, Cc = g.shardGeo.attributes.color.array;
    g.shards.forEach((s, i) => { const a = t - s.t0; if (a < 0 || a > 4) { P[i * 3 + 1] = -100; return; }
      P[i * 3] = s.x + s.vx * a; P[i * 3 + 1] = Math.max(0.02, s.y + s.vy * a - 4.9 * a * a); P[i * 3 + 2] = s.z + s.vz * a;
      const gl = s.b * (0.55 + 0.45 * Math.sin(a * 30 + i)); Cc[i * 3] = gl; Cc[i * 3 + 1] = gl; Cc[i * 3 + 2] = gl * 1.05; });
    g.shardGeo.attributes.position.needsUpdate = true; g.shardGeo.attributes.color.needsUpdate = true; }
  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
  // where straight ahead is on screen
  let ahead = new THREE.Vector3(c.x, c.y, c.z - 1000).project(g.cam); if (ahead.z > 1) ahead = new THREE.Vector3(c.x, c.y, c.z + 1000).project(g.cam); VIEW.vx = (ahead.x * 0.5 + 0.5) * W; VIEW.vy = (-ahead.y * 0.5 + 0.5) * H;
  return g;
}

function updateSpace() {
  const g = g3(), S = gS(), t = TT;
  let pos, q;
  if (t < 48.6) { const sp = spacePose(t); pos = sp.pos; q = sp.q; }
  else { const p48 = spacePose(48.6); pos = p48.pos.clone().add(new THREE.Vector3(0, 0, -(t - 48.6) * 2000));
    const look = 42 * ss(48.6, 49.2, t) * (1 - ss(50.1, 50.8, t)) - 26 * ss(51.6, 52.3, t) * (1 - ss(54.3, 55.0, t));   // turn to the Moon (left), then Jupiter (right)
    q = new THREE.Quaternion().setFromEuler(new THREE.Euler((0.4 * Math.sin(t * 0.3)) * DEG, (look + 0.6 * Math.sin(t * 0.21)) * DEG, (1.5 * Math.sin(t * 0.17) - 0.08 * look + 7 * Math.max(0, t - 54.5) - 3.5 * Math.max(0, t - 64.9)) * DEG, 'YXZ'));   // a slow roll: the packed sky turns round the point ahead
  }
  // 47.6-48.6: turn from the Earth to the way ahead
  if (t >= 47.6 && t < 48.6) { const a = spacePose(t).q, b = new THREE.Quaternion(); q = a.clone().slerp(b, ss(47.6, 48.6, t)); }
  S.cam.position.copy(pos); S.cam.quaternion.copy(q);
  S.earth.rotation.x = t * 0.012; S.cl.rotation.y = t * 0.004;
  S.moon.position.copy(pos).add(new THREE.Vector3(-2500, 250, (t - 50.0) * 3600)); S.moon.rotation.y = 0.8;
  S.jup.position.copy(pos).add(new THREE.Vector3(150000, -14000, (t - 54.0) * 120000)); S.jup.rotation.y = t * 0.05;
  VIEW.vx = CX; VIEW.vy = H / 2;
  S.sunL.position.copy(t < 48.4 ? SUN.clone().multiplyScalar(1e6) : pos.clone().add((t < 51.0 ? new THREE.Vector3(1, 0.45, -0.25) : new THREE.Vector3(-0.35, 0.3, 1)).multiplyScalar(1e6))); S.sunL.intensity = t < 48.4 ? 3.0 : 1.9;
  S.moon.visible = t > 47.5 && t < 52; S.jup.visible = t > 50 && t < 56.5; S.earth.visible = t < 49;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q), rel = starsUpdate(S, t, pos, t >= 56 ? fwd : new THREE.Vector3(0, 0, -1));
  g.r.shadowMap.enabled = false; g.r.render(S.scene, S.cam); g.r.shadowMap.enabled = true;
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
  return rel;
}

// ---- 2D lens effects
function zoomBlur(k) {   // the frame smeared towards the vanishing point
  if (k <= 0.002) return; const g = g3();
  ctx.save(); screen();
  for (let i = 1; i <= 7; i++) { const s = 1 + k * 0.022 * i; ctx.globalAlpha = 0.22 * (1 - i / 9); ctx.drawImage(g.cv, VIEW.vx - VIEW.vx * s, VIEW.vy - VIEW.vy * s, W * s, H * s); }
  ctx.restore();
}
function vaporCone(a) {   // the shock cone at Mach 1: a white ring of condensation round the view, then gone
  if (a <= 0) return; ctx.save(); screen();
  const g = ctx.createRadialGradient(VIEW.vx, VIEW.vy, H * 0.12, VIEW.vx, VIEW.vy, H * 0.75);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.35, `rgba(255,255,255,${0.15 * a})`); g.addColorStop(0.6, `rgba(250,250,255,${0.85 * a})`); g.addColorStop(1, `rgba(240,242,248,${0.95 * a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const R = RNG('vapor'); ctx.globalAlpha = a * 0.55; ctx.strokeStyle = '#ffffff';
  for (let i = 0; i < 70; i++) { const an = R.r(0, TAU), r0 = H * R.r(0.25, 0.4), r1 = r0 + H * R.r(0.15, 0.4); ctx.lineWidth = R.r(2, 8); ctx.beginPath(); ctx.moveTo(VIEW.vx + Math.cos(an) * r0, VIEW.vy + Math.sin(an) * r0); ctx.lineTo(VIEW.vx + Math.cos(an) * r1, VIEW.vy + Math.sin(an) * r1); ctx.stroke(); }
  ctx.restore();
}
function plasma(a, t) {   // the air ahead turns to glowing plasma: an orange halo, streaks streaming past the edges
  if (a <= 0) return; ctx.save(); screen();
  const g = ctx.createRadialGradient(VIEW.vx, VIEW.vy, H * 0.05, VIEW.vx, VIEW.vy, H * 0.8);
  g.addColorStop(0, `rgba(255,240,200,${0.75 * a})`); g.addColorStop(0.2, `rgba(255,180,90,${0.45 * a})`); g.addColorStop(0.5, `rgba(255,120,40,${0.7 * a})`); g.addColorStop(1, `rgba(210,60,20,${0.95 * a})`);
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const R = RNG('plasma', Math.floor(t * 24));
  for (let i = 0; i < 140; i++) { const an = R.r(0, TAU), r0 = H * R.r(0.08, 0.5), L = H * R.r(0.08, 0.4) * (0.5 + a), x0 = VIEW.vx + Math.cos(an) * r0, y0 = VIEW.vy + Math.sin(an) * r0;
    const sg = ctx.createLinearGradient(x0, y0, x0 + Math.cos(an) * L, y0 + Math.sin(an) * L); sg.addColorStop(0, 'rgba(255,200,120,0)'); sg.addColorStop(0.5, `rgba(255,${R.r(120, 210) | 0},70,${0.4 * a})`); sg.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.strokeStyle = sg; ctx.lineWidth = R.r(2, 14); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(an) * L, y0 + Math.sin(an) * L); ctx.stroke(); }
  ctx.restore();
}
function speedLines(a, t) {   // thin white streaks rushing out from the vanishing point
  if (a <= 0) return; ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; const R = RNG('speedl', Math.floor(t * 24));
  for (let i = 0; i < 90; i++) { const an = R.r(0, TAU), r0 = H * R.r(0.18, 0.55), L = H * R.r(0.12, 0.45), x0 = VIEW.vx + Math.cos(an) * r0, y0 = VIEW.vy + Math.sin(an) * r0;
    const g = ctx.createLinearGradient(x0, y0, x0 + Math.cos(an) * L, y0 + Math.sin(an) * L); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, `rgba(255,252,245,${0.35 * a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g; ctx.lineWidth = R.r(1.5, 5); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(an) * L, y0 + Math.sin(an) * L); ctx.stroke(); }
  ctx.restore();
}
function lightRing(rel, t) {   // where Doppler D = 1: the ring between the blue sky ahead and the red sky behind, closing in on the point ahead
  if (t < 56.5) return; const S = gS(), b = rel.b, cth = clamp((1 - 1 / rel.gam) / b, -1, 1), th = Math.acos(cth);
  const f = (H / 2) / Math.tan(S.cam.fov * DEG / 2), r = Math.min(H * 1.5, f * Math.tan(th)), a = ss(56.5, 58.5, t) * (1 - 0.85 * ss(64.6, 64.95, t));
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(VIEW.vx, VIEW.vy, Math.max(0, r * 0.7), VIEW.vx, VIEW.vy, r * 1.35 + 30);
  g.addColorStop(0, 'rgba(120,150,255,0)'); g.addColorStop(0.4, `rgba(150,140,255,${0.22 * a})`); g.addColorStop(0.55, `rgba(255,150,170,${0.2 * a})`); g.addColorStop(1, 'rgba(255,90,60,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const core = ctx.createRadialGradient(VIEW.vx, VIEW.vy, 0, VIEW.vx, VIEW.vy, 40 + 260 * ss(58, 65, t));
  core.addColorStop(0, `rgba(235,242,255,${0.9 * a * ss(57, 63, t)})`); core.addColorStop(0.3, `rgba(170,195,255,${0.4 * a * ss(57, 63, t)})`); core.addColorStop(1, 'rgba(120,150,255,0)');
  ctx.fillStyle = core; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ---- the HUD: your speed; past half of c, the nines and how much time passes on Earth for each of your seconds
const kmTxt = (v) => `${pvNum(v)} km/h`;
function ninesTxt(n) { if (n < 0.999) return `${Math.round((1 - Math.pow(10, -n)) * 100)} %`; const k = Math.floor(n + 1e-9) - 2; return k <= 0 ? '99 %' : k <= 6 ? `99,${'9'.repeat(k)} %` : '99,999999… %'; }
function earthTime(gam) { const s = gam; return s < 9.95 ? `${s.toFixed(1).replace('.', ',')} s` : s < 90 ? `${Math.round(s)} s` : s < 5400 ? `${Math.round(s / 60)} min` : s < 172800 ? `${Math.round(s / 3600)} h` : s < 63e6 ? `${Math.round(s / 86400)} días` : `${pvNum(s / 31.56e6)} años`; }
function hud(rel) {
  const t = TT; if (t < 4.6 || (t >= 64.9 && t < 65.5) || t >= 68.6) return;
  const a = ev(4.6, 0.5) * (1 - ev(68.2, 0.4));
  if (t < 56) { const v = kmh(t), sub = t < 8.7 ? 'corriendo' : t < 11 ? 'Usain Bolt: 44,72 km/h' : t < 17 ? 'velocidad de autopista' : t < 23 ? `Mach ${(v / 1235).toFixed(1).replace('.', ',')}` : t < 31 ? `Mach ${Math.round(v / 1235)}` : t < 37.5 ? 'el aire arde' : t < 41 ? 'velocidad orbital' : t < 44 ? 'velocidad de escape' : t < 50.5 ? 'más que cualquier nave' : 'sonda Parker: 692.000 km/h';
    return pvHud('Velocidad', kmTxt(v < 100 ? Math.round(v) : v < 10000 ? Math.round(v / 5) * 5 : Math.round(v / 100) * 100), sub, a); }
  return pvHud('Velocidad de la luz', ninesTxt(nines(t)), `1 s tuyo = ${earthTime(rel ? rel.gam : 1)} en la Tierra`, a);
}
// the title: bigger, centred, three lines inside the safe zone
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(108, Math.floor(100 * 800 / wmax)), lh = size * 1.14, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 62, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  const a = ev(69.3, 0.7), b = ev(70.0, 0.8), c2 = ev(70.9, 0.8);
  const f = () => {
    pvGlow(CX, 930, 520 + 90 * Math.max(0, TT - 69), 'rgba(90,110,180,0.32)', a * (0.75 + 0.25 * Math.sin(TT * 1.3)));   // a slow breathing glow behind the card
    pvFeather(CX, 920, 520, 260, 0.8 * a);
    pvText('La sonda Parker:', CX, 790, 56, { italic: true, align: 'center', alpha: a });
    pvText('692.000 km/h', CX, 930, 104, { align: 'center', alpha: b });
    pvText('solo el 0,064 % de', CX, 1040, 52, { align: 'center', alpha: c2 });
    pvText('la velocidad de la luz.', CX, 1106, 52, { align: 'center', alpha: c2 });
    ctx.save(); screen(); ctx.globalAlpha = 0.5 * c2; ctx.fillStyle = '#c8d0e0'; ctx.fillRect(CX - 60, 1150, 120, 3); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}

function sceneRun() {
  const t = TT; let rel = null;
  if (t < SPACE_T) {
    updateGround();
    zoomBlur(0.25 * ss(10, 13, t) + 0.75 * ss(13, 19, t) + 0.9 * ss(22.8, 24.6, t) * (1 - 0.4 * ss(28.6, 31, t)));
    speedLines(ss(22.8, 24.2, t) * (1 - ss(28.6, 30.6, t)), t);
    vaporCone(ss(18.35, 18.6, t) * (1 - ss(18.9, 20.0, t)));
    if (t > 18.45 && t < 18.75) pvTint('#ffffff', 0.5 * (1 - seg(t, 18.45, 18.75)));
    plasma(ss(31, 35.5, t), t);
  } else rel = updateSpace();
  // the flare that carries you out of the atmosphere (37.3-39.4)
  const fl = ss(37.3, 38.45, t) * (1 - ss(38.55, 39.6, t)); if (fl > 0) pvTint(C3('#ffb070', '#fff4e4', ss(37.9, 38.5, t)).getStyle(), fl);
  if (rel) lightRing(rel, t);
  // THE HIT (65.5): the whole sky collapses into the point ahead and flares
  if (t >= 65.5 && t < 69) { const k = Math.exp(-(t - 65.5) * 1.6); pvTint('#f2f6ff', 0.95 * k); pvGlow(VIEW.vx, VIEW.vy, 300 + 900 * k, '#ffffff', 0.9); }
  if (t >= 68.4) { const k = ss(68.4, 69.3, t); pvTint('#04050a', 0.62 * k); }
  if (t >= 69) endCard();
  hud(rel);
  bigTitle(['¿Que pasaría si', 'corrieras cada vez', 'más rapido?'], 0.3, 4.4);
  pvCaption('Empiezas a correr.', 5.0, 8.6);
  pvCaption('Más rápido que Usain Bolt.', 8.8, 11.0);
  pvCaption('Velocidad de autopista. A pie.', 11.2, 16.9);
  pvCaption('Rompes la barrera del sonido.', 19.2, 20.2);
  pvCaption('Detrás de ti, estallan los cristales.', 20.3, 22.9);
  pvCaption('Más rápido que un SR-71.', 26.0, 30.6);
  pvCaption('El aire frente a ti arde.', 31.2, 37.2);
  pvCaption('Ya no puedes caer.', 38.9, 41.0);
  pvCaption('Escapas de la Tierra.', 41.2, 43.8);
  pvCaption('Más rápido que la sonda Parker.', 50.5, 52.0);
  pvCaption('Júpiter, en minutos.', 52.1, 55.0);
  pvCaption('El tiempo se frena para ti.', 56.5, 60.4);
  pvCaption('Tu segundo: días en la Tierra.', 62.5, 64.8);
  pvCaption('Pero la luz nunca la alcanzas.', 65.9, 68.7);
}
