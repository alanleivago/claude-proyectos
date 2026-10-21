  // SCORE BODY — ¿cómo se forma un huracán?, 62 s, 120 BPM. Its own music: C minor, a TURNING idea. The arp runs in
  // groups of three 16ths against the 4/4 (it seems to rotate), the bass is a syncopated octave pump (50 % pulse) over
  // a held sine sub, held 25 % chords (Cm–Ab–Eb–Bb), a lead in 50 % pulse with glides between notes, half-time drums
  // that double when the storm organises and a tom roll on every category change. Silence 31–32, the hit at 32.0.
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
    Cm: ['C2', ['C3', 'Ds3', 'G3'], ['C4', 'Ds4', 'G4', 'C5']], Ab: ['Gs1', ['Gs2', 'C3', 'Ds3'], ['Gs3', 'C4', 'Ds4', 'Gs4']], Eb: ['Ds2', ['Ds3', 'G3', 'As3'], ['Ds4', 'G4', 'As4', 'Ds5']],
    Bb: ['As1', ['As2', 'D3', 'F3'], ['As3', 'D4', 'F4', 'As4']], Fm: ['F1', ['F2', 'Gs2', 'C3'], ['F3', 'Gs3', 'C4', 'F4']], G: ['G1', ['G2', 'B2', 'D3'], ['G3', 'B3', 'D4', 'G4']],
    C: ['C2', ['C3', 'E3', 'G3'], ['C4', 'E4', 'G4', 'C5']],
  };
  const PROG = ['Cm', 'Ab', 'Eb', 'Bb'];
  const HAR = [[0, ['Cm', 'Ab']], [4, ['Cm', 'Fm']], [8, PROG], [17, ['Fm', 'Cm']], [21, ['Cm', 'Ab', 'Fm', 'G']], [29, ['Cm', 'G']], [30.9, ['Cm']],
               [32, ['Cm']], [34, ['Ab', 'Bb', 'Cm', 'Cm']], [38, PROG], [44, ['Fm', 'G', 'Cm', 'Cm']], [50, ['Ab', 'Eb', 'Fm', 'G']], [56, ['Ab', 'Bb']], [60, ['C']]];
  const harAt = (t) => { let i = 0; while (i + 1 < HAR.length && HAR[i + 1][0] <= t + 1e-6) i++; return i; };
  const chordAt = (t) => { const [s0, prog] = HAR[harAt(t)]; return CH[prog[Math.floor((t - s0) / BAR + 1e-6) % prog.length]]; };
  const barEnd = (t) => { const i = harAt(t), s0 = HAR[i][0], nb = s0 + (Math.floor((t - s0) / BAR + 1e-6) + 1) * BAR; return Math.min(nb, i + 1 < HAR.length ? HAR[i + 1][0] : 1e9); };
  // THE BED: held sine sub + held 25 % chord; o.pump: a syncopated octave bass (16th grid: 1, 4, 7, 10, 12, 14)
  function bed(t0, t1, vel, o = {}) {
    for (let t = t0; t < t1 - 1e-6; ) {
      const next = Math.min(t1, barEnd(t)), d = next - t, [root, voices] = chordAt(t), fr = F(root);
      hold(t, d, fr, vel * 1.5, { wave: 'sine', att: 0.03, rel: 0.08, send: 0 });
      if (o.chords !== false) voices.forEach((n, i) => hold(t, d, n, vel * (o.chordVel ?? 0.38), { duty: 25, cut: o.cut ?? 1500, att: 0.1, rel: 0.15, pan: (i - 1) * 0.35, send: 0.3 }));
      if (o.pump) { const s0 = HAR[harAt(t)][0]; for (let b = t; b < next - 1e-6; b += E16) { const p = Math.round((b - s0) / E16) % 16; if ([0, 3, 6, 10, 12, 14].includes(p)) pul(b, fr * (p === 6 || p === 14 ? 4 : 2), vel * (p === 0 ? 1.4 : 1.0), E16 * 1.6, { duty: 50, cut: 800, send: 0 }); } }
      else hold(t, d, fr * 2, vel * 1.0, { duty: 50, cut: 500, att: 0.02, rel: 0.06, send: 0 });
      t = next;
    }
  }
  const tom = (t, f, vel) => { const o = osc('triangle', f, t, t + 0.2); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.18); const g = ac.createGain(); env(g, t, 0.003, vel, 0.18); o.connect(g); out(g, 0, 0.1); };
  const rim = (t, vel) => noiseHit(t, 0.02, 'bandpass', 3200, 3, vel, 0.15);
  // the rotating arp (groups of 3 sixteenths: root–third–fifth cycling against the bar) and drums by density 0..3
  function groove(t0, t1, dens, o = {}) {
    for (let t = t0; t < t1 - 1e-6; t += E16) {
      const s0 = HAR[harAt(t)][0], arp = chordAt(t)[2], k = Math.round((t - t0) / E16), p = Math.round((t - s0) / E16) % 16;
      if ((o.arp ?? 0.015) > 0) pul(t, F(arp[k % 3]) * (Math.floor(k / 3) % 2 ? 2 : 1), (o.arp ?? 0.015) * (k % 3 === 0 ? 1.15 : 0.75), E16 * 0.75, { duty: 12, cut: 3000, pan: Math.sin(k * 0.52) * 0.5, send: 0.15 });
      if (dens >= 1 && p % 2 === 0) hat(t, p % 4 === 2 ? 0.01 : 0.006);
      if (dens === 2 && p === 8) snare(t, 0.05);
      if (dens === 2 && p === 0) kick(t, 0.16);
      if (dens >= 3 && (p === 4 || p === 12)) snare(t, 0.05);
      if (dens >= 3 && (p === 0 || p === 10)) kick(t, 0.17);
      if (dens >= 3 && p === 7) rim(t, 0.02);
    }
  }
  // the lead: wide intervals with glides (o.slide into the next note), harmonised Cm–Ab–Eb–Bb bar by bar
  const THEME = [['G5', 0, 2], ['C6', 2, 2, 0.94], ['As5', 4, 1], ['G5', 5, 3],
                 ['Gs5', 8, 2], ['C6', 10, 1], ['Ds6', 11, 3, 0.94], ['C6', 14, 2],
                 ['As5', 16, 2], ['G5', 18, 2], ['Ds5', 20, 1], ['F5', 21, 1], ['G5', 22, 2],
                 ['F5', 24, 3], ['D5', 27, 1], ['As4', 28, 2], ['D5', 30, 2, 1.06]];
  const theme = (t0, vel, o = {}) => THEME.forEach(([n, a, l, sl]) => { const t = t0 + a * E8; if (a < (o.to ?? 4) * 8 && t < (o.until ?? 1e9)) pul(t, n, vel, Math.min(l * E8 * 0.92, (o.until ?? 1e9) - t), { duty: o.duty ?? 50, vib: true, slide: sl, cut: 3200, pan: -0.05, send: 0.3 }); });

  to = 'm';
  // 0–8 the hook and the warm sea: the bed from frame 0, the turning arp, sparse
  bed(0, 4, 0.032);
  groove(0, 4, 0, { arp: 0.012 });
  bed(4, 8, 0.032);
  groove(4, 8, 1, { arp: 0.013 });
  // 8–17 the engine: half-time drums, the theme
  bed(8, 17, 0.034, { pump: true });
  groove(8, 17, 2, { arp: 0.014 });
  theme(9, 0.024, { until: 16.9 });
  // 17–21 the globe: a lighter turn
  bed(17, 21, 0.03, { chordVel: 0.42 });
  groove(17, 21, 1, { arp: 0.014 });
  // 21–31 it organises: full drums, the theme in 25 %, toms on every category change
  bed(21, 29, 0.035, { pump: true });
  groove(21, 29, 3, { arp: 0.015 });
  theme(21, 0.024, { duty: 25 });
  bed(29, 30.9, 0.027, { pump: true });
  groove(29, 30.875, 3, { arp: 0.013 });
  { let prev = catOf(windAt(21))[1]; for (let t = 21; t < 30.9; t += 0.02) { const c = catOf(windAt(t))[1]; if (c !== prev) { const t0 = Math.round(t / E16) * E16; [0, 1, 2, 3].forEach((k) => tom(t0 - 0.375 + k * E16, 220 - k * 30, 0.06)); prev = c; } } }
  // 32 THE HIT: a C-minor stab + sub, then a flat held chord
  const H = C('hit');
  ['C3', 'G3', 'C4', 'Ds4', 'G4'].forEach((n, i) => pul(H, n, 0.08, 0.5, { duty: 50, cut: 4400, pan: (i - 2) * 0.15, send: 0.35 }));
  hold(H, 0.6, 'C1', 0.1, { wave: 'sine', att: 0.005, rel: 0.35, send: 0 }); sub(H, 0.55);
  bed(H + 0.6, 34, 0.028, { chordVel: 0.35 });
  // 34–50 the eye, the energy, the landfall: the payoff, everything in
  bed(34, 38, 0.04, { pump: true });
  groove(34, 38, 2, { arp: 0.02 });
  bed(38, 44, 0.044, { pump: true });
  groove(38, 44, 3, { arp: 0.02 });
  theme(38, 0.034);
  bed(44, 50, 0.044, { pump: true });
  groove(44, 50, 3, { arp: 0.02 });
  theme(46, 0.03, { duty: 25, to: 2 });
  // 50–62 it dies away: thin, warm, back to the calm sea; resolves to C major
  bed(50, 56, 0.015, { chordVel: 0.4 });
  groove(50, 56, 0, { arp: 0.008 });
  bed(56, 60, 0.012, { chordVel: 0.4 });
  theme(56, 0.011, { to: 1 });
  bed(60, 62.6, 0.012, { chordVel: 0.5 });
  pul(60, 'G5', 0.012, 1.8, { duty: 50, vib: true, send: 0.35 }); pul(60, 'E5', 0.009, 1.8, { duty: 50, send: 0.35 });

  to = 's';
  const pop = (t, vel = 0.045, hi = false) => { noiseHit(t, 0.012, 'highpass', 5000, 0.7, vel * 0.6); pul(t, hi ? 'Ds6' : 'C6', vel, 0.05, { duty: 25, send: 0.1 }); pul(t + 0.05, hi ? 'As6' : 'G6', vel, 0.09, { duty: 25, send: 0.15 }); };
  const bigNum = (t, vel = 0.05) => { ['C5', 'Ds5', 'G5', 'C6'].forEach((n, i) => pul(t + i * 0.03, n, vel, 0.07, { duty: 25, send: 0.15 })); kick(t, 0.12); };
  const tick = (t, vel = 0.03) => { pul(t, 'G5', vel, 0.03, { duty: 12, cut: 5000 }); noiseHit(t, 0.01, 'highpass', 6000, 0.7, vel * 0.5); };
  const whoosh = (t, d = 0.35, vel = 0.02, up = true) => sweep(t - d, t, vel, up ? 500 : 4000, up ? 4000 : 500);
  const wind = (t0, t1, vel, f0 = 400, f1 = 1200) => { for (let t = t0; t < t1 - 1e-6; t += 0.5) sweep(t, t + 0.55, vel * (0.7 + 0.3 * Math.sin(t * 3)), f0 + 200 * Math.sin(t * 2), f1 + 400 * Math.sin(t * 1.3), Math.sin(t) * 0.5); };
  // captions typing; cut whooshes
  CAPS.forEach(([t0, lines, o = {}]) => { if (!lines) return; const n = lines.reduce((a, ln) => a + (typeof ln === 'string' ? ln.length : ln.reduce((b, s) => b + s[0].length, 0)), 0);
    if (!o.big) noiseHit(t0, 0.02, 'bandpass', 2500, 2, 0.02);
    for (let k = 0; k < n; k += 2) { const t = t0 + (o.big ? k / 22 : 0.15 + k / 30); if (t > 30.95 && t < 32) break; pul(t, 1900 + ((k * 37) % 5) * 60, 0.013, 0.014, { duty: 12, cut: 6000, send: 0 }); } });
  SHOT_LIST.slice(1).forEach(([t0]) => { if (Math.abs(t0 - 32) > 0.1 && Math.abs(t0 - 31) > 0.1) whoosh(t0, 0.3, 0.018); });
  // 1: the storm: gusting wind, rain hiss, waves; thunder on the lightning flashes
  wind(0, 4, 0.03); noiseHit(0, 4, 'highpass', 5000, 0.5, 0.008);
  for (let k = 0; k < 4; k++) noiseHit(0.5 + k, 0.6, 'lowpass', 800, 0.7, 0.025, (k % 2 ? 0.4 : -0.4), 0.3, 200);
  for (let f = 0; f < 96; f++) { const b = Math.floor(f / 2); if (b % 37 === 0 && f % 2 === 0) { sub(f / 24, 0.08); noiseHit(f / 24 + 0.05, 0.9, 'lowpass', 400, 0.7, 0.04, 0, 0.4, 80); } }
  // 2: the thermometer climbs (a rising pulse) and the 26,5 label
  pul(C('thermo'), 'C4', 0.025, 1.5, { duty: 12, slide: 2, send: 0.2 }); bigNum(C('thermo') + 1.2, 0.04);
  // 3–4: evaporation bubbles, the latent heat (a warm chord swell), the updraft riser, inflow whoosh, the anvil spread
  for (let k = 0; k < 16; k++) { const r = RNG('evb', k); blip(8.3 + k * 0.14 + r.f() * 0.05, 500 + r.i(0, 300), 1400 + r.i(0, 400), 0.04, 0.01, r.n(0.5)); }
  ['C5', 'Ds5', 'G5'].forEach((n, i) => pul(C('latent') + i * 0.05, n, 0.025, 0.7, { duty: 25, vib: true, send: 0.4 })); pop(C('latent') + 0.6, 0.03);
  riser(C('updraft'), C('anvil'), 0.03); whoosh(C('anvil') + 0.3, 0.6, 0.025); whoosh(C('inflow') + 0.6, 0.6, 0.02, false);
  // 5: the globe: two little swirls (up and down glides)
  pul(17.8, 'C5', 0.025, 0.5, { duty: 12, slide: 1.5 }); pul(18.2, 'G5', 0.025, 0.5, { duty: 12, slide: 0.66 }); pop(C('equator') + 0.3, 0.03);
  // 6: the wind builds under the music; each category gets a big-number hit; the eye opens with a glassy chime
  wind(21, 30.9, 0.02, 300, 900);
  { let prev = catOf(windAt(21))[1]; for (let t = 21; t < 30.9; t += 0.02) { const c = catOf(windAt(t))[1]; if (c !== prev) { bigNum(t, 0.035); prev = c; } } }
  chime(C('eyeOpen') + 0.3, [nz('C6'), nz('G6')], 0.02);
  // 8: the eye: wind drops away (calm), the sinking-air whoosh down; the plane: engine drone + turbulence rattles in the wall
  whoosh(33.6, 0.8, 0.02, false);
  { const t0 = C('plane'); const o = osc('sawtooth', 110, t0, t0 + 3); o.frequency.linearRampToValueAtTime(95, t0 + 3); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.012, t0 + 0.4); g.gain.setValueAtTime(0.012, t0 + 2.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3); o.connect(lp); lp.connect(g); out(g, 0.3, 0.1);
    for (let k = 0; k < 10; k++) noiseHit(t0 + 0.2 + k * 0.07, 0.03, 'bandpass', 1500 + (k % 3) * 400, 2, 0.03, 0.3); for (let k = 0; k < 10; k++) noiseHit(t0 + 2.0 + k * 0.07, 0.03, 'bandpass', 1500 + (k % 3) * 400, 2, 0.03, -0.3); }
  wind(34.8, 38, 0.018, 600, 1600);
  // 9: the cities light up (a shimmer of ticks), the comparison label
  for (let k = 0; k < 20; k++) tick(C('grid') + k * 0.17, 0.012 + k * 0.0008); bigNum(41.0, 0.04);
  // 10: landfall: wind, the surge (a deep wave crash), rain
  wind(44, 50, 0.03); noiseHit(44, 6, 'highpass', 5000, 0.5, 0.008);
  noiseHit(C('surge'), 2.0, 'lowpass', 1200, 0.7, 0.06, 0, 0.3, 200); sub(C('surge'), 0.12); pop(C('surge') + 0.5, 0.03);
  // 11: the counter falls: a descending tick on every category drop; the wind thins out
  { let prev = catOf(windAt(50))[1]; for (let t = 50; t < 56; t += 0.02) { const c = catOf(windAt(t))[1]; if (c !== prev) { pul(t, 'G5', 0.03, 0.2, { duty: 25, slide: 0.7 }); prev = c; } } }
  wind(50, 54, 0.012, 300, 700); pop(52.6, 0.03);
  // 12: calm sea: a soft swell; the new cloud (a rising pair); the title
  for (let k = 0; k < 3; k++) noiseHit(56.2 + k * 1.3, 1.2, 'lowpass', 600, 0.7, 0.012, 0, 0.3, 300);
  pul(C('newCloud'), 'C5', 0.02, 0.4, { duty: 25, slide: 1.5, send: 0.3 }); bigNum(C('title') + 0.1, 0.03);
