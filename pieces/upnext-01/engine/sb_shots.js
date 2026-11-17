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

  // S01 0.0-3.5 night: lying in bed scrolling the phone, oblique high angle from the bed side
  { const R = bedroom('night', { clock: '4:00' }); const { g } = lyingPhone(R.scene, PHONE_TINT); R.quilt(-1.12, -0.2, 0.2, 0x9098c8, -0.5);
    const E = g.world('Head'); shot({ id: '01', t: [0.0, 3.5], who: 'GIRL', line: "From tomorrow on, I'm waking at four.", clip: 'lie_phone (new clip)', face: 'half / talkSmall', note: '' },
      R.scene, cam(70, [E.x - 0.5, E.y + 0.62, E.z + 0.38], [E.x + 0.08, E.y + 0.02, E.z + 0.12], -0.1)); }
  // S02 3.5-5.6 night: Pip on the nightstand by the 4:00 clock; her hand + phone in the foreground (lower right), over her shoulder
  { const R = bedroom('night', { clock: '4:00' }); const { g, p } = lyingPhone(R.scene, PHONE_TINT); R.quilt(-1.12, -0.2, 0.2, 0x9098c8, -0.5);
    const n = gnomeAt(R.scene, NS.x - 0.1, NS.h, NS.z - 0.02, faceTo([NS.x - 0.1, NS.z], [BED.x, -1.5]), 'talk', 0.15, 'deadpan', 'talkA', 0x9ca4d0);
    const P = p.position, G = n.world(MENTOR.head_bone);
    const C0 = P.clone().add(P.clone().sub(G).normalize().multiplyScalar(0.7)).add(V3(0.14, 0.26, 0.06));   // behind the phone on the phone -> Pip line
    shot({ id: '02', t: [3.5, 5.6], who: 'PIP', line: 'Four. Now.', clip: 'Pip talk; her lie_phone hands in the foreground', face: 'deadpan / talkA', note: 'Ref: gnome stands ON the clock; ours stands beside it.' },
      R.scene, cam(58, [C0.x, C0.y, C0.z], [G.x + 0.02, G.y - 0.16, G.z])); }
  // S03 5.6-8.4 night: lying, head turned, phone down -> lie_back
  { const R = bedroom('night', { clock: '4:01' }); const g = character('girl', { tint: NIGHT_TINT, shadow: 0 }); g.pose('lie_back', 1.0, 'sulk', 'talkSmall');
    g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.25); R.scene.add(g.root); R.quilt(-1.32, -0.2, 0.4, 0x9098c8, -0.4, 0.46);
    const E = g.world('Head'); shot({ id: '03', t: [5.6, 8.4], who: 'GIRL / PIP', line: '...Is this counting?', line2: 'PIP: Nope.', clip: 'lie_back', face: 'sulk / talkSmall', note: '' },
      R.scene, cam(68, [E.x - 0.7, E.y + 0.6, E.z + 0.55], [E.x, E.y - 0.05, E.z + 0.3], 0.05)); }
  // S04 8.4-12.9 light comes up: camera at mattress height by the bed foot, quilt big in the foreground, Pip on the nightstand,
  // she has sat up in bed (sit_up_bed, new clip, end pose)
  { const R = bedroom('lamp', { clock: '11:52' }); const g = character('girl', { tint: LAMP_TINT, shadow: 0 }); g.pose('sit_up_bed', 1.75, 'sulk', 'talkSmall');
    g.root.position.set(BED.x - 0.05, BED.top - 0.005, -1.5); R.scene.add(g.root); R.quilt(-1.42, -0.2, 0.32, 0xffffff, -0.6, 0.45);
    gnomeAt(R.scene, NS.x - 0.08, NS.h, NS.z, faceTo([NS.x, NS.z], [BED.x, -1.2]), 'idle', 0.3, 'unimpressed', 'neutral', LAMP_TINT);
    shot({ id: '04', t: [8.4, 12.9], who: 'GIRL', line: '...Tomorrow, then.', clip: 'sit_up_bed (new clip; plays 8.4-10.2 s, end pose shown)', face: 'sulk / talkSmall', note: 'Light fades up 9.0-10.5 s.' },
      R.scene, cam(72, [1.3, 0.8, 0.05], [-0.25, 0.8, -1.7])); }
  // S05 12.9-17.4: sitting on the bed edge looking at the phone in both hands, Pip on the nightstand watching
  { const R = bedroom('lamp', { clock: '11:52' }); const g = sitEdge(R.scene, 'sit_slumped', 1.0, 'gazeDown', 'talkSmall', -1.2, LAMP_TINT);
    const H = g.world('Hand.R'), Lh = g.world('Hand.L'), E = g.world('Head'); const p = phone(true); p.position.copy(H.clone().lerp(Lh, 0.5)).add(V3(-0.04, 0.03, 0)); R.scene.add(p); p.lookAt(E); p.rotateZ(Math.PI / 2);
    gnomeAt(R.scene, NS.x - 0.06, NS.h, NS.z, faceTo([NS.x, NS.z], [E.x, E.z]), 'idle', 0.3, 'deadpan', 'neutral', LAMP_TINT);
    shot({ id: '05', t: [12.9, 17.4], who: 'GIRL', line: 'Some guy jogged six miles before dawn.', clip: 'sit_slumped + phone between the hands', face: 'gazeDown / talkSmall', note: '' },
      R.scene, cam(66, [-1.55, 0.95, -0.3], [-0.42, 0.72, -1.45])); }
  // S06 17.4-22.6: close on her, head hanging, plain lilac background
  { const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8c86a8);
    scene.add(new THREE.HemisphereLight(0xf0ecff, 0x6a6080, 1.8)); const k = new THREE.DirectionalLight(0xffffff, 0.8); k.position.set(1, 2, 3); scene.add(k);
    const g = character('girl', { shadow: 0 }); g.pose('sad_slump', 1.6, 'sad', 'sadPout'); scene.add(g.root);
    plane(6, 4, basic(null, 0x8c86a8), 0, 1.3, -1.2, scene);
    const E = g.world('Head'); shot({ id: '06', t: [17.4, 22.6], who: 'GIRL', line: 'I guess...', line2: "I'm just not hungry enough.", clip: 'sad_slump (end, holds)', face: 'sad / sadPout', note: '' },
      scene, cam(42, [E.x + 0.1, E.y + 0.0, E.z + 1.1], [E.x, E.y - 0.1, E.z])); }
  // S07 22.6-24.0: Pip close, low, the clock in the foreground
  { const R = bedroom('day', { clock: '11:53' }); const n = gnomeAt(R.scene, NS.x - 0.1, NS.h, NS.z - 0.04, 0.7, 'talk', 0.4, 'deadpan', 'talkE');
    shot({ id: '07', t: [22.6, 24.0], who: 'PIP', line: 'Time to cheat.', clip: 'Pip talk', face: 'deadpan / talkE', note: '' },
      R.scene, cam(58, [NS.x + 0.22, NS.h + 0.12, NS.z + 0.62], [NS.x - 0.1, NS.h + 0.36, NS.z - 0.04])); }
  // S08 24.0-25.0: Pip walks across the floor toward camera, her legs at the right (sitting on the bed edge)
  { const R = bedroom('day', { clock: '11:53' }); sitEdge(R.scene, 'sit_slumped', 1.0, 'gazeDown', 'neutral', -1.2);
    gnomeAt(R.scene, -0.85, 0, -1.25, faceTo([-0.85, -1.25], [-1.6, -0.2]), 'walk', 0.3, 'deadpan', 'neutral');
    shot({ id: '08', t: [24.0, 25.0], who: '-', line: '', clip: 'Pip walk', face: 'deadpan', note: '' },
      R.scene, cam(72, [-1.55, 0.45, -0.05], [-0.65, 0.35, -1.6])); }
  // S09 25.0-29.5: Pip sitting on the rug in profile, sulking, desk + CRT behind
  { const R = bedroom('day', { clock: '11:54' }); gnomeAt(R.scene, -0.6, 0, 0.45, Math.PI / 2 + 0.25, 'sit', 1.49, 'sleepy', 'frown');
    shot({ id: '09', t: [25.0, 29.5], who: 'GIRL (off) / PIP', line: '...Need help, Pip?', line2: 'PIP: Nah.', clip: 'Pip sit (end)', face: 'sleepy (eyes shut) / frown', note: '' },
      R.scene, cam(62, [0.4, 0.3, 1.3], [-0.85, 0.36, 0.3])); }
  // S10a 29.5-36.5: two-shot. She sits on the bed edge; Pip flat on his back on the yoga mat at her feet, sigh puff
  { const R = bedroom('day', { clock: '11:55', mat: true }); const g = sitEdge(R.scene, 'sit_slumped', 1.0, 'gazeDown', 'neutral', -1.1);
    const n = character('mentor'); n.pose('idle', 0.2, 'deadpan', 'talkA'); n.model.rotation.x = -Math.PI / 2; n.model.position.y = MENTOR.back + 0.012;   // flat on its back: lift by the model's back depth n.root.rotation.y = 0.77;
    n.root.position.set(-0.5, 0, -0.95); n.shadow.visible = false; R.scene.add(n.root); n.root.updateMatrixWorld(true); puff(R.scene, n.world(MENTOR.head_bone).add(V3(-0.05, 0.22, 0)));
    shot({ id: '10a', t: [29.5, 36.0], who: 'PIP', line: 'Tomorrow...', line2: 'your feet land on this first.', clip: 'Pip idle laid flat on his back (rigid) + sigh puff; she sit_slumped', face: 'Pip deadpan / talkA; girl gazeDown', note: 'Ref sneakers -> pink yoga mat (her boots are part of the mesh). No lie-down clip for Pip: rigid flop.' },
      R.scene, cam(58, [-1.85, 0.6, 0.2], [-0.5, 0.46, -1.1])); }
  // S10b 36.0-43.9: Pip up in front of her, pointing at the desk (where the phone will sleep); she glances at him
  { const R = bedroom('day', { clock: '11:56', mat: true }); const g = sitEdge(R.scene, 'sit_slumped', 1.0, 'glance', 'neutral', -1.1);
    gnomeAt(R.scene, -0.85, 0, -0.85, -2.03, 'point', 1.19, 'deadpan', 'talkM');
    shot({ id: '10b', t: [36.0, 43.9], who: 'PIP / GIRL / PIP', line: 'And that bunks over there.', line2: "GIRL: That's the trick?  PIP: Eh. The proper term is nudge.", clip: 'Pip point (end) -> talk; girl sit_slumped', face: 'Pip deadpan / talkM; girl glance', note: '' },
      R.scene, cam(58, [-1.85, 0.6, 0.2], [-0.5, 0.46, -1.1])); }
  // S11 43.9-46.0: she has left the phone on the nightstand, sits with hands in her lap; Pip's hat at the bottom left
  { const R = bedroom('day', { clock: '11:57', mat: true }); const g = sitEdge(R.scene, 'sit_reach_side', 0.8, 'gazeR', 'neutral', -1.4);
    { const P = g.world('Hand.R', [0, 0.5, 0]); const ph = phone(false); ph.rotation.set(-Math.PI / 2, 0, 0.3); ph.position.set(P.x, NS.h + 0.006, P.z); R.scene.add(ph); }
    gnomeAt(R.scene, -0.85, 0, -1.55, faceTo([-0.85, -1.55], [-0.3, -1.15]), 'idle', 0.3, 'deadpan', 'neutral');
    const E = g.world('Head'); shot({ id: '11', t: [43.9, 46.0], who: '-', line: '', clip: 'sit_reach_side (new clip, frame 24: phone set on the nightstand)', face: 'gazeR / neutral', note: '' },
      R.scene, cam(60, [-1.4, 1.0, -0.75], [E.x + 0.05, E.y - 0.22, E.z - 0.15])); }
  // S12 46.0-47.0 night: asleep on her side under the quilt
  { const R = bedroom('night', { clock: '10:47', phoneOnNS: true, mat: true }); const g = character('girl', { tint: NIGHT_TINT, shadow: 0 }); g.pose('lie_back', 1.0, 'blink', 'neutral');
    g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.25); R.scene.add(g.root); R.quilt(-1.5, -0.2, 0.34, 0x9098c8, -0.42, 0.44);
    const E = g.world('Head'); shot({ id: '12', t: [46.0, 47.0], who: '-', line: '', clip: 'lie_back (quilt to the chest)', face: 'blink (asleep)', note: 'Dissolve from 11.' },
      R.scene, cam(66, [E.x - 0.75, E.y + 1.1, E.z + 0.9], [E.x + 0.05, E.y - 0.1, E.z + 0.35])); }
  // S13 47.0-47.6 night: clock insert 10:47
  { const R = bedroom('night', { clock: '10:47', phoneOnNS: true });
    shot({ id: '13', t: [47.0, 47.6], who: '-', line: '', clip: '-', face: '-', note: 'Ref clock 10:58 -> ours 10:47.' },
      R.scene, cam(50, [NS.x + 0.25, NS.h + 0.32, NS.z + 0.55], [NS.x + 0.04, NS.h + 0.03, NS.z + 0.04])); }
  // S14 47.6-49.0 night: Pip on the desk by the CRT, smug, her phone charging in front of him (he moved it)
  { const R = bedroom('night', { clock: '10:48', phoneOnDesk: true }); gnomeAt(R.scene, DESK.x - 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 + 0.3, 'idle', 0.3, 'skeptical', 'smirk', 0xa8b0e0);
    const pl = new THREE.PointLight(0x9cc4ff, 1.2, 1.0); pl.position.set(DESK.x + 0.25, DESK.h + 0.15, DESK.z - 0.12); R.scene.add(pl);
    shot({ id: '14', t: [47.6, 49.0], who: '-', line: '', clip: 'Pip idle', face: 'skeptical / smirk', note: '' },
      R.scene, cam(62, [DESK.x + 1.0, DESK.h + 0.18, DESK.z - 0.75], [DESK.x - 0.05, DESK.h + 0.3, DESK.z - 0.1])); }
  // S15 49.0-50.0 day: Pip on the desk, arms out (morning "ta-da")
  { const R = bedroom('day', { clock: '8:24', phoneOnDesk: true }); gnomeAt(R.scene, DESK.x - 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 + 0.3, 'shrug', 1.19, 'happy', 'smile');
    shot({ id: '15', t: [49.0, 50.0], who: '-', line: '', clip: 'Pip shrug (end)', face: 'happy / smile', note: 'Ref: arms raised (stretch). No cheer clip for Pip: shrug arms-out pose.' },
      R.scene, cam(62, [DESK.x + 1.0, DESK.h + 0.25, DESK.z - 0.8], [DESK.x - 0.05, DESK.h + 0.3, DESK.z - 0.15])); }
  // S16 50.0-51.0 day: high angle on the bed, she sleeps, the mat on the floor, clock 8:24
  { const R = bedroom('day', { clock: '8:24', mat: true }); const g = character('girl', { shadow: 0 }); g.pose('lie_back', 1.0, 'blink', 'neutral');
    g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.25); R.scene.add(g.root); R.quilt(-1.32, -0.2, 0.4, 0xffffff, -0.4, 0.46);
    shot({ id: '16', t: [50.0, 51.0], who: '-', line: '', clip: 'lie_back', face: 'blink (asleep)', note: 'Ref clock 8:30 -> 8:24.' },
      R.scene, cam(72, [-1.1, 1.75, -0.1], [-0.1, 0.35, -1.45])); }
  // S17 51.0-52.6 day: her boots come down onto the yoga mat
  { const R = bedroom('day', { clock: '8:25', mat: true }); sitEdge(R.scene, 'sit_slumped', 1.0, 'half', 'neutral', -1.0);
    shot({ id: '17', t: [51.0, 52.6], who: '-', line: '', clip: 'sit_slumped (feet on the mat)', face: '-', note: 'Ref: feet into sneakers -> boots onto the mat.' },
      R.scene, cam(60, [-0.98, 0.52, -0.62], [-0.48, 0.1, -1.0])); }
  // S18 52.6-53.6 day: standing up, torso, cut at the head
  { const R = bedroom('day', { clock: '8:25', mat: true }); const g = character('girl'); g.pose('idle_sway', 0.4, 'open', 'neutral'); g.root.position.set(-0.5, 0.012, -1.0); g.root.rotation.y = -Math.PI / 2; R.scene.add(g.root);
    shot({ id: '18', t: [52.6, 53.6], who: '-', line: '', clip: 'idle_sway', face: '-', note: '' },
      R.scene, cam(60, [-1.35, 0.95, -0.7], [-0.5, 0.92, -1.05])); }
  // S19 53.6-60.4 day: at the desk. Pip stands by the charging phone; she leans toward him
  { const R = bedroom('day', { clock: '8:26', phoneOnDesk: true, mat: true }); const n = gnomeAt(R.scene, DESK.x + 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 - 0.2, 'nod', 0.5, 'happy', 'smile');
    const g = character('girl'); g.pose('lean_reach', 0.55, 'shy', 'talkSmall'); g.root.position.set(-1.0, 0, -0.25); g.root.rotation.y = -0.35; R.scene.add(g.root);
    shot({ id: '19', t: [53.6, 60.4], who: 'GIRL / PIP', line: '...Is this counting?', line2: 'PIP: Yep. That counts.', clip: 'girl lean_reach (0.55 s, mid-lean); Pip nod', face: 'girl shy / talkSmall; Pip happy / smile', note: '' },
      R.scene, cam(56, [0.6, 0.95, 1.6], [-1.42, 0.88, 0.3])); }
  // S20 60.4-61.6 day: she walks past the desk toward the door
  { const R = bedroom('day', { clock: '8:26', phoneOnDesk: true, mat: true }); gnomeAt(R.scene, DESK.x + 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 + 0.6, 'idle', 0.3, 'deadpan', 'neutral');
    const g = character('girl'); g.pose('walk', 0.3, 'open', 'softSmile'); g.root.position.set(-0.6, 0, 1.2); g.root.rotation.y = Math.PI / 2; R.scene.add(g.root);
    shot({ id: '20', t: [60.4, 61.6], who: '-', line: '', clip: 'walk', face: 'open / softSmile', note: '' },
      R.scene, cam(62, [0.5, 1.15, 0.1], [-0.9, 1.0, 1.1])); }
  // S21 61.6-63.6 day: from behind, she walks to the open door full of light
  { const R = bedroom('day', { clock: '8:27', mat: true, doorOpen: 1.25 }); const g = character('girl'); g.pose('walk', 0.9, 'open', 'neutral'); g.root.position.set(1.15, 0, 1.15); g.root.rotation.y = Math.PI / 2; R.scene.add(g.root);
    shot({ id: '21', t: [61.6, 63.6], who: '-', line: '', clip: 'walk (from behind)', face: '-', note: 'No door-opening clip: door already open, hallway light.' },
      R.scene, cam(62, [-0.2, 1.3, 1.25], [1.9, 1.05, 1.1])); }
  // S22 63.6-65.6 day: the empty desk, Pip by the phone, chair in the foreground, notes on the wall
  { const R = bedroom('day', { clock: '8:28', phoneOnDesk: true, mat: true }); gnomeAt(R.scene, DESK.x + 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 + 0.25, 'talk', 0.3, 'deadpan', 'talkA');
    shot({ id: '22', t: [63.6, 65.6], who: 'PIP', line: 'Champions are awake by four.', clip: 'Pip talk', face: 'deadpan / talkA', note: '' },
      R.scene, cam(62, [-0.3, 1.15, 1.7], [-1.55, 1.0, 0.75])); }
  // S23 65.6-72.7 day: Pip close-up, slow push-in, warm closed-eye smile on the last line
  { const R = bedroom('day', { clock: '8:28', phoneOnDesk: true, mat: true }); const n = gnomeAt(R.scene, DESK.x + 0.05, DESK.h, DESK.z - 0.3, Math.PI / 2 + 0.25, 'idle', 0.3, 'happy', 'smile');
    const E = n.world(MENTOR.head_bone); const d = V3(Math.sin(Math.PI / 2 + 0.25), 0, Math.cos(Math.PI / 2 + 0.25));
    shot({ id: '23', t: [65.6, 72.7], who: 'PIP', line: 'Just beating yesterday is plenty.', line2: '(before it) PIP: Scratch that.', clip: 'Pip idle', face: 'happy / smile (final); skeptical / smirk on "Scratch that."', note: '' },
      R.scene, cam(45, [E.x + d.x * 0.85, E.y + 0.12, E.z + d.z * 0.85], [E.x, E.y + 0.06, E.z])); }
}
