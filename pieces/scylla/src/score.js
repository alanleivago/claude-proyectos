  // SCORE BODY — Scylla and Charybdis (amphora-bf). Music = Odysseus bgm (piece.json "music"); sound effects only,
  // with strong presence: the sea, oars, the whirlpool, Scylla's heads, bronze, the strike.
  to = 's';
  const whoosh = (t, d, vel, f0 = 300, f1 = 3000, pan = 0) => sweep(t - d, t, vel, f0, f1, pan);
  const thud = (t, vel, pan = 0) => { sub(t, vel); noiseHit(t, 0.18, 'lowpass', 500, 0.8, vel * 0.8, pan, 0.2); };
  const chains = (t, dur, vel, pan = 0) => { const R = RNG('ch', t), n = Math.round(dur * 22); for (let i = 0; i < n; i++) { const tt = t + R.r(0, dur); noiseHit(tt, 0.03, 'bandpass', R.r(2500, 5200), 6, vel * R.r(0.4, 1), pan + R.r(-0.3, 0.3), 0.25); blip(tt, R.r(3000, 4200), R.r(2600, 3800), 0.04, vel * 0.3, pan); } };
  const clang = (t, vel, pan = 0, f = 420) => { [1, 2.76, 5.4, 8.93].forEach((m, i) => { const o = osc('sine', f * m, t, t + 2.0), g = ac.createGain(); env(g, t, 0.002, vel / (1 + i * 0.8), 1.4 / (1 + i * 0.5)); o.connect(g); out(g, pan, 0.5); }); noiseHit(t, 0.05, 'highpass', 2800, 0.7, vel, pan, 0.3); };
  const roar = (t, d, vel, f = 90, pan = 0) => { const o = osc('sawtooth', f * 1.6, t, t + d + 0.1); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + d); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1500, t); lp.frequency.exponentialRampToValueAtTime(380, t + d); const g = ac.createGain(); env(g, t, 0.08, vel, d); o.connect(lp); lp.connect(g); out(g, pan, 0.5); noiseHit(t, d, 'bandpass', 500, 1.2, vel * 0.8, pan, 0.4, 200); };
  const thunder = (t, vel) => { noiseHit(t, 0.05, 'highpass', 1500, 0.6, vel, 0.3, 0.4); noiseHit(t + 0.02, 2.2, 'lowpass', 300, 0.7, vel * 0.9, 0, 0.6, 80); sub(t, vel * 0.8); };
  const step = (t0, n, rate, vel) => { for (let i = 0; i < n; i++) noiseHit(t0 + i / rate, 0.08, 'lowpass', 420, 1, vel, i % 2 ? 0.2 : -0.2, 0.1); };
  const stone = (t, vel, pan = 0) => { noiseHit(t, 0.04, 'highpass', 1800, 0.7, vel, pan, 0.3); noiseHit(t + 0.01, 0.3, 'bandpass', 800, 1.4, vel * 0.7, pan, 0.3, 250); sub(t, vel * 0.5); };
  const wind = (t0, dur, vel) => { const R = RNG('wd', t0); for (let i = 0; i < 6; i++) sweep(t0 + i * dur / 6, t0 + (i + 1.2) * dur / 6, vel * R.r(0.5, 1), R.r(300, 600), R.r(900, 1600), R.r(-0.5, 0.5)); };
  // a blade strike: the swing, the chain whipping, the hit (flesh + bone + armour), a sub thump
  const strike = (t, vel = 1, pan = 0.2) => { whoosh(t, 0.22, 0.22 * vel, 250, 4200, pan - 0.3); chains(t - 0.2, 0.35, 0.12 * vel, pan); noiseHit(t, 0.09, 'bandpass', 1100, 1.6, 0.4 * vel, pan, 0.2, 350); noiseHit(t + 0.01, 0.05, 'highpass', 2600, 0.8, 0.3 * vel, pan, 0.2); clang(t + 0.01, 0.16 * vel, pan, 520); sub(t, 0.35 * vel); };
  const bones = (t, vel, pan = 0.4) => { const R = RNG('bn', t); for (let i = 0; i < 9; i++) noiseHit(t + R.r(0, 0.45), 0.03, 'bandpass', R.r(1400, 3200), 5, vel * R.r(0.4, 1), pan + R.r(-0.2, 0.2), 0.2); thud(t + 0.5, vel * 0.8, pan); };
  const charge = (t0, d, vel, pan = 0.5) => { step(t0, Math.round(d * 6), 6, vel); const R = RNG('cg', t0); for (let i = 0; i < 6; i++) noiseHit(t0 + R.r(0, d), 0.05, 'bandpass', 2200, 4, vel * 0.6, pan, 0.2); };
  const slides = TB.slice(1); slides.forEach((t) => whoosh(t + 0.1, 0.5, 0.06, 250, 1600, 0.3));   // the frieze sliding
  // the sea under everything: slow swells; oars on the strokes while the ship is on screen
  const swell = (t0, t1, vel) => { for (let t = t0; t < t1; t += 2.6) noiseHit(t, 2.4, 'lowpass', 500, 0.7, vel, Math.sin(t) * 0.4, 1.0, 140); };
  const oars = (t0, t1, vel, rate = 1.1) => { for (let t = t0; t < t1; t += rate) { noiseHit(t, 0.35, 'bandpass', 900, 1.2, vel, -0.2, 0.25, 300); noiseHit(t + 0.05, 0.12, 'highpass', 2200, 0.8, vel * 0.5, -0.2, 0.15); thud(t + 0.02, vel * 0.25, 0.1); } };
  const vortex = (t0, d, vel) => { noiseHit(t0, d, 'lowpass', 260, 0.6, vel, 0, d * 0.4, 70); for (let i = 0; i < Math.round(d / 0.7); i++) sweep(t0 + i * 0.7, t0 + i * 0.7 + 0.9, vel * 0.5, 180, 700, Math.sin(i * 1.7) * 0.6); };
  swell(0, SUB('heads'), 0.05); swell(SUB('silence'), DURATION - 2, 0.04);
  oars(0.3, SUBEND('strait'), 0.08); oars(SUB('choice') + 0.2, SUBEND('choice'), 0.06); oars(SUB('silence') + 0.2, SUBEND('silence') + 1.5, 0.07, 1.4);
  // Charybdis drinks the sea; the far ship is dragged down
  vortex(SUB('charybdis') + 0.2, 6.5, 0.16); roar(SUB('charybdis') + 0.6, 2.2, 0.12, 45, -0.2);
  { const t = VW('charybdis', 'every') - 0.7; whoosh(t + 0.8, 1.1, 0.1, 900, 200, 0.2); stone(t + 1.8, 0.18, 0.1); thud(t + 1.95, 0.3, 0); }
  // Scylla rises: rock grinding, growls from six throats, the snap of teeth
  noiseHit(SUB('scylla') + 0.1, 1.4, 'lowpass', 600, 0.6, 0.12, 0.3, 0.5, 160); for (let i = 0; i < 5; i++) stone(SUB('scylla') + 0.2 + i * 0.25, 0.1, 0.3);
  [0, 0.4, 0.9].forEach((d, i) => roar(VW('scylla', 'heads') - 0.2 + d, 0.9, 0.14, 70 + i * 25, 0.2 + i * 0.15));
  { const t = VW('scylla', 'teeth') - 0.1; for (let i = 0; i < 3; i++) { noiseHit(t + i * 0.12, 0.04, 'highpass', 2500, 0.8, 0.24, 0.3, 0.15); thud(t + i * 0.12, 0.12, 0.3); } }
  // Circe: a soft charm, a hush on "choose one"
  step(SUB('circe') + 0.2, 4, 3, 0.06); chime(VW('circe', 'witch'), [659.25, 987.77], 0.05, 0.3); chime(VW('circe', 'choose') - 0.05, [440, 659.25], 0.06, 0);
  // the scales: wood creaks, the pans drop
  { const tS = VW('price', 'ship') - 0.1, tM = VW('price', 'men') - 0.1; thud(tS + 0.05, 0.3, -0.4); noiseHit(tS, 0.5, 'bandpass', 400, 4, 0.08, -0.3, 0.3); thud(tM + 0.05, 0.22, 0.4); noiseHit(tM, 0.6, 'bandpass', 380, 4, 0.08, 0.3, 0.3); }
  // armour: bronze straps, the helmet, the two spears
  { const t = VW('armour', 'armour') - 0.1; clang(t, 0.16, -0.1, 640); noiseHit(t + 0.15, 0.1, 'bandpass', 3200, 3, 0.1, 0, 0.1); clang(VW('armour', 'spears') - 0.05, 0.14, 0.3, 880); whoosh(VW('armour', 'spears') - 0.05, 0.3, 0.08, 400, 2600, 0.2); thud(VW('armour', 'bow'), 0.18, 0); }
  // the steer: the whirlpool loud, men gasping (short breathy bursts)
  vortex(SUB('steer') + 0.1, 4, 0.2); for (let i = 0; i < 3; i++) noiseHit(SUB('steer') + 0.5 + i * 0.4, 0.3, 'bandpass', 1300, 2, 0.06, 0.3 + i * 0.2, 0.2, 500);
  // THE STRIKE: a hush before (the music dips), six heads dive, the deck splinters, a deep hit
  [0, 0.1, 0.04, 0.14, 0.07, 0.17].forEach((d, i) => { whoosh(HIT + d, 0.25, 0.14, 2600, 300, -0.5 + i * 0.2); stone(HIT + d + 0.02, 0.2, -0.5 + i * 0.2); });
  sub(HIT, 1.0); noiseHit(HIT, 1.2, 'lowpass', 3000, 0.7, 0.8, 0, 0.6, 180); clang(HIT, 0.4, 0, 147); roar(HIT + 0.1, 1.6, 0.3, 60, 0); roar(HIT + 0.3, 1.2, 0.22, 95, 0.4);
  // the men lifted, struggling: growls, thrashing, cries far up (high breathy bursts)
  for (let i = 0; i < 6; i++) { roar(SUB('lifted') + 0.3 + i * 0.9, 0.7, 0.1, 80 + i * 12, -0.6 + i * 0.25); noiseHit(SUB('lifted') + 0.5 + i * 0.85, 0.35, 'bandpass', 1500 + i * 120, 3, 0.07, 0.6 - i * 0.2, 0.25, 600); }
  // the spear thrown at nothing
  { const t = VW('save', 'save') - 0.2; whoosh(t + 0.3, 0.4, 0.2, 300, 3600, 0.4); }
  // silence: only the oars and the sea; then a low bell for the last line
  clang(VL('pitiful').t0 + 0.2, 0.12, 0, 110);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['F4', 0.03]].forEach(([n, dt], i) => pluck(VW('pitiful', 'pitiful') + dt, nz(n), 0.16 - i * 0.02, (i - 2) * 0.2, 0.9, 2400, 0.6));
  // sign-off
  thud(SIGN_T + 0.1, 0.22); chime(SIGN_T + 0.4, [783.99, 1174.66, 1567.98], 0.07, 0); chime(SIGN_T + 1.2, [1567.98, 2349.32], 0.05, 0.2);
