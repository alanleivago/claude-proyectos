// =====================================================================
//  styles/voltamps/kit.js — night-schematic line art (measured from local refs, references/voltamps/).
//  Near-black navy ground, indigo fills with violet outlines, thin lavender line art, charge glyphs
//  (+ magenta, − cyan), cyan leaders, amber return strokes with a warm wash, small monospace labels.
//  Rigid vector lines (no boil), motion on 1s, glow only on what carries current.
//  Needs from the piece head: VMONO (a font stack), W, H.
// =====================================================================
const VA_SERIF = 'Georgia, Cambria, "Times New Roman", "DejaVu Serif", serif';   // titles and big type (shared with pov3d)
const VA = {
  sky0: '#04031a', sky1: '#000006',          // the ground: navy at the top, near-black at the bottom
  fill: '#1b1653', fill2: '#16123f',          // indigo fills (cloud, house)
  edge: '#3d3394', line: '#8b82d6', dim: '#4a4288',   // outlines, line art, faint art
  plus: '#d462f2', minus: '#12b6e8', amber: '#ffbd3a', cream: '#fff4d6', warm: '#2a1806',
  text: '#cfc9ff', red: '#ff5a6a',
};

// ---- the ground of the frame: a navy fall-off, an optional warm wash (the return stroke lights the sky)
function vaBg(warm = 0) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, VA.sky0); g.addColorStop(1, VA.sky1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const hz = ctx.createLinearGradient(0, H * 0.62, 0, H * 0.78);   // a low violet haze on the horizon
  hz.addColorStop(0, 'rgba(60,40,140,0)'); hz.addColorStop(0.7, 'rgba(60,40,140,0.10)'); hz.addColorStop(1, 'rgba(60,40,140,0)');
  ctx.fillStyle = hz; ctx.fillRect(0, H * 0.6, W, H * 0.2);
  if (warm > 0) {
    const r = ctx.createRadialGradient(W / 2, H * 0.55, 50, W / 2, H * 0.55, H * 0.8);
    r.addColorStop(0, `rgba(70,42,10,${0.85 * warm})`); r.addColorStop(1, `rgba(30,18,4,${0.6 * warm})`);
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
// depth: far ridges and a far storm bank, drawn in screen space with a parallax share of the camera
function vaFar(cam, a = 1, flash = 0, gyW = 1440) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a;
  const px = (cam ? (cam.cx - 540) * 0.25 : 0), pz = cam ? 1 + (cam.z - 1) * 0.2 : 1;
  const gy = H / 2 + (gyW - (cam ? cam.cy : 960)) * (cam ? cam.z : 1) + (cam ? cam.sy : 0);
  // a far storm bank: soft dark domes, lit from inside now and then
  for (let i = 0; i < 9; i++) {
    const R = RNG('bank', i), bx = mod(R.r(-200, W + 200) - px * 0.6 + TT * R.r(2, 5), W + 400) - 200, by = gy - R.r(120, 330) * pz, r = R.r(90, 170) * pz;
    const lit = flash * (i % 3 === 0 ? 1 : 0.3) + 0.5 * Math.max(0, Math.sin(TT * 0.7 + i * 2.1)) ** 40;
    ctx.fillStyle = `rgba(${18 + 50 * lit | 0},${14 + 36 * lit | 0},${46 + 90 * lit | 0},0.35)`;
    for (const [ox, oy, k] of [[-0.8, 0.15, 0.7], [0, 0, 1], [0.85, 0.2, 0.65]]) { ctx.beginPath(); ctx.ellipse(bx + ox * r, by + oy * r, r * k, r * 0.55 * k, 0, 0, TAU); ctx.fill(); }
  }
  // two ridge lines
  for (const [k, c, amp, base] of [[0.35, '#0b0928', 120, 40], [0.6, '#0f0c33', 70, 0]]) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) { const u = (x + px * k * 2) / 260; ctx.lineTo(x, gy - base * pz - amp * pz * (0.5 + 0.35 * Math.sin(u) + 0.15 * Math.sin(u * 2.7 + 1))); }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.fillStyle = '#020109'; ctx.fillRect(0, gy, W, H - gy);   // the earth below the ground line
  ctx.restore();
}
// rain: fine slanted streaks, two depths
function vaRain(a = 1, key = 'rain') {
  if (a <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'round';
  for (let i = 0; i < 110; i++) {
    const R = RNG(key, i), near = i % 3 === 0, sp = near ? 1500 : 900, len = near ? 46 : 26;
    const x = mod(R.r(0, W + 300) - TT * sp * 0.22, W + 300) - 150, y = mod(R.r(0, H) + TT * sp, H + 100) - 50;
    ctx.globalAlpha = a * (near ? 0.22 : 0.12); ctx.strokeStyle = near ? '#6e66c0' : '#3d3690'; ctx.lineWidth = near ? 2 : 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.22, y + len); ctx.stroke();
  }
  ctx.restore();
}
// grain + vignette, deterministic per frame (STYLE.post)
let VA_NOISE = null;
function vaGrain(k = 1) {
  if (!VA_NOISE) { VA_NOISE = document.createElement('canvas'); VA_NOISE.width = VA_NOISE.height = 256; const g = VA_NOISE.getContext('2d'), im = g.createImageData(256, 256), R = RNG('grain');
    for (let i = 0; i < im.data.length; i += 4) { const v = R.f() * 255 | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const R = RNG('gf', F), ox = R.r(0, 256) | 0, oy = R.r(0, 256) | 0;
  ctx.globalAlpha = 0.045 * k; ctx.globalCompositeOperation = 'overlay';
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(VA_NOISE, x, y);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,6,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// a squared-paper ground: fine cells and stronger every 4th line, with a parallax share of the camera
function vaGridBg(cam, a = 1, cell = 60) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const k = 0.4, z = cam ? 1 + (cam.z - 1) * 0.35 : 1, st = cell * z;
  const ox = cam ? -(cam.cx - 540) * k * z : 0, oy = cam ? -(cam.cy - 960) * k * z : 0;
  const i0x = Math.floor(-ox / st) - 1, i0y = Math.floor(-oy / st) - 1;
  const fade = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, H * 0.62);
  for (let i = i0x; i * st + ox < W + st; i++) { const x = i * st + ox, maj = mod(i, 4) === 0; ctx.globalAlpha = a * (maj ? 0.26 : 0.12); ctx.fillStyle = '#5a50b8'; ctx.fillRect(Math.round(x), 0, maj ? 2 : 1, H); }
  for (let j = i0y; j * st + oy < H + st; j++) { const y = j * st + oy, maj = mod(j, 4) === 0; ctx.globalAlpha = a * (maj ? 0.26 : 0.12); ctx.fillStyle = '#5a50b8'; ctx.fillRect(0, Math.round(y), W, maj ? 2 : 1); }
  // let the grid sink into the dark at the edges
  ctx.globalAlpha = 1; fade.addColorStop(0, 'rgba(2,2,14,0)'); fade.addColorStop(1, 'rgba(2,2,14,0.85)'); ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// faint drifting specks (rain-fine air dust) so a held frame still breathes
function vaSpecks(n = 40, a = 0.25, key = 'sp') {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const R = RNG(key, i), x = mod(R.r(0, W) + TT * R.r(-6, 6), W), y = mod(R.r(0, H) + TT * R.r(4, 18), H);
    ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(TT * R.r(0.6, 1.6) + i));
    ctx.fillStyle = VA.dim; ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
}

// ---- strokes
function vaStroke(P, c, w = 3, o = {}) {
  if (P.length < 2) return;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = o.join ?? 'round'; ctx.lineCap = o.cap ?? 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  vaTrace(P, !!o.closed); ctx.stroke(); ctx.restore();
}
function vaLine(x0, y0, x1, y1, c, w = 3, o = {}) { vaStroke([[x0, y0], [x1, y1]], c, w, o); }
// a glowing current line: a wide soft halo, a mid glow, a bright core
function vaGlow(P, c, w = 4, k = 1, o = {}) {
  if (P.length < 2 || k <= 0) return;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  vaTrace(P, false);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = c; ctx.globalAlpha *= 0.16 * k; ctx.lineWidth = w * 7; ctx.stroke();
  ctx.globalAlpha /= 0.16; ctx.globalAlpha *= 0.35; ctx.lineWidth = w * 2.6; ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha /= 0.35; ctx.lineWidth = w; ctx.strokeStyle = o.core ?? c; ctx.stroke();
  ctx.restore();
}
// partial polyline: the first `frac` of P's length (write-on for paths and bolts)
function vaPart(P, frac) {
  frac = clamp(frac); if (frac >= 1) return P; if (frac <= 0) return [P[0]];
  let L = 0; const d = [0];
  for (let i = 1; i < P.length; i++) { L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); d.push(L); }
  const s = L * frac, out = [P[0]];
  for (let i = 1; i < P.length; i++) {
    if (d[i] <= s) { out.push(P[i]); continue; }
    const u = (s - d[i - 1]) / (d[i] - d[i - 1]); out.push([lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]); break;
  }
  return out;
}
// a point on a polyline at fraction u (for travelling pulses)
function vaAt(P, u) { const Q = vaPart(P, clamp(u)); return Q[Q.length - 1]; }

