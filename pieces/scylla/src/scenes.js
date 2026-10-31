// =====================================================================
//  SCENES — Scylla and Charybdis (amphora-bf, Flow layers). The ground and its friezes (assets/bg.jpg) are fixed on screen;
//  the picture slides right panel to panel. Each panel is clipped only vertically (inside the friezes), so a
//  layer that overhangs its panel stays whole across the slide. Feet on FL. Nothing pops in: things walk in,
//  rise, fall, grow or fade.
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const shotU = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const since = (id) => TT - SUB(id);
const FL = 1640, PIC0 = 156, PIC1 = 1652;
const breath = (x) => 1 + 0.008 * Math.sin(TT * 1.7 + x * 0.013);
// a figure that breathes and sways a little
function fig(n, x, h, o = {}) { bfLay(n + '.webp', x, o.y ?? FL, h, { ...o, sy: (o.sy ?? 1) * (o.still ? 1 : breath(x)), rot: (o.rot ?? 0) + (o.still ? 0 : 0.005 * Math.sin(TT * 1.2 + x * 0.01)) }); }
// a seamless pose change: the body stays, only the part that differs fades (assets from posepair.py)
function pose(a, b, t, x, h, o = {}) {
  const u = EZ.io(clamp((TT - t) / 0.12)), v = EZ.io(clamp((TT - t) / 0.7));
  if (u <= 0) return fig(a, x, h, o); if (v >= 1) return fig(b, x, h, o);
  fig(a + '_c', x, h, o); fig(b + '_c', x, h, { ...o, a: v }); fig(a + '_d', x, h, { ...o, a: 1 - u }); fig(b + '_d', x, h, { ...o, a: u });
}
// walking in from a side: position, a step bob and a rock while moving
function walkIn(x0, x1, t0, d) { const u = EZ.o3(clamp((TT - t0) / d)), mv = u < 1 ? 1 - u : 0; return { x: lerp(x0, x1, u), dy: -Math.abs(Math.sin(TT * 6.5)) * 14 * mv, rot: 0.03 * Math.sin(TT * 6.5) * mv }; }
function glow(x, y, r, c, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
// Zeus' thunderbolt: a jagged gold zigzag with a black edge, flickering
function bolt(x0, y0, x1, y1, k, key) {   // Zeus' lightning: sharp zigzag strokes with forks, a white-gold core and a glow
  if (k <= 0) return;
  const R = RNG('bolt', key, Math.floor(TT * 16)), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const zig = (ax, ay, bx, by, n, amp) => { const P = [[ax, ay]]; for (let i = 1; i < n; i++) { const u = i / n, o = (i % 2 ? 1 : -1) * amp * R.r(0.6, 1.2); P.push([lerp(ax, bx, u) + nx * o, lerp(ay, by, u) + ny * o]); } P.push([bx, by]); return P; };
  const main = subPath(zig(x0, y0, x1, y1, 7, 70), k), forks = [];
  for (const f of [0.3, 0.55, 0.75]) { if (k < f + 0.1) continue; const p = pointAt(main, f / k), a = Math.atan2(dy, dx) + (R.f() < 0.5 ? 0.6 : -0.6); forks.push(zig(p[0], p[1], p[0] + Math.cos(a) * 160, p[1] + Math.sin(a) * 160, 4, 22)); }
  ctx.save(); ctx.lineJoin = 'miter'; ctx.lineCap = 'round';
  const poly = (P) => { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const q of P) ctx.lineTo(q[0], q[1]); ctx.stroke(); };   // straight segments: sharp zigzags
  const pass = (w, c, a) => { ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = w; poly(main); ctx.lineWidth = w * 0.55; for (const F of forks) poly(F); };
  ctx.shadowColor = 'rgba(255,230,150,0.9)'; ctx.shadowBlur = 40; pass(30, 'rgba(255,210,110,0.5)', 1); ctx.shadowBlur = 0;
  pass(18, BF.black, 1); pass(10, BF.gold, 1); pass(4, '#fff6dc', 1);
  ctx.restore();
}

function snow(key, n = 50) { for (let i = 0; i < n; i++) { const R = RNG('sn', key, i), x = mod(R.r(0, 1200) + Math.sin(TT * 0.8 + i) * 30, 1200) - 60, y = PIC0 + mod(R.r(0, 1500) + TT * R.r(40, 90), 1500); bfDot(x, y, R.r(3, 6), BF.white); } }
function fog(k, key) { if (k <= 0) return; for (let i = 0; i < 9; i++) { const R = RNG('fog', key, i), x = R.r(0, 1080) + Math.sin(TT * 0.5 + i) * 60, y = R.r(500, 1600) - TT * 8; ctx.save(); ctx.globalAlpha = 0.5 * k; glow(x, y, R.r(220, 380), 'rgba(23,11,18,A)', 0.9); ctx.restore(); } }

