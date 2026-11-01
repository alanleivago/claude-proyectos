// =====================================================================
//  CAVE — the cutaway. The rock is a slab sliced open along the sump: the front face (dark mottled blue-grey rock with
//  the passage cut out), the cut walls going back DEPTH, the back wall (sandstone above the water, blue with caustics
//  below), the water (a tinted sheet in front + the surface planes), an ochre mineral rim along the cut, the guide rope,
//  and the four. World units are metres; x runs from the way out (left) to the air pocket (right), y is up, z to camera.
// =====================================================================
const WL = 0.4, DEPTH = 1.1, UE = 0.035, CBB = { x0: -9, x1: 7, y0: -2, y1: 4.5 };
const CAVE_CL = [[-8.5, 3.0], [-5.8, 2.1], [-3.7, 1.05], [-2.35, 0.1], [-1.3, -0.6], [0, -0.85], [1.2, -0.6], [2.1, 0.0], [2.6, 0.3]];
const CH = { x: 3.9, y: 1.0, rx: 1.8, ry: 1.35 };
const caveCurve = new THREE.CatmullRomCurve3(CAVE_CL.map(([x, y]) => new THREE.Vector3(x, y, 0)));
const caveHW = (u) => lerp(0.85, 0.46, ss(0.45, 0.62, u)) + 0.035 * Math.sin(u * 37) + 0.02 * Math.sin(u * 91 + 1);
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
  const fill = new THREE.DirectionalLight(0xbfd8ff, 0.6); fill.position.set(6, -2, 8); st.scene.add(fill);
  const OUT = caveOutline(), S = st.scene;
  // front face: a huge slab with the passage cut out
  // the hillside: the slab's top edge is the ground; the gallery opens onto it at the cave mouth
  const A = OUT[0], Bm = OUT[OUT.length - 1], bump = (x) => 0.3 * Math.sin(x * 0.7) + 0.15 * Math.sin(x * 2.1 + 1);
  const surf = (x) => (x >= A[0] ? A[1] + (x - A[0]) * 0.32 + bump(x) - bump(A[0]) : x <= Bm[0] ? Bm[1] + (x - Bm[0]) * 0.22 + bump(x) - bump(Bm[0]) : lerp(Bm[1], A[1], (x - Bm[0]) / (A[0] - Bm[0])));
  st.surf = surf; st.mouth = [(A[0] + Bm[0]) / 2, (A[1] + Bm[1]) / 2];
  const ctr = [[-60, -40], [60, -40]]; for (let x = 60; x > A[0] + 0.01; x -= 0.25) ctr.push([x, surf(x)]);
  OUT.forEach((q) => ctr.push(q)); for (let x = Bm[0] - 0.25; x >= -60; x -= 0.25) ctr.push([x, surf(x)]);
  const shape = new THREE.Shape(ctr.map(([x, y]) => new THREE.Vector2(x, y)));
  // the ground going back from the cut (dark scrub under the night), shrubs, sky and stars, a grass lip along the cut edge
  const NX = 240, NZ = 30, tp = [], tc = [], ti = [], Rg = RNG('terrain'), gy = (x, z) => surf(x) + (-z) * 0.12 + 0.25 * Math.sin(x * 1.3 + z * 0.9) * Math.min(1, -z);
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const x = -40 + 80 * i / NX, z = -45 * (j / NZ) ** 1.4, c = lin('#3a3a26').lerp(lin('#5a5034'), 0.5 + 0.5 * Math.sin(x * 3.1 + z * 2.3));
    tp.push(x, gy(x, z) - (Math.abs(x - st.mouth[0]) < 0.9 && z > -0.9 ? 1.2 : 0), z); tc.push(c.r, c.g, c.b); }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i; ti.push(a, a + 1, a + NX + 1, a + 1, a + NX + 2, a + NX + 1); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); tg.setAttribute('color', new THREE.Float32BufferAttribute(tc, 3)); tg.setIndex(ti); tg.computeVertexNormals();
  const terr = new THREE.Mesh(tg, STDm({ vertexColors: true, roughness: 1 })); terr.receiveShadow = true; S.add(terr); st.gy = gy;
  const shrubs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.35, 1), STDm({ color: '#4a5a2a', roughness: 1, flatShading: true }), 160);
  for (let k = 0; k < 160; k++) { const x = Rg.r(-30, 30), z = -Rg.r(0.6, 30), s2 = Rg.r(0.5, 1.6); shrubs.setMatrixAt(k, Math.abs(x - st.mouth[0]) < 2 && z > -3 ? _hid : M4c(x, gy(x, z) + 0.1, z, Rg.r(0, 6), s2, s2 * 0.7, s2)); }
  S.add(shrubs);
  S.background = lin('#070b14');
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: lin('#060a16') }, hor: { value: lin('#1c2a4a') } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top, hor; varying vec3 vD; void main(){ float h = clamp(normalize(vD).y, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h, 0.5)), 1.0);\n#include <encodings_fragment>\n}' }));
  sky.renderOrder = -2; S.add(sky);
  const sp = [], Rs = RNG('stars'); for (let k = 0; k < 900; k++) { const az = Rs.r(-1.4, 1.4), el = Rs.r(0.08, 1.2); sp.push(Math.sin(az) * Math.cos(el) * 800, Math.sin(el) * 800, -Math.cos(az) * Math.cos(el) * 800); }
  S.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)), new THREE.PointsMaterial({ color: 0xdfe8ff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false })));
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
    speck(x, BBW, BBH, 30000, ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.2)'], R, 1, 3); }, BBW, BBH);
  const hole = new THREE.Shape(OUT.map(([x, y]) => new THREE.Vector2(x, y)));
  const back = new THREE.Mesh(bbUV(new THREE.ShapeGeometry(hole)), STDm({ map: bT, bumpMap: bT, bumpScale: 0.03, roughness: 0.9 })); back.position.z = -DEPTH; back.receiveShadow = true; S.add(back);
  // water: a tinted sheet just behind the face (clear above the line), with a bright meniscus
  const sT = g3Tex((x) => { const R = RNG('sheet'), yw = bbY(WL); x.clearRect(0, 0, BBW, BBH);
    const g = x.createLinearGradient(0, yw, 0, BBH); g.addColorStop(0, 'rgba(90,215,235,0.30)'); g.addColorStop(1, 'rgba(30,120,160,0.48)'); x.fillStyle = g; x.fillRect(0, yw, BBW, BBH - yw);
    for (let k = 0; k < 500; k++) { x.strokeStyle = `rgba(225,252,255,${R.r(0.04, 0.12)})`; x.lineWidth = R.r(1, 3); x.beginPath(); const px = R.r(0, BBW), py = R.r(yw + 4, BBH), l = R.r(30, 90); x.moveTo(px, py); x.quadraticCurveTo(px + l / 2, py + R.n(6), px + l, py); x.stroke(); }
    x.fillStyle = 'rgba(235,253,255,0.85)'; x.fillRect(0, yw - 2, BBW, 4); }, BBW, BBH);
  const sheet = new THREE.Mesh(bbUV(new THREE.ShapeGeometry(hole)), new THREE.MeshBasicMaterial({ map: sT, transparent: true, depthWrite: false })); sheet.position.z = -0.04; sheet.renderOrder = 5; S.add(sheet);
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
  // the guide rope: anchored on the pocket wall, along the ceiling of the passage, up to the gallery
  const rp = [new THREE.Vector3(3.0, 1.55, -0.35), new THREE.Vector3(2.55, 0.75, -0.4)];
  for (let i = 0; i <= 40; i++) { const u = lerp(0.97, 0.5, i / 40), q = tun(u, 0.62); rp.push(new THREE.Vector3(q.x, q.y, -0.4)); }
  const ea = tun(0.47, 0.92); rp.push(new THREE.Vector3(ea.x, ea.y, -0.35));
  st.ropePts = rp; st.rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp), 200, 0.022, 6, false), STDm({ color: '#e6d6ae', roughness: 0.8 })); st.rope.castShadow = true; S.add(st.rope);
  [rp[0], rp[rp.length - 1]].forEach((p) => S.add(mesh(new THREE.SphereGeometry(0.06, 14, 10), STDm({ color: '#9aa0a6', metalness: 0.6, roughness: 0.35 }), p.x, p.y, p.z)));
  // the four
  st.four = FOUR.map((o) => { const P = makePerson(Object.assign({ shorts: true, sleeve: 'short' }, o)), g = new THREE.Group(); g.add(P.root); S.add(g); return { P, g }; });
  st.fifth = (() => { const P = makePerson({ top: '#8a8f96', bottom: '#33363c', hair: '#4a3020', hairStyle: 'short', skin: '#e8bb94', seed: 15, sleeve: 'long' }), g = new THREE.Group(); g.add(P.root); S.add(g); return { P, g }; })();
  // torches: a lens + a soft additive beam in the right hand
  const beamT = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.6, 'rgba(255,240,200,0.25)'); g.addColorStop(1, 'rgba(255,245,220,0.9)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 8, 128);
  st.four.concat([st.fifth]).forEach((F) => { const hd = F.P.arms[1].hand, beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.2, 20, 1, true).translate(0, -1.6, 0), new THREE.MeshBasicMaterial({ map: beamT, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    beam.position.y = -0.1; beam.renderOrder = 7; hd.add(beam); const body = mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 10), STDm({ color: '#2a2a2e', metalness: 0.5 }), 0, -0.06, 0.02); hd.add(body);
    const lens = mesh(new THREE.CircleGeometry(0.03, 12).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff6dc }), 0, -0.141, 0.02); hd.add(lens); F.torch = [beam, body, lens]; torch(F, false); });
  st.lamp = new THREE.PointLight(0xffe8c0, 0, 6, 1.5); S.add(st.lamp);
  st.bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: '#eaffff', transparent: true, opacity: 0.75, roughness: 0.05, emissive: '#80c8d8', emissiveIntensity: 0.4 }), 160); st.bub.renderOrder = 6; S.add(st.bub);
  // the concrete plug that seals the mouth
  const plug = []; for (let u = 0.08; u <= 0.17; u += 0.005) { const q = tun(u, 1.05); plug.push([q.x, q.y]); } for (let u = 0.17; u >= 0.08; u -= 0.005) { const q = tun(u, -1.05); plug.push([q.x, q.y]); }
  const cT = wrap(rockTex('concrete', '#8e8e88', ['rgba(255,255,255,0.15)', 'rgba(0,0,0,0.18)'], ['rgba(60,60,58,0.6)', 'rgba(200,200,195,0.5)']), 0.5, 0.5);
  st.plug = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(plug.map(([x, y]) => new THREE.Vector2(x, y))), { depth: DEPTH, bevelEnabled: false }), STDm({ map: cT, bumpMap: cT, bumpScale: 0.04, roughness: 0.95, clippingPlanes: [st.plugClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)] }));
  r3().r.localClippingEnabled = true; st.plug.position.z = -DEPTH; st.plug.visible = false; st.plug.castShadow = true; S.add(st.plug);
  return st; }); }
