// rbx-sock props (added to PROPS): laundry chute hatch, knitting, sock clothesline, signs, lost & found box, dinner plate, chair.
'use strict';
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), std = (c, r = 0.7, m = 0, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, o));
  const shadow = (g) => KIT.shadow(g);
  const box = (w, h, d, m, x, y, z) => KIT.box(w, h, d, m, x, y, z);
  const metalT = KIT.texPair(256, (g, hg, S) => { g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, S, S); KIT.noiseOver(g, S, S, 7, 0.35, 6, 4); for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(60,60,60,0.25)'; g.beginPath(); const x = Math.random() * S, y = Math.random() * S; g.moveTo(x, y); g.lineTo(x + 30, y + 4); g.stroke(); } });
  const metal = RBX.pbr(metalT.c, metalT.h, { rough: 0.45, bump: 1 }); metal.metalness = 0.6;
  // laundry chute hatch in a wall (faces +z locally; origin = floor below the hatch centre). userData.setOpen(0..1)
  PROPS.chuteHatch = function () {
    const g = new T.Group(), dark = std('#050505', 1), frame = std('#d9d4c8', 0.5);
    g.add(box(3.0, 2.6, 0.12, frame, 0, 2.3, 0.0));                    // trim
    g.add(box(2.5, 2.1, 0.2, dark, 0, 2.3, -0.05));                    // the hole
    const door = new T.Group(); door.position.set(0, 3.35, 0.12); g.add(door);   // hinged at the top
    const d = box(2.4, 2.0, 0.1, metal, 0, -1.0, 0); door.add(d);
    door.add(box(0.8, 0.14, 0.14, std('#3a3a3a', 0.4, 0.6), 0, -1.75, 0.1));
    const lbl = new T.Mesh(new T.PlaneGeometry(1.6, 0.42), new T.MeshStandardMaterial({ map: KIT.textTex(512, 128, (c, w, h) => { c.fillStyle = '#2b2b2b'; c.fillRect(0, 0, w, h); c.fillStyle = '#f0e8d0'; c.font = '900 70px Arial Black, Arial'; c.textAlign = 'center'; c.fillText('LAUNDRY', w / 2, 92); }), roughness: 0.6 }));
    lbl.position.set(0, -0.7, 0.06); door.add(lbl);
    g.userData.door = door; g.userData.setOpen = (k) => { door.rotation.x = -1.4 * k; };
    return shadow(g);
  };
  // knitting: two needles crossed + a yarn ball + a strand (o.color). Held near the lap.
  PROPS.knitting = function (color = '#b0486a') {
    const g = new T.Group(), nm = std('#c8c0b0', 0.3, 0.6);
    [-0.4, 0.4].forEach((a) => { const n = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 2.6, 8), nm); n.rotation.z = Math.PI / 2 + a; g.add(n); const k = new T.Mesh(new T.SphereGeometry(0.11, 10, 8), std('#e2463a', 0.4)); k.position.set(Math.cos(Math.PI / 2 + a) * -1.3, Math.sin(Math.PI / 2 + a) * -1.3, 0); g.add(k); });
    const sw = new T.Mesh(RBX.rbox(1.2, 0.8, 0.3, 0.12, 6), SOCKS.mat('knit', { lit: 0.12 })); sw.position.set(0, -0.6, 0); g.add(sw);
    const ball = new T.Mesh(new T.SphereGeometry(0.55, 20, 14), SOCKS.mat('knit', { repeat: [3, 2], lit: 0.12 })); ball.position.set(1.6, -1.8, 0.4); g.add(ball); g.userData.ball = ball;
    return shadow(g);
  };
  // a yarn strand between two world points (rebuilt per call; add with ENG.add)
  PROPS.strand = function (a, b, color = '#b0486a', sag = 0.6) {
    const A = V(...a), B = V(...b), M = A.clone().lerp(B, 0.5); M.y -= sag;
    return new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(A, M, B), 20, 0.05, 6), std(color, 0.9));
  };
  // clothesline between two posts with pegged socks (pairs). len, kinds list
  PROPS.clothesline = function (len = 14, kinds = ['dots', 'dots', 'stripe', 'stripe', 'argyle', 'argyle', 'gym', 'gym']) {
    const g = new T.Group(), wood = std('#7a5a3a', 0.85);
    [-len / 2, len / 2].forEach((x) => { g.add(box(0.3, 7, 0.3, wood, x, 3.5, 0)); g.add(box(1.6, 0.2, 0.2, wood, x, 6.8, 0)); });
    const line = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, len, 6), std('#eeeeee', 0.6)); line.rotation.z = Math.PI / 2; line.position.y = 6.75; g.add(line);
    kinds.forEach((k, i) => { const s = SOCKS.one(k, 0.75); s.position.set(-len / 2 + 1 + i * ((len - 2) / Math.max(1, kinds.length - 1)), 6.75, 0); s.rotation.y = Math.PI / 2; g.add(s);
      const peg = box(0.12, 0.45, 0.16, std('#c9a46a', 0.7), s.position.x, 6.75, 0); g.add(peg); });
    return shadow(g);
  };
  // a flat sign: text lines, colours; w x h units. faces +z
  PROPS.sign = function (lines = ['SOCK CHECK'], w = 4, h = 1.6, bg = '#f6e7b0', fg = '#b0201c', post = false) {
    const g = new T.Group(), tex = KIT.textTex(512, Math.round(512 * h / w), (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 14; c.strokeRect(10, 10, W - 20, H - 20);
      c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; const fs = Math.min(110, (H - 40) / lines.length * 0.82); c.font = `900 ${fs}px "Arial Black", Arial`;
      lines.forEach((l, i) => c.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.12, W - 50)); });
    const p = new T.Mesh(new T.BoxGeometry(w, h, 0.08), [std('#ddd'), std('#ddd'), std('#ddd'), std('#ddd'), new T.MeshStandardMaterial({ map: tex, roughness: 0.7, emissive: new T.Color(1, 1, 1), emissiveMap: tex, emissiveIntensity: 0.12 }), std('#ccc')]);
    g.add(p); if (post) { p.position.y = 4.4; g.add(box(0.18, 4.4, 0.18, std('#8a8a8a', 0.4, 0.6), 0, 2.2, -0.1)); }
    return shadow(g);
  };
  // cardboard LOST & FOUND box spilling mismatched socks
  PROPS.lostFound = function () {
    const g = new T.Group(), cb = KIT.texPair(256, (c, hg, S) => { c.fillStyle = '#b58a55'; c.fillRect(0, 0, S, S); KIT.noiseOver(c, S, S, 3, 0.3, 8, 3); });
    const cm = RBX.pbr(cb.c, cb.h, { rough: 0.9 });
    g.add(box(4, 2.4, 3, cm, 0, 1.2, 0)); g.add(box(3.8, 0.1, 2.8, std('#3a2a18', 1), 0, 2.3, 0));
    const fl = box(4, 0.08, 1.2, cm, 0, 2.6, 1.9); fl.rotation.x = 0.9; g.add(fl);
    const lbl = PROPS.sign(['LOST & FOUND'], 3.4, 0.8, '#ffffff', '#222'); lbl.position.set(0, 1.3, 1.52); g.add(lbl);
    ['stripe', 'dots', 'green', 'red', 'argyle', 'star', 'gym', 'baby', 'knit2'].forEach((k, i) => { const s = SOCKS.one(k, 0.7); s.position.set(-1.4 + (i % 5) * 0.7, 2.4 + Math.floor(i / 5) * 0.3, -0.6 + (i % 3) * 0.5); s.rotation.set(-1.2 + (i % 3) * 0.6, i, 0.3 * (i % 2)); g.add(s); });
    [['dino', -2.6, 0.2], ['pizza', 2.5, 0.8]].forEach(([k, x, z]) => { const s = SOCKS.lying(k, 0.8, z * 2); s.position.set(x, 0, z); g.add(s); });
    return shadow(g);
  };
  // dinner plate with food; o.sock -> a duck sock lying in the mashed potatoes
  PROPS.plate = function (sock = false) {
    const g = new T.Group(), pm = std('#f4f1ea', 0.3);
    const p = new T.Mesh(new T.CylinderGeometry(0.9, 0.7, 0.1, 28), pm); p.position.y = 0.05; g.add(p);
    const mash = new T.Mesh(new T.SphereGeometry(0.42, 16, 10), std('#f1e3b8', 0.8)); mash.scale.y = 0.55; mash.position.set(-0.2, 0.15, 0); g.add(mash);
    [[0.35, 0.2], [0.45, -0.15], [0.25, -0.35]].forEach(([x, z]) => { const pea = new T.Mesh(new T.SphereGeometry(0.1, 8, 6), std('#5aa63a', 0.5)); pea.position.set(x, 0.15, z); g.add(pea); });
    const meat = box(0.6, 0.18, 0.35, std('#7a3a20', 0.7), 0.15, 0.17, 0.35); g.add(meat);
    if (sock) { const s = SOCKS.lying('duck', 0.45, 0.6); s.position.set(-0.6, 0.12, -0.1); s.rotation.z = 0.2; g.add(s); }
    return shadow(g);
  };
  // simple wooden chair (seat top at y=2)
  PROPS.chair = function (color = '#8a5a32') {
    const g = new T.Group(), w = std(color, 0.75);
    g.add(box(2.2, 0.25, 2.0, w, 0, 1.9, 0)); [[-0.95, -0.85], [0.95, -0.85], [-0.95, 0.85], [0.95, 0.85]].forEach(([x, z]) => g.add(box(0.22, 1.9, 0.22, w, x, 0.95, z)));
    g.add(box(2.2, 2.6, 0.22, w, 0, 3.3, -0.9)); return shadow(g);
  };
  // a big "1971" photo frame (grandma)
  PROPS.photo1971 = function () {
    const g = new T.Group(), tex = KIT.textTex(384, 300, (c, W, H) => { c.fillStyle = '#d9c9a0'; c.fillRect(0, 0, W, H); c.fillStyle = '#6a5a40'; c.fillRect(30, 30, W - 60, H - 100);
      c.fillStyle = '#e9d6b6'; [[110, 170], [150, 175], [190, 178], [230, 175], [270, 170]].forEach(([x, y], i) => { c.beginPath(); c.ellipse(x, y, 18 - i, 22 - i, 0, 0, 7); c.fill(); });
      c.fillStyle = '#3a2a1a'; c.font = '900 52px Georgia'; c.textAlign = 'center'; c.fillText('TOES · 1971', W / 2, H - 22); });
    g.add(box(3.2, 2.6, 0.15, std('#6a3a1a', 0.6), 0, 0, 0)); const p = new T.Mesh(new T.PlaneGeometry(2.9, 2.3), new T.MeshStandardMaterial({ map: tex, roughness: 0.7, emissive: new T.Color(1, 1, 1), emissiveMap: tex, emissiveIntensity: 0.1 })); p.position.z = 0.09; g.add(p);
    return shadow(g);
  };
})();
