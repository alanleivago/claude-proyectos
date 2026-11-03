
// =====================================================================
//  SHOTS — one stage per place, a slow handheld move per shot; the dissolves run on the shot clock
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
const V3 = (a) => new THREE.Vector3(...a);
function camPt(st, p, q, f, t, amt = 0.5, seed = 1) { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); fov(st, f); handheld(st.cam, t, amt, seed); }
const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
// a holy interior: the dissolve runs from 0.15 s to 1.15 s into the shot; the light comes in as the walls go
function holy(key, build, p0, p1, q, f, o = {}) { return (lt, dur, t) => { const S = once(key, () => { const S = build(); S.dis = dissolver(S.st, S.A, o.n || 9000, key, { col: o.col }); return S; }), st = S.st, k = o.keep ? 0 : ss(o.d0 ?? 0.3, (o.d0 ?? 0.3) + (o.dd ?? 0.85), lt);
  S.dis.set(k); if (key === 'bud') poseBud(S, t); const u = EZ.io(clamp(lt / dur)); camPt(st, mixv(p0, p1, u), q, f, t, 0.5, key.length); st.key.intensity = (o.key ?? 0.8) + 1.0 * k;
  renderStage(st, (o.exp ?? 1.0) - 0.08 * k); bloom(0.22 + 0.08 * k); }; }
SHOT_FN.cath = holy('cath', buildCathedral, [0, 1.75, 7], [0, 1.75, 3.5], [0, 5.2, -34], 58, { keep: true, exp: 1.05 });
SHOT_FN.mosq = holy('mosq', buildMosque, [0, 1.7, 9], [0, 1.7, 8], [0, 4.2, -14], 66, { exp: 0.68 });
SHOT_FN.syn = holy('syn', buildSynagogue, [0, 1.7, 8], [0, 1.7, 7], [0, 3.6, -17], 62);
SHOT_FN.hin = holy('hin', buildHindu, [0, 1.7, 5], [0, 1.7, 4], [0, 2.8, -20], 60, { exp: 0.9 });
SHOT_FN.bud = holy('bud', buildBuddhist, [0, 1.6, 8], [0, 1.6, 7], [0, 3.4, -15], 62);
SHOT_FN.plaza = (lt, dur, t) => { const S = once('plaza', () => { const S = buildPlazaChurch(); S.dis = dissolver(S.st, S.A, 14000, 'plz', { size: 1.6, spread: 1.5, rise: 5 }); return S; }), st = S.st, k = ss(11.5, 14.4, t), u = EZ.io(seg(t, 11, 15));
  S.dis.set(k); S.sp.forEach(([x, z, yaw], i) => S.crowd.set(i, x, 0, z, yaw, 1, i % 5 === 0 ? 0.5 * ss(12, 13, t) : 0, 0)); S.crowd.done();
  camPt(st, [lerp(-1.5, 1.0, u), 1.7, lerp(10, 7, u)], [0, lerp(12, 15, u), -30], 62, t, 0.6, 3); renderStage(st, 1.0); bloom(0.35 + 0.2 * k); };
SHOT_FN.aerial = (lt, dur, t) => { const S = once('aerial', buildAerial), st = S.st, u = EZ.io(seg(t, 15, 18)); S.dis.forEach((d) => d.d.set(ss(d.ts, d.ts + 0.8, t)));
  camPt(st, [lerp(-12, 10, u), lerp(165, 155, u), lerp(70, 55, u)], [0, 0, -150], 54, t, 0.35, 4); renderStage(st, 0.95); bloom(0.25); };
SHOT_FN.vat = (lt, dur, t) => { const S = once('vat', () => { const S = buildVatican(); S.dis = dissolver(S.st, S.A, 30000, 'vat', { size: 4.0, spread: 4, rise: 14, dur: 1.4 }); return S; }), st = S.st, k = ss(18.8, 21.8, t), u = EZ.io(seg(t, 18, 23));
  S.dis.set(k); camPt(st, [0, lerp(34, 30, u), lerp(120, 100, u)], [0, lerp(34, 24, u), -150], 52, t, 0.4, 5); renderStage(st, 0.8); bloom(0.3 + 0.2 * k); };
SHOT_FN.gang = (lt, dur, t) => { const S = once('gang', () => { const S = buildGanges(); S.dis = dissolver(S.st, S.A, 12000, 'gng', { size: 2.2, spread: 2, rise: 8 }); return S; }), st = S.st, k = ss(23.6, 26.0, t), u = EZ.io(seg(t, 23, 28));
  S.dis.set(k); S.diyas.forEach((d) => { d.d.position.y = 0.42 + 0.03 * Math.sin(t * 2 + d.ph); d.d.material.opacity = 0.75 + 0.25 * Math.sin(t * 9 + d.ph * 3); });
  camPt(st, [lerp(-4, 4, u), 2.4 + 0.08 * Math.sin(t * 1.3), lerp(30, 24, u)], [0, 3, -45], 56, t, 0.4, 6); st.cam.rotation.z += 0.01 * Math.sin(t * 1.1); reflectWater(S, st, t); renderStage(st, 1.0); bloom(0.35); lensFlare(st, dirV(200 * DEG, 14 * DEG), 0.0); };
