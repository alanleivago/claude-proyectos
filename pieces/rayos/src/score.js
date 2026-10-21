  // SCORE BODY — Why does lightning seek the ground? Music = the user's track (piece.json "music");
  // this body is the sound effects only (sfx bus), loud and present: electricity, ice, thunder.
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

  // ---- 1 title, open, up
  pop(VL('title').t0, 0.08, 0, 420);
  typing(VL('title').t0 - 0.05, 18, 24, 0.035, -0.2); typing(VW('title', 'seek') - 0.05, 16, 22, 0.035, 0.2);
  for (const t of [VW('open', 'most'), VW('open', 'touch') - 0.1]) { crackle(t, 0.25, 0.12, -0.3, 'ic'); rumble(t + 0.15, 2.4, 0.16, 0.3); }
  crack(VW('up', 'flash'), 0.5, 0.2); rumble(VW('up', 'flash') + 0.3, 2.2, 0.22, 0.1);
  whoosh(VW('up', 'going') + 0.7, 0.7, 0.12, 400, 5000, 0.4);

  // ---- 2 charge: the updraft, ice on graupel, the layers
  sweep(S('charge'), VW('layers', 'splits'), 0.03, 200, 900, 0);
  { const a = VW('charge', 'slam'), b = VL('charge').t1 - 0.2; for (let i = 0; i < 8; i++) ice(lerp(a, b, (i * 5 % 8) / 7), 0.22, -0.5 + i * 0.13); }
  whoosh(VW('layers', 'light') + 1.0, 1.0, 0.08, 500, 4000, -0.2);
  sweep(VW('layers', 'heavy'), VW('layers', 'heavy') + 1.0, 0.08, 1800, 220, 0.2);
  sub(VW('layers', 'splits') + 0.5, 0.14); pop(VW('layers', 'splits') + 0.5, 0.08, 0, 600);
  // the ground's shadow: pops for every +
  for (let i = 0; i < 11; i++) pop(VW('shadow', 'positive') + i * 0.07, 0.06, -0.6 + i * 0.12, 700 + i * 40);
  { const tp = VW('shadow', 'pushes'); for (let i = 0; i < 6; i++) tick(tp + i * 0.09, 0.05, i % 2 ? 0.5 : -0.5, 4200); }
  // volts: a buzz under the tension; the bars; the question
  hum(VW('volts', 'hundred') - 0.2, S('leader') + 0.2, 0.035);
  typing(VW('volts', 'hundred') - 0.1, 13, 30, 0.04);
  whoosh(VW('volts', 'breaking') + 0.8, 0.8, 0.07, 300, 2500, -0.2);
  whoosh(VW('volts', 'measured') + 0.5, 0.9, 0.05, 300, 1100, 0.2);
  chime(VW('volts', 'question') - 0.2, [880, 1318.5], 0.05, 0);

  // ---- 3 the leader steps down, crackling; streamers sizzle
  { const t0 = VW('leader', 'channel') - 0.2, t1 = VL('leader').t1 - 0.2; for (let i = 0; i < 12; i++) zap(t0 + (i / 12) * (t1 - t0), 0.16 + i * 0.006, 0.4 - i * 0.05, 3000 - i * 80, 500); }
  for (const t of [VW('streamers', 'up') + 0.4, VW('connect', 'touches') - 0.6]) zap(t, 0.18, 0.3);
  { const ts = VW('streamers', 'sparks') - 0.15, t2 = VW('connect', 'touches'); crackle(ts, t2 - ts, 0.07, 0.2, 'stream'); riser(VW('streamers', 'spikes'), t2, 0.035); }
  // connect: one bright tick, then nothing until the hit
  tick(VW('connect', 'touches'), 0.25, 0.4, 5000); blip(VW('connect', 'touches'), 1760, 1700, 0.25, 0.05, 0.4);

  // ---- 4 THE HIT (the loudest moment) and the strike
  crack(HIT, 1.0, 0.15); crack(HIT + 0.03, 0.6, -0.2); sub(HIT + 0.02, 0.6);
  noiseHit(HIT, 0.8, 'lowpass', 3000, 0.7, 0.6, 0, 0.6, 200);
  rumble(HIT + 0.25, 5.5, 0.42, 0.1, 140);
  whoosh(HIT + 0.45, 0.45, 0.16, 300, 6000, 0.2);
  typing(VW('return', 'third') - 0.1, 3, 12, 0.05, 0.5);
  for (const [w, n] of [[1, 8], [2, 9], [0, 13]]) { const t = w === 0 ? VW('numbers', 'five') - 0.1 : VW('numbers', 'thirty', w) - 0.1; typing(t, n, 26, 0.04, -0.4); }
  pop(VW('numbers', 'five') + 0.6, 0.1, -0.4, 500);
  // flicker: the dart leaders and the re-strikes
  for (const t of [VW('flicker', 'new', 1), VW('flicker', 'new', 2), VW('flicker', 'three'), VW('flicker', 'four')]) { zap(t, 0.15, 0.1, 4000, 800); crack(t + 0.16, 0.36, 0.1); }
  rumble(VW('flicker', 'four') + 0.3, 3.0, 0.22, 0.2);
  // thunder: the blast, a long roll
  noiseHit(VW('thunder', 'plasma'), 0.4, 'lowpass', 1800, 0.7, 0.22, 0, 0.6, 120);
  sub(VW('thunder', 'blasts'), 0.2);
  rumble(VW('thunder', 'blasts') + 0.1, 5.0, 0.38, -0.1, 110);
  pop(VW('thunder', 'three') - 0.2, 0.08, -0.5, 500);

  // ---- 5 the kinds
  for (const [t, p] of [[VW('types', 'inside') - 0.1, -0.4], [VW('types', 'cloud', 2) - 0.1, 0.4], [VW('types', 'fades') - 0.1, -0.4]]) { zap(t, 0.2, p); rumble(t + 0.2, 1.4, 0.08, p); }
  crack(VW('types', 'ground') - 0.1, 0.45, 0.4);
  for (let j = 0; j < 8; j++) pop(VW('types', 'inside') + 0.5 + j * 0.07, 0.06, -0.4 + j * 0.1, j === 7 ? 1200 : 800);
  crack(VW('positive', 'nine') - 0.1, 0.5, -0.4); rumble(VW('positive', 'nine') + 0.2, 2.0, 0.18, -0.4);
  { const t = VW('positive', 'anvil') - 0.2; sweep(t, t + 0.9, 0.08, 500, 4000, 0.5); crack(t + 0.9, 0.45, 0.6); rumble(t + 1.1, 3.0, 0.25, 0.5); }
  whoosh(VW('positive', 'ten', 2) + 0.6, 0.7, 0.05, 400, 2000, 0);
  chime(VW('positive', 'clear') - 0.1, [1318.5, 1975.5], 0.035, 0.6);
  crackle(VW('positive', 'wildfires') - 0.2, 1.6, 0.09, 0.6, 'fire'); noiseHit(VW('positive', 'wildfires'), 1.2, 'lowpass', 900, 0.7, 0.08, 0.6, 0.2);
  { const t0 = VW('upward', 'start') - 0.2, tc = VW('upward', 'climb') - 0.1; riser(t0, tc + 0.3, 0.05); crackle(t0, tc + 0.3 - t0, 0.08, 0, 'upw'); crack(tc + 0.3, 0.4, 0); rumble(tc + 0.5, 2.0, 0.2, 0); }
  // the rod
  { const tAt = VW('rod', 'attract') - 0.1, tJ = VW('rod', 'jump') - 0.2, tR = VW('rod', 'roof') - 0.1;
    pop(tAt, 0.08, 0, 300);
    for (let i = 0; i < 5; i++) zap(VL('rod').t0 + 0.4 + i * ((tJ - VL('rod').t0 - 0.4) / 5), 0.12, -0.2);
    crack(tJ + 0.35, 0.75, 0); hum(tJ + 0.4, tJ + 1.8, 0.05); rumble(tJ + 0.5, 2.5, 0.22, 0);
    chime(tR, [1046.5, 1568], 0.06, -0.3); }
  // twice: two cracks, then the year's count
  { const t1 = VW('twice', 'strikes') - 0.1, t2 = VW('twice', 'twice') - 0.05, tD = VW('twice', 'dozen') - 0.4;
    crack(t1 + 0.18, 0.55, -0.3); crack(t2 + 0.18, 0.6, 0.3); rumble(t2 + 0.4, 2.6, 0.24, 0);
    for (let i = 0; i < 24; i++) tick(tD + i * 0.06, 0.07, -0.4 + (i % 4) * 0.27, 2600 + (i % 5) * 300); }

  // ---- 6 the end: blind steps, the ground rises, the last strike
  { const t0 = SUB('end'), tR = VW('end', 'rises') - 0.2, tM = VW('end', 'meet') + 0.1, tF = VL('end').t1 + 0.2;
    for (let i = 0; i < 9; i++) zap(t0 + 0.3 + i * (tR - t0 - 0.3) / 9, 0.12, 0.3 - i * 0.05);
    riser(tR, tF, 0.05); crackle(tR, tF - tR, 0.08, 0.3, 'endst');
    crack(tF, 0.85, 0.1); noiseHit(tF, 0.7, 'lowpass', 2600, 0.7, 0.35, 0, 0.6, 200); rumble(tF + 0.25, Math.max(1, DURATION - tF - 0.3), 0.38, 0, 120);
    typing(tF + 0.3, 16, 24, 0.035); typing(tF + 0.95, 11, 20, 0.035); }
