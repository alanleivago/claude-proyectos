  // SCORE BODY — polvo de estrellas, 60 s. An 8-bit documentary score in D minor, 120 BPM. Like the reference, a
  // continuous BED carries the weight under the melody from the first frame: a held pulse-wave bass (root, with a
  // sine sub an octave down) and held three-note chords, one chord per bar. On top: pulse arps, the theme, noise drums.
  // Silence 34.0–35.0, the loudest hit at 35.0 (the supernova). Story-time cues are mapped to video time with NT.
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
  // ---- THIS PIECE'S OWN MUSIC: E minor, a space-documentary chiptune. Different from hackeo-1834 on purpose:
  // key, progressions, a bouncing octave bass on 8ths (with the held sub under it), 16th up-down arps with octave
  // jumps, an echoing 12.5 % lead, a syncopated kick (1, 2&, 3) and a noise clap on 2 and 4.
  const CH = {
    Em: ['E2', ['E3', 'G3', 'B3'], ['E4', 'B4', 'G4', 'E5', 'B5', 'G5']], C: ['C2', ['C3', 'E3', 'G3'], ['C4', 'G4', 'E4', 'C5', 'G5', 'E5']],
    G: ['G1', ['G2', 'B2', 'D3'], ['G3', 'D4', 'B3', 'G4', 'D5', 'B4']], D: ['D2', ['D3', 'Fs3', 'A3'], ['D4', 'A4', 'Fs4', 'D5', 'A5', 'Fs5']],
    Am: ['A1', ['A2', 'C3', 'E3'], ['A3', 'E4', 'C4', 'A4', 'E5', 'C5']], B: ['B1', ['B2', 'Ds3', 'Fs3'], ['B3', 'Fs4', 'Ds4', 'B4', 'Fs5', 'Ds5']],
    E: ['E2', ['E3', 'Gs3', 'B3'], ['E4', 'B4', 'Gs4', 'E5', 'B5', 'Gs5']],
  };
  const PROG = ['Em', 'C', 'G', 'D'];
  const HAR = [[0, ['Em', 'C']], [4, ['Em', 'C', 'Am', 'B']], [8, ['C', 'D']], [12, PROG], [16, ['Am', 'Em']], [20, ['Em', 'C', 'Am', 'B']],
               [31.5, ['Em', 'B']], [33.9, ['Em']], [35, ['Em']], [40, ['C', 'D', 'Em', 'Em']], [44, PROG], [48, ['C', 'G', 'D', 'Em']],
               [52, ['Am', 'C']], [56, ['Em', 'C']], [58, ['E']]];
  const harAt = (t) => { let i = 0; while (i + 1 < HAR.length && HAR[i + 1][0] <= t + 1e-6) i++; return i; };
  const chordAt = (t) => { const [s0, prog] = HAR[harAt(t)]; return CH[prog[Math.floor((t - s0) / BAR + 1e-6) % prog.length]]; };
  const barEnd = (t) => { const i = harAt(t), s0 = HAR[i][0], nb = s0 + (Math.floor((t - s0) / BAR + 1e-6) + 1) * BAR; return Math.min(nb, i + 1 < HAR.length ? HAR[i + 1][0] : 1e9); };
  // THE BED: per bar a held sine sub (an octave under the root) + held 25 % chord voices; o.bounce adds the octave
  // bass on 8ths (root, octave, root, fifth...) in a 50 % pulse: the bass's presence
  function bed(t0, t1, vel, o = {}) {
    for (let t = t0; t < t1 - 1e-6; ) {
      const next = Math.min(t1, barEnd(t)), d = next - t, [root, voices] = chordAt(t), fr = F(root);
      hold(t, d, fr / 2, vel * 1.4, { wave: 'sine', att: 0.03, rel: 0.08, send: 0 });
      if (o.chords !== false) voices.forEach((n, i) => hold(t, d, n, vel * (o.chordVel ?? 0.4), { duty: 25, cut: o.cut ?? 1400, att: 0.08, rel: 0.12, pan: (i - 1) * 0.35, send: 0.3 }));
      if (o.bounce) { const pat = [1, 2, 1, 1.5, 1, 2, 1.5, 2]; for (let k = 0, b = t; b < next - 1e-6; k++, b += E8) pul(b, fr * pat[k % 8], vel * (k % 2 ? 0.95 : 1.25), E8 * 0.85, { duty: 50, cut: 700, send: 0 }); }
      else hold(t, d, fr, vel * 1.1, { duty: 50, cut: 450, att: 0.02, rel: 0.06, send: 0 });
      t = next;
    }
  }
  const clap = (t, vel) => { noiseHit(t, 0.07, 'bandpass', 1300, 1.2, vel, 0.05, 0.15); noiseHit(t + 0.012, 0.05, 'bandpass', 1500, 1.2, vel * 0.7, -0.05); };
  const ohat = (t, vel) => noiseHit(t, 0.09, 'highpass', 7000, 0.8, vel, -0.15);
  // arps (16ths up-down with octave jumps, 8ths when sparse) and drums by density 0..3
  function groove(t0, t1, dens, o = {}) {
    const step = dens >= 1 ? E16 : E8, UPDN = [0, 1, 2, 3, 4, 5, 4, 3];
    for (let t = t0; t < t1 - 1e-6; t += step) {
      const s0 = HAR[harAt(t)][0], arp = chordAt(t)[2], k = Math.round((t - t0) / step), r = (t - s0) / BEAT, bi = Math.round(r), onBeat = Math.abs(r - bi) < 1e-3, pos16 = Math.round(r * 4) % 16;
      pul(t, arp[UPDN[k % 8]], (o.arpVel ?? 0.02) * (k % 4 === 0 ? 1.2 : k % 2 ? 0.7 : 0.9), step * 0.7, { duty: 12, cut: 3000, pan: Math.sin(k * 0.8) * 0.4 });
      if (dens >= 1 && pos16 % 4 === 2) ohat(t, 0.01);
      if (dens >= 2 && onBeat && bi % 2 === 1) clap(t, 0.05);
      if (dens >= 3 && [0, 6, 8].includes(pos16 % 16)) kick(t, 0.17);
      if (dens >= 3 && pos16 % 2 === 1) hat(t, 0.006);
    }
  }
  // the theme in E minor, harmonised bar by bar to Em – C – G – D; every note is answered by an echo 3 16ths later
  const THEME = [['E5', 0, 2], ['G5', 2, 1], ['B5', 3, 3], ['A5', 6, 1], ['G5', 7, 1],
                 ['G5', 8, 3], ['E5', 11, 1], ['C5', 12, 2], ['D5', 14, 1], ['E5', 15, 1],
                 ['D5', 16, 2], ['G5', 18, 1], ['B5', 19, 2], ['D6', 21, 1], ['B5', 22, 2],
                 ['A5', 24, 3], ['Fs5', 27, 1], ['D5', 28, 2], ['E5', 30, 2]];
  const theme = (t0, vel, o = {}) => THEME.forEach(([n, a, l]) => { const t = t0 + a * E8; if (a >= (o.from ?? 0) * 8 && a < (o.to ?? 4) * 8 && t < (o.until ?? 1e9)) {
    const d = Math.min(l * E8 * 0.9, (o.until ?? 1e9) - t); pul(t, n, vel, d, { duty: o.duty ?? 12, vib: true, cut: 3600, pan: -0.1, send: 0.3 });
    if (o.echo !== false && t + 3 * E16 < (o.until ?? 1e9)) pul(t + 3 * E16, n, vel * 0.35, Math.min(d, 0.3), { duty: o.duty ?? 12, cut: 2400, pan: 0.35, send: 0.4 }); } });
  // a high bell counter-line (25 %), one note per beat from the chord
  const bells = (t0, t1, vel) => { for (let t = t0; t < t1 - 1e-6; t += BEAT) { const a = chordAt(t)[2]; pul(t + E8, a[(Math.round(t / BEAT) % 3) + 3], vel, 0.18, { duty: 25, cut: 5000, pan: 0.45, send: 0.45 }); } };

  to = 'm';
  // 0–12 origin: the bed from frame 0 (held bass), sparse 8th arps; the theme enters with the cloud
  bed(0, 4, 0.032);
  groove(0, 4, 0, { arpVel: 0.012 });
  bed(4, 12, 0.033, { bounce: true });
  groove(4, 12, 0, { arpVel: 0.015 });
  theme(4, 0.024);
  bells(8, 12, 0.008);
  // 12–20 the blue star, the red giant: 16th arps, open hats, claps
  bed(12, 20, 0.034, { bounce: true });
  groove(12, 20, 2, { arpVel: 0.014 });
  theme(12, 0.027);
  // 20–31.5 the onion: full drums from the carbon shell, the theme in 25 %, bells from oxygen
  bed(20, 31.5, 0.035, { bounce: true });
  groove(20, 22.8, 1, { arpVel: 0.016 });
  groove(22.8, 31.5, 3, { arpVel: 0.016 });
  theme(20, 0.024, { duty: 25 });
  theme(28, 0.022, { duty: 12, to: 2 });
  bells(26.8, 31.5, 0.009);
  // 31.5–34 iron: dense but held back; everything stops dead at 33.9 (silence 34–35)
  bed(31.5, 33.9, 0.022);
  groove(31.5, 33.875, 2, { arpVel: 0.015 });
  for (let k = 0; k < 8; k++) pul(31.5 + k * E8, ['B5', 'G5', 'E5', 'G5', 'B5', 'A5', 'Fs5', 'Ds5'][k], 0.012, E16 * 1.5, { duty: 12, pan: 0.3 });
  // 35 THE SUPERNOVA: an E-minor stab + sub, then a flat held chord
  const H = C('nova');
  ['E3', 'B3', 'E4', 'G4', 'B4'].forEach((n, i) => pul(H, n, 0.08, 0.5, { duty: 50, cut: 4400, pan: (i - 2) * 0.15, send: 0.35 }));
  hold(H, 0.6, 'E1', 0.1, { wave: 'sine', att: 0.005, rel: 0.35, send: 0 }); sub(H, 0.55);
  bed(H + 0.6, 40, 0.03, { chordVel: 0.35, cut: 1000 });
  // 40–48 the new cloud and the Sun: the theme in full with drums, the payoff
  bed(40, 44, 0.044, { bounce: true });
  groove(40, 44, 2, { arpVel: 0.02 });
  theme(40, 0.033, { duty: 25 });
  bed(44, 48, 0.046, { bounce: true });
  groove(44, 48, 3, { arpVel: 0.021 });
  theme(44, 0.034, { duty: 12 });
  bells(44, 48, 0.01);
  // 48–60 you: quieter and warm; the title resolves to E major
  bed(48, 52, 0.013, { chordVel: 0.4 });
  groove(48, 52, 0, { arpVel: 0.008 });
  bed(52, 56, 0.011, { chordVel: 0.4, cut: 1100 });
  bells(52, 56, 0.006);
  bed(56, 58, 0.011, { chordVel: 0.35 });
  theme(56, 0.012, { to: 1 });
  bed(58, 60.6, 0.013, { chordVel: 0.5 });
  pul(58, 'E5', 0.014, 1.8, { duty: 12, vib: true, send: 0.35 }); pul(58, 'Gs5', 0.01, 1.8, { duty: 12, send: 0.35 });

  to = 's';
  const pop = (t, vel = 0.045, hi = false) => { noiseHit(t, 0.012, 'highpass', 5000, 0.7, vel * 0.6); pul(t, hi ? 'E6' : 'C6', vel, 0.05, { duty: 25, send: 0.1 }); pul(t + 0.05, hi ? 'B6' : 'G6', vel, 0.09, { duty: 25, send: 0.15 }); };
  const bigNum = (t, vel = 0.05) => { ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pul(t + i * 0.03, n, vel, 0.07, { duty: 25, send: 0.15 })); kick(t, 0.12); };
  const tick = (t, vel = 0.03) => { pul(t, 'G5', vel, 0.03, { duty: 12, cut: 5000 }); noiseHit(t, 0.01, 'highpass', 6000, 0.7, vel * 0.5); };
  const zap = (t, vel = 0.04, up = false) => pul(t, up ? 'A4' : 'A5', vel, 0.35, { duty: 12, slide: up ? 2.2 : 0.45, send: 0.3 });
  const whoosh = (t, d = 0.35, vel = 0.02) => sweep(t - d, t, vel, 500, 4000);
  // the mosaic zooms between beats: a pixel whoosh up into each cut
  SHOT_LIST.slice(1).forEach(([t0]) => { if (Math.abs(t0 - 35) > 0.1 && Math.abs(t0 - 33.5) > 0.1) { whoosh(t0, 0.3, 0.018); for (let k = 0; k < 4; k++) pul(t0 - 0.24 + k * 0.06, nz('A5') * 2 ** (k * 3 / 12), 0.01, 0.04, { duty: 12 }); } });
  // box captions: open click, then typing ticks every other glyph
  CAPS.forEach(([t0, lines, o = {}]) => { if (!lines) return; const n = lines.reduce((a, ln) => a + (typeof ln === 'string' ? ln.length : ln.reduce((b, s) => b + s[0].length, 0)), 0);
    if (!o.big) noiseHit(t0, 0.02, 'bandpass', 2500, 2, 0.02);
    for (let k = 0; k < n; k += 2) { const t = t0 + (o.big ? k / 22 : 0.15 + k / 30); if (t > 33.95 && t < 35) break; pul(t, 1900 + ((k * 37) % 5) * 60, 0.013, 0.014, { duty: 12, cut: 6000, send: 0 }); } });
  // 1: cells, the atom, the zap into a point of light
  zap(1.6, 0.04, true); bigNum(1.9); pop(2.1, 0.035); zap(C('zoomOut'), 0.045);
  // 2: atoms labelled
  pop(5.0); pop(5.3, 0.04, true); pop(5.8);
  // 3: shock and ignition
  sweep(C('shock'), C('ignite'), 0.03, 300, 5000); sub(C('ignite'), 0.13); ['E5', 'B5', 'E6'].forEach((n, i) => pul(C('ignite') + i * 0.04, n, 0.035, 0.6, { duty: 25, vib: true, send: 0.4 }));
  // 4: eight Suns pop in, then fly into the star
  for (let k = 0; k < 8; k++) pul(C('sunIcon') + k * 0.15, nz('C5') * 2 ** ([0, 2, 4, 5, 7, 9, 11, 12][k] / 12), 0.03, 0.06, { duty: 25 });
  for (let k = 0; k < 8; k++) pul(14.6 + 0.5 + k * 0.05, 'C6', 0.015, 0.03, { duty: 12 });
  whoosh(15.1, 0.5, 0.025); bigNum(CU.sunIcon + 1.2, 0.04);
  // 5: the swell (a slow falling tone) and the cut opening
  pul(C('swell'), 'A3', 0.03, 1.8, { duty: 50, slide: 0.5, cut: 1500, send: 0.3 }); noiseHit(C('slice'), 0.25, 'bandpass', 1200, 1.5, 0.04, 0, 0.2, 4000);
  // 6: each shell ignites: a rising two-note chime, higher each stage; the clock ticks, faster each stage
  ['He', 'C', 'Ne', 'O', 'Si'].forEach((el, k) => { const t = C(el); pul(t, nz('E5') * 2 ** (k * 2 / 12), 0.04, 0.1, { duty: 25, send: 0.3 }); pul(t + 0.08, nz('B5') * 2 ** (k * 2 / 12), 0.04, 0.3, { duty: 25, send: 0.3 }); noiseHit(t, 0.05, 'highpass', 3000, 0.7, 0.03); });
  { const sp = [0.6, 1.2, 2.4, 4.8, 9.6], st = ['He', 'C', 'Ne', 'O', 'Si', 'Fe']; for (let k = 0; k < 5; k++) { const step = 1 / (sp[k] * 2); for (let t = C(st[k]); t < C(st[k + 1]) - 1e-6; t += Math.max(step, 0.06)) tick(t, 0.012 + k * 0.002); } }
  // 7: iron: a dull thud, the heartbeat dying, the clock stops
  sub(C('Fe'), 0.12); pul(C('Fe'), 'E2', 0.04, 0.4, { duty: 50, cut: 500 });
  for (let k = 0; k < 4; k++) { const t = C('Fe') + 0.3 + k * 0.57; tri(t, 'E2', 0.09 * (1 - k * 0.22), 0.12); tri(t + 0.15, 'E2', 0.06 * (1 - k * 0.22), 0.1); }
  // 8: the collapse: a fast falling sweep and a rumble, then nothing
  pul(C('collapse'), 'A5', 0.05, 0.4, { duty: 12, slide: 0.12, send: 0.2 }); noiseHit(C('collapse'), 0.4, 'lowpass', 2000, 0.8, 0.06, 0, 0, 120);
  // 9: the supernova's tail: a noise burst falling, crackles, element pops as the symbols appear
  noiseHit(H, 1.6, 'lowpass', 6000, 0.7, 0.07, 0, 0.4, 300);
  for (let k = 0; k < 20; k++) noiseHit(H + 0.3 + k * 0.11, 0.02, 'highpass', 4000 + (k % 4) * 800, 0.8, 0.02 * (1 - k / 22), (k % 2 ? 0.4 : -0.4));
  [0.9, 1.2, 1.5, 1.8].forEach((d, k) => pop(H + d, 0.035, k % 2));
  // 10–11: the new cloud turns; the Sun ignites (a warm chord); planets appear
  sweep(40.2, 41.0, 0.012, 400, 2000);
  ['E5', 'Gs5', 'B5'].forEach((n, i) => pul(C('sunOn') + i * 0.05, n, 0.03, 0.8, { duty: 25, vib: true, send: 0.4 })); pop(C('sunOn') + 0.4, 0.03);
  for (let k = 0; k < 4; k++) pul(45 + k * 0.5, ['E6', 'G6', 'A6', 'C7'][k], 0.012, 0.05, { duty: 12 });
  whoosh(48.0, 0.8, 0.03);
  // 12: the bar fills, segment by segment
  [0, 0.45, 0.9, 1.35, 1.8].forEach((d, k) => { pul(C('bar') + d, nz('C5') * 2 ** ([0, 4, 7, 9, 12][k] / 12), 0.03, 0.12, { duty: 25 }); });
  pop(C('bar') + 1.6, 0.03, true);
  // 13: the heartbeat
  for (let k = 0; k < 7; k++) { const t = 52.2 + k * 0.9; if (t > 55.9) break; tri(t, 'E2', 0.08, 0.12); tri(t + 0.15, 'E2', 0.055, 0.1); }
  pop(52.8, 0.03); pop(53.2, 0.03, true); whoosh(56.0, 0.8, 0.03);
  // 14: back in the blood: the iron glint, the title, the zoom out to the sky
  zap(56.4, 0.03, true); bigNum(C('title'), 0.035); sweep(58.8, 59.8, 0.015, 3000, 400);
