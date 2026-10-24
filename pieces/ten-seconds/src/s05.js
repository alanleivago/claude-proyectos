// =====================================================================
//  s05 — lines 090–106 · Monday: Mr. Voss, the CCTV, the suspension; that night, the kitchen.
//  Office (cool light) for 090–101, kitchen (lamp, night) for 102–106. Theo watches the office from the corridor,
//  through the glass door (a d = 2 layer slipped between the corridor and the wall).
// =====================================================================
// ---- timing helpers (voice only) ----------------------------------------------------------------
const s05_has = (id, w) => { const q = w.toLowerCase().replace(/[^a-z0-9']/g, ''); return (VL(id).words || []).some((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === q); };
const s05_cw = (id, w, n, fb) => (s05_has(id, w) ? CUT(id, w, n) : fb);     // cut on a word, or a voice-derived fallback
const s05_u = (lt, a, d) => EZ.o3(clamp((lt - a) / Math.max(1e-3, d)));       // a gesture ramp: fast, hard stop
const s05_fr = (n) => n / FPS;
const s05_mix = (a, b, u) => ivPoseMix(typeof a === 'string' ? ivPose(a) : a, typeof b === 'string' ? ivPose(b) : b, u);

// ---- small props of this section --------------------------------------------------------------
// Dad's bus cap, side view; (x, y) = bottom of the band, s = 1 ≈ 130 px wide
function s05_capSide(x, y, s = 1, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, -22, 62, 30, 0, Math.PI, TAU); ctx.fillStyle = '#1f2e4f'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-10, -40, 30, 9, -0.2, Math.PI, TAU); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
  ivRR(-64, -26, 128, 14, 4, '#2a3c62'); ivLine(-62, -19, 62, -19, 2, '#f2c14e');
  ctx.beginPath(); ctx.ellipse(66, -6, 44, 8, 0, 0, TAU); ctx.fillStyle = '#111a2e'; ctx.fill();
  ivDot(0, -40, 9, '#f2c14e'); ivDot(-2, -42, 3, '#fff3c8');
  ctx.restore();
}
// the same cap seen from straight above; (x, y) = centre
function s05_capTop(x, y, s = 1, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 150, 150, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.translate(8, 12); ctx.fill(); ctx.translate(-8, -12);
  ctx.beginPath(); ctx.ellipse(0, 150, 120, 70, 0, 0, Math.PI); ctx.fillStyle = '#111a2e'; ctx.fill();           // visor
  ivDot(0, 0, 150, '#2a3c62'); ivDot(0, 0, 128, '#1f2e4f');
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ivLine(0, 0, Math.cos(a) * 126, Math.sin(a) * 126, 3, 'rgba(0,0,0,0.25)'); }
  ivDot(0, 0, 14, '#2a3c62'); ivDot(0, 112, 18, '#f2c14e'); ivDot(-4, 108, 6, '#fff3c8');
  ctx.beginPath(); ctx.arc(0, 0, 140, -2.4, -1.2); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(160,190,240,0.25)'; ctx.stroke();
  ctx.restore();
}
// the 22-years safety pin: a gold shield; (x, y) = centre, s = 1 ≈ 200 × 240
function s05_badge(x, y, s = 1, num = 22, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const sh = (k) => ivPoly([[-100 * k, -110 * k], [0, -128 * k], [100 * k, -110 * k], [96 * k, 10 * k], [0, 124 * k], [-96 * k, 10 * k]], null);
  ctx.save(); ctx.translate(6, 10); ivPoly([[-100, -110], [0, -128], [100, -110], [96, 10], [0, 124], [-96, 10]], 'rgba(0,0,0,0.35)'); ctx.restore();
  ivPoly([[-100, -110], [0, -128], [100, -110], [96, 10], [0, 124], [-96, 10]], '#c9973a');
  ivPoly([[-88, -100], [0, -116], [88, -100], [84, 6], [0, 108], [-84, 6]], '#f2c14e');
  ivPoly([[-74, -88], [0, -102], [74, -88], [70, 2], [0, 90], [-70, 2]], '#1f2e4f');
  ivText('CITY TRANSIT', 0, -62, 15, '#f2c14e', { track: 2 });
  ivText(String(num), 0, 22, 84, '#ffe2b0', { glow: 'rgba(255,190,90,0.5)' });
  ivText('YEARS', 0, 52, 18, '#f2c14e', { track: 4 });
  ivRR(-118, 72, 236, 40, 8, '#a83a30'); ivRR(-118, 72, 236, 40, 8, null, '#7a2620', 3);
  ivText('0 ACCIDENTS', 0, 99, 20, '#fff0dc', { track: 2 });
  ctx.beginPath(); ctx.ellipse(-40, -80, 40, 14, -0.4, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
  if (o.shine) { const k = mod(o.shine, 1); ctx.save(); ivPoly([[-100, -110], [0, -128], [100, -110], [96, 10], [0, 124], [-96, 10]], null); ctx.clip();
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,200,0.35)'; ctx.translate(-260 + k * 520, 0); ctx.rotate(0.4); ctx.fillRect(-18, -300, 36, 600); ctx.restore(); }
  ctx.restore();
}
// a hand close-up arm: a sleeve from (x0, y0) to the wrist (x, y), a five-finger glove; col = sleeve colour
function s05_arm(x0, y0, x, y, w, col, grip = 'open', o = {}) {
  const ang = Math.atan2(y - y0, x - x0), h = w / IV_J.lw / 1.75;
  ivLine(x0 + (o.rim ? 3 : 0), y0 - (o.rim ? 3 : 0), x + 3, y - 3, w + 6, IV_M.rim);
  ivLine(x0, y0, x, y, w, col);
  if (o.cuff) ivLine(x - Math.cos(ang) * w * 0.45, y - Math.sin(ang) * w * 0.45, x - Math.cos(ang) * w * 0.05, y - Math.sin(ang) * w * 0.05, w * 0.92, o.cuff, 'butt');
  ivHand(x, y, ang, h, 'glove', grip, (c) => IV_M.rim, (v) => v + 6, o.s ?? 1);
  ivHand(x, y, ang, h, 'glove', grip, (c) => c, (v) => v, o.s ?? 1);
}
// the glass door of the office: a cool tint and two streaks (drawn on the wall's depth, inside the opening)
function s05_glass() {
  ctx.save(); ctx.beginPath(); ctx.rect(340, 120, 440, 740); ctx.clip();
  ctx.fillStyle = 'rgba(180,210,240,0.10)'; ctx.fillRect(340, 120, 440, 740);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ivPoly([[380, 860], [470, 860], [760, 120], [670, 120]], ctx.fillStyle); ivPoly([[520, 860], [545, 860], [835, 120], [810, 120]], 'rgba(255,255,255,0.05)');
  ctx.restore();
}

// ---- the office with our people ---------------------------------------------------------------------
// p.dad / p.voss / p.theo: { x, h, f, pose, expr, talk, who, hold, grip } (null hides); p.front: extra on d = 1 after the desk
function s05_man(def, q) {
  if (q === null) return null;
  const o = { ...def, ...(q || {}) };
  return ivMan({ who: o.who, x: o.x, y: o.y ?? GROUND, h: o.h, f: o.f, pose: o.pose || ivPose('relaxed'), expr: o.expr || {}, talk: o.talk, hold: o.hold, grip: o.grip, blinkKey: o.bk || '', hands: o.hands, armsFront: o.armsFront });
}
function s05_office(p = {}) {
  const L = SET_office({ screen: p.screen, sharpWall: p.sharpWall, fg: p.fg, act: () => {
    s05_man({ who: CAST.voss, x: SET_POS.office.boss, h: 560, f: -0.5 }, p.voss);
    s05_man({ who: CAST.dad, x: 860, h: 572, f: 0.5 }, p.dad);
    p.act && p.act();
  }, front: p.front });
  // Theo in the corridor, seen through the glass door
  L.splice(1, 0, { d: 2, draw: () => s05_man({ who: CAST.you, x: 680, y: 828, h: 392, f: 0.35, bk: 'cor' }, p.theo) });
  L.splice(3, 0, { d: 1.3, draw: () => s05_glass(), blur: p.sharpWall ? 0 : undefined });
  if (p.fgDraw) L.push({ d: p.fgD || 0.6, draw: p.fgDraw });
  return L;
}
// the remote Voss clicks at the wall screen
const s05_remote = (x, y, a, h) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ivRR(-4, -9, h * 0.11, 18, 6, '#16181e'); ivDot(h * 0.085, 0, 3.5, '#ff4a3a'); ctx.restore(); };

