// =====================================================================
//  STAGE COCKPIT (prefix ck) — the capsule interior, drawn over the outside pass with g.cam (metres).
//  Eye at the origin looking -Z. Front wall at z -1.55 with the window hole; a conical quilted shell; the console
//  sloping under the window with three screens (left: countdown / speed, centre: nav, right: the REAR CAM);
//  the photo taped to the console; the pilot's knees and gloved hands in the lower frame.
//  ckCockpit(g, st, L): L is the light the outside throws in (from ouOutside).
// =====================================================================
let CK = null;
const CK_WIN = { y: 0.12, w: 1.84, h: 0.86, r: 0.19, z: -1.55 };

// ---------- textures (colour + relief) ----------
function ckPanelDraw(x, w, h, o, bump) {
  // painted sheet metal: mottled paint, grime, panel seams with rivets, edge wear where hands go, stencils
  const R = RNG(o.seed);
  x.fillStyle = bump ? '#808080' : o.base; x.fillRect(0, 0, w, h);
  g3Noise(x, w, h, 3, bump ? 0.10 : 0.06, o.seed + 'n1', bump ? '255,255,255' : '0,0,0');
  g3Noise(x, w, h, 18, bump ? 0.06 : 0.08, o.seed + 'n2', bump ? '0,0,0' : '255,255,255');
  if (!bump) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,32,20,0.18)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  // scratches and chips (metal shows through)
  for (let k = 0; k < (o.wear ?? 260); k++) {
    const px = R.r(0, w), py = R.r(0, h), l = R.r(3, 26), a = R.r(-0.5, 0.5) + (R.f() < 0.5 ? 0 : Math.PI / 2);
    x.strokeStyle = bump ? 'rgba(0,0,0,0.35)' : `rgba(${R.f() < 0.6 ? '200,198,190' : '40,38,34'},${R.r(0.15, 0.45)})`; x.lineWidth = R.r(0.5, 1.4);
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  for (let k = 0; k < (o.chips ?? 40); k++) { const px = R.r(0, w), py = R.r(0, h), s = R.r(1.5, 5); x.fillStyle = bump ? 'rgba(0,0,0,0.5)' : 'rgba(165,165,160,0.7)'; x.beginPath(); x.ellipse(px, py, s, s * R.r(0.4, 1), R.r(0, 3), 0, TAU); x.fill(); }
  // seams + rivets
  const sx = o.seamX ?? [], sy = o.seamY ?? [];
  const seam = (x0, y0, x1, y1) => {
    x.strokeStyle = bump ? 'rgba(0,0,0,0.9)' : 'rgba(20,18,16,0.55)'; x.lineWidth = bump ? 4 : 2; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
    if (!bump) { x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 1; x.beginPath(); x.moveTo(x0 + 2, y0 + 2); x.lineTo(x1 + 2, y1 + 2); x.stroke(); }
    const n = Math.floor(Math.hypot(x1 - x0, y1 - y0) / (o.rivet ?? 34));
    for (let i = 0; i <= n; i++) for (const off of [-9, 9]) {
      const u = i / Math.max(1, n), px = lerp(x0, x1, u) + (y1 !== y0 ? off : 0), py = lerp(y0, y1, u) + (y1 === y0 ? off : 0);
      const g = x.createRadialGradient(px - 1, py - 1, 0, px, py, 4.2);
      if (bump) { g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); }
      else { g.addColorStop(0, 'rgba(235,232,225,0.7)'); g.addColorStop(0.6, 'rgba(120,118,112,0.5)'); g.addColorStop(1, 'rgba(30,28,25,0)'); }
      x.fillStyle = g; x.fillRect(px - 5, py - 5, 10, 10);
    }
  };
  sx.forEach((f) => seam(f * w, 0, f * w, h)); sy.forEach((f) => seam(0, f * h, w, f * h));
}
function ckPanelMat(o) {
  return g3Mat(o.seed, (x, w, h) => { ckPanelDraw(x, w, h, o, false); if (o.paint) o.paint(x, w, h); }, (x, w, h) => { ckPanelDraw(x, w, h, o, true); if (o.paintBump) o.paintBump(x, w, h); },
    { w: o.w ?? 1024, h: o.h ?? 1024, roughness: o.rough ?? 0.62, metalness: o.metal ?? 0.15, bumpScale: o.bumpScale ?? 0.0025, rep: o.rep });
}
function ckQuiltMat() {   // beta-cloth insulation blankets: off-white quilting, stitched diamonds, soft pillows
  const cell = 64;
  const draw = (bump) => (x, w, h) => {
    x.fillStyle = bump ? '#707070' : '#d9d5ca'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < h / cell + 1; j++) for (let i = 0; i < w / cell + 1; i++) {
      const cx = i * cell + (j % 2) * cell / 2, cy = j * cell * 0.5, g = x.createRadialGradient(cx, cy - 4, 2, cx, cy, cell * 0.62);
      if (bump) { g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0.9)'); }
      else { g.addColorStop(0, 'rgba(250,248,242,0.55)'); g.addColorStop(0.8, 'rgba(150,145,132,0.25)'); g.addColorStop(1, 'rgba(110,104,92,0.4)'); }
      x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy - cell * 0.5); x.lineTo(cx + cell / 2, cy); x.lineTo(cx, cy + cell * 0.5); x.lineTo(cx - cell / 2, cy); x.closePath(); x.fill();
    }
    // weave
    x.globalAlpha = bump ? 0.25 : 0.08; x.fillStyle = bump ? '#000' : '#5a554a';
    for (let k = 0; k < w; k += 3) x.fillRect(k, 0, 1, h); for (let k = 0; k < h; k += 3) x.fillRect(0, k, w, 1); x.globalAlpha = 1;
    // stitches along the diamonds
    x.strokeStyle = bump ? 'rgba(0,0,0,1)' : 'rgba(120,112,98,0.8)'; x.lineWidth = 1.5; x.setLineDash([4, 3]);
    for (let k = -h; k < w + h; k += cell) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + h, h); x.stroke(); x.beginPath(); x.moveTo(k + h, 0); x.lineTo(k, h); x.stroke(); }
    x.setLineDash([]);
    if (!bump) { g3Noise(x, w, h, 40, 0.10, 'qg', '60,50,35'); }
  };
  return g3Mat('quilt', draw(false), draw(true), { w: 512, h: 512, rep: [10, 3], roughness: 0.92, bumpScale: 0.006 });
}
function ckFabricMat(base, seed, o = {}) {   // suit fabric: tight weave, seams, soft folds
  const draw = (bump) => (x, w, h) => {
    const R = RNG(seed); x.fillStyle = bump ? '#808080' : base; x.fillRect(0, 0, w, h);
    g3Noise(x, w, h, 3, bump ? 0.12 : 0.04, seed + 'f', bump ? '255,255,255' : '0,0,0');
    for (let k = 0; k < 40; k++) { const px = R.r(0, w), py = R.r(0, h), l = R.r(30, 140), g = x.createLinearGradient(px, py - 8, px, py + 8);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, bump ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.save(); x.translate(px, py); x.rotate(R.r(-0.4, 0.4)); x.fillRect(-l / 2, -8, l, 16); x.restore(); }
    if (!bump) g3Noise(x, w, h, 24, 0.07, seed + 'g', '70,60,45');
    for (const f of o.seams ?? [0.5]) { x.strokeStyle = bump ? 'rgba(0,0,0,0.8)' : 'rgba(80,76,70,0.5)'; x.lineWidth = 3; x.beginPath(); x.moveTo(f * w, 0); x.lineTo(f * w, h); x.stroke();
      x.setLineDash([5, 4]); x.lineWidth = 1.2; for (const d of [-7, 7]) { x.beginPath(); x.moveTo(f * w + d, 0); x.lineTo(f * w + d, h); x.stroke(); } x.setLineDash([]); }
    if (o.paint) o.paint(x, w, h, bump);
  };
  return g3Mat(seed, draw(false), draw(true), { w: 512, h: 512, rep: o.rep, roughness: 0.88, bumpScale: 0.0018 });
}
function ckBrushedMat(base = '#8d9196', seed = 'br') {
  const draw = (bump) => (x, w, h) => {
    const R = RNG(seed); x.fillStyle = bump ? '#808080' : base; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 1400; k++) { const y = R.r(0, h), v = R.f(); x.strokeStyle = bump ? `rgba(${v < 0.5 ? 0 : 255},${v < 0.5 ? 0 : 255},${v < 0.5 ? 0 : 255},0.2)` : `rgba(${v < 0.5 ? '40,42,46' : '230,232,236'},${R.r(0.03, 0.12)})`;
      x.lineWidth = R.r(0.5, 1.5); x.beginPath(); x.moveTo(0, y); x.lineTo(w, y + R.r(-2, 2)); x.stroke(); }
  };
  return g3Mat(seed, draw(false), draw(true), { w: 256, h: 256, roughness: 0.38, metalness: 0.85, bumpScale: 0.0015 });
}

