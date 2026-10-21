
// =====================================================================
//  CROWD — the people (all skinned bodies): walkers and joggers along the promenade, people at the railing (one films
//  the bay), kids playing at the fountain with their parents on the rim, a couple on another bench; gulls over the bay.
//  When the sea comes back they run from the railing toward the plaza, scared.
// =====================================================================
const TOPS = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#f4f1ea', '#ef8a3a', '#3a8a5a', '#1f2d3d', '#c8a070'];
const BOTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#6a5a4a', '#405a7a'];
function person(R, o = {}) { const f = o.female ?? R.f() < 0.5; return makePerson(Object.assign({ female: f, skin: R.pick(SKINS), hair: R.pick(HAIRS), hairStyle: R.pick(f ? ['bob', 'pony', 'long', 'bun', 'curly'] : ['short', 'short', 'curly', 'none']), top: R.pick(TOPS), bottom: R.pick(BOTS), sleeve: R.f() < 0.6 ? 'short' : 'long', shorts: R.f() < 0.2, seed: R.int ? R.int(1, 999) : Math.floor(R.f() * 999) }, o)); }
function buildCrowd(st) {
  const R = RNG('crowd2'), C = { walkers: [], rail: [], kids: [], rim: [], couple: [] };
  for (let k = 0; k < 14; k++) { const jog = k % 5 === 4, P = person(R, jog ? { shorts: true, sleeve: 'short' } : {}); st.scene.add(P.root); const w = { P, z: k % 3 === 0 ? R.r(-4.6, -2.0) : R.r(-9.1, -7.6), x0: R.r(-40, 40), v: (jog ? R.r(2.6, 3.2) : R.r(0.9, 1.35)) * (k % 2 ? 1 : -1), jog, ph: R.r(0, 6) };
    const xb = ((w.x0 + w.v * 13.75 + 45) % 90 + 90) % 90 - 45; if (w.z < -7 && Math.abs(xb) < 6) w.x0 += 12 * Math.sign(xb || 1); C.walkers.push(w); }
  [[-2.3, 0.2], [-1.6, -0.3], [1.7, 0.1], [3.7, 0.4], [4.5, -0.2]].forEach(([x, yaw], k) => { const P = person(R, k === 2 ? { female: true, hairStyle: 'long' } : {}); st.scene.add(P.root); C.rail.push({ P, x, yaw: Math.PI + yaw, phone: k === 2, lean: k % 2 }); });
  for (let k = 0; k < 4; k++) { const P = person(R, { kid: true, shorts: R.f() < 0.6, sleeve: 'short' }); st.scene.add(P.root); C.kids.push({ P, a0: k * 1.6, r: PLZ.FR + R.r(0.8, 1.6), v: R.r(0.5, 0.8) * (k % 2 ? 1 : -1), ph: R.r(0, 6) }); }
  [[0.6], [2.4]].forEach(([a], k) => { const P = person(R, { female: k === 0 }); st.scene.add(P.root); C.rim.push({ P, a }); });
  [[-6.2, 0.2], [-5.4, 0.2]].forEach(([x], k) => { const P = person(R, { female: k === 1 }); st.scene.add(P.root); C.couple.push({ P, x }); });
  // the couple's bench
  const slatM = STDm({ color: '#8a6040', roughness: 0.75 }); for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.035, 0.085), slatM); s.position.set(-5.8, 0.45, BENCHZ + 0.13 + k * 0.1); s.castShadow = true; st.scene.add(s); }
  // gulls
  const gullM = STDm({ color: '#f4f4f0' }), wingM = STDm({ color: '#c8ccd0' }); C.gulls = []; for (let k = 0; k < 9; k++) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.3, 4, 10).rotateZ(Math.PI / 2), gullM); g.add(b);
    const w = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(0, 0.02, s * 0.05); g.add(p); const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.012, 0.5).translate(0, 0, s * 0.25), wingM); p.add(m); return p; }); st.scene.add(g); C.gulls.push({ g, w, cx: R.r(-30, 40), cz: R.r(-60, -20), cy: R.r(6, 16), r: R.r(8, 20), v: R.r(0.2, 0.35) * (k % 2 ? 1 : -1), ph: R.r(0, 6) }); }
  return C; }
