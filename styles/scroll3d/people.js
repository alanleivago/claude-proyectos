// =====================================================================
//  styles/scroll3d/people.js — the pov3d people (pieces/oxigeno: lathe-turned limbs, cloth folds, hair, long hair)
//  as single rigged groups that the scroll3d pose() rig drives (torso / head / arms[el] / eyes / mouth).
//  needs: THREE, lin(), mesh(), RNG(). Faces +z. o: { seated, shirt, pants, skin, hair, longHair, shoe, kid }
// =====================================================================
let PPL_T = null;
function pplTex() {
  if (PPL_T) return PPL_T;
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#f4f4f4'; x.fillRect(0, 0, 256, 256); const R = RNG('folds');
  for (let i = 0; i < 26; i++) { const px = R.r(0, 256), ww = R.r(3, 12), g = x.createLinearGradient(px - ww, 0, px + ww, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, `rgba(0,0,0,${R.r(0.08, 0.2)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - ww, 0, ww * 2, 256); }
  for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(0,0,0,${R.r(0.02, 0.06)})`; x.fillRect(R.r(0, 256), R.r(0, 256), 2, 2); }
  PPL_T = new THREE.CanvasTexture(c); PPL_T.encoding = THREE.sRGBEncoding; PPL_T.wrapS = PPL_T.wrapT = THREE.RepeatWrapping; return PPL_T;
}
const pplLathe = (pts, seg = 14) => new THREE.LatheGeometry(pts.slice().sort((a, b) => a[1] - b[1]).map(([r, y]) => new THREE.Vector2(r, y)), seg);
let PPL_G = null;
function pplGeo() {
  if (PPL_G) return PPL_G;
  PPL_G = {
    thigh: pplLathe([[0.001, 0.03], [0.07, 0.025], [0.09, -0.02], [0.084, -0.12], [0.068, -0.32], [0.058, -0.44], [0.001, -0.46]]),
    shin: pplLathe([[0.001, 0.01], [0.057, 0.0], [0.056, -0.1], [0.046, -0.28], [0.037, -0.41], [0.001, -0.43]]),
    shoe: new THREE.CapsuleGeometry(0.05, 0.13, 4, 8).rotateX(Math.PI / 2).scale(1.1, 0.72, 1).translate(0, -0.43, 0.055),
    uarm: pplLathe([[0.001, 0.02], [0.06, 0.0], [0.053, -0.12], [0.044, -0.28], [0.001, -0.3]], 12),
    farm: pplLathe([[0.001, 0.0], [0.043, -0.005], [0.04, -0.12], [0.032, -0.25], [0.001, -0.26]], 12),
    hand: new THREE.SphereGeometry(0.047, 12, 10).scale(0.75, 1.25, 0.55).translate(0, -0.3, 0),
    torso: pplLathe([[0.001, -0.02], [0.15, 0.0], [0.142, 0.08], [0.158, 0.22], [0.19, 0.35], [0.175, 0.42], [0.09, 0.47], [0.001, 0.48]], 18).scale(1, 1, 0.62),
    hips: new THREE.CylinderGeometry(0.155, 0.165, 0.2, 16).scale(1, 1, 0.72),
    neck: new THREE.CylinderGeometry(0.045, 0.05, 0.1, 10),
    head: new THREE.SphereGeometry(0.11, 20, 14).scale(0.92, 1.08, 1),
    hair: new THREE.SphereGeometry(0.118, 18, 10, 0, TAU, 0, Math.PI * 0.5).scale(0.96, 1.08, 1.04),
    hairB: new THREE.SphereGeometry(0.1, 14, 10).scale(1.05, 1.5, 0.6),
  };
  return PPL_G;
}
function buildPerson(o = {}) {
  const G = pplGeo(), T = pplTex(), cloth = (c) => new THREE.MeshStandardMaterial({ color: lin(c), map: T, roughness: 0.88 });
  const skin = new THREE.MeshStandardMaterial({ color: lin(o.skin ?? '#d4a07a'), roughness: 0.55 }), hairM = new THREE.MeshStandardMaterial({ color: lin(o.hair ?? '#2a1d16'), roughness: 0.7 });
  const shirt = cloth(o.shirt ?? '#2f6fd1'), pants = cloth(o.pants ?? '#2b3a55'), shoe = new THREE.MeshStandardMaterial({ color: lin(o.shoe ?? '#1e1e22'), roughness: 0.5 });
  const P = (geo, m, x = 0, y = 0, z = 0) => { const q = new THREE.Mesh(geo, m); q.position.set(x, y, z); q.castShadow = true; q.receiveShadow = true; return q; };
  const g = new THREE.Group(), hipY = 0.9, sit = !!o.seated;
  for (const s of [-1, 1]) {   // legs: hip → knee → foot (seated: thighs forward, shins down)
    const hip = new THREE.Group(); hip.position.set(s * 0.09, hipY, 0); if (sit) hip.rotation.x = -Math.PI / 2; g.add(hip); hip.add(P(G.thigh, pants));
    const knee = new THREE.Group(); knee.position.y = -0.45; if (sit) knee.rotation.x = Math.PI / 2; hip.add(knee); knee.add(P(G.shin, pants)); knee.add(P(G.shoe, shoe));
  }
  g.add(P(G.hips, pants, 0, hipY + 0.02, 0));
  const torso = new THREE.Group(); torso.position.y = hipY + 0.08; torso.userData.y0 = hipY + 0.08; g.add(torso);
  torso.add(P(G.torso, shirt, 0, 0, 0)); torso.add(P(G.neck, skin, 0, 0.5, 0));
  const arms = [-1, 1].map((s) => { const sh = new THREE.Group(); sh.position.set(s * 0.2, 0.42, 0); torso.add(sh); sh.add(P(G.uarm, shirt));
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el); el.add(P(G.farm, o.short ? skin : shirt)); el.add(P(G.hand, skin)); sh.userData.el = el; return sh; });
  const head = new THREE.Group(); head.position.set(0, 0.56, 0); torso.add(head);
  head.add(P(G.head, skin, 0, 0.1, 0)); head.add(P(G.hair, hairM, 0, 0.125, -0.012)); if (o.longHair) head.add(P(G.hairB, hairM, 0, 0.02, -0.07));
  const eyes = [-1, 1].map((s) => { const e = P(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshStandardMaterial({ color: lin('#140e0a') }), s * 0.038, 0.11, 0.1); head.add(e); return e; });
  const mouth = P(new THREE.BoxGeometry(0.032, 0.006, 0.006), new THREE.MeshStandardMaterial({ color: lin('#5a2a20') }), 0, 0.05, 0.105); head.add(mouth);
  if (sit) g.position.y = -0.45 + 0.02;   // seated: the hips sit at the chair height (feet on the floor)
  g.userData = { torso, head, arms, eyes, mouth };
  if (o.kid) g.scale.setScalar(0.7);
  return g;
}
// palettes from pov3d
const PPL_SHIRT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f1ea', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#9fc2e0', '#c2185b'];
const PPL_PANTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#6a7a8a', '#4a5a3a'], PPL_SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'], PPL_HAIR = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#8a4a2a'];
function randomPerson(seed, o = {}) { const R = RNG('ppl', seed); return buildPerson(Object.assign({ shirt: R.pick(PPL_SHIRT), pants: R.pick(PPL_PANTS), skin: R.pick(PPL_SKIN), hair: R.pick(PPL_HAIR), longHair: R.f() < 0.45, short: R.f() < 0.3 }, o)); }
