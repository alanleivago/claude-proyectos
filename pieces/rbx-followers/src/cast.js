// rbx-followers cast: Gneef-style avatars (GN kit). Named cast + gag people + a crowd kit; lazily built, moved into any scene.
'use strict';
const CAST = {};
(function () {
  const A = (o) => () => GN.avatar(o);
  const knit = (c, o = {}) => Object.assign({ p: 'knit', c, tile: 1, bands: 2, bump: 5, nscale: 1 }, o);
  // ---- named cast (checklist: one dominant hue each, smooth vs spiky pairs, >=1 hair over 1.5x) ----
  const DEF = {
    // hero (11, no name): mono-blue. Electric-blue shard mop (H1, 1.45x head), sky knit with blue rib trims, dark jeans,
    // white sneakers with blue soles, yellow school backpack (the one accent)
    hero: A({ skin: '#F4A878', hair: 'H1', hairC: '#2F7BF5', hairO: { under: '#1A3E9E', k: 1.12 }, top: knit('#A8D0FF'), boxy: true, cuff: '#2F7BF5', hem: '#2F7BF5', collar: '#2F7BF5',
      legs: { p: 'denim', c: '#26304a' }, shoes: '#f4f2ee', sole: '#2F7BF5', face: 'F1', scale: 0.9, headScale: 1.08, extras: [FOL.backpack('#F2C94C', '#1A3E9E')] }),
    // Dad: big (1.18), mono-lime. Bald with brown side tufts + handlebar moustache (H15), blue flannel, hi-vis night-shift vest
    // with silver stripes, work pants, ONE OLD SHOE (left: scuffed brown, taped, flapping sole) + one white sneaker
    dad: A({ skin: '#F4A878', hair: 'H15', hairC: '#5a3a22', hairO: { stacheC: '#5a3a22' }, top: { p: 'plaid', c: '#2a4a7a', a: '#10203a', b: '#e0c040' }, legs: { p: 'tee', c: '#3a3c44' },
      shoes: '#f4f2ee', sole: '#d8d4cc', face: 'F2', scale: 1.18, extras: [GN.vest('#C8F000', '#e8ecf0'), FOL.oldShoe()] }),
    // gag: pop star (90 M followers): hot-pink long hair, sunglasses, glitter-purple top, white pants
    popstar: A({ skin: '#F3D9C2', hair: 'H13', hairC: '#FF4FB8', top: { p: 'stripes', c: '#9a2ad8', a: '#c070ff', n: 14 }, legs: { p: 'tee', c: '#f6f2ff' }, shoes: '#FF4FB8', sole: '#ffffff',
      glasses: '#111111', lash: true, face: 'F6' }),
    // gag: the math teacher who gives up: black glossy bob + red band, mustard cardigan, glasses
    teacher: A({ skin: '#F0A0A0', hair: 'H9', hairC: '#151515', hairO: { band: '#d0202a' }, top: { p: 'tee', c: '#f4f2ee' }, legs: { p: 'tee', c: '#3a2a5a' }, glasses: '#6a2a2a', lash: true, face: 'F10',
      extras: [GN.cardigan('#d8a020')] }),
    // gag: first date (you bring everyone): date girl, mono-red, top-knot bun
    date: A({ skin: '#E89A84', hair: 'H14', hairC: '#E0141E', hairO: { tie: '#f4f2ee' }, top: { p: 'gingham', c: '#d0202a', tile: 0.6 }, legs: { p: 'tee', c: '#2a2a2a' }, lash: true, face: 'F5' }),
  };
  // ---- crowd kit (Gneef extras: >=1 noob, afro, bun, moustache, elder; every extra a different hair) ----
  const CROWD = [
    { tier: 'A', skin: '#F5CD30', top: { c: '#1E6FE0' }, legs: { c: '#7ED321' }, hat: 'prop', face: 'F1' },
    { tier: 'A', skin: '#F5CD30', top: { c: '#E0101A' }, legs: { c: '#E0101A' }, hair: 'H2', hairC: '#F5D400', face: 'F6' },
    { skin: '#F4A878', hair: 'H7', hairC: '#3a2418', top: { p: 'tee', c: '#f4f2ee' }, legs: { p: 'tee', c: '#3a3a40' }, extras: [GN.suspenders('#151515')], face: 'F13' },
    { skin: '#7A3E26', hair: 'H6', hairC: '#1A1210', hairO: { beanie: '#3B5A8C' }, top: { p: 'tee', c: '#F2C94C' }, legs: { p: 'denim', c: '#3a4a6a' }, face: 'F5' },
    { skin: '#F0A0A0', hair: 'H14', hairC: '#E040A8', top: { p: 'fairisle', c: '#2a3a7a', a: '#f4ead8', b: '#E040A8', tile: 0.6 }, legs: { p: 'tee', c: '#2a2a2a' }, lash: true, face: 'F3' },
    { skin: '#F0A0A0', hair: 'H4', hairC: '#111111', top: { p: 'tee', c: '#1E6FE0' }, legs: { p: 'tee', c: '#1a2a5a' }, face: 'F11' },
    { skin: '#F5CD30', hair: 'H2', hairC: '#C1121F', top: { p: 'tee', c: '#FF8A1E' }, legs: { p: 'tee', c: '#2a2a2a' }, face: 'F14' },
    { skin: '#E89A84', hair: 'H3', hairC: '#E0141E', top: { p: 'gingham', c: '#d0202a', tile: 0.6 }, legs: { p: 'tee', c: '#C1121F' }, lash: true, face: 'F5', extras: [GN.apron('#f8f4ec', '#f8f4ec')] },
    { skin: '#F4A878', hat: 'H12', hatC: '#4A2A1E', stache: '#E8762A', stacheW: 1.15, top: { p: 'fairisle', c: '#5a3a28', a: '#f0d8a8', b: '#c0392b', tile: 0.6 }, legs: { p: 'denim', c: '#2e3e5e' }, face: 'F14', extras: [GN.vest('#FF6A00')] },
    { skin: '#F3D9C2', hair: 'H9', hairC: '#111111', top: { p: 'tee', c: '#4B3DA0' }, legs: { p: 'floral', c: '#1d2350', size: 5 }, lash: true, face: 'F10' },
    { skin: '#F4A878', hair: 'H5', hairC: '#E5E1DA', top: { p: 'plaid', c: '#3a6a3a', a: '#1a2a1a', b: '#e0c040' }, legs: { p: 'tee', c: '#4a4038' }, glasses: '#2a2a2a', face: 'F8' },
    { skin: '#F08A62', hair: 'H2', hairC: '#B9B9C0', top: { p: 'tee', c: '#A9A5AE' }, collar: '#ffffff', legs: { p: 'tee', c: '#0F7C73' }, sole: '#ffffff', face: 'F1' },
    { skin: '#F3D9C2', hair: 'H13', hairC: '#F5D547', hairO: { fox: true }, top: { p: 'tee', c: '#E86A9A' }, legs: { p: 'tee', c: '#f4f2ee' }, lash: true, face: 'F6' },
    { skin: '#F4A878', hair: 'H1', hairC: '#6a3a1e', top: { p: 'stripes', c: '#9ad0f0', a: '#ffffff' }, legs: { p: 'stripes', c: '#f6d0e0', a: '#b8e0f8', n: 10 }, face: 'F2' },
    { tier: 'A', skin: '#F5CD30', top: { c: '#2E9A3A' }, legs: { c: '#2D4FA0' }, hat: 'cap', hatC: '#E0101A', face: 'F7' },
    { skin: '#B9B4F0', hair: 'H6', hairC: '#3a1a10', top: { p: 'knit', c: '#d06a2a', tile: 1, bands: 2 }, legs: { p: 'tee', c: '#3a2a20' }, boxy: true, cuff: '#8a3a12', face: 'F12' },
  ];
  // other world: same kit, teal / cool palette shift
  const TEAL = ['#2FA3A0', '#1f8a84', '#7fd0c8', '#3a6aa0', '#e8f0ee', '#2a4a7a'];
  CAST.CROWD = CROWD;
  const crowdDef = (i, other) => { const b = JSON.parse(JSON.stringify(CROWD[i % CROWD.length])), src = CROWD[i % CROWD.length]; b.extras = src.extras; b.hairO = src.hairO;
    const faces = ['F1', 'F14', 'F5', 'F11', 'F2', 'F10', 'F6', 'F12', 'F3', 'F8']; if (i >= CROWD.length) b.face = faces[i % faces.length];
    if (other && b.top) b.top.c = TEAL[i % TEAL.length]; b.scale = (b.scale || 1) * (0.92 + ((i * 37) % 9) / 60); return () => GN.avatar(b); };
  const pool = {};
  CAST.get = (name) => { if (pool[name]) return pool[name]; let f = DEF[name];
    if (!f) { const m = /^(crowd|other)(\d+)$/.exec(name); if (m) f = crowdDef(+m[2], m[1] === 'other'); }
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
    hero: { calm: 'F1', ohno: 'F8', shock: 'F7', worry: 'F10', laugh: 'F5', strain: 'F14', scream: 'F12', smug: 'F3', sad: 'F9' },
    dad: { calm: 'F2', laugh: 'F5', grin: 'F6', sad: 'F9', worry: 'F10', shock: 'F7' },
    popstar: { grin: 'F6', laugh: 'F5', shock: 'F7', smug: 'F3' }, teacher: { worry: 'F10', ohno: 'F8', sad: 'F9', calm: 'F1' }, date: { laugh: 'F5', shock: 'F7', ohno: 'F8', grin: 'F6' },
    _crowd: { calm: 'F1', laugh: 'F5', shock: 'F7', worry: 'F10', rage: 'F11', terror: 'F13', strain: 'F14', grin: 'F6', scream: 'F12', smug: 'F3' },
  };
  const exprOf = (n) => CAST.EXPR[n] || CAST.EXPR._crowd;
  // face by mood name (or raw F-code), optional open-mouth talk frame
  CAST.face = (name, mood, talk = false) => { const a = CAST.get(name), f = exprOf(name)[mood] || mood; a.setFace(talk ? f + '-talk' : f); a.faceName = f; return f; };
  // keyed track: [[t, mood], ...] (t in seconds or shot fraction); talk = mouth flaps every 0.11 s while speaking
  CAST.faceAt = (name, track, t, speaking = false) => { let k = track[0][1]; for (const [tt, m] of track) if (t >= tt) k = m; return CAST.face(name, k, speaking && Math.floor(t / 0.11) % 2 === 0); };
  // background reactions: every non-lead actor swaps to another face of its own set every ~1.4-2.4 s (desynced), weighted to the shot mood
  CAST.react = (names, t, seed = 0, mood = null) => names.forEach((n) => { if (CAST.get(n).keepFace) return; const E = exprOf(n), keys = Object.keys(E); let h = 7; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) % 9973;
    const per = 1.4 + (h % 10) / 10, slot = Math.floor((t + (h % 7) * 0.3) / per), pick = mood && E[mood] && (slot + h) % 3 !== 0 ? mood : keys[(slot * 7 + h + seed * 3) % keys.length]; CAST.face(n, pick); });
  CAST.hideAll = () => Object.values(pool).forEach((a) => { a.root.visible = false; if (a.counter) a.counter.visible = false; });
  CAST.POSE = {
    walk: (ph = 0) => ({ armL: [Math.sin(ph) * 0.5, 0, 0], armR: [-Math.sin(ph) * 0.5, 0, 0], legL: [-Math.sin(ph) * 0.5, 0, 0], legR: [Math.sin(ph) * 0.5, 0, 0], _walk: ph }),
    sit: { legL: [-Math.PI / 2, 0, 0.05], legR: [-Math.PI / 2, 0, -0.05], armL: [-0.5, 0, 0.1], armR: [-0.5, 0, -0.1] },
    point: { armR: [-1.6, 0, 0] }, shout: { armR: [-2.6, 0, -0.7], head: [-0.15, 0, 0] }, handsHead: { armL: [-2.75, 0, -0.12], armR: [-2.75, 0, 0.12] },
    wave: { armR: [-2.7, 0, -0.45], head: [-0.1, 0, 0] }, waveL: { armL: [-2.7, 0, 0.45], head: [-0.1, 0, 0] },
    cheer: { armL: [-2.9, 0, 0.25], armR: [-2.9, 0, -0.25], head: [-0.2, 0, 0] }, lookUp: { head: [-0.45, 0, 0] },
    ringUp: { armL: [-2.75, 0, 0.35] }, waveUpR: { armR: [-2.75, 0, -0.95] },
    crossed: { armL: [-1.45, 0, -0.5], armR: [-1.35, 0, 0.5] }, open: { armL: [-0.6, 0, 0.6], armR: [-0.6, 0, -0.6] }, openT: { armR: [-1.0, 0, -0.5], head: [0, 0, 0.1] }, armsUp: { armL: [-2.6, 0, 0.3], armR: [-2.6, 0, -0.3] }, offer: { armR: [-1.2, 0, 0.1], armL: [-0.3, 0, 0.2] }, shrug: { armL: [-0.35, 0, 0.85], armR: [-0.35, 0, -0.85] }, hold: { armL: [-1.2, 0, -0.25], armR: [-1.2, 0, 0.25] },
  };
})();
