// =====================================================================
//  SET trade — the trading floor (x -40..40, z 0..64, h 28). Cobalt walls, warm carpet, red/green screens, one take
//  for s13 s14 s15 s16 s17 g2 s18 (35.82-55.58, seqCam 'trade').
//  Back wall (z 0), left to right: the wall TV (x -35..-23) over a credenza, the GIANT WALL CHART (x -15..15) whose
//  plunging line is a real 3D bar you can ride, the "+1" counter (x 15.5..19.5), three tall windows onto the city
//  (x 20..39; the intern leaves through pane 1). Above them the headline CRAWL (y 19.4..21) and the wrap-around LED
//  TICKER band (y 23.2..25.8, on all four walls). Desk rows with double-sided multi-screen banks: R1 (z 28..32),
//  R2 (z 50..54) and the island I0 under the windows; the intern's desk (skis leaning on it) left of the chart; a door
//  on the right wall (z 12.5..19.5) the shopping cart comes through. Traders: 8 invented faces + CAST.intern.
//  Prefix TR / tr.
// =====================================================================
const TR = {};
const TR_X = 40, TR_Z = 64, TR_H = 28;
const trE = (a, b, t) => clamp((t - a) / (b - a));
const TR_R1 = 30, TR_R2 = 58, TR_SEG = [[-34, -3], [4, 34]], TR_I0 = [27, 38, 8];   // desk rows (centre z), x segments; island x0, x1, centre z
const TR_INT = [-9.5, 9.5], TR_IDESK = [-14, 7.5], TR_LENA0 = [-3, 14], TR_LENA1 = [-11, 26.4];
const TR_CRAWL_Y = 20.2, TR_TICK_Y = 24.5, TR_CART_Z = 16;
// ---- headwear (fix 3: every head in the piece unique): piece-local hair styles = a base cut + a hat drawn on the hair layer
// (so it gets the hair's ink outline and its soft shadow on the forehead). [base, kind, colour 1, colour 2]
const TR_HAT = {
  TRvisor: ['short', 'visor', '#34c46e', '#f4f2ea'], TRsweat: ['ponytail2', 'sweat', '#e8342a', '#f6f2ea'], TRhset: ['mop', 'headset', '#2a2c34', '#5a5e6c'],
  TRbeanie: ['short', 'beanie', '#f0a62a', '#c87814'], TRphones: ['bob', 'phones', '#f4f2ee', '#f28aac'], TRflat: ['short', 'flat', '#9a7a52', '#5e4630'],
  TRshades: ['bun', 'shades', '#7a4a22', '#262032'], TRback: ['curly', 'backcap', '#1ea08e', '#127064'] };
for (const k in TR_HAT) T3_HSTYLE[k] = Object.assign({}, T3_HSTYLE[TR_HAT[k][0]], { trHat: k });
function trDrawHat(h, [, kind, c1, c2], f, cx, cy, A, Bh) {
  const back = f.back, dir = f.dir || 1, m = f.m || 0, u = 2 * A / 100, ink = T3.ink, pr = back ? 0 : Math.min(1, Math.max(0, m - 1));   // pr: how far into profile
  const P = ([x, y]) => [cx + (x + (back ? 0 : -dir * 0.1 * Math.max(0, m - 1))) * A, cy + y * Bh];
  const arc = (cu, cv, ru, rv, a0, a1, n = 28) => { const q = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; q.push([cu + ru * Math.cos(a), cv + rv * Math.sin(a)]); } return q; };
  const crv = (v0, bow, u0, u1, n = 20) => { const q = []; for (let i = 0; i <= n; i++) { const x = u0 + (u1 - u0) * i / n; q.push([x, v0 + bow * (1 - x * x)]); } return q; };   // a band edge (lower in the middle)
  const shade = (c, y0, y1) => { const g = h.createLinearGradient(0, cy + y0 * Bh, 0, cy + y1 * Bh); g.addColorStop(0, t3Mix(c, '#ffffff', 0.22)); g.addColorStop(1, t3Mul(c, 0.78)); return g; };
  const fill = (q, c, y0 = -1.3, y1 = 0.3) => { t3Path(h, q.map(P)); h.fillStyle = typeof c === 'string' && c[0] === '#' ? shade(c, y0, y1) : c; h.fill(); };
  const line = (q, w, c, a = 1) => { h.save(); h.globalAlpha = a; t3Stroke(h, q.map(P), w * u, c); h.restore(); };
  const band = (vt, vb, bow, ur, c) => { const top = crv(vt, bow, -ur, ur), bot = crv(vb, bow, ur, -ur); fill(top.concat(bot), c, vt, vb); return [top, bot]; };
  h.save(); h.setTransform(f.k, 0, 0, f.k, 0, 0); h.globalCompositeOperation = 'source-over'; h.globalAlpha = 1; h.filter = 'none';
  if (kind === 'visor') {   // the trader's green eyeshade: a white band + a see-through green brim over the brows
    band(-0.74, -0.54, 0.2, 1.02, c2); line(crv(-0.64, 0.2, -0.98, 0.98), 1.4, c1, 0.9);
    if (!back) { const s = dir * 0.22 * pr, B = crv(-0.54, 0.2, 0.96 + s, -0.96 + s).concat(crv(-0.32, 0.14, -0.82 + 2 * s, 0.82 + 2 * s));
      t3Path(h, B.map(P)); h.fillStyle = 'rgba(52,196,110,0.62)'; h.fill(); line(crv(-0.32, 0.14, -0.82 + 2 * s, 0.82 + 2 * s), 2.2, '#1a7a44', 0.9); } }
  else if (kind === 'sweat') { band(-0.76, -0.52, 0.2, 1.05, c1); line(crv(-0.64, 0.2, -1.02, 1.02), 3.2, c2); }
  else if (kind === 'headset' || kind === 'phones') {   // band over the crown + ear cups (+ the boom mic on the trader's headset)
    const big = kind === 'phones', cr = big ? [0.22, 0.31] : [0.17, 0.25];
    line(arc(0, -0.02, 1.1, 1.22, 186, 354), big ? 7 : 5.5, c1); line(arc(0, -0.02, 1.1, 1.22, 200, 340), big ? 2.4 : 1.8, c2, 0.8);
    for (const s of [-1, 1]) { if (pr > 0.5 && s === dir) continue; const ux = s * 1.08 * (1 - 0.6 * pr * (s === -dir ? 1 : 0));
      fill(arc(ux, 0.1, cr[0], cr[1], 0, 360), c1, -0.2, 0.4); fill(arc(ux, 0.1, cr[0] * 0.55, cr[1] * 0.6, 0, 360), c2, -0.1, 0.3); }
    if (!big && !back && pr < 0.6) { const q = [[-1.0, 0.3], [-0.92, 0.5], [-0.62, 0.56], [-0.42, 0.5]]; line(q, 2.6, c1); fill(arc(-0.38, 0.49, 0.08, 0.06, 0, 360), '#16161c'); } }
  else if (kind === 'beanie') {   // knit dome + a rolled cuff + a pompom
    fill(arc(0, -0.32, 1.13, 0.98, 180, 360).concat(crv(-0.24, 0.08, 1.15, -1.15)), c1, -1.3, -0.3);
    for (let i = -4; i <= 4; i++) line([[i * 0.25, -0.4 + 0.08 * (1 - (i * 0.25) ** 2)], [i * 0.17, -0.85], [i * 0.08, -1.18]], 1.1, c2, 0.5);
    const [top] = band(-0.52, -0.22, 0.08, 1.16, c2); for (let i = -6; i <= 6; i++) { const x = i * 0.18; line([[x, -0.5 + 0.08 * (1 - x * x)], [x, -0.25 + 0.08 * (1 - x * x)]], 1, t3Mul(c2, 0.7), 0.6); }
    fill(arc(0, -1.36, 0.2, 0.18, 0, 360), c1, -1.55, -1.2); line(top, 1.2, t3Mix(c2, '#ffffff', 0.3), 0.6); }
  else if (kind === 'flat') {   // a tweed flat cap: a flattened crown leaning forward + a short brim, herringbone flecks, a button
    const s = back ? 0 : dir * 0.18 * pr;
    fill([[-1.16, -0.46], [-1.12, -0.86], [-0.7, -1.16], [0.1, -1.24], [0.8, -1.14], [1.18, -0.84], [1.2, -0.46], [0.6, -0.52], [0, -0.54], [-0.6, -0.52]].map(([x, y]) => [x + s * (1 + y), y]), c1, -1.25, -0.45);
    for (let i = 0; i < 9; i++) { const x = -0.9 + i * 0.22; line([[x, -0.62], [x + 0.08, -0.82], [x, -1.0]], 0.9, c2, 0.45); }
    if (!back) { fill(crv(-0.56, 0.06, -0.96 + 2 * s, 0.96 + 2 * s).concat(crv(-0.36, 0.1, 0.84 + 3 * s, -0.84 + 3 * s)), c2, -0.6, -0.3); line(crv(-0.56, 0.06, -0.96 + 2 * s, 0.96 + 2 * s), 1.4, t3Mul(c2, 0.6), 0.7); }
    fill(arc(0.1 + s * 0.4, -1.22, 0.07, 0.05, 0, 360), c2); }
  else if (kind === 'shades') {   // sunglasses pushed up on the head: tortoiseshell frames, dark lenses with a gloss streak
    line([[-1.06, -0.52], [-0.62, -0.74]], 2.2, c1); line([[1.06, -0.52], [0.62, -0.74]], 2.2, c1);
    if (!back) { for (const s of [-1, 1]) { const x = s * 0.36 + dir * 0.2 * pr; fill(arc(x, -0.76, 0.27, 0.16, 0, 360), c1, -0.95, -0.6); fill(arc(x, -0.76, 0.21, 0.11, 0, 360), c2, -0.9, -0.65); line([[x - 0.12, -0.72], [x - 0.02, -0.84]], 1.4, '#ffffff', 0.55); }
      line([[-0.1 + dir * 0.2 * pr, -0.8], [0.1 + dir * 0.2 * pr, -0.8]], 2.2, c1); } }
  else if (kind === 'backcap') {   // a cap worn backwards on top of the curls: crown, the strap opening at the front, the peak behind
    if (!back && pr > 0.15) fill([[-dir * 0.7, -1.0], [-dir * (1.0 + 0.5 * pr), -1.0], [-dir * (1.05 + 0.5 * pr), -0.88], [-dir * 0.7, -0.88]], c2, -1.05, -0.85);
    fill(arc(0, -0.86, 0.98, 0.6, 180, 360).concat(crv(-0.86, 0.06, 0.98, -0.98)), c1, -1.46, -0.8); line(crv(-0.86, 0.06, -0.98, 0.98), 2.2, c2, 0.9);
    if (!back) { fill(arc(0, -0.86, 0.22, 0.16, 180, 360), t3HairCol({ hairColor: 'dark' })); line([[-0.22, -0.84], [0.22, -0.84]], 1.6, c2); }
    for (const x of [-0.5, 0, 0.5]) line([[x * 0.9, -0.92], [x * 0.5, -1.42]], 1, c2, 0.55); fill(arc(0, -1.45, 0.07, 0.05, 0, 360), c2); }
  h.restore(); }
{ const base = t3HairLayers;   // wrap the kit's hair layer for the TR styles only (every other style passes straight through)
  t3HairLayers = function (o, f, cx, cy, A, Bh, light, env, hp) { const r = base(o, f, cx, cy, A, Bh, light, env, hp), S = t3Style(o.hair);
    if (r && S && S.trHat) trDrawHat(r.hc.getContext('2d'), TR_HAT[S.trHat], f, cx, cy, A, Bh); return r; }; }
// the cast of the floor (invented, distinct from huang / intern and from each other)
Object.assign(CAST, {
  TRcole: { key: 'TRcole', hair: 'TRvisor', hairColor: 'blond', outfit: 'shirt', colors: { main: '#6aaef0', tie: '#d8342a' }, skin: 'peach', body: 'fat' },          // drops his coffee
  TRmara: { key: 'TRmara', hair: 'TRsweat', hairColor: 'auburn', outfit: 'vest', colors: { main: '#28386e', shirt: '#f4f2ee', tie: '#e8a030' }, skin: 'brown', body: 'thin' },   // on the phone
  TRraj: { key: 'TRraj', hair: 'TRhset', hairColor: 'ginger', outfit: 'vest', colors: { main: '#6a3a8e', shirt: '#e6eeff', tie: '#3ab07a' }, skin: 'tan', body: 'thin' },
  TRdev: { key: 'TRdev', hair: 'TRbeanie', hairColor: 'black', outfit: 'sweater', colors: { main: '#38a46e', rib: '#2a8456' }, skin: 'tan', body: 'tall' },
  TRyuki: { key: 'TRyuki', hair: 'TRphones', hairColor: 'black', outfit: 'shirt', colors: { main: '#f28aac', tie: '#3a3a8a' }, skin: 'peach', body: 'short' },
  TRgus: { key: 'TRgus', hair: 'TRflat', hairColor: 'white', outfit: 'suit', colors: { main: '#7a2e44', tie: '#f2c23a', shirt: '#f4efe6' }, skin: 'pale', body: 'pear', moustache: true },
  TRlena: { key: 'TRlena', hair: 'TRshades', hairColor: 'blond', outfit: 'suit', colors: { main: '#2a7a8e', shirt: '#f6f2ea', tie: '#f05a4a' }, skin: 'white', body: 'avg' },   // holds the org chart
  TRomar: { key: 'TRomar', hair: 'TRback', hairColor: 'dark', outfit: 'polo', colors: { main: '#ec7a2c', collar: '#c85a1a' }, skin: 'brown', body: 'avg' },   // pushes the cart
});
const TR_PEOPLE = ['TRcole', 'TRmara', 'TRraj', 'TRdev', 'TRyuki', 'TRgus', 'TRlena', 'TRomar', 'intern'];

// ---- LED text helpers
function trTri(g, x, y, s, up, col) { g.beginPath(); if (up) { g.moveTo(x - s, y + s * 0.8); g.lineTo(x + s, y + s * 0.8); g.lineTo(x, y - s * 0.8); } else { g.moveTo(x - s, y - s * 0.8); g.lineTo(x + s, y - s * 0.8); g.lineTo(x, y + s * 0.8); } g.closePath(); g.fillStyle = col; g.fill(); }
function trDia(g, x, y, s, col) { g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); g.fillStyle = col; g.fill(); }
// monospace LED text: one char per cell (cw px), condensed to fit; arrows and diamonds drawn as shapes. Returns the end x.
function trMono(g, txt, x, y, cw, size, col, o = {}) {
  g.save(); g.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const ch of txt) { const cx = x + cw / 2;
    if (ch === '▼' || ch === '▲') trTri(g, cx, y, size * 0.3, ch === '▲', o.arrow ?? (ch === '▲' ? '#3ae06a' : '#ff3a2e'));
    else if (ch === '◆') trDia(g, cx, y, size * 0.24, o.dia ?? '#ff6a3a');
    else if (ch !== ' ') { const w = g.measureText(ch).width, k = Math.min(1, cw * 0.9 / Math.max(1, w)); g.save(); g.translate(cx, y); g.scale(k, 1); g.fillStyle = col; g.fillText(ch, 0, 0); g.restore(); }
    x += cw; }
  g.restore(); return x; }
// proportional text squeezed horizontally (sx), left aligned; returns the end x
function trText(g, txt, x, y, size, col, sx = 0.82, o = {}) { g.save(); g.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; g.textBaseline = 'middle'; g.textAlign = 'left';
  const w = g.measureText(txt).width * sx; g.translate(x, y); g.scale(sx, 1); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore(); return x + w; }
function trLedDots(g, w, h, step, col) { g.fillStyle = col; for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) g.fillRect(x - 1, y - 1, 2, 2); }

// ---- the headline CRAWL (back wall, y 19.4..21): a 120-unit canvas (68 px/unit) slid along the 80-unit strip
const TR_CPU = 68, TR_CELL = 0.647, TR_CL = 120;
const TR_WED = 'WED · NYT: A SECOND RELATIONSHIP, WITH AN EXECUTIVE WHO REPORTS TO HIM';
const TR_THU = 'THU · REUTERS: ANOTHER ONE';
const TR_CA = 'MON · NVDA ▼ ~5%   ◆   SUN · BOARD OPENS INDEPENDENT INVESTIGATION   ◆   MON · NVDA ▼ ~5%   ◆   SUN · BOARD OPENS INDEPENDENT INVESTIGATION   ◆';
const TR_WED_U = 2, TR_THU_U = TR_WED_U + (TR_WED.length + 5) * TR_CELL;
const trCrawlX = (t) => -34 - 1.2 * (t - 40.38);   // world x of the crawl canvas origin (crawls left 1.2 u/s)
function trCrawlState(t) { if (t < 40.30) return ['A', 'A', 0]; if (t < 40.62) return ['A', 'B', lerp(-40, 40, trE(40.30, 40.62, t))];
  if (t < 44.70) return ['B', 'B', 0]; if (t < 45.00) return ['B', 'C', lerp(-40, 40, trE(44.70, 45.00, t))]; return ['C', 'C', 0]; }
