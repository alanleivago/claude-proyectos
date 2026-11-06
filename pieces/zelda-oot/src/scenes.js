// =====================================================================
//  SCENES — zelda-oot (tapestry, Flow layers, 16:9). A hanging woven cloth: the figured bands (assets/bg.jpg) are fixed;
//  between them one long strip slides right panel to panel. Open panels sit on the woven roots ground (assets/roots.jpg)
//  and move together; full-set panels (FULL_SET) slide in over the previous one, opaque, with a soft shadow on the edge.
//  Over everything: the warp/weft grain (assets/weave.png, soft-light) and a gentle hanging sway (top pinned).
//  Figures are zelda-fairy v4 woven layers (tools/weave.py presses the weave in + thin cream thread edge).
// =====================================================================
const BAND_H = 112, FY0 = BAND_H, FY1 = 1080 - BAND_H, FL = 902, SLIDE = 0.9, SLIDE_PAR = 0.3;
const at = (t, d = 0.6) => EZ.io(clamp((TT - t) / d));
const LT = (id) => VL(id).t0, LE = (id) => VL(id).t1;
function stripPos() { let p = 0; for (let i = 1; i < TB.length; i++) p += EZ.io(clamp((TT - (TB[i] - SLIDE / 2)) / SLIDE)); return p; }
const IMG = (n) => asset(n + '.webp');
const nat = (n) => { const im = IMG(n); return im ? [im.naturalWidth, im.naturalHeight] : [100, 100]; };
const wOf = (n, h) => { const [w, hh] = nat(n); return h * w / hh; };

// a figure: feet at (x, y), height h; breathes and sways; a soft shadow grounds it
function fig(n, x, y, h, o = {}) {
  const im = IMG(n); if (!im || (o.a ?? 1) <= 0.003) return;
  const w = h * im.naturalWidth / im.naturalHeight, br = o.breathe === false ? 0 : 0.01 * Math.sin(TT * 1.8 + x * 0.013);
  if (o.shadow !== false) { ctx.save(); ctx.globalAlpha *= (o.a ?? 1) * 0.28; ctx.fillStyle = '#2a2410'; ctx.beginPath(); ctx.ellipse(x, y - 3, w * 0.34, 10, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (o.filter) ctx.filter = o.filter; ctx.translate(x, y); ctx.rotate((o.rot ?? 0) + (o.sway ?? 0.006) * Math.sin(TT * 1.3 + x * 0.01));
  ctx.scale((o.flip ? -1 : 1) * (1 - br * 0.5), 1 + br); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
}
// a centred layer (props): centre (x, y), width w
function prop(n, x, y, w, o = {}) {
  const im = IMG(n); if (!im || (o.a ?? 1) <= 0.003) return; const h = w * im.naturalHeight / im.naturalWidth;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (o.filter) ctx.filter = o.filter; ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(o.flip ? -1 : 1, o.sy ?? 1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
function walk(x0, x1, t0, d, rate = 6.5, bob = 10) { const u = EZ.io(clamp((TT - t0) / d)), mv = TT > t0 && TT < t0 + d ? Math.sin(Math.PI * clamp((TT - t0) / d)) : 0; return { x: lerp(x0, x1, u), dy: -Math.abs(Math.sin(TT * rate)) * bob * mv, rot: 0.03 * Math.sin(TT * rate) * mv }; }
function glow(x, y, r, c, a, op = 'lighter') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = op; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
// a woven set cut into layers (tools/make_layers3.py): each layer keeps its place from the Flow set (box in 1920x824 field
// coords), drawn at the field's scale. depth 0 = the plate (moves with the cloth), 1 = foreground: while the panel slides in,
// nearer layers lag a little behind (parallax), and they follow the camera drift more. o.rot sways about a pivot (box fractions).
const LS = (1080 - 2 * 112) / 824, LX0 = (1920 - 1920 * LS) / 2;
let PX = 0, CAMDX = 0;
function lay(name, box, depth, o = {}) {
  const im = asset(name); if (!im) return; const [bx, by, bw, bh] = box, x = LX0 + bx * LS + PX * depth * 0.06 + CAMDX * depth * 1.4 + (o.dx ?? 0), y = FY0 + by * LS + (o.dy ?? 0), w = bw * LS * (o.sx ?? 1), h = bh * LS;
  ctx.save(); if (o.a != null) ctx.globalAlpha *= o.a; const [px, py] = o.pivot ?? [0.5, 1]; ctx.translate(x + px * bw * LS, y + py * h); ctx.rotate(o.rot ?? 0); ctx.scale(o.sc ?? 1, o.sc ?? 1);
  ctx.drawImage(im, -px * bw * LS - (w - bw * LS) / 2, -py * h, w, h); ctx.restore();
}
const plate = (name) => drawAsset(name, LX0, FY0, 1920 * LS, 824 * LS);
function set(name, o = {}) { ctx.save(); if (o.filter) ctx.filter = o.filter; drawAsset(name, 0, FY0, W, FY1 - FY0); ctx.restore(); }
// the open woven ground: swirling roots and branches (mirrored on odd panels so neighbours join seamlessly)
function rootsGround(i) { ctx.save(); if (i % 2) { ctx.translate(W, 0); ctx.scale(-1, 1); } drawAsset('roots.jpg', 0, FY0, W, FY1 - FY0); ctx.restore(); }

// a fairy: a ball of light with four fluttering woven wings and a little trail of sparks
const NAVI = '172,214,255';
function fairy(x, y, s = 1, k = 1, col = NAVI, key = 0) {
  if (k <= 0) return;
  glow(x, y, 90 * s, `rgba(${col},A)`, 0.55 * k);
  ctx.save(); ctx.globalAlpha *= k; ctx.translate(x, y); ctx.scale(s, s);
  const f = 0.55 + 0.45 * Math.abs(Math.sin(TT * 26 + key));
  ctx.fillStyle = 'rgba(255,250,232,0.88)'; ctx.strokeStyle = 'rgba(150,90,40,0.85)'; ctx.lineWidth = 2.2;
  for (const [sx, sy, rx, ry, rot] of [[-1, -1, 22, 10, -0.6], [1, -1, 22, 10, 0.6], [-1, 1, 13, 7, 0.5], [1, 1, 13, 7, -0.5]]) {
    ctx.save(); ctx.scale(1, f); ctx.beginPath(); ctx.ellipse(sx * rx * 0.9, sy * 8, rx, ry, rot * sx * sy, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(150,90,40,0.6)'; ctx.stroke(); ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(-3, -3, 5, 0, TAU); ctx.fill();
  ctx.restore();
}
function sparks(path, t, n, col, key = 0, k = 1) { if (k <= 0) return; for (let i = 1; i <= n; i++) { const [x, y] = path(t - i * 0.06), a = (1 - i / (n + 1)) * k; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x + 5 * Math.sin(i * 2.3 + key), y + 5 * Math.cos(i * 1.7), 4 * (1 - i / (n + 2)), 0, TAU); ctx.fill(); ctx.restore(); } }
// woven grass tufts on the floor line, swaying (muted thread greens)
function grass(x0, x1, y, key, n = 30) { ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const R = RNG('gr' + key, i), x = R.r(x0, x1), h = R.r(20, 40), sw = 6 * Math.sin(TT * 1.6 + x * 0.02); ctx.strokeStyle = ['#5f7027', '#7d8c36', '#4a5a1c'][i % 3]; ctx.lineWidth = 5;
  for (const d of [-9, 0, 9]) { ctx.beginPath(); ctx.moveTo(x + d, y); ctx.quadraticCurveTo(x + d * 1.4, y - h * 0.6, x + d * 1.8 + sw, y - h); ctx.stroke(); } } ctx.restore(); }
// falling woven leaves / drifting sand threads
const LEAF_C = ['#b98a3b', '#a5582f', '#7f8a3a', '#c9a24c'];
function leaves(x0, x1, y0, y1, n, key, k = 1, sp = 90) {
  for (let i = 0; i < n; i++) { const R = RNG('lf' + key, i), span = y1 - y0, y = y0 + mod(R.r(0, span) + TT * sp * R.r(0.7, 1.2), span), x = R.r(x0, x1) + 34 * Math.sin(TT * R.r(1, 2) + i), a = Math.min(1, (y - y0) / 60, (y1 - y) / 90) * k; if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(Math.sin(TT * 2.2 + i) * 0.9 + i); ctx.fillStyle = LEAF_C[i % 4]; ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 6, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.restore(); }
}
function sand(y0, y1, n, key, k = 1) {   // wind-blown woven sand threads, left to right
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const R = RNG('sd' + key, i), x = mod(R.r(0, W + 400) + TT * R.r(160, 280), W + 400) - 200, y = R.r(y0, y1) + 10 * Math.sin(TT * 2 + i), l = R.r(30, 80), a = k * R.r(0.35, 0.7) * Math.min(1, (x + 200) / 200, (W + 200 - x) / 200);
    if (a <= 0) continue; ctx.globalAlpha = a; ctx.strokeStyle = ['#e9c98a', '#d9a65c', '#f3e2b6'][i % 3]; ctx.lineWidth = R.r(3, 5); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - 8, x + l, y); ctx.stroke(); }
  ctx.restore();
}
// gold woven rays from a point
function rays(x, y, k, len = 420, n = 16, key = 0) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU + TT * 0.2 + key, l = len * (0.7 + 0.3 * Math.sin(i * 2.7 + TT * 2)) * EZ.o2(clamp(k)); ctx.strokeStyle = i % 2 ? '#e2b452' : '#f6e6b4'; ctx.lineWidth = i % 2 ? 9 : 5;
    ctx.setLineDash([12, 7]); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 60, y + Math.sin(a) * 60); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); } ctx.restore(); glow(x, y, len * 0.8, 'rgba(255,230,160,A)', 0.45 * clamp(k)); }

