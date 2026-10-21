  // SCORE BODY — cae a través de la tierra, 62 s, 120 BPM. Its own music: A minor, a FALLING idea. The bass walks
  // down a line (A–G–F–E per bar group) in a driving 16th "engine" (50 % pulse, root + octave ghost notes) over a held
  // sine sub; held 12.5 % chords; a lead in 25 % pulse whose phrases fall and slide down; four-on-the-floor kick in
  // the fall, a shaker in 16ths, a noise snare with a long tail on 4. Silence 35.0–36.0, the loudest hit at 36.0.
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
    Am: ['A1', ['A2', 'C3', 'E3'], ['A3', 'C4', 'E4', 'A4']], G: ['G1', ['G2', 'B2', 'D3'], ['G3', 'B3', 'D4', 'G4']], F: ['F1', ['F2', 'A2', 'C3'], ['F3', 'A3', 'C4', 'F4']],
    E: ['E1', ['E2', 'Gs2', 'B2'], ['E3', 'Gs3', 'B3', 'E4']], Dm: ['D2', ['D3', 'F3', 'A3'], ['D4', 'F4', 'A4', 'D5']], C: ['C2', ['C3', 'E3', 'G3'], ['C4', 'E4', 'G4', 'C5']],
    Fmaj7: ['F1', ['F2', 'A2', 'E3'], ['F3', 'A3', 'C4', 'E4']], A: ['A1', ['A2', 'Cs3', 'E3'], ['A3', 'Cs4', 'E4', 'A4']],
  };
  const FALLP = ['Am', 'G', 'F', 'E'];   // the descending line: every bar, one step down
  const HAR = [[0, ['C', 'G', 'Am', 'F']], [5, ['Am', 'E']], [9, FALLP], [21, ['Dm', 'Am', 'F', 'E']], [31.5, ['Am', 'E']], [34.9, ['Am']],
               [36, ['Am']], [38, ['F', 'G', 'Am', 'Am']], [42, FALLP], [46, ['F', 'G', 'C', 'E']], [49, ['C', 'G', 'Am', 'F']], [55, ['Am', 'F', 'C', 'G']], [59, ['Fmaj7', 'A']]];
  const harAt = (t) => { let i = 0; while (i + 1 < HAR.length && HAR[i + 1][0] <= t + 1e-6) i++; return i; };
  const chordAt = (t) => { const [s0, prog] = HAR[harAt(t)]; return CH[prog[Math.floor((t - s0) / BAR + 1e-6) % prog.length]]; };
  const barEnd = (t) => { const i = harAt(t), s0 = HAR[i][0], nb = s0 + (Math.floor((t - s0) / BAR + 1e-6) + 1) * BAR; return Math.min(nb, i + 1 < HAR.length ? HAR[i + 1][0] : 1e9); };
  // THE BED: held sine sub + held 12.5 % chord; o.engine: a 16th bass engine (root on beats, octave ghosts between)
  function bed(t0, t1, vel, o = {}) {
    for (let t = t0; t < t1 - 1e-6; ) {
      const next = Math.min(t1, barEnd(t)), d = next - t, [root, voices] = chordAt(t), fr = F(root);
      hold(t, d, fr, vel * 1.5, { wave: 'sine', att: 0.03, rel: 0.08, send: 0 });
      if (o.chords !== false) voices.forEach((n, i) => hold(t, d, F(n) * 2, vel * (o.chordVel ?? 0.32), { duty: 12, cut: o.cut ?? 1800, att: 0.12, rel: 0.15, pan: (i - 1) * 0.4, send: 0.35 }));
      if (o.engine) for (let k = 0, b = t; b < next - 1e-6; k++, b += E16) { const acc = k % 4 === 0, oct = k % 4 === 2; pul(b, fr * (oct ? 4 : 2), vel * (acc ? 1.35 : oct ? 0.8 : 0.55), E16 * (acc ? 0.95 : 0.6), { duty: 50, cut: acc ? 900 : 600, send: 0 }); }
      else hold(t, d, fr * 2, vel * 1.0, { duty: 50, cut: 500, att: 0.02, rel: 0.06, send: 0 });
      t = next;
    }
  }
  const shaker = (t, vel) => noiseHit(t, 0.03, 'bandpass', 6000, 1.5, vel, 0.25);
  const snareL = (t, vel) => { noiseHit(t, 0.2, 'bandpass', 1700, 0.8, vel, -0.05, 0.3); noiseHit(t, 0.03, 'highpass', 3000, 0.7, vel * 0.6); };
  // drums and a broken-chord figure (8ths, 3+3+2 accents) by density 0..3
  function groove(t0, t1, dens, o = {}) {
    for (let t = t0; t < t1 - 1e-6; t += E16) {
      const s0 = HAR[harAt(t)][0], arp = chordAt(t)[2], p = Math.round((t - s0) / E16) % 16, onBeat = p % 4 === 0;
      if ([0, 3, 6, 8, 11, 14].includes(p) && (o.arp ?? 0.015) > 0) pul(t, arp[[0, 2, 1, 3, 2, 1][[0, 3, 6, 8, 11, 14].indexOf(p)]] , (o.arp ?? 0.015) * (p % 8 === 0 ? 1.2 : 0.85), E8 * 0.9, { duty: 25, cut: 2600, pan: p < 8 ? -0.3 : 0.3, send: 0.2 });
      if (dens >= 1 && p % 2 === 1) shaker(t, 0.007);
      if (dens >= 2 && p === 12) snareL(t, 0.05);
      if (dens >= 2 && p === 4) snare(t, 0.025);
      if (dens >= 3 && onBeat) kick(t, 0.17);
    }
  }
  // the lead: phrases that fall, each ending with a downward slide; harmonised to Am–G–F–E bar by bar
  const THEME = [['E5', 0, 1], ['A5', 1, 2], ['G5', 3, 1], ['E5', 4, 2], ['C5', 6, 2, 0.94],
                 ['D5', 8, 1], ['G5', 9, 2], ['F5', 11, 1], ['D5', 12, 2], ['B4', 14, 2, 0.94],
                 ['C5', 16, 1], ['F5', 17, 2], ['E5', 19, 1], ['C5', 20, 2], ['A4', 22, 2, 0.94],
                 ['B4', 24, 2], ['Gs4', 26, 2], ['E4', 28, 3, 0.9], ['Gs4', 31, 1]];
  const theme = (t0, vel, o = {}) => THEME.forEach(([n, a, l, sl]) => { const t = t0 + a * E8; if (a < (o.to ?? 4) * 8 && t < (o.until ?? 1e9)) pul(t, n, vel, Math.min(l * E8 * 0.9, (o.until ?? 1e9) - t), { duty: o.duty ?? 25, vib: true, slide: sl, cut: 3400, pan: 0.05, send: 0.3 }); });

  to = 'm';
  // 0–9 the garden and the section: warm, light, music from frame 0 (C–G–Am–F), then Am–E tension
  bed(0, 5, 0.03);
  groove(0, 5, 0, { arp: 0.014 });
  bed(5, 9, 0.032);
  groove(5, 9, 1, { arp: 0.016 });
  // 9–21 the fall begins: the 16th bass engine, shaker, the falling theme
  bed(9, 21, 0.034, { engine: true });
  groove(9, 13, 1, { arp: 0.012 });
  groove(13, 21, 2, { arp: 0.013 });
  theme(13, 0.026);
  // 21–31.5 the core: four-on-the-floor, the theme in 12.5 %, a bright counter arp in the liquid iron
  bed(21, 31.5, 0.035, { engine: true });
  groove(21, 31.5, 3, { arp: 0.014 });
  theme(21, 0.024, { duty: 12 });
  for (let t = 27; t < 31.5 - 1e-6; t += E16) pul(t, F(chordAt(t)[2][Math.round(t / E16) % 4]) * 2, 0.008, E16 * 0.6, { duty: 12, pan: 0.45, cut: 5000 });
  // 31.5–35 the centre: tense, held back; all stops dead at 34.9 (silence 35–36)
  bed(31.5, 34.9, 0.026, { engine: true });
  groove(31.5, 34.875, 2, { arp: 0.012 });
  for (let k = 0; k < 7; k++) pul(31.5 + k * BEAT * 0.5, ['A5', 'Gs5', 'G5', 'Fs5', 'F5', 'E5', 'Ds5'][k], 0.012, E8 * 0.9, { duty: 12, pan: 0.3 });   // a chromatic fall
  // 36 THE HIT: an A-minor stab + sub, then a flat held chord rising out of the core
  const H = C('hit');
  ['A2', 'E3', 'A3', 'C4', 'E4'].forEach((n, i) => pul(H, n, 0.08, 0.5, { duty: 50, cut: 4400, pan: (i - 2) * 0.15, send: 0.35 }));
  hold(H, 0.6, 'A1', 0.1, { wave: 'sine', att: 0.005, rel: 0.35, send: 0 }); sub(H, 0.55);
  bed(H + 0.6, 38, 0.03, { chordVel: 0.35 });
  // 38–49 the climb out and the arrival: the theme in full, the engine, the payoff
  bed(38, 42, 0.042, { engine: true });
  groove(38, 42, 2, { arp: 0.02 });
  theme(38, 0.032);
  bed(42, 46, 0.045, { engine: true });
  groove(42, 46, 3, { arp: 0.02 });
  theme(42, 0.033, { duty: 50, to: 2 });
  bed(46, 49, 0.044, { engine: true });
  groove(46, 49, 3, { arp: 0.02 });
  // 49–62 forever: quieter, warm (C–G–Am–F), the theme's first phrase, resolving to A major
  bed(49, 55, 0.014, { chordVel: 0.4 });
  groove(49, 55, 0, { arp: 0.008 });
  bed(55, 59, 0.012, { engine: false, chordVel: 0.4 });
  theme(55, 0.011, { to: 1 });
  bed(59, 62.6, 0.012, { chordVel: 0.5 });
  pul(61, 'A4', 0.012, 1.0, { duty: 25, vib: true, send: 0.35 }); pul(61, 'Cs5', 0.009, 1.0, { duty: 25, send: 0.35 });

  to = 's';
  const pop = (t, vel = 0.045, hi = false) => { noiseHit(t, 0.012, 'highpass', 5000, 0.7, vel * 0.6); pul(t, hi ? 'E6' : 'C6', vel, 0.05, { duty: 25, send: 0.1 }); pul(t + 0.05, hi ? 'B6' : 'G6', vel, 0.09, { duty: 25, send: 0.15 }); };
  const bigNum = (t, vel = 0.05) => { ['A4', 'C5', 'E5', 'A5'].forEach((n, i) => pul(t + i * 0.03, n, vel, 0.07, { duty: 25, send: 0.15 })); kick(t, 0.12); };
  const tick = (t, vel = 0.03) => { pul(t, 'G5', vel, 0.03, { duty: 12, cut: 5000 }); noiseHit(t, 0.01, 'highpass', 6000, 0.7, vel * 0.5); };
  const whoosh = (t, d = 0.35, vel = 0.02, up = true) => sweep(t - d, t, vel, up ? 500 : 4000, up ? 4000 : 500);
  // captions typing
  CAPS.forEach(([t0, lines, o = {}]) => { if (!lines) return; const n = lines.reduce((a, ln) => a + ln.length, 0);
    if (!o.big) noiseHit(t0, 0.02, 'bandpass', 2500, 2, 0.02);
    for (let k = 0; k < n; k += 2) { const t = t0 + (o.big ? k / 22 : 0.15 + k / 30); if (t > 34.95 && t < 36) break; pul(t, 1900 + ((k * 37) % 5) * 60, 0.013, 0.014, { duty: 12, cut: 6000, send: 0 }); } });
  // cuts: a pixel whoosh into each (not into the hit)
  SHOT_LIST.slice(1).forEach(([t0]) => { if (Math.abs(t0 - 36) > 0.1) whoosh(t0, 0.3, 0.018); });
  // 1: the ball bounces in her hand, the drop (a falling pluck), the bonk on the dirt rim, the dive into the hole
  for (let k = 0; k < 4; k++) tri(0.8 + k * 0.4, 'C4', 0.04, 0.06);
  pul(C('drop'), 'A5', 0.04, 0.6, { duty: 12, slide: 0.25, send: 0.3 });
  whoosh(C('dive') + 0.7, 0.8, 0.03, false);
  // 2: the tunnel is drawn (a rising sweep), the loupe, Kola's tick, the diameter
  sweep(5.4, 6.6, 0.015, 300, 2500); sweep(C('kola') - 0.05, C('kola') + 0.2, 0.02, 700, 3000); tick(C('kola') + 0.5, 0.04); pop(7.0, 0.035);
  // 3: the HUD comes on, the fall starts (a long falling tone), the ghost appears
  pop(9.3, 0.035); pul(C('start'), 'E6', 0.03, 2.5, { duty: 12, slide: 0.12, send: 0.35 });
  // boundary crossings (from the physics itself): a deep thump + a bright tick each time the ball crosses a layer
  { const B0 = [D670, RE - RCMB, RE - RIC, RE, RE + RIC, RE + RCMB, 2 * RE - D670]; let prev = 0;
    for (let t = C('start'); t < C('arrive'); t += 0.01) { const d = realAt(simMin(t)).d; B0.forEach((b) => { if ((prev - b) * (d - b) < 0 && (t < 34.9 || t > 36)) { sub(t, 0.08); tick(t, 0.035); pul(t, d > RE ? 'E5' : 'A4', 0.03, 0.12, { duty: 25 }); } }); prev = d; } }
  // 5: gravity peaks: the HUD flashes
  bigNum(24.2, 0.04);
  // 6: liquid iron: bubbling
  for (let k = 0; k < 14; k++) { const r = RNG('bub', k); blip(27.2 + k * 0.3 + r.f() * 0.1, 300 + r.i(0, 200), 900 + r.i(0, 300), 0.05, 0.012, r.n(0.5)); }
  // 7: the centre: the cut to close, a pressure rumble, "0 G" float tone
  noiseHit(32.0, 1.2, 'lowpass', 400, 0.8, 0.03, 0, 0.2, 120); bigNum(33.4, 0.04); pul(33.4, 'A6', 0.012, 1.3, { duty: 12, vib: true, send: 0.5 });
  // 9: climbing out: a rising whoosh into the surface
  sweep(42.5, 44.5, 0.02, 400, 5000);
  // 10: the ball pops out, stops; 38 MIN; the ghost arrives late (a lower, duller version)
  whoosh(44.6, 0.2, 0.03); pul(44.5, 'A3', 0.04, 0.9, { duty: 12, slide: 2, send: 0.3 });
  bigNum(45.4, 0.05); chime(45.4, [nz('A5'), nz('E6')], 0.03);
  pul(C('ghostIn'), 'A2', 0.03, 0.6, { duty: 12, slide: 2, send: 0.2 }); pop(C('ghostIn') + 0.5, 0.03);
  // 11: the antipode chords (a sweep through the globe), city pops, drops into the sea (plips)
  for (const t of [C('ant1'), C('ant2')]) { sweep(t, t + 0.5, 0.02, 400, 3000); pop(t + 0.5, 0.035); pop(t + 0.6, 0.035, true); }
  for (let k = 0; k < 40; k += 3) blip(C('sea') + k * 0.03 + 0.3, 1800 + (k % 5) * 200, 600, 0.06, 0.012, (k % 2 ? 0.3 : -0.3));
  // 12: the oscillation: a soft tick at each end; the ball pops out of the garden hole; the title
  for (let k = 0; k < 7; k++) tick(55 + k / 1.1 * 1 + 0.45, 0.02);
  pul(C('popOut'), 'A3', 0.04, 0.5, { duty: 12, slide: 3, send: 0.3 }); tri(C('popOut') + 0.7, 'C4', 0.05, 0.08);
  bigNum(C('title') + 0.2, 0.03);
