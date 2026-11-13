// =====================================================================
//  SET news — the newspaper print hall + newsroom (x -36..36, z 0..48, h 28). Teal walls, a dark-teal dado, a mustard rail;
//  warm concrete floor with yellow safety lines. Prefix NW / nw. Registers s05 s06 s07 s08 s09 (11.12-27.28) as ONE take.
//   Left: the big RED web press — paper reel (x -33), three printing units (x -27.4 / -21.8 / -16.2, CMY ink rollers,
//   gears, a catwalk on top) and the tall folder TOWER (x -12..-4) whose front face carries the running paper web (the
//   second edition rises up it in s08). The first edition slides out of the tower's side slot onto the COPY DESK
//   (x -0.5..6.6, z 13..20) under a red drop-stamp machine the editor yanks on "relation" (s06).
//   Back wall: the cork HEADLINE WALL (x 7..34): the MEGASPEED print + light-box sign, the world map with the Singapore
//   pin, generic pinned headlines; CHIPS crates on the floor below (cash rains on them on "billions"); two reporter desks
//   (typewriter, laptop, lamps, coffee). Above the press: the wall TV (x -30..-22) and the CHARGES FILED board
//   (x -20..-14.6). The wire-ticker LED strip runs the whole back wall. Huang is NOT here.
//   rev4: Alice Huang (user's request) stands calmly at the MEGASPEED wall with a name card easel; the spy claim is a framed
//   ILLUSTRATION case in front of the press (agents peek from a ministry door, the memo folder gets ALLEGED); the TV shows a
//   foreign-ministry spokesperson talking on "China calls that a smear".
// =====================================================================
const NW = {};
const NW_X = 36, NW_Z = 48, NW_H = 28;
const NW_PAPER = [3.4, 4.62, 16.4], NW_PW = 5.4, NW_PD = 6.6;          // the first edition on the copy desk (centre, size)
const NW_STAMP = [3.4, 17.06], NW_COL = [3.4, 12.5];                    // stamp target on the paper, stamp column
const NW_WEB = [-8, 19.36], NW_PAGE_Y = 12.5, NW_PGW = 6.4, NW_PGH = 8.3;   // the second edition on the tower web
const NW_PIN = [22.82, 14.77], NW_CRATE = [11.5, 6.0];
let NW_CATX = -30.0;   // rev4: further still, out of the vignette's frame (was -27.0)
// fix3: the catwalk pressman has walked further along the catwalk by the whip to the TV (off screen 13-24.7 s) so the whip passes clear of him
const NW_T = { slide: 12.55, land: 14.02, up: 14.98, hit: 15.28, mega: 16.44, sing: 17.14, bill: 18.32, ed2: 19.64, stop: 20.8, acc: 20.98, alleg: 22.36, rec: 23.16, door: 23.16, peekA: 23.78, spy: 24.16, tv: 24.98, smear: 25.72, chg: 26.92 };
// rev4 piece-local heads: the editor's short black hair parted on the other side (the press operator wears the kit 'short');
// a fedora drawn on the hair layer (agent B); sunglasses drawn over the eyes (o.nwShades, both agents)
T3_HSTYLE.NWshort = (() => { const S = T3_HSTYLE.short, n = S.line.length; return Object.assign({}, S, { line: S.line.map(([x, y]) => [-x, y]).reverse(), cusp: n - 1 - S.cusp, part: S.part.map(([x, y]) => [-x, y]), whorl: [-S.whorl[0], S.whorl[1]] }); })();
T3_HSTYLE.NWfedora = Object.assign({}, T3_HSTYLE.short, { nwHat: 'fedora' });
function nwDrawFedora(h, f, cx, cy, A, Bh) { const back = f.back, dir = f.dir || 1, m = f.m || 0, u = 2 * A / 100, sx = back ? 0 : -dir * 0.1 * Math.max(0, m - 1);
  const P = ([x, y]) => [cx + (x + sx) * A, cy + y * Bh], path = (q) => { h.beginPath(); q.forEach((pt, i) => { const [x, y] = P(pt); i ? h.lineTo(x, y) : h.moveTo(x, y); }); h.closePath(); };
  const arc = (cu, cv, ru, rv, a0, a1, n = 30) => { const q = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; q.push([cu + ru * Math.cos(a), cv + rv * Math.sin(a)]); } return q; };
  const fill = (q, c, y0, y1) => { path(q); const g = h.createLinearGradient(0, cy + y0 * Bh, 0, cy + y1 * Bh); g.addColorStop(0, t3Mix(c, '#ffffff', 0.2)); g.addColorStop(1, t3Mul(c, 0.7)); h.fillStyle = g; h.fill(); h.lineWidth = 2.4 * u; h.strokeStyle = T3.ink; h.stroke(); };
  h.save(); h.lineJoin = 'round';
  fill(arc(0, -0.86, 1.42, 0.24, 0, 360, 40), '#3a3a46', -1.1, -0.62);   // brim
  const crown = [[-0.8, -0.9], [-0.74, -1.3], [-0.6, -1.54], [-0.3, -1.6], [0, -1.48], [0.3, -1.6], [0.6, -1.54], [0.74, -1.3], [0.8, -0.9]].concat(arc(0, -0.9, 0.8, 0.12, 0, 180, 16));
  fill(crown, '#2e2e38', -1.62, -0.84);
  fill([[-0.79, -0.96], [0.79, -0.96], [0.8, -1.12], [-0.78, -1.12]].concat(arc(0, -0.96, 0.79, 0.1, 0, 180, 12)), '#121218', -1.14, -0.9);   // band
  if (!back) { h.globalAlpha = 0.35; h.lineWidth = 1.6 * u; h.strokeStyle = '#ffffff'; h.beginPath(); h.moveTo(...P([-0.5, -1.45])); h.lineTo(...P([-0.56, -1.18])); h.stroke(); }
  h.restore(); }
{ const base = t3HairLayers;   // wrap the kit's hair layer for the NW hat only (every other style passes straight through)
  t3HairLayers = function (o, f, cx, cy, A, Bh, light, env, hp) { const r = base(o, f, cx, cy, A, Bh, light, env, hp), S = t3Style(o.hair);
    if (r && S && S.nwHat) nwDrawFedora(r.hc.getContext('2d'), f, cx, cy, A, Bh); return r; }; }
{ const base = t3Face;   // sunglasses for o.nwShades (other faces untouched): two dark lenses over the eyes, a bridge, a glint
  t3Face = function (g, cx, cy, A, st, o, f) { base(g, cx, cy, A, st, o, f); if (!o.nwShades) return;
    const u = 2 * A / 100, m = f.m, dir = f.dir, fx = cx + dir * 24 * Math.max(0, Math.min(m, 2) - 1.0) * u, ey = cy + 2.5 * u, sp = 13 * u * (1 - 0.06 * Math.min(m, 1));
    for (const s of [-1, 1]) { const far = s === -dir && m > 0.15; g.save(); g.translate(fx + s * sp, ey); g.scale(far ? 1 - 0.2 * Math.min(m, 1) : 1, 1);
      g.beginPath(); g.roundRect(-10.5 * u, -6 * u, 21 * u, 12.5 * u, [2.5 * u, 2.5 * u, 7 * u, 7 * u]); g.fillStyle = '#17151d'; g.fill(); g.lineWidth = 2.2 * u; g.strokeStyle = T3.feat; g.stroke();
      g.globalAlpha = 0.75; t3Stroke(g, [[-6.5 * u, -2.6 * u], [-2.5 * u, -2.6 * u]], 1.8 * u, '#e8f0ff'); g.restore(); }
    t3Stroke(g, [[fx - sp + 9.5 * u, ey - 3.4 * u], [fx + sp - 9.5 * u, ey - 3.4 * u]], 2.6 * u, '#17151d'); }; }
Object.assign(CAST, {   // invented newsroom people: own hair / colours / outfits (not huang's side-grey-leather or the intern's messy hoodie)
  NWed: { key: 'NWed', hair: 'NWshort', hairColor: 'black', moustache: true, outfit: 'vest', colors: { main: '#2f6ad8', shirt: '#fff2dc', tie: '#e8a83a' }, skin: 'brown', body: 'pear' },   // the copy editor (rev4: short black hair, matches the moustache)
  NWop: { key: 'NWop', hair: 'short', hairColor: 'brown', outfit: 'apron', colors: { main: '#f2ead8', apron: '#e0782a', collar: '#f2ead8' }, skin: 'peach', body: 'fat', moustache: true },   // press operator
  NWcat: { key: 'NWcat', hair: 'spiky', hairColor: 'ginger', outfit: 'hivis', colors: { main: '#4a5a86', vest: '#c8e83a', band: '#e8eef0' }, skin: 'tan', body: 'tall' },   // catwalk pressman
  NWr1: { key: 'NWr1', hair: 'curly', hairColor: 'dark', outfit: 'sweater', colors: { main: '#e2443a', rib: '#b8302a' }, skin: 'pale', body: 'avg' },   // typing reporter
  NWr2: { key: 'NWr2', hair: 'tuft', hairColor: '#5a3ac8', outfit: 'shirt', colors: { main: '#f6c8dc', tie: '#7a3aa8', pocket: true }, skin: 'peach', body: 'thin' },   // reporter on the phone (fix3: tuft in dyed indigo, the only tuft in the piece)
  // rev4: ALICE HUANG (the businesswoman, user's request): stands calmly at the MEGASPEED wall with a coffee, a name card
  // above her; she is never a newsroom worker, never in the spy vignette
  NWalice: { key: 'NWalice', hair: 'ponytail2', hairColor: 'blond', outfit: 'polo', colors: { main: '#8a4ad8', collar: '#6a32b0' }, skin: 'brown', body: 'short' },
  // the vignette's two invented agents (the Times' claim, menacing-comic): a shaved head + shades, a fedora + shades
  NWagA: { key: 'NWagA', hair: 'bald2', hairColor: 'black', nwShades: true, outfit: 'suit', colors: { main: '#24262e', shirt: '#e6e6ec', tie: '#121216' }, skin: 'pale', body: 'tall', scale: 0.5 },
  NWagB: { key: 'NWagB', hair: 'NWfedora', hairColor: 'black', nwShades: true, outfit: 'suit', colors: { main: '#30303a', shirt: '#dcdce4', tie: '#121216' }, skin: 'tan', body: 'fat', scale: 0.5 },
  // the foreign-ministry spokesperson drawn into the wall TV (never a card in the scene): long black hair, glasses, dark suit, red tie
  NWspk: { key: 'NWspk', hair: 'long', hairColor: 'black', glasses: true, outfit: 'suit', colors: { main: '#262a3a', shirt: '#f2eee6', tie: '#c42a2e' }, skin: 'peach', body: 'avg' },
});
const nwE = (a, b, t) => clamp((t - a) / (b - a));
const nb = (w, h, d, m, x, y, z) => rb(w, h, d, m, x, y, z, 0);
const nbN = (w, h, d, m, x, y, z) => rbNC(w, h, d, m, x, y, z, 0);
const ncy = (r0, r1, h, m, x, y, z, seg = 20) => cyl(r0, r1, h, m, x, y, z, 0, seg);
const NW_SERIF = 'Georgia, "Times New Roman", serif';
// eased keys [[t, v], ...]: each change takes d s (ease in-out) from the key on
const nwK = (K, t, d = 0.14) => { let v = K[0][1]; for (let i = 1; i < K.length; i++) { const [k, x] = K[i]; if (t >= k) v = v + (x - v) * EZ.io(clamp((t - k) / d)); } return v; };

// ---- textures
function nwTexWall() { const t = tex((g, w, h) => { const R = RNG('nwwall'), yd = h * (1 - 5.6 / NW_H);
  const gr = g.createLinearGradient(0, 0, 0, yd); gr.addColorStop(0, '#4fa4a6'); gr.addColorStop(1, '#6cbcb8'); g.fillStyle = gr; g.fillRect(0, 0, w, yd);
  for (let x = 0; x < w; x += w / 6) { g.fillStyle = 'rgba(8,50,60,0.2)'; g.fillRect(x, 0, 5, yd); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x + 5, 0, 3, yd); }
  for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(16,50,56,${R.r(0.02, 0.06)})`; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, yd), R.r(14, 70), R.r(14, 90), 0, 0, TAU); g.fill(); }
  g.fillStyle = '#2e7478'; g.fillRect(0, yd, w, h - yd); for (let x = 0; x < w; x += w / 12) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x, yd, 4, h - yd); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x + 4, yd, 3, h - yd); }
  g.fillStyle = '#e8a83a'; g.fillRect(0, yd - 12, w, 16); g.fillStyle = 'rgba(90,50,10,0.5)'; g.fillRect(0, yd + 4, w, 4); }, 1024, 2048);
  t.wrapS = THREE.RepeatWrapping; return t; }
function nwWall(a0, a1, y0, y1, axis, at, mat) { const g = new THREE.PlaneGeometry(a1 - a0, y1 - y0), uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < p.count; i++) uv.setXY(i, ((a0 + a1) / 2 + p.getX(i)) / 12, ((y0 + y1) / 2 + p.getY(i)) / NW_H);
  const m = new THREE.Mesh(g, mat); m.userData.noCast = true;
  if (axis === 'z') m.position.set((a0 + a1) / 2, (y0 + y1) / 2, at); else { m.position.set(at, (y0 + y1) / 2, (a0 + a1) / 2); m.rotation.y = at < 0 ? Math.PI / 2 : -Math.PI / 2; }
  return m; }
function nwTexFloor() { const t = tex((g, w, h) => { const R = RNG('nwfloor'); for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { g.fillStyle = `hsl(${22 + R.r(-3, 3)},${40 + R.r(-4, 4)}%,${41 + R.r(-3, 3)}%)`; g.fillRect(i * w / 2, j * h / 2, w / 2, h / 2); }
  for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${R.f() < 0.5 ? '50,24,10' : '255,226,190'},${R.r(0.03, 0.08)})`; g.fillRect(R.r(0, w), R.r(0, h), R.r(2, 9), R.r(2, 9)); }
  g.fillStyle = 'rgba(50,24,10,0.45)'; g.fillRect(0, 0, w, 4); g.fillRect(0, 0, 4, h); g.fillRect(0, h / 2, w, 3); g.fillRect(w / 2, 0, 3, h); }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(NW_X * 2 / 9, NW_Z / 9); return t; }
