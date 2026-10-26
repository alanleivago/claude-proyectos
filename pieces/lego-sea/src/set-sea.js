// =====================================================================
//  SET sea — under the sea: s18 s19 s20 s21 s22 s23 s24 s27 s28 s34 s35.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed sea.
//  One world, built once: a sandy seabed (ripples + moving caustics), rocks, coral, swaying kelp, god rays from a
//  bright rippling surface, drifting marine snow and bubbles, fog that fades the distance into blue. Stations along x:
//    A (0)     the toy-set boxes that sink and land (s18, s19); the sea box opens, tanks and spear guns float up (s20, s21)
//    C (64)    a kelp patch with toy seaweed planted in it, a fish bites one (s22)
//    D (92)    a rock with toy octopuses, a real octopus peeks up (s23)
//    E (122)   the fish's museum shelf: "THE OCEAN'S COLLECTION" (s24)
//    F (-36)   one red brick next to a sunken clock and a year sign that rolls 1997 -> 2026 (s27)
//    G (-74)   mid-water currents (ribbons) carrying pieces (s28)
//    H (-120)  the lost container on the seabed; pieces trickle out of its door (s34, s35)
//  Toy pieces are chunky glossy plastic with studs (scale: a 2x2 brick ~1.6 wide); creatures are toon with 3D eyes.
// =====================================================================
const SEA = {};
const SEA_FOG = '#17698f';
const seaW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const seaV = (x, y, z) => new THREE.Vector3(x, y, z);
const seaSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function seaCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = seaSpan(id), dur = b - a;
  const P = seaV(...c.p), L = seaV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(seaV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  const sway = o.sway ?? 0.12;   // underwater: the camera floats (a slow bob)
  const p = L.clone().add(off).add(d.multiplyScalar(dist * push)).add(seaV(Math.sin(lt * 0.9) * sway, Math.sin(lt * 1.3 + 1) * sway, 0));
  return { p: p.toArray(), l: c.l, fov: c.fov };
}
const seaRack = (lt, id, a, b) => { const [t0, t1] = seaSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the
// camera moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function seaFg(s, list, K, id, lt, o = {}) {
  const c = SEA.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 900);
  c3SetCam(c, seaCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = seaV(1, 0, 0).transformDirection(c.matrixWorld), up = seaV(0, 1, 0);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz, rise]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(seaV(...at))).addScaledVector(right, (drift ?? 1.2) * lt).addScaledVector(up, (rise ?? 0) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
// (seaRender is defined with the per-frame world below)

// ---- small geometry helpers
function seaMerge(geos) {   // merge non-indexed-compatible geometries (position, normal, uv, index)
  const out = new THREE.BufferGeometry(), P = [], N = [], U = [], I = []; let off = 0;
  for (const g of geos) {
    const gi = g.index ? g : g; const p = gi.attributes.position.array, n = gi.attributes.normal.array, u = gi.attributes.uv.array;
    P.push(...p); N.push(...n); U.push(...u);
    if (gi.index) for (const k of gi.index.array) I.push(k + off); else for (let k = 0; k < p.length / 3; k++) I.push(k + off);
    off += p.length / 3;
  }
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); out.setIndex(I); return out;
}
// a tapered tube whose spine can change every frame (tentacles, ropes, ribbons). update(points[N+1])
function seaTube(N, M, r0, r1, mat, ink) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array((N + 1) * (M + 1) * 3), uv = new Float32Array((N + 1) * (M + 1) * 2), idx = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) { uv[(i * (M + 1) + j) * 2] = j / M; uv[(i * (M + 1) + j) * 2 + 1] = i / N; }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = (i + 1) * (M + 1) + j; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  const mesh = c3Mesh(geo, mat, ink); mesh.frustumCulled = false; mesh.children.forEach((h) => { h.frustumCulled = false; });
  const T = seaV(0, 0, 0), Nn = seaV(0, 0, 1), B = seaV(0, 0, 0), v = seaV(0, 0, 0);
  mesh.userData.update = (Ps, rf) => {
    for (let i = 0; i <= N; i++) {
      T.copy(Ps[Math.min(N, i + 1)]).sub(Ps[Math.max(0, i - 1)]).normalize();
      if (i === 0) { Nn.set(0, 1, 0); if (Math.abs(T.dot(Nn)) > 0.9) Nn.set(1, 0, 0); }
      Nn.addScaledVector(T, -T.dot(Nn)).normalize(); B.crossVectors(T, Nn);
      const r = rf ? rf(i / N) : lerp(r0, r1, i / N);
      for (let j = 0; j <= M; j++) { const a = (j / M) * TAU; v.copy(Ps[i]).addScaledVector(Nn, Math.cos(a) * r).addScaledVector(B, Math.sin(a) * r);
        const k = (i * (M + 1) + j) * 3; pos[k] = v.x; pos[k + 1] = v.y; pos[k + 2] = v.z; }
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
  };
  return mesh;
}
const seaPlastic = (c, o = {}) => c3Prop(c, { rough: 0.28, env: 0.75, ...o });
// a lumpy rock: a sphere pushed in and out by a few sines (smooth normals), squashed
function seaRockGeo(r, seed, squash = 0.6) {
  const g = new THREE.SphereGeometry(r, 28, 18), p = g.attributes.position, R = RNG('rock', seed), k = [R.r(1, 3), R.r(1, 3), R.r(1, 3), R.r(0, 6), R.r(0, 6)];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + 0.16 * Math.sin(x * k[0] / r * 2 + k[3]) * Math.sin(z * k[1] / r * 2 + k[4]) + 0.1 * Math.sin(y * k[2] / r * 3 + k[3]);
    p.setXYZ(i, x * n, Math.max(y * n * squash, -r * 0.25), z * n); }
  g.computeVertexNormals(); return g;
}

