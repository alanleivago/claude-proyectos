SHOT(0, 'arms', () => {
  IV_M = IV_MOOD.day; ctx.fillStyle = '#cfd6e0'; ctx.fillRect(0, 0, W, H);
  const poses = ['stand', 'relaxed', 'point', 'wave', 'phone', 'arms', 'hips', 'shrug'];
  [-0.9, -0.45, 0, 0.45, 0.9].forEach((f, r) => poses.forEach((p, c) => {
    ivMan({ who: CAST.you, x: 120 + c * 230, y: 260 + r * 200, h: 190, f, pose: ivPose(p), hands: 'mitten' });
    if (r === 0) ivText(p, 120 + c * 230, 60, 22, '#222');
  }));
});
