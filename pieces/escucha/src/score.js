  // SCORE BODY — ¿Tu celular te escucha?: code SFX only (the music is the user's documentary track, joined at export)
  sfxBus.gain.value *= 3.5;
  const E = esT;
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const whoosh = (t, d = 0.5, v = 0.08, f0 = 400, f1 = 3000, pan = 0) => noiseHit(t, d, 'bandpass', f0, 1.2, v, pan, 0.3, f1);
  const buzz = (t, d = 0.5, v = 0.05) => { for (let k = 0; k < d / 0.05; k++) blip(t + k * 0.05, 180, 160, 0.04, v); };
  const pop = (t, v = 0.06, f = 900) => blip(t, f, f * 1.8, 0.07, v);
  // 1: rings, the notification, the talk, the morning pop
  for (let k = 0; k < 6; k++) blip(E(0.3) + k * 0.6, 600 + k * 40, 500, 0.25, 0.02, Math.sin(k) * 0.4);
  buzz(E(5.0), 0.5, 0.05); chime(E(5.05), [nz('A5'), nz('E6')], 0.04);
  pop(E(9.0), 0.04, 700); pop(E(10.2), 0.04, 900); tick(E(10.9), 2200, 0.04); tick(E(11.3), 1500, 0.04);
  buzz(E(13.46), 0.6, 0.05); pop(E(13.55), 0.08, 500); chime(E(13.6), [nz('D5'), nz('A5'), nz('D6')], 0.05);
  // 2: the mic hum, off; the app scan, zero; the battery dying; the dot
  noiseHit(E(16.3), E(19.3) - E(16.3), 'bandpass', 700, 2, 0.02, 0, 0.2); sweep(E(19.3), E(19.9), 0.04, 900, 120);
  for (let k = 0; k < 24; k++) tick(E(21.66) + k * (E(25.2) - E(21.66)) / 24, 900 + k * 60, 0.025, Math.sin(k * 0.7) * 0.5);
  function thud(t) { sub(t, 0.02); noiseHit(t, 0.15, 'lowpass', 400, 0.8, 0.02); }
  sweep(E(30.2), E(33.8), 0.03, 900, 200); for (let k = 0; k < 8; k++) blip(E(30.3) + k * 0.45, 1400 - k * 110, 1300 - k * 110, 0.05, 0.03);
  blip(E(34.8), 1800, 1800, 0.15, 0.04);
  // 3: how? the search, the Wi-Fi, the pin
  whoosh(E(37.9), 0.6, 0.05, 600, 2400); pop(E(38.3), 0.05, 600);
  for (let k = 0; k < 14; k++) tick(E(40.3) + k * 0.09, 3000 + (k % 3) * 200, 0.02);
  for (let k = 0; k < 6; k++) blip(E(43.0) + k * 0.35, 1200, 1500, 0.08, 0.02);
  sweep(E(43.5), E(44.5), 0.03, 500, 1800); pop(E(45.4), 0.07, 400); tick(E(45.8), 1600, 0.04);
  // 4: the ad company — the loudest moment, then the arc and the card
  const HIT = E(47.6); sub(HIT, 1.0); sub(HIT + 0.06, 0.6); chime(HIT, [nz('D5'), nz('A5'), nz('D6'), nz('F6')], 0.14); noiseHit(HIT, 1.4, 'lowpass', 4000, 0.6, 0.45, 0, 0.6, 400);
  sweep(E(50.7), E(51.4), 0.06, 400, 1600); whoosh(E(51.6), 1.4, 0.08, 500, 2600); riser(E(48.6), E(51.4), 0.04); pop(E(53.2), 0.05, 800);
  // 5: the arc between the phones, the end
  sweep(E(56.6), E(57.3), 0.03, 600, 1400); chime(E(60.5), [nz('D5'), nz('A5'), nz('Fs5')], 0.04);
