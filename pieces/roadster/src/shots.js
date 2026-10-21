// =====================================================================
//  SHOTS — every shot of reference 6 in reference time R (RNOW = refT(TT)), then the HUD and the captions.
// =====================================================================
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
let HUD = { pill: '', speed: null };

function sceneMain() {
  const R = (RNOW = refT(TT));
  resetWorld(); HUD = { pill: '', speed: null };
  cheer(R < 3.6 ? 0.15 : R < 12.5 ? 1 : R < 73.3 ? 0.2 : 1);   // the stands go wild when it flies and when it lands
  const D = [];
  const shot = SHOTS_R.find(([, a, b]) => R >= a && R < b) || SHOTS_R[SHOTS_R.length - 1];
  SHOT_FN[shot[0]](R, D);
  renderWorld();
  D.forEach((f) => f());
  const hud = () => {
    s3Note('RECREADO · ILUSTRATIVO', 0.9, { y: 214 });
    if (HUD.pill) s3Pill(HUD.pill, 1, { y: 290 });
    if (HUD.speed != null) s3Readout(String(Math.max(0, Math.round(HUD.speed))), 'km/h', 'VELOCIDAD', 1, { y: 1300 });
    s3Caption(TT);
  };
  if (DEFER) DEFER.push(hud); else hud();
}
// the hero on the track at arc length s, its wheels turning with s
function heroOn(s, h = 0) { const g = g3(); poseCar(g.hero, trackPose(s), h); spinWheels(g.hero, s); return g.hero; }
// the hero free in the air: position p, forward t, up n
function heroFree(p, t, n) { const g = g3(); poseCar(g.hero, { p, t, n }); return g.hero; }
// up vector for a car heading -x rolled by phi about its forward axis (phi = 0 upright)
const rollUp = (phi) => V3(0, Math.cos(phi), Math.sin(phi));
const kmh = (v) => v * 3.6;
// a label on a world point with a leader from the text
function tag(v, dx, dy, title, sub, a, c = S3.yellow, size = 44, align = 'left') {
  if (a <= 0) return; const [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); } const lx = clamp(x + dx, 60, 1020), ly = y + dy;
  s3Leader(lx + (align === 'right' ? 8 : -8), ly + 10, x, y, c, a * 0.85, 1, 2.5); s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}

// the intro flight: approach, loop, ceiling, detach, flip, land (also reused for the camera)
function introPose(R) {
  if (R < 1.4) { const s = 34 * (R - 1.4); return { s, v: 34 }; }
  if (R < 2.9) { const u = R - 1.4; return { s: 34 * u - 6 * u * u, v: 34 - 12 * u }; }
  if (R < 3.6) { const u = R - 2.9; return { s: LOOP_LEN + 16 * u - 2.86 * u * u, v: 16 - 5.7 * u }; }
  return { s: null, v: 12 };
}
function introFlight(R) {   // R >= 3.6
  const t = R - 3.6, T = 1.4;
  if (t < T) { const u = t / T, x = -9.8 - 12 * t - 6 * t * t, y = 2 * LR * (1 - u * u) + 0.0, phi = Math.PI * (1 - EZ.io(seg(t, 0.15, 1.15))); return { p: V3(x, Math.max(0, y), 0), phi, v: 12 + 12 * t }; }
  const u = t - T; return { p: V3(-9.8 - 12 * T - 6 * T * T - 10 * u, 0, 0), phi: 0, v: 10 };
}

