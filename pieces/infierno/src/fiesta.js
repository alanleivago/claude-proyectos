// =====================================================================
//  FIESTA — a night fiesta patronal on the main street of a colonial town (shots party, bang, body, memory, phone).
//  The street runs along -z (x -5..5 cobbles, raised sidewalks to ±7) between colourful colonial facades with lit
//  windows; at its end (z -96) the floodlit church with two bell towers, outlined with bulbs. Across the street: warm
//  string lights, papel picado that waves, paper lanterns. Food stalls on the sidewalks, a brass band on a tarima,
//  a dancing crowd (heroes with faces up close, an instanced crowd behind), fireworks (deterministic bursts with
//  trails, rockets, a flash light), confetti, haze. The phone shot has its own small stage: a dim tiled hallway.
//  World time for the party = vt (the memory replays it in slow motion).
// =====================================================================
const FIESTA_Z = { HALF: 5, WALK: 7, CH: -96, BODY: [0.32, -1.95] };
const fiestaCol = ['#d8553a', '#e8b13a', '#3a6fb0', '#e48aa8', '#3aa59a', '#f0e2c0', '#b8402e', '#86b04a', '#e07a2e', '#7a5ab8', '#2e8a6a', '#f2c6a0'];
const fiestaTex = {};
// soft glow sprite for bulbs (hot core + halo)
const fiestaBulbTex = () => fiestaTex.bulb || (fiestaTex.bulb = g3Radial([[0, 'rgba(255,255,255,1)'], [0.07, 'rgba(255,255,255,1)'], [0.16, 'rgba(255,255,255,0.42)'], [0.4, 'rgba(255,255,255,0.1)'], [1, 'rgba(255,255,255,0)']], 128));
// glowing points: fill(i) -> [x, y, z, r, g, b, size(m), phase]. Flicker in the shader (uT), screen-size floor so far bulbs stay.
function fiestaPts(par, n, fill, o = {}) {
  const P = new Float32Array(n * 3), Cc = new Float32Array(n * 3), A = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const v = fill(i); P.set(v.slice(0, 3), i * 3); Cc.set(v.slice(3, 6), i * 3); A.set([v[6], v[7]], i * 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aC', new THREE.BufferAttribute(Cc, 3)); g.setAttribute('aA', new THREE.BufferAttribute(A, 2));
  const U = { uT: { value: 0 }, uMap: { value: o.map || fiestaBulbTex() }, uFl: { value: o.flick ?? 0.25 }, uK: { value: 1 }, uMin: { value: o.min ?? 2.5 } };
  const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `uniform float uT, uFl, uK, uMin; attribute vec3 aC; attribute vec2 aA; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float ph = aA.y;
        float f = 1.0 - uFl * (0.5 + 0.5 * sin(uT * (2.0 + fract(ph * 7.3) * 6.0) + ph * 40.0)) * 0.6; f *= 1.0 - uFl * step(0.985, fract(sin(floor(uT * 9.0) + ph * 91.7) * 4375.5)) * 0.9;
        float s = aA.x * projectionMatrix[1][1] * 960.0 / max(0.1, -mv.z); float ps = max(uMin, s); vC = aC * f * uK * min(1.0, (s * s) / (ps * ps) + 0.35) * smoothstep(260.0, 120.0, -mv.z); gl_PointSize = ps; }`,
    fragmentShader: 'uniform sampler2D uMap; varying vec3 vC; void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb * t.a, 1.0); }' });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; (par.scene || par).add(pts); return { pts, U };
}
// the night sky: deep blue to a warm city-glow horizon, stars that twinkle, faint smoke drifting from the fireworks
function fiestaSky(st) { const U = { uT: { value: 0 }, uK: { value: 1 } };
  const m = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform float uT, uK; varying vec3 vD;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * vn(p); p = p * 2.03 + 1.7; m *= 0.5; } return a; }
