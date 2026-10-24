  // =====================================================================
  //  SCORE — a mellow electric-piano bed under the voice (changes with the story) + 15–25 sfx a minute.
  //  Cues come from the shots (SK) and the voice (VW/VWE/LT/LE). The loudest moment: the truck (s04_TRUCK),
  //  after a hard silence on "brakes". The ghost going blank kills all music until Dad's hand.
  // =====================================================================
  const SK = (k) => { const s = SHOTS_REG.find((x) => x.key === k); return s ? s.t0 : NaN; };
  const SKE = (k) => { const s = SHOTS_REG.find((x) => x.key === k); return s ? s.t1 : NaN; };
  const has = (t) => t != null && isFinite(t);
  const TRUCK = s04_TRUCK, BRAKE = VW('081-narrator', 'brakes'), BLANK = VW('135-narrator', 'blank');

  // ---- music: a light groove like the reference (~100–120 BPM, the tempo and the kit change with the story)
  //  level 0 pad · 1 + arpeggio · 2 + bass + hi-hat · 3 + kick + clap. One chord per bar (4 beats).
  function groove(t0, t1, chords, o = {}) {
    if (!(t1 > t0 + 0.5)) return;
    const bpm = o.bpm ?? 110, lv = o.lv ?? 2, beat = 60 / bpm, bar = beat * 4, mv = o.v ?? 1;
    to = 'm';
    for (let i = 0, t = t0; t < t1 - 0.25; i++, t += bar) {
      const ch = chords[i % chords.length], end = Math.min(t1, t + bar), up = ch.map((n) => nz(n) * 2);
      pad(t, end + 0.2, ch.slice(0, 3), 0.018 * mv, { type: 'triangle', cut: o.cut ?? 1000, att: 0.3, rel: 0.25, send: 0.45 });
      for (let s = 0; s < 8; s++) {                                     // 8ths
        const ts = t + s * beat / 2; if (ts >= end - 0.03) break;
        if (lv >= 1 && (lv >= 2 || s % 2 === 0)) pluck(ts, up[[0, 1, 2, 3, 2, 1, 2, 3][s] % up.length], (s === 0 ? 0.05 : 0.038) * mv, s % 2 ? 0.25 : -0.25, 0.5, o.bright ?? 2000, 0.35);
        if (lv >= 2) noiseHit(ts, 0.03, 'highpass', 8000, 0.7, (s % 2 ? 0.018 : 0.01) * mv, 0.3);           // hi-hat
        if (lv >= 2 && (s === 0 || s === 3 || s === 4)) bass(ts, nz(ch[0]) / 2, 0.06 * mv);                  // bass: 1, and-of-2, 3
        if (lv >= 3 && (s === 0 || s === 4 || s === 5)) sub(ts, (s === 5 ? 0.06 : 0.11) * mv);              // kick: 1, 3, and-of-3
        if (lv >= 3 && (s === 2 || s === 6)) { noiseHit(ts, 0.13, 'bandpass', 1900, 0.8, 0.045 * mv, 0, 0.3); noiseHit(ts, 0.05, 'highpass', 4500, 0.7, 0.02 * mv); }   // clap
      }
    }
  }
  const D = ['D3', 'A3', 'Fs4', 'D4'], A = ['A2', 'E3', 'Cs4', 'A3'], Bm = ['B2', 'Fs3', 'D4', 'B3'], G = ['G2', 'D3', 'B3', 'G3'];
  const Em = ['E3', 'B3', 'G4', 'E4'], C = ['C3', 'G3', 'E4', 'C4'], Dm = ['D3', 'A3', 'F4', 'D4'], Bb = ['Bb2', 'F3', 'D4', 'Bb3'], Gm = ['G2', 'D3', 'Bb3', 'G3'];
  const tBus = SK('s04_busWide'), tMon = SK('s05_monday'), tCorner = SK('s06_noOneSees'), tRev = SK('s07_review'), tFact = SK('s07_thousand');
  const tDad = SK('s08_itsDad'), tNight = SK('s08_night'), tCta = SK('s08_cta'), tKitchen = SK('s05_night'), tWalk = SK('s08_walkHome');
  groove(0.4, SK('s01_title'), [D, A, Bm, G], { bpm: 110, lv: 2 });                              // lunch, the hook: curious
  groove(SK('s01_title'), SK('s02_plus'), [D, A, Bm, G], { bpm: 112, lv: 2, v: 1.1 });            // the title, the rules
  groove(SK('s02_plus'), SK('s03_minus'), [D, A, Bm, G], { bpm: 118, lv: 3 });                    // PLUS: the fun montage
  groove(SK('s03_minus'), SK('s03_st-every'), [Bm, G, D, A], { bpm: 104, lv: 2, v: 0.9 });        // MINUS
  groove(SK('s03_st-every'), SK('s03_st-fade'), [Bm, G, D, A], { bpm: 120, lv: 3 });              // the accidents
  groove(SK('s03_st-fade'), SK('s04_cap'), [G, D, A, Bm], { bpm: 104, lv: 1, v: 0.9 });           // nobody sees the disaster
  groove(SK('s04_cap'), tBus, [D, G, A, D], { bpm: 100, lv: 2 });                                 // Dad
  groove(tBus, LT('074-narrator'), [Dm, Bb, Gm, A], { bpm: 92, lv: 1, cut: 700, v: 0.9 });        // the night bus
  // the build: a heartbeat that quickens into "brakes", then nothing
  to = 'm';
  pad(LT('074-narrator'), BRAKE, ['D3', 'A3', 'Eb4'], 0.03, { type: 'sawtooth', cut: 600, att: 1.5, rel: 0.05, send: 0.3, swellTo: 0.05, swellAt: BRAKE - 0.2 });
  for (let t = LT('074-narrator'), k = 0; t < BRAKE - 0.15; k++) { bass(t, nz('D2'), 0.09); bass(t + 0.16, nz('D2'), 0.06); noiseHit(t, 0.03, 'highpass', 8000, 0.7, 0.012); t += Math.max(0.36, 0.9 - k * 0.03); }
  groove(TRUCK + 1.6, tMon, [['D3', 'A3', 'F4']], { bpm: 70, lv: 0, cut: 600, v: 0.8 });          // aftermath
  groove(tMon, tKitchen, [Bm, G, D, A], { bpm: 96, lv: 1 });                                      // Voss
  groove(tKitchen, tCorner, [Bm, G, D, A], { bpm: 80, lv: 1, v: 0.8, bright: 1400 });             // the kitchen
  groove(tCorner, tRev, [D, A, Bm, G], { bpm: 118, lv: 3 });                                      // the corner: hope
  groove(tRev, tFact, [Em, C, G, D], { bpm: 100, lv: 1 });                                        // the review
  groove(tFact, tWalk, [D, G, A, D], { bpm: 120, lv: 3, v: 1.1 });                                // the facts, the fix
  groove(tWalk, BLANK - 0.05, [D, G, A, D], { bpm: 104, lv: 1 });                                 // walking home
  groove(tDad, tNight, [D, G, Bm, A], { bpm: 100, lv: 2 });                                       // Dad caught you
  groove(tNight, tCta, [Bm, ['G2', 'D3', 'A3', 'G3']], { bpm: 90, lv: 1, cut: 650, v: 0.8 });    // the message
  groove(tCta, DURATION - 7, [D, A, Bm, G], { bpm: 116, lv: 3 });                                 // the CTA
  groove(DURATION - 7, DURATION - 1.2, [D, G], { bpm: 116, lv: 1 });                              // outro

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
    pop:    (t, v, p) => { tone(t, 380, 760, 0.07, 0.07 * v, 'sine', p); noiseHit(t, 0.03, 'bandpass', 1800, 0.9, 0.025 * v, p); },
    blip:   (t, v, p) => tone(t, 820, 1100, 0.05, 0.045 * v, 'sine', p),
    tick:   (t, v, p) => noiseHit(t, 0.015, 'bandpass', 2600, 3, 0.07 * v, p),
    click:  (t, v, p) => { noiseHit(t, 0.02, 'highpass', 2600, 0.8, 0.12 * v, p); tone(t, 1800, 1500, 0.02, 0.03 * v, 'square', p, 0); },
    thud:   (t, v, p) => { sub(t, 0.18 * v); noiseHit(t, 0.06, 'lowpass', 900, 0.7, 0.07 * v, p); },
    impact: (t, v, p) => { sub(t, 0.6 * v); noiseHit(t, 0.35, 'lowpass', 2200, 0.6, 0.3 * v, p, 0.3, 300); noiseHit(t, 0.08, 'highpass', 2500, 0.7, 0.12 * v, p); },
    splash: (t, v, p) => { noiseHit(t, 0.4, 'bandpass', 1400, 0.9, 0.16 * v, p, 0.25, 500); noiseHit(t + 0.04, 0.25, 'highpass', 3500, 0.8, 0.06 * v, p); for (let i = 0; i < 4; i++) tone(t + 0.05 + i * 0.05, 900 + i * 300, 500 + i * 200, 0.05, 0.02 * v, 'sine', p); },
    drip:   (t, v, p) => tone(t, 1400, 700, 0.06, 0.05 * v, 'sine', p, 0.3),
    paper:  (t, v, p) => { noiseHit(t, 0.14, 'highpass', 3200, 0.6, 0.08 * v, p, 0.1, 6500); noiseHit(t + 0.07, 0.08, 'bandpass', 2400, 1, 0.04 * v, p); },
    cloth:  (t, v, p) => noiseHit(t, 0.18, 'bandpass', 1100, 0.7, 0.09 * v, p, 0.05, 500),
    step:   (t, v, p) => { noiseHit(t, 0.05, 'lowpass', 750, 0.8, 0.09 * v, p); sub(t, 0.03 * v); },
    slide:  (t, v, p) => noiseHit(t, 0.3, 'bandpass', 1700, 1.6, 0.07 * v, p, 0.05, 900),
    glass:  (t, v, p) => { noiseHit(t, 0.25, 'highpass', 4500, 0.9, 0.09 * v, p, 0.3); chime(t, [1760, 2349], 0.02 * v, p); },
    metal:  (t, v, p) => { chime(t, [420, 990], 0.04 * v, p); noiseHit(t, 0.05, 'bandpass', 2200, 2, 0.06 * v, p); },
    beep:   (t, v, p) => tone(t, 1000, 1000, 0.08, 0.025 * v, 'square', p, 0),
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
    coin:   (t, v, p) => { tone(t, 523, 523, 0.18, 0.045 * v, 'triangle', p, 0.2); tone(t + 0.07, 784, 784, 0.22, 0.04 * v, 'triangle', p, 0.2); },
    ding:   (t, v, p) => { tone(t, 587, 587, 0.25, 0.04 * v, 'triangle', p, 0.25); tone(t, 880, 880, 0.2, 0.02 * v, 'sine', p, 0.25); },
    camera: (t, v, p) => { noiseHit(t, 0.03, 'highpass', 3000, 0.8, 0.1 * v, p); noiseHit(t + 0.06, 0.04, 'highpass', 2600, 0.8, 0.07 * v, p); },
    type:   (t, v, p, d = 0.6) => { for (let i = 0; i < d * 14; i++) noiseHit(t + i / 14 + (i % 3) * 0.008, 0.015, 'bandpass', 3500, 3, 0.05 * v, p); },
    heart:  (t, v, p) => { sub(t, 0.2 * v); sub(t + 0.16, 0.12 * v); },
    shimmer:(t, v, p) => chime(t, [nz('A4'), nz('E5'), nz('A5')], 0.022 * v, p),
    ghost:  (t, v, p) => { sweep(t - 0.4, t + 0.02, 0.045 * v, 1800, 600, p); chime(t, [nz('E5'), nz('B5')], 0.018 * v, p); },
    rise:   (t, v, p, d = 1.2) => riser(t, t + d, 0.06 * v),
    drop:   (t, v, p) => { tone(t, 600, 90, 0.5, 0.08 * v, 'sine', p, 0.3); sub(t + 0.3, 0.1 * v); },
    crowd:  (t, v, p, d = 2) => { for (let i = 0; i < d * 3; i++) noiseHit(t + i / 3, 0.5, 'bandpass', 600 + (i % 4) * 150, 0.5, 0.025 * v, ((i % 5) - 2) * 0.2, 0.3); },
    plastic:(t, v, p) => { noiseHit(t, 0.05, 'bandpass', 1900, 2, 0.12 * v, p); tone(t, 700, 500, 0.04, 0.03 * v, 'triangle', p, 0); },
  };
  window.SFX_KINDS_LIST = Object.keys(SFX_KINDS);
  // the same kind twice within 50 ms plays once (the louder); everything else plays as registered
  // balance (user, 2026-10-24: too many, the "ding" is annoying): a minimum gap per kind, and at most 2 sounds in any
  // 0.35 s only one sound (a second only if it is a big one, v ≥ 1.3) → ~70 a minute. Louder cues are placed first so they win the slots.
  const GAP = { ding: 12, coin: 8, shimmer: 4, ghost: 1.5, tick: 0.6, blip: 0.6, pop: 0.4, beep: 1, drip: 1.5, step: 0.2, swish: 0.5, cloth: 0.5,
    heart: 0.6, laugh: 3, gasp: 2, glass: 1.5, metal: 0.6, bounce: 0.3, thud: 0.3, paper: 0.6, click: 0.3, whoosh: 0.6, wiper: 1.1, slide: 0.5 };
  const SFX_PLAY = [], lastAt = {}, placed = [];
  for (const e of [...SFX_REG].sort((x, y) => (y[2] ?? 1) - (x[2] ?? 1) || x[0] - y[0])) {
    const [t, k, v] = e; if (!SFX_KINDS[k] || !(t >= 0 && t < DURATION)) continue;
    const g = GAP[k] ?? 0.05, mine = lastAt[k] || (lastAt[k] = []);
    if (mine.some((u) => Math.abs(u - t) < g)) continue;
    const near = placed.filter((u) => Math.abs(u - t) < 0.35).length;
    if (near >= 1 && (v ?? 1) < 1.3) continue;
    mine.push(t); placed.push(t); SFX_PLAY.push(e);
  }
  SFX_PLAY.sort((x, y) => x[0] - y[0]);
  window.SFX_PLAYED = SFX_PLAY.length;
  for (const [t, k, v, p, d] of SFX_PLAY) {
    const f = SFX_KINDS[k];
    const tt = Math.max(t, 0.05 + (['whoosh', 'swish', 'ghost', 'car', 'rise'].includes(k) ? (k === 'car' ? (d ?? 1.4) / 2 : 0.45) : 0));
    try { f(tt, v ?? 1, clamp(p ?? 0, -1, 1), d); } catch (e) { console.warn('sfx skipped', k, t, e.message); }
  }
