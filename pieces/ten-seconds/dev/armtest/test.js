SHOT(0, 'cats', () => {
  IV_M = IV_MOOD.lunch; ctx.fillStyle = ivVGrad(0, 1080, ['#6b5a66', '#3c2f38']); ctx.fillRect(0, 0, W, H);
  const poses = ['sit', 'loaf', 'stand', 'walk', 'sleep', 'yowl'], coats = ['orange', 'white', 'grey', 'kitten', 'black', 'tux'];
  coats.forEach((cn, r) => poses.forEach((p, c) => ivCat({ x: 170 + c * 300, y: 230 + r * 155, s: 120, f: c % 2 ? -1 : 1, coat: IV_COATS[cn], pose: p, expr: { eyes: r === 2 ? 'angry' : 'open', blink: r === 5 ? 0.6 : 0 } })));
});
SHOT(1, 'cats-big', () => {
  IV_M = IV_MOOD.lamp; ctx.fillStyle = ivVGrad(0, 1080, ['#3a2a26', '#1e1614']); ctx.fillRect(0, 0, W, H);
  ivCat({ x: 600, y: 950, s: 700, f: 1, coat: IV_COATS.orange, pose: 'sit', expr: { blink: 0.5 + 0.5 * Math.sin(TT * 3) } });
  ivCat({ x: 1450, y: 950, s: 650, f: -1, coat: IV_COATS.white, pose: 'sit', expr: { eyes: 'half' } });
});
