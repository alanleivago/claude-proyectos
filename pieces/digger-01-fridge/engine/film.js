import { bitText } from './pixfont.js';
// film.js — "Digger 01: the fridge", full video (index.html?v=megagirl | ?v=studio).
// One shot list (storyboard.md minus shot 9, retimed to the v2 script); the timeline (shot starts, actions, faces, FX,
// labels) is driven by the chosen voice's word timings (timeline_<voice>.json, made by voz-studio/scripts/prep_timeline.py).
// Shot: { t0, hard, scene, camera, update(lt, t), fx, overlay }. Times below are GLOBAL seconds unless named lt.
// window.CUES collects sound cues (global time + kind) for the mixer (audio/mix.py reads them through render).
export const CHANNEL = 'MECHAYUKI', HANDLE = '@mechayuki';   // channel name + handle (chosen by the user): the ONLY place to change them
export const TAIL = 2.6;           // after the last word: the outro (channel name + follow CTA) over her goodbye shot
const SAWR = (new URLSearchParams(location.search).get('sawr') || '0.6,1.57,0').split(',').map(Number);

export function buildFilm({ SHOTS, TL, lib: L }) {
  const { THREE, FX, LW, LH, T, M } = L;
  const W = TL.words;                                   // [caption, start, end, paragraph, script token]
  const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  function wi(p, text, occ = 1) { let n = 0; for (let i = 0; i < W.length; i++) if (W[i][3] === p && nrm(W[i][4]) === nrm(text) && ++n === occ) return i; throw new Error(`word ${p} ${text} ${occ}`); }
  const ws = (p, t, o) => W[wi(p, t, o)][1], we = (p, t, o) => W[wi(p, t, o)][2];
  const END = TL.dur + TAIL;
  const CUES = (window.CUES = []);
  const cue = (t, kind, extra = {}) => CUES.push({ t: +t.toFixed(3), kind, ...extra });
  const V3 = (a) => new THREE.Vector3(...a);
  const hash = (k) => { let h = Math.imul(k * 2654435761, 1597334677); h ^= h >>> 15; return ((h >>> 0) % 10000) / 10000; };

  // ---------- character: actions in global time, face plan + blinks + talking mouth from the voice ----------
  const BLINKABLE = new Set(['open', 'half', 'surprised', 'angry', 'sad']);
  function blinkEyes(t, eyes) {
    if (!BLINKABLE.has(eyes)) return eyes;
    for (let k = 0; k < 40; k++) {
      const b = 1.1 + k * 3.4 + hash(k + 7) * 1.1, d = t - b;
      if (d >= 0 && d < 0.2) return ['half', 'blink', 'half'][Math.floor(d * 15)];
    }
    return eyes;
  }
  const mouthAt = (t) => TL.mouth[Math.floor(t * 15 + 1e-6)] || '-';
  function hero(scene, { p = [0, 0, 0], ry = 0 } = {}) {
    const ch = L.zero(); ch.root.position.set(...p); ch.root.rotation.y = ry; scene.add(ch.root);
    ch.drive = (t, segs, plan, talk = true) => {
      ch.pose(t, segs, [[-99, 'open', 'neutral']]);
      const q = Math.floor(t * 15 + 1e-6) / 15;
      let f = plan[0]; for (const x of plan) if (x[0] <= q + 1e-6) f = x;
      const m = talk ? mouthAt(t) : '-';
      L.setFace(ch.bone, { eyes: blinkEyes(q, f[1]), mouth: m === 'A' ? 'talkA' : m === 'O' ? 'talkO' : f[2] });
    };
    return ch;
  }
  const seg = (clip, at, o = {}) => ({ clip, at, ...o });
  const still = (clip, x) => seg(clip, -99, { from: x, speed: 0 });
  // shovel on both fists (zero-fem anim README, dig)
  const SHOV_HI = 8.6 * L.S, SHOV_LO = 5.6 * L.S, Y_UP = V3([0, 1, 0]), Z_FW = V3([0, 0, 1]);
  function shovelOnHands(ch, sh) {
    const hr = ch.hand('R').localToWorld(V3([0, 0.8, 0])), hl = ch.hand('L').localToWorld(V3([0, 0.8, 0]));
    const a = hr.clone().sub(hl).normalize();
    sh.position.copy(hr.clone().addScaledVector(a, -SHOV_HI).add(hl.clone().addScaledVector(a, -SHOV_LO)).multiplyScalar(0.5));
    sh.quaternion.setFromUnitVectors(Y_UP, a);
    const fw = Z_FW.clone().applyQuaternion(ch.root.quaternion); fw.addScaledVector(a, -fw.dot(a)).normalize();
    const z = Z_FW.clone().applyQuaternion(sh.quaternion);
    sh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(a, Math.atan2(z.clone().cross(fw).dot(a), z.dot(fw))));
    return sh.position;
  }
  // a Poly Pizza / CC model normalised to a height (or longest side) and made unlit + PS1 snapped
  function cc(name, size, { axis = 'max', tint = null } = {}) {
    const g = M['cc_' + name].clone(true);
    g.traverse((o) => {
      if (!o.isMesh) return;
      const conv = (m) => L.basic(m.map ? L.nearest(m.map) : null, tint ?? (m.map ? 0xffffff : m.color.getHex()), { side: THREE.DoubleSide, alphaTest: 0.5 });
      o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
    });
    const bb = new THREE.Box3().setFromObject(g), sz = bb.getSize(new THREE.Vector3());
    const ref = axis === 'max' ? Math.max(sz.x, sz.y, sz.z) : sz[axis];
    g.scale.setScalar(size / ref);
    const bb2 = new THREE.Box3().setFromObject(g), c = bb2.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -bb2.min.y, -c.z);   // centred, standing on y = 0
    const w = new THREE.Group(); w.add(g); return w;
  }

  // ---------- camera: one linear move per shot (+ optional punch-ins at given global times) ----------
  function camera(spec) {
    const cam = new THREE.PerspectiveCamera(spec.fov?.[0] ?? 36, 9 / 16, 0.05, 400);
    cam.go = (t, t0, t1) => {
      let s = spec; for (const j of spec.jumps || []) if (t >= j.t) s = { ...spec, ...j };
      const a = s.t0 ?? t0, b = s.t1 ?? t1, k = (t - a) / Math.max(0.1, b - a);
      const P = s.p.length > 1 ? V3(s.p[0]).lerp(V3(s.p[1]), k) : V3(s.p[0]);
      const Lk = s.l.length > 1 ? V3(s.l[0]).lerp(V3(s.l[1]), k) : V3(s.l[0]);
      if (s.shake && t >= s.shake[0] && t < s.shake[0] + s.shake[1]) { const f = Math.floor(t * 30); P.x += (hash(f) - 0.5) * s.shake[2]; P.y += (hash(f + 9) - 0.5) * s.shake[2]; }
      cam.position.copy(P); cam.lookAt(Lk);
      const fv = s.fov ? (s.fov.length > 1 ? s.fov[0] + (s.fov[1] - s.fov[0]) * Math.min(1, Math.max(0, k)) : s.fov[0]) : 36;
      if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); }
    };
    return cam;
  }

  // ---------- overlays: yellow "This is a..." label that pops in at its word, cyan HUD ----------
  const POPL = [0.55, 1.18, 0.96];
  function popLabel(o, t, tw, text, x, y, size, tip) {
    if (t < tw) return; const f = Math.floor((t - tw) * 30); const s = f < 3 ? POPL[f] : 1;
    const sc = Math.max(1, Math.round(2 * s)), c = o.tctx, w = text.length * 6 * sc;   // v3: same 2x scale as every indicator
    x = Math.min(LW - w / 2 - 4, Math.max(w / 2 + 4, x));
    if (tip && f >= 1) {
      c.strokeStyle = '#040412'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 9); c.lineTo(tip[0], tip[1]); c.stroke();
      c.strokeStyle = '#fdd941'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 9); c.lineTo(tip[0], tip[1]); c.stroke();
      c.fillStyle = '#040412'; c.fillRect(tip[0] - 2, tip[1] - 2, 5, 5); c.fillStyle = '#fdd941'; c.fillRect(tip[0] - 1, tip[1] - 1, 3, 3);
    }
    bitText(c, text, x, y, sc, '#fdd941');
  }
  // v2: object indicators (SCANNING, COLD AIR, HOT, SQUEEZE, ...) = Pixelify Sans at 14-16 low-res px (56-64 px out),
  // no faux-bold, 1 px letter spacing, crisp 1-bit glyphs on a dark plate with a coloured 1 px border
  function plateText(o, text, x, y, { size = 14, fg = '#ffffff', border = '#7cf0ff', bg = '#081020', pad = 3, scale = 1 } = {}) {
    const sc = Math.max(1, Math.round(size * scale / 7)), w = text.length * 6 * sc + 2 * pad + 6;
    x = Math.min(LW - w / 2 - 1, Math.max(w / 2 + 1, x)); y = Math.min(LH - 8 * sc, Math.max(8 * sc, y));
    bitText(o.tctx, text, x, y, sc, fg, { plate: bg, border, pad });
  }
  const popS = (t, tw) => { const f = Math.floor((t - tw) * 30); return f < 3 ? POPL[f] : 1; };
  function hudBox(o, x0, y0, x1, y1, col = '#7cf0ff') {
    const c = o.tctx; c.fillStyle = col; const L1 = 9;
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { c.fillRect(Math.min(x, x + sx * L1), y - (sy < 0 ? 1 : 0), L1, 2); c.fillRect(x - (sx < 0 ? 1 : 0), Math.min(y, y + sy * L1), 2, L1); }
  }

  // ---------- sets ----------
  function digSite(scene, { fridge = 'buried' } = {}) {   // S1: village + the excavation with the 1950s fridge
    L.village(scene, { cz: -5, cx: -3.5, holes: [[0.6, -0.6, 1.0]] });
    const hg = L.hole(scene, 0.6, -0.6, 1.0, 0.9);
    const fr = L.fridgeWhole(); scene.add(fr);
    if (fridge === 'buried') { fr.position.set(0.6, -0.75, -0.75); fr.rotation.set(-0.25, 0.25, 0.12); }
    else { fr.position.set(2.4, 0, -1.4); fr.rotation.set(0, -Math.PI / 2 + 0.15, 0); }
    const coil = L.cvs(16, 32, (c) => { c.fillStyle = '#3a3634'; c.fillRect(0, 0, 16, 32); c.fillStyle = '#141414'; for (let y = 1; y < 32; y += 3) c.fillRect(1, y, 14, 1); c.fillRect(1, 0, 1, 32); c.fillRect(14, 0, 1, 32); });
    L.plane(0.6, 1.15, L.basic(coil, 1, { side: THREE.DoubleSide }), 0, 0.72, -0.356, fr, Math.PI);   // condenser coil on the back   // dug out, standing on the snow, back toward +x
    if (fridge === 'buried') L.drift(scene, 2.9, -2.0, 0.8, 0.45, 0.6);
    L.drift(scene, -0.9, -1.4, 0.6, 0.35, 0.5); L.drift(scene, -1.7, 1.5, 0.7, 0.25, 0.4);   // spoil heaps, clear of where she stands
    L.footprints(scene, -0.6, 0.6, -2.4, 4.0, 10);
    const pile = fridge === 'buried' ? makePile(scene, 2.05, -0.72, 1.2) : null;   // spoil from the opening dig (shot 1 grows it)
    return { fr, hg, pile };
  }
  const HOLE = { x: 0.62, z: 0.28, r: 0.36 };
  function holeSite(scene, opts = {}) {   // S2: virgin snow + the small hole
    const { water = false, summer = false } = opts;
    L.village(scene, { cz: -5, cx: -3.5, holes: [[HOLE.x, HOLE.z, HOLE.r]] });
    const hg = L.hole(scene, HOLE.x, HOLE.z, HOLE.r, 0.5);
    L.drift(scene, -1.6, 0.6, 0.9, 0.25, 0.6); L.drift(scene, 2.2, -1.2, 1.4, 0.3, 0.8);
    if (PILE && !opts.noPile) { const pl = makePile(scene, PILE.x, PILE.z, 1); if (summer) pl.scale.set(1, 0.5, 1); }
    L.footprints(scene, -0.5, -0.3, -2.6, -4.5, 12);
    if (water) { const w = L.plane(HOLE.r * 1.85, HOLE.r * 1.85, L.basic(null, summer ? 0x7ab0d8 : 0x6a9ac0), HOLE.x, -0.16, HOLE.z, scene, 0, -Math.PI / 2); w.geometry = new THREE.CircleGeometry(HOLE.r * 0.93, 12); }
    if (summer) {   // warm summer grade: the snow goes grey-beige, the sky warm
      scene.traverse((o) => { if (o.isMesh && o.material && o.material.color) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.color.multiply(new THREE.Color(0.86, 0.8, 0.7))); });
      scene.background = L.cvs(1, LH, (c) => { for (let y = 0; y < LH; y++) { const k = Math.min(1, y / (0.62 * LH)); c.fillStyle = `rgb(${[120 + 118 * k, 160 + 54 * k, 214 - 46 * k].map(Math.round)})`; c.fillRect(0, y, 1, 1); } });
      scene.fog.color.set(0xead6b0);
    }
    return { hg };
  }
  // v2: a hole that grows with each shovel stroke. The ground already has the full-size hole cut in it; a snow ring
  // (inner radius r) covers the part not dug yet; the hole's wall, bottom and rim chunks follow r and the depth.
  function dynHole(scene, holeGroup, cx, cz, rMax, depth) {
    const mat = L.basic(L.rep(T.snow, 1 / 3, 1 / 3), 1.0, { polygonOffset: true, polygonOffsetFactor: -1, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, rMax + 0.03, 20, 1), mat); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 0.004, cz); scene.add(ring);
    const [wall, bot, ...rim] = holeGroup.children, base = rim.map((c) => c.position.clone()); let cur = -1;
    return (r, dk) => {
      if (Math.abs(r - cur) > 1e-4) { ring.geometry.dispose(); ring.geometry = new THREE.RingGeometry(Math.max(0.02, r), rMax + 0.03, 20, 1); cur = r; }
      const s = r / rMax, dd = Math.max(0.06, dk); wall.scale.set(s, dd, s); wall.position.y = -depth * dd / 2; bot.scale.set(s, s, 1); bot.position.y = -depth * dd + 0.01;
      rim.forEach((c, i) => { c.position.set(base[i].x * s, base[i].y, base[i].z * s); });
    };
  }
  // snow chunks thrown from the blade to the spoil pile on each toss (ballistic, deterministic in t), pile grows on landing
  function tossFX(scene, tosses, to, pile, pileScale) {
    const m = L.basic(L.rep(T.snow, 1, 1), 0.8), ch = [...Array(9)].map((_, i) => { const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + (i % 3) * 0.02, 0), m); scene.add(o); o.visible = false; return o; });
    const FL = 0.42, base = pile.scale.clone();
    return (t) => {
      const q = Math.floor(t * 30) / 30; let landed = 0, cur = null;
      for (const tk of tosses) { if (q >= tk.t + FL) landed++; else if (q >= tk.t) cur = tk; }
      const k = tosses.length ? landed / tosses.length : 1; pile.scale.set(base.x * (0.45 + 0.55 * k), base.y * (0.3 + 0.7 * k), base.z * (0.45 + 0.55 * k));
      pile.scale.multiplyScalar(pileScale ?? 1);
      ch.forEach((o, i) => {
        if (!cur) { o.visible = false; return; }
        const u = (q - cur.t) / FL, a = cur.p, b = V3([to.x + (hash(i + 3) - 0.5) * 0.3, to.y, to.z + (hash(i + 9) - 0.5) * 0.3]);
        o.position.set(a.x + (b.x - a.x) * u + (hash(i) - 0.5) * 0.08, a.y + (b.y - a.y) * u + 4 * (0.35 + hash(i + 1) * 0.15) * u * (1 - u), a.z + (b.z - a.z) * u);
        o.rotation.set(u * 6 + i, u * 4, 0); o.visible = u < 0.98;
      });
    };
  }
  let PILE = null;   // spoil pile of the small hole (shot 3), reused by the shots at the same hole
  // a spoil pile that reads on white snow: a cluster of rough, slightly blue-grey clumps (a smooth drift vanished on the snow)
  function makePile(scene, x, z, size = 1) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    for (let i = 0; i < 11; i++) {
      const a = hash(i + 40) * 6.283, r = 0.22 * Math.sqrt(hash(i + 50)) * size, h = (0.09 + 0.08 * (1 - r / (0.22 * size))) * size;
      const o = L.mesh(new THREE.IcosahedronGeometry(0.1 * size + hash(i + 60) * 0.05 * size, 0), L.basic(L.rep(T.snow, 1, 1), 0.74 + hash(i + 70) * 0.18), Math.cos(a) * r, h * 0.5, Math.sin(a) * r, g);
      o.scale.y = 0.6; o.rotation.set(hash(i) * 3, hash(i + 1) * 3, 0);
    }
    return g;
  }
  function labSet(scene) {
    L.addSky(scene, { near: 30, far: 90, preset: 'lab' });
    const g = L.cvs(16, 16, (c) => { c.fillStyle = '#10204a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#3a78d8'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16); });
    L.plane(60, 60, L.basic(L.rep(g, 60, 60), 1), 0, 0, 0, scene, 0, -Math.PI / 2);
  }
  function icebox(scene, x, z, { section = false, door = false } = {}) {   // wooden icebox: ice on top, food below
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const oak = L.basic(L.rep(T.planks, 0.6, 0.6), 2.4), D = section ? 0.3 : 0.6, inner = L.basic(null, 0x6a4a2e);
    if (!section) {
      L.box(0.8, 1.3, 0.6, oak, 0, 0.65, -0.3, g);
      L.box(0.82, 0.05, 0.62, oak, 0, 0.82, -0.3, g);                                  // shelf line
      if (door) {   // lower door open: the food inside
        L.plane(0.66, 0.6, inner, 0, 0.42, 0.005, g);
        const m = L.meat(); m.position.set(-0.08, 0.3, 0.05); g.add(m);
        L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 7), L.basic(null, 0xf4f4f0), 0.18, 0.22, 0.02, g);
        const d = L.box(0.66, 0.6, 0.04, oak, 0, 0.42, 0, null); const hinge = new THREE.Group(); hinge.position.set(-0.33, 0, 0.02); g.add(hinge); hinge.add(d); d.position.set(0.33, 0.42, 0); hinge.rotation.y = -1.9;
      }
      L.box(0.03, 0.12, 0.03, L.basic(null, 0xc8b070), 0.32, 1.05, 0.02, g);
    } else {
      for (const [w, h, xx, yy] of [[0.8, 0.06, 0, 1.27], [0.8, 0.06, 0, 0.03], [0.06, 1.3, -0.37, 0.65], [0.06, 1.3, 0.37, 0.65], [0.8, 0.04, 0, 0.82]]) L.box(w, h, D, oak, xx, yy, -D / 2, g);
      L.plane(0.68, 1.18, L.basic(null, 0x7a5a3a), 0, 0.65, -D + 0.01, g);
      const m = L.meat(); m.position.set(-0.05, 0.25, -0.15); g.add(m);
      L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 7), L.basic(null, 0xf4f4f0), 0.2, 0.15, -0.15, g);
    }
    const ice = L.iceBlock(0.5, 0.3, 0.3); ice.position.set(0, section ? 1.0 : 1.45, -0.15); g.add(ice); g.userData.ice = ice;
    return g;
  }
  function bathroom(scene) {   // S4b: the ruined kitchen walls with an old tub and a shower
    L.kitchenSet(scene);
    const tub = cc('bathtub', 1.55); tub.rotation.y = Math.PI / 2; tub.position.set(1.0, 0, -1.1); scene.add(tub);
    const pipeM = L.basic(null, 0x8a8c94);
    L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.9, 5), pipeM, 1.55, 1.0, -1.52, scene);
    const arm = L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 5), pipeM, 1.55, 1.95, -1.38, scene); arm.rotation.x = Math.PI / 2;
    const head = L.mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.06, 8), L.basic(null, 0xb8bcc4), 1.55, 1.92, -1.22, scene); head.rotation.x = 0.5;
    L.drift(scene, -0.6, -0.6, 0.6, 0.14, 0.35);
    return { head: V3([1.55, 1.88, -1.18]) };
  }
  function iceSite(scene) {   // S3 + sled with blocks + tongs on the ice
    const r = L.icehouseSet(scene);
    const sled = cc('sled', 1.25); sled.position.set(-1.6, 0, 1.9); sled.rotation.y = 0.5; scene.add(sled);
    for (const [x, z] of [[-0.25, 0], [0.25, 0]]) { const b = L.iceBlock(0.42, 0.3, 0.32); b.position.set(x, 0.32, z); sled.add(b); }
    const tg = cc('tongs', 0.5); tg.rotation.set(Math.PI / 2, 0, 0.6); tg.position.set(-2.3, 0.4, 1.45); scene.add(tg);
    return r;
  }

  // ---------- shot factory ----------
  function shot(spec) { return spec; }   // {at:[p,word,occ], mode:'M'|'C', make(t0) -> {scene, camera, update(lt,t), fx, overlay}}
  const S = [];

  // ===== 1. "Operator... I dug up another human artifact."  establishing, she digs next to the buried fridge
  S.push({ at: [1, 'Operator'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const { fr, hg, pile } = digSite(scene);
    const ch = hero(scene, { p: [1.62, 0, -1.55], ry: -0.93 });
    const shovel = L.model('shovel', 1.15); scene.add(shovel);
    const tA = ws(1, 'artifact'), cyc = 1.2, from = ((0.27 - (tA + 99)) % cyc + cyc) % cyc;
    const tS = tA + 0.3;
    const segs = [seg('dig', -99, { loop: true, from }), seg('surprised', tS, { fade: 0.1 })];
    const plan = [[-99, 'angry', 'shout'], [tA, 'surprised', 'gasp'], [tS + 0.5, 'shocked', 'gasp']];
    // v2: every stroke widens the pit (on the pry, f15) and throws a clump of snow onto the spoil pile (toss, f27)
    const starts = []; for (let k = -4; k <= 0; k++) { const cs = tA - 0.27 + k * cyc; if (cs + 0.47 > -0.7) starts.push(cs); }
    const prys = starts.map((cs) => cs + 0.47), tosses = starts.filter((cs) => cs + 0.87 < tS).map((cs) => ({ t: cs + 0.87 }));
    for (const tk of tosses) { ch.drive(tk.t, segs, plan); scene.updateMatrixWorld(true); tk.p = shovelOnHands(ch, shovel).clone(); }
    const grow = dynHole(scene, hg, 0.6, -0.6, 1.0, 0.9), toss = tossFX(scene, tosses, V3([pile.position.x, 0.18, pile.position.z]), pile);
    const holeR = (t) => { const n = prys.filter((x) => x <= t).length; return 0.52 + 0.48 * n / prys.length; };
    for (let k = -3; k < 4; k++) { const tp = tA - 0.27 + k * cyc; if (tp + 0.27 > 0.05 && tp + 0.27 < tS) cue(tp + 0.27, k === 0 ? 'clang' : 'shovel_snow'); }
    for (let k = -3; k < 4; k++) { const tt = tA - 0.27 + 0.87 + k * cyc - cyc; if (tt > 0.05 && tt < tS) cue(tt, 'snow_toss'); }
    cue(0.0, 'wind_start');
    let frozen = null; const sf = L.snowfall(scene, { cx: 0, cz: -1, R: 11 });
    const tip = new THREE.Vector3();
    const fx = new FX(LW, LH).add('impact', { world: [0.78, 0.55, -0.55], t0: tA, dur: 0.4, scale: 1.3 })
      .add('dust', { world: [1.0, 0.1, -1.05], t0: tA - 0.27 + 0.87 - 2 * cyc, dur: tS - (tA - 2 * cyc), every: cyc, color: '#ffffff', edge: '#b8c4d4' })
      .add('exclaim', { obj: ch.root, bone: 'Head', offset: [0, 0.42, 0], t0: tA + 0.05, dur: 1.0, scale: 0.9 });
    const cam = camera({ p: [[-0.3, 3.3, 5.0], [-0.05, 2.7, 4.2]], l: [[1.25, 0.45, -0.95], [1.3, 0.45, -0.95]], fov: [38] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, segs, plan); scene.updateMatrixWorld(true);
      if (t < tS) shovelOnHands(ch, shovel);
      const r = holeR(t); grow(r, 0.4 + 0.6 * (r - 0.52) / 0.48); toss(t);
      sf(t); cam.go(t, t0, t1);
    } };
  } });

  // ===== 2. "Humans called it... a fridge."  reveal close: her face + the fridge, scan HUD
  S.push({ at: [1, 'Humans'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); digSite(scene);
    const ch = hero(scene, { p: [1.85, 0, -0.2], ry: -0.75 });
    const tF = ws(1, 'fridge');
    const segs = [seg('idle', -99, { loop: true }), seg('cheer', tF - 0.15, { fade: 0.12 })];
    const plan = [[-99, 'surprised', 'gasp'], [tF, 'hearts', 'smileOpen']];
    cue(t0 + 0.05, 'scan'); cue(tF, 'sting');
    const sf = L.snowfall(scene, { cx: 1, cz: 0, R: 8 });
    const fx = new FX(LW, LH).add('sparkle', { world: [0.62, 0.55, -0.45], t0: tF, dur: 3, n: 5, radius: 18 })
      .add('heart', { obj: ch.root, bone: 'Head', offset: [0.05, 0.3, 0], t0: tF + 0.1, dur: 1.6, n: 2 });
    const cam = camera({ p: [[2.4, 1.35, 5.6], [2.3, 1.32, 5.1]], l: [[1.3, 0.66, -0.45], [1.3, 0.66, -0.45]], fov: [32] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt; if (t < t0 + 0.1) return;
        // v2: a compact target box on the exposed top of the fridge (2 px corner brackets) + one plate label
        const p0 = L.toScreen(cam, 0.6, 0.62, -0.75), cx = p0[0], cy = p0[1] + 8, hw = 26, hh = 22;
        const col = t < tF ? '#7cf0ff' : '#fdd941'; hudBox(o, cx - hw, cy - hh, cx + hw, cy + hh, col);
        if (t < tF) { const sc = ((t - t0) * 1.6) % 1; o.tctx.fillStyle = col; o.tctx.fillRect(cx - hw + 3, Math.round(cy - hh + 2 * hh * sc), 2 * hw - 6, 1); }
        plateText(o, t < tF ? 'SCANNING' : 'ARTIFACT 001', cx, cy - hh - 15, { size: 14, border: col, fg: t < tF ? '#c8f8ff' : '#fff2a0', scale: t >= tF ? popS(t, tF) : 1 });
      } };
  } });

  // the hole and the drop: the meat is released at drop_object f22 (0.70 s), right on "it"
  const tIt = ws(2, 'it'), tDrop0 = tIt - 21 / 30;
  // ===== 3. "If you dig a hole in the snow"  high 3/4, she digs the small hole
  S.push({ at: [2, 'If'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const { hg } = holeSite(scene, { noPile: true });
    const ry = -0.4;   // v2: 3/4 to camera so the toss (to her left) lands on screen
    const ch = hero(scene, { p: [0, 0, 0], ry }); const shovel = L.model('shovel', 1.15); scene.add(shovel);
    ch.pose(0, [still('dig', 15 / 30)], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true);
    const tip = shovelOnHands(ch, shovel).clone();
    ch.root.position.set(HOLE.x - tip.x, 0, HOLE.z - tip.z);
    const cyc = 1.2, from = ((-(t0 + 99)) % cyc + cyc) % cyc;
    const segs = [seg('dig', -99, { loop: true, from })];
    // v2: the hole grows on each pry and the snow lands on a pile at her left (the pile stays there in the next shots)
    const left = V3([Math.cos(ry), 0, -Math.sin(ry)]), fwd = V3([Math.sin(ry), 0, Math.cos(ry)]);
    PILE = ch.root.position.clone().addScaledVector(left, 0.85).addScaledVector(fwd, 0.25);
    const pile = makePile(scene, PILE.x, PILE.z, 1);
    const starts = []; for (let k = 0; k < 6; k++) { const cs = t0 + k * cyc; if (cs < t1) starts.push(cs); }
    const prys = starts.map((cs) => cs + 0.47), tosses = starts.map((cs) => ({ t: cs + 0.87 })).filter((x) => x.t < t1 + 0.2);
    for (const tk of tosses) { ch.drive(tk.t, segs, [[-99, 'angry', 'shout']]); scene.updateMatrixWorld(true); tk.p = shovelOnHands(ch, shovel).clone(); }
    const grow = dynHole(scene, hg, HOLE.x, HOLE.z, HOLE.r, 0.5), toss = tossFX(scene, tosses, V3([PILE.x, 0.12, PILE.z]), pile);
    const holeR = (t) => { const n = prys.filter((x) => x <= t).length; return 0.1 + (HOLE.r - 0.1) * Math.min(1, (n + 0.5) / prys.length); };
    for (let k = 0; k < 6; k++) { const tp = t0 + 0.27 + k * cyc; if (tp < t1) cue(tp, 'shovel_snow'); const tt = t0 + 0.87 + k * cyc; if (tt < t1) cue(tt, 'snow_toss'); }
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 9 });
    const fx = new FX(LW, LH).add('dust', { world: [HOLE.x, 0.05, HOLE.z], t0: t0 + 0.87, dur: 9, every: cyc, color: '#ffffff', edge: '#b8c4d4', n: 6 })
      .add('dust', { world: [HOLE.x, 0.03, HOLE.z], t0: t0 + 0.27, dur: 9, every: cyc, color: '#f4f6fa', edge: '#c8d0dc', n: 4, life: 0.4 });
    const cam = camera({ p: [[1.65, 2.6, 3.5], [1.3, 2.6, 3.7]], l: [[1.1, 0.42, 0.1], [1.0, 0.42, 0.1]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, [[-99, 'angry', 'shout']]); scene.updateMatrixWorld(true); shovelOnHands(ch, shovel); const r = holeR(t); grow(r, r / HOLE.r); toss(t); sf(t); cam.go(t, t0, t1); } };
  } });

  // ===== 4. "and throw your meat in it... you have a refrigerator."  HOOK (style frame A)
  S.push({ at: [2, 'and'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); holeSite(scene);
    const ry = 0.3;
    const ch = hero(scene, { p: [0, 0, 0], ry });
    const mt = L.holdIn(ch, L.meat(), 'L', [0, 0.8, 0], [0, 0, 1.6]); mt.scale.multiplyScalar(1.3);
    const tRel = Math.ceil(tIt * 30 - 1e-6) / 30;
    ch.drive(tRel, [seg('idle', -99, { loop: true }), seg('drop_object', tDrop0, { fade: 0.1 })], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true);
    const mp = mt.getWorldPosition(new THREE.Vector3());
    ch.root.position.set(HOLE.x - mp.x, 0, HOLE.z - mp.z);
    const sh = L.model('shovel', 1.15); sh.position.set(HOLE.x + 0.5, -0.28, HOLE.z - 0.62); sh.rotation.set(0.1, 0.5, -0.22); scene.add(sh);
    L.drift(scene, HOLE.x + 0.5, HOLE.z - 0.62, 0.4, 0.3, 0.32);
    const tR = ws(2, 'refrigerator');
    const segs = [seg('idle', -99, { loop: true }), seg('drop_object', tDrop0, { fade: 0.1 })];
    const plan = [[-99, 'happy', 'smileOpen'], [tIt, 'open', 'surprised'], [tIt + 0.5, 'happy', 'smile'], [tR, 'relaxed', 'cat']];
    let fall = null; const g = 9.8, bottom = -0.42;
    cue(tIt + 0.42, 'thud_snow'); cue(tR, 'label'); cue(tR + 0.05, 'ding');
    const sf = L.snowfall(scene, { cx: 0, cz: -2, R: 10 });
    const fx = new FX(LW, LH).add('snow', { world: [HOLE.x, 0.1, HOLE.z], t0: tIt + 0.45, dur: 9, n: 6, width: 40, height: 28, seed: 4, color: '#e8f8ff' })
      .add('sparkle', { world: [HOLE.x, 0.1, HOLE.z], t0: tR, dur: 4, n: 4, radius: 14, color: '#9cf0ff' });
    const cam = camera({ p: [[0.85, 1.22, 4.5], [0.72, 1.2, 4.2]], l: [[0.38, 0.62, 0.05], [0.38, 0.62, 0.05]], fov: [38] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, segs, plan); scene.updateMatrixWorld(true);
      if (t >= tRel - 1e-4 && !fall) { scene.attach(mt); fall = { p: mt.position.clone(), r: mt.rotation.clone() }; }
      if (t < tRel - 1e-4 && fall) { ch.hand('L').attach(mt); fall = null; }
      if (fall) { const d = Math.floor((t - tRel) * 30 + 1e-4) / 30; const y = Math.max(bottom, fall.p.y - 0.5 * g * d * d); mt.position.set(fall.p.x, y, fall.p.z); mt.rotation.set(fall.r.x + d * 3, fall.r.y, fall.r.z + d * 2); }
      sf(t); cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const tip = L.toScreen(cam, HOLE.x, 0, HOLE.z); popLabel(o, t0 + lt, tR, 'REFRIGERATOR', 135, Math.min(tip[1] - 70, 290), 18, [tip[0], tip[1]]); } };
  } });

  // ===== 5. "But snow melts in summer..."  same hole, summer: grey slush, puddle, sad shrug
  S.push({ at: [3, 'But'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); holeSite(scene, { water: true, summer: true });
    const ch = hero(scene, { p: [-0.35, 0, -0.1], ry: 0.45 });
    const tS = ws(3, 'summer');
    const segs = [seg('idle', -99, { loop: true }), seg('shrug', tS - 0.1, { fade: 0.12 })];
    cue(t0 + 0.2, 'summer_birds'); cue(tS, 'drip');
    const fx = new FX(LW, LH).add('heat', { world: [HOLE.x + 0.1, 0.05, HOLE.z], t0, dur: 9, lines: 3 })
      .add('drip', { world: [HOLE.x - 0.3, 0.02, HOLE.z + 0.2], t0, dur: 9, every: 0.7 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.22, 0.05], t0: tS, dur: 2 });
    const cam = camera({ p: [[2.0, 1.45, 3.7]], l: [[0.2, 0.62, 0.05]], fov: [34] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, [[-99, 'sad', 'frown']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {   // pixel sun
        const c = o.tctx, x = 222, y = 58, f = Math.floor(lt * 4) % 2;
        c.fillStyle = '#040412'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill();
        c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(x, y, 13, 0, 7); c.fill(); c.fillStyle = '#fff2a0'; c.fillRect(x - 6, y - 7, 5, 4);
        c.fillStyle = '#ffd23a'; for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + f * 0.39, r0 = 18, r1 = 24; c.fillRect(Math.round(x + Math.cos(an) * r0) - 1, Math.round(y + Math.sin(an) * r0) - 1, 3, 3); c.fillRect(Math.round(x + Math.cos(an) * r1) - 1, Math.round(y + Math.sin(an) * r1) - 1, 2, 2); }
      } };
  } });

  // ===== 6. "so humans cut giant blocks of ice from frozen lakes..."  she saws the lake ice
  S.push({ at: [3, 'so'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); iceSite(scene);
    const ch = hero(scene, { p: [-3.75, 0, 1.35], ry: 1.3 });
    const saw = cc('saw', 0.95); const hs = new THREE.Group(); const hs2 = new THREE.Group(); hs.add(hs2); hs2.add(saw); saw.rotation.set(Math.PI / 2, 0, 0); saw.position.set(0, 0.36, 0); hs2.rotation.set(SAWR[0], SAWR[1], SAWR[2]);
    L.holdIn(ch, hs, 'R', [0, 0.8, 0], [0, 0, 0]);
    const segs = [seg('saw', -99, { loop: true, from: 0 })];
    for (let k = 0; k * 0.667 < t1 - t0; k++) cue(t0 + 0.1 + k * 0.667, 'ice_saw');
    cue(ws(3, 'ice'), 'ice_crack');
    const fx = new FX(LW, LH).add('crack', { world: [-3.05, 0.0, 1.55], t0: ws(3, 'cut'), dur: 9, n: 4, len: 30 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: t0 + 0.4, dur: 1.6 })
      .add('sparkle', { world: [-3.05, 0.05, 1.55], t0: ws(3, 'ice'), dur: 9, n: 3, radius: 14, color: '#bff4ff' })
      .add('splash', { world: [-3.05, 0.0, 1.58], t0: t0 + 0.2, dur: 9, every: 0.667, n: 6, scale: 0.7 });
    const cam = camera({ p: [[-1.6, 1.6, 5.6], [-2.5, 1.6, 5.6]], l: [[-3.7, 0.7, 1.0], [-4.2, 0.7, 1.0]], fov: [38] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, [[-99, 'angry', 'shout']]); cam.go(t, t0, t1); } };
  } });

  // ===== 7. "and hid them in a shed full of sawdust."  inside the icehouse, she pours sawdust over the blocks
  S.push({ at: [3, 'and'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); iceSite(scene);
    const ch = hero(scene, { p: [3.3, 0, -0.9], ry: -Math.PI / 2 - 0.15 });
    // v2: the bucket is driven in world space: it hangs from her right fist by the rim and tips forward (toward the pile),
    // and a stream of sawdust grains falls from the low lip onto the heap
    const bk = cc('bucket', 0.34); scene.add(bk);
    const ry = ch.root.rotation.y, fwd = V3([Math.sin(ry), 0, Math.cos(ry)]), qy = new THREE.Quaternion().setFromAxisAngle(V3([0, 1, 0]), ry), qx = new THREE.Quaternion();
    const tS = ws(3, 'sawdust'), tA = t0 + 0.3, tB = t0 + 0.8;
    const segs = [seg('pour', t0 - 0.2)];
    const gm = [L.basic(null, 0xe0bc70), L.basic(null, 0xb88a48)], grains = [...Array(40)].map((_, i) => { const o = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.026, 0.026), gm[i % 2]); scene.add(o); return o; });
    cue(tB - 0.1, 'sawdust_pour'); cue(t0 + 0.1, 'wood_door');
    const fx = new FX(LW, LH).add('dust', { world: [2.62, 0.28, -1.3], t0: tB + 0.2, dur: 9, every: 0.45, color: '#e8c880', edge: '#a8804a', n: 6 })
      .add('sparkle', { world: [1.9, 0.8, -1.7], t0, dur: 9, n: 3, radius: 18, color: '#bff4ff' });
    const hp = new THREE.Vector3(), lip = new THREE.Vector3();
    const cam = camera({ p: [[0.55, 1.2, 2.3], [0.75, 1.17, 2.0]], l: [[3.0, 0.78, -1.0], [3.0, 0.78, -1.0]], fov: [36] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, segs, [[-99, 'happy', 'smile'], [tS, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true);
      const q = Math.floor(t * 15) / 15, k = Math.min(1, Math.max(0, (q - tA) / (tB - tA))), tilt = 2.0 * k * k * (3 - 2 * k);
      qx.setFromAxisAngle(V3([1, 0, 0]), tilt); bk.quaternion.copy(qy).multiply(qx);
      ch.hand('R').localToWorld(hp.set(0, 0.8, 0));
      bk.position.copy(hp).sub(V3([0, 0.33, 0]).applyQuaternion(bk.quaternion)).add(V3([0, -0.02, 0]));
      lip.copy(bk.position).add(V3([0, 0.33, 0.12]).applyQuaternion(bk.quaternion));
      grains.forEach((o, i) => {
        if (k < 0.55) { o.visible = false; return; }
        const T = 0.5, u = ((q * 1.7 + i / grains.length) % 1), d = u * T;
        o.position.set(lip.x + fwd.x * 0.35 * d + (hash(i) - 0.5) * 0.06, Math.max(0.3, lip.y - 4.9 * d * d), lip.z + fwd.z * 0.35 * d + (hash(i + 5) - 0.5) * 0.06);
        o.rotation.set(i + q * 7, i * 2, 0); o.visible = true;
      });
      cam.go(t, t0, t1);
    } };
  } });

  // ===== 8. "icehouse."  ICEHOUSE (style frame B): she carries a block, label on the roof
  S.push({ at: [3, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); iceSite(scene);
    const ch = hero(scene, { p: [-0.1, 0, 1.6], ry: 2.6 });
    const blk = L.iceBlock(0.5, 0.36, 0.36); scene.add(blk); const hp = new THREE.Vector3();
    const tI = ws(3, 'icehouse'); cue(tI, 'label'); cue(tI + 0.02, 'sting_small'); cue(t0 + 0.3, 'steps_snow');
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 12 });
    const fx = new FX(LW, LH).add('sparkle', { world: [2.0, 0.9, -1.6], t0, dur: 9, n: 4, radius: 16, color: '#bff4ff', seed: 7 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: t0 + 0.2, dur: 2 });
    const cam = camera({ p: [[-0.6, 3.0, 15.0], [-0.4, 2.8, 13.4]], l: [[0.8, 1.6, -2.0]], fov: [36] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [still('carry_heavy', 1.25)], [[-99, 'angry', 'shout']]); scene.updateMatrixWorld(true);
      ch.hand('R').localToWorld(hp.set(0, 0.8, 0)); const ry = ch.root.rotation.y;
      blk.position.copy(hp).add(V3([-Math.sin(ry) * 0.16, 0.12, -Math.cos(ry) * 0.16])); blk.rotation.set(0, ry + 0.3, 0.15);
      sf(t); cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const p = L.toScreen(cam, 2.2, 4.4, -2.6); popLabel(o, t0 + lt, tI, 'ICEHOUSE', 135, 64, 22, p); } };
  } });

  // ===== 10. "But ice melts... and your meat ends up swimming. Gross."  meat floating, she gags
  S.push({ at: [4, 'But'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); holeSite(scene, { water: true });
    const m = L.meat(); m.position.set(HOLE.x, -0.15, HOLE.z); m.rotation.set(0.2, 0.6, 0.1); scene.add(m);
    const ch = hero(scene, { p: [HOLE.x - 0.85, 0, HOLE.z - 0.25], ry: 0.75 });
    const tG = ws(4, 'gross'), tSw = ws(4, 'swimming');
    const segs = [seg('idle', -99, { loop: true }), seg('look_around', t0 + 0.05, { speed: 1.3 })];
    const plan = [[-99, 'half', 'neutral'], [tSw, 'shocked', 'gasp']];
    cue(t0 + 0.3, 'water_slosh'); cue(tSw, 'splash_small');
    const fx = new FX(LW, LH).add('stink', { world: [HOLE.x, -0.05, HOLE.z], t0: tSw - 0.3, dur: 9 })
      .add('bubbles', { world: [HOLE.x, -0.1, HOLE.z], t0, dur: 9, every: 0.3 })
      .add('exclaim', { obj: ch.root, bone: 'Head', offset: [0.1, 0.42, 0], t0: tSw + 0.1, dur: 9, scale: 0.8 });
    const c0 = [1.6, 1.3, 3.35], l0 = [0.18, 0.72, 0.1];
    const cam = camera({ p: [c0, [1.95, 1.3, 3.65]], l: [l0, [0.3, 0.8, 0.1]], fov: [36] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); m.position.y = -0.15 + Math.sin(Math.floor(t * 15) / 15 * 4) * 0.015; m.rotation.y = 0.6 + Math.floor(t * 15) / 15 * 0.4; cam.go(t, t0, t1); } };
  } });

  // ===== 10b (v2). "Gross."  hard cut to her disgusted reaction: tongue out, head shake, stink lines, shake on the cut
  S.push({ at: [4, 'Gross'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); holeSite(scene, { water: true });
    const m = L.meat(); m.position.set(HOLE.x, -0.15, HOLE.z); scene.add(m);
    const ch = hero(scene, { p: [HOLE.x - 0.85, 0, HOLE.z - 0.25], ry: 0.75 });
    const tG = ws(4, 'gross');
    const segs = [seg('shake_head', tG - 0.05)];
    const plan = [[-99, 'disgust', 'disgust']];   // v3: painted disgust cells (squint + wavy grimace + tongue tip)
    cue(tG, 'gross'); cue(tG, 'punch');
    const fx = new FX(LW, LH).add('stink', { obj: ch.root, bone: 'Head', offset: [0.22, 0.05, 0.12], t0: tG, dur: 9, lines: 3 })
      .add('stink', { obj: ch.root, bone: 'Head', offset: [-0.2, 0.05, 0.1], t0: tG + 0.15, dur: 9, lines: 2 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.12, 0.2, 0.08], t0: tG + 0.1, dur: 1.5 })
      .add('impact', { obj: ch.root, bone: 'Head', offset: [0, 0.1, 0.1], t0: tG, dur: 0.35, scale: 1.6, color: '#c8f080' });
    const ry = 0.75, hd = V3([HOLE.x - 0.85, 1.38, HOLE.z - 0.25]), f = V3([Math.sin(ry), 0, Math.cos(ry)]);
    const cam = camera({ p: [hd.clone().addScaledVector(f, 1.5).add(V3([0.15, 0.05, 0])).toArray(), hd.clone().addScaledVector(f, 1.35).add(V3([0.15, 0.04, 0])).toArray()], l: [hd.clone().add(V3([0, -0.1, 0])).toArray()], fov: [26], shake: [tG, 0.3, 0.035] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan, false); cam.go(t, t0, t1); } };
  } });

  // ===== 11. "So they put the ice on top of a wooden box... and the food underneath."  the icebox
  S.push({ at: [5, 'So'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.kitchenSet(scene);
    const ib = icebox(scene, 0.55, -0.35, { door: true }); const ice = ib.userData.ice; ice.visible = false;
    const ch = hero(scene, { p: [-0.2, 0, 0.35], ry: 0.75 });
    const held = L.iceBlock(0.38, 0.22, 0.24); scene.add(held);
    const tBox = we(5, 'box'), tFood = ws(5, 'food'), tPut = tBox - 0.15;
    const segs = [seg('hold_up_object', t0 - 0.35), seg('present', tPut + 0.25, { fade: 0.15 })];
    const plan = [[-99, 'open', 'smileOpen'], [tPut, 'happy', 'smile'], [tFood, 'open', 'smileOpen']];
    cue(tPut + 0.2, 'ice_place'); cue(t0 + 0.2, 'wood_creak');
    const hp = new THREE.Vector3(), dst = V3([0.55, 1.45, -0.5]);
    const fx = new FX(LW, LH).add('sparkle', { world: [0.55, 1.5, -0.5], t0: tPut + 0.2, dur: 1.2, n: 4, color: '#bff4ff' })
      .add('idea', { obj: ch.root, bone: 'Head', offset: [0.1, 0.45, 0], t0: tFood, dur: 9, scale: 0.7 })
      .add('arrow', { world: [0.55, 0.5, 0.15], t0: tFood, dur: 9, angle: Math.PI / 2, len: 14, color: '#ffd93b', light: '#fff2a0', edge: '#5a3a00' });
    const cam = camera({ p: [[0.05, 1.2, 6.4], [0.25, 1.15, 6.0]], l: [[0.15, 0.9, -0.1], [0.2, 0.88, -0.1]], fov: [32] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, segs, plan); scene.updateMatrixWorld(true);
      if (t < tPut) { ch.hand('R').localToWorld(hp.set(0, 0.8, 0)); held.position.copy(hp).add(V3([0.05, 0.16, 0])); held.rotation.set(0, 0.75, 0); held.visible = true; ice.visible = false; }
      else if (t < tPut + 0.2) { const k = Math.floor((t - tPut) * 15) / 3; ch.hand('R').localToWorld(hp.set(0, 0.8, 0)); held.position.copy(hp).lerp(dst, Math.min(1, k)); held.visible = true; }
      else { held.visible = false; ice.visible = true; }
      cam.go(t, t0, t1);
    } };
  } });

  // ===== 12. "Cold air sinks. This is an icebox."  cutaway: the box in section, blue arrows sink; punch-in on "icebox"
  S.push({ at: [5, 'Cold'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); L.kitchenSet(scene); icebox(scene, 0.15, 0, { section: true });
    const tI = ws(5, 'icebox'); cue(t0, 'cold_whoosh'); cue(tI, 'label'); cue(tI, 'punch');
    const fx = new FX(LW, LH);
    for (const [x, s] of [[-0.12, 5], [0.15, 6], [0.42, 7]]) fx.add('arrow', { world: [x, 0.6, -0.1], t0, dur: 9, angle: Math.PI / 2, len: 16, color: '#3c9ce8', seed: s });
    fx.add('snow', { world: [0.15, 0.95, -0.1], t0, dur: 9, n: 7, width: 40, height: 30 });
    const cam = camera({ p: [[0.15, 0.78, 3.15]], l: [[0.15, 0.7, 0]], fov: [32], jumps: [{ t: tI, p: [[0.15, 0.82, 2.55], [0.15, 0.82, 2.45]], l: [[0.15, 0.72, 0]], fov: [32] }] });
    return { scene, camera: cam, fx, update(lt, t) { cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt; const p = L.toScreen(cam, 0.15, 1.33, 0);
        const q = L.toScreen(cam, 0.15, 0.62, -0.1); plateText(o, 'COLD AIR', q[0], q[1] - 18, { size: 16, border: '#9cd8ff', fg: '#dff4ff' });
        popLabel(o, t, tI, 'ICEBOX', 135, Math.max(40, p[1] - 26), 24, null);
      } };
  } });

  // ===== 13. "Operator Mike asks: Why not just make cold?"  COMMENT (style frame C)
  S.push({ at: [6, 'Operator'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.mailSet(scene);
    const ch = hero(scene, { p: [0, 0, 0.75], ry: -0.1 });
    const lt0 = L.holdIn(ch, L.letter(), 'R', [0, 1.4, 0.6], [0.2, 0, Math.PI / 2]); lt0.scale.multiplyScalar(1.5);
    const tM = ws(6, 'Mike'); cue(t0 + 0.15, 'mailbox_creak'); cue(t0 + 0.4, 'paper'); cue(tM, 'comment_pop');
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 9 });
    const fx = new FX(LW, LH).add('sparkle', { world: [-0.72, 1.15, 0.45], t0, dur: 9, n: 3, radius: 10, seed: 3 })
      .add('question', { obj: ch.root, bone: 'Head', offset: [-0.12, 0.42, 0], t0: ws(6, 'cold'), dur: 9, scale: 0.8 });
    const cam = camera({ p: [[-0.3, 1.3, 6.0], [-0.3, 1.3, 5.6]], l: [[-0.3, 1.12, 0.4]], fov: [33] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('phone_look', t0 - 0.45)], [[-99, 'surprised', 'talkO']]); sf(t); L.upright(lt0, 0); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tM) L.commentSticker(o, t - tM, {}); } };
  } });

  // ===== 14. "Mike... you can't make cold. You can only steal heat."  close-up, smug wink; punch-in on "You"
  S.push({ at: [6, 'Mike', 2], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); L.mailSet(scene);
    const ch = hero(scene, { p: [0, 0, 0.75], ry: -0.1 });
    const tC = ws(6, "can't"), tY = ws(6, 'You', 2), tS = ws(6, 'steal');
    const segs = [seg('idle', -99, { loop: true }), seg('smug', tS - 0.37, { fade: 0.1 })];
    const plan = [[-99, 'open', 'neutral'], [tC, 'half', 'frown'], [tY, 'open', 'smile'], [tS, 'wink', 'cat']];
    cue(tS + 0.15, 'wink_ting');
    const fx = new FX(LW, LH).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.12, 0.12, 0.15], t0: tS + 0.1, dur: 1.4, n: 3, radius: 9 });
    const cam = camera({ p: [[0.2, 1.5, 3.0], [0.19, 1.5, 2.9]], l: [[0.02, 1.27, 0.75]], fov: [24], jumps: [{ t: tY, p: [[0.18, 1.5, 2.55], [0.17, 1.5, 2.48]], l: [[0.02, 1.3, 0.75]], fov: [22] }] });
    cue(tY, 'punch');
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); cam.go(t, t0, t1); } };
  } });

  // ===== 15. "When a liquid evaporates... it steals heat from everything around it."  scanner void + molecule lens
  S.push({ at: [7, 'When'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); labSet(scene);
    const d = L.mesh(new THREE.SphereGeometry(0.35, 10, 6), L.basic(null, 0x6cc4ff), 0.35, 0.18, 0, scene); d.scale.y = 0.5;
    const ch = hero(scene, { p: [-0.5, 0, 0.2], ry: 0.5 });
    const tE = ws(7, 'evaporates'), tSt = ws(7, 'steals');
    const segs = [seg('idle', -99, { loop: true }), seg('think', t0 - 0.1)];
    const plan = [[-99, 'half', 'frown'], [tSt, 'surprised', 'talkO']];
    cue(t0 + 0.2, 'bubble_soft'); cue(tE, 'whoosh_up'); cue(tSt, 'heat_suck');
    const fx = new FX(LW, LH).add('steam', { world: [0.35, 0.3, 0], t0: tE, dur: 9, every: 0.22 })
      .add('arrow', { world: [0.95, 0.35, 0.1], t0: tSt, dur: 9, angle: Math.PI, len: 18, color: '#ff8a2a', light: '#ffd080', edge: '#5a1800', seed: 3 })
      .add('arrow', { world: [-0.15, 0.35, 0.3], t0: tSt + 0.1, dur: 9, angle: 0, len: 14, color: '#ff8a2a', light: '#ffd080', edge: '#5a1800', seed: 4 });
    const cam = camera({ p: [[0.3, 1.3, 5.3], [-0.3, 1.3, 5.25]], l: [[0.0, 0.75, 0]], fov: [34] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {   // magnifier: liquid molecules, the fast ones escape and carry heat away
        const t = t0 + lt, c = o.tctx, X = 178, Y = 92, R = 44, q = Math.floor(t * 15) / 15;
        c.fillStyle = '#040412'; c.beginPath(); c.arc(X, Y, R + 4, 0, 7); c.fill(); c.fillStyle = '#d8e4ee'; c.beginPath(); c.arc(X, Y, R + 2, 0, 7); c.fill();
        c.fillStyle = '#16305e'; c.beginPath(); c.arc(X, Y, R, 0, 7); c.fill();
        c.save(); c.beginPath(); c.arc(X, Y, R - 1, 0, 7); c.clip();   // v2: the liquid stays inside the lens
        c.fillStyle = '#3a78d8'; c.fillRect(X - R, Y + 6, 2 * R, R); c.fillStyle = '#6aa8f8'; c.fillRect(X - R, Y + 6, 2 * R, 2); c.restore();
        const P = L.toScreen(cam, 0.35, 0.22, 0); c.fillStyle = '#d8e4ee'; c.fillRect(Math.round((X + P[0]) / 2) - 1, Math.round((Y + R + P[1]) / 2) - 1, 3, 3);
        for (let i = 0; i < 16; i++) {
          const fast = i % 4 === 0, ph = hash(i) * 6.28;
          let x = X - R + 10 + (i * 11) % (2 * R - 20), y = Y + 12 + (i * 7) % (R - 22);
          x += Math.sin(q * (fast ? 9 : 4) + ph) * 4; y += Math.cos(q * (fast ? 8 : 3) + ph) * 3;
          if (fast && t > tE) { const k = ((q - tE) * 0.9 + hash(i + 3)) % 1; y -= k * (R + 10); x += Math.sin(i) * k * 12; }
          const dd = Math.hypot(x - X, y - Y); if (dd > R - 3) continue;
          c.fillStyle = fast && t > tE ? '#ff8a2a' : '#9cd8ff'; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
          c.fillStyle = '#ffffff'; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 1, 1);
        }
        if (t > tE) plateText(o, 'FAST = HOT', X, Y - R - 16, { size: 14, border: '#ff9a5a', fg: '#ffd0a8' });
      } };
  } });

  // ===== 16. "That's why you shiver after a shower."  the ruined bathroom, she shivers
  S.push({ at: [7, "That's"], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const { head } = bathroom(scene);
    const ch = hero(scene, { p: [0.15, 0, 0.1], ry: 0.15 });
    const tSh = ws(7, 'shiver'); cue(t0 + 0.1, 'shower_drip'); cue(tSh, 'teeth_chatter');
    const fx = new FX(LW, LH).add('drip', { world: [head.x, head.y - 0.06, head.z], t0, dur: 9, every: 0.5 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.13, 0.2, 0.06], t0: t0 + 0.2, dur: 1.4 })
      .add('snow', { obj: ch.root, bone: 'Chest', offset: [0, 0.1, 0.1], t0: tSh, dur: 9, n: 8, width: 70, height: 70 })
      .add('wind', { obj: ch.root, bone: 'Chest', offset: [0, 0.0, 0.1], t0: tSh, dur: 9, n: 3, width: 60 })
      .add('shake', { obj: ch.root, bone: 'Chest', offset: [0, -0.05, 0.05], t0: t0 + 0.1, dur: 9, width: 44, height: 44, color: '#9cd8ff', scale: 1.5 })
      .add('steam', { obj: ch.root, bone: 'Head', offset: [0.03, -0.02, 0.2], t0: t0 + 0.15, dur: 9, every: 0.4, life: 0.8, rise: 14, drift: 8, color: '#e8f8ff', edge: '#9cc8e8' })
      .add('sparkle', { obj: ch.root, bone: 'Chest', offset: [0, 0.1, 0.1], t0: t0 + 0.1, dur: 9, n: 6, radius: 34, color: '#bff4ff' });
    const c0 = [0.35, 1.25, 3.5];
    const cam = camera({ p: [c0, [0.35, 1.25, 3.3]], l: [[0.2, 0.98, 0]], fov: [34], jumps: [{ t: tSh, p: [[0.3, 1.25, 2.75], [0.3, 1.25, 2.65]], l: [[0.18, 1.05, 0]], fov: [34] }] });
    cue(tSh, 'punch');
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('shiver', -99, { loop: true })], [[-99, 'shocked', 'bigShock']]); cam.go(t, t0, t1); } };
  } });

  // ===== 17. "So they filled a pipe with a special liquid..."  she presents a coil that fills with glowing blue
  S.push({ at: [8, 'So'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.kitchenSet(scene);
    const pts = [[-0.1, 1.15, 0.0], [0.45, 1.15, 0.0], [0.45, 1.02, 0.02], [-0.1, 1.02, 0.02], [-0.1, 0.89, 0.04], [0.45, 0.89, 0.04], [0.45, 0.76, 0.06], [-0.1, 0.76, 0.06]];
    const curve = new THREE.CatmullRomCurve3(pts.map(V3), false, 'catmullrom', 0.2);
    const geoE = new THREE.TubeGeometry(curve, 80, 0.032, 6), geoF = new THREE.TubeGeometry(curve, 80, 0.036, 6);
    L.mesh(geoE, L.basic(null, 0x8a9098), 0.12, 0, -0.2, scene);
    const fill = L.mesh(geoF, L.basic(L.flowTex(false), 1), 0.12, 0, -0.2, scene);
    const stand = L.box(0.06, 1.2, 0.06, L.basic(null, 0x3a3c44), 0.09, 0.6, -0.3, scene);
    const ch = hero(scene, { p: [-0.6, 0, 0.12], ry: 0.75 });
    const tL = ws(8, 'liquid'); cue(t0 + 0.3, 'liquid_fill');
    const fx = new FX(LW, LH).add('sparkle', { world: [0.32, 0.95, -0.15], t0: tL, dur: 9, n: 4, color: '#9cd8ff' });
    const total = geoF.index.count;
    const cam = camera({ p: [[0.0, 1.15, 5.4], [0.0, 1.1, 5.05]], l: [[0.0, 0.9, 0]], fov: [30] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [seg('present', t0 - 0.2)], [[-99, 'open', 'smileOpen']]);
      const k = Math.min(1, Math.max(0, (Math.floor(t * 15) / 15 - t0 - 0.2) / Math.max(0.5, tL + 0.4 - t0 - 0.2)));
      fill.geometry.setDrawRange(0, Math.floor(total * k / 6) * 6); fill.material.map.offset.y = -Math.floor(t * 15) / 15 * 1.2;
      cam.go(t, t0, t1);
    } };
  } });

  // ===== 18. "that boils at minus twenty-six degrees. This is a refrigerant."  a glass of it boiling on the snow
  S.push({ at: [8, 'boils'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); L.village(scene, { cz: -5, cx: -3.5 });
    const c = L.model('cup', 0.24, 0x9cd8ff); scene.add(c); L.drift(scene, 0, 0, 0.4, 0.06, 0.4);
    const tM = ws(8, 'minus'), tR = ws(8, 'refrigerant'); cue(t0, 'boil'); cue(tM, 'blip'); cue(tR, 'label');
    const fx = new FX(LW, LH).add('bubbles', { world: [0, 0.22, 0], t0, dur: 9, every: 0.07 }).add('steam', { world: [0, 0.27, 0], t0, dur: 9, every: 0.1 })
      .add('sparkle', { world: [0, 0.15, 0], t0: tR, dur: 9, n: 4, radius: 24, color: '#bff4ff' })
      .add('snow', { world: [0, 0.1, 0], t0, dur: 9, n: 5, width: 60, height: 30 });
    const cam = camera({ p: [[0.0, 0.62, 1.75], [0.0, 0.58, 1.55]], l: [[0.0, 0.17, 0]], fov: [30] });
    return { scene, camera: cam, fx, update(lt, t) { cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt;
        if (t >= tM) { const f = Math.floor((t - tM) * 30); const z = Math.round(34 * (f < 3 ? POPL[f] : 1)); bitText(o.tctx, '-26°C', 135, 112, Math.max(1, Math.round(3 * z / 34)), '#9cd8ff'); }
        popLabel(o, t, tR, 'REFRIGERANT', 135, 290, 20, null);
      } };
  } });

  // ===== 19. "Inside, it boils... and steals your food's heat."  inside the fridge section, tilt up food -> evaporator
  S.push({ at: [9, 'Inside'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.kitchenSet(scene); const fr = L.fridgeSection(scene); fr.position.set(0.5, 0, 0);
    const ch = hero(scene, { p: [-0.33, 0, 0.3], ry: 0.25 }); ch.root.visible = false;   // v2: her giant fist in the foreground read as a blob
    const tSt = ws(9, 'steals'); cue(t0 + 0.1, 'bubble_pipe'); cue(tSt, 'heat_suck');
    const fx = new FX(LW, LH).add('bubbles', { world: [0.5, 1.32, -0.06], t0, dur: 9, every: 0.1 })
      .add('arrow', { world: [0.42, 0.88, -0.1], t0: tSt - 0.1, dur: 9, angle: -Math.PI / 2, len: 16, color: '#ff8a2a', light: '#ffd080', edge: '#5a1800', seed: 6 })
      .add('arrow', { world: [0.66, 1.0, -0.1], t0: tSt, dur: 9, angle: -Math.PI / 2, len: 12, color: '#ff8a2a', light: '#ffd080', edge: '#5a1800', seed: 8 })
      .add('heat', { world: [0.38, 0.72, -0.12], t0: t0, dur: 9, lines: 2, rise: 26 });
    const cam = camera({ p: [[0.5, 0.78, 2.5], [0.5, 1.18, 2.5]], l: [[0.5, 0.74, 0], [0.5, 1.16, 0]], fov: [30] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [still('point', 1.0)], [[-99, 'open', 'smileOpen']]); fr.userData.tick(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const e = L.toScreen(cam, 0.5, 1.48, -0.06); plateText(o, 'COLD', e[0], e[1] - 16, { size: 16, border: '#9cd8ff', fg: '#dff4ff' }); } };
  } });

  // ===== 20. "Then a pump squeezes it until it's hot..."  close on the compressor, the pipe turns hot
  S.push({ at: [10, 'Then'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.kitchenSet(scene); const fr = L.fridgeSection(scene); fr.position.set(0.5, 0, 0);
    const comp = fr.userData.comp; const tH = ws(10, 'hot'), tSq = ws(10, 'squeezes');
    // v2: a readable compressor instead of a black blob: shaded steel body (shading baked in a wrap texture), ribs,
    // feet, a warning plate and the two copper stubs (blue suction in, orange discharge out)
    comp.children.forEach((c) => (c.visible = false));
    const shade = L.cvs(32, 4, (c) => { for (let x = 0; x < 32; x++) { const k = 0.5 + 0.5 * Math.cos((x / 32 - 0.15) * 6.283); const v = Math.round(52 + 70 * k); c.fillStyle = `rgb(${v},${v + 4},${v + 14})`; c.fillRect(x, 0, 1, 4); } });
    const steel = L.basic(shade, 1), dark = L.basic(null, 0x23252c);
    L.mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.26, 16), steel, 0, 0.15, 0, comp);
    const dome = L.mesh(new THREE.SphereGeometry(0.13, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0.28, 0, comp);
    for (const y of [0.08, 0.16, 0.24]) { const r = L.mesh(new THREE.TorusGeometry(0.137, 0.007, 4, 16), dark, 0, y, 0, comp); r.rotation.x = Math.PI / 2; }
    for (const [x, z] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]]) L.box(0.05, 0.03, 0.05, dark, x, 0.015, z, comp);
    const plate = L.cvs(16, 10, (c) => { c.fillStyle = '#e8c020'; c.fillRect(0, 0, 16, 10); c.fillStyle = '#141414'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 9, 16, 1); c.fillRect(7, 2, 2, 4); c.fillRect(7, 7, 2, 1); });
    L.plane(0.09, 0.055, L.basic(plate, 1), 0, 0.15, 0.142, comp);
    const stub = (col, x, y, ry) => { const p = L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 6), L.basic(null, col), x, y, 0.03, comp); p.rotation.set(0, 0, ry); return p; };
    stub(0x3c8ce8, -0.16, 0.2, Math.PI / 2); stub(0xe8701c, 0.0, 0.42, 0);
    cue(t0 + 0.05, 'compressor_hum'); cue(tSq, 'piston'); cue(tH, 'zap');
    const cx = 0.5 + fr.userData.xb + 0.14;
    const fx = new FX(LW, LH).add('heat', { world: [cx, 0.45, -0.12], t0: tH - 0.2, dur: 9, lines: 3 })
      .add('zap', { world: [cx, 0.3, -0.05], t0: tSq, dur: 9, n: 3 })
      .add('arrow', { world: [cx - 0.2, 0.2, 0.05], t0: tSq, dur: 9, angle: 0, len: 12, color: '#3c9ce8', seed: 2 });
    const cam = camera({ p: [[cx + 0.15, 0.5, 1.75], [cx + 0.1, 0.48, 1.25]], l: [[cx - 0.05, 0.42, -0.1]], fov: [30] });
    return { scene, camera: cam, fx, update(lt, t) {
      fr.userData.tick(t); const q = Math.floor(t * 15); comp.scale.y = 1 + (q % 2 ? 0.04 : 0); comp.position.x = fr.userData.xb + 0.14 + (q % 2 ? 0.006 : -0.006); cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) {
      const t = t0 + lt, ci = L.toScreen(cam, cx - 0.22, 0.2, -0.09), co = L.toScreen(cam, cx, 0.5, -0.09);
      plateText(o, 'COLD GAS IN', ci[0], Math.min(ci[1] - 44, 300), { size: 14, border: '#7cc0ff', fg: '#dff4ff' });
      if (t >= tSq) { const p = L.toScreen(cam, cx, 0.62, -0.12); plateText(o, 'SQUEEZE!', p[0], Math.max(40, p[1] - 40), { size: 16, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tSq) }); }
      if (t >= tH) plateText(o, 'HOT GAS OUT', co[0] + 40, co[1] - 8, { size: 14, border: '#ff9a5a', fg: '#ffd0a8', scale: popS(t, tH) });
    } };
  } });

  // ===== 21. "and dumps the heat out the back. This is a compressor."  STYLE FRAME D; punch-in + label on "compressor"
  S.push({ at: [10, 'and'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.kitchenSet(scene); const fr = L.fridgeSection(scene); fr.position.set(0.5, 0, 0);
    const ch = hero(scene, { p: [-0.33, 0, 0.3], ry: 0.25 }); const X = (x) => x + 0.5;
    const tC = ws(10, 'compressor'), tB = ws(10, 'back');
    cue(t0 + 0.1, 'heat_whoosh'); cue(tC, 'label'); cue(tC, 'punch');
    const fx = new FX(LW, LH).add('heat', { world: [X(fr.userData.xb + 0.05), 1.25, -0.08], t0, dur: 9, lines: 3, rise: 40, seed: 2 })
      .add('bubbles', { world: [X(0), 1.32, -0.06], t0, dur: 9, every: 0.12, seed: 5 })
      .add('arrow', { world: [X(fr.userData.xb + 0.32), 1.0, -0.08], t0: tB - 0.2, dur: 9, angle: 0, len: 18, color: '#e83c1c', light: '#ffb070', edge: '#4a0800', seed: 9 })
      .add('arrow', { world: [X(fr.userData.xb + 0.32), 0.6, -0.08], t0: tB, dur: 9, angle: 0, len: 14, color: '#e83c1c', light: '#ffb070', edge: '#4a0800', seed: 10 });
    const cam = camera({ p: [[0.32, 1.0, 7.4], [0.32, 1.0, 7.1]], l: [[0.32, 0.98, 0]], fov: [30], jumps: [{ t: tC, p: [[0.55, 0.9, 5.6], [0.55, 0.9, 5.5]], l: [[0.6, 0.88, 0]], fov: [30] }] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('point', t0 - 0.4)], [[-99, 'open', 'smileOpen']]); fr.userData.tick(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt;
        const e = L.toScreen(cam, X(0), 1.48, -0.06); plateText(o, 'COLD', e[0], e[1] - 16, { size: 14, border: '#9cd8ff', fg: '#dff4ff' });
        const h = L.toScreen(cam, X(fr.userData.xb + 0.05), 1.7, -0.06); plateText(o, 'HOT', Math.min(240, h[0] + 16), h[1] - 22, { size: 14, border: '#ff9a5a', fg: '#ffd0a8' });
        const c = L.toScreen(cam, X(fr.userData.xb + 0.14), 0.42, -0.12); popLabel(o, t, tC, 'COMPRESSOR', 150, Math.min(c[1] - 54, 300), 20, [c[0], c[1]]);
      } };
  } });

  // ===== 22. "That's why the back of your fridge is always warm."  she warms her hands at the back of the dug-up fridge
  S.push({ at: [11, "That's"], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const { fr } = digSite(scene, { fridge: 'out' });
    scene.traverse((o) => { if (o.isMesh && o.material && o.material.map === T.sign) o.parent.visible = false; });   // the road sign sat right behind her head
    const ch = hero(scene, { p: [3.4, 0, -1.25], ry: -1.3 });
    const tW = ws(11, 'warm'); cue(t0 + 0.1, 'warm_crackle'); cue(tW, 'happy_sigh');
    const fx = new FX(LW, LH).add('heat', { world: [2.82, 1.0, -1.35], t0, dur: 9, lines: 3, rise: 44 })
      .add('heart', { obj: ch.root, bone: 'Head', offset: [0, 0.32, 0], t0: tW, dur: 9, n: 2 });
    const sf = L.snowfall(scene, { cx: 3, cz: 0, R: 8 });
    const cam = camera({ p: [[3.65, 1.05, 3.2], [3.35, 1.02, 3.15]], l: [[3.08, 0.55, -1.3]], fov: [34] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('warm_hands', -99, { loop: true })], [[-99, 'relaxed', 'cat']]); sf(t); cam.go(t, t0, t1); } };
  } });

  // ===== 23. "So your fridge is a heat thief... running in a loop, forever."  section wide + thief mask gag
  S.push({ at: [12, 'So'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.kitchenSet(scene); const fr = L.fridgeSection(scene); fr.position.set(0.5, 0, 0);
    const ch = hero(scene, { p: [-0.36, 0, 0.3], ry: 0.25 }); const X = (x) => x + 0.5;
    const tT = ws(12, 'thief'), tL = ws(12, 'loop'); cue(tT, 'label'); cue(tT - 0.05, 'sneaky'); cue(tL, 'loop_whoosh');
    const fx = new FX(LW, LH).add('heat', { world: [X(fr.userData.xb + 0.05), 1.25, -0.08], t0, dur: 9, lines: 3, rise: 40, seed: 2 })
      .add('bubbles', { world: [X(0), 1.32, -0.06], t0, dur: 9, every: 0.12, seed: 5 })
      .add('sparkle', { world: [X(-0.1), 1.62, 0], t0: tT, dur: 2, n: 4 });
    // arrows chasing round the loop
    const loopPts = [[X(0.2), 1.4, -0.05], [X(fr.userData.xb), 1.0, -0.05], [X(fr.userData.xb + 0.14), 0.32, -0.05], [X(fr.userData.xb + 0.05), 1.6, -0.05]];
    loopPts.forEach((p, i) => fx.add('arrow', { world: p, t0: tL + i * 0.1, dur: 9, angle: [0, Math.PI / 2, -Math.PI / 2, Math.PI][i], len: 12, color: i % 3 ? '#e83c1c' : '#3c9ce8', light: i % 3 ? '#ffb070' : '#9cc8ff', edge: '#0c0c30', seed: 20 + i }));
    const cam = camera({ p: [[-0.6, 1.0, 6.9], [1.0, 1.0, 6.9]], l: [[0.32, 0.98, 0]], fov: [30] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('smug', t0 - 0.2)], [[-99, 'relaxed', 'cat'], [tT, 'wink', 'cat']]); fr.userData.tick(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt, c = o.tctx;
        if (t >= tT) {   // burglar mask across the top of the fridge
          const a1 = L.toScreen(cam, X(-0.39), 1.4, 0.0), a2 = L.toScreen(cam, X(0.39), 1.4, 0.0);
          const y = a1[1], h = 14; c.fillStyle = '#040412'; c.fillRect(a1[0] - 6, y - h / 2, a2[0] - a1[0] + 12, h);
          c.fillRect(a2[0] + 4, y - 2, 10, 3); c.fillRect(a2[0] + 10, y + 1, 4, 8);
          c.fillStyle = '#ffffff'; const mx = (a1[0] + a2[0]) / 2; c.fillRect(Math.round(mx - 14), y - 3, 9, 5); c.fillRect(Math.round(mx + 5), y - 3, 9, 5);
          c.fillStyle = '#040412'; c.fillRect(Math.round(mx - 10), y - 2, 3, 3); c.fillRect(Math.round(mx + 9), y - 2, 3, 3);
        }
        const k = L.toScreen(cam, X(0.1), 1.62, 0); popLabel(o, t, tT, 'HEAT THIEF', 135, Math.max(40, k[1] - 50), 22, [k[0], k[1] - 4]);
      } };
  } });

  // ===== 24. "Humans built a machine... just to rob their own leftovers."  shrug with the leftovers box
  S.push({ at: [13, 'Humans'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); digSite(scene);
    const ch = hero(scene, { p: [-0.35, 0, 0.75], ry: 0.25 });
    // v2: the leftovers are a plate with a half-eaten drumstick and peas, carried flat on her left fist (world-driven, never tilted)
    const plate = new THREE.Group(); scene.add(plate);
    L.mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.025, 16), L.basic(null, 0xf6f4ec), 0, 0, 0, plate);
    const rim = L.mesh(new THREE.TorusGeometry(0.16, 0.012, 4, 18), L.basic(null, 0x3a78d8), 0, 0.012, 0, plate); rim.rotation.x = Math.PI / 2;
    const dm = L.meat(); dm.scale.setScalar(0.9); dm.position.set(-0.04, 0.055, 0.02); dm.rotation.set(0, 0.6, 0.15); plate.add(dm);
    L.mesh(new THREE.SphereGeometry(0.04, 6, 4), L.basic(null, 0xf2ead8), 0.07, 0.04, -0.04, plate);   // bitten end
    for (const [x, z] of [[0.07, 0.07], [0.1, 0.03], [0.04, 0.1]]) L.mesh(new THREE.SphereGeometry(0.018, 6, 4), L.basic(null, 0x6ab04a), x, 0.03, z, plate);
    const fp = new THREE.Vector3();
    const tR = ws(13, 'rob'), tLf = ws(13, 'leftovers'); cue(tR - 0.2, 'shrug_boing'); cue(tLf, 'question_pop');
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.18, 0.4, 0], t0: tLf, dur: 9, scale: 0.9 })
      .add('stink', { target: plate, offset: [0, 0.08, 0], t0: tR, dur: 9, lines: 2, len: 20, color: '#c8e070' });
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 8 });
    const cam = camera({ p: [[0.55, 1.4, 4.7], [0.5, 1.38, 4.3]], l: [[0.0, 1.0, 0.4]], fov: [30] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [seg('idle', -99, { loop: true }), seg('shrug', tR - 0.35, { fade: 0.1 })], [[-99, 'half', 'frown'], [tR, 'relaxed', 'cat']]); scene.updateMatrixWorld(true);
      ch.hand('L').localToWorld(fp.set(0, 0.8, 0)); plate.position.copy(fp).add(V3([0, 0.07, 0])); plate.rotation.set(0, 0.25, 0);
      sf(t); cam.go(t, t0, t1);
    } };
  } });

  // ===== 25. "Artifact understood. Logging off."  wide, wave, crane up, CRT off + end card
  S.push({ at: [14, 'Artifact'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); digSite(scene);
    const ch = hero(scene, { p: [-0.4, 0, 0.9], ry: 0.25 });
    const tLo = ws(14, 'Logging'), tEnd = TL.dur, tOut = tEnd + 0.05;
    cue(tLo, 'blip'); cue(tOut + 0.05, 'end_jingle'); cue(tOut + 0.55, 'follow_pop');
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 10 });
    const fx = new FX(LW, LH).add('sparkle', { world: [0.6, 0.6, -0.6], t0, dur: 9, n: 3 });
    const cam = camera({ p: [[-0.5, 2.0, 6.6], [-0.7, 2.9, 7.6]], l: [[0.05, 0.9, -0.5], [0.05, 0.8, -0.6]], fov: [36] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('idle', -99, { loop: true }), seg('wave', t0 + 0.05, { fade: 0.1 }), seg('wave', tOut + 0.1, { fade: 0.1 })], [[-99, 'happy', 'smileOpen'], [tLo + 0.3, 'happy', 'smile']]); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {   // v2: no black screen: the outro (channel + follow CTA) sits over her goodbye shot
        const t = t0 + lt, c = o.tctx;
        if (t >= tLo && t < tOut + 0.3) { const n = Math.min(14, Math.floor((t - tLo) * 20)); if (n > 0) plateText(o, 'LOGGING OFF...'.slice(0, n), 135, 52, { size: 14, border: '#7cf0ff', fg: '#c8f8ff' }); }
        if (t >= tOut) {
          const s1 = popS(t, tOut);
          bitText(c, CHANNEL, 135, 100, Math.max(1, Math.round(3 * s1)), '#fdd941');
          if (t >= tOut + 0.25) plateText(o, 'ARTIFACT 001', 135, 128, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tOut + 0.25) });
          if (t >= tOut + 0.5) {   // follow button: TikTok red pill, pulsing
            const s3 = popS(t, tOut + 0.5) * (1 + 0.04 * Math.sin((t - tOut) * 9)), w = Math.round(218 * s3), h = Math.round(26 * s3), X = 135 - w / 2, Y = 352 - h / 2;
            c.fillStyle = '#040412'; c.fillRect(Math.round(X) - 2, Math.round(Y) - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(Math.round(X), Math.round(Y), w, h);
            c.fillStyle = '#ff7a92'; c.fillRect(Math.round(X), Math.round(Y), w, 2);
            bitText(c, 'FOLLOW ' + HANDLE, 135, 352, 2, '#ffffff', { outline: null });
          }
        }
      } };
  } });

  // ---------- timeline: shot starts from the voice ----------
  const starts = S.map((s, i) => {
    const idx = wi(s.at[0], s.at[1], s.at[2] || 1), w = W[idx];
    if (i === 0) return 0;
    if (s.mode === 'C') return Math.max(0, w[1] - 0.02);
    const prevEnd = W[idx - 1][2]; return Math.min(w[1] - 0.06, Math.max(prevEnd + 0.02, (prevEnd + w[1]) / 2));
  });
  S.forEach((s, i) => {
    const t0 = starts[i], t1 = i + 1 < S.length ? starts[i + 1] : END;
    const b = s.make(t0, t1);
    if (s.mode === 'C' && i > 0) cue(t0, 'cut');
    SHOTS.push({ t0, hard: s.mode === 'C', ...b, update: (lt, t) => b.update(lt, t ?? t0 + lt), name: `#${i + 1}` });
    if (s.mode === 'M' && i > 0) cue(t0, 'mosaic');
  });
  window.FILM = { dur: END, fps: 30, frames: Math.ceil(END * 30), shots: SHOTS.map((s) => [s.name, +s.t0.toFixed(3), s.hard]) };
  window.WORDS_OVERRIDE = W.map(([c, s, e]) => [s, e, c]);
}
