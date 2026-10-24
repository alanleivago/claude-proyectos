  // SCORE BODY — An ant with two rules builds a highway Music = the user's track (piece.json "music");
  // this body is the sound effects only (sfx bus), loud and present: bits flipping, little feet, the highway.
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


  const fwoosh = (t, vel, dur = 2.5) => { noiseHit(t, 0.5, 'lowpass', 1800, 0.7, vel, 0, 0.6, 300); rumble(t + 0.1, dur, vel * 0.55, 0, 200); crackle(t + 0.1, dur * 0.8, vel * 0.15, 0, 'fw' + t); };

  const ding = (t, v = 0.05, pan = 0) => chime(t, [1318.5, 1975.5], v, pan);
  // ---- the ant's own sounds
  const flipOn = (t, v = 0.1, pan = 0) => { blip(t, 880, 1320, 0.05, v, pan); noiseHit(t, 0.02, 'bandpass', 3000, 3, v * 0.6, pan); };
  const flipOff = (t, v = 0.1, pan = 0) => { blip(t, 660, 440, 0.06, v, pan); noiseHit(t, 0.02, 'bandpass', 1800, 3, v * 0.6, pan); };
  const feet = (t, v = 0.04, pan = 0) => { for (let i = 0; i < 3; i++) noiseHit(t + i * 0.05, 0.012, 'highpass', 6000, 1, v, pan + (i - 1) * 0.15); };
  const swirl = (t, v, right = true) => sweep(t, t + 0.25, v, right ? 600 : 1400, right ? 1400 : 600, right ? 0.3 : -0.3);
  // ---- title, the ant, the board
  pop(VL('title').t0, 0.08, 0, 420); { const t = VW('title', 'builds') - 0.1; swirl(t, 0.04); } ding(VW('title', 'nobody') - 0.1, 0.03);
  feet(S('ant') + 0.2, 0.05); ['see', 'think', 'remember'].forEach((w, i) => pop(VW('ant', w) - 0.1, 0.07, -0.4 + i * 0.4, 500 + i * 120));
  { const t = VW('ant', 'two') - 0.1; pop(t, 0.12, 0, 520); ding(t + 0.1, 0.04); }
  { const t = S('board') + 0.1; whoosh(t + 0.5, 0.5, 0.05, 300, 2000, 0); for (let i = 0; i < 10; i++) tick(t + 0.2 + i * 0.04, 0.05, Math.sin(i) * 0.6, 2000 + i * 100); flipOn(VW('board', 'on') - 0.05, 0.1); flipOff(VW('board', 'off') - 0.05, 0.1); }
  // ---- the steps while they are slow: a flip at k + 0.15, the turn at k + 0.35, the feet at k + 0.7
  { let prev = stepsAt(S('right') - 0.1);
    for (let t = S('right'); t < VL('slow').t1 + 0.3; t += 1 / 96) { const n = stepsAt(t);
      for (const [off, f] of [[0.15, 'flip'], [0.35, 'turn'], [0.7, 'feet']]) if (Math.floor(n - off) > Math.floor(prev - off) && n < 13) { const k = Math.floor(n - off), on = MAIN.ON[k];
        if (f === 'flip') (on ? flipOn : flipOff)(t, 0.12, 0); else if (f === 'turn') swirl(t, 0.04, !!on); else feet(t, 0.05); }
      prev = n; } }
  // the chaos: a rising patter of ticks, denser as the steps fly
  { const t0 = S('tidy') + 0.3, t1 = VL('step').t1 - 0.2; for (let t = t0; t < t1; t += 0.06) { const v = clamp((stepsAt(t + 0.06) - stepsAt(t)) / 20); if (v > 0.02) tick(t, 0.008 + 0.012 * v, Math.sin(t * 7) * 0.6, 2400 + 1600 * v); } riser(S('breaks'), VL('breaks').t1, 0.012); }
  ['thousand', 'five'].forEach((w) => pop(VW('breaks', w) - 0.1, 0.07, 0, 600));
  noiseHit(VW('bet', 'nothing') - 0.1, 0.4, 'lowpass', 600, 0.7, 0.06, 0, 0.3);
  { const t = VW('step', 'seventyseven'); click(t, 0.12, 0); }
  // ---- THE PAYOFF: the highway breaks out (after the silence), the loudest moment
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); noiseHit(HIT, 1.0, 'lowpass', 3200, 0.7, 0.8, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  whoosh(VW('look', 'shoots') + 0.4, 0.5, 0.08, 400, 4000, 0.3); sub2(VW('look', 'highway') - 0.1, 0.3);
  { const t0 = HIT + 0.3, t1 = S('langton'); for (let t = t0; t < t1; t += 104 / ((10900 - 9977) / (VL('look').t1 - HIT)) / 2) { blip(t, 1200, 1250, 0.05, 0.06, 0.3); noiseHit(t, 0.03, 'bandpass', 2600, 2, 0.07, -0.3); } }
  { pop(VW('repeat', 'hundred') - 0.2, 0.1, 0, 600); [1, 2].forEach((i) => pop(VW('repeat', 'again', i) - 0.1, 0.1, i === 1 ? -0.3 : 0.3, 700 + i * 120)); ding(VW('repeat', 'forever') - 0.2, 0.04); }
  // ---- Langton, why, random starts
  { const t = S('langton') + 0.1; whoosh(t + 0.4, 0.4, 0.05, 2000, 500, 0); pop(VW('langton', 'chris') - 0.1, 0.09, 0, 520); pop(VW('langton', 'alive') - 0.3, 0.07, 0, 700); }
  { const t = VW('why', 'nobody') - 0.1; sub2(t, 0.3); noiseHit(t, 0.4, 'lowpass', 500, 0.7, 0.07, 0, 0.3); }
  { const t = VW('any', 'switch') - 0.1; for (let i = 0; i < 12; i++) flipOn(t + i * 0.05, 0.05, Math.sin(i * 2) * 0.6); riser(VW('any', 'happens') - 0.3, S('same') + 0.3, 0.03); }
  { const t = S('same') + 0.2; for (let i = 0; i < 3; i++) pop(t + i * 0.25, 0.08, -0.5 + i * 0.5, 500 + i * 100); ding(VW('same', 'every') - 0.1, 0.04); click(VW('same', 'proven') - 0.2, 0.12, 0); }
  // ---- circuits and the computer
  for (let i = 0; i < 3; i++) { const t = VW('circuit', 'logic') - 0.3 + i * 0.25; pop(t, 0.08, -0.4 + i * 0.4, 600 + i * 150); flipOn(t + 0.5, 0.08, -0.4 + i * 0.4); }
  { const t = S('computer') + 0.1; whoosh(t + 0.4, 0.4, 0.06, 300, 2500, 0); ['two', 'one', 'forty'].forEach((w, i) => pop(VW('computer', w) - 0.1, 0.1, -0.4 + i * 0.4, 520 + i * 90)); click(VW('computer', 'proof') - 0.1, 0.12, 0); }
  // ---- the end
  pop(VW('end', 'coincidence') - 0.1, 0.04, -0.3, 600); pop(VW('end', 'hidden') - 0.1, 0.04, 0.3, 750);
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.035, 0);   // Bitstory