SHOT_FN.names = (lt, dur, t) => { const S = once('names', () => { const S = buildNames(); S.dn = S.cards.slice(0, 2).map((c, i) => { const g = new THREE.Group(); c.g.add(g); g.add(c.tx); return dissolver(S.st, g, 1800, 'nm' + i, { size: 0.012, spread: 0.08, rise: 0.25 }); }); return S; }), st = S.st, u = EZ.io(seg(t, 28, 33));
  S.dn.forEach((d, i) => d.set(ss(31.1 + i * 0.25, 32.1 + i * 0.25, t))); posePerson(S.nurse, { x: lerp(2.2, -1.0, seg(t, 28, 33)), z: -4.6, yaw: -Math.PI / 2, walk: 1, ph: t * 5 });
  camPt(st, [lerp(0.05, -0.1, u), lerp(1.85, 1.75, u), lerp(2.5, 2.2, u)], [-0.12, 0.5, -0.5], 50, t, 0.3, 7); renderStage(st, 1.05); bloom(0.3); };
SHOT_FN.bill = (lt, dur, t) => { const S = once('bill', () => { const S = buildBill(); S.dm = dissolver(S.st, S.motto, 2500, 'usd', { size: 0.01, spread: 0.02, rise: 0.06, col: '#c8f0c0' }); return S; }), st = S.st, u = EZ.io(seg(t, 33, 38));
  S.dm.set(ss(35.9, 36.9, t)); const H = S.HR, Y = new THREE.Vector3(-0.45, -0.12, -0.88).normalize(), Zc = new THREE.Vector3(0, 1, 0), Z = Zc.addScaledVector(Y, -Zc.dot(Y)).normalize(), X = new THREE.Vector3().crossVectors(Y, Z);
  H.root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); H.root.position.set(0.15 + 0.01 * Math.sin(t), 0.975, 0.31); poseHand(H, { curl: [0.12, 0.1, 0.2, 0.3], spread: 0.25, thumb: 0.3, tremble: 0.2 });
  camPt(st, [lerp(0.06, 0.03, u), lerp(1.26, 1.2, u), lerp(0.48, 0.42, u)], [0.02, 0.935, 0.11], 38, t, 0.25, 8); renderStage(st, 1.05); bloom(0.25); };
function stadShot(p0, p1, q, f) { return (lt, dur, t) => { const S = once('stad', buildStadium), st = S.st, u = EZ.io(clamp(lt / dur)); poseStadium(S, t); camPt(st, mixv(p0, p1, u), q, f, t, 1.0, 9); renderStage(st, 1.1); bloom(0.55); }; }
SHOT_FN.stad1 = stadShot([25, 9, 66], [18, 9.5, 66], [-10, 6, -60], 56);
SHOT_FN.stad2 = stadShot([2, 4.2, -61.5], [0.5, 4.3, -61.8], [-1, 7.5, -72], 60);
SHOT_FN.stad3 = stadShot([-16, 3.0, 61], [-17.5, 3.2, 61], [-22, 10, 76], 62);
SHOT_FN.stad4 = stadShot([62, 48, 92], [56, 44, 84], [0, 0, 0], 52);
SHOT_FN.jewel = (lt, dur, t) => { const S = once('jewel', buildJewel), st = S.st, u = EZ.io(seg(t, 45.5, 51)), shake = ss(46.5, 46.6, t) * (1 - ss(46.8, 47.6, t)); poseJewel(S, t);
  camPt(st, [lerp(2.6, 2.2, u), 1.5, lerp(4.2, 3.4, u)], [0, 1.6, -6], 50, t, 0.5 + 6 * shake, 10); renderStage(st, 1.1); bloom(0.45); };
SHOT_FN.war = (lt, dur, t) => { const S = once('war', buildWar), st = S.st, u = EZ.io(seg(t, 51, 56)); S.glow.material.emissiveIntensity = 1.4 * ss(52.4, 53.6, t);
  const p = S.flag.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x0 = S.fbase[i * 3]; p.setZ(i, 0.25 * Math.sin(t * 4 + x0 * 1.4) * x0 / 4); } p.needsUpdate = true;
  camPt(st, [0, lerp(7, 24, u), lerp(24, 10, u)], [0, 0, -70], 54, t, 0.3, 11); renderStage(st, 1.0); bloom(0.3); };
SHOT_FN.hosp = (lt, dur, t) => { const S = once('hosp', buildHosp), st = S.st, u = EZ.io(seg(t, 56, 60)); poseHosp(S, t);
  camPt(st, [lerp(1.2, 0.9, u), 1.45, lerp(3.2, 2.2, u)], [-1.3, 0.9, -0.7], 50, t, 0.35, 12); renderStage(st, 1.0); bloom(0.3); };
SHOT_FN.card = () => {};
// placeholders until the outdoor sets exist
['plaza', 'aerial', 'vat', 'gang', 'names', 'bill', 'stad1', 'stad2', 'stad3', 'stad4', 'jewel', 'war', 'hosp'].forEach((k) => { if (!SHOT_FN[k]) SHOT_FN[k] = () => fillAll('#303030'); });
