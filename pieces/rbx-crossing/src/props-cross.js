// rbx-crossing props (cached by ENG.prop): the handheld STOP sign (pole along -y from the grip), catapult + pizza box,
// a stack of name tags, a single name tag, a whistle.
'use strict';
(function () {
  const T = THREE, PI = Math.PI, { cnv, tex, rbox } = RBX, SM = (c, r = 0.6, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const done = (g) => { g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
  const tt = (w, h, draw) => { const c = cnv(w, h); draw(c.getContext('2d'), w, h); return tex(c); };
  // STOP sign: octagon face on +z, pole down from the hand (origin = grip), sign above the hand
  PROPS.stopSign = () => { const g = new T.Group(), t = tt(256, 256, (q, w, h) => { q.fillStyle = '#ffffff'; q.beginPath(); for (let i = 0; i < 8; i++) { const a = PI / 8 + i * PI / 4; q.lineTo(128 + Math.cos(a) * 126, 128 + Math.sin(a) * 126); } q.fill();
      q.fillStyle = '#d01818'; q.beginPath(); for (let i = 0; i < 8; i++) { const a = PI / 8 + i * PI / 4; q.lineTo(128 + Math.cos(a) * 114, 128 + Math.sin(a) * 114); } q.fill(); q.fillStyle = '#fff'; q.font = '900 78px "Arial Black", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('STOP', 128, 132); });
    const face = new T.Mesh(new T.CircleGeometry(1.25, 8), new T.MeshStandardMaterial({ map: t, roughness: 0.4, side: T.DoubleSide })); face.rotation.z = PI / 8; face.position.y = 2.6; g.add(face);
    const back = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 0.08, 8), SM('#b8bcc4', 0.3, 0.8)); back.rotation.set(PI / 2, PI / 8, 0); back.position.set(0, 2.6, -0.06); g.add(back);
    const pole = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 3.6, 10), SM('#d8d8dc', 0.3, 0.8)); pole.position.y = 0.6; g.add(pole); g.rotation.y = PI; const w = new T.Group(); w.add(g); return done(w); };
  PROPS.catapult = () => { const g = new T.Group(), w = ENV.mt(ENV.T.wood('#8a5a30'), 1.5); const b = (x, y, z, sx, sy, sz, m = w) => { const me = new T.Mesh(rbox(sx, sy, sz, 0.06, 3), m); me.position.set(x, y, z); g.add(me); return me; };
    b(0, 0.5, 0, 5, 0.5, 3); [-1.2, 1.2].forEach((z) => { b(0, 2.2, z, 0.5, 3.4, 0.5); }); b(0, 3.8, 0, 0.5, 0.5, 3); const arm = b(0.8, 3.6, 0, 5.2, 0.35, 0.5); arm.rotation.z = -0.5;
    const cup = new T.Mesh(new T.SphereGeometry(0.8, 14, 8, 0, PI * 2, PI / 2, PI / 2), w); cup.position.set(3.0, 2.4, 0); cup.material.side = T.DoubleSide; g.add(cup);
    [-1.6, 1.6].forEach((x) => [-1.6, 1.6].forEach((z) => { const wh = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 0.3, 14), w); wh.rotation.x = PI / 2; wh.position.set(x, 0.7, z); g.add(wh); })); return done(g); };
  PROPS.pizzaBox = () => { const g = new T.Group(), t = tt(256, 256, (q, w, h) => { q.fillStyle = '#e8d8b8'; q.fillRect(0, 0, w, h); q.fillStyle = '#d23a2a'; q.font = '900 60px "Arial Black"'; q.textAlign = 'center'; q.fillText('PIZZA', 128, 120); q.font = '700 30px Arial'; q.fillText('HOT & FAST', 128, 170); });
    const m = [SM('#d8c8a8'), SM('#d8c8a8'), new T.MeshStandardMaterial({ map: t }), SM('#d8c8a8'), SM('#d8c8a8'), SM('#d8c8a8')]; const b = new T.Mesh(new T.BoxGeometry(2, 0.35, 2), m); g.add(b); return done(g); };
  const tagTex = (n) => tt(256, 160, (q, w, h) => { q.fillStyle = '#ffffff'; q.fillRect(0, 0, w, h); q.fillStyle = '#d01818'; q.fillRect(0, 0, w, 50); q.fillStyle = '#fff'; q.font = '900 30px Arial'; q.textAlign = 'center'; q.fillText('HELLO my name is', w / 2, 36); q.fillStyle = '#1a1a1a'; q.font = '700 54px "Segoe Print", cursive'; q.fillText(n, w / 2, 122); });
  PROPS.nameTags = () => { const g = new T.Group(), names = ['Ben', 'Amy', 'Leo', 'Ivy', 'Sam', 'Mia', 'Tom', 'Zoe']; for (let i = 0; i < 8; i++) { const p = new T.Mesh(new T.PlaneGeometry(0.8, 0.5), new T.MeshStandardMaterial({ map: tagTex(names[i]), roughness: 0.8, side: T.DoubleSide })); p.position.set((i % 3 - 1) * 0.05, i * 0.04, -i * 0.012); p.rotation.z = (i % 2 ? 1 : -1) * 0.08 * (i % 3); g.add(p); } return g; };
  PROPS.nameTag = (n = 'WES') => { const g = new T.Group(); g.add(new T.Mesh(new T.PlaneGeometry(0.8, 0.5), new T.MeshStandardMaterial({ map: tagTex(n), roughness: 0.8, side: T.DoubleSide }))); return g; };
  PROPS.whistle = () => { const g = new T.Group(), m = SM('#d8d8dc', 0.2, 0.9); const b = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 0.4, 14), m); b.rotation.z = PI / 2; g.add(b); const t = new T.Mesh(new T.BoxGeometry(0.4, 0.14, 0.18), m); t.position.set(0.3, 0.06, 0); g.add(t); return done(g); };
})();
PROPS.chair = () => { const T = THREE, g = new T.Group(), m = new T.MeshStandardMaterial({ color: '#c89a5a', roughness: 0.6 }), k = new T.MeshStandardMaterial({ color: '#3a3e48', roughness: 0.4, metalness: 0.6 });
  const b = (w, h, d, mm, x, y, z) => { const me = new T.Mesh(new T.BoxGeometry(w, h, d), mm); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); };
  b(1.2, 0.12, 1.2, m, 0, 1.4, 0); b(1.2, 1.2, 0.12, m, 0, 2.1, -0.55); [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(([x, z]) => b(0.1, 1.4, 0.1, k, x, 0.7, z)); return g; };
