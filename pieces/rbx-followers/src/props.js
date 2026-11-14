// rbx-rope PROPS (built once, cached by ENG.prop): tractor, elephant, chalkboard, banner, sign, chalk stakes, music notes,
// stool, flag. Local origin on the ground; things that pull face +z (their hitch / harness ring at -z).
'use strict';
const PROPS = {};
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { cnv, tex, rbox } = RBX;
  const SM = (c, r = 0.6, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const B = (g, w, h, d, m, x, y, z, r = 0.08) => { const me = new T.Mesh(rbox(w, h, d, Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01), 4), m); me.position.set(x, y, z); g.add(me); return me; };
  const cyl = (g, r, h, m, x, y, z, rx = 0, rz = 0, seg = 20) => { const me = new T.Mesh(new T.CylinderGeometry(r, r, h, seg), m); me.position.set(x, y, z); me.rotation.set(rx, 0, rz); g.add(me); return me; };
  const done = (g) => { g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
  const textTex = (w, h, draw) => { const c = cnv(w, h), q = c.getContext('2d'); draw(q, w, h); return tex(c); };
  // farm tractor (Roblox-chunky): red body, big black treaded rear wheels, exhaust, hitch at -z
  PROPS.tractor = (c = '#d02a24') => { const g = new T.Group(), body = SM(c, 0.35), dark = SM('#1c1c1e', 0.8), rim = SM('#f2c94c', 0.4), glass = new T.MeshPhysicalMaterial({ color: '#1b2a3a', roughness: 0.05, clearcoat: 1 });
    B(g, 2.6, 1.8, 5.2, body, 0, 2.2, 0.6, 0.25); B(g, 2.2, 1.2, 2.6, body, 0, 3.4, 2.0, 0.2); B(g, 2.4, 2.4, 2.4, body, 0, 4.0, -1.0, 0.2); B(g, 2.2, 1.8, 2.2, glass, 0, 4.3, -1.0, 0.1); B(g, 2.8, 0.25, 2.8, body, 0, 5.3, -1.0, 0.1);
    [-1, 1].forEach((s) => { const w = cyl(g, 1.9, 1.1, dark, s * 1.9, 1.9, -1.4, 0, PI / 2, 28); for (let k = 0; k < 14; k++) { const a = (k / 14) * PI * 2, t = B(g, 1.15, 0.3, 0.5, dark, s * 1.9, 1.9 + Math.sin(a) * 1.9, -1.4 + Math.cos(a) * 1.9, 0.05); t.rotation.x = -a; }
      cyl(g, 1.0, 1.15, rim, s * 1.9, 1.9, -1.4, 0, PI / 2); cyl(g, 1.0, 0.8, dark, s * 1.6, 1.0, 3.0, 0, PI / 2); cyl(g, 0.5, 0.85, rim, s * 1.6, 1.0, 3.0, 0, PI / 2); });
    cyl(g, 0.15, 2.2, dark, 0.7, 5.0, 1.6); B(g, 0.6, 0.6, 0.6, SM('#888', 0.4, 0.7), 0, 1.4, -2.9, 0.1); return done(g); };
  // elephant: big grey blocks, trunk tube, fan ears, tusks, a red harness with a ring at the back (-z)
  PROPS.elephant = () => { const g = new T.Group(), sk = ENV.mt(ENV.T.rock('#a8a4ac'), 3), dk = SM('#6e6c74', 0.9), red = SM('#c0302a', 0.5), iv = SM('#f4efe2', 0.4);
    B(g, 4.2, 4.0, 7.0, sk, 0, 5.2, 0, 1.4); [[-1.3, -2.4], [1.3, -2.4], [-1.3, 2.4], [1.3, 2.4]].forEach(([x, z]) => cyl(g, 0.85, 3.6, sk, x, 1.8, z));
    B(g, 3.2, 3.2, 3.0, sk, 0, 7.0, 4.2, 1.1);
    const tr = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(0, 6.6, 5.6), V(0, 5.2, 6.4), V(0, 3.4, 6.6), V(0, 2.2, 7.4), V(0, 2.4, 8.0)]), 30, 0.42, 12), sk); g.add(tr);
    [-1, 1].forEach((s) => { const e = new T.Mesh(new T.CircleGeometry(1.9, 20), dk); e.material.side = T.DoubleSide; e.position.set(s * 2.0, 7.0, 3.6); e.rotation.y = s * 1.2; e.scale.set(1, 1.2, 1); g.add(e);
      const t = new T.Mesh(new T.ConeGeometry(0.22, 1.6, 10), iv); t.position.set(s * 0.8, 5.3, 6.0); t.rotation.x = 2.1; g.add(t);
      const eye = new T.Mesh(new T.SphereGeometry(0.18, 12, 8), SM('#111', 0.2)); eye.position.set(s * 1.2, 7.6, 5.6); g.add(eye); });
    B(g, 4.4, 0.5, 0.5, red, 0, 6.0, 1.5, 0.1); B(g, 4.4, 0.5, 0.5, red, 0, 6.0, -1.5, 0.1); const ring = new T.Mesh(new T.TorusGeometry(0.5, 0.12, 8, 20), SM('#c8963e', 0.3, 0.9)); ring.position.set(0, 5.0, -3.6); g.add(ring);
    const tail = new T.Mesh(new T.CylinderGeometry(0.12, 0.08, 1.6, 8), sk); tail.position.set(0, 5.0, -3.8); tail.rotation.x = 0.4; g.add(tail); return done(g); };
  // chalkboard on an easel with the kindergarten rule
  PROPS.chalkboard = (lines = ['THE ROPE ONLY MOVES', 'WHEN BOTH SIDES MOVE']) => { const g = new T.Group(), wood = SM('#8a5a30', 0.7);
    const t = textTex(1024, 640, (q, w, h) => { q.fillStyle = '#21402e'; q.fillRect(0, 0, w, h); KIT.noiseOver(q, w, h, 5, 0.25, 6, 3); q.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 30; i++) q.fillRect(Math.random() * w, Math.random() * h, 120, 6);
      q.fillStyle = '#f4f2ea'; q.textAlign = 'center'; lines.forEach((l, i) => { let fs = 84; q.font = `900 ${fs}px "Comic Sans MS", "Arial Black", sans-serif`; while (q.measureText(l).width > w - 90) { fs -= 4; q.font = `900 ${fs}px "Comic Sans MS", "Arial Black", sans-serif`; } q.fillText(l, w / 2, 190 + i * 140); }); q.font = '700 60px "Comic Sans MS", sans-serif'; q.fillText('<- ♥ ->', w / 2, 560); });
    const b = new T.Mesh(new T.BoxGeometry(6, 3.8, 0.15), [wood, wood, wood, wood, new T.MeshStandardMaterial({ map: t, roughness: 0.9 }), wood]); b.position.y = 4.2; g.add(b);
    [[-3.15, -0.12], [3.15, -0.12]].forEach(([x, z]) => { const l = B(g, 0.25, 6.2, 0.25, wood, x, 3.0, z, 0.05); l.rotation.x = 0.06; }); B(g, 0.25, 5.6, 0.25, wood, 0, 2.8, -1.4, 0.05).rotation.x = 0.35; return done(g); };
  // banner on two poles
  PROPS.banner = (text = 'HEAVE DAY', w = 14, bg = '#f6efe0', fg = '#f2c94c', stripe = '#e84040') => { const g = new T.Group(), wood = SM('#5a3a24', 0.7);
    const t = textTex(1024, 220, (q, W, H) => { q.fillStyle = bg; q.fillRect(0, 0, W, H); q.fillStyle = stripe; q.fillRect(0, 0, W, 22); q.fillRect(0, H - 22, W, 22); let fs = 140; q.font = `900 ${fs}px "Arial Black", sans-serif`; while (q.measureText(text).width > W - 60) { fs -= 6; q.font = `900 ${fs}px "Arial Black", sans-serif`; } q.textAlign = 'center'; q.textBaseline = 'middle'; q.lineWidth = 14; q.strokeStyle = '#1a1410'; q.strokeText(text, W / 2, H / 2 + 6); q.fillStyle = fg; q.fillText(text, W / 2, H / 2 + 6); });
    const p = new T.Mesh(new T.PlaneGeometry(w, w * 0.215), new T.MeshStandardMaterial({ map: t, side: T.DoubleSide, roughness: 0.8 })); p.position.y = 9.5; g.add(p); [-w / 2, w / 2].forEach((x) => cyl(g, 0.18, 11, wood, x, 5.5, 0, 0, 0, 8)); return done(g); };
  // sign on a post (red-rimmed law sign)
  PROPS.sign = (l1 = 'NO SNEEZING', l2 = 'BY ORDER OF THE ROPE') => { const g = new T.Group(); cyl(g, 0.12, 6, SM('#9a9aa0', 0.4, 0.8), 0, 3, 0, 0, 0, 8);
    const t = textTex(512, 360, (q, w, h) => { q.fillStyle = '#f6f2ea'; q.fillRect(0, 0, w, h); q.strokeStyle = '#c0201a'; q.lineWidth = 26; q.strokeRect(13, 13, w - 26, h - 26); q.fillStyle = '#c0201a'; q.textAlign = 'center'; q.font = '900 76px "Arial Black", sans-serif'; q.fillText(l1, w / 2, 160); q.fillStyle = '#1a1a1a'; q.font = '700 34px sans-serif'; q.fillText(l2, w / 2, 260); });
    const p = new T.Mesh(new T.BoxGeometry(2.8, 2.0, 0.08), [SM('#ccc'), SM('#ccc'), SM('#ccc'), SM('#ccc'), new T.MeshStandardMaterial({ map: t, roughness: 0.5 }), SM('#ccc')]); p.position.y = 5.6; g.add(p); return done(g); };
  // chalk distance stake ("1 m", "10 m") hammered next to the rope
  PROPS.stake = (text = '1 m') => { const g = new T.Group(); B(g, 0.5, 2.4, 0.5, SM('#d8c8a8', 0.8), 0, 1.2, 0, 0.05); const t = textTex(256, 128, (q, w, h) => { q.fillStyle = '#f4f0e6'; q.fillRect(0, 0, w, h); q.fillStyle = '#c0201a'; q.textAlign = 'center'; q.font = '900 84px "Arial Black", sans-serif'; q.fillText(text, w / 2, 100); });
    const p = new T.Mesh(new T.PlaneGeometry(1.4, 0.7), new T.MeshStandardMaterial({ map: t, side: T.DoubleSide, roughness: 0.7 })); p.position.set(0, 2.6, 0.27); g.add(p); return done(g); };
  // floating music notes (humming): emissive sprites
  PROPS.notes = (c = '#ffe8a0', n = 5) => { const g = new T.Group(); for (let i = 0; i < n; i++) { const t = textTex(128, 128, (q) => { q.fillStyle = '#fff'; q.font = '900 110px serif'; q.textAlign = 'center'; q.fillText(i % 2 ? '♪' : '♫', 64, 108); });
    const s = new T.Sprite(new T.SpriteMaterial({ map: t, color: new T.Color(c).multiplyScalar(2.2), transparent: true, depthWrite: false, toneMapped: false })); s.position.set(Math.sin(i * 1.7) * 0.8, i * 0.9, i * 0.5); s.scale.setScalar(0.9 - i * 0.08); g.add(s); } return g; };
  PROPS.mailHook = (to) => ROPE.mail({ to });
  PROPS.stool = (h = 1.5) => { const g = new T.Group(), w = SM('#9a6a3a', 0.7); B(g, 1.5, 0.25, 1.5, w, 0, h - 0.12, 0, 0.05); [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => B(g, 0.22, h - 0.2, 0.22, w, x, (h - 0.2) / 2, z, 0.04)); return done(g); };
  PROPS.flag = (c = '#e84040') => { const g = new T.Group(); cyl(g, 0.06, 2.4, SM('#ddd'), 0, 1.2, 0, 0, 0, 6); const f = new T.Mesh(new T.PlaneGeometry(1.0, 0.65), new T.MeshStandardMaterial({ color: c, side: T.DoubleSide })); f.position.set(0.5, 2.05, 0); g.add(f); return done(g); };
  // speed streaks / dust puffs (slip, sneeze): white additive cards
  PROPS.puff = (n = 7, c = '#ffffff') => { const g = new T.Group(), m = new T.MeshStandardMaterial({ color: c, roughness: 1, transparent: true, opacity: 0.85 }); for (let i = 0; i < n; i++) { const s = new T.Mesh(new T.IcosahedronGeometry(0.35 + (i % 3) * 0.15, 1), m); s.position.set(Math.sin(i * 2.1) * 0.8, Math.cos(i * 1.3) * 0.5, i * 0.25); g.add(s); } return g; };
})();
