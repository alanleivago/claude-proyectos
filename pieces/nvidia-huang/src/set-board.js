// =====================================================================
//  SET board — the boardroom (x -32..32, z 0..46, h 26; prefix BD / bd). Back wall z 0 = floor-to-ceiling windows on a
//  blue city (3D towers outside + two painted skyline layers = real parallax when the camera orbits), sheer drapes.
//  Left wall: walnut wainscot + ultramarine plaster, the credenza (carafe, glasses tray, books, bronze, lamp, plant) and the
//  wall screen. Right wall: big abstract painting, sconces, double doors, plants. Coffered ceiling, three amber drum pendants.
//  The long walnut table (x -15..15, z 15.5..24.5, top 4.8) with a modesty panel, oxblood leather chairs, laptops, notepads,
//  water glasses, carafes, coffee, the FILINGS tray (inclined bed) and a big rubber stamp on its ink pad.
//  s12 (33.46-35.82): 4 invented board members; BDchair slaps the INDEPENDENT INVESTIGATION folder on "investigation"
//  (impact BD_SLAP 34.26): papers lift, glasses jump, the others jolt. s19 + s20 (55.58-58.46): the empty room later the
//  same day (warmer sun): a one-page filing slides in beside the tray and swoops into it on "notice" (57.30); the chair hops back in, raises the stamp and slams FILED (57.80).
//  Camera = seqCam(s, 'board', t) only; FOCUS = people + every table-top prop; depth-only FOCUS occluders for the table,
//  the near chairs and the pendants (created after c3SetLook).
// =====================================================================
const BD = {};
// FIX3: every head unique in the piece -> each board member wears headwear drawn on the kit's hair layer in its OWN colour
// (base hairstyle under it, so the kit inks hat + hair as one silhouette): silk headscarf, beret, bowler, cloche
const BD_HW = {
  BDscarf: { base: 'mop', col: '#f2b632', dot: '#6a2a7a' },      // the chair: gold silk headscarf with plum dots, white fringe
  BDberet: { base: 'curly', col: '#c8283a' },                    // BDa: red beret on auburn curls
  BDbowler: { base: 'short', col: '#6a4428', band: '#1e1a22' },  // BDb: brown bowler, black band, black hair + moustache
  BDcloche: { base: 'bob', col: '#22305a', band: '#e86aa0' },    // BDc: navy bell cloche with a pink ribbon, blond bob
};
for (const k in BD_HW) T3_HSTYLE[k] = T3_HSTYLE[BD_HW[k].base];   // lookups by name (mass etc.) see the base style
function bdHat(h, w, P, A, Bh, light, back) { const sp = (Q, n = 8) => t3Spline(Q.map(([u, v]) => P(u, v)), n), lw = 0.045 * A, ink = T3.ink;
  const fillSh = (Q, col) => { t3Path(h, Q); h.fillStyle = col; h.fill(); h.save(); t3Path(h, Q); h.clip();
    const dx = Math.cos(light), [gx, gy] = P(dx * 0.5, -1.0), gr = h.createRadialGradient(gx, gy, 0, gx, gy, A * 1.9); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, '#ffffff'); gr.addColorStop(1, '#8a7a96');
    h.globalCompositeOperation = 'multiply'; h.fillStyle = gr; h.fillRect(gx - 3 * A, gy - 3 * Bh, 6 * A, 6 * Bh); h.restore(); };
  const edge = (Q, close = true) => { h.save(); t3Path(h, Q, close); h.lineWidth = lw; h.lineJoin = h.lineCap = 'round'; h.strokeStyle = ink; h.stroke(); h.restore(); };
  const shine = (Q, a = 0.45) => { h.save(); h.globalAlpha = a; t3Stroke(h, Q, 0.05 * Bh, t3Mix(w.col, '#ffffff', 0.55)); h.restore(); };
  const dome = (ru, v0, rv, cu = 0) => { const Q = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + Math.PI * i / 24; Q.push(P(cu + ru * Math.cos(a), v0 + rv * Math.sin(a))); } return Q; };
  if (w === BD_HW.BDbowler) {
    const cr = dome(0.84, -0.6, 0.84); fillSh(cr, w.col);
    h.save(); t3Path(h, cr); h.clip(); const [, y0] = P(0, -0.78), [, y1] = P(0, -0.6); h.fillStyle = w.band; h.fillRect(P(-2, 0)[0], y0, 4 * A, y1 - y0); h.restore();
    shine(dome(0.58, -0.86, 0.5).slice(5, 11)); edge(cr);
    const br = sp([[-1.08, -0.7], [-0.94, -0.63], [-0.5, -0.6], [0, -0.59], [0.5, -0.6], [0.94, -0.63], [1.08, -0.7]]).concat(sp([[1.07, -0.6], [0.92, -0.52], [0.5, -0.48], [0, -0.47], [-0.5, -0.48], [-0.92, -0.52], [-1.07, -0.6]]));
    fillSh(br, t3Mul(w.col, 0.92)); edge(br); }
  else if (w === BD_HW.BDberet) {
    const bd = t3Blob(...P(0, -0.86), 0.88 * A, 0.13 * Bh, 2, 2, 0, 40); fillSh(bd, t3Mul(w.col, 0.8)); edge(bd);
    const bt = t3Blob(...P(0.16, -1.16), 1.1 * A, 0.34 * Bh, 2.2, 1.6, 0, 56).map(([x, y]) => { const [ox, oy] = P(0.16, -1.16), c = Math.cos(-0.12), s = Math.sin(-0.12); return [ox + (x - ox) * c - (y - oy) * s, oy + (x - ox) * s + (y - oy) * c]; });
    fillSh(bt, w.col); shine(sp([[-0.5, -1.32], [-0.1, -1.4], [0.3, -1.4]])); edge(bt);
    t3Stroke(h, [P(0.22, -1.48), P(0.26, -1.62)], 0.07 * A, ink); }
  else if (w === BD_HW.BDscarf) {
    const sc = sp([[-1.12, 0.06], [-1.15, -0.4], [-0.98, -0.86], [-0.55, -1.18], [0, -1.25], [0.55, -1.18], [0.98, -0.86], [1.15, -0.4], [1.12, 0.06]]).concat(sp([[0.92, -0.04], [0.82, -0.38], [0.42, -0.56], [0, -0.6], [-0.42, -0.56], [-0.82, -0.38], [-0.92, -0.04]]));
    fillSh(sc, w.col); h.save(); t3Path(h, sc); h.clip(); h.fillStyle = w.dot;
    for (let j = 0; j < 7; j++) for (let i = 0; i < 9; i++) { const [x, y] = P(-1.2 + i * 0.3 + (j % 2) * 0.15, -1.3 + j * 0.22); h.beginPath(); h.arc(x, y, 0.045 * A, 0, TAU); h.fill(); }
    for (const [a, b, c] of [[[-0.7, -0.62], [-0.5, -0.9], [-0.1, -1.05]], [[0.7, -0.6], [0.55, -0.88], [0.2, -1.0]]]) { h.save(); h.globalAlpha = 0.35; t3Stroke(h, [P(...a), P(...b), P(...c)], 0.03 * A, t3Mul(w.col, 0.6)); h.restore(); }
    h.restore(); edge(sc);
    if (!back) { const kn = t3Blob(...P(1.04, 0.2), 0.2 * A, 0.16 * Bh, 2, 2, 0, 28); for (const tl of [[[1.0, 0.24], [1.16, 0.5], [1.26, 0.78], [1.08, 0.66], [0.94, 0.34]], [[1.06, 0.26], [1.0, 0.56], [0.92, 0.84], [0.84, 0.66], [0.96, 0.3]]]) { const Q = tl.map(([u, v]) => P(u, v)); fillSh(Q, t3Mul(w.col, 0.94)); edge(Q); }
      fillSh(kn, w.col); edge(kn); } }
  else if (w === BD_HW.BDcloche) {
    const cr = dome(0.98, -0.42, 0.8); fillSh(cr, w.col);
    h.save(); t3Path(h, cr); h.clip(); const [, y0] = P(0, -0.66), [, y1] = P(0, -0.5); h.fillStyle = w.band; h.fillRect(P(-2, 0)[0], y0, 4 * A, y1 - y0); h.restore();
    shine(dome(0.7, -0.6, 0.56).slice(5, 11)); edge(cr);
    const br = sp([[-1.12, -0.3], [-0.92, -0.46], [0, -0.5], [0.92, -0.46], [1.12, -0.3]]).concat(sp([[1.26, -0.06], [0.98, -0.3], [0, -0.38], [-0.98, -0.3], [-1.26, -0.06]]));
    fillSh(br, t3Mul(w.col, 1.1)); edge(br);
  }
}
{ const base = t3HairLayers;
  t3HairLayers = function (o, f, cx, cy, A, Bh, light, env, hp) { const w = BD_HW[o.hair]; if (!w) return base(o, f, cx, cy, A, Bh, light, env, hp);
    const r = base(Object.assign({}, o, { hair: w.base }), f, cx, cy, A, Bh, light, env, hp); if (!r) return r;
    const h = r.hc.getContext('2d'); h.setTransform(f.k, 0, 0, f.k, 0, 0); h.globalCompositeOperation = 'source-over'; h.globalAlpha = 1; h.filter = 'none';
    const sh = f.back ? 0 : -f.dir * 0.1 * Math.max(0, f.m - 1); bdHat(h, w, (u, v) => [cx + (u + sh) * A, cy + v * Bh], A, Bh, light, f.back);
    r.flies = []; r.tie = null; r.pin = null; return r; }; }
Object.assign(CAST, {   // invented board members: hair / colours / outfits not used by huang, intern or the other sets
  BDchair: { key: 'BDchair', hair: 'BDscarf', hairColor: 'white', outfit: 'suit', colors: { main: '#6a2a7a', shirt: '#f6efe6', tie: '#f2b632' }, skin: 'peach', body: 'tall' },   // the chair: gold silk headscarf, white fringe, plum suit, gold tie
  BDa: { key: 'BDa', hair: 'BDberet', hairColor: 'auburn', outfit: 'vest', colors: { main: '#1f6a58', shirt: '#f2ece0', tie: '#e8602a' }, skin: 'brown', body: 'fat' },          // red beret on auburn curls, green waistcoat
  BDb: { key: 'BDb', hair: 'BDbowler', hairColor: 'black', moustache: true, outfit: 'suit', colors: { main: '#44505e', shirt: '#e4eeff', tie: '#2a86d8' }, skin: 'tan', body: 'avg' },   // brown bowler, slate suit, moustache
  BDc: { key: 'BDc', hair: 'BDcloche', hairColor: 'blond', outfit: 'dress', colors: { main: '#2a7ec8', belt: '#1e2a4a' }, skin: 'pale', body: 'thin' },                            // navy cloche on a blond bob, blue dress
});
const BD_X = 32, BD_Z = 46, BD_H = 26, BD_TY = 4.8, BD_TC = [0, 20], BD_TW = 30, BD_TD = 9;
const BD_SLAP = 34.26, BD_FILE = 57.30, BD_STAMP = 57.80, BD_LATE = 50, BD_IN = 57.40;
const BD_POS = { BDchair: [0, 15.0], BDa: [-6.2, 13.0], BDb: [6.2, 13.0], BDc: [12.4, 13.0] };
const BD_PAD = [-10.8, 22.3], BD_TRAY = [-7.5, 22.5], BD_TILT = 0.52, BD_FOLD = [0, 16.7];
const bdE = (a, b, t) => clamp((t - a) / (b - a));
const bdK = (K, t, d = 0.14) => { let v = K[0][1]; for (let i = 1; i < K.length; i++) { const [k, x] = K[i]; if (t >= k) v = v + (x - v) * EZ.io(clamp((t - k) / d)); } return v; };
const bdHop = (t, t0, d, a) => { const x = (t - t0) / d; return x <= 0 || x >= 1 ? 0 : a * Math.sin(Math.PI * x); };

