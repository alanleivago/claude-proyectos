// =====================================================================
//  SET hunt — the Cornish beach later in the day and at dusk, plus the oceanographer's study: s25 s26 s30 s31 s32 s33.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed hnt.
//  One beach world, built once, in two moods (hntMode: 'day' / 'dusk'): the sea at the back (-z, shoreline z -16) with
//  rolling foam, glossy wet sand, the wrack line (z ~ -2) full of seaweed and Lego, beach huts under the right-hand
//  cliff, a lighthouse on the far left headland. The study (s30) is a second small world (hntLab).
//  People are c3Person billboards at HNT_K x; a standing person's root sits at HNT_FOOT.
// =====================================================================
const HNT = {};
const HNT_K = 1.35, HNT_FOOT = 2.55 * HNT_K;
const hntW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const hntV = (x, y, z) => new THREE.Vector3(x, y, z);
const hntSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function hntCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = hntSpan(id), dur = b - a;
  const P = hntV(...c.p), L = hntV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(hntV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const hntRack = (lt, id, a, b) => { const [t0, t1] = hntSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function hntFg(s, list, K, id, lt, o = {}) {
  const c = HNT.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 900);
  c3SetCam(c, hntCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = hntV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(hntV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const hntRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#9cc8e8', bgBlur: 2.4, nearBlur: 10, glow: 0.6, glowBlur: 16, bloom: 0.16 }, o));

// ---- textures
function hntTexSand() {
  const t = tex((x, w, h) => { x.fillStyle = '#e2bf88'; x.fillRect(0, 0, w, h); const R = RNG('sand');
    for (let i = 0; i < 2600; i++) { const l = R.r(-14, 12); x.fillStyle = `hsla(36,${40 + R.r(-8, 8)}%,${68 + l}%,0.55)`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
    x.strokeStyle = 'rgba(150,104,56,0.22)'; x.lineWidth = 5;   // wind ripples
    for (let j = 0; j < 14; j++) { const y = (j + 0.5) * h / 14; x.beginPath(); x.moveTo(0, y); for (let k = 1; k <= 8; k++) x.quadraticCurveTo((k - 0.5) * w / 8, y + R.n(10), k * w / 8, y + R.n(6)); x.stroke(); }
    x.fillStyle = 'rgba(255,248,232,0.7)'; for (let i = 0; i < 26; i++) { x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(3, 7), R.r(2, 4), R.r(0, 3), 0, TAU); x.fill(); }   // shell bits
  }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(26, 13); return t;
}
function hntTexWet() {   // the wet band: dark glossy at the sea, fading out toward the dry sand, with swash lines
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(120,88,58,1)'); g.addColorStop(0.55, 'rgba(150,112,72,0.85)'); g.addColorStop(1, 'rgba(170,130,84,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); const R = RNG('swash'); x.strokeStyle = 'rgba(255,250,240,0.35)'; x.lineWidth = 3;
    for (let j = 0; j < 7; j++) { const y = h * (0.1 + j * 0.11); x.beginPath(); x.moveTo(0, y); for (let k = 1; k <= 12; k++) x.quadraticCurveTo((k - 0.5) * w / 12, y + R.n(18), k * w / 12, y + R.n(10)); x.stroke(); } }, 1024, 256);
}
function hntTexSea() {
  const t = tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); const R = RNG('seaT'); x.strokeStyle = 'rgba(210,236,240,0.9)'; x.lineCap = 'round';
    for (let i = 0; i < 70; i++) { const y = R.r(0, h), xx = R.r(0, w), l = R.r(20, 70); x.lineWidth = R.r(2, 5); x.beginPath(); x.moveTo(xx, y); x.quadraticCurveTo(xx + l / 2, y - R.r(3, 7), xx + l, y); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 16); return t;
}
function hntTexFoam() {
  return tex((x, w, h) => { x.clearRect(0, 0, w, h); const R = RNG('foam');
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.45, 'rgba(255,255,255,0.95)'); g.addColorStop(0.6, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 320; i++) { x.beginPath(); x.arc(R.r(0, w), R.r(h * 0.3, h * 0.8), R.r(3, 11), 0, TAU); x.fillStyle = `rgba(0,0,0,${R.r(0.3, 0.9)})`; x.fill(); } }, 1024, 64);
}
function hntTexSky(mode) {   // the camera only ever sees ~26 deg of it, around the horizon (v .36-.5): clouds and sun are drawn small
  return c3Tex((x, w, h) => {
    const day = mode === 'day', g = x.createLinearGradient(0, 0, 0, h * 0.5);
    if (day) { g.addColorStop(0, '#2a6ac8'); g.addColorStop(0.7, '#4a94dc'); g.addColorStop(0.92, '#9ccbee'); g.addColorStop(1, '#dcecf4'); }
    else { g.addColorStop(0, '#141a4a'); g.addColorStop(0.72, '#4a3a8a'); g.addColorStop(0.86, '#b85a8a'); g.addColorStop(0.95, '#ff8a5a'); g.addColorStop(1, '#ffc070'); }
    x.fillStyle = g; x.fillRect(0, 0, w, h * 0.5); x.fillStyle = day ? '#dcecf4' : '#ffc070'; x.fillRect(0, h * 0.5, w, h * 0.5);
    const su = w * 0.735, sv = day ? h * 0.36 : h * 0.493, sr = day ? 26 : 34;
    const sg = x.createRadialGradient(su, sv, 0, su, sv, sr * 6); sg.addColorStop(0, day ? 'rgba(255,255,240,0.9)' : 'rgba(255,230,170,0.95)'); sg.addColorStop(1, 'rgba(255,220,160,0)');
    x.fillStyle = sg; x.fillRect(su - sr * 6, sv - sr * 6, sr * 12, sr * 12);
    x.fillStyle = day ? '#fffbe8' : '#ffe8a0'; x.beginPath(); x.arc(su, sv, sr, 0, TAU); x.fill();
    const R = RNG('cloud', mode);
    for (let i = 0; i < 70; i++) {   // little puffy clouds near the horizon: round puffs, lit tops, soft shaded bottoms
      const cx = R.r(0, w), cy = R.r(h * 0.37, h * 0.485), sc = 0.5 + (cy / h - 0.37) * 4, n = R.i(4, 7), s = R.r(5, 11) * (1.6 - sc * 0.5);
      for (const pass of [0, 1]) for (let k = 0; k < n; k++) { const R2 = RNG('puff', mode, i, k), px = cx + (k - n / 2) * s * 0.95 + R2.n(s * 0.3), py = cy - Math.sin(k / (n - 1) * Math.PI) * s * 0.8 + R2.n(s * 0.15), r = s * R2.r(0.7, 1.15);
        x.beginPath(); x.arc(px, py + (pass ? 0 : r * 0.3), r, 0, TAU);
        x.fillStyle = day ? (pass ? '#ffffff' : '#b8cce8') : (pass ? (cy > h * 0.46 ? '#ffb88a' : '#e88aa8') : '#4a3a7a'); x.fill(); }
    }
  }, 4096, 2048);
}
function hntTexLighthouse() {
  return tex((x, w, h) => { for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#d8322a' : '#f6f2ea'; x.fillRect(0, i * h / 6, w, h / 6); } }, 64, 256);
}
function hntTexHut(c) {
  return tex((x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); for (let i = 0; i < 10; i++) { x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(i * w / 10, 0, 3, h); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(i * w / 10 + 4, 0, 3, h); }
    x.fillStyle = '#f6f2ea'; x.fillRect(w * 0.3, h * 0.25, w * 0.4, h * 0.75); x.fillStyle = c; x.fillRect(w * 0.34, h * 0.3, w * 0.32, h * 0.7); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(w * 0.49, h * 0.3, 3, h * 0.7);
    x.fillStyle = '#d8b040'; x.beginPath(); x.arc(w * 0.6, h * 0.65, 6, 0, TAU); x.fill(); }, 256, 256);
}
function hntTexFoot() {   // a pair of shoe prints in damp sand (multiplied)
  return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(110,70,36,0.45)';
    for (const [px, py, a] of [[w * 0.32, h * 0.3, -0.1], [w * 0.68, h * 0.72, 0.1]]) { x.save(); x.translate(px, py); x.rotate(a); x.beginPath(); x.ellipse(0, -h * 0.08, w * 0.11, h * 0.13, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(0, h * 0.12, w * 0.09, h * 0.08, 0, 0, TAU); x.fill(); x.restore(); } }, 128, 256);
}
function hntTexPaw() {
  return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(110,70,36,0.5)'; x.beginPath(); x.ellipse(w / 2, h * 0.62, w * 0.2, h * 0.17, 0, 0, TAU); x.fill();
    for (const [px, py] of [[0.28, 0.36], [0.42, 0.26], [0.58, 0.26], [0.72, 0.36]]) { x.beginPath(); x.arc(w * px, h * py, w * 0.08, 0, TAU); x.fill(); } }, 64, 64);
}
// the black-dragon tally board (s32): a hand-painted plank, tally marks that grow; a COMMON stamp lands inside it
function hntTallyDraw(s, n, stamp) {
  const x = s.tallyCv.getContext('2d'), w = s.tallyCv.width, h = s.tallyCv.height;
  x.fillStyle = '#e8d2a2'; x.fillRect(0, 0, w, h); const R = RNG('tallyw');
  x.strokeStyle = 'rgba(120,80,40,0.35)'; x.lineWidth = 3; for (let i = 0; i < 18; i++) { const y = R.r(0, h); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(14), w * 2 / 3, y + R.n(14), w, y + R.n(8)); x.stroke(); }
  inked(x, 'BLACK DRAGONS', w / 2, h * 0.15, h * 0.12, '#1a1a22', { stroke: false, maxW: w * 0.86 });
  x.strokeStyle = '#1a1a22'; x.lineWidth = 9; x.lineCap = 'round';
  for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), k = i % 5, row = Math.floor(grp / 6), col = grp % 6, gx = w * 0.07 + col * w * 0.148, gy = h * 0.33 + row * h * 0.2;
    const Rr = RNG('tally', i); x.beginPath();
    if (k < 4) { x.moveTo(gx + k * w * 0.026 + Rr.n(3), gy); x.lineTo(gx + k * w * 0.026 + Rr.n(3), gy + h * 0.14); }
    else { x.moveTo(gx - w * 0.01, gy + h * 0.12); x.lineTo(gx + w * 0.095, gy + h * 0.02); }
    x.stroke(); }
  if (stamp > 0) { x.save(); x.translate(w * 0.3, h * 0.8); x.rotate(-0.12); const sc = 1 + 0.6 * (1 - EZ.o3(stamp)); x.scale(sc, sc); x.globalAlpha = clamp(stamp * 3);
    x.strokeStyle = '#c8281e'; x.lineWidth = 9; x.strokeRect(-w * 0.2, -h * 0.075, w * 0.4, h * 0.15); inked(x, 'COMMON', 0, 0, h * 0.11, '#c8281e', { stroke: false, maxW: w * 0.36 }); x.restore(); }
  s.tallyTex.needsUpdate = true;
}
// the beach lottery board (s33): marquee bulbs, three slot windows that spin and land on green dragons, JACKPOT
function hntDragonIcon(x, cx, cy, s, col) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = col; x.strokeStyle = '#1a1a22'; x.lineWidth = 5; x.lineJoin = 'round';
  x.beginPath(); x.ellipse(0, 18, 34, 22, 0, 0, TAU); x.fill(); x.stroke();   // body
  x.beginPath(); x.moveTo(-6, 0); x.quadraticCurveTo(-30, -60, -52, -52); x.lineTo(-40, -36); x.lineTo(-50, -26); x.quadraticCurveTo(-24, -10, -6, 0); x.fill(); x.stroke();   // wing
  x.beginPath(); x.ellipse(36, -16, 20, 15, 0.3, 0, TAU); x.fill(); x.stroke();   // head
  x.beginPath(); x.moveTo(-30, 26); x.quadraticCurveTo(-60, 30, -62, 0); x.lineWidth = 12; x.stroke(); x.strokeStyle = col; x.lineWidth = 6; x.stroke();   // tail
  x.fillStyle = '#ffe24a'; x.beginPath(); x.arc(42, -20, 4, 0, TAU); x.fill(); x.restore();
}
function hntLottoDraw(s, spin, win, t) {
  const x = s.lotCv.getContext('2d'), w = s.lotCv.width, h = s.lotCv.height;
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a1a8a'); g.addColorStop(1, '#2a0a4a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  inked(x, 'BEACH LOTTO', w / 2, h * 0.14, h * 0.13, '#ffd23c', { stroke: '#3a0a10', sw: h * 0.02, maxW: w * 0.84 });
  const icons = ['#1c1d24', '#d8322a', '#f2c230', '#2a6ad8', '#3ee060'];
  for (let k = 0; k < 3; k++) {
    const sx = w * (0.2 + k * 0.3), sy = h * 0.5, sw = w * 0.24, sh = h * 0.36;
    x.fillStyle = '#fbf6ea'; x.beginPath(); x.roundRect(sx - sw / 2, sy - sh / 2, sw, sh, 18); x.fill(); x.lineWidth = 8; x.strokeStyle = '#ffd23c'; x.stroke();
    x.save(); x.beginPath(); x.rect(sx - sw / 2 + 6, sy - sh / 2 + 6, sw - 12, sh - 12); x.clip();
    const stop = clamp((win - k * 0.12) * 4);   // the windows land left to right
    if (spin > 0 && stop < 1) { const off = mod(t * 9 + k * 0.37, 1); for (let j = -1; j < 2; j++) hntDragonIcon(x, sx, sy + (j + off) * sh * 0.9, 1.3, icons[(Math.floor(t * 9 + k) + j + 9) % 4]); }
    else hntDragonIcon(x, sx, sy, 1.5, spin > 0 ? '#22c048' : '#1c1d24');
    x.restore();
  }
  const jp = clamp(win * 3 - 1);
  if (jp > 0) { x.save(); x.globalAlpha = jp; inked(x, 'JACKPOT', w / 2, h * 0.86, h * 0.12 * (1 + 0.08 * Math.sin(t * 18)), '#3eff7a', { stroke: '#0a3a14', sw: h * 0.02, maxW: w * 0.8 }); x.restore(); }
  else inked(x, 'FIND A GREEN ONE', w / 2, h * 0.86, h * 0.07, '#ffffff', { stroke: false, maxW: w * 0.8 });
  s.lotTex.needsUpdate = true;
}

