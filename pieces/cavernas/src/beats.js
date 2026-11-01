// =====================================================================
//  BEATS — one SHOT_FN per beat. Every shot starts from reset(): all bodies hidden, torches off, no bubbles.
//  Where the four end up (hips along the passage, height across it, depth): they lie overlapped, facing the way out.
// =====================================================================
const FIN = [[0.80, -0.15, -0.35], [0.865, 0.2, -0.75], [0.915, -0.1, -0.4], [0.95, 0.2, -0.7]];
const SPOT = [3.0, 3.65, 4.35, 5.0], SPOTZ = [-0.35, -0.7, -0.45, -0.6];
function reset(st) { st.four.concat([st.fifth]).forEach((F) => { hide(F); torch(F, false); }); st.lamp.intensity = 0; st.plug.visible = false; bubbles(st, []); }
const limpAt = (F, i, o = {}) => swimTun(F, o.u ?? FIN[i][0], { limp: 1, ph: 0.4 + i, v: o.v ?? FIN[i][1], z: o.z ?? FIN[i][2] });
const headOf = (u, v = -0.1) => { const p = tun(u, v); return [p.x - p.dx * 0.78, p.y - p.dy * 0.78]; };
const stand = (st, i, q = {}) => standAt(st.four[i], SPOT[i], SPOTZ[i], Object.assign({ emo: { fear: 0.5 } }, q));
// standing at the pocket's edge, then gone under and swimming toward the way out
function diveOut(st, i, lt, tDive, u0, u1, tEnd) {
  const F = st.four[i];
  if (lt < tDive) { const k = ss(tDive - 1.6, tDive, lt); standAt(F, SPOT[i] - 0.15 * k, SPOTZ[i], { yaw: lerp(0, -1.2, k), lean: 0.6 * k, crouch: 0.6 * k, armL: [lerp(0.3, 2.4, k), 0.2, 0.3], armR: [lerp(0.3, 2.4, k), 0.2, 0.3], emo: { fear: 0.7, open: 0.3 } }); return null; }
  const u = lerp(u0, u1, ss(tDive, tEnd, lt)); swimTun(F, u, { amp: 1, ph: TT * 5.5 + i, z: FIN[i][2] }); return u;
}

SHOT_FN.hook = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.four.forEach((F, i) => limpAt(F, i));
  camPt(st, [1.2, lerp(0.5, 0.2, k), lerp(13, 9, k)], [1.2, -0.5, -0.5], 34, t, 0.3); renderStage(st, 0.85); bloom(0.12); pvTint('#06101c', 0.25); };

SHOT_FN.mount = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st);
  st.four.concat([st.fifth]).forEach((F, i) => { const x = -12.2 + 0.32 * lt + (i % 3) * 0.55 - (i > 2 ? 0.9 : 0), z = -0.9 - (i % 2) * 0.9 - (i > 2 ? 0.5 : 0);
    F.g.visible = true; F.g.rotation.set(0, 0, 0); F.g.position.set(x, st.gy(x, z), z); posePerson(F.P, { yaw: Math.PI / 2 - 0.1, walk: 1, ph: TT * 6 + i * 1.7, lean: 0.15, armR: [1.0, 0.1, 0.3], emo: { smile: 0.4 } }); torch(F, true); });
  st.lamp.position.set(-10.5 + 0.32 * lt, st.surf(-10.5) + 1.2, -1.2); st.lamp.intensity = 2;
  camPt(st, mixv([-7.0, 9.0, 17], [-7.6, 3.9, 7.2], k), mixv([-9.8, 3.4, -2], [-8.7, 2.7, -0.6], k), 36, t, 0.4); renderStage(st, 0.9); bloom(0.2); };

SHOT_FN.gallery = (lt, dur, t) => { const st = caveStage(), lead = lerp(0.1, 0.5, lt / dur); reset(st);
  st.four.forEach((F, i) => { const u = lead - i * 0.05, p = tun(u, -0.95); F.g.visible = true; F.g.rotation.set(0, 0, 0); F.g.position.set(p.x, p.y, SPOTZ[i]);
    posePerson(F.P, { yaw: Math.PI / 2, walk: 0.8, ph: TT * 5 + i * 1.3, crouch: 0.5, lean: 0.25, armR: [0.9, 0.1, 0.25], armL: [0.5, 0.35, 0.6], emo: { fear: 0.15 } }); torch(F, true); });
  const sx = st.mouth[0] - 1.0; st.fifth.g.visible = true; st.fifth.g.rotation.set(0, 0, 0); st.fifth.g.position.set(sx, st.gy(sx, -0.6), -0.6); posePerson(st.fifth.P, { yaw: 1.2, sit: 1, armR: [0.6, 0.1, 0.8] }); torch(st.fifth, true);
  const p = tun(lead, 0); st.lamp.position.set(p.x, p.y + 0.3, -0.3); st.lamp.intensity = 1.5;
  camPt(st, [p.x + 1.1, p.y + 1.0, 6.8], [p.x - 0.3, p.y + 0.2, -0.5], 38, t, 0.5, 2); renderStage(st, 0.95); bloom(0.2); };