function trDrawCrawl(g, w, h, t) {
  const [o, n, wx] = trCrawlState(t), cw = TR_CELL * TR_CPU, sz = 84, y = h / 2 + 2, front = o === n ? 0 : Math.round((wx - trCrawlX(t)) * TR_CPU);
  const content = (k) => { g.shadowColor = 'rgba(255,170,60,0.75)'; g.shadowBlur = 10;
    if (k === 'A') trMono(g, TR_CA, 2 * TR_CPU, y, cw, sz, '#ffbe4a');
    else { const x1 = trMono(g, 'WED · NYT:', TR_WED_U * TR_CPU, y, cw, sz, '#ff6a4a'); trMono(g, TR_WED.slice(10), x1, y, cw, sz, '#ffe2a8');
      trMono(g, '◆', (TR_WED_U + (TR_WED.length + 2) * TR_CELL) * TR_CPU, y, cw, sz, '#ffe2a8');
      if (k === 'C') { const x2 = trMono(g, 'THU · REUTERS:', TR_THU_U * TR_CPU, y, cw, sz, '#ff6a4a'); trMono(g, TR_THU.slice(14), x2, y, cw, sz, '#ffe2a8');
        trMono(g, '◆', (TR_THU_U + (TR_THU.length + 2) * TR_CELL) * TR_CPU, y, cw, sz, '#ffe2a8'); } }
    g.shadowBlur = 0; };
  g.fillStyle = '#2c3c80'; g.fillRect(0, 0, w, h); trLedDots(g, w, h, 8, 'rgba(140,165,235,0.26)');
  if (o === n) content(n);
  else { g.save(); g.beginPath(); g.rect(0, 0, Math.max(0, front), h); g.clip(); content(n); g.restore(); g.save(); g.beginPath(); g.rect(front, 0, w, h); g.clip(); content(o); g.restore();
    const gr = g.createLinearGradient(front - 60, 0, front + 6, 0); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(1, 'rgba(255,240,200,0.85)'); g.fillStyle = gr; g.fillRect(front - 60, 4, 66, h - 8); }
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
}
// ---- the back TICKER band (80 units, 8192 px): invented tickers + the NVDA alert block; scrolls, halts on "five"
const TR_TICKS = [['QBIT', 1, '0.4%'], ['FLUX', 0, '1.2%'], ['OKRA', 1, '0.8%'], ['PLNK', 0, '0.3%'], ['VOLT', 1, '1.1%'], ['GRDN', 0, '0.6%'], ['ZEPH', 1, '0.2%'], ['MOTH', 0, '0.9%'], ['KITE', 1, '0.5%'], ['BRIX', 0, '1.4%'], ['LUMA', 1, '0.7%'], ['ORBS', 0, '0.2%']];
function trTickEntry(g, x, y, sz, [nm, up, pc]) { x = trText(g, nm, x, y, sz, '#ffcf5a'); x += sz * 0.25; trTri(g, x + sz * 0.3, y, sz * 0.28, !!up, up ? '#3ae06a' : '#ff3a2e'); x += sz * 0.7; x = trText(g, pc, x, y, sz, up ? '#5af08a' : '#ff5a4a'); return x + sz * 1.1; }
function trTexTickBack() { const T = tex((g, w, h) => { g.fillStyle = '#2a3a7c'; g.fillRect(0, 0, w, h); trLedDots(g, w, h, 9, 'rgba(140,165,235,0.28)');
  const sz = 150, y = h / 2 + 4; let x = 40, i = 0; g.shadowColor = 'rgba(255,190,80,0.6)'; g.shadowBlur = 12;
  while (x < w * 0.42) x = trTickEntry(g, x, y, sz, TR_TICKS[i++ % TR_TICKS.length]);
  // the NVDA alert block: red panel, white text
  const bw = 11 * 102.4, bx = x + 20; g.shadowBlur = 0; g.fillStyle = '#d81e28'; g.beginPath(); g.roundRect(bx, 16, bw, h - 32, 18); g.fill(); g.lineWidth = 8; g.strokeStyle = '#ffd0c0'; g.stroke();
  g.shadowColor = 'rgba(255,255,255,0.6)'; g.shadowBlur = 10; const cw = (bw - 60) / 16; trMono(g, 'MON · NVDA ▼ ~5%', bx + 30, y, cw, 170, '#ffffff', { arrow: '#ffffff' });
  TR.tickBU = (bx + bw / 2) / w; x = bx + bw + 60; g.shadowColor = 'rgba(255,190,80,0.6)'; g.shadowBlur = 12;
  while (x < w - 400) x = trTickEntry(g, x, y, sz, TR_TICKS[i++ % TR_TICKS.length]);
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8); }, 8192, 256); T.wrapS = THREE.RepeatWrapping; return T; }
function trTexTickSide() { const T = tex((g, w, h) => { g.fillStyle = '#2a3a7c'; g.fillRect(0, 0, w, h); trLedDots(g, w, h, 9, 'rgba(140,165,235,0.28)'); g.shadowColor = 'rgba(255,190,80,0.6)'; g.shadowBlur = 12;
  let x = 30, i = 3; while (x < w - 500) x = trTickEntry(g, x, h / 2 + 4, 150, TR_TICKS[i++ % TR_TICKS.length]); }, 4096, 256); T.wrapS = THREE.RepeatWrapping; return T; }
// scroll distance (units) of the back band relative to 37.24: 3 u/s, brakes to a halt on "five", holds, starts again
function trTickP(t) { const v = 3, a = 36.9, b = 37.24, c = 38.6, d = 39.1;
  if (t <= a) return v * (t - a) - v * (b - a) / 2; if (t < b) return -v * (b - t) ** 2 / (2 * (b - a)); if (t <= c) return 0; if (t < d) return v * (t - c) ** 2 / (2 * (d - c)); return v * (t - d) + v * (d - c) / 2; }

// ---- the wall TV (rev 4): the president as a toon caricature (kit head, piece-local swept blond hair, navy suit, long red
// tie) behind a podium with a generic seal, talking on his quote; the quote card (facts.md row 11) slides in on "FBI"
T3_HSTYLE.TRswoop = { mass: { top: 0.3, side: 0.08 }, cusp: 3, raise: 0.05,
  line: [[-1.3, 0.12], [-1.04, 0.02], [-0.92, -0.3], [-0.66, -0.6], [-0.3, -0.5], [0.1, -0.38], [0.5, -0.24], [0.84, -0.04], [1.02, 0.18], [1.3, 0.24]],
  part: [[-0.66, -1.1], [-0.66, -0.88], [-0.66, -0.62]], whorl: [-0.66, -1.0], streaks: 4, gloss: 'band',
  extra: [[-0.8, -0.7], [-0.62, -1.08], [-0.2, -1.3], [0.42, -1.26], [0.94, -0.96], [1.2, -0.5], [1.18, 0.02], [0.98, -0.24], [0.6, -0.5], [0.0, -0.6], [-0.52, -0.6]] };
const TR_PRES = { key: 'TRpres', hair: 'TRswoop', hairColor: '#f2c84a', skin: '#f5c08e', outfit: 'suit', colors: { main: '#1c2650', shirt: '#fbfaf6', tie: '#d8202a' }, body: 'fat', res: 1.5 };
const TR_PTALK = [38.14, 40.08], TR_PGEST = [39.0, 40.12];   // mouth moves on "the president says the FBI is looking into it"; one hand gesture
function trDrawPres(g, w, h, t) {
  const p = TR.pres ||= c3ToonChar(Object.assign({}, TR_PRES)), k = p.k, px = w / 2;
  const talking = t > TR_PTALK[0] && t < TR_PTALK[1], s0 = talking ? t3Syl(t3Seed('TRpres'), t) : 0, syl = s0 ? Math.min(4, s0 + 1) : 0;   // one size up: reads at phone size
  const ge = EZ.io(trE(TR_PGEST[0], TR_PGEST[0] + 0.24, t)) * (1 - EZ.io(trE(TR_PGEST[1], TR_PGEST[1] + 0.26, t)));   // gesture in / out
  const beat = talking ? 0.5 + 0.5 * Math.sin((t - TR_PTALK[0]) * 11) : 0, nod = syl >= 2 ? 4 : 0;
  const st = { t, expr: t < TR_PTALK[0] ? 'smug' : 'determined', browUp: 0, nod: 0, nodSide: 1, lid: 0, gaze: [0.1, 0], light: -2.2, env: '#9ab8f0', talk: syl, talkOn: talking, talkAmp: talking ? 0.8 : 0, fx: null };
  const f = { f: 0, m: 0.3, dir: -1, back: false };
  const hy = 178 + nod + 3 * ge * beat, sc = 0.86, tilt = -0.04 * ge + 0.02 * Math.sin(t * 2.1);
  // torso (kit torso canvas, suit) + a long tie down to the podium
  const tw = 190, Th = 300, T = t3TorsoCanvas(p, st, f, tw, Th), ty = 262, lip = h * 0.6 - 18;
  g.save(); g.beginPath(); g.rect(0, 0, w, lip + 8); g.clip(); g.translate(px, ty); g.rotate(tilt * 0.4); g.drawImage(T.c, -T.bw / 2 * sc, -20 * sc, T.bw * sc, T.bh * sc);
  const tie = [[-12, 24], [12, 24], [18, 70], [0, 84], [-18, 70]]; t3Path(g, tie); g.fillStyle = '#d8202a'; g.fill(); g.lineWidth = 3.5; g.strokeStyle = T3.ink; g.stroke();
  g.restore();
  // head (kit head canvas, redrawn each frame: mouth on syllables), small nods + a tilt into the gesture
  const hc = t3HeadCanvas(p, st, f); g.save(); g.translate(px, hy); g.rotate(tilt);
  g.drawImage(hc, -T3_HEADBOX.cx * sc, -T3_HEADBOX.cy * sc, T3_HEADBOX.w * sc, T3_HEADBOX.h * sc); g.restore();
  return { ge, beat, k };
}
// his arms: sleeves from the shoulders, dot hands; the left (screen right) one rises into a small "pinched fingers" gesture
function trDrawPresArms(g, w, h, a) {
  const px = w / 2, lip = h * 0.6 - 18;
  const arm = (S, E, H, r) => { t3Stroke(g, [S, E, H], 44, T3.ink); t3Stroke(g, [S, E, H], 36, '#1c2650');
    const ux = H[0] - E[0], uy = H[1] - E[1], L = Math.hypot(ux, uy) || 1, C = [H[0] - ux / L * 14, H[1] - uy / L * 14]; t3Stroke(g, [C, [H[0] - ux / L * 4, H[1] - uy / L * 4]], 30, '#fbfaf6');
    g.fillStyle = T3.limb; g.beginPath(); g.arc(H[0], H[1], r, 0, TAU); g.fill(); };
  arm([px - 158, 306], [px - 160, lip - 2], [px - 122, lip + 4], 21);   // resting on the podium
  const H0 = [px + 122, lip + 4], H1 = [px + 178, 246 - 10 * a.beat], u = a.ge, H = [lerp(H0[0], H1[0], u), lerp(H0[1], H1[1], u)];
  const E = [lerp(px + 160, px + 236, u), lerp(lip - 2, 334, u)];   // raised: elbow out to the side, below the shoulder
  arm([px + 158, 306], E, H, 22);
}
function trDrawTV(g, w, h, q, t) {
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#4a7ad8'); bg.addColorStop(1, '#6a9cf0'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const x = i * w / 13; const gr = g.createLinearGradient(x - 40, 0, x + 40, 0); gr.addColorStop(0, 'rgba(10,20,70,0.0)'); gr.addColorStop(0.5, 'rgba(10,20,70,0.22)'); gr.addColorStop(1, 'rgba(10,20,70,0.0)'); g.fillStyle = gr; g.fillRect(x - 40, 0, 80, h); }   // curtain folds
  g.fillStyle = '#c8a040'; g.fillRect(0, h * 0.06, w, 6);
  for (const sx of [0.12, 0.88]) { g.fillStyle = '#d8b050'; g.fillRect(w * sx - 4, h * 0.12, 8, h * 0.62); g.fillStyle = '#e8c868'; g.beginPath(); g.arc(w * sx, h * 0.12, 12, 0, TAU); g.fill(); }   // brass poles (no flags)
  const a = trDrawPres(g, w, h, t);
  const px = w / 2, py = h * 0.6;
  g.fillStyle = '#6a3a22'; g.beginPath(); g.moveTo(px - 150, py); g.lineTo(px + 150, py); g.lineTo(px + 128, h * 0.98); g.lineTo(px - 128, h * 0.98); g.closePath(); g.fill();
  g.fillStyle = '#8a4e2c'; g.fillRect(px - 162, py - 18, 324, 26); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(px - 128, h * 0.9, 256, 10);
  for (const dx of [-1, 1]) { g.strokeStyle = '#2a2a30'; g.lineWidth = 6; g.beginPath(); g.moveTo(px + dx * 30, py - 18); g.quadraticCurveTo(px + dx * 44, py - 36, px + dx * 34, py - 46); g.stroke(); g.fillStyle = '#1e1e24'; g.beginPath(); g.ellipse(px + dx * 32, py - 50, 8, 10, 0, 0, TAU); g.fill(); }   // two gooseneck mics
  trDrawPresArms(g, w, h, a);
  const sy = py + 50; g.fillStyle = '#e8c868'; g.beginPath(); g.arc(px, sy, 58, 0, TAU); g.fill(); g.fillStyle = '#1a2a6a'; g.beginPath(); g.arc(px, sy, 48, 0, TAU); g.fill();   // the generic seal: a star in rings
  g.strokeStyle = '#e8c868'; g.lineWidth = 3; g.beginPath(); g.arc(px, sy, 39, 0, TAU); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 12 : 30; g.lineTo(px + Math.cos(an) * r, sy + Math.sin(an) * r); } g.closePath(); g.fill();
  g.fillStyle = '#e8242a'; g.beginPath(); g.roundRect(28, 26, 118, 50, 8); g.fill(); inked(g, 'LIVE', 87, 52, 32, '#ffffff', { stroke: false });
  if (q > 0) { const cw = w * 0.92, x0 = lerp(-w, w * 0.04, EZ.o3(q)), y0 = h * 0.775, ch = h * 0.2;   // lower third: the president's face stays clear
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x0 + 10, y0 + 8, cw, ch);
    g.fillStyle = '#fbf6ee'; g.fillRect(x0, y0, cw, ch); g.fillStyle = '#d8242a'; g.fillRect(x0, y0, 24, ch);
    g.fillStyle = '#1a2a6a'; g.fillRect(x0 + 24, y0 - 44, 300, 44); inked(g, 'THE PRESIDENT', x0 + 174, y0 - 21, 28, '#ffffff', { stroke: false, maxW: 280 });
    inked(g, '“I KNOW THE FBI IS LOOKING INTO IT”', x0 + 24 + (cw - 24) / 2, y0 + ch / 2 + 3, 62, '#1a1420', { stroke: false, maxW: cw - 70 }); }
}
// ---- the giant wall chart (x -15..15, y 1.5..17.5): title, grid, day labels, red area under the line (the line itself is 3D)
const TR_LINE = [[-13.4, 7.4], [-12.2, 8.6], [-11.2, 8.1], [-10.0, 10.2], [-9.0, 9.8], [-7.6, 12.4], [-6.2, 11.4], [-5.0, 11.9], [-3.4, 9.2], [-2.2, 9.8], [-0.4, 7.0], [0.9, 7.6], [3.0, 5.4], [4.2, 5.9], [6.6, 4.4], [9.0, 4.0], [11.2, 3.6], [13.0, 3.45]];
const TR_LIP = [[14.6, 3.55, 2.4], [15.8, 4.05, 3.1], [16.7, 4.9, 3.5]];
const TR_PEAK = 5;
function trTexChart() { return tex((g, w, h) => { const X = (x) => (x + 15) / 30 * w, Y = (y) => (17.5 - y) / 16 * h;
  g.fillStyle = '#f4ead2'; g.fillRect(0, 0, w, h);
  const bg = g.createLinearGradient(0, Y(15.5), 0, Y(2.5)); bg.addColorStop(0, '#3c68cc'); bg.addColorStop(1, '#2c50b4'); g.fillStyle = bg; g.fillRect(X(-14.2), Y(15.6), X(14.2) - X(-14.2), Y(2.2) - Y(15.6));
  g.strokeStyle = 'rgba(190,215,255,0.2)'; g.lineWidth = 3; for (let x = -13; x <= 13; x += 2) { g.beginPath(); g.moveTo(X(x), Y(15.6)); g.lineTo(X(x), Y(2.2)); g.stroke(); } for (let y = 3; y <= 15; y += 1.5) { g.beginPath(); g.moveTo(X(-14.2), Y(y)); g.lineTo(X(14.2), Y(y)); g.stroke(); }
  // area under the line + a soft shadow of the 3D bar
  g.beginPath(); g.moveTo(X(TR_LINE[0][0]), Y(2.2)); for (const [x, y] of TR_LINE) g.lineTo(X(x), Y(y)); g.lineTo(X(14.2), Y(3.4)); g.lineTo(X(14.2), Y(2.2)); g.closePath();
  const ar = g.createLinearGradient(0, Y(12.5), 0, Y(2.2)); ar.addColorStop(0, 'rgba(255,96,80,0.5)'); ar.addColorStop(1, 'rgba(255,96,80,0.06)'); g.fillStyle = ar; g.fill();
  g.save(); g.filter = 'blur(10px)'; g.strokeStyle = 'rgba(10,0,20,0.55)'; g.lineWidth = 40; g.lineJoin = 'round'; g.beginPath(); TR_LINE.forEach(([x, y], i) => (i ? g.lineTo(X(x) + 14, Y(y) + 26) : g.moveTo(X(x) + 14, Y(y) + 26))); g.stroke(); g.restore();
  // header + axis labels (no prices on screen)
  g.fillStyle = '#2446a8'; g.fillRect(0, 0, w, Y(15.8)); inked(g, 'NVDA', X(-11.2), Y(16.65), h * 0.075, '#ffffff', { stroke: false });
  g.fillStyle = '#d81e28'; g.beginPath(); g.roundRect(X(-7.6), Y(17.15), X(-2.4) - X(-7.6), Y(16.15) - Y(17.15), 10); g.fill(); trMono(g, '▼ THIS WEEK', X(-7.4), Y(16.65), (X(-2.6) - X(-7.4)) / 11, h * 0.05, '#ffffff', { arrow: '#ffffff' });
  g.fillStyle = '#e8242a'; g.beginPath(); g.roundRect(X(10.4), Y(17.15), X(13.6) - X(10.4), Y(16.15) - Y(17.15), 10); g.fill(); inked(g, 'LIVE', X(12), Y(16.65), h * 0.05, '#ffffff', { stroke: false });
  [['MON', -7.0], ['TUE', -1.6], ['WED', 3.6], ['THU', 9.4]].forEach(([d, x]) => inked(g, d, X(x), Y(1.95), h * 0.032, '#1a2a6a', { stroke: false }));
  g.strokeStyle = '#1a2a6a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, 2048, 1092); }
// ---- screens: a 4 x 4 atlas, 8 normal market screens (red/green) + 8 crash screens
function trTexScreens() { const cw = 512, ch = 342; return tex((g, w, h) => { const R = RNG('trscr');
  for (let k = 0; k < 16; k++) { const x0 = (k % 4) * cw, y0 = Math.floor(k / 4) * ch, crash = k >= 8, kind = k % 8; g.save(); g.translate(x0, y0); g.beginPath(); g.rect(0, 0, cw, ch); g.clip();
    const bg = g.createLinearGradient(0, 0, 0, ch); bg.addColorStop(0, crash ? '#3a0c1c' : '#10224a'); bg.addColorStop(1, crash ? '#1c0612' : '#0a1430'); g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
    g.fillStyle = crash ? '#8a1a2a' : '#1e4a8e'; g.fillRect(0, 0, cw, 34); for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(14 + i * 72, 13, 48, 9); }
    g.strokeStyle = crash ? 'rgba(255,110,110,0.14)' : 'rgba(120,170,255,0.15)'; g.lineWidth = 2; for (let x = 0; x < cw; x += 48) { g.beginPath(); g.moveTo(x, 34); g.lineTo(x, ch); g.stroke(); } for (let y = 34; y < ch; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); }
    const G = '#3ae878', Rd = '#ff4a3e';
    if (kind === 0 || kind === 4) { const down = crash || kind === 4, P = []; let y = down ? 90 : 280; for (let x = 10; x <= cw - 10; x += 20) { y += (down ? 1 : -1) * R.r(-6, 16) * (crash ? 1.6 : 1); y = Math.max(50, Math.min(ch - 16, y)); P.push([x, y]); }
      g.beginPath(); g.moveTo(P[0][0], ch); P.forEach(([x, yy]) => g.lineTo(x, yy)); g.lineTo(P.at(-1)[0], ch); g.closePath(); g.fillStyle = down ? 'rgba(255,74,62,0.3)' : 'rgba(58,232,120,0.28)'; g.fill();
      g.beginPath(); P.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy))); g.strokeStyle = down ? Rd : G; g.lineWidth = 7; g.lineJoin = 'round'; g.stroke(); }
    else if (kind === 1 || kind === 5) { let y = crash ? 90 : 200; for (let x = 20; x < cw - 10; x += 28) { const up = crash ? R.f() < 0.15 : R.f() < 0.55, d = R.r(14, 46) * (crash ? 1.3 : 1); const y1 = up ? y - d : y + d; g.fillStyle = up ? G : Rd; g.fillRect(x - 1.5, Math.min(y, y1) - 14, 3, Math.abs(y1 - y) + 28); g.fillRect(x - 9, Math.min(y, y1), 18, Math.max(4, Math.abs(y1 - y))); y = Math.max(60, Math.min(ch - 30, y1)); } }
    else if (kind === 2) { for (let r = 0; r < 7; r++) { const yy = 58 + r * 40, up = crash ? false : R.f() < 0.5; g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(20, yy - 8, R.r(70, 110), 14); g.fillStyle = up ? G : Rd; g.fillRect(cw - 190, yy - 8, R.r(60, 90), 14); trTri(g, cw - 60, yy, 12, up, up ? G : Rd); } }
    else if (kind === 3) { for (let j = 0; j < 5; j++) for (let i = 0; i < 8; i++) { const v = crash ? -R.r(0.4, 1) : R.r(-1, 1); g.fillStyle = v > 0 ? `rgba(58,232,120,${0.35 + 0.6 * v})` : `rgba(255,74,62,${0.35 - 0.6 * v})`; g.fillRect(8 + i * 62, 44 + j * 58, 58, 54); } }
    else if (kind === 6) { for (let r = 0; r < 12; r++) { const yy = 50 + r * 24; g.fillStyle = crash ? Rd : G; g.fillRect(cw / 2 - 8 - R.r(30, 200) * (crash ? 0.3 : 1), yy, 1, 16); g.fillRect(cw / 2 - 8 - R.r(30, 200) * (crash ? 0.3 : 1), yy, R.r(30, 200) * (crash ? 0.3 : 1), 16); g.fillStyle = Rd; g.fillRect(cw / 2 + 8, yy, R.r(30, 220) * (crash ? 1.2 : 1), 16); } }
    else { trTri(g, cw / 2, ch / 2 + 20, 100, !crash, crash ? Rd : G); g.fillStyle = crash ? Rd : G; g.fillRect(cw / 2 - 150, ch - 60, 300, 20); }
    g.restore(); } }, 2048, 1368); }
