// rbx.js — "roblox" style kit for three.js r149 (global THREE, styles/pov3d/three.js).
// R6 block avatar (torso 2x2x1, limbs 1x2x1 pivoting at shoulder/hip, bevelled head 1.2), swappable 2D decal faces,
// canvas clothing, plush dino hood as real geometry, procedural PBR textures, and a post pipeline
// (HDR render at 2x -> depth DOF + mip bloom + ACES + grade + vignette + grain). Everything is prefixed RBX / rbx.
'use strict';
const RBX = {};
(function () {
  THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB, converted to linear

  // ---------- random + tileable value noise ----------
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
  function tnoise(seed, period) {          // tileable value noise on [0,1)^2 with `period` lattice cells
    const r = rng(seed), P = new Float32Array(period * period); for (let i = 0; i < P.length; i++) P[i] = r();
    return (u, v) => {
      const x = u * period, y = v * period, xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const x0 = ((xi % period) + period) % period, y0 = ((yi % period) + period) % period, x1 = (x0 + 1) % period, y1 = (y0 + 1) % period;
      const a = P[y0 * period + x0], b = P[y0 * period + x1], c = P[y1 * period + x0], d = P[y1 * period + x1];
      return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
    };
  }
  function fbm(seed, base, oct = 4) {
    const ns = []; for (let i = 0; i < oct; i++) ns.push(tnoise(seed + i * 101, base << i));
    return (u, v) => { let s = 0, a = 1, n = 0; for (let i = 0; i < oct; i++) { s += ns[i](u, v) * a; n += a; a *= 0.5; } return s / n; };
  }
  RBX.rng = rng; RBX.tnoise = tnoise; RBX.fbm = fbm;

  // ---------- canvases & textures ----------
  function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c, o = {}) {
    const t = new THREE.CanvasTexture(c); t.encoding = o.srgb === false ? THREE.LinearEncoding : THREE.sRGBEncoding; t.anisotropy = 8;
    if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(o.repeat[0], o.repeat[1]); }
    return t;
  }
  // height field (Float32 w*h, 0..1) -> tangent-space normal map canvas (wraps)
  function normalCanvas(Hf, w, h, k = 2) {
    const c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const l = Hf[y * w + (x + w - 1) % w], r = Hf[y * w + (x + 1) % w], u = Hf[((y + h - 1) % h) * w + x], b = Hf[((y + 1) % h) * w + x];
      let nx = (l - r) * k, ny = (b - u) * k, nz = 1; const L = Math.hypot(nx, ny, nz); nx /= L; ny /= L; nz /= L;
      const i = (y * w + x) * 4; d[i] = (nx * 0.5 + 0.5) * 255; d[i + 1] = (ny * 0.5 + 0.5) * 255; d[i + 2] = nz * 255; d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0); return c;
  }
  // read a grayscale canvas into a height field
  function heightOf(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, Hf = new Float32Array(c.width * c.height); for (let i = 0; i < Hf.length; i++) Hf[i] = d[i * 4] / 255; return Hf; }
  RBX.cnv = cnv; RBX.tex = tex; RBX.normalCanvas = normalCanvas; RBX.heightOf = heightOf;
  function hex(c) { return new THREE.Color(c); }
  function rgbOf(c) { const k = new THREE.Color(); k.setStyle(c); k.convertLinearToSRGB(); return [k.r * 255, k.g * 255, k.b * 255]; }
  // a material from a colour canvas + a height canvas (normal map derived)
  function pbr(colorC, heightC, o = {}) {
    const m = new (o.physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({ map: tex(colorC, { repeat: o.repeat }), roughness: o.rough ?? 0.85, metalness: 0 });
    if (heightC) { m.normalMap = tex(normalCanvas(heightOf(heightC), heightC.width, heightC.height, o.bump ?? 3), { srgb: false, repeat: o.repeat }); m.normalScale.set(o.nscale ?? 1, o.nscale ?? 1); }
    if (o.physical && o.sheen) { m.sheen = o.sheen; m.sheenColor = hex(o.sheenColor || '#ffffff'); m.sheenRoughness = o.sheenRough ?? 0.5; }
    if (o.emissive) { m.emissive = hex(o.emissive); m.emissiveIntensity = o.emissiveIntensity ?? 1; if (o.emissiveMap) m.emissiveMap = m.map; }
    return m;
  }
  RBX.pbr = pbr;

  // ---------- geometry ----------
  // rounded box with box UVs (6 groups: +x -x +y -y +z -z); segments packed at the edges so the bevel is smooth
  function rbox(w, h, d, r = 0.08, n = 14) {
    const g = new THREE.BoxGeometry(w, h, d, n, n, n), p = g.attributes.position, N = g.attributes.normal, E = 3;
    const remap = (v, half) => {
      const i = Math.round((v / half + 1) * n / 2), a = half - r;
      if (i <= E) return -half + (i / E) * r; if (i >= n - E) return half - ((n - i) / E) * r;
      return -a + ((i - E) / (n - 2 * E)) * 2 * a;
    };
    const hw = w / 2, hh = h / 2, hd = d / 2, v = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.set(remap(p.getX(i), hw), remap(p.getY(i), hh), remap(p.getZ(i), hd));
      c.set(THREE.MathUtils.clamp(v.x, -hw + r, hw - r), THREE.MathUtils.clamp(v.y, -hh + r, hh - r), THREE.MathUtils.clamp(v.z, -hd + r, hd - r));
      const dlt = v.clone().sub(c);
      if (dlt.lengthSq() > 1e-10) { dlt.normalize(); v.copy(c).addScaledVector(dlt, r); N.setXYZ(i, dlt.x, dlt.y, dlt.z); }
      p.setXYZ(i, v.x, v.y, v.z);
    }
    // the remap squeezed the outer grid rows into the bevel: remap the UVs the same way so textures keep their layout
    const uv = g.attributes.uv, f = (t, half) => (remap(t * 2 * half - half, half) + half) / (2 * half);
    const axes = [[hd, hh], [hd, hh], [hw, hd], [hw, hd], [hw, hh], [hw, hh]];
    g.groups.forEach((gr, gi) => { const seen = new Set(); for (let k = gr.start; k < gr.start + gr.count; k++) seen.add(g.index.getX(k));
      seen.forEach((vi) => uv.setXY(vi, f(uv.getX(vi), axes[gi][0]), f(uv.getY(vi), axes[gi][1]))); });
    return g;
  }
  RBX.rbox = rbox;

  // ---------- fabric generators ----------
  // knit / cotton fleece: fine weave + fibre noise. returns {c: colour canvas, h: height canvas}
  function fleece(w, h, base, seed = 1, o = {}) {
    const c = cnv(w, h), g = c.getContext('2d'), hc = cnv(w, h), hg = hc.getContext('2d');
    const n1 = fbm(seed, 8, 4), n2 = tnoise(seed + 7, Math.round(w / 3)), im = g.createImageData(w, h), hm = hg.createImageData(w, h);
    const [R, G, B] = rgbOf(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h, weave = 0.5 + 0.5 * Math.sin((x + y) * 1.9) * Math.sin((x - y) * 1.9);
      const hv = 0.45 * n2(u, v) + 0.25 * weave + 0.3 * n1(u, v), k = 0.9 + 0.16 * (n1(u, v) - 0.5) + 0.07 * (hv - 0.5);
      const i = (y * w + x) * 4; im.data[i] = R * k; im.data[i + 1] = G * k; im.data[i + 2] = B * k; im.data[i + 3] = 255;
      hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = hv * 255; hm.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0); hg.putImageData(hm, 0, 0); return { c, h: hc, g, hg };
  }
  // plush fur: clumpy fibres, strong height variation
  function plush(w, h, base, seed = 3) {
    const c = cnv(w, h), g = c.getContext('2d'), hc = cnv(w, h), hg = hc.getContext('2d');
    const clump = fbm(seed, 16, 3), fine = tnoise(seed + 9, Math.round(w / 2.2)), mid = tnoise(seed + 13, Math.round(w / 7)), im = g.createImageData(w, h), hm = hg.createImageData(w, h);
    const [R, G, B] = rgbOf(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h, cl = clump(u, v), hv = Math.min(1, 0.4 * fine(u, v) + 0.35 * mid(u, v) + 0.45 * cl * cl);
      const k = 0.78 + 0.34 * hv;
      const i = (y * w + x) * 4; im.data[i] = Math.min(255, R * k); im.data[i + 1] = Math.min(255, G * k); im.data[i + 2] = Math.min(255, B * k); im.data[i + 3] = 255;
      hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = hv * 255; hm.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0); hg.putImageData(hm, 0, 0);
    // stray fibre strokes
    const r = rng(seed + 77); g.lineCap = hg.lineCap = 'round';
    for (let i = 0; i < w * 1.2; i++) {
      const x = r() * w, y = r() * h, a = r() * Math.PI * 2, L = 2 + r() * 6, lit = r() > 0.5;
      g.strokeStyle = lit ? 'rgba(255,235,200,0.10)' : 'rgba(60,20,0,0.10)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
      hg.strokeStyle = lit ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); hg.stroke();
    }
    return { c, h: hc };
  }
  RBX.fleece = fleece; RBX.plush = plush;
  const PLUSH_CACHE = {};
  function plushMat(base, sheen, seed = 3, rep = 2) {
    const key = base + seed + rep; if (PLUSH_CACHE[key]) return PLUSH_CACHE[key];
    const p = plush(512, 512, base, seed);
    return (PLUSH_CACHE[key] = pbr(p.c, p.h, { physical: true, rough: 0.97, bump: 5, nscale: 1.1, sheen: 1, sheenColor: sheen, sheenRough: 0.45, repeat: [rep, rep] }));
  }
  RBX.plushMat = plushMat;

  // ---------- 2D decal faces ----------
  // canvas 640x512 maps onto a 120deg x 1.0 stud patch of the head; features centred at (320, 256)
  const FACE_W = 640, FACE_H = 512;
  function eyeWhite(g, x, y, r, pr, look = [0, 0]) {
    g.fillStyle = '#ffffff'; g.strokeStyle = '#111'; g.lineWidth = 9; g.beginPath(); g.ellipse(x, y, r, r * 1.04, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#111'; g.beginPath(); g.arc(x + look[0], y + look[1], pr, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + look[0] - pr * 0.35, y + look[1] - pr * 0.4, pr * 0.28, 0, Math.PI * 2); g.fill();
  }
  function dotEye(g, x, y, rx = 15, ry = 24) { g.fillStyle = '#121212'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  function line(g, pts, w = 9) { g.strokeStyle = '#141414'; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); }
  function curve(g, x0, y0, cx, cy, x1, y1, w = 9) { g.strokeStyle = '#141414'; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
  const FACES = {
    neutral(g) { dotEye(g, 262, 222); dotEye(g, 378, 222); curve(g, 252, 318, 330, 372, 398, 300, 10); },
    smile(g) { FACES.neutral(g); },
    scared(g) {
      eyeWhite(g, 252, 220, 50, 12, [0, 4]); eyeWhite(g, 388, 220, 50, 12, [0, 4]);
      line(g, [206, 148, 240, 136, 290, 150], 8); line(g, [350, 150, 400, 136, 434, 148], 8);
      g.fillStyle = '#5a0d12'; g.strokeStyle = '#141414'; g.lineWidth = 8; g.beginPath(); g.ellipse(320, 340, 40, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#e8394a'; g.beginPath(); g.ellipse(320, 356, 22, 10, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.fillRect(292, 314, 56, 10);
    },
    determined(g) {
      line(g, [222, 168, 296, 196], 13); line(g, [418, 168, 344, 196], 13);
      dotEye(g, 266, 232, 14, 19); dotEye(g, 374, 232, 14, 19);
      line(g, [282, 330, 358, 330], 10);
    },
    surprised(g) {
      eyeWhite(g, 256, 224, 44, 13); eyeWhite(g, 384, 224, 44, 13);
      g.fillStyle = '#7a1018'; g.strokeStyle = '#141414'; g.lineWidth = 8; g.beginPath(); g.ellipse(320, 338, 24, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#e8394a'; g.beginPath(); g.ellipse(320, 352, 14, 10, 0, 0, Math.PI * 2); g.fill();
    },
    crying(g) {
      line(g, [222, 176, 290, 160], 9); line(g, [418, 176, 350, 160], 9);
      curve(g, 236, 222, 262, 238, 290, 222, 10); curve(g, 350, 222, 378, 238, 404, 222, 10);
      g.fillStyle = 'rgba(70,160,255,0.92)';
      [[262, 240], [378, 240]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x - 14, y); g.quadraticCurveTo(x - 20, y + 90, x - 4, y + 150); g.lineTo(x + 12, y + 150); g.quadraticCurveTo(x + 18, y + 80, x + 14, y); g.closePath(); g.fill(); });
      curve(g, 280, 344, 320, 310, 360, 344, 10);
    },
    'staring-hard'(g) {
      eyeWhite(g, 256, 222, 52, 9); eyeWhite(g, 384, 222, 52, 9);
      curve(g, 214, 286, 256, 300, 296, 288, 4); curve(g, 344, 288, 384, 300, 426, 286, 4);
      line(g, [296, 340, 348, 336], 8);
    },
    closed(g) { curve(g, 236, 226, 262, 244, 290, 226, 9); curve(g, 350, 226, 378, 244, 404, 226, 9); curve(g, 262, 318, 330, 366, 390, 312, 10); },
    happy(g) { curve(g, 236, 236, 262, 196, 290, 236, 10); curve(g, 350, 236, 378, 196, 404, 236, 10);
      g.fillStyle = '#7a1018'; g.strokeStyle = '#141414'; g.lineWidth = 8; g.beginPath(); g.moveTo(262, 300); g.quadraticCurveTo(320, 410, 380, 300); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#e8394a'; g.beginPath(); g.ellipse(320, 352, 26, 12, 0, 0, Math.PI * 2); g.fill(); },
    tired(g) { line(g, [228, 214, 296, 214], 9); line(g, [344, 214, 412, 214], 9); dotEye(g, 262, 234, 13, 12); dotEye(g, 378, 234, 13, 12);
      g.strokeStyle = 'rgba(80,60,120,0.55)'; g.lineWidth = 7; curve(g, 236, 262, 262, 280, 292, 262, 6); curve(g, 348, 262, 378, 280, 406, 262, 6); g.strokeStyle = '#141414';
      line(g, [292, 336, 350, 330], 8); },
    worried(g) { line(g, [222, 172, 290, 152], 9); line(g, [418, 172, 350, 152], 9); dotEye(g, 262, 226); dotEye(g, 378, 226); curve(g, 282, 344, 320, 318, 358, 344, 9); },
    sniff(g) { curve(g, 236, 226, 262, 244, 290, 226, 9); curve(g, 350, 226, 378, 244, 404, 226, 9); line(g, [300, 300, 312, 288], 6); line(g, [340, 300, 328, 288], 6);
      g.fillStyle = '#141414'; g.beginPath(); g.ellipse(320, 338, 12, 9, 0, 0, Math.PI * 2); g.fill(); },
    angry(g) { line(g, [222, 160, 296, 192], 13); line(g, [418, 160, 344, 192], 13); dotEye(g, 266, 230, 14, 19); dotEye(g, 374, 230, 14, 19); curve(g, 280, 344, 320, 320, 360, 344, 10); },
    blink(g) { line(g, [230, 226, 292, 226], 10); line(g, [348, 226, 410, 226], 10);
      g.fillStyle = 'rgba(70,160,255,0.92)'; g.beginPath(); g.ellipse(296, 246, 9, 14, 0, 0, Math.PI * 2); g.fill(); curve(g, 286, 344, 320, 330, 354, 344, 9); },
    counting(g) { dotEye(g, 290, 222, 15, 24); dotEye(g, 406, 222, 15, 24); g.fillStyle = '#7a1018'; g.strokeStyle = '#141414'; g.lineWidth = 7; g.beginPath(); g.ellipse(330, 334, 14, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke(); },
    burning(g) { FACES['staring-hard'](g);
      g.strokeStyle = 'rgba(220,30,30,0.85)'; g.lineWidth = 2.5; const r = rng(4);
      [[256, 222], [384, 222]].forEach(([x, y]) => { for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(a) * 49, y + Math.sin(a) * 50); g.quadraticCurveTo(x + Math.cos(a + 0.3) * 32, y + Math.sin(a + 0.3) * 32, x + Math.cos(a) * 18, y + Math.sin(a) * 18); g.stroke(); } });
      g.fillStyle = 'rgba(70,160,255,0.9)'; g.beginPath(); g.ellipse(212, 270, 8, 13, 0, 0, Math.PI * 2); g.fill(); },
  };
  // '-talk' variants (mouth-open frame for the per-word mouth flap): the base face with its mouth cleared and redrawn
  (function () {
    const oRound = (g, w = 26, h = 20) => { g.fillStyle = '#7a1018'; g.strokeStyle = '#141414'; g.lineWidth = 8; g.beginPath(); g.ellipse(320, 338, w, h, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#e8394a'; g.beginPath(); g.ellipse(320, 338 + h * 0.5, w * 0.6, h * 0.35, 0, 0, Math.PI * 2); g.fill(); };
    const oSmile = (g) => { g.fillStyle = '#7a1018'; g.strokeStyle = '#141414'; g.lineWidth = 8; g.beginPath(); g.moveTo(276, 312); g.quadraticCurveTo(322, 396, 368, 312); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#e8394a'; g.beginPath(); g.ellipse(322, 344, 18, 8, 0, 0, Math.PI * 2); g.fill(); };
    const MOUTH = { neutral: oSmile, smile: oSmile, closed: oSmile, happy: (g) => curve(g, 262, 318, 330, 366, 390, 312, 10),
      surprised: (g) => { g.fillStyle = '#141414'; g.beginPath(); g.ellipse(320, 340, 12, 10, 0, 0, Math.PI * 2); g.fill(); },
      scared: (g) => line(g, [286, 342, 302, 334, 320, 344, 338, 334, 354, 342], 8), crying: (g) => oRound(g, 30, 22) };
    const TOP = { 'staring-hard': 302, burning: 302, sniff: 304 };
    Object.keys(FACES).forEach((n) => { const base = FACES[n];
      FACES[n + '-talk'] = (g) => { base(g); g.clearRect(236, TOP[n] || 292, 168, 110); (MOUTH[n] || oRound)(g); }; });
  })();
  RBX.FACES = FACES;
  const FACE_TEX = {};
  function faceTex(name) {
    if (FACE_TEX[name]) return FACE_TEX[name];
    const c = cnv(FACE_W, FACE_H), g = c.getContext('2d'); (FACES[name] || FACES.neutral)(g);
    const t = tex(c); return (FACE_TEX[name] = t);
  }
  RBX.faceTex = faceTex;

  // ---------- clothing canvases ----------
  function hoodieTorso(base, side, seed) {
    const S = 512, f = fleece(S, S, base, seed), g = f.g, hg = f.hg;
    // ribbed hem band
    const hemY = S * 0.88; g.fillStyle = 'rgba(80,30,0,0.16)'; g.fillRect(0, hemY, S, S - hemY);
    for (let x = 0; x < S; x += 8) { g.fillStyle = 'rgba(60,20,0,0.18)'; g.fillRect(x, hemY, 3, S - hemY); hg.fillStyle = 'rgba(0,0,0,0.45)'; hg.fillRect(x, hemY, 3, S - hemY); }
    g.fillStyle = 'rgba(60,20,0,0.35)'; g.fillRect(0, hemY - 3, S, 4); hg.fillStyle = '#000'; hg.fillRect(0, hemY - 3, S, 3);
    if (side === 'front') {
      // kangaroo pocket: trapezoid with slanted hand openings
      const top = S * 0.56, bot = S * 0.86, xl = S * 0.24, xr = S * 0.76, inset = S * 0.08;
      const path = (ctx) => { ctx.beginPath(); ctx.moveTo(xl + inset, top); ctx.lineTo(xr - inset, top); ctx.lineTo(xr, top + S * 0.12); ctx.lineTo(xr, bot); ctx.lineTo(xl, bot); ctx.lineTo(xl, top + S * 0.12); ctx.closePath(); };
      g.save(); path(g); g.clip(); g.fillStyle = 'rgba(255,220,170,0.06)'; g.fillRect(0, 0, S, S); g.restore();
      path(hg); hg.fillStyle = 'rgba(255,255,255,0.18)'; hg.fill();
      g.strokeStyle = 'rgba(70,25,0,0.55)'; g.lineWidth = 4; path(g); g.stroke(); hg.strokeStyle = '#000'; hg.lineWidth = 5; path(hg); hg.stroke();
      g.setLineDash([7, 6]); g.strokeStyle = 'rgba(255,230,190,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(xl + 10, bot - 8); g.lineTo(xr - 10, bot - 8); g.stroke(); g.setLineDash([]);
      // pocket mouth shadows (the slanted openings)
      g.strokeStyle = 'rgba(40,12,0,0.6)'; g.lineWidth = 7; g.beginPath(); g.moveTo(xl + inset, top); g.lineTo(xl, top + S * 0.12); g.stroke(); g.beginPath(); g.moveTo(xr - inset, top); g.lineTo(xr, top + S * 0.12); g.stroke();
      // neckline shadow where the hood meets
      const rg = g.createRadialGradient(S / 2, 0, 10, S / 2, 0, S * 0.32); rg.addColorStop(0, 'rgba(50,15,0,0.45)'); rg.addColorStop(1, 'rgba(50,15,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, S, S * 0.35);
      // drawstring eyelets
      [S / 2 - 34, S / 2 + 34].forEach((x) => { g.fillStyle = '#d9d2c4'; g.beginPath(); g.arc(x, S * 0.07, 7, 0, 7); g.fill(); g.fillStyle = '#3a1a08'; g.beginPath(); g.arc(x, S * 0.07, 3.5, 0, 7); g.fill(); });
    }
    if (side === 'back') { const rg = g.createLinearGradient(0, 0, 0, S * 0.3); rg.addColorStop(0, 'rgba(50,15,0,0.35)'); rg.addColorStop(1, 'rgba(50,15,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, S, S * 0.3); }
    // side seams
    g.fillStyle = 'rgba(70,25,0,0.25)'; g.fillRect(0, 0, 3, S); g.fillRect(S - 3, 0, 3, S);
    return f;
  }
  // non-hoodie tops: 'shirt' (crew neck), 'polo' (collar + buttons), 'suit' (jacket, lapels, tie), 'cardigan' (buttons + blouse)
  function topTorso(kind, base, side, seed, o = {}) {
    const S = 512, f = fleece(S, S, base, seed), g = f.g, hg = f.hg;
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, S * 0.94, S, S * 0.06); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, 3, S); g.fillRect(S - 3, 0, 3, S);
    if (side !== 'front') return f;
    const stroke = (pts, c, w) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
    if (kind === 'shirt') { g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(S / 2, 0, 90, 46, 0, 0, Math.PI); g.fill(); }
    if (kind === 'polo' || kind === 'cardigan') {
      g.fillStyle = o.collar || 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(S / 2 - 110, 0); g.lineTo(S / 2, 70); g.lineTo(S / 2 + 110, 0); g.lineTo(S / 2 + 60, 60); g.lineTo(S / 2, 90); g.lineTo(S / 2 - 60, 60); g.closePath(); g.fill();
      stroke([S / 2, 80, S / 2, kind === 'cardigan' ? S : 220], 'rgba(0,0,0,0.35)', 4);
      for (let k = 0; k < (kind === 'cardigan' ? 6 : 3); k++) { const y = 110 + k * 62; g.fillStyle = '#efe6d2'; g.beginPath(); g.arc(S / 2 + 14, y, 9, 0, 7); g.fill(); hg.fillStyle = '#fff'; hg.beginPath(); hg.arc(S / 2 + 14, y, 9, 0, 7); hg.fill(); }
      if (o.patch) { g.fillStyle = o.patch; g.fillRect(S * 0.66, 120, 80, 60); g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.fillText(o.patchText || '', S * 0.66 + 6, 160); }
    }
    if (kind === 'suit') {
      g.fillStyle = '#f4f2ec'; g.beginPath(); g.moveTo(S / 2 - 70, 0); g.lineTo(S / 2 + 70, 0); g.lineTo(S / 2, 260); g.closePath(); g.fill();
      g.fillStyle = o.tie || '#b0232a'; g.beginPath(); g.moveTo(S / 2 - 16, 20); g.lineTo(S / 2 + 16, 20); g.lineTo(S / 2 + 26, 220); g.lineTo(S / 2, 250); g.lineTo(S / 2 - 26, 220); g.closePath(); g.fill();
      stroke([S / 2 - 70, 0, S / 2 - 20, 270, S / 2 - 120, 120], 'rgba(0,0,0,0.45)', 6); stroke([S / 2 + 70, 0, S / 2 + 20, 270, S / 2 + 120, 120], 'rgba(0,0,0,0.45)', 6);
      [330, 410].forEach((y) => { g.fillStyle = '#1b1b1b'; g.beginPath(); g.arc(S / 2, y, 9, 0, 7); g.fill(); });
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(S * 0.12, 300, 110, 8); g.fillRect(S * 0.66, 300, 110, 8);
    }
    return f;
  }
  function sleeve(base, skin, seed, end) {   // 256x512 side of an arm: sleeve, ribbed cuff, hand
    const W = 256, Hh = 512, f = fleece(W, Hh, base, seed), g = f.g, hg = f.hg, hand = Hh * 0.8, cuff = Hh * 0.73;
    g.fillStyle = 'rgba(80,30,0,0.18)'; g.fillRect(0, cuff, W, hand - cuff);
    for (let x = 0; x < W; x += 8) { g.fillStyle = 'rgba(60,20,0,0.2)'; g.fillRect(x, cuff, 3, hand - cuff); hg.fillStyle = 'rgba(0,0,0,0.45)'; hg.fillRect(x, cuff, 3, hand - cuff); }
    g.fillStyle = 'rgba(60,20,0,0.4)'; g.fillRect(0, cuff - 3, W, 4);
    g.fillStyle = skin; g.fillRect(0, hand, W, Hh - hand); hg.fillStyle = '#808080'; hg.fillRect(0, hand, W, Hh - hand);
    const sg = g.createLinearGradient(0, hand, 0, hand + 26); sg.addColorStop(0, 'rgba(60,25,10,0.45)'); sg.addColorStop(1, 'rgba(60,25,10,0)'); g.fillStyle = sg; g.fillRect(0, hand, W, 26);
    return f;
  }
  function pants(base, seed, side) {
    const W = 256, Hh = 512, f = fleece(W, Hh, base, seed), g = f.g;
    g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(side === 'front' ? W - 6 : 0, 0, 4, Hh);   // seam
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, Hh * 0.9, W, Hh * 0.1);   // shoe
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, Hh * 0.9, W, 3);
    return f;
  }

  // ---------- avatar ----------
  // o: { shirt:'#F0902C', pants:'#17171a', skin:'#E9C39B', hood:'dino'|null, face:'neutral', seed }
  RBX.avatar = function (o = {}) {
    const shirt = o.shirt || '#F28A1E', pantC = o.pants || '#161619', skin = o.skin || '#EFCFA8', seed = o.seed || 11;
    const root = new THREE.Group(); root.name = 'avatar';
    const fab = (f, rep) => pbr(f.c, f.h, { rough: 0.9, bump: 1.5, nscale: 0.3, repeat: rep });
    const body = new THREE.Group(); body.position.y = 3; root.add(body);   // torso centre at y=3, feet at y=0
    const top = o.top || 'hoodie', TT = top === 'hoodie' ? (sd, sn) => hoodieTorso(shirt, sd, sn) : (sd, sn) => topTorso(top, shirt, sd, sn, o);
    const tF = fab(TT('front', seed)), tB = fab(TT('back', seed + 1)), tS = fab(TT('side', seed + 2));
    const sideT = fab(TT('side', seed + 3));
    const torso = new THREE.Mesh(rbox(2, 2, 1, 0.07), [sideT, sideT, tS, tS, tF, tB]); body.add(torso);
    const sl = fab(sleeve(shirt, skin, seed + 4)), slTop = fab(fleece(256, 256, shirt, seed + 5)), handBot = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.75 });
    const pf = fab(pants(pantC, seed + 6, 'front')), pb = fab(pants(pantC, seed + 7, 'back')), pTop = fab(fleece(256, 256, pantC, seed + 8));
    const sole = new THREE.MeshStandardMaterial({ color: '#0c0c0e', roughness: 0.8 });
    const limb = (mats, x, y) => { const piv = new THREE.Group(); piv.position.set(x, y, 0); const m = new THREE.Mesh(rbox(1, 2, 1, 0.07), mats); m.position.y = -1; piv.add(m); body.add(piv); return piv; };
    const armL = limb([sl, sl, slTop, handBot, sl, sl], 1.5, 1), armR = limb([sl, sl, slTop, handBot, sl, sl], -1.5, 1);
    const legL = limb([pb, pb, pTop, sole, pf, pb], 0.5, -1), legR = limb([pb, pb, pTop, sole, pf, pb], -0.5, -1);
    // neck + head (bevelled cylinder, lathe)
    const neck = new THREE.Group(); neck.position.set(0, 1, 0); body.add(neck); neck.scale.setScalar(o.headScale || 1);
    const R = 0.6, HH = 1.2, bv = 0.24, prof = [];
    prof.push(new THREE.Vector2(0, -HH / 2));
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * Math.PI / 2; prof.push(new THREE.Vector2(R - bv + Math.cos(a) * bv, -HH / 2 + bv + Math.sin(a) * bv)); }
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; prof.push(new THREE.Vector2(R - bv + Math.cos(a) * bv, HH / 2 - bv + Math.sin(a) * bv)); }
    prof.push(new THREE.Vector2(0, HH / 2));
    const skinMat = new THREE.MeshPhysicalMaterial({ color: skin, roughness: 0.55, clearcoat: 0.08, clearcoatRoughness: 0.6 });
    const head = new THREE.Group(); head.position.y = 0.04 + HH / 2; neck.add(head);
    const headM = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), skinMat); head.add(headM);
    const faceGeo = new THREE.CylinderGeometry(R + 0.004, R + 0.004, HH - 2 * bv + 0.3, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex(o.face || 'neutral'), transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 });
    const faceM = new THREE.Mesh(faceGeo, faceMat); faceM.position.y = -0.04; head.add(faceM);
    // 3D drawstrings
    const strMat = new THREE.MeshStandardMaterial({ color: '#f3efe6', roughness: 0.8 }), agl = new THREE.MeshStandardMaterial({ color: '#cfc7b8', roughness: 0.4, metalness: 0.3 });
    if (top === 'hoodie') [-0.13, 0.13].forEach((x, i) => {
      const cur = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0.86, 0.52), new THREE.Vector3(x + (i ? 0.02 : -0.02), 0.6, 0.535), new THREE.Vector3(x + (i ? 0.03 : -0.01), 0.3 - i * 0.07, 0.53)]);
      const s = new THREE.Mesh(new THREE.TubeGeometry(cur, 16, 0.022, 8), strMat); body.add(s);
      const a = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10), agl); a.position.copy(cur.getPoint(1)); a.position.y -= 0.04; body.add(a);
    });
    root.scale.setScalar(o.scale || 1);
    const av = { root, body, torso, head, neck, armL, armR, legL, legR, faceMat, hood: null };
    if (o.hood === 'dino') av.hood = RBX.dinoHood(head, o);
    // keep the brand colour readable under coloured night light: a little of the albedo comes back as emission
    const keep = o.selfLit ?? 0.12, kept = new Set([tF, tB, tS, sideT, sl, slTop]);
    if (av.hood) av.hood.traverse((m) => { if (m.isMesh && m.material.map && m.material.sheen) kept.add(m.material); });
    kept.forEach((m) => { m.emissive = new THREE.Color(1, 1, 1); m.emissiveMap = m.map; m.emissiveIntensity = keep; });
    av.setFace = (name) => { av.faceName = name; faceMat.map = faceTex(name); faceMat.needsUpdate = true; };
    // pose: angles in radians {armL:[x,y,z], armR, legL, legR, head:[x,y,z], body:[x,y,z]}
    av.pose = (p = {}) => {
      const set = (g, v = [0, 0, 0]) => g.rotation.set(v[0] || 0, v[1] || 0, v[2] || 0);   // unspecified parts return to rest
      set(armL, p.armL); set(armR, p.armR); set(legL, p.legL); set(legR, p.legR); set(neck, p.head); set(body, p.body);
    };
    root.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    faceM.castShadow = false; headM.receiveShadow = false; faceM.receiveShadow = false;   // shadows from the hood read as hair on the face
    return av;
  };

  // ---------- dino hood ----------
  // head-local coords: head centre at origin, face toward +z. The shell is a sphere with a cap cut around +z (the
  // face opening), scaled into an egg, lumpy, with a plush lip, an inner lining, an upper jaw with teeth and eyes,
  // and spikes running over the crown and down the back.
  RBX.dinoHood = function (head, o = {}) {
    const g = new THREE.Group(); g.name = 'dinoHood'; head.add(g);
    const base = o.hoodColor || '#F28A1E', spikeC = o.spikeColor || '#F6C68E';
    const mat = plushMat(base, '#ffd7a6', 5, 3), inner = plushMat('#cf6a1c', '#e09a58', 6, 3);   // dark orange lining (a brick-red one read as a red band on the forehead)
    const spikeMat = plushMat(spikeC, '#fff1dc', 8, 1);
    const C = new THREE.Vector3(0, 0.16, 0.04), SX = 0.82, SY = 1.0, SZ = 0.8, A0 = 0.8, TILT = 0.3, FLOOR = -0.62, ZBACK = -0.44;
    const HD = o.hoodDims = { C, SX, SY, SZ };
    const nz = fbm(21, 4, 3), rot = new THREE.Matrix4().makeRotationX(Math.PI / 2).premultiply(new THREE.Matrix4().makeRotationX(TILT));
    // unit-sphere point (sphere pole = +y) -> hood space: pole to the (tilted) front, egg scale, lumps, flat bottom
    const shape = (v, s = 1, lump = true) => {
      v = v.clone().applyMatrix4(rot);
      // lower back: the ring keeps its equator width and the shell drops onto the hoodie's back like a cowl
      // (a round egg bottom read as a ball sitting on the shoulders)
      const cw = THREE.MathUtils.smoothstep(-v.z, -0.1, 0.45) * THREE.MathUtils.smoothstep(-v.y, -0.05, 0.85);
      if (cw > 0) { const ring = Math.hypot(v.x, v.z) || 1e-6, rr = THREE.MathUtils.lerp(ring, 1.0, cw); v.x *= rr / ring; v.z *= rr / ring; v.y *= 1 + 0.42 * cw; }
      let k = 1; if (lump) k = 1 + 0.03 * (nz(Math.atan2(v.x, v.z) / (Math.PI * 2) + 0.5, v.y * 0.5 + 0.5) - 0.5) * 2;
      let y = v.y * SY * k * s + C.y; const bell = 1 + 0.16 * THREE.MathUtils.smoothstep(-y, -0.2, 0.6);
      let x = v.x * SX * k * s * bell, z = v.z * SZ * k * s * (1 + (bell - 1) * 0.5) + C.z;
      // the lower back slopes in and drapes down over the upper back (no overhang floating behind the torso);
      // front/sides rest flat on the shoulders
      const w = THREE.MathUtils.smoothstep(-v.z, 0.05, 0.5), y0 = y;
      if (y < FLOOR) y = FLOOR + (y - FLOOR) * THREE.MathUtils.lerp(0.3 + 0.8 * w, 1, cw);
      z = THREE.MathUtils.lerp(z, Math.max(z, ZBACK * s), w * (1 - cw) * THREE.MathUtils.smoothstep(FLOOR + 0.02 - y0, 0, 0.18));   // only below the head, or the head pokes through
      if (cw > 0) z = THREE.MathUtils.lerp(z, Math.max(z, -0.47), cw * THREE.MathUtils.smoothstep(FLOOR + 0.45 - y0, 0, 0.4));   // the drape lies on the back, no overhang
      return new THREE.Vector3(x, y, z);
    };
    const shellGeo = (s, lump) => {
      const geo = new THREE.SphereGeometry(1, 96, 64, 0, Math.PI * 2, A0, Math.PI - A0), p = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const q = shape(v, s, lump); if (s < 1) { q.y = Math.max(q.y, FLOOR + 0.04); if (q.y < FLOOR + 0.1) q.z = Math.max(q.z, ZBACK + 0.06); }   // the lining stays inside the shell
        p.setXYZ(i, q.x, q.y, q.z); }
      geo.computeVertexNormals(); return geo;
    };
    const shellMat = mat.clone(); shellMat.side = THREE.DoubleSide;   // the drape folds a few faces over: draw both sides so no holes show
    const shell = new THREE.Mesh(shellGeo(1, true), shellMat); g.add(shell);
    const SP = shell.geometry.attributes.position, SN = shell.geometry.attributes.normal;
    const lining = new THREE.Mesh(shellGeo(0.9, false), inner.clone()); lining.material.side = THREE.BackSide; if (!window.NOLINING) g.add(lining);
    // rolled plush lip on the opening rim
    const rim = []; for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; rim.push(shape(new THREE.Vector3(Math.cos(a) * Math.sin(A0), Math.cos(A0), Math.sin(a) * Math.sin(A0)), 0.96, true)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim, true), 192, 0.065, 12, true), mat));
    const rimTop = rim.reduce((m, p) => (p.y > m.y ? p : m), rim[0]);
    // upper jaw: a plush ellipsoid that protrudes over the face, top edge of the opening
    const J = { x: 0, y: 0.56, z: 0.5, rx: 0.6, ry: 0.21, rz: 0.42 };
    const snout = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), mat); snout.scale.set(J.rx, J.ry, J.rz); snout.position.set(J.x, J.y, J.z); g.add(snout);
    const bridge = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), mat); bridge.scale.set(0.66, 0.3, 0.46); bridge.position.set(0, J.y + 0.13, J.z - 0.22); g.add(bridge);
    // palate: closes the gap between the jaw's underside and the forehead so the jaw reads as part of the hood from below
    const palate = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), inner); palate.scale.set(0.54, 0.16, 0.36); palate.position.set(0, J.y - 0.1, J.z - 0.06); g.add(palate);
    const nosM = new THREE.MeshStandardMaterial({ color: '#7a3008', roughness: 1 });
    [-0.13, 0.13].forEach((x) => { const n = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), nosM); n.position.set(x, J.y + 0.1, J.z + J.rz * 0.9); n.scale.set(1, 0.6, 0.6); g.add(n); });
    const eyeM = new THREE.MeshPhysicalMaterial({ color: '#0b0b0d', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 });
    [-0.4, 0.4].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), eyeM); e.position.set(x, J.y + 0.27, J.z - 0.06); g.add(e); });
    // teeth hang from the jaw's lower front edge
    const toothM = new THREE.MeshStandardMaterial({ color: '#fbf7ee', roughness: 0.5 });
    const toothG = new THREE.ConeGeometry(0.05, 0.14, 12); toothG.rotateX(Math.PI); toothG.translate(0, -0.07, 0);
    const NT = 9;
    for (let i = 0; i < NT; i++) {
      const f = -1.1 + 2.2 * (i / (NT - 1)), ex = 0.8 * Math.sin(f), ez = 0.86 * Math.cos(f), ny = Math.sqrt(Math.max(0, 1 - ex * ex - ez * ez));   // along the jaw's underside, right over the face
      const t = new THREE.Mesh(toothG, toothM); t.position.set(J.x + ex * J.rx, J.y - ny * J.ry + 0.02, J.z + ez * J.rz); t.rotation.z = f * 0.15; g.add(t);
    }
    // spikes: over the crown and down the back
    const spikeG = (h, r) => { const pr = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pr.push(new THREE.Vector2(r * Math.pow(1 - Math.pow(t, 1.7), 0.62), t * h)); } pr.push(new THREE.Vector2(0, h + 0.012)); return new THREE.LatheGeometry(pr, 20); };
    [[0.15, 0.36, 0.15], [0.45, 0.38, 0.16], [0.76, 0.34, 0.15], [1.06, 0.3, 0.13], [1.36, 0.25, 0.115], [1.64, 0.2, 0.095]].forEach(([ang, h, r]) => {
      // sit each spike on the real (lumpy, draped) shell: nearest mid-line vertex in that direction from the centre
      const dir = new THREE.Vector2(Math.cos(ang), -Math.sin(ang)); let best = -1, bd = -2;
      for (let i = 0; i < SP.count; i++) { if (Math.abs(SP.getX(i)) > 0.04) continue; const dy = SP.getY(i) - C.y, dz = SP.getZ(i) - C.z, L = Math.hypot(dy, dz) || 1, d = (dy * dir.x + dz * dir.y) / L; if (d > bd) { bd = d; best = i; } }
      const p = new THREE.Vector3(0, SP.getY(best), SP.getZ(best));
      if (p.y < FLOOR + 0.12) return;
      const nrm = new THREE.Vector3(0, SN.getY(best), SN.getZ(best)).normalize();
      h *= 1.25; r *= 1.15; const xs = ang < 0.5 ? [-0.1, 0.1] : [0];   // the crown spikes come in a staggered pair (hero sheet front view)
      xs.forEach((x, k) => { const s = new THREE.Mesh(spikeG(h * (k ? 0.9 : 1), r), spikeMat); s.position.copy(p).addScaledVector(nrm, -0.05); s.position.x = x;
        s.position.z += k ? -0.06 : 0; s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nrm.clone().add(new THREE.Vector3(x * 1.2, 0, 0)).normalize()); s.scale.set(0.75, 1, 1); g.add(s); });
    });
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  };

  // ---------- OBJ (minimal: v/vt/vn, polygon faces) ----------
  RBX.parseOBJ = function (text) {
    const V = [], T = [], N = [], pos = [], uv = [], nor = [];
    for (const line of text.split('\n')) {
      const a = line.trim().split(/\s+/);
      if (a[0] === 'v') V.push(+a[1], +a[2], +a[3]); else if (a[0] === 'vt') T.push(+a[1], +a[2]); else if (a[0] === 'vn') N.push(+a[1], +a[2], +a[3]);
      else if (a[0] === 'f') {
        const idx = a.slice(1).map((w) => w.split('/').map((x) => (x ? parseInt(x, 10) : 0)));
        for (let k = 1; k < idx.length - 1; k++) for (const q of [idx[0], idx[k], idx[k + 1]]) {
          const vi = (q[0] < 0 ? V.length / 3 + q[0] : q[0] - 1) * 3; pos.push(V[vi], V[vi + 1], V[vi + 2]);
          if (q[1]) { const ti = (q[1] < 0 ? T.length / 2 + q[1] : q[1] - 1) * 2; uv.push(T[ti], T[ti + 1]); } else uv.push(0, 0);
          if (q[2]) { const ni = (q[2] < 0 ? N.length / 3 + q[2] : q[2] - 1) * 3; nor.push(N[ni], N[ni + 1], N[ni + 2]); }
        }
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (nor.length === pos.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); else g.computeVertexNormals();
    return g;
  };
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  // The Watcher: the Majora's Mask 3D moon (styles/roblox/models/majora-moon/moon.data.js must be loaded first).
  // Returns a Group of radius ~1 facing +z; the irises glow orange (emissive, made for bloom).
  RBX.loadMoon = async function (o = {}) {
    const D = window.RBX_MOON_DATA; if (!D) throw new Error('moon.data.js not loaded');
    const img = await loadImg(D.tex), S = img.width;
    const base = cnv(S, S), bg = base.getContext('2d'); bg.drawImage(img, 0, 0);
    // emissive: keep only the iris (bottom-left tile of the atlas), boosted
    const em = cnv(S, S), eg = em.getContext('2d'); eg.fillStyle = '#000'; eg.fillRect(0, 0, S, S);
    const id = bg.getImageData(0, 0, S, S), od = eg.getImageData(0, 0, S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4, r = id.data[i], gg = id.data[i + 1], b = id.data[i + 2];
      if (x < S * 0.4 && y > S * 0.58 && r > 120 && r - b > 90) { od.data[i] = r; od.data[i + 1] = gg * 0.85; od.data[i + 2] = b * 0.5; } }
    eg.putImageData(od, 0, 0);
    const geo = RBX.parseOBJ(D.obj); geo.computeBoundingSphere(); const c = geo.boundingSphere.center, R = geo.boundingSphere.radius;
    geo.translate(-c.x, -c.y, -c.z); geo.scale(1 / R, 1 / R, 1 / R);
    geo.rotateZ(Math.PI / 2); geo.rotateY(Math.PI / 2);   // the rip faces +y with its brow toward +x: turn it to face +z, brow up
    const map = tex(base); map.flipY = true;
    const emap = tex(em);
    const mat = new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0, emissive: new THREE.Color(1, 1, 1), emissiveMap: emap, emissiveIntensity: o.eyeGlow ?? 6 });
    // a faint self-light so the face reads against the night sky
    const glow = new THREE.MeshBasicMaterial({ map, color: new THREE.Color(o.selfLight ?? 0.35, o.selfLight ?? 0.37, (o.selfLight ?? 0.35) * 1.15), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const g = new THREE.Group(), m = new THREE.Mesh(geo, mat), m2 = new THREE.Mesh(geo, glow); m2.renderOrder = 2; g.add(m, m2);
    g.userData.mesh = m; return g;
  };

  // ---------- post pipeline ----------
  const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
  const FS_BRIGHT = `uniform sampler2D t; uniform vec2 px; uniform float thr; varying vec2 vUv;
    void main(){ vec3 c = (texture2D(t, vUv + vec2(-px.x,-px.y)).rgb + texture2D(t, vUv + vec2(px.x,-px.y)).rgb + texture2D(t, vUv + vec2(-px.x,px.y)).rgb + texture2D(t, vUv + px).rgb) * 0.25;
      float l = max(c.r, max(c.g, c.b)); float k = max(l - thr, 0.); k = k * k / (k + 0.6); gl_FragColor = vec4(c * k / max(l, 1e-4), 1.); }`;
  const FS_DOWN = `uniform sampler2D t; uniform vec2 px; varying vec2 vUv;
    void main(){ gl_FragColor = vec4((texture2D(t, vUv + vec2(-px.x,-px.y)).rgb + texture2D(t, vUv + vec2(px.x,-px.y)).rgb + texture2D(t, vUv + vec2(-px.x,px.y)).rgb + texture2D(t, vUv + px).rgb) * 0.25, 1.); }`;
  const FS_BLUR = `uniform sampler2D t; uniform vec2 dir; varying vec2 vUv;
    void main(){ vec3 c = texture2D(t, vUv).rgb * 0.2270270270;
      c += (texture2D(t, vUv + dir * 1.3846153846).rgb + texture2D(t, vUv - dir * 1.3846153846).rgb) * 0.3162162162;
      c += (texture2D(t, vUv + dir * 3.2307692308).rgb + texture2D(t, vUv - dir * 3.2307692308).rgb) * 0.0702702703;
      gl_FragColor = vec4(c, 1.); }`;
  const FS_FINAL = `uniform sampler2D tC, tD, b0, b1, b2, b3; uniform vec2 res; uniform float near, far, focus, aperture, maxCoc, bloom, expo, vig, grain, sat, seed, contrast;
    uniform vec3 lift, gain, tint; varying vec2 vUv;
    float vz(float d){ return (near * far) / ((far - near) * d - far); }
    float coc(vec2 uv){ float z = -vz(texture2D(tD, uv).x); return clamp(aperture * abs(z - focus) / z, 0., 1.) * maxCoc; }
    vec3 RRT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
    vec3 aces(vec3 c){ const mat3 I = mat3(vec3(0.59719,0.07600,0.02840), vec3(0.35458,0.90834,0.13383), vec3(0.04823,0.01566,0.83777));
      const mat3 O = mat3(vec3(1.60475,-0.10208,-0.00327), vec3(-0.53108,1.10813,-0.07276), vec3(-0.07367,-0.00605,1.07602));
      c = c / 0.6; c = I * c; c = RRT(c); c = O * c; return clamp(c, 0., 1.); }
    vec3 srgb(vec3 c){ return mix(c * 12.92, pow(c, vec3(1./2.4)) * 1.055 - 0.055, step(0.0031308, c)); }
    float h12(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
    void main(){
      vec3 col = texture2D(tC, vUv).rgb; float c0 = coc(vUv);
      if (c0 > 0.6) { vec3 acc = col; float ws = 1.;
        for (int i = 0; i < 64; i++) { float fi = float(i); float r = sqrt((fi + 0.5) / 64.) * c0; float a = fi * 2.39996323;
          vec2 uv = vUv + vec2(cos(a), sin(a)) * r / res; float sc = coc(uv); float w = smoothstep(r - 1.5, r, sc);
          vec3 s = texture2D(tC, uv).rgb; w *= 1. + 0.6 * max(max(s.r, s.g), s.b); acc += s * w; ws += w; }
        col = acc / ws; }
      col += (texture2D(b0, vUv).rgb * 0.5 + texture2D(b1, vUv).rgb * 0.7 + texture2D(b2, vUv).rgb * 0.9 + texture2D(b3, vUv).rgb * 1.0) * bloom;
      col *= expo * tint;
      col = aces(col);
      col = pow(max(col, 0.), vec3(contrast)) ;
      col = col * gain + lift * (1. - col);
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722)); col = mix(vec3(l), col, sat);
      vec2 q = vUv - 0.5; q.x *= res.x / res.y; float v = smoothstep(0.95, 0.25, length(q)); col *= mix(1. - vig, 1., v);
      col = srgb(clamp(col, 0., 1.));
      col += (h12(vUv * res) - 0.5) * grain;
      gl_FragColor = vec4(col, 1.); }`;

  RBX.Post = function (renderer, W, H, ss = 2) {
    const SW = W * ss, SH = H * ss;
    const rt = new THREE.WebGLRenderTarget(SW, SH, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    rt.depthTexture = new THREE.DepthTexture(SW, SH); rt.depthTexture.type = THREE.UnsignedIntType;
    const mk = (w, h) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
    const levels = []; let w = W / 2, h = H / 2; for (let i = 0; i < 4; i++) { levels.push({ a: mk(w, h), b: mk(w, h), w, h }); w = Math.max(2, Math.round(w / 2)); h = Math.max(2, Math.round(h / 2)); }
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), qs = new THREE.Scene(); qs.add(quad);
    const sm = (fs, u) => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms: u, depthTest: false, depthWrite: false, toneMapped: false });
    const mBright = sm(FS_BRIGHT, { t: { value: null }, px: { value: new THREE.Vector2() }, thr: { value: 1 } });
    const mDown = sm(FS_DOWN, { t: { value: null }, px: { value: new THREE.Vector2() } });
    const mBlur = sm(FS_BLUR, { t: { value: null }, dir: { value: new THREE.Vector2() } });
    const U = { tC: { value: rt.texture }, tD: { value: rt.depthTexture }, b0: { value: levels[0].a.texture }, b1: { value: levels[1].a.texture }, b2: { value: levels[2].a.texture }, b3: { value: levels[3].a.texture },
      res: { value: new THREE.Vector2(W, H) }, near: { value: 0.1 }, far: { value: 500 }, focus: { value: 10 }, aperture: { value: 0 }, maxCoc: { value: 18 }, bloom: { value: 0.5 }, expo: { value: 1 },
      vig: { value: 0.3 }, grain: { value: 0.02 }, sat: { value: 1 }, seed: { value: 1 }, contrast: { value: 1 }, lift: { value: new THREE.Vector3() }, gain: { value: new THREE.Vector3(1, 1, 1) }, tint: { value: new THREE.Vector3(1, 1, 1) } };
    const mFinal = sm(FS_FINAL, U);
    const pass = (m, target) => { quad.material = m; renderer.setRenderTarget(target); renderer.render(qs, cam); };
    this.render = (scene, camera, o = {}) => {
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      // bloom chain
      mBright.uniforms.t.value = rt.texture; mBright.uniforms.px.value.set(0.5 / SW, 0.5 / SH); mBright.uniforms.thr.value = o.threshold ?? 1.0;
      pass(mBright, levels[0].a);
      for (let i = 0; i < levels.length; i++) {
        const L = levels[i];
        if (i > 0) { mDown.uniforms.t.value = levels[i - 1].a.texture; mDown.uniforms.px.value.set(0.5 / levels[i - 1].w, 0.5 / levels[i - 1].h); pass(mDown, L.a); }
        for (let k = 0; k < 2; k++) {
          mBlur.uniforms.t.value = L.a.texture; mBlur.uniforms.dir.value.set(1 / L.w, 0); pass(mBlur, L.b);
          mBlur.uniforms.t.value = L.b.texture; mBlur.uniforms.dir.value.set(0, 1 / L.h); pass(mBlur, L.a);
        }
      }
      U.near.value = camera.near; U.far.value = camera.far; U.focus.value = o.focus ?? 10; U.aperture.value = o.aperture ?? 0; U.maxCoc.value = o.maxCoc ?? 18;
      U.bloom.value = o.bloom ?? 0.5; U.expo.value = o.exposure ?? 1; U.vig.value = o.vignette ?? 0.3; U.grain.value = o.grain ?? 0.02; U.sat.value = o.saturation ?? 1;
      U.contrast.value = o.contrast ?? 1; U.lift.value.set(...(o.lift || [0, 0, 0])); U.gain.value.set(...(o.gain || [1, 1, 1])); U.tint.value.set(...(o.tint || [1, 1, 1])); U.seed.value = o.seed ?? 1;
      pass(mFinal, null);
    };
  };

  // ---------- beams: additive light shafts from a slot, along a direction ----------
  RBX.beamMat = function (color = '#9CB8FF', strength = 0.3) {
    return new THREE.ShaderMaterial({
      uniforms: { col: { value: new THREE.Color(color) }, k: { value: strength } },
      vertexShader: 'varying vec3 lp; void main(){ lp = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `uniform vec3 col; uniform float k; varying vec3 lp;
        void main(){ float t = clamp(lp.z, 0., 1.); float e = (1. - smoothstep(0.25, 0.5, abs(lp.x))) * (1. - smoothstep(0.2, 0.5, abs(lp.y)));
          float a = k * e * pow(1. - t, 1.6) * smoothstep(0., 0.04, t); gl_FragColor = vec4(col * a, 1.); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    });
  };
  // a light shaft from a slot at `from` along `dir`, size (w,h,len): stacked horizontal sheets (local x,y in -0.5..0.5, z 0..1)
  // so the shaft reads from any angle; the sheets fade across x/y and along the length
  RBX.beam = function (from, dir, w, h, len, mat) {
    const g = new THREE.Group(), N = Math.max(1, Math.min(12, Math.round(h / 0.35)));
    for (let i = 0; i < N; i++) {
      const geo = new THREE.PlaneGeometry(1, 1, 1, 8); geo.rotateX(-Math.PI / 2); geo.translate(0, N === 1 ? 0 : (i + 0.5) / N - 0.5, 0.5);
      const m = new THREE.Mesh(geo, mat); m.renderOrder = 10; g.add(m);
    }
    g.position.copy(from); g.scale.set(w, h, len);
    const d = dir.clone().normalize(), M = new THREE.Matrix4().lookAt(from.clone().add(d), from, new THREE.Vector3(0, 1, 0));
    g.quaternion.setFromRotationMatrix(M); return g;
  };
})();