// ---- CCTV footage (inside the wall monitor, local coords w × h) --------------------------------------
// CAM 04, top-down on Fifth and Main: the bus stopped short of the line, the truck goes by (u 0..1 = its pass)
function s05_camTop(w, h, u, o = {}) {
  ctx.fillStyle = '#20242a'; ctx.fillRect(0, 0, w, h);
  const r = RNG('s05ct').f;
  for (let i = 0; i < 4; i++) { const bx = i < 2 ? 0 : w * 0.68, by = i % 2 ? h * 0.7 : 0; ivRR(bx + 4, by + 4, w * 0.32 - 8, h * 0.3 - 8, 6, '#2f3439'); for (let k = 0; k < 6; k++) ivRR(bx + 12 + r() * (w * 0.32 - 50), by + 12 + r() * (h * 0.3 - 40), 22 + r() * 18, 14 + r() * 10, 3, '#3a3f45'); }
  ctx.fillStyle = '#16191d'; ctx.fillRect(0, h * 0.3, w, h * 0.4); ctx.fillRect(w * 0.32, 0, w * 0.36, h);
  ctx.setLineDash([16, 14]); ivLine(0, h * 0.5, w * 0.3, h * 0.5, 3, '#8a8a70'); ivLine(w * 0.7, h * 0.5, w, h * 0.5, 3, '#8a8a70'); ivLine(w * 0.5, 0, w * 0.5, h * 0.28, 3, '#8a8a70'); ivLine(w * 0.5, h * 0.72, w * 0.5, h, 3, '#8a8a70'); ctx.setLineDash([]);
  for (let k = 0; k < 7; k++) ctx.fillRect(w * 0.255, h * 0.31 + k * h * 0.056, w * 0.05, h * 0.03);   // crosswalk west
  ctx.fillStyle = '#c9c9b8'; for (let k = 0; k < 7; k++) ctx.fillRect(w * 0.255, h * 0.31 + k * h * 0.056, w * 0.05, h * 0.03);
  ivLine(w * 0.24, h * 0.5, w * 0.24, h * 0.7, 4, '#e9e9d8');                                                 // stop line
  // skid marks behind the bus
  if (o.skid) { ctx.save(); ctx.globalAlpha = 0.6 * o.skid; ivLine(w * 0.02, h * 0.565, w * 0.02 + w * 0.2 * o.skid, h * 0.565, 5, '#050607'); ivLine(w * 0.02, h * 0.635, w * 0.02 + w * 0.2 * o.skid, h * 0.635, 5, '#050607'); ctx.restore(); }
  // the bus (top-down), nose at busX
  const bx = o.busX ?? w * 0.23, bl = w * 0.36, bw = h * 0.13;
  ivRR(bx - bl, h * 0.535, bl, bw, 8, '#d8d4c8'); ivRR(bx - bl + 10, h * 0.535 + 8, bl - 26, bw - 16, 5, '#b9b5aa');
  for (let k = 0; k < 4; k++) ivRR(bx - bl + 30 + k * bl * 0.22, h * 0.535 + bw * 0.3, bl * 0.12, bw * 0.4, 3, '#8f8b82');
  ivText('9', bx - bl * 0.12, h * 0.535 + bw * 0.72, bw * 0.6, '#2f5f9e');
  if (o.brake) { ivGlow(bx - bl, h * 0.545, 40, 'rgba(255,40,30,0.9)', o.brake); ivGlow(bx - bl, h * 0.655, 40, 'rgba(255,40,30,0.9)', o.brake); }
  ivGlow(bx + 30, h * 0.6, 90, 'rgba(255,240,200,0.35)');
  // the truck going down Main St
  const ty = lerp(-h * 0.7, h * 1.3, u), tx = w * 0.42, tw = w * 0.13, tl = h * 0.62;
  ctx.save(); ctx.fillStyle = 'rgba(255,245,210,0.18)'; ivPoly([[tx - tw * 0.4, ty + tl * 0.5], [tx + tw * 0.4, ty + tl * 0.5], [tx + tw * 1.1, ty + tl * 1.3], [tx - tw * 1.1, ty + tl * 1.3]], ctx.fillStyle); ctx.restore();
  ivRR(tx - tw / 2, ty - tl * 0.5, tw, tl * 0.74, 5, '#e9e4da');
  ctx.save(); ctx.translate(tx, ty - tl * 0.12); ctx.rotate(Math.PI / 2); ivText('RAPIDO', 0, tw * 0.1, tw * 0.3, '#1d2a4a'); ctx.restore();
  ivRR(tx - tw * 0.45, ty + tl * 0.27, tw * 0.9, tl * 0.22, 6, '#d64933');
  // rain on the lens
  const rr = RNG('s05rain', F % 6).f; ctx.strokeStyle = 'rgba(220,230,240,0.25)'; ctx.lineWidth = 1.5; for (let i = 0; i < 40; i++) { const x = rr() * w, y = rr() * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 12); ctx.stroke(); }
}
// CAM 01, side-on from a pole: the bus stops dead (u 0..1 of the stop), nothing in the road
function s05_camSide(w, h, u, o = {}) {
  ctx.fillStyle = ivVGrad(0, h, ['#15181d', '#22262c']); ctx.fillRect(0, 0, w, h);
  const r = RNG('s05cs').f;
  for (let i = 0; i < 8; i++) { const x = i * w / 7 - 20 + r() * 20, top = h * (0.08 + r() * 0.25); ctx.fillStyle = '#1b1e23'; ctx.fillRect(x, top, w / 7 - 6, h); for (let yy = top + 10; yy < h * 0.6; yy += 22) for (let xx = x + 8; xx < x + w / 7 - 20; xx += 18) if (r() < 0.3) ivRR(xx, yy, 8, 11, 1, '#5a5a4a'); }
  ctx.fillStyle = '#2a2e33'; ctx.fillRect(0, h * 0.62, w, h); ivLine(0, h * 0.62, w, h * 0.62, 3, '#4a4e54');
  ctx.setLineDash([22, 18]); ivLine(0, h * 0.86, w, h * 0.86, 3, '#77776a'); ctx.setLineDash([]);
  ivLine(w * 0.88, h * 0.62, w * 0.88, h * 0.15, 5, '#3a3e44'); ivRR(w * 0.865, h * 0.12, 16, 40, 4, '#2a2e33'); ivDot(w * 0.88, h * 0.15, 5, '#e9e9e0');   // signal (the CCTV greys it)
  const bx = lerp(w * 0.12, w * 0.46, EZ.o3(clamp(u)));
  if (o.skid) { ctx.save(); ctx.globalAlpha = 0.7; ivLine(bx - w * 0.2, h * 0.795, bx - w * 0.2 + w * 0.2 * o.skid, h * 0.795, 3, '#050607'); ctx.restore(); }
  P_bus(bx, h * 0.8, 0.12, { brake: u > 0.02 ? 1 : 0, rot: bx / 10 });
  ivGlow(bx + 3000 * 0.12 / 2, h * 0.72, 60, 'rgba(255,240,200,0.4)');
}

