// =====================================================================
//  SCENES — the beat table, the hero's path, the contraption's stages and one continuous camera.
//  Times are the scratch plan; once voice.json exists the beats start at the line times (VL(id)).
// =====================================================================
// [t0, id, caption, inventions, new problems]
const PBEATS = [
  [0.0,  'open',   'Llevas paraguas… y aun así las piernas te quedan empapadas. ¿Por qué?', 0, 1],
  [4.0,  'wide',   'Primer intento: un paraguas el doble de grande.', 1, 1],
  [7.5,  'wind',   'Pero la lluvia no cae derecha. El viento la tira de costado.', 1, 2],
  [12.0, 'walls',  'Solución: cortinas impermeables por todos lados.', 2, 2],
  [15.5, 'sail',   'Seco, sí. Hasta que sopla… y te lleva como una cometa.', 2, 3],
  [20.0, 'frame',  'Hace falta algo firme. Un armazón de metal que aguante.', 3, 3],
  [24.0, 'wheels', 'Ahora pesa como un ropero. Mejor con ruedas.', 4, 4],
  [28.5, 'motor',  'Cuesta arriba es un suplicio. Le metemos un motor.', 5, 5],
  [32.5, 'seat',   '¿Ir parado todo el viaje? Ni loco. Un asiento.', 6, 6],
  [35.5, 'glass',  'Pero entre tanta pared no ves nada. El frente, de vidrio.', 7, 7],
  [39.5, 'wiper',  'Y el vidrio se llena de gotas. Un brazo que las barra.', 8, 8],
  [43.0, 'steer',  'Y algo para girar…', 9, 9],
  [44.6, 'steer2', 'porque ya te comiste un arbusto.', 9, 9],
  [48.0, 'car',    'Seco, sentado y sin dar un paso. Felicidades: inventaste el auto.', 9, 9],
  [54.0, 'arrive', 'Llegaste. Bajas…', 9, 9],
  [57.0, 'loop',   '…y te hace falta un paraguas.', 9, 10],
];
const SCR_ROWS = PBEATS.map(([t0, id, cap, inv, prob], i) => ({ i, t0, t1: i + 1 < PBEATS.length ? PBEATS[i + 1][0] : 60, id, cap, inv, prob }));   // the plan's (scratch) clock
// the voice's clock: each beat starts 0.25 s before its line (the first at 0); motion is authored on the scratch clock
const VLINE = (id) => (typeof VOICE !== 'undefined' ? VOICE.lines.find((l) => l.id === id) : null);
const PBEAT_ROWS = SCR_ROWS.map((b, i) => { const L = VLINE(b.id); return { ...b, t0: i === 0 ? 0 : (L ? Math.max(0, L.t0 - 0.25) : b.t0) }; });
PBEAT_ROWS.forEach((b, i, A) => { b.t1 = i + 1 < A.length ? A[i + 1].t0 : DURATION; });
function scrT(t) {   // real time -> scratch time (piecewise linear between beat starts)
  for (let i = 0; i < PBEAT_ROWS.length; i++) { const b = PBEAT_ROWS[i], s0 = SCR_ROWS[i].t0, s1 = SCR_ROWS[i].t1;
    if (t < b.t1 || i === PBEAT_ROWS.length - 1) return s0 + (s1 - s0) * clamp((t - b.t0) / Math.max(0.01, b.t1 - b.t0)); }
  return t;
}
const beatAt = (t) => { let i = 0; while (i + 1 < SCR_ROWS.length && t >= SCR_ROWS[i + 1].t0) i++; return SCR_ROWS[i]; };   // scratch clock
const BT = (id) => SCR_ROWS.find((b) => b.id === id).t0;   // scratch clock

