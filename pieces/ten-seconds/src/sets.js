// =====================================================================
//  SETS — every place of the story (see SETS_API.md). SET_x(o) sets IV_M and returns the ivStage layers.
//  Common options: o.act() draws the actors on the d = 1 plane (between the set's back and front furniture);
//  o.front() runs after the set's front furniture (still on d = 1); o.fg === false drops the soft foreground;
//  o.t = variant; o.mood overrides the mood. GROUND = 900 is the floor at d = 1 in every set.
//  Helpers are set_*; positions per set in SET_POS.
// =====================================================================
IV_MOOD.arcade = { rim: '#ff8ad8', key: [0.6, -0.5], tint: 'rgba(60,10,90,0.14)', haze: '#2c1640', vig: 0.64 };
IV_MOOD.party = { rim: '#ffc27a', key: [0.7, -0.5], tint: 'rgba(90,40,50,0.08)', haze: '#4a2f3a', vig: 0.6 };
IV_MOOD.hall = { rim: '#ffe6c4', key: [-0.6, -0.6], tint: 'rgba(140,120,100,0.06)', haze: '#a89a88', vig: 0.46 };
IV_MOOD.school = { rim: '#fff0d8', key: [-0.7, -0.6], tint: 'rgba(170,180,200,0.05)', haze: '#c9d0da', vig: 0.40 };
const SET_POS = {};

// ---------------------------------------------------------------------
//  shared helpers
// ---------------------------------------------------------------------
function set_bg(fill) { ctx.fillStyle = fill; ctx.fillRect(-1700, -800, 5400, 2800); }
function set_rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function set_floor(y0, stops, o = {}) {   // a floor band from y0 down, with optional plank/tile lines
  ctx.fillStyle = ivVGrad(y0, y0 + (o.depth || 500), stops); ctx.fillRect(-1700, y0, 5400, 1600);
  if (o.planks) for (let i = 1; i < 9; i++) { const y = y0 + Math.pow(i / 8, 1.6) * (o.depth || 500); ivLine(-1700, y, 3700, y, 2, o.planks, 'butt'); }
  if (o.rays) for (let i = -10; i < 26; i++) ivLine(i * 160 - 160, y0, i * 230 - 1000, y0 + 900, 2, o.rays, 'butt');
  if (o.edge) ivLine(-1700, y0 + 1, 3700, y0 + 1, 3, o.edge, 'butt');
}
// a window: glass is a colour/gradient or a function drawing the view (clipped)
function set_window(x, y, w, h, glass, frame, nx = 2, ny = 2, fw = 10) {
  if (typeof glass === 'function') { ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.clip(); glass(x, y, w, h); ctx.restore(); }
  else ivRR(x, y, w, h, 6, glass);
  for (let i = 1; i < nx; i++) ivLine(x + w * i / nx, y, x + w * i / nx, y + h, fw, frame, 'butt');
  for (let j = 1; j < ny; j++) ivLine(x, y + h * j / ny, x + w, y + h * j / ny, fw, frame, 'butt');
  ivRR(x - fw / 2, y - fw / 2, w + fw, h + fw, 8, null, frame, fw * 1.4);
}
function set_clock(x, y, r, face = '#f3e6d0', ink = '#2a2028') {
  ivDot(x, y + r * 0.08, r + 4, 'rgba(0,0,0,0.25)'); ivDot(x, y, r, ink); ivDot(x, y, r * 0.86, face);
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; ivLine(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, r * 0.05, ink); }
  const s = Math.floor(TT) * TAU / 60 - TAU / 4, m = 0.3 * TAU + TT * TAU / 3600 - TAU / 4;
  ivLine(x, y, x + Math.cos(-1.1) * r * 0.45, y + Math.sin(-1.1) * r * 0.45, r * 0.09, ink);
  ivLine(x, y, x + Math.cos(m) * r * 0.66, y + Math.sin(m) * r * 0.66, r * 0.06, ink);
  ivLine(x, y, x + Math.cos(s) * r * 0.72, y + Math.sin(s) * r * 0.72, r * 0.025, '#c8463c'); ivDot(x, y, r * 0.06, ink);
}
function set_steam(x, y, k, a = 0.25, s = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 3; i++) { const u = mod(TT * 0.45 + i / 3 + k * 0.17, 1); ctx.globalAlpha = a * Math.sin(Math.PI * u); ivDot(x + Math.sin(TT * 2 + i * 2 + k) * 6 * s, y - u * 70 * s, (6 + u * 10) * s, '#fff1dc'); }
  ctx.restore();
}
// rain streaks (re-rolled every frame from 6 patterns: cheap)
function set_rain(n, len, a, key = 'rain', col = '#a9c4ff', box = [-500, -300, 2900, 1700]) {
  const r = RNG(key, Math.floor(TT * 24) % 6).f; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < n; i++) { const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.22, y + len); }
  ctx.stroke(); ctx.restore();
}
// soft drifting light discs (bokeh)
function set_bokeh(key, n, cols, r0, r1, a, box = [-400, -100, 2300, 1100]) {
  const r = RNG(key).f; ctx.save();
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * (box[2] - box[0]) + Math.sin(TT * 0.25 + i) * 25, y = box[1] + r() * (box[3] - box[1]) + Math.cos(TT * 0.2 + i * 1.3) * 15;
    const rr = r0 + r() * (r1 - r0), tw = 0.7 + 0.3 * Math.sin(TT * (0.8 + r()) + i);
    ctx.globalAlpha = a * tw; ivDot(x, y, rr, cols[i % cols.length]);
  }
  ctx.restore();
}
// a skyline row: buildings with windows (lit share pLit; a few windows switch on/off every couple of seconds)
function set_skyline(key, x0, x1, base, h0, h1, col, lit, dark, pLit = 0.4, o = {}) {
  const r = RNG(key).f; let x = x0, i = 0;
  while (x < x1) {
    const w = (o.w0 || 140) + r() * (o.w1 || 120), top = base - h0 - r() * (h1 - h0); i++;
    set_rect(x, top, w, base - top + (o.below ?? 400), col);
    if (r() < 0.3) set_rect(x + w * 0.3, top - 30 - r() * 40, w * 0.12, 70, col);   // roof box / antenna
    const ww = o.ww || 18, wh = o.wh || 24, gx = o.gx || 40, gy = o.gy || 46;
    for (let yy = top + 26; yy < base - 30; yy += gy) for (let xx = x + 16; xx < x + w - ww - 10; xx += gx) {
      let on = r() < pLit; const k = r();
      if (k < 0.04) on = hash(key + i + xx + Math.floor(TT / 2.5 + k * 40)) % 3 === 0;
      if (on) set_rect(xx, yy, ww, wh, Array.isArray(lit) ? lit[Math.floor(k * 100) % lit.length] : lit); else if (dark) set_rect(xx, yy, ww, wh, dark);
    }
    x += w + (o.gap ?? 10) + r() * (o.gapR ?? 30);
  }
}
// a background person who idles: small gestures, chatting mouth, own blink
function set_extra(who, x, y, h, f, pose, i, o = {}) {
  const ph = Math.floor(TT * 1.5 + i * 1.7), chat = o.chat !== false && (hash('ch' + i + Math.floor(TT * 0.7 + i * 0.3)) % 3 === 0);
  const P = typeof pose === 'string' ? ivPose(pose) : pose;
  const g = (hash('g' + i + Math.floor(TT * 0.8 + i * 0.37)) % 4 === 0) ? 0.06 : 0;
  const mix = P.seat ? { hR: [P.hR[0] + g * 0.5, P.hR[1] - g * 1.5] } : { hR: [P.hR[0] + g, P.hR[1] - g * 2.5] };
  return ivMan({ who, x, y, h, f, pose: { ...P, ...mix, ...(o.mix || {}) }, expr: { eyes: ['open', 'happy', 'open', 'squint'][ph % 4], mouth: chat ? (ph % 2 ? 'open' : 'grin') : 'smile', look: o.look }, blinkKey: 'bg' + i, talk: null });
}
// a walker looping from xA to xB (feet planted by ivWalk)
function set_walker(who, xA, xB, y, h, off, i, o = {}) {
  const dir = xB > xA ? 1 : -1, speed = h * 0.26 * FPS / 5, P = Math.abs(xB - xA) / speed + (o.rest || 0);
  const t0 = TT - mod(TT + off, P), w = ivWalk(t0, xA, h, dir);
  if (Math.abs(w.x - xA) > Math.abs(xB - xA)) return;
  if (o.draw) return o.draw(w.x, w.pose, dir);
  ivMan({ who, x: w.x, y, h, f: dir * 0.8, pose: w.pose, expr: { eyes: 'open', mouth: 'smile' }, blinkKey: 'w' + i, hold: o.hold, grip: o.grip });
}
function set_poster(x, y, w, h, col, text, tc = '#fff2df', size = 0) {
  ivRR(x + 6, y + 8, w, h, 4, 'rgba(0,0,0,0.25)'); ivRR(x, y, w, h, 4, col);
  if (text) { const lines = text.split('\n'), sz = size || Math.min(w * 0.22, h * 0.2); lines.forEach((t, k) => ivText(t, x + w / 2, y + h * 0.5 + (k - (lines.length - 1) / 2) * sz * 1.15 + sz * 0.35, sz, tc)); }
}
function set_frame(x, y, w, h, inner, frame = '#5a4030') { ivRR(x - 10, y - 10, w + 20, h + 20, 4, frame); ivRR(x, y, w, h, 2, inner); }
function set_plant(x, y, s = 1, pot = '#b0603e', leaf = '#4f7a4a') {
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32 + Math.sin(TT * 0.8 + i) * 0.03; ctx.save(); ctx.translate(x, y - 60 * s); ctx.rotate(a + Math.PI / 2);
    ctx.beginPath(); ctx.ellipse(0, -55 * s, 16 * s, 55 * s, 0, 0, TAU); ctx.fillStyle = i % 2 ? leaf : ivShade(leaf, -0.2); ctx.fill(); ctx.restore(); }
  ivPoly([[x - 42 * s, y - 70 * s], [x + 42 * s, y - 70 * s], [x + 32 * s, y], [x - 32 * s, y]], pot);
}
function set_streetlamp(x, y, h, on = true, col = 'rgba(255,200,130,0.55)') {
  ivLine(x, y, x, y - h, 12, '#15121c', 'butt'); ivLine(x, y - h, x + 70, y - h - 10, 10, '#15121c');
  ivRR(x + 50, y - h - 16, 60, 18, 8, '#15121c');
  if (on) { ivDot(x + 80, y - h + 4, 12, '#ffe2a8'); ivGlow(x + 80, y - h + 4, 180, col); }
}
// a traffic signal head: state 'red' | 'yellow' | 'green' | null; s = scale (1 → 80 x 220)
function set_signal(x, y, s, state, o = {}) {
  const lamp = (k, on, c, cOff, glow) => { const ly = y + (40 + k * 68) * s;
    ivRR(x - 34 * s, ly - 36 * s, 68 * s, 22 * s, 10 * s, '#0c0e16');   // visor
    ivDot(x, ly, 25 * s, on ? c : cOff); if (on) { ivDot(x - 7 * s, ly - 7 * s, 8 * s, 'rgba(255,255,255,0.55)'); ivGlow(x, ly, (o.glow || 170) * s, glow); } };
  ivRR(x - 40 * s, y, 80 * s, 214 * s, 14 * s, o.body || '#1a1e2b'); ivRR(x - 40 * s, y, 80 * s, 214 * s, 14 * s, null, 'rgba(255,255,255,0.08)', 3 * s);
  lamp(0, state === 'red', '#ff3b30', '#3a1414', 'rgba(255,60,40,0.6)');
  lamp(1, state === 'yellow', '#ffc22e', '#3a2a10', 'rgba(255,190,40,0.6)');
  lamp(2, state === 'green', '#38e07a', '#10301c', 'rgba(60,230,120,0.55)');
}
function set_sign(x, y, text, w = 190, c = '#2f7a4b') {   // green street-name blade
  ivRR(x - w / 2, y, w, 40, 6, c); ivRR(x - w / 2 + 4, y + 4, w - 8, 32, 4, null, '#f4f1e6', 2); ivText(text, x, y + 30, 25, '#f4f1e6', { font: IV.sans, weight: 800, track: 1 });
}

