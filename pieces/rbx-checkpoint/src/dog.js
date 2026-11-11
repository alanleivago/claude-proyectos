// Turbo: cute blocky Roblox-style dog rig. Root on the ground, faces +z. Very long floppy two-segment ears (he trips on them),
// 4 R6-style block legs on hip pivots, wagging tail, red collar with a tiny checkpoint-flag tag, decal eyes + snout mouth.
// API like GN.avatar: { root, body, neck, head, armL/armR (front legs), legL/legR (back legs), pose(p), setFace(mood[-talk]) }.
'use strict';
const DOG = {};
(function () {
  const T = THREE, PI = Math.PI, { rbox, cnv, tex } = RBX, K = '#141414';
  const mat = (c, o = {}) => new T.MeshPhysicalMaterial({ color: c, roughness: o.rough ?? 0.55, clearcoat: o.gloss ?? 0.15, clearcoatRoughness: 0.5 });
  const B = (w, h, d, m, x, y, z, r = 0.1) => { const me = new T.Mesh(rbox(w, h, d, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001), 6), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; return me; };
  // ---------- face decals: eyes (on the head front) and mouth (on the snout front) ----------
  const ln = (g, pts, w = 7) => { g.strokeStyle = K; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
  const disc = (g, x, y, r, c = K) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const EYE = { L: [150, 70], R: [362, 70] };   // 512x160 canvas over a 1.2 x 0.375 plane
  const eyes = {
    calm: (g) => [EYE.L, EYE.R].forEach(([x, y]) => { disc(g, x, y + 4, 24); disc(g, x - 8, y - 6, 8, '#fff'); disc(g, x + 8, y + 12, 3.5, '#fff'); }),
    happy: (g) => [EYE.L, EYE.R].forEach(([x, y]) => { g.strokeStyle = K; g.lineWidth = 13; g.lineCap = 'round'; g.beginPath(); g.arc(x, y + 22, 28, PI + 0.35, -0.35); g.stroke(); }),
    shock: (g) => [EYE.L, EYE.R].forEach(([x, y], i) => { g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.arc(x, y + 6, 40, 0, 7); g.fill(); g.stroke(); disc(g, x + (i ? -6 : 6), y + 8, 13); ln(g, [x - 40, y - 52, x + 30, y - 62 + (i ? 0 : 0)], 8); }),
    sad: (g) => [EYE.L, EYE.R].forEach(([x, y], i) => { disc(g, x, y + 8, 34); disc(g, x - 10, y - 4, 13, '#fff'); disc(g, x + 12, y + 20, 6, '#fff'); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y + 34, 22, 6, 0, 0, PI); g.fill(); const s = i ? -1 : 1; ln(g, [x - s * 44, y - 34, x + s * 18, y - 52], 7);
      g.fillStyle = 'rgba(90,180,255,0.95)'; g.beginPath(); g.ellipse(x + s * 30, y + 52, 8, 14, 0, 0, 7); g.fill(); }),
    bark: (g) => [EYE.L, EYE.R].forEach(([x, y], i) => { disc(g, x, y + 6, 22); disc(g, x - 7, y - 3, 7, '#fff'); const s = i ? -1 : 1; ln(g, [x - s * 34, y - 40, x + s * 20, y - 28], 10); }),
    dizzy: (g) => [EYE.L, EYE.R].forEach(([x, y]) => { g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); for (let a = 0; a < PI * 5; a += 0.2) { const r = 3 + a * 2.4; g.lineTo(x + Math.cos(a) * r, y + 6 + Math.sin(a) * r); } g.stroke(); }),
    sleepy: (g) => [EYE.L, EYE.R].forEach(([x, y]) => ln(g, [x - 26, y + 14, x + 26, y + 14], 9)),
  };
  // mouth canvas 256x160 over the snout front (0.8 x 0.5); the nose sits on top, so draw from y~70 down
  const mouths = {
    w: (g) => { g.strokeStyle = K; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 72); g.lineTo(128, 92); g.stroke(); g.beginPath(); g.arc(104, 92, 24, 0.1, PI - 0.4); g.stroke(); g.beginPath(); g.arc(152, 92, 24, 0.4, PI - 0.1); g.stroke(); },
    open: (g, big = 1) => { g.fillStyle = '#4a0a10'; g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.moveTo(128 - 60 * big, 80); g.lineTo(128 + 60 * big, 80); g.quadraticCurveTo(128 + 58 * big, 80 + 80 * big, 128, 82 + 76 * big); g.quadraticCurveTo(128 - 58 * big, 80 + 80 * big, 128 - 60 * big, 80); g.fill(); g.stroke();
      g.save(); g.clip(); g.fillStyle = '#ee6a88'; g.beginPath(); g.ellipse(128, 80 + 74 * big, 40 * big, 30 * big, 0, 0, 7); g.fill(); g.restore(); ln(g, [128, 64, 128, 80], 8); },
    o: (g) => { ln(g, [128, 64, 128, 84], 8); g.fillStyle = K; g.beginPath(); g.ellipse(128, 108, 16, 20, 0, 0, 7); g.fill(); },
    n: (g) => { ln(g, [128, 64, 128, 86], 8); g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.arc(128, 122, 30, PI + 0.5, -0.5); g.stroke(); },
    wavy: (g) => { ln(g, [128, 64, 128, 84], 8); ln(g, [84, 104, 100, 94, 116, 104, 132, 94, 148, 104, 164, 94, 176, 102], 7); },
  };
  const FACE = { calm: ['calm', 'w', 0], happy: ['happy', 'open', 1], shock: ['shock', 'o', 0], sad: ['sad', 'n', 0], bark: ['bark', 'open', 1], dizzy: ['dizzy', 'wavy', 0], sleepy: ['sleepy', 'w', 0] };
  DOG.MOODS = Object.keys(FACE);
  const TX = {};
  const eyeTex = (k, patch) => TX['e' + k + patch] || (TX['e' + k + patch] = (() => { const c = cnv(512, 160), g = c.getContext('2d');
    if (patch) { g.fillStyle = patch; g.beginPath(); g.ellipse(EYE.R[0] + 6, EYE.R[1] + 10, 72, 62, 0.25, 0, 7); g.fill(); }
    eyes[k](g); const t = tex(c); t.anisotropy = 8; return t; })());
  const mouthTex = (k, talk) => TX['m' + k + talk] || (TX['m' + k + talk] = (() => { const c = cnv(256, 160), g = c.getContext('2d'); if (talk && k !== 'open') mouths.open(g, 0.75); else mouths[k](g); const t = tex(c); t.anisotropy = 8; return t; })());

  DOG.make = function (o = {}) {
    const fur = mat(o.fur || '#e0a050'), cream = mat(o.cream || '#f8e6c4'), earM = mat(o.ear || '#9a5426', { rough: 0.7 }), black = mat('#141414', { rough: 0.25, gloss: 0.9 });
    const root = new T.Group(); root.name = 'dog';
    const body = new T.Group(); body.position.y = 1.5; root.add(body);
    const torso = B(1.3, 1.15, 2.3, fur, 0, 0, 0, 0.22); body.add(torso);
    body.add(B(0.9, 0.7, 0.1, cream, 0, -0.1, 1.12, 0.3));          // chest bib
    body.add(B(1.0, 0.1, 1.6, cream, 0, -0.56, 0.1, 0.05));           // belly
    // legs on hip pivots (top of each leg at the body's underside)
    const leg = (x, z) => { const p = new T.Group(); p.position.set(x, -0.45, z); body.add(p); p.add(B(0.48, 1.0, 0.48, fur, 0, -0.48, 0, 0.1)); p.add(B(0.54, 0.24, 0.62, cream, 0, -0.93, 0.05, 0.1)); return p; };
    const armL = leg(0.38, 0.78), armR = leg(-0.38, 0.78), legL = leg(0.38, -0.78), legR = leg(-0.38, -0.78);
    // neck + head
    const neck = new T.Group(); neck.position.set(0, 0.45, 0.95); body.add(neck);
    const head = new T.Group(); head.position.set(0, 0.48, 0.38); neck.add(head);
    head.add(B(1.36, 1.2, 1.16, fur, 0, 0, 0, 0.28));
    head.add(B(0.84, 0.56, 0.58, cream, 0, -0.3, 0.76, 0.18));        // snout
    head.add(B(0.36, 0.22, 0.18, black, 0, -0.1, 1.06, 0.08));        // nose
    const eyeM = new T.MeshStandardMaterial({ map: eyeTex('calm', o.patch), transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const eyeP = new T.Mesh(new T.PlaneGeometry(1.2, 0.375), eyeM); eyeP.position.set(0, 0.17, 0.583); eyeP.renderOrder = 1; head.add(eyeP);
    const mouM = new T.MeshStandardMaterial({ map: mouthTex('w', false), transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const mouP = new T.Mesh(new T.PlaneGeometry(0.8, 0.5), mouM); mouP.position.set(0, -0.32, 1.054); mouP.renderOrder = 1; head.add(mouP);
    const tongue = B(0.26, 0.34, 0.08, mat('#ee6a88', { rough: 0.4, gloss: 0.6 }), 0.1, -0.66, 1.0, 0.06); tongue.rotation.x = 0.2; head.add(tongue); tongue.visible = false;
    // blush
    [-1, 1].forEach((s) => { const b = new T.Mesh(new T.CircleGeometry(0.11, 16), new T.MeshBasicMaterial({ color: '#ff7a98', transparent: true, opacity: 0.55, depthWrite: false })); b.position.set(s * 0.46, -0.12, 0.584); b.scale.y = 0.55; head.add(b); });
    // ears: two segments each, hinge at the head side, lower flap on its own hinge (can flop / be stepped on)
    const ear = (s) => { const p = new T.Group(); p.position.set(s * 0.71, 0.4, 0.02); head.add(p); p.add(B(0.14, 0.5, 0.62, earM, 0, -0.05, 0, 0.07)); p.add(B(0.13, 1.2, 0.6, earM, 0, -0.62, 0, 0.065)); const lo = new T.Group(); lo.position.set(0, -1.15, 0); p.add(lo); lo.add(B(0.13, 1.2, 0.66, earM, 0, -0.55, 0, 0.065)); lo.add(B(0.14, 0.42, 0.7, earM, 0, -1.1, 0.0, 0.2)); p.lo = lo; return p; };
    const earL = ear(1), earR = ear(-1);
    // tail
    const tail = new T.Group(); tail.position.set(0, 0.4, -1.12); body.add(tail); tail.add(B(0.26, 0.95, 0.26, fur, 0, 0.45, 0, 0.1)); tail.add(B(0.3, 0.3, 0.3, cream, 0, 0.95, 0, 0.12));
    // collar + flag tag
    const col = new T.Mesh(new T.TorusGeometry(0.62, 0.09, 10, 28), mat(o.collar || '#e8202a', { rough: 0.4, gloss: 0.5 })); col.rotation.x = PI / 2 - 0.5; col.position.set(0, 0.3, 0.26); col.scale.set(1.05, 1.0, 0.95); neck.add(col);
    if (typeof CP !== 'undefined') { const f = CP.flag({ c: o.tag || '#f05a28', h: 0.55, w: 0.3, pole: 0.02, pad: false }); f.position.set(0.12, -0.25, 0.86); neck.add(f); }
    root.scale.setScalar(o.scale || 1);
    const av = { root, body, torso, head, neck, armL, armR, legL, legR, earL, earR, tail, tongue, o, isDog: true };
    av.setFace = (name) => { const talk = name.endsWith('-talk'), k = name.replace('-talk', ''), f = FACE[k] || FACE.calm; av.faceName = name;
      eyeM.map = eyeTex(f[0], o.patch); eyeM.needsUpdate = true; mouM.map = mouthTex(f[1], talk); mouM.needsUpdate = true; tongue.visible = !!f[2] || talk; };
    // pose: { legs:[fl,fr,bl,br] rotations, head, body, tail, ears:[[l],[r]], earsLo:[[l],[r]] } (missing = rest)
    av.pose = (p = {}) => { body.position.set(0, 1.5, 0); const set = (g, v) => g.rotation.set((v && v[0]) || 0, (v && v[1]) || 0, (v && v[2]) || 0); const L = p.legs || [];
      [armL, armR, legL, legR].forEach((g, i) => set(g, L[i])); set(neck, p.head); set(body, p.body); set(tail, p.tail || [-0.7, 0, 0]);
      const E = p.ears || [[0, 0, 0.08], [0, 0, -0.08]], EL = p.earsLo || [[0, 0, -0.04], [0, 0, 0.04]]; set(earL, E[0]); set(earR, E[1]); set(earL.lo, EL[0]); set(earR.lo, EL[1]); };
    av.pose({}); av.setFace('calm');
    return av;
  };
  // dog acting on top of the stage pose: tail wag, head bob / tilt, ear sway, panting body; k = energy
  DOG.act = (a, t, ph = 0, k = 1) => { const S = Math.sin; a.tail.rotation.z += 0.7 * k * S(t * 14 + ph); a.tail.rotation.x += 0.1 * S(t * 3 + ph);
    a.neck.rotation.x += 0.07 * S(t * 2.1 + ph) * k; a.neck.rotation.z += 0.12 * S(t * 1.3 + ph); a.neck.rotation.y += 0.18 * S(t * 0.8 + ph);
    a.earL.rotation.z += 0.07 * S(t * 3.1 + ph); a.earR.rotation.z -= 0.07 * S(t * 3.3 + ph + 1); a.earL.lo.rotation.z += 0.08 * S(t * 4 + ph); a.earR.lo.rotation.z -= 0.08 * S(t * 4.2 + ph);
    a.body.rotation.x += 0.025 * S(t * 7 + ph) * k; a.body.position.y += 0.03 * S(t * 7 + ph) * k; };
  DOG.POSE = {
    stand: {}, sit: { body: [-0.55, 0, 0], legs: [[0.55, 0, 0], [0.55, 0, 0], [-0.9, 0, 0], [-0.9, 0, 0]], head: [0.45, 0, 0], tail: [-1.3, 0, 0] },
    wag: (ph = 0) => ({ tail: [-0.7, 0, Math.sin(ph) * 0.7], head: [0.05, Math.sin(ph * 0.5) * 0.15, 0] }),
    run: (ph = 0) => ({ legs: [[Math.sin(ph) * 0.7, 0, 0], [Math.sin(ph + 0.6) * 0.7, 0, 0], [-Math.sin(ph) * 0.7, 0, 0], [-Math.sin(ph + 0.6) * 0.7, 0, 0]], ears: [[0.8, 0, 0.3], [0.8, 0, -0.3]], earsLo: [[0.5, 0, 0], [0.5, 0, 0]], tail: [-1.0, 0, 0] }),
    jump: { body: [-0.5, 0, 0], legs: [[-1.0, 0, 0], [-1.0, 0, 0], [0.9, 0, 0], [0.9, 0, 0]], ears: [[1.6, 0, 0.5], [1.6, 0, -0.5]], earsLo: [[0.6, 0, 0], [0.6, 0, 0]], tail: [-1.4, 0, 0], head: [-0.2, 0, 0] },
    // tripping on his own ears: front paws stepping on the ear tips, nose diving, back legs up
    trip: { body: [0.55, 0, 0], legs: [[-0.5, 0, 0], [-0.3, 0, 0], [0.9, 0, 0], [0.7, 0, 0]], ears: [[-1.0, 0, 0.12], [-0.9, 0, -0.12]], earsLo: [[-0.9, 0, 0], [-1.0, 0, 0]], tail: [-1.5, 0, 0.3], head: [0.25, 0, 0] },
    sniff: { head: [0.75, 0, 0], body: [0.12, 0, 0], tail: [-1.1, 0, 0.3] },
    beg: { body: [-1.0, 0, 0], legs: [[1.4, 0, 0], [1.4, 0, 0], [-0.1, 0, 0], [-0.1, 0, 0]], head: [0.75, 0, 0], tail: [-0.2, 0, 0] },
  };
})();