// ---- textures
function bdTexWalnut(seed = 'w', base = '#7a4226') { const t = tex((g, w, h) => { const R = RNG('bdwal', seed), gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, base); gr.addColorStop(0.5, t3Mul(base, 1.12)); gr.addColorStop(1, t3Mul(base, 0.92)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { const y = R.r(0, h); g.strokeStyle = `rgba(${R.f() < 0.5 ? '40,16,6' : '170,100,50'},${R.r(0.12, 0.3)})`; g.lineWidth = R.r(1, 4); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + R.n(26), w * 0.7, y + R.n(26), w, y + R.n(12)); g.stroke(); }
  for (let k = 0; k < 6; k++) { const cx = R.r(0, w), cy = R.r(0, h); for (let r = 4; r < 40; r += 6) { g.strokeStyle = 'rgba(50,20,8,0.16)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, r * 2.4, r * 0.7, 0, 0, TAU); g.stroke(); } } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function bdTexHerring() { const t = tex((g, w, h) => { const R = RNG('bdhb'), n = 8, s = w / n;
  for (let j = -1; j < n + 1; j++) for (let i = -1; i < n + 1; i++) { const x = i * s, y = j * s, c = `hsl(${24 + R.r(-3, 3)},${48 + R.r(-6, 6)}%,${30 + R.r(-5, 5)}%)`;
    g.save(); g.translate(x + s / 2, y + s / 2); g.rotate((i + j) % 2 ? Math.PI / 4 : -Math.PI / 4); g.fillStyle = c; g.fillRect(-s * 0.7, -s * 0.17, s * 1.4, s * 0.34); g.strokeStyle = 'rgba(30,12,4,0.45)'; g.lineWidth = 2; g.strokeRect(-s * 0.7, -s * 0.17, s * 1.4, s * 0.34);
    g.strokeStyle = 'rgba(255,200,140,0.1)'; g.beginPath(); g.moveTo(-s * 0.6, -s * 0.05); g.lineTo(s * 0.6, -s * 0.03); g.stroke(); g.restore(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 7); return t; }
function bdTexRug() { return tex((g, w, h) => { g.fillStyle = '#a02a3a'; g.fillRect(0, 0, w, h); const R = RNG('bdrug');
  g.strokeStyle = '#e2a840'; g.lineWidth = 10; g.strokeRect(20, 20, w - 40, h - 40); g.lineWidth = 4; g.strokeRect(44, 44, w - 88, h - 88);
  g.fillStyle = '#86202e'; g.fillRect(56, 56, w - 112, h - 112);
  for (let i = 0; i < 14; i++) for (let j = 0; j < 6; j++) { const x = 90 + i * (w - 180) / 13, y = 90 + j * (h - 180) / 5; g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.strokeStyle = 'rgba(226,168,64,0.55)'; g.lineWidth = 3; g.strokeRect(-12, -12, 24, 24); g.fillStyle = 'rgba(160,40,56,0.9)'; g.fillRect(-6, -6, 12, 12); g.restore(); }
  for (let k = 0; k < 1500; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,200,160,0.05)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); } }, 1024, 512); }
// side walls: walnut wainscot (panels) to y 8, a chair rail, ultramarine plaster above (roller marks), picture rail at 20
function bdTexWall() { const t = tex((g, w, h) => { const R = RNG('bdwall'), yW = h * (1 - 8 / BD_H), yP = h * (1 - 20 / BD_H);
  const pl = g.createLinearGradient(0, 0, 0, yW); pl.addColorStop(0, '#2a4c9e'); pl.addColorStop(1, '#3a62b8'); g.fillStyle = pl; g.fillRect(0, 0, w, yW);
  for (let x = 0; x < w; x += R.r(8, 22)) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(10,20,60,0.05)'; g.fillRect(x, 0, R.r(6, 18), yW); }
  g.fillStyle = '#e8c890'; g.fillRect(0, yP - 5, w, 6); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, yP + 1, w, 3);
  const wg = g.createLinearGradient(0, yW, 0, h); wg.addColorStop(0, '#8a4a2a'); wg.addColorStop(1, '#6a3420'); g.fillStyle = wg; g.fillRect(0, yW, w, h - yW);
  for (let i = 0; i < 4; i++) { const x0 = i * w / 4 + 14, pw = w / 4 - 28, y0 = yW + 22, ph = h - yW - 60; g.fillStyle = 'rgba(40,16,6,0.35)'; g.fillRect(x0, y0, pw, ph); g.fillStyle = '#82452a'; g.fillRect(x0 + 4, y0 + 4, pw - 8, ph - 8);
    g.strokeStyle = 'rgba(255,200,140,0.22)'; g.lineWidth = 2; g.strokeRect(x0 + 10, y0 + 10, pw - 20, ph - 20); for (let k = 0; k < 8; k++) { g.strokeStyle = 'rgba(50,20,8,0.2)'; g.beginPath(); const y = y0 + R.r(10, ph - 10); g.moveTo(x0 + 6, y); g.bezierCurveTo(x0 + pw / 3, y + R.n(8), x0 + 2 * pw / 3, y + R.n(8), x0 + pw - 6, y); g.stroke(); } }
  g.fillStyle = '#c88a50'; g.fillRect(0, yW - 8, w, 10); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, yW + 2, w, 4); g.fillStyle = '#3a1a0c'; g.fillRect(0, h - 16, w, 16); }, 512, 1024);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function bdWall(a0, a1, y0, y1, axis, at, mat) { const g = new THREE.PlaneGeometry(a1 - a0, y1 - y0), uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + (a0 + a1) / 2) / 14, (p.getY(i) + (y0 + y1) / 2) / BD_H);
  const m = new THREE.Mesh(g, mat); m.userData.noCast = true;
  if (axis === 'z') { m.position.set((a0 + a1) / 2, (y0 + y1) / 2, at); if (at > 1) m.rotation.y = Math.PI; }
  else { m.position.set(at, (y0 + y1) / 2, (a0 + a1) / 2); m.rotation.y = at < 0 ? Math.PI / 2 : -Math.PI / 2; }
  return m; }
// the sky + far skyline (painted, unlit), day or late afternoon
function bdTexSky(late) { return tex((g, w, h) => { const R = RNG('bdsky', late ? 2 : 1), sk = g.createLinearGradient(0, 0, 0, h * 0.78);
  if (late) { sk.addColorStop(0, '#3a62c8'); sk.addColorStop(0.5, '#8a9ae0'); sk.addColorStop(0.85, '#ffb27a'); sk.addColorStop(1, '#ffd29a'); } else { sk.addColorStop(0, '#2f6ee0'); sk.addColorStop(0.55, '#76b0f0'); sk.addColorStop(1, '#d8ecff'); }
  g.fillStyle = sk; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const cx = R.r(0, w), cy = R.r(h * 0.08, h * 0.45), r = R.r(36, 90); for (let k = 0; k < 5; k++) { g.fillStyle = late ? 'rgba(255,226,200,0.9)' : 'rgba(255,250,244,0.94)'; g.beginPath(); g.arc(cx + (k - 2) * r * 0.55, cy + Math.abs(k - 2) * r * 0.12, r * (0.6 + 0.12 * (2 - Math.abs(k - 2))), 0, TAU); g.fill(); }
    g.fillStyle = late ? 'rgba(200,120,170,0.45)' : 'rgba(150,150,220,0.42)'; g.fillRect(cx - r * 1.6, cy + r * 0.25, r * 3.2, r * 0.28); }
  for (let i = 0; i < 46; i++) { const x = R.r(-20, w), bw = R.r(24, 60), bh = R.r(h * 0.06, h * 0.22); g.fillStyle = late ? '#8a7ab8' : '#7c9ad8'; g.fillRect(x, h * 0.8 - bh, bw, bh + h * 0.2); }
  g.fillStyle = late ? '#6a5aa0' : '#6a86c8'; g.fillRect(0, h * 0.8, w, h * 0.2); }, 2048, 1024); }
// a mid skyline layer (transparent above the roofs): towers with window grids, a spire, a crane
function bdTexSkyline(late) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const R = RNG('bdsl', late ? 2 : 1);
  for (let i = 0; i < 30; i++) { const x = R.r(-30, w), bw = R.r(50, 120), bh = R.r(h * 0.25, h * 0.8), c = (late ? ['#5a6ab8', '#7a6aa8', '#4a5aa0', '#8a7ab0'] : ['#3a6ac0', '#5a8ad8', '#2a58a8', '#6a9ae0'])[i % 4];
    g.fillStyle = c; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x, h - bh, bw * 0.18, bh);
    for (let y = h - bh + 10; y < h - 6; y += 14) for (let xx = x + 6; xx < x + bw - 8; xx += 12) { g.fillStyle = R.f() < (late ? 0.3 : 0.12) ? (late ? '#ffd890' : '#e8f4ff') : 'rgba(20,30,70,0.35)'; g.fillRect(xx, y, 7, 8); }
    if (i % 7 === 3) { g.fillStyle = c; g.fillRect(x + bw / 2 - 3, h - bh - 60, 6, 60); } }
  g.strokeStyle = late ? '#c87a4a' : '#f2a83a'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.7, h); g.lineTo(w * 0.7, h * 0.12); g.lineTo(w * 0.9, h * 0.12); g.moveTo(w * 0.62, h * 0.12); g.lineTo(w * 0.7, h * 0.12); g.stroke(); }, 2048, 512); }
