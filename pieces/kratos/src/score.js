  // SCORE BODY — Kratos (amphora-bf). Music = God of War Soundtrack from 0:01 (piece.json "music"); sound effects only,
  // with strong presence in every fight: blade swings, chains, impacts, armour, roars.
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
  // the vow
  thud(VW('ares', 'promise') - 0.1, 0.3); chains(VW('ares', 'kept') - 0.1, 0.8, 0.1, -0.3); roar(VW('ares', 'war') - 0.1, 1.0, 0.12, 60, 0.3);
  // the Ghost of Sparta: walks in spinning a blade, three waves of legionnaires charge and are cut down
  step(SUB('ghost') + 0.5, 8, 3.2, 0.09); for (let t = SUB('ghost') + 0.5; t < SUBEND('ghost') - 0.4; t += 0.55) whoosh(t, 0.3, 0.06, 300, 1400, -0.3);   // the spinning chain
  [VW('ghost', 'blood'), VW('ghost', 'blades'), VW('ghost', 'death')].forEach((th, i) => { charge(th - 1.3, 1.2, 0.08, 0.5); strike(th - 0.05, 1.1, 0.2); bones(th + 0.05, 0.16, 0.5); });
  // the Hydra rises, roars; he cuts off Medusa's head
  noiseHit(SUB('hydra') + 0.2, 1.6, 'lowpass', 700, 0.6, 0.12, 0.3, 0.5, 200); roar(SUB('hydra') + 0.5, 1.6, 0.26, 80, 0.4); roar(SUB('hydra') + 1.5, 1.2, 0.2, 110, 0.5);
  { const t = VW('hydra', 'medusa') - 0.2; strike(t, 1, -0.2); chime(t + 0.25, [311.13, 466.16], 0.05, -0.3); }
  // the trick: a hush and a low drone of the dark
  noiseHit(SUB('trick') + 0.2, 1.4, 'lowpass', 300, 0.6, 0.08, 0, 0.6, 120); roar(SUB('trick') + 0.4, 1.4, 0.1, 50, 0.4);
  // his family: the blades drop
  { const t = SUB('family') + 0.3; clang(t + 0.6, 0.22, -0.3, 300); clang(t + 0.72, 0.18, 0.2, 260); thud(t + 0.9, 0.25); }
  // the march across Greece
  step(SUB('hunt') + 0.2, 12, 2.6, 0.07); chains(SUB('hunt') + 0.5, 3.0, 0.03, 0);
  // Olympus comes down
  { const t = VW('olympus', 'tore') - 0.1; for (let i = 0; i < 7; i++) stone(t + 0.12 + i * 0.16, 0.22 - i * 0.02, -0.4 + i * 0.13); thud(t + 1.1, 0.4); }
  // Zeus: the bolt, the lunge, two blade strikes, the god falls
  { const t = VW('zeus', 'killed') - 0.1; thunder(t, 0.38); whoosh(SUB('zeus') + 1.6, 0.3, 0.16, 300, 3000, -0.2); chains(SUB('zeus') + 1.5, 0.6, 0.1, -0.2);
    strike(VW('zeus', 'king') - 0.05, 1, 0.1); strike(VW('zeus', 'gods') - 0.05, 1, 0.3); thud(VW('zeus', 'hands') + 0.2, 0.45); }
  // the past: a soft high chime for the ghosts
  chime(SUB('past') + 0.6, [783.99, 1174.66], 0.04, -0.3);
  // the north: wind, the arrow
  wind(SUB('north') + 0.2, 7.5, 0.04); { const t = VW('north', 'teach') - 0.1; whoosh(t + 0.25, 0.25, 0.12, 1200, 4200, 0.5); noiseHit(t + 0.4, 0.06, 'bandpass', 1600, 3, 0.1, 0.6, 0.2); }
  // battle with the troll: steps, roars, axe blows, the stone pillar
  step(SUB('question') + 0.5, 5, 2.4, 0.16); roar(SUB('question') + 1.0, 1.4, 0.26, 70, 0.4);
  [VW('question', 'battle'), VW('question', 'monsters'), VW('question', 'closer')].forEach((t, i) => { strike(t - 0.05, 1, i % 2 ? 0.3 : -0.1); stone(t + 0.25, 0.14, 0.4); });
  roar(VW('question', 'question') - 0.1, 1.0, 0.18, 60, 0.4);
  // Odin's ravens
  for (let i = 0; i < 3; i++) noiseHit(SUB('norse') + 0.6 + i * 0.9, 0.25, 'bandpass', 2200, 3, 0.07, 0.4 - i * 0.3, 0.2);
  // THE PAYOFF (in the pause before "The blood"): a deep hit, a bronze bell
  sub(HIT, 1.0); noiseHit(HIT, 1.2, 'lowpass', 3000, 0.7, 0.8, 0, 0.6, 180); clang(HIT, 0.55, 0, 147); clang(HIT + 0.02, 0.35, 0, 220);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['F4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  for (let i = 0; i < 6; i++) noiseHit(HIT + 1.0 + i * 0.35, 0.05, 'bandpass', 1400, 4, 0.08, 0.1, 0.3);   // drops
  // sign-off
  thud(SIGN_T + 0.1, 0.22); chime(SIGN_T + 0.4, [783.99, 1174.66, 1567.98], 0.07, 0); chime(SIGN_T + 1.2, [1567.98, 2349.32], 0.05, 0.2);
