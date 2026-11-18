// vera-01 "THE LAST SLICE" storyboard shots: one still per shot at its final framing.
// window.SB[i] = { id, who, line, clip, face, lens, note } (times come from work/timeline.json in tools/compose.py).
// Lenses (ESTILO.md §4, 9:16 vertical): 28 mm = 66 deg vertical FOV (wides), 35 mm = 54, 50 mm = 40 (close-ups, bg blurred via shot.dof).
export function buildShots(L) {
  const { addShot, cafe, character, holdAt, slicePlate, cam, box, lam, COUNTER, DOME, DOOR, TABLES, TABLE_H, V3, THREE } = L;
  const SB = window.SB = [];
  const QS = new URLSearchParams(location.search);
  const F28 = 66, F35 = 54, F50 = 40;
  const WARM = 0xfff0dc, DOORT = 0xdde2f2;   // per-shot character tint: amber interior / cool doorway
  const faceTo = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);   // ry so +z looks from -> to (x, z)
  let CHARS = [];   // characters made for the current shot -> meta.heads = [[x, y, r] px at 1080x1920] (face crops for reviews)
  // ---- FILM mode (sb.html?film): same shots, animated on engine/film_timeline.json (tools/film_timeline.py) ----
  const TL = L.TL, FPS = 30, SH = TL ? Object.fromEntries(TL.shots.map((x) => [x.id, x])) : {};
  const LOOP = /idle|hip_tilt|doorframe|sit_chair|sit_talk|hold_object|fan_collar|talk_nervous|talk_side|talk$/;
  const mouthLv = (spk, T) => (TL ? +(TL.mouth[spk][Math.floor(T * FPS)] || 0) : 0);
  const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  // per-shot camera move (film): fraction of the focus distance travelled forward over the shot (push-in) + a tiny handheld drift
  const PUSH = { '03': 0.06, '05': 0.05, '07': 0.04, '11': 0.06, '16': 0.06, '22': 0.05, '23': 0.06, '25': 0.14, '25b': 0.05, '26': 0.05, '27': 0.05, '28': 0.1, '29': 0.04, '01': 0.03, '09': 0.02, '14': 0.03, '18': 0.02, '21': 0.03 };
  const MOSAIC = { '02': 0.24, '14': 0.24, '21': 0.24 };   // v2 (user): short and snappy, ~7 frames
  function filmUpdate(id, actors, camera, extra) {
    const dur = SH[id].t1 - SH[id].t0, base = camera.position.clone(), dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const quat = camera.quaternion.clone(), focus = extra.dof ? extra.dof.focus : (extra.pushDist ?? 3), push = PUSH[id] ?? 0.04;
    return (lt, T, ltReal) => {
      for (const a of actors) {
        const c = a.c, clip = THREE.AnimationClip.findByName(L.CH[a.kind].clips, a.clip), D = clip ? clip.duration : 1;
        let ct = a.wipe ? a.t : a.t - 0.45 * dur + lt;   // the wipe holds its bent base pose; the IK moves the arms ct = LOOP.test(a.clip) ? ((ct % D) + D) % D : Math.min(D - 1e-3, Math.max(0, ct));
        const blush = /\+blush/.test(a.mouth) ? '+blush' : '', spk = a.kind === 'vera' ? 'V' : 'T', lv = mouthLv(spk, T), fr = Math.floor(T * FPS);
        let eyes = a.eyes, mouth = a.mouth;
        if (lv > 0) mouth = (lv === 1 ? 'talkSmall' : ['talkA', 'talkO', 'talkSmall'][(fr >> 2) % 3]) + blush;   // ~10 Hz flaps, no lip-sync (like the ref)
        else if (/^talk/.test(mouth)) mouth = (a.kind === 'vera' ? 'smirk' : 'neutral') + blush;
        const per = 3.4 + (a.kind === 'vera' ? 0.0 : 0.9), ph = (T + (a.kind === 'vera' ? 0.4 : 1.7)) % per;
        if (ph < 0.12 && !/blink|happy|wink|hearts|closed|relaxed/.test(eyes)) eyes = 'blink' + (/\+blush/.test(eyes) ? '+blush' : '');
        c.pose(a.clip, ct, eyes, mouth);
        if (a.seat) { const P = c.world('Pelvis'); c.root.position.x += a.seat[0] - P.x; c.root.position.z += a.seat[1] - P.z; c.root.updateMatrixWorld(true); }
        for (const h of c.holds || []) h();
        if (a.wipe) wipe(c, a.wipe.W, a.wipe.rag, T);
      }
      const k = ease(ltReal / Math.max(0.5, dur));
      camera.position.copy(base).addScaledVector(dir, focus * push * k);
      camera.position.x += 0.004 * Math.sin(ltReal * 2.3 + id.length); camera.position.y += 0.003 * Math.sin(ltReal * 1.7 + 1.1);   // v3: v1's slight handheld drift is back (user)
      camera.quaternion.copy(quat); camera.updateMatrixWorld(true);
      if (extra.custom) extra.custom(lt, T, ltReal);
    };
  }
  // ?clipcheck=<shot>: per film frame of that shot, the closest distance (cm) between Vera's forearm + hand vertices (both arms) and her
  // torso vertices (skinned positions, vertices classified by their dominant bone). Logged as CLIPCHECK {frames: [[f, cm], ...]}.
  function clipCheck(c, upd, t0, t1) {   // v4: arm vertices vs torso TRIANGLES (closest point, signed by the face normal: < 0 = inside the body)
    const meshes = []; c.model.traverse((o) => { if (o.isSkinnedMesh) meshes.push(o); });
    const ARM = /^(Forearm\.?[RL]|Hand\.?[RL])$/, TORSO = /^(Spine|Chest|Pelvis|Bust\.?L|Bust\.?R|Neck)$/;
    const dom = (m, i) => { const si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight; let bi = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; bi = si.getComponent(i, k); } } return m.skeleton.bones[bi].name; };
    const out = [], tri = new THREE.Triangle(), cp = new THREE.Vector3(), nrm = new THREE.Vector3();
    for (let f = Math.round(t0 * 30); f < Math.round(t1 * 30); f++) {
      const T = f / 30, ta = Math.floor(T * 15 + 1e-6) / 15; upd(ta - t0, ta, T - t0);
      const arm = [], tris = [];
      for (const m of meshes) { const pos = m.geometry.attributes.position, idx = m.geometry.index, W = [];
        for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(pos, i); m.applyBoneTransform(i, v); v.applyMatrix4(m.matrixWorld); W.push(v); if (ARM.test(dom(m, i))) arm.push(v); }
        const n = idx ? idx.count : pos.count, at = (k) => (idx ? idx.getX(k) : k);
        for (let k = 0; k < n; k += 3) { const a = at(k), b = at(k + 1), cc = at(k + 2); if (TORSO.test(dom(m, a)) && TORSO.test(dom(m, b)) && TORSO.test(dom(m, cc))) tris.push([W[a], W[b], W[cc]]); } }
      let best = 1e9;
      for (const p of arm) { let dmin = 1e9, sgn = 1;
        for (const [a, b, cc] of tris) { tri.set(a, b, cc); tri.closestPointToPoint(p, cp); const d = cp.distanceTo(p); if (d < dmin) { dmin = d; tri.getNormal(nrm); sgn = Math.sign(p.clone().sub(cp).dot(nrm)) || 1; } }
        const sd = QS.has('signed') ? dmin * sgn : dmin; if (sd < best) best = sd; }   // unsigned by default (the ripped mesh's winding is not consistent)
      out.push([f, Math.round(best * 1000) / 10]);
    }
    console.log('CLIPCHECK ' + JSON.stringify({ min: Math.min(...out.map((x) => x[1])), frames: out }));
  }

  const ONLY = QS.get('only'); const shot = (meta, scene, camera, extra = {}) => {
    camera.updateMatrixWorld(true); meta.heads = CHARS.filter((c) => c.root.parent).map((c) => { const H = c.world('Head', [0, 0.45, 0.1]), T = c.world('Head', [0, 1.6, 0.1]);
      const p = H.clone().project(camera), q = T.clone().project(camera); return [Math.round((p.x + 1) / 2 * 1080), Math.round((1 - p.y) / 2 * 1920), Math.round(Math.hypot(p.x - q.x, (p.y - q.y) * 16 / 9) * 540), p.z < 1 ? 1 : 0]; });
    const actors = CHARS.filter((c) => c.root.parent && c.anim).map((c) => ({ c, ...c.anim })); CHARS = [];
    if (TL) { const S = SH[meta.id], upd = filmUpdate(meta.id, actors, camera, extra); SB.push(meta); addShot(scene, camera, { ...extra, t0: S.t0, mosaic: MOSAIC[meta.id] || 0, fadeOut: meta.id === '29' ? 1.4 : 0, fadeAt: S.t1 - S.t0, update: upd });
      if (QS.get('clipcheck') === meta.id) { const v = actors.find((x) => x.kind === 'vera'); if (v) clipCheck(v.c, upd, S.t0, S.t1); } return; }
    if (ONLY && !ONLY.split(',').includes(meta.id)) return; SB.push(meta); addShot(scene, camera, extra); };
  // a held prop that follows its bone every frame in the film (levelRy: keep the prop upright with this yaw)
  const hold = (scene, c, bone, prop, off, rot, levelRy) => {
    const f = () => { holdAt(scene, c, bone, prop, off, rot); if (levelRy !== undefined) prop.rotation.set(0, levelRy, 0); };
    f(); (c.holds = c.holds || []).push(f); return prop; };
  const put = (scene, kind, clip, t, eyes, mouth, x, z, ry, tint = WARM, shadow = 0.5) => {
    const c = character(kind, { tint, shadow }); CHARS.push(c); c.anim = { kind, clip, t, eyes, mouth }; c.pose(clip, t, eyes, mouth); c.root.position.set(x, 0, z); c.root.rotation.y = ry; if (!QS.has('nochar')) scene.add(c.root); c.root.updateMatrixWorld(true); return c; };
  const head = (c) => c.world('Head', [0, 0.45, 0.1]);
  // close-up camera: from a point at distance d in direction (yaw from the character's facing, pitch), looking at the head
  const cu = (c, d, yaw, dy, fov = F50, look = [0, 0, 0], roll = 0) => {
    const E = head(c), ry = c.root.rotation.y + yaw; const p = [E.x + Math.sin(ry) * d, E.y + dy, E.z + Math.cos(ry) * d];
    return cam(fov, p, [E.x + look[0], E.y + look[1], E.z + look[2]], roll); };
  const dofAt = (camera, c, range = 0.2, max = 2.6) => ({ dof: { focus: camera.position.distanceTo(head(c)), range, max } });
  // seated: shift the root so the pelvis sits over the chair centre
  const seat = (scene, kind, clip, t, eyes, mouth, cx, cz, ry, dy = 0) => {
    const c = put(scene, kind, clip, t, eyes, mouth, cx, cz, ry); const P = c.world('Pelvis');
    c.root.position.x += cx - P.x; c.root.position.z += cz - P.z; c.root.position.y = dy; c.shadow.visible = false; c.root.updateMatrixWorld(true); c.anim.seat = [cx, cz]; return c; };
  const rag = () => { const g = new THREE.Group(); box(0.13, 0.02, 0.09, lam(null, 0xf2f0ea), 0, 0, 0, g); box(0.1, 0.012, 0.07, lam(null, 0xd8e4f0), 0, -0.012, 0.04, g); return g; };

  // ---- v2: two-bone IK (UpperArm -> Forearm -> Hand) and the table wipe ----
  const _v = (x, y, z) => new THREE.Vector3(x, y, z);
  function ik2(c, side, target, pole) {   // world-space target for the wrist (Hand.X origin), elbow bends toward `pole`
    const A = c.bone('UpperArm.' + side), B = c.bone('Forearm.' + side), C = c.bone('Hand.' + side); c.root.updateMatrixWorld(true);
    const a = A.getWorldPosition(_v()), b = B.getWorldPosition(_v()), cc = C.getWorldPosition(_v());
    const l1 = a.distanceTo(b), l2 = b.distanceTo(cc), t = target.clone(), d = Math.min(t.distanceTo(a), l1 + l2 - 1e-4), dir = t.clone().sub(a).normalize();
    const cosA = Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), ang = Math.acos(cosA);
    const pn = pole.clone().sub(a); pn.sub(dir.clone().multiplyScalar(pn.dot(dir))).normalize();
    const elbow = a.clone().add(dir.clone().multiplyScalar(Math.cos(ang) * l1)).add(pn.multiplyScalar(Math.sin(ang) * l1));
    const rot = (bone, from, to) => { const q = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize()), wq = bone.getWorldQuaternion(new THREE.Quaternion()), pq = bone.parent.getWorldQuaternion(new THREE.Quaternion());
      bone.quaternion.copy(pq.invert().multiply(q.multiply(wq))); bone.updateMatrixWorld(true); };
    rot(A, b.clone().sub(a), elbow.clone().sub(a));
    const b2 = B.getWorldPosition(_v()), c2 = C.getWorldPosition(_v()); rot(B, c2.clone().sub(b2), t.clone().sub(b2));
  }
  // v3: the wipe works on any surface (table or counter). The rag is glued to Hand.R: after the IK, it sits exactly under the
  // palm (the hand's own position projected onto the surface) and turns with the hand, so it never floats away from her.
  const WIPE = { clip: 'idle_sway', t: 1.2, r: 0.08, hz: 1.15, top: 1.02, reach: 0.42, side: 0.12, lift: 0.07, back: 0.05, lreach: 0.36 };   // base: standing (counter at 1.02 m)
  function wipe(c, W, ragM, time) {
    const fwd = _v(Math.sin(c.root.rotation.y), 0, Math.cos(c.root.rotation.y)), right = _v(-fwd.z, 0, fwd.x), P = c.root.position;
    const ang = time * W.hz * Math.PI * 2, ctr = P.clone().addScaledVector(fwd, W.reach).addScaledVector(right, W.side);
    const rp = ctr.clone().addScaledVector(fwd, Math.cos(ang) * W.r).addScaledVector(right, Math.sin(ang) * W.r * 1.3); rp.y = W.top;
    ik2(c, 'R', rp.clone().add(_v(0, W.lift, 0)).addScaledVector(fwd, -W.back), P.clone().addScaledVector(right, W.poleOut ?? 0.5).addScaledVector(fwd, W.poleFwd ?? 0).add(_v(0, W.poleUp ?? 0.3, 0)));
    const lp = P.clone().addScaledVector(fwd, W.lreach).addScaledVector(right, -(W.lside ?? 0.2)); lp.y = W.top + W.lift - 0.005;
    ik2(c, 'L', lp, P.clone().addScaledVector(right, -0.6).add(_v(0, 0.3, 0)));
    if (ragM) { c.root.updateMatrixWorld(true); const palm = c.bone('Hand.R').localToWorld(_v(0, 0.55, 0.15)); ragM.position.set(palm.x, W.top + 0.011, palm.z);
      const hq = c.bone('Hand.R').getWorldQuaternion(new THREE.Quaternion()), hd = _v(0, 1, 0).applyQuaternion(hq); ragM.rotation.set(0, Math.atan2(hd.x, hd.z), 0); }
  }
  const DOORIN = { x0: 3.55, x1: 2.62, open: 0.5, walk: 0.55, speed: 0.74 };   // Theo: outside -> on the mat (walk clip speed 0.74 m/s)

  // positions
  const VB = [0.15, -2.42];        // Vera behind the counter, by the dome
  const TF = [0.1, -0.92];         // Theo at the counter front
  const WT = TABLES[0];            // window table (her section)
  const TSEAT = [WT[0] + 0.55, WT[1]], VSEAT = [WT[0] - 0.55, WT[1]];

  if (QS.has('cover')) {   // delivery cover: both faces across the counter, the dome + slice between them
    const R = cafe(); const VC = [0.05, -2.36], TC = [0.0, -1.0];
    const v = put(R.scene, 'vera', 'flirt_lean_in', 1.2, 'smug', 'smirk', VC[0], VC[1], faceTo(VC, TC) + 0.35);
    const t = put(R.scene, 'theo', 'scratch_head', 1.1, 'shy+blush', 'blushSmile+blush', TC[0], TC[1], faceTo(TC, VC) - 0.35);
    const Vh = head(v), Th = head(t), mid = Vh.clone().lerp(Th, 0.5);
    const c = cam(F35, [mid.x - 1.55, mid.y - 0.12, mid.z + 0.05], [mid.x, mid.y - 0.12, mid.z]);
    SB.push({ id: 'cover' }); addShot(R.scene, c, { dof: { focus: c.position.distanceTo(mid), range: 0.6, max: 2.0 } }); return;
  }
  if (QS.has('set')) {   // set stills: empty cafe, wide + 2 angles
    { const R = cafe(); SB.push({ id: 'set_wide' }); addShot(R.scene, cam(F28, [-2.6, 1.8, 2.75], [1.3, 0.95, -0.9])); }
    { const R = cafe(); SB.push({ id: 'set_window' }); addShot(R.scene, cam(F28, [0.65, 1.65, -2.5], [2.9, 1.15, 0.7])); }
    { const R = cafe(); SB.push({ id: 'set_counter' }); addShot(R.scene, cam(F35, [1.6, 1.45, 0.2], [-0.9, 1.2, -2.3])); }
    { const R = cafe(); SB.push({ id: 'set_street' }); addShot(R.scene, cam(F28, [7.2, 1.45, 2.4], [2.8, 1.35, -0.2])); }
    return;
  }

  // 01 HOOK (v2, user): Vera wiping the table nearest the door with the rag (IK wipe loop, both hands on the table top),
  // the door swings open on its hinge + the bell, Theo steps in from the cool street and stops on the mat: "Sorry… is that one taken?"
  { const R = cafe(); const VW = QS.has('oldwipe') ? [1.2, -1.78] : [1.2, -1.76], W = QS.has('oldwipe') ? { ...WIPE, side: 0.0 } : { ...WIPE, reach: 0.5, side: 0.19, r: 0.05, lreach: 0.4, lside: 0.22, poleOut: 0.9, poleFwd: -0.1, poleUp: 0.15 };   // v4: wipe area out at her right side (screen left), small strokes, elbow out: the arm no longer crosses her torso
    const v = put(R.scene, 'vera', W.clip, W.t, 'half', 'neutral', VW[0], VW[1], -Math.PI / 2);
    const ragM = rag(); R.scene.add(ragM); wipe(v, W, ragM, 0); v.anim.wipe = { W, rag: ragM };
    const th = put(R.scene, 'theo', 'idle_stiff', 0.6, 'open', 'neutral', DOORIN.x0, DOOR.z, -Math.PI / 2, DOORT); th.anim = null;   // posed by the custom callback
    th.root.position.x = QS.has('film') ? DOORIN.x0 : DOORIN.x1;
    if (!QS.has('film')) { th.pose('idle_stiff', 0.6, 'open', 'talkSmall'); R.door.rotation.y = -1.15; }
    const BELL = R.bell, door = R.door;
    const custom = (lt, T, ltReal) => {   // door hinge + bell + Theo's entrance (walk in place, root moved at the clip's speed, then stop)
      door.rotation.y = -1.15 * ease((ltReal - DOORIN.open) / 0.45);
      const w0 = DOORIN.walk, w1 = w0 + (DOORIN.x0 - DOORIN.x1) / DOORIN.speed;
      if (lt < w0) th.pose('idle', 0.4 + lt, 'open', 'neutral');
      else if (lt < w1) { th.root.position.x = DOORIN.x0 - (lt - w0) * DOORIN.speed; th.pose('walk', (lt - w0) % L.CH.theo.clips.find((c) => c.name === 'walk').duration, 'open', 'neutral'); }
      else { th.root.position.x = DOORIN.x1; const lv = mouthLv('T', T), fr = Math.floor(T * FPS); th.pose('idle_stiff', 0.3 + (lt - w1) * 0.8, ((T % 3.6) < 0.12) ? 'blink' : 'open', lv ? (lv === 1 ? 'talkSmall' : ['talkA', 'talkO', 'talkSmall'][(fr >> 2) % 3]) : 'neutral'); }
      th.root.updateMatrixWorld(true);
      if (BELL) BELL.rotation.x = ltReal > DOORIN.open ? 0.45 * Math.sin((ltReal - DOORIN.open) * 13) * Math.exp(-(ltReal - DOORIN.open) * 1.6) : 0;
    };
    shot({ id: '01', who: 'THEO', line: 'Sorry… is that one taken?', clip: 'Vera wipes the COUNTER (IK arms on idle_sway, rag glued under Hand.R); door hinge opens + bell; Theo walk in -> idle_stiff', face: 'Theo open / talkSmall; Vera half / neutral',
      lens: '28 mm wide (v1 framing over the counter, dome in the foreground)', note: 'v3: v1 camera; wiping, door opens at 0.5 s with the bell, Theo in by 1.9 s, line at 2.2 s. Title card 0.0-3.4 s.' },
      R.scene, cam(F28, [-1.0, 1.45, -1.62], [2.6, 1.0, -1.42]), { custom }); }
  // 02 INSERT: the dome, one slice, the label lying flat and turned AWAY (unreadable); empty pastry case plates behind
  { const R = cafe(); const c = cam(F50, [DOME.x + 0.12, COUNTER.h + 0.27, DOME.z + 0.62], [DOME.x, COUNTER.h + 0.19, DOME.z]);
    shot({ id: '02', who: '-', line: '', clip: '-', face: '-', lens: '50 mm insert, bg blurred', note: 'Pixel-mosaic transition IN (2.0-2.7 s). The label on the plate faces away: the twist is planted, not shown.' },
      R.scene, c, { dof: { focus: c.position.distanceTo(V3(DOME.x, COUNTER.h + 0.2, DOME.z)), range: 0.12, max: 2.4 } }); }
  // 03 Vera MCU, low angle (power), leaning on the counter
  { const R = cafe(); const v = put(R.scene, 'vera', 'flirt_lean_in', 1.1, 'tease', 'talkSmall', VB[0], VB[1], faceTo(VB, TF));
    put(R.scene, 'theo', 'idle_stiff', 0.6, 'open', 'neutral', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(v, 1.55, -0.3, -0.12, F50, [0, -0.2, 0]);
    shot({ id: '03', who: 'VERA', line: 'Let me guess. The usual?', clip: 'flirt_lean_in (1.1 s)', face: 'tease / talkSmall', lens: '50 mm, low angle, slow push-in', note: 'Catchphrase PLANTED ("The usual?"). Theo is the blurred shoulder at the left edge.' },
      R.scene, c, dofAt(c, v)); }
  // 04 Theo MCU, slight high angle (her eye line), neck scratch
  { const R = cafe(); const t = put(R.scene, 'theo', 'scratch_head', 1.1, 'surprised', 'talkSmall', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(t, 1.5, 0.2, 0.2, F50, [0, -0.2, 0]);
    shot({ id: '04', who: 'THEO', line: 'I have a usual?', clip: 'scratch_head (1.1 s, hand at the nape)', face: 'surprised / talkSmall', lens: '50 mm, slight high angle', note: 'Background: empty tables + window, blurred.' },
      R.scene, c, dofAt(c, t)); }
  // 05 Vera CU 3/4, side-eye, head tilt
  { const R = cafe(); const v = put(R.scene, 'vera', 'flirt_head_tilt', 1.2, 'sideEyeR', 'talkSmall', VB[0], VB[1], faceTo(VB, TF));
    const c = cu(v, 1.4, 0.6, -0.05, F50, [0, -0.18, 0]);
    shot({ id: '05', who: 'VERA', line: 'Nine fifty-five. Every night.', clip: 'flirt_head_tilt (1.2 s)', face: 'sideEyeR / talkSmall', lens: '50 mm 3/4, low', note: 'Espresso machine + menu board blurred behind.' },
      R.scene, c, dofAt(c, v)); }
  // 06 Theo, blush, looks away
  { const R = cafe(); const t = put(R.scene, 'theo', 'blush_look_away', 0.7, 'gazeL+blush', 'talkSmall+blush', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(t, 1.4, -0.45, 0.15, F50, [0, -0.18, 0]);
    shot({ id: '06', who: 'THEO', line: "Okay. That's embarrassing.", clip: 'blush_look_away (0.7 s)', face: 'gazeL+blush / talkSmall+blush', lens: '50 mm 3/4', note: '' }, R.scene, c, dofAt(c, t)); }
  // 07 Vera medium from the side, low: her hand by the dome, hip tilt; the slice between them
  { const R = cafe(); const v = put(R.scene, 'vera', 'flirt_hip_tilt', 1.6, 'smug', 'talkA', -0.05, -2.42, faceTo([-0.05, -2.42], TF));
    const c = cam(F35, [0.55, 1.2, -0.95], [-0.3, 1.33, -2.3]);
    shot({ id: '07', who: 'VERA', line: 'The last slice comes with conditions.', clip: 'flirt_hip_tilt (1.6 s)', face: 'smug / talkA', lens: '35 mm, low side angle', note: 'Dome in the lower foreground, Vera rising above it.' }, R.scene, c); void v; }
  // 08 Theo CU: frozen
  { const R = cafe(); const t = put(R.scene, 'theo', 'shock_freeze', 1.15, 'shocked', 'oh', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(t, 1.15, 0.05, 0.08, F50, [0, -0.14, 0]);
    shot({ id: '08', who: 'THEO', line: 'Conditions?', clip: 'shock_freeze (1.15 s, held)', face: 'shocked / oh', lens: '50 mm, straight on', note: '' }, R.scene, c, dofAt(c, t)); }
  // 09 WIDE two-shot across the counter, profile: "One." she points at him
  { const R = cafe(); const v = put(R.scene, 'vera', 'point', 0.9, 'tease', 'talkSmall', VB[0], VB[1], faceTo(VB, TF));
    const t = put(R.scene, 'theo', 'idle_stiff', 0.6, 'open', 'parted', TF[0], TF[1], faceTo(TF, VB)); void v; void t;
    shot({ id: '09', who: 'VERA', line: "One. Who's it for?", clip: 'Vera point (0.9 s, arm out at him); Theo idle_stiff', face: 'Vera tease / talkSmall; Theo open / parted', lens: '28 mm wide, side', note: 'Condition 1. Re-establishes the space (counter, dome, door far right).' },
      R.scene, cam(F28, [2.35, 1.4, -0.15], [0.15, 1.2, -1.75])); }
  // 10 Theo: the lie, palm out
  { const R = cafe(); const t = put(R.scene, 'theo', 'deny_palm', 0.3, 'gazeR', 'talkSmall', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(t, 1.6, 0.3, 0.18, F50, [0, -0.25, 0]);
    shot({ id: '10', who: 'THEO', line: 'A friend. A good… friend.', clip: 'deny_palm (0.3 s, palm out)', face: 'gazeR / talkSmall', lens: '50 mm', note: '' }, R.scene, c, dofAt(c, t)); }
  // 11 Vera CU, low + dutch 5 deg: the tease
  { const R = cafe(); const v = put(R.scene, 'vera', 'flirt_lean_in', 1.35, 'bedroom', 'talkSmall', VB[0], VB[1], faceTo(VB, TF));
    const c = cu(v, 1.3, -0.4, -0.08, F50, [0, -0.15, 0], 0.09);
    shot({ id: '11', who: 'VERA', line: 'Does your friend blush this much?', clip: 'flirt_lean_in (1.35 s)', face: 'bedroom / talkSmall', lens: '50 mm, low, dutch 5°', note: 'Her one dutch angle (the cheeky beat).' }, R.scene, c, dofAt(c, v)); }
  // 12 Theo collar fanning
  { const R = cafe(); const t = put(R.scene, 'theo', 'fan_collar', 1.0, 'shy+blush', 'talkSmall+blush', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(t, 1.5, -0.1, 0.18, F50, [0, -0.24, 0]);
    shot({ id: '12', who: 'THEO', line: 'It’s for me.', clip: 'fan_collar (1.0 s)', face: 'shy+blush / talkSmall+blush', lens: '50 mm', note: '' }, R.scene, c, dofAt(c, t)); }
  // 13 Vera laughs, eyes ^^
  { const R = cafe(); const v = put(R.scene, 'vera', 'nod', 0.3, 'happy', 'smileOpen', VB[0], VB[1], faceTo(VB, TF));
    const c = cu(v, 1.35, 0.3, -0.05, F50, [0, -0.16, 0]);
    shot({ id: '13', who: 'VERA', line: 'Cute.', clip: 'nod (0.3 s, soft nod; laugh clip covers the mouth with the hand)', face: 'happy (^^) / smileOpen', lens: '50 mm', note: '' }, R.scene, c, dofAt(c, v)); }
  // 14 WIDE low: the dome is off, she holds the slice up out of reach; Theo reaches on tiptoe
  { const R = cafe({ slice: false, dome: false }); const v = put(R.scene, 'vera', 'raise_object', 0.7, 'smug', 'talkSmall', VB[0], VB[1], faceTo(VB, TF));
    const p = slicePlate({ label: true }); hold(R.scene, v, 'Hand.R', p, [0, 0.9, 0], [Math.PI, 0, 0], Math.PI);
    const t = put(R.scene, 'theo', 'reach_up', 0.55, 'surprised', 'parted', TF[0] + 0.05, TF[1] - 0.15, faceTo(TF, VB)); void t;
    { const dm = new THREE.Group(); dm.position.set(-0.75, COUNTER.h, -1.75); R.scene.add(dm); }
    shot({ id: '14', who: 'VERA', line: 'Two. You share it.', clip: 'Vera raise_object (0.7 s, plate in Hand.R high); Theo reach_up (0.55 s)', face: 'Vera smug / talkSmall; Theo surprised / parted', lens: '28 mm wide, low', note: 'Pixel-mosaic IN (time skip: the dome is off). Condition 2. Slice held out of his reach across the counter.' },
      R.scene, cam(F35, [0.6, 1.05, -0.5], [0.1, 1.72, -2.3])); }
  // 15 Theo asks
  { const R = cafe({ slice: false, dome: false }); const t = put(R.scene, 'theo', 'ask_tilt', 0.8, 'open', 'talkSmall', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(t, 1.35, 0.35, 0.12, F50, [0, -0.17, 0]);
    shot({ id: '15', who: 'THEO', line: 'With who?', clip: 'ask_tilt (0.8 s)', face: 'open / talkSmall', lens: '50 mm', note: '' }, R.scene, c, dofAt(c, t)); }
  // 16 Vera, strong low angle + dutch: "Guess."
  { const R = cafe({ slice: false, dome: false }); const v = put(R.scene, 'vera', 'flirt_head_tilt', 1.5, 'bedroom', 'smirk', VB[0], VB[1], faceTo(VB, TF));
    hold(R.scene, v, 'Hand.R', slicePlate(), [0, 0.9, 0], [Math.PI, 0, 0], Math.PI);
    const c = cu(v, 1.25, 0.15, -0.2, F50, [0, -0.1, 0], -0.08);
    shot({ id: '16', who: 'VERA', line: 'Guess.', clip: 'flirt_head_tilt (1.5 s)', face: 'bedroom / smirk', lens: '50 mm, strong low angle, dutch', note: 'Plate in her hand drops below frame: no contact needed.' }, R.scene, c, dofAt(c, v)); }
  // 17 Theo realises
  { const R = cafe({ slice: false, dome: false }); const t = put(R.scene, 'theo', 'blush_look_away', 1.1, 'gazeDown+blush', 'blushSmile+blush', TF[0], TF[1], faceTo(TF, VB));
    const c = cu(t, 1.3, -0.2, 0.1, F50, [0, -0.17, 0]);
    shot({ id: '17', who: 'THEO', line: 'Oh… okay.', clip: 'blush_look_away (1.1 s)', face: 'gazeDown+blush / blushSmile+blush', lens: '50 mm', note: '' }, R.scene, c, dofAt(c, t)); }
  // 18 WIDE: she has come round the counter, points at the window table where the plate already waits (two forks)
  { const R = cafe({ slice: false, dome: false }); const p = slicePlate({ forks: 2 }); p.position.set(WT[0], TABLE_H, WT[1]); p.rotation.y = -Math.PI / 2; R.scene.add(p);
    const VP = [1.35, -0.85]; put(R.scene, 'vera', 'point', 0.95, 'smug', 'talkSmall', VP[0], VP[1], faceTo(VP, WT));
    put(R.scene, 'theo', 'idle_stiff', 0.8, 'open', 'parted', 0.35, -0.95, faceTo([0.35, -0.95], VP));
    shot({ id: '18', who: 'VERA', line: 'Three. You sit in my section.', clip: 'Vera point (0.95 s) at the window table; Theo idle_stiff', face: 'Vera smug / talkSmall; Theo open / parted', lens: '28 mm wide', note: 'Condition 3. The plate is already on the window table (she set it off screen).' },
      R.scene, cam(F28, [-0.95, 1.45, 1.55], [1.2, 1.0, -0.75])); }
  // 19 Theo looks around the empty cafe
  { const R = cafe({ slice: false, dome: false }); const t = put(R.scene, 'theo', 'talk_side', 0.6, 'gazeL', 'talkSmall', 0.35, -0.95, faceTo([0.35, -0.95], [1.35, -0.85]));
    const c = cu(t, 1.5, 0.75, 0.12, F50, [0, -0.2, 0]);
    shot({ id: '19', who: 'THEO', line: 'Every table is your section.', clip: 'talk_side (0.6 s, head turned to the empty room)', face: 'gazeL / talkSmall', lens: '50 mm', note: 'Empty tables blurred behind him.' }, R.scene, c, dofAt(c, t)); }
  // 20 Vera wink
  { const R = cafe({ slice: false, dome: false }); const VP = [1.35, -0.85]; const v = put(R.scene, 'vera', 'flirt_wink', 0.65, 'wink', 'smirk', VP[0], VP[1], faceTo(VP, [0.35, -0.95]));
    const c = cu(v, 1.35, -0.3, -0.06, F50, [0, -0.16, 0]);
    shot({ id: '20', who: 'VERA', line: 'Exactly.', clip: 'flirt_wink (0.65 s)', face: 'wink / smirk', lens: '50 mm, low', note: '' }, R.scene, c, dofAt(c, v)); }
  // 21 WIDE side: both seated at the window table, the slice between them, night street through the glass
  const table = (R) => { const p = slicePlate({ forks: 2 }); p.position.set(WT[0], TABLE_H, WT[1]); p.rotation.y = -Math.PI / 2; R.scene.add(p); return p; };
  { const R = cafe({ slice: false, dome: false }); table(R);
    seat(R.scene, 'theo', 'sit_talk', 0.5, 'shy', 'talkSmall', TSEAT[0], TSEAT[1], -Math.PI / 2);
    seat(R.scene, 'vera', 'sit_chair', 1.0, 'half', 'smirk', VSEAT[0], VSEAT[1], Math.PI / 2);
    shot({ id: '21', who: 'THEO', line: 'Can I be honest?', clip: 'Theo sit_talk (forearms on the table); Vera sit_chair', face: 'Theo shy / talkSmall; Vera half / smirk', lens: '28 mm wide, side', note: 'Pixel-mosaic IN (now seated). Warm table pendant vs the cool street.' },
      R.scene, cam(F28, [WT[0] - 0.05, 1.4, WT[1] - 1.95], [WT[0], 0.85, WT[1] + 0.2])); }
  // 22 Theo CU seated, window behind
  { const R = cafe({ slice: false, dome: false }); table(R); const t = seat(R.scene, 'theo', 'sit_talk', 1.0, 'gazeDown+blush', 'talkSmall+blush', TSEAT[0], TSEAT[1], -Math.PI / 2);
    const c = cu(t, 1.25, 0.35, 0.08, F50, [0, -0.16, 0]);
    shot({ id: '22', who: 'THEO', line: 'I don’t even like cake.', clip: 'sit_talk (1.0 s)', face: 'gazeDown+blush / talkSmall+blush', lens: '50 mm', note: 'The confession. Music dips.' }, R.scene, c, dofAt(c, t)); }
  // 23 Vera CU seated: the guard drops
  { const R = cafe({ slice: false, dome: false }); table(R); const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'soft+blush', 'sweetSmile+blush', VSEAT[0], VSEAT[1], Math.PI / 2);
    const c = cu(v, 1.2, -0.35, 0.08, F50, [0, -0.15, 0]);
    shot({ id: '23', who: 'VERA', line: 'I know.', clip: 'sit_chair', face: 'soft+blush / sweetSmile+blush', lens: '50 mm, eye level (no low angle: equal for once)', note: '0.9 s silence before the line. Her only blush.' }, R.scene, c, dofAt(c, v)); }
  // 24 OTS over Theo's shoulder: she nods at the plate
  { const R = cafe({ slice: false, dome: false }); const p = table(R); p.rotation.y = Math.PI / 2;
    const t = seat(R.scene, 'theo', 'sit_talk', 0.5, 'open', 'neutral', TSEAT[0], TSEAT[1], -Math.PI / 2);
    const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'tease', 'talkSmall', VSEAT[0], VSEAT[1], Math.PI / 2);
    const T = head(t), E = head(v); const c = cam(F35, [T.x + 0.45, T.y + 0.16, T.z - 0.36], [E.x, E.y - 0.1, E.z]);
    shot({ id: '24', who: 'VERA', line: 'Read the label.', clip: 'Vera sit_chair; Theo sit_talk (shoulder, foreground)', face: 'Vera tease / talkSmall', lens: '35 mm OTS', note: 'NO CLIP for turning the plate seated: the plate is turned between 23 and 24 (off the cut).' },
      R.scene, c, { dof: { focus: c.position.distanceTo(E), range: 0.35, max: 2.0 } }); }
  // 25 TOP SHOT: the label reads THEO / since mon.
  { const R = cafe({ slice: false, dome: false }); const p = table(R); p.rotation.y = Math.PI / 2; p.updateMatrixWorld(true);
    const Lw = new THREE.Vector3(); p.getObjectByName('label').getWorldPosition(Lw); const C = Lw.clone().lerp(p.position, 0.3); C.y = TABLE_H;
    const c = cam(F50, [C.x, TABLE_H + 0.5, C.z + 0.001], [C.x, TABLE_H, C.z]); c.up.set(-1, 0, 0); c.lookAt(C.x, TABLE_H, C.z);
    shot({ id: '25', who: 'VERA (off)', line: 'It’s had your name on it…', clip: '-', face: '-', lens: '50 mm top shot (90°)', note: 'THE TWIST insert. Label readable: "THEO / since mon." Slow push-in, ding on the label.' }, R.scene, c, { pushDist: 0.5 }); }
  // 25b Vera CU seated, smug: she finishes the line
  { const R = cafe({ slice: false, dome: false }); table(R).rotation.y = Math.PI / 2; const v = seat(R.scene, 'vera', 'sit_chair', 1.0, 'smug', 'talkSmall', VSEAT[0], VSEAT[1], Math.PI / 2);
    const c = cu(v, 1.2, 0.3, 0.06, F50, [0, -0.15, 0]);
    shot({ id: '25b', who: 'VERA', line: 'since Monday.', clip: 'sit_chair', face: 'smug / talkSmall', lens: '50 mm', note: 'Cut inside line 25 at the phrase break (the insert stays <= 2.6 s, like the ref).' }, R.scene, c, dofAt(c, v)); }
  // 26 Theo: since Monday?
  { const R = cafe({ slice: false, dome: false }); table(R).rotation.y = Math.PI / 2; const t = seat(R.scene, 'theo', 'sit_talk', 1.4, 'shocked+blush', 'talkO+blush', TSEAT[0], TSEAT[1], -Math.PI / 2);
    const c = cu(t, 1.1, -0.05, 0.06, F50, [0, -0.13, 0]);
    shot({ id: '26', who: 'THEO', line: 'Since Monday?', clip: 'sit_talk (1.4 s)', face: 'shocked+blush / talkO+blush', lens: '50 mm', note: '' }, R.scene, c, dofAt(c, t)); }
  // 27 Vera at the door (sign now CLOSED), looks back over her shoulder: the callback
  { const R = cafe({ slice: false, dome: false, sign: 'closed' }); table(R).rotation.y = Math.PI / 2;
    const VP = [2.45, -0.62]; const v = put(R.scene, 'vera', 'flirt_over_shoulder', 1.25, 'bedroom', 'talkSmall', VP[0], VP[1], faceTo(VP, [2.35, 0.85]) - 0.6);
    const c = cam(F35, [2.35, 1.05, 0.85], [2.55, 1.55, -0.85]);
    shot({ id: '27', who: 'VERA', line: 'The usual, Theo?', clip: 'flirt_over_shoulder (1.25 s: body turned to the door, head back to him)', face: 'bedroom / talkSmall', lens: '35 mm, low (from his seat)', note: 'CALLBACK of the planted line, now with his name. She has flipped the door sign to CLOSED. 1.0 s beat before it.' },
      R.scene, c, { dof: { focus: c.position.distanceTo(head(v)), range: 0.4, max: 1.8 } }); }
  // 28 Theo CU, heart eyes
  { const R = cafe({ slice: false, dome: false, sign: 'closed' }); table(R).rotation.y = Math.PI / 2; const t = seat(R.scene, 'theo', 'sit_talk', 0.3, 'hearts+blush', 'blushSmile+blush', TSEAT[0], TSEAT[1], -Math.PI / 2);
    const c = cu(t, 1.0, 0.2, 0.05, F50, [0, -0.11, 0]);
    shot({ id: '28', who: 'THEO', line: 'The usual.', clip: 'sit_talk (0.3 s)', face: 'hearts+blush / blushSmile+blush', lens: '50 mm, slow push-in', note: 'Pink "ding" on the hearts.' }, R.scene, c, dofAt(c, t)); }
  // 29 TAIL: exterior wide from the cool street, the warm window, both at the table, CLOSED sign; no text
  { const R = cafe({ slice: false, dome: false, sign: 'closed' }); table(R).rotation.y = Math.PI / 2;
    seat(R.scene, 'theo', 'sit_talk', 0.3, 'hearts+blush', 'blushSmile+blush', TSEAT[0], TSEAT[1], -Math.PI / 2);
    seat(R.scene, 'vera', 'sit_chair', 1.0, 'happy', 'smile', VSEAT[0], VSEAT[1], Math.PI / 2);
    shot({ id: '29', who: '-', line: '', clip: 'Theo sit_talk; Vera sit_chair (back at the table)', face: 'Theo hearts+blush; Vera happy / smile', lens: '28 mm, exterior wide', note: 'Silent tail ~3 s, no subtitle. Street hum, the pendant glow through the glass. Fade out.' },
      R.scene, cam(F28, [6.6, 1.5, 2.3], [2.9, 1.25, 0.9])); }
}
