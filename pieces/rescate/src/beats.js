// =====================================================================
//  BEATS — one SHOT_FN per beat. Every shot starts from reset(): all bodies hidden, torches off, no bubbles, no line,
//  props hidden, full daylight. The cave: the cenote opens in the river bed (left), the long flooded passage, the air
//  chamber with its ledge (right). Every beat moves its camera (crane, dolly, orbit, push, pull); none holds > 3 s.
// =====================================================================
const LEDGE_Y = WL + 0.12;
function reset(st) { Object.entries(st.cast).forEach(([k, F]) => { hide(F); torch(F, false); F.gearOn(!!CAST[k].diver); }); st.lamp.intensity = 0; bubbles(st, []); st.lineK(0); st.ring.scale.setScalar(1 + 0.4 * mod(TT * 2, 1)); st.ring.material.opacity = 0.6 * (1 - mod(TT * 2, 1));
  st.fish.visible = st.gun.visible = st.stretcher.visible = st.amb.visible = false; st.spare.forEach((g) => (g.visible = false)); dark(st, 0); blackout(st, 0); st.sheet.material.opacity = 1; st.four.forEach((F) => F.torch[0].scale.set(1, 1, 1)); }
// no beam cone inside the passage (it spills over the rock face there)
const beamS = (F) => (F.torch[0].visible = false);   // the lens + the lamp stay on
// the cave without the sun: 0 = the cutaway's daylight, 1 = only the lamps
function dark(st, k) { st.hemi.intensity = 1.0 * (1 - 0.8 * k); st.key.intensity = 2.2 * (1 - 0.88 * k); st.fill.intensity = 0.6 * (1 - 0.7 * k); }
// pitch black inside: the rock itself goes dark (k 0..1), and a screen mask that leaves only a faint pool round (px, py)
function blackout(st, k) { const c = 1 - 0.93 * k; [st.back, st.walls, st.ledge].forEach((m) => m.material.color.setScalar(c)); st.spring.visible = st.ring.visible = k < 0.5; }
function inkMask(px, py, r, a) { ctx.save(); screen(); const g = ctx.createRadialGradient(px, py, r * 0.25, px, py, r); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// Erasto on the ledge, behind the pillar
const onLedge = (st, q = {}) => standAt(st.cast.erasto, CH.x + 1.15, -0.6, Object.assign({ sit: 1, yaw: -0.5, emo: { fear: 0.3 } }, q), LEDGE_Y);
const sitAt = (F, x, z, q = {}) => standAt(F, x, z, Object.assign({ sit: 1 }, q), LEDGE_Y);
const kneelAt = (F, x, z, q = {}) => standAt(F, x, z, Object.assign({ kneel: 1 }, q), LEDGE_Y);
// a body treading water in the chamber, head out (rise 0 = still under, 1 = up)
const treadAt = (F, x, z, q = {}, rise = 1) => standAt(F, x, z, Object.assign({ armL: [0.9 + 0.3 * Math.sin(TT * 3), 0.5, 0.6], armR: [0.9 - 0.3 * Math.sin(TT * 3), 0.5, 0.6], legL: [0.3 * Math.sin(TT * 3), 0.3], legR: [-0.3 * Math.sin(TT * 3), 0.3] }, q), WL - 1.42 - 0.95 * (1 - rise));
const lampAt = (st, x, y, z, i = 1.6) => { st.lamp.position.set(x, y, z); st.lamp.intensity = i; };
// swim along the passage toward the chamber (head ahead, larger u)
const swimIn = (F, u, o = {}) => { const p = tun(u, o.v ?? -0.1); swimAt(F, p.x, p.y, p.dx, p.dy, o); };
const headIn = (u, v = -0.1, s = 1) => { const p = tun(u, v); return [p.x + s * p.dx * 0.75, p.y + s * p.dy * 0.75]; };
// on the river bank (the ground behind the cut, left of the cenote)
const bankAt = (st, F, x, z, q = {}) => { F.g.visible = true; F.g.rotation.set(0, 0, 0); F.g.position.set(x, st.gy(x, z), z); posePerson(F.P, Object.assign({ yaw: 1.2 }, q)); };
// lying on the back, head toward ry (+PI/2 = toward -x); feet at (x, y, z)
function lieAt(F, x, y, z, ry, q = {}) { F.g.visible = true; F.g.rotation.order = 'YXZ'; F.g.rotation.set(-Math.PI / 2, ry, 0); F.g.position.set(x, y, z);
  posePerson(F.P, Object.assign({ legL: [0.05, 0.1], legR: [-0.02, 0.05], armL: [0.1, 0.12, 0.2], armR: [0.1, 0.12, 0.2] }, q)); }
const fishAt = (st, x, y, z, dx, dy) => { st.fish.visible = true; st.fish.position.set(x, y, z); st.fish.rotation.set(0, dx < 0 ? Math.PI : 0, Math.atan2(dy, Math.abs(dx))); st.fishTail.rotation.y = 0.45 * Math.sin(TT * 11); };
// small amber caps name tag over a body (like the ref)
function tagAt(st, x, y, z, s, a = 1) { if (a <= 0) return; const [px, py] = toScreen(st, x, y, z); if (py < SAFE.top + 30 || py > H - SAFE.bottom || px < 40 || px > W - 40) return;
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.font = `900 42px ${SANS}`; ctx.textAlign = 'center'; ctx.letterSpacing = '5px'; ctx.lineJoin = 'round'; const hw = ctx.measureText(s).width / 2 + 24, tx = Math.max(hw, Math.min(px, W - SAFE.right - hw));
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 16; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(8,10,14,0.85)'; ctx.strokeText(s, tx, py); ctx.shadowBlur = 0; ctx.fillStyle = "#f2c46a"; ctx.fillText(s, tx, py); ctx.restore(); }
const hipsOf = (F) => F.g.localToWorld(new THREE.Vector3(0, 0.92, 0));
const tagF = (st, F, s, a, dy = 0.42) => { F.g.updateMatrixWorld(true); const p = hipsOf(F); tagAt(st, p.x, p.y + dy, p.z, s, a); };

SHOT_FN.hook = (lt, dur, t) => { const st = caveStage(), k = ss(0.4, dur, lt); reset(st); dark(st, 0.35); const turn = ss(4.2, 5.0, lt);
  onLedge(st, { emo: { fear: 0.2 + 0.3 * turn, blink: 0.6 * (1 - turn), open: 0.15 * turn }, headYaw: -0.6 * turn, headPitch: 0.15 - 0.25 * turn }); st.lineK(0);
  lampAt(st, CH.x + 0.8, LEDGE_Y + 0.7, -0.1, 0.9 * (0.85 + 0.15 * Math.sin(TT * 7) * Math.sin(TT * 3.1)));
  camPt(st, [lerp(CH.x + 0.8, 6.6, k), lerp(LEDGE_Y + 0.25, -0.5, k), lerp(4, 18, k)], [lerp(CH.x + 0.9, 6.9, k), lerp(LEDGE_Y + 0.55, -0.9, k), -0.5], 34, t, 0.3); renderStage(st, 0.85); bloom(0.12); pvTint('#06101c', 0.2); };

SHOT_FN.river = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); const mx = st.mouth[0], E = st.cast.erasto;
  bankAt(st, st.cast.father, mx - 2.2, -2.4, { yaw: 1.0, armR: [0.9 + 0.5 * ss(5.8, 6.4, lt) * Math.sin(TT * 5), 0.25, 0.3], emo: { smile: 0.4 } });
  const ex = mx + 0.3 + 0.08 * Math.sin(TT * 0.8); swimAt(E, ex, WL - 0.12, 1, 0.05, { z: lerp(-3.4, -2.6, k), amp: 0.6, emo: { fear: 0 } }); E.fish(true);   // speargun + mask up
  camPt(st, [lerp(mx - 6.5, mx - 2.4, k), lerp(5.8, 2.3, k), lerp(9, 4.6, k)], [lerp(mx, ex + 0.3, k), lerp(0.5, 0.45, k), -2.6], 36, t, 0.3); renderStage(st, 1.0); bloom(0.08);
  tagF(st, E, 'ERASTO', Math.min(ev(ST0('river') + 3.2, 0.3), 1 - ev(ST0('fish') - 0.4, 0.3)), 0.5); };