function torch(F, on) { F.torch.forEach((m) => (m.visible = on)); }
// bubbles from the given heads: [[x, y, rate]] (deterministic)
function bubbles(st, src) { let n = 0; src.forEach(([x, y, rate], i) => { for (let k = 0; k < 24 && n < 160; k++) { const ph = mod(TT * 0.7 + k / 24 + i * 0.37, 1), R = RNG('bub', i * 100 + k);
  if (R.f() > rate) { st.bub.setMatrixAt(n++, _hid); continue; } const s = 0.5 + R.f() * (1 - ph);
  st.bub.setMatrixAt(n++, M4c(x + R.n(0.12) + 0.04 * Math.sin(TT * 4 + k), y + ph * R.r(0.25, 0.5), -DEPTH / 2 + R.n(0.25), 0, s, s, s)); } });
  for (; n < 160; n++) st.bub.setMatrixAt(n, _hid); st.bub.instanceMatrix.needsUpdate = true; }

const FOUR = [
  { top: '#d9483a', bottom: '#2a2a33', female: true, hair: '#3a2418', hairStyle: 'pony', skin: '#f1c9a5', seed: 11 },
  { top: '#7b4fc9', bottom: '#1f2d3d', female: true, hair: '#c9a060', hairStyle: 'long', skin: '#e8bb94', seed: 12 },
  { top: '#2a9d8f', bottom: '#3a3a3a', hair: '#2a1d16', hairStyle: 'short', skin: '#d9a47c', seed: 13 },
  { top: '#2f6fd1', bottom: '#2b2b2b', hair: '#1a1a1a', hairStyle: 'short', skin: '#f3d2b5', seed: 14 },
];
// standing in the pocket, waist-deep
function standAt(F, x, z, q = {}) { F.g.visible = true; F.g.rotation.set(0, 0, 0); F.g.position.set(x, chamberFloor(x), z); posePerson(F.P, Object.assign({ yaw: 0 }, q)); }
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

