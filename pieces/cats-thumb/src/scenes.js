// =====================================================================
//  THUMBNAIL — "What If You Could Understand Every Cat?" (the channel's pattern: 2-word caption top-left
//  white/yellow, the smug big head with a star in one eye on the right, one glowing prop, dark night bokeh)
// =====================================================================
const CAST = { kai: { key: 'kai', top: 'hoodie', col: '#3c6fd1', col2: '#284c94' } };
IV.bar = 0;   // no cinema bars on a thumbnail

function thStar(x, y, r, a = 1) {   // the four-point sparkle the channel puts in the smart eye
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
  ivGlow(x, y, r * 1.8, 'rgba(255,214,120,0.5)');
  ctx.fillStyle = '#fffbe8'; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const q = i * Math.PI / 4, rr = i % 2 ? r * 0.16 : (i % 4 ? r * 0.7 : r); ctx.lineTo(x + Math.cos(q - Math.PI / 2) * rr, y + Math.sin(q - Math.PI / 2) * rr); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function thCaption(str, x, y, size, col) {
  ctx.save(); ctx.font = `${size}px MontB`; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(str, x + size * 0.04, y + size * 0.06);
  ctx.strokeStyle = '#0c0b10'; ctx.lineWidth = size * 0.07; ctx.strokeText(str, x, y);
  ctx.fillStyle = col; ctx.fillText(str, x, y); ctx.restore();
}
function thBubble(x, y, w, h, tx, ty, str, size) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#fff6e6'; ctx.beginPath(); ctx.roundRect(x, y, w, h, h * 0.42);
  ctx.moveTo(x + w * 0.22, y + h - 4); ctx.lineTo(tx, ty); ctx.lineTo(x + w * 0.42, y + h - 4); ctx.fill(); ctx.restore();
  ctx.save(); ctx.font = `${size}px MontB`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#d8322e';
  ctx.fillText(str, x + w / 2, y + h / 2 + size * 0.04); ctx.restore();
}

function sceneThumb() {
  IV_M = { ...IV_MOOD.night, key: [-0.55, -0.6], rim: '#ffc27a', vig: 0.55 }; IV_CAM = { x: 960, y: 540, z: 1 }; IV_FOCUS = 1;
  ivStage([
    { d: 3, draw: () => {
      ctx.fillStyle = ivVGrad(-400, 1300, ['#070a1c', '#141c44', '#2a2350']); ctx.fillRect(-1500, -800, 5000, 2600);
      ivGlow(1240, 260, 160, 'rgba(255,246,220,0.95)'); ivDot(1240, 260, 70, '#fff3d6'); ivGlow(1240, 260, 520, 'rgba(160,180,255,0.25)');   // the moon
      // rooftops in two depths, lit windows, and cat eyes everywhere
      const r = RNG('roofs').f;
      for (const [y0, col, n] of [[640, '#151a38', 9], [760, '#0e1230', 7]]) {
        let x = -400;
        for (let i = 0; i < n * 2; i++) { const w = 220 + r() * 220, h = y0 - r() * 200 + (i % 2) * 60;
          ivPoly([[x, 1400], [x, h], [x + w * 0.5, h - 60 - r() * 50], [x + w, h], [x + w, 1400]], col);
          for (let k = 0; k < 4; k++) if (r() < 0.45) ivRR(x + 30 + (k % 2) * (w * 0.45), h + 60 + Math.floor(k / 2) * 110, 46, 62, 6, r() < 0.6 ? '#ffcf7a' : '#3a3f6a');
          x += w + 10; }
      }
      for (let i = 0; i < 26; i++) { const x = -200 + r() * 2400, y = 520 + r() * 420, s = 7 + r() * 7, c = r() < 0.5 ? '#ffd84a' : '#9dff6a';
        ivGlow(x, y, s * 5, c === '#ffd84a' ? 'rgba(255,216,74,0.35)' : 'rgba(157,255,106,0.3)'); ivDot(x - s * 1.3, y, s, c); ivDot(x + s * 1.3, y, s, c); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) ivGlow(r() * 2000 - 40, r() * 900, 30 + r() * 70, `rgba(255,${170 + r() * 60 | 0},120,${0.08 + r() * 0.1})`); ctx.restore();
    } },
    { d: 1, draw: () => {
      ivGlow(1360, 540, 640, 'rgba(255,150,70,0.45)');   // warm glow behind the head
      const eye = IV.eye; IV.eye = 'rgba(0,0,0,0)';   // the face is drawn by thFace, on top of the grade
      const k = ivMan({ who: { ...CAST.kai, head: 1.45 }, x: 1420, y: 2080, h: 1650, f: -0.3, pose: ivPose('stand'), expr: { eyes: 'open', mouth: 'none' }, noBlink: true });
      IV.eye = eye; TH_HEAD = [k.head[0], k.head[1], k.R];
      // Pickles, big and grumpy, talking up at you
      ivGlow(620, 900, 420, 'rgba(255,170,80,0.3)');
      ivCat({ x: 600, y: 1150, s: 560, f: 1, coat: { ...IV_COATS.orange, key: 'pickles' }, pose: 'sit', expr: { eyes: 'angry', mouth: 'open', look: [0.6, -0.3] }, noBlink: true });
    } },
  ]);
}
// the smug face: flat-lidded eyes looking at the cat, a star in the near eye, a one-sided smirk
let TH_HEAD = [1400, 600, 300];
function thFace() {
  const [hx, hy, R] = TH_HEAD, cy = hy - R * 0.08, ew = R * 0.17, eh = R * 0.2;
  for (const ex of [hx - R * 0.5, hx + R * 0.05]) {
    ctx.save(); ctx.beginPath(); ctx.rect(ex - ew * 1.5, cy - eh * 0.15 + (ex < hx ? 0 : eh * 0.08), ew * 3, eh * 2); ctx.clip();
    ctx.beginPath(); ctx.ellipse(ex, cy, ew, eh, 0, 0, TAU); ctx.fillStyle = '#f7eedd'; ctx.fill();
    if (ex > hx) ivDot(ex - ew * 0.45, cy + eh * 0.42, ew * 0.42, '#0c0b10'); ctx.restore();
    ivLine(ex - ew * 1.15, cy - eh * 0.15 + (ex < hx ? 0 : eh * 0.08), ex + ew * 1.15, cy - eh * 0.15 + (ex < hx ? 0 : eh * 0.08), R * 0.05, '#f7eedd');
  }
  ctx.save(); ctx.strokeStyle = '#f7eedd'; ctx.lineWidth = R * 0.06; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(hx - R * 0.42, hy + R * 0.42); ctx.quadraticCurveTo(hx - R * 0.12, hy + R * 0.5, hx + R * 0.12, hy + R * 0.3); ctx.stroke(); ctx.restore();
  thStar(hx - R * 0.5, cy + eh * 0.38, R * 0.24);
}
const thPost0 = ivPost;
ivPost = function (o) {
  thPost0(o); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  thFace();
  thBubble(600, 450, 500, 140, 690, 640, 'FEED ME.', 88);
  thCaption('THEY', 70, 230, 200, '#ffffff');
  thCaption('TALK.', 70, 410, 200, '#ffc93c');
  ctx.restore();
};
