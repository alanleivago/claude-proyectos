// =====================================================================
//  SHOTS — the shots of reference 3 in reference time R; 0.5 s dissolves at every boundary; a speed readout and a
//  clock in the corner. Cars always flow, dots bob, verges change colour per segment, the camera never stops.
// =====================================================================
S3.hl = true;
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));
const SPR = (R, a, d = 0.45) => (R < a ? 0 : EZ.back(seg(R, a, a + d)));
let HUD = {}, ZM = 1;
function sceneMain() {
  const R = (RNOW = refT(TT));
  const run = (key, alpha) => { resetWorld(); HUD = { kmh: null, clock: null }; const D = []; SHOT_FN[key](R, D); renderWorld(alpha); return { D, hud: HUD }; };
  let i = SHOTS_R.findIndex(([, a, b]) => R >= a && R < b); if (i < 0) i = SHOTS_R.length - 1; const XF = 0.25; let out;
  const nb = SHOTS_R[i + 1], pb = SHOTS_R[i - 1];
  if (nb && R > nb[1] - XF) { const u = EZ.io(seg(R, nb[1] - XF, nb[1] + XF)), A = run(SHOTS_R[i][0], 1), B = run(nb[0], u); out = u < 0.5 ? A : B; }
  else if (pb && R < SHOTS_R[i][1] + XF) { const u = EZ.io(seg(R, SHOTS_R[i][1] - XF, SHOTS_R[i][1] + XF)), A = run(pb[0], 1), B = run(SHOTS_R[i][0], u); out = u < 0.5 ? A : B; }
  else out = run(SHOTS_R[i][0], 1);
  out.D.forEach((f) => f());
  const h = out.hud, hud = () => {
    if (h.kmh != null) s3Readout(String(h.kmh), 'km/h', h.kmhLabel ?? 'EN VIVO', 1, { x: 60, y: 1340, bar: h.kmhC ?? C_GREEN });
    if (h.clock) { ctx.save(); screen(); ctx.font = s3Font(44); ctx.fillStyle = 'rgba(22,19,15,0.86)'; ctx.beginPath(); ctx.roundRect(60, 250, 170, 74, 10); ctx.fill(); ctx.fillStyle = '#f4f1ea'; ctx.fillText(h.clock, 80, 302); ctx.restore(); }
    s3Note('ILUSTRATIVO', 0.8, { x: 880, y: 250 }); s3Caption(TT); };
  if (DEFER) DEFER.push(hud); else hud();
}
// ---- 2D helpers
// the Google Maps pin in a white tile (drawn in code), top-left, as the reference opens
function mapsLogo(a, x = 60, y = 240, sz = 116) {
  if (a <= 0) return; const sp = EZ.back(clamp(a)); ctx.save(); screen(); ctx.translate(x + sz / 2, y + sz / 2); ctx.scale(sp, sp); ctx.globalAlpha = clamp(a);
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 14; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(-sz / 2, -sz / 2, sz, sz, sz * 0.24); ctx.fill(); ctx.shadowBlur = 0;
  const r = sz * 0.24, cy = -sz * 0.1; ctx.beginPath(); ctx.arc(0, cy, r, Math.PI * 0.82, Math.PI * 0.18); ctx.lineTo(0, cy + r * 2.1); ctx.closePath(); ctx.save(); ctx.clip();
  ctx.translate(0, cy); ctx.rotate(-0.7); [['#4285f4', -1, -1], ['#ea4335', 0, -1], ['#fbbc04', 0, 0], ['#34a853', -1, 0]].forEach(([c, qx, qy]) => { ctx.fillStyle = c; ctx.fillRect(qx * r * 3, qy * r * 3, r * 3, r * 3); }); ctx.rotate(0.7); ctx.translate(0, -cy);
  ctx.restore(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, cy, r * 0.38, 0, TAU); ctx.fill(); ctx.restore();
}
function tag(v, dx, dy, title, sub, a, c = S3.white, size = 34, align = 'left') {
  if (a <= 0) return; c = S3.white; const [x, y] = P2(v); if (align === 'left' && x + dx > 640) { align = 'right'; dx = Math.min(dx, -40); }
  ctx.save(); ctx.font = s3Font(size); let tw = ctx.measureText(title).width; if (sub) { ctx.font = s3Font(Math.round(size * 0.6)); tw = Math.max(tw, ctx.measureText(sub).width + 4); } ctx.restore();
  const lo = align === 'right' ? 60 + tw : align === 'center' ? 60 + tw / 2 : 60, hi = align === 'right' ? 1020 : align === 'center' ? 1020 - tw / 2 : 1020 - tw;
  const lx = clamp(x + dx, lo, Math.max(lo, hi)), ly = clamp(y + dy, 400, 1180);
  s3Leader(lx + (align === 'right' ? 8 : align === 'center' ? 0 : -8), ly + 10, x, y, '#16130f', a * 0.85, 1, 3);
  { const bx = align === 'right' ? lx - tw - 14 : align === 'center' ? lx - tw / 2 - 14 : lx - 14, bh = sub ? size * 1.95 : size * 1.4; ctx.save(); screen(); ctx.globalAlpha = a * 0.88; ctx.fillStyle = '#16130f'; ctx.beginPath(); ctx.roundRect(bx, ly - size * 0.95, tw + 28, bh, 8); ctx.fill(); ctx.restore(); }
  s3Label(lx, ly, title, sub, { alpha: a, color: c, size, align });
}
// a dark chip with white text, centred at (x, y)
function chip(str, x, y, a, size = 30, o = {}) { if (a <= 0) return; ctx.save(); screen(); ctx.font = s3Font(size); const w = ctx.measureText(str).width + size; x = clamp(x, w / 2 + 50, W - w / 2 - 50); const sp = o.spring ? EZ.back(clamp(a)) : 1; ctx.translate(x, y); ctx.scale(sp, sp); ctx.globalAlpha = clamp(a);
  ctx.fillStyle = o.bg ?? 'rgba(22,19,15,0.88)'; ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.85, w, size * 1.4, 8); ctx.fill(); if (o.bar) { ctx.fillStyle = o.bar; ctx.fillRect(-w / 2 + 6, -size * 0.6, 5, size * 0.9); }
  ctx.fillStyle = o.fg ?? '#f4f1ea'; ctx.textAlign = 'center'; ctx.fillText(str, 0, size * 0.1 + 2); ctx.restore(); }