// ---- textures
function seaTexSand() {
  const t = tex((x, w, h) => { x.fillStyle = '#d6b678'; x.fillRect(0, 0, w, h); const R = RNG('sand');
    for (let j = 0; j < h; j += 2) { const v = Math.sin(j / h * TAU * 7 + Math.sin(j * 0.05) * 0.8); x.fillStyle = v > 0.55 ? 'rgba(255,236,190,0.22)' : v < -0.6 ? 'rgba(150,110,60,0.22)' : 'rgba(0,0,0,0)'; x.fillRect(0, j, w, 2); }
    for (let i = 0; i < 2400; i++) { x.fillStyle = R.f() < 0.5 ? 'rgba(120,90,50,0.35)' : 'rgba(255,250,230,0.5)'; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
    for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(${R.r(200, 255)},${R.r(150, 220)},${R.r(150, 200)},0.8)`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), 5, 3, R.r(0, 3), 0, TAU); x.fill(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40); return t;
}
function seaTexCaustic() {   // a tileable web of bright lines (cellular edges)
  const S = 256, R = RNG('caustic'), pts = [...Array(18)].map(() => [R.r(0, S), R.r(0, S)]);
  const t = tex((x, w, h) => { const im = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { let d1 = 1e9, d2 = 1e9;
      for (const [px, py] of pts) for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const d = Math.hypot(i - px - ox, j - py - oy); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
      const e = clamp(1 - (d2 - d1) / 7); const v = Math.round(255 * e ** 1.6), k = (j * S + i) * 4; im.data[k] = v; im.data[k + 1] = v; im.data[k + 2] = v; im.data[k + 3] = 255; }
    x.putImageData(im, 0, 0); }, S, S, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function seaTexRay() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'destination-in'; const r = x.createLinearGradient(0, 0, w, 0);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(0.3, '#000'); r.addColorStop(0.7, '#000'); r.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = r; x.fillRect(0, 0, w, h); }, 64, 256, false); }
function seaTexSurface() {
  const t = tex((x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const R = RNG('surf');
    for (let i = 0; i < 90; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.save(); x.translate(R.r(0, w), R.r(0, h)); x.rotate(R.r(0, 3)); x.scale(R.r(20, 60), R.r(5, 14)); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, TAU); x.fill(); x.restore(); } }, 512, 512, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t;
}
function seaTexKelp(hue) {   // one long frond with wavy edges, a lighter midrib (alpha cut-out)
  return tex((x, w, h) => { x.clearRect(0, 0, w, h); const P = new Path2D(); P.moveTo(w / 2 - 6, h);
    for (let j = 0; j <= 20; j++) { const y = h - j / 20 * h, ww = w * (0.18 + 0.26 * Math.sin(j / 20 * Math.PI) ** 0.7) + Math.sin(j * 1.9) * 6; P.lineTo(w / 2 - ww, y); }
    for (let j = 20; j >= 0; j--) { const y = h - j / 20 * h, ww = w * (0.18 + 0.26 * Math.sin(j / 20 * Math.PI) ** 0.7) + Math.cos(j * 1.7) * 6; P.lineTo(w / 2 + ww, y); }
    P.closePath(); const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, `hsl(${hue},55%,18%)`); g.addColorStop(1, `hsl(${hue + 12},70%,42%)`);
    x.fillStyle = g; x.fill(P); x.lineWidth = 5; x.strokeStyle = `hsl(${hue},60%,12%)`; x.stroke(P);
    x.strokeStyle = `hsla(${hue + 20},80%,70%,0.6)`; x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2, h); x.bezierCurveTo(w / 2 - 6, h * 0.6, w / 2 + 6, h * 0.3, w / 2, 0); x.stroke(); }, 128, 512);
}
function seaTexSpots(base, spot, n = 26, seed = 1) {
  return tex((x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); const R = RNG('spots', seed); x.fillStyle = spot;
    for (let i = 0; i < n; i++) { x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(6, 16), R.r(5, 12), R.r(0, 3), 0, TAU); x.fill(); } }, 256, 256);
}
function seaTexStripes(base, stripe) {   // a clownfish: white bands with dark edges (u runs around, v along the body)
  return tex((x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (const c of [0.3, 0.55, 0.8]) { x.fillStyle = '#2a1408'; x.fillRect(c * w - w * 0.055, 0, w * 0.11, h); x.fillStyle = stripe; x.fillRect(c * w - w * 0.04, 0, w * 0.08, h); } }, 256, 128);
}
const SEA_THEMES = {
  castle: { bg: ['#4a6ad8', '#9ab8ff'], title: 'KNIGHTS CASTLE', sea: false },
  space: { bg: ['#141a4a', '#4a2a8a'], title: 'SPACE BASE', sea: false },
  diver: { bg: ['#0a6ab8', '#3ad0f0'], title: 'DEEP DIVERS', sea: true },
  sub: { bg: ['#0a4a8a', '#2aa8d8'], title: 'SUB EXPLORER', sea: true },
  reef: { bg: ['#0a7a9a', '#5ae0d0'], title: 'REEF RESCUE', sea: true },
  octo: { bg: ['#1a3a8a', '#3a9ad8'], title: 'OCTOPUS COVE', sea: true },
};
function seaTexBox(theme) {   // a toy-set box front: sky/sea gradient, a picture, title band, age and piece count; sea sets wear a wave emblem
  const T = SEA_THEMES[theme];
  return tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, T.bg[1]); g.addColorStop(1, T.bg[0]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('boxart', theme), ink = '#1a1020';
    const blob = (cx, cy, rx, ry, c) => { x.fillStyle = c; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill(); x.lineWidth = 4; x.strokeStyle = ink; x.stroke(); };
    const box = (bx, by, bw, bh, c) => { x.fillStyle = c; x.fillRect(bx, by, bw, bh); x.lineWidth = 4; x.strokeStyle = ink; x.strokeRect(bx, by, bw, bh); };
    if (theme === 'castle') { x.fillStyle = '#5aa84a'; x.fillRect(0, h * 0.78, w, h); box(w * 0.22, h * 0.38, w * 0.56, h * 0.42, '#9aa0aa'); box(w * 0.12, h * 0.26, w * 0.16, h * 0.54, '#8a909a'); box(w * 0.72, h * 0.26, w * 0.16, h * 0.54, '#8a909a');
      for (let i = 0; i < 4; i++) { box(w * (0.12 + i * 0.05), h * 0.22, w * 0.03, h * 0.05, '#8a909a'); box(w * (0.72 + i * 0.05), h * 0.22, w * 0.03, h * 0.05, '#8a909a'); }
      box(w * 0.44, h * 0.58, w * 0.12, h * 0.22, '#5a3a1a'); x.fillStyle = '#e83a2a'; x.beginPath(); x.moveTo(w * 0.2, h * 0.08); x.lineTo(w * 0.32, h * 0.12); x.lineTo(w * 0.2, h * 0.16); x.fill(); x.fillRect(w * 0.195, h * 0.08, 4, h * 0.15); }
    if (theme === 'space') { for (let i = 0; i < 60; i++) { x.fillStyle = '#fff'; x.fillRect(R.r(0, w), R.r(0, h * 0.8), 3, 3); } blob(w * 0.78, h * 0.3, w * 0.12, w * 0.12, '#e88a3a');
      x.save(); x.translate(w * 0.42, h * 0.5); x.rotate(-0.5); box(-w * 0.07, -h * 0.25, w * 0.14, h * 0.42, '#f4f4f8'); x.fillStyle = '#e83a2a'; x.beginPath(); x.moveTo(-w * 0.07, -h * 0.25); x.lineTo(0, -h * 0.38); x.lineTo(w * 0.07, -h * 0.25); x.fill(); x.stroke();
      blob(0, -h * 0.1, w * 0.035, w * 0.035, '#3ac8ff'); x.fillStyle = '#ffb83a'; x.beginPath(); x.moveTo(-w * 0.05, h * 0.17); x.lineTo(0, h * 0.34); x.lineTo(w * 0.05, h * 0.17); x.fill(); x.restore(); }
    if (T.sea) {   // sea floor, bubbles, then the theme's hero
      x.fillStyle = '#e6c88a'; x.beginPath(); x.moveTo(0, h * 0.82); x.quadraticCurveTo(w / 2, h * 0.72, w, h * 0.84); x.lineTo(w, h); x.lineTo(0, h); x.fill();
      for (let i = 0; i < 4; i++) { x.fillStyle = '#2a9a4a'; x.beginPath(); const bx = R.r(0, w); x.moveTo(bx, h * 0.84); x.quadraticCurveTo(bx + 20, h * 0.6, bx - 6, h * 0.48); x.quadraticCurveTo(bx + 10, h * 0.62, bx + 14, h * 0.84); x.fill(); }
      for (let i = 0; i < 12; i++) { x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 3; x.beginPath(); x.arc(R.r(0, w), R.r(h * 0.15, h * 0.7), R.r(4, 10), 0, TAU); x.stroke(); }
      if (theme === 'diver') {   // a diver: yellow tank on the back, black wetsuit, mask, blue flippers, arms out
        x.save(); x.translate(w * 0.5, h * 0.45); x.rotate(-0.25);
        box(w * 0.06, -h * 0.14, w * 0.07, h * 0.24, '#f6c21a');
        x.fillStyle = '#1a1a24'; x.beginPath(); x.roundRect(-w * 0.07, -h * 0.12, w * 0.14, h * 0.26, 18); x.fill(); x.lineWidth = 4; x.strokeStyle = ink; x.stroke();
        x.strokeStyle = '#1a1a24'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(-w * 0.06, -h * 0.06); x.lineTo(-w * 0.17, -h * 0.14); x.moveTo(w * 0.06, -h * 0.06); x.lineTo(w * 0.15, h * 0.02); x.moveTo(-w * 0.04, h * 0.13); x.lineTo(-w * 0.06, h * 0.25); x.moveTo(w * 0.03, h * 0.13); x.lineTo(w * 0.05, h * 0.25); x.stroke();
        blob(0, -h * 0.2, w * 0.065, w * 0.065, '#ffe8cc'); blob(0, -h * 0.205, w * 0.055, w * 0.03, '#7ad8ff'); x.fillStyle = '#1a1a24'; x.fillRect(-w * 0.06, -h * 0.22, w * 0.12, 5);
        x.fillStyle = '#2a6ad8'; for (const sx of [-0.06, 0.05]) { x.beginPath(); x.moveTo(w * sx - 10, h * 0.25); x.lineTo(w * sx + 10, h * 0.25); x.lineTo(w * sx + 22, h * 0.34); x.lineTo(w * sx - 22, h * 0.34); x.closePath(); x.fill(); x.stroke(); }
        x.restore(); }
      if (theme === 'sub') { blob(w * 0.5, h * 0.45, w * 0.26, h * 0.13, '#f6c21a'); box(w * 0.44, h * 0.27, w * 0.1, h * 0.08, '#f6c21a'); for (const k of [-1, 0, 1]) blob(w * (0.5 + k * 0.1), h * 0.45, w * 0.035, w * 0.035, '#9ae0ff'); }
      if (theme === 'reef') { for (let i = 0; i < 3; i++) { const cx = w * (0.3 + i * 0.2), cy = h * (0.4 + (i % 2) * 0.12); blob(cx, cy, w * 0.08, h * 0.05, i === 1 ? '#ff7a2a' : '#ffd23c'); x.fillStyle = '#fff'; x.fillRect(cx - 3, cy - h * 0.05, 6, h * 0.1); x.fillStyle = ink; x.beginPath(); x.arc(cx + w * 0.045, cy - 4, 4, 0, TAU); x.fill(); } }
      if (theme === 'octo') { blob(w * 0.5, h * 0.4, w * 0.13, h * 0.12, '#c8281e'); x.strokeStyle = '#c8281e'; x.lineWidth = 12; x.lineCap = 'round';
        for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(w * (0.4 + k * 0.04), h * 0.5); x.quadraticCurveTo(w * (0.3 + k * 0.08), h * 0.7, w * (0.36 + k * 0.06), h * 0.66); x.stroke(); }
        blob(w * 0.46, h * 0.38, 9, 11, '#fff'); blob(w * 0.54, h * 0.38, 9, 11, '#fff'); }
      // the wave emblem (lights up on "sea themed")
      x.save(); x.translate(w * 0.86, h * 0.14); blob(0, 0, w * 0.1, w * 0.1, '#ffffff'); x.strokeStyle = '#1a6ad8'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath();
      x.moveTo(-w * 0.07, w * 0.015); x.bezierCurveTo(-w * 0.04, -w * 0.05, 0, -w * 0.05, w * 0.01, w * 0.0); x.bezierCurveTo(w * 0.02, w * 0.035, w * 0.05, w * 0.03, w * 0.07, -w * 0.01); x.stroke(); x.restore();
    }
    if (theme === 'castle' || theme === 'space') { x.fillStyle = 'rgba(0,0,0,0)'; }
    // title band, age, pieces
    x.fillStyle = '#ffd23c'; x.fillRect(0, h * 0.86, w, h * 0.14); x.fillStyle = ink; x.fillRect(0, h * 0.86, w, 4);
    inked(x, T.title, w * 0.42, h * 0.93, h * 0.075, '#1a1020', { stroke: false, maxW: w * 0.66 });
    x.fillStyle = '#e83a2a'; x.beginPath(); x.roundRect(w * 0.04, h * 0.04, w * 0.16, h * 0.11, 10); x.fill();
    inked(x, '6+', w * 0.12, h * 0.095, h * 0.075, '#ffffff', { stroke: false });
    inked(x, `${R.i(120, 480)} pcs`, w * 0.88, h * 0.93, h * 0.05, '#1a1020', { stroke: false, maxW: w * 0.2 });
  }, 512, 384);
}
function seaTexInside() {   // the open box: a jumble of coloured pieces in a dark tray
  return tex((x, w, h) => { x.fillStyle = '#2a1a14'; x.fillRect(0, 0, w, h); const R = RNG('inside');
    for (let i = 0; i < 70; i++) { x.fillStyle = R.pick(['#e83a2a', '#f6c21a', '#2a6ad8', '#3fbf4a', '#f4f4f8', '#1a1a20', '#ff7a2a']); const bw = R.r(20, 60), bh = R.r(14, 30);
      x.save(); x.translate(R.r(0, w), R.r(0, h)); x.rotate(R.r(0, 3)); x.fillRect(-bw / 2, -bh / 2, bw, bh); x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 2; x.strokeRect(-bw / 2, -bh / 2, bw, bh); x.restore(); } }, 256, 192);
}
function seaTexPlaque(txt, sub) { return tex((x, w, h) => { x.fillStyle = '#d8b46a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a5a2a'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8);
  inked(x, txt, w / 2, h * 0.42, h * 0.3, '#3a2410', { stroke: false, maxW: w * 0.86 }); if (sub) inked(x, sub, w / 2, h * 0.76, h * 0.17, '#5a3a1a', { stroke: false, maxW: w * 0.8 }); }, 256, 96); }
function seaTexSign(txt) { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#a8784a'); g.addColorStop(1, '#7a5230'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('drift'); x.strokeStyle = 'rgba(60,30,10,0.4)'; for (let i = 0; i < 18; i++) { x.lineWidth = R.r(1, 3); x.beginPath(); const y = R.r(0, h); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(8), w * 2 / 3, y + R.n(8), w, y); x.stroke(); }
  inked(x, txt, w / 2, h / 2 + 2, h * 0.46, '#fff4d8', { stroke: '#3a1e0a', sw: h * 0.06, maxW: w * 0.9 }); }, 1024, 160); }
function seaTexSign2(a, b) { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#a8784a'); g.addColorStop(1, '#7a5230'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('drift2'); x.strokeStyle = 'rgba(60,30,10,0.4)'; for (let i = 0; i < 22; i++) { x.lineWidth = R.r(1, 3); x.beginPath(); const y = R.r(0, h); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(8), w * 2 / 3, y + R.n(8), w, y); x.stroke(); }
  inked(x, a, w / 2, h * 0.3, h * 0.26, '#fff4d8', { stroke: '#3a1e0a', sw: h * 0.04, maxW: w * 0.9 }); inked(x, b, w / 2, h * 0.7, h * 0.3, '#ffd23c', { stroke: '#3a1e0a', sw: h * 0.045, maxW: w * 0.92 }); }, 1024, 360); }
function seaTexContainer() {   // corrugated steel, rust red, rust streaks, a faded stencil
  return tex((x, w, h) => { x.fillStyle = '#a8402a'; x.fillRect(0, 0, w, h); const R = RNG('cont');
    for (let i = 0; i < 48; i++) { x.fillStyle = i % 2 ? 'rgba(0,0,0,0.18)' : 'rgba(255,200,170,0.10)'; x.fillRect(i * w / 48, 0, w / 48, h); }
    for (let i = 0; i < 40; i++) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(90,40,10,0.0)'); g.addColorStop(0.3, 'rgba(110,50,15,0.45)'); g.addColorStop(1, 'rgba(60,30,10,0)');
      x.fillStyle = g; x.fillRect(R.r(0, w), R.r(-h * 0.2, h * 0.4), R.r(3, 14), R.r(h * 0.3, h)); }
    x.globalAlpha = 0.55; inked(x, 'TEXU 471 997 2', w * 0.3, h * 0.2, h * 0.09, '#f4ece0', { stroke: false, maxW: w * 0.45 }); inked(x, 'MAX GROSS 30480 KG', w * 0.3, h * 0.32, h * 0.05, '#f4ece0', { stroke: false, maxW: w * 0.4 });
    x.globalAlpha = 1; x.fillStyle = 'rgba(60,110,70,0.5)'; for (let i = 0; i < 30; i++) { x.beginPath(); x.ellipse(R.r(0, w), h - R.r(0, h * 0.25), R.r(10, 40), R.r(6, 16), 0, 0, TAU); x.fill(); } }, 1024, 512);
}
function seaTexClockFace() {
  return tex((x, w, h) => { x.fillStyle = '#f2e6c8'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.48, 0, TAU); x.fill();
    x.fillStyle = '#2a2018'; x.font = `700 ${w * 0.11}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - Math.PI / 2; x.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], w / 2 + Math.cos(a) * w * 0.36, h / 2 + Math.sin(a) * h * 0.36); }
    x.strokeStyle = 'rgba(90,70,40,0.5)'; x.lineWidth = 3; x.beginPath(); x.arc(w / 2, h / 2, w * 0.44, 0, TAU); x.stroke(); }, 512, 512);
}
function seaTexChevron() {   // current ribbons: soft cyan with bright chevrons running along v (the tube's length)
  const t = tex((x, w, h) => { x.fillStyle = 'rgba(120,230,255,0.22)'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(230,255,255,0.95)'; x.lineWidth = 9; x.lineJoin = 'round'; x.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const cy = (i + 0.5) * h / 4; x.beginPath(); x.moveTo(w * 0.12, cy - 16); x.lineTo(w * 0.5, cy + 12); x.lineTo(w * 0.88, cy - 16); x.stroke(); } }, 64, 256, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// ---- toy pieces (origin at the base centre; glossy plastic, studs on top, a thin ink line)
const SEA_P = 0.8;   // stud pitch
function seaBrick(wN, dN, color, o = {}) {
  const g = new THREE.Group(), M = seaPlastic(color), hh = o.plate ? 0.32 : 0.96;
  g.add(c3Put(c3Mesh(c3RBox(wN * SEA_P, hh, dN * SEA_P, 0.07), M, 0.02), 0, hh / 2, 0));
  const sg = SEA.studGeo ||= new THREE.CylinderGeometry(0.24, 0.24, 0.18, 18);
  for (let i = 0; i < wN; i++) for (let j = 0; j < dN; j++) g.add(c3Put(c3Mesh(sg, M, 0.015), (i - (wN - 1) / 2) * SEA_P, hh + 0.09, (j - (dN - 1) / 2) * SEA_P));
  return g;
}
function seaTank() {   // twin yellow scuba tanks on a dark back plate, a grey valve bar on top
  const g = new THREE.Group(), Y = seaPlastic('#f6c21a'), G = seaPlastic('#9aa2ae', { metal: 0.3 }), K = seaPlastic('#22232a');
  for (const x of [-0.37, 0.37]) {
    g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.7, 22), Y, 0.02), x, 1.05, 0));
    g.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.34, 22, 12, 0, TAU, 0, Math.PI / 2), Y, 0.02), x, 1.9, 0, 0, 0, 0, [1, 0.75, 1]));
    g.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.34, 22, 12, 0, TAU, Math.PI / 2, Math.PI / 2), Y, 0.02), x, 0.2, 0, 0, 0, 0, [1, 0.5, 1]));
  }
  g.add(c3Put(c3Mesh(c3RBox(1.15, 0.18, 0.22, 0.06), G, 0.015), 0, 2.2, 0)); g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 12), G, 0.015), 0, 2.4, 0));
  g.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.14, 12, 8), G, 0.015), 0, 2.6, 0));
  g.add(c3Put(c3Mesh(c3RBox(1.3, 1.1, 0.16, 0.05), K, 0.015), 0, 1.15, -0.36));
  g.add(c3Put(c3Mesh(c3RBox(1.4, 0.2, 0.86, 0.06), K, 0.015), 0, 0.75, 0));   // the strap
  return g;
}
function seaGun() {   // a chunky toy spear gun along +x: barrel, stock, grip, two orange bands and a loaded spear
  const g = new THREE.Group(), D = seaPlastic('#3a3f4a'), K = seaPlastic('#17181d'), O = seaPlastic('#ff7a1a'), C = c3Chrome('#e8ecf4');
  g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.6, 16), D, 0.02), 0.5, 0.9, 0, 0, 0, Math.PI / 2));
  g.add(c3Put(c3Mesh(c3RBox(1.3, 0.44, 0.34, 0.1), K, 0.02), -1.2, 0.9, 0));
  g.add(c3Put(c3Mesh(c3RBox(0.32, 1.0, 0.3, 0.1), K, 0.02), -0.55, 0.38, 0, 0, 0, 0.25));
  g.add(c3Put(c3Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16), K, 0.0), -0.2, 0.58, 0));
  for (const x of [1.45, 1.65]) g.add(c3Put(c3Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 18), O, 0.01), x, 0.95, 0, Math.PI / 2));
  const spear = new THREE.Group(); spear.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 10), C, 0.0), 0, 0, 0, 0, 0, Math.PI / 2));
  spear.add(c3Put(c3Mesh(new THREE.ConeGeometry(0.15, 0.45, 12), C, 0.012), 1.65, 0, 0, 0, 0, -Math.PI / 2));
  spear.position.set(0.75, 1.15, 0); g.add(spear);
  return { g, spear };
}
function seaToyWeed(color = '#14a02a') {   // a stiff plastic seaweed plant: one stem, wavy leaves, a round stud base
  const g = new THREE.Group(), M = seaPlastic(color), shapes = [];
  const stem = new THREE.Shape(); stem.moveTo(-0.13, 0); stem.lineTo(0.13, 0); stem.lineTo(0.09, 3.2); stem.lineTo(-0.09, 3.2); stem.lineTo(-0.13, 0); shapes.push(stem);
  [[0.5, 0.9, 0.7], [-0.5, 1.5, -0.7], [0.45, 2.2, 0.6], [-0.42, 2.7, -0.55], [0, 3.3, 0]].forEach(([x, y, r]) => { const s = new THREE.Shape(); s.absellipse(x, y, 0.55, 0.22, 0, TAU, false, r); shapes.push(s); });
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, curveSegments: 16 }); geo.translate(0, 0, -0.1); geo.computeVertexNormals();
  g.add(c3Put(c3Mesh(geo, M, 0.02), 0, 0.22, 0));
  g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.24, 24), seaPlastic('#0e7a22'), 0.02), 0, 0.12, 0));
  return g;
}
function seaOctoCurve(k, t, o = {}) {   // a tentacle spine: out from the body, down, curling up at the tip
  const N = o.N ?? 16, a = (k / 8) * TAU + (o.rot ?? 0), dir = seaV(Math.cos(a), 0, Math.sin(a)), up = seaV(0, 1, 0);
  const P = [seaV(Math.cos(a) * (o.r0 ?? 0.5), o.y0 ?? 0.9, Math.sin(a) * (o.r0 ?? 0.5))], L = o.len ?? 2.6, step = L / N;
  for (let i = 1; i <= N; i++) { const s = i / N, ph = (o.phi0 ?? -0.7) + s * (o.curl ?? 3.2) + (o.wave ?? 0) * Math.sin(t * 3 + k * 1.3 + s * 5);
    P.push(P[i - 1].clone().addScaledVector(dir, Math.cos(ph) * step).addScaledVector(up, Math.sin(ph) * step)); }
  return P;
}
function seaToyOcto(color = '#c8281e') {
  const g = new THREE.Group(), M = seaPlastic(color);
  g.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.72, 26, 18), M, 0.02), 0, 1.15, 0, 0, 0, 0, [1, 1.15, 1]));
  for (let k = 0; k < 8; k++) { const tb = seaTube(16, 8, 0.2, 0.06, M, 0.015); tb.userData.update(seaOctoCurve(k, 0, { len: 1.7, y0: 0.75, phi0: -0.9, curl: 4.2 })); g.add(tb); }
  for (const s of [-1, 1]) { const e = c3Put(new THREE.Mesh(new THREE.CircleGeometry(0.17, 18), c3Flat('#ffffff')), s * 0.26, 1.32, 0.66); e.lookAt(s * 0.5, 1.32, 3); g.add(e);
    const p = c3Put(new THREE.Mesh(new THREE.CircleGeometry(0.08, 14), c3Flat('#14100c')), s * 0.27, 1.32, 0.69); p.lookAt(s * 0.5, 1.32, 3); g.add(p); }
  g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 16), M, 0.015), 0, 2.0, 0));
  return g;
}
function seaFlipper(color = '#2a6ad8') {
  const g = new THREE.Group(), s = new THREE.Shape();
  s.moveTo(-0.35, 0); s.quadraticCurveTo(-0.45, 0.8, -0.3, 1.1); s.quadraticCurveTo(-0.75, 2.2, -0.6, 2.6); s.quadraticCurveTo(0, 2.35, 0.6, 2.6); s.quadraticCurveTo(0.75, 2.2, 0.3, 1.1); s.quadraticCurveTo(0.45, 0.8, 0.35, 0); s.quadraticCurveTo(0, -0.25, -0.35, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 16 }); geo.translate(0, 0, -0.08); geo.computeVertexNormals();
  g.add(c3Put(c3Mesh(geo, seaPlastic(color), 0.02), 0, 0, 0, 0, -Math.PI / 2));
  g.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.36, 16, 10), seaPlastic(color), 0.02), 0, 0.12, -0.05, 0, 0, 0, [1, 0.6, 1.4]));   // the foot pocket
  return g;
}
const SEA_COLORS = ['#e83a2a', '#f6c21a', '#2a6ad8', '#3fbf4a', '#f4f4f8', '#ff7a1a', '#1a1a20'];
function seaPieceAny(i) {   // a mixed bag for the trickle and the currents
  const R = RNG('piece', i), k = i % 7;
  if (k === 0) return seaTank(); if (k === 1) return seaFlipper(R.pick(['#2a6ad8', '#1a1a20', '#f6c21a']));
  if (k === 2) return seaToyWeed(); if (k === 3) return seaToyOcto(R.pick(['#c8281e', '#1a1a20']));
  return seaBrick(R.pick([1, 2, 2, 4]), R.pick([1, 2]), R.pick(SEA_COLORS), { plate: R.f() < 0.25 });
}
// a toy-set box, built with its art facing +z (lying face up = rotation.x -PI/2); the lid hinges on its top edge
function seaBox(theme) {
  const g = new THREE.Group(), w = 4.1, h = 3.08, card = c3Prop(SEA_THEMES[theme].bg[0], { rough: 0.45, env: 0.8 });
  g.add(c3Put(c3Mesh(c3RBox(w, h, 1.0, 0.06), card, 0.03), 0, 0, -0.2));
  g.add(c3Put(new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.92), c3Prop('#ffffff', { map: seaTexInside(), rough: 0.8 })), 0, 0, 0.305));
  const lid = new THREE.Group(); lid.position.set(0, h / 2, 0.3); g.add(lid);
  lid.add(c3Put(c3Mesh(c3RBox(w + 0.06, h + 0.06, 0.2, 0.05), card, 0.03), 0, -h / 2, 0.1));
  lid.add(c3Put(new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.94), c3Prop('#ffffff', { map: seaTexBox(theme), rough: 0.35, env: 0.8 })), 0, -h / 2, 0.205));
  let em = null;
  if (SEA_THEMES[theme].sea) { em = new THREE.Mesh(new THREE.CircleGeometry(0.5, 28), c3Flat('#cff8ff', { glow: '#6ae6ff', transparent: true, depthWrite: false })); em.material.opacity = 0;
    em.position.set((0.86 - 0.5) * w * 0.96, -h / 2 + (0.5 - 0.14) * h * 0.94, 0.21); lid.add(em); }
  return { g, lid, em, theme };
}
// eyes for the sea creatures: white ball, black pupil (moves with the gaze), a catch-light and a lid in the body colour
function seaEye(r, lidColor) {
  const g = new THREE.Group(), white = c3Mesh(new THREE.SphereGeometry(r, 22, 16), c3Toon('#ffffff'), 0.03); g.add(white);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(r * 0.5, 16, 12), c3Flat('#140c08')); g.add(pupil);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(r * 0.14, 8, 6), c3Flat('#ffffff')); g.add(hl);
  const lid = c3Mesh(new THREE.SphereGeometry(r * 1.07, 22, 10, 0, TAU, 0, Math.PI / 2), c3Toon(lidColor, { side: THREE.DoubleSide }), 0.03); g.add(lid);
  return { g, white, pupil, hl, lid, r };
}
const SEA_LID = { open: -1.05, wide: -1.6, smug: -0.32, half: 0.05, closed: 0.75, angry: -0.2 };
function seaEyeSet(e, state, gx = 0, gy = 0) {
  e.lid.rotation.set(SEA_LID[state] ?? -1.05, 0, state === 'angry' ? 0.35 : 0);
  const d = seaV(gx * 0.55, gy * 0.55, 1).normalize(), k = state === 'wide' ? 0.62 : 1;
  e.pupil.position.copy(d).multiplyScalar(e.r * 0.72); e.pupil.scale.set(k, k, 0.55); e.pupil.lookAt(d.clone().multiplyScalar(5));
  e.hl.position.copy(d).multiplyScalar(e.r * 0.95).add(seaV(e.r * 0.18, e.r * 0.2, 0));
}
// a cartoon clownfish along +x: ellipsoid body with white bands, a fan tail that wags, fins, 3D eyes, a mouth
function seaFish(o = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const col = o.color ?? '#ff7a1a', fin = o.fin ?? '#ff5a0a';
  const bg = new THREE.SphereGeometry(1, 36, 24); bg.rotateZ(Math.PI / 2);
  body.add(c3Put(c3Mesh(bg, c3Toon('#ffffff', { map: o.map ?? SEA.clownTex }), 0.045), 0, 0, 0, 0, 0, 0, [1.5, 1.05, 0.82]));
  const ext = (s, d) => { const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 14 }); geo.translate(0, 0, -d / 2); geo.computeVertexNormals(); return geo; };
  const ts = new THREE.Shape(); ts.moveTo(0.1, 0); ts.quadraticCurveTo(-0.7, 0.95, -1.15, 1.0); ts.quadraticCurveTo(-0.85, 0, -1.15, -1.0); ts.quadraticCurveTo(-0.7, -0.95, 0.1, 0);
  const tail = new THREE.Group(); tail.position.set(-1.35, 0, 0); body.add(tail); tail.add(c3Mesh(ext(ts, 0.1), c3Toon(fin), 0.03));
  const ds = new THREE.Shape(); ds.moveTo(-0.9, 0); ds.quadraticCurveTo(-0.6, 0.75, 0.0, 0.62); ds.quadraticCurveTo(0.45, 0.5, 0.6, 0); ds.lineTo(-0.9, 0);
  body.add(c3Put(c3Mesh(ext(ds, 0.08), c3Toon(fin), 0.03), -0.1, 0.88, 0));
  const pf = new THREE.Shape(); pf.absellipse(0, 0, 0.42, 0.2, 0, TAU, false, 0);
  const fins = [-1, 1].map((sd) => { const f = new THREE.Group(); f.position.set(0.25, -0.35, sd * 0.72); body.add(f); f.add(c3Put(c3Mesh(ext(pf, 0.06), c3Toon(fin), 0.025), -0.3, 0, 0)); return f; });
  const eyes = [-1, 1].map((sd) => { const e = seaEye(0.36, col); e.g.position.set(0.82, 0.3, sd * 0.5); body.add(e.g); e.g.lookAt(e.g.position.clone().add(seaV(0.5, 0.08, sd * 0.85))); return e; });
  const mouth = new THREE.Group(); mouth.position.set(1.47, -0.2, 0); body.add(mouth);
  const ink = c3Flat(C3.ink), smile = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 16, Math.PI), ink); smile.rotation.set(Math.PI, Math.PI / 2, 0); mouth.add(smile);
  const oh = c3Mesh(new THREE.SphereGeometry(0.16, 14, 10), c3Flat('#5a1a10'), 0.04); oh.scale.set(0.5, 1, 1); mouth.add(oh);
  const flat = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.34, 6), ink); flat.rotation.x = Math.PI / 2; mouth.add(flat);
  return { g, body, tail, fins, eyes, mouth: { smile, oh, flat }, key: o.key ?? 'fish' };
}
// pose: { swim (wag speed), gaze [gx, gy], lid, mouth: smile|oh|flat, roll, pitch }
function seaFishPose(f, t, o = {}) {
  const w = o.swim ?? 1;
  f.tail.rotation.y = Math.sin(t * (6 + 6 * w)) * (0.25 + 0.25 * w); f.body.rotation.y = -Math.sin(t * (6 + 6 * w)) * 0.06 * w;
  f.fins.forEach((fn, i) => { fn.rotation.x = Math.sin(t * 7 + i * 3) * 0.4; fn.rotation.y = 0.4 * (i ? -1 : 1); });
  const R = RNG('fblink', f.key); let lid = o.lid ?? 'open';
  const fr = Math.round(t * FPS); let b = Math.round(R.r(0.3, 1.5) * FPS); while (b + 3 < fr) b += Math.round(R.r(1.6, 2.6) * FPS);
  if (o.blink !== false && lid !== 'closed' && (fr - b === 0 || fr - b === 2)) lid = 'half'; else if (o.blink !== false && lid !== 'closed' && fr - b === 1) lid = 'closed';
  f.eyes.forEach((e) => seaEyeSet(e, lid, ...(o.gaze ?? [0, 0])));
  const m = o.mouth ?? 'smile'; f.mouth.smile.visible = m === 'smile'; f.mouth.oh.visible = m === 'oh'; f.mouth.flat.visible = m === 'flat';
  f.body.rotation.z = o.pitch ?? 0; f.body.rotation.x = o.roll ?? 0;
}
// a little background fish (blue tang / yellow): body, tail, eyes
function seaMiniFish(i) {
  const R = RNG('mini', i), g = new THREE.Group(), c = R.pick(['#2a7ad8', '#3a5ad8', '#f6c21a', '#e85a8a']);
  const bg = new THREE.SphereGeometry(1, 18, 12); g.add(c3Put(c3Mesh(bg, c3Toon(c), 0.05), 0, 0, 0, 0, 0, 0, [1.3, 0.9, 0.4]));
  const ts = new THREE.Shape(); ts.moveTo(0, 0); ts.lineTo(-0.9, 0.7); ts.lineTo(-0.7, 0); ts.lineTo(-0.9, -0.7); ts.lineTo(0, 0);
  const tail = c3Put(c3Mesh(new THREE.ShapeGeometry(ts), c3Toon(c === '#f6c21a' ? '#2a7ad8' : '#f6c21a', { side: THREE.DoubleSide }), 0.0), -1.1, 0, 0); g.add(tail);
  for (const s of [-1, 1]) { g.add(c3Put(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), c3Flat('#ffffff')), 0.75, 0.2, s * 0.25)); g.add(c3Put(new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), c3Flat('#140c08')), 0.85, 0.2, s * 0.33)); }
  return { g, tail };
}
// a cartoon octopus: tall spotted head, 3D eyes, a little "o" mouth, eight tapered tentacles that move
function seaOctopus() {
  const g = new THREE.Group(), col = '#ff6a3a', head = new THREE.Group(); g.add(head);
  head.add(c3Put(c3Mesh(new THREE.SphereGeometry(1, 36, 26), c3Toon('#ffffff', { map: seaTexSpots('#ff6a3a', '#ffb08a', 30, 3) }), 0.05), 0, 2.2, 0, 0, 0, 0, [1.15, 1.35, 1.1]));
  const eyes = [-1, 1].map((sd) => { const e = seaEye(0.42, col); e.g.position.set(sd * 0.45, 2.15, 0.92); head.add(e.g); e.g.lookAt(e.g.position.clone().add(seaV(sd * 0.3, 0, 1))); return e; });
  const oh = c3Mesh(new THREE.SphereGeometry(0.18, 14, 10), c3Flat('#5a1a10'), 0.04); oh.position.set(0, 1.55, 1.02); oh.scale.set(1, 1.2, 0.5); head.add(oh);
  const M = c3Toon(col), arms = [...Array(8)].map(() => { const tb = seaTube(20, 10, 0.42, 0.1, M, 0.02); g.add(tb); return tb; });
  return { g, head, eyes, oh, arms };
}
function seaOctoPose(o, t, p = {}) {
  const flare = p.flare ?? 0;
  o.arms.forEach((a, k) => a.userData.update(seaOctoCurve(k, t, { N: 20, len: 3.4, y0: 1.3, r0: 0.6, phi0: lerp(-0.9, -0.35, flare), curl: lerp(3.0, 3.2, flare), wave: 0.35, rot: 0.2 })));
  o.eyes.forEach((e) => seaEyeSet(e, p.lid ?? 'open', ...(p.gaze ?? [0, 0])));
  o.head.scale.set(1 - 0.08 * flare, 1 + 0.12 * flare, 1 - 0.08 * flare);
}
// a red crab: flat body, eyes on stalks, two claws, six legs that step
function seaCrab() {
  const g = new THREE.Group(), M = c3Toon('#e8402a'), legs = [];
  g.add(c3Put(c3Mesh(new THREE.SphereGeometry(1, 24, 14), M, 0.05), 0, 0.75, 0, 0, 0, 0, [1.1, 0.5, 0.8]));
  for (const s of [-1, 1]) {
    g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8), M, 0.02), s * 0.35, 1.35, 0.5));
    g.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.2, 14, 10), c3Toon('#ffffff'), 0.02), s * 0.35, 1.7, 0.5)); g.add(c3Put(new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), c3Flat('#140c08')), s * 0.37, 1.72, 0.66));
    const cl = new THREE.Group(); cl.position.set(s * 1.2, 0.9, 0.6); g.add(cl);
    cl.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.42, 16, 12), M, 0.03), 0, 0, 0, 0, 0, 0, [1, 0.75, 0.75]));
    cl.add(c3Put(c3Mesh(new THREE.ConeGeometry(0.16, 0.5, 10), M, 0.02), s * 0.15, 0.25, 0.3, 0, 0.4, -s * 0.4));
    for (let k = 0; k < 3; k++) { const lg = new THREE.Group(); lg.position.set(s * 0.8, 0.65, -0.3 + k * 0.35); g.add(lg);
      lg.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.9, 6), M, 0.015), s * 0.35, -0.1, 0, 0, 0, s * 1.1)); legs.push([lg, s, k]); }
  }
  return { g, legs };
}
function seaCrabPose(c, t, speed = 1) { c.legs.forEach(([lg, s, k]) => { lg.rotation.x = Math.sin(t * 14 * speed + k * 2 + (s > 0 ? 0 : 1)) * 0.35; }); }