// ---- the "+1" counter (between the chart and the windows)
function trDrawCounter(g, w, h, k) { g.fillStyle = '#0a0c1a'; g.fillRect(0, 0, w, h); trLedDots(g, w, h, 8, 'rgba(90,110,180,0.22)');
  g.fillStyle = '#1a2a6a'; g.fillRect(0, 0, w, h * 0.2); inked(g, 'REPORTS', w / 2, h * 0.1, h * 0.09, '#ffd27a', { stroke: false, maxW: w * 0.86 });
  g.save(); g.translate(w / 2, h * 0.6); const fl = k > 0 && k < 1 ? Math.abs(Math.cos(k * Math.PI)) : 1; g.scale(1, Math.max(0.05, fl));
  if (k < 0.5) { g.shadowBlur = 0; inked(g, '- -', 0, 0, h * 0.4, '#3a4468', { stroke: false }); }
  else { g.shadowColor = 'rgba(80,255,140,0.9)'; g.shadowBlur = 24; inked(g, '+1', 0, 0, h * 0.48, '#6aff9a', { stroke: false, maxW: w * 0.9 }); }
  g.restore(); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, h * 0.6 - 2, w, 4);
  if (k >= 1 && k < 1.6) { g.globalAlpha = 0.35 * (1.6 - k) / 0.6; g.fillStyle = '#c8ffd8'; g.fillRect(0, h * 0.2, w, h * 0.8); g.globalAlpha = 1; } }
// ---- the org chart card (TRlena holds it): CEO on top, EXEC highlighted, a red arrow drawn up to CEO
function trDrawOrg(g, w, h, a) { g.fillStyle = '#e6dcc8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a5ac8'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
  inked(g, 'ORG CHART', w / 2, h * 0.1, h * 0.065, '#2a5ac8', { stroke: false });
  const box = (x, y, bw, bh, txt, fill, col, sz) => { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - bw / 2 + 6, y - bh / 2 + 7, bw, bh); g.fillStyle = fill; g.fillRect(x - bw / 2, y - bh / 2, bw, bh); g.lineWidth = 6; g.strokeStyle = '#1a1a2a'; g.strokeRect(x - bw / 2, y - bh / 2, bw, bh); inked(g, txt, x, y + 2, sz, col, { stroke: false, maxW: bw * 0.86 }); };
  g.strokeStyle = '#1a1a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h * 0.36); g.lineTo(w / 2, h * 0.5); g.moveTo(w * 0.2, h * 0.5); g.lineTo(w * 0.8, h * 0.5); for (const x of [0.2, 0.5, 0.8]) { g.moveTo(w * x, h * 0.5); g.lineTo(w * x, h * 0.6); } g.stroke();
  for (const x of [0.2, 0.8]) { g.beginPath(); g.moveTo(w * x, h * 0.74); g.lineTo(w * x, h * 0.82); g.stroke(); box(w * x, h * 0.88, w * 0.18, h * 0.1, '', '#dfe6f2', '#1a1a2a', 1); }
  box(w / 2, h * 0.27, w * 0.3, h * 0.17, 'CEO', '#ffd23a', '#1a1a2a', h * 0.1);
  box(w * 0.2, h * 0.67, w * 0.22, h * 0.13, 'VP', '#dfe6f2', '#1a1a2a', h * 0.07); box(w * 0.8, h * 0.67, w * 0.22, h * 0.13, 'VP', '#dfe6f2', '#1a1a2a', h * 0.07);
  box(w / 2, h * 0.67, w * 0.24, h * 0.13, 'EXEC', a > 0 ? '#ffd0c8' : '#dfe6f2', '#1a1a2a', h * 0.07);
  if (a > 0) { g.lineWidth = 10; g.strokeStyle = '#e8242a'; g.strokeRect(w * 0.38, h * 0.605, w * 0.24, h * 0.13);
    const x0 = w * 0.66, y0 = h * 0.64, x1 = w * 0.62, y1 = h * 0.3, k = EZ.o2(Math.min(1, a)), cx = w * 0.78, cy = h * 0.45; const P = []; for (let i = 0; i <= 24; i++) { const u = i / 24 * k; P.push([(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1]); }
    g.lineCap = 'round'; g.lineWidth = 14; g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    if (k > 0.97) { const [ex, ey] = P.at(-1), [px, py] = P.at(-3), an = Math.atan2(ey - py, ex - px); g.fillStyle = '#e8242a'; g.beginPath(); g.moveTo(ex + Math.cos(an) * 26, ey + Math.sin(an) * 26); g.lineTo(ex + Math.cos(an + 2.4) * 34, ey + Math.sin(an + 2.4) * 34); g.lineTo(ex + Math.cos(an - 2.4) * 34, ey + Math.sin(an - 2.4) * 34); g.closePath(); g.fill(); } } }
// ---- the city through the windows
function trTexCity() { return tex((g, w, h) => { const R = RNG('trcity');
  const sky = g.createLinearGradient(0, 0, 0, h * 0.75); sky.addColorStop(0, '#2f6ad8'); sky.addColorStop(0.55, '#7ab4ee'); sky.addColorStop(1, '#ffcf9a'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) { const cx = R.r(0, w), cy = R.r(h * 0.06, h * 0.3), r = R.r(30, 70); g.fillStyle = 'rgba(255,246,236,0.92)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx + (k - 2) * r * 0.55, cy + Math.abs(k - 2) * r * 0.12, r * (0.6 + 0.12 * (2 - Math.abs(k - 2))), 0, TAU); g.fill(); } g.fillStyle = 'rgba(150,150,220,0.4)'; g.fillRect(cx - r * 1.6, cy + r * 0.25, r * 3.2, r * 0.25); }
  const tower = (x, bw, top, c, lit) => { g.fillStyle = c; g.fillRect(x, top, bw, h - top); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x, top, bw * 0.18, h - top);
    for (let y = top + 10; y < h - 8; y += 18) for (let xx = x + 6; xx < x + bw - 8; xx += 14) { g.fillStyle = R.f() < lit ? '#ffe2a0' : 'rgba(20,30,70,0.45)'; g.fillRect(xx, y, 8, 10); } };
  for (let i = 0; i < 16; i++) tower(i * w / 15 + R.r(-20, 10), R.r(50, 90), h * R.r(0.42, 0.6), ['#8a86c8', '#9a8ed0', '#7c90cc'][i % 3], 0.1);
  for (let i = 0; i < 11; i++) { const bw = R.r(70, 130), x = i * w / 10 + R.r(-30, 20), top = h * R.r(0.2, 0.5); tower(x, bw, top, ['#e8a070', '#d87a6a', '#f2c070', '#c8789a', '#5a8ad8'][i % 5], 0.25);
    if (i % 3 === 0) { g.fillStyle = '#d8d8e0'; g.fillRect(x + bw / 2 - 2, top - 40, 4, 40); g.fillStyle = '#ff5a4a'; g.beginPath(); g.arc(x + bw / 2, top - 42, 5, 0, TAU); g.fill(); } } }, 1024, 640); }
function trTexWire() { const t = tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#ffffff'; g.lineWidth = 7; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); } }, 256, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function trTexTag() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const P = [[w * 0.16, h * 0.04], [w * 0.97, h * 0.04], [w * 0.97, h * 0.96], [w * 0.16, h * 0.96], [w * 0.02, h * 0.5]];
  t3Path(g, P); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 14; g.strokeStyle = '#d8242a'; g.stroke(); g.fillStyle = '#7a4a14'; g.beginPath(); g.arc(w * 0.12, h * 0.5, 14, 0, TAU); g.fill();
  inked(g, 'CHIPS +', w * 0.57, h * 0.32, h * 0.25, '#1a1420', { stroke: false, maxW: w * 0.74 }); inked(g, 'JENSEN', w * 0.57, h * 0.7, h * 0.3, '#d8242a', { stroke: false, maxW: w * 0.74 }); }, 512, 320); }
function trTexChipBox() { return tex((g, w, h) => { g.fillStyle = '#c8955a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,50,20,0.4)'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = 'rgba(120,70,30,0.25)'; g.fillRect(0, h * 0.46, w, 16);
  inked(g, 'CHIPS', w / 2, h * 0.3, h * 0.22, '#1a1420', { stroke: false }); for (let i = 0; i < 3; i++) { const x = w * (0.25 + i * 0.25), y = h * 0.72; g.fillStyle = '#1e7a4a'; g.fillRect(x - 36, y - 36, 72, 72); g.fillStyle = '#2a2a30'; g.fillRect(x - 20, y - 20, 40, 40); g.fillStyle = '#e8c048'; for (let k = 0; k < 5; k++) { g.fillRect(x - 30 + k * 14, y - 44, 6, 10); g.fillRect(x - 30 + k * 14, y + 34, 6, 10); } } }, 256, 256); }
function trTexChip() { return tex((g, w, h) => { g.fillStyle = '#1e8a50'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a34'; g.fillRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5); g.fillStyle = '#e8c048'; for (let k = 0; k < 6; k++) { g.fillRect(w * (0.15 + k * 0.14), h * 0.05, w * 0.06, h * 0.12); g.fillRect(w * (0.15 + k * 0.14), h * 0.83, w * 0.06, h * 0.12); }
  g.strokeStyle = 'rgba(232,192,72,0.6)'; g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(w * 0.05, h * (0.3 + k * 0.13)); g.lineTo(w * 0.22, h * (0.3 + k * 0.13)); g.stroke(); } }, 128, 128); }
function trTexWall(top = '#52b0f6', low = '#3480dc') { const t = tex((g, w, h) => { const R = RNG('trwall'), dado = h * (1 - 4.4 / TR_H);
  g.fillStyle = top; g.fillRect(0, 0, w, dado); for (let x = 0; x < w; x += R.r(10, 30)) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,10,60,0.05)'; g.fillRect(x, 0, R.r(8, 24), dado); }
  for (let k = 0; k < 220; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,10,50,0.06)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, w), R.r(0, dado), R.r(1, 3), R.r(1, 3)); }
  g.fillStyle = low; g.fillRect(0, dado, w, h - dado); for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, dado + 8, 3, h - dado - 22); }
  g.fillStyle = '#f0a83a'; g.fillRect(0, dado - 8, w, 8); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, dado, w, 3); g.fillStyle = '#141e48'; g.fillRect(0, h - 12, w, 12); }, 512, 1024); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// a wall piece whose UVs follow world coordinates (u = along / 12, v = y / TR_H) so the dado lines up on every piece
function trWall(a0, a1, y0, y1, axis, at, mat) { const g = new THREE.PlaneGeometry(a1 - a0, y1 - y0), uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + (a0 + a1) / 2) / 12, (p.getY(i) + (y0 + y1) / 2) / TR_H);
  const m = new THREE.Mesh(g, mat); m.userData.noCast = true;
  if (axis === 'z') { m.position.set((a0 + a1) / 2, (y0 + y1) / 2, at); if (at > 1) m.rotation.y = Math.PI; }
  else { m.position.set(at, (y0 + y1) / 2, (a0 + a1) / 2); m.rotation.y = at < 0 ? Math.PI / 2 : -Math.PI / 2; }
  return m; }
