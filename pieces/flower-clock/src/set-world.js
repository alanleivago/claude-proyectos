// =====================================================================
//  SET world — s30 "can be in a shop on another continent a day or two later.": the world map (Flow image) as a big
//  tilted board, a little cargo plane carrying a rose box flies from the Netherlands across the Atlantic to New York,
//  a dashed trail behind it; a tiny flower-shop pin pops at the end; a desk calendar flips +1 DAY, +2 DAYS.
//  Registers SHOT_FN['s30']. Prefix wld.
// =====================================================================
const WLD = {}, WLD_W = 110, WLD_H = 55;
// lon/lat -> map board coordinates (x right, z down the map); the board lies flat at y 0
const wldPt = (lon, lat, y = 0) => V3((lon / 180) * WLD_W / 2, y, -(lat / 90) * WLD_H / 2);
const WLD_NL = [4.8, 52.3], WLD_NY = [-74, 40.7];
function wldTexCal(txt) { return tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8282a'; x.fillRect(0, 0, w, h * 0.3); x.strokeStyle = '#2a1208'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
  inked(x, 'DELIVERY', w / 2, h * 0.15, h * 0.12, '#ffffff', { stroke: false }); inked(x, txt, w / 2, h * 0.64, h * 0.26, '#2a1208', { stroke: false, maxW: w * 0.86 }); }, 256, 256); }
function wldTexShop() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(8, 8, w - 16, h * 0.7, 30); x.fill(); x.lineWidth = 10; x.strokeStyle = '#2a1208'; x.stroke();
  x.beginPath(); x.moveTo(w * 0.42, h * 0.72); x.lineTo(w / 2, h * 0.95); x.lineTo(w * 0.58, h * 0.72); x.closePath(); x.fillStyle = '#ffffff'; x.fill(); x.stroke();
  for (let i = 0; i < 5; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#e8282a'; x.fillRect(w * 0.12 + i * w * 0.152, h * 0.1, w * 0.152, h * 0.14); }
  inked(x, 'FLOWER SHOP', w / 2, h * 0.36, h * 0.1, '#e8282a', { stroke: false, maxW: w * 0.78 });
  x.save(); x.beginPath(); x.arc(w / 2, h * 0.56, w * 0.11, 0, TAU); x.clip(); cover(x, asset('img_roses.jpg'), w * 0.39, h * 0.45, w * 0.22, w * 0.22); x.restore(); x.beginPath(); x.arc(w / 2, h * 0.56, w * 0.11, 0, TAU); x.stroke(); }, 512, 512); }
function wldPlane() { const g = new THREE.Group(), body = c3Prop('#ffffff', { rough: 0.35 }), red = c3Toon('#e8282a');
  const f = cyl(0.55, 0.45, 5, body, 0, 0, 0, 0.04, 16); f.rotation.x = Math.PI / 2; g.add(f);
  const nose = c3Mesh(new THREE.SphereGeometry(0.55, 14, 10), body, 0.04); nose.position.z = 2.5; g.add(nose);
  g.add(rb(6.4, 0.18, 1.3, red, 0, 0, 0.3, 0.03)); g.add(rb(2.4, 0.14, 0.8, red, 0, 0, -2.2, 0.02)); g.add(rb(0.14, 1.3, 0.9, red, 0, 0.7, -2.2, 0.02));
  const box = rb(1.6, 1.0, 1.4, c3Prop('#c8904a'), 0, -1.2, 0.2, 0.03); g.add(box); const b = roseBunch(5, 0.4, 3, { h: 0.6, r: 0.22 }); b.position.set(0, -0.8, 0.2); g.add(b);
  return g; }
function wldBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 800), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffffff', ambI: 0.7, sky: '#e0f0ff', ground: '#3a4a6a', key: '#fff4e0', keyI: 1.0, keyP: [20, 60, 30], rim: '#a8d0ff', rimI: 0.4, rimP: [-30, 30, -30] });
  // the map board on a desk: the Flow world map (equirectangular), a wooden frame
  const mt = tex((x, w, h) => { if (!cover(x, asset('img_earth.jpg'), 0, 0, w, h)) { x.fillStyle = '#3a8ae8'; x.fillRect(0, 0, w, h); }  x.globalCompositeOperation = 'saturation'; x.fillStyle = 'hsl(0, 85%, 50%)'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'multiply'; x.fillStyle = '#c8c8d8'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over'; }, 2048, 1024);
  const map = new THREE.Mesh(new THREE.PlaneGeometry(WLD_W, WLD_H), c3Prop('#ffffff', { map: mt, rough: 0.8 })); map.rotation.x = -Math.PI / 2; scene.add(map);
  scene.add(rb(WLD_W + 2, 1, WLD_H + 2, c3Prop('#ffffff', { map: c3TexWall('wood', '#8a4a22') }), 0, -0.55, 0, 0.05));
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), c3Prop('#ffffff', { map: c3TexWall('wood', '#c8783a', { rep: [6, 6] }), rough: 0.6 })); desk.rotation.x = -Math.PI / 2; desk.position.y = -1.1; scene.add(desk);
  // the flight path: a dashed arc; pins at both ends
  const A = wldPt(...WLD_NL), B = wldPt(...WLD_NY); s.path = (k) => { const p = A.clone().lerp(B, k); p.y = 1.5 + Math.sin(k * Math.PI) * 11; return p; };
  s.dashes = []; for (let i = 0; i < 40; i++) { const d = c3Mesh(new THREE.SphereGeometry(0.16, 6, 4), c3Flat('#ffffff'), 0); d.position.copy(s.path(i / 40)); scene.add(d); s.dashes.push(d); }
  s.pinA = spritePlane(scene, halTexTulip('#ff8a1a'), 3, 3); s.shop = spritePlane(scene, wldTexShop(), 7, 7);
  s.plane = wldPlane(); scene.add(s.plane); c3Layer(s.plane, C3.L_FOCUS);
  s.cals = ['+1 DAY', '+2 DAYS'].map((d) => spritePlane(scene, wldTexCal(d), 5, 5));
  c3Env(scene, { top: '#e0f0ff', mid: '#c8a070', bot: '#4a2a1a' });
  c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const wldGet = () => WLD.s ||= wldBuild();
const WLD_K30 = [[0, [6, 40, 20], [2, 0, -9], 44], [2.68, [-22, 42, 20], [-20, 0, -9], 44]];
SHOT_FN['s30'] = (t, u, lt) => {
  const s = wldGet(); c3SetCam(s.cam, camMove(WLD_K30, lt, 's30', { orbit: 0, creep: 0.03 }));
  const k = EZ.io(clamp((lt - 0.25) / 2.0));
  s.dashes.forEach((d, i) => { d.visible = i / 40 < k; });
  const P = s.path(k), Q = s.path(Math.min(1, k + 0.02)); s.plane.position.copy(P); s.plane.lookAt(Q.x + (Q.x - P.x) * 10, Q.y + (Q.y - P.y) * 10, Q.z + (Q.z - P.z) * 10); s.plane.rotateZ(0.15 * Math.sin(t * 3));
  s.pinA.visible = true; s.pinA.position.copy(wldPt(...WLD_NL, 1.8)); facing(s.pinA, s.cam); s.pinA.scale.setScalar(1);
  const ks = pop(t, 52.98 + 2.3, 0.3); s.shop.visible = ks > 0.01; if (s.shop.visible) { s.shop.position.copy(wldPt(...WLD_NY, 4.2)); facing(s.shop, s.cam); s.shop.scale.setScalar(ks); }
  const td = wAfter('day', 54.8, 54.96), tt = wAfter('two', 55.1, 55.26);
  s.cals.forEach((m, i) => { const t0 = i ? tt : td, kk = pop(t, t0 - 0.1, 0.2) * (i === 0 ? 1 - clamp((t - tt + 0.1) / 0.1) : 1); m.visible = kk > 0.01; if (!m.visible) return;
    m.position.copy(wldPt(-40, -14, 6)); facing(m, s.cam); m.scale.setScalar(kk); });
  c3Render(s.scene, s.cam, { bg: '#c8783a', bgBlur: 1.2, glow: 0.4, glowBlur: 12 });
};