// ---- living things that need shaders: swaying kelp (instanced crossed fronds), caustics on the sand
function seaKelpMat(hue) {
  const m = new THREE.MeshToonMaterial({ color: '#ffffff', map: seaTexKelp(hue), gradientMap: C3_RAMP, alphaTest: 0.5, side: THREE.DoubleSide }); m.toneMapped = false;
  m.userData.uT = { value: 0 };
  m.onBeforeCompile = (sh) => { sh.uniforms.uT = m.userData.uT;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = vec3(position);
      #ifdef USE_INSTANCING
        float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.53;
      #else
        float ph = 1.7;
      #endif
      float k = pow(clamp(position.y, 0.0, 1.0), 1.5);
      transformed.x += sin(uT * 1.3 + ph + position.y * 2.6) * 0.32 * k;
      transformed.z += cos(uT * 1.05 + ph * 1.3 + position.y * 2.1) * 0.22 * k;`); };
  m.customProgramCacheKey = () => 'seaKelp' + hue;
  return m;
}
function seaKelpGeo() {
  const a = new THREE.PlaneGeometry(1, 1, 1, 14); a.translate(0, 0.5, 0); const b = a.clone(); b.rotateY(Math.PI / 2);
  return seaMerge([a, b]);
}
function seaCausticMat() {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { tex: { value: seaTexCaustic() }, uT: { value: 0 }, cam: { value: seaV(0, 0, 0) }, col: { value: new THREE.Color('#c8f8ff') } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform sampler2D tex; uniform float uT; uniform vec3 cam, col; varying vec3 vW;
      void main(){ float a = texture2D(tex, vW.xz * 0.055 + vec2(uT * 0.021, uT * 0.013)).r; float b = texture2D(tex, vW.xz * 0.041 + vec2(-uT * 0.016, uT * 0.019) + 0.37).r;
        float c = a * b * 2.4 + max(a, b) * 0.12; float f = exp(-distance(vW, cam) * 0.022);
        gl_FragColor = vec4(col * c * f * 0.5, 1.0); }` });
}
// an underwater coral clump: branching tubes, a brain coral, or tube sponges
function seaCoral(i) {
  const R = RNG('coral', i), g = new THREE.Group(), kind = i % 3, col = R.pick(['#ff7a8a', '#ff9a3a', '#c86ad8', '#ffd04a', '#ff5a6a', '#5ad8c8']);
  if (kind === 0) { const M = c3Toon(col);
    for (let k = 0; k < 7; k++) { const h = R.r(1.2, 2.6), a = R.r(0, TAU), tilt = R.r(0.1, 0.6), br = c3Mesh(new THREE.CylinderGeometry(0.12, 0.24, h, 10), M, 0.03);
      br.position.set(Math.cos(a) * tilt * h * 0.5, h / 2, Math.sin(a) * tilt * h * 0.5); br.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt); g.add(br);
      const tip = c3Mesh(new THREE.SphereGeometry(0.17, 10, 8), c3Toon('#fff0e0'), 0.02); tip.position.set(Math.cos(a) * tilt * h, h * Math.cos(tilt), Math.sin(a) * tilt * h); g.add(tip); } }
  if (kind === 1) { g.add(c3Put(c3Mesh(new THREE.SphereGeometry(1.2, 26, 18), c3Toon('#ffffff', { map: seaTexStripes2(col) }), 0.05), 0, 0.6, 0, 0, 0, 0, [1, 0.7, 1])); }
  if (kind === 2) { const M = c3Toon(col);
    for (let k = 0; k < 5; k++) { const h = R.r(1.0, 2.8), r = R.r(0.25, 0.42); const tb = c3Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, 14, 1, true), c3Toon(col, { side: THREE.DoubleSide }), 0.03);
      tb.position.set(R.n(0.8), h / 2, R.n(0.8)); g.add(tb); const rim = c3Mesh(new THREE.TorusGeometry(r, 0.06, 6, 16), M, 0.0); rim.rotation.x = Math.PI / 2; rim.position.set(tb.position.x, h, tb.position.z); g.add(rim); } }
  return g;
}
function seaTexStripes2(col) { return tex((x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(80,20,40,0.35)'; x.lineWidth = 6;
  for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(0, i * h / 14); for (let k = 0; k <= 16; k++) x.lineTo(k * w / 16, i * h / 14 + Math.sin(k * 1.3 + i) * 8); x.stroke(); } }, 256, 256); }
