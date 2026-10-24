  // =====================================================================
  //  SCORE — a mellow electric-piano bed under the voice (changes with the story) + 15–25 sfx a minute.
  //  Cues come from the shots (SK) and the voice (VW/VWE/LT/LE). The loudest moment: the truck (s04_TRUCK),
  //  after a hard silence on "brakes". The ghost going blank kills all music until Dad's hand.
  // =====================================================================
  const SK = (k) => { const s = SHOTS_REG.find((x) => x.key === k); return s ? s.t0 : NaN; };
  const SKE = (k) => { const s = SHOTS_REG.find((x) => x.key === k); return s ? s.t1 : NaN; };
  const has = (t) => t != null && isFinite(t);
  const TRUCK = s04_TRUCK, BRAKE = VW('081-narrator', 'brakes'), BLANK = VW('135-narrator', 'blank');

  // ---- music bed: pad + 8th-note arpeggio per bar, from t0 to t1
  function bed(t0, t1, chords, o = {}) {
    const bl = o.bar ?? 3.2, pv = o.pad ?? 0.022, av = o.arp ?? 0.045, pat = o.pat ?? [0, 1, 2, 3, 2, 1, 2, 1];
    to = 'm';
    for (let i = 0, t = t0; t < t1 - 0.2; i++, t += bl) {
      const ch = chords[i % chords.length], end = Math.min(t1, t + bl);
      pad(t, end + 0.25, ch.slice(0, 3), pv, { type: 'triangle', cut: o.cut ?? 900, att: 0.5, rel: 0.4, send: 0.5 });
      const up = ch.map((n) => nz(n) * (o.oct ?? 2));
      pat.forEach((k, j) => { const tj = t + j * bl / pat.length; if (tj < end - 0.05 && (!o.sparse || j % 2 === 0)) pluck(tj, up[k % up.length], av * (j === 0 ? 1.25 : 1), (j % 2 ? 0.25 : -0.25), 0.9, o.bright ?? 1700, 0.45); });
      if (o.bass !== false) bass(t, nz(ch[0]) / 2, (o.bassV ?? 0.05));
    }
  }
  const D = ['D3', 'A3', 'Fs4', 'D4'], A = ['A2', 'E3', 'Cs4', 'A3'], Bm = ['B2', 'Fs3', 'D4', 'B3'], G = ['G2', 'D3', 'B3', 'G3'];
  const Em = ['E3', 'B3', 'G4', 'E4'], Dm = ['D3', 'A3', 'F4', 'D4'], Bb = ['Bb2', 'F3', 'D4', 'Bb3'], Gm = ['G2', 'D3', 'Bb3', 'G3'];
  const tBus = SK('s04_busWide'), tMon = SK('s05_monday'), tCorner = SK('s06_noOneSees'), tRev = SK('s07_review'), tFact = SK('s07_thousand');
  const tDad = SK('s08_itsDad'), tNight = SK('s08_night'), tCta = SK('s08_cta');
  bed(0.4, SK('s03_minus'), [D, A, Bm, G], { arp: 0.042 });                                     // warm: lunch, the power, the plus
  bed(SK('s03_minus'), tBus, [Bm, G, D, A], { arp: 0.036, pad: 0.018 });                       // minus: same colours, sadder order
  bed(tBus, LT('074-narrator'), [Dm, Bb, Gm, A], { arp: 0.03, sparse: true, cut: 700 });       // the night bus
  // the build: a heartbeat that quickens into "brakes", then nothing
  to = 'm';
  pad(LT('074-narrator'), BRAKE, ['D3', 'A3', 'Eb4'], 0.03, { type: 'sawtooth', cut: 600, att: 1.5, rel: 0.05, send: 0.3, swellTo: 0.05, swellAt: BRAKE - 0.2 });
  for (let t = LT('074-narrator'), k = 0; t < BRAKE - 0.15; k++) { bass(t, nz('D2'), 0.09); bass(t + 0.16, nz('D2'), 0.06); t += Math.max(0.42, 0.9 - k * 0.025); }
  bed(TRUCK + 1.6, tMon, [['D3', 'A3', 'F4']], { bar: 4, arp: 0.02, sparse: true, pad: 0.015, cut: 600, bass: false }); // aftermath
  bed(tMon, tCorner, [Bm, G, D, A], { bar: 3.6, arp: 0.03, sparse: true, pad: 0.02 });       // Voss, the kitchen
  bed(tCorner, tRev, [D, A, Bm, G], { arp: 0.045, bright: 2200 });                              // the corner: hope
  bed(tRev, tFact, [Em, ['C3', 'G3', 'E4', 'C4'], G, D], { arp: 0.03, sparse: true });          // the review
  bed(tFact, BLANK - 0.05, [D, G, A, D], { arp: 0.048, bright: 2400, pad: 0.026 });            // the fix, walking home
  bed(tDad, tNight, [D, G, Bm, A], { bar: 3.4, arp: 0.04, pad: 0.026 });                       // Dad caught you
  bed(tNight, tCta, [Bm, ['G2', 'D3', 'A3', 'G3']], { bar: 3.6, arp: 0.025, sparse: true, cut: 650 }); // the message
  bed(tCta, DURATION - 1.2, [D, A, Bm, G], { arp: 0.04 });                                      // outro

  // ---- sfx kit
  to = 's';
  const whoosh = (t, v = 0.05) => has(t) && sweep(t - 0.28, t + 0.04, v, 280, 3200, 0);
  const blipN = (t, v = 0.05) => has(t) && blip(t, 1250, 1900, 0.06, v);
  const step = (t, v = 0.05, pan = 0) => has(t) && noiseHit(t, 0.05, 'lowpass', 700, 0.8, v, pan);
  const click = (t, v = 0.07) => has(t) && noiseHit(t, 0.025, 'highpass', 2800, 0.7, v);
  const thud = (t, v = 0.25) => has(t) && sub(t, v);
  const paper = (t, v = 0.06) => has(t) && noiseHit(t, 0.12, 'highpass', 3500, 0.6, v, 0, 0.1, 6000);
  const shimmer = (t, v = 0.03) => has(t) && chime(t, [nz('A5'), nz('E6'), nz('A6')], v, 0.2);
  const clank = (t, v = 0.05) => has(t) && chime(t, [620, 1480, 2210], v, -0.1);
  function horn(t, d, v) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.05); g.gain.setValueAtTime(v, t + d - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + d); for (const f of [233, 294]) osc('sawtooth', f, t, t + d + 0.05).connect(lp); lp.connect(g); out(g, 0.4, 0.3); }
  function buzz(t) { for (let i = 0; i < 3; i++) { const g = ac.createGain(), ti = t + i * 0.22; env(g, ti, 0.01, 0.05, 0.14); osc('square', 140, ti, ti + 0.18).connect(g); out(g, 0, 0); } }
  function walk(key, dur = 2.4, v = 0.045) { const a = SK(key), b = SKE(key); if (!has(a)) return; for (let t = a + 0.1, i = 0; t < Math.min(b, a + dur); t += 5 / FPS, i++) step(t, v * (i % 2 ? 0.8 : 1), i % 2 ? 0.15 : -0.15); }

  // a whoosh on every change of place
  ['s01_brain', 's01_title', 's01_real', 's02_plus', 's02_headsUp', 's02_quizWide', 's02_rps', 's02_arcade', 's02_wallSt', 's02_rob', 's03_minus', 's03_party-walkin',
   's03_caf-laugh', 's03_st-every', 's04_cap', 's04_busWide', 's04_aisleEmpty', 's04_corner', 's05_monday', 's05_night', 's06_noOneSees', 's06_cornerWide', 's06_day1', 's06_day3', 's06_day5',
   's07_review', 's07_thousand', 's07_week', 's07_bus', 's07_away', 's08_walkHome', 's08_night', 's08_cta', 's08_braked', 's08_like'].forEach((k) => whoosh(SK(k)));
  // a blip on every number / graphic that lands on its word
  [['008', 'eighty'], ['010', 'ten'], ['013', 'ten'], ['030', 'fifty'], ['037', 'eleven'], ['039', 'million'], ['039', 'milliseconds'], ['040', 'thousand'], ['042', 'fourteen'],
   ['045', 'seconds'], ['062', 'twelve'], ['063', 'zero'], ['067', 'twenty-two'], ['072', 'nine'], ['076', 'ten'], ['087', 'four'], ['101', 'twenty-two'], ['105', 'twelve'],
   ['115', 'four'], ['116', 'nineteen'], ['117', 'forty-seven'], ['119', 'seconds'], ['119', 'three'], ['125', 'forty-seven'], ['128', 'thousand'], ['129', 'third'], ['130', 'second'],
   ['146', 'thirteen'], ['148', 'one'], ['156', 'like'], ['156', 'subscribe'], ['156', 'two']].forEach(([id, w]) => {
    const L = VOICE.lines.find((l) => l.id.startsWith(id + '-')); if (L) blipN(VWE(L.id, w) - 0.04);
  });
  // the ghost: a cyan shimmer each time the power shows
  [['003', 'tipped'], ['013', 'ghost'], ['024', 'know'], ['034', 'ghost'], ['045', 'surprise'], ['054', 'accident'], ['076', 'ghost'], ['111', 'see']].forEach(([id, w]) => {
    const L = VOICE.lines.find((l) => l.id.startsWith(id + '-')); if (L) shimmer(VW(L.id, w));
  });
  // footsteps on the walks
  ['s01_title', 's02_walk', 's02_arcade', 's02_out', 's03_party-walkin', 's03_st-counter', 's05_walkOut', 's07_out', 's08_walkHome', 's08_watching', 's08_end'].forEach((k) => walk(k));

  // ---- s01 lunch
  thud(VW('002-narrator', 'hits'), 0.16); noiseHit(VW('002-narrator', 'hits'), 0.08, 'bandpass', 900, 1.2, 0.08);
  { const t = VWE('003-narrator', 'out'); noiseHit(t, 0.35, 'lowpass', 1400, 0.8, 0.12, 0.1, 0.2, 400); noiseHit(t + 0.05, 0.25, 'bandpass', 2200, 1.5, 0.05); }
  noiseHit(VW('003-narrator', 'tray'), 0.22, 'bandpass', 1600, 1.5, 0.06, -0.2);          // the tray slides
  // ---- s02 plus
  click(VW('020-you', 'got'), 0.1); thud(VW('020-you', 'got'), 0.08);
  whoosh(LT('021-coach') + 0.3, 0.07); thud(LT('022-you') + 0.25, 0.12); thud(LT('022-you') + 0.7, 0.07);
  if (has(SK('s02_ghostClaw'))) sweep(SK('s02_ghostClaw') + 0.2, SK('s02_ghostClaw') + 1.4, 0.025, 180, 420, 0.3);
  click(SK('s02_button') + 0.15, 0.12); thud(SK('s02_button') + 0.15, 0.1);
  if (has(SK('s02_cascade'))) for (let i = 0; i < 7; i++) thud(SK('s02_cascade') + 0.2 + i * 0.22, 0.05 + (i % 2) * 0.02);
  blipN(VW('042-you', 'fourteen'), 0.04); click(SK('s02_bankApp') + 0.1, 0.05);
  // ---- s03 minus
  if (has(SK('s03_party-real'))) { const t = SK('s03_party-real') + 0.1; for (let i = 0; i < 5; i++) noiseHit(t + i * 0.09, 0.7, 'bandpass', 900 + i * 260, 0.6, 0.06, -0.4 + i * 0.2, 0.3); }
  thud(SK('s03_st-foot') + 0.25, 0.12); thud(SK('s03_st-door') + 0.3, 0.16); noiseHit(SK('s03_st-door') + 0.3, 0.06, 'bandpass', 1800, 2, 0.06);
  clank(SK('s03_st-grab') + 0.25, 0.06); blip(SK('s03_st-can') + 1.0, 900, 500, 0.12, 0.03);
  // ---- s04 the bus, THE BRAKE, THE TRUCK
  if (has(tBus)) for (let t = tBus, end = SK('s04_flies') + 2.5; t < end; t += 1.3) { if (t > BRAKE - 0.1 && t < TRUCK + 0.8) continue; noiseHit(t, 0.12, 'lowpass', 500, 0.7, 0.03, 0.3); }   // the wipers
  click(VW('074-narrator', 'yellow'), 0.08); click(VW('075-narrator', 'red'), 0.08);
  shimmer(VW('076-narrator', 'truck'), 0.04);
  if (has(SK('s04_ghostCrash'))) { const t = VW('076-narrator', 'side'); noiseHit(t, 0.9, 'lowpass', 700, 0.7, 0.08, 0, 0.6); chime(t, [nz('A5'), nz('Bb5')], 0.03); }
  for (let i = 0; i < 10; i++) { const t = lerp(LT('077-narrator'), BRAKE, i / 9); blip(t, 1800, 1700, 0.03, 0.03, 0); }   // the countdown ticks, 10 → 1
  noiseHit(BRAKE, 1.1, 'bandpass', 3100, 7, 0.16, 0.2, 0.15, 2600);                       // the brakes screech
  noiseHit(BRAKE, 0.5, 'lowpass', 300, 0.7, 0.12);
  sweep(TRUCK - 1.0, TRUCK + 0.02, 0.32, 160, 2600, 0.5);                                  // the truck comes...
  sub(TRUCK, 1.0); noiseHit(TRUCK, 1.3, 'lowpass', 1100, 0.6, 0.55, -0.3, 0.3, 250);      // ...and passes: THE loudest moment
  horn(TRUCK - 0.35, 1.25, 0.12);
  if (has(SK('s04_flies'))) { const t = SK('s04_flies') + 0.2; for (let i = 0; i < 6; i++) { thud(t + i * 0.17, 0.06); noiseHit(t + i * 0.17, 0.09, 'bandpass', 1300 + i * 200, 1.2, 0.05, -0.5 + i * 0.2); } }
  if (has(SK('s04_bags'))) for (let i = 0; i < 5; i++) thud(SK('s04_bags') + 0.3 + i * 0.25, 0.04);
  clank(SK('s04_cane') + 0.5, 0.05); thud(VW('087-narrator', 'floor'), 0.2);
  // ---- s05 Voss, the kitchen
  paper(SK('s05_monday') + 0.4); blip(SK('s05_remote') + 0.4, 1500, 1500, 0.05, 0.04); click(SK('s05_cctvTruck') + 0.05, 0.05);
  paper(SK('s05_report') + 0.2, 0.05); thud(SK('s05_capDesk') + 0.45, 0.07);
  // ---- s06 the corner
  blip(SK('s06_filming') + 0.25, 1600, 1600, 0.08, 0.04); whoosh(VW('113-you', 'now') + 0.1, 0.08);
  if (has(SK('s06_stopwatch'))) { click(SK('s06_stopwatch') + 0.1); click(VWE('119-you', 'seconds')); }
  whoosh(SK('s06_goodAtThis') + 0.2, 0.07); thud(SK('s06_fistBump') + 0.45, 0.05);
  // ---- s07 the review
  click(SK('s07_review') + 0.1, 0.04); if (has(SK('s07_watch'))) { click(SK('s07_watch') + 0.1); click(VWE('130-narrator', 'second')); } thud(SK('s07_hands') + 0.2, 0.05);
  // ---- s08 the blank, the hood, the scooter, the message
  sweep(BLANK - 0.05, BLANK + 0.6, 0.06, 2400, 200, 0);                                    // the ghost powers down... then silence
  noiseHit(VW('140-narrator', 'grabs'), 0.2, 'bandpass', 900, 0.8, 0.12, 0, 0.1, 300); thud(VW('140-narrator', 'yanks'), 0.12);
  { const t = VW('141-narrator', 'screams'); sweep(t - 0.6, t + 0.02, 0.22, 600, 5200, -0.6); const o = osc('sawtooth', 900, t - 0.6, t + 0.5); o.frequency.exponentialRampToValueAtTime(520, t + 0.4); const lp = ac.createBiquadFilter(); lp.frequency.value = 2200; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t - 0.6); g.gain.exponentialRampToValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(lp); lp.connect(g); out(g, 0.5, 0.2); }
  thud(SK('s08_fistBump') + 0.4, 0.05);
  if (has(SK('s08_buzz'))) { buzz(SK('s08_buzz') + 0.1); buzz(SK('s08_buzz') + 0.9); }
  to = 'm'; chime(VW('153-narrator', 'twenty'), [nz('Fs5'), nz('Cs6'), nz('A6')], 0.05, 0); to = 's';
  shimmer(VW('153-narrator', 'twenty') + 0.4, 0.03);
