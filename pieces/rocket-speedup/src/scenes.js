// =====================================================================
//  SCENES — the outside pass, the cockpit pass, post, HUD (left: SPEED + NEXT; right: YOUR CLOCK / EARTH CLOCK), captions.
// =====================================================================
// captions: [story time, text]; each holds until the next one (max 6.5 s)
const CAPS = [
  [6.6, 'The engine is set to 1 g. Forever.'], [11, 'Your family is in the crowd.'], [19.55, 'Two seconds.'], [22.0, 'Liftoff.'], [30, 'It feels like standing on Earth.'],
  [37.5, 'Through the clouds.'], [44.6, 'Faster than sound.'], [52, 'Above the weather.'], [58, 'The sky is getting darker.'], [67, 'The sky goes black.'],
  [77, 'You never feel lighter. The engine holds 1 g.'], [89.6, 'Orbital speed. Time to switch off.'], [93.3, 'It won\'t switch off.'], [97.0, 'Faster than any human has ever gone.'], [102, 'Escape speed. Earth can\'t hold you now.'],
  [110, 'The engine never tires. Neither do you.'], [119, 'Every hour, 35 km/s faster.'], [128.1, 'The Moon. Two and a half hours in.'],
  [140, 'You still weigh exactly what you did at home.'], [149, 'Earth is a blue dot on the rear camera.'], [158, 'Past the fastest probe ever built.'],
  [166, 'Nothing out here slows you down.'], [173, 'A comet. It barely moves. You do.'], [181, 'The Sun is shrinking behind you.'], [190, 'Mars, in two and a half days.'],
  [195.6, 'The asteroid belt. Mostly empty space.'], [200.6, 'Jupiter, heavier than all the other planets together.'], [208.6, 'Saturn, close enough to read its rings.'], [214, 'The Sun is just a bright star now.'], [222, 'Pluto, in thirteen days.'],
  [229, 'The Kuiper belt: ice left over from the start.'], [240, 'Voyager took 49 years to get here. You took 27 days.'], [250, 'Space isn\'t empty. At this speed, it hurts.'],
  [257, 'Thin gas, hitting like radiation.'], [266, 'The stars ahead are turning blue.'], [274, 'Every speck of dust is a bullet now.'], [283, 'Your clock and Earth\'s are starting to disagree.'],
  [295, 'A grain of sand would hit like a bomb.'], [304, 'Faster. Still faster.'], [318, 'Proxima Centauri. 2.3 years for you. 5.1 for Earth.'], [325.2, ''], [328.5, 'It held.'],
  [340, 'Everything ahead, squeezed into a ring.'], [355, 'Light from behind can barely catch you.'], [368, 'The stars ahead shift past blue, out of sight.'],
  [384.4, 'The centre of the galaxy. 26,000 years have passed at home.', 3.2], [395, 'You feel nothing but the same 1 g.'], [415, 'Out of the Milky Way. 12 years in.'],
  [425, 'Every star you have ever seen is back there.'], [444.4, 'Andromeda. Two and a half million years, back home.', 3.0], [455, 'You never turned it off.'],
  [468.1, 'You\'ve been gone 20 years.', 3.2], [480.2, 'You: 22 years. Earth: five billion.'], [487, 'The Sun has swallowed it.'],
];
function captions(st) {
  if (TT < TEASE.t1) { hdCaption('You can\'t turn it off.', 1.0, 5.0); return; }
  for (let i = 0; i < CAPS.length; i++) {
    const [t0, s, dur] = CAPS[i], t1 = Math.min(i + 1 < CAPS.length ? CAPS[i + 1][0] - 0.6 : 497, t0 + (dur ?? 6.5));
    if (s && st >= t0 && st < t1) { const ca = Math.min(ev(t0, 0.45), 1 - ev(t1 - 0.45, 0.45)), w = hdWidth(s, 54, { italic: true }), f = () => hdBlob(W / 2, HD.capY - 18, w * 0.62 + 120, 86, ca);
      if (DEFER) DEFER.push(f); else f(); hdCaption(s, t0, t1); }
  }
}
// ---- numbers
function fmtDur(s) {
  s = Math.max(0, s);
  if (s < 60) return [String(Math.floor(s)), 's'];
  if (s < 3600) return [`${Math.floor(s / 60)} min ${String(Math.floor(s % 60)).padStart(2, '0')}`, 's'];
  if (s < DAY) return [`${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`, 'min'];
  if (s < YEAR) return [String(Math.floor(s / DAY)), Math.floor(s / DAY) === 1 ? 'day' : 'days'];
  const y = s / YEAR;
  if (y < 100) return [y.toFixed(1), 'years'];
  if (y < 1e6) return [hdNum(y), 'years'];
  const e = Math.floor(Math.log10(y)) - 1, r = Math.round(y / Math.pow(10, e)) * Math.pow(10, e);   // 2 significant figures
  return [hdNum(r), 'years'];
}
function fmtSpeed(tau) {
  const v = speedOf(tau), ob = oneMinusBeta(tau);
  if (v < 343) return [hdNum(v * 3.6), 'km/h', v < 1 ? 'on the pad' : `Mach ${(v / 343).toFixed(2)}`];
  if (v < 11000) return [hdNum(v * 3.6), 'km/h', `Mach ${(v / 343).toFixed(1)}`];
  if (v < 0.01 * CLIGHT) return [hdNum(v / 1000), 'km/s', `${(100 * v / CLIGHT).toFixed(2)}% of light speed`];
  if (ob > 1e-4) return [(100 * (1 - ob)).toFixed(ob > 1e-2 ? 1 : 3), '% c', 'of the speed of light'];
  const n = Math.floor(-Math.log10(ob));
  return ['99.99…', '% c', `${n} nines after the point`];
}
// glass fact cards at the milestones (story time, card)
const FACTS = [
  [97, { title: 'Fastest humans ever', value: '39,897', unit: 'km/h', lines: ['Apollo 10 · 26 May 1969', 'Guinness World Records'] }],
  [158, { title: 'Parker Solar Probe', value: '635,266', unit: 'km/h', lines: ['The fastest object ever built', 'NASA, 2024'] }],
  [240, { title: 'Voyager 1', value: '49', unit: 'years', lines: ['Launched 1977, one light-day out in 2026', 'You got here in 27 days'] }],
  [297, { title: 'One grain of sand at 99% c', value: '~131', unit: 't TNT', lines: ['1 mg hitting at 99% of light speed', '(γ − 1) mc² ≈ 5.5 × 10¹¹ J'] }],
  [318, { title: 'Proxima Centauri', value: '4.24', unit: 'light-years', lines: ['Your clock: 2.3 years', 'Earth\'s clock: 5.1 years'] }],
  [384.4, { dur: 4, title: 'The galactic centre', value: '26,000', unit: 'light-years', lines: ['Your clock: 10.6 years', 'Earth\'s clock: 26,000 years'] }],
  [444.4, { dur: 4, title: 'Andromeda', value: '2.5', unit: 'million ly', lines: ['Your clock: 15 years', 'Earth\'s clock: 2.5 million years'] }],
];
// ---- the HUD
function hud(st) {
  const a = TT < TEASE.t1 ? ev(0.4, 0.6) * (1 - ev(TEASE.t1 - 0.3, 0.3)) : ev(TEASE.black + 0.6, 0.8) * (1 - ev(497, 0.8));
  if (a <= 0) return;
  const tau = shipTau(st), [v, u, sub] = fmtSpeed(tau);
  let k = 0; while (k < NEXTS.length && tau >= NEXTS[k][0] - 1) k++;
  const nx = NEXTS[k], [dv, du] = nx ? fmtDur(nx[0] - Math.max(0, tau)) : ['', ''];
  for (const [t0, F] of FACTS) { const fd = F.dur ?? 8.5; if (st < t0 || st >= t0 + fd) continue; const fa = a * Math.min(ev(t0, 0.4), 1 - ev(t0 + fd - 0.4, 0.4));
    const plate = () => { const w = 430, x = W - 56 - w, y = 320, h = 132 + F.lines.length * 26; ctx.save(); screen(); ctx.globalAlpha = 0.86 * fa; ctx.fillStyle = '#0b0d12';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.fill(); ctx.restore(); };
    if (DEFER) DEFER.push(plate); else plate(); hdFact({ ...F, a: fa }); }
  hdPanel('L', { label: 'Speed', value: v, unit: u, sub, next: nx ? nx[1] : null, nextV: nx ? `in ${dv} ${du}` : null, a });
  // the right panel: two clocks, yours and Earth's
  const f = () => {
    const w = 440, x = W - 56 - w, y = 52, h = 196, pad = 30, halo = 'rgba(0,0,0,0.3)', tx = x + w - pad;
    ctx.save(); screen(); ctx.globalAlpha = 0.55 * a; ctx.fillStyle = '#0b0d12'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.fill(); ctx.restore();
    hdGlass(x, y, w, h, 22, a);
    let [yv, yu] = tau < 0 ? ['T−' + Math.ceil(-tau), 's'] : fmtDur(tau), [ev2, eu] = tau < 0 ? ['0', 's'] : fmtDur(earthOf(tau));
    if (TEASER()) { const R = RNG('spin', Math.floor(TT * 30)), dg = (n) => Array.from({ length: n }, () => Math.floor(R.f() * 10)).join(''); yv = dg(2) + '.' + dg(1); yu = 'years'; ev2 = (1 + Math.floor(R.f() * 9)) + ',' + dg(3) + ',' + dg(3) + ',' + dg(3); eu = 'years'; yv = (1 + Math.floor(R.f() * 9)) + dg(1) + '.' + dg(1); }
    hdText('YOUR CLOCK', tx, y + 40, 15, { font: HD.thin, weight: 600, spacing: 2.6, alpha: a, align: 'right', halo });
    const row = (val, unit, yy, size) => { const uw = hdWidth(' ' + unit, size * 0.5, { font: HD.thin }), vw = hdWidth(val, size, { font: HD.thin, weight: 300 });
      hdText(val, tx - uw - vw, yy, size, { font: HD.thin, weight: 300, alpha: a, halo }); hdText(' ' + unit, tx - uw, yy, size * 0.5, { font: HD.thin, weight: 400, alpha: a, halo }); };
    row(yv, yu, y + 92, 50);
    ctx.save(); screen(); ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#fff'; ctx.fillRect(x + pad, y + 112, w - 2 * pad, 1); ctx.restore();
    hdText('EARTH CLOCK', tx, y + 140, 15, { font: HD.thin, weight: 700, spacing: 2.6, alpha: a, align: 'right', color: HD.amber, halo });
    row(ev2, eu, y + 180, 34);
  };
  if (DEFER) DEFER.push(f); else f();
}
// a soft depth of field: everything outside an ellipse around (fx, fy) is blurred (the photo in focus)
let FOC = null;
function focusOn(fx, fy, rx, ry, amt) {
  if (amt <= 0) return; if (!FOC) { FOC = document.createElement('canvas'); FOC.width = W / 2; FOC.height = H / 2; }
  const b = FOC.getContext('2d'); b.globalCompositeOperation = 'source-over'; b.filter = `blur(${(2.6 * amt).toFixed(1)}px)`; b.clearRect(0, 0, W / 2, H / 2); b.drawImage(ctx.canvas, 0, 0, W / 2, H / 2); b.filter = 'none';
  b.globalCompositeOperation = 'destination-out'; b.save(); b.translate(fx / 2, fy / 2); b.scale(rx / ry, 1);
  const gr = b.createRadialGradient(0, 0, 0, 0, 0, ry / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = gr; b.fillRect(-ry, -ry, 2 * ry, 2 * ry); b.restore();
  b.globalCompositeOperation = 'source-over';
  ctx.save(); screen(); ctx.drawImage(FOC, 0, 0, W, H); ctx.restore();
}
function sceneRocket() {
  const t = TT, st = storyT(t);
  if (t >= TEASE.t1 && t < TEASE.black) { fillAll('#000'); return; }
  if (st >= 498) { fillAll('#050608'); endCard(st); return; }
  const g = g3(); g.r.setClearColor(0x000000, 1); g.r.clear();
  poseEye(g, st);
  const L = ouOutside(g, st);
  ckCockpit(g, st, L);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
  if (L.sunDir) lensFlare(g.far, L.sunDir, L.flare ?? 0.5);
  bloom(st >= 330 ? 0.42 : 0.24, st >= 330 ? { br: 0.7, co: 2.2, blur: 12 } : {});
  for (const [mt, mx, my] of MICRO) if (st >= mt && st < mt + 0.25) { const k = 1 - (st - mt) / 0.25; ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
    const g2 = ctx.createRadialGradient(mx, my, 0, mx, my, 60); g2.addColorStop(0, `rgba(230,240,255,${0.9 * k})`); g2.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = g2; ctx.fillRect(mx - 60, my - 60, 120, 120); ctx.restore(); }
  if (TEASER()) teaserPost(TT);
  { const rf = radFlash(st); if (rf > 0) { ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35 * rf; ctx.fillStyle = '#bcd4ff'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  if (st >= 326.2 && st < 327.7) { ctx.save(); screen(); ctx.globalAlpha = Math.exp(-(st - 326.2) * 3.5); ctx.fillStyle = '#f4f8ff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // the dust hit
  if (st > 458) { const p = CK.photo.getWorldPosition(V3(0, 0, 0)).project(g.cam); focusOn((p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H, 560, 380, ss(458, 470, st)); }
  if (st >= 494) pvFade(ss(494, 498, st));
  if (typeof THUMB !== 'undefined') { THUMB(st); return; }
  hud(st); captions(st);
}
// the teaser's 2D layer: the hull glowing round the window from the radiation, sparks bursting from the console
function teaserPost(t) {
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  const gl = 0.35 + 0.25 * Math.sin(t * 17) * Math.sin(t * 5);
  for (const [x0, y0, r0] of [[470, 380, 260], [1530, 380, 260], [960, 160, 320]]) { const g = ctx.createRadialGradient(x0, y0, 0, x0, y0, r0);
    g.addColorStop(0, `rgba(255,120,40,${0.32 * gl})`); g.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  const R = RNG('sparks');
  for (let b = 0; b < 11; b++) { const t0 = 0.3 + b * 0.42 + R.r(0, 0.2), sx = R.pick([480, 560, 1360, 1480, 1600, 900, 1050]), sy = R.r(560, 640);
    for (let i = 0; i < 70; i++) { const vx = R.r(-520, 520), vy = R.r(-750, -150), life = R.r(0.5, 1.2), dt = t - t0; if (dt < 0 || dt > life) continue;
      const x1 = sx + vx * dt, y1 = sy + vy * dt + 900 * dt * dt, x2 = x1 - vx * 0.03, y2 = y1 - (vy + 1800 * dt) * 0.03, a = 1 - dt / life;
      ctx.strokeStyle = `rgba(255,${Math.round(200 + 55 * a)},${Math.round(120 * a)},${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    const fa = clamp(1 - (t - t0) / 0.18); if (t > t0 && fa > 0) { const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 140); g.addColorStop(0, `rgba(255,240,200,${fa})`); g.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 140, sy - 140, 280, 280); } }
  ctx.restore();
}
function pvFade(k) { if (k <= 0) return; ctx.save(); screen(); ctx.globalAlpha = clamp(k); ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// the storyboard: one panel per key moment of the brief's beats
TIMELINE.board = [
  { t: 3.0, title: 'Teaser: the universe squeezed into a ring. "You can\'t turn it off."', sound: 'low drone, then 0.8 s black' },
  { t: 13.5, title: 'The pilot looks out: the viewing site, the crowd, your family', sound: 'pad ambience, wind, PA countdown far away' },
  { t: 20.0, title: 'T-2 s: the deluge flashes to steam, the trench glows orange', sound: 'water deluge roar, ignition rumble builds' },
  { t: 23.6, title: 'Liftoff: the tower slides down past the window', sound: 'ENGINE ROAR, cabin rattle' },
  { t: 44.4, title: 'Faster than sound: punching through the cloud deck', sound: 'roar, a thump at Mach 1' },
  { t: 60.0, title: 'The sky is getting darker', sound: 'air thinning, roar fading to a hum' },
  { t: 72.0, title: 'The sky goes black. The engine never stops: 1 g', sound: 'hum, cabin fans, silence outside' },
  { t: 94.0, title: 'Orbital speed. ENGINE CUTOFF: FAILED (red alarm)', sound: 'switch clack, alarm beeps' },
  { t: 112.5, title: 'Faster than any human: Apollo 10, 39,897 km/h', sound: 'record chime' },
  { t: 131.0, title: 'The Moon sweeps past the window, 2.5 h in', sound: 'Moon whoosh' },
  { t: 158.0, title: 'Past the Parker Solar Probe, 5 h in', sound: 'small whoosh' },
  { t: 190.0, title: 'Mars, 2.5 days in', sound: 'deep planet pass' },
  { t: 200.5, title: 'Jupiter', sound: 'huge low pass' },
  { t: 208.5, title: 'Saturn and its rings', sound: 'shimmering pass' },
  { t: 221.0, title: 'Pluto, 13 days in', sound: 'faint pass' },
  { t: 241.0, title: 'Voyager 1 in the window: 49 years vs your 27 days', sound: 'radio bleeps of Voyager' },
  { t: 258.0, title: 'RADIATION alarm: the gas ahead hits like a beam', sound: 'Geiger crackle, alarm' },
  { t: 300.0, title: 'One grain of sand at 99% c = ~131 t of TNT', sound: 'tension drone' },
  { t: 320.0, title: 'Proxima Centauri slides past: 2.3 yr yours / 5.1 Earth', sound: 'drone' },
  { t: 326.3, title: 'THE HIT: a dust grain cracks the window', sound: '1 s SILENCE, then the loudest hit' },
  { t: 350.0, title: 'The starbow: everything ahead in a ring', sound: 'lowest, quiet' },
  { t: 386.0, title: 'The galactic centre: 10.6 yr yours, 26,000 yr Earth', sound: 'low choir-like drone' },
  { t: 416.0, title: 'Out of the Milky Way: the whole galaxy on the rear cam', sound: 'rising drone' },
  { t: 446.0, title: 'Andromeda: 15 yr yours, 2.5 Myr Earth', sound: 'rising drone' },
  { t: 470.0, title: 'You let go of the throttle and touch the photo', sound: 'drone thins' },
  { t: 480.0, title: 'Earth clock: 5,000,000,000 years', sound: 'near silence' },
  { t: 489.0, title: 'The rear cam: the Sun is a red giant. Earth is gone', sound: 'fade' },
  { t: 503.0, title: 'End card: "It felt like home the whole way."', sound: 'last tone, silence' },
].map((p, i, A) => ({ ...p, next: A[i + 1] ? A[i + 1].title : '' }));

// the end card
function endCard(st) {
  const a = ev(498.4, 0.8), d = ev(501.2, 0.9);
  // a slow drift of faint stars behind the card, so the last seconds never sit still
  { const R = RNG('cardstars'); ctx.save(); screen(); for (let i = 0; i < 420; i++) { const ang = R.r(0, TAU), r0 = R.r(20, 900), sp = R.r(30, 90), r = (r0 + (st - 498) * sp) % 1000, b = R.r(0.25, 0.8) * Math.min(1, r / 150) * ev(498.2, 1.2), sz = 1.5 + r / 400;
    ctx.fillStyle = `rgba(220,230,255,${b.toFixed(3)})`; ctx.fillRect(W / 2 + Math.cos(ang) * r * 1.4, H / 2 + Math.sin(ang) * r * 0.8, sz, sz); } ctx.restore(); }
  const f = () => {
    hdText('It felt like home the whole way.', W / 2, 440, 60, { align: 'center', alpha: a });
    hdText('There\'s no home to go back to.', W / 2, 520, 60, { align: 'center', alpha: ev(499.6, 0.8) });
    ctx.save(); screen(); ctx.globalAlpha = 0.45 * d; ctx.fillStyle = HD.amber; ctx.fillRect(W / 2 - 50, 640, 100, 2); ctx.restore();
    hdText('ALTERBASE', W / 2, 740, 30, { font: HD.sans, weight: 600, spacing: 8, align: 'center', alpha: d });
  };
  if (DEFER) DEFER.push(f); else f();
}
