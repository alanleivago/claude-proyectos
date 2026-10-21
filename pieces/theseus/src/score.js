  // SCORE BODY — The Ship of Theseus. Music = the user's track (piece.json "music", shaped by audio/shape.py);
  // this body synthesizes only the sound effects (sfx bus), one per cue in window.SFX_CUES (src/scenes2.js).
  to = 's';
  const knock = (t, v, pan, f = 190) => {                       // a wood knock: a short low body + a bright click
    pluck(t, f, v, pan, 0.11, 1300, 0.12);
    noiseHit(t, 0.03, 'bandpass', 1900, 3.5, v * 0.55, pan, 0.1);
  };
  const crack = (t, v, pan, long = false) => {                    // wood splitting: crackles, a snap and a dry body
    const n = long ? 7 : 2, R = RNG('crack', t);
    for (let i = 0; i < n; i++) noiseHit(t + (long ? i * 0.055 + R.r(0, 0.02) : i * 0.018), 0.035, 'highpass', 2200 + R.r(0, 1800), 0.8, v * (0.6 + 0.4 * R.f()), pan, 0.08);
    noiseHit(t + (long ? n * 0.055 : 0.02), 0.09, 'bandpass', 850, 2.5, v * 0.8, pan, 0.15);
    pluck(t + (long ? n * 0.055 : 0.02), 140, v * 0.6, pan, 0.09, 900, 0.05);
  };
  const whoosh = (t, v, pan = 0, d = 0.4) => sweep(t - d, t + 0.05, v, 350, 2600, pan);
  for (const c of window.SFX_CUES) {
    const t = c.t, pan = c.pan ?? 0, id = c.id;
    if (id === 'tear0') crack(t, 0.22, pan, true);
    else if (id.startsWith('tear')) crack(t, 0.12, pan);
    else if (id.startsWith('swap')) knock(t, 0.16, pan, 200);
    else if (id.startsWith('land')) knock(t, 0.13, pan, 230 + (t * 37 % 40));
    else if (id.startsWith('pill')) knock(t, 0.14, pan, 330);
    else if (id === 'matter') knock(t, 0.22, pan, 150);
    else if (id === 'story') knock(t, 0.18, pan, 300);
    else if (id === 'slide' || id === 'apart' || id === 'merge') whoosh(t, 0.03, pan, 0.45);
    else if (id === 'burst') whoosh(t, 0.05, 0, 0.5);
    else if (id === 'hit') {                                      // the payoff: a sub, a wide noise body and a bright stab
      sub(t, 0.95);
      noiseHit(t, 0.6, 'lowpass', 2400, 0.7, 0.3, 0, 0.5, 300);
      [['D3', 0], ['A3', 0.004], ['D4', 0.008], ['Fs4', 0.012], ['A4', 0.016]].forEach(([n, dt], i) => pluck(t + dt, nz(n), 0.2 - i * 0.02, (i - 2) * 0.2, 0.5, 3200, 0.5));
    }
    else if (id === 'cells') {                                    // cells turning over: a shimmer of soft ticks
      chime(t, [1760, 2637], 0.035, 0.2);
      for (let i = 0; i < 18; i++) { const R = RNG('cell', i); blip(t + i * 0.28 + R.r(0, 0.12), 2200 + R.r(0, 1600), 1800, 0.03, 0.025, R.r(-0.4, 0.4)); }
    }
    else if (id === 'circle') chime(t, [1318.5, 1975.5, 2637], 0.05, -0.2);
    else if (id === 'word') { sub(t, 0.09); noiseHit(t, 0.12, 'lowpass', 500, 0.7, 0.06); }
    else if (id.startsWith('key')) { noiseHit(t, 0.025, 'highpass', 3200, 1, 0.12, pan); blip(t, 1500, 1200, 0.02, 0.03, pan); }
  }
