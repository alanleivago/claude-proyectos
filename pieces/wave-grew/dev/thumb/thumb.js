// thumbnail mode: no HUD / captions / cards; one big HUD block on the left like the reference channels' thumbnails
const THUMB_TEXT = { label: 'Wave height', value: '524 m', sub: 'and still growing', line: 'You can\'t get off.' };
function THUMB(st) {
  const T = st < 290 ? { label: 'Wave height', value: '8,849 m', sub: 'taller than Everest', line: 'And still growing.' } : { label: 'Wave height', value: '3,367 km', sub: 'and still growing', line: 'You can\'t get off.' }, f = () => {
    ctx.save(); screen(); ctx.filter = 'saturate(1.3) contrast(1.08)'; ctx.drawImage(ctx.canvas, 0, 0); ctx.filter = 'none'; ctx.restore();
    ctx.save(); screen(); const g = ctx.createLinearGradient(0, 0, W * 0.62, 0);
    g.addColorStop(0, 'rgba(10,14,22,0.78)'); g.addColorStop(0.45, 'rgba(10,14,22,0.5)'); g.addColorStop(0.8, 'rgba(10,14,22,0.12)'); g.addColorStop(1, 'rgba(10,14,22,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    const x = 105, halo = 'rgba(0,0,0,0.55)';
    hdText(T.label.toUpperCase(), x, 300, 40, { font: HD.sans, weight: 600, spacing: 7, halo });
    hdText(T.value, x - 6, 500, 210, { halo });
    hdText(T.sub.toUpperCase(), x, 600, 36, { font: HD.sans, weight: 600, spacing: 6, halo });
    hdText(T.line, x, 900, 76, { italic: true, halo });
  };
  f();
}