void main(){ vec3 d = normalize(vD); float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(vec3(0.16, 0.07, 0.09), vec3(0.012, 0.016, 0.045), pow(h, 0.45)); col += vec3(0.32, 0.12, 0.05) * exp(-h * 14.0) * 0.8;
  vec2 c = vec2(atan(d.z, d.x), asin(d.y)) * 260.0; vec2 ci = floor(c); float s = h2(ci); float st = step(0.982, s) * smoothstep(0.42, 0.0, length(fract(c) - 0.5)) * (0.55 + 0.45 * sin(uT * (1.0 + s * 4.0) + s * 90.0));
  col += vec3(0.85, 0.9, 1.0) * st * smoothstep(0.08, 0.3, d.y) * (0.5 + 1.5 * fract(s * 37.0));
  if (d.y > 0.0) { vec2 cp = d.xz / (d.y + 0.15); float sm = fbm(cp * 1.4 + vec2(uT * 0.02, 0.0)); col += vec3(0.16, 0.1, 0.12) * smoothstep(0.5, 0.85, sm) * smoothstep(0.02, 0.25, d.y) * 0.6; }
  if (d.y < 0.0) col = vec3(0.1, 0.05, 0.05);
  gl_FragColor = vec4(col * uK, 1.0); }` })); m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); return U; }
// a catenary from a to b sagging by s: point at u
const fiestaCat = (a, b, s, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - s * 4 * u * (1 - u), lerp(a[2], b[2], u)];
// papel picado: one flag texture (alpha cut-outs: a scalloped edge, flowers, diamonds, a little church) and its colours
function fiestaPicadoTex() { return g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#000';
  for (let i = 0; i < 9; i++) { x.beginPath(); x.arc((i + 0.5) * w / 9, h + 2, w / 18, Math.PI, 0); x.fill(); }
  const fl = (cx, cy, r) => { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; x.beginPath(); x.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.42, r * 0.22, a, 0, TAU); x.fill(); } x.beginPath(); x.arc(cx, cy, r * 0.18, 0, TAU); x.fill(); };
  fl(w * 0.22, h * 0.24, 20); fl(w * 0.78, h * 0.24, 20); fl(w * 0.22, h * 0.78, 16); fl(w * 0.78, h * 0.78, 16);
  x.beginPath(); x.moveTo(w * 0.36, h * 0.72); x.lineTo(w * 0.36, h * 0.46); x.lineTo(w * 0.5, h * 0.36); x.lineTo(w * 0.64, h * 0.46); x.lineTo(w * 0.64, h * 0.72); x.closePath(); x.fill();
  x.fillRect(w * 0.47, h * 0.2, w * 0.06, h * 0.18); x.fillRect(w * 0.43, h * 0.25, w * 0.14, h * 0.04); x.fillStyle = '#fff'; x.beginPath(); x.arc(w * 0.5, h * 0.66, w * 0.05, Math.PI, 0); x.lineTo(w * 0.55, h * 0.72); x.lineTo(w * 0.45, h * 0.72); x.fill();
  x.fillStyle = '#000'; for (let k = 0; k < 7; k++) { const cx = (k + 0.5) * w / 7; x.save(); x.translate(cx, h * 0.92); x.rotate(Math.PI / 4); x.fillRect(-4, -4, 8, 8); x.restore(); }
  x.fillRect(0, 0, w, 6); }, 128, 160, false); }
// a food stall: counter with a cloth skirt, four posts, striped awning, a hanging bulb, a sign, pots and fruit
function fiestaStall(st, S, x, z, ry, seed, label) { const R = RNG('stall' + seed), g = new THREE.Group(); g.position.set(x, 0.15, z); g.rotation.y = ry; st.scene.add(g);
  const ac = R.pick(['#d8302e', '#2e7ad8', '#e8508a', '#2e9a5a', '#e89a2e']), wood = STDm({ color: '#6a4a30', roughness: 0.8 });
  const stripe = g3Tex((c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f6efe0' : ac; c.fillRect(i * w / 8, 0, w / 8, h); } c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(0, h - 10, w, 10); }, 256, 64);
  g.add(mesh(new THREE.BoxGeometry(2.4, 0.9, 0.8), STDm({ map: g3Tex((c, w, h) => { c.fillStyle = ac; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc((i + 0.5) * w / 12, h * 0.1, w / 30, 0, TAU); c.fill(); } c.fillStyle = 'rgba(0,0,0,0.2)'; for (let i = 0; i < 24; i++) c.fillRect(i * w / 24, h * 0.2, 2, h); }, 256, 96), roughness: 0.9 }), 0, 0.45, 0));
  g.add(mesh(new THREE.BoxGeometry(2.5, 0.05, 0.9), wood, 0, 0.92, 0));
  [[-1.15, -0.4], [1.15, -0.4], [-1.15, 0.4], [1.15, 0.4]].forEach(([a, b]) => g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6).translate(0, 1.15, 0), wood, a, 0, b)));
  const aw = mesh(new THREE.PlaneGeometry(2.7, 1.3), STDm({ map: stripe, side: THREE.DoubleSide, roughness: 0.9, emissive: '#ffffff', emissiveMap: stripe, emissiveIntensity: 0.12 }), 0, 2.35, 0.1); aw.rotation.x = -Math.PI / 2 + 0.35; g.add(aw);
  const val = mesh(new THREE.PlaneGeometry(2.7, 0.2), aw.material, 0, 2.08, 0.72); g.add(val);
  for (let k = 0; k < 6; k++) { const pot = mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.2, 14), STDm({ color: R.pick(['#8a4a2a', '#b8b8b8', '#2a2a2a', '#c86a3a']), roughness: 0.5, metalness: 0.3 }), -0.95 + k * 0.38, 1.05, R.r(-0.2, 0.15)); g.add(pot);
    const top = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 14), STDm({ color: R.pick(['#e8c040', '#c83a20', '#f0e8d0', '#6aa030', '#e87a2a']), roughness: 0.7 }), -0.95 + k * 0.38, 1.15, pot.position.z); g.add(top); }
  const sg = sign(g, [label], 0, 2.55, 0.8, 2.0, 0.42, { bg: '#f6e8c8', fg: ac, border: ac, glow: 0.45, size: 76 }); sg.rotation.x = -0.1;
  const bp = new THREE.Vector3(0, 1.95, 0.25).applyMatrix4(g.updateWorldMatrix(true, false) || g.matrixWorld); S.bulbs.push([bp.x, bp.y, bp.z, 3.0, 2.0, 1.0, 0.16, R.f()]);
  g.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), STDm({ color: '#fff', emissive: '#ffd8a0', emissiveIntensity: 3 }), 0, 1.95, 0.25));
  // steam from the pots
  for (let k = 0; k < 3; k++) S.steam.push(new THREE.Vector3(-0.6 + k * 0.6, 1.25, 0).applyMatrix4(g.matrixWorld)); return g; }
// the church at the end of the street: floodlit cantera facade, open lit doors, choir window, niches, two bell towers
// with lit belfries, a dome behind, the outline drawn with bulbs
function fiestaChurch(st, S) { const z = FIESTA_Z.CH, g = new THREE.Group(); g.position.set(0, 0, z); st.scene.add(g); const Wf = 15, Hf = 17;
  const draw = (x, em) => { const w = 540, h = 612, s = w / Wf; if (em) { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const gr = x.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,170,90,0.55)'); gr.addColorStop(0.5, 'rgba(255,150,80,0.16)'); gr.addColorStop(1, 'rgba(255,140,80,0.04)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }
    else { x.fillStyle = '#e2c494'; x.fillRect(0, 0, w, h); const R = RNG('chf'); for (let k = 0; k < 80; k++) blot(x, R.r(0, w), R.r(0, h), R.r(10, 50), R.pick(['rgba(120,80,40,0.08)', 'rgba(255,240,210,0.1)']));
      x.strokeStyle = 'rgba(90,60,30,0.25)'; x.lineWidth = 1; for (let yy = 0; yy < h; yy += 14) { x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); } }
    const Y = (m) => h - m * s, X = (m) => w / 2 + m * s;
    if (!em) { x.fillStyle = 'rgba(255,240,215,0.7)'; [[6.5, 0.4], [12, 0.4]].forEach(([yy, th]) => x.fillRect(0, Y(yy), w, th * s)); [-6.6, -3.6, 3.6, 6.6].forEach((px) => { x.fillStyle = 'rgba(255,236,205,0.55)'; x.fillRect(X(px) - 0.35 * s, Y(12), 0.7 * s, 12 * s); x.fillStyle = 'rgba(80,50,20,0.25)'; x.fillRect(X(px) + 0.3 * s, Y(12), 0.08 * s, 12 * s); }); }
    // door: arch, open, warm inside
    const dw = 3.2, dh = 4.6; x.beginPath(); x.moveTo(X(-dw / 2), Y(0)); x.lineTo(X(-dw / 2), Y(dh)); x.arc(X(0), Y(dh), dw / 2 * s, Math.PI, 0); x.lineTo(X(dw / 2), Y(0)); x.closePath();
    if (em) { const gd = x.createLinearGradient(0, Y(dh + 1.6), 0, Y(0)); gd.addColorStop(0, 'rgba(255,190,100,0.8)'); gd.addColorStop(1, 'rgba(255,220,150,1)'); x.fillStyle = gd; x.fill(); } else { x.fillStyle = '#ffd890'; x.fill(); x.strokeStyle = 'rgba(255,245,225,0.9)'; x.lineWidth = 10; x.stroke(); x.fillStyle = '#4a2a18'; x.fillRect(X(-dw / 2) - 0.5 * s, Y(dh), 0.5 * s, dh * s); x.fillRect(X(dw / 2), Y(dh), 0.5 * s, dh * s); }
    // the choir window (an octagon with a star) and niches with saints
    x.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + Math.PI / 8; x.lineTo(X(0) + Math.cos(a) * 1.3 * s, Y(9.3) + Math.sin(a) * 1.3 * s); } x.closePath(); x.fillStyle = em ? 'rgba(255,200,110,1)' : '#f8d898'; x.fill(); if (!em) { x.strokeStyle = '#6a4a2a'; x.lineWidth = 4; x.stroke(); }
    [-5.1, 5.1].forEach((px) => [2.6, 8.6].forEach((py) => { x.beginPath(); x.moveTo(X(px - 0.6), Y(py)); x.lineTo(X(px - 0.6), Y(py + 1.8)); x.arc(X(px), Y(py + 1.8), 0.6 * s, Math.PI, 0); x.lineTo(X(px + 0.6), Y(py)); x.closePath(); x.fillStyle = em ? 'rgba(255,170,80,0.35)' : '#5a3a22'; x.fill();
      if (!em) { x.fillStyle = '#efe0c8'; x.beginPath(); x.ellipse(X(px), Y(py + 1.95), 0.17 * s, 0.2 * s, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(X(px - 0.3), Y(py + 0.1)); x.lineTo(X(px - 0.2), Y(py + 1.7)); x.lineTo(X(px + 0.2), Y(py + 1.7)); x.lineTo(X(px + 0.3), Y(py + 0.1)); x.fill(); } }));
    // the gable: a curved pediment with a clock
    if (!em) { x.fillStyle = '#7a1e1e'; x.beginPath(); x.arc(X(0), Y(13.9), 1.1 * s, 0, TAU); x.fill(); x.fillStyle = '#f4ecd8'; x.beginPath(); x.arc(X(0), Y(13.9), 0.9 * s, 0, TAU); x.fill(); x.strokeStyle = '#2a2420'; x.lineWidth = 4; x.beginPath(); x.moveTo(X(0), Y(13.9)); x.lineTo(X(0), Y(14.6)); x.moveTo(X(0), Y(13.9)); x.lineTo(X(0.55), Y(13.7)); x.stroke(); }
    else { x.fillStyle = 'rgba(255,240,200,0.6)'; x.beginPath(); x.arc(X(0), Y(13.9), 0.9 * s, 0, TAU); x.fill(); } };
  const mk = (em) => g3Tex((x) => draw(x, em), 540, 612);
  const front = STDm({ map: mk(false), emissiveMap: mk(true), emissive: '#ffffff', emissiveIntensity: 1.25, roughness: 0.9 });
  const sideM = STDm({ color: '#c8a678', roughness: 0.9, emissive: '#3a2010', emissiveIntensity: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(Wf, Hf, 30).translate(0, Hf / 2, -15), [sideM, sideM, sideM, sideM, front, sideM]); body.receiveShadow = true; g.add(body);
  // curved gable on top
  const gs = new THREE.Shape(); gs.moveTo(-5.5, 0); gs.quadraticCurveTo(-5.5, 2.2, -2.2, 2.6); gs.quadraticCurveTo(0, 4.6, 2.2, 2.6); gs.quadraticCurveTo(5.5, 2.2, 5.5, 0); gs.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(gs, { depth: 0.8, bevelEnabled: false }), STDm({ color: '#e2c494', emissive: '#5a3010', emissiveIntensity: 0.5, roughness: 0.9 }), 0, Hf, -0.8));
  const crossM = STDm({ color: '#f0e0c0', emissive: '#ffd890', emissiveIntensity: 0.6 }); g.add(mesh(new THREE.BoxGeometry(0.22, 1.6, 0.22), crossM, 0, Hf + 4.9, -0.4)); g.add(mesh(new THREE.BoxGeometry(0.9, 0.2, 0.22), crossM, 0, Hf + 5.2, -0.4));
  // towers
  const tw = 4.4, TH = 31; [-1, 1].forEach((sd) => { const tx = sd * (Wf / 2 + tw / 2 - 0.2), tg = new THREE.Group(); tg.position.set(tx, 0, 0); g.add(tg);
    const tm = STDm({ color: '#dcbc8c', roughness: 0.9, emissive: '#4a2810', emissiveIntensity: 0.55 });
    tg.add(mesh(new THREE.BoxGeometry(tw, 19, tw).translate(0, 9.5, -tw / 2), tm)); tg.add(mesh(new THREE.BoxGeometry(tw + 0.4, 0.5, tw + 0.4).translate(0, 19.2, -tw / 2), tm));
    // belfry: four corner piers + arched openings glowing; bells
    const bh = 5.2; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => tg.add(mesh(new THREE.BoxGeometry(0.9, bh, 0.9).translate(0, 19.4 + bh / 2, 0), tm, a * (tw / 2 - 0.45), 0, -tw / 2 + b * (tw / 2 - 0.45))));
    const inner = mesh(new THREE.BoxGeometry(tw - 1.6, bh - 0.6, tw - 1.6).translate(0, 19.4 + bh / 2 - 0.3, -tw / 2), STDm({ color: '#ffcf80', emissive: '#ffb050', emissiveIntensity: 1.6 })); tg.add(inner);
    tg.add(mesh(new THREE.SphereGeometry(0.75, 18, 12, 0, TAU, 0, Math.PI / 2).scale(1, 1.3, 1), STDm({ color: '#6a4a1a', metalness: 0.8, roughness: 0.35 }), 0, 21.6, -tw / 2 + 1.0));
    tg.add(mesh(new THREE.BoxGeometry(tw + 0.5, 0.5, tw + 0.5).translate(0, 19.4 + bh + 0.25, -tw / 2), tm));
    tg.add(mesh(new THREE.CylinderGeometry(1.2, 1.6, 2.2, 8).translate(0, 25.6 + 1.1, -tw / 2), tm));
    tg.add(mesh(new THREE.SphereGeometry(1.25, 20, 12, 0, TAU, 0, Math.PI / 2).scale(1, 1.4, 1), STDm({ color: '#3a7a8a', roughness: 0.35, metalness: 0.2, emissive: '#0a2a30', emissiveIntensity: 0.5 }), 0, 27.8, -tw / 2));
    tg.add(mesh(new THREE.BoxGeometry(0.14, 1.4, 0.14), crossM, 0, 30.3, -tw / 2)); tg.add(mesh(new THREE.BoxGeometry(0.7, 0.14, 0.14), crossM, 0, 30.5, -tw / 2));
    // bulbs outlining the tower
    for (let k = 0; k <= 18; k++) { S.bulbs.push([tx - sd * tw / 2 * 0 + (tw / 2 + 0.05) * -1 + 0 + tx * 0 + (k / 18) * 0 + (-tw / 2 - 0.05), k / 18 * 19, z + 0.12, 3, 2.1, 1.1, 0.22, k * 0.37]); S.bulbs[S.bulbs.length - 1][0] = tx - tw / 2 - 0.05; S.bulbs.push([tx + tw / 2 + 0.05, k / 18 * 19, z + 0.12, 3, 2.1, 1.1, 0.22, k * 0.41]); }
    for (let k = 0; k <= 8; k++) S.bulbs.push([tx - tw / 2 + k / 8 * tw, 19.5, z + 0.3, 3, 2.1, 1.1, 0.22, k * 0.7]); });
  // outline of the facade + gable
  for (let k = 0; k <= 30; k++) { const u = k / 30; const p = [lerp(-5.5, 5.5, u), Hf + (u < 0.3 ? lerp(0, 2.6, u / 0.3) : u > 0.7 ? lerp(2.6, 0, (u - 0.7) / 0.3) : 2.6 + 2 * Math.sin((u - 0.3) / 0.4 * Math.PI)), z + 0.1]; S.bulbs.push([p[0], p[1], p[2], 3, 2.2, 1.2, 0.22, u * 9]); }
  for (let k = 0; k <= 26; k++) S.bulbs.push([-Wf / 2 + k / 26 * Wf, Hf + 0.1, z + 0.4, 3, 2.1, 1.1, 0.22, k * 0.3]);
  // the dome behind
  g.add(mesh(new THREE.CylinderGeometry(4, 4, 3, 16).translate(0, Hf + 1.5, -18), sideM)); g.add(mesh(new THREE.SphereGeometry(4.2, 24, 14, 0, TAU, 0, Math.PI / 2).scale(1, 1.15, 1), STDm({ color: '#c8783a', roughness: 0.5, emissive: '#3a1808', emissiveIntensity: 0.6 }), 0, Hf + 3, -18));
  // floodlight + warm glow from the doors on the street
  const L = new THREE.PointLight('#ffb070', 3.5, 34, 1.4); L.position.set(0, 3, z + 8); st.scene.add(L);
  return g; }
// the brass band on its tarima: tuba, two trumpets, a trombone, a tambora; a banner overhead
function fiestaBand(st, S) { const g = new THREE.Group(), x0 = 3.6, z0 = -26; st.scene.add(g); const wood = STDm({ color: '#5a3a24', roughness: 0.85 });
  g.add(mesh(new THREE.BoxGeometry(3.4, 0.7, 5.2), STDm({ map: wrap(g3Tex((c, w, h) => { c.fillStyle = '#6a4630'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 0; i < 12; i++) c.fillRect(0, i * h / 12, w, 2); }, 64, 128), 1, 1), roughness: 0.8 }), x0 + 1.5, 0.35, z0));
  g.add(mesh(new THREE.BoxGeometry(3.42, 0.5, 5.22), STDm({ color: '#b8202e', roughness: 0.9 }), x0 + 1.5, 0.3, z0));
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8).translate(0, 2.1, 0), wood, x0 + 1.5 + a * 1.6, 0.7, z0 + b * 2.5)));
  const bn = sign(g, ['¡VIVA SAN MIGUEL!', 'FIESTA PATRONAL'], x0 + 0.0, 4.4, z0, 5.0, 1.0, { w: 1024, h: 200, bg: '#7a1e2a', fg: '#ffe6a8', border: '#e8b84a', glow: 0.7, size: 88 }); bn.rotation.y = -Math.PI / 2 + 0.0;
  const L = new THREE.PointLight('#ff9a60', 3.0, 14, 1.5); L.position.set(x0 - 0.6, 3.8, z0 + 0.5); st.scene.add(L); S.bandL = L;
  const brass = STDm({ color: '#d8a838', metalness: 0.95, roughness: 0.22 }), R = RNG('band'); S.band = [];
  const kinds = ['tuba', 'trumpet', 'trumpet', 'trombone', 'drum'];
  kinds.forEach((k, i) => { const P = man(R, { top: i % 2 ? '#f4f1ea' : '#1f2d3d', bottom: '#1a1a1a', sleeve: 'long', hairStyle: 'short' }); P.root.traverse((m) => (m.castShadow = false)); st.scene.add(P.root);
    const hat = fiestaHat(P, '#1a1a1a', 0.7); const ins = new THREE.Group();
    if (k === 'tuba') { ins.add(mesh(new THREE.TorusGeometry(0.2, 0.06, 10, 28), brass)); const b = mesh(new THREE.CylinderGeometry(0.26, 0.07, 0.5, 24, 1, true), brass, 0.12, 0.42, -0.02); b.material = brass; b.rotation.z = -0.25; ins.add(b); ins.position.set(0.05, 0.3, 0.2); ins.rotation.y = Math.PI / 2; P.spine.add(ins); }
    else if (k === 'drum') { const d = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 24), STDm({ color: '#c82a2a', roughness: 0.6 })); d.rotation.z = Math.PI / 2; ins.add(d); [-1, 1].forEach((s) => ins.add(mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.02, 24).rotateZ(Math.PI / 2), STDm({ color: '#f0e8d0' }), s * 0.15, 0, 0))); ins.position.set(0, 0.12, 0.3); P.spine.add(ins); }
    else { const L2 = k === 'trombone' ? 0.75 : 0.42; ins.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, L2, 8).rotateX(Math.PI / 2).translate(0, 0, L2 / 2), brass)); ins.add(mesh(new THREE.CylinderGeometry(0.075, 0.015, 0.16, 18, 1, true).rotateX(Math.PI / 2).translate(0, 0, L2 + 0.05), brass)); if (k === 'trombone') ins.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 8).rotateX(Math.PI / 2).translate(0, -0.08, 0.3), brass));
      ins.position.set(0, -P.headR * 0.48, P.headR * 0.9); ins.rotation.x = -0.12; P.head.add(ins); }
    S.band.push({ P, k, x: x0 + 0.6 + (i % 2) * 1.1, z: z0 - 1.9 + i * 0.95, ph: i * 1.3 }); });
}
// a straw hat (sombrero) on a hero
function fiestaHat(P, col = '#d8b878', k = 1) { const m = STDm({ color: col, roughness: 0.85 }), r = P.headR, g = new THREE.Group(); g.position.set(0, r * 0.62, -r * 0.05); g.rotation.x = -0.12; P.head.add(g);
  g.add(mesh(new THREE.CylinderGeometry(r * 2.1 * k + r * (1 - k) * 1.3, r * 2.2 * k + r * (1 - k) * 1.35, 0.012, 32), m)); g.add(mesh(new THREE.CylinderGeometry(r * 0.78, r * 0.98, r * 0.85, 20).translate(0, r * 0.42, 0), m));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.99, r * 0.99, r * 0.18, 20).translate(0, r * 0.1, 0), STDm({ color: '#6a1a1a' }))); return g; }
// a cup (red plastic vaso) in a hero's hand
function fiestaCup(P, side = 1) { const g = new THREE.Group(), A = P.arms[side]; g.position.set(0, -0.085, 0.03); A.hand.add(g);
  g.add(mesh(new THREE.CylinderGeometry(0.042, 0.03, 0.12, 18, 1, true), STDm({ color: '#d8202a', roughness: 0.35, side: THREE.DoubleSide })));
  g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.005, 18).translate(0, 0.04, 0), STDm({ color: '#e8a830', roughness: 0.2, emissive: '#5a3008', emissiveIntensity: 0.4 }))); return g; }
// fireworks: deterministic bursts (centre, colour, size) with trails, rockets rising first; a shared flash light
function fiestaFireworksList() { const R = RNG('fw'), L = [], pal = [['#ff4a6a', '#ffd0d8'], ['#4ab0ff', '#e0f4ff'], ['#ffd040', '#fff4c0'], ['#60ff8a', '#e0ffe8'], ['#c060ff', '#f0d8ff'], ['#ff8a30', '#ffe0b0'], ['#ffffff', '#ffe8c0']];
  for (let i = 0; i < 26; i++) { const t0 = -1.2 + i * 0.55 + R.r(-0.2, 0.2), side = R.f() < 0.5 ? -1 : 1, cz = R.r(-75, -125);
    L.push({ t0, c: [side * R.r(8, 34), R.r(46, 70), cz], col: R.pick(pal), sp: R.r(13, 20), n: 150, life: R.r(2.2, 3.0), glit: R.f() < 0.35, rise: R.r(35, 50) }); }
  L.push({ t0: 3.5, c: [2, 17, -34], col: ['#ffffff', '#fff2d0'], sp: 30, n: 320, life: 2.4, glit: true, rise: 24, bang: true });
  return L; }
function fiestaFireworks(st, S) { const B = (S.fwList = fiestaFireworksList()), T = 7; let N = 0; B.forEach((b) => (N += b.n * T + 14));
  const aP = new Float32Array(N * 3), aD = new Float32Array(N * 3), aT = new Float32Array(N * 4), aC = new Float32Array(N * 3); let i = 0;
  B.forEach((b, bi) => { const R = RNG('fwb' + bi), c0 = lin(b.col[0]), c1 = lin(b.col[1]);
    for (let p = 0; p < b.n; p++) { const u = R.r(-1, 1), a = R.r(0, TAU), r = Math.sqrt(1 - u * u), sp = b.sp * R.r(0.82, 1.0), cc = R.f() < 0.25 ? c1 : c0, sd = R.f();
      for (let j = 0; j < T; j++, i++) { aP.set(b.c, i * 3); aD.set([r * Math.cos(a) * sp, u * sp, r * Math.sin(a) * sp], i * 3); aT.set([b.t0, b.life * R.r(0.85, 1.1), j, b.glit ? 1 + sd : sd * 0.5], i * 4); aC.set([cc.r, cc.g, cc.b], i * 3); } }
    for (let j = 0; j < 14; j++, i++) { aP.set(b.c, i * 3); aD.set([0, b.rise, 0], i * 3); aT.set([b.t0, 1.0, j, -1], i * 4); aC.set([1.0, 0.75, 0.45], i * 3); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(aP, 3)); g.setAttribute('aD', new THREE.BufferAttribute(aD, 3)); g.setAttribute('aT', new THREE.BufferAttribute(aT, 4)); g.setAttribute('aC', new THREE.BufferAttribute(aC, 3));
  const U = (S.fwU = { uT: { value: 0 }, uMap: { value: fiestaBulbTex() }, uK: { value: 1 } });
  const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `uniform float uT, uK; attribute vec3 aD, aC; attribute vec4 aT; varying vec3 vC;
      void main(){ float j = aT.z, a = 0.0; vec3 p = position;
        if (aT.w < 0.0) { float u = (uT - (aT.x - 1.0) - j * 0.022) / 1.0; a = step(0.0, u) * step(u, 1.0) * (1.0 - j / 14.0) * 0.9; float e = 1.0 - (1.0 - u) * (1.0 - u); p += vec3(sin(u * 9.0 + position.x) * 0.25, -aD.y * (1.0 - e), 0.0); }
        else { float age = uT - aT.x - j * 0.045; float L = aT.y; a = step(0.0, age) * step(age, L) * (1.0 - j / 7.0) * pow(max(0.0, 1.0 - age / L), 1.4);
          float k = 1.9; p += aD * (1.0 - exp(-age * k)) / k + vec3(0.0, -2.2 * age * age, 0.0); a *= 0.75 + 0.6 * exp(-age * 5.0);
          if (aT.w >= 1.0) a *= age > L * 0.4 ? step(0.5, fract(sin(floor(uT * 26.0) + aT.w * 931.0 + float(gl_VertexID) * 0.37) * 437.5)) * 1.6 : 1.0; }
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; float s = (j < 0.5 ? 0.9 : 0.55) * projectionMatrix[1][1] * 960.0 / max(0.1, -mv.z); float ps = max(2.2, s);
        vC = aC * a * uK * min(1.0, s * s / (ps * ps) + 0.5) * 1.6; gl_PointSize = a > 0.001 ? ps : 0.0; }`,
    fragmentShader: 'uniform sampler2D uMap; varying vec3 vC; void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb * t.a, 1.0); }' });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; st.scene.add(pts);
  S.fwL = new THREE.PointLight('#ffffff', 0, 400, 0.6); st.scene.add(S.fwL);
  // big soft glows at each burst (a halo in the haze)
  S.fwHalo = B.map((b) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: b.col[0], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false })); sp.position.set(...b.c); sp.scale.setScalar(b.sp * 3.2); st.scene.add(sp); return sp; }); }
function fiestaFwPose(S, vt) { S.fwU.uT.value = vt; let best = 0, bc = null, bp = null;
  S.fwList.forEach((b, i) => { const age = vt - b.t0, k = age < 0 ? 0 : Math.exp(-age * (b.bang ? 4.5 : 2.4)) * (b.bang ? 1.5 : 1); S.fwHalo[i].material.opacity = clamp(k * 0.55) * (age < b.life ? 1 : 0); if (k > best) { best = k; bc = b.col[0]; bp = b.c; } });
  if (bc) { S.fwL.color.set(bc); S.fwL.position.set(...bp); } S.fwL.intensity = best * 0.8; }
// the whole street
function fiestaBuild() { return once('fiesta', () => {
  const st = makeStage({ hemi: 0.2, sky: 0x3a3a70, ground: 0x3a2018, key: 0.28, keyCol: '#ffc890', box: 26, boxFar: 120, sunDist: 60, fog: '#160c14', fogNear: 14, fogFar: 140, far: 5000, fov: 60 });
  st.setSun(dirV(10 * DEG, 70 * DEG), new THREE.Vector3(0, 0, -8)); skyEnv(st, '#06070f', '#2a1418', dirV(0, -80 * DEG), '#000000');
  const S = { st, bulbs: [], steam: [], heroes: [], ring: [] }; S.skyU = fiestaSky(st); const R = RNG('fiesta');
  // street: cobbles, a stone gutter, raised sidewalks with curbs
  const cob = cobbleTex(); cob.repeat.set(5, 60); const street = plane(st, 10, 140, STDm({ map: cob, roughness: 0.55, metalness: 0.05, color: '#8a7e74', bumpMap: cob, bumpScale: 0.02 }), 0, 0, -50);
  const sw = STDm({ map: wrap(texNoise('swk', '#8a7a6a', ['#7a6a5a', '#9a8a7a', '#6a5a4a'], 6000), 2, 50), roughness: 0.8 });
  [-1, 1].forEach((s) => { box(st, 2, 0.15, 140, sw, s * 6, 0.075, -50); box(st, 0.2, 0.17, 140, STDm({ color: '#a89888', roughness: 0.7 }), s * 5.05, 0.085, -50); });
  // facades both sides, the far closing row beside the church
  let k = 0; [-1, 1].forEach((s) => { let z = 16; while (z > -88) { const w = R.r(7.5, 12.5), fl = R.f() < 0.55 ? 1 : 2; building(st, s * (FIESTA_Z.WALK + 6), z - w / 2, w, 12, s < 0 ? Math.PI / 2 : -Math.PI / 2, 600 + k, fiestaCol[(k * 5 + (s > 0 ? 3 : 0)) % fiestaCol.length], fl, Math.max(2, Math.round(w / 3.2)), { arcade: k % 4 === 1, balc: true, lit: 0.6, gH: 4.6, fH: 3.8, roofCol: '#9a4a2a' }); z -= w + R.r(0, 0.4); k++; } });
  [-1, 1].forEach((s) => building(st, s * 21, FIESTA_Z.CH + 2, 20, 10, 0, 700 + s, s < 0 ? '#e8b13a' : '#3aa59a', 2, 6, { lit: 0.6, balc: true, gH: 4.6, fH: 3.8 }));
  fiestaChurch(st, S);
  // far hills/roofs silhouettes beyond
  for (let i = 0; i < 9; i++) { const hm = mesh(lumpyGeo(2, 0.3, 40 + i), STDm({ color: '#140c14', roughness: 1 }), -200 + i * 50, -20, -420 - (i % 3) * 60); hm.scale.set(R.r(60, 110), R.r(40, 70), 40); st.scene.add(hm); }
  // street lights: warm point lights hung over the street (the string lights' light)
  S.lights = []; [[-2.5, 5], [2.5, -3], [-2.5, -11], [2.5, -19], [-2.5, -30], [2.5, -44], [-2.5, -60], [2.5, -76]].forEach(([x, z], i) => { const L = new THREE.PointLight(i % 3 === 2 ? '#ff8a5a' : '#ffb068', 1.35, 17, 1.7); L.position.set(x, 5.4, z); st.scene.add(L); S.lights.push(L); });
  // string lights: across the street every 4.5 m, plus zigzags; bulbs mostly warm, some coloured
  const wires = [], bulbCols = [[3, 2.1, 1.1], [3, 2.1, 1.1], [3, 2.1, 1.1], [3, 0.9, 0.7], [0.8, 1.6, 3], [0.9, 2.6, 1.2], [3, 1.4, 2.4], [3, 2.6, 0.7]];
  for (let z = 12, n = 0; z > -88; z -= 4.6, n++) { const a = [-FIESTA_Z.WALK, 7.2 + R.r(-0.3, 0.3), z], b = [FIESTA_Z.WALK, 7.2 + R.r(-0.3, 0.3), n % 2 ? z - 4.6 : z], sag = R.r(0.9, 1.4); wires.push([a, b, sag]);
    for (let q = 1; q < 30; q++) { const p = fiestaCat(a, b, sag, q / 30), c = R.pick(bulbCols); S.bulbs.push([p[0], p[1] - 0.06, p[2], c[0], c[1], c[2], 0.13, R.f()]); } }
  // along the facades at first-floor height
  [-1, 1].forEach((s) => { for (let z = 14; z > -88; z -= 0.9) S.bulbs.push([s * (FIESTA_Z.WALK - 0.1), 4.75 + 0.12 * Math.sin(z * 0.9), z, 3, 2.0, 1.0, 0.1, R.f()]); });
  const wg = new THREE.BufferGeometry(), wp = []; wires.forEach(([a, b, s]) => { for (let q = 0; q < 30; q++) wp.push(...fiestaCat(a, b, s, q / 30), ...fiestaCat(a, b, s, (q + 1) / 30)); }); wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); st.scene.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: '#1a1410' })));
  // papel picado: strands lower than the lights, flags every 0.45 m, colours per flag; waving in the vertex shader
  const pTex = fiestaPicadoTex(), flags = []; for (let z = -4.9, n = 0; z > -86; z -= 9.2, n++) { const a = [-FIESTA_Z.WALK, 6.3, z], b = [FIESTA_Z.WALK, 6.1, z - (n % 2 ? -1.2 : 1.2)], sag = R.r(0.5, 0.8), L = Math.hypot(b[0] - a[0], b[2] - a[2]), cnt = Math.floor(L / 0.38);
    for (let q = 1; q < cnt; q++) { const u = q / cnt, p = fiestaCat(a, b, sag, u); flags.push([p, Math.atan2(b[2] - a[2], b[0] - a[0]), R.pick(['#e8307a', '#ff8a1e', '#2ec46a', '#2a8ae8', '#ffd21e', '#9a4ae8', '#e82a2a', '#1ec4c4', '#ff5ab0'])]); } }
  const pm = STDm({ alphaMap: pTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, transparent: false }); S.pU = { uT: { value: 0 } };
  pm.onBeforeCompile = (sh) => { sh.uniforms.uT = S.pU.uT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    { vec3 ip = vec3(0.0);
#ifdef USE_INSTANCING
    ip = instanceMatrix[3].xyz;
#endif
    float sw = sin(uT * 2.3 + ip.x * 0.7 + ip.z * 0.3) * 0.35 + sin(uT * 5.1 + ip.x * 2.1) * 0.12; float dn = -transformed.y; transformed.z += sw * dn; transformed.y += -abs(sw) * dn * 0.15; transformed.z += sin(transformed.x * 18.0 + uT * 6.0 + ip.x) * 0.012 * dn * 3.0; }`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.38;'); };
  const fg = new THREE.PlaneGeometry(0.32, 0.4).translate(0, -0.2, 0), PIC = IM(fg, pm, flags.length, false); flags.forEach(([p, ry, c], i) => { PIC.setMatrixAt(i, M4c(p[0], p[1], p[2], -ry)); PIC.setColorAt(i, lin(c)); }); st.scene.add(PIC);
  // paper lanterns hanging under some strands (glowing, gently swinging)
  S.lanterns = []; const lanM = (c) => STDm({ color: c, emissive: c, emissiveIntensity: 1.6, roughness: 0.8 });
  for (let i = 0; i < 22; i++) { const z = 6 - i * 4.2 - R.r(0, 1), x = R.r(-3.8, 3.8), c = R.pick(['#ff5a3a', '#ffb43a', '#ff3a7a', '#ffd86a', '#ff7a2a']), lg = new THREE.Group(); lg.position.set(x, 5.6 + R.r(-0.3, 0.3), z); st.scene.add(lg);
    const body = mesh(new THREE.SphereGeometry(0.28, 16, 12).scale(1, 1.15, 1), lanM(c), 0, -0.45, 0); body.castShadow = false; lg.add(body); [0.33, -0.33].forEach((dy) => lg.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), STDm({ color: '#2a1a10' }), 0, -0.45 + dy, 0)));
    lg.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4).translate(0, -0.05, 0), STDm({ color: '#222' })));
    const cc = lin(c); S.bulbs.push([x, lg.position.y - 0.45, z, cc.r * 2.2 + 0.4, cc.g * 2.2 + 0.3, cc.b * 2 + 0.1, 0.9, R.f()]); S.lanterns.push({ g: lg, ph: R.r(0, TAU) }); }
  // stalls
  [['TAMALES', -1, -6], ['ELOTES', 1, -9], ['CHURROS', -1, -15], ['AGUAS FRESCAS', 1, -33], ['ANTOJITOS', -1, -24], ['BUÑUELOS', 1, -42], ['POZOLE', -1, -36], ['DULCES', 1, -52], ['TACOS', -1, -50]].forEach(([lab, s, z], i) => fiestaStall(st, S, s * 5.7, z, s < 0 ? Math.PI / 2 : -Math.PI / 2, i, lab));
  fiestaBand(st, S); fiestaFireworks(st, S);
  // the glow points (bulbs, lanterns, stall bulbs)
  S.glow = fiestaPts(st, S.bulbs.length, (i) => S.bulbs[i], { flick: 0.3 });
  // haze: big soft warm glows low over the street (the light caught in the smoke)
  for (let i = 0; i < 18; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: R.pick(['#ff9a50', '#ffb070', '#ff7a60']), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.08 })); sp.position.set(R.r(-4, 4), R.r(3, 6), 8 - i * 5.5); sp.scale.setScalar(R.r(7, 11)); st.scene.add(sp); }
  // confetti around the camera (instanced, CPU-animated)
  S.conf = IM(new THREE.PlaneGeometry(0.035, 0.05), STDm({ side: THREE.DoubleSide, roughness: 0.6, emissive: '#000000' }), 360, false); S.conf.frustumCulled = false;
  for (let i = 0; i < 360; i++) S.conf.setColorAt(i, lin(R.pick(['#ff3a6a', '#ffd23a', '#3ac4ff', '#6aff6a', '#ff8a2a', '#c86aff', '#ffffff']))); S.conf.material.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.5;'); }; st.scene.add(S.conf);
  fiestaPeople(st, S);
  return S; }); }