// ---------------------------------------------------------------------
//  vehicles (side view, facing right; o.dir = -1 faces left)
// ---------------------------------------------------------------------
// a parked car: x = centre, y = ground, s = 1 → 440 px long. o.col, o.door 0..1 (driver door swings toward us), o.lights, o.night
function set_car(x, y, s, o = {}) {
  const col = o.col || '#c8574a', dk = ivShade(col, -0.3), lt = ivShade(col, 0.25), glass = o.night ? '#1d2438' : '#9fb4c8';
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  ctx.beginPath(); ctx.ellipse(0, 0, 230, 14, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  ivPoly([[-150, -112], [-95, -182], [80, -182], [140, -112]], dk);                     // cabin
  ivPoly([[-132, -116], [-88, -170], [-10, -170], [-10, -116]], glass); ivPoly([[2, -116], [2, -170], [72, -170], [122, -116]], glass);
  ivLine(-80, -165, -40, -125, 6, 'rgba(255,255,255,0.18)');
  ivRR(-222, -122, 444, 86, 30, col); ivRR(-222, -122, 444, 18, 12, lt);                // body
  ivLine(-200, -66, 200, -66, 3, dk); ivLine(-6, -118, -6, -44, 3, dk); ivLine(100, -118, 100, -44, 3, dk);
  ivRR(30, -96, 24, 6, 3, dk);                                                          // handle
  for (const wx of [-138, 138]) { ivDot(wx, -36, 40, '#16141c'); ivDot(wx, -36, 40, '#16141c'); ivDot(wx, -36, 18, '#8d8f9a'); ivDot(wx, -36, 7, '#16141c'); }
  ivRR(204, -104, 18, 20, 6, '#fff3c9'); ivRR(-222, -106, 14, 24, 5, '#c8282a');        // lights
  if (o.lights) { ivGlow(222, -94, 260, 'rgba(255,240,190,0.5)'); ivGlow(-220, -94, 120, 'rgba(255,50,40,0.5)'); }
  const u = clamp(o.door || 0);
  if (u > 0) {   // the door opens toward camera: panel hinged at x 100, swings out, foreshortened and lower
    ivPoly([[-6, -170], [100, -170], [100, -44], [-6, -44]], '#2a1e22');                 // the gap
    const wdt = 106 * (1 - 0.45 * u), dy = 26 * u, x0 = 100 - wdt;
    ivPoly([[x0 - 4 * u, -168 + dy], [100, -170], [100, -44], [x0 - 10 * u, -40 + dy * 1.5]], col, dk, 3);
    ivPoly([[x0 - 2 * u, -164 + dy], [96, -166], [96, -120], [x0 - 4 * u, -118 + dy * 1.2]], glass);
  }
  ctx.restore();
}
// the city bus "9": x = centre, y = ground, s = 1 → 1400 x 470. o.brake 0..1 (brake lights, nose dips), o.roll (wheel angle),
// o.lit (interior on), o.seats(x0, y0, w, h) draws passengers in the windows (local coords), o.night, o.sign
function set_bus(x, y, s, o = {}) {
  const L = 700, br = clamp(o.brake || 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  ctx.beginPath(); ctx.ellipse(0, 0, 760, 22, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
  ctx.save(); ctx.translate(480, -40); ctx.rotate(br * 0.025); ctx.translate(-480, 40);   // nose dip on the brake
  // body
  ivRR(-L, -470, L * 2, 420, 34, '#e9e3d3'); ivRR(-L, -470, L * 2, 30, 20, '#f6f2e6');
  ivRR(-L * 0.55, -505, 360, 40, 10, '#c9c4b6');                                       // roof unit
  ivRR(-L, -168, L * 2, 52, 6, '#d0582f'); ivRR(-L, -116, L * 2, 18, 0, '#2c4f86');    // stripes
  // windows (lit inside)
  const win = o.lit === false ? '#1d2438' : ivVGrad(-430, -200, ['#ffe1a4', '#f2b268']);
  for (let i = 0; i < 6; i++) { const wx = -L + 60 + i * 180; ivRR(wx, -430, 160, 230, 10, win); }
  if (o.seats) { ctx.save(); ctx.beginPath(); for (let i = 0; i < 6; i++) ctx.roundRect(-L + 60 + i * 180, -430, 160, 230, 10); ctx.clip(); o.seats(-L + 60, -430, 1080, 230); ctx.restore(); }
  else for (let i = 0; i < 6; i++) if (hash('pax' + i) % 3) { const hx = -L + 110 + i * 180 + (hash('px' + i) % 50); ivDot(hx, -280, 26, '#1b1418'); ivRR(hx - 30, -258, 60, 70, 20, '#1b1418'); }
  for (let i = 0; i < 6; i++) ivRR(-L + 60 + i * 180, -430, 160, 230, 10, null, '#3a3a44', 8);
  // door + windshield
  ivRR(L - 300, -430, 130, 390, 8, '#2a2f3e'); ivLine(L - 235, -425, L - 235, -45, 4, '#555b6c'); ivRR(L - 296, -426, 122, 170, 6, o.lit === false ? '#1d2438' : '#e8ad66');
  ivPoly([[L - 150, -440], [L - 10, -440], [L + 4, -200], [L - 150, -200]], o.night ? '#202a40' : '#8ea6bd');
  ivLine(L - 120, -420, L - 40, -240, 6, 'rgba(255,255,255,0.15)');
  // sign
  ivRR(L - 150, -466, 150, 30, 4, '#151515'); ivText(o.sign || '9  DOWNTOWN', L - 75, -444, 18, '#ffb347', { font: IV.sans, glow: 'rgba(255,170,60,0.9)' });
  ivRR(-L + 20, -466, 70, 30, 4, '#151515'); ivText('9', -L + 55, -443, 22, '#ffb347', { font: IV.sans, glow: 'rgba(255,170,60,0.9)' });
  // lights
  ivRR(L - 14, -150, 18, 40, 6, '#fff3c9'); if (o.night !== false) ivGlow(L + 10, -130, 360, 'rgba(255,240,190,0.45)');
  ivRR(-L - 4, -200, 16, 70, 6, br > 0.05 ? '#ff3a2a' : '#7a1c18');
  if (br > 0.05) { ivGlow(-L, -165, 260, 'rgba(255,40,30,0.75)', br); ivGlow(-L, -165, 80, 'rgba(255,120,100,0.9)', br); }
  ctx.restore();
  // wheels (not dipping)
  const ang = o.roll || 0;
  for (const wx of [-L + 230, L - 380]) {
    ivPoly([[wx - 100, -50], [wx - 90, -130], [wx + 90, -130], [wx + 100, -50]], '#14121a');
    ivDot(wx, -50, 58, '#121016'); ivDot(wx, -50, 30, '#8a8c96');
    for (let k = 0; k < 5; k++) { const a = ang + k * TAU / 5; ivDot(wx + Math.cos(a) * 18, -50 + Math.sin(a) * 18, 5, '#3a3c46'); }
  }
  ctx.restore();
}
// a passing car at night: just the silhouette with lights (cheap, for traffic in far/mid layers)
function set_carNight(x, y, s, dir, col = '#202534') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ivPoly([[-150, -112], [-95, -175], [80, -175], [140, -112]], ivShade(col, -0.2)); ivRR(-222, -122, 444, 86, 30, col);
  ivPoly([[-130, -116], [-88, -165], [70, -165], [118, -116]], '#3a4560');
  ivDot(-138, -36, 38, '#0c0b10'); ivDot(138, -36, 38, '#0c0b10');
  ivRR(204, -104, 18, 20, 6, '#fff3c9'); ivGlow(300, -94, 300, 'rgba(255,240,190,0.45)'); ivRR(-222, -106, 14, 24, 5, '#ff3a2a'); ivGlow(-222, -94, 120, 'rgba(255,50,40,0.5)');
  ctx.restore();
}
// traffic loop: cars passing along a lane; returns nothing. lane = { y, s, dir, speed, gap, key, night, cols }
function set_traffic(L) {
  const span = 4200, n = L.n || 3;
  for (let i = 0; i < n; i++) {
    const p = mod(TT * L.speed + i * span / n + hash(L.key + i) % 400, span), x = L.dir > 0 ? -1100 + p : 3100 - p;
    const col = (L.cols || ['#c8574a', '#3d5f8a', '#d9cfb8', '#4a6a4a', '#7a4f7a'])[(hash(L.key + 'c' + i)) % 5];
    if (L.night) set_carNight(x, L.y, L.s, L.dir, ivShade(col, -0.55)); else set_car(x, L.y, L.s, { col, dir: L.dir, lights: L.lights });
  }
}

// ---------------------------------------------------------------------
//  furniture
// ---------------------------------------------------------------------
function set_table(x, y, w, top = '#8a6a6e', o = {}) {   // a long table side-on, top at y, legs to o.floor
  const fl = o.floor ?? GROUND, legs = o.legs || '#2b2026';
  ivLine(x - w * 0.4, y + 30, x - w * 0.4, fl, 14, legs, 'butt'); ivLine(x + w * 0.4, y + 30, x + w * 0.4, fl, 14, legs, 'butt');
  ivRR(x - w / 2, y, w, 20, 6, top); ivRR(x - w / 2 + 4, y + 20, w - 8, 14, 4, ivShade(top, -0.32));
  ivLine(x - w / 2 + 8, y + 2, x + w / 2 - 8, y + 2, 2, 'rgba(255,225,185,0.45)');
}
function set_tray(x, y, w, c = '#d9cfc2') {
  ivRR(x - w / 2, y - 10, w, 12, 4, c); ivRR(x - w * 0.32, y - 22, w * 0.26, 14, 7, '#e8a64c'); ivRR(x + w * 0.02, y - 19, w * 0.2, 10, 5, '#7cae5b');
  ivDot(x + w * 0.36, y - 20, w * 0.08, '#e9e2d6'); ivDot(x + w * 0.36, y - 21, w * 0.055, '#c8574a');
}
function set_chair(x, y, h, face = 1, c = '#3a3038') {   // a chair for someone sitting facing `face`; y = floor
  const sy = y - h * 0.3;
  ivLine(x - face * h * 0.1, sy, x - face * h * 0.12, sy - h * 0.34, h * 0.03, c);            // back post
  ivRR(x - face * h * 0.14 - h * 0.02, sy - h * 0.34, h * 0.05, h * 0.2, h * 0.02, c);        // backrest
  ivRR(x - h * 0.12, sy - 4, h * 0.26, h * 0.035, 4, c);                                       // seat
  ivLine(x - h * 0.1, sy, x - h * 0.11, y, h * 0.022, c, 'butt'); ivLine(x + h * 0.12, sy, x + h * 0.13, y, h * 0.022, c, 'butt');
}

// =====================================================================
//  CAFETERIA — warm lunch light, tall windows, far tables with kids, our long table (front edge after the actors)
// =====================================================================
SET_POS.cafeteria = { tableTop: 700, table: [340, 1640], seatL: 700, seatR: 1290, bench: 745, trayL: 760, trayR: 1220 };
function set_cafWall() {
  set_bg(ivVGrad(-200, 760, ['#2e2230', '#4b3644', '#5a4048']));
  const view = (x, y, w, h) => {
    ctx.fillStyle = ivVGrad(y, y + h, ['#ffe6b0', '#f9be78', '#ec9564']); ctx.fillRect(x, y, w, h);
    ivGlow(x + w * 0.5, y + h * 0.75, w * 1.2, 'rgba(255,230,170,0.35)');
    set_rect(x, y + h * 0.62, w, h, '#d98a62');                                                        // far school block
    for (let k = 0; k < 4; k++) set_rect(x + 14 + k * (w / 4), y + h * 0.68, w / 8, h * 0.08, '#f2b27a');
    for (let k = 0; k < 3; k++) { const tx = x + 30 + k * w * 0.42, ty = y + h * 0.6 + (k % 2) * 14 + Math.sin(TT * 0.9 + x + k) * 1.5; ivLine(tx, ty, tx, ty + 60, 6, 'rgba(120,60,60,0.7)'); ivDot(tx, ty, w * 0.12, 'rgba(190,104,78,0.8)'); ivDot(tx + 14, ty - 12, w * 0.08, 'rgba(214,128,90,0.8)'); }   // trees
  };
  for (let i = -3; i < 8; i++) {
    const x = 120 + i * 360;
    if (i === 4) continue;
    set_window(x, 140, 250, 470, view, '#3a2a36', 2, 2, 10);
    ivGlow(x + 125, 380, 330, 'rgba(255,190,120,0.30)');
  }
  // the wall panel: clock + menu board
  set_clock(1685, 215, 52);
  ivRR(1580, 300, 210, 260, 10, '#2c2a26'); ivRR(1590, 310, 190, 240, 6, '#3d4a3e');
  ivText('TODAY', 1685, 352, 30, '#f4ead6', { font: IV.sans, track: 3 });
  ['PIZZA', 'TACOS', 'SALAD', 'MILK'].forEach((t, k) => { ivText(t, 1685, 400 + k * 40, 24, '#f2d9a8', { font: IV.sans, weight: 700 }); });
  set_poster(-420 + 20, 210, 70, 100, '#c8574a', 'EAT\nWELL', '#ffe8cf', 18);
  ivRR(-1200, 640, 4400, 30, 0, '#3a2a34'); set_rect(-1200, 670, 4400, 900, '#3c2c37');                  // wainscot
  for (let i = -8; i < 24; i++) ivLine(i * 140, 680, i * 140, 900, 3, 'rgba(0,0,0,0.12)', 'butt');
}
function set_cafMid() {
  set_floor(770, ['#3e2d33', '#2c2026'], { rays: 'rgba(255,220,180,0.04)', edge: 'rgba(0,0,0,0.35)' });
  // light shafts from the windows onto the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = -2; i < 7; i++) { const x = 120 + i * 360; if (i === 4) continue; ivPoly([[x + 40, 160], [x + 230, 160], [x + 480, 900], [x + 220, 900]], 'rgba(255,190,120,0.045)'); }
  // dust in the light
  const r = RNG('dust').f; for (let i = 0; i < 40; i++) { const x = r() * 2400 - 200 + Math.sin(TT * 0.3 + i) * 20, y = 200 + mod(r() * 600 - TT * 8, 600); ivDot(x, y, 2, 'rgba(255,220,170,0.35)'); }
  ctx.restore();
  const tables = [[-420, 'kidC', 'kidD'], [500, 'kidA', 'kidB'], [1500, 'kidB', 'kidC'], [2450, 'kidA', 'kidD']];
  tables.forEach(([tx, a, b], k) => {
    set_extra(CAST[a], tx - 140, 790, 300, 0.45, 'sitDesk', k * 2);
    set_extra(CAST[b], tx + 160, 790, 300, -0.45, 'sitDesk', k * 2 + 1);
    set_table(tx, 640, 560, '#8a6a6e', { floor: 870 });
    set_tray(tx - 90, 642, 120); set_tray(tx + 100, 642, 110, '#cfc6ba');
    if (k === 1 || k === 2) set_steam(tx - 90, 620, k, 0.3, 0.7);
  });
  // a kid crossing with a tray
  set_walker(CAST.extraB, -300, 2300, 860, 310, 3, 'cafw', { hold: { R: (x, y) => set_tray(x + 10, y - 4, 90) }, grip: { front: 'hold' } });
  // the trash bin
  ivRR(1010, 760, 80, 110, 10, '#4a5a5a'); ivRR(1000, 750, 100, 18, 6, '#5a6b6b');
}
function SET_cafeteria(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.lunch;
  const P = SET_POS.cafeteria;
  return [
    { d: 3.2, draw: set_cafWall },
    { d: 1.9, draw: set_cafMid },
    { d: 1, draw: () => {
      set_floor(845, ['rgba(52,38,44,0)', '#33252b', '#251a20'], { depth: 260 });
      ivRR(P.table[0] - 20, P.bench, P.table[1] - P.table[0] + 40, 16, 6, '#4a363c');                       // the bench behind the seated
      for (const bx of [P.table[0] + 40, (P.table[0] + P.table[1]) / 2, P.table[1] - 40]) ivLine(bx, P.bench + 14, bx, GROUND, 12, '#21181d', 'butt');
      o.act && o.act();
      set_table((P.table[0] + P.table[1]) / 2, P.tableTop, P.table[1] - P.table[0], '#9a7a78');
      if (o.decor !== false) { ivRR(P.table[0] + 60, P.tableTop - 46, 40, 46, 6, '#cfd3d8'); ivRR(P.table[0] + 66, P.tableTop - 40, 28, 14, 3, '#f4f1ea'); set_tray(P.table[1] - 110, P.tableTop + 2, 150, '#cfc6ba'); }
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(-260, 960, 760, 300, 40, '#1c1418'); ivRR(1560, 940, 760, 320, 40, '#1c1418'); ivRR(1640, 900, 260, 40, 12, '#2a1e24'); } }]),
  ];
}

// =====================================================================
//  CLASSROOM — whiteboard "POP QUIZ", desks in rows facing right (front desks after the actors), teacher's desk, windows, day
// =====================================================================
SET_POS.classroom = { seats: [-180, 330, 800], deskDx: 160, deskTop: 706, teacher: 1500, board: [820, 180, 840, 340] };
const SET_MARKER = '"Marker Felt", "Chalkboard SE", "Comic Sans MS", cursive';
function set_desk(x, fl, h, top = '#c9a77a') {   // a school desk for someone sitting at x facing right, sized for an actor of height h
  const y = fl - 0.37 * h, w = 0.4 * h, cx = x + 0.31 * h;
  ivLine(cx - w * 0.38, y + 10, cx - w * 0.42, fl, h * 0.018, '#5b5f68', 'butt'); ivLine(cx + w * 0.38, y + 10, cx + w * 0.42, fl, h * 0.018, '#5b5f68', 'butt');
  ivRR(cx - w * 0.44, y + h * 0.03, w * 0.88, h * 0.07, 3, '#5b5f68');                          // book box
  ivRR(cx - w / 2, y - 2, w, h * 0.03, 4, top); ivLine(cx - w / 2 + 4, y, cx + w / 2 - 4, y, 2, 'rgba(255,240,210,0.5)');
}
function set_classWall() {
  set_bg(ivVGrad(-200, 660, ['#b9ae98', '#cbbfa7']));
  const view = (x, y, w, h) => {
    ctx.fillStyle = ivVGrad(y, y + h, ['#9fcbe6', '#d9ecef']); ctx.fillRect(x, y, w, h);
    for (let k = 0; k < 2; k++) { const cx = x + mod(TT * 6 + k * 170 + x, w + 200) - 100; ivRR(cx, y + 50 + k * 70, 120, 26, 13, 'rgba(255,255,255,0.8)'); }
    set_rect(x, y + h * 0.7, w, h, '#a7b59a');
    const tx = x + w * 0.55, sw = Math.sin(TT * 1.1 + x) * 4; ivLine(tx, y + h, tx, y + h * 0.45, 14, '#6a5444');
    ivDot(tx + sw, y + h * 0.38, w * 0.3, '#6f9a5c'); ivDot(tx - w * 0.18 + sw, y + h * 0.48, w * 0.2, '#5f8a4f'); ivDot(tx + w * 0.2 + sw, y + h * 0.46, w * 0.2, '#7aa866');
  };
  for (let i = 0; i < 4; i++) { const x = -900 + i * 380; set_window(x, 150, 290, 400, view, '#e9e2d2', 2, 2, 10); ivGlow(x + 145, 360, 280, 'rgba(255,250,230,0.25)'); }
  set_clock(690, 200, 46, '#fbf7ee', '#3a3a40');
  set_poster(600, 300, 170, 220, '#e7dcc4', null); for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) ivRR(612 + c * 39, 315 + r * 40, 33, 33, 3, ['#d98c6a', '#8ab0c8', '#e8c56a', '#9fbf8a'][(r + c) % 4]);
  // the whiteboard
  const [bx, by, bw, bh] = SET_POS.classroom.board;
  ivRR(bx - 14, by - 14, bw + 28, bh + 28, 8, '#8a8f96'); ivRR(bx, by, bw, bh, 4, ivVGrad(by, by + bh, ['#f7f7f2', '#e7e8e2']));
  ivLine(bx + 30, by + 30, bx + bw * 0.6, by + bh * 0.9, 50, 'rgba(255,255,255,0.35)');
  ivText('POP QUIZ', bx + bw / 2, by + 110, 92, '#c8352e', { font: SET_MARKER, weight: 700 });
  ivLine(bx + bw / 2 - 210, by + 130, bx + bw / 2 + 210, by + 126, 6, '#c8352e');
  ivText('1. How do plants make food?', bx + 40, by + 200, 34, '#2b4a9a', { font: SET_MARKER, weight: 400, align: 'left' });
  ivText('2. 6CO₂ + 6H₂O → ?', bx + 40, by + 255, 34, '#2b4a9a', { font: SET_MARKER, weight: 400, align: 'left' });
  ivDot(bx + bw - 90, by + 230, 30, null); ctx.beginPath(); ctx.arc(bx + bw - 90, by + 240, 30, 0, TAU); ctx.strokeStyle = '#e09a2a'; ctx.lineWidth = 5; ctx.stroke();
  for (let k = 0; k < 8; k++) { const a = k * TAU / 8; ivLine(bx + bw - 90 + Math.cos(a) * 40, by + 240 + Math.sin(a) * 40, bx + bw - 90 + Math.cos(a) * 54, by + 240 + Math.sin(a) * 54, 4, '#e09a2a'); }
  ivRR(bx + 60, by + bh + 8, bw - 120, 14, 4, '#7a7f86'); ivRR(bx + 120, by + bh, 50, 10, 4, '#c8352e'); ivRR(bx + 190, by + bh, 50, 10, 4, '#2b4a9a');
  // pinboard + shelf
  ivRR(1790, 220, 300, 230, 6, '#b48a5e'); [[1810, 240, '#f4ead6'], [1900, 260, '#e8c56a'], [1990, 235, '#cfe0e6'], [1830, 340, '#e7b8a8'], [1950, 350, '#f4ead6']].forEach(([x, y, c], k) => { ctx.save(); ctx.translate(x + 35, y + 40); ctx.rotate((k % 3 - 1) * 0.06); ivRR(-35, -40, 70, 85, 2, c); ctx.restore(); ivDot(x + 35, y + 4, 6, '#c8352e'); });
  ivRR(2180, 200, 360, 440, 6, '#6e5038'); for (let r = 0; r < 4; r++) { ivRR(2190, 300 + r * 110, 340, 10, 2, '#4e3828'); for (let k = 0; k < 9; k++) ivRR(2200 + k * 36, 300 + r * 110 - 70 - (hash('bk' + r + k) % 20), 28, 70 + (hash('bk' + r + k) % 20), 2, ['#c8574a', '#3d6fb6', '#e8c56a', '#4f7a4a', '#8a5bb0'][(r + k) % 5]); }
  ivRR(-1200, 640, 4400, 24, 0, '#6e7f74'); set_rect(-1200, 664, 4400, 900, '#7f9184');
}
function set_classMid() {
  set_floor(760, ['#8f8474', '#6e6458'], { planks: 'rgba(0,0,0,0.07)', edge: 'rgba(0,0,0,0.25)' });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const x = -900 + i * 380; ivPoly([[x + 20, 170], [x + 270, 170], [x + 620, 900], [x + 300, 900]], 'rgba(255,245,220,0.05)'); }
  ctx.restore();
  // teacher's desk
  const tx = 1480, ty = 690;
  ivRR(tx - 200, ty, 400, 24, 4, '#9a6b48'); ivRR(tx - 190, ty + 24, 380, 150, 4, '#7a5238'); ivRR(tx - 170, ty + 44, 150, 50, 4, '#6a4430');
  ivDot(tx - 120, ty - 22, 22, '#c8352e'); ivLine(tx - 120, ty - 42, tx - 114, ty - 54, 4, '#4f3020');
  [[0, '#3d6fb6'], [1, '#e8c56a'], [2, '#4f7a4a']].forEach(([k, c]) => ivRR(tx + 20 + k * 6, ty - 22 - k * 20, 140 - k * 12, 20, 3, c));
  ivRR(tx + 120, ty - 70, 40, 46, 6, '#e9e2d6'); set_steam(tx + 140, ty - 74, 3, 0.35, 0.6);
  // rows of kids facing the board
  [[-560, 'kidA'], [-200, 'kidC'], [160, 'kidB'], [520, 'kidD'], [2150, 'kidA'], [2500, 'kidB']].forEach(([x, k], i) => {
    set_chair(x, 870, 330, 1, '#4a4a52');
    const raise = i === 2 && mod(TT, 7) < 2.2;
    set_extra(CAST[k], x, 870, 330, 0.5, raise ? ivPose('sitDesk', { hR: [0.12, -0.28] }) : 'sitDesk', 20 + i, { chat: false, look: [1, -0.2] });
    set_desk(x, 870, 330);
  });
}
function SET_classroom(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.school;
  const P = SET_POS.classroom;
  return [
    { d: 3, draw: set_classWall },
    { d: 1.7, draw: set_classMid },
    { d: 1, draw: () => {
      set_floor(860, ['rgba(120,110,96,0)', '#7a6f60', '#5f564b'], { depth: 220 });
      P.seats.forEach((x) => set_chair(x, GROUND, 520, 1, '#3e3e46'));
      o.act && o.act();
      P.seats.forEach((x) => set_desk(x, GROUND, 520));
      if (o.decor !== false) { ivRR(P.seats[0] + 130, P.deskTop - 12, 90, 10, 2, '#f4f1ea'); ivRR(P.seats[2] + 220, P.deskTop - 26, 34, 26, 4, '#c8574a'); }
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(-300, 900, 700, 60, 10, '#3a3028'); ivLine(-100, 960, -100, 1300, 30, '#26221e'); ivRR(1620, 930, 420, 260, 60, '#2b3a5a'); ivRR(1660, 960, 140, 90, 20, '#22304a'); } }]),
  ];
}

