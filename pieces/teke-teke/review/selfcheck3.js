// creature self-check (teke v3): crawl side / 3/4 front / face close-up / wall lean head lifted + tilted; then 8 consecutive frames of the chase crawl
const SCX = -30, sp = (s) => ({ p: V3(SCX + s, 0, 0.6), F: V3(1, 0, 0) }), KS = mkCrawl(0, 0, ['slow', 'burst', 'burst', 'med', 'burst']);
const shotG = (tt, camOff, tgOff, fov = 40) => () => { const G = girl(world(), (tq) => crawlSt(KS, sp, tq), tt); const c = G.st.chest; render3D('night', c.clone().add(camOff), c.clone().add(tgOff), { fov, fill: { I: 3, d: 6 }, lampAt: V3(-27, 0, 0) }); };
window.VIEWS = [
  { t: 8.6, shot: shotG(0.9, V3(0.2, 0.35, 2.2), V3(0.1, -0.05, 0)) },
  { t: 8.6, shot: shotG(1.75, V3(1.6, 0.5, 1.3), V3(0.2, -0.05, 0)) },
  { t: 8.6, shot: () => { const G = girl(world(), (tq) => crawlSt(KS, sp, tq), 0.5); const h = G.head.position; render3D('night', h.clone().add(V3(0.5, 0.05, 0.15)), h, { fov: 40, fill: { I: 3, d: 3 } }); } },
  { t: 8.6, shot: () => { girl(world(), (tq) => wallLean(GX, tq, { lift: 1, roll: 1.5, jk: 0 }), 2); render3D('night', V3(GX + 0.4, 1.9, WZ + 1.4), V3(GX, 1.9, WZ), { fov: 40, fill: { I: 3, d: 6 } }); } },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ t: 40.5 + i / 24, shot: () => shotChase() })),
];