// ---- piecewise-smooth tracks: keys [[t, v], ...]; Catmull-Rom between keys (velocity carries through)
function trk(keys, t) {
  if (t <= keys[0][0]) return keys[0][1]; const n = keys.length; if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0; while (t > keys[i + 1][0]) i++;
  const [t1, p1] = keys[i], [t2, p2] = keys[i + 1], p0 = (keys[i - 1] || keys[i])[1], p3 = (keys[i + 2] || keys[i + 1])[1], u = (t - t1) / (t2 - t1);
  const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return Array.isArray(p1) ? p1.map((_, k) => cr(p0[k], p1[k], p2[k], p3[k])) : cr(p0, p1, p2, p3);
}
// eased hold-to-hold track (no overshoot): good for positions that stop
function hold(keys, t) {
  if (t <= keys[0][0]) return keys[0][1]; const n = keys.length; if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0; while (t > keys[i + 1][0]) i++; const u = EZ.io((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])), a = keys[i][1], b = keys[i + 1][1];
  return Array.isArray(a) ? a.map((v, k) => lerp(v, b[k], u)) : lerp(a, b, u);
}
// ---- the hero/rig path: x along the street, z across (1.1 sidewalk → 3.7 road)
const PATH_X = [[0, -3.5], [4, 0.6], [7.5, 3.4], [12, 6.6], [15.5, 8.4], [17.0, 9.0], [19.5, 12.6], [20.5, 12.9], [24, 13.6], [26.2, 14.4], [28.5, 16.6], [30.0, 18.4], [32.5, 26.0], [35.5, 29.5], [39.5, 34.0], [43.0, 38.2], [44.2, 40.9], [48.0, 40.9], [48.6, 41.6]];
const PATH_Z = [[0, 1.1], [25.6, 1.1], [27.4, 3.7], [44, 3.7], [48.6, 3.7], [50.5, 6.2]];
function heroX(t) { if (t >= 48.6) { const hx = CA ? CA.homeX : 100, k = EZ.io(seg(t, 48.6, 53.2)); return lerp(41.6, hx - 0.2, k); } return hold(PATH_X, t); }
function heroZ(t) { if (t >= 50.5) { return lerp(6.2, 3.2, EZ.io(seg(t, 50.5, 53.2))); } return hold(PATH_Z, t); }

// ---- contraption stages (seconds since the part arrived, for the springs) and per-beat poses
function stages(t) {
  const since = (id, d = 0) => Math.max(0, t - BT(id) - d);
  const P = {};
  P.r = lerp(0.55, 1.0, springEase(since('wide', 0.9), 180, 10));
  P.walls = clamp(since('walls', 0.8) / 0.9); P.box = EZ.io(seg(t, BT('frame') + 0.5, BT('frame') + 2.4));
  P.sail = Math.sin(Math.PI * seg(t, BT('sail') + 1.1, BT('frame') + 0.6)) ** 0.7 * (1 - P.box);
  P.frame = clamp(since('frame', 0.6) / 1.8);
  P.wheels = clamp(since('wheels', 1.6) / 1.4);
  P.motor = since('motor', 1.9) * 1.2; P.seat = since('seat', 1.7) * 1.0; P.glass = since('glass', 2.2); P.drops = clamp(since('wiper', -0.6) / 1.4);
  P.wiperOn = since('wiper', 2.1) * 1.1; P.wiper = since('wiper', 2.5) * 0.9; P.wipes = 1;
  P.steer = since('steer', 2.6) * 1.1;
  P.backUp = clamp((t - BT('frame') - 2.6) / 0.9); P.frontUp = clamp((t - BT('glass') - 1.5) / 0.7);
  // the wall top: under the hand-held canopy at first, the frame's roof once boxed
  P.r += 0.24 * P.box;   // the canopy squares off over the box corners
  P.roll = heroX(t) * 1.0;
  return P;
}