// =====================================================================
//  GYM — wooden court, hoop, bleachers with kids, kids playing far, scoreboard, day
// =====================================================================
SET_POS.gym = { hoop: [1520, 470], bleachers: [-800, 520] };
function set_ball(x, y, r) { ivDot(x, y, r, '#e07a32'); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); ctx.strokeStyle = '#3a1e10'; ctx.lineWidth = r * 0.1;
  ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); ctx.beginPath(); ctx.arc(x - r * 1.1, y, r * 0.8, 0, TAU); ctx.arc(x + r * 1.1, y, r * 0.8, 0, TAU); ctx.stroke(); ctx.restore(); }
function set_gymWall() {
  set_bg(ivVGrad(-200, 700, ['#9a8a74', '#c9b898']));
  for (let r = 0; r < 14; r++) for (let c = -12; c < 30; c++) ivRR(c * 120 + (r % 2) * 60, 300 + r * 40, 116, 36, 3, 'rgba(255,245,225,0.06)');   // blocks
  for (let i = -3; i < 9; i++) { const x = 40 + i * 300; ivRR(x, 110, 240, 120, 4, ivVGrad(110, 230, ['#e8f2f2', '#bfd8e0'])); ivLine(x + 120, 110, x + 120, 230, 6, '#6e6a62', 'butt'); ivRR(x - 4, 106, 248, 128, 6, null, '#6e6a62', 8); }
  ivRR(-1200, 250, 4400, 36, 0, '#2c4f86');                                                          // blue band
  for (let i = -3; i < 9; i++) { const x = 190 + i * 300; ivLine(x, 60, x, 90, 4, '#3a3a3a'); ivRR(x - 40, 88, 80, 26, 8, '#55524c'); ivGlow(x, 120, 220, 'rgba(255,250,225,0.35)'); }
  // banner + scoreboard + pennants
  ivRR(160, 330, 520, 120, 8, '#7a2630'); ivText('GO HAWKS', 420, 412, 64, '#f4e6c8', { track: 4 });
  ivRR(1180, 300, 480, 210, 12, '#16151a'); ivRR(1190, 310, 460, 190, 8, '#1f1d24');
  ivText('HOME', 1300, 352, 24, '#f4e6c8', { font: IV.sans }); ivText('GUEST', 1540, 352, 24, '#f4e6c8', { font: IV.sans });
  const sec = Math.max(0, 600 - Math.floor(TT)), clk = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  ivText('42', 1300, 420, 58, '#ff4a36', { font: IV.sans, glow: 'rgba(255,60,40,0.8)' }); ivText('38', 1540, 420, 58, '#ff4a36', { font: IV.sans, glow: 'rgba(255,60,40,0.8)' });
  ivText(clk, 1420, 478, 40, '#ffc23a', { font: IV.sans, glow: 'rgba(255,190,40,0.8)' });
  [[1880, '#7a2630'], [2020, '#2c4f86'], [2160, '#e8c56a'], [-300, '#2c4f86'], [-160, '#7a2630']].forEach(([x, c]) => ivPoly([[x, 330], [x + 100, 330], [x + 50, 470]], c));
  set_rect(-1200, 600, 4400, 200, '#3a5a8a'); for (let i = -10; i < 30; i++) ivLine(i * 150, 600, i * 150, 800, 3, 'rgba(0,0,0,0.25)', 'butt');   // wall mats
  ivRR(800, 470, 280, 330, 6, '#6e6a62'); ivRR(812, 482, 124, 318, 3, '#8a5a3a'); ivRR(944, 482, 124, 318, 3, '#8a5a3a'); ivRR(840, 520, 60, 80, 3, '#cfe0e6'); ivRR(980, 520, 60, 80, 3, '#cfe0e6'); ivLine(900, 650, 980, 650, 8, '#c9ccd4');
  ivRR(890, 420, 100, 40, 6, '#2a0f10'); ivText('EXIT', 940, 451, 28, '#ff5a40', { font: IV.sans, glow: 'rgba(255,70,40,0.9)' }); ivGlow(940, 440, 140, 'rgba(255,60,40,0.25)');
  ivRR(-700, 330, 380, 250, 6, '#5a4030'); ivRR(-690, 340, 360, 230, 4, 'rgba(200,220,230,0.35)'); for (let k = 0; k < 4; k++) { const x = -650 + k * 90; ivRR(x + 10, 520, 40, 40, 3, '#c9a24a'); ivPoly([[x, 460], [x + 60, 460], [x + 44, 515], [x + 16, 515]], '#e8c56a'); }   // trophy case
}
function set_gymMid() {
  set_floor(720, ['#c99a62', '#a77a48'], { planks: 'rgba(80,40,10,0.12)', edge: 'rgba(0,0,0,0.25)' });
  ivLine(-1200, 760, 3200, 760, 6, 'rgba(255,250,235,0.7)', 'butt'); ivLine(-1200, 840, 3200, 840, 5, 'rgba(255,250,235,0.6)', 'butt');
  ctx.beginPath(); ctx.ellipse(1760, 800, 520, 70, 0, Math.PI, TAU); ctx.strokeStyle = 'rgba(255,250,235,0.6)'; ctx.lineWidth = 5; ctx.stroke();
  // bleachers with kids watching
  const B = SET_POS.gym.bleachers;
  for (let r = 0; r < 4; r++) { const y = B[1] + r * 70; ivRR(-1400, y, 1700 - r * 60, 20, 4, '#8a6a48'); set_rect(-1400, y + 20, 1700 - r * 60, 50, '#4a3a2c'); }
  [['kidA', -700, 0], ['kidC', -380, 0], ['kidB', -560, 1], ['kidD', -160, 1], ['extraB', -900, 2], ['kidC', 60, 2]].forEach(([k, x, r], i) => {
    const cheer = hash('chr' + i + Math.floor(TT * 1.2)) % 4 === 0;
    set_extra(CAST[k], x, B[1] + r * 70 + 70 + 0.31 * 240, 240, 0.1, cheer ? ivPose('sit', { hL: [-0.12, -0.25], hR: [0.12, -0.25] }) : 'sit', 40 + i);
  });
  // the hoop
  const [hx, hy] = SET_POS.gym.hoop;
  ivLine(hx + 140, 860, hx + 140, hy - 120, 22, '#3a3d46', 'butt'); ivLine(hx + 140, hy - 120, hx + 40, hy - 120, 16, '#3a3d46');
  ivRR(hx + 20, hy - 200, 30, 190, 4, '#f4f2ee'); ivRR(hx + 26, hy - 120, 18, 60, 2, null, '#c8352e', 4);
  ivLine(hx - 70, hy, hx + 20, hy, 7, '#e0552a');
  for (let k = 0; k < 5; k++) ivLine(hx - 70 + k * 22, hy, hx - 60 + k * 18, hy + 70, 2, 'rgba(255,255,255,0.8)');
  // kids playing: a dribble, a jump
  const by = 840 - Math.abs(Math.sin(TT * 4.2)) * 120;
  set_extra(CAST.kidD, 1080, 860, 300, 0.6, ivPose('stand', { hR: [0.12, 0.18 - (840 - by) / 600] }), 50);
  set_ball(1130, by, 22);
  const jy = Math.max(0, Math.sin(TT * 2.1)) * 60;
  set_extra(CAST.kidB, 1340, 860 - jy, 300, -0.5, ivPose('stand', { hL: [-0.1, -0.25], hR: [0.1, -0.27] }), 51);
  set_walker(CAST.kidC, 2400, 900, 860, 300, 1, 'gymw');
}
function SET_gym(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.school;
  return [
    { d: 3.5, draw: set_gymWall },
    { d: 2, draw: set_gymMid },
    { d: 1, draw: () => {
      set_floor(850, ['rgba(190,140,90,0)', '#b88a56', '#9a6e40'], { depth: 220, planks: 'rgba(80,40,10,0.14)' });
      ivLine(-1200, 960, 3200, 960, 8, 'rgba(255,250,235,0.55)', 'butt');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = -3; i < 9; i++) ivGlow(190 + i * 300, 930, 200, 'rgba(255,240,210,0.06)'); ctx.restore();
      o.act && o.act(); o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(1560, 1010, 600, 30, 6, '#4a4a52'); for (let k = 0; k < 5; k++) set_ball(1620 + k * 110, 975, 50); ivLine(1580, 1030, 1580, 1300, 14, '#3a3a40'); ivRR(-300, 950, 600, 260, 30, '#2a2620'); } }]),
  ];
}

// =====================================================================
//  ARCADE — dark neon room, glowing cabinets, ONE big claw machine (x≈1250), prize counter
//  o.claw = [x, y] of the claw (default: parked top-left of the glass), o.drop 0..1 how far it has come down,
//  o.open (claw open 0..1), o.grab (a plush kind carried by the claw), o.out() draws inside the glass (after plushies)
// =====================================================================
SET_POS.arcade = { machine: [1250, GROUND], glass: [1060, 330, 380, 330], claw: [1180, 380], pile: 600, chute: [1095, 600], counter: [250, 700] };
const SET_NEON = ['#ff5fb8', '#b06cff', '#ffb347', '#7dff8a', '#ff7a4a'];
function set_cab(x, y, s, col, k) {   // an arcade cabinet facing camera
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ivPoly([[-90, 0], [90, 0], [90, -260], [70, -330], [70, -420], [-70, -420], [-70, -330], [-90, -260]], '#17121f');
  ivRR(-70, -420, 140, 40, 6, col); ivText(['BLAST', 'RACE', 'NINJA', 'GALAXY', 'DANCE'][k % 5], 0, -392, 22, '#1a0f1f', { font: IV.sans });
  ivGlow(0, -400, 160, ivHex(col, 0.35));
  const sc = (k + Math.floor(TT * 6)) % 7;
  ivRR(-56, -360, 112, 96, 6, '#0a0712'); ctx.save(); ctx.beginPath(); ctx.rect(-56, -360, 112, 96); ctx.clip();
  ctx.fillStyle = ivVGrad(-360, -264, [ivHex(col, 0.6), '#140a24']); ctx.fillRect(-56, -360, 112, 96);
  for (let i = 0; i < 5; i++) ivRR(-50 + ((i * 37 + sc * 11 + k * 13) % 100), -350 + ((i * 23 + sc * 7) % 80), 12, 12, 2, SET_NEON[(i + k) % 5]);
  ctx.restore(); ivGlow(0, -312, 180, ivHex(col, 0.3));
  ivRR(-84, -262, 168, 40, 6, '#241a30'); ivDot(-40, -244, 9, '#ff4a4a'); ivDot(-10, -248, 7, '#ffd23a'); ivDot(10, -240, 7, '#5fd06a'); ivLine(40, -244, 46, -262, 6, '#888');
  ivRR(-20, -150, 40, 50, 4, '#0d0912'); ivRR(-8, -140, 16, 20, 2, ivHex(col, 0.9));
  ctx.restore();
}
function set_plush(x, y, s, kind, col) {   // a little plush: bear | bunny | star | blob
  const c = col || ['#f29ac0', '#f2d06a', '#9ad0f2', '#b8f29a', '#e0a0ff', '#ffb07a'][hash(kind + x) % 6];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (kind === 'star') { const P = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 14 : 30; P.push([Math.cos(a) * r, Math.sin(a) * r]); } ivPoly(P, c, ivShade(c, -0.3), 2); }
  else {
    if (kind === 'bunny') { ivRR(-14, -46, 10, 30, 5, c); ivRR(4, -46, 10, 30, 5, c); }
    if (kind === 'bear') { ivDot(-16, -20, 9, c); ivDot(16, -20, 9, c); }
    ivDot(0, 12, 22, c); ivDot(0, -8, 20, c); ivDot(-7, -10, 3, '#1a1018'); ivDot(7, -10, 3, '#1a1018'); ivDot(0, -2, 3, ivShade(c, -0.4));
  }
  ctx.restore();
}
function set_claw(x, y, s, open = 0.6) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ivRR(-16, -10, 32, 22, 6, '#c9ccd4');
  for (const sd of [-1, 0, 1]) { const a = sd * (0.3 + open * 0.6); ctx.save(); ctx.rotate(a); ivLine(0, 8, 0, 40, 6, '#b8bcc6'); ivLine(0, 40, -sd * 10 - (sd === 0 ? 0 : 0), 54, 6, '#b8bcc6'); ctx.restore(); }
  ctx.restore();
}
function set_carpet(y0, key, n) {
  set_floor(y0, ['#1c1028', '#120a1a'], { depth: 400 });
  const r = RNG(key).f; ctx.save(); ctx.globalAlpha = 0.5; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = -1400 + r() * 4600, y = y0 + 10 + Math.pow(r(), 0.8) * 500, c = SET_NEON[i % 5]; ctx.strokeStyle = ivHex(c, 0.5);
    if (i % 3 === 0) { ctx.beginPath(); ctx.arc(x, y, 8 + r() * 6, 0, TAU); ctx.stroke(); } else if (i % 3 === 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20, y - 8); ctx.lineTo(x + 34, y + 4); ctx.stroke(); } else ivDot(x, y, 4, ivHex(c, 0.6)); }
  ctx.restore();
}
function set_arcWall() {
  set_bg(ivVGrad(-200, 800, ['#120a1e', '#24123a', '#2e1846']));
  for (let i = -10; i < 30; i++) { const x = i * 130, on = (i + Math.floor(TT * 4)) % 3 === 0; ivDot(x, 120 + Math.sin(i) * 8, 6, on ? '#ffd27a' : '#8a5a3a'); if (on) ivGlow(x, 120, 50, 'rgba(255,200,120,0.4)'); }
  ivText('ARCADE', 960, 230, 110, '#ff6fc0', { glow: 'rgba(255,80,180,0.9)', track: 10 });
  ivText('HI-SCORE', 1900, 280, 54, '#7dff8a', { glow: 'rgba(100,255,120,0.8)', track: 4 });
  if (Math.floor(TT * 3) % 7) ivGlow(960, 200, 600, 'rgba(255,80,180,0.18)');
  for (let i = 0; i < 16; i++) set_cab(-1000 + i * 260, 760, 0.8, SET_NEON[i % 5], i + 3);
}
function set_arcMid() {
  set_carpet(760, 'carpM', 60);
  // prize counter with shelves
  const [cx, cy] = SET_POS.arcade.counter; ivText('PRIZES', cx - 100, 300, 70, '#ffb347', { glow: 'rgba(255,170,60,0.9)', track: 6 });
  ivRR(cx - 560, 360, 900, 20, 4, '#3a2450'); ivRR(cx - 560, 500, 900, 20, 4, '#3a2450');
  for (let k = 0; k < 14; k++) { set_plush(cx - 520 + k * 64, 340, 0.9, ['bear', 'bunny', 'star', 'blob'][k % 4]); set_plush(cx - 500 + k * 62, 480, 0.85, ['star', 'bear', 'blob', 'bunny'][k % 4]); }
  ivRR(cx - 600, cy, 1000, 170, 8, '#2a1840'); ivRR(cx - 610, cy - 16, 1020, 24, 6, '#ff5fb8'); ivGlow(cx - 100, cy, 500, 'rgba(255,90,180,0.18)');
  ivRR(cx - 560, cy + 30, 940, 100, 6, ivVGrad(cy + 30, cy + 130, ['#3a2a5a', '#22143a']));
  for (let k = 0; k < 10; k++) ivRR(cx - 540 + k * 92, cy + 50, 70, 60, 4, ['#ff5fb8', '#ffb347', '#7dff8a', '#b06cff'][k % 4] + '55');
  // cabinets with kids playing
  [[820, 'kidA', -0.8], [1620, 'kidC', -0.8], [1950, 'kidB', 0.8], [2350, 'kidD', 0.8]].forEach(([x, k, f], i) => {
    set_cab(x, 870, 1.05, SET_NEON[(i + 1) % 5], i);
    set_extra(CAST[k], x - f * 140, 870, 320, f, ivPose('stand', { hR: [0.2, 0.06 + (hash('j' + i + Math.floor(TT * 6)) % 3) * 0.02], hL: [0.18, 0.1] }), 60 + i, { chat: false });
  });
  set_walker(CAST.extraC, 2600, -600, 870, 320, 2, 'arcw');
}
function set_clawMachine(o) {
  const [mx] = SET_POS.arcade.machine, [gx, gy, gw, gh] = SET_POS.arcade.glass;
  ivGlow(mx, 500, 520, 'rgba(255,90,190,0.25)');
  ivRR(gx - 30, gy - 90, gw + 60, 90, 16, '#2a0f30');                                                     // marquee
  ivText('CLAW', mx, gy - 26, 58, '#ffd2f0', { glow: 'rgba(255,80,190,1)', track: 6 });
  for (let k = 0; k < 14; k++) { const on = (k + Math.floor(TT * 8)) % 4 === 0; ivDot(gx - 16 + k * (gw + 32) / 13, gy - 82, 5, on ? '#fff3a0' : '#7a3a6a'); }
  ivRR(gx - 20, gy - 6, gw + 40, gh + 12, 8, '#5a1f5e');                                                  // frame
  ivRR(gx, gy, gw, gh, 4, ivVGrad(gy, gy + gh, ['#2a1840', '#3c1e50']));                                  // inside
  ivLine(gx + 10, gy + 18, gx + gw - 10, gy + 18, 8, '#6a6f80', 'butt');                                  // gantry
  // the chute + pile
  const [chx, chy] = SET_POS.arcade.chute; ivRR(chx - 35, chy - 20, 80, gy + gh - chy + 20, 4, '#1c0f26'); ivRR(chx - 40, chy - 26, 90, 12, 4, '#8a8f9a');
  const r = RNG('pile').f, kinds = ['bear', 'bunny', 'star', 'blob'];
  for (let k = 0; k < 18; k++) { const px = gx + 150 + r() * (gw - 175), py = gy + gh - 16 - r() * 50 - (k > 10 ? 30 : 0); set_plush(px, py, 0.9 + r() * 0.3, kinds[k % 4]); }
  // claw + cable
  const c = o.claw || SET_POS.arcade.claw, cy = lerp(c[1], SET_POS.arcade.pile - 30, clamp(o.drop || 0));
  ivLine(c[0], gy + 18, c[0], cy - 8, 3, '#d0d4dc'); ivRR(c[0] - 24, gy + 10, 48, 18, 4, '#8a8f9a');
  if (o.grab) set_plush(c[0], cy + 64, 1, o.grab);
  set_claw(c[0], cy, 1.2, o.open ?? 0.6);
  o.out && o.out();
  // glass
  ctx.save(); ctx.globalAlpha = 0.18; ivPoly([[gx + 40, gy], [gx + 120, gy], [gx + 20, gy + gh], [gx - 60 + 60, gy + gh]], '#ffffff'); ivPoly([[gx + 160, gy], [gx + 185, gy], [gx + 85, gy + gh], [gx + 60, gy + gh]], '#ffffff'); ctx.restore();
  ivRR(gx, gy, gw, gh, 4, null, 'rgba(255,200,240,0.35)', 3);
  // base
  ivRR(gx - 20, gy + gh + 6, gw + 40, GROUND - gy - gh - 6, 8, ivVGrad(gy + gh, GROUND, ['#6a2470', '#3a1240']));
  ivRR(gx + 20, gy + gh + 30, 150, 46, 8, '#2a0f30'); ivLine(gx + 60, gy + gh + 54, gx + 70, gy + gh + 24, 8, '#c9ccd4'); ivDot(gx + 71, gy + gh + 22, 12, '#ff4a6a'); ivDot(gx + 130, gy + gh + 52, 14, '#ffd23a');
  ivRR(gx + 230, gy + gh + 30, 100, 70, 6, '#1c0f26'); ivText('25¢', gx + 280, gy + gh + 78, 26, '#ffb347', { glow: 'rgba(255,170,60,0.8)' });
  ivRR(gx + 30, GROUND - 120, 110, 80, 6, '#1c0f26'); ivText('PRIZE', gx + 85, GROUND - 70, 20, '#ff9ad6', { font: IV.sans });
  ivGlow(mx, GROUND + 10, 400, 'rgba(255,90,190,0.18)');
}
function SET_arcade(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.arcade;
  return [
    { d: 3.2, draw: set_arcWall },
    { d: 1.8, draw: set_arcMid },
    { d: 1, draw: () => { set_carpet(860, 'carpN', 50); set_clawMachine(o); o.act && o.act(); o.front && o.front(); } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(1820, 300, 300, 900, 20, '#140c1c'); ivGlow(1830, 520, 260, 'rgba(176,108,255,0.35)'); ivRR(-260, 980, 500, 300, 30, '#140c1c'); } }]),
  ];
}

