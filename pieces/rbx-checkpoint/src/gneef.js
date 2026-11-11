// rbx-rope GN kit: Gneef-style "wild" avatars (fuentes/roblox-cartoon/gneef-looks.md).
// Oversized hair H1-H15 (spec head-units: head = 1, centre at origin, face +z, top y=+0.5), knit / rib / gingham /
// floral / fair-isle / wrinkle / denim textures, layered trims (rib cuffs, hem, collar, aprons, vests, badges),
// face decals F1-F16 on the spec's 256 grid with S/M/H stroke tiers, and a rope-grip solver (GN.grip).
// Avatar API matches RBX.avatar (root, body, torso, neck, head, armL/R, legL/R, pose(), setFace()), so CAST/ENG work unchanged.
'use strict';
const GN = {};
(function () {
  const T = THREE, { cnv, tex, rng, fbm, tnoise, rbox, normalCanvas, heightOf } = RBX, PI = Math.PI;
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  const _set = (o, k, a, v) => { o[k][a] = v; return o; };
  const col = (c) => new T.Color(c);
  const shade = (c, k) => { const q = col(c); q.multiplyScalar(k); return '#' + q.getHexString(); };

  // =============================== TEXTURES (256 tiles = 1 world unit) ===============================
  function pair(S, draw) { const c = cnv(S, S), h = cnv(S, S), g = c.getContext('2d'), hg = h.getContext('2d'); hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, S); draw(g, hg, S); return { c, h }; }
  function grain(g, S, seed, amt) { KIT.noiseOver(g, S, S, seed, amt, 16, 4); }
  const PAT = {
    // cable knit: vertical rope columns (twisted cables) between purl ribs + tonal horizontal bands
    knit: (o) => pair(256, (g, hg, S) => {
      g.fillStyle = o.c; g.fillRect(0, 0, S, S);
      const bands = o.bands ?? 4; for (let b = 0; b < bands; b++) { g.fillStyle = b % 2 ? `rgba(120,80,30,${o.bandK ?? 0.14})` : 'rgba(255,255,255,0.06)'; g.fillRect(0, (b * S) / bands, S, S / bands); }
      if (o.band2) { g.fillStyle = o.band2; [0.2, 0.7].forEach((y) => g.fillRect(0, y * S, S, S * 0.07)); }
      const cw = S / 4;
      for (let k = 0; k < 4; k++) { const x0 = k * cw;
        // purl ribs between cables
        for (let y = 0; y < S; y += 6) for (const dx of [3, cw - 7]) { g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(x0 + dx, y, 4, 3); hg.fillStyle = '#5a5a5a'; hg.fillRect(x0 + dx, y, 4, 3); }
        // cable: two interleaved lobes per period, lit top-left
        const cx = x0 + cw / 2, P = S / 4;
        for (let y = -P; y < S + P; y += P / 2) { const flip = Math.round(y / (P / 2)) % 2 ? 1 : -1;
          for (const [gg, lit, dark] of [[g, 'rgba(255,255,255,0.22)', 'rgba(0,0,0,0.28)'], [hg, '#ffffff', '#202020']]) {
            gg.save(); gg.translate(cx, y + P / 4); gg.rotate(flip * 0.55);
            const gr = gg.createLinearGradient(-cw * 0.3, -P * 0.3, cw * 0.3, P * 0.3); gr.addColorStop(0, lit); gr.addColorStop(0.5, gg === g ? 'rgba(255,255,255,0.05)' : '#b0b0b0'); gr.addColorStop(1, dark);
            gg.fillStyle = gr; gg.beginPath(); gg.ellipse(0, 0, cw * 0.3, P * 0.36, 0, 0, 7); gg.fill(); gg.restore(); } }
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x0 + cw * 0.17, 0, 2, S); g.fillRect(x0 + cw * 0.81, 0, 2, S);
      }
      grain(g, S, o.seed || 3, 0.12);
    }),
    rib: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); for (let x = 0; x < S; x += 16) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, 0, 5, S); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 8, 0, 4, S); hg.fillStyle = '#101010'; hg.fillRect(x, 0, 5, S); hg.fillStyle = '#f0f0f0'; hg.fillRect(x + 7, 0, 6, S); } grain(g, S, 9, 0.1); }),
    gingham: (o) => pair(256, (g, hg, S) => { const n = o.n || 8, q = S / n; g.fillStyle = o.c2 || '#ffffff'; g.fillRect(0, 0, S, S);
      g.globalAlpha = 0.55; g.fillStyle = o.c; for (let i = 0; i < n; i += 2) { g.fillRect(i * q, 0, q, S); g.fillRect(0, i * q, S, q); } g.globalAlpha = 1;
      g.fillStyle = shade(o.c, 0.85); for (let i = 0; i < n; i += 2) for (let j = 0; j < n; j += 2) g.fillRect(i * q, j * q, q, q);
      for (let y = 0; y < S; y += 3) { hg.fillStyle = y % 6 ? '#909090' : '#707070'; hg.fillRect(0, y, S, 1); } grain(g, S, 13, 0.1); }),
    floral: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); const r = rng(o.seed || 17), F = o.flowers || ['#f4f0e8', '#e86a9a', '#f2c94c'];
      for (let i = 0; i < (o.n || 46); i++) { const x = r() * S, y = r() * S, rr = (o.size || 7) * (0.7 + r() * 0.6), c = F[i % F.length];
        for (const [dx, dy] of [[0, 0], [S, 0], [-S, 0], [0, S], [0, -S]]) { g.fillStyle = c; for (let p = 0; p < 5; p++) { const a = (p / 5) * PI * 2 + i; g.beginPath(); g.arc(x + dx + Math.cos(a) * rr * 0.6, y + dy + Math.sin(a) * rr * 0.6, rr * 0.45, 0, 7); g.fill(); }
          g.fillStyle = '#f6d24a'; g.beginPath(); g.arc(x + dx, y + dy, rr * 0.3, 0, 7); g.fill(); g.fillStyle = 'rgba(40,110,60,0.8)'; g.beginPath(); g.ellipse(x + dx + rr, y + dy + rr * 0.6, rr * 0.5, rr * 0.22, 0.6, 0, 7); g.fill();
          hg.fillStyle = '#b0b0b0'; hg.beginPath(); hg.arc(x + dx, y + dy, rr, 0, 7); hg.fill(); } }
      grain(g, S, 19, 0.1); }),
    fairisle: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); const a = o.a || '#f4ead8', b = o.b || '#c0392b';
      const st = 8; for (let y = 0; y < S; y += st) for (let x = 0; x < S; x += st) { const row = y / st, k = x / st;
        let on = 0, cc = a; if (row % 16 === 2 || row % 16 === 13) on = 1; else if (row % 16 >= 4 && row % 16 <= 7) { const m = row % 16 - 4; on = (k + m) % 8 === 0 || (k - m + 64) % 8 === 0 ? 1 : 0; cc = b; } else if (row % 16 === 10) { on = k % 4 === 0; cc = b; }
        if (on) { g.fillStyle = cc; g.beginPath(); g.moveTo(x + st / 2, y); g.lineTo(x + st, y + st / 2); g.lineTo(x + st / 2, y + st); g.lineTo(x, y + st / 2); g.fill(); } hg.fillStyle = (x / st + y / st) % 2 ? '#9a9a9a' : '#6a6a6a'; hg.fillRect(x, y, st, st); }
      grain(g, S, 23, 0.1); }),
    // crumpled tee / gown: soft fold noise in colour and height
    tee: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); const n = fbm(o.seed || 29, 3, 4), im = g.getImageData(0, 0, S, S), hm = hg.getImageData(0, 0, S, S);
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const v = n(x / S, y / S), w = Math.abs(Math.sin(v * 9)), i = (y * S + x) * 4, k = 0.9 + 0.16 * w; im.data[i] *= k; im.data[i + 1] *= k; im.data[i + 2] *= k; hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = 60 + w * 150; }
      g.putImageData(im, 0, 0); hg.putImageData(hm, 0, 0); }),
    denim: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); for (let i = -S; i < S * 2; i += 4) { g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + S, S); g.stroke(); hg.strokeStyle = '#a0a0a0'; hg.beginPath(); hg.moveTo(i, 0); hg.lineTo(i + S, S); hg.stroke(); } grain(g, S, 31, 0.22); }),
    plaid: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); g.globalAlpha = 0.45; g.fillStyle = o.a || '#1a1a1a'; [0, 128].forEach((p) => { g.fillRect(p, 0, 48, S); g.fillRect(0, p, S, 48); }); g.fillStyle = o.b || '#f2d04a'; [80, 208].forEach((p) => { g.fillRect(p, 0, 6, S); g.fillRect(0, p, S, 6); }); g.globalAlpha = 1; grain(g, S, 37, 0.12); }),
    stripes: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); g.fillStyle = o.a || '#fff'; const n = o.n || 6; for (let i = 0; i < n; i++) g.fillRect(0, (i * S) / n, S, S / n / 2); grain(g, S, 41, 0.1); }),
    pinstripe: (o) => pair(256, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(255,255,255,0.22)'; for (let x = 0; x < S; x += 22) g.fillRect(x, 0, 2, S); grain(g, S, 43, 0.12); }),
    plain: (o) => pair(64, (g, hg, S) => { g.fillStyle = o.c; g.fillRect(0, 0, S, S); }),
  };
  GN.PAT = PAT;
  // cached material; tile = world units per texture tile
  GN.mat = function (kind, o = {}, extra = {}) {
    const key = kind + JSON.stringify(o) + JSON.stringify(extra);
    return once('m' + key, () => {
      if (kind === 'flat') return new T.MeshStandardMaterial({ color: o.c, roughness: o.rough ?? 0.6, metalness: 0 });
      const p = PAT[kind](o), rep = 1 / (o.tile || 1);
      const m = new T.MeshStandardMaterial({ map: tex(p.c, { repeat: [rep, rep] }), roughness: o.rough ?? 0.92, metalness: 0 });
      m.normalMap = tex(normalCanvas(heightOf(p.h), p.h.width, p.h.height, o.bump ?? 3), { srgb: false, repeat: [rep, rep] }); m.normalScale.set(o.nscale ?? 0.8, o.nscale ?? 0.8);
      Object.assign(m, extra); return m;
    });
  };
  // world-unit UVs on any box-like geometry with 6 groups
  GN.uvBox = (geo, w, h, d) => KIT.uvBox(geo, w, h, d);
  const box = (w, h, d, mat, x = 0, y = 0, z = 0, r = 0.06, n = 6) => { const g = rbox(w, h, d, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001), n); KIT.uvBox(g, w, h, d); const m = new T.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  GN.box = box;

  // =============================== FACES (256 spec grid -> conforming decal) ===============================
  // the decal is a lathe patch of the head (120 deg, y -0.58..0.46); spec px -> canvas: x' = 14.6 + 2.386x, y' = -68.9 + 2.306y
  const FW = 640, FH = 512, K = '#141414';
  const S_ = 4, M_ = 6, H_ = 9;
  const ln = (g, pts, w = S_, c = K) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
  const qc = (g, x0, y0, cx, cy, x1, y1, w = S_, c = K) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); };
  const disc = (g, x, y, r, c = K) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const ell = (g, x, y, rx, ry, c = K, rot = 0) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
  const EL = [86, 112], ER = [170, 112], MO = [128, 172];
  const blush = (g, a = 0.45) => { [[60, 146], [196, 146]].forEach(([x, y]) => { ell(g, x, y, 15, 7, `rgba(255,96,128,${a})`); for (let k = -1; k <= 1; k++) ln(g, [x + k * 7 - 3, y + 4, x + k * 7 + 3, y - 4], 1.6, 'rgba(200,40,80,0.6)'); }); };
  // white-sclera lashed eye (moms / grandmas / girls: 2x the hero's eye)
  const lashEye = (g, x, y, side, look = [0, 2], o = {}) => {
    g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 3.2; g.beginPath(); g.ellipse(x, y, 14, 17, 0, 0, 7); g.fill(); g.stroke();
    disc(g, x + look[0], y + look[1], o.iris || 9, o.irisC || K); disc(g, x + look[0] - 3, y + look[1] - 4, 3, '#fff');
    if (o.lid) { g.save(); g.beginPath(); g.ellipse(x, y, 15.5, 18.5, 0, 0, 7); g.clip(); g.fillStyle = o.lidC || '#e0a080'; g.fillRect(x - 20, y - 22, 40, 22 * o.lid); g.restore(); ln(g, [x - 15, y - 18 + 22 * o.lid * 0.9, x + 15, y - 18 + 22 * o.lid * 0.9], 3.2); }
    const s = side; [[0.5, -15, 0.9, -23], [0.8, -11, 1.25, -18], [0.95, -5, 1.4, -9]].forEach(([a, b, c, d]) => ln(g, [x + s * 14 * a, y + b, x + s * 14 * c, y + d], 2.6));
  };
  const eyesNeutral = (g, o, wide = 0) => {
    if (o.lash) { lashEye(g, EL[0] - wide, EL[1], -1); lashEye(g, ER[0] + wide, ER[1], 1); }
    else { disc(g, EL[0] - 8 - wide, EL[1], 8); disc(g, ER[0] + 8 + wide, ER[1], 8); }
  };
  const openMouth = (g, w = 26, h = 18, y = MO[1] + 2) => { g.fillStyle = '#5a0d12'; g.strokeStyle = K; g.lineWidth = M_; g.beginPath(); g.ellipse(MO[0], y, w / 2, h / 2, 0, 0, 7); g.fill(); g.stroke(); ell(g, MO[0], y + h * 0.22, w * 0.28, h * 0.18, '#e8506a'); };
  const tear = (g, x, y, L = 40) => { g.fillStyle = 'rgba(80,170,255,0.9)'; g.beginPath(); g.moveTo(x - 5, y); g.quadraticCurveTo(x - 7, y + L * 0.6, x - 2, y + L); g.lineTo(x + 4, y + L); g.quadraticCurveTo(x + 7, y + L * 0.5, x + 5, y); g.closePath(); g.fill(); };
  const sweat = (g, x, y, s = 1) => { g.fillStyle = 'rgba(110,190,255,0.95)'; g.strokeStyle = '#1d5fa0'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 14 * s); g.quadraticCurveTo(x + 10 * s, y + 2 * s, x, y + 8 * s); g.quadraticCurveTo(x - 10 * s, y + 2 * s, x, y - 14 * s); g.fill(); g.stroke(); disc(g, x - 2 * s, y, 2.2 * s, '#fff'); };
  const F = {
    // F1 deadpan dot
    F1: (g, o) => { eyesNeutral(g, o); if (o.talk) openMouth(g, 22, 16); else qc(g, 108, 170, 128, 177, 148, 170, o.tierA ? M_ : S_); },
    // F2 sleepy calm: half-closed domes with a sparkle, thin U smile with corner ticks
    F2: (g, o) => { [EL, ER].forEach(([x, y]) => { g.fillStyle = K; g.beginPath(); g.moveTo(x - 14, y + 4); g.quadraticCurveTo(x, y - 14, x + 14, y + 4); g.closePath(); g.fill(); disc(g, x + 4, y - 2, 2.4, '#fff'); });
      if (o.talk) openMouth(g, 30, 16); else { qc(g, 98, 166, 128, 190, 158, 166, S_); ln(g, [96, 162, 100, 170], 3); ln(g, [160, 162, 156, 170], 3); } },
    // F3 smug half-lid
    F3: (g, o) => { [[EL, -1], [ER, 1]].forEach(([[x, y]]) => { g.save(); g.beginPath(); g.rect(x - 14, y - 4, 28, 30); g.clip(); ell(g, x, y + 2, 10, 14); g.restore(); ln(g, [x - 12, y - 4, x + 12, y - 4], M_); disc(g, x + 3, y + 4, 2.4, '#fff'); });
      ln(g, [68, 82, 100, 92], M_ + 1); ln(g, [154, 80, 186, 74], M_ + 1);
      if (o.talk) openMouth(g, 30, 14); else qc(g, 104, 170, 126, 182, 154, 162, M_); },
    // F4 evil teeth grin
    F4: (g, o) => { ln(g, [62, 82, 104, 100], H_); ln(g, [194, 82, 152, 100], H_); ell(g, EL[0], 116, 8, 10); ell(g, ER[0], 116, 8, 10);
      const w = 70, y0 = 154; g.fillStyle = '#2a0608'; g.strokeStyle = K; g.lineWidth = M_; g.beginPath(); g.moveTo(MO[0] - w, y0); g.quadraticCurveTo(MO[0], y0 + (o.talk ? 74 : 56), MO[0] + w, y0); g.quadraticCurveTo(MO[0], y0 + 18, MO[0] - w, y0); g.fill();
      g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(MO[0] - w, y0, 2 * w, 22); for (let i = 1; i < 6; i++) ln(g, [MO[0] - w + (i * 2 * w) / 6, y0 + 4, MO[0] - w + (i * 2 * w) / 6, y0 + 22], 2.4); g.restore(); g.stroke();
      ln(g, [52, 150, 58, 160], 3.5); ln(g, [204, 150, 198, 160], 3.5); },
    // F5 happy squint: ^ ^ + wide open D with tongue + blush
    F5: (g, o) => { qc(g, EL[0] - 15, 118, EL[0], 92, EL[0] + 15, 118, M_); qc(g, ER[0] - 15, 118, ER[0], 92, ER[0] + 15, 118, M_);
      const w = o.talk ? 36 : 35; g.fillStyle = '#4a0a10'; g.strokeStyle = K; g.lineWidth = M_; g.beginPath(); g.moveTo(MO[0] - w, 156); g.lineTo(MO[0] + w, 156); g.quadraticCurveTo(MO[0] + w, 206, MO[0], 208); g.quadraticCurveTo(MO[0] - w, 206, MO[0] - w, 156); g.fill(); g.stroke();
      g.save(); g.clip(); ell(g, MO[0], 204, 22, 14, '#e8506a'); g.fillStyle = '#fff'; g.fillRect(MO[0] - w, 156, 2 * w, 8); g.restore(); blush(g, 0.5); },
    // F6 laugh with tongue
    F6: (g, o) => { ell(g, EL[0], 110, 9, 15); ell(g, ER[0], 110, 9, 15); ln(g, [150, 84, 186, 76], M_);
      g.fillStyle = '#5a0d12'; g.strokeStyle = K; g.lineWidth = M_; g.beginPath(); g.moveTo(88, 152); g.lineTo(168, 152); g.quadraticCurveTo(166, 214, 128, 214); g.quadraticCurveTo(90, 214, 88, 152); g.fill(); g.stroke(); g.save(); g.clip(); ell(g, 134, 210, 26, 16, '#e8506a'); g.restore(); },
    // F7 shock "o"
    F7: (g, o) => { if (o.lash) eyesNeutral(g, o, 6); else { disc(g, EL[0] - 12, EL[1], 10); disc(g, ER[0] + 12, ER[1], 10); disc(g, EL[0] - 15, EL[1] - 4, 3, '#fff'); disc(g, ER[0] + 9, ER[1] - 4, 3, '#fff'); }
      qc(g, 62, 74, 76, 64, 96, 70, S_); qc(g, 160, 70, 180, 64, 194, 74, S_); g.strokeStyle = K; g.lineWidth = M_; g.beginPath(); g.ellipse(134, 178, o.talk ? 12 : 8, o.talk ? 14 : 10, 0, 0, 7); g.fillStyle = K; g.fill(); },
    // F8 oh-no red dot
    F8: (g, o) => { if (o.lash) eyesNeutral(g, o, 8); else { disc(g, EL[0] - 14, EL[1], 12); disc(g, ER[0] + 14, ER[1], 12); disc(g, EL[0] - 18, EL[1] - 5, 3.4, '#fff'); disc(g, ER[0] + 10, ER[1] - 5, 3.4, '#fff'); }
      g.fillStyle = '#d81e2a'; g.strokeStyle = K; g.lineWidth = 4.5; g.beginPath(); g.arc(MO[0], 180, o.talk ? 13 : 10, 0, 7); g.fill(); g.stroke(); },
    // F9 pleading / sad
    F9: (g, o) => { [EL, ER].forEach(([x, y]) => { ell(g, x, y + 2, 15, 18); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y + 15, 11, 4, 0, 0, PI); g.fill(); disc(g, x - 5, y - 5, 6, '#fff'); disc(g, x + 6, y + 6, 2.5, '#fff'); });
      ln(g, [64, 90, 102, 82], 3); ln(g, [192, 90, 154, 82], 3); qc(g, 108, 182, 128, 166, 148, 182, M_); qc(g, 74, 136, 86, 142, 98, 136, 2.4); qc(g, 158, 136, 170, 142, 182, 136, 2.4); tear(g, 76, 132, 34); blush(g, 0.35); },
    // F10 worried peek + sweat drop
    F10: (g, o) => { eyesNeutral(g, o); ln(g, [62, 88, 100, 78], S_); ln(g, [194, 88, 156, 78], S_);
      if (o.talk) openMouth(g, 18, 14); else ln(g, [116, 176, 122, 172, 128, 176, 134, 172, 140, 176], 3.5); sweat(g, 204, 92, 1.2); },
    // F11 rage
    F11: (g, o) => { ln(g, [58, 80, 108, 104], H_ + 1); ln(g, [198, 80, 148, 104], H_ + 1); ln(g, [128, 86, 128, 100], 3);
      [EL, ER].forEach(([x, y], i) => { g.fillStyle = K; g.beginPath(); g.moveTo(x - 14, y + (i ? 0 : -4)); g.lineTo(x + 14, y + (i ? -4 : 0)); g.lineTo(x + 10, y + 8); g.lineTo(x - 10, y + 8); g.closePath(); g.fill(); });
      g.fillStyle = '#3a0608'; g.strokeStyle = K; g.lineWidth = H_ - 2; g.beginPath(); g.moveTo(92, 194); g.lineTo(100, 160); g.lineTo(156, 160); g.lineTo(164, 194); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.fillRect(102, 164, 52, 10);
      ln(g, [70, 152, 80, 170], 3.5); ln(g, [186, 152, 176, 170], 3.5); },
    // F12 mega scream: > < eyes, tall mouth 46 % of the face, teeth bar, tongue
    F12: (g, o) => { ln(g, [64, 88, 98, 102, 64, 116], H_); ln(g, [192, 88, 158, 102, 192, 116], H_);
      const x0 = 86, x1 = 170, y0 = 132, y1 = 250; g.fillStyle = '#2a0408'; g.strokeStyle = K; g.lineWidth = H_; g.beginPath(); g.moveTo(x0 + 18, y0); g.lineTo(x1 - 18, y0); g.quadraticCurveTo(x1 + 4, y0, x1, y0 + 30); g.lineTo(x1 - 4, y1 - 24); g.quadraticCurveTo(x1 - 8, y1, MO[0], y1); g.quadraticCurveTo(x0 + 8, y1, x0 + 4, y1 - 24); g.lineTo(x0, y0 + 30); g.quadraticCurveTo(x0 - 4, y0, x0 + 18, y0); g.closePath(); g.fill();
      g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(x0, y0, x1 - x0, 20); for (let i = 1; i < 5; i++) ln(g, [x0 + (i * (x1 - x0)) / 5, y0, x0 + (i * (x1 - x0)) / 5, y0 + 20], 2.4); ell(g, MO[0], y1 - 18, 30, 22, '#f07aa0'); g.restore(); g.stroke();
      [[40, 70], [214, 66], [34, 150]].forEach(([x, y]) => { ln(g, [x - 6, y, x + 6, y], 2.4, '#fff'); ln(g, [x, y - 6, x, y + 6], 2.4, '#fff'); }); },
    // F13 googly terror
    F13: (g, o) => { [[EL, [-8, -10]], [ER, [9, 8]]].forEach(([[x, y], l]) => { g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.arc(x, y - 4, 34, 0, 7); g.fill(); g.stroke(); disc(g, x + l[0], y - 4 + l[1], 7); qc(g, x - 22, y + 36, x, y + 46, x + 22, y + 36, 4); });
      qc(g, 48, 70, 80, 36, 112, 62, H_); qc(g, 144, 62, 176, 36, 208, 70, H_);
      g.fillStyle = '#2a0408'; g.strokeStyle = K; g.lineWidth = M_ + 1; g.beginPath(); g.moveTo(92, 214); g.quadraticCurveTo(100, 176, 110, 182); g.quadraticCurveTo(128, 170, 146, 182); g.quadraticCurveTo(156, 176, 164, 214); g.quadraticCurveTo(128, 204, 92, 214); g.fill();
      g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(90, 176, 76, 14); for (let i = 1; i < 6; i++) ln(g, [90 + i * 12.6, 176, 90 + i * 12.6, 190], 2); g.restore(); g.stroke(); blush(g, 0.55); },
    // F14 strain / clenched
    F14: (g, o) => { ln(g, [66, 100, 100, 112, 66, 124], H_); ln(g, [190, 100, 156, 112, 190, 124], H_); [[44, 96], [212, 96]].forEach(([x, y]) => { ln(g, [x, y, x - 10, y - 8], 3); ln(g, [x, y + 12, x - 12, y + 14], 3); });
      g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = M_; g.beginPath(); g.moveTo(88, 160); g.lineTo(168, 160); g.lineTo(160, 190); g.lineTo(96, 190); g.closePath(); g.fill(); g.stroke(); ln(g, [90, 175, 166, 175], 3); for (let i = 1; i < 6; i++) ln(g, [92 + i * 12.5, 160, 94 + i * 12.5, 190], 2.6); ln(g, [52, 82, 102, 96], H_ - 1); ln(g, [204, 82, 154, 96], H_ - 1); },
    // F15 shiver
    F15: (g, o) => { [EL, ER].forEach(([x, y]) => { g.save(); g.beginPath(); g.rect(x - 12, y - 2, 24, 20); g.clip(); ell(g, x, y + 4, 9, 11); g.restore(); ln(g, [x - 12, y - 2, x + 12, y - 2], M_); });
      g.strokeStyle = K; g.lineWidth = 3.5; g.beginPath(); g.moveTo(116, 174); g.quadraticCurveTo(122, 184, 128, 174); g.quadraticCurveTo(134, 184, 140, 174); g.stroke(); qc(g, 48, 130, 38, 154, 48, 178, 4); qc(g, 208, 130, 218, 154, 208, 178, 4); },
    // F16 doll creepy (never animates)
    F16: (g, o) => { [EL, ER].forEach(([x, y]) => { ell(g, x, y, 16, 20, '#0a0606'); for (let i = 0; i < 6; i++) disc(g, x + Math.cos(i) * 16, y + Math.sin(i * 1.7) * 19, 2, '#6a3a20'); });
      ln(g, [70, 84, 100, 82], 1.6, '#6a3a20'); ln(g, [156, 82, 186, 84], 1.6, '#6a3a20'); [[56, 150], [200, 150]].forEach(([x, y]) => { const gr = g.createRadialGradient(x, y, 2, x, y, 22); gr.addColorStop(0, 'rgba(232,80,143,0.7)'); gr.addColorStop(1, 'rgba(232,80,143,0)'); g.fillStyle = gr; g.fillRect(x - 24, y - 24, 48, 48); });
      ell(g, MO[0], 182, 10, 6, '#d62b2b'); [-4, 0, 4].forEach((d) => disc(g, MO[0] + d, 180, 1.2, '#fff')); ln(g, [118, 182, 108, 178], 1.6); ln(g, [138, 182, 148, 178], 1.6); ln(g, [140, 0, 132, 40, 146, 70, 136, 96], 2.4); },
  };
  // overlays usable by name suffix: '+blush', '+sweat', '+tears'
  GN.FACES = F;
  GN.FACE_LIST = Object.keys(F);
  const FT = {};
  GN.faceTex = function (name, o = {}) {
    const key = name + '|' + (o.lash ? 'L' : '') + (o.tierA ? 'A' : ''); if (FT[key]) return FT[key];
    const c = cnv(FW, FH), g = c.getContext('2d'); g.setTransform(2.386, 0, 0, 2.306, 14.6, -68.9);
    const talk = name.endsWith('-talk'), base = name.replace('-talk', '').split('+'), fn = F[base[0]] || F.F1;
    fn(g, { talk, lash: o.lash, tierA: o.tierA });
    base.slice(1).forEach((ov) => { if (ov === 'blush') blush(g); if (ov === 'sweat') sweat(g, 206, 96, 1.2); if (ov === 'tears') { tear(g, 78, 128); tear(g, 178, 128); } });
    const t = tex(c); t.anisotropy = 8; return (FT[key] = t);
  };

  // =============================== HAIR (spec head-units) ===============================
  const HM = (c, o = {}) => once('hm' + c + JSON.stringify(o), () => new T.MeshPhysicalMaterial({ color: c, roughness: o.rough ?? 0.5, clearcoat: o.gloss ?? 0.3, clearcoatRoughness: 0.45, flatShading: !!o.flat, side: o.side || T.FrontSide }));
  const knitHM = (c) => once('khm' + c, () => { const m = GN.mat('knit', { c, tile: 0.5, bump: 4, seed: 61 }).clone(); m.map = m.map.clone(); m.normalMap = m.normalMap.clone(); [m.map, m.normalMap].forEach((t) => { t.repeat.set(3, 2); t.needsUpdate = true; }); return m; });
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
  // flattened cone "shard" from `from` toward `dir`, its thin axis facing away from the head centre
  function shard(g, mat, r, h, from, dir, o = {}) {
    const geo = new T.ConeGeometry(r, h, o.seg || 4, 1); geo.translate(0, h / 2, 0); geo.scale(1, 1, o.flat ?? 0.42);
    const m = M(geo, mat), Y = V(...dir).normalize(), out = V(from[0], from[1] - 0.05, from[2]).normalize();
    let Z = out.clone().addScaledVector(Y, -out.dot(Y)); if (Z.lengthSq() < 1e-4) Z = V(0, 0, 1); Z.normalize(); const X = new T.Vector3().crossVectors(Y, Z);
    m.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(X, Y, Z)); if (o.roll) m.rotateY(o.roll); m.position.set(...from); g.add(m);
    if (o.under) { const u = M(geo, o.under); u.quaternion.copy(m.quaternion); u.rotateY(o.roll2 ?? 0.35); u.rotateZ(0.12); u.scale.setScalar(0.94); u.position.set(...from).addScaledVector(out, -0.03); u.position.y -= 0.03; g.add(u); }
    return m;
  }
  // push any hair vertex that sits in front of the face back inside the head (keeps faces readable)
  function clearFace(geo, hl = 0.26) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (y >= hl || z <= 0) continue;
      const ang = Math.abs(Math.atan2(x, z)), r = Math.hypot(x, z); if (ang > 1.4) continue;
      const k = THREE.MathUtils.smoothstep(ang, 1.15, 1.4), lim = 0.44 + k * (r - 0.44);   // inside the face sector: tuck behind the face surface
      if (r > lim) { const f = lim / r; p.setX(i, x * f); p.setZ(i, z * f); } }
    geo.computeVertexNormals(); return geo;
  }
  const baked = (geo, s, pos, rot) => { const m = new T.Matrix4().compose(V(...pos), new T.Quaternion().setFromEuler(new T.Euler(...(rot || [0, 0, 0]))), V(...s)); return geo.clone().applyMatrix4(m); };
  // skull cap: half ellipsoid (+ back skirt down to the nape), tipped back so the brows stay visible
  function cap(g, mat, o = {}) {
    const r = o.r || 0.58, s = o.s || [1.1, 1.0, 1.1], y = o.y ?? 0.08, tilt = o.tilt ?? -0.2;
    const top = M(baked(new T.SphereGeometry(r, 40, 20, 0, PI * 2, 0, PI * 0.52), s, [0, y, -0.02], [tilt, 0, 0]), mat); g.add(top);
    const back = M(baked(new T.SphereGeometry(r * 0.98, 32, 14, PI + 0.3, PI - 0.6, PI * 0.5, PI * 0.42), s, [0, y, -0.02], [tilt, 0, 0]), mat); g.add(back);
    if (o.sides !== false) [-1, 1].forEach((sx) => { const sd = M(baked(new T.SphereGeometry(0.3, 16, 12), [0.42, 1.25, 0.9], [sx * 0.47, -0.02, -0.08]), mat); g.add(sd); });
    return top;
  }
  const H = {};
  // H1 shard mop (hero): 12-16 flat-shaded wedges, ~1.45x head, fringe over the forehead, cat-ear crown + ahoge
  H.H1 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { flat: true, rough: 0.55 }), u = HM(o.under || shade(c, 0.72), { flat: true }), k = o.k || 1.15;
    g.add(M(clearFace(baked(new T.SphereGeometry(0.55, 32, 18, 0, PI * 2, 0, PI * 0.62), [1.04, 0.98, 1.04], [0, 0.06, -0.03])), m));
    const ring = (n, rr, y, from, to, len, r, elev, mats) => { for (let i = 0; i < n; i++) { const a = from + ((to - from) * (i + 0.5)) / n, ca = Math.cos(a), sa = Math.sin(a), jit = ((i * 37) % 7) / 7 - 0.5;
      shard(g, mats[i % mats.length], r * (1 + jit * 0.2), len * k * (1 + jit * 0.3), [sa * rr, y, ca * rr], [sa * Math.cos(elev + jit * 0.3), Math.sin(elev + jit * 0.3), ca * Math.cos(elev + jit * 0.3)], { under: u, roll2: i % 2 ? 0.45 : -0.45, flat: 0.55 }); } };
    // crown (up and out), upper ring, lower ring hanging over the ears and nape (front sector left open for the face)
    ring(5, 0.24, 0.5, 0.6, PI * 2 - 0.6, 0.27, 0.27, 0.05, [m, m, u]);
    ring(11, 0.47, 0.32, 0.8, PI * 2 - 0.8, 0.34, 0.27, -0.45, [m, u, m]);
    ring(9, 0.5, 0.02, 1.3, PI * 2 - 1.3, 0.38, 0.26, -1.15, [m, m, u]);
    [-1, 1].forEach((sx) => { shard(g, m, 0.25, 0.4 * k, [sx * 0.47, 0.32, 0.3], [sx * 0.95, -0.45, 0.3], { under: u, flat: 0.4 }); shard(g, u, 0.22, 0.38 * k, [sx * 0.5, 0.08, 0.22], [sx * 0.75, -0.95, 0.25], { under: u, flat: 0.4 }); });
    // fringe: 5 chunky locks, centre ones shorter, ending in points above the eyes
    [[-0.36, 0.34, -0.45], [-0.18, 0.3, -0.2], [0.0, 0.27, 0.05], [0.18, 0.31, 0.25], [0.36, 0.35, 0.5]].forEach(([x, h, tl], i) => shard(g, i % 2 ? u : m, 0.21, h, [x, 0.54, 0.44], [Math.sin(tl) * 0.75, -1, 0.32], { under: u, flat: 0.38, roll2: i % 2 ? 0.4 : -0.4 }));
    // ahoge + cat-ear pair
    shard(g, m, 0.12, 0.42 * k, [-0.12, 0.56, 0.0], [-0.45, 1, 0.25], { under: u }); [-1, 1].forEach((sx) => shard(g, m, 0.2, 0.3 * k, [sx * 0.3, 0.5, 0.08], [sx * 0.7, 1, 0.15], { under: u, flat: 0.4 }));
    return g; };
  // H2 spike fan
  H.H2 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { flat: true }), u = HM(o.tip || shade(c, 0.7), { flat: true }); cap(g, m, {});
    const N = 8; for (let i = 0; i < N; i++) { const a = -1.15 + (2.3 * i) / (N - 1), el = 0.35 + 0.5 * Math.abs(Math.sin(i * 1.7)); shard(g, i % 2 ? m : u, 0.17, 0.62 + 0.3 * ((i * 7) % 3) / 2, [Math.sin(a) * 0.35, 0.45, -0.05 - Math.cos(a) * 0.15], [Math.sin(a) * 0.8, Math.cos(el), -0.55], { under: u, seg: 4 }); }
    [-1, 1].forEach((sx) => { shard(g, m, 0.13, 0.42, [sx * 0.52, 0.18, -0.05], [sx, 0.35, -0.25], { under: u }); shard(g, m, 0.12, 0.36, [sx * 0.5, -0.02, -0.18], [sx, -0.1, -0.4], { under: u }); });
    // swoopy lock over one eye
    shard(g, m, 0.16, 0.42, [0.12, 0.47, 0.5], [0.75, -1, 0.5], { under: u }); shard(g, m, 0.14, 0.32, [-0.22, 0.45, 0.5], [-0.3, -1, 0.5], { under: u });
    return g; };
  // H3 space buns with bobbles
  H.H3 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.35, gloss: 0.6 }), bob = HM(o.bobble || '#D81E1E', { rough: 0.3 });
    g.add(M(clearFace(baked(new T.SphereGeometry(0.6, 40, 28, 0, PI * 2, 0, PI * 0.62), [1.06, 0.98, 1.06], [0, 0.04, -0.02])), m));
    [-1, 1].forEach((sx) => { g.add(M(new T.SphereGeometry(o.bun || 0.32, 28, 20), m, sx * 0.42, 0.56, -0.06)); g.add(M(new T.SphereGeometry(0.08, 14, 10), bob, sx * 0.3, 0.38, 0.04));
      g.add(M(baked(new T.BoxGeometry(0.13, 0.62, 0.3), [1, 1, 1], [sx * 0.5, 0.04, 0.12]), m)); });
    g.add(M(baked(new T.BoxGeometry(0.96, 0.17, 0.12), [1, 1, 1], [0, 0.34, 0.47], [0.2, 0, 0]), m));
    const ring = new T.TubeGeometry(new T.CatmullRomCurve3([V(-0.5, -0.02, 0.2), V(-0.58, -0.14, 0.24), V(-0.5, -0.24, 0.26), V(-0.58, -0.36, 0.22)]), 20, 0.045, 8); g.add(M(ring, m));
    return g; };
  // H4 emo side-sweep
  H.H4 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { flat: true }), u = HM(o.under || '#4A0E14', { flat: true }); cap(g, m, {});
    const fr = M(baked(new T.BoxGeometry(0.78, 0.56, 0.08, 4, 4, 1), [1, 1, 1], [-0.1, 0.24, 0.53], [0.08, 0, -0.38]), m); g.add(fr);
    shard(g, m, 0.2, 0.5, [-0.22, 0.2, 0.55], [-0.2, -1, 0.3], { under: u });
    [[-0.2, 0.3], [0.05, 0.5], [0.28, 0.25], [0.12, -0.2]].forEach(([x, a]) => shard(g, m, 0.12, 0.3, [x, 0.5, -0.1], [a, 1, -0.5], { under: u }));
    [-0.3, 0, 0.3].forEach((x) => shard(g, m, 0.13, 0.32, [x, -0.05, -0.48], [x, -1, -0.35], { under: u }));
    return g; };
  // H5 mad-professor mane + beard + moustache (old men), 1.55x
  H.H5 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.8, gloss: 0.05 }), d = HM(shade(c, 0.8), { rough: 0.85, gloss: 0 });
    const blobs = [[0, 0.5, -0.1, 0.34], [-0.42, 0.42, -0.05, 0.3], [0.42, 0.42, -0.05, 0.3], [-0.6, 0.12, -0.08, 0.3], [0.6, 0.12, -0.08, 0.3], [-0.3, 0.3, -0.38, 0.32], [0.3, 0.3, -0.38, 0.32], [0, 0.1, -0.5, 0.33], [-0.66, -0.18, -0.1, 0.24], [0.66, -0.18, -0.1, 0.24], [0.18, 0.66, 0.05, 0.22], [-0.2, 0.62, 0.12, 0.2]];
    blobs.forEach(([x, y, z, r], i) => g.add(M(clearFace(baked(new T.IcosahedronGeometry(r, 1), [1.1, 0.95, 1], [x, y, z], [i, i * 0.7, 0]), 0.3), i % 3 ? m : d)));
    if (o.beard !== false) { const bd = new T.Group(); bd.position.y = o.beardDY || 0; [[0, -0.5, 0.34, 0.36], [-0.25, -0.45, 0.3, 0.26], [0.25, -0.45, 0.3, 0.26], [0, -0.82, 0.32, 0.3], [-0.2, -0.75, 0.26, 0.22], [0.2, -0.75, 0.26, 0.22], [0, -1.05, 0.28, 0.2]].forEach(([x, y, z, r], i) => bd.add(M(baked(new T.IcosahedronGeometry(r, 1), [1.15, 1, 0.75], [x, y, z], [i, 0, i]), i % 2 ? m : d))); g.add(bd);
      GN.moustache(g, c, 1.05, 'walrus', o.stacheY ?? -0.12); }
    return g; };
  // H6 afro (+ beanie)
  H.H6 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.95, gloss: 0 });
    const geo = baked(new T.IcosahedronGeometry(0.8, 4), [1, 0.82, 0.92], [0, 0.18, -0.12]); const p = geo.attributes.position, n = fbm(7, 4, 3);
    for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + 0.07 * (n(Math.atan2(v.x, v.z) / 6.28 + 0.5, v.y * 0.5 + 0.5) - 0.5) * 2; p.setXYZ(i, v.x * k, (v.y - 0.18) * k + 0.18, (v.z + 0.12) * k - 0.12); }
    g.add(M(clearFace(geo, 0.2, 0.55), m));
    if (o.beanie) { const b = M(new T.SphereGeometry(0.6, 32, 16, 0, PI * 2, 0, PI / 2), knitHM(o.beanie), 0, 0.5, -0.05); b.scale.set(1, 0.9, 1); g.add(b); g.add(M(new T.CylinderGeometry(0.62, 0.62, 0.14, 32), knitHM(shade(o.beanie, 0.8)), 0, 0.5, -0.05)); }
    return g; };
  // H7 pompadour / quiff
  H.H7 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.3, gloss: 0.8 }); cap(g, m, { s: [1.02, 0.85, 1.04], tilt: -0.3 });
    g.add(M(baked(RBX.rbox(1.0, 0.42, 1.0, 0.18, 6), [1, 1, 1], [0, 0.58, 0.02], [-0.15, 0, 0]), m));
    const roll = M(new T.TorusGeometry(0.3, 0.17, 12, 24, PI), m, 0, 0.6, 0.38); roll.rotation.y = PI / 2; roll.rotation.x = 0; g.add(roll);
    const curl = M(new T.TorusGeometry(0.07, 0.025, 8, 16, PI * 1.5), m, 0.08, 0.36, 0.53); g.add(curl); return g; };
  // H8 pigtails with bobbles + choppy bangs
  H.H8 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { flat: true, rough: 0.5 }), bob = HM(o.bobble || '#E040A8', { rough: 0.3 }); cap(g, m, { tilt: -0.2 });
    const pu = HM(shade(c, 0.78), { flat: true });
    [-1, 1].forEach((sx) => { [[0.3, 0.6, 0.32], [-0.2, 0.62, 0.3], [-0.75, 0.52, 0.28], [0.05, 0.72, 0.34]].forEach(([el, len, r], i) => shard(g, i % 2 ? pu : m, r, len * (o.len || 1), [sx * 0.55, 0.4, -0.08], [sx * Math.cos(el), Math.sin(el), -0.15 + i * 0.08], { under: pu, flat: 0.55 }));
      g.add(M(new T.SphereGeometry(0.11, 16, 12), bob, sx * 0.55, 0.42, -0.02)); g.add(M(new T.SphereGeometry(0.09, 16, 12), bob, sx * 0.58, 0.5, 0.08)); });
    for (let i = 0; i < 8; i++) { const x = -0.42 + i * 0.12; shard(g, m, 0.085, 0.2 + ((i * 5) % 3) * 0.04, [x, 0.42, 0.5], [x * 0.25, -1, 0.35], { flat: 0.3, seg: 3 }); }
    return g; };
  // H9 bob with band + bow
  H.H9 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.35, gloss: 0.6 }), band = HM(o.band || '#E4208F', { rough: 0.4 });
    const geo = clearFace(baked(RBX.rbox(1.18, 1.0, 1.16, 0.3, 8), [1, 1, 1], [0, 0.06, -0.04]), 0.3, 0.5); g.add(M(geo, m));
    g.add(M(baked(new T.BoxGeometry(0.98, 0.18, 0.1), [1, 1, 1], [0.05, 0.36, 0.52], [0.15, 0, -0.12]), m));
    const hb = M(new T.TorusGeometry(0.6, 0.04, 8, 32, PI), band, 0, 0.36, 0.02); hb.rotation.y = PI / 2; hb.rotation.z = 0; hb.scale.set(1, 0.9, 1); g.add(hb);
    [-1, 1].forEach((s) => { const b = M(new T.ConeGeometry(0.12, 0.2, 3), band, 0.48 + s * 0.11, 0.5, 0.15); b.rotation.z = s * PI / 2; g.add(b); });
    return g; };
  // H10 grandma swirl (stacked shrinking tori) + optional cloud wrap
  H.H10 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.7, gloss: 0.15 }), d = HM(shade(c, 0.86), { rough: 0.75, gloss: 0.1 });
    g.add(M(clearFace(baked(new T.SphereGeometry(0.6, 40, 24, 0, PI * 2, 0, PI * 0.6), [1.08, 0.98, 1.08], [0, 0.06, -0.02])), m));
    if (o.cloud !== false) [[-0.5, 0.2, 0.1], [0.5, 0.2, 0.1], [-0.56, -0.12, -0.05], [0.56, -0.12, -0.05], [-0.36, 0.4, -0.32], [0.36, 0.4, -0.32], [0, 0.3, -0.5], [0, -0.05, -0.52]].forEach(([x, y, z], i) => g.add(M(clearFace(baked(new T.IcosahedronGeometry(0.3, 2), [1, 0.92, 1], [x, y, z]), 0.3), i % 2 ? m : d)));
    [[0.4, 0.6], [0.3, 0.82], [0.19, 1.0], [0.09, 1.13]].forEach(([r, y], i) => { const t = M(new T.TorusGeometry(r, 0.11 - i * 0.012, 14, 36), i % 2 ? d : m, 0, y, -0.04); t.rotation.x = PI / 2; t.rotation.z = i; t.scale.set(1, 1, 1.25); g.add(t); });
    g.add(M(new T.SphereGeometry(0.1, 16, 12), m, 0, 1.2, -0.04));
    if (o.pin) { g.add(_set(M(new T.CylinderGeometry(0.02, 0.02, 0.7, 6), HM(o.pin, { rough: 0.3 }), 0.1, 0.92, -0.04), 'rotation', 'z', 1.2)); }
    return g; };
  // H12 beanie with pom-pom, hair poking out
  H.H12 = (c, o = {}) => { const g = new T.Group(), km = knitHM(c), pom = HM(o.pom || '#8A6A58', { rough: 1, gloss: 0 }), hm = HM(o.hair || '#F07A1A', { flat: true });
    const b = M(new T.SphereGeometry(0.6, 36, 18, 0, PI * 2, 0, PI / 2), km, 0, 0.18, -0.02); b.scale.set(1, 1.08, 1); b.rotation.x = -0.12; g.add(b);
    const cuff = M(new T.CylinderGeometry(0.63, 0.64, 0.2, 36), knitHM(shade(c, 0.85)), 0, 0.2, -0.02); cuff.rotation.x = -0.12; g.add(cuff);
    g.add(M(new T.IcosahedronGeometry(0.22, 2), pom, 0, 0.88, -0.12));
    [-1, 1].forEach((sx) => { shard(g, hm, 0.1, 0.26, [sx * 0.52, 0.1, 0.12], [sx, -0.6, 0.2]); shard(g, hm, 0.09, 0.22, [sx * 0.5, 0.06, -0.15], [sx, -0.9, -0.2]); });
    return g; };
  // H13 long wavy + fox tufts / ponytail
  H.H13 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.4, gloss: 0.5 }); cap(g, m, {});
    const geo = new T.PlaneGeometry(1.2, 1.3, 8, 12); geo.translate(0, -0.45, 0); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -0.52 - 0.2 * (x / 0.6) ** 2 * -1 + 0.05 * Math.sin(y * 8)); p.setX(i, x * (1 + 0.15 * Math.sin(y * 5))); }
    geo.computeVertexNormals(); const back = M(geo, HM(c, { rough: 0.4, gloss: 0.5, side: T.DoubleSide }), 0, 0.15, 0); g.add(back);
    [-1, 1].forEach((sx) => g.add(M(baked(new T.BoxGeometry(0.14, 0.9, 0.36), [1, 1, 1], [sx * 0.52, -0.2, 0.1]), m)));
    if (o.fox) [-1, 1].forEach((sx) => shard(g, m, 0.13, 0.32, [sx * 0.22, 0.52, 0], [sx * 0.3, 1, 0], { flat: 0.6 }));
    g.add(M(baked(new T.BoxGeometry(1.0, 0.18, 0.1), [1, 1, 1], [0, 0.36, 0.5], [0.2, 0, 0.12]), m)); return g; };
  // H14 top-knot bun (reads like a second head)
  H.H14 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.4, gloss: 0.5 });
    g.add(M(clearFace(baked(new T.SphereGeometry(0.6, 40, 24, 0, PI * 2, 0, PI * 0.6), [1.06, 0.98, 1.06], [0, 0.06, -0.02])), m));
    g.add(M(new T.SphereGeometry(o.bun || 0.32, 28, 20), m, 0, 0.86, -0.06)); g.add(_set(M(new T.TorusGeometry(0.2, 0.05, 8, 24), HM(o.tie || '#7a2a8a'), 0, 0.62, -0.05), 'rotation', 'x', PI / 2));
    g.add(M(baked(new T.BoxGeometry(0.9, 0.16, 0.1), [1, 1, 1], [0.08, 0.34, 0.5], [0.2, 0, -0.18]), m)); return g; };
  // H15 bald with side tufts + handlebar moustache
  H.H15 = (c, o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.8, gloss: 0.05 });
    [-1, 1].forEach((sx) => { const w = M(new T.IcosahedronGeometry(0.2, 2), m, sx * 0.52, 0.08, -0.08); w.scale.set(0.8, 1, 1.3); g.add(w); });
    if (o.stache !== false) GN.moustache(g, o.stacheC || c, 1, o.stacheStyle || 'handlebar');
    return g; };
  // swept tube with a radius profile r(t) and a strand ripple, flattened against the face (z scale)
  GN.sweep = (pts, rf, o = {}) => { const cv = new T.CatmullRomCurve3(pts), n = o.n || 40, rs = o.rs || 14, fr = cv.computeFrenetFrames(n, false), pos = [], idx = [], P = new T.Vector3();
    for (let i = 0; i <= n; i++) { const t = i / n; cv.getPointAt(t, P); const r = rf(t), N = fr.normals[i], B = fr.binormals[i];
      for (let j = 0; j <= rs; j++) { const th = (j / rs) * PI * 2, rr = r * (1 + (o.ripple ?? 0.07) * Math.sin(th * 7 + t * 9)), cx = Math.cos(th), sx = Math.sin(th);
        pos.push(P.x + rr * (cx * N.x + sx * B.x), P.y + rr * (cx * N.y + sx * B.y), P.z + rr * (cx * N.z + sx * B.z) * (o.flatZ ?? 1)); } }
    for (let i = 0; i < n; i++) for (let j = 0; j < rs; j++) { const a = i * (rs + 1) + j, b = a + rs + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  // real moustache shapes (head units, mouth at y -0.2): 'handlebar' (tapered, curled-up tips), 'walrus' (fat, droops past the
  // mouth corners), 'chevron' (thick, short, blunt). Each half is one swept, tapered tube hugging the face curve.
  GN.moustache = (g, c, w = 1, style = 'handlebar', y0 = -0.12) => { const m = HM(c, { rough: 0.65, gloss: 0.1, side: T.DoubleSide }), dark = HM(shade(c, 0.7), { rough: 0.7, gloss: 0 });
    const fz = (x) => Math.sqrt(Math.max(0.01, 0.25 - x * x)) + 0.03;
    const S = { handlebar: { pts: [[0, 0], [0.1, -0.03], [0.22, -0.05], [0.32, -0.02], [0.38, 0.06], [0.34, 0.12], [0.29, 0.1]], r: (t) => 0.085 * Math.pow(1 - t, 0.75) + 0.014 - 0.03 * Math.max(0, 0.1 - t) },
      walrus: { pts: [[0, 0.01], [0.12, -0.02], [0.24, -0.08], [0.3, -0.17], [0.31, -0.26]], r: (t) => 0.11 * (1 - 0.55 * t * t) + 0.012 },
      chevron: { pts: [[0, 0.01], [0.12, -0.01], [0.24, -0.05], [0.3, -0.09]], r: (t) => 0.1 * (1 - 0.35 * t) } }[style] || null;
    const st = S || { pts: [[0, 0], [0.1, -0.03], [0.22, -0.05], [0.32, -0.02], [0.38, 0.06], [0.34, 0.12], [0.29, 0.1]], r: (t) => 0.085 * Math.pow(1 - t, 0.75) + 0.014 };
    [-1, 1].forEach((sx) => { const pts = st.pts.map(([x, y]) => V(sx * x * w, y0 + y * w, fz(x * w)));
      const geo = GN.sweep(pts, (t) => st.r(t) * w, { flatZ: 0.75 }); g.add(M(geo, m)); });
    const ctr = M(new T.SphereGeometry(0.08 * w, 16, 12), dark, 0, y0 + 0.01, fz(0) - 0.02); ctr.scale.set(1.3, 0.8, 0.7); g.add(ctr); return g; };
  // propeller beanie (meme hat): 4 colour gores + spinner
  H.prop = () => { const g = new T.Group(), Cs = ['#E0101A', '#2D4FA0', '#F5D400', '#2E9A3A'];
    Cs.forEach((cc, i) => g.add(M(new T.SphereGeometry(0.58, 12, 10, (i * PI) / 2, PI / 2, 0, PI / 2), HM(cc, { rough: 0.4 }), 0, 0.22, 0)));
    const brim = M(new T.CylinderGeometry(0.42, 0.42, 0.05, 20, 1, false, -PI / 2, PI), HM('#2E9A3A'), 0, 0.24, 0.42); brim.scale.set(1.1, 1, 0.7); g.add(brim);
    g.add(M(new T.CylinderGeometry(0.03, 0.03, 0.2, 6), HM('#888'), 0, 0.88, 0)); [-1, 1].forEach((s) => { const b = M(new T.BoxGeometry(0.5, 0.02, 0.1), HM('#E0101A'), s * 0.25, 0.98, 0); b.rotation.x = s * 0.2; g.add(b); }); return g; };
  // wide-brim / cap hats for extras
  H.cap = (c) => { const g = new T.Group(); g.add(M(new T.SphereGeometry(0.58, 24, 12, 0, PI * 2, 0, PI / 2), HM(c), 0, 0.2, 0)); const br = M(new T.CylinderGeometry(0.45, 0.45, 0.05, 20, 1, false, -PI / 2, PI), HM(c), 0, 0.22, 0.45); br.scale.z = 0.7; g.add(br); return g; };
  GN.HAIR = H;
  GN.hair = (style, c, o) => { const g = (H[style] || H.H1)(c, o || {}); g.name = 'hair-' + style; return g; };

  // =============================== AVATAR ===============================
  // o: { skin, tier:'A'|'B', top:{p:pattern, c, ...pattern opts}, sleeve:'long'|'short'|'none', boxy, cuff, hem, collar,
  //      legs:{p, c}, shoes, sole, gloves, glovesCuff, hair, hairC, hairO, hat, face, lash, scale, headScale, extras:[fn(av)] }
  GN.avatar = function (o = {}) {
    const tierA = o.tier === 'A', skin = o.skin || '#F3D9C2';
    const root = new T.Group(); root.name = 'gn-avatar';
    const body = new T.Group(); body.position.y = 3; root.add(body);
    const top = o.top || { p: 'tee', c: '#A9A5AE' }, legs = o.legs || { p: 'denim', c: '#3a4a6a' };
    const topM = tierA ? GN.mat('flat', { c: top.c, rough: 0.55 }) : GN.mat(top.p || 'tee', Object.assign({ tile: 1 }, top));
    const legM = tierA ? GN.mat('flat', { c: legs.c, rough: 0.55 }) : GN.mat(legs.p || 'denim', Object.assign({ tile: 1 }, legs));
    const skinM = once('skin' + skin, () => new T.MeshPhysicalMaterial({ color: skin, roughness: 0.5, clearcoat: 0.1, clearcoatRoughness: 0.6 }));
    const rib = (c) => GN.mat('rib', { c, tile: 1, bump: 4 });
    const torso = box(2, 2, 1, topM, 0, 0, 0, 0.07, 8); body.add(torso);
    if (o.hem) body.add(box(2.06, 0.3, 1.06, rib(o.hem), 0, -0.86, 0, 0.05));
    if (o.collar) { const t = new T.Mesh(new T.TorusGeometry(0.42, 0.09, 10, 28), rib(o.collar)); t.rotation.x = PI / 2; t.position.y = 1.0; t.scale.set(1.15, 0.8, 1); body.add(t); }
    if (o.vneck) { const m = new T.Mesh(new T.CircleGeometry(0.34, 3), GN.mat('flat', { c: o.vneck })); m.position.set(0, 0.8, 0.505); m.rotation.z = -PI / 2; m.scale.set(1.2, 1, 1); body.add(m); }
    const sw = o.boxy ? 1.16 : 1.0, sleeve = o.sleeve || 'long', handM = o.gloves ? GN.mat(o.glovesP || 'tee', { c: o.gloves, tile: 0.5, rough: 0.8 }) : skinM;
    // R6 shoulder: the joint sits on the torso's side edge 0.5 below its top (Motor6D C0 (+-1, 0.5)); the arm block hangs
    // from it with its top 0.5 above the joint, so any rotation keeps the arm's inner top edge on the torso
    const arm = (x) => { const sx = Math.sign(x), joint = new T.Group(); joint.position.set(sx * 1.0, 0.5, 0); body.add(joint);
      const piv = new T.Group(); piv.position.set(x - sx * 1.0, 0.5, 0); joint.add(piv); joint.inner = piv;
      const sl = sleeve === 'long' ? 1.56 : sleeve === 'short' ? 0.72 : 0;
      if (sl) piv.add(box(sw, sl, sw, topM, 0, -sl / 2, 0, 0.07));
      if (sl < 1.56) piv.add(box(0.94, 1.56 - sl + 0.02, 0.94, skinM, 0, -sl - (1.56 - sl) / 2, 0, 0.05));
      if (o.cuff && sleeve === 'long') piv.add(box(sw + 0.06, 0.28, sw + 0.06, rib(o.cuff), 0, -1.48, 0, 0.05));
      if (o.cuff && sleeve === 'short') piv.add(box(sw + 0.05, 0.16, sw + 0.05, rib(o.cuff), 0, -0.68, 0, 0.04));
      piv.add(box(o.gloves ? 1.0 : 0.94, 0.46, o.gloves ? 1.0 : 0.94, handM, 0, -1.79, 0, 0.1));
      if (o.gloves && o.glovesCuff) piv.add(box(1.08, 0.14, 1.08, GN.mat('flat', { c: o.glovesCuff, rough: 0.7 }), 0, -1.57, 0, 0.04));
      joint.handOff = V(x - sx * 1.0, -1.3, 0); return joint; };
    const armL = arm(1.5 + (sw - 1) / 2), armR = arm(-1.5 - (sw - 1) / 2);
    const shoeM = GN.mat('flat', { c: o.shoes || '#f4f2ee', rough: 0.5 }), soleM = GN.mat('flat', { c: o.sole || '#e8622a', rough: 0.6 });
    const leg = (x) => { const piv = new T.Group(); piv.position.set(x, -1, 0); body.add(piv);
      const pl = o.shoes === false ? 2 : 1.7; piv.add(box(1, pl, 1, legM, 0, -pl / 2, 0, 0.06));
      if (o.shoes !== false) { piv.add(box(1.02, 0.3, 1.12, shoeM, 0, -1.85, 0.05, 0.08)); piv.add(box(1.04, 0.08, 1.14, soleM, 0, -1.96, 0.05, 0.03)); }
      return piv; };
    const legL = leg(0.5), legR = leg(-0.5);
    // head (bevelled cylinder) + conforming face decal
    const neck = new T.Group(); neck.position.set(0, 1, 0); body.add(neck); neck.scale.setScalar(o.headScale || 1);
    const R = 0.6, HH = 1.2, bv = 0.24, rOf = (y) => { const a = Math.abs(y); if (a <= HH / 2 - bv) return R; const d = a - (HH / 2 - bv); return R - bv + Math.sqrt(Math.max(0, bv * bv - d * d)); };
    const prof = [V(0, -HH / 2, 0)]; for (let i = 0; i <= 8; i++) { const a = -PI / 2 + (i / 8) * PI / 2; prof.push(new T.Vector2(R - bv + Math.cos(a) * bv, -HH / 2 + bv + Math.sin(a) * bv)); }
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * PI / 2; prof.push(new T.Vector2(R - bv + Math.cos(a) * bv, HH / 2 - bv + Math.sin(a) * bv)); } prof.push(new T.Vector2(0, HH / 2)); prof[0] = new T.Vector2(0, -HH / 2);
    const head = new T.Group(); head.position.y = 0.04 + HH / 2; neck.add(head);
    const headM = new T.Mesh(new T.LatheGeometry(prof, 56), skinM); headM.castShadow = true; head.add(headM);
    const fp = []; for (let i = 0; i <= 40; i++) { const y = -0.58 + (i / 40) * 1.04; fp.push(new T.Vector2(rOf(y) + 0.004, y)); }
    const faceMat = new T.MeshStandardMaterial({ map: GN.faceTex(o.face || 'F1', { lash: o.lash, tierA }), transparent: true, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const faceM = new T.Mesh(new T.LatheGeometry(fp, 48, -PI / 3, (2 * PI) / 3), faceMat); faceM.renderOrder = 1; head.add(faceM);
    const hairG = new T.Group(); hairG.scale.setScalar(1.2); head.add(hairG);
    if (o.hair) hairG.add(GN.hair(o.hair, o.hairC || '#3a2418', o.hairO));
    if (o.hat) hairG.add(GN.hair(o.hat, o.hatC));
    if (o.stache) GN.moustache(hairG, o.stache, o.stacheW || 1, o.stacheStyle || 'walrus');
    if (o.glasses) { const gm = HM(o.glasses, { rough: 0.3 }); [-1, 1].forEach((s) => { const r = M(new T.TorusGeometry(0.13, 0.025, 8, 24), gm, s * 0.2, 0.06, 0.55); hairG.add(r); }); hairG.add(M(new T.BoxGeometry(0.14, 0.03, 0.03), gm, 0, 0.08, 0.56)); }
    root.scale.setScalar(o.scale || 1);
    const av = { root, body, torso, head, neck, armL, armR, legL, legR, faceMat, hairG, o, lash: !!o.lash, tierA };
    av.setFace = (name) => { av.faceName = name; faceMat.map = GN.faceTex(name, { lash: av.lash, tierA }); faceMat.needsUpdate = true; };
    av.faceName = o.face || 'F1';
    av.pose = (p = {}) => { const set = (g, v = [0, 0, 0]) => g.rotation.set(v[0] || 0, v[1] || 0, v[2] || 0); set(armL, p.armL); set(armR, p.armR); set(legL, p.legL); set(legR, p.legR); set(neck, p.head); set(body, p.body); };
    (o.extras || []).forEach((f) => f(av));
    root.traverse((m) => { if (m.isMesh && m !== faceM) { m.castShadow = true; m.receiveShadow = true; } });
    return av;
  };

  // ---------- layered extras (body-local: torso centre origin, front face z=0.5) ----------
  GN.apron = (c = '#f6f2ea', strap = '#f6f2ea') => (av) => { const m = GN.mat('tee', { c, tile: 1 }); av.body.add(box(1.5, 1.9, 0.06, m, 0, -0.35, 0.53, 0.03)); [-1, 1].forEach((s) => av.body.add(box(0.14, 1.2, 0.04, GN.mat('flat', { c: strap }), s * 0.45, 0.4, 0.55, 0.02)));
    av.legL.add(box(1.02, 1.0, 0.06, m, -0.0, -0.5, 0.53, 0.02)); av.legR.add(box(1.02, 1.0, 0.06, m, 0, -0.5, 0.53, 0.02)); av.body.add(box(2.08, 0.12, 1.08, GN.mat('flat', { c: strap }), 0, -0.6, 0, 0.03)); };
  GN.vest = (c = '#FF6A00', stripe = '#d8d8d8') => (av) => { const m = GN.mat('tee', { c, tile: 1 }); [-1, 1].forEach((s) => av.body.add(box(0.8, 2.02, 1.08, m, s * 0.62, 0, 0, 0.04))); av.body.add(box(2.1, 0.14, 1.1, GN.mat('flat', { c: stripe, rough: 0.2, metalness: 0.4 }), 0, -0.45, 0, 0.02)); };
  GN.overalls = (c = '#3E6FA8') => (av) => { const m = GN.mat('denim', { c, tile: 1 }); av.body.add(box(1.3, 1.0, 0.06, m, 0, -0.1, 0.53, 0.02)); av.body.add(box(2.06, 0.7, 1.06, m, 0, -0.66, 0, 0.04)); [-1, 1].forEach((s) => { av.body.add(box(0.2, 1.1, 0.04, m, s * 0.5, 0.45, 0.55, 0.02)); av.body.add(box(0.2, 1.4, 0.04, m, s * 0.5, 0.3, -0.53, 0.02)); av.body.add(_set(M(new T.CylinderGeometry(0.06, 0.06, 0.04, 12), HM('#e0c060', { rough: 0.2 }), s * 0.5, 0.35, 0.58), 'rotation', 'x', PI / 2)); }); };
  GN.suspenders = (c = '#111') => (av) => [-1, 1].forEach((s) => { av.body.add(box(0.16, 2.0, 0.04, GN.mat('flat', { c }), s * 0.5, 0, 0.53, 0.02)); av.body.add(box(0.16, 2.0, 0.04, GN.mat('flat', { c }), s * 0.5, 0, -0.53, 0.02)); });
  GN.cardigan = (c, inner) => (av) => { const m = GN.mat('knit', { c, tile: 1, bands: 2, bump: 5 }); [-1, 1].forEach((s) => av.body.add(box(0.78, 2.04, 1.08, m, s * 0.64, 0, 0, 0.05))); av.body.add(box(2.06, 2.04, 0.5, m, 0, 0, -0.29, 0.05));
    for (let k = 0; k < 4; k++) av.body.add(M(new T.SphereGeometry(0.07, 12, 8), HM('#f2e6c8', { rough: 0.3 }), 0.3, 0.6 - k * 0.42, 0.56)); };
  GN.ruffle = (c = '#ffffff') => (av) => { const m = HM(c, { rough: 0.8, gloss: 0 }); for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2, k = M(new T.ConeGeometry(0.16, 0.22, 5), m, Math.sin(a) * 0.56, 1.02, Math.cos(a) * 0.36); k.rotation.set(Math.cos(a) * 1.9, 0, -Math.sin(a) * 1.9); av.body.add(k); } };
  GN.skirt = (c, p = 'tee', o = {}) => (av) => { const m = GN.mat(p, Object.assign({ c, tile: 1 }, o)); m.side = T.DoubleSide; const g = new T.LatheGeometry([[1.08, -0.6], [1.15, -0.9], [1.35, -1.6], [1.5, -2.4], [1.55, -2.7]].map(([r, y]) => new T.Vector2(r, y)), 40); const sk = M(g, m); sk.scale.z = 0.62; av.body.add(sk); };
  GN.tie = (c = '#C1121F', shirt = '#ffffff') => (av) => { av.body.add(box(0.7, 1.4, 0.04, GN.mat('flat', { c: shirt }), 0, 0.3, 0.515, 0.02)); const t = box(0.2, 1.1, 0.04, GN.mat('flat', { c, rough: 0.4 }), 0, 0.35, 0.54, 0.02); av.body.add(t); const k = M(new T.ConeGeometry(0.17, 0.3, 3), GN.mat('flat', { c, rough: 0.4 }), 0.62, 0.62, 0.53); k.rotation.z = PI; av.body.add(k); };
  GN.scarf = (c) => (av) => { const t = M(new T.TorusGeometry(0.5, 0.18, 10, 24), GN.mat('knit', { c, tile: 0.4 }), 0, 1.0, 0); t.rotation.x = PI / 2; t.scale.set(1.25, 0.85, 1); av.body.add(t); av.body.add(box(0.36, 1.1, 0.16, GN.mat('knit', { c, tile: 0.4 }), 0.42, 0.35, 0.6, 0.05)); };
  // chest plate / badge with bold caps text
  GN.plate = (text, bg = '#f4ead2', fg = '#141414', w = 1.3, h = 0.6, y = 0.25) => (av) => { const c = cnv(256, Math.round(256 * h / w)), q = c.getContext('2d'); q.fillStyle = bg; q.fillRect(0, 0, c.width, c.height); q.strokeStyle = fg; q.lineWidth = 8; q.strokeRect(6, 6, c.width - 12, c.height - 12);
    q.fillStyle = fg; q.font = `900 ${Math.round(c.height * 0.52)}px "Arial Black", sans-serif`; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(text, 128, c.height * 0.54); const t = tex(c);
    av.body.add(box(w, h, 0.06, [GN.mat('flat', { c: bg }), GN.mat('flat', { c: bg }), GN.mat('flat', { c: bg }), GN.mat('flat', { c: bg }), new T.MeshStandardMaterial({ map: t, roughness: 0.6 }), GN.mat('flat', { c: bg })], 0, y, 0.54, 0.02)); };
  GN.veil = () => (av) => { const m = new T.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, roughness: 0.6, side: T.DoubleSide, depthWrite: false }); const g = new T.PlaneGeometry(1.4, 2.4, 6, 10); g.translate(0, -1.0, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, -0.62 - 0.25 * (p.getX(i) / 0.7) ** 2 - (p.getY(i) + 1) * -0.1); g.computeVertexNormals(); av.head.add(_set(new T.Mesh(g, m), 'position', 'y', 0.55)); av.head.add(_set(M(new T.TorusGeometry(0.5, 0.06, 8, 30), HM('#fff8e0', { rough: 0.3 }), 0, 0.62, -0.05), 'rotation', 'x', PI / 2 - 0.3)); };
  GN.ring = () => (av) => { av.armL.inner.add(_set(M(new T.TorusGeometry(0.62, 0.1, 12, 32), new T.MeshPhysicalMaterial({ color: '#f0c040', metalness: 1, roughness: 0.2, emissive: '#806010', emissiveIntensity: 0.4 }), 0, -1.86, 0), 'rotation', 'x', PI / 2)); const d = M(new T.OctahedronGeometry(0.2), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0, emissive: '#bfe8ff', emissiveIntensity: 1.6 }), 0, -1.86, 0.72); av.armL.inner.add(d); };
  GN.bouquet = () => (av) => { const g = new T.Group(); ['#f05a8a', '#f2c94c', '#ffffff', '#e84040', '#b06ad8'].forEach((c, i) => { const a = i * 1.3; g.add(M(new T.IcosahedronGeometry(0.16, 1), HM(c, { rough: 0.7 }), Math.cos(a) * 0.18, 0.15 + (i % 2) * 0.08, Math.sin(a) * 0.18)); }); g.add(_set(M(new T.ConeGeometry(0.18, 0.5, 8), HM('#3a8a3a'), 0, -0.2, 0), 'rotation', 'x', PI)); g.position.set(0, -2.1, 0.1); av.armR.inner.add(g); };
  GN.pacifier = () => (av) => { av.head.add(M(new T.TorusGeometry(0.1, 0.03, 8, 16), HM('#4fc3f7', { rough: 0.2 }), 0, -0.22, 0.66)); av.head.add(_set(M(new T.CylinderGeometry(0.16, 0.16, 0.04, 16), HM('#f48fb1', { rough: 0.2 }), 0, -0.2, 0.62), 'rotation', 'x', PI / 2)); };

  // =============================== ROPE GRIP SOLVER ===============================
  // Places av next to a rope that passes through world point P with tangent D (the direction the actor faces = toward the Fog),
  // alternating side s (+1 rope on the actor's left, -1 right), leaning back, both hands ON the rope (hands:'LR'|'R'|'L').
  const _m = new T.Matrix4(), _v = new T.Vector3();
  // aim an arm's hand at a world point (keeps the joint on the torso)
  GN.aim = (av, k, worldP) => { const arm = k === 'L' ? av.armL : av.armR; arm.parent.updateMatrixWorld(true); arm.quaternion.identity(); const lp = arm.parent.worldToLocal(worldP.clone()).sub(arm.position).normalize(); arm.quaternion.setFromUnitVectors(arm.handOff.clone().multiply(arm.scale).normalize(), lp); };
  GN.grip = function (av, P, D, o = {}) {
    const s = o.side ?? 1, ground = o.ground ?? 0, lean = o.lean ?? 0.2, hands = o.hands || 'LR', ropeR = o.ropeR ?? 0.3;
    D = D.clone().setY(0).normalize(); const N = new T.Vector3(0, 1, 0).cross(D).normalize();   // N = actor's left when facing D
    const root = av.root, sc = root.scale.x;
    // stance (pulling) depends on how far the actor turns from the rope (psi): lean away from the Fog, feet apart along the pull
    const stance = (psi) => { const c = Math.cos(psi), s2 = Math.sin(psi), lz = o.lean ?? lean;
      const ps = Object.assign({ body: [-lz * c, 0, -lz * s2], legL: [-0.42 * c, 0, 0.06 + 0.32 * Math.abs(s2)], legR: [0.38 * c, 0, -0.06 - 0.32 * Math.abs(s2)] }, o.pose || {}); av.pose(ps);
      if (o.noLegs) { av.legL.rotation.set(0, 0, 0); av.legR.rotation.set(0, 0, 0); }
      root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.updateMatrixWorld(true);
      const sh = { L: av.armL.getWorldPosition(new T.Vector3()), R: av.armR.getWorldPosition(new T.Vector3()) };
      const boxes = [[av.torso, [1.02, 1.02, 0.55]], [av.legL.children[0], [0.55, 0.9, 0.55]], [av.legR.children[0], [0.55, 0.9, 0.55]], [av.head, [0.65, 0.65, 0.65]]].map(([obj, h]) => ({ inv: obj.matrixWorld.clone().invert(), h }));
      let foot = 0; [av.legL, av.legR].forEach((lg) => { const sb = new T.Box3().setFromObject(lg); foot = Math.min(foot, sb.min.y); });
      return { sh, boxes, foot }; };
    const LL = { L: av.armL.handOff.length() * sc * (o.reach || 1), R: av.armR.handOff.length() * sc * (o.reach || 1) }, mg = ropeR + 0.04;
    const ck = [P.x, P.y, P.z, D.x, D.z, s, ground, lean, hands, o.reach || 1, JSON.stringify(o.pose || {})].map((v) => (typeof v === 'number' ? v.toFixed(3) : v)).join('|');
    av.gripCache = av.gripCache || {}; let best = av.gripCache[ck] || null; if (best) o.lean = best.lean;
    for (const att of [{ lean, fz: 0.35, st: 0.15 }, { lean: 0.08, fz: 0.25, st: 0.1 }, { lean: 0.0, fz: 0.12, st: 0.08 }]) { if (best) break; o.lean = att.lean;
    const hit = (boxes, p0, d, t) => { const q = _v.copy(d).multiplyScalar(t).add(p0); for (const b of boxes) { const r = q.clone().applyMatrix4(b.inv); if (Math.abs(r.x) < b.h[0] + mg / sc && Math.abs(r.y) < b.h[1] + mg / sc && Math.abs(r.z) < b.h[2] + mg / sc) return true; } return false; };
    for (let psi = -90; psi <= 90; psi += 6) {
      const { sh, boxes, foot } = stance((psi * PI) / 180);
      const yaw = Math.atan2(D.x, D.z) + (psi * PI) / 180, cy = Math.cos(-yaw), sy = Math.sin(-yaw);
      const toLocal = (x, z) => [x * cy + z * sy, -x * sy + z * cy];   // rotate world xz by -yaw
      for (let f = 0; f <= 2.6; f += att.st * 1.3) for (let e = -2.6; e <= 2.6; e += att.st) {
        const R0 = P.clone().addScaledVector(D, -f * sc).addScaledVector(N, e * sc); R0.y = ground;
        const [px, pz] = toLocal(P.x - R0.x, P.z - R0.z), [dx, dz] = toLocal(D.x, D.z), p0 = V(px, P.y - (ground - foot * 1), pz), d = V(dx, 0, dz);
        p0.y = P.y - ground + foot;   // root y is shifted so feet touch the ground
        const sol = {}; let ok = true;
        for (const k of hands) { const S = sh[k], w = p0.clone().sub(S), b = w.dot(d), c = w.lengthSq() - LL[k] * LL[k], disc = b * b - c; if (disc < 0) { ok = false; break; }
          const t1 = -b + Math.sqrt(disc), t2 = -b - Math.sqrt(disc), h1 = p0.clone().addScaledVector(d, t1), h2 = p0.clone().addScaledVector(d, t2), t = h1.z > h2.z ? t1 : t2, h = t === t1 ? h1 : h2;
          if (h.z - S.z < att.fz * sc || h.y - S.y > 0.5 * sc) { ok = false; break; } if (k === 'L' && h.x < -0.25 * sc) { ok = false; break; } if (k === 'R' && h.x > 0.25 * sc) { ok = false; break; }
          sol[k] = { t, h }; }
        if (!ok) continue;
        if (hands.length === 2 && Math.abs(sol.L.t - sol.R.t) < 0.75 * sc) continue;
        let clear = true; for (let t = -6; t <= 6; t += 0.2) { if (Object.values(sol).some((q) => Math.abs(t - q.t) < 0.55 * sc)) continue; if (hit(boxes, p0, d, t)) { clear = false; break; } }
        if (!clear) continue;
        const sep = hands.length === 2 ? Math.abs(Math.abs(sol.L.t - sol.R.t) - 1.0 * sc) : 0;
        const cost = Math.abs(psi) / 40 + Math.abs(f - 0.8) * 0.15 + (e * s < 0 ? 0.6 : 0) + sep * 0.6 + Math.abs(e) * 0.05;
        if (!best || cost < best.cost) best = { cost, yaw, R0, sol, psi, foot, lean: att.lean };
      }
    }
    }
    if (best) av.gripCache[ck] = best;
    av.gripOK = !!best; if (!best) { console.log('grip: no solution for', o.name || '?'); const foot = stance(0).foot; root.position.copy(P).addScaledVector(D, -1.2 * sc).addScaledVector(N, 1.4 * s * sc); root.position.y = ground - foot; root.rotation.y = Math.atan2(D.x, D.z); return false; }
    stance((best.psi * PI) / 180); const foot = best.foot; root.position.copy(best.R0); root.position.y = ground - foot; root.rotation.y = best.yaw; root.updateMatrixWorld(true);
    // aim each arm at its rope point
    [av.armL, av.armR].forEach((q) => q.scale.set(1, o.reach || 1, 1));   // a baby's reach > 1: the arm really is longer (cartoon), so the hand lands on the rope
    const aim = (arm, worldP) => { arm.quaternion.identity(); const lp = arm.parent.worldToLocal(worldP.clone()).sub(arm.position).normalize(); arm.quaternion.setFromUnitVectors(arm.handOff.clone().multiply(arm.scale).normalize(), lp); };
    for (const k of hands) { const h = best.sol[k].h.clone(); const w = h.applyMatrix4(root.matrixWorld); aim(k === 'L' ? av.armL : av.armR, w); }
    // the head turns to face along the rope (toward the opponent), the body stays side-on
    if (o.look !== false) { const hp = THREE.MathUtils.clamp((-best.psi * PI) / 180, -1.15, 1.15); av.neck.rotation.set(-0.08, hp, 0); }
    av.grip = { yaw: best.yaw, hands: Object.fromEntries(Object.entries(best.sol).map(([k, q]) => [k, q.h.clone().applyMatrix4(root.matrixWorld)])) };
    return true;
  };
})();
