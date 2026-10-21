  // SCORE BODY — Cómo se comprime un video (inside buildScore(); see kit/score-head.js)
  // A soft explainer bed under the voice (D minor, 120 BPM: Dm9 – Bbmaj7 – Fmaj7 – C6, 2 s a chord), thinner in act 1,
  // fuller from the blocks on; every on-screen action gets a small code SFX. The bed stops ~1.1 s before "11 GB"
  // and the loudest hit lands with it; a calm chord carries the end.
  const E = esT, HIT = E(86.5), HUSH = HIT - 1.15;
  const CH = [['D3', 'A3', 'C4', 'E4', 'F4'], ['Bb2', 'F3', 'A3', 'D4', 'F4'], ['F2', 'C3', 'E3', 'A3', 'C4'], ['C3', 'G3', 'A3', 'E4', 'G4']];
  const chordAt = (t) => CH[Math.floor(t / 2) % 4];
  sfxBus.gain.value *= 2.2;   // the code SFX up ~7 dB (the user's note: louder)
  to = 'm';
  // the pad, chord by chord
  for (let t = 0; t < HUSH - 0.05; t += 2) pad(t, Math.min(t + 2.05, HUSH), chordAt(t).slice(0, 4), 0.010 + 0.006 * seg(t, E(30), E(50)), { type: 'triangle', cut: 1200, att: 0.25, rel: 0.2, send: 0.5 });
  // the arpeggio: 8ths, quiet, more notes as the story builds
  for (let t = 0.5, i = 0; t < HUSH - 0.1; t += E8, i++) {
    const c = chordAt(t), n = c[[1, 2, 3, 4, 3, 2, 1, 3][i % 8]], full = seg(t, E(10), E(30)), v = 0.018 + 0.016 * full + 0.008 * seg(t, E(50), E(75));
    if (t < E(10.6) && i % 2) continue;
    pluck(t, nz(n) * 2, v, (i % 2 ? 0.25 : -0.25), 0.28, 2600, 0.3);
  }
  // a soft bass on each chord from the blocks on, a sub on each bar in the peak
  for (let t = E(30.2); t < HUSH - 0.1; t += 2) { bass(t, nz(chordAt(t)[0]), 0.10); bass(t + 1.0, nz(chordAt(t)[0]), 0.06); }
  for (let t = E(50.4); t < E(75); t += 4) sub(t, 0.10);

  // ---- SFX
  to = 's';
  const tick = (t, f = 2400, v = 0.05, pan = 0) => blip(t, f, f * 0.8, 0.03, v, pan);
  const whoosh = (t, d = 0.5, v = 0.08, f0 = 400, f1 = 3000) => noiseHit(t, d, 'bandpass', f0, 1.2, v, 0, 0.3, f1);
  const thunk = (t, v = 0.12) => { noiseHit(t, 0.12, 'lowpass', 500, 0.8, v * 0.8); blip(t, 180, 70, 0.12, v); };
  // 1: ghosts appear, the tower stacks up, then dims
  [1, 2, 3].forEach((i) => tick(E(0.15 + i * 0.12), 1800 + i * 300, 0.04));
  for (let j = 1; j < 20; j++) tick(E(5.45 + 0.06 * j), 900 + j * 90, 0.045, (j % 2 ? 0.2 : -0.2));
  for (let j = 19; j >= 1; j--) tick(E(7.9 + (20 - j) * 0.09), 2600 - (19 - j) * 70, 0.02);
  // 2: the toy car rolls across, the camera pulls out, the white grid, the three close-ups, frame B rises
  noiseHit(E(11.3), E(14.6) - E(11.3), 'lowpass', 260, 0.7, 0.07, 0, 0.1, 500);
  for (let t = E(11.4); t < E(14.5); t += 0.11) blip(t, 520, 480, 0.02, 0.012, 0.1);
  whoosh(E(14.9), 1.0, 0.06, 300, 1800);
  for (let k = 0; k < 6; k++) tick(E(16.4) + k * 0.035, 3200 - k * 150, 0.03);
  [18.08, 18.92, 19.64].forEach((r) => whoosh(E(r) - 0.08, 0.25, 0.05, 900, 4000));
  whoosh(E(20.4), 0.6, 0.05, 300, 1500);
  tick(E(21.1), 2000, 0.05); whoosh(E(21.5), 0.7, 0.06, 250, 1600); thunk(E(22.3), 0.06);
  tick(E(25.6), 1500, 0.05); sweep(E(28.3), E(28.75), 0.04, 1800, 600); tick(E(28.9), 2600, 0.05);
  // 3: blocks, the tilt, the rings, the block hops, the vector, the pixel column
  for (let k = 0; k < 10; k++) tick(E(30.7) + k * 0.025, 1200 + k * 120, 0.03, -0.3 + k * 0.06);
  whoosh(E(34.5), 1.0, 0.07, 200, 1200);
  blip(E(35.6), 880, 880, 0.12, 0.05, 0.2); blip(E(36.9), 660, 660, 0.12, 0.05, -0.2);
  sweep(E(38.4), E(39.6), 0.05, 300, 900);
  whoosh(E(40.3), E(41.3) - E(40.3), 0.09, 300, 3500); thunk(E(41.3), 0.12);
  chime(E(42.1), [nz('D5'), nz('A5'), nz('E6')], 0.05, 0.2);
  for (let k = 0; k < 40; k++) { const t = lerp(E(45.2), E(47.0), Math.sqrt(k / 40)); tick(t, 700 + k * 45, 0.035, (k % 2 ? 0.25 : -0.25)); }
  riser(E(45.2), E(47.0), 0.035);
  sweep(E(47.7), E(48.4), 0.05, 2000, 300); tick(E(48.4), 1800, 0.05);
  // 4: into the sweater, the voxel field, the simplifying, the tiny differences, the restart
  whoosh(E(51.6), 0.8, 0.07, 400, 3000);
  sweep(E(53.0), E(53.6), 0.03, 600, 2400);
  sweep(E(54.6), E(55.6), 0.04, 1600, 500); sweep(E(56.6), E(57.6), 0.04, 1200, 300);
  whoosh(E(58.9) - 0.08, 0.3, 0.05, 900, 4000);
  { const Rn = RNG('diffs'); for (let i = 0; i < 40; i++) { Rn.r(-0.5, 5.6); Rn.r(3.0, 8.3); const t0 = 59.25 + Rn.r(0, 0.6), t1 = 60.95 + Rn.r(0, 0.45); if (i % 2 === 0) tick(E(t0), 2800 + (i * 37) % 900, 0.02, ((i * 13) % 10) / 10 - 0.5); if (i % 3 === 0) blip(E(t1), 1400, 300, 0.06, 0.02, ((i * 7) % 10) / 10 - 0.5); } }
  for (let s = 1; s < 5; s++) tick(E(62.0) + s * 0.05, 1500 + s * 200, 0.025);
  thunk(E(63.85), 0.10); tick(E(64.4), 2000, 0.05);
  for (let s = 6; s <= 9; s++) tick(E(67.3 + (s - 6) * 0.35), 1400 + s * 120, 0.04);
  // 5: the tower that it is NOT, the three kinds of data, the phone, the hush, the hit
  for (let j = 0; j < 18; j++) tick(E(72.9 + j * 0.06), 1000 + j * 80, 0.03);
  [[75.62, 1200], [76.84, 1600], [77.72, 2000], [79.22, 2400]].forEach(([r, f]) => tick(E(r), f, 0.05));
  whoosh(E(80.5), 1.4, 0.06, 1500, 300); thunk(E(82.2), 0.08);
  sub(HIT, 1.0); sub(HIT + 0.04, 0.5); noiseHit(HIT, 1.4, 'lowpass', 5000, 0.6, 0.55, 0, 0.6, 400);
  chime(HIT, [nz('D5'), nz('A5'), nz('D6'), nz('F6')], 0.16);
  tick(E(87.76), 1400, 0.06); blip(E(87.76) + 0.05, 600, 1200, 0.15, 0.04);
  to = 'm';
  pad(HIT + 0.2, LOOP_T, ['D3', 'A3', 'D4', 'F4'], 0.016, { type: 'triangle', cut: 1000, att: 1.2, rel: 1.4, send: 0.6 });
  drone(HIT, LOOP_T, nz('D2'), 0.05, { att: 0.3, rel: 1.4 });
