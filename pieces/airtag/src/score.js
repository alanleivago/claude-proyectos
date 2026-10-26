  // SCORE BODY — Cómo te encuentra un AirTag: code SFX only (the music is the user's documentary track, joined at export)
  sfxBus.gain.value *= 3.5;
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const pop = (t, v = 0.05, f = 900) => blip(t, f, f * 1.8, 0.07, v);
  const bell = (t, n, v) => chime(t, n, v * 0.4);   // small chimes stay well under the payoff
  const ping = (t, v = 0.03) => { blip(t, 1800, 1700, 0.18, v); blip(t + 0.09, 2400, 2300, 0.14, v * 0.6); };   // a Bluetooth "ping"
  // 1: the tiles cross out, the city pin, the phone frame
  pop(E(1.3), 0.04, 700); pop(E(2.4), 0.04, 800); pop(E(3.9), 0.04, 900);
  for (const t of [1.8, 3.1, 4.5]) blip(E(t), 500, 260, 0.12, 0.05);
  sweep(E(5.4), E(6.6), 0.025, 300, 900); pop(E(6.0), 0.06, 600); pop(E(8.9), 0.05, 1000);
  for (let k = 0; k < 10; k++) tick(E(14.6) + k * 0.08, 2200 + (k % 3) * 300, 0.02, Math.sin(k) * 0.6);
  // 2: the AirTag opens, it pings, the dome grows
  sweep(E(19.4), E(20.8), 0.03, 200, 900); pop(E(20.8), 0.04, 1300);
  for (let k = 0; k < 4; k++) ping(E(21.5) + k * 1.66, 0.03);
  sweep(E(24.2), E(25.8), 0.035, 180, 700); for (let k = 0; k < 3; k++) ping(E(26.0) + k * 1.25, 0.02);
  blip(E(28.4), 300, 220, 0.25, 0.04);
  // 3: the stranger, detection, the report beam, more people
  for (let k = 0; k < 8; k++) tick(E(30.6) + k * 0.4, 900, 0.015);   // footsteps
  ping(E(33.2), 0.05); blip(E(36.4), 1200, 1200, 0.12, 0.035);
  riser(E(39.2), E(41.0), 0.03); bell(E(41.0), [nz('E5'), nz('B5')], 0.05);
  blip(E(44.6), 500, 260, 0.12, 0.05);
  ping(E(49.4), 0.04); pop(E(49.6), 0.05, 700); ping(E(50.9), 0.04); pop(E(51.0), 0.05, 800);
  for (let k = 0; k < 6; k++) { ping(E(52.0) + k * 0.3, 0.02); pop(E(52.2) + k * 0.3, 0.03, 900 + k * 60); }
  sweep(E(54.6), E(56.0), 0.025, 300, 800);
  for (let k = 0; k < 10; k++) pop(E(57.6) + k * (E(64.4) - E(57.6)) / 9.6, 0.035, 700 + k * 40);
  // 4: close, near, ultra wideband
  ping(E(67.9), 0.05); blip(E(70.9), 1500, 1500, 0.1, 0.03);
  for (let k = 0; k < 12; k++) tick(E(72.6) + k * 0.12, 1400 + k * 60, 0.025);   // then silence until the arrow
  // 5: THE ARROW (the loudest)
  const HIT = E(77.0); sub(HIT, 1.3); sub(HIT + 0.06, 0.8); chime(HIT, [nz('D5'), nz('A5'), nz('D6'), nz('Fs6')], 0.18); noiseHit(HIT, 0.9, 'lowpass', 2500, 0.6, 0.45, 0, 0.6, 300);
  for (let k = 0; k < 4; k++) tick(HIT + 0.8 + k * 0.6, 2000, 0.03);
  // 6: the beacon, the network, the way back
  for (let k = 0; k < 4; k++) ping(E(80.6) + k * 1.0, 0.025);
  for (let k = 0; k < 9; k++) pop(E(85.0) + k * 0.25, 0.025, 900 + k * 70); bell(E(86.4), [nz('D5'), nz('A5')], 0.04);
  for (const t of [90.2, 91.2, 92.6]) blip(E(t), 500, 260, 0.12, 0.04);
  sweep(E(93.6), E(94.8), 0.03, 300, 1100); bell(E(96.3), [nz('D5'), nz('A5'), nz('Fs5')], 0.05);
