// rbx-library cast: the channel's dino-hood hero (ported from rbx-thursday: RBX.avatar hood 'dino', headScale 1.25) wearing the
// Gneef F-face set, plus Gneef-style "wild" townsfolk (GN kit), the Late Fee (LF, custom creature) and the face-books (BOOK).
'use strict';
const CAST = {};
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI;
  const A = (o) => () => GN.avatar(o);
  const SM = (c, r = 0.6, m = 0, e) => { const k = new T.MeshPhysicalMaterial({ color: c, roughness: r, metalness: m, clearcoat: 0.2, clearcoatRoughness: 0.5 }); if (e) { k.emissive = new T.Color(e[0]); k.emissiveIntensity = e[1]; } return k; };
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
  // ---- shark-print pyjama fabric (Nico): pale aqua flannel, little grey sharks + bubbles ----
  GN.PAT.sharks = (o) => { const S = 256, c = RBX.cnv(S, S), h = RBX.cnv(S, S), g = c.getContext('2d'), hg = h.getContext('2d'); hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, S);
    g.fillStyle = o.c; g.fillRect(0, 0, S, S); for (let y = 0; y < S; y += 4) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, y, S, 2); }
    const r = RBX.rng(o.seed || 77); const shark = (x, y, s, fl) => { g.save(); g.translate(x, y); g.scale(fl * s, s); g.fillStyle = o.a || '#5a6a7e';
      g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-6, -14, 22, -2); g.lineTo(30, -9); g.lineTo(28, 2); g.lineTo(32, 10); g.lineTo(21, 4); g.quadraticCurveTo(-4, 13, -26, 0); g.fill();
      g.beginPath(); g.moveTo(-2, -9); g.lineTo(6, -22); g.lineTo(10, -6); g.fill(); g.fillStyle = '#f4f8fa'; g.beginPath(); g.moveTo(-24, 2); g.quadraticCurveTo(-4, 11, 18, 4); g.quadraticCurveTo(-4, 5, -24, 2); g.fill();
      g.fillStyle = '#141414'; g.beginPath(); g.arc(-16, -3, 2.2, 0, 7); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(-21 + k * 3, 3); g.lineTo(-19.5 + k * 3, 6); g.lineTo(-18 + k * 3, 3); } g.stroke(); g.restore(); };
    [[50, 50, 1, 1], [180, 40, 0.9, -1], [110, 130, 1.1, 1], [30, 200, 0.85, -1], [200, 190, 1, 1], [-206, 50, 1, 1], [306, 40, 0.9, -1]].forEach(([x, y, s, f]) => shark(x, y, s, f));
    for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(r() * S, r() * S, 2 + r() * 3, 0, 7); g.stroke(); }
    return { c, h }; };
  // ---- extras ----
  const nightcap = (c = '#2a4a9a', pom = '#ffffff') => (av) => { const g = new T.Group(), m = SM(c, 0.9); const cone = M(new T.ConeGeometry(0.62, 1.5, 20, 1, true), m, 0, 0.95, -0.15); cone.rotation.x = -0.5; cone.rotation.z = 0.35; g.add(cone);
    const cuff = M(new T.TorusGeometry(0.6, 0.12, 10, 28), SM(pom, 1)); cuff.rotation.x = PI / 2; cuff.position.y = 0.42; g.add(cuff); const p = M(new T.SphereGeometry(0.2, 14, 10), SM(pom, 1), 0.48, 1.46, -0.82); g.add(p); av.hairG.add(g); };
  const curlers = (c = '#f06ab0') => (av) => { const m = SM(c, 0.4); [[-0.35, 0.62, 0.15], [0, 0.68, 0.2], [0.35, 0.62, 0.15], [-0.3, 0.58, -0.3], [0.3, 0.58, -0.3], [0, 0.66, -0.15]].forEach(([x, y, z]) => { const k = M(new T.CylinderGeometry(0.13, 0.13, 0.42, 12), m, x, y, z); k.rotation.z = PI / 2; av.hairG.add(k); }); };
  const cucumbers = () => (av) => { const m = SM('#c8e8a0', 0.5), rim = SM('#2a7a2a', 0.5); [-1, 1].forEach((s) => { const d = M(new T.CylinderGeometry(0.16, 0.16, 0.04, 20), m, s * 0.24, 0.08, 0.6); d.rotation.x = PI / 2; av.head.add(d); const r = M(new T.TorusGeometry(0.16, 0.02, 6, 20), rim, s * 0.24, 0.08, 0.62); av.head.add(r); }); };
  const stink = (c = '#9adf4a') => (av) => { const m = new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5, transparent: true, opacity: 0.75 });
    [-0.9, 0, 0.9].forEach((x, i) => { const pts = []; for (let k = 0; k <= 12; k++) pts.push(V(x + Math.sin(k * 0.9 + i) * 0.18, 1.6 + k * 0.17, -0.2)); av.body.add(M(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 0.05, 6), m)); }); av.stink = true; };
  const noodle = () => (av) => { const m = SM('#f4e08a', 0.5); const pts = []; for (let k = 0; k <= 10; k++) pts.push(V(-0.4 + k * 0.08, 0.6 + Math.sin(k) * 0.06, 0.3 - k * 0.04)); av.head.add(M(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.035, 6), m));
    const ca = M(new T.CylinderGeometry(0.1, 0.1, 0.03, 12), SM('#f08a2a', 0.5), 0.25, 0.62, 0.1); av.head.add(ca); };
  const sharkFin = (c = '#5a6a7e') => (av) => { const s = new T.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.2, 0.7, 0.9, 1.0); s.quadraticCurveTo(0.55, 0.5, 0.75, 0); s.lineTo(0, 0); const f = M(new T.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 }), SM(c, 0.6), 0.04, 0.3, -0.5); f.rotation.y = PI / 2; av.body.add(f); };
  const sticker = (text = 'GOOD READER') => (av) => { const c = RBX.cnv(256, 256), q = c.getContext('2d'); q.fillStyle = '#f2c01a'; KIT.star(q, 128, 128, 124, 12, 0.82); q.fill(); q.strokeStyle = '#c8501a'; q.lineWidth = 6; q.stroke();
    q.fillStyle = '#141414'; q.textAlign = 'center'; q.font = '900 46px Arial Black, Arial'; const [a, b] = text.split(' '); q.fillText(a, 128, 120); q.fillText(b || '', 128, 170); const m = new T.Mesh(new T.CircleGeometry(0.32, 32), new T.MeshStandardMaterial({ map: RBX.tex(c), roughness: 0.4 }));
    m.position.set(0.5, 0.45, 0.515); av.body.add(m); av.sticker = m; };
  const stopwatch = () => (av) => { const g = new T.Group(); g.add(M(new T.CylinderGeometry(0.28, 0.28, 0.12, 24), SM('#d8d8de', 0.25, 0.9))); const f = M(new T.CircleGeometry(0.23, 24), new T.MeshStandardMaterial({ map: KIT.textTex(128, 128, (q, w) => { q.fillStyle = '#fff'; q.fillRect(0, 0, w, w); q.strokeStyle = '#c81e1e'; q.lineWidth = 7; q.beginPath(); q.moveTo(64, 64); q.lineTo(64, 14); q.stroke(); q.fillStyle = '#111'; q.font = '900 26px Arial'; q.textAlign = 'center'; q.fillText('11:59', 64, 100); }) }), 0, 0.065, 0); f.rotation.x = -PI / 2; g.add(f);
    g.add(M(new T.CylinderGeometry(0.06, 0.06, 0.14, 8), SM('#c8c8d0', 0.3, 0.9), 0, 0, 0.32)); g.rotation.x = PI / 2.4; g.position.set(0, -1.95, 0.5); av.armR.inner.add(g); av.watch = g; };
  // a hardback carried in the hand (cover colour, title)
  const handBook = (cover = '#c03030', title = 'SHARKS', side = 'L') => (av) => { const b = BOOK.plain({ cover, title, w: 1.0, h: 1.3, d: 0.22 }); b.rotation.set(-0.2, 0, 0); b.position.set(0, -2.05, 0.45); (side === 'L' ? av.armL : av.armR).inner.add(b); av.book = b; };
  const purse = (c = '#c0304a') => (av) => { const g = new T.Group(); g.add(M(RBX.rbox(0.9, 0.6, 0.35, 0.12, 4), SM(c, 0.35))); const h = M(new T.TorusGeometry(0.3, 0.05, 8, 20, PI), SM('#e8b830', 0.3, 0.8), 0, 0.3, 0); g.add(h); g.position.set(0, -2.3, 0.1); av.armL.inner.add(g); };
  const collar70 = (c = '#f4efe2') => (av) => { [-1, 1].forEach((s) => { const sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(s * 0.75, 0.05); sh.lineTo(s * 0.25, -0.55); sh.lineTo(0, 0); const m = M(new T.ShapeGeometry(sh), new T.MeshStandardMaterial({ color: c, roughness: 0.6, side: T.DoubleSide }), 0, 0.98, 0.52); m.rotation.x = -0.25; av.body.add(m); }); };
  // ---- the hero: rbx-thursday's dino-hood kid, exact rig/hood (RBX.avatar), Gneef F-faces swapped onto his face decal ----
  const dinoHero = (o = {}) => () => { const a = RBX.avatar(Object.assign({ hood: 'dino', face: 'neutral', headScale: 1.25 }, o));
    a.o = Object.assign({ face: 'F1', headScale: 1.25, scale: o.scale || 1 }, o); a.lash = false; a.tierA = false; a.hairG = new T.Group(); a.head.add(a.hairG);
    [a.armL, a.armR].forEach((arm) => { arm.inner = arm; arm.handOff = V(0, -1.8, 0); });
    a.setFace = (name) => { a.faceName = name; a.faceMat.map = GN.faceTex(name, {}); a.faceMat.needsUpdate = true; }; a.setFace('F1');
    (o.extras || []).forEach((f) => f(a)); a.isHero = true; return a; };
  // ---- named cast (Gneef checklist: one dominant hue each, smooth vs spiky pairs, >=1 hair over 1.5x) ----
  const DEF = {
    hero: dinoHero({ scale: 0.95 }),
    heroBook: dinoHero({ scale: 0.95, extras: [handBook('#2a8a5a', 'MY BOOK', 'L')] }),
    heroSticker: dinoHero({ scale: 0.95, extras: [sticker()] }),
    // Nico (7, neighbour, mono-blue): electric-blue spike fan, blue tee + shark plate, yellow shorts, picture books under the arm
    nico: A({ skin: '#F4A878', hair: 'H2', hairC: '#1E6FE0', hairO: { tip: '#58B8F8' }, top: { p: 'tee', c: '#1E6FE0' }, sleeve: 'short', legs: { p: 'tee', c: '#F2C01A' }, shoes: '#f4f2ee', sole: '#1E6FE0', face: 'F6', scale: 0.7, headScale: 1.2,
      extras: [handBook('#2a6ab0', 'SHARKS', 'L'), sharkFin('#1a4aa8')] }),
    // Nico in his shark pyjamas (night, the stamp, popping out of the cover)
    nicoPJ: A({ skin: '#F4A878', hair: 'H2', hairC: '#1E6FE0', hairO: { tip: '#58B8F8' }, top: { p: 'sharks', c: '#9ad8f0', tile: 1.2 }, collar: '#5a6a7e', cuff: '#5a6a7e', legs: { p: 'sharks', c: '#9ad8f0', tile: 1.2 }, shoes: '#5a6a7e', sole: '#f4f2ee', face: 'F12', scale: 0.7, headScale: 1.2,
      extras: [sharkFin()] }),
    // Nico's mom (mono red): Gneef "gingham mom" - red space buns, red gingham, white apron, red skirt, big purse
    mom: A({ skin: '#E89A84', hair: 'H3', hairC: '#E0141E', hairO: { bobble: '#f6d020' }, top: { p: 'gingham', c: '#d0202a', tile: 0.6 }, legs: { p: 'tee', c: '#C1121F' }, shoes: '#3a1a1a', sole: '#141414', lash: true, face: 'F13', scale: 1.04,
      extras: [GN.apron('#f8f4ec', '#f8f4ec'), GN.skirt('#C1121F'), purse()] }),
    // Mr. Dale (one minute late in 1979, mono mustard): bald dome + brown side tufts, huge brown walrus moustache, 70s leisure suit,
    // wide white collar, flares, a noodle + carrot on his head and green soup-stink lines when he pops out of the cookbook
    dale: A({ skin: '#F3D9C2', hair: 'H15', hairC: '#6a3a1e', hairO: { stache: false }, stache: '#5a3018', stacheW: 1.3, stacheStyle: 'handlebar', glasses: '#8a6a2a', top: { p: 'tee', c: '#C8962A' }, legs: { p: 'tee', c: '#7a4a1e' }, shoes: '#3a2012', sole: '#1a0e08', face: 'F7', scale: 1.06,
      extras: [GN.belly('#C8962A'), collar70(), stink(), noodle()] }),
    // 11:59 pyjama parents at the drop box: nightcap dad (noob, stripes, stopwatch, book) / green face-mask mum (curlers, pink robe, cucumbers) / afro dad (sleep mask, yellow onesie)
    pjdad: A({ tier: 'A', skin: '#F5CD30', top: { c: '#2a4a9a' }, legs: { c: '#2a4a9a' }, face: 'F13', extras: [nightcap(), stopwatch(), handBook('#e8a020', 'BIRDS', 'L')] }),
    pjmom: A({ skin: '#9ad08a', hair: 'H9', hairC: '#3a1a10', hairO: { band: '#f06ab0' }, top: { p: 'knit', c: '#f6a0c8', tile: 1, bands: 0, bump: 6 }, boxy: true, legs: { p: 'knit', c: '#f6a0c8', tile: 1, bands: 0 }, shoes: '#ffffff', sole: '#f06ab0', lash: true, face: 'F10', extras: [curlers(), cucumbers(), handBook('#7a3ad0', 'POEMS', 'R')] }),
    pjafro: A({ skin: '#7A3E26', hair: 'H6', hairC: '#1A1210', hat: 'mask', hatC: '#2a1030', top: { p: 'stripes', c: '#f6d020', a: '#f8f0b0', n: 8 }, legs: { p: 'stripes', c: '#f6d020', a: '#f8f0b0', n: 8 }, shoes: '#8a5a3a', sole: '#3a2010', face: 'F14', scale: 1.08, extras: [handBook('#18a070', 'GOLF', 'R')] }),
    // story-time kids (small): noob with propeller beanie / pink pigtails / hot-pink top-knot / tiny afro in a bunny tee
    kid1: A({ tier: 'A', skin: '#F5CD30', top: { c: '#E0101A' }, legs: { c: '#1E6FE0' }, hat: 'prop', face: 'F5', scale: 0.62, headScale: 1.18 }),
    kid2: A({ skin: '#F0A0A0', hair: 'H8', hairC: '#F5C842', hairO: { bobble: '#E040A8' }, top: { p: 'floral', c: '#f4ead8', size: 5 }, legs: { p: 'denim', c: '#3E6FA8' }, lash: true, face: 'F7', scale: 0.62, headScale: 1.18, extras: [GN.overalls('#3E6FA8')] }),
    kid3: A({ skin: '#F3D9C2', hair: 'H14', hairC: '#E040A8', top: { p: 'tee', c: '#38c060' }, legs: { p: 'tee', c: '#2a2a2a' }, lash: true, face: 'F6', scale: 0.62, headScale: 1.18 }),
    kid4: A({ skin: '#A0603A', hair: 'H6', hairC: '#1A1210', top: { p: 'stripes', c: '#f6d0e0', a: '#b8e0f8', n: 8 }, legs: { p: 'tee', c: '#f08a2a' }, face: 'F2', scale: 0.62, headScale: 1.18 }),
    // firemen (fire-drill gag) + the hero in second grade
    fire1: A({ skin: '#A0603A', hat: 'fire', hatC: '#c81e1e', stache: '#1a1210', stacheW: 1.25, stacheStyle: 'walrus', top: { p: 'tee', c: '#c89a3a' }, boxy: true, legs: { p: 'tee', c: '#c89a3a' },
      gloves: '#2a2a2a', shoes: '#1a1a1a', sole: '#1a1a1a', face: 'F1', scale: 1.06, extras: [GN.bunker()] }),
    fire2: A({ skin: '#F4A878', hair: 'H13', hairC: '#B3121A', hat: 'fire', hatC: '#f2c01a', top: { p: 'tee', c: '#2a2e3a' }, boxy: true, legs: { p: 'tee', c: '#2a2e3a' },
      gloves: '#2a2a2a', shoes: '#1a1a1a', sole: '#1a1a1a', lash: true, face: 'F5', extras: [GN.bunker('#f2e030', '#d8dce0')] }),
    heroKid: dinoHero({ scale: 0.68 }),
    // the Late Fee: creepy (night) and friendly (story time) builds of the same creature
    latefee: () => LF.make({ kind: false }),
    latefeeKind: () => LF.make({ kind: true }),
  };
  // ---- crowd kit (Gneef extras: >=1 noob, afro, bun, moustache, elder; every extra a different hair) ----
  const CROWD = [
    { tier: 'A', skin: '#F5CD30', top: { c: '#1E6FE0' }, legs: { c: '#7ED321' }, hat: 'prop', face: 'F1' },
    { tier: 'A', skin: '#F5CD30', top: { c: '#E0101A' }, legs: { c: '#E0101A' }, hair: 'H2', hairC: '#F5D400', face: 'F6' },
    { skin: '#F4A878', hair: 'H15', hairC: '#3a2418', top: { p: 'tee', c: '#f4f2ee' }, legs: { p: 'tee', c: '#3a3a40' }, extras: [GN.suspenders('#151515')], face: 'F13' },
    { skin: '#7A3E26', hair: 'H6', hairC: '#1A1210', hairO: { beanie: '#3B5A8C' }, top: { p: 'tee', c: '#F2C94C' }, legs: { p: 'denim', c: '#3a4a6a' }, face: 'F5' },
    { skin: '#F0A0A0', hair: 'H14', hairC: '#E040A8', top: { p: 'fairisle', c: '#2a3a7a', a: '#f4ead8', b: '#E040A8', tile: 0.6 }, legs: { p: 'tee', c: '#2a2a2a' }, lash: true, face: 'F3' },
    { skin: '#F0A0A0', hair: 'H4', hairC: '#111111', top: { p: 'tee', c: '#1E6FE0' }, legs: { p: 'tee', c: '#1a2a5a' }, face: 'F11' },
    { skin: '#F5CD30', hair: 'H2', hairC: '#C1121F', top: { p: 'tee', c: '#FF8A1E' }, legs: { p: 'tee', c: '#2a2a2a' }, face: 'F14' },
    { skin: '#E89A84', hair: 'H3', hairC: '#E0141E', top: { p: 'gingham', c: '#d0202a', tile: 0.6 }, legs: { p: 'tee', c: '#C1121F' }, lash: true, face: 'F5', extras: [GN.apron('#f8f4ec', '#f8f4ec')] },
    { skin: '#F4A878', hat: 'H12', hatC: '#4A2A1E', stache: '#E8762A', stacheW: 1.15, top: { p: 'fairisle', c: '#5a3a28', a: '#f0d8a8', b: '#c0392b', tile: 0.6 }, legs: { p: 'denim', c: '#2e3e5e' }, face: 'F14', extras: [GN.vest('#FF6A00')] },
    { skin: '#F3D9C2', hair: 'H9', hairC: '#111111', top: { p: 'tee', c: '#4B3DA0' }, legs: { p: 'floral', c: '#1d2350', size: 5 }, lash: true, face: 'F10' },
    { skin: '#F4A878', hair: 'H15', hairC: '#E5E1DA', top: { p: 'plaid', c: '#3a6a3a', a: '#1a2a1a', b: '#e0c040' }, legs: { p: 'tee', c: '#4a4038' }, glasses: '#2a2a2a', face: 'F8' },
    { skin: '#F08A62', hair: 'H2', hairC: '#B9B9C0', top: { p: 'tee', c: '#A9A5AE' }, collar: '#ffffff', legs: { p: 'tee', c: '#0F7C73' }, sole: '#ffffff', face: 'F1' },
    { skin: '#F3D9C2', hair: 'H13', hairC: '#F5D547', hairO: { fox: true }, top: { p: 'tee', c: '#E86A9A' }, legs: { p: 'tee', c: '#f4f2ee' }, lash: true, face: 'F6' },
    { skin: '#F4A878', hair: 'H1', hairC: '#6a3a1e', top: { p: 'stripes', c: '#9ad0f0', a: '#ffffff' }, legs: { p: 'stripes', c: '#f6d0e0', a: '#b8e0f8', n: 10 }, face: 'F2' },
    { tier: 'A', skin: '#F5CD30', top: { c: '#2E9A3A' }, legs: { c: '#2D4FA0' }, hat: 'cap', hatC: '#E0101A', face: 'F7' },
    { skin: '#B9B4F0', hair: 'H6', hairC: '#3a1a10', top: { p: 'knit', c: '#d06a2a', tile: 1, bands: 2 }, legs: { p: 'tee', c: '#3a2a20' }, boxy: true, cuff: '#8a3a12', face: 'F12' },
  ];
  // restyle for this town (different tee colours from rbx-rope's crowd); kids every 5th; 'pcrowdN' = with a pocket flag (ending)
  const PAL = ['#e84a8a', '#28b0a0', '#f2a020', '#5a6ad8', '#e8e0d0', '#8ac040', '#d84a2a', '#7a3ad0', '#f6d020', '#2a8ad8'];
  const FLAGC = ['#f05a28', '#1f4fd8', '#38c060', '#e8202a', '#f2c01a', '#8a3ad0', '#18b8d8', '#f07ad0'];
  CAST.CROWD = CROWD;
  const crowdDef = (i, other, pocket) => { const b = JSON.parse(JSON.stringify(CROWD[i % CROWD.length])), src = CROWD[i % CROWD.length]; b.extras = (src.extras || []).slice(); b.hairO = src.hairO;
    if (b.top && i >= 2) b.top.c = PAL[(i * 3) % PAL.length]; if (i % 5 === 4) { b.scale = 0.74; b.headScale = 1.12; } if (pocket) b.extras.push(GN.pocketFlag(FLAGC[i % FLAGC.length]));
    const faces = ['F1', 'F14', 'F5', 'F11', 'F2', 'F10', 'F6', 'F12', 'F3', 'F8']; if (i >= CROWD.length) b.face = faces[i % faces.length];
     b.scale = (b.scale || 1) * (0.92 + ((i * 37) % 9) / 60); return () => GN.avatar(b); };
  const pool = {};
  CAST.get = (name) => { if (pool[name]) return pool[name]; let f = DEF[name];
    if (!f) { const m = /^(crowd|pcrowd)(\d+)$/.exec(name); if (m) f = crowdDef(+m[2], false, m[1] === 'pcrowd'); }
    if (!f) throw new Error('no cast ' + name); return (pool[name] = f()); };
  CAST.names = () => Object.keys(DEF);
  CAST.used = new Set(); CAST.order = [];
  // put an actor: o { p, ry, pose, face, rope:{P,D,side,ground,lean,hands} }
  CAST.put = function (scene, name, o = {}) {
    const a = CAST.get(name); if (a.root.parent !== scene) scene.add(a.root); a.root.visible = true; CAST.used.add(name); CAST.order.push(name);
    a.root.position.set(...(o.p || [0, 0, 0])); a.root.rotation.set(0, o.ry || 0, 0); a.root.quaternion.setFromEuler(a.root.rotation);
    const pose = Object.assign({}, o.pose || {}); a.stagePose = pose; a.pose(pose); a.setFace(o.face || a.o.face || 'F1'); a.keepFace = !!o.keep;
    if (o.rope) { GN.grip(a, o.rope.P, o.rope.D, Object.assign({ name, pose: o.pose }, o.rope)); a.stagePose = Object.assign({}, pose, { _rope: true }); }
    return a;
  };
  // ---- expressions change over time (Gneef: talk, react, shock, laugh, worry). Each character has a set, extremes only. ----
  CAST.EXPR = {
    hero: { calm: 'F1', ohno: 'F8', shock: 'F7', worry: 'F10', laugh: 'F5', strain: 'F14', scream: 'F12', smug: 'F3', sad: 'F9', grin: 'F6', sleepy: 'F2', terror: 'F13' },
    nico: { grin: 'F6', laugh: 'F5', calm: 'F2', shock: 'F7', scream: 'F12', sad: 'F9', ohno: 'F8', terror: 'F13' },
    mom: { terror: 'F13', calm: 'F1', rage: 'F11', sad: 'F9', shock: 'F7', laugh: 'F5', worry: 'F10' },
    dale: { shock: 'F7', laugh: 'F5', calm: 'F1', smug: 'F3', strain: 'F14', grin: 'F6' },
    pjdad: { terror: 'F13', strain: 'F14', shock: 'F7', calm: 'F1', worry: 'F10' }, pjmom: { worry: 'F10', shock: 'F7', terror: 'F13', calm: 'F2' }, pjafro: { strain: 'F14', shock: 'F7', laugh: 'F5', calm: 'F1' },
    kid1: { laugh: 'F5', shock: 'F7', grin: 'F6', calm: 'F1' }, kid2: { shock: 'F7', laugh: 'F5', grin: 'F6', calm: 'F2' }, kid3: { grin: 'F6', laugh: 'F5', shock: 'F7' }, kid4: { calm: 'F2', laugh: 'F5', shock: 'F7' },
    latefee: { blank: 'blank', tilt: 'tilt', shush: 'shush', frozen: 'frozen', kind: 'kind', hum: 'hum', voices: 'voices' },
    latefeeKind: { kind: 'kind', hum: 'hum', voices: 'voices', blank: 'blank' },
    _crowd: { calm: 'F1', laugh: 'F5', shock: 'F7', worry: 'F10', rage: 'F11', terror: 'F13', strain: 'F14', grin: 'F6', scream: 'F12', smug: 'F3' },
  };
  ['heroBook', 'heroSticker', 'heroKid'].forEach((k) => { CAST.EXPR[k] = CAST.EXPR.hero; }); CAST.EXPR.fire1 = { calm: 'F1', strain: 'F14', shock: 'F7', worry: 'F10', shout: 'F11', laugh: 'F5' }; CAST.EXPR.fire2 = { calm: 'F2', laugh: 'F5', strain: 'F14', shock: 'F7', worry: 'F10', terror: 'F13' }; CAST.EXPR.nicoPJ = CAST.EXPR.nico;
  const exprOf = (n) => CAST.EXPR[n] || CAST.EXPR._crowd;
  // face by mood name (or raw F-code), optional open-mouth talk frame
  CAST.face = (name, mood, talk = false) => { const a = CAST.get(name), f = exprOf(name)[mood] || mood; a.setFace(talk ? f + '-talk' : f); a.faceName = f; return f; };
  // keyed track: [[t, mood], ...] (t in seconds or shot fraction); talk = mouth flaps every 0.11 s while speaking
  CAST.faceAt = (name, track, t, speaking = false) => { let k = track[0][1]; for (const [tt, m] of track) if (t >= tt) k = m; return CAST.face(name, k, speaking && Math.floor(t / 0.11) % 2 === 0); };
  // background reactions: every non-lead actor swaps to another face of its own set every ~1.4-2.4 s (desynced), weighted to the shot mood
  CAST.react = (names, t, seed = 0, mood = null) => names.forEach((n) => { if (CAST.get(n).keepFace) return; const E = exprOf(n), keys = Object.keys(E); let h = 7; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) % 9973;
    const per = 1.4 + (h % 10) / 10, slot = Math.floor((t + (h % 7) * 0.3) / per), pick = mood && E[mood] && (slot + h) % 3 !== 0 ? mood : keys[(slot * 7 + h + seed * 3) % keys.length]; CAST.face(n, pick); });
  CAST.hideAll = () => Object.values(pool).forEach((a) => { a.root.visible = false; });
  CAST.POSE = {
    open: { armL: [-0.15, 0, 0.6], armR: [-0.15, 0, -0.6] }, openT: { armL: [-0.1, 0, 1.3], armR: [-0.1, 0, -1.3] }, armsUp: { armL: [-2.8, 0, 0.35], armR: [-2.8, 0, -0.35], head: [-0.12, 0, 0] }, offer: { armR: [-1.35, 0, 0.12], armL: [-0.1, 0, 0.12] },
    walk: (ph = 0) => ({ armL: [Math.sin(ph) * 0.5, 0, 0], armR: [-Math.sin(ph) * 0.5, 0, 0], legL: [-Math.sin(ph) * 0.5, 0, 0], legR: [Math.sin(ph) * 0.5, 0, 0], _walk: ph }),
    sit: { legL: [-Math.PI / 2, 0, 0.05], legR: [-Math.PI / 2, 0, -0.05], armL: [-0.5, 0, 0.1], armR: [-0.5, 0, -0.1] },
    point: { armR: [-1.6, 0, 0] }, shout: { armR: [-2.6, 0, -0.7], head: [-0.15, 0, 0] }, handsHead: { armL: [-2.75, 0, -0.12], armR: [-2.75, 0, 0.12] },
    wave: { armR: [-2.7, 0, -0.45], head: [-0.1, 0, 0] }, waveL: { armL: [-2.7, 0, 0.45], head: [-0.1, 0, 0] },
    cheer: { armL: [-2.9, 0, 0.25], armR: [-2.9, 0, -0.25], head: [-0.2, 0, 0] }, lookUp: { head: [-0.45, 0, 0] },
    ringUp: { armL: [-2.75, 0, 0.35] }, waveUpR: { armR: [-2.75, 0, -0.95] },
    crossed: { armL: [-1.45, 0, -0.5], armR: [-1.35, 0, 0.5] }, shrug: { armL: [-0.35, 0, 0.85], armR: [-0.35, 0, -0.85] }, hold: { armL: [-1.2, 0, -0.25], armR: [-1.2, 0, 0.25] },
  };
})();
