// =====================================================================
//  SETS 2 — what the full board needs on top of world.js:
//   • towerFx(S): the North Tower's impact (fireball out of the south face, the burning gash, the smoke plume
//     drifting south-east, office papers fluttering down, debris); poseFx(S, t) poses all of it from t.
//   • towerCast(S): Diego, the boss, office extras; the POV left hand with a 2001 phone; the smashed mug on the floor.
//   • stCore(): the floor-89 elevator lobby (doors that open on a packed car, call buttons, the SALIDA door) and
//     the car going up (wood panels, the floor indicator), with a POV right hand that presses the button.
// =====================================================================
const T_HIT = 5.6;                                             // the North Tower is hit (8:46:40 on the HUD)
const GASH = { y0: 338, y1: 366 };                             // floors ~93–99 of the North Tower
const WIND = new THREE.Vector3(1, 0.42, -0.32);                // the smoke drifts east and up, away from us
// ---- soft volumetric sprites (the oxigeno / giro billow technique): many lit lumps on one canvas, a soft edge
const FXT = {};
function billowTex(key, lit = 'below') { return FXT[key] || (FXT[key] = g3Tex((x, w) => { const R = RNG(key);
  for (let i = 0; i < 54; i++) { const a = R.r(0, TAU), d = Math.pow(R.f(), 0.7) * w * 0.3, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.85, s = R.r(w * 0.07, w * 0.17) * (1 - d / (w * 0.45)), off = lit === 'below' ? s * 0.35 : -s * 0.35;
    const g = x.createRadialGradient(px, py + off, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.6)'); g.addColorStop(0.55, 'rgba(205,205,205,0.45)'); g.addColorStop(0.85, 'rgba(150,150,150,0.2)'); g.addColorStop(1, 'rgba(120,120,120,0)'); x.fillStyle = g; x.fillRect(px - s, py - s, 2 * s, 2 * s); } }, 128, 128)); }
// ragged smoke: fbm noise under a soft radial falloff — irregular silhouettes, wisps, no sphere look
function smokeTex(key) { return FXT['s' + key] || (FXT['s' + key] = g3Tex((x, w) => { const R = RNG('sm' + key), im = x.createImageData(w, w), o1 = R.r(0, 50), o2 = R.r(0, 50);
  const hs = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7 + o1 * 17.3) * 43758.5453; return v - Math.floor(v); }, vn = (px, py) => { const i = Math.floor(px), j = Math.floor(py), fx = px - i, fy = py - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hs(i, j), hs(i + 1, j), u), lerp(hs(i, j + 1), hs(i + 1, j + 1), u), v); };
  const fbm = (px, py) => { let a = 0, m = 0.5, f = 1; for (let k = 0; k < 5; k++) { a += m * vn(px * f + o2, py * f); m *= 0.5; f *= 2.1; } return a; };
  for (let py = 0; py < w; py++) for (let px = 0; px < w; px++) { const u = px / w - 0.5, v = py / w - 0.5, d = Math.hypot(u, v) * 2, n = fbm(px / w * 5, py / w * 5), a = clamp((1 - d) * 1.6 + (n - 0.55) * 1.8), lit = clamp(0.55 + (0.5 - v) * 0.7 + (n - 0.5) * 0.8);
    const k = (py * w + px) * 4, c = 150 + 105 * lit; im.data[k] = c; im.data[k + 1] = c; im.data[k + 2] = c; im.data[k + 3] = 255 * a * a; } x.putImageData(im, 0, 0); }, 128, 128)); }
const glowTexF = () => FXT.glow || (FXT.glow = g3Radial([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,240,200,0.9)'], [0.45, 'rgba(255,170,80,0.35)'], [1, 'rgba(255,120,40,0)']], 128));
function fxSprite(par, map, additive) { const m = new THREE.SpriteMaterial({ map, color: '#ffffff', transparent: true, depthWrite: false, fog: true, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  const s = new THREE.Sprite(m); s.userData.noInk = true; s.visible = false; par.add(s); return s; }
function towerFx(S) { const sc = S.st.scene, R = RNG('fx'), southZ = NT.z + NT.w / 2 + 0.8, eastX = NT.x + NT.w / 2 + 0.8, HX = NT.x + NT.w / 2 - 12;
  // the damage: a charred band with fire behind the broken columns, soot streaking up the face above it
  const gT = g3Tex((x, w, h) => { const Rg = RNG('gash'); x.fillStyle = '#100d0c'; x.fillRect(0, 0, w, h); for (let k = 0; k < 60; k++) blot(x, Rg.r(0, w), Rg.r(h * 0.3, h), Rg.r(5, 14), Rg.pick(['rgba(255,140,40,0.85)', 'rgba(255,200,100,0.8)', 'rgba(200,60,20,0.8)']));
    for (let k = 0; k < 120; k++) { const px = Rg.r(0, w), py = Rg.r(h * 0.2, h * 0.9), r = Rg.r(3, 9); blot(x, px, py, r, 'rgba(255,240,180,0.95)'); }
    for (let k = 0; k < 40; k++) blot(x, Rg.r(0, w), Rg.r(0, h), Rg.r(10, 30), 'rgba(10,8,8,0.7)');
  const aT = g3Tex((x, w, h) => { const Ra = RNG('hole'); x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, h * 0.62);
    for (let i = 0; i <= 40; i++) x.lineTo(i / 40 * w, h * (0.12 + 0.4 * Math.abs(Math.sin(i * 0.7 + 1)) * Ra.f() + 0.25 * Math.max(0, 1 - Math.abs(i - 26) / 9)));
    for (let i = 40; i >= 0; i--) x.lineTo(i / 40 * w, h * (0.92 - 0.25 * Ra.f() * (1 - Math.max(0, 1 - Math.abs(i - 26) / 7))));
    x.closePath(); x.fill(); }, 512, 64, false);
  const gM = new THREE.MeshBasicMaterial({ map: gT, alphaMap: aT, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const gs = new THREE.Mesh(new THREE.PlaneGeometry(NT.w * 0.66, (GASH.y1 - GASH.y0) * 1.3), gM); gs.position.set(NT.x + NT.w * 0.17, (GASH.y0 + GASH.y1) / 2, southZ - 0.5); gs.userData.noInk = true; sc.add(gs); S.gashM = gM;
  const sootT = g3Tex((x, w, h) => { const Rs = RNG('soot'); for (let k = 0; k < 70; k++) { const px = Rs.r(0, w), wd = Rs.r(4, 16), top = h * Rs.r(0.0, 0.6); const g = x.createLinearGradient(0, h, 0, top); g.addColorStop(0, 'rgba(18,14,12,0.85)'); g.addColorStop(1, 'rgba(18,14,12,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(px - wd, h); x.quadraticCurveTo(px + Rs.n(10), (h + top) / 2, px + Rs.n(6), top); x.quadraticCurveTo(px + wd * 0.3, (h + top) / 2, px + wd, h); x.fill(); } }, 256, 256);
  const sM = new THREE.MeshBasicMaterial({ map: sootT, transparent: true, opacity: 0, depthWrite: false }); const so = new THREE.Mesh(new THREE.PlaneGeometry(NT.w * 0.72, 70), sM); so.position.set(NT.x + NT.w * 0.17, GASH.y1 + 30, southZ - 0.45); so.userData.noInk = true; sc.add(so); S.sootM = sM;
  // the flash, the fire core (additive), the fireball billows, the smoke (billows lit from above), embers, debris, papers
  // thin cirrus, high and far, drifting slowly (both window views)
  const ciT = g3Tex((x, w, h) => { const Rc = RNG('cirrus'); for (let k = 0; k < 90; k++) { const y = h * (0.3 + 0.4 * Rc.f()), x0 = Rc.r(0, w * 0.6), L = Rc.r(w * 0.2, w * 0.5), th = Rc.r(2, 7); const g = x.createLinearGradient(x0, 0, x0 + L, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${Rc.r(0.12, 0.35)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(x0 + L / 2, y + Rc.n(6), L / 2, th, Rc.n(0.08), 0, TAU); x.fill(); } }, 512, 128);
  S.cirrus = []; for (let k = 0; k < 14; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ciT, transparent: true, depthWrite: false, fog: false, opacity: R.r(0.5, 0.9) })); sp.userData.noInk = true; const a = R.r(-1.2, 1.2) + (k % 2 ? Math.PI : 0), d = R.r(3500, 6000); S.cirrus.push({ sp, x: Math.sin(a) * d, z: -Math.cos(a) * d, y: R.r(1500, 2600), s: R.r(1800, 3200), v: R.r(3, 7) }); sc.add(sp); }
  S.gfire = []; for (let k = 0; k < 44; k++) S.gfire.push({ s: fxSprite(sc, smokeTex('f' + (k % 4)), false), x: NT.x + NT.w * 0.17 + R.r(-0.33, 0.33) * NT.w, y: R.r(GASH.y0 + 3, GASH.y1 + 2), s0: R.r(5, 10), ph: R.r(0, TAU), f: R.r(5, 11), rot: R.r(0, TAU) });
  S.flash = fxSprite(sc, glowTexF(), true);
  S.core = []; for (let k = 0; k < 26; k++) S.core.push({ s: fxSprite(sc, glowTexF(), true), x: HX + R.r(-18, 10), y: R.r(GASH.y0 + 4, GASH.y1), v: [R.n(8), R.r(2, 10), R.r(5, 16)], d: R.r(0, 0.25), life: R.r(0.7, 1.5), s0: R.r(10, 18), rot: R.r(0, TAU) });
  S.fire = []; for (let k = 0; k < 90; k++) S.fire.push({ s: fxSprite(sc, k % 2 ? smokeTex('f' + (k % 4)) : billowTex('bf' + (k % 5), 'below'), false), x: HX + R.r(-24, 12), y: R.r(GASH.y0, GASH.y1), v: [R.n(9) + 2, R.r(2, 11), R.r(4, 17)], d: R.r(0, 0.45), s0: R.r(6, 11), s1: R.r(22, 38), burn: R.r(0.7, 1.7), rot: R.r(0, TAU), sp: R.n(0.4) });
  S.smoke = []; for (let k = 0; k < 130; k++) { const face = R.f() < 0.7; S.smoke.push({ s: fxSprite(sc, smokeTex('s' + (k % 6)), false), face, u: R.r(-0.1, 0.5), y: R.r(GASH.y0, GASH.y1 + 8), off: R.r(0, 16), s0: R.r(10, 18), sp: R.r(0.75, 1.3), rot: R.r(0, TAU), shade: R.r(0.12, 0.3) }); }
  { const n = 420, pos = new Float32Array(n * 3), E = []; for (let k = 0; k < n; k++) E.push({ x: HX + R.r(-22, 12), y: R.r(GASH.y0, GASH.y1), v: [R.n(14), R.r(-2, 16), R.r(2, 24)], d: R.r(0, 1.2), life: R.r(1.2, 3.5) });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.PointsMaterial({ map: glowTexF(), color: '#ffb050', size: 2.4, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const p = new THREE.Points(g, m); p.userData.noInk = true; p.frustumCulled = false; sc.add(p); S.emb = { p, E, pos, m }; }
  const papM = new THREE.MeshBasicMaterial({ color: '#f4f2ec', side: THREE.DoubleSide, toneMapped: false }); S.papers = [];
  for (let k = 0; k < 260; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), papM); m.userData.noInk = true; m.visible = false; sc.add(m);
    S.papers.push({ m, x: HX + R.r(-30, 20), y: R.r(GASH.y0, GASH.y1), z: southZ + R.r(0, 6), vx: R.r(1, 6), vz: R.r(-1, 3), fall: R.r(0.8, 2.2), d: R.r(0.1, 2.5), ph: R.r(0, TAU), w: R.r(1.2, 3) }); }
  const debM = TOON({ color: '#3a3836' }), debL = TOON({ color: '#c8ccd0', roughness: 0.35, metalness: 0.4 }); S.deb = []; for (let k = 0; k < 110; k++) { const kind = k % 4, m = new THREE.Mesh(kind === 0 ? new THREE.BoxGeometry(0.46, R.r(2, 4), 0.08) : kind === 1 ? new THREE.BoxGeometry(R.r(1, 2.5), 0.06, R.r(0.6, 1.4)) : lumpyGeo(0, 0.6, k).scale(R.r(0.2, 0.7), R.r(0.05, 0.2), R.r(0.2, 0.6)), kind < 2 ? debL : (k % 2 ? debL : debM)); m.visible = false; sc.add(m); S.deb.push({ m, x: HX + R.r(-20, 12), y: R.r(GASH.y0, GASH.y1), v: [R.n(10), R.r(-2, 10), R.r(4, 22)], r: R.r(1, 6) }); }
}
const FIRE_COL = [[0, '#fff4c0'], [0.2, '#ffc050'], [0.5, '#ff7a24'], [0.9, '#c2401a'], [1.4, '#5a3a2c'], [2.2, '#2e2a28'], [6, '#24221f']];
const fireCol = (a) => { let c = FIRE_COL[FIRE_COL.length - 1][1]; for (let i = 0; i < FIRE_COL.length - 1; i++) if (a >= FIRE_COL[i][0] && a < FIRE_COL[i + 1][0]) { c = '#' + lin(FIRE_COL[i][1]).lerp(lin(FIRE_COL[i + 1][1]), (a - FIRE_COL[i][0]) / (FIRE_COL[i + 1][0] - FIRE_COL[i][0])).getHexString(); break; } return c; };
function poseFx(S, t) { const a0 = t - T_HIT, on = a0 > 0, southZ = NT.z + NT.w / 2 + 0.8, HX = NT.x + NT.w / 2 - 12;
  S.gfire.forEach((g) => { const a = a0 - 0.3; g.s.visible = on && a > 0; if (!g.s.visible) return; const fl = 0.75 + 0.25 * Math.sin(t * g.f + g.ph) * Math.sin(t * g.f * 0.37 + g.ph * 2), up = mod(t * 0.9 + g.ph, 1);
    g.s.position.set(g.x, g.y + 5 * up, NT.z + NT.w / 2 + 2.2); g.s.scale.setScalar(g.s0 * fl * (1 + 0.5 * up)); g.s.material.rotation = g.rot + t * 0.4; g.s.material.color.set(up < 0.5 ? '#ffb040' : '#e2541c'); g.s.material.opacity = clamp(a * 2) * (1 - up) * 0.95; });
  S.cirrus.forEach((c) => { c.sp.position.set(c.x + c.v * t, c.y, c.z); c.sp.scale.set(c.s, c.s * 0.25, 1); });
  S.gashM.opacity = on ? clamp(a0 * 4) * (0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3)) : 0; S.gashM.map.offset.x = 0.02 * Math.sin(t * 3.1); S.sootM.opacity = on ? 0.95 * ss(0.4, 4, a0) : 0;
  // the flash: a white-hot bloom at the hit, gone in half a second
  S.flash.visible = on && a0 < 0.7; if (S.flash.visible) { const k = ss(0, 0.06, a0) * (1 - ss(0.1, 0.7, a0)); S.flash.position.set(NT.x + NT.w / 2 + 3, 353, NT.z - 8); S.flash.scale.setScalar(10 + 22 * k); S.flash.material.opacity = 0.6 * k; }
  S.core.forEach((c) => { const a = a0 - c.d; c.s.visible = on && a > 0 && a < c.life; if (!c.s.visible) return; const k = 1 - Math.exp(-a * 1.2);
    c.s.position.set(c.x + c.v[0] * k, c.y + c.v[1] * k, southZ + 2 + c.v[2] * k); c.s.scale.setScalar(c.s0 * (1 + 1.6 * k)); c.s.material.rotation = c.rot + a; c.s.material.opacity = (1 - a / c.life) * 0.55; c.s.material.color.set(a < 0.3 ? '#fff0c8' : '#ffa048'); });
  S.fire.forEach((b) => { const a = a0 - b.d; b.s.visible = on && a > 0 && a < 12; if (!b.s.visible) return; const k = 1 - Math.exp(-a * 1.0), drift = Math.max(0, a - 1.2);
    b.s.position.set(b.x + b.v[0] * k + WIND.x * 5 * drift, b.y + b.v[1] * k + WIND.y * 5 * drift + 1.5 * a, southZ + 1 + b.v[2] * k + WIND.z * 5 * drift); const sz = lerp(b.s0, b.s1, 1 - Math.exp(-a * 1.4)) * (1 + drift * 0.12); b.s.scale.setScalar(sz);
    b.s.material.rotation = b.rot + b.sp * a; b.s.material.blending = a / b.burn < 0.22 ? THREE.AdditiveBlending : THREE.NormalBlending; b.s.material.color.set(fireCol(a / b.burn)); b.s.material.opacity = Math.min(1, a * 10) * (1 - ss(8, 12, a)); });
  S.smoke.forEach((p) => { const a = a0 - 0.7 - p.off * 0.22; p.s.visible = on && a > 0; if (!p.s.visible) return; const per = 16, age = a < per ? a : mod(a + p.off, per);
    const bx_ = p.face ? NT.x + p.u * NT.w : NT.x + NT.w / 2 + 1, bz = p.face ? southZ : NT.z + (p.u - 0.3) * NT.w;
    p.s.position.set(bx_ + WIND.x * 9 * age * p.sp, p.y + WIND.y * 9 * age * p.sp + 3, bz + WIND.z * 9 * age * p.sp); p.s.scale.setScalar(p.s0 + 5.5 * age); p.s.material.rotation = p.rot + 0.05 * age;
    const c = lin('#1e1c1b').lerp(lin('#6a6662'), clamp(age / 10) * 0.6 + p.shade); if (age < 0.6) c.lerp(lin('#d0602a'), 0.5 * (1 - age / 0.6)); p.s.material.color.copy(c); p.s.material.opacity = Math.min(1, age * 1.5) * 0.92 * (1 - ss(per * 0.7, per, age)); });
  { const { E, pos, m, p } = S.emb; p.visible = on; let i = 0; E.forEach((e) => { const a = a0 - e.d; let x = 0, y = -1e4, z = 0; if (on && a > 0 && a < e.life) { x = e.x + e.v[0] * a; y = e.y + e.v[1] * a - 4.0 * a * a; z = southZ + 1 + e.v[2] * a; } pos[i++] = x; pos[i++] = y; pos[i++] = z; }); p.geometry.attributes.position.needsUpdate = true; m.opacity = on ? 1 - ss(2.5, 4, a0) * 0.6 : 0; }
  S.papers.forEach((p) => { const a = a0 - p.d; p.m.visible = on && a > 0; if (!p.m.visible) return; p.m.position.set(p.x + p.vx * a, p.y - p.fall * a + 1.2 * Math.sin(a * p.w + p.ph), p.z + p.vz * a); p.m.rotation.set(a * p.w + p.ph, a * 0.7 * p.w, Math.sin(a * 2 + p.ph)); });
  S.deb.forEach((d) => { const a = a0; d.m.visible = on && a < 9; if (!d.m.visible) return; d.m.position.set(d.x + d.v[0] * a, d.y + d.v[1] * a - 4.9 * a * a, southZ + d.v[2] * Math.min(a, 1.5)); d.m.rotation.set(a * d.r, a * d.r * 0.7, 0); });
}
// the office cast and props on the tower stage
function towerCast(S) { const sc = S.st.scene, off = S.off, R = RNG('ofcast');
  S.D = makeDiego(); off.add(S.D.root);
  S.boss = officeWoman(R, { hair: '#2a1d16', hairStyle: 'bun', top: '#2a3448', skirt: '#2a3448', sleeve: 'long', seed: 501, height: 1.0 }); off.add(S.boss.root);
  S.comp = officeWoman(R, { hair: '#3a2618', hairStyle: 'long', top: '#2a8a7a', skirt: '#26282e', seed: 502 }); off.add(S.comp.root);
  S.ex = []; for (let k = 0; k < 12; k++) { const P = k % 3 === 1 ? officeWoman(R, { hair: R.pick(['#2a1d16', '#3a2618', '#4a3020', '#1a1a1a', '#6a4a30']) }) : officeMan(R); off.add(P.root); if (k % 4 === 2) propPhone(P); S.ex.push(P); }
  // the smashed mug: shards, the handle, a coffee pool (shown after it lands)
  const sh = new THREE.Group(); sh.position.set(0.62, 0.01, -30.82); off.add(sh); S.shards = sh; const mugM = TOON({ color: '#f7f6f2', roughness: 0.35 }); S.shardL = [];
  // curved ceramic shards (pieces of the wall with its blue band), the handle, a falling copy of the mug, a splash and a spill
  mugM.side = THREE.DoubleSide;
  for (let k = 0; k < 16; k++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, R.r(0.025, 0.06), 10, 1, true, 0, R.r(0.5, 1.3)), mugM); m.castShadow = true; sh.add(m); S.shardL.push({ m, a: R.r(0, TAU), r: R.r(0.1, 0.5), up: R.r(0.6, 2.0), sp: R.r(2, 9) }); }
  for (let k = 0; k < 10; k++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(R.r(0.006, 0.014)), mugM); sh.add(m); S.shardL.push({ m, a: R.r(0, TAU), r: R.r(0.15, 0.7), up: R.r(1, 2.5), sp: R.r(5, 15) }); }
  S.fmug = S.cup.clone(true); S.fmug.visible = false; sh.add(S.fmug);
  const cof = TOON({ color: '#2e1609', roughness: 0.08 }), spill = new THREE.Shape(); for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU, r = 0.22 * (1 + 0.28 * Math.sin(a * 3 + 1) + 0.16 * Math.sin(a * 7) + 0.1 * Math.sin(a * 13 + 2)); k ? spill.lineTo(Math.cos(a) * r, Math.sin(a) * r) : spill.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const spT = g3Tex((x, w) => { const Rp = RNG('spill'); x.clearRect(0, 0, w, w); for (let k = 0; k < 26; k++) { const a = Rp.r(0, TAU), d = Rp.f() ** 0.8 * w * 0.3, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d, r = Rp.r(w * 0.06, w * 0.2) * (1 - d / (w * 0.45)); const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.8, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); } }, 256, 256, false);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#2e1609', roughness: 0.05, clearcoat: 1, alphaMap: spT, transparent: true, depthWrite: false })); pool.position.y = 0.004; sh.add(pool); S.pool = pool;
  S.drops = []; for (let k = 0; k < 34; k++) { const d = new THREE.Mesh(new THREE.SphereGeometry(R.r(0.006, 0.016), 8, 6), cof); sh.add(d); S.drops.push({ m: d, a: R.r(0, TAU), v: R.r(0.6, 2.2), up: R.r(0.8, 2.4) }); }
  sh.visible = false;
  // the POV left hand with a 2001 phone (grey candy bar, green LCD: AMOR / Llamando…)
  const HL = makeHand(-1, { skin: '#d9a47c' }); HL.bones.concat(HL.vessels).forEach((b) => (b.visible = false)); HL.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'PlaneGeometry') o.userData.noInk = true; }); toonify(HL.root); S.st.cam.add(HL.root); S.HL = HL; HL.root.visible = false;
  { const slv = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.062, 0.55, 24).translate(0, -0.33, 0).scale(1.3, 1, 0.9), TOON({ color: '#f4f3ef', roughness: 0.9 })); HL.fore.add(slv); }
  const lcdC = document.createElement('canvas'); lcdC.width = 256; lcdC.height = 192; const lcdT = new THREE.CanvasTexture(lcdC); lcdT.encoding = THREE.sRGBEncoding;
  S.setLcd = (sec) => { if (S.lcdS === sec) return; S.lcdS = sec; const x = lcdC.getContext('2d'), w = 256, h = 192; x.fillStyle = '#9fc08a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e2a18'; x.textAlign = 'center'; x.font = '800 46px Arial, sans-serif'; x.fillText('AMOR', w / 2, h * 0.42); x.font = '700 40px "Courier New", monospace'; x.fillText('00:' + String(sec).padStart(2, '0'), w / 2, h * 0.8); x.fillRect(w * 0.08, h * 0.06, 22, 10); x.fillRect(w * 0.08 + 26, h * 0.04, 8, 14); lcdT.needsUpdate = true; };
  const ph = new THREE.Group(), lcd = lcdT, _old = g3Tex((x, w, h) => { x.fillStyle = '#9fc08a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e2a18'; x.font = '800 44px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('AMOR', w / 2, h * 0.45); x.font = '600 28px Arial, sans-serif'; x.fillText('Llamando…', w / 2, h * 0.78); }, 256, 192);
  bx(ph, 0.048, 0.118, 0.02, TOON({ color: '#5a6068', roughness: 0.5 }), 0, 0, 0); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.034, 0.026), new THREE.MeshBasicMaterial({ map: lcd, toneMapped: false })); scr.position.set(0, 0.025, 0.0105); scr.userData.noInk = true; ph.add(scr);
  const kp = g3Tex((x, w, h) => { x.fillStyle = '#4a5058'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8ccd2'; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { x.beginPath(); x.ellipse(w * (0.22 + c * 0.28), h * (0.15 + r * 0.23), w * 0.1, h * 0.07, 0, 0, TAU); x.fill(); } }, 128, 160);
  const kpm = new THREE.Mesh(new THREE.PlaneGeometry(0.036, 0.046), TOON({ map: kp })); kpm.position.set(0, -0.03, 0.0105); ph.add(kpm); S.st.cam.add(ph); S.phone = ph; ph.visible = false;
}

// =========================== the core: elevator lobby 89 + the car going up ===========================
function stCore() { return once('core', () => {
  const st = makeStage({ fov: 64, far: 200, sky: 0xf6f2ea, ground: 0x8a8070, hemi: 1.2, key: 1.0, keyCol: 0xfff6ea, box: 10, boxFar: 40 });
  st.scene.background = lin('#d8ccb4'); st.setSun(dirV(30 * DEG, 70 * DEG), new THREE.Vector3(0, 0, 0)); const S = { st }, sc = st.scene, HT = 2.7, ZW = 1.6;
  const wallM = TOON({ color: '#d8ccb4' }), trim = TOON({ color: '#b8ab92' }), steel = TOON({ color: '#b8c0c8', roughness: 0.4 }), dark = TOON({ color: '#3a3632' });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2).rotateX(-Math.PI / 2), TOON({ map: wrap(texCarpet(), 4, 1) })); fl.receiveShadow = true; sc.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2).rotateX(Math.PI / 2), TOON({ map: wrap(texCeiling(), 14, 3) })); ce.position.y = HT; sc.add(ce);
  for (let x = -6; x <= 6; x += 2.4) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6).rotateX(Math.PI / 2), glowMat('#fffaf0')); p.position.set(x, HT - 0.005, 0); p.userData.noInk = true; sc.add(p); }
  [[-3, 0], [3, 0]].forEach(([x, z]) => { const p = new THREE.PointLight(0xfff6e8, 0.5, 8); p.position.set(x, HT - 0.3, z); sc.add(p); });
  // the two walls with four door openings each (x = -4.5, -1.5, 1.5, 4.5), steel doors in two halves
  const DX = [-4.5, -1.5, 1.5, 4.5], DW = 1.1, DH = 2.2; S.doors = {};
  [-1, 1].forEach((sd) => { const z = sd * ZW; let x0 = -8;
    DX.forEach((dx) => { const a = dx - DW / 2 - 0.08; bx(sc, a - x0, HT, 0.2, wallM, (x0 + a) / 2, HT / 2, z + sd * 0.1); bx(sc, DW + 0.16, HT - DH, 0.2, wallM, dx, (HT + DH) / 2, z + sd * 0.1); x0 = dx + DW / 2 + 0.08;
      bx(sc, DW + 0.16, 0.08, 0.06, trim, dx, DH + 0.04, z - sd * 0.01); [-1, 1].forEach((s2) => bx(sc, 0.08, DH, 0.06, trim, dx + s2 * (DW / 2 + 0.04), DH / 2, z - sd * 0.01));
      const hv = [-1, 1].map((s2) => bx(sc, DW / 2, DH, 0.04, steel, dx + s2 * DW / 4, DH / 2, z + sd * 0.02)); S.doors[sd + ':' + dx] = { hv, dx };
      const ind = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.135), indMat(dx === -1.5 && sd > 0 ? '▼ 89' : ['▼ 84', '▲ 62', '▼ 89', '▲ 71', '▼ 80', '▼ 86', '▲ 75', '▼ 88'][(DX.indexOf(dx) + (sd > 0 ? 4 : 0))])); ind.position.set(dx, DH + 0.2, z - sd * 0.012); ind.rotation.y = sd > 0 ? Math.PI : 0; ind.userData.noInk = true; sc.add(ind); });
    bx(sc, 8 - x0, HT, 0.2, wallM, (x0 + 8) / 2, HT / 2, z + sd * 0.1);
    // call buttons between the first two doors
    const plate = bx(sc, 0.12, 0.26, 0.02, steel, -3.0, 1.15, z - sd * 0.012); const bU = new THREE.Mesh(new THREE.CircleGeometry(0.028, 18), TOON({ color: '#e8e4dc' })), bD = new THREE.Mesh(new THREE.CircleGeometry(0.028, 18), TOON({ color: '#e8e4dc', emissive: '#ff8a1a', emissiveIntensity: 0 }));
    [bU, bD].forEach((b, k) => { b.position.set(-3.0, 1.2 - k * 0.1, z - sd * 0.025); b.rotation.y = sd > 0 ? Math.PI : 0; sc.add(b); }); if (sd < 0) S.btnDown = bD; });
  // the end wall: SALIDA door (stairs) with its lit sign; the other end: the corridor back to the office
  bx(sc, 0.2, HT, 3.2, wallM, -8, HT / 2, 0); bx(sc, 0.06, 2.1, 0.95, TOON({ color: '#8a2a22' }), -7.88, 1.05, 0); bx(sc, 0.05, 0.04, 0.5, steel, -7.84, 1.0, 0.25);
  textPlane(sc, ['SALIDA'], 0.62, 0.2, -7.86, 2.35, 0, { bg: '#1a6a3a', fg: '#ffffff', ry: Math.PI / 2, glow: 0.9, size: 0.8 }); textPlane(sc, ['ESCALERA A'], 0.5, 0.16, -7.86, 1.75, -0.75, { bg: '#f4f2ea', fg: '#1a1a1a', ry: Math.PI / 2, size: 0.7 });
  bx(sc, 0.2, HT, 3.2, wallM, 8, HT / 2, 0);
  // the packed car behind door (+1, -1.5): wood walls, light, people facing out
  const wood = TOON({ map: g3Tex((x, w, h) => { x.fillStyle = '#7a4e2e'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 32) { x.fillStyle = 'rgba(40,20,10,0.5)'; x.fillRect(i, 0, 2, h); } const Rw = RNG('wood'); for (let k = 0; k < 60; k++) { x.strokeStyle = `rgba(60,30,14,${Rw.r(0.1, 0.25)})`; x.beginPath(); const y = Rw.r(0, h); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + Rw.n(8), w * 0.6, y + Rw.n(8), w, y); x.stroke(); } }, 256, 256) });
  const car = (g, w, d) => { bx(g, w, 0.05, d, TOON({ color: '#4a4440' }), 0, 0, 0); bx(g, w, 0.05, d, TOON({ color: '#efe8da' }), 0, HT, 0); bx(g, w, HT, 0.08, wood, 0, HT / 2, -d / 2); [-1, 1].forEach((s) => bx(g, 0.08, HT, d, wood, s * w / 2, HT / 2, 0));
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, d * 0.6).rotateX(Math.PI / 2), glowMat('#fff6e0')); lp.position.y = HT - 0.03; lp.userData.noInk = true; g.add(lp); const pl = new THREE.PointLight(0xfff0d8, 0.6, 4); pl.position.y = HT - 0.4; g.add(pl); };
  const cg = new THREE.Group(); cg.position.set(-1.5, 0, ZW + 1.2); cg.rotation.y = Math.PI; sc.add(cg); car(cg, 1.9, 2.2);
  const R = RNG('carppl'); S.carPpl = []; for (let k = 0; k < 6; k++) { const P = k % 2 ? officeWoman(R, { hair: R.pick(['#2a1d16', '#3a2618', '#1a1a1a']) }) : officeMan(R); sc.add(P.root); S.carPpl.push({ P, x: -1.5 + (k % 3 - 1) * 0.6, z: ZW + 0.45 + Math.floor(k / 3) * 0.55, ph: R.r(0, TAU) }); }
  // waiting people in the corridor
  S.wait = []; for (let k = 0; k < 8; k++) { const P = k % 3 === 0 ? officeWoman(R, { hair: R.pick(['#2a1d16', '#4a3020', '#1a1a1a']) }) : officeMan(R); sc.add(P.root); S.wait.push({ P, x: R.r(-6.5, 3), z: R.r(-1.0, 1.0), ph: R.r(0, TAU) }); }
  S.D = makeDiego(); sc.add(S.D.root);
  // the POV right hand (index out, to press the button)
  const HR = makeHand(1, { skin: '#d9a47c' }); HR.bones.concat(HR.vessels).forEach((b) => (b.visible = false)); HR.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'PlaneGeometry') o.userData.noInk = true; }); toonify(HR.root); st.cam.add(HR.root); S.HR = HR;
  { const slv = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.062, 0.55, 24).translate(0, -0.33, 0).scale(1.3, 1, 0.9), TOON({ color: '#f4f3ef', roughness: 0.9 })); HR.fore.add(slv); }
  // the car going up (built at x = 40): wood walls, steel doors in front (z = +1.1), the floor indicator above them
  const up = new THREE.Group(); up.position.set(40, 0, 0); sc.add(up); S.upG = up; car(up, 2.4, 2.2); up.children.forEach(() => {});
  bx(up, 0.85, HT, 0.06, wood, -0.8, HT / 2, 1.1); bx(up, 0.85, HT, 0.06, wood, 0.8, HT / 2, 1.1); bx(up, 0.8, DH, 0.04, steel, -0.2, DH / 2, 1.08); bx(up, 0.8, DH, 0.04, steel, 0.2 + 0.0, DH / 2, 1.075); bx(up, 2.4, HT - DH, 0.06, wood, 0, (HT + DH) / 2, 1.1);
  const indC = document.createElement('canvas'); indC.width = 256; indC.height = 96; const indT = new THREE.CanvasTexture(indC); indT.encoding = THREE.sRGBEncoding;
  const ind = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.135), new THREE.MeshBasicMaterial({ map: indT, toneMapped: false })); ind.position.set(0, DH + 0.22, 1.06); ind.rotation.y = Math.PI; ind.userData.noInk = true; up.add(ind);
  S.setInd = (n) => { if (S.indN === n) return; S.indN = n; const x = indC.getContext('2d'); x.fillStyle = '#120c08'; x.fillRect(0, 0, 256, 96); x.fillStyle = '#ff9a2a'; x.font = '800 70px "Segoe UI", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('▲ ' + n, 128, 52); indT.needsUpdate = true; };
  bx(up, 0.1, 0.4, 0.03, steel, 1.0, 1.2, 1.06); const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0, 8).rotateZ(Math.PI / 2), steel); rail.position.set(0, 0.9, -1.04); up.add(rail);
  S.upPpl = [0, 1].map((k) => { const P = k ? officeWoman(R, { hair: '#2a1d16', hairStyle: 'bob', top: '#6a4a8a' }) : officeMan(R, { suit: '#26303e', hairStyle: 'short', hair: '#3a2618' }); sc.add(P.root); return P; });
  return S; }); }
