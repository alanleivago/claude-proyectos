  // SCORE BODY — The most important invention you can't see Music = the user's track (piece.json "music");
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
  // ---- title, the devices, the same part
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0, 18, 24, 0.03, -0.2); typing(VW('title', 'invention') - 0.05, 9, 18, 0.03, 0); typing(VW('title', 'you') - 0.05, 14, 20, 0.03, 0.2);
  [VW('look', 'phone'), VW('look', 'screen'), VW('look', 'car'), VW('look', 'internet')].forEach((t, i) => { pop(t - 0.1, 0.11, [-0.5, 0.5, -0.5, 0.5][i], 600 + i * 120); crackle(t, 0.3, 0.04, [-0.5, 0.5, -0.5, 0.5][i], 'dv' + i); });
  { const tg = VW('same', 'same') - 0.1; sweep(tg, tg + 2.0, 0.07, 3000, 300, 0); riser(tg + 0.3, tg + 2.2, 0.03); sub2(tg + 2.2, 0.2); chime(tg + 2.2, [1760], 0.05, 0); }
  // ---- it isn't software: a buzzer-cross; a switch; it shrinks out of sight
  noiseHit(VW('switch', 'software') + 0.2, 0.18, 'bandpass', 300, 2, 0.12, 0);
  click(VW('switch', 'switch') - 0.1, 0.35, 0); chime(VW('switch', 'sand'), [880, 1318.5], 0.04, 0);
  sweep(VW('switch', 'small') - 0.2, VW('switch', 'small') + 0.9, 0.06, 2000, 7000, 0);
  // ---- the transistor
  pop(SUB('parts') + 0.1, 0.12, 0, 400); whoosh(SUB('parts') + 0.5, 0.5, 0.08, 300, 2400, 0);
  pop(VW('parts', 'input') - 0.1, 0.08, -0.5, 700); pop(VW('parts', 'output') - 0.1, 0.08, 0.5, 800); pop(VW('parts', 'gate') - 0.1, 0.09, 0, 1000);
  noiseHit(VW('gate', 'no') + 0.4, 0.15, 'lowpass', 400, 1, 0.1, -0.3);   // a dull stop
  { const t = VW('gate', 'voltage', 2) - 0.05; click(t, 0.4, 0); hum(t + 0.05, VL('gate').t1 + 0.6, 0.035); sweep(t, t + 0.6, 0.06, 500, 3500, 0.3); }
  { const t0 = VW('fast', 'flip') - 0.1, t1 = VW('decide', 'chain') - 0.1; for (let t = t0; t < t1; t += 1 / 18) tick(t, 0.05, Math.sin(t * 9) * 0.5, 2600); }
  { const t = VW('decide', 'chain') - 0.1; whoosh(t + 0.6, 0.6, 0.09, 300, 3000, 0); for (let i = 0; i < 6; i++) pop(t + 0.3 + i * 0.15, 0.07, -0.6 + i * 0.24, 500 + i * 90); }
  chime(VW('decide', 'computer') - 0.2, [1046.5, 1318.5, 1568], 0.06, 0);
  // ---- 1947
  whoosh(SUB('first') + 0.5, 0.6, 0.09, 4000, 400, 0); sub2(VW('first', 'december') - 0.1, 0.2);
  typing(VW('first', 'december') - 0.1, 17, 26, 0.035);
  pop(SUB('first') + 0.5, 0.08, 0, 350);
  pop(VW('parts47', 'germanium') - 0.1, 0.08, -0.3, 450); { const t = VW('parts47', 'gold') - 0.1; chime(t, [2093, 2637], 0.04, 0.2); } { const t = VW('parts47', 'wedge') - 0.2; whoosh(t + 0.5, 0.5, 0.07, 3000, 600, 0); noiseHit(t + 0.5, 0.06, 'bandpass', 1200, 2, 0.12, 0); }
  { const t = VW('gap', 'gap') - 0.3; riser(t, t + 1.4, 0.04); sweep(t, t + 1.4, 0.06, 300, 5000, 0); sub2(t + 1.4, 0.2); }
  // ---- Moore: every doubling a tick, faster and higher as it shrinks
  sub2(VW('moore', 'sixtyfive') - 0.4, 0.2); chime(VW('moore', 'sixtyfive') - 0.4, [880, 1318.5], 0.05, 0);
  { const tD = VW('moore', 'doubling') - 0.1, tE = VW('shrink', 'every'), tL = VW('shrink', 'light') - 0.2;
    const lev = (t) => (t < tD ? 0 : t < tE ? 1 + 2 * clamp((t - tD) / (tE - tD)) : 3 + 5 * clamp((t - tE) / (tL - tE)));
    for (let L = 1; L <= 8; L++) { let t = tD; while (t < tL + 0.1 && lev(t) < L) t += 0.02; pop(t, 0.08, (L % 2 ? -0.3 : 0.3), 400 * Math.pow(1.25, L)); } }
  [VW('shrink', 'millimeters'), VW('shrink', 'microns', 1), VW('shrink', 'nanometers')].forEach((t, i) => whoosh(t + 0.3, 0.4, 0.06, 500 + i * 600, 3000 + i * 1500, 0));
  { const t = VW('shrink', 'light') - 0.2; sweep(t, t + 1.4, 0.05, 6000, 800, 0); chime(t + 0.3, [1318.5], 0.04, 0); }
  // ---- the chip
  whoosh(SUB('chip') + 0.5, 0.5, 0.08, 300, 2500, 0); pop(SUB('chip') + 0.2, 0.1, 0, 500);
  { const t = VW('chip', 'twentyeight') - 0.2; for (let i = 0; i < 24; i++) tick(t + i * 0.05, 0.05, 0, 2000 + i * 70); sub2(t + 1.25, 0.18); chime(t + 1.25, [1568, 2093], 0.05, 0); }
  { const t = VW('mm', 'over') - 0.1; whoosh(t + 0.4, 0.4, 0.07, 400, 3000, 0.4); crackle(t + 0.3, 1.2, 0.04, 0.4, 'mm'); }
  // ---- 3 nm, a name
  { const t = VW('name', 'three', 1) - 0.1; sub2(t, 0.2); pop(t, 0.1, 0, 500); }
  { const t = VW('name', 'nothing') - 0.1; sweep(t, t + 0.5, 0.08, 4000, 800, 0); noiseHit(t + 0.5, 0.12, 'bandpass', 600, 1.5, 0.12, 0); }
  pop(VW('name', 'brand') - 0.1, 0.08, 0, 900);
  { const t = VW('name', 'gates') - 0.2; pop(t, 0.08, -0.4, 700); pop(t + 0.12, 0.08, 0.4, 700); chime(t + 0.5, [1174.66], 0.04, 0); }
  // ---- the floor
  whoosh(SUB('floor') + 0.5, 0.5, 0.08, 300, 2000, 0);
  { const t = VW('floor', 'atoms') - 0.5; for (let i = 0; i < 26; i++) blip(t + i * 0.03, 2600 + (i % 4) * 300, 2400, 0.03, 0.03, -0.6 + i * 0.05); }
  { const t = VW('floor', 'floor') - 0.2; sub2(t, 0.3); noiseHit(t, 0.3, 'lowpass', 600, 0.7, 0.18, 0, 0.4); }
  { const t = VW('floor', 'leaks') - 0.3; for (let i = 0; i < 8; i++) { blip(t + i * 0.22, 1400, 500, 0.12, 0.05, -0.4 + i * 0.1); noiseHit(t + i * 0.22 + 0.06, 0.05, 'highpass', 4000, 1, 0.05, 0.3); } }
  // ---- 13 sextillion: digits rushing in, a swell
  { const t = VW('count', 'thirteen') - 0.3; for (let i = 0; i < 22; i++) tick(t + i * 1.4 / 22, 0.06, -0.5 + (i % 5) * 0.25, 2200 + i * 60); riser(t, t + 1.5, 0.025); sub2(t + 1.5, 0.1); }
  chime(VW('count', 'manufactured') - 0.3, [1046.5, 1568, 2093], 0.035, 0);
  // never: one soft note, then nothing
  blip(VW('never', 'never') - 0.2, 880, 870, 0.6, 0.04, 0);
  // ---- THE PAYOFF: everything built on top (the loudest moment, after the silence)
  sub(HIT, 1.0); sub(HIT + 0.03, 0.7); noiseHit(HIT, 1.0, 'lowpass', 3200, 0.7, 0.8, 0, 0.6, 180);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['Fs4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  pop(HIT + 0.35, 0.1, 0, 600); [0.7, 0.82, 0.94, 1.06].forEach((d, i) => pop(HIT + d, 0.09, -0.6 + i * 0.4, 700 + i * 150));
  chime(VW('end', 'built') - 0.1, [1318.5, 1975.5], 0.05, 0);
  chime(VL('end').t1 + 0.2, [1760, 2637, 3520], 0.06, 0);   // Bitvolts
