  // SCORE BODY — Why do LED lights use so little electricity? Music = the user's track (piece.json "music");
  // this body is the sound effects only (sfx bus), loud and present: switches, heat, electrons and photons.
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
  // ---- title and the two bulbs
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0 - 0.05, 17, 22, 0.03, -0.2); typing(VW('title', 'use') - 0.05, 13, 22, 0.03, 0); typing(VW('title', 'electricity') - 0.05, 12, 18, 0.03, 0.2);
  { const t = VW('same', 'same') - 0.1; tick(t, 0.3, -0.4, 1800); noiseHit(t, 0.05, 'bandpass', 900, 2, 0.2, -0.4); tick(t + 0.09, 0.3, 0.4, 1800); noiseHit(t + 0.09, 0.05, 'bandpass', 900, 2, 0.2, 0.4);   // two switches
    hum(t + 0.05, S('method'), 0.03); sweep(t, t + 0.6, 0.05, 600, 3000, 0.4); }
  chime(VW('same', 'eight') - 0.1, [1046.5, 1568], 0.05, 0);
  whoosh(VW('same', 'sixty') + 0.6, 0.6, 0.09, 300, 2600, -0.2); whoosh(VW('same', 'eight', 2) + 0.35, 0.4, 0.07, 500, 3000, 0.2);
  pop(VW('question', 'fiftytwo') - 0.1, 0.12, 0, 500); chime(VW('question', 'fiftytwo'), [880, 1174.66], 0.05, 0);
  // heat
  crackle(VW('heat', 'heat') - 0.1, 1.6, 0.08, -0.3, 'heat'); noiseHit(VW('heat', 'heat') - 0.1, 1.2, 'lowpass', 900, 0.7, 0.12, -0.3, 0.3);
  sub(VW('heat', 'method') - 0.15, 0.18); typing(VW('heat', 'method') - 0.15, 22, 30, 0.03);
  // into the filament: white-hot
  whoosh(S('filament') + 0.7, 0.8, 0.14, 200, 4000, -0.3);
  riser(S('filament') + 0.6, VW('filament', 'whitehot') + 0.2, 0.05);
  crackle(VW('filament', 'whitehot'), 2.4, 0.07, -0.2, 'fil');
  { const t = VW('filament', 'thousand') - 0.3; sub(t, 0.22); noiseHit(t, 0.4, 'lowpass', 2400, 0.7, 0.14, 0, 0.5, 300); }
  // the infrared curve
  whoosh(S('infrared') + 0.7, 0.6, 0.1, 3000, 400, 0.2);
  sweep(VW('infrared', 'temperature') - 0.2, VW('infrared', 'temperature') + 1.4, 0.05, 300, 2200, 0);
  pop(VW('infrared', 'gives'), 0.07, -0.3, 900); pop(VW('infrared', 'infrared') - 0.1, 0.08, 0.4, 600);
  { const t = VW('infrared', 'less') - 0.1; sub(t, 0.18); chime(t, [1318.5, 1975.5], 0.06, 0); }
  // into the LED: cool
  whoosh(S('method') + 0.7, 0.8, 0.14, 200, 5000, 0.3);
  chime(S('method') + 0.8, [1760, 2637], 0.05, 0.3);
  // the energy step: every electron drops and lets go of a photon (pitch follows the step's colour)
  whoosh(S('step') + 0.7, 0.6, 0.08, 4000, 600, 0);
  { const tDrop = VW('step', 'drops') - 0.05, drops = [tDrop]; for (let k = 1; k < 30; k++) drops.push(VW('step', 'photon') + 0.4 + k * 0.62);
    const tc = VW('color', 'height') - 0.2;
    drops.filter((t) => t < S('math') + 0.1).forEach((t, i) => {
      const f = t < tc + 0.4 ? 1800 : t < tc + 1.1 ? 1200 : t < tc + 1.9 ? 1700 : t < VL('color').t1 + 0.4 ? 2400 : 1800;
      drop(t, i === 0 ? 0.16 : 0.08, 700, -0.2 + (i % 3) * 0.2); pew(t + 0.28, i === 0 ? 0.16 : 0.09, f, 0.4);
    });
    chime(tc, [523.25], 0.06, -0.3); chime(tc + 0.75, [783.99], 0.06, 0); chime(tc + 1.5, [1174.66], 0.06, 0.3); }
  // the LED's spectrum: no infrared
  sweep(S('math') + 0.3, S('math') + 1.3, 0.05, 400, 1800, 0);
  { const t = VW('math', 'infrared') - 0.1; pop(t, 0.12, 0, 700); chime(t, [1567.98, 2349.32], 0.05, 0); }
  // lumens per watt: counters
  { const t1 = VW('lmw', 'fifteen') - 0.1, t2 = VW('lmw', 'hundred') - 0.4;
    for (let i = 0; i < 6; i++) tick(t1 + i * 0.1, 0.06, -0.3, 2000 + i * 80);
    for (let i = 0; i < 14; i++) tick(t2 + i * 0.05, 0.06, 0.3, 2200 + i * 90);
    whoosh(t2 + 0.7, 0.7, 0.08, 400, 4000, 0.3); pop(t2 + 0.75, 0.1, 0.3, 1200); }
  // of every 100 W
  whoosh(LT('hundred', 0.05) + 0.5, 0.5, 0.07, 400, 2400, -0.2);
  whoosh(VW('hundred', 'thirty') + 0.5, 0.5, 0.08, 400, 3000, 0.2);
  { const t = VW('hundred', 'instead') - 0.1; sub(t, 0.18); chime(t, [1046.5, 1318.5, 1568], 0.07, 0); }
  // losses
  whoosh(S('losses') + 0.6, 0.6, 0.07, 300, 2000, 0.3);
  crackle(VW('losses', 'losses') - 0.1, 0.8, 0.05, 0.4, 'loss'); pop(VW('losses', 'method') - 0.2, 0.07, 0, 500);
  whoosh(S('never') + 0.6, 0.6, 0.07, 2000, 300, 0);
  // THE TURN: the old bulb blooms into a heater (the loudest moment, after a silence)
  sub(HIT, 1.0); noiseHit(HIT, 1.0, 'lowpass', 3200, 0.7, 0.55, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  rumble(HIT + 0.2, VL('heater').t1 - HIT + 0.2, 0.22, 0, 220);
  crackle(HIT + 0.3, VL('heater').t1 - HIT - 0.3, 0.05, -0.2, 'heater');
  pop(VW('heater', 'lamp') - 0.2, 0.08, 0, 500);
  { const t = VW('heater', 'heater') - 0.15; chime(t, [880, 1318.5], 0.05, 0); }
  chime(VW('heater', 'heater') + 0.5, [1760, 2637, 3520], 0.06, 0);   // Bitvolts