// ---- camera keys: [t, offset from the rig (x, y, z), target offset (x, y, z), lens mm]
const CAM = [
  [0.0,  [3.2, 1.2, 2.3],    [0.0, 1.05, 0.0], 22],     // front 3/4, low: face, canopy, soaked legs
  [3.6,  [1.4, 0.35, 1.3],   [0.0, 0.45, 0.0], 24],    // push to the legs
  [5.0,  [3.0, 1.15, 2.2],   [0.0, 1.55, 0.0], 22],     // crane up: the wider canopy, his face under it
  [7.6,  [-1.3, 1.5, 3.3],   [0.3, 1.2, 0.0], 22],
  [9.6,  [0.4, 0.5, 3.0],    [0.0, 0.6, 0.0], 22],     // leg level: rain blown sideways
  [12.6, [3.4, 1.8, 3.2],    [0.0, 1.0, 0.0], 22],     // orbit: walls fall in
  [15.2, [3.8, 1.6, 2.4],    [0.0, 1.0, 0.0], 22],
  [17.4, [0.6, 1.5, 4.6],    [0.6, 1.0, 0.0], 20],     // the sail drags him at the camera
  [20.4, [2.0, 3.4, 3.6],    [0.0, 1.1, 0.0], 22],     // frame snaps on
  [23.6, [3.4, 2.0, 3.4],    [0.0, 1.0, 0.0], 22],
  [25.6, [3.6, 1.1, 3.4],    [0.0, 0.6, 0.0], 22],     // wheels drop
  [27.0, [1.0, 1.5, 4.8],    [0.0, 0.8, 0.0], 22],     // off the curb
  [28.4, [-3.8, 1.4, 2.6],   [0.5, 0.9, 0.0], 22],     // uphill, from behind and below
  [30.2, [-2.3, 0.65, -2.0], [-0.85, 0.32, -0.7], 26],  // macro: the motor on the rear wheel
  [32.6, [-3.0, 2.2, 3.0],   [0.4, 1.0, 0.0], 22],
  [34.0, [-2.8, 2.1, 1.0],   [-0.2, 0.75, 0.0], 22],   // through the open back: the seat drops in
  [36.0, [-1.1, 1.75, 0.05], [2.0, 1.2, 0.0], 22],    // behind the head: panels everywhere
  [38.8, [-1.1, 1.76, 0.08], [2.0, 1.2, 0.0], 22],     // through the new glass
  [41.8, [-1.15, 1.78, 0.1], [2.0, 1.2, 0.0], 24],     // over his shoulder: drops, the wiper sweeps
  [43.0, [3.6, 1.2, 3.2],    [0.6, 0.9, 0.0], 22],     // CUT outside: into the hedge
  [46.2, [3.6, 1.8, 3.0],    [0.0, 1.0, 0.0], 22],     // steering wheel arrives
  [48.4, [4.8, 3.0, 3.4],    [0.0, 1.0, 0.0], 20],     // the wide crane: the car on the street
  [52.0, [5.0, 2.6, 3.0],    [0.0, 1.0, 0.0], 20],
  [54.2, [1.2, 1.6, -3.4],   [-0.8, 1.2, -1.0], 22],   // on the sidewalk by the red door, looking back at the car
  [57.4, [-0.2, 1.35, -3.6], [-1.5, 1.55, -2.0], 26],  // he takes the umbrella back (low: the face under the canopy)
  [60.0, [-0.3, 1.3, -3.4],  [-1.5, 1.6, -2.0], 30],
];
const CAM_CUT = 43.0;   // one hard cut: from inside the cab to the street, on "Y algo para girar…"
function paCam(t) { const k = CAM.filter(([tt]) => (t < CAM_CUT ? tt < CAM_CUT : tt >= CAM_CUT)).map(([tt, o, tg, mm]) => [tt, [...o, ...tg, mm]]); const v = trk(k, t); return { o: v.slice(0, 3), tg: v.slice(3, 6), mm: v[6] }; }

