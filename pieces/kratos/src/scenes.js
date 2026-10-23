// =====================================================================
//  SCENES — Kratos (amphora-bf, Flow layers). The ground and its friezes (assets/bg.jpg) are fixed on screen;
//  the picture slides right panel to panel. Each panel is clipped only vertically (inside the friezes), so a
//  layer that overhangs its panel stays whole across the slide. Feet on FL. Nothing pops in: things walk in,
//  rise, fall, grow or fade.
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const shotU = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const since = (id) => TT - SUB(id);
const FL = 1640, PIC0 = 156, PIC1 = 1652;
const breath = (x) => 1 + 0.008 * Math.sin(TT * 1.7 + x * 0.013);
// a figure that breathes and sways a little
function fig(n, x, h, o = {}) { bfLay(n + '.webp', x, o.y ?? FL, h, { ...o, sy: (o.sy ?? 1) * (o.still ? 1 : breath(x)), rot: (o.rot ?? 0) + (o.still ? 0 : 0.005 * Math.sin(TT * 1.2 + x * 0.01)) }); }
// a seamless pose change: the body stays, only the part that differs fades (assets from posepair.py)
function pose(a, b, t, x, h, o = {}) {
  const u = EZ.io(clamp((TT - t) / 0.12)), v = EZ.io(clamp((TT - t) / 0.7));
  if (u <= 0) return fig(a, x, h, o); if (v >= 1) return fig(b, x, h, o);
  fig(a + '_c', x, h, o); fig(b + '_c', x, h, { ...o, a: v }); fig(a + '_d', x, h, { ...o, a: 1 - u }); fig(b + '_d', x, h, { ...o, a: u });
}
// walking in from a side: position, a step bob and a rock while moving
function walkIn(x0, x1, t0, d) { const u = EZ.o3(clamp((TT - t0) / d)), mv = u < 1 ? 1 - u : 0; return { x: lerp(x0, x1, u), dy: -Math.abs(Math.sin(TT * 6.5)) * 14 * mv, rot: 0.03 * Math.sin(TT * 6.5) * mv }; }
function glow(x, y, r, c, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
// Zeus' thunderbolt: a jagged gold zigzag with a black edge, flickering
function bolt(x0, y0, x1, y1, k, key) {   // Zeus' lightning: sharp zigzag strokes with forks, a white-gold core and a glow
  if (k <= 0) return;
  const R = RNG('bolt', key, Math.floor(TT * 16)), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const zig = (ax, ay, bx, by, n, amp) => { const P = [[ax, ay]]; for (let i = 1; i < n; i++) { const u = i / n, o = (i % 2 ? 1 : -1) * amp * R.r(0.6, 1.2); P.push([lerp(ax, bx, u) + nx * o, lerp(ay, by, u) + ny * o]); } P.push([bx, by]); return P; };
  const main = subPath(zig(x0, y0, x1, y1, 7, 70), k), forks = [];
  for (const f of [0.3, 0.55, 0.75]) { if (k < f + 0.1) continue; const p = pointAt(main, f / k), a = Math.atan2(dy, dx) + (R.f() < 0.5 ? 0.6 : -0.6); forks.push(zig(p[0], p[1], p[0] + Math.cos(a) * 160, p[1] + Math.sin(a) * 160, 4, 22)); }
  ctx.save(); ctx.lineJoin = 'miter'; ctx.lineCap = 'round';
  const poly = (P) => { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const q of P) ctx.lineTo(q[0], q[1]); ctx.stroke(); };   // straight segments: sharp zigzags
  const pass = (w, c, a) => { ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = w; poly(main); ctx.lineWidth = w * 0.55; for (const F of forks) poly(F); };
  ctx.shadowColor = 'rgba(255,230,150,0.9)'; ctx.shadowBlur = 40; pass(30, 'rgba(255,210,110,0.5)', 1); ctx.shadowBlur = 0;
  pass(18, BF.black, 1); pass(10, BF.gold, 1); pass(4, '#fff6dc', 1);
  ctx.restore();
}

function snow(key, n = 50) { for (let i = 0; i < n; i++) { const R = RNG('sn', key, i), x = mod(R.r(0, 1200) + Math.sin(TT * 0.8 + i) * 30, 1200) - 60, y = PIC0 + mod(R.r(0, 1500) + TT * R.r(40, 90), 1500); bfDot(x, y, R.r(3, 6), BF.white); } }
function fog(k, key) { if (k <= 0) return; for (let i = 0; i < 9; i++) { const R = RNG('fog', key, i), x = R.r(0, 1080) + Math.sin(TT * 0.5 + i) * 60, y = R.r(500, 1600) - TT * 8; ctx.save(); ctx.globalAlpha = 0.5 * k; glow(x, y, R.r(220, 380), 'rgba(23,11,18,A)', 0.9); ctx.restore(); } }

// =====================================================================
//  the panels (panel coords = screen coords)
// =====================================================================
function pAres() {   // the vow: Kratos kneels; Ares points down at him and takes him
  fig('kratos_kneel', 760, 560, { flip: true });
  pose('ares_down', 'ares', VW('ares', 'promise') - 0.1, 300, 980);
  const k = fadeIn(VW('ares', 'kept') - 0.1, 0.8); glow(760, 1420, 240, 'rgba(154,43,31,A)', 0.35 * k);   // a red glow where the god takes him
}
function pGhost() {   // the Ghost of Sparta walks in; undead legionnaires charge; the blades cut them down one wave at a time
  const w = walkIn(-320, 330, SUB('ghost') + 0.5, 2.0);
  fig('kratos_swing', w.x, 960, { y: FL + w.dy, rot: w.rot });
  [VW('ghost', 'blood'), VW('ghost', 'blades'), VW('ghost', 'death')].map((th) => [th - 1.3, th - 0.05]).forEach(([tc, th]) => {
    if (TT < tc) return;
    const c = EZ.o2(clamp((TT - tc) / Math.max(0.3, th - tc))), x = lerp(1420, 860, c), step = c < 1 ? Math.abs(Math.sin(TT * 9)) * 12 : 0;
    const f = clamp((TT - th) / 1.0), u = EZ.io(clamp((TT - th) / 0.12));
    if (u < 1) fig('legion', x, 640, { y: FL - step, flip: true, a: 1 - u, still: true });
    if (u > 0 && f < 1) { ctx.save(); ctx.globalAlpha = u * (1 - EZ.i2(clamp((f - 0.55) / 0.45))); ctx.translate(x + f * 260, FL - Math.sin(Math.PI * Math.min(1, f * 1.4)) * 120 + f * 40); ctx.rotate(f * 0.9); bfLay('legion_fall.webp', 0, 0, 520, {}); ctx.restore(); }
    if (TT > th && TT < th + 0.35) glow(640, 1250, 260, 'rgba(255,190,110,A)', 0.45 * (1 - (TT - th) / 0.35));   // the hit's flash
  });
}
function pHydra() {   // the Hydra rises from the sea; he holds up Medusa's head
  const r = EZ.o3(clamp((TT - SUB('hydra') - 0.2) / 1.6));
  ctx.save(); ctx.translate(660, lerp(1900, FL, r)); ctx.rotate(0.025 * Math.sin(TT * 1.6)); bfLay('hydra.webp', 0, 0, 700, {}); ctx.restore();
  fig('kratos_medusa', 260, 860);
}
function pTrick() {   // the gods' trick: Ares looms over him in the dark, a black fog closes in
  const d = fadeIn(SUB('trick') + 0.2, 1.0);
  ctx.save(); ctx.globalAlpha = lerp(0.35, 1, d); bfLay('ares.webp', 330, FL + 10, 1000, {}); ctx.restore();
  fig('kratos_sad', 800, 680, { flip: true });
}
function pFamily() {   // his family lies fallen; the blades drop from his hands; he falls to his knees
  prop('family_fallen', 690, FL - 80, 640);
  const f = EZ.i2(clamp((TT - SUB('family') - 0.3) / 0.6));
  for (const [x0, r] of [[150, -1], [330, 1]]) { ctx.save(); ctx.translate(x0, lerp(1250, 1590, f)); ctx.rotate(r * f * 1.4); bfLay('blade.webp', 0, 0, 120, { ax: 0.5, ay: 0.5 }); ctx.restore(); }
  fig('kratos_grief', 290, 640);
}
function pHunt() {   // he walks the lands of Greece, hunting the gods
  prop('landscape', 540, 1430, 1000);
  const x = lerp(230, 760, EZ.io(shotU('hunt'))), mv = shotU('hunt') < 1 ? 1 : 0;
  fig('kratos', x, 780, { y: FL - Math.abs(Math.sin(TT * 6.5)) * 12 * mv, rot: 0.03 * Math.sin(TT * 6.5) * mv });
}
function pOlympus() {   // he climbs the mountain; the temple on its summit comes down stone by stone
  const im = asset('olympus.webp'), H0 = 1080, W0 = H0 * im.naturalWidth / im.naturalHeight, x0 = 620 - W0 / 2, y0 = FL - H0, cutF = 0.17;
  const tT = VW('olympus', 'tore') - 0.1, f = clamp((TT - tT) / 1.4);
  // the mountain (below the summit) always; the summit whole until "tore", then in falling slices
  // the mountain below the summit, its top edge a ragged line of broken rock (never a straight cut)
  ctx.save(); ctx.beginPath(); ctx.moveTo(x0 - 20, FL + 20); const RZ = RNG('rag');
  for (let i = 0; i <= 24; i++) ctx.lineTo(x0 + W0 * i / 24, y0 + H0 * cutF + (i % 2 ? -46 : 6) * RZ.r(0.4, 1));
  ctx.lineTo(x0 + W0 + 20, FL + 20); ctx.closePath(); ctx.clip();
  ctx.drawImage(im, x0, y0, W0, H0); ctx.restore();
  const n = 7;
  for (let i = 0; i < n; i++) { const R = RNG('sl', i), sx = im.naturalWidth * i / n, sw = im.naturalWidth / n, dx = x0 + W0 * i / n, dw = W0 / n, g = EZ.i2(clamp(f * 1.4 - R.r(0, 0.4)));
    ctx.save(); ctx.translate(dx + dw / 2 + g * R.r(-120, 120), y0 + H0 * cutF / 2 + g * R.r(500, 900)); ctx.rotate(g * R.r(-2, 2)); ctx.globalAlpha = 1 - clamp(g * 1.2 - 0.3);
    ctx.drawImage(im, sx, 0, sw, im.naturalHeight * cutF, -dw / 2, -H0 * cutF / 2, dw, H0 * cutF); ctx.restore(); }
  const u = EZ.io(clamp((TT - SUB('olympus')) / 2.2));
  fig('kratos_climb', lerp(330, 560, u), 320, { y: lerp(FL - 40, y0 + H0 * 0.36, u), ring: true });
}
function pZeus() {   // the fight: Zeus hurls his bolt; Kratos lunges; Zeus falls
  const tK = VW('zeus', 'killed') - 0.1, tF = VW('zeus', 'hands') - 0.3, fall = EZ.io(clamp((TT - tF) / 0.7));
  if (fall < 1) { ctx.save(); ctx.translate(760, FL); ctx.rotate(fall * 0.5); ctx.globalAlpha = 1 - fall; bfLay('zeus.webp', 0, 0, 1000, { flip: true }); ctx.restore(); }
  if (fall > 0) { ctx.save(); ctx.translate(780, FL - 120); ctx.scale(-1, 1); prop('zeus_fallen', 0, 0, 640, { a: fall }); ctx.restore(); }
  const b = clamp((TT - tK) / 0.25) * (TT < tF ? 1 : 0); bolt(960, 690, 480, 1340, b, 'zb');
  if (b > 0 && Math.floor(TT * 12) % 3 === 0) glow(540, 900, 700, 'rgba(255,230,170,A)', 0.25);
  const w = walkIn(-500, 420, SUB('zeus') + 0.5, 1.4);
  bfLay('kratos_attack.webp', w.x, FL + w.dy, 440, { rot: w.rot });
}
function pPast() {   // alone; the ghosts of his family stand behind him
  const g = fadeIn(SUB('past') + 0.3, 1.2);
  ctx.save(); ctx.globalAlpha = 0.85 * g; bfLay('ghosts.webp', 330, FL - 10 * Math.sin(TT * 1.3), 880, {}); ctx.restore();
  fig('kratos_sad', 720, 940);
}
function pNorth() {   // the frozen north: the older Kratos and his son Atreus, who looses an arrow
  prop('forest', 540, 1360, 1060, { a: 0.95 });
  snow('nn');
  fig('kratos_norse', 330, 900);
  const w = walkIn(-400, 800, SUB('north') + 0.5, 2.2);
  fig('atreus', w.x, 560, { y: FL + w.dy, rot: w.rot, flip: true });
  const tA = VW('north', 'teach') - 0.1, u = clamp((TT - tA) / 0.6);
  if (u > 0 && u < 1) { const x = lerp(1010, 1120, u) + 2000; ctx.save(); ctx.strokeStyle = BF.black; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 70, 1265); ctx.lineTo(x, 1265); ctx.stroke(); ctx.restore(); }
}
function pQuestion() {   // battle: he swings the axe at a troll; the boy watches; he stops
  snow('nq', 30);
  const w = walkIn(1450, 820, SUB('question') + 0.5, 1.6);
  fig('troll', w.x, 820, { flip: true, y: FL + w.dy, rot: w.rot });
  fig('atreus', 120, 420, { flip: true });
  fig('kratos_norse_swing', 420, 820);
}
function pNorse() {   // Odin on his throne, Thor beside him; ravens circle
  fig('odin', 370, 830, { still: true }); fig('thor', 810, 1100);   // Thor towers over the throne
  for (let i = 0; i < 2; i++) { const t = since('norse') - i * 0.8, x = 1200 - t * 260, y = 640 + 60 * Math.sin(t * 2 + i); if (x < -150 || t < 0) continue; ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1 + 0.15 * Math.sin(TT * 9 + i)); bfLay('raven.webp', 0, 0, 150, { ax: 0.5, ay: 0.5 }); ctx.restore(); }
}
function pLesson() {   // the silence: he kneels, his son's hand on his shoulder
  fig('lesson', 560, 980);
}
// THE PAYOFF: his own hands turn red (the figure is drawn off-screen and the hands tinted, so only he is coloured)
let KR_CV = null;
function pBlood() {
  const im = asset('kratos_hands.webp'), h = 1120, w = h * im.naturalWidth / im.naturalHeight, x = 560 - w / 2, y = FL - h;
  if (!KR_CV) { KR_CV = document.createElement('canvas'); KR_CV.width = Math.ceil(w); KR_CV.height = Math.ceil(h); }
  const g = KR_CV.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, KR_CV.width, KR_CV.height); g.drawImage(im, 0, 0, w, h);
  const k = EZ.o2(clamp((TT - HIT - 0.1) / 1.6));
  if (k > 0) { g.globalCompositeOperation = 'source-atop'; const hx = w * 0.9, hy = h * 0.3, r = lerp(40, 160, k), gr = g.createRadialGradient(hx, hy, 0, hx, hy, r); gr.addColorStop(0, 'rgba(176,32,24,0.95)'); gr.addColorStop(0.7, 'rgba(154,43,31,0.85)'); gr.addColorStop(1, 'rgba(154,43,31,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  ctx.save(); ctx.translate(0, 0); ctx.drawImage(KR_CV, x, y); ctx.restore();
  for (let i = 0; i < 8; i++) { const R = RNG('drop', i), t = TT - HIT - 0.6 - i * 0.35; if (t < 0) continue; const u = mod(t, 1.4) / 1.4; bfDot(x + w * 0.9 + R.r(-25, 25), lerp(y + h * 0.33, FL - 20, u * u), 8 * (1 - u * 0.4), BF.red); }
}
function pSign() { bfSignoff(SIGN_T); }
// a centred layer (sets, groups): centre (x, y), width wd
function prop(n, x, y, wd, o = {}) { const im = asset(n + '.webp'); if (!im) return; const h = wd * im.naturalHeight / im.naturalWidth; ctx.save(); if (o.a != null) ctx.globalAlpha *= o.a; ctx.drawImage(im, x - wd / 2, y - h / 2, wd, h); ctx.restore(); }

// captions (Dalek Pinpoint, brown): a phrase at a time, up to two lines, each word written on its spoken word,
// the phrase complete on screen until the next one; placed per panel just above the figures
const K_FONT = '"DalekPinpointBold", "Dalek Pinpoint", Georgia, serif', K_SIZE = 78, K_LH = 92, K_MAXW = 760;
const CAP_LAST = { ares: 560, ghost: 560, hydra: 700, trick: 540, family: 900, hunt: 760, olympus: 440, zeus: 560, past: 600, north: 600, question: 700, norse: 440, lesson: 640, blood: 470 };
const KCH = [];
for (const L of VOICE.lines) { const ws = L.text.split(/\s+/); let cur = null;
  ws.forEach((w, i) => { const t = L.words[i] ? L.words[i].t0 : L.t0; if (!cur) { cur = { id: L.id, ws: [], ts: [] }; KCH.push(cur); } cur.ws.push(w); cur.ts.push(t);
    if ((/[.:;?!]$/.test(w) && cur.ws.length >= 3) || (/,$/.test(w) && cur.ws.length >= 4) || cur.ws.length >= 7) cur = null; }); }
// each phrase appears only once the previous one has finished writing (its last word + 0.45s), so none is cut
KCH.forEach((c, i) => { const prev = i > 0 && KCH[i - 1].id === c.id ? KCH[i - 1] : null; c.show = Math.max(c.ts[0] - 0.12, prev ? prev.ts[prev.ts.length - 1] + 0.45 : -1); });
function kLayout(ws, size = K_SIZE) { ctx.font = `${size}px ${K_FONT}`; ctx.letterSpacing = '3px'; const sp = ctx.measureText(' ').width, items = ws.map((w) => ({ w, ww: ctx.measureText(w).width })), lines = [[]]; let lw = 0;
  for (const it of items) { if (lw + it.ww > K_MAXW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(it); lw += it.ww + sp; } return { lines, sp }; }
function kCaptions(pi) {
  const id = IDS[pi], dx = BF_PDX; if (id === 'sign') return;
  const mine = KCH.filter((c) => c.id === id);
  mine.forEach((c, k) => {
    const t0 = c.show, last = k + 1 >= mine.length, tEnd = last ? SUBEND(id) + BF_SLIDE : mine[k + 1].show;
    if (TT < t0 || TT >= tEnd) return;
    const a = last ? 1 : bfFadeOut(tEnd - 0.14, 0.12);
    bfOverlay(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, dx, 0); ctx.textBaseline = 'alphabetic';
      let size = K_SIZE, lay = kLayout(c.ws, size); while (lay.lines.length > 2 && size > 50) { size -= 4; lay = kLayout(c.ws, size); }
      const { lines, sp } = lay, lh = K_LH * size / K_SIZE, yLast = Math.max(CAP_LAST[id] ?? 560, 230 + size * 0.75 + (lines.length - 1) * lh); let n = 0;
      ctx.globalAlpha = a;
      lines.forEach((L, li) => { const tw = L.reduce((s, it) => s + it.ww, 0) + sp * (L.length - 1); let x = 520 - tw / 2; const y = yLast - (lines.length - 1 - li) * lh;
        for (const it of L) { const wt = Math.max(c.ts[n++], c.show + 0.04 * n); kPen(it.w, x, y, it.ww, clamp((TT - wt + 0.06) / 0.22), size); x += it.ww + sp; } });
      ctx.restore();
    });
  });
}
// a word written by hand in the ref's brown (no white, no heavy shadow)
function kPen(str, x, y, ww, prog, size) {
  if (prog <= 0) return; ctx.save();
  if (prog < 1) { const xe = x - 6 + (ww + 12) * EZ.io(prog), sl = size * 0.25; ctx.beginPath(); ctx.moveTo(x - 40, y + size * 0.8); ctx.lineTo(xe - sl * 0.6, y + size * 0.8); ctx.lineTo(xe + sl, y - size * 1.2); ctx.lineTo(x - 40, y - size * 1.2); ctx.closePath(); ctx.clip(); }
  ctx.fillStyle = 'rgba(255,200,150,0.35)'; ctx.fillText(str, x + 2, y + 2);
  ctx.fillStyle = '#6e2a18'; ctx.fillText(str, x, y);
  ctx.restore();
}
const PANELS = { ares: pAres, ghost: pGhost, hydra: pHydra, trick: pTrick, family: pFamily, hunt: pHunt, olympus: pOlympus, zeus: pZeus, past: pPast, north: pNorth, question: pQuestion, norse: pNorse, lesson: pLesson, blood: pBlood, sign: pSign };
function sceneStage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawAsset('bg.jpg', 0, 0, W, H);   // the ground and its friezes stay put
  const p = bfStripPos(), off = p * W, i0 = Math.min(IDS.length - 1, Math.floor(p)), i1 = Math.min(IDS.length - 1, i0 + 1);
  for (const i of i0 === i1 ? [i0] : [i0, i1]) {
    BF_PDX = i * W - off;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, BF_PDX, 0);
    ctx.beginPath(); ctx.rect(0, PIC0, W, PIC1 - PIC0); ctx.clip();   // every layer fits inside its own panel, so this never cuts one

    PANELS[IDS[i]]();
    ctx.restore();
    kCaptions(i);
  }
  BF_PDX = 0;
}