function bdTexTower(seed, c) { const t = tex((g, w, h) => { const R = RNG('bdtw', seed); g.fillStyle = c; g.fillRect(0, 0, w, h);
  for (let j = 0; j < 24; j++) for (let i = 0; i < 6; i++) { g.fillStyle = R.f() < 0.15 ? '#eaf4ff' : R.f() < 0.5 ? t3Mul(c, 0.72) : t3Mul(c, 1.2); g.fillRect(i * w / 6 + 4, j * h / 24 + 3, w / 6 - 8, h / 24 - 6); }
  g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.4, 0); g.lineTo(w * 0.62, 0); g.lineTo(w * 0.22, h); g.fill(); }, 128, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function bdTexScreen(on) { return (g, w, h) => { if (!on) { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a1e2c'); gr.addColorStop(1, '#0e1018'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(160,190,255,0.08)'; g.beginPath(); g.moveTo(w * 0.15, h); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.55, 0); g.lineTo(w * 0.25, h); g.fill(); return; }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#16307a'); gr.addColorStop(1, '#2a58c8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#76b900'; g.fillRect(0, 0, w, h * 0.05); inked(g, 'NVIDIA', w * 0.5, h * 0.2, h * 0.12, '#ffffff', { stroke: false, font: 'Arial', maxW: w * 0.6 });
  inked(g, 'BOARD OF DIRECTORS', w / 2, h * 0.42, h * 0.11, '#ffffff', { stroke: false, maxW: w * 0.86 }); inked(g, 'SPECIAL MEETING', w / 2, h * 0.6, h * 0.1, '#ffd23a', { stroke: false, maxW: w * 0.8 });
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.roundRect(w * 0.3, h * 0.72, w * 0.4, h * 0.14, h * 0.04); g.fill(); inked(g, 'SUN · NOV 8', w / 2, h * 0.79, h * 0.08, '#16307a', { stroke: false, maxW: w * 0.36 }); }; }
function bdTexArt() { return tex((g, w, h) => { const R = RNG('bdart'); g.fillStyle = '#f2e6cc'; g.fillRect(0, 0, w, h);
  for (const [x, y, r, c] of [[0.3, 0.4, 0.28, '#e8462a'], [0.68, 0.55, 0.22, '#2a6ad8'], [0.52, 0.28, 0.14, '#f2c23a'], [0.2, 0.75, 0.12, '#1e8a6a'], [0.82, 0.22, 0.1, '#e86aa0']]) { g.fillStyle = c; g.beginPath(); g.arc(w * x, h * y, w * r, 0, TAU); g.fill(); }
  g.strokeStyle = '#1e1a2a'; g.lineWidth = 14; g.beginPath(); g.moveTo(w * 0.05, h * 0.82); g.bezierCurveTo(w * 0.35, h * 0.3, w * 0.6, h * 0.95, w * 0.95, h * 0.36); g.stroke();
  for (let k = 0; k < 400; k++) { g.fillStyle = 'rgba(60,40,20,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), 3, 3); } }, 640, 448); }
function bdTexPad(seed) { return tex((g, w, h) => { const R = RNG('bdpad', seed); g.fillStyle = '#fff2a8'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8402e'; g.fillRect(0, 0, w, h * 0.08);
  for (let y = h * 0.16; y < h; y += h * 0.07) { g.fillStyle = 'rgba(80,120,200,0.45)'; g.fillRect(0, y, w, 2); } g.fillStyle = 'rgba(200,60,60,0.5)'; g.fillRect(w * 0.12, h * 0.08, 2, h);
  g.strokeStyle = '#1a2a6a'; g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); const y = h * (0.2 + k * 0.14); g.moveTo(w * 0.16, y); for (let i = 0; i < 14; i++) g.lineTo(w * (0.16 + i * 0.05), y + Math.sin(i * 1.9 + k + seed) * 5); g.stroke(); } }, 256, 352); }
function bdTexSheet(seed) { return tex((g, w, h) => { const R = RNG('bdsh', seed), gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#fbf3e2'); gr.addColorStop(1, '#ead8c0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = ['#2a6ad8', '#c8402e', '#1e8a6a', '#7a3ab0'][seed % 4]; g.fillRect(w * 0.08, h * 0.06, w * 0.5, h * 0.05);
  g.fillStyle = 'rgba(40,30,20,0.55)'; for (let i = 0; i < 16; i++) g.fillRect(w * 0.08, h * (0.16 + i * 0.048), w * R.r(0.5, 0.84), 3);
  if (seed % 2) { g.fillStyle = '#f2c23a'; for (let i = 0; i < 5; i++) { const bh = R.r(0.06, 0.2) * h; g.fillRect(w * (0.55 + i * 0.07), h * 0.92 - bh, w * 0.05, bh); } } }, 256, 340); }
function bdTexFolder() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#c8342a'); gr.addColorStop(1, '#a8241e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,8,4,0.45)'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = '#fbf0d8'; g.beginPath(); g.roundRect(w * 0.06, h * 0.14, w * 0.88, h * 0.6, 16); g.fill(); g.strokeStyle = '#2a1208'; g.lineWidth = 6; g.stroke();
  inked(g, 'INDEPENDENT', w / 2, h * 0.31, h * 0.17, '#1e1a2a', { stroke: false, maxW: w * 0.8 }); inked(g, 'INVESTIGATION', w / 2, h * 0.55, h * 0.17, '#1e1a2a', { stroke: false, maxW: w * 0.82 });
  g.save(); g.translate(w / 2, h * 0.86); g.rotate(-0.04); g.strokeStyle = '#ffe2a0'; g.lineWidth = 5; g.strokeRect(-w * 0.24, -h * 0.07, w * 0.48, h * 0.14); inked(g, 'CONFIDENTIAL', 0, 0, h * 0.08, '#ffe2a0', { stroke: false, maxW: w * 0.44 }); g.restore(); }, 768, 560); }
// the filing: an 8-K page; body big enough to read at a low angle
function bdTexFiling() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fbf6ea'); gr.addColorStop(1, '#efe4d0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e2a4a'; g.fillRect(w * 0.06, h * 0.035, w * 0.88, 4);
  inked(g, 'SECURITIES AND EXCHANGE COMMISSION', w / 2, h * 0.07, h * 0.026, '#1e2a4a', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.86 });
  inked(g, 'FORM 8-K', w / 2, h * 0.13, h * 0.06, '#1e2a4a', { stroke: false, font: 'Georgia, serif', weight: 700 });
  inked(g, 'NVIDIA CORPORATION', w / 2, h * 0.19, h * 0.034, '#1e2a4a', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.8 });
  g.fillStyle = '#1e2a4a'; g.fillRect(w * 0.06, h * 0.225, w * 0.88, 3);
  inked(g, 'Item 5.02 — Jensen Huang', w * 0.08, h * 0.27, h * 0.03, '#3a3a50', { stroke: false, align: 'left', font: 'Georgia, serif', weight: 700, maxW: w * 0.84 });
  const L = ['“…has resigned as', 'President, Chief', 'Executive Officer,', 'and a member of', 'the Board, effective', 'immediately.”'];
  L.forEach((s, i) => inked(g, s, w / 2, h * (0.35 + i * 0.085), h * 0.06, '#14141e', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.88 }));
  g.fillStyle = 'rgba(40,40,60,0.4)'; const R = RNG('bdfl'); for (let i = 0; i < 4; i++) g.fillRect(w * 0.08, h * (0.86 + i * 0.026), w * R.r(0.4, 0.84), 3);
  g.strokeStyle = '#1a2a6a'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.6, h * 0.95); for (let i = 0; i < 12; i++) g.lineTo(w * (0.6 + i * 0.025), h * 0.95 + Math.sin(i * 1.7) * 7); g.stroke(); }, 1024, 1320); }

// ---- builders
function bdChair(M, o = {}) { const g = new THREE.Group(), lea = o.mat ?? M.leather, chrome = M.chrome;
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, leg = rb(0.34, 0.2, 2.1, chrome, Math.sin(a) * 1.0, 0.42, Math.cos(a) * 1.0, 0); leg.rotation.y = a; g.add(leg); const cs = c3Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.dark, 0); cs.position.set(Math.sin(a) * 1.95, 0.2, Math.cos(a) * 1.95); g.add(cs); }
  g.add(cyl(0.32, 0.4, 0.4, chrome, 0, 0.5, 0, 0, 12)); g.add(cyl(0.2, 0.2, 1.7, chrome, 0, 1.4, 0, 0, 10)); g.add(rb(1.6, 0.25, 1.6, M.dark, 0, 2.25, 0, 0));
  g.add(c3Put(c3Mesh(c3RBox(3.3, 0.6, 3.1, 0.28, 3), lea, 0), 0, 2.65, 0)); g.add(c3Put(c3Mesh(c3RBox(3.0, 0.32, 2.8, 0.15, 3), lea, 0), 0, 3.05, 0.05));
  const bk = new THREE.Group(); bk.position.set(0, 3.0, -1.35); bk.rotation.x = -0.14; g.add(bk);
  bk.add(c3Put(c3Mesh(c3RBox(3.1, 5.0, 0.65, 0.3, 3), lea, 0), 0, 2.5, 0)); bk.add(c3Put(c3Mesh(c3RBox(2.7, 4.4, 0.3, 0.14, 3), lea, 0), 0, 2.45, 0.38));
  { const roll = cyl(0.38, 0.38, 3.0, lea, 0, 5.0, 0.12, 0, 14); roll.rotation.z = Math.PI / 2; bk.add(roll); }
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { const b = c3Mesh(new THREE.SphereGeometry(0.07, 6, 5), M.dark, 0); b.position.set((i - 1) * 0.8, 1.1 + j * 1.2, 0.55); bk.add(b); }
  for (const sx of [-1, 1]) { g.add(rb(0.18, 1.2, 0.18, chrome, sx * 1.62, 3.4, 0.2, 0)); g.add(c3Put(c3Mesh(c3RBox(0.5, 0.28, 2.3, 0.12, 2), M.dark, 0), sx * 1.62, 4.05, 0.05)); }
  return g; }
function bdPlant(seed, s = 1, potC = '#c8603a') { const g = new THREE.Group(), R = RNG('bdplant', seed), lf = c3Prop('#2e9a44', { rough: 0.55, side: THREE.DoubleSide }), lf2 = c3Prop('#56bc4a', { rough: 0.55 });
  g.add(cyl(1.2 * s, 0.9 * s, 2.4 * s, c3Prop(potC, { rough: 0.5 }), 0, 1.2 * s, 0, 0, 16)); g.add(cyl(1.3 * s, 1.3 * s, 0.3 * s, c3Prop(t3Mul(potC, 0.8), { rough: 0.5 }), 0, 2.35 * s, 0, 0, 16)); g.add(cyl(1.1 * s, 1.1 * s, 0.1, c3Prop('#4a2a1a'), 0, 2.45 * s, 0, 0, 14));
  for (let k = 0; k < 13; k++) { const a = k * 2.4 + R.n(0.3), ht = (3.4 + R.r(0, 3.6)) * s, ang = 0.2 + R.r(0, 0.5), st = cyl(0.06 * s, 0.08 * s, ht, c3Prop('#3a7a2a'), 0, 0, 0, 0, 6);
    st.position.set(Math.sin(ang) * Math.cos(a) * ht / 2, 2.4 * s + Math.cos(ang) * ht / 2, Math.sin(ang) * Math.sin(a) * ht / 2); st.rotation.set(Math.sin(a) * ang, 0, -Math.cos(a) * ang); g.add(st);
    const L = c3Mesh(new THREE.SphereGeometry(1.0 * s, 12, 8), k % 3 ? lf : lf2, 0); L.scale.set(0.95, 0.14, 0.7); L.position.set(Math.sin(ang) * Math.cos(a) * ht, 2.4 * s + Math.cos(ang) * ht, Math.sin(ang) * Math.sin(a) * ht); L.rotation.set(0, -a, -0.5 - ang); g.add(L); }
  return g; }
function bdGlass(M) { const g = new THREE.Group(), gl = c3Prop('#e6f2ff', { rough: 0.05, env: 1.6, transparent: true }); gl.opacity = 0.42;
  const c = c3Mesh(new THREE.CylinderGeometry(0.34, 0.28, 1.0, 16, 1, true), gl, 0); c.position.y = 0.5; c.material.side = THREE.DoubleSide; g.add(c);
  g.add(cyl(0.29, 0.29, 0.05, gl, 0, 0.03, 0, 0, 16)); const w = cyl(0.3, 0.27, 0.6, M.water, 0, 0.33, 0, 0, 16); g.add(w); g.userData.water = w;
  const rim = c3Mesh(new THREE.TorusGeometry(0.34, 0.02, 5, 16), c3Prop('#ffffff', { rough: 0.1 }), 0); rim.rotation.x = Math.PI / 2; rim.position.y = 1.0; g.add(rim); return g; }
function bdCarafe(M) { const g = new THREE.Group(), gl = c3Prop('#e6f2ff', { rough: 0.05, env: 1.6, transparent: true }); gl.opacity = 0.45;
  const prof = [[0, 0], [0.55, 0.02], [0.62, 0.6], [0.5, 1.4], [0.24, 1.9], [0.22, 2.3], [0.3, 2.4]].map(([x, y]) => new THREE.Vector2(x, y));
  const b = c3Mesh(new THREE.LatheGeometry(prof, 18), gl, 0); b.material.side = THREE.DoubleSide; g.add(b);
  const w = c3Mesh(new THREE.LatheGeometry([[0, 0.04], [0.52, 0.06], [0.58, 0.6], [0.5, 1.1], [0, 1.1]].map(([x, y]) => new THREE.Vector2(x, y)), 18), M.water, 0); g.add(w); return g; }
