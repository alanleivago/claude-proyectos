  // SCORE BODY — ¿Qué pasaría si una ola de 700 metros golpeara tu ciudad? (inside buildScore(); see kit/score-head.js)
  // A sound design modelled on the reference's measured structure (spectrogram + dB per second):
  //   gulls and a light pad over the harbour -> the sea drains (suction, gurgles, trickles, hull creaks, fish) ->
  //   near-silence, only wind (14-17) -> a SIREN wail becomes the main voice (from 17.6) over a deep rumble you feel ->
  //   a roar that keeps rising: crowd panic, horns with Doppler, barking, wings (26-40) -> at 44.8 a full-band roar slams in
  //   (like the reference at 49.8 s): water crackle, towers going under, glass, metal, gusts (44.8-56.65) ->
  //   a held-breath VACUUM (56.68-57.45: every bus ducked to nothing) -> THE HIT at 57.5 (the loudest) -> total silence (58.4-61)
  //   -> muffled underwater bubbles and one soft tone on the end card (61-65).
  const T = TIMELINE, cu = T.cues, HIT = cu.impact, VAC0 = 56.66, VAC1 = 57.46;
  const R = RNG('sfx3');
  to = 's';
  // true-peak headroom: a look-ahead limiter at -2 dBFS (after the tail's RMS stage) on the mix, before the tail's own -1 dBFS limiter
  if (part === 'mix') { const _sr = ac.startRendering.bind(ac);
    ac.startRendering = async () => { const buf = await _sr(), c0 = buf.getChannelData(0), c1 = buf.getChannelData(1), n = c0.length; let s = 0;
      for (let i = 0; i < n; i++) s += (c0[i] * c0[i] + c1[i] * c1[i]) / 2;
      const ceil = 0.79 / (10 ** (-17 / 20) / Math.sqrt(s / n || 1e-12)), g = new Float32Array(n);
      for (let i = 0; i < n; i++) { const p = Math.max(Math.abs(c0[i]), Math.abs(c1[i])); g[i] = p > ceil ? ceil / p : 1; }
      const att = Math.exp(-1 / (0.002 * sampleRate)), rel = Math.exp(-1 / (0.08 * sampleRate));
      for (let i = n - 2; i >= 0; i--) g[i] = Math.min(g[i], 1 - (1 - g[i + 1]) * att);
      let r = 1; for (let i = 0; i < n; i++) { r = Math.min(g[i], 1 - (1 - r) * rel); c0[i] *= r; c1[i] *= r; }
      return buf; }; }
  // ---------- buses (each one can be automated: ducking, the vacuum) and a room reverb whose return also ducks
  const mkBus = () => { const g = ac.createGain(); g.gain.value = 1; out(g, 0, 0); return g; };
  const busAmb = mkBus(), busRoar = mkBus(), busEv = mkBus(), busHit = mkBus();
  const room = ac.createConvolver(); room.buffer = makeImpulse(ac, 2.8, 2.3); const roomOut = ac.createGain(); roomOut.gain.value = 0.55; room.connect(roomOut); out(roomOut, 0, 0);
  const far = ac.createConvolver(); far.buffer = makeImpulse(ac, 4.2, 1.6); const farOut = ac.createGain(); farOut.gain.value = 0.5; far.connect(farOut); out(farOut, 0, 0);   // the city's long echo
  const vacuum = (g, lvl = 1) => { g.gain.setValueAtTime(lvl, VAC0 - 0.07); g.gain.linearRampToValueAtTime(0.0001, VAC0); g.gain.setValueAtTime(0.0001, VAC1); };
  [busAmb, busRoar, busEv].forEach((b) => vacuum(b)); busEv.gain.setValueAtTime(1, 60.9); vacuum(roomOut, 0.55); vacuum(farOut, 0.5);
  roomOut.gain.setValueAtTime(0.0001, HIT); roomOut.gain.linearRampToValueAtTime(0.25, HIT + 0.03); roomOut.gain.setValueAtTime(0.25, 57.9); roomOut.gain.linearRampToValueAtTime(0.0001, 58.3);   // a little space on the hit, cut before the silence
  // ambience ducks a little under the siren
  busAmb.gain.setValueAtTime(1, 17.5); busAmb.gain.linearRampToValueAtTime(0.6, 20);
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
  // random-walk gain points (organic flutter for water and wind)
  const flutter = (t0, t1, step, lo, hi, key) => { const Rf = RNG('fl', key), pts = []; for (let t = t0; t <= t1 + 1e-6; t += step * Rf.r(0.6, 1.4)) pts.push([t, Rf.r(lo, hi)]); return pts; };
  // a stereo noise bed through a filter, with gain points (multiplied by an optional flutter), sends to the room / far echo
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
  const envG = (t, a, peak, d, shape = 'exp') => { const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(2e-4, peak), t + a);
    if (shape === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); else { g.gain.setValueAtTime(peak, t + a + d * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + a + d); } return g; };
  // a noise burst on the current bus
  function hit(t, dur, type, f, q, vel, pan = 0, send = 0, sweepTo = 0, buf = nzL) {
    const s = ac.createBufferSource(); s.buffer = buf; const fl = filt(type, f, q); if (sweepTo) fl.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = envG(t, Math.min(0.004, dur * 0.3), vel, dur); s.connect(fl); fl.connect(g); emit(g, pan, send); s.start(t, (t * 7.31) % 9); s.stop(t + dur + 0.05);
  }
  function plop(t, f0, f1, d, vel, pan, send = 0.1) { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); const g = envG(t, 0.002, vel, d); o.connect(g); emit(g, pan, send); o.start(t); o.stop(t + d + 0.05); }
  // Doppler: a source moving past on a straight line (speed v m/s, closest distance D m, at time tc); returns freq factor / gain / pan curves
  function doppler(tc, dur, v, D, n = 96) { const fr = new Float32Array(n), gn = new Float32Array(n), pn = new Float32Array(n);
    for (let i = 0; i < n; i++) { const tt = tc - dur / 2 + dur * i / (n - 1), s = (tt - tc) * v, d = Math.hypot(s, D), vr = v * s / d; fr[i] = 343 / (343 + vr); gn[i] = D / d; pn[i] = clamp(s / d, -0.95, 0.95); } return { fr, gn, pn, t0: tc - dur / 2 }; }
  function carPass(tc, dur, f, vel, dirSign = 1, D = 30, v = 16) {   // engine + tyres, Doppler-shifted, panning across
    const dp = doppler(tc, dur, v, D), t0 = dp.t0; if (dirSign < 0) dp.pn.reverse();
    const p = ac.createStereoPanner(); p.pan.setValueCurveAtTime(dp.pn, t0, dur); const g = ac.createGain(); g.gain.value = 0; g.gain.setValueCurveAtTime(dp.gn.map((x) => x * vel), t0, dur);
    [1, 2, 3.02].forEach((h, k) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueCurveAtTime(dp.fr.map((x) => x * f * h), t0, dur); const lp = filt('lowpass', 500 + k * 200, 1); const gg = ac.createGain(); gg.gain.value = 0.5 / (k + 1); o.connect(lp); lp.connect(gg); gg.connect(g); o.start(t0); o.stop(t0 + dur + 0.05); });
    const s = loopSrc(nzL, t0, t0 + dur); const bp = filt('bandpass', 900, 0.8); const gt = ac.createGain(); gt.gain.value = 0.7; s.connect(bp); bp.connect(gt); gt.connect(g);
    g.connect(p); p.connect(BUS); const sg = ac.createGain(); sg.gain.value = 0.25; g.connect(sg); sg.connect(far);
  }
  function gull(t, pan, vel, o = {}) {   // a herring-gull "kyow" series; o.fly = Doppler fly-by
    const n = 2 + Math.floor(R.f() * 3), panic = o.panic || 0, span = n * 0.26, dp = o.fly ? doppler(t + span / 2, span + 0.3, 14, 12, 32) : null;
    for (let k = 0; k < n; k++) { const t0 = t + k * R.r(0.19, 0.27) * (1 - panic * 0.35), d = R.r(0.13, 0.22), f0 = R.r(1350, 1800) * (1 + panic * 0.25) * (dp ? dp.fr[Math.min(31, Math.floor((t0 - dp.t0) / (span + 0.3) * 31))] : 1);
      const pk = dp ? clamp(pan + dp.pn[Math.min(31, Math.floor((t0 - dp.t0) / (span + 0.3) * 31))], -1, 1) : pan;
      const os = ac.createOscillator(); os.type = 'sawtooth'; os.frequency.setValueAtTime(f0 * 0.75, t0); os.frequency.linearRampToValueAtTime(f0 * 1.35, t0 + d * 0.3); os.frequency.exponentialRampToValueAtTime(f0 * 0.7, t0 + d);
      lfo(os.frequency, t0, t0 + d, 38, 40);
      const bp = filt('bandpass', 2300, 3), lp = filt('lowpass', 4300), g = envG(t0, 0.02, vel * (k ? 0.8 : 1), d); os.connect(bp); bp.connect(lp); lp.connect(g); emit(g, pk, 0.25, 0.15); os.start(t0); os.stop(t0 + d + 0.05); }
  }
  function bell(t, vel, pan) { [[1, 1, 2.6], [2.76, 0.5, 1.6], [5.4, 0.28, 0.9], [8.93, 0.14, 0.5], [0.5, 0.25, 3.0]].forEach(([m, a, d]) => { const o = ac.createOscillator(); o.frequency.value = 412 * m; const g = envG(t, 0.003, vel * a, d); o.connect(g); emit(g, pan, 0.3, 0.2); o.start(t); o.stop(t + d + 0.1); }); hit(t, 0.03, 'bandpass', 3000, 2, vel * 0.3, pan, 0.2); }
  function creak(t, vel, pan, d = 0.9) {
    const f = R.r(70, 130), o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * R.r(0.8, 1.3), t + d); lfo(o.frequency, t, t + d, R.r(17, 31), f * 0.25);
    const bp = filt('bandpass', R.r(700, 1100), 5); bp.frequency.linearRampToValueAtTime(R.r(900, 1600), t + d);
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + d * 0.25); g.gain.linearRampToValueAtTime(vel * 0.6, t + d * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + d);
    o.connect(bp); bp.connect(g); emit(g, pan, 0.3); o.start(t); o.stop(t + d + 0.05); hit(t + d * 0.1, 0.14, 'lowpass', 280, 0.8, vel * 0.9, pan, 0.2);
  }
  function knock(t, vel, pan) { plop(t, 190, 110, 0.09, vel, pan, 0.2); hit(t, 0.05, 'bandpass', 700, 2, vel * 0.5, pan, 0.2); }
  function flap(t, vel, pan) { hit(t, 0.035, 'bandpass', R.r(900, 1600), 1.5, vel, pan, 0.1); hit(t + 0.06, 0.03, 'bandpass', R.r(1200, 2000), 1.5, vel * 0.6, pan, 0.1); plop(t, 160, 70, 0.05, vel * 0.5, pan); }
  function slurp(t, d, vel, pan) { const s = ac.createBufferSource(); s.buffer = nzL; const bp = filt('bandpass', 250, 6); bp.frequency.exponentialRampToValueAtTime(R.r(900, 1600), t + d); const g = envG(t, d * 0.6, vel, d * 0.4); s.connect(bp); bp.connect(g); emit(g, pan, 0.2); s.start(t, R.r(0, 8)); s.stop(t + d + 0.05); }
  function horn(t, d, f, vel, pan, cut, dop = 0) {   // car horn; dop > 0: the car is moving (Doppler drop + pan sweep)
    const p = ac.createStereoPanner(); p.pan.setValueAtTime(pan, t); if (dop) p.pan.linearRampToValueAtTime(clamp(pan + (pan > 0 ? -0.8 : 0.8), -1, 1), t + d);
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.02); g.gain.setValueAtTime(vel, t + d - 0.05); g.gain.linearRampToValueAtTime(0.0001, t + d);
    [f, f * 1.26].forEach((ff) => { const o = ac.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(ff * (1 + dop * 0.04), t); if (dop) o.frequency.linearRampToValueAtTime(ff * (1 - dop * 0.04), t + d); const lp = filt('lowpass', cut); o.connect(lp); lp.connect(g); o.start(t); o.stop(t + d + 0.05); });
    g.connect(p); p.connect(BUS); const sg = ac.createGain(); sg.gain.value = 0.5; g.connect(sg); sg.connect(far);
  }
  function scream(t, d, vel, pan, cut, f0 = 600) {
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * 0.8, t); o.frequency.linearRampToValueAtTime(f0 * 1.15, t + d * 0.3); o.frequency.linearRampToValueAtTime(f0 * 0.75, t + d); lfo(o.frequency, t, t + d, R.r(5, 7), f0 * 0.03);
    const mix = ac.createGain(); [[R.r(800, 950), 7, 1], [R.r(1250, 1450), 9, 0.6], [2700, 10, 0.3]].forEach(([ff, q, a]) => { const bp = filt('bandpass', ff, q), ga = ac.createGain(); ga.gain.value = a; o.connect(bp); bp.connect(ga); ga.connect(mix); });
    const lp = filt('lowpass', cut), g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.12); g.gain.linearRampToValueAtTime(vel * 0.7, t + d * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + d);
    mix.connect(lp); lp.connect(g); emit(g, pan, 0.2, 0.6); o.start(t); o.stop(t + d + 0.05); hit(t, d, 'bandpass', 1100, 1.2, vel * 0.25, pan, 0.3);
  }
  function bark(t, vel, pan) { for (let k = 0; k < 2; k++) { const t0 = t + k * 0.18, o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t0); o.frequency.exponentialRampToValueAtTime(330, t0 + 0.11);
    const b1 = filt('bandpass', 900, 4), b2 = filt('bandpass', 1900, 5), g = envG(t0, 0.008, vel, 0.11); o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g); emit(g, pan, 0.3, 0.2); o.start(t0); o.stop(t0 + 0.16); hit(t0, 0.06, 'bandpass', 1500, 1, vel * 0.4, pan, 0.2); } }
  function siren(t0, t1, gPts, cutPts, pan, period = 6.6, lo = 430, hi = 980) {   // a civil-defence wail, rich harmonics, through the far echo
    const g = ac.createGain(); g.gain.value = 0; auto(g.gain, gPts); const lp = filt('lowpass', 1000, 1.1); autoX(lp.frequency, cutPts);
    [[0, 'sawtooth', 1], [9, 'square', 0.3], [-6, 'sawtooth', 0.5]].forEach(([det, type, a]) => { const o = ac.createOscillator(); o.type = type; o.detune.value = det;
      o.frequency.setValueAtTime(lo * 0.7, t0); o.frequency.linearRampToValueAtTime(lo, t0 + 1.0);
      for (let t = t0 + 1.0; t < t1; t += period) { o.frequency.setValueAtTime(lo, t); o.frequency.linearRampToValueAtTime(hi, t + period * 0.38); o.frequency.setValueAtTime(hi, t + period * 0.52); o.frequency.linearRampToValueAtTime(lo, t + period * 0.97); }
      const ga = ac.createGain(); ga.gain.value = a; o.connect(ga); ga.connect(lp); o.start(t0); o.stop(t1 + 0.05); });
    lp.connect(g); emit(g, pan, 0.25, 0.9);
  }
  function tink(t, vel, pan) { const o = ac.createOscillator(); o.frequency.value = R.r(2600, 7000); const g = envG(t, 0.002, vel, R.r(0.05, 0.25)); o.connect(g); emit(g, pan, 0.3); o.start(t); o.stop(t + 0.35); hit(t, 0.015, 'highpass', 5000, 0.7, vel * 0.6, pan, 0.2); }
  function wings(t, d, vel, pan) { for (let k = 0; k < d / 0.09; k++) hit(t + k * 0.09 + R.r(0, 0.02), 0.05, 'bandpass', R.r(500, 900), 1, vel * R.r(0.6, 1), pan + R.n(0.15), 0.1); }
  function groan(t, d, vel, pan) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(R.r(45, 70), t); o.frequency.linearRampToValueAtTime(R.r(30, 50), t + d); lfo(o.frequency, t, t + d, R.r(3, 7), 6);
    const bp = filt('bandpass', R.r(300, 600), 6), g = ac.createGain(); g.gain.value = 0; auto(g.gain, [[t, 0], [t + d * 0.3, vel], [t + d, 0]]); o.connect(bp); bp.connect(g); emit(g, pan, 0.4, 0.4); o.start(t); o.stop(t + d + 0.05); }

  // ================= 1. THE HARBOUR (0-5 and its life until the water is gone)
  // sound-test bedA: no music (pad/pluck removed)
  to = 's'; BUS = busAmb;
  bed(0, 17.5, { buf: brown, f: 170, g: [[0, 0], [1, 0.05], [12, 0.045], [15.2, 0]], wide: 0.7, farS: 0.2 });                  // city traffic hum
  bed(0, 17.5, { type: 'bandpass', f: 700, q: 0.6, g: [[0, 0], [1, 0.012], [12, 0.01], [15, 0]], wide: 0.8, flut: [0.8, 0.6, 1.2], key: 'air' });
  carPass(2.8, 5, 82, 0.05, 1); carPass(8.6, 5, 96, 0.04, -1, 40); carPass(12.6, 4.4, 70, 0.03, 1, 50);                       // cars behind, with Doppler
  bed(0, 9.2, { f: [[0, 700], [5.6, 700], [9.2, 250]], g: [[0, 0], [0.4, 0.05], [5.6, 0.05], [9, 0]], wide: 0.6, flut: [0.35, 0.3, 1.4], key: 'wash', send: 0.15 });   // water slapping the quay
  for (let t = 0.2; t < 9.0; t += R.r(0.3, 0.8)) { const v = 0.05 * (1 - ss(5.6, 9.0, t)), p = R.r(-0.7, 0.7); hit(t, R.r(0.25, 0.5), 'lowpass', R.r(500, 900), 1.2, v, p, 0.15, 220); if (R.f() < 0.5) plop(t + R.r(0.05, 0.2), R.r(500, 900), R.r(250, 400), 0.05, v * 0.35, p); }
  for (let t = 0.8; t < 7; t += R.r(1.2, 2.4)) knock(t, 0.025, R.r(-0.5, 0.6));                                             // hulls knocking the fenders
  [0.9, 4.1, 7.6, 11.0].forEach((t, i) => bell(t, 0.07 - i * 0.012, -0.35)); bell(12.4, 0.045, -0.35); hit(12.45, 0.25, 'lowpass', 400, 0.7, 0.05, -0.35, 0.3);
  [[0.3, 0.5, 1], [1.7, -0.6, 0], [3.0, 0.2, 1], [4.4, 0.75, 0], [6.8, -0.4, 1], [9.6, 0.5, 0], [10.8, -0.2, 0], [11.9, -0.7, 1], [16.2, 0.3, 0], [19.5, -0.5, 1], [22.4, 0.6, 0]].forEach(([t, p, fly]) => gull(t, p, 0.055 * (t > 14 ? 0.55 : 1), { fly }));
  bed(0, 12, { type: 'bandpass', f: 520, q: 1.5, g: [[0, 0], [1, 0.01], [6, 0.01], [9, 0]], wide: 0.9, flut: [0.25, 0.3, 1.5], key: 'babble', send: 0.3 });   // promenade babble
  for (const [t, p] of [[1.2, 0.3], [3.9, -0.2], [6.0, 0.4], [7.4, -0.5]]) hit(t, 0.3, 'bandpass', 900, 3, 0.012, p, 0.4);
  // ================= 2. THE SEA DRAINS (5.6-13.6)
  bed(5.4, 15, { f: [[5.4, 200], [8, 800], [11, 500], [15, 150]], q: 0.9, g: [[5.4, 0], [7.0, 0.07], [10.5, 0.08], [13.0, 0.03], [14.6, 0]], wide: 0.6, flut: [0.22, 0.4, 1.4], key: 'suck', send: 0.2 });   // the long suck, fluttering
  bed(5.6, 14.5, { buf: brown, type: 'bandpass', f: [[5.6, 300], [9, 180], [14.5, 120]], q: 2.5, g: [[5.6, 0], [8, 0.05], [12, 0.04], [14.4, 0]] });
  bed(6.0, 14.2, { type: 'bandpass', f: [[6, 3500], [14, 5000]], q: 1.2, g: [[6, 0], [8, 0.012], [12, 0.012], [14.2, 0]], wide: 0.8, flut: [0.07, 0.0, 1.6], key: 'trickle' });   // trickles off rocks and hulls
  for (let t = 6.0; t < 14.0; t += R.r(0.2, 0.6)) { const v = 0.045 * Math.sin(Math.PI * seg(t, 5.8, 14.2)) + 0.01, p = R.r(-0.8, 0.8); for (let k = 0; k < 3 + Math.floor(R.f() * 6); k++) { const f0 = R.r(180, 520); plop(t + k * R.r(0.04, 0.13), f0, f0 * R.r(1.6, 2.6), R.r(0.03, 0.07), v * R.r(0.5, 1), p + R.n(0.1)); } }
  for (let k = 0; k < 12; k++) slurp(R.r(6.5, 13.5), R.r(0.3, 0.6), 0.03, R.r(-0.7, 0.7));
  boatList().forEach((b, i) => { const ts = boatSettleT(b); if (ts == null || Math.abs(b[2]) > 40 || b[3] < -260) return;
    const pan = clamp(b[2] / 25, -0.9, 0.9), near = clamp(1 - (-b[3] - 30) / 230), v = 0.05 * (0.3 + 0.7 * near);
    creak(ts, v, pan, R.r(0.8, 1.4)); creak(ts + R.r(0.8, 1.6), v * 0.6, pan, R.r(0.6, 1.0)); if (i % 2) creak(ts + R.r(2, 3.5), v * 0.4, pan, 0.7); });
  for (let k = 0; k < 70; k++) { const t = R.r(9.4, 25), pan = R.r(-0.6, 0.6), v = 0.032 * (t < 17 ? 1 : 0.5) * (t > 14 && t < 17 ? 0.3 : 1); flap(t, v, pan); if (R.f() < 0.4) flap(t + 0.12, v * 0.7, pan); }
  // ================= 3. EERIE CALM (14-17): wind only
  bed(13.0, 56.7, { type: 'bandpass', f: [[13, 380], [15, 520], [17, 420], [26, 650], [40, 800], [56, 1100]], q: 0.8, g: [[13, 0], [14.2, 0.028], [17, 0.03], [26, 0.04], [44, 0.05], [56.6, 0.07]], wide: 0.8, flut: [0.9, 0.35, 1.5], key: 'wind', send: 0.15 });
  bed(13.5, 17.2, { type: 'highpass', f: 3000, q: 0.5, g: [[13.5, 0], [15, 0.005], [17.2, 0]], wide: 0.9 });
  // ================= 4. THE LINE (17-26): the siren, a ground rumble you feel
  BUS = busRoar;
  siren(17.6, 56.7, [[17.6, 0], [20, 0.05], [26, 0.06], [40, 0.06], [52, 0.065], [56.6, 0.085]], [[17.6, 1300], [26, 1700], [40, 2600], [56.6, 3200]], -0.4);
  siren(23.5, 56.7, [[23.5, 0], [26, 0.02], [40, 0.035], [56.6, 0.04]], [[23.5, 900], [56.6, 2000]], 0.55, 7.4, 400, 900);
  bed(17, 56.7, { buf: brown, f: [[17, 55], [26, 80], [40, 160], [52, 380], [56.6, 600]], g: [[17, 0], [20, 0.07], [26, 0.1], [40, 0.11], [52, 0.13], [56.6, 0.3]], wide: 0.5, flut: [1.2, 0.75, 1.15], key: 'rumble' });   // the ground rumble
  const rmb = tone(17, 56.7, 'sine', [[17, 29], [40, 33], [56.6, 37]], [[17, 0], [21, 0.045], [30, 0.06], [45, 0.07], [56.6, 0.1]]); lfo(rmb.frequency, 17, 56.7, 0.37, 2.5);
  tone(17, 56.7, 'triangle', [[17, 44], [56.6, 51]], [[17, 0], [24, 0.02], [40, 0.035], [56.6, 0.06]], { lp: 120, pan: 0.15 });
  for (let k = 0; k < 9; k++) { const t = 18 + k * 2.6 + R.r(0, 1); bed(t, t + 3.2, { type: 'bandpass', f: [[t, 280], [t + 1.5, 900], [t + 3.2, 350]], q: 1.0, g: [[t, 0], [t + 1.5, 0.02 + 0.02 * seg(t, 18, 44)], [t + 3.2, 0]], pan: k % 2 ? 0.6 : -0.6, key: 'gust' + k }); }
  // ================= 5. IT GROWS (26-40): roar, crowd panic, horns, barking, birds
  bed(24, 56.7, { buf: pink, type: 'bandpass', f: [[24, 220], [40, 450], [52, 1000], [56.6, 1400]], q: 0.6, g: [[24, 0], [30, 0.06], [40, 0.11], [44.6, 0.09], [52, 0.1], [56.6, 0.3]], wide: 0.8, flut: [0.5, 0.75, 1.2], key: 'roarmid', send: 0.12 });
  [[26.1, 0.6], [26.5, -0.5], [26.9, 0.2], [27.3, 0.8], [27.8, -0.7], [28.4, 0.1]].forEach(([t, p]) => gull(t, p, 0.05, { panic: 1, fly: 1 }));
  for (let k = 0; k < 10; k++) wings(26.2 + k * 0.38 + R.r(0, 0.3), R.r(0.8, 1.6), 0.02, R.r(-0.8, 0.8));
  bark(26.9, 0.06, -0.1); bark(27.6, 0.05, 0.05); bark(28.5, 0.035, 0.2); bark(29.6, 0.02, 0.3);
  for (let k = 0; k < 20; k++) { const t = R.r(27, 46), d = R.r(0.3, 1.2); horn(t, d, R.r(330, 470), 0.008 + 0.012 * seg(t, 27, 40), R.r(-0.9, 0.9), lerp(900, 1700, seg(t, 27, 46)), R.f() < 0.5 ? 1 : 0); if (R.f() < 0.3) horn(t + d + 0.12, d * 0.6, R.r(330, 470), 0.01, R.r(-0.9, 0.9), 1200); }
  for (let k = 0; k < 34; k++) { const t = R.r(26.6, 46), d = R.r(0.5, 1.6); scream(t, d, 0.012 + 0.012 * seg(t, 26.6, 34), R.r(-0.9, 0.9), lerp(1600, 2800, seg(t, 26, 42)), R.r(480, 950)); }
  bed(26.5, 52, { type: 'bandpass', f: 750, q: 1.6, f2: 2400, g: [[26.5, 0], [28, 0.03], [38, 0.03], [52, 0.01]], wide: 0.9, flut: [0.18, 0.2, 1.6], key: 'panic', send: 0.25, farS: 0.4 });   // the crowd panicking, far
  for (let k = 0; k < 26; k++) hit(R.r(26.8, 35), 0.06, 'bandpass', R.r(1500, 2600), 2, 0.014, R.r(-0.7, 0.7), 0.1);   // running footsteps
  // ================= 6. THE WALL (40-56.65): the full-band roar slams in at 44.8, crackle, towers, glass, metal, gusts
  bed(44.6, 56.7, { type: 'highpass', f: [[44.6, 400], [56.6, 250]], q: 0.5, f2: [[44.6, 9000], [56.6, 16000]], g: [[44.6, 0], [45.3, 0.085], [50, 0.08], [52, 0.09], [56.6, 0.44]], wide: 0.85, flut: [0.15, 0.8, 1.2], key: 'wallhi', send: 0.08 });
  bed(44.6, 56.7, { buf: pink, f: [[44.6, 900], [56.6, 2500]], g: [[44.6, 0], [45.2, 0.07], [52, 0.08], [56.6, 0.34]], wide: 0.6, flut: [0.3, 0.7, 1.25], key: 'wallmid' });
  for (let i = 0; i < 900; i++) { const t = 38 + ((i * 0.6180339) % 1) * 18.6, d = seg(t, 38, 56.6); if (t > 56.6 || (i * 7919) % 10 >= 2 + 8 * d) continue;
    hit(t, 0.015 + (i % 5) * 0.012, 'bandpass', 900 + (i * 397) % 5000, 1.6, 0.012 + 0.04 * d, ((i * 37) % 21) / 10 - 1, 0.12); }
  // sound-test bedA: tower booms come from real recordings (cues.json); groans and glass stay
  [45.0, 46.1, 47.0, 47.9, 48.8, 49.8, 50.7, 51.6].forEach((t, i) => {
    groan(t + 0.2, R.r(1.2, 2.2), 0.04, 0.4 + R.n(0.3)); for (let k = 0; k < 16; k++) tink(t + R.r(0.05, 1.4), 0.012 + R.r(0, 0.012), clamp(0.4 + R.n(0.4), -1, 1)); });
  for (let k = 0; k < 70; k++) tink(R.r(44, 56.5), 0.006 + 0.01 * R.f(), R.r(-0.9, 0.9));
  for (let k = 0; k < 30; k++) hit(R.r(45, 56.5), R.r(0.08, 0.25), 'bandpass', R.r(300, 900), 4, 0.022, R.r(-0.8, 0.8), 0.2);
  bed(48, 56.7, { type: 'bandpass', f: [[48, 600], [52, 1100], [56.6, 800]], q: 7, g: [[48, 0], [52, 0.015], [56.6, 0.04]], wide: 0.7, flut: [0.4, 0.3, 1.5], key: 'howl' });   // wind howling through the railings
  bed(51.5, 56.7, { buf: pink, f: [[51.5, 900], [56.6, 2600]], g: [[51.5, 0], [53, 0.14], [56.6, 0.6]], pan: 0, flut: [0.2, 0.8, 1.2], key: 'surge' });   // the final surge as it lands
  // ================= 7. IT ARRIVES (52-56.65): the camera runs back; debris; then the vacuum
  BUS = busEv;
  for (let t = 52.35; t < 56.6; t += 0.33) { plop(t, 95, 50, 0.07, 0.035, 0, 0); hit(t + 0.01, 0.03, 'bandpass', 2400, 2, 0.014, R.n(0.1), 0); }
  for (let k = 0; k < 40; k++) hit(R.r(51, 56.5), R.r(0.05, 0.3), 'bandpass', R.r(400, 3000), 2, 0.03, R.r(-0.9, 0.9), 0.15);
  // THE IMPACT (57.5): boom, a full-band water explosion, crunch, debris; all gone by 58.35
  // sound-test bedA: THE HIT comes from real recordings (cues.json); only the debris clatter stays
  BUS = busHit;
  hit(HIT, 1.05, 'lowpass', 12000, 0.5, 1.0, -0.2, 0.12, 300); hit(HIT + 0.01, 1.05, 'lowpass', 11000, 0.5, 0.9, 0.2, 0.12, 280); hit(HIT, 0.75, 'lowpass', 9000, 0.5, 0.6, 0, 0.1, 400, pink);   // the water explosion (noise), under the real hit
  for (let k = 0; k < 44; k++) { const t = HIT + 0.04 + R.r(0, 0.65); hit(t, R.r(0.03, 0.12), 'bandpass', R.r(700, 5000), 2, 0.12 * (1 - (t - HIT) / 0.75), R.r(-0.9, 0.9), 0.05); }
  // ================= 8. 58.4-61: silence
  // ================= 9. THE END CARD (61-65): underwater, one soft tone
  to = 's'; BUS = busEv;
  bed(61.0, 64.9, { buf: brown, f: 320, g: [[61.0, 0], [61.8, 0.04], [64.0, 0.035], [64.85, 0]], wide: 0.5, flut: [0.5, 0.6, 1.3], key: 'under' });
  for (let t = 61.3; t < 64.6; t += R.r(0.1, 0.4)) { const f0 = R.r(220, 600); plop(t, f0, f0 * R.r(1.8, 2.8), R.r(0.04, 0.08), 0.02 * (1 - seg(t, 63.5, 64.6) * 0.7), R.r(-0.6, 0.6), 0.2); }
  // sound-test bedA: no chime/pad on the end card