// ---- toys: a Lego-style dragon (chunky, shiny plastic, a clear silhouette: wings up, curled tail), flipper, life jacket, brick
function hntDragon(col, o = {}) {
  const g = new THREE.Group(), ink = o.ink ?? 0.03;
  const M = o.glow ? c3Prop(col, { rough: 0.18, env: 1.2, emissive: col, ei: 0.22 }) : c3Prop(col, { rough: 0.14, env: 1.8 });
  if (o.glow) M.userData.glow = o.glow;
  const sph = HNT.sph ||= new THREE.SphereGeometry(1, 22, 16);
  const add = (geo, x, y, z, s = [1, 1, 1], r = [0, 0, 0], mat = M, ik = ink) => { const m = c3Mesh(geo, mat, ik); m.position.set(x, y, z); m.scale.set(...s); m.rotation.set(...r); g.add(m); return m; };
  add(sph, 0, 0.62, 0, [0.62, 0.44, 0.4]);                         // body
  add(sph, 0.5, 1.0, 0, [0.2, 0.36, 0.19], [0, 0, -0.55]);          // neck
  add(sph, 0.8, 1.34, 0, [0.32, 0.24, 0.24]);                      // head
  add(sph, 1.08, 1.27, 0, [0.22, 0.13, 0.16]);                     // snout
  const cone = HNT.horn ||= new THREE.ConeGeometry(0.07, 0.32, 10);
  for (const z of [0.11, -0.11]) add(cone, 0.68, 1.58, z, [1, 1, 1], [z * 1.5, 0, 0.7]);   // horns
  for (const z of [0.2, -0.2]) add(HNT.eye ||= new THREE.SphereGeometry(0.06, 10, 8), 0.95, 1.4, z, [1, 1, 1], [0, 0, 0], c3Flat(o.eye ?? '#ffd23c', { glow: o.eye ?? '#ffd23c' }), 0);
  // wings: a bat wing shape, extruded thin, spread up and out on both sides, swept back
  const ws = new THREE.Shape(); ws.moveTo(0, 0); ws.quadraticCurveTo(0.15, 0.7, 0.05, 1.25); ws.lineTo(0.34, 1.0); ws.lineTo(0.55, 1.12); ws.lineTo(0.7, 0.82); ws.lineTo(0.98, 0.86); ws.quadraticCurveTo(0.72, 0.28, 0, 0);
  const wg = HNT.wing ||= new THREE.ExtrudeGeometry(ws, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 10 });
  for (const sd of [1, -1]) { const p = new THREE.Group(); p.position.set(-0.05, 0.9, sd * 0.12); p.rotation.set(sd * -0.35, 0, 0.35); g.add(p);
    const m = c3Mesh(wg, M, ink); m.rotation.y = -sd * Math.PI / 2; p.add(m); }
  // tail: a curled tube ending in a spike
  const tc = new THREE.CatmullRomCurve3([hntV(-0.5, 0.55, 0), hntV(-0.95, 0.38, 0.05), hntV(-1.25, 0.55, 0.1), hntV(-1.32, 0.86, 0.06)]);
  add(HNT.tail ||= new THREE.TubeGeometry(tc, 18, 0.1, 10, false), 0, 0, 0);
  add(cone, -1.33, 0.98, 0.06, [1.3, 1, 1.3], [0, 0, 0.1]);
  // legs: four stubby feet
  for (const [lx, lz] of [[0.32, 0.24], [0.32, -0.24], [-0.32, 0.26], [-0.32, -0.26]]) add(sph, lx, 0.18, lz, [0.16, 0.2, 0.14]);
  return g;
}
function hntFlipper(col) {
  const g = new THREE.Group(), M = c3Prop(col, { rough: 0.2, env: 1.5 });
  const sh = new THREE.Shape(); sh.moveTo(-0.3, 0); sh.lineTo(0.3, 0); sh.quadraticCurveTo(0.7, 1.2, 0.55, 1.9); sh.quadraticCurveTo(0, 1.75, -0.55, 1.9); sh.quadraticCurveTo(-0.7, 1.2, -0.3, 0);
  const m = c3Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }), M, 0.03); m.rotation.x = -Math.PI / 2; g.add(m);
  const foot = c3Mesh(new THREE.SphereGeometry(0.34, 16, 10), M, 0.03); foot.scale.set(1, 0.55, 1.2); foot.position.set(0, 0.15, -0.2); g.add(foot);
  return g;
}
function hntJacket() {
  const g = new THREE.Group(), M = c3Prop('#ffb81c', { rough: 0.3, env: 1.2 }), S2 = c3Prop('#e8e8e8', { rough: 0.3 });
  for (const sd of [1, -1]) { const p = c3Mesh(c3RBox(0.42, 0.9, 0.22, 0.1), M, 0.03); p.position.set(sd * 0.25, 0.45, 0); p.rotation.z = sd * 0.08; g.add(p); }
  const back = c3Mesh(c3RBox(0.9, 0.5, 0.18, 0.08), M, 0.03); back.position.set(0, 0.75, -0.12); g.add(back);
  const strap = c3Mesh(c3RBox(0.92, 0.08, 0.26, 0.03), S2, 0.015); strap.position.set(0, 0.35, 0); g.add(strap);
  return g;
}
function hntBrick(col, nx = 2, nz = 2) {
  const g = new THREE.Group(), M = c3Prop(col, { rough: 0.16, env: 1.6 }), u = 0.4;
  const b = c3Mesh(c3RBox(nx * u, 0.48, nz * u, 0.05), M, 0.025); b.position.y = 0.24; g.add(b);
  const st = HNT.stud ||= new THREE.CylinderGeometry(0.12, 0.12, 0.12, 14);
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) { const s = c3Mesh(st, M, 0.015); s.position.set((i - (nx - 1) / 2) * u, 0.54, (k - (nz - 1) / 2) * u); g.add(s); }
  return g;
}
// a plastic beach bucket full of finds (bottom at y 0, handle top at y ~1.55)
function hntBucket(col) {
  const g = new THREE.Group(), M = c3Prop(col, { rough: 0.25, env: 1.2, side: THREE.DoubleSide });
  const wall = c3Mesh(new THREE.CylinderGeometry(0.62, 0.48, 1.05, 28, 1, true), M, 0.03); wall.material.side = THREE.DoubleSide; wall.position.y = 0.52; g.add(wall);
  const bot = new THREE.Mesh(new THREE.CircleGeometry(0.48, 24), M); bot.rotation.x = -Math.PI / 2; bot.position.y = 0.02; g.add(bot);
  const rim = c3Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 28), M, 0.02); rim.rotation.x = Math.PI / 2; rim.position.y = 1.05; g.add(rim);
  const hd = c3Mesh(new THREE.TorusGeometry(0.6, 0.03, 6, 24, Math.PI), c3Prop('#e8e8ee', { rough: 0.3, metal: 0.5 }), 0.012); hd.position.y = 0.95; g.add(hd); g.handle = hd;
  // the finds poking out of the top
  const R = RNG('bucket', col), cols = ['#d8322a', '#f2c230', '#2a6ad8', '#3aa05a', '#ffffff', '#1c1d24'];
  for (let i = 0; i < 9; i++) { const b = hntBrick(cols[i % cols.length], R.i(1, 2), R.i(1, 2)); b.scale.setScalar(0.5); b.position.set(R.n(0.32), 0.82 + R.r(0, 0.14), R.n(0.32)); b.rotation.set(R.n(0.6), R.r(0, 3), R.n(0.6)); g.add(b); }
  const d = hntDragon('#1c1d24'); d.scale.setScalar(0.32); d.position.set(0.1, 0.92, 0.05); d.rotation.set(0.2, 0.6, 0.15); g.add(d);
  const fl = hntFlipper('#1c1d24'); fl.scale.setScalar(0.32); fl.position.set(-0.25, 0.98, -0.1); fl.rotation.set(0.9, 0.3, 0.4); g.add(fl);
  return g;
}