// ---- type: monospace labels, typed on one character at a time
function vaText(str, x, y, size, c, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? (o.serif ? 400 : 500)} ${size}px ${o.serif ? VA_SERIF : VMONO}`; ctx.fillStyle = c; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  const n = Math.ceil(str.length * clamp(o.frac ?? 1));
  if (o.glow) { ctx.shadowColor = c; ctx.shadowBlur = o.glow; }
  if (n > 0) {
    const full = ctx.measureText(str).width, sub = str.slice(0, n);
    const dx = o.align === 'center' ? -full / 2 + ctx.measureText(sub).width / 2 : o.align === 'right' ? -full + ctx.measureText(sub).width : 0;
    ctx.fillText(sub, x + dx, y);
  }
  ctx.restore();
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? (o.serif ? 400 : 500)} ${size}px ${o.serif ? VA_SERIF : VMONO}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
}
const vaType = (t0, str, cps = 28) => clamp((TT - t0) * cps / Math.max(1, str.length));   // typing progress

// ---- charge glyphs
function vaPlus(x, y, s, a = 1, c = VA.plus) { ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = c; ctx.shadowBlur = s * 0.6; ctx.strokeStyle = c; ctx.lineWidth = Math.max(2.5, s * 0.2); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s / 2, y); ctx.lineTo(x + s / 2, y); ctx.moveTo(x, y - s / 2); ctx.lineTo(x, y + s / 2); ctx.stroke(); ctx.restore(); }
function vaMinus(x, y, s, a = 1, c = VA.minus) { ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = c; ctx.shadowBlur = s * 0.6; ctx.strokeStyle = c; ctx.lineWidth = Math.max(2.5, s * 0.2); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s / 2, y); ctx.lineTo(x + s / 2, y); ctx.stroke(); ctx.restore(); }
function vaDot(x, y, r, c, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
function vaRing(x, y, r, c, w = 3, a = 1, dash) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = c; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); ctx.stroke(); ctx.restore(); }
function vaArrow(x0, y0, x1, y1, c, w = 4, a = 1, head = 18) {
  if (Math.hypot(x1 - x0, y1 - y0) < 1) return;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  vaLine(x0, y0, x1, y1, c, w, { a });
  vaStroke([[x1 - head * Math.cos(ang - 0.45), y1 - head * Math.sin(ang - 0.45)], [x1, y1], [x1 - head * Math.cos(ang + 0.45), y1 - head * Math.sin(ang + 0.45)]], c, w, { a });
}
// a chevron (an updraft mark), pointing up
function vaChevron(x, y, s, c, a = 1) { vaStroke([[x - s, y + s * 0.6], [x, y - s * 0.4], [x + s, y + s * 0.6]], c, 2.5, { a }); }
// a horizontal bar meter
function vaBar(x, y, w, h, frac, c, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = c; ctx.fillRect(x, y, w * clamp(frac), h); ctx.restore(); }
// a dimension rule: |——| with a label
function vaRule(x0, y0, x1, y1, label, c = VA.text, size = 34, a = 1) {
  const ang = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(ang) * 12, ny = Math.cos(ang) * 12;
  vaLine(x0, y0, x1, y1, c, 2.5, { a });
  vaLine(x0 - nx, y0 - ny, x0 + nx, y0 + ny, c, 2.5, { a }); vaLine(x1 - nx, y1 - ny, x1 + nx, y1 + ny, c, 2.5, { a });
  if (label) vaText(label, (x0 + x1) / 2 - nx * 3, (y0 + y1) / 2 - ny * 3 + 8, size, c, { align: 'center', a });
}

// ---- the cloud: a cumulonimbus — a cauliflower dome, bulging sides, a scalloped flat base,
//      and a pointed lens-shaped anvil drawn across its top (the dome's bumps rise above it)
function vaTrace(P, closed) { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); if (closed) ctx.closePath(); }
function vaArcPts(cx, cy, r, a0, a1, n = 10) { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; }
function vaCloudBody(x, y, s) {
  // a clean union: the top edge is the envelope of the dome's bumps; the sides bulge gently; the base is scalloped
  const hw = 330 * s, base = y + 170 * s, sh = y - 150 * s, P = [];
  const br = (i) => 1 + 0.035 * Math.sin(TT * 0.9 + i * 1.7);   // the dome boils, slowly
  const bumps = [[x - 235 * s, y - 175 * s, 95 * s * br(0)], [x - 130 * s, y - 255 * s, 100 * s * br(1)], [x + 5 * s, y - 300 * s, 105 * s * br(2)], [x + 140 * s, y - 260 * s, 98 * s * br(3)], [x + 240 * s, y - 180 * s, 92 * s * br(4)]];
  const topAt = (px) => { let m = sh; for (const [bx, by, r] of bumps) { const d = px - bx; if (Math.abs(d) < r) m = Math.min(m, by - Math.sqrt(r * r - d * d)); } return m; };
  for (let i = 0; i <= 16; i++) { const u = i / 16; P.push([x - hw + 2 * hw * u, base + 9 * s * Math.abs(Math.sin(u * Math.PI * 8))]); }
  for (let i = 1; i <= 12; i++) { const u = i / 12; P.push([x + hw + 24 * s * Math.sin(Math.PI * u) + 8 * s * Math.sin(u * TAU * 2), lerp(base, sh, u)]); }
  for (let i = 0; i <= 80; i++) { const px = x + hw - 2 * hw * i / 80; P.push([px, topAt(px)]); }
  for (let i = 1; i < 12; i++) { const u = i / 12; P.push([x - hw - 24 * s * Math.sin(Math.PI * u) - 8 * s * Math.sin(u * TAU * 2), lerp(sh, base, u)]); }
  return P;
}
function vaAnvil(x, y, s) {   // a lens: two arcs meeting in points
  const hw = 470 * s, cy = y - 230 * s, up = 62 * s, dn = 40 * s, P = [];
  for (let i = 0; i <= 30; i++) { const u = i / 30; P.push([x - hw + 2 * hw * u, cy - up * Math.sin(Math.PI * u) ** 0.7]); }
  for (let i = 30; i >= 0; i--) { const u = i / 30; P.push([x - hw + 2 * hw * u, cy + dn * Math.sin(Math.PI * u) ** 0.9]); }
  return P;
}
function vaCloudLattice(x, y, s, P) {
  ctx.save(); vaTrace(P, true); ctx.clip();
  ctx.strokeStyle = 'rgba(120,110,220,0.055)'; ctx.lineWidth = 1.5;
  for (let gx = x - 500 * s; gx < x + 500 * s; gx += 26 * s) { ctx.beginPath(); ctx.moveTo(gx, y - 420 * s); ctx.lineTo(gx, y + 220 * s); ctx.stroke(); }
  for (let gy = y - 420 * s; gy < y + 220 * s; gy += 26 * s) { ctx.beginPath(); ctx.moveTo(x - 500 * s, gy); ctx.lineTo(x + 500 * s, gy); ctx.stroke(); }
  ctx.restore();
}
function vaCloud(x, y, s = 1, o = {}) {
  const a = o.a ?? 1, lw = Math.max(2.5, 4 * s);
  ctx.save(); ctx.globalAlpha *= a; ctx.lineJoin = 'round';
  for (const P of [vaCloudBody(x, y, s), ...(o.anvil === false ? [] : [vaAnvil(x, y, s)])]) {
    const gr = ctx.createLinearGradient(0, y - 400 * s, 0, y + 180 * s);
    gr.addColorStop(0, '#2b2378'); gr.addColorStop(0.55, o.fill ?? VA.fill); gr.addColorStop(1, '#120e3a');
    vaTrace(P, true); ctx.fillStyle = gr; ctx.fill();
    vaCloudLattice(x, y, s, P);
    if (o.lit) {   // lit from inside by a flash: a soft bloom clipped to the shape
      ctx.save(); vaTrace(P, true); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
      const [lx, ly, lc] = o.litAt ?? [x, y, '#7d6cff'];
      const rg = ctx.createRadialGradient(lx, ly, 10, lx, ly, 420 * s); rg.addColorStop(0, lc); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.5 * o.lit; ctx.fillStyle = rg; ctx.fillRect(x - 600 * s, y - 500 * s, 1200 * s, 800 * s); ctx.restore();
    }
    ctx.lineWidth = lw; ctx.strokeStyle = o.edge ?? VA.edge; vaTrace(P, true); ctx.stroke();
  }
  ctx.restore();
  if (o.inner) { ctx.save(); ctx.globalAlpha *= a; o.inner(); ctx.restore(); }
  return { top: y - 300 * s, anvil: y - 230 * s, base: y + 170 * s, half: 330 * s };
}

// ---- the ground line, a hatch below it, grass tufts
function vaGround(y, x0 = -200, x1 = W + 200, a = 1) {
  vaLine(x0, y, x1, y, VA.line, 3, { a });
  for (let x = x0; x < x1; x += 30) vaLine(x, y + 10, x - 14, y + 26, VA.dim, 2, { a });
}
function vaTuft(x, y, s = 1, a = 1) { vaStroke([[x - 9 * s, y - 16 * s], [x, y], [x + 9 * s, y - 16 * s]], VA.line, 2.2, { a }); vaLine(x, y, x, y - 18 * s, VA.line, 2.2, { a }); }
// lattice tower (pylon): base at (x, y), height h
function vaTower(x, y, h, a = 1) {
  const w = h * 0.22, top = y - h;
  vaStroke([[x - w, y], [x - 4, top + 20], [x + 4, top + 20], [x + w, y]], VA.line, 3, { a });
  vaLine(x, top + 20, x, top, VA.line, 3, { a });
  for (let i = 1; i <= 4; i++) {
    const u0 = (i - 1) / 4, u1 = i / 4, ya = lerp(y, top + 20, u0), yb = lerp(y, top + 20, u1);
    const wa = lerp(w, 4, u0), wb = lerp(w, 4, u1);
    vaLine(x - wa, ya, x + wb, yb, VA.line, 2, { a }); vaLine(x + wa, ya, x - wb, yb, VA.line, 2, { a });
  }
  return [x, top];
}
function vaHouse(x, y, s = 1, a = 1, o = {}) {
  const w = 90 * s, h = 82 * s;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = VA.fill2; ctx.fillRect(x - w, y - h, w * 2, h);
  ctx.fillStyle = '#3a2f8e'; ctx.fillRect(x - 18 * s, y - 52 * s, 36 * s, 52 * s);
  ctx.restore();
  vaStroke([[x - w, y], [x - w, y - h], [x + w, y - h], [x + w, y]], VA.line, 3, { a });
  vaStroke([[x - w - 14 * s, y - h], [x, y - h - 62 * s], [x + w + 14 * s, y - h], [x - w - 14 * s, y - h]], VA.line, 3, { a, closed: true });
  if (o.rod) {   // a lightning rod on the ridge and its down-conductor to an earth rod
    const rx = x, ry = y - h - 62 * s;
    vaLine(rx, ry, rx, ry - 70 * s, o.rodC ?? VA.cream, 4, { a });
    vaDot(rx, ry - 70 * s, 5, o.rodC ?? VA.cream, a);
    vaStroke([[rx, ry], [x + w + 10 * s, y - h + 4 * s], [x + w + 10 * s, y + 70 * s]], o.rodC ?? VA.cream, 3, { a: a * (o.cond ?? 1) });
    for (let i = 0; i < 3; i++) vaLine(x + w + 10 * s - (16 - i * 5) * s, y + (70 + i * 9) * s, x + w + 10 * s + (16 - i * 5) * s, y + (70 + i * 9) * s, o.rodC ?? VA.cream, 3, { a: a * (o.cond ?? 1) });
  }
  return [x, y - h - 62 * s];
}
// a tree: three overlapping circles on a trunk
function vaTree(x, y, s = 1, a = 1) {
  vaLine(x, y, x, y - 70 * s, VA.line, 3, { a });
  ctx.save(); ctx.globalAlpha *= a;
  for (const [dx, dy, r] of [[-22, -95, 40], [22, -88, 38], [0, -135, 40]]) {
    ctx.fillStyle = VA.fill2; ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); ctx.fill();
  }
  ctx.restore();
  for (const [dx, dy, r] of [[-22, -95, 40], [22, -88, 38], [0, -135, 40]]) vaRing(x + dx * s, y + dy * s, r * s, VA.line, 3, a);
  return [x, y - 175 * s];
}
function vaLamp(x, y, h = 170, a = 1) {
  vaStroke([[x, y], [x, y - h], [x + 34, y - h]], VA.line, 3, { a });
  vaStroke([[x + 22, y - h + 2], [x + 46, y - h + 2], [x + 40, y - h + 14], [x + 28, y - h + 14]], VA.line, 2.5, { a, closed: true });
  return [x, y - h];
}
function vaSun(x, y, r, c = VA.line, a = 1) {
  vaRing(x, y, r, c, 3, a);
  for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; vaLine(x + Math.cos(an) * r * 1.35, y + Math.sin(an) * r * 1.35, x + Math.cos(an) * r * 1.7, y + Math.sin(an) * r * 1.7, c, 3, { a }); }
}
function vaHill(x0, x1, y, h, a = 1) {
  const P = []; for (let i = 0; i <= 30; i++) { const u = i / 30; P.push([lerp(x0, x1, u), y - h * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 1.6)]); }
  vaStroke(P, VA.line, 3, { a }); return P;
}

// ---- bolts: a seeded stepped path from (x0,y0) toward (x1,y1); each step drifts a little, branches split off
function vaBoltPath(key, x0, y0, x1, y1, steps = 14, o = {}) {
  const R = RNG('bolt', key), main = [[x0, y0]], branches = [];
  const jit = o.jit ?? 0.55, bp = o.branch ?? 0.35;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps, px = lerp(x0, x1, u), py = lerp(y0, y1, u);
    const spread = (1 - Math.pow(u, 3)) * Math.abs(y1 - y0) / steps * jit * 2.2;
    main.push(i === steps ? [x1, y1] : [px + R.r(-1, 1) * spread * 1.4, py + R.r(-0.25, 0.25) * spread]);
    if (i < steps - 1 && R.f() < bp) {   // a branch: 2–5 steps sideways and down, then it dies
      const n = 2 + Math.floor(R.f() * 4), side = R.f() < 0.5 ? -1 : 1, B = [main[i]];
      let [bx, by] = main[i];
      for (let k = 0; k < n; k++) { bx += side * R.r(14, 46); by += R.r(18, 52); B.push([bx, by]); }
      branches.push({ at: i, pts: B });
    }
  }
  return { main, branches, steps };
}
// draw a bolt grown to step k (fractional), with branches growing alongside
function vaBolt(bolt, k, c, w = 4, glow = 1, o = {}) {
  const n = bolt.main.length - 1, kk = clamp(k / n);
  const P = vaPart(bolt.main, kk);
  if (o.branches !== false) for (const b of bolt.branches) {
    const g = clamp((k - b.at) / 3);
    if (g <= 0) continue;
    const fade = o.branchFade ?? 1;
    if (glow) vaGlow(vaPart(b.pts, g), c, w * 0.6, glow * 0.6, { a: 0.75 * fade }); else vaStroke(vaPart(b.pts, g), c, w * 0.6, { a: 0.75 * fade });
  }
  if (glow) vaGlow(P, c, w, glow, o); else vaStroke(P, c, w, o);
  return P[P.length - 1];
}

// ---- captions & tags, at screen size (DEFER)
const vaOverlay = (f) => { if (DEFER) DEFER.push(f); else f(); };

// =====================================================================
//  STYLE — the renderer's hooks
// =====================================================================
const STYLE = {
  name: 'voltamps',
  paper: '#04031a',
  backdrop(c) { vaBg(0); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); vaStroke(P, VA.edge, 4, { closed: true }); },
  blob(P, c, key) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); vaStroke(P, VA.edge, 4, { closed: true }); },
  hero(x, y, r, o) { vaDot(x, y, r * 0.3, VA.minus); },
  heroColor: VA.minus,
  post() { vaGrain(1); },
  ones: true,
};
