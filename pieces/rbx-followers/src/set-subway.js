// rbx-followers SUBWAY set: one long subway car (x -6..6, z -60..8, floor y 0, ceiling y 9.5), the end door at z=8.
// Grey-blue walls, orange bench seats along both sides, chrome poles + overhead rails with hand loops, ad strips,
// fluorescent tubes, windows onto a dark tunnel with streaking lamps. Rows of the car repeat every 12 along -z.
'use strict';
SETS.subway = async function (ctx) {
  const T = THREE, { cnv, tex, pbr, rng } = RBX, { V, texPair, noiseOver, box, rb } = KIT, PI = Math.PI;
  const scene = new T.Scene(); scene.background = new T.Color('#030306');
  const W = 6, Z0 = -84, Z1 = 8, H = 9.5;
  const add = (...o) => { o.forEach((m) => scene.add(m)); return o[0]; };
  const SM = (c, r = 0.6, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const floorT = texPair(512, (g, hg, S) => { g.fillStyle = '#4a4e58'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 4, 0.3, 16, 4); const r = rng(5); for (let i = 0; i < 3000; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.25)'; g.fillRect(r() * S, r() * S, 2, 2); }
    for (let y = 0; y < S; y += 32) { hg.fillStyle = '#a0a0a0'; hg.fillRect(0, y, S, 4); } });
  const M = { floor: pbr(floorT.c, floorT.h, { rough: 0.7, bump: 2, repeat: [1 / 4, 1 / 4] }), wall: SM('#c8d0d8', 0.45), panel: SM('#9aa6b4', 0.4), seat: new T.MeshPhysicalMaterial({ color: '#e8701e', roughness: 0.3, clearcoat: 0.6 }),
    chrome: SM('#dfe4ea', 0.15, 1.0), dark: SM('#1a1c22', 0.6), rub: SM('#22242a', 0.9), stripe: SM('#2F7BF5', 0.4), glass: new T.MeshPhysicalMaterial({ color: '#0a0e18', roughness: 0.04, metalness: 0.2, clearcoat: 1 }) };
  // shell: floor, ceiling (with tube light strips), walls with a window band, blue stripe
  add(box(2 * W, 0.4, Z1 - Z0, M.floor, 0, -0.2, (Z0 + Z1) / 2, true), box(2 * W, 0.3, Z1 - Z0, M.wall, 0, H + 0.15, (Z0 + Z1) / 2));
  [-1, 1].forEach((s) => { add(box(0.3, 3.2, Z1 - Z0, M.panel, s * (W + 0.15), 1.6, (Z0 + Z1) / 2), box(0.3, 2.4, Z1 - Z0, M.wall, s * (W + 0.15), H - 1.2, (Z0 + Z1) / 2), box(0.32, 0.35, Z1 - Z0, M.stripe, s * (W + 0.15), 3.3, (Z0 + Z1) / 2));
    add(box(0.12, 3.9, Z1 - Z0, M.glass, s * (W + 0.25), 5.15, (Z0 + Z1) / 2));
    for (let z = Z0; z <= Z1; z += 6) add(box(0.4, 3.9, 0.5, M.wall, s * (W + 0.1), 5.15, z));
    for (let z = Z0 + 3; z < Z1; z += 12) add(rb(0.2, 1.0, 4.6, 0.08, SM('#f4f2ee', 0.5), s * (W - 0.05), H - 1.1, z)); });   // ad frames, filled below
  // ad strips (texts), long benches, poles, overhead rails + loops, tube lights
  const ADS = [['FOLLOW', 'RESPONSIBLY', '#E0101A'], ['DON\'T LOOK', 'BACK!', '#2F7BF5'], ['UNFOLLOW?', 'NEVER.', '#2E9A3A'], ['SQUEAKY', 'SHOES? CALL 555', '#9a2ad8'], ['GO VIRAL', 'GO NOWHERE', '#FF8A1E']];
  for (let z = Z0 + 3, i = 0; z < Z1; z += 12, i++) [-1, 1].forEach((s, k) => { const a = ADS[(i * 2 + k) % ADS.length], t = KIT.textTex(512, 112, (g, w, h) => { g.fillStyle = a[2]; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 46px "Arial Black", sans-serif'; g.fillText(a[0], 18, 50); g.font = '700 34px Arial, sans-serif'; g.fillText(a[1], 18, 96); });
    const p = new T.Mesh(new T.PlaneGeometry(4.4, 0.95), new T.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: new T.Color('#ffffff'), emissiveMap: t, emissiveIntensity: 0.35 })); p.position.set(s * (W - 0.16), H - 1.1, z); p.rotation.y = -s * PI / 2; add(p); });
  for (let z = Z0 + 1; z < Z1 - 1; z += 12) [-1, 1].forEach((s) => { add(rb(1.6, 0.5, 9, 0.2, M.seat, s * (W - 0.9), 1.9, z + 5)); add(rb(0.4, 1.8, 9, 0.15, M.seat, s * (W - 0.25), 2.9, z + 5)); add(box(1.4, 1.7, 8.6, M.dark, s * (W - 0.9), 0.85, z + 5)); });
  for (let z = Z0 + 6; z < Z1; z += 6) [-1, 1].forEach((s) => { const p = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, H, 12), M.chrome); p.position.set(s * 2.8, H / 2, z); add(p); });
  [-1, 1].forEach((s) => { const rl = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, Z1 - Z0, 10), M.chrome); rl.rotation.x = PI / 2; rl.position.set(s * 2.8, H - 1.0, (Z0 + Z1) / 2); add(rl);
    for (let z = Z0 + 1; z < Z1; z += 1.6) { const st = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.6, 6), M.rub); st.position.set(s * 2.8, H - 1.35, z); add(st); const lp = new T.Mesh(new T.TorusGeometry(0.2, 0.05, 6, 14), M.rub); lp.position.set(s * 2.8, H - 1.85, z); add(lp); } });
  const tube = new T.MeshBasicMaterial({ color: new T.Color(2.4, 2.6, 2.7), toneMapped: false });
  [-1.6, 1.6].forEach((x) => { for (let z = Z0 + 2; z < Z1; z += 6) add(box(0.5, 0.12, 5.2, tube, x, H - 0.05, z + 2.5)); });
  for (let z = Z0 + 6; z < Z1; z += 12) { const L = new T.PointLight('#e8f4ff', 70, 18, 2); L.position.set(0, H - 0.8, z); scene.add(L); }
  // end door at z=8 (window into the next, empty car) + a route map strip above
  add(box(2 * W, H, 0.3, M.wall, 0, H / 2, Z1 + 0.15)); add(box(3.2, 6.6, 0.32, M.panel, 0, 3.4, Z1 + 0.05)); add(box(2.0, 2.6, 0.34, M.glass, 0, 5.0, Z1 + 0.02));
  const map = KIT.textTex(1024, 128, (g, w, h) => { g.fillStyle = '#f4f2ee'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2F7BF5'; g.lineWidth = 12; g.beginPath(); g.moveTo(40, 70); g.lineTo(w - 40, 70); g.stroke();
    ['HOME', 'MALL', 'SCHOOL', 'BRIDGE', 'END'].forEach((n, i) => { const x = 60 + i * 225; g.fillStyle = '#fff'; g.strokeStyle = '#1a1a1a'; g.lineWidth = 5; g.beginPath(); g.arc(x, 70, 16, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#1a1a1a'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText(n, x, 38); }); });
  const mp = new T.Mesh(new T.PlaneGeometry(9, 1.1), new T.MeshStandardMaterial({ map: map, roughness: 0.5 })); mp.position.set(0, H - 0.9, Z1 - 0.02); mp.rotation.y = PI; add(mp);
  // tunnel outside: dark walls with streaks of passing lamps (motion blur cards)
  const streak = new T.MeshBasicMaterial({ color: new T.Color(3.0, 1.8, 0.8), toneMapped: false, transparent: true, opacity: 0.9 });
  [-1, 1].forEach((s) => { add(box(0.5, 12, Z1 - Z0 + 40, SM('#14161c', 0.95), s * (W + 4), 5, (Z0 + Z1) / 2)); for (let z = Z0; z < Z1; z += 9) add(box(0.1, 0.12, 6.5, streak, s * (W + 3.7), 6.8 + (z % 2), z)); });
  scene.add(new T.HemisphereLight('#dfe8ff', '#3a3a44', 1.0));
  scene.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = !m.material.isMeshBasicMaterial; } });
  return { scene, grade: 'day', W, Z0, Z1, H, views: { wide: { p: [3, 6, 6], l: [-1, 4, -40], fov: 60 } } };
};