// he follows a big fish from the river down into the cenote and the shaft; the camera tracks him sideways and down
SHOT_FN.fish = (lt, dur, t) => { const st = caveStage(); reset(st); const mx = st.mouth[0], E = st.cast.erasto;
  const path = (tt) => { if (tt < 1.8) { const a = ss(0, 1.8, tt); return { x: lerp(mx + 0.6, mx + 0.02, a), y: lerp(WL - 0.15, WL - 0.62, a), z: lerp(-2.8, -0.55, a), dx: lerp(1, 0.25, a), dy: lerp(-0.2, -1, a) }; }
    const p = tun(lerp(0.085, 0.27, ss(1.8, 5.6, tt)), -0.05); return { x: p.x, y: p.y, z: -0.55, dx: p.dx, dy: p.dy }; };
  const q = path(lt), f = path(lt + 0.55); swimAt(E, q.x, q.y, q.dx, q.dy, { z: q.z, amp: 0.9, emo: { fear: 0, determined: 0.5 } }); E.fish(true);
  fishAt(st, f.x + f.dx * 0.9, f.y + f.dy * 0.9, f.z - 0.1, f.dx, f.dy);
  bubbles(st, [[q.x + q.dx * 0.8, q.y + q.dy * 0.8, 0.3]]); st.sheet.material.opacity = 0.75;
  const c = ss(0.3, dur, lt); camPt(st, [q.x + lerp(1.6, 0.9, c), q.y + lerp(2.6, 0.6, c), lerp(6.5, 5.2, c)], [q.x + 0.1, q.y + lerp(0.0, -1.55, c), lerp(-1.6, -0.6, c)], 36, t, 0.35, 3); renderStage(st, 0.95); bloom(0.1); };

