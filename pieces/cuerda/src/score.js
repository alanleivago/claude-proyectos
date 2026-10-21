  // SCORE BODY — How much does one extra meter lift a rope around the Earth? Music = the user's track (piece.json "music");
  // this body is the sound effects only (sfx bus), loud and present: ropes, ticks, pops and the payoff.
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
  // ---- title, the rope, 40,000 km
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0 + 0.1, 28, 30, 0.03, -0.2); typing(VW('title', 'lift') - 0.1, 28, 30, 0.03, 0.2);
  { const t0 = VW('wrap', 'wrap'), t1 = VW('wrap', 'equator') + 0.4; sweep(t0, t1, 0.05, 300, 2400, 0); for (let x = t0; x < t1; x += 0.12) tick(x, 0.04, Math.sin(x * 3) * 0.6, 3000); chime(t1, [1046.5, 1568], 0.05, 0); }
  { const t0 = VW('wrap', 'wrap'), t1 = VW('km', 'forty') + 0.4; for (let i = 0; i < 16; i++) blip(t0 + (t1 - t0) * (1 - (1 - i / 16) ** 2), 1800 + i * 60, 1800 + i * 60, 0.03, 0.03, 0.2); pop(VW('km', 'kilometers') - 0.1, 0.1, 0, 700); }
  // ---- +1 m, pulled tight
  { const t = VW('add', 'one') - 0.1; whoosh(t + 0.5, 0.5, 0.08, 300, 2500, -0.2); pop(VW('add', 'just') + 0.2, 0.14, 0, 520); }
  stretch(VW('add', 'tight') - 0.1, 0.6, 0.06, 0);
  // ---- the question, the guesses, the magnifying glass
  chime(VW('ask', 'high') - 0.2, [880, 1318.5], 0.04, 0);
  for (let i = 0; i < 3; i++) pop(VW('ask', 'same') + 0.1 + i * 0.35, 0.08, -0.4 + i * 0.4, 800 + i * 150);
  noiseHit(VW('nothing', 'nothing') - 0.1, 0.4, 'lowpass', 600, 0.7, 0.08, 0, 0.3);
  { const t = VW('nothing', 'magnifying') - 0.3; whoosh(t + 0.3, 0.3, 0.06, 2000, 600, 0.4); }
  // ---- THE PAYOFF: the rope jumps out, 16 cm all round (the loudest moment, after a silence)
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); noiseHit(HIT, 1.0, 'lowpass', 3200, 0.7, 0.8, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  for (let i = 0; i < 3; i++) strike(HIT + i * 0.08, 0.12, -0.4 + i * 0.4);
  chime(VW('reveal', 'sixteen') - 0.1, [1046.5, 1568, 2093], 0.06, 0);
  { const t = VW('reveal', 'everywhere') - 0.1; for (let i = 0; i < 12; i++) blip(t + i * 0.06, 1400 + i * 80, 1600 + i * 80, 0.05, 0.03, Math.sin(i) * 0.7); }
  // ---- the dive to the surface, the phone
  { const t = VW('reveal', 'once') + 0.15; whoosh(t + 0.75, 0.75, 0.05, 4000, 300, 0); }
  { const t = VW('phone', 'phone') - 0.15; pop(t, 0.08, 0.3, 500); click(t + 0.05, 0.1, 0.3); }
  // ---- the math
  { const t = VW('line', 'math') - 0.1; stretch(t, 0.5, 0.05, 0); }
  { const t = VW('circ', 'length') - 0.2; whoosh(t + 0.9, 0.9, 0.07, 500, 3000, 0); typing(VW('circ', 'length') - 0.1, 10, 30, 0.025, -0.2); }
  click(VW('circ', 'radius') - 0.2, 0.15, 0.2);
  typing(VW('grow', 'longer') - 0.1, 12, 30, 0.025, 0.2); stretch(VW('grow', 'longer') - 0.1, 0.7, 0.035, 0);
  { const t = VW('grow', 'divided') - 0.1; typing(t, 12, 30, 0.025, -0.2); chime(t + 0.4, [1318.5, 1975.5], 0.03, 0); }
  { const t = VW('twopi', 'two') - 0.15; for (let k = 0; k < 7; k++) blip(t + k * 0.2, 660 * 2 ** (k / 12 * 2), 660 * 2 ** (k / 12 * 2), 0.07, 0.045, -0.6 + k * 0.2); }
  typing(VW('div', 'one') - 0.1, 20, 30, 0.025, 0.2);
  { const t = VW('div', 'sixteen') - 0.1; sub2(t, 0.25); pop(t, 0.08, 0, 440); chime(t + 0.05, [880, 1318.5, 1760], 0.035, 0); }
  // ---- what's missing: the scan, the Earth bounces off
  { const t = VW('missing', 'missing') - 0.2; sweep(t, t + 1.2, 0.05, 800, 5000, 0); }
  { const t = VW('size', 'earth') - 0.25; pop(t, 0.1, 0, 600); noiseHit(t + 0.45, 0.06, 'bandpass', 500, 2, 0.2, 0); sub2(t + 0.45, 0.3); }
  { const t = VW('size', "isn't") - 0.15; strike(t, 0.18, 0); blip(t, 400, 200, 0.2, 0.08, 0); }
  // ---- shrink: tennis ball, marble
  { const t = VW('shrink', 'tennis') - 0.25; whoosh(t, 0.4, 0.08, 2500, 600, -0.2); pop(t + 0.05, 0.14, -0.2, 700); }
  { const t = VW('shrink', 'marble') - 0.25; whoosh(t, 0.4, 0.08, 3000, 900, 0.2); ice(t + 0.05, 0.25, 0.2); }
  chime(VW('same', 'same') - 0.1, [1046.5, 1568], 0.05, 0); for (let i = 0; i < 3; i++) blip(VW('same', 'same') + 0.5 + i * 0.9, 1200, 1500, 0.08, 0.04, 0);
  // ---- no percentage, the rule
  typing(VW('pct', 'percentages') - 0.6, 18, 30, 0.035, -0.2);
  { const t = VW('pct', 'no') - 0.15; strike(t, 0.2, 0); sub2(t, 0.3); }
  { const t = VW('gap', 'only') - 0.1; strike(t, 0.15, 0.2); chime(VW('gap', 'add') - 0.2, [1318.5, 1975.5], 0.05, 0); }
  { pop(VW('rule', 'one') - 0.1, 0.12, -0.2, 600); whoosh(VW('rule', 'always'), 0.3, 0.06, 600, 2400, 0); const t = VW('rule', 'sixteen') - 0.1; sub2(t, 0.4); pop(t, 0.14, 0.2, 440); }
  // ---- three bodies, the wrist test
  pop(VW('three', 'sun') - 0.2, 0.13, -0.5, 330); pop(VW('three', 'earth') - 0.2, 0.12, 0.1, 520); pop(VW('three', 'wrist') - 0.2, 0.12, 0.5, 880);
  chime(VW('three', 'wrist') + 0.3, [1318.5, 1760], 0.04, 0);
  pop(S('wrist') - 0.1, 0.1, 0, 500);
  { const t = VW('wrist', 'add') - 0.1; whoosh(t + 0.3, 0.3, 0.06, 400, 2500, 0); pop(t + 0.3, 0.1, 0, 700); }
  { const t = VW('wrist', 'tight') - 0.25; stretch(t, 0.5, 0.08, 0); sub2(t + 0.5, 0.35); }
  { const t = VW('skin', 'planet') - 0.25; pop(t, 0.1, 0, 520); chime(t + 0.1, [1046.5, 1568], 0.04, 0); }
  // ---- the end
  typing(S('end') + 0.2, 22, 26, 0.03, 0); typing(VW('end', 'tell') - 0.1, 22, 26, 0.03, 0.2);
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.06, 0);   // Bitstory
