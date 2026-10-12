  // SCORE BODY — ¿Qué pasaría si la Luna chocara contra la Tierra? (inside buildScore(); see kit/score-head.js)
  // NO MUSIC: ambience and sound effects only, modelled on the reference's measured structure (shotlog + spectrogram):
  //   a quiet night town (-30..-24 dB: crickets, soft sea, a dog, the bell tower) -> windows, shutters, a murmur, a car (5-16) ->
  //   the sea swelling against the quay (16-26) -> a deep rumble and enormous rock cracking (26-34) -> wind only (34-38) ->
  //   meteor whooshes with Doppler, delayed booms, car alarms, dogs, panic (38-48, the busiest) -> suction, gurgles, a siren, the roar (48-62.4) ->
  //   a held-breath VACUUM (62.42-62.98) -> THE HIT at 63.0 (the loudest) -> total silence (63.9-66) -> muffled bubbles and faint wind (66-70).
  const T = TIMELINE, cu = T.cues, HIT = cu.impact, VAC0 = 62.42, VAC1 = 62.98;
  const R = RNG('sfx-luna');
  to = 's';
  // loudness stage (mix only): fold the tail exactly as kit/score-tail.js does, measure integrated loudness (BS.1770: K-weighting,
  // 400 ms blocks, absolute + relative gates), choose the gain for -15 LUFS and a look-ahead limiter at -2.6 dBFS (true-peak headroom),
  // then hand { k, g } to the tail through normIn, so the tail applies them instead of its RMS stage (the stems reuse them and still sum to the mix)
  if (part === 'mix') { const _sr = ac.startRendering.bind(ac), TARGET = -15, CEIL = 10 ** (-2.6 / 20);
    ac.startRendering = async () => { const buf = await _sr(), c0 = buf.getChannelData(0), c1 = buf.getChannelData(1), N = Math.round(LOOP_T * sampleRate);
      const L = new Float32Array(N), Rr = new Float32Array(N);
      for (let i = 0; i < N; i++) { L[i] = c0[i] + (i + N < len ? c0[i + N] : 0); Rr[i] = c1[i] + (i + N < len ? c1[i + N] : 0); }
      const kw = (x, gain, k) => { const y = new Float32Array(N); let x1 = 0, x2 = 0, y1 = 0, y2 = 0, z1 = 0, z2 = 0;
        for (let i = 0; i < N; i++) { const v = x[i] * k * (gain ? gain[i] : 1);
          const s = 1.53512485958697 * v - 2.69169618940638 * x1 + 1.19839281085285 * x2 + 1.69065929318241 * y1 - 0.73248077421585 * y2; x2 = x1; x1 = v; y2 = y1; y1 = s;
          const h = s - 2 * z1 + z2 + 1.99004745483398 * (y[i - 1] || 0) - 0.99007225036621 * (y[i - 2] || 0); z2 = z1; z1 = s; y[i] = h; }
        return y; };
      const loud = (gain, k) => { const a = kw(L, gain, k), b = kw(Rr, gain, k), P = new Float64Array(N + 1); for (let i = 0; i < N; i++) P[i + 1] = P[i] + a[i] * a[i] + b[i] * b[i];
        const B = Math.round(0.4 * sampleRate), S = Math.round(0.1 * sampleRate), z = []; for (let i = 0; i + B <= N; i += S) z.push((P[i + B] - P[i]) / B);
        const lk = (v) => -0.691 + 10 * Math.log10(v || 1e-12), abs = z.filter((v) => lk(v) > -70), rel = lk(abs.reduce((s, v) => s + v, 0) / abs.length) - 10, gz = abs.filter((v) => lk(v) > rel);
        return lk(gz.reduce((s, v) => s + v, 0) / gz.length); };
      const limiter = (k) => { const g = new Float32Array(N); for (let i = 0; i < N; i++) { const p = Math.max(Math.abs(L[i]), Math.abs(Rr[i])) * k; g[i] = p > CEIL ? CEIL / p : 1; }
        const att = Math.exp(-1 / (0.0015 * sampleRate)), rl = Math.exp(-1 / (0.09 * sampleRate));
        for (let i = N - 2; i >= 0; i--) g[i] = Math.min(g[i], 1 - (1 - g[i + 1]) * att);
        let r = 1; for (let i = 0; i < N; i++) { r = Math.min(g[i], 1 - (1 - r) * rl); g[i] = r; } return g; };
      let k = 10 ** ((TARGET - loud(null, 1)) / 20), g = limiter(k);
      for (let it = 0; it < 2; it++) { k *= 10 ** ((TARGET - loud(g, k)) / 20); g = limiter(k); }
      normIn = { k, g };
      return buf; }; }
  // ---------- buses (ducking, the split pause, the vacuum), a room reverb and a long far echo whose returns also duck
  const mkBus = () => { const g = ac.createGain(); g.gain.value = 1; out(g, 0, 0); return g; };
  const busAmb = mkBus(), busRoar = mkBus(), busEv = mkBus(), busHit = mkBus(), busWind = mkBus();
  const room = ac.createConvolver(); room.buffer = makeImpulse(ac, 2.8, 2.3); const roomOut = ac.createGain(); roomOut.gain.value = 0.5; room.connect(roomOut); out(roomOut, 0, 0);
  const far = ac.createConvolver(); far.buffer = makeImpulse(ac, 4.5, 1.5); const farOut = ac.createGain(); farOut.gain.value = 0.55; far.connect(farOut); out(farOut, 0, 0);
  const cut = (g, t0, t1, lvl) => { g.gain.setValueAtTime(lvl, t0 - 0.06); g.gain.linearRampToValueAtTime(0.0001, t0); g.gain.setValueAtTime(0.0001, t1); };
  // the split: everything but the wind drops at 33.95 and comes back with the first fragment at 38.0
  [busAmb, busRoar, busEv].forEach((b) => { cut(b, 33.95, 38.0, 1); b.gain.linearRampToValueAtTime(1, 38.05);
    // keep the meteor rain and the retreat ~4 dB under the wave act, so the wave is the loudest act
    b.gain.setValueAtTime(1, 38.5); b.gain.linearRampToValueAtTime(0.3, 39.5); b.gain.setValueAtTime(0.3, 55.5); b.gain.linearRampToValueAtTime(1, 56.5); });
  busWind.gain.setValueAtTime(1, 38.5); busWind.gain.linearRampToValueAtTime(0.4, 39.5); busWind.gain.setValueAtTime(0.4, 55.5); busWind.gain.linearRampToValueAtTime(1, 56.5);
  busRoar.gain.linearRampToValueAtTime(1.7, 59.0); busRoar.gain.setValueAtTime(1.7, 62.2);   // the wall's roar swells over everything before the vacuum
  roomOut.gain.setValueAtTime(0.5, 33.9); roomOut.gain.linearRampToValueAtTime(0.06, 34.3); roomOut.gain.setValueAtTime(0.06, 37.95); roomOut.gain.linearRampToValueAtTime(0.5, 38.1);
  farOut.gain.setValueAtTime(0.55, 33.9); farOut.gain.linearRampToValueAtTime(0.08, 34.6); farOut.gain.setValueAtTime(0.08, 37.95); farOut.gain.linearRampToValueAtTime(0.55, 38.1);
  // the vacuum: every bus and both returns to nothing
  [busAmb, busRoar, busEv, busWind].forEach((b) => cut(b, VAC0, VAC1, 1)); cut(roomOut, VAC0, VAC1, 0.5); cut(farOut, VAC0, VAC1, 0.55);
  roomOut.gain.setValueAtTime(0.0001, HIT); roomOut.gain.linearRampToValueAtTime(0.22, HIT + 0.03); roomOut.gain.setValueAtTime(0.22, 63.4); roomOut.gain.linearRampToValueAtTime(0.0001, 63.8);
  busEv.gain.setValueAtTime(1, 65.9); busWind.gain.setValueAtTime(1, 65.9); roomOut.gain.setValueAtTime(0.25, 65.9);
  let BUS = busAmb;
  const emit = (node, pan = 0, send = 0, farSend = 0) => { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); node.connect(p); p.connect(BUS);
    if (send) { const s = ac.createGain(); s.gain.value = send; node.connect(s); s.connect(room); } if (farSend) { const s = ac.createGain(); s.gain.value = farSend; node.connect(s); s.connect(far); } return p; };
  // ---------- sources
  const nzL = makeNoise(ac, 11);
  const brown = (() => { const b = ac.createBuffer(1, 11 * ac.sampleRate, ac.sampleRate), d = b.getChannelData(0), Rb = RNG('brown'); let v = 0;
    for (let i = 0; i < d.length; i++) { v = (v + (Rb.f() * 2 - 1) * 0.02) * 0.998; d[i] = v * 3.5; } return b; })();
  const pink = (() => { const b = ac.createBuffer(1, 11 * ac.sampleRate, ac.sampleRate), d = b.getChannelData(0), Rp = RNG('pink'); let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < d.length; i++) { const w = Rp.f() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; } return b; })();
  const auto = (p, pts) => { p.setValueAtTime(pts[0][1], Math.max(0, pts[0][0])); for (let i = 1; i < pts.length; i++) p.linearRampToValueAtTime(pts[i][1], pts[i][0]); };
  const autoX = (p, pts) => { p.setValueAtTime(Math.max(1e-4, pts[0][1]), Math.max(0, pts[0][0])); for (let i = 1; i < pts.length; i++) p.exponentialRampToValueAtTime(Math.max(1e-4, pts[i][1]), pts[i][0]); };
  const filt = (type, f, q = 0.7) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const loopSrc = (buf, t0, t1, rate = 1) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate; s.start(t0, (t0 * 1.37 + rate * 5.1) % 9); s.stop(t1 + 0.05); return s; };
  const flutter = (t0, t1, step, lo, hi, key) => { const Rf = RNG('fl', key), pts = []; for (let t = t0; t <= t1 + 1e-6; t += step * Rf.r(0.6, 1.4)) pts.push([t, Rf.r(lo, hi)]); return pts; };
  function bed(t0, t1, o) {
    const pans = o.wide ? [-o.wide, o.wide] : [o.pan ?? 0];
    pans.forEach((pn, k) => {
      const s = loopSrc(o.buf || nzL, t0, t1, 1 + k * 0.071 + (o.rate || 0)), f = filt(o.type || 'lowpass', 1000, o.q ?? 0.7); autoX(f.frequency, typeof o.f === 'number' ? [[t0, o.f]] : o.f);
      let last = f; s.connect(f);
      if (o.f2) { const f2 = filt(o.type2 || 'lowpass', 1000, o.q2 ?? 0.7); autoX(f2.frequency, typeof o.f2 === 'number' ? [[t0, o.f2]] : o.f2); f.connect(f2); last = f2; }
      const g = ac.createGain(); g.gain.value = 0; auto(g.gain, o.g.map(([t, v]) => [t, v / pans.length ** 0.5])); last.connect(g); let tail = g;
      if (o.flut) { const m = ac.createGain(); m.gain.value = 0; auto(m.gain, flutter(t0, t1, o.flut[0], o.flut[1], o.flut[2], (o.key || 'b') + k)); g.connect(m); tail = m; }
      emit(tail, pn, o.send || 0, o.farS || 0);
    });
  }
  const tone = (t0, t1, type, fPts, gPts, o = {}) => { const ob = ac.createOscillator(); ob.type = type; auto(ob.frequency, fPts); const g = ac.createGain(); g.gain.value = 0; auto(g.gain, gPts);
    let last = ob; if (o.lp) { const l = filt('lowpass', 1000, o.q ?? 0.7); if (Array.isArray(o.lp)) autoX(l.frequency, o.lp); else l.frequency.value = o.lp; ob.connect(l); last = l; }
    last.connect(g); emit(g, o.pan ?? 0, o.send || 0, o.farS || 0); ob.start(t0); ob.stop(t1 + 0.05); return ob; };
  const lfo = (target, t0, t1, rate, depth, type = 'sine') => { const l = ac.createOscillator(); l.type = type; l.frequency.value = rate; const g = ac.createGain(); g.gain.value = depth; l.connect(g); g.connect(target); l.start(t0); l.stop(t1 + 0.05); };
  const envG = (t, a, peak, d) => { const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(2e-4, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return g; };
  function hit(t, dur, type, f, q, vel, pan = 0, send = 0, sweepTo = 0, buf = nzL, farS = 0) {
    const s = ac.createBufferSource(); s.buffer = buf; const fl = filt(type, f, q); if (sweepTo) fl.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = envG(t, Math.min(0.004, dur * 0.3), vel, dur); s.connect(fl); fl.connect(g); emit(g, pan, send, farS); s.start(t, (t * 7.31) % 9); s.stop(t + dur + 0.05);
  }
  function plop(t, f0, f1, d, vel, pan, send = 0.1) { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); const g = envG(t, 0.002, vel, d); o.connect(g); emit(g, pan, send); o.start(t); o.stop(t + d + 0.05); }
  function doppler(tc, dur, v, D, n = 96) { const fr = new Float32Array(n), gn = new Float32Array(n), pn = new Float32Array(n);
    for (let i = 0; i < n; i++) { const tt = tc - dur / 2 + dur * i / (n - 1), s = (tt - tc) * v, d = Math.hypot(s, D), vr = v * s / d; fr[i] = 343 / (343 + vr); gn[i] = D / d; pn[i] = clamp(s / d, -0.95, 0.95); } return { fr, gn, pn, t0: tc - dur / 2 }; }
  function carPass(tc, dur, f, vel, dirSign = 1, D = 30, v = 14) {
    const dp = doppler(tc, dur, v, D), t0 = dp.t0; if (dirSign < 0) dp.pn.reverse();
    const p = ac.createStereoPanner(); p.pan.setValueCurveAtTime(dp.pn, t0, dur); const g = ac.createGain(); g.gain.value = 0; g.gain.setValueCurveAtTime(dp.gn.map((x) => x * vel), t0, dur);
    [1, 2, 3.02].forEach((h, k) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueCurveAtTime(dp.fr.map((x) => x * f * h), t0, dur); const lp = filt('lowpass', 500 + k * 200, 1); const gg = ac.createGain(); gg.gain.value = 0.5 / (k + 1); o.connect(lp); lp.connect(gg); gg.connect(g); o.start(t0); o.stop(t0 + dur + 0.05); });
    const s = loopSrc(nzL, t0, t0 + dur); const bp = filt('bandpass', 900, 0.8); const gt = ac.createGain(); gt.gain.value = 0.7; s.connect(bp); bp.connect(gt); gt.connect(g);
    g.connect(p); p.connect(BUS); const sg = ac.createGain(); sg.gain.value = 0.25; g.connect(sg); sg.connect(far);
  }
  // a field cricket: trains of 3-4 pulses at ~4.5 kHz, a chirp every 0.5-0.9 s
  function cricket(t0, t1, f, pan, vel, fadeAt = 1e9) {
    const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = ac.createGain(); g.gain.value = 0; const Rc = RNG('cr', f);
    for (let t = t0; t < t1; t += Rc.r(0.5, 0.9)) { const v = vel * (t > fadeAt ? Math.max(0, 1 - (t - fadeAt) / 4) : 1) * Rc.r(0.7, 1); if (v <= 0.0005) continue; const n = 3 + (Rc.f() < 0.4 ? 1 : 0);
      for (let k = 0; k < n; k++) { const tp = t + k * 0.045; g.gain.setValueAtTime(0, tp); g.gain.linearRampToValueAtTime(v, tp + 0.006); g.gain.linearRampToValueAtTime(v * 0.6, tp + 0.02); g.gain.linearRampToValueAtTime(0, tp + 0.03); } }
    const am = ac.createGain(); am.gain.value = 0.7; lfo(am.gain, t0, t1, f / 9, 0.3); o.connect(am); am.connect(g); emit(g, pan, 0.25, 0.1); o.start(t0); o.stop(t1 + 0.05);
  }
  function bark(t, vel, pan, farS = 0.3) { for (let k = 0; k < 2; k++) { const t0 = t + k * 0.18, o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t0); o.frequency.exponentialRampToValueAtTime(330, t0 + 0.11);
    const b1 = filt('bandpass', 900, 4), b2 = filt('bandpass', 1900, 5), g = envG(t0, 0.008, vel, 0.11); o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g); emit(g, pan, 0.3, farS); o.start(t0); o.stop(t0 + 0.16); hit(t0, 0.06, 'bandpass', 1500, 1, vel * 0.4, pan, 0.2); } }
  // the bell tower: one heavy inharmonic strike, far away
  function bellStrike(t, vel, pan) { [[1, 1, 3.4], [2.1, 0.5, 2.2], [2.94, 0.35, 1.6], [4.2, 0.2, 1.0], [0.5, 0.45, 4.0], [5.4, 0.1, 0.6]].forEach(([m, a, d]) => { const o = ac.createOscillator(); o.frequency.value = 196 * m; const g = envG(t, 0.004, vel * a, d); o.connect(g); emit(g, pan, 0.35, 0.6); o.start(t); o.stop(t + d + 0.1); }); hit(t, 0.04, 'bandpass', 1800, 2, vel * 0.4, pan, 0.3, 0, nzL, 0.4); }
  function creak(t, vel, pan, d = 0.9) {
    const f = R.r(70, 130), o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * R.r(0.8, 1.3), t + d); lfo(o.frequency, t, t + d, R.r(17, 31), f * 0.25);
    const bp = filt('bandpass', R.r(700, 1100), 5); bp.frequency.linearRampToValueAtTime(R.r(900, 1600), t + d);
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + d * 0.25); g.gain.linearRampToValueAtTime(vel * 0.6, t + d * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + d);
    o.connect(bp); bp.connect(g); emit(g, pan, 0.3); o.start(t); o.stop(t + d + 0.05);
  }
  function knock(t, vel, pan) { plop(t, 190, 110, 0.09, vel, pan, 0.2); hit(t, 0.05, 'bandpass', 700, 2, vel * 0.5, pan, 0.2); }
  function shutter(t, vel, pan) { creak(t, vel * 0.6, pan, R.r(0.25, 0.5)); const tc = t + R.r(0.3, 0.55); hit(tc, 0.05, 'bandpass', R.r(900, 1500), 3, vel, pan, 0.35); plop(tc, 240, 120, 0.06, vel * 0.6, pan, 0.3); if (R.f() < 0.5) hit(tc + 0.09, 0.03, 'bandpass', 2400, 3, vel * 0.4, pan, 0.3); }
  function slurp(t, d, vel, pan) { const s = ac.createBufferSource(); s.buffer = nzL; const bp = filt('bandpass', 250, 6); bp.frequency.exponentialRampToValueAtTime(R.r(900, 1600), t + d); const g = envG(t, d * 0.6, vel, d * 0.4); s.connect(bp); bp.connect(g); emit(g, pan, 0.2); s.start(t, R.r(0, 8)); s.stop(t + d + 0.05); }
  function groan(t, d, vel, pan) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(R.r(38, 60), t); o.frequency.linearRampToValueAtTime(R.r(26, 44), t + d); lfo(o.frequency, t, t + d, R.r(2, 6), 5);
    const bp = filt('bandpass', R.r(200, 500), 5), g = ac.createGain(); g.gain.value = 0; auto(g.gain, [[t, 0], [t + d * 0.3, vel], [t + d, 0]]); o.connect(bp); bp.connect(g); emit(g, pan, 0.3, 0.7); o.start(t); o.stop(t + d + 0.05); }
  // enormous distant rock cracking: a low thump and a cluster of dry splits through the far echo
  function rockCrack(t, vel, pan) { tone(t, t + 0.9, 'sine', [[t, 70], [t + 0.9, 28]], [[t, vel * 0.9], [t + 0.9, 0]], { pan, farS: 0.5 });
    for (let k = 0; k < 7 + Math.floor(R.f() * 8); k++) { const tk = t + R.r(0, 0.35) + k * 0.012; hit(tk, R.r(0.03, 0.12), 'bandpass', R.r(250, 1400), 1.5, vel * R.r(0.3, 0.8), pan + R.n(0.1), 0.2, 0, nzL, 0.6); }
    hit(t, 1.6, 'lowpass', 300, 0.7, vel * 0.5, pan, 0.2, 90, brown, 0.6); }
  // a burning fragment overhead: a roaring hiss that falls in pitch as it passes (Doppler), panned across
  function whoosh(t0, dur, vel, p0, p1) { const s = loopSrc(nzL, t0, t0 + dur), bp = filt('bandpass', 2600, 1.4), lp = filt('lowpass', 6000), g = ac.createGain(); g.gain.value = 0;
    autoX(bp.frequency, [[t0, 3200], [t0 + dur * 0.55, 1800], [t0 + dur, 420]]); autoX(lp.frequency, [[t0, 5000], [t0 + dur, 1200]]);
    auto(g.gain, [[t0, 0], [t0 + dur * 0.55, vel], [t0 + dur * 0.9, vel * 0.5], [t0 + dur, 0]]);
    const p = ac.createStereoPanner(); auto(p.pan, [[t0, p0], [t0 + dur, p1]]); s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(p); p.connect(BUS);
    const sg = ac.createGain(); sg.gain.value = 0.35; g.connect(sg); sg.connect(far);
    const rm = loopSrc(brown, t0, t0 + dur), rl = filt('lowpass', 180), rg = ac.createGain(); rg.gain.value = 0; auto(rg.gain, [[t0, 0], [t0 + dur * 0.6, vel * 1.6], [t0 + dur, 0]]); rm.connect(rl); rl.connect(rg); rg.connect(p); }
  function boom(t, vel, pan) { tone(t, t + 2.2, 'sine', [[t, 55], [t + 2.2, 22]], [[t, vel], [t + 0.15, vel * 0.7], [t + 2.2, 0]], { pan, farS: 0.6 });
    hit(t, 2.4, 'lowpass', 700, 0.7, vel * 0.8, pan, 0.2, 80, brown, 0.8); hit(t + 0.03, 0.6, 'lowpass', 2200, 0.5, vel * 0.3, pan, 0.1, 300, pink, 0.6); }
  function alarm(t0, t1, pan, vel, kind) { const o = ac.createOscillator(); o.type = 'square'; const lp = filt('lowpass', 2400), g = ac.createGain(); g.gain.value = 0; auto(g.gain, [[t0, 0], [t0 + 0.05, vel], [t1 - 0.1, vel], [t1, 0]]);
    if (kind === 0) for (let t = t0; t < t1; t += 0.5) { o.frequency.setValueAtTime(780, t); o.frequency.setValueAtTime(1040, t + 0.25); }
    else for (let t = t0; t < t1; t += 0.36) { o.frequency.setValueAtTime(600, t); o.frequency.linearRampToValueAtTime(1300, t + 0.34); }
    o.connect(lp); lp.connect(g); emit(g, pan, 0.25, 0.7); o.start(t0); o.stop(t1 + 0.05); }
  function scream(t, d, vel, pan, cutF, f0 = 600) {
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * 0.8, t); o.frequency.linearRampToValueAtTime(f0 * 1.15, t + d * 0.3); o.frequency.linearRampToValueAtTime(f0 * 0.75, t + d); lfo(o.frequency, t, t + d, R.r(5, 7), f0 * 0.03);
    const mix = ac.createGain(); [[R.r(800, 950), 7, 1], [R.r(1250, 1450), 9, 0.6], [2700, 10, 0.3]].forEach(([ff, q, a]) => { const bp = filt('bandpass', ff, q), ga = ac.createGain(); ga.gain.value = a; o.connect(bp); bp.connect(ga); ga.connect(mix); });
    const lp = filt('lowpass', cutF), g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.12); g.gain.linearRampToValueAtTime(vel * 0.7, t + d * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + d);
    mix.connect(lp); lp.connect(g); emit(g, pan, 0.2, 0.6); o.start(t); o.stop(t + d + 0.05);
  }
  function siren(t0, t1, gPts, cutPts, pan, period = 6.6, lo = 430, hi = 980) {
    const g = ac.createGain(); g.gain.value = 0; auto(g.gain, gPts); const lp = filt('lowpass', 1000, 1.1); autoX(lp.frequency, cutPts);
    [[0, 'sawtooth', 1], [9, 'square', 0.3], [-6, 'sawtooth', 0.5]].forEach(([det, type, a]) => { const o = ac.createOscillator(); o.type = type; o.detune.value = det;
      o.frequency.setValueAtTime(lo * 0.7, t0); o.frequency.linearRampToValueAtTime(lo, t0 + 1.0);
      for (let t = t0 + 1.0; t < t1; t += period) { o.frequency.setValueAtTime(lo, t); o.frequency.linearRampToValueAtTime(hi, t + period * 0.38); o.frequency.setValueAtTime(hi, t + period * 0.52); o.frequency.linearRampToValueAtTime(lo, t + period * 0.97); }
      const ga = ac.createGain(); ga.gain.value = a; o.connect(ga); ga.connect(lp); o.start(t0); o.stop(t1 + 0.05); });
    lp.connect(g); emit(g, pan, 0.25, 0.9);
  }
  function tink(t, vel, pan) { const o = ac.createOscillator(); o.frequency.value = R.r(2600, 7000); const g = envG(t, 0.002, vel, R.r(0.05, 0.25)); o.connect(g); emit(g, pan, 0.3); o.start(t); o.stop(t + 0.35); hit(t, 0.015, 'highpass', 5000, 0.7, vel * 0.6, pan, 0.2); }

  // ================= WIND (its own bus: it is the only thing left in the split pause)
  BUS = busWind;
  bed(0, 62.42, { type: 'bandpass', f: [[0, 380], [5, 420], [16, 520], [34, 480], [38, 600], [48, 800], [56, 1000], [62.4, 1300]], q: 0.8, g: [[0, 0], [1.5, 0.026], [5, 0.032], [16, 0.038], [33.9, 0.035], [34.2, 0.03], [37.9, 0.034], [48, 0.04], [62.4, 0.07]], wide: 0.8, flut: [0.9, 0.35, 1.5], key: 'wind', send: 0.12 });
  bed(34, 38.1, { type: 'highpass', f: 2600, q: 0.5, g: [[34, 0], [34.6, 0.006], [37.6, 0.007], [38.1, 0]], wide: 0.9, flut: [0.6, 0.4, 1.4], key: 'hiss' });
  for (let k = 0; k < 6; k++) { const t = 6 + k * 4.3 + R.r(0, 1.2); bed(t, t + 3, { type: 'bandpass', f: [[t, 300], [t + 1.4, 800], [t + 3, 350]], q: 1, g: [[t, 0], [t + 1.4, 0.012], [t + 3, 0]], pan: k % 2 ? 0.6 : -0.6, key: 'gust' + k }); }
  // ================= 1. THE SLEEPING TOWN (0-5) and its night until the cracks
  BUS = busAmb;
  [[4650, -0.6, 0.012], [4400, 0.5, 0.009], [4900, -0.2, 0.006], [4200, 0.8, 0.007]].forEach(([f, p, v], i) => cricket(0.1 + i * 0.13, 33.9, f, p, v * 2.2, 24 + i));
  bed(0, 48.6, { f: [[0, 450], [16, 520], [26, 800], [48, 700]], g: [[0, 0], [0.6, 0.06], [16, 0.065], [26, 0.08], [46, 0.07], [48.6, 0.02]], wide: 0.6, flut: [0.4, 0.35, 1.4], key: 'sea', send: 0.15 });   // the sea below the quay
  for (let t = 0.4; t < 16; t += R.r(0.8, 1.8)) hit(t, R.r(0.4, 0.8), 'lowpass', R.r(400, 700), 1, 0.02, R.r(-0.6, 0.6), 0.2, 180);   // soft laps
  bark(1.7, 0.02, -0.7, 0.6); bark(2.4, 0.016, -0.7, 0.6); bark(9.9, 0.014, 0.6, 0.6); bark(10.4, 0.012, 0.6, 0.6);
  bellStrike(0.9, 0.05, -0.35); bellStrike(3.6, 0.045, -0.35);
  // ================= 2. THE MOON IS FALLING (5-16): windows and shutters, a murmur growing, a car
  BUS = busEv;
  for (let k = 0; k < 13; k++) shutter(5.8 + k * 0.78 + R.r(0, 0.4), 0.03 * R.r(0.6, 1.1), R.r(-0.8, 0.8));
  hit(7.2, 0.12, 'lowpass', 500, 1, 0.03, 0.3, 0.3); hit(12.8, 0.12, 'lowpass', 450, 1, 0.025, -0.4, 0.3);   // doors
  BUS = busAmb;
  bed(6.5, 33.95, { type: 'bandpass', f: 520, q: 1.5, f2: 1800, g: [[6.5, 0], [9, 0.014], [16, 0.03], [26, 0.032], [33.9, 0.034]], wide: 0.9, flut: [0.25, 0.3, 1.6], key: 'murmur', send: 0.3, farS: 0.2 });
  for (let k = 0; k < 18; k++) { const t = R.r(8, 33); hit(t, R.r(0.2, 0.5), 'bandpass', R.r(700, 1100), 3, 0.006 + 0.006 * seg(t, 8, 30), R.r(-0.8, 0.8), 0.4); }
  carPass(11.3, 5.4, 78, 0.05, 1, 25);
  // the town waking (5-16): TV/radio voices through open windows (speech-like formant noise, no music), neighbours calling,
  // more shutters, dogs answering each other, footsteps on cobbles, a moped, gusts
  [[-0.55, 'tvA', 5.3], [0.6, 'tvB', 6.4], [-0.15, 'tvC', 8.6]].forEach(([p, k, t0]) => bed(t0, 33.9, { type: 'bandpass', f: 900, q: 1.1, f2: 2600, type2: 'lowpass', g: [[t0, 0], [t0 + 0.6, 0.09], [16, 0.09], [26, 0.04], [33.9, 0.025]], pan: p, flut: [0.11, 0.05, 1.7], key: k, send: 0.35 }));
  for (let k = 0; k < 20; k++) { const t = R.r(5.3, 16.5); scream(t, R.r(0.25, 0.6), 0.035 * R.r(0.6, 1), R.r(-0.85, 0.85), 1600, R.r(210, 330)); }
  BUS = busEv;
  for (let k = 0; k < 16; k++) shutter(5.3 + k * 0.66 + R.r(0, 0.4), 0.06 * R.r(0.6, 1.1), R.r(-0.9, 0.9));
  for (let t = 7.5; t < 16.5; t += R.r(0.28, 0.42)) hit(t, 0.04, 'bandpass', R.r(1800, 2600), 2, 0.016, -0.2 + 0.4 * seg(t, 7.5, 16.5), 0.15);
  BUS = busAmb;
  [[6.4, -0.7], [6.9, -0.7], [7.8, 0.8], [8.3, 0.8], [11.6, -0.4], [12.1, -0.4], [13.9, 0.5], [14.5, 0.2], [15.2, -0.6]].forEach(([t, p]) => bark(t, 0.03, p, 0.5));
  carPass(15.0, 3.6, 140, 0.03, -1, 30, 12);
  bed(5, 16.5, { type: 'bandpass', f: [[5, 350], [11, 600], [16.5, 450]], q: 0.9, g: [[5, 0], [5.8, 0.07], [14, 0.07], [16.5, 0.03]], wide: 0.85, flut: [0.7, 0.4, 1.5], key: 'wakewind', send: 0.1 });
  // ================= 3. THE TIDE (16-26): the sea swelling, slaps on the wall, hulls, mooring ropes
  bed(15.5, 48.6, { buf: brown, f: [[15.5, 120], [24, 260], [48, 220]], g: [[15.5, 0], [22, 0.06], [26, 0.075], [46, 0.07], [48.6, 0]], wide: 0.5, flut: [0.7, 0.6, 1.3], key: 'swell' });
  for (let t = 16.2; t < 27; t += R.r(0.35, 0.9)) { const v = 0.03 + 0.03 * seg(t, 16, 23), p = R.r(-0.7, 0.7); hit(t, R.r(0.15, 0.35), 'lowpass', R.r(900, 1600), 1.2, v, p, 0.25, 260); hit(t + 0.02, 0.5, 'bandpass', 2400, 0.8, v * 0.4, p, 0.2); plop(t + R.r(0.05, 0.2), R.r(400, 800), 220, 0.06, v * 0.3, p); }
  for (let t = 16.5; t < 31; t += R.r(0.7, 1.5)) knock(t, 0.026, R.r(-0.6, 0.6));
  for (let k = 0; k < 14; k++) creak(R.r(17, 32), 0.022, R.r(-0.7, 0.7), R.r(0.6, 1.3));
  for (let t = 22; t < 33; t += R.r(0.15, 0.4)) { const f0 = R.r(200, 500); plop(t, f0, f0 * R.r(1.6, 2.4), R.r(0.04, 0.08), 0.012, R.r(-0.7, 0.7)); }   // water over the quay
  // ================= 4. THE CRACKS (26-34): a deep rumble, enormous rock cracking and groaning far away
  BUS = busRoar;
  bed(25.5, 62.42, { buf: brown, f: [[25.5, 50], [33.9, 110], [38, 120], [48, 180], [56, 380], [62.4, 600]], g: [[25.5, 0], [30, 0.07], [33.9, 0.11], [38, 0.075], [48, 0.09], [56, 0.13], [62.4, 0.3]], wide: 0.5, flut: [1.1, 0.75, 1.15], key: 'rumble' });
  const rmb = tone(26, 62.42, 'sine', [[26, 28], [48, 33], [62.4, 38]], [[26, 0], [30, 0.03], [33.9, 0.045], [40, 0.035], [56, 0.04], [62.4, 0.055]]); lfo(rmb.frequency, 26, 62.42, 0.31, 2.5);
  tone(26, 62.42, 'triangle', [[26, 44], [62.4, 52]], [[26, 0], [32, 0.025], [62.4, 0.05]], { lp: 120, pan: 0.15 });
  for (let k = 0; k < 16; k++) { const t = 26.4 + 7.3 * Math.pow(k / 16, 0.8) + R.r(0, 0.3); rockCrack(t, 0.05 + 0.06 * seg(t, 26, 33.8), R.r(-0.4, 0.5)); }
  for (let k = 0; k < 7; k++) groan(26.8 + k * 1.0 + R.r(0, 0.5), R.r(1.4, 2.6), 0.035 + 0.01 * k, R.r(-0.4, 0.4));
  // ================= 6. THE FRAGMENTS (38-48): whooshes with Doppler, delayed booms, alarms, dogs, panic, fire
  BUS = busEv;
  meteorList().forEach((m) => { const pan0 = clamp((m.azS / DEG - 7) / 22, -0.95, 0.95), pan1 = clamp((m.azI / DEG - 7) / 22, -0.95, 0.95), v = (m.ocean ? 0.12 : 0.045) * m.s;
    whoosh(m.t0, m.dur, Math.min(0.13, v), pan0 * 0.6, pan1);
    const delay = 0.25 + m.Di / 12000; boom(m.ti + delay, Math.min(0.32, (m.ocean ? 0.34 : 0.11) * m.s * (9000 / m.Di)), pan1); });
  BUS = busAmb;
  alarm(40.6, 62.0, -0.6, 0.012, 0); alarm(42.1, 62.0, 0.55, 0.009, 1); alarm(44.3, 62.0, 0.2, 0.007, 0); alarm(46.0, 62.0, -0.2, 0.006, 1);
  for (let t = 38.6; t < 52; t += R.r(0.45, 1.3)) bark(t, 0.02 + R.r(0, 0.015), R.r(-0.9, 0.9), 0.4);
  bed(38.3, 56, { type: 'bandpass', f: 750, q: 1.6, f2: 2400, g: [[38.3, 0], [40, 0.03], [48, 0.035], [56, 0.012]], wide: 0.9, flut: [0.18, 0.2, 1.6], key: 'panic', send: 0.25, farS: 0.5 });
  for (let k = 0; k < 30; k++) { const t = R.r(38.5, 54), d = R.r(0.5, 1.6); scream(t, d, 0.008 + 0.01 * R.f(), R.r(-0.9, 0.9), lerp(1500, 2600, seg(t, 38, 50)), R.r(480, 950)); }
  bed(39, 62.42, { type: 'highpass', f: 2200, q: 0.6, g: [[39, 0], [43, 0.012], [56, 0.018], [62.4, 0.03]], wide: 0.9, flut: [0.06, 0.0, 1.8], key: 'fire' });   // crackling fires
  for (let k = 0; k < 120; k++) { const t = R.r(40, 62.3); hit(t, 0.012, 'highpass', 3500, 0.7, 0.012 * R.r(0.5, 1), R.r(-0.9, 0.9), 0.1); }
  // ================= 7. THE SEA PULLS BACK (48.6-56): suction, gurgles, slurps, hull creaks, a siren, the roar
  BUS = busAmb;
  bed(48.4, 57, { f: [[48.4, 200], [51, 800], [54, 500], [57, 160]], q: 0.9, g: [[48.4, 0], [50, 0.07], [53.5, 0.08], [56, 0.03], [57, 0]], wide: 0.6, flut: [0.22, 0.4, 1.4], key: 'suck', send: 0.2 });
  bed(49, 56.5, { type: 'bandpass', f: [[49, 3500], [56, 5000]], q: 1.2, g: [[49, 0], [50.5, 0.012], [55, 0.012], [56.5, 0]], wide: 0.8, flut: [0.07, 0.0, 1.6], key: 'trickle' });
  for (let t = 49; t < 56.5; t += R.r(0.2, 0.5)) { const v = 0.04 * Math.sin(Math.PI * seg(t, 48.8, 56.8)) + 0.008, p = R.r(-0.8, 0.8); for (let k = 0; k < 3 + Math.floor(R.f() * 5); k++) { const f0 = R.r(180, 520); plop(t + k * R.r(0.04, 0.13), f0, f0 * R.r(1.6, 2.6), R.r(0.03, 0.07), v * R.r(0.5, 1), p + R.n(0.1)); } }
  for (let k = 0; k < 10; k++) slurp(R.r(49.5, 56), R.r(0.3, 0.6), 0.03, R.r(-0.7, 0.7));
  boatList().forEach((b) => { const ts = boatSettleT(b); if (ts == null) return; const pan = clamp(b[2] / 40, -0.9, 0.9), v = 0.04 * clamp(1 - (-b[3] - 85) / 260, 0.25, 1); creak(ts, v, pan, R.r(0.8, 1.4)); creak(ts + R.r(0.6, 1.4), v * 0.6, pan, R.r(0.5, 0.9)); });
  BUS = busRoar;
  siren(49.6, 62.42, [[49.6, 0], [51.5, 0.04], [56, 0.05], [62.4, 0.06]], [[49.6, 1200], [56, 1900], [62.4, 3000]], -0.45);
  bed(50, 62.42, { buf: pink, type: 'bandpass', f: [[50, 200], [56, 500], [60, 1000], [62.4, 1500]], q: 0.6, g: [[50, 0], [53, 0.05], [56, 0.09], [60, 0.16], [62.4, 0.32]], wide: 0.8, flut: [0.5, 0.75, 1.2], key: 'roarmid', send: 0.1 });
  // ================= 8. THE WAVE (56-62.42): full-band roar slams in, crackle, houses going under, gusts, debris; then the vacuum
  bed(56, 62.42, { type: 'highpass', f: [[56, 400], [62.4, 250]], q: 0.5, f2: [[56, 9000], [62.4, 16000]], g: [[56, 0], [56.6, 0.08], [60, 0.11], [62.4, 0.42]], wide: 0.85, flut: [0.15, 0.8, 1.2], key: 'wallhi', send: 0.08 });
  bed(56, 62.42, { buf: pink, f: [[56, 900], [62.4, 2600]], g: [[56, 0], [56.5, 0.07], [60, 0.1], [62.4, 0.36]], wide: 0.6, flut: [0.3, 0.7, 1.25], key: 'wallmid' });
  for (let i = 0; i < 700; i++) { const t = 54 + ((i * 0.6180339) % 1) * 8.35, d = seg(t, 54, 62.4); if (t > 62.35 || (i * 7919) % 10 >= 2 + 8 * d) continue;
    hit(t, 0.015 + (i % 5) * 0.012, 'bandpass', 900 + (i * 397) % 5000, 1.6, 0.012 + 0.04 * d, ((i * 37) % 21) / 10 - 1, 0.12); }
  [58.6, 59.5, 60.3, 61.0, 61.6, 62.05].forEach((t, i) => { tone(t, t + 1.2, 'sine', [[t, 70], [t + 1.2, 30]], [[t, 0.05 + i * 0.008], [t + 1.2, 0]]); hit(t, 1.2, 'lowpass', 900, 0.7, 0.035, R.n(0.4), 0.3, 140);
    for (let k = 0; k < 10; k++) tink(t + R.r(0.05, 1.0), 0.01 + R.r(0, 0.012), R.r(-0.8, 0.8)); hit(t + 0.05, 0.5, 'bandpass', R.r(300, 700), 3, 0.03, R.n(0.5), 0.2); });
  bed(57, 62.42, { type: 'bandpass', f: [[57, 600], [60, 1100], [62.4, 800]], q: 7, g: [[57, 0], [60, 0.015], [62.4, 0.04]], wide: 0.7, flut: [0.4, 0.3, 1.5], key: 'howl' });
  bed(59.5, 62.42, { buf: pink, f: [[59.5, 900], [62.4, 2600]], g: [[59.5, 0], [61, 0.14], [62.4, 0.55]], flut: [0.2, 0.8, 1.2], key: 'surge' });
  BUS = busEv;
  for (let k = 0; k < 40; k++) hit(R.r(58, 62.35), R.r(0.05, 0.3), 'bandpass', R.r(400, 3000), 2, 0.03, R.r(-0.9, 0.9), 0.15);
  // THE HIT (63.0): double sub, a falling boom, a full-band water explosion, crunch, debris; all gone by 63.85
  BUS = busHit;
  sub(HIT, 1.0); sub(HIT + 0.04, 0.7);
  tone(HIT, 63.8, 'sine', [[HIT, 58], [63.8, 22]], [[HIT, 0.9], [HIT + 0.3, 0.5], [63.8, 0]]);
  tone(HIT, 63.8, 'sawtooth', [[HIT, 44], [63.8, 28]], [[HIT, 0.35], [63.8, 0]], { lp: 220 });
  hit(HIT, 0.8, 'lowpass', 12000, 0.5, 1.0, -0.2, 0.12, 300); hit(HIT + 0.01, 0.8, 'lowpass', 11000, 0.5, 0.9, 0.2, 0.12, 280); hit(HIT, 0.7, 'lowpass', 9000, 0.5, 0.6, 0, 0.1, 400, pink);
  hit(HIT, 0.5, 'bandpass', 380, 1, 0.6, 0, 0.1);
  for (let k = 0; k < 44; k++) { const t = HIT + 0.04 + R.r(0, 0.6); hit(t, R.r(0.03, 0.12), 'bandpass', R.r(700, 5000), 2, 0.12 * (1 - (t - HIT) / 0.7), R.r(-0.9, 0.9), 0.05); }
  // ================= 9. 63.85-66: total silence
  // ================= 10. THE END CARD (66-70): muffled bubbles and a faint wind, no tone
  BUS = busEv;
  bed(66.0, 69.95, { buf: brown, f: 300, g: [[66.0, 0], [66.8, 0.035], [69.0, 0.03], [69.9, 0]], wide: 0.5, flut: [0.5, 0.6, 1.3], key: 'under' });
  for (let t = 66.3; t < 69.6; t += R.r(0.1, 0.4)) { const f0 = R.r(220, 600); plop(t, f0, f0 * R.r(1.8, 2.8), R.r(0.04, 0.08), 0.018 * (1 - seg(t, 68.5, 69.6) * 0.7), R.r(-0.6, 0.6), 0.2); }
  BUS = busWind;
  bed(66.2, 69.95, { type: 'bandpass', f: 420, q: 0.8, g: [[66.2, 0], [67.2, 0.012], [69.2, 0.01], [69.95, 0]], wide: 0.8, flut: [0.9, 0.4, 1.4], key: 'windend' });
