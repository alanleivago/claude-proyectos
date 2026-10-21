  // SCORE BODY — Why Steel Ships Float. Music = the user's track (piece.json "music"); synthesized effects only.
  to = 's';
  const tick = (t, f, v, pan = 0) => { blip(t, f, f * 0.8, 0.035, v, pan); noiseHit(t, 0.015, 'highpass', 4000, 1, v * 0.5, pan); };
  const whoosh = (t, v, pan = 0, d = 0.45, f0 = 350, f1 = 2600) => sweep(t - d, t + 0.05, v, f0, f1, pan);
  const splash = (t, v, pan = 0) => { noiseHit(t, 0.5, 'bandpass', 1200, 0.8, v, pan, 0.3, 400); noiseHit(t + 0.02, 0.25, 'highpass', 3000, 0.7, v * 0.6, pan, 0.2); };
  const bubbles = (t, n, pan = 0) => { for (let i = 0; i < n; i++) { const R = RNG('bub', t, i); blip(t + R.r(0, 1.4), R.r(500, 900), R.r(1200, 1900), 0.05, 0.014, pan + R.r(-0.2, 0.2)); } };
  const clank = (t, v, pan = 0) => { pluck(t, 180 + (t * 211 % 60), v, pan, 0.18, 1800, 0.25); noiseHit(t, 0.06, 'bandpass', 2600, 4, v * 0.5, pan, 0.15); };
  for (const c of window.SFX_CUES) {
    const t = c.t, pan = c.pan ?? 0, id = c.id;
    if (id === 'splash') splash(t, 0.07, pan);
    else if (id === 'gurgle' || id === 'sink') bubbles(t, 12, pan);
    else if (id === 'lift') whoosh(t + 1.2, 0.02, 0, 1.2, 300, 1200);
    else if (id === 'push') riser(t, t + 1.4, 0.018);
    else if (id === 'arch') chime(t, [1046.5, 1568], 0.03, 0);
    else if (id === 'thud' || id === 'bottom') { sub(t, 0.18); noiseHit(t, 0.15, 'lowpass', 500, 0.7, 0.06); }
    else if (id === 'rise') whoosh(t + 0.9, 0.012, 0, 0.9, 300, 1600);
    else if (id === 'bend') { blip(t, 220, 140, 0.4, 0.018, 0); noiseHit(t, 0.3, 'bandpass', 900, 3, 0.012, 0); }
    else if (id === 'hit') {
      sub(t, 1.2); sub(t + 0.09, 0.6); splash(t, 0.12, 0);
      [['D3', 0], ['A3', 0.004], ['D4', 0.008], ['Fs4', 0.012], ['A4', 0.016]].forEach(([n, dt], i) => pluck(t + dt, nz(n), 0.2 - i * 0.02, (i - 2) * 0.2, 0.5, 3200, 0.5));
    }
    else if (id === 'draft') chime(t, [1318.5, 1760], 0.03, 0.2);
    else if (id === 'box') clank(t, t < VL('equal').t0 ? 0.11 : 0.06, pan);
    else if (id === 'scale') chime(t, [880, 1318.5], 0.03, 0);
    else if (id === 'mark') chime(t, [1318.5, 1975.5], 0.04, 0.2);
    else if (id === 'air') chime(t, [1568, 2093], 0.03, 0);
    else if (id.startsWith('key')) { noiseHit(t, 0.025, 'highpass', 3200, 1, 0.12, pan); blip(t, 1500, 1200, 0.02, 0.03, pan); }
  }
