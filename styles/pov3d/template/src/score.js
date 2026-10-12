  // SCORE BODY — ¿Qué pasaría si el Sol explotara? (inside buildScore(); see kit/score-head.js)
  // calm pad + surf -> ticking countdown -> SILENCE (19.0-20.0) -> the flash, the loudest hit (20.0) ->
  // fire crackle -> the blast riser -> hard cut to a low rumble -> one soft chime on the end card.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  // act 1: a warm beach pad, surf every ~4s
  pad(0.0, 18.4, ['D3', 'A3', 'Fs4', 'A4'], 0.03, { type: 'triangle', cut: 1100, att: 1.5, rel: 0.6, send: 0.5 });
  for (let t = 0.4; t < 18.5; t += 3.9) noiseHit(t, 2.6, 'lowpass', 900, 0.5, 0.05, Math.sin(t) * 0.4, 0.3, 300);
  // the countdown: a soft tick per beat from 5s, a low pulse from 10s getting closer
  to = 's';
  for (let t = cu.boom; t < 18.4; t += BEAT) blip(t, 2400, 2200, 0.02, 0.03 + 0.02 * seg(t, 5, 19), t % 1 < 0.25 ? 0.15 : -0.15);
  to = 'm';
  for (let t = 10.0; t < 18.4; t += BEAT) bass(t, nz('D2'), 0.12 + 0.18 * seg(t, 10, 19));
  // 19.0-20.0: nothing. 20.0: the flash — the loudest moment
  sub(cu.flash, 1.0); sub(cu.flash + 0.05, 0.6); noiseHit(cu.flash, 1.6, 'lowpass', 6000, 0.6, 0.9, 0, 0.6, 400);
  chime(cu.flash, [nz('D5'), nz('A5'), nz('D6'), nz('Fs6')], 0.22);
  pad(cu.flash, 30.2, ['D4', 'A4', 'D5', 'E5'], 0.035, { att: 0.2, cut: 2600, rel: 0.6, send: 0.7 });
  drone(cu.flash, 30.2, nz('D2'), 0.06, { att: 1.0 });
  // act 3: fire — crackles thicken, a dark drone
  drone(30.0, 40.2, nz('A1'), 0.07, { att: 0.8 });
  pad(30.0, 40.2, ['D3', 'F3', 'A3'], 0.025, { cut: 700, att: 1.5, send: 0.4 });
  to = 's';
  for (let i = 0; i < 220; i++) { const t = 30.5 + ((i * 0.6180339) % 1) * 9.4, d = seg(t, 30.5, 39); if ((i * 7919) % 10 >= 3 + 7 * d) continue;
    noiseHit(t, 0.03 + (i % 5) * 0.01, 'bandpass', 1500 + (i * 397) % 3000, 2, 0.04 + 0.06 * d, ((i * 37) % 21) / 10 - 1); }
  noiseHit(34.0, 6.0, 'highpass', 3000, 0.5, 0.04, 0, 0.4);   // steam hiss
  // act 4: the blast — a long riser and growing sub pulses
  to = 'm';
  riser(40.0, 51.95, 0.07);
  drone(40.0, 52.0, nz('D1') * 2, 0.08, { att: 4.0, rel: 0.05 });
  for (let t = 40.0; t < 51.9; t += BEAT * 2) sub(t, 0.08 + 0.12 * seg(t, 40, 52));
  // act 5: hard cut — a dull rumble under the dust, then one soft chime on the end card
  noiseHit(cu.here, 5.8, 'lowpass', 220, 0.7, 0.12, 0, 0.4);
  drone(cu.here, 58.2, nz('D2'), 0.04, { att: 0.5, rel: 0.6 });
  chime(cu.coda + 0.1, [nz('D5'), nz('A5'), nz('Fs5')], 0.06);
  pad(cu.coda, 60.0, ['D3', 'A3', 'Fs4'], 0.02, { type: 'triangle', cut: 900, att: 0.4, rel: 0.5 });