function seaStar(c) { const s = new THREE.Shape(); for (let k = 0; k <= 10; k++) { const a = k / 10 * TAU + Math.PI / 2, r = k % 2 ? 0.32 : 0.85; (k ? s.lineTo : s.moveTo).call(s, Math.cos(a) * r, Math.sin(a) * r); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3, curveSegments: 4 }); geo.rotateX(-Math.PI / 2); return c3Mesh(geo, c3Toon(c), 0.03); }

// ---- stations (x along the seabed)
const SEA_ST = { A: [0, 0], C: [64, 0], D: [92, 0], E: [122, 0], F: [-36, 0], G: [-74, 0], H: [-120, 0] };
const SEA_BOXES = [   // theme, x, z, yaw, landing time (rows that fit the 9:16 frame)
  ['castle', -2.8, -5.6, 0.12, 25.35], ['space', 2.9, -6.0, -0.15, 25.7], ['sub', 2.7, -1.5, 0.12, 26.0],
  ['reef', -2.7, -1.2, -0.1, 26.3], ['octo', 5.3, 2.6, -0.2, 26.6], ['diver', 0.3, 2.6, 0.06, 26.95]];   // footprints never overlap (checked)
const SEA_HERO = 5;   // the diver box opens

// ---- the world
function seaBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 900), s = { scene, cam };
  scene.fog = new THREE.FogExp2(SEA_FOG, 0.0105);
  SEA.clownTex = tex((x, w, h) => { x.fillStyle = '#ff7a1a'; x.fillRect(0, 0, w, h);
    for (const c of [0.25, 0.46, 0.68]) { x.fillStyle = '#2a1408'; x.fillRect(0, c * h - h * 0.06, w, h * 0.12); x.fillStyle = '#ffffff'; x.fillRect(0, c * h - h * 0.045, w, h * 0.09); } }, 128, 256);
  const key = lights(scene, { amb: '#4aa4c8', ambI: 0.32, sky: '#b8eeff', ground: '#a88a50', key: '#f4fcff', keyI: 1.3, keyP: [10, 50, 18], rim: '#7af0ff', rimI: 0.55, rimP: [-12, 14, -18] });
  scene.add(key.target); s.key = key;
  { const L = new THREE.DirectionalLight('#ffe8c8', 0.35); L.position.set(0, 10, 40); L.layers.enableAll(); scene.add(L); }   // a soft front fill
  // the water: a gradient dome (bright above, deep blue below), the rippling surface, god rays
  s.dome = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#86dcf0') }, mid: { value: new THREE.Color(SEA_FOG) }, bot: { value: new THREE.Color('#06263a') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top, mid, bot; varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.05, 0.75, h)) : mix(mid, bot, smoothstep(0.0, 0.4, -h)); gl_FragColor = vec4(c, 1.0); }' }));
  s.dome.renderOrder = -10; s.dome.userData.noCast = true; scene.add(s.dome);
  s.surfTex = seaTexSurface();
  s.surface = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshBasicMaterial({ color: '#e8fdff', map: s.surfTex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide, toneMapped: false }));
  s.surface.rotation.x = Math.PI / 2; s.surface.position.y = 70; scene.add(s.surface);
  const rayTex = seaTexRay(); s.rays = [];
  for (let i = 0; i < 60; i++) { const R = RNG('ray', i);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(R.r(0.8, 2.2), R.r(4, 8), 90, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#e8fcff', map: rayTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(R.r(-160, 150), 25, R.r(-60, 8)); m.rotation.set(R.n(0.08), 0, 0.2 + R.n(0.08)); m.userData = { base: R.r(0.07, 0.17), ph: R.r(0, TAU), sp: R.r(0.3, 0.8) }; scene.add(m); s.rays.push(m); }
  // the seabed: rippled sand, caustics dancing on it, low dunes
  scene.add(pl(1400, 500, c3Prop('#c8b08a', { map: seaTexSand(), rough: 0.95 }), 0, 0, -60, 0, -Math.PI / 2));
  s.caustic = new THREE.Mesh(new THREE.PlaneGeometry(1400, 500), seaCausticMat()); s.caustic.rotation.x = -Math.PI / 2; s.caustic.position.set(0, 0.04, -60); scene.add(s.caustic);
  const sandM = c3Toon('#cfae70');
  for (let i = 0; i < 26; i++) { const R = RNG('dune', i), d = c3Mesh(new THREE.SphereGeometry(1, 24, 12), sandM, 0); d.scale.set(R.r(14, 30), R.r(1.5, 4), R.r(8, 16)); d.position.set(-170 + i * 13 + R.n(5), -0.4, R.r(-80, -30)); scene.add(d); }
  // rocks, coral, starfish, shells — a dense band behind every station, sparser at the sides
  const rockM = [c3Toon('#ffffff', { map: seaTexSpots('#7a90a0', '#62806e', 30, 1) }), c3Toon('#ffffff', { map: seaTexSpots('#8a8098', '#70788a', 24, 2) })];
  for (let i = 0; i < 90; i++) { const R = RNG('rk', i), r = R.r(1.5, 6.5), x = R.r(-170, 160), z = R.r(-70, -9) - (R.f() < 0.25 ? 0 : 0);
    if (!seaClear(x, z, r)) continue; const m = c3Mesh(seaRockGeo(r, i, R.r(0.45, 0.8)), rockM[i % 2], 0.05); m.position.set(x, 0, z); m.rotation.y = R.r(0, TAU); scene.add(m); }
  for (let i = 0; i < 70; i++) { const R = RNG('cr', i), cx = R.r(-170, 160), cz = R.r(-55, -6); if (!seaClear(cx, cz, 2)) continue; const c = seaCoral(i); c.position.set(cx, 0, cz); c.scale.setScalar(R.r(0.9, 1.8)); c.rotation.y = R.r(0, TAU); scene.add(c); }
  for (let i = 0; i < 26; i++) { const R = RNG('st', i), st = seaStar(R.pick(['#ff7a3a', '#ff5a6a', '#ffb83a', '#c86ad8'])); st.position.set(R.r(-160, 150), 0.12, R.r(-10, 8)); st.rotation.y = R.r(0, TAU); st.scale.setScalar(R.r(0.6, 1.1)); scene.add(st); }
  // kelp: a forest band (blurred background) and a few in focus at the stations
  const kg = seaKelpGeo(); s.kelpMats = [seaKelpMat(118), seaKelpMat(92)];
  const KBG = 300; s.kelpBg = s.kelpMats.map((m) => { const im = new THREE.InstancedMesh(kg, m, KBG); im.frustumCulled = false; scene.add(im); return im; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < KBG * 2; i++) { const R = RNG('kelp', i), cl = R.i(0, 40), C = RNG('kcl', cl), cx = C.r(-170, 160), cz = C.r(-60, -10);
    const kx = cx + R.n(5), kz = cz + R.n(4), ok = seaClear(kx, kz, 2); e.set(0, R.r(0, TAU), 0); q.setFromEuler(e); m4.compose(seaV(kx, ok ? 0 : -60, kz), q, ok ? seaV(R.r(1.4, 2.4), R.r(7, 22), 1) : seaV(0, 0, 0)); s.kelpBg[i % 2].setMatrixAt(Math.floor(i / 2), m4); }
  s.kelpBg.forEach((im) => { im.instanceMatrix.needsUpdate = true; im.userData.noCast = true; });
  // marine snow (moves with the camera, so it is always there) and bubbles
  s.snow = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 5, 4), new THREE.MeshBasicMaterial({ color: '#e6fbff', transparent: true, opacity: 0.6, toneMapped: false }), 1400); s.snow.frustumCulled = false; scene.add(s.snow);
  s.snowSeed = [...Array(1400)].map((_, i) => { const R = RNG('snow', i); return [R.r(0, 70), R.r(0, 44), R.r(0, 70), R.r(0, TAU)]; });
  const bubM = c3Prop('#e8fbff', { rough: 0.04, metal: 0.2, env: 2.4, transparent: true, glow: '#2a6a7a' }); bubM.opacity = 0.5; bubM.depthWrite = false;
  s.bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), bubM, 360); s.bub.frustumCulled = false; scene.add(s.bub);
  s.puff = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: '#e8d4a4', transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), 240); s.puff.frustumCulled = false; scene.add(s.puff);
  // background fish (two schools)
  s.mini = [...Array(16)].map((_, i) => { const f = seaMiniFish(i); scene.add(f.g); return f; });
  // ---- A: the toy-set boxes; the tanks and spear guns that float out of the diver box
  s.boxes = SEA_BOXES.map(([th]) => { const b = seaBox(th); scene.add(b.g); return b; });
  s.tanks = [...Array(5)].map(() => { const t = seaTank(); scene.add(t); return t; });
  s.guns = [...Array(3)].map(() => { const g = seaGun(); scene.add(g.g); return g; });
  // ---- C: kelp in focus + toy seaweed
  s.kelpC = new THREE.InstancedMesh(kg, s.kelpMats[0], 22); s.kelpC.frustumCulled = false; s.kelpC.userData.noCast = true; scene.add(s.kelpC);
  for (let i = 0; i < 22; i++) { const R = RNG('kc', i), x = 64 + R.r(-9, 9), z = R.r(-4.5, 0.6); e.set(0, R.r(0, TAU), 0); q.setFromEuler(e);
    m4.compose(seaV(x, 0, z), q, seaV(R.r(1.3, 2.0), R.r(5, 9), 1)); s.kelpC.setMatrixAt(i, m4); }
  s.kelpC.instanceMatrix.needsUpdate = true;
  s.toyWeeds = [[61.4, 1.0], [63.1, -0.6], [65.3, 1.5], [66.9, -1.0], [68.5, 0.5]].map(([x, z], i) => { const w = seaToyWeed(i % 2 ? '#14a02a' : '#2ec43a'); w.position.set(x, 0, z); w.rotation.y = 0.2 * (i - 2); w.scale.setScalar(1.15); scene.add(w); return w; });
  // ---- D: the octopus rock
  s.octoRock = c3Mesh(seaRockGeo(4.2, 'octo', 0.55), rockM[0], 0.05); s.octoRock.position.set(92, 0, -1.6); scene.add(s.octoRock);
  s.toyOctos = [[90.0, -0.8, '#c8281e'], [92.2, -0.1, '#1a1a20'], [94.4, -0.9, '#c8281e']].map(([x, z, c]) => { const o = seaToyOcto(c); o.position.set(x, 2.05, z); o.scale.setScalar(0.85); scene.add(o); return o; });
  s.octo = seaOctopus(); s.octo.g.position.set(92.6, -3, -4.6); scene.add(s.octo.g);
  // ---- E: the museum shelf
  const E = new THREE.Group(); E.position.set(122, 0, 0); scene.add(E); s.museum = E;
  const stone = c3Toon('#ffffff', { map: seaTexSpots('#c8c0b0', '#a8a090', 30, 5) });
  for (const x of [-5.5, 5.5]) E.add(c3Put(c3Mesh(seaRockGeo(2.6, 'shelfR' + x, 0.9), rockM[1], 0.05), x, 0, -0.4));
  E.add(c3Put(c3Mesh(c3RBox(17, 1.0, 3.8, 0.25), stone, 0.05), 0, 3.0, 0));
  s.mPieces = []; s.mStands = [];
  const PIECES = [['SCUBA TANK', () => seaTank()], ['SPEAR GUN', () => seaGun().g], ['OCTOPUS', () => seaToyOcto('#c8281e')], ['SEAWEED', () => seaToyWeed()], ['FLIPPER', () => seaFlipper('#2a6ad8')]];
  PIECES.forEach(([name, mk], i) => { const x = -6 + i * 3;
    E.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.75, 0.85, 1.0, 24), c3Toon('#f4eee2'), 0.03), x, 4.0, -0.3));
    const p = mk(); p.position.set(x, 4.5, -0.3); if (name === 'SPEAR GUN') { p.scale.setScalar(0.8); p.rotation.y = 0.5; } if (name === 'FLIPPER') { p.rotation.set(-1.2, 0.3, 0); p.position.y = 4.75; }
    E.add(p); s.mPieces.push(p);
    const pq = new THREE.Group(); pq.position.set(x, 3.0, 1.95); pq.rotation.x = -0.25; E.add(pq);
    pq.add(c3Mesh(c3RBox(2.3, 0.78, 0.12, 0.05), c3Prop('#a8843a', { metal: 0.6, rough: 0.35 }), 0.02));
    pq.add(c3Put(new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.66), c3Prop('#ffffff', { map: seaTexPlaque(name, 'FOUND 1997'), rough: 0.4, metal: 0.3 })), 0, 0, 0.065)); });
  const sign = new THREE.Group(); sign.position.set(0, 9.4, -1.2); sign.scale.setScalar(0.82); E.add(sign);
  sign.add(c3Mesh(c3RBox(8.6, 3.4, 0.36, 0.2), c3Toon('#8a5a32'), 0.05)); sign.add(c3Put(new THREE.Mesh(new THREE.PlaneGeometry(8.1, 2.9), c3Toon('#ffffff', { map: seaTexSign2("THE OCEAN'S", 'COLLECTION') })), 0, 0, 0.19));
  for (const x of [-3.6, 3.6]) E.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.22, 0.28, 9.4, 10), c3Toon('#7a5230'), 0.04), x, 4.7, -1.4, 0, 0, x * 0.006));
  // velvet rope on brass posts
  const brass = c3Prop('#d8a84a', { metal: 0.85, rough: 0.25, env: 1.4 }), velvet = c3Toon('#b8182a');
  const postX = [-8, -2.7, 2.7, 8];
  postX.forEach((x) => { E.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.6, 12), brass, 0.02), x, 1.3, 3.6)); E.add(c3Put(c3Mesh(new THREE.SphereGeometry(0.24, 14, 10), brass, 0.02), x, 2.7, 3.6));
    E.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.18, 18), brass, 0.02), x, 0.09, 3.6)); });
  for (let k = 0; k < 3; k++) { const a = postX[k], b = postX[k + 1], rope = seaTube(18, 8, 0.12, 0.12, velvet, 0.02);
    rope.userData.update([...Array(19)].map((_, i) => { const u = i / 18; return seaV(lerp(a, b, u), 2.55 - Math.sin(u * Math.PI) * 0.7, 3.6); })); E.add(rope); }
  s.spot = new THREE.Mesh(new THREE.CylinderGeometry(2, 10, 20, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff6d8', map: rayTex, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide, toneMapped: false }));
  s.spot.position.set(0, 12, 0); E.add(s.spot);
  // ---- the hero clownfish (s22, s24) and the crab (s27, s34)
  s.fish = seaFish({ key: 'clown' }); scene.add(s.fish.g);
  s.crab = seaCrab(); scene.add(s.crab.g);
  s.fx = {};   // sprites from the piece's assets: sparkle, stars
  for (const n of ['sparkle', 'stars']) { const im = c3Img('x_' + n); s.fx[n] = [...Array(4)].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, im ? im.aspect : 1), new THREE.MeshBasicMaterial({ map: im ? im.tex : null, color: im ? '#ffffff' : '#fff6a0', transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = 8; scene.add(m); return m; }); }
  // ---- F: the lone brick, the sunken clock, the year sign, sprouting kelp
  const F = new THREE.Group(); F.position.set(-36, 0, 0); scene.add(F); s.lone = F;
  s.brick = seaBrick(4, 2, '#e83a2a'); s.brick.position.set(0, 0, 2.0); s.brick.rotation.y = 0.35; F.add(s.brick);
  const ck = new THREE.Group(); ck.position.set(-2.3, 0.55, -2.4); ck.rotation.set(-0.95, 0.4, 0.1); F.add(ck); s.clock = ck;
  s.brassM = c3Prop('#c8963a', { metal: 0.85, rough: 0.3, env: 1.4 });
  ck.add(c3Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.55, 40), s.brassM, 0.04).rotateX(Math.PI / 2));
  ck.add(c3Put(c3Mesh(new THREE.TorusGeometry(2.05, 0.22, 12, 48), s.brassM, 0.03), 0, 0, 0.3));
  ck.add(c3Put(new THREE.Mesh(new THREE.CircleGeometry(1.88, 40), c3Prop('#ffffff', { map: seaTexClockFace(), rough: 0.5 })), 0, 0, 0.29));
  const hand = (len, wd) => { const g = new THREE.Group(); g.position.z = 0.33; ck.add(g); g.add(c3Put(c3Mesh(c3RBox(wd, len, 0.05, 0.02), c3Flat('#1a1410'), 0), 0, len / 2 - 0.15, 0)); return g; };
  s.hourH = hand(1.0, 0.16); s.minH = hand(1.55, 0.1);
  ck.add(c3Put(c3Mesh(new THREE.TorusGeometry(0.35, 0.1, 8, 16), s.brassM, 0.02), 0, 2.35, 0));
  s.barn = [...Array(26)].map((_, i) => { const R = RNG('barn', i), a = R.r(0, TAU), r = R.r(1.6, 2.2), b = c3Mesh(new THREE.ConeGeometry(0.2, 0.26, 8), c3Toon('#e8e0d0'), 0.02);
    b.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.32 + R.r(0, 0.1)); b.rotation.x = Math.PI / 2; ck.add(b); return b; });
  const sg = new THREE.Group(); sg.position.set(0.9, 0, -3.6); sg.rotation.set(0, -0.4, -0.05); F.add(sg);
  sg.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.16, 0.2, 5.0, 10), c3Toon('#7a5230'), 0.03), 0, 2.5, -0.1));
  sg.add(c3Put(c3Mesh(c3RBox(3.2, 1.7, 0.22, 0.1), c3Toon('#9a6a3a'), 0.04), 0, 4.6, 0));
  s.yearCv = Object.assign(document.createElement('canvas'), { width: 512, height: 272 }); s.yearTex = new THREE.CanvasTexture(s.yearCv); s.yearTex.encoding = THREE.sRGBEncoding;
  sg.add(c3Put(new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.55), c3Toon('#ffffff', { map: s.yearTex })), 0, 4.6, 0.12)); s.yearShown = -1;
  s.sprouts = new THREE.InstancedMesh(kg, s.kelpMats[1], 7); s.sprouts.frustumCulled = false; s.sprouts.userData.noCast = true; F.add(s.sprouts);
  // ---- G: currents (glowing ribbon tubes with chevrons) and the pieces that ride them
  const GC = new THREE.Group(); GC.position.set(-74, 11, 0); scene.add(GC); s.currents = GC;
  s.chev = seaTexChevron(); s.chev.repeat.set(1, 26);
  const chevM = new THREE.MeshBasicMaterial({ color: '#ffffff', map: s.chev, transparent: true, opacity: 0.75, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }); chevM.userData.glow = '#1a7898';
  s.curves = [
    new THREE.CatmullRomCurve3([...Array(12)].map((_, i) => { const a = i / 12 * TAU; return seaV(Math.cos(a) * 10, Math.sin(2 * a) * 2.2 + 1, Math.sin(a) * 4 - 1); }), true),
    new THREE.CatmullRomCurve3([...Array(12)].map((_, i) => { const a = i / 12 * TAU; return seaV(Math.cos(a) * 7.5 + 1, Math.sin(a) * 5.5, Math.cos(2 * a) * 2.5 - 3); }), true),
    new THREE.CatmullRomCurve3([...Array(12)].map((_, i) => { const a = i / 12 * TAU; return seaV(Math.cos(a) * 12 - 1, Math.sin(3 * a) * 1.6 - 3.5, Math.sin(a) * 6 - 5); }), true)];
  s.curves.forEach((c) => { const tb = seaTube(160, 12, 0.5, 0.5, chevM, 0); tb.userData.update(c.getSpacedPoints(160)); GC.add(tb); });
  s.riders = [...Array(11)].map((_, i) => { const p = seaPieceAny(i + 3); p.scale.setScalar(1.15); GC.add(p); return p; });
  s.floater = seaBrick(2, 2, '#f6c21a'); GC.add(s.floater); s.sinker = seaFlipper('#2a6ad8'); GC.add(s.sinker);
  // ---- H: the lost container, half sunk, rusted, its door ajar; pieces trickle out
  const HC = new THREE.Group(); HC.position.set(-120, 3.9, -2); HC.rotation.set(0, 0.35, 0.06); scene.add(HC); s.cont = HC;
  const LL = 26, HH = 10, DD = 10, steel = c3Prop('#ffffff', { map: seaTexContainer(), rough: 0.6, metal: 0.25 }), hide = new THREE.MeshBasicMaterial({ visible: false });
  HC.add(c3Mesh(new THREE.BoxGeometry(LL, HH, DD), [hide, steel, steel, steel, steel, steel], 0.06));
  const ribM = c3Prop('#9a3a26', { rough: 0.6, metal: 0.25 });
  for (let i = 0; i < 26; i++) for (const z of [DD / 2 + 0.08, -DD / 2 - 0.08]) HC.add(c3Put(new THREE.Mesh(new THREE.BoxGeometry(0.35, HH - 1.0, 0.16), ribM), -LL / 2 + 0.8 + i * 0.98, 0, z));
  const frameM = c3Prop('#6a2a1a', { rough: 0.5, metal: 0.4 });
  for (const x of [-LL / 2, LL / 2]) for (const z of [-DD / 2, DD / 2]) HC.add(c3Put(c3Mesh(new THREE.BoxGeometry(0.8, HH + 0.2, 0.8), frameM, 0.03), x, 0, z));
  for (const y of [-HH / 2, HH / 2]) for (const z of [-DD / 2, DD / 2]) HC.add(c3Put(c3Mesh(new THREE.BoxGeometry(LL, 0.6, 0.6), frameM, 0.03), 0, y, z));
  HC.add(c3Put(new THREE.Mesh(new THREE.BoxGeometry(LL - 0.6, HH - 0.6, DD - 0.6), c3Flat('#1a0e0a', { side: THREE.BackSide })), 0, 0, 0));
  HC.add(c3Put(new THREE.Mesh(new THREE.PlaneGeometry(LL - 1, DD - 1), c3Prop('#ffffff', { map: seaTexInside(), rough: 0.8 })), 0, -HH / 2 + 0.35, 0, 0, -Math.PI / 2));
  const doorM = c3Prop('#ffffff', { map: seaTexContainer(), rough: 0.6, metal: 0.25 });
  const door = (zh, dir) => { const g = new THREE.Group(); g.position.set(LL / 2 + 0.3, 0, zh); HC.add(g);
    g.add(c3Put(c3Mesh(new THREE.BoxGeometry(0.3, HH - 0.5, DD / 2 - 0.2), doorM, 0.04), 0.15, 0, dir * (DD / 4 - 0.1)));
    for (const k of [0.3, 0.7]) g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.12, 0.12, HH - 0.8, 8), c3Prop('#8a8a90', { metal: 0.6, rough: 0.5 }), 0.02), 0.42, 0, dir * (DD / 2 - 0.2) * k));
    return g; };
  door(DD / 2, -1); s.door = door(-DD / 2, 1);
  HC.add(c3Put(c3Mesh(new THREE.SphereGeometry(1, 28, 14), c3Toon('#d8bc84'), 0), 0, -HH / 2 - 0.4, 0, 0, 0, 0, [LL * 0.72, 2.6, DD * 0.9]));   // sand piled around its base
  for (let i = 0; i < 46; i++) { const R = RNG('cbarn', i), b = c3Mesh(new THREE.ConeGeometry(0.28, 0.36, 8), c3Toon(R.f() < 0.5 ? '#e8e0d0' : '#a8b0a0'), 0.02);
    const side = R.f() < 0.6; b.position.set(R.r(-LL / 2, LL / 2), side ? R.r(-HH / 2, -1) : HH / 2 + 0.15, side ? DD / 2 + 0.3 : R.r(-DD / 2, DD / 2)); if (side) b.rotation.x = Math.PI / 2; HC.add(b); }
  s.contKelp = new THREE.InstancedMesh(kg, s.kelpMats[0], 9); s.contKelp.frustumCulled = false; s.contKelp.userData.noCast = true; HC.add(s.contKelp);
  for (let i = 0; i < 9; i++) { const R = RNG('ck', i); e.set(0, R.r(0, TAU), 0); q.setFromEuler(e); m4.compose(seaV(R.r(-LL / 2 + 1, LL / 2 - 2), HH / 2, R.r(-DD / 2 + 1, DD / 2 - 1)), q, seaV(R.r(1, 1.6), R.r(2.5, 5), 1)); s.contKelp.setMatrixAt(i, m4); }
  s.contKelp.instanceMatrix.needsUpdate = true;
  s.trickle = [...Array(30)].map((_, i) => { const p = seaPieceAny(i); p.scale.setScalar(0.55); scene.add(p); return p; });
  // ---- layers: subjects in focus, the rest of the world is background (blurred), plus foreground pieces
  [s.boxes.map((b) => b.g), s.tanks, s.guns.map((g) => g.g), [s.kelpC], s.toyWeeds, [s.octoRock], s.toyOctos, [s.octo.g], [E], [s.fish.g], [s.crab.g], [F], [GC], [HC], s.trickle, [s.bub, s.puff], Object.values(s.fx).flat()].flat().forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = {
    kelp: (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(kg, s.kelpMats[i % 2]); m.scale.set(0.42, 3.4, 1); m.position.set(i * 0.28 - 0.28, -2.4, -i * 0.25); m.rotation.y = i * 0.6; g.add(m); } return g; })(),
    rock: c3Mesh(seaRockGeo(1.1, 'fgrock', 0.8), rockM[0], 0.03),
    coral: (() => { const c = seaCoral(4); c.scale.setScalar(0.7); return c; })(),
    bubbles: (() => { const g = new THREE.Group(); for (let i = 0; i < 12; i++) { const R = RNG('fgb', i); const b = new THREE.Mesh(new THREE.SphereGeometry(R.r(0.05, 0.18), 14, 10), bubM); b.position.set(R.n(0.5), R.n(1.2), R.n(0.3)); g.add(b); } return g; })(),
    fish: (() => { const f = seaMiniFish(3); f.g.scale.setScalar(0.45); return f.g; })(),
    tank: (() => { const g = seaTank(); g.scale.setScalar(0.45); return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; f.traverse((m) => { m.userData.noCast = true; }); });
  c3Env(scene, { top: '#c8f6ff', mid: '#2a8ab0', bot: '#0a2a3a', cards: [[0, 30, 0, 40, 8, '#f0fcff'], [-30, 10, 10, 10, 18, '#7ad8f4'], [30, 12, -10, 10, 18, '#ffffff'], [0, 8, 40, 30, 8, '#ffd8a0']] });
  c3Shadows(scene, key, 24, { radius: 10 });
  return s;
}
const seaGet = () => SEA.s ||= seaBuild();
// is (x, z) clear of every shot's camera and of the first 85 % of its line of sight? (scattered dressing only)
function seaClear(x, z, r = 0) {
  const Ks = SEA.cams ||= [SEA_K18, SEA_K19, SEA_K20, SEA_K21, SEA_K22, SEA_K23, SEA_K24, SEA_K27, SEA_K28, SEA_K34, SEA_K35].flatMap((K) => K.map((k) => [k[1], k[2]]));
  for (const [P, L] of Ks) { const dx = L[0] - P[0], dz = L[2] - P[2], ll = dx * dx + dz * dz, u = clamp(((x - P[0]) * dx + (z - P[2]) * dz) / (ll || 1), 0, 0.85);
    if (Math.hypot(x - P[0] - u * dx, z - P[2] - u * dz) < 5 + r) return false; if (Math.hypot(x - P[0], z - P[2]) < 10 + r) return false; }
  return true;
}