// ---- the dog: an appealing rounded cartoon dog (toon, ink outlines), nose at +x, paws on y 0
function hntDog() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const fur = c3Toon('#d99a52'), cream = c3Toon('#f8e6c4'), dark = c3Toon('#7a4220'), black = c3Toon('#1a1210'), red = c3Toon('#d8322a'), pink = c3Toon('#ff7a8a');
  const sph = HNT.sph ||= new THREE.SphereGeometry(1, 22, 16), cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 16);
  const m = (geo, mat, par, x, y, z, s = [1, 1, 1], r = [0, 0, 0], ink = 0.045) => { const o = c3Mesh(geo, mat, ink); o.position.set(x, y, z); o.scale.set(...s); o.rotation.set(...r); par.add(o); return o; };
  m(sph, fur, body, 0, 2.25, 0, [1.5, 0.92, 0.88]);
  m(sph, cream, body, 0.55, 1.95, 0, [0.95, 0.62, 0.72], [0, 0, 0], 0);   // belly patch (inside the torso's ink)
  m(new THREE.TorusGeometry(0.62, 0.14, 8, 24), red, body, 1.15, 2.85, 0, [1, 1, 1], [0, Math.PI / 2, 0.7], 0.02);   // collar
  m(sph, c3Toon('#ffd23c'), body, 1.45, 2.5, 0, [0.14, 0.14, 0.06], [0, 0, 0], 0.015);   // tag
  const head = new THREE.Group(); head.position.set(1.55, 3.45, 0); body.add(head);
  m(sph, fur, head, 0, 0, 0, [0.95, 0.88, 0.88]);
  m(sph, cream, head, 0.72, -0.3, 0, [0.62, 0.45, 0.55]);   // muzzle
  m(sph, black, head, 1.3, -0.12, 0, [0.2, 0.16, 0.2], [0, 0, 0], 0.02);   // nose
  const tongue = m(cap(0.12, 0.25), pink, head, 0.95, -0.72, 0.12, [1, 1, 0.6], [0, 0, 0.2], 0.02);
  for (const z of [0.42, -0.42]) {
    m(sph, c3Flat('#ffffff'), head, 0.58, 0.28, z, [0.2, 0.24, 0.12], [0, 0, 0], 0.02);
    m(sph, c3Flat('#120a08'), head, 0.72, 0.26, z * 1.04, [0.11, 0.14, 0.08], [0, 0, 0], 0);
    m(sph, c3Flat('#ffffff'), head, 0.79, 0.33, z * 1.08, [0.035, 0.04, 0.03], [0, 0, 0], 0);
    m(sph, dark, head, 0.75, 0.62, z * 0.95, [0.16, 0.06, 0.16], [0, 0, z > 0 ? -0.2 : 0.2], 0.015);   // brows
  }
  const ears = [0.82, -0.82].map((z) => { const p = new THREE.Group(); p.position.set(-0.2, 0.55, z); head.add(p); m(sph, dark, p, 0, -0.55, 0, [0.3, 0.7, 0.18], [z > 0 ? 0.25 : -0.25, 0, 0.15]); return p; });
  const legs = [[0.95, 0.5], [0.95, -0.5], [-0.95, 0.5], [-0.95, -0.5]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, 1.85, z); body.add(p);
    m(cap(0.27, 1.0), fur, p, 0, -0.8, 0); m(sph, cream, p, 0.08, -1.62, 0, [0.36, 0.2, 0.32]); return p; });
  const tail = new THREE.Group(); tail.position.set(-1.45, 2.65, 0); body.add(tail); m(cap(0.15, 0.95), fur, tail, -0.25, 0.5, 0, [1, 1, 1], [0, 0, 0.6]);
  m(sph, cream, tail, -0.55, 1.0, 0, [0.2, 0.22, 0.2]);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: C3_SPR.__shadow, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.75 }));
  sh.rotation.x = -Math.PI / 2; sh.scale.set(4.4, 2.2, 1); sh.position.y = 0.03; sh.renderOrder = -1; g.add(sh);
  return { g, body, head, ears, legs, tail, tongue };
}
// the dog's pose: walk = gait phase speed (0 = standing), sniff 0..1 lowers the head to the ground and twitches the nose
function hntDogPose(d, t, o = {}) {
  const ph = t * (o.walk ?? 0) * TAU, wk = o.walk ? 1 : 0;
  d.legs.forEach((p, i) => { const diag = (i === 0 || i === 3) ? 0 : Math.PI; p.rotation.z = wk * 0.55 * Math.sin(ph + diag); });
  d.body.position.y = wk * 0.12 * Math.abs(Math.sin(ph)) + (o.bark ? 0.15 * Math.sin(clamp(o.bark) * Math.PI) : 0);
  d.body.rotation.z = wk * 0.03 * Math.sin(ph * 2) - (o.sniff ?? 0) * 0.08;
  const sn = o.sniff ?? 0;
  d.head.rotation.z = -0.65 * sn + 0.05 * Math.sin(t * 3) + (sn > 0.5 ? 0.06 * Math.sin(t * 34) : 0) + (o.bark ? 0.3 * Math.sin(clamp(o.bark) * Math.PI) : 0);
  d.head.position.set(1.55 + 0.25 * sn, 3.45 - 1.1 * sn, 0);
  d.head.rotation.y = o.look ?? 0;
  d.tail.rotation.x = 0.6 * Math.sin(t * (o.wag ?? 11));
  d.ears.forEach((e, i) => { e.rotation.x = (i ? -1 : 1) * (0.1 + 0.12 * Math.sin(ph * 2 + i) * wk); });
  d.tongue.visible = !!o.pant; if (o.pant) d.tongue.scale.y = 1 + 0.25 * Math.sin(t * 16);
}

