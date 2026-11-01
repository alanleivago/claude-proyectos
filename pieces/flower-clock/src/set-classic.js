// =====================================================================
//  SET classic — s23 "Instead of people shouting higher and higher,": an old-school auction room for contrast: dark
//  red wallpaper, a chandelier, the auctioneer at his podium with a gavel, bidders on chairs shouting and raising
//  numbered paddles, green UP arrows with climbing prices popping over them. Registers SHOT_FN['s23']. Prefix cls.
// =====================================================================
const CLS = {};
function clsTexPaddle(n) { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.46, 0, TAU); x.fill(); x.lineWidth = 12; x.strokeStyle = '#2a1208'; x.stroke();
  inked(x, String(n), w / 2, h / 2 + 4, h * 0.42, '#1a3a8a', { stroke: false, font: 'Arial' }); }, 256, 256); }
function clsTexUp(v) { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#3ad86a'; x.strokeStyle = '#1a3a12'; x.lineWidth = 10; x.beginPath();
  x.moveTo(w * 0.5, h * 0.04); x.lineTo(w * 0.92, h * 0.42); x.lineTo(w * 0.66, h * 0.42); x.lineTo(w * 0.66, h * 0.62); x.lineTo(w * 0.34, h * 0.62); x.lineTo(w * 0.34, h * 0.42); x.lineTo(w * 0.08, h * 0.42); x.closePath(); x.fill(); x.stroke();
  inked(x, v, w / 2, h * 0.82, h * 0.18, '#ffffff', { stroke: '#1a3a12', sw: 10, maxW: w * 0.9 }); }, 256, 320); }
function clsBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 400), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.65, sky: '#ffe0b0', ground: '#4a2a1a', key: '#ffe8c8', keyI: 1.05, keyP: [10, 24, 20], rim: '#ffb070', rimI: 0.5, rimP: [-12, 14, -10] });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), c3Prop('#ffffff', { map: c3TexWall('wood', '#8a4a22', { rep: [8, 6] }), rough: 0.5, env: 0.6 })); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), c3Prop('#c81e3a', { rough: 0.9 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.03, 4); scene.add(rug);
  scene.add(pl(80, 34, c3Prop('#ffffff', { map: c3TexWall('plaster', '#a81e2a', { rep: [4, 2] }), rough: 0.85 }), 0, 17, -14));
  for (const sx of [-1, 1]) scene.add(pl(60, 34, c3Prop('#ffffff', { map: c3TexWall('plaster', '#a81e2a', { rep: [3, 2] }), rough: 0.85 }), sx * 30, 17, 10, -sx * Math.PI / 2));
  scene.add(rb(80, 4, 0.4, c3Prop('#ffffff', { map: c3TexWall('wood', '#6a3a1a') }), 0, 2, -13.8, 0.03));
  // gilded paintings on the wall, a chandelier with warm bulbs
  for (const [x, c] of [[-14, '#3a8ae8'], [14, '#ffcc1a']]) { scene.add(rb(7, 5.4, 0.4, c3Prop('#d8a83a', { metal: 0.6, rough: 0.3 }), x, 17, -13.7, 0.03)); scene.add(pl(5.8, 4.2, c3Prop(c, { rough: 0.6 }), x, 17, -13.4)); }
  const ch = new THREE.Group(); ch.position.set(0, 26, 0); scene.add(ch); ch.add(cyl(0.12, 0.12, 6, c3Toon('#c8a03a'), 0, 3, 0, 0.01, 6)); ch.add(cyl(3.2, 3.2, 0.3, c3Prop('#d8a83a', { metal: 0.6 }), 0, 0, 0, 0.02, 24));
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, b = c3Mesh(new THREE.SphereGeometry(0.35, 10, 8), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0.01); b.position.set(Math.cos(a) * 3, 0.5, Math.sin(a) * 3); ch.add(b); }
  const lp = new THREE.PointLight('#ffd090', 1.0, 60, 1.4); lp.position.set(0, 24, 2); scene.add(lp);
  // the podium + auctioneer with a gavel
  s.pod = rb(5, 6.2, 3, c3Prop('#ffffff', { map: c3TexWall('wood', '#5a2a12') }), 0, 3.1, -6, 0.04); scene.add(s.pod); c3Layer(s.pod, C3.L_FOCUS);
  s.auct = person(scene, 'auct'); s.auct.g.position.set(0, FOOT, -8);
  s.gavel = new THREE.Group(); s.gavel.add(rb(0.18, 1.6, 0.18, c3Toon('#6a3a1a'), 0, 0.8, 0, 0.01)); { const h = cyl(0.36, 0.36, 1.2, c3Toon('#8a4a22'), 0, 1.7, 0, 0.012, 12); h.rotation.z = Math.PI / 2; s.gavel.add(h); }
  s.auct.root.add(s.gavel); c3Layer(s.gavel, C3.L_FOCUS);
  // bidders on two rows of chairs, facing the podium, each with a paddle
  s.bid = [['b1', -9, 6, 12], ['b4', -3, 6, 27], ['b8', 3, 6, 35], ['b6', 9, 6, 41], ['b9', -6, 12, 58], ['b2', 6, 12, 64]].map(([who, x, z, n]) => {
    const p = person(scene, who); p.g.position.set(x, 2.7, z); scene.add(rb(3, 0.4, 2.6, c3Prop('#d8a83a'), x, 2.5, z + 0.6, 0.02));
    const pad = new THREE.Group(); pad.add(rb(0.14, 1.4, 0.1, c3Toon('#6a3a1a'), 0, 0, 0, 0.01)); const disc = pl(1.6, 1.6, new THREE.MeshBasicMaterial({ map: clsTexPaddle(n), transparent: true, toneMapped: false }), 0, 1.3, 0.06); pad.add(disc);
    p.root.add(pad); c3Layer(pad, C3.L_FOCUS); return { p, pad }; });
  s.ups = ['500', '', '600', '', '700', ''].map((v) => spritePlane(scene, clsTexUp(v), 3, 3.75));
  c3Env(scene, { top: '#ffe0b0', mid: '#c87a4a', bot: '#3a1a10' });
  c3ShadeScene(scene, { dark: 0.22 });
  return s;
}
const clsGet = () => CLS.s ||= clsBuild();
const CLS_K23 = [[0, [-14, 13, 28], [0, 8, 2], 50], [2.12, [-6, 12, 24], [2, 8, 0], 50]];
SHOT_FN['s23'] = (t, u, lt) => {
  const s = clsGet(); c3SetCam(s.cam, camMove(CLS_K23, lt, 's23', { orbit: 0.02, creep: 0.03 }));
  // the auctioneer points the gavel and bangs it twice
  const bang = Math.max(0, Math.sin(t * 9)) ** 4;
  c3PersonPose(s.auct, s.cam, t, { expr: 'screaming', gaze: [0, 0.3], hand: { armL: [1.8, lerp(3.8, 2.6, bang)], armR: [-2.0, 2.4] }, ...STAND });
  const f = fistLocal(s.auct, 'armL'); s.gavel.position.set(f.x, f.y - 0.6, f.z + 0.05); s.gavel.rotation.z = -0.4 - bang * 0.5;
  // bidders shout and shoot their paddles up one after another
  s.bid.forEach(({ p, pad }, i) => { const ti = 35.1 + i * 0.3, up = EZ.back(clamp((t - ti) / 0.2)), side = p.g.position.x < 0 ? -1 : 1;
    c3PersonPose(p, s.cam, t, { expr: up > 0.5 ? ['screaming', 'excited', 'angry', 'determined', 'screaming', 'excited'][i] : 'talking', gaze: [0, 0.4], lean: 0.06 * up,
      hand: side > 0 ? { armL: [lerp(1.4, 2.0, up), lerp(1.0, 4.4, up)], armR: [-1.4, 1.0] } : { armR: [lerp(-1.4, -2.0, up), lerp(1.0, 4.4, up)], armL: [1.4, 1.0] }, ...sitFeet(2.7) });
    const ff = fistLocal(p, side > 0 ? 'armL' : 'armR'); pad.visible = up > 0.15; pad.position.set(ff.x, ff.y + 0.15, ff.z + 0.08); pad.rotation.z = side * -0.25; pad.scale.setScalar(0.8);   // the stick starts inside the fist
    const m = s.ups[i], k = i % 2 ? 0 : pop(t, ti + 0.1, 0.25); m.visible = k > 0.01; if (m.visible) { m.position.copy(p.g.position).add(V3(-side * 0.6, 10.5 + i * 1.2 + (t - ti) * 0.8, 0.4)); facing(m, s.cam); m.scale.setScalar(k); } });
  c3Render(s.scene, s.cam, { bg: '#a81e2a', bgBlur: 1.4, glow: 0.5, glowBlur: 12 });
};