// =====================================================================
//  PARTY — living room at night: lamp light, balloons, "HAPPY BIRTHDAY" banner, a cake table, friends far
//  o.lit (candles, default true), o.cake === false hides the cake (draw P_cake yourself), o.hats (party hats on the crowd)
// =====================================================================
SET_POS.party = { cake: [1420, 690], table: [1420, 700, 420], crowd: [900, 2000] };
function set_balloon(x, y, r, col, k) {
  const bx = x + Math.sin(TT * 1.1 + k) * 6, by = y + Math.sin(TT * 1.4 + k * 2) * 8;
  ctx.beginPath(); ctx.moveTo(bx, by + r * 1.15); ctx.quadraticCurveTo(bx + 14, by + r * 2, x, y + r * 3.4); ctx.strokeStyle = 'rgba(240,230,220,0.5)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(bx, by, r, r * 1.15, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();
  ivPoly([[bx - 6, by + r * 1.25], [bx + 6, by + r * 1.25], [bx, by + r * 1.1]], col);
  ctx.beginPath(); ctx.ellipse(bx - r * 0.35, by - r * 0.4, r * 0.18, r * 0.3, -0.4, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
}
function set_hat(m, col) { if (!m) return; const [x, y] = m.head, R = m.R; ivPoly([[x - R * 0.55, y - R * 0.75], [x + R * 0.55, y - R * 0.75], [x + R * 0.1, y - R * 1.9]], col); ivDot(x + R * 0.1, y - R * 1.95, R * 0.16, '#fff3d8'); ivLine(x - R * 0.4, y - R * 1.05, x + R * 0.4, y - R * 1.05, R * 0.08, '#fff3d8'); }
function set_partyWall() {
  set_bg(ivVGrad(-200, 760, ['#2a1a26', '#4a2e3a', '#5a3844']));
  for (let i = -20; i < 50; i++) set_rect(i * 80, -400, 26, 1200, 'rgba(255,220,200,0.035)');
  // window: night city + moon, curtains
  set_window(1300, 170, 420, 400, (x, y, w, h) => { set_rect(x, y, w, h, '#0e1430'); ivDot(x + w * 0.75, y + 80, 34, '#f6ecd0'); ivGlow(x + w * 0.75, y + 80, 140, 'rgba(240,230,200,0.25)');
    set_skyline('ptw', x - 40, x + w + 40, y + h, 80, 260, '#151a34', ['#f6c06a', '#e98d4c'], null, 0.3, { w0: 70, w1: 70, gx: 26, gy: 32, ww: 10, wh: 14 }); }, '#2a1a20', 2, 1, 10);
  for (const [cx, d] of [[1270, 1], [1750, -1]]) { const sw = Math.sin(TT * 0.7) * 4; ivPoly([[cx - 40, 140], [cx + 40, 140], [cx + 40 + d * 10 + sw, 600], [cx - 40 + sw, 600]], '#8a3a46'); }
  ivLine(1200, 140, 1820, 140, 8, '#2a1a20');
  // photos
  [[220, 260, 120, 150, '#c99a72'], [380, 300, 100, 100, '#7a8ab0'], [250, 440, 90, 110, '#a87a8a'], [2000, 260, 140, 110, '#c9b07a']].forEach(([x, y, w, h, c]) => { set_frame(x, y, w, h, c, '#2a1a1e'); ivDot(x + w / 2, y + h * 0.45, w * 0.18, 'rgba(30,20,30,0.6)'); ivRR(x + w * 0.3, y + h * 0.6, w * 0.4, h * 0.4, 6, 'rgba(30,20,30,0.6)'); });
  // banner
  const letters = 'HAPPY BIRTHDAY', x0 = 520, step = 54, cols = ['#ffcf5a', '#ff7a8a', '#7ad0ff', '#9aff8a', '#d08aff'];
  ctx.beginPath(); ctx.moveTo(x0 - 40, 150); ctx.quadraticCurveTo(x0 + step * 7, 230, x0 + step * 14, 150); ctx.strokeStyle = '#e9dcc8'; ctx.lineWidth = 3; ctx.stroke();
  [...letters].forEach((ch, k) => { if (ch === ' ') return; const u = (k + 0.5) / 14, x = x0 - 40 + u * (step * 14 + 40), y = 150 + 4 * 40 * u * (1 - u) + 4, sw = Math.sin(TT * 1.6 + k) * 0.06;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ivPoly([[-23, 0], [23, 0], [23, 52], [0, 66], [-23, 52]], cols[k % 5]); ivText(ch, 0, 40, 30, '#2a1a26'); ctx.restore(); });
  ivRR(-1200, 660, 4400, 16, 0, '#3a2430'); set_rect(-1200, 676, 4400, 600, '#432a36');
}
function set_partyMid(o) {
  set_floor(770, ['#4a3028', '#33201c'], { planks: 'rgba(0,0,0,0.12)', edge: 'rgba(0,0,0,0.3)' });
  // floor lamp
  ivLine(-80, 870, -80, 380, 10, '#1e1418'); ivPoly([[-150, 380], [-10, 380], [-40, 300], [-120, 300]], '#f2c99a'); ivGlow(-80, 360, 420, 'rgba(255,190,120,0.45)'); ivGlow(-80, 870, 300, 'rgba(255,190,120,0.15)');
  // sofa with two friends
  ivRR(60, 640, 620, 120, 30, '#6a3a4a'); ivRR(40, 700, 660, 110, 26, '#7a4656'); ivRR(20, 680, 70, 140, 26, '#6a3a4a'); ivRR(650, 680, 70, 140, 26, '#6a3a4a');
  set_hat(set_extra(CAST.kidA, 250, 870, 320, 0.3, 'sit', 70), '#7ad0ff'); set_hat(set_extra(CAST.kidC, 480, 870, 320, -0.3, 'sit', 71), '#ff7a8a');
  ivLine(40, 810, 40, 870, 10, '#2a1a1e'); ivLine(700, 810, 700, 870, 10, '#2a1a1e');
  // the crowd
  [[960, 'kidB', 0.2], [1120, 'extraC', -0.3], [1660, 'kidD', 0.3], [1840, 'extraA', -0.2], [2040, 'kidA', -0.4], [2300, 'extraB', 0.2]].forEach(([x, k, f], i) => {
    const up = o.cheer || hash('pc' + i + Math.floor(TT * 1.1)) % 5 === 0;
    const m = set_extra(CAST[k], x, 870, 340, f, up ? ivPose('handsUp') : 'relaxed', 72 + i);
    if (o.hats !== false && i % 2 === 0) set_hat(m, ['#ffcf5a', '#9aff8a', '#d08aff'][i % 3]);
  });
  [[2140, 830, '#ff7a8a'], [2190, 846, '#ffcf5a'], [2100, 850, '#7ad0ff']].forEach(([x, y, c]) => { ivRR(x - 30, y - 40, 60, 40 + (870 - y), 4, c); ivLine(x, y - 40, x, 870, 6, 'rgba(255,255,255,0.6)'); });
  [[820, 360, '#ff6a7a'], [880, 300, '#ffcf5a'], [760, 300, '#7ad0ff'], [2420, 340, '#d08aff'], [2480, 290, '#ff6a7a']].forEach(([x, y, c], k) => set_balloon(x, y, 34, c, k));
}
function set_cake(x, y, s, lit) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ivRR(-110, -6, 220, 10, 5, '#e9e2d6');
  ivRR(-90, -90, 180, 86, 12, '#f4d9e0'); ivRR(-90, -90, 180, 22, 10, '#fff4f6'); for (let k = 0; k < 6; k++) ivDot(-75 + k * 30, -66, 9, '#fff4f6');
  ivRR(-60, -150, 120, 62, 10, '#f29ac0'); ivRR(-60, -150, 120, 16, 8, '#fff4f6');
  for (let k = 0; k < 5; k++) { const cx = -40 + k * 20; ivRR(cx - 4, -184, 8, 36, 2, ['#7ad0ff', '#ffcf5a', '#9aff8a'][k % 3]);
    if (lit) { const fl = 1 + Math.sin(TT * 17 + k * 3) * 0.15; ctx.beginPath(); ctx.ellipse(cx, -194, 5 * fl, 11 * fl, 0, 0, TAU); ctx.fillStyle = '#ffd36a'; ctx.fill(); ivGlow(cx, -194, 50, 'rgba(255,200,100,0.5)'); } }
  ctx.restore();
}
function SET_party(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.party;
  const [tx, ty, tw] = SET_POS.party.table;
  return [
    { d: 3, draw: set_partyWall },
    { d: 1.8, draw: () => set_partyMid(o) },
    { d: 1, draw: () => {
      set_floor(860, ['rgba(70,45,38,0)', '#3e2822', '#2a1a16'], { depth: 220, planks: 'rgba(0,0,0,0.12)' });
      // the cake table with a cloth
      ivLine(tx - tw * 0.38, ty + 20, tx - tw * 0.38, GROUND, 12, '#2a1a1e', 'butt'); ivLine(tx + tw * 0.38, ty + 20, tx + tw * 0.38, GROUND, 12, '#2a1a1e', 'butt');
      ivPoly([[tx - tw / 2 - 10, ty], [tx + tw / 2 + 10, ty], [tx + tw / 2 + 20, ty + 110], [tx - tw / 2 - 20, ty + 110]], '#f2e6d8');
      for (let k = 0; k < 9; k++) ivDot(tx - tw / 2 + k * tw / 8, ty + 110, 14, '#f2e6d8');
      ivLine(tx - tw / 2 - 10, ty + 2, tx + tw / 2 + 10, ty + 2, 3, 'rgba(255,240,220,0.8)');
      if (o.cake !== false) { set_cake(tx, ty, 1, o.lit !== false); if (o.lit !== false) ivGlow(tx, ty - 190, 260, 'rgba(255,190,100,0.3)'); }
      ivRR(tx + 140, ty - 40, 50, 40, 4, '#7ad0ff'); ivLine(tx + 165, ty - 40, tx + 165, ty, 5, '#fff'); ivRR(tx - 200, ty - 30, 60, 30, 4, '#9aff8a');
      set_balloon(180, 300, 50, '#ff6a7a', 9); set_balloon(260, 250, 46, '#ffcf5a', 10); set_balloon(1780, 280, 48, '#d08aff', 11);
      o.act && o.act(); o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { set_balloon(-60, 140, 120, '#ff6a7a', 20); set_balloon(1990, 200, 110, '#7ad0ff', 21);
      const r = RNG('conf').f; for (let i = 0; i < 26; i++) { const x = r() * 2200 - 140, y = mod(r() * 1200 + TT * (40 + r() * 40), 1200) - 60; ctx.save(); ctx.translate(x, y); ctx.rotate(TT * 3 + i); ivRR(-8, -4, 16, 8, 2, ['#ffcf5a', '#ff7a8a', '#9aff8a', '#d08aff'][i % 4]); ctx.restore(); } } }]),
  ];
}