// in the dark passage he loses the way and comes up in the air pocket; push in, darker
SHOT_FN.lost = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); dark(st, 0.95); blackout(st, 1); const E = st.cast.erasto, up = ss(3.7, 4.6, lt);
  let hx, hy; if (lt < 3.7) { const u = lerp(0.52, 0.985, ss(0, 3.7, lt)); swimIn(E, u, { amp: 1.3, ph: TT * 7, emo: { fear: 0.9 }, z: -0.55 }); [hx, hy] = headIn(u); E.P.head.rotation.y += 0.5 * Math.sin(TT * 2.3); bubbles(st, [[hx, hy, 0.6]]); }
  else { treadAt(E, CH.x - 1.25, -0.5, { yaw: 0.5 + 0.4 * Math.sin(TT * 1.3), emo: { fear: 0.6, open: 0.6 * (1 - ss(4.6, 5.6, lt)) } }, up); hx = CH.x - 1.25; hy = WL + 0.4; }
  lampAt(st, hx + 0.3, hy + 0.4, 0.4, 0.55); st.sheet.material.opacity = 0.35;
  const c = ss(2.8, 4.4, lt), tx = lerp(hx, CH.x - 1.2, c), ty = lerp(hy, WL + 0.1, c); camPt(st, [tx + 0.4, ty + lerp(0.6, 0.35, k), lerp(9.5, 5.2, k)], [tx, ty - 0.35, -0.5], 34, t, 0.35, 4); renderStage(st, 0.6); const [mpx, mpy] = toScreen(st, hx, hy - 0.3, -0.5); inkMask(mpx, mpy, 380, 0.94); bloom(0.06); pvTint('#000000', 0.2); };

// they search: people on the bank, a diver finds only the speargun ~65 m in (yellow circle); orbit round the find
SHOT_FN.search = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); const mx = st.mouth[0], D = st.cast.d2, G = st.gunAt;
  bankAt(st, st.cast.father, mx - 1.7, -1.6, { kneel: 1, yaw: 1.3, lean: 0.3, emo: { sad: 0.6 } }); bankAt(st, st.cast.p1, mx - 2.5, -2.3, { yaw: 1.1, armR: [0.4, 0.1, 1.9], emo: { sad: 0.4 } }); bankAt(st, st.cast.p2, mx - 2.2, -3.2, { yaw: 1.4, armL: [0.3, 0.2, 2.0], armR: [0.3, 0.2, 2.0], emo: { sad: 0.5 } });
  st.gun.visible = lt < 4.6; const ud = lerp(0.2, 0.37, ss(0.6, 3.8, lt)); swimIn(D, ud, { z: -0.55, v: -0.35, amp: lt < 3.8 ? 1 : 0.3 }); torch(D, true); beamS(D);
  if (lt > 4.6) { st.gun.visible = false; }   // he takes it
  const [hx, hy] = headIn(ud, -0.35); bubbles(st, [[hx, hy, 0.5]]); lampAt(st, hx + 0.4, hy, 0.3, 1.4); st.lineK(0); st.sheet.material.opacity = 0.8;
  // close on the find, then (with the 65 m span) a pull back that shows the whole way in from the cenote
  const p = ss(4.3, 6.0, lt), x0 = tun(0.02).x, mid = tun(0.22), a = lerp(-0.45, 0.32, k) * (1 - p), r = lerp(9, 4.8, ss(0, 3.6, lt)) + 15 * p;
  const cx = lerp(lerp(mx - 0.6, G[0] - 0.3, ss(0, 3.2, lt)), (x0 + G[0]) / 2, p), cy = lerp(lerp(1.2, G[1] - 0.25, ss(0, 3.2, lt)), mid.y + 0.4, p);
  camPt(st, [cx + Math.sin(a) * r, cy + lerp(2.2, 0.5, ss(0, 3.2, lt)), Math.cos(a) * r], [cx, cy - 0.15, -0.6], 34, t, 0.3, 5); renderStage(st, 0.92); bloom(0.12);
  const ca = ss(3.9, 4.3, lt); if (ca > 0) { const [px, py] = toScreen(st, G[0], G[1] + 0.05, G[2]); ctx.save(); screen(); ctx.strokeStyle = '#f2c81e'; ctx.lineWidth = 7; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(px, py, 95, -Math.PI / 2, -Math.PI / 2 + TAU * ca); ctx.stroke(); ctx.restore(); }
  if (lt > 5.1) cota(st, tun(0.02).x, G[0], tun(0.4, 1).y + 0.75, '65 m', ss(5.1, 5.5, lt)); };