// ---- the chapter card: a woven, embroidered scroll (Flow: scroll_l / scroll_m / scroll_r) drops in rolled up, unrolls from the
// centre (the two rolls travel out, turning), the title (Georgia caps, rust) stitches in letter by letter; at tOut it rolls up and lifts away
function scrollCard(str, x, y, t0, tOut) {
  if (TT < t0) return;
  const SH = 300, imL = IMG('scroll_l'), imM = IMG('scroll_m'), imR = IMG('scroll_r'); if (!imL || !imM || !imR) return;
  const sc = SH / imM.naturalHeight, mw = imM.naturalWidth * sc, lw = imL.naturalWidth * sc, rw = imR.naturalWidth * sc;
  const drop = EZ.o3(clamp((TT - t0) / 0.45)), open = EZ.io(clamp((TT - t0 - 0.35) / 0.9)) * (1 - EZ.io(clamp((TT - tOut) / 0.6))), lift = EZ.i2(clamp((TT - tOut - 0.5) / 0.5));
  const a = drop * (1 - lift); if (a <= 0) return;
  const yy = y - 60 * (1 - drop) - 120 * lift + 4 * Math.sin(TT * 1.3), hw = Math.max(6, open * mw / 2), top = yy - SH / 2;
  ctx.save(); ctx.globalAlpha *= a;
  // soft shadow on the cloth behind it
  ctx.save(); ctx.globalAlpha *= 0.35; ctx.fillStyle = '#1e1408'; ctx.filter = 'blur(10px)'; ctx.fillRect(x - hw - lw * 0.6, top + 18, 2 * hw + lw * 1.2, SH * 0.92); ctx.restore();
  // the cloth, revealed from the centre: its pattern stays put while the rolls travel over it
  ctx.save(); ctx.beginPath(); ctx.rect(x - hw, top - 10, 2 * hw, SH + 40); ctx.clip(); ctx.drawImage(imM, x - mw / 2, top, mw, SH);
  // the title stitches in once the scroll is mostly open
  ctx.letterSpacing = '4px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = 'bold 54px Georgia, "Times New Roman", serif';
  const fs = Math.min(54, 54 * mw * 0.74 / ctx.measureText(str).width); ctx.font = `bold ${fs.toFixed(1)}px Georgia, "Times New Roman", serif`;   // fits inside the vine border
  const tw = ctx.measureText(str).width; let cx = x - tw / 2; const ts = t0 + 0.9;
  [...str].forEach((ch, i) => { const k = clamp((TT - ts - i * 0.035) / 0.18); const cw = ctx.measureText(ch).width; if (k > 0) { ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = 'rgba(60,30,10,0.25)'; ctx.fillText(ch, cx + 2, yy + 6 + 5 * (1 - k)); ctx.fillStyle = '#8a2f16'; ctx.fillText(ch, cx, yy + 4 + 5 * (1 - k)); ctx.restore(); } cx += cw; });
  ctx.restore();
  // the rolls: they sit on the open edges and turn a little as they go (a squash on the roll's own width)
  const turn = 0.94 + 0.06 * Math.cos(open * 14);
  ctx.save(); ctx.translate(x - hw, 0); ctx.scale(turn, 1); ctx.drawImage(imL, -lw * 0.92, top, lw, SH); ctx.restore();
  ctx.save(); ctx.translate(x + hw, 0); ctx.scale(turn, 1); ctx.drawImage(imR, -rw * 0.08, top, rw, SH); ctx.restore();
  ctx.restore();
}

