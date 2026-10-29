  // SCORE BODY — Cómo sabe Google Maps del tráfico: code SFX only (the music is the user's documentary track, joined at export)
  sfxBus.gain.value *= 3.5;
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const pop = (t, v = 0.05, f = 900) => blip(t, f, f * 1.8, 0.07, v);
  const bell = (t, n, v) => chime(t, n, v * 0.4);
  const ping = (t, v = 0.03) => { blip(t, 1800, 1700, 0.18, v); blip(t + 0.09, 2400, 2300, 0.14, v * 0.6); };
  // 1: the dots, no cameras, GPS, following, spacing
  for (let k = 0; k < 8; k++) pop(E(0.3) + k * 0.07, 0.02, 900 + k * 80);
  for (const t of [3.7, 4.7, 5.6]) pop(E(t), 0.04, 700);
  for (let k = 0; k < 3; k++) ping(E(9.4) + k * 0.3, 0.03); pop(E(10.2), 0.04, 1000);
  for (let k = 0; k < 4; k++) tick(E(18.0) + k * 0.4, 1800, 0.03);
  // 2: one phone, pulled over, the lot, off the road, hundreds, segments, speeds
  sweep(E(19.8), E(21.4), 0.025, 900, 300); pop(E(23.3), 0.04, 600); pop(E(24.6), 0.04, 800); blip(E(27.2), 400, 300, 0.2, 0.04);
  for (let k = 0; k < 16; k++) pop(E(29.4) + k * 0.12, 0.018, 800 + k * 50);
  sweep(E(34.0), E(35.0), 0.025, 400, 900); for (let k = 0; k < 4; k++) tick(E(37.7) + k * 0.4, 1600 + k * 100, 0.03);
  // 3: THE SLOWDOWN (the loudest): a falling sweep, then the hit on 25 km/h
  sweep(E(45.2), E(46.8), 0.03, 1200, 300);
  const HIT = E(47.6); sub(HIT, 1.3); sub(HIT + 0.06, 0.8); chime(HIT, [nz('D5'), nz('A5'), nz('D6'), nz('Fs6')], 0.18); noiseHit(HIT, 0.9, 'lowpass', 2500, 0.6, 0.45, 0, 0.6, 300);
  pop(E(49.2), 0.04, 700);
  // 4: raw GPS, drift, which road, map matching, the checklist, the snap, many devices, history, night, rush hour
  for (let k = 0; k < 12; k++) tick(E(51.9) + k * 0.12, 2200 + (k % 3) * 200, 0.02, Math.sin(k) * 0.5);
  for (const t of [56.5, 57.6, 59.0]) pop(E(t), 0.035, 800);
  pop(E(62.4), 0.04, 700); pop(E(63.4), 0.04, 900); bell(E(66.2), [nz('E5'), nz('B5')], 0.05);
  for (const t of [69.0, 69.9, 70.8, 72.6]) blip(E(t), 1200, 1500, 0.08, 0.035);
  sweep(E(73.6), E(74.8), 0.03, 300, 1000); pop(E(74.8), 0.05, 1200);
  pop(E(77.2), 0.04, 600); for (let k = 0; k < 10; k++) pop(E(79.8) + k * 0.06, 0.02, 1000 + k * 60);
  for (let k = 0; k < 4; k++) tick(E(83.0) + k * 0.4, 1500, 0.03);
  pop(E(88.8), 0.035, 800); pop(E(89.6), 0.035, 600);
  sweep(E(92.0), E(93.0), 0.03, 800, 200); pop(E(93.0), 0.05, 500); blip(E(95.2), 300, 220, 0.25, 0.04);
  sweep(E(97.3), E(98.2), 0.03, 300, 900); pop(E(100.0), 0.035, 800); pop(E(102.4), 0.035, 1000);
  // 5: travel times, the graph, weights, the search, the routes, the change, the reroute
  for (let k = 0; k < 7; k++) pop(E(106.2) + k * 0.35, 0.03, 900 + k * 60);
  for (let k = 0; k < 16; k++) tick(E(112.0) + k * 0.18, 1400 + (k % 4) * 150, 0.02);
  pop(E(115.0), 0.04, 900); pop(E(116.9), 0.04, 1100); for (let k = 0; k < 8; k++) tick(E(122.2) + k * 0.05, 2000, 0.02);
  for (let k = 0; k < 7; k++) blip(E(125.4) + k * 0.35, 900 + k * 120, 1000 + k * 120, 0.06, 0.03);
  pop(E(129.5), 0.04, 700); bell(E(130.4), [nz('D5'), nz('A5')], 0.05);
  sweep(E(132.8), E(134.6), 0.03, 1000, 300); blip(E(137.2), 300, 220, 0.25, 0.04); sweep(E(139.4), E(141.4), 0.03, 400, 1200); bell(E(141.4), [nz('E5'), nz('B5')], 0.04);
  // 6: green, orange, red; the sensors; the end
  pop(E(144.5), 0.035, 900); pop(E(146.5), 0.035, 700); pop(E(148.2), 0.04, 500);
  for (let k = 0; k < 10; k++) pop(E(154.0) + k * 0.08, 0.02, 1000 + k * 70); bell(E(157.0), [nz('D5'), nz('A5'), nz('Fs5')], 0.015);