// =====================================================================
//  the sea, cliffs, the whirlpool and the ship (code), then the panels (panel coords = screen coords)
// =====================================================================
// the black sea: a band with a running-wave crest along its top and orange incised swell lines
function sea(y0, y1 = PIC1 + 10, key = 's', speed = 40) {
  const sh = (TT * speed) % 120;
  ctx.save(); ctx.fillStyle = BF.black; ctx.fillRect(-20, y0 + 26, W + 40, y1 - y0 - 26);
  for (let x = -240 + sh; x < W + 120; x += 120) { const yy = y0 + 26 + 6 * Math.sin(TT * 1.4 + x * 0.02);
    ctx.beginPath(); ctx.moveTo(x, yy + 30); ctx.quadraticCurveTo(x + 30, yy - 40, x + 80, yy - 10); ctx.quadraticCurveTo(x + 60, yy - 30, x + 48, yy - 10); ctx.quadraticCurveTo(x + 70, yy + 10, x + 120, yy + 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x + 66, yy - 6, 9, Math.PI * 0.2, Math.PI * 1.7); ctx.stroke(); }
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.globalAlpha = 0.7;
  for (let r = 1; r < 6; r++) { const y = y0 + 40 + r * 46; if (y > y1 - 10) break; ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 20) { const yy = y + 5 * Math.sin(x * 0.012 + TT * (1 + r * 0.2) + r); x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
  ctx.restore();
}
// a jagged black cliff rising from the sea at one edge (side -1 = left, 1 = right), with incised cracks
function cliff(side, xIn, top, key, base = PIC1 + 10) {
  const R = RNG('cl', key), xe = side < 0 ? -30 : W + 30, P = [[xe, base], [xe, top]];
  const n = 9; for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(xe, xIn, Math.min(1, u * 1.6)) + R.r(-25, 25), y = lerp(top, base, u) + R.r(-20, 20); P.push([u > 0.62 ? xIn + side * R.r(-10, 40) : x, y]); }
  ctx.save(); ctx.fillStyle = BF.black; ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineTo(xIn, base); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = BF.inc; ctx.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const y = lerp(top + 80, base - 120, i / 6), x = lerp(xe, xIn, R.r(0.2, 0.75)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + side * R.r(20, 60), y + R.r(40, 90)); ctx.lineTo(x + side * R.r(-10, 30), y + R.r(110, 170)); ctx.stroke(); }
  ctx.restore();
}
// Charybdis seen in perspective: the painted spiral squashed into an ellipse and turning
function whirl(x, y, wd, k = 1, spin = 1) {
  const im = asset('charybdis.webp'); if (!im || k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.34); ctx.rotate(-TT * 0.9 * spin); ctx.globalAlpha *= k; const s = wd * (0.92 + 0.08 * k); ctx.drawImage(im, -s / 2, -s / 2, s, s); ctx.restore();
}
// the galley riding the swell: (x, y) = waterline centre; returns the deck and the bow
function ship(x, y, wd, o = {}) {
  const im = asset('ship.webp'); if (!im) return {};
  const h = wd * im.naturalHeight / im.naturalWidth, rot = (o.rot ?? 0) + 0.02 * Math.sin(TT * 1.3 + x * 0.01), yy = y + 8 * Math.sin(TT * 1.6 + x * 0.01);
  if (o.before) o.before(x, yy - h * 0.22, rot);
  bfLay('ship.webp', x, yy + h * 0.1, h, { rot, flip: o.flip, a: o.a });
  return { deck: yy - h * 0.22, bow: x + (o.flip ? -1 : 1) * wd * 0.38 };
}
// a small figure in a man's place: a thrown spear (a black shaft with an orange edge)
function spear(x0, y0, ang, len = 300) { ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ctx.fillStyle = BF.black; ctx.fillRect(-len / 2, -5, len, 10); ctx.beginPath(); ctx.moveTo(len / 2, -14); ctx.lineTo(len / 2 + 46, 0); ctx.lineTo(len / 2, 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2, 0); ctx.stroke(); ctx.restore(); }
// the six necks of Scylla (assets/head0..5, cut from one painting; split.json keeps where each sat)
const SPLIT = { head0: [10, 0, 136, 878], head1: [119, 0, 152, 1043], head2: [237, 0, 138, 830], head3: [361, 0, 153, 1008], head4: [457, 0, 142, 810], head5: [572, 0, 141, 973] }, HW = 723, HH = 1053;
function necks(cx, yTop, h, f) {   // f(i) -> { dy, rot, a }
  const s = h / HH;
  for (let i = 0; i < 6; i++) { const [x, y, w, hh] = SPLIT['head' + i], o = f(i); if (o.a === 0) continue;
    ctx.save(); ctx.translate(cx + (x + w / 2 - HW / 2) * s + (o.dx ?? 0), yTop + o.dy); ctx.rotate(o.rot ?? 0); if (o.a != null) ctx.globalAlpha *= o.a;
    const im = asset('head' + i + '.webp'); if (im) ctx.drawImage(im, -w * s / 2, y * s, w * s, hh * s); ctx.restore(); }
}

