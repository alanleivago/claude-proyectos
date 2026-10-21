  // SCORE BODY — The Heart in the Times Table. Music = the user's track (piece.json "music"); synthesized effects only.
  to = 's';
  const tick = (t, f, v, pan = 0) => { blip(t, f, f * 0.8, 0.035, v, pan); noiseHit(t, 0.015, 'highpass', 4000, 1, v * 0.5, pan); };
  const whoosh = (t, v, pan = 0, d = 0.45, f0 = 350, f1 = 2600) => sweep(t - d, t + 0.05, v, f0, f1, pan);
  for (const c of window.SFX_CUES) {
    const t = c.t, pan = c.pan ?? 0, id = c.id;
    if (id === 'dot') tick(t, 1100 + (t * 997 % 900), 0.016, pan);
    else if (id === 'chord') { pluck(t, 523, 0.06, 0, 0.25, 2600, 0.3); tick(t, 1600, 0.02); }
    else if (id === 'wrap') chime(t, [880, 1318.5], 0.03, 0.2);
    else if (id === 'tick') tick(t, 1500 + (t * 431 % 700), 0.012, pan);
    else if (id === 'fill') { const e = VL('fill').t1 + 0.05; riser(t, e, 0.026); for (let i = 0; i < 40; i++) tick(t + (e - t) * Math.pow(i / 40, 0.6), 1700 + i * 35, 0.011, (i % 3 - 1) * 0.4); }
    else if (id === 'hit') {
      sub(t, 1.2); sub(t + 0.09, 0.6);
      noiseHit(t, 0.8, 'lowpass', 2600, 0.7, 0.42, 0, 0.5, 300);
      [['D3', 0], ['A3', 0.004], ['D4', 0.008], ['Fs4', 0.012], ['A4', 0.016]].forEach(([n, dt], i) => pluck(t + dt, nz(n), 0.2 - i * 0.02, (i - 2) * 0.2, 0.5, 3200, 0.5));
    }
    else if (id === 'zoom') whoosh(t + 1.0, 0.025, 0, 1.0, 300, 1800);
    else if (id === 'table') { pluck(t, 392, 0.06, 0, 0.3, 2200, 0.3); chime(t + 0.04, [1318.5], 0.022, 0.1); }
    else if (id === 'melt') riser(t, t + 4.5, 0.016);
    else if (id === 'name') chime(t, [1046.5, 1568], 0.035, 0);
    else if (id === 'roll') for (let i = 0; i < 18; i++) tick(t + i * 0.16, 900 + (i % 4) * 60, 0.012, Math.sin(i * 0.6) * 0.4);
    else if (id === 'light') chime(t, [1760, 2637], 0.02, -0.3);
    else if (id === 'neph') chime(t, [1318.5, 1975.5], 0.03, 0);
    else if (id === 'move') whoosh(t + 0.6, 0.025, -0.3, 0.6, 400, 1600);
    else if (id === 'heart') chime(t, [1046.5, 1318.5, 1568], 0.04, 0);
    else if (id.startsWith('key')) { noiseHit(t, 0.025, 'highpass', 3200, 1, 0.12, pan); blip(t, 1500, 1200, 0.02, 0.03, pan); }
  }