// ---- Voss's desk from straight above (layers for ivStage): the carpet far below the edge, the desk, a hand ----
function s05_deskTop(items, hand) {
  IV_M = IV_MOOD.office;
  return [
    { d: 2.4, draw: () => { set_bg('#3c434e'); ctx.save(); ctx.globalAlpha = 0.25; for (let i = -40; i < 80; i++) ivLine(i * 40, -800, i * 40 - 600, 2000, 3, '#2a3038'); ctx.restore(); ivRR(1900, 700, 260, 260, 20, '#2a2e38'); } },
    { d: 1, draw: () => {
      ctx.save(); ctx.translate(14, 18); ivRR(-300, 40, 2280, 1200, 30, 'rgba(0,0,0,0.35)'); ctx.restore();
      ivRR(-300, 40, 2280, 1200, 30, '#5a4636'); ivRR(-300, 40, 2280, 1200, 30, null, '#3a2c22', 10);
      const r = RNG('s05wood').f; ctx.save(); ctx.globalAlpha = 0.18; for (let i = 0; i < 26; i++) { const y = 60 + i * 44 + r() * 10; ctx.beginPath(); ctx.moveTo(-300, y); ctx.bezierCurveTo(400, y + r() * 30 - 15, 1100, y + r() * 30 - 15, 1980, y); ctx.lineWidth = 2 + r() * 3; ctx.strokeStyle = '#2a1e16'; ctx.stroke(); } ctx.restore();
      ivGlow(1500, 240, 700, 'rgba(200,220,255,0.12)');
      // things that live on the desk
      ivDot(1610, 860, 70, 'rgba(0,0,0,0.3)'); ivDot(1600, 850, 70, '#e9eef2'); ivDot(1600, 850, 54, '#4a2c1c'); ivDot(1585, 835, 14, 'rgba(255,255,255,0.15)');   // coffee
      set_steam(1600, 840, 4, 0.25, 0.8);
      ctx.save(); ctx.translate(250, 830); ctx.rotate(-0.4); ivRR(-8, -110, 16, 220, 8, '#16181e'); ivRR(-8, -110, 16, 40, 8, '#c9a24a'); ctx.restore();          // pen
      ctx.save(); ctx.translate(1650, 300); ctx.rotate(0.15); ivRR(-80, -150, 160, 300, 22, '#16181e'); ivRR(-70, -136, 140, 272, 16, '#22303e'); ctx.restore();  // his phone
      items && items();
    } },
    { d: 0.72, draw: () => hand && hand() },
  ];
}
// the incident report with a photo of the wrist cast; (x, y) centre
function s05_report(x, y, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1.3, 1.3);
  ivRR(-252, -322, 520, 680, 6, 'rgba(0,0,0,0.3)'); ivRR(-260, -340, 520, 680, 6, '#f2ede2');
  ivRR(-260, -340, 520, 70, [6, 6, 0, 0], '#2c4f86'); ivText('INCIDENT REPORT', 0, -293, 30, '#f2ede2', { track: 3 });
  ivText('CITY TRANSIT · LINE 9', -230, -230, 20, '#2a2c32', { align: 'left', font: IV.sans, weight: 700 });
  ivText('LOCATION: 5TH ST & MAIN ST', -230, -196, 18, '#4a4c52', { align: 'left', font: IV.sans, weight: 600 });
  ivText('EVENT: SUDDEN STOP', -230, -166, 18, '#4a4c52', { align: 'left', font: IV.sans, weight: 600 });
  ivText('HAZARD FOUND: NONE', -230, -136, 18, '#c8352e', { align: 'left', font: IV.sans, weight: 800 });
  ivText('INJURY: WRIST — SEAT 4', -230, -106, 18, '#c8352e', { align: 'left', font: IV.sans, weight: 800 });
  for (let k = 0; k < 6; k++) ivLine(-230, 150 + k * 30, 230 - (k % 3) * 60, 150 + k * 30, 3, 'rgba(40,40,50,0.25)');
  // the photo, clipped on
  ctx.save(); ctx.translate(60, 20); ctx.rotate(0.06); ivRR(-150, -100, 300, 220, 4, '#fbfaf6'); ivRR(-136, -88, 272, 170, 2, '#5a6270');
  ctx.save(); ctx.beginPath(); ctx.rect(-136, -88, 272, 170); ctx.clip(); ivRR(-136, 10, 272, 80, 0, '#4a5262'); ivLine(-150, 40, 140, -10, 34, '#8a5bb0'); P_cast(110, -18, 2.2, { ang: Math.PI - 0.17 }); ctx.restore();
  ivRR(-30, -112, 60, 26, 4, '#b9bec6'); ctx.restore();
  ctx.restore();
}

// ---- the kitchen with our people ------------------------------------------------------------------
function s05_kitchen(p = {}) {
  const K = SET_POS.kitchen;
  return SET_kitchen({ cap: p.cap ?? true, mug: false, fg: p.fg, act: () => {
    s05_man({ who: CAST.dadHome, x: K.seatL, h: 560, f: 0.55, pose: ivPose('slump'), expr: { eyes: 'tired', mouth: 'flat' } }, p.dad);
    s05_man({ who: CAST.you, x: 1450, h: 520, f: -0.5 }, p.theo);
    p.act && p.act();
  }, front: () => { P_mug(K.table[0] - 100, K.table[1], 1.25, 0, { col: '#e9e0cc', text: '#1 DAD' }); p.front && p.front(); } });
}

// ---- a walk to the left with planted feet (ivWalk is written for walking toward +x; mirror it) ------------------
function s05_walkL(t0, x0, h, fps = 5) { const w = ivWalk(t0, -x0, h, 1, fps); return { x: -w.x, pose: w.pose }; }
// the desk calendar for "Monday": a tear-off block; the SUNDAY page flips away at u 0..1
function s05_calendar(x, y, s, u) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ivRR(-70, -14, 140, 14, 4, '#2a2c32'); ivRR(-62, -150, 124, 140, 6, '#d9d4c8');
  const page = (txt, num, col) => { ivRR(-62, -150, 124, 140, 6, '#fbf8f0'); ivRR(-62, -150, 124, 34, [6, 6, 0, 0], col); ivText('OCT', 0, -126, 18, '#fbf8f0', { track: 3 }); ivText(num, 0, -48, 58, '#1e1c26'); ivText(txt, 0, -20, 15, col, { track: 2 }); };
  page('MONDAY', '20', '#c8352e');
  if (u < 1) { ctx.save(); ctx.translate(0, -150); ctx.scale(1, Math.cos(u * Math.PI * 0.95)); ctx.translate(0, 150); if (u < 0.5) page('SUNDAY', '19', '#5a6270'); else ivRR(-62, -150, 124, 140, 6, '#e8e3d8'); ctx.restore(); }
  for (let k = 0; k < 6; k++) ivDot(-45 + k * 18, -150, 4, '#6a6e78');
  ctx.restore();
}
const s05_T0 = CUT('090-narrator');
const s05_stamp = (u) => `FRI 10:58:${String(Math.min(59, 3 + Math.floor(u * 6))).padStart(2, '0')} PM`;
const s05_BEAT_A = (LE('100-voss') + CUT('101-narrator')) / 2;    // the second half of the beat after "Pending review."

