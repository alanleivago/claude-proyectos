// =====================================================================
//  MAIN — sorts the registered shots and fills TIMELINE (shots, cuts, board, acts). Runs after every section file.
// =====================================================================
SHOTS_REG.sort((a, b) => a.t0 - b.t0);
// a shot under 0.45 s reads as a flash: drop it and let the shot before it run on
for (let i = SHOTS_REG.length - 2; i >= 1; i--) if (SHOTS_REG[i + 1].t0 - SHOTS_REG[i].t0 < 0.45) SHOTS_REG.splice(i, 1);
SHOTS_REG.forEach((s, i) => { s.t1 = i + 1 < SHOTS_REG.length ? SHOTS_REG[i + 1].t0 : DURATION; });
TIMELINE.shots = SHOTS_REG.map((s, i) => ({ id: i + 1, key: s.key, era: 0, t0: s.t0, t1: s.t1, title: s.title || s.key, sec: s.sec }));
TIMELINE.cuts = SHOTS_REG.slice(1).map((s) => s.t0);
TIMELINE.board = SHOTS_REG.map((s) => ({ t: Math.min(s.t1 - 1 / FPS, s.t0 + (s.boardAt ?? Math.min(1.2, (s.t1 - s.t0) * 0.6))), title: `${s.sec || ''} ${s.key}`, sound: '', next: '' }));
// the arc for review.mjs: the bus builds, silence on "brakes", the truck is the loudest hit
{ const tb = SHOTS_REG.find((s) => s.key === 's04_busWide').t0, br = VW('081-narrator', 'brakes');
  TIMELINE.cues = { brake: br, truck: s04_TRUCK, blank: VW('135-narrator', 'blank') };
  TIMELINE.acts = [
    { name: '1 The power', role: 'build', t0: 0, t1: tb },
    { name: '2 The bus', role: 'peak', t0: tb, t1: br },
    { name: '3 Silence', role: 'silence', t0: br + 0.9, t1: s04_TRUCK - 0.05 },
    { name: '4 The truck', role: 'gift', t0: s04_TRUCK - 0.05, t1: s04_TRUCK + 1.5 },
    { name: '5 After', role: 'goodbye', t0: s04_TRUCK + 1.5, t1: DURATION },
  ]; }
