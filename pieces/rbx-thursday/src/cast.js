// rbx-thursday cast: lazily built R6 avatars, moved into whichever scene a shot uses.
'use strict';
const CAST = {};
(function () {
  const P = () => (typeof PROPS !== 'undefined' ? PROPS : null);
  const hair = (av, kind, color) => { const pr = P(); if (!pr || !pr.hair) return; try { const h = pr.hair(kind, color); if (h) av.head.add(h); } catch (e) { console.log('hair', kind, e.message); } };
  const onHead = (av, fn) => { const pr = P(); if (!pr || !pr[fn]) return null; const g = pr[fn](); av.head.add(g); return g; };
  const DEF = {
    hero: () => RBX.avatar({ hood: 'dino', face: 'neutral', headScale: 1.25 }),
    pip: () => { const a = RBX.avatar({ top: 'shirt', shirt: '#f29bb8', pants: '#7a5cc4', face: 'smile', headScale: 1.35, scale: 0.72, seed: 31 }); hair(a, 'pigtails', '#6b3a1e'); return a; },
    dad: () => { const a = RBX.avatar({ top: 'polo', shirt: '#3b6aa0', pants: '#4a4a52', face: 'determined', scale: 1.1, seed: 41 }); hair(a, 'short', '#4a2c18'); return a; },
    mom: () => { const a = RBX.avatar({ top: 'cardigan', shirt: '#c0504d', pants: '#2d3550', face: 'tired', scale: 1.06, seed: 51 }); hair(a, 'bob', '#7a4320'); return a; },
    grandma: () => { const a = RBX.avatar({ top: 'cardigan', shirt: '#8e6fb0', pants: '#5b5560', face: 'closed', skin: '#f1d2b6', seed: 61 }); hair(a, 'bun', '#d9d9de'); const pr = P(); if (pr && pr.glasses) a.head.add(pr.glasses()); return a; },
    mailman: () => { const a = RBX.avatar({ top: 'polo', shirt: '#2c5aa0', pants: '#1f3a68', face: 'neutral', seed: 71, patch: '#c8262c', patchText: 'MAIL' }); hair(a, 'undercap', '#3a2414'); onHead(a, 'mailCap'); const pr = P(); if (pr && pr.mailBag) { const b = pr.mailBag(); a.body.add(b); a.bag = b; } return a; },
    pizza: () => { const a = RBX.avatar({ top: 'polo', shirt: '#c8262c', pants: '#2f2f33', face: 'sniff', seed: 81, collar: '#ffffff' }); hair(a, 'undercap', '#1a1a1a'); onHead(a, 'pizzaCap'); return a; },
    ortega: () => { const a = RBX.avatar({ top: 'suit', shirt: '#3a3f4a', pants: '#2b2f38', face: 'neutral', seed: 91 }); onHead(a, 'cerealBox'); return a; },
    teacher: () => { const a = RBX.avatar({ top: 'cardigan', shirt: '#3e8a6e', pants: '#3a3340', face: 'neutral', scale: 1.08, seed: 101 }); hair(a, 'ponytail', '#2b1a10'); return a; },
  };
  const KIDS = [['#2f6fd1', '#2b2b30', 'spiky', '#f2c14e'], ['#3c9a4a', '#3a3a50', 'curly', '#2b1a10'], ['#e8b830', '#2b3a6b', 'short', '#8a4a20'], ['#9b59b6', '#333', 'ponytail', '#d9772b'],
    ['#e74c3c', '#2c3e50', 'cap', '#1f5fa8'], ['#1abc9c', '#444', 'bob', '#3a2010'], ['#f39c12', '#2b2b30', 'spiky', '#222'], ['#34495e', '#555', 'curly', '#c96b2b']];
  KIDS.forEach(([s, p, h, hc], i) => { DEF['kid' + i] = () => { const a = RBX.avatar({ top: 'shirt', shirt: s, pants: p, face: 'neutral', seed: 200 + i * 7 }); hair(a, h, hc); return a; }; });
  const NEIGH = [['polo', '#6d8a3a', '#3b3b3b', 'short', '#2a1a10'], ['cardigan', '#d07a9a', '#3a3550', 'bob', '#e0b050'], ['suit', '#5a4a3a', '#2b2b2b', 'short', '#777'], ['shirt', '#4a90c0', '#2b2b40', 'ponytail', '#5a3018'],
    ['polo', '#b05a2a', '#333', 'curly', '#1a1a1a'], ['shirt', '#8a8a3a', '#2a2a2a', 'spiky', '#a0522d']];
  NEIGH.forEach(([t, s, p, h, hc], i) => { DEF['n' + i] = () => { const a = RBX.avatar({ top: t, shirt: s, pants: p, face: 'neutral', seed: 300 + i * 7, scale: 1.05 }); hair(a, h, hc); return a; }; });
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