// ---- the beach world
function hntBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 1400), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.55, sky: '#cfe6ff', ground: '#c8955c', key: '#fff2d8', keyI: 1.15, keyP: [-16, 30, 22], rim: '#ffd8b0', rimI: 0.5, rimP: [12, 14, -24] });
  s.lit = scene.children.filter((c) => c.isLight);
  // sky dome and sea
  s.skyTex = { day: hntTexSky('day'), dusk: hntTexSky('dusk') };
  s.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), c3Flat('#ffffff', { map: s.skyTex.day, side: THREE.BackSide })); scene.add(s.sky);
  s.seaM = c3Prop('#2a86a8', { map: hntTexSea(), rough: 0.18, metal: 0.1, env: 0.7 });
  const sea = pl(2400, 900, s.seaM, 0, 0.05, -466, 0, -Math.PI / 2); scene.add(sea);
  s.glitter = new THREE.Mesh(new THREE.PlaneGeometry(40, 700), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { x.clearRect(0, 0, w, h); const R = RNG('glit');
    for (let i = 0; i < 900; i++) { const y = R.r(0, h), sp = (1 - y / h) * 0.3 + 0.1; x.fillStyle = `rgba(255,236,190,${R.r(0.3, 0.9)})`; x.fillRect(w / 2 + R.n(w * sp), y, R.r(6, 22), 3); } }, 256, 1024), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  s.glitter.rotation.x = -Math.PI / 2; s.glitter.position.set(-40, 0.08, -380); scene.add(s.glitter);
  // foam: bands that roll in toward the shore (z -16), swell and fade; thin swash sheets slide up the wet sand
  const foamT = hntTexFoam();
  s.foam = [...Array(6)].map((_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(600, 2.4), new THREE.MeshBasicMaterial({ map: foamT, transparent: true, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; });
  s.swell = [...Array(3)].map(() => { const m = c3Mesh(new THREE.CylinderGeometry(1, 1, 600, 16, 1, false, 0, Math.PI), c3Prop('#5ab8c4', { rough: 0.1, metal: 0.2, env: 1.4 }), 0); m.rotation.z = Math.PI / 2; scene.add(m); return m; });
  // sand: dry (warm, rippled) and the glossy wet band by the water
  s.sandM = c3Prop('#ffffff', { map: hntTexSand(), rough: 0.9 }); scene.add(pl(1200, 260, s.sandM, 0, 0, 114, 0, -Math.PI / 2));
  s.wetM = c3Prop('#ffffff', { map: hntTexWet(), transparent: true, rough: 0.08, metal: 0.25, env: 1.0 }); s.wetM.depthWrite = false;
  const wet = pl(1200, 16, s.wetM, 0, 0.02, -9, 0, -Math.PI / 2); wet.renderOrder = -2; scene.add(wet);
  // the wrack line: seaweed clumps, driftwood, rope, shells and Lego scattered along z ~ -2
  const weedM = [c3Toon('#4a5a22'), c3Toon('#6a4a1e'), c3Toon('#2e4a2a')], driftM = c3Toon('#a8875e'), shellM = c3Toon('#fff2e2');
  s.wrack = new THREE.Group(); scene.add(s.wrack);
  for (let i = 0; i < 70; i++) { const R = RNG('weed', i), cl = new THREE.Group(); cl.position.set(R.r(-60, 60), 0, R.r(-4.5, 0.5)); s.wrack.add(cl);
    for (let k = 0; k < R.i(3, 6); k++) { const b = c3Mesh(HNT.sph ||= new THREE.SphereGeometry(1, 22, 16), weedM[R.i(0, 2)], 0.03); b.scale.set(R.r(0.4, 0.9), R.r(0.12, 0.28), R.r(0.3, 0.6)); b.position.set(R.n(0.8), 0.08, R.n(0.5)); b.rotation.y = R.r(0, 3); cl.add(b); }
    for (let k = 0; k < 3; k++) { const rib = c3Mesh(new THREE.CapsuleGeometry(0.06, R.r(0.6, 1.4), 4, 8), weedM[0], 0.015); rib.rotation.set(Math.PI / 2, 0, R.r(0, 3)); rib.position.set(R.n(0.8), 0.06, R.n(0.6)); cl.add(rib); } }
  for (let i = 0; i < 6; i++) { const R = RNG('drift', i), d = c3Mesh(new THREE.CapsuleGeometry(0.28, R.r(2.5, 5), 6, 10), driftM, 0.035); d.rotation.set(Math.PI / 2, 0, R.r(-1.2, 1.2)); d.position.set(R.r(-40, 40), 0.24, R.r(-3, 1)); s.wrack.add(d); }
  for (let i = 0; i < 40; i++) { const R = RNG('shell', i), sh = c3Mesh(HNT.sph, shellM, 0.015); sh.scale.set(0.16, 0.08, 0.13); sh.position.set(R.r(-30, 30), 0.05, R.r(-6, 8)); s.wrack.add(sh); }
  s.toys = new THREE.Group(); scene.add(s.toys);
  const TC = ['#d8322a', '#f2c230', '#2a6ad8', '#3aa05a', '#ffffff', '#ff7a1a'];
  for (let i = 0; i < 60; i++) { const R = RNG('toy', i), kind = R.i(0, 9);
    const o = kind < 5 ? hntBrick(TC[i % TC.length], R.i(1, 3), R.i(1, 2)) : kind < 7 ? hntDragon('#1c1d24') : kind < 8 ? hntFlipper(R.f() < 0.5 ? '#1c1d24' : '#2a6ad8') : hntJacket();
    o.scale.setScalar(kind >= 5 && kind < 7 ? 0.5 : 0.5); o.position.set(R.r(-24, 24), 0.02, R.r(-5, 3)); o.rotation.set(R.n(0.25), R.r(0, TAU), R.n(0.25)); s.toys.add(o); }
  // footprints and paw prints in the damp sand
  const fpM = new THREE.MeshBasicMaterial({ map: hntTexFoot(), transparent: true, depthWrite: false, toneMapped: false }), pawM = new THREE.MeshBasicMaterial({ map: hntTexPaw(), transparent: true, depthWrite: false, toneMapped: false });
  for (let i = 0; i < 26; i++) { const R = RNG('fp', i), f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), fpM); f.rotation.set(-Math.PI / 2, 0, -Math.PI / 2 + R.n(0.2)); f.position.set(-30 + i * 2.3, 0.03, 3.2 + R.n(0.4)); scene.add(f);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), pawM); p.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); p.position.set(-29 + i * 2.3, 0.03, 5.0 + R.n(0.6)); scene.add(p); }
  // tide pools: little mirrors of the sky
  s.pools = [];
  for (const [x, z, sx, sz] of [[-7, 6, 3.2, 1.2], [9, 9, 4.5, 1.6], [-16, -6, 5, 1.5], [3, -8, 4, 1.2], [18, 4, 3, 1.1]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 30), c3Prop('#8ab8d8', { rough: 0.02, metal: 0.85, env: 1.8 })); p.rotation.x = -Math.PI / 2; p.scale.set(sx, sz, 1); p.position.set(x, 0.035, z); scene.add(p); s.pools.push(p); }
  // the right-hand cliff: big rounded rocks with grassy tops, reaching into the sea; beach huts at its foot
  const rockM = [c3Toon('#8a7a6c'), c3Toon('#6e6258'), c3Toon('#9c8a76')], grassM = c3Toon('#6aa04a');
  const ico = new THREE.IcosahedronGeometry(1, 1);
  s.cliff = new THREE.Group(); scene.add(s.cliff);
  for (let i = 0; i < 26; i++) { const R = RNG('cliff', i), x = 22 + R.r(0, 50), z = -110 + i * 4.4 + R.n(3), h = R.r(14, 30) * (1 - i / 40);
    const r = c3Mesh(ico, rockM[i % 3], 0.06); r.scale.set(R.r(6, 11), h, R.r(5, 9)); r.position.set(x, h * 0.45, z); r.rotation.set(R.n(0.2), R.r(0, 3), R.n(0.15)); s.cliff.add(r);
    const gT = c3Mesh(HNT.sph, grassM, 0.05); gT.scale.set(r.scale.x * 1.05, 2.2, r.scale.z * 1.05); gT.position.set(x, h * 0.45 + h * 0.86, z); s.cliff.add(gT); }
  for (let i = 0; i < 9; i++) { const R = RNG('boulder', i), r = c3Mesh(ico, rockM[i % 3], 0.04); const sc = R.r(1.2, 3); r.scale.set(sc * 1.3, sc * 0.8, sc); r.position.set(R.r(12, 26), sc * 0.4, R.r(-20, 6)); s.cliff.add(r); }
  const HUTC = ['#7ad8c0', '#ffd25a', '#ff9ab0', '#7ab4ff', '#ffffff'];
  for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.position.set(13 + i * 0.4, 0, -14 + i * 4.6); g.rotation.y = -1.25; scene.add(g);
    g.add(rb(4.4, 5.6, 4, c3Prop('#ffffff', { map: hntTexHut(HUTC[i]), rough: 0.6 }), 0, 2.8, 0, 0.04));
    const roof = c3Mesh(new THREE.CylinderGeometry(0.01, 3.4, 2.2, 4, 1), c3Toon('#f6f2ea'), 0.04); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.9); roof.position.y = 6.7; g.add(roof);
    g.add(rb(4.8, 0.4, 4.4, c3Toon('#a8875e'), 0, 0.2, 0.3, 0.03)); }
  // the far left headland and its lighthouse (its lamp glows and sweeps a beam at dusk)
  const head = new THREE.Group(); head.position.set(-34, 0, -170); scene.add(head);
  for (let i = 0; i < 9; i++) { const R = RNG('head', i), r = c3Mesh(ico, rockM[i % 3], 0.1); const h = R.r(8, 18); r.scale.set(R.r(10, 20), h, R.r(8, 14)); r.position.set(-30 + i * 7, h * 0.4, R.n(6)); head.add(r);
    const gT = c3Mesh(HNT.sph, grassM, 0.08); gT.scale.set(r.scale.x, 1.8, r.scale.z); gT.position.set(r.position.x, h * 0.4 + h * 0.85, r.position.z); head.add(gT); }
  const lh = new THREE.Group(); lh.position.set(18, 14, 0); head.add(lh);
  lh.add(cyl(2.2, 3.0, 16, c3Prop('#ffffff', { map: hntTexLighthouse(), rough: 0.5 }), 0, 8, 0, 0.1, 24));
  lh.add(cyl(3.2, 3.2, 0.6, c3Toon('#2a2a30'), 0, 16.3, 0, 0.06, 24));
  s.lamp = cyl(1.6, 1.6, 2.4, c3Flat('#fff4c8', { glow: '#ffe08a' }), 0, 17.8, 0, 0.06, 20); lh.add(s.lamp);
  const lroof = c3Mesh(new THREE.ConeGeometry(2.1, 2.2, 20), c3Toon('#d8322a'), 0.06); lroof.position.y = 20.1; lh.add(lroof);
  s.beam = new THREE.Mesh(new THREE.ConeGeometry(9, 120, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0c0', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  s.beamPivot = new THREE.Group(); s.beamPivot.position.set(0, 17.8, 0); lh.add(s.beamPivot); s.beam.rotation.z = Math.PI / 2; s.beam.position.x = 60; s.beamPivot.add(s.beam);
  // gulls: little V shapes gliding (bg)
  s.gulls = [...Array(5)].map((_, i) => { const g = new THREE.Group(); for (const sd of [1, -1]) { const w = c3Mesh(new THREE.CapsuleGeometry(0.12, 1.4, 4, 8), c3Toon('#ffffff'), 0.03); w.rotation.z = sd * (Math.PI / 2 - 0.3); w.position.x = sd * 0.65; g.add(w); } scene.add(g); return g; });
  // ---- people (FOCUS)
  s.woman = c3Person({ key: 'woman', outfit: 'mustard', hairStyle: 'long' }); s.woman.g.scale.setScalar(HNT_K); scene.add(s.woman.g); bchRaincoat(s.woman);
  s.neighbor = c3Person({ key: 'neighbor', outfit: 'plaid', hairStyle: 'white', fx: ['mustache_grey'] }); s.neighbor.g.scale.setScalar(HNT_K); scene.add(s.neighbor.g);
  s.hunters = [{ key: 'h1', outfit: 'navy', hairStyle: 'spiky' }, { key: 'h2', outfit: 'stripes', hairStyle: 'side' }, { key: 'h3', outfit: 'teal', hairStyle: 'messy' }, { key: 'h4', outfit: 'white', hairStyle: 'swept', fx: ['beard'] }]
    .map((o) => { const p = c3Person(o); p.g.scale.setScalar(HNT_K); scene.add(p.g); return p; });
  s.dog = hntDog(); s.dog.g.scale.setScalar(0.95); scene.add(s.dog.g);
  // held props (billboard-local, re-placed per shot): her bucket, the neighbour's phone, flashlights, the green dragon + her pinching hand
  s.bucketHeld = hntBucket('#2a8ad8'); s.bucketHeld.scale.setScalar(0.85); s.woman.root.add(s.bucketHeld);
  s.bucketSand = hntBucket('#2a8ad8'); s.bucketSand.scale.setScalar(0.85 * HNT_K); scene.add(s.bucketSand);
  s.nPhone = new THREE.Group(); s.nPhone.add(c3Mesh(c3RBox(0.5, 0.9, 0.08, 0.08), c3Prop('#1a1a22', { rough: 0.25 }), 0.02));
  s.nScr = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.8), c3Flat('#8ad8ff', { glow: '#5ab0ff' })); s.nScr.position.z = 0.05; s.nPhone.add(s.nScr); s.nPhone.renderOrder = 6; s.neighbor.root.add(s.nPhone);
  s.lights = [s.woman, ...s.hunters].map((p) => { const fl = new THREE.Group(); fl.add(c3Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.8, 14), c3Prop('#3a3a44', { rough: 0.3, metal: 0.5 }), 0.02));
    const lens = c3Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.16, 16), c3Flat('#fff6d0', { glow: '#fff0a0' }), 0.015); lens.position.y = 0.46; fl.add(lens); fl.renderOrder = 6; p.root.add(fl);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff2c0', transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false })); scene.add(beam);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ map: C3_SPR.__shadow, color: '#000000', transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    pool.material = new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,240,190,0.9)'); gr.addColorStop(0.6, 'rgba(255,220,150,0.35)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 128, 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    pool.rotation.x = -Math.PI / 2; scene.add(pool); return { p, fl, beam, pool }; });
  s.green = hntDragon('#1fb83e', { glow: '#0e8a2a', eye: '#fff6a0' }); s.green.scale.setScalar(0.85); s.woman.root.add(s.green); s.green.renderOrder = 6;
  s.greenSand = hntDragon('#1fb83e', { glow: '#0e8a2a', eye: '#fff6a0' }); s.greenSand.scale.setScalar(0.5 * HNT_K); scene.add(s.greenSand);
  s.greenHalo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(90,255,120,0.55)'); gr.addColorStop(0.4, 'rgba(60,220,100,0.22)'); gr.addColorStop(1, 'rgba(80,255,120,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 128, 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  scene.add(s.greenHalo);
  // her pinching hand around the green dragon: a cartoon mitten (palm, curled fingers, thumb) in the same ink brown as the refs
  const HM = c3Toon('#5a3323'), HI = 0.03; s.pinch = new THREE.Group(); s.woman.root.add(s.pinch); s.pinch.renderOrder = 7;
  { const palm = c3Mesh(HNT.sph, HM, HI); palm.scale.set(0.3, 0.26, 0.2); s.pinch.add(palm);
    for (let k = 0; k < 3; k++) { const f = c3Mesh(HNT.sph, HM, HI); f.scale.set(0.11, 0.1, 0.1); f.position.set(-0.16 + k * 0.15, 0.2, 0.15); s.pinch.add(f); }
    const th = c3Mesh(new THREE.CapsuleGeometry(0.08, 0.2, 6, 10), HM, HI); th.rotation.z = -0.7; th.position.set(0.28, 0.12, 0.08); s.pinch.add(th); }
  // the tally plank (s32), the pile of black dragons on a towel, the lottery board (s33), confetti
  s.tallyCv = Object.assign(document.createElement('canvas'), { width: 1024, height: 640 }); s.tallyTex = new THREE.CanvasTexture(s.tallyCv); s.tallyTex.encoding = THREE.sRGBEncoding;
  s.tally = new THREE.Group(); scene.add(s.tally);
  s.tally.add(rb(6.6, 4.2, 0.3, c3Toon('#a8875e'), 0, 4.6, 0, 0.05)); s.tally.add(pl(6.2, 3.85, c3Prop('#ffffff', { map: s.tallyTex, rough: 0.8 }), 0, 4.6, 0.16));
  for (const x of [-2.4, 2.4]) s.tally.add(rb(0.35, 3.0, 0.35, c3Toon('#7a5a3a'), x, 1.3, -0.1, 0.03));
  s.towel = new THREE.Group(); scene.add(s.towel);
  s.towel.add(pl(7, 4.4, c3Prop('#ffffff', { map: tex((x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#e8402e'; x.fillRect(i * w / 8, 0, w / 8, h); } }, 256, 128), rough: 0.9 }), 0, 0.03, 0, 0, -Math.PI / 2));
  s.pile = [...Array(46)].map((_, i) => { const d = hntDragon('#1c1d24'); d.scale.setScalar(0.42); s.towel.add(d); return d; });
  s.lotCv = Object.assign(document.createElement('canvas'), { width: 1024, height: 768 }); s.lotTex = new THREE.CanvasTexture(s.lotCv); s.lotTex.encoding = THREE.sRGBEncoding;
  s.lotto = new THREE.Group(); scene.add(s.lotto);
  s.lotto.add(rb(9.4, 7.4, 0.6, c3Prop('#ffd23c', { rough: 0.25, metal: 0.4, env: 1.4 }), 0, 0, -0.2, 0.06));
  s.lotto.add(pl(8.6, 6.45, c3Flat('#ffffff', { map: s.lotTex, glow: '#2a1040' }), 0, 0, 0.13));
  s.bulbs = [];
  for (let i = 0; i < 30; i++) { const k = i / 30, per = 2 * (9.0 + 7.0); let d = k * per, bx, by;
    if (d < 9) { bx = -4.5 + d; by = 3.5; } else if ((d -= 9) < 7) { bx = 4.5; by = 3.5 - d; } else if ((d -= 7) < 9) { bx = 4.5 - d; by = -3.5; } else { d -= 9; bx = -4.5; by = -3.5 + d; }
    const b = c3Mesh(HNT.sph, c3Flat('#fff4c8', { glow: '#ffe08a' }), 0.0); b.scale.setScalar(0.17); b.position.set(bx, by, 0.15); s.lotto.add(b); s.bulbs.push(b); }
  for (const x of [-3.2, 3.2]) s.lotto.add(rb(0.4, 6, 0.4, c3Prop('#d8b030', { rough: 0.3, metal: 0.5 }), x, -6, -0.2, 0.03));
  s.confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.22, 0.34), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), 260); s.confetti.frustumCulled = false; scene.add(s.confetti);
  { const CC = ['#ff3a5a', '#ffd23c', '#3eff7a', '#3ab0ff', '#ff8ad8', '#ffffff'], c = new THREE.Color(); for (let i = 0; i < 260; i++) { c.set(CC[i % CC.length]); s.confetti.setColorAt(i, c); } }
  [s.woman.g, s.neighbor.g, ...s.hunters.map((h) => h.g), s.dog.g, s.bucketSand, s.toys, s.tally, s.towel, s.lotto, s.confetti, s.greenSand, s.greenHalo, s.wrack].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.lights.forEach((l) => { c3Layer(l.beam, C3.L_FOCUS); c3Layer(l.pool, C3.L_FOCUS); });
  // blurred foreground pieces (NEAR layer), placed per shot by hntFg
  s.fgBy = {
    weed: (() => { const g = new THREE.Group(); for (let i = 0; i < 7; i++) { const R = RNG('fgw', i), b = c3Mesh(HNT.sph, weedM[i % 3], 0.03); b.scale.set(R.r(0.8, 1.6), R.r(0.3, 0.6), 0.5); b.position.set(R.n(2), R.n(0.4), 0); g.add(b); } return g; })(),
    grass: (() => { const g = new THREE.Group(); for (let i = 0; i < 24; i++) { const R = RNG('fgg', i), c = c3Mesh(new THREE.ConeGeometry(0.08, R.r(3, 6), 5), c3Toon(i % 2 ? '#8aa04a' : '#b8a85a'), 0.0); c.position.set(R.n(1.6), 0, 0); c.rotation.z = R.n(0.35); g.add(c); } return g; })(),
    post: c3Mesh(new THREE.CylinderGeometry(0.6, 0.7, 30, 12), c3Toon('#8a6a48'), 0.04),
    rock: (() => { const r = c3Mesh(ico, rockM[1], 0.05); r.scale.set(2.6, 1.6, 1.4); return r; })(),
    brick: (() => { const b = hntBrick('#d8322a', 2, 2); b.scale.setScalar(2.4); return b; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#a8d0f0', mid: '#f0dcc0', bot: '#8a6a4a', cards: [[0, 30, -30, 40, 8, '#fff6e8'], [-30, 10, 10, 10, 18, '#cfe6ff'], [30, 12, -10, 10, 18, '#ffe0c0']] });
  c3Shadows(scene, s.key, 30);
  return s;
}
const hntGet = () => HNT.s ||= hntBuild();
// the two moods of the beach
function hntMode(s, mode) {
  if (s.mode === mode) return; s.mode = mode; const dusk = mode === 'dusk';
  s.sky.material.map = s.skyTex[mode]; s.sky.material.needsUpdate = true;
  s.seaM.color.set(dusk ? '#3a3a7a' : '#2a86a8'); s.sandM.color.set(dusk ? '#a890a8' : '#ffffff'); s.wetM.color.set(dusk ? '#ffc8a0' : '#ffffff');
  s.swell.forEach((m) => m.material.color.set(dusk ? '#6a6a9a' : '#5ab8c4'));
  const [amb, hemi, key, rim] = s.lit;
  amb.color.set(dusk ? '#c0a8d8' : '#fff0e0'); amb.intensity = dusk ? 0.45 : 0.55;
  hemi.color.set(dusk ? '#d098b8' : '#cfe6ff'); hemi.groundColor.set(dusk ? '#3a2a4a' : '#c8955c');
  key.color.set(dusk ? '#ffb070' : '#fff2d8'); key.intensity = dusk ? 0.9 : 1.15; key.position.set(...(dusk ? [-20, 10, -40] : [-16, 30, 22]));
  rim.color.set(dusk ? '#ff7a50' : '#ffd8b0'); rim.intensity = dusk ? 0.9 : 0.5;
  s.glitter.material.opacity = dusk ? 0.85 : 0.0; s.beam.material.opacity = dusk ? 0.1 : 0; s.lamp.material.color.set(dusk ? '#fff4c8' : '#e8e4d8');
  s.pools.forEach((p) => p.material.color.set(dusk ? '#e89a8a' : '#8ab8d8'));
}
// per-frame world: rolling foam and swells, gulls, the lighthouse beam; hides everything shot-specific
function hntWorld(s, t, mode) {
  hntMode(s, mode);
  s.foam.forEach((m, i) => { const k = mod(t / 4.2 + i / 6, 1), z = lerp(-40, -14.5, EZ.o2(k)) + (k > 0.85 ? (k - 0.85) * 18 : 0);
    m.position.set(0, 0.09 + 0.02 * i, z); m.material.opacity = Math.sin(clamp(k) * Math.PI) * 0.95; m.scale.set(1, 1 + k * 1.5, 1); });
  s.swell.forEach((m, i) => { const k = mod(t / 4.2 + i / 3 + 0.1, 1); m.position.set(0, -0.2, lerp(-60, -19, EZ.o2(k))); m.scale.set(lerp(0.6, 0.15, k), 1, 0.9 * Math.sin(Math.PI * clamp(k * 1.2))); });
  s.gulls.forEach((g, i) => { const R = RNG('gull', i); g.position.set(-200 + mod(t * R.r(3, 6) + R.r(80, 200), 400), R.r(28, 46) + Math.sin(t * 1.3 + i) * 1.2, R.r(-120, -60)); g.children.forEach((w, k) => { w.rotation.z = (k ? -1 : 1) * (Math.PI / 2 - 0.3 - 0.25 * Math.sin(t * 5 + i)); }); });
  s.beamPivot.rotation.y = t * 0.9;
  // shot-specific things off by default
  [s.neighbor.g, s.dog.g, s.bucketSand, s.tally, s.towel, s.lotto, s.confetti, s.greenSand, s.greenHalo, s.green, s.pinch, s.nPhone, s.bucketHeld].forEach((o) => { o.visible = false; });
  s.hunters.forEach((h) => { h.g.visible = false; });
  s.lights.forEach((l) => { l.fl.visible = false; l.beam.visible = false; l.pool.visible = false; });
  if (s.leash) s.leash.visible = false;
  s.woman.g.visible = true;
}
const HNT_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
// a walking person's feet: a stepping gait in the billboard plane (k = phase)
const hntWalkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });
// a flashlight in a person's hand, aimed at a point on the sand: beam cone + a warm pool where it lands
function hntTorch(s, i, hand, target, on = 1) {
  const L = s.lights[i], p = L.p; L.fl.visible = true; p.g.updateMatrixWorld(true);
  // handle in the fist, lens end aimed along the beam (toward the pool on the sand)
  const b = hntV(...target), dl = p.root.worldToLocal(b.clone()).sub(hntV(hand[0], hand[1], 0.15)).normalize();
  L.fl.position.set(hand[0], hand[1], 0.15).addScaledVector(dl, 0.22); L.fl.quaternion.setFromUnitVectors(hntV(0, 1, 0), dl); L.fl.updateMatrixWorld(true);
  const a = L.fl.localToWorld(hntV(0, 0.56, 0)), d = b.clone().sub(a), len = d.length();
  L.beam.visible = on > 0; L.beam.material.opacity = 0.1 * on; L.beam.scale.set(len * 0.2, len, len * 0.2);
  L.beam.position.copy(a).addScaledVector(d, 0.5); L.beam.quaternion.setFromUnitVectors(hntV(0, -1, 0), d.normalize());
  L.pool.visible = on > 0; L.pool.material.opacity = 0.6 * on; L.pool.position.set(b.x, 0.06, b.z); L.pool.scale.set(len * 0.22, len * 0.16, 1);
}

// =====================================================================
//  s25 — "Then her neighbor walks by with his dog,": she crouches at the wrack line filling her bucket; he strolls in
//  from the left with a happy dog on a red leash; the camera tracks along with them, low over the damp sand
// =====================================================================
const HNT_K25 = [[0, [-3.0, 6.2, 31], [-0.6, 4.8, 0], 44], [2.0, [0.6, 6.6, 29], [1.6, 5.0, 0], 44]];
SHOT_FN['s25'] = (t, u, lt) => {
  const s = hntGet(); hntWorld(s, t, 'day');
  const dog = hntW('dog', 1, 35.0), walksBy = hntW('walks', 2, 34.1);
  c3SetCam(s.cam, hntCam(HNT_K25, lt, 's25', { orbit: 0.04 }));
  // her: crouched by the seaweed at the right, bucket on the sand beside her, picking up a piece
  s.woman.g.position.set(4.6, HNT_FOOT - 1.7, -1.2);
  s.bucketSand.visible = true; s.bucketSand.position.set(7.0, 0, -0.6); s.bucketSand.rotation.y = 0.4;
  const pick = 0.5 + 0.5 * Math.sin(t * 3.2);
  c3PersonPose(s.woman, s.cam, t, { expr: c3FaceAt([[0, 'happy'], [walksBy + 0.4, 'neutral']], t, 'woman'), gaze: t < walksBy + 0.4 ? [0.3, -0.8] : [-0.8, 0.1], head: [0.08, 0, -0.1],
    hand: { armL: [1.5, lerp(-0.2, 0.6, pick)], armR: [-0.9, 0.9] }, foot: { legL: [1.15, -0.85], legR: [-1.15, -0.85] } });
  // him + the dog: walking left to right along z 3
  const wx = lerp(-12, -3.4, EZ.o2(clamp(lt / 1.9))), k = t * 7.2, walking = lt < 1.9 ? 1 : 0;
  s.neighbor.g.visible = true; s.neighbor.g.position.set(wx, HNT_FOOT, 3.2);
  const handN = [-1.6, 0.9 + 0.08 * Math.sin(k)];
  c3PersonPose(s.neighbor, s.cam, t, { expr: c3FaceAt([[0, 'happy'], [dog, 'smirk']], t, 'neighbor'), gaze: [0.8, -0.1], hand: { armR: handN, armL: [1.1, 0.4 + 0.1 * Math.sin(k + 1)] },
    lift: (q) => walking * 0.08 * Math.abs(Math.sin(q * 7.2)), ...(walking ? hntWalkFeet(k) : HNT_STAND) });
  s.dog.g.visible = true; s.dog.g.position.set(wx + 4.8, 0, 3.9); s.dog.g.rotation.y = 0.15;
  const bark = clamp((t - dog) / 0.25);
  hntDogPose(s.dog, t, { walk: walking ? 1.8 : 0, pant: true, bark: t > dog && t < dog + 0.25 ? bark : 0, look: t > dog ? 0.35 : 0.1 });
  hntLeash(s, s.neighbor, handN);
  hntFg(s, [['grass', [-3.6, -3.2, -9], 1.6], ['weed', [3.2, -4.4, -8], 1.2]], HNT_K25, 's25', lt, { orbit: 0.04 });
  hntRender(s, { bgBlur: hntRack(lt, 's25', 1.6, 2.6) });
};
// the red leash from the neighbour's hand to the dog's collar: a sagging tube rebuilt each frame
function hntLeash(s, who, hand) {
  who.g.updateMatrixWorld(true); s.dog.g.updateMatrixWorld(true);
  const a = who.root.localToWorld(hntV(hand[0], hand[1], 0.12)), b = s.dog.body.localToWorld(hntV(1.15, 2.85, 0));
  const mid = a.clone().lerp(b, 0.5); mid.y -= 0.9;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  if (s.leash) { s.leash.geometry.dispose(); s.leash.geometry = new THREE.TubeGeometry(curve, 20, 0.06, 6, false); }
  else { s.leash = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.06, 6, false), c3Toon('#d8322a')); s.scene.add(s.leash); c3Layer(s.leash, C3.L_FOCUS); }
  s.leash.visible = true;
}

// =====================================================================
//  s26 — "still cleaning up after a wave that hit before your phone was even invented?": he stops, smug, waves his shiny
//  phone at her; she stands with her arms crossed, unimpressed; the dog sticks its nose in her bucket
// =====================================================================
const HNT_K26 = [[0, [0.9, 6.8, 27], [0.2, 5.4, 1.4], 44], [3.5, [-0.3, 6.6, 24], [0.2, 5.5, 1.4], 44]];
SHOT_FN['s26'] = (t, u, lt) => {
  const s = hntGet(); hntWorld(s, t, 'day');
  const still = hntW('still', 1, 35.5), wave = hntW('wave', 2, 36.8), phone = hntW('phone', 1, 37.9), inv = hntW('invented', 1, 38.4), before = hntW('before', 1, 37.4);
  c3SetCam(s.cam, hntCam(HNT_K26, lt, 's26', { orbit: -0.03 }));
  s.neighbor.g.visible = true; s.neighbor.g.position.set(-4.0, HNT_FOOT, 2.4);   // room for the dog: its tail clears his legs
  const up = EZ.back(clamp((t - (phone - 0.25)) / 0.25));
  const handR = [lerp(-1.4, -2.0, up), lerp(1.0, 3.3, up)];
  s.nPhone.visible = true; s.nPhone.position.set(handR[0] + 0.05, handR[1] + 0.45, 0.14); s.nPhone.rotation.set(0, 0, -0.15 * up);
  s.nScr.material.color.set(t > phone ? '#c8f0ff' : '#8ad8ff');
  c3PersonPose(s.neighbor, s.cam, t, { expr: c3FaceAt([[0, 'smirk'], [still, 'talking'], [wave - 0.05, 'smug'], [before, 'talking'], [inv, 'grin']], t, 'neighbor'), gaze: [0.85, -0.05],
    head: c3Hold([[0, [0.06, 0, 0]], [wave, [-0.05, 0.05, 0.04]], [inv, [0.1, 0, 0.06]]], t, 4 / 30), hand: { armR: handR, armL: [1.5, 2.0] },
    lift: (q) => 0.12 * EZ.back(seg(q, inv - 0.03, inv + 0.08)) * Math.exp(-Math.max(0, q - inv - 0.08) * 5), x: t > inv ? ['sparkle'] : [], ...HNT_STAND });
  s.woman.g.position.set(3.9, HNT_FOOT, 1.0);
  c3PersonPose(s.woman, s.cam, t, { expr: c3FaceAt([[0, 'neutral'], [wave, 'unimpressed'], [inv + 0.15, 'deadpan']], t, 'woman'), gaze: [-0.85, 0], head: [-0.05, 0, -0.06],
    hand: { armL: [-0.35, 1.3], armR: [0.4, 1.4] }, ...HNT_STAND });
  // the dog: sniffing her bucket, then looks up at "phone"
  s.bucketSand.visible = true; s.bucketSand.position.set(2.0, 0, 1.4); s.bucketSand.rotation.y = -0.6;
  s.dog.g.visible = true; s.dog.g.position.set(-1.6, 0, 1.9); s.dog.g.rotation.y = 0.12;
  const sniff = t < phone ? 1 : 1 - EZ.io(clamp((t - phone) / 0.3));
  hntDogPose(s.dog, t, { sniff: EZ.io(clamp((t - still) / 0.4)) * sniff, pant: t > phone, look: t > phone ? 0.4 : 0, wag: 14 });
  hntLeash(s, s.neighbor, [1.5, 2.0]);
  hntFg(s, [['weed', [-3.4, -4.6, -7.5], 1.4], ['post', [3.4, 0, -11], -1.2]], HNT_K26, 's26', lt);
  hntRender(s, { bgBlur: hntRack(lt, 's26', 2.4, 3.4) });
};

// =====================================================================
//  s31 — "So now people go dragon hunting after every storm.": dusk after the storm — the sky still bruised at the top,
//  gold on the horizon; hunters with flashlights and buckets comb the glossy sand, beams sweeping; the lighthouse turns
// =====================================================================
const HNT_K31 = [[0, [7.5, 4.6, 32], [1.0, 7.0, 0], 46], [2.6, [2.5, 4.4, 29], [-0.5, 6.8, 0], 46]];
SHOT_FN['s31'] = (t, u, lt) => {
  const s = hntGet(); hntWorld(s, t, 'dusk');
  const hunting = hntW('hunting', 1, 50.5), storm = hntW('storm', 2, 51.0);
  c3SetCam(s.cam, hntCam(HNT_K31, lt, 's31', { orbit: -0.04 }));
  // her, in front, bucket in hand, sweeping her torch over the sand
  s.woman.g.position.set(1.0, HNT_FOOT, 4.0);
  const sw = Math.sin(t * 1.6);
  s.bucketHeld.visible = true; s.bucketHeld.position.set(1.35, -0.85, 0.1);
  c3PersonPose(s.woman, s.cam, t, { expr: c3FaceAt([[0, 'determined'], [hunting, 'excited']], t, 'woman'), gaze: [sw * 0.5, -0.8], head: [0.05, 0, -0.08], hand: { armL: [1.35, 0.75], armR: [-1.5, 1.6] }, ...HNT_STAND });
  hntTorch(s, 0, [-1.5, 1.6], [1.0 + sw * 3, 0, 8.5]);
  // the other hunters spread across the beach behind her, each sweeping a beam
  const pos = [[-8, -3.5], [9.5, -6], [-3.5, -10], [5, -1.5]];
  s.hunters.forEach((h, i) => { h.g.visible = true; const [x, z] = pos[i], ph = Math.sin(t * (1.1 + i * 0.3) + i * 2), walk = i % 2 ? t * 5.5 + i : 0;
    h.g.position.set(x + (i % 2 ? Math.sin(t * 0.6 + i) * 1.2 : 0), HNT_FOOT, z);
    c3PersonPose(h, s.cam, t, { expr: c3FaceAt([[0, i % 2 ? 'thinking' : 'determined']], t, h.key), gaze: [ph * 0.6, -0.8], hand: { armL: [1.35, 0.8], armR: [-1.5, 1.4] }, ...(i % 2 ? hntWalkFeet(walk, 0.35) : HNT_STAND) });
    hntTorch(s, i + 1, [-1.5, 1.4], [x + ph * 3, 0, z + 4]); });
  hntFg(s, [['grass', [-3.4, -3.6, -9], 1.4], ['rock', [3.6, -4.8, -10], 1.0]], HNT_K31, 's31', lt, { orbit: -0.04 });
  hntRender(s, { bg: '#2a2050', bgBlur: hntRack(lt, 's31', 1.8, 2.8), glow: 0.8, bloom: 0.3 });
};

// =====================================================================
//  s32 — "The black dragons are pretty common…": a beach towel heaped with black dragons, a bucket tipping more on top;
//  the tally plank behind it fills with marks and a red COMMON stamp lands inside it
// =====================================================================
const HNT_K32 = [[0, [2.4, 6.0, 15.0], [0.2, 3.6, -2], 44], [1.8, [0.9, 4.6, 12.2], [0.0, 2.6, -1], 44]];
SHOT_FN['s32'] = (t, u, lt) => {
  const s = hntGet(); hntWorld(s, t, 'dusk'); s.woman.g.visible = false;
  const blk = hntW('black', 2, 52.2), common = hntW('common', 1, 53.2);
  c3SetCam(s.cam, hntCam(HNT_K32, lt, 's32', { orbit: 0.05, creep: 0.07 }));
  s.towel.visible = true; s.towel.position.set(0, 0, 0); s.towel.rotation.y = 0.1;
  // the heap: most dragons already there, the last ones tumble in from the tipped bucket on "black" and bounce
  const pour0 = blk - 0.25;
  // rest spots stacked like spheres (radius CR): each dragon sits ON the ones below it, never inside them
  s.pileRest ||= (() => { const CR = 0.42, P = [];
    for (let i = 0; i < s.pile.length; i++) { const R = RNG('pile', i); let best = null;
      for (let k = 0; k < 24; k++) { const r = Math.sqrt(R.f()) * 2.0, a = R.r(0, TAU), x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r * 0.8;
        let y = 0.02; P.forEach((q) => { const d = Math.hypot(q.x - x, q.z - z); if (d < 2 * CR) y = Math.max(y, q.y + Math.sqrt(4 * CR * CR - d * d)); });
        if (!best || y < best.y) best = hntV(x, y, z); }
      P.push(best); }
    return P; })();
  // the bucket tips over onto the sand on "black" (it lies on its side, mouth to the heap) and the last dragons tumble out of it
  s.bucketSand.visible = true; const tip = EZ.io(clamp((t - (pour0 - 0.3)) / 0.3)), bR = 0.6 * 0.85 * HNT_K;
  s.bucketSand.position.set(4.4, bR * Math.sin(tip * Math.PI / 2), 0.1); s.bucketSand.rotation.set(0, 0.15, tip * Math.PI / 2);
  const mouth = hntV(2.7, 0.45, 0.1);
  s.pile.forEach((d, i) => { const R = RNG('pileRot', i), rest = s.pileRest[i];
    const late = i >= 30, t0 = pour0 + (i - 30) * 0.045, k = late ? clamp((t - t0) / 0.35) : 1;
    d.visible = !late || t > t0;
    const fall = mouth.clone().lerp(rest, EZ.o2(k)); fall.y += Math.sin(Math.PI * k) * 0.4;
    fall.y += k < 1 ? 0 : 0.12 * Math.abs(Math.sin(clamp((t - t0 - 0.35) * 9) * Math.PI)) * Math.exp(-(t - t0 - 0.35) * 6);
    d.position.copy(late ? fall : rest); d.rotation.set(R.n(0.25) + (late ? (1 - k) * 4 : 0), R.r(0, TAU), R.n(0.2)); });
  // the tally plank fills, then COMMON
  s.tally.visible = true; s.tally.position.set(-0.6, 0, -3.6); s.tally.rotation.y = 0.12;
  const n = Math.round(lerp(22, 52, clamp((t - (blk - 0.3)) / (common - blk + 0.2))));
  hntTallyDraw(s, n, clamp((t - common) / 0.18));
  hntFg(s, [['weed', [-2.6, -3.0, -6], 1.2], ['brick', [2.6, -3.2, -6.5], 0.9, 0.4]], HNT_K32, 's32', lt, { orbit: 0.05, creep: 0.07 });
  hntRender(s, { bg: '#2a2050', bgBlur: hntRack(lt, 's32', 2.2, 3.2), glow: 0.7, bloom: 0.3 });
};

// =====================================================================
//  s33 — "but a green dragon is so rare that finding one is the beach version of winning the lottery.": her torch finds a
//  glow in the sand; she lifts a GREEN dragon high like a winning ticket; the crowd turns, stunned; a gold BEACH LOTTO
//  board rises behind her, its slots spin and land on three green dragons — JACKPOT — and confetti bursts
// =====================================================================
const HNT_K33 = [[0, [-0.2, 1.7, 9.4], [-0.6, 1.2, 3.4], 40], [1.1, [0.2, 5.0, 17.5], [0.2, 4.6, 2.0], 44], [3.6, [-0.4, 7.4, 30], [-0.4, 8.2, 0], 46]];
SHOT_FN['s33'] = (t, u, lt) => {
  const s = hntGet(); hntWorld(s, t, 'dusk');
  const green = hntW('green', 1, 53.9), rare = hntW('rare', 1, 54.8), finding = hntW('finding', 1, 55.3), winning = hntW('winning', 1, 56.7);
  c3SetCam(s.cam, hntCam(HNT_K33, lt, 's33', { orbit: 0.03, creep: 0.03 }));
  const lifted = t > rare - 0.2, lift = EZ.back(clamp((t - (rare - 0.2)) / 0.3));
  s.woman.g.position.set(0.3, HNT_FOOT - 0.5 * (1 - lift), 1.2);
  // the glowing dragon in the sand, then in her pinch, held high
  const pulse = 0.75 + 0.25 * Math.sin(t * 9);
  s.greenSand.visible = !lifted; s.greenSand.position.set(-0.6, 0.02, 3.4); s.greenSand.rotation.set(0, 0.7, 0.05);
  s.greenHalo.visible = true; s.greenHalo.quaternion.copy(s.cam.quaternion);
  const hand = lifted ? [lerp(1.2, 2.3, lift), lerp(0.6, 4.3, lift)] : [1.4, lerp(0.4, -0.3, clamp((t - green) / 0.4))];
  c3PersonPose(s.woman, s.cam, t, { expr: c3FaceAt([[0, 'surprised'], [rare - 0.1, 'starstruck'], [winning, 'laugh']], t, 'woman'), gaze: lifted ? [0.5, 0.9] : [-0.3, -0.9], head: lifted ? [0.06, 0, 0.05] : [0.1, 0, -0.12],
    hand: { armL: hand, armR: lifted ? [-1.6, 3.6 * lift] : [-1.5, 1.4] }, lift: (q) => 0.3 * EZ.back(seg(q, rare - 0.1, rare + 0.05)) * Math.exp(-Math.max(0, q - rare - 0.05) * 4),
    x: t > winning ? ['sparkle', 'stars'] : [], lean: lifted ? 0 : -0.12, ...(lifted ? HNT_STAND : { foot: { legL: [0.7, -2.2], legR: [-0.7, -2.2] } }) });
  s.green.visible = lifted; s.pinch.visible = false;   // no extra hand: the dragon sits on her raised fist
  if (lifted) { const F = s.woman.limbs.armL.e; s.woman.g.updateMatrixWorld(true);   // her real fist (the arm can stop short of the target)
    const fp = s.woman.root.worldToLocal(F.getWorldPosition(hntV(0, 0, 0))), fr = s.woman.LW * 1.45;
    s.green.position.set(fp.x, fp.y + fr * 0.55, fp.z - 0.06); s.green.rotation.set(0, -0.5 + 0.12 * Math.sin(t * 3), 0.1); }   // feet gripped in the fist
  s.woman.g.updateMatrixWorld(true);
  const gp = lifted ? s.green.localToWorld(hntV(0, 0.8, 0)) : s.greenSand.position.clone().add(hntV(0, 0.6, 0));
  s.greenHalo.position.copy(gp); s.greenHalo.scale.setScalar((lifted ? 3.6 : 2.6) * pulse * (t > winning ? 1.4 : 1));
  if (!lifted) hntTorch(s, 0, [-1.5, 1.4], [-0.6, 0, 3.4]);
  // the crowd behind: they turn and stare, torches swinging onto her
  const crowd = [[-6, -4.5], [6.5, -5.5], [-2.5, -9], [9, -10]];
  s.hunters.forEach((h, i) => { h.g.visible = true; const [x, z] = crowd[i]; h.g.position.set(x, HNT_FOOT, z);
    const turn = clamp((t - rare - i * 0.08) / 0.2);
    c3PersonPose(h, s.cam, t, { expr: c3FaceAt([[0, 'thinking'], [rare + i * 0.08, 'shocked'], [winning, i % 2 ? 'starstruck' : 'surprised']], t, h.key), gaze: turn > 0 ? [x < 2 ? 0.7 : -0.7, 0.2] : [0, -0.8],
      hand: { armL: turn > 0.5 && i % 2 ? [1.4, 3.0] : [1.35, 0.8], armR: [-1.5, 1.4] }, lift: (q) => 0.2 * EZ.back(seg(q, rare + i * 0.08, rare + i * 0.08 + 0.1)) * Math.exp(-Math.max(0, q - rare - i * 0.08 - 0.1) * 5), x: turn > 0.5 ? ['exclaim'] : [], ...HNT_STAND });
    hntTorch(s, i + 1, [-1.5, 1.4], turn > 0 ? [lerp(x, 0.3, turn), 0, lerp(z + 4, 2.4, turn)] : [x, 0, z + 4]); });
  // the lottery board rises out of the sand behind her on "finding", spins, lands on "winning"
  const rise = EZ.back(clamp((t - finding) / 0.45));
  s.lotto.visible = t > finding; s.lotto.position.set(-0.6, lerp(-6, 12.7, rise), -4.6); s.lotto.scale.setScalar(0.82); s.lotto.rotation.set(0, 0.02, 0.03 * Math.sin(t * 2));   // whole board in frame, above her
  hntLottoDraw(s, t > finding ? 1 : 0, clamp((t - (winning - 0.5)) / 0.5), t);
  s.bulbs.forEach((b, i) => { const on = (Math.floor(t * 12) + i) % 3 === 0 || t > winning; b.material.color.set(on ? '#fff6c8' : '#8a6a3a'); b.material.userData.glow = on ? '#ffe08a' : undefined; });
  // confetti on "winning"
  s.confetti.visible = t > winning; if (t > winning) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = hntV(0, 0, 0), sc = hntV(1, 1, 1), dt = t - winning;
    for (let i = 0; i < 260; i++) { const R = RNG('conf', i), vx = R.n(9), vy = R.r(4, 12), vz = R.n(3);
      if (i % 2) p.set(-0.6 + vx * dt, 12.7 + vy * dt - 7 * dt * dt, -4 + vz * dt);   // a burst out of the board
      else p.set(R.r(-10, 9) + 0.5 * Math.sin(dt * 5 + i), R.r(14, 24) - dt * R.r(6, 10), R.r(-3, 5));   // and a shower from above
      e.set(R.r(0, 6) + dt * R.r(4, 12), R.r(0, 6) + dt * 7, R.r(0, 6)); q.setFromEuler(e); m4.compose(p, q, sc); s.confetti.setMatrixAt(i, m4); }
    s.confetti.instanceMatrix.needsUpdate = true; }
  hntFg(s, [['grass', [-2.8, -3.2, -7], 1.3], ['brick', [2.8, -3.8, -7.5], 1.0, -0.3]], HNT_K33, 's33', lt, { orbit: 0.03, creep: 0.03 });
  hntRender(s, { bg: '#2a2050', bgBlur: hntRack(lt, 's33', 1.6, 3.0), glow: 0.95, glowBlur: 18, bloom: 0.34 });
};

// =====================================================================
//  s30 — "Ocean scientists even tracked the pieces to learn where floating trash ends up.": a cosy study at night; a giant
//  map of the ocean currents fills the wall; the oceanographer reaches up with a pointer to Cornwall, pins pop in along red
//  strings across the Atlantic, the current arrows march, and on "trash" a swirl of garbage draws itself in the middle
// =====================================================================
function hntMapDraw(L, t, k, trash) {
  const x = L.mapCv.getContext('2d'), w = L.mapCv.width, h = L.mapCv.height;
  x.fillStyle = '#6ec0dc'; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 2; for (let i = 1; i < 12; i++) { x.beginPath(); x.moveTo(i * w / 12, 0); x.lineTo(i * w / 12, h); x.stroke(); } for (let j = 1; j < 6; j++) { x.beginPath(); x.moveTo(0, j * h / 6); x.lineTo(w, j * h / 6); x.stroke(); }
  const blob = (pts) => { x.beginPath(); const P = pts.map(([u, v]) => [u * w, v * h]); const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let q = m(P[P.length - 1], P[0]); x.moveTo(q[0], q[1]); for (let i = 0; i < P.length; i++) { const n = m(P[i], P[(i + 1) % P.length]); x.quadraticCurveTo(P[i][0], P[i][1], n[0], n[1]); } x.closePath();
    x.fillStyle = '#e8d8a4'; x.fill(); x.lineWidth = 6; x.strokeStyle = '#3b2417'; x.stroke(); };
  const LAND = [[[0.06, 0.16], [0.2, 0.08], [0.33, 0.12], [0.31, 0.24], [0.26, 0.33], [0.22, 0.43], [0.17, 0.46], [0.14, 0.36], [0.08, 0.3]],
    [[0.24, 0.5], [0.31, 0.52], [0.34, 0.6], [0.31, 0.72], [0.27, 0.88], [0.24, 0.76], [0.22, 0.6]],
    [[0.49, 0.16], [0.55, 0.13], [0.58, 0.2], [0.56, 0.29], [0.52, 0.33], [0.5, 0.3], [0.5, 0.22]],
    [[0.47, 0.38], [0.56, 0.36], [0.61, 0.45], [0.59, 0.6], [0.55, 0.73], [0.51, 0.62], [0.46, 0.5]],
    [[0.58, 0.13], [0.76, 0.08], [0.92, 0.15], [0.9, 0.28], [0.82, 0.38], [0.71, 0.42], [0.63, 0.36], [0.59, 0.28]],
    [[0.8, 0.62], [0.88, 0.6], [0.91, 0.7], [0.85, 0.75], [0.79, 0.7]],
    [[0.458, 0.22], [0.474, 0.2], [0.482, 0.26], [0.47, 0.295], [0.456, 0.3]]];   // ... and the UK, Cornwall at its south-west tip
  LAND.forEach(blob);
  x.fillStyle = 'rgba(120,170,90,0.45)'; for (const [u, v, r] of [[0.2, 0.25, 50], [0.28, 0.65, 40], [0.53, 0.5, 45], [0.75, 0.25, 70], [0.85, 0.68, 22]]) { x.beginPath(); x.arc(u * w, v * h, r, 0, TAU); x.fill(); }
  // the current gyres: marching dashed loops with arrowheads
  x.setLineDash([26, 18]); x.lineDashOffset = -t * 60; x.lineWidth = 7; x.strokeStyle = '#1e56c8';
  const gyre = (cx, cy, rx, ry, dir) => { x.beginPath(); x.ellipse(cx * w, cy * h, rx * w, ry * h, 0, 0, TAU * 0.92 * k + 0.001, dir < 0); x.stroke(); };
  gyre(0.385, 0.33, 0.075, 0.075, 1); gyre(0.4, 0.64, 0.06, 0.07, -1); gyre(0.7, 0.6, 0.07, 0.07, -1); gyre(0.12, 0.6, 0.07, 0.09, -1);
  x.setLineDash([]);
  for (const [cx, cy, rx, ry, a] of [[0.385, 0.33, 0.075, 0.075, 0.6], [0.4, 0.64, 0.06, 0.07, 3.6], [0.7, 0.6, 0.07, 0.07, 2.2], [0.12, 0.6, 0.07, 0.09, 5.4]]) {
    if (k < 0.3) continue; const px = cx * w + Math.cos(a) * rx * w, py = cy * h + Math.sin(a) * ry * h; x.save(); x.translate(px, py); x.rotate(a + Math.PI / 2); x.fillStyle = '#1e56c8'; x.beginPath(); x.moveTo(18, 0); x.lineTo(-12, -14); x.lineTo(-12, 14); x.fill(); x.restore(); }
  // Cornwall: a star and a label
  x.fillStyle = '#d8322a'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 22, a = i / 10 * TAU - Math.PI / 2; x.lineTo(0.462 * w + Math.cos(a) * r, 0.298 * h + Math.sin(a) * r); } x.fill();
  inked(x, 'CORNWALL', 0.462 * w + 4, 0.298 * h + 44, 26, '#3b2417', { stroke: '#fff6e0', sw: 6 });
  // the garbage patch: a swirl of little coloured bits in the middle of the North Atlantic gyre
  if (trash > 0) { const cx = 0.385 * w, cy = 0.33 * h, R = RNG('trash');
    for (let i = 0; i < 110 * trash; i++) { const a = i * 0.5, r = 6 + i * 0.9; x.fillStyle = ['#d8322a', '#f2c230', '#1c1d24', '#ffffff', '#3aa05a'][i % 5]; x.fillRect(cx + Math.cos(a + t) * r, cy + Math.sin(a + t) * r * 0.9, R.r(6, 12), R.r(6, 12)); }
    inked(x, 'TRASH', cx, cy + 0.095 * h, 34 * clamp(trash * 1.5), '#ffffff', { stroke: '#3b2417', sw: 7 }); }
  L.mapTex.needsUpdate = true;
}
const HNT_MAP = { cx: 0, cy: 8.2, w: 26, h: 13, z: -4 };
const hntMapP = (u, v) => hntV(HNT_MAP.cx - HNT_MAP.w / 2 + u * HNT_MAP.w, HNT_MAP.cy + HNT_MAP.h / 2 - v * HNT_MAP.h, HNT_MAP.z + 0.25);
function hntLab() {
  if (HNT.lab) return HNT.lab;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 400), L = { scene, cam };
  const key = lights(scene, { amb: '#ffe0b8', ambI: 0.5, sky: '#ffd8a8', ground: '#4a2a1a', key: '#ffe2b8', keyI: 0.95, keyP: [10, 18, 20], rim: '#ffb070', rimI: 0.6, rimP: [-12, 12, -6] });
  const wood = c3Prop('#ffffff', { map: texWood(), rough: 0.5 });
  // walls: warm green wallpaper with wainscot; floorboards
  scene.add(pl(80, 40, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#3e5a48'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,240,200,0.12)'; x.lineWidth = 4; for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(i * w / 16, 0); x.lineTo(i * w / 16, h); x.stroke(); } }, 256, 256), rough: 0.8 }), 0, 18, -4.6));
  scene.add(rb(80, 4.5, 0.6, wood, 0, 2.25, -4.4, 0.03));
  const fl = pl(80, 60, c3Prop('#ffffff', { map: (() => { const t = texWood(); t.repeat.set(8, 6); return t; })(), rough: 0.35, metal: 0.05 }), 0, 0, 20, 0, -Math.PI / 2); scene.add(fl);
  // the map board on the wall: a wooden frame, a brass title plate, the live map
  L.mapCv = Object.assign(document.createElement('canvas'), { width: 2048, height: 1024 }); L.mapTex = new THREE.CanvasTexture(L.mapCv); L.mapTex.encoding = THREE.sRGBEncoding; L.mapTex.anisotropy = 8;
  scene.add(rb(HNT_MAP.w + 1.4, HNT_MAP.h + 1.4, 0.5, c3Prop('#6a3e1e', { rough: 0.4 }), HNT_MAP.cx, HNT_MAP.cy, HNT_MAP.z - 0.1, 0.05));
  scene.add(pl(HNT_MAP.w, HNT_MAP.h, c3Prop('#ffffff', { map: L.mapTex, rough: 0.7 }), HNT_MAP.cx, HNT_MAP.cy, HNT_MAP.z + 0.17));
  const plate = rb(7, 1.2, 0.2, c3Prop('#d8b048', { rough: 0.25, metal: 0.8, env: 1.4 }), HNT_MAP.cx, HNT_MAP.cy + HNT_MAP.h / 2 + 0.25, HNT_MAP.z + 0.25, 0.03); scene.add(plate);
  scene.add(pl(6.4, 0.9, c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#d8b048'; x.fillRect(0, 0, w, h); inked(x, 'OCEAN CURRENTS', w / 2, h / 2, h * 0.6, '#3b2417', { stroke: false, maxW: w * 0.9, font: 'Georgia, serif', weight: 700 }); }, 1024, 144) }), HNT_MAP.cx, HNT_MAP.cy + HNT_MAP.h / 2 + 0.25, HNT_MAP.z + 0.37));
  // pins and strings from Cornwall to where the pieces turned up (pop in one by one)
  L.pinAt = [[0.462, 0.298], [0.49, 0.2], [0.44, 0.22], [0.56, 0.2], [0.35, 0.34], [0.27, 0.36], [0.2, 0.43], [0.58, 0.4], [0.33, 0.55], [0.62, 0.62]];
  L.pins = L.pinAt.map(([u, v], i) => { const g = new THREE.Group(); g.position.copy(hntMapP(u, v)); scene.add(g);
    const head = c3Mesh(new THREE.SphereGeometry(0.28, 16, 12), c3Prop(i ? '#d8322a' : '#ffd23c', { rough: 0.2, env: 1.4 }), 0.03); head.position.z = 0.55; g.add(head);
    const nd = cyl(0.04, 0.04, 0.55, c3Chrome(), 0, 0, 0.27, 0, 6); nd.rotation.x = Math.PI / 2; g.add(nd); return g; });
  L.strings = L.pinAt.slice(1).map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), c3Toon('#c8281e')); scene.add(m); return m; });
  // little photo cards of the finds pinned by some pins
  L.cards = [3, 5, 8].map((pi, j) => { const c = pl(1.5, 1.2, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8e4ec'; x.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.66); hntDragonIcon(x, w * 0.5, h * 0.42, 0.9, ['#1c1d24', '#3ee060', '#1c1d24'][j]); }, 256, 200), rough: 0.8 }), 0, 0, 0); c.renderOrder = 2;
    c.position.copy(hntMapP(...L.pinAt[pi])).add(hntV(0.6, -0.75, 0.05)); c.rotation.z = [0.12, -0.1, 0.08][j]; scene.add(c); return c; });
  // the desk at the left with a lamp, jars of finds (labelled), a magnifier and papers; a bookshelf at the right
  const desk = new THREE.Group(); desk.position.set(-8.5, 0, 5); scene.add(desk);
  desk.add(rb(10, 0.6, 5, wood, 0, 4.4, 0, 0.04)); for (const [x, z] of [[-4.4, -2], [4.4, -2], [-4.4, 2], [4.4, 2]]) desk.add(rb(0.5, 4.2, 0.5, wood, x, 2.1, z, 0.03));
  L.lampHead = new THREE.Group(); L.lampHead.position.set(-3, 4.7, -1); desk.add(L.lampHead);
  L.lampHead.add(cyl(0.9, 1.1, 0.3, c3Prop('#2a5a3a', { rough: 0.3, metal: 0.5 }), 0, 0.15, 0, 0.03)); L.lampHead.add(cyl(0.1, 0.1, 3.4, c3Chrome(), 0, 1.9, 0, 0.0, 8));
  const shade = c3Mesh(new THREE.ConeGeometry(1.2, 1.4, 20, 1, true), c3Prop('#2a7a4a', { rough: 0.3, metal: 0.4, side: THREE.DoubleSide }), 0.04); shade.position.set(0.4, 3.6, 0); shade.rotation.z = -0.5; L.lampHead.add(shade);
  const bulb = c3Mesh(new THREE.SphereGeometry(0.42, 14, 10), c3Flat('#fff4c8', { glow: '#ffd890' }), 0); bulb.position.set(0.6, 3.25, 0); L.lampHead.add(bulb);
  { const pL = new THREE.PointLight('#ffd890', 1.2, 30, 1.4); pL.position.set(-11, 8, 4); pL.layers.enableAll(); scene.add(pL); }
  const jarM = new THREE.MeshPhysicalMaterial({ color: '#d8f0ff', roughness: 0.05, transparent: true, opacity: 0.35, envMapIntensity: 1.5, depthWrite: false });
  [['DRAGONS', '#1c1d24', 0], ['FLIPPERS', '#2a6ad8', 1], ['OCTOPUS', '#d8322a', 2]].forEach(([lab, c, i]) => { const j = new THREE.Group(); j.position.set(0.2 + i * 1.7, 4.7, -0.6); desk.add(j);
    for (let k = 0; k < 6; k++) { const R = RNG('jar', i, k), b = hntBrick(c, 1, R.i(1, 2)); b.scale.setScalar(0.45); b.position.set(R.n(0.35), 0.15 + k * 0.2, R.n(0.35)); b.rotation.y = R.r(0, 3); j.add(b); }
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.9, 20), jarM); gl.position.y = 0.95; j.add(gl);
    j.add(cyl(0.74, 0.74, 0.3, c3Prop('#d8b048', { rough: 0.3, metal: 0.7 }), 0, 2.0, 0, 0.02));
    const lb = pl(1.15, 0.5, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); inked(x, lab, w / 2, h / 2, h * 0.5, '#3b2417', { stroke: false, maxW: w * 0.9 }); }, 256, 112) }), 0, 0.9, 0.72); j.add(lb); });
  const papers = pl(3, 2.2, c3Prop('#fbf6ea', { rough: 0.9 }), 2.8, 4.72, 1.2, 0, -Math.PI / 2); papers.rotation.z = 0.2; desk.add(papers);
  const shelf = new THREE.Group(); shelf.position.set(11, 0, -2.6); scene.add(shelf);
  shelf.add(rb(6, 16, 2, wood, 0, 8, 0, 0.04));
  for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) { const R = RNG('book', i, j), bh = R.r(1.6, 2.4); shelf.add(rb(0.6, bh, 1.6, c3Toon(['#a8322a', '#2a5a8a', '#d8a030', '#3a7a4a', '#6a3a7a'][(i + j) % 5]), -2.3 + i * 0.75, 1.2 + j * 3 + bh / 2, 0.3, 0.02)); }
  // a globe on a stand (foreground at the right), the oceanographer with a long pointer
  L.sci = c3Person({ key: 'sci', outfit: 'white', hairStyle: 'brown', fx: ['glasses_square'] }); L.sci.g.scale.setScalar(HNT_K); scene.add(L.sci.g);
  L.pointer = cyl(0.06, 0.03, 1, c3Toon('#a8682e'), 0, 0, 0, 0.012, 8); scene.add(L.pointer);
  [L.sci.g, L.pointer, ...L.pins, ...L.strings, ...L.cards, desk].forEach((o) => c3Layer(o, C3.L_FOCUS));
  L.fgBy = {
    globe: (() => { const g = new THREE.Group(); const gl = c3Mesh(new THREE.SphereGeometry(2.2, 28, 18), c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#6ec0dc'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8d8a4'; const R = RNG('glb'); for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(R.r(0, w), R.r(h * 0.15, h * 0.85), R.r(20, 60), R.r(15, 50), R.r(0, 3), 0, TAU); x.fill(); } }, 512, 256), rough: 0.35, env: 1.2 }), 0.04);
      g.add(gl); const ring = c3Mesh(new THREE.TorusGeometry(2.45, 0.1, 8, 40, Math.PI * 1.3), c3Prop('#d8b048', { rough: 0.3, metal: 0.8 }), 0.02); ring.rotation.z = 0.4; g.add(ring); return g; })(),
    lamp: (() => { const g = new THREE.Group(); const sh = c3Mesh(new THREE.ConeGeometry(2.2, 2.4, 20, 1, true), c3Prop('#2a7a4a', { rough: 0.3, metal: 0.4, side: THREE.DoubleSide }), 0.05); g.add(sh); const b = c3Mesh(new THREE.SphereGeometry(0.8, 14, 10), c3Flat('#fff4c8', { glow: '#ffd890' }), 0); b.position.y = -0.6; g.add(b); return g; })(),
    jar: (() => { const g = new THREE.Group(); const gl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4, 20), jarM); g.add(gl); for (let k = 0; k < 8; k++) { const R = RNG('fgjar', k), d = hntDragon('#1c1d24'); d.scale.setScalar(0.6); d.position.set(R.n(0.8), -1.5 + k * 0.4, R.n(0.6)); d.rotation.y = R.r(0, 6); g.add(d); } return g; })(),
  };
  L.fg = Object.values(L.fgBy); L.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#ffd8a8', mid: '#6a4a3a', bot: '#1a0e08', cards: [[0, 30, 10, 30, 6, '#fff0d0'], [-20, 10, 10, 8, 14, '#ffd890'], [20, 10, -10, 8, 14, '#c8e0ff']] });
  c3Shadows(scene, key, 30);
  return (HNT.lab = L);
}
const HNT_K30 = [[0, [0.4, 8.6, 20], [-0.6, 8.8, -4], 46], [4.1, [-1.0, 8.8, 19.6], [-1.4, 9.0, -4], 46]];
SHOT_FN['s30'] = (t, u, lt) => {
  const L = hntLab();
  const sci = hntW('scientists', 1, 45.5), tracked = hntW('tracked', 1, 46.2), pieces = hntW('pieces', 2, 46.9), learn = hntW('learn', 1, 47.5), trash = hntW('trash', 1, 48.3);
  c3SetCam(L.cam, hntCam(HNT_K30, lt, 's30', { orbit: 0.02, creep: 0.04 }));
  // the map: gyres draw in, the garbage swirl on "trash"
  hntMapDraw(L, t, clamp((t - 45.2) / 1.6), clamp((t - (trash - 0.1)) / 0.6));
  // pins pop in along strings from Cornwall ("tracked the pieces")
  const P0 = hntMapP(...L.pinAt[0]);
  L.pins.forEach((g, i) => { const t0 = i === 0 ? sci : tracked + (i - 1) * 0.12, k = clamp((t - t0) / 0.18); g.visible = t > t0; g.scale.setScalar(EZ.back(k) + 1e-3); });
  L.strings.forEach((m, i) => { const t0 = tracked + i * 0.12, k = EZ.o2(clamp((t - t0) / 0.25)); m.visible = t > t0; const P1 = hntMapP(...L.pinAt[i + 1]), end = P0.clone().lerp(P1, k);
    const d = end.clone().sub(P0), len = d.length(); m.scale.set(1, Math.max(1e-3, len), 1); m.position.copy(P0).addScaledVector(d, 0.5).add(hntV(0, 0, 0.32)); m.quaternion.setFromUnitVectors(hntV(0, 1, 0), d.normalize()); });
  L.cards.forEach((c, j) => { const t0 = pieces + j * 0.2; c.visible = t > t0; c.scale.setScalar(EZ.back(clamp((t - t0) / 0.2)) + 1e-3); });
  // the oceanographer: points at Cornwall, then sweeps the pointer to the garbage swirl on "trash"
  L.sci.g.position.set(1.4, HNT_FOOT, 2.4);
  const handTgt = c3Hold([[0, [-1.6, 3.0]], [trash, [-1.9, 3.3]]], t, 6 / 30);
  c3PersonPose(L.sci, L.cam, t, { expr: c3FaceAt([[0, 'thinking'], [tracked, 'determined'], [learn, 'talking'], [trash, 'surprised']], t, 'sci'), gaze: [-0.8, 0.6], head: [0.1, 0, 0.04],
    hand: { armR: handTgt, armL: [1.4, 1.0] }, lift: (q) => 0.12 * EZ.back(seg(q, trash - 0.02, trash + 0.08)) * Math.exp(-Math.max(0, q - trash - 0.08) * 5), x: t > trash ? ['exclaim'] : [], ...HNT_STAND });
  L.sci.g.updateMatrixWorld(true);
  const a = L.sci.root.localToWorld(hntV(handTgt[0], handTgt[1], 0.15)), trashP = hntMapP(0.385, 0.33);
  const b = c3Hold([[0, P0.toArray()], [trash, trashP.toArray()]], t, 6 / 30), bv = hntV(b[0], b[1], b[2] + 0.2), d = bv.clone().sub(a), len = d.length();
  L.pointer.scale.set(1, len, 1); L.pointer.position.copy(a).addScaledVector(d, 0.5); L.pointer.quaternion.setFromUnitVectors(hntV(0, 1, 0), d.normalize());
  // foreground: a jar of dragons drifting past at the bottom right, a lamp shade at the top left
  hntFg(L, [['lamp', [-3.0, 4.6, -8], 0.8], ['jar', [3.4, -4.8, -9], -1.0]], HNT_K30, 's30', lt, { orbit: 0.02, creep: 0.04 });
  c3Render(L.scene, L.cam, { bg: '#1a120c', bgBlur: hntRack(lt, 's30', 0.6, 1.6), nearBlur: 10, glow: 0.65, glowBlur: 16, bloom: 0.28 });
};
