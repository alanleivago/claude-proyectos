const C0 = V3(0, 40, 0);
function crPose() { const W = world(); lightsOff(W); const ch = C0.clone(), pe = C0.clone().add(V3(0, 0, -0.75));
  poseCrawler(W, { chest: ch, pelvis: pe, N: V3(0, 1, 0), headS: 1.15, head: { p: ch.clone().add(V3(0, 0.12, 0.42)), Y: V3(0, 1, 0.2), Z: V3(0, -0.15, 1) }, jaw: 0.7, glint: 1,
    arms: [{ S: ch.clone().add(V3(0.13, 0, 0)), W: ch.clone().add(V3(0.55, -0.25, 0.5)), pole: V3(0, 1, 0), amp: 0.05, hand: { mode: 'spread', Z: V3(0.3, -0.3, 1), Y: V3(0, 1, 0), curl: 0.35 } },
           { S: ch.clone().add(V3(-0.13, 0, 0)), W: ch.clone().add(V3(-0.55, -0.25, 0.5)), pole: V3(0, 1, 0), amp: 0.05, hand: { mode: 'spread', Z: V3(-0.3, -0.3, 1), Y: V3(0, 1, 0), curl: 0.35 } }] });
  W.key.color.set('#ffe0c0'); W.key.position.copy(C0.clone().add(V3(2, 3, 4))); W.key.target.position.copy(C0); W.key.target.updateMatrixWorld(); W.key.intensity = 4; W.key.angle = 0.6; }
const V = (cp, tp, f) => ({ t: 50, shot: () => { crPose(); render3D('cave', C0.clone().add(cp), C0.clone().add(tp), { fov: f, light: { hemI: 1.2 } }); } });
window.VIEWS = [V(V3(0, 0.3, 2.6), V3(0, 0, 0.1), 40), V(V3(2.0, 0.6, 1.4), V3(0, 0, 0), 40), V(V3(2.6, 0.1, 0), V3(0, 0, 0), 40), V(V3(0.1, 0.05, 1.05), V3(0, 0.1, 0.42), 30)];
