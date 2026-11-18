// upnext-01 FILM: the approved storyboard v2 shots, animated on the voice timeline (film_timeline.json from tools/timeline.py).
// Characters: Ashley (girl) + the mentor from mentor.json (Pip / MetalShadow / ...). The shot code only uses SEMANTIC mentor
// clips / expressions; the mentor json maps them (flop / cheer are optional: no flop -> rigid flat pose; cheer -> its own clip).
// Talking: mouth levels per speaker at 30 fps from the voice; a mentor without a mouth pulses its pupils (talk_suffix cells).
// Blinks every ~3-4 s. Cameras: slow dolly-ins, handheld drift on lying / two-shots, pans where the ref pans.
export function buildFilm(L) {
  const { TL, SHOTS, MENTOR, bedroom, character, phone, cam, box, plane, mesh, lam, basic, TX, BED, NS, DESK, V3, THREE } = L;
  const FPS = 30, SH = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const NIGHT_TINT = 0x7c84b8, LAMP_TINT = 0xb8bcd8, PHONE_TINT = 0xa898cc;
  const edgeX = BED.x - BED.w / 2;
  const clamp01 = (x) => Math.min(1, Math.max(0, x)), ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); }, lerp = (a, b, k) => a + (b - a) * k;
  const faceTo = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);
  const mouthLv = (spk, T) => +(TL.mouth[spk][Math.floor(T * FPS)] || 0);
  const speaking = (spk, T) => TL.lines.some((l) => l.spk === spk && l.spans.some(([a, b]) => T >= a - 0.05 && T <= b + 0.05));
  const CM = (id) => (MENTOR.cam_dist && MENTOR.cam_dist[id]) || 1;          // per-mentor camera distance (wide heads pull back)
  const CMY = (id) => (MENTOR.cam_dy && MENTOR.cam_dy[id]) || 0;
  const hasClip = (k) => MENTOR.clip_map && MENTOR.clip_map[k];

  // ------------------------------------------------------------------ actors
  // segs: [[atLocal, clip, {from, speed, loop, to}]]; faces: [[atLocal, eyes, mouth]]; spk: 'G' | 'P' (talks on its voice)
  function actor(ch, kind, spk, segs, faces, seed = 1) {
    return (lt, T) => {
      let s = segs[0]; for (const x of segs) if (x[0] <= lt + 1e-6) s = x;
      const o = s[2] || {}, c = THREE.AnimationClip.findByName(kind === 'girl' ? ch.clips : ch.clips, s[1]);
      let ct = (o.from || 0) + (lt - s[0]) * (o.speed ?? 1);
      if (o.to !== undefined) ct = o.speed < 0 ? Math.max(o.to, ct) : Math.min(o.to, ct);
      let f = faces[0]; for (const x of faces) if (x[0] <= lt + 1e-6) f = x;
      let eyes = f[1], mouth = f[2];
      const lv = spk ? mouthLv(spk, T) : 0, fr = Math.floor(T * FPS);
      if (lv > 0) {
        if (kind === 'girl') mouth = lv === 1 ? 'talkSmall' : (fr >> 2) % 2 ? 'talkO' : 'talkA';
        else if (!MENTOR.mouth_material) mouth = (fr % 6) < 3 ? 'talkA' : 'neutral';
        else mouth = lv === 1 ? 'talkM' : ['talkA', 'talkE', 'talkO'][(fr >> 2) % 3];
      }
      const per = 3.3 + (seed % 5) * 0.37, ph = (T + seed * 1.13) % per;          // blink: 3 frames
      if (ph < 0.1 && !/blink|sleepy|happy|closed/.test(eyes)) eyes = 'blink';
      ch.pose(s[1], o.loop ? ((ct % durOf(ch, s[1])) + durOf(ch, s[1])) % durOf(ch, s[1]) : ct, eyes, mouth);
    };
  }
  const DUR = {};
  function durOf(ch, clip) { const k = ch.kind + clip; if (!DUR[k]) { const c = ch.clipsList.find((x) => x.name === (ch.kind === 'girl' ? clip : ((MENTOR.clip_map || {})[clip] || clip))); DUR[k] = c ? c.duration : 1; } return DUR[k]; }
  function girl(scene, tint = 0xffffff, shadow = 0.55) { const g = character('girl', { tint, shadow }); g.kind = 'girl'; scene.add(g.root); return g; }
  function mentor(scene, tint = 0xffffff) { const n = character('mentor', { tint }); n.kind = 'mentor'; scene.add(n.root); return n; }
  // clipsList for durations: the character() objects keep their mixer clips internally; read them from the model's animations
  const attachClips = (ch, list) => { ch.clipsList = list; ch.clips = list; return ch; };

  // ------------------------------------------------------------------ cameras
  // keys: [[tLocal, pos, look, fov]] eased between; drift = handheld amplitude (1 = 0.5 cm / 0.3 deg at ~0.4 Hz)
  function camRig(keys, drift = 0, roll0 = 0, rollEnd = null) {
    const c = cam(keys[0][3] || 60, keys[0][1], keys[0][2]);
    const upd = (lt) => {
      let i = 0; while (i < keys.length - 1 && lt >= keys[i + 1][0]) i++;
      const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)], k = b === a ? 0 : ease((lt - a[0]) / Math.max(1e-3, b[0] - a[0]));
      const P = a[1].map((v, j) => lerp(v, b[1][j], k)), Lk = a[2].map((v, j) => lerp(v, b[2][j], k)), fov = lerp(a[3] || 60, b[3] || a[3] || 60, k);
      const dx = drift * 0.005 * Math.sin(lt * 2.5 + 0.7), dy = drift * 0.004 * Math.sin(lt * 1.9 + 2.1);
      c.position.set(P[0] + dx, P[1] + dy, P[2]); c.lookAt(Lk[0] + dx * 0.5, Lk[1] + dy * 0.5, Lk[2]);
      if (c.fov !== fov) { c.fov = fov; c.updateProjectionMatrix(); }
      const r = (rollEnd === null ? roll0 : lerp(roll0, rollEnd, ease(lt / 2.0))) + drift * 0.005 * Math.sin(lt * 2.4);
      if (r) c.rotateZ(r);
    };
    return { c, upd };
  }
  const toward = (pos, look, k) => pos.map((v, j) => lerp(v, look[j], k));   // dolly in by fraction k
  const pullM = (id, pos, look) => pos.map((v, j) => look[j] + (v - look[j]) * CM(id)).map((v, j) => v + (j === 1 ? CMY(id) : 0));

  let FILMCLIPS = null;
  function addFilmShot(id, scene, rig, update, extra = {}) {
    const s = SH[id];
    SHOTS.push({ t0: s.t0, scene, camera: rig.c, hard: extra.hard ?? true, update(lt, T, ltCam = lt) { update(lt, T); rig.upd(ltCam); } });   // characters on the stepped clock, camera on the 30 fps one
  }
  const G_CLIPS = () => character('girl').clipsAll, M_CLIPS = () => character('mentor').clipsAll;

  // helper that makes a girl / mentor with its clip list (character() exposes the clips it was built from)
  const mkG = (scene, tint, sh) => { const g = girl(scene, tint, sh); return attachClips(g, g.clipsAll); };
  const mkM = (scene, tint) => { const n = mentor(scene, tint); return attachClips(n, n.clipsAll); };
  const phoneTrack = (g, p) => () => { g.root.updateMatrixWorld(true); const H = g.world('Hand.R', [0, 0.55, 0]), Lh = g.world('Hand.L', [0, 0.55, 0]), E = g.world('Head', [0, 0.6, 0]);
    p.position.copy(H.clone().lerp(Lh, 0.5)); p.lookAt(E); p.rotateZ(Math.PI / 2); };

  // ================================================================== SHOTS
  // 01 night: lying, scrolling the phone (lie_phone), she says the plan; slow dolly in + handheld
  { const R = bedroom('night', { clock: '4:00' }); const g = mkG(R.scene, PHONE_TINT, 0); g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.22);
    const p = phone(true); R.scene.add(p); const A = actor(g, 'girl', 'G', [[0, 'lie_phone', { loop: true }]], [[0, 'half', 'neutral']], 2); A(0, 0); const pt = phoneTrack(g, p); pt();
    const DQ = R.drape(g, { z0: -1.3, tint: 0x9098c8 });
    const E = g.world('Head'); const P0 = [E.x - 0.46, E.y + 0.58, E.z + 0.3], L0 = [E.x + 0.1, E.y + 0.02, E.z + 0.08];
    addFilmShot('01', R.scene, camRig([[0, P0, L0, 72], [3.5, toward(P0, L0, 0.07), L0, 72]], 1, -0.1), (lt, T) => { A(lt, T); pt(); DQ(-1.3); }); }
  // 02 night: the mentor on the nightstand by the 4:00 clock, her hands + phone in the foreground; dolly in on him
  { const R = bedroom('night', { clock: '4:00' }); const g = mkG(R.scene, PHONE_TINT, 0); g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.22);
    const p = phone(true); R.scene.add(p); const A = actor(g, 'girl', 'G', [[0, 'lie_phone', { loop: true, from: 0.7 }]], [[0, 'half', 'neutral']], 2); A(0, 3.5); const pt = phoneTrack(g, p); pt();
    const DQ = R.drape(g, { z0: -1.3, tint: 0x9098c8 });
    const n = mkM(R.scene, 0x9ca4d0); n.root.position.set(NS.x - 0.1, NS.h, NS.z - 0.02); n.root.rotation.y = faceTo([NS.x - 0.1, NS.z], [BED.x, -1.5]);
    const B = actor(n, 'mentor', 'P', [[0, 'idle', { loop: true }], [0.45, 'talk', { loop: true }], [1.95, 'idle', { loop: true, from: 0.5 }]], [[0, 'deadpan', 'neutral']], 3); B(0, 3.5);
    const G = n.world(MENTOR.head_bone), P = p.position.clone();
    const C0 = P.clone().add(P.clone().sub(G).normalize().multiplyScalar(0.7)).add(V3(0.14, 0.26, 0.06)), L0 = [G.x + 0.02, G.y - 0.16, G.z], P0 = pullM('02', [C0.x, C0.y, C0.z], L0);
    addFilmShot('02', R.scene, camRig([[0, P0, L0, 58], [2.2, toward(P0, L0, 0.12), L0, 58]], 0.6), (lt, T) => { A(lt, T); pt(); B(lt, T); DQ(-1.3); }); }
  // 03 night: lying on her back (lie_back), head turned: "...Is this counting?" / off "Nope." -> sulk; roll corrects
  { const R = bedroom('night', { clock: '4:01' }); const g = mkG(R.scene, NIGHT_TINT, 0); g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.25);
    const A = actor(g, 'girl', 'G', [[0, 'sit_up_bed', { from: 0, speed: 0 }]], [[0, 'half', 'neutral'], [1.9, 'sulk', 'pout']], 4); A(0, 5.7); const DQ = R.drape(g, { z0: -1.58, tint: 0x9098c8 });   // v2: tucked flat (lie_back's raised knee tented the quilt)
    const E = g.world('Head'); const P0 = [E.x - 0.7, E.y + 0.6, E.z + 0.55], L0 = [E.x, E.y - 0.05, E.z + 0.3];
    addFilmShot('03', R.scene, camRig([[0, P0, L0, 68], [3.6, toward(P0, L0, 0.08), L0, 68]], 0.8, 0.06, 0.0), (lt, T) => { A(lt, T); DQ(-1.58); }); }
  // 04 light comes up (night -> lamp), mattress-height wide, quilt foreground; "...Tomorrow, then." lying, then she sits up
  { const R = bedroom('lamp', { clock: '11:52' }); const g = mkG(R.scene, LAMP_TINT, 0); g.root.position.set(BED.x - 0.05, BED.top - 0.005, -1.28);
    const n = mkM(R.scene, LAMP_TINT); n.root.position.set(NS.x - 0.08, NS.h, NS.z); n.root.rotation.y = faceTo([NS.x, NS.z], [BED.x, -1.2]);
    const A = actor(g, 'girl', 'G', [[0, 'sit_up_bed', { from: 0, speed: 0 }], [2.5, 'sit_up_bed', { from: 0, speed: 1.0, to: 1.79 }]], [[0, 'half', 'neutral'], [2.6, 'sulk', 'pout']], 5); A(0, 9.3); const DQ = R.drape(g, { z0: -1.6 });
    const B = actor(n, 'mentor', null, [[0, 'idle', { loop: true }]], [[0, 'unimpressed', 'neutral']], 6);
    const L0s = R.lights.map((l) => [l, l.intensity, l.color.clone()]);
    const fade = (lt) => { const k = ease((lt - 0.0) / 1.5); L0s.forEach(([l, i0]) => { l.intensity = i0 * lerp(0.35, 1, k); });
      const c = new THREE.Color(NIGHT_TINT).lerp(new THREE.Color(LAMP_TINT), k);
      for (const ch of [g, n]) ch.model.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.color.copy(c)); }); };
    addFilmShot('04', R.scene, camRig([[0, [1.3, 0.8, 0.05], [-0.25, 0.8, -1.7], 72]], 0.3), (lt, T) => { A(lt, T); B(lt, T); fade(lt); DQ(lerp(-1.6, -1.02, ease((lt - 2.6) / 1.4))); }); }
  // 05 lamp: sitting on the bed edge with the phone in both hands; the mentor watches; pan right + push-in from 1.6 s
  { const R = bedroom('lamp', { clock: '11:52' }); const g = mkG(R.scene, LAMP_TINT); g.root.rotation.y = -Math.PI / 2; g.root.position.set(edgeX - 0.17, 0, -1.2);
    const p = phone(true); R.scene.add(p);
    const A = actor(g, 'girl', 'G', [[0, 'sit_slumped', { loop: true }]], [[0, 'gazeDown', 'neutral']], 7); A(0, 13.4);
    const ptS = () => { g.root.updateMatrixWorld(true); const H = g.world('Hand.R'), Lh = g.world('Hand.L'), E = g.world('Head'); p.position.copy(H.clone().lerp(Lh, 0.5)).add(V3(-0.04, 0.03, 0)); p.lookAt(E); p.rotateZ(Math.PI / 2); }; ptS();
    const n = mkM(R.scene, LAMP_TINT); n.root.position.set(NS.x - 0.06, NS.h, NS.z); n.root.rotation.y = faceTo([NS.x, NS.z], [g.world('Head').x, g.world('Head').z]);
    const B = actor(n, 'mentor', null, [[0, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral']], 8);
    addFilmShot('05', R.scene, camRig([[0, [-1.55, 0.95, -0.3], [-0.42, 0.72, -1.45], 66], [1.6, [-1.55, 0.95, -0.3], [-0.42, 0.72, -1.45], 66], [4.2, [-1.42, 0.95, -0.42], [-0.3, 0.76, -1.38], 62]], 0.4), (lt, T) => { A(lt, T); ptS(); B(lt, T); }); }
  // 06 close, lilac backdrop: she deflates (sad_slump one-shot, holds); very slow dolly in, tilt down
  { const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8c86a8);
    scene.add(new THREE.HemisphereLight(0xf0ecff, 0x6a6080, 1.8)); const k = new THREE.DirectionalLight(0xffffff, 0.8); k.position.set(1, 2, 3); scene.add(k);
    const g = mkG(scene, 0xffffff, 0); plane(6, 4, basic(null, 0x8c86a8), 0, 1.3, -1.2, scene);
    const A = actor(g, 'girl', 'G', [[0, 'sad_slump', { from: 0.3, speed: 0.8, to: 1.66 }]], [[0, 'sad', 'sadPout'], [2.6, 'gazeDown', 'sadPout']], 9); A(1.6, 17.6 + 1.6);
    const E = g.world('Head'); const P0 = [E.x + 0.1, E.y + 0.0, E.z + 1.1], L0 = [E.x, E.y - 0.1, E.z];
    addFilmShot('06', scene, camRig([[0, P0, L0, 42], [5.1, toward(P0, L0, 0.16), [L0[0], L0[1] - 0.05, L0[2]], 42]], 0.3), A); }
  // 07 the mentor close and low, the clock in the foreground: "Time to cheat."
  { const R = bedroom('day', { clock: '11:53' }); const n = mkM(R.scene); n.root.position.set(NS.x - 0.1, NS.h, NS.z - 0.04); n.root.rotation.y = 0.7;
    const B = actor(n, 'mentor', 'P', [[0, 'idle', { loop: true }], [0.2, 'talk', { loop: true }], [1.9, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral']], 10);
    const L0 = [NS.x - 0.1, NS.h + 0.36 + CMY('07'), NS.z - 0.04], P0 = pullM('07', [NS.x + 0.22, NS.h + 0.12, NS.z + 0.62], L0);
    addFilmShot('07', R.scene, camRig([[0, P0, L0, 58], [2.0, toward(P0, L0, 0.08), L0, 58]], 0.3), B); }
  // 08 the mentor walks off across the floor; her legs at the right
  { const R = bedroom('day', { clock: '11:53' }); const g = mkG(R.scene); g.root.rotation.y = -Math.PI / 2; g.root.position.set(edgeX - 0.17, 0, -1.2);
    const A = actor(g, 'girl', null, [[0, 'sit_slumped', { loop: true, from: 1.0 }]], [[0, 'gazeDown', 'neutral']], 11);
    const n = mkM(R.scene); const from = [-0.85, -1.25], to = [-1.6, -0.2], ry = faceTo(from, to); n.root.rotation.y = ry;
    const sp = (MENTOR.walk_speed_m || 0.35), B = actor(n, 'mentor', null, [[0, 'walk', { loop: true }]], [[0, 'deadpan', 'neutral']], 12);
    const mv = (lt) => { const d = sp * lt; n.root.position.set(from[0] + Math.sin(ry) * d, 0, from[1] + Math.cos(ry) * d); };
    addFilmShot('08', R.scene, camRig([[0, [-1.55, 0.45, -0.05], [-0.65, 0.35, -1.6], 72], [1.05, [-1.55, 0.45, -0.05], [-0.8, 0.35, -1.4], 72]], 0.5), (lt, T) => { A(lt, T); mv(lt); B(lt, T); }); }
  // 09 the mentor sits sulking on the rug, desk + CRT behind: "...Need help, Pip?" (off) / "Nah."; dolly out + tilt down
  { const R = bedroom('day', { clock: '11:54' }); const n = mkM(R.scene); n.root.position.set(-0.6, 0, 0.45); n.root.rotation.y = Math.PI / 2 + 0.25;
    const B = actor(n, 'mentor', 'P', [[0, 'sit', { from: 1.49, speed: 0 }]], [[0, 'sleepy', 'frown']], 13);
    const P0 = [0.4, 0.3, 1.3], L0 = [-0.85, 0.36, 0.3];
    addFilmShot('09', R.scene, camRig([[0, toward(P0, L0, 0.1), L0, 62], [4.5, P0, [L0[0], L0[1] - 0.06, L0[2]], 62]], 0.3), B); }
  // 10a two-shot: she sits on the bed edge, the mentor flops flat on the mat at her feet (sigh puff), "Tomorrow... your feet land on this first."
  //      a mentor with a flop clip plays it, and plays it BACKWARDS to get up before the cut; without one: rigid flat pose
  let PUFF = null;
  { const R = bedroom('day', { clock: '11:55', mat: true }); const g = mkG(R.scene); g.root.rotation.y = -Math.PI / 2; g.root.position.set(edgeX - 0.17, 0, -1.1);
    const A = actor(g, 'girl', null, [[0, 'sit_slumped', { loop: true }]], [[0, 'gazeDown', 'neutral']], 14);
    const n = mkM(R.scene); let B;
    const span = SH['10b'].t0 - SH['10a'].t0;
    if (hasClip('flop')) {
      n.root.position.set(-0.6, 0, -0.93); n.root.rotation.y = 0.77;   // falls on its back with the head away from the camera's side, across her feet
      const fd = durOf(n, 'flop');
      B = actor(n, 'mentor', 'P', [[0, 'flop', { from: 0, speed: 1, to: fd - 0.01 }], [span - fd - 0.15, 'flop', { from: fd - 0.01, speed: -1, to: 0 }]], [[0, 'deadpan', 'neutral']], 15);
    } else {
      n.model.rotation.x = -Math.PI / 2; n.model.position.y = MENTOR.back + 0.012; n.root.rotation.y = -Math.PI / 2; n.root.position.set(-0.12, BED.top + 0.01, -0.62); if (n.shadow) n.shadow.visible = false;   // v2: flat on the mattress BESIDE her (towards the pillow), clearly apart
      B = actor(n, 'mentor', 'P', [[0, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral']], 15);
    }
    const pm = lam(null, 0x9aa0a8); PUFF = new THREE.Group(); [[0, 0, 0, 0.05], [0.05, 0.02, 0, 0.04], [-0.04, 0.025, 0.01, 0.035]].forEach(([x, y, z, r]) => mesh(new THREE.IcosahedronGeometry(r, 0), pm, x, y, z, PUFF)); R.scene.add(PUFF);
    const puff = (lt) => { const k = (lt - 1.2) / 0.9; PUFF.visible = k > 0 && k < 1; if (!PUFF.visible) return; n.root.updateMatrixWorld(true); const h = n.world(MENTOR.head_bone); PUFF.position.set(h.x - 0.05, h.y + 0.16 + 0.12 * k, h.z); PUFF.scale.setScalar(0.6 + 0.8 * k); };
    addFilmShot('10a', R.scene, camRig([[0, [-1.8, 1.12, 0.12], [0.0, 0.42, -0.95], 60]], 0.5), (lt, T) => { A(lt, T); B(lt, T); puff(lt); }); }
  // 10b slight punch-in: the mentor up in front of her points at the desk ("And that bunks over there."), she glances ("That's the trick?"),
  //      "Eh." (shrug) "The proper term is nudge." (talk)
  { const R = bedroom('day', { clock: '11:56', mat: true }); const g = mkG(R.scene); g.root.rotation.y = -Math.PI / 2; g.root.position.set(edgeX - 0.17, 0, -1.1);
    const t0 = SH['10b'].t0;
    const A = actor(g, 'girl', 'G', [[0, 'sit_slumped', { loop: true }]], [[0, 'gazeDown', 'neutral'], [39.7 - t0, 'glance', 'neutral'], [41.9 - t0, 'half', 'pout']], 16);
    const n = mkM(R.scene); n.root.position.set(-1.02, 0, -0.78); n.root.rotation.y = -2.03;   // a step further from her shins (no overlap, wide heads fit)
    const B = actor(n, 'mentor', 'P', [[0, 'idle', { loop: true }], [37.0 - t0, 'point', { to: durOf(n, 'point') - 0.01 }], [39.6 - t0, 'idle', { loop: true }], [41.9 - t0, 'shrug', { to: durOf(n, 'shrug') - 0.01 }], [43.4 - t0, 'talk', { loop: true }], [45.45 - t0, 'idle', { loop: true }]],
      [[0, 'deadpan', 'neutral'], [39.9 - t0, 'skeptical', 'neutral'], [41.9 - t0, 'deadpan', 'neutral']], 17);
    addFilmShot('10b', R.scene, camRig([[0, [-1.85, 0.6, 0.2], [-0.56, 0.48, -1.05], 54], [9, [-1.85, 0.6, 0.18], [-0.56, 0.48, -1.05], 52]], 0.5), (lt, T) => { A(lt, T); B(lt, T); }); }
  // 11 she sets the phone on the nightstand (sit_reach_side), the mentor's hat bottom-left; dissolves into 12
  { const R = bedroom('day', { clock: '11:57', mat: true }); const g = mkG(R.scene); g.root.rotation.y = -Math.PI / 2; g.root.position.set(edgeX - 0.17, 0, -1.4);
    const A = actor(g, 'girl', null, [[0, 'sit_reach_side', { from: 0, speed: 1, to: 1.59 }]], [[0, 'soft', 'neutral'], [0.4, 'gazeR', 'neutral'], [1.1, 'soft', 'softSmile']], 18);
    const ph = phone(false); R.scene.add(ph); let placed = null;
    const phT = (lt) => { g.root.updateMatrixWorld(true); const P = g.world('Hand.R', [0, 0.5, 0]);
      if (lt >= 0.72) { if (!placed) placed = [P.x, P.z]; ph.position.set(placed[0], NS.h + 0.006, placed[1]); ph.rotation.set(-Math.PI / 2, 0, 0.3); }
      else { const q = new THREE.Quaternion(); g.bone('Hand.R').getWorldQuaternion(q); ph.position.copy(P); ph.quaternion.copy(q); ph.rotateX(Math.PI / 2); } };
    const n = mkM(R.scene); n.root.position.set(-0.85, 0, -1.55); n.root.rotation.y = faceTo([-0.85, -1.55], [-0.3, -1.15]);
    const B = actor(n, 'mentor', null, [[0, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral']], 19);
    A(0.8, 46.6); const E = g.world('Head');
    addFilmShot('11', R.scene, camRig([[0, [-1.4, 1.0, -0.75], [E.x + 0.05, E.y - 0.22, E.z - 0.15], 60], [1.8, [-1.32, 0.98, -0.82], [E.x + 0.05, E.y - 0.24, E.z - 0.15], 58]], 0.3), (lt, T) => { A(lt, T); phT(lt); B(lt, T); }); }
  // 12 night: asleep (dissolve in)
  { const R = bedroom('night', { clock: '10:47', phoneOnNS: true, mat: true }); const g = mkG(R.scene, NIGHT_TINT, 0); g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.25);
    const A = actor(g, 'girl', null, [[0, 'sit_up_bed', { from: 0, speed: 0 }]], [[0, 'blink', 'neutral']], 20); A(0, 47.6); const E = g.world('Head'); const DQ = R.drape(g, { z0: -1.6, tint: 0x9098c8 });
    addFilmShot('12', R.scene, camRig([[0, [E.x - 0.75, E.y + 1.1, E.z + 0.9], [E.x + 0.05, E.y - 0.1, E.z + 0.35], 66]], 0.2), (lt, T) => { A(lt, T); DQ(-1.6); }, { hard: false }); }
  // 13 night: clock insert 10:47
  { const R = bedroom('night', { clock: '10:47', phoneOnNS: true }); const P0 = [NS.x + 0.25, NS.h + 0.32, NS.z + 0.55], L0 = [NS.x + 0.04, NS.h + 0.03, NS.z + 0.04];
    addFilmShot('13', R.scene, camRig([[0, P0, L0, 50], [0.6, toward(P0, L0, 0.05), L0, 50]]), () => {}); }
  // 14 night: the mentor on the desk by the CRT, smug, her phone charging in front of him
  { const R = bedroom('night', { clock: '10:48', phoneOnDesk: true }); const n = mkM(R.scene, 0xa8b0e0); n.root.position.set(DESK.x - 0.05, DESK.h, DESK.z - 0.3); n.root.rotation.y = Math.PI / 2 + 0.3;
    const pl = new THREE.PointLight(0x9cc4ff, 1.2, 1.0); pl.position.set(DESK.x + 0.25, DESK.h + 0.15, DESK.z - 0.12); R.scene.add(pl);
    const B = actor(n, 'mentor', null, [[0, 'idle', { loop: true }]], [[0, 'skeptical', 'smirk']], 21);
    const L0 = [DESK.x - 0.05, DESK.h + 0.3, DESK.z - 0.1], P0 = pullM('14', [DESK.x + 1.0, DESK.h + 0.18, DESK.z - 0.75], L0);
    addFilmShot('14', R.scene, camRig([[0, P0, L0, 62], [1.3, toward(P0, L0, 0.08), L0, 62]]), B); }
  // 15 day: the mentor on the desk, morning "ta-da" (cheer clip if it has one, else shrug)
  { const R = bedroom('day', { clock: '8:24', phoneOnDesk: true }); const n = mkM(R.scene); n.root.position.set(DESK.x - 0.05, DESK.h, DESK.z - 0.3); n.root.rotation.y = Math.PI / 2 + 0.3;
    const cheer = hasClip('cheer') ? 'cheer' : 'shrug';
    const B = actor(n, 'mentor', null, [[0, cheer, { from: 0.1, to: durOf(n, cheer) - 0.01 }]], [[0, 'happy', 'smile']], 22);
    const L0 = [DESK.x - 0.05, DESK.h + 0.3, DESK.z - 0.15], P0 = pullM('15', [DESK.x + 1.0, DESK.h + 0.25, DESK.z - 0.8], L0);
    addFilmShot('15', R.scene, camRig([[0, P0, L0, 62]]), B); }
  // 16 day: high angle, she sleeps, the mat on the floor, clock 8:24
  { const R = bedroom('day', { clock: '8:24', mat: true }); const g = mkG(R.scene, 0xffffff, 0); g.root.position.set(BED.x - 0.05, BED.top - 0.01, -1.25); 
    const A = actor(g, 'girl', null, [[0, 'sit_up_bed', { from: 0, speed: 0 }]], [[0, 'blink', 'neutral']], 23); A(0, 51.4); const DQ = R.drape(g, { z0: -1.6 });
    addFilmShot('16', R.scene, camRig([[0, [-1.1, 1.75, -0.1], [-0.1, 0.35, -1.45], 72]]), (lt, T) => { A(lt, T); DQ(-1.6); }); }
  // 17 day: her boots on the mat (tilt down a little)
  { const R = bedroom('day', { clock: '8:25', mat: true }); const g = mkG(R.scene); g.root.rotation.y = -Math.PI / 2; g.root.position.set(edgeX - 0.17, 0, -1.0);
    const A = actor(g, 'girl', null, [[0, 'sit_slumped', { loop: true }]], [[0, 'half', 'neutral']], 24);
    addFilmShot('17', R.scene, camRig([[0, [-0.98, 0.56, -0.62], [-0.48, 0.16, -1.0], 60], [1.4, [-0.98, 0.52, -0.62], [-0.48, 0.1, -1.0], 60]]), A); }
  // 18 day: standing, torso
  { const R = bedroom('day', { clock: '8:25', mat: true }); const g = mkG(R.scene); g.root.position.set(-0.5, 0.012, -1.0); g.root.rotation.y = -Math.PI / 2;
    const A = actor(g, 'girl', null, [[0, 'idle_sway', { loop: true, from: 0.4 }]], [[0, 'open', 'neutral']], 25);
    addFilmShot('18', R.scene, camRig([[0, [-1.35, 0.95, -0.7], [-0.5, 0.92, -1.05], 60]]), A); }
  // 19 day, desk: she leans in "...Is this counting?" (lean_reach, eased to mid-lean, holds); the mentor nods "Yep. That counts."
  { const R = bedroom('day', { clock: '8:26', phoneOnDesk: true, mat: true }); const t0 = SH['19'].t0;
    const n = mkM(R.scene); n.root.position.set(DESK.x + 0.05, DESK.h, DESK.z - 0.3); n.root.rotation.y = Math.PI / 2 - 0.2;
    const B = actor(n, 'mentor', 'P', [[0, 'idle', { loop: true }], [58.0 - t0, 'nod', { to: durOf(n, 'nod') - 0.01 }], [59.2 - t0, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral'], [57.9 - t0, 'happy', 'smile']], 26);
    const g = mkG(R.scene); g.root.position.set(-1.25, 0, 0.05); g.root.rotation.y = -0.15;
    const A = actor(g, 'girl', 'G', [[0, 'idle_cute', { loop: true }], [55.25 - t0, 'talk_cute', { loop: true }]], [[0, 'open', 'neutral'], [55.3 - t0, 'shy', 'neutral'], [58.6 - t0, 'soft', 'softSmile']], 27);   // v2: relaxed feminine (flared hands -> hands under the chin), no stiff straight-arm lean
    addFilmShot('19', R.scene, camRig([[0, [0.6, 0.95, 1.6], [-1.42, 0.88, 0.3], 56]], 0.3), (lt, T) => { A(lt, T); B(lt, T); }); }
  // 20 day: she walks past the desk toward the door (pan follows)
  { const R = bedroom('day', { clock: '8:26', phoneOnDesk: true, mat: true }); const n = mkM(R.scene); n.root.position.set(DESK.x + 0.05, DESK.h, DESK.z - 0.3); n.root.rotation.y = Math.PI / 2 + 0.6;
    const B = actor(n, 'mentor', null, [[0, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral']], 28);
    const g = mkG(R.scene); g.root.rotation.y = Math.PI / 2; g.model.rotation.x = 0.07; const A = actor(g, 'girl', null, [[0, 'walk', { loop: true }]], [[0, 'open', 'softSmile']], 29);   // v2: body pitched ~4 deg forward (the hip-led walk read as leaning back)
    const mv = (lt) => g.root.position.set(-0.85 + 0.517 * lt, 0, 1.2);
    addFilmShot('20', R.scene, camRig([[0, [0.5, 0.98, 0.1], [-1.0, 0.95, 1.1], 62], [1.1, [0.55, 0.98, 0.12], [-0.45, 0.95, 1.15], 62]]), (lt, T) => { mv(lt); A(lt, T); B(lt, T); }); }
  // 21 day: from behind she walks into the open door's light
  { const R = bedroom('day', { clock: '8:27', mat: true, doorOpen: 1.25 }); const g = mkG(R.scene); g.root.rotation.y = Math.PI / 2; g.model.rotation.x = 0.07;
    const A = actor(g, 'girl', null, [[0, 'walk', { loop: true, from: 0.6 }]], [[0, 'open', 'neutral']], 30);
    const mv = (lt) => g.root.position.set(0.85 + 0.517 * lt, 0, 1.15);
    addFilmShot('21', R.scene, camRig([[0, [-0.2, 1.3, 1.25], [1.9, 1.05, 1.1], 62]], 0.4), (lt, T) => { mv(lt); A(lt, T); }); }
  // 22 day: the empty desk, the mentor by the phone: "Champions are awake by four." (slow pan right)
  { const R = bedroom('day', { clock: '8:28', phoneOnDesk: true, mat: true }); const n = mkM(R.scene); n.root.position.set(DESK.x + 0.05, DESK.h, DESK.z - 0.3); n.root.rotation.y = Math.PI / 2 + 0.25;
    const t0 = SH['22'].t0; const B = actor(n, 'mentor', 'P', [[0, 'idle', { loop: true }], [64.35 - t0, 'talk', { loop: true }], [67.0 - t0, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral']], 31);
    const L0 = [-1.55, 1.0, 0.75], L1 = [-1.6, 0.98, 0.55], P0 = pullM('22', [-0.3, 1.15, 1.7], L0);
    addFilmShot('22', R.scene, camRig([[0, P0, L0, 62], [3.3, toward(P0, L1, 0.06), L1, 60]]), B); }
  // 23 day: the mentor close-up, slow continuous push-in; "Scratch that." (skeptical) then the warm closed-eye smile on the last line
  { const R = bedroom('day', { clock: '8:28', phoneOnDesk: true, mat: true }); const n = mkM(R.scene); n.root.position.set(DESK.x + 0.05, DESK.h, DESK.z - 0.3); n.root.rotation.y = Math.PI / 2 + 0.25;
    const t0 = SH['23'].t0;
    const B = actor(n, 'mentor', 'P', [[0, 'idle', { loop: true }]], [[0, 'deadpan', 'neutral'], [68.1 - t0, 'skeptical', 'smirk'], [70.3 - t0, 'happy', 'smile']], 32); B(0, t0);
    const E = n.world(MENTOR.head_bone), d = [Math.sin(Math.PI / 2 + 0.25), Math.cos(Math.PI / 2 + 0.25)];
    const L0 = [E.x, E.y + 0.06 + CMY('23'), E.z], P0 = [E.x + d[0] * 0.85 * CM('23'), E.y + 0.12 + CMY('23'), E.z + d[1] * 0.85 * CM('23')];
    addFilmShot('23', R.scene, camRig([[0, P0, L0, 45], [6.0, toward(P0, L0, 0.18), L0, 45], [8, toward(P0, L0, 0.18), L0, 45]]), B); }
  SHOTS.sort((a, b) => a.t0 - b.t0);
}
