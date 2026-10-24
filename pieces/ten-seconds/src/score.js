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

  noiseHit(BRAKE, 1.1, 'bandpass', 3100, 7, 0.16, 0.2, 0.15, 2600);                       // the brakes screech
  noiseHit(BRAKE, 0.5, 'lowpass', 300, 0.7, 0.12);
  sweep(TRUCK - 1.0, TRUCK + 0.02, 0.32, 160, 2600, 0.5);                                  // the truck comes...
  sub(TRUCK, 1.0); noiseHit(TRUCK, 1.3, 'lowpass', 1100, 0.6, 0.55, -0.3, 0.3, 250);      // ...and passes: THE loudest moment
  horn(TRUCK - 0.35, 1.25, 0.12);
  // ---- the big moments stay here; every other sfx is registered per shot with SFX(...) in the section files
  // the brake + THE TRUCK (above), the blank, the scooter, the cyan chime
  sweep(BLANK - 0.05, BLANK + 0.6, 0.06, 2400, 200, 0);                                    // the ghost powers down... then silence
  { const t = VW('141-narrator', 'screams'); sweep(t - 0.6, t + 0.02, 0.22, 600, 5200, -0.6); const o = osc('sawtooth', 900, t - 0.6, t + 0.5); o.frequency.exponentialRampToValueAtTime(520, t + 0.4); const lp = ac.createBiquadFilter(); lp.frequency.value = 2200; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t - 0.6); g.gain.exponentialRampToValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(lp); lp.connect(g); out(g, 0.5, 0.2); }
  to = 'm'; chime(VW('153-narrator', 'twenty'), [nz('Fs5'), nz('Cs6'), nz('A6')], 0.05, 0); to = 's';
  shimmer(VW('153-narrator', 'twenty') + 0.4, 0.03);

  // =====================================================================
  //  SFX_KINDS — every SFX(t, kind, v, pan, dur) registered by the section files plays here (sfx bus).
  //  Synthesized: noise through filters, pitched sweeps, little oscillators. v scales the level (1 = normal).
  // =====================================================================
  to = 's';
  const tone = (t, f0, f1, d, v, type = 'sine', pan = 0, send = 0.1) => { const o = osc(type, f0, t, t + d + 0.05); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + d); const g = ac.createGain(); env(g, t, 0.003, v, d); o.connect(g); out(g, pan, send); };
  const SFX_KINDS = {
    whoosh: (t, v, p) => sweep(t - 0.25, t + 0.04, 0.07 * v, 300, 3400, p),
    swish:  (t, v, p) => sweep(t - 0.1, t + 0.02, 0.06 * v, 700, 4200, p),
    pop:    (t, v, p) => { tone(t, 520, 1100, 0.07, 0.09 * v, 'sine', p); noiseHit(t, 0.03, 'highpass', 3000, 0.7, 0.03 * v, p); },
    blip:   (t, v, p) => tone(t, 1250, 1900, 0.06, 0.07 * v, 'sine', p),
    tick:   (t, v, p) => noiseHit(t, 0.015, 'bandpass', 4200, 4, 0.12 * v, p),
    click:  (t, v, p) => { noiseHit(t, 0.02, 'highpass', 2600, 0.8, 0.12 * v, p); tone(t, 1800, 1500, 0.02, 0.03 * v, 'square', p, 0); },
    thud:   (t, v, p) => { sub(t, 0.18 * v); noiseHit(t, 0.06, 'lowpass', 900, 0.7, 0.07 * v, p); },
    impact: (t, v, p) => { sub(t, 0.6 * v); noiseHit(t, 0.35, 'lowpass', 2200, 0.6, 0.3 * v, p, 0.3, 300); noiseHit(t, 0.08, 'highpass', 2500, 0.7, 0.12 * v, p); },
    splash: (t, v, p) => { noiseHit(t, 0.4, 'bandpass', 1400, 0.9, 0.16 * v, p, 0.25, 500); noiseHit(t + 0.04, 0.25, 'highpass', 3500, 0.8, 0.06 * v, p); for (let i = 0; i < 4; i++) tone(t + 0.05 + i * 0.05, 900 + i * 300, 500 + i * 200, 0.05, 0.02 * v, 'sine', p); },
    drip:   (t, v, p) => tone(t, 1400, 700, 0.06, 0.05 * v, 'sine', p, 0.3),
    paper:  (t, v, p) => { noiseHit(t, 0.14, 'highpass', 3200, 0.6, 0.08 * v, p, 0.1, 6500); noiseHit(t + 0.07, 0.08, 'bandpass', 2400, 1, 0.04 * v, p); },
    cloth:  (t, v, p) => noiseHit(t, 0.18, 'bandpass', 1100, 0.7, 0.09 * v, p, 0.05, 500),
    step:   (t, v, p) => { noiseHit(t, 0.05, 'lowpass', 750, 0.8, 0.09 * v, p); sub(t, 0.03 * v); },
    slide:  (t, v, p) => noiseHit(t, 0.3, 'bandpass', 1700, 1.6, 0.07 * v, p, 0.05, 900),
    glass:  (t, v, p) => { noiseHit(t, 0.25, 'highpass', 4500, 0.9, 0.12 * v, p, 0.3); chime(t, [2637, 3520, 4186], 0.04 * v, p); },
    metal:  (t, v, p) => { chime(t, [620, 1480, 2210], 0.06 * v, p); noiseHit(t, 0.04, 'bandpass', 3000, 3, 0.06 * v, p); },
    beep:   (t, v, p) => tone(t, 1500, 1500, 0.09, 0.05 * v, 'square', p, 0),
    buzz:   (t, v, p) => { for (let i = 0; i < 3; i++) tone(t + i * 0.2, 140, 140, 0.13, 0.07 * v, 'square', p, 0); },
    cheer:  (t, v, p) => { for (let i = 0; i < 6; i++) noiseHit(t + i * 0.08, 0.9, 'bandpass', 800 + i * 220, 0.6, 0.06 * v, -0.5 + i * 0.2, 0.35); },
    gasp:   (t, v, p) => noiseHit(t, 0.5, 'bandpass', 1300, 0.8, 0.07 * v, p, 0.3, 2200),
    laugh:  (t, v, p) => { for (let i = 0; i < 5; i++) tone(t + i * 0.11, 380 + (i % 2) * 60, 300, 0.08, 0.03 * v, 'triangle', p, 0.2); },
    car:    (t, v, p, d = 1.4) => { sweep(t - d / 2, t + 0.02, 0.12 * v, 180, 1400, p); noiseHit(t, d / 2, 'lowpass', 900, 0.6, 0.09 * v, -p, 0.2, 200); },
    brake:  (t, v, p, d = 0.9) => { noiseHit(t, d, 'bandpass', 3100, 7, 0.16 * v, p, 0.15, 2500); noiseHit(t, 0.4, 'lowpass', 300, 0.7, 0.1 * v, p); },
    horn:   (t, v, p, d = 0.6) => { for (const f of [233, 294]) tone(t, f, f, d, 0.05 * v, 'sawtooth', p, 0.2); },
    engine: (t, v, p, d = 2) => { for (let i = 0; i < d * 8; i++) noiseHit(t + i / 8, 0.14, 'lowpass', 160, 0.7, 0.05 * v, p); },
    wiper:  (t, v, p) => noiseHit(t, 0.25, 'bandpass', 600, 1.2, 0.06 * v, p, 0.1, 1100),
    door:   (t, v, p) => { sub(t, 0.16 * v); noiseHit(t, 0.12, 'bandpass', 700, 1, 0.1 * v, p); noiseHit(t - 0.15, 0.1, 'highpass', 2000, 1, 0.03 * v, p); },
    bounce: (t, v, p) => { sub(t, 0.12 * v); tone(t, 220, 140, 0.08, 0.06 * v, 'sine', p, 0); },
    coin:   (t, v, p) => chime(t, [1976, 2637], 0.06 * v, p),
    ding:   (t, v, p) => chime(t, [1318, 1976, 2637], 0.05 * v, p),
    camera: (t, v, p) => { noiseHit(t, 0.03, 'highpass', 3000, 0.8, 0.1 * v, p); noiseHit(t + 0.06, 0.04, 'highpass', 2600, 0.8, 0.07 * v, p); },
    type:   (t, v, p, d = 0.6) => { for (let i = 0; i < d * 14; i++) noiseHit(t + i / 14 + (i % 3) * 0.008, 0.015, 'bandpass', 3500, 3, 0.05 * v, p); },
    heart:  (t, v, p) => { sub(t, 0.2 * v); sub(t + 0.16, 0.12 * v); },
    shimmer:(t, v, p) => chime(t, [nz('A5'), nz('E6'), nz('A6')], 0.04 * v, p),
    ghost:  (t, v, p) => { sweep(t - 0.4, t + 0.02, 0.05 * v, 2400, 800, p); chime(t, [nz('E6'), nz('B6')], 0.03 * v, p); },
    rise:   (t, v, p, d = 1.2) => riser(t, t + d, 0.06 * v),
    drop:   (t, v, p) => { tone(t, 600, 90, 0.5, 0.08 * v, 'sine', p, 0.3); sub(t + 0.3, 0.1 * v); },
    crowd:  (t, v, p, d = 2) => { for (let i = 0; i < d * 3; i++) noiseHit(t + i / 3, 0.5, 'bandpass', 600 + (i % 4) * 150, 0.5, 0.025 * v, ((i % 5) - 2) * 0.2, 0.3); },
    plastic:(t, v, p) => { noiseHit(t, 0.05, 'bandpass', 1900, 2, 0.12 * v, p); tone(t, 700, 500, 0.04, 0.03 * v, 'triangle', p, 0); },
  };
  window.SFX_KINDS_LIST = Object.keys(SFX_KINDS);
  // the same kind twice within 50 ms plays once (the louder); everything else plays as registered
  const SFX_PLAY = [...SFX_REG].sort((x, y) => x[0] - y[0]), lastAt = {};
  for (const [t, k, v, p, d] of SFX_PLAY) {
    const f = SFX_KINDS[k]; if (!f || !(t >= 0 && t < DURATION)) continue;
    if (lastAt[k] != null && t - lastAt[k] < 0.05) continue;
    lastAt[k] = t; const tt = Math.max(t, 0.05 + (['whoosh', 'swish', 'ghost', 'car', 'rise'].includes(k) ? (k === 'car' ? (d ?? 1.4) / 2 : 0.45) : 0));
    try { f(tt, v ?? 1, clamp(p ?? 0, -1, 1), d); } catch (e) { console.warn('sfx skipped', k, t, e.message); }
  }
