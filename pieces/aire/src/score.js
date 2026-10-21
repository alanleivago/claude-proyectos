  // SCORE BODY — El límite del Roadster: code SFX only (the music is the user's documentary track, joined at export)
  sfxBus.gain.value *= 3.5;   // code SFX clearly audible (the user's rule for scroll3d)
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const whoosh = (t, d = 0.5, v = 0.08, f0 = 400, f1 = 3000, pan = 0) => noiseHit(t, d, 'bandpass', f0, 1.2, v, pan, 0.3, f1);
  const thud = (t, v = 0.1) => { sub(t, v); noiseHit(t, 0.18, 'lowpass', 420, 0.8, v * 0.8); blip(t, 160, 60, 0.16, v); };
  const engine = (t0, t1, f0, f1, v) => { sweep(t0, t1, v, f0, f1); noiseHit(t0, t1 - t0, 'lowpass', 300, 0.7, v * 0.6, 0, 0.1, 500); };
  const jet = (t0, t1, v) => { noiseHit(t0, t1 - t0, 'highpass', 3000, 0.6, v, 0, 0.3); noiseHit(t0, t1 - t0, 'lowpass', 1500, 0.6, v * 0.8, 0, 0.3, 500); };
  // 1: the launch, the rock, the questions
  jet(E(0.2), E(3.0), 0.06); engine(E(0.2), E(3.0), 120, 230, 0.03);
  whoosh(E(3.0), 2.0, 0.04, 2400, 300); thud(E(4.9), 0.025);
  tick(E(5.4), 1800, 0.05); blip(E(6.2), 900, 500, 0.2, 0.05);
  jet(E(7.6), E(9.6), 0.04); tick(E(8.0), 2600, 0.05); tick(E(9.8), 1500, 0.05);
  jet(E(11.0), E(13.1), 0.035); tick(E(11.6), 2200, 0.05);
  // 2: the light, grip, gravity, spin, the race, the Plaid, the motor
  blip(E(13.6), 700, 700, 0.12, 0.05); blip(E(16.2), 1100, 1100, 0.12, 0.05); engine(E(16.2), E(18.3), 90, 160, 0.04);
  tick(E(18.5), 1600, 0.05); tick(E(19.7), 2000, 0.05); tick(E(21.5), 1600, 0.05); blip(E(23.0), 500, 260, 0.25, 0.025);
  for (let k = 0; k < 5; k++) noiseHit(E(25.0) + k * 0.4, 0.4, 'bandpass', 2600 + k * 100, 4, 0.02, 0, 0.2);
  for (let k = 0; k < 12; k++) tick(E(28.0) + k * 0.3, 900 + k * 90, 0.025);
  for (let k = 0; k <= 4; k++) tick(E(32.6) + k * (E(34.6) - E(32.6)) / 4, 1800, 0.04);
  engine(E(36.0), E(38.6), 100, 260, 0.04);
  // 3: the reveal, the tanks, the jet, the balloon, thrust, 4–5×, the versions
  whoosh(E(39.6), 0.8, 0.06, 400, 3000); chime(E(40.0), [nz('D5'), nz('A5')], 0.04);
  tick(E(42.4), 2400, 0.05); blip(E(45.6), 300, 900, 0.1, 0.05);
  jet(E(47.9), E(50.2), 0.06); jet(E(50.2), E(53.5), 0.05);
  for (let k = 0; k < 10; k++) blip(E(55.2) + k * 0.17, 700 + (k % 2) * 500, 1100 - (k % 2) * 300, 0.15, 0.03, Math.sin(k) * 0.5);
  jet(E(57.2), E(66.2), 0.025); tick(E(57.5), 2000, 0.05); for (let k = 0; k < 6; k++) tick(E(63.0) + k * 0.3, 1200 + k * 200, 0.04);
  tick(E(66.5), 1400, 0.05); tick(E(67.0), 1800, 0.05); tick(E(67.4), 2200, 0.05);
  // 4: the live run — the loudest moment
  const HIT = E(70.9);
  sub(HIT, 1.0); sub(HIT + 0.05, 0.8); sub(HIT + 0.12, 0.5); chime(HIT, [nz('D5'), nz('A5'), nz('D6')], 0.14);
  noiseHit(HIT, 1.6, 'highpass', 900, 0.5, 0.5, 0, 0.4, 5000); noiseHit(HIT, 1.2, 'lowpass', 2600, 0.6, 0.45, 0, 0.5, 300); whoosh(HIT + 0.2, 1.4, 0.12, 400, 4000);
  noiseHit(HIT + 0.1, 3.0, 'lowpass', 1800, 0.6, 0.22, 0, 0.4, 600);
  // 5: the problem, empty, refilling, no gas station, breathing
  blip(E(76.0), 600, 300, 0.4, 0.05); jet(E(78.9), E(81.0), 0.03);
  for (let k = 0; k < 8; k++) tick(E(81.6) + k * 0.15, 1000 + k * 120, 0.03);
  jet(E(85.0), E(87.0), 0.05); sweep(E(85.0), E(87.0), 0.03, 1200, 300);
  sweep(E(88.0), E(91.6), 0.025, 300, 1200); for (let t = E(88.0); t < E(91.6); t += 0.25) noiseHit(t, 0.3, 'bandpass', 2200, 2, 0.012, 0, 0.2);
  blip(E(92.3), 300, 150, 0.3, 0.025);
  noiseHit(E(94.3), 1.6, 'bandpass', 700, 1, 0.02, 0, 0.3); noiseHit(E(95.5), 1.2, 'bandpass', 600, 1, 0.018, 0, 0.3);
  // 6: the limits
  tick(E(96.8), 1800, 0.05); jet(E(98.9), E(101.5), 0.03); tick(E(101.7), 1400, 0.04); jet(E(103.5), E(105.9), 0.03);
  chime(E(105.1), [nz('D5'), nz('A5'), nz('Fs5')], 0.04);