function bdLaptop(M, scr) { const g = new THREE.Group(), al = c3Prop('#c8ccd6', { metal: 0.5, rough: 0.3 });
  g.add(c3Put(c3Mesh(c3RBox(2.6, 0.12, 1.8, 0.05, 2), al, 0), 0, 0.06, 0)); g.add(rb(2.2, 0.02, 0.9, M.dark, 0, 0.13, -0.2, 0));
  const lid = new THREE.Group(); lid.position.set(0, 0.12, -0.88); lid.rotation.x = -0.32; g.add(lid); lid.add(c3Put(c3Mesh(c3RBox(2.6, 1.7, 0.08, 0.04, 2), al, 0), 0, 0.85, 0));
  const sc = pl(2.4, 1.5, c3Prop('#ffffff', { map: scr, emissive: '#ffffff', emissiveMap: scr, ei: 0.7, rough: 0.3 }), 0, 0.85, 0.045); lid.add(sc); return g; }
function bdTexLapScr(seed) { return tex((g, w, h) => { const R = RNG('bdls', seed); g.fillStyle = '#123070'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e4aa8'; g.fillRect(0, 0, w, h * 0.12);
  g.strokeStyle = seed % 2 ? '#3ad87a' : '#ffb03a'; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= 10; i++) g.lineTo(w * (0.08 + i * 0.084), h * (0.75 - 0.4 * (i / 10) + R.n(0.08))); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 4; i++) g.fillRect(w * 0.08, h * (0.2 + i * 0.07), w * R.r(0.2, 0.4), 6); }, 256, 160); }
function bdStamp(M) { const g = new THREE.Group(), wood = c3Prop('#a8622e', { rough: 0.45 });   // origin = the rubber face centre; handle up (+y)
  g.add(c3Put(c3Mesh(c3RBox(1.5, 0.12, 0.9, 0.04, 2), c3Prop('#c8242a', { rough: 0.7 }), 0), 0, 0.06, 0)); g.add(c3Put(c3Mesh(c3RBox(1.6, 0.42, 1.0, 0.1, 2), wood, 0), 0, 0.33, 0));
  g.add(cyl(0.32, 0.5, 0.25, wood, 0, 0.66, 0, 0, 14)); g.add(cyl(0.16, 0.2, 0.9, wood, 0, 1.2, 0, 0, 12)); const k = c3Mesh(new THREE.SphereGeometry(0.46, 16, 12), c3Prop('#2a2a34', { rough: 0.3 }), 0); k.position.y = 1.85; k.scale.y = 0.85; g.add(k);
  g.add(rb(1.62, 0.06, 1.02, c3Prop('#d8a840', { metal: 0.6, rough: 0.3 }), 0, 0.55, 0, 0)); g.userData.knob = V3(0, 1.85, 0); return g; }
function bdTray(M) { const g = new THREE.Group(), wd = c3Prop('#7a4424', { rough: 0.4 }), brass = c3Prop('#d8a840', { metal: 0.6, rough: 0.3 });   // origin = floor of the tray front centre; bed tilts up toward -z
  const D = 3.6, Wd = 3.4, rise = Math.sin(BD_TILT) * D;
  g.add(rb(Wd + 0.3, 0.14, D + 0.1, wd, 0, 0.07, -D / 2, 0));
  const bed = c3Mesh(c3RBox(Wd, 0.1, D, 0.04, 2), c3Prop('#5e3220', { rough: 0.5 }), 0); bed.position.set(0, 0.2 + rise / 2, -D / 2 * Math.cos(BD_TILT)); bed.rotation.x = BD_TILT; g.add(bed);
  for (const sx of [-1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0);   // the right side stays open: the filing slides in from there
 sh.lineTo(-D * Math.cos(BD_TILT), 0); sh.lineTo(-D * Math.cos(BD_TILT), rise + 0.55); sh.lineTo(0, 0.5); sh.closePath();
    const sd = c3Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: false }), wd, 0); sd.rotation.y = -Math.PI / 2; sd.position.set(sx * (Wd / 2 + 0.1) + 0.07, 0, 0); g.add(sd); }
  g.add(rb(Wd + 0.3, rise + 0.7, 0.14, wd, 0, (rise + 0.7) / 2, -D * Math.cos(BD_TILT) - 0.05, 0));
  g.add(rb(Wd + 0.3, 0.42, 0.14, wd, 0, 0.21, 0.02, 0)); const lb = pl(1.6, 0.3, c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#d8a840'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a5a20'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); inked(x, 'FILINGS', w / 2, h / 2 + 2, h * 0.6, '#2a1a0a', { stroke: false, maxW: w * 0.84 }); }, 320, 64) }), 0, 0.22, 0.1); g.add(lb);
  g.userData.bedPt = (u, v, lift = 0) => V3((u - 0.5) * Wd, 0.25 + v * rise + lift * Math.cos(BD_TILT), -v * D * Math.cos(BD_TILT) + lift * Math.sin(BD_TILT));
  return g; }
function bdPendant(M) { const g = new THREE.Group(); g.add(cyl(0.05, 0.05, 6, M.brass, 0, 3.0, 0, 0, 6)); g.add(cyl(0.6, 0.6, 0.15, M.brass, 0, 6.0, 0, 0, 12));
  const sh = c3Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.5, 32, 1, true), c3Prop('#e8a24a', { rough: 0.7, side: THREE.DoubleSide, emissive: '#ff9a3a', ei: 0.35 }), 0); sh.material.side = THREE.DoubleSide; g.add(sh);
  for (const y of [-0.75, 0.75]) { const r = c3Mesh(new THREE.TorusGeometry(2.3, 0.06, 6, 32), M.brass, 0); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); }
  const d = c3Mesh(new THREE.CircleGeometry(2.2, 28), c3Prop('#fff2d0', { emissive: '#ffd890', ei: 1.6, glow: '#ffc878' }), 0); d.rotation.x = Math.PI / 2; d.position.y = -0.55; g.add(d); g.userData.disc = d; g.userData.shade = sh; return g; }

function bdBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#8aa4e8', ambI: 0.3, sky: '#c8dcff', ground: '#a86848', key: '#ffe6c4', keyI: 0.85, keyP: [40, 60, 70], rim: '#cfe0ff', rimI: 0.45, rimP: [-10, 40, -60] });
  s.hemi = scene.children.find((c) => c.isHemisphereLight);
  const M = BD.M = { chrome: c3Prop('#d0d4dc', { metal: 0.7, rough: 0.25 }), dark: c3Prop('#2a2228', { rough: 0.5 }), leather: c3Prop('#8e2430', { rough: 0.38, env: 1.2 }), brass: c3Prop('#d8a840', { metal: 0.65, rough: 0.3 }),
    walnut: c3Prop('#ffffff', { map: bdTexWalnut('top'), rough: 0.32, env: 1.1 }), walnutD: c3Prop('#ffffff', { map: bdTexWalnut('dk', '#74401f'), rough: 0.45 }), frame: c3Prop('#e8dcc4', { rough: 0.45 }),
    mull: c3Prop('#2a2a34', { metal: 0.4, rough: 0.35 }), cream: c3Prop('#f2e6cc', { rough: 0.6 }), water: c3Prop('#5ab0f0', { rough: 0.1, env: 1.4, emissive: '#1a5a9a', ei: 0.25 }), white: c3Prop('#f2f0ea', { rough: 0.35 }) };
  const F = new THREE.Group(); scene.add(F);   // FOCUS: people + every prop on the table
  // ---- floor, rug, walls, ceiling
  scene.add(pl(2 * BD_X, BD_Z, c3Prop('#ffffff', { map: bdTexHerring(), rough: 0.35, env: 0.8 }), 0, 0, BD_Z / 2, 0, -Math.PI / 2));
  { const r = pl(44, 24, c3Prop('#ffffff', { map: bdTexRug(), rough: 0.95 }), 0, 0.03, 20, 0, -Math.PI / 2); r.userData.noCast = true; scene.add(r); }
  const wallM = c3Prop('#ffffff', { map: bdTexWall(), rough: 0.8 });
  scene.add(bdWall(0, BD_Z, 0, BD_H, 'x', -BD_X, wallM)); scene.add(bdWall(0, BD_Z, 0, BD_H, 'x', BD_X, wallM)); scene.add(bdWall(-BD_X, BD_X, 0, BD_H, 'z', BD_Z, wallM));
  { const hd = c3Prop('#2c50a2', { rough: 0.8 }); scene.add(rbNC(2 * BD_X, BD_H - 22, 0.6, hd, 0, 22 + (BD_H - 22) / 2, -0.3, 0)); scene.add(rbNC(2 * BD_X, 3, 0.6, M.walnutD, 0, 1.5, -0.3, 0));
    scene.add(rbNC(2 * BD_X, 0.5, 1.6, M.walnut, 0, 3.15, 0.4, 0)); for (const sx of [-1, 1]) scene.add(rbNC(4, BD_H, 0.6, hd, sx * 30, BD_H / 2, -0.3, 0)); }
  scene.add(plNC(2 * BD_X, BD_Z, c3Prop('#e8dcc8', { rough: 0.8 }), 0, BD_H, BD_Z / 2, 0, Math.PI / 2));
  { const KC = new THREE.Group(); scene.add(KC); for (let x = -32; x <= 32; x += 8) KC.add(rbNC(0.7, 1.0, BD_Z, M.frame, x, BD_H - 0.5, BD_Z / 2, 0)); for (let z = 0; z <= BD_Z; z += 7.6) KC.add(rbNC(2 * BD_X, 1.0, 0.7, M.frame, 0, BD_H - 0.5, z, 0));
    for (let x = -28; x <= 28; x += 8) for (let z = 3.8; z < BD_Z; z += 7.6) { const d = cyl(0.45, 0.45, 0.1, c3Prop('#fff6e0', { emissive: '#fff0d0', ei: 1.0 }), x, BD_H - 0.06, z, 0, 12); d.userData.noCast = true; KC.add(d); } }
  // crown + skirting on the side walls
  for (const sx of [-1, 1]) { scene.add(rbNC(0.6, 0.8, BD_Z, M.frame, sx * (BD_X - 0.3), BD_H - 0.4, BD_Z / 2, 0)); scene.add(rbNC(0.4, 0.6, BD_Z, M.walnutD, sx * (BD_X - 0.2), 0.3, BD_Z / 2, 0)); }
  // ---- the window wall: mullions, transom, glass with reflections, drapes; the city outside
  { for (let x = -28; x <= 28; x += 7) scene.add(rbNC(0.55, 19, 0.8, M.mull, x, 12.5, 0.1, 0)); scene.add(rbNC(56.6, 0.5, 0.8, M.mull, 0, 3.25, 0.1, 0)); scene.add(rbNC(56.6, 0.55, 0.8, M.mull, 0, 22, 0.1, 0)); scene.add(rbNC(56.6, 0.35, 0.6, M.mull, 0, 17.6, 0.1, 0));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(56, 18.6), new THREE.MeshBasicMaterial({ map: tex((g, w, h) => { g.clearRect(0, 0, w, h); for (const [a, b, o] of [[0.04, 0.1, 0.1], [0.3, 0.33, 0.06], [0.52, 0.6, 0.08], [0.8, 0.83, 0.06]]) { g.fillStyle = `rgba(255,255,255,${o})`; g.beginPath(); g.moveTo(w * a, h); g.lineTo(w * (a + 0.12), 0); g.lineTo(w * (b + 0.12), 0); g.lineTo(w * b, h); g.fill(); }
      g.fillStyle = 'rgba(120,170,230,0.1)'; g.fillRect(0, 0, w, h); }, 512, 256), transparent: true, depthWrite: false, toneMapped: false })); gl.position.set(0, 12.6, 0.15); Object.assign(gl.userData, { noCast: true, noShade: true }); scene.add(gl);
    const drM = c3Prop('#e8d4a8', { rough: 0.85, side: THREE.DoubleSide });
    for (const [x, w] of [[-29.4, 4.4], [29.4, 4.4], [-14, 2.2], [14, 2.2]]) { const geo = new THREE.PlaneGeometry(w, 22.5, 24, 1), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.28 * Math.sin(p.getX(i) / w * 24 * 1.3));
      geo.computeVertexNormals(); const d = new THREE.Mesh(geo, drM); d.position.set(x, 13.0, 1.0); d.userData.noCast = true; scene.add(d); }
    for (const x of [-29.4, 29.4, -14, 14]) { const tb = cyl(0.12, 0.12, x === -14 || x === 14 ? 2.6 : 4.8, M.brass, x, 24.4, 1.0, 0, 8); tb.rotation.z = Math.PI / 2; scene.add(tb); }
    // outside: the sky (far) + a painted skyline layer + 3D towers (near) = parallax; both skies swap for the late shots
    s.skyDay = pl(1100, 550, c3Flat('#ffffff', { map: bdTexSky(false) }), 0, 40, -420); s.skyLate = pl(1100, 550, c3Flat('#ffffff', { map: bdTexSky(true) }), 0, 40, -420);
    s.slDay = pl(420, 105, c3Flat('#ffffff', { map: bdTexSkyline(false), transparent: true }), 0, -12, -170); s.slLate = pl(420, 105, c3Flat('#ffffff', { map: bdTexSkyline(true), transparent: true }), 0, -12, -170);
    for (const m of [s.skyDay, s.skyLate, s.slDay, s.slLate]) { m.material.userData.c3keep = true; Object.assign(m.userData, { noCast: true, noShade: true }); m.material.fog = false; scene.add(m); }
    const R = RNG('bdtow'), cols = ['#3a6ac8', '#5a86d8', '#2a5ab0', '#7aa0e0', '#4a76c0'];
    for (let i = 0; i < 16; i++) { const x = -70 + i * 9.4 + R.n(2.5), z = -26 - R.r(0, 40) - (i % 3) * 8, w = R.r(7, 12), d = R.r(7, 12), top = R.r(4, 34), c = cols[i % cols.length], tx = bdTexTower(i, c); tx.repeat.set(1, (top + 90) / 30);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, top + 90, d), c3Flat('#ffffff', { map: tx })); m.material.userData.c3keep = true; m.position.set(x, (top - 90) / 2, z); Object.assign(m.userData, { noCast: true, noShade: true }); scene.add(m);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 1.6, d * 0.8), c3Flat(t3Mul(c, 0.7))); cap.material.userData.c3keep = true; cap.position.set(x, top + 0.8, z); scene.add(cap);
      if (i % 4 === 1) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, 9, 6), c3Flat('#c8d0e0')); sp.material.userData.c3keep = true; sp.position.set(x, top + 6, z); scene.add(sp); } } }
  // ---- left wall: credenza + wall screen
  { const g = new THREE.Group(); scene.add(g); const x = -BD_X + 1.8;
    g.add(c3Put(c3Mesh(c3RBox(3.4, 4.2, 20, 0.15, 3), M.walnutD, 0), x, 2.6, 21)); g.add(c3Put(c3Mesh(c3RBox(3.8, 0.3, 20.6, 0.1, 2), M.walnut, 0), x, 4.85, 21));
    for (let i = 0; i < 5; i++) { g.add(rb(0.08, 3.4, 3.7, c3Prop('#4a2414', { rough: 0.5 }), x + 1.72, 2.6, 13.4 + i * 3.8, 0)); g.add(rb(0.12, 0.9, 0.16, M.brass, x + 1.8, 2.8, 14.9 + i * 3.8, 0)); }
    for (const z of [11.6, 30.4]) for (const dz of [-0.4, 0.4]) g.add(cyl(0.1, 0.06, 0.5, M.brass, x + (dz > 0 ? 1.2 : -1.2), 0.25, z, 0, 6));
    const tray = cyl(1.3, 1.3, 0.08, M.brass, x, 5.04, 14.6, 0, 20); g.add(tray); const cf = bdCarafe(M); cf.position.set(x, 5.08, 14.6); g.add(cf);
    for (let i = 0; i < 3; i++) { const gg = bdGlass(M); gg.scale.setScalar(0.85); gg.position.set(x + Math.cos(i * 2.1) * 0.8, 5.08, 14.6 + Math.sin(i * 2.1) * 0.8 + 0.2); g.add(gg); }
    for (let i = 0; i < 7; i++) { const bk = rb(1.9, 1.6 + (i % 3) * 0.25, 0.42, c3Prop(['#c8402e', '#2a5ab0', '#e8a83a', '#1e7a5a', '#6a3a9a', '#e8e0cc', '#2a2a3a'][i]), x, 5.8 + (i % 3) * 0.12, 22 + i * 0.46, 0); g.add(bk); }
    g.add(c3Put(c3Mesh(c3RBox(1.6, 0.5, 1.6, 0.12), M.walnut, 0), x, 5.25, 25.6)); { const br = c3Mesh(new THREE.TorusKnotGeometry(0.6, 0.18, 64, 8, 2, 3), c3Prop('#b87a3a', { metal: 0.8, rough: 0.3 }), 0); br.position.set(x, 6.5, 25.6); g.add(br); }
    g.add(cyl(0.5, 0.6, 0.3, M.brass, x, 5.15, 28.6, 0, 14)); g.add(cyl(0.08, 0.08, 2.6, M.brass, x, 6.4, 28.6, 0, 6)); { const sh = cyl(0.8, 1.2, 1.3, c3Prop('#f6e2b8', { emissive: '#ffd8a0', ei: 0.9, glow: '#ffd090' }), x, 8.1, 28.6, 0, 16); g.add(sh); }
    const p1 = bdPlant(3, 0.42, '#e8e0d4'); p1.position.set(x, 5.0, 17.6); g.add(p1);
    s.screen = canvasTex(1024, 576); const fr = c3Put(c3Mesh(c3RBox(0.5, 8.4, 14.6, 0.12), M.dark, 0), -BD_X + 0.3, 13.0, 21); scene.add(fr);
    const sc = pl(14, 7.9, c3Prop('#ffffff', { map: s.screen.t, emissive: '#ffffff', emissiveMap: s.screen.t, ei: 0.85, rough: 0.25 }), -BD_X + 0.58, 13.0, 21, Math.PI / 2); scene.add(sc); s.scrM = sc.material;
    for (const [z, k] of [[6.5, 1.05], [36, 1.0]]) { const p = bdPlant(10 + z, k, '#2a2a34'); p.position.set(-BD_X + 2.6, 0, z); scene.add(p); } }
  // ---- right wall: painting, sconces, double doors, plants, side table
  { const fr = c3Put(c3Mesh(c3RBox(0.5, 8.0, 11.4, 0.12), M.brass, 0), BD_X - 0.3, 12.6, 16); scene.add(fr); scene.add(pl(10.6, 7.2, c3Flat('#ffffff', { map: bdTexArt() }), BD_X - 0.58, 12.6, 16, -Math.PI / 2));
    for (const z of [8.6, 23.4]) { scene.add(rb(0.3, 1.2, 0.6, M.brass, BD_X - 0.2, 13, z, 0)); scene.add(cyl(0.55, 0.4, 1.4, c3Prop('#f6e2b8', { emissive: '#ffd8a0', ei: 1.0, glow: '#ffd090' }), BD_X - 1.0, 13.9, z, 0, 14)); }
    const dw = c3Prop('#ffffff', { map: bdTexWalnut('door', '#6a3420'), rough: 0.4 }); for (const dz of [-2.6, 2.6]) { scene.add(rb(0.4, 15, 5.0, dw, BD_X - 0.25, 7.5, 35 + dz, 0)); scene.add(rb(0.3, 2.0, 0.25, M.brass, BD_X - 0.6, 7.6, 35 + dz * 0.2, 0)); for (const y of [4, 11]) scene.add(rb(0.12, 4.6, 3.6, c3Prop('#5a2a18', { rough: 0.5 }), BD_X - 0.48, y, 35 + dz, 0)); }
    scene.add(rb(0.8, 0.8, 11.4, M.frame, BD_X - 0.4, 15.4, 35, 0));
    for (const [z, k] of [[3.4, 1.15], [44, 0.9]]) { const p = bdPlant(20 + z, k, '#c8603a'); p.position.set(BD_X - 2.6, 0, z); scene.add(p); }
    scene.add(rb(2.4, 4.2, 4.0, M.walnutD, BD_X - 1.6, 2.1, 27.8, 0)); { const ph = c3Put(c3Mesh(c3RBox(1.4, 0.5, 1.0, 0.15), M.dark, 0), BD_X - 1.6, 4.45, 27.8); scene.add(ph); } }
  // ---- near wall (rarely seen): bookcase + clock
  { for (let i = 0; i < 4; i++) { const sh = new THREE.Group(); sh.position.set(-18 + i * 12, 0, BD_Z - 1.4); scene.add(sh); sh.add(rb(10, 16, 2.4, M.walnutD, 0, 8, 0, 0)); for (let r = 0; r < 5; r++) sh.add(pl(9.2, 2.6, c3Prop('#ffffff', { map: texBooks(i * 5 + r), rough: 0.8 }), 0, 1.9 + r * 3.0, -1.22, Math.PI)); }
    const ck = cyl(1.4, 1.4, 0.3, M.brass, 0, 20, BD_Z - 0.2, 0, 24); ck.rotation.x = Math.PI / 2; scene.add(ck); scene.add(pl(2.4, 2.4, c3Flat('#ffffff', { map: texClock() }), 0, 20, BD_Z - 0.4, Math.PI)); }
  // ---- the table: walnut top with a light inlay band, apron, modesty panel, two pedestals
  { const [cx, cz] = BD_TC, g = new THREE.Group(); scene.add(g);
    g.add(c3Put(c3Mesh(c3RBox(BD_TW, 0.45, BD_TD, 0.2, 4), M.walnut, 0), cx, BD_TY - 0.225, cz));
    g.add(rb(BD_TW - 1.6, 0.03, 0.22, c3Prop('#e8c088', { rough: 0.4 }), cx, BD_TY + 0.005, cz - BD_TD / 2 + 0.7, 0)); g.add(rb(BD_TW - 1.6, 0.03, 0.22, c3Prop('#e8c088', { rough: 0.4 }), cx, BD_TY + 0.005, cz + BD_TD / 2 - 0.7, 0));
    g.add(rb(BD_TW - 2.4, 0.8, BD_TD - 2.0, M.walnutD, cx, BD_TY - 0.85, cz, 0)); g.add(rb(BD_TW - 4, 3.6, 0.3, M.walnutD, cx, 2.4, cz, 0));
    for (const sx of [-1, 1]) { g.add(c3Put(c3Mesh(c3RBox(3.4, 3.9, 5.0, 0.3, 3), M.walnutD, 0), cx + sx * 9.5, 2.1, cz)); g.add(rb(4.2, 0.3, 5.8, M.dark, cx + sx * 9.5, 0.15, cz, 0)); g.add(rb(3.0, 0.08, 4.6, M.brass, cx + sx * 9.5, 3.8, cz, 0)); }
    // the speakerphone + a low centrepiece (succulent bowl), cable ports
    g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.3, 3), M.dark, 0), -3.6, BD_TY + 0.15, cz + 0.6, 0.3)); g.add(cyl(0.25, 0.25, 0.05, c3Prop('#40ff80', { emissive: '#30ff70', ei: 1.5 }), -3.6, BD_TY + 0.32, cz + 0.6, 0, 8));
    g.add(cyl(1.6, 1.0, 0.7, c3Prop('#e8e4dc', { rough: 0.3 }), -10, BD_TY + 0.35, cz, 0, 20)); for (let k = 0; k < 9; k++) { const sc = c3Mesh(new THREE.SphereGeometry(0.45, 8, 6), c3Prop(k % 2 ? '#5ab86a' : '#8acc6a', { rough: 0.6 }), 0); sc.scale.set(1, 0.6, 1); sc.position.set(-10 + Math.cos(k * 0.7) * 0.9 * (k % 3) / 2, BD_TY + 0.8 + (k % 2) * 0.15, cz + Math.sin(k * 0.7) * 0.9 * (k % 3) / 2); g.add(sc); }
    for (const x of [-6, 6]) g.add(cyl(0.5, 0.5, 0.04, M.brass, x, BD_TY + 0.02, cz, 0, 12)); }
  // ---- chairs (set): far side x -12 / -6.2 / 6.2 / 12 (+ the chair's own, pushed back), the ends, the near side
  s.chairs = {};
  const chairAt = (k, x, z, ry, F2) => { const c = bdChair(M); c.position.set(x, 0, z); c.rotation.y = ry; (F2 || scene).add(c); s.chairs[k] = c; c.userData.base = [x, z, ry]; return c; };
  chairAt('f0', -12.4, 11.6, 0); chairAt('fa', -6.2, 11.3, 0); chairAt('fc', 0.6, 10.2, 0.35); chairAt('fb', 6.2, 11.3, 0); chairAt('f3', 12.4, 11.6, 0);
  chairAt('eL', -18.4, 20, Math.PI / 2); chairAt('eR', 18.6, 19.4, -Math.PI / 2);
  // ---- FOCUS table-top props
  const P = s.props = {};
  P.folder = new THREE.Group(); { const fw = 3.4, fd = 2.5, fh = 0.9, fm = c3Prop('#b82a22', { rough: 0.5 });
    P.folder.add(c3Put(c3Mesh(c3RBox(fw, fh, fd, 0.08, 2), fm, 0), 0, 0, 0)); P.folder.add(rb(fw - 0.12, fh - 0.24, fd + 0.04, c3Prop('#f4ead2', { rough: 0.8 }), 0.04, 0, 0, 0));
    for (let i = 0; i < 4; i++) P.folder.add(rb(fw - 0.2, 0.02, fd + 0.06, c3Prop('#d8c8a8', { rough: 0.8 }), 0.04, -0.3 + i * 0.2, 0, 0));
    P.folder.add(pl(fw - 0.1, fd - 0.1, c3Prop('#ffffff', { map: bdTexFolder(), rough: 0.5 }), 0, fh / 2 + 0.01, 0, 0, -Math.PI / 2));
    P.folder.add(rb(fw + 0.04, fh + 0.04, 0.12, c3Prop('#1e1a2a', { rough: 0.6 }), 0, 0, 0.55, 0)); P.folder.userData.dim = [fw, fh, fd]; F.add(P.folder); }
  P.glasses = [[-5.4, 17.4], [-7.4, 17.2], [5.2, 17.2], [7.4, 17.6], [11.4, 17.2], [-1.4, 17.2], [2.2, 21.6]].map(([x, z], i) => { const g = bdGlass(M); g.position.set(x, BD_TY, z); g.userData.base = [x, z]; F.add(g); return g; });
  P.carafes = [[-2.4, 19.6], [9.4, 20.2]].map(([x, z]) => { const c = bdCarafe(M); c.position.set(x, BD_TY, z); c.userData.base = [x, z]; F.add(c); return c; });
  P.laptop = bdLaptop(M, bdTexLapScr(1)); P.laptop.position.set(8.9, BD_TY, 16.9); P.laptop.rotation.y = Math.PI - 0.35; F.add(P.laptop);
  P.laptop2 = bdLaptop(M, bdTexLapScr(2)); P.laptop2.position.set(15.0, BD_TY, 17.4); P.laptop2.rotation.y = Math.PI + 0.4; F.add(P.laptop2);
  P.pads = [[-6.4, 18.0, 0.1], [4.6, 18.2, -0.2], [-12.4, 18.0, 0.05]].map(([x, z, r], i) => { const m = pl(1.6, 2.2, c3Prop('#ffffff', { map: bdTexPad(i), rough: 0.8 }), x, BD_TY + 0.02, z, 0, -Math.PI / 2); m.rotation.z = r; F.add(m); return m; });
  P.pens = [[-5.2, 18.4, 0.6], [3.6, 18.5, -0.3]].map(([x, z, r]) => { const p = cyl(0.07, 0.07, 1.4, c3Prop('#1e1e2a', { metal: 0.3, rough: 0.3 }), 0, 0, 0, 0, 8); p.rotation.set(0, 0, Math.PI / 2); const g = new THREE.Group(); g.add(p); g.add(cyl(0.075, 0.075, 0.2, M.brass, 0.5, 0, 0, 0, 8)).children.at(-1).rotation.z = Math.PI / 2; g.position.set(x, BD_TY + 0.08, z); g.rotation.y = r; g.userData.base = [x, z, r]; F.add(g); return g; });
  P.sheets = [[-2.4, 17.9, 0.3], [2.6, 18.1, -0.4], [1.0, 19.2, 0.9], [-1.0, 19.0, -0.7]].map(([x, z, r], i) => { const m = pl(1.7, 2.25, c3Prop('#ffffff', { map: bdTexSheet(i), rough: 0.8, side: THREE.DoubleSide }), 0, 0, 0); const g = new THREE.Group(); m.rotation.x = -Math.PI / 2; g.add(m); g.position.set(x, BD_TY + 0.02 + i * 0.006, z); g.rotation.y = r; g.userData.base = [x, z, r]; F.add(g); return g; });
  P.cup = new THREE.Group(); { P.cup.add(cyl(0.7, 0.7, 0.06, M.white, 0, 0.03, 0, 0, 18)); P.cup.add(cyl(0.42, 0.34, 0.6, M.white, 0, 0.36, 0, 0, 16)); P.cup.add(cyl(0.38, 0.38, 0.02, c3Prop('#5a2a14'), 0, 0.62, 0, 0, 14)); const h = c3Mesh(new THREE.TorusGeometry(0.17, 0.05, 6, 12), M.white, 0); h.position.set(0.46, 0.38, 0); P.cup.add(h); P.cup.position.set(10.6, BD_TY, 18.0); F.add(P.cup); }
  P.tray = bdTray(M); P.tray.position.set(BD_TRAY[0], BD_TY, BD_TRAY[1] + 1.6); F.add(P.tray);
  P.stamp = bdStamp(M); F.add(P.stamp); P.inkpad = new THREE.Group(); { P.inkpad.add(c3Put(c3Mesh(c3RBox(2.0, 0.26, 1.4, 0.08, 2), c3Prop('#2a3a6a', { metal: 0.3, rough: 0.35 }), 0), 0, 0.13, 0)); P.inkpad.add(rb(1.7, 0.03, 1.1, c3Prop('#a81e24', { rough: 0.9 }), 0, 0.27, 0, 0)); P.inkpad.position.set(BD_PAD[0], BD_TY, BD_PAD[1]); F.add(P.inkpad); }
  P.page = new THREE.Group(); { const pg = pl(2.6, 3.36, c3Prop('#ffffff', { map: bdTexFiling(), rough: 0.75, side: THREE.DoubleSide }), 0, 0, 0); pg.rotation.x = -Math.PI / 2; P.page.add(pg); P.pageM = pg;
    P.imprint = pl(2.05, 1.02, new THREE.MeshBasicMaterial({ map: texStamp('FILED', '#d8282a', -0.16), transparent: true, depthWrite: false, toneMapped: false }), 0.35, 0.012, 0.62); P.imprint.rotation.x = -Math.PI / 2; P.imprint.userData.noCast = true; P.page.add(P.imprint); P.page.visible = false; F.add(P.page); }
  c3Layer(F, C3.L_FOCUS);
  // ---- pendants (set) + practical lights
  s.pend = []; for (const x of [-10, 0, 10]) { const p = bdPendant(M); p.position.set(x, 17.2, BD_TC[1]); scene.add(p); s.pend.push(p);
    const l = new THREE.PointLight('#ffc070', 1.2, 26, 1.6); l.position.set(x, 15.8, BD_TC[1]); l.layers.enableAll(); scene.add(l); p.userData.light = l; }
  { const wl = new THREE.SpotLight('#cfe2ff', 1.2, 90, 0.7, 0.8, 1.0); wl.position.set(0, 20, -14); wl.target.position.set(0, 0, 24); wl.layers.enableAll(); scene.add(wl); scene.add(wl.target); s.winL = wl; }
  for (const k of ['BDchair', 'BDa', 'BDb', 'BDc']) toonPerson(s, k);
  haze(scene, '#b8c8f0', 0.0016);
  c3Env(scene, { top: '#e8f0ff', mid: '#8a6a5a', bot: '#3a2018' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.55, scale: 0.5, inkSet: false, focusK: 0.6, bounce: ['#b8ccff', '#a85a3a', 0.1], lights: [[-28, 7, 21, '#ffd8a0', 0.9, 20], [29, 13, 16, '#ffd8a0', 0.7, 18], [0, 10, 34, '#ffe8c8', 0.5, 30]],
    shafts: [[[-14, 20, -2], [-6, 0, 22], 3.5, 8, '#e8f0ff', 0.06], [[12, 20, -2], [18, 0, 22], 3.5, 8, '#e8f0ff', 0.06]] });
  bdOccluders(s);
  return s;
}
// depth-only FOCUS stand-ins (after c3SetLook): the table top + apron + modesty panel + pedestals, the pendants
function bdOccluders(s) { const M = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); M.userData.c3keep = true; const [cx, cz] = BD_TC;
  const box = (w, h, d, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M); m.position.set(x, y, z); m.rotation.y = ry; Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); s.scene.add(m); return m; };
  box(BD_TW - 0.1, 0.42, BD_TD - 0.1, cx, BD_TY - 0.25, cz); box(BD_TW - 2.4, 0.8, BD_TD - 2.0, cx, BD_TY - 0.85, cz); box(BD_TW - 4, 3.6, 0.3, cx, 2.4, cz);
  for (const sx of [-1, 1]) box(3.4, 3.9, 5.0, cx + sx * 9.5, 2.1, cz);
  for (const p of s.pend) { const o = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.5, 20), M); Object.assign(o.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); o.renderOrder = -5; c3Layer(o, C3.L_FOCUS); p.add(o); } }
