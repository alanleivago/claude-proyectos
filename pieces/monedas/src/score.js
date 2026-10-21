  // SCORE BODY — How many times does a coin turn when it rolls around another one? Music = the user's track (piece.json "music");
  // this body is the sound effects only (sfx bus), loud and present: coins, ticks, stamps and the payoff.
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
  const clink = (t, vel, pan = 0) => { blip(t, 3200, 3100, 0.12, vel * 0.5, pan); blip(t + 0.004, 4700, 4600, 0.09, vel * 0.35, pan); noiseHit(t, 0.02, 'highpass', 6000, 1, vel * 0.5, pan); };   // metal on metal
  const rollRun = (t0, t1, vel, pan = 0) => { for (let x = t0; x < t1; x += 0.07) noiseHit(x, 0.05, 'bandpass', 2600 + 600 * Math.sin(x * 9), 3, vel * (0.6 + 0.4 * Math.sin(x * 13)), pan + 0.3 * Math.sin(x * 2)); };   // the rim purring on the table
  const stamp = (t, vel) => { noiseHit(t, 0.08, 'lowpass', 900, 0.8, vel, 0, 0.3); sub2(t, vel * 1.4); click(t, vel * 0.8, 0); };
  const turnDing = (t, n) => chime(t, n === 1 ? [1046.5, 1568] : [1318.5, 1975.5, 2637], 0.05, 0);
  // ---- title, the two coins, the roll
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0 + 0.1, 30, 30, 0.03, -0.2); typing(VW('title', 'rolls') - 0.1, 30, 30, 0.03, 0.2);
  clink(VW('two', 'two') - 0.1, 0.25, -0.2); clink(VW('two', 'still') - 0.1, 0.18, 0.2);
  rollRun(VW('rolls', 'rolls') - 0.1, VW('rolls', 'started') + 0.3, 0.035, 0); clink(VW('rolls', 'started') + 0.3, 0.2, 0);
  typing(VW('silly', 'how') - 0.1, 14, 30, 0.03, -0.2); typing(VW('silly', 'how') + 0.4, 14, 30, 0.03, 0.2);
  stamp(VW('broke', '1982') - 0.1, 0.12);
  pop(VW('one', 'one') - 0.1, 0.1, 0, 520);
  { const t = VW('edge', 'edge') - 0.2; sweep(t, t + 0.8, 0.05, 400, 2400, 0); chime(VW('edge', 'same') - 0.1, [880, 1318.5], 0.04, 0); }
  pop(VW('whole', 'exactly') - 0.1, 0.08, 0.2, 700);
  // ---- THE PAYOFF: "it's two" — after a silence, the loudest moment; the coin spins round again, fast
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); noiseHit(HIT, 1.0, 'lowpass', 3200, 0.7, 0.8, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  clink(HIT + 0.02, 0.3, 0); rollRun(HIT + 0.1, HIT + 1.5, 0.03, 0); turnDing(HIT + 0.8, 1); turnDing(HIT + 1.5, 2);
  // ---- the slow roll with the arrow
  { const t0 = VW('half', 'halfway') - 0.2, t1 = VW('half', 'pointing') + 0.1; rollRun(t0, t1, 0.03, -0.2); turnDing(t1, 1); }
  { const t0 = VW('full', 'one') - 0.1, t1 = VW('full', 'two') + 0.05; rollRun(t0, t1, 0.03, 0.2); turnDing(t1, 2); }
  // ---- the centre
  { const t = VW('center', 'point') - 0.2; blip(t, 1500, 1500, 0.1, 0.05, 0); click(VW('center', 'matters') - 0.1, 0.15, 0); chime(VW('center', 'center') - 0.2, [1046.5, 1568], 0.05, 0); }
  { const t = VW('radii', 'two') - 0.2; pop(t, 0.1, 0, 600); rollRun(S('radii') + 0.2, VW('circle', 'twice') + 0.2, 0.025, 0); }
  { sweep(VW('circle', 'edge') - 0.2, VW('circle', 'edge') + 0.4, 0.04, 600, 2000, -0.3); sweep(VW('circle', 'twice') - 0.1, VW('circle', 'twice') + 0.7, 0.05, 300, 3000, 0.3); }
  { const t = VW('twice', 'twice') - 0.1; sub2(t, 0.35); pop(t, 0.12, 0, 440); }
  // ---- unrolled and curled back
  { const t = VW('unroll', 'unroll') - 0.1; sweep(t, t + 1.1, 0.06, 2000, 300, 0); }
  { const t0 = VW('unroll', 'roll') - 0.1, t1 = VW('once', 'turn') + 0.2; rollRun(t0, t1, 0.03, -0.3); turnDing(t1, 1); }
  { const t = VW('real', 'circle') - 0.2; sweep(t, t + 1.2, 0.06, 300, 2000, 0); whoosh(VW('real', 'own') + 0.2, VW('real', 'own') + 0.2 - VW('real', 'going'), 0.05, 300, 2500, 0); }
  pop(VW('plus', 'rolling') - 0.1, 0.1, -0.3, 600); pop(VW('plus', 'going') - 0.1, 0.1, 0.3, 700); { const t = VW('plus', 'other') + 0.1; sub2(t, 0.3); turnDing(t, 2); }
  // ---- the Sun and the Earth
  { const t = S('daily') + 0.4; sweep(t, t + 1.2, 0.05, 200, 1200, 0); }
  pop(VW('earth', 'spins') - 0.1, 0.12, -0.2, 520); pop(VW('earth', 'count') - 0.1, 0.12, 0.2, 440); { const t = VW('orbit', 'eats') - 0.1; pop(t, 0.12, 0.4, 900); chime(t + 0.1, [1318.5, 1975.5], 0.04, 0); }
  // ---- the SAT
  stamp(VW('back', '1982') - 0.1, 0.12);
  { const t = S('sat') - 0.1; sweep(t, t + 0.6, 0.05, 3000, 500, 0); }
  rollRun(VW('four', 'right') - 0.1, VW('four', 'four') + 0.6, 0.03, 0);
  { const t = VW('four', 'four') - 0.1; sub2(t, 0.35); pop(t, 0.14, 0, 440); chime(t + 0.05, [880, 1318.5, 1760], 0.04, 0); }
  typing(VW('four', 'rule') - 0.1, 22, 30, 0.03, 0);
  for (let i = 0; i < 5; i++) { pop(VW('choices', 'choices') + i * 0.1, 0.07, -0.6 + i * 0.3, 700 + i * 80); noiseHit(VW('choices', 'four') - 0.2 + i * 0.12, 0.03, 'highpass', 3000, 1, 0.08, -0.6 + i * 0.3); }
  blip(VW('choices', 'there') - 0.1, 500, 250, 0.25, 0.08, 0);
  for (let i = 0; i < 3; i++) pop(VW('students', 'three') - 0.1 + i * 0.12, 0.09, -0.4 + i * 0.4, 800 + i * 120);
  stamp(VW('students', 'thrown') - 0.1, 0.15);
  { const t = VW('students', 'three', 2) - 0.1; for (let i = 0; i < 14; i++) tick(t + 1.4 * (1 - (1 - i / 14) ** 2), 0.05, 0.2, 2600); }
  // ---- in your pocket, try it
  { const t = VW('pocket', 'pocket') - 0.2; clink(t, 0.25, -0.2); clink(t + 0.12, 0.2, 0.2); }
  { const t0 = VW('try', 'roll') - 0.2, t1 = VW('try', 'turns') + 0.3; rollRun(t0, t1, 0.03, 0); turnDing(t1, 2); }
  pop(VW('comments', 'two') - 0.1, 0.1, -0.2, 700); blip(VW('comments', 'one') - 0.1, 900, 500, 0.15, 0.06, 0.2);
  // ---- the end
  typing(S('end') + 0.2, 8, 26, 0.03, 0); typing(VW('end', 'what') - 0.1, 20, 26, 0.03, 0.2);
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.06, 0);   // Bitstory
