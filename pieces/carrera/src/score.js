  // SCORE BODY — ganaste esa carrera, ~60 s, 120 BPM, under a narrator. Its own music in TWO colours: the race in B minor
  // (Bm–G–A–F#) with a GALLOP bass (dum-da-da on every beat), a 16th arp racing up, four-on-the-floor; after "Tú" the same
  // tonic's relative D major (D–A–Bm–G) with a heartbeat bass (lub-dub), a music-box arp and a lullaby lead.
  // Silence 23.75–24.75, the hit at 24.75 ("Tú").
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
    Bm: ['B1', ['B2', 'D3', 'Fs3'], ['B4', 'D5', 'Fs5', 'B5']], G: ['G1', ['G2', 'B2', 'D3'], ['G4', 'B4', 'D5', 'G5']],
    A: ['A1', ['A2', 'Cs3', 'E3'], ['A4', 'Cs5', 'E5', 'A5']], Fs: ['Fs1', ['Fs2', 'As2', 'Cs3'], ['Fs4', 'As4', 'Cs5', 'Fs5']],
    Em: ['E2', ['E3', 'G3', 'B3'], ['E4', 'G4', 'B4', 'E5']], D: ['D2', ['D3', 'Fs3', 'A3'], ['D4', 'Fs4', 'A4', 'D5']],
  };
  const RACE = ['Bm', 'G', 'A', 'Fs'], LIFE = ['D', 'A', 'Bm', 'G'];
  const HAR = [[0, ['Bm', 'G']], [4.5, RACE], [9.5, RACE], [16.0, ['G', 'A']], [19.0, ['Em', 'Fs']], [22.0, ['Fs']], [23.75, ['Bm']],
               [24.75, ['D']], [26.75, LIFE], [35.5, ['G', 'D', 'A', 'A']], [41.0, LIFE], [46.0, ['G', 'A', 'D', 'D']], [52.5, ['Bm', 'G', 'A', 'A']], [55.5, ['G', 'D']]];
  const harAt = (t) => { let i = 0; while (i + 1 < HAR.length && HAR[i + 1][0] <= t + 1e-6) i++; return i; };
  const chordAt = (t) => { const [s0, prog] = HAR[harAt(t)]; return CH[prog[Math.floor((t - s0) / BAR + 1e-6) % prog.length]]; };
  const barEnd = (t) => { const i = harAt(t), s0 = HAR[i][0], nb = s0 + (Math.floor((t - s0) / BAR + 1e-6) + 1) * BAR; return Math.min(nb, i + 1 < HAR.length ? HAR[i + 1][0] : 1e9); };
  // THE BED: held sine sub + held 25 % chord; o.gallop (16ths 0, 2, 3 of every beat) or o.heart (lub-dub: a 16th apart on every beat)
  function bed(t0, t1, vel, o = {}) {
    for (let t = t0; t < t1 - 1e-6; ) {
      const next = Math.min(t1, barEnd(t)), d = next - t, [root, voices] = chordAt(t), fr = F(root);
      hold(t, d, fr, vel * 1.5, { wave: 'sine', att: 0.04, rel: 0.1, send: 0 });
      if (o.chords !== false) voices.forEach((n, i) => hold(t, d, n, vel * (o.chordVel ?? 0.38), { duty: 25, cut: o.cut ?? 1500, att: 0.12, rel: 0.2, pan: (i - 1) * 0.4, send: 0.35 }));
      if (o.gallop || o.heart) { const s0 = HAR[harAt(t)][0];
        for (let b = t; b < next - 1e-6; b += E16) { const p = Math.round((b - s0) / E16) % 4, q = Math.round((b - s0) / E16) % 16;
          if (o.gallop) { if (p === 0) pul(b, fr * 2, vel * 1.4, E16 * 1.6, { duty: 50, cut: 900, send: 0 }); if (p === 2 || p === 3) pul(b, fr * (q >= 8 ? 3 : 4), vel * 0.85, E16 * 0.8, { duty: 50, cut: 900, send: 0 }); }
          else { if (p === 0) pul(b, fr * 2, vel * 1.5, E16 * 1.2, { duty: 50, cut: 700, send: 0 }); if (p === 1) pul(b, fr * 2, vel * 0.8, E16 * 1.2, { duty: 50, cut: 600, send: 0 }); } } }
      else hold(t, d, fr * 2, vel * 0.9, { duty: 50, cut: 500, att: 0.03, rel: 0.08, send: 0 });
      t = next;
    }
  }
  const clap = (t, vel) => { noiseHit(t, 0.06, 'bandpass', 1500, 1.2, vel, -0.1, 0.08); noiseHit(t + 0.012, 0.05, 'bandpass', 1700, 1.2, vel * 0.7, 0.1, 0.08); };
  // o.box: the music box (8ths, high, 12.5 %, a soft echo) instead of the racing 16th arp. Drums: 1 hats, 2 four-on-the-floor + clap 2/4, 3 + 16th hats
  function groove(t0, t1, dens, o = {}) {
    for (let t = t0; t < t1 - 1e-6; t += E16) {
      const s0 = HAR[harAt(t)][0], arp = chordAt(t)[2], k = Math.round((t - t0) / E16), p = Math.round((t - s0) / E16) % 16, av = o.arp ?? 0.014;
      if (av > 0) {
        if (o.box) { if (k % 2 === 0) { const n = F(arp[[0, 2, 1, 3, 2, 1, 3, 2][(k / 2) % 8]]) * 2; pul(t, n, av, E8 * 0.9, { duty: 12, cut: 5000, pan: Math.sin(k * 0.4) * 0.5, send: 0.45 }); pul(t + E8 * 1.5, n, av * 0.3, E8 * 0.6, { duty: 12, cut: 4000, pan: -Math.sin(k * 0.4) * 0.5, send: 0.5 }); } }
        else pul(t, F(arp[k % 4]) * (Math.floor(k / 4) % 2 ? 2 : 1), av * (k % 4 === 0 ? 1.2 : 0.8), E16 * 0.7, { duty: 12, cut: 3600, pan: Math.sin(k * 0.6) * 0.4, send: 0.15 });
      }
      if (dens >= 1 && p % 2 === 0) noiseHit(t, 0.025, 'highpass', 8000, 0.8, p % 4 === 2 ? 0.01 : 0.006, 0.12);
      if (dens >= 2 && p % 4 === 0) kick(t, 0.15);
      if (dens >= 2 && (p === 4 || p === 12)) clap(t, 0.04);
      if (dens >= 3 && p % 2 === 1) noiseHit(t, 0.02, 'highpass', 9000, 0.8, 0.005, -0.12);
      if (dens >= 3 && p === 14) kick(t, 0.1);
    }
  }
  const RACE_T = [['Fs5', 0, 2], ['B5', 2, 2], ['D6', 4, 1], ['Cs6', 5, 1], ['B5', 6, 2], ['D6', 8, 3], ['B5', 11, 1], ['G5', 12, 4],
                  ['E6', 16, 2], ['Cs6', 18, 2], ['A5', 20, 2], ['Cs6', 22, 2], ['As5', 24, 3], ['Cs6', 27, 1], ['Fs6', 28, 4]];
  const LIFE_T = [['Fs5', 0, 3], ['A5', 3, 1], ['D6', 4, 4], ['E6', 8, 3], ['Cs6', 11, 1], ['A5', 12, 4],
                  ['B5', 16, 2], ['D6', 18, 2], ['Fs6', 20, 4], ['E6', 24, 2], ['D6', 26, 2], ['B5', 28, 4]];
  const theme = (T, t0, vel, o = {}) => T.forEach(([n, a, l]) => { const t = t0 + a * E8; if (a < (o.to ?? 4) * 8 && t < (o.until ?? 1e9)) pul(t, n, vel, Math.min(l * E8 * 0.92, (o.until ?? 1e9) - t), { duty: o.duty ?? 50, vib: true, cut: 3200, pan: -0.05, send: 0.35 }); });

  to = 'm';
  bed(0, 4.5, 0.026, { gallop: true });                 // the title: the gallop already running
  groove(0, 4.5, 1, { arp: 0.012 });
  bed(4.5, 16, 0.028, { gallop: true });                // the race
  groove(4.5, 16, 2, { arp: 0.013 });
  theme(RACE_T, 6.5, 0.02, { until: 15.9 });
  bed(16, 22, 0.027, { gallop: true, chordVel: 0.42 }); // the egg, digging
  groove(16, 22, 2, { arp: 0.013 });
  bed(22, 23.75, 0.026, { gallop: true });              // through: the busiest
  groove(22, 23.7, 3, { arp: 0.014 });
  // 24.75 THE HIT ("Tú"): a D-major stab + sub, then the warm colour
  const H = C('hit');
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pul(H, n, 0.078, 0.55, { duty: 50, cut: 4400, pan: (i - 2.5) * 0.12, send: 0.35 }));
  hold(H, 0.7, 'D2', 0.11, { wave: 'sine', att: 0.005, rel: 0.4, send: 0 }); sub(H, 0.6);
  bed(H + 0.6, 26.75, 0.034, { chordVel: 0.42 });
  bed(26.75, 41, 0.044, { heart: true });               // seal, divisions, the ball: the payoff
  groove(26.75, 41, 2, { arp: 0.022, box: true });
  theme(LIFE_T, 26.75, 0.032);
  theme(LIFE_T, 34.75, 0.03, { duty: 25, to: 3 });
  bed(41, 52.5, 0.02, { heart: true, chordVel: 0.42 }); // the heart and the growing: softer
  groove(41, 52.5, 0, { arp: 0.012, box: true });
  theme(LIFE_T, 46.75, 0.014, { to: 3 });
  bed(52.5, DURATION, 0.014, { chordVel: 0.5 });
  groove(52.5, 57.5, 0, { arp: 0.008, box: true });
  pul(57.5, 'Fs5', 0.012, 1.8, { duty: 50, vib: true, send: 0.4 }); pul(57.5, 'A5', 0.009, 1.8, { duty: 50, send: 0.4 });

  to = 's';
  const pop = (t, vel = 0.045, hi = false) => { noiseHit(t, 0.012, 'highpass', 5000, 0.7, vel * 0.6); pul(t, hi ? 'D7' : 'B6', vel, 0.05, { duty: 25, send: 0.1 }); pul(t + 0.05, hi ? 'A7' : 'Fs7', vel, 0.09, { duty: 25, send: 0.15 }); };
  const bigNum = (t, vel = 0.05) => { ['D5', 'Fs5', 'A5', 'D6'].forEach((n, i) => pul(t + i * 0.03, n, vel, 0.07, { duty: 25, send: 0.15 })); kick(t, 0.12); };
  const tick = (t, vel = 0.012) => pul(t, 'A6', vel, 0.02, { duty: 12, cut: 6000, send: 0 });
  const whoosh = (t, d = 0.35, vel = 0.025, up = true) => sweep(t - d, t, vel, up ? 500 : 4000, up ? 4000 : 500);
  const quiet = (t) => t > 23.7 && t < 24.75;
  CAPS.forEach(([t0, lines, o = {}]) => { if (!lines) return; const n = lines.reduce((a, ln) => a + (typeof ln === 'string' ? ln.length : ln.reduce((b, s) => b + s[0].length, 0)), 0);
    if (!o.big) noiseHit(t0, 0.02, 'bandpass', 2500, 2, 0.02);
    for (let k = 0; k < n; k += 2) { const t = t0 + (o.big ? k / 22 : 0.15 + k / 30); if (quiet(t)) break; pul(t, 1900 + ((k * 37) % 5) * 60, 0.014, 0.014, { duty: 12, cut: 6000, send: 0 }); } });
  SHOT_LIST.slice(1).forEach(([t0]) => { if (Math.abs(t0 - 23.75) > 0.1 && Math.abs(t0 - 24.75) > 0.1) whoosh(t0, 0.3, 0.025); });
  // the tunnel: a rushing low wind, with swells
  for (let t = 0; t < 16; t += 0.5) sweep(t, t + 0.55, 0.012 * (0.7 + 0.3 * Math.sin(t * 2)), 300 + 150 * Math.sin(t), 900 + 300 * Math.sin(t * 1.3), Math.sin(t) * 0.4);
  noiseHit(0, 22, 'lowpass', 220, 0.7, 0.02, 0, 0.1, 400);
  // 2: TÚ label, the counter lands; 3: the counter falls (fast ticks), the labels drop in pitch
  pop(4.9, 0.04, true); bigNum(C('rivals'), 0.05);
  for (let t = C('lost'); t < 18; t += 0.0833) tick(t, 0.008 + 0.004 * Math.sin(t * 7));
  [C('tired') + 0.2, C('stuck') + 0.1, C('wrong') + 0.2].forEach((t, i) => { pul(t, ['E6', 'D6', 'B5'][i], 0.035, 0.35, { duty: 25, slide: 0.5, send: 0.25 }); noiseHit(t, 0.015, 'highpass', 5000, 0.7, 0.02); });
  // 4: the egg appears (a warm chime), 5: digging (scratchy bursts), 6: through (a riser, a pop)
  chime(C('egg') + 0.3, [nz('D6'), nz('Fs6'), nz('B6')], 0.03); pop(C('egg') + 0.4, 0.035);
  for (let k = 0; k < 24; k++) { const r = RNG('dg', k); noiseHit(19.1 + k * 0.12 + r.f() * 0.05, 0.04, 'bandpass', 900 + r.i(0, 900), 2, 0.025, r.n(0.6)); }
  riser(22.2, 23.6, 0.04); pul(C('through') + 0.5, 'B5', 0.04, 0.12, { duty: 25, slide: 2, send: 0.2 }); noiseHit(C('through') + 0.5, 0.15, 'lowpass', 2000, 0.8, 0.04);
  // 8: the hit is in the music; the flash ring; the seal wave (a long upward sweep), the late ones bounce (blips), SELLADO thump
  noiseHit(H, 0.6, 'lowpass', 3000, 0.7, 0.05, 0, 0.4, 100);
  sweep(C('seal') + 1.0, C('seal') + 2.4, 0.03, 400, 4000);
  for (let k = 0; k < 12; k++) blip(C('seal') + 1.3 + k * 0.12, 1800 - k * 60, 1200 - k * 50, 0.05, 0.02, Math.sin(k * 1.7) * 0.6);
  sub(C('closed') + 0.3, 0.08); noiseHit(C('closed') + 0.3, 0.2, 'lowpass', 600, 0.7, 0.05); pul(C('closed') + 0.3, 'D3', 0.05, 0.3, { duty: 50, send: 0.2 });
  // 9: a plop on every division (up a step each time), the counter pops
  cu.div.forEach((t, i) => { pul(t, ['D5', 'Fs5', 'A5', 'D6'][i], 0.05, 0.18, { duty: 25, slide: 1.5, send: 0.3 }); noiseHit(t, 0.05, 'lowpass', 1500, 0.8, 0.035); pop(t + 0.08, 0.025, i % 2 === 1); });
  // 10: the ball nestles in (a soft squelch + a low glide)
  noiseHit(C('nest'), 0.8, 'lowpass', 500, 0.7, 0.04, 0, 0.3, 150); pul(C('nest'), 'A3', 0.04, 1.2, { duty: 50, slide: 0.66, send: 0.3 }); pop(C('nest') + 1.4, 0.03);
  // 11: the heartbeat: lub-dub thumps on every beat once the loupe opens (into the growing, fading)
  for (let t = Math.ceil((C('beat') - 0.3) / 0.5) * 0.5; t < 52.4; t += 0.5) { const v = t < 46 ? 0.11 : 0.11 * (1 - (t - 46) / 7); sub(t, v); kick(t + 0.11, v * 0.8); }
  bigNum(C('beat'), 0.045);
  // 12: the week counter ticks; born
  cu.week.forEach(([t]) => bigNum(t + 0.05, 0.035)); chime(C('born'), [nz('D6'), nz('A6')], 0.025);
  // 13: the dots fade (a falling shimmer), the one stays (a bright ping)
  sweep(52.6, 54.2, 0.025, 6000, 1500); chime(53.6, [nz('D6'), nz('Fs6'), nz('A6')], 0.03);
  bigNum(C('title') + 0.1, 0.03);
