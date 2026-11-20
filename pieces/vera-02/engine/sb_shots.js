// vera-02 "THE LAST CUP" storyboard shots: one still per shot at its final framing (MOONLITE DINER, rainy night).
// window.SB[i] = { id, who, line, clip, face, lens, note } (times come from work/timeline.json in tools/compose.py).
// Lenses (9:16 vertical): 28 mm = 66 deg vertical FOV (wides), 35 mm = 54, 50 mm = 40 (close-ups, bg blurred via shot.dof).
export function buildShots(L) {
  const { addShot, diner, character, holdAt, mug, coffeePot, umbrella, towel, rag, cam, box, lam, basic, mesh, TX, POT, DOOR, BOOTH, JUKE, TABLE_H, WX, V3, THREE } = L;
  const SB = window.SB = [];
  const QS = new URLSearchParams(location.search);
  const F28 = 66, F35 = 54, F50 = 40;
  const WARM = 0xfff0dc, DOORT = 0xd4dcf0, WET = 0xe8ecf6, NEON = 0xffc4de;   // per-shot character tint: amber interior / cool rainy doorway / damp / jukebox glow
  const faceTo = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);   // ry so +z looks from -> to (x, z)
  let CHARS = [];
  // ---- FILM mode (sb.html?film): same shots, animated on engine/film_timeline.json (film pass, after the board is approved) ----
  const TL = L.TL, FPS = 30, SH = TL ? Object.fromEntries(TL.shots.map((x) => [x.id, x])) : {};
  const LOOP = /idle|hip_tilt|doorframe|sit_chair|sit_talk|hold_object|hold_cup|fan_collar|talk_nervous|talk_side|talk$/;
  const mouthLv = (spk, T) => (TL ? +(TL.mouth[spk][Math.floor(T * FPS)] || 0) : 0);
  const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const PUSH = { '01': 0.03, '03': 0.06, '05': 0.03, '07': 0.05, '11': 0.06, '13': 0.05, '16': 0.04, '18': 0.02, '21': 0.14, '22': 0.05, '24': 0.06, '25': 0.05, '26': 0.1, '27': 0.04 };
  const MOSAIC = { '02': 0.24, '14': 0.24, '18': 0.24 };
  function filmUpdate(id, actors, camera, extra) {
    const dur = SH[id].t1 - SH[id].t0, base = camera.position.clone(), dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const quat = camera.quaternion.clone(), focus = extra.dof ? extra.dof.focus : (extra.pushDist ?? 3), push = PUSH[id] ?? 0.04;
    return (lt, T, ltReal) => {
      for (const a0 of actors) {
        let a = a0; const c = a.c, clip = THREE.AnimationClip.findByName(L.CH[a.kind].clips, a.clip), D = clip ? clip.duration : 1;
        let ct = a.act ? lt - a.act.start : a.t - 0.45 * dur + lt; ct = LOOP.test(a.clip) && !a.act ? ((ct % D) + D) % D : Math.min(D - 1e-3, Math.max(0, ct));
        if (a.move) { const k = ease((lt - a.move.t0) / (a.move.t1 - a.move.t0)); c.root.position.x = a.move.from[0] + (a.move.to[0] - a.move.from[0]) * k; c.root.position.z = a.move.from[1] + (a.move.to[1] - a.move.from[1]) * k;
          if (lt > a.move.t0 && lt < a.move.t1) { a = { ...a, clip: 'walk' }; ct = (lt - a.move.t0) % L.CH[a.kind].clips.find((x) => x.name === 'walk').duration; } else if (lt >= a.move.t1 && a.move.after) { c.root.rotation.y = a.move.after[0]; a = { ...a, clip: a.move.after[1] }; ct = Math.min(a.move.after[2] + lt - a.move.t1, 2); } }
        const blush = /\+blush/.test(a.mouth) ? '+blush' : '', spk = a.kind === 'vera' ? 'V' : 'T', lv = mouthLv(spk, T), fr = Math.floor(T * FPS);
        let eyes = a.eyes, mouth = a.mouth;
        if (lv > 0) mouth = (lv === 1 ? 'talkSmall' : ['talkA', 'talkO', 'talkSmall'][(fr >> 2) % 3]) + blush;
        else if (/^talk/.test(mouth)) mouth = (a.kind === 'vera' ? 'smirk' : 'neutral') + blush;
        const per = 3.4 + (a.kind === 'vera' ? 0.0 : 0.9), ph = (T + (a.kind === 'vera' ? 0.4 : 1.7)) % per;
        if (ph < 0.12 && !['22', '25', '26'].includes(id) && !/blink|happy|wink|hearts|closed|relaxed/.test(eyes)) eyes = 'blink' + (/\+blush/.test(eyes) ? '+blush' : '');
        c.pose(a.clip, ct, eyes, mouth);
        if (a.seat) { const P = c.world('Pelvis'); c.root.position.x += a.seat[0] - P.x; c.root.position.z += a.seat[1] - P.z; c.root.updateMatrixWorld(true); }
        for (const f of c.fix || []) f();
        if (c.onT) c.onT(ct);
        for (const h of c.holds || []) h();
      }
      const k = ease(ltReal / Math.max(0.5, dur));
      camera.position.copy(base).addScaledVector(dir, focus * push * k);
      camera.position.x += 0.004 * Math.sin(ltReal * 2.3 + id.length); camera.position.y += 0.003 * Math.sin(ltReal * 1.7 + 1.1);
      camera.quaternion.copy(quat); camera.updateMatrixWorld(true);
      if (extra.custom) extra.custom(lt, T, ltReal);
    };
  }

  const ONLY = QS.get('only'); const shot = (meta, scene, camera, extra = {}) => {
    camera.updateMatrixWorld(true); meta.heads = CHARS.filter((c) => c.root.parent).map((c) => { const H = c.world('Head', [0, 0.45, 0.1]), T = c.world('Head', [0, 1.6, 0.1]);
      const p = H.clone().project(camera), q = T.clone().project(camera); return [Math.round((p.x + 1) / 2 * 1080), Math.round((1 - p.y) / 2 * 1920), Math.round(Math.hypot(p.x - q.x, (p.y - q.y) * 16 / 9) * 540), p.z < 1 ? 1 : 0]; });
    const actors = CHARS.filter((c) => c.root.parent && c.anim).map((c) => ({ c, ...c.anim })); CHARS = []; if (!TL && extra.custom) extra.custom(meta.stillT ?? 0, 0, meta.stillT ?? 0);
    if (TL) { const S = SH[meta.id], upd = filmUpdate(meta.id, actors, camera, extra); SB.push(meta); addShot(scene, camera, { ...extra, t0: S.t0, mosaic: MOSAIC[meta.id] || 0, fadeOut: meta.id === '27' ? 1.4 : 0, fadeAt: S.t1 - S.t0, update: upd }); return; }
    if (ONLY && !ONLY.split(',').includes(meta.id)) return; SB.push(meta); addShot(scene, camera, extra); };
  // a held prop that follows its bone every frame in the film (levelRy: keep the prop upright with this yaw)
  const hold = (scene, c, bone, prop, off, rot, levelRy) => {
    const f = () => { holdAt(scene, c, bone, prop, off, rot); if (levelRy !== undefined) prop.rotation.set(0, levelRy, 0); };
    f(); (c.holds = c.holds || []).push(f); return prop; };
  const put = (scene, kind, clip, t, eyes, mouth, x, z, ry, tint = WARM, shadow = 0.5) => {
    const c = character(kind, { tint, shadow }); CHARS.push(c); c.anim = { kind, clip, t, eyes, mouth }; c.pose(clip, t, eyes, mouth); c.root.position.set(x, 0, z); c.root.rotation.y = ry; if (!QS.has('nochar')) scene.add(c.root); c.root.updateMatrixWorld(true); return c; };
  const head = (c) => c.world('Head', [0, 0.45, 0.1]);
  const cu = (c, d, yaw, dy, fov = F50, look = [0, 0, 0], roll = 0) => {
    const E = head(c), ry = c.root.rotation.y + yaw; const p = [E.x + Math.sin(ry) * d, E.y + dy, E.z + Math.cos(ry) * d];
    return cam(fov, p, [E.x + look[0], E.y + look[1], E.z + look[2]], roll); };
  const dofAt = (camera, c, range = 0.2, max = 2.6) => ({ dof: { focus: camera.position.distanceTo(head(c)), range, max } });
  const seat = (scene, kind, clip, t, eyes, mouth, cx, cz, ry, dy = 0, tint = WARM) => {
    const c = put(scene, kind, clip, t, eyes, mouth, cx, cz, ry, tint); const P = c.world('Pelvis');
    c.root.position.x += cx - P.x; c.root.position.z += cz - P.z; c.root.position.y = dy; c.shadow.visible = false; c.root.updateMatrixWorld(true); c.anim.seat = [cx, cz]; return c; };

  // ---- two-bone IK (UpperArm -> Forearm -> Hand), from vera-01 v2 ----
  const _v = (x, y, z) => new THREE.Vector3(x, y, z);
  function ik2(c, side, target, pole) {
    const A = c.bone('UpperArm.' + side), B = c.bone('Forearm.' + side), C = c.bone('Hand.' + side); c.root.updateMatrixWorld(true);
    const a = A.getWorldPosition(_v()), b = B.getWorldPosition(_v()), cc = C.getWorldPosition(_v());
    const l1 = a.distanceTo(b), l2 = b.distanceTo(cc), t = target.clone(), d = Math.min(t.distanceTo(a), l1 + l2 - 1e-4), dir = t.clone().sub(a).normalize();
    const cosA = Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), ang = Math.acos(cosA);
    if (QS.has('ikdbg') && Math.random() < 0.05) console.log('IK', side, 'arm', (l1 + l2).toFixed(3), 'dist', t.distanceTo(a).toFixed(3), 'sh', a.toArray().map((x) => x.toFixed(2)).join(','), 'tg', t.toArray().map((x) => x.toFixed(2)).join(','));
    const pn = pole.clone().sub(a); pn.sub(dir.clone().multiplyScalar(pn.dot(dir))).normalize();
    const elbow = a.clone().add(dir.clone().multiplyScalar(Math.cos(ang) * l1)).add(pn.multiplyScalar(Math.sin(ang) * l1));
    const rot = (bone, from, to) => { const q = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize()), wq = bone.getWorldQuaternion(new THREE.Quaternion()), pq = bone.parent.getWorldQuaternion(new THREE.Quaternion());
      bone.quaternion.copy(pq.invert().multiply(q.multiply(wq))); bone.updateMatrixWorld(true); };
    rot(A, b.clone().sub(a), elbow.clone().sub(a));
    const b2 = B.getWorldPosition(_v()), c2 = C.getWorldPosition(_v()); rot(B, c2.clone().sub(b2), t.clone().sub(b2));
  }
  // arm graft: the clavicle/arm/hand local rotations of another clip on top of the current pose (a seated "point", a seated "hold")
  const ARM = (s) => ['Clavicle.' + s, 'UpperArm.' + s, 'Forearm.' + s, 'Hand.' + s];
  function graft(c, clip, t, sides, base) {   // base = [clip, t, eyes, mouth] of the body pose
    const f = () => { c.pose(clip, t); const q = {}; for (const s of sides) for (const n of ARM(s)) q[n] = c.bone(n).quaternion.clone();
      const ct = c.anim ? c.anim._ct : undefined; void ct; c.pose(base[0], base[1], base[2], base[3]);
      for (const n in q) c.bone(n).quaternion.copy(q[n]); c.root.updateMatrixWorld(true); };
    f(); return f; }
  const fix = (c, f) => { f(); (c.fix = c.fix || []).push(f); };
  // ---- v2 engine-side keyframed clips (user: "when you need an animation, CREATE IT"): a body clip pose + spine lean + hand IK to
  // exact contact points on the props, sampled at 30 fps into a real THREE.AnimationClip (quaternion + position tracks of every bone)
  // that the mixer plays like the GLB clips. The props follow the same clock (c.onT), so palm and prop meet on the contact frames.
  const kv = (t, K) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) { const [t0, a] = K[i], [t1, b] = K[i + 1];
    if (t <= t1) { const k = ease((t - t0) / Math.max(1e-6, t1 - t0)); return typeof a === 'number' ? a + (b - a) * k : a.clone().lerp(b, k); } } return K[K.length - 1][1]; };
  const lp = (c, x, y, z) => c.root.localToWorld(V3(x, y, z));                 // character-local point (x = her left, z = forward)
  const ld = (c, x, y, z) => V3(x, y, z).applyQuaternion(c.root.quaternion).normalize();
  function setWorldQ(bone, q) { const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pq.invert().multiply(q)); bone.updateMatrixWorld(true); }
  function aimHand(c, side, fingers, palm) {   // Hand.X local +y = fingers, local +z = palm normal (out of the palm)
    const y = fingers.clone().normalize(), z = palm.clone().sub(y.clone().multiplyScalar(palm.dot(y))).normalize(), x = new THREE.Vector3().crossVectors(y, z);
    setWorldQ(c.bone('Hand.' + side), new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z))); }
  const PALM = [0, 0.5, 0.18];
  function reachPalm(c, side, P, fingers, palm, pole, off = PALM) {
    const H = c.bone('Hand.' + side); let err = 0;
    for (let k = 0; k < 3; k++) { aimHand(c, side, fingers, palm); const w = H.getWorldPosition(V3(0, 0, 0)), o = H.localToWorld(V3(...off)).sub(w);
      ik2(c, side, P.clone().sub(o), pole); aimHand(c, side, fingers, palm); err = H.localToWorld(V3(...off)).distanceTo(P); }
    return err; }
  const palmAt = (c, side, off = PALM) => { c.root.updateMatrixWorld(true); return c.bone('Hand.' + side).localToWorld(V3(...off)); };
  function lean(c, ang, bone = 'Spine') { const b = c.bone(bone), ry = c.root.rotation.y, axis = V3(Math.cos(ry), 0, -Math.sin(ry));
    setWorldQ(b, new THREE.Quaternion().setFromAxisAngle(axis, ang).multiply(b.getWorldQuaternion(new THREE.Quaternion()))); }
  const BAKED = {};
  function bake(c, name, dur, fn) {   // fn(t) poses c for clip time t; returns the clip (registered on the kind)
    const bones = []; c.model.traverse((o) => { if (o.isBone) bones.push(o); });
    const n = Math.round(dur * 30) + 1, times = new Float32Array(n), Q = bones.map(() => new Float32Array(n * 4)), P = bones.map(() => new Float32Array(n * 3)); let worst = 0; const bad = [];
    for (let i = 0; i < n; i++) { const t = i / 30; times[i] = t; const e_ = fn(t) || 0; if (e_ > 0.02) bad.push(t.toFixed(2) + ':' + (e_ * 100).toFixed(0)); worst = Math.max(worst, e_); c.root.updateMatrixWorld(true); bones.forEach((b, k) => { b.quaternion.toArray(Q[k], i * 4); b.position.toArray(P[k], i * 3); }); }
    const tracks = []; bones.forEach((b, k) => { tracks.push(new THREE.QuaternionKeyframeTrack(b.name + '.quaternion', times, Q[k])); tracks.push(new THREE.VectorKeyframeTrack(b.name + '.position', times, P[k])); });
    const clip = new THREE.AnimationClip(name, dur, tracks); const list = L.CH[c.kind].clips; const j = list.findIndex((x) => x.name === name); if (j >= 0) list.splice(j, 1); list.push(clip);
    BAKED[name] = { dur, worstContactCm: Math.round(worst * 1000) / 10 }; console.log('BAKED', name, JSON.stringify(BAKED[name]), bad.slice(0, 12).join(' ')); return clip; }
  // play a baked clip on c from shot time `start`; still at clip time t
  const useClip = (c, name, t, start, eyes, mouth) => { c.anim.clip = name; c.anim.t = t; c.anim.act = { start }; c.anim.eyes = eyes; c.anim.mouth = mouth; c.pose(name, t, eyes, mouth); };
  // rain drips off Theo (soaked): little drops under his hair + chin, and a puddle at his feet
  const dripM = () => basic(null, 0xbfe0ff, { transparent: true, opacity: 0.85 });
  function soaked(scene, c, puddle = true) {
    const E = head(c), r = [[0.07, -0.13, 0.03], [-0.08, -0.16, 0.0], [0.02, -0.24, 0.07], [-0.04, -0.33, 0.05], [0.09, -0.3, -0.02], [0.15, -0.62, 0.05]];
    const ds = r.map(() => box(0.008, 0.026, 0.008, dripM(), 0, 0, 0, scene));
    const f = () => { const H = head(c), T = L.UT ? L.UT.value : 0; r.forEach(([dx, dy, dz], i) => { const fall = TL ? ((T * 1.3 + i * 0.37) % 1) * 0.35 : 0; ds[i].position.set(H.x + dx, H.y + dy - fall, H.z + dz); }); };
    f(); (c.holds = c.holds || []).push(f); void E;
    if (puddle) { const p = mesh(new THREE.CircleGeometry(0.3, 12), basic(null, 0x8ab0d8, { transparent: true, opacity: 0.35, depthWrite: false }), c.root.position.x, 0.004, c.root.position.z + 0.05, scene); p.rotation.x = -Math.PI / 2; p.scale.set(1.3, 1, 1); }
  }
  const DOORIN = { x0: 3.55, x1: 2.45, open: 0.5, walk: 0.55, speed: 0.74 };

  // positions
  const VB = [0.15, -2.42];         // Vera behind the counter
  const TF = [0.1, -0.92];          // Theo at the counter front (between two stools)
  const TJ = [-1.78, 0.18];   // in front of the jukebox's glowing face         // Theo at the jukebox
  const VSEAT = [2.3, BOOTH.tz - BOOTH.seatOff], TSEAT = [2.3, BOOTH.tz + BOOTH.seatOff];   // her bench faces +z, his faces -z
  const MUG = [2.28, TABLE_H, BOOTH.tz + 0.16];   // his cup on the booth table
  const UMB_T = { pos: V3(2.0, TABLE_H + 0.05, BOOTH.tz - 0.2), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 1.9, 0, 'YXZ')) };   // hook + tag toward her, canopy to the window
  const TOWEL_T = V3(2.4, TABLE_H, BOOTH.tz - 0.3);   // the folded towel on the table (18-24), picked up in 25
  const tableProps = (R, { mugOn = true, umbOn = false, towelOn = true } = {}) => {
    if (mugOn) { const m = mug({ coffee: true }); m.position.set(...MUG); m.rotation.y = -0.6; R.scene.add(m); }
    let u = null; if (umbOn) { u = umbrella('read'); u.quaternion.copy(UMB_T.q); u.position.copy(UMB_T.pos); R.scene.add(u); u.updateMatrixWorld(true); }
    if (towelOn) { const t = towel(); t.position.copy(TOWEL_T); R.scene.add(t); }
    return u; };

  if (QS.has('coververa')) {   // delivery cover (user): Vera facing the camera, eyes open to the viewer
    const R = diner(); const v = put(R.scene, 'vera', 'flirt_hip_tilt', 1.6, 'open', 'smirk', VB[0], VB[1], 0);
    const E = head(v); const c = cam(40, [E.x, E.y - 0.1, E.z + 1.6], [E.x, E.y - 0.3, E.z]);
    SB.push({ id: 'coververa' }); addShot(R.scene, c, dofAt(c, v, 0.3, 1.6)); return;
  }
  if (QS.has('set')) {   // set stills: empty diner, wide + window/booth + counter + exterior
    { const R = diner(); SB.push({ id: 'set_wide' }); addShot(R.scene, cam(F28, [-2.4, 1.75, 2.7], [1.3, 0.95, -0.9])); }
    { const R = diner(); SB.push({ id: 'set_booth' }); addShot(R.scene, cam(F28, [0.4, 1.6, -0.6], [2.7, 1.1, 1.4])); }
    { const R = diner(); SB.push({ id: 'set_counter' }); addShot(R.scene, cam(F35, [1.4, 1.45, 0.4], [-0.9, 1.25, -2.4])); }
    { const R = diner(); SB.push({ id: 'set_exterior' }); addShot(R.scene, cam(F28, [7.4, 1.5, 3.6], [3.0, 1.35, 0.9])); }
    return;
  }

  // 01 HOOK (v2: closer 35 mm wide): Vera drying a mug behind the end of the counter, the door open on the rain, Theo soaked on the mat
  { const R = diner({ doorOpen: -1.15 }); const VW = [0.7, -2.25], TD = [2.25, -1.15];
    const v = put(R.scene, 'vera', 'hold_object', 0.8, 'half', 'neutral', VW[0], VW[1], faceTo(VW, TD) - 0.35);
    hold(R.scene, v, 'Hand.R', mug(), [0, 0.75, 0.2], [0, 0, 0], 0.4); hold(R.scene, v, 'Hand.L', rag(), [0, 0.8, 0.25], [0, 0, 0], 0.9);
    const th = put(R.scene, 'theo', 'idle_stiff', 0.6, 'open', 'talkSmall', TD[0], TD[1], faceTo(TD, VW) + 0.3, DOORT); soaked(R.scene, th, !TL);
    th.anim.move = { from: [3.5, -1.2], to: TD, t0: 0.5, t1: 2.2, after: [faceTo(TD, VW) + 0.3, 'idle_stiff', 0.3] }; if (TL) th.root.rotation.y = -Math.PI / 2;
    const door = R.door, bell = R.bell;
    const custom = (lt, T, ltReal) => { if (!TL) return; door.rotation.y = -1.15 * ease((ltReal - 0.3) / 0.45); bell.rotation.x = ltReal > 0.3 ? 0.45 * Math.sin((ltReal - 0.3) * 13) * Math.exp(-(ltReal - 0.3) * 1.6) : 0; };
    shot({ id: '01', who: 'THEO', line: 'Sorry… are you still open?', clip: 'Theo walks in from the rain (walk) -> idle_stiff on the mat; Vera hold_object, mug in Hand.R + rag in Hand.L', face: 'Theo open / talkSmall; Vera half / neutral',
      lens: '35 mm wide over the stools', note: 'Bell + rain. Door swings open at 0.3 s, Theo in by 2.2 s, drips + puddle. Title card EPISODE 2 / The Last Cup.' },
      R.scene, cam(F35, [-1.0, 1.5, 1.9], [0.7, 1.05, -0.57]), { custom }); }
  // 02 INSERT: the carafe with ONE cup left on its warmer; the umbrella hangs on the peg behind the counter, tag turned away (planted)
  { const R = diner(); const P = V3(POT.x, 1.12, POT.z); const c = cam(F50, [POT.x - 0.22, 1.16, -1.08], [POT.x + 0.2, 1.24, POT.z - 0.4]);
    shot({ id: '02', who: '-', line: '', clip: '-', face: '-', lens: '50 mm insert, bg soft', note: 'Pixel-mosaic IN. One cup of coffee left in the pot. Behind, on the back wall peg: a navy umbrella with a kraft tag turned away (planted, not read).' },
      R.scene, c, { dof: { focus: c.position.distanceTo(P), range: 0.15, max: 1.4 } }); }
  // 03 Vera leans on the counter, low angle, push-in: "For you? Dry off first."
  { const R = diner(); const v = put(R.scene, 'vera', 'flirt_lean_in', 1.1, 'smug', 'talkSmall', VB[0], VB[1], faceTo(VB, TF));
    const th = put(R.scene, 'theo', 'idle_stiff', 0.6, 'open', 'neutral', TF[0], TF[1], faceTo(TF, VB), WET); void th;
    const c = cu(v, 1.55, -0.3, -0.12, F50, [0, -0.08, 0]);
    shot({ id: '03', who: 'VERA', line: 'For you? Dry off first.', clip: 'flirt_lean_in (1.1 s)', face: 'smug / talkSmall', lens: '50 mm, low angle, slow push-in', note: 'Catchphrase PLANTED ("Dry off first."). Umbrella on its peg soft behind her.' },
      R.scene, c, dofAt(c, v)); }
  // 04 Theo dripping, plays it cool
  { const R = diner(); const t = put(R.scene, 'theo', 'shrug', 0.55, 'smiling', 'talkSmall', TF[0], TF[1], faceTo(TF, VB), WET); soaked(R.scene, t);
    const c = cu(t, 1.6, 0.3, 0.22, F50, [0, -0.17, 0]);
    shot({ id: '04', who: 'THEO', line: 'I’m fine. It’s just a little rain.', clip: 'shrug (0.55 s)', face: 'smiling / talkSmall', lens: '50 mm, slight high angle (her eye line)', note: 'Drops falling off his hair, puddle on the checker floor. Rainy window soft behind.' },
      R.scene, c, dofAt(c, t)); }
  // 05 THE TOSS (v2: new clip toss_towel + Theo receive_object): profile two-shot across the counter, the towel in the air
  { const R = diner(); const v = put(R.scene, 'vera', 'idle_sway', 1.2, 'smug', 'talkSmall', VB[0], VB[1], faceTo(VB, TF));
    const t = put(R.scene, 'theo', 'receive_object', 0.3, 'surprised', 'parted', TF[0], TF[1], faceTo(TF, VB), WET); soaked(R.scene, t, false);
    const tw = towel(); R.scene.add(tw);
    // Theo's catch: the clip time where his right hand is furthest toward her
    const RC = L.CH.theo.clips.find((x) => x.name === 'receive_object'); let tc = 0, best = -1e9;
    for (let k = 0; k <= 30; k++) { const tt = RC.duration * k / 30; t.pose('receive_object', tt); const h = palmAt(t, 'R'); const d = -h.distanceTo(head(v)); if (d > best) { best = d; tc = tt; } }
    t.pose('receive_object', tc); const CATCH = palmAt(t, 'R').add(V3(0, 0.03, 0)), REL = 0.62, LAND = 1.12;
    bake(v, 'toss_towel', 1.8, (tt) => { v.pose('idle_sway', 1.2);
      const P = kv(tt, [[0, V3(-0.2, 1.02, 0.2)], [0.32, V3(-0.25, 0.97, -0.02)], [REL, V3(-0.16, 1.24, 0.4)], [0.9, V3(-0.13, 1.33, 0.4)], [1.8, V3(-0.13, 1.3, 0.38)]]);
      const up = kv(tt, [[0, 0.0], [0.32, -0.2], [REL, 0.6], [0.9, 0.3]]);
      return reachPalm(v, 'R', lp(v, P.x, P.y, P.z), ld(v, 0.1, -0.4 + up, 1), ld(v, -0.2, 0.6 + up * 0.3, 0.5), lp(v, -0.7, 0.9, -0.2)); });
    const towelAt = (tt) => { if (tt < REL) { const h = palmAt(v, 'R'); tw.position.set(h.x, h.y + 0.01, h.z); tw.rotation.set(0, v.root.rotation.y, 0); return; }
      const p0 = (() => { const keep = tt; void keep; return null; })(); void p0;
      const k = Math.min(1, (tt - REL) / (LAND - REL)), A = TOSS0, B = CATCH; tw.position.set(A.x + (B.x - A.x) * k, A.y + (B.y - A.y) * k + 0.35 * Math.sin(Math.PI * k), A.z + (B.z - A.z) * k); tw.rotation.set(0.6 * k, v.root.rotation.y + 2.4 * k, 0.3 * Math.sin(Math.PI * k)); };
    v.pose('toss_towel', REL); const TOSS0 = palmAt(v, 'R');
    const S0 = 0.3; useClip(v, 'toss_towel', 0.86, S0, 'smug', 'talkSmall'); t.anim.act = { start: S0 + LAND - tc }; t.anim.clip = 'receive_object'; t.anim.t = Math.max(0, 0.86 - LAND + tc); t.pose('receive_object', t.anim.t, 'surprised', 'parted');
    v.onT = towelAt; towelAt(0.86);
    shot({ id: '05', who: 'VERA', line: 'You’re dripping on my floor.', clip: 'Vera toss_towel (NEW engine clip, underhand toss, release 0.62 s); Theo receive_object (catch synced)', face: 'Vera smug / talkSmall; Theo surprised / parted',
      lens: '28 mm, profile two-shot across the counter', note: 'The towel flies on an arc from her palm to his catching hand.' },
      R.scene, cam(76, [2.6, 1.5, -1.6], [0.1, 1.28, -1.74])); }
  // 06 (v2: new clip dry_hair): both hands rub the open towel over his hair (towel = an arch over the crown, hands on its ends)
  { const R = diner(); const t = put(R.scene, 'theo', 'idle_stiff', 0.6, 'shy+blush', 'talkSmall+blush', TF[0], TF[1], faceTo(TF, VB), WET);
    const arch = new THREE.Group(); R.scene.add(arch); const AR = 0.22, tm = lam(TX.towel);
    for (let k = 0; k < 7; k++) { const a = Math.PI * (k + 0.5) / 7; const b = box(0.082, 0.014, 0.24, tm, Math.cos(a) * AR, Math.sin(a) * AR, 0, arch); b.rotation.z = a - Math.PI / 2; }
    let E0 = null;
    const archAt = (tt) => { const ry = t.root.rotation.y, E = E0 || head(t); arch.position.copy(E).add(V3(0, 0.0, 0)).add(V3(Math.sin(ry), 0, Math.cos(ry)).multiplyScalar(-0.03));
      arch.rotation.set(0, ry + Math.PI / 2, 0); arch.rotateZ(0.0); arch.rotateX(0.18 * Math.sin(tt * 9)); arch.updateMatrixWorld(true);
      return [arch.localToWorld(V3(0, 0.02, AR + 0.01)), arch.localToWorld(V3(0, 0.02, -AR - 0.01))]; };
    t.pose('idle_stiff', 0.6); E0 = head(t); const side = ld(t, 1, 0, 0);
    const archPose = (tt) => { const ry = t.root.rotation.y; arch.position.copy(E0).add(V3(0, 0.1, 0)).add(V3(Math.sin(ry), 0, Math.cos(ry)).multiplyScalar(-0.08)); arch.rotation.set(0, ry, 0); arch.rotateX(0.18 * Math.sin(tt * 9)); arch.updateMatrixWorld(true); };
    bake(t, 'dry_hair', 2.6, (tt) => { t.pose('idle_stiff', 0.6); archPose(tt);
      const PL = arch.localToWorld(V3(AR + 0.01, 0.02, 0)), PRr = arch.localToWorld(V3(-AR - 0.01, 0.02, 0));
      const e1 = reachPalm(t, 'L', PL, V3(0, 1, 0), side.clone().negate(), lp(t, 0.6, 1.2, -0.2));
      const e2 = reachPalm(t, 'R', PRr, V3(0, 1, 0), side.clone(), lp(t, -0.6, 1.2, -0.2)); return Math.max(e1, e2); });
    useClip(t, 'dry_hair', 1.0, 0.1, 'shy+blush', 'talkSmall+blush'); t.onT = archPose; archPose(1.0);
    const c = cu(t, 1.45, -0.5, 0.1, F50, [0, -0.1, 0]);
    shot({ id: '06', who: 'THEO', line: 'Right. Sorry. Thank you.', clip: 'dry_hair (NEW engine clip: both palms on the towel ends, rubbing it over his hair)', face: 'shy+blush / talkSmall+blush', lens: '50 mm 3/4', note: 'The towel arches over his crown, clear of the hair.' }, R.scene, c, dofAt(c, t)); }
  // 07 Vera low angle, the pot in the foreground
  { const R = diner(); const VP = [-0.2, -2.42]; const v = put(R.scene, 'vera', 'flirt_hip_tilt', 1.6, 'smug', 'talkA', VP[0], VP[1], faceTo(VP, TF));
    const tw = towel(); tw.position.set(0.3, 1.02, -1.55); R.scene.add(tw);
    const c = cam(F35, [-0.5, 1.22, -1.0], [-0.22, 1.38, -2.42]);
    shot({ id: '07', who: 'VERA', line: 'The last cup comes with conditions.', clip: 'flirt_hip_tilt (1.6 s)', face: 'smug / talkA', lens: '35 mm, low, pot in the foreground', note: 'The carafe (one cup left) big in the lower frame, Vera rising above it.' }, R.scene, c); void v; }
  // 08 Theo frozen, towel round his neck... (towel on the counter by his hand)
  { const R = diner(); const t = put(R.scene, 'theo', 'shock_freeze', 1.15, 'shocked', 'oh', TF[0], TF[1], faceTo(TF, VB), WET);
    const tw = towel(); tw.position.set(0.3, 1.02, -1.55); R.scene.add(tw);
    const c = cu(t, 1.4, 0.05, 0.08, F50, [0, -0.05, 0]);
    shot({ id: '08', who: 'THEO', line: 'Conditions? For coffee?', clip: 'shock_freeze (1.15 s, held)', face: 'shocked / oh', lens: '50 mm, straight on', note: '' }, R.scene, c, dofAt(c, t)); }
  // 09 (v2): over Vera's shoulder from behind the counter: she points at the glowing jukebox, Theo walks over to it
  { const R = diner(); const v = put(R.scene, 'vera', 'point', 0.9, 'smug', 'talkSmall', VB[0], VB[1], faceTo(VB, [JUKE.x, JUKE.z]));
    const mid = [-0.95, -0.4]; const t = put(R.scene, 'theo', 'walk', 0.35, 'open', 'parted', mid[0], mid[1], faceTo(TF, TJ), WET);
    t.anim.move = { from: TF, to: TJ, t0: 0.6, t1: 2.0, after: [faceTo(TJ, [JUKE.x, JUKE.z]), 'idle_stiff', 0.5] }; if (TL) { t.root.position.set(TF[0], 0, TF[1]); }
    const E = head(v); void E;
    shot({ id: '09', who: 'VERA', line: 'One. Pick a song.', clip: 'Vera point (0.9 s) at the jukebox; Theo walk -> the jukebox', face: 'Vera smug / talkSmall; Theo open / parted', lens: '24 mm wide from the front booth', note: 'Condition 1. The jukebox (turned toward the counter) glows on the left, Vera points at it from the counter, Theo crosses to it.' },
      R.scene, cam(74, [-1.2, 1.7, 2.9], [-1.3, 0.95, -0.1])); }
  // 10 Theo at the jukebox, its glow on his face, the lit dome beside him
  { const R = diner(); const t = put(R.scene, 'theo', 'ask_tilt', 0.8, 'gazeR', 'talkSmall', TJ[0], TJ[1], faceTo(TJ, VB) - 0.25, NEON);
    const c = cu(t, 1.25, -0.35, 0.02, F50, [0, -0.12, 0]);
    shot({ id: '10', who: 'THEO', line: 'Something… slow?', clip: 'ask_tilt (0.8 s)', face: 'gazeR / talkSmall', lens: '50 mm, the jukebox glowing behind him', note: 'He turns from the jukebox to ask her. Pink jukebox light on him (tint).' }, R.scene, c, dofAt(c, t, 0.6, 1.6)); }
  // 11 Vera: "Bold choice." smirk
  { const R = diner(); const v = put(R.scene, 'vera', 'flirt_head_tilt', 1.2, 'smug', 'smirk', VB[0], VB[1], faceTo(VB, TJ));
    const c = cu(v, 1.4, 0.55, -0.06, F50, [0, -0.18, 0]);
    shot({ id: '11', who: 'VERA', line: 'Bold choice.', clip: 'flirt_head_tilt (1.2 s)', face: 'smug / smirk', lens: '50 mm 3/4, low', note: 'Brewer + menu sign soft behind.' }, R.scene, c, dofAt(c, v)); }
  // 12 Theo turns back from the jukebox: "Is that bad?" (the glow behind him)
  { const R = diner(); const t = put(R.scene, 'theo', 'talk_nervous', 0.8, 'shy', 'talkSmall', TJ[0], TJ[1], faceTo(TJ, VB), NEON);
    const c = cu(t, 2.2, -0.75, -0.1, F35, [0, -0.45, 0]);
    shot({ id: '12', who: 'THEO', line: 'Is that bad?', clip: 'talk_nervous (0.8 s)', face: 'shy / talkSmall', lens: '35 mm, medium, the jukebox beside him', note: 'Jukebox rim light behind him.' }, R.scene, c, dofAt(c, t)); }
  // 13 Vera wink, low + dutch: her one dutch angle
  { const R = diner(); const v = put(R.scene, 'vera', 'flirt_wink', 0.65, 'wink', 'smirk', VB[0], VB[1], faceTo(VB, TJ));
    const c = cu(v, 1.3, -0.35, -0.12, F50, [0, -0.12, 0], 0.09);
    shot({ id: '13', who: 'VERA', line: 'I didn’t say bad.', clip: 'flirt_wink (0.65 s)', face: 'wink / smirk', lens: '50 mm, low, dutch 5°', note: 'Her one dutch angle.' }, R.scene, c, dofAt(c, v)); }
  // 14 MOSAIC: she has carried the last cup to her booth and sets it down (lean_reach)
  { const R = diner({ pot: false }); const VP = [1.62, BOOTH.tz + 0.1]; const v = put(R.scene, 'vera', 'lean_reach', 0.9, 'smug', 'talkSmall', VP[0], VP[1], Math.PI / 2 - 0.15);
    const m = mug({ coffee: true }); R.scene.add(m);
    fix(v, () => { const h = v.bone('Hand.R').localToWorld(V3(0, 0.75, 0.2)); m.position.set(Math.max(h.x, 2.06), TABLE_H, h.z); });
    const E = head(v); const c = cam(F35, [2.85, 1.12, 1.75], [E.x, E.y - 0.3, E.z]);
    shot({ id: '14', who: 'VERA', line: 'Two. You sit in my booth.', clip: 'lean_reach (0.9 s), the cup under Hand.R on the table', face: 'smug / talkSmall', lens: '35 mm, from the booth', note: 'Pixel-mosaic IN (time skip: the pot is empty, the cup is at the booth). Condition 2.' },
      R.scene, c, { dof: { focus: c.position.distanceTo(E), range: 0.5, max: 1.4 } }); }
  // 15 Theo in the aisle: "Which one is yours?" (the empty booths)
  { const R = diner({ pot: false }); const TP = [0.75, 0.35]; const t = put(R.scene, 'theo', 'ask_tilt', 0.8, 'open', 'talkSmall', TP[0], TP[1], faceTo(TP, [2.0, 1.0]) - 0.3, WARM);
    const c = cu(t, 1.4, 0.45, 0.05, F50, [0, -0.2, 0]);
    shot({ id: '15', who: 'THEO', line: 'Which one is yours?', clip: 'ask_tilt (0.8 s)', face: 'open / talkSmall', lens: '50 mm', note: 'Counter + stools soft behind.' }, R.scene, c, dofAt(c, t)); }
  // 16 (v2: new clip pat_across): seated, she leans over the table and pats the place across from her twice: "The one I'm sitting in."
  { const R = diner({ pot: false }); tableProps(R, { towelOn: false });
    const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'bedroom', 'talkSmall', VSEAT[0], VSEAT[1], 0);
    const PAT = V3(2.2, TABLE_H + 0.006, BOOTH.tz - 0.17); let rest = null;
    bake(v, 'pat_across', 2.2, (tt) => { v.pose('sit_chair', 1.0); if (!rest) rest = palmAt(v, 'R');
      { const lk = kv(tt, [[0, 0], [0.5, 1], [1.6, 1], [2.1, 0]]); lean(v, 0.55 * lk); lean(v, 0.3 * lk, 'Chest'); lean(v, -0.55 * lk, 'Neck'); }
      const up = kv(tt, [[0, 0.12], [0.55, 0.1], [0.7, 0], [0.85, 0.07], [1.0, 0], [1.15, 0.07], [1.3, 0], [1.6, 0.1], [2.2, 0.12]]);
      const P = kv(tt, [[0, rest], [0.5, PAT.clone().add(V3(0, 0.1, 0))], [1.6, PAT.clone().add(V3(0, 0.1, 0))], [2.2, rest]]).clone(); const bl = Math.min(1, Math.min(tt / 0.5, (2.2 - tt) / 0.6));
      if (tt > 0.5 && tt < 1.6) P.y = PAT.y + up; const pd = V3(0, -1, 0).lerp(V3(-0.6, 0, 0.3), 1 - bl);
      return tt > 0.6 && tt < 1.5 ? reachPalm(v, 'R', P, V3(0.1, -0.15, 1), pd, V3(VSEAT[0] - 0.7, 0.7, VSEAT[1] + 0.1)) : (reachPalm(v, 'R', P, V3(0.1, -0.15, 1), pd, V3(VSEAT[0] - 0.7, 0.7, VSEAT[1] + 0.1)), 0); });
    useClip(v, 'pat_across', 0.7, 0.4, 'bedroom', 'talkSmall');
    const E = head(v); const c = cam(F35, [1.1, 1.45, 1.75], [2.25, 0.95, 0.8]);
    shot({ id: '16', who: 'VERA', line: 'The one I’m sitting in.', clip: 'pat_across (NEW engine clip: lean + two pats, palm flat on the table at his place)', face: 'bedroom / talkSmall', lens: '35 mm, from the aisle', note: 'The seat cushion across is ~1.2 m away (out of reach seated), so she pats the table right in front of it.' },
      R.scene, c, { dof: { focus: c.position.distanceTo(E), range: 0.6, max: 1.2 } }); }
  // 17 Theo blushes and sits down across from her
  { const R = diner({ pot: false }); tableProps(R, { towelOn: false });
    const t = seat(R.scene, 'theo', 'sit_down', 0.75, 'shy+blush', 'blushSmile+blush', TSEAT[0], TSEAT[1], Math.PI);
    const c = cu(t, 1.35, 0.55, 0.0, F50, [0, -0.2, 0]);
    shot({ id: '17', who: 'THEO', line: 'Oh… okay.', clip: 'sit_down (0.75 s, halfway down)', face: 'shy+blush / blushSmile+blush', lens: '50 mm', note: '' }, R.scene, c, dofAt(c, t)); }
  // 18 MOSAIC (v2: new clip pour_cup): both seated; she lifts the carafe by its handle, pours the last cup into his mug, sets it back
  { const R = diner({ pot: false }); tableProps(R, { mugOn: false });
    const M = V3(2.3, TABLE_H, BOOTH.tz - 0.06); const m = mug(); m.position.copy(M); m.rotation.y = -0.6; R.scene.add(m); const mc = mug({ coffee: true }); mc.position.copy(M); mc.rotation.y = -0.6; R.scene.add(mc); mc.visible = false;
    const t = seat(R.scene, 'theo', 'sit_talk', 0.5, 'open', 'parted', TSEAT[0], TSEAT[1], Math.PI); void t;
    const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'smug', 'talkSmall', VSEAT[0], VSEAT[1], 0);
    const pot = coffeePot(0.03); R.scene.add(pot); const stream = box(0.007, 1, 0.007, basic(null, 0x3a1a08), 0, 0, 0, R.scene);
    const P0 = V3(2.08, TABLE_H, BOOTH.tz - 0.27), PP = M.clone().add(V3(0.0, 0.2, -0.14)), Q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)), Q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.8, -Math.PI / 2, 0, 'XYZ'));
    const HL = V3(-0.108, 0.12, 0), HP0 = P0.clone().add(HL.clone().applyQuaternion(Q0)), HP1 = V3(M.x, M.y + 0.24, M.z - 0.195);   // handle on the table / handle while pouring
    const potAt = (tt) => { const lift = kv(tt, [[0.45, 0], [1.05, 1], [2.9, 1], [3.45, 0]]), tilt = kv(tt, [[1.05, 0], [1.45, 1], [2.55, 1], [2.9, 0]]);
      const H = HP0.clone().lerp(HP1, lift); H.y += 0.06 * Math.sin(Math.PI * lift); pot.quaternion.copy(Q0).slerp(Q1, tilt); pot.position.copy(H).sub(HL.clone().applyQuaternion(pot.quaternion)); pot.updateMatrixWorld(true);
      const sp = pot.localToWorld(V3(0.075, 0.175, 0)), top = TABLE_H + 0.08, on = tilt > 0.6; stream.visible = on; if (on) { stream.position.set(sp.x, (sp.y + top) / 2, (sp.z + M.z) / 2); stream.scale.y = Math.max(0.01, sp.y - top); }
      mc.visible = tt > 1.9; m.visible = !mc.visible; return H; };
    let rest = null;
    bake(v, 'pour_cup', 3.8, (tt) => { v.pose('sit_chair', 1.0); if (!rest) rest = palmAt(v, 'R'); { const lk = kv(tt, [[0.3, 0], [1.0, 1], [2.9, 1], [3.5, 0]]); lean(v, 0.34 * lk); lean(v, 0.18 * lk, 'Chest'); }
      const G = potAt(tt), reach = kv(tt, [[0, 0], [0.45, 1], [3.45, 1], [3.8, 0]]), P = rest.clone().lerp(G, reach);
      const pq = pot.quaternion, fing = V3(1, 0, 0).applyQuaternion(pq).multiplyScalar(-1).lerp(V3(0, -0.3, 1), 1 - reach), palm = V3(1, 0, 0).applyQuaternion(pq);
      const e = reachPalm(v, 'R', P, V3(0, -1, 0).applyQuaternion(pq).lerp(V3(0.2, -0.3, 1), 1 - reach), palm.lerp(V3(-0.3, 0.3, 0.2), 1 - reach), V3(VSEAT[0] - 0.75, 0.6, VSEAT[1])); void fing;
      return reach > 0.99 ? e : 0; });
    useClip(v, 'pour_cup', 1.8, 0.35, 'smug', 'talkSmall'); v.onT = (tt) => potAt(tt); potAt(1.8);
    shot({ id: '18', who: 'VERA', line: 'Three. Stop forgetting things.', clip: 'Vera pour_cup (NEW engine clip: grip the handle, lift, tilt, pour, set down); Theo sit_talk', face: 'Vera smug / talkSmall; Theo open / parted', lens: '28 mm wide, side (from the aisle)', note: 'Pixel-mosaic IN (now seated). The last cup goes into his mug. Condition 3.' },
      R.scene, cam(F28, [-0.2, 1.4, BOOTH.tz], [2.4, 0.98, BOOTH.tz])); }
  // 19 Theo, seated: "I don't forget things."
  { const R = diner({ pot: false }); tableProps(R); const t = seat(R.scene, 'theo', 'sit_talk', 0.8, 'gazeR', 'talkSmall', TSEAT[0], TSEAT[1], Math.PI);
    const c = cu(t, 1.25, -0.4, 0.06, F50, [0, -0.16, 0]);
    shot({ id: '19', who: 'THEO', line: 'I don’t forget things.', clip: 'sit_talk (0.8 s)', face: 'gazeR / talkSmall', lens: '50 mm', note: 'Rainy window + neon behind him.' }, R.scene, c, dofAt(c, t)); }
  // 20 "No?" (v2: new clip lift_umbrella): she lifts the umbrella from beside her bench and lays it on the table
  { const R = diner({ pot: false, umb: 'none' }); tableProps(R);
    const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'bedroom', 'talkSmall', VSEAT[0], VSEAT[1], 0);
    const u = umbrella('away'); R.scene.add(u);
    const A = V3(1.8, 0.9, 0.6), QA = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.1, 0.4, 0)), B = UMB_T.pos, QB = UMB_T.q;
    const umbAt = (tt) => { const k = kv(tt, [[0.22, 0], [0.98, 1]]); u.position.copy(A.clone().lerp(B, k)); u.position.y += 0.3 * Math.sin(Math.PI * k); u.quaternion.copy(QA).slerp(QB, k); u.updateMatrixWorld(true);
      const T = u.getObjectByName('tag'); if (T) T.rotation.y = Math.PI * (1 - k); return u.localToWorld(V3(0, -0.1, 0)); };
    let rest = null;
    bake(v, 'lift_umbrella', 1.3, (tt) => { v.pose('sit_chair', 1.0); if (!rest) rest = palmAt(v, 'R'); lean(v, kv(tt, [[0, 0], [0.2, 0.2], [0.6, 0.1], [1.0, 0.3], [1.3, 0]]));
      const G = umbAt(tt), reach = kv(tt, [[0, 0], [0.2, 1], [1.02, 1], [1.3, 0]]), ax = V3(0, 1, 0).applyQuaternion(u.quaternion);
      const palm = V3(0, -1, 0).sub(ax.clone().multiplyScalar(-ax.y)).normalize().negate().multiplyScalar(-1);
      const e = reachPalm(v, 'R', rest.clone().lerp(G, reach), new THREE.Vector3().crossVectors(ax, palm).normalize().lerp(V3(0.2, -0.3, 1), 1 - reach), palm.lerp(V3(-0.3, 0.3, 0.2), 1 - reach), V3(VSEAT[0] - 0.8, 0.6, VSEAT[1]));
      return reach > 0.99 ? e : 0; });
    useClip(v, 'lift_umbrella', 0.6, 0.15, 'bedroom', 'talkSmall'); v.onT = umbAt; umbAt(0.6);
    const E = head(v); const c = cam(F35, [VSEAT[0] - 0.35, 1.05, TSEAT[1] - 0.25], [E.x + 0.05, E.y - 0.32, E.z]);
    shot({ id: '20', who: 'VERA', line: 'No?', clip: 'lift_umbrella (NEW engine clip: grip, lift over the table edge, lay it down, let go)', face: 'bedroom / talkSmall', lens: '35 mm, low, from his seat', note: 'Ends exactly where the umbrella lies in 21–27.' },
      R.scene, c, { dof: { focus: c.position.distanceTo(E), range: 0.6, max: 1.2 } }); }
  // 21 TWIST INSERT, top shot: the tag on the umbrella reads THEO / last tue.
  { const R = diner({ pot: false, umb: 'none' }); const u = tableProps(R, { umbOn: true }); const T = u.getObjectByName('tagFront'); const Tw = new THREE.Vector3(); T.getWorldPosition(Tw);
    const C = Tw.clone(); const c = cam(F50, [C.x, C.y + 0.42, C.z + 0.001], [C.x, C.y, C.z]); c.up.set(-1, 0, 0); c.lookAt(C.x, C.y, C.z);
    shot({ id: '21', who: '-', line: '', clip: '-', face: '-', lens: '50 mm top shot (90°)', note: 'THE TWIST insert. Tag readable: "THEO / last tue." Slow push-in, ding.' }, R.scene, c, { pushDist: 0.42 }); }
  // 22 Vera: "You left it here… last Tuesday." (umbrella on the table in the foreground)
  { const R = diner({ pot: false, umb: 'none' }); tableProps(R, { umbOn: true }); const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'smug', 'talkSmall', VSEAT[0], VSEAT[1], 0);
    const E = head(v); const c = cam(F50, [2.1, 0.88, 1.66], [E.x, E.y - 0.2, E.z]);
    shot({ id: '22', who: 'VERA', line: 'You left it here… last Tuesday.', clip: 'sit_chair', face: 'smug / talkSmall', lens: '50 mm, umbrella in the foreground', note: '' }, R.scene, c, dofAt(c, v)); }
  // 23 Theo: shock + blush
  { const R = diner({ pot: false, umb: 'none' }); tableProps(R, { umbOn: true }); const t = seat(R.scene, 'theo', 'sit_talk', 1.4, 'shocked+blush', 'talkO+blush', TSEAT[0], TSEAT[1], Math.PI);
    const c = cu(t, 1.35, 0.05, 0.06, F50, [0, -0.05, 0]);
    shot({ id: '23', who: 'THEO', line: 'You kept it? For a week?', clip: 'sit_talk (1.4 s)', face: 'shocked+blush / talkO+blush', lens: '50 mm, straight on', note: '' }, R.scene, c, dofAt(c, t)); }
  // 24 Vera: her only blush, eye level
  { const R = diner({ pot: false, umb: 'none' }); tableProps(R, { umbOn: true }); const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'soft+blush', 'sweetSmile+blush', VSEAT[0], VSEAT[1], 0);
    const c = cu(v, 1.15, -0.42, 0.04, F50, [0, -0.06, 0]);
    shot({ id: '24', who: 'VERA', line: 'I kept the booth too.', clip: 'sit_chair', face: 'soft+blush / sweetSmile+blush', lens: '50 mm, eye level (equal for once)', note: '0.9 s pause before the line. Her only blush. Music dips.' }, R.scene, c, dofAt(c, v)); }
  // 24b INSERT (v2): the door sign swings on its string, now CLOSED (flipped off screen), rain running down the door glass
  { const R = diner({ pot: false, umb: 'none', sign: 'closed' }); const c = cam(F50, [1.6, 1.47, -0.75], [2.93, 1.5, -1.2]);
    shot({ id: '24b', who: '-', line: '', clip: '-', face: '-', lens: '50 mm insert', note: 'The door sign now reads CLOSED (flipped off screen), rain running down the door glass. The jukebox clicks on with his song.' }, R.scene, c, { dof: { focus: c.position.distanceTo(V3(2.93, 1.5, -1.2)), range: 0.2, max: 1.4 } }); }
  // 25 CALLBACK (v2: new clip hand_towel, OTS from his seat): she picks up the towel and holds it out to him
  { const R = diner({ pot: false, umb: 'none', sign: 'closed' }); tableProps(R, { umbOn: true, towelOn: false });
    const t = seat(R.scene, 'theo', 'sit_talk', 0.5, 'open', 'neutral', TSEAT[0], TSEAT[1], Math.PI);
    const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'bedroom', 'talkSmall', VSEAT[0], VSEAT[1], 0);
    const tw = towel(); R.scene.add(tw); const T0 = TOWEL_T.clone(), T1 = V3(2.22, TABLE_H + 0.15, BOOTH.tz - 0.12);
    const twAt = (tt) => { const k = kv(tt, [[0.5, 0], [1.3, 1]]); tw.position.copy(T0.clone().lerp(T1, k)); tw.position.y += 0.06 * Math.sin(Math.PI * k); tw.rotation.set(0, 0.25 * k, 0); tw.updateMatrixWorld(true); return tw.localToWorld(V3(0, 0.04, 0)); };
    let rest = null;
    bake(v, 'hand_towel', 2.0, (tt) => { v.pose('sit_chair', 1.0); if (!rest) rest = palmAt(v, 'R'); { const lk = kv(tt, [[0, 0], [0.5, 0.4], [1.3, 1], [2.0, 1]]); lean(v, 0.42 * lk); lean(v, 0.2 * lk, 'Chest'); lean(v, -0.5 * lk, 'Neck'); }
      const G = twAt(tt), reach = kv(tt, [[0, 0], [0.5, 1]]);
      const e = reachPalm(v, 'R', rest.clone().lerp(G, reach), V3(0.05, -0.25, 1), V3(0, -1, 0).lerp(V3(-0.3, 0.3, 0.2), 1 - reach), V3(VSEAT[0] - 0.75, 0.6, VSEAT[1])); return reach > 0.99 ? e : 0; });
    useClip(v, 'hand_towel', 1.6, 0.6, 'bedroom', 'talkSmall'); v.onT = twAt; twAt(1.6);
    const TH = head(t), E = head(v); const c = cam(F50, [TH.x + 0.33, TH.y + 0.24, TH.z + 0.45], [E.x - 0.1, E.y - 0.3, E.z]);
    shot({ id: '25', who: 'VERA', line: 'Dry off first, Theo?', clip: 'Vera hand_towel (NEW engine clip: palm on the towel, lift, hold it out to him); Theo sit_talk (shoulder, foreground)', face: 'Vera bedroom / talkSmall', lens: '50 mm over his shoulder from his seat', note: 'CALLBACK, the first time she says his name. The song he picked is playing (24b).' },
      R.scene, c, { dof: { focus: c.position.distanceTo(E), range: 0.4, max: 1.8 } }); }
  // 26 Theo, heart eyes, both hands round the cup
  { const R = diner({ pot: false, umb: 'none', sign: 'closed' }); tableProps(R, { umbOn: true, mugOn: false });
    const t = seat(R.scene, 'theo', 'sit_talk', 0.3, 'hearts+blush', 'blushSmile+blush', TSEAT[0], TSEAT[1], Math.PI);
    fix(t, graft(t, 'hold_cup', 0.6, ['R', 'L'], ['sit_talk', 0.3, 'hearts+blush', 'blushSmile+blush']));
    hold(R.scene, t, 'Hand.R', mug({ coffee: true }), [-0.4, 0.75, 0.25], [0, 0, 0], 0.5);
    const c = cu(t, 1.3, 0.2, 0.05, F50, [0, -0.07, 0]);
    shot({ id: '26', who: 'THEO', line: 'Make it two cups.', clip: 'sit_talk + hold_cup arms grafted, the cup in his hands', face: 'hearts+blush / blushSmile+blush', lens: '50 mm, slow push-in', note: 'Pink "ding" on the hearts.' }, R.scene, c, dofAt(c, t)); }
  // 27 TAIL: exterior in the rain, neon, the two of them in the booth through the streaked window
  { const R = diner({ pot: false, umb: 'none', sign: 'closed' }); tableProps(R, { umbOn: true });
    seat(R.scene, 'theo', 'sit_talk', 0.3, 'hearts+blush', 'blushSmile+blush', TSEAT[0], TSEAT[1], Math.PI);
    seat(R.scene, 'vera', 'sit_chair', 1.0, 'happy', 'smile', VSEAT[0], VSEAT[1], 0);
    shot({ id: '27', who: '-', line: '', clip: 'Theo sit_talk; Vera sit_chair', face: 'Theo hearts+blush; Vera happy / smile', lens: '28 mm, exterior wide', note: 'Silent tail ~3 s, no subtitle. Rain + neon, MOONLITE DINER sign. Fade out.' },
      R.scene, cam(F28, [8.2, 1.5, 3.0], [3.0, 1.55, 1.15])); }
}
