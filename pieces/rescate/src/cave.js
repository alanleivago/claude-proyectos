// =====================================================================
//  CAVE — the cutaway. The rock is a slab sliced open along the sump: the front face (dark mottled blue-grey rock with
//  the passage cut out), the cut walls going back DEPTH, the back wall (sandstone above the water, blue with caustics
//  below), the water (a tinted sheet in front + the surface planes), an ochre mineral rim along the cut, the guide rope,
//  and the four. World units are metres; x runs from the way out (left) to the air pocket (right), y is up, z to camera.
// =====================================================================
const WL = 0.4, DEPTH = 1.1, UE = 0.03, CBB = { x0: -10, x1: 11, y0: -5, y1: 3 };
const CAVE_CL = [[-7.0, 1.15], [-7.05, 0.0], [-6.9, -1.4], [-6.3, -2.7], [-5.0, -3.4], [-3.2, -3.15], [-1.5, -3.6], [0.4, -3.3], [2.2, -3.55], [3.8, -3.0], [5.0, -1.9], [5.6, -1.2]];
const CH = { x: 7.4, y: 0.6, rx: 2.6, ry: 2.0 };
const caveCurve = new THREE.CatmullRomCurve3(CAVE_CL.map(([x, y]) => new THREE.Vector3(x, y, 0)));
const caveHW = (u) => lerp(0.6, 0.44, ss(0.08, 0.22, u)) - 0.07 * Math.exp(-(((u - 0.55) / 0.04) ** 2)) + 0.035 * Math.sin(u * 37) + 0.02 * Math.sin(u * 91 + 1);
// a point in the passage: u along it (0 = far left, 1 = the pocket), v across it (-1 floor .. 1 ceiling)
function tun(u, v = 0) { const p = caveCurve.getPointAt(clamp(u)), d = caveCurve.getTangentAt(clamp(u)), h = caveHW(u); return { x: p.x - d.y * h * v, y: p.y + d.x * h * v, dx: d.x, dy: d.y }; }
const chamberFloor = (x) => CH.y - CH.ry * Math.sqrt(Math.max(0, 1 - ((x - CH.x) / CH.rx) ** 2)) * 0.97;

function caveOutline() {
  const N = 180, up = [], lo = [];
  for (let i = Math.round(UE * N); i <= N; i++) { const a = tun(i / N, 1), b = tun(i / N, -0.95); up.push([a.x, a.y]); lo.push([b.x, b.y]); }
  const ang = (q) => Math.atan2((q[1] - CH.y) / CH.ry, (q[0] - CH.x) / CH.rx);
  let a0 = ang(up[up.length - 1]); const a1 = ang(lo[lo.length - 1]); if (a0 < 0) a0 += TAU;
  const arc = [], M = 90;
  for (let k = 1; k < M; k++) { const a = lerp(a0, a1, k / M), r = 1 + 0.06 * Math.sin(3 * a + 1) + 0.025 * Math.sin(8 * a); arc.push([CH.x + Math.cos(a) * CH.rx * r, CH.y + Math.sin(a) * CH.ry * r]); }
  return up.concat(arc, lo.reverse());
}
// geometry UVs in the cutaway's box (so the back and the water sheet share one painted canvas)
function bbUV(g) { const p = g.attributes.position, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[2 * i] = (p.getX(i) - CBB.x0) / (CBB.x1 - CBB.x0); uv[2 * i + 1] = (p.getY(i) - CBB.y0) / (CBB.y1 - CBB.y0); } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g; }
const BBW = 2048, BBH = Math.round(2048 * (CBB.y1 - CBB.y0) / (CBB.x1 - CBB.x0));
const bbX = (x) => (x - CBB.x0) / (CBB.x1 - CBB.x0) * BBW, bbY = (y) => (1 - (y - CBB.y0) / (CBB.y1 - CBB.y0)) * BBH;

function rockTex(key, base, blots, specks, w = 512, bs = 1) { return g3Tex((x) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w);
  for (let k = 0; k < 420; k++) { const px = R.r(0, w), py = R.r(0, w), r = R.r(12, 70) * bs, c = R.pick(blots); for (const ox of [-w, 0, w]) for (const oy of [-w, 0, w]) blot(x, px + ox, py + oy, r, c); }
  for (let k = 0; k < 140; k++) { x.strokeStyle = `rgba(0,0,0,${R.r(0.08, 0.22)})`; x.lineWidth = R.r(0.8, 2.2); x.beginPath(); let px = R.r(0, w), py = R.r(0, w); x.moveTo(px, py); for (let s = 0; s < 5; s++) { px += R.n(14); py += R.n(14); x.lineTo(px, py); } x.stroke(); }
  speck(x, w, w, 9000 * bs * bs, specks, R, 1, 2); }, w, w); }

