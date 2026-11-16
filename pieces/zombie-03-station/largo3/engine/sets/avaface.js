// sets/avaface.js — cara 'scared' de Ava (celda 13 del atlas de ojos: ojos muy abiertos mirando de reojo + cejas de preocupacion).
// Copia literal del pintado del ep7 (pieces/zombie-07-saferoom/engine/sets/saferoom.js, que a su vez copia el del ep5).
// Solo el atlas de la cara: el modelo y el resto de las texturas de Ava NO se tocan.
export function paintScared(ch) {
  ch.root.traverse((o) => {
    if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m.map || m.map.userData.v3 || m.name !== 'face_eyes') return;
      const im = m.map.image, W2 = im.width, H2 = im.height, k = W2 / 2048, ky = H2 / 128, cell = 128 * k;
      const cv = document.createElement('canvas'); cv.width = W2; cv.height = H2; const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
      const SRC = 9 * cell, C13 = 13 * cell;
      const st = document.createElement('canvas'); st.width = Math.round(64 * k); st.height = H2; const s2 = st.getContext('2d', { willReadFrequently: true });
      s2.drawImage(cv, SRC + 86 * k, 0, 42 * k, H2, 0, 0, 42 * k, H2); s2.drawImage(cv, SRC, 0, 22 * k, H2, 42 * k, 0, 22 * k, H2);
      const DX = -2.5;
      for (const cx of [16, 47]) {
        const x0 = Math.round((cx - 10) * k), y0 = Math.round(76 * ky), w = Math.round(20 * k), h = Math.round(13 * ky);
        const d = s2.getImageData(x0, y0, w, h), P = d.data, lum = (i) => (P[i] + P[i + 1] + P[i + 2]) / 3;
        let sx = 0, sy = 0, n = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (lum(i) > 190 && Math.abs(P[i] - P[i + 2]) < 40) { sx += x; sy += y; n++; } }
        if (!n) continue; const ex = sx / n, ey = sy / n, rx = 5.5 * k, ry = 3.6 * ky;
        const pup = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (((x - ex) / rx) ** 2 + ((y - ey) / ry) ** 2 < 1 && lum(i) < 110) pup.push([x, y, P[i], P[i + 1], P[i + 2]]); }
        for (const [x, y] of pup) { const i = (y * w + x) * 4; P[i] = 236; P[i + 1] = 232; P[i + 2] = 228; }
        for (const [x, y, r, g, b] of pup) { const xx = Math.round(x + DX * k); if (xx < 0 || xx >= w || ((xx - ex) / (rx * 1.15)) ** 2 + ((y - ey) / ry) ** 2 >= 1) continue; const i = (y * w + xx) * 4; P[i] = r; P[i + 1] = g; P[i + 2] = b; }
        s2.putImageData(d, x0, y0);
      }
      s2.strokeStyle = '#4a2c18'; s2.lineWidth = 1.6 * k; s2.lineCap = 'round';
      for (const [cx, inner] of [[16, 1], [47, -1]]) { s2.beginPath(); s2.moveTo((cx - 7 * inner) * k, 92 * ky); s2.lineTo((cx + 6 * inner) * k, 95.5 * ky); s2.stroke(); }
      c.drawImage(cv, SRC, 0, cell, H2, C13, 0, cell, H2);
      c.clearRect(C13 + 86 * k, 0, 42 * k, H2); c.drawImage(st, 0, 0, 42 * k, H2, C13 + 86 * k, 0, 42 * k, H2);
      c.clearRect(C13, 0, 22 * k, H2); c.drawImage(st, 42 * k, 0, 22 * k, H2, C13, 0, 22 * k, H2);
      m.map.image = cv; m.map.userData.v3 = 1; m.map.needsUpdate = true;
    });
  });
}