// panic = 0..1 after the sea comes back; tsP = seconds since
function poseCrowd(C, ts, panic, tsP, frozen) {
  const fear = panic ? { fear: panic, open: panic * 0.9, tremble: panic } : null;
  C.walkers.forEach((w, i) => { const x0 = w.x0 + w.v * ts, run = w.jog ? 1 : panic, z = lerp(w.z, w.z + 6 * tsP, panic * (i % 2)); const x = ((x0 + w.v * 1.6 * tsP * panic + 45) % 90 + 90) % 90 - 45, away = panic && i % 2;
    posePerson(w.P, { x, z, yaw: away ? 0 : w.v > 0 ? Math.PI / 2 : -Math.PI / 2, walk: 1 - run, run, ph: ts * (6 + 4 * run) + w.ph, headYaw: panic * (i % 3 === 0 ? 1.2 : 0), armL: panic && i % 4 === 0 ? [2.6, 0.3, 1.6] : null, armR: panic && i % 4 === 0 ? [2.6, 0.3, 1.6] : null, emo: fear || { smile: 0.4 } }); });
  C.rail.forEach((r, i) => { const flee = panic * ss(0.3, 1.0, tsP), rz = BAY.WALL + 0.75 + flee * 7 * Math.max(0, tsP - 0.5);
    posePerson(r.P, { x: r.x, z: rz, yaw: flee > 0.3 ? 0.1 * (i - 2) : r.yaw, walk: flee > 0.3 ? 0 : 0, run: flee > 0.3 ? 1 : 0, ph: ts * 10 + i, lean: flee > 0.3 ? 0 : 0.12 * r.lean, headPitch: 0.1, headYaw: flee > 0.3 ? 0 : 0.2 * Math.sin(ts * 0.3 + i),
      armL: flee > 0.3 ? (i % 2 ? [2.4, 0.4, 1.8] : null) : r.lean ? [1.2, 0.2, 0.5] : null, armR: flee > 0.3 ? null : r.phone ? [1.5, 0.1, 1.4] : r.lean ? [1.2, 0.2, 0.5] : null, emo: fear || { smile: 0.3 } }); });
  C.kids.forEach((k, i) => { const a = k.a0 + k.v * ts / k.r * 2, x = PLZ.FX + Math.cos(a) * k.r, z = PLZ.FZ + Math.sin(a) * k.r; posePerson(k.P, { x, z, yaw: Math.atan2(-Math.sin(a) * k.v, Math.cos(a) * k.v) + Math.PI / 2 * 0, run: 1, ph: ts * 11 + k.ph, armL: [0.6 + 0.6 * Math.sin(ts * 4 + i), 0.5, 0.6], emo: fear || { smile: 0.9, open: 0.5 } }); });
  C.rim.forEach((m, i) => { const x = PLZ.FX + Math.cos(m.a) * (PLZ.FR + 0.25), z = PLZ.FZ + Math.sin(m.a) * (PLZ.FR + 0.25); posePerson(m.P, { x, z, y: 0.04, yaw: -m.a + Math.PI / 2 + Math.PI, sit: 1, headYaw: 0.3 * Math.sin(ts * 0.3 + i), armR: [0.5, 0.2, 1.0], emo: fear || { smile: 0.5 } }); });
  C.couple.forEach((c, i) => posePerson(c.P, { x: c.x, z: BENCHZ + 0.34, y: 0, yaw: Math.PI, sit: 1, headYaw: (i ? -0.5 : 0.5) * (1 - panic) + panic * 0.0, armL: i ? null : [0.9, -0.4, 0.8], emo: fear || { smile: 0.7 } }));
  C.gulls.forEach((g) => { const a = g.ph + g.v * ts; g.g.position.set(g.cx + Math.cos(a) * g.r, g.cy + 0.6 * Math.sin(ts * 0.7 + g.ph), g.cz + Math.sin(a) * g.r * 0.6); g.g.rotation.y = -a - (g.v > 0 ? Math.PI / 2 : -Math.PI / 2); const fl = 0.6 * Math.sin(ts * 8 + g.ph); g.w[0].rotation.x = fl; g.w[1].rotation.x = -fl; });
}
