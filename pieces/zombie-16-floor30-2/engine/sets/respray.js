// First Aid Spray estilo RE, el MISMO del ep1 (pieces/zombie-01-door/engine/sets/rooms.js tSpray + Rspray: copia del modelo
// de Markus Darius: lata octogonal crema, bandas verdes, cruz verde, FIRST-AID, flor roja). Base en y = 0, alto ~0.19 m.
export function makeSpray(L) {
  const { THREE } = L;
  const lam = (t, col = 0xffffff) => L.lam(t, col);
  const tSpray = L.cvs(64, 64, (c) => {
    c.fillStyle = '#bdbab2'; c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 4) { c.fillStyle = y % 8 ? '#c4c1b8' : '#b6b3aa'; c.fillRect(0, y, 64, 2); }
    c.fillStyle = '#dfe2c8'; c.fillRect(0, 14, 64, 36);
    c.fillStyle = '#2e9a50'; c.fillRect(0, 13, 64, 2); c.fillRect(0, 49, 64, 2);
    c.fillStyle = '#2e9a50'; c.fillRect(8, 19, 4, 12); c.fillRect(4, 23, 12, 4);
    c.font = 'bold 6px monospace'; c.textBaseline = 'top'; c.fillText('FIRST-AID', 0, 38); c.fillText('FIRST-AID', 32, 38);
    c.fillStyle = '#2e9a50'; c.fillRect(40, 19, 4, 12); c.fillRect(36, 23, 12, 4);
    c.fillStyle = '#d0504c'; c.fillRect(39, 32, 6, 6); c.fillRect(38, 33, 8, 4); c.fillStyle = '#f0e8e0'; c.fillRect(41, 33, 2, 4); c.fillRect(40, 34, 4, 2);
  });
  tSpray.wrapS = THREE.RepeatWrapping;
  const mRim = lam(null, 0x7a6e6a), mCap = lam(null, 0xd8d6d0), mNoz = lam(null, 0x2a2a2c);
  const cyl = (rt, rb, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(rt, rb, h, n), m, x, y, z, p);
  const g = new THREE.Group(), s = new THREE.Group(); g.add(s); s.scale.setScalar(1.0);
  const r = 0.032, h = 0.13;
  cyl(r * 1.12, r * 1.12, 0.012, 8, mRim, 0, 0.006, 0, s);
  cyl(r, r, h, 8, lam(tSpray), 0, 0.012 + h / 2, 0, s);
  cyl(r * 1.12, r * 1.12, 0.01, 8, mRim, 0, 0.012 + h, 0, s);
  cyl(r * 0.45, r, 0.03, 8, mCap, 0, 0.017 + h + 0.015, 0, s);
  L.box(0.014, 0.016, 0.014, mNoz, 0, 0.017 + h + 0.038, 0, s);
  return g;
}