const chipAt = (v, str, a, size = 28, o = {}) => { const [x, y] = P2(v); chip(str, clamp(x, 120, 960), clamp(y, 380, 1200), a, size, o); };
// a stacked list of chips at the top-left (each appears at its time)
function list(items, R, x = 70, y = 420, size = 30) { items.forEach(([str, t0, done], k) => { const a = K(R, t0, 0.3); if (a <= 0) return; ctx.save(); screen(); ctx.font = s3Font(size); const w = ctx.measureText(str).width + size * (done ? 2.2 : 1.2);
  ctx.globalAlpha = a; ctx.fillStyle = 'rgba(22,19,15,0.88)'; ctx.beginPath(); ctx.roundRect(x, y + k * size * 1.7 - size, w, size * 1.4, 8); ctx.fill(); ctx.fillStyle = '#f4f1ea'; ctx.fillText(str, x + size * 0.5, y + k * size * 1.7 + 2);
  if (done && R > done) { ctx.strokeStyle = C_GREEN; ctx.lineWidth = 5; const cx = x + w - size * 1.1, cy = y + k * size * 1.7 - size * 0.25; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 8, cy + 9); ctx.lineTo(cx + 24, cy - 10); ctx.stroke(); } ctx.restore(); }); }
function link(A, B, u, a, c = '#1e2026', w = 3, dash = [12, 9]) { if (u <= 0 || a <= 0) return; const [x0, y0] = P2(A), [x1, y1] = P2(B); ctx.save(); screen(); ctx.globalAlpha = clamp(a); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.lineDashOffset = -RNOW * 30; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, clamp(u)), lerp(y0, y1, clamp(u))); ctx.stroke(); ctx.restore(); }
// a bracket along the road edge from s0 to s1 (2D)
function bracket(s0, s1, off, a, label) { if (a <= 0) return; const pts = []; for (let k = 0; k <= 20; k++) pts.push(P2(roadPt(lerp(s0, s1, k / 20), off, 0.3)));
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#16130f'; ctx.lineWidth = 5; ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); for (const k of [0, 20]) { const [x, y] = pts[k]; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fillStyle = '#16130f'; ctx.fill(); } ctx.restore();
  if (label) chip(label, clamp(pts[10][0] + 120, 200, 900), clamp(pts[10][1], 400, 1180), a, 28); }
const P = (s, off, y) => roadPt(s, off, y).toArray();
const jamCols = (k, a = 300, b = 430) => Array.from({ length: NSEG }, (_, i) => { const m = segMid(i), w = m > a - 20 && m < b + 20; return !w ? C_GREEN : k < 0.45 ? C_RED : k < 0.85 ? C_ORANGE : C_GREEN; });
const kmh = (v) => Math.round(v * 3.6);
function heroAt(s, off = MED + LANE * 1.5, a = 1) { const g = g3(), f = rf(s), p = f.p.clone().addScaledVector(f.n, off); g.hero.visible = true; g.hero.position.set(p.x, 0.02, p.z); g.hero.rotation.y = Math.atan2(f.t.x, f.t.z); g.heroDot.visible = a > 0; g.heroDot.position.set(p.x, 5.6, p.z); g.heroDot.scale.setScalar(1 + 0.08 * Math.sin(RNOW * 4)); return V3(p.x, 5.6, p.z); }
const nearCar = (s, dir = 1) => CARPOS.reduce((b, c, i) => (c && c.dir === dir && c.phone && Math.abs(c.s - s) < Math.abs((CARPOS[b]?.s ?? 1e9) - s) ? i : b), -1);
const dotOf = (i) => V3(CARPOS[i].p.x, 5.2, CARPOS[i].p.z);
// graph: shortest paths by distance or by time (street 30 km/h, highway 80 km/h, ×jam on the highway); 100 units = 1 km
function gEdgeLen(e) { const N = g3().NODES; return N[e[0]].distanceTo(N[e[1]]); }
function gMin(e, jam = 1) { return (gEdgeLen(e) / 100) / (e[2] === 'h' ? 75 / jam : 28) * 60; }
function gPath(a, b, w) { const n = GRAPH.nodes.length, d = Array(n).fill(1e9), pv = Array(n).fill(-1), done = Array(n).fill(false); d[a] = 0;
  for (;;) { let u = -1; for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || d[i] < d[u])) u = i; if (u < 0 || d[u] >= 1e9) break; done[u] = true;
    GRAPH.edges.forEach((e) => { const v = e[0] === u ? e[1] : e[1] === u ? e[0] : -1; if (v < 0) return; const nd = d[u] + w(e); if (nd < d[v]) { d[v] = nd; pv[v] = u; } }); }
  const p = []; for (let v = b; v >= 0; v = pv[v]) p.unshift(v); return p; }
