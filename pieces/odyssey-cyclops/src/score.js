  // SCORE BODY — The Cyclops (amphora-bf). Music = Odysseus bgm (piece.json "music", dipped before the strike in
  // audio/track.wav); these are the sound effects only: the giant, the flock, the stone, the fire, the stake, the sea.
  // the SFX are now real recordings (audio/sfx_pro.wav, premixed with the music into audio/track_mix.wav); this code layer is off
  to = 's';
  if (false) {
  const whoosh = (t, d, vel, f0 = 300, f1 = 3000, pan = 0) => sweep(t - d, t, vel, f0, f1, pan);
  const thud = (t, vel, pan = 0) => { sub(t, vel); noiseHit(t, 0.18, 'lowpass', 500, 0.8, vel * 0.8, pan, 0.2); };
  const giantStep = (t, vel, pan = 0) => { sub(t, vel * 0.9); noiseHit(t, 0.3, 'lowpass', 260, 0.9, vel, pan, 0.35); noiseHit(t + 0.01, 0.06, 'bandpass', 900, 1.5, vel * 0.25, pan, 0.2); };
  const steps = (t0, t1, rate, vel, pan = 0, f = giantStep) => { for (let t = t0, i = 0; t < t1; t += 1 / rate, i++) f(t, vel, pan + (i % 2 ? 0.08 : -0.08)); };
  const hoof = (t, vel, pan = 0) => { noiseHit(t, 0.03, 'bandpass', 1900, 3, vel, pan, 0.15); noiseHit(t + 0.01, 0.05, 'lowpass', 600, 1, vel * 0.6, pan, 0.1); };
  const trot = (t0, t1, vel, pan = 0) => { const R = RNG('tr', t0); for (let t = t0; t < t1; t += R.r(0.12, 0.2)) hoof(t, vel * R.r(0.6, 1), pan + R.r(-0.2, 0.2)); };
  const roar = (t, d, vel, f = 90, pan = 0) => { const o = osc('sawtooth', f * 1.6, t, t + d + 0.1); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + d); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1500, t); lp.frequency.exponentialRampToValueAtTime(380, t + d); const g = ac.createGain(); env(g, t, 0.08, vel, d); o.connect(lp); lp.connect(g); out(g, pan, 0.5); noiseHit(t, d, 'bandpass', 500, 1.2, vel * 0.8, pan, 0.4, 200); };
  // a sheep: a nasal buzz with a fast bleating tremolo
  const bleat = (t, vel, f = 520, pan = 0, d = 0.7) => { const o = osc('sawtooth', f, t, t + d + 0.05); o.frequency.linearRampToValueAtTime(f * 0.86, t + d);
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 2.2; const am = ac.createGain(); am.gain.value = 0.55;
    const lfo = osc('sine', 9 + (f % 3), t, t + d + 0.05), lg = ac.createGain(); lg.gain.value = 0.45; lfo.connect(lg); lg.connect(am.gain);
    const g = ac.createGain(); env(g, t, 0.05, vel, d); o.connect(bp); bp.connect(am); am.connect(g); out(g, pan, 0.35); };
  const flockBleats = (t0, t1, n, vel, pan = 0) => { const R = RNG('fb', t0); for (let i = 0; i < n; i++) bleat(t0 + R.r(0, t1 - t0), vel * R.r(0.6, 1), R.r(430, 640), pan + R.r(-0.4, 0.4), R.r(0.5, 0.8)); };
  // stone grinding on stone
  const grind = (t, d, vel, pan = 0) => { const R = RNG('gr', t); noiseHit(t, d, 'lowpass', 320, 0.9, vel, pan, 0.4, 180); for (let i = 0; i < d * 14; i++) noiseHit(t + R.r(0, d), R.r(0.04, 0.12), 'bandpass', R.r(500, 1400), 3, vel * R.r(0.25, 0.6), pan, 0.2); };
  const crackle = (t0, t1, vel, pan = 0) => { const R = RNG('cr', t0); for (let t = t0; t < t1; t += R.r(0.08, 0.32)) noiseHit(t, 0.012, 'highpass', R.r(2500, 6000), 0.7, vel * R.r(0.3, 1), pan + R.r(-0.15, 0.15), 0.1); noiseHit(t0, t1 - t0, 'lowpass', 400, 0.7, vel * 0.5, pan, 0.2); };
  const bones = (t, vel, pan = 0.2) => { const R = RNG('bn', t); for (let i = 0; i < 8; i++) noiseHit(t + R.r(0, 0.35), 0.025, 'bandpass', R.r(1400, 3200), 5, vel * R.r(0.4, 1), pan + R.r(-0.2, 0.2), 0.05); noiseHit(t, 0.12, 'lowpass', 700, 1, vel * 0.7, pan, 0.05); sub(t, vel * 0.6); };
  const snore = (t, vel, pan = 0.2) => { noiseHit(t, 1.3, 'bandpass', 240, 2.2, vel, pan, 0.25, 160); const o = osc('sawtooth', 58, t, t + 1.4), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; const g = ac.createGain(); env(g, t, 0.5, vel * 0.7, 0.8); o.connect(lp); lp.connect(g); out(g, pan, 0.2); noiseHit(t + 1.6, 1.0, 'bandpass', 900, 1.2, vel * 0.35, pan, 0.2, 500); };
  const snores = (t0, t1, vel, pan = 0.2) => { for (let t = t0; t < t1 - 1.2; t += 3.1) snore(t, vel, pan); };
  const sizzle = (t, d, vel, pan = 0) => { const R = RNG('sz', t); noiseHit(t, d, 'highpass', 3500, 0.6, vel, pan, 0.2); for (let i = 0; i < d * 30; i++) noiseHit(t + R.r(0, d), 0.01, 'highpass', 5000, 0.7, vel * R.r(0.5, 1.4), pan, 0.1); };
  const clang = (t, vel, pan = 0, f = 420) => { [1, 2.76, 5.4, 8.93].forEach((m, i) => { const o = osc('sine', f * m, t, t + 2.0), g = ac.createGain(); env(g, t, 0.002, vel / (1 + i * 0.8), 1.4 / (1 + i * 0.5)); o.connect(g); out(g, pan, 0.5); }); noiseHit(t, 0.05, 'highpass', 2800, 0.7, vel, pan, 0.3); };
  const swell = (t0, t1, vel) => { for (let t = t0; t < t1; t += 2.6) noiseHit(t, 2.4, 'lowpass', 500, 0.7, vel, Math.sin(t) * 0.4, 1.0, 140); };
  const oars = (t0, t1, vel, rate = 1.3) => { for (let t = t0; t < t1; t += rate) { noiseHit(t, 0.35, 'bandpass', 900, 1.2, vel, -0.2, 0.25, 300); noiseHit(t + 0.05, 0.12, 'highpass', 2200, 0.8, vel * 0.5, -0.2, 0.15); thud(t + 0.02, vel * 0.25, 0.1); } };
  const laugh = (t, vel, pan = 0.4) => { [0, 0.28, 0.55, 0.85, 1.2].forEach((d, i) => roar(t + d, 0.22, vel * (1 - i * 0.1), 110 - i * 4, pan)); };
  const fireLit = (t, vel) => { sweep(t, t + 0.6, vel, 300, 2500, 0); noiseHit(t + 0.1, 1.2, 'lowpass', 900, 0.7, vel * 0.8, 0, 0.3, 300); };
  const P = (id) => SUB(id), PE = (id) => SUBEND(id);

  // the frieze sliding from panel to panel
  TB.slice(1).forEach((t) => whoosh(t + 0.1, 0.5, 0.05, 250, 1500, 0.3));
  // the sea (open-water panels) and the oars
  [['p01', 1.3], ['p02', 1.3], ['p22', 1.0], ['p23', 1.4], ['p23b', 1.4], ['p24', 1.6], ['p24b', 1.8], ['p24c', 0]].forEach(([id, r]) => { swell(P(id), PE(id), 0.05); if (r) oars(P(id) + 0.3, PE(id), 0.06, r); });
  // the cave: the fire's crackle under every cave panel
  ['p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p21', 'p21b'].forEach((id) => crackle(P(id), PE(id), id === 'p08' ? 0 : 0.035));
  // p01: goats on the hill, far away
  flockBleats(LT('c01') + 2, LE('c03'), 4, 0.025, 0.6);
  // p03: the men climbing
  steps(P('p03') + 0.3, PE('p03'), 2.8, 0.05, 0, (t, v, p) => noiseHit(t, 0.06, 'bandpass', 700, 1.5, v, p, 0.1));
  // p04: the lambs in the pens
  flockBleats(LT('c07') + 0.5, LE('c08'), 5, 0.06, 0.3);
  // p05: the men whispering (breathy bursts); a hush on "no"
  for (let i = 0; i < 5; i++) noiseHit(LT('c09') + 0.2 + i * 0.55, 0.3, 'bandpass', 1800, 2, 0.03, -0.3, 0.2, 900);
  // p06: the flock trots in, then the giant's steps shake the cave
  trot(P('p06') + 0.2, P('p06') + 4.6, 0.07, 0.4); flockBleats(P('p06') + 0.5, P('p06') + 5, 4, 0.07, 0.4);
  steps(VW('c11', 'owner') - 0.2, VW('c11', 'owner') + 3.3, 1.4, 0.32, 0.4);
  // p07: lift, the stone grinds into the doorway, the boom of the door
  roar(VW('c13', 'picked'), 0.6, 0.07, 70, 0.4); grind(VW('c13', 'closed') + 0.1, 1.6, 0.18, 0.5); giantStep(VW('c13', 'closed') + 1.6, 0.6, 0.4); noiseHit(VW('c13', 'closed') + 1.6, 1.2, 'lowpass', 180, 0.8, 0.25, 0, 0.7);
  // p08: the fire catches; the eye
  fireLit(VW('c14', 'lit') - 0.05, 0.12); crackle(VW('c14', 'lit'), PE('p08'), 0.05);
  chime(VW('c14', 'saw') - 0.02, [196, 293.66], 0.05, 0.3); roar(VW('c14', 'saw') + 0.2, 0.9, 0.05, 55, 0.3);
  // p09: a step forward
  steps(VW('c15', 'stepped') - 0.2, VW('c15', 'stepped') + 1.6, 3, 0.05, -0.3, (t, v, p) => noiseHit(t, 0.06, 'bandpass', 800, 1.5, v, p, 0.1));
  // p10: the laugh
  laugh(VW('c17', 'laughed') - 0.1, 0.14, 0.35); laugh(VW('c17', 'stronger') + 0.5, 0.08, 0.35);
  // p11: the grab — a whoosh, a dry crunch, then another
  whoosh(VW('c18', 'grabbed'), 0.25, 0.14, 300, 2400, 0.1); bones(VW('c18', 'smashed') + 0.05, 0.22, 0.1); bones(VW('c18', 'ate') + 0.1, 0.14, 0.2); thud(VW('c18', 'floor'), 0.3, 0.1);
  // p12: milk gulped, he lies down, sleep
  for (let i = 0; i < 3; i++) noiseHit(VW('c19', 'milk') + i * 0.3, 0.18, 'lowpass', 500, 2, 0.06, 0.3, 0.1, 250);
  thud(VW('c19', 'lay') + 0.2, 0.3, 0.2); snores(VW('c19', 'sleep') + 0.3, PE('p12'), 0.05);
  // p13: the sword drawn, held; the snoring goes on
  snores(P('p13'), PE('p13'), 0.05); { const t = VW('c20', 'drew') - 0.05; sweep(t, t + 0.35, 0.07, 2500, 7000, -0.3); clang(t + 0.35, 0.05, -0.3, 900); }
  // p14: breakfast (dry), the flock out, the stone rolled back
  bones(VW('c23', 'breakfast'), 0.1, 0.3); trot(VW('c23', 'took') - 0.3, VW('c23', 'took') + 4, 0.06, 0.4); flockBleats(VW('c23', 'took'), VW('c23', 'took') + 4, 3, 0.05, 0.5);
  steps(VW('c23', 'took') + 0.9, VW('c23', 'took') + 5.5, 1.4, 0.26, 0.5); grind(VW('c23', 'rolled'), 1.6, 0.16, 0.6); giantStep(VW('c23', 'rolled') + 1.6, 0.5, 0.5);
  // p15: wood cut, the point scraped, hardened in the fire (hiss), hidden
  thud(VW('c25', 'cut'), 0.12, -0.1); for (let i = 0; i < 6; i++) noiseHit(VW('c25', 'sharpened') + i * 0.31, 0.16, 'bandpass', 2600, 3, 0.05, 0, 0.1, 1400);
  sizzle(VW('c25', 'hardened'), 1.6, 0.05, 0.1); fireLit(VW('c25', 'hardened') - 0.1, 0.06); noiseHit(VW('c25', 'hid'), 0.5, 'lowpass', 400, 1, 0.06, 0, 0.1);
  // p16: he comes home (steps), eats (dry), the bowl of wine, he drinks
  steps(P('p16') + 0.3, P('p16') + 3.4, 1.4, 0.26, 0.4); bones(VW('c26', 'ate'), 0.1, 0.3);
  chime(VW('c27', 'here') - 0.05, [1318.5, 1975.5], 0.025, -0.1); for (let i = 0; i < 4; i++) noiseHit(VW('c28', 'drank') + i * 0.25, 0.16, 'lowpass', 600, 2, 0.06, 0.3, 0.1, 300);
  // p17: NOBODY lettered (a low plucked chord), the giant's grin
  [['D3', 0], ['A3', 0.04], ['D4', 0.08]].forEach(([n, d], i) => pluck(VW('c30', 'nobody') + d, nz(n), 0.08 - i * 0.015, (i - 1) * 0.2, 0.9, 1800, 0.5));
  roar(VW('c31', 'last') - 0.1, 0.8, 0.06, 70, 0.3);
  // p18: he falls; snoring
  thud(VW('c32', 'fell') + 0.35, 0.5, 0.2); noiseHit(VW('c32', 'fell') + 0.35, 0.8, 'lowpass', 250, 0.8, 0.18, 0, 0.5); clang(VW('c32', 'drunk'), 0.03, 0.4, 1200);
  snores(VW('c32', 'snoring') + 0.2, PE('p18'), 0.07);
  // p19: THE STAKE — coals roar, the tip sizzles; the drive (whoosh), the hit (sizzle + boom + the scream); the twist
  snores(P('p19'), HIT - 1.5, 0.04); fireLit(LT('c33') + 0.3, 0.1); crackle(LT('c33'), VW('c34', 'lifted'), 0.08); sizzle(VW('c33', 'glowed') - 0.4, 1.4, 0.04, 0);
  steps(HIT - 0.45, HIT - 0.05, 9, 0.06, -0.2, (t, v, p) => noiseHit(t, 0.05, 'bandpass', 700, 1.5, v, p, 0.1)); whoosh(HIT, 0.4, 0.14, 250, 3200, -0.1);
  sub(HIT, 1.0); sub(HIT + 0.07, 0.7); noiseHit(HIT, 1.4, 'lowpass', 2600, 0.7, 0.8, 0, 0.6, 160); sizzle(HIT, 2.6, 0.16, 0.1); clang(HIT, 0.12, 0, 98);
  roar(HIT + 0.08, 2.4, 0.32, 75, 0.1); roar(HIT + 0.3, 2.0, 0.22, 110, 0.3);
  for (let i = 0; i < 8; i++) noiseHit(VW('c35', 'twisted') - 0.2 + i * 0.22, 0.2, 'bandpass', 380, 3, 0.07, 0.1, 0.2, 260);
  { const t = VW('c36', 'screamed') - 0.1; roar(t, 2.6, 0.34, 85, 0); roar(t + 0.2, 2.2, 0.26, 130, 0.3); noiseHit(t + 0.3, 3.0, 'lowpass', 220, 0.8, 0.3, 0, 0.9, 70); sub(t + 0.3, 0.6); }
  // p20: the neighbours come running and call through the stone; he roars back; they go home
  steps(P('p20') + 0.3, P('p20') + 3.6, 1.5, 0.2, -0.5); steps(P('p20') + 0.6, P('p20') + 3.9, 1.5, 0.2, 0.5);
  [['polyphemus', -0.5], ['wrong', 0.5], ['killing', -0.5]].forEach(([w, p]) => roar(VW('c37', w) - 0.05, 0.5, 0.06, 95, p));
  { const t = VW('c38', 'nobody') - 0.1; roar(t, 1.8, 0.2, 70, 0); noiseHit(t, 1.6, 'lowpass', 180, 0.8, 0.18, 0, 0.5); for (let i = 0; i < 3; i++) roar(VW('c39', 'well') + i * 0.6, 0.35, 0.04, 100 + i * 10, (i % 2 ? 0.5 : -0.5)); }
  steps(VW('c39', 'home') - 0.2, VW('c39', 'home') + 3.2, 1.5, 0.14, -0.6); steps(VW('c39', 'home'), VW('c39', 'home') + 3.4, 1.5, 0.14, 0.6);
  // p21: the stone rolled aside; the flock goes out under his hands, one by one
  grind(VW('c40', 'rolled'), 1.4, 0.12, -0.3); trot(P('p21') + 0.5, PE('p21b'), 0.05, 0.3); flockBleats(P('p21') + 1, PE('p21b'), 10, 0.05, 0.3);
  for (let i = 0; i < 4; i++) noiseHit(VW('c40', 'feeling') + i * 0.8, 0.25, 'bandpass', 3000, 1, 0.03, -0.2, 0.2, 1500);
  noiseHit(VW('c42', 'passed') - 0.1, 0.9, 'bandpass', 3200, 1, 0.05, -0.1, 0.2, 1800);
  // p22: the run to the ship, oars pulling hard
  steps(P('p22') + 0.1, P('p22') + 1.5, 6, 0.05, -0.3, (t, v, p) => noiseHit(t, 0.05, 'bandpass', 800, 1.5, v, p, 0.1)); oars(P('p22') + 1.2, PE('p22'), 0.09, 0.8);
  // p23: the ominous turn — a low bell; the shout
  clang(LT('c44') + 0.1, 0.07, 0, 98); [['D2', 0], ['A2', 0.02]].forEach(([n, d]) => pluck(LT('c44') + 0.1 + d, nz(n), 0.07, 0, 1.4, 900, 0.6));
  // p24: the hill torn off (rock cracking), the throw, the splash, the wave rocking the ship
  { const tT = VW('c49', 'tore') - 0.1, tTh = VW('c49', 'threw') - 0.05, tS = tTh + 1.15;
    for (let i = 0; i < 6; i++) noiseHit(tT + i * 0.12, 0.08, 'bandpass', 1200, 2, 0.12, -0.5, 0.3); sub(tT, 0.4); roar(tT + 0.2, 0.6, 0.12, 70, -0.5);
    roar(tTh - 0.1, 0.4, 0.16, 90, -0.5); sweep(tTh, tS, 0.14, 180, 900, 0.3);
    sub(tS, 0.9); noiseHit(tS, 1.8, 'lowpass', 2200, 0.7, 0.5, 0.3, 0.6, 300); noiseHit(tS, 0.5, 'highpass', 1500, 0.6, 0.2, 0.3, 0.3);
    noiseHit(tS + 0.4, 3.2, 'lowpass', 600, 0.6, 0.3, 0, 0.8, 120); for (let i = 0; i < 3; i++) noiseHit(tS + 0.8 + i * 0.9, 0.6, 'bandpass', 500, 2, 0.08, -0.2, 0.3, 250); }
  // p24c: Poseidon rises — a deep sea rumble under the curse, a boom on "heard"
  { const tR = VW('c53', 'or') - 0.2, tH = VW('c54', 'heard'); noiseHit(tR, tH - tR + 2, 'lowpass', 160, 0.7, 0.14, 0, 0.6, 60); drone(tR, tH + 3.5, nz('D1'), 0.05);
    for (let t = tR; t < tH; t += 1.7) sweep(t, t + 1.6, 0.05, 160, 600, Math.sin(t) * 0.5);
    sub(tH, 0.8); noiseHit(tH, 2.5, 'lowpass', 300, 0.7, 0.25, 0, 0.8, 90); clang(tH + 0.05, 0.06, 0, 73.4); }
  }
