// =====================================================================
//  SCENES — Troya (amphora-bf + Nano Banana 2 cut-out layers). World 1080x1920, on 2s, wiggle on 3s.
//  The figures are painted layers (assets/*.png, keyed off magenta); code moves them like puppets on a frieze:
//  camera pans and pushes, parallax, walks, the horse dragged, gates swinging, flames, smoke, sea, sky.
//  The picture lives between the friezes (y 234..1599), feet on BF_FLOOR.
// =====================================================================
const FL = BF_FLOOR;
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const shotU = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const shotNow = () => IDS[Math.max(0, TB.findIndex((t, i) => TT >= t - 1e-6 && (i + 1 >= TB.length || TT < TB[i + 1] - 1e-6)))];
const since = (id) => TT - SUB(id);

// ---- the camera: a frieze is read sideways, so it pans (and pushes a little), always floating
function panCam(id, x0, x1, z0 = 1, z1 = 1.05, cy0 = 960, cy1 = cy0) {
  const u = EZ.io(shotU(id));
  return { cx: lerp(x0, x1, u) + 6 * Math.sin(TT * 0.4), cy: lerp(cy0, cy1, u) + 5 * Math.sin(TT * 0.33), z: lerp(z0, z1, u) };
}
function shake(t, d, amp) { const k = clamp(1 - (TT - t) / d); if (TT < t || k <= 0) return; const R = RNG('shk', Math.floor(TT * 24)); ctx.translate(R.r(-1, 1) * amp * k, R.r(-1, 1) * amp * k); }

const walkBob = (t, rate = 7) => Math.abs(Math.sin(t * rate)) * 10;
const walkRock = (t, rate = 7) => 0.025 * Math.sin(t * rate);
// a figure turning round (a quick squash through the profile)
const turnSx = (t, d = 0.28) => { const u = clamp((TT - t) / d); return u <= 0 ? 1 : u >= 1 ? -1 : Math.cos(u * Math.PI); };

