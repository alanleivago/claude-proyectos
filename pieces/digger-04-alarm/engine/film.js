import { bitText } from './pixfont.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
// film.js — "Digger 04: the alarm clock" (sinaboto format, shots 1-31 at the bottom; helpers + sets reused from digger-02/03), full video (index.html?v=megagirl).
// Engine, helpers and village set from digger-01-fridge/engine/film.js; new sets: outhouse (+ ground cutaway over the pit),
// night village, bedroom + chamber pot, street facade with a real window, Harington's flush toilet with cistern + pull
// chain, house/sewer section, workshop (S bend), S-trap diagram, the dug-up modern toilet (Quaternius CC0).
// Shot: { t0, hard, scene, camera, update(lt, t), fx, overlay }. Times are GLOBAL seconds unless named lt.
export const CHANNEL = 'MECHAYUKI', HANDLE = '@mechayuki';
export const TAIL = 2.6;           // after the last word: the outro over her goodbye shot
export const ARTIFACT = 'ARTIFACT 004';

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

  // =====================================================================================================================
  // Digger 03: the lock. Sets and props (code, PS1 low poly)
  // =====================================================================================================================
  const RUST = 0x8a4a2a, BRASS = 0xc8a040, IRON = 0x34343a, WOOD = 0x8a5a30;
  // the padlock (user: more detail, one model everywhere): bevelled extruded body with a painted rust/brass texture
  // (PS1 shine = a baked highlight stripe + flat Lambert), curved steel shackle (half torus + legs), keyhole + plate
  const PADTEX = L.cvs(32, 32, (c) => {
    c.fillStyle = '#9a6a3a'; c.fillRect(0, 0, 32, 32);
    c.fillStyle = '#b8864a'; c.fillRect(0, 0, 32, 3); c.fillStyle = '#d8b070'; c.fillRect(4, 4, 24, 2);     // baked highlight band
    c.fillStyle = '#7a4a24'; c.fillRect(0, 28, 32, 4);
    const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    for (const [x, y, w, h] of [[2, 18, 5, 3], [24, 9, 4, 5], [12, 25, 7, 2], [27, 21, 3, 4], [6, 10, 2, 2]]) r(x, y, w, h, '#6a3a1c');   // rust spots
    for (const [x, y] of [[3, 19], [25, 10], [14, 25], [28, 22]]) r(x, y, 2, 1, '#a8562a');
    r(9, 12, 14, 8, '#5a3a1c'); r(10, 13, 12, 6, '#c8a050'); r(11, 14, 10, 1, '#f0d890');                   // embossed plate
    for (let x = 11; x < 21; x += 3) r(x, 16, 2, 2, '#7a5a2a');
  });
  function padlock(sc = 1) {
    const g = new THREE.Group();
    const sh = new THREE.Shape(); const W = 0.075, H = 0.06, rr = 0.018;
    sh.moveTo(-W + rr, -H); sh.lineTo(W - rr, -H); sh.quadraticCurveTo(W, -H, W, -H + rr); sh.lineTo(W, H - rr); sh.quadraticCurveTo(W, H, W - rr, H);
    sh.lineTo(-W + rr, H); sh.quadraticCurveTo(-W, H, -W, H - rr); sh.lineTo(-W, -H + rr); sh.quadraticCurveTo(-W, -H, -W + rr, -H);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.007, bevelSegments: 1, curveSegments: 3 });
    geo.translate(0, 0, -0.02); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + W) / (2 * W), (uv.getY(i) + H) / (2 * H));
    const body = L.mesh(geo, L.lam(PADTEX, 0xffffff), 0, H + 0.01, 0, g); body.material.flatShading = true;
    const steel = L.lam(null, 0xb8bcc4); steel.flatShading = true;
    const arc = L.mesh(new THREE.TorusGeometry(0.045, 0.011, 5, 10, Math.PI), steel, 0, 2 * H + 0.06, 0, g);
    for (const x of [-0.045, 0.045]) L.mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.06, 6), steel, x, 2 * H + 0.035, 0, g);
    L.mesh(new THREE.CircleGeometry(0.012, 8), L.basic(null, 0x0c0c0c), 0, 0.045, 0.029, g);
    L.box(0.008, 0.022, 0.002, L.basic(null, 0x0c0c0c), 0, 0.03, 0.029, g);
    L.box(0.004, 0.06, 0.001, L.basic(null, 0xfff4d0), -0.05, 0.08, 0.03, g);   // specular glint
    g.scale.setScalar(sc); return g;
  }
  function chain(parent, a, b, n = 10) { for (let i = 0; i < n; i++) { const p = V3(a).lerp(V3(b), (i + 0.5) / n); const o = L.box(0.035, 0.06, 0.015, L.basic(null, i % 2 ? 0x5a5a60 : 0x7a7a80), p.x, p.y, p.z, parent); o.rotation.set(0, i % 2 ? Math.PI / 2 : 0, Math.atan2(b[0] - a[0], b[1] - a[1])); } }
  // S1: the buried village gate (the artifact): iron gate half in the snow, chain + padlock, the dig pit, set dressing
  function gateDig(scene) {
    L.village(scene, { cz: -5, cx: -3.5, holes: [[0.6, -0.6, 1.0]], skip: { car: true } });
    const hg = L.hole(scene, 0.6, -0.6, 1.0, 0.9);
    const gate = new THREE.Group(); gate.position.set(1.0, -0.6, -0.05); gate.rotation.set(-0.1, 0.9, 0.08); scene.add(gate);
    for (let k = 0; k < 9; k++) { L.box(0.04, 1.5, 0.04, L.basic(null, 0x1a1b20), -0.6 + k * 0.15, 0.75, 0, gate); L.mesh(new THREE.ConeGeometry(0.035, 0.1, 4), L.basic(null, 0x1a1b20), -0.6 + k * 0.15, 1.55, 0, gate); }
    for (const y of [0.35, 1.25]) L.box(1.3, 0.05, 0.05, L.basic(null, 0x1a1b20), 0, y, 0, gate);
    L.box(1.34, 0.06, 0.1, L.basic(L.rep(T.snow, 3, 1), 1), 0, 1.29, 0, gate);
    chain(gate, [-0.12, 0.95, 0.04], [0.1, 0.72, 0.04], 7); const pl = padlock(1.1); pl.position.set(0.12, 0.6, 0.05); gate.add(pl);
    L.drift(scene, 2.9, -2.0, 0.8, 0.45, 0.6); L.drift(scene, -0.9, -1.4, 0.6, 0.35, 0.5);
    L.footprints(scene, -0.6, 0.6, -2.4, 4.0, 10);
    const pile = makePile(scene, 2.05, -0.72, 1.2);
    return { hg, pile, gate, pl };
  }
  const litM = (map, col, flat = true) => { const m = L.lam(map, col, { side: THREE.DoubleSide }); m.flatShading = flat; return m; };
  // v2 (user: the door looked flat / white at the bottom): a full 3D plank door down to the floor: 6 planks with relief and
  // gaps, 2 battens, iron strap hinges with nails, ring pull, keyhole plate, frame (jambs + lintel) and a stone threshold
  function door3D(parent, { x = 0, z = 0, w = 1.0, h = 2.0, tint = 0x7a5232, frame = true } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    const plank = L.rep(OAK, 0.5, 2.5), n = 6, pw = w / n, iron = litM(null, 0x2a2a30), nail = litM(null, 0x5a5a62);
    for (let i = 0; i < n; i++) L.box(pw - 0.012, h - 0.02, 0.05 + (i % 2) * 0.012, litM(plank, [0x8a5c38, 0x7a5030, 0x946640][i % 3]), -w / 2 + pw * (i + 0.5), h / 2, 0.0, g);
    L.box(w - 0.02, h, 0.03, litM(null, 0x1c120a), 0, h / 2, -0.03, g);   // dark backing in the gaps
    for (const y of [0.35, h - 0.4]) { L.box(w - 0.06, 0.1, 0.035, litM(L.rep(OAK, 2, 0.3), 0x6a4426), 0, y, 0.04, g);
      L.box(w * 0.62, 0.05, 0.012, iron, -w / 2 + w * 0.31, y, 0.065, g); for (let k = 0; k < 4; k++) L.box(0.018, 0.018, 0.012, nail, -w / 2 + 0.06 + k * 0.14, y, 0.074, g); }
    const ring = L.mesh(new THREE.TorusGeometry(0.06, 0.012, 5, 12), litM(null, 0x3a3a42), w / 2 - 0.16, h * 0.5, 0.075, g);
    L.box(0.05, 0.05, 0.02, iron, w / 2 - 0.16, h * 0.5 + 0.06, 0.065, g);
    L.box(0.08, 0.13, 0.012, iron, w / 2 - 0.16, h * 0.5 - 0.17, 0.065, g); L.box(0.016, 0.045, 0.004, L.basic(null, 0x050505), w / 2 - 0.16, h * 0.5 - 0.17, 0.073, g);
    if (frame) { const fr = litM(L.rep(OAK, 0.3, 2), 0x4a3020);
      for (const s2 of [-1, 1]) L.box(0.1, h + 0.1, 0.14, fr, s2 * (w / 2 + 0.05), (h + 0.1) / 2, 0.0, g);
      L.box(w + 0.3, 0.14, 0.16, fr, 0, h + 0.07, 0.0, g); L.box(w + 0.3, 0.05, 0.3, litM(L.rep(T.stone, 1, 0.3), 0x9a9488), 0, 0.025, 0.08, g); }
    return g;
  }
  // a key held correctly in a fist (v2: no intersection): parented to the hand bone, bow pinched at the knuckles, blade out
  function keyGrip(ch, key, side) { const k = L.holdIn(ch, key, side, [0, 1.35, 0.25], [Math.PI / 2, 0, Math.PI / 2]); return k; }
  function boulder(r = 0.5) {   // v2: the stone rolls about its own centre (group origin on the ground, pivot at height r)
    const g = new THREE.Group(), piv = new THREE.Group(); piv.position.y = r; g.add(piv);
    const o = L.mesh(new THREE.IcosahedronGeometry(r, 1), litM(L.rep(T.stone, 1, 1), 0xb0aaa0), 0, 0, 0, piv);
    for (let i = 0; i < 4; i++) { const p = L.mesh(new THREE.IcosahedronGeometry(r * 0.32, 0), L.basic(L.rep(T.snow, 1, 1), 1), Math.cos(i * 1.7) * r * 0.75, Math.sin(i * 2.3) * r * 0.6, Math.sin(i * 1.1) * r * 0.7, piv); p.scale.y = 0.45; }
    g.userData.roll = (a) => { piv.rotation.z = a; }; g.userData.r = r; return g;
  }
  function hutSet(scene) {   // S2: a small stone hut at the village edge (outside); v3: a real plank door in its front wall
    L.village(scene, { cz: -6, cx: -3.5, skip: { car: true, can: true } });
    const hut = L.house(scene, { x: 0, z: -1.6, w: 2.6, d: 2.4, h: 2.0, wall: 'stone', roofH: 1.2, door: 0, chimney: false });
    door3D(scene, { x: 0, z: -0.38, w: 1.0, h: 1.85 });
    L.drift(scene, -1.6, 0.2, 0.7, 0.25, 0.5); L.pine(scene, 2.6, -3.2, 4); L.pine(scene, -2.8, -3.6, 3.6);
    return hut;
  }
  function hutInside(scene, { light = false } = {}) {   // S2b: inside the hut: stone walls, plank floor, the door wall
    L.addSky(scene, { near: 6, far: 40, preset: 'interior' });
    L.plane(8, 8, L.basic(L.rep(T.planks, 8 / 1.2, 8 / 1.2), 1.6), 0, 0, 0, scene, 0, -Math.PI / 2);
    L.plane(8, 3, L.basic(L.rep(T.stone, 8 / 1.6, 3 / 1.6), 0.6), 0, 1.5, -1.2, scene);
    L.plane(8, 3, L.basic(L.rep(T.stone, 8 / 1.6, 3 / 1.6), 0.5), -2.0, 1.5, 0, scene, Math.PI / 2);
    const door = door3D(scene, { x: 0.3, z: -1.13, w: 1.0, h: 1.95 });
    if (light) for (const [x, y, w, h] of [[0.3, 1.97, 1.0, 0.02], [-0.21, 0.98, 0.015, 1.95], [0.81, 0.98, 0.015, 1.95]]) L.plane(w, h, L.basic(null, 0xfff4d0), x, y, -1.17, scene);
    const pl = new THREE.PointLight(0xffd8a0, 2.2, 5); pl.position.set(-1.0, 1.6, 0.3); scene.add(pl);
    L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 5), L.basic(null, 0xf4ecd0), -1.2, 1.1, -1.1, scene); L.mesh(new THREE.SphereGeometry(0.025, 5, 4), L.basic(null, 0xffc040), -1.2, 1.18, -1.1, scene);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    return { door };
  }
  function barAndBrackets(scene, x = 0.3) {   // two iron brackets on the door frame + the wooden bar (bolt)
    for (const s of [-1, 1]) { L.box(0.08, 0.14, 0.14, litM(null, IRON), x + s * 0.62, 1.05, -1.02, scene); L.box(0.08, 0.04, 0.14, litM(null, IRON), x + s * 0.62, 1.14, -0.96, scene); }
    const bar = L.box(1.5, 0.11, 0.09, litM(L.rep(OAK, 3, 0.4), 0xb07a48), x, 1.05, -1.0, scene); return bar;
  }
  function egyptRoom(scene) {   // v2: a 4000-year-old storeroom with relief and light: carved sandstone blocks, painted
    // frieze, a heavy plank door with a 3D wooden pin lock, two burning torches (point lights), jars, baskets, a chest
    L.addSky(scene, { near: 8, far: 40, preset: 'interior' });
    const sandT = L.cvs(16, 16, (c) => { c.fillStyle = '#d8b07a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#c49a62'; for (let i = 0; i < 18; i++) c.fillRect((i * 7) % 16, (i * 5) % 16, 2, 1); });
    const frieze = L.cvs(64, 12, (c) => { c.fillStyle = '#e8c890'; c.fillRect(0, 0, 64, 12); c.fillStyle = '#2a5aa8'; c.fillRect(0, 0, 64, 2); c.fillRect(0, 10, 64, 2);
      c.fillStyle = '#8a2a1a'; for (let k = 0; k < 8; k++) { const x = 3 + k * 8; if (k % 3 === 0) { c.fillRect(x, 4, 1, 5); c.fillRect(x + 1, 3, 2, 2); } else if (k % 3 === 1) { c.beginPath(); c.arc(x + 1.5, 6.5, 2, 0, 7); c.fill(); } else { c.fillRect(x, 6, 4, 1); c.fillRect(x + 1, 4, 1, 4); } } });
    L.plane(12, 12, litM(L.rep(T.dirt, 8, 8), 0xc8a070, false), 0, 0, 4, scene, 0, -Math.PI / 2);
    L.plane(12, 3.6, litM(null, 0x5a4028, false), 0, 1.8, -1.62, scene);   // mortar behind the blocks
    for (let row = 0; row < 7; row++) for (let col = -6; col < 6; col++) {   // carved blocks with relief (each block a separate box)
      const bx = col * 0.62 + (row % 2) * 0.31, by = 0.22 + row * 0.44; if (bx > -0.35 && bx < 1.15 && by < 2.3) continue;   // doorway
      L.box(0.58, 0.4, 0.12 + ((row * 7 + col) % 3) * 0.015, litM(L.rep(sandT, 1, 1), [0xe0bc86, 0xd4ae78, 0xcaa46e][(row + col + 9) % 3]), bx, by, -1.55, scene); }
    L.box(12, 0.5, 0.18, litM(L.rep(frieze, 6, 1), 0xffffff, false), 0, 3.2, -1.5, scene);
    L.box(1.75, 0.2, 0.3, litM(L.rep(sandT, 2, 1), 0xb89060), 0.4, 2.34, -1.45, scene);   // lintel
    for (const sx of [-0.45, 1.25]) L.box(0.18, 2.3, 0.3, litM(L.rep(sandT, 1, 3), 0xc49a64), sx, 1.15, -1.45, scene);   // jambs
    door3D(scene, { x: 0.4, z: -1.47, w: 1.5, h: 2.25, frame: false });
    L.plane(6, 3.6, litM(L.rep(sandT, 6 / 0.8, 3.6 / 0.8), 0xc8a070, false), -2.8, 1.8, 1.6, scene, Math.PI / 2);
    for (const x of [-1.5, 2.3]) { L.box(0.06, 0.4, 0.08, litM(null, 0x3a2a1a), x, 1.65, -1.42, scene); L.mesh(new THREE.ConeGeometry(0.09, 0.24, 5), L.basic(null, 0xffa030), x, 1.97, -1.42, scene);
      L.mesh(new THREE.ConeGeometry(0.05, 0.14, 5), L.basic(null, 0xfff0a0), x, 1.95, -1.4, scene);
      const pl = new THREE.PointLight(0xffa850, 3.5, 4.5); pl.position.set(x, 1.95, -1.1); scene.add(pl); }
    for (const [x, z, s2, col] of [[-1.7, -0.95, 1.1, 0xb86a3a], [-1.25, -1.1, 0.9, 0x9a5a30], [2.5, -0.7, 1.2, 0xc87a40], [2.05, -1.05, 0.8, 0xa86a3a]]) {
      const j = L.mesh(new THREE.LatheGeometry([[0, 0], [0.16, 0.05], [0.2, 0.25], [0.12, 0.45], [0.08, 0.5], [0.1, 0.55]].map(([r, y]) => new THREE.Vector2(r, y)), 10), litM(null, col), x, 0, z, scene); j.scale.setScalar(s2);
      L.mesh(new THREE.TorusGeometry(0.16 * s2, 0.015, 4, 10), litM(null, 0x2a5aa8), x, 0.25 * s2, z, scene).rotation.x = Math.PI / 2; }
    const ch = new THREE.Group(); ch.position.set(1.9, 0, -0.1); ch.rotation.y = -0.4; scene.add(ch);
    L.box(0.7, 0.4, 0.42, litM(L.rep(OAK, 2, 1), 0x8a5a30), 0, 0.2, 0, ch); L.box(0.72, 0.06, 0.44, litM(null, 0x5a3a1c), 0, 0.42, 0, ch);
    for (const [x, z] of [[-2.1, -0.3], [-2.3, 0.1]]) { const b = L.mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.3, 8), litM(null, 0xc8a048), x, 0.15, z, scene); }
    scene.add(new THREE.AmbientLight(0xffe0b0, 0.35));
  }
  // the wooden pin lock in section: housing, bolt with 3 holes, 3 pins, the toothbrush key with 3 pegs.
  // set(pinDrop 0..1, keyIn 0..1, keyLift 0..1, boltSlide 0..1)
  // v2: the wooden pin lock in 3D, cut open at the front so the mechanism reads: a housing on the door with a vertical
  // channel per pin, the dark bolt with 3 holes, 3 ivory pins (they DROP into the holes), the red-brown toothbrush key with
  // 3 pegs. set(pinDrop 0..1, keyIn 0..1, keyLift 0..1, boltSlide 0..1)
  function egyptLock(parent) {
    const g = new THREE.Group(); parent.add(g);
    const houseM = litM(L.rep(OAK, 1, 1), 0xa87848), dark = litM(null, 0x1c120a), boltM = litM(L.rep(OAK, 3, 0.4), 0x6a3a1c), pinM = litM(null, 0xf4ecd0), keyM = litM(null, 0xd0602a);
    L.box(0.5, 0.62, 0.08, houseM, 0, 0.36, -0.09, g);                       // housing back plate
    for (const sx of [-0.23, 0.23]) L.box(0.04, 0.62, 0.12, houseM, sx, 0.36, -0.02, g);   // housing sides
    L.box(0.5, 0.05, 0.12, houseM, 0, 0.65, -0.02, g);                       // housing top
    const holes = [-0.12, 0, 0.12];
    holes.forEach((x) => L.box(0.06, 0.3, 0.02, dark, x, 0.48, -0.045, g));   // pin channels (dark)
    const bolt = new THREE.Group(); g.add(bolt);
    L.box(1.3, 0.13, 0.09, boltM, 0.25, 0.25, 0.0, bolt);
    holes.forEach((x) => L.box(0.055, 0.135, 0.095, dark, x, 0.25, 0.0, bolt));
    L.box(0.1, 0.17, 0.11, boltM, 0.88, 0.25, 0.0, bolt);                    // bolt knob
    const pins = holes.map((x) => { const p = L.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8), pinM, x, 0.5, 0.0, g); return p; });
    const key = new THREE.Group(); g.add(key);
    L.box(0.75, 0.045, 0.05, keyM, -0.05, 0.0, 0.0, key); L.box(0.12, 0.09, 0.06, keyM, -0.42, 0.0, 0.0, key);
    holes.forEach((x) => L.box(0.032, 0.07, 0.04, keyM, x, 0.055, 0, key));
    g.userData.set = (drop, kin, lift, slide) => {
      bolt.position.x = -0.35 * slide;
      key.position.set(-0.85 + 0.85 * kin - 0.35 * slide, 0.205 - 0.03 + 0.11 * lift, 0.0); key.visible = kin > 0.01;
      pins.forEach((p) => { p.position.y = 0.5 - 0.17 * drop + 0.17 * lift; });
    };
    g.userData.set(0, 0, 0, 0); g.userData.bolt = bolt; g.userData.pins = pins; g.userData.key = key; return g;
  }
  function romanRoom(scene) {   // S4: a Roman room: stone walls, a column, a bronze-bound chest with a lock plate
    tudorRoom(scene);
    L.plane(10, 3.6, L.basic(L.rep(T.stone, 10 / 1.6, 3.6 / 1.6), 0.95), 0, 1.8, -0.72, scene);
    for (const x of [-1.5, 1.9]) { L.mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.2, 10), L.lam(null, 0xe8e0d0), x, 1.6, -0.45, scene); L.box(0.5, 0.15, 0.5, L.lam(null, 0xe8e0d0), x, 3.2, -0.45, scene); }
    const chest = new THREE.Group(); chest.position.set(0.55, 0, -0.2); scene.add(chest);
    L.box(0.9, 0.55, 0.5, L.basic(L.rep(OAK, 2, 1), 0.85), 0, 0.275, 0, chest); L.box(0.92, 0.08, 0.52, L.basic(L.rep(OAK, 2, 1), 0.7), 0, 0.59, 0, chest);
    for (const x of [-0.35, 0.35]) L.box(0.05, 0.6, 0.52, L.basic(null, BRASS), x, 0.3, 0, chest);
    L.box(0.16, 0.18, 0.02, L.basic(null, BRASS), 0, 0.38, 0.26, chest); L.box(0.03, 0.06, 0.005, L.basic(null, 0x101010), 0, 0.37, 0.272, chest);
    return { chest };
  }
  function ringKey() { const g = new THREE.Group(); const r = L.mesh(new THREE.TorusGeometry(0.04, 0.012, 5, 10), L.basic(null, BRASS), 0, 0, 0, g);
    L.box(0.016, 0.07, 0.016, L.basic(null, BRASS), 0, 0.075, 0, g); L.box(0.04, 0.03, 0.016, L.basic(null, BRASS), 0.012, 0.105, 0, g); return g; }
  // the thief: a lib-mml passer-by darkened, with a striped shirt band, a black eye mask, a beanie and a loot sack
  // the thief's striped shirt: bank_teller navy texture with the light-blue shirt pixels repainted as white/charcoal stripes
  if (!T.lib_bank_teller_thief) {
    const im = T.lib_bank_teller_navy.image, cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
    const d = c.getImageData(0, 0, cv.width, cv.height);
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) { const k = (y * cv.width + x) * 4, r = d.data[k], g2 = d.data[k + 1], b = d.data[k + 2];
      if (b > r + 25 && b > 115 && g2 > 100) { const on = Math.floor(y / 3) % 2 === 0; d.data[k] = on ? 236 : 46; d.data[k + 1] = on ? 236 : 46; d.data[k + 2] = on ? 236 : 58; } }
    c.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; T.lib_bank_teller_thief = t;
  }
  function thief() {
    const t = npc('bank_teller', 'bank_teller', 'thief');
    t.traverse((o) => { if (o.isMesh && o.material && o.material.color) o.material.color.multiplyScalar(0.55); });
    const head = new THREE.Group(); head.position.set(0, 1.47, 0.02); t.add(head);
    L.box(0.24, 0.06, 0.2, L.basic(null, 0x0c0c10), 0, 0.03, 0.01, head);                                   // mask band
    for (const s of [-1, 1]) L.box(0.05, 0.03, 0.01, L.basic(null, 0xffffff), s * 0.05, 0.03, 0.115, head);  // eye holes
    const cap = L.mesh(new THREE.SphereGeometry(0.13, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), L.basic(null, 0x2a2a34), 0, 0.1, 0, head); cap.scale.y = 0.8;
    L.box(0.27, 0.035, 0.24, L.basic(null, 0xd83030), 0, 0.1, 0, head);
    const sack = L.mesh(new THREE.SphereGeometry(0.24, 8, 6), L.lam(null, 0xc8a878), 0.05, 1.15, -0.3, t); sack.scale.set(1, 1.15, 0.9);
    t.userData.sack = sack;
    // tiptoe walk (knees high, arms tucked) + crouch-and-pick pose, on the rigid NPC bones
    const ax = V3([1, 0, 0]), qq = new THREE.Quaternion(), B = t.bones, R0 = t.rest;
    const setB = (n, a, axis = ax) => { if (B[n]) B[n].quaternion.copy(R0[n]).multiply(qq.setFromAxisAngle(axis, a)); };
    // v2 (user: knees bent backwards): measured on the rig, thigh angle < 0 swings the leg FORWARD and calf angle > 0 bends the
    // knee correctly (foot behind the knee). Feet are re-grounded every frame so he never floats or sinks.
    const foot = (n) => B[n].localToWorld(V3([0, 0.29, 0]));
    const ground = () => { t.updateMatrixWorld(true); const y = Math.min(foot('Bone008').y, foot('Bone010').y) - t.parent.position.y * 0; t.userData.dy = (t.userData.dy || 0) - (y - t.position.y) ; };
    t.ground = () => { t.updateMatrixWorld(true); const yw = Math.min(foot('Bone008').y, foot('Bone010').y); const off = yw - (t.parent ? t.parent.position.y : 0); t.position.y -= off - 0.02; };
    t.tiptoe = (ph) => { const s1 = Math.sin(ph * 6.283), L1 = Math.max(0, s1), R1 = Math.max(0, -s1);
      setB('Bone007', -0.75 * L1 + 0.12 * R1); setB('Bone009', -0.75 * R1 + 0.12 * L1); setB('Bone008', 1.25 * L1 + 0.12); setB('Bone010', 1.25 * R1 + 0.12);
      setB('Bone002', -0.55); setB('Bone004', -0.55); setB('Bone003', -1.35); setB('Bone005', -1.35); setB('Bone001', 0.15); t.position.y = 0; t.ground(); };
    t.pick = (ph) => { setB('Bone007', -0.75); setB('Bone009', -0.55); setB('Bone008', 1.25); setB('Bone010', 1.0);
      setB('Bone002', -1.25 + Math.sin(ph * 14) * 0.04); setB('Bone004', -1.25 - Math.sin(ph * 14) * 0.04); setB('Bone003', -0.35); setB('Bone005', -0.35); setB('Bone001', 0.25); t.position.y = 0; t.ground(); };
    t.hands = () => { t.updateMatrixWorld(true); return [B.Bone003.localToWorld(V3([0, 0.24, 0])), B.Bone005.localToWorld(V3([0, 0.24, 0]))]; };
    return t;
  }
  function pickHands(parent) { const g = new THREE.Group(); parent.add(g); for (const s of [-1, 1]) { const w = L.box(0.006, 0.006, 0.16, L.basic(null, 0xc8ccd4), s * 0.01, s * 0.008, 0.08, g); w.rotation.x = s * 0.15; } return g; }
  function houseDoor(scene, { evening = true } = {}) {   // S8: her house in the village: plank facade, red door with a cylinder lock, porch lantern
    L.addSky(scene, { near: 10, far: 90, preset: evening ? 'morning' : 'mml2' });
    L.snowField(scene, {});
    const sh = new THREE.Shape(); sh.moveTo(-3, 0); sh.lineTo(3, 0); sh.lineTo(3, 3.6); sh.lineTo(-3, 3.6); sh.lineTo(-3, 0);
    const dw = new THREE.Path(); dw.moveTo(-0.45, 0.06); dw.lineTo(0.5, 0.06); dw.lineTo(0.5, 2.06); dw.lineTo(-0.45, 2.06); dw.lineTo(-0.45, 0.06); sh.holes.push(dw);   // the doorway
    const geo = new THREE.ShapeGeometry(sh); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2, uv.getY(i) / 2);
    L.mesh(geo, L.basic(L.rep(T.planks, 1, 1), 1.6, { side: THREE.DoubleSide }), 0, 0, -1.2, scene);
    // v2: a warm lit room behind the door (walls, floor, a table with a candle and bread, a cupboard, a hanging lamp, a rug)
    const room = new THREE.Group(); room.position.set(0, 0, -1.2); scene.add(room);
    L.box(4, 2.6, 3, L.basic(L.rep(T.wallpaper, 3, 2), 0xffc890, { side: THREE.BackSide }), 0, 1.3, -1.52, room);
    L.plane(4, 3, L.basic(L.rep(T.planks, 3, 2), 0xd09060), 0, 0.03, -1.5, room, 0, -Math.PI / 2);
    L.plane(1.2, 0.8, L.basic(null, 0x8a2a2a), 0.1, 0.035, -0.9, room, 0, -Math.PI / 2);
    L.box(0.9, 0.06, 0.6, L.basic(L.rep(OAK, 1, 1), 0xffd0a0), 0.5, 0.72, -1.4, room); for (const [x, z] of [[0.1, -1.15], [0.9, -1.15], [0.1, -1.65], [0.9, -1.65]]) L.box(0.05, 0.7, 0.05, L.basic(null, 0x6a4020), x, 0.36, z, room);
    L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), L.basic(null, 0xfff0d0), 0.35, 0.82, -1.4, room); L.mesh(new THREE.SphereGeometry(0.03, 5, 4), L.basic(null, 0xffd040), 0.35, 0.92, -1.4, room);
    L.mesh(new THREE.SphereGeometry(0.09, 6, 4), L.basic(null, 0xc88a40), 0.65, 0.8, -1.35, room).scale.y = 0.6;
    L.box(0.7, 1.5, 0.35, L.basic(L.rep(OAK, 1, 2), 0xd09868), -1.0, 0.75, -2.7, room); for (const y of [0.6, 1.05]) L.box(0.66, 0.03, 0.3, L.basic(null, 0x5a3820), -1.0, y, -2.62, room);
    for (const [x, y, c] of [[-1.15, 1.13, 0x3a6ab0], [-0.95, 1.13, 0xc84030], [-0.85, 0.68, 0xe0c060]]) L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 6), L.basic(null, c), x, y, -2.6, room);
    L.mesh(new THREE.SphereGeometry(0.12, 8, 5), L.basic(null, 0xffe0a0), 0.3, 2.1, -1.6, room); L.mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4), L.basic(null, 0x222222), 0.3, 2.4, -1.6, room);
    const spill = L.mesh(new THREE.PlaneGeometry(1.0, 1.6), new THREE.MeshBasicMaterial({ color: 0xffb860, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), 0.02, 0.015, -0.4, scene); spill.rotation.x = -Math.PI / 2;
    // v3 (user): a detailed red front door, the same in every shot: weathered painted wood, 4 raised panels with mouldings,
    // a casing frame, brass knob + a clearly visible pin-tumbler lock cylinder, knocker, house number, hinges, stone step
    const redT = L.cvs(32, 64, (c) => { c.fillStyle = '#a8302a'; c.fillRect(0, 0, 32, 64); for (let i = 0; i < 40; i++) { c.fillStyle = i % 3 ? '#962824' : '#b83a32'; c.fillRect((i * 13) % 32, (i * 29) % 64, 1, 4 + (i % 5)); }
      c.fillStyle = '#7a4a3a'; for (const [x, y] of [[3, 58], [27, 60], [14, 61], [29, 5]]) c.fillRect(x, y, 3, 2); c.fillStyle = '#5a1a16'; c.fillRect(0, 62, 32, 2); });
    const redM = (k = 1) => { const m = litM(L.rep(redT, 1, 1), new THREE.Color(0xffffff).multiplyScalar(k).getHex()); return m; };
    const door = new THREE.Group(); door.position.set(-0.45, 0.06, -1.17); scene.add(door);
    L.box(0.95, 2.0, 0.05, redM(1.0), 0.45, 1.0, 0, door);
    for (const [y, h] of [[0.5, 0.62], [1.42, 0.78]]) for (const x of [0.24, 0.66]) {   // raised panels + moulding frames
      L.box(0.3, h, 0.02, redM(0.88), x, y, 0.03, door);
      for (const [dx, dy, w, hh] of [[0, h / 2 + 0.015, 0.34, 0.03], [0, -h / 2 - 0.015, 0.34, 0.03], [0.165, 0, 0.03, h + 0.06], [-0.165, 0, 0.03, h + 0.06]]) L.box(w, hh, 0.035, redM(1.12), x + dx, y + dy, 0.03, door); }
    L.box(0.95, 0.06, 0.04, redM(0.75), 0.45, 0.95, 0.03, door);   // lock rail
    const brass = litM(null, 0xd8b048), steel = litM(null, 0x2a2a30);
    L.mesh(new THREE.SphereGeometry(0.035, 8, 6), brass, 0.82, 0.88, 0.07, door);                                         // knob
    L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), brass, 0.82, 0.88, 0.04, door).rotation.x = Math.PI / 2;
    const cyl = L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), brass, 0.82, 1.0, 0.045, door); cyl.rotation.x = Math.PI / 2;   // lock cylinder
    L.mesh(new THREE.TorusGeometry(0.037, 0.006, 4, 12), litM(null, 0xa88030), 0.82, 1.0, 0.066, door);
    L.box(0.008, 0.032, 0.004, L.basic(null, 0x050505), 0.82, 0.995, 0.068, door);                                        // keyway
    L.mesh(new THREE.TorusGeometry(0.05, 0.01, 4, 12), brass, 0.45, 1.62, 0.07, door); L.box(0.04, 0.05, 0.02, brass, 0.45, 1.68, 0.05, door);   // knocker
    const numT = L.cvs(12, 12, (c) => { c.fillStyle = '#f0e8d0'; c.fillRect(0, 0, 12, 12); c.fillStyle = '#2a2a30'; c.fillRect(0, 0, 12, 1); c.fillRect(0, 11, 12, 1); c.fillRect(0, 0, 1, 12); c.fillRect(11, 0, 1, 12);
      c.fillRect(4, 3, 4, 1); c.fillRect(7, 3, 1, 3); c.fillRect(4, 5, 4, 1); c.fillRect(7, 5, 1, 4); c.fillRect(4, 8, 4, 1); });
    L.plane(0.1, 0.1, L.basic(numT, 1), 0.45, 1.88, 0.03, door);
    for (const y of [0.3, 1.0, 1.7]) { L.box(0.14, 0.04, 0.012, steel, 0.06, y, 0.03, door); L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), steel, 0.0, y, 0.03, door); }
    const caseM = litM(L.rep(OAK, 0.3, 2), 0xe8e0d0);   // white-painted casing around the opening (on the facade)
    for (const x of [-0.53, 0.58]) L.box(0.12, 2.12, 0.06, caseM, x, 1.06, -1.16, scene);
    L.box(1.3, 0.14, 0.08, caseM, 0.025, 2.12, -1.15, scene); L.box(1.36, 0.04, 0.12, caseM, 0.025, 2.21, -1.13, scene);
    L.box(1.6, 0.12, 0.7, litM(L.rep(T.stone, 1, 0.5), 0xb8b0a4), 0.025, 0.06, -0.85, scene); L.box(1.2, 0.06, 0.32, litM(L.rep(T.stone, 1, 0.3), 0x9a948a), 0.025, 0.15, -1.02, scene);   // step + threshold
    const lan = L.box(0.16, 0.24, 0.16, L.basic(null, 0xffd27a), 0.85, 2.25, -1.05, scene); L.box(0.2, 0.04, 0.2, L.basic(null, 0x1a1a1a), 0.85, 2.39, -1.05, scene);
    L.plane(0.8, 1.0, L.basic(T.winLit, 1), 1.75, 1.6, -1.17, scene); L.plane(0.8, 1.0, L.basic(T.win, 1), -1.9, 1.6, -1.17, scene);
    L.box(6.4, 0.2, 1.2, L.basic(L.rep(T.snow, 4, 1), 1), 0, 3.7, -0.9, scene);
    L.drift(scene, -2.2, -0.6, 0.9, 0.3, 0.5); L.drift(scene, 2.4, -0.5, 1.0, 0.25, 0.5); L.pine(scene, -3.6, -2.5, 4.4); L.pine(scene, 3.8, -2.8, 5);
    L.ironFence(scene, -5, 1.6, -1.4, 1.6); L.lamp(scene, 2.9, 1.2, 3.2);
    for (const [x, z, h] of [[-8, -10, 5], [9, -12, 6]]) L.pine(scene, x, z, h);
    return { door, spill };
  }
  // the pin tumbler in section (lab void): housing, brass plug, 5 pin stacks (red key pins, blue driver pins, springs),
  // the flat key with teeth. set(keyIn 0..1, turn 0..1) -> pins rise to the shear line when the key is fully in
  const CUT = [0.06, 0.12, 0.03, 0.1, 0.05];   // key cut heights (key pin lengths complement them)
  function pinTumbler(scene) {
    labSet(scene);
    const g = new THREE.Group(); g.position.set(0, 0.9, 0); scene.add(g);
    const hous = L.basic(null, 0x9aa2ae), plugM = L.basic(null, BRASS);
    L.box(1.5, 0.42, 0.12, hous, 0, 0.36, -0.02, g);                 // upper housing (pin chambers)
    const plug = L.box(1.5, 0.3, 0.12, plugM, 0, 0.0, -0.01, g);     // plug
    L.box(1.5, 0.08, 0.12, hous, 0, -0.19, -0.02, g);
    const shear = L.box(1.52, 0.012, 0.13, L.basic(null, 0xfdd941), 0, 0.15, 0.0, g);
    const xs = [-0.5, -0.25, 0, 0.25, 0.5];
    const stacks = xs.map((x, i) => {
      L.box(0.1, 0.62, 0.125, L.basic(null, 0x2a2e38), x, 0.27, 0.0, g);   // the drilled chamber (dark)
      const kp = L.box(0.07, 0.12 + (0.12 - CUT[i]), 0.13, L.basic(null, 0xe84040), x, 0, 0.01, g);
      const dp = L.box(0.07, 0.14, 0.13, L.basic(null, 0x3c8ce8), x, 0, 0.01, g);
      const sp = L.box(0.03, 0.12, 0.13, L.basic(null, 0xd8dce4), x, 0, 0.01, g);
      return { kp, dp, sp, len: 0.12 + (0.12 - CUT[i]) };
    });
    const key = new THREE.Group(); g.add(key);
    const kshape = new THREE.Shape(); kshape.moveTo(-0.8, -0.1); kshape.lineTo(0.62, -0.1); kshape.lineTo(0.66, -0.05);
    xs.forEach((x, i) => { const h = -0.06 + 0.04 + CUT[i] * 0.55; kshape.lineTo(x - 0.06, h - 0.02); kshape.lineTo(x, h); kshape.lineTo(x + 0.06, h - 0.02); });
    kshape.lineTo(-0.62, -0.02); kshape.lineTo(-0.8, -0.02); kshape.lineTo(-0.8, -0.1);
    L.mesh(new THREE.ShapeGeometry(kshape), L.basic(null, 0xd8dce4, { side: THREE.DoubleSide }), 0, 0, 0.07, key);
    L.mesh(new THREE.CircleGeometry(0.16, 12), L.basic(null, 0xd8dce4), -0.95, -0.06, 0.07, key);
    const surf = (x, kin) => { const kx = x - (-1.6 + 1.6 * kin); let y = -0.2; xs.forEach((cx, i) => { const d = Math.abs(kx - cx); if (d < 0.07 && kin > 0.02) y = Math.max(y, -0.02 + CUT[i] * 0.55 - d * 0.3); }); return kin > 0.02 && kx > -0.8 && kx < 0.66 ? Math.max(y, -0.06) : -0.2; };
    g.userData.set = (kin, turn) => {
      key.position.x = -1.6 + 1.6 * kin; key.visible = kin > 0.01;
      stacks.forEach((s, i) => {
        const bottom = Math.max(-0.1, surf(xs[i], kin)) + 0.02;   // key pin sits on the key (or the plug bottom)
        const lift = kin >= 0.99 ? 0.15 - (bottom + s.len) : 0;   // fully in: the split lands exactly on the shear line
        const b = bottom + lift; s.kp.position.y = b + s.len / 2; s.dp.position.y = b + s.len + 0.07; s.sp.scale.y = Math.max(0.2, (0.58 - (b + s.len + 0.14)) / 0.12); s.sp.position.y = b + s.len + 0.14 + 0.06 * s.sp.scale.y;
      });
      plug.material.color.set(turn > 0.5 ? 0xffe070 : BRASS); shear.visible = kin >= 0.99;
    };
    g.userData.set(0, 0); g.userData.xs = xs; return g;
  }
  function exhibitionHall(scene) {   // S6: 1851, under a glass-and-iron roof: the unpickable lock in a glass case
    L.addSky(scene, { near: 10, far: 60, preset: 'morning' });
    L.plane(14, 14, L.basic(L.rep(T.tiles, 10, 10), 0.9), 0, 0, 3, scene, 0, -Math.PI / 2);
    for (let k = -3; k <= 3; k++) { const a = L.mesh(new THREE.TorusGeometry(3.2, 0.05, 4, 16, Math.PI), L.basic(null, 0x2a3a5a), 0, 2.6, -2 + k * 1.5, scene); }
    for (let k = -3; k <= 3; k++) for (const s of [-1, 1]) L.box(0.1, 2.6, 0.1, L.basic(null, 0x2a3a5a), s * 3.2, 1.3, -2 + k * 1.5, scene);
    L.plane(6.4, 3, L.basic(null, 0xb8d0e8, { transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }), 0, 4.2, -2, scene, 0, -Math.PI / 2 + 0.0);
    for (const [x, c] of [[-2.2, '#c83030'], [2.2, '#2a5aa8']]) L.plane(0.6, 1.2, L.basic(L.cvs(6, 12, (cx) => { cx.fillStyle = c; cx.fillRect(0, 0, 6, 12); cx.fillStyle = '#fdd941'; cx.fillRect(0, 2, 6, 1); }), 1, { side: THREE.DoubleSide }), x, 2.6, -2.8, scene);
    const ped = new THREE.Group(); ped.position.set(0.2, 0, -0.6); scene.add(ped);
    L.box(0.7, 0.9, 0.7, L.basic(L.rep(OAK, 1, 1), 0.8), 0, 0.45, 0, ped);
    const lock = L.mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.18, 14), L.basic(null, BRASS), 0, 1.05, 0, ped); lock.rotation.x = Math.PI / 2;
    L.mesh(new THREE.CircleGeometry(0.03, 8), L.basic(null, 0x101010), 0, 1.05, 0.095, ped);
    const sign = L.plane(0.7, 0.28, L.basic(L.cvs(70, 28, (c) => { c.fillStyle = '#f4ecd0'; c.fillRect(0, 0, 70, 28); c.fillStyle = '#2a1a0a'; c.font = 'bold 9px monospace'; c.fillText('UNPICKABLE', 6, 12); c.font = '7px monospace'; c.fillText('200 GUINEAS', 14, 23); }), 1, { side: THREE.DoubleSide }), 0, 1.55, -0.1, ped);
    const glass = L.box(0.5, 0.5, 0.5, L.basic(null, 0xd8eef8, { transparent: true, opacity: 0.25, depthWrite: false }), 0, 1.15, 0, ped);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    return { ped, lock, sign };
  }
  function makeHobbs() {   // the locksmith (1851): bank_teller in the olive variant, black top hat, no mask: clearly not the thief
    const h = npc('bank_teller', 'bank_teller', 'olive');
    L.mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.22, 10), L.basic(null, 0x141418), 0, 1.75, 0, h);
    L.mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 10), L.basic(null, 0x141418), 0, 1.64, 0, h);
    L.box(0.2, 0.025, 0.025, L.basic(null, 0x8a2a1a), 0, 1.69, 0.0, h);   // hat band
    return h;
  }
  function cylinderLockProp() { const g = new THREE.Group(); const c = L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), L.basic(null, BRASS), 0, 0, 0, g); c.rotation.x = Math.PI / 2;
    L.box(0.015, 0.04, 0.005, L.basic(null, 0x101010), 0, 0, 0.062, g); return g; }
  function flatKey(sc = 1) {   // real 3D flat key: extruded blade with 5 cut teeth, round bow with a hole, ridge groove
    const g = new THREE.Group(), sh = new THREE.Shape();
    sh.moveTo(0, 0.012); sh.lineTo(0.14, 0.012); sh.lineTo(0.155, 0.0);
    [0.13, 0.105, 0.08, 0.055, 0.03].forEach((x, i) => { const d = 0.006 + CUT[i] * 0.09; sh.lineTo(x + 0.008, -0.004); sh.lineTo(x, -0.004 - d); sh.lineTo(x - 0.008, -0.004); });
    sh.lineTo(0.0, -0.004); sh.lineTo(0, 0.012);
    const bow = new THREE.Shape(); bow.absarc(-0.03, 0.004, 0.034, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absarc(-0.045, 0.004, 0.009, 0, Math.PI * 2, true); bow.holes.push(hole);
    const nickel = L.lam(null, 0xd8dce4, { side: THREE.DoubleSide }); nickel.flatShading = true;
    for (const shp of [sh, bow]) L.mesh(new THREE.ExtrudeGeometry(shp, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1 }), nickel, 0, 0, -0.003, g);
    L.box(0.13, 0.002, 0.008, L.basic(null, 0x8a8e98), 0.072, 0.004, 0.0, g);   // groove
    L.box(0.12, 0.0015, 0.001, L.basic(null, 0xffffff), 0.07, 0.011, 0.0045, g);   // glint
    g.scale.setScalar(sc); return g;
  }
  function woodKey(sc = 1) { const g = new THREE.Group(), m = litM(null, 0xd0602a); L.box(0.3, 0.025, 0.025, m, 0.12, 0, 0, g); L.box(0.05, 0.05, 0.03, m, -0.03, 0, 0, g); for (const x of [0.16, 0.2, 0.24]) L.box(0.015, 0.035, 0.02, m, x, 0.028, 0, g); g.scale.setScalar(sc); return g; }

  // the pin tumbler in section, drawn on the overlay canvas (low-res px): housing, brass plug, shear line, 5 chambers with
  // red key pins, blue driver pins and springs; the flat key slides in (kin 0..1) and lifts every split to the shear line
  const CUTP = [4, 10, 2, 8, 5];
  function drawPinTumbler(o, X, Y, s, kin, turn, t) {
    const c = o.tctx, R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(X + x * s), Math.round(Y + y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
    const W2 = 104, HT = -50, PB = 38, KB = 28;   // half width, housing top, plug bottom, key base
    R(-W2 - 2, HT - 2, 2 * W2 + 4, PB - HT + 12, '#141820'); R(-W2, HT, 2 * W2, -HT, '#9aa2ae'); R(-W2, 0, 2 * W2, PB, turn ? '#ffe070' : '#c8a040'); R(-W2, PB, 2 * W2, 8, '#7a8290');
    const xs = [-64, -32, 0, 32, 64], kx0 = -W2 - 150 * (1 - kin);   // key left end (the bow is outside, left)
    const tooth = (x) => { const lx = x - (kx0 + W2); let h = 0; for (let j = 0; j < 5; j++) { const d = Math.abs(lx - xs[j]); if (d < 12) h = Math.max(h, Math.round(CUTP[j] * (1 - Math.max(0, d - 3) / 9))); } return h; };   // peaks under each pin when fully in
    const keyOn = (x) => kin > 0.02 && x > kx0 && x < kx0 + 2 * W2 - 4;
    xs.forEach((x, i) => {
      R(x - 6, HT + 2, 12, PB - HT - 2, '#20242c');
      const top = keyOn(x) ? KB - tooth(x) - 2 : PB - 1;             // key pin rests on the key, or on the plug floor
      const kl = KB - 2 - CUTP[i], kTop = top - kl;                  // fully in -> kTop = 0 (shear line)
      R(x - 4, kTop, 8, kl, '#e84040'); R(x - 4, kTop - 14, 8, 13, '#3c8ce8');
      for (let y = HT + 3; y < kTop - 15; y += 3) R(x - 4 + ((y / 3) % 2 ? 0 : 4), y, 4, 1, '#e8ecf2');
    });
    if (kin > 0.02) {   // the key: blade with teeth + round bow
      for (let x = kx0 - 1; x < kx0 + 2 * W2 - 3; x += 1) { const h = tooth(x); R(x, KB - h - 1, 1, h + 9, '#141820'); }
      for (let x = kx0; x < kx0 + 2 * W2 - 4; x += 1) { const h = tooth(x); R(x, KB - h, 1, h + 7, '#e8ecf2'); }
      R(kx0 - 26, KB - 12, 26, 20, '#141820'); R(kx0 - 24, KB - 10, 22, 16, '#d8dce4');
    }
    for (let x = -W2; x < W2; x += 6) R(x, -1, 4, 2, kin >= 0.99 ? '#fdd941' : '#5a6070');   // the shear line
    if (turn) { c.strokeStyle = '#fdd941'; c.lineWidth = 2; c.beginPath(); c.arc(X + W2 * s + 12, Y + 14 * s, 12, -1.2, 1.6); c.stroke(); c.fillStyle = '#fdd941'; c.fillRect(X + W2 * s + 6, Y + 26 * s, 6, 6); }
  }
  // the old wooden pin lock in section (2D panel): bolt with 3 holes, 3 pins dropping in, the peg key lifting them out
  function drawWoodLock(o, X, Y, s, drop, kin, lift, slide) {
    const c = o.tctx, R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(X + x * s), Math.round(Y + y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
    R(-112, -78, 224, 150, '#141008'); R(-110, -76, 220, 146, '#e8d0a0');                                  // parchment panel
    R(-40, -66, 80, 50, '#6a4422'); R(-38, -64, 76, 46, '#8a5a30');                                        // pin housing
    const bx = -70 - 40 * slide; R(bx - 1, -17, 162, 26, '#3a2410'); R(bx, -16, 160, 24, '#d8a868');     // the bolt
    const hx = [-24, 0, 24]; hx.forEach((x) => R(bx + 70 + x - 5, -16, 10, 24, '#5a3a1c'));
    hx.forEach((x) => { const y = -60 + 44 * drop - 44 * lift; R(x - 4, y, 8, 40, '#3a2410'); R(x - 3, y + 1, 6, 38, '#fde090'); });
    const kx = -150 + 150 * kin - 40 * slide, ky = 12 - 10 * lift;                                         // the key
    if (kin > 0.02) { R(kx - 2, ky - 2, 124, 10, '#3a2410'); R(kx, ky, 120, 6, '#c06a2a'); hx.forEach((x) => { const px = kx + 70 + x; R(px - 3, ky - 10, 6, 10, '#c06a2a'); }); }
  }

  // homemade metal detector: pole from her right fist to a coil skimming the snow, control box + antenna + blinking LED
  function detector(scene) {
    const g = new THREE.Group(); scene.add(g);
    const pole = L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), L.basic(null, 0x5a5e68), 0, 0, 0, g);
    const coil = new THREE.Group(); g.add(coil);
    const ring = L.mesh(new THREE.TorusGeometry(0.11, 0.018, 4, 14), L.basic(null, 0x2a2e38), 0, 0, 0, coil); ring.rotation.x = Math.PI / 2;
    const disc = L.mesh(new THREE.CircleGeometry(0.1, 12), L.basic(null, 0xe8c040, { side: THREE.DoubleSide }), 0, 0, 0, coil); disc.rotation.x = -Math.PI / 2;
    const box = L.box(0.07, 0.05, 0.09, L.basic(null, 0xc83030), 0, 0, 0, g);
    const ant = L.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4), L.basic(null, 0x9aa0aa), 0, 0, 0, g);
    const led = L.mesh(new THREE.SphereGeometry(0.014, 6, 4), L.basic(null, 0x40ff60), 0, 0, 0, g);
    const up = V3([0, 1, 0]);
    g.userData.place = (fist, fwd, sweep, blink) => {
      const c = fist.clone().addScaledVector(fwd, 0.55).add(V3([0, 0, 0])); c.y = 0.06; c.addScaledVector(V3([-fwd.z, 0, fwd.x]), sweep);
      const d = c.clone().sub(fist), len = d.length(); pole.position.copy(fist).addScaledVector(d, 0.5); pole.scale.y = len; pole.quaternion.setFromUnitVectors(up, d.clone().normalize());
      coil.position.copy(c); box.position.copy(fist).addScaledVector(d.clone().normalize(), 0.12).add(V3([0, 0.04, 0])); ant.position.copy(box.position).add(V3([0, 0.12, 0])); ant.rotation.z = 0.25;
      led.position.copy(ant.position).add(V3([0.025, 0.1, 0])); led.material.color.set(blink ? 0xff3030 : 0x40ff60); return c;
    };
    return g;
  }
  // an ice block with the padlock frozen inside (translucent), melting (scale k), cracking, then splitting in two halves
  function iceBlockLock(scene, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const lock = padlock(1.1); lock.position.set(0, 0.06, 0); lock.rotation.set(0.15, 0.4, 0.2); g.add(lock);
    const iceM = L.basic(L.rep(T.ice, 1, 1), 1.15, { transparent: true, opacity: 0.55, depthWrite: false });
    const halves = [-1, 1].map((sd) => { const h = new THREE.Group(); g.add(h); L.box(0.2, 0.34, 0.32, iceM, sd * 0.1, 0.17, 0, h); return h; });
    const cap = L.box(0.42, 0.06, 0.34, L.basic(L.rep(T.snow, 1, 1), 1), 0, 0.37, 0, g);
    const puddle = L.mesh(new THREE.CircleGeometry(0.3, 12), L.basic(null, 0x8ac8f0, { polygonOffset: true, polygonOffsetFactor: -2 }), 0, 0.006, 0, g); puddle.rotation.x = -Math.PI / 2;
    L.drift(g, 0.35, -0.1, 0.35, 0.2, 0.3); L.drift(g, -0.3, 0.15, 0.3, 0.15, 0.25);
    g.userData = { lock, set(melt, split) {   // melt 0..1 shrinks the ice; split 0..1 opens the two halves
      const s1 = 1 - 0.55 * melt; halves.forEach((h, i) => { h.scale.set(s1, s1, s1); const sd = i ? 1 : -1; h.position.x = sd * 0.16 * split; h.rotation.z = -sd * 0.6 * split; });
      cap.visible = melt < 0.35; cap.scale.setScalar(1 - melt); puddle.scale.setScalar(0.4 + melt); } };
    g.userData.set(0, 0); return g;
  }

  const S = [];
  // =====================================================================================================================
  // Digger 04: the alarm clock (sinaboto format: hook first, no "Operator… I found", no discovery). Sets + props in code.
  // =====================================================================================================================
  const PINE = 0xd8b880, NICKEL = 0xd8dce4, PEWTER = 0xa8acb4;
  const UPV = V3([0, 1, 0]);
  function orient(m, a, b) { const d = b.clone().sub(a); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(UPV, d.clone().normalize()); }
  const hideShadow = (ch) => ch.root.children.forEach((o) => { if (o.isMesh && o.geometry.type === 'CircleGeometry') o.visible = false; });
  // lying on the bed: feet at (x, top, zFeet), head toward -z, face up (provisional for the NEW sleep_lie clip)
  // lying / sitting in bed now uses the rig clips (sleep_lie, wake_sit_up, slap_snooze): the root stands ON the mattress top,
  // head on the pillow (root 0.82 m in front of the pillow centre), nothing is rotated rigidly
  function inBed(ch, bd) { ch.root.position.copy(bd.userData.root); ch.root.rotation.set(0, bd.userData.ry || 0, 0); hideShadow(ch); }
  // spring props (user: green areas): leafy tree, bush, flower pot, window box, ivy patch, flower patch on the grass, hedge billboard
  const LEAF = L.cvs(16, 16, (c) => { c.fillStyle = '#3a8a3a'; c.fillRect(0, 0, 16, 16); const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    for (let i = 0; i < 26; i++) r((i * 7) % 16, (i * 11) % 16, 2, 2, i % 3 ? '#4ea84a' : '#2a6a2e'); for (let i = 0; i < 6; i++) r((i * 5 + 3) % 16, (i * 9 + 1) % 16, 1, 1, '#9ad86a'); });
  function leafTree(parent, x, z, h = 3.2, { blossom = false, y = 0 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    L.mesh(new THREE.CylinderGeometry(0.09 * h / 3, 0.14 * h / 3, h * 0.55, 6), L.basic(L.rep(OAK, 1, 2), 0.8), 0, h * 0.275, 0, g);
    for (const [dx, dy, dz, r] of [[0, 0.68, 0, 0.42], [0.22, 0.6, 0.12, 0.3], [-0.2, 0.62, -0.1, 0.32], [0.05, 0.86, 0.05, 0.26]]) {
      const o = L.mesh(new THREE.IcosahedronGeometry(r * h / 1.6, 0), L.basic(L.rep(LEAF, 2, 2), 1.0), dx * h, dy * h, dz * h, g); o.rotation.set(dx * 3, dz * 3, 0); }
    if (blossom) for (let i = 0; i < 9; i++) L.box(0.07, 0.07, 0.07, L.basic(null, i % 2 ? 0xf8c8d8 : 0xffffff), Math.cos(i * 2.1) * 0.5 * h / 1.6, h * (0.6 + (i % 3) * 0.1), Math.sin(i * 2.1) * 0.5 * h / 1.6, g);
    return g;
  }
  function bush(parent, x, z, r = 0.45, y = 0) { const o = L.mesh(new THREE.IcosahedronGeometry(r, 0), L.basic(L.rep(LEAF, 1.5, 1.5), 0.9), x, y + r * 0.55, z, parent); o.scale.y = 0.75; return o; }
  function flowerPot(parent, x, y, z, { col = 0xe84a4a, s = 1 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
    L.mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.16, 8), L.basic(null, 0xb85a32), 0, 0.08, 0, g); L.mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 8), L.basic(null, 0xc86a3e), 0, 0.165, 0, g);
    L.mesh(new THREE.IcosahedronGeometry(0.13, 0), L.basic(L.rep(LEAF, 1, 1), 1.0), 0, 0.25, 0, g);
    for (let i = 0; i < 5; i++) L.box(0.05, 0.05, 0.05, L.basic(null, i % 2 ? col : 0xffe060), Math.cos(i * 1.3) * 0.09, 0.33 + (i % 2) * 0.03, Math.sin(i * 1.3) * 0.09, g);
    return g;
  }
  function windowBox(parent, x, y, z, w = 0.9) {   // planter on a sill: wooden box, greens, red/yellow flowers
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    L.box(w, 0.14, 0.18, L.basic(L.rep(OAK, 2, 0.4), 0.9), 0, 0.07, 0, g);
    for (let i = 0; i < 6; i++) { const xx = -w / 2 + 0.08 + i * (w - 0.16) / 5; L.mesh(new THREE.IcosahedronGeometry(0.08, 0), L.basic(L.rep(LEAF, 1, 1), 1.0), xx, 0.18, 0, g);
      L.box(0.045, 0.045, 0.045, L.basic(null, [0xe84a4a, 0xffe060, 0xf080b0][i % 3]), xx + 0.02, 0.25, 0.03, g); }
    return g;
  }
  const IVY = L.cvs(16, 16, (c) => { for (let i = 0; i < 40; i++) { c.fillStyle = i % 3 ? '#3a8a3a' : '#2a6a2e'; c.fillRect((i * 7) % 15, (i * 5) % 15, 2, 2); } });
  IVY.wrapS = IVY.wrapT = THREE.RepeatWrapping;
  function ivy(parent, x, y, z, w, h, ry = 0) { const o = L.plane(w, h, L.basic(L.rep(IVY, w * 2, h * 2), 1.0, { alphaTest: 0.5, transparent: false, side: THREE.DoubleSide }), x, y, z, parent); o.rotation.y = ry; return o; }
  const FLW = L.cvs(16, 16, (c) => { for (let i = 0; i < 14; i++) { c.fillStyle = ['#ffe060', '#ffffff', '#f080b0', '#e84a4a'][i % 4]; c.fillRect((i * 7) % 15, (i * 11) % 15, 1, 1); } });
  FLW.wrapS = FLW.wrapT = THREE.RepeatWrapping;
  function flowers(parent, x, z, w, d, y = 0.012) { const o = L.plane(w, d, L.basic(L.rep(FLW, w * 2, d * 2), 1.0, { alphaTest: 0.5 }), x, y, z, parent, 0, -Math.PI / 2); return o; }
  function hedgeBB(parent, x, z, w = 2.2, h = 1.0, ry = 0) { const o = L.plane(w, h, L.basic(T.hedge, 1.0, { alphaTest: 0.5, side: THREE.DoubleSide }), x, h / 2, z, parent); o.rotation.y = ry; return o; }
  function zzz(o, x, y, lt) { for (let k = 0; k < 3; k++) { const u = ((lt * 0.9 + k / 3) % 1); bitText(o.tctx, 'Z', Math.round(x + u * 14 + Math.sin(u * 6) * 2), Math.round(y - u * 26), k === 0 ? 1 : 2, '#c8f8ff'); } }
  function ringMarks(o, x, y, t, r = 16) {   // a ringing bell: jittering yellow strokes either side + RRRING
    const c = o.tctx, j = Math.floor(t * 15) % 2;
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const a = (-0.6 + k * 0.6) + (s < 0 ? Math.PI : 0), r0 = r + j * 2;
      c.strokeStyle = '#040412'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * (r0 + 8), y + Math.sin(a) * (r0 + 8)); c.stroke();
      c.strokeStyle = '#ffd93b'; c.lineWidth = 2; c.stroke(); }
  }
  // a bed in code: wooden frame + legs, mattress, pillow, headboard, footboard, quilt (legs only, or the whole body)
  // a duvet over the legs (measured with the rig: lying legs/boots reach 0.30-0.45 m above the mattress, armour is bulky):
  // a half-ellipse arch 1.0 m wide, 0.52 m high, from just below the hips to past the feet -> never clips her
  function duvet(parent, zc, y, len, col, w = 1.02, h = 0.52) {
    const qT = L.cvs(16, 16, (c) => { c.fillStyle = '#' + new THREE.Color(col).getHexString(); c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(0, 0, 8, 8); c.fillRect(8, 8, 8, 8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 16, 1); });
    const o = L.mesh(new THREE.CylinderGeometry(1, 1, len, 10, 1, false, -Math.PI / 2, Math.PI), litM(L.rep(qT, 3, 3), 0xffffff), 0, y, zc, parent);
    o.rotation.x = -Math.PI / 2; o.scale.set(w / 2, 1, h); o.material.side = THREE.DoubleSide;
    const lip = L.mesh(new THREE.CylinderGeometry(1, 1, 0.08, 10, 1, false, -Math.PI / 2, Math.PI), litM(null, 0xf4f0e6, false), 0, y, zc - len / 2, parent); lip.rotation.x = -Math.PI / 2; lip.scale.set(w / 2 + 0.01, 1, h + 0.01);
    return o;
  }
  function bed(parent, { x = 0, z = 0, quilt = 0x4a72b8, full = false } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); g.updateMatrixWorld(true);
    const wood = litM(L.rep(OAK, 1, 2), 0x8a5a34);
    L.box(1.0, 0.16, 2.0, wood, 0, 0.28, 0, g);
    for (const [px, pz] of [[-0.46, -0.96], [0.46, -0.96], [-0.46, 0.96], [0.46, 0.96]]) L.box(0.08, 0.22, 0.08, wood, px, 0.11, pz, g);
    L.box(0.94, 0.12, 1.9, litM(null, 0xe8e2d4), 0, 0.42, 0, g);
    L.box(0.62, 0.05, 0.32, litM(null, 0xf6f2ea), 0, 0.497, -0.76, g);   // thin pillow (the head rests into it)
    L.box(1.06, 0.85, 0.08, wood, 0, 0.62, -1.02, g); L.box(1.12, 0.06, 0.12, wood, 0, 1.06, -1.02, g);
    L.box(1.06, 0.5, 0.08, wood, 0, 0.45, 1.02, g);
    const qT = L.cvs(16, 16, (c) => { const col = '#' + new THREE.Color(quilt).getHexString(); c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(0, 0, 8, 8); c.fillRect(8, 8, 8, 8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 1, 16); });
    // the duvet over the legs and hips (measured: lying legs <= 0.17 m high) -> top 0.24 m above the mattress, no clipping
    const q = duvet(g, 0.58, 0.48, 0.76, quilt);
    g.userData = { top: 0.48, quilt: q, root: V3([x, 0.5, z + 0.06]) }; return g;
  }
  // a room with a REAL window opening in the back wall (the sky + the world outside show through)
  const PTILE = L.cvs(16, 16, (c) => { c.fillStyle = '#bfe4d8'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#f2f0e4'; c.fillRect(0, 0, 8, 8); c.fillRect(8, 8, 8, 8); c.fillStyle = '#8ab8aa'; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 1, 16); c.fillRect(0, 15, 16, 1); c.fillRect(15, 0, 1, 16); });
  function roomWithWindow(scene, { preset = 'morning', wx = 0.9, wy = 1.0, ww = 1.1, wh = 1.25, wall = T.wallpaper, tint = 0.85, outside = true, winter = false } = {}) {
    L.addSky(scene, { near: 14, far: 90, preset });
    L.plane(9, 9, L.basic(L.rep(T.planks, 9 / 1.4, 9 / 1.4), 1.8), 0, 0, 2.9, scene, 0, -Math.PI / 2);
    const sh = new THREE.Shape(); sh.moveTo(-4.5, 0); sh.lineTo(4.5, 0); sh.lineTo(4.5, 3.2); sh.lineTo(-4.5, 3.2); sh.lineTo(-4.5, 0);
    const hp = new THREE.Path(); hp.moveTo(wx - ww / 2, wy); hp.lineTo(wx - ww / 2, wy + wh); hp.lineTo(wx + ww / 2, wy + wh); hp.lineTo(wx + ww / 2, wy); hp.lineTo(wx - ww / 2, wy); sh.holes.push(hp);
    const geo = new THREE.ShapeGeometry(sh); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.0, uv.getY(i) / 1.0);
    L.mesh(geo, L.basic(L.rep(wall, 1, 1), tint, { side: THREE.DoubleSide }), 0, 0, -1.6, scene);
    L.box(9, 0.5, 0.05, L.basic(L.rep(T.planks, 4, 0.4), 0.8), 0, 0.25, -1.57, scene);
    L.plane(6, 3.2, L.basic(L.rep(wall, 6, 3.2), tint * 0.72), -3.0, 1.6, 1.4, scene, Math.PI / 2);
    const fr = litM(L.rep(OAK, 0.3, 1), 0xe8e0d0);   // painted window frame: sill, jambs, lintel, mullion cross
    L.box(ww + 0.24, 0.07, 0.24, fr, wx, wy - 0.035, -1.52, scene); L.box(ww + 0.2, 0.08, 0.12, fr, wx, wy + wh + 0.04, -1.58, scene);
    for (const s of [-1, 1]) L.box(0.07, wh, 0.12, fr, wx + s * (ww / 2 + 0.035), wy + wh / 2, -1.58, scene);
    L.box(0.035, wh, 0.04, fr, wx, wy + wh / 2, -1.6, scene); L.box(ww, 0.035, 0.04, fr, wx, wy + wh * 0.55, -1.6, scene);
    const cur = L.cvs(8, 16, (c) => { c.fillStyle = '#b84040'; c.fillRect(0, 0, 8, 16); c.fillStyle = '#d86060'; for (let x = 0; x < 8; x += 3) c.fillRect(x, 0, 1, 16); });
    for (const s of [-1, 1]) L.box(0.28, wh + 0.4, 0.04, litM(L.rep(cur, 1, 1), 0xffffff), wx + s * (ww / 2 + 0.22), wy + wh / 2 + 0.05, -1.5, scene);
    if (outside) { L.snowField(scene, { w: 60, d: 40, cz: -22 });
      L.house(scene, { x: 1.2, z: -14, w: 5, d: 4, h: 3.4, wall: 'stone', wins: [[0, -1.2, 2.0], [0, 1.2, 2.0]], door: 0 });
      if (winter) { L.plane(60, 40, L.basic(L.rep(T.snowW, 20, 14), 1.0), 0, 0.02, -22, scene, 0, -Math.PI / 2); for (const [x, z, h] of [[-2, -9, 5], [3.5, -11, 6], [6, -8, 4.5]]) L.pine(scene, x, z, h); }
      else { leafTree(scene, -1.6, -7, 4.2, { blossom: true }); leafTree(scene, 3.4, -9, 4.8); leafTree(scene, 6, -6.5, 3.6, { blossom: true }); bush(scene, 0.3, -5.5, 0.8); bush(scene, 2.0, -5.8, 0.6); flowers(scene, 1.0, -6.5, 6, 2.5); } }
    if (!winter) { flowerPot(scene, wx - ww / 2 + 0.15, wy + 0.0, -1.48, { s: 0.8 }); flowerPot(scene, wx + ww / 2 - 0.15, wy + 0.0, -1.48, { col: 0xf080b0, s: 0.7 }); }
    const stand = L.box(0.42, 0.5, 0.36, litM(L.rep(OAK, 0.6, 0.6), 0x9a6a3a), -0.95, 0.25, -0.75, scene);   // nightstand beside her head (her right)
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    return { win: { x: wx, y: wy + wh / 2, z: -1.6, w: ww, h: wh }, stand: V3([-0.95, 0.5, -0.75]) };
  }
  // the sunbeam: a soft additive shaft from the window to a point (opacity animated)
  function sunbeam(scene) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, 1, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    scene.add(m); return m;
  }
  function winRect(cam, w) { const a = L.toScreen(cam, w.x - w.w / 2, w.y + w.h / 2, w.z), b = L.toScreen(cam, w.x + w.w / 2, w.y - w.h / 2, w.z); return [a[0], a[1], b[0] - a[0], b[1] - a[1]]; }
  function sunInWindow(o, cam, w, k, lt, kind = 'sun') {   // the pixel sun rising (k 0..1) behind the window, clipped to the pane
    const c = o.tctx, [x, y, ww, hh] = winRect(cam, w); c.save(); c.beginPath(); c.rect(x, y, ww, hh); c.clip();
    sky(o, kind, x + ww * 0.62, y + hh * (1.15 - 0.75 * k), lt); c.restore();
  }
  // a medieval stone cell (candle alarm): stone walls, small arched night window, plank table, straw cot
  function cellSet(scene) {
    L.addSky(scene, { near: 6, far: 40, preset: 'interior' });
    L.plane(9, 9, L.basic(L.rep(T.stone, 9 / 1.6, 9 / 1.6), 0.9), 0, 0, 2.9, scene, 0, -Math.PI / 2);
    L.plane(9, 3.4, L.basic(L.rep(T.stone, 9 / 1.6, 3.4 / 1.6), 0.62), 0, 1.7, -1.6, scene);
    L.plane(6, 3.4, L.basic(L.rep(T.stone, 6 / 1.6, 3.4 / 1.6), 0.5), -2.6, 1.7, 1.4, scene, Math.PI / 2);
    const nw = L.cvs(12, 20, (c) => { c.fillStyle = '#0c1430'; c.fillRect(0, 0, 12, 20); c.fillStyle = '#f4f0d0'; c.fillRect(7, 4, 2, 2); c.fillRect(3, 9, 1, 1); c.fillRect(8, 13, 1, 1); c.fillStyle = '#2a2a30'; c.fillRect(0, 0, 12, 2); c.fillRect(0, 0, 2, 20); c.fillRect(10, 0, 2, 20); c.fillRect(0, 18, 12, 2); c.fillRect(5, 0, 2, 20); });
    L.plane(0.45, 0.8, L.basic(nw, 1), 1.6, 1.9, -1.58, scene);
    const tb = new THREE.Group(); tb.position.set(0.55, 0, -0.75); scene.add(tb);
    const oak = litM(L.rep(OAK, 1.5, 1), 0xa87848); L.box(1.0, 0.07, 0.6, oak, 0, 0.74, 0, tb);
    for (const [x, z] of [[-0.44, -0.24], [0.44, -0.24], [-0.44, 0.24], [0.44, 0.24]]) L.box(0.06, 0.74, 0.06, litM(null, 0x5a3a1c), x, 0.37, z, tb);
    const book = L.box(0.22, 0.05, 0.16, litM(null, 0x7a2a1a), -0.3, 0.8, 0.05, tb); book.rotation.y = 0.3;
    const cot = new THREE.Group(); cot.position.set(-1.4, 0, -0.55); scene.add(cot);
    L.box(0.8, 0.3, 1.9, litM(L.rep(OAK, 1, 2), 0x7a5030), 0, 0.15, 0, cot); L.box(0.74, 0.1, 1.8, litM(null, 0xc8b070), 0, 0.35, 0, cot);
    L.box(0.52, 0.05, 0.28, litM(null, 0xe0d4b0), 0, 0.42, -0.72, cot); duvet(cot, 0.55, 0.4, 0.8, 0x6a5a40, 0.82);   // wool blanket arched over her legs
    const pl = new THREE.PointLight(0xffc070, 2.4, 5); pl.position.set(0.55, 1.3, -0.6); scene.add(pl);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    return { table: V3([0.55, 0.775, -0.75]), cot: V3([-1.4, 0.4, -0.55]) };
  }
  // the candle alarm: a tall marked candle on a pewter dish, a nail pushed into its side. set(burn 0..1, fall 0..1, nailIn 0..1)
  function candleAlarm(parent, at) {
    const g = new THREE.Group(); g.position.copy(at); parent.add(g);
    L.mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.02, 14), L.basic(null, 0x7a808c), 0, 0.01, 0, g);
    L.mesh(new THREE.TorusGeometry(0.165, 0.01, 4, 16), L.basic(null, 0xc8ccd6), 0, 0.02, 0, g).rotation.x = Math.PI / 2;
    const hl = L.box(0.12, 0.002, 0.018, L.basic(null, 0xf4f6fa), -0.05, 0.0215, 0.09, g); hl.rotation.y = 0.5;
    L.mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 10), litM(null, 0xc8a040), 0, 0.04, 0, g);
    const H0 = 0.46, NY = 0.2;
    const wax = L.mesh(new THREE.CylinderGeometry(0.035, 0.037, 1, 10), litM(null, 0xf4ecd0, false), 0, 0, 0, g);
    const marks = [0.12, 0.2, 0.28, 0.36, 0.44].map((y) => { const r = L.mesh(new THREE.TorusGeometry(0.037, 0.003, 3, 12), L.basic(null, 0xc83030), 0, 0.06 + y, 0, g); r.rotation.x = Math.PI / 2; return r; });
    const flame = new THREE.Group(); g.add(flame);
    L.mesh(new THREE.ConeGeometry(0.022, 0.07, 6), L.basic(null, 0xffa030), 0, 0.045, 0, flame); L.mesh(new THREE.ConeGeometry(0.011, 0.04, 5), L.basic(null, 0xfff0a0), 0, 0.035, 0.004, flame);
    L.mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.02, 3), L.basic(null, 0x141414), 0, 0.005, 0, flame);
    const drips = [[0.03, 0.1], [-0.025, 0.2], [0.02, 0.32]].map(([x, y]) => { const d = L.mesh(new THREE.SphereGeometry(0.012, 5, 4), litM(null, 0xf8f0dc), x, 0.06 + y, 0.02, g); d.scale.y = 1.8; return d; });
    const nail = new THREE.Group(); g.add(nail);
    L.box(0.11, 0.012, 0.012, litM(null, 0x4a4e58), 0.055, 0, 0, nail); L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 8), litM(null, 0x4a4e58), 0.11, 0, 0, nail).rotation.z = Math.PI / 2;
    g.userData.set = (burn, fall, nin = 1) => {
      const top = H0 - burn * (H0 - NY + 0.01), h = Math.max(0.02, top);
      wax.scale.y = h; wax.position.y = 0.06 + h / 2; flame.position.y = 0.06 + h; marks.forEach((m) => (m.visible = m.position.y < 0.06 + h)); drips.forEach((d) => (d.visible = d.position.y < 0.06 + h - 0.02));
      if (fall <= 0) { nail.position.set(0.035 - 0.05 * (1 - nin) + 0.0, 0.06 + NY, 0); nail.rotation.set(0, 0, 0); nail.visible = nin > 0 || true; }
      else { const u = clamp01(fall); nail.position.set(0.04 + 0.06 * u, 0.06 + NY - (NY + 0.02) * u * u, 0.02 * u); nail.rotation.set(0, 0.4 * u, -0.9 * u); }
    };
    g.userData.set(0, 0); g.userData.flameW = () => flame.getWorldPosition(new THREE.Vector3()); g.userData.NY = NY; g.userData.H0 = H0; return g;
  }
  // 1800s mill at night: brick block with rows of lit windows, a tall chimney (smoke FX), a brick wall with an iron gate + clock
  function millSet(scene) {
    L.addSky(scene, { near: 12, far: 90, preset: 'night' });
    L.plane(60, 40, L.basic(L.rep(T.rubble, 60 / 1.4, 40 / 1.4), 0.8), 0, 0, 0, scene, 0, -Math.PI / 2);
    const wins = []; for (const y of [1.4, 2.9, 4.4]) for (let x = -4; x <= 4; x += 1.6) wins.push([0, x, y]);
    L.house(scene, { x: 0, z: -7, w: 10.5, d: 6, h: 5.6, wall: 'brick', roofH: 1.4, wins, chimney: false });
    const brick = L.basic(L.rep(T.brick, 1, 6), 0.9);
    L.mesh(new THREE.CylinderGeometry(0.45, 0.6, 12, 10), brick, 3.6, 6, -9.5, scene); L.mesh(new THREE.CylinderGeometry(0.55, 0.5, 0.4, 10), L.basic(null, 0x3a2a24), 3.6, 12.1, -9.5, scene);
    for (const s of [-1, 1]) { L.box(4.2, 2.2, 0.35, L.basic(L.rep(T.brick, 3, 1.5), 0.85), s * 3.5, 1.1, -2.2, scene); L.box(0.6, 2.8, 0.6, L.basic(L.rep(T.brick, 0.5, 2), 0.95), s * 1.45, 1.4, -2.2, scene); }
    const gate = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 1.15, 0, -2.2); scene.add(p);
      for (let k = 0; k < 6; k++) { L.box(0.035, 2.0, 0.035, L.basic(null, 0x1a1b20), -s * (0.1 + k * 0.19), 1.0, 0, p); L.mesh(new THREE.ConeGeometry(0.03, 0.09, 4), L.basic(null, 0x1a1b20), -s * (0.1 + k * 0.19), 2.04, 0, p); }
      for (const y of [0.3, 1.7]) L.box(1.12, 0.05, 0.04, L.basic(null, 0x1a1b20), -s * 0.56, y, 0, p); return p; });
    const clk = L.cvs(24, 24, (c) => { c.fillStyle = '#f4ecd0'; c.beginPath(); c.arc(12, 12, 11, 0, 7); c.fill(); c.strokeStyle = '#2a2a30'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#2a2a30'; for (let k = 0; k < 12; k++) c.fillRect(Math.round(12 + Math.cos(k / 12 * 6.283) * 8), Math.round(12 + Math.sin(k / 12 * 6.283) * 8), 1, 1);
      c.lineWidth = 2; c.beginPath(); c.moveTo(12, 12); c.lineTo(12, 18); c.stroke(); c.lineWidth = 1; c.beginPath(); c.moveTo(12, 12); c.lineTo(13, 4); c.stroke(); });
    L.mesh(new THREE.CircleGeometry(0.32, 16), L.basic(clk, 1), 0, 2.55, -2.0, scene); L.box(0.8, 0.8, 0.2, L.basic(L.rep(T.brick, 0.6, 0.6), 0.9), 0, 2.55, -2.12, scene);
    L.lamp(scene, -2.6, -1.4, 3.2); L.lamp(scene, 2.8, -1.4, 3.2);
    for (const [x, z, h] of [[-9, -9, 6], [9, -10, 7]]) L.pine(scene, x, z, h);
    ivy(scene, -3.9, 2.2, -3.98, 2.2, 3.6); ivy(scene, 4.0, 1.6, -3.98, 1.6, 2.6); ivy(scene, -3.5, 1.0, -2.0, 2.0, 1.4); ivy(scene, 3.8, 1.2, -2.0, 1.4, 1.8);
    L.plane(14, 3, L.basic(L.rep(T.snow, 4, 1), 1.0), 0, 0.006, 2.6, scene, 0, -Math.PI / 2);   // grass verge in front of the wall
    leafTree(scene, -5.4, 1.6, 4.4); leafTree(scene, 5.6, 1.2, 3.8, { blossom: true }); bush(scene, -2.0, -1.6, 0.5); bush(scene, 2.2, -1.6, 0.55); bush(scene, -6.5, 0.6, 0.7);
    flowers(scene, -4.5, 2.4, 3, 1.2); flowers(scene, 4.2, 2.6, 3, 1.2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    return { gate, smoke: [3.6, 12.3, -9.5] };
  }
  // NPC dressing (lib-mml rigs, recoloured): flat cap, top hat, tricorn, nightcap, bonnet + shawl, long bamboo pole
  // hats (user v1 review): PS1 low poly with small textures like the NPCs, sized from the measured head (top + width) and
  // ATTACHED to the head-carrying bone (Bone001), so they follow every pose with no gap, float or hair poking through
  function headInfo(n) {
    n.updateMatrixWorld(true); let sk = null; n.traverse((o) => { if (o.isSkinnedMesh && !sk) sk = o; });
    const pos = sk.geometry.attributes.position, v = new THREE.Vector3(), pts = [];
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); sk.applyBoneTransform(i, v); v.applyMatrix4(sk.matrixWorld); pts.push(n.worldToLocal(v.clone())); }
    const top = Math.max(...pts.map((p) => p.y)), hd = pts.filter((p) => p.y > top - 0.2);
    const xs = hd.map((p) => p.x), zs = hd.map((p) => p.z);
    return { top, cx: (Math.min(...xs) + Math.max(...xs)) / 2, cz: (Math.min(...zs) + Math.max(...zs)) / 2, rx: (Math.max(...xs) - Math.min(...xs)) / 2, rz: (Math.max(...zs) - Math.min(...zs)) / 2 };
  }
  function seat(n, hat) { const h = headInfo(n); hat.position.set(h.cx, h.top, h.cz); hat.userData.h = h; n.add(hat); n.updateMatrixWorld(true); const b = n.bones.Bone001 || n; b.attach(hat); return hat; }
  const texT = (fn) => L.cvs(16, 16, fn);
  const TWEED = texT((c) => { c.fillStyle = '#5a5248'; c.fillRect(0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { c.fillStyle = '#6e665a'; c.fillRect(i, 0, 1, 16); c.fillStyle = '#4a433a'; c.fillRect(0, i, 16, 1); } });
  const FELT = texT((c) => { c.fillStyle = '#1e1e24'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#2c2c34'; for (let i = 0; i < 10; i++) c.fillRect((i * 7) % 16, (i * 5) % 16, 2, 1); c.fillStyle = '#c8a040'; c.fillRect(0, 14, 16, 2); });
  const STRIPE = texT((c) => { for (let y = 0; y < 16; y += 4) { c.fillStyle = '#f2ece0'; c.fillRect(0, y, 16, 2); c.fillStyle = '#c84040'; c.fillRect(0, y + 2, 16, 2); } });
  const PLUM = texT((c) => { c.fillStyle = '#4a2a4a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#5e3a5e'; for (let i = 0; i < 12; i++) c.fillRect((i * 5) % 16, (i * 7) % 16, 2, 1); c.fillStyle = '#d8c0a0'; c.fillRect(0, 0, 16, 1); });
  function capOf(n, kind) {
    const h = headInfo(n), g = new THREE.Group(), r = Math.max(h.rx, h.rz);
    if (kind === 'flat') {   // flat cap: low dome (8 sides) a bit wider than the head + a short peak in front
      const c = L.mesh(new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), L.basic(L.rep(TWEED, 2, 1), 1), 0, -0.06, 0.0, g); c.scale.set(h.rx * 1.06, r * 0.72, h.rz * 1.08);
      const pk = L.box(h.rx * 1.3, 0.022, r * 0.5, L.basic(L.rep(TWEED, 1, 1), 0.8), 0, -0.055, h.rz * 1.0, g); pk.rotation.x = 0.12;
      L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 6), L.basic(null, 0x4a433a), 0, r * 0.57, 0.01, g);
    }
    if (kind === 'tricorn') {   // tricorn: felt crown + three cocked brim walls with gold trim, one point to the front
      L.mesh(new THREE.CylinderGeometry(r * 0.95, r * 1.05, r * 0.6, 8), L.basic(L.rep(FELT, 2, 1), 1), 0, r * 0.18, 0, g);
      for (let k = 0; k < 3; k++) { const a = k * 2.094 + Math.PI / 3, w = L.box(r * 2.0, r * 0.55, 0.035, L.basic(L.rep(FELT, 2, 1), 1), Math.sin(a) * r * 0.95, r * 0.1, Math.cos(a) * r * 0.95, g); w.rotation.set(-0.35, a, 0); }
    }
    if (kind === 'nightcap') {   // striped stocking cap flopping to one side, red pompom
      const b = L.mesh(new THREE.CylinderGeometry(r * 0.75, h.rx * 1.12, r * 0.8, 8, 1, true), L.basic(L.rep(STRIPE, 2, 1), 1, { side: THREE.DoubleSide }), 0, r * 0.25, 0, g);
      const tip = L.mesh(new THREE.ConeGeometry(r * 0.75, r * 1.7, 8, 1, true), L.basic(L.rep(STRIPE, 2, 2), 1, { side: THREE.DoubleSide }), r * 0.45, r * 0.95, 0, g); tip.rotation.z = -0.95;
      L.mesh(new THREE.IcosahedronGeometry(r * 0.28, 0), L.basic(null, 0xd83030), r * 1.25, r * 1.2, 0, g);
    }
    if (kind === 'bonnet') {   // bonnet: a hood over the top and back of the head, a brim framing the face, ribbon bow under the chin
      const hood = L.mesh(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.62), L.basic(L.rep(PLUM, 2, 2), 1, { side: THREE.DoubleSide }), 0, -r * 0.55, -h.rz * 0.12, g);
      hood.scale.set(h.rx * 1.08, r * 1.0, h.rz * 1.12); hood.rotation.x = -0.45;
      const brim = L.mesh(new THREE.TorusGeometry(r * 0.98, r * 0.11, 4, 10, Math.PI * 1.25), L.basic(L.rep(PLUM, 1, 1), 1.15), 0, -r * 0.6, h.rz * 0.55, g); brim.rotation.set(-0.25, 0, -Math.PI * 0.125);
      for (const sx of [-1, 1]) L.box(r * 0.45, r * 0.22, 0.03, L.basic(null, 0xd8c0a0), sx * r * 0.22, -r * 1.75, h.rz * 0.8, g);
    }
    return seat(n, g);
  }
  function flatCap(n) { capOf(n, 'flat'); return n; }
  function tricorn(n) { capOf(n, 'tricorn'); return n; }
  function nightcap(n) { capOf(n, 'nightcap'); return n; }
  function bonnet(n) { capOf(n, 'bonnet'); const h = headInfo(n);
    const sh = L.mesh(new THREE.CylinderGeometry(h.rx * 1.25, h.rx * 2.0, 0.2, 8, 1, true), L.basic(L.rep(PLUM, 3, 1), 0.85, { side: THREE.DoubleSide }), h.cx, h.top - 0.5, h.cz, n); n.updateMatrixWorld(true); (n.bones.Bone001 || n).attach(sh); return n; }
  const _ax = V3([1, 0, 0]), _qq = new THREE.Quaternion();
  function npcSet(n, name, a) { if (n.bones[name]) n.bones[name].quaternion.copy(n.rest[name]).multiply(_qq.setFromAxisAngle(_ax, a)); }
  function npcHand(n, side = 'R') { n.updateMatrixWorld(true); return n.bones[side === 'R' ? 'Bone005' : 'Bone003'].localToWorld(V3([0, 0.24, 0])); }
  function bamboo(len = 3.2) { const g = new THREE.Group(); const m = L.mesh(new THREE.CylinderGeometry(0.014, 0.016, 1, 6), litM(null, 0xc8a860), 0, 0, 0, g);
    for (let k = 1; k < 8; k++) L.mesh(new THREE.TorusGeometry(0.017, 0.004, 3, 8), litM(null, 0x8a6a30), 0, -0.5 + k / 8, 0, m).rotation.x = Math.PI / 2;
    const wire = L.box(0.06, 0.012, 0.012, litM(null, 0x5a5a62), 0.02, 0.5, 0, m); g.userData.rod = m; return g; }
  function placeRod(rod, a, b) { orient(rod.userData.rod, a, b); }
  function peaShooter() { const g = new THREE.Group(); g.userData.noGrade = true; const t = L.mesh(new THREE.CylinderGeometry(0.022, 0.019, 1, 8), L.basic(null, 0x9a6a3a), 0, 0, 0, g); L.mesh(new THREE.CylinderGeometry(0.0225, 0.0225, 0.12, 8), L.basic(null, 0x6a4422), 0, -0.3, 0, t); L.mesh(new THREE.TorusGeometry(0.022, 0.005, 3, 8), litM(null, 0x9aa0aa), 0, 0.48, 0, t).rotation.x = Math.PI / 2; t.scale.y = 0.32; g.userData.tube = t; return g; }
  function pea(scene) { const p = L.mesh(new THREE.IcosahedronGeometry(0.03, 1), L.basic(null, 0x8ad040), 0, 0, 0, scene); p.userData.noGrade = true; return p; }
  function coin(sc = 1, col = 0xd8dce4) { const g = new THREE.Group(); const c = L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 12), litM(null, col), 0, 0, 0, g); c.rotation.x = Math.PI / 2; L.box(0.02, 0.004, 0.001, L.basic(null, 0x8a8e98), 0, 0, 0.0035, g); g.scale.setScalar(sc); return g; }
  // clocks: Hutchins' pine case wall clock (1787) with a bell; the 1876 twin-bell wind-up; the 1956 snooze clock; a phone
  function dialTex(h, m, { bg = '#f8f4e8', fg = '#141414', red = false } = {}) { return L.cvs(32, 32, (c) => { c.fillStyle = bg; c.beginPath(); c.arc(16, 16, 15, 0, 7); c.fill(); c.strokeStyle = fg; c.lineWidth = 1; c.beginPath(); c.arc(16, 16, 15, 0, 7); c.stroke();
    c.fillStyle = fg; for (let k = 0; k < 12; k++) c.fillRect(Math.round(16 + Math.cos(k / 12 * 6.283) * 12) - (k % 3 ? 0 : 1), Math.round(16 + Math.sin(k / 12 * 6.283) * 12) - (k % 3 ? 0 : 1), k % 3 ? 1 : 2, k % 3 ? 1 : 2);
    const ah = (h % 12 + m / 60) / 12 * 6.283 - Math.PI / 2, am = m / 60 * 6.283 - Math.PI / 2;
    c.strokeStyle = fg; c.lineWidth = 2; c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.cos(ah) * 7, 16 + Math.sin(ah) * 7); c.stroke(); c.lineWidth = 1; c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.cos(am) * 11, 16 + Math.sin(am) * 11); c.stroke();
    if (red) { c.strokeStyle = '#d83030'; c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.cos(ah) * 10, 16 + Math.sin(ah) * 10); c.stroke(); } }); }
  function hutchinsClock(parent, at) {
    const g = new THREE.Group(); g.position.copy(at); parent.add(g);
    const pine = litM(L.rep(OAK, 0.6, 1.2), PINE);
    L.box(0.38, 0.76, 0.16, pine, 0, 0.38, 0, g); L.box(0.44, 0.05, 0.2, pine, 0, 0.78, 0, g); L.box(0.44, 0.05, 0.2, pine, 0, -0.02, 0, g);
    L.mesh(new THREE.CircleGeometry(0.13, 16), L.basic(dialTex(4, 0, { red: true }), 1), 0, 0.56, 0.085, g); L.mesh(new THREE.TorusGeometry(0.135, 0.012, 4, 16), litM(null, BRASS), 0, 0.56, 0.085, g);
    L.box(0.28, 0.3, 0.01, L.basic(null, 0xa8c8d8), 0, 0.2, 0.085, g); L.box(0.3, 0.32, 0.008, litM(null, 0x7a5030), 0, 0.2, 0.081, g);   // mirror on the door
    const bell = L.mesh(new THREE.SphereGeometry(0.08, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), litM(null, BRASS), 0, 0.83, 0, g);
    const ham = L.mesh(new THREE.SphereGeometry(0.018, 6, 4), litM(null, 0x2a2a30), 0.1, 0.86, 0, g);
    g.userData.ring = (t) => { ham.position.x = 0.09 + (Math.floor(t * 15) % 2) * 0.02; }; g.userData.dialW = () => g.localToWorld(V3([0, 0.56, 0.09])); return g;
  }
  function twinBell(sc = 1, h = 7, m = 0) {
    const g = new THREE.Group(), nk = litM(null, NICKEL);
    const body = L.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16), nk, 0, 0.12, 0, g); body.rotation.x = Math.PI / 2;
    L.mesh(new THREE.CircleGeometry(0.078, 16), L.basic(dialTex(h, m), 1), 0, 0.12, 0.031, g);
    for (const s of [-1, 1]) { const b = L.mesh(new THREE.SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), nk, s * 0.065, 0.225, 0, g); b.rotation.z = -s * 0.5;
      L.box(0.012, 0.06, 0.012, nk, s * 0.06, 0.03, 0, g).rotation.z = s * 0.4; }
    const ham = L.box(0.01, 0.06, 0.01, nk, 0, 0.23, 0, g); L.mesh(new THREE.SphereGeometry(0.012, 5, 4), nk, 0, 0.26, 0, g);
    L.mesh(new THREE.TorusGeometry(0.025, 0.006, 4, 10), nk, 0, 0.25, 0, g);
    g.userData.ring = (t) => { ham.rotation.z = (Math.floor(t * 20) % 2 ? 0.35 : -0.35); }; g.scale.setScalar(sc); return g;
  }
  function snoozClock(sc = 1) {   // 1956: a pastel plastic bedside clock with a big bar button on top
    const g = new THREE.Group(), body = litM(null, 0x9ad8c0), cream = litM(null, 0xf4ecd8);
    L.box(0.3, 0.16, 0.12, body, 0, 0.08, 0, g); L.box(0.32, 0.03, 0.14, cream, 0, 0.005, 0, g);
    L.mesh(new THREE.CircleGeometry(0.065, 16), L.basic(dialTex(7, 0, { bg: '#fff8e0' }), 1), -0.06, 0.085, 0.061, g);
    const lab = L.cvs(40, 12, (c) => { c.fillStyle = '#f4ecd8'; c.fillRect(0, 0, 40, 12); bitText(c, 'SNOOZ', 20, 6, 1, '#c83030', { outline: null }); });
    L.plane(0.1, 0.035, L.basic(lab, 1), 0.08, 0.1, 0.061, g);
    const btn = new THREE.Group(); btn.position.y = 0.175; g.add(btn); L.box(0.22, 0.03, 0.08, litM(null, 0xc83a2a), 0, 0, 0, btn); L.box(0.2, 0.012, 0.064, litM(null, 0xff7a64), 0, 0.019, 0, btn);
    for (let k = -2; k <= 2; k++) L.box(0.012, 0.006, 0.05, litM(null, 0x9a2a1e), k * 0.035, 0.027, 0, btn);
    g.userData.press = (k) => { btn.position.y = 0.175 - 0.018 * k; }; g.userData.btn = btn; g.scale.setScalar(sc); return g;
  }
  function phone() {
    const g = new THREE.Group(); L.box(0.075, 0.15, 0.01, L.basic(null, 0x141418), 0, 0, 0, g);
    const scr = L.cvs(16, 32, (c) => { c.fillStyle = '#1a2a5a'; c.fillRect(0, 0, 16, 32); c.fillStyle = '#ffffff'; c.fillRect(3, 6, 10, 4); c.fillStyle = '#ffd93b'; c.fillRect(6, 13, 4, 4); c.fillRect(5, 17, 6, 1); c.fillStyle = '#fe2c55'; c.fillRect(2, 24, 12, 4); });
    L.plane(0.066, 0.135, L.basic(scr, 1), 0, 0, 0.0055, g); return g;
  }
  // the ending: the village edge at sunrise (snowy rock ledge, bench, the village below)
  // the ending: a grassy ledge (top y = 0, edge along x = -0.7) with a 5.5 m stone drop to a green valley: fields, trees,
  // a river of flowers and the village below; sunrise sky
  function ledgeSet(scene) {
    L.addSky(scene, { near: 25, far: 160, preset: 'morning' });
    const VY = -5.5, grass = (w, d) => L.basic(L.rep(T.snow, w / 3, d / 3), 1.0);
    L.box(9, 0.6, 14, grass(9, 14), 3.8, -0.3, -2, scene);                                      // the ledge
    L.box(0.6, 5.5, 14, L.basic(L.rep(T.stone, 1, 3), 0.85), -0.95, VY / 2 - 0.1, -2, scene);     // cliff face
    for (let i = 0; i < 9; i++) { const r = L.mesh(new THREE.IcosahedronGeometry(0.35 + (i % 3) * 0.15, 0), L.basic(L.rep(T.stone, 1, 1), 0.8), -1.15 - (i % 2) * 0.2, -0.6 - i * 0.55, 1.5 - i * 1.1, scene); r.scale.y = 0.7; }
    for (let k = 0; k < 6; k++) { const x = -0.45, z = 2.4 - k * 0.6; L.box(0.06, 0.7, 0.06, litM(L.rep(OAK, 0.2, 1), 0x8a5a34), x, 0.35, z, scene); }
    for (const y of [0.3, 0.6]) L.box(0.04, 0.05, 3.1, litM(L.rep(OAK, 2, 0.2), 0x9a6a3a), -0.45, y, 0.9, scene);   // a wooden rail along the edge
    L.plane(160, 160, L.basic(L.rep(T.snow, 160 / 3, 160 / 3), 0.72), -60, VY, -40, scene, 0, -Math.PI / 2);   // the valley floor (darker: it reads as far below)
    for (let i = 0; i < 12; i++) { const r = L.mesh(new THREE.IcosahedronGeometry(0.22 + (i % 3) * 0.1, 0), L.basic(L.rep(T.stone, 1, 1), 0.9), -0.72, 0.02, 3.0 - i * 0.8, scene); r.scale.y = 0.55; }   // stone lip on the edge
    for (let i = 0; i < 7; i++) L.plane(4, 26, L.basic(null, [0x6a9a3a, 0x8ab84a, 0xc8b860, 0x5a8a32][i % 4]), -9 - i * 4.2, VY + 0.01, -30, scene, 0, -Math.PI / 2);   // fields
    for (let i = 0; i < 5; i++) flowers(scene, -6 - i * 5, -12 - i * 3, 4, 3, VY + 0.02);
    const vil = new THREE.Group(); vil.position.set(-16, VY, -26); scene.add(vil);
    L.house(vil, { x: 0, z: 0, w: 6, d: 5, h: 4.0, wall: 'stone', wins: [[0, -1.5, 2.4], [0, 1.6, 2.4]], door: 0 });
    L.house(vil, { x: 7.5, z: -3, w: 5.5, d: 5, h: 3.4, wall: 'planks', roofH: 2.2, wins: [[0, 1.2, 2.0]], door: -1.0 });
    L.house(vil, { x: -7, z: -5, w: 6, d: 5, h: 4.4, wall: 'stone', wins: [[0, -1.5, 2.6], [0, 1.5, 2.6]], door: 0 });
    L.house(vil, { x: 3, z: -12, w: 7, d: 5, h: 5.0, wall: 'brick', wins: [[0, -2, 1.6], [0, 0, 1.6], [0, 2, 1.6]], door: 0 });
    for (const [x, z, h, b] of [[-3.5, 5, 4.5, 1], [4, 4, 3.8, 0], [12, 2, 5, 1], [-11, 2, 4.2, 0], [9, -9, 4.4, 0], [-4, -14, 5, 1]]) leafTree(vil, x, z, h, { blossom: !!b });
    for (const [x, z, h] of [[-2, -40, 6], [8, -46, 7], [-20, -44, 8]]) leafTree(scene, x - 16, z, h, { y: VY });
    leafTree(scene, 3.4, -1.6, 3.8, { blossom: true }); bush(scene, 2.2, -0.6, 0.55); bush(scene, 4.4, 0.6, 0.6); flowers(scene, 2.2, 2.0, 3, 2); flowers(scene, 0.6, -0.8, 1.6, 1.4);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    return { y: 0 };
  }
  // terraced street for the knocker-up scenes: streetSet + a lit pane that switches on when the sleeper wakes
  function knockStreet(scene, { preset = 'night' } = {}) {
    const st = streetSet(scene, { preset }); st.shutters.forEach((p) => (p.visible = false));
    const lit = L.plane(WIN.w, WIN.y1 - WIN.y0, L.basic(null, 0xffc870), WIN.x, (WIN.y0 + WIN.y1) / 2, -0.25, scene); lit.visible = false; lit.userData.noGrade = true;
    const pane = L.plane(WIN.w, WIN.y1 - WIN.y0, L.basic(T.win, 1.0, { transparent: true, opacity: 0.55 }), WIN.x, (WIN.y0 + WIN.y1) / 2, 0.01, scene);
    windowBox(scene, 1.7, 0.72, 0.12, 0.8); windowBox(scene, 1.7, 2.47, 0.12, 0.8); windowBox(scene, -1.6, 2.47, 0.12, 0.8);
    ivy(scene, -2.6, 2.3, 0.03, 0.9, 4.2); ivy(scene, 2.75, 1.4, 0.03, 0.5, 2.6);
    flowerPot(scene, -0.95, 0, 0.3, { s: 1.6 }); flowerPot(scene, -2.2, 0, 0.35, { col: 0xf080b0, s: 1.4 }); bush(scene, 3.4, 0.6, 0.5);
    leafTree(scene, -4.4, 2.6, 4.2); leafTree(scene, 4.6, 3.0, 3.8, { blossom: true });
    return { lit, pane, tgt: V3([WIN.x + 0.2, (WIN.y0 + WIN.y1) / 2 + 0.1, 0.06]) };
  }
  const nightGrade = (scene, keep = []) => { keep = [].concat(keep).map((k) => k.root || k);
    grade(scene, [0.2, 0.22, 0.46], { lit: true, skip: (o) => { let p = o; while (p) { if (keep.includes(p) || p.userData.noGrade) return true; p = p.parent; } return false; } });
    keep.forEach((k) => grade(k, [0.6, 0.62, 0.85])); };

  // ===== 1. "If you sleep facing a window… you have an alarm clock."  OPENING: her bedroom at dawn, she sleeps facing the
  // window; the pixel sun climbs into the pane, a sunbeam crawls up the quilt onto her face
  S.push({ at: [1, 'If'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true });
    const ch = hero(scene); inBed(ch, bd);
    const beam = sunbeam(scene); const tW = ws(1, 'window'), tA = ws(1, 'alarm');
    cue(0, 'birds_dawn'); cue(t0 + 0.2, 'snore'); cue(tW, 'sun_shimmer');
    const fx = new FX(LW, LH).add('sparkle', { world: [0.9, 1.6, -1.6], t0: tW, dur: 9, n: 3, radius: 18 });
    const cam = camera({ p: [[-1.15, 1.6, 0.75], [-1.05, 1.55, 0.6]], l: [[0.3, 0.95, -1.0], [0.3, 0.95, -1.05]], fov: [58] });
    return { scene, camera: cam, fx, update(lt, t) {
      ch.drive(t, [seg('sleep_lie', -99, { loop: true })], [[-99, 'blink', 'cat']], false);
      const k = smooth((q15(t) - t0) / Math.max(0.5, tA - t0)); orient(beam, V3([0.9, 1.6, -1.6]), V3([-0.2 + 0.3 * (1 - k), 0.6, -0.5 + 0.9 * (1 - k)])); beam.material.opacity = 0.04 + 0.1 * k; beam.scale.x = beam.scale.z = 0.7; cam.go(t, t0, t1);
    }, overlay(lt, dt, a, o) { const t = t0 + lt; sunInWindow(o, cam, R0.win, smooth((t - t0) / Math.max(0.5, tA - t0)), lt); const p = L.toScreen(cam, -0.2, 0.75, -0.6); zzz(o, p[0] + 6, p[1] - 8, lt); } };
  } });

  // ===== 2. "…alarm clock."  close-up: the sunbeam hits her eyes, she sits up squinting (NEW wake_sit_up; provisional sit_floor)
  S.push({ at: [1, 'alarm'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15 });
    const ch = hero(scene); inBed(ch, bd);
    const beam = sunbeam(scene); orient(beam, V3([0.9, 1.6, -1.6]), V3([-0.2, 1.05, -0.6])); beam.scale.x = beam.scale.z = 0.7; beam.material.opacity = 0.09;
    const tC = ws(1, 'clock'); cue(t0, 'sun_sting'); cue(t0 + 0.1, 'gasp');
    const fx = new FX(LW, LH).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0, 0.42, 0], t0, dur: 9, scale: 0.8 }).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.1, 0.1, 0.1], t0, dur: 9, n: 3, radius: 14 });
    const cam = camera({ p: [[0.3, 1.25, 0.95], [0.26, 1.22, 0.82]], l: [[-0.2, 1.05, -0.3]], fov: [42] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('wake_sit_up', t0 - 0.1)], [[-99, 'surprised', 'gasp'], [t0 + 0.45, 'half', 'frown']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; sunInWindow(o, cam, R0.win, 1, lt); popLabel(o, t, tC, 'ALARM CLOCK', 135, 70, 20); } };
  } });

  // ===== 3. "But in winter… the sun shows up late."  the same window in winter: snow, dark blue; the clock plate runs late
  S.push({ at: [2, 'But'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.9, winter: true }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true });
    const ch = hero(scene); inBed(ch, bd); grade(scene, [0.55, 0.62, 0.95], { skip: isHero(ch) });
    const sf = L.snowfall(scene, { cx: 0.9, cz: -4, R: 3 }); const tL = ws(2, 'late'); cue(t0 + 0.1, 'wind_winter'); cue(tL, 'clock_tick_fast');
    const cam = camera({ p: [[-1.15, 1.6, 0.75], [-1.08, 1.57, 0.65]], l: [[0.3, 0.95, -1.0]], fov: [58] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('sleep_lie', -99, { loop: true })], [[-99, 'blink', 'cat']], false); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; const k = clamp01((t - t0) / Math.max(0.5, t1 - t0 - 0.2)); sunInWindow(o, cam, R0.win, t >= tL ? 0.25 * smooth((t - tL) / 0.8) : 0, lt);
        const mins = 6 * 60 + Math.round(k * 165), hh = Math.floor(mins / 60), mm = mins % 60, late = t >= tL;
        plateText(o, `0${hh}:${String(mm).padStart(2, '0')}`, 135, 56, { size: 14, border: late ? '#ff6a6a' : '#7cf0ff', fg: late ? '#ffd0d0' : '#c8f8ff' });
        if (late) plateText(o, 'LATE', 135, 92, { size: 14, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tL) });
        const p = L.toScreen(cam, -0.2, 0.75, -0.6); zzz(o, p[0] + 6, p[1] - 8, lt); } };
  } });

  // ===== 4. "So people pushed a nail into a candle."  a stone cell at night: she pushes a nail into a marked candle (NEW push_nail)
  S.push({ at: [3, 'So'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const C0 = cellSet(scene); const ca = candleAlarm(scene, C0.table.clone().add(V3([0.15, 0, 0.05])));
    const ch = hero(scene, { p: [1.35, 0, -0.25], ry: -1.2 }); const nl = (() => { const n = new THREE.Group(); L.box(0.045, 0.045, 0.36, L.basic(null, 0xc8ccd6), 0, 0, 0.14, n); L.box(0.1, 0.1, 0.035, L.basic(null, 0x2a2e38), 0, 0, -0.04, n); scene.add(n); return n; })(); const fp = new THREE.Vector3(), cw = new THREE.Vector3();
    const tC = ws(3, 'candle'); cue(tC, 'nail_push');
    const fx = new FX(LW, LH).add('sparkle', { world: [0.75, 1.05, -0.7], t0: tC, dur: 9, n: 3, radius: 12 }).add('heat', { world: [0.7, 1.32, -0.7], t0, dur: 9, lines: 2, rise: 14 });
    const cam = camera({ p: [[-0.1, 1.4, 2.0], [-0.05, 1.38, 1.85]], l: [[1.05, 1.0, -0.4]], fov: [52] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t), nin = smooth((q - tC + 0.4) / 0.4); ca.userData.set(0.05, 0, nin); nl.visible = nin < 1;
      ch.drive(t, [seg('push_nail', tC - 0.55)], [[-99, 'open', 'smile'], [tC - 0.2, 'half', 'frown'], [tC + 0.3, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); ca.getWorldPosition(cw); cw.y += 0.26; nl.position.copy(fp); nl.lookAt(cw); cam.go(t, t0, t1); } };
  } });

  // ===== 5. "When the wax melted… the nail dropped onto a metal plate."  the candle burns down past the marks, the nail falls
  S.push({ at: [3, 'When'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const C0 = cellSet(scene); const ca = candleAlarm(scene, C0.table.clone().add(V3([0.15, 0, 0.05])));
    const tM = ws(3, 'melted'), tD = ws(3, 'dropped'), tP = ws(3, 'plate'); cue(t0 + 0.1, 'candle_fizz'); cue(tD + 0.25, 'nail_drop');
    const fx = new FX(LW, LH).add('drip', { world: [0.73, 1.1, -0.68], t0, dur: 9, every: 0.4 }).add('heat', { world: [0.7, 1.25, -0.7], t0, dur: 9, lines: 2, rise: 14 })
      .add('arrow', { world: [0.82, 1.02, -0.7], t0: tD, dur: 0.8, angle: Math.PI / 2, len: 12, color: '#ffd93b', light: '#fff2a0', edge: '#5a3a00' });
    const cam = camera({ p: [[0.95, 1.2, 0.4], [0.95, 1.16, 0.3]], l: [[0.72, 0.98, -0.7]], fov: [44] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ca.userData.set(0.05 + 0.95 * smooth((q - t0) / Math.max(0.4, tD + 0.2 - t0)), smooth((q - tD - 0.2) / 0.25)); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tP) { const p = L.toScreen(cam, 0.82, 0.8, -0.7); popLabel(o, t, tP, 'METAL PLATE', 135, 300, 16, p); } } };
  } });

  // ===== 6. "Clang."  the nail hits the dish; across the cell she jolts awake on the cot (shocked)
  S.push({ at: [3, 'Clang'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const C0 = cellSet(scene); const ca = candleAlarm(scene, C0.table.clone().add(V3([0.15, 0, 0.05]))); ca.userData.set(1, 1);
    const ch = hero(scene, { p: [-1.4, 0.405, -0.45], ry: 0 }); hideShadow(ch);
    cue(t0, 'clang'); cue(t0 + 0.08, 'gasp');
    const fx = new FX(LW, LH).add('impact', { world: [0.8, 0.8, -0.68], t0, dur: 0.4, scale: 1.2 }).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0, 0.42, 0], t0: t0 + 0.1, dur: 9, scale: 0.9 })
      .add('shake', { obj: ch.root, bone: 'Head', offset: [0, -0.1, 0], t0: t0 + 0.1, dur: 0.6 });
    const cam = camera({ p: [[0.9, 1.45, 1.9]], l: [[-0.75, 0.8, -0.6]], fov: [56], shake: [t0, 0.3, 0.04] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('wake_sit_up', t0 - 0.1)], [[-99, 'shocked', 'bigShock']], false); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt, p = L.toScreen(cam, 0.8, 0.85, -0.68); plateText(o, 'CLANG', p[0], p[1] - 34, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0) }); } };
  } });

  // ===== 7. "This is a candle alarm."  punch-in on the candle + dish
  S.push({ at: [3, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const C0 = cellSet(scene); const ca = candleAlarm(scene, C0.table.clone().add(V3([0.15, 0, 0.05]))); ca.userData.set(1, 1);
    const tA = ws(3, 'alarm'); cue(tA, 'label'); cue(tA, 'punch');
    const fx = new FX(LW, LH).add('sparkle', { world: [0.72, 1.1, -0.7], t0: tA, dur: 9, n: 4, radius: 22 });
    const cam = camera({ p: [[0.7, 1.2, 0.6]], l: [[0.7, 1.0, -0.7]], fov: [42], jumps: [{ t: tA, p: [[0.7, 1.12, 0.15], [0.7, 1.12, 0.08]], l: [[0.7, 1.0, -0.7]], fov: [42] }] });
    return { scene, camera: cam, fx, update(lt, t) { cam.go(t, t0, t1); }, overlay(lt, dt, a, o) { const p = L.toScreen(cam, 0.7, 1.15, -0.7); popLabel(o, t0 + lt, tA, 'CANDLE ALARM', 135, Math.max(56, p[1] - 130), 20, p); } };
  } });

  // ===== 8. "Then came factories."  a mill at night: lit windows, chimney smoke, workers walking to the gate; she looks up
  S.push({ at: [4, 'Then'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const ms = millSet(scene);
    const ch = hero(scene, { p: [1.3, 0, 2.6], ry: 0.35 });
    const ws2 = [['bank_teller', 'grey', -0.9, 0.9], ['homework_girl', 'green', -1.7, 1.5], ['bank_teller', 'navy', -2.5, 1.1]].map(([id, v, x, z]) => { const n = npc(id, id, v); n.position.set(x, 0, z); n.rotation.y = Math.atan2(0 - x, -2.0 - z); if (id === 'bank_teller') flatCap(n); scene.add(n); return n; });
    nightGrade(scene, [ch, ...ws2]); cue(0, 'factory_hum'); cue(t0 + 0.2, 'steam_whistle');
    const fx = new FX(LW, LH).add('steam', { world: ms.smoke, t0: t0 - 2, dur: 9, every: 0.18, life: 1.4, rise: 50, color: '#8a8a8a', edge: '#5a5a5a', scale: 1.3 });
    const cam = camera({ p: [[1.6, 1.0, 6.8], [1.5, 1.0, 6.4]], l: [[0.2, 3.0, -3.0], [0.2, 2.8, -3.0]], fov: [58] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ws2.forEach((n, i) => { const d = (q - t0) * 0.7; const a = n.rotation.y; n.position.x += 0; n.walk((q - t0) * 1.4 + i * 0.3); n.userData.p0 = n.userData.p0 || n.position.clone(); n.position.set(n.userData.p0.x + Math.sin(a) * d, 0, n.userData.p0.z + Math.cos(a) * d); });
      ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'surprised', 'gasp']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { plateText(o, '1800 - 1900', 135, 52, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t0 + lt, t0 + 0.2) }); } };
  } });

  // ===== 9. "If you were late, you were fired…"  she runs up as the iron gate swings shut under the 6:05 clock: FIRED
  S.push({ at: [4, 'If'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const ms = millSet(scene);
    const ch = hero(scene, { p: [-0.85, 0, -0.2], ry: Math.PI / 2 }); nightGrade(scene, ch);
    const tF = ws(4, 'fired'); cue(t0 + 0.15, 'run_steps'); cue(tF - 0.25, 'gate_slam'); cue(tF, 'buzzer');
    const fx = new FX(LW, LH).add('impact', { world: [0, 1.0, -2.2], t0: tF - 0.25, dur: 0.35, scale: 1.2 }).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tF, dur: 3 });
    const cam = camera({ p: [[-0.2, 1.35, 3.5], [-0.22, 1.33, 3.3]], l: [[-0.45, 1.25, -1.6]], fov: [50] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t), k = smooth((q - tF + 0.55) / 0.3); ms.gate[0].rotation.y = 1.3 * (1 - k); ms.gate[1].rotation.y = -1.3 * (1 - k);
      const kr = smooth((q - t0) / Math.max(0.5, tF - 0.3 - t0)); ch.root.position.x = -0.85 + 0.65 * kr; ch.root.rotation.y = q < tF - 0.25 ? Math.PI / 2 : 0.25; ch.drive(t, [seg('run', -99, { loop: true }), seg('surprised', tF - 0.25, { fade: 0.08 })], [[-99, 'surprised', 'gasp'], [tF, 'sad', 'frown']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tF) plateText(o, 'LATE = FIRED', 135, 60, { size: 14, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tF) }); } };
  } });

  // ===== 10. "…and alarm clocks were expensive and unreliable."  the clockmaker's bench: a fancy clock with a huge price tag,
  // another whose hands spin wildly; she shrugs
  S.push({ at: [4, 'and'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const wk = workshop(scene);
    const fancy = twinBell(1.5, 6, 0); fancy.position.set(-0.45, 0.86, 0.1); scene.add(fancy);
    const brk = twinBell(1.3, 3, 40); brk.position.set(0.45, 0.86, 0.15); brk.rotation.y = -0.3; scene.add(brk);
    const hand = L.box(0.006, 0.07, 0.004, L.basic(null, 0xd83030), 0, 0, 0, scene);
    const ch = hero(scene, { p: [0.0, 0, -0.45], ry: 0 });
    const tE = ws(4, 'expensive'), tU = ws(4, 'unreliable'); cue(tE, 'cash_register'); cue(tU, 'spring_boing');
    const fx = new FX(LW, LH).add('question', { world: [0.45, 1.35, 0.15], t0: tU, dur: 9, scale: 0.8 }).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tE, dur: 2 });
    const cam = camera({ p: [[0.0, 1.5, 2.9], [0.0, 1.45, 2.7]], l: [[0.0, 1.1, -0.2]], fov: [46] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); scene.updateMatrixWorld(true); const c0 = brk.localToWorld(V3([0, 0.12, 0.04]));
      hand.position.copy(c0); hand.rotation.set(0, -0.3, q >= tU ? -q * 18 : -0.6); hand.position.y += 0.0;
      ch.drive(t, [seg('idle', -99, { loop: true }), seg('shrug', tU - 0.3, { fade: 0.1 })], [[-99, 'surprised', 'gasp'], [tU, 'half', 'frown']]); wk.drawWatch(q); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tE) { const p = L.toScreen(cam, -0.45, 1.3, 0.1); plateText(o, 'PRICEY', p[0], p[1] - 14, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tE) }); } } };
  } });

  // ===== 11. "So workers paid a human."  night street: a worker flips coins to her; she has the long bamboo pole on her shoulder
  S.push({ at: [5, 'So'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene);
    const ch = hero(scene, { p: [0.4, 0, 1.6], ry: -0.5 }); const pole = bamboo(); scene.add(pole);
    const wk = npc('bank_teller', 'bank_teller', 'grey'); flatCap(wk); wk.position.set(-0.6, 0, 1.9); wk.rotation.y = 1.2; scene.add(wk);
    nightGrade(scene, [ch, wk]); const cs = [0, 1, 2].map(() => { const c = coin(3.4, 0xe0c060); scene.add(c); return c; }); npcSet(wk, 'Bone004', -1.25); npcSet(wk, 'Bone005', -0.4);
    const tH = ws(5, 'human'); cue(t0 + 0.2, 'coin_flip'); cue(tH, 'coins_land');
    const fx = new FX(LW, LH).add('sparkle', { obj: ch.root, bone: 'HandR', offset: [0, 0.1, 0], t0: tH, dur: 9, n: 3, radius: 12 });
    const cam = camera({ p: [[0.0, 1.45, 4.7], [0.0, 1.42, 4.45]], l: [[0.0, 1.15, 1.7]], fov: [50] });
    const hp = new THREE.Vector3(), h2 = new THREE.Vector3();
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('hold_up_object', tH - 0.5, { fade: 0.1 })], [[-99, 'open', 'smile'], [tH, 'happy', 'smileOpen']]);
      scene.updateMatrixWorld(true); ch.fist('R', hp); ch.fist('L', h2); placeRod(pole, V3([1.05, 0.02, 0.55]), V3([0.85, 2.7, 0.06]));
      const src = npcHand(wk, 'R'); cs.forEach((c, i) => { const u = clamp01((q - t0 - 0.15 - i * 0.12) / Math.max(0.3, tH - t0 - 0.3)); c.position.copy(src).lerp(hp.clone().add(V3([0.02, 0.09 + i * 0.012, 0.06])), u); c.position.y += 0.5 * 4 * u * (1 - u); c.rotation.set(u * 9, u * 5, 0); });
      cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tH) plateText(o, '+1 PENNY', 135, 60, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tH) }); } };
  } });

  // ===== 12. "A knocker-upper walked the streets before dawn… tapping on windows with a long stick."  she walks the dark street
  // with the pole, stops, taps the upper window: TAP TAP; the pane lights up (NEW tap_pole; provisional hold_up_object)
  S.push({ at: [5, 'A', 2], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene);
    const ch = hero(scene, { p: [-1.3, 0, 1.3], ry: Math.PI / 2 }); const pole = bamboo(); scene.add(pole);
    nightGrade(scene, ch); const tT = ws(5, 'tapping'), tS = ws(5, 'stick');
    const taps = []; for (let b = tT; b < t1 - 0.1; b += 0.3) taps.push(b); taps.forEach((b) => cue(b, 'tap_glass')); cue(t0 + 0.1, 'footsteps_cobble');
    const cam = camera({ p: [[1.4, 1.3, 5.0], [1.2, 1.3, 4.6]], l: [[-0.8, 1.0, 1.2], [-0.3, 1.0, 1.2]], fov: [52], jumps: [{ t: tT - 0.5, p: [[2.6, 1.35, 1.9], [2.5, 1.35, 1.85]], l: [[-0.05, 1.85, 0.95], [-0.05, 1.9, 0.93]], fov: [64] }] });
    const fx = new FX(LW, LH).add('sparkle', { world: [0, 3.0, 0.05], t0: tS + 0.3, dur: 9, n: 3, radius: 18 });
    const hp = new THREE.Vector3(), h2 = new THREE.Vector3(), stopT = tT - 0.5;
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t), walking = q < stopT; ch.root.position.x = -1.3 + 1.1 * smooth((q - t0) / Math.max(0.5, stopT - t0)); ch.root.rotation.y = walking ? Math.PI / 2 : Math.PI - 0.35;
      ch.drive(t, walking ? [seg('walk', -99, { loop: true })] : [seg('tap_pole', stopT, { loop: true })], [[-99, 'open', 'smile'], [tT, 'happy', 'smileOpen']]);
      scene.updateMatrixWorld(true); ch.fist('R', hp); ch.fist('L', h2);
      const tap = taps.some((b) => q >= b && q < b + 0.1); const tip = walking ? hp.clone().add(V3([0.9, 2.4, -0.6])) : ks.tgt.clone().add(V3([0, tap ? 0.0 : 0.06, tap ? 0.0 : 0.12]));
      placeRod(pole, hp.clone().add(V3([0.02, -0.25, 0.08])), tip); ks.lit.visible = q > tS + 0.3; cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; const b = taps.filter((x) => x <= t).pop(); if (b !== undefined && t - b < 0.22) { const p = L.toScreen(cam, ks.tgt.x, ks.tgt.y, ks.tgt.z); plateText(o, 'TAP', p[0] + 26, p[1] - 18, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); } } };
  } });

  // ===== 13. "This is a knocker-upper."  low angle on her with the pole against the lit window
  S.push({ at: [5, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene); ks.lit.visible = true;
    const ch = hero(scene, { p: [0.0, 0, 1.2], ry: 0.25 }); const pole = bamboo(); scene.add(pole); nightGrade(scene, ch);
    const tK = ws(5, 'knocker-upper', 2); cue(tK, 'label'); cue(tK, 'punch');
    const fx = new FX(LW, LH).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.1, 0.2, 0], t0: tK, dur: 9, n: 3, radius: 14 });
    const cam = camera({ p: [[0.5, 0.7, 3.2], [0.5, 0.7, 3.0]], l: [[0.0, 1.6, 0.6]], fov: [52] }); const h2 = new THREE.Vector3();
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('hands_on_hips', t0 - 0.3)], [[-99, 'happy', 'smileOpen'], [tK, 'smirk', 'smirk']]); scene.updateMatrixWorld(true); ch.fist('R', h2);
      placeRod(pole, V3([0.45, 0.02, 1.1]), V3([0.65, 3.4, 0.9])); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const p = L.toScreen(cam, 0.55, 2.0, 1.0); popLabel(o, t0 + lt, tK, 'KNOCKER-UPPER', 135, 70, 20, p); } };
  } });

  // ===== 14. "Operator Jay asks: Who woke up the knocker-upper?"  COMMENT at the mailbox (37 %)
  S.push({ at: [6, 'Operator'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); L.mailSet(scene);
    const ch = hero(scene, { p: [0, 0, 0.75], ry: 0.15 });
    const lt0 = L.holdIn(ch, L.letter(), 'R', [0, 1.4, 0.6], [0.2, 0, Math.PI / 2]); lt0.scale.multiplyScalar(1.5);
    const tJ = ws(6, 'Jay'), tWho = ws(6, 'Who'), tQ = ws(6, 'knocker-upper');
    cue(t0 + 0.15, 'mailbox_creak'); cue(t0 + 0.4, 'paper'); cue(tJ, 'comment_pop'); cue(tWho, 'punch');
    const sf = () => {};
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [-0.12, 0.42, 0], t0: tQ, dur: 9, scale: 0.8 });
    const cam = camera({ p: [[0.15, 0.95, 5.6], [0.15, 0.95, 5.3]], l: [[-0.05, 1.2, 0.5]], fov: [33], jumps: [{ t: tWho, p: [[0.2, 1.0, 4.2], [0.2, 1.0, 4.0]], l: [[0.0, 1.3, 0.6]], fov: [33] }] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('present', t0 - 0.45)], [[-99, 'surprised', 'talkO']]); sf(t); L.upright(lt0, 0); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tJ) sticker(o, t - tJ, { user: 'operator_jay', lines: ['who woke up the', 'knocker-upper?'] }); } };
  } });

  // ===== 15. "Jay… most of them slept in the afternoon."  gag: the knocker-upper (her) asleep in broad daylight, pole by the bed, 2 PM
  S.push({ at: [6, 'Jay', 2], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'summer', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true, quilt: 0x6a9a4a });
    const ch = hero(scene); inBed(ch, bd); const pole = bamboo(); scene.add(pole); placeRod(pole, V3([0.55, 0.02, -1.3]), V3([0.4, 3.0, -1.45]));
    const beam = sunbeam(scene); orient(beam, V3([0.9, 1.6, -1.6]), V3([0.3, 0.45, 0.2])); beam.scale.x = beam.scale.z = 0.6; beam.material.opacity = 0.1;
    const tA = ws(6, 'afternoon'); cue(t0 + 0.1, 'snore'); cue(tA, 'bird_chirp');
    const cam = camera({ p: [[1.9, 1.8, 1.9], [1.8, 1.75, 1.75]], l: [[0.0, 0.7, -0.5]], fov: [48] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('sleep_lie', -99, { loop: true })], [[-99, 'blink', 'cat']], false); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; sunInWindow(o, cam, R0.win, 1.15, lt); const p = L.toScreen(cam, -0.2, 0.75, -0.6); zzz(o, p[0] + 6, p[1] - 8, lt);
        if (t >= tA) plateText(o, '2 PM', 135, 100, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tA) }); } };
  } });

  // ===== 16. "In London, Mary Smith didn't knock at all."  East End street, foggy; Mary Smith with her pea shooter (NPC)
  S.push({ at: [7, 'In'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene);
    const mary = npc('art_student', 'art_student', 'violet'); bonnet(mary); mary.position.set(0.35, 0, 1.7); mary.rotation.y = 1.2; scene.add(mary);
    const ps = peaShooter(); scene.add(ps); const ch = hero(scene, { p: [1.45, 0, 2.1], ry: -0.9 }); nightGrade(scene, [ch, mary]); npcSet(mary, 'Bone002', -1.5); npcSet(mary, 'Bone004', -1.5); npcSet(mary, 'Bone003', -1.0); npcSet(mary, 'Bone005', -1.0);
    const mp = [0, 1, 2].map(() => pea(scene)), mshots = [t0 + 0.5, t0 + 1.2, t0 + 1.9];
    const tM = ws(7, 'Mary'), tK = ws(7, 'knock'); cue(t0 + 0.1, 'london_fog'); cue(tK, 'no_buzz'); [0.5, 1.2, 1.9].forEach((d) => { cue(t0 + d, 'pea_puff'); cue(t0 + d + 0.4, 'pea_tick'); });
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.12, 0.42, 0], t0: tK, dur: 9, scale: 0.7 });
    const cam = camera({ p: [[0.95, 1.25, 5.6], [0.92, 1.25, 5.35]], l: [[0.85, 1.1, 1.8]], fov: [56] });
    return { scene, camera: cam, fx, update(lt, t) { scene.updateMatrixWorld(true); const hd = mary.localToWorld(V3([0.02, 1.22, 0.14])), te = hd.clone().add(V3([-0.06, 0.2, -0.22])); orient(ps.userData.tube, hd, te); ps.userData.tube.scale.x = ps.userData.tube.scale.z = 1.5; const q = q15(t);
      mp.forEach((p_, i) => { const u = (q - mshots[i]) / 0.4; p_.visible = u > 0 && u < 1.5; if (u <= 1) { p_.position.copy(te).lerp(ks.tgt, u); p_.position.y += 0.12 * 4 * u * (1 - u); } else { const v = u - 1; p_.position.copy(ks.tgt).add(V3([0, -2 * v * v, 0.3 * v])); } });
      ch.drive(t, [seg('think', t0 - 0.2)], [[-99, 'open', 'smile'], [tK, 'surprised', 'gasp']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, 'LONDON', 135, 46, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tM) { const p = L.toScreen(cam, 0.35, 1.75, 1.7); plateText(o, 'MARY SMITH', p[0], p[1] - 10, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tM) }); } } };
  } });

  // ===== 17. "She shot dried peas at the windows…"  she tries it: blows the tube, green peas arc up and tick on the pane
  S.push({ at: [7, 'She'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene);
    const ch = hero(scene, { p: [-0.35, 0, 1.75], ry: 2.2 }); const ps = peaShooter(); scene.add(ps); nightGrade(scene, ch);
    const peas = [0, 1, 2, 3].map(() => pea(scene)); const tS = ws(7, 'shot'), shots = [tS, tS + 0.45, tS + 0.9, tS + 1.35];
    shots.forEach((b) => { cue(b, 'pea_puff'); cue(b + 0.35, 'pea_tick'); });
    const cam = camera({ p: [[2.4, 1.35, 2.4], [2.35, 1.36, 2.35]], l: [[-0.3, 1.65, 1.25]], fov: [62] });
    const fx = new FX(LW, LH).add('sparkle', { world: [WIN.x, 3.0, 0.06], t0: shots[0] + 0.35, dur: 9, n: 3, radius: 14 });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ch.drive(t, [seg('blow_tube', tS - 0.35)], [[-99, 'open', 'neutral'], [tS - 0.1, 'half', 'talkO'], [shots[3] + 0.4, 'half', 'smirk']], false);
      scene.updateMatrixWorld(true); const hd = ch.bone.getObjectByName('Head').localToWorld(V3([0, 0.0, 0.0])); const fw = V3([Math.sin(ch.root.rotation.y), 0, Math.cos(ch.root.rotation.y)]); const mouth = hd.clone().add(V3([0, 0.1, 0])).addScaledVector(fw, 0.13); const tipT = ks.tgt.clone();
      const dir = tipT.clone().sub(mouth).normalize(); orient(ps.userData.tube, mouth.clone().add(dir.clone().multiplyScalar(0.03)), mouth.clone().add(dir.clone().multiplyScalar(0.33)));
      const tip = mouth.clone().add(dir.clone().multiplyScalar(0.33));
      peas.forEach((p, i) => { const u = (q - shots[i]) / 0.35; p.visible = u > 0 && u < 1.6; if (u <= 1) { p.position.copy(tip).lerp(tipT, u); p.position.y += 0.15 * 4 * u * (1 - u); } else { const v = u - 1; p.position.copy(tipT).add(V3([0.05 * v, -2.5 * v * v, 0.4 * v])); } });
      cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt, c = o.tctx; peas.forEach((pp) => { if (!pp.visible) return; const p = L.toScreen(cam, pp.position.x, pp.position.y, pp.position.z); c.fillStyle = '#040412'; c.fillRect(p[0] - 3, p[1] - 3, 7, 7); c.fillStyle = '#9ae050'; c.fillRect(p[0] - 2, p[1] - 2, 5, 5); c.fillStyle = '#e0ffc0'; c.fillRect(p[0] - 1, p[1] - 2, 2, 2); });
        const b = shots.filter((x) => x + 0.35 <= t).pop(); if (b !== undefined && t - b - 0.35 < 0.22) { const p = L.toScreen(cam, ks.tgt.x, ks.tgt.y, ks.tgt.z); plateText(o, 'TIK', p[0] - 24, p[1] - 22, { size: 12, border: '#9cf09c', fg: '#e0ffe0' }); } } };
  } });

  // ===== 18. "…with a pea shooter."  close: the tube and a handful of dried peas in her palm
  S.push({ at: [7, 'with'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene); ks.lit.visible = true;
    const ch = hero(scene, { p: [0.35, 0, 1.6], ry: 0.1 }); nightGrade(scene, ch);
    const ps = peaShooter(); scene.add(ps); const fp = new THREE.Vector3(); const pp = pea(scene); pp.scale.setScalar(1.4);
    const tP = ws(7, 'shooter'); cue(tP, 'label'); cue(tP, 'punch');
    const fx = new FX(LW, LH).add('sparkle', { target: ps, t0: tP, dur: 9, n: 3, radius: 14 });
    const cam = camera({ p: [[0.75, 1.5, 3.2], [0.72, 1.48, 3.0]], l: [[0.4, 1.35, 1.6]], fov: [42] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ch.drive(t, [seg('hold_up_object', t0 - 0.4)], [[-99, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp);
      const a = fp.clone().add(V3([0.0, -0.05, 0.06])), b = fp.clone().add(V3([0.22, 0.36, 0.1])); orient(ps.userData.tube, a, b); ps.userData.tube.scale.x = ps.userData.tube.scale.z = 1.4;
      const u = (q - tP) / 0.5; pp.visible = u > 0 && u < 1; pp.position.copy(b).add(V3([0.35 * u, 0.5 * u - 0.4 * u * u, 0.05]));
      cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { scene.updateMatrixWorld(true); const w = ps.userData.tube.getWorldPosition(new THREE.Vector3()), p = L.toScreen(cam, w.x, w.y, w.z); popLabel(o, t0 + lt, tP, 'PEA SHOOTER', 135, 70, 20, p); } };
  } });

  // ===== 19. "Sixpence a week."  she holds up a silver sixpence
  S.push({ at: [7, 'Sixpence'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); knockStreet(scene); const ch = hero(scene, { p: [0.35, 0, 1.6], ry: 0.1 }); nightGrade(scene, ch);
    const cn = coin(3.4, 0xd8dce4); scene.add(cn); const fp = new THREE.Vector3(); const tW = ws(7, 'week'); cue(t0, 'coin_ting');
    const fx = new FX(LW, LH).add('sparkle', { target: cn, t0, dur: 9, n: 3, radius: 12 });
    const cam = camera({ p: [[0.35, 1.5, 3.7], [0.35, 1.49, 3.55]], l: [[0.25, 1.35, 1.6]], fov: [44] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('hold_up_object', t0 - 0.4)], [[-99, 'happy', 'smile']]); cam.go(t, t0, t1); scene.updateMatrixWorld(true); ch.fist('R', fp); cn.position.copy(fp).add(V3([-0.04, 0.1, 0.06])); cn.lookAt(cam.position); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, 'SIXPENCE A WEEK', 135, 60, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0 + 0.1) }); } };
  } });

  // ===== 20. "Rude."  reaction: the sleeper slams his window open, angry, a pea on his nightcap; she smirks (new smirk expression)
  S.push({ at: [8, 'Rude'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene); ks.lit.visible = true;
    const man = npc('bank_teller', 'bank_teller', 'grey'); nightcap(man); man.position.set(WIN.x, 1.825, -0.24); scene.add(man); ks.pane.visible = false; ks.lit.position.z = -0.6; npcSet(man, 'Bone002', -0.9);
    const ch = hero(scene, { p: [0.55, 0, 1.9], ry: 0.35 }); const ps = L.holdIn(ch, peaShooter(), 'R', [0, 1.0, 0.2], [0, 0, 0.3]); ps.scale.multiplyScalar(1.6); nightGrade(scene, [ch, man]);
    cue(t0, 'window_slam'); cue(t0 + 0.15, 'grumble');
    const fx = new FX(LW, LH).add('anger', { target: man, offset: [0.15, 1.75, 0], t0, dur: 9, scale: 1.0 }).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.1, 0.15, 0.1], t0: t0 + 0.2, dur: 9, n: 2, radius: 10 });
    const cam = camera({ p: [[1.1, 1.6, 5.0], [1.05, 1.6, 4.8]], l: [[0.35, 1.75, 0.8]], fov: [52] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('smirk_pose', t0 - 0.1)], [[-99, 'smirk', 'smirk']]); man.walk(0, 0); cam.go(t, t0, t1); } };
  } });

  // ===== 21. "Alarm clocks did exist. In 1787, Levi Hutchins built one…"  his pine-case wall clock with the bell; Hutchins (NPC)
  S.push({ at: [9, 'Alarm'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const wk = workshop(scene); const hc = hutchinsClock(scene, V3([0.25, 1.2, -0.66])); L.plane(10, 3, L.basic(L.rep(OAK, 10 / 0.6, 3 / 0.6), 0.55), 0, 5.0, -0.76, scene); for (let x = -4.5; x <= 4.5; x += 1.5) L.box(0.14, 0.14, 4, L.basic(null, 0x3a2a1c), x, 3.55, 1.2, scene);
    const hut = npc('bank_teller', 'bank_teller', 'olive'); tricorn(hut); hut.position.set(-0.4, 0, -0.25); hut.rotation.y = 0.4; scene.add(hut);
    const ch = hero(scene, { p: [1.25, 0, 0.75], ry: -0.5 }); const tY = ws(9, '1787'), tH = ws(9, 'Hutchins'); cue(t0 + 0.1, 'tick_tock'); cue(tY, 'label');
    const fx = new FX(LW, LH).add('sparkle', { world: [0.25, 1.75, -0.6], t0: tH, dur: 9, n: 3, radius: 18 });
    const cam = camera({ p: [[0.55, 1.5, 4.3], [0.55, 1.48, 4.05]], l: [[0.5, 1.25, -0.1]], fov: [56] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('think', t0 - 0.2)], [[-99, 'open', 'smile'], [tH, 'happy', 'smileOpen']]); wk.drawWatch(q15(t)); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tY) plateText(o, '1787', 135, 46, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tY) }); if (t >= tH) { const p = L.toScreen(cam, -0.4, 1.95, -0.25); plateText(o, 'LEVI HUTCHINS', p[0], p[1] - 8, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tH) }); } } };
  } });

  // ===== 22. "…but it could only ring at four in the morning."  the dial stuck at 4:00, the bell rings, she covers her ears (shocked)
  S.push({ at: [9, 'but'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); workshop(scene); const hc = hutchinsClock(scene, V3([0.25, 1.2, -0.66])); L.plane(10, 3, L.basic(L.rep(OAK, 10 / 0.6, 3 / 0.6), 0.55), 0, 5.0, -0.76, scene);
    const ch = hero(scene, { p: [1.15, 0, 0.75], ry: -0.6 }); const tF = ws(9, 'four'); cue(tF, 'bell_ring'); cue(t0 + 0.1, 'tick');
    const fx = new FX(LW, LH).add('shake', { obj: ch.root, bone: 'Head', offset: [0, -0.1, 0], t0: tF, dur: 9 }).add('impact', { world: [0.25, 2.05, -0.62], t0: tF, dur: 0.35, scale: 1 });
    const cam = camera({ p: [[0.95, 1.6, 3.1], [0.93, 1.6, 2.95]], l: [[0.85, 1.4, 0.0]], fov: [52] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); if (q >= tF) hc.userData.ring(q); ch.drive(t, [seg('idle', -99, { loop: true }), seg('surprised', tF - 0.1, { fade: 0.1 })], [[-99, 'open', 'neutral'], [tF, 'shocked', 'bigShock']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tF) { const p = L.toScreen(cam, 0.25, 2.05, -0.62); ringMarks(o, p[0], p[1], t); plateText(o, '4:00 AM ONLY', 135, 52, { size: 14, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tF) }); } } };
  } });

  // ===== 23. "In 1876, the Seth Thomas company patented a small bedside alarm clock."  she presents the twin-bell clock on a nightstand
  S.push({ at: [10, 'In'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'interior', wx: 0.9 }); bed(scene, { x: 1.6, z: -0.6 });
    const tb = twinBell(1.7); tb.position.copy(R0.stand); tb.rotation.y = 0.5; scene.add(tb); const fp = new THREE.Vector3();
    const ch = hero(scene, { p: [-1.75, 0, 0.05], ry: 0.25 }); const tY = ws(10, '1876'), tB = ws(10, 'bedside'); cue(tY, 'label'); cue(tB, 'tick_tock');
    const fx = new FX(LW, LH).add('sparkle', { target: tb, offset: [0, 0.2, 0], t0: tB, dur: 9, n: 4, radius: 16 });
    const cam = camera({ p: [[-1.3, 1.35, 3.5], [-1.35, 1.3, 2.9]], l: [[-1.45, 0.9, -0.35], [-1.4, 0.88, -0.5]], fov: [52] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('present', t0 - 0.2), seg('nod', tB + 0.4, { fade: 0.15 }), seg('hands_on_hips', tB + 2.0, { fade: 0.15 })], [[-99, 'happy', 'smileOpen'], [tB, 'sparkle', 'blushSmile']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tY) plateText(o, '1876', 135, 46, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tY) }); if (t >= tY + 0.6) plateText(o, 'SETH THOMAS', 135, 72, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tY + 0.6) }); } };
  } });

  // ===== 24. "Cheap clocks spread… and the knocker-uppers slowly lost their jobs."  dawn street: every window rings; the
  // knocker-up NPC walks away with his pole, head down; she watches, sad
  S.push({ at: [10, 'Cheap'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); knockStreet(scene, { preset: 'morning' });
    const ku = npc('bank_teller', 'bank_teller', 'grey'); flatCap(ku); scene.add(ku); const pole = bamboo(); scene.add(pole);
    const ch = hero(scene, { p: [0.05, 0, 3.0], ry: -0.4 }); const tJ = ws(10, 'jobs'); cue(t0 + 0.1, 'many_alarms'); cue(tJ, 'sad_trombone');
    const fx = new FX(LW, LH).add('sweat', { target: ku, offset: [0.12, 1.7, 0], t0: tJ, dur: 9 });
    const cam = camera({ p: [[0.2, 1.6, 7.0], [0.2, 1.55, 6.6]], l: [[-0.6, 1.7, 0.8]], fov: [50] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ku.position.set(0.8 - 0.55 * (q - t0), 0, 1.4); ku.rotation.y = -Math.PI / 2; ku.walk((q - t0) * 0.9, 0.7);
      const h = npcHand(ku, 'R'); placeRod(pole, h.clone().add(V3([0.35, -0.55, 0])), h.clone().add(V3([-1.35, 1.9, 0])));
      ch.drive(t, [seg('idle', -99, { loop: true })], [[-99, 'open', 'neutral'], [tJ, 'sad', 'frown']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; for (const [x, y, z, d] of [[1.7, 1.3, 0.05, 0], [1.7, 3.05, 0.05, 0.3], [-1.6, 3.05, 0.05, 0.6]]) if (t >= t0 + d) { const p = L.toScreen(cam, x, y, z); ringMarks(o, p[0], p[1], t + d, 12); } } };
  } });

  // ===== 25. "A few kept knocking until the 1970s."  an old knocker-up taps a window above a parked 1970s car
  S.push({ at: [10, 'A', 2], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const ks = knockStreet(scene, { preset: 'night' });
    const ku = npc('bank_teller', 'bank_teller', 'grey'); flatCap(ku); ku.position.set(-0.6, 0, 1.3); ku.rotation.y = Math.PI - 0.4; scene.add(ku); const pole = bamboo(); scene.add(pole);
        const ch = hero(scene, { p: [0.55, 0, 3.0], ry: 0.4 }); nightGrade(scene, [ch, ku]); const t7 = ws(10, '1970s'); cue(t7, 'label'); cue(t0 + 0.2, 'tap_glass');
    const fx = new FX(LW, LH).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0, 0.42, 0], t0: t7, dur: 9, scale: 0.8 });
    const cam = camera({ p: [[0.6, 1.4, 6.8], [0.55, 1.4, 6.4]], l: [[0.3, 1.8, 0.8]], fov: [50] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t), tap = Math.floor(q * 3.3) % 2; ku.walk(0, 0); npcSet(ku, 'Bone004', -2.2 - (tap ? 0.08 : 0)); npcSet(ku, 'Bone005', -0.3); const h = npcHand(ku, 'R');
      const tg = ks.tgt.clone().add(V3([0, tap ? 0 : 0.06, tap ? 0 : 0.12])), d = tg.clone().sub(h).normalize(); placeRod(pole, h.clone().addScaledVector(d, -0.35), tg); ch.drive(t, [seg('idle', -99, { loop: true }), seg('surprised', t7 - 0.1, { fade: 0.1 })], [[-99, 'open', 'neutral'], [t7, 'surprised', 'gasp']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= t7) plateText(o, 'UP TO 1970', 135, 52, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t7) }); } };
  } });

  // ===== 26. "In 1956, alarm clocks got a new button…"  1956 bedroom: the pastel clock rings; she sits up and slaps the bar (NEW slap_snooze)
  S.push({ at: [11, 'In'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.9, wall: PTILE, tint: 1.0 }); const bd = bed(scene, { x: -0.2, z: -0.15, quilt: 0xd87a9a, full: true });
    const sc = snoozClock(1.5); sc.position.copy(R0.stand); sc.rotation.y = 0.5; scene.add(sc);
    const ch = hero(scene); inBed(ch, bd);
    const tY = ws(11, '1956'), tB = ws(11, 'button'); cue(t0 + 0.05, 'bell_ring'); cue(tB, 'button_click'); cue(tY, 'label');
    const fx = new FX(LW, LH).add('anger', { obj: ch.root, bone: 'Head', offset: [0.15, 0.32, 0], t0: t0 + 0.3, dur: 1.2 }).add('impact', { world: [R0.stand.x, R0.stand.y + 0.28, R0.stand.z], t0: tB, dur: 0.3, scale: 0.8 });
    const cam = camera({ p: [[0.9, 1.6, 1.2], [0.85, 1.55, 1.05]], l: [[-0.5, 0.65, -0.8]], fov: [48] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); if (q < tB) sc.userData.press(0); else sc.userData.press(1);
      ch.drive(t, [seg('sleep_lie', -99, { loop: true }), seg('slap_snooze', tB - 0.4, { fade: 0.1 })], [[-99, 'angry', 'frown'], [tB - 0.05, 'angry', 'shout'], [tB + 0.35, 'blink', 'cat']], false); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t < tB) { const p = L.toScreen(cam, R0.stand.x, R0.stand.y + 0.2, R0.stand.z); ringMarks(o, p[0], p[1], t, 14); } if (t >= tY) plateText(o, '1956', 135, 46, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tY) });
        if (t >= tB && t < tB + 0.5) { const p = L.toScreen(cam, R0.stand.x, R0.stand.y + 0.3, R0.stand.z); plateText(o, 'SLAP', p[0], p[1] - 20, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tB) }); } } };
  } });

  // ===== 27. "…to sleep a few more minutes."  she flops back, happy, zzz; a "+ FEW MIN" plate
  S.push({ at: [11, 'to'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.9, wall: PTILE, tint: 1.0 }); const bd = bed(scene, { x: -0.2, z: -0.15, quilt: 0xd87a9a, full: true });
    const sc = snoozClock(1.5); sc.position.copy(R0.stand); sc.rotation.y = 0.5; sc.userData.press(1); scene.add(sc);
    const ch = hero(scene); inBed(ch, bd); const tM = ws(11, 'minutes'); cue(t0 + 0.1, 'pillow_flop'); cue(tM, 'snore');
    const cam = camera({ p: [[0.9, 1.6, 1.0], [0.85, 1.55, 0.9]], l: [[-0.3, 0.6, -0.6]], fov: [46] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('sleep_lie', -99, { loop: true })], [[-99, 'blink', 'cat']], false); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; const p = L.toScreen(cam, -0.2, 0.75, -0.6); zzz(o, p[0] + 6, p[1] - 8, lt); if (t >= tM) plateText(o, '+ A FEW MIN', 135, 56, { size: 14, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tM) }); } };
  } });

  // ===== 28. "This is a snooze button."  punch-in on the bar button
  S.push({ at: [11, 'This'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.9, wall: PTILE, tint: 1.0 }); bed(scene, { x: -0.2, z: -0.15, quilt: 0xd87a9a });
    const sc = snoozClock(1.5); sc.position.copy(R0.stand); sc.rotation.y = 0.5; scene.add(sc);
    const tS = ws(11, 'snooze'); cue(tS, 'label'); cue(tS, 'punch');
    const b = R0.stand.clone().add(V3([0, 0.27, 0])); const fx = new FX(LW, LH).add('sparkle', { world: [b.x, b.y, b.z], t0: tS, dur: 9, n: 4, radius: 18 });
    const cam = camera({ p: [[b.x + 0.5, b.y + 0.4, b.z + 1.1]], l: [[b.x, b.y - 0.1, b.z]], fov: [40], jumps: [{ t: tS, p: [[b.x + 0.38, b.y + 0.28, b.z + 0.82], [b.x + 0.36, b.y + 0.27, b.z + 0.78]], l: [[b.x + 0.03, b.y - 0.1, b.z]], fov: [44] }] });
    return { scene, camera: cam, fx, update(lt, t) { cam.go(t, t0, t1); }, overlay(lt, dt, a, o) { const p = L.toScreen(cam, b.x, b.y, b.z); popLabel(o, t0 + lt, tS, 'SNOOZE BUTTON', 135, Math.max(56, p[1] - 120), 20, p); } };
  } });

  // ===== 29. "Now your phone is the sun, the candle, the stick and the pea shooter."  ENDING place: the village edge at sunrise;
  // she holds up her phone; the four old alarms pop around it on their words
  S.push({ at: [12, 'Now'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const lg = ledgeSet(scene);
    const ch = hero(scene, { p: [0.15, lg.y, 0.8], ry: 0.7 }); const ph = phone(); ph.scale.setScalar(2.2); scene.add(ph); const fp = new THREE.Vector3();
    const marks = [['sun', ws(12, 'sun')], ['candle', ws(12, 'candle')], ['stick', ws(12, 'stick')], ['pea', ws(12, 'pea')]]; marks.forEach(([k, tt]) => cue(tt, 'pop'));
    const sf = () => {};
    const cam = camera({ p: [[1.85, 1.5, 2.95], [1.75, 1.5, 2.8]], l: [[0.0, 1.1, 0.5]], fov: [48] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('hold_up_object', t0 - 0.45)], [[-99, 'happy', 'smileOpen']]); sf(t); scene.updateMatrixWorld(true); ch.fist('R', fp); ph.position.copy(fp).add(V3([0.02, 0.1, 0.05])); ph.rotation.set(0, 0.7, 0.15); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt, c = o.tctx; sky(o, 'sun', 228, 52, lt);
        scene.updateMatrixWorld(true); const hw = ch.bone.getObjectByName('Head').getWorldPosition(new THREE.Vector3()), hs = L.toScreen(cam, hw.x, hw.y, hw.z), sx = hs[0] < 135 ? 214 : 52;
        const slots = [[sx, 130], [sx, 205], [sx, 280], [sx, 355]];
        marks.forEach(([k, tt], i) => { if (t < tt) return; const [x, y] = slots[i], s = popS(t, tt), R = (xx, yy, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + xx * s), Math.round(y + yy * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
          R(-22, -22, 44, 44, '#040412'); R(-20, -20, 40, 40, '#fdfdfd');
          if (k === 'sun') { R(-8, -8, 16, 16, '#ffd23a'); for (const [dx, dy] of [[-14, -2], [10, -2], [-2, -14], [-2, 10]]) R(dx, dy, 4, 4, '#ffb020'); }
          if (k === 'candle') { R(-4, -6, 8, 20, '#f4ecd0'); R(-1, -14, 3, 7, '#ffa030'); R(4, 2, 8, 2, '#8a8e98'); }
          if (k === 'stick') { for (let j = 0; j < 16; j++) R(-12 + j * 1.5, 12 - j * 1.6, 3, 3, '#c8a860'); }
          if (k === 'pea') { R(-12, 4, 18, 5, '#3a2a24'); for (const [dx, dy] of [[8, -6], [12, -12], [4, -14]]) R(dx, dy, 4, 4, '#7ac040'); }
          bitText(c, k.toUpperCase(), x, y + 34 * s, 1, '#fff2a0', { plate: '#040412', pad: 2 }); }); } };
  } });

  // ===== 30. "Humans paid people to shoot peas at their windows… and then invented a button to sleep through it?"  the phone
  // rings, she taps snooze and yawns; a dried pea bonks her head (gag)
  S.push({ at: [13, 'Humans'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const lg = ledgeSet(scene);
    const ch = hero(scene, { p: [0.15, lg.y, 0.8], ry: 0.75 }); const ph = phone(); ph.scale.setScalar(2.2); scene.add(ph); const fp = new THREE.Vector3();
    const pp = pea(scene); pp.scale.setScalar(1.6); const tB = ws(13, 'button'), tI = ws(13, 'it'), tPea = tI + 0.15;
    cue(t0 + 0.2, 'phone_alarm'); cue(tB, 'tap'); cue(tPea, 'pea_bonk'); cue(tI + 0.1, 'question_pop');
    const sf = () => {};
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.18, 0.42, 0], t0: tI, dur: 9, scale: 0.9 }).add('impact', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0: tPea, dur: 0.3, scale: 0.6 });
    const cam = camera({ p: [[2.2, 1.55, 3.4], [2.05, 1.55, 3.2]], l: [[-0.1, 1.05, 0.3]], fov: [50] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ch.drive(t, [seg('hold_up_object', t0 - 0.45), seg('shrug', tI - 0.35, { fade: 0.12 })], [[-99, 'half', 'frown'], [tB, 'relaxed', 'cat'], [tPea, 'shocked', 'gasp']]); sf(t); scene.updateMatrixWorld(true); ch.fist('R', fp); ph.position.copy(fp).add(V3([0.02, 0.1, 0.05])); ph.rotation.set(0, 0.75, 0.15);
      scene.updateMatrixWorld(true); const hd = ch.bone.getObjectByName('Head').getWorldPosition(new THREE.Vector3()); const u = (q - tPea + 0.5) / 0.5; pp.visible = u > 0 && u < 2;
      if (u <= 1) { pp.position.set(hd.x - 2.2 * (1 - u), hd.y + 0.25 + 1.2 * u * (1 - u), hd.z + 0.4 * (1 - u)); } else { const v = u - 1; pp.position.set(hd.x + 0.3 * v, hd.y + 0.25 - 1.5 * v * v + 0.4 * v, hd.z); } cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t < tB) { scene.updateMatrixWorld(true); const w = ph.getWorldPosition(new THREE.Vector3()), p = L.toScreen(cam, w.x, w.y, w.z); ringMarks(o, p[0], p[1], t, 10); } if (t >= tB && t < tB + 0.9) plateText(o, 'SNOOZE', 135, 60, { size: 14, border: '#fe2c55', fg: '#ffd0dc', scale: popS(t, tB) }); } };
  } });

  // ===== 31. "Artifact understood. Logging off."  she waves from the ledge, crane away over the sunrise village; outro over it
  S.push({ at: [14, 'Artifact'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const lg = ledgeSet(scene);
    const ch = hero(scene, { p: [0.15, lg.y, 0.8], ry: 0.75 });
    const tLo = ws(14, 'Logging'), tEnd = TL.dur, tOut = tEnd + 0.05;
    cue(tLo, 'blip'); cue(tOut + 0.05, 'end_jingle'); cue(tOut + 0.55, 'follow_pop');
    const sf = () => {};
    const cam = camera({ p: [[2.0, 1.55, 2.9], [3.0, 4.4, 4.6]], l: [[-0.3, 1.0, 0.0], [-2.2, -2.6, -2.4]], fov: [54] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('wave', t0 + 0.1), seg('wave', tOut + 0.1, { fade: 0.1 })], [[-99, 'happy', 'smileOpen'], [tLo + 0.3, 'wink', 'blushSmile']]); sf(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) {
        const t = t0 + lt, c = o.tctx; sky(o, 'sun', 240, 300, lt);
        if (t >= tLo && t < tOut + 0.3) { const n = Math.min(14, Math.floor((t - tLo) * 20)); if (n > 0) plateText(o, 'LOGGING OFF...'.slice(0, n), 135, 52, { size: 14, border: '#7cf0ff', fg: '#c8f8ff' }); }
        if (t >= tOut) {
          bitText(c, CHANNEL, 135, 100, Math.max(1, Math.round(3 * popS(t, tOut))), '#fdd941');
          if (t >= tOut + 0.25) { plateText(o, 'ARTIFACT 004', 135, 128, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tOut + 0.25) }); plateText(o, 'ALARM CLOCK', 135, 152, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tOut + 0.25) }); }
          if (t >= tOut + 0.5) { const s3 = popS(t, tOut + 0.5) * (1 + 0.04 * Math.sin((t - tOut) * 9)), w = Math.round(218 * s3), h = Math.round(26 * s3), X = 135 - w / 2, Y = 352 - h / 2;
            c.fillStyle = '#040412'; c.fillRect(Math.round(X) - 2, Math.round(Y) - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(Math.round(X), Math.round(Y), w, h); c.fillStyle = '#ff7a92'; c.fillRect(Math.round(X), Math.round(Y), w, 2);
            bitText(c, 'FOLLOW ' + HANDLE, 135, 352, 2, '#ffffff', { outline: null }); }
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

