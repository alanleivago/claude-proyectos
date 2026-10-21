  // SCORE BODY — Why doesn't an induction stove burn your hand? Music = the user's track (piece.json "music");
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
  // ---- title, the cold hand, the hot pan
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0, 24, 26, 0.03, -0.2); typing(VW('title', 'stove') - 0.05, 21, 22, 0.03, 0.2);
  { const t = VW('hand', 'switched') - 0.1; click(t, 0.35, 0); buzz(t + 0.05, SUB('pan'), 0.02); }
  chime(VW('hand', 'cold') - 0.1, [1760, 2637], 0.05, -0.2);
  { const t = VW('pan', 'iron') - 0.1; noiseHit(t + 0.35, 0.12, 'bandpass', 700, 1.5, 0.11, 0); sub2(t + 0.35, 0.25); sizzle(VW('pan', 'seconds'), 2.4, 0.07, 0.1); }
  noiseHit(VW('nothing', 'nothing') - 0.1, 0.4, 'lowpass', 600, 0.7, 0.08, 0, 0.3);
  // ---- the coil, the current, the field
  whoosh(SUB('coil') + 0.6, 0.6, 0.09, 3000, 400, 0); riser(SUB('coil') + 0.2, SUB('coil') + 1.4, 0.03);
  { const t = VW('ac', 'alternating') - 0.1; buzz(t, SUB('skin'), 0.035); for (let x = t; x < SUB('field'); x += 1 / (2 * ACF)) blip(x, 1400, 1300, 0.05, 0.03, Math.sin(x * TAU * ACF) > 0 ? 0.3 : -0.3); }
  sweep(VW('ac', 'hear') - 0.4, VW('ac', 'hear') + 0.8, 0.05, 3000, 12000, 0);
  { const t = VW('field', 'magnetic') - 0.1; sweep(t, t + 0.8, 0.07, 300, 2000, 0); for (let x = t; x < SUB('eddy'); x += 1 / (2 * ACF)) noiseHit(x, 0.18, 'bandpass', 500, 2, 0.04, Math.sin(x * TAU * ACF) > 0 ? 0.4 : -0.4); }
  { const t = VW('glass', 'conduct') - 0.3; pop(t, 0.08, 0, 700); whoosh(VW('glass', 'passes') + 0.4, 0.5, 0.08, 500, 4000, 0); }
  // ---- eddy currents, resistance, heat
  { const t = VW('eddy', 'bottom') - 0.2; noiseHit(t + 0.3, 0.1, 'bandpass', 700, 1.5, 0.18, 0); }
  { const t = VW('eddy', 'circles') - 0.3; for (let i = 0; i < 16; i++) blip(t + i * 0.12, 900 + (i % 4) * 200, 1300, 0.08, 0.04, Math.sin(i) * 0.6); }
  chime(VW('eddy', 'eddy') - 0.1, [1046.5, 1568], 0.05, 0);
  { const t = VW('resist', 'heat') - 0.2; sizzle(t, 3.6, 0.08, 0); sub2(t, 0.4); }
  { const t = VW('is', 'pan', 2) - 0.2; sub2(t, 0.4); chime(t, [880, 1318.5, 1760], 0.06, 0); }
  // ---- the skin of the metal
  whoosh(SUB('skin') + 0.6, 0.6, 0.09, 4000, 400, 0);
  { const t = VW('skin', 'crowds') - 0.2; sweep(t, t + 0.8, 0.06, 2000, 600, 0); }
  { const t = VW('iron', 'iron') - 0.2; pop(t, 0.08, -0.3, 500); sizzle(t + 0.6, 2.6, 0.07, -0.2); }
  { const t = VW('alu', 'aluminum') - 0.2; pop(t, 0.08, 0.3, 900); sweep(t + 0.2, t + 1.4, 0.05, 600, 4000, 0.3); }
  { const t = VW('magnet', 'magnet') - 0.3; noiseHit(t + 0.15, 0.06, 'bandpass', 2500, 2, 0.3, -0.2); tick(t + 0.15, 0.3, -0.2, 3200); sweep(t + 0.7, t + 1.4, 0.05, 1500, 300, 0.4); }
  // ---- Litz
  whoosh(SUB('litz') + 0.6, 0.6, 0.08, 300, 2500, 0);
  { const t = VW('litz', 'solid') - 0.2; sizzle(t, 1.6, 0.05, 0); }
  { const t = VW('litz', 'hundreds') - 0.2; for (let i = 0; i < 29; i++) blip(t + i * 0.035, 2000 + (i % 6) * 250, 1800, 0.03, 0.03, -0.6 + (i % 7) * 0.2); chime(t + 1.1, [1568, 2093], 0.04, 0); }
  { const t = VW('enemy', 'effect') - 0.1; sub2(t + 0.5, 0.3); }
  // ---- the hand
  whoosh(SUB('hand2') + 0.6, 0.6, 0.08, 400, 3000, 0); sizzle(SUB('hand2') + 0.8, 3.0, 0.05, -0.4);
  { const t = VW('hand2', 'ten') - 0.2; for (let i = 0; i < 8; i++) tick(t + i * 0.06, 0.06, 0.3, 2200 + i * 100); }
  { const t = VW('zero', 'zero') - 0.2; sub2(t, 0.4); pop(t, 0.14, 0.4, 300); }
  // ---- detect, contact, knife
  { const t = VW('detect', 'detects') - 0.2; for (let i = 0; i < 3; i++) blip(t + i * 0.25, 1200, 1200, 0.08, 0.05, 0); }
  { const t = VW('contact', 'later'); sizzle(t, 2.5, 0.04, 0); pop(VW('contact', 'leftover') - 0.2, 0.1, -0.5, 900); }
  { const t = VW('knife', 'knife') - 0.2; noiseHit(t + 0.2, 0.08, 'highpass', 4000, 1, 0.15, 0.5); tick(t + 0.2, 0.2, 0.5, 4500); sizzle(VW('knife', 'heats'), 1.6, 0.05, 0.5); }
  chime(VW('knife', 'materials') - 0.2, [1318.5, 1975.5], 0.05, 0);
  // ---- THE PAYOFF: the heat born inside the pan (the loudest moment, after a silence)
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); noiseHit(HIT, 1.0, 'lowpass', 3200, 0.7, 0.8, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  sizzle(HIT + 0.2, VL('end').t1 - HIT, 0.06, 0);
  chime(VW('end', 'born') - 0.3, [1046.5, 1568], 0.05, 0);
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.06, 0);   // Bitvolts