// ---- code-drawn pieces in the same paint (kit bfFill/bfInc)
function bfMoon(x, y, r) { ctx.save(); ctx.fillStyle = BF.black; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.85, 0, TAU, true); ctx.fill('evenodd'); ctx.restore(); }
function bfSun(x, y, r, spin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin); ctx.fillStyle = BF.black;
  ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, rr = i % 2 ? r * 1.0 : r * 1.38; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.stroke(); ctx.restore();
}
function bfStars(n, key, y0 = 300, y1 = 700) { for (let i = 0; i < n; i++) { const R = RNG('st', key, i), tw = 0.5 + 0.5 * Math.sin(TT * 3 + i); star4(R.r(60, 1020), R.r(y0, y1), 7 * tw + 3, BF.black); } }
function bfWaveBand(y, key, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = BF.black; ctx.lineCap = 'round';
  for (let r = 0; r < 6; r++) {
    const yy = y + r * 48, step = 62 + r * 6, off = mod(-TT * (30 + r * 8) + r * 23, step); ctx.lineWidth = 4 + r * 0.6;
    ctx.beginPath();
    for (let x = -400 - off; x < 1500; x += step) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + step * 0.3, yy - 26, x + step * 0.55, yy - 8); ctx.quadraticCurveTo(x + step * 0.45, yy + 2, x + step * 0.36, yy - 6); ctx.moveTo(x + step * 0.55, yy - 8); ctx.quadraticCurveTo(x + step * 0.8, yy + 6, x + step, yy); }
    ctx.stroke();
  }
  ctx.fillStyle = BF.black; ctx.fillRect(-400, y - 4, 1900, 5);
  ctx.restore();
}
function bfFlames(x, y, w, h, k, key) {
  if (k <= 0) return;
  const n = Math.max(3, Math.round(w / 70));
  for (const [c, sc] of [[BF.black, 1], [BF.red, 0.7], [BF.gold, 0.4]]) for (let i = 0; i < n; i++) {
    const R = RNG('fl', key, i, B), bx = x - w / 2 + (i + 0.5) * w / n, hh = h * k * sc * R.r(0.6, 1.1), ww = w / n * 0.7 * sc, lean = R.r(-0.3, 0.3) * hh;
    bfFill([[bx - ww, y], [bx - ww * 0.8, y - hh * 0.35], [bx - ww * 0.2 + lean * 0.4, y - hh * 0.55], [bx - ww * 0.5 + lean * 0.7, y - hh * 0.8], [bx + lean, y - hh], [bx + ww * 0.3 + lean * 0.5, y - hh * 0.6], [bx + ww * 0.9, y - hh * 0.4], [bx + ww, y]], c, { key: 'flm' + key + i + sc + B, sep: c === BF.black ? 4.5 : 0 });
  }
}
// the painted flame row, flickering: three copies on 2s with different squash
function flameRow(x, y, h, k, key, o = {}) {
  if (k <= 0) return;
  for (let j = 0; j < 2; j++) { const R = RNG('fr', key, j, B); bfLay('flames.png', x + R.r(-14, 14) + j * 30, y + 6, h * k * R.r(0.86, 1.08), { sx: (j ? -1 : 1) * (o.w ?? 1), a: j ? 0.85 : 1 }); }
}
function bfSmoke(x, y, k, key, hh = 560) {
  if (k <= 0) return; const L = [], Rr = [];
  for (let j = 0; j <= 24; j++) { const u = j / 24, wv = Math.sin(u * 7 - TT * 2.2 + x * 0.01) * 40 * u, cx = x + wv + u * 80, r = lerp(26, 90, u) * (0.8 + 0.2 * Math.sin(u * 13 + TT * 3)); L.push([cx - r, y - u * hh * k]); Rr.push([cx + r, y - u * hh * k]); }
  bfFill([...L, ...Rr.reverse()], BF.black, { key: 'smk' + key, raw: true, a: 0.9 });
  for (let j = 0; j < 4; j++) { const u = 0.2 + j * 0.18; bfInc(arcPts(x + u * 80, y - u * hh * k, lerp(26, 90, u) * 0.6, 3.6, 5.8, 8), { w: 1.4, raw: true }); }
}
function ladder(x0, y0, x1, y1, w = 46, k = 1) {   // rails from foot to top, rungs drawn on as it rises
  const yT = lerp(y0, y1, k), xT = lerp(x0, x1, k);
  ctx.save(); ctx.strokeStyle = BF.black; ctx.lineCap = 'round'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x0 - w / 2, y0); ctx.lineTo(xT - w / 2, yT); ctx.moveTo(x0 + w / 2, y0); ctx.lineTo(xT + w / 2, yT); ctx.stroke();
  ctx.lineWidth = 6; const n = Math.floor(Math.abs(yT - y0) / 44);
  for (let i = 1; i <= n; i++) { const u = i * 44 / Math.abs(y1 - y0), x = lerp(x0, x1, u), y = lerp(y0, y1, u); ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.stroke(); }
  ctx.restore();
}
function rope(x0, y0, x1, y1, sag = 40) { ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1); ctx.stroke(); ctx.restore(); }
function bolt(x0, y0, x1, y1, k, key) {   // Zeus' lightning: a gold zigzag with a black edge
  if (k <= 0) return; const R = RNG('bolt', key), P = [[x0, y0]];
  for (let i = 1; i < 7; i++) { const u = i / 7; P.push([lerp(x0, x1, u) + R.r(-60, 60), lerp(y0, y1, u)]); } P.push([x1, y1]);
  const n = Math.max(2, Math.ceil(P.length * k));
  for (const [c, w] of [[BF.black, 22], [BF.gold, 10]]) { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.beginPath(); P.slice(0, n).forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.stroke(); ctx.restore(); }
}
// a row of soldiers in step (one painted layer repeated, each with its own phase)
function file(name, x0, n, gap, h, o = {}) {
  for (let i = 0; i < n; i++) {
    const ph = i * 0.9 + (o.ph ?? 0), x = x0 + i * gap + (o.dx ?? 0), mv = o.walk ?? 0;
    bfLay(name, x, (o.y ?? FL) - walkBob(TT + ph, o.rate ?? 7) * mv, h * (o.scale ? o.scale(i) : 1), { flip: o.flip, rot: walkRock(TT + ph, o.rate ?? 7) * mv, ring: true, a: o.a });
  }
}