SHOT_FN.rope = (lt, dur, t) => { const st = caveStage(), RP = st.ropePts.slice().reverse(), kp = ss(0, 0.65 * dur, lt), kw = ss(0.6 * dur, 0.95 * dur, lt); reset(st);
  st.four.forEach((F, i) => { const k = lt / dur * 1.7 - i * 0.28; if (k > 1) stand(st, i, { emo: { fear: 0.1 } }); else if (k > 0) { const p = tun(lerp(0.6, 0.99, k), -0.1); swimAt(F, p.x, p.y, p.dx, p.dy, { z: SPOTZ[i], ph: TT * 5 + i }); } });
  const T = RP[Math.round(lerp(1, RP.length - 2, kp))];
  camPt(st, mixv([T.x + 0.3, T.y + 0.4, 5.6], [0.3, 0.6, 30], kw), mixv([T.x - 0.1, T.y, -0.5], [0.1, -0.9, -0.5], kw), lerp(36, 30, kw), t, 0.4);
  renderStage(st, 1.05); bloom(0.14); if (kw > 0.9) cota(st, -2.55, 2.3, -1.75, '4,5 m', ss(0.85 * dur, 0.93 * dur, lt)); };

SHOT_FN.chamber = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st);
  stand(st, 0, { yaw: 0.5, headYaw: 0.3, emo: { fear: 0.6 }, armL: [0.3, 0.3, 0.6] }); stand(st, 1, { yaw: 0.2, emo: { fear: 0.5, sad: 0.3 } });
  stand(st, 2, { yaw: -0.2, headPitch: -0.35, emo: { fear: 0.4 }, armR: [0.9, 0.2, 1.6] }); stand(st, 3, { yaw: -0.5, headYaw: -0.3, emo: { fear: 0.6 } });
  camPt(st, [4.6 - 0.9 * k, 1.1 - 0.15 * k, lerp(11.5, 8.6, k)], [3.9, 0.55, -0.5], 34, t, 0.5); renderStage(st, 1.05); bloom(0.14); };

SHOT_FN.dive1 = (lt, dur, t) => { const st = caveStage(), kf = ss(1.4, 3.2, lt); reset(st); [1, 2, 3].forEach((i) => stand(st, i, { yaw: -0.5, emo: { fear: 0.6 } }));
  const u = diveOut(st, 0, lt, 1.8, 0.985, 0.9, dur); const h = u ? tun(u, -0.1) : { x: 2.9, y: 0.9 };
  if (u) bubbles(st, [[...headOf(u), 0.6]]);
  camPt(st, mixv([4.2, 1.0, 8.6], [h.x + 0.6, h.y + 0.35, 4.6], kf), mixv([3.9, 0.55, -0.5], [h.x - 0.4, h.y, -0.5], kf), 34, t, 0.5); renderStage(st, 1.05); bloom(0.14); };

SHOT_FN.wide = (lt, dur, t) => { const st = caveStage(), k = ss(1.6, dur, lt), u = lerp(0.9, 0.83, lt / dur); reset(st);
  swimTun(st.four[0], u, { amp: lerp(1, 0.35, lt / dur), ph: t * 4, z: FIN[0][2] }); [1, 2, 3].forEach((i) => stand(st, i));
  bubbles(st, [[...headOf(u), 0.5]]); const h = tun(u, -0.1);
  camPt(st, [lerp(-0.2, h.x + 0.4, k), lerp(1.2, h.y + 0.25, k), lerp(36, 4.2, k * k)], [lerp(-0.3, h.x - 0.2, k), lerp(-1.1, h.y, k), -0.5], 30, t, 0.4);
  renderStage(st, 1.05); bloom(0.14); if (k < 0.15) cota(st, -2.55, 2.3, -1.75, '4,5 m', 1 - k / 0.15); };