// the days pass in the dark: a time-lapse of where he is (ledge, spring, lying, curled), the lamp flickering at each jump
SHOT_FN.days = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); dark(st, 0.62); const E = st.cast.erasto, sx = CH.x - 1.75;
  const PH = [0, 1.4, 3.0, 4.0, 5.0, 6.1], i = PH.filter((p) => lt >= p).length - 1, li = lt - PH[i], fl = Math.exp(-li * 6);
  if (i === 1 || i === 4) { const dr = ss(0.2, 0.6, li); treadAt(E, sx + 0.32, -0.6, { yaw: -1.3, armL: [lerp(0.9, 2.3, dr), 0.15, lerp(0.6, 1.9, dr)], armR: [lerp(0.9, 2.3, dr), 0.15, lerp(0.6, 1.9, dr)], headPitch: -0.35 * dr, emo: { blink: 0.7 } }); }
  else if (i === 2) lieAt(E, CH.x + 2.25, LEDGE_Y + 0.16, -0.6, Math.PI / 2, { emo: { blink: 1 } });
  else if (i === 5) sitAt(E, CH.x + 1.0, -0.6, { yaw: -0.3, lean: 0.55, headPitch: 0.5, armL: [0.9, 0.3, 1.8], armR: [0.9, 0.3, 1.8], emo: { sad: 0.8, blink: 0.8 } });
  else onLedge(st, { yaw: i ? 0.2 : -0.5, headPitch: 0.3, emo: { sad: 0.6, blink: 0.5 } });
  lampAt(st, CH.x + 0.2, WL + 1.2, 0.1, (0.9 + 0.25 * Math.sin(TT * 2.7)) * (1 + 1.6 * fl));
  const TG = [[CH.x + 1.15, LEDGE_Y + 0.55], [sx + 0.3, WL + 0.05], [CH.x + 1.45, LEDGE_Y + 0.25], [CH.x + 1.15, LEDGE_Y + 0.55], [sx + 0.3, WL + 0.05], [CH.x + 1.0, LEDGE_Y + 0.45]][i];
  const a = lerp(-0.3, 0.25, k) + 0.08 * li, r = 6.6 - 0.6 * ss(0, 1.4, li); camPt(st, [TG[0] + Math.sin(a) * r, TG[1] + 0.75, -0.5 + Math.cos(a) * r], [TG[0], TG[1] - 0.25, -0.5], 34, t, 0.3, 6); renderStage(st, 0.8 + 0.25 * fl); bloom(0.12 + 0.2 * fl); pvTint('#06101c', 0.18); };

// the team arrives; Gust kits up on the bank, then goes down the cenote unreeling the yellow line; the camera cranes down with him
SHOT_FN.gust = (lt, dur, t) => { const st = caveStage(); reset(st); const mx = st.mouth[0], Gu = st.cast.gust, D = st.cast.d2;
  bankAt(st, st.cast.father, mx - 3.0, -2.0, { yaw: 1.2, emo: { sad: 0.4 } }); bankAt(st, st.cast.p1, mx - 3.4, -2.9, { yaw: 1.1 }); bankAt(st, D, mx - 2.2, -2.5, { yaw: 1.0, armL: [0.6, 0.2, 1.2], armR: [0.6, 0.2, 1.2] });
  let gx = mx - 1.4, gy = 1.3, u = 0.04;
  if (lt < 3.0) bankAt(st, Gu, mx - 1.4, -1.3, { yaw: lerp(0.4, 1.4, ss(1.0, 2.6, lt)), armR: [lerp(0.3, 2.6, ss(0.8, 1.4, lt) * (1 - ss(2.2, 2.8, lt))), 0.2, 2.2], emo: { determined: 0.6 } });
  else if (lt < 3.6) { const j = ss(3.0, 3.6, lt); Gu.g.visible = true; Gu.g.rotation.set(0, 0, -1.2 * j); Gu.g.position.set(lerp(mx - 1.4, mx - 0.3, j), lerp(st.gy(mx - 1.4, -1.3), WL + 0.2, j), lerp(-1.3, -0.6, j)); posePerson(Gu.P, { yaw: Math.PI / 2, armL: [1.4, 0.2, 0.2], armR: [1.4, 0.2, 0.2] }); gx = mx - 0.6; gy = WL + 0.6; }
  else { u = lerp(0.045, 0.3, ss(3.6, dur + 0.6, lt)); swimIn(Gu, u, { z: -0.55, v: 0.0, ph: TT * 4.5, emo: { determined: 0.5 } }); [gx, gy] = headIn(u, 0); torch(Gu, true); beamS(Gu); bubbles(st, [[gx, gy, 0.5]]); lampAt(st, gx + 0.3, gy, 0.3, 1.3); st.lineK((u - 0.02) / 0.965); }
  const b = ss(3.0, 4.6, lt), bank = [mx + 2.0 - 0.4 * ss(0, 3, lt), 3.2 - 0.5 * ss(0, 3, lt), 5.4], fol = [mx + 1.3, gy + 0.6, 5.0];
  camPt(st, mixv(bank, fol, b), mixv([mx - 1.7, 1.45, -1.9], [gx, gy - 0.35, -0.5], b), 36, t, 0.35, 7); renderStage(st, 0.95); bloom(0.1);
  tagAt(st, gx + 0.75, gy + 0.1, -0.5, 'GUST', ev(ST0('gust') + 5.2, 0.3)); };

