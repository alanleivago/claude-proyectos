// ---- v2 type + bubble sheet: title font, 3 dialogue-font candidates over a real frame, bubbles vs subtitles.
window.TIMELINE = { width: W, height: SH, fps: FPS, duration: 1, frames: 1 };
const IMGS = (n) => ASSETS[n + '.jpg'];
function panel(src, draw) {                       // a 1920x1080 frame with lettering, returned as a canvas
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.drawImage(IMGS(src), 0, 0, W, H); g.fillStyle = '#05030A'; g.fillRect(0, 0, W, 46); g.fillRect(0, H - 46, W, 46); draw(g); return c;
}
function label(g, x, y, head, body, w = 700) {
  g.fillStyle = '#FFE14D'; g.font = cardFont(40); if ('letterSpacing' in g) g.letterSpacing = '3px'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(head, x, y);
  g.fillStyle = '#EDE3F2'; g.font = ltFont(26, 'A'); if ('letterSpacing' in g) g.letterSpacing = '0px';
  ltWrap(g, body, w).forEach((l, i) => g.fillText(l, x, y + 56 + i * 36));
}
function frame(g) {
  g.fillStyle = '#120A18'; g.fillRect(0, 0, W, SH);
  // 1. title
  const t = panel('st03', (p) => { p.save(); p.globalCompositeOperation = 'multiply'; p.fillStyle = 'rgba(70,58,140,0.55)'; p.fillRect(0, 0, W, H); p.restore(); drawTitle(p, W * 0.5, H * 0.46, 230, 1); });
  g.drawImage(t, 40, 40, 1152, 648);
  label(g, 1232, 50, 'TITLE: PRICEDOWN BLACK', 'The classic GTA logo face (Ray Larabie / Typodermic). Free desktop font: static commercial use incl. rendered video is allowed; font file not redistributed. GTA VI\'s own site uses a proprietary face, "GTA Art Deco" (Regular/Medium/Bold/Condensed Heavy), not licensable.', 640);
  g.font = cardFont(74); g.fillStyle = '#FFFFFF'; if ('letterSpacing' in g) g.letterSpacing = '8px'; g.textBaseline = 'alphabetic'; g.fillText('LUCIA CAMINOS', 1232, 560);
  g.font = cardFont(30); g.fillStyle = '#FF6FAE'; g.fillText('NAME / CHAPTER CARDS', 1234, 606);
  g.font = ltFont(24, 'A'); g.fillStyle = '#BDAFC8'; if ('letterSpacing' in g) g.letterSpacing = '0px'; g.fillText('Barlow Condensed ExtraBold (OFL) ≈ GTA Art Deco Condensed Heavy', 1234, 650);
  // 2. dialogue candidates
  const C = [['A', 'OUTFIT SEMIBOLD  (CHOSEN)', 'Geometric sans, the closest free match to GTA Art Deco Regular/Medium used on the GTA VI site. Open, very readable at subtitle size. SIL OFL 1.1.'],
             ['B', 'BARLOW SEMI CONDENSED SEMIBOLD', 'Narrower, more "road sign" Americana; fits long lines. Same family as the card font. SIL OFL 1.1.'],
             ['C', 'RED HAT DISPLAY BOLD', 'Rounder and heavier, more marketing-poster; slightly wider, wraps sooner. SIL OFL 1.1.']];
  C.forEach(([k, head, body], i) => {
    const y = 740 + i * 690;
    const p = panel('f09', (q) => { drawSub(q, { who: 'MÉNDEZ', text: "You've got a friend in the Keys. Jason Duval." }, 1, k); drawCap(q, 'Then one night, a visitor.', 1, k, 108, 330); });
    g.drawImage(p, 40, y, 1152, 648);
    label(g, 1232, y + 10, `${k}. ${head}`, body, 640);
    g.font = ltFont(46, k); g.fillStyle = '#FFFFFF'; g.textBaseline = 'alphabetic'; g.fillText("I don't have friends.", 1232, y + 330);
    g.font = ltFont(34, k); g.fillStyle = '#F1E2FF'; g.fillText('Mamá’s still waiting in that apartment.', 1232, y + 390);
    g.font = ltFont(30, k); g.fillStyle = '#BDAFC8'; g.fillText('ABCDEFGHIJKLM 0123456789 ¿?!', 1232, y + 440);
  });
  // 3. bubbles vs subtitles on a real frame
  const y3 = 740 + 3 * 690;
  const b = panel('f09', (q) => {
    drawBubble(q, { x: 360, y: 160, text: "You've got a friend in the Keys.", tip: [566, 246], maxW: 420, n: 2.6, tailW: 0.17 }, 1);
    drawBubble(q, { x: 1700, y: 150, text: 'I don’t have friends.', tip: [1478, 262], kind: 'whisper', maxW: 360, n: 2.6, tailW: 0.17 }, 1);
  });
  g.drawImage(b, 40, y3, 1152, 648);
  const s = panel('f12', (q) => { drawSub(q, { who: 'LUCIA', text: "I don't have friends." }, 1); drawSub2(q); });
  label(g, 1232, y3 + 10, 'BUBBLES: KEY MOMENTS ONLY', 'One closed vector path per balloon: superellipse body with a curved tail merged into the outline, one 5 px ink stroke, soft drop shadow, no clipping. Solid = normal, dashed = whisper. Default dialogue = subtitle with the speaker name (below).', 640);
  g.drawImage(s, 1232, y3 + 290, 640, 360);
  g.font = cardFont(26); g.fillStyle = '#BDAFC8'; g.textBaseline = 'top'; g.fillText('SUBTITLE + SPEAKER (DEFAULT)', 1232, y3 + 660);
}
function drawSub2() {}
