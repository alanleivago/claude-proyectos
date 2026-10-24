// =====================================================================
//  RUN — the shrinking camera through the forest into the moss and a dewdrop; the drop and the tardigrade; the cell and its
//  nucleus going grey; the DNA; the atom; the nucleus; the quarks. Transitions, the HUD (your height, then times smaller),
//  captions, the card.
// =====================================================================
const flo = (t, k) => ({ x: Math.sin(t * 0.23 + 1) * k + Math.sin(t * 0.61 + 2) * k * 0.3, y: Math.sin(t * 0.31 + 0.3) * k * 0.7, r: Math.sin(t * 0.21 + 2.1) * 0.6 + Math.sin(t * 0.67) * 0.15 });
const BLIT = { s: 1, a: 1 };
let _bc = null; const bloomCv = () => { if (!_bc) { const c = document.createElement('canvas'); c.width = Math.round(W / 14); c.height = Math.round(H / 14); _bc = { c, ctx: c.getContext('2d'), w: c.width, h: c.height }; } return _bc; };
function blit(cv, sat) { ctx.save(); screen(); ctx.globalAlpha = BLIT.a; ctx.translate(CX, H / 2); ctx.scale(BLIT.s, BLIT.s); ctx.translate(-CX, -H / 2); ctx.filter = `saturate(${sat}) contrast(1.04)`; ctx.drawImage(cv, 0, 0, W, H); ctx.filter = 'none'; const bc = bloomCv(); bc.ctx.clearRect(0, 0, bc.w, bc.h); bc.ctx.drawImage(cv, 0, 0, bc.w, bc.h); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.28 * BLIT.a; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bc.c, 0, 0, W, H); ctx.restore(); }
const satNow = (t) => (t >= T_HERO ? 1.15 : 1.15 * (1 - greyK(t)));