// ---- per-frame world: kelp sway, caustics, surface, god rays, schools; dynamic sets start hidden each frame
function seaWorld(s, t, o = {}) {
  const kt = o.kelpT ?? t; s.kelpMats.forEach((m) => { m.userData.uT.value = kt; });
  s.caustic.material.uniforms.uT.value = o.causticT ?? t;
  s.surfTex.offset.set(t * 0.012, t * 0.007);
  const rt = o.rayT ?? t, boost = o.rayBoost ?? 1;
  s.rays.forEach((r) => { const u = r.userData; r.material.opacity = u.base * (0.62 + 0.38 * Math.sin(rt * u.sp + u.ph)) * boost; r.rotation.z = 0.2 + 0.05 * Math.sin(rt * 0.35 + u.ph); });
  [s.fish.g, s.crab.g, s.octo.g, ...s.boxes.map((b) => b.g), ...s.tanks, ...s.guns.map((g) => g.g), ...s.trickle, ...Object.values(s.fx).flat()].forEach((m) => { m.visible = false; });
  s.mini.forEach((f) => { f.g.visible = false; });
  s.bubList = []; s.puffList = [];
}
function seaKey(s, x, z, k = 1) { s.key.position.set(x + 12, 50, z + 20); s.key.target.position.set(x, 0, z); s.key.target.updateMatrixWorld(); s.key.intensity = 1.3 * k; }
// marine snow around the camera, then the dome on the camera, caustic fade from it, bubbles + puffs, render
function seaRender(s, t, o = {}) {
  const c = s.cam.position, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = seaV(1, 1, 1), p = seaV(0, 0, 0);
  s.snowSeed.forEach(([x, y, z, ph], i) => { p.set(c.x - 35 + mod(x + Math.sin(t * 0.3 + ph) * 0.6 - c.x, 70), c.y - 22 + mod(y - t * 0.22 - c.y, 44), c.z - 35 + mod(z + t * 0.12 - c.z, 70)); m4.compose(p, q, one); s.snow.setMatrixAt(i, m4); });
  s.snow.instanceMatrix.needsUpdate = true;
  s.dome.position.copy(c); s.caustic.material.uniforms.cam.value.copy(c);
  seaFlushBubbles(s, t); seaFlushPuffs(s, t);
  s.fx.sparkle.concat(s.fx.stars).forEach((m) => { if (m.visible) m.quaternion.copy(s.cam.quaternion); });
  seaRender1(s, o);
}
const seaRender1 = (s, o) => c3Render(s.scene, s.cam, Object.assign({ bg: SEA_FOG, bgBlur: 2.4, nearBlur: 10, glow: 0.55, glowBlur: 16, bloom: 0.12, grade: 'saturate(1.45) contrast(1.18) brightness(0.88)' }, o));
// bubbles: emitters { key, at: (tb) => [x, y, z], t0, t1, rate, size: [a, b], spread, life, rise }
function seaBubbles(s, t, list) { s.bubList.push(...list); }
function seaFlushBubbles(s, t) {
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = seaV(0, 0, 0), sc = seaV(0, 0, 0); let n = 0;
  for (const e of s.bubList) {
    const k0 = Math.ceil(Math.max(e.t0, t - (e.life ?? 3)) * e.rate), k1 = Math.floor(Math.min(t, e.t1) * e.rate);
    for (let k = k0; k <= k1 && n < 360; k++) { const tb = k / e.rate, age = t - tb, R = RNG('bub', e.key, k), a = e.at(tb), sp = e.spread ?? 0.3;
      const sz = R.r(...(e.size ?? [0.1, 0.3])) * (1 + 0.2 * age);
      p.set(a[0] + R.n(sp) + Math.sin(age * 5 + R.r(0, 6)) * 0.12, a[1] + (e.rise ?? 2.4) * age + 0.4 * age * age, a[2] + R.n(sp) + Math.cos(age * 4 + R.r(0, 6)) * 0.1);
      sc.set(sz, sz * (0.92 + 0.08 * Math.sin(age * 20)), sz); m4.compose(p, q, sc); s.bub.setMatrixAt(n++, m4); }
  }
  for (; n < 360; n++) { sc.set(0, 0, 0); m4.compose(p.set(0, -50, 0), q, sc); s.bub.setMatrixAt(n, m4); }
  s.bub.instanceMatrix.needsUpdate = true;
}
// sand puffs: [x, y, z, t0, scale]
function seaPuffs(s, t, list) { s.puffList.push(...list); }
function seaFlushPuffs(s, t) {
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = seaV(0, 0, 0), sc = seaV(0, 0, 0); let n = 0;
  s.puffList.forEach(([x, y, z, t0, k = 1], j) => { const age = t - t0; if (age < 0 || age > 1.8) return;
    for (let i = 0; i < 14 && n < 240; i++) { const R = RNG('puff', j, i, Math.round(t0 * 100)), a = R.r(0, TAU), up = R.r(0.1, 0.7), d = (1 - Math.exp(-age * 3)) * 2.4 * k * R.r(0.6, 1.2);
      p.set(x + Math.cos(a) * d, y + up * d * 0.8 + age * 0.5, z + Math.sin(a) * d); const r = (0.3 + 0.6 * age) * k * (1 - age / 1.8); sc.set(r, r * 0.8, r); m4.compose(p, q, sc); s.puff.setMatrixAt(n++, m4); } });
  for (; n < 240; n++) { sc.set(0, 0, 0); m4.compose(p.set(0, -50, 0), q, sc); s.puff.setMatrixAt(n, m4); }
  s.puff.instanceMatrix.needsUpdate = true;
}
// a sprite (sparkle / stars) at a world point, size, alpha
function seaFx(s, kind, i, pos, size, alpha = 1) { const m = s.fx[kind][i]; m.visible = alpha > 0.01 && size > 0.01; m.position.set(...pos); m.scale.setScalar(size); m.material.opacity = alpha; }
const seaPop = (t, t0, d = 0.4) => { const u = (t - t0) / d; return u < 0 || u > 1 ? 0 : Math.sin(u * Math.PI) * (1 + 0.3 * (1 - u)); };
// little fish: [cx, cy, cz, rx, rz, speed, count, first index, phase]
function seaSchool(s, t, list) {
  list.forEach(([cx, cy, cz, rx, rz, sp, n, i0, ph = 0]) => { for (let k = 0; k < n; k++) { const f = s.mini[i0 + k]; if (!f) continue; const R = RNG('school', i0 + k), a = t * sp + k * 0.5 + ph + R.n(0.2);
    f.g.visible = true; f.g.scale.setScalar(0.55); f.g.position.set(cx + Math.cos(a) * rx + R.n(1), cy + R.n(1.4) + Math.sin(t * 2 + k) * 0.3, cz + Math.sin(a) * rz + R.n(1));
    f.g.rotation.set(0, -a - (sp > 0 ? Math.PI / 2 : -Math.PI / 2), 0); f.tail.rotation.y = Math.sin(t * 16 + k) * 0.5; } });
}
// a straight crossing: fish i0..i0+n swim from a to b between t0 and t1
function seaCross(s, t, a, b, t0, t1, n, i0) {
  for (let k = 0; k < n; k++) { const f = s.mini[i0 + k], R = RNG('cross', i0 + k), u = seg(t, t0 + k * 0.08, t1 + k * 0.08); if (!f || u <= 0 || u >= 1) continue;
    f.g.visible = true; f.g.scale.setScalar(0.55); f.g.position.set(lerp(a[0], b[0], u) + R.n(1.5), lerp(a[1], b[1], u) + R.n(1.2), lerp(a[2], b[2], u) + R.n(1.5));
    f.g.rotation.set(0, Math.atan2(-(b[2] - a[2]), b[0] - a[0]), 0); f.tail.rotation.y = Math.sin(t * 18 + k) * 0.5; }
}

