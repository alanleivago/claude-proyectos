// creature self-check: the girl isolated (crawl side, 3/4, front, face close-up; wall lean 3/4) on an empty patch of snow
const SCX = -30, sp = (s) => ({ p: V3(SCX + s, 0, 0.0), F: V3(1, 0, 0) });
const pose = (s) => { const st = crawlSt(sp, s, 3.1); poseGirl(world(), st); return st; };
window.VIEWS = [
  { t: 8.6, shot: () => { const st = pose(0.45); const c = st.chest; render3D('night', c.clone().add(V3(0, 0.25, 1.9)), c.clone().add(V3(0, -0.05, 0)), { fov: 40, fill: { I: 0.8, d: 6 } }); } },
  { t: 8.6, shot: () => { const st = pose(0.15); const c = st.chest; render3D('night', c.clone().add(V3(1.3, 0.5, 1.3)), c.clone().add(V3(0, -0.05, 0)), { fov: 40, fill: { I: 0.8, d: 6 } }); } },
  { t: 8.6, shot: () => { const st = pose(0.8); const c = st.chest; render3D('night', c.clone().add(V3(1.6, 0.35, 0.05)), c.clone().add(V3(0, 0.0, 0)), { fov: 40, fill: { I: 0.8, d: 6 } }); } },
  { t: 8.6, shot: () => { const st = pose(0.3); const h = st.head.p; render3D('night', h.clone().add(V3(0.45, 0.02, 0.12)), h, { fov: 40, fill: { I: 0.8, d: 3 } }); } },
  { t: 8.6, shot: () => { const st = wallLean(GX, 1.5, { roll: -0.3, lean: 0.4 }); poseGirl(world(), st); render3D('night', V3(GX + 1.4, 2.3, WZ + 1.2), V3(GX, 1.85, WZ - 0.1), { fov: 40, fill: { I: 0.8, d: 6 } }); } },
];