// after more than an hour he comes up the slope, surfaces in the chamber and shouts; push in on him (Erasto stays out of frame)
SHOT_FN.chamber = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); dark(st, 0.6); const g = st.cast.gust, sh = ss(5.0, 5.4, lt) * (1 - ss(6.6, 7.1, lt));
  onLedge(st, { emo: { fear: 0.4 } }); let hx, hy;
  if (lt < 2.7) { const u = lerp(0.86, 0.995, ss(0, 2.7, lt)); swimIn(g, u, { z: -0.45, v: 0.05, ph: TT * 4 }); [hx, hy] = headIn(u); bubbles(st, [[hx, hy, 0.6]]); st.lineK((u - 0.02) / 0.965); }
  else { treadAt(g, CH.x - 1.0, -0.45, { yaw: 1.1, headPitch: -0.25 * sh, armL: [lerp(0.9, 2.4, sh), 0.5, lerp(0.6, 1.8, sh)], emo: { open: 0.75 * sh, surprise: 0.3 * sh } }, ss(2.7, 3.5, lt)); hx = CH.x - 1.0; hy = WL + 0.5; st.lineK(1); }
  torch(g, true); lampAt(st, hx + 0.4, hy + 0.3, 0.1, 1.6);
  camPt(st, [lerp(5.4, 6.55, k), lerp(-0.2, 0.85, k), lerp(9.8, 4.0, k)], [lerp(5.3, 6.45, k), lerp(-0.5, 0.65, k), -0.5], 34, t, 0.3); renderStage(st, 0.85); bloom(0.12); };

// a weak voice answers: his beam sweeps the wall and finds Erasto behind the pillar, alive; dolly in over his shoulder
SHOT_FN.voice = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.lineK(1); dark(st, 0.82); const g = st.cast.gust, sw = ss(0.4, 2.4, lt), alive = ss(3.2, 3.8, lt);
  onLedge(st, { yaw: -0.8, armR: [lerp(0.4, 1.3, ss(0.9, 1.4, lt)), 0.3, 0.5], headPitch: 0.1, emo: { fear: 0.5 * (1 - alive), smile: 0.5 * alive, sad: 0.3, open: 0.2 * ss(0.9, 1.3, lt) * (1 - ss(1.6, 2.0, lt)) } });
  treadAt(g, CH.x - 1.0, -0.45, { yaw: lerp(0.5, 1.35, sw), armR: [1.5, 0.15, 0.1], emo: { surprise: 0.6 * ss(1.0, 1.3, lt), smile: 0.5 * alive } }); torch(g, true);
  lampAt(st, lerp(CH.x - 0.3, CH.x + 1.1, sw), lerp(1.5, 1.05, sw), lerp(-0.7, -0.25, sw), lerp(1.6, 2.6, sw));
  camPt(st, [lerp(7.9, 8.5, k), lerp(1.45, 1.2, k), lerp(4.2, 3.3, k)], [lerp(8.45, 8.7, k), lerp(0.85, 0.95, k), -0.6], lerp(36, 31, k), t, 0.3, 8); renderStage(st, 0.85 + 0.2 * sw); bloom(0.16); pvTint('#06101c', 0.15); };