function pStrait() {   // the ship enters the strait between two cliffs; Odysseus on the bow
  cliff(-1, 170, 520, 'a'); cliff(1, 900, 380, 'b');
  sea(1330, PIC1 + 10, 'st');
  const x = lerp(220, 560, EZ.io(clamp(since('strait') / 4.5)));
  ship(x, 1380, 640, { before: (sx, deck) => fig('ody', sx + 640 * 0.33, 200, { y: deck + 40, still: true }) });
}
function pCharybdis() {   // the whirlpool swallows the sea; a far ship is dragged round and down
  const k = EZ.o2(clamp(since('charybdis') / 1.2));
  sea(1120, PIC1 + 10, 'ch', 60);
  prop('figtree', 860, 980, 360);
  whirl(470, 1400, 1100, k, 1 + k);
  const t0 = VW('charybdis', 'every') - 0.7, u = clamp((TT - t0) / 2.0);
  if (TT > t0 - 2) { const a = (TT < t0 ? 0 : u) * 9.5, r = lerp(460, 10, EZ.i2(u)), sx = 470 + Math.cos(a) * r, sy = 1400 + Math.sin(a) * r * 0.34 - 50 * (1 - u);
    bfLay('ship.webp', sx, sy, lerp(150, 30, u), { rot: Math.sin(a) * 0.4 * u, a: 1 - clamp((u - 0.85) / 0.15), flip: Math.cos(a) > 0 && u > 0, ring: true }); }
}
function pScylla() {   // the cliff rises; the six heads sway out of the cave
  const r = EZ.o3(clamp(since('scylla') / 1.4)), im = asset('scylla.webp');
  sea(1450, PIC1 + 10, 'sc');
  ctx.save(); ctx.translate(820, lerp(PIC1 + 300, PIC1 + 20, r)); ctx.rotate(0.012 * Math.sin(TT * 1.5)); bfLay('scylla.webp', 0, 0, 1180, { ax: 0.62 }); ctx.restore();
  const tT = VW('scylla', 'teeth') - 0.1; if (TT > tT && TT < tT + 0.5) glow(420, 1000, 380, 'rgba(255,200,120,A)', 0.3 * (1 - (TT - tT) / 0.5));
}
function pCirce() {   // Circe warns him, pointing; he listens
  fig('ody', 250, 960);
  const w = walkIn(1350, 840, SUB('circe') + 0.2, 1.4);
  fig('circe', w.x, 1000, { y: FL + w.dy, rot: w.rot });
  const k = fadeIn(VW('circe', 'choose') - 0.1, 0.4); glow(560, 760, 180, 'rgba(255,220,150,A)', 0.4 * k * (1 - clamp((TT - VW('circe', 'choose') - 0.6) / 0.8)));
}
function pPrice() {   // the scales: the whole ship against six men
  const tS = VW('price', 'ship') - 0.1, tM = VW('price', 'men') - 0.1;
  const tilt = TT < tS ? 0.03 * Math.sin(TT * 2) : TT < tM ? -0.16 * EZ.o3(clamp((TT - tS) / 0.6)) : lerp(-0.16, 0.1, EZ.o3(clamp((TT - tM) / 0.8))) + 0.015 * Math.sin(TT * 3);
  const cx = 540, cy = 860, L = 380;
  ctx.save(); ctx.fillStyle = BF.black; ctx.fillRect(cx - 12, cy, 24, FL - cy - 40); ctx.beginPath(); ctx.moveTo(cx - 140, FL); ctx.lineTo(cx, FL - 70); ctx.lineTo(cx + 140, FL); ctx.closePath(); ctx.fill();
  ctx.translate(cx, cy); ctx.rotate(tilt); ctx.fillRect(-L, -10, L * 2, 20); bfDot(0, 0, 24, BF.black); ctx.strokeStyle = BF.inc; ctx.lineWidth = 2; ctx.strokeRect(-L + 10, -4, L * 2 - 20, 8); ctx.restore();
  for (const s of [-1, 1]) { const ex = cx + Math.cos(tilt) * L * s, ey = cy + Math.sin(tilt) * L * s, py = ey + 330;
    ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 120, py); ctx.moveTo(ex, ey); ctx.lineTo(ex + 120, py); ctx.stroke();
    ctx.fillStyle = BF.black; ctx.beginPath(); ctx.ellipse(ex, py, 150, 34, 0, 0, Math.PI); ctx.fill(); ctx.restore();
    if (s < 0) bfLay('ship.webp', ex, py + 4, 150, { a: fadeIn(tS - 0.2, 0.4) });
    else for (let i = 0; i < 6; i++) { const a = fadeIn(tM - 0.2 + i * 0.05, 0.3); if (a > 0) bfLay('sailor' + (i % 3) + '.webp', ex - 110 + i * 44, py + 4, 120, { a }); }
  }
}
function pChoice() {   // he turns away from his crew and says nothing; they row on
  sea(1470, PIC1 + 10, 'cs');
  ship(790, 1500, 520);
  const k = EZ.io(clamp((TT - VW('choice', 'nothing') + 0.3) / 0.5));   // he turns his back on them (a crossfade, never a squash)
  if (k < 1) fig('ody', 320, 1000, { a: 1 - k }); if (k > 0) fig('ody', 320, 1000, { flip: true, a: k });
}
function pArmour() {   // he puts on the helmet, takes the spears; the bronze flashes
  const tA = VW('armour', 'armour') - 0.1, u = EZ.io(clamp((TT - tA) / 0.5));
  if (u < 1) fig('ody_helmet', 470, 1040, { a: 1 - u }); if (u > 0) fig('ody', 470, 1040, { a: u });
  const tS = VW('armour', 'spears') - 0.1; if (TT > tS) glow(700, 520, 160, 'rgba(255,230,170,A)', 0.55 * (1 - clamp((TT - tS) / 0.6)));
  if (TT > tA && TT < tA + 0.6) glow(560, 700, 260, 'rgba(255,220,150,A)', 0.35 * (1 - (TT - tA) / 0.6));
}
function pSteer() {   // three of his men stare over the side at the whirlpool, terrified
  sea(1160, PIC1 + 10, 'sr', 70);
  whirl(330, 1330, 760, 1, 1.6);
  ctx.save(); ctx.fillStyle = BF.black; ctx.fillRect(-20, 1500, W + 40, 200); ctx.strokeStyle = BF.inc; ctx.lineWidth = 3; ctx.strokeRect(-10, 1515, W + 20, 30);
  for (let x = 30; x < W; x += 110) { ctx.beginPath(); ctx.arc(x, 1590, 12, 0, TAU); ctx.stroke(); } ctx.restore();
  [[600, 0, 0.4], [800, 1, 0.8], [960, 2, 1.2]].forEach(([x, i, d]) => { const k = EZ.o3(clamp((since('steer') - d * 0.4) / 0.6)), sh = TT > VW('steer', 'terror') ? 4 * Math.sin(TT * 31 + i) : 0;
    fig('sailor' + i, x + sh, 470, { y: lerp(1720, 1510, k) }); });
}
function pHeads() {   // THE STRIKE: the six heads drop on the ship and snatch six men
  sea(1180, 1330, 'hd');
  ship(540, 1230, 860);
  necks(540, 0, 1100, (i) => { const t = HIT + [0, 0.1, 0.04, 0.14, 0.07, 0.17][i], d = EZ.i2(clamp((TT - t + 0.25) / 0.25)), up = EZ.o2(clamp((TT - t - 0.35) / 0.9));
    const w = EZ.io(clamp((TT - HIT - 1.3) / 1.0)), rise = 200 * EZ.io(clamp((TT - VL('lifted').t0 + 0.25) / 5.5));   // then they hang there, thrashing, and climb
    return { dy: lerp(-1300, 150, d) - up * 230 - rise + w * 30 * Math.sin(TT * 2.2 + i * 1.3), dx: w * 18 * Math.sin(TT * 1.7 + i * 2.1), rot: lerp(0.04 * Math.sin(TT * 4 + i), 0.05 * Math.sin(TT * 1.9 + i), w), a: TT < t - 0.3 ? 0 : 1 }; });
  if (TT > HIT && TT < HIT + 0.45) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - (TT - HIT) / 0.45); ctx.fillStyle = '#fff0d0'; ctx.fillRect(0, PIC0, W, PIC1 - PIC0); ctx.restore(); }
  for (let i = 0; i < 14; i++) { const R = RNG('sp', i), t = TT - HIT - R.r(0, 0.2); if (t < 0 || t > 1) continue; bfDot(540 + R.r(-430, 430), 1200 - t * R.r(200, 420) + t * t * 500, R.r(6, 12) * (1 - t), BF.black); }
}
function pLifted() {   // six men lifted into the air, struggling, calling his name
  sea(1180, 1330, 'lf');
  ship(540, 1230, 860);
  const u = EZ.io(clamp(since('lifted') / 5.5));
  necks(540, -80 - u * 200, 1100, (i) => ({ dy: 0 + 30 * Math.sin(TT * 2.2 + i * 1.3), dx: 18 * Math.sin(TT * 1.7 + i * 2.1), rot: 0.05 * Math.sin(TT * 1.9 + i) }));
}
function pSave() {   // the last feet vanish upward; he hurls a spear at the empty sky, then lowers his head
  const out = EZ.i2(clamp((since('save') + 0.3) / 0.6));
  necks(700, -480 - out * 1200, 1100, (i) => ({ dy: 0, rot: 0.04 * Math.sin(TT * 2 + i), a: 1 - out }));
  const tT = VW('save', 'save') - 0.2, g = EZ.io(clamp((TT - tT - 0.15) / 0.35));
  if (g < 1) fig('ody_throw', 380, 1000, { a: 1 - g }); if (g > 0) fig('ody_grief', 380, 1000, { a: g });
  const f = clamp((TT - tT) / 0.8); if (f > 0 && f < 1) spear(lerp(640, 1180, f), lerp(640, -100, f), -0.95, 300);
}
function pSilence() {   // out of the strait: the ship rows away on a calm sea
  const u = EZ.io(clamp(since('silence') / 5));
  cliff(-1, lerp(240, -80, u), 420, 'c'); cliff(1, lerp(880, 1180, u), 520, 'd');
  sea(1330, PIC1 + 10, 'sl', 25);
  ship(lerp(330, 640, u), 1380, 560);
}
function pPitiful() {   // he stands alone, head bowed
  const u = EZ.io(clamp(since('pitiful') / 6));
  bfLay('scylla.webp', lerp(960, 1010, u), 1480, 470, { a: 0.9 - 0.4 * u });   // the cliff far behind, falling away
  sea(1440, PIC1 + 10, 'pt', 15);
  ship(lerp(400, 470, u), 1490, 780, { before: (sx, deck) => fig('ody_grief', sx - 780 * 0.3, 470, { y: deck + 60 }) });
}
function pSign() { bfSignoff(SIGN_T); }
// a centred layer (sets, groups): centre (x, y), width wd
function prop(n, x, y, wd, o = {}) { const im = asset(n + '.webp'); if (!im) return; const h = wd * im.naturalHeight / im.naturalWidth; ctx.save(); if (o.a != null) ctx.globalAlpha *= o.a; ctx.drawImage(im, x - wd / 2, y - h / 2, wd, h); ctx.restore(); }