function updForest(t) {
  const { r, cv } = rend(), f = forest3(), cam = f.cam, h = t < 4 ? 1.75 : heightM(t), L = new THREE.Vector3(SPOT.x, logTop(SPOT.z), SPOT.z), fl = flo(t, 0.012 * h);
  const Dc = new THREE.Vector3(DEW.x, logTop(DEW.z) + DEW.r * 0.82, DEW.z), dk = ss(15.6, 19.2, t), into = ss(19.2, 20.4, t);
  const pos = L.clone().add(new THREE.Vector3(fl.x, h * 0.62 + fl.y, h * 1.1)), tgt = L.clone().add(new THREE.Vector3(0, -h * 0.05, -h * 2.5));
  pos.lerp(Dc.clone().add(new THREE.Vector3(fl.x * 0.3, 0.0016, 0.0062)), dk).lerp(Dc.clone().add(new THREE.Vector3(0, 0.0003, 0.0006)), into); tgt.lerp(Dc, dk);
  cam.position.copy(pos); cam.lookAt(tgt); cam.rotateZ(fl.r * DEG); cam.near = Math.max(0.000005, h * 0.004); cam.updateProjectionMatrix();
  { const S = f.sun, Rr = Math.max(h * 9, 0.02), sc = S.shadow.camera, dir = new THREE.Vector3(3, 8, 4).normalize(); S.target.position.copy(tgt); S.position.copy(tgt).addScaledVector(dir, Rr * 6); S.target.updateMatrixWorld();
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = Rr * 0.5; sc.far = Rr * 14; sc.updateProjectionMatrix(); S.shadow.bias = -0.0001; S.shadow.normalBias = Rr * 0.002; }
  f.scene.fog.near = Math.max(0.02, h * 1.5); f.scene.fog.far = Math.max(0.6, h * 30);
  // the locals: the beetle crosses, ants file past, springtails hop
  { const a = ss(9.2, 16, t), b = f.beetle, x = lerp(DEW.x, SPOT.x, a) + 0.0012 * Math.sin(t * 1.3), z = lerp(DEW.z + 0.002, SPOT.z - 0.007, a); b.position.set(x + 0.016 * ss(13.6, 15.6, t), logTop(z) + 0.0001, z); b.rotation.y = 0.25 * Math.sin(t * 1.3) + 1.4 * ss(13.4, 14.4, t); b.visible = t > 8 && t < 15.8; b.userData.legs.forEach((lg, k) => (lg.rotation.x = 0.5 * Math.sin(t * 14 + k * 1.6))); }
  f.ANTS.forEach((an, i) => { const a = t - 8, x = an.x0 + an.vx * a, z = an.z0 + an.vz * a; f.ants.setMatrixAt(i, M4c(x, logTop(z) + 0.0002, z, Math.atan2(an.vx, an.vz), an.s, an.s, an.s, 0, 0.05 * Math.sin(t * 20 + an.ph))); }); f.ants.instanceMatrix.needsUpdate = true;
  f.SPRING.forEach((s, i) => { const a = mod(t - s.t0, 1.6), hop = a < 0.4 ? Math.sin(a / 0.4 * Math.PI) * 0.004 : 0, dx = Math.floor((t - s.t0) / 1.6) * 0.002 * Math.sin(i); f.springs.setMatrixAt(i, M4c(s.x + dx, logTop(s.z) + 0.0004 + hop, s.z, i, s.s, s.s, s.s)); }); f.springs.instanceMatrix.needsUpdate = true;
  f.snail.position.x = SPOT.x - 0.05 + 0.002 * (t - 8);
  r.render(f.scene, cam); blit(cv, 1.2);
}
function updDrop(t) {
  const { r, cv } = rend(), d = drop3(), cam = d.cam, a0 = t - SC.drop[0], fl = flo(t, 1.2);
  const tk = ss(25.6, 33.8, t), tp = new THREE.Vector3(lerp(-70, 2, tk), lerp(-20, -8, tk), lerp(-300, 28, Math.pow(tk, 0.85)));
  cam.position.set(fl.x + 6 * Math.sin(a0 * 0.35), fl.y + 4 + 3 * Math.sin(a0 * 0.27), 62 - a0 * 2.6); cam.lookAt(lerp(0, tp.x * 0.6, ss(25.5, 28, t)), lerp(0, tp.y, ss(25.5, 28, t)), cam.position.z - 60); cam.rotateZ(fl.r * DEG);
  d.DIA.forEach((q) => { d.diatoms[q.kind].setMatrixAt(q.slot, M4c(q.x + q.v * a0 * 4, q.y + Math.sin(t * 0.3 + q.ry) * 2, q.z, q.ry + t * 0.15, q.s, q.s, q.s, q.rz + t * 0.1, 0)); }); d.diatoms.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  d.PARA.forEach((p, i) => { const x = p.x + Math.sin(p.ry + 0.3 * Math.sin(a0 * 0.5 + i)) * p.v * 2.2 * a0, z = p.z + Math.cos(p.ry) * p.v * 2.2 * a0; d.paras.setMatrixAt(i, M4c(x, p.y + Math.sin(t + i) * 2, z, p.ry + 0.2 * Math.sin(t * 2 + i), p.s, p.s, p.s, 0, 0.3 * Math.sin(t * 3 + i))); }); d.paras.instanceMatrix.needsUpdate = true;
  d.specks.position.y = -((t * 0.6) % 20);
  const T2 = d.tardi; T2.visible = t > 25.6; T2.position.copy(tp); T2.rotation.set(0.15 * Math.sin(t * 0.9), Math.atan2(-tp.x, 60 - tp.z) * 0.6 + 0.1 * Math.sin(t * 0.7), 0.12 * Math.sin(t * 1.1));
  T2.userData.legs.forEach(({ lg, k, s }) => { lg.rotation.x = 0.6 * Math.sin(t * 5 + k * 1.2 + (s > 0 ? Math.PI : 0)); }); T2.userData.segs.forEach((m, k) => (m.position.x = 0.08 * Math.sin(t * 3 + k)));
  r.render(d.scene, cam); blit(cv, 1.15);
}
function updCell(t) {
  const { r, cv } = rend(), c = cell3(), cam = c.cam, fl = flo(t, 1.2), k = ss(34.2, 43.6, t);
  cam.position.set(fl.x, fl.y, lerp(40, -392, Math.pow(k, 1.15))); cam.lookAt(fl.x * 0.5, 0, cam.position.z - 60); cam.rotateZ(fl.r * DEG);
  c.MITO.forEach((m, i) => c.mitos.setMatrixAt(i, M4c(m.x + Math.sin(t * 0.4 + i) * 1.5, m.y + Math.cos(t * 0.3 + i) * 1.5, m.z, m.ry + t * 0.05, m.s, m.s, m.s, m.rx, 0))); c.mitos.instanceMatrix.needsUpdate = true;
  c.chrom.rotation.y = t * 0.05;
  r.render(c.scene, cam); blit(cv, satNow(t));
}
function updDNA(t) {
  const { r, cv } = rend(), n = dna3(), cam = n.cam, k = (t - SC.dna[0]) / 6, fl = flo(t, 0.3), z = lerp(40, -180, k), a = 0.6 + k * 1.4;
  cam.position.set(Math.cos(a * 0.5) * 7.5 + fl.x, 2.5 + Math.sin(a * 0.5) * 2 + fl.y, z); cam.lookAt(0, 0, z - 7); cam.rotateZ(fl.r * DEG);
  r.render(n.scene, cam); blit(cv, 0);
}
function updAtom(t) {
  const { r, cv } = rend();
  if ((t < 57.0 || BLIT.force === 'atom') && BLIT.force !== 'nuc') { const a = atom3(), cam = a.cam, k = ss(51.2, 56.4, t), rush = ss(56.4, 57.2, t), d = lerp(lerp(110, 60, k), 3, rush * rush), ang = t * 0.12;
    cam.position.set(Math.sin(ang) * d, 8 * (1 - rush), Math.cos(ang) * d); cam.lookAt(0, 0, 0); a.cloud.rotation.y = t * 0.05; a.core.scale.setScalar(2.4 + 6 * rush * rush); r.render(a.scene, cam); blit(cv, 0); return; }
  const p = nuc3(), cam = p.cam, k = ss(57.0, 61.2, t), into = ss(61.2, 62, t), d = lerp(lerp(13, 8, k), 0.5, into * into), ang = 0.6 + t * 0.18;
  cam.position.set(Math.sin(ang) * d, 2.2 * (1 - into), Math.cos(ang) * d); cam.lookAt(0, 0, 0);
  p.NUC.forEach((nu, i) => p.balls[i].position.set(nu.p.x + 0.06 * Math.sin(t * 7 + nu.ph), nu.p.y + 0.06 * Math.sin(t * 6.3 + nu.ph * 2), nu.p.z + 0.06 * Math.sin(t * 7.7 + nu.ph * 3)));
  r.render(p.scene, cam); blit(cv, 0);
}
function updQuark(t) {
  const { r, cv } = rend(), q = quark3(), cam = q.cam, a0 = t - T_HERO, out = ss(70, 74, t), burst = ss(0, 0.5, a0);
  const P3 = q.quarks.map((qq, i) => { const a = i / 3 * TAU + t * 0.35, rr = 2.1 + 0.35 * Math.sin(t * 1.3 + i * 2), p = new THREE.Vector3(Math.cos(a) * rr, Math.sin(t * 0.7 + i) * 0.6, Math.sin(a) * rr); qq.g.position.copy(p); const pulse = 1 + 0.15 * Math.sin(t * 6 + i * 2);
    qq.halo.scale.setScalar(4.5 * pulse * (0.3 + 0.7 * burst)); qq.halo2.scale.setScalar(11 * pulse * (0.3 + 0.7 * burst)); return p; });
  const J = new THREE.Vector3(0.25 * Math.sin(t * 1.7), 0.2 * Math.sin(t * 1.3 + 1), 0.25 * Math.cos(t * 1.5));
  q.gl.forEach((g, k) => { const A1 = P3[k], pos = g.line.geometry.attributes.position, sp = g.sp.geometry.attributes.position; const pt = (u) => { const p = A1.clone().lerp(J, u), w = Math.sin(Math.PI * u) * 0.12; p.x += w * Math.sin(u * 14 + t * 9 + k); p.y += w * Math.cos(u * 11 - t * 8 + k * 2); p.z += w * Math.sin(u * 9 + t * 7); return p; };
    for (let i = 0; i <= q.SEG; i++) { const p = pt(i / q.SEG); pos.setXYZ(i, p.x, p.y, p.z); } pos.needsUpdate = true;
    for (let i = 0; i < g.NS; i++) { const u = mod(hsh(i, k + 3) + t * 0.12 * (0.5 + hsh(i, 9)), 1), p = pt(u), j = 0.06 + 0.05 * Math.sin(Math.PI * u); sp.setXYZ(i, p.x + (hsh(i, 11) - 0.5) * j, p.y + (hsh(i, 12) - 0.5) * j, p.z + (hsh(i, 13) - 0.5) * j); } sp.needsUpdate = true;
    g.beads.forEach((s2, j) => { const u = mod(j / g.beads.length + t * 0.5, 1), p = pt(u); s2.position.copy(p); s2.material.opacity = 0.6 * Math.sin(Math.PI * u); }); });
  { const col = q.virt.geometry.attributes.color, n = col.count; for (let i = 0; i < n; i++) { const h = hsh(i, Math.floor(t * 10) + 7), on = h > 0.93 ? (h - 0.93) / 0.07 : 0, c = [[1, 0.4, 0.3], [0.4, 1, 0.5], [0.4, 0.5, 1], [1, 1, 1]][i % 4]; col.setXYZ(i, c[0] * on, c[1] * on, c[2] * on); } col.needsUpdate = true; }
  const d = lerp(lerp(3, 7.5, ss(T_HERO, T_HERO + 1.2, t)), 34, out * out), ang = 0.4 + t * 0.22; cam.position.set(Math.sin(ang) * d * 0.75, d * 0.62 + Math.sin(t * 0.4), Math.cos(ang) * d * 0.75); cam.lookAt(0, 0, 0);
  r.render(q.scene, cam); blit(cv, 1.2);
}