// ---------------------------------------------------------------------
//  outdoor palettes + sky (day | sunset | night | rain)
// ---------------------------------------------------------------------
function set_pal(t) {
  return {
    day: { sky: ['#7fa9d4', '#b9d3e6', '#ecdfc8'], far: '#9aa8bc', farLit: '#c9d3de', bld: ['#b8735a', '#d0ae80', '#7a8aa0', '#a8685a', '#8e9a7a'], win: '#4e5c74', winLit: '#6a7a94', lit: 0.1, side: '#b9b0a2', road: '#5a5a62', ink: '#2a2630', lamps: false, wet: false },
    sunset: { sky: ['#2a2350', '#5b3a6c', '#c4636a', '#f2a35e', '#ffd08a'], far: '#3b2948', farLit: '#f7b468', bld: ['#4a3150', '#5a3a52', '#3e2c4a', '#62405a', '#4e3448'], win: '#40304a', winLit: '#f7b468', lit: 0.5, side: '#4a3644', road: '#2e2230', ink: '#1a1220', lamps: true, wet: false },
    night: { sky: ['#070b18', '#121a33', '#1d2440'], far: '#0d1226', farLit: '#f6c06a', bld: ['#1a2036', '#20263e', '#181c30', '#242a44', '#1c2238'], win: '#141a2c', winLit: '#f6c06a', lit: 0.4, side: '#262a3a', road: '#16182a', ink: '#0c0e18', lamps: true, wet: false },
    rain: { sky: ['#070b18', '#111830', '#1a2238'], far: '#0d1226', farLit: '#e9a85a', bld: ['#161c30', '#1c2238', '#141a2c', '#20263c', '#182034'], win: '#121828', winLit: '#e9a85a', lit: 0.4, side: '#1e2232', road: '#121626', ink: '#0a0c16', lamps: true, wet: true },
  }[t] || set_pal('day');
}
function set_skyFar(t, key) {
  const p = set_pal(t);
  set_bg(ivVGrad(-300, 900, p.sky));
  if (t === 'sunset') { ivDot(960, 640, 90, '#fff0c8'); ivGlow(960, 640, 600, 'rgba(255,190,110,0.55)'); ctx.save(); ctx.globalAlpha = 0.6; [[300, 200, 260], [1500, 150, 320], [1000, 290, 200]].forEach(([x, y, w]) => ivRR(x + mod(TT * 4, 200), y, w, 16, 8, '#f6b77a')); ctx.restore(); }
  if (t === 'day') { ctx.save(); ctx.globalAlpha = 0.85; [[200, 180], [900, 120], [1500, 220], [-500, 150], [2300, 160]].forEach(([x, y], k) => { const cx = x + mod(TT * 5 + k * 300, 2600) - 600; ivRR(cx, y, 220, 40, 20, '#f6f2ea'); ivRR(cx + 50, y - 30, 120, 50, 25, '#f6f2ea'); }); ctx.restore(); }
  if (t === 'night' || t === 'rain') { ivDot(1500, 160, 40, t === 'rain' ? '#3a4260' : '#f2ead2'); if (t === 'night') { ivGlow(1500, 160, 200, 'rgba(230,230,210,0.25)'); const r = RNG('stars').f; for (let i = 0; i < 60; i++) ivDot(r() * 3200 - 600, r() * 400 - 50, 1.5 + r() * 1.5, `rgba(255,255,240,${0.3 + 0.4 * Math.abs(Math.sin(TT + i))})`); } }
  // birds (day/sunset)
  if (t === 'day' || t === 'sunset') for (let k = 0; k < 3; k++) { const bx = mod(TT * 60 + k * 90, 2600) - 400, by = 260 + k * 20 + Math.sin(TT * 2 + k) * 10, w = Math.sin(TT * 10 + k) * 8; ctx.beginPath(); ctx.moveTo(bx - 14, by - w); ctx.lineTo(bx, by); ctx.lineTo(bx + 14, by - w); ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.stroke(); }
  set_skyline(key, -1400, 3400, 780, 120, 420, p.far, p.farLit, null, p.lit * 0.8, { w0: 120, w1: 140, gx: 34, gy: 40, ww: 14, wh: 20 });
}
// a building with a ground-floor shop: x, w, top, base, colour, sign
function set_shop(x, w, top, base, col, p, sign, k) {
  set_rect(x, top, w, base - top + 300, col); set_rect(x, top, w, 18, ivShade(col, -0.25));
  const r = RNG('shop' + k).f;
  for (let yy = top + 50; yy < base - 300; yy += 120) for (let xx = x + 40; xx < x + w - 90; xx += 120) {
    const on = r() < p.lit; ivRR(xx, yy, 70, 84, 4, on ? p.winLit : p.win); if (on) ivGlow(xx + 35, yy + 42, 90, 'rgba(255,190,110,0.18)');
    ivRR(xx - 6, yy + 84, 82, 8, 2, ivShade(col, -0.3)); }
  if (!sign) return;
  const sy = base - 250;
  ivRR(x + 30, sy + 70, w - 60, 180, 4, p.lamps ? ivVGrad(sy + 70, base, ['#ffd08a', '#e89a5a']) : ivVGrad(sy + 70, base, ['#5a6a80', '#3e4a5e']));
  if (p.lamps) ivGlow(x + w / 2, base - 40, w * 0.7, 'rgba(255,180,100,0.25)');
  ivLine(x + w / 2, sy + 70, x + w / 2, base, 6, ivShade(col, -0.4)); ivRR(x + w / 2 + 20, sy + 110, 70, 140, 3, ivShade(col, -0.45));   // door
  const aw = k % 2 ? '#c8574a' : '#3d6f6a';                                                          // awning
  ivPoly([[x + 10, sy + 20], [x + w - 10, sy + 20], [x + w + 10, sy + 70], [x - 10, sy + 70]], aw);
  for (let i = 0; i < 8; i++) if (i % 2) ivPoly([[x + 10 + i * (w - 20) / 8, sy + 20], [x + 10 + (i + 1) * (w - 20) / 8, sy + 20], [x - 10 + (i + 1) * (w + 20) / 8, sy + 70], [x - 10 + i * (w + 20) / 8, sy + 70]], '#efe4d0');
  ivRR(x + 40, sy - 40, w - 80, 52, 6, ivShade(col, -0.45)); ivText(sign, x + w / 2, sy, 34, p.lamps ? '#ffe2b0' : '#f4ead6', { track: 3, glow: p.lamps ? 'rgba(255,170,80,0.7)' : null });
}
function set_tree(x, y, s, col) { ivLine(x, y, x, y - 220 * s, 18 * s, '#3a2a24'); const sw = Math.sin(TT * 0.9 + x) * 5; ivDot(x + sw, y - 280 * s, 110 * s, col); ivDot(x - 70 * s + sw, y - 230 * s, 70 * s, ivShade(col, -0.15)); ivDot(x + 80 * s + sw, y - 240 * s, 75 * s, ivShade(col, 0.1)); }
function set_ladder(x, y, len, ang, can = true) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ivLine(-28, 0, -22, -len, 12, '#c9ccd4', 'butt'); ivLine(28, 0, 22, -len, 12, '#c9ccd4', 'butt');
  for (let k = 1; k < 10; k++) { const yy = -k * len / 10; ivLine(-26 + k * 0.6, yy, 26 - k * 0.6, yy, 8, '#a8acb6', 'butt'); }
  ivRR(-34, -10, 18, 14, 4, '#2a2a30'); ivRR(16, -10, 18, 14, 4, '#2a2a30');
  if (can) { ivLine(22, -len * 0.86, 40, -len * 0.86 + 30, 3, '#3a3a40'); ivRR(28, -len * 0.86 + 28, 40, 46, 4, '#d9dde4'); ivRR(28, -len * 0.86 + 28, 40, 10, 3, '#e8c56a'); }
  ctx.restore();
}

// =====================================================================
//  STREET — o.t 'day' | 'sunset': sidewalk + road, shopfronts, passers-by, a parked car (o.door 0..1),
//  scaffolding with a ladder (o.ladder 0..1 tips it over to the left), o.ladderOff hides the ladder, o.car === false hides the car
// =====================================================================
SET_POS.street = { car: [380, 1050, 1.7], ladder: { x: 1520, y: GROUND, len: 620, lean: 0.2 }, curb: 905, road: 1040, scaffold: [1300, 2050] };
function set_streetFront(t, p) {
  const S = SET_POS.street;
  set_floor(820, [p.side, ivShade(p.side, -0.15)], { depth: 120 });
  ['FLOWERS', 'CAFE', 'BOOKS', null, 'DELI', 'LAUNDRY'].forEach((s, k) => {
    const x = [-900, -330, 260, 820, 2100, 2650][k], w = [520, 540, 520, 0, 520, 520][k]; if (!w) return;
    set_shop(x, w, [-60, 230, 120, 0, 280, 140][k], 820, p.bld[k % 5], p, s, k);
  });
  // the building under repair + scaffolding
  const [s0, s1] = S.scaffold; set_rect(s0 - 220, 40, s1 - s0 + 260, 1200, p.bld[3]); set_rect(860, 330, 220, 1200, ivShade(p.bld[1], -0.3));
  for (let yy = 100; yy < 800; yy += 130) for (let xx = s0 - 180; xx < s1; xx += 140) ivRR(xx, yy, 80, 90, 3, p.win);
  ivRR(s0 - 120, 560, 240, 260, 4, ivShade(p.bld[3], -0.4));
  for (let xx = s0 - 200; xx <= s1 + 40; xx += 200) ivLine(xx, 0, xx, 820, 9, '#8a8f9a', 'butt');
  for (let yy = 120; yy < 820; yy += 170) { ivLine(s0 - 210, yy, s1 + 50, yy, 7, '#8a8f9a', 'butt'); ivRR(s0 - 210, yy - 14, s1 - s0 + 260, 12, 2, '#b08a5a'); }
  for (let xx = s0 - 200; xx < s1; xx += 200) ivLine(xx, 120, xx + 200, 290, 5, 'rgba(138,143,154,0.8)');
  ctx.save(); ctx.globalAlpha = 0.55; const fl = Math.sin(TT * 1.3) * 10; ivPoly([[s1 - 300, 130], [s1 + 50, 130], [s1 + 50 + fl, 460], [s1 - 300 + fl * 0.5, 470]], '#3d7a5a'); ctx.restore();
  ivRR(s0 + 220, 600, 200, 60, 4, '#e8c56a'); ivText('WORK ZONE', s0 + 320, 642, 26, '#2a2020', { font: IV.sans });
  set_tree(720, 830, 0.9, t === 'day' ? '#5f8a4f' : '#4a3048'); set_tree(2350, 830, 0.85, t === 'day' ? '#6f9a5c' : '#4a3048');
  set_streetlamp(-150, 840, 520, p.lamps); set_streetlamp(1150, 840, 520, p.lamps);
  // passers-by
  set_walker(CAST.extraA, -900, 2700, 850, 300, 0, 'stw1'); set_walker(CAST.extraC, 2800, -900, 850, 290, 7, 'stw2'); set_walker(CAST.kidB, -900, 2700, 850, 230, 13, 'stw3');
  set_extra(CAST.extraB, 420, 850, 300, -0.3, ivPose('phone'), 90, { chat: false });
}
function SET_street(o = {}) {
  const t = o.t || 'day', p = set_pal(t), S = SET_POS.street;
  IV_M = IV_MOOD[o.mood] || (t === 'sunset' ? IV_MOOD.sunset : IV_MOOD.day);
  return [
    { d: 5, draw: () => set_skyFar(t, 'stsky') },
    { d: 1.8, draw: () => set_streetFront(t, p) },
    { d: 1, draw: () => {
      ctx.fillStyle = ivVGrad(860, 905, [ivHex('#000000', 0), p.side]); ctx.fillRect(-1700, 860, 5400, 45);
      for (let xx = -1600; xx < 3600; xx += 180) ivLine(xx, 880, xx - 20, 905, 2, 'rgba(0,0,0,0.12)');
      set_rect(-1700, 905, 5400, 22, ivShade(p.side, 0.12)); set_rect(-1700, 927, 5400, 900, p.road);
      for (let xx = -1600; xx < 3600; xx += 260) ivRR(xx, 1060, 140, 10, 3, 'rgba(240,230,200,0.55)');
      if (!o.ladderOff) set_ladder(S.ladder.x, S.ladder.y, S.ladder.len, S.ladder.lean - clamp(o.ladder || 0) * 1.05);
      ivRR(1160, 840, 40, 60, 8, '#c8352e'); ivRR(1150, 836, 60, 14, 5, '#a82a24');                      // hydrant
      o.act && o.act();
      if (o.car !== false) set_car(o.carX ?? S.car[0], S.car[1], S.car[2], { col: '#3d5f8a', door: o.door, lights: t !== 'day', night: t !== 'day' });
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivLine(1880, -200, 1880, 1300, 40, p.ink); ivRR(1800, 300, 160, 90, 8, '#2f7a4b'); ivRR(-300, 980, 500, 220, 30, p.ink); } }]),
  ];
}

// =====================================================================
//  CORNER — 5TH ST x MAIN ST. o.t 'day' | 'sunset' | 'night' | 'rain'; o.light 'red' | 'yellow' | 'green' (default red)
//  Main St runs left-right behind the actors on its own layer (d = SET_POS.corner.roadD); o.cars === false stops the traffic;
//  o.road() draws extra vehicles on that layer (lanes at SET_POS.corner.lanes, y of the wheels; far lane drives left, near lane right)
// =====================================================================
SET_POS.corner = { pole: 1500, signal: [1500, 250], walkBox: [1530, 520], curb: 870, roadD: 1.5, lanes: [800, 885], laneS: [1.3, 1.5], crosswalk: [180, 760], shop: [760, 1460] };
function set_cornerFar(t, p) {
  set_floor(620, [p.side, ivShade(p.side, -0.2)], { depth: 80 });
  [[-1000, 480, 'PHARMACY'], [-480, 520, null], [100, 560, null], [2000, 540, 'PIZZA'], [2600, 520, null]].forEach(([x, w, sg], k) => set_shop(x, w, 40 + (k % 3) * 110, 640, p.bld[(k + 2) % 5], p, sg, k + 10));
  // the corner shop
  const [a, b] = SET_POS.corner.shop; set_shop(a, b - a, 120, 640, p.bld[1], p, 'CORNER MARKET', 3);
  if (p.lamps) { const on = Math.floor(TT * 1.5) % 4 !== 0; ivRR(a + 60, 470, 120, 44, 6, '#1a0f14'); ivText('OPEN', a + 120, 503, 30, on ? '#ff5a6a' : '#5a2a30', { font: IV.sans, glow: on ? 'rgba(255,80,100,0.9)' : null }); }
  set_streetlamp(660, 640, 380, p.lamps); set_streetlamp(1760, 640, 380, p.lamps);
  set_walker(CAST.extraA, -700, 2600, 650, 200, 2, 'cfw1'); set_walker(CAST.extraC, 2600, -700, 650, 190, 9, 'cfw2');
  if (t !== 'rain') set_walker(CAST.cyclist, -900, 2700, 650, 200, 5, 'cfw3');
}
function set_cornerRoad(t, p, o) {
  const C = SET_POS.corner;
  set_rect(-1700, 690, 5400, 900, p.road); ivLine(-1700, 692, 3700, 692, 6, ivShade(p.side, 0.1), 'butt');
  for (let xx = -1600; xx < 3600; xx += 240) ivRR(xx, 832, 130, 8, 3, '#e8c56a');
  // crosswalk (bars parallel to the traffic) + stop line
  const [c0, c1] = C.crosswalk; for (let k = 0; k < 6; k++) { const y = 700 + k * 32 + k * k * 2; ivPoly([[c0 + 20 - k * 6, y], [c1 - 20 + k * 6, y], [c1 - 20 + k * 6 + 2, y + 14 + k * 2], [c0 + 20 - k * 6 - 2, y + 14 + k * 2]], 'rgba(235,230,220,0.75)'); }
  ivRR(c1 + 40, 700, 14, 200, 2, 'rgba(235,230,220,0.6)');
  if (p.wet) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const x = -800 + i * 300; ctx.fillStyle = ivVGrad(700, 960, ['rgba(242,162,79,0.25)', 'rgba(0,0,0,0)']); ctx.fillRect(x, 700, 24, 260); } ctx.restore(); }
  if (o.light === 'red' || !o.light) ivGlow(C.pole / 1, 880, 300, 'rgba(255,60,40,0.12)');
  if (o.cars !== false) { set_traffic({ y: C.lanes[0], s: C.laneS[0], dir: -1, speed: 620, key: 'cl0', n: 2, night: p.lamps }); set_traffic({ y: C.lanes[1], s: C.laneS[1], dir: 1, speed: 720, key: 'cl1', n: 2, night: p.lamps }); }
  o.road && o.road();
}
function SET_corner(o = {}) {
  const t = o.t || 'day', p = set_pal(t), C = SET_POS.corner, light = o.light || 'red';
  IV_M = IV_MOOD[o.mood] || IV_MOOD[t === 'day' ? 'day' : t];
  return [
    { d: 5, draw: () => { set_skyFar(t, 'csky'); if (t === 'rain') set_rain(120, 40, 0.3, 'crain0'); } },
    { d: 2.4, draw: () => set_cornerFar(t, p) },
    { d: C.roadD, draw: () => set_cornerRoad(t, p, o) },
    { d: 1, draw: () => {
      // our sidewalk: curb edge at C.curb, slabs, a hydrant, a bin
      set_rect(-1700, C.curb - 14, 5400, 16, ivShade(p.side, 0.15)); set_rect(-1700, C.curb, 5400, 900, p.side);
      for (let xx = -1600; xx < 3600; xx += 200) ivLine(xx, C.curb + 4, xx - 60, 1100, 2, 'rgba(0,0,0,0.12)');
      ivLine(-1700, 960, 3700, 960, 2, 'rgba(0,0,0,0.12)');
      if (p.wet) { ctx.save(); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(700, 960, 200, 18, 0, 0, TAU); ctx.fillStyle = '#2a3048'; ctx.fill(); const rp = mod(TT * 1.3, 1); ctx.beginPath(); ctx.ellipse(650, 958, 50 * rp + 10, 6 * rp + 2, 0, 0, TAU); ctx.strokeStyle = `rgba(200,220,255,${0.6 * (1 - rp)})`; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
      // the signal pole
      const [sx, sy] = C.signal;
      ivLine(C.pole, GROUND + 6, C.pole, sy - 120, 18, '#232634', 'butt'); ivRR(C.pole - 30, GROUND - 20, 60, 26, 6, '#232634');
      set_sign(C.pole - 60, sy - 150, 'MAIN ST', 200); set_sign(C.pole + 70, sy - 110, '5TH ST', 170);
      ivRR(sx - 50, sy - 10, 100, 12, 4, '#232634'); set_signal(sx, sy, 1, light, { glow: p.lamps ? 230 : 150 });
      const [wx, wy] = C.walkBox, walk = light === 'green'; ivRR(wx, wy, 70, 80, 8, '#1a1e2b');
      if (walk) { ivDot(wx + 35, wy + 22, 8, '#f2f2ea'); ivLine(wx + 35, wy + 30, wx + 35, wy + 55, 6, '#f2f2ea'); ivLine(wx + 35, wy + 55, wx + 26, wy + 70, 5, '#f2f2ea'); ivLine(wx + 35, wy + 55, wx + 44, wy + 70, 5, '#f2f2ea'); }
      else { ivRR(wx + 18, wy + 18, 34, 44, 10, '#ff7a3a'); ivGlow(wx + 35, wy + 40, 70, 'rgba(255,120,50,0.5)'); }
      ivRR(C.pole - 12, 640, 24, 34, 4, '#e8c56a'); ivDot(C.pole, 657, 8, '#2a2a30');
      ivRR(260, 810, 56, 80, 10, '#c8352e'); ivRR(250, 804, 76, 16, 6, '#a82a24'); ivDot(288, 840, 10, '#a82a24');      // hydrant
      ivRR(1760, 760, 110, 140, 8, '#2f4a3a'); ivRR(1750, 750, 130, 18, 6, '#26392e');                                     // bin
      o.act && o.act(); o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { if (t === 'rain') set_rain(70, 120, 0.35, 'crain1'); ivLine(-120, -200, -120, 1300, 60, p.ink); ivRR(-60, 280, 30, 360, 6, '#c9a24a'); } }]),
  ];
}

