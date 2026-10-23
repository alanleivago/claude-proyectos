// cast check: the five people side by side, neutral then grin
const G = {};
function sceneCasino() {
  if (!G.scene) {
    const scene = new THREE.Scene(); G.scene = scene; G.cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    scene.add(new THREE.AmbientLight('#fff2e0', 0.8)); scene.children.forEach((c) => c.layers.enableAll());
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), c3Prop('#c89a6a')); fl.rotation.x = -Math.PI / 2; scene.add(fl);
    const wl = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), c3Prop('#e8c890')); wl.position.z = -6; scene.add(wl);
    const ex = ['neutral', 'determined', 'proud', 'grin', 'smug'];
    const cast = ex.map((e, i) => (i % 2 ? { key: 'ron' + i, outfit: 'mustard', hairStyle: 'brown', fx: ['mustache', 'glasses'] } : { key: 'jobs' + i, outfit: 'white', hairStyle: 'long', fx: ['beard', 'mustache'] }));
    G.ex = ex;
    G.p = cast.map((o, i) => { const p = c3Person(o); p.g.position.set(-8 + i * 4, 2.5, 0); scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); return p; });
  }
  const t = TT; c3SetCam(G.cam, { p: [0, 6, 38], l: [0, 5.8, 0], fov: 42 });
  G.p.forEach((p, i) => c3PersonPose(p, G.cam, t, { expr: t < 2 ? G.ex[i] : ['proud', 'grin', 'smug', 'determined', 'neutral'][i], idle: 0, gaze: [0, t < 2 ? 0.7 : 0] }));
  c3Render(G.scene, G.cam, { bg: '#2a1a10', bloom: 0.2 });
}