// ---- 2D: speed streaks for the zooms
function streaks(k, col) { if (k <= 0) return; const R = RNG('streaks'); ctx.save(); screen(); ctx.strokeStyle = col; for (let i = 0; i < 90; i++) { const a = R.r(0, TAU), r0 = R.r(120, 500) * (1 + k), r1 = r0 + R.r(80, 400) * k; ctx.globalAlpha = 0.5 * k; ctx.lineWidth = R.r(1, 3); ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); ctx.lineTo(CX + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1); ctx.stroke(); } ctx.restore(); }

// ---- HUD
function hud() {
  const t = TT; if (t < 0.4 || t >= 74) return; const a = ev(0.4, 0.4) * (t > 73.4 ? 1 - ev(73.4, 0.5) : 1) * (t > 62 && t < 62.8 ? 0 : 1);
  if (t < 20) { pvHud('Tu altura', heightTxt(t < 4 ? 1.75 : heightM(t)), t < 4 ? 'normal' : 'encogiendo', a); return; }
  const x = Math.pow(10, logS(t)); pvHud('Veces más pequeño', bigWords(x), t < 34 ? 'del tamaño de un tardígrado' : t < 45 ? 'dentro de una célula' : t < 51 ? 'del ancho del ADN' : t < 57 ? 'un átomo' : t < 62.6 ? 'el núcleo' : 'quarks', a);
}
function endCard() {
  const a = ev(74.4, 0.8), b = ev(75.4, 0.8), c = ev(76.6, 0.7), c2 = ev(77.5, 0.5), e = ev(78.2, 0.6);
  const f = () => {
    pvText('¿Qué pasaría si', CX, 760, 54, { align: 'center', alpha: a });
    pvText('no dejaras', CX, 830, 54, { align: 'center', alpha: a });
    pvText('de encogerte?', CX, 900, 54, { align: 'center', alpha: a });
    pvText('NADIE SABE SI EXISTE', CX, 1000, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('ALGO MÁS PEQUEÑO.', CX, 1038, 22, { font: PV.sans, weight: 600, spacing: 4, align: 'center', alpha: b * 0.8 });
    pvText('Pero tranquilo, esto no puede pasar...', CX, 1160, 42, { italic: true, align: 'center', alpha: c * 0.92 });
    pvText('¿o sí?', CX, 1240, 58, { italic: true, align: 'center', alpha: c2 });
    pvText('ALTERBASETV', CX, 1460, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(84, Math.floor(100 * 760 / wmax)), lh = size * 1.14, y0 = 420;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 60, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function caption2(l1, l2, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { pvFeather(CX, 1360, 560, 150, a); pvText(l1, CX, 1350, 50, { italic: true, align: 'center', alpha: a }); pvText(l2, CX, 1414, 50, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function sceneShrink() {
  const t = TT;
  const XF = [[19.6, 20.6, updForest, updDrop], [33.6, 34.6, updDrop, updCell], [44.6, 45.6, updCell, updDNA], [50.6, 51.6, updDNA, updAtom], [56.4, 57.2, (t2) => { BLIT.force = 'atom'; updAtom(t2); BLIT.force = null; }, (t2) => { BLIT.force = 'nuc'; updAtom(t2); BLIT.force = null; }]];
  const xf = XF.find(([a0, a1]) => t >= a0 && t < a1);
  if (t < 74) { if (xf) { const [a0, a1, fromF, toF] = xf, k = ss(a0, a1, t); fillAll('#000'); BLIT.s = lerp(1.18, 1, Math.pow(k, 0.7)); BLIT.a = 1; toF(t); BLIT.s = lerp(1, 3.4, k * k); BLIT.a = 1 - ss(0.3, 0.95, k); fromF(t); BLIT.s = 1; BLIT.a = 1; }
    else if (inSc('forest', t)) updForest(t); else if (inSc('drop', t)) updDrop(t); else if (inSc('cell', t)) updCell(t); else if (inSc('dna', t)) updDNA(t); else if (inSc('atom', t)) updAtom(t); else if (inSc('quark', t)) updQuark(t); else fillAll('#040406'); }
  const fadeTo = (c, a0, a1, b1) => { if (t >= a0 && t < a1) pvTint(c, ss(a0, a1, t)); if (t >= a1 && t < b1) pvTint(c, 1 - ss(a1, b1, t)); };
  if (t >= 61.4 && t < 62) pvTint('#040406', ss(61.4, 62, t));
  if (t >= T_HERO && t < T_HERO + 0.5) pvTint('#ffffff', 0.55 * (1 - ss(T_HERO, T_HERO + 0.5, t)));
  if (t >= 73.2 && t < 74) pvTint('#08080a', ss(73.2, 74, t));
  if (t >= 74) { fillAll('#08080a'); endCard(); }
  hud();
  bigTitle(['¿Qué pasaría si', 'no dejaras', 'de encogerte?'], 0.2, 3.7);
  pvCaption('Empiezas a encogerte.', 4.3, 9.6);
  caption2('Los vecinos ahora', 'son más grandes.', 10.2, 15.6);
  pvCaption('Una gota de rocío.', 16.2, 19.4);
  pvCaption('Dentro de una sola gota.', 20.8, 25.6);
  pvCaption('Algo nada hacia ti.', 26.2, 30.2);
  caption2('Un tardígrado,', 'el "cerdito de musgo".', 30.4, 33.6);
  caption2('Dentro de una', 'de sus células.', 34.8, 39.8);
  caption2('Demasiado pequeño para la luz.', 'El color se apaga.', 40.3, 44.6);
  pvCaption('Las instrucciones de todo.', 45.8, 50.6);
  caption2('Un átomo.', 'Casi completamente vacío.', 51.8, 56.4);
  pvCaption('El corazón del átomo.', 57.6, 61.4);
  caption2('Lo más pequeño', 'que conocemos.', 63.4, 69.6);
  pvCaption('¿Y más allá?', 70.4, 73.4);
}
