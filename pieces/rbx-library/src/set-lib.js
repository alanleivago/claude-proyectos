// rbx-library sets. All units: avatar ~5.6 tall, Late Fee ~13.6.
//  street : town street at night (mood 'night'|'morning'). Library facade faces +z at z=-14 (steps z -14..-10.6, x -8..8),
//           clock 11:59 in the pediment, window display bay at x 11..19 (glass z=-10.4, Nico's book at (15, 1.6, -11.6)),
//           drop box at (-13, 0, -8.6) facing +z (slot at y 2.7), lamps, houses across the road (z 20, facing -z). Road z -6..6.
//  room   : Nico's bedroom at night (bed at (0,0,-3) head toward -z, door at x=7 (z 2), window x=-7), shark duvet.
//  stairs : Nico's stair hall at night: 16 steps rising toward -z from (0,0,8) to the landing (y 10, z -6..-12), x -3..3,
//           LATE marks on the steps, moonlit window on the landing wall, ceiling y 21.
//  chute  : the drop-box chute: a ribbed steel tube from (0,0,0) sloping down along -z (30 deg), radius 3.
//  lib    : the library inside (mood 'night'|'day'): aisle along z, shelf walls at x=+-11 rising to y 150 full of face-books,
//           front desk at z=-30 (counter top y 3.7, front face z -28), story corner rug at (0, 0, 6).
'use strict';
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { rng, cnv, tex } = RBX;
  const SM = (c, r = 0.7, m = 0, e, ei = 1) => { const k = new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m }); if (e) { k.emissive = new T.Color(e); k.emissiveIntensity = ei; } return k; };
  const box = (par, w, h, d, m, x, y, z, uv = true) => TK.box(par, w, h, d, m, x, y, z, uv);
  const sign = (text, w, h, o = {}) => { const W = 512, H = Math.round(512 * h / w), t = KIT.textTex(W, H, (q) => { q.fillStyle = o.bg || '#2a2420'; q.fillRect(0, 0, W, H); if (o.border) { q.strokeStyle = o.border; q.lineWidth = 10; q.strokeRect(8, 8, W - 16, H - 16); }
      q.fillStyle = o.fg || '#f4e8c8'; q.textAlign = 'center'; q.textBaseline = 'middle'; const lines = text.split('\n'); let s = o.size || Math.min(H / lines.length * 0.7, 120); q.font = `900 ${s}px ${o.font || 'Arial Black, Arial'}`;
      while (lines.some((l) => q.measureText(l).width > W - 40) && s > 10) { s -= 2; q.font = `900 ${s}px ${o.font || 'Arial Black, Arial'}`; } lines.forEach((l, i) => q.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * s * 1.1 + 2)); });
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: t, roughness: 0.6, emissive: o.glow ? new T.Color('#ffffff') : new T.Color(0), emissiveMap: o.glow ? t : null, emissiveIntensity: o.glow || 0 })); return m; };
  const wallpaper = (c, a, kind = 'stripe') => { const t = KIT.textTex(256, 256, (q, W) => { q.fillStyle = c; q.fillRect(0, 0, W, W);
      if (kind === 'stripe') { q.fillStyle = a; for (let x = 0; x < W; x += 64) q.fillRect(x, 0, 18, W); q.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = 30; x < W; x += 64) q.fillRect(x, 0, 4, W); }
      if (kind === 'stars') { q.fillStyle = a; for (let i = 0; i < 18; i++) { KIT.star(q, (i * 71) % W, (i * 113) % W, 9, 5); q.fill(); } }
      if (kind === 'damask') { q.fillStyle = a; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { q.beginPath(); q.ellipse(x * 64 + 32 + (y % 2) * 32, y * 64 + 32, 12, 22, 0, 0, 7); q.fill(); } }
      KIT.noiseOver(q, W, W, 5, 0.12, 8, 3); }); t.wrapS = t.wrapT = T.RepeatWrapping; return t; };
  const wallM = (c, a, kind, rep) => { const t = wallpaper(c, a, kind); t.repeat.set(rep[0], rep[1]); return new T.MeshStandardMaterial({ map: t, roughness: 0.85 }); };
  const moon = (scene, p, r = 9) => { const g = new T.Group(); const tx = KIT.textTex(256, 256, (q, W) => { const gr = q.createRadialGradient(W * 0.45, W * 0.42, 10, W / 2, W / 2, W / 2); gr.addColorStop(0, '#fffbe8'); gr.addColorStop(1, '#e8e0c8'); q.fillStyle = gr; q.beginPath(); q.arc(W / 2, W / 2, W / 2 - 2, 0, 7); q.fill();
      q.fillStyle = 'rgba(160,150,130,0.35)'; [[90, 100, 26], [160, 150, 18], [120, 180, 12], [170, 80, 10]].forEach(([x, y, rr]) => { q.beginPath(); q.arc(x, y, rr, 0, 7); q.fill(); }); });
    const d = new T.Mesh(new T.CircleGeometry(r, 48), new T.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false, fog: false })); g.add(d); d.material.color.setScalar(1.6);
    const halo = new T.Mesh(new T.CircleGeometry(r * 3, 48), new T.MeshBasicMaterial({ map: KIT.textTex(128, 128, (q, W) => { const gr = q.createRadialGradient(W / 2, W / 2, 4, W / 2, W / 2, W / 2); gr.addColorStop(0, 'rgba(190,200,255,0.55)'); gr.addColorStop(1, 'rgba(190,200,255,0)'); q.fillStyle = gr; q.fillRect(0, 0, W, W); }), transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending }));
    halo.position.z = -1; g.add(halo); g.position.copy(p); g.lookAt(0, p.y * 0.3, 0); scene.add(g); return g; };
  const stars = (scene, n = 500, R = 900) => { const r = rng(5), pos = []; for (let i = 0; i < n; i++) { const a = r() * PI * 2, e = 0.12 + r() * 1.3; pos.push(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); const p = new T.Points(g, new T.PointsMaterial({ color: '#dfe6ff', size: 2.2, sizeAttenuation: false, fog: false })); scene.add(p); return p; };
  const glowMat = (c, k = 3) => new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: 0.4 });
  const L = (scene, c, i, d, x, y, z, dec = 2, sh = false) => { const l = new T.PointLight(c, i, d, dec); l.position.set(x, y, z); if (sh) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.002; } scene.add(l); return l; };
  const keyLight = (scene, c, i, p, half = 40, far = 200) => { const k = new T.DirectionalLight(c, i); k.position.set(...p); k.castShadow = true; k.shadow.mapSize.set(4096, 4096); k.shadow.bias = -0.0004; k.shadow.normalBias = 0.03; Object.assign(k.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far }); scene.add(k); scene.add(k.target); return k; };

  // ---------------- drop box ----------------
  LF.dropBox = function () { const g = new T.Group(), blue = new T.MeshPhysicalMaterial({ color: '#1f4fa8', roughness: 0.35, clearcoat: 0.6, metalness: 0.3 }), dark = SM('#141820', 0.6), steel = SM('#b8bcc4', 0.3, 0.9);
    box(g, 2.4, 3.0, 2.0, blue, 0, 1.75, 0, false); const top = new T.Mesh(new T.CylinderGeometry(1.0, 1.0, 2.4, 24, 1, false, 0, PI), blue); top.rotation.z = PI / 2; top.rotation.y = PI / 2; top.scale.set(1, 1, 1); top.position.set(0, 3.25, 0); top.castShadow = true; g.add(top);
    [[-1.0, -0.8], [1.0, -0.8], [-1.0, 0.8], [1.0, 0.8]].forEach(([x, z]) => box(g, 0.25, 0.3, 0.25, dark, x, 0.15, z, false));
    // pull-down chute flap + handle + slot
    const flap = box(g, 1.8, 0.8, 0.12, SM('#2a5ac0', 0.35, 0.3), 0, 2.75, 1.06, false); flap.rotation.x = -0.18; box(g, 1.7, 0.18, 0.1, dark, 0, 2.38, 1.04, false); const h = box(g, 1.0, 0.1, 0.1, steel, 0, 2.95, 1.2, false);
    const lab = sign('BOOK RETURN', 2.0, 0.55, { bg: '#f4f2ea', fg: '#1f4fa8', border: '#1f4fa8' }); lab.position.set(0, 1.85, 1.012); g.add(lab);
    const l2 = sign('DUE IS DUE', 1.4, 0.32, { bg: '#c81e1e', fg: '#ffffff' }); l2.position.set(0, 1.2, 1.012); g.add(l2);
    const l3 = sign('OPEN 24 HRS', 1.2, 0.26, { bg: '#f4f2ea', fg: '#141414' }); l3.position.set(0, 0.75, 1.012); g.add(l3);
    g.userData.slot = V(0, 2.4, 1.1); return ENV.shadow(g); };
  // library card with N stamps
  LF.card = function (n = 212, o = {}) { const t = KIT.textTex(512, 320, (q, W, H) => { q.fillStyle = '#f6eed6'; q.fillRect(0, 0, W, H); q.fillStyle = '#c8281e'; q.fillRect(0, 0, W, 46); q.fillStyle = '#fff'; q.font = '900 30px Arial Black, Arial'; q.textAlign = 'left'; q.fillText('LIBRARY CARD  #0212', 14, 34);
      q.strokeStyle = 'rgba(40,60,140,0.35)'; q.lineWidth = 1; for (let y = 60; y < H; y += 10) { q.beginPath(); q.moveTo(0, y); q.lineTo(W, y); q.stroke(); }
      const r = rng(3); for (let i = 0; i < n; i++) { const c = i % 23, rr = Math.floor(i / 23), x = 14 + c * 21.5 + (r() - 0.5) * 3, y = 58 + rr * 27 + (r() - 0.5) * 3; q.save(); q.translate(x + 9, y + 10); q.rotate((r() - 0.5) * 0.5); q.strokeStyle = i % 5 ? 'rgba(122,58,208,0.85)' : 'rgba(200,30,30,0.85)'; q.lineWidth = 2; q.strokeRect(-9, -7, 18, 14); q.fillStyle = q.strokeStyle; q.font = '900 7px Arial'; q.textAlign = 'center'; q.fillText('DUE', 0, 3); q.restore(); }
      q.fillStyle = '#c8281e'; q.font = '900 28px Arial Black, Arial'; q.textAlign = 'right'; q.fillText('x' + n, W - 12, H - 12); });
    const m = new T.Mesh(new T.BoxGeometry(o.w || 1.6, (o.w || 1.6) * 0.62, 0.03), [SM('#f6eed6'), SM('#f6eed6'), SM('#f6eed6'), SM('#f6eed6'), new T.MeshStandardMaterial({ map: t, roughness: 0.6 }), SM('#f6eed6')]); m.castShadow = true; return m; };

  // ================= STREET =================
  SETS.street = async function (ctx) {
    const scene = new T.Scene(); scene.fog = new T.Fog('#1a1a40', 60, 260);
    const sky = ENV.sky(scene, ctx.renderer, { top: '#0a0a2a', mid: '#1c1a4a', hor: '#3a2a5a', sun: [-0.3, 0.45, -0.8], sunC: '#c8d0ff', sunK: 0, glow: 0.15, env: true });
    const hemi = new T.HemisphereLight('#6a70d8', '#1a1830', 1.5); scene.add(hemi);
    const key = keyLight(scene, '#a8b4ff', 3.0, [-40, 60, -50], 50);
    const st = stars(scene), mn = moon(scene, V(-60, 95, -240), 14);
    // ground: road, curbs, sidewalks
    const asph = ENV.mt(ENV.T.asphalt(), 6), side = new T.MeshStandardMaterial({ color: '#9a968e', roughness: 0.85 }); side.map = KIT.textTex(256, 256, (q, W) => { q.fillStyle = '#a8a49c'; q.fillRect(0, 0, W, W); q.strokeStyle = '#6a665e'; q.lineWidth = 4; q.strokeRect(0, 0, W, W); KIT.noiseOver(q, W, W, 3, 0.25, 8, 3); }); side.map.wrapS = side.map.wrapT = T.RepeatWrapping; side.map.repeat.set(1 / 4, 1 / 4);
    TK.planeG(scene, 300, 12, asph, 0, 0, 0); TK.planeG(scene, 300, 6, side, 0, 0.3, -9); TK.planeG(scene, 300, 6, side, 0, 0.3, 9);
    box(scene, 300, 0.3, 6, side, 0, 0.15, -9); box(scene, 300, 0.3, 6, side, 0, 0.15, 9); TK.planeG(scene, 300, 60, ENV.mt(ENV.T.grass(), 6), 0, 0.02, -42); TK.planeG(scene, 300, 60, ENV.mt(ENV.T.grass(), 6), 0, 0.02, 42);
    for (let x = -140; x < 140; x += 8) { const d = new T.Mesh(new T.PlaneGeometry(3.6, 0.3), SM('#e8d870', 0.6)); d.rotation.x = -PI / 2; d.position.set(x, 0.02, 0); scene.add(d); }
    // ---- library ----
    const lib = new T.Group(); lib.position.set(0, 0.3, -14); scene.add(lib);
    const stone = ENV.mt(ENV.T.stone(), 3), lime = new T.MeshStandardMaterial({ color: '#e8e0cc', roughness: 0.75 }), brick = (() => { const t = KIT.bricks(512, 31, { rows: 8, cols: 4, color: '#9a4a36', mortar: '#d8cfc0' }); const m = new T.MeshStandardMaterial({ map: tex(t.c), roughness: 0.9 }); m.map.wrapS = m.map.wrapT = T.RepeatWrapping; m.map.repeat.set(1 / 4, 1 / 4); return m; })();
    box(lib, 40, 17, 22, brick, 0, 8.5, -11); box(lib, 41, 1.2, 23, lime, 0, 17.6, -11); box(lib, 41, 1.0, 23, lime, 0, 0.5, -11);
    // portico: steps, 6 columns, entablature with lettering, pediment with the clock
    for (let k = 0; k < 5; k++) box(lib, 18 - k * 0.4, 0.5, 4.2 - k * 0.7, lime, 0, 0.25 + k * 0.5, 2.0 - k * 0.35);
    const colM = new T.MeshStandardMaterial({ color: '#f0eadc', roughness: 0.6 }); for (let i = 0; i < 6; i++) { const x = -7.5 + i * 3; const c = new T.Mesh(new T.CylinderGeometry(0.62, 0.72, 12, 20), colM); c.position.set(x, 2.5 + 6, 1.4); c.castShadow = c.receiveShadow = true; lib.add(c); box(lib, 1.7, 0.5, 1.7, lime, x, 2.75, 1.4); box(lib, 1.7, 0.5, 1.7, lime, x, 14.7, 1.4); }
    box(lib, 19, 2.2, 2.6, lime, 0, 16.1, 1.4); const frieze = sign('PUBLIC  LIBRARY', 16, 1.4, { bg: '#e8e0cc', fg: '#3a3428', font: 'Georgia, serif', size: 64 }); frieze.position.set(0, 16.1, 2.71); lib.add(frieze);
    const ped = new T.Shape(); ped.moveTo(-10, 0); ped.lineTo(10, 0); ped.lineTo(0, 5.2); ped.closePath(); const pg = new T.Mesh(new T.ExtrudeGeometry(ped, { depth: 2.4, bevelEnabled: false }), lime); pg.position.set(0, 17.2, 0.2); pg.castShadow = true; lib.add(pg);
    const clockT = (h, m) => KIT.textTex(256, 256, (q, W) => { q.fillStyle = '#f6f0dc'; q.beginPath(); q.arc(128, 128, 124, 0, 7); q.fill(); q.strokeStyle = '#2a2420'; q.lineWidth = 8; q.stroke(); q.fillStyle = '#2a2420'; for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2; q.fillRect(128 + Math.sin(a) * 100 - 4, 128 - Math.cos(a) * 100 - 8, 8, 16); }
      const hand = (a, l, w) => { q.lineWidth = w; q.lineCap = 'round'; q.beginPath(); q.moveTo(128, 128); q.lineTo(128 + Math.sin(a) * l, 128 - Math.cos(a) * l); q.stroke(); }; hand(((h % 12) + m / 60) / 12 * PI * 2, 58, 10); q.strokeStyle = '#a01818'; hand(m / 60 * PI * 2, 92, 6); });
    const clock = new T.Mesh(new T.CircleGeometry(1.7, 40), new T.MeshStandardMaterial({ map: clockT(11, 59), emissive: '#fff2c8', emissiveMap: clockT(11, 59), emissiveIntensity: 1.2 })); clock.position.set(0, 19.1, 2.62); lib.add(clock); const ring = new T.Mesh(new T.TorusGeometry(1.75, 0.14, 10, 40), SM('#2a2420', 0.4, 0.6)); ring.position.copy(clock.position); lib.add(ring);
    // doors + tall arched windows (lit warm)
    const winM = new T.MeshPhysicalMaterial({ color: '#2a1e10', roughness: 0.1, clearcoat: 1, emissive: '#ffb050', emissiveIntensity: 1.6 }), frame = SM('#3a2a1e', 0.5);
    box(lib, 3.6, 6.5, 0.3, SM('#5a2a18', 0.45), 0, 5.75, 0.05); box(lib, 4.4, 0.5, 0.5, frame, 0, 9.2, 0.1);
    [-12.5, -16.5, 12.5, 16.5].forEach((x) => { const w = box(lib, 2.6, 6.5, 0.2, winM, x, 10.5, 0.05); const a = new T.Mesh(new T.CircleGeometry(1.3, 20, 0, PI), winM); a.position.set(x, 13.75, 0.06); lib.add(a); box(lib, 0.15, 7.6, 0.3, frame, x, 11, 0.1); box(lib, 2.8, 0.2, 0.3, frame, x, 10.5, 0.1); box(lib, 3.2, 0.4, 0.6, lime, x, 7.1, 0.2); });
    [-4.5, 4.5].forEach((x) => { box(lib, 2.2, 5, 0.2, winM, x, 6.5, 0.05); box(lib, 0.12, 5, 0.26, frame, x, 6.5, 0.1); });
    // window display bay (right of the steps, street level): protruding glass box with books on stands + Nico's book
    const bay = new T.Group(); bay.position.set(15, 0, 0); lib.add(bay); const glass = new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transmission: 0.0, transparent: true, opacity: 0.05, clearcoat: 1, depthWrite: false });
    box(bay, 8.4, 0.8, 3.2, lime, 0, 0.4, 1.6); box(bay, 8.4, 0.5, 3.4, lime, 0, 6.85, 1.6); [-4.1, 4.1].forEach((x) => box(bay, 0.3, 6.6, 3.2, frame, x, 3.6, 1.6));
    const gl = new T.Mesh(new T.PlaneGeometry(8, 6), glass); gl.position.set(0, 3.8, 3.22); bay.add(gl); gl.renderOrder = 5;
    const inner = SM('#5a1a28', 0.9); box(bay, 8, 6, 0.2, wallM('#6a1e30', '#7a2a3a', 'damask', [2, 2]), 0, 3.8, 0.12); box(bay, 8, 0.2, 3, SM('#7a4a2a', 0.6), 0, 0.9, 1.6);
    const nb = BOOK.face(Object.assign({ w: 2.5, h: 3.3, d: 0.45 }, BOOK.NICO)); nb.position.set(0, 1.55, 1.7); nb.rotation.x = -0.12; bay.add(nb); box(bay, 1.6, 0.55, 1.2, SM('#e8e0cc', 0.6), 0, 1.25, 1.5);
    const tag = sign('NEW ARRIVAL!', 2.2, 0.5, { bg: '#f2c01a', fg: '#a01818' }); tag.position.set(0, 4.55, 1.9); bay.add(tag);
    [[-2.6, 0.95, 'SPIDERS', '#2a5a2e'], [-1.6, 0.8, 'BIG TRUCKS', '#c86a1a'], [1.7, 0.85, 'MOON', '#2a2a6a'], [2.7, 1.0, 'DINOS', '#8a1e2a']].forEach(([x, s, t, c], i) => { const b = (i === 1 ? BOOK.face : BOOK.plain)(Object.assign({ w: 1.3 * s, h: 1.7 * s, d: 0.3, cover: c, title: t }, i === 1 ? { who: BOOK.KID(5), sub: 'LATE 1988' } : {})); b.position.set(x, 1.0, 1.5 + (i % 2) * 0.4); b.rotation.y = -x * 0.08; bay.add(b); });
    const spot = new T.SpotLight('#fff0d0', 16, 9, 0.5, 0.6, 1.5); spot.position.set(0, 6.4, 2.4); spot.target.position.set(0, 1.5, 1.6); bay.add(spot); bay.add(spot.target); const bl = new T.PointLight('#ffb060', 6, 8, 2); bl.position.set(0, 4, 2); bay.add(bl);
    // bunting of little stars inside the display
    for (let i = 0; i < 9; i++) { const s = new T.Mesh(new T.CircleGeometry(0.22, 5), SM(['#f2c01a', '#f07ad0', '#18b8d8'][i % 3], 0.5)); s.position.set(-3.6 + i * 0.9, 6.0 - Math.sin((i / 8) * PI) * 0.6, 2.9); bay.add(s); }
    lib.userData.bookPos = V(15, 1.55 + 0.3 + 1.25, -14 + 1.7);
    // interior spill lights
    L(scene, '#ffb060', 30, 30, -14, 10, -11); L(scene, '#ffb060', 30, 30, 14, 10, -11); L(scene, '#ffb060', 20, 18, 0, 6, -11);
    // drop box + its little lamp
    const db = LF.dropBox(); db.position.set(-13, 0.3, -8.6); scene.add(db);
    // lamps
    const lamps = []; [[-22, -6.6, 0], [-4, -6.6, 0], [22, -6.6, PI], [-14, 6.6, PI], [10, 6.6, PI]].forEach(([x, z, ry]) => { const l = TK.lamp(true); l.position.set(x, 0.3, z); l.rotation.y = ry + (z < 0 ? PI / 2 : -PI / 2); scene.add(l); lamps.push(l); });
    // houses across the street (facing -z) + side houses
    const houses = []; [[-34, 1], [-18, 2], [0, 3], [18, 4], [34, 5]].forEach(([x, s]) => { const h = ENV.house({ seed: s + 10, lit: true, w: 13 }); h.position.set(x, 0, 22); h.rotation.y = PI; scene.add(h); houses.push(h); });
    [[-36, -20, 6], [36, -20, 7], [-56, -18, 8], [56, -18, 9]].forEach(([x, z, s]) => { const h = ENV.house({ seed: s + 20, lit: true }); h.position.set(x, 0, z); scene.add(h); houses.push(h); });
    [[-26, -10.5], [26, -10.5], [-30, 10.5], [26, 10.5]].forEach(([x, z], i) => { const t = ENV.tree({ seed: i + 3 }); t.position.set(x, 0.3, z); t.scale.setScalar(1.2); scene.add(t); });
    // a hedge and bench by the library
    box(scene, 6, 1.4, 1.2, SM('#2e5a2a', 0.9), -22, 1.0, -12.5); const bench = new T.Group(); box(bench, 4, 0.2, 1.2, ENV.mt(ENV.T.wood('#7a5232'), 1), 0, 1.2, 0); box(bench, 4, 1, 0.2, ENV.mt(ENV.T.wood('#7a5232'), 1), 0, 1.9, -0.5); [-1.8, 1.8].forEach((x) => box(bench, 0.2, 1.2, 1.2, SM('#1e2228', 0.4, 0.6), x, 0.6, 0)); bench.position.set(-6, 0.3, -9.6); scene.add(bench);
    const set = { scene, lib, db, clock, nb, bay, sky, lamps };
    set.mood = (m) => { if (set.cur === m) return; set.cur = m; const U = sky.material.uniforms, night = m !== 'morning';
      if (night) { U.top.value.set('#0a0a2a'); U.mid.value.set('#1c1a4a'); U.hor.value.set('#3a2a5a'); hemi.color.set('#6a70d8'); hemi.groundColor.set('#1a1830'); hemi.intensity = 1.5; key.color.set('#a8b4ff'); key.intensity = 3.0; key.position.set(-40, 60, -50); scene.fog.color.set('#1a1a40'); }
      else { U.top.value.set('#3a86e8'); U.mid.value.set('#9ad0f8'); U.hor.value.set('#ffe6c8'); U.sunC.value.set('#ffe0b0'); U.sunK.value = 1; U.sunDir.value.set(0.7, 0.3, 0.6).normalize(); hemi.color.set('#8fc0ff'); hemi.groundColor.set('#8a7a60'); hemi.intensity = 1.7; key.color.set('#ffe6c0'); key.intensity = 7; key.position.set(60, 40, 50); scene.fog.color.set('#e8ecf0'); }
      st.visible = night; mn.visible = night; winM.emissiveIntensity = night ? 1.6 : 0.25; lamps.forEach((l) => { l.children.forEach((c) => { if (c.isPointLight) c.visible = night; if (c.material && c.material.emissive) c.material.emissiveIntensity = night ? 5 : 0.3; }); });
      houses.forEach((h) => h.traverse((c) => { if (c.isPointLight) c.visible = night; if (c.material && c.material.emissiveIntensity > 1) c.material.emissiveIntensity = night ? 2.2 : 0; if (c.material && c.material.userData.lit === undefined && c.material.emissiveIntensity !== undefined && c.material.emissive && c.material.emissive.r > 0.5) c.material.userData.lit = 1; }));
      TK.rebake(scene, sky, ctx.renderer); };
    set.mood('night'); return set; };

  // ================= NICO'S ROOM =================
  SETS.room = async function (ctx) {
    const scene = new T.Scene(); scene.background = new T.Color('#05060f');
    scene.add(new T.HemisphereLight('#4a58b8', '#140e20', 1.4));
    const wood = ENV.mt(ENV.T.wood('#7a5a3a'), 2); TK.planeG(scene, 16, 16, wood, 0, 0, 0);
    const wm = wallM('#2a4a8a', '#f2d860', 'stars', [3, 2]); box(scene, 16, 10, 0.3, wm, 0, 5, -8); box(scene, 0.3, 10, 16, wm, -8, 5, 0); box(scene, 0.3, 10, 16, wm, 8, 5, 0); box(scene, 16, 0.3, 16, SM('#1a2238', 0.9), 0, 10, 0);
    // window (left wall) with moon beam
    const glassN = new T.MeshStandardMaterial({ color: '#1a2a5a', emissive: '#4a6ac8', emissiveIntensity: 0.8 }); box(scene, 0.2, 3.6, 3.6, glassN, -7.84, 5.4, -1); box(scene, 0.4, 3.9, 0.2, SM('#f4f0e6'), -7.8, 5.4, -1); box(scene, 0.4, 0.2, 3.9, SM('#f4f0e6'), -7.8, 5.4, -1);
    const bm = RBX.beamMat('#9ab0ff', 0.14); scene.add(RBX.beam(V(-7.6, 6.6, -1), V(1, -0.55, -0.1), 3.4, 3.4, 13, bm));
    const moonL = new T.SpotLight('#9ab0ff', 160, 30, 0.45, 0.6, 1.4); moonL.position.set(-7.4, 6.8, -1); moonL.target.position.set(1, 0.5, -2); moonL.castShadow = true; moonL.shadow.mapSize.set(2048, 2048); scene.add(moonL); scene.add(moonL.target);
    // bed: frame, shark duvet, pillow, headboard
    const bed = new T.Group(); bed.position.set(0, 0, -4); scene.add(bed); const fr = SM('#f4f0e6', 0.6); box(bed, 5, 1.4, 8, fr, 0, 0.7, 0); box(bed, 5.2, 4, 0.4, fr, 0, 2, -4); box(bed, 4.8, 0.8, 7.6, SM('#f8f8ff', 0.9), 0, 1.8, 0);
    const duv = new T.Mesh(RBX.rbox(5.1, 0.6, 5.2, 0.25, 4), GN.mat('sharks', { c: '#7ac0e8', tile: 1.6 })); duv.position.set(0, 2.35, 1.2); duv.castShadow = duv.receiveShadow = true; bed.add(duv);
    const pil = new T.Mesh(RBX.rbox(3.2, 0.7, 1.6, 0.3, 4), SM('#ffffff', 0.9)); pil.position.set(0, 2.5, -2.9); pil.castShadow = true; bed.add(pil);
    // shark book poking from under the pillow
    const sb = BOOK.plain({ cover: '#2a6ab0', title: 'THE BIG BOOK OF SHARKS', w: 1.6, h: 2.0, d: 0.3 }); sb.rotation.set(-PI / 2, 0, 0.5); sb.position.set(1.6, 2.25, -2.0); bed.add(sb);
    // poster, shelf with books, night light, toys
    const post = sign('SHARK\nWEEK', 3, 4, { bg: '#0a3a6a', fg: '#f4f8fa' }); post.position.set(3.5, 6.5, -7.8); scene.add(post);
    const sh = new T.Group(); sh.position.set(6.8, 0, -2); scene.add(sh); box(sh, 1.6, 6, 4, ENV.mt(ENV.T.wood('#c8905a'), 1.5), 0, 3, 0); for (let k = 0; k < 3; k++) for (let i = 0; i < 7; i++) box(sh, 1.2, 1.3 + (i % 3) * 0.2, 0.4, SM(['#e84040', '#2a8ad8', '#f2c01a', '#38a060', '#8a3ad0'][(i + k) % 5], 0.6), -0.1, 0.9 + k * 1.9 + (i % 3) * 0.1, -1.6 + i * 0.5);
    const nl = new T.Mesh(new T.SphereGeometry(0.4, 16, 12), glowMat('#ffd890', 4)); nl.position.set(-6.5, 1.2, -6.8); scene.add(nl); L(scene, '#ffc070', 8, 8, -6.3, 1.4, -6.5);
    const rug = new T.Mesh(new T.CircleGeometry(3, 40), SM('#e8c040', 0.95)); rug.rotation.x = -PI / 2; rug.position.set(1, 0.02, 3); scene.add(rug);
    // doorway (right wall, toward +z) with a dark hall
    box(scene, 0.4, 7.4, 3.4, SM('#05050a', 1), 7.9, 3.7, 4.5);
    // nightstand + alarm clock (left of the bed) and a wall calendar
    const ns = new T.Group(); ns.position.set(-3.6, 0, -6.4); scene.add(ns); box(ns, 1.8, 2.2, 1.6, ENV.mt(ENV.T.wood('#c8905a'), 1.5), 0, 1.1, 0, false);
    const CT = {}, clockT = (txt) => CT[txt] || (CT[txt] = KIT.textTex(256, 128, (q, W, H) => { q.fillStyle = '#101010'; q.fillRect(0, 0, W, H); q.fillStyle = '#ff3a2a'; q.font = '900 84px Courier New, monospace'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(txt, W / 2, H / 2 + 4); }));
    const ck = new T.Group(); box(ck, 1.3, 0.7, 0.5, SM('#e8e0d0', 0.4), 0, 0.35, 0, false); const face = new T.Mesh(new T.PlaneGeometry(1.1, 0.5), new T.MeshStandardMaterial({ map: clockT('11:58'), emissive: '#ffffff', emissiveMap: clockT('11:58'), emissiveIntensity: 1.4 })); face.position.set(0, 0.36, 0.26); ck.add(face); ck.position.set(0, 2.2, 0.1); ck.rotation.y = 0.4; ns.add(ck);
    const cal = sign('SUNDAY\n\u2192 DUE!', 1.8, 2.2, { bg: '#f6f0e0', fg: '#c81e1e', border: '#c81e1e' }); cal.position.set(-5.2, 6.2, -7.82); scene.add(cal);
    const duvN = duv.material, duvH = GN.mat('knit', { c: '#f28a1e', tile: 1.2, bands: 2 }), postN = post.material.map, postH = KIT.textTex(512, 683, (q, W, H) => { q.fillStyle = '#f28a1e'; q.fillRect(0, 0, W, H); q.fillStyle = '#fff'; q.font = '900 120px Arial Black, Arial'; q.textAlign = 'center'; q.fillText('DINO', W / 2, H * 0.42); q.fillText('CLUB', W / 2, H * 0.64); });
    const set = { scene, bed, clockFace: face, cal, clockT };
    set.mode = (m) => { const hero = m === 'hero'; duv.material = hero ? duvH : duvN; post.material.map = hero ? postH : postN; post.material.needsUpdate = true; cal.visible = !hero; ck.visible = true; face.material.map = face.material.emissiveMap = clockT(hero ? '11:58' : '8:30'); face.material.needsUpdate = true; };
    set.mode('nico'); return set; };

  // ================= STAIRS =================
  SETS.stairs = async function (ctx) {
    const scene = new T.Scene(); scene.background = new T.Color('#04050c'); scene.fog = new T.Fog('#0a0c1e', 18, 70);
    scene.add(new T.HemisphereLight('#3a4aa0', '#0e0a18', 1.3)); L(scene, '#6a5ab8', 14, 20, 0, 6, 10);
    const N = 16, rise = 10 / N, run = 14 / N, W = 6.4;
    const tread = ENV.mt(ENV.T.wood('#5a3a22'), 2), riser = SM('#e8e0d0', 0.7), runner = new T.MeshStandardMaterial({ color: '#7a1a24', roughness: 0.95 });
    TK.planeG(scene, 20, 20, tread, 0, 0, 14);
    for (let k = 0; k < N; k++) { const y = (k + 1) * rise, z = 8 - k * run; box(scene, W, rise, run + 0.02, riser, 0, y - rise / 2, z - run / 2, false); box(scene, W + 0.1, 0.12, run + 0.12, tread, 0, y + 0.06, z - run / 2 + 0.05); box(scene, 3.4, 0.03, run, runner, 0, y + 0.135, z - run / 2); }
    box(scene, W, 0.4, 8, tread, 0, 10 - 0.2, -10); // landing
    // walls: wallpaper both sides, wainscot, photos; landing wall with tall moon window
    const wm = wallM('#5a6a5a', '#4a5a4a', 'stripe', [3, 4]); box(scene, 0.4, 26, 34, wm, -3.4, 13, -2); box(scene, 0.4, 26, 34, wm, 3.4, 13, -2); box(scene, W + 1, 26, 0.4, wm, 0, 13, -14.2);
    const wain = SM('#3a2a20', 0.6); for (let k = 0; k <= N; k++) { const y = k * rise, z = 8 - k * run; [-3.15, 3.15].forEach((x) => box(scene, 0.12, 0.18, run + 0.1, wain, x, y + 3.2, z - run / 2)); }
    box(scene, W + 1, 0.4, 34, SM('#1a1820', 0.9), 0, 22, -2);
    const glassN = new T.MeshStandardMaterial({ color: '#1a2a5a', emissive: '#5a7ad8', emissiveIntensity: 1.1 }); box(scene, 3, 7, 0.2, glassN, 0, 15, -13.95); box(scene, 3.4, 0.3, 0.4, SM('#e8e0d0'), 0, 11.4, -13.9); box(scene, 0.15, 7, 0.3, SM('#e8e0d0'), 0, 15, -13.9); box(scene, 3, 0.15, 0.3, SM('#e8e0d0'), 0, 15, -13.9);
    const mb = RBX.beamMat('#8aa8ff', 0.2); scene.add(RBX.beam(V(0, 16, -13.8), V(0, -0.55, 1), 3, 6, 26, mb));
    const moonL = new T.SpotLight('#8aa8ff', 260, 50, 0.4, 0.7, 1.3); moonL.position.set(0, 16, -13.6); moonL.target.position.set(0, 2, 4); moonL.castShadow = true; moonL.shadow.mapSize.set(2048, 2048); moonL.shadow.bias = -0.0008; scene.add(moonL); scene.add(moonL.target);
    // family photo frames going up the wall
    const r = rng(8); for (let k = 0; k < 6; k++) { const y = 4 + k * 1.7 + 3, z = 6 - k * 2.4, fm = new T.Group(); box(fm, 0.15, 1.6, 1.3, SM('#c8a040', 0.4, 0.6), 0, 0, 0, false); const ph = new T.Mesh(new T.PlaneGeometry(1.0, 1.3), new T.MeshStandardMaterial({ map: KIT.textTex(128, 160, (q) => { q.fillStyle = ['#8ab0d8', '#d8b08a', '#a8d08a'][k % 3]; q.fillRect(0, 0, 128, 160); BOOK.portrait(q, 64, 84, 64, { skin: '#F4A878', hair: k % 2 ? 'spike' : 'buns', hairC: k % 2 ? '#1E6FE0' : '#E0141E', face: ['F5', 'F6', 'F2'][k % 3] }); }) })); ph.rotation.y = PI / 2; ph.position.x = 0.09; fm.add(ph); fm.position.set(-3.15, y, z); fm.rotation.z = (r() - 0.5) * 0.15; scene.add(fm); }
    // banister on the right with spindles
    const rail = SM('#3a2418', 0.4); const rc = new T.LineCurve3(V(2.7, 3.6, 8.4), V(2.7, 13.6, -5.8)); scene.add(new T.Mesh(new T.TubeGeometry(rc, 4, 0.14, 8), rail)); for (let k = 0; k < N; k++) box(scene, 0.12, 2.6, 0.12, rail, 2.7, (k + 1) * rise + 1.3, 8 - k * run - run / 2, false);
    // LATE marks on every step (from the bottom up to step 9)
    const marks = []; for (let k = 0; k < 10; k++) { const m = LF.mark(k % 3 === 2 ? 'DUE' : 'LATE', k % 3 === 2 ? '#8a3ad0' : '#d01818', 1.6, 0.8, (r() - 0.5) * 0.5); m.rotation.x = -PI / 2; m.rotation.z = (r() - 0.5) * 0.6; m.position.set((k % 2 ? 0.9 : -0.9), (k + 1) * rise + 0.16, 8 - k * run - run / 2); scene.add(m); marks.push(m); }
    // the night-light at the top of the stairs (Nico's door ajar, warm sliver)
    box(scene, 0.3, 7, 3, SM('#2a1a12', 0.6), -3.15, 13.5, -10); const sliver = box(scene, 0.12, 6.6, 0.25, glowMat('#ffc070', 1.1), -3.0, 13.3, -8.4, false); L(scene, '#ffb060', 10, 12, -2.4, 13, -8.6);
    return { scene, rise, run, N, stepY: (k) => (k + 1) * rise, stepZ: (k) => 8 - k * run - run / 2 }; };

  // ================= CHUTE =================
  SETS.chute = async function (ctx) {
    const scene = new T.Scene(); scene.background = new T.Color('#020204'); scene.fog = new T.Fog('#0a0612', 10, 60);
    const g = new T.Group(); g.rotation.x = -0.5; scene.add(g);   // tube axis = local -z, tilted down
    const steel = (() => { const t = KIT.textTex(512, 512, (q, W) => { q.fillStyle = '#7a7e88'; q.fillRect(0, 0, W, W); const r = rng(4); for (let i = 0; i < 900; i++) { q.strokeStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.06)`; q.lineWidth = 1; q.beginPath(); const x = r() * W, y = r() * W; q.moveTo(x, y); q.lineTo(x + r() * 60, y + (r() - 0.5) * 4); q.stroke(); }
      q.fillStyle = 'rgba(60,40,20,0.25)'; for (let i = 0; i < 30; i++) { q.beginPath(); q.ellipse(r() * W, r() * W, 10 + r() * 30, 4 + r() * 10, r() * 3, 0, 7); q.fill(); } }); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 8); return new T.MeshStandardMaterial({ map: t, roughness: 0.32, metalness: 0.85, side: T.BackSide }); })();
    const R = 3, LEN = 60, tube = new T.Mesh(new T.CylinderGeometry(R, R, LEN, 40, 1, true), steel); tube.rotation.x = PI / 2; tube.position.z = -LEN / 2 + 6; tube.receiveShadow = true; g.add(tube);
    const rib = SM('#5a5e66', 0.4, 0.9); for (let z = 4; z > -LEN + 6; z -= 3) { const t = new T.Mesh(new T.TorusGeometry(R - 0.05, 0.12, 8, 40), rib); t.position.z = z; g.add(t); for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2; const rv = new T.Mesh(new T.SphereGeometry(0.07, 6, 5), rib); rv.position.set(Math.cos(a) * (R - 0.08), Math.sin(a) * (R - 0.08), z + 0.3); g.add(rv); } }
    // warm/green glow at the bottom end + a cold leak at the top (the flap)
    const end = new T.Mesh(new T.CircleGeometry(R, 32), new T.MeshBasicMaterial({ color: '#9affc8', toneMapped: false })); end.material.color.multiplyScalar(1.6); end.position.z = -LEN + 6.2; g.add(end);
    L(scene, '#6affb0', 0, 0, 0, 0, 0); const gl = new T.PointLight('#7affc0', 120, 60, 1.6); gl.position.set(0, 0, -LEN + 10); g.add(gl);
    const top = new T.PointLight('#8aa8ff', 30, 14, 1.8); top.position.set(0, 1.5, 4); g.add(top); const fill = new T.PointLight('#ffc890', 14, 10, 2); fill.position.set(0, 1.8, -6); g.add(fill);
    // books sliding down with you
    const books = []; [['SHARKS', '#2a6ab0', -1.6, -8, 0.6], ['MOON', '#2a2a6a', 1.4, -11, -0.8], ['DINOS', '#8a1e2a', -0.6, -14, 1.9], ['POEMS', '#7a3ad0', 1.8, -4, 2.4]].forEach(([t, c, x, z, r]) => { const b = BOOK.plain({ title: t, cover: c, w: 1.2, h: 1.6, d: 0.28 }); b.position.set(x, -R + 0.3 + Math.abs(x) * 0.25, z); b.rotation.set(-PI / 2 + 0.2, r, 0); g.add(b); books.push(b); });
    return { scene, g, R, books }; };

  // ================= LIBRARY (inside) =================
  SETS.lib = async function (ctx) {
    const scene = new T.Scene(); scene.background = new T.Color('#05070a'); scene.fog = new T.FogExp2('#100c2a', 0.009);
    const hemi = new T.HemisphereLight('#5a5ad0', '#140a24', 1.7); scene.add(hemi);
    const parq = (() => { const t = KIT.textTex(512, 512, (q, W) => { const n = 8, s = W / n; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { q.fillStyle = (x + y) % 2 ? '#6a4428' : '#7e5434'; q.fillRect(x * s, y * s, s, s); q.strokeStyle = 'rgba(0,0,0,0.25)'; q.lineWidth = 2; for (let k = 1; k < 4; k++) { q.beginPath(); if ((x + y) % 2) { q.moveTo(x * s + k * s / 4, y * s); q.lineTo(x * s + k * s / 4, y * s + s); } else { q.moveTo(x * s, y * s + k * s / 4); q.lineTo(x * s + s, y * s + k * s / 4); } q.stroke(); } } KIT.noiseOver(q, W, W, 9, 0.25, 8, 3); });
      t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1 / 8, 1 / 8); return new T.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.05 }); })();
    TK.planeG(scene, 24, 120, parq, 0, 0, -20);
    const runner = new T.Mesh(new T.PlaneGeometry(5, 80), new T.MeshStandardMaterial({ color: '#5a1420', roughness: 0.95, map: KIT.textTex(64, 512, (q) => { q.fillStyle = '#6a1a24'; q.fillRect(0, 0, 64, 512); q.fillStyle = '#c8a040'; q.fillRect(4, 0, 4, 512); q.fillRect(56, 0, 4, 512); }) })); runner.rotation.x = -PI / 2; runner.position.set(0, 0.02, -10); runner.receiveShadow = true; scene.add(runner);
    // ---- shelf walls: x = +-11 facing the aisle, z +22 .. -62, rows every 2.7 up to y 150; galleries every 5 rows ----
    const wood = ENV.mt(ENV.T.wood('#4a2c18'), 2), dark = SM('#1a1008', 0.8), ZF = 22, ZB = -62, H = 150, RH = 2.7, BW = 1.75;
    const covers = BOOK.covers(32), rows = Math.floor(H / RH), inst = covers.map(() => []), spines = [];
    const sr = rng(77);
    [-1, 1].forEach((s) => { const x = s * 11.2;
      box(scene, 1.4, H, ZF - ZB, dark, s * 12.4, H / 2, (ZF + ZB) / 2, false);   // back
      for (let k = 0; k <= rows; k++) box(scene, 2.2, 0.22, ZF - ZB, wood, s * 11.6, k * RH, (ZF + ZB) / 2);   // shelf boards
      for (let z = ZF; z >= ZB; z -= 8) box(scene, 2.4, H, 0.5, wood, s * 11.6, H / 2, z);   // uprights
      for (let k = 0; k < rows; k++) for (let z = ZF - 0.6; z > ZB + 0.6; z -= BW) { if (Math.abs(((z - ZF) % 8 + 8) % 8) < 0.5) continue; const v = sr();
        if (v < 0.62) inst[Math.floor(sr() * covers.length)].push([x, k * RH + 0.12, z, s, sr()]); else spines.push([x - s * 0.05, k * RH + 0.12, z, s, sr()]); } });
    const bg = new T.BoxGeometry(1.5, 2.05, 0.32); bg.translate(0, 1.025, 0); const mm = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), sc = new T.Vector3(1, 1, 1), pos = new T.Vector3();
    const pagesM = SM('#efe4c8', 0.9);
    covers.forEach((m, i) => { const L2 = inst[i]; if (!L2.length) return; const im = new T.InstancedMesh(bg, [pagesM, pagesM, pagesM, pagesM, m, pagesM], L2.length);
      L2.forEach(([x, y, z, s, r], j) => { e.set(-0.08, s > 0 ? -PI / 2 : PI / 2, (r - 0.5) * 0.06); q.setFromEuler(e); sc.setScalar(0.92 + r * 0.16); pos.set(x, y, z); mm.compose(pos, q, sc); im.setMatrixAt(j, mm); }); im.castShadow = false; im.receiveShadow = true; scene.add(im); });
    { const sg = new T.BoxGeometry(1.0, 1.0, 0.28); sg.translate(0, 0.5, 0); const sm = new T.MeshStandardMaterial({ roughness: 0.7 }); const im = new T.InstancedMesh(sg, sm, spines.length * 3); let j = 0; const col = new T.Color();
      spines.forEach(([x, y, z, s, r]) => { for (let t = -1; t <= 1; t++) { e.set(0, s > 0 ? -PI / 2 : PI / 2, 0); q.setFromEuler(e); sc.set(1.3, 1.6 + ((r * 7 + t) % 1) * 0.6, 1.4); pos.set(x, y, z + t * 0.42); mm.compose(pos, q, sc); im.setMatrixAt(j, mm); col.setHSL((r * 3 + t * 0.13) % 1, 0.45, 0.28); im.setColorAt(j, col); j++; } }); scene.add(im); }
    // galleries (catwalk + railing) every 5 rows, rolling ladders
    const brass = SM('#c8a050', 0.35, 0.8); for (let k = 5; k < rows; k += 5) [-1, 1].forEach((s) => { const y = k * RH; box(scene, 2.2, 0.3, ZF - ZB, wood, s * 9.5, y - 0.15, (ZF + ZB) / 2); const rl = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, ZF - ZB, 6), brass); rl.rotation.x = PI / 2; rl.position.set(s * 8.5, y + 2.0, (ZF + ZB) / 2); scene.add(rl); for (let z = ZF; z > ZB; z -= 2) box(scene, 0.08, 2.0, 0.08, brass, s * 8.5, y + 1.0, z, false); });
    const ladder = (x, z, h, s) => { const g = new T.Group(); [-0.6, 0.6].forEach((dz) => box(g, 0.18, h, 0.18, wood, 0, h / 2, dz, false)); for (let y = 0.6; y < h; y += 0.8) box(g, 0.12, 0.12, 1.2, brass, 0, y, 0, false); g.position.set(x, 0, z); g.rotation.z = s * -0.12; scene.add(g); return g; };
    ladder(9.4, 4, 15, 1); ladder(-9.4, -18, 15, -1); ladder(9.0, -40, 15, 1);
    // sconces on the uprights (night): green glass, lit low ones throw light on the face-books
    const shelfLamps = []; [-1, 1].forEach((s2) => { for (let z = ZF - 8; z > ZB; z -= 8) for (const y of [5.2, 18.6, 32, 45.4]) { const sc2 = new T.Mesh(new T.SphereGeometry(0.32, 10, 8), glowMat('#b8ffc8', 3)); sc2.position.set(s2 * 10.2, y, z); scene.add(sc2); shelfLamps.push(sc2);
      if (y < 20) { const pl2 = new T.PointLight('#b0ffc8', 14, 12, 1.8); pl2.position.set(s2 * 9.6, y, z); scene.add(pl2); shelfLamps.push(pl2); } } });
    // tall windows high up (cold moon shafts), hanging lamps
    const bmN = RBX.beamMat('#6ad8c8', 0.045); const beams = [RBX.beam(V(-10, 60, -6), V(0.6, -1, -0.15), 5, 2, 70, bmN), RBX.beam(V(10, 70, -36), V(-0.55, -1, 0.1), 5, 2, 80, bmN)]; beams.forEach((b) => scene.add(b));
    const lampsN = []; for (const z of [12, -2, -16, -46, -60]) { const g = new T.Group(); const c = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 30, 4), dark); c.position.y = 15; g.add(c); const sh = new T.Mesh(new T.ConeGeometry(1.2, 1.0, 16, 1, true), SM('#1a5a3a', 0.4, 0.3)); sh.material.side = T.DoubleSide; g.add(sh); const b = new T.Mesh(new T.SphereGeometry(0.3, 10, 8), glowMat('#c8ffd8', 2)); b.position.y = -0.3; g.add(b);
      const pl = new T.PointLight('#a8ffd0', 40, 26, 1.6); pl.position.y = -0.8; g.add(pl); g.position.set(0, 13, z); scene.add(g); lampsN.push(g); }
    // whispers: faint "help" ghosts and wisps near the low shelves
    const whispers = new T.Group(); scene.add(whispers); const wsT = ['help...', 'psst', 'help', 'shhh', 'over here', 'help me'];
    for (let i = 0; i < 18; i++) { const t = KIT.textTex(256, 64, (q2) => { q2.fillStyle = 'rgba(200,255,240,0.85)'; q2.font = 'italic 700 40px Georgia, serif'; q2.textAlign = 'center'; q2.textBaseline = 'middle'; q2.fillText(wsT[i % wsT.length], 128, 34); });
      const p = new T.Mesh(new T.PlaneGeometry(2.6, 0.65), new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, depthWrite: false, fog: false, blending: T.AdditiveBlending })); const s = i % 2 ? 1 : -1; p.position.set(s * 9.4, 2 + (i * 1.7) % 16, 14 - i * 3.6); p.rotation.y = -s * PI / 2.6; whispers.add(p);
      const pts = []; for (let k = 0; k < 10; k++) pts.push(V(s * (10.6 - k * 0.15), p.position.y - 0.4 + Math.sin(k * 0.9 + i) * 0.25, p.position.z + k * 0.2)); whispers.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 20, 0.025, 4), new T.MeshBasicMaterial({ color: '#a8ffe8', transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false }))); }
    // ---- front desk at z -30 (counter top y 3.7, front face z -28) ----
    const desk = new T.Group(); desk.position.set(0, 0, -30); scene.add(desk); const dw = ENV.mt(ENV.T.wood('#5a3420'), 2), top = SM('#2a1a10', 0.3);
    box(desk, 14, 3.5, 3.6, dw, 0, 1.75, 0); box(desk, 14.6, 0.25, 4.2, top, 0, 3.62, 0); for (let i = -3; i <= 3; i++) box(desk, 1.6, 2.6, 0.12, SM('#4a2a18', 0.5), i * 2, 1.7, 1.82);
    [-1, 1].forEach((s) => { box(desk, 3.6, 3.5, 6, dw, s * 8.6, 1.75, -1.2); box(desk, 4.0, 0.25, 6.4, top, s * 8.6, 3.62, -1.2); });
    const rt = sign('RETURNS', 3.4, 0.8, { bg: '#2a1a10', fg: '#e8c060', font: 'Georgia, serif' }); rt.position.set(-3.6, 2.8, 1.9); desk.add(rt); const sl = sign('SILENCE', 7, 1.6, { bg: '#1a2a20', fg: '#e8e0c8', border: '#c8a050', font: 'Georgia, serif' }); sl.position.set(0, 14, -9); desk.add(sl);
    // banker's lamp, bell, stamp carousel, book stack, card catalogue behind
    const lamp = new T.Group(); box(lamp, 0.8, 0.15, 0.5, brass, 0, 0.08, 0, false); box(lamp, 0.08, 1.0, 0.08, brass, 0, 0.6, 0, false); const shd = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 1.6, 16, 1, true, 0, PI), new T.MeshStandardMaterial({ color: '#1a8a4a', roughness: 0.2, side: T.DoubleSide, emissive: '#1a8a4a', emissiveIntensity: 0.6 })); shd.rotation.z = PI / 2; shd.position.y = 1.15; lamp.add(shd);
    lamp.add(L(scene, '#f8ffd0', 0, 0, 0, 0, 0)); const lp = new T.PointLight('#f0ffc8', 30, 14, 1.6); lp.position.set(0, 0.9, 0.2); lamp.add(lp); lamp.position.set(4.5, 3.75, 0.4); desk.add(lamp);
    const bell = new T.Group(); bell.add(new T.Mesh(new T.SphereGeometry(0.35, 16, 10, 0, PI * 2, 0, PI / 2), brass)); bell.add(new T.Mesh(new T.CylinderGeometry(0.45, 0.45, 0.06, 16), SM('#2a2a2a'))); bell.position.set(-1.5, 3.76, 1.3); desk.add(bell);
    for (let i = 0; i < 6; i++) { const b = BOOK.plain({ cover: ['#8a1e2a', '#1e3a6a', '#2a5a2e', '#6a2a6a', '#c86a1a', '#1e5a5a'][i], title: '', w: 1.4, h: 1.9, d: 0.3 }); b.rotation.set(-PI / 2, 0, (i - 3) * 0.08); b.position.set(-5, 3.76 + i * 0.3 + 0.95 * 0, 0.3 - 0.95); desk.add(b); }
    const cat = new T.Group(); cat.position.set(0, 0, -6.5); desk.add(cat); box(cat, 10, 7, 2, dw, 0, 3.5, 0); for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) { box(cat, 1.0, 0.8, 0.1, SM('#7a4a2a', 0.5), -4.4 + c * 1.26, 0.8 + r * 1.05, 1.02, false); box(cat, 0.3, 0.08, 0.1, brass, -4.4 + c * 1.26, 0.8 + r * 1.05, 1.1, false); }
    // ---- story corner (day): rug, tiny chairs, book bins, bunting ----
    const corner = new T.Group(); corner.position.set(0, 0, 6); scene.add(corner);
    const rugT = KIT.textTex(512, 512, (q2, W) => { const cs = ['#e84040', '#f2a020', '#f6d020', '#38c060', '#2a8ad8', '#8a3ad0']; for (let i = 6; i > 0; i--) { q2.fillStyle = cs[i % 6]; q2.beginPath(); q2.arc(W / 2, W / 2, (i / 6) * W / 2, 0, 7); q2.fill(); } KIT.noiseOver(q2, W, W, 4, 0.18, 8, 3); });
    const rug = new T.Mesh(new T.CircleGeometry(6, 48), new T.MeshStandardMaterial({ map: rugT, roughness: 1 })); rug.rotation.x = -PI / 2; rug.position.y = 0.03; rug.receiveShadow = true; corner.add(rug);
    const chair = (c) => { const g = new T.Group(), m = SM(c, 0.5); box(g, 1.6, 0.25, 1.6, m, 0, 1.4, 0, false); box(g, 1.6, 1.6, 0.25, m, 0, 2.3, -0.7, false); [[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]].forEach(([x, z]) => box(g, 0.2, 1.4, 0.2, m, x, 0.7, z, false)); return ENV.shadow(g); };
    const tiny = chair('#f2a020'); tiny.position.set(0, 0, -4.2); corner.add(tiny);
    [[-7.5, '#e84040'], [7.5, '#2a8ad8']].forEach(([x, c]) => { const b = new T.Group(); box(b, 3, 1.6, 2, SM(c, 0.5), 0, 0.8, 0, false); for (let i = 0; i < 6; i++) { const pb = BOOK.plain({ cover: ['#f2c01a', '#38c060', '#f07ad0', '#18b8d8', '#e84040', '#8a3ad0'][i], title: ['ZOO', 'BUS', 'MOON', 'DUCK', 'PIGS', 'BEAR'][i], w: 1.2, h: 1.5, d: 0.2 }); pb.position.set(-1.1 + i * 0.44, 1.2, 0); pb.rotation.y = 0.2; b.add(pb); } b.position.set(x, 0, -2); b.rotation.y = -x * 0.05; corner.add(b); });
    const bunt = CP.bunting(V(-10, 9, -6), V(10, 9, -6), 1.6, 20); corner.add(bunt);
    const story = sign('STORY TIME\nFRIDAYS', 5, 2.4, { bg: '#f6f0e0', fg: '#e84040', border: '#38c060', font: 'Georgia, serif' }); story.position.set(0, 7.2, -6.2); corner.add(story);
    // day light rig (sun shafts through the high windows)
    const sun = keyLight(scene, '#ffe2b0', 0, [30, 60, 20], 40); const bmD = RBX.beamMat('#ffd8a0', 0.28); const dbeams = [RBX.beam(V(-10, 40, 8), V(0.5, -1, -0.2), 6, 2, 50, bmD), RBX.beam(V(10, 44, -10), V(-0.4, -1, 0.15), 6, 2, 52, bmD)]; dbeams.forEach((b) => scene.add(b));
    const dayL = [L(scene, '#ffe0b0', 0, 40, 0, 12, 6), L(scene, '#ffe0b0', 0, 40, 0, 12, -24)];
    const set = { scene, desk, corner, tiny, ladder, whispers, H, RH, ZF, ZB };
    set.mood = (m) => { if (set.cur === m) return; set.cur = m; const day = m === 'day';
      scene.fog.color.set(day ? '#e8c89a' : '#100c2a'); scene.fog.density = day ? 0.008 : 0.009; scene.background.set(day ? '#d8b888' : '#06061a'); hemi.color.set(day ? '#ffe8c8' : '#5a5ad0'); hemi.groundColor.set(day ? '#8a6a4a' : '#140a24'); hemi.intensity = day ? 1.8 : 1.7;
      sun.intensity = day ? 4 : 0; dayL.forEach((l) => { l.intensity = day ? 90 : 0; }); dbeams.forEach((b) => { b.visible = day; }); beams.forEach((b) => { b.visible = false; }); whispers.visible = !day; corner.visible = day;
      lampsN.forEach((g) => g.children.forEach((c) => { if (c.isPointLight) c.intensity = day ? 6 : 40; })); shelfLamps.forEach((l) => { l.visible = !day; }); };
    set.mood('night'); return set; };
})();
