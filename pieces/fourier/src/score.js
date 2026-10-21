  // SCORE BODY — What if any drawing can be made with spinning circles? Music = the user's track (piece.json "music");
  // this body is the sound effects only (sfx bus), loud and present: ticks, spins, swells and the payoff.
  to = 's';
  // ---- instruments
  const rumble = (t, dur, vel, pan = 0, cut = 180) => {   // a long low roll of thunder: looped noise, lowpassed, slow swells
    const src = ac.createBufferSource(); src.buffer = noise; src.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.9; lp.frequency.setValueAtTime(cut * 2.5, t); lp.frequency.exponentialRampToValueAtTime(cut, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.08);
    const R = RNG('rum', t);
    for (let k = 1; k <= 6; k++) g.gain.linearRampToValueAtTime(vel * R.r(0.35, 1), t + dur * k / 7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(lp); lp.connect(g); out(g, pan, 0.5); src.start(t, (t * 1.7) % 2); src.stop(t + dur + 0.05);
  };
  const crackle = (t, dur, vel, pan = 0, key = 'c') => {   // dry electric crackle: a burst of tiny high clicks
    const R = RNG('crk', key, t), n = Math.max(3, Math.round(dur * 60));
    for (let i = 0; i < n; i++) noiseHit(t + R.r(0, dur), 0.012, 'highpass', 2500 + R.r(0, 4000), 0.8, vel * R.r(0.4, 1), pan + R.r(-0.2, 0.2), 0.05);
  };
  const zap = (t, vel, pan = 0, f0 = 2600, f1 = 300) => {   // an electric zap: a fast falling buzz + crackle
    const o = osc('sawtooth', f0, t, t + 0.2); o.frequency.exponentialRampToValueAtTime(f1, t + 0.16);
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.8;
    const g = ac.createGain(); env(g, t, 0.002, vel * 0.5, 0.16); o.connect(bp); bp.connect(g); out(g, pan, 0.15);
    crackle(t, 0.12, vel * 0.7, pan, 'z');
  };
  const crack = (t, vel, pan = 0) => {   // the strike itself: a sharp broadband crack, a sub punch, a roll
    noiseHit(t, 0.05, 'highpass', 1200, 0.6, vel, pan, 0.4);
    noiseHit(t + 0.01, 0.22, 'bandpass', 2400, 0.7, vel * 0.7, pan, 0.5, 600);
    crackle(t, 0.2, vel * 0.8, pan, 'k');
    sub(t, vel * 0.9);
  };
  const tick = (t, vel = 0.12, pan = 0, f = 3000) => { noiseHit(t, 0.015, 'bandpass', f, 4, vel, pan); blip(t, f * 0.7, f * 0.5, 0.03, vel * 0.25, pan); };
  const ice = (t, vel, pan = 0) => { blip(t, 3400, 2600, 0.05, vel * 0.5, pan); noiseHit(t, 0.03, 'highpass', 5000, 1, vel * 0.6, pan, 0.2); };
  const pop = (t, vel, pan = 0, f = 900) => blip(t, f, f * 1.6, 0.06, vel, pan);
  const typing = (t0, n, cps, vel = 0.05, pan = 0) => { for (let i = 0; i < n; i++) tick(t0 + i / cps, vel, pan, 2200 + (i % 3) * 400); };
  const hum = (t0, t1, vel) => {   // a mains-like buzz: 100 Hz saw, bandpassed, tremolo
    const o = osc('sawtooth', 100, t0, t1 + 0.05), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 1.5;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vel, t0 + 0.4); g.gain.setValueAtTime(vel, t1 - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t1);
    o.connect(bp); bp.connect(g); out(g, 0, 0.1);
  };
  const whoosh = (t, d, vel, f0 = 300, f1 = 3000, pan = 0) => sweep(t - d, t, vel, f0, f1, pan);

  // (no rain bed: a constant hiss pumps audibly in every pause of the voice)


  const drop = (t, vel, f = 900, pan = 0.2) => blip(t, f * 1.6, f * 0.5, 0.18, vel, pan);
  const pew = (t, vel, f = 1800, pan = 0.4) => { blip(t, f * 0.6, f * 1.8, 0.22, vel, pan); noiseHit(t, 0.08, 'highpass', 5000, 0.8, vel * 0.3, pan, 0.3); };

  const sub2 = (t, v) => sub(t, v * 0.4);   // every other low hit sits well under the payoff
  const click = (t, vel, pan = 0) => { tick(t, vel, pan, 1600); noiseHit(t, 0.04, 'bandpass', 800, 2, vel * 0.7, pan); };

  const sizzle = (t, dur, vel, pan = 0) => { crackle(t, dur, vel, pan, 'sz' + t); noiseHit(t, Math.min(1.2, dur), 'bandpass', 3500, 0.8, vel * 1.4, pan, 0.2); };
  const buzz = (t0, t1, vel) => hum(t0, t1, vel);
  const stretch = (t, dur, vel, pan = 0) => { sweep(t, t + dur, vel, 200, 1400, pan); noiseHit(t + dur, 0.05, 'bandpass', 1200, 2, vel * 1.2, pan); };   // a rope pulled taut
  const strike = (t, vel, pan = 0) => { noiseHit(t, 0.03, 'highpass', 3000, 1, vel * 0.8, pan); tick(t, vel * 0.8, pan, 2400); };   // a red line drawn through
  const spin = (t0, t1, vel, f = 900, pan = 0) => { for (let x = t0; x < t1; x += 0.11) blip(x, f, f * 1.05, 0.03, vel * (0.6 + 0.4 * Math.sin(x * 7)), pan + 0.4 * Math.sin(x * 3)); };   // a turning circle ticking
  const addC = (t, i) => blip(t, 600 * (2 * i + 1) ** 0.35, 640 * (2 * i + 1) ** 0.35, 0.06, 0.05, ((i % 2) - 0.5) * 0.8);
  // ---- title, the π drawn by 45 circles
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0 + 0.1, 19, 26, 0.03, -0.2); typing(VW('title', 'nothing') - 0.2, 32, 30, 0.03, 0.2);
  sweep(0.5, VW('letter', 'them') + 0.2, 0.04, 300, 2600, 0); spin(0.6, VW('letter', 'them'), 0.015, 1400, 0);
  { const t = VW('letter', 'fortyfive') - 0.1; pop(t, 0.12, 0, 520); chime(t + 0.1, [1046.5, 1568], 0.04, 0); }
  // ---- one circle, the wave
  { const t = S('parts') + 0.2; sweep(t + 0.5, t, 0.05, 3000, 300, 0); }
  { const t = VW('point', 'point') - 0.2; pop(t, 0.1, -0.3, 700); spin(t, VW('hook', 'hook'), 0.02, 900, -0.3); }
  { const t = VW('wave', 'wave') - 0.5; sweep(t, t + 0.8, 0.04, 400, 1600, 0.3); chime(VW('wave', 'wave'), [880, 1318.5], 0.04, 0.3); }
  // ---- the circles stack up: one blip per added harmonic, faster and higher
  { const t = VW('hook', 'hook') - 0.1; pop(t, 0.12, 0, 900); }
  { const tA = VW('adding', 'adding') - 0.1, tE = VW('corners', 'corners') + 0.3; let last = 2;
    for (let x = tA; x < tE; x += 1 / 48) { const n = Math.floor(nCirc(x)); if (n > last) { addC(x, n); last = n; } } riser(tA, tE, 0.04); }
  { const t = VW('corners', 'corners') - 0.1; click(t, 0.07, -0.3); click(t + 0.12, 0.07, 0.3); }
  // ---- THE PAYOFF: Fourier — after a silence, the loudest moment
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); noiseHit(HIT, 1.0, 'lowpass', 3200, 0.7, 0.8, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  typing(VW('signal', 'any') - 0.1, 10, 24, 0.03, -0.2); { const t = VW('signal', 'sum') - 0.1; typing(t, 18, 26, 0.03, 0.2); chime(t + 0.5, [1046.5, 1568, 2093], 0.05, 0); }
  // ---- free: the π again
  { const t0 = VW('free', 'back') - 1.6; sweep(VW('free', 'freely') - 0.2, VW('free', 'freely') + 0.6, 0.05, 2000, 400, 0); spin(t0, VL('free').t1 + 0.4, 0.012, 1400, 0); chime(VL('free').t1 + 0.4, [1318.5, 1975.5], 0.04, 0); }
  { const t = S('pace') + 0.1; for (let i = 0; i < 5; i++) blip(VW('pace', 'own') - 0.3 + i * 0.1, 700 + i * 180, 700 + i * 180, 0.07, 0.04, -0.6 + i * 0.3); }
  { const t = VW('big', 'keep') - 0.1; sweep(t, t + 0.8, 0.03, 3000, 600, 0); for (let i = 0; i < 12; i++) noiseHit(t + i * 0.06, 0.02, 'highpass', 5000, 1, 0.03, Math.sin(i) * 0.6); pop(VW('big', 'rough') - 0.1, 0.1, 0, 500); }
  // ---- JPEG, MP3, the tiny circles fly off
  pop(VW('jpeg', 'jpeg') - 0.15, 0.08, -0.4, 600); pop(VW('jpeg', 'mp3') - 0.15, 0.08, 0.4, 750);
  { const t = VW('end', 'throw') - 0.2; whoosh(t + 0.8, 0.8, 0.06, 500, 5000, 0); for (let i = 0; i < 10; i++) blip(t + i * 0.08, 2400 + i * 150, 2600 + i * 150, 0.03, 0.025, Math.sin(i * 2) * 0.7); }
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.06, 0);   // Bitstory