// he has no gear to bring him out: tells him his family is waiting and he'll be back; a slow orbit round the two
SHOT_FN.promise = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.lineK(1); dark(st, 0.45); const E = st.cast.erasto, g = st.cast.gust;
  const no = ss(0.8, 1.2, lt) * (1 - ss(2.4, 2.8, lt)), fam = ss(3.5, 4.0, lt) * (1 - ss(5.3, 5.6, lt)), back = ss(5.5, 5.9, lt);
  sitAt(E, CH.x + 1.05, -0.65, { yaw: 1.0, headPitch: 0.15 - 0.15 * fam, emo: { sad: 0.6 * (1 - back), cry: 0.6 * fam, smile: 0.3 * back, determined: 0.3 * back } });
  kneelAt(g, CH.x + 1.85, -0.4, { yaw: -1.35, headYaw: 0.35 * no * Math.sin(TT * 9), armL: [lerp(0.3, 1.25, fam), lerp(0.2, -0.1, fam), 0.3], armR: [lerp(0.3, 1.6, back), 0.05, 0.1], emo: { sad: 0.3 * no, smile: 0.4 * fam, determined: 0.6 * back } });
  g.gearOn(true, false); torch(g, false); lampAt(st, CH.x + 1.4, LEDGE_Y + 1.2, 0.1, 1.5);
  const a = lerp(-0.42, 0.28, k), r = lerp(5.4, 4.4, k), c = [CH.x + 1.5, LEDGE_Y + 0.4, -0.55]; camPt(st, [c[0] + Math.sin(a) * r, c[1] + lerp(0.6, 0.35, k), c[2] + Math.cos(a) * r], c, 32, t, 0.3, 9); renderStage(st, 0.9); bloom(0.12); };

// back out along the line (the camera leads him), then outside: nobody can believe it
SHOT_FN.out = (lt, dur, t) => { const st = caveStage(); reset(st); st.lineK(1); const g = st.cast.gust, mx = st.mouth[0];
  if (lt < 2.6) { const k = ss(0, 2.6, lt), u = lerp(0.84, 0.6, k); swimTun(g, u, { z: -0.45, v: 0.05, ph: TT * 6, emo: { determined: 0.6 } }); torch(g, true); beamS(g); const [hx, hy] = headIn(u, 0.05, -1); bubbles(st, [[hx, hy, 0.5]]); lampAt(st, hx - 0.3, hy, 0.3, 1.3); st.sheet.material.opacity = 0.8;
    camPt(st, [hx - lerp(0.5, 1.1, k), hy + 0.6, lerp(5.8, 6.6, k)], [hx - 0.15, hy - 0.3, -0.5], 34, t, 0.4, 10); renderStage(st, 0.9); bloom(0.12); return; }
  const k = ss(2.6, dur, lt), w = ss(2.9, 3.4, lt);
  treadAt(g, mx + 0.05, -0.55, { yaw: -0.6, armR: [lerp(0.9, 2.5, ss(3.4, 3.8, lt)), 0.4, 0.4], emo: { smile: 0.5 } });
  bankAt(st, st.cast.father, mx - 1.6, -1.7, { yaw: 1.5, armL: [lerp(0.2, 2.7, w), 0.4, lerp(0.2, 2.2, w)], armR: [lerp(0.2, 2.7, w), 0.4, lerp(0.2, 2.2, w)], emo: { surprise: 0.8 * w, cry: 0.4 * ss(3.8, 4.4, lt) } });
  bankAt(st, st.cast.p1, mx - 2.4, -2.4, { yaw: 1.2, armL: [lerp(0.2, 3.0, w), 0.3, 0.3], armR: [lerp(0.2, 3.0, w), 0.3, 0.3], emo: { surprise: 0.8 * w, smile: 0.3 } });
  bankAt(st, st.cast.p2, mx - 2.1, -3.2, { yaw: 1.3, armR: [lerp(0.2, 1.1, w), -0.1, lerp(0.2, 2.4, w)], emo: { surprise: 0.9 * w } });
  camPt(st, [mx + lerp(2.4, 1.5, k), lerp(1.9, 1.7, k), lerp(7.0, 5.8, k)], [mx - 1.1, lerp(2.0, 2.2, k), -2.4], 36, t, 0.35, 11); renderStage(st, 1.0); bloom(0.08); };

// he comes back with a second diver, both carrying spare yellow tanks; lateral tracking through the passage
SHOT_FN.back = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.lineK(1); const g = st.cast.gust, D = st.cast.d2, ug = lerp(0.3, 0.6, k), ud = ug - 0.095;
  swimIn(g, ug, { z: -0.35, v: 0.15, ph: TT * 5 }); swimIn(D, ud, { z: -0.75, v: -0.4, ph: TT * 5 + 1.7 }); [g, D].forEach((F) => { torch(F, true); beamS(F); F.P.arms[0].sh.rotation.x = -2.6; F.P.arms[0].el.rotation.x = -0.1; });   // the left arm reaches ahead with the tanks
  st.spare.forEach((s) => (s.visible = true)); const [gx, gy] = headIn(ug, 0.15), [dx, dy] = headIn(ud, -0.4); bubbles(st, [[gx, gy, 0.5], [dx, dy, 0.5]]); lampAt(st, (gx + dx) / 2, gy + 0.2, 0.3, 1.5); st.sheet.material.opacity = 0.7;
  const m = tun((ug + ud) / 2); camPt(st, [m.x + 0.5, m.y + lerp(0.6, 0.3, k), lerp(8.6, 7.4, k)], [m.x + 0.4, m.y - 0.75, -0.5], 38, t, 0.35, 12); renderStage(st, 0.92); bloom(0.12);
  tagF(st, D, 'BUZO 2', ev(ST0('back') + 2.0, 0.3), 0.45); };

