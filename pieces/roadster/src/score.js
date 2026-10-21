  // SCORE BODY — Cómo vuela el Roadster: code SFX only (the music is the user's documentary track, joined at export).
  // The loudest hit is the launch (R 59.6): the track goes quiet before it (sound/layer.py), the SFX leave a gap too.
  sfxBus.gain.value *= 3.5;   // code SFX clearly audible (the user's rule for scroll3d)
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const whoosh = (t, d = 0.5, v = 0.08, f0 = 400, f1 = 3000, pan = 0) => noiseHit(t, d, 'bandpass', f0, 1.2, v, pan, 0.3, f1);
  const thud = (t, v = 0.15) => { sub(t, v); noiseHit(t, 0.18, 'lowpass', 420, 0.8, v * 0.8); blip(t, 160, 60, 0.16, v); };
  const engine = (t0, t1, f0, f1, v) => { sweep(t0, t1, v, f0, f1); noiseHit(t0, t1 - t0, 'lowpass', 300, 0.7, v * 0.6, 0, 0.1, 500); };
  const hiss = (t, d, v) => noiseHit(t, d, 'highpass', 3500, 0.6, v, 0, 0.3);
  // 1: the run, the loop, the thrusters, the landing
  engine(E(0), E(1.4), 140, 190, 0.035); whoosh(E(1.2), 0.6, 0.04, 300, 1800);
  engine(E(1.4), E(2.9), 190, 110, 0.035); whoosh(E(2.2), 0.7, 0.035, 1200, 300);
  hiss(E(3.6), 0.8, 0.055); whoosh(E(3.6), 1.0, 0.05, 600, 3500); thud(E(5.0), 0.07);
  whoosh(E(5.4), 0.7, 0.07, 300, 2600);
  // 2: the Corolla strains, stalls, falls, lands on its roof
  engine(E(7.0), E(8.67), 120, 160, 0.035); engine(E(8.67), E(10.35), 160, 70, 0.035);
  whoosh(E(10.35), 1.3, 0.05, 2400, 300); thud(E(11.7), 0.09); noiseHit(E(11.7), 0.6, 'bandpass', 1800, 0.8, 0.09, 0, 0.3, 600);
  for (let k = 0; k < 6; k++) tick(E(11.75) + k * 0.05, 3000 - k * 300, 0.03, (k % 2 ? 0.3 : -0.3));
  // the grip: green glows, the weight arrows
  tick(E(13.3), 1800, 0.05); blip(E(14.4), 500, 260, 0.2, 0.07); blip(E(16.9), 420, 200, 0.24, 0.07); blip(E(17.7), 300, 180, 0.3, 0.05);
  // 3: electric: the engine poofs away, motors pop in, the battery slides under
  whoosh(E(18.5), 0.8, 0.07, 2000, 400); whoosh(E(19.2), 0.6, 0.05, 400, 1600);
  noiseHit(E(20.45), 0.7, 'lowpass', 1400, 0.7, 0.1, 0, 0.3, 300);
  blip(E(21.2), 600, 1200, 0.08, 0.06, -0.3); blip(E(21.3), 700, 1300, 0.08, 0.06, 0.3);
  sweep(E(22.5), E(23.3), 0.04, 300, 900); tick(E(23.3), 1400, 0.07); chime(E(24.1), [nz('A5'), nz('E6')], 0.04);
  sweep(E(24.7), E(25.3), 0.03, 1200, 2600);
  // 4: highway speed into the loop, slower and slower to the top
  engine(E(25.4), E(27.2), 170, 200, 0.06); whoosh(E(26.9), 0.6, 0.07, 300, 2400);
  engine(E(27.2), E(29.2), 200, 90, 0.05); noiseHit(E(29.2), E(31.9) - E(29.2), 'lowpass', 220, 0.6, 0.02);
  // 5: suction: the fans spin up and whirr, the air pushes in, the system named
  sweep(E(32.7), E(33.6), 0.04, 200, 520); for (let t = E(33.6); t < E(44.0); t += 0.5) noiseHit(t, 0.55, 'bandpass', 900, 3, 0.006, 0, 0.1);
  drone(E(32.9), E(44.2), 260, 0.005, { att: 0.6, rel: 0.4 });
  riser(E(38.2), E(41.8), 0.018); chime(E(42.4), [nz('D5'), nz('A5'), nz('E6')], 0.05, 0.2);
  // 6: stuck: the tyres spin and squeal
  for (let k = 0; k < 5; k++) noiseHit(E(48.4) + k * 0.42, 0.4, 'bandpass', 2600 + k * 120, 4, 0.04, (k % 2 ? 0.2 : -0.2), 0.2);
  // 7: the tank, the nozzles, the balloon, cold gas — then a gap and the launch
  blip(E(51.6), 300, 900, 0.1, 0.06); tick(E(53.9), 2600, 0.05);
  hiss(E(53.95), E(56.4) - E(53.95), 0.08);
  for (let k = 0; k < 10; k++) { const t = E(54.8) + k * 0.17; blip(t, 700 + (k % 2) * 500, 1100 - (k % 2) * 300, 0.15, 0.03, Math.sin(k) * 0.5); }
  chime(E(57.7), [nz('D5'), nz('A5'), nz('D6')], 0.03, -0.2);
  const HIT = E(59.6);
  sub(HIT, 1.0); sub(HIT + 0.05, 0.8); sub(HIT + 0.12, 0.5); chime(HIT, [nz('D5'), nz('A5'), nz('D6')], 0.14); noiseHit(HIT, 1.6, 'highpass', 900, 0.5, 0.5, 0, 0.4, 5000); noiseHit(HIT, 1.2, 'lowpass', 2600, 0.6, 0.45, 0, 0.5, 300);
  whoosh(HIT + 0.2, 1.4, 0.12, 400, 4000);
  noiseHit(HIT + 0.1, E(62.8) - HIT, 'lowpass', 1800, 0.6, 0.22, 0, 0.4, 600); noiseHit(HIT + 0.1, E(62.8) - HIT, 'highpass', 4000, 0.5, 0.12, 0, 0.3);   // the jet of air, the whole launch
  // 8: tumbling, the small puffs, level; the landing
  whoosh(E(64.0), 1.2, 0.06, 2000, 500);
  for (let k = 0; k < 40; k++) { const t = E(66.5 + k * 0.125); if (t > E(71.5) && k % 3) continue; noiseHit(t, 0.1, 'highpass', 2600, 0.7, 0.035, ((k * 37) % 21) / 10 - 1, 0.2); }
  chime(E(71.8), [nz('E5'), nz('B5')], 0.04);
  for (let k = 0; k < 8; k++) noiseHit(E(73.3) + k * 0.2, 0.15, 'highpass', 2200, 0.7, 0.03, 0, 0.2);
  thud(E(74.9), 0.035); engine(E(75.0), E(76.6), 120, 150, 0.03);
  chime(E(77.9), [nz('D5'), nz('A5'), nz('Fs5')], 0.04);
