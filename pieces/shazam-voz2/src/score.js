  // SCORE BODY — Cómo te reconoce Shazam: code SFX only (the music is the user's documentary track, joined at export)
  sfxBus.gain.value *= 3.5;
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const whoosh = (t, d = 0.5, v = 0.08, f0 = 400, f1 = 3000, pan = 0) => noiseHit(t, d, 'bandpass', f0, 1.2, v, pan, 0.3, f1);
  const pop = (t, v = 0.05, f = 900) => blip(t, f, f * 1.8, 0.07, v);
  const bell = (t, n, v) => chime(t, n, v * 0.4);   // small chimes stay well under the payoff
  // 1: the field grows, the stars, the melody
  sweep(E(0.1), E(1.2), 0.03, 200, 900); 
  for (let k = 0; k < 12; k++) pop(E(4.2) + k * 0.08, 0.025, 1200 + k * 60); bell(E(6.0), [nz('D5'), nz('A5')], 0.04);
  sweep(E(7.3), E(8.6), 0.025, 600, 900);
  // 2: the taquería: plates clink, chatter, then the song line arrives
  for (let k = 0; k < 10; k++) blip(E(12.6) + k * 0.42, 3200 + (k % 3) * 400, 3000, 0.04, 0.02, Math.sin(k) * 0.6);
  sweep(E(14.8), E(16.2), 0.03, 300, 1200);
  // 3: tap, listening, the 5 s counter, the huge field, back
  pop(E(18.9), 0.06, 700); for (let k = 0; k < 10; k++) tick(E(20.1) + k * (E(23.0) - E(20.1)) / 10, 1500, 0.03);
  sweep(E(23.4), E(24.6), 0.025, 900, 400);
  // 4: the spectrogram rises, flattens, the constellation, the cut, the three peaks, the zone, the song
  sweep(E(32.6), E(34.4), 0.04, 200, 1400); sweep(E(39.6), E(41.0), 0.03, 1200, 300);
  for (let k = 0; k < 16; k++) pop(E(43.1) + k * 0.09, 0.025, 900 + k * 80); bell(E(44.2), [nz('E5'), nz('B5')], 0.04);
  sweep(E(45.6), E(47.0), 0.03, 300, 700);
  pop(E(48.6), 0.06, 200); pop(E(49.8), 0.05, 900); pop(E(51.6), 0.05, 1600); tick(E(52.7), 2000, 0.04);
  tick(E(54.9), 1600, 0.04); for (let k = 0; k < 3; k++) tick(E(55.6) + k * 0.4, 2000 + k * 200, 0.03); pop(E(57.0), 0.05, 1200);
  for (let k = 0; k < 20; k++) tick(E(58.7) + k * 0.11, 1800 + (k % 4) * 150, 0.015);
  // 5: send, the database, one match, many, AGREE (the loudest), noise, histogram
  whoosh(E(63.6), 2.0, 0.05, 600, 3000); sweep(E(66.3), E(68.0), 0.03, 300, 1000);
  blip(E(71.8), 900, 900, 0.15, 0.04); blip(E(72.4), 400, 300, 0.25, 0.04);
  for (let k = 0; k < 14; k++) tick(E(74.0) + k * 0.2, 1200 + k * 60, 0.03); riser(E(76.5), E(78.75), 0.035);
  const HIT = E(79.0); sub(HIT, 1.3); sub(HIT + 0.06, 0.8); sub(HIT + 0.14, 0.5); chime(HIT, [nz('D5'), nz('A5'), nz('D6'), nz('Fs6')], 0.18); noiseHit(HIT, 0.9, 'lowpass', 2500, 0.6, 0.45, 0, 0.6, 300);
  pop(E(86.2), 0.04, 1400); pop(E(89.0), 0.05, 800); bell(E(89.8), [nz('E5'), nz('B5')], 0.04);
  // 6: again, no melody, the one song
   for (let k = 0; k < 10; k++) pop(E(96.2) + k * 0.1, 0.02, 1000 + k * 70);
  sweep(E(99.6), E(101.4), 0.03, 400, 1600); bell(E(101.0), [nz('D5'), nz('A5'), nz('E6')], 0.05); bell(E(103.2), [nz('D5'), nz('A5'), nz('Fs5')], 0.04);
