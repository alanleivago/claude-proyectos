// rbx-library books: plain hardbacks and "face-books" (a kid stamped LATE becomes a book with their screaming face on the cover).
// BOOK.plain({cover,title,w,h,d}) / BOOK.face({...}) -> Group standing on its bottom edge, front cover facing +z.
// BOOK.covers(n) -> n distinct face-book cover materials (shelf instancing). BOOK.DALE / BOOK.NICO = the two story books.
'use strict';
const BOOK = {};
(function () {
  const T = THREE, PI = Math.PI, { cnv, tex, rng } = RBX;
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  const shade = (c, k) => { const q = new T.Color(c); q.multiplyScalar(k); return '#' + q.getHexString(); };
  // cloth cover: colour + weave + worn corners + gold frame
  function clothBase(q, W, H, c, seed) { q.fillStyle = c; q.fillRect(0, 0, W, H); const r = rng(seed); for (let i = 0; i < 2600; i++) { q.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'; q.fillRect(r() * W, r() * H, 2, 2); }
    for (let y = 0; y < H; y += 3) { q.fillStyle = 'rgba(0,0,0,0.04)'; q.fillRect(0, y, W, 1); }
    const g = q.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.8); g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.35)'); q.fillStyle = g; q.fillRect(0, 0, W, H);
    q.strokeStyle = '#e8c060'; q.lineWidth = 6; q.strokeRect(14, 14, W - 28, H - 28); q.lineWidth = 2; q.strokeRect(24, 24, W - 48, H - 48); }
  function title(q, W, y, text, size, fg = '#f6e6b0') { q.fillStyle = fg; q.textAlign = 'center'; q.textBaseline = 'middle'; let s = size; q.font = `900 ${s}px Arial Black, Arial`; while (q.measureText(text).width > W - 70 && s > 14) { s -= 2; q.font = `900 ${s}px Arial Black, Arial`; }
    q.lineWidth = Math.max(3, s / 9); q.strokeStyle = 'rgba(0,0,0,0.65)'; q.strokeText(text, W / 2, y); q.fillText(text, W / 2, y); }
  // portrait of a blocky head: hair silhouette behind/over a rounded head + a Gneef F-face drawn on the 256 grid
  BOOK.portrait = function (q, cx, cy, s, o = {}) {
    const hc = o.hairC || '#3a2418', sk = o.skin || '#F4A878', hw = s, hh = s * 0.92;
    q.save(); q.translate(cx, cy);
    const hair = o.hair || 'spike';
    q.fillStyle = hc;
    if (hair === 'afro') { q.beginPath(); q.arc(0, -hh * 0.18, hw * 0.82, 0, 7); q.fill(); }
    if (hair === 'buns') [-1, 1].forEach((sx) => { q.beginPath(); q.arc(sx * hw * 0.5, -hh * 0.55, hw * 0.24, 0, 7); q.fill(); });
    if (hair === 'pigtails') [-1, 1].forEach((sx) => { q.save(); q.translate(sx * hw * 0.62, -hh * 0.2); q.rotate(sx * 0.5); q.beginPath(); q.ellipse(0, 0, hw * 0.16, hw * 0.3, 0, 0, 7); q.fill(); q.restore(); });
    if (hair === 'long') { q.fillRect(-hw * 0.6, -hh * 0.4, hw * 1.2, hh * 1.05); }
    // head
    q.fillStyle = sk; const r = hw * 0.18; q.beginPath(); q.moveTo(-hw / 2 + r, -hh / 2); q.arcTo(hw / 2, -hh / 2, hw / 2, hh / 2, r); q.arcTo(hw / 2, hh / 2, -hw / 2, hh / 2, r); q.arcTo(-hw / 2, hh / 2, -hw / 2, -hh / 2, r); q.arcTo(-hw / 2, -hh / 2, hw / 2, -hh / 2, r); q.fill();
    q.fillStyle = 'rgba(0,0,0,0.12)'; q.fillRect(hw * 0.28, -hh / 2 + r, hw * 0.2, hh - 2 * r);
    // face (256 grid -> head box)
    q.save(); q.translate(-hw / 2, -hh / 2 + hh * 0.04); q.scale(hw / 256, hh / 256); const fn = GN.FACES[o.face || 'F12'] || GN.FACES.F12; fn(q, { lash: o.lash }); q.restore();
    // hair over the top of the head
    q.fillStyle = hc;
    if (hair === 'spike') { q.beginPath(); q.moveTo(-hw * 0.62, -hh * 0.18); for (let i = 0; i <= 7; i++) { const x = -hw * 0.62 + (i / 7) * hw * 1.24; q.lineTo(x, -hh * (i % 2 ? 0.95 : 0.55)); } q.lineTo(hw * 0.62, -hh * 0.18); q.lineTo(hw * 0.5, -hh * 0.36); q.lineTo(-hw * 0.5, -hh * 0.36); q.fill(); }
    if (hair === 'mop' || hair === 'buns' || hair === 'pigtails' || hair === 'long') { q.beginPath(); q.ellipse(0, -hh * 0.42, hw * 0.6, hh * 0.3, 0, PI, 0); q.fill(); q.fillRect(-hw * 0.6, -hh * 0.44, hw * 1.2, hh * 0.1); }
    if (hair === 'afro') { q.beginPath(); q.ellipse(0, -hh * 0.42, hw * 0.62, hh * 0.22, 0, PI, 0); q.fill(); }
    if (hair === 'bald') [-1, 1].forEach((sx) => { q.beginPath(); q.ellipse(sx * hw * 0.52, -hh * 0.05, hw * 0.1, hh * 0.16, 0, 0, 7); q.fill(); });
    if (hair === 'cap') { q.fillStyle = o.capC || '#E0101A'; q.beginPath(); q.ellipse(0, -hh * 0.44, hw * 0.58, hh * 0.3, 0, PI, 0); q.fill(); q.fillRect(-hw * 0.1, -hh * 0.5, hw * 0.85, hh * 0.08); }
    if (o.stache) { q.fillStyle = o.stache; q.beginPath(); q.moveTo(0, hh * 0.13); q.bezierCurveTo(hw * 0.2, hh * 0.04, hw * 0.4, hh * 0.12, hw * 0.42, hh * 0.32); q.bezierCurveTo(hw * 0.28, hh * 0.2, hw * 0.12, hh * 0.26, 0, hh * 0.22); q.bezierCurveTo(-hw * 0.12, hh * 0.26, -hw * 0.28, hh * 0.2, -hw * 0.42, hh * 0.32); q.bezierCurveTo(-hw * 0.4, hh * 0.12, -hw * 0.2, hh * 0.04, 0, hh * 0.13); q.fill(); }
    q.restore();
  };
  function coverTex(o, W = 320, H = 416) { const c = cnv(W, H), q = c.getContext('2d'); clothBase(q, W, H, o.cover || '#b03030', o.seed || 3);
    if (o.who) { // portrait panel with a dark vignette + speed burst behind the scream
      q.save(); q.beginPath(); q.rect(34, 96, W - 68, H - 170); q.clip(); q.fillStyle = shade(o.cover || '#b03030', 0.55); q.fillRect(0, 0, W, H);
      q.strokeStyle = 'rgba(255,240,200,0.18)'; q.lineWidth = 6; for (let i = 0; i < 24; i++) { const a = (i / 24) * PI * 2; q.beginPath(); q.moveTo(W / 2, H / 2 + 20); q.lineTo(W / 2 + Math.cos(a) * 400, H / 2 + 20 + Math.sin(a) * 400); q.stroke(); }
      BOOK.portrait(q, W / 2, H / 2 + 34, (W - 68) * 0.66, o.who); q.restore(); q.strokeStyle = '#e8c060'; q.lineWidth = 4; q.strokeRect(34, 96, W - 68, H - 170);
      if (o.extraDraw) o.extraDraw(q, W, H); }
    title(q, W, 60, o.title || 'BOOK', 44); if (o.sub) title(q, W, H - 40, o.sub, 24, '#f2d48a');
    return tex(c); }
  const pagesMat = once('pages', () => { const c = cnv(64, 256), q = c.getContext('2d'); q.fillStyle = '#efe4c8'; q.fillRect(0, 0, 64, 256); for (let x = 0; x < 64; x += 2) { q.fillStyle = `rgba(120,100,60,${0.08 + Math.random() * 0.1})`; q.fillRect(x, 0, 1, 256); } return new T.MeshStandardMaterial({ map: tex(c), roughness: 0.9 }); });
  function build(o, frontMap) {
    const w = o.w || 1.6, h = o.h || 2.1, d = o.d || 0.4, g = new T.Group(), cm = new T.MeshPhysicalMaterial({ color: o.cover || '#b03030', roughness: 0.7, clearcoat: 0.15 });
    const fm = new T.MeshPhysicalMaterial({ map: frontMap, roughness: 0.65, clearcoat: 0.2, clearcoatRoughness: 0.5 }), ct = 0.06;
    // pages block (inset), 2 covers, spine
    const pg = new T.Mesh(new T.BoxGeometry(w - 0.1, h - 0.1, d - ct * 2), pagesMat); pg.position.set(0.04, h / 2, 0); g.add(pg);
    const front = new T.Mesh(new T.BoxGeometry(w, h, ct), [cm, cm, cm, cm, fm, cm]); front.position.set(0, h / 2, d / 2 - ct / 2); g.add(front);
    const back = new T.Mesh(new T.BoxGeometry(w, h, ct), cm); back.position.set(0, h / 2, -d / 2 + ct / 2); g.add(back);
    const sp = new T.Mesh(new T.CylinderGeometry(d / 2, d / 2, h, 12, 1, false, PI, PI), cm); sp.position.set(-w / 2, h / 2, 0); g.add(sp);
    const gold = new T.MeshStandardMaterial({ color: '#e8c060', metalness: 0.8, roughness: 0.35 }); [0.15, 0.85].forEach((k) => { const b = new T.Mesh(new T.CylinderGeometry(d / 2 + 0.006, d / 2 + 0.006, 0.06, 12, 1, true, PI, PI), gold); b.position.set(-w / 2, h * k, 0); g.add(b); });
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); g.userData.dims = { w, h, d }; g.userData.frontMat = fm; return g;
  }
  BOOK.plain = (o = {}) => build(o, coverTex(Object.assign({}, o, { who: null })));
  BOOK.face = (o = {}) => build(o, coverTex(o));
  BOOK.coverTex = coverTex;
  // an open book lying flat (pages up): two page slabs + cover; o.left/o.right = draw(q, W, H) on each page
  BOOK.open = (o = {}) => { const w = o.w || 3, h = o.h || 4, g = new T.Group(), cm = new T.MeshPhysicalMaterial({ color: o.cover || '#c8962a', roughness: 0.7 });
    const cov = new T.Mesh(new T.BoxGeometry(w * 2 + 0.2, 0.12, h + 0.2), cm); cov.position.y = 0.06; g.add(cov);
    [-1, 1].forEach((s) => { const c = cnv(256, 340), q = c.getContext('2d'); q.fillStyle = '#f4ead0'; q.fillRect(0, 0, 256, 340); q.fillStyle = 'rgba(80,60,30,0.5)'; for (let y = 40; y < 320; y += 14) q.fillRect(20, y, 216 - (y % 3) * 20, 3);
      const d = s < 0 ? o.left : o.right; if (d) { q.fillStyle = '#f4ead0'; q.fillRect(16, 60, 224, 220); d(q, 256, 340); }
      const pg = new T.Mesh(new T.BoxGeometry(w, 0.35, h), [pagesMat, pagesMat, new T.MeshStandardMaterial({ map: tex(c), roughness: 0.85 }), pagesMat, pagesMat, pagesMat]); pg.position.set(s * (w / 2 + 0.02), 0.3, 0); pg.rotation.z = -s * 0.06; g.add(pg); });
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
  // the variety on the night shelves: 32 kids (hair / skin / scream faces), varied cloth
  const SK = ['#F4A878', '#F0A0A0', '#F5CD30', '#A0603A', '#F3D9C2', '#E8893A', '#7A3E26', '#B9B4F0'], HR = ['spike', 'buns', 'afro', 'pigtails', 'mop', 'cap', 'long', 'bald'],
    HC = ['#E0101A', '#1A1210', '#F5D400', '#E040A8', '#6a3a1e', '#1E6FE0', '#F5C842', '#B9B9C0', '#38c060', '#FF8A1E'], FC = ['F12', 'F13', 'F12', 'F8', 'F9', 'F12', 'F13', 'F10', 'F7'],
    CV = ['#8a1e2a', '#1e3a6a', '#2a5a2e', '#6a2a6a', '#8a5a1e', '#1e5a5a', '#5a2a1e', '#3a3a6a', '#7a1e4a', '#2e4a2a'],
    TI = ['TIMMY', 'ROSA', 'BEN', 'PIP?', 'AMIR', 'JO', 'LULU', 'MAX', 'ZOE', 'OTTO', 'KAI', 'MAE', 'LEO', 'IVY', 'SAM', 'NIA'];
  BOOK.KID = (i) => ({ skin: SK[(i * 3) % SK.length], hair: HR[(i * 5) % HR.length], hairC: HC[(i * 7) % HC.length], face: FC[i % FC.length], lash: i % 3 === 1, capC: HC[(i + 3) % HC.length] });
  BOOK.covers = (n = 32) => once('covers' + n, () => Array.from({ length: n }, (_, i) => {
    const o = { cover: CV[i % CV.length], title: TI[i % TI.length], sub: 'LATE ' + (1931 + ((i * 37) % 93)), seed: 100 + i, who: BOOK.KID(i) };
    return new T.MeshPhysicalMaterial({ map: coverTex(o, 192, 256), roughness: 0.7, clearcoat: 0.15 }); }));
  // the two story books
  BOOK.NICO = { cover: '#1e4a8a', title: 'NICO', sub: 'DUE: SUNDAY', who: { skin: '#F4A878', hair: 'spike', hairC: '#1E6FE0', face: 'F12' } };
  BOOK.DALE = { cover: '#c8962a', title: 'SOUPS', sub: 'p. 212  (MR. DALE, 1979)', who: { skin: '#F3D9C2', hair: 'bald', hairC: '#6a3a1e', face: 'F13', stache: '#5a3018' },
    extraDraw: (q, W, H) => { [[W * 0.2, H * 0.72], [W * 0.8, H * 0.72]].forEach(([x, y]) => { q.fillStyle = '#f4f0e6'; q.beginPath(); q.ellipse(x, y, 34, 12, 0, 0, 7); q.fill(); q.fillStyle = '#d8701a'; q.beginPath(); q.ellipse(x, y - 2, 28, 8, 0, 0, 7); q.fill();
      q.fillStyle = '#f4f0e6'; q.beginPath(); q.moveTo(x - 34, y); q.quadraticCurveTo(x, y + 44, x + 34, y); q.fill(); q.strokeStyle = 'rgba(255,255,255,0.7)'; q.lineWidth = 3; for (let k = -1; k <= 1; k++) { q.beginPath(); q.moveTo(x + k * 10, y - 14); q.quadraticCurveTo(x + k * 10 + 8, y - 26, x + k * 10, y - 38); q.stroke(); } }); } };
})();
