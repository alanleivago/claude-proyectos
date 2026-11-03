// rbx-thursday engine: builds every set once, times the shot list on the voice, stages + renders a shot at u in [0,1].
'use strict';
const ENG = {};
(function () {
  const W = 1080, H = 1920, V = (x, y, z) => new THREE.Vector3(x, y, z);
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
    await MOON.load();
    for (const k of Object.keys(SETS)) { if (k === 'moontest' || k === 'propsheet') continue; const t = performance.now(); ENG.S[k] = await SETS[k]({ renderer }); console.log('set', k, Math.round(performance.now() - t), 'ms'); }
    ENG.S.sky = ENG.S.street;
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
    const a = CAST.get(name); a.root.updateMatrixWorld(true); const h = a.head.getWorldPosition(new THREE.Vector3()); h.y += dy;
    const q = a.head.getWorldQuaternion(new THREE.Quaternion()), fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q); fwd.y = 0; fwd.normalize();
    const base = Math.atan2(fwd.x, fwd.z) * 180 / Math.PI; return Object.assign(ENG.orbit(h.toArray(), d, base + yaw, pitch, fov, roll), { f: h.toArray() });
  };
  ENG.lerp = (a, b, u) => a.map((x, i) => x + (b[i] - x) * u);
  ENG.ease = (u) => u * u * (3 - 2 * u);
  ENG.render = function (idx, u = 0.5) {
    const sh = ENG.shots[idx], fn = STAGES[SHOTLIST[idx][0]] || ((set) => { const v = Object.values(set.views || {})[0] || { p: [0, 6, 20], l: [0, 4, 0] }; return { p: v.p, l: v.l, fov: v.fov || 50 }; });
    CAST.hideAll(); ENG.hideMoons(); ENG.clear();
    const set = ENG.S[sh.set]; if (set.reset) set.reset();
    const c = fn(set, u, sh) || {};
    const cam = ENG.cam, fv = c.fov || 50, k = c.widen ?? ENG.WIDEN; cam.fov = Math.min(100, 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fv) / 2) * k) * 180 / Math.PI); cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); if (c.roll) cam.rotateZ(THREE.MathUtils.degToRad(c.roll)); cam.near = c.near || 0.1; cam.updateProjectionMatrix();
    const g = Object.assign({}, KIT.GRADE[c.grade || set.grade || 'night'], { focus: c.focus || cam.position.distanceTo(V(...(c.f || c.l))) }, c.post || {});
    ENG.post.render(set.scene, cam, g);
    return ENG.renderer.domElement;
  };
})();
