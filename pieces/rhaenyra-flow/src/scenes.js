// =====================================================================
//  SCENES — Rhaenyra, Flow experiment (tapestry). The linen, the borders and every figure are Nano Banana
//  layers (assets/, keyed off magenta); the motion is code: the strip slides right between panels, figures
//  breathe and sway, dragons flap (the wing half of the layer stretches), things fall, burn and fly.
//  Panel coords = screen coords (1080x1920); the picture lives in y 180..1740, feet on FL.
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const shotU = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const since = (id) => TT - SUB(id);
const FL = 1680, SLIDE = 0.8;
function stripPos() { let p = 0; for (let i = 1; i < TB.length; i++) p += EZ.io(clamp((TT - (TB[i] - SLIDE / 2)) / SLIDE)); return p; }

// ---- layers
const IMG = (n) => asset(n + '.webp');
// a figure: bottom-centre at (x, y), height h; o.flip mirrors, o.rot tilts about the feet, o.a alpha, o.breathe
function fig(n, x, y, h, o = {}) {
  const im = IMG(n); if (!im) return;
  const w = h * im.naturalWidth / im.naturalHeight, br = o.breathe === false ? 0 : 0.008 * Math.sin(TT * 1.7 + x * 0.013);
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.rotate((o.rot ?? 0) + (o.sway ?? 0.006) * Math.sin(TT * 1.2 + x * 0.01)); ctx.scale((o.flip ? -1 : 1) * (1 - br * 0.5), 1 + br);
  ctx.drawImage(im, -w / 2, -h, w, h); if (o.over) o.over(w, h); ctx.restore();
}
// a centred layer (props, clouds, castles): centre (x, y), width w
function prop(n, x, y, w, o = {}) {
  const im = IMG(n); if (!im) return;
  const h = w * im.naturalHeight / im.naturalWidth;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(o.flip ? -1 : 1, o.sy ?? 1);
  if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
  ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
// a flying dragon: the upper part of the layer (the wings) stretches and folds on the beat of the flap
function dragon(n, x, y, w, o = {}) {
  const im = IMG(n); if (!im) return;
  const iw = im.naturalWidth, ih = im.naturalHeight, h = w * ih / iw, sp = o.split ?? 0.5, ph = o.ph ?? TT * 4.2;
  const flap = 1 + (o.amp ?? 0.22) * Math.sin(ph), bob = (o.bob ?? 14) * Math.sin(ph - 1.2);
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y + bob); ctx.rotate(o.rot ?? 0); ctx.scale(o.flip ? -1 : 1, 1);
  const sy = sp * ih, top = sp * h;
  ctx.drawImage(im, 0, sy, iw, ih - sy, -w / 2, -h / 2 + top, w, h - top);   // body and tail
  ctx.drawImage(im, 0, 0, iw, sy, -w / 2, -h / 2 + top - top * flap, w, top * flap);   // wings, anchored on the back
  ctx.restore();
}
// a pose change: two aligned layers of the same figure cross-fade quickly around time t (a puppet moving a limb)
function pose(a, b, t, x, y, h, o = {}) {
  const u = EZ.io(clamp((TT - t) / (o.d ?? 0.12))), v = EZ.io(clamp((TT - t) / 0.7));
  if (u <= 0) return fig(a, x, y, h, o);
  if (v >= 1) return fig(b, x, y, h, o);
  fig(a + '_c', x, y, h, o); fig(b + '_c', x, y, h, { ...o, a: (o.a ?? 1) * v });
  fig(a + '_d', x, y, h, { ...o, a: (o.a ?? 1) * (1 - u) }); fig(b + '_d', x, y, h, { ...o, a: (o.a ?? 1) * u });
}
function rain(key, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = TP.blue; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 70; i++) { const R = RNG('rn', key, i), x = R.r(-40, 1120), y = 420 + mod(R.r(0, 1240) + TT * 520, 1240); ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 34); } ctx.stroke(); ctx.restore(); }
function flash(t, d = 0.25) { if (TT < t || TT > t + d) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,248,225,${0.45 * (1 - (TT - t) / d)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function glow(x, y, r, c, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function crown(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); tpFill([[-50, 0], [-56, -58], [-32, -26], [-12, -70], [8, -28], [30, -66], [52, -26], [58, -56], [54, 0]], TP.gold, { key: 'crw', couch: false, lw: 2.4 }); for (const gx of [-30, 0, 30]) tpDot(gx, -14, 6, TP.red); ctx.restore(); }

// ---- captions (stitched, as in the tapestry piece), at the top of the picture
const CAPS = {};
const WORD_C = { blacks: TP.black, greens: TP.green, fire: TP.red, blood: TP.redD, dragons: TP.red, rhaenyra: TP.red, "rhaenyra's": TP.red, aegon: TP.green, "aegon's": TP.green, lucerys: TP.navy, aemond: TP.navy, vhagar: TP.wine };
function capChunks(id) {
  const L = VL(id), ws = L.text.split(/\s+/), out = [[]];
  const left = (i) => { let n = 0; for (let j = i + 1; j < ws.length; j++) { n++; if (/[.:?]$/.test(ws[j])) break; } return n; };
  ws.forEach((w, i) => { out[out.length - 1].push({ w, t: L.words[i] ? L.words[i].t0 : L.t0, c: WORD_C[w.toLowerCase().replace(/[^a-z']/g, '')] }); const cur = out[out.length - 1];
    if (i < ws.length - 1 && (/[.:?]$/.test(w) || (/,$/.test(w) && cur.length >= 7 && left(i) >= 4))) out.push([]); });
  return out;
}
// each panel's caption height: lower where the picture leaves room above it
const CAP_Y = [420, 600, 560, 330, 300, 330, 420, 400, 340, 640, 330, 300];
function panelCaption(i) {
  const id = IDS[i]; if (!VL(id)) return;
  const ch = CAPS[id] || (CAPS[id] = capChunks(id));
  for (let k = 0; k < ch.length; k++) { const t0 = ch[k][0].t - 0.15, t1 = k + 1 < ch.length ? ch[k + 1][0].t - 0.15 : 1e9; if (TT < t0 || TT >= t1) continue;
    tpCaption(ch[k], 540, CAP_Y[i] ?? 300, { size: 62, maxW: 790, a: k + 1 < ch.length ? fadeOut(t1 - 0.15, 0.15) : 1 }); }
}

// =====================================================================
//  the panels
// =====================================================================
function pHeir() {   // the king names his daughter heir: he points, a crown comes down onto her head
  fig('throne', 560, 1430, 560, { breathe: false, sway: 0, a: 0.95 });
  pose('viserys_down', 'viserys', VW('heir', 'named') - 0.2, 250, FL, 1000);
  // the crown (the same sprite all the way) comes down and settles on her head with a little bounce
  const t0 = VW('heir', 'heir') - 0.1, land = t0 + 1.3, u = EZ.i2(clamp((TT - t0) / 1.3)), set = TT > land ? springMove(land, 1, 0, SPRING.playful) : 1;
  fig('rhaenyra', 820, FL, 990, { over: (w, h) => { if (TT < t0) return; const cw = 0.3213 * w, cx = -w / 2 + 0.5459 * w, cy = -h + 0.0285 * h, dy = TT < land ? lerp(-560, 0, u) : -14 * set;
    ctx.save(); ctx.translate(cx, cy + dy); ctx.rotate(TT < land ? 0.15 * Math.sin(TT * 3) * (1 - u) : 0); drawAsset('crown.webp', -cw / 2, -cw * 199 / 500 / 2, cw, cw * 199 / 500); ctx.restore(); } });
  if (TT > t0) for (let i = 0; i < 4; i++) { const k = clamp(1 - (TT - land) / 1.2) * fadeIn(t0, 0.3); if (k > 0) star4(830 + 100 * Math.cos(TT * 2 + i * 1.6), 700 + 40 * Math.sin(TT * 2 + i * 1.6), (9 + 4 * Math.sin(TT * 5 + i)) * k, TP.fireL); }
}
function pSwear() {   // the lords kneel with their swords; then they rise and walk away
  const tR = VW('swear', 'still') - 0.3, u = EZ.io(clamp((TT - tR) / 0.9)), walk = Math.max(0, TT - tR - 0.5) * 80;
  pose('viserys', 'viserys_down', tR + 0.3, 960, FL, 900, { flip: true });
  if (u < 1) fig('lords_kneel', 430, FL, 440, { a: 1 - u, breathe: false, over: undefined });
  if (u > 0) fig('lords_stand', 430 - walk, FL - (1 - u) * 150, lerp(440, 660, u), { a: u, sway: 0.012, flip: true });
}
function pCrown() {   // the king dies on his bier; Aegon is crowned on the Iron Throne; the realm tears in two
  const fl = 0.75 + 0.25 * Math.sin(TT * 11);
  glow(132, 1340, 120, 'rgba(255,200,110,A)', 0.25 * fl); glow(445, 1340, 120, 'rgba(255,200,110,A)', 0.25 * fl);
  prop('viserys_dead', 290, 1460, 470);
  fig('aegon_throne', 780, FL, 760, { sway: 0.002 });
  const tear = EZ.io(clamp((TT - VW('crown', 'split') + 0.1) / 0.7));
  if (tear > 0) { const P = [], Q = []; for (let i = 0; i <= 18; i++) { const y = lerp(720, 1720, i / 18), zx = 548 + (i % 2 ? 16 : -16), wd = 18 * tear * (1 - Math.abs(i / 18 - 0.5)); P.push([zx - wd, y]); Q.push([zx + wd, y]); } tpFill([...P, ...Q.reverse()], '#3b2d27', { key: 'tear', couch: false, lw: 2.4, lc: TP.red }); }
}
function pSides() {   // the Blacks and the Greens
  const sk = 0.03 * Math.sin(TT * 1.6);
  prop('banners', 540, 900, 480, { skew: sk });
  const ent = EZ.o3(clamp((TT - SUB('sides') - 0.2) / 1.5)), stp = ent < 1 ? Math.abs(Math.sin(TT * 7)) * 12 * (1 - ent) : 0;
  const rock = ent < 1 ? 0.035 * Math.sin(TT * 7) * (1 - ent * 0.6) : 0;   // a walking step: bob and rock
  fig('rhaenyra', lerp(-280, 230, ent), FL - stp, 900, { rot: rock });
  pose('aegon_stand', 'aegon_sword', VW('sides', 'greens') - 0.1, lerp(1360, 850, ent), FL - stp, 900, { rot: -rock });
  const bA = fadeIn(VW('sides', 'blacks') - 0.2, 0.3), gA = fadeIn(VW('sides', 'greens') - 0.2, 0.3);
}
function pSons() {   // the princes rise from Dragonstone on their dragons
  prop('dragonstone', 300, 1400, 560);
  const u = shotU('sons');
  dragon('vermax', lerp(420, 720, u), lerp(1000, 640, u), 520, { ph: TT * 4.6 });
  dragon('arrax', lerp(260, 600, u), lerp(1180, 900, u), 430, { ph: TT * 5.2 + 1 });
}
function pChase() {   // the storm; Vhagar comes out of it after the small dragon
  prop('storm', 540, 720, 1120, { a: 0.95 });
  rain('ch', 0.6);
  const tb = Math.floor(TT / 2.7) * 2.7; flash(tb, 0.18);
  const u = shotU('chase');
  dragon('arrax', lerp(600, 860, u), 980 + 30 * Math.sin(TT * 2), 330, { ph: TT * 6 });
  const vt = VW('chase', 'aemond', 2) - 0.6, v = EZ.io(clamp((TT - vt) / 3.2));
  dragon('vhagar', lerp(-400, 300, v), lerp(1280, 1160, v), 980, { ph: TT * 2.6, amp: 0.16, bob: 22 });
}
function pFell() {   // the bite; the small dragon and its rider fall into the sea
  prop('sea', 540, 1560, 1180);
  const tB = VW('fell', 'fell') - 0.15, f = EZ.i2(clamp((TT - tB) / 1.8)), lunge = EZ.o2(clamp((TT - tB + 0.5) / 0.5));
  dragon('vhagar', lerp(140, 330, lunge), 900, 1000, { ph: TT * 2.4, amp: 0.14 });
  if (TT < tB) dragon('arrax', 760, 850, 320, { ph: TT * 6 });
  else { ctx.save(); ctx.translate(lerp(760, 820, f), lerp(850, 1520, f)); ctx.rotate(f * 2.8); dragon('arrax', 0, 0, 320, { ph: TT * 2, amp: 0.4 }); ctx.restore(); }
  if (f > 0.95) for (let i = 0; i < 10; i++) { const R = RNG('spl', i), u = clamp((TT - tB - 1.75) / 0.6); if (u <= 0 || u >= 1) continue; tpDot(820 + R.r(-80, 80) * u, 1520 - R.r(40, 160) * Math.sin(PI * u), 7 * (1 - u), TP.blueL); }
}
function pGrief() {   // castles burn across the realm; a dragon falls out of the sky
  prop('castles_burn', 540, 1440, 1040);
  prop('flames', 540, 1590, 1100, { sy: 0.6 + 0.08 * Math.sin(TT * 9), a: 0.85 });
  const tD = VW('grief', 'dragons') - 0.6, f = EZ.i2(clamp((TT - tD) / 2.8));
  if (TT > tD) prop('dragon_fall', lerp(660, 560, f), lerp(-320, 960, f), 470, { rot: 0.2 * Math.sin(TT * 3) });
}
function pVengeance() {   // she commands; Syrax turns its fire on the land below
  pose('rhaenyra_fist', 'rhaenyra_command', VW('vengeance', 'vengeance') - 0.15, 250, FL, 980);
  const tF = VW('vengeance', 'answered') - 0.1, k = EZ.o2(clamp((TT - tF) / 0.7)), ph = TT * 3.4;
  const dx = 620, dy = 820, dw = 560, dh = dw * 549 / 900, bob = 14 * Math.sin(ph - 1.2), A = 1.45, FLW = 700;
  const mx = dx + (0.83 - 0.5) * dw, my = dy + bob + (0.55 - 0.5) * dh;
  const g = clamp((TT - tF - 0.5) / 0.6);   // the land catches fire where the breath lands
  if (g > 0) prop('flames', 860, FL - 90, 420, { sy: (0.8 + 0.12 * Math.sin(TT * 10)) * EZ.o2(g), a: g });
  dragon('syrax_r', dx, dy, dw, { ph });
  if (k > 0) { const fh = FLW * 406 / 900 * (1 + 0.06 * Math.sin(TT * 13)); ctx.save(); ctx.translate(mx - 10, my); ctx.rotate(A + 0.03 * Math.sin(TT * 7));
    ctx.beginPath(); ctx.rect(0, -fh, FLW * k * 1.02, fh * 2); ctx.clip(); drawAsset('firebreath.webp', 0, -fh * 0.5, FLW, fh); ctx.restore(); }
}
function pLost() {   // on the shore, she holds what is left of the white dragon
  prop('sea', 700, 1580, 900, { a: 0.9 });
  pose('rhaenyra_kneel', 'rhaenyra_cry', VW('lost', 'lost') - 0.1, 470, FL, 760, { sway: 0.003, d: 0.5 });
  for (let i = 0; i < 3; i++) { const bx = 650 + i * 120 + TT * 10, by = 620 + 12 * Math.sin(TT * 2 + i); tpStem([[bx - 20, by], [bx, by + 9], [bx + 20, by]], TP.ink2, { w: 3.4, key: 'gl' + i, hl: false }); }
}
function pCost() {   // the throne burns between the two dragons
  const b = clamp((TT - HIT) / 1.2);
  dragon('vhagar', 220, 820, 520, { ph: TT * 3 });
  dragon('caraxes', 860, 860, 520, { ph: TT * 3.4 + 1 });
  fig('throne', 540, FL - 40, 760, { breathe: false, sway: 0 });
  if (b > 0) { glow(540, 1500, 600, 'rgba(255,140,50,A)', 0.3 * b); prop('flames', 540, 1600, 1180, { sy: (0.7 + 0.12 * Math.sin(TT * 9)) * b }); }
}
function pSign() {
  const k = springMove(SIGN_T, 0, 1, SPRING.heavy), sz = 440 * k, bob = 8 * Math.sin((TT - SIGN_T) * 1.6);
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(540, 900 + bob); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = EZ.o2(clamp((TT - SIGN_T - 0.4) / 0.8)); tpLogo('AMPHORUS', 520, 1215, 80, SIGN_T); ctx.restore();
}
const PANELS = [pHeir, pSwear, pCrown, pSides, pSons, pChase, pFell, pGrief, pVengeance, pLost, pCost, pSign];

function sceneStage() {
  const p = stripPos(), off = p * W, i0 = Math.floor(p), i1 = Math.min(PANELS.length - 1, i0 + 1);
  for (const i of i0 === i1 ? [i0] : [i0, i1]) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, i * W - off, 0);
    drawAsset('bg.jpg', 0, 0, W, H);
    ctx.beginPath(); ctx.rect(0, 182, W, 1556); ctx.clip();   // the figures stay off the border lines
    PANELS[i](); panelCaption(i);
    ctx.restore();
  }
}