// ---------- the photo (a family on a beach), drawn like a slightly faded print ----------
function ckPhotoTex() {
  return g3Tex((x, w, h) => {
    const R = RNG('photo'), b = 22, bb = 70, iw = w - 2 * b, ih = h - b - bb;
    x.fillStyle = '#f3efe4'; x.fillRect(0, 0, w, h);
    x.save(); x.beginPath(); x.rect(b, b, iw, ih); x.clip(); x.translate(b, b);
    // sky, sea, surf, sand (late-afternoon warm)
    let g = x.createLinearGradient(0, 0, 0, ih * 0.45); g.addColorStop(0, '#7fb1d8'); g.addColorStop(1, '#d9e6ea'); x.fillStyle = g; x.fillRect(0, 0, iw, ih * 0.46);
    x.fillStyle = 'rgba(255,255,255,0.7)'; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(R.r(0, iw), R.r(10, ih * 0.25), R.r(30, 70), R.r(6, 12), 0, 0, TAU); x.fill(); }
    g = x.createLinearGradient(0, ih * 0.45, 0, ih * 0.62); g.addColorStop(0, '#2f7590'); g.addColorStop(1, '#5aa4ad'); x.fillStyle = g; x.fillRect(0, ih * 0.45, iw, ih * 0.18);
    x.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 0; k < 90; k++) x.fillRect(R.r(0, iw), R.r(ih * 0.46, ih * 0.6), R.r(3, 14), 1.5);
    x.fillStyle = '#f4f1e6'; x.beginPath(); x.moveTo(0, ih * 0.62); for (let i = 0; i <= 20; i++) x.lineTo(i / 20 * iw, ih * (0.615 + 0.012 * Math.sin(i * 1.3))); x.lineTo(iw, ih * 0.66); x.lineTo(0, ih * 0.66); x.fill();
    g = x.createLinearGradient(0, ih * 0.64, 0, ih); g.addColorStop(0, '#d8c39a'); g.addColorStop(1, '#c9ad7f'); x.fillStyle = g; x.fillRect(0, ih * 0.64, iw, ih * 0.36);
    for (let k = 0; k < 600; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,250,235' : '150,120,80'},0.25)`; x.fillRect(R.r(0, iw), R.r(ih * 0.65, ih), 1.5, 1.5); }
    // the family: dad (tall, blue shirt), mom (sun hat, yellow dress), a kid on dad's shoulders? a kid holding mom's hand + a bucket
    const person = (px, py, s, o) => {
      const sk = o.skin, sh = (c) => { x.fillStyle = c; };
      // shadow on the sand
      x.fillStyle = 'rgba(90,70,40,0.28)'; x.beginPath(); x.ellipse(px + s * 0.25, py + 2, s * 0.45, s * 0.07, 0, 0, TAU); x.fill();
      // legs
      sh(o.legs ?? sk); x.beginPath(); x.roundRect(px - s * 0.13, py - s * 0.46, s * 0.1, s * 0.46, s * 0.04); x.roundRect(px + s * 0.03, py - s * 0.46, s * 0.1, s * 0.46, s * 0.04); x.fill();
      // body
      sh(o.top); x.beginPath(); x.roundRect(px - s * 0.2, py - s * 0.86, s * 0.4, s * 0.46, s * 0.12); x.fill();
      if (o.dress) { x.beginPath(); x.moveTo(px - s * 0.2, py - s * 0.55); x.lineTo(px + s * 0.2, py - s * 0.55); x.lineTo(px + s * 0.28, py - s * 0.28); x.lineTo(px - s * 0.28, py - s * 0.28); x.fill(); }
      if (o.shorts) { sh(o.shorts); x.fillRect(px - s * 0.18, py - s * 0.5, s * 0.36, s * 0.14); }
      // arms (one raised waving if o.wave)
      sh(sk); x.lineCap = 'round'; x.lineWidth = s * 0.085; x.strokeStyle = sk;
      x.beginPath(); x.moveTo(px - s * 0.19, py - s * 0.8); x.lineTo(px - s * (o.wave ? 0.32 : 0.27), py - s * (o.wave ? 1.18 : 0.5)); x.stroke();
      x.beginPath(); x.moveTo(px + s * 0.19, py - s * 0.8); x.lineTo(px + s * 0.27, py - s * 0.5); x.stroke();
      // head + hair
      x.beginPath(); x.arc(px, py - s * 0.98, s * 0.13, 0, TAU); x.fill();
      sh(o.hair); x.beginPath(); x.arc(px, py - s * 1.01, s * 0.135, Math.PI * 0.95, Math.PI * 2.05); x.fill();
      if (o.hat) { sh(o.hat); x.beginPath(); x.ellipse(px, py - s * 1.06, s * 0.26, s * 0.05, 0, 0, TAU); x.fill(); x.beginPath(); x.arc(px, py - s * 1.07, s * 0.13, Math.PI, 0); x.fill(); }
      // a smile catch-light on the face
      x.fillStyle = 'rgba(255,240,220,0.35)'; x.beginPath(); x.arc(px - s * 0.04, py - s * 1.0, s * 0.05, 0, TAU); x.fill();
    };
    const gy = ih * 0.93;
    person(iw * 0.36, gy, ih * 0.62, { skin: '#c98d64', top: '#3d6ea8', shorts: '#e8e2d2', hair: '#3a2a1e', wave: true });
    person(iw * 0.54, gy - 2, ih * 0.55, { skin: '#e0b08c', top: '#f1c74a', dress: true, hair: '#7a4a28', hat: '#e9dcc0' });
    person(iw * 0.68, gy + 2, ih * 0.33, { skin: '#d9a47c', top: '#e0553a', shorts: '#2d4f7a', hair: '#5a3a22', wave: true });
    x.fillStyle = '#2fa3c4'; x.beginPath(); x.moveTo(iw * 0.74, gy); x.lineTo(iw * 0.79, gy); x.lineTo(iw * 0.785, gy - 22); x.lineTo(iw * 0.745, gy - 22); x.fill();
    // print look: warm fade, vignette, grain
    x.fillStyle = 'rgba(255,200,140,0.10)'; x.fillRect(0, 0, iw, ih);
    g = x.createRadialGradient(iw / 2, ih / 2, ih * 0.3, iw / 2, ih / 2, iw * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,40,20,0.35)'); x.fillStyle = g; x.fillRect(0, 0, iw, ih);
    for (let k = 0; k < 5000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,255,255' : '0,0,0'},0.06)`; x.fillRect(R.r(0, iw), R.r(0, ih), 1, 1); }
    x.restore();
    // handwriting on the white border, a crease, finger smudges
    x.fillStyle = '#3c4a78'; x.font = 'italic 34px "Segoe Script", "Bradley Hand", "Comic Sans MS", cursive'; x.textAlign = 'center'; x.fillText('Daytona, last summer', w / 2, h - 24);
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(w * 0.72, 0); x.quadraticCurveTo(w * 0.69, h * 0.5, w * 0.75, h); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,0.10)'; x.lineWidth = 1; x.beginPath(); x.moveTo(w * 0.72 + 2, 0); x.quadraticCurveTo(w * 0.69 + 2, h * 0.5, w * 0.75 + 2, h); x.stroke();
  }, 640, 480);
}
function ckTapeTex() {
  return g3Tex((x, w, h) => { const R = RNG('tape'); x.fillStyle = 'rgba(236,226,196,0.78)'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 300; k++) { x.fillStyle = `rgba(255,255,255,${R.r(0.05, 0.2)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 6), 1); }
    x.clearRect(0, 0, 3, h); x.clearRect(w - 3, 0, 3, h);
    x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < h; i += 4) { x.fillRect(0, i, R.r(1, 5), 3); x.fillRect(w - R.r(1, 5), i, 6, 3); } }, 128, 48);
}

// ---------- the console top: labels, stencils, switch plates (drawn into its colour map) ----------
// panel local coords (m): x -1.05..1.05 (left..right), y -0.32..0.32 (near..far). Canvas: 2048 x 624.
const CK_TOP = { w: 2.1, h: 0.64 };
const ckPX = (lx) => (lx / CK_TOP.w + 0.5) * 2048, ckPY = (ly) => (0.5 - ly / CK_TOP.h) * 624;
const CK_TOGGLES = [];   // [lx, ly, label, guarded]
['O2 FLOW', 'CABIN FAN', 'H2O', 'CO2 SCRUB', 'BUS A', 'BUS B', 'GIMBAL', 'TVC', 'IGN 1', 'IGN 2', 'IGN 3', 'RCS', 'COMM', 'BEACON', 'LIGHTS', 'HEAT'].forEach((s, i) =>
  CK_TOGGLES.push([-0.98 + i * 0.122 + (i >= 8 ? 0.06 : 0), -0.215, s, false]));
const CK_BUTTONS = [];   // [lx, ly, colour]
for (let i = 0; i < 9; i++) CK_BUTTONS.push([0.08 + i * 0.062, -0.10, ['#e8c040', '#5fd08a', '#5fd08a', '#e86040', '#7ab8ff', '#5fd08a', '#e8c040', '#f0f0f0', '#e86040'][i]]);
function ckTopPaint(x, w, h) {
  const t = (s, lx, ly, sz = 15, c = 'rgba(238,236,228,0.88)', al = 'center') => { x.fillStyle = c; x.font = `600 ${sz}px "Helvetica Neue", Arial, sans-serif`; x.textAlign = al; x.fillText(s, ckPX(lx), ckPY(ly)); };
  // dark recessed sub-panels
  const sub = (lx0, ly0, lx1, ly1) => { x.fillStyle = 'rgba(28,30,34,0.85)'; x.beginPath(); x.roundRect(ckPX(lx0), ckPY(ly1), ckPX(lx1) - ckPX(lx0), ckPY(ly0) - ckPY(ly1), 10); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = 2; x.stroke(); };
  sub(-1.02, -0.30, -0.02, -0.15); sub(0.03, -0.30, 1.02, -0.15); sub(0.03, -0.14, 0.62, -0.05);
  CK_TOGGLES.forEach(([lx, ly, s]) => { t(s, lx, ly - 0.055, 13); x.fillStyle = 'rgba(200,200,195,0.6)'; x.font = '600 10px Arial'; x.fillText('ON', ckPX(lx), ckPY(ly + 0.035)); });
  t('ENVIRONMENT', -0.75, -0.16, 12, 'rgba(244,184,74,0.9)'); t('PROPULSION', 0.30, -0.16, 12, 'rgba(244,184,74,0.9)');
  // the engine cutoff: a guarded red switch with a yellow-black hatch border
  const cx = ckPX(0.80), cy = ckPY(-0.095);
  for (let i = -6; i < 6; i++) { x.fillStyle = i % 2 ? '#e7b92c' : '#1d1d1d'; x.save(); x.beginPath(); x.rect(cx - 70, cy - 36, 140, 72); x.clip(); x.translate(cx + i * 22, cy); x.rotate(0.7); x.fillRect(-6, -80, 11, 160); x.restore(); }
  x.fillStyle = '#2a2c30'; x.fillRect(cx - 58, cy - 26, 116, 52);
  t('ENGINE CUTOFF', 0.80, -0.165, 14, '#f3d24a');
  // stencils and placards
  t('FLIGHT DECK  ·  MK II', -0.52, 0.29, 13, 'rgba(240,238,230,0.55)'); t('REAR CAM', 0.52, 0.29, 13, 'rgba(240,238,230,0.55)');
  x.fillStyle = 'rgba(255,255,255,0.75)'; x.fillRect(ckPX(-0.98), ckPY(-0.03), 150, 30); x.fillStyle = '#222'; x.font = '700 15px Arial'; x.textAlign = 'left'; x.fillText('NO STEP · HOT', ckPX(-0.98) + 8, ckPY(-0.03) + 21);
  // grime ring where a cup sits, finger wear around the switches
  x.strokeStyle = 'rgba(60,45,25,0.25)'; x.lineWidth = 6; x.beginPath(); x.arc(ckPX(-0.88), ckPY(0.02), 38, 0, TAU); x.stroke();
}

// ---------- a folded fabric tube from a to b (radius r0 -> r1), soft fold rings along it: sleeves, thighs, shins
function ckTube(a, b, r0, r1, mat, folds = 5, seed = 'tube') {
  const R = RNG(seed), d = b.clone().sub(a), L = d.length(), pts = [], N = 40;
  const fk = Array.from({ length: folds }, () => [R.r(0.1, 0.9), R.r(0.03, 0.07), R.r(0.6, 1.4)]);
  for (let i = 0; i <= N; i++) { const u = i / N; let r = lerp(r0, r1, u);
    for (const [c, w, a2] of fk) r *= 1 + 0.07 * a2 * Math.exp(-((u - c) * (u - c)) / (w * w * 0.5)) - 0.025 * a2 * Math.exp(-((u - c - w) * (u - c - w)) / (w * w * 0.2));
    const cap = Math.min(1, Math.sin(Math.min(1, u * 8) * Math.PI / 2), Math.sin(Math.min(1, (1 - u) * 8) * Math.PI / 2));
    pts.push(new THREE.Vector2(Math.max(0.002, r * (0.35 + 0.65 * cap)), u * L)); }
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), mat); m.geometry.translate(0, 0, 0);
  m.position.copy(a); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); m.castShadow = m.receiveShadow = true; return m;
}
// ---------- a gloved hand. Local: fingers point -Z, back of the hand +Y, thumb towards +X*side. curl 0..1 ----------
function ckGlove(side, curl, mats) {
  const g = new THREE.Group(), hg = new THREE.Group(), { glove, grip, ring, sleeve } = mats; g.add(hg); g.userData.hand = hg;
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), glove); palm.scale.set(0.052, 0.026, 0.06); palm.position.z = -0.02; hg.add(palm);
  const back = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), grip); back.scale.set(0.04, 0.012, 0.04); back.position.set(0, 0.02, -0.025); hg.add(back);   // a padded knuckle guard
  for (let f = 0; f < 4; f++) {
    const fx = (-0.033 + f * 0.022) * side, len = [0.03, 0.034, 0.032, 0.026][f];
    let parent = new THREE.Group(); parent.position.set(fx, 0.002, -0.07 + Math.abs(f - 1.5) * 0.005); parent.rotation.y = 0.05 * (f - 1.5) * side; hg.add(parent);
    for (let s = 0; s < 3; s++) {
      const l = len * [1, 0.8, 0.65][s], seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.0125 - s * 0.0008, l, 4, 10), s === 2 ? grip : glove);
      seg.rotation.x = -Math.PI / 2; seg.position.z = -l / 2;
      const joint = new THREE.Group(); joint.rotation.x = -curl * [0.55, 0.85, 0.7][s] - 0.08; joint.add(seg); parent.add(joint);
      const next = new THREE.Group(); next.position.z = -l - 0.004; joint.add(next); parent = next;
    }
  }
  const tb = new THREE.Group(); tb.position.set(0.045 * side, -0.006, -0.03); tb.rotation.set(-0.2 - curl * 0.3, 0.75 * side, 0); hg.add(tb);
  const th1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.03, 4, 10), glove); th1.rotation.x = -Math.PI / 2; th1.position.z = -0.02; tb.add(th1);
  const th2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.013, 0.022, 4, 10), grip); th2.rotation.x = -Math.PI / 2; th2.position.z = -0.05; tb.add(th2);
  // the wrist: gauntlet cuff, a blue disconnect ring, the sleeve running back
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.056, 0.07, 28, 1), glove); cuff.rotation.x = Math.PI / 2; cuff.position.z = 0.05; g.add(cuff);
  const rg = new THREE.Mesh(new THREE.TorusGeometry(0.057, 0.011, 12, 36), ring); rg.position.z = 0.09; g.add(rg);
  g.add(ckTube(V3(0, 0, 0.08), V3(0, -0.01, 0.46), 0.05, 0.064, sleeve, 6, 'sleeve' + side));
  const band = new THREE.Mesh(g3RBox(0.03, 0.05, 0.11, 0.01), grip); band.position.set(0, 0.055, 0.2); g.add(band);   // a wrist checklist band

  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

function ckBuild() {
  const scene = new THREE.Scene(), R = RNG('cockpit');
  const paintFront = ckPanelMat({ seed: 'front', base: '#bdb6a6', seamX: [0.16, 0.84], seamY: [0.12, 0.88], rep: [1, 1], wear: 320, paint: (x, w, h) => {
    // a mission emblem decal above the window, a hull number
    const cx = w * 0.5, cy = h * 0.235; x.fillStyle = '#22325a'; x.beginPath(); x.arc(cx, cy, 30, 0, TAU); x.fill(); x.strokeStyle = '#e2b02e'; x.lineWidth = 5; x.stroke();
    x.fillStyle = '#f2efe6'; x.beginPath(); x.moveTo(cx, cy - 20); x.lineTo(cx + 7, cy + 10); x.lineTo(cx - 7, cy + 10); x.fill(); x.fillStyle = '#e06a2a'; x.beginPath(); x.moveTo(cx - 4, cy + 11); x.lineTo(cx, cy + 22); x.lineTo(cx + 4, cy + 11); x.fill();
    x.fillStyle = 'rgba(30,30,30,0.55)'; x.font = '700 26px Arial'; x.textAlign = 'center'; x.fillText('A-14', w * 0.42, h * 0.245); x.fillText('1 G', w * 0.58, h * 0.245);
  } });
  const paintDark = ckPanelMat({ seed: 'dark', base: '#3b3f45', seamX: [], seamY: [], wear: 200, rough: 0.55 });
  const frameMat = ckPanelMat({ seed: 'frame', base: '#5c626a', wear: 380, chips: 120, metal: 0.35, rough: 0.45 });
  const topMat = ckPanelMat({ seed: 'top', base: '#43474e', w: 2048, h: 624, paint: ckTopPaint, wear: 500, chips: 90, seamY: [0.5], rivet: 60 });
  const lipMat = ckPanelMat({ seed: 'lip', base: '#33363b', seamX: [0.25, 0.5, 0.75], wear: 220, paint: (x, w, h) => {
    const R2 = RNG('vents'); x.fillStyle = 'rgba(10,10,12,0.8)'; for (let i = 0; i < 26; i++) x.fillRect(w * 0.06 + i * 14, h * 0.25, 7, h * 0.4);
    x.fillStyle = 'rgba(244,184,74,0.85)'; x.font = '700 26px Arial'; x.fillText('CAUTION · 1 G SUSTAINED', w * 0.55, h * 0.4); R2.f(); } });
  const quilt = ckQuiltMat(), brushed = ckBrushedMat(), black = new THREE.MeshStandardMaterial({ color: lin('#16171a'), roughness: 0.5, metalness: 0.3 });
  const shadowy = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

  // ---- the front wall with the window hole
  const hole = (s, w, h, r, cy) => { const x = -w / 2, y = cy - h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const wallS = new THREE.Shape(); wallS.absarc(0, 0.1, 1.62, 0, TAU, false); wallS.holes.push(hole(new THREE.Path(), CK_WIN.w, CK_WIN.h, CK_WIN.r, CK_WIN.y));
  const wallG = new THREE.ExtrudeGeometry(wallS, { depth: 0.04, bevelEnabled: false, curveSegments: 48 });
  { const p = wallG.attributes.position, uv = wallG.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 3.2 + 0.5, (p.getY(i) - 0.1) / 3.2 + 0.5); }
  const wall = shadowy(new THREE.Mesh(wallG, paintFront)); wall.position.z = CK_WIN.z - 0.04; scene.add(wall);
  // the window frame: a thick bevelled ring with bolts
  const frS = hole(new THREE.Shape(), CK_WIN.w + 0.2, CK_WIN.h + 0.2, CK_WIN.r + 0.08, CK_WIN.y); frS.holes.push(hole(new THREE.Path(), CK_WIN.w, CK_WIN.h, CK_WIN.r, CK_WIN.y));
  const frG = new THREE.ExtrudeGeometry(frS, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 5, curveSegments: 40 });
  { const p = frG.attributes.position, uv = frG.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2.2 + 0.5, p.getY(i) / 2.2 + 0.5); }
  const frame = shadowy(new THREE.Mesh(frG, frameMat)); frame.position.z = CK_WIN.z; scene.add(frame);
  // an inner reveal (the window's depth: the glass sits back in a tunnel)
  const revS = hole(new THREE.Shape(), CK_WIN.w + 0.002, CK_WIN.h + 0.002, CK_WIN.r, CK_WIN.y); revS.holes.push(hole(new THREE.Path(), CK_WIN.w - 0.03, CK_WIN.h - 0.03, CK_WIN.r - 0.015, CK_WIN.y));
  const rev = new THREE.Mesh(new THREE.ExtrudeGeometry(revS, { depth: 0.16, bevelEnabled: false, curveSegments: 40 }), black); rev.position.z = CK_WIN.z - 0.2; scene.add(rev);
  // bolts round the frame
  const bolts = [], bw = CK_WIN.w / 2 + 0.055, bh = CK_WIN.h / 2 + 0.055;
  for (let i = 0; i < 18; i++) { const u = (i + 0.5) / 18; bolts.push([lerp(-bw + 0.16, bw - 0.16, u), CK_WIN.y + bh], [lerp(-bw + 0.16, bw - 0.16, u), CK_WIN.y - bh]); }
  for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6; bolts.push([-bw, CK_WIN.y + lerp(-bh + 0.16, bh - 0.16, u)], [bw, CK_WIN.y + lerp(-bh + 0.16, bh - 0.16, u)]); }
  const boltG = new THREE.CylinderGeometry(0.011, 0.012, 0.012, 6); boltG.rotateX(Math.PI / 2);
  const BO = new THREE.InstancedMesh(boltG, brushed, bolts.length), M4 = new THREE.Matrix4();
  bolts.forEach(([bx, by], i) => { M4.makeRotationZ(R.r(0, 1)); M4.setPosition(bx, by, CK_WIN.z + 0.07); BO.setMatrixAt(i, M4); }); BO.castShadow = true; scene.add(BO);
  // the glass: a faint tint + smudges (normal blend) and the cracks (additive), both in the window plane
  const smudge = g3Tex((x, w, h) => { const R3 = RNG('smudge'); x.clearRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) { const px = R3.r(0, w), py = R3.r(0, h), r = R3.r(10, 60), g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,0.08)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(255,255,255,0.05)'); g.addColorStop(0.62, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 1024, 512);
  const glassG = new THREE.ShapeGeometry(hole(new THREE.Shape(), CK_WIN.w, CK_WIN.h, CK_WIN.r, CK_WIN.y), 24);
  { const p = glassG.attributes.position, uv = glassG.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / CK_WIN.w + 0.5, (p.getY(i) - CK_WIN.y) / CK_WIN.h + 0.5); }
  const glassM = new THREE.MeshBasicMaterial({ map: smudge, transparent: true, depthWrite: false, color: lin('#ffffff'), opacity: 1 });
  const glass = new THREE.Mesh(glassG, glassM); glass.position.z = CK_WIN.z - 0.01; glass.renderOrder = 10; scene.add(glass);
  const crackT = g3Tex((x, w, h) => {   // impact at lower-left: a white pit, radial cracks, concentric arcs
    const RC = RNG('crack'), cx = w * 0.30, cy = h * 0.70; x.clearRect(0, 0, w, h); x.lineCap = 'round';
    const gl = x.createRadialGradient(cx, cy, 0, cx, cy, 34); gl.addColorStop(0, 'rgba(255,255,255,0.95)'); gl.addColorStop(0.5, 'rgba(230,240,255,0.5)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(cx - 40, cy - 40, 80, 80);
    const rays = [];
    for (let i = 0; i < 17; i++) { let a = i / 17 * TAU + RC.r(-0.15, 0.15), px = cx, py = cy, L = RC.r(120, 520); const pts = [[px, py]];
      for (let s = 0; s < 14; s++) { a += RC.r(-0.18, 0.18); const st = L / 14; px += Math.cos(a) * st; py += Math.sin(a) * st * 0.9; pts.push([px, py]); }
      rays.push(pts);
      for (const [lw, al] of [[3.2, 0.18], [1.2, 0.85]]) { x.strokeStyle = `rgba(235,245,255,${al})`; x.lineWidth = lw; x.beginPath(); pts.forEach(([qx, qy], k) => (k ? x.lineTo(qx, qy) : x.moveTo(qx, qy))); x.stroke(); }
      // little branches
      for (let b = 0; b < 3; b++) { const k = 3 + Math.floor(RC.r(0, 9)), [bx, by] = pts[k]; let ba = a + RC.r(-1, 1); x.strokeStyle = 'rgba(235,245,255,0.5)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(bx, by);
        let qx = bx, qy = by; for (let s = 0; s < 5; s++) { ba += RC.r(-0.3, 0.3); qx += Math.cos(ba) * 14; qy += Math.sin(ba) * 14; x.lineTo(qx, qy); } x.stroke(); }
    }
    for (const rr of [26, 52, 90, 140]) { x.strokeStyle = 'rgba(230,240,255,0.55)'; x.lineWidth = 1; for (let i = 0; i < 17; i++) { if (RC.f() < 0.35) continue; const a0 = i / 17 * TAU, a1 = a0 + TAU / 17;
      x.beginPath(); for (let s = 0; s <= 6; s++) { const a = lerp(a0, a1, s / 6), r = rr * (1 + RC.r(-0.08, 0.08)); s ? x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9) : x.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9); } x.stroke(); } }
  }, 2048, 1024);
  const crackM = new THREE.MeshBasicMaterial({ map: crackT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false });
  const crack = new THREE.Mesh(glassG, crackM); crack.position.z = CK_WIN.z - 0.005; crack.renderOrder = 11; scene.add(crack);

  // ---- the conical shell (quilted blankets) with ribs, and side equipment walls
  const shellG = new THREE.CylinderGeometry(1.62, 1.95, 2.8, 72, 1, true); shellG.rotateX(-Math.PI / 2);
  const shell = shadowy(new THREE.Mesh(shellG, quilt)); quilt.side = THREE.BackSide; shell.position.set(0, 0.1, CK_WIN.z + 1.4); scene.add(shell);
  for (const z of [-1.1, -0.55, 0.0]) { const r = lerp(1.62, 1.95, (z - CK_WIN.z) / 2.8) - 0.03; const rib = shadowy(new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 10, 96), frameMat)); rib.position.set(0, 0.1, z); scene.add(rib); }
  // side consoles: angled panels left and right with breaker rows (wrap the pilot)
  const sidePanel = (sx) => {
    const grp = new THREE.Group();
    const p = shadowy(new THREE.Mesh(g3RBox(0.9, 0.95, 0.06, 0.03), ckPanelMat({ seed: 'side' + sx, base: '#a9a69b', seamX: [0.5], seamY: [0.33, 0.66], wear: 260, paint: (x, w, h) => {
      x.fillStyle = 'rgba(30,32,36,0.85)'; for (let r = 0; r < 3; r++) { x.beginPath(); x.roundRect(w * 0.08, h * (0.08 + r * 0.31), w * 0.84, h * 0.22, 14); x.fill(); }
      x.fillStyle = 'rgba(240,238,230,0.85)'; x.font = '600 22px Arial'; x.textAlign = 'center';
      for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) x.fillText(['CB', 'PWR', 'AUX', 'LT'][((i + r) % 4)] + ' ' + (r * 8 + i + 1), w * (0.14 + i * 0.103), h * (0.27 + r * 0.31));
      x.fillStyle = 'rgba(244,184,74,0.9)'; x.font = '700 24px Arial'; x.fillText(sx < 0 ? 'CIRCUIT BREAKERS · PANEL L' : 'CIRCUIT BREAKERS · PANEL R', w / 2, h * 0.985);
      for (let i = 0; i < 30; i++) { x.fillStyle = i % 2 ? '#e2b02e' : '#1d1d1d'; x.save(); x.beginPath(); x.rect(0, 0, w, h * 0.035); x.clip(); x.translate(i * 40, 0); x.transform(1, 0, -0.8, 1, 0, 0); x.fillRect(0, 0, 20, h * 0.035); x.restore(); }
      x.fillStyle = '#c8362a'; x.fillRect(w * (sx < 0 ? 0.62 : 0.1), h * 0.012, w * 0.28, h * 0.05); x.fillStyle = '#fff'; x.font = '700 26px Arial'; x.fillText(sx < 0 ? 'FIRE SUPPR.' : 'EGRESS ▶', w * (sx < 0 ? 0.76 : 0.24), h * 0.05); } })));
    grp.add(p);
    const cbG = new THREE.CylinderGeometry(0.012, 0.014, 0.022, 14); cbG.rotateX(Math.PI / 2);
    const CB = new THREE.InstancedMesh(cbG, black, 24);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) { M4.makeTranslation(-0.45 + 0.9 * (0.14 + i * 0.103), 0.475 - 0.95 * (0.18 + r * 0.31), 0.04); CB.setMatrixAt(r * 8 + i, M4); }
    CB.castShadow = true; grp.add(CB);
    grp.position.set(sx * 1.22, -0.16, -0.95); grp.rotation.set(-0.35, -sx * 0.95, 0, 'YXZ'); scene.add(grp);
    return grp;
  };
  sidePanel(-1); sidePanel(1);
  // a red extinguisher strapped to the right wall, a bundle of cables up the left wall
  const ext = shadowy(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.26, 8, 24), new THREE.MeshStandardMaterial({ color: lin('#b8241c'), roughness: 0.35, metalness: 0.1 })));
  ext.position.set(1.18, 0.45, -0.75); ext.rotation.z = 0.25; scene.add(ext);
  for (let i = 0; i < 6; i++) { const c = new THREE.CatmullRomCurve3([V3(-1.45 + i * 0.03, -0.6, -0.9), V3(-1.38 + i * 0.03, 0.2, -1.2), V3(-1.0 + i * 0.03, 1.0, -1.35), V3(-0.4, 1.45 + i * 0.02, -1.4)]);
    const cab = shadowy(new THREE.Mesh(new THREE.TubeGeometry(c, 48, 0.012, 8), new THREE.MeshStandardMaterial({ color: lin(['#2a2b2e', '#3d4a5e', '#2a2b2e', '#6d3326', '#2a2b2e', '#c8c2b0'][i]), roughness: 0.6 }))); scene.add(cab); }
  // a ceiling lamp (warm) above the window
  const lampBox = new THREE.Mesh(g3RBox(0.42, 0.05, 0.08, 0.02), frameMat); lampBox.position.set(0, 0.78, -1.45); scene.add(lampBox);
  const lampFace = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.022), new THREE.MeshBasicMaterial({ color: lin('#ffd9a0'), toneMapped: false })); lampFace.position.set(0, 0.752, -1.44); lampFace.rotation.x = Math.PI / 2; scene.add(lampFace);

  // ---- the console: sloping top (labels, switches), a dark body, the front lip
  const top = new THREE.Group(); top.position.set(0, -0.45, -1.20); top.rotation.x = -69.9 * DEG; scene.add(top);
  const topSlab = shadowy(new THREE.Mesh(g3RBox(CK_TOP.w, CK_TOP.h, 0.05, 0.02), topMat)); top.add(topSlab);
  const body = shadowy(new THREE.Mesh(g3RBox(2.1, 0.62, 0.66, 0.04), paintDark)); body.position.set(0, -0.82, -1.25); scene.add(body);
  const lip = shadowy(new THREE.Mesh(g3RBox(2.1, 0.30, 0.05, 0.02), lipMat)); lip.position.set(0, -0.70, -0.89); scene.add(lip);
  // a grab rail along the console's near edge
  const rail = shadowy(new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 1.5, 6, 16), brushed)); rail.rotation.z = Math.PI / 2; rail.position.set(0, -0.565, -0.89); scene.add(rail);
  for (const rx of [-0.74, 0.74]) { const st = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 10), brushed)); st.position.set(rx, -0.585, -0.9); scene.add(st); }
  // toggles: a plate, a chrome bat; the cutoff guard
  const plateG = g3RBox(0.05, 0.07, 0.008, 0.006), batG = new THREE.CylinderGeometry(0.0035, 0.0055, 0.032, 10);
  const PL = new THREE.InstancedMesh(plateG, brushed, CK_TOGGLES.length), BT = new THREE.InstancedMesh(batG, brushed, CK_TOGGLES.length), Qb = new THREE.Quaternion();
  CK_TOGGLES.forEach(([lx, ly], i) => { M4.makeTranslation(lx, ly, 0.03); PL.setMatrixAt(i, M4);
    Qb.setFromEuler(new THREE.Euler(Math.PI / 2 + (i % 5 === 2 ? -0.5 : 0.5), 0, 0)); M4.compose(V3(lx, ly, 0.045), Qb, V3(1, 1, 1)); BT.setMatrixAt(i, M4); });
  PL.castShadow = BT.castShadow = true; top.add(PL, BT);
  const BU = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.016, 0.017, 0.014, 20).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, emissive: lin('#ffffff'), emissiveIntensity: 0.0 }), CK_BUTTONS.length);
  CK_BUTTONS.forEach(([lx, ly, c], i) => { M4.makeTranslation(lx, ly, 0.032); BU.setMatrixAt(i, M4); BU.setColorAt(i, lin(c)); }); top.add(BU);
  const BUglow = new THREE.InstancedMesh(new THREE.CircleGeometry(0.012, 18), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.9 }), CK_BUTTONS.length);
  CK_BUTTONS.forEach(([lx, ly, c], i) => { M4.makeTranslation(lx, ly, 0.04); BUglow.setMatrixAt(i, M4); BUglow.setColorAt(i, lin(c)); }); top.add(BUglow);
  const cutBat = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.009, 0.05, 12), new THREE.MeshStandardMaterial({ color: lin('#c8231c'), roughness: 0.35 })));
  cutBat.position.set(0.80, -0.095, 0.05); cutBat.rotation.x = Math.PI / 2 - 0.5; top.add(cutBat);
  const guard = new THREE.Mesh(g3RBox(0.11, 0.08, 0.05, 0.01), new THREE.MeshPhysicalMaterial({ color: lin('#ff5a3a'), roughness: 0.15, transparent: true, opacity: 0.38, metalness: 0 }));
  guard.position.set(0.80, -0.095, 0.05); guard.rotation.x = -0.9; top.add(guard);
  // knobs with knurled skirts
  const knurl = g3Mat('knurl', (x, w, h) => { x.fillStyle = '#222326'; x.fillRect(0, 0, w, h); x.fillStyle = '#3c3e43'; for (let i = 0; i < w; i += 6) x.fillRect(i, 0, 3, h); x.fillStyle = '#e8e4d8'; x.fillRect(0, 0, 5, h); },
    (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; for (let i = 0; i < w; i += 6) x.fillRect(i, 0, 3, h); }, { w: 128, h: 32, roughness: 0.5, bumpScale: 0.002 });
  for (const [lx, ly] of [[-0.95, 0.05], [-0.95, -0.08], [0.95, 0.06], [0.95, -0.07]]) { const k = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.03, 32), knurl)); k.rotation.x = Math.PI / 2; k.position.set(lx, ly, 0.04); top.add(k); }

  // ---- the three screens on raised bezels, tilted up towards the pilot
  const mkScreen = (lx, ly, w, h, tilt, cw, chh) => {
    const grp = new THREE.Group(); grp.position.set(lx, ly, 0.03); grp.rotation.x = tilt; top.add(grp);
    const bez = shadowy(new THREE.Mesh(g3RBox(w + 0.05, h + 0.05, 0.04, 0.018), paintDark)); bez.position.set(0, h / 2, 0.0); grp.add(bez);
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = chh; const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, h / 2, 0.021); grp.add(scr);
    // a glass sheen over the screen
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: smudge, transparent: true, opacity: 0.5, depthWrite: false })); sh.position.set(0, h / 2, 0.022); grp.add(sh);
    // a hood over the top edge
    const hood = shadowy(new THREE.Mesh(g3RBox(w + 0.05, 0.05, 0.012, 0.005), paintDark)); hood.position.set(0, h + 0.03, 0.03); hood.rotation.x = 0.9; grp.add(hood);
    return { grp, cv, cx: cv.getContext('2d'), tex, scr };
  };
  const scrL = mkScreen(-0.55, 0.0, 0.40, 0.25, 0.62, 640, 400);
  const scrC = mkScreen(-0.02, 0.06, 0.22, 0.15, 0.62, 352, 240);
  const scrR = mkScreen(0.52, -0.02, 0.46, 0.29, 0.40, 736, 464);
  // ---- the photo, taped flat on the console, in front of the left screen
  const photo = shadowy(new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.1125), new THREE.MeshStandardMaterial({ map: ckPhotoTex(), roughness: 0.42, metalness: 0 })));
  photo.position.set(-0.26, -0.085, 0.029); photo.rotation.z = 0.09; top.add(photo);
  const tapeT = ckTapeTex();
  for (const [tx, ty, tr] of [[-0.065, 0.052, 0.6], [0.068, 0.05, -0.5], [0.0, -0.058, 0.05]]) { const tp = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.018), new THREE.MeshStandardMaterial({ map: tapeT, transparent: true, roughness: 0.3 }));
    tp.position.set(tx, ty, 0.0008); tp.rotation.z = tr; photo.add(tp); }
  // ---- a charm hanging from the window frame (it hangs straight down the whole trip: 1 g)
  const charm = new THREE.Group(); charm.position.set(0.16, CK_WIN.y + CK_WIN.h / 2 + 0.02, CK_WIN.z + 0.08); scene.add(charm);
  const str = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.16, 6), new THREE.MeshStandardMaterial({ color: lin('#c23a2e'), roughness: 0.8 })); str.position.y = -0.08; charm.add(str);
  const shell2 = shadowy(new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 16), new THREE.MeshStandardMaterial({ color: lin('#f0d9b8'), roughness: 0.35 }))); shell2.scale.set(1, 0.75, 0.45); shell2.position.y = -0.175; charm.add(shell2);  // a seashell

  // ---- the pilot: knees (reclined seat), thighs, gloved hands (left on the knee, right on the stick)
  const suit = ckFabricMat('#dcd8cf', 'suit', { seams: [0.3, 0.72], rep: [2, 2] }), pad = ckFabricMat('#b9bbbd', 'kneepad', { seams: [0.5], rep: [1, 1] });
  const patch = ckFabricMat('#dcd8cf', 'patch', { seams: [], paint: (x, w, h, bump) => {
    const cx = w / 2, cy = h / 2; x.fillStyle = bump ? '#fff' : '#22325a'; x.beginPath(); x.arc(cx, cy, w * 0.32, 0, TAU); x.fill();
    if (!bump) { x.strokeStyle = '#e9c45a'; x.lineWidth = 10; x.stroke(); x.fillStyle = '#f2efe6'; x.beginPath(); x.moveTo(cx, cy - 70); x.lineTo(cx + 22, cy + 30); x.lineTo(cx - 22, cy + 30); x.fill();
      x.fillStyle = '#e06a2a'; x.beginPath(); x.moveTo(cx - 14, cy + 32); x.lineTo(cx, cy + 74); x.lineTo(cx + 14, cy + 32); x.fill(); x.fillStyle = '#e9c45a'; x.font = '700 30px Arial'; x.textAlign = 'center'; x.fillText('1 G', cx, cy + 118 > h ? cy + 100 : cy + 112); } } });
  const legs = new THREE.Group(); scene.add(legs);
  for (const sx of [-1, 1]) {
    const hip = V3(sx * 0.17, -0.72, 0.02), knee = V3(sx * 0.30, -0.52, -0.68), foot = V3(sx * 0.34, -1.1, -0.86);
    legs.add(ckTube(hip, knee, 0.095, 0.082, suit, 6, 'thigh' + sx), ckTube(knee, foot, 0.08, 0.068, suit, 5, 'shin' + sx));
    const kn = shadowy(new THREE.Mesh(new THREE.SphereGeometry(0.083, 28, 20), suit)); kn.position.copy(knee); legs.add(kn);
    // the knee pad: a padded, stitched shell over the kneecap
    const kp = shadowy(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18, 0, TAU, 0, Math.PI * 0.55), pad)); kp.scale.set(0.072, 0.05, 0.072);
    kp.position.copy(knee).add(V3(0, 0.035, 0.0)); kp.lookAt(knee.clone().add(V3(0, 1, 0.55))); kp.rotateX(Math.PI / 2); legs.add(kp);
    // two straps with buckles round the thigh, a pocket with a flap and a pen on the outside
    for (const u of [0.28, 0.62]) { const c = lerp3(hip, knee, u), st2 = shadowy(new THREE.Mesh(new THREE.TorusGeometry(0.094 - u * 0.01, 0.008, 8, 40), black)); st2.position.copy(c); st2.lookAt(knee); legs.add(st2);
      const bk = shadowy(new THREE.Mesh(g3RBox(0.03, 0.022, 0.012, 0.004), brushed)); bk.position.copy(c).add(V3(sx * 0.03, 0.088, 0)); bk.lookAt(bk.position.clone().add(V3(0, 1, 0.3))); legs.add(bk); }
    const pc = lerp3(hip, knee, 0.45).add(V3(sx * 0.065, 0.06, 0)), pk = shadowy(new THREE.Mesh(g3RBox(0.11, 0.13, 0.025, 0.012), sx < 0 ? patch : suit)); pk.position.copy(pc); pk.lookAt(pc.clone().add(V3(sx * 0.7, 1, 0.25))); legs.add(pk);
    const flap = shadowy(new THREE.Mesh(g3RBox(0.115, 0.04, 0.012, 0.008), pad)); flap.position.set(0, 0.05, 0.016); pk.add(flap);
    if (sx > 0) { const pen = shadowy(new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.07, 4, 10), new THREE.MeshStandardMaterial({ color: lin('#2a3c6e'), roughness: 0.3 }))); pen.position.set(0.03, 0.06, 0.02); pk.add(pen); }
  }
  // the stick: a rubber bellows boot, a grip with a red button
  const boot = shadowy(new THREE.Mesh(new THREE.LatheGeometry(Array.from({ length: 16 }, (_, i) => new THREE.Vector2(0.045 - i * 0.0018 + (i % 2) * 0.006, i * 0.006)), 32), black));
  boot.position.set(0.50, -0.60, -0.80); scene.add(boot);
  const grip = shadowy(new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.09, 8, 20), new THREE.MeshStandardMaterial({ color: lin('#222428'), roughness: 0.6 }))); grip.position.set(0.50, -0.49, -0.80); grip.rotation.x = -0.12; scene.add(grip);
  const gbtn = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 16), new THREE.MeshStandardMaterial({ color: lin('#c8231c'), roughness: 0.3 })); gbtn.position.set(0.50, -0.43, -0.81); scene.add(gbtn);
  const gm = { glove: ckFabricMat('#eceae4', 'glove', { seams: [0.5], rep: [1, 1] }), grip: new THREE.MeshStandardMaterial({ color: lin('#5a5e66'), roughness: 0.75 }),
    ring: new THREE.MeshStandardMaterial({ color: lin('#3c6fc4'), roughness: 0.25, metalness: 0.7 }), sleeve: suit };
  const handL = ckGlove(-1, 0.95, gm), handR = ckGlove(1, 1.0, gm), handP = ckGlove(-1, 0.12, gm); scene.add(handL, handR, handP);
  // the throttle on the left: a quadrant box, a lever, a T-handle
  const quad = shadowy(new THREE.Mesh(g3RBox(0.09, 0.07, 0.16, 0.015), paintDark)); quad.position.set(-0.50, -0.585, -0.84); scene.add(quad);
  const lever = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 12), brushed)); lever.position.set(-0.50, -0.51, -0.83); lever.rotation.x = -0.2; scene.add(lever);
  const tH = shadowy(new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.07, 6, 16), black)); tH.rotation.z = Math.PI / 2; tH.position.set(-0.50, -0.455, -0.82); scene.add(tH);
  // ---- lights: the window's light (shadowed), a hemisphere fill, the warm lamp, the screens' glow, a reading lamp on the photo
  const key = new THREE.DirectionalLight(0xffffff, 3); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 5; key.shadow.blurSamples = 12; key.shadow.bias = -0.0006;
  Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.1, far: 12 });
  key.target.position.set(0, -0.4, -0.8); scene.add(key, key.target);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x333333, 0.6); scene.add(hemi);
  const lamp = new THREE.PointLight(lin('#ffcf94'), 0.5, 3.2, 2); lamp.position.set(0, 0.7, -1.3); scene.add(lamp);
  const glowL = new THREE.PointLight(lin('#7fe0c8'), 0.25, 1.4, 2); glowL.position.set(-0.55, -0.15, -1.0); scene.add(glowL);
  const glowR = new THREE.PointLight(lin('#9cc4ff'), 0.25, 1.4, 2); glowR.position.set(0.55, -0.15, -1.0); scene.add(glowR);
  const read = new THREE.SpotLight(lin('#ffd29a'), 0, 2.0, 0.22, 0.7, 2); read.position.set(-0.30, 0.30, -0.95); read.target = photo; scene.add(read);
  CK = { scene, key, hemi, lamp, glowL, glowR, read, glassM, crackM, scrL, scrC, scrR, handL, handR, handP, photo, BUglow, charm, top };
}
const lerp3 = (a, b, u) => a.clone().lerp(b, u);

// ---------- the screens (2D, every frame) ----------
function ckFmtT(s) { const a = Math.abs(Math.round(s)), m = Math.floor(a / 60), ss2 = a % 60; return `${String(m).padStart(2, '0')}:${String(ss2).padStart(2, '0')}`; }
function ckScan(x, w, h, tint) {   // scanlines, a vignette, a faint reflection
  x.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < h; y += 3) x.fillRect(0, y, w, 1);
  const g = x.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
}
function ckScreenL(st) {   // countdown before liftoff, then speed (log) with a trace
  const { cx: x, cv } = CK.scrL, w = cv.width, h = cv.height, tau = shipTau(st);
  x.fillStyle = '#06100e'; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(90,220,180,0.12)'; x.lineWidth = 1; for (let i = 0; i < w; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let i = 0; i < h; i += 40) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
  x.fillStyle = '#7fe8c8'; x.font = '600 22px "Consolas", "Courier New", monospace'; x.textAlign = 'left'; x.fillText(tau < 0 ? 'LAUNCH SEQUENCE' : 'VELOCITY', 24, 38);
  const AL = ckAlarm(st) ? ckMsg(st) : null;
  if (AL) {   // a full-screen warning
    const on = Math.floor(st * 3) % 2; x.fillStyle = on ? '#3a0806' : '#180403'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ff5a40'; x.textAlign = 'center'; x.font = '800 64px Arial'; x.fillText(AL[2], w / 2, h * 0.48); x.font = '800 54px Arial'; x.fillText(AL[3], w / 2, h * 0.75);
    for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#e2b02e' : '#111'; x.save(); x.beginPath(); x.rect(0, 0, w, 22); x.rect(0, h - 22, w, 22); x.clip(); x.translate(i * 48, 0); x.transform(1, 0, -0.9, 1, 0, 0); x.fillRect(0, 0, 24, h); x.restore(); }
    ckScan(x, w, h); CK.scrL.tex.needsUpdate = true; return;
  }
  if (tau < 0) {
    const blink = (Math.floor(st * 2) % 2) ? 1 : 0.75;
    x.fillStyle = `rgba(255,190,80,${blink})`; x.font = '700 150px "Consolas", "Courier New", monospace'; x.textAlign = 'center'; x.shadowColor = 'rgba(255,170,60,0.8)'; x.shadowBlur = 18;
    x.fillText('T-' + ckFmtT(tau), w / 2, h * 0.64); x.shadowBlur = 0;
    x.fillStyle = '#7fe8c8'; x.font = '600 22px "Consolas", monospace';
    const items = [['DELUGE', st > LIFTOFF - 10], ['IGNITION', st > LIFTOFF - 3], ['CLAMPS', false]];
    items.forEach(([s, on], i) => { x.fillStyle = on ? '#7fe8c8' : 'rgba(127,232,200,0.35)'; x.fillText((on ? '■ ' : '□ ') + s, 110 + i * 210, h - 34); });
  } else {
    // the speed trace on a log axis, 1 m/s .. c
    x.strokeStyle = '#7fe8c8'; x.lineWidth = 3; x.beginPath();
    for (let i = 0; i <= 120; i++) { const s = LIFTOFF + (st - LIFTOFF) * i / 120, v = speedOf(shipTau(s)), px = 30 + i / 120 * (w - 60), py = h - 40 - clamp(Math.log10(Math.max(1, v)) / Math.log10(CLIGHT)) * (h - 120); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
    x.fillStyle = '#d8fff2'; x.font = '700 46px "Consolas", monospace'; x.textAlign = 'right';
    const v = speedOf(tau), ob = oneMinusBeta(tau);
    x.fillText(v < 1e4 ? hdNum(v * 3.6) + ' KM/H' : v < 0.01 * CLIGHT ? hdNum(v / 1000) + ' KM/S' : (ob < 1e-4 ? '99.99…' : (100 * (1 - ob)).toFixed(ob < 1e-2 ? 4 : 2)) + ' % C', w - 24, 92);
    x.fillStyle = 'rgba(127,232,200,0.7)'; x.font = '600 20px "Consolas", monospace'; x.fillText('ACCEL 1.00 G  ·  THRUST ' + (Math.floor(st * 3) % 2 ? '100%' : '100%'), w - 24, 126);
    x.textAlign = 'left'; x.fillText('c', 14, 92);
  }
  ckScan(x, w, h); CK.scrL.tex.needsUpdate = true;
}
// messages the ship puts up: [t0, t1, title, sub, colour]
const CK_MSG = [[90.2, 96.6, 'ENGINE CUTOFF', 'FAILED', '#ff4a3a'], [96.6, 106, 'NEW RECORD', 'FASTEST HUMANS', '#f4b84a'], [250, 265, 'RADIATION', 'HIGH · RISING', '#ff4a3a'],
  [294, 312, 'DUST AHEAD', 'IMPACT RISK', '#f4b84a'], [326.2, 342, 'IMPACT', 'HULL HOLDING', '#ff4a3a'], [378, 394, 'GALACTIC CENTRE', '26,000 LY', '#f4b84a'],
  [438, 454, 'ANDROMEDA', '2.5 MILLION LY', '#9cc4ff'], [484, 498, 'SOL', 'RED GIANT', '#ff6a3a']];
const ckMsg = (st) => TEASER() ? [0, 9, ['HULL BREACH', 'RADIATION', 'NO CUTOFF'][Math.floor(TT * 1.5) % 3], 'WARNING', '#ff4a3a'] : (st > 343 && st < 456 && stressHit(st) > 0.2) ? [0, 9, radFlash(st) > 0 || Math.floor(st) % 2 ? 'RADIATION' : 'HULL STRESS', 'WARNING', '#ff4a3a'] : CK_MSG.find(([a, b]) => st >= a && st < b);
const CK_ALARM = [[90.5, 96.5], [252, 264], [326.2, 334]];
const ckAlarm = (st) => TEASER() || CK_ALARM.some(([a, b]) => st >= a && st < b);
function ckScreenC(st) {   // nav: an attitude ball, or the ship's message of the moment
  const { cx: x, cv } = CK.scrC, w = cv.width, h = cv.height, tau = shipTau(st), M = ckMsg(st);
  if (M) { const blink = M[4] === '#ff4a3a' ? 0.65 + 0.35 * (Math.floor(st * 3) % 2) : 1;
    x.fillStyle = '#0a0606'; x.fillRect(0, 0, w, h); x.strokeStyle = M[4]; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20);
    x.globalAlpha = blink; x.fillStyle = M[4]; x.textAlign = 'center'; x.font = `800 ${M[2].length > 11 ? 34 : 44}px Arial`; x.fillText(M[2], w / 2, h * 0.46);
    x.font = '700 28px Arial'; x.fillText(M[3], w / 2, h * 0.74); x.globalAlpha = 1; ckScan(x, w, h); CK.scrC.tex.needsUpdate = true; return; }
  x.fillStyle = '#070b14'; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(140,180,255,0.6)'; x.lineWidth = 2; x.beginPath(); x.arc(w / 2, h / 2 + 10, 72, 0, TAU); x.stroke();
  x.save(); x.beginPath(); x.arc(w / 2, h / 2 + 10, 70, 0, TAU); x.clip(); x.fillStyle = '#26406e'; x.fillRect(0, 0, w, h); x.fillStyle = '#6b4a2a'; x.fillRect(0, h / 2 + 10 + Math.sin(st * 0.3) * 6, w, h); x.restore();
  x.strokeStyle = '#ffd27a'; x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2 - 40, h / 2 + 10); x.lineTo(w / 2 - 12, h / 2 + 10); x.moveTo(w / 2 + 12, h / 2 + 10); x.lineTo(w / 2 + 40, h / 2 + 10); x.stroke();
  x.fillStyle = '#a8c4ff'; x.font = '600 18px "Consolas", monospace'; x.textAlign = 'left'; x.fillText('ATT', 14, 28); x.textAlign = 'right'; x.fillText(tau < 0 ? 'HOLD' : 'PROGRADE', w - 14, 28);
  ckScan(x, w, h); CK.scrC.tex.needsUpdate = true;
}
let CK_GAL = null;
function ckGalaxy(w, h) {   // the Milky Way from outside: a barred spiral, gold core, blue arms with pink knots, dust lanes (drawn once)
  if (CK_GAL) return CK_GAL; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), R = RNG('galaxy');
  x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 500; k++) { x.fillStyle = `rgba(255,255,255,${R.r(0.1, 0.6)})`; x.fillRect(R.r(0, w), R.r(0, h), 1, 1); }
  x.save(); x.translate(w / 2, h / 2); x.scale(1, 0.62); x.rotate(-0.35);
  const Rg = h * 0.62;
  let g = x.createRadialGradient(0, 0, 0, 0, 0, Rg); g.addColorStop(0, 'rgba(255,236,190,0.95)'); g.addColorStop(0.12, 'rgba(255,214,150,0.6)'); g.addColorStop(0.4, 'rgba(150,160,210,0.16)'); g.addColorStop(1, 'rgba(60,70,120,0)');
  x.fillStyle = g; x.fillRect(-Rg, -Rg, 2 * Rg, 2 * Rg);
  x.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 9000; k++) {
    const arm = k % 2, t = Math.pow(R.f(), 0.8) * 3.6, a = t * 1.25 + arm * Math.PI + R.n(0.5) * 0.28, r = (0.1 + t / 3.6) * Rg * 0.95 + R.n(0.5) * 6;
    const px = Math.cos(a) * r, py = Math.sin(a) * r, blue = t > 0.9;
    x.fillStyle = blue ? (R.f() < 0.06 ? 'rgba(255,140,190,0.55)' : `rgba(${150 + R.r(0, 60)},${180 + R.r(0, 50)},255,${R.r(0.12, 0.4)})`) : `rgba(255,220,160,${R.r(0.1, 0.35)})`;
    const s = R.r(0.6, 2.2); x.fillRect(px, py, s, s);
  }
  x.fillStyle = 'rgba(255,230,180,0.5)'; x.save(); x.rotate(0.4); x.beginPath(); x.ellipse(0, 0, Rg * 0.2, Rg * 0.06, 0, 0, TAU); x.fill(); x.restore();
  x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(20,10,5,0.35)'; x.lineWidth = 3; for (const arm of [0, 1]) { x.beginPath(); for (let t = 0.3; t < 3.4; t += 0.05) { const a = t * 1.25 + arm * Math.PI - 0.12, r = (0.1 + t / 3.6) * Rg * 0.93; t === 0.3 ? x.moveTo(Math.cos(a) * r, Math.sin(a) * r) : x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.stroke(); }
  x.restore();
  CK_GAL = c; return c;
}
function ckScreenR(st) {   // the REAR CAM: what's behind you
  const { cx: x, cv } = CK.scrR, w = cv.width, h = cv.height, tau = shipTau(st), R = RNG('rear');
  x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  if (st < 75) {   // the tail camera looks straight down the hull at the pad: concrete, the flame trench, the steam
    const alt = distOf(tau), k = clamp(Math.log10(1 + alt) / 4), ps = lerp(210, 14, k), cx = w * 0.56, cy = h * 0.55, ign = ss(LIFTOFF - 4, LIFTOFF, st);
    let g = x.createRadialGradient(cx, cy, 0, cx, cy, w * 0.8); g.addColorStop(0, '#76805f'); g.addColorStop(1, '#4b5340'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(200,196,180,0.6)'; x.lineWidth = Math.max(1, ps * 0.04); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx - ps * 0.3, h); x.stroke();   // the crawlerway
    x.fillStyle = '#b4b0a3'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.39; x.lineTo(cx + Math.cos(a) * ps, cy + Math.sin(a) * ps); } x.fill();
    x.strokeStyle = 'rgba(80,78,72,0.5)'; x.lineWidth = 1; for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(cx + i * ps * 0.25, cy - ps); x.lineTo(cx + i * ps * 0.25, cy + ps); x.stroke(); }
    x.fillStyle = '#1e1e1e'; x.fillRect(cx - ps * 0.16, cy - ps * 0.85, ps * 0.32, ps * 1.7);   // the flame trench
    x.fillStyle = '#5d6670'; x.fillRect(cx - ps * 0.95, cy - ps * 0.5, ps * 0.28, ps * 0.28);  // the tower base
    // engine glow and steam boiling out of the trench
    const fl = x.createRadialGradient(cx, cy, 0, cx, cy, ps * 0.6); fl.addColorStop(0, `rgba(255,${Math.round(200 + 50 * (1 - ign))},140,${0.9 * ign})`); fl.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = fl; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), side = R.f() < 0.5 ? -1 : 1, r = (0.3 + R.f()) * ps * (0.8 + ign * 1.2), px = cx + Math.cos(a) * r * 0.5, py = cy + side * r * 0.9 + Math.sin(st * 0.7 + i) * 3, s = R.r(0.25, 0.6) * ps * (0.6 + ign * 0.8);
      const gg = x.createRadialGradient(px - s * 0.2, py - s * 0.2, 0, px, py, s); gg.addColorStop(0, `rgba(255,${Math.round(252 - ign * 40)},${Math.round(248 - ign * 80)},0.55)`); gg.addColorStop(0.7, 'rgba(225,225,228,0.25)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(px - s, py - s, 2 * s, 2 * s); }
    // the hull edge (curved, riveted) on the left of the picture
    g = x.createLinearGradient(0, 0, w * 0.2, 0); g.addColorStop(0, '#e4e4e0'); g.addColorStop(0.75, '#a2a4a6'); g.addColorStop(1, '#55575b'); x.fillStyle = g; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(w * 0.22, h * 0.5, 0, h); x.fill();
    x.fillStyle = 'rgba(60,60,64,0.6)'; for (let i = 1; i < 12; i++) { const yy = i / 12 * h, xx = w * 0.22 * (1 - Math.pow(2 * yy / h - 1, 2)) * 0.5 - 8; x.beginPath(); x.arc(xx, yy, 2.5, 0, TAU); x.fill(); }
  } else if (st < 400) {   // black, stars, the Earth (and the Moon) shrinking behind
    for (let k = 0; k < 260; k++) { x.fillStyle = `rgba(255,255,255,${R.r(0.15, 0.8)})`; x.fillRect(R.r(0, w), R.r(0, h), 1.5, 1.5); }
    const d = distOf(tau), r = clamp(6.371e6 / Math.max(d, 1) * 900, 4, 160);
    const ex = w * 0.5, ey = h * 0.52;
    const g = x.createRadialGradient(ex - r * 0.35, ey - r * 0.3, r * 0.1, ex, ey, r); g.addColorStop(0, '#9fd0ff'); g.addColorStop(0.55, '#2d6fc0'); g.addColorStop(1, '#0d2550');
    x.fillStyle = g; x.beginPath(); x.arc(ex, ey, r, 0, TAU); x.fill();
    if (r > 6) { x.save(); x.beginPath(); x.arc(ex, ey, r, 0, TAU); x.clip(); x.fillStyle = 'rgba(255,255,255,0.75)';
      for (let k = 0; k < 26; k++) { x.beginPath(); x.ellipse(ex + R.r(-1, 1) * r, ey + R.r(-1, 1) * r, R.r(0.1, 0.4) * r, R.r(0.03, 0.08) * r, R.r(-0.4, 0.4), 0, TAU); x.fill(); }
      x.fillStyle = 'rgba(60,140,70,0.55)'; x.beginPath(); x.ellipse(ex - r * 0.2, ey + r * 0.1, r * 0.25, r * 0.35, 0.4, 0, TAU); x.fill();
      const sh = x.createLinearGradient(ex - r, ey, ex + r, ey); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.55, 'rgba(0,0,0,0.1)'); sh.addColorStop(0.8, 'rgba(0,0,8,0.85)'); x.fillStyle = sh; x.fillRect(ex - r, ey - r, 2 * r, 2 * r); x.restore();
      x.strokeStyle = 'rgba(140,200,255,0.5)'; x.lineWidth = 2; x.beginPath(); x.arc(ex, ey, r + 1, Math.PI * 0.6, Math.PI * 1.5); x.stroke(); }
    // the bodies you've passed, receding behind you
    OB_FLY.forEach(([name, tc, rad, ox, , sw, k], i) => { if (!OB_COL[name] || st < tc + 1 || st > tc + 16) return;
      const D = Math.hypot(ox, k * Math.abs(ox) + sw * (st - tc) * (1 + 0.25 * (st - tc))), pr = clamp(rad / D / 0.58 * h * 0.5, 1.5, 90), bx = w * (0.68 - 0.1 * (i % 3)), by = h * (0.34 + 0.12 * (i % 2));
      const a2 = 1 - ss(tc + 13, tc + 16, st), g = x.createRadialGradient(bx - pr * 0.3, by - pr * 0.3, pr * 0.1, bx, by, pr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, OB_COL[name]); g.addColorStop(1, '#1a1410');
      x.globalAlpha = a2; x.fillStyle = g; x.beginPath(); x.arc(bx, by, pr, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,0.8)'; x.fillText(name.toUpperCase(), bx, by + pr + 24); x.globalAlpha = 1; });
    x.fillStyle = 'rgba(255,255,255,0.75)'; x.font = '600 18px "Consolas", monospace'; x.textAlign = 'center'; x.fillText('EARTH', ex, ey + r + 28);
    if (st > 136) {   // the Sun behind you, shrinking from a blazing disc to a bright star
      const sr = lerp(46, 2.5, ss(136, 300, st)), sx = w * 0.27, sy = h * 0.38, gg = x.createRadialGradient(sx, sy, 0, sx, sy, sr * 5);
      gg.addColorStop(0, 'rgba(255,250,230,1)'); gg.addColorStop(0.2, 'rgba(255,220,140,0.85)'); gg.addColorStop(1, 'rgba(255,180,80,0)'); x.fillStyle = gg; x.fillRect(sx - sr * 5, sy - sr * 5, sr * 10, sr * 10);
      x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(sx, sy, sr, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,240,200,0.85)'; x.fillText('SUN', sx, sy + sr * 2 + 30); }
  } else if (st >= 484) {   // the Sun, five billion years on: a swollen red giant where home was
    for (let k = 0; k < 200; k++) { x.fillStyle = `rgba(255,255,255,${R.r(0.1, 0.5)})`; x.fillRect(R.r(0, w), R.r(0, h), 1.5, 1.5); }
    const cx2 = w * 0.5, cy2 = h * 0.52, r = h * 0.34 * (1 + 0.02 * Math.sin(st * 1.3));
    const gl = x.createRadialGradient(cx2, cy2, r * 0.6, cx2, cy2, r * 1.8); gl.addColorStop(0, 'rgba(255,90,40,0.6)'); gl.addColorStop(1, 'rgba(255,40,20,0)'); x.fillStyle = gl; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(cx2 - r * 0.2, cy2 - r * 0.2, r * 0.1, cx2, cy2, r); g.addColorStop(0, '#ffcf80'); g.addColorStop(0.5, '#ff7a32'); g.addColorStop(1, '#a8261a');
    x.fillStyle = g; x.beginPath(); x.arc(cx2, cy2, r, 0, TAU); x.fill();
    for (let k = 0; k < 60; k++) { const a = R.r(0, TAU), rr = Math.sqrt(R.f()) * r * 0.9; x.fillStyle = 'rgba(120,20,10,0.25)'; x.beginPath(); x.arc(cx2 + Math.cos(a) * rr, cy2 + Math.sin(a) * rr, R.r(4, 14), 0, TAU); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,0.8)'; x.font = '600 18px "Consolas", monospace'; x.textAlign = 'center'; x.fillText('SOL · RED GIANT · EARTH: GONE', w / 2, h - 26);
  } else {         // the whole galaxy behind you (it shrinks as you leave)
    const gal = ckGalaxy(w, h), k = lerp(0.55, 1.0, ss(400, 470, st)), s = 1 / k;
    x.drawImage(gal, w / 2 - w * s * 0.5 * k * k, h / 2 - h * s * 0.5 * k * k, w * s * k * k, h * s * k * k);
    x.fillStyle = 'rgba(255,255,255,0.75)'; x.font = '600 18px "Consolas", monospace'; x.textAlign = 'center'; x.fillText('MILKY WAY', w / 2, h - 30);
  }
  ckScan(x, w, h);
  // UI: REC, the cam id, a range readout, corner brackets
  x.fillStyle = (Math.floor(st * 1.5) % 2) ? '#ff3b30' : 'rgba(255,59,48,0.35)'; x.beginPath(); x.arc(30, 30, 8, 0, TAU); x.fill();
  x.fillStyle = 'rgba(230,240,255,0.9)'; x.font = '600 20px "Consolas", monospace'; x.textAlign = 'left'; x.fillText('REAR CAM 2', 48, 37);
  x.textAlign = 'right'; const d = distOf(tau); x.fillText(d < 1e3 ? 'ALT ' + Math.round(d) + ' M' : d < 9.46e15 ? 'RANGE ' + hdNum(d / 1000) + ' KM' : 'RANGE ' + hdNum(d / 9.4607e15) + ' LY', w - 20, 37);
  x.strokeStyle = 'rgba(230,240,255,0.7)'; x.lineWidth = 2; for (const [cx2, cy2, dx, dy] of [[16, 56, 1, 1], [w - 16, 56, -1, 1], [16, h - 16, 1, -1], [w - 16, h - 16, -1, -1]]) { x.beginPath(); x.moveTo(cx2, cy2 + dy * 26); x.lineTo(cx2, cy2); x.lineTo(cx2 + dx * 26, cy2); x.stroke(); }
  CK.scrR.tex.needsUpdate = true;
}

// ---------- per frame ----------
function ckCockpit(g, st, L) {
  if (!CK) ckBuild();
  const c = CK;
  // the outside light through the window: shadowed directional along L.dir (from outside, in front)
  c.key.color.copy(L.col); c.key.intensity = L.int;
  c.key.position.copy(c.key.target.position).add(L.dir.clone().multiplyScalar(5));
  c.hemi.color.copy(L.fillCol); c.hemi.groundColor.copy(L.ground); c.hemi.intensity = L.fill;
  const dark = st >= 330;   // deep space: the cockpit lives on its own lights
  c.lamp.intensity = (dark ? 0.9 : 0.35) * (1 - 0.7 * ss(458, 470, st));
  const al = ckAlarm(st) && Math.floor(st * 3) % 2 === 0; c.lamp.color.set(al ? '#ff2a1a' : '#ffcf94'); if (al) c.lamp.intensity = 2.2; c.glowL.intensity = dark ? 0.45 : 0.15; c.glowR.intensity = dark ? 0.6 : 0.15;
  c.read.intensity = st > 455 ? 0.6 + 2.4 * ss(455, 470, st) : st >= 330 ? 0.6 : 0;
  c.glassM.color.setRGB(...(L.glass ?? '255,255,255').split(',').map((v) => v / 255)); c.glassM.opacity = (L.glassA ?? 0.08) / 0.1;
  c.crackM.opacity = TEASER() ? ss(1.6, 2.1, TT) * 0.9 : st >= 326.2 ? Math.min(1, ss(326.2, 326.6, st)) * 0.85 : 0;
  if (TEASER()) { const fl = 0.7 + 0.3 * Math.sin(TT * 23) * Math.sin(TT * 7); c.key.color.set('#ff6a2a'); c.key.intensity = 2.6 * fl; c.hemi.color.set('#7a3a30'); c.hemi.intensity = 0.12;
    const on = Math.floor(TT * 4) % 2 === 0; c.lamp.color.set(on ? '#ff2a1a' : '#ffcf94'); c.lamp.intensity = on ? 2.2 : 0.7; }
  else if (st > 343 && st < 456) { const sh = stressHit(st); if (sh > 0.15) { c.lamp.color.set('#ff2a1a'); c.lamp.intensity = 2.4 * sh; } const rf = radFlash(st); if (rf > 0) { c.key.color.set('#cfe0ff'); c.key.intensity += 6 * rf; } }
  // hands breathe a little; the right hand nudges the stick
  const n = (a, b, k) => Math.sin(st * a + b) * k;
  // the forearms run back along the thighs; the wrists bend so the hands rest on the knee and on the stick
  c.handL.position.set(-0.505 + n(0.4, 0.2, 0.002), -0.425 + n(0.6, 1.0, 0.002), -0.79);
  c.handL.rotation.set(0.25, 0.2, 0.22, 'YXZ'); c.handL.userData.hand.rotation.set(-0.8, 0, 0);
  // at the end the left hand lets go of the throttle and touches the photo
  const kp = ss(460, 469, st); c.handL.visible = kp < 0.5; c.handP.visible = kp >= 0.5;
  if (kp > 0) {
    const ph = c.photo.getWorldPosition(V3(0, 0, 0)), at = ph.clone().add(V3(-0.045, 0.012, 0.03)), from = V3(-0.30, -0.40, -0.62);
    const pos = from.clone().lerp(at.clone().add(V3(-0.075, 0.035, 0.085)), kp);
    c.handP.position.copy(pos); c.handP.lookAt(pos.clone().multiplyScalar(2).sub(at)); c.handP.rotateZ(0.5); c.handP.userData.hand.rotation.set(-0.25 + n(0.6, 0.1, 0.02), 0, 0);
  }
  c.handR.position.set(0.49, -0.40 + n(0.5, 0.4, 0.002), -0.73);
  c.handR.rotation.set(0.25, -0.18, -0.2 + n(0.7, 0.3, 0.015), 'YXZ'); c.handR.userData.hand.rotation.set(-0.75, 0, 0);
  // button LEDs blink on their own rhythms
  for (let i = 0; i < CK_BUTTONS.length; i++) { const on = ((Math.floor(st * (0.7 + i * 0.23)) + i) % 4) !== 0 || i % 3 === 0; c.BUglow.setColorAt(i, lin(on ? CK_BUTTONS[i][2] : '#1a1a1a')); }
  c.BUglow.instanceColor.needsUpdate = true;
  ckScreenL(st); ckScreenC(st); ckScreenR(st);
  g.r.clearDepth(); g.r.render(c.scene, g.cam);
}