function trTexCarpet() { const t = tex((g, w, h) => { const R = RNG('trcarpet'); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.fillStyle = (i + j) % 2 ? '#8c3c20' : '#9e4a26'; g.fillRect(i * w / 4, j * h / 4, w / 4, h / 4);
    g.strokeStyle = 'rgba(80,30,10,0.18)'; g.lineWidth = 2; for (let k = 0; k < 8; k++) { const o = k * w / 32; g.beginPath(); if ((i + j) % 2) { g.moveTo(i * w / 4 + o, j * h / 4); g.lineTo(i * w / 4 + o, (j + 1) * h / 4); } else { g.moveTo(i * w / 4, j * h / 4 + o); g.lineTo((i + 1) * w / 4, j * h / 4 + o); } g.stroke(); } }
  for (let k = 0; k < 1400; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(60,20,8,0.12)' : 'rgba(255,200,150,0.08)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  g.strokeStyle = 'rgba(60,20,8,0.3)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 8); return t; }
function trTexPoster(k) { return tex((g, w, h) => { g.fillStyle = '#fff4dc'; g.fillRect(0, 0, w, h);
  if (k === 0) { g.fillStyle = '#e8402a'; g.fillRect(0, 0, w, h * 0.3); inked(g, "DON'T", w / 2, h * 0.15, h * 0.13, '#ffffff', { stroke: false, maxW: w * 0.86 }); inked(g, 'PANIC', w / 2, h * 0.45, h * 0.17, '#1a1420', { stroke: false, maxW: w * 0.86 });
    trTri(g, w / 2, h * 0.7, w * 0.16, true, '#2aa05a'); inked(g, 'buy low · sell high', w / 2, h * 0.9, h * 0.05, '#1a1420', { stroke: false, maxW: w * 0.84 }); }
  else if (k === 1) { g.fillStyle = '#2a5ac8'; g.fillRect(0, 0, w, h * 0.24); inked(g, 'TEAM GOALS', w / 2, h * 0.12, h * 0.09, '#ffffff', { stroke: false, maxW: w * 0.86 }); for (let i = 0; i < 5; i++) { g.fillStyle = ['#3ac86a', '#f2c23a', '#e8402a', '#3ac86a', '#2a8ad8'][i]; g.fillRect(w * (0.14 + i * 0.15), h * (0.85 - 0.1 * (i + 1)), w * 0.1, h * 0.1 * (i + 1)); } }
  else { g.fillStyle = '#1e2a5a'; g.fillRect(0, 0, w, h); inked(g, 'QUIET', w / 2, h * 0.35, h * 0.16, '#ffd23a', { stroke: false, maxW: w * 0.86 }); inked(g, 'TRADING', w / 2, h * 0.55, h * 0.12, '#ffffff', { stroke: false, maxW: w * 0.86 }); inked(g, 'in progress', w / 2, h * 0.75, h * 0.06, '#c8d8ff', { stroke: false, maxW: w * 0.86 }); }
  g.lineWidth = 10; g.strokeStyle = '#1a1420'; g.strokeRect(0, 0, w, h); }, 400, 520); }
function trTexSign(txt, sub, bg = '#1a2a6a', fg = '#ffffff') { return tex((g, w, h) => { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, 24); g.fill(); g.lineWidth = 10; g.strokeStyle = '#f0a83a'; g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 18); g.stroke();
  inked(g, txt, w / 2, sub ? h * 0.42 : h * 0.52, h * (sub ? 0.36 : 0.46), fg, { stroke: false, maxW: w * 0.86 }); if (sub) inked(g, sub, w / 2, h * 0.76, h * 0.16, '#ffd27a', { stroke: false, maxW: w * 0.86 }); }, 1024, 256); }
function trTexClockLbl(nm) { return tex((g, w, h) => { g.fillStyle = '#141e48'; g.fillRect(0, 0, w, h); inked(g, nm, w / 2, h / 2 + 2, h * 0.5, '#ffd27a', { stroke: false, maxW: w * 0.9 }); }, 256, 64); }
function trTexHeat() { return tex((g, w, h) => { const R = RNG('trheat'); g.fillStyle = '#0a1028'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e4a8e'; g.fillRect(0, 0, w, h * 0.12); inked(g, 'SECTORS', w / 2, h * 0.06, h * 0.07, '#ffffff', { stroke: false });
  let x = 8; while (x < w - 8) { const cw = R.r(40, 120); let y = h * 0.14; while (y < h - 8) { const ch = R.r(30, 90), v = R.r(-1, 0.4); g.fillStyle = v > 0 ? `rgba(58,232,120,${0.4 + v})` : `rgba(255,74,62,${0.4 - 0.5 * v})`; g.fillRect(x, y, Math.min(cw, w - 8 - x) - 4, Math.min(ch, h - 8 - y) - 4); y += ch; } x += cw; } }, 512, 384); }
function trTexGlass(broken) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(150,200,240,0.16)'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.13)'; g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.5, 0); g.lineTo(w * 0.62, 0); g.lineTo(w * 0.22, h); g.fill(); g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.moveTo(w * 0.66, h); g.lineTo(w * 0.9, 0); g.lineTo(w * 0.94, 0); g.lineTo(w * 0.7, h); g.fill();
  if (broken) {   // a person-shaped hole (cartoon), jagged, with cracks round it
    const R = RNG('trhole'), cx = w * 0.5, cy = h * 0.42, P = []; const sil = (a) => { const s = Math.sin(a), c = Math.cos(a); const head = s < -0.55 ? 0.62 : 1; return [c * w * (s < -0.55 ? 0.16 : 0.27 + 0.06 * Math.abs(s)), s * h * (s < 0 ? 0.3 : 0.36) * head - (s < -0.55 ? h * 0.06 : 0)]; };
    for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, [dx, dy] = sil(a), j = 1 + R.r(-0.12, 0.12) * (i % 2 ? 1 : 0.4); P.push([cx + dx * j, cy + dy * j]); }
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 3; for (let i = 0; i < 18; i++) { const [x, y] = P[(i * 7) % P.length], a = Math.atan2(y - cy, x - cx) + R.n(0.3); g.beginPath(); g.moveTo(x, y); let px = x, py = y; for (let k = 0; k < 3; k++) { px += Math.cos(a + R.n(0.4)) * R.r(20, 60); py += Math.sin(a + R.n(0.4)) * R.r(20, 60); g.lineTo(px, py); } g.stroke(); }
    g.globalCompositeOperation = 'destination-out'; t3Path(g, P); g.fill(); g.globalCompositeOperation = 'source-over'; t3Path(g, P); g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke(); } }, 256, 512); }

// ---- merged geometry: [{ g, x, y, z, rx, ry, rz, s:[sx,sy,sz], c }] -> one vertex-coloured BufferGeometry
function trMerge(parts) { const P = [], N = [], U = [], C = [], col = new THREE.Color(), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), one = V3(1, 1, 1);
  for (const q of parts) { const g = q.g.index ? q.g.toNonIndexed() : q.g.clone(); E.set(q.rx || 0, q.ry || 0, q.rz || 0); Q.setFromEuler(E); M.compose(V3(q.x || 0, q.y || 0, q.z || 0), Q, q.s ? V3(...q.s) : one); g.applyMatrix4(M);
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv; col.set(q.c || '#ffffff');
    for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); U.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); C.push(col.r, col.g, col.b); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  geo.computeBoundingBox(); geo.computeBoundingSphere(); return geo; }
const trVC = (o = {}) => { const m = c3Prop('#ffffff', Object.assign({ rough: 0.5 }, o)); m.vertexColors = true; return m; };
// the ride bar: a rectangular tube along [[x, y, zc], ...] (thickness th up/down in the xy plane, depth D in z), faces coloured
function trRibbon(L, th, D, cTop, cSide) { const P = [], C = [], ct = new THREE.Color(cTop), cs = new THREE.Color(cSide), cb = new THREE.Color(cSide).multiplyScalar(0.7), n = L.length;
  const N = L.map((p, i) => { const a = L[Math.max(0, i - 1)], b = L[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; let nx = -dy / l, ny = dx / l;
    let k = 1; if (i > 0 && i < n - 1) { const d1 = [p[0] - a[0], p[1] - a[1]], l1 = Math.hypot(...d1), m1 = [-d1[1] / l1, d1[0] / l1]; k = 1 / Math.max(0.55, nx * m1[0] + ny * m1[1]); } return [nx * k, ny * k]; });
  const V = L.map((p, i) => { const [nx, ny] = N[i], h = th / 2, zf = p[2] + D / 2, zb = p[2] - D / 2; return { tF: [p[0] + nx * h, p[1] + ny * h, zf], tB: [p[0] + nx * h, p[1] + ny * h, zb], bF: [p[0] - nx * h, p[1] - ny * h, zf], bB: [p[0] - nx * h, p[1] - ny * h, zb] }; });
  const tri = (a, b, c, col) => { P.push(...a, ...b, ...c); for (let k = 0; k < 3; k++) C.push(col.r, col.g, col.b); };
  for (let i = 0; i + 1 < n; i++) { const A = V[i], B = V[i + 1];
    tri(A.tB, A.tF, B.tF, ct); tri(A.tB, B.tF, B.tB, ct);   // top
    tri(A.bF, B.bF, B.tF, cs); tri(A.bF, B.tF, A.tF, cs);   // front
    tri(A.bF, A.bB, B.bB, cb); tri(A.bF, B.bB, B.bF, cb);   // bottom
    tri(A.bB, B.tB, B.bB, cs); tri(A.bB, A.tB, B.tB, cs); } // back
  { const A = V[0]; tri(A.tF, A.tB, A.bB, cs); tri(A.tF, A.bB, A.bF, cs); const B = V[n - 1]; tri(B.tF, B.bB, B.tB, cs); tri(B.tF, B.bF, B.bB, cs); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); geo.computeVertexNormals(); geo.computeBoundingBox(); geo.computeBoundingSphere();
  return { geo, V, N }; }
// the ride path: the top centre line of the bar from the peak to the lip, with arc length
function trRidePath(V, from) { const pts = []; for (let i = from; i < V.length; i++) { const a = V[i].tF, b = V[i].tB; pts.push([a[0], a[1], (a[2] + b[2]) / 2]); }
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
  const len = cum.at(-1); const at = (sq) => { sq = clamp(sq, 0, len); let i = 0; while (i + 2 < cum.length && cum[i + 1] < sq) i++; const u = (sq - cum[i]) / (cum[i + 1] - cum[i] || 1), a = pts[i], b = pts[i + 1], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d) || 1;
    return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), t: [d[0] / l, d[1] / l, d[2] / l] }; };
  return { pts, len, at }; }

// ---- small builders
function trPlant(seed, s = 1, pot = '#e0703a') { const g = new THREE.Group(), R = RNG('trplant', seed), lf = c3Prop('#2e9a44', { rough: 0.55, side: THREE.DoubleSide }), lf2 = c3Prop('#4ab84a', { rough: 0.55 });
  g.add(cyl(1.2 * s, 0.85 * s, 2.2 * s, c3Prop(pot, { rough: 0.6 }), 0, 1.1 * s, 0, 0, 16)); g.add(cyl(1.3 * s, 1.3 * s, 0.3 * s, c3Prop(t3Mul(pot, 0.85), { rough: 0.6 }), 0, 2.15 * s, 0, 0, 16)); g.add(cyl(1.1 * s, 1.1 * s, 0.1, c3Prop('#4a2a1a'), 0, 2.25 * s, 0, 0, 14));
  for (let k = 0; k < 11; k++) { const a = k * 2.4 + R.n(0.3), ht = (3.0 + R.r(0, 3.0)) * s, ang = 0.25 + R.r(0, 0.45), st = cyl(0.06 * s, 0.08 * s, ht, c3Prop('#3a7a2a'), 0, 0, 0, 0, 6);
    st.position.set(Math.sin(ang) * Math.cos(a) * ht / 2, 2.2 * s + Math.cos(ang) * ht / 2, Math.sin(ang) * Math.sin(a) * ht / 2); st.rotation.set(Math.sin(a) * ang, 0, -Math.cos(a) * ang); g.add(st);
    const L = new THREE.Mesh(new THREE.SphereGeometry(1.0 * s, 12, 8), k % 3 ? lf : lf2); L.scale.set(1.0, 0.14, 0.62); L.position.set(Math.sin(ang) * Math.cos(a) * ht, 2.2 * s + Math.cos(ang) * ht, Math.sin(ang) * Math.sin(a) * ht); L.rotation.set(0, -a, -0.5 - ang); g.add(L); }
  return g; }
function trPipe(a, b, r, mat) { const A = V3(...a), B = V3(...b), L = A.distanceTo(B), m = cyl(r, r, L, mat, 0, 0, 0, 0, 10); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), B.clone().sub(A).normalize()); return m; }
// the two skis (origin = centre between them, local x = along the skis, local y = up)
function trSkis() { const g = new THREE.Group(), body = c3Prop('#ffd21e', { rough: 0.3 }), red = c3Prop('#e8302a', { rough: 0.3 }), dark = c3Prop('#22232a', { rough: 0.5 });
  for (const sz of [-0.34, 0.34]) { g.add(rb(4.4, 0.14, 0.5, body, -0.2, 0, sz, 0)); const tip = rb(0.9, 0.14, 0.5, body, 2.38, 0.22, sz, 0); tip.rotation.z = 0.5; g.add(tip); g.add(rb(4.4, 0.03, 0.14, red, -0.2, 0.085, sz, 0)); g.add(rb(0.7, 0.3, 0.42, dark, 0.1, 0.2, sz, 0)); }
  return g; }
// a shopping cart: front = local +x, handle at local x -2.9 (y 5.6); g.userData.wheels spin with distance
function trCart(M) { const g = new THREE.Group(), wire = trTexWire(), chrome = c3Prop('#d8dce4', { metal: 0.7, rough: 0.25 }), red = c3Prop('#e0302a', { rough: 0.35 }), blk = c3Prop('#1e1e24', { rough: 0.6 });
  const wm = c3Prop('#dfe3ea', { map: wire, metal: 0.6, rough: 0.3, side: THREE.DoubleSide }); wm.alphaTest = 0.5;
  const panel = (w, h, x, y, z, ry, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.userData.noShade = true; m.userData.noCast = true; g.add(m); return m; };
  panel(4.4, 2.4, 0, 3.8, 1.4, 0); panel(4.4, 2.4, 0, 3.8, -1.4, 0); panel(2.8, 2.4, 2.2, 3.8, 0, Math.PI / 2); panel(2.8, 2.4, -2.2, 3.8, 0, Math.PI / 2); panel(4.4, 2.8, 0, 2.6, 0, 0, -Math.PI / 2); panel(4.0, 2.4, -0.1, 0.95, 0, 0, -Math.PI / 2);
  for (const y of [2.6, 5.0]) { for (const z of [-1.4, 1.4]) g.add(trPipe([-2.2, y, z], [2.2, y, z], 0.07, chrome)); for (const x of [-2.2, 2.2]) g.add(trPipe([x, y, -1.4], [x, y, 1.4], 0.07, chrome)); }
  for (const x of [-2.2, 2.2]) for (const z of [-1.4, 1.4]) g.add(trPipe([x, 2.6, z], [x, 5.0, z], 0.06, chrome));
  for (const z of [-1.4, 1.4]) { g.add(trPipe([-2.2, 5.0, z], [-2.9, 5.6, z], 0.08, chrome)); g.add(trPipe([-2.3, 2.6, z * 0.86], [-1.9, 0.7, z * 0.86], 0.09, chrome)); g.add(trPipe([-1.9, 0.7, z * 0.86], [1.9, 0.7, z * 0.7], 0.09, chrome)); g.add(trPipe([1.9, 0.7, z * 0.7], [2.0, 2.6, z * 0.9], 0.07, chrome)); }
  { const h = cyl(0.16, 0.16, 3.0, red, -2.9, 5.6, 0, 0, 12); h.rotation.x = Math.PI / 2; g.add(h); }
  g.userData.wheels = []; for (const [x, z] of [[-1.8, -1.2], [-1.8, 1.2], [1.8, -1.0], [1.8, 1.0]]) { g.add(rb(0.18, 0.5, 0.36, chrome, x, 0.62, z, 0)); const w = cyl(0.34, 0.34, 0.24, blk, x, 0.36, z, 0, 14); w.rotation.x = Math.PI / 2; g.add(w); g.userData.wheels.push(w); }
  return g; }
// a monitor bank part list for one seat side: 2 x 2 screens facing sd (+1 = +z)
function trSeatMonitors(B, Sc, sx, zc, sd) { for (const col of [-1, 1]) for (const tier of [0, 1]) { const x = sx + col * 1.1, y = 5.78 + tier * 1.56, z = zc + sd * 0.38;
  B.push({ g: TR.gBez ||= c3RBox(2.16, 1.5, 0.22, 0.07, 2), x, y, z, c: '#262932' }); Sc.push({ x, y, z: z + sd * 0.115, ry: sd > 0 ? 0 : Math.PI }); } }

function trBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 700), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#9cc0f4', ambI: 0.42, sky: '#c8dcff', ground: '#b86a40', key: '#fff0d8', keyI: 0.95, keyP: [-30, 50, 60], rim: '#ffc890', rimI: 0.32, rimP: [30, 30, -20] });
  const M = TR.M = { steel: c3Prop('#c8ccd2', { metal: 0.6, rough: 0.3 }), steelD: c3Prop('#8a929a', { metal: 0.5, rough: 0.4 }), dark: c3Prop('#22242c', { rough: 0.5 }), white: c3Prop('#eef0f2', { rough: 0.4 }),
    wood: c3Prop('#ffffff', { map: texWood(), rough: 0.5 }), navy: c3Prop('#1e2c66', { rough: 0.5 }), trim: c3Prop('#16245a', { rough: 0.5 }), cream: c3Prop('#f2e8d0', { rough: 0.6 }), gold: c3Prop('#f0a83a', { rough: 0.4 }),
    tube: c3Prop('#ffffff', { emissive: '#fff6e8', ei: 1.5, glow: '#fff6e0' }), vc: trVC(), frame: c3Prop('#e8e4dc', { rough: 0.4 }) };
  const F = new THREE.Group(); scene.add(F);   // FOCUS: everything held, ridden or pushed (people stand beside / behind it)
  const wallM = c3Prop('#ffffff', { map: trTexWall(), rough: 0.85 }), wallS = c3Prop('#ffffff', { map: trTexWall('#4a9ef0', '#2c68cc'), rough: 0.85 });   // back wall lighter (its LED bands / TV are dark), side walls a step deeper
  // ---- floor (carpet tiles), walls, ceiling
  scene.add(plNC(2 * TR_X, TR_Z, c3Prop('#ffffff', { map: trTexCarpet(), rough: 0.9 }), 0, 0, TR_Z / 2, 0, -Math.PI / 2));   // floors never cast (VSM acne stripes)
  scene.add(trWall(-TR_X, 20, 0, TR_H, 'z', 0, wallM)); scene.add(trWall(20, 39, 0, 1.5, 'z', 0, wallM)); scene.add(trWall(20, 39, 16, TR_H, 'z', 0, wallM)); scene.add(trWall(39, TR_X, 0, TR_H, 'z', 0, wallM));
  scene.add(trWall(0, TR_Z, 0, TR_H, 'x', -TR_X, wallS)); scene.add(trWall(0, 12.5, 0, TR_H, 'x', TR_X, wallS)); scene.add(trWall(19.5, TR_Z, 0, TR_H, 'x', TR_X, wallS)); scene.add(trWall(12.5, 19.5, 10.5, TR_H, 'x', TR_X, wallS));
  scene.add(trWall(-TR_X, TR_X, 0, TR_H, 'z', TR_Z, wallS));
  scene.add(plNC(2 * TR_X, TR_Z, c3Prop('#b4c0ec', { rough: 0.8, emissive: '#5a6cb0', ei: 0.7 }), 0, TR_H, TR_Z / 2, 0, Math.PI / 2));
  // ceiling: grid, long light boxes, pools of light
  { const KC = new THREE.Group(); scene.add(KC); const gm2 = c3Prop('#c8d0f0', { rough: 0.6 }); for (let x = -40; x <= 40; x += 8) KC.add(rbNC(0.2, 0.14, TR_Z, gm2, x, TR_H - 0.07, TR_Z / 2, 0)); for (let z = 0; z <= TR_Z; z += 8) KC.add(rbNC(2 * TR_X, 0.14, 0.2, gm2, 0, TR_H - 0.07, z, 0));
    for (const z of [10, 26, 42, 58]) for (const x of [-24, 0, 24]) { KC.add(rbNC(12, 0.4, 1.6, M.white, x, TR_H - 0.3, z, 0)); const tb = cyl(0.22, 0.22, 11.2, M.tube, x, TR_H - 0.55, z, 0, 8); tb.rotation.z = Math.PI / 2; tb.userData.noCast = true; KC.add(tb); }
    for (const [x, z] of [[-24, 26], [0, 26], [24, 26], [-24, 42], [0, 42], [24, 42], [0, 10], [24, 10]]) { const l = new THREE.SpotLight('#fff0d8', x > 20 ? 0.5 : 1.3, 46, 0.9, 1.0, 1.4); l.position.set(x, TR_H - 1, z); l.target.position.set(x, 0, z + 1); l.layers.enableAll(); scene.add(l); scene.add(l.target); } }
  // ---- trims: skirting, chair rail ledge, crown, pilasters on the side walls, cable trays, AC grilles
  { const sk = c3Prop('#141e48', { rough: 0.5 }), cr = c3Prop('#e8e2d2', { rough: 0.45 });
    scene.add(rbNC(2 * TR_X, 0.6, 0.3, sk, 0, 0.3, 0.15, 0)); scene.add(rbNC(2 * TR_X, 0.6, 0.6, cr, 0, TR_H - 0.3, 0.3, 0));
    for (const sx of [-1, 1]) { scene.add(rbNC(0.3, 0.6, TR_Z, sk, sx * (TR_X - 0.15), 0.3, TR_Z / 2, 0)); scene.add(rbNC(0.6, 0.6, TR_Z, cr, sx * (TR_X - 0.3), TR_H - 0.3, TR_Z / 2, 0)); scene.add(rbNC(0.36, 0.3, TR_Z, M.gold, sx * (TR_X - 0.18), 4.45, TR_Z / 2, 0));
      for (let z = 24; z < TR_Z; z += 10) scene.add(rbNC(0.5, 22.6, 1.2, c3Prop('#3a8ae6', { rough: 0.6 }), sx * (TR_X - 0.25), 11.3, z, 0)); }
    for (const [x0, x1] of [[-TR_X, -15.4], [19.6, 20], [39, TR_X]]) scene.add(rbNC(x1 - x0, 0.3, 0.36, M.gold, (x0 + x1) / 2, 4.45, 0.18, 0));
    for (const x of [-38, -20, 17.5]) scene.add(rbNC(1.2, 2.6, 0.5, c3Prop('#2450b8', { rough: 0.6 }), x, 1.3, 0.25, 0)); }
  // ---- back wall: the TV over a credenza
  { const [tx, ty] = [-29, 10.975]; scene.add(rb(12.6, 7.3, 0.5, c3Prop('#30323c', { rough: 0.35 }), tx, ty, 0.25, 0)); s.tvC = canvasTex(1024, 576); const tvm = c3Flat('#ffffff', { map: s.tvC.t }); tvm.userData.c3keep = true;
    s.tv = pl(12, 6.75, tvm, tx, ty, 0.52); scene.add(s.tv); scene.add(rb(2.4, 0.3, 0.6, M.dark, tx, 7.3, 0.4, 0));
    scene.add(pl(9, 2.25, c3Flat('#ffffff', { map: trTexSign('MARKETS LIVE', 'floor 3 · desk feed') }), tx, 16.3, 0.08));
    const cz = new THREE.Group(); scene.add(cz); cz.add(rb(16, 3.4, 2.6, c3Prop('#d8843a', { rough: 0.5 }), tx, 1.7, 1.3)); cz.add(rb(16.3, 0.24, 2.9, M.wood, tx, 3.5, 1.4)); for (let i = 0; i < 4; i++) { cz.add(rb(3.6, 2.6, 0.08, c3Prop('#c8742a', { rough: 0.5 }), tx - 5.7 + i * 3.8, 1.7, 2.62)); cz.add(rb(0.9, 0.16, 0.16, M.steelD, tx - 5.7 + i * 3.8, 2.6, 2.72)); }
    cz.add(rb(2.6, 1.6, 2.0, M.white, tx + 5.6, 4.42, 1.3)); cz.add(rb(2.0, 0.2, 1.4, M.dark, tx + 5.6, 5.3, 1.2)); cz.add(rb(1.7, 0.1, 1.3, M.cream, tx + 5.6, 5.42, 1.3));   // printer
    const pt = trPlant(3, 0.55, '#2a8ad8'); pt.position.set(tx - 6.4, 3.6, 1.3); cz.add(pt); for (let i = 0; i < 5; i++) cz.add(rb(1.2, 0.16, 1.6, c3Prop(['#e8402a', '#2a8ad8', '#f2c23a', '#3ac86a', '#f4efe6'][i], { rough: 0.6 }), tx - 2.2, 3.7 + i * 0.17, 1.3, 0)); }
  // ---- the giant wall chart + its 3D line (the bar the intern rides)
  { scene.add(rb(30.8, 16.8, 0.4, c3Prop('#2446a8', { rough: 0.4 }), 0, 9.5, 0.2, 0)); const ch = pl(30, 16, c3Flat('#ffffff', { map: trTexChart() }), 0, 9.5, 0.42); scene.add(ch);
    for (const [x, y] of [[-15.2, 17.7], [15.2, 17.7], [-15.2, 1.3], [15.2, 1.3]]) scene.add(cyl(0.34, 0.34, 0.3, M.gold, x, y, 0.45, 0, 12)).children.at(-1).rotation.x = Math.PI / 2;
    const L = TR_LINE.map(([x, y]) => [x, y, 1.65]).concat(TR_LIP), R = trRibbon(L, 0.8, 2.4, '#ff7a64', '#e8242a');
    s.bar = new THREE.Mesh(R.geo, Object.assign(trVC({ rough: 0.3 }), { side: THREE.DoubleSide })); scene.add(s.bar); s.barGeo = R.geo; s.ride = trRidePath(R.V, TR_PEAK);
    for (let i = 0; i < TR_LINE.length; i += 1) { const [x, y] = TR_LINE[i], d = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), c3Prop('#fff2e8', { rough: 0.3 })); d.position.set(x, y + 0.42, 2.9); d.scale.set(1, 0.4, 1); if (i % 2 === 0 && i < TR_LINE.length - 1) scene.add(d); }   // data points on the bar's front edge
    for (const y of [5.5, 9.5, 13.5]) for (const x of [-14.2, 14.2]) scene.add(rb(0.3, 0.3, 1.2, M.steelD, x, y, 0.6, 0)); }
  // ---- the "+1" counter, between the chart and the windows
  { scene.add(rb(4.4, 5.8, 0.7, c3Prop('#16161c', { rough: 0.35 }), 17.5, 14.2, 0.35, 0)); s.cntC = canvasTex(256, 352); const cm = c3Flat('#ffffff', { map: s.cntC.t }); cm.userData.c3keep = true; s.cnt = pl(4.0, 5.4, cm, 17.5, 14.2, 0.72); scene.add(s.cnt);
    scene.add(trPipe([17.5, 17.1, 0.3], [17.5, 19.2, 0.3], 0.08, M.steelD)); }
  // ---- the windows (x 20..39, y 1.5..16): mullions, sill, the city; pane 1 (x 20.25..26.1) breaks
  { const city = new THREE.Mesh(new THREE.PlaneGeometry(130, 72), c3Flat('#d4d4d4', { map: trTexCity() })); city.material.userData.c3keep = true; city.position.set(30, 14, -50); city.userData.noCast = true; scene.add(city);
    scene.add(plNC(60, 40, c3Prop('#6a6e8a', { rough: 0.9 }), 30, -0.5, -20, 0, -Math.PI / 2));   // a roof terrace outside (below the sill)
    for (const x of [20, 26.33, 32.67, 39]) scene.add(rb(0.5, 14.8, 0.6, M.frame, x, 8.75, 0.05, 0)); for (const y of [1.5, 16]) scene.add(rb(19.5, 0.5, 0.6, M.frame, 29.5, y, 0.05, 0));
    scene.add(rb(20, 0.35, 1.4, M.frame, 29.5, 1.35, 0.6, 0)); for (const x of [29.5, 35.8]) scene.add(rb(5.9, 0.25, 0.3, M.frame, x, 12, 0.05, 0));
    const gm = (b) => { const m = new THREE.MeshBasicMaterial({ map: trTexGlass(b), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }); return m; };
    s.glassA = gm(false); s.glassB = gm(true); s.pane1 = new THREE.Mesh(new THREE.PlaneGeometry(5.83, 14.0), s.glassA); s.pane1.position.set(23.17, 8.75, 0.02); Object.assign(s.pane1.userData, { noCast: true, noShade: true }); scene.add(s.pane1);
    for (const x of [29.5, 35.83]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(5.83, 14.0), gm(false)); p.position.set(x, 8.75, 0.02); Object.assign(p.userData, { noCast: true, noShade: true }); scene.add(p); }
    const wl = new THREE.SpotLight('#ffe6c0', 0.5, 80, 0.6, 0.8, 1.0); wl.position.set(30, 18, -14); wl.target.position.set(18, 0, 22); wl.layers.enableAll(); scene.add(wl); scene.add(wl.target);
    s.shards = []; const R = RNG('trshard'), sm = new THREE.MeshBasicMaterial({ color: '#d8f0ff', transparent: true, opacity: 0.85, toneMapped: false, side: THREE.DoubleSide, depthWrite: false });
    for (let i = 0; i < 22; i++) { const sz = R.r(0.35, 0.9), sh = new THREE.Shape([new THREE.Vector2(0, sz), new THREE.Vector2(sz * R.r(0.4, 0.9), -sz * 0.5), new THREE.Vector2(-sz * R.r(0.4, 0.9), -sz * R.r(0.2, 0.6))]);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), sm); Object.assign(m.userData, { noCast: true, noShade: true, noInk2: true }); m.visible = false; scene.add(m);
      s.shards.push({ m, x: 23.17 + R.r(-1.6, 1.6), y: 8.4 + R.r(-3.2, 3.6), vx: R.r(-2, 6), vy: R.r(1, 7), vz: i % 4 === 0 ? R.r(2, 5) : -R.r(6, 16), sp: [R.n(9), R.n(9), R.n(9)] }); } }
  // ---- crawl strip + ticker bands (all walls)
  { scene.add(rb(80, 2.2, 0.5, c3Prop('#3a4e9e', { rough: 0.4 }), 0, TR_CRAWL_Y, 0.25, 0)); s.crawlC = canvasTex(TR_CL * TR_CPU, 160); const cm = c3Flat('#ffffff', { map: s.crawlC.t }); cm.userData.c3keep = true; s.crawlC.t.repeat.x = 80 / TR_CL;
    s.crawl = pl(80, 1.6, cm, 0, TR_CRAWL_Y, 0.52); scene.add(s.crawl); scene.add(rbNC(80, 0.2, 0.7, M.gold, 0, TR_CRAWL_Y + 1.15, 0.35, 0)); scene.add(rbNC(80, 0.2, 0.7, M.gold, 0, TR_CRAWL_Y - 1.15, 0.35, 0));
    s.tickB = trTexTickBack(); s.tickS = trTexTickSide(); const bm = c3Flat('#ffffff', { map: s.tickB }), sm = c3Flat('#ffffff', { map: s.tickS }); bm.userData.c3keep = sm.userData.c3keep = true;
    const band = (len, mat, x, z, ry, rep) => { const g = new THREE.PlaneGeometry(len, 2.2), uv = g.attributes.uv; if (rep) for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * rep); const m = new THREE.Mesh(g, mat); m.position.set(x, TR_TICK_Y, z); m.rotation.y = ry; m.userData.noCast = true; scene.add(m);
      const hb = rbNC(len, 2.9, 0.5, c3Prop('#3a4e9e', { rough: 0.4 }), 0, 0, 0, 0); hb.position.set(x - Math.sin(ry) * 0.27, TR_TICK_Y, z - Math.cos(ry) * 0.27); hb.rotation.y = ry; scene.add(hb);
      for (const dy of [1.5, -1.5]) { const tr = rbNC(len, 0.18, 0.7, M.gold, 0, 0, 0, 0); tr.position.set(x - Math.sin(ry) * 0.1, TR_TICK_Y + dy, z - Math.cos(ry) * 0.1); tr.rotation.y = ry; scene.add(tr); } };
    band(80, bm, 0, 0.55, 0, 0); band(TR_Z, sm, -TR_X + 0.55, TR_Z / 2, Math.PI / 2, TR_Z / 40); band(TR_Z, sm, TR_X - 0.55, TR_Z / 2, -Math.PI / 2, TR_Z / 40); band(80, sm, 0, TR_Z - 0.55, Math.PI, 2); }
  // ---- left wall: world clocks, posters, a water cooler, plants
  { [['NEW YORK', 12], ['LONDON', 20], ['TOKYO', 28], ['SINGAPORE', 36]].forEach(([nm, z], i) => { const ck = new THREE.Group(); ck.position.set(-TR_X + 0.3, 17.2, z); ck.rotation.y = Math.PI / 2; scene.add(ck); const rim = cyl(1.5, 1.5, 0.35, M.dark, 0, 0, 0, 0, 24); rim.rotation.x = Math.PI / 2; ck.add(rim);
      const f = new THREE.Mesh(new THREE.CircleGeometry(1.32, 28), c3Flat('#ffffff', { map: texClock() })); f.position.z = 0.19; f.rotation.z = -i * 1.3; ck.add(f); ck.add(pl(3.2, 0.8, c3Flat('#ffffff', { map: trTexClockLbl(nm) }), 0, -2.2, 0.05)); });
    for (const [k, z] of [[0, 46], [1, 54]]) { scene.add(rb(4.2, 5.4, 0.25, c3Prop('#1a1420', { rough: 0.5 }), -TR_X + 0.15, 11.5, z, 0)); scene.add(pl(3.8, 5.0, c3Flat('#ffffff', { map: trTexPoster(k) }), -TR_X + 0.3, 11.5, z, Math.PI / 2)); }
    { const wc = new THREE.Group(); wc.position.set(-38, 0, 22); scene.add(wc); wc.add(rb(2.0, 4.6, 2.0, M.white, 0, 2.3, 0)); wc.add(cyl(0.9, 0.9, 2.6, c3Prop('#8ac8f0', { rough: 0.1, transparent: true }), 0, 5.9, 0, 0, 16)); wc.add(rb(0.4, 0.3, 0.4, c3Prop('#2a8ad8'), 0.5, 3.4, 1.05)); wc.add(rb(0.4, 0.3, 0.4, c3Prop('#e8402a'), -0.5, 3.4, 1.05)); }
    for (const [x, z, sd] of [[-37.5, 4, 4], [-37.5, 40, 5], [37, 24, 6], [37, 40, 7], [-37.5, 60, 8], [37, 60, 9]]) { const p = trPlant(sd, 1.05, ['#e0703a', '#2a8ad8', '#f2c23a'][sd % 3]); p.position.set(x, 0, z); scene.add(p); } }
  // ---- right wall: the door (z 12.5..19.5) with a lit corridor, an exit sign, a heatmap screen, a sign
  { const fr = c3Prop('#c8ccd2', { metal: 0.4, rough: 0.35 }); for (const [w, h, z, y] of [[0.8, 10.8, 12.3, 5.4], [0.8, 10.8, 19.7, 5.4]]) scene.add(rb(0.9, h, w, fr, TR_X - 0.2, y, z, 0)); scene.add(rb(0.9, 0.8, 8.2, fr, TR_X - 0.2, 10.7, 16, 0));
    const dm = c3Prop('#e8dcc0', { rough: 0.5 }); for (const [z, ry] of [[12.6, -1.25], [19.4, 1.25]]) { const d = new THREE.Group(); d.position.set(TR_X, 0, z); d.rotation.y = ry; scene.add(d); d.add(rb(0.3, 10.2, 3.4, dm, 0, 5.1, z < 16 ? 1.7 : -1.7, 0)); d.add(rb(0.5, 0.3, 1.2, M.steelD, -0.3, 5.0, z < 16 ? 3.0 : -3.0, 0)); }
    const hm = c3Prop('#f2d48a', { rough: 0.8 }); scene.add(rb(14, 0.3, 7, c3Prop('#b8a888', { rough: 0.6 }), TR_X + 7, 0.0, 16, 0)); scene.add(rb(14, 10.5, 0.3, hm, TR_X + 7, 5.25, 12.4, 0)); scene.add(rb(14, 10.5, 0.3, hm, TR_X + 7, 5.25, 19.6, 0)); scene.add(rb(0.3, 10.5, 7, c3Prop('#e8c870'), TR_X + 14, 5.25, 16, 0)); scene.add(rb(14, 0.3, 7, c3Prop('#fff4d8'), TR_X + 7, 10.5, 16, 0));
    const cl = new THREE.PointLight('#fff0d0', 0.5, 24, 2); cl.position.set(TR_X + 7, 9, 16); cl.layers.enableAll(); scene.add(cl);
    scene.add(pl(3.4, 1.3, c3Flat('#ffffff', { map: trTexSign('EXIT', '', '#1e9a4a') }), TR_X - 0.3, 12.2, 16, -Math.PI / 2));
    scene.add(rb(0.4, 6.6, 10.6, c3Prop('#16161c', { rough: 0.35 }), TR_X - 0.2, 12.5, 30, 0)); { const hmM = c3Flat('#ffffff', { map: trTexHeat() }); hmM.userData.c3keep = true; scene.add(pl(10, 6.0, hmM, TR_X - 0.42, 12.5, 30, -Math.PI / 2)); }
    scene.add(pl(9, 2.25, c3Flat('#ffffff', { map: trTexSign('TRADING FLOOR', 'equities · desk 3') }), TR_X - 0.3, 18.2, 46, -Math.PI / 2));
    scene.add(rb(4.2, 5.4, 0.25, c3Prop('#1a1420', { rough: 0.5 }), TR_X - 0.15, 11.5, 54, 0)); scene.add(pl(3.8, 5.0, c3Flat('#ffffff', { map: trTexPoster(2) }), TR_X - 0.3, 11.5, 54, -Math.PI / 2)); }
  // ---- front wall: elevator doors
  { for (const x of [-14, 0, 14]) { scene.add(rb(7.4, 11, 0.4, c3Prop('#c8ccd2', { metal: 0.6, rough: 0.3 }), x, 5.5, TR_Z - 0.2, 0)); scene.add(rb(0.12, 10.6, 0.5, M.dark, x, 5.4, TR_Z - 0.3, 0)); scene.add(rb(1.2, 0.6, 0.3, c3Prop('#ffd23a', { emissive: '#ffb020', ei: 0.6 }), x, 12.2, TR_Z - 0.3, 0)); } }

  // ---- desk rows: wood tops, white pedestals, double-sided 2 x 2 monitor banks per seat, desktop clutter (merged)
  const bez = [], scr = [], stand = [], clutter = [], chairs = [], desks = [], R = RNG('trdesk');
  const occ = s.occ = [];   // depth-only stand-ins for FOCUS (made after c3SetLook)
  const people = new Set(['1:6.5', '1:11.5', '1:-6.5', '1:16.5', '-1:-16.5', '-1:-11.5', 'I:29.5']);   // seats where a trader stands (no chair)
  const seatRow = (zc, x0, x1, tag, sides = [1, -1]) => {
    const len = x1 - x0, cx = (x0 + x1) / 2; desks.push({ g: c3RBox(len, 0.3, 4.0, 0.1, 2), x: cx, y: 4.45, z: zc, c: '#b8743a' });
    desks.push({ g: TR.gBox ||= new THREE.BoxGeometry(1, 1, 1), x: cx, y: 2.2, z: zc, s: [len - 0.4, 4.2, 0.3], c: '#2450b8' });
    occ.push([len, 4.75, 4.0, cx, 2.375, zc], [len, 3.6, 0.95, cx, 6.5, zc]);
    for (let sx = x0 + 2.5; sx < x1 - 1; sx += 5) for (const sd of sides) {
      const zz = zc + sd * 1.0; desks.push({ g: TR.gBox, x: sx - 1.6, y: 2.1, z: zz + sd * 0.3, s: [1.4, 4.0, 1.9], c: '#eef0f2' }); for (let k = 0; k < 3; k++) desks.push({ g: TR.gBox, x: sx - 1.6, y: 0.9 + k * 1.25, z: zc + sd * 2.0, s: [1.0, 0.1, 0.06], c: '#8a929a' });
      trSeatMonitors(bez, scr, sx, zc, sd); stand.push({ g: TR.gBox, x: sx, y: 6.0, z: zc, s: [0.3, 3.4, 0.5], c: '#3a3d48' }, { g: TR.gBox, x: sx, y: 4.65, z: zc, s: [1.4, 0.1, 1.0], c: '#3a3d48' });
      clutter.push({ g: TR.gKb ||= c3RBox(2.0, 0.12, 0.7, 0.04, 1), x: sx, y: 4.68, z: zc + sd * 1.3, c: '#2a2c34' }, { g: TR.gMs ||= c3RBox(0.3, 0.14, 0.46, 0.06, 1), x: sx + 1.45, y: 4.68, z: zc + sd * 1.35, c: '#2a2c34' });
      if (R.f() < 0.6) clutter.push({ g: TR.gPh ||= c3RBox(0.9, 0.32, 0.8, 0.08, 1), x: sx - 1.6, y: 4.78, z: zc + sd * 1.1, c: '#1e2028' }, { g: TR.gHs ||= c3RBox(1.0, 0.2, 0.3, 0.08, 1), x: sx - 1.6, y: 5.0, z: zc + sd * 1.0, c: '#2a2c34' });
      if (R.f() < 0.7) clutter.push({ g: TR.gMug ||= new THREE.CylinderGeometry(0.26, 0.23, 0.6, 12), x: sx + 1.95, y: 4.9, z: zc + sd * 1.65, c: ['#e8402a', '#f4efe6', '#2a8ad8', '#f2c23a', '#3ac86a'][R.i(0, 4)] });
      if (R.f() < 0.65) { const n = R.i(1, 4); for (let k = 0; k < n; k++) clutter.push({ g: TR.gPaper ||= c3RBox(1.1, 0.16, 1.4, 0.03, 1), x: sx - 1.9 + R.n(0.1), y: 4.68 + k * 0.17, z: zc + sd * 1.45, ry: R.n(0.2), c: ['#f4efe6', '#ffd23a', '#7ab4ee', '#ff8a6a'][R.i(0, 3)] }); }
      if (R.f() < 0.25) { clutter.push({ g: TR.gPot ||= new THREE.CylinderGeometry(0.4, 0.3, 0.7, 12), x: sx + 2.0, y: 4.95, z: zc + sd * 0.9, c: '#e0703a' }); for (let k = 0; k < 4; k++) clutter.push({ g: TR.gLeaf ||= new THREE.SphereGeometry(0.42, 10, 8), x: sx + 2.0 + R.n(0.3), y: 5.6 + R.r(0, 0.5), z: zc + sd * 0.9 + R.n(0.3), s: [1, 0.55, 0.8], ry: R.f() * TAU, c: k % 2 ? '#3a9a4a' : '#5ab84a' }); }
      const key = (tag === 'I' ? 'I:' : (sd > 0 ? '1:' : '-1:')) + sx; if (tag !== 'R2' && people.has(key)) continue;
      if (tag === 'R2' || R.f() < 0.8) { const chx = sx + R.n(0.5), chz = zc + sd * (3.0 + R.r(0, 0.6)), ry = R.n(0.5) + (sd > 0 ? Math.PI : 0), seat = ['#1e2c66', '#22242c', '#2a3a8a'][R.i(0, 2)];
        chairs.push({ g: TR.gCs ||= c3RBox(2.0, 0.4, 2.0, 0.15, 2), x: chx, y: 2.9, z: chz, ry, c: seat }, { g: TR.gCb ||= c3RBox(1.9, 2.4, 0.35, 0.15, 2), x: chx + Math.sin(ry) * 0.95, y: 4.5, z: chz + Math.cos(ry) * 0.95, ry, c: seat });
        chairs.push({ g: TR.gCc ||= new THREE.CylinderGeometry(0.14, 0.14, 2.4, 8), x: chx, y: 1.6, z: chz, c: '#8a929a' }); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + ry; chairs.push({ g: TR.gBox, x: chx + Math.cos(a) * 0.6, y: 0.35, z: chz + Math.sin(a) * 0.6, ry: -a, s: [1.3, 0.16, 0.22], c: '#2a2c34' }); } } } };
  for (const [x0, x1] of TR_SEG) { seatRow(TR_R1, x0, x1, 'R1'); seatRow(TR_R2, x0, x1, 'R2'); }
  seatRow(TR_I0[2], TR_I0[0], TR_I0[1], 'I');
  // the intern's desk (left of the chart): a laptop, a juice box, a nameplate; the skis lean on its right end
  { const [dx, dz] = TR_IDESK; desks.push({ g: c3RBox(5.0, 0.3, 3.0, 0.1, 2), x: dx, y: 4.45, z: dz, c: '#b8743a' }); for (const sx of [-2.2, 2.2]) desks.push({ g: TR.gBox, x: dx + sx, y: 2.15, z: dz, s: [0.4, 4.3, 2.6], c: '#eef0f2' });
    clutter.push({ g: c3RBox(1.9, 0.1, 1.3, 0.04, 1), x: dx - 0.6, y: 4.65, z: dz + 0.4, c: '#c8ccd2' }, { g: c3RBox(1.9, 1.3, 0.1, 0.04, 1), x: dx - 0.6, y: 5.3, z: dz - 0.25, rx: -0.2, c: '#c8ccd2' }, { g: TR.gBox, x: dx + 1.2, y: 5.0, z: dz + 0.6, s: [0.5, 0.8, 0.35], c: '#f2c23a' }, { g: TR.gBox, x: dx + 0.8, y: 4.82, z: dz + 1.2, s: [1.6, 0.4, 0.15], c: '#1a2a6a' });
    occ.push([5.0, 4.75, 3.0, dx, 2.375, dz]); }
  const mDesk = new THREE.Mesh(trMerge(desks), trVC({ rough: 0.45 })); scene.add(mDesk);
  { const wt = new THREE.Mesh(trMerge(desks.filter((d) => d.c === '#b8743a')), c3Prop('#ffffff', { map: texWood(), rough: 0.45 })); wt.position.y = 0.006; scene.add(wt); }   // wood grain on the tops
  scene.add(new THREE.Mesh(trMerge(bez), c3Prop('#262932', { rough: 0.35 }))); scene.add(new THREE.Mesh(trMerge(stand), trVC({ rough: 0.4 })));
  scene.add(new THREE.Mesh(trMerge(clutter), trVC({ rough: 0.45 }))); scene.add(new THREE.Mesh(trMerge(chairs), trVC({ rough: 0.5 })));
  // screens: one merged mesh, UVs into the atlas; each monitor flips to a crash screen in a wave after "five"
  { const base = new THREE.PlaneGeometry(1.95, 1.3).toNonIndexed(), parts = scr.map((q) => Object.assign({ g: base }, q)), geo = trMerge(parts), uv = geo.attributes.uv; s.scrUV0 = Float32Array.from(uv.array);
    s.mon = scr.map((q, i) => { const a = (i * 7 + Math.floor(q.x)) % 8, d = Math.hypot(q.x - 4, q.z - 30); return { i0: i * 6, a, b: 8 + ((i * 5 + 3) % 8), tf: 37.24 + d * 0.012 + (i % 5) * 0.03 }; });
    s.scrAt = new THREE.Mesh(geo, (() => { const m = c3Flat('#ffffff', { map: trTexScreens() }); m.userData.c3keep = true; return m; })()); s.scrAt.userData.noCast = true; scene.add(s.scrAt); s.scrKey = -1; }
  // ---- back zone dressing: a bin, a plant by the chart, a photocopier, cable cover strips
  { const p = trPlant(11, 0.9, '#f2c23a'); p.position.set(-18.5, 0, 2.6); scene.add(p); const b = cyl(0.9, 0.75, 2.4, c3Prop('#2a8ad8', { rough: 0.45 }), -16.4, 1.2, 9.6, 0, 16); scene.add(b);
    scene.add(rb(3.4, 5.0, 2.6, M.white, 37.5, 2.5, 21.5, 0)); scene.add(rb(3.0, 0.4, 2.2, M.dark, 37.5, 5.2, 21.5, 0)); scene.add(rb(0.8, 0.5, 0.2, c3Prop('#3ae06a', { emissive: '#3ae06a', ei: 0.6 }), 36.4, 4.0, 22.85, 0));
    for (const z of [TR_R1, TR_R2]) scene.add(rbNC(70, 0.08, 0.6, c3Prop('#2a2c34', { rough: 0.8 }), 0, 0.04, z, 0)); }
  // ---- FOCUS props: coffee mug + splash, the phone handset, the org chart board, skis, the cart + cutout + chips + tag
  s.mug = mug('#f4efe6', 0, 0, 0); s.mug.children.forEach((c) => (c.position.y -= 0.35)); s.mug.scale.setScalar(1.5); F.add(s.mug);
  s.puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ map: tex((g, w, h) => { g.clearRect(0, 0, w, h); const R2 = RNG('trpud'); g.fillStyle = '#6a3a1e'; g.beginPath(); for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, r = w * (0.36 + R2.r(0, 0.12) * (i % 3 ? 1 : 1.8)); g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.closePath(); g.fill(); g.fillStyle = 'rgba(255,220,180,0.35)'; g.beginPath(); g.ellipse(w * 0.4, h * 0.42, w * 0.12, h * 0.05, -0.4, 0, TAU); g.fill(); }, 256, 256), transparent: true, depthWrite: false, toneMapped: false }));
  s.puddle.rotation.x = -Math.PI / 2; Object.assign(s.puddle.userData, { noCast: true, noShade: true, noInk2: true }); F.add(s.puddle);
  s.drops = []; for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), c3Prop('#7a4222', { rough: 0.2 })); d.userData.noShade = true; F.add(d); s.drops.push(d); }
  s.handset = new THREE.Group(); s.handset.add(rb(0.34, 1.3, 0.34, c3Prop('#1e2028', { rough: 0.4 }), 0, 0, 0, 0)); s.handset.add(rb(0.42, 0.36, 0.5, c3Prop('#1e2028', { rough: 0.4 }), 0, 0.55, 0.12, 0)); s.handset.add(rb(0.42, 0.36, 0.5, c3Prop('#1e2028', { rough: 0.4 }), 0, -0.55, 0.12, 0)); F.add(s.handset);
  s.orgC = canvasTex(768, 512); s.org = new THREE.Group(); s.org.add(rb(5.6, 3.73, 0.14, M.white, 0, 0, 0, 0)); { const fm = c3Flat('#ffffff', { map: s.orgC.t }); fm.userData.c3keep = true; const f = pl(5.4, 3.6, fm, 0, 0, 0.08); f.userData.noShade = true; s.org.add(f); } F.add(s.org);
  s.skis = trSkis(); F.add(s.skis);
  s.cart = trCart(M); F.add(s.cart);
  // the cardboard cutout: Huang's toon head (kit look) printed on a die-cut board with a thick corrugated edge, on a stick
  { const C = trCutoutTex(), k = 4.0 / C.w, sh = new THREE.Shape(C.poly.map(([x, y]) => new THREE.Vector2((x - C.cv.width / 2) * k, (C.cv.height / 2 - y) * k))), dep = 0.24;
    const cut = new THREE.Group(), card = c3Prop('#c49a64', { rough: 0.9 }); const ex = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: false, curveSegments: 1 }), card); ex.position.z = -dep; cut.add(ex);
    const ft = new THREE.CanvasTexture(C.cv); ft.encoding = THREE.sRGBEncoding; ft.anisotropy = 8; const fm = c3Prop('#ffffff', { map: ft, rough: 0.55 }); fm.alphaTest = 0.5; fm.transparent = false;
    const front = new THREE.Mesh(new THREE.PlaneGeometry(C.cv.width * k, C.cv.height * k), fm); front.position.z = 0.012; Object.assign(front.userData, { noShade: true, noCast: true, trNoRecv: true }); cut.add(front);
    const bot = Math.min(...C.poly.map(([, y]) => (C.cv.height / 2 - y) * k)); cut.add(rb(0.7, 0.9, 0.2, card, 0, bot - 0.2, -0.12, 0));   // a tab into the basket floor
    cut.position.set(0.5, 3.2 - bot, 0.15); cut.rotation.y = 2.55; s.cart.add(cut); s.cutout = cut; s.cutBot = bot; }
  { const bx = new THREE.Group(); bx.position.set(-1.45, 2.62, -0.72); bx.scale.setScalar(0.76); bx.rotation.y = 0.5; s.cart.add(bx); const bt = trTexChipBox(), bm = c3Prop('#ffffff', { map: bt, rough: 0.8 }), pm = c3Prop('#c8955a', { rough: 0.85 });
    bx.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.7), [bm, bm, pm, pm, bm, bm])); bx.children[0].position.y = 0.8;
    for (const [x, z, ry] of [[-0.4, 0.2, 0.3], [0.3, -0.3, -0.5], [0.1, 0.5, 1.1]]) { const c = rb(0.9, 0.12, 0.9, c3Prop('#ffffff', { map: TR.chipT ||= trTexChip(), rough: 0.4 }), x, 1.72, z, 0); c.rotation.set(0.25, ry, 0.15); bx.add(c); }
    for (const sz of [-1, 1]) { const fl = rb(1.8, 0.05, 0.7, pm, 0, 1.6, sz * 1.15, 0); fl.rotation.x = sz * 0.6; bx.add(fl); } }
  { s.tagPiv = new THREE.Group(); s.tagPiv.position.set(2.95, 5.0, -0.7); s.cart.add(s.tagPiv); s.cart.add(trPipe([2.2, 5.0, -0.7], [3.0, 5.0, -0.7], 0.05, c3Prop('#d8dce4', { metal: 0.7, rough: 0.25 }))); s.tagPiv.add(trPipe([0, 0, 0], [0, -0.9, 0], 0.025, c3Prop('#f4efe6')));
    const tg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.625), (() => { const m = c3Prop('#ffffff', { map: trTexTag(), rough: 0.6, side: THREE.DoubleSide }); m.alphaTest = 0.5; return m; })()); tg.position.set(0, -1.75, 0); tg.rotation.y = 2.094; tg.userData.noShade = true; s.tagPiv.add(tg); }
  // the pane-1 break shows as glass shards (main layer) and the person-shaped hole
  c3Layer(F, C3.L_FOCUS);
  for (const k of TR_PEOPLE) toonPerson(s, k);
  haze(scene, '#8aa0d8', 0.0016);
  c3Env(scene, { top: '#e8f0ff', mid: '#4a6ab8', bot: '#7a4a30' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.7, scale: 0.5, inkSet: false, focusK: 1, bounce: ['#c8dcff', '#c87040', 0.12],
    lights: [[6, 10, 37, '#ffd8a0', 1.0, 26], [-20, 10, 37, '#ffd8a0', 0.8, 26], [-29, 11, 6, '#ffe8c8', 2.2, 20], [0, 9, 8, '#ffc8a8', 1.0, 24], [10, 10, 56, '#ffd8a0', 0.7, 26],
      [-29, 18, 5, '#ffe2b8', 2.6, 18], [-14, 19, 5, '#ffe2b8', 2.2, 18], [4, 19, 5, '#ffe2b8', 2.2, 18], [-6, 5, 8, '#9cd0ff', 0.8, 20], [-29, 24, 6, '#ffe2b8', 1.1, 16], [-9, 24, 6, '#ffe2b8', 0.9, 16], [10, 24, 6, '#ffe2b8', 0.8, 16], [-26, 6, 9, '#9cd0ff', 0.7, 18], [-22, 12, 22, '#ffd8a0', 0.6, 22]],
    shafts: [[[23, 15, -1], [21, 0, 8], 2.6, 4.5, '#fff0d0', 0.05], [[33, 15, -1], [31, 0, 8], 2.6, 4.5, '#fff0d0', 0.045]] });
  trOccluders(s);
  // VSM renders every RECEIVER into the shadow map too (three.js): the ceiling grid / lamps / high bands drew lattice shadows on the
  // floor and the cutout's print shadowed its own card. Set the shadows up now and take those out of the receiving set.
  c3ShadowSetup(scene); { const b = new THREE.Box3(); scene.traverse((m) => { if (!m.isMesh || m.userData.c3catch) return; b.setFromObject(m); if (b.min.y > 21.5 || m.userData.trNoRecv) m.receiveShadow = false; }); }
  return s;
}
// depth-only stand-ins on the FOCUS layer (after c3SetLook): desks + monitor banks, the ride bar, the back wall round the
// windows, the right wall round the door, the window mullions
function trOccluders(s) { const M = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); M.userData.c3keep = true;
  const add = (geo, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, M); m.position.set(x, y, z); m.rotation.y = ry; Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); s.scene.add(m); return m; };
  for (const [w, h, d, x, y, z] of s.occ) add(new THREE.BoxGeometry(w, h, d), x, y, z);
  add(s.barGeo, 0, 0, 0);
  for (const [w, h, x, y] of [[60, TR_H, -10, TR_H / 2], [19, 1.5, 29.5, 0.75], [19, 12, 29.5, 22], [1, TR_H, 39.5, TR_H / 2], [0.5, 14.5, 26.33, 8.75], [0.5, 14.5, 32.67, 8.75], [0.5, 14.5, 20, 8.75]]) add(new THREE.BoxGeometry(w, h, 0.3), x, y, -0.16);
  for (const [z0, z1, y0, y1] of [[0, 12.5, 0, TR_H], [19.5, TR_Z, 0, TR_H], [12.5, 19.5, 10.5, TR_H]]) add(new THREE.BoxGeometry(0.3, y1 - y0, z1 - z0), TR_X + 0.16, (y0 + y1) / 2, (z0 + z1) / 2);
}
// Huang's toon head from the kit (t3HeadCanvas, smug), on a white die-cut margin; traced to a polygon for the card edge
function trCutoutTex() {
  const p = c3ToonChar(Object.assign({}, CAST.huang, { key: 'TRcutout', res: 2 }));
  const st = { t: 0, expr: 'smug', browUp: 0, nod: 0, nodSide: 1, lid: 0, gaze: [0, 0], light: -2.2, env: '#e8e4f0', talk: 0, talkOn: false, talkAmp: 0, fx: null };
  const hc = t3HeadCanvas(p, st, { f: 0, m: 0, dir: 1, back: false }), pad = 60, W2 = hc.width + 2 * pad, H2 = hc.height + 2 * pad;
  const cv = Object.assign(document.createElement('canvas'), { width: W2, height: H2 }), g = cv.getContext('2d');
  const sil = Object.assign(document.createElement('canvas'), { width: W2, height: H2 }), sg = sil.getContext('2d'); sg.drawImage(hc, pad, pad); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#fbf8f2'; sg.fillRect(0, 0, W2, H2);
  for (let a = 0; a < 32; a++) for (const r of [14, 28, 40]) g.drawImage(sil, Math.cos(a / 32 * TAU) * r, Math.sin(a / 32 * TAU) * r);
  g.drawImage(hc, pad, pad);
  const data = g.getImageData(0, 0, W2, H2).data, cx = pad + T3_HEADBOX.cx * 2, cy = pad + T3_HEADBOX.cy * 2, N = 120, poly = [];
  for (let i = 0; i < N; i++) { const a = -i / N * TAU, dx = Math.cos(a), dy = Math.sin(a); let r = Math.max(W2, H2); for (; r > 8; r -= 2) { const x = Math.round(cx + dx * r), y = Math.round(cy + dy * r); if (x >= 0 && y >= 0 && x < W2 && y < H2 && data[(y * W2 + x) * 4 + 3] > 120) break; } poly.push([cx + dx * (r + 1), cy + dy * (r + 1)]); }
  const xs = poly.map((q) => q[0]); return { cv, poly, w: Math.max(...xs) - Math.min(...xs) };
}
const TR_get = () => TR.s ||= trBuild();
SETS.trade = TR_get;