const BD_get = () => BD.s ||= bdBuild();
SETS.board = BD_get;

// ---- the continuous camera (absolute seconds). REV4: no in/out ping-pong: distance + roll monotone through each push;
//      after the FILED snap one slow push-in (no bounce back).
// s12: whip in (pan right, decelerating) -> land on the diagonal of the table with the board lined up on "board" -> orbit
//      right + approach (city slides behind the mullions) -> push on the slap (34.26) -> track right on to the jolted members ->
//      low push into BDb -> pull back + crane up + track right to BDb + BDc -> whip out right.
// s19/s20: whip in -> land low on the empty room -> track right + crane up over the table (chairs slide past the city) ->
//      crane down + track left with the sliding page -> push onto the page on "notice" -> orbit drift on the page ->
//      snap push + shake on FILED (57.80) -> pull back + crane up -> whip out right.
CAMSEQ.board = [
  [33.46, [-24, 12, 36], [-16.65, 7.8, 6.59], 48, -4],   // whip in (pan right, decelerating)
  [33.64, [-22.5, 11.6, 35], [-2.63, 7.92, 15.62], 48, -2],   // "board": the diagonal of the table, the board lined up
  [34.06, [-10, 10.4, 33], [-0.6, 8.2, 15.2], 46, 1],   // orbit right + approach (city slides behind the mullions)
  [34.32, [-3, 9.6, 31], [0.08, 7.96, 15.18], 44, 3],   // push on the slap (34.26)
  [34.70, [5, 9.2, 30], [4.04, 8.05, 15.07], 43, 3.5],   // track right on to the jolted members (still pushing in, roll keeps easing)
  [35.00, [8, 8.4, 27.6], [6.4, 8.1, 13.4], 41, 4],   // low push into BDb
  [35.32, [11.6, 10.8, 30.6], [9.2, 8, 13.6], 45, 2.5],   // pull back + crane up + track right to BDb + BDc
  [35.60, [14.2, 13.6, 33], [10, 7.8, 13.6], 47, 1.5],
  [35.67, [14.4, 13.7, 33.1], [10.38, 7.61, 13.09], 47, 1.2],   // whip out right
  [35.82, [14.6, 13.7, 33.1], [26.81, 7.59, 15.85], 47, 1],
];
CAMSEQ.boardB = [   // s19 + s20 (its own path: the ends keep their whip speed instead of easing toward the far-away s12 keys)
  [55.58, [-14, 10.5, 39], [-26, 6.5, 16], 44, -3],   // whip in
  [55.76, [-12.5, 10, 38.5], [-1, 6, 19], 44, -1],   // land low on the empty room
  [56.22, [-1, 12, 34], [2.8, 5.4, 21], 42, 3],   // track right + crane up over the table
  [56.56, [1.2, 10.4, 31.4], [0.4, 5.2, 22.2], 40, 1],   // crane down + track left with the sliding page ...
  [56.90, [-1.6, 11, 30.6], [-3.2, 5.8, 22.4], 40, -0.5],
  [57.12, [-5, 11.4, 30.6], [-5.8, 6.3, 22.5], 39, -1.5],   // ... still pushing in, roll easing one way
  [57.30, [-7.6, 10.6, 31.6], [-7.6, 6.29, 23.25], 38.5, -2],   // "notice": on the page
  [57.46, [-6, 11.4, 35.4], [-8.3, 7, 23.2], 42, -1.5],   // pull back + crane up: the chair + the stamp
  [57.66, [-3.8, 12.6, 40.6], [-9.9, 8.8, 23.8], 46, -1],
  [57.78, [-4.1, 12.4, 40], [-9.8, 8.6, 23.7], 45.5, 1.5],
  [57.86, [-4.6, 12, 39.2], [-9.9, 8.3, 23.6], 44.5, 3],   // snap push + shake on FILED (57.80)
  [58.06, [-4.7, 11.93, 38.92], [-9.9, 8.3, 23.6], 44.3, 2.6],   // HOLD 57.86-58.31: one slow push-in after the snap (no bounce back)
  [58.31, [-4.79, 11.87, 38.65], [-9.9, 8.3, 23.6], 44, 2.2],
  [58.46, [-5.2, 12.3, 39.9], [4, 8.6, 25], 45, 2],   // whip out right
];

