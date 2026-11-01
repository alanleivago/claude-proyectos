// =====================================================================
//  SET out — outdoors in the Netherlands. s03 + s04 (one long take): an aerial over flat tulip-stripe fields, a
//  windmill and a canal, gliding toward and over the endless roof of the flower-auction building (tiny trucks along
//  it). s29: inside a glass greenhouse at sunrise, the grower in her pink smock snips a red rose.
//  Registers SHOT_FN[id]. Prefixes out / grn.
// =====================================================================
const OUT = {};
function outTexFields() { const t = tex((x, w, h) => { const C = ['#e8202e', '#ffd21a', '#ff6ab8', '#8a3ad8', '#ff8a1a', '#ffffff', '#e8202e', '#ffd21a'];
  x.fillStyle = '#5ab84a'; x.fillRect(0, 0, w, h); const n = 24;
  for (let i = 0; i < n; i++) { const R = RNG('fld', i), y0 = i * h / n, c = (i % 4 === 3) ? '#4aa83a' : C[R.i(0, C.length)];
    x.fillStyle = '#3a8a2a'; x.fillRect(0, y0, w, h / n);   // green leaves between the rows
    for (let r = 0; r < 5; r++) { x.fillStyle = c; x.fillRect(0, y0 + 3 + r * (h / n - 6) / 5, w, (h / n - 6) / 5 - 3); }   // 5 rows of blooms per stripe
    x.fillStyle = 'rgba(255,255,255,0.25)'; for (let k = 0; k < 90; k++) x.fillRect(R.r(0, w), y0 + R.r(2, h / n - 2), 3, 2);
    }
  }, 1024, 1024);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.anisotropy = 8; return t; }
function outTexFront() { const t = tex((x, w, h) => { x.fillStyle = '#e8ecf2'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff6a1a'; x.fillRect(0, 0, w, h * 0.12);
  for (let i = 0; i < 4; i++) { x.fillStyle = '#5a6a7a'; x.fillRect(i * w / 4 + w / 16, h * 0.5, w / 8, h * 0.5); } }, 512, 256);
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(14, 1); return t; }
function outTexRoof() { const t = tex((x, w, h) => { x.fillStyle = '#e6ecf2'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) { x.fillStyle = '#d6dee8'; x.fillRect(0, i * h / 4 + h / 8, w, h / 16); } }, 256, 256);   // low contrast: the screen-space ink never turns it into stripes
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t; }
function outWindmill() { const g = new THREE.Group(), body = c3Prop('#8a4a2a', { rough: 0.7 });
  g.add(cyl(2.2, 4.2, 14, body, 0, 7, 0, 0.05, 8)); g.add(cyl(0.2, 2.6, 3.6, c3Prop('#3a2a2a'), 0, 15.8, 0, 0.05, 8));
  g.add(rb(4.8, 0.5, 4.8, c3Prop('#ffffff'), 0, 4.5, 0, 0.03));
  const hub = new THREE.Group(); hub.position.set(0, 14.6, 3.2); g.add(hub); g.userData.hub = hub;
  for (let i = 0; i < 4; i++) { const b = new THREE.Group(); b.rotation.z = i * Math.PI / 2; hub.add(b); b.add(rb(0.35, 11, 0.25, c3Prop('#f4ead8'), 0, 5.6, 0, 0.02)); b.add(rb(1.8, 8, 0.12, c3Prop('#e8402a', { rough: 0.8 }), 0.9, 6.6, 0.1, 0.02)); }
  return g; }
function outBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 1, 6000), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffffff', ambI: 0.55, sky: '#cfe8ff', ground: '#4a6a3a', key: '#fff2d8', keyI: 1.15, keyP: [300, 500, 200], rim: '#ffd8a0', rimI: 0.4, rimP: [-300, 200, -300] });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(4000, 48, 24), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'day', seed: 52, band: [0.36, 0.48], clouds: 46, scale: 1.1, midAt: 0.42, sun: [0.3, 0.3, 30], pal: { mid: '#6aaaf0', hor: '#a8d4f4' } }), side: THREE.BackSide })));
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), c3Prop('#ffffff', { map: outTexFields(), rough: 0.9 })); gr.rotation.x = -Math.PI / 2; scene.add(gr);
  // a canal and a road leading to the building
  const can = new THREE.Mesh(new THREE.PlaneGeometry(14, 2400), c3Prop('#3a8ae8', { rough: 0.15, env: 1.4 })); can.rotation.x = -Math.PI / 2; can.position.set(-60, 0.4, 0); scene.add(can);
  for (const sx of [-1, 1]) scene.add(rb(3, 1.2, 2400, c3Prop('#8a6a4a', { rough: 0.9 }), -60 + sx * 8.5, 0.6, 0, 0.1));
  for (let i = 0; i < 6; i++) { const b = new THREE.Group(); b.position.set(-60 + (i % 2 ? 2.5 : -2.5), 0.8, 150 - i * 90); scene.add(b); b.add(rb(3, 1.2, 9, c3Prop(['#e8483a', '#3a8ee8', '#ffcc1a'][i % 3]), 0, 0.3, 0, 0.08)); b.add(rb(2.4, 1.6, 3, c3Prop('#ffffff'), 0, 1.4, -1, 0.06)); }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 1400), c3Prop('#5a5f6a', { rough: 0.8 })); road.rotation.x = -Math.PI / 2; road.position.set(40, 0.3, -300); scene.add(road);
  // the giant hall: a huge low box with a saw-tooth glass roof, loading docks with trucks all along its front
  s.hall = new THREE.Group(); s.hall.position.set(0, 0, -560); scene.add(s.hall);
  s.hall.add(rb(900, 26, 420, c3Prop('#e8ecf2', { rough: 0.6 }), 0, 13, 0, 0.3));
  s.hall.add(pl(900, 26, c3Prop('#ffffff', { map: outTexFront(), rough: 0.6 }), 0, 13, 210.6));   // loading docks along the front
  // saw-tooth skylight ridges across the whole roof (glass faces catch the sky), roof vents
  const glass = c3Prop('#7ab8f0', { rough: 0.1, env: 1.6, metal: 0.2 }), ridgeM = c3Prop('#f4f6fa', { rough: 0.5 });
  for (let i = 0; i < 4; i++) { const z = -150 + i * 100; s.hall.add(rb(860, 4, 30, c3Prop('#9ac8f0', { rough: 0.2, env: 1.2 }), 0, 28, z, 0)); }   // four glass roof lanterns, no ink (it aliased at this distance)
  { const sol = c3Prop('#2a4a8a', { rough: 0.25, env: 1.3, metal: 0.3 }), unit = c3Prop('#c8ced8', { rough: 0.5 }), fan = c3Toon('#4a505a');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const p = rb(110, 0.5, 26, sol, -330 + c * 130, 27, -100 + r * 100, 0); p.rotation.x = -0.25; s.hall.add(p); }   // solar panel fields between the lanterns
    for (let i = 0; i < 24; i++) { const R = RNG('hvac', i), u = c3Mesh(c3RBox(12, 5, 8, 1.2), unit, 0); u.position.set(R.r(-420, 420), 28.6, R.r(-200, 200)); s.hall.add(u);
      for (const dx of [-3, 3]) { const f = cyl(2.2, 2.2, 0.6, fan, dx, 2.7, 0, 0, 16); u.add(f); } } }
  for (let i = 0; i < 30; i++) { const R = RNG('vent', i); s.hall.add(rb(6, 3, 6, c3Prop('#b8c0cc', { metal: 0.5 }), R.r(-430, 430), 27.5, R.r(-190, 190), 0.1)); }
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(900, 420), c3Prop('#ffffff', { map: outTexRoof(), rough: 0.4, env: 1.0 })); roof.rotation.x = -Math.PI / 2; roof.position.y = 26.2; s.hall.add(roof);
  s.hall.add(rb(300, 10, 3, c3Prop('#ff6a1a', { rough: 0.6 }), 0, 20, 211, 0.3));
  for (let i = 0; i < 26; i++) { const R = RNG('truck', i), tr = new THREE.Group(); tr.position.set(-400 + i * 32 + R.r(-4, 4), 0, 232); s.hall.add(tr);
    { const body = c3Mesh(c3RBox(5, 6, 16, 2.3), c3Prop(['#ffffff', '#e8483a', '#3a8ee8', '#ffcc1a'][i % 4], { rough: 0.5 }), 0.12); body.position.set(0, 4, 0); tr.add(body);
      const cab = c3Mesh(c3RBox(5, 5, 4.4, 2.2), c3Prop('#2a3a5a'), 0.1); cab.position.set(0, 3.4, 10.5); tr.add(cab); } }   // rounded cartoon trucks
  // windmills, farm houses, poplar rows (c3Tree), little boats on the canal
  s.mills = [[-24, -40], [-150, -60], [60, -120], [-230, -220]].map(([x, z], i) => { const m = outWindmill(); m.scale.setScalar(i ? 2.2 : 1.9); m.position.set(x, 0, z); m.rotation.y = 0.3; scene.add(m); return m; });
  for (let i = 0; i < 6; i++) { const R = RNG('farm', i), b = c3Building({ w: 7, h: 5, d: 6, floors: 1, cols: 2, wall: 'brick', color: '#a8402a', trim: '#ffffff', roof: 'gable', roofH: 4, roofColor: '#3a3a40', door: '#2a6a3a', lit: 0, chimney: true, seed: 900 + i, ink: 0.04 });
    b.scale.setScalar(3.4); b.position.set(R.r(-300, 300), 0, R.r(-60, 300)); b.rotation.y = R.r(0, 6); scene.add(b); }
  for (let i = 0; i < 40; i++) { const t = c3Tree(1, '#4a9a3a', 50 + i); t.scale.set(3, 5, 3); t.position.set(-80 + (i % 2) * 40, 0, 200 - i * 16); scene.add(t); }
  c3Env(scene, { top: '#cfe8ff', mid: '#a8d0a0', bot: '#3a5a2a' });
  c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const outGet = () => OUT.s ||= outBuild();
