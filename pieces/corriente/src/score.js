  // SCORE BODY — Does electric current get used up? Music = the user's track (piece.json "music");
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

  const flowTicks = (t0, t1, rate, vel, pan = 0, f = 2400) => { for (let t = t0; t < t1; t += 1 / rate) tick(t, vel, pan + Math.sin(t * 3) * 0.2, f); };
  // ---- title and the myth
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0, 21, 24, 0.03, -0.2); typing(VW('title', 'get') - 0.05, 12, 18, 0.03, 0.2);
  hum(0.4, SUB('energy'), 0.025);
  flowTicks(0.6, SUB('picture'), 2.2, 0.02, -0.2);
  { const t = VW('picture', 'leaves') - 0.2; sweep(t, t + 1.4, 0.05, 2400, 500, 0.3); }
  { const t = VW('false', 'wrong') - 0.2; sub2(t, 0.5); noiseHit(t, 0.12, 'bandpass', 500, 1.5, 0.22, 0); crack(t + 0.02, 0.25, 0); }
  pop(VW('false', 'before') - 0.2, 0.1, -0.5, 700); pop(VW('false', 'after') - 0.2, 0.1, 0.5, 700);
  { const t = VW('same', 'half', 1) - 0.2; chime(t, [1318.5], 0.05, -0.4); chime(t + 0.12, [1318.5], 0.05, 0.4); for (let i = 0; i < 6; i++) tick(t + i * 0.05, 0.05, 0, 2600 + i * 80); }
  // ---- energy and the voltage step
  whoosh(SUB('energy') + 0.6, 0.6, 0.09, 300, 3000, 0);
  { const t = VW('energy', 'pushed') - 0.2; sweep(t, t + 0.5, 0.06, 800, 3000, -0.4); }
  { const t = VW('energy', 'tired') - 0.2; sweep(t, t + 0.7, 0.05, 1500, 300, 0.4); }
  { const t = VW('voltage', 'voltage') - 0.2; sweep(t, t + 0.8, 0.07, 2000, 250, 0); sub2(t + 0.8, 0.4); }
  flowTicks(SUB('energy') + 0.5, SUB('kirchhoff'), 3, 0.018, 0);
  // ---- Kirchhoff and the split
  whoosh(SUB('kirchhoff') + 0.6, 0.6, 0.09, 4000, 400, 0);
  { const t = VW('kirchhoff', "kirchhoff's") - 0.2; chime(t, [880, 1318.5, 1760], 0.05, 0); }
  { const t = VW('split', 'splits') - 0.2; zap(t, 0.12, 0.3, 2400, 600); sweep(t, t + 0.7, 0.05, 400, 2600, 0.4); sweep(t, t + 0.7, 0.04, 400, 1800, -0.2); }
  pop(VW('split', 'three') - 0.2, 0.08, -0.5, 600);
  { const t = VW('round', 'three') - 0.2; pop(t, 0.1, -0.3, 700); pop(t + 0.4, 0.1, 0.3, 900); chime(t + 0.6, [1046.5, 1568], 0.05, 0); }
  { const t = VW('round', 'roundabout') - 0.2; for (let i = 0; i < 10; i++) blip(t + i * 0.12, 900 + (i % 4) * 150, 1100, 0.06, 0.03, Math.sin(i) * 0.6); }
  // ---- THE PAYOFF: shared (the loudest moment, after the silence)
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); noiseHit(HIT, 0.9, 'lowpass', 3200, 0.7, 0.75, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  rumble(HIT + 0.15, 3.2, 0.22, 0, 300);
  for (let k = 0; k < 8; k++) chime(HIT + 0.4 + k * 0.32, [1046.5 * (1 + (k % 3) * 0.25)], 0.035, (k % 2 ? 0.4 : -0.4));
  chime(VW('end', 'shared') - 0.3, [1318.5, 1975.5], 0.05, 0);
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.06, 0);   // Bitvolts
