// rbx-thursday shared set kit: texture painters, box helpers, world-UV boxes. Sets register in SETS.<name>.
'use strict';
const SETS = {};
const KIT = {};
(function () {
  const { cnv, tex, pbr, rng, fbm, tnoise } = RBX;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  KIT.V = V;
  KIT.shadow = (o, cast = true, recv = true) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };
  // colour + height canvas pair: draw(g, hg, w, h)
  KIT.texPair = function (S, draw, o = {}) {
    const H = o.h || S, c = cnv(S, H), hc = cnv(S, H), g = c.getContext('2d'), hg = hc.getContext('2d');
    hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, H); draw(g, hg, S, H); return { c, h: hc };
  };
  KIT.noiseOver = function (g, w, h, seed, amt, period = 8, oct = 4) {
    const n = fbm(seed, period, oct), im = g.getImageData(0, 0, w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 1 + (n(x / w, y / h) - 0.5) * amt, i = (y * w + x) * 4; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; }
    g.putImageData(im, 0, 0);
  };
  KIT.star = function (g, x, y, r, n = 5, inset = 0.45) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, rr = i % 2 ? r * inset : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); };
  KIT.woodPlanks = function (S, seed, o = {}) {
    return KIT.texPair(S, (g, hg) => {
      const r = rng(seed), rows = o.rows || 5, rh = S / rows, grain = fbm(seed + 3, 4, 4), streak = tnoise(seed + 5, 64);
      const tones = o.tones || ['#9a5a2c', '#8a4c22', '#a8652f', '#7e4420', '#93552a'];
      const im = g.createImageData(S, S), d = im.data;
      const seams = []; for (let k = 0; k < rows; k++) { const off = r() * S; seams.push([off % S, (off + S * (0.45 + r() * 0.2)) % S]); }
      const baseC = []; for (let k = 0; k < rows; k++) { const c = new THREE.Color(tones[k % tones.length]); baseC.push([c.r * 255, c.g * 255, c.b * 255, 0.85 + r() * 0.3]); }
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const k = Math.floor(y / rh), [R, G, B, f] = baseC[k], u = x / S, v = y / S;
        const gl = Math.sin((v * rows * 9 + grain(u * 0.25, v) * 7) * Math.PI) * 0.5 + 0.5;
        const kk = f * (0.82 + 0.16 * gl + 0.12 * (streak(u * 0.2, v * 3) - 0.5));
        const i = (y * S + x) * 4; d[i] = R * kk; d[i + 1] = G * kk; d[i + 2] = B * kk; d[i + 3] = 255;
      }
      g.putImageData(im, 0, 0);
      const hm = hg.getImageData(0, 0, S, S);
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4, gl = grain((x / S) * 0.25, y / S); hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = 140 + gl * 40; }
      hg.putImageData(hm, 0, 0);
      for (let k = 0; k <= rows; k++) { const y = k * rh; g.fillStyle = 'rgba(25,10,4,0.85)'; g.fillRect(0, y - 1.5, S, 3); hg.fillStyle = '#000'; hg.fillRect(0, y - 2, S, 4); }
      if (!o.noSeams) seams.forEach(([a, b], k) => [a, b].forEach((x) => { g.fillStyle = 'rgba(25,10,4,0.8)'; g.fillRect(x - 1.5, k * rh, 3, rh); hg.fillStyle = '#000'; hg.fillRect(x - 2, k * rh, 4, rh); }));
      if (o.knots) for (let i = 0; i < o.knots; i++) { const x = r() * S, y = r() * S; g.fillStyle = 'rgba(50,22,8,0.55)'; g.beginPath(); g.ellipse(x, y, 9, 4, 0, 0, 7); g.fill(); }
    });
  };
  KIT.bricks = function (S, seed, o = {}) {
    const rows = o.rows || 8, cols = o.cols || 4, base = new THREE.Color(o.color || '#8e4230');
    return KIT.texPair(S, (g, hg) => { g.fillStyle = o.mortar || '#5e5a55'; g.fillRect(0, 0, S, S); hg.fillStyle = '#202020'; hg.fillRect(0, 0, S, S); const r2 = rng(seed), bh = S / rows, bw = S / cols;
      for (let row = 0; row < rows; row++) for (let k = -1; k <= cols; k++) { const x = k * bw + (row % 2 ? bw / 2 : 0), y = row * bh, t = 0.75 + r2() * 0.4; g.fillStyle = `rgb(${base.r * 255 * t},${base.g * 255 * t},${base.b * 255 * t})`; g.fillRect(x + 4, y + 4, bw - 8, bh - 8); hg.fillStyle = '#c0c0c0'; hg.fillRect(x + 4, y + 4, bw - 8, bh - 8); }
      KIT.noiseOver(g, S, S, seed + 3, 0.45, 16, 4); });
  };
  // world-unit UVs for boxes: rescale each face's UVs to the box size so map.repeat = 1/tile works
  KIT.uvBox = function (geo, w, h, d) {
    const uv = geo.attributes.uv, sizes = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    geo.groups.forEach((gr, gi) => { const seen = new Set(); for (let i = gr.start; i < gr.start + gr.count; i++) seen.add(geo.index.getX(i)); seen.forEach((vi) => uv.setXY(vi, uv.getX(vi) * sizes[gi][0], uv.getY(vi) * sizes[gi][1])); });
    uv.needsUpdate = true; return geo;
  };
  KIT.box = (w, h, d, mat, x, y, z, worldUV = false) => { const geo = new THREE.BoxGeometry(w, h, d); if (worldUV) KIT.uvBox(geo, w, h, d); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  KIT.rb = (w, h, d, r, mat, x, y, z) => { const m = new THREE.Mesh(RBX.rbox(w, h, d, r, 10), mat); m.position.set(x, y, z); return m; };
  // clone a material with its own repeat (for world-UV boxes / planes)
  KIT.wm = (m, rep) => { const k = m.clone(); ['map', 'normalMap', 'roughnessMap'].forEach((p) => { if (k[p]) { k[p] = k[p].clone(); k[p].wrapS = k[p].wrapT = THREE.RepeatWrapping; k[p].repeat.set(rep[0], rep[1]); k[p].needsUpdate = true; } }); return k; };
  // canvas with text (signs, chalk, labels)
  KIT.textTex = function (w, h, draw) { const c = cnv(w, h), g = c.getContext('2d'); draw(g, w, h); return tex(c); };
  // standard grades for RBX.Post
  // grades matched to Gneef (crvPRFMpKLA + 15 shorts, measured 2026-11-08): day = clean high-key, deep saturated sky, cool blue
  // shadows / warm highlights, almost no vignette or grain; night = dark, very saturated blue-violet, cool key on faces;
  // red = the monster grade. Shadow colour comes from the scene's sky fill, not from the grade.
  KIT.GRADE = {
    snow: { aperture: 1, maxCoc: 10, bloom: 0.35, threshold: 1.0, exposure: 0.9, vignette: 0.28, grain: 0.006, saturation: 1.2, contrast: 1.22, lift: [0.0, 0.006, 0.03], gain: [0.96, 0.99, 1.06] },
    day: { aperture: 1, maxCoc: 8, bloom: 0.14, threshold: 1.6, exposure: 1.04, vignette: 0.12, grain: 0.004, saturation: 1.3, contrast: 1.1, lift: [0, 0.006, 0.02], gain: [1.03, 1.0, 0.95] },
    night: { aperture: 1, maxCoc: 12, bloom: 0.45, threshold: 0.9, exposure: 1.05, vignette: 0.38, grain: 0.008, saturation: 1.55, contrast: 1.22, lift: [0.0, 0.0, 0.012], gain: [0.78, 0.8, 1.22] },
    sunset: { aperture: 1, maxCoc: 10, bloom: 0.3, threshold: 1.15, exposure: 1.1, vignette: 0.18, grain: 0.006, saturation: 1.0, contrast: 1.1, lift: [0.0, 0.006, 0.03], gain: [0.97, 0.97, 1.02] },
    fog: { aperture: 1, maxCoc: 12, bloom: 0.4, threshold: 0.95, exposure: 1.1, vignette: 0.3, grain: 0.006, saturation: 1.25, contrast: 1.1, lift: [0.01, 0.0, 0.04], gain: [0.9, 0.88, 1.1] },
    red: { aperture: 1, maxCoc: 12, bloom: 0.5, threshold: 0.9, exposure: 1.1, vignette: 0.45, grain: 0.008, saturation: 1.4, contrast: 1.3, lift: [0.02, 0, 0], gain: [1.7, 0.28, 0.22] },
    sepia: { aperture: 1, maxCoc: 10, bloom: 0.3, threshold: 1.0, exposure: 1.15, vignette: 0.45, grain: 0.03, saturation: 0.35, contrast: 1.1, lift: [0.04, 0.025, 0.0], gain: [1.08, 0.98, 0.82] },
    morning: { aperture: 1, maxCoc: 10, bloom: 0.18, threshold: 1.5, exposure: 1.02, vignette: 0.15, grain: 0.005, saturation: 1.3, contrast: 1.08, lift: [0.01, 0.006, 0.0], gain: [1.04, 0.99, 0.93] },
  };
})();