// ---- the take
// the gripping hand OVER a held prop: a disc in the card's limb colour (the kit's gripDot pasted a square of suit pixels
// over the folder); size = the kit's grip dot (t3Hand 6.6 u) with its wide-shot boost
function bdDot(s, who, nm) { const p = s.p[who], h = c3ToonHandWorld(p, nm); s.bdd ||= {}; const key = who + nm;
  let m = s.bdd[key]; if (!m) { m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: T3.limb, depthTest: false, depthWrite: false, toneMapped: false })); m.renderOrder = 30; Object.assign(m.userData, { noInk2: true, noCast: true, noShade: true }); c3Layer(m, C3.L_FOCUS); s.scene.add(m); s.bdd[key] = m; }
  if (!h || !p.g.visible) { m.visible = false; return; }
  const a = V3(0, 0, 0), b = V3(0, 1000 * p.U, 0); p.root.localToWorld(a); p.root.localToWorld(b); a.project(s.cam); b.project(s.cam); const px = Math.round(Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2) / 50) * 50;
  const lk = Math.max(1, Math.min(1.8, 1 + (1000 - px) / 1000 * 0.8)), r = 6.6 * (2 * T3.a * (p.o.headK ?? 1) / 100) * lk ** 0.8 * p.U;
  m.visible = true; m.scale.setScalar(r); m.position.copy(h).addScaledVector(s.cam.position.clone().sub(h).normalize(), 0.05); m.quaternion.copy(s.cam.quaternion); m.material.color.set(T3.limb).multiply(p.mat.color); }
const bdHideDots = (s) => { if (s.bdd) for (const k in s.bdd) s.bdd[k].visible = false; };
// the two hands -> the held folder frame (mid point, camera-right, span)
function bdHands(s, who) { const L = c3ToonHandWorld(s.p[who], 'L'), R = c3ToonHandWorld(s.p[who], 'R'); if (!L || !R) return null; const rt = R.clone().sub(L); rt.y = 0; const w = rt.length(); rt.normalize(); return { mid: L.clone().add(R).multiplyScalar(0.5), rt, w }; }
const BD_GRIP = (x, y) => ({ h: [x, y], pole: [1, 0.4], front: true, hand: 'grip' });
// the chair's arms: holds the folder up at her chest on "board", lifts it over her head (anticipation), slams it on "investigation", presses, lets go
const BD_CH_HANDS = [[0, BD_GRIP(0.26, 0.42)], [33.78, BD_GRIP(0.26, 0.32)], [33.96, BD_GRIP(0.2, -0.95)], [34.14, BD_GRIP(0.14, 0.86)], [34.22, BD_GRIP(0.14, 0.86)], [34.82, 'hip']];
function bdChairPose(s, t) { const [x, z] = BD_POS.BDchair, slam = EZ.o3(bdE(34.2, BD_SLAP, t));
  const lean = bdK([[0, 0], [34.0, -0.08], [34.2, 0.14], [BD_SLAP + 0.1, 0.1], [34.82, 0.02]], t, 0.08);
  pose(s, 'BDchair', t, x, z, { look: t < 34.82 ? [x, z + 10] : [s.cam.position.x, s.cam.position.z], expr: [[0, 'determined'], [34.0, 'angry'], [BD_SLAP, 'strain'], [34.5, 'determined'], [35.1, 'skeptical']],
    hand: { L: BD_CH_HANDS, R: BD_CH_HANDS }, gaze: t < 34.82 ? [0, 0.4] : [0.2, 0], lean, squash: bdHop(t, BD_SLAP, 0.22, 0.25) - 0.15 * slam * (t < BD_SLAP ? 1 : 0), alive: t > 35 ? 1 : 0 });
}
function bdFolderAt(s, H, t) { const f = s.props.folder, cam = s.cam; if (!H) return; const fwd = cam.position.clone().sub(H.mid).setY(0).normalize(), yaw = Math.atan2(fwd.x, fwd.z);
  const flat = EZ.io(bdE(34.14, BD_SLAP, t)), [fw, fh, fd] = f.userData.dim, off = lerp(fh / 2 + 0.25, fd / 2 + 0.2, flat);
  f.visible = true; f.rotation.order = 'YXZ'; f.rotation.set(Math.PI / 2 * (1 - flat), yaw, 0); f.position.copy(H.mid).addScaledVector(fwd, off); f.position.y = Math.max(f.position.y, BD_TY + fh / 2 + 0.01); }