// ---- A: the boxes (fall, land, glow), the tanks and guns that come out of the diver box
function seaBoxesAt(s, t, o = {}) {
  const sea = o.sea ?? 1e9;
  s.boxes.forEach((b, i) => { const [, x, z, yaw, tl] = SEA_BOXES[i], d = tl - t, sgn = i % 2 ? 1 : -1; b.g.visible = true;
    if (d > 0) { b.g.position.set(x + Math.sin(d * 1.7 + i) * 0.5 * Math.min(1, d), 0.7 + 5.2 * d, z); b.g.rotation.set(-Math.PI / 2 + 1.1 * d * sgn, yaw + 0.5 * d, 0.7 * d * ((i % 3) - 1)); }
    else { const age = -d; b.g.position.set(x, 0.7 + 0.42 * Math.abs(Math.sin(age * 8)) * Math.exp(-age * 7), z); b.g.rotation.set(-Math.PI / 2 + 0.06 * Math.sin(age * 9) * Math.exp(-age * 5), yaw, 0.04 * sgn); }
    const isSea = SEA_THEMES[b.theme].sea, k = EZ.o2(seg(t, sea - 0.05, sea + 0.2));
    if (isSea) { b.em.material.opacity = 0.85 * k * (0.75 + 0.25 * Math.sin(t * 11 + i)); b.g.position.y += 0.6 * Math.sin(Math.PI * seg(t, sea + i * 0.04, sea + 0.28 + i * 0.04)); }
    else b.lid.children[1].material.color.setScalar(lerp(1, 0.5, k));
    b.lid.rotation.x = i === SEA_HERO ? -1.95 * EZ.back(seg(t, 27.9, 28.12)) : 0; });
}
const SEA_HERO_P = [0.3, 1.0, 2.6];   // the diver box's mouth
// the tanks leave the box from their own slots and fan out to the right/back (the guns go left); a few relaxation passes
// push apart any two that would still touch (tank ~1.7 wide, ~2.8 tall), so no two ever pass through each other
const SEA_TANK_S = [[-0.5, -0.5, 0.9, -1.4], [1.0, 0.5, 2.0, 0.6], [0.2, -0.6, 0.5, -2.4], [1.2, -0.4, 2.4, -1.1], [-0.4, 0.6, 0.6, 1.5]];   // x0, z0, vx, vz
function seaTankAll(t) {
  const P = SEA_TANK_S.map(([x0, z0, vx, vz], i) => { const age = t - 27.98 - i * 0.13; if (age < 0) return null;
    return [SEA_HERO_P[0] + x0 + vx * age, SEA_HERO_P[1] + 3.4 * age + 6 * Math.max(0, age - 0.7) ** 2, SEA_HERO_P[2] + z0 + vz * age]; });
  for (let it = 0; it < 8; it++) for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const a = P[i], b = P[j]; if (!a || !b || Math.abs(a[1] - b[1]) > 2.9) continue;
    let dx = b[0] - a[0], dz = b[2] - a[2]; const d = Math.hypot(dx, dz); if (d >= 1.8) continue; if (d < 1e-4) { dx = 1; dz = 0; } const k = (1.8 - (d || 0)) / 2 / (d || 1);
    a[0] -= dx * k; a[2] -= dz * k; b[0] += dx * k; b[2] += dz * k; }
  return P;
}
function seaTanksAt(s, t) {
  const P = seaTankAll(t);
  s.tanks.forEach((g, i) => { const age = t - 27.98 - i * 0.13, R = RNG('tank', i); if (age < 0) return; g.visible = true; g.position.set(...P[i]);
    g.rotation.set(Math.sin(age * 1.8 + i) * 0.16, age * R.r(0.6, 1.2) * (i % 2 ? 1 : -1) + i, Math.sin(age * 2.3 + i) * 0.16); });
  seaBubbles(s, t, s.tanks.map((g, i) => ({ key: 'tank' + i, t0: 27.98 + i * 0.13, t1: 1e9, rate: 9, size: [0.08, 0.2], spread: 0.15, life: 1.6, rise: 3.2,
    at: (tb) => { const p = seaTankAll(Math.max(tb, 27.98 + i * 0.13))[i]; return [p[0], p[1] + 2.5, p[2]]; } })));
}
function seaGunsAt(s, t, fire) {
  s.guns.forEach((g, i) => { const te = 28.15 + i * 0.18, age = t - te, R = RNG('gun', i); if (age < 0) return; g.g.visible = true; g.g.scale.setScalar(1.7);
    const rec = i === 0 ? 0.35 * Math.exp(-Math.max(0, t - fire) * 8) * (t > fire ? 1 : 0) : 0;
    g.g.position.set(SEA_HERO_P[0] - 1.6 + [-3.4, -5.6, -2.6][i] * Math.min(1, age) - rec, SEA_HERO_P[1] + [2.2, 2.4, 4.6][i] * age, SEA_HERO_P[2] + [1.4, -1.2, -4.2][i] * Math.min(1, age));
    g.g.rotation.set(0, [-0.15, 2.8, 0.6][i] + Math.sin(age * 1.4) * 0.15, Math.sin(age * 2 + i) * 0.2 + (i === 0 ? 0.08 : 0));
    g.spear.position.x = 0.75 + (i === 0 && t > fire ? 14 * (t - fire) : 0); g.spear.visible = !(i === 0 && t - fire > 0.9); });
}