// ---- the continuous camera (absolute seconds), rev 4: travelling legs (whips / cranes / pull-backs landing on words) between
// HOLDS that are one gentle one-directional drift each (slow push and/or slow orbit, roll easing to one side and staying), so
// the camera distance is monotonic on every hold (no in/out ping-pong) and fov never oscillates. Legs: whip in right onto the
// traders, slow push + orbit right -> pull back with the falling mug -> crane up to a telephoto: the NVDA alert, slow push ("five")
// -> whip left HIGH over R1 to the wall TV ("president") -> one slow push + orbit left on the TV (the president talking, quote
// card whole) -> pull back + crane up to a wide newsroom frame: the headline crawl on top, the TV / intern's desk / the intern /
// Lena below -> track right with the words being read, slowly pushing in -> push down the R1 aisle onto the org chart ("to you")
// -> whip right up the crawl with a roll (THU · REUTERS), tilt down onto the "+1" counter, slow push -> whip left to the intern
// -> ONE slow orbit left round him with a slow push -> pull back + crane up revealing the chart ("ski slope") -> slow push on
// the grab / jump -> follow his run to the window (G2) -> the cart in the door: push on the cutout ("face") -> crane up + orbit
// ("company this big") -> down onto Gus + Omar ("investors"), slow push -> pull out onto the tag ("buying") -> one slow push
// tracking the cart onto the cutout + chips ("chips") -> whip out right.
CAMSEQ.trade = [
  [35.82, [3.0, 9.6, 50.5], [-1.5, 8.6, 34.0], 54, -5],
  [36.10, [6.0, 9.6, 49.0], [8.2, 8.8, 33.7], 52, -1],      // landed on the traders: slow push + orbit right
  [36.42, [8.2, 9.2, 47.0], [8.6, 8.9, 33.8], 51, 0.5],
  [36.74, [10.0, 8.9, 45.2], [8.8, 8.9, 33.8], 50, 1.5],
  [37.02, [8.0, 8.0, 47.5], [7.4, 7.0, 34.0], 60, 0.5],     // pull back with the falling mug
  [37.40, [12.0, 11.0, 58.0], [4.0, 12.9, 0.5], 30, -2],    // telephoto on the NVDA alert: slow push
  [37.82, [12.6, 11.4, 54.6], [4.4, 13.0, 0.5], 29.5, -2.6],
  [38.08, [-6.0, 19.5, 42.0], [-15.0, 16.2, 0.5], 42, -2],   // the whip rides HIGH over the R1 traders
  [38.34, [-26.0, 13.4, 25.0], [-28.6, 11.0, 0.5], 53, -1],  // the TV ("president"): one slow push + orbit left, roll easing right
  [39.36, [-27.2, 12.7, 23.9], [-28.85, 10.9, 0.5], 53, 1],
  [40.30, [-28.2, 12.1, 23.0], [-29.0, 10.8, 0.5], 53, 2],
  [40.96, [-24.0, 18.2, 38.0], [-26.5, 13.4, 0.3], 46, 1.5], // pull back + crane up: the crawl on top, the floor below ("Times")
  [41.80, [-17.6, 17.9, 35.0], [-19.2, 12.3, 0.3], 46, 0.5], // track right with the words being read, slow push, slow crane down
  [42.60, [-9.4, 17.5, 34.0], [-9.4, 10.9, 0.3], 46, -0.8],
  [43.40, [-1.8, 16.6, 32.4], [-1.2, 9.1, 0.3], 46, -2],
  [43.90, [0.0, 11.0, 28.5], [-2.8, 9.4, 13.6], 50, -2.5],   // down the R1 aisle onto the org chart ("reports to you")
  [44.20, [-0.4, 10.5, 26.6], [-3.0, 9.4, 13.6], 49, -2.8],
  [44.62, [0.8, 10.9, 25.7], [-2.7, 9.4, 13.6], 47.5, -3],
  [45.30, [18.4, 16.0, 30.5], [19.0, 19.6, 0.3], 58, -5],    // whip right up the crawl (THU · REUTERS)
  [45.92, [18.0, 15.2, 28.5], [17.8, 14.0, 0.3], 54, -1],    // tilt down onto the "+1" counter ("another"), slow push
  [46.38, [19.6, 15.6, 27.0], [18.6, 14.6, 0.3], 53, 0.5],
  [46.98, [-2.49, 11.0, 22.53], [-9.3, 10.9, 9.5], 50, -2],  // whip left to the intern: ONE slow orbit left round him + slow push
  [47.90, [-6.26, 10.9, 22.65], [-9.3, 10.9, 9.5], 50, -0.6],
  [48.80, [-9.30, 10.8, 22.40], [-9.3, 10.85, 9.5], 50, 0.8],
  [49.66, [-11.88, 10.7, 21.63], [-9.3, 10.8, 9.5], 50, 2],
  [49.95, [-6.5, 13.4, 29.0], [-5.0, 8.0, 2.0], 58, 2],      // pull back + crane up: the chart ("ski slope"), slow push on the grab / jump
  [50.32, [-6.0, 13.6, 28.6], [-5.4, 8.6, 2.0], 58, 1],
  [50.56, [-4.5, 14.2, 28.0], [-5.6, 10.8, 2.0], 58, 0],
  [51.04, [5.0, 12.0, 27.6], [11.0, 6.2, 2.0], 56, 3],       // follow his run to the window (G2)
  [51.30, [8.5, 11.2, 27.0], [21.5, 8.8, 0.0], 54, 0],
  [51.75, [18.0, 13.0, 26.0], [37.0, 7.6, 15.0], 54, -3],
  [52.36, [24.0, 12.0, 32.0], [31.9, 6.5, 19.3], 56, -1],     // the cart from HIGH over the R1 monitor row: push on the cutout ("face")
  [52.70, [25.0, 12.6, 31.4], [32.3, 6.6, 19.0], 56, -0.5],
  [53.20, [30.5, 17.0, 33.0], [33.0, 6.2, 18.6], 58, -3],     // crane up + orbit right against the cart ("company this big")
  [53.64, [22.0, 11.4, 32.0], [29.4, 7.9, 19.0], 51, 1],      // "investors": down onto Gus + Omar side by side, slow push
  [54.05, [22.5, 11.2, 31.2], [29.1, 7.8, 19.0], 50, 1.8],
  [54.45, [21.0, 13.0, 33.2], [25.6, 6.3, 19.0], 58, -1],     // "buying": pull out, the tag readable, heads whole
  [55.12, [19.4, 12.0, 31.8], [23.4, 6.5, 19.1], 58, -0.2],   // one slow push tracking the cart onto the cutout + chips ("chips")
  [55.43, [18.8, 11.7, 31.1], [22.9, 6.5, 19.3], 58, 0.4],
  [55.58, [19.2, 11.5, 30.8], [25.0, 6.5, 20.4], 60, 4],      // whip out right
];