// captions (Dalek Pinpoint, brown): a phrase at a time, up to two lines, each word written on its spoken word,
// the phrase complete on screen until the next one; placed per panel just above the figures
const K_FONT = '"DalekPinpointBold", "Dalek Pinpoint", Georgia, serif', K_SIZE = 78, K_LH = 92, K_MAXW = 760;
const CAP_LAST = { strait: 560, charybdis: 560, scylla: 470, circe: 560, price: 600, choice: 560, armour: 520, steer: 620, heads: 1470, lifted: 1470, save: 560, silence: 600, pitiful: 520 };
const KCH = [];
for (const L of VOICE.lines) { const ws = L.text.split(/\s+/); let cur = null;
  ws.forEach((w, i) => { const t = L.words[i] ? L.words[i].t0 : L.t0; if (!cur) { cur = { id: L.id, ws: [], ts: [] }; KCH.push(cur); } cur.ws.push(w); cur.ts.push(t);
    if ((/[.:;?!]$/.test(w) && cur.ws.length >= 3) || (/,$/.test(w) && cur.ws.length >= 4) || cur.ws.length >= 7) cur = null; }); }
// each phrase appears only once the previous one has finished writing (its last word + 0.45s), so none is cut
KCH.forEach((c, i) => { const prev = i > 0 && KCH[i - 1].id === c.id ? KCH[i - 1] : null; c.show = Math.max(c.ts[0] - 0.12, prev ? prev.ts[prev.ts.length - 1] + 0.45 : -1); });
function kLayout(ws, size = K_SIZE) { ctx.font = `${size}px ${K_FONT}`; ctx.letterSpacing = '3px'; const sp = ctx.measureText(' ').width, items = ws.map((w) => ({ w, ww: ctx.measureText(w).width })), lines = [[]]; let lw = 0;
  for (const it of items) { if (lw + it.ww > K_MAXW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(it); lw += it.ww + sp; } return { lines, sp }; }
function kCaptions(pi) {
  const id = IDS[pi], dx = BF_PDX; if (id === 'sign') return;
  const mine = KCH.filter((c) => c.id === id || (id === 'heads' && c.id === 'lifted'));   // the strike and the lifting share one panel
  mine.forEach((c, k) => {
    const t0 = c.show, last = k + 1 >= mine.length, tEnd = last ? SUBEND(id) + BF_SLIDE : mine[k + 1].show;
    if (TT < t0 || TT >= tEnd) return;
    const a = last ? 1 : bfFadeOut(tEnd - 0.14, 0.12);
    bfOverlay(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, dx, 0); ctx.textBaseline = 'alphabetic';
      let size = K_SIZE, lay = kLayout(c.ws, size); while (lay.lines.length > 2 && size > 50) { size -= 4; lay = kLayout(c.ws, size); }
      const { lines, sp } = lay, lh = K_LH * size / K_SIZE, yLast = Math.max(CAP_LAST[id] ?? 560, 230 + size * 0.75 + (lines.length - 1) * lh); let n = 0;
      ctx.globalAlpha = a;
      lines.forEach((L, li) => { const tw = L.reduce((s, it) => s + it.ww, 0) + sp * (L.length - 1); let x = 520 - tw / 2; const y = yLast - (lines.length - 1 - li) * lh;
        for (const it of L) { const wt = Math.max(c.ts[n++], c.show + 0.04 * n); kPen(it.w, x, y, it.ww, clamp((TT - wt + 0.06) / 0.22), size); x += it.ww + sp; } });
      ctx.restore();
    });
  });
}
// a word written by hand in the ref's brown (no white, no heavy shadow)
function kPen(str, x, y, ww, prog, size) {
  if (prog <= 0) return; ctx.save();
  if (prog < 1) { const xe = x - 6 + (ww + 12) * EZ.io(prog), sl = size * 0.25; ctx.beginPath(); ctx.moveTo(x - 40, y + size * 0.8); ctx.lineTo(xe - sl * 0.6, y + size * 0.8); ctx.lineTo(xe + sl, y - size * 1.2); ctx.lineTo(x - 40, y - size * 1.2); ctx.closePath(); ctx.clip(); }
  ctx.fillStyle = 'rgba(255,200,150,0.35)'; ctx.fillText(str, x + 2, y + 2);
  ctx.fillStyle = '#6e2a18'; ctx.fillText(str, x, y);
  ctx.restore();
}
const PANELS = { strait: pStrait, charybdis: pCharybdis, scylla: pScylla, circe: pCirce, price: pPrice, choice: pChoice, armour: pArmour, steer: pSteer, heads: pHeads, save: pSave, silence: pSilence, pitiful: pPitiful, sign: pSign };
function sceneStage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawAsset('bg.jpg', 0, 0, W, H);   // the ground and its friezes stay put
  const p = bfStripPos(), off = p * W, i0 = Math.min(IDS.length - 1, Math.floor(p)), i1 = Math.min(IDS.length - 1, i0 + 1);
  for (const i of i0 === i1 ? [i0] : [i0, i1]) {
    BF_PDX = i * W - off;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, BF_PDX, 0);
    ctx.beginPath(); ctx.rect(0, PIC0, W, PIC1 - PIC0); ctx.clip();   // every layer fits inside its own panel, so this never cuts one

    PANELS[IDS[i]]();
    ctx.restore();
    kCaptions(i);
  }
  BF_PDX = 0;
}
