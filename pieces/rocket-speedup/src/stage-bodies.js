// =====================================================================
//  STAGE BODIES (prefix ob) — the things that sweep past the window between the pad and the stars:
//  the Earth's limb and the cloud deck while climbing (added to OU.pad), and in OU.space: Mars, Jupiter, Saturn,
//  Pluto (painted spheres), the Parker Solar Probe and Voyager 1 (small code models), Proxima Centauri (a red star).
//  obAdd() is called once after ouBuild(); obPad(st, alt, cam) and obSpace(st, cam) pose them every frame.
//  Each flyby: [name, t0, t1, tc, radius m, side offset x, y (m), sweep (m per film s)]: closest approach at tc.
// =====================================================================
let OB = null;
function obPlanetTex(kind) {
  const draw = (bump) => (x, w, h) => {
    const R = RNG('pl' + kind);
    const bands = (cols, n, wob) => { for (let i = 0; i < n; i++) { const y0 = i / n * h; x.fillStyle = R.pick(cols); x.globalAlpha = R.r(0.5, 1);
      x.beginPath(); x.moveTo(0, y0); for (let k = 0; k <= 32; k++) x.lineTo(k / 32 * w, y0 + Math.sin(k * 0.9 + i) * wob); x.lineTo(w, y0 + h / n + 2); x.lineTo(0, y0 + h / n + 2); x.fill(); } x.globalAlpha = 1; };
    if (kind === 'mars') {
      x.fillStyle = bump ? '#808080' : '#b4583a'; x.fillRect(0, 0, w, h);
      g3Noise(x, w, h, 30, bump ? 0.2 : 0.35, 'm1', bump ? '255,255,255' : '120,50,30'); g3Noise(x, w, h, 6, bump ? 0.25 : 0.15, 'm2', bump ? '0,0,0' : '230,150,100');
      if (!bump) { for (let k = 0; k < 14; k++) { const px = R.r(0, w), py = R.r(h * 0.3, h * 0.7), r = R.r(40, 160), g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(70,35,28,0.6)'); g.addColorStop(1, 'rgba(70,35,28,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
        x.fillStyle = 'rgba(80,30,22,0.6)'; x.fillRect(w * 0.2, h * 0.52, w * 0.3, 8);   // the great canyon
        x.fillStyle = '#f2efe8'; x.fillRect(0, 0, w, h * 0.05); x.fillRect(0, h * 0.96, w, h * 0.04); }
    } else if (kind === 'jupiter') {
      x.fillStyle = '#d8c3a0'; x.fillRect(0, 0, w, h); bands(['#c99a6a', '#e9dcc4', '#a8794f', '#f2e8d6', '#b98a5e', '#8c6a4c'], 22, 6);
      for (let k = 0; k < 400; k++) { x.fillStyle = `rgba(255,250,240,${R.r(0.05, 0.2)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(6, 30), R.r(2, 5), 0, 0, TAU); x.fill(); }
      x.fillStyle = '#c25a36'; x.beginPath(); x.ellipse(w * 0.6, h * 0.62, 60, 30, 0, 0, TAU); x.fill(); x.strokeStyle = '#f0d8c0'; x.lineWidth = 6; x.stroke();
    } else if (kind === 'saturn') {
      x.fillStyle = '#e0cfa4'; x.fillRect(0, 0, w, h); bands(['#e8d8b0', '#cdb98a', '#d8c497', '#bfa878', '#efe2c0'], 18, 2);
    } else if (kind === 'pluto') {
      x.fillStyle = '#b9876c'; x.fillRect(0, 0, w, h); g3Noise(x, w, h, 24, 0.35, 'p1', '140,90,70'); g3Noise(x, w, h, 6, 0.18, 'p2', '230,200,180');
      const blob = (px, py, rx, ry, c) => { const g = x.createRadialGradient(px, py, 0, px, py, Math.max(rx, ry)); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.translate(px, py); x.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry)); x.translate(-px, -py); x.fillStyle = g; x.fillRect(px - 300, py - 300, 600, 600); x.restore(); };
      blob(w * 0.36, h * 0.6, 170, 60, 'rgba(70,32,26,0.85)'); blob(w * 0.22, h * 0.58, 120, 50, 'rgba(80,38,30,0.7)');   // Cthulhu Macula
      x.fillStyle = 'rgba(248,240,230,0.95)'; x.beginPath();   // Tombaugh Regio, the heart (centred on u = 0.5)
      x.moveTo(w * 0.5, h * 0.74); x.bezierCurveTo(w * 0.42, h * 0.64, w * 0.40, h * 0.42, w * 0.46, h * 0.40); x.bezierCurveTo(w * 0.49, h * 0.39, w * 0.5, h * 0.44, w * 0.5, h * 0.46);
      x.bezierCurveTo(w * 0.51, h * 0.40, w * 0.57, h * 0.37, w * 0.6, h * 0.43); x.bezierCurveTo(w * 0.62, h * 0.52, w * 0.55, h * 0.64, w * 0.5, h * 0.74); x.fill();
      blob(w * 0.49, h * 0.55, 60, 70, 'rgba(255,250,245,0.6)');
      for (let k = 0; k < 160; k++) { x.fillStyle = 'rgba(90,60,50,0.18)'; x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(2, 9), 0, TAU); x.fill(); }
    }
  };
  return g3Tex(draw(false), 1024, 512);
}
function obProbe(kind) {   // code spacecraft at real scale (m)
  const g = new THREE.Group(), M = (c, r = 0.45, m = 0.2) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m });
  const white = M('#eeece6', 0.6, 0), gold = M('#d4a447', 0.28, 0.9), dark = M('#2a2c34', 0.4, 0.5), cell = g3Mat('cells', (x, w, h) => {
    x.fillStyle = '#16224a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8fa0c8'; x.lineWidth = 2; for (let i = 0; i <= w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j <= h; j += 16) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } }, null, { w: 128, h: 128, roughness: 0.2, metalness: 0.7 });
  const add = (geo, mat, p = [0, 0, 0], r = [0, 0, 0]) => { const m = new THREE.Mesh(geo, mat); m.position.set(...p); m.rotation.set(...r); g.add(m); return m; };
  if (kind === 'parker') {   // the white Thermal Protection System disc, a hexagonal bus behind it, two small cooled solar wings, a magnetometer boom
    add(new THREE.CylinderGeometry(1.15, 1.15, 0.11, 48), white, [0, 0, 0], [Math.PI / 2, 0, 0]);
    add(new THREE.TorusGeometry(1.15, 0.03, 8, 48), M('#b8b6ae', 0.5, 0.3), [0, 0, 0]);
    for (const [x, y] of [[0.6, 0.35], [-0.6, 0.35], [0, -0.7]]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6), dark, [x * 0.6, y * 0.6, 0.5], [Math.PI / 2, 0, 0]);   // struts
    add(new THREE.CylinderGeometry(0.62, 0.62, 1.0, 6), gold, [0, 0, 1.1], [Math.PI / 2, 0, 0]);   // hexagonal bus, gold blanket
    add(new THREE.CylinderGeometry(0.64, 0.64, 0.04, 6), dark, [0, 0, 0.6], [Math.PI / 2, 0, 0]);
    for (const sx of [-1, 1]) { add(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), dark, [sx * 0.9, 0, 1.0], [0, 0, Math.PI / 2]); add(new THREE.BoxGeometry(0.75, 0.03, 0.45), cell, [sx * 1.5, 0, 1.0], [0, 0, sx * 0.15]); }
    add(new THREE.CylinderGeometry(0.02, 0.02, 2.6, 6), dark, [0, 0, 2.9], [Math.PI / 2, 0, 0]);   // the magnetometer boom
    add(new THREE.SphereGeometry(0.22, 16, 10), white, [0.25, 0.75, 1.3]);   // high-gain antenna (stowed)
  } else {                   // Voyager: the 3.7 m white dish, the decagonal bus, the RTG boom, the science boom, the 13 m magnetometer boom
    const dish = add(new THREE.SphereGeometry(4.2, 48, 12, 0, TAU, 0, 0.46), M('#f4f2ec', 0.5, 0), [0, -3.7, 0]); dish.material.side = THREE.DoubleSide;
    add(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), dark, [0, 0.9, 0]); add(new THREE.SphereGeometry(0.12, 10, 8), white, [0, 1.4, 0]);   // the feed
    add(new THREE.CylinderGeometry(0.9, 0.9, 0.45, 10), gold, [0, -0.25, 0]);   // the bus
    add(new THREE.BoxGeometry(0.06, 0.06, 2.8), dark, [-0.5, -0.4, 1.6], [0, 0.0, 0]);   // RTG boom
    for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 10), M('#5a5c62', 0.4, 0.6), [-0.5, -0.4, 2.2 + i * 0.55], [Math.PI / 2, 0, 0]);   // the 3 RTGs
    add(new THREE.BoxGeometry(0.06, 0.06, 2.6), dark, [0.6, -0.3, -1.5]);   // science boom
    add(new THREE.BoxGeometry(0.4, 0.35, 0.45), M('#3a3c44', 0.4, 0.5), [0.6, -0.15, -2.8]);   // the scan platform cameras
    add(new THREE.CylinderGeometry(0.015, 0.015, 13, 4), M('#c8c0a8', 0.6, 0.1), [-1.0, -0.4, -6.4], [Math.PI / 2, 0, 0.15]);   // the magnetometer boom
  }
  g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.emissive = o.material.color.clone().multiplyScalar(0.3); } });
  return g;
}
// [name, tc (closest), radius m, side offset x, y (m), speed along the track (m per film s), k]: at tc the body is k*|x| ahead
// (about 35 deg off the nose, sweeping out of the window); earlier it closes in on a cubic so it starts as a dot ~1000 radii away.
// Miss distance = |x| - radius (rings: 2.3 radius) > 0 for every body.
const OB_FLY = [
  ['moon', 133.5, 1737e3, 2.3e6, -0.26e6, 1.4e6, 1.0],
  ['parker', 160, 1.8, 5, -0.6, 6, 1.4],
  ['mars', 194, 3389e3, 6.0e6, 0.8e6, 2.4e6, 1.4],
  ['jupiter', 202.5, 69911e3, 1.6e8, 1.6e7, 5.2e7, 1.4],
  ['saturn', 210.5, 58232e3, 2.2e8, 1.6e7, 6.0e7, 1.4],
  ['pluto', 224, 1188e3, 2.4e6, -0.3e6, 0.9e6, 1.4],
  ['voyager', 242, 6.7, 14, 1.0, 5, 1.4],
  ['proxima', 320, 1.07e8, 4.0e8, 1.0e8, 1.5e8, 1.2],
];
const OB_COL = { moon: '#c8c4bc', mars: '#c0603e', jupiter: '#d8c3a0', saturn: '#e0cfa4', pluto: '#c09078', proxima: '#ff7a4a' };
function obTrack(F, st) {   // camera-relative z of a flyby at story time st, and whether it is still worth drawing
  const [, tc, rad, ox, , sw, k] = F, u = tc - st, A = 1000 * rad / 1331;
  const z = -k * Math.abs(ox) - sw * u - A * Math.pow(Math.max(0, u - 3), 3);
  return { z, on: u < 14 && u > -((k * Math.abs(ox) + 4 * rad) / sw + 1.5) };
}
function obAdd() {
  if (OB) return; const sp = OU.space, pd = OU.pad;
  OB = { fly: {} };
  for (const [name] of OB_FLY) {
    let m;
    if (name === 'parker' || name === 'voyager') m = obProbe(name);
    else if (name === 'proxima') {
      const pTex = g3Tex((x, w, h) => { const R = RNG('prox'); x.fillStyle = '#ff6a32'; x.fillRect(0, 0, w, h);
        for (let k = 0; k < 9000; k++) { const px = R.r(0, w), py = R.r(0, h), r = R.r(2, 7), g = x.createRadialGradient(px, py, 0, px, py, r);   // granulation cells
          g.addColorStop(0, 'rgba(255,190,110,0.55)'); g.addColorStop(0.7, 'rgba(255,120,50,0.2)'); g.addColorStop(1, 'rgba(150,30,10,0.35)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
        for (let k = 0; k < 14; k++) { const px = R.r(0, w), py = R.r(h * 0.25, h * 0.75), r = R.r(10, 30); x.fillStyle = 'rgba(90,15,5,0.55)'; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }   // starspots
        for (let k = 0; k < 6; k++) { const px = R.r(0, w), py = R.r(h * 0.3, h * 0.7), r = R.r(20, 50), g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,250,220,0.95)'); g.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); } }, 1024, 512);
      m = new THREE.Group(); m.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ map: pTex, toneMapped: false })));
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,170,120,1)'], [0.2, 'rgba(255,110,60,0.45)'], [1, 'rgba(255,60,30,0)']], 256), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.setScalar(5.5); m.add(glow);
      const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,255,235,1)'], [0.3, 'rgba(255,210,150,0.5)'], [1, 'rgba(255,150,80,0)']], 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      flare.position.set(-0.55, 0.62, 0.5); flare.scale.setScalar(1.1); m.add(flare); OB.proxFlare = flare;
      const promT = g3Tex((x, w, h) => { x.strokeStyle = 'rgba(255,120,70,0.9)'; x.lineCap = 'round'; for (let i = 0; i < 6; i++) { x.lineWidth = 10 - i; x.globalAlpha = 0.5 - i * 0.06;
        x.beginPath(); x.moveTo(w * 0.15, h * 0.95); x.bezierCurveTo(w * 0.2, h * (0.1 + i * 0.04), w * 0.8, h * (0.1 + i * 0.03), w * 0.85, h * 0.95); x.stroke(); } }, 256, 256);
      const prom = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshBasicMaterial({ map: promT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      const pp = new THREE.Group(); prom.position.y = 1.25; pp.add(prom); pp.rotation.z = 0.6; m.add(pp); OB.proxProm = pp;
      const pb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 16), new THREE.MeshStandardMaterial({ map: obPlanetTex('mars'), roughness: 0.9, emissive: lin('#2a0e08') }));
      pb.position.set(-2.4, -0.5, 1.6); m.add(pb);   // Proxima b (scaled up so it reads), lit by its red sun
      const pbl = new THREE.PointLight(lin('#ff7a4a'), 2.0, 0, 0); m.add(pbl);
    } else {
      m = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({ map: obPlanetTex(name), roughness: 0.9 }));
      if (name === 'saturn') {
        const rg = new THREE.RingGeometry(1.24, 2.3, 128, 1), p = rg.attributes.position, uv = rg.attributes.uv;
        for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (r - 1.24) / 1.06, 0.5); }
        const rt = g3Tex((x, w, h) => { const R = RNG('rings'); for (let i = 0; i < w; i++) { const u = i / w, gap = u > 0.58 && u < 0.63 ? 0.05 : 1; x.fillStyle = `rgba(${210 + R.r(-30, 30)},${190 + R.r(-30, 20)},${150 + R.r(-30, 20)},${(0.35 + 0.6 * R.f()) * gap})`; x.fillRect(i, 0, 1, h); } }, 512, 4);
        const ring = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: rt, transparent: true, side: THREE.DoubleSide, roughness: 0.8, depthWrite: false }));
        ring.rotation.x = Math.PI / 2 - 0.45; m.add(ring);
      }
    }
    m.visible = false; sp.add(m); OB.fly[name] = m;
  }
  { const st2 = g3Radial([[0, 'rgba(255,255,250,1)'], [0.12, 'rgba(255,240,210,0.6)'], [1, 'rgba(255,220,180,0)']], 128); OB.acen = new THREE.Group();
    for (const [x, y, s2] of [[-3.0e9, 0.9e9, 2.6e8], [-2.8e9, 0.98e9, 1.7e8]]) { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: st2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      sp2.position.set(x, y, -5e9); sp2.scale.setScalar(s2); OB.acen.add(sp2); } OB.acen.visible = false; sp.add(OB.acen); }
  // the black hole (teaser only): a black disc, a hot accretion disc, a thin photon ring
  OB.bh = new THREE.Group();
  OB.bh.add(new THREE.Mesh(new THREE.SphereGeometry(6500, 48, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })));
  const dU = { uT: { value: 0 } };
  OB.bhDisk = new THREE.Mesh(new THREE.RingGeometry(8000, 30000, 128, 1), new THREE.ShaderMaterial({ uniforms: dU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uT; varying vec2 vP;
      void main(){ float r = length(vP) / 30000.0, a = atan(vP.y, vP.x);
        float band = 0.6 + 0.4 * sin(a * 9.0 - uT * 6.0 + r * 30.0) * sin(a * 3.0 + uT * 2.0);
        vec3 c = mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.45, 0.1), smoothstep(0.3, 1.0, r));
        float i = smoothstep(0.29, 0.34, r) * (1.0 - smoothstep(0.6, 1.0, r)) * band * (1.2 + 0.8 * cos(a));
        gl_FragColor = vec4(c * i * 1.6, 1.0); }` }));
  OB.bhDisk.rotation.x = 1.25; OB.bh.add(OB.bhDisk);
  const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.5);
    g.addColorStop(0, 'rgba(255,240,220,0)'); g.addColorStop(0.42, 'rgba(255,240,220,0)'); g.addColorStop(0.5, 'rgba(255,245,230,1)'); g.addColorStop(0.62, 'rgba(255,200,150,0.25)'); g.addColorStop(1, 'rgba(255,180,120,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 256, 256),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ring.scale.setScalar(27000); OB.bh.add(ring);
  OB.bh.visible = false; sp.add(OB.bh);
  // the Earth under you once you're high: a sphere with oceans, cloud swirls and a blue rim of air
  const earth = new THREE.Mesh(new THREE.SphereGeometry(6371e3, 200, 120), new THREE.ShaderMaterial({ uniforms: { uSun: { value: OU_SUN_PAD.clone() } },
    vertexShader: `varying vec3 vN, vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(position); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform vec3 uSun; varying vec3 vN, vW;
      float h31(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float vn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y), mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
      float fbm(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 7; i++){ s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      void main(){
        vec3 n = normalize(vN), V = normalize(cameraPosition - vW);
        float land = smoothstep(0.52, 0.56, fbm(n * 9.0));
        vec3 sea = mix(vec3(0.01, 0.05, 0.16), vec3(0.02, 0.12, 0.28), fbm(n * 40.0));
        vec3 ground = mix(vec3(0.10, 0.16, 0.06), vec3(0.32, 0.25, 0.14), fbm(n * 60.0 + 3.0));
        vec3 col = mix(sea, ground, land);
        float cl = smoothstep(0.5, 0.75, fbm(n * 70.0 + vec3(1.3, 0.0, 2.1)) * 0.6 + fbm(n * 14.0) * 0.5);
        col = mix(col, vec3(0.95), cl);
        float dif = clamp(dot(n, uSun), 0.0, 1.0);
        vec3 H = normalize(uSun + V); float glint = pow(clamp(dot(n, H), 0.0, 1.0), 260.0) * (1.0 - land) * (1.0 - cl);
        col = col * (0.08 + 1.1 * dif) + vec3(1.0, 0.9, 0.75) * glint * 2.5;
        float rim = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 3.0); col = mix(col, vec3(0.45, 0.65, 1.0), rim * 0.55);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  const air = new THREE.Mesh(new THREE.SphereGeometry(6371e3 * 1.012, 160, 96), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, fog: false,
    vertexShader: `varying vec3 vN, vV; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `varying vec3 vN, vV; void main(){ float r = 1.0 - abs(dot(vN, vV)); gl_FragColor = vec4(vec3(0.35, 0.6, 1.0) * pow(r, 4.0) * 1.6, 1.0); }` }));
  earth.visible = air.visible = false; pd.add(earth, air); OB.earth = earth; OB.air = air;
  const deckU = { uSun: { value: OU_SUN_PAD.clone() }, uUnder: { value: 0 }, uT: { value: 0 } };
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(400000, 400000, 1, 1), new THREE.ShaderMaterial({ uniforms: deckU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform float uUnder, uT; varying vec3 vW;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++){ s += a * vn(p); p = p * 2.05 + 11.3; a *= 0.5; } return s; }
      void main(){
        vec2 q = vW.xz / 4200.0 + vec2(uT * 0.004, uT * 0.0015); float d = fbm(q) * 0.7 + fbm(q * 2.3 + 9.0) * 0.3, e = fbm(q * 1.7 + 4.0);
        float a = smoothstep(0.28, 0.62, d) * smoothstep(240000.0, 60000.0, length(vW.xz));
        vec3 top = mix(vec3(0.78, 0.82, 0.88), vec3(1.0, 0.99, 0.97), smoothstep(0.4, 0.8, d * 0.6 + e * 0.5));
        vec3 bot = mix(vec3(0.50, 0.54, 0.60), vec3(0.72, 0.75, 0.80), e);
        gl_FragColor = vec4(mix(top, bot, uUnder), a * 0.55);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  deck.rotation.x = -Math.PI / 2; deck.frustumCulled = false; pd.add(deck); OB.deck = deck; OB.deckU = deckU;
  // the cloud deck between 2 and 9 km: flat billows you climb through
  const puff = (seed) => g3Tex((x, w, h) => {   // a cumulus clump: soft overlapping lobes, bright sun-lit top, grey-blue underside, blurred so nothing reads painted
    const R = RNG(seed), c = document.createElement('canvas'); c.width = w; c.height = h; const y = c.getContext('2d'), L = [];
    for (let k = 0; k < 34; k++) { const a = R.r(0, TAU), rr = Math.sqrt(R.f()) * 0.3 * w; L.push([w / 2 + Math.cos(a) * rr * 1.25, h * 0.55 + Math.sin(a) * rr * 0.55 - (1 - Math.abs(Math.cos(a))) * 0.08 * h, R.r(0.07, 0.17) * w]); }
    L.sort((p, q) => q[1] - p[1]);
    for (const [px, py, r] of L) { const t = clamp((py - h * 0.3) / (h * 0.45)), v = Math.round(lerp(255, 170, t)), g = y.createRadialGradient(px - r * 0.3, py - r * 0.4, r * 0.1, px, py, r);
      g.addColorStop(0, `rgba(${v},${v},${v + 4},0.95)`); g.addColorStop(0.7, `rgba(${v - 20},${v - 16},${v - 4},0.8)`); g.addColorStop(1, `rgba(${v - 30},${v - 26},${v - 12},0)`); y.fillStyle = g; y.beginPath(); y.arc(px, py, r, 0, TAU); y.fill(); }
    x.filter = 'blur(5px)'; x.drawImage(c, 0, 0); x.filter = 'none';
    x.globalCompositeOperation = 'destination-in'; const f = x.createRadialGradient(w / 2, h * 0.55, w * 0.2, w / 2, h * 0.55, w * 0.5); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = f; x.fillRect(0, 0, w, h);
  }, 256, 256);
  const ct = [puff('cl1'), puff('cl2'), puff('cl3'), puff('cl4')], RC = RNG('clouds'); OB.clouds = [];
  for (let i = 0; i < 420; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct[i % 4], transparent: true, depthWrite: false, fog: false }));
    const layer = i % 3; s.userData = { x: RC.r(-14000, 14000), y: [5650, 6050, 6450][layer] + RC.r(-120, 120), z: -RC.r(300, 24000), sc: RC.r(700, 1900), layer }; s.visible = false; pd.add(s); OB.clouds.push(s); }
}
function obRock(seed, icy) {   // an irregular rock: a displaced icosphere
  const g = new THREE.IcosahedronGeometry(1, 4), p = g.attributes.position, R = RNG(seed), k = [R.r(1, 3), R.r(1, 3), R.r(1, 3)], ph = [R.r(0, 6), R.r(0, 6), R.r(0, 6)];
  for (let i = 0; i < p.count; i++) { const v = V3(p.getX(i), p.getY(i), p.getZ(i)); const d = 1 + 0.22 * Math.sin(v.x * k[0] + ph[0]) * Math.cos(v.y * k[1] + ph[1]) + 0.12 * Math.sin(v.z * k[2] * 2 + ph[2]); v.multiplyScalar(d); p.setXYZ(i, v.x, v.y * 0.8, v.z); }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: lin(icy ? '#c9d4dc' : '#6e655c'), roughness: icy ? 0.5 : 0.95, emissive: lin(icy ? '#1c242a' : '#141210') }));
}
function obCruiseBuild() {
  const sp = OU.space, R = RNG('cruise');
  OB.rocks = [];
  // the belt (192-199) and the Kuiper belt (226-235): rocks at 40 m .. 4 km, sweeping past
  for (let i = 0; i < 76; i++) { const icy = i >= 60, m = obRock('rock' + i, icy); m.visible = false; sp.add(m);
    const t0 = icy ? R.r(226, 235) : R.r(192, 199.5); OB.rocks.push({ m, tc: t0, x: R.r(-1, 1), y: R.r(-0.5, 0.5), d: Math.pow(R.f(), 2) * 2500 + 60, size: R.r(15, 110) * (icy ? 0.7 : 1), spin: R.r(-0.6, 0.6) }); }
  // a comet (169-180): a nucleus with a coma and a long ion tail pointing away from the Sun
  const cm = new THREE.Group(), nuc = obRock('comet', true); nuc.scale.setScalar(900); cm.add(nuc);
  const coma = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(220,240,255,0.9)'], [0.25, 'rgba(160,210,255,0.35)'], [1, 'rgba(120,180,255,0)']], 256), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  coma.scale.setScalar(26000); cm.add(coma);
  const tailT = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(170,215,255,0.75)'); g.addColorStop(1, 'rgba(120,170,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'destination-in'; const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = v; x.fillRect(0, 0, w, h); }, 512, 64);
  for (let k = 0; k < 2; k++) { const tl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tailT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, color: lin(k ? '#fff3dc' : '#bfe0ff') }));
    tl.scale.set(k ? 180000 : 320000, k ? 30000 : 16000, 1); tl.position.x = (k ? 90000 : 160000); tl.rotation.z = k ? -0.12 : 0; cm.add(tl); }
  cm.visible = false; sp.add(cm); OB.comet = cm;
  // dust streaks: short bright lines rushing past the window (more, longer and bluer as you speed up)
  const NS = 360, sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 6), 3)); sg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NS * 6), 3));
  OB.streaks = new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  OB.streaks.frustumCulled = false; sp.add(OB.streaks); OB.NS = NS;
}
function obCruise(st) {
  if (!OB.rocks) obCruiseBuild();
  for (const r of OB.rocks) { const on = st > r.tc - 6 && st < r.tc + 2; r.m.visible = on; if (!on) continue;
    const z = -(r.tc - st) * r.d * 1.6 - 20; r.m.position.set(Math.sign(r.x || 1) * (Math.abs(r.x) * r.d * 0.32 + 2.2 * r.size + 30), r.y * r.d * 0.22, z); r.m.scale.setScalar(r.size); r.m.rotation.set(st * r.spin, st * r.spin * 0.7, 0.3); }
  const con = st > 166 && st < 182; OB.comet.visible = con;
  if (con) { OB.comet.position.set(-1.05e6, 0.35e6, -5.2e6 + (st - 166) * 1.6e5); OB.comet.rotation.set(0, 0.5, 0.25); OB.comet.scale.setScalar(22); }
  // the streaks: each one a deterministic particle, z cycling through the near field
  const P = OB.streaks.geometry.attributes.position, Cc = OB.streaks.geometry.attributes.color, R = RNG('streaks');
  const te = TEASER(), dens = te ? 1 : st < 140 || st > 458 ? 0 : st > 326 ? 0.55 * ss(330, 344, st) * (1 - ss(450, 458, st)) : clamp((st - 140) / 40) * (0.35 + 0.65 * ss(250, 320, st)), len = te ? 60 : st > 326 ? 22 : lerp(1.5, 9, ss(150, 320, st)), blue = st > 250 ? 1 : 0;
  for (let i = 0; i < OB.NS; i++) {
    const on = R.f() < dens, x = R.r(-30, 30), y = R.r(-14, 16), sp2 = R.r(40, 110), ph = R.f(), z = -120 + ((st * sp2 / 10 + ph * 125) % 125);
    const zz = on && Math.abs(x) > 2.5 ? z : 1e7;
    P.setXYZ(i * 2, x, y, zz); P.setXYZ(i * 2 + 1, x, y, zz + len * (0.6 + 0.4 * ph));
    const b = 0.25 + 0.5 * R.f(); Cc.setXYZ(i * 2, b * (0.8 - 0.3 * blue), b * (0.85 - 0.1 * blue), b); Cc.setXYZ(i * 2 + 1, 0, 0, 0);
  }
  P.needsUpdate = true; Cc.needsUpdate = true;
}
function obPad(st, alt, cam) {
  obAdd();
  const hi = alt > 12000;
  OU.ground.visible = !hi; OB.earth.visible = OB.air.visible = hi;
  OU.pad.children.forEach((c) => { if (c.isInstancedMesh || c.isLineSegments || (c.isMesh && c !== OU.sky && c !== OU.ground && c !== OB.earth && c !== OB.air && !c.isSprite)) { if (hi) c.visible = false; } });
  if (hi) { OB.earth.position.set(0, -6371e3 - alt, 0); OB.air.position.copy(OB.earth.position); OB.earth.rotation.set(0.2, st * 0.01, 0); cam.near = 50; cam.far = 3e7; cam.updateProjectionMatrix(); }
  const DECK = 6000; OB.deck.position.y = OU.PAD_Y + DECK - alt; OB.deck.visible = alt > 200 && alt < 120000; OB.deckU.uUnder.value = alt < DECK ? 1 : 0; OB.deckU.uT.value = st;
  for (const s of OB.clouds) { const o = s.userData; s.visible = alt > 300 && alt < 60000; s.position.set(o.x + st * (8 + 4 * o.layer), OU.PAD_Y + o.y - alt, o.z); s.scale.set(o.sc * 1.5, o.sc * 0.8, 1); s.material.opacity = 0.92; }
  // inside the deck: everything outside goes white
  OB.white = Math.max(0, 1 - Math.abs(alt - DECK - 150) / 420);
  OU.pad.fog.color.set(OB.white > 0 ? '#e4e8ee' : '#c4d3df'); if (OB.white > 0) OU.pad.fog.density = Math.max(OU.pad.fog.density, 0.004 * OB.white);
}
function obSpace(st, cam) {
  obAdd(); obCruise(st);
  for (const F of OB_FLY) {
    const [name, tc, rad, ox, oy] = F, m = name === 'moon' ? OU.moon : OB.fly[name], T = obTrack(F, st); m.visible = T.on; if (!T.on) continue;
    m.position.set(ox, oy, T.z); if (name !== 'moon') m.scale.setScalar(name === 'parker' || name === 'voyager' ? 1.6 : rad);
    m.rotation.set(0.25, st * 0.004 + 1.3, 0.1);
    if (name === 'moon') m.rotation.set(0.3, 1.2 + st * 0.002, 0.1);
    if (name === 'pluto') m.rotation.set(0.15, -2.8 + (st - 221) * 0.004, 0);
    if (name === 'voyager') m.rotation.set(-1.05, 0.5 + st * 0.01, 0.3);
    if (name === 'parker') m.rotation.set(0.35, 2.2 + st * 0.02, 0.15);
    if (name === 'proxima' && OB.proxFlare) { OB.proxFlare.material.opacity = 0.55 + 0.45 * Math.sin(st * 1.7) * Math.sin(st * 0.6); OB.proxProm.rotation.z = 0.6 + 0.05 * Math.sin(st * 0.8); }
  }
  // Alpha Centauri A and B: two bright stars near Proxima's part of the sky
  if (OB.acen) { const on = st > 304 && st < 326; OB.acen.visible = on; }
  // the teaser: a black hole lensing the starfield ahead-left, rocks hurtling past
  if (OB.bh) { const te = TEASER(); OB.bh.visible = te; if (te) { OB.bh.position.set(-0.30e5, 0.06e5, -1e5); OB.bh.rotation.set(0.35, 0, -0.25 + TT * 0.02); OB.bhDisk.material.uniforms.uT.value = TT; } }
}