// =====================================================================
//  s18 — "And of all the sets that could have gone overboard…": under water, toy-set boxes of every theme sink
//  through the god rays and land in the sand (puffs, bubbles trailing)
// =====================================================================
const SEA_K18 = [[0, [1.6, 1.6, 14], [0, 7.5, -1], 54], [2.2, [1.0, 2.2, 12.5], [0, 4.2, -1], 52]];
SHOT_FN['s18'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, 0, 0);
  c3SetCam(s.cam, seaCam(SEA_K18, lt, 's18', { orbit: 0.05 }));
  seaBoxesAt(s, t);
  seaBubbles(s, t, SEA_BOXES.map(([, x, z, , tl], i) => ({ key: 'box' + i, t0: 22, t1: tl, rate: 14, size: [0.1, 0.32], spread: 1.2, life: 2.2, rise: 2.6, at: (tb) => [x, 0.7 + 5.2 * (tl - tb) + 1.2, z] })));
  seaPuffs(s, t, SEA_BOXES.map(([, x, z, , tl]) => [x, 0.2, z, tl, 1.3]));
  seaSchool(s, t, [[-6, 16, -22, 14, 8, 0.25, 7, 0]]);
  seaFg(s, [['kelp', [-1.6, -0.8, -6], 0.25, 0.05], ['bubbles', [1.1, 1.0, -4], -0.15, 0, 0.6]], SEA_K18, 's18', lt, { orbit: 0.05 });
  seaRender(s, t, { bgBlur: seaRack(lt, 's18', 1.6, 2.8) });
};
// =====================================================================
//  s19 — "most of these were sea themed.": the boxes in the sand; on "sea" the sea sets' wave emblems light up and
//  they hop, the castle and space boxes dim; the diver box's lid pops open
// =====================================================================
const SEA_K19 = [[0, [-1.0, 15, 12.5], [0.3, 0.4, -1.2], 48], [1.3, [0.2, 13, 10.6], [0.3, 0.6, -0.6], 46]];
SHOT_FN['s19'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, 0, 0);
  c3SetCam(s.cam, seaCam(SEA_K19, lt, 's19', { orbit: -0.06 }));
  const sea = seaW('sea', 2, 27.38); seaBoxesAt(s, t, { sea }); seaTanksAt(s, t);
  seaPuffs(s, t, SEA_BOXES.map(([, x, z, , tl]) => [x, 0.2, z, tl, 1.3]).concat([[SEA_HERO_P[0], 0.6, SEA_HERO_P[2], 27.95, 1.0]]));
  seaBubbles(s, t, [{ key: 'open', t0: 27.92, t1: 28.4, rate: 40, size: [0.1, 0.35], spread: 1.4, life: 2, rise: 3, at: () => SEA_HERO_P }]);
  SEA_BOXES.forEach(([th, x, z], i) => { if (SEA_THEMES[th].sea) seaFx(s, 'sparkle', [2, 3, 4, 5].indexOf(i), [x + 1.6, 1.4, z - 1.1], 1.4 * seaPop(t, sea + 0.15 + i * 0.05, 0.45)); });
  seaSchool(s, t, [[-4, 9, -16, 12, 6, 0.3, 7, 0]]);
  seaFg(s, [['rock', [-1.3, -2.6, -4.5], 0.3]], SEA_K19, 's19', lt, { orbit: -0.06 });
  seaRender(s, t, { bgBlur: seaRack(lt, 's19', 2.0, 3.0) });
};
// =====================================================================
//  s20 — "Scuba tanks.": out of the open diver box, toy scuba tanks float up, spinning, leaking bubbles from their valves
// =====================================================================
const SEA_K20 = [[0, [4.2, 2.6, 11], [0.4, 2.6, 2], 44], [0.9, [3.6, 3.6, 10.4], [0.4, 4.0, 2], 44]];
SHOT_FN['s20'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, 0, 0);
  c3SetCam(s.cam, seaCam(SEA_K20, lt, 's20', { orbit: 0.08, creep: 0.08 }));
  seaBoxesAt(s, t); seaTanksAt(s, t);
  seaSchool(s, t, [[2, 8, -14, 10, 5, -0.35, 6, 7]]);
  seaFg(s, [['tank', [1.0, -2.0, -4.2], -0.2, 0.4, 1.6]], SEA_K20, 's20', lt, { orbit: 0.08, creep: 0.08 });
  s.fgBy.tank.rotation.set(0.3, lt * 1.5, 0.4);
  seaRender(s, t, { bgBlur: 2.8 });
};
// =====================================================================
//  s21 — "Spear guns.": toy spear guns drift up after them; on "guns" one fires its little spear across the frame
// =====================================================================
const SEA_K21 = [[0, [-3.8, 4.0, 19.5], [-5.0, 4.3, 1.6], 46], [0.6, [-4.4, 4.4, 18.1], [-5.0, 4.6, 1.6], 46]];
SHOT_FN['s21'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, 0, 0);
  const fire = seaW('guns', 1, 29.4);
  c3SetCam(s.cam, seaCam(SEA_K21, lt, 's21', { orbit: 0.12, creep: 0.06 }));
  seaBoxesAt(s, t); seaTanksAt(s, t); seaGunsAt(s, t, fire);
  const g0 = s.guns[0].g; g0.updateMatrixWorld(true);
  seaBubbles(s, t, [{ key: 'spear', t0: fire, t1: fire + 0.6, rate: 60, size: [0.06, 0.16], spread: 0.08, life: 1.2, rise: 1.2, at: (tb) => { const v = seaV(0.75 + 14 * (tb - fire) - 1.5, 1.15, 0); g0.localToWorld(v); return v.toArray(); } }]);
  seaFg(s, [['bubbles', [-1.0, 0.6, -4], 0.25, 0, 0.8]], SEA_K21, 's21', lt, { orbit: 0.12, creep: 0.06 });
  seaRender(s, t, { bgBlur: 2.8 });
};
// =====================================================================
//  s22 — "Seaweed.": real kelp sways, five stiff toy seaweed plants stand among it; the clownfish darts in, bites one —
//  clack — and recoils, dizzy
// =====================================================================
const SEA_K22 = [[0, [60.4, 3.5, 10.8], [64.2, 2.7, 0.5], 42], [1.0, [61.6, 3.3, 9.4], [64.8, 2.7, 0.6], 42]];
SHOT_FN['s22'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, 64, 0);
  c3SetCam(s.cam, seaCam(SEA_K22, lt, 's22'));
  const bite = 30.12, f = s.fish; f.g.visible = true; f.g.scale.setScalar(0.7);
  const a = EZ.o2(seg(t, 29.6, bite)), back = EZ.o3(seg(t, bite + 0.03, bite + 0.35));
  // it bites the plant from just in front of its leaves (z 1.7): on screen the mouth meets the leaf, in depth nothing crosses
  f.g.position.set(lerp(57.4, 64.3, a) - 1.4 * back, lerp(3.6, 2.85, a) + 0.25 * back, lerp(2.7, 2.4, a) + 0.3 * back);
  f.g.rotation.set(0, 0.22 - 0.4 * back, 0);
  seaFishPose(f, t, { swim: t < bite ? 1.4 : 0.4, gaze: t < bite ? [0.2, -0.3] : [-0.4, 0.5], lid: t < bite ? 'open' : 'wide', mouth: t < bite - 0.18 ? 'smile' : t < bite + 0.05 ? 'oh' : 'flat', roll: 0.4 * Math.sin(Math.PI * back) });
  // the bitten plant: a stiff plastic wobble
  s.toyWeeds.forEach((w, i) => { w.rotation.z = i === 2 ? 0.12 * Math.sin((t - bite) * 30) * Math.exp(-(t - bite) * 6) * (t > bite ? 1 : 0) : 0; });
  seaFx(s, 'stars', 0, [f.g.position.x - 0.2, f.g.position.y + 1.6, f.g.position.z], 1.8 * clamp((t - bite - 0.08) / 0.1) * (t > bite ? 1 : 0), 1);
  if (s.fx.stars[0].visible) s.fx.stars[0].rotation.z = 0;
  seaBubbles(s, t, [{ key: 'bite', t0: bite, t1: bite + 0.25, rate: 40, size: [0.08, 0.2], spread: 0.3, life: 1.2, rise: 2, at: () => [65.6, 2.8, 1.6] }]);
  seaSchool(s, t, [[64, 10, -18, 12, 6, 0.3, 7, 0]]);
  seaFg(s, [['kelp', [-1.6, -0.8, -6], 0.3, 0.08]], SEA_K22, 's22', lt);
  seaRender(s, t, { bgBlur: seaRack(lt, 's22', 2.0, 2.8) });
};
// =====================================================================
//  s23 — "Octopuses.": three toy octopuses sit on a rock; a real octopus rises behind it, sees them — shock
// =====================================================================
const SEA_K23 = [[0, [92.0, 4.8, 11.5], [92.0, 3.4, -1.0], 40], [0.6, [92.4, 4.5, 9.8], [92.2, 3.8, -1.0], 38]];
SHOT_FN['s23'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, 92, 0);
  c3SetCam(s.cam, seaCam(SEA_K23, lt, 's23', { creep: 0.1 }));
  const o = s.octo, shock = 30.84; o.g.visible = true;
  o.g.position.set(92.6, lerp(-3, 2.0, EZ.o3(seg(t, 30.58, 30.8))) + 0.35 * Math.sin(Math.PI * seg(t, shock, shock + 0.2)), -7.4); o.g.scale.setScalar(1.25);   // rises from BEHIND the rock (it ends at z -5.8), clear of the toys
  seaOctoPose(o, t, { flare: EZ.back(seg(t, shock, shock + 0.12)), lid: t < shock ? 'open' : 'wide', gaze: t < shock ? [-0.3, -0.7] : [0, -0.1] });
  seaBubbles(s, t, [{ key: 'octo', t0: 30.6, t1: 31.2, rate: 24, size: [0.08, 0.25], spread: 1.2, life: 1.5, rise: 2.5, at: () => [92.6, 2.4, -7.4] }]);
  seaFg(s, [['coral', [1.2, -2.6, -4.5], -0.3]], SEA_K23, 's23', lt, { creep: 0.1 });
  seaRender(s, t, { bgBlur: 2.6 });
};
// =====================================================================
//  s24 — "So the ocean basically got its own Lego collection.": the clownfish's museum — pieces on pedestals with brass
//  plaques, a velvet rope, a driftwood sign; the fish nudges the octopus into place, then turns to us, proud
// =====================================================================
const SEA_K24 = [[0, [118.6, 6.8, 21.5], [120.6, 6.6, 0], 42], [1.2, [121.0, 7.0, 20.5], [121.6, 6.8, 0], 42], [2.3, [122.2, 7.1, 19.5], [122.0, 7.0, 0.5], 41]];
SHOT_FN['s24'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, 122, 0);
  c3SetCam(s.cam, seaCam(SEA_K24, lt, 's24', { orbit: 0.02 }));
  const nudge = 32.3, coll = seaW('collection', 1, 32.9), f = s.fish; f.g.visible = true; f.g.scale.setScalar(0.95);
  const a = EZ.io(seg(t, 31.2, nudge)), turn = EZ.io(seg(t, nudge + 0.15, nudge + 0.5)), push = EZ.o2(seg(t, nudge - 0.02, nudge + 0.14));
  // the fish swims up to the toy's left-front side and its nose pushes it right/back onto the pedestal (they touch, never overlap)
  f.g.position.set(lerp(113.8, 118.3, a) + 0.8 * push + 0.4 * turn, lerp(6.9, 6.5, a) + 0.9 * turn, lerp(2.8, 1.0, a) - 0.4 * push + 1.6 * turn);
  f.g.rotation.set(0, lerp(-0.2, -0.95, turn), 0);
  seaFishPose(f, t, { swim: t < nudge ? 1 : 0.5, gaze: t < nudge + 0.3 ? [0.4, -0.4] : [0, 0], lid: t > nudge + 0.4 ? 'smug' : 'open', mouth: 'smile', pitch: -0.15 * turn });
  const oc = s.mPieces[2], k = EZ.back(seg(t, nudge - 0.02, nudge + 0.14));
  oc.position.set(lerp(-0.7, 0, k), 4.5, lerp(0.7, -0.3, k)); oc.rotation.y = lerp(0.9, 0, k);
  s.mPieces.forEach((p, i) => { if (i !== 2) p.rotation.y = (i === 1 ? 0.5 : 0) + Math.sin(t * 0.8 + i) * 0.15; });
  s.spot.material.opacity = 0.14 + 0.2 * EZ.o2(seg(t, coll - 0.1, coll + 0.2));
  [[-1.3, 1.3], [1.5, 0.9], [0.2, 2.0]].forEach(([dx, dy], i) => seaFx(s, 'sparkle', i, [f.g.position.x + dx, f.g.position.y + dy, f.g.position.z + 0.5], 1.4 * seaPop(t, coll + i * 0.08, 0.5)));
  seaBubbles(s, t, [{ key: 'mfish', t0: 31.2, t1: 33.5, rate: 6, size: [0.08, 0.18], spread: 0.2, life: 2, rise: 2, at: (tb) => [lerp(113.8, 118.9, EZ.io(seg(tb, 31.2, nudge))) + 1.4, 6.4, 2] }]);
  seaSchool(s, t, [[122, 13, -16, 14, 6, -0.25, 7, 7]]);
  seaFg(s, [['kelp', [1.6, -1.0, -6], -0.3, -0.05]], SEA_K24, 's24', lt, { orbit: 0.02 });
  seaRender(s, t, { bgBlur: seaRack(lt, 's24', 2.2, 3.0) });
};
// =====================================================================
//  s27 — "You see, plastic doesn't really go away.": one red brick on the sand, a sunken clock whirring through the
//  years (barnacles grow, it sinks, it greens), a sign rolls 1997 -> 2026, kelp sprouts and the light races (time-lapse)
//  — the brick stays exactly the same and glints
// =====================================================================
const SEA_K27 = [[0, [-34.6, 3.2, 12.5], [-36.0, 2.4, -1.0], 40], [2.0, [-35.6, 2.7, 10.6], [-36.0, 2.2, -1.0], 38]];
function seaYearDraw(s, y) {
  if (s.yearShown === y) return; s.yearShown = y; const x = s.yearCv.getContext('2d'), w = s.yearCv.width, h = s.yearCv.height;
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#b88a52'); g.addColorStop(1, '#8a6034'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(60,30,10,0.35)'; for (let i = 0; i < 10; i++) { x.lineWidth = 2; x.beginPath(); x.moveTo(0, i * h / 10 + 6); x.lineTo(w, i * h / 10 + 3); x.stroke(); }
  inked(x, 'YEAR', w / 2, h * 0.2, h * 0.16, '#fff4d8', { stroke: '#3a1e0a', sw: 6 });
  inked(x, String(y), w / 2, h * 0.62, h * 0.48, '#fff4d8', { stroke: '#3a1e0a', sw: 14 }); s.yearTex.needsUpdate = true;
}
SHOT_FN['s27'] = (t, u, lt) => {
  const s = seaGet(), p = EZ.io(seg(t, 39.15, 40.85));
  seaWorld(s, t, { rayT: t + 34 * p, causticT: t + 30 * p, kelpT: t + 14 * p }); seaKey(s, -36, 0);
  c3SetCam(s.cam, seaCam(SEA_K27, lt, 's27', { orbit: 0.06 }));
  seaYearDraw(s, Math.round(1997 + 29 * p));
  s.minH.rotation.z = -p * TAU * 60; s.hourH.rotation.z = -p * TAU * 5;
  s.barn.forEach((b, i) => { const k = clamp(p * 1.7 - i * 0.03); b.scale.setScalar(k); b.visible = k > 0.01; });
  s.clock.position.y = 0.55 - 0.4 * p; s.brassM.color.set('#c8963a').lerp(new THREE.Color('#6a8a6a'), p * 0.8);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 7; i++) { const R = RNG('sprout', i); e.set(0, R.r(0, TAU), 0); q.setFromEuler(e); const hgt = lerp(0.2, R.r(3.5, 6), clamp(p * 1.3 - i * 0.05));
    m4.compose(seaV(R.r(-6, 5), 0, R.r(-4.5, -2.4)), q, seaV(R.r(1.0, 1.5), hgt, 1)); s.sprouts.setMatrixAt(i, m4); }
  s.sprouts.instanceMatrix.needsUpdate = true;
  const dn = seaW('doesnt', 1, 39.9), aw = seaW('away', 1, 40.6);
  seaFx(s, 'sparkle', 0, [-35.0, 1.5, 2.6], 1.3 * seaPop(t, dn - 0.05, 0.45)); seaFx(s, 'sparkle', 1, [-36.8, 1.3, 2.4], 1.6 * seaPop(t, aw - 0.05, 0.5));
  s.crab.g.visible = true; s.crab.g.scale.setScalar(0.8); s.crab.g.position.set(lerp(-41, -31, seg(t, 39.25, 40.75)), 0, -0.1);   // between the clock (z < -1.0) and the brick (z > 0.7) s.crab.g.rotation.y = 0; seaCrabPose(s.crab, t, 3);
  seaPuffs(s, t, [[-38.4, 0.3, -1.6, 39.4, 0.8], [-37.6, 0.3, -2.9, 39.95, 0.8], [-38.9, 0.3, -2.4, 40.45, 0.8]]);
  seaCross(s, t, [-50, 6.5, -9], [-22, 7.5, -10], 39.3, 39.55, 3, 0); seaCross(s, t, [-22, 5.5, -11], [-50, 6.0, -10], 39.9, 40.15, 3, 3); seaCross(s, t, [-50, 8, -12], [-22, 7.5, -11], 40.4, 40.65, 3, 6);
  seaFg(s, [['rock', [-1.3, -2.4, -4.2], 0.3]], SEA_K27, 's27', lt, { orbit: 0.06 });
  seaRender(s, t, { bgBlur: seaRack(lt, 's27', 2.2, 3.0) });
};
// =====================================================================
//  s28 — "It floats, it sinks, it rides the currents around,": mid-water; on "floats" a brick bobs up, on "sinks" a
//  flipper falls like a leaf, on "rides" the current ribbons speed up and sweep pieces around
// =====================================================================
const SEA_K28 = [[0, [-74, 11.5, 22], [-74, 11, 0], 48], [1.0, [-72.8, 12.2, 20], [-73.6, 11.3, 0], 48], [2.1, [-67, 11.4, 17], [-71.5, 11, -1], 50]];
SHOT_FN['s28'] = (t, u, lt) => {
  const s = seaGet(); seaWorld(s, t); seaKey(s, -74, 0);
  c3SetCam(s.cam, seaCam(SEA_K28, lt, 's28', { orbit: 0.04 }));
  const fl = seaW('floats', 1, 41.1), sk = seaW('sinks', 1, 41.6), rd = seaW('rides', 1, 42.0), fast = Math.max(0, t - rd);
  s.chev.offset.y = -(t * 0.5 + 1.8 * fast ** 1.3);
  s.floater.position.set(-4.2, lerp(-5, 2.6, EZ.o2(seg(t, fl - 0.05, fl + 0.6))) + Math.sin(t * 3) * 0.25, 3); s.floater.rotation.set(Math.sin(t * 2) * 0.3, t * 0.8, Math.sin(t * 2.4) * 0.3);
  const sv = EZ.i2(seg(t, sk - 0.05, sk + 1.2)); s.sinker.position.set(4.5 + Math.sin(t * 5) * 0.8 * sv, lerp(5, -4.5, sv), 2.5); s.sinker.rotation.set(0.4, t * 0.5, Math.sin(t * 6) * 0.7);
  s.riders.forEach((p, i) => { const c = s.curves[i % 3], uu = mod(i * 0.29 + 0.02 * (t - 41) + 0.2 * fast ** 1.25, 1), pt = c.getPointAt(uu), tg = c.getTangentAt(uu);
    p.position.copy(pt); p.lookAt(pt.clone().add(tg)); p.rotateX(t * 2 + i); });
  seaBubbles(s, t, [{ key: 'flt', t0: fl, t1: fl + 2, rate: 12, size: [0.08, 0.2], spread: 0.3, life: 1.5, rise: 2.4, at: (tb) => [-78.2, 11 + lerp(-5, 2.6, EZ.o2(seg(tb, fl - 0.05, fl + 0.6))) + 1, 3] }]);
  seaSchool(s, t, [[-74, 6, -14, 16, 7, 0.4 + 0.6 * Math.min(1, fast), 8, 0]]);
  seaFg(s, [['fish', [1.6, 1.4, -4.5], -1.6]], SEA_K28, 's28', lt, { orbit: 0.04 });
  seaRender(s, t, { bgBlur: 2.6, glow: 0.7 });
};
// =====================================================================
//  s34 — "All because one wave knocked over one box…": the container on the seabed, half sunk, rusted, barnacled, kelp on
//  its roof, a crab walking across it, fish passing; on "one box" the light falls on it
// =====================================================================
const SEA_K34 = [[0, [-83.0, 23.0, 31.0], [-117.0, 3.0, -4.0], 54], [2.5, [-86.0, 21.0, 27.5], [-116.0, 3.4, -4.0], 52]];   // three-quarter: the long ribbed side + the door end
function seaTrickle(s, t, i0, i1, t0, dt, spd = 1) {
  const HC = s.cont; HC.updateMatrixWorld(true);
  for (let i = i0; i < i1; i++) { const p = s.trickle[i], R = RNG('trk', i), te = t0 + (i - i0) * dt, age = t - te; if (age < 0) continue; p.visible = true;
    // out through the gap at the right leaf's free edge (local z -0.9..0): from inside the mouth straight out along +x,
    // spreading only to +z once clear of the doors (the open leaf fills the wedge z < -0.9 in front of the end)
    const x = 12.9 + 1.5 * age * spd + Math.abs(Math.sin(age * 2 + i)) * 0.3;
    const v = seaV(x, -2.6 + R.r(0, 3.4) + (2.0 * age + 0.4 * age * age) * spd, -0.5 + R.r(-0.18, 0.18) + Math.max(0, x - 13.9) * R.r(0.1, 0.9));
    HC.localToWorld(v); p.position.copy(v); p.rotation.set(age * R.r(1, 3), age * R.r(1, 3) + i, Math.sin(age * 3) * 0.6); }
}
SHOT_FN['s34'] = (t, u, lt) => {
  const s = seaGet(), one = seaW('box', 1, 59.4), pulse = Math.sin(Math.PI * seg(t, one - 0.35, one + 0.4));
  seaWorld(s, t, { rayBoost: 1 + 1.1 * pulse }); seaKey(s, -120, 0, 1 + 0.35 * pulse);
  c3SetCam(s.cam, seaCam(SEA_K34, lt, 's34', { orbit: -0.02, creep: 0.02 }));
  s.door.rotation.y = 0.55 + 0.03 * Math.sin(t * 1.5);   // ajar enough for the trickle to pass the free edge
  seaTrickle(s, t, 0, 4, 56.6, 0.7, 0.5);
  const cr = s.crab; cr.g.visible = true; cr.g.scale.setScalar(1.1); const v = seaV(lerp(-9, 3, seg(t, 57.3, 59.8)), 5.0, 1.2); s.cont.updateMatrixWorld(true); s.cont.localToWorld(v);
  cr.g.position.copy(v); cr.g.quaternion.copy(s.cont.quaternion); seaCrabPose(cr, t, 1);
  seaCross(s, t, [-100, 8.5, 6], [-118, 9, -14], 57.5, 59.4, 8, 0);
  seaBubbles(s, t, [{ key: 'cont', t0: 55, t1: 62, rate: 5, size: [0.1, 0.3], spread: 2.5, life: 3, rise: 2, at: () => [-112, 9, 2] }]);
  seaFg(s, [['rock', [-1.5, -2.6, -5.5], 0.3]], SEA_K34, 's34', lt, { orbit: -0.02, creep: 0.02 });
  seaRender(s, t, { bgBlur: seaRack(lt, 's34', 1.8, 2.6) });
};
// =====================================================================
//  s35 — "that refuses to leave.": the door shudders open and a stream of pieces drifts out and up toward the light
//  (the camera tilts up into the bright surface — the loop goes back to the beach)
// =====================================================================
const SEA_K35 = [[0, [-87.0, 19.0, 25.0], [-113.0, 4.0, -5.0], 52], [1.3, [-93.5, 11.0, 11.0], [-107.5, 6.0, -6.0], 50], [1.7, [-94.5, 12.0, 10.0], [-103, 30, -8], 58]];   // door + stream, tilt up only in the last 0.4 s
SHOT_FN['s35'] = (t, u, lt) => {
  const s = seaGet(), rf = seaW('refuses', 1, 60.2);
  seaWorld(s, t, { rayBoost: 1.3 + 0.8 * EZ.io(u) }); seaKey(s, -120, 0, 1.2);
  c3SetCam(s.cam, seaCam(SEA_K35, lt, 's35', { orbit: -0.02, rush: 0.02 }));
  const sh = seg(t, rf - 0.1, rf + 0.25);
  s.door.rotation.y = 0.55 + 0.08 * Math.sin(t * 40) * Math.sin(Math.PI * sh) + 0.4 * EZ.back(seg(t, rf + 0.15, rf + 0.45));
  seaTrickle(s, t, 0, 4, 56.6, 0.7, 0.5); seaTrickle(s, t, 4, 30, rf + 0.1, 0.045, 1.25);
  seaPuffs(s, t, [[-108.5, 0.6, 3.5, rf + 0.2, 1.6], [-110, 0.6, 1.0, rf + 0.25, 1.4]]);
  seaBubbles(s, t, [{ key: 'door', t0: rf, t1: 62, rate: 30, size: [0.1, 0.3], spread: 1.2, life: 2.5, rise: 3, at: () => { const v = seaV(14.2, -1, -0.5); s.cont.localToWorld(v); return v.toArray(); } }]);
  seaFg(s, [['bubbles', [1.0, -0.6, -4], -0.15, 0, 1.0]], SEA_K35, 's35', lt, { orbit: -0.02, rush: 0.02 });
  seaRender(s, t, { bgBlur: 2.4, bloom: 0.36 });
};
