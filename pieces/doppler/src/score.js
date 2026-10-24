  // SCORE BODY — The Doppler Effect. Music = the user's track (piece.json "music"); synthesized effects only.
  // The siren in the opening is a real Doppler sweep: 767 Hz approaching, 644 Hz receding (a 700 Hz siren at 30 m/s).
  to = 's';
  const tick = (t, f, v, pan = 0) => { blip(t, f, f * 0.8, 0.035, v, pan); noiseHit(t, 0.015, 'highpass', 4000, 1, v * 0.5, pan); };
  const whoosh = (t, v, pan = 0, d = 0.45, f0 = 350, f1 = 2600) => sweep(t - d, t + 0.05, v, f0, f1, pan);
  // a two-tone siren with the Doppler shift: ratio r(t) multiplies the pitch
  function siren(t0, t1, ratio, v, panFn) {
    const step = 0.25;
    for (let t = t0; t < t1; t += step) { const hi = Math.floor((t - t0) / 0.5) % 2, f = (hi ? 820 : 700) * ratio(t + step / 2);
      blip(t, f, f, step * 0.95, v, panFn ? panFn(t) : 0); }
  }
  for (const c of window.SFX_CUES) {
    const t = c.t, pan = c.pan ?? 0, id = c.id;
    if (id === 'siren' && t < 5) siren(0.2, B0('wave'), (x) => (x < tPass() ? 343 / 313 : 343 / 373), 0.022, (x) => clamp((x - tPass()) / 3, -0.8, 0.8));
    else if (id === 'siren') siren(t, VL('end').t1, () => 343 / 313, 0.012);
    else if (id === 'pass') whoosh(t + 0.3, 0.03, 0, 0.6, 600, 1800);
    else if (id === 'pulse') blip(t, 300, 240, 0.12, 0.03, 0);
    else if (id === 'squeeze') chime(t, [1318.5, 1760], 0.03, 0.3);
    else if (id === 'stretch') chime(t, [659.25, 880], 0.03, -0.3);
    else if (id === 'ticks') { for (let i = 0; i < 10; i++) tick(t + i * 0.18, 1800, 0.016, 0.3); for (let i = 0; i < 6; i++) tick(t + 1.5 + i * 0.32, 900, 0.016, -0.3); }
    else if (id === 'num') chime(t, [1534], 0.03, 0.3);
    else if (id === 'num2') chime(t, [1288], 0.03, -0.3);
    else if (id === 'riser') riser(t, VL('pile').t1, 0.03);
    else if (id === 'hit') {   // the boom: a double sub (the N-wave's two bangs) and a wide noise body
      sub(t, 1.3); sub(t + 0.11, 0.9);
      noiseHit(t, 0.9, 'lowpass', 2200, 0.7, 0.45, 0, 0.5, 200); noiseHit(t + 0.11, 0.6, 'lowpass', 1800, 0.7, 0.3, 0, 0.4, 200);
    }
    else if (id === 'light') chime(t, [1760, 2637], 0.025, 0);
    else if (id === 'andro') chime(t, [1975.5, 2637, 3520], 0.025, 0.2);
    else if (id === 'gals') for (let i = 0; i < 16; i++) blip(t + i * 0.12, 900 - i * 30, 600 - i * 20, 0.18, 0.012, (i % 3 - 1) * 0.4);
    else if (id === 'year') chime(t, [1046.5, 1568], 0.035, 0);
    else if (id.startsWith('key')) { noiseHit(t, 0.025, 'highpass', 3200, 1, 0.12, pan); blip(t, 1500, 1200, 0.02, 0.03, pan); }
  }
