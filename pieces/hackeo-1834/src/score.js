  // SCORE BODY — el primer hackeo, 70 s. An 8-bit documentary score in D minor, 120 BPM. Like the reference, a
  // continuous BED carries the weight under the melody from the first frame: a held pulse-wave bass (root, with a
  // sine sub an octave down) and held three-note chords, one chord per bar. On top: pulse arps, the theme, noise drums.
  // Silence 30.0–31.0, the loudest hit at 31.0 (the fake red symbol). Story-time cues are mapped to video time with NT.
  const T = TIMELINE, cu = T.cues, BAR = 4 * BEAT, C = (k) => NT(cu[k]);
  const pulseWave = (duty) => { const N = 32, re = new Float32Array(N), im = new Float32Array(N); for (let n = 1; n < N; n++) { re[n] = (2 / (n * Math.PI)) * Math.sin(2 * Math.PI * n * duty); im[n] = (2 / (n * Math.PI)) * (1 - Math.cos(2 * Math.PI * n * duty)); } return ac.createPeriodicWave(re, im); };
  const PW = { 12: pulseWave(0.125), 25: pulseWave(0.25), 50: pulseWave(0.5) };
  const F = (n) => (typeof n === 'number' ? n : nz(n));
  // a plucked pulse note (decaying) and a HELD pulse/sine note (attack, sustain, release)
  const pul = (t, n, vel, dur = 0.12, o = {}) => {
    const f = F(n), o1 = ac.createOscillator(); o1.setPeriodicWave(PW[o.duty ?? 25]); o1.frequency.setValueAtTime(f, t);
    if (o.vib && dur > 0.3) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + dur * 0.6); l.connect(lg); lg.connect(o1.frequency); l.start(t); l.stop(t + dur + 0.05); }
    if (o.slide) o1.frequency.exponentialRampToValueAtTime(f * o.slide, t + dur);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.cut ?? 3400;
    const g = ac.createGain(); env(g, t, 0.004, vel, dur); o1.connect(lp); lp.connect(g); out(g, o.pan ?? 0, o.send ?? 0.12);
    o1.start(t); o1.stop(t + dur + 0.06);
  };
  const hold = (t, dur, n, vel, o = {}) => {
    const f = F(n), o1 = ac.createOscillator(); if (o.wave === 'sine' || o.wave === 'triangle') o1.type = o.wave; else o1.setPeriodicWave(PW[o.duty ?? 25]);
    o1.frequency.setValueAtTime(f, t);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.cut ?? 1200;
    const g = ac.createGain(), a = o.att ?? 0.03, r = Math.min(o.rel ?? 0.08, dur * 0.4);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + a); g.gain.setValueAtTime(vel * (o.sus ?? 0.85), t + Math.max(a, dur - r)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.connect(lp); lp.connect(g); out(g, o.pan ?? 0, o.send ?? 0.15); o1.start(t); o1.stop(t + dur + 0.05);
  };
  const tri = (t, n, vel, dur = 0.22) => { const g = ac.createGain(); env(g, t, 0.004, vel, dur); osc('triangle', F(n), t, t + dur + 0.05).connect(g); out(g, 0, 0); };
  const hat = (t, vel) => noiseHit(t, 0.025, 'highpass', 8000, 0.8, vel, 0.12);
  const snare = (t, vel) => noiseHit(t, 0.09, 'bandpass', 1900, 0.9, vel, -0.05, 0.1);
  const kick = (t, vel) => { const o = osc('triangle', 150, t, t + 0.14); o.frequency.exponentialRampToValueAtTime(45, t + 0.1); const g = ac.createGain(); env(g, t, 0.002, vel, 0.12); o.connect(g); out(g); };
  // chords: bass root, held chord voices, arp notes
  const CH = {
    Dm: ['D2', ['D3', 'F3', 'A3'], ['D4', 'F4', 'A4', 'D5']], Bb: ['As1', ['As2', 'D3', 'F3'], ['As3', 'D4', 'F4', 'As4']],
    F: ['F2', ['F3', 'A3', 'C4'], ['F4', 'A4', 'C5', 'F5']], C: ['C2', ['C3', 'E3', 'G3'], ['C4', 'E4', 'G4', 'C5']],
    Gm: ['G1', ['G2', 'As2', 'D3'], ['G3', 'As3', 'D4', 'G4']], A: ['A1', ['A2', 'Cs3', 'E3'], ['A3', 'Cs4', 'E4', 'A4']],
    D: ['D2', ['D3', 'Fs3', 'A3'], ['D4', 'Fs4', 'A4', 'D5']],
  };
  const PROG = ['Dm', 'Bb', 'F', 'C'];
  // ONE harmonic map for the whole piece: [section start (video time), progression]. Bars are counted from each
  // section's start, so every chord change lands where the section (and the melody) begins its bar.
  const HAR = [[0, ['Dm', 'Bb']], [3.5, ['Dm', 'A']], [7, ['Dm', 'Bb']], [10.5, PROG], [18, PROG], [27.5, ['Dm', 'A']], [29.9, ['Dm']],
               [31, ['Dm']], [36, PROG], [41, ['Dm', 'Bb', 'C', 'A']], [46.5, PROG], [50.5, ['Dm', 'Gm']], [54, ['Dm', 'A']], [57.5, ['Dm']],
               [60, ['Bb', 'F', 'C']], [65, ['C', 'Dm']], [69, ['D']]];
  const harAt = (t) => { let i = 0; while (i + 1 < HAR.length && HAR[i + 1][0] <= t + 1e-6) i++; return i; };
  const chordAt = (t) => { const [s0, prog] = HAR[harAt(t)]; return CH[prog[Math.floor((t - s0) / BAR + 1e-6) % prog.length]]; };
  const barEnd = (t) => { const i = harAt(t), s0 = HAR[i][0], nb = s0 + (Math.floor((t - s0) / BAR + 1e-6) + 1) * BAR; return Math.min(nb, i + 1 < HAR.length ? HAR[i + 1][0] : 1e9); };
  // THE BED: one chord per bar, held. bass = pulse 50% low-passed + a sine sub an octave down; chord = 25% pulse voices
  function bed(t0, t1, vel, o = {}) {
    for (let t = t0; t < t1 - 1e-6; ) {
      const next = Math.min(t1, barEnd(t)), d = next - t, [root, voices] = chordAt(t);
      hold(t, d, root, vel * 1.1, { duty: 50, cut: 420, att: 0.02, rel: 0.06, send: 0 });
      hold(t, d, F(root) / 2, vel * 1.3, { wave: 'sine', att: 0.03, rel: 0.08, send: 0 });
      if (o.chords !== false) voices.forEach((n, i) => hold(t, d, n, vel * (o.chordVel ?? 0.42), { duty: 25, cut: o.cut ?? 1300, att: 0.05, rel: 0.1, pan: (i - 1) * 0.3, send: 0.25 }));
      if (o.pump) for (let b = t + BEAT; b < next - 1e-6; b += BEAT) hold(b, Math.min(BEAT, next - b), root, vel * 0.5, { duty: 50, cut: 380, att: 0.01, rel: 0.05, send: 0 });
      t = next;
    }
  }
  // arps and drums on top, by density 0..3; the backbeat counts from the section's start, like the bars
  function groove(t0, t1, dens, o = {}) {
    const step = dens >= 2 ? E16 : E8;
    for (let t = t0; t < t1 - 1e-6; t += step) {
      const s0 = HAR[harAt(t)][0], arp = chordAt(t)[2], k = Math.round((t - t0) / step), r = (t - s0) / BEAT, bi = Math.round(r), onBeat = Math.abs(r - bi) < 1e-3, on8 = Math.abs(r * 2 - Math.round(r * 2)) < 1e-3;
      pul(t, arp[k % 4], (o.arpVel ?? 0.02) * (k % 2 ? 0.75 : 1), step * 0.8, { duty: 12, cut: 2600, pan: k % 2 ? 0.25 : -0.25 });
      if (dens >= 1 && on8) hat(t, 0.012);
      if (dens >= 2 && onBeat && bi % 2 === 1) snare(t, 0.05);
      if (dens >= 3 && onBeat) kick(t, 0.16);
    }
  }
  // the theme, harmonised bar by bar to Dm – Bb – F – C (chord tones on the strong beats); [note, start 8th, length 8ths]
  const THEME = [['D5', 0, 2], ['F5', 2, 1], ['A5', 3, 3], ['G5', 6, 1], ['F5', 7, 1],
                 ['F5', 8, 2], ['D5', 10, 2], ['As4', 12, 2], ['C5', 14, 1], ['D5', 15, 1],
                 ['C5', 16, 2], ['F5', 18, 1], ['A5', 19, 3], ['G5', 22, 1], ['F5', 23, 1],
                 ['E5', 24, 2], ['G5', 26, 1], ['E5', 27, 2], ['D5', 29, 1], ['C5', 30, 2]];
  const theme = (t0, vel, o = {}) => THEME.forEach(([n, a, l]) => { const t = t0 + a * E8; if (a >= (o.from ?? 0) * 8 && a < (o.to ?? 4) * 8 && t < (o.until ?? 1e9)) pul(t - (o.from ?? 0) * BAR, n, vel, Math.min(l * E8 * 0.92, (o.until ?? 1e9) - t), { duty: o.duty ?? 50, vib: true, cut: 3000, pan: 0.05, send: 0.25 }); });

  to = 'm';
  // 0–10.5 the network: the bed from the first frame, arps join, the theme enters on the codebook
  bed(0, 10.5, 0.03);
  groove(0, 3.5, 0, { arpVel: 0.012 });
  groove(3.5, 10.5, 0, { arpVel: 0.017 });
  theme(7.0, 0.022, { to: 1.75 });
  // 10.5–18 the chain and the map: 16ths, hats, the theme
  bed(10.5, 18.0, 0.032, { pump: true });
  groove(10.5, 18.0, 2, { arpVel: 0.014 });
  theme(10.5, 0.026, { until: 17.95 });
  // 18–27.5 the twins and the coach: drums, the theme again
  bed(18.0, 27.5, 0.034, { pump: true });
  groove(18.0, 27.5, 3, { arpVel: 0.016 });
  theme(18.0, 0.024, { duty: 25 });
  for (let k = 0; k < 12; k++) pul(26.0 + k * E8, ['D5', 'A4', 'F5', 'A4'][k % 4], 0.016, E8 * 0.8, { duty: 25, pan: -0.2 });
  // 27.5–30 the idea: busy but held back; everything stops dead at 29.9 (silence 30–31)
  bed(27.5, 29.9, 0.026);
  groove(27.5, 29.875, 2, { arpVel: 0.018 });
  for (let k = 0; k < 8; k++) pul(27.5 + k * E8, ['A5', 'F5', 'D5', 'F5', 'A5', 'G5', 'E5', 'Cs5'][k], 0.012, E16 * 1.5, { duty: 12, pan: 0.3 });
  // 31 THE HIT: a D-minor stab + sub, then a flat held chord over a held bass
  const H = C('hit');
  ['D3', 'A3', 'D4', 'F4', 'A4'].forEach((n, i) => pul(H, n, 0.075, 0.45, { duty: 50, cut: 4200, pan: (i - 2) * 0.15, send: 0.3 }));
  hold(H, 0.5, 'D1', 0.09, { wave: 'sine', att: 0.005, rel: 0.3, send: 0 }); sub(H, 0.5);
  bed(H + 0.5, 36.0, 0.03, { chordVel: 0.35, cut: 900 });
  // 36–50.5 the scheme runs: theme, a run into the relay, full at the buy
  bed(36.0, 41.0, 0.036, { pump: true });
  groove(36.0, 41.0, 2, { arpVel: 0.02 });
  theme(36.0, 0.03, { duty: 50, until: 40.95 });
  bed(41.0, 46.5, 0.04, { pump: true });
  groove(41.0, 46.5, 3, { arpVel: 0.022 });
  ['D5', 'E5', 'F5', 'G5', 'A5', 'As5', 'C6', 'D6'].forEach((n, k) => pul(41.5 + k * E16, n, 0.016, E16 * 0.8, { duty: 12, pan: -0.2 }));
  bed(46.5, 50.5, 0.042, { pump: true });
  groove(46.5, 50.5, 3, { arpVel: 0.022 });
  theme(46.5, 0.034, { duty: 25, until: 50.45 });
  // 50.5–60 it falls apart: thin, then the court's low bed, then near silence on the black
  bed(50.5, 54.0, 0.016, { chordVel: 0.3, cut: 900 });
  groove(50.5, 52.5, 0, { arpVel: 0.006 });
  bed(54.0, 57.5, 0.022, { chordVel: 0.4, cut: 1000 });
  bed(57.5, 60.0, 0.018, { chordVel: 0.5, cut: 900 });
  // 60–65 the law, solemn; the masts arrive with a digital shimmer (on the grid)
  bed(60.0, 65.0, 0.014, { chordVel: 0.38, cut: 1000 });
  for (let k = 0; k < 12; k++) pul(63.0 + k * E16, ['C6', 'G5', 'E6', 'G5'][k % 4], 0.006 + k * 0.0005, E16 * 0.6, { duty: 12, pan: (k % 2 ? 0.4 : -0.4) });
  // 65–70 today, then the title: the theme's first bar on the Dm bar, resolving to D major
  bed(65.0, 69.0, 0.014, { chordVel: 0.35 });
  groove(65.0, 67.0, 1, { arpVel: 0.006 });
  theme(67.0, 0.014, { to: 1 });
  bed(69.0, 70.6, 0.012, { chordVel: 0.5 });
  pul(69.0, 'D5', 0.014, 1.4, { duty: 50, vib: true, send: 0.3 }); pul(69.0, 'Fs5', 0.01, 1.4, { duty: 50, send: 0.3 });

  to = 's';
  // ---- sound effects, all with a chiptune voice
  const clack = (t, vel = 0.06) => { noiseHit(t, 0.03, 'bandpass', 1800, 2.5, vel, 0.1); noiseHit(t + 0.01, 0.07, 'bandpass', 700, 3, vel * 0.9, 0.1); pul(t, 'A2', vel * 0.4, 0.05, { duty: 50, cut: 900 }); };
  const pop = (t, vel = 0.045, hi = false) => { noiseHit(t, 0.012, 'highpass', 5000, 0.7, vel * 0.6); pul(t, hi ? 'E6' : 'C6', vel, 0.05, { duty: 25, send: 0.1 }); pul(t + 0.05, hi ? 'B6' : 'G6', vel, 0.09, { duty: 25, send: 0.15 }); };
  const bigNum = (t, vel = 0.05) => { ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pul(t + i * 0.03, n, vel, 0.07, { duty: 25, send: 0.15 })); kick(t, 0.12); };
  const coin = (t, vel = 0.045) => { pul(t, 'B5', vel, 0.07, { duty: 25 }); pul(t + 0.07, 'E6', vel, 0.3, { duty: 25, send: 0.2 }); };
  const tick = (t, vel = 0.03) => { pul(t, 'G5', vel, 0.03, { duty: 12, cut: 5000 }); noiseHit(t, 0.01, 'highpass', 6000, 0.7, vel * 0.5); };
  const buzz = (t, vel = 0.04, dur = 0.35) => { pul(t, 'E4', vel, dur, { duty: 12, cut: 2200 }); pul(t, 'F4', vel, dur, { duty: 12, cut: 2200 }); pul(t + 0.12, 'E4', vel, dur * 0.7, { duty: 12, cut: 2200 }); };
  const stamp = (t, vel = 0.1) => { sub(t, vel); noiseHit(t, 0.08, 'lowpass', 1400, 0.7, vel * 0.8); pul(t, 'D2', vel * 0.5, 0.15, { duty: 50, cut: 700 }); };
  // arm clacks (story times)
  [1.0, 1.9, 2.5, 3.1, 4.2, 5.4].forEach((t) => clack(NT(t)));
  for (const t0 of [10.5, 11.1, 11.7, 12.3, 12.9, 13.5]) { clack(NT(t0 + 0.8), 0.05); clack(NT(t0 + 0.4), 0.035); clack(NT(t0), 0.022); }
  clack(C('err'), 0.06); clack(H, 0.07); clack(NT(30.0), 0.06); clack(NT(30.8), 0.05);
  // the red flash on "hackeada": a falling, detuned zap
  pul(C('red'), 'A5', 0.05, 0.4, { duty: 12, slide: 0.5, send: 0.3 }); pul(C('red'), 'As5', 0.035, 0.4, { duty: 12, slide: 0.5 });
  // typing: a pulse tick every other glyph of every caption, at the caption's real typing speed
  const kOf = (t) => { for (let i = SHOT_LIST.length - 1; i >= 0; i--) if (t >= SHOT_LIST[i][3] - 1e-6) return SHOT_LIST[i][5]; return 1; };
  CAPS.forEach(([t0, s], i) => {
    if (!s) return; const prev = i > 0 ? CAPS[i - 1][1] : null, pre = prev && s.startsWith(prev) ? prev.length : 0, n = s.length - pre;
    const next = i + 1 < CAPS.length ? NT(CAPS[i + 1][0]) : DURATION, r0 = NT(t0), cps = 30 * kOf(t0);
    for (let k = 0; k < n; k += 2) { const t = r0 + k / cps; if (t >= next || (t > 29.9 && t < 31.0)) break; pul(t, 1900 + ((k * 37) % 5) * 60, 0.013, 0.014, { duty: 12, cut: 6000, send: 0 }); }
  });
  for (let k = 0; k < 27; k += 2) pul(C('nolaw') + k / 24, 1600, 0.014, 0.016, { duty: 12, cut: 5000, send: 0 });
  // numbers and labels
  bigNum(NT(cu.arms + 0.3)); bigNum(NT(cu.arms + 1.5));
  pop(C('brothers')); pop(NT(cu.brothers + 0.4), 0.045, true); pop(NT(cu.op + 0.4)); pop(NT(cu.book + 1.4));
  pop(NT(cu.book + 1.1), 0.035, true);
  for (let k = 1; k <= 4; k++) tick(NT(22.3 + k * 0.64), 0.035);
  for (let k = 1; k <= 2; k++) bigNum(NT(44.5 + k * 0.6), 0.035);
  // the codebook: pages, a finger sliding; loupes opening
  sweep(C('book') - 0.05, C('book') + 0.2, 0.025, 700, 3000);
  noiseHit(NT(cu.book + 0.5), 0.25, 'highpass', 3000, 0.7, 0.025, 0.2); noiseHit(NT(cu.book + 0.8), 0.2, 'highpass', 3500, 0.7, 0.02, -0.2);
  for (const k of ['op', 'spy', 'sick']) sweep(C(k) - 0.05, C(k) + 0.2, 0.025, 700, 3000);
  sweep(NT(cu.parcel + 1.5) - 0.05, NT(cu.parcel + 1.5) + 0.2, 0.025, 700, 3000);
  // the map lighting up tower by tower, then the stamp
  for (let k = 0; k < 10; k++) tick(NT(14.5 + k * 0.15), 0.02 + k * 0.002);
  stamp(C('stamp'));
  // the rich beat: coins pouring
  for (let k = 0; k < 11; k++) pul(NT(cu.rich + k / 6), k % 2 ? 'E6' : 'B5', 0.022, 0.05, { duty: 25, pan: 0.3 });
  pop(C('rich'), 0.04, true);
  // hooves
  for (let t = C('coach') - 0.1; t < 27.4; t += BEAT / 2) { noiseHit(t, 0.04, 'lowpass', 900, 1, 0.045, -0.3); noiseHit(t + 0.09, 0.04, 'lowpass', 800, 1, 0.032, -0.3); }
  for (let t = NT(42.6); t < NT(43.6); t += BEAT / 2) { noiseHit(t, 0.04, 'lowpass', 900, 1, 0.05, -0.5); noiseHit(t + 0.09, 0.04, 'lowpass', 800, 1, 0.035, -0.5); }
  // ERROR: a sour buzz; the fake symbol's label: a falling dissonance; LIMPIA: a clean chime
  buzz(NT(cu.err + 0.2)); buzz(NT(30.1), 0.035, 0.25);
  pul(NT(29.05), 'Gs5', 0.035, 0.25, { duty: 12, slide: 0.7 });
  chime(NT(cu.clean + 0.2), [nz('A5'), nz('D6')], 0.03); stamp(NT(cu.clean + 0.2), 0.05);
  // the bribe: a low thud and a coin; the parcel's bell
  tri(C('bribe'), 'D2', 0.12, 0.5); coin(NT(cu.bribe + 0.3), 0.035); pop(NT(cu.bribe + 0.3), 0.03);
  chime(NT(cu.parcel + 2.0), [nz('E6'), nz('B6')], 0.025); pop(NT(cu.parcel + 2.0), 0.035, true);
  // the relay: each red tower ticks; the spy label
  for (let k = 0; k < 9; k++) tick(NT(cu.relay + k * 0.18), 0.025);
  pop(NT(cu.spy + 0.6));
  // the buy: ¡COMPRA! coin, the coach's label, the price going up; coins through the two years
  coin(C('buy'), 0.05); pop(NT(43.0), 0.035);
  for (let k = 0; k < 4; k++) pul(NT(43.6) + k * 0.05, nz('A5') * 2 ** (k * 4 / 12), 0.03, 0.05, { duty: 12 });
  for (let k = 0; k < 14; k++) pul(NT(44.5 + k * 0.2), k % 2 ? 'E6' : 'B5', 0.01, 0.05, { duty: 25, pan: 0.3 });
  pop(NT(cu.sick + 0.7), 0.03);
  // the gavel, twice: wood on wood
  for (const [t, v] of [[C('gavel'), 0.08], [NT(cu.gavel + 0.32), 0.05], [NT(cu.jury + 0.9), 0.07], [NT(cu.jury + 1.22), 0.045]]) { noiseHit(t, 0.06, 'bandpass', 900, 1.5, v, 0, 0.35); sub(t, v * 0.6); }
  // the law: paper drop; the masts: data chirps; labels; the title typing
  noiseHit(C('law'), 0.3, 'highpass', 2500, 0.7, 0.03); stamp(C('law'), 0.04);
  for (let k = 0; k < 10; k++) blip(NT(55.2) + k * 0.18, 2400 + (k % 3) * 300, 3200, 0.03, 0.01, (k % 2 ? 0.4 : -0.4));
  pop(NT(55.6), 0.03, true); pop(NT(56.2), 0.03);
  for (let k = 0; k < 16; k += 2) pul(C('title') + k / 16, 1500, 0.012, 0.02, { duty: 12, cut: 5000, send: 0 });