// =====================================================================
//  090 — Monday. (a page flips on Voss's desk calendar)
// =====================================================================
SHOT(CUT('090-narrator'), 's05_monday', (lt) => {
  IV_CAM = { x: 1190, y: 600, z: 3.4 }; IV_FOCUS = 1;
  ivStage(s05_office({ voss: null, dad: null, theo: null, front: () => { s05_calendar(1190, 705, 1.1, s05_u(lt, 0.18, s05_fr(6))); } }));
}, { sec: 's05', title: 'MONDAY: the desk calendar flips from Sunday' });
{ const t = CUT('090-narrator'); SFX(t, 'whoosh', 0.7); SFX(t + 0.18, 'paper', 0.85, 0.05); SFX(t + 0.18 + s05_fr(6), 'tick', 0.5, 0.05); }

// 091 — Mr. Voss from the bus company. (wide office, push-in; Dad on the carpet, Theo behind the glass)
SHOT(CUT('091-narrator'), 's05_officeWide', (lt, S) => {
  IV_CAM = { x: 1010, y: 540, z: 1.06 * ivPush(S.t0, 0.03, 1.8) }; IV_FOCUS = 1;
  ivStage(s05_office({
    voss: { pose: ivPose('hips'), expr: { eyes: 'squint', mouth: 'smile' } },
    dad: { pose: ivPose('stand'), expr: { eyes: 'open', mouth: 'flat' } },
    theo: { expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } },
  }));
  ivTag('MR. VOSS', 1700, 470, 30, ivPop(S.t0 + s05_fr(6)));
  const tb = s05_cw('091-narrator', 'bus', 1, LE('091-narrator'));
  ivTag('CITY TRANSIT', 1700, 540, 22, ivPop(tb));
}, { sec: 's05', title: 'Mr. Voss behind his desk, Dad standing, Theo in the hall' });
{ const t = CUT('091-narrator'); SFX(t, 'swish', 0.5); SFX(t + s05_fr(6), 'pop', 0.7, 0.75); SFX(s05_cw('091-narrator', 'bus', 1, LE('091-narrator')), 'pop', 0.55, 0.75); }

// 093 — Smooth suit. (insert: his grey sleeve, the white cuff, a gold cufflink; the other hand tugs it straight)
SHOT(CUT('093-narrator'), 's05_suit', (lt) => {
  IV_CAM = { x: 1300, y: 520, z: 2.4 }; IV_FOCUS = 0.45;
  ivStage(s05_office({ dad: null, theo: null, voss: null, fg: false }));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tug = s05_u(lt, 0.12, s05_fr(5)) - s05_u(lt, 0.12 + s05_fr(7), s05_fr(5)) * 0.4;
  const wx = 1020 - 40 * tug, wy = 560 + 22 * tug;
  s05_arm(2150, 980, wx, wy, 190, CAST.voss.col, 'open', { cuff: '#eef0f4' });
  ivLine(wx + 120, wy + 64, wx + 170, wy + 90, 6, CAST.voss.col2);                       // a seam on the sleeve
  ivDot(wx + 40, wy + 14, 22, '#c9973a'); ivDot(wx + 40, wy + 14, 15, '#f2c14e'); ivDot(wx + 34, wy + 8, 5, '#fff3c8');   // the cufflink
  s05_arm(-150, 1200, wx + 100 - 10 * tug, wy + 130, 180, CAST.voss.col, 'hold', { cuff: '#eef0f4' });
  ctx.restore();
}, { sec: 's05', title: 'smooth suit: grey sleeve, gold cufflink, a tug on the cuff' });
{ const t = CUT('093-narrator'); SFX(t, 'swish', 0.45); SFX(t + 0.12, 'cloth', 0.8, 0.1); SFX(t + 0.12 + s05_fr(5), 'metal', 0.35, 0.05); SFX(t + 0.12 + s05_fr(7), 'cloth', 0.4, 0.1); }

// 094 — Smooth voice. (his face, the smile)
SHOT(CUT('094-narrator'), 's05_voice', (lt) => {
  IV_CAM = { x: 1370, y: 440, z: 2.9 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.25, s05_fr(5));
  ivStage(s05_office({ dad: null, theo: null, voss: { f: lerp(-0.5, -0.25, u), pose: ivPose('relaxed', { tilt: -0.08 * u }), expr: { eyes: u > 0.5 ? 'happy' : 'squint', mouth: u > 0.5 ? 'grin' : 'smile' } } }));
}, { sec: 's05', title: 'smooth voice: Voss smiles' });
{ const t = CUT('094-narrator'); SFX(t, 'swish', 0.4, 0.3); SFX(t + 0.25, 'cloth', 0.4, 0.4); }

// 095 — We pulled the camera. (he clicks the remote at the wall screen)
SHOT(CUT('095-voss'), 's05_remote', (lt) => {
  IV_CAM = { x: 1170, y: 420, z: 1.75 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.2, s05_fr(5)), on = TT > VW('095-voss', 'camera');
  ivStage(s05_office({ dad: null,
    screen: on ? (w, h) => P_cctv(0, 0, w, h, (cw, ch) => s05_camTop(cw, ch, 0, { brake: 1 }), { stamp: s05_stamp(0), cam: 'CAM 04' }) : undefined,
    voss: { pose: s05_mix('relaxed', ivPose('point', { hR: [0.3, -0.12] }), u), expr: { eyes: 'squint', mouth: 'smile', look: [-1, -0.4] }, talk: '095-voss', hold: { front: s05_remote }, grip: { front: 'hold' } },
  }));
}, { sec: 's05', title: 'we pulled the camera: the remote, the wall screen wakes' });
{ const t = CUT('095-voss'); SFX(t, 'swish', 0.45); SFX(t + 0.2, 'swish', 0.55, 0.3); SFX(VW('095-voss', 'camera') - s05_fr(2), 'click', 0.8, 0.25); SFX(VW('095-voss', 'camera'), 'beep', 0.45, -0.1); SFX(VW('095-voss', 'camera') + 0.05, 'buzz', 0.3, -0.1); }

