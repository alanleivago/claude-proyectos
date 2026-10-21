// =====================================================================
//  SHOTS — every shot of reference 8 in reference time R (RNOW = refT(TT)), then the HUD and the captions.
// =====================================================================
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
let HUD = { pill: '', speed: null, timer: null };
const kmh = (v) => v * 3.6;
const ACC = 27.78 / 0.81;   // the Roadster's launch: 0 → 100 km/h in 0.81 s (Tesla's timer)

function sceneMain() {
  const R = (RNOW = refT(TT));
  resetWorld(); resetExtra(); HUD = { pill: '', speed: null, timer: null };
  cheer(0.25);
  const D = [];
  const shot = SHOTS_R.find(([, a, b]) => R >= a && R < b) || SHOTS_R[SHOTS_R.length - 1];
  SHOT_FN[shot[0]](R, D);
  renderWorld();
  D.forEach((f) => f());
  const hud = () => {
    s3Note('RECREADO · ILUSTRATIVO', 0.9, { y: 214 });
    if (HUD.pill) s3Pill(HUD.pill, 1, { y: 290 });
    if (HUD.timer) { const [v, l] = HUD.timer; timerBox(v, l); }
    if (HUD.speed != null) s3Readout(String(Math.max(0, Math.round(HUD.speed))), 'km/h', 'VELOCIDAD', 1, { y: 1300 });
    s3Caption(TT);
  };
  if (DEFER) DEFER.push(hud); else hud();
}
// ---- 2D helpers
function tag(v, dx, dy, title, sub, a, c = S3.yellow, size = 44, align = 'left') {
  if (a <= 0) return; const [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); } const lx = clamp(x + dx, 60, 1020), ly = y + dy;
  s3Leader(lx + (align === 'right' ? 8 : -8), ly + 10, x, y, c, a * 0.85, 1, 2.5); s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}
function timerBox(value, label) {
  ctx.save(); screen(); ctx.font = s3Font(96); const w = Math.max(320, ctx.measureText(value).width + 140), h = 190, x = CX - w / 2, y = 380;
  ctx.globalAlpha = 0.85; ctx.fillStyle = '#16130f'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  s3Text('0–100 KM/H', CX, y + 42, { size: 24, color: S3.note, align: 'center', spacing: 3 });
  s3Text(value, CX, y + 140, { size: 96, color: S3.cyan, align: 'center' });
  if (label) s3Text(label, CX, y + 178, { size: 22, color: S3.note, align: 'center', spacing: 2 });
}
// a labelled bar: frac 0..1 of width w, value text on the right
function bar(x, y, w, label, frac, c, val, a = 1) {
  if (a <= 0) return;
  ctx.save(); screen(); ctx.globalAlpha = a * 0.85; ctx.fillStyle = '#16130f'; ctx.beginPath(); ctx.roundRect(x - 20, y - 46, w + 40, 84, 10); ctx.fill();
  ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x, y + 12, w, 12); ctx.fillStyle = c; ctx.fillRect(x, y + 12, w * clamp(frac), 12); ctx.restore();
  s3Text(label, x, y, { size: 28, alpha: a, spacing: 2 }); s3Text(val, x + w, y, { size: 28, color: c, align: 'right', alpha: a });
}
// ---- 3D helpers
function heroAt(x, h = 0) { const g = g3(); poseCar(g.hero, { p: V3(x, h, 0), t: V3(1, 0, 0), n: V3(0, 1, 0) }); spinWheels(g.hero, x); return g.hero; }
function corollaAt(x, z = 0) { const g = g3(); g.corolla.visible = true; poseCar(g.corolla, { p: V3(x, 0, z), t: V3(1, 0, 0), n: V3(0, 1, 0) }); spinWheels(g.corolla, x); return g.corolla; }
// the air jet out of the 3 rear nozzles (strength u, length L)
function plume(u, L = 6, c = '#eaf8ff') {
  if (u <= 0) return; for (const z of [-0.5, 0, 0.5]) for (let k = 0; k < 13; k++) { const ph = (RNOW * 2.4 + k / 13) % 1; puff(hpt(-2.45 - ph * L, 0.58 - ph * 0.15, z * (1 + ph * 0.8)), 0.25 + ph * 1.9, u * 0.6 * (1 - ph), c); }
}
const st = (dx, dy, dz) => [SC.x + dx, SC.y + dy, SC.z + dz];   // a stage point as an array
const stCam = (R, keys, sway = 0.25) => setCam(camKeys(R, keys.map(([r, p, t, f]) => [r, st(...p), st(...t), f])), sway);

