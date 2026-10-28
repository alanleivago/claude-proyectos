import { bitText } from './pixfont.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
// film.js — "Digger 02: the toilet", full video (index.html?v=megagirl).
// Engine, helpers and village set from digger-01-fridge/engine/film.js; new sets: outhouse (+ ground cutaway over the pit),
// night village, bedroom + chamber pot, street facade with a real window, Harington's flush toilet with cistern + pull
// chain, house/sewer section, workshop (S bend), S-trap diagram, the dug-up modern toilet (Quaternius CC0).
// Shot: { t0, hard, scene, camera, update(lt, t), fx, overlay }. Times are GLOBAL seconds unless named lt.
export const CHANNEL = 'MECHAYUKI', HANDLE = '@mechayuki';
export const TAIL = 2.6;           // after the last word: the outro over her goodbye shot
export const ARTIFACT = 'ARTIFACT 002';

export function buildFilm({ SHOTS, TL, lib: L }) {
  const { THREE, FX, LW, LH, T, M } = L;
  const W = TL.words;
  const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  function wi(p, text, occ = 1) { let n = 0; for (let i = 0; i < W.length; i++) if (W[i][3] === p && nrm(W[i][4]) === nrm(text) && ++n === occ) return i; throw new Error(`word ${p} ${text} ${occ}`); }
  const ws = (p, t, o) => W[wi(p, t, o)][1], we = (p, t, o) => W[wi(p, t, o)][2];
  const END = TL.dur + TAIL;
  const CUES = (window.CUES = []);
  const cue = (t, kind, extra = {}) => CUES.push({ t: +t.toFixed(3), kind, ...extra });
  const V3 = (a) => new THREE.Vector3(...a);
  const hash = (k) => { let h = Math.imul(k * 2654435761, 1597334677); h ^= h >>> 15; return ((h >>> 0) % 10000) / 10000; };
  const q15 = (t) => Math.floor(t * 15 + 1e-6) / 15;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const BROWN = 0x6b4423, BROWN2 = 0x8a5a30, GAS = 0x8ad04a;
  window.__fx.renderer.localClippingEnabled = true;
  const OAK = L.cvs(16, 16, (c) => { c.fillStyle = '#b07a48'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#8a5a30'; for (let y = 0; y < 16; y += 4) c.fillRect(0, y, 16, 1); c.fillStyle = '#c8935a'; for (let y = 1; y < 16; y += 4) c.fillRect((y * 5) % 16, y, 5, 1); c.fillStyle = '#7a4a24'; c.fillRect(6, 2, 1, 1); c.fillRect(12, 10, 1, 1); });

  // ---------- character ----------
  const BLINKABLE = new Set(['open', 'half', 'surprised', 'angry', 'sad']);
  function blinkEyes(t, eyes) {
    if (!BLINKABLE.has(eyes)) return eyes;
    for (let k = 0; k < 40; k++) { const b = 1.1 + k * 3.4 + hash(k + 7) * 1.1, d = t - b; if (d >= 0 && d < 0.2) return ['half', 'blink', 'half'][Math.floor(d * 15)]; }
    return eyes;
  }
  const mouthAt = (t) => TL.mouth[Math.floor(t * 15 + 1e-6)] || '-';
  function hero(scene, { p = [0, 0, 0], ry = 0, scale = 1 } = {}) {
    const ch = L.zero(); ch.root.position.set(...p); ch.root.rotation.y = ry; ch.root.scale.setScalar(scale); scene.add(ch.root);
    ch.drive = (t, segs, plan, talk = true) => {
      ch.pose(t, segs, [[-99, 'open', 'neutral']]);
      const q = Math.floor(t * 15 + 1e-6) / 15;
      let f = plan[0]; for (const x of plan) if (x[0] <= q + 1e-6) f = x;
      const m = talk && f[3] !== false ? mouthAt(t) : '-';
      L.setFace(ch.bone, { eyes: blinkEyes(q, f[1]), mouth: m === 'A' ? 'talkA' : m === 'O' ? 'talkO' : f[2] });
    };
    ch.fist = (side, v = new THREE.Vector3()) => ch.hand(side).localToWorld(v.set(0, 0.8, 0));
    return ch;
  }
  const seg = (clip, at, o = {}) => ({ clip, at, ...o });
  const still = (clip, x) => seg(clip, -99, { from: x, speed: 0 });
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
  // CC model normalised to a height / longest side; lit = soft Lambert (porcelain needs shading to read)
  function cc(name, size, { axis = 'max', tint = null, lit = false } = {}) {
    const g = M['cc_' + name].clone(true);
    g.traverse((o) => {
      if (!o.isMesh) return;
      const conv = (m) => {
        const c = tint ?? (m.map ? 0xffffff : m.color.getHex());
        return lit ? L.lam(m.map ? L.nearest(m.map) : null, c, { side: THREE.DoubleSide }) : L.basic(m.map ? L.nearest(m.map) : null, c, { side: THREE.DoubleSide, alphaTest: 0.5 });
      };
      o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
    });
    const bb = new THREE.Box3().setFromObject(g), sz = bb.getSize(new THREE.Vector3());
    g.scale.setScalar(size / (axis === 'max' ? Math.max(sz.x, sz.y, sz.z) : sz[axis]));
    const bb2 = new THREE.Box3().setFromObject(g), c = bb2.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -bb2.min.y, -c.z);
    const w = new THREE.Group(); w.add(g); return w;
  }

  // ---------- camera ----------
  function camera(spec) {
    const cam = new THREE.PerspectiveCamera(spec.fov?.[0] ?? 36, 9 / 16, 0.05, 400);
    cam.go = (t, t0, t1) => {
      let s = spec; for (const j of spec.jumps || []) if (t >= j.t) s = { ...spec, ...j };
      const a = s.t0 ?? t0, b = s.t1 ?? t1, k = (t - a) / Math.max(0.1, b - a);
      const P = s.p.length > 1 ? V3(s.p[0]).lerp(V3(s.p[1]), k) : V3(s.p[0]);
      const Lk = s.l.length > 1 ? V3(s.l[0]).lerp(V3(s.l[1]), k) : V3(s.l[0]);
      for (const sh of [s.shake, s.shake2]) if (sh && t >= sh[0] && t < sh[0] + sh[1]) { const f = Math.floor(t * 30); P.x += (hash(f) - 0.5) * sh[2]; P.y += (hash(f + 9) - 0.5) * sh[2]; }
      cam.position.copy(P); cam.lookAt(Lk);
      const fv = s.fov ? (s.fov.length > 1 ? s.fov[0] + (s.fov[1] - s.fov[0]) * clamp01(k) : s.fov[0]) : 36;
      if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); }
    };
    return cam;
  }

  // ---------- overlays ----------
  const POPL = [0.55, 1.18, 0.96];
  function popLabel(o, t, tw, text, x, y, size, tip) {
    if (t < tw) return; const f = Math.floor((t - tw) * 30); const s = f < 3 ? POPL[f] : 1;
    const sc = Math.max(1, Math.round(2 * s)), c = o.tctx, w = text.length * 6 * sc;
    x = Math.min(LW - w / 2 - 4, Math.max(w / 2 + 4, x));
    if (tip && f >= 1) {
      c.strokeStyle = '#040412'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 9); c.lineTo(tip[0], tip[1]); c.stroke();
      c.strokeStyle = '#fdd941'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 9); c.lineTo(tip[0], tip[1]); c.stroke();
      c.fillStyle = '#040412'; c.fillRect(tip[0] - 2, tip[1] - 2, 5, 5); c.fillStyle = '#fdd941'; c.fillRect(tip[0] - 1, tip[1] - 1, 3, 3);
    }
    bitText(c, text, x, y, sc, '#fdd941');
  }
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
  function sky(o, kind, x, y, lt) {   // pixel sun (morning) / moon (night) drawn on the overlay canvas
    const c = o.tctx;
    if (kind === 'moon') {
      c.fillStyle = '#040412'; c.beginPath(); c.arc(x, y, 13, 0, 7); c.fill(); c.fillStyle = '#f4f0d0'; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill();
      c.fillStyle = '#c8c4a8'; c.fillRect(x - 4, y - 3, 3, 3); c.fillRect(x + 3, y + 2, 2, 2);
      c.fillStyle = '#ffffff'; for (const [sx, sy] of [[-60, 10], [-90, 40], [40, 30], [-30, -20], [70, 60]]) if ((Math.floor(lt * 3) + sx) % 3) c.fillRect(x + sx, y + sy, 1, 1);
      return;
    }
    const f = Math.floor(lt * 4) % 2;
    c.fillStyle = '#040412'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill();
    c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(x, y, 13, 0, 7); c.fill(); c.fillStyle = '#fff2a0'; c.fillRect(x - 6, y - 7, 5, 4);
    c.fillStyle = '#ffd23a'; for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + f * 0.39; c.fillRect(Math.round(x + Math.cos(an) * 18) - 1, Math.round(y + Math.sin(an) * 18) - 1, 3, 3); c.fillRect(Math.round(x + Math.cos(an) * 24) - 1, Math.round(y + Math.sin(an) * 24) - 1, 2, 2); }
  }
  function sticker(o, lt, { user, lines, x = 135, y = 100 }) {   // TikTok "reply to comment" sticker, 2 lines
    const c = o.tctx, f = Math.floor(lt * 30), s = f < 3 ? [0.6, 1.08, 0.97][f] : 1;
    const Wd = Math.round(236 * s), H = Math.round(70 * s), X = Math.round(x - Wd / 2), Y = Math.round(y - H / 2);
    const rr = (x0, y0, w, h, r) => { c.beginPath(); c.moveTo(x0 + r, y0); c.lineTo(x0 + w - r, y0); c.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r); c.lineTo(x0 + w, y0 + h - r); c.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h); c.lineTo(x0 + r, y0 + h); c.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r); c.lineTo(x0, y0 + r); c.quadraticCurveTo(x0, y0, x0 + r, y0); c.closePath(); };
    c.fillStyle = '#040412'; rr(X - 1, Y - 1, Wd + 2, H + 3, 7); c.fill(); c.fillStyle = '#fdfdfd'; rr(X, Y, Wd, H, 6); c.fill();
    if (s < 0.9) return;
    c.fillStyle = '#3b8cff'; c.beginPath(); c.arc(X + 15, Y + 15, 9, 0, 7); c.fill();
    c.fillStyle = '#fdfdfd'; c.fillRect(X + 11, Y + 11, 3, 3); c.fillRect(X + 17, Y + 11, 3, 3); c.fillRect(X + 12, Y + 18, 7, 2);
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = '700 10px Pixelify'; c.fillStyle = '#8a8a96'; c.fillText(`Reply to ${user}'s comment`, X + 29, Y + 15);
    c.font = '700 14px Pixelify'; c.fillStyle = '#141418'; lines.forEach((ln, i) => c.fillText(ln, X + 10, Y + 37 + i * 17));
  }

  // ---------- grading (night / morning / green stink haze) ----------
  function grade(root, rgb, { skip = null, lit = false } = {}) {
    const k = new THREE.Color(...rgb);
    root.traverse((o) => {
      if (skip && skip(o)) return;
      if (!o.isMesh && !o.isPoints) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.userData.graded) return; m.userData.graded = true;
        if (lit && m.map === T.win) { m.map = T.winLit; m.color.set(0xffffff); return; }
        if (m.color) m.color.multiply(k);
      });
    });
  }
  const isHero = (ch) => (o) => { let p = o; while (p) { if (p === ch.root) return true; p = p.parent; } return false; };

  // ---------- props ----------
  function chamberPot({ lid = false, full = false } = {}) {   // white enamel pot, blue rim, side handle; origin at the base
    const g = new THREE.Group();
    const prof = [[0.0, 0.0], [0.085, 0.0], [0.11, 0.025], [0.13, 0.07], [0.125, 0.12], [0.105, 0.15], [0.11, 0.168], [0.135, 0.178], [0.128, 0.19]].map(([r, y]) => new THREE.Vector2(r, y));
    L.mesh(new THREE.LatheGeometry(prof, 12), L.lam(null, 0xf2eee4, { side: THREE.DoubleSide }), 0, 0, 0, g);
    const rim = L.mesh(new THREE.TorusGeometry(0.132, 0.01, 4, 14), L.basic(null, 0x2a5aa8), 0, 0.185, 0, g); rim.rotation.x = Math.PI / 2;
    const h = L.mesh(new THREE.TorusGeometry(0.045, 0.013, 4, 10, Math.PI * 1.3), L.lam(null, 0xf2eee4), 0.135, 0.1, 0, g); h.rotation.set(0, 0, -Math.PI * 0.65);
    const stuff = L.mesh(new THREE.CircleGeometry(0.105, 10), L.basic(null, BROWN), 0, 0.145, 0, g); stuff.rotation.x = -Math.PI / 2; stuff.visible = full;
    const pp = poop(0.75); pp.position.set(0, 0.1, 0.01); g.add(pp); pp.visible = full;
    const lidG = new THREE.Group(); lidG.position.set(-0.13, 0.19, 0); g.add(lidG);
    L.mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.014, 14), L.lam(null, 0xf2eee4), 0.13, 0.007, 0, lidG);
    L.mesh(new THREE.SphereGeometry(0.022, 6, 4), L.basic(null, 0x2a5aa8), 0.13, 0.025, 0, lidG); lidG.visible = lid;
    g.userData = { stuff, lid: lidG, poop: pp }; return g;
  }
  function modernToilet({ lidUp = true } = {}) {   // white porcelain toilet in code: pedestal, open bowl with water, seat, lid, tank
    const g = new THREE.Group(), por = L.lam(null, 0xf6f4ee, { side: THREE.DoubleSide }), por2 = L.lam(null, 0xe8e6e0);
    const ped = L.mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.24, 10), por, 0, 0.12, 0.05, g); ped.scale.z = 1.25;
    const bowl = L.mesh(new THREE.LatheGeometry([[0.05, 0], [0.13, 0.05], [0.185, 0.12], [0.2, 0.17], [0.19, 0.175]].map(([r, y]) => new THREE.Vector2(r, y)), 14), por, 0, 0.23, 0.08, g); bowl.scale.z = 1.3;
    const water = L.mesh(new THREE.CircleGeometry(0.135, 14), L.basic(null, 0x3c9ce8), 0, 0.33, 0.08, g); water.rotation.x = -Math.PI / 2; water.scale.y = 1.3;
    const shine = L.mesh(new THREE.CircleGeometry(0.03, 6), L.basic(null, 0xbfe8ff), -0.04, 0.332, 0.04, g); shine.rotation.x = -Math.PI / 2;
    const seat = L.mesh(new THREE.TorusGeometry(0.17, 0.028, 4, 16), por2, 0, 0.41, 0.08, g); seat.rotation.x = Math.PI / 2; seat.scale.y = 1.3;
    const lid = L.mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.025, 14), por2, 0, lidUp ? 0.62 : 0.43, lidUp ? -0.1 : 0.08, g); lid.scale.z = 1.25; if (lidUp) lid.rotation.x = -1.45;
    L.box(0.44, 0.36, 0.17, por, 0, 0.6, -0.2, g); L.box(0.47, 0.04, 0.2, por2, 0, 0.8, -0.2, g);
    L.box(0.06, 0.02, 0.03, L.basic(null, 0xb8bcc4), -0.16, 0.73, -0.1, g);
    g.userData = { water, waterY: 0.33, bowlZ: 0.08 }; return g;
  }
  function poop(sc = 1, face = true) {   // v2 (user): the anime / emoji swirl poop: 3 stacked coils + tip, cute face
    const g = new THREE.Group(), br = L.lam(null, 0x8a5226), br2 = L.lam(null, 0xa86a32);
    const base = L.mesh(new THREE.SphereGeometry(0.075, 10, 6), br, 0, 0.04, 0, g); base.scale.y = 0.6;
    for (const [r, tb, y, m] of [[0.075, 0.036, 0.036, br], [0.054, 0.031, 0.086, br2], [0.033, 0.026, 0.128, br]]) { const o = L.mesh(new THREE.TorusGeometry(r, tb, 6, 14), m, 0, y, 0, g); o.rotation.x = Math.PI / 2; }
    const tip = L.mesh(new THREE.ConeGeometry(0.03, 0.065, 8), br2, 0.008, 0.172, 0, g); tip.rotation.z = -0.35;
    if (face) {
      for (const sx of [-1, 1]) { L.mesh(new THREE.SphereGeometry(0.016, 6, 4), L.basic(null, 0xffffff), sx * 0.026, 0.092, 0.08, g); L.mesh(new THREE.SphereGeometry(0.008, 5, 3), L.basic(null, 0x141414), sx * 0.026, 0.092, 0.094, g); }
      const sm = L.mesh(new THREE.TorusGeometry(0.016, 0.004, 3, 8, Math.PI), L.basic(null, 0x2a1206), 0, 0.064, 0.104, g); sm.rotation.z = Math.PI;
    }
    g.scale.setScalar(sc); return g;
  }
  function blob(r = 0.06, col = BROWN) { const o = L.mesh(new THREE.IcosahedronGeometry(r, 0), L.basic(null, col), 0, 0, 0, null); o.scale.y = 0.75; return o; }
  function doorMoonTex() {
    return L.cvs(20, 40, (c) => {
      c.fillStyle = '#7a5434'; c.fillRect(0, 0, 20, 40); c.fillStyle = '#5a3c22'; for (let x = 4; x < 20; x += 5) c.fillRect(x, 0, 1, 40);
      c.fillStyle = '#4a301a'; c.fillRect(1, 9, 18, 2); c.fillRect(1, 30, 18, 2); c.fillStyle = '#c8a050'; c.fillRect(16, 20, 2, 3);
      c.fillStyle = '#140c06'; c.beginPath(); c.arc(10, 5, 3.6, 0, 7); c.fill(); c.fillStyle = '#7a5434'; c.beginPath(); c.arc(11.8, 4.2, 3.0, 0, 7); c.fill();
      c.fillStyle = '#ffffff'; c.fillRect(0, 38, 20, 2);
    });
  }
  // the outhouse: plank shed with a slanted roof (snow on top), crescent-moon door, a seat bench with a hole inside.
  // parts are returned in build order (for the pop-in build in shot 6); front:false leaves the front open (cutaway).
  function outhouse(parent, { x = 0, z = 0, ry = 0, front = true, door = 0 } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
    const Wd = 1.1, D = 1.1, Hf = 2.25, Hb = 1.95, wood = L.basic(L.rep(T.planks, 0.5, 1.0), 1.75, { side: THREE.DoubleSide });
    const parts = [];
    const seat = new THREE.Group(); g.add(seat);
    L.box(Wd - 0.06, 0.5, 0.45, L.basic(L.rep(T.planks, 0.5, 0.25), 2.0), 0, 0.25, -D / 2 + 0.25, seat);
    const hole = L.mesh(new THREE.CircleGeometry(0.12, 10), L.basic(null, 0x120a04), 0, 0.502, -D / 2 + 0.25, seat); hole.rotation.x = -Math.PI / 2;
    parts.push(seat);
    const back = L.plane(Wd, Hb, wood, 0, Hb / 2, -D / 2, g); parts.push(back);
    const side = (s) => { const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(D / 2, Hf); sh.lineTo(-D / 2, Hb); sh.lineTo(-D / 2, 0);
      const geo = new THREE.ShapeGeometry(sh); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.5, uv.getY(i) * 0.5);
      const o = L.mesh(geo, L.basic(L.rep(T.planks, 1, 1), s > 0 ? 1.5 : 1.35, { side: THREE.DoubleSide }), s * Wd / 2, 0, 0, g); o.rotation.y = -s * Math.PI / 2; return o; };
    parts.push(side(-1), side(1));
    const roof = new THREE.Group(); g.add(roof);
    const a = Math.atan2(Hf - Hb, D);
    const slab = L.box(Wd + 0.3, 0.08, D + 0.35, L.basic(L.rep(T.planks, 0.6, 0.6), 1.2), 0, (Hf + Hb) / 2 + 0.04, 0, roof); slab.rotation.x = a;
    const snow = L.box(Wd + 0.22, 0.09, D + 0.25, L.basic(L.rep(T.snow, 1, 1), 1.0), 0, (Hf + Hb) / 2 + 0.11, 0, roof); snow.rotation.x = a;
    parts.push(roof);
    let doorPivot = null;
    if (front) {
      const fr = new THREE.Group(); g.add(fr); const dw = 0.68, sw = (Wd - dw) / 2;
      L.plane(sw, Hf, wood, -Wd / 2 + sw / 2, Hf / 2, D / 2, fr); L.plane(sw, Hf, wood, Wd / 2 - sw / 2, Hf / 2, D / 2, fr);
      L.plane(dw, Hf - 1.9, wood, 0, 1.9 + (Hf - 1.9) / 2, D / 2, fr);
      L.plane(dw, 1.9, L.basic(null, 0x0c0806), 0, 0.95, D / 2 - 0.01, fr);   // dark inside behind the door
      parts.push(fr);
      doorPivot = new THREE.Group(); doorPivot.position.set(-dw / 2, 0, D / 2 + 0.015); g.add(doorPivot);
      L.plane(dw, 1.9, L.basic(doorMoonTex(), 1, { side: THREE.DoubleSide }), dw / 2, 0.95, 0, doorPivot); doorPivot.rotation.y = -door;
      parts.push(doorPivot);
    }
    L.drift(g, Wd / 2 + 0.2, D / 2, 0.5, 0.2, 0.4); L.drift(g, -Wd / 2 - 0.1, -D / 2, 0.5, 0.25, 0.5);
    g.userData = { parts, door: doorPivot, seatTop: 0.5, holeZ: -D / 2 + 0.25 };
    return g;
  }
  // a lit-ish wooden plank (prop to carry)
  function npc(id, tex, variant) {   // lib-mml NPC (recoloured filler) with a procedural walk on its rigid-skinned bones
    const g0 = SkeletonUtils.clone(M['lib_' + id]); g0.traverse((o) => { if (o.isMesh) { o.material = L.basic(T[`lib_${tex}_${variant}`], 1, { alphaTest: 0.5, side: THREE.DoubleSide }); o.frustumCulled = false; } });
    const w = new THREE.Group(); w.add(g0);
    const bones = {}; w.traverse((o) => { if (o.isBone) bones[o.name] = o; });
    const rest = Object.fromEntries(Object.entries(bones).map(([k, b]) => [k, b.quaternion.clone()]));
    const sh = L.mesh(new THREE.CircleGeometry(0.24, 10), L.basic(null, 0x343c50, { transparent: true, opacity: 0.6, depthWrite: false }), 0, 0.012, 0, w); sh.rotation.x = -Math.PI / 2; sh.scale.y = 0.7;
    const ax = V3([1, 0, 0]), qq = new THREE.Quaternion();
    w.walk = (ph, amp = 1) => {   // ph in cycles
      const s = Math.sin(ph * 6.283) * amp;
      for (const [n, a] of [['Bone007', 0.5 * s], ['Bone009', -0.5 * s], ['Bone008', 0.25 * Math.max(0, -s)], ['Bone010', 0.25 * Math.max(0, s)], ['Bone002', -0.35 * s], ['Bone004', 0.35 * s]]) {
        if (!bones[n]) continue; bones[n].quaternion.copy(rest[n]).multiply(qq.setFromAxisAngle(ax, a));
      }
      if (bones.Bone000) bones.Bone000.position.y = bones.Bone000.userData.y0 ?? (bones.Bone000.userData.y0 = bones.Bone000.position.y);
    };
    w.bones = bones; w.rest = rest; return w;
  }

  // ---------- sets ----------
  function digSite(scene, { toilet = 'buried' } = {}) {   // S1: village + the excavation with the buried toilet
    L.village(scene, { cz: -5, cx: -3.5, holes: [[0.6, -0.6, 1.0]] });
    const hg = L.hole(scene, 0.6, -0.6, 1.0, 0.9);
    const tl = modernToilet({ lidUp: toilet !== 'buried' }); scene.add(tl);
    if (toilet === 'buried') { tl.position.set(0.62, -0.38, -0.72); tl.rotation.set(-0.2, 0.55, 0.14); }
    else { tl.position.set(1.95, 0, -0.9); tl.rotation.set(0, -0.35, 0); }
    if (toilet === 'buried') L.drift(scene, 2.9, -2.0, 0.8, 0.45, 0.6);
    L.drift(scene, -0.9, -1.4, 0.6, 0.35, 0.5); L.drift(scene, -1.7, 1.5, 0.7, 0.25, 0.4);
    L.footprints(scene, -0.6, 0.6, -2.4, 4.0, 10);
    const pile = toilet === 'buried' ? makePile(scene, 2.05, -0.72, 1.2) : null;
    return { tl, hg, pile };
  }
  // v3 (user: panel #1 felt empty): set dressing around the dig, kept clear of her and of the pit: snowy crates and
  // barrels, a plank fence, a lamp post, pines, a half-buried relic car and trash can, a dog sniffing in the snow, a hawk
  function dressDig(scene) {
    const oak = L.basic(L.rep(OAK, 1, 1), 0.85), cap = L.basic(L.rep(T.snow, 1, 1), 1.0), iron = L.basic(null, 0x2a2a30);
    const crate = (x, z, sz, ry, y = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
      L.box(sz, sz, sz, oak, 0, sz / 2, 0, g); for (const d of [-1, 1]) L.box(sz * 1.02, sz * 0.12, sz * 1.02, L.basic(null, 0x5a3a1c), 0, sz / 2 + d * sz * 0.3, 0, g);
      L.box(sz * 1.04, 0.06, sz * 1.04, cap, 0, sz + 0.03, 0, g); return g; };
    const barrel = (x, z, ry = 0, tilt = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.set(tilt, ry, 0); scene.add(g);
      L.mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.7, 10), L.basic(L.rep(OAK, 2, 1), 0.75), 0, 0.35, 0, g);
      for (const y of [0.12, 0.58]) L.mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 10), iron, 0, y, 0, g);
      L.mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.07, 10), cap, 0, 0.72, 0, g); return g; };
    crate(2.75, -2.55, 0.55, 0.3); crate(3.3, -2.35, 0.5, -0.2); crate(2.95, -2.5, 0.42, 0.6, 0.55);
    barrel(2.2, -3.1, 0.2); barrel(2.65, -3.35); barrel(-1.0, -2.9, 0, 0.0);
    for (let k = 0; k < 7; k++) { const x = 3.6 + k * 0.55, z = -1.2 - k * 0.45; L.box(0.08, 0.95, 0.08, oak, x, 0.47, z, scene); L.box(0.1, 0.06, 0.1, cap, x, 0.97, z, scene); }
    for (const y of [0.35, 0.75]) { const r = L.box(3.6, 0.06, 0.04, oak, 3.6 + 1.65, y, -1.2 - 1.35, scene); r.rotation.y = Math.atan2(2.7, 3.3); }
    L.lamp(scene, 3.8, -4.95, 3.2, 0.05);
    for (const [x, z, h] of [[7.2, -3.8, 4.5], [-2.6, -4.6, 3.8], [6.5, -1.2, 5.2]]) L.pine(scene, x, z, h);
    const car = L.libModel('mini_red_car', 'mini_red_car', 'darkgreen'); car.position.set(8.0, -0.85, -4.6); car.rotation.set(0.15, -0.9, 0.2); scene.add(car); L.drift(scene, 7.6, -3.9, 2.0, 0.5, 1.1, -0.9);
    const can = L.libModel('trashcan', 'trashcan', 'green'); can.position.set(-1.6, -0.35, -3.6); can.rotation.z = -0.35; scene.add(can); L.drift(scene, -1.6, -3.3, 0.7, 0.3, 0.5);
    const skinned = (id) => { const g0 = SkeletonUtils.clone(M['lib_' + id]); g0.traverse((o) => { if (o.isMesh) { o.material = L.basic(T[`lib_${id}_orig`], 1, { alphaTest: 0.5, side: THREE.DoubleSide }); o.frustumCulled = false; } }); const w = new THREE.Group(); w.add(g0); return w; };
    const dog = skinned('hound'); dog.scale.setScalar(1.4); dog.position.set(4.4, 0, -2.7); dog.rotation.y = -2.2; scene.add(dog);
    const hawk = skinned('hawk'); scene.add(hawk);
    L.footprints(scene, 4.4, -2.9, 5.6, -4.8, 8);
    return (t) => { const q = Math.floor(t * 15) / 15; const u = -2.4 + q * 1.4; hawk.position.set(6.09 + 0.64 * u, 4.3 + Math.sin(q * 1.3) * 0.2, -5.31 + 0.76 * u); hawk.rotation.set(0, Math.PI / 2 - 0.3, Math.sin(q * 6) * 0.25);
      dog.rotation.y = -2.2 + (Math.floor(q * 2) % 2 ? 0.25 : -0.1); };
  }
  const HOLE = { x: 0.62, z: 0.28, r: 0.25 };
  function holeSite(scene, opts = {}) {
    L.village(scene, { cz: -5, cx: -3.5, holes: [[HOLE.x, HOLE.z, HOLE.r]] });
    const hg = L.hole(scene, HOLE.x, HOLE.z, HOLE.r, 0.5);
    L.drift(scene, -1.6, 0.6, 0.9, 0.25, 0.6); L.drift(scene, 2.2, -1.2, 1.4, 0.3, 0.8);
    if (PILE && !opts.noPile) makePile(scene, PILE.x, PILE.z, 1);
    L.footprints(scene, -0.5, -0.3, -2.6, -4.5, 12);
    return { hg };
  }
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
  function tossFX(scene, tosses, to, pile) {
    const m = L.basic(L.rep(T.snow, 1, 1), 0.8), ch = [...Array(9)].map((_, i) => { const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + (i % 3) * 0.02, 0), m); scene.add(o); o.visible = false; return o; });
    const FL = 0.42, base = pile.scale.clone();
    return (t) => {
      const q = Math.floor(t * 30) / 30; let landed = 0, cur = null;
      for (const tk of tosses) { if (q >= tk.t + FL) landed++; else if (q >= tk.t) cur = tk; }
      const k = tosses.length ? landed / tosses.length : 1; pile.scale.set(base.x * (0.45 + 0.55 * k), base.y * (0.3 + 0.7 * k), base.z * (0.45 + 0.55 * k));
      ch.forEach((o, i) => {
        if (!cur) { o.visible = false; return; }
        const u = (q - cur.t) / FL, a = cur.p, b = V3([to.x + (hash(i + 3) - 0.5) * 0.3, to.y, to.z + (hash(i + 9) - 0.5) * 0.3]);
        o.position.set(a.x + (b.x - a.x) * u + (hash(i) - 0.5) * 0.08, a.y + (b.y - a.y) * u + 4 * (0.35 + hash(i + 1) * 0.15) * u * (1 - u), a.z + (b.z - a.z) * u);
        o.rotation.set(u * 6 + i, u * 4, 0); o.visible = u < 0.98;
      });
    };
  }
  let PILE = null;
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
    L.plane(60, 60, L.basic(L.rep(g, 60, 60), 1), 0, -0.6, 0, scene, 0, -Math.PI / 2);
    L.plane(60, 30, L.basic(L.rep(g, 60, 30), 0.8), 0, 10, -3, scene);
  }
  // half-village with the ground cut at z = 0: the earth below shows in section (outhouse pit / sewer)
  function cutVillage(scene, { preset = 'mml2' } = {}) {
    L.addSky(scene, { near: 10, far: 95, preset });
    L.snowField(scene, { w: 260, d: 130, cz: -65 });
    L.house(scene, { x: -4.5, z: -9, w: 6, d: 5, h: 4.0, wall: 'stone', wins: [[0, -1.5, 2.4], [0, 1.6, 2.4]], door: 0 });
    L.house(scene, { x: 5.5, z: -11, w: 5.5, d: 5, h: 3.6, wall: 'planks', roofH: 2.2, wins: [[0, 1.2, 2.0, 1]], door: -1.0, ruin: true });
    for (const [x, z, h] of [[-8, -6, 5], [8, -5.5, 6], [1.5, -16, 7]]) L.pine(scene, x, z, h);
    for (const [x, z, ww, hh, dd, s] of [[-30, -80, 14, 34, 12, 1], [22, -90, 14, 44, 12, 2]]) L.tower(scene, x, z, ww, hh, dd, s);
    L.ironFence(scene, -7, -4.5, -2.0, -4.5);
    const earth = L.plane(16, 2.6, L.basic(L.rep(T.dirt, 16 / 1.2, 2.6 / 1.2), 0.85), 0, -1.3, 0.0, scene);
    L.box(16, 0.1, 0.06, L.basic(L.rep(T.snow, 8, 1), 1.0), 0, -0.05, 0.02, scene);   // snow layer edge
    for (let i = 0; i < 14; i++) L.box(0.12 + hash(i) * 0.2, 0.08 + hash(i + 3) * 0.1, 0.02, L.basic(null, 0x7a5a3a), -7 + i * 1.1 + hash(i + 5), -0.5 - hash(i + 7) * 1.8, 0.01, scene);   // stones in the earth
    return earth;
  }
  function bedroom(scene) {   // S5: old bedroom at night (wallpaper, plank floor, moon window, iron bed)
    L.addSky(scene, { near: 6, far: 40, preset: 'interior' });
    const room = new THREE.Group(); scene.add(room);
    L.plane(9, 12, L.basic(L.rep(T.planks, 9 / 1.4, 12 / 1.4), 1.9), 0, 0, 4.4, room, 0, -Math.PI / 2);
    L.plane(9, 3.4, L.basic(L.rep(T.wallpaper, 9 / 1.0, 3.4 / 1.0), 0.82), 0, 1.7, -1.6, room);
    L.box(9, 0.6, 0.04, L.basic(L.rep(T.planks, 4, 0.4), 0.7), 0, 0.3, -1.57, room);
    L.plane(6, 3.4, L.basic(L.rep(T.wallpaper, 6 / 1.2, 3.4 / 1.2), 0.6), -2.6, 1.7, 1.4, room, Math.PI / 2);
    L.plane(0.9, 1.1, L.basic(T.winLit === undefined ? T.win : T.win, 1.0), 1.6, 1.75, -1.57, room);
    const bed = cc('bed', 0.62, { axis: 'y' }); bed.rotation.y = Math.PI / 2; bed.position.set(-0.6, 0, -0.75); scene.add(bed);
    const rug = L.plane(1.4, 0.9, L.basic(L.cvs(16, 10, (c) => { c.fillStyle = '#7a2a2a'; c.fillRect(0, 0, 16, 10); c.fillStyle = '#c8a050'; c.fillRect(1, 1, 14, 1); c.fillRect(1, 8, 14, 1); c.fillStyle = '#4a1414'; c.fillRect(3, 3, 10, 4); }), 1), 0.4, 0.006, 0.3, scene, 0, -Math.PI / 2);
    const stand = L.box(0.4, 0.5, 0.35, L.basic(L.rep(T.planks, 0.4, 0.4), 1.8), 0.55, 0.25, -1.3, scene);
    L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), L.basic(null, 0xf4ecd0), 0.55, 0.57, -1.3, scene);   // candle
    L.mesh(new THREE.SphereGeometry(0.025, 5, 4), L.basic(null, 0xffc040), 0.55, 0.67, -1.3, scene);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    return { bed };
  }
  function tudorRoom(scene) {   // S8: Harington's 1590s room: oak panelling, stone floor, small leaded window
    L.addSky(scene, { near: 6, far: 40, preset: 'interior' });
    const room = new THREE.Group(); scene.add(room);
    L.plane(10, 12, L.basic(L.rep(T.stone, 10 / 1.6, 12 / 1.6), 1.0), 0, 0, 4.4, room, 0, -Math.PI / 2);
    L.plane(10, 3.6, L.basic(L.rep(OAK, 10 / 0.6, 3.6 / 0.6), 0.62), 0, 1.8, -0.75, room);
    for (let x = -4.5; x <= 4.5; x += 0.9) L.box(0.06, 3.6, 0.04, L.basic(null, 0x2a1c12), x, 1.8, -0.73, room);   // panel battens
    L.box(10, 0.08, 0.06, L.basic(null, 0x2a1c12), 0, 1.0, -0.72, room);
    L.plane(6, 3.6, L.basic(L.rep(OAK, 6 / 0.6, 3.6 / 0.6), 0.5), -2.4, 1.8, 2.2, room, Math.PI / 2);
    const lw = L.cvs(16, 20, (c) => { c.fillStyle = '#2a2a30'; c.fillRect(0, 0, 16, 20); c.fillStyle = '#a8c8d8'; for (let y = 1; y < 20; y += 4) for (let x = (y % 8 === 1 ? 1 : 3); x < 16; x += 4) c.fillRect(x, y, 2, 2); });
    L.plane(0.7, 0.9, L.basic(lw, 1.2), 1.7, 2.1, -0.72, room);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  }
  // Harington's flush toilet: wooden seat box with a hole + lid, a lead cistern high on the wall, down pipe, lever, chain
  function haringtonToilet(scene, { x = 0, z = -0.4 } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const oak = L.basic(L.rep(OAK, 2, 1.2), 1.0);
    L.box(0.72, 0.46, 0.6, oak, 0, 0.23, 0, g);
    L.box(0.78, 0.05, 0.64, L.basic(L.rep(OAK, 2, 2), 1.15), 0, 0.485, 0, g);
    const hole = L.mesh(new THREE.CircleGeometry(0.13, 12), L.basic(null, 0x101418), 0, 0.512, 0.04, g); hole.rotation.x = -Math.PI / 2;
    const lid = L.box(0.5, 0.04, 0.42, L.basic(L.rep(OAK, 1.5, 1.5), 1.1), 0, 0.72, -0.27, g); lid.rotation.x = -1.35;
    const lead = L.basic(L.cvs(8, 8, (c) => { c.fillStyle = '#6a6e78'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#585c66'; c.fillRect(0, 6, 8, 2); c.fillStyle = '#8a8e98'; c.fillRect(0, 0, 8, 1); }), 1);
    const tank = L.box(0.52, 0.34, 0.3, lead, 0, 2.05, -0.2, g);
    L.box(0.56, 0.04, 0.34, L.basic(null, 0x4a4e58), 0, 2.235, -0.2, g);
    for (const s of [-1, 1]) L.box(0.04, 0.26, 0.24, L.basic(null, 0x3a2a1c), s * 0.2, 1.82, -0.25, g);   // brackets
    const pipe = L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), L.basic(null, 0x7a7e88), 0, 1.18, -0.24, g);
    const lever = new THREE.Group(); lever.position.set(0.26, 2.12, -0.12); g.add(lever);
    const arm = L.box(1, 0.03, 0.03, L.basic(null, 0x8a8c94), 0.5, 0, 0, lever);
    const handle = L.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 6), L.basic(null, 0x6a3a1c), 0, 0, 0, scene); handle.rotation.z = Math.PI / 2;
    const links = [...Array(10)].map((_, i) => L.box(0.02, 0.035, 0.012, L.basic(null, i % 2 ? 0xb8bcc4 : 0x8a8e98), 0, 0, 0, scene));
    g.userData = { tank, pipe, lever, arm, handle, links, holeW: () => g.localToWorld(V3([0, 0.52, 0.04])), tankW: () => g.localToWorld(V3([0, 2.05, -0.2])) };
    // hang the chain: lever tip (world) -> handle point (world)
    g.userData.hang = (tipX, hp) => {
      g.updateMatrixWorld(true);
      const pivot = lever.getWorldPosition(new THREE.Vector3()); const len = Math.max(0.05, tipX - pivot.x);
      arm.scale.x = len; arm.position.x = len / 2;
      const tip = V3([pivot.x + len, pivot.y, pivot.z]);
      lever.rotation.z = Math.atan2(Math.min(0, hp.y - (pivot.y - 0.42)) * 0.5, len);   // pulled down -> lever dips
      const tipW = lever.localToWorld(V3([len, 0, 0]));
      links.forEach((l, i) => { const k = (i + 0.5) / links.length; l.position.copy(tipW).lerp(hp, k); l.rotation.y = i % 2 ? Math.PI / 2 : 0; });
      handle.position.copy(hp).add(V3([0, -0.02, 0]));
      return tipW;
    };
    return g;
  }
  // street facade with a REAL window opening (2nd floor); she can stand inside and lean out
  const WIN = { x: 0, y0: 2.55, y1: 3.55, w: 1.0 };
  function streetSet(scene, { preset = 'morning' } = {}) {
    L.addSky(scene, { near: 10, far: 90, preset });
    L.plane(60, 40, L.basic(L.rep(T.rubble, 60 / 1.4, 40 / 1.4), 1.05), 0, 0, 10, scene, 0, -Math.PI / 2);   // cobbles
    const sh = new THREE.Shape(); sh.moveTo(-3, 0); sh.lineTo(3, 0); sh.lineTo(3, 5); sh.lineTo(-3, 5); sh.lineTo(-3, 0);
    const hp = new THREE.Path(); hp.moveTo(WIN.x - WIN.w / 2, WIN.y0); hp.lineTo(WIN.x - WIN.w / 2, WIN.y1); hp.lineTo(WIN.x + WIN.w / 2, WIN.y1); hp.lineTo(WIN.x + WIN.w / 2, WIN.y0); hp.lineTo(WIN.x - WIN.w / 2, WIN.y0); sh.holes.push(hp);
    const geo = new THREE.ShapeGeometry(sh); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.4, uv.getY(i) / 2.4);
    L.mesh(geo, L.basic(L.rep(T.stone, 1, 1), 1.0, { side: THREE.DoubleSide }), 0, 0, 0, scene);
    L.box(6.2, 0.18, 0.5, L.basic(null, 0x5a4a3a), 0, 5.05, 0.1, scene);
    const roofS = L.box(6.6, 0.14, 2.2, L.basic(L.rep(T.roof, 3, 1), 1), 0, 5.6, -0.6, scene); roofS.rotation.x = -0.5;
    L.box(6.6, 0.16, 0.25, L.basic(L.rep(T.snow, 3, 1), 1), 0, 5.12, 0.42, scene);
    L.box(WIN.w + 0.24, 0.08, 0.32, L.basic(null, 0x8a8478), WIN.x, WIN.y0 - 0.04, 0.06, scene);   // sill
    for (const s of [-1, 1]) L.box(0.08, WIN.y1 - WIN.y0, 0.2, L.basic(null, 0x4a3424), WIN.x + s * (WIN.w / 2 + 0.04), (WIN.y0 + WIN.y1) / 2, 0.02, scene);
    L.box(WIN.w + 0.24, 0.08, 0.2, L.basic(null, 0x4a3424), WIN.x, WIN.y1 + 0.04, 0.02, scene);
    L.box(6, 5, 4, L.basic(null, 0x1a1410, { side: THREE.BackSide }), 0, 2.5, -2.02, scene);   // dark inside
    L.box(6, 0.05, 4, L.basic(L.rep(T.planks, 3, 2), 1.4), 0, 1.8, -2.0, scene);              // upper floor inside
    L.plane(1.0, 1.9, L.basic(T.door, 1), -1.6, 0.95, 0.02, scene);
    L.plane(0.75, 1.0, L.basic(T.win, 1), 1.7, 1.3, 0.02, scene); L.plane(0.75, 1.0, L.basic(T.win, 1), 1.7, 3.05, 0.02, scene); L.plane(0.75, 1.0, L.basic(T.win, 1), -1.6, 3.05, 0.02, scene);
    const shutters = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(WIN.x + s * WIN.w / 2, (WIN.y0 + WIN.y1) / 2, 0.06); scene.add(p);
      L.box(WIN.w / 2, WIN.y1 - WIN.y0, 0.04, L.basic(L.rep(T.planks, 0.3, 0.8), 2.2), -s * WIN.w / 4, 0, 0, p); return p; });
    L.house(scene, { x: -6.6, z: -1.5, w: 6, d: 5, h: 4.4, wall: 'planks', wins: [[0, -1.4, 2.6], [0, 1.4, 2.6]], door: 0 });
    L.house(scene, { x: 6.8, z: -1.0, w: 6.5, d: 5, h: 5.0, wall: 'stone', wins: [[0, -1.6, 1.6], [0, 1.6, 3.6]], door: -1.6 });
    L.house(scene, { x: 1, z: 12, ry: Math.PI, w: 9, d: 5, h: 4.6, wall: 'stone', wins: [[0, -2, 2.8], [0, 2, 2.8]] });
    L.lamp(scene, 2.6, 1.2, 3.2); L.drift(scene, -2.6, 0.4, 1.0, 0.18, 0.4); L.drift(scene, 2.8, 0.3, 0.8, 0.15, 0.35);
    return { shutters };
  }
  function streetHero(scene) {   // she stands inside on the upper floor, at the window
    return hero(scene, { p: [WIN.x, 1.825, -0.42], ry: 0 });
  }
  // house section with the straight drain pipe and the sewer (shots 18-19)
  function sectionSet(scene) {
    L.addSky(scene, { near: 8, far: 60, preset: 'interior' });
    L.plane(8, 3, L.basic(L.rep(OAK, 8 / 0.6, 3 / 0.6), 0.55), 0, 1.5, -1.4, scene);
    L.plane(8, 1.4, L.basic(L.rep(T.stone, 8 / 1.6, 1.4 / 1.6), 0.8), 0, 0, -0.7, scene, 0, -Math.PI / 2);
    L.box(8, 0.2, 1.4, L.basic(L.rep(T.planks, 8, 0.3), 1.0), 0, -0.1, -0.7, scene);                  // floor slab in section
    L.plane(8, 3.2, L.basic(L.rep(T.dirt, 8 / 1.2, 3.2 / 1.2), 0.8), 0, -1.8, 0.0, scene);
    for (let i = 0; i < 9; i++) L.box(0.12 + hash(i) * 0.2, 0.08 + hash(i + 3) * 0.1, 0.02, L.basic(null, 0x7a5a3a), -3.5 + i * 0.9 + hash(i + 5) * 0.4, -0.6 - hash(i + 7) * 1.5, 0.01, scene);
    const sew = new THREE.Group(); sew.position.set(0, -2.55, 0.02); scene.add(sew);   // brick sewer tunnel in section
    L.mesh(new THREE.RingGeometry(0.55, 0.75, 20), L.basic(L.rep(T.brick, 2, 0.3), 1.0), 0, 0, 0.001, sew);
    L.mesh(new THREE.CircleGeometry(0.55, 20), L.basic(null, 0x16100c), 0, 0, 0, sew);
    const wtex = L.cvs(16, 4, (c) => { c.fillStyle = '#5a3c1c'; c.fillRect(0, 0, 16, 4); c.fillStyle = '#7a5428'; c.fillRect(0, 0, 6, 1); c.fillRect(9, 2, 4, 1); }); wtex.wrapS = wtex.wrapT = THREE.RepeatWrapping; wtex.repeat.set(3, 1);
    const water = L.mesh(new THREE.CircleGeometry(0.55, 20, Math.PI * 1.12, Math.PI * 0.76), L.basic(wtex, 1), 0, 0, 0.002, sew);
    const ht = haringtonToilet(scene, { x: 0, z: -0.45 }); ht.userData.tank.visible = false; ht.userData.pipe.visible = false; ht.userData.lever.visible = false; ht.userData.links.forEach((l) => (l.visible = false)); ht.userData.handle.visible = false;
    // the drain: a cut-open pipe (back half visible) straight down from the seat to the sewer
    const pipe = L.mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.0, 10, 1, true), L.basic(null, 0x9aa0aa, { side: THREE.BackSide }), 0, -0.95, 0.15, scene);
    return { sew, wtex, ht, pipeTop: 0.05, pipeBot: -1.95 };
  }
  // the S-trap diagram (lab void): toilet bowl on top-left, S bend, water seal, sewer at the bottom right
  function sTrapSet(scene) {
    labSet(scene);
    const P = (x, y) => V3([x, y, 0]);
    const pts = [P(-0.6, 1.2), P(-0.6, 0.62), P(-0.585, 0.42), P(-0.5, 0.29), P(-0.35, 0.25), P(-0.2, 0.29), P(-0.115, 0.42), P(-0.1, 0.62), P(-0.1, 0.95), P(-0.07, 1.1), P(0.06, 1.17), P(0.19, 1.1), P(0.22, 0.95), P(0.22, 0.2), P(0.22, -0.2)];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3);
    L.mesh(new THREE.TubeGeometry(curve, 120, 0.1, 10), L.basic(null, 0x9aa2ae, { side: THREE.BackSide }), 0, 0, 0, scene);
    L.mesh(new THREE.TubeGeometry(curve, 120, 0.104, 10), L.basic(null, 0xe8ecf2, { side: THREE.FrontSide, transparent: true, opacity: 0.18, depthWrite: false }), 0, 0, 0, scene);
    const LEVEL = 0.74, clip = new THREE.Plane(V3([0, -1, 0]), 0.2);
    const wmat = L.basic(null, 0x3c9ce8, { clippingPlanes: [clip] });
    const sub = new THREE.CatmullRomCurve3(curve.getSpacedPoints(120).filter((p) => p.y < 0.9 && p.x < 0.0), false);
    L.mesh(new THREE.TubeGeometry(sub, 60, 0.088, 8), wmat, 0, 0, 0.0, scene);
    const bowl = L.mesh(new THREE.LatheGeometry([[0.06, 0], [0.2, 0.12], [0.3, 0.28], [0.33, 0.34], [0.31, 0.35]].map(([r, y]) => new THREE.Vector2(r, y)), 14), L.lam(null, 0xf4f4f0, { side: THREE.DoubleSide }), -0.6, 1.15, 0, scene);
    const bw = L.mesh(new THREE.CircleGeometry(0.2, 14), L.basic(null, 0x3c9ce8, { clippingPlanes: [clip] }), -0.6, 1.33, 0, scene); bw.rotation.x = -Math.PI / 2;
    const sew = L.box(1.4, 0.36, 0.6, L.basic(L.rep(T.brick, 2, 0.5), 0.8), 0.35, -0.38, 0, scene);
    L.box(1.3, 0.2, 0.62, L.basic(null, 0x5a3c1c), 0.35, -0.42, 0, scene);
    const gm = L.basic(null, GAS), puffs = [...Array(6)].map((_, i) => { const o = L.mesh(new THREE.IcosahedronGeometry(0.055 + (i % 3) * 0.012, 0), gm, 0, 0, 0.0, scene); o.visible = false; return o; });
    // param along the curve where the water seal stops the gas (outlet leg surface)
    let uSeal = 0; for (let k = 0; k <= 200; k++) { const p = curve.getPointAt(k / 200); if (p.x > -0.11 && p.y <= LEVEL) uSeal = k / 200; }
    for (let k = 200; k >= 0; k--) { const p = curve.getPointAt(k / 200); if (p.x > -0.12 && p.x < -0.08 && p.y <= LEVEL + 0.02) { uSeal = k / 200; break; } }
    return { curve, clip, LEVEL, puffs, uSeal, bowl };
  }
  function bathroomEnd(scene) {   // v2 ending set: a ruined village bathroom; the dug-up toilet is installed and working
    L.addSky(scene, { near: 6, far: 40, preset: 'interior' });
    const room = new THREE.Group(); scene.add(room);
    L.plane(9, 12, L.basic(L.rep(T.tiles, 9 / 1.0, 12 / 1.0), 0.95), 0, 0, 4.4, room, 0, -Math.PI / 2);
    L.plane(9, 3.4, L.basic(L.rep(T.wallpaper, 9 / 1.0, 3.4 / 1.0), 0.85), 0, 1.7, -1.6, room);
    L.box(9, 0.9, 0.04, L.basic(L.rep(OAK, 9 / 0.6, 0.9 / 0.6), 0.6), 0, 0.45, -1.57, room);
    L.plane(6, 3.4, L.basic(L.rep(T.wallpaper, 6 / 1.2, 3.4 / 1.2), 0.62), -2.4, 1.7, 1.4, room, Math.PI / 2);
    L.plane(1.0, 1.2, L.basic(T.winBroken, 1.15), -1.0, 1.85, -1.57, room);
    const tub = cc('bathtub', 1.5); tub.rotation.y = Math.PI / 2; tub.position.set(-1.45, 0, -0.95); scene.add(tub);
    const tl = modernToilet({ lidUp: true }); tl.position.set(0.45, 0, -1.3); scene.add(tl);
    L.mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 5), L.basic(null, 0xb8bcc4), 0.62, 0.35, -1.5, scene);
    L.mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.75, 8), L.lam(null, 0xf0eee8), 1.45, 0.375, -1.35, scene);
    L.mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.14, 12), L.lam(null, 0xf0eee8, { side: THREE.DoubleSide }), 1.45, 0.8, -1.35, scene);
    L.box(0.5, 0.6, 0.03, L.basic(null, 0x9ab0c0), 1.45, 1.45, -1.57, scene);   // mirror
    L.drift(room, -0.5, -1.2, 0.6, 0.14, 0.35); L.drift(room, 2.0, -0.9, 0.7, 0.14, 0.35);
    const beam = L.mesh(new THREE.CylinderGeometry(0.4, 0.8, 3.6, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfc8d8, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }), -0.9, 1.8, 0.2, room); beam.rotation.z = 0.12;
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    return { tl };
  }
  function workshop(scene) {   // S11: the watchmaker's bench (1775): gears, a pocket watch, a straight copper pipe
    tudorRoom(scene);
    L.box(1.8, 0.08, 0.7, L.basic(L.rep(T.planks, 1.2, 0.5), 2.3), 0, 0.82, 0.05, scene);
    for (const [x, z] of [[-0.8, -0.25], [0.8, -0.25], [-0.8, 0.35], [0.8, 0.35]]) L.box(0.08, 0.82, 0.08, L.basic(null, 0x3a2a1c), x, 0.41, z, scene);
    const gearT = L.cvs(16, 16, (c) => { c.fillStyle = '#c89a3a'; c.beginPath(); c.arc(8, 8, 6, 0, 7); c.fill(); for (let a = 0; a < 8; a++) { const x = 8 + Math.cos(a / 8 * 6.283) * 7, y = 8 + Math.sin(a / 8 * 6.283) * 7; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); } c.fillStyle = '#5a4012'; c.beginPath(); c.arc(8, 8, 2, 0, 7); c.fill(); });
    const gears = [[-0.55, 0.15, 0.12], [-0.35, 0.28, 0.08], [0.55, 0.22, 0.1]].map(([x, z, r]) => { const o = L.mesh(new THREE.CircleGeometry(r, 12), L.basic(gearT, 1, { side: THREE.DoubleSide, alphaTest: 0.5 }), x, 0.865, z, scene); o.rotation.x = -Math.PI / 2; return o; });
    const cv = document.createElement('canvas'); cv.width = cv.height = 24; const wt = new THREE.CanvasTexture(cv); wt.colorSpace = THREE.SRGBColorSpace; wt.magFilter = wt.minFilter = THREE.NearestFilter;
    const watch = L.mesh(new THREE.CircleGeometry(0.11, 14), L.basic(wt, 1), 0.3, 0.868, 0.25, scene); watch.rotation.x = -Math.PI / 2 + 0.35;
    L.mesh(new THREE.TorusGeometry(0.115, 0.012, 4, 14), L.basic(null, 0xe0b040), 0.3, 0.87, 0.25, scene).rotation.x = -Math.PI / 2 + 0.35;
    const drawWatch = (t) => { const c = cv.getContext('2d'); c.fillStyle = '#f8f4e8'; c.fillRect(0, 0, 24, 24); c.fillStyle = '#2a2a2a'; for (let k = 0; k < 12; k++) c.fillRect(Math.round(12 + Math.cos(k / 12 * 6.283) * 9), Math.round(12 + Math.sin(k / 12 * 6.283) * 9), 1, 1);
      const a = Math.floor(t) / 60 * 6.283 * 5 - Math.PI / 2; c.strokeStyle = '#c81818'; c.lineWidth = 1; c.beginPath(); c.moveTo(12, 12); c.lineTo(12 + Math.cos(a) * 8, 12 + Math.sin(a) * 8); c.stroke();
      c.strokeStyle = '#141414'; c.beginPath(); c.moveTo(12, 12); c.lineTo(12, 6); c.stroke(); wt.needsUpdate = true; };
    for (const [x, z, r] of [[-0.1, 0.3, 0.2], [0.05, 0.32, 0.25]]) { const p = L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 6), L.basic(null, 0xc8743a), x, 0.885, z, scene); p.rotation.set(0, r, Math.PI / 2); }
    return { gears, drawWatch, watch };
  }

  const S = [];

  // ===== 1. "Operator... I dug up another human artifact."  she digs next to the buried toilet; clink on porcelain
  S.push({ at: [1, 'Operator'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const { hg, pile } = digSite(scene); const dress = dressDig(scene);
    const ch = hero(scene, { p: [1.62, 0, -1.55], ry: -0.93 });
    const shovel = L.model('shovel', 1.15); scene.add(shovel);
    const tA = ws(1, 'artifact'), cyc = 1.2, from = ((0.27 - (tA + 99)) % cyc + cyc) % cyc, tS = tA + 0.3;
    const segs = [seg('dig', -99, { loop: true, from }), seg('surprised', tS, { fade: 0.1 })];
    const plan = [[-99, 'happy', 'smileOpen'], [tA, 'surprised', 'gasp'], [tS + 0.5, 'hearts', 'smileOpen']];
    const starts = []; for (let k = -4; k <= 0; k++) { const cs = tA - 0.27 + k * cyc; if (cs + 0.47 > -0.7) starts.push(cs); }
    const prys = starts.map((cs) => cs + 0.47), tosses = starts.filter((cs) => cs + 0.87 < tS).map((cs) => ({ t: cs + 0.87 }));
    for (const tk of tosses) { ch.drive(tk.t, segs, plan); scene.updateMatrixWorld(true); tk.p = shovelOnHands(ch, shovel).clone(); }
    const grow = dynHole(scene, hg, 0.6, -0.6, 1.0, 0.9), toss = tossFX(scene, tosses, V3([pile.position.x, 0.18, pile.position.z]), pile);
    const holeR = (t) => { const n = prys.filter((x) => x <= t).length; return 0.52 + 0.48 * n / prys.length; };
    for (let k = -3; k < 4; k++) { const tp = tA - 0.27 + k * cyc; if (tp + 0.27 > 0.05 && tp + 0.27 < tS) cue(tp + 0.27, k === 0 ? 'clink' : 'shovel_snow'); }
    for (let k = -3; k < 4; k++) { const tt = tA - 0.27 + 0.87 + k * cyc - cyc; if (tt > 0.05 && tt < tS) cue(tt, 'snow_toss'); }
    cue(0.0, 'wind_start');
    const sf = L.snowfall(scene, { cx: 0, cz: -1, R: 11 });
    const fx = new FX(LW, LH).add('impact', { world: [0.7, 0.4, -0.6], t0: tA, dur: 0.4, scale: 1.3 })
      .add('dust', { world: [1.0, 0.1, -1.05], t0: tA - 0.27 + 0.87 - 2 * cyc, dur: tS - (tA - 2 * cyc), every: cyc, color: '#ffffff', edge: '#b8c4d4' })
      .add('exclaim', { obj: ch.root, bone: 'Head', offset: [0, 0.42, 0], t0: tA + 0.05, dur: 1.0, scale: 0.9 })
      .add('sparkle', { world: [0.62, 0.35, -0.72], t0: tA, dur: 3, n: 3, radius: 14 });
    const cam = camera({ p: [[-0.75, 0.42, 0.45], [-0.5, 0.48, 0.25]], l: [[1.25, 0.95, -1.25], [1.3, 0.95, -1.3]], fov: [46] });   // v2: low-angle medium (she towers over the dig)
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, segs, plan); scene.updateMatrixWorld(true);
      if (t < tS) shovelOnHands(ch, shovel);
      const r = holeR(t); grow(r, 0.4 + 0.6 * (r - 0.52) / 0.48); toss(t); sf(t); dress(t); cam.go(t, t0, t1);
    } };
  } });

  // ===== 2. "Humans called it... a toilet."  scan HUD on the porcelain
  S.push({ at: [1, 'Humans'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); digSite(scene);
    const ch = hero(scene, { p: [1.85, 0, -0.2], ry: -0.75 });
    const tF = ws(1, 'toilet');
    const segs = [seg('idle', -99, { loop: true }), seg('cheer', tF - 0.15, { fade: 0.12 })];
    const plan = [[-99, 'surprised', 'gasp'], [tF, 'hearts', 'smileOpen']];
    cue(t0 + 0.05, 'scan'); cue(tF, 'sting');
    const sf = L.snowfall(scene, { cx: 1, cz: 0, R: 8 });
    const fx = new FX(LW, LH).add('sparkle', { world: [0.62, 0.3, -0.72], t0: tF, dur: 3, n: 5, radius: 18 })
      .add('heart', { obj: ch.root, bone: 'Head', offset: [0.05, 0.3, 0], t0: tF + 0.1, dur: 1.6, n: 2 });
    const cam = camera({ p: [[2.2, 2.5, 1.5], [2.1, 2.35, 1.3]], l: [[0.9, 0.1, -0.6]], fov: [42] });   // v2: high 3/4 down into the pit
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt; if (t < t0 + 0.1) return;
        const p0 = L.toScreen(cam, 0.62, 0.25, -0.72), cx = p0[0], cy = p0[1], hw = 34, hh = 32;
        const col = t < tF ? '#7cf0ff' : '#fdd941'; hudBox(o, cx - hw, cy - hh, cx + hw, cy + hh, col);
        if (t < tF) { const sc = ((t - t0) * 1.6) % 1; o.tctx.fillStyle = col; o.tctx.fillRect(cx - hw + 3, Math.round(cy - hh + 2 * hh * sc), 2 * hw - 6, 1); }
        plateText(o, t < tF ? 'SCANNING' : ARTIFACT, cx, cy - hh - 15, { size: 14, border: col, fg: t < tF ? '#c8f8ff' : '#fff2a0', scale: t >= tF ? popS(t, tF) : 1 });
      } };
  } });

  // ===== 3. "If you dig a hole in the snow"  she digs the small hole (it grows each stroke, snow lands on a pile)
  S.push({ at: [2, 'If'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const { hg } = holeSite(scene, { noPile: true });
    const ry = -0.4, ch = hero(scene, { p: [0, 0, 0], ry }); const shovel = L.model('shovel', 1.15); scene.add(shovel);
    ch.pose(0, [still('dig', 15 / 30)], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true);
    const tip = shovelOnHands(ch, shovel).clone(); ch.root.position.set(HOLE.x - tip.x, 0, HOLE.z - tip.z);
    const cyc = 1.2, from = ((-(t0 + 99)) % cyc + cyc) % cyc, segs = [seg('dig', -99, { loop: true, from })];
    const left = V3([Math.cos(ry), 0, -Math.sin(ry)]), fwd = V3([Math.sin(ry), 0, Math.cos(ry)]);
    PILE = ch.root.position.clone().addScaledVector(left, 0.85).addScaledVector(fwd, 0.25);
    const pile = makePile(scene, PILE.x, PILE.z, 1);
    const starts = []; for (let k = 0; k < 6; k++) { const cs = t0 + k * cyc; if (cs < t1) starts.push(cs); }
    const prys = starts.map((cs) => cs + 0.47), tosses = starts.map((cs) => ({ t: cs + 0.87 })).filter((x) => x.t < t1 + 0.2);
    for (const tk of tosses) { ch.drive(tk.t, segs, [[-99, 'angry', 'shout']]); scene.updateMatrixWorld(true); tk.p = shovelOnHands(ch, shovel).clone(); }
    const grow = dynHole(scene, hg, HOLE.x, HOLE.z, HOLE.r, 0.5), toss = tossFX(scene, tosses, V3([PILE.x, 0.12, PILE.z]), pile);
    const holeR = (t) => { const n = prys.filter((x) => x <= t).length; return 0.08 + (HOLE.r - 0.08) * Math.min(1, (n + 0.5) / prys.length); };
    for (let k = 0; k < 6; k++) { const tp = t0 + 0.27 + k * cyc; if (tp < t1) cue(tp, 'shovel_snow'); const tt = t0 + 0.87 + k * cyc; if (tt < t1) cue(tt, 'snow_toss'); }
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 9 });
    const fx = new FX(LW, LH).add('dust', { world: [HOLE.x, 0.05, HOLE.z], t0: t0 + 0.87, dur: 9, every: cyc, color: '#ffffff', edge: '#b8c4d4', n: 6 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: t0 + 0.6, dur: 1.4 });
    const cam = camera({ p: [[1.65, 2.6, 3.5], [1.3, 2.6, 3.7]], l: [[1.1, 0.42, 0.1], [1.0, 0.42, 0.1]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, [[-99, 'angry', 'shout']]); scene.updateMatrixWorld(true); shovelOnHands(ch, shovel); const r = holeR(t); grow(r, r / HOLE.r); toss(t); sf(t); cam.go(t, t0, t1); } };
  } });

  // ===== 4. "and sit over it... you have a toilet."  HOOK: she squats over the hole (cold!), label TOILET
  S.push({ at: [2, 'and'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); holeSite(scene, { noPile: true });
    const dark = L.mesh(new THREE.CircleGeometry(HOLE.r * 0.95, 12), L.basic(null, 0x0c1018), HOLE.x, -0.03, HOLE.z, scene); dark.rotation.x = -Math.PI / 2;
    const ch = hero(scene, { p: [HOLE.x + 0.017, 0, HOLE.z + 0.047], ry: 0.35 }); ch.root.children.forEach((c) => { if (c.isMesh) c.scale.set(0.45, 0.35, 1); });
    const tSit = ws(2, 'sit'), tT = ws(2, 'toilet');
    const segs = [seg('idle', -99, { loop: true }), seg('squat', tSit - 0.25, { fade: 0.1 })];
    const plan = [[-99, 'happy', 'smileOpen'], [tSit + 0.3, 'shocked', 'bigShock'], [tSit + 1.1, 'half', 'frown'], [tT, 'relaxed', 'cat']];
    cue(tSit + 0.2, 'snow_step'); cue(tSit + 0.6, 'wind_gust'); cue(tT, 'label'); cue(tT + 0.05, 'ding');
    const sf = L.snowfall(scene, { cx: 0, cz: -1, R: 9 });
    const fx = new FX(LW, LH).add('shake', { obj: ch.root, bone: 'Chest', offset: [0, -0.1, 0.05], t0: tSit + 0.4, dur: 9, width: 50, height: 46, color: '#9cd8ff', scale: 1.3 })
      .add('steam', { obj: ch.root, bone: 'Head', offset: [0.04, -0.03, 0.18], t0: tSit + 0.5, dur: 9, every: 0.5, life: 0.8, rise: 14, drift: 8, color: '#e8f8ff', edge: '#9cc8e8' })
      .add('snow', { world: [HOLE.x, 0.3, HOLE.z], t0: tSit, dur: 9, n: 7, width: 60, height: 50, seed: 4, color: '#e8f8ff' })
      .add('wind', { world: [HOLE.x - 0.3, 0.6, HOLE.z], t0: tSit + 0.5, dur: 9, n: 3, width: 70 })
      .add('sparkle', { world: [HOLE.x, 0.05, HOLE.z + 0.3], t0: tT, dur: 4, n: 3, radius: 14, color: '#9cf0ff' });
    const cam = camera({ p: [[1.85, 2.7, 2.35], [1.75, 2.6, 2.2]], l: [[HOLE.x, 0.25, HOLE.z + 0.05]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const tip = L.toScreen(cam, HOLE.x + 0.1, 0.0, HOLE.z + 0.2); popLabel(o, t0 + lt, tT, 'TOILET', 80, 120, 18, tip); } };
  } });

  // ===== 5. "But the hole fills up..."  the pit fills with brown (clean cartoon), stink + flies; she pinches her nose
  S.push({ at: [3, 'But'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); holeSite(scene);
    const fill = L.mesh(new THREE.CircleGeometry(HOLE.r * 0.92, 12), L.basic(null, BROWN), HOLE.x, -0.45, HOLE.z, scene); fill.rotation.x = -Math.PI / 2;
    const lumps = [...Array(3)].map((_, i) => { const b = poop(0.55 + (i % 2) * 0.15); b.rotation.y = i * 0.7; b.position.set(HOLE.x + (i - 1) * 0.12, 0, HOLE.z + (i % 2 ? 0.06 : -0.04)); scene.add(b); return b; });
    const ch = hero(scene, { p: [HOLE.x - 0.75, 0, HOLE.z - 0.2], ry: 0.75 });
    const tF = ws(3, 'fills'), tU = ws(3, 'up');
    const segs = [seg('idle', -99, { loop: true }), seg('pinch_nose', tF - 0.1, { fade: 0.1 })];
    const plan = [[-99, 'surprised', 'gasp'], [tF + 0.25, 'disgust', 'disgust', false]];
    cue(t0 + 0.2, 'bubbling'); cue(tF, 'fly_buzz');
    const fx = new FX(LW, LH).add('stink', { world: [HOLE.x, 0.02, HOLE.z], t0: tF - 0.2, dur: 9, lines: 3 })
      .add('flies', { world: [HOLE.x, 0.35, HOLE.z], t0: tF, dur: 9, n: 4, radius: 16 })
      .add('bubbles', { world: [HOLE.x, 0.0, HOLE.z], t0, dur: 9, every: 0.35, color: '#c8a070' })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tU, dur: 1.5 });
    const cam = camera({ p: [[2.1, 1.55, 3.7], [1.95, 1.5, 3.4]], l: [[0.15, 0.6, 0.1]], fov: [36] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, segs, plan);
      const k = smooth((q15(t) - t0 - 0.1) / Math.max(0.6, tU + 0.4 - t0)); const y = -0.45 + 0.42 * k; fill.position.y = y;
      lumps.forEach((b, i) => { b.position.y = y - 0.01 + Math.sin(q15(t) * 3 + i) * 0.008; b.visible = k > 0.25 + i * 0.15; });
      cam.go(t, t0, t1);
    } };
  } });

  // ===== 6. "so humans built a little wooden shed over a deep pit."  ground cutaway: the shed pops together over the pit
  S.push({ at: [3, 'so'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); cutVillage(scene);
    const OX = 0.35, oh = outhouse(scene, { x: OX, z: -0.55, front: false });
    const pitW = 0.7, pitM = L.basic(null, 0x1c120a), pit = L.plane(pitW, 1, pitM, OX, -0.5, 0.004, scene);
    const goo = L.plane(pitW - 0.06, 0.22, L.basic(null, BROWN), OX, -1, 0.006, scene);
    const pits = [0, 1].map((i) => { const p = poop(0.7); p.position.set(OX + (i ? 0.16 : -0.12), -1, 0.08); scene.add(p); return p; });
    const tB = ws(3, 'built'), tLi = ws(3, 'little'), tWo = ws(3, 'wooden'), tSh = ws(3, 'shed'), tD = ws(3, 'deep'), tP = ws(3, 'pit');
    const pops = [tB, tLi, tWo, tWo + 0.12, tSh];   // seat, back, side L, side R, roof
    pops.forEach((tt) => cue(tt, 'wood_thud')); cue(tD, 'dig_down');
    const ch = hero(scene, { p: [-0.75, 0, -0.85], ry: 0.55 });
    const segs = [seg('idle', -99, { loop: true }), seg('point', tD - 0.4, { fade: 0.12 })];
    const plan = [[-99, 'happy', 'smileOpen'], [tD, 'open', 'smileOpen']];
    const fx = new FX(LW, LH);
    pops.forEach((tt, i) => fx.add('dust', { world: [OX + (i % 2 ? 0.4 : -0.4), 0.05, -0.55], t0: tt, dur: 0.6, n: 5, color: '#e8d8b8', edge: '#9a7a54', seed: 30 + i }));
    fx.add('arrow', { world: [OX + 0.55, -0.6, 0.05], t0: tD, dur: 9, angle: Math.PI / 2, len: 16, color: '#ffd93b', light: '#fff2a0', edge: '#5a3a00' })
      .add('stink', { world: [OX, -1.0, 0.05], t0: tP + 0.2, dur: 9, lines: 2 });
    const cam = camera({ p: [[0.1, 0.5, 7.0], [0.1, 0.45, 6.6]], l: [[0.1, 0.2, -0.4]], fov: [46] });
    return { scene, camera: cam, fx, update(lt, t) {
      const q = q15(t);
      oh.userData.parts.forEach((p, i) => { const tt = pops[i]; if (tt === undefined) return; const k = clamp01((q - tt) / 0.2); p.visible = q >= tt; p.scale.setScalar(q >= tt ? (k < 1 ? 0.7 + 0.45 * Math.sin(k * 2.2) : 1) : 1); });
      const d = 0.45 + 1.0 * smooth((q - tD) / 0.6); pit.scale.y = d; pit.position.y = -d / 2; goo.position.y = -d + 0.12; pits.forEach((p) => (p.position.y = -d + 0.05));
      ch.drive(t, segs, plan); cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tP) { const p = L.toScreen(cam, OX, -1.0, 0); plateText(o, 'DEEP PIT', p[0] + 40, p[1] + 34, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tP) }); } } };
  } });

  // ===== 7. "This is an outhouse."  OUTHOUSE: the finished shed, door swings open, she steps out smug; flies
  S.push({ at: [3, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); L.village(scene, { cz: -5, cx: -3.5 });
    const oh = outhouse(scene, { x: 0.3, z: -0.6, ry: -0.25, door: 0 });
    L.footprints(scene, 0.0, 0.2, -1.6, 3.5, 9);
    const ch = hero(scene, { p: [0.55, 0, 0.35], ry: 0.15 });
    const tO = ws(3, 'outhouse');
    const segs = [seg('hands_on_hips', t0 - 0.3), seg('smug', tO - 0.2, { fade: 0.12 })];
    const plan = [[-99, 'happy', 'smile'], [tO, 'wink', 'cat']];
    cue(t0 + 0.02, 'door_creak'); cue(tO, 'label'); cue(tO + 0.02, 'sting_small'); cue(t0 + 0.3, 'fly_buzz');
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 9 });
    const fx = new FX(LW, LH).add('flies', { world: [0.25, 2.3, -0.5], t0, dur: 9, n: 3, radius: 14 })
      .add('stink', { world: [0.2, 2.25, -0.3], t0, dur: 9, lines: 2 })
      .add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.12, 0.12, 0.15], t0: tO + 0.1, dur: 1.4, n: 3, radius: 9 });
    const cam = camera({ p: [[1.6, 1.25, 4.6], [1.5, 1.22, 4.3]], l: [[0.35, 1.05, -0.3]], fov: [38] });
    return { scene, camera: cam, fx, update(lt, t) {
      oh.userData.door.rotation.y = -1.9 * smooth((q15(t) - t0) / 0.35);
      ch.drive(t, segs, plan); sf(t); cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const p = L.toScreen(cam, 0.3, 2.3, -0.6); popLabel(o, t0 + lt, tO, 'OUTHOUSE', 135, Math.max(56, p[1] - 56), 22, p); } };
  } });

  // ===== 8. "At night, nobody wanted to walk outside in the cold..."  night village, she shivers at her door
  S.push({ at: [4, 'At'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.mailSet(scene);
    const far = outhouse(scene, { x: 4.2, z: -9, ry: -0.6, door: 0 });
    L.footprints(scene, 0.8, -1.3, 3.8, -8.0, 14);
    const ch = hero(scene, { p: [0.4, 0, -1.55], ry: -0.3 });
    const tC = ws(4, 'cold'), tW = ws(4, 'walk');
    cue(t0 + 0.1, 'night_wind'); cue(tC, 'teeth_chatter');
    grade(scene, [0.13, 0.16, 0.38], { lit: true, skip: isHero(ch) }); grade(ch.root, [0.4, 0.44, 0.66]);
    scene.background = L.cvs(1, LH, (c) => { for (let y = 0; y < LH; y++) { const k = Math.min(1, y / (0.62 * LH)); c.fillStyle = `rgb(${[10 + 34 * k, 14 + 40 * k, 38 + 58 * k].map(Math.round)})`; c.fillRect(0, y, 1, 1); } });
    scene.fog.color.set(0x2c3660);
    const sf = L.snowfall(scene, { cx: 0, cz: -1, R: 9, n: 1400 });
    const fx = new FX(LW, LH).add('shake', { obj: ch.root, bone: 'Chest', offset: [0, -0.05, 0.05], t0: t0 + 0.2, dur: 9, width: 44, height: 44, color: '#9cd8ff', scale: 1.5 })
      .add('steam', { obj: ch.root, bone: 'Head', offset: [0.03, -0.02, 0.2], t0: t0 + 0.2, dur: 9, every: 0.45, life: 0.8, rise: 14, drift: 8, color: '#e8f8ff', edge: '#9cc8e8' })
      .add('wind', { obj: ch.root, bone: 'Chest', offset: [0.6, 0.2, 0.2], t0: tW, dur: 9, n: 3, width: 80 })
      .add('snow', { obj: ch.root, bone: 'Chest', offset: [0, 0.1, 0.1], t0: tC, dur: 9, n: 8, width: 70, height: 70 })
      .add('thought', { obj: ch.root, bone: 'Head', offset: [0, 0.3, 0], t0: tW, dur: 9, icon: 'question', dx: 30, dy: -10 });
    const cam = camera({ p: [[-1.3, 1.35, 3.3], [-1.15, 1.32, 3.0]], l: [[1.2, 1.0, -3.0]], fov: [36] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('shiver', -99, { loop: true })], [[-99, 'sad', 'frown'], [tC, 'shocked', 'bigShock']]); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { sky(o, 'moon', 205, 60, lt); } };
  } });

  // ===== 9. "so they kept a pot under the bed."  bedroom at night: she kneels, the chamber pot slides out from under the bed
  S.push({ at: [4, 'so'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); bedroom(scene);
    const pot = chamberPot({ lid: true }); scene.add(pot);
    const ch = hero(scene, { p: [0.35, 0, 0.25], ry: -1.25 });
    const tP = ws(4, 'pot'), tB = ws(4, 'bed');
    const segs = [seg('idle', -99, { loop: true }), seg('kneel', t0 - 0.1, { fade: 0.1 })];
    const plan = [[-99, 'half', 'neutral'], [tP, 'happy', 'smileOpen']];
    cue(tP - 0.1, 'pot_slide'); cue(tP + 0.3, 'ceramic_clink'); cue(t0 + 0.1, 'night_crickets');
    grade(scene, [0.22, 0.24, 0.44], { lit: true, skip: isHero(ch) }); grade(ch.root, [0.5, 0.52, 0.72]);
    const fx = new FX(LW, LH).add('sparkle', { target: pot, offset: [0, 0.25, 0], t0: tP + 0.3, dur: 9, n: 3, radius: 12 })
      .add('exclaim', { obj: ch.root, bone: 'Head', offset: [0, 0.4, 0], t0: tP + 0.2, dur: 1.2, scale: 0.8 });
    const cam = camera({ p: [[-1.2, 1.3, 2.4], [-1.1, 1.27, 2.2]], l: [[0.12, 0.42, -0.1]], fov: [42] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, segs, plan);
      const k = smooth((q15(t) - (tP - 0.2)) / 0.6); pot.position.set(-0.4 + 0.35 * k, 0, -0.6 + 0.55 * k);
      cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const p = L.toScreen(cam, 1.6, 2.1, -1.57); sky(o, 'moon', p[0], p[1], lt); } };
  } });

  // ===== 10. "This is a chamber pot."  detail: the lid pops, stink + flies, label CHAMBER POT
  S.push({ at: [4, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); bedroom(scene);
    const pot = chamberPot({ lid: true, full: true }); pot.position.set(0.2, 0, 0.0); pot.scale.setScalar(1.15); scene.add(pot);
    grade(scene, [0.32, 0.34, 0.56], { lit: true });
    const tC = ws(4, 'chamber'); cue(t0 + 0.15, 'lid_rattle'); cue(tC, 'label'); cue(tC + 0.1, 'fly_buzz');
    const fx = new FX(LW, LH).add('stink', { target: pot, offset: [0, 0.25, 0], t0: t0 + 0.35, dur: 9, lines: 3 })
      .add('flies', { target: pot, offset: [0, 0.4, 0], t0: t0 + 0.5, dur: 9, n: 3, radius: 18 })
      .add('sparkle', { target: pot, offset: [0.1, 0.1, 0.1], t0: tC, dur: 2, n: 2, radius: 14 });
    const cam = camera({ p: [[0.75, 0.55, 1.35], [0.7, 0.52, 1.2]], l: [[0.15, 0.17, 0.0]], fov: [34] });
    return { scene, camera: cam, fx, update(lt, t) {
      const k = clamp01((q15(t) - t0 - 0.15) / 0.25), lid = pot.userData.lid; lid.rotation.z = 1.1 * k; pot.userData.poop.visible = k > 0.5; lid.position.y = 0.19 + 0.06 * Math.sin(Math.PI * Math.min(1, k * 1.4));
      cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const p = L.toScreen(cam, 0.2, 0.24, 0); popLabel(o, t0 + lt, tC, 'CHAMBER POT', 135, Math.max(64, p[1] - 140), 20, p); } };
  } });

  // the street/window throw: the dump frame is set by the word "threw"; contents launch from the pot lip
  const tThrow = ws(5, 'threw'), THROW_REL = 21 / 30, tDump = tThrow + 0.08, tThrowStart = tDump - THROW_REL;
  function potInHands(ch, pot, t) {   // pot carried between both fists, tipping forward from the dump
    const a = ch.fist('L'), b = ch.fist('R'); pot.position.copy(a).add(b).multiplyScalar(0.5).add(V3([0, -0.1, 0.06]));
    const tip = smooth((t - tDump + 0.1) / 0.25); pot.rotation.set(tip * 1.9, 0, 0);
  }
  // ===== 11. "And in the morning... they threw it out the window."  morning, she leans out of the window and dumps the pot
  S.push({ at: [5, 'And'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const { shutters } = streetSet(scene);
    const ch = streetHero(scene); const pot = chamberPot({ full: true }); scene.add(pot);
    const segs = [still('throw_out_window', 0), seg('throw_out_window', tThrowStart)];
    const plan = [[-99, 'happy', 'smileOpen'], [ws(5, 'morning') + 0.3, 'angry', 'shout'], [tDump + 0.1, 'happy', 'smileOpen']];
    const blobs = [...Array(3)].map((_, i) => { const b = poop(0.7 + (i % 2) * 0.2); scene.add(b); b.visible = false; return b; });
    cue(t0 + 0.05, 'rooster'); cue(t0, 'shutters'); cue(tThrowStart + 0.25, 'swing_whoosh'); cue(tDump, 'slosh');
    let p0 = null;
    const fx = new FX(LW, LH).add('sparkle', { world: [0, 3.8, 0.4], t0, dur: 1.2, n: 3, radius: 16 });
    const cam = camera({ p: [[1.1, 2.45, 3.0], [1.0, 2.5, 2.7]], l: [[0, 2.95, -0.1]], fov: [38] });
    return { scene, camera: cam, fx, update(lt, t) {
      const q = q15(t); const so = smooth((q - t0 + 0.25) / 0.35); shutters.forEach((s, i) => (s.rotation.y = (i ? 1 : -1) * 1.75 * so)); pot.visible = so > 0.6;
      ch.drive(t, segs, plan); scene.updateMatrixWorld(true); potInHands(ch, pot, q);
      pot.userData.stuff.visible = q < tDump + 0.05; pot.userData.poop.visible = q < tDump + 0.02;
      if (q >= tDump && !p0) p0 = pot.localToWorld(V3([0, 0.19, 0.1]));
      blobs.forEach((b, i) => {
        if (!p0 || q < tDump) { b.visible = false; return; }
        const d = q - tDump - i * 0.02; if (d < 0) { b.visible = false; return; }
        b.visible = true; b.position.set(p0.x + (hash(i) - 0.5) * 0.5 * d * 3, p0.y + 1.2 * d - 4.9 * d * d, p0.z + (1.4 + hash(i + 4)) * d); b.rotation.set(d * 5 + i, d * 3, 0);
      });
      cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { sky(o, 'sun', 220, 52, lt); } };
  } });

  // ===== 12. "Into the street."  from the street, looking up: the contents fall down the facade and splat on the cobbles
  S.push({ at: [5, 'Into'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const { shutters } = streetSet(scene); shutters.forEach((s, i) => (s.rotation.y = (i ? 1 : -1) * 1.75));
    const ch = streetHero(scene); const pot = chamberPot(); scene.add(pot);
    const tS = ws(5, 'street'), tFall = tS - 0.62;
    const blobs = [...Array(3)].map((_, i) => { const b = poop(1.0 + (i % 2) * 0.3); scene.add(b); return b; });
    const puddle = L.mesh(new THREE.CircleGeometry(0.4, 12), L.basic(null, BROWN, { polygonOffset: true, polygonOffsetFactor: -2 }), 0.1, 0.008, 1.0, scene); puddle.rotation.x = -Math.PI / 2;
    cue(tFall, 'fall_whistle'); cue(tS - 0.02, 'splat');
    const fx = new FX(LW, LH).add('splat', { world: [0.1, 0.02, 1.0], t0: tS, dur: 9, scale: 1.4 })
      .add('stink', { world: [0.1, 0.05, 1.0], t0: tS + 0.3, dur: 9, lines: 3 })
      .add('impact', { world: [0.1, 0.05, 1.0], t0: tS, dur: 0.35, scale: 1.2, color: '#c8a070' });
    const cam = camera({ p: [[1.7, 0.9, 6.6], [1.6, 0.85, 6.2]], l: [[0.0, 1.8, 0.5]], fov: [44], shake: [tS, 0.25, 0.04] });
    return { scene, camera: cam, fx, update(lt, t) {
      const q = q15(t); ch.drive(t, [still('throw_out_window', 1.0)], [[-99, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true);
      const a = ch.fist('L'), b = ch.fist('R'); pot.position.copy(a).add(b).multiplyScalar(0.5).add(V3([0, -0.1, 0.06])); pot.rotation.set(1.9, 0, 0);
      blobs.forEach((bb, i) => {
        const d = q - tFall - i * 0.03; const y = 3.2 - 0.5 * 9.8 * Math.max(0, d) * Math.max(0, d) * 1.18;
        bb.visible = d >= 0; bb.position.set(0.1 + (i - 1) * 0.22, Math.max(0.01, y), 0.5 + 0.8 * clamp01(d / 0.6) + (i - 1) * 0.08); bb.rotation.set(y > 0.02 ? d * 6 : 0, i, 0);
      });
      const k = clamp01((q - tS) / 0.2); puddle.visible = q >= tS; puddle.scale.setScalar(0.3 + 0.7 * k);
      cam.go(t, t0, t1);
    } };
  } });

  // ===== 13. "Where people were walking."  street level: passers-by; a blob lands on one of them (splat, stink, flies)
  S.push({ at: [5, 'Where'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const { shutters } = streetSet(scene); shutters.forEach((s, i) => (s.rotation.y = (i ? 1 : -1) * 1.75));
    const A = npc('bank_teller', 'bank_teller', 'navy'), B = npc('homework_girl', 'homework_girl', 'red'), Cn = npc('art_student', 'art_student', 'teal');
    for (const n of [A, B, Cn]) scene.add(n);
    const tHit = ws(5, 'walking') + 0.05, hitX = 0.25;
    const hat = poop(1.25); scene.add(hat); hat.visible = false;   // v2: the poop lands on his head like a hat
    const drop = poop(1.25); scene.add(drop);
    const puddle = L.mesh(new THREE.CircleGeometry(0.4, 12), L.basic(null, BROWN, { polygonOffset: true, polygonOffsetFactor: -2 }), 0.1, 0.008, 1.0, scene); puddle.rotation.x = -Math.PI / 2;
    cue(t0 + 0.1, 'footsteps'); cue(tHit - 0.02, 'splat'); cue(tHit + 0.15, 'yelp');
    const fx = new FX(LW, LH).add('splat', { target: hat, offset: [0, 0.02, 0], t0: tHit, dur: 0.5, scale: 1.2 })
      .add('stink', { target: hat, offset: [0, 0.05, 0], t0: tHit + 0.1, dur: 9, lines: 3 })
      .add('flies', { target: hat, offset: [0, 0.2, 0], t0: tHit + 0.3, dur: 9, n: 3, radius: 14 })
      .add('exclaim', { target: hat, offset: [0.25, 0.35, 0], t0: tHit + 0.05, dur: 9, scale: 0.8 })
      .add('anger', { target: hat, offset: [-0.2, 0.15, 0], t0: tHit + 0.35, dur: 9, scale: 1.0 })
      .add('exclaim', { target: Cn, offset: [0, 1.9, 0], t0: tHit + 0.2, dur: 9, scale: 0.7 });
    const cam = camera({ p: [[0.15, 1.5, 7.6], [0.1, 1.48, 7.2]], l: [[0.15, 1.1, 1.0]], fov: [46], shake: [tHit, 0.2, 0.03] });
    return { scene, camera: cam, fx, update(lt, t) {
      const q = q15(t);
      const walkA = Math.min(q, tHit) - t0;   // A walks until hit, then freezes and shudders
      A.position.set(hitX - 0.75 * (tHit - t0) + 0.75 * walkA, 0, 1.25); A.rotation.y = Math.PI / 2; A.walk(walkA * 1.6, q < tHit ? 1 : 0);
      if (q >= tHit) A.position.x += (Math.floor(q * 15) % 2 ? 0.015 : -0.015);
      B.position.set(0.95 + 0.45 * (q - t0), 0, 0.35); B.rotation.y = Math.PI / 2; B.walk((q - t0) * 0.9 + 0.3);
      const stopC = q >= tHit + 0.2; Cn.position.set(-1.85 + 0.6 * (Math.min(q, tHit + 0.2) - t0), 0, 0.75); Cn.rotation.y = stopC ? Math.PI / 2 + 0.6 : Math.PI / 2; Cn.walk((Math.min(q, tHit + 0.2) - t0) * 1.4 + 0.6, stopC ? 0 : 1);
      scene.updateMatrixWorld(true);
      const head = A.localToWorld(V3([0, 1.68, 0])); const d = q - (tHit - 0.45);
      drop.visible = d >= 0 && q < tHit; drop.position.set(head.x, head.y + 4.9 * Math.max(0, 0.45 - Math.max(0, d)) ** 2 * 4.4, head.z);
      hat.visible = q >= tHit; hat.position.copy(head).add(V3([0, -0.04, 0])); hat.rotation.y = 0.3; drop.rotation.set(Math.max(0, d) * 6, 0, 0);
      puddle.visible = true; cam.go(t, t0, t1);
    } };
  } });

  // ===== 14. "Gross."  hard cut: her disgusted reaction at the window; tongue out, head shake, green stink, shake
  S.push({ at: [6, 'Gross'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const { shutters } = streetSet(scene); shutters.forEach((s, i) => (s.rotation.y = (i ? 1 : -1) * 1.75));
    const ch = streetHero(scene); ch.root.position.z = -0.25;
    const tG = ws(6, 'gross');
    cue(tG, 'gross'); cue(tG, 'punch');
    const fx = new FX(LW, LH).add('stink', { obj: ch.root, bone: 'Head', offset: [0.22, -0.1, 0.12], t0: tG, dur: 9, lines: 3 })
      .add('stink', { obj: ch.root, bone: 'Head', offset: [-0.22, -0.1, 0.1], t0: tG + 0.15, dur: 9, lines: 2 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.12, 0.2, 0.08], t0: tG + 0.1, dur: 1.5 })
      .add('flies', { obj: ch.root, bone: 'Head', offset: [-0.25, 0.25, 0.1], t0: tG + 0.4, dur: 9, n: 2, radius: 10 })
      .add('impact', { obj: ch.root, bone: 'Head', offset: [0, 0.1, 0.1], t0: tG, dur: 0.35, scale: 1.6, color: '#c8f080' });
    const hd = V3([0, 1.825 + 1.38, -0.25]);
    const cam = camera({ p: [hd.clone().add(V3([0.2, 0.0, 2.7])).toArray(), hd.clone().add(V3([0.2, 0.0, 2.5])).toArray()], l: [hd.clone().add(V3([0, -0.2, 0])).toArray()], fov: [32], shake: [tG, 0.3, 0.035] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('shake_head', tG - 0.05)], [[-99, 'disgust', 'disgust']], false); cam.go(t, t0, t1); } };
  } });

  // ===== 15. "So a man named John Harington built a seat with a water tank above it."  1596 room; she presents the toilet
  S.push({ at: [7, 'So'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); tudorRoom(scene); const ht = haringtonToilet(scene, { x: -0.3, z: -0.25 });
    const ch = hero(scene, { p: [0.45, 0, 0.15], ry: -0.45 });
    scene.updateMatrixWorld(true); ch.pose(0, [still('pull_chain', 11 / 30)], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true);
    const grab = ch.fist('R').clone(); ht.userData.hang(grab.x, grab);
    const tH = ws(7, 'Harington'), tSe = ws(7, 'seat'), tTa = ws(7, 'tank');
    const segs = [seg('idle', -99, { loop: true }), seg('present', tSe - 0.3, { fade: 0.12 })];
    const plan = [[-99, 'open', 'smileOpen'], [tTa, 'happy', 'smileOpen']];
    cue(tH, 'blip'); cue(tSe, 'wood_knock'); cue(tTa, 'tank_slosh');
    const fx = new FX(LW, LH).add('sparkle', { world: ht.userData.tankW().toArray(), t0: tTa, dur: 9, n: 4, radius: 22, color: '#bff4ff' })
      .add('arrow', { world: [-0.35, 0.95, -0.2], t0: tSe, dur: 9, angle: Math.PI / 2, len: 14, color: '#ffd93b', light: '#fff2a0', edge: '#5a3a00' });
    const cam = camera({ p: [[0.75, 1.35, 4.4], [0.65, 1.32, 4.1]], l: [[0.05, 0.95, -0.3]], fov: [44], jumps: [{ t: tTa, p: [[0.8, 1.8, 3.9], [0.75, 1.8, 3.75]], l: [[0.15, 1.45, -0.4]], fov: [44] }] });
    cue(tTa, 'punch');
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt;
        if (t >= tH) plateText(o, 'J. HARINGTON 1596', 135, 46, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tH) });
        if (t >= tSe && t < tTa) { const p = L.toScreen(cam, -0.35, 0.5, -0.35); plateText(o, 'SEAT', p[0], p[1] + 26, { size: 12, border: '#c8a050', fg: '#ffe8b0', scale: popS(t, tSe) }); }
        if (t >= tTa) { const p = L.toScreen(cam, -0.35, 2.28, -0.55); plateText(o, 'WATER TANK', p[0], p[1] - 18, { size: 14, border: '#7cc0ff', fg: '#dff4ff', scale: popS(t, tTa) }); }
      } };
  } });

  // ===== 16. "Pull the handle... and the water flushes everything away."  she pulls the chain: water gushes, swirl
  const tPull = ws(7, 'Pull'), tPullStart = tPull - 10 / 30;
  S.push({ at: [7, 'Pull'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); tudorRoom(scene); const ht = haringtonToilet(scene, { x: -0.3, z: -0.25 });
    const ch = hero(scene, { p: [0.45, 0, 0.15], ry: -0.45 });
    scene.updateMatrixWorld(true); ch.pose(0, [still('pull_chain', 11 / 30)], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true);
    const rest = ch.fist('R').clone(), tipX = rest.x;
    const tDown = tPullStart + 18 / 30, tRel = tPullStart + 26 / 30, tFl = ws(7, 'flushes');
    const segs = [seg('idle', -99, { loop: true }), seg('pull_chain', tPullStart, { fade: 0.08 })];
    const plan = [[-99, 'open', 'smileOpen'], [tPull, 'angry', 'shout'], [tDown + 0.2, 'happy', 'smileOpen'], [tFl, 'surprised', 'talkO']];
    const lump = poop(0.7); scene.add(lump); const hw = ht.userData.holeW();
    const drops = [...Array(14)].map((_, i) => { const o = L.mesh(new THREE.BoxGeometry(0.035, 0.06, 0.035), L.basic(null, i % 3 ? 0x6cc4ff : 0xe8f8ff), 0, 0, 0, scene); o.visible = false; return o; });
    const tank = ht.userData.tankW(), pipeTop = V3([tank.x, 1.86, tank.z - 0.04]), pipeBot = V3([hw.x, 0.5, hw.z - 0.25]);
    cue(tPull - 0.05, 'chain'); cue(tDown, 'flush'); cue(tDown + 0.05, 'tank_gush');
    const fx = new FX(LW, LH).add('swirl', { world: hw.toArray(), t0: tDown + 0.25, dur: 9, life: 2.2, radius: 20 })
      .add('splash', { world: hw.toArray(), t0: tDown + 0.2, dur: 9, every: 0.5, n: 8, scale: 0.8 })
      .add('sparkle', { world: hw.toArray(), t0: tFl + 0.6, dur: 9, n: 3, radius: 16, color: '#bff4ff' });
    const cam = camera({ p: [[1.0, 1.9, 3.4], [0.9, 1.85, 3.15]], l: [[-0.05, 0.95, -0.3]], fov: [44] });
    const hp = new THREE.Vector3();
    return { scene, camera: cam, fx, update(lt, t) {
      const q = q15(t); ch.drive(t, segs, plan); scene.updateMatrixWorld(true);
      const held = q >= tPullStart + 9 / 30 && q < tRel; ch.fist('R', hp);
      const handle = held ? hp : rest.clone().add(V3([0, Math.max(0, 0.04 * Math.sin((q - tRel) * 18) * Math.exp(-(q - tRel) * 4)), 0]));
      ht.userData.hang(tipX, handle);
      const kk = clamp01((q - tDown - 0.25) / 1.8); lump.position.set(hw.x + Math.cos(q * 9) * 0.06 * (1 - kk), 0.5 - 0.06 * kk, hw.z + Math.sin(q * 9) * 0.03 * (1 - kk)); lump.rotation.y = q * 9 * kk; lump.scale.setScalar(Math.max(0.01, 0.7 * (1 - kk))); lump.visible = kk < 0.98;
      drops.forEach((o, i) => { const d = q - tDown - i * 0.05; const u = (d % 0.35) / 0.35; o.visible = d >= 0 && q < tDown + 1.6; o.position.copy(pipeTop).lerp(pipeBot, u); o.position.x += (hash(i) - 0.5) * 0.02; });
      cam.go(t, t0, t1);
    } };
  } });

  // ===== 17. "This is a flush toilet."  wide, she cheers, label FLUSH TOILET
  S.push({ at: [7, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); tudorRoom(scene); const ht = haringtonToilet(scene, { x: -0.3, z: -0.25 });
    const ch = hero(scene, { p: [0.55, 0, 0.3], ry: -0.2 });
    scene.updateMatrixWorld(true); ch.pose(0, [still('pull_chain', 11 / 30)], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true);
    const rest = ch.fist('R').clone(); ht.userData.hang(rest.x, rest);
    const tF = ws(7, 'flush'); cue(tF, 'label'); cue(tF + 0.05, 'sting');
    const hw = ht.userData.holeW();
    const fx = new FX(LW, LH).add('sparkle', { world: hw.toArray(), t0: tF, dur: 9, n: 5, radius: 22 })
      .add('swirl', { world: hw.toArray(), t0: t0 - 0.5, dur: 9, life: 1.5, radius: 16 })
      .add('heart', { obj: ch.root, bone: 'Head', offset: [0, 0.32, 0], t0: tF + 0.1, dur: 9, n: 2 });
    const cam = camera({ p: [[0.4, 1.5, 4.9], [0.4, 1.45, 4.5]], l: [[0.05, 1.0, -0.2]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('cheer', tF - 0.2)], [[-99, 'happy', 'smileOpen']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const p = L.toScreen(cam, -0.35, 0.55, -0.3); popLabel(o, t0 + lt, tF, 'FLUSH TOILET', 135, Math.max(56, p[1] - 150), 20, p); } };
  } });

  // ===== 18. "But the pipe went straight down to the sewer..."  house section: straight drain into the brick sewer
  S.push({ at: [8, 'But'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const st = sectionSet(scene);
    const tSt = ws(8, 'straight'), tSw = ws(8, 'sewer');
    const items = [...Array(8)].map((_, i) => { const o = i % 3 ? L.mesh(new THREE.BoxGeometry(0.05, 0.08, 0.05), L.basic(null, 0x6cc4ff), 0, 0, 0, scene) : poop(0.45); scene.add(o); o.visible = false; return o; });
    cue(t0 + 0.2, 'drain_gurgle'); cue(tSw, 'sewer_flow');
    const fx = new FX(LW, LH).add('arrow', { world: [0.35, -0.9, 0], t0: tSt, dur: 9, angle: Math.PI / 2, len: 18, color: '#ffd93b', light: '#fff2a0', edge: '#5a3a00' })
      .add('bubbles', { world: [0.2, -2.7, 0.05], t0: tSw, dur: 9, every: 0.3, color: '#c8a070' });
    const cam = camera({ p: [[0.0, -0.3, 6.4], [0.0, -0.35, 6.0]], l: [[0.0, -1.05, 0]], fov: [46] });
    return { scene, camera: cam, fx, update(lt, t) {
      const q = q15(t); st.wtex.offset.x = -q * 0.6;
      items.forEach((o, i) => { const d = q - tSt + 0.3 - i * 0.18; const u = ((d % 1.1) + 1.1) % 1.1 / 1.1; o.visible = d >= 0; o.position.set((hash(i) - 0.5) * 0.08, 0.1 - 2.2 * u, 0.17); });
      cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) {
      const t = t0 + lt;
      if (t >= tSt) { const p = L.toScreen(cam, 0, -0.95, 0); plateText(o, 'PIPE', p[0] - 50, p[1], { size: 12, border: '#9aa0aa', fg: '#e8ecf2', scale: popS(t, tSt) }); }
      if (t >= tSw) { const p = L.toScreen(cam, 0, -2.55, 0); plateText(o, 'SEWER', p[0], p[1] + 54, { size: 14, border: '#c8a070', fg: '#ffe8c8', scale: popS(t, tSw) }); }
    } };
  } });

  // ===== 19. "and the sewer breathed back up."  closer: green sewer gas climbs the pipe and billows out of the seat
  S.push({ at: [8, 'and'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const st = sectionSet(scene);
    const tBr = ws(8, 'breathed'), tUp = ws(8, 'up');
    const puffs = [...Array(9)].map((_, i) => { const o = L.mesh(new THREE.IcosahedronGeometry(0.06 + (i % 3) * 0.015, 0), L.basic(null, GAS), 0, 0, 0, scene); o.visible = false; return o; });
    cue(t0 + 0.05, 'sewer_bubble'); cue(tBr, 'gas_hiss'); cue(tUp, 'whoosh_up');
    const top = st.ht.userData.holeW();
    const fx = new FX(LW, LH).add('steam', { world: top.toArray(), t0: tUp - 0.2, dur: 9, every: 0.12, life: 1.3, rise: 60, drift: 10, color: '#a8e070', edge: '#5a9a2a', scale: 1.6 })
      .add('stink', { world: [top.x, top.y + 0.2, top.z], t0: tUp, dur: 9, lines: 4, rise: 60 })
      .add('arrow', { world: [0.35, -1.2, 0], t0: tBr - 0.2, dur: 9, angle: -Math.PI / 2, len: 18, color: '#82c948', light: '#d0f0a0', edge: '#1a3a08' });
    const cam = camera({ p: [[0.2, 0.2, 4.0], [0.2, 0.3, 3.7]], l: [[0.0, -0.35, 0]], fov: [44], shake: [tUp, 0.4, 0.02] });
    return { scene, camera: cam, fx, update(lt, t) {
      const q = q15(t); st.wtex.offset.x = -q * 0.6;
      puffs.forEach((o, i) => { const d = q - (tBr - 0.5) - i * 0.15; const u = ((d % 1.2) + 1.2) % 1.2 / 1.2; o.visible = d >= 0; o.position.set(Math.sin(q * 6 + i) * 0.04, -1.9 + 2.0 * u, 0.17); o.scale.setScalar(0.7 + 0.6 * u); });
      cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tBr) { const p = L.toScreen(cam, 0, -1.1, 0); plateText(o, 'SEWER GAS', p[0] + 62, p[1] - 70, { size: 14, border: '#82c948', fg: '#e0ffc0', scale: popS(t, tBr) }); } } };
  } });

  // ===== 20. "The whole house smelled."  the Harington room in a green haze; she pinches her nose, flies everywhere
  S.push({ at: [8, 'The', 4], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); tudorRoom(scene); const ht = haringtonToilet(scene, { x: -0.3, z: -0.25 });
    const ch = hero(scene, { p: [0.4, 0, 0.35], ry: -0.15 });
    scene.updateMatrixWorld(true); ch.pose(0, [still('pull_chain', 11 / 30)], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true);
    const rest = ch.fist('R').clone(); ht.userData.hang(rest.x, rest);
    grade(scene, [0.55, 0.85, 0.35], { skip: isHero(ch) }); scene.fog = new THREE.Fog(0x7a9a40, 1.5, 9);
    const tS = ws(8, 'smelled'); cue(t0 + 0.05, 'fly_buzz'); cue(tS, 'gag');
    const hw = ht.userData.holeW();
    const fx = new FX(LW, LH).add('steam', { world: hw.toArray(), t0: t0 - 1, dur: 9, every: 0.2, life: 1.4, rise: 50, color: '#a8e070', edge: '#5a9a2a', scale: 1.3 })
      .add('stink', { obj: ch.root, bone: 'Head', offset: [0.25, 0.0, 0.1], t0: t0, dur: 9, lines: 3 })
      .add('stink', { world: [-1.3, 1.6, -0.5], t0, dur: 9, lines: 3, seed: 5 }).add('stink', { world: [1.5, 1.2, -0.5], t0: t0 + 0.2, dur: 9, lines: 3, seed: 9 })
      .add('flies', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0.1], t0: t0 + 0.2, dur: 9, n: 4, radius: 22 })
      .add('flies', { world: hw.toArray(), t0, dur: 9, n: 3, radius: 18, seed: 3 });
    const cam = camera({ p: [[0.6, 1.4, 3.6], [0.55, 1.38, 3.3]], l: [[0.1, 1.05, -0.2]], fov: [38] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('idle', -99, { loop: true }), seg('pinch_nose', t0 - 0.1, { fade: 0.1 })], [[-99, 'disgust', 'disgust', false]]); cam.go(t, t0, t1); } };
  } });

  // ===== 21. "Operator Jake asks: Why doesn't my bathroom smell like a sewer?"  COMMENT at the mailbox
  S.push({ at: [9, 'Operator'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.mailSet(scene);
    const ch = hero(scene, { p: [0, 0, 0.75], ry: -0.1 });
    const lt0 = L.holdIn(ch, L.letter(), 'R', [0, 1.4, 0.6], [0.2, 0, Math.PI / 2]); lt0.scale.multiplyScalar(1.5);
    const tJ = ws(9, 'Jake'), tWhy = ws(9, 'Why'), tQ = ws(9, 'sewer');
    cue(t0 + 0.15, 'mailbox_creak'); cue(t0 + 0.4, 'paper'); cue(tJ, 'comment_pop'); cue(tWhy, 'punch');
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 9 });
    const fx = new FX(LW, LH).add('sparkle', { world: [-0.72, 1.15, 0.45], t0, dur: 9, n: 3, radius: 10, seed: 3 })
      .add('question', { obj: ch.root, bone: 'Head', offset: [-0.12, 0.42, 0], t0: tQ, dur: 9, scale: 0.8 });
    const cam = camera({ p: [[-0.3, 1.3, 6.0], [-0.3, 1.3, 5.7]], l: [[-0.3, 1.12, 0.4]], fov: [33], jumps: [{ t: tWhy, p: [[-0.15, 1.38, 4.6], [-0.15, 1.38, 4.4]], l: [[-0.15, 1.2, 0.5]], fov: [33] }] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('phone_look', t0 - 0.45)], [[-99, 'surprised', 'talkO'], [tQ, 'surprised', 'gasp']]); sf(t); L.upright(lt0, 0); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tJ) sticker(o, t - tJ, { user: 'operator_jake', lines: ["why doesn't my bathroom", 'smell like a sewer?'] }); } };
  } });

  // ===== 22. "Jake... look behind your toilet."  close-up: she points behind, wink
  S.push({ at: [9, 'Jake', 2], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); L.mailSet(scene);
    const ch = hero(scene, { p: [0, 0, 0.75], ry: -0.1 });
    const tL = ws(9, 'look'), tT = ws(9, 'toilet');
    const segs = [seg('idle', -99, { loop: true }), seg('point', tL - 0.35, { fade: 0.1 })];
    const plan = [[-99, 'open', 'smile'], [tL, 'open', 'smileOpen'], [tT, 'wink', 'cat']];
    cue(tT + 0.1, 'wink_ting'); cue(tL, 'whoosh_small');
    const fx = new FX(LW, LH).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.12, 0.12, 0.15], t0: tT + 0.1, dur: 1.4, n: 3, radius: 9 })
      .add('arrow', { obj: ch.root, bone: 'Head', offset: [0.0, -0.25, 0.1], dx: 70, t0: tL + 0.1, dur: 9, angle: 0, len: 16, color: '#ffd93b', light: '#fff2a0', edge: '#5a3a00' });
    const cam = camera({ p: [[0.25, 1.5, 3.1], [0.22, 1.5, 2.95]], l: [[0.08, 1.25, 0.75]], fov: [26] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, plan); cam.go(t, t0, t1); } };
  } });

  // ===== 23. "In 1775,"  the watchmaker's bench: 1775 pops, the watch ticks, gears turn
  S.push({ at: [10, 'In'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const ws_ = workshop(scene);
    const ch = hero(scene, { p: [0.0, 0, -0.45], ry: 0 });
    const tY = ws(10, '1775'); cue(t0 + 0.1, 'ticking'); cue(tY, 'sting_small');
    const fx = new FX(LW, LH).add('sparkle', { world: [0.3, 0.9, 0.25], t0: tY, dur: 9, n: 3, radius: 12 });
    const cam = camera({ p: [[0.25, 1.6, 2.5], [0.22, 1.58, 2.3]], l: [[0.05, 1.1, -0.2]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [seg('think', t0 - 0.2)], [[-99, 'half', 'frown'], [tY, 'open', 'smileOpen']]); ws_.drawWatch(t); ws_.gears.forEach((g, i) => (g.rotation.z = q15(t) * (i % 2 ? -2 : 2.4))); cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tY) { const f = Math.floor((t - tY) * 30); bitText(o.tctx, '1775', 135, 92, Math.max(1, Math.round(4 * (f < 3 ? POPL[f] : 1))), '#fdd941'); } } };
  } });

  // ===== 24. "a watchmaker named Alexander Cumming"  close on the pocket watch + gears, then her; name plate
  S.push({ at: [10, 'a'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const ws_ = workshop(scene);
    const ch = hero(scene, { p: [0.0, 0, -0.45], ry: 0 });
    const tA = ws(10, 'Alexander'); cue(t0 + 0.05, 'ticking'); cue(tA, 'blip');
    const fx = new FX(LW, LH).add('sparkle', { world: [0.3, 0.88, 0.25], t0, dur: 9, n: 4, radius: 16 })
      .add('idea', { obj: ch.root, bone: 'Head', offset: [0.1, 0.45, 0], t0: tA, dur: 9, scale: 0.7 });
    const cam = camera({ p: [[0.85, 1.7, 1.7], [0.75, 1.65, 2.0]], l: [[0.15, 1.05, -0.05], [0.1, 1.15, -0.2]], fov: [42] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [seg('idle', -99, { loop: true })], [[-99, 'happy', 'smile']]); ws_.drawWatch(t); ws_.gears.forEach((g, i) => (g.rotation.z = q15(t) * (i % 2 ? -2 : 2.4))); cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, 'WATCHMAKER', 135, 46, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0 + 0.2) }); if (t >= tA) plateText(o, 'ALEXANDER CUMMING', 135, 70, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tA) }); } };
  } });

  // ===== 25. "bent the pipe into an S."  v2: the straight pipe between her fists is bent into a real S-trap: inlet up,
  // U bend (fills with water), crown, drop to the sewer; plates S-TRAP + WATER
  S.push({ at: [10, 'bent'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); workshop(scene);
    const ch = hero(scene, { p: [0.0, 0, -0.45], ry: 0 });
    const tS = ws(10, 'S'), tB0 = t0 - 0.1;
    const cop = L.basic(null, 0xd07a3a), pipeM = new THREE.Mesh(new THREE.BufferGeometry(), cop), waterM = new THREE.Mesh(new THREE.BufferGeometry(), L.basic(null, 0x3c9ce8)); scene.add(pipeM, waterM);
    cue(t0 + 0.2, 'pipe_creak'); cue(tS, 'sting'); cue(tS + 0.15, 'water_pour');
    const fx = new FX(LW, LH).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: t0 + 0.3, dur: 2 })
      .add('shake', { obj: ch.root, bone: 'Chest', offset: [0, -0.05, 0.3], t0: t0 + 0.3, dur: 1.0, width: 60, height: 40, color: '#ffd93b', scale: 1.2 })
      .add('sparkle', { obj: ch.root, bone: 'Chest', offset: [0, -0.1, 0.4], t0: tS, dur: 9, n: 5, radius: 30 });
    const cam = camera({ p: [[0.1, 1.3, 2.3], [0.1, 1.28, 2.15]], l: [[0.0, 0.98, -0.2]], fov: [40] });
    const a = new THREE.Vector3(), b = new THREE.Vector3(), up = V3([0, 1, 0]); let mid = [];
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [seg('bend_pipe', tB0)], [[-99, 'angry', 'shout'], [tS, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true);
      ch.fist('R', b); ch.fist('L', a); const k = smooth((q15(t) - tB0 - 10 / 30) / (22 / 30));
      const dir = a.clone().sub(b).setY(0).normalize(), L0 = a.distanceTo(b), fw = V3([0, 0, 0.06]);
      const pts = [b.clone().addScaledVector(dir, -0.22 * (1 - k) - 0.1 * k).addScaledVector(up, 0.17 * k).add(fw), b.clone().addScaledVector(dir, -0.04 * k).addScaledVector(up, 0.07 * k).add(fw)];
      mid = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12, y = u < 0.55 ? -0.2 * Math.sin(Math.PI * u / 0.55) : 0.09 * Math.sin(Math.PI * (u - 0.55) / 0.45);
        const p = b.clone().lerp(a, u).addScaledVector(up, y * k).add(fw); pts.push(p); if (u > 0.06 && u < 0.5) mid.push(p.clone()); }
      pts.push(a.clone().addScaledVector(up, -0.12 * k).add(fw), a.clone().addScaledVector(dir, 0.22 * (1 - k)).addScaledVector(up, -0.32 * k).add(fw));
      pipeM.geometry.dispose(); pipeM.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.03, 8);
      waterM.geometry.dispose(); waterM.visible = q15(t) >= tS + 0.1 && mid.length > 2;
      if (waterM.visible) waterM.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mid.map((p) => p.clone().add(V3([0, 0, 0.012])))), 24, 0.024, 6);
      cam.go(t, t0, t1);
    }, overlay(lt, dt, a2, o) {
      const t = t0 + lt;
      if (t >= tS) plateText(o, 'S-TRAP', 135, 52, { size: 16, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tS) });
      if (t >= tS + 0.15 && mid.length) { const p = mid[Math.floor(mid.length / 2)], q = L.toScreen(cam, p.x, p.y, p.z); plateText(o, 'WATER', q[0] - 40, q[1] + 34, { size: 12, border: '#7cc0ff', fg: '#dff4ff', scale: popS(t, tS + 0.15) }); }
    } };
  } });

  // the S-trap diagram motion: water fills the bend, gas puffs come up from the sewer and bounce off the water seal
  function trapMotion(st, scene, { tFill0, tGas0, bounce = true }) {
    return (t) => {
      const q = q15(t); st.clip.constant = 0.2 + (st.LEVEL - 0.2) * smooth((q - tFill0) / 1.1);
      st.puffs.forEach((o, i) => {
        const d = q - tGas0 - i * 0.22; if (d < 0) { o.visible = false; return; }
        const cyc = 1.3, u = (d % cyc) / cyc, uu = 1 - u * (1 - st.uSeal - 0.02);   // from the sewer end up to the seal
        const back = bounce && u > 0.8 ? (u - 0.8) * 0.4 : 0;
        o.visible = true; o.position.copy(st.curve.getPointAt(Math.min(1, uu + back))); o.position.z = 0.0;
        o.scale.setScalar(0.8 + 0.4 * Math.sin(q * 8 + i));
      });
    };
  }
  // ===== 26. "Water gets stuck in the bend... and blocks the gas."  S-trap diagram: water fills the bend; gas is stopped
  S.push({ at: [11, 'Water'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const st = sTrapSet(scene);
    const tSt = ws(11, 'stuck'), tBl = ws(11, 'blocks'), tG = ws(11, 'gas');
    const motion = trapMotion(st, scene, { tFill0: t0 + 0.1, tGas0: tBl - 1.0 });
    cue(t0 + 0.1, 'water_pour'); cue(tBl, 'bonk'); cue(tG, 'gas_hiss');
    const seal = st.curve.getPointAt(st.uSeal);
    const fx = new FX(LW, LH).add('impact', { world: seal.toArray(), t0: tBl, dur: 0.35, scale: 1.0, color: '#c8f080' })
      .add('splash', { world: [-0.35, 0.74, 0], t0: tSt, dur: 0.6, n: 6, scale: 0.8 })
      .add('stink', { world: [0.35, -0.2, 0.2], t0: tBl - 0.5, dur: 9, lines: 2 });
    const cam = camera({ p: [[-0.15, 0.6, 3.6], [-0.15, 0.6, 3.4]], l: [[-0.15, 0.55, 0]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) { motion(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt;
        if (t >= tSt) { const p = L.toScreen(cam, -0.35, 0.25, 0); plateText(o, 'WATER', p[0], p[1] + 30, { size: 14, border: '#7cc0ff', fg: '#dff4ff', scale: popS(t, tSt) }); }
        if (t >= tG) { const p = L.toScreen(cam, 0.22, 0.3, 0); plateText(o, 'GAS', p[0] + 44, p[1], { size: 14, border: '#82c948', fg: '#e0ffc0', scale: popS(t, tG) }); }
        if (t >= tBl) { const p = L.toScreen(cam, seal.x, seal.y + 0.2, 0); plateText(o, 'BLOCKED!', p[0] + 30, p[1] - 30, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tBl) }); }
        const s = L.toScreen(cam, 0.35, -0.38, 0.3); plateText(o, 'SEWER', s[0], s[1] + 26, { size: 12, border: '#c8a070', fg: '#ffe8c8' });
      } };
  } });

  // ===== 27. "This is a trap."  punch-in on the water seal + TRAP label
  S.push({ at: [11, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const st = sTrapSet(scene);
    const tT = ws(11, 'trap'); const motion = trapMotion(st, scene, { tFill0: t0 - 5, tGas0: t0 - 3 });
    cue(tT, 'label'); cue(tT, 'punch');
    const fx = new FX(LW, LH).add('sparkle', { world: [-0.35, 0.4, 0.1], t0: tT, dur: 9, n: 5, radius: 26, color: '#bff4ff' });
    const cam = camera({ p: [[-0.2, 0.55, 2.7]], l: [[-0.2, 0.55, 0]], fov: [40], jumps: [{ t: tT, p: [[-0.3, 0.5, 2.0], [-0.3, 0.5, 1.9]], l: [[-0.3, 0.5, 0]], fov: [40] }] });
    return { scene, camera: cam, fx, update(lt, t) { motion(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const p = L.toScreen(cam, -0.35, 0.3, 0); popLabel(o, t0 + lt, tT, 'TRAP', 135, Math.max(56, p[1] - 150), 24, p); } };
  } });

  // ===== 28. "That's why there's always water in your toilet..."  v2: NEW PLACE: the dug-up toilet, cleaned and installed in
  // a ruined village bathroom; hands on hips, the water in the bowl sparkles
  S.push({ at: [12, "That's"], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const { tl } = bathroomEnd(scene);
    const ch = hero(scene, { p: [-0.25, 0, -0.75], ry: 0.45 });
    const tWa = ws(12, 'water'), tTo = ws(12, 'toilet');
    const segs = [seg('idle', -99, { loop: true }), seg('hands_on_hips', tWa - 0.3, { fade: 0.1 })];
    cue(t0 + 0.1, 'water_drip'); cue(tWa, 'ding');
    const water = tl.userData.water;
    const fx = new FX(LW, LH).add('sparkle', { target: water, offset: [0, 0.03, 0], t0: tWa, dur: 9, n: 4, radius: 16, color: '#bff4ff' })
      .add('bubbles', { target: water, offset: [0, 0.0, 0], t0, dur: 9, every: 0.4, color: '#e8f8ff' })
      .add('arrow', { target: water, offset: [0, 0.32, 0], t0: tWa, dur: 9, angle: Math.PI / 2, len: 14, color: '#ffd93b', light: '#fff2a0', edge: '#5a3a00' });
    const cam = camera({ p: [[0.55, 1.55, 2.8], [0.5, 1.5, 2.55]], l: [[0.05, 0.75, -1.0]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, segs, [[-99, 'open', 'smileOpen'], [tTo, 'happy', 'smile']]); cam.go(t, t0, t1); } };
  } });

  // ===== 29. "it's a tiny wall between you and the sewer."  diagram: tiny her on the bowl, brick wall on the water, gas bounces
  S.push({ at: [12, "it's"], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const st = sTrapSet(scene);
    const motion = trapMotion(st, scene, { tFill0: t0 - 5, tGas0: t0 + 0.2 });
    const tW = ws(12, 'wall'), tY = ws(12, 'you'), tS = ws(12, 'sewer');
    const ch = hero(scene, { p: [-0.6, 1.5, 0.15], ry: 0.2, scale: 0.28 });
    cue(tW, 'brick_pop'); cue(tY, 'blip'); cue(tS, 'gas_hiss');
    const seal = st.curve.getPointAt(st.uSeal);
    const fx = new FX(LW, LH).add('impact', { world: seal.toArray(), t0: tW + 0.6, dur: 0.3, scale: 0.8, color: '#c8f080' }).add('impact', { world: seal.toArray(), t0: tW + 1.9, dur: 0.3, scale: 0.8, color: '#c8f080' });
    const cam = camera({ p: [[-0.15, 0.85, 3.5], [-0.15, 0.85, 3.3]], l: [[-0.15, 0.8, 0]], fov: [46] });
    return { scene, camera: cam, fx, update(lt, t) { motion(t); ch.drive(t, [seg('smug', t0 - 0.2)], [[-99, 'relaxed', 'cat'], [tY, 'wink', 'cat']], false); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt, c = o.tctx;
        if (t >= tW) {   // the pixel brick wall rising out of the water seal (outlet leg)
          const p = L.toScreen(cam, seal.x, seal.y, 0), k = Math.min(1, (t - tW) * 5), h = Math.round(22 * k);
          for (let r = 0; r * 6 < h; r++) for (let x = -10 + (r % 2) * 4; x < 10; x += 8) { c.fillStyle = '#040412'; c.fillRect(Math.round(p[0] + x) - 1, p[1] - r * 6 - 6, 9, 7); c.fillStyle = '#c8502a'; c.fillRect(Math.round(p[0] + x), p[1] - r * 6 - 5, 7, 5); c.fillStyle = '#e88a5a'; c.fillRect(Math.round(p[0] + x), p[1] - r * 6 - 5, 7, 1); }
          plateText(o, 'TINY WALL', p[0] + 50, p[1] - 40, { size: 12, border: '#ff9a5a', fg: '#ffe0c8', scale: popS(t, tW) });
        }
        if (t >= tY) { const p = L.toScreen(cam, -0.6, 1.95, 0); plateText(o, 'YOU', p[0], p[1] - 14, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tY) }); }
        if (t >= tS) { const p = L.toScreen(cam, 0.35, -0.38, 0.3); plateText(o, 'SEWER', p[0], p[1] + 24, { size: 14, border: '#82c948', fg: '#e0ffc0', scale: popS(t, tS) }); }
      } };
  } });

  // ===== 30. "Humans spent almost two hundred years..."  v2: at the outhouse in the village (old vs new), year counter
  S.push({ at: [13, 'Humans'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.village(scene, { cz: -5, cx: -3.5 });
    outhouse(scene, { x: 0.55, z: -0.9, ry: -0.3, door: 0 });
    const ch = hero(scene, { p: [-0.35, 0, 0.0], ry: 0.35 });
    const tY = ws(13, 'two'), tE = we(13, 'years');
    cue(tY - 0.3, 'counter');
    const sf = L.snowfall(scene, { cx: 0, cz: 0, R: 8 });
    const fx = new FX(LW, LH).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tE, dur: 1.5 })
      .add('flies', { world: [0.5, 2.3, -0.8], t0, dur: 9, n: 2, radius: 12 });
    const cam = camera({ p: [[0.05, 1.45, 4.4], [0.0, 1.42, 4.1]], l: [[-0.05, 1.0, -0.4]], fov: [38] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('idle', -99, { loop: true }), seg('think', t0 + 0.2, { fade: 0.1 })], [[-99, 'half', 'frown'], [tE, 'surprised', 'gasp']]); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt, tYe = ws(13, 'years'), k = smooth((t - (tY - 0.9)) / (tYe - tY + 0.9)), y = Math.round(1596 + 179 * k);
        bitText(o.tctx, String(y), 135, 70, 4, k >= 1 ? '#fdd941' : '#ffffff');
        plateText(o, '1596 TO 1775', 135, 108, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' });
      } };
  } });

  // ===== 31. "just to stop their pipes from breathing on them?"  v2: in the bathroom; the toilet burps a tiny green puff, shrug
  S.push({ at: [13, 'just'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const { tl } = bathroomEnd(scene);
    const ch = hero(scene, { p: [-0.15, 0, -0.85], ry: 0.55 });
    const tBr = ws(13, 'breathing'), tTh = ws(13, 'them');
    cue(tBr, 'puff'); cue(tTh - 0.25, 'shrug_boing'); cue(tTh + 0.2, 'question_pop');
    scene.updateMatrixWorld(true); const mouth = tl.localToWorld(V3([0, 0.45, 0.1]));
    const fx = new FX(LW, LH).add('steam', { world: mouth.toArray(), t0: tBr, dur: 1.4, every: 0.12, life: 0.9, rise: 26, drift: -14, color: '#a8e070', edge: '#5a9a2a' })
      .add('question', { obj: ch.root, bone: 'Head', offset: [0.18, 0.4, 0], t0: tTh, dur: 9, scale: 0.9 })
      .add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tBr + 0.2, dur: 1.2 });
    const cam = camera({ p: [[0.2, 1.3, 1.8], [0.18, 1.28, 1.6]], l: [[0.1, 0.85, -1.0]], fov: [42] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [seg('idle', -99, { loop: true }), seg('surprised', tBr + 0.1, { fade: 0.1 }), seg('shrug', tTh - 0.35, { fade: 0.12 })], [[-99, 'half', 'frown'], [tBr + 0.1, 'surprised', 'gasp'], [tTh, 'relaxed', 'cat']]);
      cam.go(t, t0, t1);
    } };
  } });

  // ===== 32. "Artifact understood. Logging off."  v2: in the restored bathroom (not the dig site of the opening): wave, outro over it
  S.push({ at: [14, 'Artifact'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); bathroomEnd(scene);
    const ch = hero(scene, { p: [-0.1, 0, -0.35], ry: 0.1 });
    const tLo = ws(14, 'Logging'), tEnd = TL.dur, tOut = tEnd + 0.05;
    cue(tLo, 'blip'); cue(tOut + 0.05, 'end_jingle'); cue(tOut + 0.55, 'follow_pop');
        const fx = new FX(LW, LH).add('sparkle', { world: [0.45, 0.5, -1.2], t0, dur: 9, n: 3 });
    const cam = camera({ p: [[0.15, 1.35, 2.6], [0.15, 1.6, 3.7]], l: [[0.15, 0.95, -0.8], [0.15, 0.9, -0.9]], fov: [40] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('idle', -99, { loop: true }), seg('wave', t0 + 0.05, { fade: 0.1 }), seg('wave', tOut + 0.1, { fade: 0.1 })], [[-99, 'happy', 'smileOpen'], [tLo + 0.3, 'happy', 'smile']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt, c = o.tctx;
        if (t >= tLo && t < tOut + 0.3) { const n = Math.min(14, Math.floor((t - tLo) * 20)); if (n > 0) plateText(o, 'LOGGING OFF...'.slice(0, n), 135, 52, { size: 14, border: '#7cf0ff', fg: '#c8f8ff' }); }
        if (t >= tOut) {
          bitText(c, CHANNEL, 135, 100, Math.max(1, Math.round(3 * popS(t, tOut))), '#fdd941');
          if (t >= tOut + 0.25) plateText(o, ARTIFACT + ': TOILET', 135, 128, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tOut + 0.25) });
          if (t >= tOut + 0.5) {
            const s3 = popS(t, tOut + 0.5) * (1 + 0.04 * Math.sin((t - tOut) * 9)), w = Math.round(218 * s3), h = Math.round(26 * s3), X = 135 - w / 2, Y = 352 - h / 2;
            c.fillStyle = '#040412'; c.fillRect(Math.round(X) - 2, Math.round(Y) - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(Math.round(X), Math.round(Y), w, h);
            c.fillStyle = '#ff7a92'; c.fillRect(Math.round(X), Math.round(Y), w, 2);
            bitText(c, 'FOLLOW ' + HANDLE, 135, 352, 2, '#ffffff', { outline: null });
          }
        }
      } };
  } });

  // ---------- timeline ----------
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