SHOT_FN.black1 = (lt, dur, t) => { const st = caveStage(), u = lerp(0.83, FIN[0][0], ss(0, dur, lt)), lk = ss(0, 2.5, lt); reset(st);
  swimTun(st.four[0], u, { amp: 0.35 * (1 - lk), limp: lk, ph: t * 3, v: lerp(-0.1, FIN[0][1], lk), z: FIN[0][2] }); bubbles(st, [[...headOf(u), 0.5 * (1 - lk) + 0.1]]);
  const h = tun(u, -0.1); camPt(st, [h.x + 0.25, h.y + 0.2, 4.0], [h.x - 0.35, h.y, -0.5], 34, t, 0.2); renderStage(st, lerp(1.0, 0.6, lk)); bloom(0.1); pvTint('#000000', ss(1.9, dur - 0.1, lt) * 0.94); };

SHOT_FN.wait = (lt, dur, t) => { const st = caveStage(), k = ss(1, dur, lt); reset(st); limpAt(st.four[0], 0);
  stand(st, 1, { yaw: -0.6, armR: [2.1, 0.25, 0.5], headYaw: -0.4, emo: { fear: 0.4, sad: 0.3 } }); stand(st, 2, { yaw: -0.3 }); stand(st, 3, { yaw: -0.5, emo: { fear: 0.6 } });
  camPt(st, mixv([3.4, 1.45, 2.6], [4.1, 1.0, 6.4], k), mixv([2.95, 1.35, -0.35], [3.7, 0.8, -0.5], k), 34, t, 0.3); renderStage(st, 1.0); bloom(0.14); };

SHOT_FN.dive2 = (lt, dur, t) => { const st = caveStage(), kf = ss(1.3, 3.0, lt); reset(st); limpAt(st.four[0], 0); [2, 3].forEach((i) => stand(st, i, { yaw: -0.5, emo: { fear: 0.7 } }));
  const u = diveOut(st, 1, lt, 1.8, 0.985, 0.97, dur); const h = u ? tun(u, -0.1) : { x: 3.5, y: 0.9 };
  if (u) bubbles(st, [[...headOf(u), 0.6]]);
  camPt(st, mixv([4.3, 1.0, 8.4], [h.x + 0.5, h.y + 0.4, 4.4], kf), mixv([3.9, 0.55, -0.5], [h.x - 0.5, h.y, -0.5], kf), 34, t, 0.5); renderStage(st, 1.0); bloom(0.14); };

SHOT_FN.chase = (lt, dur, t) => { const st = caveStage(), u2 = lerp(0.97, 0.935, ss(0, 3.3, lt)), hit = ss(2.8, 3.5, lt); reset(st); limpAt(st.four[0], 0);
  swimTun(st.four[1], u2, { amp: 1 + 0.6 * hit, ph: t * (5.5 + 3 * hit), z: FIN[1][2], emo: { fear: 0.9, open: 0.4 } }); bubbles(st, [[...headOf(u2), 0.7]]);
  const h = tun(u2, -0.1); camPt(st, [h.x + 0.2, h.y + 0.5, 5.6], [h.x - 0.9, h.y - 0.1, -0.5], 36, t, 0.6 + 2 * hit, 3); renderStage(st, 1.0); bloom(0.14); };

SHOT_FN.panic = (lt, dur, t) => { const st = caveStage(), lk = ss(3.3, 4.6, lt), u = lerp(0.935, FIN[1][0], ss(0, 3.5, lt)); reset(st); limpAt(st.four[0], 0);
  swimTun(st.four[1], u, { amp: 2.2 * (1 - lk), limp: lk, ph: t * 11, v: lerp(0, FIN[1][1], lk) + 0.05 * Math.sin(t * 13) * (1 - lk), z: FIN[1][2], emo: { fear: 1, open: 0.7 } });
  bubbles(st, [[...headOf(u), 1 - 0.8 * lk], [...headOf(u, 0.2), 0.8 * (1 - lk)]]);
  const h = tun(u, -0.1); camPt(st, [h.x + 0.2, h.y + 0.4, 5.6], [h.x - 0.5, h.y, -0.5], 36, t, 3.5 * (1 - lk) + 0.3, 5); renderStage(st, lerp(1.0, 0.75, lk)); bloom(0.14); };