// ---------------------------------------------------------------------
//  rainy night street seen through glass (shared by the bus sets)
// ---------------------------------------------------------------------
function set_wetStreet(t, light, o = {}) {
  const p = set_pal(t);
  set_skyFar(t, o.key || 'bfsky');
  ctx.fillStyle = ivVGrad(760, 1100, ['#1a2038', '#0c1022']); ctx.fillRect(-1700, 760, 5400, 900);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) { const x = -900 + i * 300; ctx.globalAlpha = 0.3; ctx.fillStyle = ivVGrad(780, 1000, ['#f2a24f', 'rgba(0,0,0,0)']); ctx.fillRect(x + Math.sin(TT * 3 + i) * 3, 780, 26, 220); }
  ctx.restore();
  for (let xx = -1600; xx < 3600; xx += 260) ivRR(xx, 880, 130, 8, 3, 'rgba(232,197,106,0.55)');
  if (o.signal !== false) {
    const [sx, sy] = o.signal || [1530, 250];
    ivLine(sx, 780, sx, sy + 200, 16, '#121522'); set_signal(sx, sy, 1, light, { glow: 200 });
    const c = { red: 'rgba(255,60,40,0.25)', yellow: 'rgba(255,190,40,0.22)', green: 'rgba(60,230,120,0.2)' }[light];
    if (c) { ivGlow(sx, 880, 260, c); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = ivVGrad(780, 1050, [c, 'rgba(0,0,0,0)']); ctx.fillRect(sx - 30, 780, 60, 270); ctx.restore(); }
  }
  // oncoming headlights drifting in the distance
  for (let k = 0; k < 3; k++) { const u = mod(TT * 0.15 + k / 3, 1), x = lerp(1100, -200 - k * 300, u); ivGlow(x, 770, 60 + u * 100, 'rgba(255,240,200,0.35)'); ivGlow(x + 50 + u * 60, 770, 60 + u * 100, 'rgba(255,240,200,0.35)'); }
}
function set_drops(x, y, w, h, key, n = 90) {   // raindrops on glass, sliding down
  const r = RNG(key).f; ctx.save();
  for (let i = 0; i < n; i++) { const dx = x + r() * w, sp = r() < 0.2 ? 40 + r() * 80 : 4 + r() * 8, dy = y + mod(r() * h + TT * sp, h), rr = 2 + r() * 4; ctx.globalAlpha = 0.55; ivDot(dx, dy, rr, 'rgba(200,220,255,0.7)'); if (sp > 30) { ctx.globalAlpha = 0.25; ivLine(dx, dy - 30, dx, dy, rr * 0.8, 'rgba(200,220,255,0.6)'); } }
  ctx.restore();
}

// =====================================================================
//  BUS FRONT — inside the bus looking out of the windshield. o.t 'rain' (default) | 'night'; o.light (default 'red');
//  o.out() draws in the street beyond (truck, ghost) between the street and the glass; o.wipers === false parks them
// =====================================================================
SET_POS.busFront = { glass: [120, 110, 1680, 560], wheel: [720, 790, 120], driver: [520, 1130, 640], pole: 1300, rider: [1420, 1100, 640], signal: [1530, 250] };
function SET_busFront(o = {}) {
  const t = o.t || 'rain', B = SET_POS.busFront, [gx, gy, gw, gh] = B.glass;
  IV_M = IV_MOOD[o.mood] || IV_MOOD[t === 'night' ? 'night' : 'rain'];
  return [
    { d: 4, draw: () => { set_wetStreet(t, o.light || 'red', { signal: B.signal }); if (t === 'rain') set_rain(160, 40, 0.35, 'bfr'); } },
    { d: 2, draw: () => { o.out && o.out(); } },
    { d: 1, draw: () => {
      ctx.fillStyle = '#0d1018'; ctx.beginPath(); ctx.rect(-1700, -800, 5400, 2800); ctx.roundRect(gx, gy, gw, gh, 40); ctx.fill('evenodd');
      ivRR(-1700, -800, 5400, gy + 800 - 30, 0, '#11141e'); ivRR(gx + 200, gy - 60, 400, 40, 8, '#0a0c12');                         // ceiling + visor
      ivRR(gx, gy, gw, gh, 40, null, '#1d2333', 18); ivLine(960, gy, 960, gy + gh, 16, '#151a26', 'butt');
      if (t === 'rain') set_drops(gx + 20, gy + 20, gw - 40, gh - 40, 'bfd');
      // wipers
      const wa = o.wipers === false ? -2.95 : lerp(-2.95, -0.4, (1 - Math.cos(TT * 2.6)) / 2);
      for (const px of [gx + 420, gx + 1180]) { const ex = px + Math.cos(wa) * 470, ey = gy + gh - 20 + Math.sin(wa) * 470; ivLine(px, gy + gh - 20, ex, ey, 7, '#05070c'); ivLine(lerp(px, ex, 0.35), lerp(gy + gh - 20, ey, 0.35), ex, ey, 12, '#0a0c12'); }
      ivGlow(B.signal[0], 300, 400, 'rgba(255,40,30,0.04)');
      // dashboard
      ctx.fillStyle = ivVGrad(640, 1100, ['#1c2232', '#0b0e16']); ctx.beginPath(); ctx.moveTo(-1700, 700); ctx.lineTo(-200, 700); ctx.quadraticCurveTo(960, 620, 2100, 700); ctx.lineTo(3700, 700); ctx.lineTo(3700, 1900); ctx.lineTo(-1700, 1900); ctx.fill();
      ivLine(-200, 700, 2100, 700, 3, 'rgba(140,170,220,0.25)');
      ivRR(330, 700, 180, 60, 10, '#0e2a22'); ivText('LINE 9', 420, 742, 30, '#5df0a8', { glow: 'rgba(80,255,170,0.8)', font: IV.sans }); ivGlow(420, 730, 140, 'rgba(60,255,160,0.15)');
      for (const [cx, v] of [[780, 0.3], [900, 0.6]]) { ivDot(cx, 760, 40, '#0a0d14'); ivDot(cx, 760, 34, '#16202e'); const a = Math.PI * (0.8 + v + Math.sin(TT * 3) * 0.02); ivLine(cx, 760, cx + Math.cos(a) * 26, 760 + Math.sin(a) * 26, 4, '#ff9a4a'); ivGlow(cx, 760, 60, 'rgba(255,160,80,0.12)'); }
      for (let k = 0; k < 5; k++) ivDot(1040 + k * 26, 744, 6, (k === 2 && Math.floor(TT * 2) % 2) ? '#ffb347' : ['#3aa36b', '#5df0a8', '#ffb347', '#3a4258', '#3a4258'][k]);
      ivRR(1120, 780, 160, 120, 10, '#141a26'); ivRR(1140, 800, 120, 20, 4, '#2a3244'); ivText('FARE', 1200, 870, 24, '#8a9ab8', { font: IV.sans });      // fare box
      // driver seat + wheel
      ivRR(B.driver[0] - 160, 760, 90, 360, 30, '#1a1e2a');
      const [wx, wy, wr] = B.wheel; ctx.beginPath(); ctx.ellipse(wx, wy, wr, wr, 0, 0, TAU); ctx.lineWidth = 20; ctx.strokeStyle = '#05070c'; ctx.stroke(); ivLine(wx, wy, wx + 60, wy + 120, 26, '#05070c');
      ivLine(B.pole, -800, B.pole, 1300, 20, '#c3c9d4', 'butt'); ivLine(B.pole - 10, -800, B.pole - 10, 1300, 4, 'rgba(255,255,255,0.4)');
      o.act && o.act(); o.front && o.front();
    } },
  ];
}

// =====================================================================
//  BUS AISLE — inside, a section along the bus (front of the bus is to the LEFT): seats against the window wall,
//  passengers sit facing left (f < 0) at SET_POS.busAisle.seats (pose 'sit', h ≈ 500), seat 4 marked; poles, hand loops,
//  rainy windows with city lights streaming past (o.speed, default 1; 0 = stopped); aisle floor = GROUND
// =====================================================================
SET_POS.busAisle = { seats: [{ x: 160, n: 2 }, { x: 560, n: 3 }, { x: 960, n: 4 }, { x: 1360, n: 5 }, { x: 1760, n: 6 }, { x: -240, n: 1 }, { x: 2160, n: 7 }], seat4: 960, poles: [360, 1160, 1960], win: [250, 560], h: 500 };
function set_busOutside(o) {
  const sp = o.speed ?? 1, off = mod(TT * 260 * sp, 1600);
  set_bg(ivVGrad(-200, 900, ['#070b18', '#121a33', '#1d2440']));
  ctx.save(); ctx.translate(off * 0.4, 0); for (let k = -1; k < 2; k++) set_skyline('baF', -1400 + k * 1600, -1400 + (k + 1) * 1600, 820, 200, 520, '#0d1226', ['#f6c06a', '#e98d4c'], null, 0.3, { w0: 120, w1: 120, gx: 34, gy: 40, ww: 14, wh: 20 }); ctx.restore();
  ctx.save(); ctx.translate(off, 0); for (let k = -2; k < 3; k++) { const x = k * 800 + 200; ivLine(x, 900, x, 360, 10, '#0a0d1a'); ivGlow(x + 40, 370, 260, 'rgba(255,190,110,0.45)'); ivDot(x + 40, 370, 12, '#ffe2a8'); } ctx.restore();
  set_rain(120, 50, 0.3, 'bar0');
}
function SET_busAisle(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.rain;
  const A = SET_POS.busAisle, [w0, w1] = A.win, sp = o.speed ?? 1, sway = (k) => Math.sin(TT * 2.2 + k) * 0.06 * sp + (o.lurch || 0) * 0.5;
  return [
    { d: 4, draw: () => set_busOutside(o) },
    { d: 1, draw: () => {
      // the wall with windows
      ctx.fillStyle = ivVGrad(-200, 900, ['#2a3044', '#3a4258']); ctx.beginPath(); ctx.rect(-1700, -800, 5400, 2800);
      for (let k = -2; k < 7; k++) ctx.roundRect(-440 + k * 400 + 30, w0, 340, w1 - w0, 18); ctx.fill('evenodd');
      for (let k = -2; k < 7; k++) { const x = -440 + k * 400 + 30; ivRR(x, w0, 340, w1 - w0, 18, null, '#1a1e2c', 10); set_drops(x + 8, w0 + 8, 324, w1 - w0 - 16, 'bad' + k, 30); ivLine(x + 40, w0 + 20, x + 120, w1 - 20, 20, 'rgba(255,255,255,0.04)'); }
      set_rect(-1700, -800, 5400, 860, '#1e2232'); ivRR(-1700, 40, 5400, 24, 0, '#2c3246');                                   // ceiling
      ivRR(-1700, 160, 5400, 70, 0, '#262c3e'); for (let k = -2; k < 7; k++) ivRR(-400 + k * 400, 170, 300, 50, 4, ['#3a4258', '#4a3a58', '#3a5048'][(k + 9) % 3]);   // ad strip
      // LED line sign
      ivRR(100, 80, 560, 60, 6, '#0a0a0e'); ctx.save(); ctx.beginPath(); ctx.rect(110, 84, 540, 52); ctx.clip();
      ivText('LINE 9  •  NEXT: 5TH & MAIN  •  LINE 9  •  NEXT: 5TH & MAIN', 650 - mod(TT * 90, 900), 124, 32, '#ffb347', { font: IV.sans, align: 'left', glow: 'rgba(255,170,60,0.9)' }); ctx.restore();
      ivRR(-1700, w1 + 10, 5400, 40, 0, '#2c3246'); set_rect(-1700, w1 + 50, 5400, 900, '#262b3c');                          // sill + lower wall
      ivLine(-1700, 640, 3700, 640, 8, '#c3a640', 'butt');                                                                   // grab rail
      // floor
      ctx.fillStyle = ivVGrad(860, 1100, ['#1c2030', '#12141e']); ctx.fillRect(-1700, 860, 5400, 900); ivLine(-1700, 862, 3700, 862, 3, 'rgba(255,200,120,0.15)');
      for (let xx = -1600; xx < 3600; xx += 60) ivLine(xx, 880, xx - 40, 1100, 2, 'rgba(255,255,255,0.03)');
      // seats (facing left)
      A.seats.forEach(({ x, n }) => {
        const hi = n === 4, c = hi ? '#8a3a46' : '#3d4f86';
        ivRR(x + 70, 500, 54, 270, 20, ivShade(c, -0.15)); ivRR(x - 60, 738, 200, 42, 14, c); ivRR(x - 50, 780, 170, 24, 6, ivShade(c, -0.35));
        ivLine(x + 30, 800, x + 30, GROUND, 14, '#14161e', 'butt'); ivLine(x + 97, 500, x + 97, 470, 10, '#c3c9d4');
        ivRR(x + 60, 390, 70, 50, 8, hi ? '#ffd23a' : '#d8dce4'); ivText(String(n), x + 95, 430, 38, '#1a1e2c', { font: IV.sans });
        if (hi) { ivRR(x - 70, 420, 120, 40, 6, '#ffd23a'); ivText('PRIORITY', x - 10, 448, 18, '#1a1e2c', { font: IV.sans }); }
      });
      // a stop-request light blinking
      const on = Math.floor(TT * 2) % 2 === 0; ivRR(1680, 90, 180, 46, 6, '#0a0a0e'); ivText('STOP', 1770, 124, 28, on ? '#ff4a3a' : '#3a1a18', { font: IV.sans, glow: on ? 'rgba(255,60,40,0.9)' : null });
      o.act && o.act();
      A.poles.forEach((x) => { ivLine(x, -800, x, GROUND + 10, 18, '#c3a640', 'butt'); ivLine(x - 5, -800, x - 5, GROUND, 4, 'rgba(255,240,200,0.45)'); });
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.62, draw: () => {
      ivLine(-1700, 70, 3700, 70, 14, '#8a8f9a');
      for (let k = 0; k < 9; k++) { const x = -200 + k * 300, a = sway(k); ctx.save(); ctx.translate(x, 70); ctx.rotate(a); ivLine(0, 0, 0, 110, 10, '#2a2e3a'); ctx.beginPath(); ctx.arc(0, 140, 30, 0, TAU); ctx.lineWidth = 12; ctx.strokeStyle = '#d8dce4'; ctx.stroke(); ctx.restore(); }
      ivRR(1650, 860, 500, 400, 40, '#20283e');
    } }]),
  ];
}