// the crowd and the heroes
function fiestaPeople(st, S) { const R = RNG('fpeople');
  // instanced crowd: the street ahead, both sidewalks, a few near the sides
  const spots = [];
  for (let i = 0; i < 520; i++) { let x, z; const r = R.f(); if (r < 0.6) { z = R.r(-13, -82); x = R.r(-4.6, 4.6); } else if (r < 0.85) { z = R.r(-4, -82); x = (R.f() < 0.5 ? -1 : 1) * R.r(5.2, 6.7); } else { z = R.r(-13, -24); x = R.r(-4.6, 4.6); }
    if (x > 3.0 && z < -22.5 && z > -29.5) x = R.r(-4.6, 2.6); spots.push({ x, z, yaw: R.f() < 0.4 ? R.r(-0.6, 0.6) : R.r(0, TAU), up: R.f() < 0.45 ? R.r(0.4, 1) : 0, ph: R.r(0, TAU), sp: R.r(4.5, 7), y: Math.abs(x) > 5.05 ? 0.15 : 0 }); }
  S.crowd = makeCrowd(spots.length, { seed: 11, tops: ['#d94848', '#f4f1ea', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#ef8a3a', '#3cae5c', '#f4f1ea', '#c2185b', '#1e5aa8', '#f2c94c', '#e8e0d0'] }); S.spots = spots; st.scene.add(S.crowd.grp);
  // party heroes (dancers near your path) — [x, z, yaw, style, female]
  const H = [[0.78, -1.7, 0.15, 'cup', 0], [-1.7, -0.6, 0.9, 0, 1], [-2.5, -1.4, 0.4, 1, 0], [2.0, 0.6, -0.8, 2, 1], [2.6, -3.2, -0.4, 3, 0], [-1.0, -4.6, 0.3, 0, 1], [1.4, -6.2, -0.2, 1, 1], [-2.6, -6.8, 0.8, 2, 0], [0.2, -8.6, 0.1, 3, 1], [2.4, -9.5, -0.9, 0, 0], [-1.6, -10.4, 0.5, 1, 1], [-2.1, 3.0, 1.2, 3, 0], [2.3, 3.6, -1.0, 0, 1], [0.9, -12.0, 0.0, 2, 0]];
  H.forEach(([x, z, yaw, sty, fem], i) => { const o = { sleeve: R.f() < 0.6 ? 'short' : 'long', top: fem ? R.pick(['#f4f1ea', '#e8307a', '#ffb43a', '#2ec4a6', '#c8372d', '#7b4fc9']) : R.pick(['#f4f1ea', '#2f6fd1', '#d94848', '#3a8a5a', '#1f2d3d', '#f2c94c']), bottom: R.pick(['#2b3a55', '#1f2d3d', '#3a3a3a', '#c8b89a']) };
    if (fem && R.f() < 0.6) Object.assign(o, { skirt: R.pick(['#c8202a', '#1e5aa8', '#e8307a', '#2e9a5a', '#ff8a1e']), hairStyle: R.pick(['pigtails', 'long', 'bun']) });
    if (sty === 'cup') Object.assign(o, { top: '#c8372d', bottom: '#2b3a55', skin: '#b07a54', hair: '#1a1a1a', hairStyle: 'short', sleeve: 'short', seed: 41 });
    const P = fem ? woman(R, o) : man(R, o); st.scene.add(P.root); if (sty === 'cup' || (!fem && R.f() < 0.4)) fiestaHat(P); if (sty === 'cup' || R.f() < 0.4) P.cup = fiestaCup(P, 1);
    if (Math.abs(z) > 7) P.root.traverse((m) => (m.castShadow = false)); S.heroes.push({ P, x, z, yaw, sty, ph: R.r(0, TAU), sp: R.r(5, 6.6) }); });
  // you: the body on the street (white shirt, dark jeans)
  S.you = makePerson({ skin: '#d4a07a', hair: '#2a1d16', hairStyle: 'short', top: '#ece6da', bottom: '#2b3a55', sleeve: 'long', seed: 77 }); st.scene.add(S.you.root);
  // the ring around the body — [x, z, yaw, role, female]
  const RG = [[0.98, -0.62, -1.55, 'cpr', 0], [-0.55, -0.35, 1.7, 'kneel', 1], [1.55, -2.2, -0.9, 'phone', 0], [-1.25, -2.3, 0.6, 'head', 1], [0.35, -3.35, 0.0, 'mouth', 1], [-1.6, -1.0, 1.4, 'stand', 0], [1.75, -0.4, -1.8, 'stand', 1], [-0.75, -3.6, 0.35, 'stand', 0], [1.15, -3.7, -0.3, 'head', 0], [-0.1, -4.3, 0.1, 'stand', 1], [2.3, -3.3, -0.6, 'stand', 0], [-2.0, -3.0, 0.8, 'mouth', 0]];
  RG.forEach(([x, z, yaw, role, fem], i) => { const o = { sleeve: 'short', seed: 300 + i }; const P = fem ? woman(R, o) : man(R, o); st.scene.add(P.root); if (role === 'phone') { const ph = mesh(new THREE.BoxGeometry(0.075, 0.15, 0.01), STDm({ color: '#111', emissive: '#6a8aff', emissiveIntensity: 0.5 })); ph.position.set(0, -0.09, 0.03); P.arms[1].hand.add(ph); }
    S.ring.push({ P, x, z, yaw, role, ph: R.r(0, TAU) }); });
}
// a hero dancing: stepping in place, hips and shoulders, arms by style; laughing/singing face
function fiestaDance(h, vt, k = 1) { const ph = vt * h.sp + h.ph, s = Math.sin(ph), c = Math.cos(ph), sl = Math.sin(ph * 0.5), P = h.P; let aL, aR;
  if (h.sty === 0) { aL = [2.6 + 0.25 * s, 0.35 + 0.15 * c, 0.5 + 0.3 * s]; aR = [2.6 - 0.25 * s, 0.35 - 0.15 * c, 0.5 - 0.3 * s]; }
  else if (h.sty === 1) { aL = [-0.1, 0.55, 1.9]; aR = [2.5 + 0.3 * sl, 0.3, 0.6 + 0.4 * s]; }
  else if (h.sty === 2) { aL = [0.8 + 0.3 * s, 0.3, 1.5 + 0.2 * c]; aR = [0.8 - 0.3 * s, 0.3, 1.5 - 0.2 * c]; }
  else if (h.sty === 3) { const cl = 0.5 + 0.5 * Math.sin(ph * 2); aL = [2.45, 0.08 + 0.2 * cl, 1.1]; aR = [2.45, 0.08 + 0.2 * cl, 1.1]; }
  else { aL = [0.2 * s, 0.25, 0.4]; aR = [2.0 + 0.6 * ss(0.4, 1.6, vt) + 0.15 * s, 0.25, 0.25 + 0.15 * c]; }   // the cup toast
  posePerson(P, { x: h.x, y: 0.03 * Math.abs(s) * k, z: h.z, yaw: h.yaw + 0.25 * sl, walk: 0.32 * k, ph, sway: 0.09 * sl * k, twist: 0.18 * sl * k, armL: aL, armR: aR, headYaw: 0.15 * Math.sin(ph * 0.5 + 1), headRoll: 0.08 * sl, headPitch: -0.08,
    emo: { smile: 0.9, open: 0.25 + 0.25 * Math.max(0, Math.sin(ph * 1.3)) } }); }
const fiestaR1 = (i) => 4.2 - 0.6 * hsh(i, 10);
// pose the whole street at world time vt; mode: 'party' | 'body'
function fiestaPose(S, vt, mode, camPos) { const st = S.st; S.glow.U.uT.value = vt; S.skyU.uT.value = vt; S.pU.uT.value = vt; fiestaFwPose(S, vt);
  S.lights.forEach((L, i) => (L.intensity = 1.35 * (0.9 + 0.1 * Math.sin(vt * 7 + i * 2.1))));
  S.lanterns.forEach((l) => { l.g.rotation.z = 0.08 * Math.sin(vt * 1.7 + l.ph); l.g.rotation.x = 0.06 * Math.sin(vt * 1.3 + l.ph * 2); });
  const body = mode === 'body', C = S.crowd, bx = FIESTA_Z.BODY[0], bz = FIESTA_Z.BODY[1] + 1.0;
  S.spots.forEach((p, i) => { let x = p.x, z = p.z, yaw = p.yaw, up = p.up, dance = 1;
    if (body) { if (i < 150) { const a = hsh(i, 7) * TAU, r = 2.5 + 4.5 * Math.sqrt(hsh(i, 8)); x = bx + Math.cos(a) * r * 0.85; z = bz + Math.sin(a) * r; if (Math.abs(x) > 4.7) x = Math.sign(x) * fiestaR1(i); yaw = Math.atan2(bx - x, bz - z) + (hsh(i, 9) - 0.5) * 0.6; up = 0; dance = 0.05; } else { const d = Math.hypot(x - bx, z - bz); if (d < 25) { dance = 0.4; up *= 0.3; } } }
    const ph = vt * p.sp + p.ph, bob = Math.abs(Math.sin(ph)) * 0.05 * dance; C.set(i, x, p.y + bob, z, yaw + 0.3 * Math.sin(ph * 0.5) * dance, 1, up * dance, 0.12 * Math.sin(ph * 0.5) * dance); }); C.done();
  S.heroes.forEach((h) => { h.P.root.visible = !body; if (!body) fiestaDance(h, vt); });
  S.band.forEach((b, i) => { const ph = vt * 4 + b.ph, s = Math.sin(ph); const arm = b.k === 'tuba' ? [[0.6, 0.3, 1.6], [0.6, 0.3, 1.6]] : b.k === 'drum' ? [[0.7 + 0.4 * Math.max(0, s), 0.3, 1.3], [0.7 + 0.4 * Math.max(0, -s), 0.3, 1.3]] : [[1.25, 0.15, 1.25], [1.3, 0.05, 1.2]];
    posePerson(b.P, { x: b.x, y: 0.7, z: b.z, yaw: -1.25, walk: 0.2, ph, sway: 0.06 * s, headPitch: b.k === 'trumpet' || b.k === 'trombone' ? -0.25 - 0.08 * s : 0, armL: arm[0], armR: arm[1], emo: { smile: 0.4 } }); });
  S.you.root.visible = body; S.lanterns.forEach((l) => (l.g.visible = !body)); S.ring.forEach((r) => (r.P.root.visible = body));
  // confetti in a box around the camera
  if (!body && camPos) { const M = S.conf, cx = camPos.x, cz = camPos.z; for (let i = 0; i < 360; i++) { const hx = hsh(i, 1), hz = hsh(i, 2), hy = hsh(i, 3), sp = 0.35 + 0.4 * hsh(i, 4);
    const x = cx + (hx - 0.5) * 7 + 0.15 * Math.sin(vt * 2 + i), z = cz - 0.6 - hz * 9, y = 0.2 + mod(hy * 6 - vt * sp, 6);
    M.setMatrixAt(i, M4c(x, y, z, vt * (2 + 3 * hsh(i, 5)) + i, 1, 1, 1, vt * (3 + 2 * hsh(i, 6)) + i * 0.7, 0)); } M.instanceMatrix.needsUpdate = true; M.visible = true; } else S.conf.visible = false;
}
// post: grade the frame (desaturate / darken / cool), an optional blur, and a dream glow
let FIESTA_TMP = null;
function fiestaTmp() { if (!FIESTA_TMP) { FIESTA_TMP = document.createElement('canvas'); FIESTA_TMP.width = W; FIESTA_TMP.height = H; } return FIESTA_TMP; }
function fiestaGrade(o) { const c = fiestaTmp(), x = c.getContext('2d'); ctx.save(); screen();
  if ((o.blur || 0) > 0.2 || o.sat != null || o.bri != null) { x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0); ctx.filter = `blur(${(o.blur || 0).toFixed(1)}px) saturate(${o.sat ?? 1}) brightness(${o.bri ?? 1})`; ctx.drawImage(c, 0, 0); ctx.filter = 'none'; }
  if (o.tint && o.ta > 0) { ctx.globalCompositeOperation = o.mode || 'soft-light'; ctx.globalAlpha = o.ta; ctx.fillStyle = o.tint; ctx.fillRect(0, 0, W, H); }
  ctx.restore(); }
function fiestaDream(a) { if (a <= 0) return; const c = fiestaTmp(), x = c.getContext('2d'); x.clearRect(0, 0, W, H); x.filter = 'blur(18px) brightness(1.15)'; x.drawImage(ctx.canvas, 0, 0); x.filter = 'none';
  x.globalCompositeOperation = 'destination-out'; const g = x.createRadialGradient(CX, H * 0.47, H * 0.12, CX, H * 0.47, H * 0.55); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.drawImage(c, 0, 0); ctx.restore(); }

// ---- the shots
// the party: you walk down the middle of the street toward the church; someone raises a cup to you; fireworks
SHOT_FN.party = (lt, dur, t) => { const S = fiestaBuild(), st = S.st, vt = t, ph = lt * 5.6;
  const z = lerp(6.2, 0.4, lt / dur), p = [0.05 + 0.04 * Math.sin(ph * 0.5), 1.66 + 0.022 * Math.abs(Math.sin(ph)), z];
  camLook(st.cam, p[0], p[1], p[2], 0.6 + 0.4 * Math.sin(lt * 0.6), 5.2, z - 60); fov(st, 62); handheld(st.cam, t, 0.8, 3); st.cam.rotation.z += 0.012 * Math.sin(ph * 0.5);
  if (CAMONLY) return renderStage(st);
  fiestaPose(S, vt, 'party', st.cam.position); renderStage(st, 1.0); bloom(0.55); };
// the bang: a burst right overhead, your heart stops — the view tilts and falls sideways to the ground
SHOT_FN.bang = (lt, dur, t) => { const S = fiestaBuild(), st = S.st, vt = t, u = clamp(lt / 0.78), f = u * u, hit = lt > 0.78 ? Math.exp(-(lt - 0.78) * 9) * Math.sin((lt - 0.78) * 40) : 0;
  const p = [lerp(0.05, 0.42, f), lerp(1.66, 0.22, f) + 0.03 * hit, lerp(0.4, -0.05, f)];
  camLook(st.cam, p[0], p[1], p[2], lerp(0.6, 3.0, f), lerp(5.2, 0.6, ss(0, 1, u)), lerp(-60, -30, f), 0); st.cam.rotation.z = -lerp(0, 1.38, EZ.io ? f : f) + 0.05 * hit; st.cam.rotation.x += 0.12 * Math.sin(u * Math.PI); fov(st, 62); handheld(st.cam, t, 1.5 * (1 - u), 4);
  if (CAMONLY) return renderStage(st);
  fiestaPose(S, 3.5 + lt * 0.25, 'party', st.cam.position); renderStage(st, 0.95); bloom(0.7);
  fiestaGrade({ blur: lt > 0.5 ? (lt - 0.5) * 9 : 0, sat: lerp(1, 0.55, ss(0.3, 1.1, lt)), bri: lerp(1, 0.38, ss(0.4, 1.0, lt)) }); };
// your body: from above, people gather; you float up out of yourself; colder toward 9 s
SHOT_FN.body = (lt, dur, t) => { const S = fiestaBuild(), st = S.st, u = lt / dur, e = EZ.io(u), bx = FIESTA_Z.BODY[0], bz = FIESTA_Z.BODY[1] + 0.95;
  const h = lerp(3.4, 10.5, e), p = [bx + 0.05 * Math.sin(lt * 0.5), h, bz + lerp(0.9, 2.2, e)];
  camLook(st.cam, p[0], p[1], p[2], bx, 0, bz - lerp(-0.2, 1.6, e), 0); st.cam.rotation.z = lerp(0.0, 0.12, e) + 0.02 * Math.sin(lt * 0.7); fov(st, lerp(56, 60, e)); handheld(st.cam, t, 0.35, 5);
  if (CAMONLY) return renderStage(st);
  const vt = 4.75 + lt * 0.5; fiestaPose(S, vt, 'body');
  // the body on its back, arms loose, head turned
  const Y = S.you; posePerson(Y, { x: 0, y: 0, z: 0, armL: [-0.12, 0.62, 0.25, 0.4], armR: [-0.1, 0.95, 0.5, -0.3], legL: [0.04, 0.12], legR: [-0.08, 0.3], headYaw: 0.55, headPitch: 0.1, emo: { blink: 1, open: 0.18 } });
  Y.root.position.set(bx, 0.13, FIESTA_Z.BODY[1]); Y.root.rotation.set(-Math.PI / 2, Math.PI, 0.0, 'YXZ'); Y.legs[0].th.rotation.z = -0.1; Y.legs[1].th.rotation.z = 0.16; Y.legs[1].ft.rotation.y = 0.6; Y.legs[0].ft.rotation.y = -0.4;
  S.ring.forEach((r, i) => { const P = r.P, ph = vt * 3 + r.ph, s = Math.sin(ph); const q = { x: r.x, z: r.z, yaw: r.yaw, headPitch: 0.45, emo: { fear: 0.9, open: 0.5, surprise: 0.3, tremble: 0.6 }, look: [0, -0.6] };
    if (r.role === 'cpr') Object.assign(q, { kneel: 1, lean: 0.62 + 0.08 * Math.max(0, Math.sin(vt * 11)), headPitch: 0.2, armL: [1.05, 0.05, 0.05], armR: [1.05, 0.05, 0.05], emo: { fear: 0.6, determined: 0.8, open: 0.3 } });
    else if (r.role === 'kneel') Object.assign(q, { kneel: 1, lean: 0.35, armL: [1.7, 0.3, 2.3], armR: [1.7, 0.3, 2.3], emo: { cry: 0.9, fear: 0.7 } });
    else if (r.role === 'phone') Object.assign(q, { armR: [0.4, 0.75, 2.55, 0.3], armL: [0.25, 0.2, 1.2], headPitch: 0.35, emo: { fear: 0.8, open: 0.6 + 0.2 * s } });
    else if (r.role === 'head') Object.assign(q, { armL: [2.5, 0.55, 2.2], armR: [2.5, 0.55, 2.2] });
    else if (r.role === 'mouth') Object.assign(q, { armL: [1.6, 0.15, 2.5], armR: [0.3, 0.2, 0.9] });
    else Object.assign(q, { armL: [0.25 + 0.1 * s, 0.2, 0.6], armR: [0.2, 0.18, 0.5] });
    posePerson(P, q); });
  renderStage(st, lerp(1.0, 0.8, ss(0.5, 1, u))); bloom(0.5);
  const k = ss(0.35, 1, u); fiestaGrade({ sat: lerp(0.95, 0.35, k), bri: lerp(1, 0.7, k), tint: '#3a5a8a', ta: 0.35 * k, mode: 'color' }); };
// the memory: the party again, slowed, warm, soft-edged; a friend laughs at you
SHOT_FN.memory = (lt, dur, t) => { const S = fiestaBuild(), st = S.st, vt = 1.2 + lt * 0.3, u = lt / dur;
  const p = [0.2, 1.64, lerp(3.4, 3.1, u)]; camLook(st.cam, p[0], p[1], p[2], 0.3, 2.7, -12); fov(st, 54); handheld(st.cam, t, 0.5, 6);
  if (CAMONLY) return renderStage(st);
  fiestaPose(S, vt, 'party', st.cam.position); const F = S.heroes[0]; const ph = vt * 4 + 1;
  posePerson(F.P, { x: 0.02, z: 1.55, yaw: 0.05, walk: 0.15, ph, sway: 0.05 * Math.sin(ph * 0.5), armR: [2.2, 0.3, 0.5], armL: [0.6, 0.3, 1.4], headPitch: -0.22 - 0.06 * Math.sin(ph), headRoll: 0.1, headYaw: -0.1, emo: { smile: 0.85, open: 0.3 + 0.12 * Math.sin(ph * 2) }, look: [-0.15, 0.1] });
  renderStage(st, 1.08); bloom(0.95); fiestaDream(0.95); fiestaGrade({ tint: '#ffa860', ta: 0.3, mode: 'soft-light' }); };
// ---- the phone: a dim tiled hallway at home; your hand holds the phone, its lock screen glows: 23:47, Mamá
function fiestaScreenTex() { return g3Tex((x, w, h) => { const s = w / 360; x.save(); x.scale(s, s); const W2 = 360, H2 = 780;
  const g = x.createLinearGradient(0, 0, W2, H2); g.addColorStop(0, '#2a1a4a'); g.addColorStop(0.5, '#4a2a6a'); g.addColorStop(1, '#1a2a5a'); x.fillStyle = g; x.fillRect(0, 0, W2, H2);
  const R = RNG('wall'); for (let k = 0; k < 14; k++) blot(x, R.r(0, W2), R.r(0, H2), R.r(30, 120), R.pick(['rgba(255,140,200,0.25)', 'rgba(120,160,255,0.25)', 'rgba(255,200,140,0.18)']));
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '600 15px -apple-system, "Helvetica Neue", Arial, sans-serif'; x.textAlign = 'left'; x.fillText('Telcel', 22, 28); x.textAlign = 'right'; x.fillText('23 %', 336, 28);
  x.textAlign = 'center'; x.font = '16px -apple-system, "Helvetica Neue", Arial, sans-serif'; x.fillText('🔒', W2 / 2, 62);
  x.font = '600 19px -apple-system, "Helvetica Neue", Arial, sans-serif'; x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillText('sábado, 25 de octubre', W2 / 2, 102);
  x.font = '600 96px -apple-system, "Helvetica Neue", Arial, sans-serif'; x.fillStyle = '#fff'; x.fillText('23:47', W2 / 2, 196);
  const card = (y, hh, app, when, title, body) => { x.fillStyle = 'rgba(245,240,255,0.22)'; x.beginPath(); x.roundRect(14, y, W2 - 28, hh, 20); x.fill(); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(14, y, W2 - 28, 1);
    x.textAlign = 'left'; x.font = '600 12px -apple-system, Arial, sans-serif'; x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillText(app.toUpperCase(), 58, y + 24); x.textAlign = 'right'; x.fillText(when, W2 - 28, y + 24);
    x.fillStyle = app === 'Teléfono' ? '#3ac46a' : app === 'Mensajes' ? '#3ac46a' : '#ff9a2a'; x.beginPath(); x.roundRect(26, y + 12, 22, 22, 6); x.fill(); x.fillStyle = '#fff'; x.font = '13px Arial'; x.textAlign = 'center'; x.fillText(app === 'Teléfono' ? '✆' : app === 'Mensajes' ? '✉' : '!', 37, y + 28);
    x.textAlign = 'left'; x.font = '700 16px -apple-system, Arial, sans-serif'; x.fillStyle = '#fff'; x.fillText(title, 28, y + 52); x.font = '15px -apple-system, Arial, sans-serif'; x.fillStyle = 'rgba(255,255,255,0.92)'; body.forEach((l, i) => x.fillText(l, 28, y + 74 + i * 20)); };
  card(250, 84, 'Teléfono', 'ahora', 'Mamá', ['Llamadas perdidas (3)']);
  card(344, 104, 'Mensajes', 'hace 5 min', 'Mamá', ['¿Vienes mañana a misa? 🙏', 'Te guardo lugar.']);
  card(458, 84, 'Mensajes', 'hace 40 min', 'Mamá', ['Te quiero, hijo. Cuídate ❤️']);
  card(552, 84, 'Recordatorios', '21:00', 'Llamar a mamá', ['Pendiente']);
  x.fillStyle = 'rgba(255,255,255,0.18)'; [[48, 716], [312, 716]].forEach(([cx, cy]) => { x.beginPath(); x.arc(cx, cy, 24, 0, TAU); x.fill(); }); x.fillStyle = '#fff'; x.font = '20px Arial'; x.textAlign = 'center'; x.fillText('🔦', 48, 723); x.fillText('📷', 312, 723);
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.roundRect(W2 / 2 - 66, H2 - 18, 132, 5, 3); x.fill(); x.restore(); }, 720, 1560); }
function fiestaPhoneStage() { return once('fiestaPhone', () => {
  const st = makeStage({ hemi: 0.07, sky: 0x40486a, ground: 0x1a1410, key: 0.0, box: 6, boxFar: 30, fov: 60 }); st.scene.background = new THREE.Color('#050506'); skyEnv(st, '#0a0a12', '#2a2420', dirV(0, 20 * DEG), '#806040'); const S = { st };
  st.scene.fog = new THREE.Fog('#07070a', 3, 12);
  const tile = g3Tex((x, w) => { const R = RNG('tile'); const n = 4, s = w / n; x.fillStyle = '#5a5a58'; x.fillRect(0, 0, w, w); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const l = R.r(-10, 10); x.fillStyle = `rgb(${212 + l},${208 + l},${200 + l})`; x.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,255,255' : '120,110,100'},0.08)`; x.fillRect(i * s + R.r(4, s - 8), j * s + R.r(4, s - 8), R.r(2, 9), R.r(2, 9)); } } }, 512, 512);
  const fl = wrap(tile, 6, 12); plane(st, 2.4, 4.8, STDm({ map: fl, roughness: 0.22, metalness: 0.0, bumpMap: fl, bumpScale: 0.004 }), 0, 0, -1.6);
  const wt = wrap(g3Tex((x, w) => { x.fillStyle = '#4a4a50'; x.fillRect(0, 0, w, w); x.fillStyle = '#c8ccd0'; for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) x.fillRect(i * w / 4 + 2, j * w / 8 + 2, w / 4 - 4, w / 8 - 4); }, 256, 256), 4, 2);
  [-1, 1].forEach((s) => { const m = mesh(new THREE.PlaneGeometry(4.8, 1.2), STDm({ map: wt, roughness: 0.25 }), s * 1.2, 0.6, -1.6, { ry: -s * Math.PI / 2 }); st.scene.add(m); st.scene.add(mesh(new THREE.PlaneGeometry(4.8, 1.6), STDm({ color: '#6a6458', roughness: 0.9 }), s * 1.2, 2.0, -1.6, { ry: -s * Math.PI / 2 })); });
  // the far end: a half-open door with warm light, a towel, a plant
  st.scene.add(mesh(new THREE.PlaneGeometry(2.4, 2.8), STDm({ color: '#5a544a', roughness: 0.9 }), 0, 1.4, -4.0));
  st.scene.add(mesh(new THREE.PlaneGeometry(0.42, 2.0), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.0, 0.55) }), 0.42, 1.0, -3.99));
  const dl = new THREE.PointLight('#ffb070', 0.45, 4.5, 1.5); dl.position.set(0.45, 1.2, -3.7); st.scene.add(dl);
  // the phone and the hand, held in front of you
  const hold = (S.hold = new THREE.Group()); st.cam.add(hold); const ph = (S.phone = new THREE.Group()); hold.add(ph);
  const pw = 0.0715, phh = 0.147, pd = 0.0078; ph.add(mesh(new THREE.BoxGeometry(pw, phh, pd), STDm({ color: '#1a1c22', roughness: 0.3, metalness: 0.6 })));
  ph.add(mesh(new THREE.BoxGeometry(pw + 0.0012, phh + 0.0012, pd * 0.6), STDm({ color: '#8a8e96', roughness: 0.25, metalness: 0.95 })));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(pw - 0.004, phh - 0.004), new THREE.MeshBasicMaterial({ map: fiestaScreenTex(), toneMapped: false })); scr.position.z = pd / 2 + 0.0004; ph.add(scr); S.scr = scr;
  const sl = new THREE.PointLight('#a0b0ff', 0.55, 1.6, 1.4); sl.position.set(0, 0.0, 0.08); ph.add(sl); const sl2 = new THREE.PointLight('#8090e0', 0.9, 3.5, 1.3); sl2.position.set(0, -0.05, 0.25); ph.add(sl2);
  const HD = (S.hand = makeHand(1, { sleeve: '#ece6da' })); hold.add(HD.root);
  const sleeve = mesh(new THREE.CylinderGeometry(0.05, 0.068, 0.8, 20, 1, true).translate(0, -0.66, 0), STDm({ color: '#d8d2c6', roughness: 0.9, side: THREE.DoubleSide })); sleeve.scale.set(1.25, 1, 0.9); HD.fore.add(sleeve);
  HD.root.traverse((m) => { if (m.isMesh) m.castShadow = false; });
  return S; }); }