SHOT_FN.last2 = (lt, dur, t) => { const st = caveStage(), a = lerp(0.35, -0.3, ss(0, dur, lt)); reset(st); limpAt(st.four[0], 0); limpAt(st.four[1], 1);
  const u = diveOut(st, 2, lt, 2.0, 0.985, 0.96, dur); if (u) bubbles(st, [[...headOf(u), 0.6]]);
  if (lt < 3.2) stand(st, 3, { yaw: -0.7, emo: { fear: 0.8, cry: 0.4 } }); else diveOut(st, 3, lt - 1.2, 2.0, 0.995, 0.99, dur);
  camPt(st, [3.9 + 7 * Math.sin(a), 1.0, 7 * Math.cos(a)], [3.8, 0.55, -0.5], 34, t, 0.5); renderStage(st, 0.95); bloom(0.14); };

SHOT_FN.turn = (lt, dur, t) => { const st = caveStage(), k = ss(2, dur, lt); reset(st); [0, 1, 2].forEach((i) => limpAt(st.four[i], i));
  const F = st.four[3]; swimTun(F, FIN[3][0], { amp: 0.8, ph: t * 4, v: FIN[3][1], z: FIN[3][2], emo: { fear: 0.9, open: 0.4 } }); F.g.rotation.y = 0.35 * Math.sin(t * 1.7) * (1 - 0.5 * k);
  bubbles(st, [[...headOf(FIN[3][0], FIN[3][1]), 0.5]]); const h = tun(FIN[3][0], 0);
  camPt(st, mixv([h.x + 0.2, h.y + 0.35, 4.6], [h.x + 0.7, h.y + 0.5, 6.2], k), [h.x - 0.4, h.y, -0.5], 36, t, 0.6, 4); renderStage(st, 0.95); bloom(0.14); };

SHOT_FN.pull = (lt, dur, t) => { const st = caveStage(), s = Math.sin(t * 6); reset(st); [0, 1, 2].forEach((i) => limpAt(st.four[i], i));
  const F = st.four[3], lk = ss(2.6, 3.8, lt); swimTun(F, FIN[3][0], { amp: 0.4, limp: lk, ph: t * 3, v: FIN[3][1], z: FIN[3][2], emo: { fear: 1, open: 0.6 } });
  if (lk < 0.5) posePerson(F.P, { yaw: -Math.PI / 2, headPitch: -0.5, armL: [2.4 + 0.4 * s, 0.3, 0.6 + 0.6 * Math.max(0, s)], armR: [2.4 - 0.4 * s, 0.3, 0.6 + 0.6 * Math.max(0, -s)], legL: [0.3 * s, 0.4], legR: [-0.3 * s, 0.3], emo: { fear: 1, open: 0.6 } });
  bubbles(st, [[...headOf(FIN[3][0], FIN[3][1]), 0.7 * (1 - lk)]]); const h = tun(FIN[3][0] - 0.03, 0);
  camPt(st, [h.x + 0.3, h.y + 0.3, 4.0], [h.x - 0.4, h.y, -0.5], 38, t, 1.6 * (1 - lk) + 0.3, 6); renderStage(st, 0.9); bloom(0.12); };

SHOT_FN.empty = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.four.forEach((F, i) => limpAt(F, i));
  camPt(st, mixv([4.7, 1.2, 9.0], [4.4, 0.9, 5.4], k), [4.4, 0.7, -0.5], 34, t, 0.15); renderStage(st, 0.8); bloom(0.1); pvTint('#06101c', 0.2); };

SHOT_FN.found = (lt, dur, t) => { const st = caveStage(), k = ss(0.5, dur, lt), e = k * k; reset(st); st.four.forEach((F, i) => limpAt(F, i));
  camPt(st, mixv([0.9, -0.1, 5.5], [-2.0, 6.0, 46], e), mixv([0.9, -0.5, -0.5], [-2.5, 3.2, -2], e), 34, t, 0.2); renderStage(st, 0.85); bloom(0.12); };

SHOT_FN.seal = (lt, dur, t) => { const st = caveStage(); reset(st); st.four.forEach((F, i) => limpAt(F, i)); st.plug.visible = true; st.plugClip.constant = lerp(0.8, 3.6, ss(0.3, 3.0, lt));
  camPt(st, [-6.8, 2.2, lerp(9, 7.5, lt / dur)], [-7.2, 1.9, -0.5], 36, t, 0.2); renderStage(st, 0.85); bloom(0.12); pvTint('#000000', ss(3.2, 4.8, lt)); };