// "A truck goes by." — CCTV CAM 04, top-down: the bus stopped short, the truck passes
const s05_monCam = (z) => ({ x: 960 + (1130 - 960) * 1.3, y: 540 + (315 - 540) * 1.3, z });
SHOT(CUT('095-voss', 'a', 1), 's05_cctvTruck', () => {
  IV_CAM = s05_monCam(3.86); IV_FOCUS = 1.3;
  const u = clamp((TT - VW('095-voss', 'truck') + 0.15) / 1.0);
  ivStage(s05_office({ dad: null, theo: null, voss: null, sharpWall: true, fg: false,
    screen: (w, h) => P_cctv(0, 0, w, h, (cw, ch) => s05_camTop(cw, ch, u, { brake: 1 }), { stamp: s05_stamp(u), cam: 'CAM 04' }) }));
}, { sec: 's05', title: 'CCTV top-down: the truck goes by, the bus stopped' });
{ const t = CUT('095-voss', 'a', 1); SFX(t, 'whoosh', 0.45); SFX(t + 0.02, 'beep', 0.35); SFX(VW('095-voss', 'truck') - 0.15 + 0.5, 'car', 0.45, -0.05, 1.0); }

// "No crash." — Voss, palms open
SHOT(CUT('095-voss', 'no'), 's05_nocrash', (lt) => {
  IV_CAM = { x: 1360, y: 450, z: 2.6 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.08, s05_fr(5));
  ivStage(s05_office({ dad: null, theo: null, voss: { f: -0.35, pose: s05_mix('relaxed', 'shrug', u), expr: { eyes: 'squint', mouth: 'smirk', brow: 'up' }, talk: '095-voss', grip: { front: 'flat', back: 'flat' } } }));
}, { sec: 's05', title: 'no crash: Voss opens his palms' });
{ const t = CUT('095-voss', 'no'); SFX(t, 'swish', 0.4); SFX(t + 0.08, 'swish', 0.6, 0.15); SFX(t + 0.08 + s05_fr(4), 'cloth', 0.45, 0.15); }

// "A driver slams the brakes" — CCTV CAM 01, side-on: the bus stops dead in an empty road
SHOT(CUT('095-voss', 'a', 2), 's05_cctvBrake', () => {
  IV_CAM = s05_monCam(3.6); IV_FOCUS = 1.3;
  const u = clamp((TT - VW('095-voss', 'slams') + 0.25) / 0.6);
  ivStage(s05_office({ dad: null, theo: null, voss: null, sharpWall: true, fg: false,
    screen: (w, h) => P_cctv(0, 0, w, h, (cw, ch) => s05_camSide(cw, ch, u, { skid: u }), { stamp: s05_stamp(u * 0.3), cam: 'CAM 01' }) }));
}, { sec: 's05', title: 'CCTV side-on: the bus slams to a stop, empty road' });
{ const t = CUT('095-voss', 'a', 2); SFX(t, 'click', 0.5); SFX(t + 0.03, 'beep', 0.35); SFX(VW('095-voss', 'slams') - 0.25, 'brake', 0.55, -0.3, 0.6); SFX(VW('095-voss', 'slams') + 0.35, 'thud', 0.5, -0.05); }

// "for nothing," — Dad takes it, eyes down
SHOT(CUT('095-voss', 'for'), 's05_dadHurt', (lt) => {
  IV_CAM = { x: 860, y: 425, z: 2.9 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.3, s05_fr(4));
  ivStage(s05_office({ voss: null, theo: null, dad: { expr: { eyes: u > 0.5 ? 'sad' : 'open', mouth: 'flat', brow: u > 0.5 ? 'sad' : undefined, look: [0.4 * u, 0.7 * u] } } }));
}, { sec: 's05', title: 'for nothing: Dad looks down' });
{ const t = CUT('095-voss', 'for'); SFX(t, 'swish', 0.35); SFX(t + 0.3, 'cloth', 0.4); }

// "and a passenger breaks her wrist." — top-down: the report slides across the desk, the photo of the cast
SHOT(CUT('095-voss', 'and'), 's05_report', (lt) => {
  IV_CAM = { x: 960, y: 540, z: 1 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.06, s05_fr(6)), back = s05_u(lt, 1.15, s05_fr(6));
  const rx = lerp(1500, 860, u), ry = 540, ra = lerp(0.12, -0.04, u);
  ivStage(s05_deskTop(() => s05_report(rx, ry, ra), () => {
    const hx = rx + 380 + back * 500, hy = ry - 60 - back * 120;
    s05_arm(2400, 200 - back * 200, hx, hy, 120, CAST.voss.col, 'flat', { cuff: '#eef0f4' });
  }));
}, { sec: 's05', title: 'top-down: the incident report slides over, the cast photo' });
{ const t = CUT('095-voss', 'and'); SFX(t, 'whoosh', 0.5); SFX(t + 0.06, 'slide', 0.85, 0.3); SFX(t + 0.06 + s05_fr(6), 'paper', 0.6, 0); SFX(t + 1.15, 'swish', 0.35, 0.7); }

// =====================================================================
//  096 — I saw something. (Dad, over Voss's shoulder)
// =====================================================================
SHOT(CUT('096-dad'), 's05_sawSomething', () => {
  IV_CAM = { x: 900, y: 470, z: 2.1 }; IV_FOCUS = 1;
  const up = TT > VW('096-dad', 'something') - 0.05;
  ivStage(s05_office({ voss: null, theo: null,
    dad: { f: 0.45, expr: { eyes: up ? 'open' : 'sad', mouth: 'flat', look: up ? [1, -0.2] : [0.3, 0.7] }, talk: '096-dad' },
    fgD: 0.6, fgDraw: () => ivMan({ who: CAST.voss, x: 1110, y: 860, h: 560, f: -0.85, pose: ivPose('relaxed'), expr: {}, hands: 'mitten' }),
  }));
}, { sec: 's05', title: 'Dad: "I saw something." over Voss\'s shoulder' });
{ const t = CUT('096-dad'); SFX(t, 'swish', 0.4); SFX(VW('096-dad', 'something') - 0.05, 'cloth', 0.35, -0.1); }

// 097 — What did you see, Raymond? (Voss leans on the desk; Dad's shoulder soft in front)
SHOT(CUT('097-voss'), 's05_whatSee', (lt) => {
  IV_CAM = { x: 1340, y: 470, z: 2.2 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.1, s05_fr(6));
  ivStage(s05_office({ dad: null, theo: null,
    voss: { f: -0.4, pose: s05_mix('relaxed', ivPose('stand', { hL: [0.14, 0.33], hR: [0.22, 0.3], lean: 0.16 }), u), expr: { eyes: 'squint', mouth: 'smile', brow: 'up' }, talk: '097-voss', armsFront: true },
    fgD: 0.6, fgDraw: () => ivMan({ who: CAST.dad, x: 1360, y: 860, h: 572, f: 0.85, pose: ivPose('relaxed'), expr: {}, hands: 'mitten' }),
  }));
}, { sec: 's05', title: 'Voss leans on the desk: "What did you see, Raymond?"' });
{ const t = CUT('097-voss'); SFX(t, 'swish', 0.4); SFX(t + 0.1, 'cloth', 0.45, 0.2); SFX(t + 0.1 + s05_fr(6), 'thud', 0.55, 0.2); }

// 098 — Dad looks at you. (his head turns to the glass door)
SHOT(CUT('098-narrator'), 's05_dadTurns', (lt) => {
  IV_CAM = { x: 850, y: 430, z: 3.0 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.18, s05_fr(5));
  ivStage(s05_office({ voss: null, theo: null, dad: { f: lerp(0.5, -0.7, u), expr: { eyes: 'open', mouth: 'flat', look: [lerp(0.5, -1, u), 0] } } }));
}, { sec: 's05', title: 'Dad turns his head toward the hall' });
{ const t = CUT('098-narrator'); SFX(t, 'swish', 0.35); SFX(t + 0.18, 'swish', 0.5, -0.3); }

