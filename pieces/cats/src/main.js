// =====================================================================
//  MAIN — sorts the registered shots and fills TIMELINE (shots, cuts, board). Runs after every section file.
// =====================================================================
SHOTS_REG.sort((a, b) => a.t0 - b.t0);
// a shot under 0.45 s reads as a flash: drop it and let the shot before it run on
for (let i = SHOTS_REG.length - 2; i >= 1; i--) if (SHOTS_REG[i + 1].t0 - SHOTS_REG[i].t0 < 0.45) SHOTS_REG.splice(i, 1);
SHOTS_REG.forEach((s, i) => { s.t1 = i + 1 < SHOTS_REG.length ? SHOTS_REG[i + 1].t0 : DURATION; });
TIMELINE.shots = SHOTS_REG.map((s, i) => ({ id: i + 1, key: s.key, era: 0, t0: s.t0, t1: s.t1, title: s.title || s.key, sec: s.sec }));
TIMELINE.cuts = SHOTS_REG.slice(1).map((s) => s.t0);
TIMELINE.board = SHOTS_REG.map((s) => ({ t: Math.min(s.t1 - 1 / FPS, s.t0 + (s.boardAt ?? Math.min(1.2, (s.t1 - s.t0) * 0.6))), title: `${s.sec || ''} ${s.key}`, sound: '', next: '' }));