// =====================================================================
//  the beats
// =====================================================================
function sceneHome() {   // Odysseus turns from his wife and newborn son and walks off to war
  bfCam(panCam('home', 540, 600, 1.0, 1.06));
  const tLeave = CAP('to leave'), walkU = clamp((TT - tLeave - 0.3) / 2.2), wx = lerp(770, 1220, EZ.i2(walkU));
  const breath = 1 + 0.006 * Math.sin(TT * 2.1);
  bfLay('wife_baby.png', 290, FL, 1080, { sy: breath, sx: 1, ring: true });
  // he faces her (flipped), turns away on "to leave", then walks right out of the frame
  const sx = turnSx(tLeave, 0.3), moving = walkU > 0;
  bfLay('odysseus_stand.png', wx, FL - (moving ? walkBob(TT) : 0), 1130, { flip: true, sx, rot: moving ? walkRock(TT) : 0, ring: true });
  // the baby reaches after him: a little arm lift (a tiny bob of the bundle)
}
function sceneSail() {   // the ship sails out under an arc of suns and moons: years passing
  bfCam(panCam('sail', 520, 580, 1.0, 1.04));
  const n = 13;
  for (let i = 0; i < n; i++) {
    const t = SUB('sail') + 0.15 + i * 0.2, k = EZ.back(clamp((TT - t) / 0.3)); if (k <= 0) continue;
    const a = lerp(Math.PI * 1.05, Math.PI * 1.95, i / (n - 1)), x = 540 + Math.cos(a) * 470, y = 760 + Math.sin(a) * 380;
    if (i % 2) bfMoon(x, y, 30 * k); else bfSun(x, y, 26 * k, TT * 0.6);
  }
  bfLay('troy_city.png', 1010, 1330, 150, { a: 0.95 });
  bfWaveBand(1360, 'sw');
  const x = 380 + since('sail') * 70, rock = 0.03 * Math.sin(TT * 2.2), bob = 8 * Math.sin(TT * 2.2 + 1);
  bfLay('ship.png', x, 1420 + bob, 700, { rot: rock, ring: true });
  bfWaveBand(1500, 'sw2', 1);
}
function sceneSiege() {   // ten years before the walls: the city pans past, the army stands in rows
  const c = panCam('siege', 380, 700, 1.0, 1.03); bfCam(c);
  ctx.save(); ctx.translate((c.cx - 540) * 0.35, 0); bfLay('troy_city.png', 540, 1150, 620); ctx.restore();   // far: parallax
  file('soldier_spear.png', -160, 9, 170, 400, { y: 1430, walk: 0, ph: 0.3, a: 1 });
  file('soldier_spear.png', -240, 10, 160, 470, { y: FL, walk: 0, ph: 1.1 });
  // spears sway
}
function sceneThink() {   // he stops trying with strength: seated, chin on fist; then the close-up
  const tCut = CAP('to win') - 0.15;
  if (TT < tCut) {
    bfCam(panCam('think', 540, 540, 1.0, 1.08, 980, 940));
    bfLay('odysseus_think.png', 560, FL, 1080, { sy: 1 + 0.004 * Math.sin(TT * 1.8), ring: true });
  } else {
    const u = clamp((TT - tCut) / (SUBEND('think') - tCut));
    bfCam({ cx: 540, cy: lerp(900, 860, u), z: lerp(1.0, 1.08, EZ.io(u)) });
    bfLay('odysseus_bust.png', 520, FL + 10, 1330, { ring: true });
  }
}
function sceneHorse() {   // the horse is built plank by plank; the best men climb in; the army vanishes
  bfCam(panCam('horse', 500, 580, 1.0, 1.05));
  const tBuild = SUB('horse'), build = EZ.io(clamp((TT - tBuild) / 1.6));
  // the army marching away behind (on "to disappear")
  const tAway = CAP('and ordered') + 0.4, away = clamp((TT - tAway) / 2.2);
  if (TT > tAway - 0.5) file('soldier_spear.png', 300 + away * 900, 5, 120, 300, { y: 1300, walk: 1, ph: 0.4, a: 1 - away });
  bfLay('trojan_horse.png', 660, FL, 980, { clipTop: 1 - build, ring: true });
  // scaffold dust while it rises
  if (build < 1) for (let i = 0; i < 6; i++) { const R = RNG('dust', i, B); bfDot(400 + R.r(0, 520), FL - 980 * build + R.r(-20, 20), R.r(3, 7)); }
  const tIn = CAP('hid his'), lk = clamp((TT - tIn + 0.6) / 0.5);
  if (lk > 0) ladder(610, FL, 708, FL - 600, 48, EZ.o2(lk));
  // three men climb up the ladder and disappear into the hatch
  for (let i = 0; i < 3; i++) { const u = clamp((TT - tIn - i * 0.55) / 1.3); if (u <= 0 || u >= 1) continue;
    bfLay('soldier_spear.png', lerp(610, 708, u), lerp(FL, FL - 590, u), 300, { a: u > 0.85 ? (1 - u) / 0.15 : 1, rot: -0.1, ring: true }); }
  bfLay('odysseus_stand.png', 170, FL, 820, { ring: true, sy: 1 + 0.005 * Math.sin(TT * 2) });
}
function sceneTrojans() {   // the Trojans haul their "gift" to the gates, celebrate, go to sleep
  bfCam(panCam('trojans', 560, 480, 1.0, 1.04));
  const day = 1 - fadeIn(CAP('and went') - 0.6, 0.6);
  if (day > 0) { ctx.save(); ctx.globalAlpha = day; bfSun(880, 470, 50, TT * 0.4); ctx.restore(); }
  bfLay('temple.png', 320, 1290, 560, { a: 1 });
  ctx.fillStyle = BF.black; ctx.fillRect(-200, 1250, 1500, 42);   // the city's wall line
  for (let x = -200; x < 1300; x += 60) ctx.fillRect(x, 1225, 34, 30);
  const tDrag = SUB('trojans'), drag = EZ.io(clamp((TT - tDrag) / 4.0)), hx = lerp(1180, 790, drag);
  bfLay('trojan_horse.png', hx, FL - (drag < 1 ? 4 * Math.abs(Math.sin(TT * 5)) : 0), 860, { ring: true });
  const ex = hx - 690, cele = clamp((TT - CAP('celebrated') + 0.2) / 0.4);
  rope(ex + 150, FL - 330, hx - 330, FL - 260, 60);
  bfLay('trojan_elders.png', ex, FL - walkBob(TT, cele > 0 ? 9 : 5) * (drag < 1 || cele > 0 ? 1 : 0), 620, { flip: true, ring: true });
  // victory: olive leaves fall
  if (cele > 0) for (let i = 0; i < 10; i++) { const R = RNG('lf', i), u = mod((TT - CAP('celebrated')) * R.r(0.3, 0.5) + R.r(0, 1), 1); star4(R.r(80, 1000), lerp(300, 1500, u), 8, BF.black); }
}
function sceneNight() {   // they sleep; the moon rises; the hatch opens; Odysseus climbs down
  bfCam(panCam('night', 540, 560, 1.0, 1.05));
  const mk = fadeIn(SUB('night'), 0.6); if (mk > 0) { bfMoon(880, lerp(560, 430, mk), 48); bfStars(14, 'ns'); }
  ctx.fillStyle = BF.black; ctx.fillRect(-200, 1250, 1500, 42); for (let x = -200; x < 1300; x += 60) ctx.fillRect(x, 1225, 34, 30);
  bfLay('trojan_horse.png', 600, FL, 1000, { ring: true });
  bfLay('sleeping_trojan.png', 250, FL + 6, 230, { ring: true, sy: 1 + 0.02 * Math.sin(TT * 1.5) });
  bfLay('sleeping_trojan.png', 860, FL + 6, 210, { flip: true, ring: true, sy: 1 + 0.02 * Math.sin(TT * 1.3 + 1) });
  // the hatch opens and the ladder drops; Odysseus climbs down
  const tO = CAP('That night') + 0.4, lk = EZ.o2(clamp((TT - tO) / 0.6));
  if (lk > 0) ladder(649, FL - 620, 560, FL, 44, lk);
  const dn = clamp((TT - VW('night', 'odysseus') + 0.2) / 1.6);
  if (dn > 0) bfLay('odysseus_stand.png', lerp(640, 520, dn), lerp(FL - 300, FL, EZ.io(dn)), 400, { flip: true, ring: true });
}
function sceneGates() {   // he opens the gates; the Greek army pours in
  const c = panCam('gates', 540, 560, 1.06, 1.0); bfCam(c);
  const tOpen = SUB('gates') + 0.2, op = EZ.io(clamp((TT - tOpen) / 1.4));
  // what is behind the gates: the city at night and the army flooding through
  bfMoon(860, 420, 40);
  bfLay('troy_city.png', 540, 1300, 360, { a: 0.95 });
  const tArmy = CAP('and let') - 0.2;
  if (TT > tArmy) for (let i = 0; i < 6; i++) { const u = (TT - tArmy) * 0.45 - i * 0.16; if (u < 0) continue;
    bfLay('soldier_attack.png', lerp(1250, -300, u), FL - walkBob(TT + i, 9), 560 + (i % 2) * 60, { flip: true, rot: walkRock(TT + i, 9), ring: true }); }
  // the two door leaves hinge on the outer edges
  for (const s of [-1, 1]) { const hx = s < 0 ? 0 : 1080, sx = 0.705 * lerp(1, 0.16, op);
    ctx.save(); ctx.translate(hx, 0); bfLay('gate_door.png', 0, FL, 1300, { flip: s > 0, ax: 0, sx, ring: true }); ctx.restore(); }
  // Odysseus pushes the left leaf
  bfLay('odysseus_stand.png', lerp(330, 150, op), FL, 1000, { flip: true, ring: true, rot: -0.06 });
}
function sceneFire() {   // before sunrise: Troy burns; the slaughter
  const c = panCam('fire', 520, 580, 1.08, 1.0); bfCam(c);
  shake(HIT, 0.8, 14); shake(CAP('were slaughtered'), 0.5, 8);
  const burn = EZ.o2(clamp((TT - HIT) / 1.2));
  for (let i = 0; i < 4; i++) { const R = RNG('sm', i), u = mod(TT * 0.05 + i / 4, 1); bfLay('cloud.png', lerp(-100, 1180, u), lerp(760, 470, burn) - 60 * Math.sin(i), 150 + R.r(0, 60), { a: burn * 0.85, flip: i % 2 === 1 }); }
  bfLay('troy_city.png', 540, 1260, 640);
  flameRow(260, 1000, 300, burn, 'f1', { w: 0.6 }); flameRow(820, 980, 340, burn, 'f2', { w: 0.6 });
  bfFlames(540, 1260, 1000, 260, burn, 'cw');
  // the soldiers running through, with spears
  for (let i = 0; i < 7; i++) { const u = mod((TT - HIT) * 0.32 + i / 7, 1);
    bfLay('soldier_attack.png', lerp(-260, 1340, u), FL - walkBob(TT + i * 0.7, 9), 440 + (i % 3) * 40, { rot: walkRock(TT + i, 9), ring: true }); }
  // embers
  for (let i = 0; i < 24; i++) { const R = RNG('emb', i), u = mod(TT * R.r(0.2, 0.4) + R.r(0, 1), 1); bfDot(R.r(40, 1040) + Math.sin(TT * 2 + i) * 20, lerp(1300, 300, u), R.r(3, 6), i % 3 ? BF.black : BF.gold); }
}
function sceneMarch() {   // the Greeks enter Troy in victory; the gods watch (an eagle crosses the sky)
  const c = panCam('march', 460, 640, 1.0, 1.04); bfCam(c);
  ctx.save(); ctx.translate((c.cx - 540) * 0.3, 0);
  for (let i = 0; i < 3; i++) bfLay('cloud.png', mod(150 + i * 420 - TT * 25, 1500) - 200, 520 + i * 40, 150, { a: 0.8, flip: i % 2 === 1 }); bfLay('troy_city.png', 540, 1190, 520); flameRow(330, 900, 200, 1, 'm1', { w: 0.45 }); flameRow(760, 880, 220, 1, 'm2', { w: 0.45 });
  ctx.restore();
  file('soldier_spear.png', -40 + since('march') * 60, 6, 190, 560, { y: FL, walk: 1, rate: 6, ph: 0.2 });
  const tG = CAP('but the gods') - 0.2, gu = clamp((TT - tG) / 2.6);
  if (gu > 0 && gu < 1) bfLay('eagle.png', lerp(-200, 1300, gu), lerp(640, 520, gu) + 20 * Math.sin(TT * 4), 300, { rot: -0.05 + 0.08 * Math.sin(TT * 4), ring: true });
}
function scenePriestess() {   // men who crossed every sacred line: a priestess cast down, the temple broken
  bfCam(panCam('priestess', 540, 520, 1.04, 1.0));
  bfLay('temple.png', 330, 1180, 520, { a: 0.95, rot: -0.04 * EZ.o2(shotU('priestess')) });
  const fall = EZ.o2(clamp((TT - SUB('priestess')) / 1.2));
  bfLay('fallen_priestess.png', 470, FL - 120, 980, { ay: 0.85, rot: lerp(-0.25, 0.02, fall), ring: true });
  bfLay('soldier_attack.png', 1040, FL, 1100, { flip: true, ring: true, rot: 0.02 * Math.sin(TT * 2) });
  for (let i = 0; i < 6; i++) { const R = RNG('shard', i), u = clamp((TT - SUB('priestess') - R.r(0, 0.6)) / 1.2); bfDot(lerp(600, 600 + R.r(-300, 300), u), lerp(1000, FL - 10, EZ.i2(u)), R.r(6, 12)); }
}
function sceneLie() {   // the perfect weapon: a lie disguised as a gift — the horse's head, then the horse in flames
  const tBack = CAP('a lie') - 0.1, u = clamp((TT - tBack) / 1.2);
  if (TT < tBack) { bfCam({ cx: 520, cy: lerp(820, 760, shotU('lie')), z: 1.0 }); bfLay('trojan_horse.png', 1315, 2768, 2400, { ring: true }); return; }
  bfCam({ cx: 540, cy: 960, z: lerp(1.15, 1.0, EZ.o2(u)) });
  bfMoon(880, 430, 44);
  bfLay('trojan_horse.png', 560, FL - 30, 1040, { ring: true });
  flameRow(540, FL + 6, 300, EZ.o2(clamp((TT - CAP('disguised') + 0.3) / 0.6)), 'lf');
  bfFlames(540, FL, 1000, 200, clamp((TT - CAP('disguised')) / 0.8), 'lf2');
}
function sceneGuilt() {   // he knew: Zeus on his cloud points down; the guilt
  const tZ = CAP('sacred law') - 0.3, tB = CAP("Zeus's") - 0.05, tG = CAP('He knew that') - 0.1;
  const z = EZ.io(clamp((TT - tG) / 2.0));
  bfCam({ cx: lerp(560, 460, z) + 5 * Math.sin(TT * 0.4), cy: lerp(960, 1080, z), z: lerp(1.0, 1.18, z) });
  const zk = EZ.o2(clamp((TT - tZ) / 0.8));
  if (zk > 0) { ctx.save(); ctx.globalAlpha = zk; const zy = lerp(960, 900, zk) + 8 * Math.sin(TT * 1.2);
    bfLay('cloud.png', 800, zy + 70, 220); bfLay('zeus.png', 820, zy, 600, { ring: true }); bfLay('cloud.png', 850, zy + 120, 170, { flip: true }); ctx.restore(); }
  const bk = clamp((TT - tB) / 0.25);
  if (bk > 0 && TT < tB + 0.9) { bolt(720, 560, 400, FL - 640, bk, 'z1'); if (TT < tB + 0.15) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,230,170,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  bfLay('odysseus_guilt.png', 320, FL, 900, { ring: true, sy: 1 + 0.006 * Math.sin(TT * 1.4) });
}
function sceneVoyage() {   // every mile home: the ship at sea, birds of the gods circling, clouds
  bfCam(panCam('voyage', 520, 560, 1.0, 1.03));
  for (let i = 0; i < 3; i++) bfLay('cloud.png', mod(200 + i * 420 - TT * 20, 1500) - 200, 520 + i * 70, 150 + i * 30, { flip: i % 2 === 1 });
  for (let i = 0; i < 2; i++) { const a = TT * 0.9 + i * Math.PI; bfLay('eagle.png', 540 + Math.cos(a) * 340, (TT > SUB('banner') - 0.5 ? 430 : 560) + Math.sin(a) * (TT > SUB('banner') - 0.5 ? 70 : 120), 210, { flip: Math.sin(a) > 0, rot: 0.08 * Math.sin(TT * 5 + i), ring: true }); }
  bfWaveBand(1330, 'vw');
  bfLay('ship.png', 540 + 20 * Math.sin(TT * 0.5), 1400 + 10 * Math.sin(TT * 2), 760, { rot: 0.035 * Math.sin(TT * 1.9), ring: true });
  bfWaveBand(1480, 'vw2');
}
function sceneBanner() {   // the title on the ribbon over the ship
  sceneVoyage();
  bfRibbon('The Odyssey', SUB('banner') + 0.2, SUBEND('banner'));
}
function sceneSign() { bfSignoff(SIGN_T); }

const SCENES = { home: sceneHome, sail: sceneSail, siege: sceneSiege, think: sceneThink, horse: sceneHorse, trojans: sceneTrojans, night: sceneNight, gates: sceneGates, fire: sceneFire, march: sceneMarch, priestess: scenePriestess, lie: sceneLie, guilt: sceneGuilt, voyage: sceneVoyage, banner: sceneBanner, sign: sceneSign };
function sceneStage() { bfStripStage(SCENES); }
