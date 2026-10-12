  // SCORE BODY — reflejo (inside buildScore(); see kit/score-head.js). NO MUSIC: sound effects and room tone only.
  const T = TIMELINE, cu = T.cues, OFF = cu.lightOff, HIT = cu.sting;
  to = 's';
  // ---- own helpers (on what the head exposes: ac, noise, out, osc, env)
  // a looped noise bed through a filter, with a held level and hard edges (fade in a0..a1, out b0..b1)
  function bed(t0, t1, type, freq, q, peak, pan = 0, send = 0, rel = 0.04) {
    const src = ac.createBufferSource(); src.buffer = noise; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + 0.3);
    g.gain.setValueAtTime(peak, t1 - rel); g.gain.exponentialRampToValueAtTime(0.0001, t1);
    src.connect(f); f.connect(g); out(g, pan, send); src.start(t0, (t0 * 1.37) % 2.0); src.stop(t1 + 0.05);
    return g;
  }
  // fluorescent hum: a 100 Hz buzz (mains, not a note) — a sawtooth through a bandpass, with a slow flutter
  function hum(t0, t1, peak) {
    const o1 = osc('sawtooth', 100, t0, t1 + 0.05), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 0.8;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + 0.2);
    for (let t = t0 + 0.2; t < t1 - 0.1; t += 0.35) g.gain.linearRampToValueAtTime(peak * (0.75 + 0.25 * Math.sin(t * 9.1)), t);
    g.gain.setValueAtTime(peak, t1 - 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t1);
    o1.connect(bp); bp.connect(g); out(g, 0.15, 0);
  }
  // a hard-clipped noise impact (WaveShaper distortion), lowpassed
  function impact(t, vel) {
    const src = ac.createBufferSource(); src.buffer = noise;
    const ws = ac.createWaveShaper(), curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 9); } ws.curve = curve;
    const pre = ac.createGain(); pre.gain.setValueAtTime(1, t); pre.gain.exponentialRampToValueAtTime(0.05, t + 0.5);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.6);
    const g = ac.createGain(); env(g, t, 0.002, vel, 0.7);
    src.connect(pre); pre.connect(ws); ws.connect(lp); lp.connect(g); out(g, 0, 0.35); src.start(t, 0.4); src.stop(t + 0.9);
  }
  // ringing glass: high-Q noise bands at inharmonic frequencies (no musical pitch), long decay, spread wide
  function ring(t, dur, vel) {
    [[2870, -0.6], [4410, 0.55], [6930, -0.2], [3330, 0.3]].forEach(([fq, pan], i) => {
      const src = ac.createBufferSource(); src.buffer = noise; src.loop = true;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = 45;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel / (1 + i * 0.3), t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * (1 - i * 0.12));
      src.connect(f); f.connect(g); out(g, pan, 0.6); src.start(t, (i * 0.37) % 2); src.stop(t + dur + 0.05);
    });
  }

  // ---- room: tone (low noise bed), a very low drone as the building's air, the tube's hum — all cut dead at the light-off
  bed(0, OFF, 'lowpass', 260, 0.7, 0.012, 0, 0.1, 0.03);
  bed(0, OFF, 'bandpass', 2400, 0.6, 0.004, -0.3, 0, 0.03);   // air hiss
  drone(0, OFF + 0.02, 48, 0.01, { att: 0.3, rel: 0.03 });
  hum(0, OFF, 0.006);
  // the tube flickers before it dies: ticks and dropouts
  for (const t of [OFF - 0.5, OFF - 0.33, OFF - 0.17]) noiseHit(t, 0.02, 'highpass', 3000, 0.7, 0.06, 0.15);
  noiseHit(OFF, 0.03, 'bandpass', 1500, 1.2, 0.12, 0.15);                // the click off
  // ---- the dripping tap (right, in the room's reverb), until the smile
  for (let t = 0.55, i = 0; t < 11.3; t += 1.15 + 0.12 * ((i * 7) % 3), i++) { blip(t, 1700 - (i % 3) * 120, 420, 0.035, 0.07, 0.45); noiseHit(t + 0.01, 0.02, 'bandpass', 2600, 2, 0.03, 0.45, 0.5); }
  // ---- typewriter clicks for every subtitle glyph (soft, tiny pan wander)
  for (const s of SUBS) obTypeTimes(s.lines, s.t0).forEach((t, i) => noiseHit(t, 0.012, 'highpass', 4200 + (i % 4) * 300, 0.8, 0.045 + 0.01 * (i % 3), ((i * 37) % 9 - 4) * 0.04));
  // ---- cloth rustle: the person's hand (dry, close) and then the reflection's (softer, behind the glass, reverbed)
  const rustle = (t0, dur, vel, pan, send) => { for (let i = 0; i < 9; i++) noiseHit(t0 + i * dur / 9 + ((i * 13) % 5) * 0.006, 0.07, 'bandpass', 1700 + ((i * 7) % 5) * 380, 0.9, vel * (0.6 + 0.4 * Math.sin(i / 8 * Math.PI)), pan, send, 900); };
  rustle(cu.handUp - 0.05, 0.55, 0.16, -0.25, 0.05);
  rustle(cu.reflHand - 0.05, 0.6, 0.07, 0.3, 0.45);
  // ---- a step back on tile; then glass creaks as the palms press (gritty, stretched grains)
  noiseHit(cu.stepBack + 0.05, 0.12, 'lowpass', 350, 0.8, 0.22, -0.2, 0.2); noiseHit(cu.stepBack + 0.4, 0.1, 'lowpass', 320, 0.8, 0.16, -0.25, 0.2);
  const creak = (t0, dur, f0, f1, vel, pan) => { const n = Math.round(dur / 0.018); for (let i = 0; i < n; i++) { const u = i / n; noiseHit(t0 + i * 0.018 + ((i * 11) % 3) * 0.002, 0.016, 'bandpass', f0 * (f1 / f0) ** u, 14, vel * Math.sin(u * Math.PI) * (0.6 + 0.4 * ((i * 5) % 3) / 2), pan, 0.25); } };
  creak(cu.press + 0.25, 0.5, 700, 1150, 0.22, -0.3);
  creak(cu.press + 0.3, 0.45, 820, 1300, 0.18, 0.3);
  creak(10.9, 0.7, 600, 980, 0.2, 0.05);
  // a low unease rising under the smile (filtered noise swell, no pitch), cut at the light-off
  sweep(cu.smile, OFF - 0.02, 0.05, 120, 700, 0);
  // ---- [OFF .. HIT]: held breath — nothing at all
  // ---- the sting on the cut: sub + distorted impact + glass crack (bursts across the stereo field) + a ringing tail
  sub(HIT, 1.0);
  impact(HIT, 0.9);
  for (let i = 0; i < 14; i++) noiseHit(HIT + i * 0.017 + ((i * 7) % 4) * 0.004, 0.05, 'bandpass', 3000 + ((i * 53) % 6) * 900, 1.6, 0.55 * (1 - i / 16), ((i * 29) % 11 - 5) / 5, 0.4);
  noiseHit(HIT, 0.25, 'highpass', 2500, 0.7, 0.4, 0, 0.5);
  ring(HIT + 0.02, 2.4, 0.22);
  // after the hit: the room comes back dark and low
  bed(HIT + 0.3, LOOP_T - 0.05, 'lowpass', 140, 0.7, 0.16, 0, 0.2, 0.3);
