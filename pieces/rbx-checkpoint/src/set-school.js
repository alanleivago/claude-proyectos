// rbx-checkpoint SCHOOL set: the math room (the school's checkpoint: purple flag on a pad in the back corner), chalkboard with
// fractions, desks, teacher's desk, fraction posters, sunny windows (-x), door (+x) to the hallway with lockers. Room centred at
// the origin, floor 26 x 20, back wall (chalkboard) at z=-10, camera side +z.
'use strict';
SETS.school = async function (ctx) {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), scene = new T.Scene();
  scene.background = new T.Color('#bfe2ff'); ENV.sky(scene, ctx.renderer, { top: '#1a6ef0', mid: '#4aa0f8', hor: '#bfe2ff', sun: [-0.6, 0.5, 0.3], glow: 0.4 });
  const WX = 13, WZ = 10, HH = 9, box = (w, h, d, m, x, y, z, uv = true) => TK.box(scene, w, h, d, m, x, y, z, uv);
  scene.add(new T.HemisphereLight('#fff4e0', '#8a7060', 1.6));
  const sun = new T.DirectionalLight('#fff0c8', 7); sun.position.set(-40, 26, 12); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 120 }); sun.target.position.set(4, 0, -2); scene.add(sun, sun.target);
  const fill = new T.PointLight('#fff2d8', 40, 40, 1.6); fill.position.set(2, 8, 4); scene.add(fill);
  // floor (wood planks), walls (two-tone: green wainscot + cream), ceiling with lights
  TK.planeG(scene, 2 * WX, 2 * WZ + 30, ENV.mt(ENV.T.wood('#b88a58'), 2.5), 0, 0, 10);
  const cream = new T.MeshStandardMaterial({ color: '#f2ead6', roughness: 0.9 }), wain = new T.MeshStandardMaterial({ color: '#5a9a7a', roughness: 0.7 });
  box(2 * WX, HH, 0.4, cream, 0, HH / 2, -WZ - 0.2, false); box(2 * WX, 3, 0.45, wain, 0, 1.5, -WZ - 0.15, false);
  // left wall with 3 big windows (gaps), right wall with the door gap
  [-WZ + 1, -2.5, 4.5, 11].forEach((z, i, a) => { if (i === a.length - 1) return; });
  const lw = (z0, z1) => { box(0.4, HH, z1 - z0, cream, -WX - 0.2, HH / 2, (z0 + z1) / 2, false); box(0.45, 3, z1 - z0, wain, -WX - 0.15, 1.5, (z0 + z1) / 2, false); };
  lw(-WZ, -8); lw(-3.5, -2.5); lw(2, 3); lw(7.5, 16);
  [[-8, -3.5], [-2.5, 2], [3, 7.5]].forEach(([a, b]) => { box(0.4, 3, b - a, wain, -WX - 0.2, 1.5, (a + b) / 2, false); box(0.4, 1.4, b - a, cream, -WX - 0.2, HH - 0.7, (a + b) / 2, false); box(0.3, 0.2, b - a, TK.SM('#f6f4ee'), -WX - 0.1, 3.1, (a + b) / 2, false); box(0.2, 4.6, 0.2, TK.SM('#f6f4ee'), -WX - 0.1, 5.4, (a + b) / 2, false); });
  const rw = (z0, z1) => { box(0.4, HH, z1 - z0, cream, WX + 0.2, HH / 2, (z0 + z1) / 2, false); box(0.45, 3, z1 - z0, wain, WX + 0.15, 1.5, (z0 + z1) / 2, false); };
  rw(-WZ, -1); rw(2.6, 16); box(0.4, HH - 6.4, 3.6, cream, WX + 0.2, 6.4 + (HH - 6.4) / 2, 0.8, false);
  box(0.5, 6.6, 0.3, TK.SM('#8a5a30'), WX, 3.3, -1.1, false); box(0.5, 6.6, 0.3, TK.SM('#8a5a30'), WX, 3.3, 2.7, false);
  const door = TK.box(scene, 0.15, 6.2, 3.4, TK.SM('#9a6a3a', 0.6), WX + 1.6, 3.1, 0.6 + 1.6, false); door.rotation.y = -1.2; door.position.set(WX + 1.7, 3.1, -0.6);
  box(2 * WX, 0.3, 2 * WZ + 30, TK.SM('#f6f4ee', 0.9), 0, HH + 0.15, 10, false);
  for (let x = -8; x <= 8; x += 8) for (let z = -6; z <= 6; z += 6) { const l = new T.Mesh(new T.BoxGeometry(3.4, 0.15, 1.0), new T.MeshStandardMaterial({ color: '#fff', emissive: '#fff8e8', emissiveIntensity: 2.2 })); l.position.set(x, HH - 0.05, z); scene.add(l); }
  // hallway beyond the door: lockers in a row
  TK.planeG(scene, 14, 40, TK.SM('#d8d0c0', 0.5), WX + 7, 0.005, 0);
  box(0.4, HH, 40, new T.MeshStandardMaterial({ color: '#e8e0c8', roughness: 0.9 }), WX + 12, HH / 2, 0, false);
  const lockC = ['#2a6ad8', '#2a6ad8', '#e8402a', '#2a6ad8'];
  for (let z = -16; z <= 16; z += 1.3) { const lk = box(1.0, 5.6, 1.25, TK.SM(lockC[Math.abs(Math.round(z * 3)) % 4], 0.45, 0.4), WX + 11.3, 2.8, z, false); for (let k = 0; k < 3; k++) box(0.05, 0.08, 0.8, TK.SM('#1a1a1a'), WX + 10.78, 4.6 + k * 0.25, z, false); }
  // chalkboard with fractions + pizza circles, ledge, title
  const ct = KIT.textTex(1600, 600, (q, W, H) => { q.fillStyle = '#23422f'; q.fillRect(0, 0, W, H); KIT.noiseOver(q, W, H, 9, 0.22, 6, 3); q.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) q.fillRect(Math.random() * W, Math.random() * H, 200, 10);
    q.fillStyle = '#f4f2ea'; q.strokeStyle = '#f4f2ea'; q.lineWidth = 8; q.font = '900 120px "Comic Sans MS", "Chalkboard SE", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle';
    const frac = (x, y, n, d) => { q.fillText(n, x, y - 70); q.fillRect(x - 50, y - 6, 100, 10); q.fillText(d, x, y + 70); };
    frac(260, 300, '1', '2'); q.fillText('+', 400, 300); frac(540, 300, '1', '4'); q.fillText('=', 690, 300); q.fillStyle = '#f2d04a'; q.fillText('?', 820, 300); q.fillStyle = '#f4f2ea';
    const pie = (x, y, rr, n, k, c) => { q.beginPath(); q.arc(x, y, rr, 0, 7); q.stroke(); for (let i = 0; i < n; i++) { const a = (i / n) * PI * 2 - PI / 2; q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); q.stroke(); } q.fillStyle = c; q.beginPath(); q.moveTo(x, y); q.arc(x, y, rr - 6, -PI / 2, -PI / 2 + (k / n) * PI * 2); q.closePath(); q.fill(); q.fillStyle = '#f4f2ea'; };
    pie(1080, 200, 110, 2, 1, 'rgba(242,120,90,0.8)'); pie(1360, 200, 110, 4, 1, 'rgba(90,180,242,0.8)'); pie(1220, 440, 110, 4, 3, 'rgba(242,208,74,0.8)');
    q.font = '700 54px "Comic Sans MS", sans-serif'; q.textAlign = 'left'; q.fillText('FRACTIONS  p. 47', 90, 80); q.fillText('Homework: ALL OF IT', 90, 540); });
  const bt = new T.Mesh(new T.PlaneGeometry(16, 6), new T.MeshStandardMaterial({ map: ct, roughness: 0.95 })); bt.position.set(1.5, 5.2, -WZ + 0.02); scene.add(bt);
  box(16.6, 0.4, 0.3, TK.SM('#8a5a30'), 1.5, 8.35, -WZ + 0.1, false); box(16.6, 0.4, 0.3, TK.SM('#8a5a30'), 1.5, 2.05, -WZ + 0.1, false); box(16.6, 0.15, 0.6, TK.SM('#8a5a30'), 1.5, 2.2, -WZ + 0.35, false);
  // posters
  const poster = (txt, c, x, y, z, ry) => { const t = KIT.textTex(256, 340, (q, W, H) => { q.fillStyle = c; q.fillRect(0, 0, W, H); q.fillStyle = '#fff'; q.font = '900 40px "Arial Black", sans-serif'; q.textAlign = 'center'; txt.split('|').forEach((l, i) => q.fillText(l, W / 2, 70 + i * 52));
    q.beginPath(); q.arc(W / 2, 250, 60, 0, 7); q.fillStyle = '#f2d04a'; q.fill(); q.fillStyle = '#e86a4a'; q.beginPath(); q.moveTo(W / 2, 250); q.arc(W / 2, 250, 60, -PI / 2, PI / 2); q.fill(); });
    const p = new T.Mesh(new T.PlaneGeometry(2.4, 3.2), new T.MeshStandardMaterial({ map: t, roughness: 0.8 })); p.position.set(x, y, z); p.rotation.y = ry; scene.add(p); };
  poster('HALF|IS|HALF', '#8a3ad0', -10.5, 5.5, -WZ + 0.05, 0); poster('PIZZA|=|MATH', '#e8402a', WX - 0.05, 5.5, -6, -PI / 2);
  // desks (3 x 3) + chairs, teacher's desk with apple
  const deskM = ENV.mt(ENV.T.wood('#c8965a'), 1.2), metal = TK.SM('#5a6068', 0.4, 0.7), chairM = TK.SM('#2a7ad8', 0.5);
  const desk = (x, z) => { const g = new T.Group(); TK.box(g, 2.6, 0.18, 1.8, deskM, 0, 2.3, 0); [[-1.1, -0.7], [1.1, -0.7], [-1.1, 0.7], [1.1, 0.7]].forEach(([a, b]) => TK.box(g, 0.12, 2.2, 0.12, metal, a, 1.1, b, false));
    TK.box(g, 1.8, 0.15, 1.5, chairM, 0, 1.4, 1.7, false); TK.box(g, 1.8, 1.4, 0.15, chairM, 0, 2.1, 2.4, false); [[-0.75, 1.1], [0.75, 1.1], [-0.75, 2.3], [0.75, 2.3]].forEach(([a, b]) => TK.box(g, 0.1, 1.35, 0.1, metal, a, 0.68, b, false));
    g.position.set(x, 0, z); ENV.shadow(g); scene.add(g); return g; };
  const desks = []; for (const z of [-3, 2.5, 8]) for (const x of [-6, 0, 6]) desks.push(desk(x + 1.5, z));
  const td = new T.Group(); TK.box(td, 5, 2.6, 2.2, deskM, 0, 1.3, 0); const ap = new T.Mesh(new T.SphereGeometry(0.3, 16, 12), TK.SM('#d81e2a', 0.3)); ap.position.set(1.4, 2.9, 0); td.add(ap); td.position.set(-6.5, 0, -7.2); ENV.shadow(td); scene.add(td);
  // the school checkpoint: back-right corner
  const cpk = CP.checkpoint({ c: CP.COL.school, emblem: 'star', h: 4.4, w: 1.8, s: 0.9 }); cpk.position.set(10.4, 0, -7.4); scene.add(cpk);
  return { scene, grade: 'day', cpk, desks, td, WX, WZ };
};
