  // SCORE BODY — Troya (amphora-bf). Music = Odysseus bgm (piece.json "music"); this body is the sound effects only,
  // loud and present: bronze, crowds, oars, stone, fire, arrows. No constant noise beds (they pump in the voice's pauses).
  to = 's';
  const whoosh = (t, d, vel, f0 = 300, f1 = 3000, pan = 0) => sweep(t - d, t, vel, f0, f1, pan);
  const clang = (t, vel, pan = 0, f = 420) => {   // bronze: inharmonic partials, a sharp attack, a long ring
    [1, 2.76, 5.4, 8.93].forEach((m, i) => { const o = osc('sine', f * m, t, t + 2.2), g = ac.createGain(); env(g, t, 0.002, vel / (1 + i * 0.8), 1.8 / (1 + i * 0.5)); o.connect(g); out(g, pan, 0.5); });
    noiseHit(t, 0.04, 'highpass', 3000, 0.7, vel * 0.8, pan, 0.3);
  };
  const thud = (t, vel, pan = 0) => { sub(t, vel); noiseHit(t, 0.18, 'lowpass', 500, 0.8, vel * 0.8, pan, 0.2); };
  const crowd = (t0, dur, vel, pan = 0) => {   // a murmur swelling into a cheer: many short bandpassed noise grains
    const R = RNG('crowd', t0), n = Math.round(dur * 60);
    for (let i = 0; i < n; i++) { const u = i / n, t = t0 + u * dur + R.r(-0.05, 0.05); noiseHit(t, R.r(0.08, 0.2), 'bandpass', R.r(500, 1600), 3, vel * R.r(0.3, 1) * Math.sin(Math.PI * Math.min(1, u * 1.4)), pan + R.r(-0.6, 0.6), 0.3); }
  };
  const oars = (t0, t1, vel) => { for (let t = t0; t < t1; t += 0.98) { noiseHit(t, 0.35, 'bandpass', 700, 1.2, vel, -0.3, 0.3, 300); noiseHit(t + 0.05, 0.2, 'lowpass', 400, 0.8, vel * 0.6, 0.3, 0.2); } };
  const splash = (t, vel, pan = 0) => { noiseHit(t, 0.5, 'bandpass', 2400, 0.6, vel, pan, 0.4, 600); };
  const stone = (t, vel, pan = 0) => { noiseHit(t, 0.03, 'highpass', 1800, 0.7, vel, pan, 0.3); noiseHit(t + 0.01, 0.25, 'bandpass', 900, 1.5, vel * 0.7, pan, 0.3, 300); sub(t, vel * 0.6);
    const R = RNG('peb', t); for (let i = 0; i < 7; i++) noiseHit(t + 0.15 + R.r(0, 0.5), 0.02, 'bandpass', R.r(2000, 4500), 4, vel * 0.3, pan + R.r(-0.4, 0.4), 0.2); };
  const coin = (t, vel, pan = 0) => { blip(t, 3800, 3600, 0.06, vel, pan); blip(t + 0.03, 5200, 5000, 0.08, vel * 0.6, pan); };
  const crackleF = (t0, dur, vel, key) => { const R = RNG('fcr', key), n = Math.round(dur * 30); for (let i = 0; i < n; i++) noiseHit(t0 + R.r(0, dur), 0.015, 'highpass', 2000 + R.r(0, 3000), 0.8, vel * R.r(0.3, 1), R.r(-0.5, 0.5), 0.1); };
  const roar = (t0, dur, vel) => { noiseHit(t0, dur, 'lowpass', 700, 0.7, vel, 0, 0.4, 250); };
  const arrow = (t, vel, pan = -0.6) => { sweep(t - 0.18, t, vel, 3500, 900, pan); noiseHit(t, 0.04, 'bandpass', 1500, 2, vel * 1.2, pan + 0.5, 0.2); };
  const pen = (t, n, vel) => { const R = RNG('pen', t); for (let i = 0; i < n; i++) noiseHit(t + i * 0.05 + R.r(0, 0.02), 0.04, 'bandpass', 3500 + R.r(0, 1500), 2, vel, R.r(-0.2, 0.2), 0.1); };

  // ---- Troya: the cues, on the captions' times
  clang(0.15, 0.16, 0, 300);
  { const t = CAP('to leave'); for (let i = 0; i < 5; i++) noiseHit(t + 0.4 + i * 0.42, 0.05, 'bandpass', 900, 2, 0.05, 0.3, 0.1); }   // his steps
  // the sail: oars, a splash, the years ticking past as suns and moons
  whoosh(SUB('sail') + 0.2, 0.4, 0.1, 300, 2400, 0.2); oars(SUB('sail') + 0.2, SUBEND('sail'), 0.1); splash(SUB('sail') + 0.5, 0.12, 0.3);
  for (let i = 0; i < 13; i++) blip(SUB('sail') + 0.15 + i * 0.2, i % 2 ? 1320 : 1760, i % 2 ? 1300 : 1740, 0.07, 0.035, (i - 6) / 8);
  // the siege: an army's murmur, bronze; the walls hold
  crowd(SUB('siege'), 3.2, 0.06, 0); clang(SUB('siege') + 0.3, 0.14, -0.3, 260); thud(CAP('but its walls') + 0.2, 0.22);
  // the idea
  chime(CAP('to win') + 0.25, [523.25, 783.99], 0.05, 0.1);
  // the horse: hammering while it rises, the ladder, the army leaves
  for (let i = 0; i < 8; i++) { const t = SUB('horse') + i * 0.2; noiseHit(t, 0.04, 'bandpass', 1400, 2.5, 0.08, (i % 2 ? 0.3 : -0.3), 0.15); sub(t, 0.04); }
  for (let i = 0; i < 3; i++) noiseHit(CAP('hid his') + i * 0.55 + 0.3, 0.06, 'bandpass', 700, 2, 0.06, 0.2, 0.1);
  { const t = CAP('and ordered') + 0.4; for (let i = 0; i < 8; i++) noiseHit(t + i * 0.28, 0.05, 'lowpass', 500, 1, 0.05, 0.4, 0.1); }
  // the Trojans drag it: wood creaks, the crowd cheers
  { const t = SUB('trojans'); for (let i = 0; i < 6; i++) noiseHit(t + 0.2 + i * 0.65, 0.4, 'bandpass', 260 + i * 20, 3, 0.07, -0.1, 0.3, 120); }
  crowd(CAP('celebrated') - 0.4, 2.0, 0.1, 0);
  // night: the hush, the hatch, the ladder; the gates groan open
  chime(CAP('That night') + 0.1, [392, 587.33], 0.03, -0.3);
  noiseHit(CAP('That night') + 0.4, 0.3, 'bandpass', 400, 2, 0.08, 0.1, 0.2, 200);
  { const t = SUB('gates') + 0.2; noiseHit(t, 1.4, 'bandpass', 180, 4, 0.14, 0, 0.6, 90); thud(t + 1.4, 0.35); }
  crowd(CAP('and let') - 0.1, 2.2, 0.12, 0.3);
  // THE PAYOFF: Troy goes up in flames
  sub(HIT, 1.0); noiseHit(HIT, 1.2, 'lowpass', 3000, 0.7, 0.8, 0, 0.6, 180); clang(HIT, 0.6, 0, 196);
  roar(HIT, 6.4, 0.1); crackleF(HIT, 6.4, 0.08, 'troy');
  for (let i = 0; i < 6; i++) clang(HIT + 0.8 + i * 0.9, 0.08, (i % 2 ? 0.5 : -0.5), 380 + i * 30);
  thud(CAP('were slaughtered'), 0.3); stone(CAP('Homes were'), 0.2, -0.2); stone(CAP('were violated'), 0.18, 0.3);
  // the march; the eagle of the gods
  for (let t = SUB('march'); t < SUBEND('march'); t += 0.5) noiseHit(t, 0.06, 'lowpass', 400, 1, 0.07, 0, 0.1);
  whoosh(CAP('but the gods') + 0.6, 0.8, 0.08, 500, 4000, -0.4);
  // the priestess falls, shards
  stone(SUB('priestess') + 1.0, 0.24, 0.1); thud(SUB('priestess') + 1.1, 0.18);
  // the lie
  chime(CAP('a lie') - 0.05, [233.08, 349.23], 0.05, 0); crackleF(CAP('disguised'), 2.0, 0.06, 'lie');
  // Zeus: thunder
  { const t = CAP("Zeus's") - 0.05; noiseHit(t, 0.08, 'highpass', 2500, 0.7, 0.3, 0, 0.3); sub(t, 0.8); noiseHit(t + 0.05, 2.4, 'lowpass', 600, 0.7, 0.3, 0, 0.6, 80); }
  // the voyage: sea and oars; the name
  oars(SUB('voyage'), SUBEND('banner'), 0.08); for (let i = 0; i < 4; i++) whoosh(SUB('voyage') + 0.6 + i * 1.6, 0.6, 0.04, 800, 3000, (i % 2 ? 0.5 : -0.5));
  chime(SUB('banner') + 0.3, [392, 587.33, 783.99], 0.07, 0);
  // sign-off
  thud(SIGN_T + 0.1, 0.25); chime(SIGN_T + 0.4, [783.99, 1174.66, 1567.98], 0.07, 0); chime(SIGN_T + 1.2, [1567.98, 2349.32], 0.05, 0.2);
