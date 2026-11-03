// =====================================================================
//  CAST — office people of 2001 (toon): shirts and ties, blouses and skirts, suits; Diego (light-blue shirt,
//  red tie, brown hair, glasses); props they hold (phone, papers, briefcase); a few pose presets.
// =====================================================================
const OFF_SHIRT = ['#f4f2ec', '#f4f2ec', '#dfe8f2', '#e9e2cf', '#f4f2ec', '#cfd9e6'], OFF_TIE = ['#a8262a', '#1f3a6a', '#3a2a4a', '#6a1f2a', '#2a4a3a', '#b8862a'];
const OFF_SUIT = ['#26303e', '#3a3a40', '#4a4036', '#1e2430', '#5a5a60'], OFF_PANTS = ['#26282e', '#33302c', '#3a3a40', '#4a4438', '#2a3040'];
const OFF_BLOUSE = ['#b8322e', '#2f5f9a', '#f2efe6', '#6a4a8a', '#2a8a7a', '#d8b26a', '#e8a0b0'], OFF_SKIRT = ['#26282e', '#3a3040', '#2a3448', '#5a4a3a'];
// a tie on the chest (spine group): knot + blade
function addTie(P, col) { const m = STDm({ color: col, roughness: 0.6 }), sh = new THREE.Shape(); sh.moveTo(-0.022, 0); sh.lineTo(0.022, 0); sh.lineTo(0.036, -0.30); sh.lineTo(0, -0.345); sh.lineTo(-0.036, -0.30); sh.closePath();
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.008, bevelEnabled: false }), m); blade.position.set(0, 0.455, 0.112); blade.rotation.x = -0.12; blade.castShadow = true; P.spine.add(blade);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8).scale(1, 0.9, 0.7), m); knot.position.set(0, 0.47, 0.098); P.spine.add(knot);
  const col2 = STDm({ color: '#f8f6f0', roughness: 0.7 }); [-1, 1].forEach((s) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.012), col2); c.position.set(s * 0.035, 0.49, 0.085); c.rotation.set(-0.3, 0, s * 0.5); P.spine.add(c); }); }
// a jacket's open front (two lapel panels over the shirt) for suits
function addLapels(P, col) { const m = STDm({ color: col, roughness: 0.85 }); [-1, 1].forEach((s) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.36, 0.014), m); l.position.set(s * 0.085, 0.3, 0.115); l.rotation.set(-0.05, 0, s * -0.22); l.castShadow = true; P.spine.add(l); }); }
// a belt at the waist so shirts read tucked in
function addBelt(P) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.035, 24).scale(1, 1, 0.76), TOON({ color: '#1c1a18', roughness: 0.5 })); b.position.set(0, -0.012, 0); P.hips.add(b); }
function officeMan(R, o = {}) { const suit = o.suit ?? (R.f() < 0.35 ? R.pick(OFF_SUIT) : null), shirt = o.shirt || R.pick(OFF_SHIRT);
  const P = makePerson(Object.assign({ skin: R.pick(SKINS), hair: R.pick(['#2a1d16', '#3a2618', '#4a3020', '#1a1a1a', '#5a4030', '#6e665e']), hairStyle: R.pick(['short', 'short', 'short', 'curly', 'none']), top: suit || shirt, bottom: suit || R.pick(OFF_PANTS), sleeve: 'long', seed: Math.floor(R.f() * 900), height: R.r(0.97, 1.06) }, o));
  if (o.tie !== false && (suit || R.f() < 0.75)) addTie(P, o.tie || R.pick(OFF_TIE)); if (suit) addLapels(P, suit); else addBelt(P); toonify(P.root); return P; }
function officeWoman(R, o = {}) { const sk = o.skirt !== undefined ? o.skirt : (R.f() < 0.7 ? R.pick(OFF_SKIRT) : null); const P = makePerson(Object.assign({ female: true, skin: R.pick(SKINS), hair: R.pick(['#2a1d16', '#3a2618', '#4a3020', '#1a1a1a', '#6a4a30', '#8a6a48']), hairStyle: R.pick(['bob', 'long', 'bun', 'pony', 'curly']), top: R.pick(OFF_BLOUSE), bottom: sk || '#2a2a30', skirt: sk, sleeve: R.f() < 0.7 ? 'long' : 'short', seed: Math.floor(R.f() * 900), height: R.r(0.92, 1.0) }, o));
  toonify(P.root); return P; }
function makeDiego() { const P = makePerson({ skin: '#d9a47c', hair: '#5a3a22', hairStyle: 'short', part: -1, top: '#b6d0ec', bottom: '#262a34', sleeve: 'long', seed: 77, iris: '#2a1a10' }); addTie(P, '#b0202a'); addBelt(P); toonify(P.root); return P; }
// props held in a hand group
function propPhone(P, side = 1) { const A = P.arms[side > 0 ? 1 : 0], m = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.1, 0.02), TOON({ color: '#2a2c30' })); m.position.set(0, -0.09, 0.02); A.hand.add(m); return m; }
function propPapers(P, side = -1) { const A = P.arms[side > 0 ? 1 : 0], m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.012, 0.3), TOON({ color: '#f4f2ea' })); m.position.set(0, -0.1, 0.06); m.rotation.x = 1.3; A.hand.add(m); return m; }
// pose presets (posePerson q fragments)
const POSE = {
  idle: (ph) => ({ armL: [0.05, 0.1, 0.25 + 0.05 * Math.sin(TT * 0.8 + ph)], armR: [0.08, 0.1, 0.3] }),
  phone: () => ({ armR: [0.55, 0.32, 2.45, 0.4], headRoll: 0.12, headYaw: 0.15 }),
  arms: () => ({ armL: [0.5, 0.35, 1.6, 0.2], armR: [0.5, 0.35, 1.6, 0.2] }),           // arms crossed-ish
  point: () => ({ armR: [2.55, 0.32, 0.25, 0.0] }),                                     // pointing up
  headHold: () => ({ armL: [2.4, 0.9, 2.2], armR: [2.4, 0.9, 2.2] }),                   // hands to the head
};
function pointFinger(P, side = 1, k = 1) { const A = P.arms[side > 0 ? 1 : 0]; if (!A.fingers) return; A.fingers.forEach((f, i) => (f.rotation.x = i === 0 ? lerp(0.45, 0.0, k) : lerp(0.45 + 0.1 * i, 2.0, k))); if (A.thumbG) A.thumbG.rotation.x = lerp(0.4, 1.3, k); }