function caveStage() { return once('cave', () => {
  const st = makeStage({ fov: 34, far: 400, sky: 0xc8d8e8, ground: 0x8a8068, hemi: 1.0, keyCol: '#fff4e4', key: 2.2, box: 9, boxFar: 60, sunDist: 30 });
  st.scene.background = lin('#0b0e12');
  st.setSun(new THREE.Vector3(-0.35, 0.75, 1), new THREE.Vector3(-0.5, 0.5, 0));
  const fill = new THREE.DirectionalLight(0xbfd8ff, 0.6); fill.position.set(6, -2, 8); st.scene.add(fill); st.fill = fill;
  const OUT = caveOutline(), S = st.scene;
  // front face: a huge slab with the passage cut out
  // the hillside: the slab's top edge is the ground; the gallery opens onto it at the cave mouth
  const A = OUT[0], Bm = OUT[OUT.length - 1], bump = (x) => 0.3 * Math.sin(x * 0.7) + 0.15 * Math.sin(x * 2.1 + 1);
  const surf = (x) => (x >= A[0] ? A[1] + 0.3 * bump(x) + 3.1 * ss(A[0] + 1.5, A[0] + 9, x) + (x - A[0]) * 0.02 - bump(A[0]) : x <= Bm[0] ? Bm[1] + (x - Bm[0]) * 0.02 + 0.3 * bump(x) - bump(Bm[0]) : lerp(Bm[1], A[1], (x - Bm[0]) / (A[0] - Bm[0])));
  st.surf = surf; st.mouth = [(A[0] + Bm[0]) / 2, (A[1] + Bm[1]) / 2];
  const ctr = [[-60, -40], [60, -40]]; for (let x = 60; x > A[0] + 0.01; x -= 0.25) ctr.push([x, surf(x)]);
  OUT.forEach((q) => ctr.push(q)); for (let x = Bm[0] - 0.25; x >= -60; x -= 0.25) ctr.push([x, surf(x)]);
  const shape = new THREE.Shape(ctr.map(([x, y]) => new THREE.Vector2(x, y)));
  // the ground going back from the cut (dark scrub under the night), shrubs, sky and stars, a grass lip along the cut edge
  const NX = 240, NZ = 30, tp = [], tc = [], ti = [], Rg = RNG('terrain'), gy = (x, z) => surf(x) + (-z) * 0.12 + 0.25 * Math.sin(x * 1.3 + z * 0.9) * Math.min(1, -z);
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const x = -40 + 80 * i / NX, z = -45 * (j / NZ) ** 1.4, c = lin('#26421a').lerp(lin('#5a7a30'), clamp(0.5 + 0.35 * Math.sin(x * 3.1 + z * 2.3) + 0.3 * Math.sin(x * 0.7 - z * 1.3) + Rg.n(0.18))).lerp(lin('#6a5a3a'), clamp(0.6 - Math.abs(Math.abs(x - (CAVE_CL[0][0])) - 1.9) * 1.2) * 0.8);
    tp.push(x, gy(x, z) - 0.9 * ss(1.7, 0.95, Math.abs(x - st.mouth[0])), z); tc.push(c.r, c.g, c.b); }
  const sx0 = Math.min(A[0], Bm[0]) - 0.12, sx1 = Math.max(A[0], Bm[0]) + 0.12;   // no ground over the cenote itself (it read as a green lid from below)
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i; if (j < 2 && -40 + 80 * i / NX >= sx0 && -40 + 80 * (i + 1) / NX <= sx1) continue; ti.push(a, a + 1, a + NX + 1, a + 1, a + NX + 2, a + NX + 1); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); tg.setAttribute('color', new THREE.Float32BufferAttribute(tc, 3)); tg.setIndex(ti); tg.computeVertexNormals();
  const terr = new THREE.Mesh(tg, STDm({ vertexColors: true, roughness: 1 })); terr.receiveShadow = true; S.add(terr); st.gy = gy;
  jungle(st, gy, Rg);
  S.background = lin('#9cc4e4');
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: lin('#4f86c6') }, hor: { value: lin('#d6e6ee') } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top, hor; varying vec3 vD; void main(){ float h = clamp(normalize(vD).y, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h, 0.5)), 1.0);\n#include <encodings_fragment>\n}' }));
  sky.renderOrder = -2; S.add(sky);
  const sp = [], Rs = RNG('stars'); for (let k = 0; k < 900; k++) { const az = Rs.r(-1.4, 1.4), el = Rs.r(0.08, 1.2); sp.push(Math.sin(az) * Math.cos(el) * 800, Math.sin(el) * 800, -Math.cos(az) * Math.cos(el) * 800); }
  S.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)), new THREE.PointsMaterial({ color: 0xdfe8ff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false })));
  // the river: a channel cut in the ground, its water at the line (the cenote opens in its bed)
  const riv = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 44).rotateX(-Math.PI / 2), STDm({ color: '#4fa8b8', transparent: true, opacity: 0.85, roughness: 0.1, bumpMap: wrap(g3Tex((x, w) => { const R = RNG('rv'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); for (let k = 0; k < 260; k++) { x.strokeStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'; x.lineWidth = R.r(1, 3); x.beginPath(); x.arc(R.r(0, w), R.r(0, w), R.r(6, 30), R.r(0, 3), R.r(3, 6)); x.stroke(); } }, 256, 256, false), 2, 20), bumpScale: 0.5 }));
  riv.position.set(st.mouth[0], WL, -DEPTH - 22); S.add(riv); st.river = riv;
  const gpts = ctr.filter(([x, y]) => y > -39 && Math.abs(x) < 59 && (x < Bm[0] - 0.01 || x > A[0] + 0.01 || y > A[1] + 0.05)), gl = [], gu = [], gi = []; let ga = 0;
  gpts.forEach(([x, y], i) => { if (i) ga += Math.hypot(x - gpts[i - 1][0], y - gpts[i - 1][1]); gl.push(x, y + 0.05, 0.015, x, y - 0.28 - 0.08 * Math.sin(ga * 5), 0.015); gu.push(ga * 0.5, 0, ga * 0.5, 1); });
  for (let i = 0; i < gpts.length - 1; i++) { if (Math.hypot(gpts[i + 1][0] - gpts[i][0], gpts[i + 1][1] - gpts[i][1]) > 1) continue; const a = 2 * i; gi.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const ggeo = new THREE.BufferGeometry(); ggeo.setAttribute('position', new THREE.Float32BufferAttribute(gl, 3)); ggeo.setAttribute('uv', new THREE.Float32BufferAttribute(gu, 2)); ggeo.setIndex(gi); ggeo.computeVertexNormals();
  S.add(new THREE.Mesh(ggeo, STDm({ map: wrap(rockTex('grass', '#4a5a28', ['rgba(120,150,60,0.4)', 'rgba(40,30,15,0.5)'], ['rgba(150,180,80,0.6)', 'rgba(30,25,10,0.6)']), 20, 1), side: THREE.DoubleSide })));
  const fT = wrap(rockTex('front', '#1e211b', ['rgba(72,86,50,0.36)', 'rgba(8,10,7,0.5)', 'rgba(92,72,46,0.3)', 'rgba(58,70,44,0.3)'], ['rgba(92,104,68,0.5)', 'rgba(14,15,11,0.5)', 'rgba(112,90,62,0.35)'], 1024, 2), 0.1, 0.1);
  const front = new THREE.Mesh(new THREE.ShapeGeometry(shape), STDm({ map: fT, bumpMap: fT, bumpScale: 0.04, roughness: 0.95 })); front.receiveShadow = true; S.add(front);
  // the cut walls: a ribbon round the outline from the face back to the back wall; tinted where they are under water
  const wp = [], wc = [], wu = [], wi = [], cRock = lin('#827c66'), cWet = lin('#3f8fa6'); let acc = 0;
  OUT.forEach(([x, y], i) => { if (i) acc += Math.hypot(x - OUT[i - 1][0], y - OUT[i - 1][1]); const c = cRock.clone().lerp(cWet, ss(WL + 0.05, WL - 0.3, y));
    for (const z of [0, -DEPTH]) { wp.push(x, y, z); wc.push(c.r, c.g, c.b); wu.push(acc * 0.6, -z * 0.6); } });
  for (let i = 0; i < OUT.length - 1; i++) { const a = 2 * i; wi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); wg.setAttribute('color', new THREE.Float32BufferAttribute(wc, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(wu, 2)); wg.setIndex(wi); wg.computeVertexNormals();
  const wT = wrap(rockTex('wall', '#9aa4ac', ['rgba(255,255,255,0.18)', 'rgba(0,0,0,0.25)'], ['#c8ccd0', '#6a727a']), 1, 1);
  const walls = new THREE.Mesh(wg, STDm({ map: wT, bumpMap: wT, bumpScale: 0.05, vertexColors: true, side: THREE.DoubleSide })); walls.receiveShadow = true; S.add(walls);
  // the back wall: one painted canvas — sandstone above the water line, blue rock with caustics below
  const bT = g3Tex((x) => { const R = RNG('back'), yw = bbY(WL);
    let g = x.createLinearGradient(0, 0, 0, yw); g.addColorStop(0, '#dcc096'); g.addColorStop(1, '#a8845a'); x.fillStyle = g; x.fillRect(0, 0, BBW, yw);
    for (let k = 0; k < 500; k++) blot(x, R.r(0, BBW), R.r(0, yw), R.r(10, 60), R.pick(['rgba(255,240,210,0.18)', 'rgba(90,60,30,0.16)', 'rgba(120,80,40,0.12)']));
    for (let k = 0; k < 220; k++) { x.strokeStyle = `rgba(70,45,25,${R.r(0.15, 0.4)})`; x.lineWidth = R.r(1, 3); x.beginPath(); let px = R.r(0, BBW), py = R.r(0, yw); x.moveTo(px, py); for (let s = 0; s < 6; s++) { px += R.n(26); py += R.r(-4, 22); x.lineTo(px, py); } x.stroke(); }
    g = x.createLinearGradient(0, yw, 0, BBH); g.addColorStop(0, '#66b4c8'); g.addColorStop(1, '#2c6680'); x.fillStyle = g; x.fillRect(0, yw, BBW, BBH - yw);
    for (let k = 0; k < 400; k++) blot(x, R.r(0, BBW), R.r(yw, BBH), R.r(10, 50), R.pick(['rgba(20,50,70,0.22)', 'rgba(140,210,230,0.14)']));
    for (let k = 0; k < 900; k++) { x.strokeStyle = `rgba(215,248,255,${R.r(0.08, 0.26)})`; x.lineWidth = R.r(1.5, 4); x.beginPath(); const px = R.r(0, BBW), py = R.r(yw, BBH), l = R.r(20, 70); x.moveTo(px, py); x.bezierCurveTo(px + l * 0.3, py + R.n(10), px + l * 0.7, py + R.n(10), px + l, py + R.n(6)); x.stroke(); }
    speck(x, BBW, BBH, 30000, ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.2)'], R, 1, 3);
    for (let k = 0; k < 60; k++) { const px = R.r(0, BBW), py = R.r(0, yw); x.fillStyle = `rgba(250,236,205,${R.r(0.05, 0.14)})`; x.beginPath(); x.ellipse(px, py, R.r(20, 60), R.r(60, 160), 0, 0, TAU); x.fill(); }
    x.save(); x.filter = 'blur(28px)'; x.strokeStyle = 'rgba(30,18,8,0.65)'; x.lineWidth = 110; x.beginPath(); caveOutline().forEach(([px, py], i) => (i ? x.lineTo(bbX(px), bbY(py)) : x.moveTo(bbX(px), bbY(py)))); x.closePath(); x.stroke(); x.restore(); }, BBW, BBH);
  const hole = new THREE.Shape(OUT.map(([x, y]) => new THREE.Vector2(x, y)));
  const back = new THREE.Mesh(bbUV(new THREE.ShapeGeometry(hole)), STDm({ map: bT, bumpMap: bT, bumpScale: 0.03, roughness: 0.9 })); back.position.z = -DEPTH; back.receiveShadow = true; S.add(back);
  // water: a tinted sheet just behind the face (clear above the line), with a bright meniscus
  const sT = g3Tex((x) => { const R = RNG('sheet'), yw = bbY(WL); x.clearRect(0, 0, BBW, BBH);
    const g = x.createLinearGradient(0, yw, 0, BBH); g.addColorStop(0, 'rgba(90,215,235,0.30)'); g.addColorStop(1, 'rgba(30,120,160,0.48)'); x.fillStyle = g; x.fillRect(0, yw, BBW, BBH - yw);
    for (let k = 0; k < 500; k++) { x.strokeStyle = `rgba(225,252,255,${R.r(0.04, 0.12)})`; x.lineWidth = R.r(1, 3); x.beginPath(); const px = R.r(0, BBW), py = R.r(yw + 4, BBH), l = R.r(30, 90); x.moveTo(px, py); x.quadraticCurveTo(px + l / 2, py + R.n(6), px + l, py); x.stroke(); }
    x.fillStyle = 'rgba(235,253,255,0.85)'; x.fillRect(0, yw - 2, BBW, 4); }, BBW, BBH);
  const sheet = new THREE.Mesh(bbUV(new THREE.ShapeGeometry(hole)), new THREE.MeshBasicMaterial({ map: sT, transparent: true, depthWrite: false })); sheet.position.z = -0.04; sheet.renderOrder = 5; S.add(sheet); st.sheet = sheet;
  // the surface planes, wherever the water line crosses open passage
  const xs = []; OUT.forEach(([x, y], i) => { const [x2, y2] = OUT[(i + 1) % OUT.length]; if ((y - WL) * (y2 - WL) < 0) xs.push(x + (WL - y) / (y2 - y) * (x2 - x)); }); xs.sort((a, b) => a - b);
  const rT = wrap(g3Tex((x, w) => { const R = RNG('ripple'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); for (let k = 0; k < 260; k++) { x.strokeStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'; x.lineWidth = R.r(1, 3); x.beginPath(); const px = R.r(0, w), py = R.r(0, w); x.arc(px, py, R.r(6, 30), R.r(0, 3), R.r(3, 6)); x.stroke(); } }, 256, 256, false), 3, 1);
  st.wsurf = [];
  for (let i = 0; i + 1 < xs.length; i += 2) { const w = xs[i + 1] - xs[i], m = new THREE.Mesh(new THREE.PlaneGeometry(w, DEPTH).rotateX(-Math.PI / 2), STDm({ color: '#6cd0e4', transparent: true, opacity: 0.6, roughness: 0.12, bumpMap: rT, bumpScale: 0.6, depthWrite: false }));
    m.position.set((xs[i] + xs[i + 1]) / 2, WL, -DEPTH / 2); m.renderOrder = 4; S.add(m); st.wsurf.push(m); }
  // the mineral rim along the cut (a lit core + a soft halo)
  const rimT = wrap(rockTex('rim', '#6e8a36', ['rgba(160,190,80,0.4)', 'rgba(60,44,20,0.45)', 'rgba(110,86,44,0.35)'], ['rgba(185,215,110,0.6)', 'rgba(52,36,16,0.6)']), 24, 1);
  const rpos = [], ruv = [], ridx = []; let ra = 0;
  OUT.forEach(([x, y], i) => { const [xa, ya] = OUT[Math.max(0, i - 1)], [xb, yb] = OUT[Math.min(OUT.length - 1, i + 1)], L = Math.hypot(xb - xa, yb - ya) || 1, nx = -(yb - ya) / L, ny = (xb - xa) / L;
    if (i) ra += Math.hypot(x - OUT[i - 1][0], y - OUT[i - 1][1]); const w = 0.15 + 0.04 * Math.sin(ra * 3.1) + 0.03 * Math.sin(ra * 7.7);
    rpos.push(x - nx * 0.015, y - ny * 0.015, 0.012, x + nx * w, y + ny * w, 0.012); ruv.push(ra * 0.5, 0, ra * 0.5, 1); });
  for (let i = 0; i < OUT.length - 1; i++) { const a = 2 * i; ridx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rpos, 3)); rg.setAttribute('uv', new THREE.Float32BufferAttribute(ruv, 2)); rg.setIndex(ridx); rg.computeVertexNormals();
  const rim = new THREE.Mesh(rg, STDm({ map: rimT, bumpMap: rimT, bumpScale: 0.05, emissive: '#1e2a08', emissiveIntensity: 0.45, side: THREE.DoubleSide })); rim.receiveShadow = true; S.add(rim);
  // the guide line (yellow): tied at the cenote, along the passage roof, into the chamber; st.lineK(k) reveals it 0..1
  const rp = []; for (let i = 0; i <= 120; i++) { const q = tun(lerp(0.02, 0.985, i / 120), 0.55); rp.push(new THREE.Vector3(q.x, q.y, -0.4)); }
  rp.push(new THREE.Vector3(CH.x - 0.9, WL + 0.15, -0.4));
  st.ropePts = rp; const lg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp), 400, 0.02, 6, false);
  st.rope = new THREE.Mesh(lg, STDm({ color: '#f2c81e', roughness: 0.6, emissive: '#5a4400', emissiveIntensity: 0.4 })); st.rope.castShadow = true; S.add(st.rope);
  const nIdx = lg.index.count; st.lineK = (k) => lg.setDrawRange(0, Math.floor(clamp(k) * nIdx / 6) * 6);
  const LEDGE0 = WL + 0.12;
  // the ledge in the chamber where he waits (above the water), with a pillar of rock in front of it
  const ledge = []; for (let a = 0; a <= 1; a += 0.05) ledge.push([lerp(CH.x + 0.15, CH.x + 2.5, a), WL + 0.12 + 0.04 * Math.sin(a * 9)]); ledge.push([CH.x + 2.5, WL - 0.6], [CH.x + 0.0, WL - 0.6]);
  const lT = wrap(rockTex('ledge', '#7a6a50', ['rgba(255,240,210,0.15)', 'rgba(40,30,20,0.3)'], ['rgba(30,20,10,0.5)', 'rgba(220,200,170,0.4)']), 0.6, 0.6);
  const lm = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(ledge.map(([x, y]) => new THREE.Vector2(x, y))), { depth: DEPTH - 0.1, bevelEnabled: false }), STDm({ map: lT, bumpMap: lT, bumpScale: 0.04 })); lm.position.z = -DEPTH + 0.05; lm.receiveShadow = true; S.add(lm);
  // the pillar stands ON the ledge (base sunk into the rock, a skirt of rubble round its foot)
  st.pillar = mesh(new THREE.ConeGeometry(0.26, 1.2, 9).translate(0, 0.6, 0), STDm({ map: lT, bumpMap: lT, bumpScale: 0.05, flatShading: true }), CH.x + 0.58, LEDGE0 - 0.06, -0.3); S.add(st.pillar);
  S.add(mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.14, 9), STDm({ map: lT, bumpMap: lT, bumpScale: 0.05, flatShading: true }), CH.x + 0.58, LEDGE0 + 0.0, -0.3));
  st.back = back; st.walls = walls; st.ledge = lm;
  st.stal = mesh(new THREE.ConeGeometry(0.22, 0.9, 8).rotateX(Math.PI).translate(0, -0.45, 0), STDm({ map: lT, flatShading: true }), CH.x + 0.3, CH.y + CH.ry * 0.95, -0.5); S.add(st.stal);
  // the four
  // the cast: Erasto, his father, Gust and the second diver; divers wear a tank, a mask and fins (F.gear toggles them)
  st.cast = {}; Object.entries(CAST).forEach(([k, o]) => { const P = makePerson(Object.assign({}, o)), g = new THREE.Group(); g.add(P.root); S.add(g);
    const F = Object.assign({ P, g }, diveGear(P, o)); F.gearOn(!!o.diver); st.cast[k] = F; });
  st.four = Object.values(st.cast);
  // torches: a lens + a soft additive beam in the right hand
  const beamT = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.6, 'rgba(255,240,200,0.25)'); g.addColorStop(1, 'rgba(255,245,220,0.9)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 8, 128);
  st.four.forEach((F) => { const hd = F.P.arms[1].hand, beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.2, 20, 1, true).translate(0, -1.6, 0), new THREE.MeshBasicMaterial({ map: beamT, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    beam.position.y = -0.1; beam.renderOrder = 7; hd.add(beam); const body = mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 10), STDm({ color: '#2a2a2e', metalness: 0.5 }), 0, -0.06, 0.02); hd.add(body);
    const lens = mesh(new THREE.CircleGeometry(0.03, 12).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff6dc }), 0, -0.141, 0.02); hd.add(lens); F.torch = [beam, body, lens]; torch(F, false); });
  st.lamp = new THREE.PointLight(0xffe8c0, 0, 6, 1.5); S.add(st.lamp);
  st.bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: '#eaffff', transparent: true, opacity: 0.75, roughness: 0.05, emissive: '#80c8d8', emissiveIntensity: 0.4 }), 160); st.bub.renderOrder = 6; S.add(st.bub);
  const Rf = RNG('form'), rockM = STDm({ map: wrap(rockTex('form', '#8a7656', ['rgba(255,240,210,0.15)', 'rgba(40,30,20,0.3)'], ['rgba(30,20,10,0.5)', 'rgba(220,200,170,0.4)']), 1, 1), flatShading: true, roughness: 0.9 });
  const tites = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 1, 6).rotateX(Math.PI).translate(0, -0.5, 0), rockM, 110); let nt = 0;
  for (let k = 0; k < 46; k++) { const a = Rf.r(0.25, 2.9), r = 0.965, x = CH.x + Math.cos(a) * CH.rx * r, y = CH.y + Math.sin(a) * CH.ry * r, l = Rf.r(0.12, 0.6), w = Rf.r(0.7, 1.6); tites.setMatrixAt(nt++, M4c(x, y + 0.05, -Rf.r(0.15, DEPTH - 0.1), 0, w, l, w)); }
  for (let k = 0; k < 60; k++) { const u = Rf.r(0.12, 0.97), q = tun(u, 0.97), l = Rf.r(0.06, 0.22); tites.setMatrixAt(nt++, M4c(q.x, q.y + 0.03, -Rf.r(0.1, DEPTH - 0.1), 0, 0.7, l, 0.7)); }
  for (; nt < 110; nt++) tites.setMatrixAt(nt, _hid); tites.castShadow = true; S.add(tites);
  const mites = new THREE.InstancedMesh(new THREE.ConeGeometry(0.08, 1, 6).translate(0, 0.5, 0), rockM, 10);
  for (let k = 0; k < 10; k++) { const x = CH.x + Rf.r(1.6, 2.4), l = Rf.r(0.1, 0.45); mites.setMatrixAt(k, M4c(x, LEDGE0 - 0.06,-Rf.r(0.15, 0.95), 0, Rf.r(0.8, 1.6), l, Rf.r(0.8, 1.6))); } mites.castShadow = true; S.add(mites);
  const stones = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.1, 0), rockM, 200); let ns = 0;
  for (let k = 0; k < 70; k++) { const u = Rf.r(0.05, 0.98), q = tun(u, -0.92), s3 = Rf.r(0.5, 1.8); stones.setMatrixAt(ns++, M4c(q.x, q.y, -Rf.r(0.1, DEPTH - 0.1), Rf.r(0, 6), s3, s3 * 0.6, s3)); }
  for (let k = 0; k < 30; k++) { const x = CH.x + Rf.r(-2.0, 1.0), s3 = Rf.r(0.8, 2.4); stones.setMatrixAt(ns++, M4c(x, chamberFloor(x) + 0.05, -Rf.r(0.1, DEPTH - 0.1), Rf.r(0, 6), s3, s3 * 0.6, s3)); }
  for (let k = 0; k < 12; k++) { const x = CH.x + Rf.r(1.6, 2.4), s3 = Rf.r(0.5, 1.4); stones.setMatrixAt(ns++, M4c(x, LEDGE0 + 0.03, -Rf.r(0.1, 1.0), Rf.r(0, 6), s3, s3 * 0.6, s3)); }
  for (let k = 0; k < 80; k++) { const side = k % 2 ? 1 : -1, x = st.mouth[0] + side * Rf.r(1.6, 2.0), z = -Rf.r(1.2, 30), s3 = Rf.r(1.2, 3.5); stones.setMatrixAt(ns++, M4c(x, st.gy(x, z) - 0.05, z, Rf.r(0, 6), s3, s3 * 0.6, s3)); }
  for (; ns < 200; ns++) stones.setMatrixAt(ns, _hid); stones.castShadow = true; stones.receiveShadow = true; S.add(stones);
  // the spring: a thin bright trickle down the chamber's left wall into the pool, with a ring where it lands
  const sx = CH.x - 1.75, sy0 = CH.y + 1.15, trick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, sy0 - WL, 8).translate(0, -(sy0 - WL) / 2, 0), new THREE.MeshStandardMaterial({ color: '#dff8ff', emissive: '#7fd0e8', emissiveIntensity: 0.6, transparent: true, opacity: 0.8 }));
  trick.position.set(sx, sy0, -0.6); S.add(trick); st.spring = trick;
  st.ring = mesh(new THREE.RingGeometry(0.05, 0.09, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xeaffff, transparent: true, opacity: 0.6, depthWrite: false }), sx, WL + 0.005, -0.6); S.add(st.ring);
  // props: the big fish he follows, the speargun found on the floor (~65 m in), spare yellow tanks in the divers' left hands, the stretcher
  const blkP = STDm({ color: '#121316', roughness: 0.55 }), ylP = STDm({ color: '#e6b52a', roughness: 0.4 }), fishM = STDm({ color: '#3e4f3c', roughness: 0.4, metalness: 0.2 });
  st.fish = new THREE.Group(); const fb = mesh(new THREE.SphereGeometry(1, 18, 12).scale(0.36, 0.13, 0.07), fishM, 0, 0, 0); st.fish.add(fb);
  fb.add(mesh(new THREE.SphereGeometry(1, 12, 8).scale(0.3, 0.05, 0.072), STDm({ color: '#b8b090', roughness: 0.5 }), 0, -0.06, 0), mesh(new THREE.SphereGeometry(0.016, 8, 6), blkP, 0.27, 0.03, 0.055), mesh(new THREE.ConeGeometry(0.06, 0.16, 4).scale(1, 1, 0.15), fishM, 0.02, 0.15, 0));
  st.fishTail = new THREE.Group(); st.fishTail.position.x = -0.33; st.fishTail.add(mesh(new THREE.ConeGeometry(0.12, 0.2, 4).scale(1, 1, 0.12).rotateZ(-Math.PI / 2), fishM, -0.08, 0, 0)); st.fish.add(st.fishTail); S.add(st.fish);
  st.gun = new THREE.Group(); st.gun.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.8, 10).rotateZ(Math.PI / 2), blkP, 0, 0, 0), mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 10).rotateZ(Math.PI / 2), ylP, -0.4, 0, 0), mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.05, 10).rotateZ(Math.PI / 2), ylP, 0.4, 0, 0), mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.95, 6).rotateZ(Math.PI / 2), STDm({ color: '#9aa0a6', metalness: 0.5 }), 0.05, 0.022, 0));
  { const q = tun(0.45, -0.88); st.gun.position.set(q.x, q.y + 0.03, -0.45); st.gun.rotation.set(0.3, 0.4, Math.atan2(q.dy, q.dx)); st.gunAt = [q.x, q.y + 0.03, -0.45]; } S.add(st.gun);
  st.spare = ['gust', 'd2'].map((k) => { const g = new THREE.Group(); g.position.set(0.02, -0.12, 0.05); st.cast[k].P.arms[0].hand.add(g);
    [-0.05, 0.07].forEach((dz, i) => g.add(mesh(new THREE.CapsuleGeometry(0.065, 0.42, 6, 14), ylP, 0, -0.18 - i * 0.04, dz), mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 8), STDm({ color: '#9aa0a6', metalness: 0.5 }), 0, 0.09 - i * 0.04, dz))); return g; });
  st.stretcher = new THREE.Group(); st.stretcher.add(mesh(new THREE.BoxGeometry(1.95, 0.04, 0.56), STDm({ color: '#e07a1e', roughness: 0.8 }), 0, 0, 0));
  [-0.3, 0.3].forEach((z) => st.stretcher.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.5, 8).rotateZ(Math.PI / 2), STDm({ color: '#b8bcc0', metalness: 0.5, roughness: 0.4 }), 0, 0.01, z))); S.add(st.stretcher);
  // the ambulance waiting on the track (hospital beat): a white box van with a red stripe and cross, dark windows
  st.amb = new THREE.Group(); const wh = STDm({ color: '#eef0ee', roughness: 0.5 }), rd = STDm({ color: '#c8281e', roughness: 0.6 }), glA = STDm({ color: "#1c2630", roughness: 0.15, metalness: 0.4 });
  st.amb.add(mesh(new THREE.BoxGeometry(2.4, 1.45, 1.35), wh, 0, 0.95, 0), mesh(new THREE.BoxGeometry(0.9, 1.05, 1.3), wh, -1.6, 0.75, 0), mesh(new THREE.BoxGeometry(0.5, 0.45, 1.32), glA, -1.75, 1.0, 0), mesh(new THREE.BoxGeometry(2.42, 0.14, 1.37), rd, 0, 0.62, 0));
  st.amb.add(mesh(new THREE.BoxGeometry(0.42, 0.12, 0.02), rd, 0.2, 1.2, 0.69), mesh(new THREE.BoxGeometry(0.12, 0.42, 0.02), rd, 0.2, 1.2, 0.69));
  [-1.5, 0.8].forEach((x) => [-0.62, 0.62].forEach((z) => st.amb.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 16).rotateX(Math.PI / 2), STDm({ color: '#1a1a1c' }), x, 0.26, z)))); S.add(st.amb);
  return st; }); }