// "…at you." — Theo behind the glass door
const s05_theoGlass = (z, expr, extra) => {
  const camx = 960 + (450 - 960) * 1.3, tx = 960 + (camx - 960) / 2;
  IV_CAM = { x: camx, y: 510, z }; IV_FOCUS = 2;
  ivStage(s05_office({ voss: null, dad: null, theo: { x: tx, f: 0.35, expr } }));
  extra && extra();
};
SHOT(CUT('098-narrator', 'you'), 's05_theoSeen', () => {
  s05_theoGlass(3.4, { eyes: 'wide', mouth: 'flat', look: [1, 0] });
}, { sec: 's05', title: 'Theo behind the glass, caught' });
{ const t = CUT('098-narrator', 'you'); SFX(t, 'swish', 0.45, -0.4); SFX(t + 0.4, 'heart', 0.55, -0.2); }

// 099 — And says nothing. (Dad turns back, eyes down)
SHOT(CUT('099-narrator'), 's05_saysNothing', (lt) => {
  IV_CAM = { x: 870, y: 440, z: 3.3 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.12, s05_fr(6));
  ivStage(s05_office({ voss: null, theo: null, dad: { f: lerp(-0.7, 0.45, u), expr: { eyes: u > 0.6 ? 'sad' : 'open', mouth: 'flat', look: [lerp(-1, 0.3, u), 0.6 * u] } } }));
}, { sec: 's05', title: 'Dad turns back and says nothing' });
{ const t = CUT('099-narrator'); SFX(t, 'swish', 0.35); SFX(t + 0.12, 'swish', 0.45, 0.2); SFX(t + 0.12 + s05_fr(6), 'cloth', 0.3, 0.1); }

SHOT(CUT('099-narrator', 'nothing'), 's05_theoSad', () => {
  s05_theoGlass(3.9, { eyes: 'sad', mouth: 'frown', brow: 'sad', look: [1, 0.2] });
}, { sec: 's05', title: 'Theo, sad, behind the glass' });
{ const t = CUT('099-narrator', 'nothing'); SFX(t, 'swish', 0.35, -0.3); SFX(t + 0.35, 'drop', 0.4, -0.2); }

// 100 — Suspended. (the two-shot, Voss arms crossed)
SHOT(CUT('100-voss'), 's05_suspended', (lt, S) => {
  IV_CAM = { x: 1100, y: 500, z: 1.4 * ivPush(S.t0, 0.03, 1.8) }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.1, s05_fr(5));
  ivStage(s05_office({ theo: { expr: { eyes: 'sad', mouth: 'flat' } },
    voss: { pose: s05_mix('relaxed', 'arms', u), expr: { eyes: 'squint', mouth: 'flat' }, talk: '100-voss' },
    dad: { expr: { eyes: 'sad', mouth: 'flat', look: [1, 0.3] } },
  }));
  ivTag('SUSPENDED', 1640, 250, 34, ivPop(VWE('100-voss', 'suspended') - 0.2), { c: '#ffb0a0' });
}, { sec: 's05', title: '"Suspended." Voss crosses his arms' });
{ const t = CUT('100-voss'); SFX(t, 'whoosh', 0.5); SFX(t + 0.1, 'cloth', 0.7, 0.5); SFX(VWE('100-voss', 'suspended') - 0.2, 'pop', 0.85, 0.7); SFX(VWE('100-voss', 'suspended') - 0.2, 'thud', 0.55, 0.7); }

// "Pending review." — Dad takes off his cap
SHOT(CUT('100-voss', 'pending'), 's05_capOff', (lt) => {
  IV_CAM = { x: 900, y: 460, z: 2.2 }; IV_FOCUS = 1;
  const a = 0.12, u1 = s05_u(lt, a, s05_fr(5)), off = lt > a + s05_fr(6), u2 = s05_u(lt, a + s05_fr(9), s05_fr(6));
  const top = ivPose('stand', { hR: [0.04, -0.2], hL: [-0.03, 0.29] }), low = ivPose('stand', { hR: [0.1, 0.16], hL: [-0.03, 0.29] });
  const pose = off ? s05_mix(top, low, u2) : s05_mix('relaxed', top, u1);
  ivStage(s05_office({ voss: null, theo: null,
    dad: { who: off ? CAST.dadHome : CAST.dad, pose, expr: { eyes: 'sad', mouth: 'flat', look: [0.6, 0.5] }, grip: { front: 'hold' },
      hold: off ? { front: (x, y, an, h) => s05_capSide(x - 10, y + lerp(-25, 30, u2), 0.9 * h / 572, -0.25) } : undefined },
  }));
}, { sec: 's05', title: 'Dad takes off his cap' });
{ const t = CUT('100-voss', 'pending'); SFX(t, 'swish', 0.35); SFX(t + 0.12, 'swish', 0.5, -0.05); SFX(t + 0.12 + s05_fr(6), 'cloth', 0.7, -0.05); SFX(t + 0.12 + s05_fr(9), 'cloth', 0.4, -0.05); }

// [BEAT] — the cap goes down on Voss's desk (hand close-up), then Dad walks out past Theo
SHOT(LE('100-voss'), 's05_capDesk', (lt) => {
  IV_CAM = { x: 1270, y: 630, z: 3.5 }; IV_FOCUS = 1;
  const d = s05_u(lt, 0.05, s05_fr(6)), rel = lt > 0.5, back = s05_u(lt, 0.62, s05_fr(6));
  const cx = 1225, cy = lerp(620, 705, d);
  ivStage(s05_office({ voss: null, dad: null, theo: null, front: () => {
    s05_capSide(cx, cy, 1.15, lerp(-0.18, 0, d));
    const hx = cx - 70 - back * 160, hy = cy - 40 - back * 260;
    s05_arm(840, 380 - back * 200, hx, hy, 40, CAST.dad.col, rel ? 'open' : 'hold', { cuff: CAST.dad.col2 });
  } }));
}, { sec: 's05', title: 'BEAT: Dad\'s hand sets the cap on the desk and lets go', boardAt: 0.4 });
{ const t = LE('100-voss'); SFX(t, 'swish', 0.4); SFX(t + 0.05 + s05_fr(6), 'thud', 0.75, -0.15); SFX(t + 0.05 + s05_fr(6), 'cloth', 0.4, -0.15); SFX(t + 0.5, 'cloth', 0.3, -0.2); SFX(t + 0.62, 'swish', 0.4, -0.4); }

