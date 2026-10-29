  // SCORE BODY — Cómo te ve Face ID: code SFX only (the music is the user's documentary track, joined at export)
  sfxBus.gain.value *= 3.5;
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const pop = (t, v = 0.05, f = 900) => blip(t, f, f * 1.8, 0.07, v);
  const bell = (t, n, v) => chime(t, n, v * 0.4);
  // 1: the dark room, the sensors, the pick-up, the infrared flood
  sweep(E(0.2), E(1.6), 0.02, 200, 600); pop(E(4.6), 0.04, 800); sweep(E(7.2), E(8.4), 0.025, 300, 900);
  sweep(E(9.4), E(11.2), 0.03, 150, 500); for (let k = 0; k < 6; k++) tick(E(9.6) + k * 0.18, 3200, 0.012);
  bell(E(13.4), [nz('E5'), nz('B5')], 0.04);
  // 2: thousands of dots land; they bend over nose, eyes, cheeks, jaw
  for (let k = 0; k < 40; k++) tick(E(16.2) + k * 0.055, 2600 + (k % 5) * 180, 0.012, Math.sin(k * 1.3) * 0.6);
  for (const t of [25.2, 25.9, 26.6, 28.6]) pop(E(t), 0.035, 900);
  sweep(E(31.2), E(32.4), 0.025, 900, 400); sweep(E(32.6), E(33.5), 0.025, 400, 900);
  // 3: the depth map, a 3D shape, photo vs face, the stored mesh slides in
  sweep(E(33.8), E(35.0), 0.03, 200, 1000); sweep(E(39.4), E(40.6), 0.025, 300, 800);
  pop(E(42.2), 0.04, 600); pop(E(44.2), 0.04, 900); blip(E(45.0), 300, 220, 0.2, 0.035);
  for (let k = 0; k < 6; k++) tick(E(50.0) + k * 0.4, 1600 + k * 80, 0.025);
  for (let k = 0; k < 6; k++) pop(E(54.0) + k * 0.3, 0.03, 900 + k * 90);   // features match one by one, then silence
  // 4: UNLOCK (the loudest)
  const HIT = E(56.4); sub(HIT, 1.3); sub(HIT + 0.06, 0.8); chime(HIT, [nz('D5'), nz('A5'), nz('D6'), nz('Fs6')], 0.18); noiseHit(HIT, 0.9, 'lowpass', 2500, 0.6, 0.45, 0, 0.6, 300);
  blip(HIT + 0.05, 1400, 2100, 0.12, 0.05);
  // 5: a fraction of a second, darkness, invisible light, the face rebuilt
  pop(E(58.2), 0.035, 1200); sweep(E(60.6), E(62.0), 0.02, 600, 200); sweep(E(66.6), E(67.8), 0.025, 150, 500);
  for (let k = 0; k < 24; k++) tick(E(69.3) + k * 0.1, 2400 + (k % 4) * 150, 0.012);
  sweep(E(74.2), E(75.6), 0.025, 300, 1000); bell(E(75.6), [nz('D5'), nz('A5'), nz('Fs5')], 0.015);
