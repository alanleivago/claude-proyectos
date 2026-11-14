// rbx-crossing HALLWAY set: the school corridor (x -40..40, z -6..6, ceiling 11). Blue lockers on the +z wall; on the -z wall
// a long row of framed kid photos, one per year, each with a little "FIRST SNOW" plate and the year. photo(n) shows the newest frame
// (the one put up the morning after) when n >= 1 (n = 2: Wes's photo). Polished floor, fluorescent tubes, a trophy case.
'use strict';
SETS.hallway = async function (ctx) {
  const T = THREE, PI = Math.PI, { rng } = RBX, { box } = KIT; const scene = new T.Scene(); scene.background = new T.Color('#1a1a20');
  const add = (m) => { scene.add(m); return m; }, SM = (c, r = 0.6, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m }), r = rng(31);
  const tile = KIT.texPair(256, (g, hg, S) => { const n = 4, q = S / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#d8d2c4' : '#bcb4a4'; g.fillRect(i * q, j * q, q, q); hg.fillStyle = '#c0c0c0'; hg.fillRect(i * q + 2, j * q + 2, q - 4, q - 4); } });
  const floor = new T.MeshPhysicalMaterial({ map: RBX.tex(tile.c, { repeat: [1 / 4, 1 / 4] }), roughness: 0.15, clearcoat: 0.8 });
  add(box(80, 0.4, 12, floor, 0, -0.2, 0, true)); add(box(80, 0.3, 12, SM('#f2f0ea', 0.8), 0, 11.15, 0));
  const wall = SM('#e8e0c8', 0.85), stripe = SM('#2F6FD1', 0.5);
  add(box(80, 11, 0.4, wall, 0, 5.5, -6.2)); add(box(80, 11, 0.4, wall, 0, 5.5, 6.2)); add(box(80, 0.5, 0.45, stripe, 0, 3.2, -6.0)); add(box(80, 0.5, 0.45, stripe, 0, 3.2, 6.0));
  for (let x = -39; x <= 39; x += 1.6) { add(box(1.5, 6.2, 1.0, SM('#3a6ab0', 0.4, 0.4), x, 3.1, 5.6)); add(box(0.5, 0.15, 0.1, SM('#d8d8dc', 0.2, 0.9), x + 0.3, 3.6, 5.07)); for (let k = 0; k < 3; k++) add(box(0.9, 0.08, 0.05, SM('#2a4a80', 0.5), x, 5.6 - k * 0.2, 5.08)); }
  const tube = new T.MeshBasicMaterial({ color: new T.Color(2.2, 2.3, 2.3), toneMapped: false }); for (let x = -36; x <= 36; x += 8) add(box(5, 0.12, 0.5, tube, x, 11.0, 0));
  [-24, -8, 8, 24].forEach((x) => { const L = new T.PointLight('#f4f8ff', 50, 22, 2); L.position.set(x, 10, 0); scene.add(L); }); scene.add(new T.HemisphereLight('#f4f0e8', '#6a6050', 1.1));
  // the photo wall: frames from x=-36 to 30 (one per year), the newest slot at x=34
  const SK = ['#F5CD30', '#F4A878', '#F3D9C2', '#F0A0A0', '#7A3E26', '#E89A84'], HC = ['#3a2418', '#111', '#F5D400', '#E040A8', '#C1121F', '#6a3a1e', '#F06A12', '#2F7BF5'];
  const portrait = (k, o = {}) => KIT.textTex(256, 320, (g, w, h) => { g.fillStyle = o.bg || ['#9ad0f0', '#f4d0a0', '#c8e8c0', '#e8c8f0'][k % 4]; g.fillRect(0, 0, w, h);
    g.fillStyle = o.top || ['#d23a2a', '#2F6FD1', '#2E9A3A', '#f2c94c', '#9a2ad8'][k % 5]; g.fillRect(48, 210, 160, 110); g.fillStyle = o.skin || SK[k % SK.length]; g.beginPath(); g.roundRect(78, 90, 100, 110, 28); g.fill();
    g.fillStyle = o.hair || HC[k % HC.length]; g.beginPath(); g.ellipse(128, 92, 66, 38, 0, PI, 2 * PI); g.fill(); if (o.beanie) { g.fillStyle = o.hair; g.fillRect(62, 60, 132, 34); g.beginPath(); g.arc(128, 48, 16, 0, 7); g.fillStyle = '#f4f2ee'; g.fill(); }
    g.fillStyle = '#111'; g.beginPath(); g.arc(108, 140, 6, 0, 7); g.arc(148, 140, 6, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.arc(128, 160, 18, 0.2, PI - 0.2); g.stroke(); });
  const plate = (txt) => KIT.textTex(256, 64, (g, w, h) => { g.fillStyle = '#c9a35a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a0a'; g.font = '700 26px Georgia'; g.textAlign = 'center'; g.fillText(txt, w / 2, 42); });
  const frameM = SM('#3a2414', 0.5), mk = (x, tex, year, sc = 1) => { const g = new T.Group(); g.position.set(x, 6.4, -5.95); scene.add(g);
    const f = new T.Mesh(new T.BoxGeometry(1.7 * sc, 2.1 * sc, 0.12), frameM); g.add(f); const p = new T.Mesh(new T.PlaneGeometry(1.4 * sc, 1.75 * sc), new T.MeshStandardMaterial({ map: tex, roughness: 0.6 })); p.position.z = 0.07; g.add(p);
    const pl = new T.Mesh(new T.PlaneGeometry(1.4 * sc, 0.35 * sc), new T.MeshStandardMaterial({ map: plate(year), roughness: 0.4, metalness: 0.5 })); pl.position.set(0, -1.35 * sc, 0.07); g.add(pl); return g; };
  let year = 1995; for (let x = -36, k = 0; x <= 30; x += 2.2, k++) mk(x, portrait(k), 'FIRST SNOW ' + (year++));
  const newest = mk(33.6, portrait(99, { bg: '#e8ecf4', top: '#2E9A3A', hair: '#2E9A3A', skin: '#F4A878', beanie: true }), 'FIRST SNOW 2026', 1.15); newest.visible = false;
  const nail = box(0.2, 0.2, 0.2, SM('#888', 0.3, 0.9), 33.6, 7.9, -5.9); add(nail);
  // dressing: bulletin board + posters on the locker side, an EXIT sign, a window at the end with snow light, warm pools of light
  const poster = (t1, t2, bg) => KIT.textTex(256, 340, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 40px "Arial Black"'; g.textAlign = 'center'; g.fillText(t1, w / 2, 120); g.font = '700 28px Arial'; g.fillText(t2, w / 2, 180); g.beginPath(); g.arc(w / 2, 260, 40, 0, 7); g.fill(); });
  [['WINTER', 'FAIR FRI', '#d23a2a', -30], ['COUNT', 'ON ME!', '#2E9A3A', -12], ['HOLD', 'HANDS', '#ff6a1a', 6], ['EYES', 'FORWARD', '#2F6FD1', 22]].forEach(([a, b, c, x]) => { const p = new T.Mesh(new T.PlaneGeometry(1.8, 2.4), new T.MeshStandardMaterial({ map: poster(a, b, c), roughness: 0.8 })); p.position.set(x, 8.0, 5.0); p.rotation.y = PI; add(p); });
  add(box(6, 3.4, 0.2, SM('#b07a44', 0.9), -2, 8.0, 5.05)); for (let i = 0; i < 9; i++) { const n = new T.Mesh(new T.PlaneGeometry(0.9, 1.1), SM(['#fff3a8', '#cfe4ff', '#ffd0dc', '#d8f0c8'][i % 4], 0.9)); n.position.set(-4.3 + (i % 5) * 1.1, 8.5 - Math.floor(i / 5) * 1.4, 4.93); n.rotation.set(0, PI, (i % 3 - 1) * 0.1); add(n); }
  const ex = KIT.textTex(256, 96, (g, w, h) => { g.fillStyle = '#1a0a0a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff3020'; g.font = '900 70px Arial'; g.textAlign = 'center'; g.fillText('EXIT', w / 2, 74); });
  const e = new T.Mesh(new T.BoxGeometry(2, 0.75, 0.3), [SM('#222'), SM('#222'), SM('#222'), SM('#222'), new T.MeshBasicMaterial({ map: ex, toneMapped: false, color: new T.Color(2, 2, 2) }), SM('#222')]); e.position.set(39.6, 9.6, 0); e.rotation.y = -PI / 2; add(e);
  add(box(0.2, 6, 7, new T.MeshBasicMaterial({ color: new T.Color(1.8, 2.0, 2.4), toneMapped: false }), 39.9, 5.5, 0)); const wl = new T.PointLight('#cfe0ff', 120, 40, 2); wl.position.set(36, 6, 0); scene.add(wl);
  [12, 30].forEach((x) => { const L = new T.PointLight('#ffd8a0', 40, 14, 2); L.position.set(x, 9, -3); scene.add(L); });
  // trophy case at the far end
  add(box(4, 7, 1.6, new T.MeshPhysicalMaterial({ color: '#cfe4f4', roughness: 0.05, transparent: true, opacity: 0.3 }), -20, 3.5, 5.0));
  scene.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = true; } });
  return { scene, grade: 'day', photo: (n) => { newest.visible = n >= 1; }, newest: [33.6, 6.4, -5.95], reset() { newest.visible = false; } };
};