const fiestaFo = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Matrix4()];
function fiestaOrient(o, up, back) { const [x, y, z, m] = fiestaFo; y.copy(up).normalize(); z.copy(back).addScaledVector(y, -back.dot(y)).normalize(); x.crossVectors(y, z); m.makeBasis(x, y, z); o.quaternion.setFromRotationMatrix(m); }
SHOT_FN.phone = (lt, dur, t) => { const S = fiestaPhoneStage(), st = S.st;
  camLook(st.cam, 0.0, 1.55, 0.3, 0.05, 0.0, -1.3); fov(st, 60); handheld(st.cam, t, 1.2, 7);
  if (CAMONLY) return renderStage(st);
  // phone in front, lower right, tilted toward you; the hand grips it from the right: fingers wrap the left edge, thumb on the right
  S.phone.position.set(0.028, -0.025, -0.26); S.phone.rotation.set(0.12 + 0.01 * Math.sin(t * 1.3), -0.08, 0.06 + 0.012 * Math.sin(t * 0.9));
  const HD = S.hand; S.phone.updateMatrix(); const pm = S.phone.matrix;
  HD.root.position.set(0.02, -0.148, -0.02).applyMatrix4(pm); fiestaOrient(HD.root, new THREE.Vector3(-0.25, 1, 0).transformDirection(pm), new THREE.Vector3(0, 0, -1).transformDirection(pm));
  poseHand(HD, { curl: [-0.04, -0.04, -0.03, 0.0], spread: 0.1, thumb: 0.35, wristPitch: 0.0, tremble: 0.1 });
  renderStage(st, 1.0); bloom(0.6); };
