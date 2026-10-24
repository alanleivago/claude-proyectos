  // SCORE BODY — Why is there a no-phones sign at every gas station? Music = the user's track (piece.json "music");
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
  // ---- title, the sign, the cases, the lab
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0, 29, 28, 0.03, -0.2); typing(VW('title', 'every') - 0.05, 21, 22, 0.03, 0.2);
  { const t = VW('title', 'sign'); sweep(t, t + 0.5, 0.06, 600, 3000, 0); noiseHit(t + 0.5, 0.08, 'bandpass', 1500, 2, 0.15, 0); }
  { const t = VW('sign', 'suspect') - 0.2; sub2(t, 0.35); chime(t, [659.25, 622.25], 0.05, 0); }
  { const t = VW('suspect', 'seat') - 0.2; whoosh(SUB('suspect') + 0.5, 0.5, 0.08, 400, 2400, 0); crackle(t, 0.6, 0.06, -0.3, 'seat'); }
  { const t = VW('cases', 'two') - 0.3; for (let i = 0; i < 28; i++) tick(t + i * 0.04, 0.035, -0.6 + (i % 7) * 0.2, 2200 + (i % 5) * 200); }
  { const t = VW('cases', 'phone') - 0.2; pop(t, 0.04, 0.3, 500); chime(t + 0.2, [1046.5], 0.02, 0.3); }
  { const t = VW('lab', 'phone') - 0.2; sweep(SUB('lab') + 0.2, SUB('lab') + 1.4, 0.04, 300, 900, 0); noiseHit(t + 0.6, 0.2, 'lowpass', 400, 1, 0.06, 0); }
  // ---- the car: back in, rubbing, stepping out charged
  whoosh(SUB('pattern') + 0.6, 0.6, 0.08, 400, 2600, 0);
  { const t = VW('pattern', 'back') - 0.2; noiseHit(t + 0.8, 0.12, 'bandpass', 600, 1.5, 0.2, -0.3); for (let i = 0; i < 12; i++) noiseHit(VW('pattern', 'back') + i * 0.35, 0.3, 'bandpass', 900, 1, 0.025, 0.5); }
  { const t = VW('charge', 'clothes') - 0.2, t2 = VW('charge', 'step') - 0.2; for (let x = t; x < t2; x += 0.09) noiseHit(x, 0.08, 'highpass', 3000, 0.8, 0.05, -0.2); crackle(t, t2 - t, 0.05, -0.2, 'rub'); noiseHit(t2 + 0.3, 0.12, 'bandpass', 600, 1.5, 0.2, -0.3); }
  { const t = VW('charge', 'thousand') - 0.4; riser(t - 0.8, t, 0.012); hum(t, SUB('tank'), 0.03); }
  // ---- the tank and the ring
  whoosh(SUB('tank') + 0.6, 0.6, 0.1, 3000, 300, 0);
  noiseHit(VW('tank', 'inside') - 0.1, 0.6, 'lowpass', 600, 0.7, 0.08, 0, 0.4);
  { const t = VW('ring', 'ring') - 0.2; chime(t, [880, 1318.5], 0.06, 0); sweep(t, t + 1.0, 0.04, 800, 3000, 0); }
  { const t = VW('arc', 'reach') - 0.2; sweep(t, t + 1.6, 0.04, 300, 1500, 0.4); crackle(VW('arc', 'breaks') - 0.2, Math.max(0.2, VW('arc', 'spark') - 0.6 - VW('arc', 'breaks')), 0.08, 0.2, 'pre'); zap(VW('arc', 'breaks') - 0.2, 0.25, 0.2, 4000, 400); }
  // ---- THE HIT: the ring ignites (the loudest moment, after the silence)
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); crack(HIT, 0.8, 0); noiseHit(HIT, 0.45, 'lowpass', 5000, 0.7, 0.55, 0, 0.5, 400); fwoosh(HIT, 0.75, 8.0); fwoosh(HIT + 0.6, 0.4, 7.0);
  for (let k = 0; k < 12; k++) noiseHit(HIT + 1.0 + k * 0.6, 0.6, 'bandpass', 700 + k * 40, 0.7, 0.3, (k % 2 ? 0.3 : -0.3), 0.3);   // the flame breathing
  // ---- energy blocks
  { const t1 = VW('energy', 'quarter') - 0.2, t2 = VW('energy', 'four') - 0.3, t3 = VW('energy', 'twenty') - 0.3; pop(t1, 0.12, 0, 900); for (let i = 0; i < 4; i++) pop(t2 + i * 0.04, 0.08, -0.3 + i * 0.2, 700); for (let i = 0; i < 20; i++) pop(t3 + i * 0.04, 0.06, -0.6 + (i % 10) * 0.13, 500 + (i % 5) * 80); }
  // ---- before: the cap
  whoosh(SUB('before') + 0.6, 0.6, 0.08, 400, 2400, 0);
  { const t = VW('before', 'cap') - 0.1; zap(t, 0.18, 0.3, 4200, 500); fwoosh(t + 0.25, 0.14, 1.5); }
  // ---- advice, touch
  { const t = VW('advice', 'while') - 0.2; noiseHit(t, 0.15, 'bandpass', 400, 1.5, 0.15, 0); sub2(t, 0.3); chime(VW('advice', 'stretch') - 0.2, [1318.5], 0.04, 0); }
  { const t = VW('touch', 'door') - 0.1; zap(t, 0.16, -0.4, 3500, 600); chime(t + 0.3, [1567.98, 2349.32], 0.05, -0.3); sweep(t + 0.2, t + 1.0, 0.04, 2000, 300, 0); }
  // ---- fire, the nozzle, the cans, rare
  { const t = SUB('fire') + 0.3; fwoosh(t, 0.18, 3.0); noiseHit(VW('fire', "don't") - 0.2, 0.15, 'bandpass', 400, 1.5, 0.2, 0); click(VW('fire', 'cut') - 0.1, 0.3, 0.4); }
  { const t = VW('nozzle', 'pull') - 0.2; sweep(t, t + 0.8, 0.08, 400, 2500, 0.4); fwoosh(t + 0.4, 0.16, 2.0); }
  { const t1 = VW('cans', 'ground') - 0.2, t2 = VW('cans', 'bed') - 0.2; chime(t1, [1318.5], 0.05, -0.4); noiseHit(t2, 0.15, 'bandpass', 400, 1.5, 0.15, 0.4); crackle(VW('cans', 'plastic') - 0.2, 1.4, 0.05, 0.4, 'can'); }
  { const t = VW('rare', 'billions') - 0.4; for (let i = 0; i < 30; i++) tick(t + i * 0.03, 0.025, Math.sin(i) * 0.6, 2600); chime(VW('rare', 'two') - 0.3, [1046.5, 1568], 0.05, 0); }
  // ---- the end
  { const t = VW('end', 'suspect') - 0.2; sub2(t, 0.06); chime(t, [880, 1318.5, 1760], 0.03, 0); }
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.035, 0);   // Bitvolts