const gPathLen = (p) => p.slice(1).reduce((s, v, k) => s + g3().NODES[p[k]].distanceTo(g3().NODES[v]), 0);
const gPathMin = (p, jam = 1) => p.slice(1).reduce((s, v, k) => s + gMin(GRAPH.edges.find((e) => (e[0] === p[k] && e[1] === v) || (e[1] === p[k] && e[0] === v)), jam), 0);
function drawRoute(p, u, a, c = '#2f6fd1', w = 9) { if (u <= 0 || a <= 0) return; const N = g3().NODES, GX = g3().GX, pts = p.map((k) => P2(V3(N[k].x + GX, 0.6, N[k].z))), tot = pts.slice(1).reduce((s, q, k) => s + Math.hypot(q[0] - pts[k][0], q[1] - pts[k][1]), 0);
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); let left = tot * clamp(u); ctx.moveTo(...pts[0]);
  for (let k = 1; k < pts.length && left > 0; k++) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], d = Math.hypot(x1 - x0, y1 - y0), t = Math.min(1, left / d); ctx.lineTo(lerp(x0, x1, t), lerp(y0, y1, t)); left -= d; } ctx.stroke(); ctx.restore(); }
const gnode = (k, y = 0.6) => { const N = g3().NODES; return V3(N[k].x + g3().GX, y, N[k].z); };
const gmid = (e, y = 0.6) => gnode(e[0], y).lerp(gnode(e[1], y), 0.5);
function graphOn(o = {}) { const g = g3(); g.world.visible = false; [g.bodyI, g.cabI, g.dotI, g.haloI, g.parked].forEach((m) => (m.visible = false)); g.gw.visible = true; g.scene.fog.near = 400; g.scene.fog.far = 1400; sunAt(V3(g.GX, 0, 0));
  g.key.shadow.camera.left = g.key.shadow.camera.bottom = -320; g.key.shadow.camera.right = g.key.shadow.camera.top = 320; g.key.shadow.camera.updateProjectionMatrix();
  g.edgeMeshes.forEach((m, k) => { const e = GRAPH.edges[k]; m.material.color.set(e[2] === 'h' ? (o.hiw ?? C_GREEN) : '#9ea3ab'); });
  g.nodeM.forEach((n, k) => n.scale.setScalar(o.nodes ? EZ.back(clamp(o.nodes * 16 - k)) || 0.001 : 1)); }
function roadOn() { const g = g3(); g.key.shadow.camera.left = g.key.shadow.camera.bottom = -140; g.key.shadow.camera.right = g.key.shadow.camera.top = 140; g.key.shadow.camera.updateProjectionMatrix(); }
const START = 12, END = 3;