function outWorld(s, t) { s.mills.forEach((m, i) => { m.userData.hub.rotation.z = -t * 0.9 - i; }); }
// =====================================================================
//  s03 / s04 — "You're a flower buyer in the Netherlands, sitting in one of the biggest buildings on the planet,":
//  a windmill turning in the foreground over striped tulip fields, the building low on the horizon; s04 glides on
//  up and over its endless roof (it runs out of both sides of the frame), trucks tiny along the docks
// =====================================================================
const OUT_K03 = [[0, [-10, 45, 175], [-40, 25, 60], 46], [1.72, [-30, 70, 130], [-30, 10, -200], 46]];
const OUT_K04 = [[0, [-30, 100, 80], [-10, 10, -350], 50], [2.06, [-10, 110, -190], [30, 10, -520], 54]];
SHOT_FN['s03'] = (t, u, lt) => { const s = outGet(); outWorld(s, t); c3SetCam(s.cam, camMove(OUT_K03, lt, 's03', { orbit: 0.01, creep: 0.03, rush: 0 })); c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 0.8, glow: 0.4, glowBlur: 12 }); };
SHOT_FN['s04'] = (t, u, lt) => { const s = outGet(); outWorld(s, t); c3SetCam(s.cam, camMove(OUT_K04, lt, 's04', { orbit: 0.01, creep: 0.02 })); c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 0.6, glow: 0.4, glowBlur: 12 }); };

// =====================================================================
//  GREENHOUSE (s29) — rows of rose bushes under a glass roof, sunrise glowing pink-orange through the glass, warm
//  beams; the grower (pink smock) with scissors in one fist, a rose stem in the other: snip on "cut"
// =====================================================================
const GRN = {};
function grnTexSunrise() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a8ae8'); g.addColorStop(0.45, '#ff9ac0'); g.addColorStop(0.75, '#ffb04a'); g.addColorStop(1, '#ffe08a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fff4c8'; x.beginPath(); x.arc(w * 0.62, h * 0.78, w * 0.1, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 6; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(i * w / 6, 0); x.lineTo(i * w / 6, h); x.stroke(); } x.beginPath(); x.moveTo(0, h * 0.5); x.lineTo(w, h * 0.5); x.stroke(); }, 1024, 512); }
function grnScissors() {   // big silver blades in an open V, pink ring handles under the fist
  const g = new THREE.Group(), st = c3Prop('#e4e8f0', { metal: 0.7, rough: 0.2, env: 1.4 }), hd = c3Toon('#ff3a8a');
  g.userData.bl = [1, -1].map((sd) => { const b = new THREE.Group(); g.add(b);
    const bl = c3Mesh(new THREE.ConeGeometry(0.2, 1.9, 4), st, 0.03); bl.scale.z = 0.35; bl.position.y = 1.0; b.add(bl);
    const r = c3Mesh(new THREE.TorusGeometry(0.34, 0.11, 8, 16), hd, 0.03); r.position.set(sd * 0.32, -0.32, 0); b.add(r); return b; });
  const pin = c3Mesh(new THREE.SphereGeometry(0.1, 8, 6), c3Toon('#4a4a50'), 0.01); g.add(pin); return g; }
function grnBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 600), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e8', ambI: 0.7, sky: '#ffd8e8', ground: '#4a6a3a', key: '#ffd8a0', keyI: 1.2, keyP: [-20, 18, -40], rim: '#ff9ac0', rimI: 0.6, rimP: [20, 20, 20] });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), c3Prop('#ffffff', { map: c3TexWall('paving', '#b89a7a', { rep: [10, 10] }), rough: 0.8 })); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  // the glass house: sunrise panes at the back and sides, white frames, a pitched roof of light
  scene.add(pl(120, 40, c3Flat('#ffffff', { map: grnTexSunrise() }), 0, 20, -40));
  for (const sx of [-1, 1]) scene.add(pl(100, 40, c3Flat('#ffffff', { map: grnTexSunrise() }), sx * 40, 20, 0, -sx * Math.PI / 2));
  for (let i = 0; i < 8; i++) scene.add(rb(0.5, 40, 0.5, c3Prop('#ffffff'), -35 + i * 10, 20, -39.5, 0.02));
  // rows of rose bushes (benches of green with red blooms)
  for (let r = 0; r < 4; r++) for (const sx of [-1, 1]) { const z = -30 + r * 9, bed = new THREE.Group(); bed.position.set(sx * 9, 0, z); scene.add(bed);
    bed.add(rb(10, 2.4, 3.2, c3Prop('#6a4a2a', { rough: 0.8 }), 0, 1.2, 0, 0.03));
    for (let i = 0; i < 6; i++) { const b = roseBunch(5, 0.9, r * 20 + i + (sx > 0 ? 7 : 0), { h: 3.4, r: 0.36 }); b.position.set(-4 + i * 1.6, 2.2, 0); bed.add(b);
 } }
  // god rays: soft warm planes
  s.grower = person(scene, 'grower'); s.grower.g.position.set(0, FOOT, -4);
  s.sc = grnScissors(); s.grower.root.add(s.sc); c3Layer(s.sc, C3.L_FOCUS);
  s.rose = new THREE.Group(); { s.rose.add(cyl(0.05, 0.05, 2.4, c3Toon('#2f8a3a'), 0, -1.2, 0, 0.005, 5)); const h = roseHead(0.42); s.rose.add(h); } s.grower.root.add(s.rose); c3Layer(s.rose, C3.L_FOCUS);
  s.snip = spritePlane(scene, texBurst('SNIP', '#ffffff', '#ff3a8a'), 3.4, 3.4);
  s.fgBy = { bush: (() => { const b = roseBunch(6, 1.2, 99, { h: 2.2, r: 0.5 }); return b; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#ffe0f0', mid: '#ffc890', bot: '#5a4a2a' });
  c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const grnGet = () => GRN.s ||= grnBuild();
const GRN_K29 = [[0, [-8, 9, 12], [0, 7, -4], 44], [1.9, [-5, 8.4, 9.5], [0, 7.2, -4], 44]];
SHOT_FN['s29'] = (t, u, lt) => {
  const s = grnGet(); c3SetCam(s.cam, camMove(GRN_K29, lt, 's29', { orbit: 0.02 }));
  const tc = wAfter('cut', 52.1, 52.3), k = clamp((t - tc) / 0.12), up = EZ.o3(clamp((t - tc - 0.1) / 0.5));
  const handR = [-1.5, 1.4], handL = [lerp(1.4, 2.2, up), lerp(1.2, 2.6, up)];
  c3PersonPose(s.grower, s.cam, t, { expr: c3FaceAt([[0, 'happy'], [tc, 'proud']], t, 'grower'), gaze: [0.3, -0.2], hand: { armR: handR, armL: handL }, ...STAND });
  const fr = fistLocal(s.grower, 'armR'), fl = fistLocal(s.grower, 'armL');
  s.sc.position.set(fr.x, fr.y + 0.05, fr.z - 0.04); s.sc.rotation.z = 0.35; s.sc.userData.bl[0].rotation.z = -lerp(0.4, 0.03, k); s.sc.userData.bl[1].rotation.z = lerp(0.4, 0.03, k);
  s.rose.position.set(fl.x + 0.2, fl.y + 0.9, fl.z + 0.05); s.rose.rotation.z = 0.1;
  const bk = pop(t, tc, 0.18) * (1 - clamp((t - tc - 0.6) / 0.2)); s.snip.visible = bk > 0.01; if (s.snip.visible) { s.snip.position.copy(s.grower.g.position).add(V3(3.0, 8.4, 0.6)); facing(s.snip, s.cam); s.snip.scale.setScalar(bk); }
  fgPlace(s, [['bush', [3.4, -4.6, -8], 0.9]], GRN_K29, 's29', lt, { orbit: 0.02 });
  c3Render(s.scene, s.cam, { bg: '#ffb04a', bgBlur: 1.6, nearBlur: 10, glow: 0.5, glowBlur: 12 });
};
