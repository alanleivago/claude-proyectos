// =====================================================================
//  SCENES — dispatch to the stage that owns story time st, then the rider, post, HUD and captions.
//  near: st < 185 (beach, town, clouds) · high: 185..290 (drained sea, Everest, the dark sky) · space: >= 290 (the planet, the Moon)
// =====================================================================
const STAGE_NEAR_END = 185, STAGE_HIGH_END = 290;
function stageFor(st) { return st < STAGE_NEAR_END ? stageNear : st < STAGE_HIGH_END ? stageHigh : stageSpace; }

// captions: [story time, text]; each holds until the next one (max 6.5 s)
const CAPS = [
  [7.8, 'You caught a good one.'], [17, 'It isn\'t getting any smaller.'], [27, 'Every few seconds, it\'s bigger.'], [38, 'The swimmers are looking up.'],
  [49, 'Taller than the pier.'], [59, 'The beach is getting close.'], [70, 'The biggest wave anyone has ever surfed. Nazaré, 2020.'],
  [80, 'Nobody has ridden past this point.'], [92, 'The beach is behind you now.'], [101, 'The lighthouse slides under your board.'],
  [108, 'As tall as the Statue of Liberty.'], [117, 'You\'re riding over rooftops.'], [126, 'The town is a blur of foam below.'],
  [136, 'Taller than the Eiffel Tower.'], [145, 'The tallest wave ever measured: 524 metres. Lituya Bay, 1958.'],
  [153, 'That one was over in minutes. Yours is still growing.'], [161, 'Taller than the Burj Khalifa.'], [169, 'Fields. Roads. Toy cars.'],
  [175, 'The asteroid that ended the dinosaurs made a wave this tall.'], [185, 'You\'re riding into the clouds.'],
  [195, 'This is how deep the ocean is, on average.'], [202, 'There\'s no sea left in front of you.'], [209, 'The sea floor, in daylight.'],
  [215, 'Taller than Everest.'], [222, 'An airliner passes under the lip.'], [229, 'The air up here is too thin to breathe.'],
  [236, 'Up here, water boils at body temperature.'], [243, 'The crest is steaming.'], [252, 'The sky is getting darker.'],
  [262, 'Stars, in the middle of the day.'], [275, 'Space starts here. The wave didn\'t notice.'], [285, 'The spray freezes into snow.'],
  [299, 'The space station. Below you.'], [310, 'Look left. It runs past the horizon.'], [321, 'You can see the curve of the Earth.'],
  [332, 'It\'s wrapping around the planet.'], [345, 'Every coast on Earth is under the same wave.'],
  [358, 'There\'s no ocean left. All 1.3 billion cubic kilometres.'], [370, 'It keeps growing anyway.'], [382, 'The sea floor is grey and dry.'],
  [394, 'The planet looks like a stone in a bowl.'], [405, 'Taller than the Earth is wide.'], [422, 'Every geostationary satellite, below you.'],
  [434, 'The Moon is next.'], [445, 'For billions of years, the Moon pulled on the sea.'], [455, 'Now the sea reaches for the Moon.'],
  [471, 'It touched the Moon.'], [478, 'Every surfer dreams of riding inside the barrel.'], [486, 'This one is big enough to hold the Moon.'], [493, 'You\'re still riding.'],
];
function captions(st) {
  if (TT < TEASE.t1) { hdCaption('You can\'t get off.', 1.2, 5.8); return; }
  for (let i = 0; i < CAPS.length; i++) {
    const [t0, s] = CAPS[i], t1 = Math.min(i + 1 < CAPS.length ? CAPS[i + 1][0] - 0.6 : 497, t0 + 6.5);
    if (st >= t0 && st < t1) hdCaption(s, t0, t1);
  }
}
function fmtTime(s) { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60); return m ? `${m} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; }
// glass fact cards at the milestones (story time, card); `you` adds a live bar for your wave against the fact
const FACTS = [
  [70,  { title: 'Biggest wave ever surfed', value: '26.21', unit: 'm', lines: ['Sebastian Steudtner · Nazaré, Portugal', '29 October 2020 · Guinness World Records'], vs: 26.21, vsL: 'Steudtner\'s wave' }],
  [145, { title: 'Tallest wave ever measured', value: '524', unit: 'm', lines: ['Lituya Bay, Alaska · 9 July 1958', 'A landslide threw it up a mountainside'], vs: 524, vsL: 'Lituya Bay' }],
  [172, { title: 'The dinosaur tsunami', value: '~1.5', unit: 'km', lines: ['Chicxulub impact, 66 million years ago', 'First wave, as modelled in 2022'], vs: 1500, vsL: 'Chicxulub' }],
  [195, { title: 'Average ocean depth', value: '3,682', unit: 'm', lines: ['All the oceans hold 1.33 billion km³', 'NOAA and WHOI satellite survey, 2010'], vs: 3682, vsL: 'Ocean depth' }],
  [236, { title: 'The Armstrong limit', value: '~19', unit: 'km', lines: ['The air is 1/16 as thick as at sea level', 'Water boils here at 37 °C'], vs: 19000, vsL: 'Armstrong limit' }],
  [275, { title: 'The edge of space', value: '100', unit: 'km', lines: ['The Kármán line', 'Where space is usually said to begin'], vs: 100000, vsL: 'Kármán line' }],
  [299, { title: 'The space station', value: '~410', unit: 'km', lines: ['Circles the Earth at ~28,000 km/h', 'Once every 90 minutes'], vs: 410000, vsL: 'ISS orbit' }],
  [405, { title: 'The Earth', value: '12,742', unit: 'km', lines: ['Its diameter at the equator'], vs: 12742000, vsL: 'Earth\'s diameter' }],
  [422, { title: 'Geostationary orbit', value: '35,786', unit: 'km', lines: ['Satellites here go round once a day', 'so they hang over one spot'], vs: 35786000, vsL: 'Geostationary' }],
  [445, { title: 'The Moon', value: '384,400', unit: 'km', lines: ['Its average distance from Earth', 'Its pull is what raises the tides'], vs: 384400000, vsL: 'The Moon' }],
];
function facts(st) {
  if (TT < TEASE.t1) return;
  for (const [t0, F] of FACTS) {
    const t1 = t0 + 9; if (st < t0 || st >= t1) continue;
    const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5)), Hm = waveH(st), [v, u] = hdLen(Hm), mx = Math.max(Hm, F.vs);
    hdFact({ ...F, a, bars: [[F.vsL, F.vs / mx, F.value + ' ' + F.unit, false], ['Your wave', Hm / mx, v + ' ' + u, true]] });
  }
}
function fmtTime(s) { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60); return m ? `${m} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; }
function hud(st) {
  const a = TT < TEASE.t1 ? ev(0.4, 0.6) * (1 - ev(TEASE.t1 - 0.3, 0.3)) : ev(TEASE.black + 0.6, 0.8) * (1 - ev(497, 0.8));
  if (a <= 0) return;
  const Hm = waveH(st), [v, u] = hdLen(Hm);
  let k = -1; while (k + 1 < MILES.length && Hm >= MILES[k + 1][0]) k++;
  const sub = k < 0 ? 'still shorter than you' : `taller than ${MILES[k][1]}`;
  const nx = MILES[k + 1], [dv, du] = nx ? hdLen(nx[0] - Hm) : ['', ''];
  const kb = (Math.log10(Hm) - Math.log10(1.2)) / (Math.log10(3.844e8) - Math.log10(1.2));
  hdPanel('L', { label: 'Wave height', value: v, unit: u, sub, next: nx ? nx[1] : null, nextV: nx ? `in ${dv} ${du}` : null, bar: { k: kb, lo: '1.2 m', hi: 'the Moon' }, a });
  hdPanel('R', { label: 'You\'ve been riding for', value: fmtTime(st - TEASE.black), sub: `speed ${hdNum(waveV(st) * 3.6)} km/h`, w: 400, a });
  facts(st);
}
function sceneWave() {
  const t = TT, st = storyT(t);
  if (t >= TEASE.t1 && t < TEASE.black) { fillAll('#000'); return; }
  if (st >= 498) { fillAll('#050608'); endCard(st); return; }
  const g = g3(); TIMEU.value = st;
  g.r.setClearColor(0x000000, 1); g.r.clear();
  // the HIGH -> SPACE seam: render both and dissolve over 288.5..291 (the cloud and land patterns differ)
  const SEAM0 = 287.0, SEAM1 = 291.0;
  let L;
  if (st > SEAM0 && st < SEAM1) {
    const k = ss(SEAM0, SEAM1, st);
    const L1 = stageHigh(g, st) || {}; drawRider(g, st, L1);
    ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
    g.r.setClearColor(0x000000, 1); g.r.clear();
    L = stageSpace(g, st) || {}; drawRider(g, st, L);
    ctx.save(); screen(); ctx.globalAlpha = k; ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
    if (k < 0.5) L = L1;
  } else {
    L = stageFor(st)(g, st) || {};
    drawRider(g, st, L);
    ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
  }
  sunFlare(g, L.flare ?? 0.8);
  bloom(L.bloom ?? 0.28);
  if (L.post) L.post(st);
  if (st >= 494) pvFade(ss(494, 498, st));
  if (typeof THUMB !== "undefined") { THUMB(st); return; }
  hud(st); captions(st);
}
function pvFade(k) { if (k <= 0) return; ctx.save(); screen(); ctx.globalAlpha = clamp(k); ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// the storyboard: one panel per caption (+ the teaser and the end card); sound notes per beat
const BOARD_SOUND = { 7.8: 'music in (Floating Cities), sea, gulls, board hiss', 70: 'roar opens up', 92: 'crowd far away, breaking water', 145: 'big roar, wind', 185: 'into the cloud: muffled', 202: 'draining sea, hiss', 222: 'jet passes (Doppler)', 236: 'thin wind, steam hiss', 275: 'air gone: drone + music only', 332: 'deep swell', 358: 'low drone', 455: 'music thins out', 471: 'THE HIT (468) after 0.6 s of silence', 493: 'music resolves, fade' };
TIMELINE.board = [{ t: 3.0, title: 'Teaser: "You can\'t get off."', sound: 'drone, then silence', next: 'black' }]
  .concat(CAPS.map(([t0, s], i) => ({ t: (t0 === 471 ? 468.3 : t0 + 2.2), title: s, sound: BOARD_SOUND[t0] || '', next: CAPS[i + 1] ? CAPS[i + 1][1] : 'end card' })))
  .concat([{ t: 503, title: 'End card', sound: 'last note, silence', next: '' }]);

// the end card: title and facts higher, then 2 s later the pov3d sign-off line
function endCard(st) {
  const a = ev(498.4, 0.8), d = ev(501.2, 0.9);
  const f = () => {
    hdText('What if a wave grew', W / 2, 360, 64, { align: 'center', alpha: a });
    hdText('and couldn\'t stop?', W / 2, 438, 64, { align: 'center', alpha: a });
    ['The biggest wave ever surfed: 26.21 m · Nazaré, 2020', 'The tallest wave ever measured: 524 m · Lituya Bay, 1958'].forEach((l, i) =>
      hdText(l.toUpperCase(), W / 2, 530 + i * 34, 16, { font: HD.sans, weight: 600, spacing: 3, align: 'center', alpha: ev(499.2 + i * 0.4, 0.8) * 0.8 }));
    ctx.save(); screen(); ctx.globalAlpha = 0.45 * d; ctx.fillStyle = HD.amber; ctx.fillRect(W / 2 - 50, 640, 100, 2); ctx.restore();
    hdText('relax, this could never happen...', W / 2, 740, 46, { italic: true, align: 'center', alpha: d });
    hdText('could it?', W / 2, 808, 52, { italic: true, align: 'center', alpha: ev(502.4, 0.9) });
  };
  if (DEFER) DEFER.push(f); else f();
}
