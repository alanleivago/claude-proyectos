
// =====================================================================
//  OVERLAYS — the orange ring (the edge, with YOU in the middle), the HUD counters (countdown, distance from home,
//  age of the universe around you, sky temperature, the rewinding time), title, captions, the cracks, the end card
// =====================================================================
const ORANGE = '#f08a3a';
function ringIcon(x, y, s, a = 1) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.strokeStyle = ORANGE; ctx.lineWidth = 7; ctx.shadowColor = 'rgba(240,138,58,0.7)'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill(); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }
// the diagram at the top: the edge (13.8 billion years ago), an inner ring (10 billion), YOU in the middle
function edgeDiagram(t) { if (t >= 73 || (t >= 62 && t < 67)) return; const a = Math.min(1, ev(0.2, 0.6)) * (1 - ev(72.4, 0.5)), big = t < 8 || t >= 70 ? 1 : 0, cx = CX, cy = big ? 250 : 175, r = big ? 105 : 48;
  const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; if (big) { pvGlow(cx, cy, 260, 'rgba(0,0,0,0.25)', 1); } ctx.strokeStyle = ORANGE; ctx.lineWidth = big ? 7 : 5; ctx.shadowColor = 'rgba(240,138,58,0.8)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.shadowBlur = 0;
    if (big) { ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r * 0.48, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx + r * 0.48, cy); ctx.lineTo(cx + r * 1.15, cy); ctx.stroke(); }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, big ? 7 : 5, 0, TAU); ctx.fill(); ctx.restore();
    if (big) { pvText('THE EDGE · 13.8 BILLION YEARS AGO', cx, cy - r - 22, 20, { font: PV.sans, weight: 700, spacing: 3, align: 'center', alpha: a }); pvText('YOU', cx, cy + 34, 20, { font: PV.sans, weight: 700, spacing: 2, align: 'center', alpha: a }); pvText('10 BILLION', cx + r * 1.2 + 70, cy - 4, 18, { font: PV.sans, weight: 700, align: 'center', alpha: a * 0.9 }); pvText('YEARS AGO', cx + r * 1.2 + 70, cy + 20, 18, { font: PV.sans, weight: 700, align: 'center', alpha: a * 0.9 }); } };
  if (DEFER) DEFER.push(f); else f(); }