// ---- the hero's pose per beat
const HERO_ROT = 90;   // faces +X
function heroPose(t, b, x, z, P) {
  const gx = x, walkPh = x / 1.35, inside = P.box > 0.5, sit = clamp((t - BT('seat') - 2.1) / 0.6) * (t < BT('arrive') + 0.8 ? 1 : 1 - clamp((t - BT('arrive') - 0.8) / 0.8));
  const o = { pos: [x, caY(x), z], rot: HERO_ROT, t, walk: walkPh, stride: 1, expr: 'neutral', look: [0, 0], hand: { R: 'fist' } };
  const umbArm = { shR: [-26, 0, -8], elR: [-64, 0, 0] };
  o.lockArm = ['shR', 'elR', 'wrR'];
  const DB = (typeof window !== 'undefined' && window.PA_DBG) || {}; if (DB.arm) Object.assign(umbArm, DB.arm);
  o.add = { ...umbArm }; if (DB.nowalk) o.walk = null; if (DB.armOnly) o.add = { ...DB.armOnly };
  if (b.id === 'open') { o.expr = [['worried', 0.8], ['sad', 0.2]]; o.add.head = [16 * ss(1.2, 2.4, t), 0, 0]; o.add.neck = [8 * ss(1.2, 2.4, t), 0, 0]; o.look = [0, -18 * ss(1.2, 2.4, t)]; }
  if (b.id === 'wide') { o.expr = t < BT('wide') + 1.2 ? 'neutral' : 'happy'; o.look = [0, 20]; o.add.head = [-10, 0, 0]; }
  if (b.id === 'wind') { o.expr = 'worried'; o.add.spine = [8, 0, -6]; o.add.head = [10, -10, 0]; o.stride = 0.7; }
  if (b.id === 'walls') { o.expr = t < BT('walls') + 1.8 ? 'surprised' : 'smug'; o.look = [0, 10]; }
  if (b.id === 'sail') { const k = Math.sin(Math.PI * seg(t, BT('sail') + 1.1, BT('frame') + 0.6)); o.expr = k > 0.2 ? 'surprised' : 'smug'; if (k > 0.2) { o.walk = null; o.pose = [['stand', 1 - k], ['shock', k * 0.5]]; o.add = { ...umbArm, hips: [-14 * k, 0, 0], spine: [-12 * k, 0, 0], hipL: [-30 * k, 0, 0], hipR: [20 * k, 0, 0], knL: [10 * k, 0, 0], shL: [-60 * k, 0, 40 * k], elL: [-30 * k, 0, 0] }; o.hand.L = 'open'; } }
  if (b.id === 'frame') { o.expr = t < BT('frame') + 2.4 ? 'worried' : 'happy'; o.walk = (t - BT('frame')) < 2.4 ? null : walkPh; }
  if (['frame', 'wheels', 'motor', 'seat', 'glass', 'wiper', 'steer', 'steer2', 'car'].includes(b.id)) o.hand = { R: 'hold', L: 'hold' };
  if (P.frame > 0.95 && sit <= 0) { o.lockArm = ['shL', 'elL', 'wrL', 'shR', 'elR', 'wrR']; o.add = { shL: [-58, 0, 6], shR: [-58, 0, -6], elL: [-38, 30, 0], elR: [-38, -30, 0], spine: [12, 0, 0] }; }
  if (b.id === 'wheels') { o.expr = 'worried'; o.add.spine = [18, 0, 0]; o.add.hips = [10, 0, 0]; o.stride = 0.8; }
  if (b.id === 'motor') { const k = ss(BT('motor') + 2.0, BT('motor') + 2.6, t); o.expr = k < 0.5 ? 'sad' : 'joy'; o.add.spine = [lerp(26, 6, k), 0, 0]; o.add.hips = [lerp(14, 2, k), 0, 0]; o.stride = lerp(0.6, 1.3, k); }
  if (sit > 0) { o.walk = null; o.pose = [['stand', 1 - sit], ['sit', sit]]; o.sitY = lerp(0, 0.62 - 0.44, sit) + 0; o.ground = sit < 0.5; o.pos = [x - 0.25 * Math.cos(0), caY(x) + 0.0, z]; o.expr = 'happy';
    o.add = { elL: [30, -30, 0], elR: [30, 30, 0] }; o.hand = { L: 'relax', R: 'relax' }; }
  if (b.id === 'glass' && t < BT('glass') + 2.2) o.expr = 'worried';
  if (b.id === 'wiper') o.expr = t < BT('wiper') + 2.3 ? 'worried' : 'happy';
  if (b.id === 'steer' || b.id === 'steer2') { const hit = BT('steer') + 1.35; o.expr = t < hit ? 'worried' : (t < hit + 1.6 ? 'surprised' : 'happy'); }
  if (b.id === 'car') o.expr = 'joy';
  if (sit > 0 && (b.id === 'steer2' && t > BT('steer') + 2.9 || b.id === 'car')) { o.add.shL = [-62, 0, 8]; o.add.shR = [-62, 0, -8]; o.add.elL = [-46, 40, 0]; o.add.elR = [-46, -40, 0]; o.hand = { L: 'hold', R: 'hold' }; }
  if (b.id === 'arrive' || b.id === 'loop') { const k = seg(t, BT('arrive') + 0.8, BT('arrive') + 2.0); o.expr = b.id === 'loop' ? [['sad', 0.6], ['worried', 0.4]] : 'neutral'; if (sit <= 0) { o.walk = null; o.pose = 'stand'; const k1 = EZ.io(seg(k, 0, 0.5)), k2 = EZ.io(seg(k, 0.4, 1)); o.walk = (k > 0 && k < 1) ? k * 3 : null; o.rot = HERO_ROT + 180 * k1 - 90 * k2; o.pos = [x - 1.5 * k1, caY(x), z - 2.0 * k2]; o.look = [0, 18]; o.add = { head: [-14, 0, 0], neck: [-6, 0, 0] }; if (b.id === 'loop') { const u = EZ.io(seg(t, BT('loop') + 0.3, BT('loop') + 1.3)); o.add = { shR: [lerp(-150, umbArm.shR[0], u), 0, lerp(-20, umbArm.shR[2], u)], elR: [lerp(-10, umbArm.elR[0], u), 0, 0], head: [-6, 0, 0] }; o.lockArm = ['shR', 'elR', 'wrR']; o.look = [0, 4]; } } }
  void gx; return o;
}