// a newspaper front page (cream with a gradient, never 255): masthead, date line, headline lines [[text, size k], ...], chip, columns, photo box
function nwPage(g, w, h, o = {}) { const R = RNG('nwpg', o.seed ?? 1), ink = '#221c1a', m = w * 0.05, mh = h * (o.mast ?? 0.075);
  const bg = g.createLinearGradient(0, 0, w * 0.4, h); bg.addColorStop(0, '#f2e6c8'); bg.addColorStop(1, '#e0d0aa'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  inked(g, o.title ?? 'THE NEW YORK TIMES', w / 2, m + mh * 0.5, mh * 0.8, ink, { stroke: false, font: NW_SERIF, weight: 700, maxW: w - 2 * m });
  g.fillStyle = ink; g.fillRect(m, m + mh * 1.06, w - 2 * m, Math.max(2, h * 0.003)); g.fillRect(m, m + mh * 1.44, w - 2 * m, Math.max(2, h * 0.003));
  inked(g, o.date ?? 'LATE EDITION', w / 2, m + mh * 1.25, mh * 0.22, ink, { stroke: false, font: NW_SERIF, weight: 700, maxW: w - 2 * m });
  let y = m + mh * 1.62;
  for (const [txt, k] of o.head || []) { const sz = h * k; y += sz * 0.6; inked(g, txt, w / 2, y, sz, ink, { stroke: false, font: NW_SERIF, weight: 900, maxW: w - 2 * m }); y += sz * 0.6; }
  if (o.chip) { const cw = w * 0.36, ch = h * 0.045, cx = w / 2 - cw / 2, cy = y + h * 0.012; g.fillStyle = '#c42a2e'; g.beginPath(); g.roundRect(cx, cy, cw, ch, ch * 0.3); g.fill();
    inked(g, o.chip, w / 2, cy + ch * 0.54, ch * 0.62, '#f6ecd8', { stroke: false, font: 'Arial, sans-serif', weight: 900, maxW: cw * 0.86 }); y = cy + ch; }
  y += h * 0.02; g.fillStyle = ink; g.fillRect(m, y, w - 2 * m, Math.max(2, h * 0.002)); y += h * 0.016;
  const nc = 4, gap = w * 0.022, cw = (w - 2 * m - (nc - 1) * gap) / nc;
  for (let c = 0; c < nc; c++) { const x0 = m + c * (cw + gap); let yy = y;
    if (o.photo && c === 1) { const ph = h * 0.2, pw = cw * 2 + gap, sk = g.createLinearGradient(0, yy, 0, yy + ph); sk.addColorStop(0, '#8a9aa8'); sk.addColorStop(1, '#c8c0a8'); g.fillStyle = sk; g.fillRect(x0, yy, pw, ph);
      g.fillStyle = '#5a6470'; for (let i = 0; i < 7; i++) { const bw = pw * R.r(0.08, 0.16), bh = ph * R.r(0.3, 0.8); g.fillRect(x0 + pw * i / 7, yy + ph - bh, bw, bh); }
      g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(x0, yy, pw, ph); }
    if (o.photo && (c === 1 || c === 2)) yy += h * 0.215;
    while (yy < h - m) { g.fillStyle = 'rgba(46,38,32,0.4)'; g.fillRect(x0, yy, cw * (R.f() < 0.14 ? R.r(0.35, 0.8) : 1), Math.max(2, h * 0.0055)); yy += h * 0.0125; } } }
// the NO RELATION stamp mark + ink splats, drawn into the first edition (canvas coords: x = world x, y = world z)
function nwStampMark(g, w, h, splats) { const cx = (NW_STAMP[0] - (NW_PAPER[0] - NW_PW / 2)) / NW_PW * w, cy = (NW_STAMP[1] - (NW_PAPER[2] - NW_PD / 2)) / NW_PD * h, sw = 3.2 / NW_PW * w, sh = 1.25 / NW_PD * h, R = RNG('nwmark');
  g.save(); g.translate(cx, cy); g.rotate(-NW.rotHead); g.globalAlpha = 0.92; g.strokeStyle = '#cc1e28'; g.lineWidth = sh * 0.09; g.beginPath(); g.roundRect(-sw * 0.47, -sh * 0.42, sw * 0.94, sh * 0.84, sh * 0.12); g.stroke();
  inked(g, 'NO RELATION', 0, sh * 0.03, sh * 0.5, '#cc1e28', { stroke: false, font: 'Impact, "Arial Black", sans-serif', weight: 900, maxW: sw * 0.84 });
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(0,0,0,${R.r(0.2, 0.7)})`; g.fillRect(R.r(-sw / 2, sw / 2), R.r(-sh / 2, sh / 2), R.r(1, 4), R.r(1, 4)); }   // worn rubber
  g.restore(); g.save(); g.fillStyle = '#c41c26'; g.globalAlpha = 0.9;
  for (const sp of splats) { const x = (sp.x - (NW_PAPER[0] - NW_PW / 2)) / NW_PW * w, y = (sp.z - (NW_PAPER[2] - NW_PD / 2)) / NW_PD * h; g.beginPath(); g.ellipse(x, y, sp.r * w / NW_PW, sp.r * 0.8 * w / NW_PW, sp.a, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(x - Math.cos(sp.a) * sp.r * w / NW_PW * 1.6, y - Math.sin(sp.a) * sp.r * w / NW_PW * 1.6, sp.r * 0.4 * w / NW_PW, sp.r * 0.3 * w / NW_PW, 0, 0, TAU); g.fill(); }
  g.restore(); }
function nwTexWebGeneric() { const t = tex((g, w, h) => { nwPage(g, w, h / 2, { seed: 3, head: [['MARKETS', 0.05], ['WATCH THE AI TRADE', 0.035]], photo: true, date: 'BUSINESS DAY' }); g.save(); g.translate(0, h / 2); nwPage(g, w, h / 2, { seed: 4, head: [['CITY & REGION', 0.05]], photo: true, date: 'METRO' }); g.restore();
  g.fillStyle = 'rgba(80,60,40,0.35)'; g.fillRect(0, h / 2 - 3, w, 6); }, 512, 1328);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function nwTexStrip() { const t = tex((g, w, h) => { g.fillStyle = '#ecdfc0'; g.fillRect(0, 0, w, h); const R = RNG('nwstrip'); for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(50,40,34,0.32)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(20, 90), R.r(3, 7)); }
  for (let x = 0; x < w; x += w / 4) { g.fillStyle = 'rgba(60,44,30,0.4)'; g.fillRect(x, 0, 3, h); } }, 512, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 1); return t; }
function nwTexRoller(c, band) { const t = tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, 0); for (const [k, a] of [[0, 0.16], [0.5, 0], [1, 0.16]]) gr.addColorStop(k, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) { g.fillStyle = band; g.fillRect(i * w / 4 + 6, 0, 8, h); } g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6); }, 256, 64); return t; }
function nwTexCork() { const t = tex((g, w, h) => { const R = RNG('nwcork'); g.fillStyle = '#c88a50'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(120,60,20,0.35)' : 'rgba(240,190,120,0.35)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(1, 4), R.r(1, 4)); } }, 512, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 2); return t; }
function nwTexSheet(l1, l2, seed) { return tex((g, w, h) => { nwPage(g, w, h, { seed, title: 'THE NEW YORK TIMES', mast: 0.07, head: [[l1, 0.075], [l2, 0.075]], photo: seed % 2 === 0, date: '' }); }, 256, 320); }
// the world map (equirectangular lon -170..190, lat 78..-58); Singapore lands at NW_PIN
const NW_LAND = [
  [[-168, 66], [-140, 70], [-95, 72], [-80, 63], [-62, 58], [-55, 50], [-66, 45], [-76, 35], [-81, 25], [-97, 26], [-97, 18], [-87, 15], [-80, 8], [-84, 10], [-92, 15], [-105, 20], [-112, 30], [-118, 34], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 60]],
  [[-50, 78], [-25, 78], [-20, 70], [-42, 60], [-55, 66]],
  [[-80, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-55, -35], [-66, -55], [-73, -50], [-71, -30], [-80, -5]],
  [[-10, 36], [-9, 43], [-2, 47], [-5, 48], [5, 53], [10, 57], [5, 62], [15, 69], [30, 71], [40, 66], [30, 60], [40, 55], [40, 45], [28, 41], [22, 37], [12, 38], [8, 44], [3, 42]],
  [[-17, 21], [-10, 30], [0, 36], [10, 37], [33, 31], [43, 12], [51, 12], [40, -15], [35, -25], [20, -35], [17, -28], [12, -15], [9, 4], [-8, 4], [-17, 14]],
  [[40, 66], [60, 70], [80, 73], [110, 76], [140, 72], [170, 68], [180, 65], [160, 60], [142, 52], [135, 43], [128, 35], [121, 31], [120, 23], [110, 20], [108, 12], [104, 10], [100, 13], [100, 6], [103.6, 1.6], [98, 8], [97, 17], [92, 21], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [52, 27], [56, 23], [59, 22], [52, 16], [43, 12], [34, 28], [36, 36], [28, 41], [40, 45], [40, 55], [30, 60]],
  [[95, 5], [98, 4], [106, -6], [102, -5]], [[109, 2], [117, 7], [119, 1], [116, -4], [110, -3]], [[106, -6], [114, -7], [114, -8.5], [106, -7.5]], [[131, -1], [141, -3], [150, -10], [141, -9], [132, -4]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [115, -34]],
  [[130, 31], [135, 34], [141, 36], [142, 43], [140, 41], [133, 35]], [[-5, 50], [1, 51], [-1, 56], [-5, 58], [-6, 55]], [[44, -13], [50, -16], [47, -25], [44, -22]],
];
function nwTexMap() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a86c4'); gr.addColorStop(1, '#3aa0d0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const P = (lo, la) => [(lo + 170) / 360 * w, (78 - la) / 136 * h]; g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2;
  for (let lo = -150; lo < 190; lo += 30) { g.beginPath(); g.moveTo(P(lo, 0)[0], 0); g.lineTo(P(lo, 0)[0], h); g.stroke(); } for (let la = 60; la > -60; la -= 30) { g.beginPath(); g.moveTo(0, P(0, la)[1]); g.lineTo(w, P(0, la)[1]); g.stroke(); }
  for (const poly of NW_LAND) { g.beginPath(); poly.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fillStyle = '#f2c868'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#a86a2a'; g.stroke(); }
  g.strokeStyle = '#6a3a1a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, 1024, 760); }
function nwTexMegaPrint() { return tex((g, w, h) => { const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#5ab0f0'); sk.addColorStop(0.7, '#ffd8a8'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a9ab8'; for (let i = 0; i < 6; i++) g.fillRect(w * (0.02 + i * 0.17), h * (0.55 + (i % 3) * 0.06), w * 0.12, h * 0.5);
  const bx = w * 0.26, bw = w * 0.48, by = h * 0.16; const tg = g.createLinearGradient(bx, 0, bx + bw, 0); tg.addColorStop(0, '#2a5a8a'); tg.addColorStop(0.5, '#5aa0d8'); tg.addColorStop(1, '#244a72'); g.fillStyle = tg; g.fillRect(bx, by, bw, h - by);
  g.fillStyle = 'rgba(220,240,255,0.5)'; for (let j = 0; j < 18; j++) for (let i = 0; i < 6; i++) g.fillRect(bx + 8 + i * bw / 6, by + 70 + j * 32, bw / 6 - 12, 18);
  g.fillStyle = '#1e2a3a'; g.fillRect(bx - 8, by - 4, bw + 16, 56); inked(g, 'MEGASPEED', w / 2, by + 24, 36, '#f6f0e0', { stroke: false, font: 'Arial Black, Arial, sans-serif', maxW: bw });
  g.fillStyle = '#2e8a3a'; for (const x of [0.12, 0.86]) { g.fillRect(w * x - 4, h * 0.72, 8, h * 0.28); for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(w * x + Math.cos(k) * 30, h * 0.72 + Math.sin(k) * 10, 34, 9, k, 0, TAU); g.fill(); } }
  g.fillStyle = '#f6efe0'; g.fillRect(0, h - 70, w, 70); inked(g, 'SINGAPORE', w / 2, h - 36, 34, '#2a1e1a', { stroke: false, font: NW_SERIF, weight: 700 });
  g.strokeStyle = '#f6efe0'; g.lineWidth = 16; g.strokeRect(0, 0, w, h); }, 640, 768); }
function nwTexSignBox() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a2e5a'); gr.addColorStop(1, '#0e1a3a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  inked(g, 'MEGASPEED', w / 2, h * 0.53, h * 0.56, '#9ae8ff', { stroke: '#2a8ad8', sw: h * 0.05, font: 'Arial Black, Arial, sans-serif', maxW: w * 0.9 }); g.strokeStyle = '#7ad8ff'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); }, 1024, 320); }
function nwTexTag(txt) { return tex((g, w, h) => { g.fillStyle = '#f6eed8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c42a2e'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); inked(g, txt, w / 2, h * 0.54, h * 0.5, '#c42a2e', { stroke: false, font: 'Arial Black, Arial, sans-serif', maxW: w * 0.86 }); }, 512, 128); }
function nwTexCrate() { return tex((g, w, h) => { g.fillStyle = '#c8924c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#b8823e' : '#d29c58'; g.fillRect(0, i * h / 5, w, h / 5 - 4); g.fillStyle = 'rgba(80,40,10,0.45)'; g.fillRect(0, (i + 1) * h / 5 - 4, w, 4); }
  g.fillStyle = '#9a6a30'; g.fillRect(0, 0, 26, h); g.fillRect(w - 26, 0, 26, h); g.fillRect(0, 0, w, 22); g.fillRect(0, h - 22, w, 22);
  g.save(); g.translate(w * 0.3, h * 0.5); g.fillStyle = '#2a2420'; g.fillRect(-46, -46, 92, 92); g.fillStyle = '#c8924c'; g.fillRect(-30, -30, 60, 60); g.fillStyle = '#2a2420'; g.fillRect(-18, -18, 36, 36);
  for (let i = -2; i <= 2; i++) { g.fillRect(i * 16 - 4, -64, 8, 18); g.fillRect(i * 16 - 4, 46, 8, 18); g.fillRect(-64, i * 16 - 4, 18, 8); g.fillRect(46, i * 16 - 4, 18, 8); } g.restore();
  inked(g, 'CHIPS', w * 0.66, h * 0.52, h * 0.3, '#2a2420', { stroke: false, font: 'Impact, "Arial Black", sans-serif', maxW: w * 0.5 }); }, 512, 384); }
function nwTexCash() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6ab86a'); gr.addColorStop(1, '#3a8a4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(20,60,30,0.6)'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#e8d8a0'; g.fillRect(w * 0.42, 0, w * 0.16, h);
  inked(g, '$', w * 0.2, h * 0.52, h * 0.6, '#1e5a2a', { stroke: false }); inked(g, '100', w * 0.78, h * 0.52, h * 0.42, '#1e5a2a', { stroke: false, font: 'Arial Black, Arial, sans-serif' }); }, 256, 96); }
function nwTexTicker() { const t = tex((g, w, h) => { g.fillStyle = '#16100e'; g.fillRect(0, 0, w, h);
  const txt = 'WIRE  ▸  MARKETS OPEN HIGHER  ▸  TECH SHARES ACTIVE  ▸  RAIN EXPECTED TONIGHT  ▸  CITY BUDGET VOTE THURSDAY  ▸  PORT TRAFFIC UP  ▸  ';
  g.font = `900 ${h * 0.62}px "Arial Black", Arial, sans-serif`; g.textBaseline = 'middle'; g.fillStyle = '#ffae3a'; g.fillText(txt, 8, h * 0.54);
  g.fillStyle = '#16100e'; for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, h); for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 2); }, 2048, 64);
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(72 / 32, 1); return t; }
function nwTexPoster(top, line, bg, fg) { return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88);
  inked(g, top, w / 2, h * 0.32, h * 0.2, fg, { stroke: false, font: 'Impact, "Arial Black", sans-serif', maxW: w * 0.84 }); inked(g, line, w / 2, h * 0.64, h * 0.11, fg, { stroke: false, maxW: w * 0.84 }); }, 384, 512); }
function nwTexStripes() { const t = tex((g, w, h) => { g.fillStyle = '#f2c41a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2420'; for (let x = -h; x < w; x += 48) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 24, h); g.lineTo(x + 24 + h, 0); g.lineTo(x + h, 0); g.fill(); } }, 512, 64);
  t.wrapS = THREE.RepeatWrapping; return t; }
function nwTexGauge() { return tex((g, w, h) => { g.fillStyle = '#f2ecd8'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, TAU); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a2420'; g.stroke();
  g.lineWidth = 6; g.strokeStyle = '#d8342a'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.36, -0.4, 0.5); g.stroke(); g.strokeStyle = '#2a2420'; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w * 0.78, h * 0.34); g.stroke(); }, 128, 128); }
function nwTexScreen(c1, c2) { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 6; i++) g.fillRect(w * 0.1, h * (0.2 + i * 0.11), w * (0.4 + (i % 3) * 0.15), h * 0.04); }, 256, 160); }
// ---- the wall TV + the board (canvas screens, redrawn on change)
function nwDrawTV(g, w, h, t) {
  if (t < NW_T.tv) { const k = Math.floor(t * 8); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1e3a8a'); gr.addColorStop(1, '#3a6ad0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(0, h * i / 12); g.lineTo(w, h * i / 12); g.stroke(); }
    g.strokeStyle = '#ffd04a'; g.lineWidth = 8; g.beginPath(); for (let i = 0; i <= 20; i++) { const x = w * (0.1 + i * 0.04), y = h * (0.62 - 0.012 * i - 0.06 * Math.sin(i * 1.3 + k * 0.4)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    inked(g, 'MARKETS', w * 0.3, h * 0.2, h * 0.11, '#f6f0e4', { stroke: false }); g.fillStyle = '#d8282a'; g.fillRect(w * 0.76, h * 0.08, w * 0.16, h * 0.09); inked(g, 'LIVE', w * 0.84, h * 0.125, h * 0.06, '#f6f0e4', { stroke: false });
    g.fillStyle = '#e8e4dc'; g.fillRect(0, h * 0.84, w, h * 0.16); g.fillStyle = '#c42a2e'; g.fillRect(0, h * 0.84, w * 0.18, h * 0.16); inked(g, 'NEWS', w * 0.09, h * 0.92, h * 0.07, '#f6f0e4', { stroke: false });
    g.save(); g.beginPath(); g.rect(w * 0.19, h * 0.84, w * 0.81, h * 0.16); g.clip(); g.font = `800 ${h * 0.065}px Arial`; g.fillStyle = '#2a2420'; g.textBaseline = 'middle'; g.fillText('MARKETS OPEN HIGHER  •  RAIN TONIGHT  •  TRAFFIC ON THE BRIDGE  •  MARKETS OPEN HIGHER', w * 0.2 - (k * 9 % 900), h * 0.92); g.restore(); return; }
  // rev4 briefing room: deep blue backdrop, flags-free generic emblem; the invented FOREIGN MINISTRY spokesperson (toon kit head +
  // torso drawn every frame, mouth on "China calls that a smear") behind a podium with its sign; the quote card slides in on the right
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a3478'); gr.addColorStop(1, '#2c56b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 9; i++) g.fillRect(w * i / 9, 0, w / 18, h);
  g.beginPath(); g.arc(w * 0.08, h * 0.16, h * 0.08, 0, TAU); g.fillStyle = 'rgba(226,178,58,0.35)'; g.fill(); g.lineWidth = 4; g.strokeStyle = 'rgba(226,178,58,0.6)'; g.stroke();
  { const s = NW.s, p = s.spk, talkOn = t >= NW_T.tv && t < 26.04, talk = talkOn ? t3Syl(t3Seed('NWspk'), t) : 0;
    const st = { t, expr: t < NW_T.smear ? 'determined' : 'skeptical', browUp: t >= NW_T.smear && t < NW_T.smear + 0.5 ? 2 : 0, nod: 0, nodSide: 1, lid: t3Blink('NWspk', t), gaze: [0.6, 0.1], light: -2.2, env: '#c8d4f0', talk, talkOn, talkAmp: talkOn ? 0.9 : 0, fx: null };
    const f = { f: 0.3, m: 0.3, dir: 1, back: false }, D = t3Dims(p.o), hc = t3HeadCanvas(p, st, f), T = t3TorsoCanvas(p, st, f, D.tw, D.Th), k = p.k;
    const sc = h * 0.17 / (D.A * k), cx = w * 0.3, bob = talk >= 2 ? h * 0.008 : 0, hy = h * 0.27 + bob, ty = hy + 0.8 * D.A * k * sc;
    g.drawImage(T.c, cx - T.c.width * sc / 2, ty - 20 * k * sc, T.c.width * sc, T.c.height * sc);
    g.drawImage(hc, cx - T3_HEADBOX.cx * k * sc, hy - T3_HEADBOX.cy * k * sc, hc.width * sc, hc.height * sc); }
  // the podium (in front of the speaker) + its FOREIGN MINISTRY sign + mics
  g.fillStyle = '#8a5a30'; g.beginPath(); g.moveTo(w * 0.1, h * 0.6); g.lineTo(w * 0.5, h * 0.6); g.lineTo(w * 0.47, h * 0.88); g.lineTo(w * 0.13, h * 0.88); g.closePath(); g.fill();
  g.fillStyle = '#6a4224'; g.fillRect(w * 0.08, h * 0.575, w * 0.44, h * 0.05);
  g.fillStyle = '#7a1e22'; g.fillRect(w * 0.13, h * 0.64, w * 0.34, h * 0.17); g.strokeStyle = '#e2b23a'; g.lineWidth = 4; g.strokeRect(w * 0.137, h * 0.647, w * 0.326, h * 0.156);
  inked(g, 'FOREIGN', w * 0.3, h * 0.69, h * 0.06, '#f2d488', { stroke: false, font: 'Arial Black, Arial, sans-serif', maxW: w * 0.3 }); inked(g, 'MINISTRY', w * 0.3, h * 0.765, h * 0.06, '#f2d488', { stroke: false, font: 'Arial Black, Arial, sans-serif', maxW: w * 0.3 });
  g.strokeStyle = '#2a2a30'; g.lineWidth = 4; for (const dx of [-0.025, 0.025]) { g.beginPath(); g.moveTo(w * (0.3 + dx), h * 0.58); g.lineTo(w * (0.3 + dx * 1.8), h * 0.53); g.stroke(); g.fillStyle = '#2a2a30'; g.beginPath(); g.arc(w * (0.3 + dx * 1.8), h * 0.525, 6, 0, TAU); g.fill(); }
  g.fillStyle = '#e8e4dc'; g.fillRect(0, h * 0.86, w, h * 0.14); g.fillStyle = '#c42a2e'; g.fillRect(0, h * 0.86, w * 0.18, h * 0.14); inked(g, 'LIVE', w * 0.09, h * 0.93, h * 0.07, '#f6f0e4', { stroke: false });
  inked(g, 'FOREIGN MINISTRY BRIEFING', w * 0.58, h * 0.93, h * 0.065, '#2a2420', { stroke: false, maxW: w * 0.76 });
  const k = EZ.back(nwE(NW_T.smear - 0.06, NW_T.smear + 0.12, t)); if (k <= 0) return;
  const cx = w * 0.73 + (1 - k) * w * 0.6; g.save(); g.translate(cx, h * 0.36); g.rotate(-0.04);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-w * 0.24 + 8, -h * 0.17 + 10, w * 0.48, h * 0.34); g.fillStyle = '#f4ecdc'; g.fillRect(-w * 0.24, -h * 0.17, w * 0.48, h * 0.34); g.fillStyle = '#c42a2e'; g.fillRect(-w * 0.24, -h * 0.17, w * 0.02, h * 0.34);
  inked(g, '“A SMEAR”', w * 0.01, -h * 0.04, h * 0.13, '#c42a2e', { stroke: false, font: 'Impact, "Arial Black", sans-serif', maxW: w * 0.42 });
  inked(g, "— CHINA'S", w * 0.01, h * 0.075, h * 0.042, '#2a2420', { stroke: false, maxW: w * 0.42 }); inked(g, 'FOREIGN MINISTRY', w * 0.01, h * 0.125, h * 0.042, '#2a2420', { stroke: false, maxW: w * 0.42 }); g.restore(); }
function nwDrawBoard(g, w, h, f) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1e4a3a'); gr.addColorStop(1, '#173a2e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8924c'; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
  inked(g, 'CHARGES FILED:', w / 2, h * 0.2, h * 0.12, '#f2ead8', { stroke: false, font: 'Arial Black, Arial, sans-serif', maxW: w * 0.84 });
  const bw = w * 0.32, bh = h * 0.56, bx = w / 2 - bw / 2, by = h * 0.34; g.fillStyle = '#1a1614'; g.beginPath(); g.roundRect(bx, by, bw, bh, 14); g.fill();
  const half = (top, digit, sy) => { g.save(); g.beginPath(); top ? g.rect(bx, by, bw, bh / 2) : g.rect(bx, by + bh / 2, bw, bh / 2); g.clip(); g.translate(0, by + bh / 2); g.scale(1, sy); g.translate(0, -(by + bh / 2));
    g.fillStyle = '#2c2624'; g.fillRect(bx + 6, by + 6, bw - 12, bh - 12); if (digit) inked(g, '0', w / 2, by + bh * 0.54, bh * 0.82, '#f6f0e2', { stroke: false, font: 'Arial Black, Arial, sans-serif' }); g.restore(); };
  // flip: the old (blank) top flap falls over the new "0"
  if (f <= 0) { half(true, false, 1); half(false, false, 1); } else if (f >= 1) { half(true, true, 1); half(false, true, 1); }
  else { half(true, true, 1); if (f < 0.5) { half(false, false, 1); half(true, false, 1 - f * 2); } else { half(false, false, 1); half(false, true, (f - 0.5) * 2); } }
  g.fillStyle = '#0e0c0a'; g.fillRect(bx, by + bh / 2 - 3, bw, 6); }

// ---- small builders
function nwRoller(r, len, mat) { const g = new THREE.Group(), c = ncy(r, r, len, mat, 0, 0, 0, 24); c.rotation.x = Math.PI / 2; g.add(c); return g; }   // axis z; spin with g.rotation.z
function nwGear(r, n, th, mat, hub) { const g = new THREE.Group(), b = ncy(r, r, th, mat, 0, 0, 0, 36); b.rotation.x = Math.PI / 2; g.add(b);
  for (let i = 0; i < n; i++) { const a = i / n * TAU, k = nb(r * 0.22, r * 0.24, th, mat, Math.cos(a) * (r + r * 0.08), Math.sin(a) * (r + r * 0.08), 0); k.rotation.z = a; g.add(k); }
  const hb = ncy(r * 0.28, r * 0.28, th + 0.2, hub, 0, 0, 0, 16); hb.rotation.x = Math.PI / 2; g.add(hb);
  for (let i = 0; i < 4; i++) { const sp = nb(r * 1.5, r * 0.12, 0.08, hub, 0, 0, th / 2 + 0.02); sp.rotation.z = i * Math.PI / 4 * 2 + 0.4; g.add(sp); } return g; }
function nwSideShape(w, h, r = 0.9, hole = true) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - r); s.quadraticCurveTo(w / 2, h, w / 2 - r, h); s.lineTo(-w / 2 + r, h); s.quadraticCurveTo(-w / 2, h, -w / 2, h - r); s.lineTo(-w / 2, 0);
  if (hole) { const p = new THREE.Path(), hw = w * 0.27, y0 = h * 0.3, y1 = h * 0.7; p.moveTo(-hw, y0); p.lineTo(hw, y0); p.lineTo(hw, y1 - hw); p.absarc(0, y1 - hw, hw, 0, Math.PI, false); p.lineTo(-hw, y0); s.holes.push(p); } return s; }
function nwExtrude(shape, depth, mat) { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 2, curveSegments: 12 }); g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return new THREE.Mesh(g, mat); }
function nwPlant(seed, s = 1) { const g = new THREE.Group(), R = RNG('nwplant', seed), lf = c3Prop('#2e9a44', { rough: 0.55, side: THREE.DoubleSide }), lf2 = c3Prop('#56bc4a', { rough: 0.55, side: THREE.DoubleSide });
  g.add(ncy(0.9, 0.7, 1.5, c3Prop('#d8603a', { rough: 0.6 }), 0, 0.75, 0, 14)); g.add(ncy(0.95, 0.95, 0.2, c3Prop('#b84a2a', { rough: 0.6 }), 0, 1.5, 0, 14));
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + R.n(0.3), h = R.r(1.6, 3.2), leaf = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 6), i % 2 ? lf : lf2); leaf.scale.set(0.5, 0.12, 1.4); leaf.position.set(Math.cos(a) * 0.9, 1.5 + h, Math.sin(a) * 0.9); leaf.rotation.set(R.n(0.3), -a + Math.PI / 2, 0.6); g.add(leaf);
    const st = ncy(0.05, 0.05, h, lf, Math.cos(a) * 0.45, 1.5 + h / 2, Math.sin(a) * 0.45, 5); st.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); g.add(st); }
  g.scale.setScalar(s); return g; }
function nwLamp(M) { const g = new THREE.Group(); g.add(ncy(0.5, 0.6, 0.18, M.brass, 0, 0.09, 0, 16)); g.add(ncy(0.07, 0.07, 1.6, M.brass, 0, 0.9, 0, 8));
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.75, 0.6, 18, 1, true), c3Prop('#2e8a4a', { rough: 0.35, side: THREE.DoubleSide })); sh.position.set(0.2, 1.75, 0); sh.rotation.z = 0.35; g.add(sh);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), M.bulb); b.position.set(0.25, 1.55, 0); g.add(b); return g; }
function nwTypewriter(M) { const g = new THREE.Group(); g.add(nb(1.9, 0.5, 1.4, M.black, 0, 0.25, 0)); g.add(nb(1.7, 0.35, 0.7, M.black, 0, 0.62, -0.25));
  const pl0 = ncy(0.16, 0.16, 2.2, M.dark, 0, 0.85, -0.35, 12); pl0.rotation.z = Math.PI / 2; g.add(pl0); for (const s of [-1, 1]) g.add(ncy(0.12, 0.12, 0.1, M.steel, s * 1.15, 0.85, -0.35, 10));
  const sh = pl(1.3, 1.5, c3Prop('#efe4c8', { rough: 0.8, side: THREE.DoubleSide }), 0, 1.6, -0.42, 0, -0.12); g.add(sh);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) { const k = ncy(0.07, 0.07, 0.08, M.keycap, -0.7 + i * 0.2, 0.55 - j * 0.04, 0.15 + j * 0.2, 8); g.add(k); } return g; }
function nwPhone(M) { const g = new THREE.Group(); g.add(nb(0.9, 0.35, 1.0, M.redD, 0, 0.18, 0)); const h = nb(1.1, 0.22, 0.32, M.redD, 0, 0.48, 0); g.add(h); g.add(ncy(0.18, 0.18, 0.06, M.cream, 0, 0.37, 0.28, 12)); return g; }
function nwPaperStack(n, seed, M) { const g = new THREE.Group(), R = RNG('nwps', seed); let y = 0; for (let i = 0; i < n; i++) { const h = R.r(0.05, 0.1), p = nb(1.4, h, 1.8, i % 5 === 0 ? M.paperB : M.paper, R.n(0.08), y + h / 2, R.n(0.08)); p.rotation.y = R.n(0.12); g.add(p); y += h; } return g; }
function nwDesk(M, w, d) { const g = new THREE.Group(); g.add(nb(w, 0.35, d, M.wood, 0, 4.0, 0)); g.add(nb(w - 0.3, 3.6, 0.2, M.woodD, 0, 2.0, d / 2 - 0.25));
  for (const s of [-1, 1]) { g.add(nb(0.25, 3.8, d - 0.4, M.woodD, s * (w / 2 - 0.3), 1.9, 0)); }
  for (let i = 0; i < 3; i++) { g.add(nb(1.8, 0.9, 0.1, M.wood, w / 2 - 1.4, 3.1 - i * 1.0, d / 2 - 0.1)); g.add(nb(0.5, 0.12, 0.12, M.brass, w / 2 - 1.4, 3.1 - i * 1.0, d / 2 - 0.02)); } return g; }
function nwChair(M) { const g = new THREE.Group(); g.add(nb(1.8, 0.3, 1.7, M.chair, 0, 2.8, 0)); g.add(nb(1.8, 2.0, 0.25, M.chair, 0, 4.0, -0.85)); g.add(ncy(0.12, 0.12, 2.4, M.steel, 0, 1.4, 0, 8));
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, l = nb(1.0, 0.14, 0.18, M.steel, Math.cos(a) * 0.5, 0.2, Math.sin(a) * 0.5); l.rotation.y = -a; g.add(l); } return g; }

// ---- the press: reel stand, three printing units, catwalk, folder tower, the delivery table
const NW_UNITS = [-27.4, -21.8, -16.2], NW_INK = ['#1aa0d8', '#e0307a', '#f2c41a'];
function nwPress(s, scene, M) { const rl = s.roll = [], gears = s.gears = [];
  // the paper reel on its A-frame stand
  { const side = nwTexRoller('#ecdcb8', 'rgba(150,110,60,0.35)'), cap = tex((g, w, h) => { g.fillStyle = '#ecdcb8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,110,60,0.4)'; g.lineWidth = 2; for (let r = 20; r < w / 2; r += 7) { g.beginPath(); g.arc(w / 2, h / 2, r, 0, TAU); g.stroke(); } g.fillStyle = '#7a4a2a'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.12, 0, TAU); g.fill(); }, 256, 256);
    const reel = new THREE.Group(), c = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 6.4, 36), [c3Prop('#ffffff', { map: side, rough: 0.8 }), c3Prop('#ffffff', { map: cap, rough: 0.8 }), c3Prop('#ffffff', { map: cap, rough: 0.8 })]); c.rotation.x = Math.PI / 2; reel.add(c);
    reel.position.set(-33, 3.0, 15); scene.add(reel); rl.push([reel, 2.3]);
    for (const z of [11.4, 18.6]) { const sh = nwExtrude(nwSideShape(4.6, 4.2, 0.6, false), 0.5, M.red); sh.position.set(-33, 0, z); scene.add(sh); scene.add(ncy(0.5, 0.5, 0.7, M.steel, -33, 3.0, z + (z < 15 ? -0.4 : 0.4), 16).rotateX(Math.PI / 2)); }
    scene.add(nb(5.6, 0.6, 8.2, M.dark, -33, 0.3, 15)); }
  // the paper web through the units (scrolls with the press)
  s.webH = pl(21.5, 6.4, c3Prop('#ffffff', { map: s.stripT = nwTexStrip(), rough: 0.8, side: THREE.DoubleSide }), -22.3, 5.0, 15, 0, -Math.PI / 2); s.webH.userData.noCast = true; scene.add(s.webH);
  NW_UNITS.forEach((x, i) => {
    for (const z of [11.3, 18.7]) { const f = nwExtrude(nwSideShape(5.0, 9.0, 0.9), 0.55, M.red); f.position.set(x, 0, z); scene.add(f); }
    scene.add(nb(5.4, 0.9, 8.4, M.dark, x, 0.45, 15)); scene.add(nb(5.2, 0.35, 8.2, M.redD, x, 9.1, 15));   // plinth, top deck
    for (const [y, r, m] of [[5.95, 0.92, M.steelR], [4.05, 0.92, M.blanket], [7.35, 0.42, M.ink[i]], [8.15, 0.36, M.steelR], [2.9, 0.5, M.steelR]]) { const R0 = nwRoller(r, 7.2, m); R0.position.set(x + (y > 7 ? (y > 8 ? -0.7 : 0.6) : 0), y, 15); scene.add(R0); rl.push([R0, r]); }
    scene.add(nb(4.2, 0.7, 7.0, M.ink[i], x - 0.2, 8.62, 15));   // ink fountain
    const gr = nwGear(1.0, 14, 0.35, M.brass, M.steel); gr.position.set(x - 1.3, 7.6, 19.2); scene.add(gr); gears.push([gr, 1.0, 1]);
    const g2 = nwGear(0.62, 10, 0.3, M.brass, M.steel); g2.position.set(x + 0.35, 7.95, 19.15); scene.add(g2); gears.push([g2, 0.62, -1]);
    const plate = pl(1.8, 0.7, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2420'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); inked(g, 'UNIT ' + (i + 1), w / 2, h / 2, h * 0.5, '#2a2420', { stroke: false }); }, 256, 100) }), x - 1.4, 2.2, 19.0); scene.add(plate);
    for (const dz of [-1, 1]) scene.add(ncy(0.08, 0.08, 6.2, M.steel, x + 2.6, 3.2 + dz * 0.8, 15, 6).rotateX(Math.PI / 2));
  });
  // the catwalk on the unit tops: grate, front railing, a ladder up at the reel end
  { scene.add(nb(18.4, 0.18, 7.6, M.grate, -21.8, 9.4, 15)); for (let x = -30.5; x <= -13.5; x += 2.125) scene.add(ncy(0.08, 0.08, 2.0, M.yellow, x, 10.4, 18.7, 6));
    for (const y of [10.4, 11.4]) { const r = ncy(0.09, 0.09, 17.0, M.yellow, -22.0, y, 18.7, 6); r.rotation.z = Math.PI / 2; scene.add(r); }
    for (const sx of [-31.0, -30.0]) scene.add(nb(0.16, 9.4, 0.16, M.yellow, sx, 4.7, 19.4)); for (let y = 1; y < 9.4; y += 1.0) scene.add(nb(1.0, 0.12, 0.12, M.yellow, -30.5, y, 19.4)); }
  // the folder tower (x -12..-4, z 11..19.5, h 20): side frames, a back panel, the web face, top roller, the triangle former
  { for (const x of [-12, -4]) { const f = nwExtrude(nwSideShape(8.6, 20, 1.2), 0.7, M.red); f.rotation.y = Math.PI / 2; f.position.set(x, 0, 15.25); scene.add(f); }
    scene.add(nbN(7.4, 20, 0.4, M.redD, -8, 10, 11.4)); scene.add(nb(8.8, 1.0, 9.0, M.dark, -8, 0.5, 15.2));
    scene.add(nb(7.6, 1.6, 0.9, M.red, -8, 20.0, 15.2)); const top = nwRoller(0.8, 7.2, M.steelR); top.rotation.y = Math.PI / 2; top.position.set(-8, 19.4, 19.0); scene.add(top); s.topRoll = top;
    const fs = new THREE.Shape(); fs.moveTo(-3, 0); fs.lineTo(3, 0); fs.lineTo(0, 3.4); fs.lineTo(-3, 0); const former = nwExtrude(fs, 0.3, M.steel); former.position.set(-8, 20.8, 13.6); scene.add(former);
    s.webT = pl(6.6, 17.4, c3Prop('#ffffff', { map: s.webGT = nwTexWebGeneric(), rough: 0.8 }), -8, 10.5, 19.3); s.webT.userData.noCast = true; s.webGT.repeat.set(1, 17.4 / 16.6); scene.add(s.webT);
    s.page2 = pl(NW_PGW, NW_PGH, c3Flat('#ffffff', { map: tex((g, w, h) => nwPage(g, w, h, { seed: 9, head: [['U.S. INTELLIGENCE BELIEVES', 0.06], ['SHE WAS RECRUITED BY', 0.06], ["CHINA'S SPY AGENCY,", 0.06], ['TIMES SAYS', 0.06]], chip: 'NYT · OCT 29', date: 'OCTOBER 29, 2026', photo: true }), 1024, 1328) }), NW_WEB[0], 0, NW_WEB[1]); s.page2.userData.noCast = true; scene.add(s.page2);
    scene.add(nb(8.4, 2.0, 1.4, M.red, -8, 1.0, 19.7)); scene.add(pl(8.2, 0.5, c3Prop('#ffffff', { map: nwTexStripes(), rough: 0.6 }), -8, 1.2, 20.42));   // the housing at the web foot + hazard stripes
    for (const y of [5.5, 14.5]) scene.add(nb(0.5, 0.5, 8.6, M.redD, -12.4, y, 15.2));
    scene.add(pl(2.6, 0.8, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2420'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); inked(g, 'FOLDER', w / 2, h / 2, h * 0.5, '#2a2420', { stroke: false }); }, 256, 80) }), -10.4, 0.5, 19.72).rotateX(0));
    // control box on the right frame: buttons + a gauge
    scene.add(nb(0.8, 2.4, 2.2, M.cream, -3.4, 6.6, 18.0)); for (const [dz, c] of [[-0.5, M.btnR], [0.1, M.btnG], [0.6, M.yellow]]) scene.add(ncy(0.18, 0.18, 0.2, c, -2.95, 6.0, 18.0 + dz, 12).rotateZ(Math.PI / 2));
    scene.add(pl(0.9, 0.9, c3Flat('#ffffff', { map: nwTexGauge() }), -2.98, 7.2, 18.0, Math.PI / 2));
    // the delivery slot + the roller table out to the copy desk
    scene.add(nb(0.3, 0.5, 7.0, M.black, -3.75, 4.75, 16.4)); scene.add(nb(3.6, 0.3, 7.2, M.steel, -2.2, 4.25, 16.4));
    for (let x = -3.6; x <= -0.8; x += 0.7) { const r = nwRoller(0.16, 7.0, M.steelR); r.position.set(x, 4.5, 16.4); scene.add(r); rl.push([r, 0.16]); }
    for (const z of [13.0, 19.8]) for (const x of [-3.7, -0.7]) scene.add(nb(0.25, 4.1, 0.25, M.steel, x, 2.05, z)); }
  // the press operator's console in front of unit 3
  { const cx = -22.0; scene.add(nb(3.4, 3.6, 1.4, M.cream, cx, 1.8, 21.0)); const top = nb(3.6, 0.3, 1.9, M.dark, cx, 3.9, 21.1); top.rotation.x = -0.35; scene.add(top);
    for (let i = 0; i < 5; i++) scene.add(ncy(0.15, 0.15, 0.2, [M.btnR, M.btnG, M.yellow, M.btnG, M.btnR][i], cx - 1.2 + i * 0.6, 4.15, 21.3, 10));
    scene.add(nb(0.2, 1.6, 0.2, M.steel, cx + 1.5, 4.7, 21.6)); scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), M.btnR).translateX(cx + 1.5).translateY(5.6).translateZ(21.6)); }
}

// ---- rev4: Alice's name card (headline style: cream newsprint, the same serif 900 ink as the "ALICE HUANG" headline) on an easel
function nwTexNameCard() { return tex((g, w, h) => { const bg = g.createLinearGradient(0, 0, w * 0.4, h); bg.addColorStop(0, '#f2e6c8'); bg.addColorStop(1, '#e0d0aa'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const ink = '#221c1a'; g.fillStyle = ink; g.fillRect(w * 0.05, h * 0.1, w * 0.9, 5); g.fillRect(w * 0.05, h * 0.86, w * 0.9, 5);
  inked(g, 'ALICE HUANG', w / 2, h * 0.36, h * 0.3, ink, { stroke: false, font: NW_SERIF, weight: 900, maxW: w * 0.86 });
  const cw = w * 0.56, ch = h * 0.2, cx = w / 2 - cw / 2, cy = h * 0.56; g.fillStyle = '#c42a2e'; g.beginPath(); g.roundRect(cx, cy, cw, ch, ch * 0.3); g.fill();
  inked(g, 'MEGASPEED', w / 2, cy + ch * 0.54, ch * 0.66, '#f6ecd8', { stroke: false, font: 'Arial Black, Arial, sans-serif', weight: 900, maxW: cw * 0.86 });
  g.strokeStyle = '#6a4a2a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, 1024, 620); }
// ---- rev4: the spy vignette (the Times' claim, s08 "According to the paper..."): a big gilt-framed ILLUSTRATION display case on a
// plinth in front of the press (x -25.3..-16.7, z 24.2..28.2), a grey ministry building inside, a double door the agents peek
// out of, a lectern in front with the "U.S. INTELLIGENCE MEMO · per NYT" folder that gets the red ALLEGED stamp. Shown 20.5 s on.
const NW_VG = { x: -21, z: 28.2, fy0: 1.2, fy1: 12.6, fw: 8.6, b: 0.75, fz: 25.6, dx0: -22.5, dx1: -19.5, dy0: 2.55, dy1: 8.75, az: 25.0 };
const NW_FOLD = [-21, 30.6];   // the memo lectern (x, z)
function nwTexFacade() { return tex((g, w, h) => {   // the facade between the frame's opening edges (x -24.55..-17.45, y 1.95..11.85); the door cut out (alpha)
  const X = (x) => (x - (NW_VG.x - 3.55)) / 7.1 * w, Y = (y) => (11.85 - y) / 9.9 * h, R = RNG('nwfac');
  const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#9aa4b4'); sk.addColorStop(1, '#b8bcc4'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += h / 22) { g.fillStyle = 'rgba(60,66,80,0.28)'; g.fillRect(0, y, w, 3); const off = (Math.round(y / (h / 22)) % 2) * w / 12; for (let x = off; x < w; x += w / 6) g.fillRect(x, y, 3, h / 22); }
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(50,56,70,${R.r(0.03, 0.08)})`; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(10, 40), R.r(8, 30), 0, 0, TAU); g.fill(); }
  // cornice + pediment band, a generic gold star roundel
  g.fillStyle = '#7a8292'; g.fillRect(0, Y(11.85), w, Y(10.9) - Y(11.85)); g.fillStyle = '#5e6676'; g.fillRect(0, Y(10.95), w, 8);
  g.beginPath(); g.arc(w / 2, Y(11.4), h * 0.04, 0, TAU); g.fillStyle = '#d8a83a'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#7a5a1a'; g.stroke();
  g.fillStyle = '#c42a2e'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = (i % 2 ? 0.4 : 1) * h * 0.028; g.lineTo(w / 2 + Math.cos(a) * r, Y(11.4) + Math.sin(a) * r); } g.closePath(); g.fill();
  // windows: two each side of the door, blinds; the upper right one has a shadowy watcher with a shades glint
  for (const [x0, y0] of [[-24.2, 9.2], [-24.2, 5.4], [-19.0, 9.2], [-19.0, 5.4]]) { const x = X(x0), y = Y(y0 + 1.4), ww = X(x0 + 1.2) - x, hh = Y(y0) - y;
    g.fillStyle = '#3a3e4c'; g.fillRect(x - 6, y - 6, ww + 12, hh + 12); const wg = g.createLinearGradient(0, y, 0, y + hh); wg.addColorStop(0, '#f2d890'); wg.addColorStop(1, '#d8a860'); g.fillStyle = wg; g.fillRect(x, y, ww, hh);
    if (x0 > -20 && y0 > 9) { g.fillStyle = '#1c1a24'; g.beginPath(); g.ellipse(x + ww * 0.5, y + hh * 0.42, ww * 0.2, hh * 0.2, 0, 0, TAU); g.fill(); g.fillRect(x + ww * 0.2, y + hh * 0.6, ww * 0.6, hh * 0.4);
      g.fillStyle = '#e8f0ff'; g.fillRect(x + ww * 0.36, y + hh * 0.4, ww * 0.1, 4); g.fillRect(x + ww * 0.54, y + hh * 0.4, ww * 0.1, 4); }
    g.fillStyle = 'rgba(90,70,40,0.55)'; for (let k = 0; k < 6; k++) g.fillRect(x, y + k * hh / 6, ww, 3); g.fillStyle = '#e8e2d2'; g.fillRect(x - 8, y + hh + 4, ww + 16, 8); }
  // the door surround (the opening itself is cleared)
  g.fillStyle = '#6a7282'; g.fillRect(X(NW_VG.dx0 - 0.35), Y(NW_VG.dy1 + 0.3), X(NW_VG.dx1 + 0.35) - X(NW_VG.dx0 - 0.35), Y(NW_VG.dy0) - Y(NW_VG.dy1 + 0.3));
  g.clearRect(X(NW_VG.dx0), Y(NW_VG.dy1), X(NW_VG.dx1) - X(NW_VG.dx0), Y(NW_VG.dy0) - Y(NW_VG.dy1) + 2);
  g.fillStyle = '#8a92a2'; g.fillRect(0, Y(2.55), w, Y(1.95) - Y(2.55)); }, 720, 1004); }
