// =====================================================================
//  SET airport — one connected airport building (prefix ap):
//   - the BAGGAGE CLAIM hall (x -70..70, z -45..45, ceiling 40): teal walls over a navy wainscot, warm terracotta floor,
//     orange accents; carousel #4 (a working oval of sloped steel plates on a loop, rubber bumper rail, the feeder
//     housing with its black rubber flap curtain), suitcases circling, the BAGGAGE CLAIM 4 sign (Flight 482 · Chicago),
//     the flight info screen, columns, tall windows on the tarmac with a parked jet, seat rows, trolleys, floor markings;
//   - the BAGGAGE SERVICES counter on the left wall (SKYDOVE desk, computer, the wall calendar, papers);
//   - the back room behind it (x -122..-70): the LOST & FOUND cage (one lamp), the dusty-bags shelf + calendar, and the
//     warehouse corner with the shrink-wrapped pallet (SOLD).
//  Registers s01 s02 s03 s04 s05 s22 s23 s24 s25 s34 s35 s37 s38.
// =====================================================================
const AP = {};
const AP_HX = 70, AP_HZ = 45, AP_HH = 40;
const AP_A = 10, AP_RC = 6.5, AP_BY = 2.35, AP_V = 4.5, AP_ROLL = 0.12;   // carousel: half straight, centre radius, belt top, belt speed, plate roll
const AP_L = 4 * AP_A + 2 * Math.PI * AP_RC;
const AP_MX = -3, AP_SM = AP_MX + AP_A;   // the flap face (x) and its path coordinate (back straight runs -x -> +x)
const AP_T = [-0.4, -9.9];   // the traveller, behind the back straight just downstream of the flaps
const AP_CLERK = [-63.6, -13], AP_DX = -60;   // the clerk + the counter's centre line
const AP_REP = [-59.7, 4.78, -17.2];   // the missing-baggage report on the counter
const AP_BX0 = -122, AP_BX1 = -70.4, AP_BZ0 = -44, AP_BZ1 = 40, AP_BH = 24;   // back room
const AP_CAGE = [-104, -88, -43.8, -28];   // x0 x1 z0 z1
const AP_LAMP = [-96, -36];
const AP_DUST = [-119.4, -33];   // dusty-bags shelf (against the x = -122 wall)
const AP_PAL = [-114.5, 18], AP_PTOP = 5.1;   // the pallet + its top
const apSkin = '#fbf3ea';
// the belt path: s along the centre line (0 = (-A, -RC), the back straight first); off > 0 = toward the inside
function apPath(s, off = 0) {
  const r = AP_RC - off, A = AP_A, P = Math.PI * AP_RC; s = ((s % AP_L) + AP_L) % AP_L;
  if (s < 2 * A) return { x: -A + s, z: -r, a: 0 };
  s -= 2 * A; if (s < P) { const th = s / AP_RC; return { x: A + r * Math.sin(th), z: -r * Math.cos(th), a: th }; }
  s -= P; if (s < 2 * A) return { x: A - s, z: r, a: Math.PI };
  s -= 2 * A; const th = s / AP_RC; return { x: -A - r * Math.sin(th), z: r * Math.cos(th), a: Math.PI + th };
}
function apStadium(r, hole) { const s = hole ? new THREE.Path() : new THREE.Shape(), A = AP_A;
  s.moveTo(-A, -r); s.lineTo(A, -r); s.absarc(A, 0, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-A, r); s.absarc(-A, 0, r, Math.PI / 2, Math.PI * 1.5, false); return s; }
function apRing(r0, r1, depth, o = {}) { const sh = apStadium(r1); sh.holes.push(apStadium(r0, true));
  const g = depth ? new THREE.ExtrudeGeometry(sh, Object.assign({ depth, bevelEnabled: false, curveSegments: 24 }, o)) : new THREE.ShapeGeometry(sh, 24); g.rotateX(-Math.PI / 2); return g; }
// ---- textures
function apTexClaim() { return tex((g, w, h) => { g.fillStyle = '#12305e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f08a2a'; g.fillRect(0, h - 22, w, 22);
  g.strokeStyle = '#ffffff'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 50);
  g.save(); g.translate(120, h * 0.42); g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(-58, -40, 116, 86, 14); g.fill(); g.fillStyle = '#12305e'; g.fillRect(-20, -62, 40, 10); g.fillRect(-26, -62, 8, 26); g.fillRect(18, -62, 8, 26); g.restore();
  inked(g, 'BAGGAGE CLAIM', w * 0.5, h * 0.36, h * 0.27, '#ffffff', { stroke: false, maxW: w * 0.56 });
  inked(g, 'Flight 482 · Chicago', w * 0.5, h * 0.7, h * 0.15, '#ffd27a', { stroke: false, maxW: w * 0.56, weight: 800 });
  g.fillStyle = '#f08a2a'; g.beginPath(); g.arc(w - 120, h * 0.45, 92, 0, TAU); g.fill(); g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.stroke(); inked(g, '4', w - 120, h * 0.47, 130, '#ffffff', { stroke: false }); }, 1024, 320); }
function apTexFids() { return tex((g, w, h) => { g.fillStyle = '#0c1424'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f3f7a'; g.fillRect(0, 0, w, h * 0.18);
  inked(g, 'ARRIVALS · BAGGAGE', w / 2, h * 0.09, h * 0.09, '#ffffff', { stroke: false });
  const rows = [['482', 'CHICAGO', '4', 'ON BELT'], ['1170', 'DENVER', '2', 'LANDED'], ['209', 'BOSTON', '6', 'ON BELT'], ['77', 'MIAMI', '1', 'DELAYED'], ['3310', 'ATLANTA', '3', 'LANDED']];
  rows.forEach((r, i) => { const y = h * (0.3 + i * 0.15); if (i === 0) { g.fillStyle = '#f08a2a'; g.fillRect(0, y - h * 0.065, w, h * 0.13); }
    const c = i === 0 ? '#ffffff' : '#ffd27a'; inked(g, r[0], w * 0.1, y, h * 0.075, c, { stroke: false }); inked(g, r[1], w * 0.36, y, h * 0.075, c, { stroke: false, maxW: w * 0.3 });
    inked(g, r[2], w * 0.62, y, h * 0.08, c, { stroke: false }); inked(g, r[3], w * 0.83, y, h * 0.07, i === 3 ? '#ff6a5a' : c, { stroke: false, maxW: w * 0.28 }); }); }, 768, 432); }
function apLogo(g, x, y, s, c = '#ffffff') { g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.moveTo(-40 * s, 10 * s); g.quadraticCurveTo(-10 * s, -40 * s, 40 * s, -30 * s); g.quadraticCurveTo(0, -18 * s, -6 * s, 16 * s); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-30 * s, 18 * s); g.quadraticCurveTo(10 * s, 0, 44 * s, 4 * s); g.quadraticCurveTo(10 * s, 12 * s, -14 * s, 28 * s); g.closePath(); g.fill(); g.restore(); }
function apTexServices() { return tex((g, w, h) => { g.fillStyle = '#12305e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f08a2a'; g.fillRect(0, h - 26, w, 26);
  apLogo(g, 110, h * 0.45, 1.6, '#ffd27a'); inked(g, 'BAGGAGE SERVICES', w * 0.56, h * 0.38, h * 0.3, '#ffffff', { stroke: false, maxW: w * 0.7 });
  inked(g, 'SKYDOVE AIRLINES · Lost & Delayed Bags', w * 0.56, h * 0.72, h * 0.12, '#ffd27a', { stroke: false, maxW: w * 0.7, weight: 800 }); }, 1024, 256); }
function apTexDeskFront() { const t = tex((g, w, h) => { g.fillStyle = '#1f4f9a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f08a2a'; g.fillRect(0, h * 0.08, w, h * 0.05); g.fillStyle = 'rgba(255,255,255,0.1)'; for (let x = 0; x < w; x += 64) g.fillRect(x, h * 0.2, 3, h * 0.8);
  apLogo(g, w * 0.3, h * 0.55, 1.4); inked(g, 'SKYDOVE', w * 0.62, h * 0.55, h * 0.2, '#ffffff', { stroke: false }); }, 512, 256); return t; }
function apTexPoster(i) { return tex((g, w, h) => { const P = [['#f2c23a', '#c8402e', 'FLY', 'SKYDOVE', 'Coast to coast'], ['#2fa0c8', '#12305e', 'LOST', 'YOUR BAG?', "We'll find it! (probably)"], ['#3f9a5a', '#fff3d0', 'VISIT', 'CHICAGO', 'The Windy City']][i % 3];
  g.fillStyle = P[0]; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(w * 0.7, h * 0.32, w * 0.3, 0, TAU); g.fill();
  if (i % 3 === 1) { g.fillStyle = '#2f6fb8'; g.beginPath(); g.roundRect(w * 0.25, h * 0.2, w * 0.5, h * 0.24, 18); g.fill(); g.fillStyle = '#2a2224'; g.fillRect(w * 0.42, h * 0.16, w * 0.16, h * 0.05); g.fillStyle = '#ffffff'; inked(g, '?', w * 0.5, h * 0.32, h * 0.14, '#ffffff', { stroke: '#12305e' }); }
  else apLogo(g, w * 0.5, h * 0.3, 2.4, P[1]);
  inked(g, P[2], w / 2, h * 0.58, h * 0.1, P[1], { stroke: false }); inked(g, P[3], w / 2, h * 0.7, h * 0.1, P[1], { stroke: false, maxW: w * 0.86 }); inked(g, P[4], w / 2, h * 0.85, h * 0.045, P[1], { stroke: false, maxW: w * 0.86, weight: 700 });
  g.lineWidth = 12; g.strokeStyle = '#1a1420'; g.strokeRect(0, 0, w, h); }, 384, 576); }
function apTexTarmac() { const t = tex((g, w, h) => { g.fillStyle = '#5a5e66'; g.fillRect(0, 0, w, h); const R = RNG('tar'); for (let k = 0; k < 500; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(40,40,50,0.2)' : 'rgba(255,255,255,0.08)'; g.fillRect(R.f() * w, R.f() * h, 4, 4); }
  g.strokeStyle = '#f2c23a'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w, h * 0.5); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.setLineDash([30, 30]); g.beginPath(); g.moveTo(0, h * 0.2); g.lineTo(w, h * 0.2); g.stroke(); g.setLineDash([]); }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); return t; }
function apTexFour() { return tex((g, w, h) => { g.fillStyle = '#12305e'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 30); g.fill(); g.lineWidth = 12; g.strokeStyle = '#ffffff'; g.stroke(); inked(g, '4', w / 2, h * 0.53, h * 0.72, '#ffffff', { stroke: false }); }, 256, 256); }
function apTexChain() { const t = tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#c8ccd2'; g.lineWidth = 5; const n = 4;
  for (let i = -n; i <= 2 * n; i++) { g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n + w, h); g.stroke(); g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n - w, h); g.stroke(); } }, 128, 128);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function apTexNotice() { return tex((g, w, h) => { g.fillStyle = '#fbf3e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8321e'; g.fillRect(0, 0, w, h * 0.2); inked(g, 'NOTICE', w / 2, h * 0.1, h * 0.11, '#ffffff', { stroke: false });
  inked(g, 'UNCLAIMED ITEMS', w / 2, h * 0.32, h * 0.075, '#2a1a14', { stroke: false, maxW: w * 0.86 }); inked(g, 'RELEASED AFTER', w / 2, h * 0.43, h * 0.075, '#2a1a14', { stroke: false, maxW: w * 0.86 });
  inked(g, '90 DAYS', w / 2, h * 0.6, h * 0.16, '#c8321e', { stroke: false }); g.fillStyle = 'rgba(40,30,20,0.4)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.15, h * (0.75 + k * 0.06), w * 0.7, 5);
  g.lineWidth = 10; g.strokeStyle = '#2a1a14'; g.strokeRect(0, 0, w, h); }, 320, 420); }
function apTexLF() { return tex((g, w, h) => { g.fillStyle = '#f2c23a'; g.fillRect(0, 0, w, h); g.lineWidth = 14; g.strokeStyle = '#1a1a22'; g.strokeRect(7, 7, w - 14, h - 14);
  inked(g, 'LOST & FOUND', w / 2, h * 0.4, h * 0.3, '#1a1a22', { stroke: false, maxW: w * 0.86 }); inked(g, 'Unclaimed baggage · Staff only', w / 2, h * 0.76, h * 0.13, '#1a1a22', { stroke: false, maxW: w * 0.86, weight: 800 }); }, 1024, 256); }
function apTexTag(txt, c = '#c8321e', bg = '#f6efe0') { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = bg; g.beginPath(); g.moveTo(w * 0.2, 6); g.lineTo(w - 6, 6); g.lineTo(w - 6, h - 6); g.lineTo(w * 0.2, h - 6); g.lineTo(6, h / 2); g.closePath(); g.fill();
  g.lineWidth = 10; g.strokeStyle = '#2a1a14'; g.stroke(); g.fillStyle = '#2a1a14'; g.beginPath(); g.arc(w * 0.16, h / 2, 12, 0, TAU); g.fill(); inked(g, txt, w * 0.6, h * 0.52, h * 0.5, c, { stroke: false, maxW: w * 0.68 }); }, 512, 224); }
function apTexSticker() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 40); g.fill(); g.fillStyle = '#2f7a46'; g.beginPath(); g.roundRect(22, 22, w - 44, h - 44, 30); g.fill();
  inked(g, 'UNCLAIMED', w / 2, h * 0.3, h * 0.18, '#ffffff', { stroke: false, maxW: w * 0.7 }); inked(g, 'BAGGAGE', w / 2, h * 0.52, h * 0.18, '#ffd23a', { stroke: false, maxW: w * 0.7 });
  g.fillStyle = '#ffd23a'; g.fillRect(w * 0.18, h * 0.66, w * 0.64, 6); inked(g, 'ALABAMA', w / 2, h * 0.79, h * 0.13, '#ffffff', { stroke: false, maxW: w * 0.7 }); g.lineWidth = 8; g.strokeStyle = '#1a2a1a'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 40); g.stroke(); }, 640, 400); }
function apTexWrap() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(230,240,255,0.32)'; g.fillRect(0, 0, w, h); const R = RNG('wrap');
  for (let k = 0; k < 30; k++) { g.strokeStyle = `rgba(255,255,255,${R.r(0.2, 0.6)})`; g.lineWidth = R.r(2, 8); const y = R.f() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + R.n(30), w * 2 / 3, y + R.n(30), w, y + R.n(20)); g.stroke(); } }, 256, 256); }
