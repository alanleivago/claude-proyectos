  // SCORE BODY — Why do appliances break right when the power comes back? Music = the user's track (piece.json "music");
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

  const sub2 = (t, v) => sub(t, v * 0.4);   // every other low hit sits well under the payoff
  const click = (t, vel, pan = 0) => { tick(t, vel, pan, 1600); noiseHit(t, 0.04, 'bandpass', 800, 2, vel * 0.7, pan); };

  const sizzle = (t, dur, vel, pan = 0) => { crackle(t, dur, vel, pan, 'sz' + t); noiseHit(t, Math.min(1.2, dur), 'bandpass', 3500, 0.8, vel * 1.4, pan, 0.2); };
  const buzz = (t0, t1, vel) => hum(t0, t1, vel);

  const thunk = (t, vel, pan = 0) => { noiseHit(t, 0.12, 'lowpass', 500, 1, vel, pan, 0.3); sub2(t, vel * 1.5); };   // a breaker / power cut
  // ---- title, one TV
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0, 23, 26, 0.03, -0.2); typing(VW('title', 'right') - 0.05, 20, 24, 0.03, 0); typing(VW('title', 'comes') - 0.05, 11, 20, 0.03, 0.2);
  hum(0.3, VW('blackout', 'blackout') - 0.1, 0.03);
  { const t = VW('blackout', 'blackout') - 0.1; thunk(t, 0.25, 0); sweep(t, t + 0.6, 0.05, 2000, 200, 0); }
  { const t = VW('instant', 'returns') - 0.1; crack(t, 0.45, 0); hum(t + 0.05, SUB('all'), 0.03); noiseHit(t + 0.1, 0.25, 'bandpass', 2500, 1.5, 0.08, 0.2); }
  // ---- the street: turns, the blackout, all at once, five times the load
  { const tN = VW('turns', 'normally') - 0.1, tOff = VW('turns', 'blackout') - 0.1; for (let t = tN; t < tOff; t += 1 / 1.6) click(t, 0.12, Math.sin(t * 5) * 0.6); thunk(tOff, 0.2, 0); }
  { const t = VW('turns', 'together') - 0.2; for (let i = 0; i < 7; i++) click(t + i * 0.02, 0.14, -0.6 + i * 0.2); crack(t + 0.15, 0.28, 0); hum(t + 0.2, SUB('retry'), 0.05); riser(t, VW('five', 'five') - 0.1, 0.035); }
  { const t = VW('five', 'five') - 0.1; sub2(t, 0.35); chime(t, [880, 1174.66], 0.05, 0); }
  // ---- the recloser: four snaps, seconds apart
  [VW('retry', 'switch') - 0.1, VW('retry', 'four') - 0.4, VW('retry', 'four') + 0.2, VW('retry', 'apart')].forEach((t, i) => { thunk(t, 0.2, -0.3); crack(t + 0.35, 0.2 + i * 0.02, -0.2); });
  // ---- inside the plug
  whoosh(SUB('cap') + 0.6, 0.6, 0.1, 3000, 400, 0);
  pop(VW('cap', 'capacitor', 1) - 0.2, 0.08, 0, 600);
  { const t = VW('cap', 'short') - 0.2; zap(t, 0.25, 0, 3200, 300); sweep(t, t + 0.5, 0.07, 400, 4000, 0); }
  { const t = VW('ntc', 'ntc') - 0.2; pop(t, 0.1, -0.3, 500); chime(t, [1046.5, 1568], 0.05, -0.3); }
  { const t = VW('cold', 'ten') - 0.2; for (let i = 0; i < 3; i++) tick(t + i * 0.08, 0.06, -0.3, 2400); hum(t + 0.3, VL('seconds').t1, 0.025); }
  { const t = VW('hot', 'heats') - 0.1; sizzle(t, 2.2, 0.06, -0.3); riser(t, t + 1.4, 0.03); }
  { const t = VW('hot', 'tenths') - 0.2; for (let i = 0; i < 6; i++) blip(t + i * 0.08, 1400 - i * 150, 1300 - i * 150, 0.06, 0.04, -0.3); }
  pop(VW('must', 'drop') - 0.2, 0.08, 0, 500);
  { const t = VW('cool', 'cooling') - 0.1; sweep(t, t + 1.2, 0.05, 300, 1600, 0); }
  { const t = VW('seconds', 'seconds') - 0.3; tick(t, 0.12, 0.3, 3000); }
  // ---- THE HIT: the power snaps back while the part is still hot (the loudest moment, after the silence)
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); crack(HIT, 0.8, 0); noiseHit(HIT, 0.9, 'lowpass', 3200, 0.7, 0.75, 0, 0.6, 180);
  zap(HIT + 0.05, 0.4, 0.2, 4000, 200); crackle(HIT + 0.1, 2.4, 0.1, 0, 'break');
  rumble(HIT + 0.15, 3.6, 0.32, 0, 260);   // the street's transformers groaning
  for (let k = 0; k < 6; k++) noiseHit(HIT + 0.3 + k * 0.45, 0.5, 'bandpass', 3000 + k * 200, 0.6, 0.1 * (1 - k / 7), (k % 2 ? 0.3 : -0.3), 0.2);   // the broken TV's static
  // ---- the tip and the end
  { const t = VW('tip', 'unplug') - 0.1; noiseHit(t + 0.2, 0.06, 'bandpass', 1800, 2, 0.2, 0); tick(t + 0.2, 0.2, 0, 2600); }
  { const t = VW('tip', 'wait') - 0.1; for (let i = 0; i < 8; i++) tick(t + i * 0.45, 0.04, 0, 1800); }
  { const t = VL('end').t0 + 0.3; click(t + 0.3, 0.3, 0); chime(t + 0.9, [1318.5, 1975.5], 0.05, 0); }
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.06, 0);   // Bitvolts
