  // SCORE BODY — ¿cómo se forma una galaxia?, ~72 s, 120 BPM, under a narrator. Its own music: F# minor, a GROWING idea.
  // A walking bass (root, fifth, octave + a chromatic approach into each new chord) over a held sine sub, held 25 % chords
  // (F#m–D–A–C#, i–VI–III–V), a "stardust" arp that only climbs (12.5 % pulse with an echo three 16ths later),
  // a lead in tresillo (3+3+2) phrasing, a shaker shimmer, half-time drums that fill in as the galaxy grows.
  // Silence 43–44, the hit at 44.0 (the loupe on the black hole), the end lifts to F# major.
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
  const CH = {
    Fsm: ['Fs1', ['Fs2', 'A2', 'Cs3'], ['Fs4', 'A4', 'Cs5', 'Fs5']], Bm: ['B1', ['B2', 'D3', 'Fs3'], ['B3', 'D4', 'Fs4', 'B4']],
    D: ['D2', ['D3', 'Fs3', 'A3'], ['D4', 'Fs4', 'A4', 'D5']], Cs: ['Cs2', ['Cs3', 'F3', 'Gs3'], ['Cs4', 'F4', 'Gs4', 'Cs5']],
    A: ['A1', ['A2', 'Cs3', 'E3'], ['A3', 'Cs4', 'E4', 'A4']], E: ['E2', ['E3', 'Gs3', 'B3'], ['E4', 'Gs4', 'B4', 'E5']],
    Fs: ['Fs1', ['Fs2', 'As2', 'Cs3'], ['Fs4', 'As4', 'Cs5', 'Fs5']],
  };
  const P = ['Fsm', 'D', 'A', 'Cs'];
  const HAR = [[0, ['Fsm', 'D']], [6.25, ['Fsm']], [12.75, ['Fsm', 'Bm']], [17.5, ['Fsm', 'D', 'Bm', 'Cs']], [23.5, P], [29.5, ['Bm', 'D', 'Fsm', 'Cs']],
               [37.75, ['D', 'E', 'Fsm']], [43.0, ['Fsm']], [46.0, P], [50.75, ['D', 'E', 'A', 'A']], [57.0, ['Bm', 'Fsm', 'D', 'Cs']], [65.0, ['Bm', 'Cs']], [67.25, ['D', 'Fs']]];
  const harAt = (t) => { let i = 0; while (i + 1 < HAR.length && HAR[i + 1][0] <= t + 1e-6) i++; return i; };
  const chordAt = (t) => { const [s0, prog] = HAR[harAt(t)]; return CH[prog[Math.floor((t - s0) / BAR + 1e-6) % prog.length]]; };
  const barEnd = (t) => { const i = harAt(t), s0 = HAR[i][0], nb = s0 + (Math.floor((t - s0) / BAR + 1e-6) + 1) * BAR; return Math.min(nb, i + 1 < HAR.length ? HAR[i + 1][0] : 1e9); };
  // THE BED: held sine sub + held 25 % chord; o.walk: the walking bass (16ths 0 root, 6 fifth, 10 octave, 14 a semitone under the next root)
  function bed(t0, t1, vel, o = {}) {
    for (let t = t0; t < t1 - 1e-6; ) {
      const next = Math.min(t1, barEnd(t)), d = next - t, [root, voices] = chordAt(t), fr = F(root);
      hold(t, d, fr, vel * 1.5, { wave: 'sine', att: 0.04, rel: 0.1, send: 0 });
      if (o.chords !== false) voices.forEach((n, i) => hold(t, d, n, vel * (o.chordVel ?? 0.38), { duty: 25, cut: o.cut ?? 1500, att: 0.12, rel: 0.2, pan: (i - 1) * 0.4, send: 0.35 }));
      if (o.walk) { const s0 = HAR[harAt(t)][0], nx = next < t1 - 1e-6 ? F(chordAt(next + 0.01)[0]) : fr;
        for (let b = t; b < next - 1e-6; b += E16) { const p = Math.round((b - s0) / E16) % 16;
          if (p === 0) pul(b, fr * 2, vel * 1.4, E16 * 5, { duty: 50, cut: 900, send: 0 });
          if (p === 6) pul(b, fr * 3, vel * 1.0, E16 * 3.5, { duty: 50, cut: 900, send: 0 });
          if (p === 10) pul(b, fr * 4, vel * 0.9, E16 * 3.5, { duty: 50, cut: 900, send: 0 });
          if (p === 14 && next - b < E16 * 2.5) pul(b, nx * 2 * 0.9439, vel * 1.1, E16 * 1.8, { duty: 50, cut: 900, send: 0 }); } }
      else hold(t, d, fr * 2, vel * 0.9, { duty: 50, cut: 500, att: 0.03, rel: 0.08, send: 0 });
      t = next;
    }
  }
  const shaker = (t, vel) => noiseHit(t, 0.03, 'highpass', 6500, 0.7, vel, 0.25);
  const clap = (t, vel) => { noiseHit(t, 0.06, 'bandpass', 1400, 1.2, vel, -0.1, 0.08); noiseHit(t + 0.012, 0.05, 'bandpass', 1600, 1.2, vel * 0.7, 0.1, 0.08); };
  // stardust: the arp only climbs (four chord tones, octave up every 4), each note echoed 3 sixteenths later on the other side; drums by density
  function groove(t0, t1, dens, o = {}) {
    for (let t = t0; t < t1 - 1e-6; t += E16) {
      const s0 = HAR[harAt(t)][0], arp = chordAt(t)[2], k = Math.round((t - t0) / E16), p = Math.round((t - s0) / E16) % 16, av = o.arp ?? 0.014;
      if (av > 0 && (dens > 0 || k % 2 === 0)) { const f = F(arp[k % 4]) * (Math.floor(k / 4) % 2 ? 2 : 1), pan = Math.floor(k / 4) % 2 ? 0.4 : -0.4;
        pul(t, f, av * (k % 4 === 0 ? 1.2 : 0.8), E16 * 0.7, { duty: 12, cut: 3600, pan, send: 0.2 });
        if (t + 3 * E16 < t1) pul(t + 3 * E16, f, av * 0.35, E16 * 0.7, { duty: 12, cut: 2600, pan: -pan, send: 0.35 }); }
      if (dens >= 1) shaker(t, p % 4 === 2 ? 0.008 : 0.004);
      if (dens >= 2 && (p === 0 || p === 10)) kick(t, 0.16);
      if (dens >= 2 && p === 8) clap(t, 0.045);
      if (dens >= 3 && p === 6) kick(t, 0.12);
      if (dens >= 3 && (p === 4 || p === 12)) clap(t, 0.03);
      if (dens >= 3 && p % 4 === 2) noiseHit(t, 0.07, 'highpass', 7000, 0.7, 0.006, 0.2);
    }
  }
  // the lead: tresillo phrasing (3+3+2 eighths), harmonised F#m–D–A–C# bar by bar
  const THEME = [['Cs5', 0, 3], ['Fs5', 3, 3], ['A5', 6, 2],
                 ['A5', 8, 2], ['D6', 10, 2], ['Cs6', 12, 1], ['A5', 13, 3],
                 ['E5', 16, 3], ['A5', 19, 3], ['Cs6', 22, 2],
                 ['Gs5', 24, 3], ['F5', 27, 1], ['Gs5', 28, 2], ['Cs6', 30, 2, 1.0]];
  const LIFT = [['Fs5', 0, 3], ['A5', 3, 3], ['D6', 6, 2], ['E6', 8, 3], ['B5', 11, 3], ['Gs5', 14, 2], ['A5', 16, 6], ['Cs6', 22, 2], ['E6', 24, 8]];
  const theme = (t0, vel, o = {}) => (o.notes ?? THEME).forEach(([n, a, l, sl]) => { const t = t0 + a * E8; if (a < (o.to ?? 4) * 8 && t < (o.until ?? 1e9)) pul(t, n, vel, Math.min(l * E8 * 0.92, (o.until ?? 1e9) - t), { duty: o.duty ?? 50, vib: true, slide: sl, cut: 3200, pan: -0.05, send: 0.35 }); });

  to = 'm';
  // 0–6.25 the title: bed from frame 0, stardust alone
  bed(0, 6.25, 0.03);
  groove(0, 6.25, 0, { arp: 0.014 });
  // 6.25–12.75 the Big Bang: an F# drone, the stardust thins after the flash
  bed(6.25, 12.75, 0.026, { chordVel: 0.3 });
  groove(7.5, 12.75, 0, { arp: 0.008 });
  // 12.75–17.5 the dark ages: only the bed, low and dark
  bed(12.75, 17.5, 0.018, { chordVel: 0.3, cut: 700 });
  // 17.5–23.5 the web: the walking bass starts, shaker
  bed(17.5, 23.5, 0.03, { walk: true });
  groove(17.5, 23.5, 1, { arp: 0.012 });
  // 23.5–37.75 first stars and mergers: half-time drums, the theme
  bed(23.5, 29.5, 0.033, { walk: true });
  groove(23.5, 29.5, 2, { arp: 0.014 });
  theme(23.5, 0.022, { until: 29.4 });
  bed(29.5, 37.75, 0.034, { walk: true });
  groove(29.5, 37.75, 2, { arp: 0.015 });
  // 37.75–43 the disk and the arms: the busiest, full drums
  bed(37.75, 43.0, 0.03, { walk: true });
  groove(37.75, 43.0, 3, { arp: 0.014 });
  // 44 THE HIT: an F#-minor stab + sub, then a held chord under the loupe
  const H = C('hit');
  ['Fs2', 'Cs3', 'Fs3', 'A3', 'Cs4', 'Fs4'].forEach((n, i) => pul(H, n, 0.075, 0.55, { duty: 50, cut: 4400, pan: (i - 2.5) * 0.12, send: 0.35 }));
  hold(H, 0.7, 'Fs1', 0.11, { wave: 'sine', att: 0.005, rel: 0.4, send: 0 }); sub(H, 0.6);
  bed(H + 0.6, 46, 0.03, { chordVel: 0.4 });
  // 46–57 the centre and today: the payoff, everything in; the theme, then the lift in D–E–A
  bed(46, 50.75, 0.044, { walk: true });
  groove(46, 50.75, 3, { arp: 0.02 });
  theme(46, 0.032, { until: 50.7 });
  bed(50.75, 57, 0.044, { walk: true });
  groove(50.75, 57, 3, { arp: 0.02 });
  theme(50.75, 0.03, { notes: LIFT });
  // 57–71.6 Andromeda: thin and slow, then F# major at the end
  bed(57, 65, 0.016, { chordVel: 0.42 });
  groove(57, 65, 0, { arp: 0.008 });
  bed(65, 67.25, 0.014, { chordVel: 0.42 });
  bed(67.25, DURATION, 0.013, { chordVel: 0.5 });
  pul(69.25, 'As5', 0.012, 2.0, { duty: 50, vib: true, send: 0.4 }); pul(69.25, 'Cs6', 0.009, 2.0, { duty: 50, send: 0.4 });

  to = 's';
  const pop = (t, vel = 0.04, hi = false) => { noiseHit(t, 0.012, 'highpass', 5000, 0.7, vel * 0.6); pul(t, hi ? 'A6' : 'Fs6', vel, 0.05, { duty: 25, send: 0.1 }); pul(t + 0.05, hi ? 'E7' : 'Cs7', vel, 0.09, { duty: 25, send: 0.15 }); };
  const bigNum = (t, vel = 0.045) => { ['Fs5', 'A5', 'Cs6', 'Fs6'].forEach((n, i) => pul(t + i * 0.03, n, vel, 0.07, { duty: 25, send: 0.15 })); kick(t, 0.1); };
  const tick = (t, vel = 0.01) => { pul(t, 'Cs6', vel, 0.025, { duty: 12, cut: 5000, send: 0 }); };
  const whoosh = (t, d = 0.35, vel = 0.02, up = true) => sweep(t - d, t, vel, up ? 500 : 4000, up ? 4000 : 500);
  const ping = (t, n, vel = 0.03, pan = 0) => { pul(t, n, vel, 0.5, { duty: 12, vib: true, send: 0.45, pan }); pul(t + 0.006, F(n) * 2, vel * 0.4, 0.3, { duty: 25, send: 0.45, pan }); };
  // captions typing (soft, under the voice); cut whooshes (none into the silence or the hit)
  CAPS.forEach(([t0, lines, o = {}]) => { if (!lines) return; const n = lines.reduce((a, ln) => a + (typeof ln === 'string' ? ln.length : ln.reduce((b, s) => b + s[0].length, 0)), 0);
    if (!o.big) noiseHit(t0, 0.02, 'bandpass', 2500, 2, 0.015);
    for (let k = 0; k < n; k += 2) { const t = t0 + (o.big ? k / 22 : 0.15 + k / 30); if (t > 42.95 && t < 44) break; pul(t, 1900 + ((k * 37) % 5) * 60, 0.01, 0.014, { duty: 12, cut: 6000, send: 0 }); } });
  SHOT_LIST.slice(1).forEach(([t0]) => { if (Math.abs(t0 - 43) > 0.1 && Math.abs(t0 - 44) > 0.1) whoosh(t0, 0.3, 0.016); });
  // the cosmic clock ticks while it runs
  for (let t = 7.5; t < 50.9; t += 0.5) if (t < 42.9 || t >= 44.5) tick(t, 0.006);
  // 1: the title shimmers in
  chime(0.4, [nz('Fs5'), nz('Cs6'), nz('Fs6')], 0.018);
  // 2: the Big Bang: a riser from the point, the flash (sub + noise burst), the fireball roar thinning; "ni una estrella" (a falling pulse)
  riser(6.3, C('bang'), 0.025);
  sub(C('bang'), 0.09); noiseHit(C('bang'), 1.6, 'lowpass', 2400, 0.7, 0.05, 0, 0.4, 300); pul(C('bang'), 'Fs2', 0.05, 0.6, { duty: 50, slide: 0.5, send: 0.3 });
  noiseHit(C('bang') + 0.3, 4, 'lowpass', 600, 0.7, 0.012, 0, 0.3, 150);
  pul(C('nostar'), 'Cs5', 0.02, 0.9, { duty: 25, slide: 0.5, send: 0.4 });
  // 3: the dark: a low wind, far
  noiseHit(12.9, 4.4, 'lowpass', 300, 0.7, 0.01, 0, 0.3, 120);
  // 4: each filament draws on with a little zip upward
  for (let e = 0; e < 15; e++) { const t = C('web') + e * 0.22; pul(t, 300 + e * 25, 0.012, 0.25, { duty: 12, slide: 2.2, pan: Math.sin(e) * 0.6, send: 0.25 }); }
  pop(19.9, 0.025);
  // 5: gas falls (a soft downward sweep), each node ignites with a ping on the chord
  sweep(23.75, 26.0, 0.012, 3000, 400);
  { const ig = [0, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.15, 2.3, 2.45, 2.6], ns = ['Fs6', 'Cs6', 'A6', 'Fs6', 'Cs7', 'A6', 'E6', 'Fs6', 'Cs7', 'A6', 'Fs7', 'Cs7'];
    ig.forEach((d, i) => ping(C('ignite') + d, ns[i], 0.022, Math.sin(i * 1.7) * 0.6)); }
  // 6: satellites whistle in, each merger thumps
  cu.merge.forEach((tm, i) => { pul(tm - 1.0, 900 + i * 60, 0.008, 1.0, { duty: 12, slide: 0.4, pan: Math.sin(i * 2.4) * 0.6, send: 0.2 }); sub(tm, 0.05); noiseHit(tm, 0.25, 'lowpass', 1200, 0.8, 0.03, 0, 0.2, 200); pop(tm + 0.05, 0.022, i % 2 === 1); });
  // 7: the spin (cyclic sweeps), DISCO and the two arms
  for (let k = 0; k < 4; k++) sweep(38.4 + k * 0.55, 38.95 + k * 0.55, 0.01, 600, 1800, k % 2 ? 0.5 : -0.5);
  pop(40.0, 0.03); pop(41.9, 0.025, true); pop(42.2, 0.025, true);
  // 9: the loupe: the hit is in the music; then the accretion rumble, orbit blips, SAGITARIO A* and the mass
  noiseHit(H, 0.5, 'lowpass', 3000, 0.7, 0.04, 0, 0.4, 100);
  { const o = osc('sawtooth', 55, H + 0.3, 50.6); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, H + 0.3); g.gain.exponentialRampToValueAtTime(0.01, H + 1.5); g.gain.setValueAtTime(0.01, 50.0); g.gain.exponentialRampToValueAtTime(0.0001, 50.6); o.connect(lp); lp.connect(g); out(g, 0, 0.1); }
  for (let k = 0; k < 10; k++) blip(45.0 + k * 0.5, 1200, 1500, 0.04, 0.006, Math.sin(k) * 0.5);
  bigNum(C('sgr'), 0.035); bigNum(C('mass'), 0.04);
  // 10: HOY, the marker's double beep on "aquí"
  bigNum(C('today'), 0.04);
  for (let k = 0; k < 3; k++) { pul(C('here') + k * 0.5, 'A6', 0.022 - k * 0.005, 0.06, { duty: 50, send: 0.2 }); pul(C('here') + k * 0.5 + 0.1, 'A6', 0.022 - k * 0.005, 0.06, { duty: 50, send: 0.2 }); }
  // 11: Andromeda approaches (a slow riser), the collision (rumble + crash), sparkles of new stars, the fusion chime
  riser(C('andro'), C('collide'), 0.018);
  sub(C('collide'), 0.06); noiseHit(C('collide'), 2.0, 'lowpass', 900, 0.7, 0.035, 0, 0.4, 150);
  for (let k = 0; k < 14; k++) { const r = RNG('spk', k); blip(C('collide') + 0.2 + k * 0.16, 2000 + r.i(0, 1500), 2600 + r.i(0, 1500), 0.03, 0.006, r.n(0.6)); }
  pop(61.9, 0.025);
  chime(C('fuse'), [nz('Fs5'), nz('A5'), nz('Cs6')], 0.016);
  // 12: the title
  bigNum(C('title') + 0.1, 0.025);