// the regulator and the steps: Gust kneels by him, the tank goes on, a finger up for each step; close, a slow arc
SHOT_FN.brief = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.lineK(1); dark(st, 0.4); const E = st.cast.erasto, g = st.cast.gust, D = st.cast.d2;
  const put = ss(1.0, 1.6, lt) * (1 - ss(2.2, 2.6, lt)), step = ss(3.0, 3.3, lt) * (1 - ss(4.4, 4.7, lt)), slow = ss(4.5, 4.8, lt) * (1 - ss(5.4, 5.7, lt)), line = ss(5.5, 5.9, lt);
  if (lt > 1.5) E.gearOn(true, false);
  sitAt(E, CH.x + 1.05, -0.65, { yaw: 0.85, headPitch: 0.12 * Math.sin(TT * 4) * ss(3.6, 4.0, lt) * (1 - ss(5.0, 5.3, lt)), emo: { fear: 0.4 * (1 - ss(3.5, 4.5, lt)), determined: 0.5 * ss(4.5, 5.5, lt) } });
  kneelAt(g, CH.x + 1.85, -0.38, { yaw: -1.25, armL: [lerp(0.3, 1.35, put), -0.1, 0.4], armR: [step ? lerp(0.3, 2.2, step) : lerp(0.3, 1.5, Math.max(slow, line)), lerp(0.1, 0.25, line), lerp(0.2, 1.4, step) + 0.4 * slow * Math.sin(TT * 3)], emo: { smile: 0.3, determined: 0.4 } });
  g.gearOn(true, false); treadAt(D, CH.x - 0.4, -0.35, { yaw: 1.2, emo: { smile: 0.3 } }); torch(D, true); st.spare[1].visible = lt < 1.5;
  lampAt(st, CH.x + 1.4, LEDGE_Y + 1.25, 0.15, 1.6);
  camPt(st, [lerp(CH.x + 2.4, CH.x + 1.5, k), lerp(1.55, 1.3, k), lerp(4.3, 3.6, k)], [lerp(CH.x + 1.45, CH.x + 1.5, k), LEDGE_Y + 0.32, -0.5], 32, t, 0.3, 13); renderStage(st, 0.9); bloom(0.12); };

// out in single file along the line, up the slope: diver ahead, Erasto in the middle, Gust behind; the camera rides along, names over them
SHOT_FN.file = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.lineK(1); const uE = lerp(0.85, 0.77, k), E = st.cast.erasto, gap = 0.135;
  E.gearOn(true, false); const row = [[st.cast.d2, uE - gap, -0.3, -0.3, 'BUZO 2'], [E, uE, -0.7, -0.35, 'ERASTO'], [st.cast.gust, uE + gap, -0.4, -0.3, 'GUST']];
  row.forEach(([F, u, z, v], i) => { swimTun(F, u, { z, v, ph: TT * 4.5 + i * 1.3, amp: 0.7, emo: { fear: F === E ? 0.3 : 0 } }); torch(F, F !== E); beamS(F); });
  bubbles(st, row.map(([, u, , v]) => { const [x, y] = headIn(u, v, -1); return [x, y, 0.5]; })); st.sheet.material.opacity = 0.55;
  // the camera rides back along the file as each one is named (diver, Erasto, Gust), then pulls back to show the three
  const f = knots([[0, -0.5], [1.5, -1], [2.4, -1], [2.95, 0], [3.35, 0], [3.85, 1], [4.3, 1], [dur, 0]], lt), d = knots([[0, 8], [1.5, 4.6], [4.3, 4.6], [dur, 15]], lt);
  const c = tun(uE + f * gap, -0.3), hx = c.x - c.dx * 0.15, hy = c.y - c.dy * 0.15; lampAt(st, hx, hy + 0.5, 0.3, 1.6);
  camPt(st, [hx + 0.2, hy + 0.3, d], [hx, hy - 0.06 * d, -0.5], 40, t, 0.3); renderStage(st, 0.95); bloom(0.12);
  row.forEach(([F, , , , s], i) => tagF(st, F, s, ev(ST0('file') + [1.9, 2.8, 3.6][i], 0.3), 0.5)); };

