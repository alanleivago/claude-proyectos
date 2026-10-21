  // SCORE BODY — Rhaenyra (tapestry). Music = Odysseus bgm (piece.json "music"); this body is the sound effects only:
  // cloth slides, bells, crowds, dragon roars and wings, thunder, fire. No constant noise beds.
  to = 's';
  const whoosh = (t, d, vel, f0 = 300, f1 = 3000, pan = 0) => sweep(t - d, t, vel, f0, f1, pan);
  const cloth = (t, vel) => { noiseHit(t, 0.7, 'bandpass', 900, 0.8, vel, -0.3, 0.2, 2400); noiseHit(t + 0.1, 0.5, 'highpass', 3000, 0.7, vel * 0.5, 0.3, 0.1); };
  const thud = (t, vel, pan = 0) => { sub(t, vel); noiseHit(t, 0.18, 'lowpass', 500, 0.8, vel * 0.8, pan, 0.2); };
  const bell = (t, vel, f = 196) => { [1, 2.0, 2.76, 4.07, 5.4].forEach((m, i) => { const o = osc('sine', f * m, t, t + 4.5), g = ac.createGain(); env(g, t, 0.004, vel / (1 + i * 0.9), 3.8 / (1 + i * 0.4)); o.connect(g); out(g, 0, 0.6); }); };
  const roar = (t, d, vel, f = 90, pan = 0) => {   // a dragon: a low growling saw swept down, rough noise on top
    const o = osc('sawtooth', f * 1.6, t, t + d + 0.1); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + d);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(400, t + d);
    const g = ac.createGain(); env(g, t, 0.08, vel, d); o.connect(lp); lp.connect(g); out(g, pan, 0.5);
    noiseHit(t, d, 'bandpass', 500, 1.2, vel * 0.8, pan, 0.4, 200);
  };
  const flap = (t0, t1, vel, rate = 2.2, pan = 0) => { for (let t = t0; t < t1; t += 1 / rate) noiseHit(t, 0.22, 'lowpass', 420, 0.9, vel, pan, 0.2, 150); };
  const crowd = (t0, dur, vel, pan = 0) => { const R = RNG('crowd', t0), n = Math.round(dur * 50); for (let i = 0; i < n; i++) { const u = i / n; noiseHit(t0 + u * dur + R.r(-0.05, 0.05), R.r(0.08, 0.2), 'bandpass', R.r(500, 1500), 3, vel * R.r(0.3, 1) * Math.sin(Math.PI * Math.min(1, u * 1.3)), pan + R.r(-0.6, 0.6), 0.3); } };
  const fireBed = (t0, dur, vel) => { noiseHit(t0, dur, 'lowpass', 800, 0.7, vel, 0, 0.4, 300); const R = RNG('fcr', t0), n = Math.round(dur * 28); for (let i = 0; i < n; i++) noiseHit(t0 + R.r(0, dur), 0.015, 'highpass', 2000 + R.r(0, 3000), 0.8, vel * R.r(0.3, 1), R.r(-0.5, 0.5), 0.1); };
  const thunder = (t, vel) => { noiseHit(t, 0.05, 'highpass', 1500, 0.6, vel, 0.3, 0.4); noiseHit(t + 0.02, 2.2, 'lowpass', 300, 0.7, vel * 0.9, 0, 0.6, 80); sub(t, vel * 0.8); };
  const splash = (t, vel) => noiseHit(t, 0.8, 'bandpass', 1800, 0.6, vel, 0.2, 0.4, 500);

  // every slide of the cloth to the next panel
  TB.slice(1).forEach((t, i) => cloth(t - 0.4, 0.07));
  // the heir: a crown chime
  chime(VW('heir', 'heir') - 0.1, [523.25, 783.99, 1046.5], 0.06, 0.3);
  // the oath: swords up, then a murmur when they turn away
  thud(VW('swear', 'swear') - 0.1, 0.18); crowd(VW('swear', 'still') - 0.2, 2.4, 0.06, 0.4);
  // the king dies: a funeral bell; the crown; the cloth tears
  bell(SUB('crown') + 0.2, 0.12); chime(VW('crown', 'crown'), [659.25, 987.77], 0.05, 0.4);
  { const t = VW('crown', 'split') - 0.1; noiseHit(t, 0.6, 'bandpass', 1400, 1.2, 0.16, 0, 0.2, 400); thud(t + 0.1, 0.25); }
  // the two sides
  crowd(VW('sides', 'blacks') - 0.2, 1.4, 0.06, -0.5); crowd(VW('sides', 'greens') - 0.2, 1.4, 0.06, 0.5);
  // the sons take flight
  roar(VW('sons', 'dragons') - 0.1, 1.0, 0.14, 140, -0.2); flap(SUB('sons') + 0.4, SUBEND('sons'), 0.08, 2.4);
  // the chase in the storm
  thunder(SUB('chase') + 0.5, 0.25); flap(SUB('chase') + 0.3, SUBEND('chase'), 0.07, 1.4, -0.3);
  for (let t = SUB('chase'); t < SUBEND('chase'); t += 2.7) { const k = Math.floor(t / 2.7); if (k * 2.7 >= SUB('chase')) thunder(k * 2.7 + 0.02, 0.12); }
  roar(VW('chase', 'vhagar') - 0.2, 1.6, 0.2, 70, -0.4);
  // the bite and the fall, then a hush
  { const t = VW('fell', 'fell') - 0.15; roar(t - 0.3, 0.6, 0.22, 80, -0.3); thud(t, 0.4); whoosh(t + 1.6, 1.4, 0.1, 2400, 300, 0.3); splash(t + 1.8, 0.18); }
  // the realm burns, dragons fall
  fireBed(SUB('grief') + 0.3, 6.0, 0.06); roar(VW('grief', 'dragons'), 1.2, 0.12, 110, 0.4); thud(VW('grief', 'riders') + 0.3, 0.2);
  // vengeance: Syrax breathes fire
  roar(VW('vengeance', 'vengeance') - 0.1, 0.9, 0.16, 120, 0.3); fireBed(VW('vengeance', 'fire') - 0.2, 3.0, 0.1);
  // the loss: quiet, a gull and the waves
  noiseHit(SUB('lost') + 0.2, 4.0, 'lowpass', 600, 0.6, 0.035, 0.3, 0.4, 300);
  // THE PAYOFF (in the pause before "Now that throne"): a low bell, a sub hit, two roars, the fire
  sub(HIT, 1.0); noiseHit(HIT, 1.2, 'lowpass', 3000, 0.7, 0.8, 0, 0.6, 180); bell(HIT, 0.3, 98);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['F4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  roar(HIT + 0.4, 1.4, 0.2, 75, -0.5); roar(HIT + 1.0, 1.2, 0.18, 130, 0.5); fireBed(HIT + 0.2, VL('cost').t1 - HIT, 0.08);
  // sign-off
  thud(SIGN_T + 0.1, 0.22); chime(SIGN_T + 0.4, [783.99, 1174.66, 1567.98], 0.07, 0); chime(SIGN_T + 1.2, [1567.98, 2349.32], 0.05, 0.2);