SHOT(s05_BEAT_A, 's05_walkOut', () => {
  IV_CAM = { x: 940, y: 540, z: 1.1 }; IV_FOCUS = 1;
  const w = s05_walkL(s05_BEAT_A + 0.1, 860, 572);
  ivStage(s05_office({ theo: { expr: { eyes: 'sad', mouth: 'flat', look: [1, 0] } },
    voss: { f: 0.3, pose: ivPose('relaxed'), expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } },
    dad: { who: CAST.dadHome, x: w.x, f: -0.75, pose: w.pose, expr: { eyes: 'sad', mouth: 'flat' } },
    front: () => s05_capSide(1225, 705, 1.0, 0),
  }));
}, { sec: 's05', title: 'BEAT: Dad walks out, cap left on the desk' });
{ const t = s05_BEAT_A; SFX(t, 'swish', 0.4);
  for (let k = 0; t + 0.1 + k * s05_fr(5) < CUT('101-narrator'); k++) { const x = 860 - 572 * 0.26 * k; SFX(t + 0.1 + k * s05_fr(5), 'step', 0.5, clamp(((x - 940) * 1.1) / 960, -1, 1)); }
  SFX(t + 0.1 + 2.5 * s05_fr(5), 'door', 0.55, -0.5); }

// =====================================================================
//  101 — Twenty-two years, gone in ten seconds only you saw.
// =====================================================================
SHOT(CUT('101-narrator'), 's05_badge', (lt) => {
  IV_M = IV_MOOD.office; IV_CAM = { x: 960, y: 540, z: 1 }; IV_FOCUS = 1;
  const n = ivCount(LT('101-narrator'), VWE('101-narrator', 'twenty-two'), 0, 22);
  ivStage([
    { d: 3, draw: () => { set_bg(ivVGrad(-200, 1200, ['#9aa4b2', '#6a7486'])); set_bokeh('s05bk', 14, ['rgba(255,255,255,0.35)', 'rgba(200,220,255,0.3)'], 40, 110, 0.4); } },
    { d: 1.12, draw: () => {   // the uniform chest, his cap brim in the corner
      ivRR(-200, -100, 2500, 1400, 0, '#3d6fb6'); ivLine(1290, -100, 1340, 1300, 26, '#2a4f86'); ivDot(1365, 250, 22, '#2a4f86'); ivDot(1385, 700, 22, '#2a4f86');
      ivRR(300, 560, 520, 300, 18, '#3769aa'); ivRR(300, 560, 520, 70, 18, '#2a4f86'); ivDot(560, 600, 16, '#c9973a');
      ivPoly([[1800, -100], [2300, -100], [2300, 1300], [1640, 1300]], '#0c0b10');
    } },
    { d: 1, draw: () => { s05_badge(900, 470, 2.3, n, { shine: (TT - LT('101-narrator')) * 0.6 }); } },
  ]);
}, { sec: 's05', title: 'the 22-YEARS pin on his uniform, counting to 22' });
{ const t = CUT('101-narrator'), a = LT('101-narrator'), b = VWE('101-narrator', 'twenty-two');
  SFX(t, 'whoosh', 0.6);
  for (let k = 2; k < 22; k += 2) SFX(a + (b - a) * (1 - Math.cbrt(1 - k / 22)), 'tick', 0.45, -0.05);
  SFX(b, 'blip', 0.8, -0.05); SFX(b + 0.02, 'metal', 0.5, -0.05); SFX(a + 0.85, 'shimmer', 0.45, 0); }

SHOT(CUT('101-narrator', 'gone'), 's05_leftBehind', () => {
  IV_CAM = { x: 960, y: 540, z: 1.05 }; IV_FOCUS = 1;
  const g = ivPop(VW('101-narrator', 'ten'));
  ivStage(s05_deskTop(() => {
    s05_report(1720, 250, 0.3);
    s05_capTop(820, 560, 1.25, 0.2);
    s05_badge(1240, 660, 0.8, 22, { a: 1 - 0.45 * g });
    P_keys(1040, 860, 3.2, { ang: 0.6 });
    if (g > 0) ivGhost(() => { ivText('10 s', 1240, 690, 230 * (0.9 + 0.1 * g), '#ffffff', { glow: 'rgba(255,255,255,0.8)' }); ctx.beginPath(); ctx.arc(1240, 620, 250, 0, TAU); ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.stroke(); }, 0.85 * g);
  }));
}, { sec: 's05', title: 'top-down: cap, pin and keys left on the desk; ghost "10 s"' });
{ const t = CUT('101-narrator', 'gone'); SFX(t, 'whoosh', 0.5); SFX(t + 0.06, 'metal', 0.3, -0.1); SFX(VW('101-narrator', 'ten'), 'ghost', 0.75, 0.3); }

SHOT(CUT('101-narrator', 'only'), 's05_onlyYou', () => {
  s05_theoGlass(3.6, { eyes: 'sad', mouth: 'flat', look: [0.6, 0] }, () => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ivGhost(() => P_truck(lerp(2300, -400, clamp((TT - VW('101-narrator', 'only')) / 1.6)), 980, 0.45, { dir: -1 }), 0.32);
    ivGlow(1000, 420, 260, 'rgba(90,230,255,0.22)');
    ctx.restore();
  });
}, { sec: 's05', title: 'only you saw: Theo, the ghost truck in the glass' });
{ const t = CUT('101-narrator', 'only'); SFX(t, 'swish', 0.4, -0.3); SFX(VW('101-narrator', 'only') + 0.1, 'ghost', 0.55, 0.6); SFX(VW('101-narrator', 'only') + 0.8, 'whoosh', 0.35, -0.2); }

// =====================================================================
//  102 — That night, Dad sits in the kitchen, still in his uniform.
// =====================================================================
SHOT(CUT('102-narrator'), 's05_night', () => {
  IV_CAM = { x: 960 + (1250 - 960) * 2.6, y: 540 + (350 - 540) * 2.6, z: 4.1 }; IV_FOCUS = 2.6;
  ivStage(s05_kitchen({ theo: null }));
}, { sec: 's05', title: 'that night: the kitchen window, rain, city lights' });
{ const t = CUT('102-narrator'); SFX(t, 'whoosh', 0.7); SFX(t + 0.3, 'car', 0.22, 0.6, 2.0);
  [0.1, 0.32, 0.47, 0.71, 0.9, 1.08].forEach((d, i) => SFX(t + d, 'drip', 0.35 + 0.1 * (i % 2), 0.3 + 0.1 * (i % 3))); }

SHOT(CUT('102-narrator', 'dad'), 's05_kitchenWide', (lt, S) => {
  IV_CAM = { x: 960, y: 540, z: 1.04 * ivPush(S.t0, 0.03, 1.8) }; IV_FOCUS = 1;
  ivStage(s05_kitchen({ theo: null }));
}, { sec: 's05', title: 'Dad alone at the kitchen table under the lamp' });
{ const t = CUT('102-narrator', 'dad'); SFX(t, 'swish', 0.4); SFX(t + 0.25, 'drip', 0.3, 0.4); SFX(t + 0.7, 'drip', 0.25, 0.5); SFX(t + 0.5, 'tick', 0.3, -0.3); SFX(t + 1.0, 'tick', 0.3, -0.3); }

// "still in his uniform." — his hands round the cold mug, the blue sleeves, the cap beside it
SHOT(CUT('102-narrator', 'still'), 's05_mugHands', () => {
  IV_CAM = { x: 860, y: 742, z: 3.4 }; IV_FOCUS = 1;
  let M = null;
  ivStage(s05_kitchen({ theo: null, dad: null,
    act: () => { M = ivMan({ who: CAST.dadHome, x: 740, y: GROUND, h: 560, f: 0.55, pose: ivPose('slump', { hR: [0.15, 0.12], hL: [0.17, 0.12] }), expr: { eyes: 'tired' }, grip: { front: 'hold', back: 'hold' } }); },
    front: () => { if (M) { const [x, y] = M.handR; ivHand(x, y, 0.15, 560, 'glove', 'hold', (c) => IV_M.rim, (v) => v + 4, 1); ivHand(x, y, 0.15, 560, 'glove', 'hold', (c) => c, (v) => v, 1); } },
  }));
}, { sec: 's05', title: 'his hands round the cold mug, still in uniform' });
{ const t = CUT('102-narrator', 'still'); SFX(t, 'swish', 0.35); SFX(t + 0.1, 'cloth', 0.4, -0.05); SFX(t + 0.18, 'glass', 0.22, 0); SFX(t + 0.6, 'drip', 0.25, 0.5); }