function bdFrame(t) {
  const s = BD_get(), P = s.props; hideAll(s); hideGrips(s); bdHideDots(s); const late = t > BD_LATE, cam = seqCam(s, late ? 'boardB' : 'board', t);
  // ---- light + world state: the meeting (s12) or the empty room later the same day (s19/s20)
  s.skyDay.visible = s.slDay.visible = !late; s.skyLate.visible = s.slLate.visible = late;
  s.key.color.set(late ? '#ffcf98' : '#ffe6c4'); s.key.intensity = late ? 1.25 : 0.85; s.hemi.intensity = late ? 0.7 : 0.45; s.winL.color.set(late ? '#ffd8b0' : '#cfe2ff');
  redraw(s.screen, late ? 'off' : 'on', bdTexScreen(!late)); COLOR.board.exp = late ? 1.14 : 0.93;   // the late room reads darker under the low sun: exposure per half (own COLOR entry, set every frame)
  for (const k in s.chairs) { const c = s.chairs[k], [x, z, ry] = c.userData.base; c.position.set(x, 0, z); c.rotation.y = ry; }
  if (late) { const L = { fa: [-6.8, 9.6, -0.4], fc: [1.4, 9.0, 0.5], fb: [7.0, 9.8, 0.3], eR: [20.0, 18.6, -Math.PI / 2 + 0.4] }; for (const k in L) { const [x, z, ry] = L[k]; s.chairs[k].position.set(x, 0, z); s.chairs[k].rotation.y = ry; } }
  // ---- s12: the board
  P.page.visible = false;
  if (!late) {
    bdChairPose(s, BD_SLAP + 0.12); const Hs = bdHands(s, 'BDchair');   // where the folder lands (posed at the impact)
    bdChairPose(s, t); const H = bdHands(s, 'BDchair');
    if (t < BD_SLAP) { bdFolderAt(s, H, t); bdDot(s, 'BDchair', 'L'); bdDot(s, 'BDchair', 'R'); }
    else { bdFolderAt(s, Hs, BD_SLAP); const k = bdHop(t, BD_SLAP, 0.12, 1); P.folder.scale.set(1 + 0.08 * k, 1 - 0.18 * k, 1 + 0.08 * k); if (t < 34.82) { bdDot(s, 'BDchair', 'L'); bdDot(s, 'BDchair', 'R'); } }
    if (t < BD_SLAP) P.folder.scale.set(1, 1, 1);
    // the seated members: watch her, jolt on the slap, react
    const jolt = (t0, k) => t > t0 && t < t0 + 0.5 ? k * Math.sin(Math.PI * bdE(t0, t0 + 0.5, t)) * Math.exp(-(t - t0) * 3) : 0, ch = BD_POS.BDchair;
    { const [x, z] = BD_POS.BDa; pose(s, 'BDa', t, x, z, { sit: 1, seat: 3.0, look: t < 34.9 ? ch : [BD_POS.BDb[0], BD_POS.BDb[1]], expr: [[0, 'worried'], [33.8, 'nervous'], [BD_SLAP, 'shock'], [34.7, 'nervous']], fx: t > 34.6 ? 'sweat' : undefined,
      hand: { L: [[0, 'desk'], [BD_SLAP + 0.02, 'up'], [34.8, 'desk']], R: [[0, 'chin'], [BD_SLAP + 0.02, 'up'], [34.8, 'desk']] }, gaze: [0.5, 0.1], squash: jolt(BD_SLAP, 0.3), lean: -jolt(BD_SLAP, 0.14) }); }
    { const [x, z] = BD_POS.BDb; pose(s, 'BDb', t, x, z, { sit: 1, seat: 3.0, look: t < 35.0 ? ch : [s.cam.position.x, s.cam.position.z], expr: [[0, 'skeptical'], [33.9, 'surprised'], [BD_SLAP, 'shock'], [34.62, 'worried'], [35.2, 'deadpan']],
      hand: { L: [[0, 'desk'], [BD_SLAP + 0.02, 'shrug'], [34.9, 'cross']], R: [[0, 'desk'], [BD_SLAP + 0.02, 'shrug'], [34.9, 'cross2']] }, gaze: [-0.5, 0.1], squash: jolt(BD_SLAP + 0.02, 0.35), lean: jolt(BD_SLAP + 0.02, 0.12) }); }
    { const [x, z] = BD_POS.BDc; pose(s, 'BDc', t, x, z, { sit: 1, seat: 3.0, look: t < 35.1 ? ch : [BD_POS.BDb[0], BD_POS.BDb[1]], expr: [[0, 'neutral'], [33.7, 'worried'], [BD_SLAP, 'surprised'], [34.7, 'talkO'], [35.3, 'nervous']], talk: t > 34.7 && t < 35.2 ? 0.6 : 0,
      hand: { L: [[0, 'desk'], [BD_SLAP + 0.03, { h: [0.04, -0.12], pole: [0.5, 1], front: true, over: true }], [35.3, 'desk']], R: [[0, 'desk'], [BD_SLAP + 0.03, { h: [0.04, -0.1], pole: [0.5, 1], front: true, over: true }], [35.3, 'desk']] }, gaze: [-0.6, 0.1], squash: jolt(BD_SLAP + 0.03, 0.3), lean: -jolt(BD_SLAP + 0.03, 0.1) }); }
  } else {
    // the folder stays where it landed; a closed laptop; the filing slides into the tray, the hand stamps it
    { const f = P.folder; f.visible = true; f.rotation.order = 'YXZ'; f.rotation.set(0, 0.12, 0); f.scale.set(1, 1, 1); f.position.set(BD_FOLD[0] - 0.4, BD_TY + f.userData.dim[1] / 2 + 0.01, BD_FOLD[1]); }
    bdPage(s, t); bdStampAct(s, t);
  }
  // ---- slap reactions (s12) / at rest (late): glasses jump, papers lift, pens bounce, carafes wobble, laptop hops
  const k1 = (d) => late ? 0 : bdHop(t, BD_SLAP + d, 0.3, 1);
  P.glasses.forEach((g, i) => { const [x, z] = g.userData.base, h = k1(0.01 * (i % 3)); g.position.set(x + (late ? 0.3 * Math.sin(i) : 0), BD_TY + 0.5 * h * (1 - Math.abs(x) / 22), z); g.rotation.set(0.25 * h * Math.sin(i * 2.3), 0, 0.25 * h * Math.cos(i * 1.7)); g.userData.water.scale.y = 1 + 0.25 * h; g.visible = !(late && i === 6); });
  P.carafes.forEach((c, i) => { const [x, z] = c.userData.base, h = k1(0.02); c.position.set(x, BD_TY + 0.25 * h, z); c.rotation.set(0.12 * h, 0, -0.12 * h * (i ? 1 : -1)); });
  P.sheets.forEach((g, i) => { const [x, z, r] = g.userData.base, u = late ? 0 : bdE(BD_SLAP, BD_SLAP + 0.6, t), h = late ? 0 : 1.3 * Math.sin(Math.PI * u) * (1 - 0.5 * u) * (0.7 + 0.3 * (i % 2)), dx = (x >= 0 ? 1 : -1) * 0.8 * EZ.o3(u);
    g.position.set(x + dx + (late ? 0.4 * (i % 2 ? 1 : -1) : 0), BD_TY + 0.02 + i * 0.006 + h, z + (late ? 0.3 : 0)); g.rotation.set(0.5 * h * Math.sin(i + t * 9), r + 0.4 * EZ.o3(u) * (i % 2 ? 1 : -1), 0.4 * h * Math.cos(i * 2 + t * 7)); });
  P.pens.forEach((g, i) => { const [x, z, r] = g.userData.base, h = k1(0.0); g.position.set(x, BD_TY + 0.08 + 0.7 * h, z); g.rotation.set(0, r + 1.5 * h, 0.8 * h); });
  { const h = k1(0.02); P.laptop.position.y = BD_TY + 0.18 * h; P.laptop.children[2].rotation.x = late ? -1.5 : -0.32 - 0.1 * h; }
  { const h = late ? 0 : bdHop(t, BD_SLAP, 0.22, 1); P.cup.position.y = BD_TY + 0.15 * h; }
  if (!late) { P.stamp.visible = true; P.stamp.scale.set(1, 1, 1); P.stamp.rotation.set(0, -0.3, 0); P.stamp.position.set(BD_PAD[0], BD_TY + 0.28, BD_PAD[1]); } else if (t < BD_IN) P.stamp.visible = false;   // late: the chair has taken the stamp; she comes back with it
  for (const p of s.pend) { p.rotation.z = late ? 0 : 0.02 * bdHop(t, BD_SLAP, 0.6, 1); }
  c3Render(s.scene, cam, { bg: '#2a3a6a', bgBlur: late ? 1.8 : 1.4, glow: 0.35, glowBlur: 12 });
}
// the filing (FIX3): slides in from the right ON the table beside the open side of the tray (never under its lip), lifts off
// in an arc OVER the tray wall and settles flat in the inclined bed on "notice" (57.30); the camera follows the page, so the
// tray only enters the frame with the page arriving
function bdPage(s, t) { const P = s.props, pg = P.page, t0 = 56.4, t1 = 56.9, tr = P.tray; if (t < t0) return; pg.visible = true; tr.updateMatrixWorld(true);
  const bedC = tr.localToWorld(tr.userData.bedPt(0.5, 0.53, 0.04)), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(BD_TILT, 0, 0)).premultiply(tr.quaternion);
  const start = V3(2.8, BD_TY + 0.03, 22.4), lip = V3(-3.0, BD_TY + 0.03, 22.5);
  if (t < t1) { const u = EZ.o2(bdE(t0, t1, t)); pg.position.copy(start).lerp(lip, u); pg.position.y += 0.05 * Math.sin(u * 14) * (1 - u); pg.quaternion.setFromEuler(new THREE.Euler(0, -0.5 * (1 - u) + 0.06 * Math.sin(u * 9), 0.04 * Math.sin(u * 17) * (1 - u))); }
  else { const u = bdE(t1, BD_FILE, t), e = EZ.io(u), arc = Math.sin(Math.PI * u) * 1.6; pg.position.copy(lip).lerp(bedC, e); pg.position.y += arc;
    const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.18 * Math.sin(Math.PI * u))); pg.quaternion.copy(q0).slerp(q, EZ.io(Math.min(1, u * 1.25)));
    if (t > BD_FILE) { const d = t - BD_FILE; pg.position.addScaledVector(V3(0, Math.cos(BD_TILT), -Math.sin(BD_TILT)), 0.06 * Math.sin(d * 30) * Math.exp(-d * 12)); } }
  const k = t < BD_STAMP ? 0 : EZ.back(bdE(BD_STAMP, BD_STAMP + 0.08, t)); P.imprint.visible = k > 0; P.imprint.scale.setScalar(Math.max(0.01, k)); P.imprint.material.opacity = 0.92; }
// the stamp (FIX3): the chair comes back into frame (hop in from the left, stamp at her chest), raises it high over the
// page (anticipation + tremble), SLAMS it on 57.80 (squash, she strains), presses, lifts it off to reveal FILED, smug.
// The stamp moves in true 3D on the page; her card's hand is solved every frame onto the knob as seen from the camera
// (the arm target is linear in the kit's h offsets: three probe poses give the 2x3 map, least squares gives h).
const BD_CHX = [-14.0, -10.5], BD_SK = 1.3, BD_CHZ = 25.8, BD_KN = V3(0, 1.85, 0);
function bdChLate(s, t, hR) { const x = lerp(BD_CHX[0], BD_CHX[1], EZ.o3(bdE(BD_IN, BD_IN + 0.16, t)));
  return pose(s, 'BDchair', t, x, BD_CHZ, { y: bdHop(t, BD_IN, 0.18, 0.5), look: [-7.3, 22.6], expr: [[0, 'determined'], [57.6, 'angry'], [BD_STAMP, 'strain'], [57.98, 'smug']],
    hand: { L: 'hip', R: { h: hR, pole: [1, 0.5], front: true, hand: 'grip' } }, gaze: [0.6, 0.35], squash: bdHop(t, BD_STAMP, 0.2, 0.2) + bdHop(t, BD_IN + 0.14, 0.14, 0.15),
    lean: bdK([[0, 0.05], [57.56, 0], [57.6, -0.09], [57.76, 0.12], [57.98, 0.05], [58.2, 0]], t, 0.08) }); }
function bdStampAct(s, t) { const P = s.props, st = P.stamp, pg = P.page; if (t < BD_IN) return; pg.updateMatrixWorld(true);
  const p = s.p.BDchair, handAt = (h) => { bdChLate(s, t, h); return c3ToonHandWorld(p, 'R'); };
  const qPage = pg.getWorldQuaternion(new THREE.Quaternion()), nrm = V3(0, 1, 0).applyQuaternion(qPage), T = pg.localToWorld(V3(0.35, 0.02, 0.62));
  const qUp = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.3, 0)), H0 = [0.34, 0.16];
  // the knob path: at her chest (follows her hand) -> high over the page -> slam -> press -> lift off -> held up, proud
  let K, qk = qUp, sq = 1;
  if (t < 57.56) K = handAt(H0);
  else { const save = t; const A0 = (() => { const pz = s.p.BDchair; bdChLate(s, 57.56, H0); return c3ToonHandWorld(pz, 'R'); })();
    const up = (hh, dx = 0, dy = 0) => T.clone().addScaledVector(nrm, hh).add(V3(dx, dy, 0)), trem = t > 57.66 && t < 57.76 ? 0.05 * Math.sin(t * 90) : 0;
    const KS = [[57.56, A0], [57.68, up(5.4, -1.3, 0.8)], [57.75, up(5.7, -1.4, 0.9)], [BD_STAMP, up(1.85)], [57.98, up(1.85)], [58.16, up(4.6, -0.7, 0.6)], [58.46, up(5.2, -0.9, 0.9)]];
    let i = 0; while (i + 1 < KS.length && KS[i + 1][0] <= save) i++; const [ta, pa] = KS[i], [tb, pb] = KS[Math.min(i + 1, KS.length - 1)], u = tb > ta ? clamp((save - ta) / (tb - ta)) : 1;
    const ease = i === 2 ? EZ.i3(u) : i === 0 || i === 4 ? EZ.o3(u) : EZ.io(u); K = pa.clone().lerp(pb, ease); K.x += trem;
    qk = qUp.clone().slerp(qPage, EZ.io(bdE(57.56, 57.68, t))); if (t > 58.16) qk = qPage.clone().slerp(qUp, 0.5 * EZ.io(bdE(58.16, 58.46, t)));
    if (t >= BD_STAMP && t < 57.98) sq = 1 - 0.14 * bdHop(t, BD_STAMP, 0.16, 1); }
  st.visible = true; st.quaternion.copy(qk); st.scale.set(BD_SK, BD_SK * sq, BD_SK); st.position.copy(K).sub(BD_KN.clone().multiply(st.scale).applyQuaternion(qk));
  // her hand onto the knob as the camera sees it: the ray camera->knob meets her card plane
  const root = p.g.getWorldPosition(V3(0, 0, 0)), nC = s.cam.position.clone().sub(root).setY(0).normalize(), ray = K.clone().sub(s.cam.position);
  const D = s.cam.position.clone().addScaledVector(ray, root.clone().sub(s.cam.position).dot(nC) / ray.dot(nC));
  const Ha = handAt([0.2, 0.3]), Hb = handAt([0.6, 0.3]), Hc = handAt([0.2, 0.7]), ex = Hb.clone().sub(Ha).divideScalar(0.4), ey = Hc.clone().sub(Ha).divideScalar(0.4), r = D.clone().sub(Ha);
  const a11 = ex.dot(ex), a12 = ex.dot(ey), a22 = ey.dot(ey), b1 = ex.dot(r), b2 = ey.dot(r), det = a11 * a22 - a12 * a12;
  let hx = 0.2 + (b1 * a22 - b2 * a12) / det, hy = 0.3 + (a11 * b2 - a12 * b1) / det; const L = Math.hypot(hx, hy); if (L > 1.04) { hx *= 1.04 / L; hy *= 1.04 / L; }
  bdChLate(s, t, [hx, hy]); bdDot(s, 'BDchair', 'R'); }
for (const id of ['s12', 's19', 's20']) { SHOT_FN[id] = (t) => bdFrame(t); SNAPS[id] = 'free'; }