// ---- helpers for the take
// facing keys toward world points (or numbers), snapped over 0.16 s: [[t, [x, z] | facing], ...]
function trFace(cam, x, z, K, t) { const f = (v) => typeof v === 'number' ? v : toonLookFacing(cam, x, z, v[0] - x, v[1] - z); let i = 0; while (i + 1 < K.length && K[i + 1][0] <= t) i++;
  if (i === 0) return f(K[0][1]); return lerp(f(K[i - 1][1]), f(K[i][1]), EZ.o3(trE(K[i][0], K[i][0] + 0.16, t))); }
// eased key values: [[t, v], ...], each change takes d s
function trK(K, t, d = 0.12) { let v = K[0][1]; for (let i = 1; i < K.length; i++) { if (t < K[i][0]) break; v = lerp(K[i - 1][1], K[i][1], EZ.io(trE(K[i][0], K[i][0] + d, t))); } return v; }
const trJolt = (t, t0, k, d = 0.5) => t > t0 && t < t0 + d ? k * Math.sin(Math.PI * trE(t0, t0 + d, t)) * Math.exp(-(t - t0) * 3) : 0;
// a walk between key points [[t, x, z], ...] -> { x, z, vx, vz, moving, dist }
function trPath(K, t) { if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], vx: 0, vz: 0, moving: false, dist: 0 }; let dist = 0;
  for (let i = 0; i + 1 < K.length; i++) { const [t0, x0, z0] = K[i], [t1, x1, z1] = K[i + 1], L = Math.hypot(x1 - x0, z1 - z0);
    if (t < t1) { const u = (t - t0) / (t1 - t0); return { x: lerp(x0, x1, u), z: lerp(z0, z1, u), vx: x1 - x0, vz: z1 - z0, moving: L > 0.01, dist: dist + L * u }; } dist += L; }
  const l = K[K.length - 1]; return { x: l[1], z: l[2], vx: 0, vz: 0, moving: false, dist }; }
// a prop pose (position + quaternion) blend
function trBlendPose(a, b, u) { return { p: a.p.clone().lerp(b.p, u), q: a.q.clone().slerp(b.q, u) }; }
function trApply(obj, P) { obj.visible = true; obj.position.copy(P.p); obj.quaternion.copy(P.q); }
// the skis' frame from a direction (along) + up
function trFrameQ(along, up = V3(0, 1, 0)) { const x = along.clone().normalize(), z = V3(0, 0, 0).crossVectors(x, up).normalize(), y = V3(0, 0, 0).crossVectors(z, x); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); }
// the hand mid point of a person (after pose)
function trHands(s, who) { const L = c3ToonHandWorld(s.p[who], 'L'), R = c3ToonHandWorld(s.p[who], 'R'); return L && R ? { L, R, mid: L.clone().add(R).multiplyScalar(0.5) } : null; }

// the gripping hand OVER a prop held in front of the torso: just the dot hand (a disc in the card's limb colour and light, the
// kit's size), always on top. The kit's gripDot pastes a square of the card round the hand, which hid the mug behind shirt pixels.
function trDot(s, who, nm) { const p = s.p[who], h = c3ToonHandWorld(p, nm); s.trd ||= {}; const key = who + nm;
  let m = s.trd[key]; if (!m) { m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: T3.limb, depthTest: false, depthWrite: false, toneMapped: false })); m.renderOrder = 30; Object.assign(m.userData, { noInk2: true, noCast: true, noShade: true }); c3Layer(m, C3.L_FOCUS); s.scene.add(m); s.trd[key] = m; }
  if (!h || !p.g.visible) { m.visible = false; return; }
  const a = V3(0, 0, 0), b = V3(0, 1000 * p.U, 0); p.root.localToWorld(a); p.root.localToWorld(b); a.project(s.cam); b.project(s.cam); const px = Math.round(Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2) / 50) * 50;
  const lk = Math.max(1, Math.min(1.8, 1 + (1000 - px) / 1000 * 0.8)), r = 6.6 * (2 * T3.a * (p.o.headK ?? 1) / 100) * lk ** 0.8 * p.U;
  m.visible = true; m.scale.setScalar(r); m.position.copy(h).addScaledVector(s.cam.position.clone().sub(h).normalize(), 0.05); m.quaternion.copy(s.cam.quaternion); m.material.color.set(T3.limb).multiply(p.mat.color); }
const trHideDots = (s) => { if (s.trd) for (const k in s.trd) s.trd[k].visible = false; };
// the G2 beats (the intern's run)
const TR_G = { reach: 50.12, hold: 50.24, squat: 50.30, jump: 50.38, land: 50.58, lip: 51.04, glass: 51.16, out: 52.3 };
const TR_LIPEND = () => TR.s.ride.at(TR.s.ride.len);
function trInternPos(s, t) {   // where the intern's feet are + his velocity direction
  const [x0, z0] = TR_INT, G = TR_G, R = s.ride, P0 = R.at(0);
  if (t < G.jump) return { x: x0, y: 0, z: z0, d: V3(1, 0, 0), ph: 'stand' };
  if (t < G.land) { const u = trE(G.jump, G.land, t), y = lerp(0, P0.y, u) + 4.5 * Math.sin(Math.PI * u), x = lerp(x0, P0.x, EZ.o2(u)), z = lerp(z0, P0.z, EZ.o2(u)); return { x, y, z, d: V3(1, 0.35 - 0.6 * u, 0).normalize(), ph: 'leap', u }; }
  if (t < G.lip) { const u = trE(G.land, G.lip, t), sq = R.len * (0.35 * u + 0.65 * u * u), q = R.at(sq), sl = 0.72 * Math.sin(sq / 6.5 * TAU) * Math.min(1, sq / 2.5) * (1 - trE(R.len - 3, R.len, sq));
    return { x: q.x, y: q.y, z: q.z + sl, d: V3(...q.t), ph: 'ride', sq, sl, slv: Math.cos(sq / 6.5 * TAU) }; }
  const E = R.at(R.len), P1 = V3(22.9, 3.0, 0), P2 = V3(72, 28, -46);   // feet height: his body goes through the middle of the pane
  if (t < G.glass) { const u = trE(G.lip, G.glass, t), p = V3(E.x, E.y, E.z).lerp(P1, u); p.y += 2.2 * Math.sin(Math.PI * u); return { x: p.x, y: p.y, z: p.z, d: P1.clone().sub(V3(E.x, E.y, E.z)).normalize(), ph: 'fly', u }; }
  const u = trE(G.glass, G.out, t), p = P1.clone().lerp(P2, EZ.o2(u)); return { x: p.x, y: p.y, z: p.z, d: P2.clone().sub(P1).normalize(), ph: 'out', u };
}

function trFrame(t) {
  const s = TR_get(); hideAll(s); hideGrips(s); trHideDots(s); const cam = seqCam(s, 'trade', t);
  // ---- screens, ticker, crawl, TV, counter
  { const B = s.tickB; B.offset.x = TR.tickBU - 0.55 + trTickP(t) / 80; s.tickS.offset.x = t * 3 / 40;
    const [o, n, wx] = trCrawlState(t), key = o + n + (o === n ? '' : Math.round(wx * 4)); redraw(s.crawlC, key, (g, w, h) => trDrawCrawl(g, w, h, t)); s.crawlC.t.offset.x = (-40 - trCrawlX(t)) / TR_CL;
    const q = t < 39.06 ? 0 : Math.min(1, (t - 39.06) / 0.22), live = t > 37.6 && t < 40.9; redraw(s.tvC, live ? 'f' + Math.round(t * 30) : 'q' + Math.round(q * 20) + (t < 39 ? 'a' : 'b'), (g, w, h) => trDrawTV(g, w, h, q, live ? t : t < 39 ? 37.6 : 40.9));
    const ck = t < 45.9 ? 0 : (t - 45.9) / 0.16; redraw(s.cntC, 'c' + Math.round(Math.min(ck, 1.7) * 20), (g, w, h) => trDrawCounter(g, w, h, Math.min(ck, 1.7)));
    let n2 = 0; for (const m of s.mon) if (t >= m.tf) n2++; if (n2 !== s.scrKey) { s.scrKey = n2; const uv = s.scrAt.geometry.attributes.uv; for (const m of s.mon) { const c = t >= m.tf ? m.b : m.a, u0 = (c % 4) * 0.25, v0 = 1 - (Math.floor(c / 4) + 1) * 0.25;
      for (let k = 0; k < 6; k++) { const j = m.i0 + k; uv.array[j * 2] = u0 + s.scrUV0[j * 2] * 0.25; uv.array[j * 2 + 1] = v0 + s.scrUV0[j * 2 + 1] * 0.25; } } uv.needsUpdate = true; } }
  const lookTick = [-10, 0], five = 37.24, slides = 36.72;
  // ---- TRcole: chatting, coffee in hand; gasps on "slides", the mug drops and splashes; worried after
  { const x = 6.6, z = 33.6, tq0 = slides; const ex = [[0, 'smile'], [35.95, 'talk'], [36.3, 'smile'], [tq0, 'shock'], [37.7, 'worried'], [39.1, 'nervous'], [45.9, 'sad']];
    const fac = trFace(cam, x, z, [[0, 0.55], [36.3, [10.6, 33.9]], [tq0, lookTick], [38.4, [x - 3, z + 9]], [39.1, [-29, 0]], [40.6, lookTick]], t);
    const pc = (tq) => pose(s, 'TRcole', tq, x, z, { facing: fac, expr: ex, talk: tq > 35.95 && tq < 36.3 ? 0.7 : 0, gaze: tq > tq0 && tq < 38.4 ? [-0.3, -0.7] : [0.2, 0],
      hand: { R: [[0, 'sip'], [tq0, 'up'], [37.6, { h: [0.24, 0.1], pole: [1, 0.8], hand: 'open' }], [38.4, 'hip']], L: [[0, 'down'], [tq0, 'up'], [37.6, 'chin'], [39.4, 'cross']] }, squash: trJolt(tq, tq0, 0.35), lean: -trJolt(tq, tq0, 0.1) });
    if (t < tq0 + 0.02) { pc(t); gripProp(s, s.mug, 'TRcole', 'R', V3(0.28, 0.05, 0), { behind: -0.45 }); trDot(s, 'TRcole', 'R'); }
    else { pc(tq0 + 0.01); const h0 = c3ToonHandWorld(s.p.TRcole, 'R').clone(); pc(t); const g = 85, up = 2.2, d = t - tq0 - 0.02, T = (up + Math.sqrt(up * up + 2 * g * (h0.y - 0.36))) / g, u = Math.min(1, d / T);
      const X = h0.x + 0.9 * u, Z = h0.z + 0.8 * u, Y = d < T ? h0.y + up * d - 0.5 * g * d * d : 0.36; s.mug.visible = true; s.mug.position.set(X, Math.max(0.36, Y), Z); s.mug.rotation.set(u * 4.2 + (d > T ? 0 : 0), 0.4, d > T ? Math.PI / 2 : u * 2.5);
      if (d > T) { s.mug.rotation.set(0, 0.4, Math.PI / 2); s.mug.position.y = 0.3; const k = EZ.o3(trE(tq0 + 0.02 + T, tq0 + 0.25 + T, t)); s.puddle.visible = true; s.puddle.position.set(X + 0.3, 0.03, Z + 0.2); s.puddle.scale.setScalar(0.2 + 1.5 * k);
        s.drops.forEach((m, i) => { const dd = t - (tq0 + 0.02 + T), a = i / s.drops.length * TAU + 0.3; m.visible = dd < 0.42; if (!m.visible) return; const r = 2.6 * dd + 0.2, vy = 4.5 + (i % 3); m.position.set(X + Math.cos(a) * r, Math.max(0.05, 0.2 + vy * dd - 40 * dd * dd), Z + Math.sin(a) * r * 0.6); }); } } }
  // ---- TRmara: on the phone (handset at her ear), looks up on "slides", keeps talking
  { const x = 10.6, z = 33.9, ex = [[0, 'talk'], [slides + 0.04, 'surprised'], [five, 'shock'], [38.2, 'talk'], [40.4, 'worried']];
    pose(s, 'TRmara', t, x, z, { facing: trFace(cam, x, z, [[0, -0.7], [slides + 0.04, [x - 14, 0]], [38.2, -0.5], [39.1, [-29, 0]], [40.6, -0.6]], t), expr: ex, talk: (t < slides || (t > 38.2 && t < 39.1) || t > 40.6) ? 0.7 : 0,
      gaze: t > slides && t < 38.2 ? [-0.4, -0.7] : [0, 0], hand: { L: { h: [-0.1, -0.12], pole: [0.6, 1], front: false, hand: 'grip' }, R: [[0, 'hip'], [slides + 0.04, 'up'], [38.2, 'talk'], [39.4, 'hip']] }, squash: trJolt(t, slides + 0.04, 0.25) });
    gripProp(s, s.handset, 'TRmara', 'L', V3(0, 0, 0), { behind: 0.1, rz: 0.35 }); }
  // ---- TRraj: eyes on his screens, snaps round on "slides", hands on head
  { const x = -6.5, z = 33.6; pose(s, 'TRraj', t, x, z, { facing: trFace(cam, x, z, [[0, [x - 3, 29]], [slides + 0.08, [-14, 0]], [38.6, [x + 6, z + 6]], [39.1, [-29, 0]]], t), expr: [[0, 'thinking'], [slides + 0.08, 'shock'], [38.0, 'nervous']],
    gaze: t > slides && t < 38.6 ? [-0.3, -0.75] : [0.3, 0.3], hand: { L: [[0, 'desk'], [slides + 0.08, 'up'], [37.5, { h: [0.08, -0.62], pole: [1, 0.6], hand: 'open' }]], R: [[0, 'desk'], [slides + 0.08, 'up'], [37.5, { h: [0.08, -0.62], pole: [1, 0.6], hand: 'open' }]] }, squash: trJolt(t, slides + 0.08, 0.3) }); }
  // ---- TRdev: tall, coffee-less; leans on his desk, straightens on "slides"
  { const x = 16.5, z = 33.6; pose(s, 'TRdev', t, x, z, { facing: trFace(cam, x, z, [[0, [x - 4, 29]], [slides + 0.12, [-4, 0]], [39.1, [-29, 0]]], t), expr: [[0, 'bored'], [slides + 0.12, 'surprised'], [five, 'shock'], [38.4, 'sad']],
    gaze: t > slides ? [-0.2, -0.7] : [0, 0.4], hand: { L: [[0, 'desk'], [slides + 0.12, 'down'], [five, 'chin']], R: [[0, 'desk'], [slides + 0.12, 'down']] }, lean: trK([[0, 0.12], [slides + 0.12, -0.05], [slides + 0.4, 0]], t, 0.1) }); }
  // ---- TRyuki: R1 far side (faces the camera over her screens), points up at the ticker
  { const x = -16.5, z = 26.2; pose(s, 'TRyuki', t, x, z, { facing: trFace(cam, x, z, [[0, [x, 31]], [slides + 0.1, [-10, 0]], [39.06, [-29, 0]], [40.4, [x, 31]]], t), expr: [[0, 'neutral'], [slides + 0.1, 'surprised'], [39.06, 'shock'], [40.4, 'worried']],
    gaze: t > slides && t < 40.4 ? [0, -0.6] : [0, 0.3], hand: { R: [[0, 'desk'], [slides + 0.1, 'point'], [38.3, 'chin'], [40.4, 'desk']], L: [[0, 'desk'], [slides + 0.1, 'hip'], [40.4, 'desk']] } }); }
  // ---- TRgus: at the island under the windows, on the phone; the intern crashing through the window; watches the cart
  { const x = 31, z = 11.6, ex = [[0, 'talk'], [39.06, 'skeptical'], [40.2, 'talk'], [TR_G.glass, 'shock'], [52.2, 'skeptical'], [54.3, 'surprised']];
    pose(s, 'TRgus', t, x, z, { facing: trFace(cam, x, z, [[0, [x + 4, 8]], [TR_G.lip, [22, 2]], [TR_G.glass + 0.3, [23, -6]], [51.9, [40, 16]], [52.6, 0.8]], t), expr: ex, talk: t < 39.06 || (t > 40.2 && t < TR_G.glass) ? 0.6 : 0,
      gaze: t > TR_G.lip && t < 51.9 ? [-0.5, -0.4] : [0, 0], hand: { L: [[0, { h: [-0.1, -0.12], pole: [0.6, 1], front: false, hand: 'grip' }], [TR_G.glass, 'up'], [52.0, 'hip']], R: [[0, 'hip'], [TR_G.glass, 'up'], [52.0, 'cross2']] },
      squash: trJolt(t, TR_G.glass, 0.4), lean: -trJolt(t, TR_G.glass, 0.12) });
    if (t < TR_G.glass) gripProp(s, s.handset, 'TRgus', 'L', V3(0, 0, 0), { behind: 0.1, rz: 0.35 }); }
  // ---- TRlena: holds the org chart; raises it on "who", the arrow draws on "to"; walks back to her desk after
  { const W0 = TR_LENA0, W1 = TR_LENA1, P = trPath([[45.1, W0[0], W0[1]], [46.9, W1[0], W1[1]]], t), up = t >= 43.48 && t < 44.95;
    const fac = P.moving ? faceTo(cam, P.x, P.z, P.x + P.vx, P.z + P.vz) : trFace(cam, P.x, P.z, [[0, [-8, 0]], [43.48, 0.15], [46.9, [W1[0] + 2, 31]]], t);
    pose(s, 'TRlena', t, P.x, P.z, { facing: fac, mode: P.moving ? 'walk' : 'stand', phase: P.dist / 4.0, stride: 4.0, stop: trE(46.5, 46.9, t), expr: [[0, 'neutral'], [43.48, 'determined'], [44.12, 'skeptical'], [44.95, 'neutral']],
      hand: { L: [[0, { h: [0.14, 0.62], pole: [1, 0.4], front: true, hand: 'grip' }], [43.48, { h: [0.24, 0.4], pole: [1, 0.5], front: true, hand: 'grip' }], [44.95, { h: [0.14, 0.62], pole: [1, 0.4], front: true, hand: 'grip' }]],
        R: [[0, { h: [0.14, 0.62], pole: [1, 0.4], front: true, hand: 'grip' }], [43.48, { h: [0.24, 0.4], pole: [1, 0.5], front: true, hand: 'grip' }], [44.95, { h: [0.14, 0.62], pole: [1, 0.4], front: true, hand: 'grip' }]] }, gaze: up ? [0.2, 0.1] : [0, 0.3] });
    const H = trHands(s, 'TRlena'); if (H) { const a = t < 44.12 ? 0 : Math.min(1, (t - 44.12) / 0.32); redraw(s.orgC, 'a' + Math.round(a * 24), (g, w, h) => trDrawOrg(g, w, h, a));
      const toCam = cam.position.clone().sub(H.mid); toCam.y = 0; toCam.normalize(); s.org.visible = true; s.org.position.copy(H.mid).addScaledVector(toCam, 0.35); s.org.position.y += 0.95;
      s.org.rotation.set(-0.06, Math.atan2(toCam.x, toCam.z), 0); trDot(s, 'TRlena', 'L'); trDot(s, 'TRlena', 'R'); } }
  // ---- the intern
  trInternFrame(s, cam, t);
  // ---- s18: the cart rolls in through the door, pushed by TRomar; the cutout of Huang rides in it with a box of chips
  { const t0 = 50.5, x = 48 - 4.6 * Math.max(0, t - t0), z = TR_CART_Z, walking = t > t0 && t < 55.7;
    pose(s, 'TRomar', t, x, z, { facing: faceTo(cam, x, z, x - 1, z), mode: walking ? 'walk' : 'stand', phase: (48 - x) / 3.8, stride: 3.8, expr: [[0, 'happy'], [52.36, 'grin'], [54.28, 'smug']],
      hand: { L: { h: [-0.12, 0.42], pole: [1, 0.5], front: true, hand: 'grip' }, R: { h: [-0.12, 0.42], pole: [1, 0.5], front: true, hand: 'grip' } }, gaze: [0.3, 0] });
    const H = trHands(s, 'TRomar'), cx = (H ? H.mid.x : x - 1.2) - 2.9; s.cart.visible = true; s.cart.position.set(cx, 0, z); s.cart.rotation.y = Math.PI;
    s.cart.userData.wheels.forEach((w) => (w.rotation.y = (48 - x) / 0.34)); s.tagPiv.rotation.set(0.06 * Math.sin(t * 5.1), 0, 0.12 * Math.sin(t * 3.7 + 0.5));
    s.cutout.rotation.z = 0.025 * Math.sin(t * 7.3); }   // no grip dots: from this side his hands are behind the cutout / the wire
  // ---- the window: pane 1 breaks when the intern goes through; shards fly with him
  s.pane1.material = t >= TR_G.glass ? s.glassB : s.glassA;
  s.shards.forEach((q) => { const d = t - TR_G.glass; q.m.visible = d >= 0 && d < 1.2; if (!q.m.visible) return; q.m.position.set(q.x + q.vx * d, Math.max(q.vz > 0 ? 0.05 : -8, q.y + q.vy * d - 22 * d * d), 0.02 + q.vz * d); q.m.rotation.set(q.sp[0] * d, q.sp[1] * d, q.sp[2] * d); });
  c3Render(s.scene, cam, { bg: '#16204a', bgBlur: 1.2, glow: 0.35, glowBlur: 12 });
}
// the intern: stares at the chart, deadpan line to camera, grabs the skis, leaps onto the chart line, slaloms down it and
// flies out of the window (G2)
function trInternFrame(s, cam, t) {
  const G = TR_G, I = trInternPos(s, t); if (t >= G.out) { s.skis.visible = false; return; }
  const talking = (t > 48.38 && t < 48.6) || (t > 48.64 && t < 50.16), ph = I.ph;
  let o;
  if (ph === 'stand') {
    const squat = t > G.squat ? EZ.o2(trE(G.squat, G.jump, t)) : 0;
    o = { facing: trFace(cam, I.x, I.z, [[0, [-4, 0]], [37.0, [4, 0]], [38.0, [-6, 0]], [39.06, [-29, 0]], [40.5, [-5, 0]], [46.98, [-6.5, 0]], [48.04, 0.25], [49.66, [-2, 0]], [50.12, [-11, 7.6]], [G.hold, 0.9]], t),
      expr: [[0, 'deadpan'], [37.24, 'bored'], [39.06, 'deadpan'], [46.98, 'skeptical'], [48.04, 'deadpan'], [G.reach, 'determined'], [G.squat, 'deadpan']], talk: talking ? 0.6 : 0,
      gaze: t > 46.98 && t < 48.04 ? [0, -0.5] : t > 49.66 && t < G.reach ? [0.5, -0.3] : [0, 0],
      hand: { L: [[0, 'pocket'], [48.38, 'pocket'], [G.reach, { h: [0.42, 0.62], pole: [1, 0.2], hand: 'grip' }], [G.hold, { h: [-0.28, 0.24], pole: [1, 0.5], front: true, hand: 'grip' }]],
        R: [[0, 'pocket'], [49.66, { h: [0.66, -0.1], pole: [0.4, 1], hand: 'point' }], [G.reach, { h: [0.42, 0.5], pole: [1, 0.2], hand: 'grip' }], [G.hold, { h: [-0.3, 0.5], pole: [1, 0.5], front: true, hand: 'grip' }], [G.squat + 0.04, { h: [0.5, 0.3], pole: [0.6, 1], hand: 'open' }]] },
      squash: 0.42 * squat, lean: 0.06 * squat };
  } else if (ph === 'leap') { o = { facing: trFace(cam, I.x, I.z, [[0, [I.x + 4, I.z - 4]]], t), expr: 'deadpan', hand: { L: 'up', R: 'up' }, squash: -0.3 * Math.sin(Math.PI * I.u), alive: 0 }; }
  else if (ph === 'ride') { const turn = I.slv; o = { facing: trFace(cam, I.x, I.z, [[0, [I.x + 10 * I.d.x, I.z + 6 * turn]]], t), expr: 'deadpan', alive: 0, lean: 0.13 * turn + 0.05,
      hand: { L: { h: [0.62, 0.12 - 0.12 * turn], pole: [0.5, 1], hand: 'open' }, R: { h: [0.62, 0.12 + 0.12 * turn], pole: [0.5, 1], hand: 'open' } }, squash: trJolt(t, G.land, 0.4, 0.3) + 0.12 * Math.abs(turn) };
  } else { o = { facing: trFace(cam, I.x, I.z, [[0, [I.x + 6, I.z - 6]]], t), expr: 'deadpan', alive: 0, hand: { L: 'up', R: 'up' }, lean: -0.12, squash: ph === 'fly' ? -0.15 : 0 }; }
  pose(s, 'intern', t, I.x, I.z, Object.assign({ y: I.y }, o));
  // the skis: leaning on his desk -> in his hands -> under his feet (no pops: every change is a blend)
  const restP = { p: V3(TR_IDESK[0] + 2.85, 2.55, TR_IDESK[1] + 0.2), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.25, Math.PI / 2 - 0.22)) };
  const handP = () => { const H = trHands(s, 'intern'); if (!H) return restP; const toCam = cam.position.clone().sub(H.mid).normalize(); return { p: H.mid.clone().addScaledVector(toCam, 0.3), q: trFrameQ(V3(0, 1, 0), toCam) }; };
  const feetP = () => { const d = I.d.clone(); if (I.ph === 'ride') d.applyAxisAngle(V3(0, 1, 0), -0.35 * (I.slv || 0)); const up = V3(0, 1, 0).applyAxisAngle(d.clone().normalize(), I.ph === 'ride' ? 0.18 * (I.slv || 0) : 0); return { p: V3(I.x, I.y + 0.12, I.z), q: trFrameQ(d.y > 0.6 ? V3(d.x, 0.6, d.z) : d, up) }; };
  let P; if (t < G.reach) P = restP; else if (t < G.hold) P = trBlendPose(restP, handP(), EZ.io(trE(G.reach, G.hold, t))); else if (t < G.squat) P = handP(); else if (t < G.jump + 0.04) P = trBlendPose(handP(), feetP(), EZ.io(trE(G.squat, G.jump + 0.04, t))); else P = feetP();
  trApply(s.skis, P);
  if (t >= G.hold - 0.04 && t < G.squat + 0.02) { trDot(s, 'intern', 'L'); trDot(s, 'intern', 'R'); }
}
for (const id of ['s13', 's14', 's15', 's16', 's17', 'g2', 's18']) { SHOT_FN[id] = (t) => trFrame(t); SNAPS[id] = 'free'; }