// ---- captions: the zelda-fairy v4 treatment (cream Georgia bold, brown stitched edge), small, low, just above the bottom band
const CAP_Y = FY1 - 30, CAP_SIZE = 36;
function chunks(L) {
  const ws = L.text.split(/\s+/).map((w, j) => ({ w, t: L.words[j] ? L.words[j].t0 : L.t0 })), parts = [[]];
  ws.forEach((it, j) => { parts[parts.length - 1].push(it); if (/[,.?:]$/.test(it.w) && j < ws.length - 1) parts.push([]); });
  const merged = []; for (const pt of parts) { const last = merged[merged.length - 1]; if (last && (pt.length < 3 || last.length < 3) && last.length + pt.length <= 10) last.push(...pt); else merged.push([...pt]); }
  return merged.flatMap((pt) => { const n = Math.ceil(pt.length / 9), size = Math.ceil(pt.length / n), out = []; for (let i = 0; i < pt.length; i += size) out.push(pt.slice(i, i + size)); return out; });
}
const CAPS = {};
function panelCaption(i) {
  const id = IDS[i], panelAt = (t) => { let k = 0; for (let j = 0; j < TB.length; j++) if (t >= TB[j] - 0.3) k = j; return k; }, list = CAPS[id] || (CAPS[id] = VOICE.lines.flatMap((L) => chunks(L)).filter((ch) => panelAt(ch[0].t) === i));
  for (let c = 0; c < list.length; c++) {
    const ch = list[c], t0 = ch[0].t - 0.12, t1 = c + 1 < list.length ? list[c + 1][0].t - 0.12 : 1e9; if (TT < t0 || TT >= t1) continue;
    const fo = c + 1 < list.length ? 1 - clamp((TT - (t1 - 0.15)) / 0.15) : 1;
    ctx.save(); ctx.font = `bold ${CAP_SIZE}px Georgia, "Times New Roman", serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const sw = ctx.measureText(' ').width, ww = ch.map((it) => ctx.measureText(it.w).width), tot = ww.reduce((q, v) => q + v, 0) + sw * (ch.length - 1); let x = W / 2 - tot / 2;
    ch.forEach((it, j) => { const k = clamp((TT - it.t + 0.08) / 0.16) * fo; if (k > 0) { ctx.globalAlpha = k; const lift = 5 * (1 - EZ.o2(k));
      ctx.strokeStyle = 'rgba(30,18,6,0.35)'; ctx.lineWidth = 9; ctx.strokeText(it.w, x + 2, CAP_Y + lift + 3);
      ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 7; ctx.strokeText(it.w, x, CAP_Y + lift); ctx.fillStyle = '#fbf0d2'; ctx.fillText(it.w, x, CAP_Y + lift); }
      x += ww[j] + sw; });
    ctx.restore();
  }
}

// =====================================================================
//  the panels: every panel is a row of PLAN (head.html); drawSet + cast + fx render it (local coords, field y 112–968, floor FL)
// =====================================================================
const CH_BAND = [['p001', 'band_prologue.jpg'], ['p005', 'band_prologue.jpg'], ['p012', 'band_forest.jpg'], ['p024', 'band_desert.jpg'], ['p030', 'band_castle.jpg'],
  ['p034', 'band_stones.jpg', 'brightness(0.55) saturate(1.1)'], ['p044', 'band_riders.jpg'], ['p050', 'band_years.jpg'], ['p056', 'band_temples.jpg'], ['p062', 'band_shadow.jpg'],
  ['p071', 'band_tower.jpg'], ['p078', 'band_time.jpg']];
const BANDOF = (i) => { let b = CH_BAND[0]; for (const r of CH_BAND) if (IDS.indexOf(r[0]) <= i) b = r; return b; };
// ---- sets
const LDEPTH = (l) => Math.min(1, 0.35 + (l[3] * l[4]) / (1920 * 824) * 1.6);
function layerMotion(l, k) {   // a generic, gentle motion for a cut-out layer from its box: hanging, standing, side frames, or floating
  const [, x, y, w, h] = l, top = y <= 4, bot = y + h >= 815, ph = k * 1.7 + x * 0.003;
  if (top && bot) return { pivot: [x < 400 ? 0.2 : x + w > 1500 ? 0.8 : 0.5, 1], rot: 0.005 * Math.sin(TT * 0.8 + ph) };
  if (top) return { pivot: [0.5, 0], rot: 0.012 * Math.sin(TT * 0.9 + ph) };
  if (bot) return { pivot: [0.5, 1], rot: 0.006 * Math.sin(TT * 1.1 + ph) };
  return { pivot: [0.5, 0.5], dx: 14 * Math.sin(TT * 0.35 + ph), dy: 5 * Math.sin(TT * 0.7 + ph) };
}
function drawSet(name, i) {
  if (name === 'roots') { plate('ro_plate.jpg'); lay('ro_branches.webp', [0, 0, 1920, 824], 0.5, { pivot: [0.5, 0], rot: 0.004 * Math.sin(TT * 0.7), dx: 6 * Math.sin(TT * 0.55) }); grass(-40, W + 40, FL + 22, 'g' + i, 40); return; }
  if (name === 'desert') { plate('de_plate.jpg');
    lay('de_sun.webp', [720, 0, 495, 381], 0.2, { pivot: [0.5, 0.5], rot: TT * 0.05, sc: 1 + 0.015 * Math.sin(TT * 1.6) }); sand(420, 700, 12, 'df' + i, 0.6);
    lay('de_fort.webp', [945, 60, 975, 764], 0.45);
    lay('de_palms.webp', [0, 115, 541, 709], 0.8, { pivot: [0.35, 1], rot: 0.014 * Math.sin(TT * 1.1) + 0.006 * Math.sin(TT * 2.7) });
    lay('de_cacti.webp', [36, 507, 657, 317], 0.95, { pivot: [0.5, 1], rot: 0.004 * Math.sin(TT * 1.3 + 1) }); return; }
  if (name === 'hyrule') { const S2 = LAYERS.hyclouds; plate(S2.plate);
    S2.layers.forEach((l, k) => lay(l[0], l.slice(1), 0.3, { pivot: [0.5, 0.5], dx: 26 * Math.sin(TT * 0.18 + k * 1.3) + 8 * TT % 1 * 0, dy: 3 * Math.sin(TT * 0.6 + k) }));
    lay('hy_volcano.webp', [242, 64, 609, 369], 0.25);
    lay('hy_ring.webp', [262, 45, 477, 143], 0.3, { pivot: [0.5, 0.5], dx: 10 * Math.sin(TT * 0.4), dy: 4 * Math.sin(TT * 0.8), sx: 1 + 0.03 * Math.sin(TT * 0.9) });
    lay('hy_castle.webp', [529, 93, 733, 504], 0.45);
    lay('hy_tree_l.webp', [0, 0, 560, 824], 1, { pivot: [0.15, 1], rot: 0.006 * Math.sin(TT * 0.8) });
    lay('hy_tree_r.webp', [983, 0, 937, 824], 1, { pivot: [0.85, 1], rot: -0.006 * Math.sin(TT * 0.8 + 0.7) }); return; }
  const S2 = LAYERS[name]; if (!S2) return; plate(S2.plate);
  S2.layers.slice().reverse().forEach((l, k) => lay(l[0], l.slice(1), LDEPTH(l), layerMotion(l, k)));
}
// ---- figures
const ANAME = (n) => (asset('c_' + n + '.webp') ? 'c_' + n : n);
const HDEF = { 'kid-point': 400, 'kid-surprised': 400, 'hero-listen': 520, 'hero-sword': 520, 'hero-walk': 520, 'king-brood': 560, 'king-laugh': 560, 'girl-point': 380, 'queen-sorrow': 500, 'queen-magic': 500,
  'wrapped-harp': 500, 'rock-chief-proud': 560, 'water-princess-bossy': 440, 'guardian-point': 520, 'desert-chief-cross': 520, link: 400, link_up: 400, link_ocarina: 400, link_sword: 400, link_adult: 520, ganon: 560, 'kneeling-man': 400, 'dark-rider': 470, 'white-horse': 440, zelda: 380, 'zelda-adult': 500,
  'wrapped-stranger': 500, goddess: 530, nayru: 530, farore: 530, mido: 380, kokiri_girl: 380, deku: 740, gohma: 380, 'desert-guard': 520, 'desert-chief': 520, 'fire-witch': 250, 'ice-witch': 250,
  'old-king': 520, impa: 520, darunia: 560, 'giant-lizard': 400, 'fish-king': 500, 'water-princess': 440, 'jellyfish-parasite': 560, 'old-sage': 540, sprout: 260, 'fire-dragon': 420,
  'water-creature': 600, 'drumming-hands': 380, 'iron-knight': 560, 'ganon-beast': 690, redead: 460, 'lantern-ghost': 420, link_sleep: 230 };
// one identity per person, so a person shown in two panels in a row is never on screen twice during the slide
const lineT = (n) => VL(L_(n)).t0;
let FADE_WHO = null, FADE_K = 1;
let CAPTURE = false;
function castDraw(i, c) {
  const id = IDS[i], [n, x0, o] = c, t0 = BT0(id), t1 = BT1(id), h = o.h ?? HDEF[n] ?? 480;
  let a = 1, x = x0, y = o.y ?? FL, rot = 0, flip = !!o.flip, filter = null;
  if (o.from) a *= at(lineT(o.from) - 0.3, 0.7);
  if (o.to) a *= 1 - at(lineT(o.to) - 0.2, 0.6);
  if (o.vanish) a *= 1 - at(lineT(o.vanish) + 0.6, 1.2);
  if (!CAPTURE && FADE_WHO && FADE_WHO.has(WHO(n))) return;
  if (a <= 0.003) return CAPTURE ? { a: 0 } : undefined;
  if (o.enter) { const w = walk(o.enter === 'L' ? -300 : W + 300, x0, t0 + 0.2, 2.2); x = w.x; y += w.dy; rot = w.rot; }
  if (o.walk) { const d = Math.min(6, (t1 - t0) * 0.6), w = walk(o.walk[0], o.walk[1], t0 + 0.5, d); x = w.x; y += w.dy; rot = w.rot; if (o.flipWalk) flip = true; }
  if (o.walkOut) { const tw = VL(L_(o.walkOut)).t1 - 0.6, w = walk(x0, W + 300, tw, 2.6); if (TT > tw) { x = w.x; y += w.dy; rot = w.rot; flip = false; } }
  if (o.gallop) { const tg = lineT(o.at) - 0.4, u = clamp((TT - tg) / (o.leave ? 2.2 : 3.2)); if (TT < tg) return CAPTURE ? { a: 0 } : undefined; x = lerp(o.gallop[0], o.gallop[1], EZ.o2(u)); y -= Math.abs(Math.sin(TT * 9)) * 16 * (1 - u * 0.7);
    if (o.leave) { const tl = lineT(o.leave), v = clamp((TT - tl) / 2.2); if (v > 0) x = lerp(o.gallop[1], -600, EZ.i2(v)); } }
  if (o.fly) { y = FL - 330 + 26 * Math.sin(TT * 1.6 + x0 * 0.01); rot = 0.05 * Math.sin(TT * 1.2 + x0); }
  if (o.float) y -= 30 + 14 * Math.sin(TT * 1.3);
  if (o.hang) y = FY0 + h - 10 + 10 * Math.sin(TT * 1.4);
  if (o.dance) { y -= Math.abs(Math.sin(TT * 5)) * 22; rot = 0.06 * Math.sin(TT * 5); }
  if (o.levitate) y -= 70 + 20 * Math.sin(TT * 1.2);
  if (o.shamble) { const w = walk(x0, x0 - 260, t0 + 0.6, Math.max(2, t1 - t0 - 1), 2.2, 4); x = w.x; rot = 0.04 * Math.sin(TT * 2.2); }
  if (o.rise) { const k = EZ.o3(clamp((TT - t0 - 0.8) / 2.5)); y = FL + h * 0.85 * (1 - k); }
  if (o.sealed) { const k = at(lineT(o.sealed + 1), 4); y -= 520 * k; a *= 1 - 0.85 * k; filter = `brightness(${1 + 1.2 * k})`; }
  if (o.thrown) { const tt = lineT(o.thrown) + 0.3, k = EZ.o2(clamp((TT - tt) / 0.7)); x += 340 * k; rot = -1.3 * k; y += 40 * k; }
  if (o.frozen) filter = 'saturate(0.3) brightness(1.1) hue-rotate(160deg)';
  if (o.sick) filter = 'saturate(0.7)';
  if (o.dying) { const k = at(lineT(51), 2); filter = `saturate(${1 - 0.8 * k}) brightness(${1 - 0.25 * k})`; }
  if (o.hide) { a *= 0.9; y += 6; }
  if (CAPTURE) return { n, x, y, h, flip, rot, filter, a, o };
  castRender({ n, x, y, h, flip, rot, filter, a, o });
}
function castRender(st) {
  const { n, x, y, h, flip, rot, filter, a, o } = st;
  if (o.sage) { const k = at(lineT(o.from) - 0.2, 1.2); glow(x, y - h * 0.5, h * 0.8, `rgba(${o.sage},A)`, 0.55 * k, 'lighter'); rays(x, y - h * 0.5, k * 0.5, h * 0.75, 12, x * 0.01); }
  ctx.save(); ctx.globalAlpha *= a;
  if (o.pose) { const tp = lineT(o.pose[1]) - 0.2; pose2(ANAME(n), ANAME(o.pose[0]), tp, x, y, h, { flip, rot, filter, h2: HDEF[o.pose[0]] ?? h }); }
  else if (o.turn) { const tt = lineT(o.turn) - 0.2, k = clamp((TT - tt) / 0.35), cs = Math.cos(Math.PI * k); fig(ANAME(n), x, y, h, { flip: k > 0.5 ? !flip : flip, rot, filter, sx: Math.max(0.08, Math.abs(cs)) }); }
  else fig(ANAME(n), x, y, h, { flip, rot, filter, shadow: !(o.fly || o.float || o.hang || o.y < FL - 60) });
  if (o.crystal) crystal(x, y - h * 0.5, h * 0.42, h * 0.62);
  if (o.ocarina) ocarina(x - 90 * (flip ? -1 : 1), y - h * 0.66, -0.2, 1);
  ctx.restore();
  // fairies
  const navPath = (t) => [x + 80 * Math.cos(t * 2.6) + 30, y - h * 0.98 + 34 * Math.sin(t * 3.4)];
  if (o.navi === 1) { sparks(navPath, TT, 6, NAVI, 3, a); const [nx, ny] = navPath(TT); fairy(nx, ny, 0.85, a, NAVI, 3); }
  if (o.navi === 'arrive') { const ta = lineT(41) - 0.6, u = EZ.io(clamp((TT - ta) / 1.6)); if (TT > ta - 2) { const [ox, oy] = navPath(TT), px = (t) => { const v = EZ.io(clamp((t - ta) / 1.6)); const [qx, qy] = navPath(t); return [lerp(W + 100, qx, v), lerp(300, qy, v)]; }; sparks(px, TT, 8, NAVI, 2); const [nx, ny] = px(TT); fairy(nx, ny, 0.95, 1, NAVI, 2); } }
  if (o.navi === 'leave') { const tl = lineT(310) + 1.0, u = EZ.i2(clamp((TT - tl) / 2.4)); const px = (t) => { const v = EZ.i2(clamp((t - tl) / 2.4)); const [qx, qy] = navPath(t); return [lerp(qx, 1500, v), lerp(qy, FY0 + 40, v)]; }; if (u < 1) { sparks(px, TT, 8, NAVI, 2, 1 - u * 0.5); const [nx, ny] = px(TT); fairy(nx, ny, 0.85 * (1 - 0.5 * u), 1 - u * 0.6, NAVI, 2); } }
  if (o.fairy) { const col = o.fairy === 2 ? '255,200,150' : '255,236,170', pth = (t) => [x + 70 * Math.cos(t * 2.4 + o.fairy) - 20, y - h * 0.95 + 30 * Math.sin(t * 3.1 + o.fairy)]; sparks(pth, TT, 5, col, o.fairy, a); const [fx, fy] = pth(TT); fairy(fx, fy, 0.75, a, col, o.fairy); }
}
function pose2(a, b, t, x, y, h, o) { const k = EZ.io(clamp((TT - t) / 0.4)); if (k < 1) fig(a, x, y, h, { ...o, a: Math.min(1, 2 * (1 - k)) }); if (k > 0) fig(b, x, y, o.h2, { ...o, a: Math.min(1, 2 * k), shadow: k > 0.5 }); }
function crystal(x, y, w, h) { ctx.save(); const g = 0.75 + 0.25 * Math.sin(TT * 2); ctx.globalAlpha *= 0.42 * g; ctx.fillStyle = '#e9a3c0'; ctx.strokeStyle = '#8a2f56'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w, y - h * 0.2); ctx.lineTo(x + w * 0.7, y + h * 0.9); ctx.lineTo(x - w * 0.7, y + h * 0.9); ctx.lineTo(x - w, y - h * 0.2); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 0.9 * g; ctx.setLineDash([12, 7]); ctx.stroke(); ctx.restore(); glow(x, y, w * 1.4, 'rgba(240,160,200,A)', 0.35); }
function ocarina(x, y, rot, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(0.6, 0.6); ctx.lineWidth = 6; ctx.strokeStyle = '#a5401e'; ctx.fillStyle = '#7fb0cf';
  ctx.beginPath(); ctx.roundRect(-58, -16, 26, 22, 6); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 50, 32, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
// ---- effects
function notes(x, y, k = 1) { for (let i = 0; i < 4; i++) { const ph = mod(TT * 0.6 + i * 0.25, 1); ctx.save(); ctx.globalAlpha = (1 - ph) * 0.9 * k; ctx.fillStyle = '#6a2a10'; ctx.font = 'bold 50px Georgia'; ctx.fillText('♪', x + 50 * Math.sin(ph * 6 + i) + i * 34, y - ph * 260); ctx.restore(); } }
function tallyRow(x, y, k) { for (let i = 0; i < 7; i++) { const u = clamp((k * 8 - i) / 1), hh = 80 * EZ.o2(u); if (u <= 0) continue; ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#6a2a10'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x + i * 64, y + 40); ctx.lineTo(x + i * 64, y + 40 - hh); ctx.stroke(); ctx.strokeStyle = '#e2b452'; ctx.lineWidth = 6; ctx.setLineDash([9, 6]); ctx.stroke(); ctx.restore(); } }
function gem(n, x, y, w, a = 1) { prop('c_' + n, x, y + 6 * Math.sin(TT * 1.5 + x), w, { a }); glow(x, y, w * 1.2, n === 'emerald' ? 'rgba(120,220,140,A)' : n === 'ruby' ? 'rgba(240,110,90,A)' : 'rgba(120,170,240,A)', 0.4 * a); }
function triPiece(x, y, s, rot, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = '#e2b452'; ctx.strokeStyle = '#8a3a14'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -s * 0.58); ctx.lineTo(s / 2, s * 0.29); ctx.lineTo(-s / 2, s * 0.29); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,190,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.beginPath(); ctx.moveTo(0, -s * 0.4); ctx.lineTo(s * 0.34, s * 0.2); ctx.lineTo(-s * 0.34, s * 0.2); ctx.closePath(); ctx.stroke(); ctx.restore(); glow(x, y, s, 'rgba(255,225,140,A)', 0.4 * a); }
function medallions(cx, cy, r, k) { const C = ['120,180,90', '230,90,50', '90,140,220', '170,90,200', '240,170,60', '255,230,150']; C.forEach((c, j) => { const a = (j / 6) * TAU + TT * 0.15, x = cx + r * Math.cos(a), y = cy + r * 0.45 * Math.sin(a), kk = clamp(k * 6 - j); if (kk <= 0) return;
  glow(x, y, 70, `rgba(${c},A)`, 0.7 * kk); ctx.save(); ctx.globalAlpha *= kk; ctx.fillStyle = `rgb(${c})`; ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }); }
function rainLines(k = 1) { ctx.save(); ctx.strokeStyle = 'rgba(200,210,225,0.55)'; ctx.lineWidth = 3; ctx.globalAlpha *= k; for (let i = 0; i < 60; i++) { const R = RNG('rn', i), x = mod(R.r(0, W + 300) - TT * 260, W + 300) - 100, y = mod(R.r(0, 900) + TT * 900 * R.r(0.8, 1.2), 900) + FY0 - 60; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 46); ctx.stroke(); } ctx.restore(); }
function embers(k = 1) { for (let i = 0; i < 26; i++) { const R = RNG('em', i), y = FY1 - mod(R.r(0, 800) + TT * R.r(60, 120), 820), x = R.r(0, W) + 30 * Math.sin(TT + i); ctx.save(); ctx.globalAlpha = k * clamp((y - FY0) / 200) * 0.8; ctx.fillStyle = i % 2 ? '#f0a040' : '#e05a2a'; ctx.beginPath(); ctx.arc(x, y, R.r(3, 6), 0, TAU); ctx.fill(); ctx.restore(); } }
function bubbles(k = 1) { for (let i = 0; i < 18; i++) { const R = RNG('bb', i), y = FY1 - mod(R.r(0, 800) + TT * R.r(40, 90), 820), x = R.r(0, W) + 20 * Math.sin(TT * 1.3 + i); ctx.save(); ctx.globalAlpha = k * 0.6 * clamp((y - FY0) / 150); ctx.strokeStyle = '#e9efe6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R.r(6, 16), 0, TAU); ctx.stroke(); ctx.restore(); } }
function motes(k = 1) { for (let i = 0; i < 16; i++) { const R = RNG('mo', i), x = R.r(100, W - 100) + 40 * Math.sin(TT * 0.5 + i), y = R.r(250, 800) + 30 * Math.sin(TT * 0.7 + i * 2); glow(x, y, 26, 'rgba(255,240,180,A)', k * (0.4 + 0.3 * Math.sin(TT * 2 + i))); } }
function darkBall(x0, y0, x1, y1, t, d) { const u = clamp((TT - t) / d); if (u <= 0 || u >= 1) return; const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - 80 * Math.sin(Math.PI * u); glow(x, y, 70, 'rgba(150,60,200,A)', 0.8, 'source-over'); ctx.save(); ctx.fillStyle = '#2a1030'; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); ctx.restore(); }
function lightArrow(x0, y, x1, t, d = 0.5) { const u = clamp((TT - t) / d); if (u <= 0 || u >= 1) return; const x = lerp(x0, x1, u); ctx.save(); ctx.strokeStyle = '#fff3c0'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 120, y); ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); glow(x, y, 60, 'rgba(255,240,170,A)', 0.8); }
function fxDraw(i, f) {
  const id = IDS[i], t0 = BT0(id), t1 = BT1(id), pu = clamp((TT - t0) / (t1 - t0));
  switch (f) {
    case 'sand': sand(560, FL - 10, 22, 's' + i); break;
    case 'storm': sand(200, FL, 60, 'st' + i, 1); wash('#c8762a', 0.18); break;
    case 'leaves': leaves(-40, W + 40, FY0 + 20, FL - 40, 10, 'l' + i, 0.8, 60); break;
    case 'motes': motes(0.7); break;
    case 'notes': notes(W * 0.42, FL - 360); break;
    case 'night': wash('#2c3560', 0.45); stars(i); break;
    case 'embers': embers(); break;
    case 'bubbles': bubbles(); break;
    case 'snow': for (let j = 0; j < 30; j++) { const R = RNG('sn', j), y = FY0 + mod(R.r(0, 820) + TT * R.r(30, 60), 820), x = R.r(0, W) + 20 * Math.sin(TT + j); glow(x, y, 8, 'rgba(255,255,255,A)', 0.8); } break;
    case 'rain': rainLines(); break;
    case 'triforce': { const tt = t0 + 0.4, k = at(tt, 1.8), y = lerp(260, 470, EZ.o3(k)); rays(960, y, k * 0.9, 380, 18); prop('triforce', 960, y + 6 * Math.sin(TT * 1.4), 340, { a: clamp(k * 1.5), rot: 0.4 * (1 - EZ.o3(k)) }); break; }
    case 'rays': break;
    case 'earth': { const k = at(t0 + 1, 2); ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#9a3a1e'; ctx.beginPath(); ctx.ellipse(1300, FL - 10, 360 * k, 60, 0, Math.PI, TAU); ctx.fill(); ctx.restore(); break; }
    case 'water': { const k = at(t0 + 1, 2); for (let j = 0; j < 5; j++) { ctx.save(); ctx.globalAlpha = k * 0.8; ctx.strokeStyle = j % 2 ? '#7fa7c8' : '#cfe0e6'; ctx.lineWidth = 7; ctx.beginPath(); for (let xx = 1060; xx < 1700; xx += 20) ctx.lineTo(xx, FL - 30 - j * 26 + 10 * Math.sin(xx * 0.03 + TT * 2 + j)); ctx.stroke(); ctx.restore(); } break; }
    case 'birds': for (let j = 0; j < 5; j++) { const u = mod(TT * 0.12 + j * 0.2, 1), x = lerp(900, -100, u), y = 420 - 180 * u + 20 * Math.sin(TT * 3 + j); ctx.save(); ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 16, y - 6 * Math.sin(TT * 9 + j)); ctx.lineTo(x, y); ctx.lineTo(x + 16, y - 6 * Math.sin(TT * 9 + j)); ctx.stroke(); ctx.restore(); } break;
    case 'split': { const ts = t0 + 2.2, k = at(ts, 2.2), base = [[960, 330], [890, 450], [1030, 450]], dest = [[560, 330], [400, 640], [1560, 600]];
      if (id === 'p050') { dest[0] = [560 + 30, FL - 520]; }
      rays(960, 400, (1 - k) * 0.9, 380, 16); base.forEach(([bx, by], j) => { const [dx, dy] = dest[j]; triPiece(lerp(bx, dx, EZ.io(k)), lerp(by, dy, EZ.io(k)) + 5 * Math.sin(TT * 1.5 + j), 130, k * (j - 1) * 0.8, 1); }); break; }
    case 'realm': { const k = 1 - at(t0 + 2, 3); prop('triforce', 960, 360, 260, { a: k * 0.8 }); glow(960, 360, 300, 'rgba(255,230,160,A)', 0.4 * k); break; }
    case 'dream': { const k = at(t0 + 0.6, 0.8); roundel(960, 430, 250, k, (r) => { ctx.fillStyle = '#5a3030'; ctx.fillRect(960 - r, 430 - r, 2 * r, 2 * r); prop('hy_castle', 960, 470, 360, { a: 0.8 });
      if (TT > lineT(33)) fig('c_white-horse', lerp(1300, 620, clamp((TT - lineT(33)) / 3)), 640, 170, { shadow: false }); if (TT > lineT(34)) fig('c_dark-rider', 1010, 640, 200, { shadow: false, a: at(lineT(34), 0.6) }); }); break; }
    case 'curse': curse(1180, 560, 1080, 520, at(t0 + 0.8, 1.4), i); break;
    case 'webs': break;
    case 'emerald': gem('emerald', 1000, 420 + 0 * pu, 90, at(lineT(49), 0.6)); break;
    case 'ruby': gem('ruby', lerp(1100, 760, at(lineT(109), 1.2)), lerp(380, 480, at(lineT(109), 1.2)), 90, at(lineT(108) + 1, 0.6)); break;
    case 'sapphire': gem('sapphire', lerp(1140, 780, at(lineT(121), 1.2)), 420, 90, at(lineT(120), 0.6)); break;
    case 'stones': { const k = at(lineT(92), 0.8); gem('emerald', 820, 300, 70, k); gem('ruby', 960, 260, 70, k); gem('sapphire', 1100, 300, 70, k); break; }
    case 'stones3': { gem('emerald', 1300, 300, 60, 1); gem('ruby', 1420, 280, 60, 1); gem('sapphire', 1540, 300, 60, 1); break; }
    case 'tally': tallyRow(740, 260, clamp((TT - t0 - 1) / 3)); break;
    case 'swordrays': rays(960, 560, 0.6 + 0.3 * Math.sin(TT), 420, 14, 1); break;
    case 'triforce_hand': { const k = at(lineT(154), 1); glow(1460, FL - 400, 200, 'rgba(255,220,140,A)', 0.6 * k); triPiece(1460, FL - 620, 90 * k, 0, k); break; }
    case 'medallions': medallions(960, 420, 420, at(t0 + 1, 3)); break;
    case 'mother': { const k = at(lineT(192) - 0.2, 0.8); roundel(1420, 420, 200, k * (1 - at(lineT(195) - 1, 0.6)), (r) => { ctx.fillStyle = '#2a3018'; ctx.fillRect(1420 - r, 420 - r, 2 * r, 2 * r); fig('c_mother', 1420, 420 + r - 20, 320, { shadow: false }); }); break; }
    case 'shadow': { const k = clamp((TT - lineT(218)) / 1.5) * (1 - at(lineT(220), 1)); glow(1300, FL - 200, 300, 'rgba(20,10,30,A)', 0.8 * k, 'source-over'); break; }
    case 'triforce_glow': { const k = at(lineT(250), 0.8); triPiece(1180, FL - 430, 70 * k, 0, k); break; }
    case 'arrows': { if (id === 'p069') { const k = at(lineT(256), 0.8); glow(1000, FL - 300, 150, 'rgba(255,240,170,A)', 0.7 * k); } else for (let j = 0; j < 3; j++) lightArrow(640, FL - 330, 1260, lineT(274) + j * 0.9); break; }
    case 'redglow': wash('#7a2020', 0.3 * at(lineT(258), 1)); break;
    case 'rainbow': { const k = at(t0 + 0.6, 2.5); ['#c86a6a', '#d9a65c', '#d9cf7a', '#7fa76a', '#7f9fc8', '#a07fc0'].forEach((c, j) => { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 16; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(1300, FL + 200, 760 - j * 16, Math.PI * 1.02, Math.PI * (1.02 + 0.95 * k)); ctx.stroke(); ctx.restore(); }); break; }
    case 'triforce3': { const k = at(lineT(266), 1); triPiece(1080, FL - 600, 70 * k, 0, k); triPiece(560, FL - 560, 60 * at(lineT(267), 0.8), 0, at(lineT(267), 0.8)); triPiece(1500, 330, 60 * at(lineT(268), 0.8), 0, at(lineT(268), 0.8)); break; }
    case 'darkballs': for (let j = 0; j < 3; j++) { darkBall(1260, FL - 450, 620, FL - 300, lineT(273) + j * 1.4, 0.9); darkBall(620, FL - 300, 1260, FL - 450, lineT(273) + j * 1.4 + 0.9, 0.7); } break;
    case 'rubble': for (let j = 0; j < 12; j++) { const R = RNG('rb', j), u = mod(TT * 0.4 + j / 12, 1), x = R.r(200, 1700), y = FY0 + u * 760; ctx.save(); ctx.globalAlpha = 0.85 * Math.sin(Math.PI * u); ctx.fillStyle = '#4a3a33'; ctx.translate(x, y); ctx.rotate(u * 6 + j); ctx.fillRect(-14, -10, 28, 20); ctx.restore(); } break;
    case 'firering': for (let j = 0; j < 20; j++) { const x = 100 + j * 92, hh = 50 + 26 * Math.sin(TT * 5 + j * 1.7); ctx.save(); ctx.fillStyle = j % 2 ? '#c84a1e' : '#e2903a'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(x - 34, FL + 30); ctx.quadraticCurveTo(x - 10, FL - hh * 0.6, x + 6 * Math.sin(TT * 4 + j), FL - hh); ctx.quadraticCurveTo(x + 10, FL - hh * 0.5, x + 34, FL + 30); ctx.fill(); ctx.restore(); } break;
    case 'sealrays': rays(1180, 360, at(lineT(290), 1.5), 600, 20); break;
    case 'dusk': wash('#5a2a40', 0.35); break;
    case 'timesplit': { const k = at(lineT(319), 2.5); ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([16, 10]);
      for (const [dx, c] of [[-1, '#e2b452'], [1, '#c87a5a']]) { ctx.strokeStyle = c; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(960, 820); ctx.quadraticCurveTo(960, 600, 960 + dx * 520 * k, 330); ctx.stroke(); } ctx.restore();
      triPiece(960 - 520 * k, 300, 70, 0, at(lineT(320), 0.8)); ocarina(960 + 520 * k, 330, 0.2, at(lineT(322), 0.8)); glow(960 + 520 * k, 330, 90, 'rgba(172,214,255,A)', 0.5 * at(lineT(322), 0.8)); break; }
    case 'sign': signCard(); break;
    case 'blast': { const tb = VW(L_(135), 'knocked') - 0.1, k = clamp((TT - tb) / 0.5); if (k > 0 && k < 1) { glow(lerp(1100, 560, k), FL - 300, 90, 'rgba(160,70,200,A)', 0.9, 'source-over'); } break; }
    case 'voiceglow': glow(820, FL - 300, 300, 'rgba(255,220,240,A)', 0.25 + 0.15 * Math.sin(TT * 2)); break;
    case 'altar': { const k = at(lineT(142), 0.8); gem('emerald', 880, FL - 220, 46, k); gem('ruby', 960, FL - 240, 46, k); gem('sapphire', 1040, FL - 220, 46, k); glow(960, 400, 300, 'rgba(255,240,200,A)', 0.4 * at(lineT(143), 1)); break; }
    case 'window': break;
    case 'smoke': break;
    case 'torches': break;
    case 'bomb': { const tb = lineT(107), k = clamp((TT - tb - 0.4) / 0.4); if (k > 0 && k < 1) glow(1150, FL - 220, 260 * k, 'rgba(255,200,120,A)', 1 - k); break; }
    case 'sparks': for (let j = 0; j < 6; j++) { const R = RNG('sp', j), x = 1260 + R.r(-160, 160), y = R.r(250, 750); if (Math.sin(TT * 13 + j * 3) > 0.6) { ctx.save(); ctx.strokeStyle = '#f3e08a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18, y + 22); ctx.lineTo(x - 6, y + 34); ctx.lineTo(x + 14, y + 58); ctx.stroke(); ctx.restore(); } } break;
    case 'wind': for (let j = 0; j < 8; j++) { const R = RNG('wd', j), u = mod(TT * 0.15 + j / 8, 1), x = lerp(400, 1800, u), y = R.r(250, 650); ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u) * 0.7; ctx.strokeStyle = '#f3ead0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 40, y - 30, x + 80, y + 30, x + 140, y - 10); ctx.stroke(); ctx.restore(); } break;
  }
}
function stars(key) { ctx.save(); ctx.strokeStyle = '#f5e6b8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let j = 0; j < 18; j++) { const R = RNG('st' + key, j), x = R.r(100, W - 100), y = R.r(FY0 + 30, 420), s = R.r(6, 12) * (0.75 + 0.25 * Math.sin(TT * 3 + j)); ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke(); } ctx.restore(); }
function wash(c, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = clamp(a); ctx.fillStyle = c; ctx.fillRect(-400, FY0 - 50, W + 800, FY1 - FY0 + 100); ctx.restore(); }
function roundel(x, y, r, k, f) { if (k <= 0.02) return; const rr = r * EZ.o2(k); ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.fillStyle = '#efe0b8'; ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, Math.max(1, rr - 6), 0, TAU); ctx.clip(); f(rr); ctx.restore(); ctx.lineWidth = 14; ctx.strokeStyle = '#c99a3a'; ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = '#7a3a14'; ctx.setLineDash([9, 6]); ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke(); ctx.restore(); }
function curse(x0, y0, x1, y1, k, key = 0) { if (k <= 0) return; for (let s2 = 0; s2 < 3; s2++) { const P = []; const n = 40; for (let j = 0; j <= n * k; j++) { const u = j / n; P.push([lerp(x0, x1, u) + 60 * Math.sin(u * 9 + TT * 3 + s2), lerp(y0, y1, u) - 140 * Math.sin(Math.PI * u) + 20 * Math.sin(u * 14 + TT * 5 + s2 * 2)]); }
  if (P.length < 2) continue; ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); P.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = '#3a1838'; ctx.lineWidth = 14 - s2 * 4; ctx.stroke(); ctx.strokeStyle = '#8a3a6a'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.restore(); } }
// the sign-off: the apple, AMPHORUS in gold on a cream woven plaque, and under it, small, the trailer's line (held ~10 s for the end screen)
function signCard() {
  const k = springMove(SIGN_T, 0, 1, SPRING.heavy), sz = 300 * k, bob = 6 * Math.sin((TT - SIGN_T) * 1.4);
  const pk = EZ.o2(clamp((TT - SIGN_T - 0.3) / 0.6));
  if (pk > 0) { ctx.save(); ctx.globalAlpha = pk; ctx.fillStyle = '#f1e2bb'; ctx.strokeStyle = '#7a3a14'; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(620, 560, 680, 170, 36); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c99a3a'; ctx.lineWidth = 3; ctx.setLineDash([10, 7]); ctx.beginPath(); ctx.roundRect(634, 574, 652, 142, 26); ctx.stroke(); ctx.restore(); }
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(960, 380 + bob); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = EZ.o2(clamp((TT - SIGN_T - 0.4) / 0.8)); tpLogo('AMPHORUS', 960, 672, 80, SIGN_T); ctx.restore();
  const s2 = EZ.o2(clamp((TT - SIGN_T - 1.0) / 0.8)); if (s2 > 0) { ctx.save(); ctx.globalAlpha = s2; ctx.font = 'italic 34px Georgia, serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 7; ctx.strokeText('Beyond time, the boy becomes a hero', 960, 790); ctx.fillStyle = '#fbf0d2'; ctx.fillText('Beyond time, the boy becomes a hero', 960, 790); ctx.restore(); }
}
// each panel's own slow push: the first panel of a row looks at the whole cast; later sub-panels move in on one person (alternating)
function pushOf(i) {
  const r = PLAN[i], id = IDS[i], cast = r[3], k = r[6] ? r[6].k : 0, t0 = SUB(id), t1 = SUBEND(id), u = EZ.io(clamp((TT - t0) / Math.max(4, t1 - t0)));
  const xs = cast.map((c) => c[1]), mid = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : W / 2;
  if (!k || !cast.length) return { fx: mid, z: 1 + 0.05 * u };
  const c = cast[(k - 1) % cast.length]; return { fx: lerp(mid, c[1], 0.8), z: (k % 2 ? 1.16 : 1.08) + 0.05 * u };
}
function panelDraw(i) {
  const [id, , setn, cast, fx] = PLAN[i], t0 = SUB(id), t1 = SUBEND(id);
  drawSet(setn, i);
  const pre = ['night', 'dusk', 'storm', 'rain', 'sand'], under = fx.filter((f) => pre.includes(f)), over = fx.filter((f) => !pre.includes(f));
  under.forEach((f) => fxDraw(i, f));
  // a slow push toward the cast for the whole panel (on top of the global drift)
  const P = pushOf(i); ctx.save(); ctx.translate(P.fx, 600); ctx.scale(P.z, P.z); ctx.translate(-P.fx, -600);
  over.filter((f) => ['triforce', 'split', 'realm', 'rainbow', 'medallions', 'sealrays', 'timesplit', 'dream', 'mother', 'sign'].includes(f)).forEach((f) => fxDraw(i, f));
  cast.forEach((c) => castDraw(i, c));
  over.filter((f) => !['triforce', 'split', 'realm', 'rainbow', 'medallions', 'sealrays', 'timesplit', 'dream', 'mother', 'sign'].includes(f)).forEach((f) => fxDraw(i, f));
  ctx.restore();
  if (CARD[id]) scrollCard(CARD[id], W / 2, 300, t0 + 0.3, VL(L_(PLAN[i][1])).t0 + 1.5);
}
const PANELS = PLAN.map((r, i) => () => panelDraw(i));
const BAND = {}; IDS.forEach((id, i) => (BAND[id] = BANDOF(i)));
function bands(i, x) {   // top and bottom friezes of panel i at screen x; tiled in world coords so one chapter's band runs on unbroken
  const [, bn, bf] = BAND[IDS[i]], im = asset(bn); if (!im) return; const tw = im.naturalWidth * BAND_H / im.naturalHeight, wx = i * W;
  for (const y of [0, H - BAND_H]) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, W, BAND_H); ctx.clip(); if (bf) ctx.filter = bf;
    for (let bx = x - mod(wx, tw) - tw; bx < x + W + tw; bx += tw) ctx.drawImage(im, bx, y, tw + 0.5, BAND_H);
    ctx.restore();
  }
}
const FULL_SET = new Set(IDS);

// ---- continuous actors: the same person in two panels in a row walks across the seam instead of popping
function bridges(i0, i1) {
  const out = [], c1 = PLAN[i1][3]; CAPTURE = true;
  try { for (const c of PLAN[i0][3]) { const m = c1.find((d) => WHO(d[0]) === WHO(c[0])); if (!m) continue; const s0 = castDraw(i0, c), s1 = castDraw(i1, m);
    if (s0 && s1 && s0.a > 0.05 && s1.a > 0.05) out.push({ who: WHO(c[0]), s0, s1, i0, i1 }); } } finally { CAPTURE = false; }
  return out;
}
function drawBridge(b, pos, u, z, dx, dy) {
  const map = (i, s) => { const px = pos.find((p) => p[0] === i)[1], P = pushOf(i), X1 = P.fx + P.z * (s.x - P.fx), Y1 = 600 + P.z * (s.y - 600);
    return { x: px + W / 2 + dx + z * (X1 - W / 2), y: 560 + dy + z * (Y1 - 560), k: P.z * z }; };
  const A = map(b.i0, b.s0), B = map(b.i1, b.s1), e = EZ.io(u), mv = Math.sin(Math.PI * u), x = lerp(A.x, B.x, e), y = lerp(A.y, B.y, e) - Math.abs(Math.sin(TT * 7)) * 12 * mv, k = lerp(A.k, B.k, e);
  const same = b.s0.n === b.s1.n, draw = (s, a) => { if (a <= 0.003) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-s.x, -s.y);
    castRender({ ...s, a: s.a * a, rot: s.rot + 0.03 * Math.sin(TT * 7) * mv, o: { ...s.o, navi: s.o.navi ? 1 : 0 } }); ctx.restore(); };
  if (same) draw(u < 0.5 ? b.s0 : b.s1, 1); else { draw(b.s0, Math.min(1, 2 * (1 - u))); draw(b.s1, Math.min(1, 2 * u)); }
}

// ---- the hanging cloth: weave grain over everything, a warm falloff, then a gentle sway (top pinned, the hem swings)
let OFF = null, WEAVE_PAT = null;
function clothFinish(g) {
  const im = asset('weave.png'); if (im && !WEAVE_PAT) WEAVE_PAT = g.createPattern(im, 'repeat');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (WEAVE_PAT) { g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.6; g.fillStyle = WEAVE_PAT; g.fillRect(0, 0, W, H); }
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 1; const v = g.createRadialGradient(W / 2, H * 0.48, H * 0.45, W / 2, H * 0.5, H * 1.05);
  v.addColorStop(0, 'rgba(255,240,215,0)'); v.addColorStop(1, 'rgba(150,105,60,0.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.restore();
}
function sway() {
  const src = OFF; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#2a1c0e'; ctx.fillRect(0, 0, W, H);
  const step = 6;
  for (let y = 0; y < H; y += step) { const d = Math.pow(y / H, 1.4), dx = d * (4.5 * Math.sin(TT * 0.9) + 1.8 * Math.sin(TT * 2.1 + y * 0.006)), sy = 1.0;
    ctx.drawImage(src, 0, y, W, step + 1, dx - 3, y, W + 6, (step + 1) * sy); }
  ctx.restore();
}

function sceneStage() {
  if (!OFF) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H; }
  const main = ctx; ctx = OFF.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  try {
    drawAsset('bg.jpg', 0, 0, W, H);   // the bands stay put
    const p = stripPos(), i0 = Math.min(PANELS.length - 1, Math.floor(p)), i1 = Math.min(PANELS.length - 1, i0 + 1), u = p - i0, sliding = i0 !== i1 && u > 0, card = sliding && FULL_SET.has(IDS[i1]);
    const pos = !sliding ? [[i0, 0]] : card ? [[i0, -SLIDE_PAR * u * W], [i1, (1 - u) * W]] : [[i0, -u * W], [i1, (1 - u) * W]];
    // the camera never stops: a slow push and drift inside the field
    const z = 1.035 + 0.012 * Math.sin(TT * 0.4), dx = 10 * Math.sin(TT * 0.33), dy = 6 * Math.sin(TT * 0.27 + 1);
    // actors present on both sides of a slide are carried across the seam (drawn once, below), not drawn in either panel
    const BR = sliding ? bridges(i0, i1) : [];
    for (const [i, x] of pos) {
      bands(i, x);
      if (BR.length) FADE_WHO = new Set(BR.map((b) => b.who));
      ctx.save(); ctx.beginPath(); ctx.rect(x, FY0, W, FY1 - FY0); ctx.clip();
      ctx.translate(x, 0); ctx.translate(W / 2 + dx, 560 + dy); ctx.scale(z, z); ctx.translate(-W / 2, -560);
      PX = x; CAMDX = dx; PANELS[i](i); PX = 0; CAMDX = 0; ctx.restore(); FADE_WHO = null;
      ctx.save(); ctx.beginPath(); ctx.rect(Math.max(0, x), FY0, card && i === i0 ? (1 - u) * W - Math.max(0, x) : W, FY1 - FY0); ctx.clip(); ctx.translate(x, 0); panelCaption(i); ctx.restore();
    }
    if (BR.length) { ctx.save(); ctx.beginPath(); ctx.rect(0, FY0, W, FY1 - FY0); ctx.clip(); BR.forEach((b) => drawBridge(b, pos, u, z, dx, dy)); ctx.restore(); }
    if (card) { const x = (1 - u) * W, g = ctx.createLinearGradient(x - 40, 0, x, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(30,15,0,0.4)'); ctx.fillStyle = g; ctx.fillRect(x - 40, 0, 40, H); }
    ctx.save(); ctx.fillStyle = 'rgba(60,25,10,0.55)'; ctx.fillRect(0, BAND_H - 3, W, 6); ctx.fillRect(0, H - BAND_H - 3, W, 6); ctx.restore();   // the seams where the bands are sewn on
    clothFinish(ctx);
  } finally { ctx = main; }
  sway();
}

// storyboard frames: each panel at 60% of its time (cards: after the scroll rolls up), the sign-off 3 s in
TIMELINE.board = IDS.map((id, i) => { const t0 = TB[i], t1 = i + 1 < IDS.length ? TB[i + 1] : DURATION; let t = id === 'p084' ? SIGN_T + 3 : CARD[id] ? Math.min(t1 - 0.5, VL(L_(PLAN[i][1])).t0 + 0.5) : t0 + 0.6 * (t1 - t0);
  return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });
