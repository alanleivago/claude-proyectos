  // SCORE BODY — Is it dangerous to charge your phone overnight? Music = the user's track (piece.json "music");
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


  const fwoosh = (t, vel, dur = 2.5) => { noiseHit(t, 0.5, 'lowpass', 1800, 0.7, vel, 0, 0.6, 300); rumble(t + 0.1, dur, vel * 0.55, 0, 200); crackle(t + 0.1, dur * 0.8, vel * 0.15, 0, 'fw' + t); };

  const ding = (t, v = 0.05, pan = 0) => chime(t, [1318.5, 1975.5], v, pan);
  // ---- title, night, the myth
  pop(VL('title').t0, 0.08, 0, 420); sub2(VL('title').t0, 0.2);
  { const t = VW('night', 'plug') - 0.1; click(t, 0.35, 0.3); ding(t + 0.2, 0.05, 0.3); hum(t, SUB('think'), 0.02); }
  { const t = VW('think', 'pushing') - 0.2; riser(t, VW('think', 'bursting'), 0.03); crack(VW('think', 'bursting'), 0.22, 0); }
  { const t = VW('lie', 'myth') - 0.2; sub2(t, 0.12); noiseHit(t, 0.12, 'bandpass', 500, 1.5, 0.1, 0); }
  // ---- the phone decides
  whoosh(SUB('boss') + 0.6, 0.6, 0.07, 400, 2400, 0);
  { const t = VW('boss', 'full') - 0.2; click(t, 0.3, 0); blip(t + 0.1, 900, 500, 0.15, 0.06, 0); }
  pop(VW('decide', 'offers') - 0.2, 0.08, -0.4, 600); pop(VW('decide', 'decides') - 0.2, 0.1, 0.4, 900);
  // ---- sip, heat, optimized charging (cards)
  { const t = SUB('sip') + 0.2; whoosh(t + 0.4, 0.4, 0.07, 500, 3000, 0); sweep(t, t + 1.4, 0.04, 300, 1600, 0); for (let i = 0; i < 6; i++) blip(VW('sip', 'sip') - 0.3 + i * 0.5, 1200, 1500, 0.05, 0.03, 0.2); }
  { const t = SUB('heat') + 0.2; whoosh(t + 0.4, 0.4, 0.07, 500, 3000, 0); sizzle(VW('heat', 'warm') - 0.2, 1.4, 0.04, 0); sweep(VW('heat', 'wears') - 0.3, VW('heat', 'wears') + 1.0, 0.05, 1600, 300, 0); }
  { const t = SUB('opt') + 0.2; whoosh(t + 0.4, 0.4, 0.07, 500, 3000, 0); ding(VW('opt', 'alarm') - 0.2, 0.06, 0.3); }
  // ---- news, the cell, the runaway
  whoosh(SUB('news') + 0.6, 0.6, 0.09, 300, 3000, 0); crackle(SUB('news') + 0.5, 1.6, 0.05, 0, 'news');
  pop(VW('news', 'plug') - 0.3, 0.08, 0, 700);
  whoosh(SUB('layers') + 0.6, 0.6, 0.09, 3000, 400, 0);
  { const t = VW('layers', 'sheet') - 0.2; sweep(t, t + 0.6, 0.04, 2000, 5000, 0); }
  { const t = VW('layers', 'pierces') - 0.2; zap(t + 0.4, 0.12, 0.2, 4000, 800); }
  { const t = VW('layers', 'touch') - 0.2; sizzle(t, 1.6, 0.06, 0); riser(t, VW('layers', 'spiral') - 0.35, 0.03); }
  // ---- THE HIT: the cell runs away (the loudest moment, after the silence)
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); crack(HIT, 0.8, 0); noiseHit(HIT, 0.45, 'lowpass', 5000, 0.7, 0.55, 0, 0.5, 400); fwoosh(HIT, 0.7, 6.0); fwoosh(HIT + 0.6, 0.35, 5.0);
  for (let k = 0; k < 10; k++) noiseHit(HIT + 1.0 + k * 0.55, 0.5, 'bandpass', 800 + k * 40, 0.7, 0.25, (k % 2 ? 0.3 : -0.3), 0.3);
  { const t = VW('pierce', 'speck') - 0.2; tick(t, 0.08, 0.2, 4200); pop(VW('pierce', 'pockets') - 0.3, 0.07, 0, 600); }
  // ---- rare, Note 7
  { const t = SUB('rare') + 0.2; for (let i = 0; i < 30; i++) tick(t + i * 0.03, 0.025, Math.sin(i) * 0.6, 2400); pop(VW('rare', 'ten') - 0.3, 0.1, 0.2, 400); chime(VW('rare', 'model') - 0.2, [880], 0.04, 0); }
  { const t = SUB('note7') + 0.1; for (let i = 0; i < 5; i++) pop(t + i * 0.08, 0.07, -0.6 + i * 0.3, 500 + i * 60); sub2(VW('note7', 'two') - 0.2, 0.25); }
  // ---- where you leave it: the pillow
  whoosh(SUB('hand') + 0.6, 0.6, 0.07, 400, 2400, 0);
  { const t = SUB('pillow') + 0.2; sweep(t, t + 0.8, 0.05, 400, 150, 0.3); noiseHit(t + 0.8, 0.3, 'lowpass', 300, 0.7, 0.12, 0); rumble(t + 1.0, 3.5, 0.08, 0, 160); }
  pop(VW('pillow', 'fire') - 0.2, 0.08, 0, 300);
  // ---- chargers
  whoosh(SUB('fake') + 0.6, 0.6, 0.09, 3000, 400, 0);
  { const t = VW('fake', 'barrier') - 0.2; hum(t, t + 2.4, 0.04); chime(t, [1046.5], 0.04, -0.3); }
  { const t = VW('fake', 'fakes') - 0.3; noiseHit(t, 0.12, 'bandpass', 400, 1.5, 0.14, 0.4); }
  { const t = SUB('test') + 0.2; for (let i = 0; i < 30; i++) tick(t + i * 0.03, 0.025, Math.sin(i) * 0.6, 2200); [0, 0.15, 0.3].forEach((d, i) => ding(VW('test', 'three') - 0.2 + d, 0.04, -0.4 + i * 0.4)); }
  { const t = VW('weigh', 'weigh') - 0.2; noiseHit(t + 0.5, 0.15, 'bandpass', 300, 1.5, 0.18, 0); tick(t + 0.5, 0.12, -0.3, 1400); }
  // ---- recap, the end
  [VW('recap', 'myth') - 0.2, VW('recap', 'true', 1) - 0.2, VW('recap', 'true', 2) - 0.2].forEach((t, i) => { pop(t, 0.1, -0.3 + i * 0.3, 700 + i * 120); });
  { const t = VL('end').t1 + 0.2; click(t, 0.2, 0); chime(t + 0.1, [1760, 2637, 3520], 0.035, 0); }