const logK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) { const [a, va] = K[i], [b, vb] = K[i + 1]; if (t < b) { const u = (t - a) / (b - a); return Math.exp(Math.log(va) + (Math.log(vb) - Math.log(va)) * u); } } return K[K.length - 1][1]; };
const linK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) { const [a, va] = K[i], [b, vb] = K[i + 1]; if (t < b) return lerp(va, vb, (t - a) / (b - a)); } return K[K.length - 1][1]; };
const DIST = [[8.2, 1.5e-7], [9.3, 1.1e-4], [10, 33.5], [11, 733.8], [12, 4429], [13, 14299], [14, 43002], [15, 99597], [16, 213401], [17, 420729], [18, 803797], [19, 1.626e6], [20, 3.79e6], [21, 1.03e7], [22, 3.17e7], [23, 1.148e8], [24, 5.38e8], [25, 1.505e9], [26, 3.42e9], [27, 6.67e9], [28, 1.014e10]];
const AGE = [[28.5, 5.06e9], [30, 3.65e9], [31, 2.58e9], [32, 1.82e9], [33, 1.3e9], [34, 9.1e8], [35, 6.06e8], [36, 3.5e8], [37, 1.8e8], [38, 1.37e8], [39, 1.12e8], [40, 8.7e7], [41, 6.5e7], [42, 4.7e7], [43, 3.0e7]];
const TEMP = [[43, -88], [44, -24], [45, 9], [46, 39], [47, 98], [48, 147], [49, 194], [50, 232], [51, 255], [52, 273], [53, 299], [54, 361], [55, 464], [56, 579], [57, 708], [58, 869], [59, 1085], [60, 1420], [61, 1892], [62, 2472]];
const fmtI = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function hud(t) { if (t >= 73 || (t >= 62 && t < 67)) return; const a = ev(0.2, 0.5) * (1 - ev(72.4, 0.5)); let label, val, sub;
  if (t < 8 || t >= 70) { const c = t < 8 ? 8 - t : 7.833 - (t - 70); label = 'The Earth leaves the universe in'; val = '0:0' + c.toFixed(3); sub = 'the edge is 46 billion light-years away'; }
  else if (t < 28.5) { const d = logK(DIST, t); label = 'Distance from home'; val = d < 0.5 ? fmtI(d * 5.879e12) + ' miles' : (d < 100 ? d.toFixed(1) : fmtI(d)) + ' light-years'; sub = t < 20 ? 'time runs 12× slower' : t < 24 ? 'every dot is a galaxy' : 'the farther, the older the light'; }
  else if (t < 43) { label = 'Age of the universe around you'; val = fmtI(logK(AGE, t)) + ' years'; sub = t < 30 ? "you're seeing its past" : t < 37 ? 'quasars: the brightest things there are' : t < 40 ? 'the first stars' : 'the dark ages: no stars yet'; }
  else if (t < 62) { label = 'Sky temperature'; const tF = linK(TEMP, t) * 9 / 5 + 32; val = fmtI(tF).replace(/^-?/, (m) => (tF < 0 ? '−' : '')) + ' °F'; sub = t < 46 ? 'still invisible: all infrared' : t < 48 ? 'water boils' : t < 50 ? 'paper burns' : t < 52 ? 'wood burns' : 'everything starts to glow'; }
  else { const k = EZ.i2(seg(t, 67, 70)); label = 'Time'; val = (lerp(4.455, 0.083, k)).toFixed(3) + ' s'; sub = 'someone out there hit rewind'; }
  ringIcon(104, 735, 44, a); pvHud(label, val, sub, a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(110, Math.floor(100 * 760 / wmax)), lh = size * 1.12, y0 = 520;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
// cracks: radial lines from the ring at the top and from two points low in the frame (the rewind broke something)
function cracks(t) { const k = t < 70 ? ss(67.2, 68.0, t) : 1; if (k <= 0) return; ctx.save(); screen(); ctx.strokeStyle = `rgba(255,255,255,${0.75 * k * (t >= 72 ? 1 - ss(72, 73, t) : 1)})`; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.shadowBlur = 5;
  [[CX, 200, 16, 520], [300, 1640, 12, 300], [820, 1700, 11, 260]].forEach(([cx, cy, n, L0], j) => { const R = RNG('crk' + j); for (let i = 0; i < n; i++) { let a = i / n * TAU + R.n(0.15), x = cx, y = cy; ctx.lineWidth = R.r(1.2, 3); ctx.beginPath(); ctx.moveTo(x, y); const L = R.r(0.4, 1) * L0 * k; for (let s = 0; s < 8; s++) { a += R.n(0.2); x += Math.cos(a) * L / 8; y += Math.sin(a) * L / 8; ctx.lineTo(x, y); } ctx.stroke(); } }); ctx.restore(); }
function endCard() { const a = ev(73.3, 0.6), b = ev(74.1, 0.7), c = ev(75.0, 0.7), g = ev(76.4, 0.7), h = ev(77.6, 0.6), e = ev(78.4, 0.5);
  const f = () => { fillAll('#121212'); pvText('What if the Earth left the', CX, 560, 48, { align: 'center', alpha: a }); pvText('universe for 5 seconds?', CX, 624, 48, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' }; pvText('1964 · THE OLDEST LIGHT IN THE UNIVERSE', CX, 790, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('WAS FIRST BLAMED ON SOME PIGEONS', CX, 830, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('2012 · PHYSICISTS PROPOSED A TEST: IF', CX, 910, 23, Object.assign({ alpha: c * 0.85 }, mono)); pvText('WE LIVE IN A SIMULATION, COSMIC RAYS', CX, 950, 23, Object.assign({ alpha: c * 0.85 }, mono)); pvText('WOULD GIVE AWAY ITS GRID', CX, 990, 23, Object.assign({ alpha: c * 0.85 }, mono));
    pvText('But relax, this will never happen…', CX, 1170, 42, { italic: true, align: 'center', alpha: g }); pvText('… or will it?', CX, 1250, 60, { italic: true, align: 'center', alpha: h, color: '#f2d38a' }); pvText('ALTERBASE', CX, 1480, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  ringIcon(CX, 440, 70, a); if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 8 && t < 8.3) pvTint('#ffffff', 0.6 * (1 - seg(t, 8, 8.3)));
  if (t >= 61.6 && t < 62.4) pvTint('#ffffff', ss(61.6, 61.9, t) * (1 - ss(62.0, 62.4, t)));
  if (t >= 67 && t < 67.25) pvTint('#ffffff', 0.7 * (1 - seg(t, 67, 67.25)));
  if (t >= 72 && t < 73) pvTint('#000000', ss(72, 73, t));
  if (t >= 73) endCard();
  if (typeof spaceOverlay === 'function') spaceOverlay(t);
  if (t >= 67 && t < 73) cracks(t);
  edgeDiagram(t); hud(t);
  bigTitle(['What if the Earth', 'left the universe', 'for 5 seconds?'], 0.3, 4.6);
  capFit("You've just left the Sun's light behind.", 8.6, 12.8);
  capFit('Every star you know is behind you.', 13.2, 15.6);
  capFit("That's the Milky Way. Seen from outside.", 16.0, 19.8);
  capFit('Every dot is a galaxy.', 20.2, 23.8);
  capFit('The farther you go, the older the light.', 24.3, 29.8);
  capFit('This light left before the Earth existed.', 30.6, 36.6);
  capFit('The first stars. Then, none.', 37.4, 39.8);
  capFit("The edge isn't a place. It's a moment.", 40.4, 45.8);
  capFit('The heat arrives before the light.', 46.2, 47.9);
  capFit('At around 451 °F, paper burns.', 48.2, 49.9);
  capFit('Then, the trees.', 50.2, 51.9);
  capFit('That glow is the edge of the universe.', 52.3, 55.9);
  capFit('Nobody is running anymore.', 56.3, 59.9);
  capFit("No one has ever seen what's beyond it.", 60.2, 61.6);
  capFit('Someone out there hit rewind.', 67.3, 69.9);
}