const SHOT_FN = {
  intro(R, D) {
    const g = g3(); lightOn(-10, 10, 0);
    const ip = introPose(R); let p;
    if (ip.s != null) { heroOn(ip.s); p = trackPose(ip.s).p; HUD.speed = kmh(ip.v); }
    else { const f = introFlight(R); heroFree(f.p, V3(-1, 0, 0), rollUp(f.phi)); spinWheels(g.hero, -f.p.x); p = f.p; HUD.speed = kmh(f.v);
      const fire = KO(R, 3.6, 4.5, 0.15); for (let k = 0; k < 26 && fire > 0; k++) { const age = k * 0.035, q = introFlight(Math.max(3.6, R - age)); puff(q.p.clone().add(V3(2.6 + age * 9, 0.6, 0)), 0.5 + age * 3, fire * (1 - age / 0.95) * 0.75); } }
    speedSign(HUD.speed);
    const c0 = follow(p, [-7.5, 1.6, 6.5], 45, [2.5, 0.6, 0]), c1 = { pos: [-7, 4, 30], tgt: [5, 11, 0], fov: 52 }, c2 = follow(p, [4, -11, 16], 48, [-2, -0.5, 0]), c3 = follow(p, [6, 3, 22], 48, [-3, 0, 0]);
    let c = c0; if (R >= 1.2) c = mixCam(c0, c1, EZ.io(seg(R, 1.2, 1.6))); if (R >= 2.2) c = mixCam(c1, c2, EZ.io(seg(R, 2.2, 2.6))); if (R >= 3.7) c = mixCam(c2, c3, EZ.io(seg(R, 3.7, 4.3)));
    setCam(c); HUD.pill = R < 2.2 ? 'EN LA PISTA' : R < 3.6 ? 'BOCA ABAJO' : 'VUELA';
  },
  como(R, D) {
    lightOn(-40, 10, 0); const f = introFlight(R); heroFree(f.p, V3(-1, 0, 0), rollUp(0)); spinWheels(g3().hero, f.p.x);
    speedSign(0);
    setCam(mixCam(follow(f.p, [6, 3, 22], 48, [-3, 0, 0]), { pos: [-150, 42, 105], tgt: [-28, 6, -4], fov: 40 }, EZ.io(seg(R, 5.4, 6.2))), 0.4);
    HUD.pill = 'PISTA DE PRUEBAS';
  },
  corolla(R, D) {
    const g = g3(); lightOn(0, 8, 0); g.hero.visible = false; g.corolla.visible = true;
    let v, p;
    if (R < 8.67) { const s = -40 + 24 * (R - 7); poseCar(g.corolla, trackPose(s)); spinWheels(g.corolla, s); v = 24; p = trackPose(s).p; }
    else if (R < 10.35) { const u = R - 8.67, s = 24 * u - 7 * u * u; poseCar(g.corolla, trackPose(s)); spinWheels(g.corolla, s); v = 24 - 14 * u; p = trackPose(s).p; }
    else { // it lets go: falls, turns over, lands on its roof and rocks
      const s0 = 24 * 1.68 - 7 * 1.68 * 1.68, P0 = trackPose(s0), t = R - 10.35, T = 1.35, u = Math.min(1, t / T);
      const pos = P0.p.clone().lerp(V3(P0.p.x + 1.5, 1.45, 0), u); pos.y = lerp(P0.p.y, 1.45, u * u);
      const ang = lerp(Math.atan2(P0.t.y, P0.t.x), Math.PI + 0.0, EZ.io(u)) + (t > T ? 0.06 * Math.sin((t - T) * 14) * Math.exp(-(t - T) * 4) : 0);
      const fw = V3(Math.cos(ang), Math.sin(ang), 0), up = V3(-Math.sin(ang), Math.cos(ang), 0);
      poseCar(g.corolla, { p: pos, t: fw, n: up }, 0); v = 0; p = pos;
      if (t > T) for (let k = 0; k < 14; k++) { const Rn = RNG('crash', k), a = seg(t, T, T + 1.0); puff(V3(pos.x + Rn.n(3), 0.4 + a * Rn.r(0.5, 2.5), Rn.n(2.5)), 1 + a * 3, (1 - a) * 0.6, '#c9a68a'); }
    }
    speedSign(kmh(v)); HUD.speed = kmh(v);
    const c0 = follow(p, [-6.5, 1.8, 7], 46, [3, 0.8, 0]), c1 = { pos: [-6, 9, 36], tgt: [7, 9, 0], fov: 52 }, c2 = { pos: [5, 4, 19], tgt: [12, 1.2, 0], fov: 46 };
    let c = c0; if (R >= 8.3) c = mixCam(c0, c1, EZ.io(seg(R, 8.3, 8.9))); if (R >= 11.3) c = mixCam(c1, c2, EZ.io(seg(R, 11.3, 11.9)));
    setCam(c); HUD.pill = 'AUTO NORMAL';
  },
  agarre(R, D) {
    const g = g3(); lightOn(0, 12, 0); xray(1, {});
    const up = R >= 16.0, s = up ? LOOP_LEN + 6 : 4.2, P = trackPose(s); heroOn(s);
    const c = up ? { pos: [-2, 16.5, 10], tgt: [-6, 23.2, 0], fov: 50 } : { pos: [-3.5, 2.6, 9], tgt: [3.6, 1.3, 0], fov: 44 };
    setCam(camKeys(R, up ? [[16, c.pos, c.tgt, c.fov], [18.5, [-2.5, 16.8, 9], c.tgt, c.fov]] : [[12.5, c.pos, c.tgt, c.fov], [16, [-3, 2.8, 8.2], c.tgt, c.fov]]), 0.4);
    // the weight: a yellow arrow from the car's centre straight down (world)
    const cen = hpt(0, 0.7, 0), aw = K(R, up ? 16.9 : 14.4, 0.3);
    arrowAt(0, cen, V3(0, -1, 0), 2.4, aw);
    // the grip: green glows under the tyres; upside down they fade
    const grip = up ? 0.85 * (1 - K(R, 17.7, 0.5)) : K(R, 13.3, 0.3);
    g.hero.userData.wheels.forEach((w, i) => { const m = g.glows[i]; w.updateMatrixWorld(); const wp = new THREE.Vector3().setFromMatrixPosition(w.matrixWorld).addScaledVector(P.n, -0.36); m.visible = true; m.position.copy(wp).addScaledVector(P.n, 0.03); m.quaternion.setFromUnitVectors(V3(0, 0, 1), P.n); m.material.opacity = 0.9 * grip; });
    D.push(() => {
      tag(cen.clone().add(V3(0, -1.6, 0)), 120, up ? 120 : -60, 'peso', up ? 'te jala lejos' : 'empuja la llanta', aw);
      const w0 = g.hero.userData.wheels[0].getWorldPosition(new THREE.Vector3()).addScaledVector(P.n, -0.36);
      tag(w0, 80, up ? -200 : 140, up ? 'sin agarre' : 'agarre', null, up ? K(R, 17.8, 0.3) : K(R, 13.5, 0.3), up ? '#ff6a5a' : '#5aff8c', 40);
    });
    HUD.pill = up ? 'BOCA ABAJO' : 'AGARRE';
  },
  electrico(R, D) {
    const g = g3(); lightOn(-60, 4, 0); const s = -60; heroOn(s);
    const reveal = R >= 19.6;
    if (reveal) {
      const body = 1 - K(R, 24.7, 0.6);
      xray(body, { frame: body > 0 ? 1 : 0, engine: 1 - K(R, 20.5, 0.15), motors: popS(esT(21.2)) * (R >= 21.2 ? 1 : 0) * body, battery: EZ.o3(seg(R, 22.5, 23.3)) * (R >= 22.5 ? 1 : 0) * (body > 0 ? 1 : 0) });
      if (R >= 20.45 && R < 21.6) for (let k = 0; k < 16; k++) { const Rn = RNG('poof', k), a = seg(R, 20.45, 21.6); puff(hpt(1.25 + Rn.n(0.6), 0.9 + a * Rn.r(0.5, 2.2), Rn.n(0.6)), 0.6 + a * 2.2, (1 - a) * 0.8, '#d8d2cc'); }
    }
    const c0 = { pos: [-34, 14, 30], tgt: [-60, 1, 0], fov: 46 }, c1 = { pos: [-55, 8.6, 7.2], tgt: [-60, 0.45, 0], fov: 40 }, c2 = { pos: [-64.5, 8.2, 7.6], tgt: [-60, 0.45, 0], fov: 40 };
    let c = mixCam({ pos: [-2, 16.8, 9], tgt: [-6, 23.2, 0], fov: 50 }, c0, EZ.io(seg(R, 18.5, 19.2)));
    if (R >= 19.2) c = mixCam(c0, c1, EZ.io(seg(R, 19.2, 20.0))); if (R >= 20.0) c = mixCam(c1, c2, EZ.io(seg(R, 20.0, 25.4)));
    setCam(c, 0.3); HUD.speed = 0;
    D.push(() => {
      tag(hpt(1.25, 1.0, 0), 120, -160, 'motor de gasolina', null, KO(R, 19.9, 20.6, 0.2), '#ff6a5a', 40);
      tag(hpt(-1.36, 0.37, 0.4), -330, -170, 'motores eléctricos', null, KO(R, 21.3, 24.0, 0.25), S3.cyan, 40);
      tag(hpt(-0.2, 0.47, 0.75), 120, 190, 'Batería', 'debajo del piso', KO(R, 24.1, 25.4, 0.25), '#7ec8ff', 52);
    });
    HUD.pill = 'ELÉCTRICO';
  },
  rampa(R, D) {
    const g = g3(); lightOn(-10, 10, 0); let s, v;
    if (R < 27.2) { s = -61 + 34 * (R - 25.4); v = 34; }
    else if (R < 29.18) { const u = R - 27.2; s = 34 * u - 7.58 * u * u; v = 34 - 15.2 * u; }
    else { const u = Math.min(R - 29.18, 2.9); s = LOOP_LEN + 4 * u - 0.6 * u * u; v = 4 - 1.2 * u; }
    if (R < 27.2) s = Math.min(s, -0.01);
    heroOn(s); const p = trackPose(s).p; HUD.speed = kmh(v); speedSign(HUD.speed);
    if (R < 27.3) for (let k = 0; k < 18; k++) { const Rn = RNG('lines', k); puff(p.clone().add(V3(-3 - Rn.r(0, 8), Rn.r(0.3, 1.6), Rn.n(1.6))), 0.25, 0.25, '#ffe7d0'); }
    const c0 = follow(p, [-7.5, 1.3, 4.8], 46, [3, 0.7, 0]), c1 = { pos: [-7, 4, 30], tgt: [5, 11, 0], fov: 52 }, c2 = { pos: [-3, 16.5, 10], tgt: [-5.5, 23.2, 0], fov: 48 };
    let c = c0; if (R >= 26.9) c = mixCam(c0, c1, EZ.io(seg(R, 26.9, 27.4))); if (R >= 29.0) c = mixCam(c1, c2, EZ.io(seg(R, 29.0, 30.0)));
    setCam(c); HUD.pill = R < 27.9 ? 'VELOCIDAD DE AUTOPISTA' : R < 30.4 ? 'SUBIENDO' : 'ARRIBA';
  },
  succion(R, D) {
    const g = g3(); lightOn(-6, 20, 0); const x0 = 6.6 + 0.2 * seg(R, 31.9, 44.2); heroOn(LOOP_LEN + x0);
    const xr = K(R, 32.2, 0.5), fans = popS(esT(32.7)) * (R >= 32.7 ? 1 : 0); xray(xr, { fans, skirts: R >= 35.8 ? 1 : 0 });
    g.hero.userData.P.fans.forEach((f, i) => (f.userData.rot.rotation.y = R * 38 * (i ? -1 : 1)));
    setCam(camKeys(R, [[31.9, [-3, 16.5, 10], [-5.5, 23.2, 0], 48], [33.0, [-1.5, 15.4, 14.5], [-6.6, 22.6, 0], 46], [44.2, [-2.5, 15.8, 13.5], [-6.8, 22.6, 0], 46]]), 0.35);
    // the air pulled out from under the car
    if (R >= 33.9 && R < 37.6) for (let k = 0; k < 22; k++) { const Rn = RNG('suck', k), ph = (R * 0.9 + Rn.f()) % 1, side = Rn.f() < 0.5 ? -1 : 1; puff(hpt(Rn.r(-1.6, 1.6), 0.15 + ph * 0.4, side * (0.5 + ph * 2.8)), 0.25 + ph * 0.6, 0.45 * (1 - ph) * K(R, 33.9, 0.3), '#cfeaff'); }
    // the air outside pushes the car into the ramp: blue arrows rising toward its belly
    const aa = KO(R, 38.2, 42.6, 0.3); for (let i = 0; i < 16; i++) { const Rn = RNG('air', i), ph = (R * 0.8 + Rn.f()) % 1; if (i < 12) arrowAt(4 + i, hpt(Rn.r(-1.8, 1.8), 2.0 + (1 - ph) * 1.8, Rn.r(-0.9, 0.9)), V3(0, 1, 0), 0.9, aa * Math.min(1, ph * 4) * 0.9); }
    D.push(() => {
      const f0 = g.hero.userData.P.fans[0].getWorldPosition(new THREE.Vector3());
      tag(f0, 140, 170, 'Ventiladores', 'sacan el aire de abajo', KO(R, 32.9, 37.6, 0.3), S3.cyan, 46);
      tag(hpt(0, 0.22, 0.86), -400, 290, 'Faldones de goma', 'sellan los bordes', KO(R, 35.9, 37.7, 0.3), S3.white, 42);
      const a = KO(R, 38.3, 42.2, 0.3); if (a > 0) s3Label(CX, 470, 'el aire de afuera empuja', 'como una ventosa gigante', { color: '#7ec8ff', alpha: a, size: 52, align: 'center' });
      const b = K(R, 42.4, 0.35); if (b > 0) { s3Label(CX, 470, 'Sistema de succión', 'hasta 2 G hacia la rampa · según Tesla', { color: S3.cyan, alpha: b, size: 62, align: 'center' }); }
    });
    if (R >= 42.3) g.hero.userData.P.edges.material.opacity = 0.75 + 0.25 * Math.sin(R * 9);
    HUD.pill = 'SUCCIÓN'; HUD.speed = R < 40 ? 2 : 0;
  },
  atorado(R, D) {
    const g = g3(); lightOn(-8, 20, 0);
    const creep = 6.8 + 3.0 * EZ.o2(seg(R, 44.2, 47.3)), slip = R >= 48.4 ? (R - 48.4) * 26 : 0;
    const h = heroOn(LOOP_LEN + creep); spinWheels(h, LOOP_LEN + creep + slip);
    xray(1 - K(R, 44.2, 0.5), { fans: 1 - K(R, 44.2, 0.5) }); g.hero.userData.P.fans.forEach((f, i) => (f.userData.rot.rotation.y = R * 38 * (i ? -1 : 1)));
    const c0 = { pos: [-2.5, 15.8, 13.5], tgt: [-6.8, 22.6, 0], fov: 46 }, c1 = { pos: [-3.5, 16.5, 16], tgt: [-9.2, 22.8, 0], fov: 46 }, c2 = { pos: [-4.6, 19.6, 9.5], tgt: [-8.4, 23.1, 0], fov: 44 };
    let c = mixCam(c0, c1, EZ.io(seg(R, 44.2, 45.5))); if (R >= 48.2) c = mixCam(c1, c2, EZ.io(seg(R, 48.2, 48.9)));
    setCam(c, 0.35);
    if (R >= 48.6) { const P = trackPose(LOOP_LEN + creep); arrowAt(1, hpt(-1.36, 0.37, 0.9).addScaledVector(P.n, 0.1), V3(-1, 0, 0), 1.3 + 0.2 * Math.sin(R * 30), K(R, 48.6, 0.2) * 0.9);
      for (let k = 0; k < 10; k++) { const Rn = RNG('smoke', k), ph = (R * 1.4 + Rn.f()) % 1; puff(hpt(-1.36 + ph * 1.5, 0.1 - ph * 0.6, Rn.r(-1, 1)), 0.4 + ph * 1.4, 0.4 * (1 - ph), '#bdb8b2'); } }
    D.push(() => { tag(hpt(-1.36, 0.0, 0.9), 140, -150, 'las llantas no bastan', null, K(R, 48.7, 0.3), S3.yellow, 40); if (R >= 46.8) s3Text('atorado arriba', CX, 470, { size: 52, align: 'center', alpha: KO(R, 46.9, 48.5, 0.3) }); });
    HUD.pill = 'ATORADO'; HUD.speed = R < 47.3 ? 6 * (1 - seg(R, 44.2, 47.3)) : 0;
  },
  gasfrio(R, D) {
    const g = g3(); lightOn(-10, 20, 0); heroOn(LOOP_LEN + 9.8);
    const xr = KO(R, 51.0, 57.5, 0.4); xray(xr, { tank: EZ.back(seg(R, 51.6, 52.0)) * (R >= 51.6 ? 1 : 0) });
    setCam(camKeys(R, [[50.7, [-4.6, 19.6, 9.5], [-8.4, 23.1, 0], 44], [52.0, [-3.0, 19.0, 10.5], [-9.0, 23.1, 0], 44], [55.0, [-2.0, 19.4, 8.8], [-8.6, 23.1, 0], 44], [59.5, [-2.6, 19.0, -9.5], [-9.4, 23.1, 0], 44]]), 0.3);
    // the blast: white plumes streaming out of the three nozzles (rear = world +x)
    const blast = R >= 53.9 ? Math.min(1, (R - 53.9) / 0.15) : 0;
    if (blast > 0) for (const z of [-0.5, 0, 0.5]) for (let k = 0; k < 14; k++) { const ph = ((R * 2.2 + k / 14) % 1); puff(hpt(-2.45 - ph * 5.5, 0.58 - ph * 0.3, z * (1 + ph)), 0.3 + ph * 2.0, blast * 0.55 * (1 - ph), '#f4f8ff'); }
    // the balloon: let go, it whizzes off
    if (R >= 54.8 && R < 56.6) { const t = R - 54.8, b = g.balloon; b.visible = true; b.position.copy(hpt(-2.8 - t * 6, 1.4 - t * 1.0 + Math.sin(t * 18) * 0.4, -1.4 - t * 2.2 + Math.cos(t * 13) * 0.5)); b.rotation.set(t * 9, t * 5, t * 7); b.scale.setScalar(1 - 0.5 * seg(t, 0, 1.8)); puff(b.position.clone().add(V3(0.4, 0.3, 0)), 0.3, 0.5, '#ffd6d6'); }
    D.push(() => {
      tag(hpt(-0.75, 0.68, 0), 150, 210, 'Tanque', 'aire comprimido', KO(R, 51.8, 55.5, 0.3), S3.cyan, 48);
      tag(hpt(-2.32, 0.58, 0.5), -330, -170, 'Boquillas', 'atrás', KO(R, 53.9, 56.25, 0.3), S3.white, 44);
      const a = KO(R, 56.3, 57.6, 0.25); if (a > 0) s3Text('sin fuego · solo aire', CX, 470, { size: 48, align: 'center', alpha: a });
      const b = K(R, 57.7, 0.35); if (b > 0) s3Label(CX, 470, 'Propulsores de gas frío', null, { color: S3.cyan, alpha: b, size: 60, align: 'center' });
    });
    HUD.pill = 'GAS FRÍO'; HUD.speed = 0;
  },
  lanza(R, D) {
    const g = g3(); lightOn(-50, 16, 0);
    const pos = (r) => { const u = r - 59.6; if (u < 0) return { x: -9.8, y: 2 * LR, v: 0 }; if (u < 1.41) return { x: -9.8 - 12 * u * u, y: 2 * LR, v: 24 * u }; const w = u - 1.41; return { x: -9.8 - 12 * 1.41 * 1.41 - 34 * w + 3.7 * w * w, y: 2 * LR - 1.2 * w * w * 0.5 - 0.6 * w, v: 34 - 7.4 * w }; };
    const q = pos(R), onDeck = R < 61.01;
    if (onDeck) heroOn(LOOP_LEN - q.x); else heroFree(V3(q.x, q.y - 0.0, 0), V3(-1, 0, 0), rollUp(Math.PI + 0.12 * Math.sin((R - 61) * 2)));
    spinWheels(g.hero, -q.x * 3);
    const fire = R >= 59.6 ? Math.min(1, (R - 59.6) / 0.08) * (1 - seg(R, 62.6, 63.4) * 0.7) : 0;
    for (let k = 0; k < 40 && fire > 0; k++) { const age = k * 0.045, p = pos(Math.max(59.6, R - age)); puff(V3(p.x + 2.6 + age * 4, p.y - 0.62 + age * 0.4, (k % 3 - 1) * 0.45), 0.5 + age * 4.5, fire * 0.7 * (1 - age / 1.8)); }
    HUD.speed = kmh(q.v);
    const p = V3(q.x, q.y, 0);
    setCam(mixCam(follow(p, [5, -4.5, 12], 46, [-2, 0, 0]), follow(p, [18, -5, 26], 48, [-6, -1, 0]), EZ.io(seg(R, 60.4, 62.4))), 0.3);
    D.push(() => {
      const a = K(R, 60.0, 0.25); if (a > 0) { s3Label(CX, 450, '0 → 97 km/h', 'en 0,81 s · cifra de Tesla', { color: S3.cyan, alpha: a * (1 - seg(R, 63.4, 63.9)), size: 74, align: 'center' }); }
    });
    HUD.pill = 'DESPEGA';
  },
  actitud(R, D) {
    const g = g3(); lightOn(-110, 14, 0);
    const t = R - 64, x = -9.8 - 12 * 1.41 * 1.41 - 34 * 2.99 + 3.7 * 2.99 * 2.99 - lerp(12, 4, seg(R, 64, 73.3)) * t * 0.6, y = 2 * LR - 3.6 - 0.75 * t;
    // tumbling, then the small thrusters bring it level
    const tumble = 1 - EZ.io(seg(R, 66.6, 71.5)), roll = Math.PI + 2.4 * EZ.o2(seg(R, 64.0, 66.6)) + (Math.PI - 2.4) * EZ.io(seg(R, 66.6, 71.5)) + 0.5 * Math.sin(t * 3.1) * tumble;
    const pitch = 0.75 * Math.sin(t * 2.3) * tumble, yaw = 0.4 * Math.sin(t * 1.7) * tumble;
    const fw = V3(-Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.sin(yaw)).normalize(), up0 = rollUp(roll), up = up0.clone().sub(fw.clone().multiplyScalar(up0.dot(fw))).normalize();
    heroFree(V3(x, y, 0), fw, up);
    // puffs at the perimeter thrusters, alternating, while it corrects
    const P = g.hero.userData.P;
    if (R >= 66.5) for (let k = 0; k < 8; k++) { const ph = ((R - 66.5) * 2.6 + k * 0.37) % 1, on = ph < 0.35 && (R < 71.5 || k % 3 === 0), [px, py, pz] = P.miniPts[k]; if (on) puff(hpt(px, py, pz + Math.sign(pz) * (0.2 + ph * 1.6)), 0.3 + ph * 1.8, 0.85 * (1 - ph / 0.35), '#f4f8ff'); }
    const c = { pos: [x + 11 * Math.cos(t * 0.25 + 0.6), y + 2.2, 12 * Math.sin(t * 0.25 + 0.6) + 3], tgt: [x, y - 0.6, 0], fov: 44 };
    setCam(c, 0.3);
    D.push(() => {
      tag(hpt(...P.miniPts[0]), 140, -180, 'propulsores diminutos', 'en las orillas', KO(R, 67.2, 71.2, 0.3), S3.cyan, 42);
      const b = K(R, 71.8, 0.35); if (b > 0) s3Label(CX, 470, 'Control de actitud', 'el mismo truco que usa SpaceX para voltear sus cohetes', { color: S3.cyan, alpha: b, size: 60, align: 'center' });
    });
    HUD.pill = R < 66.5 ? 'DANDO VUELTAS' : 'NIVELANDO'; HUD.speed = 40;
  },
  aterriza(R, D) {
    const g = g3(); lightOn(-125, 4, 0);
    const t0 = 73.3, x0 = -9.8 - 12 * 1.41 * 1.41 - 34 * 2.99 + 3.7 * 2.99 * 2.99 - lerp(12, 4, 1) * 9.3 * 0.6, y0 = 2 * LR - 3.6 - 0.75 * 9.3;
    const d = EZ.io(seg(R, t0, 75.0)), x = x0 - 6 * d - (R > 75 ? 8 * (R - 75) * seg(R, 75, 76.5) : 0), y = lerp(y0, 0, d);
    heroFree(V3(x, y, 0), V3(-1, 0, 0), rollUp(0)); spinWheels(g.hero, -x);
    if (R < 75.2) for (let k = 0; k < 4; k++) { const ph = ((R * 3 + k / 4) % 1); for (const [px, pz] of [[1.6, 0.8], [1.6, -0.8], [-1.6, 0.8], [-1.6, -0.8]]) puff(hpt(px, 0.2 - ph * 1.6, pz), 0.3 + ph * 1.6, 0.6 * (1 - ph), '#f4f8ff'); }
    if (R >= 74.9 && R < 76) for (let k = 0; k < 12; k++) { const Rn = RNG('land', k), a = seg(R, 74.9, 76); puff(V3(x + Rn.n(3), 0.3 + a * 1.2, Rn.n(3)), 0.8 + a * 3, (1 - a) * 0.5, '#c9a68a'); }
    const c0 = { pos: [x + 9, y + 2.5, 11], tgt: [x, y, 0], fov: 44 }, c1 = { pos: [x - 7, 1.4, 5.5], tgt: [x + 0.5, 0.8, 0], fov: 40 }, c2 = { pos: [-200, 46, 110], tgt: [-60, 8, -6], fov: 40 };
    let c = c0; if (R >= 75.6) c = mixCam(c0, c1, EZ.io(seg(R, 75.6, 76.2))); if (R >= 76.6) c = mixCam(c1, c2, EZ.io(seg(R, 76.6, 78.6)));
    setCam(c, 0.3);
    D.push(() => { const e = K(R, 77.9, 0.4); if (e > 0) s3Text('DOPAMENTES', CX, H / 2, { size: 44, align: 'center', alpha: e * 0.95, spacing: 6 }); });
    HUD.pill = R < 75.0 ? 'ATERRIZANDO' : 'ROADSTER'; HUD.speed = R < 75 ? 20 * (1 - d) : 8 * seg(R, 75, 76.5) * 3.6 / 3.6;
  },
};
