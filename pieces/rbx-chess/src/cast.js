// rbx-chess cast: lazily built R6 avatars, moved into whichever scene a shot uses.
'use strict';
const CAST = {};
(function () {
  const P = () => (typeof PROPS !== 'undefined' ? PROPS : null);
  const hair = (av, kind, color) => { const pr = P(); if (!pr || !pr.hair) return; try { const h = pr.hair(kind, color); if (h) av.head.add(h); } catch (e) { console.log('hair', kind, e.message); } };
  const onHead = (av, fn) => { const pr = P(); if (!pr || !pr[fn]) return null; const g = pr[fn](); av.head.add(g); return g; };
  // cast of "Everyone Moves Like A Chess Piece": every citizen wears its piece (CHESS kit). side 'w' cream, 'b' ebony.
  const C = (k, side, o) => () => CHESS.citizen(k, side, o);
  const DEF = {
    hero: C('hero'), dad: C('dad'),
    aunt: C('bishop', 'w', { top: 'cardigan', shirt: '#efe4cf', collar: '#8e5fc0', hair: 'bob', hairC: '#7a4320', face: 'lashes', seed: 51 }),
    uncle: C('bishop', 'b', { top: 'suit', shirt: '#2e2a30', pants: '#1c1b1d', tie: '#5a3a8a', face: 'smile', seed: 61, scale: 1.08 }),
    queen: C('queen', 'w', { seed: 71 }), king: C('king', 'w', { seed: 81 }), baker: C('baker', 'w', { seed: 91 }),
    rook: C('taxi', 'b', { seed: 101 }), rook2: C('taxi', 'w', { seed: 111 }),
  };
  const PAWNS = [['w', 'shirt', '#e9dfc8', '#8a7a62', 'short', '#4a2c18'], ['b', 'shirt', '#3a3532', '#1d1b1c', 'ponytail', '#2a1a10'], ['w', 'polo', '#efe6d2', '#5a5048', 'curly', '#2b1a10'], ['b', 'cardigan', '#2c2a30', '#1a1a1c', 'bob', '#c96b2b'],
    ['w', 'cardigan', '#f0e2c4', '#7a6a58', 'bun', '#d9d9de'], ['b', 'polo', '#36302c', '#222', 'spiky', '#a0522d'], ['w', 'shirt', '#e4d8bc', '#6a5a48', 'pigtails', '#6b3a1e'], ['b', 'shirt', '#302c2a', '#1b1b1b', 'short', '#777']];
  PAWNS.forEach(([sd, top, s, p, h, hc], i) => { DEF['pawn' + i] = C('pawn', sd, { top, shirt: s, pants: p, hair: h, hairC: hc, seed: 200 + i * 7, face: i % 3 ? 'neutral' : 'smile' }); });
  const pool = {};
  CAST.names = () => Object.keys(DEF);
  CAST.get = (name) => (pool[name] = pool[name] || DEF[name]());
  CAST.used = new Set(); CAST.order = [];   // order: names put in the current shot (ENG.render resets it)
  // put an actor in a scene. o: { p:[x,y,z] | mark, ry, pose:{...}, face, sit }
  CAST.put = function (scene, name, o = {}) {
    const a = CAST.get(name); if (a.root.parent !== scene) scene.add(a.root); a.root.visible = true; CAST.used.add(name); CAST.order.push(name);
    a.root.position.set(...(o.p || [0, 0, 0])); a.root.rotation.set(0, o.ry || 0, 0);
    const pose = Object.assign({}, o.sit ? { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0] } : {}, o.pose || {});
    a.stagePose = pose; a.pose(pose); a.setFace(o.face || 'neutral'); return a;
  };
  CAST.hideAll = () => Object.values(pool).forEach((a) => { a.root.visible = false; });
  // poses (radians): x<0 raises an arm forward; head x>0 looks down
  CAST.POSE = {
    walk: (ph = 0) => { const p = { armL: [Math.sin(ph) * 0.5, 0, 0], armR: [-Math.sin(ph) * 0.5, 0, 0], legL: [-Math.sin(ph) * 0.5, 0, 0], legR: [Math.sin(ph) * 0.5, 0, 0] };
      if (typeof ENG !== 'undefined' && ENG.MODE === 'gb') p._walk = ph; return p; },   // gb: marked so ENG replaces it with a timed walk cycle
    headDown: (ph = 0) => Object.assign(CAST.POSE.walk(ph), { head: [0.5, 0, 0] }),
    lookUp: { head: [-0.5, 0, 0], armL: [0, 0, 0.1], armR: [0, 0, -0.1] },
    hammer: (k = 1) => ({ armR: [-2.4 * k, 0, 0.1], armL: [-1.3, 0, -0.2], head: [-0.15, 0, 0] }),
    reach: { armL: [-1.5, 0, 0], armR: [-1.5, 0, 0] },
    hold: { armL: [-1.2, 0, -0.25], armR: [-1.2, 0, 0.25] },
    scared: { armL: [-0.6, 0, 0.3], armR: [-0.6, 0, -0.3], head: [-0.1, 0, 0] },
    headOnDesk: { legL: [-Math.PI / 2, 0, 0], legR: [-Math.PI / 2, 0, 0], body: [0.6, 0, 0], head: [0.5, 0, 0], armL: [-1.9, 0, -0.2], armR: [-1.9, 0, 0.2] },
    cheer: { armL: [-2.9, 0, 0.2], armR: [-2.9, 0, -0.2], head: [-0.25, 0, 0] },
    climb: { armL: [-2.6, 0, 0], armR: [-1.6, 0, 0], legL: [-1.2, 0, 0], legR: [0.2, 0, 0] },
    facepalm: { armR: [-2.2, 0, 0.6], head: [0.2, 0, 0] },
    wave: { armR: [-2.6, 0, -0.5], head: [-0.2, 0, 0] },
    // GreenBro gesture library (MODE 'gb'): held poses the focus actor snaps into on word beats
    open: { armL: [-0.15, 0, 0.6], armR: [-0.15, 0, -0.6] },
    openT: { armL: [-0.1, 0, 1.3], armR: [-0.1, 0, -1.3] },
    armsUp: { armL: [-2.8, 0, 0.35], armR: [-2.8, 0, -0.35], head: [-0.12, 0, 0] },
    waveL: { armL: [-2.6, 0, 0.5], head: [-0.1, 0, 0] },
    point: { armR: [-1.55, 0, 0], head: [-0.05, 0, 0] },
    offer: { armR: [-1.35, 0, 0.12], armL: [-0.1, 0, 0.12] },
    handsHead: { armL: [-2.75, 0, -0.12], armR: [-2.75, 0, 0.12], head: [0.08, 0, 0] },
    shrug: { armL: [-0.35, 0, 0.85], armR: [-0.35, 0, -0.85], head: [0, 0, 0.15] },
    crossed: { armL: [-1.45, 0, -0.5], armR: [-1.35, 0, 0.5] },
  };
})();
