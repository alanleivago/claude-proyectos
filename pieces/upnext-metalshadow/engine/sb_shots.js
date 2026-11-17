// upnext-metalshadow: COPY of pieces/upnext-01/engine/sb_shots.js reduced to the 4 comparison shots (02, 07, 14, 23), code unchanged.
// upnext-01 storyboard shots (Dd2YemoPJ9- remake). One still per shot, at the ref's framing.
// Each entry of window.SB (read by render + compose): id, ref time range, line(s), clip/expression notes.
export function buildShots(L) {
  const { MENTOR, addShot, bedroom, character, holdAt, phone, cam, box, plane, mesh, lam, basic, blob, TX, BED, NS, DESK, V3, THREE } = L;
  const SB = window.SB = [];
  const shot = (meta, scene, camera) => { SB.push(meta); addShot(scene, camera); };
  const NIGHT_TINT = 0x7c84b8, LAMP_TINT = 0xb8bcd8;
  const edgeX = BED.x - BED.w / 2;   // left bed edge (nightstand side)

  const PHONE_TINT = 0xa898cc;   // her skin under the phone glow (ref #B9A3C0) on the night blue
  // v2: lie_phone (new clip, tools/girl_clips.py): lying on her back, both hands hold the phone over the chest, head raised
  function lyingPhone(scene, tint, t = 0.5) {
    const g = character('girl', { tint, shadow: 0 }); g.pose('lie_phone', t, 'half', 'talkSmall');
    g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.22); scene.add(g.root); g.root.updateMatrixWorld(true);
    const H = g.world('Hand.R', [0, 0.55, 0]), Lh = g.world('Hand.L', [0, 0.55, 0]), E = g.world('Head', [0, 0.6, 0]);
    const p = phone(true); p.position.copy(H.clone().lerp(Lh, 0.5)); scene.add(p); p.lookAt(E); p.rotateZ(Math.PI / 2);
    return { g, p };
  }
  function gnomeAt(scene, x, y, z, ry, clip, t, eyes, mouth, tint = 0xffffff) {
    const n = character('mentor', { tint }); n.pose(clip, t, eyes, mouth); n.root.position.set(x, y, z); n.root.rotation.y = ry; scene.add(n.root); n.root.updateMatrixWorld(true); return n;
  }
  const faceTo = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);   // ry so +z looks from -> to (x, z)
  // the girl sitting on the left bed edge facing -x (toward the window); pelvis 0.27 behind the feet in the sit clips
  function sitEdge(scene, clip, t, eyes, mouth, z = -1.25, tint = 0xffffff) {
    const g = character('girl', { tint }); g.pose(clip, t, eyes, mouth); g.root.rotation.y = -Math.PI / 2; g.root.position.set(edgeX - 0.17, 0, z); scene.add(g.root); g.root.updateMatrixWorld(true); return g;
  }
  function puff(scene, p) { const m = lam(null, 0x9aa0a8); [[0, 0, 0, 0.05], [0.05, 0.02, 0, 0.04], [-0.04, 0.025, 0.01, 0.035]].forEach(([x, y, z, r]) => mesh(new THREE.IcosahedronGeometry(r, 0), m, p.x + x, p.y + y, p.z + z, scene)); }

  // S02 3.5-5.6 night: Pip on the nightstand by the 4:00 clock; her hand + phone in the foreground (lower right), over her shoulder
  { const R = bedroom('night', { clock: '4:00' }); const { g, p } = lyingPhone(R.scene, PHONE_TINT); R.quilt(-1.12, -0.2, 0.2, 0x9098c8, -0.5);
    const n = gnomeAt(R.scene, NS.x - 0.1, NS.h, NS.z - 0.02, faceTo([NS.x - 0.1, NS.z], [BED.x, -1.5]), 'talk', 0.15, 'deadpan', 'talkA', 0x9ca4d0);
    const P = p.position, G = n.world(MENTOR.head_bone);
    const C0 = P.clone().add(P.clone().sub(G).normalize().multiplyScalar(0.7)).add(V3(0.14, 0.26, 0.06));   // behind the phone on the phone -> Pip line
    shot({ id: '02', t: [3.5, 5.6], who: 'PIP', line: 'Four. Now.', clip: 'Pip talk; her lie_phone hands in the foreground', face: 'deadpan / talkA', note: 'Ref: gnome stands ON the clock; ours stands beside it.' },
      R.scene, cam(58, [C0.x, C0.y, C0.z], [G.x + 0.02, G.y - 0.16, G.z])); }
  // S07 22.6-24.0: Pip close, low, the clock in the foreground
  { const R = bedroom('day', { clock: '11:53' }); const n = gnomeAt(R.scene, NS.x - 0.1, NS.h, NS.z - 0.04, 0.7, 'talk', 0.4, 'deadpan', 'talkE');
    shot({ id: '07', t: [22.6, 24.0], who: 'PIP', line: 'Time to cheat.', clip: 'Pip talk', face: 'deadpan / talkE', note: '' },
      R.scene, cam(58, [NS.x + 0.22, NS.h + 0.12, NS.z + 0.62], [NS.x - 0.1, NS.h + 0.36, NS.z - 0.04])); }
  // S14 47.6-49.0 night: Pip on the desk by the CRT, smug, her phone charging in front of him (he moved it)
  { const R = bedroom('night', { clock: '10:48', phoneOnDesk: true }); gnomeAt(R.scene, DESK.x - 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 + 0.3, 'idle', 0.3, 'skeptical', 'smirk', 0xa8b0e0);
    const pl = new THREE.PointLight(0x9cc4ff, 1.2, 1.0); pl.position.set(DESK.x + 0.25, DESK.h + 0.15, DESK.z - 0.12); R.scene.add(pl);
    shot({ id: '14', t: [47.6, 49.0], who: '-', line: '', clip: 'Pip idle', face: 'skeptical / smirk', note: '' },
      R.scene, cam(62, [DESK.x + 1.0, DESK.h + 0.18, DESK.z - 0.75], [DESK.x - 0.05, DESK.h + 0.3, DESK.z - 0.1])); }
  // S23 65.6-72.7 day: Pip close-up, slow push-in, warm closed-eye smile on the last line
  { const R = bedroom('day', { clock: '8:28', phoneOnDesk: true, mat: true }); const n = gnomeAt(R.scene, DESK.x + 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 + 0.25, 'idle', 0.3, 'happy', 'smile');
    const E = n.world(MENTOR.head_bone); const d = V3(Math.sin(Math.PI / 2 + 0.25), 0, Math.cos(Math.PI / 2 + 0.25));
    shot({ id: '23', t: [65.6, 72.7], who: 'PIP', line: 'Just beating yesterday is plenty.', line2: '(before it) PIP: Scratch that.', clip: 'Pip idle', face: 'happy / smile (final); skeptical / smirk on "Scratch that."', note: '' },
      R.scene, cam(45, [E.x + d.x * 0.85, E.y + 0.12, E.z + d.z * 0.85], [E.x, E.y + 0.06, E.z])); }
}
