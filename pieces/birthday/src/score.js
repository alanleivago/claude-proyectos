  // SCORE BODY — The Birthday Paradox. Music = the user's track (piece.json "music"); synthesized effects only.
  to = 's';
  const tick = (t, f, v, pan = 0) => { blip(t, f, f * 0.8, 0.035, v, pan); noiseHit(t, 0.015, 'highpass', 4000, 1, v * 0.5, pan); };
  const whoosh = (t, v, pan = 0, d = 0.45, f0 = 350, f1 = 2600) => sweep(t - d, t + 0.05, v, f0, f1, pan);
  for (const c of window.SFX_CUES) {
    const t = c.t, pan = c.pan ?? 0, id = c.id;
    if (id === 'dot') tick(t, 1100 + (t * 997 % 900), 0.018, pan);
    else if (id === 'hint') chime(t, [1318.5], 0.02, 0.2);
    else if (id === 'strike') noiseHit(t, 0.12, 'bandpass', 1400, 2, 0.035, 0.1);
    else if (id === 'pulse') pluck(t, 330, 0.07, 0, 0.3, 2000, 0.3);
    else if (id === 'fly') whoosh(t + 0.5, 0.03, 0, 0.5);
    else if (id === 'you') for (let i = 0; i < 8; i++) tick(t + i * 0.06, 1500 + i * 70, 0.013, -0.3 + i * 0.08);
    else if (id === 'six') chime(t, [880, 1318.5], 0.028, 0);
    else if (id === 'line') tick(t, 1400, 0.04, 0);
    else if (id === 'ten') for (let i = 0; i < 12; i++) tick(t + i * 0.07, 1300 + i * 60, 0.02, (i % 3 - 1) * 0.3);
    else if (id === 'build') { const e = VL('grow').t1 + 0.05; riser(t, e, 0.03); for (let i = 0; i < 30; i++) tick(t + (e - t) * Math.pow(i / 30, 0.7), 1600 + i * 40, 0.015, (i % 3 - 1) * 0.4); }
    else if (id === 'hit') {
      sub(t, 1.2); sub(t + 0.09, 0.6);
      noiseHit(t, 0.8, 'lowpass', 2600, 0.7, 0.42, 0, 0.5, 300);
      [['D3', 0], ['A3', 0.004], ['D4', 0.008], ['Fs4', 0.012], ['A4', 0.016]].forEach(([n, dt], i) => pluck(t + dt, nz(n), 0.2 - i * 0.02, (i - 2) * 0.2, 0.5, 3200, 0.5));
    }
    else if (id === 'collide') { noiseHit(t, 0.05, 'highpass', 2500, 1, 0.06); chime(t + 0.02, [1975.5, 2637], 0.04, 0.1); }
    else if (id === 'curve') blip(t, 300, 1400, 1.2, 0.025);
    else if (id === 'mark') chime(t, [1318.5, 1760], 0.04, 0);
    else if (id === 'rain') for (let i = 0; i < 40; i++) { const R = RNG('rain', i); tick(t + Math.pow(i / 40, 1.3) * 3.2, R.r(1600, 3200), 0.012, R.r(-0.5, 0.5)); }
    else if (id === 'result') { pluck(t, 440, 0.1, 0, 0.3, 2000, 0.3); chime(t + 0.05, [1760], 0.03); }
    else if (id === 'whistle') { const o = 2600; blip(t, o, o * 1.02, 0.35, 0.03, 0.2); blip(t + 0.4, o, o * 1.02, 0.18, 0.025, 0.2); }
    else if (id === 'players') for (let i = 0; i < 12; i++) tick(t + i * 0.08, 1000 + i * 50, 0.018, (i % 3 - 1) * 0.4);
    else if (id === 'two') chime(t, [1318.5, 1975.5], 0.04, 0);
    else if (id === 'card') { pluck(t, 520, 0.05, pan, 0.08, 2400, 0.1); tick(t, 1900, 0.02, pan); }
    else if (id === 'match2') chime(t, [1318.5, 1975.5, 2637], 0.05, 0);
    else if (id.startsWith('key')) { noiseHit(t, 0.025, 'highpass', 3200, 1, 0.12, pan); blip(t, 1500, 1200, 0.02, 0.03, pan); }
  }