function nwTexMinSign() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3440'); gr.addColorStop(1, '#262230'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a83a'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  inked(g, 'MINISTRY OF', w / 2, h * 0.32, h * 0.27, '#f2d488', { stroke: false, font: 'Arial Black, Arial, sans-serif', weight: 900, maxW: w * 0.86 });
  inked(g, 'STATE SECURITY', w / 2, h * 0.7, h * 0.27, '#f2d488', { stroke: false, font: 'Arial Black, Arial, sans-serif', weight: 900, maxW: w * 0.88 }); }, 1024, 320); }
function nwTexPlaque(txt) { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2cc6a'); gr.addColorStop(1, '#c89a3a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7a5a1a'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); inked(g, txt, w / 2, h * 0.54, h * 0.46, '#3a2410', { stroke: false, font: NW_SERIF, weight: 700, maxW: w * 0.88 }); }, 512, 96); }
// the memo folder: manila, a typed label; the red ALLEGED stamp lands on "believes" (k 0..1: the impact, scale 1.5 -> 1)
function nwDrawFolder(g, w, h, k) { const bg = g.createLinearGradient(0, 0, w * 0.3, h); bg.addColorStop(0, '#ecc884'); bg.addColorStop(1, '#d4a860'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,80,30,0.18)'; g.fillRect(0, h * 0.07, w, 4); g.fillStyle = '#d8b06a'; g.fillRect(w * 0.06, 0, w * 0.3, h * 0.07);
  g.fillStyle = '#f6f0e2'; g.fillRect(w * 0.08, h * 0.16, w * 0.84, h * 0.46); g.strokeStyle = '#3a2e24'; g.lineWidth = 4; g.strokeRect(w * 0.08, h * 0.16, w * 0.84, h * 0.46);
  inked(g, 'U.S. INTELLIGENCE', w / 2, h * 0.28, h * 0.11, '#221c1a', { stroke: false, font: 'Arial Black, Arial, sans-serif', weight: 900, maxW: w * 0.78 });
  inked(g, 'MEMO', w / 2, h * 0.41, h * 0.11, '#221c1a', { stroke: false, font: 'Arial Black, Arial, sans-serif', weight: 900, maxW: w * 0.78 });
  inked(g, '· per NYT ·', w / 2, h * 0.54, h * 0.075, '#3a2e24', { stroke: false, font: NW_SERIF, weight: 700, maxW: w * 0.7 });
  if (k <= 0) return; const R = RNG('nwalleg'), s = 1 + 0.5 * (1 - EZ.o3(k));
  g.save(); g.translate(w * 0.56, h * 0.8); g.rotate(-0.12); g.scale(s, s); g.globalAlpha = Math.min(1, 0.4 + k * 0.9) * 0.94; g.strokeStyle = '#cc1e28'; g.lineWidth = h * 0.02;
  g.beginPath(); g.roundRect(-w * 0.3, -h * 0.1, w * 0.6, h * 0.2, h * 0.03); g.stroke(); inked(g, 'ALLEGED', 0, h * 0.008, h * 0.14, '#cc1e28', { stroke: false, font: 'Impact, "Arial Black", sans-serif', weight: 900, maxW: w * 0.54 });
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${R.r(0.2, 0.6)})`; g.fillRect(R.r(-w * 0.3, w * 0.3), R.r(-h * 0.1, h * 0.1), R.r(1, 4), R.r(1, 4)); } g.restore(); }
function nwVignette(s, scene, M) { const V = NW_VG, G = s.vg = new THREE.Group(); scene.add(G); const add = (m) => { G.add(m); return m; };
  const gold = c3Prop('#e2b23a', { metal: 0.55, rough: 0.32 }), goldD = c3Prop('#a8782a', { metal: 0.5, rough: 0.4 }), dark = c3Prop('#22202c', { rough: 0.7 }), stone = c3Prop('#a8aebc', { rough: 0.7 }), stoneD = c3Prop('#868c9c', { rough: 0.7 });
  const zc = (V.z + 24.2) / 2, zd = V.z - 24.2;
  add(nb(V.fw + 0.8, V.fy0, zd + 1.0, M.woodD, V.x, V.fy0 / 2, zc + 0.3)); add(nb(V.fw + 1.0, 0.25, zd + 1.2, M.wood, V.x, V.fy0 - 0.1, zc + 0.3));   // plinth + top board
  add(nb(V.fw, 0.3, zd, dark, V.x, V.fy1 - 0.15, zc)); for (const sx of [-1, 1]) add(nb(0.3, V.fy1 - V.fy0, zd, dark, V.x + sx * (V.fw / 2 - 0.15), (V.fy0 + V.fy1) / 2, zc));   // case top + sides
  add(nbN(V.fw, V.fy1 - V.fy0, 0.2, c3Prop('#1a1824', { rough: 0.9 }), V.x, (V.fy0 + V.fy1) / 2, 24.3));   // the dark interior behind the door
  // the gilt frame: four moulded bars (outer gold + an inner darker lip)
  { const b = V.b, h = V.fy1 - V.fy0, yc = (V.fy0 + V.fy1) / 2;
    for (const [w, hh, x, y] of [[V.fw, b, V.x, V.fy1 - b / 2], [V.fw, b, V.x, V.fy0 + b / 2], [b, h, V.x - V.fw / 2 + b / 2, yc], [b, h, V.x + V.fw / 2 - b / 2, yc]]) { add(nb(w, hh, 0.5, gold, x, y, V.z)); }
    for (const [w, hh, x, y] of [[V.fw - 2 * b, 0.16, V.x, V.fy1 - b - 0.08], [V.fw - 2 * b, 0.16, V.x, V.fy0 + b + 0.08], [0.16, h - 2 * b, V.x - V.fw / 2 + b + 0.08, yc], [0.16, h - 2 * b, V.x + V.fw / 2 - b - 0.08, yc]]) add(nb(w, hh, 0.3, goldD, x, y, V.z - 0.2));
    for (const [x, y] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), gold)).position.set(V.x + x * (V.fw / 2 - b / 2), yc + y * (h / 2 - b / 2), V.z + 0.3);
    const pq = add(pl(3.4, 0.62, c3Flat('#ffffff', { map: nwTexPlaque('ILLUSTRATION') }), V.x, V.fy0 / 2 + 0.05, V.z + 0.9)); pq.userData.noCast = true; }
  // inside: the facade (door cut out), two columns, steps, the sign over the door, the double door (left leaf swung open, right leaf ajar)
  { const fm = c3Flat('#ffffff', { map: nwTexFacade(), transparent: true, alphaTest: 0.5 }), f = add(pl(7.1, 9.9, fm, V.x, 6.9, V.fz)); f.userData.noCast = true;
    for (const x of [-23.75, -18.25]) { add(ncy(0.36, 0.4, V.dy1 - V.dy0 + 0.4, stone, x, (V.dy0 + V.dy1 + 0.4) / 2, V.fz + 0.55, 16)); add(nb(1.0, 0.3, 1.0, stoneD, x, V.dy0 + 0.15, V.fz + 0.55)); add(nb(1.05, 0.34, 1.05, stoneD, x, V.dy1 + 0.55, V.fz + 0.55)); }
    add(nb(7.0, 0.3, 1.6, stoneD, V.x, V.fy0 + 0.9, V.fz + 0.75)); add(nb(4.6, 0.3, 1.0, stone, V.x, V.fy0 + 1.2, V.fz + 0.5));
    const sg = add(pl(4.2, 1.3, c3Flat('#ffffff', { map: nwTexMinSign() }), V.x, 9.75, V.fz + 0.16)); sg.userData.noCast = true; add(nb(4.5, 1.55, 0.12, goldD, V.x, 9.75, V.fz + 0.04));   // sign 0.1 clear of its backing (z-fight)
    const door = c3Prop('#5a3a26', { rough: 0.55 }), doorT = c3Prop('#7a5034', { rough: 0.5 }), hw = (V.dx1 - V.dx0) / 2, dh = V.dy1 - V.dy0;
    const leaf = (hx, sgn) => { const g = new THREE.Group(); g.position.set(hx, V.dy0, V.fz); G.add(g); const pn = nb(hw, dh, 0.16, door, sgn * hw / 2, dh / 2, 0); g.add(pn);
      for (const yy of [0.3, 0.68]) g.add(nb(hw * 0.7, dh * 0.26, 0.06, doorT, sgn * hw / 2, dh * yy, 0.1)); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), gold).translateX(sgn * hw * 0.85).translateY(dh * 0.48).translateZ(0.14)); return g; };
    s.leafL = leaf(V.dx0, 1); s.leafR = leaf(V.dx1, -1); }
  // the memo lectern in front of the frame: a small table, a slanted stand, the folder (canvas: ALLEGED stamp)
  { const [x, z] = NW_FOLD; add(nb(3.8, 0.24, 2.0, M.wood, x, 2.5, z)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(nb(0.18, 2.4, 0.18, M.woodD, x + sx * 1.7, 1.2, z + sz * 0.8));
    add(nb(3.5, 0.18, 0.3, M.woodD, x, 2.72, z + 0.62)); const st = add(nb(3.3, 2.3, 0.1, M.woodD, x, 3.75, z - 0.15)); st.rotation.x = -0.5;
    s.fold = canvasTex(1024, 720); s.foldM = add(pl(3.4, 2.4, c3Flat('#ffffff', { map: s.fold.t }), x, 3.82, z - 0.05)); s.foldM.rotation.x = -0.5; s.foldM.userData.noCast = true; }
  G.visible = false; }

// ---- the build
function nwBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 600), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#7ab0c8', ambI: 0.3, sky: '#c8f0f8', ground: '#a87040', key: '#fff0d8', keyI: 0.8, keyP: [-30, 50, 60], rim: '#ffc890', rimI: 0.35, rimP: [30, 30, -20] });
  const M = NW.M = { red: c3Prop('#d8342a', { rough: 0.38 }), redD: c3Prop('#a82620', { rough: 0.45 }), steel: c3Prop('#c8ccd2', { metal: 0.6, rough: 0.3 }), dark: c3Prop('#2c2c36', { rough: 0.5 }), black: c3Prop('#22222a', { rough: 0.35 }),
    steelR: c3Prop('#ffffff', { map: nwTexRoller('#b8c0c8', 'rgba(40,40,50,0.5)'), metal: 0.5, rough: 0.3 }), blanket: c3Prop('#ffffff', { map: nwTexRoller('#36405a', 'rgba(150,170,200,0.5)'), rough: 0.5 }),
    ink: NW_INK.map((c) => c3Prop('#ffffff', { map: nwTexRoller(c, 'rgba(255,255,255,0.35)'), rough: 0.25 })), brass: c3Prop('#d8a840', { metal: 0.7, rough: 0.3 }), yellow: c3Prop('#f2c41a', { rough: 0.4 }), grate: c3Prop('#5a5e6a', { metal: 0.4, rough: 0.5 }),
    cream: c3Prop('#efe2c6', { rough: 0.6 }), wood: c3Prop('#ffffff', { map: texWood(), rough: 0.55 }), woodD: c3Prop('#7a4424', { rough: 0.6 }), paper: c3Prop('#efe4c8', { rough: 0.85 }), paperB: c3Prop('#f2c8a0', { rough: 0.85 }),
    btnR: c3Prop('#e8282a', { rough: 0.3, emissive: '#801010', ei: 0.4 }), btnG: c3Prop('#2ac84a', { rough: 0.3, emissive: '#106a20', ei: 0.4 }), bulb: c3Prop('#fff4d8', { emissive: '#ffe8b8', ei: 1.4, glow: '#ffd890' }),
    keycap: c3Prop('#e8e0cc', { rough: 0.4 }), chair: c3Prop('#2f6ad8', { rough: 0.45 }), frame: c3Prop('#6a3a1e', { rough: 0.5 }), teal: c3Prop('#12545a', { rough: 0.5 }), mustard: c3Prop('#e8a83a', { rough: 0.4 }) };
  const wallM = c3Prop('#ffffff', { map: nwTexWall(), rough: 0.85 });
  scene.add(pl(2 * NW_X, NW_Z, c3Prop('#ffffff', { map: nwTexFloor(), rough: 0.55, env: 0.6 }), 0, 0, NW_Z / 2, 0, -Math.PI / 2));
  scene.add(nwWall(-NW_X, NW_X, 0, NW_H, 'z', 0, wallM)); scene.add(nwWall(0, NW_Z, 0, NW_H, 'x', -NW_X, wallM)); scene.add(nwWall(0, NW_Z, 0, NW_H, 'x', NW_X, wallM));
  { const fw = nwWall(-NW_X, NW_X, 0, NW_H, 'z', NW_Z, wallM); fw.rotation.y = Math.PI; scene.add(fw); }
  scene.add(plNC(2 * NW_X, NW_Z, c3Prop('#5a8a96', { rough: 0.8 }), 0, NW_H, NW_Z / 2, 0, Math.PI / 2));
  // skirting, crown; overhead spot pools (the fixtures are above frame)
  scene.add(nbN(2 * NW_X, 0.7, 0.3, M.teal, 0, 0.35, 0.15)); scene.add(nbN(2 * NW_X, 0.6, 0.6, M.cream, 0, NW_H - 0.3, 0.3)); for (const sx of [-1, 1]) scene.add(nbN(0.3, 0.7, NW_Z, M.teal, sx * (NW_X - 0.15), 0.35, NW_Z / 2));
  for (const [x, z] of [[-24, 26], [-8, 26], [8, 26], [24, 26], [-16, 6], [0, 6], [28, 14]]) { const l = new THREE.SpotLight('#ffe6c0', 1.1, 42, 0.8, 0.9, 1.3); l.position.set(x, NW_H - 5.5, z); l.target.position.set(x, 0, z); l.layers.enableAll(); scene.add(l); scene.add(l.target); }
  // clerestory windows above the ticker (painted sky, unlit)
  { const sky = c3Flat('#ffffff', { map: tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5aa8e8'); gr.addColorStop(1, '#bfe0f0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(i * w / 9 + 40, h * 0.6, 60, 18, 0, 0, TAU); g.fill(); }
      g.fillStyle = '#e8e2d2'; for (let i = 0; i <= 18; i++) g.fillRect(i * w / 18 - 4, 0, 8, h); g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8); g.fillRect(0, h / 2 - 3, w, 6); }, 2048, 128) }); sky.userData.c3keep = true;
    const win = pl(2 * NW_X - 2, 3.6, sky, 0, 24.6, 0.08); win.userData.noCast = true; scene.add(win); }
  // the wire ticker LED strip across the back wall
  { s.tickT = nwTexTicker(); const m = c3Flat('#ffffff', { map: s.tickT, glow: '#ff9a30' }); scene.add(nbN(2 * NW_X, 1.5, 0.5, M.black, 0, 21.4, 0.3)); const tk = pl(2 * NW_X - 0.6, 1.1, m, 0, 21.4, 0.57); tk.userData.noCast = true; scene.add(tk); }
  // floor safety lines round the press
  { const ym = c3Prop('#f2c41a', { rough: 0.6 }); for (const [w, d, x, z] of [[34, 0.35, -19, 9.6], [34, 0.35, -19, 23.4], [0.35, 14, -2.1, 16.5]]) { const p = pl(w, d, ym, x, 0.02, z, 0, -Math.PI / 2); p.userData.noCast = true; scene.add(p); } }
  nwPress(s, scene, M);
  // ---- the copy desk (x -0.5..6.6, z 13..20, top 4.6) + the first edition + the drop-stamp machine
  { const g = new THREE.Group(); scene.add(g); g.add(nb(9.9, 0.36, 7.0, M.wood, 4.45, 4.42, 16.5)); g.add(nb(9.6, 3.9, 0.25, M.woodD, 4.45, 2.2, 19.85));
    for (const x of [-0.25, 9.15]) g.add(nb(0.3, 4.2, 6.8, M.woodD, x, 2.1, 16.5));
    for (let i = 0; i < 3; i++) for (const x of [1.2, 4.45, 7.7]) { g.add(nb(2.6, 1.0, 0.1, M.wood, x, 3.4 - i * 1.1, 20.0)); g.add(nb(0.6, 0.12, 0.12, M.brass, x, 3.4 - i * 1.1, 20.08)); }
    const lp = nwLamp(M); lp.position.set(8.6, 4.6, 18.4); lp.rotation.y = 2.6; g.add(lp);
    g.add(mug('#2f6ad8', 7.4, 4.6, 19.2)); const ps = nwPaperStack(9, 1, M); ps.position.set(8.4, 4.6, 14.6); g.add(ps); const ps2 = nwPaperStack(5, 2, M); ps2.position.set(7.0, 4.6, 16.8); ps2.rotation.y = 0.4; g.add(ps2);
    const pad = nb(1.0, 0.25, 0.7, M.dark, 7.2, 4.72, 13.9); g.add(pad); g.add(nb(0.8, 0.06, 0.5, c3Prop('#b81e28', { rough: 0.7 }), 7.2, 4.86, 13.9)); }
  s.paper = canvasTex(1024, 1252); s.paperM = new THREE.Mesh(new THREE.PlaneGeometry(NW_PW, NW_PD), c3Flat('#ffffff', { map: s.paper.t })); s.paperM.rotation.x = -Math.PI / 2; s.paperM.userData.noCast = true; scene.add(s.paperM);
  { const R = RNG('nwsplat'); NW.splats = []; for (let i = 0; i < 14; i++) { const a = R.f() * TAU, d = R.r(1.7, 2.8); NW.splats.push({ a, d, x: NW_STAMP[0] + Math.cos(a) * d * (1.0 + 0.2 * Math.abs(Math.cos(a))), z: NW_STAMP[1] + Math.sin(a) * d * 0.55, r: R.r(0.06, 0.16), t: R.r(0.07, 0.16) }); } }
  NW.rotHead = 0.07;
  // the drop stamp: a red column behind the paper, a carriage + overhanging arm, the stamp head; the lever hub on the column
  { const col = new THREE.Group(); col.position.set(NW_COL[0], 4.6, NW_COL[1]); scene.add(col); col.add(nb(1.6, 0.4, 1.6, M.redD, 0, 0.2, 0)); col.add(ncy(0.38, 0.38, 9.4, M.red, 0, 4.9, 0, 18)); col.add(nb(1.0, 0.6, 1.0, M.redD, 0, 9.7, 0)); col.add(ncy(0.16, 0.16, 0.5, M.brass, 0, 10.2, 0, 10));
    col.add(ncy(0.5, 0.5, 0.5, M.brass, 0.55, 3.2, 0, 16).rotateZ(Math.PI / 2));
    s.stampG = new THREE.Group(); scene.add(s.stampG); const car = nb(1.2, 1.1, 1.2, M.redD, 0, 0, 0); s.stampG.add(car); const arm = nb(0.7, 0.55, 4.9, M.red, 0, 0.1, 2.4); s.stampG.add(arm);
    s.head = new THREE.Group(); s.head.position.set(0, 0, NW_STAMP[1] - NW_COL[1]); s.stampG.add(s.head); s.head.add(ncy(0.18, 0.18, 0.6, M.steel, 0, -0.45, 0, 10)); s.head.add(nb(3.3, 0.55, 1.35, M.red, 0, -0.95, 0)); s.head.add(nb(2.4, 0.3, 0.9, M.woodD, 0, -0.55, 0)); s.head.add(nb(3.36, 0.08, 1.41, M.redD, 0, -1.2, 0));
    s.head.add(nb(3.2, 0.2, 1.25, c3Prop('#a01620', { rough: 0.8 }), 0, -1.32, 0)); s.head.rotation.y = NW.rotHead; s.stampHub = V3(NW_COL[0] + 0.75, 4.6 + 3.2, NW_COL[1]); }
  // ---- the headline wall: cork (x 7..34, y 8.5..20.4), frame, pinned sheets, the MEGASPEED print + sign, the map + pin
  { scene.add(pl(27, 11.9, c3Prop('#ffffff', { map: nwTexCork(), rough: 0.9 }), 20.5, 14.45, 0.12)); for (const [w, h, x, y] of [[27.6, 0.4, 20.5, 8.5], [27.6, 0.4, 20.5, 20.4], [0.4, 12.3, 7.0, 14.45], [0.4, 12.3, 34.0, 14.45]]) scene.add(nb(w, h, 0.4, M.frame, x, y, 0.25));
    const HL = [['MARKETS', 'RALLY'], ['STORM HITS', 'COAST'], ['CITY BUDGET', 'VOTE'], ['RAIL STRIKE', 'ENDS'], ['NEW BRIDGE', 'OPENS'], ['HEAT WAVE', 'BREAKS'], ['DATA CENTERS', 'GROW'], ['LOCAL TEAM', 'WINS'], ['FUEL PRICES', 'DROP'], ['PORT BUSY', 'AGAIN'], ['SCHOOLS', 'REOPEN'], ['TECH SHARES', 'CLIMB'], ['MUSEUM', 'EXPANDS'], ['TRAFFIC', 'PLAN']];
    const spots = [[8.3, 18.6], [8.3, 15.4], [8.3, 12.2], [8.3, 9.9], [16.3, 19.1], [19.0, 19.0], [21.7, 19.1], [24.4, 19.0], [26.6, 15.6], [26.6, 12.6], [26.6, 9.9], [29.2, 18.4], [31.9, 18.0], [29.4, 15.2], [32.2, 14.6], [29.6, 11.6], [32.4, 11.0], [16.8, 9.7], [19.6, 9.6], [22.4, 9.8], [25.0, 9.6], [32.0, 9.7]];
    const R = RNG('nwhl'), pinM = [c3Prop('#e8282a', { rough: 0.3 }), c3Prop('#2a6ad8', { rough: 0.3 }), c3Prop('#f2c41a', { rough: 0.3 })];
    spots.forEach(([x, y], i) => { const sm = y < 10.5 ? 0.62 : 1, sh = pl(2.1 * sm, 2.6 * sm, c3Flat('#ffffff', { map: nwTexSheet(...HL[i % HL.length], i) }), x, y, 0.2 + i * 0.002, 0, 0); sh.rotation.z = R.n(0.07); sh.userData.noCast = true; scene.add(sh);
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), pinM[i % 3]); pin.position.set(x, y + 1.1 * sm, 0.32); scene.add(pin); });
    // the MEGASPEED print (x 10..15, y 10.2..16.2) and the light-box sign above it (x 9.7..15.3, y 16.6..18.4)
    const mp = pl(5, 6, c3Flat('#ffffff', { map: nwTexMegaPrint() }), 12.5, 13.2, 0.22); mp.userData.noCast = true; scene.add(mp); for (const [x, y] of [[10.3, 15.9], [14.7, 15.9]]) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), pinM[0]); p.position.set(x, y, 0.34); scene.add(p); }
    scene.add(nb(6.0, 2.1, 0.6, M.black, 12.5, 17.5, 0.42)); s.signM = c3Flat('#ffffff', { map: nwTexSignBox(), glow: '#7ad8ff' }); const sg = pl(5.7, 1.8, s.signM, 12.5, 17.5, 0.74); sg.userData.noCast = true; scene.add(sg);
    for (const x of [10.2, 14.8]) scene.add(nb(0.18, 1.0, 0.18, M.steel, x, 18.9, 0.3));
    // the world map (x 17.5..24.5, y 11..16.2) + the Singapore pin, its tag and the red string to the MEGASPEED print
    const mpm = pl(7, 5.2, c3Flat('#ffffff', { map: nwTexMap() }), 21, 15.1, 0.22); mpm.userData.noCast = true; scene.add(mpm);
    s.pin = new THREE.Group(); s.pin.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), c3Prop('#e8202a', { rough: 0.25 }))); s.pin.add(ncy(0.12, 0.2, 0.35, c3Prop('#e8202a', { rough: 0.25 }), 0, 0, -0.3, 10).rotateX(Math.PI / 2));
    s.pin.add(ncy(0.03, 0.03, 0.5, M.steel, 0, 0, -0.6, 6).rotateX(Math.PI / 2)); scene.add(s.pin);
    s.tag = pl(2.8, 0.7, c3Flat('#ffffff', { map: nwTexTag('SINGAPORE') }), NW_PIN[0] + 0.4, NW_PIN[1] - 0.95, 0.3); s.tag.userData.noCast = true; scene.add(s.tag);
    s.string = ncy(0.035, 0.035, 1, c3Prop('#d81e28', { rough: 0.6 }), 0, 0, 0, 6); scene.add(s.string);
    // reporter desks (A x 16..22, B x 24..30; z 7..10), chairs, typewriter, laptop, lamps, coffee, phone, stacks
    for (const [x, k] of [[19.1, 0], [27, 1]]) { const d = nwDesk(M, 6, 3); d.position.set(x, 0, 8.5); d.rotation.y = 0; scene.add(d); for (const cxo of k ? [0] : [-1.5, 1.5]) { const ch = nwChair(M); ch.position.set(x + cxo, 0, 5.4); scene.add(ch); }
      const lp = nwLamp(M); lp.position.set(x + (k ? 0 : 2.5), 4.18, 7.4); lp.rotation.y = 2.4; scene.add(lp); scene.add(mug(k ? '#e8a83a' : '#e2443a', x - 2.5, 4.18, 9.3));
      const st = nwPaperStack(7 + k * 3, 10 + k, M); st.position.set(x + (k ? 2.0 : -0.6), 4.18, 9.3); scene.add(st); }
    { const tw = nwTypewriter(M); tw.position.set(17.6, 4.18, 8.4); tw.rotation.y = 0; scene.add(tw); const ph = nwPhone(M); ph.position.set(21.6, 4.18, 9.2); scene.add(ph);
      const lap = new THREE.Group(); lap.add(nb(2.0, 0.12, 1.4, M.steel, 0, 0.06, 0)); const lid = nb(2.0, 1.4, 0.08, M.steel, 0, 0.75, -0.68); lid.rotation.x = -0.25; lap.add(lid); const sc = pl(1.8, 1.2, c3Flat('#ffffff', { map: nwTexScreen('#3a7ad8', '#8ac8f0') }), 0, 0.75, -0.62, Math.PI, 0.25); lap.add(sc);
      lap.position.set(20.4, 4.18, 8.5); lap.rotation.y = Math.PI; scene.add(lap); }
    // crates of chips (x 9..14, z 3.5..8.5): two side by side + one on top (lid off, chips inside); a pallet
    const cm = c3Prop('#ffffff', { map: nwTexCrate(), rough: 0.7 }), cmT = c3Prop('#c8924c', { rough: 0.7 }), crate = (x, y, z, ry, open) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
      g.add(new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.0, 2.2), [cmT, cmT, open ? c3Prop('#5a3a1e', { rough: 0.8 }) : cmT, cmT, cm, cm]).translateY(1.0));
      if (open) { const pcb = c3Prop('#1e8a4a', { rough: 0.5 }), gold = c3Prop('#e2b23a', { metal: 0.6, rough: 0.3 }); for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { const c = nb(0.5, 0.12, 0.5, pcb, -0.95 + i * 0.63, 2.0, -0.6 + j * 0.6); c.rotation.y = (i + j) * 0.3; g.add(c); g.add(nb(0.26, 0.04, 0.26, gold, -0.95 + i * 0.63, 2.08, -0.6 + j * 0.6)); } }
      scene.add(g); return g; };
    scene.add(nb(6.4, 0.4, 3.0, M.woodD, 11.0, 0.2, 6.0));
    crate(9.6, 0.4, 6.0, 0.04, false); crate(12.4, 0.4, 6.1, -0.05, false); crate(11.0, 2.4, 5.9, 0.12, true);
    { const g = crate(7.4, 0, 7.4, -0.5, false); g.scale.setScalar(0.8); }
    // the cash bundles that rain onto the crates on "billions": rest spots on the crate tops + spilled on the floor
    const cash = c3Prop('#ffffff', { map: nwTexCash(), rough: 0.6 }), cashS = c3Prop('#4a9a5a', { rough: 0.6 }), band = c3Prop('#e8d8a0', { rough: 0.6 }); s.cash = []; const RC = RNG('nwcash');
    const rest = []; for (let i = 0; i < 6; i++) rest.push([11.0 + (i % 3 - 1) * 0.85, 4.48 + Math.floor(i / 3) * 0.36, 6.3 + RC.n(0.25), RC.n(0.4)]);
    for (let i = 0; i < 4; i++) rest.push([8.8 + (i % 2) * 0.8, 2.48 + Math.floor(i / 2) * 0.36, 6.9 + RC.n(0.2), RC.n(0.5)]); for (let i = 0; i < 4; i++) rest.push([13.3 + (i % 2) * 0.7, 2.48 + Math.floor(i / 2) * 0.36, 6.9 + RC.n(0.2), RC.n(0.5)]);
    for (let i = 0; i < 8; i++) rest.push([8.6 + RC.r(0, 5.2), 0.18, 8.0 + RC.r(0, 1.8), RC.n(1.2)]);
    rest.forEach(([x, y, z, ry], i) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.34, 0.66), [cashS, cashS, cash, cash, cashS, cashS])); g.add(nb(0.24, 0.36, 0.7, band, 0, 0, 0)); scene.add(g); s.cash.push({ g, x, y, z, ry, t0: NW_T.bill - 0.1 + i * 0.016 + RC.r(0, 0.05), spin: RC.n(2.5) }); });
    // the pinning reporter's ladder-free wall: a clock, a calendar and posters on the plain wall bits
    const ck = pl(2.4, 2.4, c3Flat('#ffffff', { map: texClock() }), 3.6, 19.0, 0.2); ck.userData.noCast = true; scene.add(ck);
    const cal = pl(2.2, 2.8, c3Flat('#ffffff', { map: texMonth('OCTOBER', 31) }), 3.6, 15.0, 0.2); cal.userData.noCast = true; scene.add(cal);
    for (const [x, y, a, b, bg, fg] of [[-0.6, 11.6, 'QUIET', 'DEADLINE AT 11', '#c42a2e', '#f6ecd8'], [-33.0, 6.2, 'KEEP', 'HANDS CLEAR', '#f2c41a', '#2a2420'], [-2.4, 7.4, 'PRESS', 'ROOM', '#2f6ad8', '#f6ecd8']]) { const p = pl(2.2, 2.9, c3Flat('#ffffff', { map: nwTexPoster(a, b, bg, fg) }), x, y, 0.2); p.userData.noCast = true; scene.add(p); }
    for (const [x, z, k] of [[34.0, 3.0, 1], [-1.6, 3.0, 2], [34, 30, 3]]) { const p = nwPlant(k, 1.15); p.position.set(x, 0, z); scene.add(p); }
    // filing cabinets + a water cooler on the right; spare paper rolls + ink drums behind the press
    for (let i = 0; i < 3; i++) { scene.add(nb(2.0, 5.2, 2.2, c3Prop('#8a9aa8', { metal: 0.3, rough: 0.4 }), 35.0 - 0.0, 2.6, 12 + i * 2.3)); for (let j = 0; j < 4; j++) scene.add(nb(0.1, 0.18, 0.8, M.steel, 33.95, 1.0 + j * 1.25, 12 + i * 2.3)); }
    scene.add(nb(1.8, 3.0, 1.8, M.cream, 34.6, 1.5, 20)); scene.add(ncy(0.7, 0.7, 2.0, c3Prop('#7ac8f0', { rough: 0.1, transparent: true }), 34.6, 4.0, 20, 18));
    for (let i = 0; i < 4; i++) { const r = ncy(1.4, 1.4, 4.8, M.paper, -26 + i * 3.1, 1.4, 4.2 + (i % 2) * 0.6, 24); r.rotation.x = Math.PI / 2; scene.add(r); }
    for (let i = 0; i < 3; i++) scene.add(ncy(1.0, 1.0, 2.8, [M.ink[0], c3Prop('#2a6ad8', { rough: 0.35 }), M.ink[1]][i], -34.4 + i * 0.1, 1.4, 22 + i * 2.2, 18));
    // pipes along the back wall top + a fire extinguisher
    scene.add(nbN(2 * NW_X, 0.5, 0.5, c3Prop('#d84a24', { rough: 0.35 }), 0, 23.2 - 0.3, 0.6)); scene.add(ncy(0.35, 0.35, 1.4, M.red, -34.6, 1.6, 9.0, 14)); }
  // ---- the wall round the TV + board: world clocks (NEW YORK / LONDON / SINGAPORE), framed front pages, conduit, a horn speaker
  { [['NEW YORK', -29.0], ['LONDON', -24.0], ['SINGAPORE', -19.0]].forEach(([nm, x], i) => { const ck = new THREE.Group(); ck.position.set(x, 19.0, 0.3); scene.add(ck);
      ck.add(ncy(1.0, 1.0, 0.3, M.black, 0, 0, 0, 28).rotateX(Math.PI / 2)); const f = pl(1.76, 1.76, c3Flat('#ffffff', { map: texClock() }), 0, 0, 0.17); f.rotation.z = i * 1.3; f.userData.noCast = true; ck.add(f);
      const lb = pl(3.0, 0.58, c3Flat('#ffffff', { map: nwTexTag(nm) }), 0, -1.62, 0.05); lb.userData.noCast = true; ck.add(lb); });
    const FP = [['MOON LANDING', 'HISTORIC DAY'], ['WAR ENDS', 'CITY REJOICES'], ['NEW CENTURY', 'BEGINS']];
    FP.forEach(([a, b], i) => { const x = [-34.0, -34.0, -13.0][i], y = [17.0, 12.6, 18.4][i]; scene.add(nb(2.7, 3.3, 0.2, M.frame, x, y, 0.2)); const p = pl(2.3, 2.9, c3Flat('#ffffff', { map: nwTexSheet(a, b, 20 + i) }), x, y, 0.32); p.userData.noCast = true; scene.add(p); });
    for (const x of [-31.6, -20.9]) scene.add(ncy(0.16, 0.16, 11, M.steel, x, 16.4, 0.4, 8)); scene.add(nb(9.6, 0.3, 0.3, M.steel, -26, 11.0, 0.4));
    scene.add(nb(6.6, 0.25, 1.0, M.woodD, -17.3, 10.6, 0.6)); for (let i = 0; i < 5; i++) scene.add(nb(0.5, 1.3 + (i % 2) * 0.3, 0.9, [M.ink[0], M.redD, M.mustard, M.ink[1], M.teal][i], -19.6 + i * 0.6, 11.4 + (i % 2) * 0.15, 0.6)); }
  // ---- the wall TV (x -30..-22, y 12.6..17.6) and the CHARGES FILED board (x -20..-14.6, y 12.4..16.4)
  { scene.add(nb(8.4, 5.3, 0.5, M.black, -26, 14.3, 0.5)); s.tv = canvasTex(800, 500); const sc = pl(8.0, 5.0, c3Flat('#ffffff', { map: s.tv.t, glow: '#8ab0ff' }), -26, 14.3, 0.78); sc.userData.noCast = true; scene.add(sc); scene.add(nb(1.0, 1.0, 0.8, M.dark, -26, 14.3, 0.2));
    scene.add(nb(5.8, 4.4, 0.4, M.frame, -17.3, 14.4, 0.3)); s.board = canvasTex(640, 480); const bd = pl(5.4, 4.0, c3Flat('#ffffff', { map: s.board.t }), -17.3, 14.4, 0.52); bd.userData.noCast = true; scene.add(bd); }
  // ---- the ink splash sprites
  { const dot = tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#c41c26'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.42, 0, TAU); g.fill(); }, 64, 64); s.splat = NW.splats.map(() => { const m = spritePlane(scene, dot, 1, 1, 8); return m; }); }
  s.rod = ncy(0.11, 0.11, 1, M.steel, 0, 0, 0, 8); s.knob = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), c3Prop('#22222a', { rough: 0.3 })); scene.add(s.rod); scene.add(s.knob); c3Layer(s.rod, C3.L_FOCUS); c3Layer(s.knob, C3.L_FOCUS);
  // ---- rev4: Alice's name card on a wooden easel beside her (x 18.2, z 11.2), the spy vignette, the TV spokesperson (drawn into the TV canvas)
  { const g = new THREE.Group(), cy = 9.7; g.position.set(12.3, 0, 11.4); g.rotation.y = 0.08; scene.add(g);   // tall easel in front of the crates, left of her (FOCUS layer: drawn over the cards behind it)
    for (const [x, rz] of [[-1.3, -0.07], [1.3, 0.07]]) { const l = nb(0.22, cy + 1.3, 0.22, M.woodD, x, (cy + 1.3) / 2, -0.3); l.rotation.z = rz; g.add(l); } { const l = nb(0.2, cy + 1.2, 0.2, M.woodD, 0, (cy + 1.2) / 2, -1.2); l.rotation.x = 0.2; g.add(l); }
    g.add(nb(3.9, 0.22, 0.5, M.woodD, 0, cy - 1.27, 0.12)); g.add(nb(3.9, 2.42, 0.1, M.frame, 0, cy, 0.02).rotateX(-0.08));
    const c = pl(3.7, 2.24, c3Flat('#ffffff', { map: nwTexNameCard() }), 0, cy, 0.09); c.rotation.x = -0.08; c.userData.noCast = true; g.add(c); c3Layer(g, C3.L_FOCUS); s.nameCard = g; }
  nwVignette(s, scene, M); s.spk = c3ToonChar(CAST.NWspk);
  for (const k of ['NWed', 'NWop', 'NWcat', 'NWr1', 'NWr2', 'NWalice', 'NWagA', 'NWagB']) toonPerson(s, k);
  haze(scene, '#9ac8d0', 0.0024);
  c3Env(scene, { top: '#e8f8f8', mid: '#4a9aa0', bot: '#6a4a30' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.8, scale: 0.5, inkSet: false, focusK: 1, bounce: ['#c8f0f8', '#c08050', 0.1], lights: [[0.6, 7.0, 14.6, '#ffd8a0', 1.0, 16], [21.3, 6.6, 7.8, '#ffd8a0', 0.9, 16], [29.3, 6.6, 7.8, '#ffd8a0', 0.9, 16], [-26, 15, 4, '#8ab0ff', 0.8, 18], [12.5, 17.5, 3, '#8ae0ff', 0.6, 14], [-20, 12, 24, '#fff0d8', 0.7, 30],
    [-24, 13, 9, '#ffd8a8', 1.3, 20], [-30, 10, 27, '#ffe0b8', 1.1, 22], [2, 11, 24, '#ffe0b8', 0.8, 18], [-20, 9, 34, '#ffe0b8', 0.9, 14], [-21, 6.5, 27.2, '#ffd8a0', 0.7, 6]] });   // rev4: the vignette (front fill + the doorway)   // fix3: warm fills on the TV/board wall, the reel end and the copy desk (p50 up to the Ricks mid band)
  nwOcc(s);
  return s;
}
// depth-only FOCUS stand-ins (after c3SetLook): desks that hide seated legs, the copy desk + its paper, the catwalk rails
function nwOcc(s) { const M = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); M.userData.c3keep = true;
  const box = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M); m.position.set(x, y, z); Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); s.scene.add(m); return m; };
  box(6, 4.2, 3, 19.1, 2.1, 8.5); box(1.9, 1.3, 1.4, 17.6, 4.8, 8.6); box(2.0, 1.4, 1.4, 20.4, 4.9, 8.5);   // desk A + the typewriter / laptop blocks
  box(9.9, 4.6, 7.0, 4.45, 2.3, 16.5);   // copy desk + paper
  box(17.0, 0.2, 0.2, -22.0, 10.4, 18.7); box(17.0, 0.2, 0.2, -22.0, 11.4, 18.7);   // catwalk rails
  // rev4 vignette: the case back + plinth (hide the press operator behind it), the facade round the door, the right door leaf, the memo lectern
  const V = NW_VG, vo = [box(V.fw, V.fy1, 0.3, V.x, V.fy1 / 2, 24.3), box(V.fw + 0.8, V.fy0, 4.8, V.x, V.fy0 / 2, 26.5),
    box(V.dx0 - (V.x - 3.55), 9.9, 0.12, (V.dx0 + V.x - 3.55) / 2, 6.9, V.fz), box(V.x + 3.55 - V.dx1, 9.9, 0.12, (V.dx1 + V.x + 3.55) / 2, 6.9, V.fz),
    box(V.dx1 - V.dx0, 11.85 - V.dy1, 0.12, V.x, (V.dy1 + 11.85) / 2, V.fz), box(V.dx1 - V.dx0, V.dy0 - 1.95, 0.12, V.x, (V.dy0 + 1.95) / 2, V.fz), box(3.8, 2.6, 2.0, NW_FOLD[0], 1.3, NW_FOLD[1]),
    box(V.b + 0.2, V.fy1 - V.fy0, 0.5, V.x - V.fw / 2 + V.b / 2 + 0.1, (V.fy0 + V.fy1) / 2, V.z), box(V.b + 0.2, V.fy1 - V.fy0, 0.5, V.x + V.fw / 2 - V.b / 2 - 0.1, (V.fy0 + V.fy1) / 2, V.z), box(V.fw, V.b + 0.2, 0.5, V.x, V.fy1 - V.b / 2 - 0.1, V.z)];   // + the frame bars
  for (const [lf, sx] of [[s.leafR, -1], [s.leafL, 1]]) { const m = box(1.5, V.dy1 - V.dy0, 0.18, 0, 0, 0); s.scene.remove(m); m.position.set(sx * 0.75, (V.dy1 - V.dy0) / 2, 0); lf.add(m); vo.push(m); }
  s.vgOcc = vo;
}
const NW_get = () => NW.s ||= nwBuild();
SETS.news = NW_get;

// ---- the press motion: web travel s(t) (12 u/s, then the second edition decelerates to a stop on "further" (rev4: the camera leaves it on "According"))
const NW_V0 = 12, NW_DEC = NW_T.stop - NW_T.ed2, NW_D = NW_V0 * NW_DEC / 3;
const nwS = (t) => t < NW_T.ed2 ? NW_V0 * (t - 11) : NW_V0 * (NW_T.ed2 - 11) + NW_D * EZ.o3((t - NW_T.ed2) / NW_DEC);
const nwPageY = (t) => NW_PAGE_Y - (nwS(NW_T.stop) - nwS(t));
// the stamp head bottom height: rest high (clear of the reading view), anticipation up, slam on "relation", recoil, back up
function nwHeadY(t) { const T = NW_T; if (t < T.up) return 10.4; if (t < T.up + 0.16) return lerp(10.4, 11.3, EZ.o3(nwE(T.up, T.up + 0.16, t))); if (t < T.hit - 0.08) return 11.3;
  if (t < T.hit) return lerp(11.3, NW_PAPER[1], EZ.i2(nwE(T.hit - 0.08, T.hit, t))); if (t < T.hit + 0.16) return NW_PAPER[1] + 0.06 * Math.sin(Math.PI * nwE(T.hit + 0.03, T.hit + 0.16, t)) * (t > T.hit + 0.03 ? 1 : 0);
  if (t < T.hit + 0.3) return lerp(NW_PAPER[1], 8.6, EZ.o3(nwE(T.hit + 0.16, T.hit + 0.3, t))); return lerp(8.6, 10.4, EZ.io(nwE(T.hit + 0.3, T.hit + 0.56, t))); }

// ---- the continuous camera (absolute seconds). Legs: whip-in pan right onto the reel -> track alongside the press ->
// push + crane up to the copy desk, land on the headline ("Alice Huang") -> orbit drift -> snap push on the stamp (+kick)
// -> swing up-right to the MEGASPEED sign -> lateral orbit to the map pin -> crane down-left to the crates as the cash
// rains -> orbit -> pull back left to the tower foot -> crane up the tower with the second edition, dutch in on
// "recruited" -> push on "spy agency" -> whip left to the wall TV, push on "smear" -> drift right to the board on
// "charged" -> whip out right.
CAMSEQ.news = [   // rev4 (user: "the settle makes people dizzy"): travelling legs between subjects, ONE one-directional drift per hold (+ a mid key so it never stalls)
  [11.12, [-31.0, 12.0, 41.0], [-44.0, 8.5, 15.0], 46, -4],   // whip in from the left
  [11.30, [-30.0, 12.2, 40.2], [-31.0, 8.6, 15.0], 46, -2],
  [11.95, [-21.0, 13.6, 39.0], [-20.0, 9.8, 15.0], 46, 2],   // track right along the units, rising
  [12.62, [-10.5, 11.6, 36.0], [-5.5, 6.6, 16.0], 45, 3],   // ...dipping to the slot as the paper slides out
  [13.25, [-3.0, 9.8, 31.5], [2.2, 5.4, 16.4], 44, 1],   // low from the left: the paper settles on the desk
  [13.62, [-5.2, 16.4, 31.0], [1.8, 6.4, 15.8], 44, -2],   // crane UP + swing back left ("named")
  [14.02, [6.4, 17.4, 29.2], [4.6, 6.8, 15.3], 44, -3],   // orbit right + push: land on the headline ("Alice")
  [14.98, [5.7, 16.5, 28.1], [4.5, 6.6, 15.5], 43, -2.4],   // HOLD: one slow push-in on the headline
  [15.10, [5.3, 15.6, 27.2], [4.3, 6.2, 15.9], 42.5, -2.0],
  [15.28, [4.3, 12.8, 24.6], [3.7, 5.1, 16.7], 40, -1.2],   // snap push on the stamp hit (+kick)
  [15.54, [4.05, 12.3, 23.85], [3.62, 5.02, 16.78], 39.6, -0.7],   // the push keeps creeping in ("relation")
  [16.34, [13.6, 11.2, 27.4], [13.8, 13.6, 3.0], 50, 2.4],   // travel up-right (from the "ALICE HUANG" headline): land on ALICE + her name card + the MEGASPEED sign
  [16.66, [13.85, 11.25, 27.8], [14.0, 13.6, 3.0], 50.2, 2.65],
  [16.98, [14.1, 11.3, 28.2], [14.2, 13.6, 3.0], 50.4, 2.9],   // HOLD: slow pull-back
  [17.14, [17.4, 11.3, 28.6], [18.2, 14.2, 3.0], 51, 3.2],   // orbit right: the map + Singapore pin, Alice still in frame
  [17.55, [17.6, 11.1, 29.0], [18.3, 14.1, 3.0], 51.25, 3.4],
  [17.95, [17.8, 10.9, 29.4], [18.4, 14.0, 3.0], 51.5, 3.6],   // HOLD: slow pull-back + crane down
  [18.32, [13.4, 13.4, 34.4], [15.6, 4.2, 6.6], 54, -1],   // crane down-left onto the crates as the cash rains
  [18.88, [13.25, 13.7, 34.75], [15.6, 4.3, 6.6], 54.25, -1.4],
  [19.45, [13.1, 14.0, 35.1], [15.6, 4.4, 6.6], 54.5, -1.8],   // HOLD: one slow crane up + pull-back over the pile
  [20.30, [-3.5, 6.5, 36.4], [-8.0, 7.5, 19.2], 46, -1],   // travel left to the tower foot: the second edition rises
  [20.64, [-4.15, 8.0, 36.2], [-8.05, 8.85, 19.3], 45.5, 0.0],
  [20.98, [-4.8, 9.5, 36.0], [-8.1, 10.2, 19.4], 45, 1],   // HOLD: crane up with the page
  [21.28, [-15.0, 8.0, 46.2], [-17.8, 6.0, 26.0], 53.5, 1.6],   // "According to the paper": truck left + pull back...
  [21.55, [-19.6, 6.8, 45.0], [-21.0, 4.6, 27.0], 53, 2.0],   // ...settling in on the ILLUSTRATION case + the memo
  [22.23, [-19.75, 6.6, 44.1], [-21.0, 4.55, 26.8], 52.5, 2.3],
  [22.90, [-19.9, 6.4, 43.2], [-21.0, 4.5, 26.6], 52, 2.6],   // HOLD: slow push (ALLEGED lands on "believes")
  [23.50, [-20.8, 7.5, 37.4], [-21.0, 6.6, 25.8], 47, 3.2],   // dive into the frame on "recruited"
  [24.06, [-20.9, 7.4, 36.85], [-21.0, 6.55, 25.65], 46.5, 3.4],
  [24.62, [-21.0, 7.3, 36.3], [-21.0, 6.5, 25.5], 46, 3.6],   // HOLD: creep in on the door: the agents peek
  [24.86, [-21.8, 14.2, 31.6], [-25.0, 14.0, 2.0], 45, 3],   // crane up and over the frame...
  [25.06, [-22.8, 15.2, 25.2], [-25.6, 14.4, 0.4], 44, 1.5],   // ...onto the wall TV ("China")
  [25.71, [-23.8, 14.95, 24.0], [-25.75, 14.375, 0.4], 43.0, 0.75],
  [26.36, [-24.8, 14.7, 22.8], [-25.9, 14.35, 0.4], 42, 0],   // HOLD: one slow push on the spokesperson ("smear")
  [26.92, [-17.6, 13.6, 21.8], [-17.3, 14.3, 0.3], 40, -2],   // track right + push on the board ("charged")
  [27.12, [-17.7, 13.7, 21.3], [-17.3, 14.3, 0.3], 39.5, -2.4],
  [27.28, [-17.4, 14.6, 23.2], [-4.0, 14.4, 2.0], 42, 3],   // whip out right
];

// fix3: the press end (reel/units) and the TV + board wall read dark (p50 0.37-0.44): lift them into the Ricks mid band
// (p50 0.46-0.58) with exposure, not a lift; ramps sit inside camera moves (the slot dip, the whip to the TV)
const nwExp = (t) => 1 + 0.3 - 0.12 * EZ.io(nwE(12.2, 12.9, t)) - 0.18 * EZ.io(nwE(13.5, 14.1, t)) + 0.42 * EZ.io(nwE(24.74, 25.04, t));
// ---- the take
function nwFrame(t) {
  const s = NW_get(), T = NW_T; hideAll(s); hideGrips(s); if (s.nwd) for (const k in s.nwd) s.nwd[k].visible = false; const cam = seqCam(s, 'news', t);
  // the press: rollers + reel + gears turn with the web, the webs scroll
  const sv = nwS(t); for (const [r, rad] of s.roll) r.rotation.z = -sv / rad; for (const [g, rad, d] of s.gears) g.rotation.z = -d * sv / (rad * 2.2); s.topRoll.children[0].rotation.y = sv / 0.8;
  s.stripT.offset.x = -sv / 4.3; s.webGT.offset.y = -sv / 16.6;
  { const y = nwPageY(t); s.page2.visible = y > -NW_PGH / 2; s.page2.position.y = y; }
  // the first edition: slides out of the tower slot onto the copy desk, settles; the stamp mark + splats land on "relation"
  { const k = EZ.o3(nwE(T.slide, T.slide + 0.62, t)), x = lerp(-6.9, NW_PAPER[0], k), set = t > T.slide + 0.62 ? 0.05 * Math.sin((t - T.slide - 0.62) * 20) * Math.exp(-(t - T.slide - 0.62) * 8) : 0;
    s.paperM.visible = t >= T.slide; s.paperM.position.set(x, NW_PAPER[1] + Math.abs(set) * 0.5, NW_PAPER[2]); s.paperM.rotation.z = set * 0.3;
    const st = t >= T.hit; redraw(s.paper, st ? 'st' : 'base', (g, w, h) => { nwPage(g, w, h, { seed: 5, head: [['NVIDIA CHIEF CLOSE TO', 0.075], ['BUSINESSWOMAN', 0.085], ['ALICE HUANG', 0.1]], date: 'OCTOBER 29, 2026', photo: true }); if (st) nwStampMark(g, w, h, NW.splats); }); }
  // the drop stamp
  { const y = nwHeadY(t), sq = t >= T.hit && t < T.hit + 0.12 ? 1 - 0.25 * Math.sin(Math.PI * nwE(T.hit, T.hit + 0.12, t)) : 1; s.stampG.position.set(NW_COL[0], y + 1.32 + 0.45, NW_COL[1]); s.head.scale.set(1 + (1 - sq) * 0.4, sq, 1 + (1 - sq) * 0.3); }
  s.splat.forEach((m, i) => { const sp = NW.splats[i], k = nwE(T.hit, T.hit + sp.t, t); if (k <= 0 || k >= 1) { m.visible = false; return; } const d = sp.d * EZ.o2(k);
    popAt(m, 1, [NW_STAMP[0] + Math.cos(sp.a) * d * (1.0 + 0.2 * Math.abs(Math.cos(sp.a))), NW_PAPER[1] + 0.1 + 0.9 * Math.sin(Math.PI * k), NW_STAMP[1] + Math.sin(sp.a) * d * 0.55], cam, sp.r * 1.3 * (1.2 - 0.4 * k)); });
  // the MEGASPEED light box flickers on just before its word, the pin drops on "Singapore", the string runs to the print
  { const f = t < T.mega - 0.16 ? 0.35 : t < T.mega ? ([1, 0.4, 1, 0.5, 1][Math.floor((t - (T.mega - 0.16)) * 30) % 5] || 1) : 1; s.signM.color.setScalar(f); }
  { const k = nwE(T.sing - 0.12, T.sing, t), [px, py] = NW_PIN; s.pin.visible = k > 0; s.pin.position.set(px, py + 2.2 * (1 - EZ.i2(k)), 0.62 + 1.4 * (1 - EZ.i2(k))); const sq = t > T.sing && t < T.sing + 0.14 ? 1 - 0.3 * Math.sin(Math.PI * nwE(T.sing, T.sing + 0.14, t)) : 1; s.pin.scale.set(1 / Math.sqrt(sq), 1 / Math.sqrt(sq), sq);
    const tg = EZ.back(nwE(T.sing + 0.04, T.sing + 0.24, t)); s.tag.visible = tg > 0.01; s.tag.scale.setScalar(Math.max(0.01, tg));
    const ks = EZ.io(nwE(T.sing + 0.12, T.sing + 0.5, t)), A = V3(px, py, 0.45), B = V3(14.7, 15.9, 0.45), E = A.clone().lerp(B, ks); s.string.visible = ks > 0.01;
    if (s.string.visible) { s.string.position.copy(A).add(E).multiplyScalar(0.5); s.string.scale.set(1, A.distanceTo(E), 1); s.string.quaternion.setFromUnitVectors(V3(0, 1, 0), E.clone().sub(A).normalize()); } }
  // cash rains onto the crates on "billions"
  for (const c of s.cash) { const d = t - c.t0; if (d < 0) { c.g.visible = false; continue; } c.g.visible = true; const fall = 7.5, T0 = Math.sqrt(2 * fall / 70);
    if (d < T0) { c.g.position.set(c.x, c.y + fall - 35 * d * d, c.z); c.g.rotation.set(c.spin * (T0 - d), c.ry + c.spin * (T0 - d) * 0.6, 0); }
    else { const b = d - T0, hop = b < 0.18 ? 0.25 * Math.sin(Math.PI * b / 0.18) : 0; c.g.position.set(c.x, c.y + hop, c.z); c.g.rotation.set(0, c.ry, 0); } }
  // screens: the TV (idle news -> the empty briefing podium -> the quote card), the board flip on "charged", the ticker
  { const q = t < T.tv ? 'i' + Math.floor(t * 8) : 'p' + Math.round(t * 30); redraw(s.tv, q, (g, w, h) => nwDrawTV(g, w, h, t));   // rev4: the spokesperson talks: redrawn every frame
    const f = nwE(T.chg - 0.1, T.chg + 0.04, t); redraw(s.board, 'b' + Math.round(f * 12), (g, w, h) => nwDrawBoard(g, w, h, f)); s.tickT.offset.x = t * 0.035; }
  // rev4: the spy vignette case (in from 20.5 s, off screen): the door leaves open on "recruited", ALLEGED stamps the memo on "believes"
  { const on = t >= 20.5; s.vg.visible = on; for (const m of s.vgOcc) m.visible = on;
    s.leafL.rotation.y = -lerp(0.35, 1.25, EZ.back(nwE(T.door, T.door + 0.3, t))); s.leafR.rotation.y = lerp(0.12, 0.85, EZ.o3(nwE(T.door + 0.06, T.door + 0.36, t)));
    const k = nwE(T.alleg, T.alleg + 0.14, t); redraw(s.fold, 'f' + Math.round(k * 6), (g, w, h) => nwDrawFolder(g, w, h, k)); }
  // ---- people
  nwPeople(s, cam, t);
  COLOR.news.exp = nwExp(t);   // fix3: exposure per stretch (own COLOR entry, set every frame like set-board), eased inside camera moves
  c3Render(s.scene, cam, { bg: '#1a3a3a', bgBlur: 1.2, glow: 0.3, glowBlur: 12 });
}
// the gripping hand drawn over the lever knob: a disc in the card's limb colour + light (trash-library dpDot; the kit's
// gripDot pastes a square of the card, which showed her chin round the knob)
function nwDot(s, who, nm) { const p = s.p[who], h = c3ToonHandWorld(p, nm); s.nwd ||= {}; const key = who + nm;
  let m = s.nwd[key]; if (!m) { m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: T3.limb, depthTest: false, depthWrite: false, toneMapped: false })); m.renderOrder = 30; Object.assign(m.userData, { noInk2: true, noCast: true, noShade: true }); c3Layer(m, C3.L_FOCUS); s.scene.add(m); s.nwd[key] = m; }
  if (!h || !p.g.visible) { m.visible = false; return; }
  const a = V3(0, 0, 0), b = V3(0, 1000 * p.U, 0); p.root.localToWorld(a); p.root.localToWorld(b); a.project(s.cam); b.project(s.cam); const px = Math.round(Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2) / 50) * 50;
  const lk = Math.max(1, Math.min(1.8, 1 + (1000 - px) / 1000 * 0.8)), r = 6.6 * (2 * T3.a * (p.o.headK ?? 1) / 100) * lk ** 0.8 * p.U;
  m.visible = true; m.scale.setScalar(r); m.position.copy(h).addScaledVector(s.cam.position.clone().sub(h).normalize(), 0.05); m.quaternion.copy(s.cam.quaternion); m.material.color.set(T3.limb).multiply(p.mat.color); }
function nwPeople(s, cam, t) { const T = NW_T;
  // the copy editor: reads the paper as it lands, brows up on "Alice Huang", yanks the stamp lever on "relation"
  { const x = 7.4, z = 12.0, lev = t < T.up ? 0.4 + 0.03 * Math.sin(t * 2.2) : t < T.hit - 0.08 ? lerp(0.4, 1, EZ.o3(nwE(T.up, T.up + 0.16, t))) : t < T.hit ? lerp(1, 0, EZ.i2(nwE(T.hit - 0.08, T.hit, t))) : t < T.hit + 0.3 ? 0 : lerp(0, 0.4, EZ.io(nwE(T.hit + 0.3, T.hit + 0.6, t)));   // 1 = lever up, 0 = slammed
    const hand = (side) => ({ h: [side === 'R' ? 0.42 + 0.06 * lev : -0.12 + 0.04 * lev, 0.66 - 0.98 * lev], pole: [1, 0.6], front: side === 'L', over: side === 'L', hand: 'grip' });
    const ex = [[0, 'neutral'], [12.9, 'thinking'], [13.6, 'skeptical'], [T.land, 'surprised'], [14.55, 'skeptical'], [T.up, 'determined'], [T.hit, 'strain'], [15.48, 'smug'], [16.6, 'happy'], [18.32, 'surprised'], [18.9, 'grin']];
    const jolt = t > T.hit && t < T.hit + 0.3 ? Math.sin(Math.PI * nwE(T.hit, T.hit + 0.3, t)) : 0;
    pose(s, 'NWed', t, x, z, { look: t < 15.7 ? [3.0, 16.6] : t < 18.2 ? [12, 2] : [11.5, 6], expr: ex, gaze: t < T.up ? [-0.5, 0.55] : t < 15.7 ? [-0.4, 0.4] : [0.2, -0.2], hand: { R: hand('R'), L: hand('L') }, lean: -0.08 * (t > 13.0 && t < T.up ? 1 : 0) - 0.06 * jolt, squash: 0.25 * jolt });
    const hR = c3ToonHandWorld(s.p.NWed, 'R'), hL = c3ToonHandWorld(s.p.NWed, 'L');
    if (hR && hL) { const H = hR.clone().add(hL).multiplyScalar(0.5), A = s.stampHub; s.rod.visible = s.knob.visible = true; s.rod.position.copy(A).add(H).multiplyScalar(0.5); s.rod.scale.set(1, A.distanceTo(H), 1); s.rod.quaternion.setFromUnitVectors(V3(0, 1, 0), H.clone().sub(A).normalize());
      s.knob.position.copy(H); nwDot(s, 'NWed', 'R'); nwDot(s, 'NWed', 'L'); } }
  // the press operator at the console: watches the units, pulls the run lever, turns to the paper as it slides out
  pose(s, 'NWop', t, -22.0, 22.9, { look: t < 11.75 ? [-22, 15] : t < 14.6 ? [-4, 17] : [-12, 15], expr: [[0, 'determined'], [11.62, 'strain'], [11.86, 'excited'], [12.6, 'happy'], [14.1, 'smug'], [19.7, 'surprised'], [20.6, 'happy']], gaze: [0.2, 0.2],
    hand: { R: [[0, 'desk'], [11.62, { h: [0.42, -0.1], pole: [1, 0.5], hand: 'grip' }], [11.86, { h: [0.3, 0.5], pole: [1, 0.5], hand: 'grip' }], [12.4, 'hip']], L: [[0, 'desk'], [12.2, 'point'], [12.9, 'hip']] } });
  // the pressman on the catwalk end: clipboard, watches the web; points at the second edition on "recruited", shock on "spy"
  pose(s, 'NWcat', t, t < 20 ? -14.6 : NW_CATX, 22.6, { look: t < 12.5 ? [-20, 15] : t < 19.8 ? [2, 17] : [-8, 19], expr: [[0, 'neutral'], [21.0, 'thinking'], [T.rec, 'surprised'], [T.spy, 'shock'], [25.0, 'worried']], prop: { L: 'paper' },
    hand: { L: 'hold', R: [[0, 'down'], [T.rec, { h: [0.62, -0.42], pole: [0.4, 1], hand: 'point' }], [24.6, 'down']] }, gaze: t > 20.4 ? [0.3, -0.8] : [0, 0] });
  // reporters: typing / on the phone / pinning a headline; heads up at the MEGASPEED sign, then the cash on "billions"
  const typ = (k) => (Math.sin(t * 21 + k) > 0 ? 0.05 : 0);
  pose(s, 'NWr1', t, 17.6, 6.0, { mode: 'sit', sit: 1, seat: 3.0, look: t < T.mega ? [18, 20] : t < 17.5 ? [12.5, 2] : t < T.bill - 0.15 ? [20, 24] : [11, 6], expr: [[0, 'thinking'], [T.mega, 'surprised'], [17.0, 'thinking'], [17.5, 'skeptical'], [T.bill, 'shock'], [19.2, 'excited']],
    gaze: t < T.mega ? [0, 0.5] : t < 17.5 ? [0, -0.6] : t < T.bill ? [0, 0] : [0, 0.2], hand: t < T.bill ? { L: { h: [-0.1, 0.6 + typ(0)], pole: [1, 0.3], front: true }, R: { h: [-0.1, 0.6 + typ(2)], pole: [1, 0.3], front: true } } : { L: [[0, 'desk'], [T.bill, 'up']], R: [[0, 'desk'], [T.bill, 'up']] } });
  pose(s, 'NWr2', t, 20.6, 6.0, { mode: 'sit', sit: 1, seat: 3.0, look: t < T.bill - 0.15 ? [17.6, 7] : [11, 6], expr: [[0, 'talk'], [T.bill, 'surprised'], [19.0, 'grin']], talk: t < T.bill ? 0.7 : 0, prop: { R: 'phone' },
    hand: { R: { h: [0.05, -0.12], pole: [0.5, 1], front: true, hand: 'grip' }, L: [[0, 'desk'], [T.bill, 'up']] } });
  // rev4 ALICE HUANG: calm businesswoman at the MEGASPEED wall (coffee in hand), a glance up at the sign on its word, never shocked
  pose(s, 'NWalice', t, 15.8, 10.4, { look: t < T.mega ? [15, 30] : t < 16.95 ? [12.5, 2] : [15, 30], expr: [[0, 'smile'], [T.mega, 'happy'], [17.1, 'smile'], [T.bill, 'neutral'], [19.0, 'smile']], prop: { R: 'coffee' },
    hand: { R: 'hold', L: 'down' }, gaze: t < T.mega ? [0, 0] : t < 16.95 ? [-0.2, -0.6] : [0, 0] });
  // rev4 the vignette's agents (only while the case is shown): hidden behind the door jambs, they lean out on "China's" / "spy"
  if (t >= 20.5) { const V = NW_VG, a = EZ.back(nwE(T.peekA, T.peekA + 0.24, t)), b = EZ.back(nwE(T.spy, T.spy + 0.24, t));
    if (t >= T.peekA - 0.03) pose(s, 'NWagA', t, lerp(V.dx0 - 1.2, V.dx0 + 0.55, a), V.az, { y: V.dy0, look: [-21, 40], expr: [[0, 'skeptical'], [24.32, 'smug']], lean: 0.16 * a, gaze: [0.4, 0], hand: { L: 'down', R: 'down' } });
    if (t >= T.spy - 0.03) pose(s, 'NWagB', t, lerp(V.dx1 + 1.2, V.dx1 - 1.0, b), V.az - 0.1, { y: V.dy0, look: [-21, 40], expr: [[0, 'angry'], [24.4, 'smug']], lean: -0.14 * b, gaze: [-0.4, 0], hand: { L: 'down', R: 'down' } }); }
}
for (const id of ['s05', 's06', 's07', 's08', 's09']) { SHOT_FN[id] = (t) => nwFrame(t); SNAPS[id] = 'free'; }