const SHOT_FN = {
  arranque(R, D) {
    const t = Math.max(0, R - 0.2), v = Math.min(27.78, ACC * t), x = -160 + (t < 0.81 ? 0.5 * ACC * t * t : 0.5 * ACC * 0.81 * 0.81 + 27.78 * (t - 0.81));
    lightOn(x, 2, 0); heroAt(x); plume(Math.min(1, t * 5), 7); HUD.speed = kmh(v); HUD.pill = '0–100 KM/H';
    setCam({ pos: [x + 3.5, 1.5, 9.5], tgt: [x - 0.5, 0.8, 0], fov: 44 }, 0.3);
  },
  piedra(R, D) {
    const g = g3(), x = x3d(), t = R - 3.0, y0 = 27; lightOn(16, 10, 6); g.hero.visible = false;
    const y = Math.max(0.9, y0 - 0.5 * 9.81 * t * t); x.rock.visible = true; x.rock.position.set(15.5, y, 6.5); x.rock.rotation.set(t * 2, t * 3, 0);
    setCam({ pos: [2, 3 + t * 0.5, 30], tgt: [15, 18 - t * 4, 4], fov: 46 }, 0.2);
    for (let k = 0; k < 6; k++) puff(V3(15.5, y + 1 + k * 0.9, 6.5), 0.3, 0.35 * (1 - k / 6), '#b98cff');
    D.push(() => { const tt = 2.83 * seg(R, 3.0, 5.1); bar(110, 420, 860, 'ROADSTER', Math.min(1, tt / 0.81) * 0.29, S3.cyan, '0,81 s', 1); bar(110, 530, 860, 'PIEDRA QUE CAE', tt / 2.83, '#b98cff', tt.toFixed(2).replace('.', ',') + ' s', 1);
      s3Text('caída libre: 1 g · 2,83 s hasta 100 km/h', CX, 640, { size: 24, color: S3.note, align: 'center' }); tag(x.rock.position, 140, 120, 'piedra', null, 1, '#b98cff', 36); });
    HUD.pill = 'MÁS RÁPIDO QUE UNA PIEDRA';
  },
  solas(R, D) {
    lightOn(-60, 2, 0); heroAt(-60); setCam({ pos: [-56, 1.7, 9.5], tgt: [-60.4, 0.8, 0], fov: 44 }, 0.3);
    arrowAt(0, hpt(1.38, 0.05, 1.0), V3(1, 0, 0), 1.6 + 0.1 * Math.sin(R * 6), K(R, 5.3, 0.3));
    D.push(() => { tag(hpt(1.38, 0.05, 1.0), 40, 120, 'llantas', 'como máximo ≈ 1 g', K(R, 5.4, 0.3), S3.yellow, 40);
      const a = K(R, 6.2, 0.35); if (a > 0) { const [x, y] = P2(hpt(0, 1.6, 0)); ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#ff5a4a'; ctx.lineWidth = 5; ctx.setLineDash([18, 12]); ctx.beginPath(); ctx.moveTo(x - 330, y - 60); ctx.lineTo(x + 330, y - 60); ctx.stroke(); ctx.restore();
        s3Text('necesario ≈ 3,5 g', x, y - 90, { size: 40, color: '#ff5a4a', align: 'center', alpha: a }); } });
    HUD.pill = 'SOLO LLANTAS';
  },
  quien(R, D) {
    const t = R - 7.6, x = -120 + 6 * t; lightOn(x, 2, 0); heroAt(x); plume(1, 8);
    setCam({ pos: [x - 9, 0.9, 3.2 - t * 0.4], tgt: [x + 2, 0.9, 0], fov: 46 }, 0.3);
    D.push(() => tag(hpt(-3.5, 0.6, 0), 120, -220, '¿?', 'no son las llantas', K(R, 8.0, 0.3), S3.white, 56));
    HUD.pill = '¿QUÉ LO EMPUJA?';
  },
  rueda(R, D) {
    lightOn(-60, 2, 0); heroAt(-60); const w = hpt(1.38, 0.37, 0.95);
    setCam({ pos: [w.x + 0.2, 0.55, w.z + 2.6], tgt: [w.x - 0.1, 0.35, w.z], fov: 44 }, 0.15);
    arrowAt(1, hpt(1.0, 0.02, 1.2), V3(1, 0, 0), 2.2, K(R, 9.8, 0.3));
    D.push(() => tag(hpt(2.0, 0.02, 1.2), 30, 150, 'el camino', null, K(R, 9.9, 0.3), S3.yellow, 46));
    HUD.pill = 'NO SOLO EL CAMINO';
  },
  tanques0(R, D) {
    const x = x3d(); stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero); xray(0.9 * K(R, 11.3, 0.4), { frame: 1 }); x.tanks.visible = R > 11.4; plume(K(R, 11.0, 0.2), 6, '#bff4f8');
    stCam(R, [[11.0, [-6, 2.6, 7.5], [-0.5, 0.6, 0], 44], [13.1, [-5.2, 3.0, 6.5], [-0.6, 0.6, 0], 44]]);
    D.push(() => tag(hpt(-0.55, 0.9, 0), 120, -220, 'Tanques de aire', 'aire comprimido', K(R, 11.6, 0.3), S3.cyan, 46));
    HUD.pill = 'EL AIRE DE SUS TANQUES';
  },
  semaforo(R, D) {
    const x = x3d(), g = g3(); g.hero.visible = false; lightOn(XING, 3, 0);
    const go = 16.2, t = Math.max(0, R - go), cx = XING - 14 + 0.5 * 3.2 * t * t; corollaAt(cx);
    x.lamps[R < go ? 0 : 2].color.set(R < go ? '#ff3a2a' : '#3aff7a');
    setCam({ pos: [XING - 26, 4.4, -5.5], tgt: [XING - 8, 1.0, 1.5], fov: 46 }, 0.3);
    D.push(() => tag(cpt(0, 1.5, 0), 0, -110, 'TÚ', null, K(R, 13.6, 0.3), S3.white, 38));
    HUD.pill = R < go ? 'PRIMERO EN EL ROJO' : 'VERDE · A FONDO'; if (R >= go) HUD.speed = kmh(3.2 * t);
  },
  agarre(R, D) {
    const g = g3(); g.hero.visible = false; lightOn(XING, 2, 0); const t = R - 18.3, cx = XING - 8 + 1.5 * t; corollaAt(cx);
    const w = cpt(1.42, 0.36, 0.84); setCam({ pos: [w.x + 0.4, 0.5, w.z + 2.5], tgt: [w.x, 0.32, w.z], fov: 44 }, 0.15);
    const back = KO(R, 18.5, 19.8, 0.3), fwd = K(R, 19.7, 0.3);
    arrowAt(0, cpt(1.6, 0.02, 1.15), V3(-1, 0, 0), 1.4, back); arrowAt(1, cpt(0.8, 0.02, 1.25), V3(1, 0, 0), 2.6, fwd);
    for (let k = 0; k < 6; k++) { const Rn = RNG('grit', k), ph = (R * 1.6 + Rn.f()) % 1; puff(cpt(1.42 - ph * 1.5, 0.05 + ph * 0.2, 0.84 + Rn.n(0.2)), 0.12, 0.4 * (1 - ph) * back, '#8a7a6a'); }
    D.push(() => { tag(cpt(1.0, 0.02, 1.15), -40, 130, 'la llanta empuja el camino hacia atrás', null, back, S3.yellow, 34); tag(cpt(2.2, 0.02, 1.25), 0, 150, 'el camino te empuja hacia adelante', null, fwd, S3.yellow, 34); });
    HUD.pill = 'AGARRE'; HUD.speed = kmh(1.5 + t);
  },
  gravedad(R, D) {
    const g = g3(); stageMode(true); g.hero.visible = false; lightOn(SC.x, 4, SC.z); g.corolla.visible = true; onStage(g.corolla);
    stCam(R, [[21.2, [0, 3.0, 11], [0, 0.9, 0], 44], [24.6, [0.6, 3.2, 10.2], [0, 0.9, 0], 44]]);
    arrowAt(0, cpt(-0.6, 0.05, 1.1), V3(1, 0, 0), 2.4, K(R, 21.5, 0.3)); arrowAt(20, cpt(0, 4.6, 0), V3(0, -1, 0), 2.6, K(R, 23.0, 0.3));
    D.push(() => { tag(cpt(0.6, 0.05, 1.1), 40, 140, 'empuje máximo de las llantas', null, K(R, 21.6, 0.3), S3.yellow, 34); tag(cpt(0, 3.6, 0), 120, -60, 'jalón de la gravedad', null, K(R, 23.1, 0.3), S3.cyan, 34);
      const a = K(R, 23.6, 0.3); if (a > 0) s3Text('= más o menos igual', CX, 520, { size: 44, align: 'center', alpha: a }); });
    HUD.pill = 'AGARRE ≈ GRAVEDAD';
  },
  patina(R, D) {
    const g = g3(); g.hero.visible = false; lightOn(XING - 20, 2, 0); const c = corollaAt(XING - 20); spinWheels(c, R * 60);
    const w = cpt(-1.4, 0.36, 0.84); setCam({ pos: [w.x + 1.6, 0.8, w.z + 3.2], tgt: [w.x, 0.4, w.z], fov: 46 }, 0.2);
    const sm = K(R, 25.4, 0.4); for (let k = 0; k < 26; k++) { const Rn = RNG('spin', k), ph = (R * 1.2 + Rn.f()) % 1; puff(cpt(-1.4 - ph * 3.5, 0.2 + ph * 1.6, 0.84 + Rn.n(0.8) + ph), 0.5 + ph * 2.4, 0.55 * (1 - ph) * sm, '#cfc6be'); }
    D.push(() => bar(110, 1150, 860, 'AGARRE', 1, R < 26.2 ? S3.yellow : '#ff5a4a', R < 26.2 ? 'AL MÁXIMO' : 'PERDIDO', 1));
    HUD.pill = 'EMPUJA MÁS = PATINA';
  },
  carrera(R, D) {
    const g = g3(), x = x3d(); stageMode(true); lightOn(SC.x, 4, SC.z); g.hero.visible = false; const t = R - 27.8, v = Math.min(27.78, 9.81 * t * 0.6);
    g.corolla.visible = true; poseCar(g.corolla, { p: SC.clone().add(V3(-4 + Math.min(8.4, 0.476 * t * t), 0, 2)), t: V3(1, 0, 0), n: V3(0, 1, 0) }); g.corolla.scale.setScalar(0.6);
    x.rock.visible = true; x.rock.position.copy(SC).add(V3(4, Math.max(0.6, 9 - 0.476 * t * t), -2)); x.rock.scale.setScalar(0.7);
    stCam(R, [[27.8, [0, 4.5, 15], [0, 2.5, 0], 46], [32, [0.5, 4.5, 14], [0, 2.5, 0], 46]]);
    D.push(() => { const s = Math.round(kmh(v)); bar(110, 1060, 860, 'TU AUTO · AGARRE MÁXIMO', v / 27.78, S3.yellow, s + ' km/h', 1); bar(110, 1170, 860, 'PIEDRA QUE CAE', v / 27.78, '#b98cff', s + ' km/h', 1); });
    HUD.pill = 'AL MISMO RITMO · ≈ 1 G';
  },
  plaid(R, D) {
    const g = g3(), x = x3d(); g.hero.visible = false; lightOn(-60, 2, 0); x.plaid.visible = true; poseCar(x.plaid, { p: V3(-60, 0, 0), t: V3(1, 0, 0), n: V3(0, 1, 0) });
    setCam({ pos: [-55, 1.8, 10], tgt: [-60.5, 0.9, 0], fov: 44 }, 0.3);
    const tt = Math.min(1.99, 2.1 * seg(R, 32.6, 34.6)); HUD.timer = [tt.toFixed(2).replace('.', ',') + ' s', 'MODEL S PLAID · CIFRA DE TESLA'];
    D.push(() => tag(V3(-60, 1.5, 0), 0, -170, 'Model S Plaid', null, K(R, 32.3, 0.3), S3.white, 38));
    HUD.pill = 'SOLO LLANTAS';
  },
  motor(R, D) {
    const g = g3(), x = x3d(); stageMode(true); g.hero.visible = false; lightOn(SC.x, 4, SC.z); g.corolla.visible = true; onStage(g.corolla); cxray(0.9); x.motor.visible = true; spinWheels(g.corolla, R * 70);
    stCam(R, [[35.8, [-6.5, 2.4, 7.5], [-0.8, 0.6, 0], 44], [38.8, [-6.0, 2.6, 7.0], [-0.8, 0.6, 0], 44]]);
    for (let k = 0; k < 18; k++) { const Rn = RNG('ms', k), ph = (R * 1.1 + Rn.f()) % 1; puff(cpt(-1.4 - ph * 3, 0.2 + ph * 1.2, 0.84 + Rn.n(0.6)), 0.4 + ph * 2, 0.45 * (1 - ph) * K(R, 36.6, 0.4), '#cfc6be'); }
    D.push(() => { tag(cpt(-1.4, 0.4, 0), -60, -200, 'motor más grande', null, K(R, 36.0, 0.3), '#ff8a3c', 40); bar(110, 1060, 860, 'POTENCIA DEL MOTOR', 0.92, S3.white, 'ALTA', 1); bar(110, 1170, 860, 'AGARRE', 0.6, '#ff5a4a', 'AL MÁXIMO', 1); });
    HUD.pill = 'MÁS POTENCIA = MÁS GIRO';
  },
  revela(R, D) {
    const g = g3(); stageMode(true); lightOn(SC.x, 4, SC.z); const sw = R >= 39.9;
    if (!sw) { g.hero.visible = false; g.corolla.visible = true; onStage(g.corolla); } else onStage(g.hero);
    stCam(R, [[38.8, [-7, 1.6, 6.5], [0, 0.8, 0], 42], [41.1, [-7.6, 1.9, 7.2], [0, 0.8, 0], 42]]);
    if (R >= 39.6 && R < 40.3) for (let k = 0; k < 20; k++) { const Rn = RNG('rv', k), a = seg(R, 39.6, 40.3); puff(SC.clone().add(V3(Rn.n(2.4), 0.6 + a * Rn.r(0.4, 1.8), Rn.n(1))), 0.6 + a * 1.4, (1 - a) * 0.6, '#cfe8ff'); }
    D.push(() => { if (sw) tag(hpt(0, 1.4, 0), 0, -160, 'el Roadster', null, K(R, 40.0, 0.3), S3.white, 40); });
    HUD.pill = sw ? 'EL ROADSTER' : 'TU AUTO';
  },
  camino(R, D) {
    stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero);
    stCam(R, [[41.1, [-3, 5.5, 10], [0, 0.6, 0], 44], [43.9, [-2, 5.8, 9.4], [0, 0.6, 0], 44]]);
    arrowAt(0, hpt(1.0, 0.05, 1.1), V3(1, 0, 0), 2.0, K(R, 41.4, 0.3));
    D.push(() => { tag(hpt(2.0, 0.05, 1.1), 40, 130, 'camino', null, K(R, 41.5, 0.3), S3.yellow, 36);
      const a = K(R, 42.4, 0.3); if (a > 0) { const [x0, y0] = P2(hpt(-2.4, 0.6, 0)), [x1, y1] = P2(hpt(-6, 0.6, 0)); ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = S3.cyan; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); s3Text('+ ?', clamp(x1 - 20, 160, 1000), y1 - 30, { size: 48, color: S3.cyan, alpha: a, align: 'right' }); } });
    HUD.pill = 'NO SOLO EL CAMINO';
  },
  tanques(R, D) {
    const x = x3d(); stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero); xray(0.92, { frame: 1 }); x.tanks.visible = true;
    stCam(R, [[43.9, [-5.2, 2.2, 5.0], [-0.8, 0.6, 0], 40], [47.6, [-4.4, 2.0, 4.6], [-0.9, 0.6, 0], 38]]);
    D.push(() => tag(hpt(-0.55, 0.92, 0.17), 140, -260, 'Tanques de aire', 'aire comprimido · ilustrativo', K(R, 45.6, 0.3), S3.cyan, 46));
    HUD.pill = 'VERSIONES CON PROPULSORES';
  },
  boquillas(R, D) {
    lightOn(-60, 2, 0); heroAt(-60); plume(K(R, 47.9, 0.15), 7);
    setCam({ pos: [-64.5, 1.0, 3.6], tgt: [-62.0, 0.6, 0], fov: 40 }, 0.2);
    D.push(() => tag(hpt(-2.32, 0.58, 0.5), 60, -230, 'Propulsores', 'difusor trasero', K(R, 47.8, 0.3), S3.white, 44));
    HUD.pill = 'PROPULSORES';
  },
  tercera(R, D) {
    const t = R - 50.2, x = -90 + 1.2 * t * t; lightOn(x, 2, 0); heroAt(x); plume(1, 9);
    setCam({ pos: [x - 1, 4.5, 22], tgt: [x - 1, 0.8, 0], fov: 44 }, 0.25);
    arrowAt(20, hpt(-4, 2.6, 0), V3(-1, 0, 0), 3.2, K(R, 50.5, 0.3)); arrowAt(21, hpt(1.5, 2.6, 0), V3(1, 0, 0), 3.2, K(R, 51.6, 0.3));
    D.push(() => { tag(hpt(-5, 3.0, 0), -40, -90, 'aire → atrás', null, K(R, 50.6, 0.3), S3.cyan, 34); tag(hpt(3, 3.0, 0), 40, -90, 'auto → adelante', null, K(R, 51.7, 0.3), S3.cyan, 34); });
    HUD.pill = 'LANZA AIRE HACIA ATRÁS';
  },
  globo(R, D) {
    const g = g3(), x = x3d(); g.hero.visible = false; lightOn(-134, 2, 34); const b = g.balloon, rel = 55.2, t = Math.max(0, R - rel);
    b.visible = true; b.scale.setScalar(t > 0 ? 1 - 0.55 * seg(t, 0, 1.8) : 1.25);
    b.position.set(-134.8 + (t > 0 ? -t * 5 - Math.sin(t * 9) * 0.5 : 0), 1.9 + (t > 0 ? t * 3.2 + Math.cos(t * 11) * 0.4 : 0.05 * Math.sin(R * 3)), 35.9 - (t > 0 ? t * 2 : 0)); b.rotation.set(t * 8, t * 5, t * 6);
    if (t > 0) for (let k = 0; k < 10; k++) { const ph = (R * 3 + k / 10) % 1; puff(b.position.clone().add(V3(0.5 + ph * 1.4, -0.3 - ph * 0.6, 0.3)), 0.2 + ph * 0.8, 0.6 * (1 - ph), '#ffffff'); }
    setCam({ pos: [-130.6, 2.0, 30.2], tgt: [-134.2, 1.8, 35.8], fov: 44 }, 0.2);
    D.push(() => { const onS = (() => { const [px, py] = P2(b.position); return px > 120 && px < 960 && py > 380 && py < 1300; })(); if (onS) { tag(b.position, 120, -120, 'globo', null, K(R, 53.8, 0.3) * (1 - seg(R, 56.3, 56.8)), S3.white, 36); if (t > 0) tag(b.position.clone().add(V3(1, -0.5, 0)), -200, 160, 'aire hacia afuera', null, KO(R, rel + 0.1, 57.1, 0.2), S3.cyan, 32); } });
    HUD.pill = 'LA MISMA IDEA: UN GLOBO';
  },
  empuje(R, D) {
    stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero); plume(1, 6);
    stCam(R, [[57.2, [0, 3.0, 12], [0, 1.0, 0], 44], [61.4, [0.8, 3.2, 11.2], [0, 1.0, 0], 44]]);
    arrowAt(20, hpt(-1, 2.2, 0), V3(1, 0, 0), 3.4, K(R, 57.6, 0.3));
    D.push(() => { const a = K(R, 57.5, 0.3); if (a > 0) { s3Label(80, 470, 'PROPULSIÓN', 'un empuje hecho al lanzar cosas hacia atrás', { color: S3.white, alpha: a, size: 52 }); }
      tag(hpt(1.5, 2.6, 0), 40, -80, 'empuje', null, K(R, 57.8, 0.3), S3.cyan, 34); const b = K(R, 59.6, 0.3); if (b > 0) s3Text('agarre necesario: 0', CX, 1150, { size: 38, color: S3.note, align: 'center', alpha: b }); });
    HUD.pill = 'PROPULSIÓN';
  },
  veces(R, D) {
    stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero); plume(1, 6);
    stCam(R, [[61.4, [0, 2.6, 13], [0, 1.0, 0], 44], [66.2, [0.6, 2.8, 12.4], [0, 1.0, 0], 44]]);
    const m = 1 + 3.5 * EZ.io(seg(R, 63.0, 64.8));
    D.push(() => { s3Text(m < 4.5 ? m.toFixed(0) + '×' : '4–5×', CX, 600, { size: 150, color: S3.cyan, align: 'center' }); s3Text('LO QUE DICE TESLA', CX, 650, { size: 26, color: S3.note, align: 'center', spacing: 3 });
      bar(110, 1060, 860, 'PROPULSORES', m / 5, S3.cyan, m < 4.5 ? m.toFixed(1).replace('.', ',') + '×' : '4–5×', 1); bar(110, 1170, 860, 'LLANTAS', 0.2, S3.yellow, '1×', 1); });
    HUD.pill = 'PROPULSORES VS LLANTAS';
  },
  versiones(R, D) {
    const x = x3d(), g = g3(); stageMode(true); lightOn(SC.x, 4, SC.z); onStage(x.ups[0], 0, -3.2); onStage(g.hero, 0, 0); onStage(x.ups[1], 0, 3.2); x.ups.forEach((u) => (u.visible = true));
    stCam(R, [[66.2, [20, 6, 3], [0, 0.6, 0], 44], [70.4, [19.2, 6.3, 2.6], [0, 0.6, 0], 44]]);
    plume(K(R, 67.4, 0.2) * 0.8, 4);
    D.push(() => { const A = (dz, t, s, c, r) => tag(SC.clone().add(V3(0, 1.4, dz)), 0, -150, t, s, K(R, r, 0.3), c, 34, 'center');
      A(-3.2, 'PERFORMANCE', 'sin propulsores', S3.white, 66.5); A(0, 'THRUST', '< 1 s', S3.cyan, 67.0); A(3.2, 'ROCKET', '< 1 s', S3.cyan, 67.4);
      const a = K(R, 68.0, 0.3); if (a > 0) s3Text('< 1 s · solo las versiones con propulsores', CX, 1150, { size: 34, color: S3.note, align: 'center', alpha: a }); });
    HUD.pill = 'LAS VERSIONES';
  },
  vivo(R, D) {
    const t = Math.max(0, R - 70.9), v = Math.min(27.78, ACC * t), x = -170 + (t < 0.81 ? 0.5 * ACC * t * t : 0.5 * ACC * 0.81 * 0.81 + 27.78 * (t - 0.81));
    lightOn(x, 2, 0); heroAt(x); plume(R >= 70.9 ? 1 : 0, 10); cheer(R >= 70.9 ? 1 : 0.3); HUD.speed = kmh(v);
    setCam({ pos: [x + 5 - Math.min(t, 1) * 3, 1.6, 10.5], tgt: [x - 0.5, 0.9, 0], fov: 46 }, 0.4);
    HUD.timer = [Math.min(0.81, t).toFixed(2).replace('.', ',') + ' s', t >= 0.81 ? 'EN EL CRONÓMETRO DE TESLA' : ''];
    HUD.pill = 'LA PRUEBA EN VIVO';
  },
  problema(R, D) {
    const x = x3d(); stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero); xray(0.92, { frame: 1 }); x.tanks.visible = true;
    const u = K(R, 76.0, 0.8); const c = '#' + new THREE.Color('#3fd0d6').lerp(new THREE.Color('#ff4a3a'), u).getHexString(); x.tankM.color.set(c); x.lineM.color.set(c);
    stCam(R, [[75.3, [-5.6, 2.4, 5.4], [-0.8, 0.6, 0], 40], [78.9, [-5.0, 2.2, 5.0], [-0.8, 0.6, 0], 40]]);
    HUD.pill = 'OTRO PROBLEMA';
  },
  debil(R, D) {
    lightOn(-60, 2, 0); heroAt(-60); plume(1, 5);
    setCam({ pos: [-65, 1.3, 4.2], tgt: [-61.8, 0.7, 0], fov: 42 }, 0.2);
    D.push(() => { bar(110, 420, 860, 'COMBUSTIBLE DE COHETE', 1, '#ff8a3c', '', 1); bar(110, 530, 860, 'AIRE COMPRIMIDO', 0.22, S3.cyan, '', 1); s3Text('empuje por kilo de propelente · ilustrativo', CX, 640, { size: 24, color: S3.note, align: 'center' }); });
    HUD.pill = 'AIRE = COHETE DÉBIL';
  },
  kilos(R, D) {
    const x = x3d(); stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero); xray(0.92, { frame: 1 }); x.tanks.visible = true;
    stCam(R, [[81.0, [-4.6, 3.0, 6.0], [-0.6, 0.6, 0], 42], [84.6, [-4.0, 3.2, 5.6], [-0.6, 0.6, 0], 42]]);
    const kg = Math.round(250 * EZ.o3(seg(R, 81.6, 83.0)));
    D.push(() => { s3Text('≈ ' + kg + ' kg', CX, 560, { size: 130, color: S3.cyan, align: 'center' }); s3Text('DE AIRE · VERSIÓN MÁS POTENTE · SEGÚN LO PUBLICADO', CX, 610, { size: 22, color: S3.note, align: 'center', spacing: 2 }); });
    HUD.pill = 'LA VERSIÓN MÁS POTENTE';
  },
  vacio(R, D) {
    const x = x3d(); stageMode(true); lightOn(SC.x, 4, SC.z); onStage(g3().hero); xray(0.92, { frame: 1 }); x.tanks.visible = true;
    const left = 1 - seg(R, 85.0, 87.0); x.tankM.opacity = 0.2 + 0.65 * left; plume(left > 0.02 ? 1 : 0, 7, '#bff4f8');
    stCam(R, [[84.6, [-7, 3.6, 8], [-1.5, 0.6, 0], 44], [87.5, [-7.5, 3.8, 8.6], [-1.5, 0.6, 0], 44]]);
    D.push(() => { bar(110, 1160, 860, 'TANQUES DE AIRE', left, left > 0.3 ? S3.cyan : '#ff5a4a', left > 0.6 ? 'LLENOS' : left > 0.02 ? 'VACIÁNDOSE' : 'VACÍOS', 1); s3Text('estimado · Tesla no ha dicho cuánto dura', CX, 1260, { size: 24, color: S3.note, align: 'center' }); });
    HUD.pill = 'A TODO LO QUE DA';
  },
  rellena(R, D) {
    lightOn(-60, 2, 0); heroAt(-60); setCam({ pos: [-56.5, 2.0, 9.5], tgt: [-58.8, 0.8, 0], fov: 44 }, 0.25);
    const f = K(R, 87.8, 0.3); for (let k = 0; k < 70; k++) { const Rn = RNG('in', k), ph = (R * 0.5 + Rn.f()) % 1; puff(hpt(-1.0 + (1 - ph) * Rn.r(4, 12), 0.5 + Rn.n(1.2) * (1 - ph), Rn.n(3) * (1 - ph)), 0.14, 0.9 * f * Math.min(1, ph * 4), '#5af0f8'); }
    D.push(() => { const fill = seg(R, 88.2, 91.6); bar(110, 1160, 860, 'TANQUES DE AIRE', fill, S3.cyan, fill < 0.98 ? 'LLENANDO' : 'LLENOS', 1); tag(hpt(3, 1.0, 0), 40, -160, 'aire de afuera', 'según Tesla', K(R, 88.6, 0.3), S3.cyan, 36); });
    HUD.pill = 'RELLENA CON AIRE DE AFUERA';
  },
  gasolinera(R, D) {
    const t = R - 91.9, x = -192 + 6 * t; lightOn(-180, 3, 10); heroAt(x);
    setCam({ pos: [-180, 3.2, -14], tgt: [-180, 3.0, 12], fov: 46 }, 0.2);
    D.push(() => { const a = K(R, 92.3, 0.3); if (a > 0) { const [px, py] = P2(V3(-180, 6.6, 13)); s3Text('✕', px, py, { size: 90, color: '#ff5a4a', align: 'center', alpha: a }); } });
    HUD.pill = 'SOLO AIRE';
  },
  respira(R, D) {
    const g = g3(), x = x3d(); g.hero.visible = false; lightOn(-134, 2, 36);
    setCam({ pos: [-132.6, 2.0, 32.2], tgt: [-134, 1.6, 36], fov: 42 }, 0.15);
    const head = V3(-134, 2.0, 35.85); for (let k = 0; k < 80; k++) { const Rn = RNG('br', k), ph = (R * 0.35 + Rn.f()) % 1, a = Rn.f() * TAU, r = (1 - ph) * Rn.r(1.2, 3.5); puff(head.clone().add(V3(Math.cos(a) * r, Rn.n(1.6) * (1 - ph), Math.sin(a) * r * 0.5 - 0.2)), 0.08, 0.95 * Math.min(1, ph * 3), '#5af0f8'); }
    x.woman.scale.y = 1 + 0.012 * Math.sin(R * 2.4);
    D.push(() => s3Text('aire mostrado en color', CX, 520, { size: 26, color: S3.note, align: 'center', alpha: K(R, 94.3, 0.3) }));
    HUD.pill = 'EL AIRE QUE TE RODEA';
  },
  agarro(R, D) {
    lightOn(-60, 2, 0); heroAt(-60); setCam({ pos: [-56, 1.7, 9.5], tgt: [-60.4, 0.8, 0], fov: 44 }, 0.3);
    arrowAt(0, hpt(1.38, 0.05, 1.0), V3(1, 0, 0), 1.6, K(R, 96.8, 0.3));
    D.push(() => { tag(hpt(1.38, 0.05, 1.0), 40, 120, 'llantas ≈ 1 g', null, K(R, 96.9, 0.3), S3.yellow, 36); tag(hpt(0, 1.4, 0), 0, -170, '¿más agarre que el camino?', null, K(R, 97.0, 0.3), S3.white, 40, 'center'); });
    HUD.pill = '¿MÁS AGARRE?';
  },
  lanzo(R, D) {
    const t = R - 98.9, x = -100 + 1.4 * t * t; lightOn(x, 2, 0); heroAt(x); plume(1, 10);
    setCam({ pos: [x - 9, 1.3, 7], tgt: [x + 1, 0.8, 0], fov: 46 }, 0.3);
    D.push(() => tag(hpt(-5, 0.8, 0), -40, -180, 'su propio aire', null, K(R, 99.2, 0.3), S3.cyan, 42));
    HUD.pill = 'LANZÓ SU PROPIO AIRE';
  },
  tulimite(R, D) {
    const g = g3(), x = x3d(); g.hero.visible = false; lightOn(XING, 3, 0); corollaAt(XING - 14); x.lamps[0].color.set('#ff3a2a');
    setCam({ pos: [XING - 22, 2.2, -6.5], tgt: [XING - 14, 1.0, 0], fov: 44 }, 0.25);
    D.push(() => { tag(cpt(0, 1.5, 0), 0, -120, 'TU AUTO', 'límite: las llantas', K(R, 101.7, 0.3), S3.yellow, 40, 'center'); });
    HUD.pill = 'TU LÍMITE: LLANTAS';
  },
  limite(R, D) {
    const t = R - 103.5, x = -80 + 0.8 * t * t; lightOn(x, 2, 0); heroAt(x); plume(1, 8); cheer(1);
    setCam({ pos: [x + 6 + t * 2, 2.4, 12 + t * 3], tgt: [x - 1, 0.9, 0], fov: 46 }, 0.3);
    D.push(() => { tag(hpt(0, 1.4, 0), 0, -170, 'ROADSTER', 'límite: su aire', K(R, 103.8, 0.3) * (1 - seg(R, 105.0, 105.3)), S3.cyan, 40, 'center');
      const e = K(R, 105.1, 0.35); if (e > 0) s3Text('DOPAMENTES', CX, H / 2, { size: 44, align: 'center', alpha: e * 0.95, spacing: 6 }); });
    HUD.pill = 'SU LÍMITE: EL AIRE';
  },
};
