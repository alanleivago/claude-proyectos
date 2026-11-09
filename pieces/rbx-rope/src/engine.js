// rbx-chess engine (from rbx-sock): builds every set once, times the shot list on the voice, stages + renders a shot at u in [0,1].
'use strict';
const ENG = {};
(function () {
  const W = 1080, H = 1920, V = (x, y, z) => new THREE.Vector3(x, y, z);
  ENG.MODE = window.MODE || 'gb';   // 'v1' = approved render; 'gb' = GreenBro acting (one actor acts, held poses, mouth flap, walk cycles, fixed dutch)
  ENG.W = W; ENG.H = H; ENG.S = {}; ENG.WIDEN = 1.5;   // the 9:16 frame is narrow: widen every fov (inserts pass widen: 1)
  // shot timing from the voice words: each shot starts just before its first word
  const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
  ENG.timeShots = function () {
    let wi = 0; const out = [];
    SHOTLIST.forEach((row, i) => {
      const key = row[0].split(/\s+/).map(norm).filter(Boolean);
      let found = -1; for (let k = wi; k < WORDS.length; k++) { if (key.every((w, j) => WORDS[k + j] && norm(WORDS[k + j].word) === w)) { found = k; break; } }
      if (found < 0) throw new Error('shot words not found: ' + row[0]);
      out.push({ i, text: row[0], set: row[1], desc: row[2], w0: found, t0: i === 0 ? 0 : Math.max(0, WORDS[found].start - 0.06) }); wi = found + 1;
    });
    out.forEach((s, i) => { s.t1 = i + 1 < out.length ? out[i + 1].t0 : WORDS[WORDS.length - 1].end + 0.5; const we = out[i + 1] ? out[i + 1].w0 : WORDS.length; s.line = WORDS.slice(s.w0, we).map((w) => w.word).join(' '); });
    return out;
  };
  ENG.init = async function () {
    const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(W, H, false); document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.physicallyCorrectLights = true;
    ENG.renderer = renderer; ENG.post = new RBX.Post(renderer, W, H, 2); ENG.cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 3000);
    
    for (const k of Object.keys(SETS)) { if (k === 'moontest' || k === 'propsheet') continue; const t = performance.now(); ENG.S[k] = await SETS[k]({ renderer }); console.log('set', k, Math.round(performance.now() - t), 'ms'); }
    
    ENG.shots = ENG.timeShots();
  };
  // ---- staging helpers used by shots.js ----
  ENG.moons = new Map();
  ENG.moon = function (scene, o = {}) {   // o: { p:[..], s: radius, look:[..], lids:[l,r], yaw, roll }
    let m = ENG.moons.get(scene); if (!m) { m = MOON.make(); scene.add(m); ENG.moons.set(scene, m); }
    m.visible = true; m.position.set(...(o.p || [0, 60, -200])); m.scale.setScalar(o.s || 30);
    m.lookAt(V(...(o.look || [0, 4, 20]))); if (o.yaw) m.rotateY(o.yaw); if (o.roll) m.rotateZ(o.roll); if (o.pitch) m.rotateX(o.pitch);
    m.userData.setLids(...(o.lids || [0, 0]));
    const body = m.children[0], glow = m.children[1]; if (!m.userData.mat0) { m.userData.mat0 = body.material; m.userData.matDim = body.material.clone(); m.userData.matDim.color.multiplyScalar(0.22); m.userData.matDim.emissiveIntensity = 2.5; }
    body.material = o.dim ? m.userData.matDim : m.userData.mat0; glow.visible = !o.dim;   // dim: a dark shape in the clouds, only the eye slits glow
    return m;
  };
  ENG.hideMoons = () => ENG.moons.forEach((m) => { m.visible = false; });
  ENG.extras = [];   // per-shot temporary objects
  ENG.add = (scene, obj) => { scene.add(obj); ENG.extras.push(obj); return obj; };
  ENG.clear = () => { ENG.extras.forEach((o) => o.parent && o.parent.remove(o)); ENG.extras = []; ENG.propN = {}; };
  // props are built once and reused across frames (factories paint canvases: far too slow per frame)
  ENG.propCache = {}; ENG.propN = {};
  ENG.prop = (set, fn, args, pos, ry = 0, sc = 1) => {
    const f = typeof PROPS !== 'undefined' && PROPS[fn]; if (!f) return null;
    const k0 = fn + '|' + JSON.stringify(args || []), n = (ENG.propN[k0] = (ENG.propN[k0] || 0) + 1), k = k0 + '|' + n;
    let g = ENG.propCache[k]; if (!g) { g = ENG.propCache[k] = f(...(args || [])); g.userData.s0 = g.scale.clone(); }
    g.position.set(...pos); g.rotation.set(0, ry, 0); g.scale.copy(g.userData.s0).multiplyScalar(sc); return ENG.add(set.scene, g);
  };
  // camera from a target: distance, yaw (deg, 0 = camera on +z side), pitch (deg, >0 camera above)
  ENG.orbit = (T, d, yaw = 0, pitch = 0, fov = 50, roll = 0) => {
    const y = THREE.MathUtils.degToRad(yaw), p = THREE.MathUtils.degToRad(pitch);
    return { p: [T[0] + d * Math.cos(p) * Math.sin(y), T[1] + d * Math.sin(p), T[2] + d * Math.cos(p) * Math.cos(y)], l: T, fov, roll };
  };
  // camera on an actor's face: d from the head centre, yaw relative to where the actor faces (0 = in front), pitch (deg, >0 above)
  ENG.face = (name, d, yaw = 0, pitch = 0, fov = 40, roll = 0, dy = 0) => {
    ENG.faced = name; const a = CAST.get(name); a.root.updateMatrixWorld(true); const h = a.head.getWorldPosition(new THREE.Vector3()); h.y += dy;
    const q = a.head.getWorldQuaternion(new THREE.Quaternion()), fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q); fwd.y = 0; fwd.normalize();
    const base = Math.atan2(fwd.x, fwd.z) * 180 / Math.PI; return Object.assign(ENG.orbit(h.toArray(), d, base + yaw, pitch, fov, roll), { f: h.toArray() });
  };
  ENG.lerp = (a, b, u) => a.map((x, i) => x + (b[i] - x) * u);
  ENG.ease = (u) => u * u * (3 - 2 * u);
  // ================= MODE 'gb' (GreenBro study, fuentes/roblox-cartoon/greenbro-movimiento.md) =================
  const R = (seed) => { const r = RBX.rng(Math.imul(seed + 1, 2654435761) >>> 0); for (let i = 0; i < 4; i++) r(); return r; };   // warmed xorshift
  const hashN = (n) => { let h = 7; for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 10007; return h; };
  // fixed dutch on ~half the shots, constant within the shot
  ENG.dutch = (sh) => { const r = R(sh.i * 131 + 17); if (r() < 0.5) return 0; const a = 3 + r() * 12; return r() < 0.5 ? -a : a; };
  const GEST = ['open', 'openT', 'armsUp', 'wave', 'waveL', 'point', 'offer', 'handsHead', 'shrug', 'crossed', 'open', 'point'];
  // group reactions: everybody snaps into the same pose 0.3-0.6 s into the shot
  ENG.GROUP = {
    'and the whole kingdom': { armL: [-0.25, 0, 0.65], armR: [-0.25, 0, -0.65], body: [-0.08, 0, 0] },
    'Everybody expected a': { armR: [-1.55, 0, 0], armL: [-0.2, 0, 0.2], body: [0.05, 0, 0] },
    'Then backwards': { armL: [-2.7, 0, -0.12], armR: [-2.7, 0, 0.12] },
  };
  // per-shot schedule: segments start at the cut and then switch on a word start after a 0.7-1.5 s hold
  const SCHED = {};
  const sched = (sh) => {
    if (SCHED[sh.i]) return SCHED[sh.i];
    const r = R(sh.i * 977 + 5), beats = WORDS.filter((w) => w.start > sh.t0 + 0.2 && w.start < sh.t1 - 0.25).map((w) => w.start), seg = [];
    let b = sh.t0, last = -1;
    for (;;) {
      let g; do { g = Math.floor(r() * GEST.length); } while (GEST[g] === GEST[last]);
      seg.push({ t: b, g: GEST[g], hy: (r() - 0.5) * 0.18, hz: (r() - 0.5) * 0.14, hx: (r() - 0.5) * 0.1, arm: Math.floor(r() * 3) }); last = g;
      const nb = beats.find((x) => x >= b + 0.7 + r() * 0.8); if (nb === undefined) break; b = nb;
    }
    return (SCHED[sh.i] = { seg, gd: 0.3 + r() * 0.3 });
  };
  const SNAP = 2 / 30, sn = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 2;
  const mix = (a, b, f) => [0, 1, 2].map((i) => ((a && a[i]) || 0) + (((b && b[i]) || 0) - ((a && a[i]) || 0)) * f);
  const setR = (g, v) => g.rotation.set(v[0], v[1], v[2]);
  const addR = (g, v) => { g.rotation.x += v[0]; g.rotation.y += v[1]; g.rotation.z += v[2]; };
  const speaking = (t) => WORDS.some((w) => t >= w.start && t < w.end);
  // ===== rope acting: hands stay locked on the rope (re-aimed every frame at the grip points) while the body works all the
  // time: heave rhythm per person (own tempo/phase), lean + weight shift, effort bob, foot planting, head turns/nods, one hand
  // off the rope now and then to point / wave / fist-pump (the lead on its word beats), stumbles on slips, waving at Wave Day.
  // Free (not holding) actors that are not the lead get a slow idle: look-around, weight shift, an own gesture every ~3 s.
  const KEYS = (l) => new Set(l);
  ENG.ROPEFX = { slip: KEYS(['the rope started to', 'One meter', 'then ten', 'And every night it', 'the rope dragged us', 'they slipped', 'Every time they slipped', 'The world lost an', 'The harder we pulled', 'the harder they pulled']),
    heave: KEYS(['so nobody lets go', 'the whole world pulls', 'So the world pulled', 'all at once', 'Three', 'Every time we pulled', 'The harder we pulled', 'Eight billion people', 'Tractors', 'Elephants', 'At recess we play', 'Step by step', 'One', 'Two', 'We stepped', 'It moved']),
    cheer: KEYS(['and we win one', "Grandma and the girl's", 'Now heave day is', 'Once a year both', 'step up and wave', 'Now we know who', 'First time in sixty', 'we could see each']) };
  const GPOSE = { point: (k) => [-1.55, 0, 0], wave: (k) => [-2.7, 0, k === 'R' ? -0.5 : 0.5], pump: (k) => [-2.95, 0, k === 'R' ? -0.15 : 0.15], open: (k) => [-0.5, 0, k === 'R' ? -0.75 : 0.75] };
  const GKEYS = Object.keys(GPOSE), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  ENG.actRope = function (vis, sh, c, t, S) {
    const key = SHOTLIST[sh.i][0], heave = ENG.ROPEFX.heave.has(key) ? 1.8 : 1, slip = ENG.ROPEFX.slip.has(key), cheer = ENG.ROPEFX.cheer.has(key), dt = t - sh.t0, sn = Math.sin;
    const lead = (c.lead && vis.includes(c.lead) && c.lead) || (vis.includes('hero') ? 'hero' : (ENG.faced && vis.includes(ENG.faced) ? ENG.faced : vis[0]));
    vis.forEach((n) => { const a = CAST.get(n), sp = a.stagePose || {}, h = hashN(n), ph = h * 0.37;
      if (sp._walk !== undefined) return;
      a._released = null;
      if (sp._rope && a.grip) {
        const tempo = 1.5 + (h % 5) * 0.14, pull = sn((2 * Math.PI * t) / tempo + ph), tug = Math.max(0, pull) ** 2 * heave;
        a.body.rotation.x += -0.15 * tug + 0.04 * sn(t * 0.9 + ph); a.body.rotation.z += 0.06 * sn(t * 0.7 + ph * 1.3); a.body.rotation.y += 0.12 * sn(t * 0.45 + ph);
        a.root.position.y -= 0.12 * tug * a.root.scale.y;
        a.legL.rotation.x += 0.1 * tug + 0.03 * sn(t * 0.8 + ph); a.legR.rotation.x -= 0.08 * tug;
        a.neck.rotation.y += 0.45 * sn(t * 0.6 + ph) + 0.16 * sn(t * 1.7 + ph * 2); a.neck.rotation.x += 0.09 * sn(t * 1.3 + ph) + 0.1 * tug; a.neck.rotation.z += 0.08 * sn(t * 1.1 + ph);
        if (slip) { const k = Math.max(0, 1 - dt / 0.45); a.body.rotation.x += 0.3 * k * k; a.root.position.y -= 0.08 * k; a.neck.rotation.x -= 0.15 * k; }
        a.root.updateMatrixWorld(true);
        const hk = Object.keys(a.grip.hands); hk.forEach((k) => GN.aim(a, k, a.grip.hands[k]));
        // one hand off the rope: the lead on its word beats, everyone else now and then (own period/offset); cheering shots wave
        let g = 0, gk = null, arm = null;
        if (hk.length === 2) {
          if (n === lead && c.talk !== false) { const seg = S.seg.filter((q) => q.t <= t).pop(); if (seg && seg.t > sh.t0) { const x = t - seg.t; if (x < 0.85) { g = sn(Math.PI * Math.min(1, x / 0.85)); gk = GKEYS[(Math.round(seg.t * 10) + h) % GKEYS.length]; } } }
          else { const P = (cheer ? 1.4 : 1.8) + (h % 7) * 0.25, x = (t + (h % 11) * 0.41) % P, dur = cheer ? 1.2 : 0.9; if (x < dur) { g = sn(Math.PI * x / dur); gk = cheer ? (h % 2 ? 'wave' : 'pump') : GKEYS[(Math.floor((t + (h % 11) * 0.41) / P) + h) % GKEYS.length]; } }
          if (g > 0) { arm = (h % 2) ? 'R' : 'L'; }
        } else if (hk.length === 1) { arm = hk[0] === 'L' ? 'R' : 'L'; gk = cheer ? 'wave' : null; g = 0; if (cheer) { const A = arm === 'R' ? a.armR : a.armL; A.rotation.z += 0.35 * sn(t * 7 + ph) * (arm === 'R' ? -1 : 1); } }
        if (g > 0 && gk && arm) { a._released = arm; const A = arm === 'R' ? a.armR : a.armL, v = GPOSE[gk](arm); _q.setFromEuler(_e.set(v[0], v[1], v[2] + (gk === 'wave' ? 0.3 * sn(t * 9) : 0))); A.quaternion.slerp(_q, Math.min(1, g * 1.15)); }
        return; }
      // free actors (not on the rope): the lead is handled by the gesture library below; the rest idle
      if (n === lead) return;
      const sit = Math.abs(a.legL.rotation.x) > 1.2;
      a.neck.rotation.y += 0.22 * sn(t * 0.9 + ph); a.neck.rotation.x += 0.05 * sn(t * 1.3 + ph); a.body.rotation.z += 0.03 * sn(t * 0.7 + ph); a.body.rotation.y += 0.06 * sn(t * 0.5 + ph);
      const P = 1.8 + ((ph * 7.31) % 1) * 1.2, tt = t + ph * 3, lo = tt % P, gg = lo < 0.75 ? sn(Math.PI * lo / 0.75) : 0, kind = Math.floor(tt / P) % 3;
      if (kind === 0) { a.armR.rotation.x -= 0.9 * gg; a.armR.rotation.z -= 0.25 * gg; } else if (kind === 1) { a.armL.rotation.x -= 0.9 * gg; a.armL.rotation.z += 0.25 * gg; } else { a.neck.rotation.x += 0.22 * gg; a.neck.rotation.z += 0.18 * gg; }
      if (!sit) { a.legL.rotation.x += 0.04 * sn(t * 0.7 + ph); a.legR.rotation.x -= 0.04 * sn(t * 0.7 + ph); } });
  };
  ENG.actGB = function (set, sh, c, t) {
    const vis = CAST.order.filter((n, i, A) => A.indexOf(n) === i && CAST.get(n).root.visible && CAST.get(n).root.parent === set.scene);
    if (!vis.length) return;
    // walk cycles for everyone the stage made walk: ~2 steps/s, arms +-0.55, legs +-0.44, feet kept on the ground (bob ~3-4 %)
    vis.forEach((n) => { const a = CAST.get(n); if (!a.stagePose || a.stagePose._walk === undefined) return;
      const s = Math.sin(2 * Math.PI * t + hashN(n) * 0.37), lg = 0.44 * s;
      a.armL.rotation.set(0.55 * s, 0, 0.06); a.armR.rotation.set(-0.55 * s, 0, -0.06); a.legL.rotation.set(-lg, 0, 0); a.legR.rotation.set(lg, 0, 0);
      a.root.position.y -= 2 * (1 - Math.cos(lg)) * a.root.scale.y; });
    const S = sched(sh), dt = t - sh.t0, grp = ENG.GROUP[SHOTLIST[sh.i][0]];
    ENG.actRope(vis, sh, c, t, S);
    if (grp) vis.forEach((n) => { const a = CAST.get(n), d = S.gd + (hashN(n) % 3) / 30, f = sn((dt - d) / SNAP); if (f <= 0) return;
      ['armL', 'armR'].forEach((k) => setR(a[k], mix([a[k].rotation.x, a[k].rotation.y, a[k].rotation.z], grp[k], f)));
      if (grp.body) addR(a.body, grp.body.map((x) => x * f)); });
    // the one actor who acts: c.lead, else the hero, else the actor the camera frames (ENG.face), else the first one put
    const lead = (c.lead && vis.includes(c.lead) && c.lead) || (vis.includes('hero') ? 'hero' : (ENG.faced && vis.includes(ENG.faced) ? ENG.faced : vis[0])), a = CAST.get(lead);
    let k = 0; while (k + 1 < S.seg.length && S.seg[k + 1].t <= t) k++;
    const cur = S.seg[k], prv = S.seg[Math.max(0, k - 1)], f = k === 0 ? 1 : sn((t - cur.t) / SNAP);
    const sp = a.stagePose || {}, walk = sp._walk !== undefined, sit = Math.abs(a.legL.rotation.x) > 1.2;
    const busy = sp._rope || sp._hold || ['armL', 'armR'].some((q) => sp[q] && (Math.abs(sp[q][0]) > 0.35 || Math.abs(sp[q][2]) > 0.35));
    if (!grp && !walk && !sit && !busy) {   // free arms: held gesture from the library
      const P0 = CAST.POSE[prv.g], P1 = CAST.POSE[cur.g];
      ['armL', 'armR'].forEach((q) => setR(a[q], mix(P0[q] || sp[q], P1[q] || sp[q], f)));
      addR(a.neck, mix(P0.head, P1.head, f));
    } else if (!grp && sit && !busy) {   // seated: small arm accent on alternating beats
      const acc = (s, q) => (s.arm === 0 ? 0 : (s.arm === 1) === (q === 'armR') ? -0.35 : 0);
      ['armL', 'armR'].forEach((q) => { a[q].rotation.x += acc(prv, q) + (acc(cur, q) - acc(prv, q)) * f; });
    }
    // head accents: small snapped turn/tilt per segment (<= ~5 deg)
    addR(a.neck, mix([prv.hx, prv.hy, prv.hz], [cur.hx, cur.hy, cur.hz], f));
    // mouth flap: hard swap open/closed every 0.11 s while a word is being spoken
    // everyone else keeps reacting (own expression set, desynced); the lead follows c.faces[lead] = [[u, mood], ...] if given
    if (typeof CAST.react === 'function') CAST.react(vis.filter((n) => n !== lead), t, sh.i, c.mood);
    if (c.faces && c.faces[lead]) CAST.faceAt(lead, c.faces[lead], (t - sh.t0) / (sh.t1 - sh.t0));
    if (a.faceName && speaking(t) && c.talk !== false) { const w = WORDS.find((x) => t >= x.start && t < x.end); if (Math.floor((t - w.start) / 0.11) % 2 === 0) { const base = a.faceName; a.setFace(base + '-talk'); a.faceName = base; } }
  };
  ENG.render = function (idx, u = 0.5) {
    const sh = ENG.shots[idx], fn = STAGES[SHOTLIST[idx][0]] || ((set) => { const v = Object.values(set.views || {})[0] || { p: [0, 6, 20], l: [0, 4, 0] }; return { p: v.p, l: v.l, fov: v.fov || 50 }; });
    CAST.hideAll(); ENG.hideMoons(); ENG.clear(); CAST.order = []; ENG.faced = null;
    const set = ENG.S[sh.set]; if (set.reset) set.reset();
    const c = fn(set, u, sh) || {};
    // GreenBro-style acting: everyone on screen keeps moving (bounce, sway, head turns, arm gestures, steps), added on top of the stage pose
    const t = sh.t0 + u * (sh.t1 - sh.t0), S = Math.sin;
    if (ENG.MODE === 'gb') ENG.actGB(set, sh, c, t); else CAST.used.forEach((n) => { const a = CAST.get(n); if (!a.root.visible || a.root.parent !== set.scene) return;
      const ph = n.length * 1.7 + n.charCodeAt(0) * 0.37 + (n.charCodeAt(n.length - 1) || 0) * 0.11, sit = Math.abs(a.legL.rotation.x) > 1.2, k = c.act ?? 1;
      // no bounce: slow look-around + weight shift, and every 1.8-3 s a short gesture of its own (arm, other arm, nod/tilt)
      a.neck.rotation.y += 0.22 * S(t * 0.9 + ph) * k; a.neck.rotation.x += 0.05 * S(t * 1.3 + ph) * k; a.body.rotation.z += 0.03 * S(t * 0.7 + ph) * k; a.body.rotation.y += 0.06 * S(t * 0.5 + ph) * k;
      const P = 1.8 + ((ph * 7.31) % 1) * 1.2, tt = t + ph * 3, lo = tt % P, g = lo < 0.75 ? S(Math.PI * lo / 0.75) : 0, kind = Math.floor(tt / P) % 3;
      if (kind === 0) { a.armR.rotation.x -= 0.9 * g * k; a.armR.rotation.z -= 0.25 * g * k; }
      else if (kind === 1) { a.armL.rotation.x -= 0.9 * g * k; a.armL.rotation.z += 0.25 * g * k; }
      else { a.neck.rotation.x += 0.22 * g * k; a.neck.rotation.z += 0.18 * g * k; }
      if (!sit) { a.legL.rotation.x += 0.04 * S(t * 0.7 + ph) * k; a.legR.rotation.x -= 0.04 * S(t * 0.7 + ph) * k; } });
    // camera: fast eased punch-in (or pull-out every 3rd shot) at the cut, then a steady creep; light handheld
    const dt = t - sh.t0, ez = 1 - Math.exp(-dt * 7.5), out = sh.i % 3 === 1;
    const zoom = (out ? 0.8 + 0.2 * ez + 0.06 * u : 1.28 - 0.28 * ez - 0.12 * u) * (c.zoom ?? 1);
    const cam = ENG.cam, fv = c.fov || 50, k = (c.widen ?? ENG.WIDEN) * zoom; cam.fov = Math.min(100, 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fv) / 2) * k) * 180 / Math.PI); cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); const roll = ENG.MODE === 'gb' && !c.roll ? ENG.dutch(sh) : c.roll; if (roll) cam.rotateZ(THREE.MathUtils.degToRad(roll)); cam.rotateZ(0.012 * S(t * 1.9) + 0.006 * S(t * 4.3)); cam.rotateX(0.008 * S(t * 2.3 + 1)); cam.rotateY(0.008 * S(t * 1.6 + 2)); cam.near = c.near || 0.1; cam.updateProjectionMatrix();
    const g = Object.assign({}, KIT.GRADE[c.grade || set.grade || 'night'], { focus: c.focus || cam.position.distanceTo(V(...(c.f || c.l))) }, c.post || {});
    ENG.post.render(set.scene, cam, g);
    return ENG.renderer.domElement;
  };
})();