function apMonthDraw(g, w, h, name, year) { g.fillStyle = '#fbf3e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8321e'; g.fillRect(0, 0, w, h * 0.27);
  inked(g, name, w / 2, h * 0.11, h * 0.12, '#ffffff', { stroke: false, maxW: w * 0.86 }); inked(g, String(name === 'JANUARY' && +year === 2025 ? 2026 : year), w / 2, h * 0.21, h * 0.06, '#ffe6a0', { stroke: false });
  // v6: a real calendar (the review caught 30-day Octobers starting on the wrong weekday): weekday of the 1st + month length
  const MN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'], mi = Math.max(0, MN.indexOf(name)), yr = +year + (mi === 0 && +year === 2025 ? 1 : 0);
  const off = new Date(Date.UTC(yr, mi, 1)).getUTCDay(), nd = new Date(Date.UTC(yr, mi + 1, 0)).getUTCDate(), rows = Math.ceil((off + nd) / 7), rh = rows > 5 ? 0.105 : 0.12;
  g.fillStyle = '#5a3a22'; g.font = `700 ${h * 0.05}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let d = 0; d < nd; d++) { const c = (d + off) % 7, r = Math.floor((d + off) / 7); g.fillText(String(d + 1), w * (0.1 + c * 0.133), h * (0.36 + r * rh)); }
  g.lineWidth = 6; g.strokeStyle = '#2a1a14'; g.strokeRect(0, 0, w, h); }
function apReportDraw(g, w, h, st) { g.fillStyle = '#fbf8ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#12305e'; g.fillRect(0, 0, w, h * 0.12); apLogo(g, w * 0.13, h * 0.06, 0.75, '#ffd27a');
  inked(g, 'SKYDOVE AIRLINES', w * 0.58, h * 0.062, h * 0.042, '#ffffff', { stroke: false, maxW: w * 0.66 });
  inked(g, 'MISSING BAGGAGE', w / 2, h * 0.18, h * 0.058, '#2a1a14', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.88 }); inked(g, 'REPORT', w / 2, h * 0.245, h * 0.058, '#2a1a14', { stroke: false, font: 'Georgia, serif', weight: 700 });
  const L = (a, b, y, c = '#1a3a8a') => { inked(g, a, w * 0.07, y, h * 0.032, '#5a4a3a', { stroke: false, align: 'left', weight: 700 }); inked(g, b, w * 0.93, y, h * 0.04, c, { stroke: false, align: 'right', font: '"Comic Sans MS", cursive', weight: 700, maxW: w * 0.58 }); g.fillStyle = 'rgba(40,30,20,0.3)'; g.fillRect(w * 0.07, y + h * 0.024, w * 0.86, 2); };
  L('File no.', 'CHI-482-0716', h * 0.33); L('Flight', '482 · Chicago', h * 0.395); L('Item', '1 suitcase', h * 0.46); L('Description', 'blue, yellow sticker', h * 0.525);
  inked(g, 'STATUS', w * 0.07, h * 0.61, h * 0.034, '#2a1a14', { stroke: false, align: 'left' });
  ['March — searching', 'April — searching', 'May — still searching', 'June — ...'].forEach((x, i) => { inked(g, x, w * 0.12, h * (0.66 + i * 0.05), h * 0.034, '#1a3a8a', { stroke: false, align: 'left', font: '"Comic Sans MS", cursive', weight: 700 }); });
  if (st) { g.save(); g.translate(w * 0.52, h * 0.8); g.rotate(-0.16); g.globalAlpha = 0.92; g.strokeStyle = '#d8282a'; g.lineWidth = 12; g.beginPath(); g.roundRect(-w * 0.4, -h * 0.06, w * 0.8, h * 0.12, 16); g.stroke();
    inked(g, 'CASE CLOSED', 0, 4, h * 0.07, '#d8282a', { stroke: false, font: 'Impact, Arial Black, sans-serif', maxW: w * 0.72 }); g.restore(); } }
function apInvoiceDraw(g, w, h, sig) { g.fillStyle = '#fbf8ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f7a46'; g.fillRect(0, 0, w, h * 0.1);
  inked(g, 'PURCHASE ORDER', w / 2, h * 0.052, h * 0.05, '#ffffff', { stroke: false, maxW: w * 0.86 });
  inked(g, 'LOT 4471', w / 2, h * 0.19, h * 0.085, '#2a1a14', { stroke: false, font: 'Georgia, serif', weight: 700 });
  g.fillStyle = 'rgba(40,30,20,0.35)'; g.fillRect(w * 0.08, h * 0.25, w * 0.84, 3);
  inked(g, 'QUANTITY', w * 0.08, h * 0.33, h * 0.036, '#5a4a3a', { stroke: false, align: 'left' }); inked(g, '1,200 BAGS', w * 0.92, h * 0.33, h * 0.055, '#2a1a14', { stroke: false, align: 'right', maxW: w * 0.5 });
  inked(g, 'SELLER', w * 0.08, h * 0.42, h * 0.036, '#5a4a3a', { stroke: false, align: 'left' }); inked(g, 'Airline', w * 0.92, h * 0.42, h * 0.045, '#2a1a14', { stroke: false, align: 'right' });
  inked(g, 'CONTENTS:', w * 0.08, h * 0.54, h * 0.06, '#2a1a14', { stroke: false, align: 'left' }); inked(g, '???', w * 0.8, h * 0.54, h * 0.085, '#d8282a', { stroke: false, font: 'Impact, Arial Black, sans-serif' });
  g.fillStyle = 'rgba(40,30,20,0.3)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.08, h * (0.63 + k * 0.035), w * (0.6 + 0.2 * (k % 2)), 3);
  inked(g, 'BUYER', w * 0.08, h * 0.83, h * 0.034, '#5a4a3a', { stroke: false, align: 'left' }); g.fillStyle = '#2a1a14'; g.fillRect(w * 0.3, h * 0.86, w * 0.62, 3);
  if (sig > 0) { g.save(); g.beginPath(); g.rect(w * 0.3, h * 0.74, w * 0.62 * sig, h * 0.14); g.clip(); g.strokeStyle = '#1a3a9a'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    for (let i = 0; i <= 60; i++) { const u = i / 60, x = w * (0.32 + 0.58 * u), y = h * (0.82 + 0.035 * Math.sin(u * 19) * (1 - 0.4 * u) - 0.02 * Math.sin(u * 5)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); } }
const apSigAt = (sig) => [0.32 + 0.58 * sig, 0.82 + 0.035 * Math.sin(sig * 19) * (1 - 0.4 * sig) - 0.02 * Math.sin(sig * 5)];
function apReceiptDraw(g, w, h) { g.fillStyle = '#fbfbf4'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8e8de'; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 12, h - 12); g.lineTo(x + 24, h); g.fill(); }
  const C = '#2a2a30'; inked(g, 'UNCLAIMED', w / 2, h * 0.07, h * 0.06, C, { stroke: false, maxW: w * 0.86 }); inked(g, 'BAGGAGE', w / 2, h * 0.13, h * 0.06, C, { stroke: false, maxW: w * 0.86 });
  inked(g, 'Scottsboro, AL', w / 2, h * 0.2, h * 0.034, C, { stroke: false, weight: 700 });
  const dash = (y) => { g.fillStyle = C; for (let x = w * 0.06; x < w * 0.94; x += 16) g.fillRect(x, y, 9, 3); };
  dash(h * 0.25); inked(g, '1 SUITCASE (BLUE)', w * 0.07, h * 0.31, h * 0.034, C, { stroke: false, align: 'left', maxW: w * 0.6, weight: 800 }); inked(g, '$19.99', w * 0.93, h * 0.31, h * 0.034, C, { stroke: false, align: 'right', weight: 800 });
  inked(g, 'CONTENTS:', w * 0.07, h * 0.39, h * 0.04, C, { stroke: false, align: 'left', weight: 800 }); inked(g, 'SOLD', w * 0.93, h * 0.39, h * 0.05, '#d8282a', { stroke: false, align: 'right', font: 'Impact, Arial Black, sans-serif' });
  dash(h * 0.45); inked(g, 'TOTAL', w * 0.07, h * 0.51, h * 0.04, C, { stroke: false, align: 'left', weight: 800 }); inked(g, '$19.99', w * 0.93, h * 0.51, h * 0.04, C, { stroke: false, align: 'right', weight: 800 });
  dash(h * 0.57); inked(g, 'THANK YOU', w / 2, h * 0.64, h * 0.05, C, { stroke: false, maxW: w * 0.86 }); inked(g, 'FOR SHOPPING!', w / 2, h * 0.7, h * 0.05, C, { stroke: false, maxW: w * 0.86 });
  g.fillStyle = C; for (let i = 0; i < 34; i++) { const bw = (i * 7) % 3 + 2; g.fillRect(w * 0.14 + i * w * 0.021, h * 0.77, bw * 2, h * 0.07); } inked(g, '0716 4471 0482', w / 2, h * 0.87, h * 0.026, C, { stroke: false, weight: 700 }); }
// ---- props
// a simple belt bag (hard shell lying flat or a duffel), long axis along local x; ~4 meshes
function apBag(o) { const g = new THREE.Group(), c = o.c, M = c3Prop(c, { rough: o.k === 'duffel' ? 0.85 : 0.4 }), D = c3Prop(t3Mul(c, 0.72), { rough: 0.6 }), H = AP.mHandle;
  if (o.k === 'duffel') { const r = o.d / 2; const b = c3Mesh(new THREE.CapsuleGeometry(r, o.w - 2 * r, 6, 14), M, 0.02); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, 0.82); b.position.y = r * 0.82; g.add(b);
    g.add(rb(o.w * 0.92, 0.1, 0.12, D, 0, r * 1.62, 0, 0)); const st = c3Mesh(new THREE.TorusGeometry(0.55, 0.09, 6, 12, Math.PI), H, 0.01); st.position.set(0, r * 1.6, 0); g.add(st); g.userData.hw = o.w / 2; g.userData.hd = r; }
  else { g.add(rb(o.w, o.h, o.d, M, 0, o.h / 2, 0, 0.02)); for (const fx of [-0.24, 0.24]) g.add(rb(0.14, o.h + 0.04, o.d + 0.04, D, fx * o.w, o.h / 2, 0, 0)); g.add(rb(1.0, 0.16, 0.16, H, 0, o.h * 0.6, -o.d / 2 - 0.22, 0));
    if (o.st) { const s = c3Mesh(new THREE.CircleGeometry(0.36, 14), c3Prop(o.st), 0); s.rotation.x = -Math.PI / 2; s.position.set(o.w * 0.3, o.h + 0.03, 0.3); g.add(s); } g.userData.hw = o.w / 2; g.userData.hd = o.d / 2; }
  return g; }
// a wall calendar with a flippable top page: { g, base, front } (canvasTex), pages hinge on the top edge
function apCalendar(parent, x, y, z, ry, w = 3, h = 3.8) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  g.add(rb(w + 0.4, h + 0.6, 0.12, c3Prop('#5a3a22'), 0, -0.1, -0.05, 0.01)); const ring = c3Prop('#c8c4bc', { metal: 0.6 }); for (const sx of [-0.3, 0.3]) g.add(cyl(0.08, 0.08, 0.3, ring, sx * w, h / 2 + 0.05, 0.08, 0, 6));
  const base = canvasTex(320, 400), front = canvasTex(320, 400), bm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: base.t })); bm.position.z = 0.03; g.add(bm);
  const pv = new THREE.Group(); pv.position.set(0, h / 2, 0.06); g.add(pv); const fm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: front.t })); fm.position.y = -h / 2; pv.add(fm);
  const bk = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ color: '#e8dcc4' })); bk.position.set(0, -h / 2, -0.005); bk.rotation.y = Math.PI; pv.add(bk);
  return { g, base, front, pv }; }
// the calendar at time t: months[], flips[] (times), each flip takes d s
function apCalAt(C, t, months, flips, year, d = 0.16) { let n = 0; for (const f of flips) if (t >= f + d) n++;
  const fl = flips.find((f) => t >= f && t < f + d); n = Math.min(n, months.length - 1);
  const bn = months[Math.min(months.length - 1, fl != null ? n + 1 : n)]; redraw(C.base, 'b' + bn, (g, w, h) => apMonthDraw(g, w, h, bn, year));
  if (fl != null) { C.pv.visible = true; redraw(C.front, 'f' + months[n], (g, w, h) => apMonthDraw(g, w, h, months[n], year)); C.pv.rotation.x = -Math.PI * EZ.io(clamp((t - fl) / d)); } else C.pv.visible = false; }

// ---- v4 detail pass (realistic set): textures. Worn painted panels (roller marks, chips, scuffs) over a scratched navy wainscot
function apTexHall() { const t = tex((g, w, h) => { const R = RNG('aphall2'), top = h * 0.72;
  for (let x = 0; x < w; x += 256) { g.fillStyle = `hsl(187,${66 + R.r(-4, 4)}%,${34 + R.r(-2.5, 2.5)}%)`; g.fillRect(x, 0, 256, top); }
  for (let k = 0; k < 900; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,30,40,0.05)'; g.fillRect(R.f() * w, R.f() * top, R.r(10, 40), R.r(30, 120)); }
  for (let k = 0; k < 2500; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,20,30,0.12)' : 'rgba(255,255,255,0.08)'; g.fillRect(R.f() * w, R.f() * top, 2, 2); }
  for (let x = 0; x < w; x += 256) { g.fillStyle = 'rgba(0,25,35,0.45)'; g.fillRect(x, 0, 5, top); g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(x + 5, 0, 3, top); }
  for (let k = 0; k < 40; k++) { const x = R.f() * w, y = top - R.r(4, 140); g.fillStyle = 'rgba(210,225,220,0.7)'; g.beginPath(); g.ellipse(x, y, R.r(2, 7), R.r(1.5, 4), R.f() * 3, 0, TAU); g.fill(); }
  for (let k = 0; k < 30; k++) { const x = R.f() * w, gr = g.createLinearGradient(0, 0, 0, top); gr.addColorStop(0, 'rgba(0,20,25,0)'); gr.addColorStop(1, 'rgba(0,20,25,0.12)'); g.fillStyle = gr; g.fillRect(x, R.r(0, top * 0.6), R.r(3, 10), top); }
  g.fillStyle = '#e07a22'; g.fillRect(0, top, w, h * 0.035); g.fillStyle = 'rgba(255,220,170,0.35)'; g.fillRect(0, top, w, 4); g.fillStyle = 'rgba(60,20,0,0.4)'; g.fillRect(0, top + h * 0.035 - 5, w, 5);
  g.fillStyle = '#1d3a70'; g.fillRect(0, h * 0.755, w, h); for (let x = 0; x < w; x += 128) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,20,0.08)'; g.fillRect(x, h * 0.755, 128, h); g.fillStyle = 'rgba(0,0,15,0.35)'; g.fillRect(x, h * 0.755, 3, h); }
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, h * 0.77, w, 4);
  g.lineCap = 'round'; for (let k = 0; k < 70; k++) { const x = R.f() * w, y = R.r(h * 0.78, h * 0.97); g.strokeStyle = R.f() < 0.75 ? `rgba(10,10,20,${R.r(0.12, 0.3)})` : `rgba(200,210,230,${R.r(0.05, 0.12)})`; g.lineWidth = R.r(1, 3); g.beginPath(); g.moveTo(x, y); g.lineTo(x + R.n(40), y + R.n(6)); g.stroke(); }
  for (let k = 0; k < 18; k++) { const x = R.f() * w, gr = g.createRadialGradient(x, h, 0, x, h, 60); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 60, h - 60, 120, 60); }
  g.fillStyle = '#121f3c'; g.fillRect(0, h * 0.97, w, h * 0.03); }, 1024, 1024); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// worn terrazzo tiles: warm chips, grout with grime at the crossings, traffic wear, scuffs, hairline cracks
function apTexFloor() { const t = tex((g, w, h) => { const R = RNG('apfl2'), n = 4, s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = `hsl(${23 + R.r(-3, 3)},${40 + R.r(-5, 5)}%,${44 + R.r(-4, 4)}%)`; g.fillRect(i * s, j * s, s, s);
    const gr = g.createLinearGradient(i * s, j * s, (i + 1) * s, (j + 1) * s); gr.addColorStop(0, 'rgba(255,240,220,0.07)'); gr.addColorStop(1, 'rgba(60,25,10,0.1)'); g.fillStyle = gr; g.fillRect(i * s, j * s, s, s); }
  const C = ['rgba(245,225,200,0.5)', 'rgba(100,45,20,0.45)', 'rgba(50,35,30,0.4)', 'rgba(225,150,95,0.5)', 'rgba(40,60,70,0.22)'];
  for (let k = 0; k < 11000; k++) { g.fillStyle = C[k % 5]; const r = R.r(0.8, 3.4); g.beginPath(); g.ellipse(R.f() * w, R.f() * h, r, r * R.r(0.5, 1), R.f() * 3, 0, TAU); g.fill(); }
  for (let k = 0; k < 16; k++) { const x = R.f() * w, y = R.f() * h, r = R.r(60, 220), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.5 ? 'rgba(80,40,25,0.14)' : 'rgba(255,235,210,0.07)'); gr.addColorStop(1, 'rgba(80,40,25,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.lineCap = 'round'; for (let k = 0; k < 90; k++) { g.strokeStyle = `rgba(25,12,8,${R.r(0.08, 0.28)})`; g.lineWidth = R.r(1, 4); const x = R.f() * w, y = R.f() * h, a = R.f() * TAU, l = R.r(10, 70); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + R.n(10), y + Math.sin(a) * l * 0.5 + R.n(10), x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i <= n; i++) { g.fillStyle = '#4e2a1a'; g.fillRect(i * s - 3, 0, 6, h); g.fillRect(0, i * s - 3, w, 6); g.fillStyle = 'rgba(255,230,200,0.16)'; g.fillRect(i * s + 3, 0, 2, h); g.fillRect(0, i * s + 3, w, 2); }
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const gr = g.createRadialGradient(i * s, j * s, 0, i * s, j * s, 34); gr.addColorStop(0, 'rgba(35,18,8,0.35)'); gr.addColorStop(1, 'rgba(35,18,8,0)'); g.fillStyle = gr; g.fillRect(i * s - 34, j * s - 34, 68, 68); }
  for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(45,22,12,0.5)'; g.lineWidth = 1.5; let x = R.f() * w, y = R.f() * h; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 7; q++) { x += R.n(20); y += R.n(20); g.lineTo(x, y); } g.stroke(); }
}, 1024, 1024); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 6.5); return t; }
// acoustic ceiling tiles: speckle, water stains, return-air grilles, light panels
function apTexCeil() { const t = tex((g, w, h) => { const R = RNG('apceil'), n = 8, s = w / n; g.fillStyle = '#1a3448'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'; g.fillRect(i * s, j * s, s, s);
    if (R.f() < 0.12) { const gr = g.createRadialGradient(i * s + s / 2, j * s + s / 2, 0, i * s + s / 2, j * s + s / 2, s * 0.6); gr.addColorStop(0, 'rgba(90,70,40,0.4)'); gr.addColorStop(1, 'rgba(90,70,40,0)'); g.fillStyle = gr; g.fillRect(i * s, j * s, s, s); }
    if (R.f() < 0.1) { g.fillStyle = '#0e1c28'; g.fillRect(i * s + 8, j * s + 8, s - 16, s - 16); g.fillStyle = 'rgba(160,180,195,0.35)'; for (let y = j * s + 12; y < (j + 1) * s - 10; y += 6) g.fillRect(i * s + 10, y, s - 20, 2); } }
  for (let k = 0; k < 3000; k++) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(R.f() * w, R.f() * h, 1.5, 1.5); }
  g.strokeStyle = 'rgba(200,210,220,0.18)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
  for (const [x, y] of [[0.25, 0.25], [0.75, 0.75], [0.75, 0.25], [0.25, 0.75]]) { g.fillStyle = '#d8d4c8'; g.fillRect(x * w - w * 0.13, y * h - h * 0.065, w * 0.26, h * 0.13); g.fillStyle = '#fff6dc'; g.fillRect(x * w - w * 0.12, y * h - h * 0.055, w * 0.24, h * 0.11); g.fillStyle = 'rgba(200,190,160,0.4)'; for (let q = 1; q < 4; q++) g.fillRect(x * w - w * 0.12 + q * w * 0.06, y * h - h * 0.055, 2, h * 0.11); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 5); return t; }
function apTexHousing() { return tex((g, w, h) => { const R = RNG('aphous'); g.fillStyle = '#e8801f'; g.fillRect(0, 0, w, h); for (let k = 0; k < 1500; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(80,30,0,0.08)' : 'rgba(255,230,190,0.07)'; g.fillRect(R.f() * w, R.f() * h, R.r(2, 8), R.r(2, 8)); }
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, h * 0.1, w, 6); g.fillStyle = 'rgba(60,20,0,0.35)'; g.fillRect(0, h * 0.1 + 6, w, 3);
  for (let k = 0; k < 24; k++) { const x = R.f() * w, gr = g.createLinearGradient(0, h * 0.12, 0, h * 0.85); gr.addColorStop(0, 'rgba(50,20,0,0.18)'); gr.addColorStop(1, 'rgba(50,20,0,0)'); g.fillStyle = gr; g.fillRect(x, h * 0.12, R.r(2, 6), h * 0.73); }
  g.lineCap = 'round'; for (let k = 0; k < 60; k++) { const x = R.f() * w, y = R.r(h * 0.5, h * 0.87); g.strokeStyle = R.f() < 0.5 ? 'rgba(40,20,10,0.4)' : 'rgba(220,220,220,0.5)'; g.lineWidth = R.r(1, 3); g.beginPath(); g.moveTo(x, y); g.lineTo(x + R.n(30), y + R.n(5)); g.stroke(); }
  for (let x = -h; x < w; x += 40) { g.fillStyle = '#1a1a22'; g.beginPath(); g.moveTo(x, h); g.lineTo(x + 20, h); g.lineTo(x + 20 + h * 0.12, h * 0.88); g.lineTo(x + h * 0.12, h * 0.88); g.fill(); }
  g.fillStyle = '#e8b82a'; for (let x = -h; x < w; x += 40) { g.beginPath(); g.moveTo(x + 20, h); g.lineTo(x + 40, h); g.lineTo(x + 40 + h * 0.12, h * 0.88); g.lineTo(x + 20 + h * 0.12, h * 0.88); g.fill(); }
  for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(30,20,10,0.35)'; g.fillRect(R.f() * w, R.r(h * 0.88, h), R.r(4, 14), R.r(2, 6)); }
  for (let i = 0; i < 6; i++) { const x = 30 + i * (w - 60) / 5; g.fillStyle = 'rgba(70,25,5,0.45)'; g.beginPath(); g.arc(x, h * 0.06, 6, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,50,10,0.2)'; g.fillRect(x - 3, h * 0.06, 6, R.r(20, 60)); } }, 512, 512); }
// painted cinder block: yellow block (mortar, pores, rust/drip stains) over a chipped green wainscot
function apTexBackWall() { const t = tex((g, w, h) => { const R = RNG('apbw2'), top = h * 0.62, bh = top / 16, bw = w / 8;
  for (let r = 0; r < 26; r++) { const y = r * bh, up = y < top - 1, off = r % 2 ? bw / 2 : 0;
    for (let c = -1; c < 9; c++) { g.fillStyle = up ? `hsl(${40 + R.r(-2, 2)},${60 + R.r(-6, 6)}%,${50 + R.r(-4, 3)}%)` : `hsl(${150 + R.r(-3, 3)},${38 + R.r(-4, 4)}%,${29 + R.r(-2.5, 2.5)}%)`; g.fillRect(c * bw + off, y, bw, bh); } }
  for (let k = 0; k < 9000; k++) { g.fillStyle = R.f() < 0.6 ? 'rgba(60,40,10,0.16)' : 'rgba(255,250,230,0.12)'; g.fillRect(R.f() * w, R.f() * h, 2, 2); }
  g.fillStyle = 'rgba(90,65,25,0.55)'; for (let r = 0; r <= 26; r++) { g.fillRect(0, r * bh - 2, w, 4); const off = r % 2 ? bw / 2 : 0; for (let c = -1; c < 9; c++) g.fillRect(c * bw + off - 2, r * bh, 4, bh); }
  for (let k = 0; k < 26; k++) { const x = R.f() * w, y0 = R.r(0, top * 0.5), gr = g.createLinearGradient(0, y0, 0, y0 + R.r(120, 400)); gr.addColorStop(0, R.f() < 0.4 ? 'rgba(120,60,20,0.28)' : 'rgba(50,40,25,0.28)'); gr.addColorStop(1, 'rgba(50,40,25,0)'); g.fillStyle = gr; g.fillRect(x, y0, R.r(4, 18), 400); }
  for (let k = 0; k < 8; k++) { const x = R.f() * w, y = R.f() * top, r = R.r(40, 120), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(70,50,20,0.22)'); gr.addColorStop(1, 'rgba(70,50,20,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.fillStyle = '#1a3a28'; g.fillRect(0, top - 2, w, 12); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, top + 10, w, 2);
  for (let k = 0; k < 120; k++) { const x = R.f() * w, y = R.r(top + 14, h - 4); g.fillStyle = R.f() < 0.7 ? 'rgba(180,185,170,0.55)' : 'rgba(10,20,15,0.5)'; g.beginPath(); g.ellipse(x, y, R.r(2, 9), R.r(1.5, 5), R.f() * 3, 0, TAU); g.fill(); }
  g.lineCap = 'round'; for (let k = 0; k < 90; k++) { const x = R.f() * w, y = R.r(h * 0.8, h - 4); g.strokeStyle = `rgba(10,15,10,${R.r(0.2, 0.5)})`; g.lineWidth = R.r(1, 4); g.beginPath(); g.moveTo(x, y); g.lineTo(x + R.n(50), y + R.n(6)); g.stroke(); }
  const gr = g.createLinearGradient(0, h * 0.85, 0, h); gr.addColorStop(0, 'rgba(15,20,15,0)'); gr.addColorStop(1, 'rgba(15,20,15,0.45)'); g.fillStyle = gr; g.fillRect(0, h * 0.85, w, h * 0.15); }, 1024, 1024);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// sealed concrete slab: mottling, pores, saw-cut joints, cracks, oil stains, tyre marks, paint flecks
function apTexConcrete() { const t = tex((g, w, h) => { const R = RNG('apconc2'); g.fillStyle = '#66727c'; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 60; k++) { const x = R.f() * w, y = R.f() * h, r = R.r(40, 200), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.5 ? 'rgba(30,38,45,0.16)' : 'rgba(200,205,205,0.1)'); gr.addColorStop(1, 'rgba(30,38,45,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let k = 0; k < 14000; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(25,30,38,0.2)' : 'rgba(230,235,235,0.12)'; g.fillRect(R.f() * w, R.f() * h, R.r(1, 3), R.r(1, 3)); }
  for (let k = 0; k < 7; k++) { const x = R.f() * w, y = R.f() * h, r = R.r(20, 80); g.fillStyle = 'rgba(15,15,20,0.25)'; g.beginPath(); g.ellipse(x, y, r, r * R.r(0.5, 0.9), R.f() * 3, 0, TAU); g.fill(); g.fillStyle = 'rgba(15,15,20,0.18)'; g.beginPath(); g.ellipse(x + R.n(10), y + R.n(10), r * 0.6, r * 0.4, R.f() * 3, 0, TAU); g.fill(); }
  g.lineCap = 'round'; for (let k = 0; k < 6; k++) { const x = R.f() * w, y = R.f() * h, rr = R.r(200, 500); g.strokeStyle = 'rgba(20,20,25,0.12)'; g.lineWidth = R.r(10, 16); g.beginPath(); g.arc(x, y, rr, R.f() * TAU, R.f() * TAU); g.stroke(); }
  for (let k = 0; k < 10; k++) { g.strokeStyle = 'rgba(25,28,32,0.55)'; g.lineWidth = R.r(1, 2.2); let x = R.f() * w, y = R.f() * h; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 12; q++) { x += R.n(30); y += R.n(30); g.lineTo(x, y); } g.stroke(); }
  for (let k = 0; k < 40; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(230,190,50,0.5)' : 'rgba(240,240,230,0.4)'; g.beginPath(); g.arc(R.f() * w, R.f() * h, R.r(1, 4), 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(20,24,30,0.7)'; g.fillRect(0, 0, w, 4); g.fillRect(0, 0, 4, h); g.fillRect(0, h / 2 - 2, w, 3); g.fillRect(w / 2 - 2, 0, 3, h); }, 1024, 1024);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 5); return t; }
function apTexRollDoor() { return tex((g, w, h) => { const R = RNG('aproll'), gr = g.createLinearGradient(0, h * 0.55, 0, h); gr.addColorStop(0, '#ffe8b0'); gr.addColorStop(1, '#f2c070'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a7a6a'; g.fillRect(0, h * 0.8, w, h * 0.2); g.fillStyle = '#e8402e'; g.fillRect(w * 0.15, h * 0.62, w * 0.5, h * 0.2); g.fillStyle = '#2a2a30'; g.beginPath(); g.arc(w * 0.25, h * 0.84, 18, 0, TAU); g.arc(w * 0.55, h * 0.84, 18, 0, TAU); g.fill();
  g.fillStyle = '#8e98a2'; g.fillRect(0, 0, w, h * 0.58);
  for (let y = 0; y < h * 0.58; y += 16) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; g.fillRect(0, y, w, 16); g.fillStyle = 'rgba(30,40,50,0.45)'; g.fillRect(0, y + 6, w, 3); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, y + 9, w, 2); }
  for (let k = 0; k < 18; k++) { const x = R.f() * w, gg = g.createLinearGradient(0, 0, 0, h * 0.58); gg.addColorStop(0, 'rgba(60,40,20,0)'); gg.addColorStop(1, 'rgba(60,40,20,0.3)'); g.fillStyle = gg; g.fillRect(x, R.r(0, h * 0.3), R.r(3, 12), h * 0.58); }
  for (let k = 0; k < 6; k++) { const x = R.f() * w, y = R.r(h * 0.3, h * 0.55), r = R.r(10, 24), dg = g.createRadialGradient(x, y, 0, x, y, r); dg.addColorStop(0, 'rgba(20,25,30,0.35)'); dg.addColorStop(1, 'rgba(20,25,30,0)'); g.fillStyle = dg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.fillStyle = '#e8b82a'; g.fillRect(0, h * 0.56, w, 10); g.fillStyle = 'rgba(30,20,10,0.4)'; for (let x = 0; x < w; x += 22) g.fillRect(x, h * 0.56, 11, 10);
  g.lineWidth = 14; g.strokeStyle = '#3a3a40'; g.strokeRect(0, 0, w, h); }, 512, 512); }
function apTexBrushed() { const t = tex((g, w, h) => { const R = RNG('apbrush'); g.fillStyle = '#d4d4d4'; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 900; k++) { g.fillStyle = R.f() < 0.5 ? `rgba(255,255,255,${R.r(0.03, 0.09)})` : `rgba(60,60,60,${R.r(0.03, 0.08)})`; g.fillRect(R.r(-100, w), R.f() * h, R.r(60, 400), 1); }
  for (let k = 0; k < 10; k++) { const x = R.f() * w, y = R.f() * h, r = R.r(20, 70), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(40,40,40,0.22)'); gr.addColorStop(1, 'rgba(40,40,40,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.lineCap = 'round'; for (let k = 0; k < 50; k++) { const x = R.f() * w, y = R.f() * h; g.strokeStyle = R.f() < 0.5 ? 'rgba(30,30,30,0.35)' : 'rgba(255,255,255,0.45)'; g.lineWidth = R.r(0.8, 2); g.beginPath(); g.moveTo(x, y); g.lineTo(x + R.n(40), y + R.n(8)); g.stroke(); } }, 512, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function apTexCard() { const t = tex((g, w, h) => { const R = RNG('apcard'), gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#d0a468'); gr.addColorStop(1, '#b88a52'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 5) { g.fillStyle = 'rgba(90,55,20,0.06)'; g.fillRect(x, 0, 2, h); }
  for (let k = 0; k < 1200; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(80,50,20,0.12)' : 'rgba(255,240,210,0.1)'; g.fillRect(R.f() * w, R.f() * h, 2, 2); }
  g.fillStyle = 'rgba(230,200,150,0.75)'; g.fillRect(0, h * 0.44, w, h * 0.12); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, h * 0.45, w, 3);
  g.fillStyle = '#f2ece0'; g.fillRect(w * 0.62, h * 0.66, w * 0.28, h * 0.2); g.fillStyle = 'rgba(40,30,20,0.5)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.65, h * (0.7 + k * 0.045), w * 0.2, 3);
  g.fillStyle = 'rgba(40,25,10,0.55)'; for (const x of [0.12, 0.24]) { g.beginPath(); g.moveTo(w * x, h * 0.12); g.lineTo(w * (x + 0.05), h * 0.2); g.lineTo(w * (x - 0.05), h * 0.2); g.fill(); g.fillRect(w * x - 4, h * 0.2, 8, h * 0.1); }
  for (let k = 0; k < 8; k++) { const x = R.f() * w, y = R.f() * h, r = R.r(10, 40), dg = g.createRadialGradient(x, y, 0, x, y, r); dg.addColorStop(0, 'rgba(70,45,20,0.25)'); dg.addColorStop(1, 'rgba(70,45,20,0)'); g.fillStyle = dg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.strokeStyle = 'rgba(70,45,20,0.6)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); }, 256, 256); return t; }
function apTexGlass() { const t = tex((g, w, h) => { const R = RNG('apglass'); g.clearRect(0, 0, w, h); { const sg = g.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, 'rgba(110,100,200,0.2)'); sg.addColorStop(0.55, 'rgba(255,170,110,0.12)'); sg.addColorStop(1, 'rgba(255,140,60,0.26)'); g.fillStyle = sg; g.fillRect(0, 0, w, h); }   // v5: the golden-hour glow through the glass (ref 3)
  for (let k = 0; k < 6; k++) { const x = R.f() * w * 1.4 - w * 0.2, ww = R.r(20, 90), gr = g.createLinearGradient(x, 0, x + ww, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${R.r(0.05, 0.16)})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.save(); g.transform(1, 0, -0.5, 1, 0, 0); g.fillStyle = gr; g.fillRect(x, 0, ww, h); g.restore(); }
  for (let k = 0; k < 30; k++) { const x = R.f() * w, y = R.r(h * 0.6, h), r = R.r(6, 30), dg = g.createRadialGradient(x, y, 0, x, y, r); dg.addColorStop(0, 'rgba(230,235,240,0.12)'); dg.addColorStop(1, 'rgba(230,235,240,0)'); g.fillStyle = dg; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, 512, 512);
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(5, 1); return t; }
function apTexGrille() { const t = tex((g, w, h) => { g.fillStyle = '#18243a'; g.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 10) { g.fillStyle = '#4a5a72'; g.fillRect(0, y, w, 4); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, y + 4, w, 2); }
  g.fillStyle = '#2a3a52'; g.fillRect(0, 0, 4, h); g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3); }, 64, 64); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// ---- merge helper: many parts -> one vertex-coloured mesh (one draw call)
const apMx = new THREE.Matrix4(), apQt = new THREE.Quaternion(), apEu = new THREE.Euler();
function apG(geo, x, y, z, rx = 0, ry = 0, rz = 0) { apEu.set(rx, ry, rz, 'YXZ'); apQt.setFromEuler(apEu); apMx.compose(V3(x, y, z), apQt, V3(1, 1, 1)); return geo.applyMatrix4(apMx); }
const apBx = (w, h, d, x, y, z, ry = 0, rx = 0, rz = 0) => apG(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
const apRB = (w, h, d, x, y, z, ry = 0, rx = 0) => apG(c3RBox(w, h, d, Math.min(0.08, w * 0.2, h * 0.2, d * 0.2), 2), x, y, z, rx, ry, 0);
const apCy = (r0, r1, h, x, y, z, rx = 0, ry = 0, rz = 0, seg = 12) => apG(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, rx, ry, rz);
const apSp = (r, x, y, z) => apG(new THREE.SphereGeometry(r, 10, 6), x, y, z);
// a pipe run along points (straight segments + ball elbows)
function apPipe(P, pts, r, c) { for (let i = 1; i < pts.length; i++) { const a = V3(...pts[i - 1]), b = V3(...pts[i]), L = a.distanceTo(b), g = new THREE.CylinderGeometry(r, r, L, 10);
  apQt.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize()); apMx.compose(a.clone().add(b).multiplyScalar(0.5), apQt, V3(1, 1, 1)); P.push([g.applyMatrix4(apMx), c]); if (i < pts.length - 1) P.push([apSp(r * 1.3, ...pts[i]), c]); } }
function apMerge(parts, o = {}) { const L = parts.map(([g, c]) => [g.index ? g.toNonIndexed() : g, new THREE.Color(c)]); let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
  for (const [g, c] of L) { const p = g.attributes.position, nn = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++, k++) { P[k * 3] = p.getX(i); P[k * 3 + 1] = p.getY(i); P[k * 3 + 2] = p.getZ(i); N[k * 3] = nn.getX(i); N[k * 3 + 1] = nn.getY(i); N[k * 3 + 2] = nn.getZ(i); C[k * 3] = c.r; C[k * 3 + 1] = c.g; C[k * 3 + 2] = c.b; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  const mat = c3Prop('#ffffff', { map: o.map, rough: o.rough ?? 0.55, metal: o.metal ?? 0, emissive: o.emissive, ei: o.ei, glow: o.glow }); mat.vertexColors = true;
  const m = new THREE.Mesh(geo, mat); m.userData.noShade = true; if (o.noCast) m.userData.noCast = true; return m; }
// cardboard boxes (one mesh): [w, h, d, x, y, z, ry, tint]
function apBoxes(list) { return apMerge(list.map(([w, h, d, x, y, z, ry = 0, c = '#ffffff']) => [apBx(w, h, d, x, y, z, ry), c]), { map: AP.card, rough: 0.85 }); }
// a wooden pallet (3 stringers + 7 deck boards), axis-aligned
function apPalletParts(P, x, y, z, c = '#c89a62') { for (const lz of [-2.6, 0, 2.6]) P.push([apBx(7.2, 0.6, 0.9, x, y + 0.3, z + lz), t3Mul(c, 0.82)]);
  for (let i = 0; i < 7; i++) P.push([apBx(0.85, 0.22, 6.2, x - 3.1 + i * 1.033, y + 0.71, z), i % 3 ? c : t3Mul(c, 0.9)]); }
// a wall-mounted fire extinguisher facing +(nx, nz) (one of them is 0)
function apExting(P, x, y, z, nx, nz) { const ox = x + nx * 0.45, oz = z + nz * 0.45, ry = nx ? Math.PI / 2 : 0;
  P.push([apBx(0.7, 0.3, 0.12, x + nx * 0.06, y + 0.4, z + nz * 0.06, ry), '#2a2a30']);
  P.push([apCy(0.34, 0.34, 1.7, ox, y, oz, 0, 0, 0, 14), '#c41e16']); P.push([apSp(0.34, ox, y + 0.85, oz), '#c41e16']); P.push([apCy(0.1, 0.1, 0.35, ox, y + 1.25, oz), '#2a2a30']);
  P.push([apBx(0.55, 0.08, 0.14, ox, y + 1.42, oz, ry), '#1a1a1e']); P.push([apCy(0.06, 0.06, 1.3, ox + nx * 0.34 + nz * 0.2, y + 0.4, oz + nz * 0.34 + nx * 0.2, 0, 0, 0, 6), '#1a1a1e']);
  P.push([apBx(1.0, 1.0, 0.04, x + nx * 0.03, y + 2.0, z + nz * 0.03, ry), '#c41e16']); P.push([apBx(0.5, 0.6, 0.05, x + nx * 0.04, y + 2.0, z + nz * 0.04, ry), '#f2ece0']); }
const apTrash = (S, D, x, z, c = '#9aa4ae') => { S.push([apCy(0.85, 0.8, 3, x, 1.5, z, 0, 0, 0, 16), c]); S.push([apCy(0.9, 0.9, 0.3, x, 3.1, z, 0, 0, 0, 16), t3Mul(c, 0.8)]); D.push([apCy(0.5, 0.5, 0.06, x, 3.27, z, 0, 0, 0, 14), '#141418']); };
// ---- hall dressing: baseboards, door trim, conduit + outlets, extinguisher, seats under the windows, bins, wet-floor sign, a trolley corral
function apDetailHall(scene, trolley) { const P = [], S = [], D = [];   // painted, steel, dark
  const bb = '#141a28'; P.push([apBx(0.3, 0.7, 18.6, -69.85, 0.35, -35.7), bb], [apBx(0.3, 0.7, 67.6, -69.85, 0.35, 11.2), bb], [apBx(0.3, 0.7, 90, 69.85, 0.35, 0), bb], [apBx(140, 0.7, 0.3, 0, 0.35, 44.85), bb]);
  for (const z of [-26.55, -22.45]) P.push([apRB(0.35, 7.0, 0.4, -69.82, 3.5, z), '#2a2e38']); P.push([apRB(0.35, 0.4, 4.5, -69.82, 6.9, -24.5), '#2a2e38']); S.push([apBx(0.05, 0.9, 3.4, -69.78, 0.55, -24.5), '#b8bec4']);
  // conduit runs + junction boxes, switch, outlets (left wall)
  for (const z of [-27.6, 1.0]) { S.push([apCy(0.1, 0.1, 39.3, -69.72, 20.35, z, 0, 0, 0, 8), '#a4aab0']); S.push([apBx(0.35, 0.8, 0.6, -69.7, z < 0 ? 4.4 : 1.6, z), '#8a9096']); }
  P.push([apBx(0.08, 0.7, 0.45, -69.78, 4.4, -26.95), '#e8e4da']);
  for (const z of [-18, -6, 12]) { P.push([apBx(0.08, 0.7, 0.45, -69.78, 1.6, z), '#e8e4da']); for (const dy of [-0.15, 0.15]) D.push([apBx(0.1, 0.14, 0.2, -69.76, 1.6 + dy, z), '#2a2a2e']); }
  apExting(P, -69.85, 2.6, -29.6, 1, 0);
  // two 5-seat beams under the windows (backs to the glass)
  for (const x0 of [-27, 13]) { S.push([apBx(11, 0.35, 0.9, x0 + 5.5, 1.9, -41.3), '#8a949e']); for (const x of [x0 + 0.6, x0 + 10.4]) S.push([apBx(0.3, 1.9, 1.1, x, 0.95, -41.3), '#8a949e']);
    for (let i = 0; i < 5; i++) { const c = i === 2 ? '#c8681c' : '#e07a22'; P.push([apRB(1.9, 0.35, 1.8, x0 + 1.1 + i * 2.2, 2.25, -41.1), c]); P.push([apRB(1.9, 2.0, 0.3, x0 + 1.1 + i * 2.2, 3.5, -42.05, 0, 0.12), c]); }
    S.push([apBx(0.3, 0.2, 1.4, x0 + 3.3, 3.1, -41.2), '#8a949e'], [apBx(0.3, 0.2, 1.4, x0 + 7.7, 3.1, -41.2), '#8a949e']); }
  apTrash(S, D, -11, -34); apTrash(S, D, 27.5, -40); apTrash(S, D, -38, 16);
  P.push([apRB(1.6, 3.0, 1.6, -40.5, 1.5, -30), '#2f6fb8']); D.push([apBx(0.9, 0.06, 0.3, -40.5, 3.02, -30), '#101014']);
  { const x = 7, z = -23, ry = 0.5; for (const s of [1, -1]) P.push([apBx(1.4, 2.6, 0.08, x + Math.sin(ry) * 0.32 * s, 1.27, z + Math.cos(ry) * 0.32 * s, ry, -0.25 * s), '#f2c21a']); D.push([apBx(0.5, 0.5, 0.02, x + Math.sin(ry) * 0.4, 1.6, z + Math.cos(ry) * 0.4, ry, -0.25), '#1a1a1e']); }
  // heater grille along the window wall
  { const t = apTexGrille(); t.repeat.set(70, 1); const m = pl(140, 1.6, c3Prop('#ffffff', { map: t, rough: 0.6, metal: 0.3 }), 0, 1.3, -44.92); m.userData.noCast = true; scene.add(m); }
  // carousel kick strip (black rubber at the floor)
  { const k = new THREE.Mesh(apRing(AP_RC + 1.74, AP_RC + 1.86, 0.35), c3Prop('#16161a', { rough: 0.85 })); scene.add(k); }
  scene.add(apMerge(P, { rough: 0.55 })); scene.add(apMerge(S, { rough: 0.32, metal: 0.55, map: AP.brushed })); scene.add(apMerge(D, { rough: 0.7 }));
  for (let i = 0; i < 4; i++) trolley(-21 + i * 1.7, -36.5, 0.02 * i); }
// ---- counter clutter (focus layer): phone, printer, letter tray, pen, tape dispenser
function apDeskClutter(F) { const P = [], x = AP_DX;
  P.push([apRB(0.9, 0.3, 1.0, x - 0.9, 4.91, -11.4), '#2a2a30'], [apRB(0.36, 0.3, 1.2, x - 1.2, 5.18, -11.4), '#222228'], [apBx(0.5, 0.04, 0.6, x - 0.75, 5.07, -11.4), '#4a4a52']);
  P.push([apRB(2.2, 1.1, 2.0, x - 0.1, 5.31, -25.0), '#d8d6d0'], [apBx(1.6, 0.06, 0.6, x - 0.1, 5.88, -25.3), '#2a2a30'], [apBx(1.5, 0.03, 1.0, x + 0.5, 5.05, -23.9, 0.05), '#f8f6f0']);
  P.push([apRB(1.3, 0.35, 1.7, x + 1.05, 4.94, -9.6), '#2a2a30'], [apBx(1.1, 0.12, 1.5, x + 1.05, 5.05, -9.6, 0.06), '#f6f1e4']);
  P.push([apCy(0.06, 0.06, 1.3, -60.4, 4.83, -23.2, 0, 0.3, Math.PI / 2, 8), '#1a3a9a']);
  P.push([apRB(0.7, 0.45, 0.4, x + 1.3, 4.99, -4.2), '#1a1a1e']);
  const m = apMerge(P, { rough: 0.45 }); m.userData.noCast = true; F.add(m); }
// ---- back room dressing: pipes, sprinkler line, conduit, electrical panel, vent, extinguisher, door frame + bollards, crate, pallet stack, boxes
function apDetailBack(scene) { const M = [], P = [], W = [];   // metal, painted, wood
  const gy = '#7e868e', rd = '#a8342a', cd = '#a8acb0', bk = '#2a2a30';
  apPipe(M, [[-121.4, 18.5, 39.5], [-121.4, 18.5, -43.4], [-70.8, 18.5, -43.4]], 0.35, gy); apPipe(M, [[-121.55, 20.4, 39.5], [-121.55, 20.4, -43.55], [-70.8, 20.4, -43.55]], 0.22, rd);
  apPipe(M, [[-121.4, 0.4, -39.8], [-121.4, 18.5, -39.8]], 0.3, gy); apPipe(M, [[-82, 0.4, -43.4], [-82, 18.5, -43.4]], 0.3, gy);
  for (let z = -36; z < 40; z += 9) M.push([apBx(0.7, 2.6, 0.18, -121.75, 19.4, z), bk]); for (let x = -114; x < -72; x += 9) M.push([apBx(0.18, 2.6, 0.7, x, 19.4, -43.75), bk]);
  M.push([apCy(0.5, 0.5, 0.1, -121.4, 0.05, -39.8, 0, 0, 0, 12), bk], [apCy(0.5, 0.5, 0.1, -82, 0.05, -43.4, 0, 0, 0, 12), bk]);
  for (const z of [-36.8, -26.8]) { M.push([apCy(0.08, 0.08, 23.4, -121.75, 12.5, z, 0, 0, 0, 6), cd]); M.push([apBx(0.35, 0.8, 0.6, -121.75, z < -30 ? 13 : 1.5, z), '#8a9096']); }
  M.push([apCy(0.08, 0.08, 23.4, -108, 12.5, -43.78, 0, 0, 0, 6), cd]);
  M.push([apRB(3.2, 4.6, 0.6, -76.5, 7.2, -43.65), '#8a9096'], [apBx(0.05, 4.2, 0.05, -76.5, 7.2, -43.33), bk], [apBx(0.3, 0.6, 0.12, -75.9, 7.2, -43.3), bk], [apCy(0.08, 0.08, 15, -76.5, 17, -43.78, 0, 0, 0, 6), cd]);
  M.push([apBx(3.4, 1.7, 0.12, -96, 22.2, -43.86), '#3a3e46']); for (let i = 0; i < 6; i++) M.push([apBx(3.1, 0.12, 0.18, -96, 21.6 + i * 0.25, -43.8, 0, 0.5), '#6a7078']);
  apExting(P, -85, 2.6, -44, 0, 1);
  // warehouse: roll-door frame + housing, bollards, a lamp over the door
  for (const z of [11.7, 26.3]) M.push([apBx(0.5, 13.4, 0.6, -121.7, 6.7, z), '#5a6068']); M.push([apRB(1.5, 1.7, 15.4, -121.2, 13.95, 19), '#6a7078']);
  for (const z of [10.6, 27.4]) { P.push([apCy(0.45, 0.45, 4.2, -120.2, 2.1, z, 0, 0, 0, 14), '#e8b82a']); P.push([apCy(0.47, 0.47, 0.4, -120.2, 3.0, z, 0, 0, 0, 14), '#1a1a1e']); }
  // a blue plastic crate on the dusty shelf's lower deck, a spare pallet stack
  P.push([apRB(2.4, 1.5, 2.6, AP_DUST[0], 1.13 + 0.75, AP_DUST[1] + 2.0), '#2f5a9a'], [apBx(1.8, 0.05, 2.0, AP_DUST[0], 2.64, AP_DUST[1] + 2.0), '#1e3e70']);
  for (let k = 0; k < 4; k++) apPalletParts(W, -110 + (k % 2) * 0.15, k * 0.93, 31, k === 2 ? '#a8845a' : '#c49a62');
  scene.add(apMerge(M, { rough: 0.45, metal: 0.45 })); scene.add(apMerge(P, { rough: 0.55 })); scene.add(apMerge(W, { rough: 0.85, map: AP.wood }));
  { const L = rbNC(2.2, 0.5, 0.9, c3Prop('#ffffff', { emissive: '#ffe6b0', ei: 1.3, glow: '#ffe6b0' }), -121.4, 15.4, 19, 0); scene.add(L); }
  // cardboard: two boxes inside the cage by the left shelf
  scene.add(apBoxes([[2.6, 2.0, 2.4, -101.4, 1.0, -31.6, 0.1, '#ffffff'], [2.0, 1.6, 2.0, -101.2, 2.8, -31.5, -0.2, '#e8dcc8']])); }

// ---- v4 lighting pass (Ricks): the sun comes in through the tall windows (raking key + soft VSM shadows of the
// mullions on the floor), the hall interior falls off into darker tones, practicals pool light; the back room is lit
// only by its lamps. AP_SUN = direction TOWARD the sun (from outside the windows, -z). apRender swaps it into C3_SHADOW.
const AP_SUN = [0.36, 0.46, -0.81];   // v5: a lower, golden late-afternoon sun (longer shafts)
const AP_PRACT = [[-30, 30, -2, '#ffd6a0', 0.28, 60], [28, 30, -2, '#ffd6a0', 0.28, 60], [0, 30, 26, '#ffd6a0', 0.3, 60],
  [-40, 12, -39, '#dcecff', 0.5, 50], [0, 12, -39, '#dcecff', 0.5, 50], [40, 12, -39, '#dcecff', 0.5, 50], [-63, 20, -13, '#ffe6c0', 0.45, 34],
  [-96, 14, -36, '#ffcf8a', 1.6, 34], [-96, 21, 6, '#fff0d0', 0.45, 26], [-110, 20, 20, '#ffe0b0', 0.65, 30], [-84, 21, 22, '#fff0d0', 0.3, 24]];
// characters + focus props only: a soft frontal fill + ambient (the set's ambient is low, the key is a backlight here)
function apFocusFill(scene) { const a = new THREE.AmbientLight('#fff4ea', 0.24), d = new THREE.DirectionalLight('#fff2e2', 0.62); d.position.set(10, 30, 60); c3Layer(a, C3.L_FOCUS); c3Layer(d, C3.L_FOCUS); scene.add(a, d); }
// hidden shadow casters that close the building (walls/ceilings are planes > 120, which the shadow pass skips): the sun
// only reaches the floor through the glass; the back room stays in the shade of its own walls and ceiling
function apShell(scene) { const M = c3Prop('#20283a', { rough: 0.9 }), cx = (AP_BX0 + AP_BX1) / 2;
  const B = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M); m.position.set(x, y, z); Object.assign(m.userData, { c3catch: true, noInk2: true, noShade: true }); scene.add(m); };
  for (const hx of [-AP_HX / 2, AP_HX / 2]) { B(AP_HX, 3, 0.4, hx, 1.5, -AP_HZ - 0.5); B(AP_HX, 10.4, 0.4, hx, 36.2, -AP_HZ - 0.5); for (const hz of [-AP_HZ / 2, AP_HZ / 2]) B(AP_HX, 0.4, AP_HZ + 2, hx, AP_HH + 0.4, hz); }
  B(0.4, AP_HH, 2 * AP_HZ, AP_HX + 0.4, AP_HH / 2, 0); B(0.3, AP_HH, 2 * AP_HZ, -AP_HX - 0.2, AP_HH / 2, 0);
  for (const z of [-23, 19]) B(AP_BX1 - AP_BX0, 0.4, 42, cx, AP_BH + 0.4, z); B(AP_BX1 - AP_BX0, AP_BH, 0.4, cx, AP_BH / 2, AP_BZ0 - 0.4); }
// the view out of the windows: blue sky with clouds, more planes, a control tower, terminal buildings, trees + hills
function apFar(OUT, J) { const scene = OUT.parent, hor = '#e8b892', fade = (c, k) => '#' + new THREE.Color(c).lerp(new THREE.Color(hor), k).getHexString();
  c3SkyDome(scene, { r: 820, paint: true, zenith: '#3a58b8', mid: '#8e8ccc', midH: 0.17, horizon: '#f4b47c', glow: '#ffb468', glowK: 0.65, ground: '#a07a68', sun: AP_SUN, clouds: 40, seed: 7, cloudLit: '#fff0dc', cloudShade: '#9a8cc4' });   // v5: golden-hour sky (ref 3: blue-violet top -> peach horizon)
  c3Backdrop(OUT, { origin: [0, -0.6, -AP_HZ], dir: [0, -1], width: 420, near: 90, far: 560, rows: 3, horizon: hor, ground: '#7f9a5c', lot: false, cars: 0, seed: 5 });
  const J2 = J.clone(); J2.position.set(-78, 7, -178); J2.rotation.y = 0.35; OUT.add(J2); const J3 = J.clone(); J3.position.set(120, 7, -235); J3.rotation.y = -2.6; OUT.add(J3);
  const tw = fade('#d8d4cc', 0.3); OUT.add(cyl(2.6, 3.4, 44, c3Prop(tw), -132, 22, -250, 0, 16)); OUT.add(cyl(7.5, 5.5, 6, c3Prop(fade('#3a5a7a', 0.3), { metal: 0.4, rough: 0.2 }), -132, 47, -250, 0, 16)); OUT.add(cyl(8, 8, 1, c3Prop(tw), -132, 50.5, -250, 0, 16));
  const term = c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = fade('#c8ccd2', 0.35); g.fillRect(0, 0, w, h); g.fillStyle = fade('#3a5a78', 0.35); g.fillRect(0, h * 0.3, w, h * 0.35); g.fillStyle = fade('#e8eef4', 0.35); for (let x = 0; x < w; x += 24) g.fillRect(x, h * 0.3, 3, h * 0.35); g.fillStyle = fade('#f08a2a', 0.35); g.fillRect(0, h * 0.8, w, h * 0.06); }, 1024, 128), rough: 0.8 });
  for (const [x, z, w] of [[30, -290, 200], [-150, -320, 120]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 16, 24), term); m.position.set(x, 8, z); OUT.add(m); }
  { const m = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 70, 24, 1, false, 0, Math.PI), c3Prop(fade('#a8b0b8', 0.35), { metal: 0.3 })); m.rotation.set(0, 0, Math.PI / 2); m.rotation.order = 'ZYX'; m.position.set(-40, 0, -255); OUT.add(m); }
  scene.updateMatrixWorld(true);
  OUT.traverse((m) => { if (!m.isMesh) return; m.userData.noCast = true; m.material = Array.isArray(m.material) ? m.material.map((x) => { const c = x.clone(); c.fog = false; if (c.color) c.color.multiplyScalar(0.62); return c; }) : (() => { const c = m.material.clone(); c.fog = false; if (c.color) c.color.multiplyScalar(0.62); return c; })(); }); }
// depth-only stand-ins of the carousel on the FOCUS layer: the characters are drawn after the set, so without these the
// belt never hides a person standing behind it (he read as standing on the island)
function apOccluders(scene) { const M = new THREE.MeshBasicMaterial({ colorWrite: false }), L = [];
  L.push(new THREE.Mesh(apRing(AP_RC - 1.75, AP_RC + 1.86, 2.4), M));
  { const pts = []; for (let i = 0; i < 120; i++) { const p = apPath(i / 120 * AP_L, -1.72); pts.push(V3(p.x, 2.62, p.z)); } L.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 240, 0.27, 8, true), M)); }
  { const h = new THREE.Mesh(new THREE.BoxGeometry(6, 8.4, 7.8), M); h.position.set(-6, 4.2, -6.5); L.push(h); const c = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.6, 8.4), M); c.position.set(-6, 8.6, -6.5); L.push(c); }
  for (const m of L) { Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); scene.add(m); } }

function apBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 900), s = { scene, cam, p: {} };
  lights(scene, { amb: '#7076c0', ambI: 0.24, sky: '#8e96e2', ground: '#b4744e', key: '#ffc47c', keyI: 2.7, keyP: AP_SUN.map((v) => v * 80), rim: '#ff9a5c', rimI: 0.3, rimP: [40, 30, -40] });   // v5: golden key, blue-violet fill
  apFocusFill(scene); scene.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.42; });
  AP.mHandle = c3Prop('#2a2224', { rough: 0.5 }); AP.card = apTexCard(); AP.brushed = apTexBrushed(); AP.wood = texWood();
  const steel = c3Prop('#9aa6b2', { metal: 0.5, rough: 0.35 }), dark = c3Prop('#2a2a32', { rough: 0.6 }), orange = c3Prop('#f08a2a', { rough: 0.45 }), navy = c3Prop('#1f3f7a', { rough: 0.5 }), white = c3Prop('#f2efe8', { rough: 0.6 }), black = c3Prop('#16161c', { rough: 0.8 });
  const wallM = (rep, map = apTexHall) => c3Prop('#ffffff', { map: (() => { const t = map(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  // ---------------- HALL shell
  scene.add(pl(2 * AP_HX, 2 * AP_HZ, c3Prop('#ffffff', { map: apTexFloor(), rough: 0.24, env: 1.0 }), 0, 0, 0, 0, -Math.PI / 2));
  scene.add(plNC(2 * AP_HX, AP_HH, c3Flat('#ffffff', { map: apTexCeil() }), 0, AP_HH, 0, 0, Math.PI / 2));
  scene.add(plNC(2 * AP_HZ, AP_HH, wallM(6), -AP_HX, AP_HH / 2, 0, Math.PI / 2)); scene.add(plNC(2 * AP_HZ, AP_HH, wallM(6), AP_HX, AP_HH / 2, 0, -Math.PI / 2));
  scene.add(plNC(2 * AP_HX, AP_HH, wallM(9), 0, AP_HH / 2, AP_HZ, Math.PI));
  // back wall = tall windows on the tarmac: a low wall, mullions, a transom, the upper band
  { const wm = c3Prop('#1f3f7a', { rough: 0.5 }); scene.add(plNC(2 * AP_HX, 3, wm, 0, 1.5, -AP_HZ)); scene.add(plNC(2 * AP_HX, 9, wallM(9), 0, 35.5, -AP_HZ));
    for (const hx of [-AP_HX / 2, AP_HX / 2]) { scene.add(rb(AP_HX, 0.8, 1.2, c3Prop('#e8eef4', { metal: 0.3 }), hx, 3.1, -AP_HZ + 0.4, 0)); scene.add(rb(AP_HX, 0.8, 1.2, c3Prop('#e8eef4', { metal: 0.3 }), hx, 30.8, -AP_HZ + 0.4, 0)); scene.add(rb(AP_HX, 0.5, 0.8, c3Prop('#e8eef4', { metal: 0.3 }), hx, 17, -AP_HZ + 0.4, 0)); }
    for (let x = -AP_HX; x <= AP_HX; x += 10) scene.add(rb(0.9, 28, 1.2, c3Prop('#e8eef4', { metal: 0.3 }), x, 17, -AP_HZ + 0.4, 0));
    apShell(scene);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2 * AP_HX, 28), new THREE.MeshBasicMaterial({ color: '#ffffff', map: apTexGlass(), transparent: true, depthWrite: false })); glass.position.set(0, 17, -AP_HZ - 0.1); glass.userData.noInk2 = true; scene.add(glass); }
  // outside: tarmac, sky, a parked jet with a jet bridge, a baggage tug
  const OUT = new THREE.Group(); scene.add(OUT);
  { OUT.add(pl(420, 220, c3Prop('#ffffff', { map: apTexTarmac(), rough: 0.9 }), 0, -0.3, -AP_HZ - 110, 0, -Math.PI / 2));
    const J = new THREE.Group(); J.position.set(14, 7, -100); OUT.add(J); const wt = c3Prop('#f6f6f2', { rough: 0.35 }), bl = c3Prop('#1f3f7a', { rough: 0.4 });
    const fu = cyl(4.2, 4.2, 46, wt, 0, 0, 0, 0.05, 20); fu.rotation.z = Math.PI / 2; J.add(fu); const no = c3Mesh(new THREE.SphereGeometry(4.2, 18, 12), wt, 0.05); no.scale.set(1.7, 1, 1); no.position.x = 23; J.add(no);
    const tc = cyl(4.2, 1.0, 12, wt, -29, 0.8, 0, 0.05, 18); tc.rotation.z = -Math.PI / 2; J.add(tc); J.add(rb(9, 10, 0.8, bl, -31, 8, 0, 0.05)); J.add(rb(12, 0.8, 52, wt, -2, -2.2, 0, 0.05));
    for (const z of [-11, 11]) { const e = cyl(1.8, 1.8, 6, c3Prop('#c8ccd4', { metal: 0.4 }), 0, -4.6, z, 0.04, 14); e.rotation.z = Math.PI / 2; J.add(e); }
    J.add(pl(34, 1.4, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3a5a'; for (let i = 0; i < 30; i++) { g.beginPath(); g.roundRect(i * w / 30 + 6, h * 0.25, w / 30 - 14, h * 0.5, 6); g.fill(); } }, 1024, 64) }), 2, 1.2, 4.25));
    J.add(pl(40, 1.2, c3Flat('#f08a2a'), 0, -1.0, 4.22)); J.add(pl(9, 2.4, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#1f3f7a'; g.fillRect(0, 0, w, h); apLogo(g, w * 0.16, h * 0.5, 1.1, '#ffd27a'); inked(g, 'SKYDOVE', w * 0.6, h * 0.5, h * 0.5, '#ffffff', { stroke: false }); }, 512, 128) }), 6, 2.4, 4.3));
    OUT.add(rb(8, 6, 40, c3Prop('#c8ccd4', { metal: 0.3 }), -14, 9, -68, 0.04)); OUT.add(cyl(0.6, 0.6, 6, steel, -14, 3, -82, 0.02, 8));
    OUT.add(rb(6, 3.2, 4, c3Prop('#f2c23a'), 30, 1.6, -64, 0.04)); for (let i = 0; i < 3; i++) OUT.add(rb(5, 3, 4, c3Prop(['#3a8ac8', '#e8402e', '#3f9a5a'][i]), 37 + i * 6.4, 1.5, -64, 0.04));
    for (const [x, z] of [[-30, -60], [-24, -58], [44, -76]]) OUT.add(cyl(0.2, 0.9, 2.2, orange, x, 1.1, z, 0.02, 10));
    apFar(OUT, J); }
  // columns with ad wraps, ceiling ducts
  { const ad = c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#1d8c9c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f08a2a'; g.fillRect(0, h * 0.5, w, h * 0.16); g.fillStyle = '#1f3f7a'; g.fillRect(0, h * 0.85, w, h * 0.15); inked(g, 'CLAIM 4', w / 4, h * 0.58, h * 0.08, '#ffffff', { stroke: false }); inked(g, 'CLAIM 4', w * 0.75, h * 0.58, h * 0.08, '#ffffff', { stroke: false }); }, 512, 512), rough: 0.6 });
    for (const [x, z] of [[-34, -22], [34, -22], [-34, 20], [34, 20]]) { scene.add(cyl(2.2, 2.2, AP_HH, ad, x, AP_HH / 2, z, 0.03, 20)); scene.add(cyl(2.8, 2.8, 0.8, navy, x, 0.4, z, 0.02, 20)); }
    for (const z of [-26, 0, 26]) scene.add(rbNC(2 * AP_HX - 4, 2.2, 2.2, c3Prop('#c8d4dc', { metal: 0.4 }), 0, AP_HH - 2.4, z, 0)); }
  // the BAGGAGE CLAIM 4 sign hanging over the carousel + the flight info screen
  { const g = new THREE.Group(); g.position.set(0, 21, 1); scene.add(g); g.add(rb(16.6, 5.4, 0.6, navy, 0, 0, 0, 0.03)); g.add(pl(16, 5, c3Flat('#ffffff', { map: apTexClaim(), glow: '#ffffff' }), 0, 0, 0.32));
    for (const x of [-6, 6]) g.add(cyl(0.1, 0.1, AP_HH - 21 - 2.7, steel, x, (AP_HH - 21) / 2 + 1.35, 0, 0, 6)); s.claim = g; }
  { const g = new THREE.Group(); g.position.set(17, 0, -14); scene.add(g); g.add(cyl(0.35, 0.35, 11, steel, 0, 5.5, 0, 0.02, 10)); g.add(cyl(1.6, 1.6, 0.4, steel, 0, 0.2, 0, 0.02, 14));
    g.add(rb(7.6, 4.6, 0.6, dark, 0, 13, 0, 0.03)); g.add(pl(7.0, 3.96, c3Flat('#ffffff', { map: apTexFids(), glow: '#ffffff' }), 0, 13, 0.32)); }
  // floor markings: the yellow keep-back line around the carousel, a painted 4, arrows
  { const y = c3Flat('#f2c23a'); const ring = new THREE.Mesh(apRing(AP_RC + 3.4, AP_RC + 3.8, 0), y); ring.position.y = 0.03; ring.userData.noInk2 = true; scene.add(ring);
    const f4 = pl(5, 5, c3Flat('#ffffff', { map: tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#f2c23a'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 8, 0, TAU); g.fill(); inked(g, '4', w / 2, h * 0.53, h * 0.66, '#1f3f7a', { stroke: false }); }, 256, 256), transparent: true }), -16, 0.04, 14, 0, -Math.PI / 2); f4.userData.noInk2 = true; scene.add(f4);
    const ar = tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(w * 0.5, 4); g.lineTo(w - 4, h * 0.5); g.lineTo(w * 0.68, h * 0.5); g.lineTo(w * 0.68, h - 4); g.lineTo(w * 0.32, h - 4); g.lineTo(w * 0.32, h * 0.5); g.lineTo(4, h * 0.5); g.closePath(); g.fill(); }, 128, 128);
    for (const [x, z, r] of [[-40, 10, 0.6], [40, 12, -0.5], [-48, -6, 1.57]]) { const a = pl(3.6, 3.6, c3Flat('#ffffff', { map: ar, transparent: true }), x, 0.04, z); a.rotation.order = 'YXZ'; a.rotation.set(-Math.PI / 2, r, 0); a.userData.noInk2 = true; scene.add(a); } }
  // seat rows (orange) on the near side, trolleys, bins, a plant, posters on the right wall
  { const seat = c3Prop('#f08a2a', { rough: 0.5 }), sg = c3RBox(1.9, 0.4, 1.9, 0.12), bg = c3RBox(1.9, 2.0, 0.3, 0.1);
    for (const [x0, z, ry] of [[-26, 30, 0], [6, 30, 0], [-26, 36, Math.PI], [6, 36, Math.PI]]) { const g = new THREE.Group(); g.position.set(x0, 0, z); g.rotation.y = ry; scene.add(g); g.add(rb(15.6, 0.4, 1.2, steel, 7.8, 1.9, 0, 0));
      for (let i = 0; i < 7; i++) { const a = c3Mesh(sg, seat, 0); a.position.set(1.1 + i * 2.2, 2.3, 0.1); g.add(a); const b = c3Mesh(bg, seat, 0); b.position.set(1.1 + i * 2.2, 3.6, -0.85); b.rotation.x = -0.12; g.add(b); }
      for (const x of [1.2, 14.4]) g.add(rb(0.3, 1.9, 1.0, steel, x, 0.95, 0, 0)); } }
  const trolley = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); g.add(rb(2.6, 0.2, 4.4, steel, 0, 1.0, 0, 0)); g.add(rb(2.4, 0.15, 3.0, c3Prop('#c8ccd2', { metal: 0.4 }), 0, 2.4, 0.4, 0));
    const fr = rb(0.12, 4.2, 0.12, steel, 0, 2.6, -2.1, 0); g.add(fr); g.add(rb(2.6, 0.24, 0.24, orange, 0, 4.8, -2.1, 0)); g.add(rb(2.6, 3.0, 0.1, steel, 0, 2.6, -2.0, 0)); return g; };
  trolley(28, 16, 0.4); trolley(30.4, 16.6, 0.4); trolley(-24, -14, -0.3); trolley(24, -18, 2.6); apDetailHall(scene, trolley);
  for (const [x, z] of [[-30, 25], [26, 25]]) { scene.add(cyl(0.9, 0.8, 3, c3Prop('#3a8a5a'), x, 1.5, z, 0.02, 12)); scene.add(cyl(0.95, 0.95, 0.3, dark, x, 3.1, z, 0.01, 12)); }
  { const g = new THREE.Group(); g.position.set(40, 0, -34); scene.add(g); g.add(cyl(1.4, 1.1, 2.6, c3Prop('#f2efe6'), 0, 1.3, 0, 0.02, 14));
    for (let i = 0; i < 9; i++) { const a = i * 2.4, lf = c3Mesh(new THREE.SphereGeometry(1.2, 10, 6), c3Prop(i % 2 ? '#4f9a44' : '#3f8a3a', { rough: 0.8 }), 0.01); lf.scale.set(0.45, 2.0, 0.16); lf.position.set(Math.sin(a) * 1.1, 4.4 + (i % 3) * 0.8, Math.cos(a) * 1.1); lf.rotation.set(0.5 * Math.cos(a), a, -0.5 * Math.sin(a)); g.add(lf); } }
  for (let i = 0; i < 3; i++) scene.add(pl(6, 9, c3Flat('#ffffff', { map: apTexPoster(i) }), AP_HX - 0.15, 12, -24 + i * 14, -Math.PI / 2));
  scene.add(pl(6, 9, c3Flat('#ffffff', { map: apTexPoster(1) }), -AP_HX + 0.15, 10, -30, Math.PI / 2));
  { const c = c3Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 28), [navy, c3Flat('#ffffff', { map: texClock() }), navy], 0.02); c.rotation.z = -Math.PI / 2; c.position.set(-AP_HX + 0.2, 16, -2); scene.add(c); }
  scene.add(pl(5, 1.6, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#2f9a4a'; g.fillRect(0, 0, w, h); inked(g, 'EXIT →', w / 2, h / 2, h * 0.6, '#ffffff', { stroke: false }); }, 512, 160), glow: '#ffffff' }), 50, 22, AP_HZ - 0.15, Math.PI));
  // ---------------- CAROUSEL #4
  { const skirt = c3Mesh(apRing(AP_RC - 1.7, AP_RC + 1.75, 2.2), c3Prop('#6a7888', { metal: 0.5, rough: 0.32, map: (() => { const t = apTexBrushed(); t.repeat.set(0.1, 0.45); return t; })() }), 0.03); scene.add(skirt);
    const band = c3Mesh(apRing(AP_RC + 1.7, AP_RC + 1.82, 0.5), orange, 0); band.position.y = 0.6; scene.add(band);
    const isl = c3Mesh((() => { const g = new THREE.ExtrudeGeometry(apStadium(AP_RC - 2.4), { depth: 1.0, bevelEnabled: true, bevelSize: 0.7, bevelThickness: 0.5, bevelSegments: 2, curveSegments: 24 }); g.rotateX(-Math.PI / 2); g.translate(0, 1.4, 0); return g; })(), c3Prop('#66788c', { metal: 0.5, rough: 0.35, map: (() => { const t = apTexBrushed(); t.repeat.set(0.08, 0.08); return t; })() }), 0.03); scene.add(isl);
    const pts = []; for (let i = 0; i < 120; i++) { const p = apPath(i / 120 * AP_L, -1.72); pts.push(V3(p.x, 2.62, p.z)); }
    scene.add(c3Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 240, 0.26, 8, true), black, 0.02));
    // the feeder housing over the back straight (x -9..-3): orange with hazard stripes, the black mouth, a big 4, the chute to the ceiling
    const hm = c3Prop('#ffffff', { map: apTexHousing(), rough: 0.5 }); const H = rb(6, 8.4, 7.8, hm, -6, 4.2, -6.5, 0.04); scene.add(H);
    scene.add(rb(6.6, 0.6, 8.4, navy, -6, 8.6, -6.5, 0.03)); const ch = rb(3.6, 34, 3.6, c3Prop('#3a5a7a', { metal: 0.4 }), -6, 24, -16, 0.03); ch.rotation.x = -0.55; scene.add(ch);
    const mouth = pl(3.9, 3.4, c3Flat('#0a0a0e'), AP_MX + 0.02, 3.95, -6.5, Math.PI / 2); scene.add(mouth); const mouthB = pl(3.9, 3.4, c3Flat('#0a0a0e'), -9.02, 3.95, -6.5, -Math.PI / 2); scene.add(mouthB);
    scene.add(rb(0.4, 0.5, 4.6, steel, AP_MX + 0.2, 5.85, -6.5, 0.02));
    for (const sx of [1, -1]) { const f = pl(2.6, 2.6, c3Flat('#ffffff', { map: apTexFour() }), -6, 6.4, -6.5 + sx * 3.92, sx > 0 ? 0 : Math.PI); scene.add(f); }
    const fp = pl(2.4, 2.4, c3Flat('#ffffff', { map: apTexFour() }), AP_MX + 0.03, 7.1, -6.5, Math.PI / 2); scene.add(fp); }
  // the flap curtain (8 black rubber strips hinged at the top of the mouth) + 4 static strips on the entry side
  { const fm = c3Prop('#1c1c22', { rough: 0.7 }), fg = new THREE.BoxGeometry(0.06, 3.2, 0.46); s.flaps = [];
    for (let j = 0; j < 8; j++) { const pv = new THREE.Group(), z = -6.5 - 1.75 + j * 0.5; pv.position.set(AP_MX + 0.1, 5.6, z); const m = c3Mesh(fg, fm, 0.01); m.position.y = -1.6; pv.add(m); scene.add(pv); pv.userData.z = z; s.flaps.push(pv); }
    for (let j = 0; j < 8; j++) { const m = c3Mesh(fg, fm, 0); m.position.set(-9.1, 4.0, -6.5 - 1.75 + j * 0.5); scene.add(m); } }
  // ---------------- BAGGAGE SERVICES counter (left wall)
  scene.add(pl(22, 4.6, c3Flat('#ffffff', { map: apTexServices(), glow: '#ffffff' }), -AP_HX + 0.2, 17, -13, Math.PI / 2));
  scene.add(pl(5.4, 2.8, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); apLogo(g, w * 0.22, h * 0.5, 1.6, '#1f3f7a'); inked(g, 'SKYDOVE', w * 0.64, h * 0.5, h * 0.3, '#1f3f7a', { stroke: false }); g.lineWidth = 12; g.strokeStyle = '#f08a2a'; g.strokeRect(0, 0, w, h); }, 512, 256) }), -AP_HX + 0.2, 10.6, -9.6, Math.PI / 2));
  scene.add(pl(3.6, 6.6, c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#e8e2d4'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f3f7a'; g.fillRect(0, 0, w, h * 0.16); inked(g, 'STAFF ONLY', w / 2, h * 0.08, h * 0.07, '#ffffff', { stroke: false, maxW: w * 0.86 }); g.fillStyle = '#9aa4ae'; g.fillRect(w * 0.8, h * 0.52, 18, 30); g.lineWidth = 10; g.strokeStyle = '#2a2a32'; g.strokeRect(0, 0, w, h); }, 256, 460) }), -AP_HX + 0.2, 3.3, -24.5, Math.PI / 2));
  for (let i = 0; i < 2; i++) scene.add(pl(3, 4.4, c3Flat('#ffffff', { map: apTexPoster(i * 2) }), -AP_HX + 0.2, 9.6, -2 - i * 0.1 + 6 * i, Math.PI / 2));
  s.cal3 = apCalendar(scene, -AP_HX + 0.25, 12.2, -16.2, Math.PI / 2, 3.2, 4.0); redraw(s.cal3.base, 'bMARCH', (g, w, h) => apMonthDraw(g, w, h, 'MARCH', '2025'));
  { const F = new THREE.Group(); scene.add(F); s.desk = F; const z0 = -13;
    F.add(rb(3.2, 4.4, 16, c3Prop('#1f4f9a', { rough: 0.5 }), AP_DX, 2.2, z0, 0.03)); F.add(rb(3.9, 0.36, 16.6, c3Prop('#5e574d', { rough: 0.7, env: 0.4 }), AP_DX, 4.58, z0, 0.02));
    F.add(pl(15.6, 3.6, c3Flat('#ffffff', { map: (() => { const t = apTexDeskFront(); return t; })() }), AP_DX + 1.62, 2.1, z0, Math.PI / 2));
    const mon = new THREE.Group(); mon.position.set(AP_DX - 0.6, 4.76, -10.6); mon.rotation.y = Math.PI / 2 + 0.35; F.add(mon); mon.add(rb(0.9, 0.12, 0.7, dark, 0, 0.06, 0, 0.01)); mon.add(rb(0.2, 1.2, 0.2, dark, 0, 0.7, -0.1, 0)); mon.add(rb(3.2, 2.1, 0.22, c3Prop('#3a3a44'), 0, 2.2, 0, 0.02));
    mon.add(pl(2.9, 1.8, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#1f3f7a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; for (let k = 0; k < 6; k++) g.fillRect(w * 0.08, h * (0.2 + k * 0.12), w * (0.4 + 0.3 * (k % 2)), 8); g.fillStyle = '#f08a2a'; g.fillRect(w * 0.7, h * 0.2, w * 0.22, h * 0.2); }, 256, 160), glow: '#9ac8ff' }), 0, 2.2, -0.12, Math.PI));
    F.add(rb(2.4, 0.14, 0.9, c3Prop('#e8e8ec'), AP_DX - 1.1, 4.82, -12.4, 0.01));
    for (let i = 0; i < 4; i++) F.add(rb(2.4, 0.08, 3.0, c3Prop(['#fbf6ea', '#f6efe0', '#fff8e8', '#efe6d4'][i]), AP_DX + 0.2 + (i % 2) * 0.1, 4.8 + i * 0.09, -7.6, 0.005));
    F.add(mug('#f08a2a', AP_DX - 0.8, 4.76, -8.6)); F.add(cyl(0.3, 0.36, 0.5, c3Prop('#c8c4bc', { metal: 0.6 }), AP_DX + 0.8, 5.0, -6.2, 0.01, 10));
    for (let i = 0; i < 3; i++) F.add(rb(0.9, 0.06, 1.2, c3Prop(['#f2c23a', '#e8402e', '#3a8ac8'][i]), AP_DX + 0.4, 4.8 + i * 0.07, -11.6 + i * 0.3, 0));
    s.rep = canvasTex(480, 640); s.repM = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.6), new THREE.MeshLambertMaterial({ map: s.rep.t, color: '#c4beb2' })); s.repM.rotation.order = 'YXZ'; s.repM.rotation.set(-Math.PI / 2, 0.06, 0); s.repM.position.set(...AP_REP); F.add(s.repM);
    redraw(s.rep, 'r0', (g, w, h) => apReportDraw(g, w, h, false));
    s.stamp = new THREE.Group(); s.stamp.add(cyl(0.5, 0.55, 0.4, c3Prop('#2a2a30'), 0, 0.2, 0, 0.01, 12)); s.stamp.add(cyl(0.16, 0.2, 1.1, c3Prop('#8a5428'), 0, 0.95, 0, 0.01, 8)); const kn = c3Mesh(new THREE.SphereGeometry(0.36, 10, 8), c3Prop('#d8282a'), 0.01); kn.position.y = 1.65; s.stamp.add(kn); F.add(s.stamp);
    F.add(cyl(0.7, 0.7, 0.16, c3Prop('#2a2a30'), AP_DX + 0.9, 4.84, -5.2, 0.01, 14));
    apDeskClutter(F); c3Layer(F, C3.L_FOCUS); }
  // queue stanchions in front of the desk
  for (let i = 0; i < 4; i++) { const z = -20 + i * 4; scene.add(cyl(0.18, 0.18, 3.4, steel, -50, 1.7, z, 0.01, 8)); scene.add(cyl(0.7, 0.7, 0.2, steel, -50, 0.1, z, 0.01, 10)); if (i) scene.add(rb(0.08, 0.5, 3.8, navy, -50, 3.0, z - 2, 0)); }
  // ---------------- BACK ROOM (behind the left wall)
  { const bw = (rep) => c3Prop('#ffffff', { map: (() => { const t = apTexBackWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 }), cx = (AP_BX0 + AP_BX1) / 2, cz = (AP_BZ0 + AP_BZ1) / 2, lx = AP_BX1 - AP_BX0, lz = AP_BZ1 - AP_BZ0;
    scene.add(pl(lx, lz, c3Prop('#ffffff', { map: apTexConcrete(), rough: 0.7 }), cx, 0.01, cz, 0, -Math.PI / 2)); scene.add(plNC(lx, lz, c3Prop('#3a3e46', { rough: 0.9 }), cx, AP_BH, cz, 0, Math.PI / 2));
    scene.add(plNC(lz, AP_BH, bw(6), AP_BX0, AP_BH / 2, cz, Math.PI / 2)); scene.add(plNC(lz, AP_BH, bw(6), AP_BX1, AP_BH / 2, cz, -Math.PI / 2));
    scene.add(plNC(lx, AP_BH, bw(4), cx, AP_BH / 2, AP_BZ0)); scene.add(plNC(lx, AP_BH, bw(4), cx, AP_BH / 2, AP_BZ1, Math.PI));
    for (const [x, z] of [[-96, -20], [-96, 6], [-110, 22], [-84, 22], [-112, -32]]) scene.add(rbNC(0.6, 0.3, 7, c3Prop('#ffffff', { emissive: '#fff4dc', ei: 1.1, glow: '#fff4dc' }), x, AP_BH - 0.4, z, 0));
    const hz = pl(30, 1.2, c3Flat('#ffffff', { map: tex((g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = '#1a1a22'; g.fillRect(x, 0, 16, h); g.fillStyle = '#f2c23a'; g.fillRect(x + 16, 0, 16, h); } }, 512, 32) }), -96, 0.03, -24, 0, -Math.PI / 2); hz.userData.noInk2 = true; scene.add(hz); }
  // the LOST & FOUND cage: yellow posts and rails, chain-link panels (front with an open door), shelves of unclaimed bags, one lamp
  { const [x0, x1, z0, z1] = AP_CAGE, ch = 13, post = c3Prop('#e8b830', { metal: 0.3, rough: 0.4 });
    const chain = (w) => { const t = apTexChain(); t.repeat.set(w / 1.6, ch / 1.6); const m = new THREE.MeshStandardMaterial({ map: t, transparent: false, alphaTest: 0.5, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.4 }); return m; };
    for (const [x, z] of [[x0, z1], [x1, z1], [x0, z0], [x1, z0], [x0 + 6, z1], [x0 + 10, z1], [x0, (z0 + z1) / 2], [x1, (z0 + z1) / 2]]) scene.add(cyl(0.2, 0.2, ch, post, x, ch / 2, z, 0.01, 8));
    scene.add(rb(x1 - x0, 0.3, 0.3, post, (x0 + x1) / 2, ch, z1, 0)); scene.add(rb(0.3, 0.3, z1 - z0, post, x0, ch, (z0 + z1) / 2, 0)); scene.add(rb(0.3, 0.3, z1 - z0, post, x1, ch, (z0 + z1) / 2, 0));
    const P = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, ch), chain(w)); m.position.set(x, ch / 2, z); m.rotation.y = ry; m.userData.noInk2 = true; scene.add(m); return m; };
    P(6, x0 + 3, z1, 0); P(x1 - x0 - 10, x0 + 10 + (x1 - x0 - 10) / 2, z1, 0); P(z1 - z0, x0, (z0 + z1) / 2, Math.PI / 2); P(z1 - z0, x1, (z0 + z1) / 2, Math.PI / 2);
    const door = new THREE.Group(); door.position.set(x0 + 10, 0, z1); door.rotation.y = 1.9; scene.add(door); { const m = new THREE.Mesh(new THREE.PlaneGeometry(4, ch - 1), chain(4)); m.position.set(-2, (ch - 1) / 2, 0); m.userData.noInk2 = true; door.add(m); door.add(rb(4, 0.2, 0.2, post, -2, ch - 1, 0, 0)); door.add(rb(0.2, ch - 1, 0.2, post, -4, (ch - 1) / 2, 0, 0)); }
    scene.add(pl(4.4, 1.1, c3Flat('#ffffff', { map: apTexLF() }), -95.6, 10.4, z1 + 0.12));
    // shelves along the back wall of the cage with unclaimed bags
    const R = RNG('cage'), cols = ['#c8402e', '#3f8a5a', '#8a5a2c', '#2a2a32', '#7a4aa8', '#e8a03a', '#3a6aa8', '#a83a5a'];
    for (const sx of [x0 + 4, x1 - 4]) { const g = new THREE.Group(); g.position.set(sx, 0, z0 + 2); scene.add(g); for (const px of [-3.6, 3.6]) for (const pz of [-1.4, 1.4]) g.add(rb(0.25, 11, 0.25, steel, px, 5.5, pz, 0));
      for (let k = 0; k < 3; k++) { g.add(rb(7.6, 0.2, 3.2, steel, 0, 0.6 + k * 3.8, 0, 0)); for (let b = 0; b < 2; b++) { const c = cols[Math.floor(R.f() * cols.length)], w = R.r(2.6, 3.3), h = R.r(1.6, 2.6);
        const m = rb(w, h, 2.2, c3Prop(c, { rough: 0.6 }), -1.8 + b * 3.6, 0.7 + k * 3.8 + h / 2, 0, 0.015); g.add(m); g.add(rb(0.14, h + 0.04, 2.24, c3Prop(t3Mul(c, 0.7)), -1.8 + b * 3.6 + w * 0.22, 0.7 + k * 3.8 + h / 2, 0, 0)); } } }
    const [lx, lz] = AP_LAMP; scene.add(rb(4.6, 2.4, 3.4, c3Prop('#b8844a', { rough: 0.8 }), lx + 0.4, 1.2, lz + 0.6, 0.02)); scene.add(cyl(0.05, 0.05, AP_BH - 15, dark, lx, (AP_BH + 15) / 2, lz, 0, 6));
    const sh = c3Mesh(new THREE.CylinderGeometry(0.5, 1.8, 1.4, 18, 1, true), (() => { const m = c3Prop('#2f6a4a', { rough: 0.5 }); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.set(lx, 14.3, lz); sh.userData.noCast = true; scene.add(sh);
    const bulb = c3Mesh(new THREE.SphereGeometry(0.45, 12, 8), c3Flat('#fff6d0', { glow: '#ffe8a0' }), 0); bulb.position.set(lx, 13.6, lz); scene.add(bulb);
    const pool = pl(12, 12, new THREE.MeshBasicMaterial({ map: tex((g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,230,160,0.55)'); gr.addColorStop(0.6, 'rgba(255,220,140,0.2)'); gr.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 256, 256), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), lx, 0.05, lz, 0, -Math.PI / 2);
    pool.userData.noInk2 = true; pool.userData.noShade = true; scene.add(pool);
    const pt = new THREE.PointLight('#ffd890', 1.4, 26, 1.4); pt.position.set(lx, 13, lz); scene.add(pt); pt.layers.enableAll(); }
  // the dusty-bags shelf + calendar + 90-days notice (wall x = -122)
  { const [dx, dz] = AP_DUST, g = new THREE.Group(); g.position.set(dx, 0, dz); scene.add(g);
    for (const pz of [-4.6, 4.6]) for (const px of [-1.4, 1.4]) g.add(rb(0.25, 6.4, 0.25, steel, px, 3.2, pz, 0)); g.add(rb(3.2, 0.25, 9.6, steel, 0, 1.0, 0, 0)); g.add(rb(3.2, 0.25, 9.6, steel, 0, 4.0, 0, 0));
    s.calB = apCalendar(scene, AP_BX0 + 0.12, 9.2, dz - 1.2, Math.PI / 2, 3.4, 4.2); redraw(s.calB.base, 'bOCTOBER', (g, w, h) => apMonthDraw(g, w, h, 'OCTOBER', '2025'));
    // three dusty bags on the top shelf (handles to the room), a 90 DAYS tag on the middle one, dust on their tops
    const dust = c3Flat('#ffffff', { map: tex((g2, w, h) => { g2.clearRect(0, 0, w, h); const R2 = RNG('dust2'); for (let k = 0; k < 900; k++) { g2.fillStyle = `rgba(225,220,205,${R2.r(0.25, 0.7)})`; g2.beginPath(); g2.arc(R2.f() * w, R2.f() * h, R2.r(2, 7), 0, TAU); g2.fill(); } }, 256, 256), transparent: true });
    [['#8a6a4a', -3.2, 2.9, 1.3], ['#5a7a5a', 0, 3.2, 1.5], ['#8a4a4a', 3.1, 2.7, 1.2]].forEach(([c, oz, w, h]) => { const b = apBag({ k: 'hard', c: t3Mix(c, '#b8b0a0', 0.35), w, h, d: 2.2 }); b.position.set(0.1, 4.13, oz); b.rotation.y = -Math.PI / 2 + (oz ? 0.06 * Math.sign(oz) : 0); g.add(b);
      const dp = pl(w * 0.96, 2.1, dust, 0.1, 4.13 + h + 0.04, oz); dp.rotation.set(-Math.PI / 2, 0, Math.PI / 2); dp.userData.noInk2 = true; g.add(dp); });
    { const tg = new THREE.Group(); tg.position.set(1.5, 4.13 + 1.5 * 0.6, 0.1); g.add(tg); tg.add(cyl(0.02, 0.02, 0.4, c3Prop('#c8c4bc'), 0.0, -0.1, 0, 0, 4)); const tm = pl(2.2, 0.96, c3Flat('#ffffff', { map: apTexTag('90 DAYS'), transparent: true }), 0.06, -0.45, 0.3, Math.PI / 2); tm.rotation.z = 0.08; tg.add(tm); s.tag90 = tm; }
    g.add(rb(2.6, 2.2, 3.4, c3Prop('#c89a5a', { rough: 0.8 }), 0, 1.13 + 1.1, -2.4, 0.01));
    scene.add(pl(3.2, 4.2, c3Flat('#ffffff', { map: apTexNotice() }), AP_BX0 + 0.12, 10.2, dz + 3.6, Math.PI / 2));
    scene.add(pl(8, 2, c3Flat('#ffffff', { map: tex((g2, w, h) => { g2.fillStyle = '#2a2a32'; g2.fillRect(0, 0, w, h); inked(g2, 'HOLD SHELF · 90 DAYS', w / 2, h / 2, h * 0.5, '#f2c23a', { stroke: false, maxW: w * 0.9 }); }, 1024, 256) }), AP_BX0 + 0.12, 15.6, dz + 1, Math.PI / 2));
    const web = pl(3, 3, c3Flat('#ffffff', { map: tex((g2, w, h) => { g2.clearRect(0, 0, w, h); g2.strokeStyle = 'rgba(240,240,240,0.8)'; g2.lineWidth = 3; for (let i = 0; i < 7; i++) { const a = i / 6 * Math.PI / 2; g2.beginPath(); g2.moveTo(0, 0); g2.lineTo(Math.cos(a) * w, Math.sin(a) * h); g2.stroke(); } for (let r = 30; r < w; r += 34) { g2.beginPath(); g2.arc(0, 0, r, 0, Math.PI / 2); g2.stroke(); } }, 256, 256), transparent: true }), AP_BX0 + 0.14, 6.6, dz - 4.6, Math.PI / 2); web.userData.noInk2 = true; scene.add(web); }
  // the warehouse corner: roll-up door, racks of boxes, hazard floor, a pallet jack
  { scene.add(pl(14, 13, c3Flat('#ffffff', { map: apTexRollDoor(), glow: '#fff0c0' }), AP_BX0 + 0.12, 6.5, AP_PAL[1] + 1, Math.PI / 2));
    const R = RNG('rack'), BX = [];
    for (const rz of [30, 4]) { const g = new THREE.Group(); g.position.set(-118, 0, rz); scene.add(g); for (const pz of [-4.5, 4.5]) for (const px of [-1.8, 1.8]) g.add(rb(0.3, 16, 0.3, c3Prop('#2f6aa8'), px, 8, pz, 0));
      for (let k = 0; k < 3; k++) { g.add(rb(4, 0.3, 9.6, c3Prop('#e8802a'), 0, 0.8 + k * 5.2, 0, 0)); for (let b = 0; b < 3; b++) { const h = R.r(2.2, 3.8); BX.push([3.2, h, 2.6, -118, 1 + k * 5.2 + h / 2, rz - 3 + b * 3, R.n(0.08), ['#ffffff', '#e8dcc8', '#f2e2c8'][(k + b) % 3]]); } } }
    scene.add(apBoxes(BX));
    const hz = pl(16, 16, c3Flat('#ffffff', { map: tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#f2c23a'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h); }, 256, 256), transparent: true }), AP_PAL[0], 0.03, AP_PAL[1], 0, -Math.PI / 2); hz.userData.noInk2 = true; scene.add(hz);
    const pj = new THREE.Group(); pj.position.set(AP_PAL[0] + 1, 0, AP_PAL[1] - 9); pj.rotation.y = 0.5; scene.add(pj); pj.add(rb(2.4, 0.4, 5, c3Prop('#e8402e'), 0, 0.3, 0, 0.02)); const hd = rb(0.25, 5, 0.25, c3Prop('#e8402e'), 0, 2.6, 2.8, 0.01); hd.rotation.x = 0.3; pj.add(hd); pj.add(rb(1.6, 0.3, 0.3, dark, 0, 5.0, 3.5, 0)); }
  apDetailBack(scene);
  // ---------------- FOCUS group: the pallet + its SOLD tag + clipboard, the hero suitcase, the receipt, s22's hugged bag, s25's arm
  const F = new THREE.Group(); scene.add(F);
  { const [px, pz] = AP_PAL, g = new THREE.Group(); g.position.set(px, 0, pz); F.add(g); const wood = c3Prop('#c49a62', { rough: 0.8, map: (() => { const t = texWood(); t.repeat.set(0.25, 0.25); return t; })() });
    for (const z of [-2.6, 0, 2.6]) g.add(rb(7.2, 0.6, 0.9, wood, 0, 0.3, z, 0.01)); for (let i = 0; i < 6; i++) g.add(rb(1.0, 0.3, 6.2, wood, -3.0 + i * 1.2, 0.75, 0, 0.005));
    const C = ['#2f6fb8', '#c8402e', '#3f8a5a', '#e8a03a', '#7a4aa8', '#2a2a32', '#e8402e', '#3a8ac8', '#8a5a2c', '#f2c23a', '#a83a5a', '#3f9a8a'];
    let k = 0; for (let ly = 0; ly < 3; ly++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const c = C[k++ % C.length], y = 0.9 + ly * 1.4; g.add(rb(3.3, 1.3, 2.9, c3Prop(c, { rough: 0.45 }), -1.75 + i * 3.5, y + 0.65, -1.5 + j * 3.0, 0.015)); g.add(rb(0.14, 1.32, 2.94, c3Prop(t3Mul(c, 0.7)), -1.75 + i * 3.5 + 0.8, y + 0.65, -1.5 + j * 3.0, 0)); }
    const wrap = new THREE.Mesh(new THREE.BoxGeometry(7.3, 4.3, 6.2), new THREE.MeshStandardMaterial({ map: apTexWrap(), transparent: true, opacity: 0.85, roughness: 0.15, metalness: 0.1, depthWrite: false })); wrap.position.y = 0.85 + 2.15; wrap.userData.noInk2 = true; g.add(wrap);
    s.sold = new THREE.Group(); s.sold.position.set(3.72, 3.2, 0.6); s.sold.rotation.y = Math.PI / 2; g.add(s.sold); const tm = pl(2.6, 1.14, c3Flat('#ffffff', { map: apTexTag('SOLD'), transparent: true }), 0, 0, 0); tm.rotation.z = -0.12; s.sold.add(tm);
    s.clip = new THREE.Group(); s.clip.position.set(0.4, AP_PTOP - 0.05, 0.3); s.clip.rotation.y = 0.08; g.add(s.clip); s.clip.add(rb(3.2, 0.12, 4.3, c3Prop('#8a5a2c', { rough: 0.6 }), 0, 0.06, 0, 0.01)); s.clip.add(rb(1.4, 0.24, 0.5, steel, 0, 0.2, -1.9, 0.01));
    s.inv = canvasTex(480, 640); s.invM = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 3.8), new THREE.MeshLambertMaterial({ map: s.inv.t, color: '#c4beb2' })); s.invM.rotation.x = -Math.PI / 2; s.invM.position.set(0, 0.14, 0.18); s.clip.add(s.invM); redraw(s.inv, 'i0', (g2, w, h) => apInvoiceDraw(g2, w, h, 0)); }
  s.hero = suitcase3D({ color: BAG.color, sticker: BAG.sticker, lining: '#9a8668' }); s.hero.userData.hw = 1.8; s.hero.userData.hd = 1.2; F.add(s.hero);   // v6: a tan fabric lining (the empty inside reads as fabric, not a white card)
  { const lid = s.hero.userData.lid.children[0]; s.heroStk = pl(2.2, 1.37, c3Flat('#ffffff', { map: apTexSticker(), transparent: true }), -0.5, 0.6 + 0.015, 2.4 * 0.45); s.heroStk.rotation.set(-Math.PI / 2, 0, Math.PI); lid.add(s.heroStk); }   // v6: the UNCLAIMED sticker smaller, clear of the round one
  s.rcpt = canvasTex(360, 720); redraw(s.rcpt, 'r', apReceiptDraw); s.rcptM = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.0), new THREE.MeshLambertMaterial({ map: s.rcpt.t, color: '#c4beb2', side: THREE.DoubleSide })); s.rcptM.rotation.order = 'YXZ'; F.add(s.rcptM);
  s.hug = apBag({ k: 'hard', c: '#e8402e', w: 3.0, h: 1.1, d: 2.0, st: '#f2c23a' }); F.add(s.hug);
  s.heart = spritePlane(scene, texHeart(), 1.8, 1.8);
  s.arm = new THREE.Group(); F.add(s.arm); { const sl = cyl(0.42, 0.5, 7, c3Prop('#a89e8c', { rough: 0.85, env: 0.3 }), 0, 3.5, 0, 0.03, 12); s.arm.add(sl); s.arm.add(cyl(0.52, 0.52, 0.5, c3Prop('#7a4a2a'), 0, 0.5, 0, 0.02, 12));
    const hd = c3Mesh(new THREE.SphereGeometry(0.5, 14, 10), c3Prop('#cdbfac', { rough: 0.85, env: 0.3 }), 0.03); hd.position.y = -0.15; s.arm.add(hd); s.arm.userData.sleeve = sl; }
  s.pen = new THREE.Group(); s.pen.add(cyl(0.07, 0.07, 1.5, c3Prop('#1a3a9a', { rough: 0.3 }), 0, 0.75, 0, 0.006, 8)); s.pen.add(cyl(0.02, 0.07, 0.2, c3Prop('#c8c4bc', { metal: 0.6 }), 0, -0.1, 0, 0, 8)); F.add(s.pen);
  c3Layer(F, C3.L_FOCUS);
  // ---------------- the extras' cast entries + people
  for (const w of ['trav', 'clerk', 'driver', 'boss', 'apA', 'apB', 'apC']) toonPerson(s, w);
  haze(scene, '#8c84a0', 0.0032);   // v5: depth fades to warm lavender
  c3Env(scene, { top: '#9aa0dc', mid: '#7a6478', bot: '#4a2c22', cards: [[0, 30, 0, 40, 6, '#e8c8a8'], [30, 12, -10, 10, 18, '#a8a8d8']] });   // v4: dimmer IBL (it flattened the interior) c3ShadeScene(scene, { dark: 0.2 });
  // ---------------- moving parts, added after the bake: belt plates + belt bags
  { s.plates = []; const pg = c3RBox(1.45, 0.14, 3.2, 0.05), pm = (() => { const t = apTexBrushed(); t.repeat.set(0.5, 0.5); return t; })(), M = [c3Prop('#c9d0d8', { metal: 0.55, rough: 0.3, map: pm }), c3Prop('#aab4c0', { metal: 0.55, rough: 0.3, map: pm })], N = 72;
    for (let i = 0; i < N; i++) { const m = c3Mesh(pg, M[i % 2], 0); m.rotation.order = 'YXZ'; m.userData.noShade = true; scene.add(m); s.plates.push(m); } }
  s.bags = AP_BAGS.map((o) => { const b = apBag(o); scene.add(b); b.visible = false; return b; });
  noFogOnCards(scene);
  c3SetLook(scene, { grime: 1, scale: 0.5, inkSet: false, bounce: ['#ffe2c0', '#8a4a3a', 0.06], lights: AP_PRACT, shafts: [[[-22, 29, -44], [-36, 2, -11], 2.5, 7, '#ffc890', 0.07], [[28, 29, -44], [14, 2, -11], 2.5, 7, '#ffc890', 0.07], [[-96, 15, -36], [-96, 0, -36], 0.8, 6, '#ffd890', 0.12]] });
  apOccluders(scene);   // v3: Ricks-like set (setlook.js)
  return s;
}
CAST.apA = { key: 'apA', hair: 'bun', hairColor: 'chestnut', outfit: 'sweater', colors: { main: '#d8407a', rib: '#b02a5e' }, skin: 'brown', body: 'short' };   // grabs her red bag
CAST.apB = { key: 'apB', hair: 'mop', hairColor: 'blond', outfit: 'hoodie', colors: { main: '#3aa86a', cord: '#ffffff' }, body: 'avg' };   // hugs his suitcase
CAST.apC = { key: 'apC', hair: 'bowl', hairColor: 'black', outfit: 'polo', colors: { main: '#8a5ac8', collar: '#6a3aa8' }, skin: 'tan', body: 'fat', moustache: true };   // swings his bag off
// the belt bags: definitions + the schedule (te = when the bag's front leaves the flaps, cyclic every AP_L / AP_V s)
const AP_BAGS = [{ k: 'hard', c: '#d8402e', w: 3.2, h: 1.2, d: 2.2, st: '#ffffff' }, { k: 'duffel', c: '#3f9a5a', w: 2.8, d: 1.5 }, { k: 'hard', c: '#f2c23a', w: 3.4, h: 1.3, d: 2.3 },
  { k: 'hard', c: '#7a4aa8', w: 3.0, h: 1.1, d: 2.1, st: '#f2c23a' }, { k: 'duffel', c: '#2a2a32', w: 3.0, d: 1.6 }, { k: 'hard', c: '#e88aa8', w: 2.8, h: 1.1, d: 2.0 }, { k: 'hard', c: '#3fb8b0', w: 3.4, h: 1.3, d: 2.3, st: '#e8402e' },
  { k: 'duffel', c: '#c87a3a', w: 2.6, d: 1.4 }, { k: 'hard', c: '#1a1a22', w: 3.3, h: 1.25, d: 2.2, st: '#3fb8b0' }, { k: 'hard', c: '#9ac83a', w: 3.0, h: 1.1, d: 2.1 }];
const AP_SCHED = [[0, 0.40], [1, 1.10], [2, 3.6], [3, 5.4], [4, 7.1], [5, 8.9], [6, 10.8], [7, 12.5], [8, 14.3], [9, 16.1]];
const apGet = () => AP.s ||= apBuild();
SETS.airport = apGet;
// ---- per-frame
// belt plates move with time; bags (list of { m, s (centre), off }) ride on them; the flaps swing when a bag pushes through
function apBelt(s, t, list) {
  const N = s.plates.length; s.plates.forEach((m, i) => { const p = apPath(i * AP_L / N + AP_V * t); m.position.set(p.x, AP_BY, p.z); m.rotation.set(-AP_ROLL, -p.a, 0.07); });
  for (const b of list) { if (b.place === false) continue; const hw = b.m.userData.hw ?? 1.8, sc = ((b.s % AP_L) + AP_L) % AP_L; if (sc > 1 + hw && sc < AP_SM - hw) { b.m.visible = false; continue; }
    const off = b.off ?? -0.5, p = apPath(sc, off); b.m.visible = true; b.m.rotation.order = 'YXZ'; b.m.rotation.set(-AP_ROLL, -p.a + (b.ry ?? 0), 0); b.m.position.set(p.x, AP_BY + 0.08 + off * Math.sin(AP_ROLL), p.z); }
  s.flaps.forEach((f) => { let best = 0;
    for (const b of list) { const hw = b.m.userData.hw ?? 1.8, hd = (b.m.userData.hd ?? 1.2) + 0.25, sc = ((b.s % AP_L) + AP_L) % AP_L; if (sc < 0 || sc > 2 * AP_A) continue;
      const x = -AP_A + sc, front = x + hw, rear = x - hw, zc = -(AP_RC - (b.off ?? -0.5)), over = Math.abs(f.userData.z - zc) < hd ? 1 : 0.3; let a = 0;
      if (front < AP_MX) continue; if (rear < AP_MX) a = 1.15 * clamp((front - AP_MX) / 1.0); else { const tau = (rear - AP_MX) / AP_V; a = 1.15 * Math.exp(-3.2 * tau) * Math.cos(11 * tau); }
      a *= over; if (Math.abs(a) > Math.abs(best)) best = a; }
    f.rotation.z = best + 0.02 * Math.sin(t * 2.3 + f.userData.z * 3); });
}
// the scheduled bags at time t (sched = [[bag index, te], ...])
const apSched = (s, t, sched = AP_SCHED) => sched.map(([i, te]) => ({ m: s.bags[i], s: AP_SM + AP_V * (t - te) - s.bags[i].userData.hw }));
function apReset(s) { hideAll(s); hideGrips(s); s.bags.forEach((b) => { b.visible = false; }); [s.hero, s.rcptM, s.hug, s.arm, s.pen, s.heart].forEach((m) => { m.visible = false; });
  s.hero.scale.setScalar(1); s.hero.userData.open(0); s.stamp.scale.setScalar(1); s.heroStk.visible = true; s.stamp.position.set(AP_DX + 0.9, 4.78, -5.2); s.stamp.rotation.set(0, 0, 0);
  s.cal3.pv.visible = false; s.calB.pv.visible = false; s.hero.rotation.order = 'XYZ'; }
const apCam = (s, id, lt, K) => c3SetCam(s.cam, camMove(K, lt, id));
const apRender = (s, o = {}) => { const k = C3_SHADOW; if (k) C3_SHADOW = Object.assign({}, k, { dir: AP_SUN, maxRad: 112, catch: 0.3, tint: '#3a3478' });   // v4: the sun through the windows
  try { c3Render(s.scene, s.cam, Object.assign({ bg: '#1a2a3a', bgBlur: 2.0, glow: 0.4, glowBlur: 12 }, o)); } finally { C3_SHADOW = k; } };
function apTrav(s, t, o = {}) { return pose(s, 'trav', t, AP_T[0], AP_T[1], Object.assign({ facing: -0.7, expr: 'neutral', gaze: [-0.6, 0.2], hand: { L: 'down', R: 'down' } }, o)); }
// put a 3D prop so its local point `local` sits in a person's hand, with quaternion q (gripProp with a quaternion)
function apAttach(s, obj, who, nm, local, q, behind = 0.05) { const h = c3ToonHandWorld(s.p[who], nm); if (!h) return null; obj.visible = true; obj.quaternion.copy(q);
  const off = local.clone().multiply(obj.scale).applyQuaternion(q), d = s.cam.position.clone().sub(h).normalize(); obj.position.copy(h).sub(off).addScaledVector(d, -behind); return h; }
const apQ = (rx, ry, rz, ord = 'XYZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, ord));

// ---- s01: You land, you wait at the carousel — crane down over the big hall (sign, screen, bags circling) to the
// traveller waiting behind carousel 4, just downstream of the flaps
SHOT_FN.s01 = (t, u, lt) => { const s = apGet(); apReset(s);
  apCam(s, 's01', lt, [[0, [9, 33, 44], [1, 9, -6], 46], [0.7, [6, 21, 30], [0, 7, -7], 42], [1.72, [3.2, 10.5, 15.5], [-1.4, 6.4, -8.5], 38]]);
  apBelt(s, t, apSched(s, t));
  apTrav(s, t, { facing: -0.8, expr: [[0, 'neutral'], [0.66, 'smile']], gaze: [-0.7, 0.2], hand: { L: 'pocket', R: 'down' } });
  pose(s, 'apA', t, 13, -10.8, { facing: -0.6, expr: 'bored', hand: { L: 'hip', R: 'down' }, gaze: [-0.6, 0.2] });
  pose(s, 'apC', t, 15, 9.6, { facing: -0.8, expr: 'neutral', hand: { L: 'down', R: 'down' }, gaze: [-0.4, -0.2] });
  apRender(s, { bgBlur: 2.5 }); };
SNAPS.s01 = 'free'; CAMF.s01 = { push: 0.04, orbit: 0.06, crane: 0 };
// ---- s02: and your suitcase never comes out — tight on the flap mouth: a bag slides out, the strips sway; on "out" the
// mouth is empty and the camera finds the traveller alone by the empty belt
SHOT_FN.s02 = (t, u, lt) => { const s = apGet(); apReset(s);
  apCam(s, 's02', lt, [[0, [5.6, 7.0, 3.5], [-4.9, 4.0, -6.8], 34], [0.9, [4.7, 7.2, 5.0], [-4.5, 4.3, -7.2], 34], [1.04, [1.2, 8.0, 11.5], [-1.9, 5.6, -8.6], 36], [1.48, [1.0, 8.2, 11.0], [-1.9, 5.6, -8.6], 35]]);
  apBelt(s, t, apSched(s, t));
  // v2: the flap close-up looks a bit further left so the traveller (always there) stays out of it
  apTrav(s, t, { facing: -0.9, expr: [[0, 'smile'], [2.2, 'nervous'], [2.76, 'sad']], gaze: t < 2.4 ? [-0.8, 0.4] : [-0.6, 0.2], hand: { L: 'pocket', R: [[0, 'down'], [2.76, 'rest']] } });
  apRender(s, { bgBlur: 3.5 }); };
SNAPS.s02 = 'free'; CAMF.s02 = { push: 0.08, orbit: -0.04, crane: 0 };
// ---- s03: The airline searches for months — the clerk types at BAGGAGE SERVICES; the wall calendar flips on "months"
SHOT_FN.s03 = (t, u, lt) => { const s = apGet(); apReset(s);
  apCam(s, 's03', lt, [[0, [-38, 10.5, -5.5], [-64, 9.6, -12.4], 40], [1.0, [-40, 10.2, -6.2], [-64, 9.8, -12.6], 39], [1.62, [-41, 10, -6.6], [-64, 9.8, -12.6], 38]]);
  apCalAt(s.cal3, t, ['MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST'], [4.40, 4.47, 4.54, 4.61, 4.68], '2025', 0.1);
  const k = Math.floor(t / 0.11) % 2;
  pose(s, 'clerk', t, AP_CLERK[0], AP_CLERK[1], { facing: 0.5, expr: [[0, 'thinking'], [4.4, 'bored']], gaze: [0.7, 0.4],
    hand: { L: { h: [-0.12, 0.6 + (k ? 0.05 : 0)], pole: [1, 0.3], front: true }, R: { h: [-0.1, 0.6 + (k ? 0 : 0.05)], pole: [1, 0.3], front: true } } });
  apRender(s, { bgBlur: 3 }); };
SNAPS.s03 = 'free'; CAMF.s03 = { push: 0.1, orbit: 0.04, crane: 0 };
// ---- s04: then gives up — TOP-DOWN on the MISSING BAGGAGE REPORT on the counter; the CASE CLOSED stamp slams on "up"
SHOT_FN.s04 = (t, u, lt) => { const s = apGet(); apReset(s); const [cx, cy, cz] = AP_REP;
  apCam(s, 's04', lt, [[0, [cx, cy + 8.6, cz + 0.3], [cx, cy, cz - 0.5], 40], [0.38, [cx, cy + 8.4, cz + 1.2], [cx, cy, cz + 0.3], 40], [0.8, [cx, cy + 8.9, cz + 1.5], [cx, cy, cz + 0.6], 40]]);
  redraw(s.rep, 'r' + (t >= 5.2 ? 1 : 0), (g, w, h) => apReportDraw(g, w, h, t >= 5.2));
  const d = t - 5.2, aw = d > 0.06 ? (d - 0.06) / 0.1 : 0; s.stamp.scale.setScalar(0.75); s.stamp.position.set(cx + 0.05 + 2.4 * aw * aw, cy + (d > -0.14 && d < 0.2 ? (d < 0 ? 2.2 * (-d / 0.14) ** 2 : d < 0.06 ? 0 : 1.6 * aw) : 40), cz + 1.08 + 1.5 * aw * aw);
  apRender(s, { bgBlur: 2 }); };
SNAPS.s04 = 'free'; CAMF.s04 = { push: 0.05, orbit: 0, crane: 0, roll: -3 };
// ---- s05: So where does it go? — the back room: the lost & found cage, the lone blue suitcase under one lamp, push in
SHOT_FN.s05 = (t, u, lt) => { const s = apGet(); apReset(s); const [lx, lz] = AP_LAMP;
  apCam(s, 's05', lt, [[0, [-95.4, 9.0, -11], [-95.8, 7.0, -36], 46], [0.9, [-95.6, 8.6, -16.5], [-95.8, 6.8, -36], 44]]);
  s.hero.visible = true; s.heroStk.visible = false; s.hero.rotation.order = 'YXZ'; s.hero.rotation.set(-Math.PI / 2, Math.PI + 0.25, 0); s.hero.position.set(lx + 0.4, 2.4 + 1.2, lz + 0.6);
  apRender(s, { bgBlur: 3 }); };
SNAPS.s05 = 'free'; CAMF.s05 = { push: 0.12, orbit: 0.05, crane: 0 };
// ---- s22: Airlines find almost every bag they lose — owners happily grab their bags at carousel 4; one hugs his suitcase
SHOT_FN.s22 = (t, u, lt) => { const s = apGet(); apReset(s);
  apCam(s, 's22', lt, [[0, [3, 10.5, 40], [0, 6.4, 8], 44], [0.8, [1.5, 9.5, 37], [0, 6.2, 9], 42], [1.5, [1.4, 8.6, 30], [0.6, 6.6, 10], 38], [2.24, [1.2, 8.4, 28.5], [0.6, 6.6, 10], 37]]);
  apBelt(s, t, apSched(s, t));
  pose(s, 'apA', t, -5.2, 11.2, { facing: 0.6, expr: [[0, 'smile'], [33.12, 'happy']], gaze: [0.2, -0.2], hand: { L: 'hip', R: [[0, 'down'], [32.8, 'holdUp']] }, prop: { R: { kind: 'suitcase', color: '#e8402e', sticker: '#ffffff' } } });
  pose(s, 'apC', t, 5.4, 11.2, { facing: -0.6, expr: [[0, 'smile'], [33.36, 'grin']], gaze: [-0.2, -0.2], hand: { L: 'down', R: [[0, 'down'], [33.36, 'up']] }, prop: { R: { kind: 'suitcase', color: '#3f9a5a', sticker: false } } });
  // v5: the hugged bag is drawn on his card (held by its handle against his chest) — the 3D case cut through his torso
  pose(s, 'apB', t, 0.2, 12.4, { facing: 0.2, expr: [[0, 'happy'], [33.7, 'laugh']], gaze: [0, 0], fx: t > 33.7 ? 'sparkle' : undefined,
    hand: { L: { h: [-0.16, 0.56], pole: [1, 0.6], front: true, over: true, hand: 'grip' }, R: { h: [-0.02, 0.3], pole: [1, 0.6], front: true, hand: 'grip' } },
    prop: { R: { kind: 'suitcase', color: '#e8402e', sticker: '#f2c23a', k: 1.25 } } });
  s.hug.visible = false;
  const k = pop(t, 33.7, 0.3); popAt(s.heart, k, [0.2 + 0.2 * Math.sin(t * 3), 13.4 + (t - 33.7) * 0.6, 12.6], s.cam, 1);
  apRender(s, { bgBlur: 3 }); };
SNAPS.s22 = 'free'; CAMF.s22 = { push: 0.06, orbit: 0.03, crane: 0 };
// ---- s23: But the few that stay lost for about three months — the dusty hold shelf; the wall calendar flips three
// months; the camera settles on the 90 DAYS tag
SHOT_FN.s23 = (t, u, lt) => { const s = apGet(); apReset(s); const [dx, dz] = AP_DUST;
  apCam(s, 's23', lt, [[0, [-103, 8.0, -24], [-120.5, 7.2, -33.2], 38], [2.26, [-105.5, 7.8, -26.4], [-120.5, 7.1, -33.2], 37]]);
  apCalAt(s.calB, t, ['OCTOBER', 'NOVEMBER', 'DECEMBER', 'JANUARY'], [36.30, 36.48, 36.78], '2025', 0.16);
  apRender(s, { bgBlur: 3 }); };
SNAPS.s23 = 'free'; CAMF.s23 = { push: 0.08, orbit: -0.04, crane: 0 };
// ---- s24: get sold — the warehouse corner: the shrink-wrapped pallet (SOLD); the airline man and the buyer shake hands
SHOT_FN.s24 = (t, u, lt) => { const s = apGet(); apReset(s); const [px, pz] = AP_PAL;
  apCam(s, 's24', lt, [[0, [-82, 10.5, 21.5], [-110, 6.4, 18], 40], [0.8, [-84, 10, 20.5], [-110, 6.4, 18], 39]]);
  const sh = t > 37.36 ? 0.06 * Math.sin((t - 37.36) * 30) : 0;
  pose(s, 'driver', t, px + 6.2, pz + 2.6, { facing: -1.3, expr: [[0, 'smile'], [37.32, 'grin']], gaze: [-0.6, 0], hand: { L: 'down', R: [[0, 'down'], [37.12, { h: [0.8, 0.3 + sh], pole: [0.6, 1], hand: 'grip', front: true }]] } });
  pose(s, 'boss', t, px + 6.2, pz - 2.6, { facing: 1.3, expr: [[0, 'smile'], [37.32, 'smug']], gaze: [0.6, 0], hand: { L: 'down', R: [[0, 'down'], [37.12, { h: [0.8, 0.3 + sh], pole: [0.6, 1], hand: 'grip', front: true }]] } });
  apRender(s, { bgBlur: 3 }); };
SNAPS.s24 = 'free'; CAMF.s24 = { push: 0.1, orbit: 0.05, crane: 0 };
// ---- s25: and this store buys them without knowing what's inside — TOP-DOWN on the purchase order on the pallet's
// clipboard; the buyer's hand signs it (pen gripped), crane down
SHOT_FN.s25 = (t, u, lt) => { const s = apGet(); apReset(s); s.invM.updateMatrixWorld(true); const c = s.invM.getWorldPosition(V3(0, 0, 0));
  apCam(s, 's25', lt, [[0, [c.x, c.y + 9.2, c.z + 1.2], [c.x, c.y, c.z + 0.1], 40], [2.46, [c.x, c.y + 8.2, c.z + 1.0], [c.x, c.y, c.z + 0.2], 40]]);
  const sig = clamp((t - 38.5) / 1.3); redraw(s.inv, 'i' + Math.round(sig * 30), (g, w, h) => apInvoiceDraw(g, w, h, sig));
  // the pen tip on the signature (paper uv -> world), the hand holding it, the sleeve coming in from the right
  const [u0, v0] = apSigAt(Math.max(0.001, sig)), lp = V3((u0 - 0.5) * 2.85, -(v0 - 0.5) * 3.8, 0.02), tip = s.invM.localToWorld(lp);
  const lift = t < 38.5 ? 0.4 * (1 - clamp((t - 38.0) / 0.5)) : sig >= 1 ? 0.4 * clamp((t - 39.8) / 0.3) : 0.05 * Math.abs(Math.sin(t * 9));
  s.pen.visible = true; s.pen.position.set(tip.x, tip.y + 0.12 + lift, tip.z); s.pen.rotation.set(-0.35, 0, -0.55);
  s.pen.updateMatrixWorld(true); const hp = s.pen.localToWorld(V3(0.1, 0.85, 0.12)); s.arm.visible = true; s.arm.rotation.set(-0.3, 0, -1.15); s.arm.position.copy(hp);
  apRender(s, { bgBlur: 2 }); };
SNAPS.s25 = 'free'; CAMF.s25 = { push: 0.06, orbit: 0, crane: 0, roll: 5 };
// ---- s34: So next time your suitcase goes missing — back at carousel 4: the traveller alone, the empty belt going round
SHOT_FN.s34 = (t, u, lt) => { const s = apGet(); apReset(s);
  apCam(s, 's34', lt, [[0, [12, 14, 22], [-0.5, 5.6, -7], 42], [1.58, [7, 11.5, 18], [-0.8, 6, -8], 40]]);
  apBelt(s, t, []);
  apTrav(s, t, { facing: -0.6, expr: [[0, 'worried'], [54.3, 'sad']], gaze: [-0.7, 0.3], hand: { L: 'pocket', R: 'down' } });
  apRender(s, { bgBlur: 2.5 }); };
SNAPS.s34 = 'free'; CAMF.s34 = { push: 0.06, orbit: 0.06, crane: 0 };
// ---- s35: don't panic. It's probably fine — closer: he panics (shock, sweat, hands up), then on "fine" relaxes
SHOT_FN.s35 = (t, u, lt) => { const s = apGet(); apReset(s);
  apCam(s, 's35', lt, [[0, [2.6, 9.6, 6.5], [-0.8, 7.2, -9.6], 38], [1.88, [1.6, 9.4, 6.2], [-0.6, 7.9, -9.6], 38]]);
  apBelt(s, t, []);
  const pan = t < 55.92, j = pan ? Math.floor(t / 0.07) % 2 : 0;
  apTrav(s, t, { facing: -0.3, expr: [[0, 'shock'], [55.04, 'strain'], [55.92, 'happy']], gaze: pan ? [0, 0] : [-0.3, -0.2], fx: pan ? 'sweat' : undefined, lean: pan ? (j ? 0.04 : -0.04) : 0,
    hand: { L: [[0, 'up'], [55.92, 'pocket']], R: [[0, 'up'], [55.04, 'chin'], [55.92, 'down']] } });
  apRender(s, { bgBlur: 4 }); };
SNAPS.s35 = 'free'; CAMF.s35 = { push: 0.03, orbit: -0.05, crane: 0 };
// ---- s37: END GAG (v6) — the flaps part and his blue suitcase rides out STANDING on its edge (handle on top, lid to the
// camera, UNCLAIMED BAGGAGE sticker readable). He spots it, winds up (hand pulls in), REACHES down onto the top handle,
// grips, strains (the bag is heavy: slow start), lifts it up off the belt toward his chest, it swings and settles; the
// latches pop and the lid swings open on its bottom hinge toward the camera: EMPTY (cream lining), the receipt pops out
// and flutters down to the belt (s38 picks it up top-down). The bag is placed along the camera ray through his hand, so
// on screen it is always IN the hand, while in depth it moves from the belt lane to just in front of his card (never
// through his body, the belt or the flap housing).
const AP_E = 57.80, AP_ANT = 58.46, AP_REACH = 58.58, AP_G = 58.70, AP_LIFT = 58.80, AP_UP = 59.08, AP_OPEN = 59.24;
const AP_TV = [-0.4, -9.4], AP_LANE = -0.7, AP_GCAM = V3(2.2, 7.6, 8.8);   // s37: the traveller, the bag's lane (path offset), the camera the bag faces
const AP_HANT = [0.04, 0.22], AP_HUP = [0.2, -0.15];   // L-hand targets ([out, down] in head heights): the wind-up, the carry
const apQUp = (x, z) => { const Y = V3(AP_GCAM.x - x, 0, AP_GCAM.z - z).normalize(), Z = V3(0, 1, 0), X = Y.clone().cross(Z); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); };
// the bag standing on the belt at t (origin = the lying box's bottom centre; upright, that is its back face, low edge on the plates)
function apHeroOnBelt(s, t) { const H = s.hero, sc = AP_SM + AP_V * (Math.min(t, AP_G) - AP_E) - 1.8, p = apPath(sc, AP_LANE), q = apQUp(p.x, p.z);
  const Y = V3(0, 1, 0).applyQuaternion(q), pos = V3(p.x, AP_BY + 0.1 + 1.2, p.z).addScaledVector(Y, -0.65); return { pos, q, sc }; }
// the L hand's [out, down] target at t: rest -> wind-up -> reach onto the handle (solved on screen) -> carry
function apGagHand(s, t, o, Hg) {
  const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], rest = [0.1, 0.98];
  if (t < AP_ANT) return rest;
  if (t < AP_REACH) return lerp2(rest, AP_HANT, EZ.io((t - AP_ANT) / (AP_REACH - AP_ANT)));
  // solve the h that puts the hand on the handle point Hg ON SCREEN (the card is a plane: hand(h) is affine), 2 Newton steps
  const at = (h) => { pose(s, 'trav', t, AP_TV[0], AP_TV[1], Object.assign({}, o, { hand: { L: { h, pole: [1, 0.2], hand: 'grip', front: true, over: true }, R: 'down' } })); const w = c3ToonHandWorld(s.p.trav, 'L'); return w ? w.project(s.cam) : V3(); };
  s.cam.updateMatrixWorld(); const T = Hg.clone().project(s.cam); let h = s.gagH || [0.35, 0.95];
  for (let it = 0; it < 2; it++) { const a = at(h), dx = at([h[0] + 0.05, h[1]]), dy = at([h[0], h[1] + 0.05]);
    const j = [[(dx.x - a.x) / 0.05, (dy.x - a.x) / 0.05], [(dx.y - a.y) / 0.05, (dy.y - a.y) / 0.05]], det = j[0][0] * j[1][1] - j[0][1] * j[1][0]; if (Math.abs(det) < 1e-6) break;
    const ex = T.x - a.x, ey = T.y - a.y; h = [h[0] + (j[1][1] * ex - j[0][1] * ey) / det, h[1] + (-j[1][0] * ex + j[0][0] * ey) / det]; }
  s.gagH = h;   // warm start for the next frame
  if (t < AP_G) return lerp2(AP_HANT, h, EZ.o3((t - AP_REACH) / (AP_G - AP_REACH)));
  if (t < AP_LIFT) return [h[0], h[1] + 0.03 * Math.sin(Math.PI * (t - AP_G) / (AP_LIFT - AP_G))];   // grip: a little tug down (weight)
  const u = clamp((t - AP_LIFT) / (AP_UP - AP_LIFT)), e = Math.pow(u * u * (3 - 2 * u), 1.35), bob = t > AP_UP ? -0.05 * Math.exp(-7 * (t - AP_UP)) * Math.sin(16 * (t - AP_UP)) : 0;
  return [h[0] + (AP_HUP[0] - h[0]) * e, h[1] + (AP_HUP[1] - h[1]) * e + bob]; }
function apGag(s, t) {
  const H = s.hero, hl = H.userData.handle, belt = apHeroOnBelt(s, t); H.visible = true; H.scale.setScalar(1);
  // the handle where the hand meets it (the bag on the belt at the grab instant)
  const bg = apHeroOnBelt(s, AP_G), Hg = hl.clone().applyQuaternion(bg.q).add(bg.pos);
  const lean = t < AP_ANT ? 0 : t < AP_REACH ? 0.05 * EZ.io((t - AP_ANT) / 0.12) : t < AP_LIFT ? 0.05 - 0.15 * EZ.o3((t - AP_REACH) / 0.14) : t < AP_UP ? -0.1 + 0.18 * EZ.io((t - AP_LIFT) / (AP_UP - AP_LIFT)) : 0.08 * Math.exp(-5 * (t - AP_UP));   // + = top to screen-right: away (wind-up), toward the bag (reach), back under the weight (lift)
  const o = { facing: -0.7, lean, expr: [[0, 'surprised'], [58.3, 'excited'], [AP_G + 0.02, 'strain'], [AP_UP, 'grin'], [AP_OPEN + 0.05, 'shock']],
    gaze: t < AP_OPEN ? [-0.3, 0.7] : [-0.1, 0.4], fx: t > AP_OPEN + 0.05 ? 'sweat' : undefined };
  const h = apGagHand(s, t, o, Hg);
  pose(s, 'trav', t, AP_TV[0], AP_TV[1], Object.assign({}, o, { hand: { L: { h, pole: [1, 0.2], hand: t < AP_REACH + 0.06 ? 'dot' : 'grip', front: true, over: true }, R: [[0, 'down'], [AP_OPEN + 0.05, 'up']] } }));
  if (t < AP_G) { H.quaternion.copy(belt.q); H.position.copy(belt.pos); }
  else {   // held: the handle on the camera ray through the hand, depth easing from the belt lane to just in front of his card
    s.cam.updateMatrixWorld(); const hw = c3ToonHandWorld(s.p.trav, 'L'), cam = s.cam.position, zf = AP_TV[1] + 2.1, kz = EZ.io(clamp((t - AP_LIFT) / (AP_UP - AP_LIFT + 0.04)));
    const z = Hg.z + (zf - Hg.z) * kz, lam = (z - cam.z) / (hw.z - cam.z), P = cam.clone().add(hw.clone().sub(cam).multiplyScalar(lam));
    const d = t - AP_UP, dO = t - AP_OPEN, sw = t < AP_UP ? 0.16 * Math.sin(Math.PI * clamp((t - AP_LIFT) / (AP_UP - AP_LIFT))) : -0.1 * Math.exp(-6 * d) * Math.cos(11 * d);
    const kick = dO > 0 ? 0.09 * Math.exp(-5 * dO) * Math.sin(12 * dO) : 0, axis = cam.clone().sub(P).normalize(), q = new THREE.Quaternion().setFromAxisAngle(axis, sw + kick).multiply(new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), 0.5 * kz)).multiply(bg.q);   // + a 3/4 yaw while lifting: the open case shows its depth
    H.quaternion.copy(q); H.position.copy(P).sub(hl.clone().applyQuaternion(q)); }
  const dO = t - AP_OPEN; H.userData.open(dO < 0 ? 0 : 1.48 * (1 - Math.exp(-6 * dO) * Math.cos(11 * dO)));   // 1.48 x 1.95 rad = the lid hangs below the case
  if (t > AP_G) gripDot(s, 'trav', 'L');
  return H; }
// the receipt: pops out of the open case toward the camera, flutters down onto the belt plates, then rides the belt
const AP_RC0 = V3(-1.6, 5.6, -7.5);   // the open case's interior centre at AP_OPEN (measured)
function apReceipt(s, t) { const R = s.rcptM, d = t - AP_OPEN - 0.06; if (d < 0) return; R.visible = true;
  const up = 0.26, land = 0.95, top = AP_RC0.clone().add(V3(1.7, 1.2, 1.7)), end = V3(AP_RC0.x + 2.2, AP_BY + 0.2, -5.9);
  let p; if (d < up) p = AP_RC0.clone().lerp(top, EZ.o2(d / up));
  else if (d < land) { const k = (d - up) / (land - up); p = top.clone().lerp(end, k); p.y = top.y + (end.y - top.y) * EZ.i2(k) * 0.4 + (end.y - top.y) * k * 0.6; p.x += 0.45 * Math.sin((d - up) * 10) * (1 - k); }
  else { p = end.clone(); p.x += AP_V * 0.25 * (d - land); }
  R.position.copy(p); const f = d < land ? 1 - clamp((d - up) / (land - up)) : 0;
  const kf = d < up ? 0 : clamp((d - up) / (land - up));   // it faces the camera while it flies, then settles flat on the belt
  R.rotation.set(-0.15 - (Math.PI / 2 - 0.15) * Math.pow(kf, 1.6) + 0.45 * Math.sin(d * 13) * (1 - kf), 0.15 + 0.5 * Math.sin(d * 7) * (1 - kf), 0.6 * Math.sin(d * 9) * (1 - kf)); }
SHOT_FN.s37 = (t, u, lt) => { const s = apGet(); apReset(s);
  apCam(s, 's37', lt, [[0, [2.2, 7.6, 8.8], [-0.9, 5.7, -8.6], 44], [0.75, [2.1, 7.9, 9.2], [-0.9, 6.0, -8.6], 44], [1.15, [2.0, 8.1, 9.6], [-0.8, 6.1, -8.4], 44]]);
  apBelt(s, t, t < AP_G ? [{ m: s.hero, s: AP_SM + AP_V * (t - AP_E) - 1.8, off: AP_LANE, place: false }] : []);
  apGag(s, t); apReceipt(s, t);
  apRender(s, { bgBlur: 3.0 }); };
SNAPS.s37 = 'free'; CAMF.s37 = { push: 0.03, orbit: 0.03, crane: 0 };
// ---- s38: END GAG 2 — TOP-DOWN on the receipt landing on the belt plates, slow crane down
SHOT_FN.s38 = (t, u, lt) => { const s = apGet(); apReset(s); apBelt(s, AP_OPEN + 1.0 + (t - AP_OPEN - 1.0) * 0.25, []); apReceipt(s, t);
  const R = s.rcptM.position, cx = R.x, cz = R.z;
  apCam(s, 's38', lt, [[0, [cx, AP_BY + 10.5, cz + 1.0], [cx, AP_BY, cz - 0.05], 40], [0.3, [cx, AP_BY + 8.6, cz + 0.85], [cx, AP_BY, cz - 0.02], 40], [0.8, [cx, AP_BY + 6.6, cz + 0.6], [cx, AP_BY, cz], 40]]);
  apRender(s, { bgBlur: 2 }); };
SNAPS.s38 = 'free'; CAMF.s38 = { push: 0.04, orbit: 0, crane: 0, roll: 4 };