const SHOT_FN = {
  open(R, D) {
    roadOn(); setCars(R + 40, { jamK: 0.3 }); setVerges(jamCols(0.3)); sunAt(V3(...P(330, 0, 0)));
    setCam(camKeys(R, [[0, P(140, -90, 150), P(380, 0, 0), 40], [3.3, P(165, -80, 135), P(395, 0, 0), 40]]), 0.4);
    D.push(() => { mapsLogo(K(R, 0.0, 0.4)); const i = nearCar(330); if (i >= 0) tag(dotOf(i), 120, -220, 'cada punto = un celular', null, K(R, 0.3, 0.3)); });
    HUD.kmh = 25; HUD.kmhC = C_RED; HUD.kmhLabel = 'NORMAL: 100';
  },
  nocam(R, D) {
    roadOn(); setCars(R + 40, { jamK: 0.3, dots: 0 }); setVerges(jamCols(0.3)); sunAt(V3(...P(250, 0, 0)));
    setCam(camKeys(R, [[3.3, P(200, 5, 13), P(262, 2, 5), 44], [6.7, P(214, 6, 14), P(275, 1, 5), 44]]), 0.3);
    D.push(() => { tag(V3(...P(250, -4, 9.5)), -60, -200, 'aquí no hay cámaras', null, K(R, 3.7, 0.3)); tag(V3(...P(262, 15.5, 0.6)), 40, 140, 'ni sensores en la vía', null, KO(R, 4.7, 6.4, 0.3)); tag(V3(...P(285, 6, 3)), 60, -380, 'y nadie lo reportó', null, KO(R, 5.6, 6.5, 0.3)); });
    HUD.kmh = 25; HUD.kmhC = C_RED; HUD.kmhLabel = 'NORMAL: 100';
  },
  how(R, D) {
    roadOn(); setCars(R, { dots: 0 }); sunAt(V3(...P(110, 0, 0)));
    setCam(camKeys(R, [[6.7, P(100, 0.5, 60), P(112, 0, 0), 40], [8.5, P(104, 0.5, 52), P(114, 0, 0), 40]]), 0.2);
    HUD.kmh = 100;
  },
  gps(R, D) {
    roadOn(); setCars(R, { dots: 0 }); const s = 110 + VF * (R - 8.5), d = heroAt(s), g = g3(); sunAt(d);
    g.sats.forEach((st, k) => { st.visible = true; st.position.copy(roadPt(s + 40 + k * 25, -30 + k * 30, 70 + k * 8)); st.rotation.set(0.3, R * 0.2 + k, 0.2); });
    setCam(camKeys(R, [[8.5, [d.x + 14, 4, d.z + 26], [d.x, 22, d.z - 30], 46], [12.7, [d.x + 10, 6, d.z + 22], [d.x, 26, d.z - 34], 46]]), 0.3);
    D.push(() => { g.sats.forEach((st, k) => link(st.position, d, EZ.io(seg(R, 9.4 + k * 0.3, 10.4 + k * 0.3)), 0.8, '#1e2026', 3)); tag(g.sats[1].position, 40, -120, 'satélites GPS', null, K(R, 9.2, 0.3)); tag(d, 80, 120, 'tu celular', 'calcula dónde está', K(R, 10.2, 0.3)); });
    HUD.kmh = 100;
  },
  follow(R, D) {
    roadOn(); setCars(R); const s = 110 + VF * (R - 8.5), d = heroAt(s); sunAt(d);
    const f = rf(s); setCam({ pos: [d.x - f.t.x * 34 + f.n.x * 10, 30, d.z - f.t.z * 34 + f.n.z * 10], tgt: [d.x + f.t.x * 20, 0, d.z + f.t.z * 20], fov: 42 }, 0.3);
    D.push(() => { tag(d, 80, -160, 'tu ubicación', null, K(R, 13.2, 0.3) * (1 - seg(R, 15.0, 15.3))); tag(d, 80, -160, 'qué tan rápido cambia', null, K(R, 15.4, 0.3)); });
    HUD.kmh = 100;
  },
  spacing(R, D) {
    roadOn(); setCars(R); const s = 110 + VF * (R - 8.5), d = heroAt(s); sunAt(d); const pts = []; for (let k = 1; k <= 4; k++) if (R - 17.7 > k * 0.4) pts.push(roadPt(s - VF * k * 1.0, MED + LANE * 1.5, 0)); setFixes(pts, 0.9);
    const f = rf(s); setCam({ pos: [d.x + f.n.x * 40, 34, d.z + f.n.z * 40 - f.t.z * 10], tgt: [d.x - f.t.x * 30, 0, d.z - f.t.z * 30], fov: 42 }, 0.3);
    D.push(() => { if (pts.length > 1) { const [a, b] = [pts[0], pts[1]]; chipAt(a.clone().lerp(b, 0.5).setY(1), 'separación = velocidad', K(R, 18.3, 0.3), 30); } });
    HUD.kmh = 100;
  },
  one(R, D) {
    roadOn(); setCars(R); const s0 = 520, v = lerp(VF, 6, EZ.io(seg(R, 19.7, 21.5))), s = s0 + (R < 21.5 ? VF * (R - 19.7) - (VF - v) * (R - 19.7) / 2 : 30); const d = heroAt(s0 + 20 * EZ.o2(seg(R, 19.7, 22.6)) + 10); sunAt(d);
    setCam(camKeys(R, [[19.7, [d.x - 40, 38, d.z + 30], [d.x, 0, d.z], 40], [23.0, [d.x - 34, 34, d.z + 24], [d.x, 0, d.z], 40]]), 0.3);
    D.push(() => { tag(d, 80, -150, 'un celular va lento', null, KO(R, 20.1, 22.6, 0.3)); tag(V3(...P(520 + 70, EDGE + 1.6, 0.3)), -60, 300, 'el tramo sigue verde', null, KO(R, 21.3, 22.6, 0.3)); });
    HUD.kmh = 100;
  },
  pulled(R, D) {
    roadOn(); setCars(R); const sp = 128, d = heroAt(sp, EDGE + 1.8); sunAt(d); const lot = roadPt(140, 44, 0), lotDot = V3(lot.x + 4, 5.2, lot.z - 6);
    const g = g3(); g.dotI.visible = true; ring(lotDot.clone().setY(0.2), 2.2 + 0.3 * Math.sin(R * 3), K(R, 24.6, 0.3), { c: '#1fb8c8' });
    setCam(camKeys(R, [[23.0, P(90, 10, 70), P(138, 28, 0), 42], [26.7, P(95, 20, 80), P(142, 34, 0), 42]]), 0.3);
    D.push(() => { tag(d, -60, -170, 'se orilló', null, K(R, 23.3, 0.3)); chipAt(lotDot, '● en el estacionamiento', K(R, 24.6, 0.3), 28); });
    HUD.kmh = 100;
  },
  off(R, D) {
    roadOn(); setCars(R); const p = roadPt(180, EDGE + 11, 0); sunAt(p); disc(0, p, 9 * K(R, 27.0, 0.5), 1); setFixes([p], 1.3);
    setCam(camKeys(R, [[26.7, P(180, 6, 70), P(181, 6, 0), 40], [29.2, P(184, 6, 64), P(185, 6, 0), 40]]), 0.2);
    D.push(() => tag(p.clone().setY(1.2), -80, -200, 'la ubicación cae fuera del camino', null, K(R, 27.2, 0.3), S3.white, 30));
    HUD.kmh = 100;
  },
  hundreds(R, D) {
    roadOn(); const n = setCars(R, { dots: EZ.io(seg(R, 29.2, 31.5)) }); sunAt(V3(...P(300, 0, 0)));
    setCam(camKeys(R, [[29.2, P(200, -40, 70), P(380, 0, 0), 42], [33.1, P(215, -45, 80), P(400, 0, 0), 42]]), 0.3);
    D.push(() => chip(`${n} celulares en esta vía`, CX, 470, K(R, 30.4, 0.3), 34));
    HUD.kmh = 100;
  },
  segments(R, D) {
    roadOn(); setCars(R); sunAt(V3(...P(320, 0, 0))); const k0 = segOf(380), a = segMid(k0) - L / NSEG / 2, b = segMid(k0) + L / NSEG / 2;
    setCam(camKeys(R, [[33.1, P(240, 45, 115), P(340, 0, 0), 42], [37.4, P(250, 48, 120), P(350, 0, 0), 42]]), 0.3);
    D.push(() => bracket(a, b, EDGE + 4.5, K(R, 34.0, 0.4), 'un tramo del camino'));
    HUD.kmh = 100;
  },
  speeds(R, D) {
    roadOn(); setCars(R); sunAt(V3(...P(320, 0, 0)));
    setCam(camKeys(R, [[37.4, P(250, 48, 120), P(350, 0, 0), 42], [40.6, P(258, 50, 124), P(360, 0, 0), 42]]), 0.3);
    D.push(() => { [101, 94, 92, 98].forEach((v, k) => chipAt(roadPt(segMid(segOf(260) + k), EDGE + 6, 0), `${v} km/h`, K(R, 37.7 + k * 0.4, 0.3), 28, { bar: C_GREEN })); });
    HUD.kmh = 98;
  },
  usual(R, D) {
    roadOn(); setCars(R); sunAt(V3(...P(330, 0, 0)));
    setCam(camKeys(R, [[40.6, P(268, 20, 14), P(330, 0, 0), 44], [44.8, P(280, 22, 15), P(342, 0, 0), 44]]), 0.3);
    D.push(() => chip('normal aquí: 100 km/h', CX, 470, K(R, 41.2, 0.3), 32));
    HUD.kmh = 100; HUD.kmhLabel = 'NORMAL: 100';
  },
  slow(R, D) {
    roadOn(); const k = lerp(1, 0.3, EZ.io(seg(R, 45.2, 47.6))); setCars(R, { jamK: k }); setVerges(jamCols(k)); sunAt(V3(...P(360, 0, 0)));
    setCam(camKeys(R, [[44.8, P(280, 22, 15), P(342, 0, 0), 44], [47.6, P(300, 26, 22), P(370, 0, 0), 44], [51.8, P(306, 28, 26), P(378, 0, 0), 44]]), 0.4);
    const v = Math.round(lerp(100, 25, EZ.io(seg(R, 45.2, 47.6))));
    D.push(() => { const a = SPR(R, 47.6, 0.5); if (a > 0) { ctx.save(); screen(); ctx.translate(CX, 560); ctx.scale(a, a); ctx.fillStyle = 'rgba(22,19,15,0.9)'; ctx.beginPath(); ctx.roundRect(-250, -110, 500, 190, 14); ctx.fill(); ctx.fillStyle = C_RED; ctx.fillRect(-230, -90, 10, 150);
      ctx.fillStyle = '#f4f1ea'; ctx.font = s3Font(130); ctx.fillText('25', -200, 40); ctx.font = s3Font(44); ctx.fillText('km/h', -20, 40); ctx.font = s3Font(24); ctx.fillStyle = S3.note; ctx.fillText('NORMAL AQUÍ: 100', -20, -50); ctx.restore(); }
      if (R > 49.2) chip('el tráfico se frenó', CX, 1180, K(R, 49.2, 0.3), 34); });
    HUD.kmh = v; HUD.kmhC = v < 45 ? C_RED : v < 85 ? C_ORANGE : C_GREEN; HUD.kmhLabel = 'NORMAL: 100';
  },
  raw(R, D) {
    roadOn(); setCars(R, { dots: 0 }); sunAt(V3(...P(250, 0, 0))); const Rn = RNG('raw'), pts = []; for (let k = 0; k < 26; k++) { const s = 200 + k * 4.5, off = Rn.r(-1, 1) * EDGE + Rn.n(6); if (Rn.f() < EZ.io(seg(R, 51.9, 53.4)) * 1.4) pts.push(roadPt(s, off, 0)); } setFixes(pts, 1.1);
    setCam(camKeys(R, [[51.8, P(170, -20, 40), P(250, 0, 0), 42], [55.1, P(178, -22, 44), P(256, 0, 0), 42]]), 0.3);
    D.push(() => { if (pts[3]) tag(pts[3].clone().setY(1.2), -40, -170, 'posiciones GPS crudas', null, K(R, 52.2, 0.3)); });
    HUD.kmh = 100;
  },
  drift(R, D) {
    roadOn(); setCars(R, { dots: 0 }); sunAt(V3(...P(250, 0, 0))); const spots = [roadPt(225, EDGE + 6, 0), roadPt(250, 4, 0), roadPt(300, -EDGE - 4, 0)];
    spots.forEach((p, k) => { disc(k, p, (10 + 1.2 * Math.sin(R * 2 + k)) * K(R, [56.5, 57.6, 59.0][k], 0.4), 1); }); setFixes(spots.map((p, k) => p.clone().add(V3(Math.sin(R + k) * 3, 0, Math.cos(R * 1.3 + k) * 3))), 1.1);
    setCam(camKeys(R, [[55.1, P(190, 30, 60), P(262, 0, 0), 42], [61.3, P(200, 34, 66), P(272, 0, 0), 42]]), 0.3);
    D.push(() => list([['junto a edificios altos', 56.5], ['bajo el paso elevado', 57.6], ['en un cruce complicado', 59.0]], R));
    HUD.kmh = 100;
  },
  which(R, D) {
    roadOn(); setCars(R, { dots: 0 }); const s = 330, p = roadPt(s, (EDGE + 24) / 2 + 1, 0); sunAt(p); disc(0, p, 9 * K(R, 61.6, 0.4), 1); setFixes([p], 1.3);
    setCam(camKeys(R, [[61.3, P(300, 20, 24), P(345, 18, 0), 44], [65.8, P(306, 21, 26), P(352, 18, 0), 44]]), 0.3);
    D.push(() => { tag(V3(...P(350, 9, 0.3)), -40, -200, '¿la autopista?', null, K(R, 62.4, 0.3)); tag(V3(...P(356, 28, 0.3)), 30, -180, '¿la lateral?', null, K(R, 63.4, 0.3)); });
    HUD.kmh = 100;
  },
  mm(R, D) {
    roadOn(); setCars(R, { dots: 0 }); const s = 330 + 6 * (R - 65.8), p = roadPt(s, (EDGE + 24) / 2 + 1, 0); sunAt(p); disc(0, p, 9, 1); setFixes([p], 1.3);
    setCam(camKeys(R, [[65.8, P(310, 18, 34), P(345, 18, 0), 44], [68.2, P(314, 18, 30), P(350, 18, 0), 44]]), 0.3);
    D.push(() => { chip('map matching', CX, 520, SPR(R, 66.2, 0.45), 52, { spring: false }); s3Text('emparejar con el mapa', CX, 600, { size: 30, color: S3.note, align: 'center', alpha: K(R, 66.6, 0.3) }); });
    HUD.kmh = 100;
  },
  compare(R, D) {
    roadOn(); setCars(R, { dots: 0 }); const s = 345 + 26 * (R - 68.2), p = roadPt(s, (EDGE + 24) / 2 + 1, 0); sunAt(p); disc(0, p, 8, 1); setFixes([p], 1.3);
    setCam(camKeys(R, [[68.2, P(325, 16, 26), P(360, 16, 0), 44], [73.1, P(440, 16, 30), P(490, 16, 0), 44]]), 0.3);
    D.push(() => { list([['posición', 68.5, 69.0], ['dirección', 69.4, 69.9], ['velocidad: 96 km/h', 70.3, 70.8], ['forma del camino', 72.0, 72.6]], R); const [x, y] = P2(p.clone().setY(1)); const f = rf(s), q = P2(p.clone().addScaledVector(f.t, 14).setY(1));
      if (R > 69.4) { ctx.save(); screen(); ctx.globalAlpha = K(R, 69.4, 0.3); ctx.strokeStyle = '#16130f'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(q[0], q[1]); ctx.stroke(); const an = Math.atan2(q[1] - y, q[0] - x); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - 20 * Math.cos(an - 0.5), q[1] - 20 * Math.sin(an - 0.5)); ctx.lineTo(q[0] - 20 * Math.cos(an + 0.5), q[1] - 20 * Math.sin(an + 0.5)); ctx.fill(); ctx.restore(); } });
    HUD.kmh = 96;
  },
  fit(R, D) {
    roadOn(); setCars(R); const s = 460 + 26 * (R - 73.1), u = EZ.io(seg(R, 73.6, 74.8)), p = roadPt(s, lerp((EDGE + 24) / 2 + 1, MED + LANE * 3.5, u), 0); sunAt(p); disc(0, p, 8 * (1 - u), 1); setFixes([p], 1.3);
    setCam(camKeys(R, [[73.1, P(440, 30, 36), P(480, 10, 0), 44], [76.8, P(500, 34, 40), P(560, 4, 0), 44]]), 0.3);
    D.push(() => tag(p.clone().setY(1.2), 60, -200, 'mejor encaje: la autopista', null, K(R, 74.6, 0.3)));
    HUD.kmh = 96;
  },
  many(R, D) {
    roadOn(); setCars(R); sunAt(V3(...P(200, 0, 0))); const i = nearCar(190);
    setCam(camKeys(R, [[76.8, P(130, -40, 60), P(220, 0, 0), 42], [82.6, P(140, -50, 74), P(240, 0, 0), 42]]), 0.3);
    D.push(() => { if (i >= 0) tag(dotOf(i), 80, -170, 'un celular solo: 45 km/h', null, KO(R, 77.2, 79.6, 0.3)); const a = K(R, 79.8, 0.3); if (a > 0) chip('31 celulares: 98 km/h', CX, 470, a, 34, { bar: C_GREEN }); });
    HUD.kmh = 98;
  },
  estimate(R, D) {
    roadOn(); setCars(R, { jamK: 0.6 }); setVerges(jamCols(0.6)); sunAt(V3(...P(320, 0, 0)));
    setCam(camKeys(R, [[82.6, P(230, 45, 118), P(335, 0, 0), 42], [86.4, P(240, 48, 124), P(348, 0, 0), 42]]), 0.3);
    D.push(() => { [[segOf(260), 98, C_GREEN], [segOf(320), 72, C_ORANGE], [segOf(390), 70, C_ORANGE], [segOf(470), 95, C_GREEN]].forEach(([k, v, c], j) => chipAt(roadPt(segMid(k), j % 2 ? -EDGE - 8 : EDGE + 8, 0), `${v} km/h`, K(R, 83.0 + j * 0.4, 0.3), 28, { bar: c })); });
    HUD.kmh = 72; HUD.kmhC = C_ORANGE;
  },
  hist(R, D) {
    roadOn(); setCars(R, { jamK: 0.4 }); setVerges(jamCols(0.4)); sunAt(V3(...P(350, 0, 0)));
    setCam(camKeys(R, [[86.4, P(300, 26, 18), P(360, 0, 0), 44], [92.0, P(312, 28, 20), P(372, 0, 0), 44]]), 0.3);
    D.push(() => { chip('lo normal a esta hora', CX, 470, K(R, 88.8, 0.3), 30); chip('en vivo: 40 km/h', CX, 540, K(R, 89.6, 0.3), 30, { bar: C_RED }); });
    HUD.kmh = 40; HUD.kmhC = C_RED;
  },
  night(R, D) {
    roadOn(); const g = g3(); setCars(R * 0.4, { count: 70, dots: 1 }); setVerges(jamCols(0.3)); sunAt(V3(...P(350, 0, 0)));
    g.scene.background.set('#0f141d'); g.scene.fog.color.set('#0f141d'); g.scene.fog.near = 60; g.scene.fog.far = 300; g.hemi.intensity = 0.28; g.hemi.color.set(0x8aa0d0); g.key.intensity = 0.18;
    setCam(camKeys(R, [[92.0, P(330, 24, 10), P(370, 2, 0), 46], [97.3, P(338, 25, 11), P(380, 2, 0), 46]]), 0.3);
    D.push(() => { const a = SPR(R, 93.0, 0.5); if (a > 0) { ctx.save(); screen(); ctx.translate(CX, 560); ctx.scale(a, a); ctx.fillStyle = 'rgba(22,19,15,0.9)'; ctx.beginPath(); ctx.roundRect(-200, -100, 400, 170, 14); ctx.fill(); ctx.fillStyle = '#f4f1ea'; ctx.font = s3Font(110); ctx.fillText('40', -170, 30); ctx.font = s3Font(40); ctx.fillText('km/h', 0, 30); ctx.font = s3Font(24); ctx.fillStyle = S3.note; ctx.fillText('EN VIVO · MEDIANOCHE', -170, -60); ctx.restore(); }
      chip('terrible', CX, 700, K(R, 95.2, 0.3), 34, { bar: C_RED }); });
    HUD.kmh = 40; HUD.kmhC = C_RED; HUD.kmhLabel = 'NORMAL: 100'; HUD.clock = '00:00';
  },
  rush(R, D) {
    roadOn(); setCars(R, { jamK: 0.4 }); setVerges(Array(NSEG).fill(C_GREEN)); sunAt(V3(...P(350, 0, 0)));
    setCam(camKeys(R, [[97.3, P(300, 26, 22), P(362, 0, 0), 44], [105.5, P(320, 30, 30), P(390, 0, 0), 44]]), 0.3);
    D.push(() => { chip('normal en hora pico', CX, 470, K(R, 97.8, 0.3), 30, { bar: C_GREEN }); list([['ahora mismo: 40 km/h', 100.0], ['lo usual a esta hora: 40 km/h', 102.4, 103.0]], R, 70, 600); });
    HUD.kmh = 40; HUD.kmhC = C_GREEN; HUD.kmhLabel = 'USUAL: 40'; HUD.clock = '17:30';
  },
  travel(R, D) {
    roadOn(); setCars(R); sunAt(V3(...P(300, 0, 0)));
    setCam(camKeys(R, [[105.5, P(190, 50, 130), P(340, 0, 0), 42], [111.7, P(205, 55, 150), P(365, 0, 0), 42]]), 0.3);
    D.push(() => { for (let k = 2; k < 9; k++) chipAt(roadPt(segMid(k), k % 2 ? EDGE + 16 : -EDGE - 16, 0), k === 5 ? '2 min' : '1 min', KO(R, 106.2 + (k - 2) * 0.35, 111.2, 0.3), 26, { spring: true }); });
    HUD.kmh = 100;
  },
  graph(R, D) {
    graphOn({ nodes: EZ.o2(seg(R, 112.0, 115.0)) }); const GX = g3().GX;
    setCam(camKeys(R, [[111.7, [GX + 5, 520, 40], [GX, 0, 0], 50], [118.6, [GX + 5, 500, 30], [GX, 0, 0], 50]]), 0.2);
    D.push(() => { tag(gnode(5), 60, -140, 'cruce = nodo', null, K(R, 115.0, 0.3)); tag(gmid(GRAPH.edges[4]), 40, 140, 'tramo = arista', null, K(R, 116.9, 0.3)); });
    HUD.kmh = null;
  },
  weights(R, D) {
    graphOn(); const GX = g3().GX, tm = R > 122.1;
    setCam(camKeys(R, [[118.6, [GX + 5, 500, 30], [GX, 0, 0], 50], [124.8, [GX + 5, 480, 30], [GX, 0, 0], 50]]), 0.2);
    D.push(() => GRAPH.edges.forEach((e, k) => { if (k % 2) return; const km = (gEdgeLen(e) / 100).toFixed(1).replace('.', ','), mn = Math.max(1, Math.round(gMin(e))); chipAt(gmid(e), tm ? `${mn} min` : `${km} km`, K(R, tm ? 122.2 : 119.0 + k * 0.03, 0.3), 24, { bar: tm ? '#2f6fd1' : null }); }));
  },
  search(R, D) {
    graphOn(); const GX = g3().GX, fast = gPath(START, END, (e) => gMin(e));
    setCam(camKeys(R, [[124.8, [GX - 160, 240, 330], [GX + 10, 0, -10], 44], [129.2, [GX - 120, 220, 310], [GX + 20, 0, -20], 44]]), 0.3);
    D.push(() => { drawRoute(fast, EZ.io(seg(R, 125.4, 128.0)), 1); fast.forEach((n, k) => chipAt(gnode(n, 3), String(k + 1), K(R, 125.4 + k * 0.35, 0.25), 24)); });
  },
  shortest(R, D) {
    graphOn(); const GX = g3().GX, fast = gPath(START, END, (e) => gMin(e)), short = gPath(START, END, gEdgeLen);
    setCam(camKeys(R, [[129.2, [GX - 120, 220, 310], [GX + 20, 0, -20], 44], [132.5, [GX - 100, 260, 300], [GX + 20, 0, -20], 44]]), 0.3);
    D.push(() => { drawRoute(short, 1, 0.9, '#8d8780', 7); drawRoute(fast, 1, 1); const f = (p) => `${(gPathLen(p) / 100).toFixed(1).replace('.', ',')} km · ${Math.round(gPathMin(p))} min`;
      chip('la más corta: ' + f(short), CX, 470, K(R, 129.5, 0.3), 30, { bar: '#8d8780' }); chip('la más rápida: ' + f(fast), CX, 540, K(R, 130.4, 0.3), 30, { bar: '#2f6fd1' }); });
  },
  change(R, D) {
    roadOn(); const k = lerp(1, 0.3, EZ.io(seg(R, 132.8, 134.6))); setCars(R, { jamK: k }); setVerges(jamCols(k)); sunAt(V3(...P(360, 0, 0)));
    setCam(camKeys(R, [[132.5, P(325, -24, 24), P(375, 0, 0), 44], [135.9, P(332, -26, 26), P(385, 0, 0), 44]]), 0.3);
    D.push(() => chipAt(roadPt(370, EDGE + 6, 0), k < 0.5 ? '3 min' : '1 min', 1, 30, { bar: k < 0.5 ? C_RED : C_GREEN }));
    HUD.kmh = Math.round(lerp(100, 25, 1 - (k - 0.25) / 0.75)); HUD.kmhC = k < 0.5 ? C_RED : C_GREEN;
  },
  reroute(R, D) {
    const jam = R > 137.0 ? 3.2 : 1; graphOn({ hiw: jam > 1 ? C_RED : C_GREEN }); const GX = g3().GX, fast0 = gPath(START, END, (e) => gMin(e)), fast1 = gPath(START, END, (e) => gMin(e, 3.2));
    setCam(camKeys(R, [[135.9, [GX - 100, 260, 300], [GX + 20, 0, -20], 44], [142.6, [GX - 60, 300, 260], [GX + 20, 0, -20], 44]]), 0.3);
    D.push(() => { drawRoute(fast0, 1, R < 139.4 ? 1 : 0.35, R < 139.4 ? '#2f6fd1' : '#8d8780'); if (R > 139.4) drawRoute(fast1, EZ.io(seg(R, 139.4, 141.4)), 1);
      chip(`autopista: ${Math.round(gPathMin(fast0, jam))} min`, CX, 470, K(R, 137.2, 0.3), 30, { bar: jam > 1 ? C_RED : C_GREEN }); chip(`por calles: ${Math.round(gPathMin(fast1, 3.2))} min`, CX, 540, K(R, 139.6, 0.3), 30, { bar: '#2f6fd1' }); });
  },
  colors(R, D) {
    roadOn(); const k = lerp(1, 0.3, EZ.io(seg(R, 143.4, 147.6))); setCars(R, { jamK: k, dots: 0.5 }); setVerges(jamCols(k)); sunAt(V3(...P(360, 0, 0)));
    setCam(camKeys(R, [[142.6, P(300, 2, 170), P(380, 0, 0), 40], [150.5, P(320, 2, 160), P(390, 0, 0), 40]]), 0.2);
    D.push(() => { mapsLogo(KO(R, 142.8, 147.8, 0.35)); const a = K(R, 148.2, 0.3); if (a > 0) chip('no está mirando el tráfico', CX, 1180, a, 32); });
    HUD.kmh = Math.round(lerp(100, 22, (1 - k) / 0.8)); HUD.kmhC = k < 0.45 ? C_RED : k < 0.85 ? C_ORANGE : C_GREEN;
  },
  end(R, D) {
    roadOn(); setCars(R, { jamK: 0.3, dotS: 1.15 }); setVerges(jamCols(0.3)); sunAt(V3(...P(370, 0, 0)));
    setCam(camKeys(R, [[150.5, P(320, -30, 40), P(380, 0, 0), 42], [158.6, P(300, -60, 90), P(390, 0, 0), 42]]), 0.4);
    D.push(() => { const a = K(R, 154.0, 0.3); if (a > 0) chip('estos celulares son los sensores', CX, 470, a * (1 - seg(R, 156.6, 157.0)), 32); const e = K(R, 157.0, 0.4); if (e > 0) { ctx.save(); screen(); ctx.globalAlpha = e * 0.85; ctx.fillStyle = 'rgba(22,19,15,0.88)'; ctx.beginPath(); ctx.roundRect(CX - 210, H / 2 - 50, 420, 80, 10); ctx.fill(); ctx.restore(); s3Text('ALTERBASE', CX, H / 2 + 6, { size: 44, align: 'center', alpha: e * 0.95, spacing: 6 }); } });
    HUD.kmh = 22; HUD.kmhC = C_RED; HUD.kmhLabel = 'NORMAL: 100';
  },
};