// =====================================================================
//  BUS SIDE — outside, night, rain: the bus side-on on a wet street. o.busX (centre, default 700), o.brake 0..1,
//  o.seats(x0, y0, w, h) passengers in the windows (bus-local coords), o.light (signal at the crossing, default 'red').
//  The crossing street is at x ≈ 1700 (SET_POS.busSide.cross): o.act draws the truck crossing in front of the bus.
// =====================================================================
SET_POS.busSide = { busX: 700, busS: 1, cross: 1700, signal: [1850, 200] };
function SET_busSide(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.rain;
  const B = SET_POS.busSide, bx = o.busX ?? B.busX, t = o.t || 'rain', p = set_pal(t);
  return [
    { d: 5, draw: () => { set_skyFar(t, 'bssky'); set_rain(100, 40, 0.3, 'bsr0'); } },
    { d: 2.2, draw: () => {
      set_floor(700, [p.side, ivShade(p.side, -0.2)], { depth: 80 });
      [[-1000, 520, 'LAUNDRY'], [-420, 480, null], [120, 560, 'DINER'], [740, 500, null], [1300, 520, 'HOTEL'], [1880, 520, null], [2460, 500, 'BAR']].forEach(([x, w, sg], k) => set_shop(x, w, -40 + (k % 3) * 120, 720, p.bld[k % 5], p, sg, k + 20));
      set_streetlamp(500, 720, 420, true); set_streetlamp(1500, 720, 420, true);
      set_walker(CAST.extraA, 2600, -800, 730, 230, 4, 'bsw', { draw: (x, pose, dir) => { const m = ivMan({ who: CAST.extraA, x, y: 730, h: 230, f: dir * 0.8, pose: { ...pose, hR: [0.06, -0.05] } }); ivLine(m.handR[0], m.handR[1], m.handR[0], m.handR[1] - 90, 4, '#222'); ctx.beginPath(); ctx.arc(m.handR[0], m.handR[1] - 80, 80, Math.PI, TAU); ctx.fillStyle = '#7a2630'; ctx.fill(); } });
      set_rain(120, 40, 0.3, 'bsr1');
    } },
    { d: 1, draw: () => {
      ctx.fillStyle = ivVGrad(780, 1100, ['#1a2038', '#0c1022']); ctx.fillRect(-1700, 780, 5400, 900);
      ivLine(-1700, 782, 3700, 782, 4, 'rgba(140,170,220,0.2)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const x = -900 + i * 330; ctx.globalAlpha = 0.22; ctx.fillStyle = ivVGrad(800, 1060, ['#f2a24f', 'rgba(0,0,0,0)']); ctx.fillRect(x, 800, 24, 260); } ctx.restore();
      for (let xx = -1600; xx < 3600; xx += 260) ivRR(xx, 1000, 130, 8, 3, 'rgba(232,197,106,0.4)');
      // the signal at the crossing
      const [sx, sy] = B.signal, light = o.light || 'red'; ivLine(sx, 800, sx, sy + 200, 16, '#121522'); set_signal(sx, sy, 1, light, { glow: 220 });
      if (light === 'red') ivGlow(sx, 960, 260, 'rgba(255,60,40,0.18)');
      // the bus + its reflection
      ctx.save(); ctx.globalAlpha = 0.18; ctx.translate(0, 2 * GROUND + 8); ctx.scale(1, -0.45); set_bus(bx, GROUND, B.busS, { brake: o.brake, night: true, roll: bx / 58 }); ctx.restore();
      set_bus(bx, GROUND, B.busS, { brake: o.brake, roll: bx / 58, seats: o.seats, night: true });
      // splashes
      for (let k = 0; k < 8; k++) { const u = mod(TT * 1.6 + k * 0.37, 1), x = -600 + ((k * 397) % 2800), y = 930 + (k % 3) * 40; ctx.beginPath(); ctx.ellipse(x, y, 10 + u * 40, 3 + u * 8, 0, 0, TAU); ctx.strokeStyle = `rgba(190,210,255,${0.5 * (1 - u)})`; ctx.lineWidth = 2; ctx.stroke(); }
      o.act && o.act(); o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { set_rain(60, 130, 0.35, 'bsr2'); ivLine(-60, -200, -60, 1300, 50, '#0a0c16'); } }]),
  ];
}

// =====================================================================
//  OFFICE — bus company office, cool light: blinds, glass partition onto a corridor, a wall monitor (o.screen(w, h)
//  draws CCTV into it, local coords), framed "SAFETY FIRST", Voss's desk (front, after the actors), a visitor chair.
//  The wall is its own layer (d = 1.3); o.sharpWall makes it sharp (for screen inserts)
// =====================================================================
SET_POS.office = { desk: [1300, 705, 560], boss: 1390, visitor: 640, stand: 860, screen: [880, 170, 500, 290], poster: [1470, 190, 220, 230] };
function set_officeWall(o) {
  const O = SET_POS.office;
  ctx.fillStyle = ivVGrad(-200, 900, ['#7d8898', '#9aa4b2']); ctx.beginPath(); ctx.rect(-1700, -800, 5400, 2800); ctx.rect(340, 120, 440, 740); ctx.fill('evenodd');
  ivRR(330, 110, 460, 760, 4, null, '#4a5262', 16); ivLine(560, 120, 560, 860, 8, '#4a5262', 'butt');
  ivText('OPERATIONS', 450, 330, 22, 'rgba(255,255,255,0.55)', { font: IV.sans, track: 3 });
  // blinds window: daylight through slats
  ivRR(-760, 140, 1000, 520, 6, '#d9e2ea'); for (let y = 150; y < 650; y += 26) { ivRR(-750, y, 980, 16, 3, '#eef1f4'); ivLine(-750, y + 16, 230, y + 16, 2, 'rgba(0,0,0,0.12)'); }
  ivRR(-770, 130, 1020, 540, 6, null, '#4a5262', 14); ivLine(-260, 140, -260, 660, 3, '#8a929e');
  // monitor
  const [mx, my, mw, mh] = O.screen; ivRR(mx - 18, my - 18, mw + 36, mh + 36, 10, '#15171c');
  ctx.save(); ctx.beginPath(); ctx.rect(mx, my, mw, mh); ctx.clip(); ctx.translate(mx, my);
  if (o.screen) o.screen(mw, mh); else { ctx.fillStyle = ivVGrad(0, mh, ['#1a2a3a', '#0e1824']); ctx.fillRect(0, 0, mw, mh); for (let k = 0; k < 4; k++) ivRR(20 + (k % 2) * (mw / 2), 20 + Math.floor(k / 2) * (mh / 2), mw / 2 - 30, mh / 2 - 30, 4, '#22384c'); ivText('CAM 01-04', 20, mh - 14, 18, '#9ab0c8', { font: IV.sans, align: 'left' }); if (Math.floor(TT * 1.5) % 2) ivDot(mw - 30, 24, 8, '#ff3a2a'); }
  ctx.restore(); ivLine(mx + 30, my + mh + 18, mx + mw - 30, my + mh + 18, 6, '#2a2c32');
  // poster
  const [px, py, pw, ph] = O.poster; set_frame(px, py, pw, ph, '#f2ede2', '#2a2c32');
  ivRR(px + 14, py + 14, pw - 28, ph * 0.45, 4, '#2c4f86'); ivText('SAFETY', px + pw / 2, py + ph * 0.62, 40, '#c8352e'); ivText('FIRST', px + pw / 2, py + ph * 0.84, 40, '#c8352e');
  ivPoly([[px + pw / 2 - 40, py + 70], [px + pw / 2 + 40, py + 70], [px + pw / 2 + 30, py + 40], [px + pw / 2 - 30, py + 40]], '#f2ede2');
  set_clock(1830, 220, 44, '#f6f6f2', '#2a2c32');
  ivRR(1760, 560, 200, 300, 6, '#6a7280'); for (let k = 0; k < 3; k++) { ivRR(1772, 574 + k * 96, 176, 84, 4, '#7c8492'); ivRR(1830, 600 + k * 96, 60, 12, 4, '#4a5262'); }
  set_plant(2080, 860, 1.1, '#5a6270', '#4f7a5a');
  // route map
  ivRR(2200, 180, 380, 260, 4, '#e9eef2'); ['#c8352e', '#2c4f86', '#3aa36b'].forEach((c, k) => { ctx.beginPath(); ctx.moveTo(2220, 230 + k * 70); ctx.bezierCurveTo(2320, 160 + k * 90, 2420, 330 - k * 40, 2560, 260 + k * 50); ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.stroke(); });
  set_rect(-1700, 860, 5400, 40, '#5a6270'); set_rect(-1700, 640, 5400, 220, 'rgba(60,70,90,0.18)'); ivLine(-1700, 640, 3700, 640, 6, '#6a7486', 'butt');
}
function SET_office(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.office;
  const O = SET_POS.office, [dx, dy, dw] = O.desk;
  return [
    { d: 3, draw: () => {   // the corridor beyond the glass
      set_bg(ivVGrad(-200, 900, ['#aab4c2', '#c4ccd6'])); set_floor(800, ['#8a929e', '#6a727e']);
      for (let k = -2; k < 8; k++) { ivRR(k * 320, 330, 140, 470, 4, '#7a8494'); ivDot(k * 320 + 120, 580, 8, '#c9ccd4'); ivRR(k * 320 + 170, 160, 90, 20, 10, '#f4f6f8'); ivGlow(k * 320 + 215, 180, 140, 'rgba(255,255,255,0.4)'); }
      ivRR(700, 560, 70, 240, 6, '#d9e2ea'); ivRR(706, 500, 58, 70, 20, '#9ac0e0');
      set_walker(CAST.extraC, -300, 2300, 800, 400, 0, 'ofw1'); set_walker(CAST.extraA, 2300, -300, 800, 410, 6, 'ofw2');
    } },
    { d: 1.3, draw: () => set_officeWall(o), blur: o.sharpWall ? 0 : undefined },
    { d: 1, draw: () => {
      set_floor(870, ['#5a6474', '#454e5c'], { depth: 200 });
      set_chair(O.visitor, GROUND, 520, 1, '#2a2e38');
      ivRR(O.boss + 40, 470, 120, 260, 30, '#20232c'); ivLine(O.boss + 60, 730, O.boss + 60, GROUND - 20, 14, '#20232c'); ivLine(O.boss - 20, GROUND - 10, O.boss + 140, GROUND - 10, 10, '#20232c');   // boss chair
      o.act && o.act();
      // the desk
      ivRR(dx - dw / 2, dy, dw, 26, 4, '#5a4636'); ivRR(dx - dw / 2 + 20, dy + 26, dw - 40, GROUND - dy - 26, 4, '#46362a'); ivLine(dx - dw / 2 + 30, dy + 80, dx + dw / 2 - 30, dy + 80, 3, 'rgba(0,0,0,0.25)');
      ivLine(dx - dw / 2 + 8, dy + 2, dx + dw / 2 - 8, dy + 2, 2, 'rgba(255,255,255,0.25)');
      ivRR(dx - 270, dy - 170, 230, 150, 8, '#1a1c22'); ivRR(dx - 260, dy - 160, 210, 128, 4, '#2a3a50'); ivLine(dx - 155, dy - 20, dx - 155, dy, 12, '#1a1c22'); ivGlow(dx - 155, dy - 96, 200, 'rgba(120,170,230,0.2)');
      ivPoly([[dx + 10, dy], [dx + 170, dy], [dx + 160, dy - 44], [dx + 20, dy - 44]], '#2a2c32'); ivText('R. VOSS', dx + 90, dy - 14, 24, '#e8c56a', { font: IV.sans });
      ivRR(dx + 200, dy - 50, 38, 50, 6, '#e9eef2'); set_steam(dx + 219, dy - 54, 7, 0.35, 0.6);
      ivRR(dx - 20, dy - 10, 110, 10, 2, '#f4f1ea'); ivRR(dx - 14, dy - 18, 104, 8, 2, '#e8e4dc');
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { set_plant(-80, 1250, 2.4, '#4a5262', '#3d6a4a'); } }]),
  ];
}

// =====================================================================
//  KITCHEN — night, a lamp over a small table with two chairs, window with city lights, fridge.
//  o.cap (default true) Dad's cap on the table; o.mug (default true). Seats: seatL faces right, seatR faces left
// =====================================================================
SET_POS.kitchen = { table: [960, 705, 460], seatL: 740, seatR: 1180, lamp: [960, 380], cap: [1050, 705] };
function SET_kitchen(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.lamp;
  const K = SET_POS.kitchen, [tx, ty, tw] = K.table, [lx, ly] = K.lamp;
  return [
    { d: 2.6, draw: () => {
      set_bg(ivVGrad(-200, 900, ['#1e1a22', '#2e262a']));
      ctx.save(); ctx.globalAlpha = 0.5; for (let r = 0; r < 6; r++) for (let c = -12; c < 30; c++) ivRR(c * 60 + 2, 520 + r * 30 + 2, 56, 26, 3, '#3a3236'); ctx.restore();
      for (let k = 0; k < 4; k++) { ivRR(-600 + k * 260, 130, 240, 300, 6, '#3e3a40'); ivDot(-600 + k * 260 + (k % 2 ? 30 : 210), 400, 7, '#8a8288'); }
      ivRR(-640, 700, 1360, 30, 4, '#5a4a40'); set_rect(-630, 730, 1340, 200, '#3a3236'); for (let k = 0; k < 5; k++) ivRR(-610 + k * 270, 750, 250, 110, 4, '#443b40');
      ivRR(-200, 680, 220, 24, 6, '#6a6a72'); ivLine(-80, 680, -80, 600, 10, '#8a8a92'); ivLine(-80, 600, -40, 600, 10, '#8a8a92');   // sink
      ivRR(200, 600, 220, 100, 8, '#2a2a30'); ivRR(214, 614, 150, 72, 4, '#141418'); ivText(Math.floor(TT) % 2 ? '11:42' : '11 42', 395, 690, 22, '#5df0a8', { font: IV.sans, glow: 'rgba(80,255,170,0.8)', align: 'right' });
      ivRR(500, 620, 90, 80, 20, '#a83a30'); ivLine(590, 640, 610, 640, 8, '#a83a30');
      // window with the city at night
      set_window(1050, 180, 400, 340, (x, y, w, h) => { set_rect(x, y, w, h, '#0c1228'); set_skyline('kwin', x - 30, x + w + 30, y + h, 60, 220, '#141a34', ['#f6c06a', '#e98d4c'], null, 0.35, { w0: 60, w1: 60, gx: 22, gy: 28, ww: 9, wh: 12 }); set_drops(x, y, w, h, 'kdr', 30); }, '#2a2226', 2, 1, 10);
      ivRR(1030, 520, 440, 20, 4, '#3a3034'); set_plant(1360, 520, 0.6, '#8a5a40', '#4f6a4a');
      set_clock(820, 200, 40, '#e9e0cc', '#2a2226');
      // fridge
      ivRR(1600, 200, 320, 660, 18, '#c9c6c0'); ivLine(1600, 420, 1920, 420, 4, '#9a968e'); ivLine(1640, 260, 1640, 380, 10, '#9a968e'); ivLine(1640, 460, 1640, 600, 10, '#9a968e');
      ivRR(1700, 470, 120, 90, 2, '#f4f1ea'); ivDot(1730, 500, 12, '#3aa36b'); ivLine(1760, 530, 1800, 500, 4, '#3d6fb6'); ivDot(1710, 465, 7, '#c8352e'); ivDot(1820, 300, 9, '#e8c56a'); ivDot(1760, 290, 9, '#3d6fb6');
      set_floor(860, ['#2a2224', '#1e181a']);
      ivGlow(lx, 700, 900, 'rgba(255,170,90,0.20)');
    } },
    { d: 1, draw: () => {
      ctx.fillStyle = ivVGrad(850, 1100, ['rgba(60,46,42,0)', '#3a2c28', '#281e1c']); ctx.fillRect(-1700, 850, 5400, 900);
      ctx.save(); ctx.globalAlpha = 0.18; for (let c = -20; c < 40; c++) ivPoly([[c * 90, 900], [c * 90 + 90, 900], [c * 130 + 130 - 400, 1300], [c * 130 - 400, 1300]], c % 2 ? '#5a4a40' : '#2a2020'); ctx.restore();
      // lamp + light cone
      ivLine(lx, -800, lx, ly - 60, 4, '#0c0a0c'); ivPoly([[lx - 90, ly], [lx + 90, ly], [lx + 36, ly - 66], [lx - 36, ly - 66]], '#c9783a'); ivRR(lx - 90, ly - 4, 180, 8, 4, '#a85a28');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = ivVGrad(ly, ty + 40, ['rgba(255,200,120,0.22)', 'rgba(255,170,90,0.05)']); ivPoly([[lx - 80, ly], [lx + 80, ly], [lx + 380, ty + 40], [lx - 380, ty + 40]], ctx.fillStyle); ctx.restore();
      ivDot(lx, ly + 8, 22, '#fff0c8'); ivGlow(lx, ly + 10, 360, 'rgba(255,200,120,0.5)');
      const mo = TT * 2.3; ivDot(lx + Math.cos(mo) * 120, ly + 40 + Math.sin(mo * 1.7) * 40, 3, '#e9dcc8');   // a moth
      set_chair(K.seatL, GROUND, 520, 1, '#2a1e1c'); set_chair(K.seatR, GROUND, 520, -1, '#2a1e1c');
      o.act && o.act();
      set_table(tx, ty, tw, '#7a5a44', { legs: '#2a1e1c' });
      if (o.mug !== false) { ivRR(tx - 120, ty - 52, 44, 52, 8, '#e9e0cc'); ctx.beginPath(); ctx.arc(tx - 74, ty - 28, 14, -1.2, 1.2); ctx.strokeStyle = '#e9e0cc'; ctx.lineWidth = 6; ctx.stroke(); set_steam(tx - 98, ty - 58, 2, 0.35, 0.7); }
      if (o.cap !== false) { const [cx, cy] = K.cap; ctx.beginPath(); ctx.ellipse(cx, cy - 22, 62, 30, 0, Math.PI, TAU); ctx.fillStyle = '#1f2e4f'; ctx.fill(); ivRR(cx - 64, cy - 26, 128, 12, 4, '#2a3c62'); ctx.beginPath(); ctx.ellipse(cx + 66, cy - 6, 44, 8, 0, 0, TAU); ctx.fillStyle = '#111a2e'; ctx.fill(); ivDot(cx, cy - 40, 9, '#f2c14e'); }
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(1700, 820, 400, 500, 30, '#140e0e'); ivRR(-250, 980, 520, 300, 30, '#140e0e'); } }]),
  ];
}