// ---- the frame
function sceneMain() {
  const t = scrT(TT), b = beatAt(t), g = g3(); if (!CA) caBuild(g); const rb = PBEAT_ROWS[b.i];
  const P = stages(t), x = heroX(t), z = heroZ(t);
  // the rig: carried by the hero until the wheels touch down, then it rolls; it leans in the crash
  const crash = BT('steer') + 1.35, jolt = t > crash ? Math.exp(-(t - crash) * 3) * Math.sin((t - crash) * 22) : 0;
  const yaw = (t > 48.6 && t < 50.5 ? -0.25 * Math.sin(Math.PI * seg(t, 48.6, 50.5)) : 0) + (t > 50.5 && t < 53.2 ? 0.2 * Math.sin(Math.PI * seg(t, 50.5, 53.2)) : 0) + (t > 25.6 && t < 27.4 ? -0.3 * Math.sin(Math.PI * seg(t, 25.6, 27.4)) : 0);
  const curb = t > 26.2 && t < 27.0 ? -0.14 * EZ.io(seg(t, 26.3, 26.9)) : (t >= 27.0 ? -0.14 : 0), carry = P.wheels < 0.02 ? 0.0 : 0;
  // the hero first: while the umbrella is hand-held, the walls hang from its rim (rig centred on the umbrella)
  const o = heroPose(t, b, x, z, P); if (curb && o.pos) o.pos[1] += curb; caHero(o);
  const back = seg(t, BT('loop') + 0.3, BT('loop') + 1.3), mk = P.box * (1 - back), r = lerp(P.r, 0.55, back);
  const hp = caHoldPos(r), gy = caY(x) + curb, rx = lerp(hp.x, x, P.box), rz = lerp(hp.z, z, P.box);
  P.top = lerp(hp.y + caEdgeY(r) - gy + 0.02, CA_WALL1 + 0.02, P.box);
  // the jeans soak from the hem up while he walks in the rain (dry again never: he stays damp)
  CH_WET.u.value = CH_WET.y0 + lerp(0.05, 0.85, EZ.o2(seg(t, 0.2, 3.4))) + 0.12 * EZ.o2(seg(t, BT('wind') + 0.8, BT('walls'))) - 0.0 ;
  if ((window.PA_DBG || {}).wet != null) CH_WET.u.value = CH_WET.y0 + window.PA_DBG.wet;
  caPose([rx, rz, yaw, curb + carry, jolt * 0.06], P, t);
  caUmbrella(r, mk, t, { wob: b.id === 'wind' ? 0.12 : (mk > 0.5 ? 0.015 : 0.03), tiltZ: b.id === 'wind' ? -0.25 : 0 });
  // the walls go away when he steps out at the end? no: the car stays, he leaves it
  // camera
  const C = paCam(t), sh = jolt * 0.06, cx = x + C.o[0], cz = clamp(z + C.o[2], 0.5, 11.6);
  const DB = window.PA_DBG || {}; if (DB.cam) shotCam(g, DB.cam[0], DB.cam[1], DB.cam[2], 0); else
  shotCam(g, [cx + sh, caY(cx) + C.o[1] + sh * 0.5, cz], [x + C.tg[0], caY(x) + C.tg[1], z + C.tg[2]], C.mm * 0.72, 1.2);
  // weather
  const wind = b.id === 'wind' || b.id === 'sail' ? 0.95 * Math.sin(Math.PI * seg(t, BT('wind') + 0.4, BT('frame') + 0.4)) + 0.15 : 0.15;
  caRainUpdate(TT, g.cam, wind); caSplashUpdate(TT, g.cam); caLamps(1);
  present(g, CA.scene, { bloom: 0.18 });
  pvTint('#2a3440', 0.06, 'multiply');
  if (!(window.PA_DBG || {}).clean) { hud(t, b); captions(TT, rb); }
}
// ---- HUD and captions
function hud(t, b) {
  const a = Math.min(clamp((t - BT('wide') - 0.2) / 0.6), 1 - clamp((t - BT('arrive')) / 0.6)); if (a <= 0) return;   // t: scratch clock
  const pop = (id) => 1 + 0.25 * Math.exp(-(t - BT(id) - 1.0) * 5) * (t > BT(id) + 1.0 ? 1 : 0);
  const f = () => {
    pvFeather(300, 330, 420, 120, a * 0.85);
    pvText('INVENTOS', 64, 280, 24, { font: PV.sans, weight: 700, spacing: 4, alpha: a });
    pvText(String(b.inv), 60, 352, 72 * pop(b.id), { alpha: a });
    pvText('PROBLEMAS NUEVOS', 300, 280, 24, { font: PV.sans, weight: 700, spacing: 4, alpha: a, color: '#ffb4a2' });
    pvText(String(b.prob), 300, 352, 72, { alpha: a, color: '#ffb4a2' });
  };
  if (DEFER) DEFER.push(f); else f();
}
function capLines(str, max = 27) { const w = str.split(' '), L = []; let cur = ''; w.forEach((s) => { if ((cur + ' ' + s).trim().length > max && cur) { L.push(cur); cur = s; } else cur = (cur + ' ' + s).trim(); }); if (cur) L.push(cur); return L; }
function captions(t, b) {
  const t0 = b.t0 + 0.1, t1 = b.t1 - 0.15; if (t < t0 || t >= t1) return; const a = Math.min(ev(t0, 0.3), 1 - ev(t1 - 0.25, 0.25)), L = capLines(b.cap);
  const f = () => { pvFeather(CX, 1372 + (L.length - 1) * 34, 580, 120 + L.length * 30, a); L.forEach((l, i) => pvText(l, CX, 1390 + i * 72 - (L.length - 1) * 10, 62, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
TIMELINE.cuts = [PBEAT_ROWS.find((b) => b.id === 'steer').t0];
TIMELINE.narration = typeof VOICE !== 'undefined' ? VOICE.lines.map((l) => ({ id: l.id, t0: l.t0, t1: l.t1, text: l.text })) : [];
TIMELINE.board = PBEAT_ROWS.map((b, i, A) => ({ t: b.t0 + Math.min(2.6, (b.t1 - b.t0) * 0.7), title: `${i + 1} ${b.id}: ${b.cap}`, sound: '', next: A[i + 1] ? A[i + 1].id : 'loop' }));
