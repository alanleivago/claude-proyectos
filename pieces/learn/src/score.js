  // SCORE BODY — How a Machine Learns. Music = the user's track (piece.json "music", shaped by
  // styles/bitpix/tools/shape_track.py); this body synthesizes only the sound effects, one per cue in window.SFX_CUES.
  to = 's';
  const tick = (t, f, v, pan = 0) => { blip(t, f, f * 0.8, 0.035, v, pan); noiseHit(t, 0.015, 'highpass', 4000, 1, v * 0.5, pan); };
  const whoosh = (t, v, pan = 0, d = 0.45, f0 = 350, f1 = 2600) => sweep(t - d, t + 0.05, v, f0, f1, pan);
  const rev = (t, v, d = 0.6) => sweep(t, t + d, v, 3000, 300, 0);                 // a reverse sweep: the blame going back
  for (const c of window.SFX_CUES) {
    const t = c.t, pan = c.pan ?? 0, id = c.id;
    if (id.startsWith('pix')) tick(t, 1200 + (t * 977 % 900), 0.03, pan);
    else if (id === 'check' || id === 'check2') { chime(t, [1318.5, 1975.5], 0.05, 0); if (id === 'check2') chime(t + 0.08, [2637], 0.03, 0.2); }
    else if (id === 'numbers') for (let i = 0; i < 10; i++) tick(t + i * 0.05, 1800 + i * 90, 0.018, (i % 3 - 1) * 0.3);
    else if (id.startsWith('op')) tick(t, 900 + Number(id[2]) * 180, 0.045, pan);
    else if (id === 'curve') { blip(t, 500, 1100, 0.4, 0.03); }
    else if (id.startsWith('layer')) { pluck(t, 220 + Number(id[5]) * 55, 0.1, pan, 0.18, 1600, 0.2); tick(t, 1400, 0.025, pan); }
    else if (id === 'flow' || id === 'flow2') for (let i = 0; i < 9; i++) tick(t + i * 0.12, 1500 + i * 60, 0.016, (i % 3 - 1) * 0.35);
    else if (id === 'pixels') for (let i = 0; i < 24; i++) { const R = RNG('pxs', i); tick(t + R.r(0, 0.9), R.r(1800, 3600), 0.012, R.r(-0.5, 0.5)); }
    else if (id === 'flicker') for (let i = 0; i < 20; i++) { const R = RNG('flk', i); blip(t + i * 0.16, R.r(300, 1400), R.r(300, 1400), 0.05, 0.016, R.r(-0.4, 0.4)); }
    else if (id === 'says') tick(t, 700, 0.05, -0.3);
    else if (id === 'should') tick(t, 1050, 0.05, 0.3);
    else if (id === 'err') { sub(t, 0.05); noiseHit(t, 0.15, 'lowpass', 600, 0.7, 0.03); }
    else if (id === 'rise') riser(t, t + 1.4, 0.025);
    else if (id === 'step') { pluck(t, 330, 0.05, pan, 0.08, 1200, 0.15); noiseHit(t, 0.02, 'bandpass', 2500, 3, 0.02, pan); }
    else if (id === 'gd') chime(t, [880, 1318.5], 0.04, 0);
    else if (id === 'back' || id === 'back2') rev(t, id === 'back' ? 0.05 : 0.035);
    else if (id === 'y1986') tick(t, 1100, 0.04, 0);
    else if (id === 'epoch') tick(t, 1500, 0.025, pan);
    else if (id === 'count') pluck(t, 440, 0.1, 0, 0.3, 2000, 0.3);
    else if (id === 'swell') riser(t, t + 1.6, 0.02);
    else if (id === 'tokens') for (let i = 0; i < 16; i++) tick(t + i * 0.05, 2000 + i * 80, 0.012, (i % 3 - 1) * 0.4);
    else if (id === 'size') whoosh(t + 0.3, 0.03, 0, 0.5);
    else if (id === 'hit') {                                      // the payoff: a sub, a wide noise body and a bright stab
      sub(t, 1.2); sub(t + 0.09, 0.6);
      noiseHit(t, 0.8, 'lowpass', 2600, 0.7, 0.42, 0, 0.5, 300);
      [['D3', 0], ['A3', 0.004], ['D4', 0.008], ['Fs4', 0.012], ['A4', 0.016]].forEach(([n, dt], i) => pluck(t + dt, nz(n), 0.2 - i * 0.02, (i - 2) * 0.2, 0.5, 3200, 0.5));
    }
    else if (id === 'burst') whoosh(t + 0.5, 0.045, 0, 0.5, 2600, 400);
    else if (id === 'fall') for (let i = 0; i < 14; i++) { const R = RNG('fal', i); blip(t + R.r(0, 2.6), R.r(1400, 2400), R.r(500, 900), 0.12, 0.012, R.r(-0.5, 0.5)); }
    else if (id === 'unseen') tick(t, 1300 + (t * 731 % 600), 0.035, pan);
    else if (id.startsWith('key')) { noiseHit(t, 0.025, 'highpass', 3200, 1, 0.12, pan); blip(t, 1500, 1200, 0.02, 0.03, pan); }
  }
