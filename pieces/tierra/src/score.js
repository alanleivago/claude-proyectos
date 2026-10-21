  // SCORE BODY — ¿cómo se formó la Tierra?, ~71 s, 120 BPM, under a narrator. Its own music: G minor (dorian), a ROLLING
  // idea: everything on a TRIPLET grid (a shuffle). A heartbeat bass (root on the beat + an octave ghost on the last
  // triplet), held sine sub, held 25 % chords (Gm–C–Eb–F, i–IV–bVI–bVII), a wave arp that rolls up and down in triplets,
  // a swung 50 % pulse lead, shaker triplets and a shuffle kit. Silence 34.5–35.5, the hit at 35.5 (Theia), the end in G major.
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
  const T3 = BEAT / 3;
  const CH = {
    Gm: ['G1', ['G2', 'As2', 'D3'], ['G4', 'As4', 'D5', 'G5']], C: ['C2', ['C3', 'E3', 'G3'], ['C4', 'E4', 'G4', 'C5']],
    Eb: ['Ds2', ['Ds3', 'G3', 'As3'], ['Ds4', 'G4', 'As4', 'Ds5']], F: ['F1', ['F2', 'A2', 'C3'], ['F4', 'A4', 'C5', 'F5']],
    Cm: ['C2', ['C3', 'Ds3', 'G3'], ['C4', 'Ds4', 'G4', 'C5']], D: ['D2', ['D3', 'Fs3', 'A3'], ['D4', 'Fs4', 'A4', 'D5']],
    Bb: ['As1', ['As2', 'D3', 'F3'], ['As3', 'D4', 'F4', 'As4']], G: ['G1', ['G2', 'B2', 'D3'], ['G4', 'B4', 'D5', 'G5']],
  };
  const P = ['Gm', 'C', 'Eb', 'F'];
  const HAR = [[0, ['Gm', 'C']], [5.75, ['Gm', 'Eb']], [10.25, ['Gm', 'C']], [14.5, ['Eb', 'F', 'Gm', 'Gm']], [20.5, P], [28.25, ['Eb', 'F']], [30.5, ['Cm', 'D']],
               [34.5, ['Gm']], [37.5, ['Eb', 'F', 'Gm', 'D']], [44.0, P], [51.75, ['Eb', 'Bb', 'F', 'Gm']], [56.75, ['Eb', 'F', 'Bb', 'Bb']], [62.75, P], [67.25, ['Eb', 'G']]];
  const harAt = (t) => { let i = 0; while (i + 1 < HAR.length && HAR[i + 1][0] <= t + 1e-6) i++; return i; };
  const chordAt = (t) => { const [s0, prog] = HAR[harAt(t)]; return CH[prog[Math.floor((t - s0) / BAR + 1e-6) % prog.length]]; };
  const barEnd = (t) => { const i = harAt(t), s0 = HAR[i][0], nb = s0 + (Math.floor((t - s0) / BAR + 1e-6) + 1) * BAR; return Math.min(nb, i + 1 < HAR.length ? HAR[i + 1][0] : 1e9); };
  // THE BED: held sine sub + held 25 % chord; o.beat: the heartbeat bass on the triplet grid (beats 1 and 3: root; their last
  // triplet: an octave ghost; beat 2: the fifth; beat 4: the octave)
  function bed(t0, t1, vel, o = {}) {
    for (let t = t0; t < t1 - 1e-6; ) {
      const next = Math.min(t1, barEnd(t)), d = next - t, [root, voices] = chordAt(t), fr = F(root);
      hold(t, d, fr, vel * 1.5, { wave: 'sine', att: 0.04, rel: 0.1, send: 0 });
      if (o.chords !== false) voices.forEach((n, i) => hold(t, d, n, vel * (o.chordVel ?? 0.38), { duty: 25, cut: o.cut ?? 1500, att: 0.12, rel: 0.2, pan: (i - 1) * 0.4, send: 0.35 }));
      if (o.beat) { const s0 = HAR[harAt(t)][0];
        for (let b = t; b < next - 1e-6; b += T3) { const p = Math.round((b - s0) / T3) % 12;
          if (p === 0 || p === 6) pul(b, fr * 2, vel * 1.45, T3 * 2.2, { duty: 50, cut: 900, send: 0 });
          if (p === 2 || p === 8) pul(b, fr * 4, vel * 0.6, T3 * 0.8, { duty: 50, cut: 900, send: 0 });
          if (p === 3) pul(b, fr * 3, vel * 1.0, T3 * 2, { duty: 50, cut: 900, send: 0 });
          if (p === 9) pul(b, fr * 4, vel * 0.9, T3 * 2, { duty: 50, cut: 900, send: 0 }); } }
      else hold(t, d, fr * 2, vel * 0.9, { duty: 50, cut: 500, att: 0.03, rel: 0.08, send: 0 });
      t = next;
    }
  }
  const shaker = (t, vel) => noiseHit(t, 0.03, 'highpass', 6500, 0.7, vel, -0.25);
  const snr = (t, vel) => { noiseHit(t, 0.08, 'bandpass', 1800, 1.0, vel, 0.05, 0.1); tri(t, 'G3', vel * 0.5, 0.05); };
  // the wave arp (triplets rolling up and down the chord: 0 1 2 3 2 1) and the shuffle kit by density 0..3
  const WAVE = [0, 1, 2, 3, 2, 1];
  function groove(t0, t1, dens, o = {}) {
    for (let t = t0; t < t1 - 1e-6; t += T3) {
      const s0 = HAR[harAt(t)][0], arp = chordAt(t)[2], k = Math.round((t - t0) / T3), p = Math.round((t - s0) / T3) % 12, av = o.arp ?? 0.014;
      if (av > 0) pul(t, arp[WAVE[k % 6]], av * (k % 3 === 0 ? 1.2 : 0.75), T3 * 0.8, { duty: 12, cut: 3400, pan: Math.sin(k * 0.7) * 0.45, send: 0.25 });
      if (dens >= 1) shaker(t, p % 3 === 0 ? 0.008 : p % 3 === 2 ? 0.006 : 0.003);
      if (dens >= 2 && (p === 0 || p === 5)) kick(t, 0.16);
      if (dens >= 2 && p === 6) snr(t, 0.045);
      if (dens >= 3 && p === 8) kick(t, 0.11);
      if (dens >= 3 && (p === 3 || p === 9)) snr(t, 0.03);
      if (dens >= 3 && p % 3 === 2) noiseHit(t, 0.08, 'highpass', 7000, 0.7, 0.006, 0.2);
    }
  }
  // the lead, swung (units = triplet 8ths, 12 a bar), harmonised Gm–C–Eb–F
  const THEME = [['D5', 0, 4], ['G5', 4, 2], ['A5', 6, 3], ['As5', 9, 3],
                 ['G5', 12, 4], ['E5', 16, 2], ['C5', 18, 6],
                 ['G5', 24, 4], ['As5', 28, 2], ['D6', 30, 3], ['C6', 33, 3],
                 ['A5', 36, 6], ['F5', 42, 3], ['G5', 45, 3]];
  const theme = (t0, vel, o = {}) => THEME.forEach(([n, a, l]) => { const t = t0 + a * T3; if (a < (o.to ?? 4) * 12 && t < (o.until ?? 1e9)) pul(t, o.oct ? F(n) * 2 : n, vel, Math.min(l * T3 * 0.92, (o.until ?? 1e9) - t), { duty: o.duty ?? 50, vib: true, cut: 3200, pan: -0.05, send: 0.35 }); });

  to = 'm';
  bed(0, 5.75, 0.03);                                   // title: bed + waves
  groove(0, 5.75, 0, { arp: 0.013 });
  bed(5.75, 10.25, 0.024, { chordVel: 0.3, cut: 900 }); // the cloud: dusky
  groove(5.75, 10.25, 1, { arp: 0.008 });
  bed(10.25, 14.5, 0.028, { beat: true });              // gravity: the heartbeat starts
  groove(10.25, 14.5, 1, { arp: 0.012 });
  bed(14.5, 20.5, 0.031, { beat: true });               // the Sun
  groove(14.5, 20.5, 2, { arp: 0.014 });
  bed(20.5, 30.5, 0.034, { beat: true });               // dust and crashes: the theme
  groove(20.5, 30.5, 2, { arp: 0.015 });
  theme(20.5, 0.022, { until: 28.2 });
  bed(30.5, 34.5, 0.028, { beat: true, chordVel: 0.42 }); // Theia: full kit, tension (Cm–D)
  groove(30.5, 34.4, 3, { arp: 0.013 });
  // 35.5 THE HIT: a G-minor stab + sub, then the payoff
  const H = C('hit');
  ['G2', 'D3', 'G3', 'As3', 'D4', 'G4'].forEach((n, i) => pul(H, n, 0.078, 0.55, { duty: 50, cut: 4400, pan: (i - 2.5) * 0.12, send: 0.35 }));
  hold(H, 0.7, 'G1', 0.11, { wave: 'sine', att: 0.005, rel: 0.4, send: 0 }); sub(H, 0.6);
  bed(H + 0.6, 37.5, 0.032, { chordVel: 0.42 });
  bed(37.5, 44, 0.044, { beat: true });
  groove(37.5, 44, 3, { arp: 0.02 });
  bed(44, 51.75, 0.044, { beat: true });
  groove(44, 51.75, 3, { arp: 0.02 });
  theme(44, 0.032, { oct: false });
  // 51.75 on: rain, the Moon, today — thinner; the theme again for HOY; G major at the end
  bed(51.75, 56.75, 0.018, { chordVel: 0.42 });
  groove(51.75, 56.75, 1, { arp: 0.009 });
  bed(56.75, 62.75, 0.016, { chordVel: 0.42 });
  groove(56.75, 62.75, 0, { arp: 0.008 });
  bed(62.75, 67.25, 0.018, { chordVel: 0.42 });
  theme(62.75, 0.014, { to: 3 });
  bed(67.25, DURATION, 0.013, { chordVel: 0.5 });
  pul(69.25, 'B5', 0.012, 2.0, { duty: 50, vib: true, send: 0.4 }); pul(69.25, 'D6', 0.009, 2.0, { duty: 50, send: 0.4 });

  to = 's';
  const pop = (t, vel = 0.045, hi = false) => { noiseHit(t, 0.012, 'highpass', 5000, 0.7, vel * 0.6); pul(t, hi ? 'As6' : 'G6', vel, 0.05, { duty: 25, send: 0.1 }); pul(t + 0.05, hi ? 'F7' : 'D7', vel, 0.09, { duty: 25, send: 0.15 }); };
  const bigNum = (t, vel = 0.05) => { ['G5', 'As5', 'D6', 'G6'].forEach((n, i) => pul(t + i * 0.03, n, vel, 0.07, { duty: 25, send: 0.15 })); kick(t, 0.12); };
  const tick = (t, vel = 0.012) => pul(t, 'D6', vel, 0.025, { duty: 12, cut: 5000, send: 0 });
  const whoosh = (t, d = 0.35, vel = 0.025, up = true) => sweep(t - d, t, vel, up ? 500 : 4000, up ? 4000 : 500);
  const thump = (t, vel = 0.06) => { sub(t, vel); noiseHit(t, 0.35, 'lowpass', 900, 0.8, vel * 0.8, 0, 0.25, 150); kick(t, 0.15); };
  const quiet = (t) => t > 34.4 && t < 35.5;
  CAPS.forEach(([t0, lines, o = {}]) => { if (!lines) return; const n = lines.reduce((a, ln) => a + (typeof ln === 'string' ? ln.length : ln.reduce((b, s) => b + s[0].length, 0)), 0);
    if (!o.big) noiseHit(t0, 0.02, 'bandpass', 2500, 2, 0.02);
    for (let k = 0; k < n; k += 2) { const t = t0 + (o.big ? k / 22 : 0.15 + k / 30); if (quiet(t)) break; pul(t, 1900 + ((k * 37) % 5) * 60, 0.014, 0.014, { duty: 12, cut: 6000, send: 0 }); } });
  SHOT_LIST.slice(1).forEach(([t0]) => { if (Math.abs(t0 - 34.5) > 0.1 && Math.abs(t0 - 35.5) > 0.1) whoosh(t0, 0.3, 0.025); });
  for (let t = 6; t < 62.7; t += 0.5) if (!quiet(t) && !(t > 34.3 && t < 36)) tick(t, 0.008);   // the clock
  chime(0.4, [nz('G5'), nz('D6'), nz('G6')], 0.025);
  // 2–3: the cloud's wind; gravity: inward sweeps on the arrows, a spin riser
  noiseHit(5.8, 4.4, 'lowpass', 500, 0.7, 0.018, 0, 0.3, 150);
  for (let k = 0; k < 3; k++) sweep(10.4 + k * 0.75, 11.0 + k * 0.75, 0.025, 3000, 400, k % 2 ? 0.5 : -0.5);
  riser(11.6, 14.4, 0.03);
  // 4: the Sun ignites (sub + burst + a rising triad); the mass bar fills (a climbing pulse); labels
  thump(C('sun'), 0.09); noiseHit(C('sun'), 1.2, 'lowpass', 3000, 0.7, 0.05, 0, 0.4, 200);
  ['G5', 'As5', 'D6', 'G6'].forEach((n, i) => pul(C('sun') + 0.05 + i * 0.06, n, 0.04, 0.4, { duty: 25, vib: true, send: 0.4 }));
  pul(C('mass'), 'G4', 0.03, 0.6, { duty: 12, slide: 2, send: 0.2 }); pop(C('mass') + 0.4, 0.04); pop(C('mass') + 1.0, 0.035, true);
  // 5: grains stick (clicks), rocks whistle in and crash (a thump each), the counter ticks
  for (let k = 0; k < 18; k++) { const r = RNG('stk', k); blip(CU.stick + k * 0.13 + r.f() * 0.05, 1500 + r.i(0, 800), 2000 + r.i(0, 800), 0.03, 0.016, r.n(0.6)); }
  CU.crash.forEach((tm, i) => { pul(tm - 0.85, 1400 - i * 40, 0.012, 0.8, { duty: 12, slide: 0.35, pan: Math.sin(i * 2.3) * 0.6, send: 0.2 }); thump(tm, 0.05 + (i % 3) * 0.01); pop(tm + 0.04, 0.03, i % 2 === 1); });
  // 6: small meteors hit the young Earth
  for (let k = 0; k < 6; k++) { const tm = 28.4 + k * 0.33 + 0.5; noiseHit(tm, 0.12, 'lowpass', 2500, 0.8, 0.03, -0.3 + k * 0.1); pul(tm, 'D6', 0.018, 0.08, { duty: 25, send: 0.2 }); }
  // 7: Theia approaches: a long riser and a growing low drone; label pops
  riser(30.6, 34.4, 0.045);
  { const o = osc('sawtooth', 49, 30.6, 34.45); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, 30.6); g.gain.exponentialRampToValueAtTime(0.03, 34.3); g.gain.exponentialRampToValueAtTime(0.0001, 34.45); o.connect(lp); lp.connect(g); out(g, 0, 0.1); }
  bigNum(C('theia'), 0.045); pop(C('mars'), 0.04);
  // 9: IMPACT: an explosion (long noise + sub), debris rattle, the ring whoosh, the Moon gathers (a chime)
  noiseHit(H, 2.4, 'lowpass', 2600, 0.7, 0.09, 0, 0.5, 120); sub(H + 0.05, 0.3);
  for (let k = 0; k < 24; k++) { const r = RNG('rat', k); noiseHit(H + 0.4 + k * 0.06 + r.f() * 0.03, 0.03, 'bandpass', 1500 + r.i(0, 2500), 2, 0.025, r.n(0.7)); }
  whoosh(C('ring') + 0.4, 1.0, 0.035); sweep(39.4, 40.3, 0.03, 3000, 600);
  chime(C('moon'), [nz('D6'), nz('G6'), nz('As6')], 0.035); pop(C('moon') + 0.25, 0.035);
  // 10: the magma rumbles and bubbles
  { const o = osc('sawtooth', 41, 41.0, 44.1); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 200; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, 41.0); g.gain.exponentialRampToValueAtTime(0.03, 41.6); g.gain.setValueAtTime(0.03, 43.6); g.gain.exponentialRampToValueAtTime(0.0001, 44.1); o.connect(lp); lp.connect(g); out(g, 0, 0.1); }
  for (let k = 0; k < 22; k++) { const r = RNG('bub', k); blip(41.1 + k * 0.13 + r.f() * 0.05, 220 + r.i(0, 160), 500 + r.i(0, 200), 0.06, 0.03, r.n(0.6)); }
  // 11: cooling hiss, crackling seams, the loupe sweep, the age
  noiseHit(C('cool'), 2.6, 'highpass', 3000, 0.7, 0.03, 0, 0.3, 50);
  for (let k = 0; k < 20; k++) { const r = RNG('crk', k); noiseHit(C('cool') + k * 0.12 + r.f() * 0.06, 0.015, 'bandpass', 3000 + r.i(0, 2000), 3, 0.035, r.n(0.6)); }
  sweep(C('zircon') - 0.1, C('zircon') + 0.35, 0.03, 600, 3500); chime(C('zircon') + 0.4, [nz('As6'), nz('D7')], 0.03);
  bigNum(C('age'), 0.05);
  // 12: rain (a hiss), thunder on the lightning frames, the oceans fill (a rising pulse)
  noiseHit(51.9, 4.9, 'highpass', 4500, 0.6, 0.02, 0, 0.2, 200);
  for (let f = Math.ceil(51.75 * 24); f < 56.75 * 24; f++) { const b = Math.floor(f / 2); if (b % 29 === 0 && f % 2 === 0) { sub(f / 24, 0.06); noiseHit(f / 24 + 0.05, 1.0, 'lowpass', 500, 0.7, 0.05, 0, 0.4, 80); } }
  pul(C('ocean'), 'G3', 0.035, 1.2, { duty: 12, slide: 2, send: 0.35 }); pop(C('ocean') + 1.1, 0.035);
  // 13: the ruler draws (ticks), the 4 cm label
  for (let k = 0; k <= 10; k++) tick(C('moonFar') + k * 0.06, 0.025);
  bigNum(C('cm'), 0.045);
  // 14–15: HOY, the title
  bigNum(C('today'), 0.05); chime(C('today') + 0.1, [nz('G5'), nz('B5'), nz('D6')], 0.02);
  bigNum(C('title') + 0.1, 0.03);
