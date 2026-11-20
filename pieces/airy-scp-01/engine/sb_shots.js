// vera-02 "THE LAST CUP" storyboard shots: one still per shot at its final framing (MOONLITE DINER, rainy night).
// window.SB[i] = { id, who, line, clip, face, lens, note } (times come from work/timeline.json in tools/compose.py).
// Lenses (9:16 vertical): 28 mm = 66 deg vertical FOV (wides), 35 mm = 54, 50 mm = 40 (close-ups, bg blurred via shot.dof).
export function buildShots(L) {
  const { addShot, diner, character, holdAt, mug, coffeePot, umbrella, towel, rag, cam, box, plane, cyl, cvs, lam, basic, mesh, TX, POT, DOOR, BOOTH, JUKE, TABLE_H, WX, V3, THREE } = L;
  const SB = window.SB = [];
  const QS = new URLSearchParams(location.search);
  const F28 = 66, F35 = 54, F50 = 40;
  const WARM = 0xfff0dc, DOORT = 0xd4dcf0, WET = 0xe8ecf6, NEON = 0xffc4de;   // per-shot character tint: amber interior / cool rainy doorway / damp / jukebox glow
  const faceTo = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);   // ry so +z looks from -> to (x, z)
  let CHARS = [];
  // ---- FILM mode (sb.html?film): same shots, animated on engine/film_timeline.json (film pass, after the board is approved) ----
  const TL = L.TL, FPS = 30, SH = TL ? Object.fromEntries(TL.shots.map((x) => [x.id, x])) : {};
  const LOOP = /idle|hip_tilt|doorframe|sit_chair|sit_talk|hold_object|hold_cup|fan_collar|talk_nervous|talk_side|talk$/;
  if (TL) {   // passthesalt subtitle cards: one line each (<= 86 % width), timed on the whisper words (film_timeline cards)
    const mc = document.createElement('canvas').getContext('2d'); mc.font = '800 68px BarlowX'; const fit = (t) => mc.measureText(t).width <= 1080 * 0.86;
    const COLS = { airy: '#ffb6d6', guard: '#ffde4a' }; const out = [];
    const CARDS = []; for (const k of TL.cards) { const p = CARDS[CARDS.length - 1];
      if (p && p.spk === k.spk && p.shot === k.shot && k.text.split(/\s+/).length <= 2 && !/[.!]$/.test(p.text) && fit(p.text + ' ' + k.text)) CARDS[CARDS.length - 1] = { ...p, text: p.text + ' ' + k.text, end: k.end }; else CARDS.push({ ...k }); }
    for (const k of CARDS) if (SH[k.shot]) k.end = Math.min(k.end, SH[k.shot].t1);   // a card never runs into the next shot
    for (const k of CARDS) { const parts = []; let cur = '';
      if (!fit(k.text) && /, /.test(k.text)) { const ci = k.text.lastIndexOf(', '), a1 = k.text.slice(0, ci + 1), a2 = k.text.slice(ci + 2); if (fit(a1) && fit(a2)) { const n1 = a1.split(' ').length, n = k.text.split(' ').length, tm = k.start + (k.end - k.start) * n1 / n;
        out.push([k.start, tm, a1, COLS[k.spk] || '#ffffff'], [tm, k.end, a2, COLS[k.spk] || '#ffffff']); continue; } } for (const w of k.text.split(/\s+/)) { const t = (cur + ' ' + w).trim(); if (!fit(t) && cur) { parts.push(cur); cur = w; } else cur = t; } if (cur) parts.push(cur);
      const a = k.start, b = k.end, nw = parts.map((x) => x.split(' ').length), tot = nw.reduce((x, y) => x + y, 0); let acc = 0;
      parts.forEach((x, i) => { out.push([a + (b - a) * acc / tot, a + (b - a) * (acc + nw[i]) / tot, x, COLS[k.spk] || '#ffffff']); acc += nw[i]; }); }
    for (let i = 1; i < out.length; i++) if (out[i - 1][1] > out[i][0]) out[i - 1][1] = out[i][0];
    { const cut = TL.lines.find((l) => l.shot === '33').off + 0.15; for (const o of out) o[1] = Math.min(o[1], cut); }   // nothing on the black
    window.SUBS = out; }
  const mouthLv = (spk, T) => (TL ? +(TL.mouth[spk][Math.floor(T * FPS)] || 0) : 0);
  const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const PUSH = { '01': 0.05, '08': 0.08, '23': 0.06, '31': 0.05, '33': 0.04 };
  const MOSAIC = {};
  function filmUpdate(id, actors, camera, extra) {
    const dur = SH[id].t1 - SH[id].t0, base = camera.position.clone(), dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const quat = camera.quaternion.clone(), focus = extra.dof ? extra.dof.focus : (extra.pushDist ?? 3), push = PUSH[id] ?? 0.04;
    return (lt, T, ltReal) => {
      for (const a0 of actors) {
        let a = a0; const c = a.c, clip = THREE.AnimationClip.findByName(L.CH[a.kind].clips, a.clip), D = clip ? clip.duration : 1;
        let ct = a.act ? lt - a.act.start : a.t - 0.45 * dur + lt;
        if (LOOP.test(a.clip) && !a.act) { if (D >= dur + 0.05) ct = Math.min(Math.max(0, a.t - 0.45 * dur), D - dur - 0.02) + lt;   // no wrap inside a shot (clips are not seamless loops)
          else { const u = ((ct % (2 * D)) + 2 * D) % (2 * D); ct = u < D ? u : 2 * D - u; } }                                  // short clip: ping-pong, never a jump back to frame 0
        else ct = Math.min(D - 1e-3, Math.max(0, ct));
        if (a.move) { const k = ease((lt - a.move.t0) / (a.move.t1 - a.move.t0)); c.root.position.x = a.move.from[0] + (a.move.to[0] - a.move.from[0]) * k; c.root.position.z = a.move.from[1] + (a.move.to[1] - a.move.from[1]) * k;
          if (lt > a.move.t0 && lt < a.move.t1) { a = { ...a, clip: 'walk' }; ct = (lt - a.move.t0) % L.CH[a.kind].clips.find((x) => x.name === 'walk').duration; } else if (lt >= a.move.t1 && a.move.after) { c.root.rotation.y = a.move.after[0]; a = { ...a, clip: a.move.after[1] }; ct = Math.min(a.move.after[2] + lt - a.move.t1, 2); } }
        const blush = /\+blush/.test(a.mouth) ? '+blush' : '', lv = TL.mouth[a.kind] ? mouthLv(a.kind, T) : 0, fr = Math.floor(T * FPS);
        let eyes = a.eyes, mouth = a.mouth;
        if (lv > 0) mouth = (lv === 1 ? 'talkSmall' : ['talkA', 'talkO', 'talkSmall'][(fr >> 2) % 3]) + blush;
        else if (/^talk/.test(mouth)) mouth = 'smile' + blush;
        const per = 3.4 + (a.kind === 'vera' ? 0.0 : 0.9), ph = (T + (a.kind === 'vera' ? 0.4 : 1.7)) % per;
        if (ph < 0.12 && a.kind !== 'airy' && !/blink|happy|wink|hearts|closed|relaxed/.test(eyes)) eyes = 'blink' + (/\+blush/.test(eyes) ? '+blush' : '');
        c.pose(a.clip, ct, eyes, mouth);
        if (a.seat) { const P = c.world('Pelvis'); c.root.position.x += a.seat[0] - P.x; c.root.position.z += a.seat[1] - P.z; c.root.updateMatrixWorld(true); }
        c._lt = lt; c._lv = lv; for (const f of c.fix || []) f();
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
    if (TL) { const S = SH[meta.id], upd = filmUpdate(meta.id, actors, camera, extra); SB.push(meta); addShot(scene, camera, { ...extra, t0: S.t0, mosaic: MOSAIC[meta.id] || 0, fadeOut: meta.id === '33' ? 0.04 : 0, fadeAt: meta.id === '33' ? TL.lines.find((l) => l.shot === '33').off + 0.15 - S.t0 : S.t1 - S.t0, update: upd }); return; }
    if (ONLY && !ONLY.split(',').includes(meta.id)) return; SB.push(meta); addShot(scene, camera, extra); };
  // a held prop that follows its bone every frame in the film (levelRy: keep the prop upright with this yaw)
  const hold = (scene, c, bone, prop, off, rot, levelRy) => {
    const f = () => { holdAt(scene, c, bone, prop, off, rot); if (levelRy !== undefined) prop.rotation.set(0, levelRy, 0); };
    f(); (c.holds = c.holds || []).push(f); return prop; };
  const put = (scene, kind, clip, t, eyes, mouth, x, z, ry, tint = WARM, shadow = 0.5) => {
    const c = character(kind, { tint, shadow }); CHARS.push(c); c.anim = { kind, clip, t, eyes, mouth }; c.pose(clip, t, eyes, mouth); c.root.position.set(x, 0, z); c.root.rotation.y = ry; if (!QS.has('nochar')) scene.add(c.root); c.root.updateMatrixWorld(true); return c; };
  const head = (c) => (c.kind === 'guard' ? c.world('Head', [0, 0, 0]).add(V3(0, 0.06, 0)) : c.world('Head', [0, 0.45, 0.1]));
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
    const gd = c.kind === 'guard'; const A = c.bone(gd ? 'Upper_Arm' + side : 'UpperArm.' + side), B = c.bone(gd ? 'Lower_Arm' + side : 'Forearm.' + side), C = c.bone(gd ? 'Hand' + side : 'Hand.' + side); c.root.updateMatrixWorld(true);
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
  // bind-pose local rotation of a bone (from the skin's inverse bind matrices): relaxed hands/fingers after arm IK
  const bindQ = (c, n) => { c._bq = c._bq || {}; if (c._bq[n]) return c._bq[n]; let sk = null; c.root.traverse((o) => { if (!sk && o.isSkinnedMesh) sk = o.skeleton; });
    const b = c.bone(n), i = sk.bones.indexOf(b), W = sk.boneInverses[i].clone().invert(), pi = sk.bones.indexOf(b.parent);
    const Lm = pi >= 0 ? sk.boneInverses[pi].clone().multiply(W) : W, q = new THREE.Quaternion(); Lm.decompose(_v(), q, _v()); return (c._bq[n] = q); };
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

  // ---- airy-scp-01: SCP-173 chamber (SCP:CB room, baked lightmaps -> unlit materials) ----
  function chamber() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c0d10);
    const room = L.PROP.room173.clone(true);
    room.traverse((o) => { if (!o.isMesh) return; o.frustumCulled = false; const conv = (m) => { if (m.map) L.nearest(m.map);
      const glass = /glass/.test(m.name); const b = new THREE.MeshBasicMaterial({ name: m.name, map: m.map || null, color: m.map ? 0xffffff : (m.color || 0xffffff), transparent: glass || m.transparent, opacity: glass ? 0.25 : 1, alphaTest: m.alphaTest || 0, side: THREE.DoubleSide, depthWrite: !glass, clippingPlanes: QS.get('clipy') ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), +QS.get('clipy'))] : null });
      return b; }; o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material); });
    scene.add(room); scene.add(new THREE.HemisphereLight(0xf2f4ff, 0x40444c, 1.6)); const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(2, 5, 3); scene.add(dl);
    return { scene, room };
  }
  const statue = (scene, x, z, ry) => { const s = L.PROP.scp173.clone(true); s.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; if (o.material.map) L.nearest(o.material.map); o.material = new THREE.MeshLambertMaterial({ map: o.material.map, color: 0xffffff }); } });
    const bb = new THREE.Box3().setFromObject(s); const k = 2.0 / (bb.max.y - bb.min.y); s.scale.setScalar(k); s.position.set(x, -bb.min.y * k + FL, z); s.rotation.y = ry; scene.add(s); return s; };
  const FL = 2.67;   // chamber floor height (room173 upper level); cell x 28.3..39, z -7.8..-16.4, gate on the x = 28.3 wall
  const putF = (scene, kind, clip, t, eyes, mouth, x, z, ry, tint = 0xffffff) => { const c = put(scene, kind, clip, t, eyes, mouth, x, z, ry, tint, 0.35); c.root.position.y = FL; c.root.updateMatrixWorld(true); return c; };
  if (!QS.has('vera') && !QS.has('look') && !QS.has('test')) {   // ===== airy-scp-01 "Who blinks first": 33 shots, one per line =====
    // v2 (user review 2026-11-20): Airy's OWN UpNext clips (idle_shy = hand on chest is her base), ref framing (passthesalt: medium
    // head-to-knee singles, OTS with the listener soft at the frame edge, few CUs), guard empty-handed with IK talk gestures + head nods.
    const S1 = [36.2, -13.6], S2 = [34.9, -13.1], S3 = [30.98, -12.57];   // S3: just behind the pair, on the far side of the 32 profile two-shot   // 173 creeps closer every time nobody looks
    const A = [32.6, -12.0], G = [31.2, -11.2], A2 = [32.05, -11.68];   // G->A extended hits 173: over-the-guard shots on Airy show the statue behind her
    const plateTex = () => cvs(128, 80, (c, w, h) => { c.fillStyle = '#d9d6cc'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.fillRect(3, 3, w - 6, 3); c.fillRect(3, h - 6, w - 6, 3);
      c.font = '700 22px Verdana'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SCP-173', w / 2, 26); c.font = '700 13px Verdana'; c.fillStyle = '#c8a020'; c.fillRect(30, 44, 68, 18); c.fillStyle = '#111'; c.fillText('EUCLID', w / 2, 54);
      c.font = '700 8px Verdana'; c.fillStyle = '#444'; c.fillText('DO NOT BREAK EYE CONTACT', w / 2, 71); });
    const set = (sPos, { stains = true } = {}) => { const R = chamber(); const st = statue(R.scene, sPos[0], sPos[1], faceTo(sPos, [(A[0] + G[0]) / 2, (A[1] + G[1]) / 2]));
      { const rc = new THREE.Raycaster(V3(31, FL + 1.5, -8.25), V3(-1, 0, 0)); R.room.updateMatrixWorld(true); const h = rc.intersectObject(R.room, true)[0]; const wx = h ? h.point.x + 0.015 : 28.4; R.plateX = wx; plane(0.64, 0.4, basic(plateTex()), wx, FL + 1.5, -8.25, R.scene, Math.PI / 2); }
      if (stains) { const r = (k) => ((Math.sin(k * 91.7) * 43758.5) % 1 + 1) % 1; for (let i = 0; i < 9; i++) { const d = mesh(new THREE.CircleGeometry(0.06 + r(i) * 0.16, 9), basic(null, 0x4a1410, { transparent: true, opacity: 0.85, depthWrite: false }), S1[0] + (r(i + 3) - 0.5) * 1.4, FL + 0.004 + i * 0.0004, S1[1] + (r(i + 7) - 0.5) * 1.4, R.scene); d.rotation.x = -Math.PI / 2; d.scale.set(1, 0.6 + r(i + 11), 1); } }
      return { R, sc: R.scene, st }; };
    const airy = (sc, clip, t, eyes, mouth, pos = A, look = G) => putF(sc, 'airy', clip, t, eyes, mouth, pos[0], pos[1], faceTo(pos, look));
    // guard gestures: character-local hand targets (x = his left, y up from the feet, z forward); 'pt' = arm toward g.ptAt
    const REST = { R: [-0.34, 0.9, 0.06], L: [0.34, 0.9, 0.06] };
    const GEST = { rest: REST,
      palm: { R: [-0.2, 1.1, 0.38], L: REST.L }, palm2: { R: [-0.32, 1.08, 0.34], L: [0.32, 1.08, 0.34] }, shrug: { R: [-0.42, 1.02, 0.2], L: [0.42, 1.02, 0.2] },
      stop: { R: [-0.12, 1.42, 0.46], L: REST.L }, chop: { R: [-0.1, 1.22, 0.42], L: REST.L }, pt: { R: 'pt', L: REST.L }, ptL: { R: REST.R, L: 'pt' },
      visor: { R: [-0.02, 1.7, 0.17], L: REST.L }, hips: { R: [-0.21, 1.02, -0.03], L: [0.21, 1.02, -0.03] } };
    const guard = (sc, gest = 'rest', look = A, pos = G, { ptAt = null, nod = 0, t = 1.2 } = {}) => { const g = putF(sc, 'guard', 'idle', t, null, null, pos[0], pos[1], faceTo(pos, look));
      { const H = g.world('Head'); g.root.position.x -= H.x - pos[0]; g.root.position.z -= H.z - pos[1]; g.root.updateMatrixWorld(true); }   // CB mesh sits ~0.5 m ahead of its root: centre the body on pos
      fix(g, () => { const pb = g.bone('Paper'); if (pb) pb.scale.setScalar(0.001); });
      fix(g, () => { const lt = g._lt ?? 9, lv = g._lv ?? 0, w = TL ? ease((lt - 0.1) / 0.4) : 1, G2 = GEST[gest];
        for (const sd of ['R', 'L']) { let T = G2[sd], T0 = lp(g, ...REST[sd]);
          if (T === 'pt') { const sh = g.world(sd === 'R' ? 'Upper_ArmR' : 'Upper_ArmL'); const d = (ptAt ? V3(ptAt[0], FL + 1.2, ptAt[1]) : V3(0, 0, 0)).sub(sh).normalize(); T = sh.clone().addScaledVector(d, 0.58); } else T = lp(g, ...T);
          const beat = TL && gest !== 'rest' ? 0.025 * Math.sin(lt * 9) * Math.min(1, lv) : 0; T = T0.clone().lerp(T, w); T.y += beat;
          const fwd = G2[sd] !== REST[sd]; ik2(g, sd, T, lp(g, sd === 'R' ? -0.65 : 0.65, fwd ? 0.55 : 0.95, fwd ? -0.25 : -0.55));
          for (const n of ['Hand', 'Fingers01.', 'Fingers02.', 'Thumb01.', 'Thumb02.']) { const bn = n === 'Hand' ? 'Hand' + sd : n + sd, b = g.bone(bn); if (b) b.quaternion.copy(bindQ(g, bn)); }
          g.root.updateMatrixWorld(true); }
        const hd = TL ? (0.07 * Math.min(1, lv) * (0.6 + 0.4 * Math.sin(lt * 7.3)) + nod) : nod; if (hd) lean(g, hd, 'Head'); });
      if (QS.has('gdbg')) { const H = g.world('Head'), F = g.world('Foot.L'); console.log('GDBG root', g.root.position.toArray().map((v) => v.toFixed(2)).join(','), 'head', H.toArray().map((v) => v.toFixed(2)).join(','), 'foot', F ? F.toArray().map((v) => v.toFixed(2)).join(',') : '-'); }
      return g; };
    const M = (id, who, line, clip, face, lens, note = '') => ({ id, who, line, clip, face, lens, note });
    const dof = (c, P, range = 0.3, max = 2.4) => ({ dof: { focus: c.position.distanceTo(P), range, max } });
    const drops = () => { const g = new THREE.Group(); cyl(0.013, 0.016, 0.05, 10, basic(null, 0xf2f2f2), 0, 0.025, 0, g); cyl(0.005, 0.009, 0.025, 8, basic(null, 0xd8402a), 0, 0.062, 0, g); return g; };
    // phone held in both cupped hands (phone_look): centred between the wrists, screen tilted up to her face
    const phone = (sc, a) => { const g = new THREE.Group(); box(0.068, 0.142, 0.008, basic(null, 0x141416), 0, 0, 0, g); box(0.058, 0.124, 0.002, basic(null, 0x3a5a8c), 0, 0.002, 0.0046, g); sc.add(g);
      const f = () => { const L = a.world('Hand.L'), R = a.world('Hand.R'), ry = a.root.rotation.y, F = V3(Math.sin(ry), 0, Math.cos(ry)), U = V3(0, 1, 0), k = 35 * Math.PI / 180;
        const Y = F.clone().multiplyScalar(Math.cos(k)).addScaledVector(U, Math.sin(k)), Z = U.clone().multiplyScalar(Math.cos(k)).addScaledVector(F, -Math.sin(k)), X = Y.clone().cross(Z);
        g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); g.position.copy(L.add(R).multiplyScalar(0.5)).addScaledVector(F, 0.05).addScaledVector(U, 0.025); g.updateMatrixWorld(true); };
      f(); (a.holds = a.holds || []).push(f); return g; };
    const HT = (c) => (c.kind === 'guard' ? 1.86 : 1.62);
    const base = (c) => { if (c.kind !== 'guard') return c.root.position.clone(); const H = c.world('Head'); return V3(H.x, c.root.position.y, H.z); };   // body xz (guard root is offset)
    const chest = (c) => { const P = base(c); return V3(P.x, P.y + HT(c) * 0.74, P.z); };
    // ref single: kind ms = head..knees, mcu = head..chest, mws = full body; yaw = angle off the subject's facing (+ = her left)
    const frame = (c, kind = 'ms', yaw = 0.4, fov = F50, { dy = 0, side = 0 } = {}) => { if (c.kind === 'guard' && kind === 'mcu') kind = 'ms';   // helmet + visor: the ref never goes tighter than chest-up on the guards
      const H = HT(c), top = H + (kind === 'mcu' ? 0.05 : 0.2), bot = { mws: -0.06, ms: H * 0.34, mcu: H * 0.64 }[kind], span = (top - bot) * 1.06, ctr = (top + bot) / 2;
      const d = span / 2 / Math.tan(fov * Math.PI / 360), ry = c.root.rotation.y + yaw, P = base(c), sx = Math.cos(ry) * side, sz = -Math.sin(ry) * side;
      return cam(fov, [P.x + Math.sin(ry) * d + sx, P.y + ctr - 0.12 + dy, P.z + Math.cos(ry) * d + sz], [P.x + sx, P.y + ctr, P.z + sz]); };
    const at = (c) => base(c).setY(c.root.position.y + HT(c) * 0.8);

    { const { sc } = set(S1); const a = airy(sc, 'hair_tuck', 1.0, 'bedroom', 'smirk', A, S1);   // hook: the statue soft in the fg, Airy flirting with it
      const S = V3(S1[0], FL + 1.55, S1[1]), d = at(a).sub(S).setY(0).normalize(); const c = cam(F50, [S.x - d.x * 0.35 - d.z * 0.42, FL + 1.45, S.z - d.z * 0.35 + d.x * 0.42], [at(a).x, FL + 1.0, at(a).z]);
      const D = dof(c, at(a), 0.5, 2.6), f = D.dof.focus, aim = V3(S1[0], FL + 1.15, S1[1]), dS = V3(A[0], 0, A[1]).sub(V3(S1[0], 0, S1[1])).normalize();   // note #1: she speaks, then CUT to what she is talking to (173)
      const c2 = cam(F50, [aim.x + dS.x * f + dS.z * 0.7, FL + 1.3, aim.z + dS.z * f - dS.x * 0.7], [aim.x, aim.y, aim.z]);
      const cutT = TL ? TL.cards.find((k) => k.shot === '01').end - SH['01'].t0 : 1;
      shot(M('01', 'AIRY', 'Hi, handsome. Do you ever... blink?', 'hair_tuck', 'bedroom/smirk', '35', 'HOOK: Airy flirting (173 soft fg), then cut to 173 on "Do you ever... blink?"'), sc, c,
        { ...D, custom: (lt) => { if (TL && lt >= cutT) { c.position.copy(c2.position); c.quaternion.copy(c2.quaternion); c.updateMatrixWorld(true); } } }); }
    { const { sc } = set(S1); airy(sc, 'idle_shy', 0.5, 'open', 'neutral', A, S1); const g = guard(sc, 'stop'); const c = frame(g, 'ms', 0.42);
      shot(M('02', 'GUARD', 'Step away from the statue. Slowly.', 'idle', 'palm out (stop)', '50', 'ms guard, Airy shoulder soft at the edge'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S1); const a = airy(sc, 'talk_cute', 0.7, 'tease', 'smile'); guard(sc); const c = frame(a, 'ms', -0.38);
      shot(M('03', 'AIRY', "Relax, we're just talking. He's the strong, silent type.", 'talk_cute', 'tease/smile', '50', 'ms Airy, OTS guard soft; 173 behind her'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); airy(sc, 'idle_shy', 0.8, 'open', 'neutral'); const g = guard(sc, 'pt', A, G, { ptAt: S1 }); const c = frame(g, 'ms', -0.36);
      shot(M('04', 'GUARD', "He's the strong, silent, snap-your-neck type.", 'idle', 'points at 173', '50', 'ms guard over Airy'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S1); const a = airy(sc, 'idle_shy', 1.4, 'dreamy', 'softSmile', A, S1); guard(sc); const c = frame(a, 'mcu', 0.55);
      shot(M('05', 'AIRY', 'Rude. Look at those cheekbones.', 'idle_shy', 'dreamy/softSmile', '50', 'mcu, hand on chest, dreamy at 173'), sc, c, dof(c, chest(a), 0.25)); }
    { const { R, sc } = set(S1); const c = cam(F50, [R.plateX + 1.05, FL + 1.45, -8.75], [R.plateX, FL + 1.5, -8.25]); shot(M('06', 'GUARD', "That's SCP-173.", '-', '-', '50', 'INSERT: containment plate'), sc, c); }
    { const { sc } = set(S1); const a = airy(sc, 'phone_look', 0.9, 'sparkle', 'grin'); phone(sc, a); guard(sc); const c = frame(a, 'ms', -0.42);
      shot(M('07', 'AIRY', 'Is that his number?', 'phone_look', 'sparkle/grin', '50', 'ms Airy, phone out'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); airy(sc, 'idle_shy', 0.3, 'open', 'neutral'); guard(sc); const c = cam(F35, [S1[0] - 1.5, FL + 0.35, S1[1] + 1.05], [S1[0], FL + 1.45, S1[1]]);
      shot(M('08', 'GUARD', "It moves when nobody's looking at it.", '-', '-', '35', 'INSERT: low angle on 173'), sc, c); }
    { const { sc } = set(S1); const a = airy(sc, 'idle_shy', 0.9, 'happy+blush', 'blushSmile+blush', A, S1); guard(sc); const c = frame(a, 'ms', 0.35);
      shot(M('09', 'AIRY', "Aww, so he's shy.", 'idle_shy', 'happy/blushSmile +blush', '50', 'hand on chest, melts'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); airy(sc, 'idle_shy', 1.1, 'open', 'neutral'); const g = guard(sc, 'chop'); const c = frame(g, 'ms', 0.3);
      shot(M('10', 'GUARD', "One blink. That's all he needs to cross this room and break your neck.", 'idle', 'chop gesture, nods', '50', 'ms guard'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S1); const a = airy(sc, 'think', 0.9, 'lookUp', 'lipBite'); guard(sc); const c = frame(a, 'mcu', -0.4);
      shot(M('11', 'AIRY', 'What happened to the last girl who stared at him?', 'think', 'lookUp/lipBite', '50', 'mcu Airy, curious'), sc, c, dof(c, chest(a), 0.25)); }
    { const { sc } = set(S1); airy(sc, 'idle_shy', 1.3, 'open', 'neutral'); const g = guard(sc, 'rest', S1, G, { nod: 0.06 }); const c = frame(g, 'mcu', 0.55);
      shot(M('12', 'GUARD', 'Which part of her?', 'idle', 'arms down, head to 173', '50', 'mcu guard, deadpan'), sc, c, dof(c, chest(g), 0.25)); }
    { const { sc } = set(S1); const a = airy(sc, 'hand_on_hip', 0.9, 'wink', 'smirk'); guard(sc); const c = frame(a, 'ms', 0.4);
      shot(M('13', 'AIRY', "Okay, but he'd have to make the first move.", 'hand_on_hip', 'wink/smirk', '50', 'ms, hip + wink'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); airy(sc, 'hand_on_hip', 1.0, 'open', 'neutral'); const g = guard(sc, 'palm2'); const c = frame(g, 'ms', -0.32);
      shot(M('14', 'GUARD', 'That... is literally the problem.', 'idle', 'both palms out', '50', 'ms guard, exasperated'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S1); const c = cam(F35, [S1[0] - 1.5, FL + 1.3, S1[1] + 0.9], [S1[0] - 0.1, FL + 0.1, S1[1] + 0.1]); shot(M('15', 'GUARD', 'And every week somebody mops his cell. Nobody knows what that red stuff is.', '-', '-', '35', 'INSERT: red stains at 173 feet'), sc, c); }
    { const { sc } = set(S1); const a = airy(sc, 'arms_crossed', 0.9, 'eyeRoll', 'pout'); guard(sc); const c = frame(a, 'ms', -0.36);
      shot(M('16', 'AIRY', 'A man who leaves a mess. Red flag.', 'arms_crossed', 'eyeRoll/pout', '50', 'ms, arms crossed'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); const a = airy(sc, 'idle_cute', 0.9, 'bedroom', 'smile'); guard(sc); const c = frame(a, 'ms', 0.24);
      shot(M('17', 'AIRY', "Fine. I'll stare at him all night. I'm amazing at eye contact.", 'idle_cute', 'bedroom/smile', '50', 'OTS over the guard, slow blink at him'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); const a = airy(sc, 'hold_object', 0.9, 'open', 'smile'); hold(sc, a, 'Hand.R', drops(), [0, 0.09, 0.03], [0, 0, 0], 0); const g = guard(sc, 'pt', A, G, { ptAt: A }); const c = frame(g, 'ms', 0.36);
      shot(M('18', 'GUARD', 'Then why are you holding eye drops?', 'idle', 'points at her hand', '50', 'ms guard'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S1); const a = airy(sc, 'hold_object', 1.0, 'happy', 'smile'); hold(sc, a, 'Hand.R', drops(), [0, 0.09, 0.03], [0, 0, 0], 0); guard(sc); const c = frame(a, 'ms', -0.3);
      shot(M('19', 'AIRY', 'My eyes get dry when I flirt.', 'hold_object', 'happy/smile', '50', 'ms, eye drops in hand'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); airy(sc, 'hold_object', 1.0, 'open', 'neutral'); const g = guard(sc, 'stop'); const c = frame(g, 'ms', -0.4);
      shot(M('20', 'GUARD', 'Wait, wait, wait. You put those in. In here.', 'idle', 'palm out', '50', 'ms guard'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S1); const a = airy(sc, 'talk_cute', 1.0, 'winkR', 'grin'); guard(sc); const c = frame(a, 'ms', 0.4);
      shot(M('21', 'AIRY', 'Only one eye! The other one was watching him.', 'talk_cute', 'winkR/grin', '50', 'ms Airy'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S1); airy(sc, 'idle_shy', 1.2, 'open', 'neutral'); const g = guard(sc, 'rest', A, G, { nod: -0.04 }); const c = frame(g, 'mcu', 0.4);
      shot(M('22', 'GUARD', '...Which one?', 'idle', 'still', '50', 'mcu guard'), sc, c, dof(c, chest(g), 0.25)); }
    { const { sc } = set(S2); const a = airy(sc, 'surprised', 0.6, 'shocked', 'oh'); guard(sc); const c = frame(a, 'ms', 0.12, F50, { side: 0.12 });
      shot(M('23', 'AIRY', '...Oh.', 'surprised', 'shocked/oh', '50', 'SILENCE ~1 s: 173 closer behind her'), sc, c, dof(c, chest(a), 0.5, 1.6)); }
    { const { sc } = set(S2); airy(sc, 'idle_shy', 1.0, 'open', 'neutral'); const g = guard(sc, 'pt', A, G, { ptAt: S2 }); const c = frame(g, 'mws', -0.75, F35);
      shot(M('24', 'GUARD', 'Protocol is three people in here. You blink, you say it out loud.', 'idle', 'points at 173', '35', 'medium-wide two-shot'), sc, c, dof(c, chest(g), 0.8, 2.0)); }
    { const { sc } = set(S2); const a = airy(sc, 'idle_shy', 0.7, 'bedroomSide', 'smirk', A2); guard(sc, 'rest', A2); const c = frame(a, 'ms', -0.5);
      shot(M('25', 'AIRY', 'Three? Two is way more romantic.', 'idle_shy', 'bedroomSide/smirk', '50', 'she steps in close, hand on chest'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S2); airy(sc, 'idle_shy', 0.9, 'open', 'neutral', A2); const g = guard(sc, 'chop', A2); const c = frame(g, 'mcu', 0.4);
      shot(M('26', 'GUARD', "Don't.", 'idle', 'small chop', '50', 'mcu guard'), sc, c, dof(c, chest(g), 0.25)); }
    { const { sc } = set(S2); const a = airy(sc, 'hands_on_hips', 0.9, 'gazeR', 'smirkL', A2); guard(sc, 'rest', A2); const c = frame(a, 'ms', 0.45);
      shot(M('27', 'AIRY', 'Is that a no, or a not-in-front-of-him?', 'hands_on_hips', 'gazeR/smirkL', '50', 'side-eye at 173'), sc, c, dof(c, chest(a))); }
    { const { sc } = set(S2); airy(sc, 'hands_on_hips', 1.0, 'open', 'neutral', A2); const g = guard(sc, 'hips', A2); const c = frame(g, 'ms', -0.34);
      shot(M('28', 'GUARD', "It's a no.", 'idle', 'hands on hips', '50', 'ms guard over Airy'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S2); const a = airy(sc, 'talk_cute', 0.8, 'dreamy+blush', 'softSmile+blush', A2); const g = guard(sc, 'rest', A2); const mid = at(a).lerp(at(g), 0.5);
      const d = at(g).sub(at(a)).setY(0).normalize(); const c = cam(F35, [mid.x + d.z * 2.7, FL + 1.3, mid.z - d.x * 2.7], [mid.x, FL + 1.25, mid.z]);
      shot(M('29', 'AIRY', 'Your eyes are kinda pretty, by the way.', 'talk_cute', 'dreamy/softSmile +blush', '50', 'profile two-shot, close to his visor'), sc, c, dof(c, mid, 0.5, 2.0)); }
    { const { sc } = set(S2); airy(sc, 'idle_shy', 1.0, 'open', 'neutral', A2); const g = guard(sc, 'visor', A2); const c = frame(g, 'ms', 0.34);
      shot(M('30', 'GUARD', "You can't even see my eyes.", 'idle', 'taps his visor', '50', 'ms guard'), sc, c, dof(c, chest(g))); }
    { const { sc } = set(S2); const a = airy(sc, 'hair_tuck', 1.0, 'wink+blush', 'smirk+blush', A2); guard(sc, 'rest', A2); const c = frame(a, 'mcu', -0.42);
      shot(M('31', 'AIRY', 'I can tell.', 'hair_tuck', 'wink/smirk +blush', '50', 'mcu, hair tuck + wink'), sc, c, dof(c, chest(a), 0.25)); }
    { const { sc } = set(S3); const a = airy(sc, 'idle_shy', 0.6, 'soft+blush', 'softSmile+blush', A2); const g = guard(sc, 'rest', A2); const mid = at(a).lerp(at(g), 0.5);
      const d = at(g).sub(at(a)).setY(0).normalize(); const c = cam(F35, [mid.x + d.z * 3.4, FL + 1.35, mid.z - d.x * 3.4], [mid.x - d.z * 0.6, FL + 1.3, mid.z + d.x * 0.6]);
      shot(M('32', '-', '', 'idle_shy', 'soft/softSmile +blush', '35', 'SILENCE 2 s: they gaze at each other; 173 right behind them'), sc, c, dof(c, mid, 0.8, 2.0)); }
    { const { sc } = set(S3); airy(sc, 'idle_shy', 0.6, 'soft+blush', 'softSmile+blush', A2); const g = guard(sc, 'rest', A2, G, { nod: 0.03 }); const c = frame(g, 'mcu', 0.5);
      shot(M('33', 'GUARD', '...Neither of us is looking at him, are we?', 'idle', 'still, deadpan', '50', 'mcu guard; then CUT TO BLACK + stone crack'), sc, c, dof(c, chest(g), 0.25)); }
    return;
  }
  if (QS.has('test')) {
    const R = chamber(); const S173 = [36.2, -13.6]; statue(R.scene, S173[0], S173[1], faceTo(S173, [31, -10.5]));
    const A = [31.4, -10.9], G = [30.6, -11.9];
    const a = putF(R.scene, 'airy', 'flirty_wink', 0.8, 'wink', 'smirk', A[0], A[1], faceTo(A, S173));
    if (QS.get('gbones')) {   // guard sheet: which bone carries the rifle (scale one bone to 0 per still)
      for (const bn of QS.get('gbones').split(',')) { const sc = chamber().scene; const g = putF(sc, 'guard', 'idle', 1.0, null, null, A[0], A[1], faceTo(A, [A[0] - 1, A[1] + 1.2]));
        const b = g.bone(bn); if (b) { b.scale.setScalar(0.001); g.root.updateMatrixWorld(true); } else console.log('NOBONE', bn);
        const E = head(g); SB.push({ id: bn }); addShot(sc, cam(F35, [E.x - 1.9, E.y - 0.6, E.z + 2.2], [E.x, E.y - 0.8, E.z])); }
      return; }
    if (QS.get('clips')) {   // clip sheet: one full-body front still per clip at ?t=
      for (const cl of QS.get('clips').split(',')) { const sc = chamber().scene; const p = putF(sc, 'airy', cl, +(QS.get('t') || 0.8), QS.get('eyes') || null, QS.get('mouth') || null, A[0], A[1], faceTo(A, [A[0] - 1, A[1] + 1.2]));
        const E = head(p); SB.push({ id: cl }); addShot(sc, cam(F35, [E.x - 1.55, E.y - 0.55, E.z + 1.85], [E.x, E.y - 0.7, E.z])); }
      return; }
    const g = putF(R.scene, 'guard', 'idle', 1.0, null, null, G[0], G[1], faceTo(G, A));
    SB.push({ id: 'wide' }); addShot(R.scene, cam(F28, [29.0, FL + 1.55, -8.4], [34.5, FL + 1.0, -13.2]));
    { const c = cu(a, 1.1, 0.5, -0.02); SB.push({ id: 'airy' }); addShot(R.scene, c, dofAt(c, a, 0.25, 2.4)); }
    { const E = g.world('Head', [0, 0, 0]); const c = cam(F50, [E.x + 0.9, E.y - 0.05, E.z + 0.75], [E.x, E.y - 0.12, E.z]); SB.push({ id: 'guard' }); addShot(R.scene, c, { dof: { focus: c.position.distanceTo(E), range: 0.25, max: 2.4 } }); }
    { const c = cam(F35, [33.4, FL + 0.35, -11.5], [36.2, FL + 1.5, -13.6]); SB.push({ id: 'low173' }); addShot(R.scene, c); }
    return;
  }
  if (QS.has('look')) {
    const R = chamber(); const bb = new THREE.Box3().setFromObject(R.room); console.log('ROOM', bb.min.toArray().map((v) => v.toFixed(2)), bb.max.toArray().map((v) => v.toFixed(2)));
    const ctr = bb.getCenter(V3(0, 0, 0)), sz = bb.getSize(V3(0, 0, 0));
    if (QS.has('map')) { const rc = new THREE.Raycaster(); R.room.updateMatrixWorld(true); const rows = [];
      for (let x = Math.floor(bb.min.x); x <= bb.max.x; x += 1) { let row = ''; for (let z = Math.ceil(bb.max.z); z >= bb.min.z; z -= 1) {
        rc.set(V3(x + 0.5, 1.2, z - 0.5), V3(0, -1, 0)); let h = rc.intersectObject(R.room, true)[0]; if (!h) { rc.set(V3(x + 0.5, 12, z - 0.5), V3(0, -1, 0)); h = rc.intersectObject(R.room, true)[0]; }
        if (!h) { row += ' '; continue; } const fy = h.point.y; rc.set(V3(x + 0.5, fy + 0.05, z - 0.5), V3(0, 1, 0)); const u = rc.intersectObject(R.room, true)[0]; const ch = u ? u.point.y - fy : 99;
        row += fy < -2 ? 'v' : fy > 1.5 ? '^' : (ch < 1.8 ? '#' : ch < 3.5 ? '.' : ch < 6 ? 'o' : 'O'); }
        rows.push(String(x).padStart(3) + ' ' + row); } R.room.traverse((o) => { if (!o.isMesh) return; const g = o.geometry, P = g.attributes.position, I = g.index, mats = Array.isArray(o.material) ? o.material : [o.material]; const groups = g.groups.length ? g.groups : [{ start: 0, count: I ? I.count : P.count, materialIndex: 0 }];
          for (const gr of groups) { const b = new THREE.Box3(), v = V3(0, 0, 0); for (let i = gr.start; i < gr.start + gr.count; i++) { v.fromBufferAttribute(P, I ? I.getX(i) : i).applyMatrix4(o.matrixWorld); b.expandByPoint(v); }
            const n = mats[gr.materialIndex].name; if (/label|logo|door01|glass|vent|misc|whitewall|metal3/.test(n)) console.log('MATBB', o.name, n, b.min.toArray().map((q) => q.toFixed(1)).join(','), '|', b.max.toArray().map((q) => q.toFixed(1)).join(',')); } });
        for (const [px, pz] of [[20, -8], [25, -12], [30, -15], [35, -12], [12, -3], [3, 0], [3, 5]]) { rc.set(V3(px, 20, pz), V3(0, -1, 0)); console.log('HITS', px, pz, rc.intersectObject(R.room, true).map((h) => h.point.y.toFixed(2) + ':' + h.object.material.name).join(' ')); }
        console.log('MAP z from ' + Math.ceil(bb.max.z) + ' (left) down to ' + Math.floor(bb.min.z) + '\n' + rows.join('\n')); }
    SB.push({ id: 'top' }); addShot(R.scene, cam(40, [ctr.x, 72, ctr.z + 0.01], [ctr.x, 0, ctr.z], Math.PI / 2));
    for (let gx = Math.ceil(bb.min.x / 5) * 5; gx <= bb.max.x; gx += 5) for (let gz = Math.ceil(bb.min.z / 5) * 5; gz <= bb.max.z; gz += 5) { const m = box(0.5, 0.05, 0.5, basic(null, gx === 0 && gz === 0 ? 0xff0000 : (gx === 0 ? 0x00ff00 : (gz === 0 ? 0x0080ff : 0xffff00))), gx, 0.3, gz, R.scene); void m; }
    for (const spec of (QS.get('cams') || '').split(';').filter(Boolean)) { const lk = spec.split(',').map(Number); SB.push({ id: 'cam' }); addShot(R.scene, cam(lk[6] || 66, lk.slice(0, 3), lk.slice(3, 6))); }
    return;
  }
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