// 103 — Dad, I… (Theo at the kitchen door)
SHOT(CUT('103-you'), 's05_theoDoor', () => {
  IV_CAM = { x: 1420, y: 450, z: 2.6 }; IV_FOCUS = 1;
  ivStage(s05_kitchen({ dad: null, theo: { expr: { eyes: 'sad', mouth: 'flat', brow: 'sad', look: [-1, 0.2] }, talk: '103-you', pose: ivPose('relaxed', { hR: [0.08, 0.12] }) } }));
}, { sec: 's05', title: 'Theo: "Dad, I..."' });
{ const t = CUT('103-you'); SFX(t, 'door', 0.4, 0.5); SFX(t + 0.06, 'step', 0.45, 0.5); SFX(t + 0.06 + s05_fr(5), 'step', 0.35, 0.5); }

// 104 — I'd do it again. (Dad lifts his head)
SHOT(CUT('104-dad'), 's05_doItAgain', (lt) => {
  IV_CAM = { x: 830, y: 530, z: 2.8 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.1, s05_fr(6));
  ivStage(s05_kitchen({ theo: null, dad: { pose: s05_mix('slump', ivPose('slump', { tilt: 0.02, lean: 0.18 }), u), expr: { eyes: 'tired', mouth: 'flat', look: [lerp(0.3, 1, u), lerp(0.6, -0.2, u)] }, talk: '104-dad' } }));
}, { sec: 's05', title: 'Dad lifts his head: "I\'d do it again."' });
{ const t = CUT('104-dad'); SFX(t, 'swish', 0.35, -0.2); SFX(t + 0.1, 'cloth', 0.45, -0.2); }

// "I just wish I knew why." — two-shot; he turns the cap in his hands
SHOT(CUT('104-dad', 'i', 1), 's05_wishWhy', () => {
  IV_CAM = { x: 1060, y: 560, z: 1.55 }; IV_FOCUS = 1;
  ivStage(s05_kitchen({ cap: false,
    dad: { pose: ivPose('slump', { hR: [0.2, 0.06], hL: [0.18, 0.08], tilt: 0.15 }), expr: { eyes: 'sad', mouth: 'flat', look: [0.6, 0.6] }, talk: '104-dad', grip: { front: 'hold', back: 'hold' },
      hold: { front: (x, y) => s05_capSide(x + 4, y + 18, 0.85, Math.sin(TT * 2.2) * 0.25) } },
    theo: { x: 1360, expr: { eyes: 'sad', mouth: 'flat', look: [-1, 0.4] } },
  }));
}, { sec: 's05', title: '"I just wish I knew why." Dad turns the cap in his hands' });
{ const t = CUT('104-dad', 'i', 1); SFX(t, 'swish', 0.35); SFX(t + 0.3, 'cloth', 0.3, -0.3); SFX(t + 1.3, 'cloth', 0.3, -0.3); SFX(t + 0.9, 'drip', 0.25, 0.4); }

// 105 — Futures changed: two hundred and twelve. (wide, the counter lands on "twelve")
SHOT(CUT('105-narrator'), 's05_counter', (lt, S) => {
  IV_CAM = { x: 1000, y: 520, z: 1.12 * ivPush(S.t0, 0.03, 1.8) }; IV_FOCUS = 1;
  ivStage(s05_kitchen({ cap: false,
    dad: { pose: ivPose('slump', { hR: [0.2, 0.06], hL: [0.18, 0.08], tilt: 0.25 }), expr: { eyes: 'closed', mouth: 'flat' }, grip: { front: 'hold' }, hold: { front: (x, y) => s05_capSide(x + 4, y + 18, 0.85, 0.1) } },
    theo: { x: 1360, expr: { eyes: 'sad', mouth: 'flat', look: [-1, 0.4] } },
  }));
  const n = ivCount(VW('105-narrator', 'two'), VWE('105-narrator', 'twelve'), 112, 212);
  ivCounter([['FUTURES CHANGED', n, true], ['THANK-YOUS', 0]], ivPop(S.t0 + s05_fr(4)));
}, { sec: 's05', title: 'counter: FUTURES CHANGED 212 lands on "twelve"', boardAt: 2.6 });
{ const t = CUT('105-narrator'), a = VW('105-narrator', 'two'), b = VWE('105-narrator', 'twelve');
  SFX(t, 'swish', 0.35); SFX(t + s05_fr(4), 'pop', 0.7, -0.17);
  for (let k = 10; k < 100; k += 10) SFX(a + (b - a) * (1 - Math.cbrt(1 - k / 100)), 'blip', 0.35, -0.17);
  SFX(b, 'blip', 0.8, -0.17); SFX(b + 0.03, 'ding', 0.55, -0.17); }

// 106 — This one cost the most. (the cap on the table under the lamp)
SHOT(CUT('106-narrator'), 's05_costMost', () => {
  IV_CAM = { x: 1150, y: 640, z: 3.4 }; IV_FOCUS = 1;
  ivStage(s05_kitchen({ theo: null, dad: { expr: { eyes: 'closed', mouth: 'flat' } } }));
  ivCounter([['FUTURES CHANGED', 212, true], ['THANK-YOUS', 0]], 0.55);
}, { sec: 's05', title: 'the cap on the kitchen table, lamp light' });
{ const t = CUT('106-narrator'); SFX(t, 'swish', 0.35); SFX(t + 0.3, 'drip', 0.3, 0.5); SFX(t + 1.1, 'drip', 0.25, 0.4); SFX(t + 1.6, 'tick', 0.25, -0.3); }

// [BEAT] — Theo pulls out the other chair and sits down with him
SHOT(LE('106-narrator'), 's05_sitsDown', (lt) => {
  IV_CAM = { x: 960, y: 560, z: 1.25 }; IV_FOCUS = 1;
  const u = s05_u(lt, 0.25, s05_fr(6));
  ivStage(s05_kitchen({
    dad: { expr: { eyes: 'tired', mouth: 'flat', look: [1, 0] } },
    theo: { x: lerp(1250, 1180, u), f: -0.55, pose: s05_mix('relaxed', 'sit', u), expr: { eyes: 'sad', mouth: 'flat', look: [-1, 0] } },
  }));
}, { sec: 's05', title: 'BEAT: Theo sits down across from Dad' });
{ const t = LE('106-narrator'); SFX(t, 'swish', 0.4); SFX(t + 0.1, 'slide', 0.6, 0.35); SFX(t + 0.25, 'step', 0.4, 0.35); SFX(t + 0.25, 'cloth', 0.4, 0.33); SFX(t + 0.25 + s05_fr(6), 'thud', 0.6, 0.3); SFX(t + 0.9, 'drip', 0.25, 0.5); }
