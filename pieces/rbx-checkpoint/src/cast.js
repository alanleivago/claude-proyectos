// rbx-checkpoint cast (from rbx-rope): Gneef-style avatars (GN kit). Named cast + gag people + a crowd kit; lazily built, moved into any scene.
'use strict';
const CAST = {};
(function () {
  const A = (o) => () => GN.avatar(o);
  const knit = (c, o = {}) => Object.assign({ p: 'knit', c, tile: 1, bands: 2, bump: 5, nscale: 1 }, o);
  // ---- named cast (checklist: one dominant hue each, smooth vs spiky pairs, >=1 hair over 1.5x; distinct from rbx-rope's hero/girl/Oona) ----
  const DEF = {}; Object.assign(DEF, {
    // hero: floor-is-lava champion who trips a lot. Mono lava-orange (spike-fan hair with yellow tips + orange-tan skin + wristband)
    // on Gneef's "Roblox default fit" (heather crumpled tee, teal track pants w/ white stripe, chunky white soles) + knee plasters
    hero: A({ skin: '#F08A62', hair: 'lava', hairC: '#B8140A', hairO: { tip: '#E8400C' }, top: { p: 'tee', c: '#A9A5AE' }, collar: '#f4f2ee', legs: { p: 'tee', c: '#0F7C73' },
      shoes: '#f8f8f4', sole: '#f05a28', face: 'F1', scale: 0.9, headScale: 1.1, extras: [GN.legStripe('#f4f4f0'), GN.plasters(), GN.wristband('#f05a28', 'L')] }),
    turbo: () => DOG.make({ fur: '#e0a050', cream: '#f8e6c4', ear: '#9a5426', patch: '#b8702e', collar: '#e8202a', tag: '#1f4fd8', scale: 1 }),
    // the Flagman: big, mono-red marching uniform, gold braid + epaulettes, white crossbelt, whistle, shako + plume, ginger tufts, huge handlebar
    flagman: A({ skin: '#F3D9C2', hair: 'H15', hairC: '#C8561E', hairO: { stache: false }, hat: 'shako', hatC: '#1a1a2a', stache: '#C8561E', stacheW: 1.55, stacheStyle: 'handlebar',
      top: { p: 'tee', c: '#c81e2a' }, cuff: '#e8b830', legs: { p: 'tee', c: '#1a1f3a' }, gloves: '#f6f6f2', shoes: '#141414', sole: '#141414', face: 'F3', scale: 1.12,
      extras: [GN.belly('#c81e2a'), GN.bandJacket('#e8b830', GN.BELLY), GN.flagBelt(0.62), GN.whistle('#e8b830'), GN.legStripe('#e8b830')] }),
    // firemen: tan bunker coat + yellow/silver bands, red helmet, walrus moustache / yellow helmet, red long hair
    fire1: A({ skin: '#A0603A', hat: 'fire', hatC: '#c81e1e', stache: '#1a1210', stacheW: 1.25, stacheStyle: 'walrus', top: { p: 'tee', c: '#c89a3a' }, boxy: true, legs: { p: 'tee', c: '#c89a3a' },
      gloves: '#2a2a2a', shoes: '#1a1a1a', sole: '#1a1a1a', face: 'F1', scale: 1.06, extras: [GN.bunker()] }),
    fire2: A({ skin: '#F4A878', hair: 'H13', hairC: '#B3121A', hat: 'fire', hatC: '#f2c01a', top: { p: 'tee', c: '#2a2e3a' }, boxy: true, legs: { p: 'tee', c: '#2a2e3a' },
      gloves: '#2a2a2a', shoes: '#1a1a1a', sole: '#1a1a1a', lash: true, face: 'F5', extras: [GN.bunker('#f2e030', '#d8dce0')] }),
    // rich guy: white glossy pompadour, sleep mask up, burgundy silk pinstripe pyjamas with gold piping, gold chain, monocle, white chevron moustache
    rich: A({ skin: '#F4A878', hair: 'H7', hairC: '#F4F4F4', hat: 'mask', hatC: '#2a1030', stache: '#F4F4F4', stacheW: 0.9, stacheStyle: 'chevron', top: { p: 'pinstripe', c: '#6a1a3a' }, collar: '#e8b830', cuff: '#e8b830',
      legs: { p: 'pinstripe', c: '#6a1a3a' }, shoes: '#2a1030', sole: '#e8b830', face: 'F2', extras: [GN.chain(), GN.monocle()] }),
    // water park kids: pink pigtails + striped swimsuit + duck ring + goggles / blue emo hair, shirtless, hawaiian trunks, floaties
    swim1: A({ skin: '#F0A0A0', hair: 'H8', hairC: '#E040A8', hairO: { bobble: '#18b8d8' }, top: { p: 'stripes', c: '#18b8d8', a: '#ffffff', n: 6 }, sleeve: 'none', legs: { p: 'tee', c: '#F0A0A0' },
      shoes: '#f6d020', sole: '#f08020', lash: true, face: 'F5', scale: 0.72, headScale: 1.15, extras: [GN.swimRing('#f6d020'), GN.goggles('#20c0e0')] }),
    swim2: A({ skin: '#E8893A', hair: 'H4', hairC: '#1E6FE0', hairO: { under: '#0a2a6a' }, top: { p: 'tee', c: '#E8893A' }, sleeve: 'none', legs: { p: 'floral', c: '#f05a28', flowers: ['#ffffff', '#f6d020', '#18b8d8'], size: 9 },
      shoes: '#18b8d8', sole: '#ffffff', face: 'F6', scale: 0.74, headScale: 1.15, extras: [GN.floaties('#f05a28'), GN.goggles('#f6d020')] }),
    // math teacher: lavender porcelain skin, black bob + yellow headband, thick glasses, white blouse + mustard cardigan, plaid skirt
    teacher: A({ skin: '#B9B4F0', hair: 'H9', hairC: '#111111', hairO: { band: '#f2c01a' }, glasses: '#141414', top: { p: 'tee', c: '#f6f4ee' }, legs: { p: 'plaid', c: '#3a2a6a', a: '#1a1030', b: '#e8b030' },
      shoes: '#3a1a1a', sole: '#141414', lash: true, face: 'F3', extras: [GN.cardigan('#d89a20'), GN.skirt('#3a2a6a', 'plaid', { a: '#1a1030', b: '#e8b030' })] }),
    // school kids: tier-A noob with propeller beanie + backpack / orange space buns, navy blazer + red tie
    kidA: A({ tier: 'A', skin: '#F5CD30', top: { c: '#E0101A' }, legs: { c: '#1E6FE0' }, hat: 'prop', face: 'F7', scale: 0.74, headScale: 1.12, extras: [GN.backpack('#38c060')] }),
    kidB: A({ skin: '#F4A878', hair: 'H3', hairC: '#E8620F', hairO: { bobble: '#E0101A' }, top: { p: 'tee', c: '#1c2f7a' }, legs: { p: 'tee', c: '#4a4a52' }, lash: true, face: 'F2', scale: 0.74, headScale: 1.12,
      extras: [GN.tie('#C1121F', '#ffffff'), GN.backpack('#f07ad0')] }),
    // tuba player: navy band uniform + gold braid, white trousers, band cap squashed on a huge afro, tuba
    tuba: A({ skin: '#E89A84', hair: 'H6', hairC: '#1A1210', hat: 'bandcap', hatC: '#1c2f7a', top: { p: 'tee', c: '#1c2f7a' }, cuff: '#e8b830', legs: { p: 'tee', c: '#f4f2ee' }, gloves: '#f6f6f2',
      shoes: '#141414', sole: '#141414', face: 'F14', scale: 1.0, extras: [GN.bandJacket(), GN.crossbelt('#f6f4ee'), GN.tuba()] }),
    // the guy who reaches the top: tier-A noob, red cap, lime tee, WINNER plate
    topguy: A({ tier: 'A', skin: '#F5CD30', top: { c: '#7ED321' }, legs: { c: '#2D4FA0' }, hat: 'cap', hatC: '#E0101A', face: 'F6', extras: [GN.plate('#1', '#f2c94c', '#141414', 0.9, 0.6, 0.3)] }),
  });
  DEF.hero4 = A({ skin: '#F08A62', hair: 'lava', hairC: '#B8140A', hairO: { tip: '#E8400C' }, top: { p: 'tee', c: '#f2c01a' }, collar: '#f4f2ee', legs: { p: 'tee', c: '#0F7C73' }, shoes: '#f8f8f4', sole: '#f05a28', face: 'F5', scale: 0.55, headScale: 1.35 });

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
    hero4: { laugh: 'F5', calm: 'F1', grin: 'F6', shock: 'F7' },
    hero: { calm: 'F1', ohno: 'F8', shock: 'F7', worry: 'F10', laugh: 'F5', strain: 'F14', scream: 'F12', smug: 'F3', sad: 'F9', grin: 'F6' },
    turbo: { calm: 'calm', happy: 'happy', shock: 'shock', sad: 'sad', bark: 'bark', dizzy: 'dizzy', sleepy: 'sleepy' },
    flagman: { calm: 'F1', proud: 'F3', shout: 'F11', laugh: 'F5', terror: 'F13', shock: 'F7', strain: 'F14', sad: 'F9', grin: 'F6' },
    fire1: { calm: 'F1', strain: 'F14', shock: 'F7', worry: 'F10', shout: 'F11', laugh: 'F5' }, fire2: { calm: 'F2', laugh: 'F5', strain: 'F14', shock: 'F7', worry: 'F10', terror: 'F13' },
    rich: { calm: 'F2', smug: 'F3', shock: 'F7', terror: 'F13', laugh: 'F6', sad: 'F9' }, teacher: { strict: 'F3', rage: 'F11', shock: 'F7', calm: 'F1', laugh: 'F5' },
    swim1: { laugh: 'F5', grin: 'F6', scream: 'F12', shock: 'F7', calm: 'F2' }, swim2: { grin: 'F6', laugh: 'F5', scream: 'F12', smug: 'F3', ohno: 'F8' },
    kidA: { shock: 'F7', ohno: 'F8', laugh: 'F5', calm: 'F1', sad: 'F9' }, kidB: { calm: 'F2', grin: 'F6', worry: 'F10', laugh: 'F5', shock: 'F7' },
    tuba: { strain: 'F14', calm: 'F1', laugh: 'F5', shock: 'F7', terror: 'F13' }, topguy: { grin: 'F6', laugh: 'F5', ohno: 'F8', scream: 'F12', calm: 'F1' },
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
