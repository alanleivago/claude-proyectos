  // SCORE BODY — Alcibiades (amphora). Music = Odysseus bgm (piece.json "music"); this body is the sound effects only,
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

  // ---- hook: four bronze turns of the shield
  clang(VL('hook').t0 + 0.05, 0.22, 0, 380);
  FLIPS().forEach(([t], i) => { whoosh(t + 0.2, 0.25, 0.1, 400, 3000, i % 2 ? 0.3 : -0.3); clang(t + 0.18, 0.2, 0, [300, 260, 420][i]); });
  chime(VW('hook', 'welcomed') - 0.05, [523.25, 659.25, 783.99], 0.05, 0);
  // ---- Athens: Pericles, Socrates, the assembly, the fleet
  whoosh(SUB('pericles') + 0.25, 0.4, 0.08, 300, 2400, 0);
  pen(VW('pericles', 'pericles') - 0.05, 6, 0.04);
  pen(VW('socrates', "socrates'") - 0.05, 6, 0.04);
  for (let i = 0; i < 5; i++) coin(VW('socrates', 'wealthy') + i * 0.08, 0.06, 0.2);
  chime(VW('socrates', 'gorgeous'), [1568, 2093], 0.04, -0.2);
  crowd(SUB('sicily'), 1.6, 0.04, 0);
  crowd(VW('sicily', 'conquest') - 0.3, 2.2, 0.09, 0);
  thud(VW('sicily', 'sicily') - 0.05, 0.25);
  whoosh(SUB('fleet') + 0.3, 0.5, 0.1, 200, 2000, 0.3);
  oars(SUB('fleet') + 0.1, SUBEND('fleet'), 0.1); splash(VW('fleet', 'fleet') - 0.1, 0.12, 0.3);
  thud(VW('fleet', 'fleet') - 0.1, 0.3);
  // ---- the herms: a hush, then stone breaking
  noiseHit(SUB('herms') + 0.1, 1.2, 'lowpass', 600, 0.6, 0.05, 0, 0.6, 200);
  for (let i = 0; i < 3; i++) stone(VW('herms', 'smashed') - 0.05 + i * 0.28, 0.2 - i * 0.03, -0.4 + i * 0.4);
  { const t = VW('herms', 'blame') - 0.3; thud(t, 0.18); for (let i = 0; i < 6; i++) whoosh(t + 0.1 + i * 0.12, 0.15, 0.05, 600, 2400, i % 2 ? 0.6 : -0.6); }
  // ---- flight to Sparta
  whoosh(SUB('flee') + 0.3, 0.4, 0.08, 300, 2200, 0);
  pen(VW('flee', 'called') - 0.05, 14, 0.03); pen(VW('flee', 'sailed') - 0.1, 18, 0.03);
  { const t = VW('flee', 'enemy') - 0.15; thud(t, 0.18); clang(VW('flee', 'sparta') - 0.05, 0.1, 0, 220); for (let i = 0; i < 4; i++) noiseHit(t + 0.2 + i * 0.5, 0.06, 'lowpass', 300, 1, 0.12, 0, 0.2); }
  // ---- the advice on the map: arrows draw, the fort pops
  pen(VW('advice', 'syracuse') - 0.4, 22, 0.035); pen(VW('advice', 'fort') - 0.4, 16, 0.035);
  thud(VW('advice', 'fort') + 0.6, 0.25); clang(VW('advice', 'fort') + 0.6, 0.1, 0.3, 520);
  // ---- the queen: wood on a board, the king falls
  noiseHit(VW('queen', 'wife') - 0.2, 0.4, 'bandpass', 900, 1.5, 0.1, 0.3, 0.2);
  { const t = VW('queen', 'king') + 0.1; noiseHit(t + 0.45, 0.06, 'bandpass', 700, 3, 0.25, -0.3, 0.3); noiseHit(t + 0.6, 0.05, 'bandpass', 900, 3, 0.15, -0.3, 0.3); }
  // ---- Persia
  for (let i = 0; i < 4; i++) noiseHit(VW('persia', 'wanted') + i * 0.18, 0.05, 'bandpass', 800, 3, 0.14, -0.3 + i * 0.2, 0.2);
  whoosh(VW('persia', 'ran') + 0.6, 1.0, 0.12, 300, 3200, 0.5);
  chime(VW('persia', 'persia') - 0.1, [392, 587.33, 783.99], 0.06, 0.4); clang(VW('persia', 'persia') - 0.1, 0.12, 0.4, 330);
  // ---- the satrap's court: scales creak, gold jingles
  for (let i = 0; i < 4; i++) noiseHit(VW('gold', 'played') + i * 0.65, 0.3, 'bandpass', 1300, 6, 0.05, i % 2 ? 0.4 : -0.4, 0.2);
  { const t = VW('gold', 'dangled') - 0.1; for (let i = 0; i < 10; i++) coin(t + i * 0.13, 0.07, -0.3 + (i % 3) * 0.2); chime(VW('gold', 'gold'), [1318.5, 1975.5], 0.05, -0.3); }
  // ---- Athens takes him back: the crowd roars
  crowd(SUB('general') + 0.2, 1.6, 0.04, 0);
  { const t = VW('general', 'made') - 0.2; crowd(t, 3.0, 0.12, 0); clang(t + 0.2, 0.2, 0, 380); thud(t + 0.2, 0.3); }
  // ---- battle after battle, home a hero
  [VW('hero', 'battle'), VW('hero', 'after'), VW('hero', 'battle', 2)].forEach((t, i) => { thud(t, 0.3); clang(t, 0.14, -0.4 + i * 0.4, 300 + i * 60); });
  oars(SUB('hero'), SUBEND('hero'), 0.07); crowd(VW('hero', 'home') - 0.4, 2.2, 0.1, 0.3);
  chime(VW('hero', 'hero') - 0.05, [523.25, 659.25, 783.99, 1046.5], 0.06, 0);
  // ---- the fire: it catches, roars, he runs out, the arrows
  { const t = VW('fire', 'fire') - 0.3; sub(t, 0.3); roar(t, 4.2, 0.09); crackleF(t, 4.2, 0.07, 'f1'); }
  noiseHit(VW('fire', 'ran') - 0.15, 0.3, 'bandpass', 600, 1, 0.12, -0.3, 0.2);
  for (let i = 0; i < 9; i++) arrow(VW('fire', 'shot') - 0.25 + i * 0.12 + 0.35, 0.06, -0.6 + i * 0.1);
  thud(VW('fire', 'shot') + 0.35, 0.14);
  // THE PAYOFF (in the pause before "His name was"): a bronze bloom and a low hit, the loudest moment
  sub(HIT, 1.0); noiseHit(HIT, 1.2, 'lowpass', 3000, 0.7, 0.8, 0, 0.6, 180);
  clang(HIT, 0.7, 0, 196); clang(HIT + 0.02, 0.45, 0, 294);
  [['D3', 0], ['A3', 0.01], ['D4', 0.02], ['F4', 0.03], ['A4', 0.04]].forEach(([n, dt], i) => pluck(HIT + dt, nz(n), 0.22 - i * 0.02, (i - 2) * 0.2, 0.9, 3000, 0.6));
  pen(VW('name', 'alcibiades') - 0.1, 10, 0.05);
  ['switched', 'switched', 'switched'].forEach((w, i) => clang(VW('name', 'switched') + i * 0.35, 0.18, [-0.5, 0.5, 0][i], [380, 220, 300][i]));
  // ---- sign-off: the apple lands, the gold shines
  thud(SIGN_T + 0.1, 0.25); chime(SIGN_T + 0.4, [783.99, 1174.66, 1567.98], 0.07, 0); chime(SIGN_T + 1.2, [1567.98, 2349.32], 0.05, 0.2);