// up the cenote and into the daylight; the camera cranes up out of the water with him
SHOT_FN.light = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); st.lineK(1); const mx = st.mouth[0], E = st.cast.erasto, g = st.cast.gust, up = ss(1.2, 1.8, lt);
  E.gearOn(true, false); let ey; if (lt < 1.3) { const u = lerp(0.17, 0.06, ss(0, 1.3, lt)); swimTun(E, u, { z: -0.6, v: 0, ph: TT * 6 }); ey = headIn(u, 0, -1)[1]; } else { treadAt(E, mx + 0.05, -0.6, { yaw: 0.3, armL: [lerp(0.9, 2.6, ss(1.7, 2.2, lt)), 0.5, 0.4], emo: { smile: 0.7 * up, cry: 0.3 * up } }, up); ey = WL + 0.4; }
  swimTun(g, lerp(0.27, 0.12, k), { z: -0.45, v: 0.1, ph: TT * 5 }); torch(g, true); beamS(g);
  bankAt(st, st.cast.father, mx - 1.5, -1.3, { kneel: 1, yaw: 1.4, lean: 0.4, armR: [1.6 * up, 0.1, 0.2], emo: { cry: 0.6 * up, smile: 0.4 * up } });
  camPt(st, [mx + lerp(0.9, 1.5, k), lerp(-1.2, 1.7, k), lerp(5.0, 6.4, k)], [mx - lerp(0, 1.0, k), lerp(ey - 0.2, 2.1, k), lerp(-0.6, -2.4, k)], lerp(36, 40, k), t, 0.35, 15); renderStage(st, lerp(0.8, 1.15, up)); bloom(lerp(0.1, 0.32, up));
  pvTint('#fff6e0', 0.75 * ss(1.35, 1.55, lt) * (1 - ss(1.55, 2.5, lt))); };

// the stretcher to the ambulance; his father beside him; a dolly alongside
SHOT_FN.hospital = (lt, dur, t) => { const st = caveStage(), k = ss(0, dur, lt); reset(st); const mx = st.mouth[0], sx = lerp(mx - 2.0, mx - 4.2, k), sz = -2.6, gy = st.gy(sx, sz);
  st.amb.visible = true; st.amb.position.set(mx - 7.4, st.gy(mx - 7.4, -3.2), -3.2); st.amb.rotation.y = -0.15;
  st.stretcher.visible = true; st.stretcher.position.set(sx, gy + 0.82, sz);
  lieAt(st.cast.erasto, sx + 0.88, gy + 0.98, sz, Math.PI / 2, { headPitch: -0.2, emo: { blink: 0.6, smile: 0.2 } });
  [[st.cast.p1, sx - 1.32], [st.cast.p2, sx + 1.32]].forEach(([F, x], i) => bankAt(st, F, x, sz, { yaw: -Math.PI / 2, walk: 0.8, ph: TT * 6 + i * 2, armL: [0.55, 0.1, 0.4], armR: [0.55, 0.1, 0.4] }));
  bankAt(st, st.cast.father, sx - 0.2, sz + 0.7, { yaw: -Math.PI / 2 + 0.3, walk: 0.8, ph: TT * 6 + 1, armL: [0.9, -0.3, 0.3], emo: { sad: 0.4, smile: 0.3 } });
  camPt(st, [sx + lerp(1.8, 0.4, k), gy + lerp(1.3, 1.15, k), lerp(7.6, 6.6, k)], [sx - lerp(0.0, 0.8, k), gy + 1.75, sz - 1.5], 40, t, 0.4, 16); renderStage(st, 1.0); bloom(0.08); };

// the whole cutaway: the full yellow line from the cenote to the chamber; a long pull back
SHOT_FN.end = (lt, dur, t) => { const st = caveStage(), k = ss(0, 2.1, lt), h = ss(2.1, dur, lt); reset(st); st.lineK(1); const mx = st.mouth[0];
  bankAt(st, st.cast.erasto, mx - 1.6, -1.5, { yaw: 0.9, armL: [0.6, 0.3, 0.5], emo: { smile: 0.5 } }); bankAt(st, st.cast.father, mx - 2.1, -1.7, { yaw: 1.3, armR: [0.8, -0.3, 0.6], emo: { smile: 0.6 } });
  lampAt(st, CH.x + 0.8, LEDGE_Y + 0.7, -0.1, 0.6);
  camPt(st, [lerp(CH.x + 0.6, 1.5, k), lerp(1.0, 9.5, k) - 0.6 * h, lerp(5.0, 53, k) - 1.5 * h], [lerp(CH.x + 0.6, 1.5, k), lerp(0.8, 1.1, k), lerp(-0.5, -2, k)], 34, t, 0.2, 17); renderStage(st, 0.95); bloom(0.1); };
