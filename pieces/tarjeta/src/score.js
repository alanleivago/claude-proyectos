  // SCORE BODY — ¿Te roban con un lector?: code SFX only (the music is the user's documentary track, joined at export)
  sfxBus.gain.value *= 3.5;
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const whoosh = (t, d = 0.5, v = 0.08, f0 = 400, f1 = 3000, pan = 0) => noiseHit(t, d, 'bandpass', f0, 1.2, v, pan, 0.3, f1);
  const pop = (t, v = 0.06, f = 900) => blip(t, f, f * 1.8, 0.07, v);
  // 1: the train rumble, the skim pings, the feed, the card
  noiseHit(E(0), E(5.0), 'lowpass', 160, 0.7, 0.03, 0, 0.1); for (let k = 0; k < 10; k++) blip(E(0.5) + k * 0.4, 1800, 1500, 0.05, 0.015, 0.3);
  for (let k = 0; k < 4; k++) tick(E(5.1) + k * 0.3, 1200, 0.03); pop(E(6.5), 0.05, 700); sweep(E(8.2), E(8.7), 0.03, 600, 1800); tick(E(8.4), 2000, 0.04); tick(E(8.7), 2200, 0.04); tick(E(9.0), 2400, 0.04);
  blip(E(9.7), 400, 300, 0.4, 0.02);
  // 2: the field, the wake-up, the chip, the code
  sweep(E(11.6), E(13.4), 0.03, 300, 900); for (let k = 0; k < 8; k++) blip(E(13.6) + k * 0.4, 520, 560, 0.3, 0.015);
  riser(E(15.4), E(16.4), 0.03); chime(E(16.4), [nz('D5'), nz('A5'), nz('E6')], 0.06); tick(E(19.2), 1800, 0.05);
  whoosh(E(21.6), 0.9, 0.05, 2000, 500, -0.4); whoosh(E(22.4), 0.9, 0.05, 2000, 500, 0.4); pop(E(23.0), 0.04, 500); pop(E(23.8), 0.04, 600); pop(E(24.3), 0.06, 400);
  pop(E(29.1), 0.07, 900); chime(E(29.2), [nz('A5'), nz('E6')], 0.04); pop(E(31.7), 0.05, 700);
  // 3: the thief, the list
  noiseHit(E(33.4), E(38.8) - E(33.4), 'lowpass', 160, 0.7, 0.03, 0, 0.1); for (let k = 0; k < 12; k++) blip(E(33.6) + k * 0.4, 1800, 1500, 0.05, 0.02, 0.3);
  tick(E(36.2), 1600, 0.04);
  pop(E(39.3), 0.05, 1200); pop(E(40.3), 0.05, 1300); blip(E(42.1), 300, 160, 0.2, 0.05); blip(E(43.5), 280, 150, 0.2, 0.05);
  // 4: the copy — rejected: the loudest moment
  whoosh(E(45.1), 1.6, 0.04, 2000, 400);
  const HIT = E(47.0); sub(HIT, 1.0); sub(HIT + 0.06, 0.6); noiseHit(HIT, 1.0, 'lowpass', 3000, 0.6, 0.4, 0, 0.5, 300); blip(HIT, 220, 110, 0.4, 0.2); blip(HIT + 0.18, 200, 100, 0.4, 0.15);
  // 5: the approved tap, the PIN, the cover
  pop(E(50.6), 0.06, 1400); chime(E(50.65), [nz('E5'), nz('B5')], 0.05);
  for (let k = 0; k < 8; k++) tick(E(52.6) + k * 0.22, 1200 + (k % 3) * 200, 0.03);
  noiseHit(E(55.4), 0.3, 'bandpass', 700, 1, 0.04); chime(E(58.3), [nz('D5'), nz('A5'), nz('Fs5')], 0.04);