// =====================================================================
//  HEARING — city hall room: long table with 3 officials facing camera (sit behind it at SET_POS.hearing.officials,
//  pose 'sit', f 0, h ≈ 500; table + nameplates drawn after the actors), a projector screen on the d = 1.7 layer
//  (o.screen(w, h) draws into it; o.sharpScreen keeps that layer sharp), flags, audience chairs (soft foreground),
//  a lectern at x ≈ 520 for whoever presents. o.names = 3 nameplate strings
// =====================================================================
SET_POS.hearing = { table: [1450, 762, 820], officials: [1180, 1450, 1720], lectern: 520, screen: [300, 150, 760, 430], audience: [-200, 1900] };
function SET_hearing(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.hall;
  const Hh = SET_POS.hearing, [tx, ty, tw] = Hh.table, names = o.names || ['TRANSPORT', 'COUNCIL', 'PUBLIC SAFETY'];
  return [
    { d: 3, draw: () => {
      set_bg(ivVGrad(-200, 700, ['#b7a88e', '#cdbfa4']));
      for (let k = -4; k < 3; k++) { const x = -900 + (k + 4) * 320; set_window(x, 100, 220, 480, ivVGrad(100, 580, ['#dfe6ea', '#c2ccd4']), '#7a6a56', 2, 3, 8); ivGlow(x + 110, 340, 260, 'rgba(255,250,240,0.25)'); }
      // seal
      ivDot(1450, 270, 120, '#7a5a3a'); ivDot(1450, 270, 104, '#d9c49a'); ivDot(1450, 270, 70, '#2c4f86'); ctx.save(); ctx.beginPath(); ctx.arc(1450, 270, 70, 0, TAU); ctx.clip(); ivPoly([[1380, 330], [1420, 250], [1450, 290], [1490, 230], [1530, 330]], '#e8dcc0'); ctx.restore();
      ivText('CITY  HALL', 1450, 180, 22, '#4a3a28', { font: IV.sans, track: 4 }); ivText('EST. 1891', 1450, 375, 18, '#4a3a28', { font: IV.sans, track: 3 });
      set_clock(2050, 200, 44, '#f4ead6', '#3a2a20');
      set_rect(-1200, 560, 4400, 600, '#6e4e36'); for (let k = -10; k < 30; k++) ivRR(k * 160 + 10, 580, 140, 240, 4, '#7a5a40'); ivRR(-1200, 556, 4400, 14, 0, '#4a3220');
      set_floor(860, ['#6a3a34', '#4a2824']);
    } },
    { d: 1.7, blur: o.sharpScreen ? 0 : undefined, draw: () => {
      const [sx, sy, sw, sh] = Hh.screen;
      ivLine(sx - 20, sy - 30, sx + sw + 20, sy - 30, 14, '#3a3a40'); ivRR(sx - 10, sy - 10, sw + 20, sh + 20, 4, '#e9e6de');
      ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip(); ctx.translate(sx, sy);
      if (o.screen) o.screen(sw, sh); else { ctx.fillStyle = ivVGrad(0, sh, ['#f6f4ee', '#dcd8ce']); ctx.fillRect(0, 0, sw, sh); ivText('5TH & MAIN', sw / 2, sh / 2 - 10, 46, '#3a3a44'); ivText('SIGNAL TIMING REVIEW', sw / 2, sh / 2 + 40, 24, '#6a6a74', { font: IV.sans, track: 2 }); }
      ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ivPoly([[sx + sw / 2 - 6, -200], [sx + sw / 2 + 6, -200], [sx + sw, sy], [sx, sy]], 'rgba(255,255,240,0.03)'); ctx.restore();
      // flags
      for (const [fx, kind] of [[1760, 0], [1900, 1]]) { ivLine(fx, 860, fx, 200, 8, '#c9a24a'); ivDot(fx, 196, 10, '#e8c56a');
        const col = kind ? '#2c4f86' : '#b8323a'; ctx.save(); ctx.translate(fx - 6, 220); for (let i = 0; i < 6; i++) { const w0 = Math.sin(TT * 2 + i * 0.7 + kind) * 6; ivRR(-70 + w0, i * 50, 66, 50, 0, kind ? (i % 2 ? '#2c4f86' : '#3a5f96') : (i % 2 ? '#f4efe4' : col)); } if (!kind) ivRR(-70 + Math.sin(TT * 2 + kind) * 6, 0, 36, 100, 0, '#2c4f86'); else ivDot(-37 + Math.sin(TT * 2.7) * 6, 150, 18, '#e8c56a'); ctx.restore(); }
      // side rows of seats with a few attendees + an officer by the door
      ivRR(-900, 380, 220, 480, 6, '#5a3e2a'); ivDot(-720, 640, 10, '#c9a24a');
      [[-560, 'extraA'], [-380, null], [-200, 'extraB'], [-20, 'kidB'], [160, null]].forEach(([x, k], i) => { set_chair(x, 870, 340, 1, '#3a2a22'); if (k) set_extra(CAST[k], x, 870, 340, 0.55, 'sit', 110 + i, { chat: false }); });
      set_extra({ key: 'cop', top: 'uniform', col: '#2a3550', col2: '#1a2440', hat: 'buscap', capCol: '#1a2440' }, -760, 870, 380, 0.3, 'hips', 120, { chat: false });
    } },
    { d: 1, draw: () => {
      set_floor(870, ['#5a302a', '#3e2220'], { depth: 200 });
      // lectern
      const lx = Hh.lectern;
      Hh.officials.forEach((x) => { ivRR(x - 70, 580, 140, 190, 24, '#2a1e1a'); });
      o.act && o.act();
      ivPoly([[lx - 90, 680], [lx + 90, 680], [lx + 70, GROUND], [lx - 70, GROUND]], '#6e4e36'); ivPoly([[lx - 110, 650], [lx + 110, 650], [lx + 100, 690], [lx - 100, 690]], '#7a5a40'); ivDot(lx, 780, 26, '#d9c49a'); ivLine(lx + 40, 650, lx + 70, 590, 4, '#222'); ivDot(lx + 72, 586, 7, '#222');
      // the long table with a skirt
      ivRR(tx - tw / 2, ty, tw, 22, 4, '#7a5a40'); ivRR(tx - tw / 2 + 10, ty + 22, tw - 20, GROUND - ty - 22, 2, '#5a3e2a'); ivRR(tx - tw / 2 + 10, ty + 22, tw - 20, 30, 0, '#2c4f86');
      ivLine(tx - tw / 2 + 6, ty + 2, tx + tw / 2 - 6, ty + 2, 2, 'rgba(255,240,210,0.4)');
      Hh.officials.forEach((x, k) => {
        ivPoly([[x - 80, ty], [x + 80, ty], [x + 70, ty - 40], [x - 70, ty - 40]], '#2a2420'); ivText(names[k] || '', x, ty - 12, 20, '#e8dcc0', { font: IV.sans, track: 1 });
        ivLine(x + 100, ty, x + 120, ty - 70, 4, '#1a1a1e'); ivDot(x + 122, ty - 74, 7, '#1a1a1e'); if (k === 1) { const on = Math.floor(TT * 0.5) % 3 !== 2; ivDot(x + 100, ty - 4, 4, on ? '#ff3a2a' : '#5a2020'); }
        ivRR(x - 120, ty - 44, 26, 44, 4, 'rgba(220,235,245,0.6)'); ivRR(x - 120, ty - 24, 26, 24, 2, 'rgba(140,180,220,0.5)');
      });
      o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { [[-140, '#1c1416'], [260, '#1c1416'], [1660, '#1c1416'], [2060, '#1c1416']].forEach(([x, c], k) => { ivRR(x - 150, 960, 300, 300, 40, c); ivDot(x + (k % 2 ? 20 : -20), 900, 110, '#120c0e'); }); } }]),
  ];
}

// =====================================================================
//  BEDROOM — night: bed (back furniture; mattress top SET_POS.bedroom.bed[2]), desk with a laptop, window with moon + city,
//  string lights. o.phone (default true) a phone glowing on the bed at SET_POS.bedroom.phone; o.buzz (phone shakes + pulses);
//  o.blanket() is called after the actors to lay the blanket over someone lying in bed (optional)
// =====================================================================
SET_POS.bedroom = { bed: [120, 1060, 725], pillow: [230, 690], phone: [820, 718], desk: [1380, 1860, 690], chair: 1560, nightstand: [1120, 1250] };
function SET_bedroom(o = {}) {
  IV_M = IV_MOOD[o.mood] || IV_MOOD.night;
  const Bd = SET_POS.bedroom, [b0, b1, bt] = Bd.bed;
  return [
    { d: 2.6, draw: () => {
      set_bg(ivVGrad(-200, 900, ['#1a1c34', '#262848']));
      set_window(1150, 160, 440, 420, (x, y, w, h) => { ctx.fillStyle = ivVGrad(y, y + h, ['#0a1030', '#1c2050']); ctx.fillRect(x, y, w, h); ivDot(x + w * 0.7, y + 90, 40, '#f4ecd2'); ivDot(x + w * 0.7 + 14, y + 80, 36, '#141a40'); ivGlow(x + w * 0.7, y + 90, 180, 'rgba(240,230,200,0.25)');
        const r = RNG('bst').f; for (let i = 0; i < 20; i++) ivDot(x + r() * w, y + r() * h * 0.5, 1.5, `rgba(255,255,240,${0.3 + 0.5 * Math.abs(Math.sin(TT * 1.3 + i))})`);
        set_skyline('bwin', x - 30, x + w + 30, y + h, 50, 200, '#10142e', ['#f6c06a', '#e98d4c'], null, 0.3, { w0: 60, w1: 70, gx: 22, gy: 28, ww: 9, wh: 12 }); }, '#2a2a40', 2, 2, 10);
      for (const [cx, d] of [[1110, 1], [1630, -1]]) { const sw = Math.sin(TT * 0.6) * 5; ivPoly([[cx - 40, 130], [cx + 40, 130], [cx + 40 + sw, 620], [cx - 40 + d * 12 + sw, 620]], '#3a3a6a'); }
      ivLine(1040, 130, 1700, 130, 8, '#141428');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ivPoly([[1150, 580], [1590, 580], [1800, 900], [1040, 900]], 'rgba(160,180,255,0.05)'); ctx.restore();   // moonlight on the floor
      // posters + shelf
      set_poster(200, 180, 200, 280, '#2a1e3a', null); ivDot(300, 280, 60, '#e98d4c'); ctx.beginPath(); ctx.ellipse(300, 280, 100, 20, -0.3, 0, TAU); ctx.strokeStyle = '#f6c06a'; ctx.lineWidth = 5; ctx.stroke(); ivText('SPACE', 300, 420, 32, '#f4e6c8');
      set_poster(480, 220, 170, 230, '#7a2630', 'THE\nFUTURE\nIS NOW', '#f4e6c8', 28);
      ivRR(1820, 300, 300, 14, 3, '#4a3a30'); for (let k = 0; k < 7; k++) ivRR(1830 + k * 34, 300 - 60 - (k % 3) * 10, 28, 60 + (k % 3) * 10, 2, ['#c8574a', '#3d6fb6', '#e8c56a', '#4f7a4a'][k % 4]);
      // string lights
      ctx.beginPath(); ctx.moveTo(-200, 110); for (let k = 0; k <= 24; k++) { const x = -200 + k * 100, y = 110 + Math.abs(Math.sin(k * 1.3)) * 30; ctx.lineTo(x, y); } ctx.strokeStyle = '#141428'; ctx.lineWidth = 2; ctx.stroke();
      for (let k = 0; k <= 24; k++) { const x = -200 + k * 100, y = 118 + Math.abs(Math.sin(k * 1.3)) * 30, tw = 0.6 + 0.4 * Math.sin(TT * 2 + k * 1.7); ivDot(x, y, 6, '#ffd890'); ivGlow(x, y, 40, `rgba(255,200,120,${0.4 * tw})`); }
      set_floor(860, ['#2a2436', '#1c1828']);
    } },
    { d: 1, draw: () => {
      ctx.fillStyle = ivVGrad(850, 1100, ['rgba(40,36,56,0)', '#2a2436', '#1c1828']); ctx.fillRect(-1700, 850, 5400, 900);
      ctx.beginPath(); ctx.ellipse(700, 990, 520, 60, 0, 0, TAU); ctx.fillStyle = '#3a2a4a'; ctx.fill();                 // rug
      // bed
      ivRR(b0 - 30, 440, 60, GROUND - 440, 14, '#3a2a24'); ivRR(b1 - 20, 640, 40, GROUND - 640, 10, '#3a2a24');
      ivRR(b0, bt + 40, b1 - b0, 80, 4, '#4a3a30'); ivRR(b0, bt, b1 - b0, 50, 16, '#e9e2d6');
      const [px, py] = Bd.pillow; ivRR(px - 90, py - 26, 180, 60, 26, '#f4efe4');
      ivPoly([[b0 + 320, bt - 6], [b1 + 10, bt - 6], [b1 + 20, bt + 110], [b0 + 300, bt + 110]], '#3d5f9a'); ivLine(b0 + 330, bt + 20, b1, bt + 24, 3, 'rgba(255,255,255,0.12)');
      for (let xx = 0; xx < 4; xx++) ivLine(b0 + 400 + xx * 150, bt + 10, b0 + 380 + xx * 150, bt + 105, 2, 'rgba(0,0,0,0.15)');
      // nightstand + clock
      const [n0, n1] = Bd.nightstand; ivRR(n0, 700, n1 - n0, GROUND - 700, 6, '#4a3a30'); ivRR(n0 + 10, 760, n1 - n0 - 20, 60, 4, '#3a2c24'); ivRR(n0 + 20, 650, 100, 50, 8, '#141418');
      ivText(Math.floor(TT) % 2 ? '11:47' : '11 47', n0 + 70, 688, 30, '#ff4a36', { font: IV.sans, glow: 'rgba(255,60,40,0.8)' });
      // desk + laptop + chair
      const [d0, d1, dt] = Bd.desk; ivRR(d0, dt, d1 - d0, 22, 4, '#5a4636'); ivLine(d0 + 20, dt + 20, d0 + 20, GROUND, 14, '#3a2c24', 'butt'); ivRR(d1 - 200, dt + 22, 180, GROUND - dt - 22, 4, '#46362a');
      ivPoly([[d0 + 160, dt], [d0 + 360, dt], [d0 + 380, dt - 6], [d0 + 140, dt - 6]], '#8a8f9a'); ivPoly([[d0 + 170, dt - 6], [d0 + 340, dt - 6], [d0 + 360, dt - 140], [d0 + 190, dt - 140]], '#2a2c36');
      ivPoly([[d0 + 180, dt - 14], [d0 + 332, dt - 14], [d0 + 350, dt - 130], [d0 + 198, dt - 130]], '#3a5a8a'); ivGlow(d0 + 265, dt - 70, 260, 'rgba(120,160,255,0.25)');
      ivLine(d1 - 80, dt, d1 - 60, dt - 180, 6, '#2a2a30'); ivPoly([[d1 - 100, dt - 180], [d1 - 20, dt - 180], [d1 - 50, dt - 230]], '#2a2a30');
      set_chair(Bd.chair, GROUND, 480, 1, '#2a2430');
      if (o.phone !== false) { const [fx, fy] = Bd.phone, bz = o.buzz ? Math.sin(TT * 80) * 3 : 0, pu = o.buzz ? 0.7 + 0.3 * Math.sin(TT * 12) : 0.6;
        ivGlow(fx, fy - 4, 220, `rgba(150,190,255,${0.35 * pu})`); ctx.save(); ctx.translate(fx + bz, fy); ctx.rotate(-0.05); ivRR(-40, -8, 80, 14, 4, '#141418'); ivRR(-34, -9, 68, 4, 2, '#cfe0ff'); ctx.restore(); }
      o.act && o.act(); o.blanket && o.blanket(); o.front && o.front();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { set_plant(1880, 1150, 2, '#3a2c3a', '#2f4a3a'); ivRR(-300, 960, 560, 300, 40, '#120e18'); } }]),
  ];
}

// =====================================================================
//  VOID — a dark soft stage with bokeh for graphics and explanations. o.mood = a mood name (default 'night'),
//  o.col = the bokeh/spot colour (default from the mood's rim); o.floor === false hides the floor spot
// =====================================================================
SET_POS.void = { spot: [960, GROUND] };
function SET_void(o = {}) {
  const mood = o.mood || o.t || 'night'; IV_M = IV_MOOD[mood] || IV_MOOD.night;
  const hz = IV_M.haze, rim = o.col || IV_M.rim;
  return [
    { d: 4, draw: () => { set_bg(ivVGrad(-200, 1100, [ivShade(hz, -0.82), ivShade(hz, -0.6), ivShade(hz, -0.85)])); ivGlow(960, 420, 900, ivHex(rim, 0.12)); set_bokeh('vb0', 26, [ivHex(rim, 0.5), ivHex(hz, 0.6), 'rgba(255,255,255,0.25)'], 30, 90, 0.35); } },
    { d: 2, draw: () => set_bokeh('vb1', 14, [ivHex(rim, 0.6), 'rgba(255,255,255,0.3)'], 10, 30, 0.4) },
    { d: 1, draw: () => {
      if (o.floor !== false) { ctx.beginPath(); ctx.ellipse(960, GROUND + 10, 700, 70, 0, 0, TAU); const g = ctx.createRadialGradient(960, GROUND + 10, 0, 960, GROUND + 10, 700); g.addColorStop(0, ivHex(rim, 0.22)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.scale(1, 1); ctx.fillStyle = g; ctx.fill(); ctx.restore(); }
      o.act && o.act(); o.front && o.front();
    } },
  ];
}