// ---------------------------------------------------------------------
//  JUNGLE — ported from pieces/lluvia/src/world.js (pov3d): mergeG (parts merged into one vertex-coloured geometry, shaded
//  by the normal) and frondG (a crown of arching pinnate fronds). Here: coconut palms, broadleaf canopy trees, tree ferns,
//  banana plants, bushes and ground fronds along the river banks (Oaxaca); misty green ridges behind.
// ---------------------------------------------------------------------
const mergeG = (parts) => { const P = [], N = [], C = []; parts.forEach(([geo, m4, col, shade]) => { const g2 = geo.index ? geo.toNonIndexed() : geo.clone(); g2.applyMatrix4(m4); g2.computeVertexNormals();
    const p = g2.attributes.position, n = g2.attributes.normal, cc = lin(col); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const k = shade ? 0.62 + 0.38 * clamp(n.getY(i) * 0.5 + 0.5) : 1; C.push(cc.r * k, cc.g * k, cc.b * k); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
const frondG = (L, n, droop, col, wd = 0.16, seed = 0, cb0 = '#2a4a20') => { const P = [], C = [], R = RNG('frondL', L * 10 + n + seed); for (let f = 0; f < n; f++) { const a = f / n * TAU + R.r(-0.2, 0.2), Lf = L * R.r(0.8, 1.1), ca = lin(col), cb = lin(cb0), dr = droop * R.r(0.8, 1.2);
    const seg = 10, pts = []; for (let s2 = 0; s2 <= seg; s2++) { const u = s2 / seg, rr = Lf * u, y = 0.35 * Lf * Math.sin(u * 2.2) * 0.4 - dr * u * u * Lf * 0.4; pts.push([Math.cos(a) * rr, y, Math.sin(a) * rr, wd * Lf * Math.sin(Math.PI * Math.min(1, u * 1.2)) * (1 - u * 0.4)]); }
    const px = -Math.sin(a), pz = Math.cos(a); for (let s2 = 0; s2 < seg; s2++) { const [x0, y0, z0, w0] = pts[s2], [x1, y1, z1, w1] = pts[s2 + 1]; for (const side of [-1, 1]) { const A = [x0, y0, z0], B = [x1, y1, z1], Cc = [x1 + px * w1 * side, y1 - w1 * 0.3, z1 + pz * w1 * side], D = [x0 + px * w0 * side, y0 - w0 * 0.3, z0 + pz * w0 * side];
      P.push(...A, ...B, ...Cc, ...A, ...Cc, ...D); const k = s2 / seg; for (let q = 0; q < 6; q++) { const cc = ca.clone().lerp(cb, k * 0.5 + (q > 1 ? 0.15 : 0)); C.push(cc.r, cc.g, cc.b); } } } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; };
// concatenate non-indexed geometries (position, normal, color), the second translated by (x, y, z)
const catG = (gs) => { const P = [], N = [], C = []; gs.forEach(([g, x = 0, y = 0, z = 0]) => { const p = g.attributes.position, n = g.attributes.normal, c = g.attributes.color; for (let i = 0; i < p.count; i++) { P.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z); N.push(n.getX(i), n.getY(i), n.getZ(i)); C.push(c.getX(i), c.getY(i), c.getZ(i)); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; };
function jungle(st, gy, R) { const S = st.scene, mx = st.mouth[0], vegMat = STDm({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
  // a coconut palm: a curved ringed trunk (8 segments) + a drooping frond crown + coconuts; 3 variants
  const palmG = (v) => { const H = 5.6, lean = [0.9, -0.6, 1.5][v], parts = []; let px = 0, py = 0;
    for (let k = 0; k < 9; k++) { const y1 = H * (k + 1) / 9, x1 = lean * (y1 / H) ** 2, dx = x1 - px, dy = y1 - py, L = Math.hypot(dx, dy), r0 = lerp(0.2, 0.12, k / 9), r1 = lerp(0.2, 0.12, (k + 1) / 9);
      parts.push([new THREE.CylinderGeometry(r1, r0 * 1.06, L, 8).translate(0, L / 2, 0), M4c(px, py, 0, 0, 1, 1, 1, 0, -Math.atan2(dx, dy)), k % 2 ? '#7e6c54' : '#8a765a', 0]); px = x1; py = y1; }
    [[0.12, -0.1, 0.06], [-0.1, -0.12, 0.08], [0.02, -0.14, -0.12]].forEach(([a, b, c]) => parts.push([new THREE.SphereGeometry(0.12, 8, 6), M4c(px + a, py + b, c), '#6a5a24', 1]));
    parts.push([new THREE.SphereGeometry(0.24, 8, 6), M4c(px, py, 0, 0, 1, 0.7, 1), '#4a5a28', 1]);
    return catG([[mergeG(parts)], [frondG(2.7, 13, 1.7, '#5a9a30', 0.17, v), px, py + 0.05, 0], [frondG(1.6, 7, 0.4, '#7ab040', 0.15, v + 9), px, py + 0.15, 0]]); };
  // a broadleaf canopy tree (ceiba / fig-like): trunk, two limbs, a cluster of lumpy crowns in mixed greens; 3 variants
  const GR = ['#2f5a22', '#3f7a2a', '#4e8a30', '#2a4a1e', '#5a9236', '#356a26'];
  const broadG = (v) => { const Rv = RNG('broadv', v), H = Rv.r(3.6, 5.2), parts = [[new THREE.CylinderGeometry(0.16, 0.3, H, 8).translate(0, H / 2, 0), M4c(0, 0, 0), '#6a5a48', 0]];
    for (let k = 0; k < 2; k++) parts.push([new THREE.CylinderGeometry(0.06, 0.12, 2, 6).translate(0, 1, 0), M4c(0, H * 0.7, 0, Rv.r(0, 6), 1, 1, 1, 0.7, 0), '#6a5a48', 0]);
    for (let k = 0; k < 7; k++) { const a = Rv.r(0, TAU), r = Rv.r(0.3, 1.6), s3 = Rv.r(1.0, 1.7); parts.push([new THREE.IcosahedronGeometry(1, 1), M4c(Math.cos(a) * r, H + Rv.r(-0.2, 1.3), Math.sin(a) * r, Rv.r(0, 6), s3 * 1.2, s3 * 0.75, s3 * 1.2), Rv.pick(GR), 1]); }
    return mergeG(parts); };
  const fernG = catG([[mergeG([[new THREE.CylinderGeometry(0.12, 0.2, 2.4, 7).translate(0, 1.2, 0), M4c(0, 0, 0), '#4a3a28', 0]])], [frondG(1.8, 12, 0.9, '#5a8a32'), 0, 2.4, 0]]);
  const bananaG = catG([[mergeG([[new THREE.CylinderGeometry(0.09, 0.13, 1.4, 7).translate(0, 0.7, 0), M4c(0, 0, 0), '#6a8a3a', 0]])], [frondG(1.5, 8, 1.1, '#6aaa3c', 0.36, 3, '#3a6a24'), 0, 1.4, 0]]);
  const frondsG = frondG(0.9, 9, 0.6, '#5a9a38', 0.16, 5), bushG = mergeG([0, 1, 2, 3].map((k) => [new THREE.IcosahedronGeometry(0.45, 1), M4c(Math.cos(k * 2.1) * 0.35, 0.3 + 0.12 * k, Math.sin(k * 2.1) * 0.3, k, 1.1, 0.8, 1.1), GR[k], 1]));
  // placements: keep the river channel + the stones clear; lush on the banks (palms, bananas, ferns), canopy behind
  const L = { palm: [[], [], []], broad: [[], [], []], fern: [], banana: [], fronds: [], bush: [] };

  for (let i = 0; i < 6000; i++) { const x = R.r(-36, 36), z = -R.r(0.9, 40), d = Math.abs(x - mx), u = R.f();
    if (d < 2.3) continue; const bank = d < 7;
    if (u < (bank ? 0.014 : 0.008)) { if (z < -9) L.palm[R.i(0, 2)].push([x, z, R.r(0.8, 1.15)]); else if (bank) L.palm[R.i(0, 2)].push([x, z, R.r(0.38, 0.5)]); }
    else if (u < 0.045) { if (z < -8) L.broad[R.i(0, 2)].push([x, z, R.r(0.9, 1.4)]); }
    else if (u < 0.065) L.fern.push([x, z, R.r(0.7, 1.2)]);
    else if (u < (bank ? 0.14 : 0.085) && z > -20) L.banana.push([x, z, R.r(0.7, 1.3)]);
    else if (u < 0.17 && z > -22) L.bush.push([x, z, R.r(0.6, 1.5)]);
    else if (u < 0.3 && z > -16) L.fronds.push([x, z, R.r(0.6, 1.4)]); }
  // a few hero palms right on the banks near the cenote (the reference's palms)
  [[-4.4, -3.4, 0.5, 0], [-10.4, -2.8, 0.46, 2], [-3.6, -7.5, 0.55, 1], [-11.4, -6.6, 0.5, 0]].forEach(([x, z, s, v]) => L.palm[v].push([x, z, s]));
  const add = (geo, list, shadow = true) => { if (!list.length) return; const m = IM(geo, vegMat, list.length, shadow); list.forEach(([x, z, s], k) => m.setMatrixAt(k, M4c(x, gy(x, z) - 0.08, z, RNG('ry', x * 31 + z).r(0, 6), s, s, s))); S.add(m); };
  [0, 1, 2].forEach((v) => { add(palmG(v), L.palm[v]); add(broadG(v), L.broad[v]); });
  add(fernG, L.fern); add(bananaG, L.banana); add(bushG, L.bush); add(frondsG, L.fronds, false);
  // misty ridges behind: five layers of hills, each paler with distance, mist pooling at their feet
  const HZ = lin('#d4e2de'), hm = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
  for (let i = 0; i < 5; i++) { const z = -52 - i * 32, Rh = RNG('ridge', i), ph = [Rh.r(0, 6), Rh.r(0, 6), Rh.r(0, 6)], top = (x) => 5 + i * 5 + (5 + i * 3.5) * (0.55 * Math.sin(x * 0.045 + ph[0]) + 0.3 * Math.sin(x * 0.11 + ph[1]) + 0.15 * Math.sin(x * 0.27 + ph[2]) + 0.5);
    const cT = lin(['#3f6e36', '#5a8656', '#7aa07a', '#9ab89c', '#b4cab6'][i]), p = [], c = [], idx = []; let n = 0;
    for (let x = -260; x <= 260; x += 3) { const y = top(x); p.push(x, y, z, x, -12, z); const a = cT.clone().lerp(HZ, 0.12), b = cT.clone().lerp(HZ, 0.85); c.push(a.r, a.g, a.b, b.r, b.g, b.b); if (n) idx.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n); n++; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.setIndex(idx); S.add(new THREE.Mesh(g, hm)); }
  const mistT = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(232,240,238,0)'); g.addColorStop(0.55, 'rgba(232,240,238,0.75)'); g.addColorStop(1, 'rgba(232,240,238,0.95)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 8, 128);
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(560, 10 + i * 4), new THREE.MeshBasicMaterial({ map: mistT, transparent: true, depthWrite: false, fog: false, opacity: 0.8 })); m.position.set(0, 4 + i * 4.5, -50 - i * 32 + 6); S.add(m); }
}
function torch(F, on) { F.torch.forEach((m) => (m.visible = on)); }
// bubbles from the given heads: [[x, y, rate]] (deterministic)
function bubbles(st, src) { let n = 0; src.forEach(([x, y, rate], i) => { for (let k = 0; k < 24 && n < 160; k++) { const ph = mod(TT * 0.7 + k / 24 + i * 0.37, 1), R = RNG('bub', i * 100 + k);
  if (R.f() > rate) { st.bub.setMatrixAt(n++, _hid); continue; } const s = 0.5 + R.f() * (1 - ph);
  st.bub.setMatrixAt(n++, M4c(x + R.n(0.12) + 0.04 * Math.sin(TT * 4 + k), y + ph * R.r(0.25, 0.5), -DEPTH / 2 + R.n(0.25), 0, s, s, s)); } });
  for (; n < 160; n++) st.bub.setMatrixAt(n, _hid); st.bub.instanceMatrix.needsUpdate = true; }

const CAST = {
  erasto: { suit: '#8c3416', panel: '#17171a', shoe: '#141416', sole: '#202022', hair: '#151210', hairStyle: 'short', skin: '#9a6a46', seed: 21, sleeve: 'long', headS: 0.84, slim: 0.9, tank: 'back', tankC: '#e6b52a', spear: true },
  father: { top: '#c9b48a', bottom: '#4a4436', shoe: '#3a2a1e', sole: '#2a2018', hair: '#3a3430', hairStyle: 'short', skin: '#a87048', seed: 22, sleeve: 'short', headS: 0.86, slim: 0.94 },
  gust: { suit: '#c4c8cc', yoke: '#8e949b', panel: '#1a1b1e', shoe: '#141416', sole: '#1c1c1e', hair: '#c8b48a', hairStyle: 'short', skin: '#f0c8a8', seed: 23, sleeve: 'long', diver: true, headS: 0.84, slim: 0.9, tank: 'side', tankC: '#cfd3d6', helmC: '#202226' },
  p1: { top: '#2f6fa8', bottom: '#3a3a40', shoe: '#2a2018', sole: '#1a1410', hair: '#141210', hairStyle: 'short', skin: '#9a6a46', seed: 25, sleeve: 'short', headS: 0.86, slim: 0.95 },
  p2: { top: '#b04a3a', bottom: '#4a4436', shoe: '#2a2018', sole: '#1a1410', hair: '#1a1410', hairStyle: 'long', skin: '#a87048', seed: 26, sleeve: 'short', headS: 0.86, slim: 0.9 },
  d2: { suit: '#7a3fb0', yoke: '#5a2c86',panel: '#141518', shoe: '#141416', sole: '#1c1c1e', hair: '#3a2a1a', hairStyle: 'short', skin: '#d8a880', seed: 24, sleeve: 'long', diver: true, headS: 0.84, slim: 0.9, tank: 'side', tankC: '#eef0f0', helmC: '#e8e4dc' },
};
// dive kit on a person: tanks (back or two side-mounts) + harness + regulator hose, a mask with a strap, helmet + lamps (divers), fins;
// the spearfisher's kit (speargun in the right hand, mask pushed up on the forehead). gearOn(on, fins) / fish(on) toggle them.
function diveGear(P, o) {
  const met = (c) => STDm({ color: c, roughness: 0.28, metalness: 0.35 }), blk = STDm({ color: '#121316', roughness: 0.55 }), tk = met(o.tankC || '#cfd3d6'), chrome = met('#9aa0a6'), sl = o.slim || 1, hR = P.headR;
  const on = [], fins = [], fish = [], add = (arr, m, par) => (par.add(m), arr.push(m), m);
  const tank = (x, y, z, r, l, rz = 0) => { const t = add(on, mesh(new THREE.CapsuleGeometry(r, l, 6, 16), tk, x, y, z), P.spine); t.rotation.z = rz;
    add(on, mesh(new THREE.CylinderGeometry(r * 0.32, r * 0.32, 0.05, 10), chrome, x - Math.sin(rz) * (l / 2 + r + 0.02), y + l / 2 + r + 0.02, z), P.spine);
    add(on, mesh(new THREE.TorusGeometry(r * 0.35, r * 0.1, 6, 12).rotateX(Math.PI / 2), blk, x - Math.sin(rz) * (l / 2 + r + 0.05), y + l / 2 + r + 0.05, z), P.spine);
    [-0.15, 0.15].forEach((dy) => (add(on, mesh(new THREE.CylinderGeometry(r * 1.04, r * 1.04, 0.025, 16), blk, x - Math.sin(rz) * dy, y + dy, z), P.spine).rotation.z = rz)); };
  if (o.tank === 'side') [-1, 1].forEach((s) => tank(s * 0.255 * sl, 0.1, -0.035, 0.062, 0.5, s * 0.06)); else tank(0, 0.27, -0.2 * sl, 0.07, 0.36);
  // harness: waist belt + chest strap (rings around the torso), two shoulder straps front and back, a buckle
  const ringM = STDm({ color: '#121316', roughness: 0.55, side: THREE.DoubleSide }), ring = (y, rx, rz, w) => add(on, mesh(new THREE.CylinderGeometry(1, 1, w, 28, 1, true).scale(rx, 1, rz), ringM, 0, y, 0), P.spine);
  ring(-0.03, 0.172 * sl + 0.008, 0.118 * sl + 0.008, 0.045); ring(0.29, 0.192 * sl + 0.006, 0.135 * sl + 0.008, 0.03);
  [-1, 1].forEach((s) => [1, -1].forEach((f) => { const b = add(on, mesh(new THREE.BoxGeometry(0.034, 0.5, 0.012), blk, s * 0.075, 0.2, f * (0.128 * sl + 0.006)), P.spine); b.rotation.x = f * -0.06; }));
  add(on, mesh(new THREE.BoxGeometry(0.05, 0.04, 0.02), chrome, 0, -0.03, 0.118 * sl + 0.016), P.spine);
  // mask: an elliptical black frame with a tinted glass and a strap around the head
  const glass = STDm({ color: '#6fb3c8', roughness: 0.05, metalness: 0.5, transparent: true, opacity: 0.45 });
  const mk2 = (arr, y, z, rx) => { const m = new THREE.Group(); m.position.set(0, y, z); m.rotation.x = rx; P.head.add(m); arr.push(m);
    m.add(mesh(new THREE.TorusGeometry(1, 0.16, 8, 28).scale(0.105, 0.05, 0.12), blk, 0, 0, 0), mesh(new THREE.CircleGeometry(1, 28).scale(0.098, 0.044, 1), glass, 0, 0, 0.006), mesh(new THREE.BoxGeometry(0.016, 0.06, 0.03), blk, 0, -0.008, 0.004)); return m; };
  mk2(on, hR * 0.06, hR * 1.1, 0);
  add(on, mesh(new THREE.TorusGeometry(hR * 1.0, 0.007, 6, 32).rotateX(Math.PI / 2).scale(0.95, 1, 1), blk, 0, hR * 0.06, -hR * 0.02), P.head).rotation.x = -0.1;
  // regulator: a mouthpiece and a hose looping from the mouth down to the tank valve (built in head space)
  const vy = (o.tank === 'side' ? 0.1 + 0.25 + 0.062 + 0.05 : 0.27 + 0.18 + 0.07 + 0.05) - 0.5 - 0.04 - hR * 0.95 * P.hS, vx = o.tank === 'side' ? 0.24 * sl : 0.0, vz = o.tank === 'side' ? -0.04 : -0.2 * sl;
  add(on, mesh(new THREE.CylinderGeometry(0.017, 0.02, 0.04, 10).rotateX(Math.PI / 2), blk, 0, -hR * 0.5, hR * 1.02), P.head);
  const hv = (v) => new THREE.Vector3(v[0], v[1], v[2]), hose = new THREE.CatmullRomCurve3([hv([0.02, -hR * 0.52, hR * 1.06]), hv([0.09, -hR * 0.75, hR * 1.0]), hv([0.17, -hR * 1.25, hR * 0.5]), hv([vx + 0.04, vy + 0.06, vz + 0.06]).multiplyScalar(1 / P.hS), hv([vx, vy, vz]).multiplyScalar(1 / P.hS)]);
  add(on, mesh(new THREE.TubeGeometry(hose, 24, 0.011 / P.hS, 6, false), blk, 0, 0, 0), P.head);
  // diver's helmet with two lamps
  if (o.diver) { const hc = STDm({ color: o.helmC || '#202226', roughness: 0.35 }); add(on, mesh(new THREE.SphereGeometry(hR * 1.14, 22, 12, 0, TAU, 0, Math.PI / 2), hc, 0, hR * 0.12, -hR * 0.04), P.head);
    add(on, mesh(new THREE.TorusGeometry(hR * 1.13, hR * 0.06, 6, 28).rotateX(Math.PI / 2), hc, 0, hR * 0.13, -hR * 0.04), P.head);
    [-1, 1].forEach((s) => { const l = add(on, mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.08, 12).rotateX(Math.PI / 2), STDm({ color: '#2a2a2e', metalness: 0.4 }), s * hR * 0.48, hR * 0.72, hR * 0.86), P.head);
      l.add(mesh(new THREE.CircleGeometry(0.02, 12), STDm({ color: '#fff6dc', emissive: '#fff2c8', emissiveIntensity: 1.6 }), 0, 0, 0.041)); }); }
  // fins: a foot pocket and a long blade that widens toward the tip
  const finG = new THREE.ExtrudeGeometry(new THREE.Shape([[-0.055, -0.06], [0.055, -0.06], [0.12, 0.46], [0.0, 0.43], [-0.12, 0.46]].map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.012, bevelEnabled: false }).rotateX(Math.PI / 2);
  P.legs.forEach((L) => { add(fins, mesh(finG, blk, 0, -0.04, 0.06), L.ft); add(fins, mesh(new THREE.BoxGeometry(0.11, 0.06, 0.2), blk, 0, -0.02, 0.05), L.ft); });
  // spearfisher: a speargun forward from the right fist (black barrel, yellow butt and muzzle, steel shaft + tip, rubber band) and the mask up on the forehead
  if (o.spear) { const gp = new THREE.Group(); gp.position.set(0, -0.05, 0.02); P.arms[1].hand.add(gp); fish.push(gp); const yl = STDm({ color: '#e6b52a', roughness: 0.4 });
    gp.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.8, 10).translate(0, -0.4, 0), blk, 0, 0, 0), mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 10), yl, 0, 0.02, 0), mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.05, 10), yl, 0, -0.8, 0));
    gp.add(mesh(new THREE.BoxGeometry(0.03, 0.1, 0.03), blk, 0, -0.04, -0.04), mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.95, 6).translate(0, -0.5, 0), chrome, 0, 0, 0.022), mesh(new THREE.ConeGeometry(0.01, 0.06, 8).rotateX(Math.PI), chrome, 0, -1.0, 0.022));
    gp.add(mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 14).rotateY(Math.PI / 2), STDm({ color: '#2a2a2e' }), 0, -0.76, 0.0));
    mk2(fish, hR * 0.78, hR * 0.72, -0.75); }
  return { gear: [...on, ...fins], gearOn: (v, f = true) => { on.forEach((m) => (m.visible = v)); fins.forEach((m) => (m.visible = v && f)); fish.forEach((m) => (m.visible = false)); }, fish: (v) => fish.forEach((m) => (m.visible = v)) };
}
// standing in the pocket, waist-deep
function standAt(F, x, z, q = {}, y) { F.g.visible = true; F.g.rotation.set(0, 0, 0); F.g.position.set(x, y ?? chamberFloor(x), z); posePerson(F.P, Object.assign({ yaw: 0 }, q)); }
// swimming prone along a heading (dx, dy), hips at (hx, hy); amp = stroke strength, limp = 0..1 unconscious
function swimAt(F, hx, hy, dx, dy, o = {}) {
  F.g.visible = true; const L = Math.hypot(dx, dy); dx /= L; dy /= L;
  const ph = o.ph ?? TT * 5.5, a = o.amp ?? 1, k = o.limp || 0, s = Math.sin(ph) * a, f = Math.sin(ph * 2.1) * a;
  F.g.rotation.set(0, 0, Math.atan2(-dx, dy)); F.g.position.set(hx - dx * 0.92, hy - dy * 0.92, o.z ?? -DEPTH / 2);
  posePerson(F.P, { yaw: -Math.PI / 2, headPitch: lerp(-0.7, 0.25, k), headRoll: 0.3 * k,
    armL: [lerp(2.85 + 0.35 * s, 0.7, k), lerp(0.22, 0.5, k), lerp(0.2 + 0.3 * Math.max(0, s), 0.7, k)],
    armR: [lerp(2.85 - 0.35 * s, 0.5, k), lerp(0.22, 0.4, k), lerp(0.2 + 0.3 * Math.max(0, -s), 0.5, k)],
    legL: [lerp(0.3 * f, 0.12, k), lerp(0.2 + 0.25 * Math.max(0, f), 0.4, k)], legR: [lerp(-0.3 * f, 0.05, k), lerp(0.2 + 0.25 * Math.max(0, -f), 0.3, k)],
    emo: o.emo || { fear: 0.7 * (1 - k), blink: k > 0.5 ? 1 : undefined } });
}
// swim along the passage: u = where the hips are, heading toward the way out (left)
function swimTun(F, u, o = {}) { const p = tun(u, o.v ?? -0.1); swimAt(F, p.x, p.y, -p.dx, -p.dy, o); }
const hide = (F) => (F.g.visible = false);
// project a world point to the frame
function toScreen(st, x, y, z) { const v = new THREE.Vector3(x, y, z).project(st.cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }

