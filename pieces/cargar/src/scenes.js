// =====================================================================
//  SCENES — Is it dangerous to charge your phone overnight? (voltreal). World 1080x1920, TT on 1s.
//  A phone charging on a nightstand, cinematic 2.5D; cutaways into the cell, the charger, the bed.
//  Captions: karaoke from VOICE (kit vrCaptions), keywords in the blue selection box.
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const flashK = (t, d = 0.6) => (TT < t ? 0 : TT < t + 0.08 ? (TT - t) / 0.08 : Math.exp(-(TT - t - 0.08) / d * 3));
const BW = (from, to = from, d = 0.3) => win(SUB(from) + 0.05, SUBEND(to) - 0.05, d);
const OV = (f) => { if (DEFER) DEFER.push(f); else f(); };
const KEYS = new Set(['myth', 'phone', 'decides', 'sip', 'wears', 'eighty', 'plug', 'sheet', 'seconds', 'speck', 'ten', 'model', 'two', 'where', 'nowhere', 'fire', 'barrier', 'three', 'weigh', 'nothing', 'true', 'rare', 'bed']);

// ---- the camera: a slow float; each beat drifts in or out (continuous across boundaries)
function camAtT() {
  let i = 0; while (i + 1 < TB.length && TT >= TB[i + 1]) i++;
  const u = EZ.io(clamp((TT - TB[i]) / Math.max(0.5, (i + 1 < TB.length ? TB[i + 1] : DURATION) - TB[i])));
  const push = 0.07 * (i % 2 ? 1 - u : u);
  const sh = TT > HIT ? Math.exp(-(TT - HIT) * 5) * 14 : 0;
  return { cx: 540 + 18 * Math.sin(TT * 0.27), cy: 980 + 12 * Math.sin(TT * 0.21 + 1), z: (1 + push) * (1 + 0.02 * Math.sin(TT * 0.37)), sx: sh * Math.sin(TT * 91), sy: sh * Math.cos(TT * 77) };
}
function setCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 + c.sx - c.z * c.cx, H / 2 + c.sy - c.z * c.cy); }
function rr(x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
// a frosted UI card (iOS-like), centred at (x, y)
function card(x, y, w, h, a, f) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.filter = 'blur(26px)'; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(x - w / 2 + 8, y - h / 2 + 22, w - 16, h, 34); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, 'rgba(48,48,52,0.96)'); g.addColorStop(1, 'rgba(26,26,30,0.96)');
  rr(x - w / 2, y - h / 2, w, h, 34, g, 'rgba(255,255,255,0.10)', 2);
  f(x - w / 2, y - h / 2, w, h);
  ctx.restore();
}
function pill(x, y, str, bg, fg = '#fff', a = 1, size = 34) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px ${VR_SANS}`; const w = ctx.measureText(str).width + size * 1.1;
  rr(x - w / 2, y - size * 0.95, w, size * 1.5, size * 0.75, bg); vrText(str, x, y + size * 0.15, size, fg, { weight: 700 }); ctx.restore();
}

// =====================================================================
//  the bedroom: nightstand, lamp, phone, cable, plug
// =====================================================================
const PH = { x: 600, y: 870, w: 350, h: 680 };
function lamp(a = 1) {
  const x = 230, y = 1120;
  vrHalo(x, y - 250, 420, '255,180,100', 0.8 * a);
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(0, y - 360, 0, y - 200); g.addColorStop(0, '#f6d7a8'); g.addColorStop(1, '#c98a4a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 70, y - 360); ctx.lineTo(x + 70, y - 360); ctx.lineTo(x + 120, y - 200); ctx.lineTo(x - 120, y - 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - 8, y - 200, 16, 150); rr(x - 70, y - 60, 140, 22, 10, '#4a3626');
  ctx.restore();
}
function nightstand(a = 1) {
  vrSlab(540, 1180, 860, 130, 56, 22, '#6a4529', '#4a2f1b', '#2c1b0f', { a });
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(0, 1300, 0, 1700); g.addColorStop(0, '#3a2414'); g.addColorStop(1, '#1a0f07');
  ctx.fillStyle = g; ctx.fillRect(150, 1300, 780, 400);
  rr(200, 1340, 680, 150, 12, null, 'rgba(255,220,180,0.08)', 2); rr(510, 1400, 60, 16, 8, '#a88466');
  // wood grain on the top
  ctx.strokeStyle = 'rgba(255,220,180,0.05)'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(130, 1135 + i * 14); ctx.bezierCurveTo(400, 1128 + i * 14, 700, 1146 + i * 14, 950, 1132 + i * 14); ctx.stroke(); }
  ctx.restore();
}
// the phone, upright on its stand; screen draws the lock screen; o.pct battery, o.charging, o.glass (x-ray) …
function phone(x, y, w, h, a = 1, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  vrShadow(x + 20, y + h / 2 + 10, w * 1.1, 60, 0.6, 30);
  const body = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); body.addColorStop(0, '#3c4050'); body.addColorStop(0.5, '#1d2028'); body.addColorStop(1, '#2c303c');
  rr(x - w / 2, y - h / 2, w, h, w * 0.16, body, 'rgba(255,255,255,0.18)', 3);
  const sx = x - w / 2 + 12, sy = y - h / 2 + 12, sw = w - 24, sh = h - 24;
  rr(sx, sy, sw, sh, w * 0.13, '#05060a');
  ctx.save(); ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, w * 0.13); ctx.clip();
  if (o.screen !== false) {
    const sg = ctx.createLinearGradient(0, sy, 0, sy + sh); sg.addColorStop(0, '#1a2140'); sg.addColorStop(1, '#0a0d1a'); ctx.globalAlpha *= o.screenK ?? 0.9; ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, sh); ctx.globalAlpha /= o.screenK ?? 0.9;
    vrText(o.time ?? '3:12', x, sy + sh * 0.25, w * 0.25, '#e8ecff', { weight: 300 });
    const pct = Math.round(o.pct ?? 100);
    // battery widget
    rr(x - sw * 0.34, sy + sh * 0.56, sw * 0.68, sh * 0.13, 22, 'rgba(255,255,255,0.10)');
    rr(x - sw * 0.27, sy + sh * 0.595, sw * 0.32, sh * 0.06, 8, null, '#e8ecff', 2.5);
    rr(x - sw * 0.27 + 4, sy + sh * 0.595 + 4, (sw * 0.32 - 8) * pct / 100, sh * 0.06 - 8, 5, pct > 20 ? VR.green : VR.red);
    vrText(pct + '%', x + sw * 0.17, sy + sh * 0.64, w * 0.08, '#e8ecff', { weight: 600 });
    if (o.charging) vrText('⚡', x - sw * 0.27 + sw * 0.16, sy + sh * 0.64, w * 0.07, '#fff', {});
  }
  if (o.inside) o.inside(sx, sy, sw, sh);
  ctx.restore();
  // a glass sheen
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh * 0.6); gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(0.4, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, w * 0.13); ctx.fill(); ctx.restore();
  ctx.restore();
}
const CABLE = (() => { const P = []; for (let i = 0; i <= 40; i++) { const u = i / 40; P.push([lerp(PH.x, 1040, u) + Math.sin(u * Math.PI) * -60, PH.y + PH.h / 2 + 10 + Math.sin(u * Math.PI * 0.9) * 140 + u * 120]); } return P; })();
function cable(a = 1, flow = 0) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#d9d9de'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); CABLE.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  rr(PH.x - 26, PH.y + PH.h / 2 - 6, 52, 34, 10, '#e7e7ea');
  if (flow > 0) for (let i = 0; i < 7; i++) { const q = vaPartAt(CABLE, mod(1 - (TT * 0.35 + i / 7), 1)); vrHalo(q[0], q[1], 34, '255,190,90', flow * a); ctx.fillStyle = `rgba(255,236,190,${flow * a})`; ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, TAU); ctx.fill(); }
}
function vaPartAt(P, u) { let L = 0; const d = [0]; for (let i = 1; i < P.length; i++) { L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); d.push(L); } const s = L * clamp(u); for (let i = 1; i < P.length; i++) if (d[i] >= s) { const k = (s - d[i - 1]) / (d[i] - d[i - 1]); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; } return P[P.length - 1]; }

// =====================================================================
//  cutaways
// =====================================================================
// the cell in section: anode (graphite), separator (paper-thin white), cathode (blue-grey), copper/aluminium foils
function cell(x, y, w, a, o = {}) {
  if (a <= 0) return;
  const h = 520;
  ctx.save(); ctx.globalAlpha *= a;
  vrShadow(x, y + h / 2 + 40, w * 0.9, 70, 0.6, 30);
  ctx.fillStyle = '#16171d'; ctx.beginPath(); ctx.moveTo(x - w / 2 - 18, y - h / 2 - 18); ctx.lineTo(x - w / 2 + 40, y - h / 2 - 90); ctx.lineTo(x + w / 2 + 90, y - h / 2 - 90); ctx.lineTo(x + w / 2 + 90, y + h / 2 - 40); ctx.lineTo(x + w / 2 + 18, y + h / 2 + 18); ctx.lineTo(x + w / 2 + 18, y - h / 2 - 18); ctx.closePath(); ctx.fill();   // the pouch's depth
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2; ctx.stroke();
  rr(x - w / 2 - 18, y - h / 2 - 18, w + 36, h + 36, 30, '#2b2d36', 'rgba(255,255,255,0.14)', 3);   // the pouch
  const gap = o.touch ? 0 : 14, lay = (h - 3 * 20 - gap) / 2;
  const grad = (y0, c0, c1) => { const g = ctx.createLinearGradient(0, y0, 0, y0 + lay); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
  ctx.fillStyle = '#c87533'; ctx.fillRect(x - w / 2, y - h / 2, w, 20);                         // copper foil
  ctx.fillStyle = grad(y - h / 2 + 20, '#3d3f46', '#26282e'); ctx.fillRect(x - w / 2, y - h / 2 + 20, w, lay);   // anode
  const sepY = y - h / 2 + 20 + lay;
  if (!o.touch) { ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x - w / 2, sepY, w, gap); }              // the separator
  ctx.fillStyle = grad(sepY + gap, '#3d5a86', '#26395a'); ctx.fillRect(x - w / 2, sepY + gap, w, lay);         // cathode
  ctx.fillStyle = '#bfc4cc'; ctx.fillRect(x - w / 2, y + h / 2 - 20, w, 20);                     // aluminium foil
  // lithium ions drifting between the layers (charging = going up)
  for (let i = 0; i < 24; i++) { const R = RNG('ion', i), u = mod(R.f() + TT * 0.25 * (o.ionDir ?? 1), 1), xx = x - w / 2 + R.r(20, w - 20); const yy = lerp(sepY + gap + lay - 20, sepY - lay + 20, u); ctx.fillStyle = 'rgba(160,220,255,0.8)'; ctx.beginPath(); ctx.arc(xx, yy, 5, 0, TAU); ctx.fill(); }
  ctx.restore();
  if (o.labels) {
    vrText('anode', x - w / 2 + 20, y - h / 2 + 20 + lay / 2 + 12, 32, '#c9ccd4', { align: 'left', weight: 600, a: a * o.labels });
    vrText('cathode', x - w / 2 + 20, sepY + gap + lay / 2 + 12, 32, '#c9d8f0', { align: 'left', weight: 600, a: a * o.labels });
    vrText('separator', x + w / 2 - 20, sepY - 14, 30, '#ffffff', { align: 'right', weight: 700, a: a * o.labels });
  }
  if (o.hot) {   // a hot spot that spreads: the runaway
    const k = o.hot;
    vrHalo(o.hx ?? x, sepY, 120 + 360 * k, '255,90,40', 1.4 * Math.min(1, k * 2));
    vrHalo(o.hx ?? x, sepY, 60 + 200 * k, '255,220,140', Math.min(1, k * 2));
  }
  return { sepY, gap };
}
function charger(x, y, s, a, o = {}) {   // a wall cube cut open: transformer, board, barrier
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  vrShadow(0, 230, 380, 60, 0.6, 26);
  rr(-180, -200, 360, 400, 46, '#e9e9ec', 'rgba(0,0,0,0.25)', 3);
  rr(-160, -180, 320, 360, 32, '#1b1d24');
  if (o.full) {
    rr(-140, 60, 280, 90, 10, '#1f6b4a');                                    // the board
    rr(-120, -150, 110, 150, 12, '#c87533'); rr(-108, -138, 86, 126, 8, '#5a3a20');   // transformer (primary side)
    for (let i = 0; i < 6; i++) rr(-120 + i * 42, 80, 26, 50, 6, ['#2b2d36', '#b9aa7a', '#3d5a86'][i % 3]);
    rr(10, -150, 110, 150, 12, '#c87533'); rr(22, -138, 86, 126, 8, '#5a3a20');      // secondary
    // the barrier: an insulating wall between the two halves
    ctx.save(); ctx.shadowColor = VR.blue; ctx.shadowBlur = 24 * (o.glow ?? 1); rr(-6, -175, 12, 340, 4, '#3b82f6'); ctx.restore();
  } else {
    rr(-140, 90, 280, 60, 10, '#1f6b4a'); rr(-60, -40, 50, 50, 6, '#2b2d36'); rr(20, 40, 30, 30, 6, '#b9aa7a');
  }
  ctx.restore();
}

// =====================================================================
//  the beats
// =====================================================================
function beatTitle() {
  const a = fadeOut(VL('title').t1 - 0.05, 0.25);
  if (a <= 0) return;
  OV(() => {
    vrText('Is it dangerous', 540, 300, 84, VR.ink, { weight: 700, a, glow: 20, glowC: 'rgba(0,0,0,0.8)' });
    vrText('to charge your phone', 540, 390, 70, VR.ink, { weight: 600, a, glow: 20, glowC: 'rgba(0,0,0,0.8)' });
    vrText('overnight?', 540, 478, 84, VR.amber, { weight: 700, a, glow: 26 });
  });
}
function stageNight() {   // the bedroom: title .. decide, then sip/heat/opt with a card, hand/pillow, end
  const a = Math.max(BW('title', 'opt'), BW('hand', 'pillow'), BW('end'));
  if (a <= 0) return;
  const charging = TT < SUB('think') || TT >= SUB('boss');
  const tMyth = SUB('think'), myth = TT >= tMyth && TT < SUB('boss');
  lamp(a);
  nightstand(a);
  // the pillow (hand/pillow beats): covers the phone; heat builds
  const pil = TT >= SUB('pillow') && TT < SUB('fake') ? EZ.io(clamp((TT - SUB('pillow') - 0.2) / 0.8)) : 0;
  const heat = TT >= SUB('heat') && TT < SUB('opt') ? 0.6 : pil > 0.5 ? 0.6 + 0.4 * clamp((TT - SUB('pillow') - 1) / 3) : 0;
  if (heat > 0) vrHalo(PH.x, PH.y + 100, 420, '255,90,40', heat * a);
  // the phone: the myth swells the battery and cracks; otherwise calm
  const sw = myth ? EZ.io(clamp((TT - VW('think', 'bursting') + 0.6) / 0.8)) : 0;
  const pct = TT < SUB('sip') ? Math.min(100, 64 + TT * 4) : TT >= SUB('opt') && TT < SUB('news') ? 80 : 100 - (Math.sin(TT * 1.3) > 0.8 ? 1 : 0);
  const behind = 1 - 0.85 * Math.max(BW('sip', 'opt'), BW('heat'));
  phone(PH.x, PH.y - sw * 10, PH.w * (1 + sw * 0.06), PH.h, a * behind, { screen: behind > 0.3, pct, charging, time: TT >= SUB('opt') ? '6:58' : '3:12' });
  if (sw > 0.6) vrGlow([[PH.x - 80, PH.y - 200], [PH.x - 20, PH.y - 120], [PH.x - 50, PH.y - 40], [PH.x + 30, PH.y + 60]], VR.red, 3, sw * a, { core: '#ffd0c8' });
  cable(a, charging ? (myth ? 1.4 : TT >= SUB('sip') && TT < SUB('opt') ? 0.3 + 0.7 * (Math.sin(TT * 1.3) > 0.8 ? 1 : 0) : 0.9) : 0);
  if (pil > 0) {   // a soft pillow sliding over the phone
    ctx.save(); ctx.globalAlpha *= a; const px = lerp(1300, 560, pil);
    const g = ctx.createLinearGradient(0, 650, 0, 1180); g.addColorStop(0, '#e8e2da'); g.addColorStop(1, '#a89e92');
    ctx.save(); ctx.filter = 'blur(24px)'; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(px - 400, 830, 800, 380, 170); ctx.fill(); ctx.restore();
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(px - 420, 760, 840, 380, 170); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.roundRect(px - 390, 790, 780, 320, 150); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    // trapped heat: a thermometer rising
    const th = clamp((TT - SUB('pillow') - 0.8) / 3);
    rr(880, 600, 40, 300, 20, 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.3)', 2); rr(888, 600 + 292 * (1 - th), 24, 292 * th, 12, VR.red);
  }
  // the myth: "MYTH" pill, the decide labels, the cards
  pill(540, 1440, 'MYTH', VR.red, '#fff', fadeIn(VW('lie', 'myth') - 0.2, 0.2) * fadeOut(SUB('boss'), 0.3) * a, 48);
  // boss/decide: the circuit inside the phone (x-ray) and a valve that closes
  const xa = BW('boss', 'decide') * a;
  if (xa > 0) {
    const full = TT >= VW('boss', 'full') - 0.2;
    rr(PH.x - 60, PH.y + 120, 120, 70, 10, '#1f6b4a', 'rgba(255,255,255,0.2)', 2); vrText('BMS', PH.x, PH.y + 168, 30, '#cfe', { mono: true, weight: 700, a: xa });
    vrGlow([[PH.x, PH.y + 190], [PH.x, PH.y + 290]], full ? VR.dim : VR.amber, 4, full ? 0.1 : xa);
    pill(PH.x, PH.y + 260, full ? 'STOP' : 'charging', full ? VR.red : '#2b8a5a', '#fff', xa, 28);
    pill(290, 1440, 'the charger offers', 'rgba(60,60,66,0.95)', '#ddd', fadeIn(VW('decide', 'offers') - 0.2, 0.25) * xa, 30);
    pill(790, 1440, 'the phone decides', VR.blue, '#fff', fadeIn(VW('decide', 'decides') - 0.2, 0.25) * xa, 30);
  }
  // sip / opt: a chart card of the night
  const ca = Math.max(BW('sip', 'sip', 0.2), BW('opt', 'opt', 0.2)) * a;
  const scrim = Math.max(ca, BW('heat') * a);
  if (scrim > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${0.45 * scrim})`; ctx.fillRect(0, 0, W, H); ctx.restore(); setCam(camAtT()); }
  card(540, 940, 760, 420, ca, (x0, y0, w, h) => {
    vrText(TT >= SUB('opt') ? 'Optimized charging' : 'Battery overnight', x0 + 40, y0 + 64, 36, '#f2f2f2', { align: 'left', weight: 700 });
    const gx0 = x0 + 50, gx1 = x0 + w - 50, gy0 = y0 + h - 60, gy1 = y0 + 120;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; for (const p of [0, 0.8, 1]) { const yy = lerp(gy0, gy1, p); ctx.beginPath(); ctx.moveTo(gx0, yy); ctx.lineTo(gx1, yy); ctx.stroke(); }
    vrText('100%', gx1, gy1 - 10, 24, VR.grey, { align: 'right', weight: 600 }); vrText('80%', gx1, lerp(gy0, gy1, 0.8) - 10, 24, VR.grey, { align: 'right', weight: 600 });
    const opt = TT >= SUB('opt'), P = [];
    for (let i = 0; i <= 60; i++) { const u = i / 60; let v = Math.min(1, u * 3.2) * (opt ? 0.8 : 1); if (opt && u > 0.88) v = 0.8 + (u - 0.88) / 0.12 * 0.2; if (!opt && u > 0.32) v = 1 - 0.015 * (mod(u * 9, 1) > 0.8 ? 1 : 0) + 0.015 * 0; P.push([lerp(gx0, gx1, u), lerp(gy0, gy1, v)]); }
    vrGlow(vaPartPts(P, clamp((TT - SUB(opt ? 'opt' : 'sip') - 0.2) / 1.4)), opt ? VR.green : VR.amber, 4, 1);
    if (opt) vrText('⏰ 7:00', gx1 - 10, gy0 + 40, 26, VR.grey, { align: 'right', weight: 600 });
  });
  // heat: battery health dropping
  const ha = BW('heat', 'heat', 0.2) * a;
  card(540, 940, 760, 300, ha, (x0, y0, w) => {
    vrText('Battery health', x0 + 40, y0 + 70, 36, '#f2f2f2', { align: 'left', weight: 700 });
    const v = 100 - 12 * EZ.io(clamp((TT - VW('heat', 'wears') + 0.3) / 1.2));
    vrText(Math.round(v) + '%', x0 + w - 40, y0 + 70, 40, v < 95 ? VR.amber : '#f2f2f2', { align: 'right', weight: 700 });
    rr(x0 + 40, y0 + 130, w - 80, 26, 13, 'rgba(255,255,255,0.12)'); rr(x0 + 40, y0 + 130, (w - 80) * v / 100, 26, 13, v < 95 ? VR.amber : VR.green);
    vrText('full + warm = wears out', x0 + w / 2, y0 + 230, 32, VR.grey, { weight: 600 });
  });
}
function stageCell() {   // news .. rare: news card, the cell in section, the runaway, the pocket, one in ten million
  const a = Math.max(BW('news', 'pierce'), BW('rare', 'note7'));
  if (a <= 0) return;
  const inNews = TT < SUB('layers'), inCell = TT >= SUB('layers') && TT < SUB('rare'), inRare = TT >= SUB('rare');
  if (inNews) {
    card(540, 900, 820, 560, a, (x0, y0, w, h) => {
      rr(x0 + 30, y0 + 30, w - 60, 300, 20, '#3a1a14'); vrHalo(x0 + w / 2, y0 + 200, 260, '255,110,50', 1);
      for (let i = 0; i < 5; i++) { const fx = x0 + w / 2 - 100 + i * 50, fh = 90 + 40 * Math.sin(TT * 9 + i); ctx.fillStyle = i % 2 ? VR.amber : '#ff7a2a'; ctx.beginPath(); ctx.moveTo(fx - 22, y0 + 300); ctx.quadraticCurveTo(fx, y0 + 300 - fh * 1.3, fx + 22, y0 + 300); ctx.fill(); }
      vrText('BREAKING', x0 + 40, y0 + 390, 28, VR.red, { align: 'left', weight: 800, letter: 2 });
      vrText('Phone bursts into flames', x0 + 40, y0 + 444, 40, '#f2f2f2', { align: 'left', weight: 700 });
      rr(x0 + 40, y0 + 480, w - 200, 14, 7, 'rgba(255,255,255,0.15)'); rr(x0 + 40, y0 + 506, w - 320, 14, 7, 'rgba(255,255,255,0.1)');
    });
    pill(540, 1440, 'almost never the plug', '#2b8a5a', '#fff', fadeIn(VW('news', 'plug') - 0.3, 0.25) * a, 32);
  }
  if (inCell) {
    const tT = VW('layers', 'touch') - 0.2, tP = VW('layers', 'pierces') - 0.2;
    const touch = TT >= tT;
    const hot = TT >= tT ? Math.min(1, EZ.io(clamp((TT - tT) / 1.2)) * 0.5 + (TT >= HIT ? EZ.o3(clamp((TT - HIT) / 0.7)) * 0.6 : 0)) : 0;
    const geo = cell(540, 980, 760, a, { labels: fadeIn(VW('layers', 'layers') - 0.2, 0.3) * fadeOut(tT, 0.3), touch, hot, hx: 600 });
    // the speck that pierces the separator
    if (TT >= tP - 0.4 && geo) { const u = EZ.io(clamp((TT - tP + 0.4) / 0.8)); const sx = 600, sy = lerp(geo.sepY - 220, geo.sepY + geo.gap / 2, u); ctx.save(); ctx.fillStyle = '#e8e8f0'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.moveTo(sx, sy - 14); ctx.lineTo(sx + 10, sy); ctx.lineTo(sx, sy + 14); ctx.lineTo(sx - 10, sy); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (TT >= HIT) for (let i = 0; i < 10; i++) { const fx = 360 + i * 40, fh = (140 + 80 * Math.sin(TT * 11 + i)) * EZ.o3(clamp((TT - HIT) / 0.5)); ctx.save(); ctx.fillStyle = i % 2 ? VR.amber : '#ff6a2a'; ctx.shadowColor = VR.amber; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(fx - 24, 720); ctx.quadraticCurveTo(fx, 720 - fh, fx + 24, 720); ctx.fill(); ctx.restore(); }
    // the pocket (pierce): jeans pocket outline with the phone glowing
    const pk = fadeIn(VW('pierce', 'pockets') - 0.3, 0.3) * a;
    if (pk > 0) { card(540, 1400, 600, 200, pk, (x0, y0, w, h) => { vrText('not even charging', x0 + w / 2, y0 + h / 2 + 12, 38, VR.amber, { weight: 700 }); }); }
  }
  if (inRare) {
    const tN = VW('rare', 'ten') - 0.3;
    for (let i = 0; i < 400; i++) { const c = i % 20, r = Math.floor(i / 20), bad = i === 213; const k = popS(SUB('rare') + 0.2 + i * 0.002); ctx.fillStyle = bad && TT >= tN ? VR.red : 'rgba(120,200,140,0.55)'; if (bad && TT >= tN) vrHalo(250 + c * 30, 640 + r * 30, 60, '255,80,80', 1); ctx.fillRect(250 + c * 30 - 9 * k, 640 + r * 30 - 12 * k, 18 * k, 24 * k); }
    OV(() => { const k = fadeIn(tN, 0.3) * a * fadeOut(SUB('note7') - 0.3, 0.2); if (k > 0) { vrText('1 in 10,000,000', 540, 1360, 72, VR.ink, { weight: 800, a: k, glow: 18, glowC: 'rgba(255,80,80,0.6)' }); vrText('cells, roughly', 540, 1420, 34, VR.grey, { weight: 600, a: k }); } });
    // note 7: a row of phones recalled
    const na = BW('note7') * a;
    if (na > 0) { ctx.save(); ctx.globalAlpha *= na; ctx.fillStyle = 'rgba(10,10,12,0.75)'; ctx.fillRect(0, 560, W, 1000); ctx.restore(); for (let i = 0; i < 5; i++) phone(220 + i * 160, 960, 120, 240, na * popS(SUB('note7') + 0.1 + i * 0.08), { screen: false }); OV(() => { vrText('≈ 2,000,000', 540, 1300, 84, VR.ink, { weight: 800, a: na, glow: 18, glowC: 'rgba(0,0,0,0.8)' }); vrText('Galaxy Note 7s recalled · US alone', 540, 1370, 34, VR.grey, { weight: 600, a: na }); }); }
  }
}
function stageCharger() {   // fake .. weigh
  const a = BW('fake', 'weigh');
  if (a <= 0) return;
  const tF = VW('fake', 'fakes') - 0.3, inTest = TT >= SUB('test') && TT < SUB('weigh'), inWeigh = TT >= SUB('weigh');
  if (!inTest) {
    const sc = inWeigh ? 0.7 : 1;
    const tilt = inWeigh ? 0.16 * EZ.io(clamp((TT - VW('weigh', 'weigh') + 0.2) / 0.8)) : 0;
    const ly = inWeigh ? 1180 : 940;
    if (inWeigh) { ctx.save(); ctx.translate(540, 1300); ctx.rotate(-tilt); rr(-420, -14, 840, 28, 12, '#8a8f9c'); ctx.restore(); rr(510, 1300, 60, 300, 8, '#5a5f6c'); rr(420, 1580, 240, 40, 16, '#4a4f5c'); }
    charger(inWeigh ? 260 : 320, ly + (inWeigh ? 420 * Math.sin(tilt) : 0), sc, a, { full: true, glow: 1 });
    charger(inWeigh ? 820 : 760, ly - (inWeigh ? 420 * Math.sin(tilt) : 0), sc, a * fadeIn(tF - 0.6, 0.3), { full: false });
    if (!inWeigh) {
      vrText('genuine', 320, 1250, 36, VR.green, { weight: 700, a });
      vrText('fake', 760, 1250, 36, VR.red, { weight: 700, a: a * fadeIn(tF - 0.6, 0.3) });
      pill(320, 640, 'barrier', VR.blue, '#fff', fadeIn(VW('fake', 'barrier') - 0.2, 0.25) * a * fadeOut(SUBEND('fake') - 0.1, 0.2), 30);
      vrText('wall voltage  |  5 V', 320, 700, 26, VR.grey, { weight: 600, a: fadeIn(VW('fake', 'five') - 0.2, 0.25) * a });
    } else {
      pill(540, 1440, 'nothing inside, no protection', 'rgba(60,60,66,0.95)', '#fff', fadeIn(VW('weigh', 'nothing') - 0.3, 0.25) * a, 28);
    }
  } else {
    for (let i = 0; i < 400; i++) { const c = i % 20, r = Math.floor(i / 20), ok = i === 37 || i === 222 || i === 361; const k = popS(SUB('test') + 0.2 + i * 0.002); ctx.fillStyle = ok && TT >= VW('test', 'three') - 0.2 ? VR.green : 'rgba(255,80,80,0.55)'; if (ok && TT >= VW('test', 'three') - 0.2) vrHalo(250 + c * 30, 640 + r * 30, 50, '63,210,122', 1); ctx.beginPath(); ctx.roundRect(250 + c * 30 - 11 * k, 640 + r * 30 - 11 * k, 22 * k, 22 * k, 5); ctx.fill(); }
    OV(() => { const k = fadeIn(VW('test', 'three') - 0.2, 0.3) * a; vrText('3 of 400', 540, 1360, 84, VR.ink, { weight: 800, a: k, glow: 18, glowC: 'rgba(63,210,122,0.6)' }); vrText('fake chargers passed insulation', 540, 1425, 34, VR.grey, { weight: 600, a: k }); });
  }
}
function stageRecap() {
  const a = BW('recap');
  if (a <= 0) return;
  const rows = [['Overcharges overnight?', 'MYTH', VR.red, VW('recap', 'myth') - 0.2], ['Shortens battery life?', 'TRUE', VR.amber, VW('recap', 'true', 1) - 0.2], ['Can it catch fire?', 'RARE', '#2b8a5a', VW('recap', 'true', 2) - 0.2]];
  rows.forEach(([q, v, c, t], i) => {
    const k = fadeIn(SUB('recap') + 0.3 + i * 0.12, 0.3) * a;
    card(540, 760 + i * 230, 860, 190, k, (x0, y0, w, h) => { vrText(q, x0 + 40, y0 + h / 2 + 14, 40, '#f2f2f2', { align: 'left', weight: 600 }); });
    pill(800, 760 + i * 230 + 12, v, c, '#fff', popS(t) * a, 34);
  });
}
function beatEnd() {
  if (TT < SUB('end')) return;
  OV(() => {
    const na = fadeIn(VL('end').t1 + 0.2, 0.4);
    if (na > 0) {
      ctx.save(); ctx.globalAlpha = na; ctx.font = `700 34px ${VR_SANS}`; const w1 = ctx.measureText('@bitvolts').width;
      rr(540 - (w1 + 200) / 2, 1440, w1 + 200, 76, 38, 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.2)', 2);
      vrText('@bitvolts', 540 - 50, 1490, 34, '#fff', { weight: 700 }); rr(540 + w1 / 2 - 40, 1454, 130, 48, 24, VR.blue); vrText('Follow', 540 + w1 / 2 + 25, 1488, 26, '#fff', { weight: 700 });
      ctx.restore();
    }
  });
}
function vaPartPts(P, frac) { if (frac >= 1) return P; const n = Math.max(2, Math.round(P.length * frac)); return P.slice(0, n); }

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT();
  const tone = TT >= SUB('fake') && TT < SUB('end') ? 'neutral' : TT >= SUB('news') && TT < SUB('hand') ? 'neutral' : 'warm';
  const fire = TT >= HIT && TT < SUB('rare') ? Math.max(0.3, flashK(HIT, 1.4)) : 0;
  vrBg(tone, { light: tone === 'warm' ? [230, 900, 700] : null, lightK: 0.22 });
  if (fire) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,90,30,${0.25 * fire})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  vrBokeh(28, 1, 'bk', tone === 'warm');
  setCam(c);
  stageNight(); stageCell(); stageCharger(); stageRecap(); beatTitle(); beatEnd();
  // captions on top, in screen space (hidden during the title card)
  OV(() => vrCaptions({ keys: KEYS, hide: (t) => t < VL('title').t1 + 0.3 }));
}
