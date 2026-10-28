// refont.js — "fuente Resident Evil" (ref del usuario: Ref ava bread/resident font.png): letras altas y condensadas de trazo
// uniforme, sin suavizado. Se obtiene rasterizando Tahoma Bold a tamano de pixel (umbral, sin antialias), estirada x1.25 en
// vertical y escalada a entero (nearest). Misma firma que pixfont.bitText: sc=1 etiquetas (10 px), sc>=2 subtitulos.
const cv = document.createElement('canvas'); cv.width = 512; cv.height = 40; const cx = cv.getContext('2d', { willReadFrequently: true });
const STRETCH = 1.25;
const cache = new Map();
function glyphs(s, base) {   // mascara 1-bit del texto a tamano base, estirada en vertical
  const key = s + '|' + base; if (cache.has(key)) return cache.get(key);
  cx.clearRect(0, 0, cv.width, cv.height);
  cx.font = `bold ${base}px Tahoma, Verdana, sans-serif`; cx.textBaseline = 'top'; cx.textAlign = 'left'; cx.fillStyle = '#fff';
  cx.letterSpacing = base >= 12 || base === 9 ? '1px' : '0px';
  cx.fillText(s, 2, 2); cx.letterSpacing = '0px';
  const W = Math.min(cv.width, Math.ceil(cx.measureText(s).width) + (base >= 12 || base === 9 ? s.length : 0) + 6), H = base + 6;
  const d = cx.getImageData(0, 0, W, H).data, m0 = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) m0[i] = d[i * 4 + 3] > 140 ? 1 : 0;
  let y0 = H, y1 = -1, x0 = W, x1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m0[y * W + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  if (y1 < 0) { const r = { w: 0, h: 0, m: new Uint8Array(0) }; cache.set(key, r); return r; }
  // caja de la linea (no de las letras) para que todas las palabras compartan la linea base
  y0 = 2; y1 = Math.max(y1, 2 + Math.round(base * 0.95));
  const w = x1 - x0 + 1, h0 = y1 - y0 + 1, h = Math.round(h0 * STRETCH), m = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) { const sy = y0 + Math.min(h0 - 1, Math.floor(y / STRETCH)); for (let x = 0; x < w; x++) m[y * w + x] = m0[sy * W + x0 + x]; }
  const r = { w, h, m }; cache.set(key, r); return r;
}
const spec = (sc) => (sc >= 3 ? { base: 9, k: sc } : sc === 2 ? { base: 12, k: 1 } : { base: 10, k: 1 });   // sc 3 (subtitulos): 8 px x3, mas pixelado
export function reWidth(s, sc = 1) { const { base, k } = spec(sc); return glyphs(s, base).w * k; }
/** centrado en (x, y); outline: color del contorno (1 px base) o null; devuelve [X, Y, w, h] */
export function reText(ctx, s, x, y, sc = 1, fg = '#ffffff', { outline = '#040412' } = {}) {
  const { base, k } = spec(sc), g = glyphs(s, base); if (!g.w) return [x, y, 0, 0];
  const W = g.w * k, H = g.h * k, X = Math.round(x - W / 2), Y = Math.round(y - H / 2);
  if (outline) {
    ctx.fillStyle = outline;
    for (let yy = 0; yy < g.h; yy++) for (let xx = 0; xx < g.w; xx++) if (g.m[yy * g.w + xx]) ctx.fillRect(X + (xx - 1) * k, Y + (yy - 1) * k, 3 * k, 3 * k);
  }
  ctx.fillStyle = fg;
  for (let yy = 0; yy < g.h; yy++) {   // tramos horizontales: menos fillRect
    let xx = 0;
    while (xx < g.w) { if (!g.m[yy * g.w + xx]) { xx++; continue; } const a = xx; while (xx < g.w && g.m[yy * g.w + xx]) xx++; ctx.fillRect(X + a * k, Y + yy * k, (xx - a) * k, k); }
  }
  return [X, Y, W, H];
}
