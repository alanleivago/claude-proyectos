import { menuKit, P as MKP } from './menukit.js';
import { bitText } from './pixfont.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
// film.js — "Mechayuki Expeditions 01: The Bedroom" (16:9; helpers from Digger 01-04) // was "Digger 04: the alarm clock" (sinaboto format, shots 1-31 at the bottom; helpers + sets reused from digger-02/03), full video (index.html?v=megagirl).
// Engine, helpers and village set from digger-01-fridge/engine/film.js; new sets: outhouse (+ ground cutaway over the pit),
// night village, bedroom + chamber pot, street facade with a real window, Harington's flush toilet with cistern + pull
// chain, house/sewer section, workshop (S bend), S-trap diagram, the dug-up modern toilet (Quaternius CC0).
// Shot: { t0, hard, scene, camera, update(lt, t), fx, overlay }. Times are GLOBAL seconds unless named lt.
export const CHANNEL = 'MECHAYUKI', HANDLE = '@mechayuki';
export const TAIL = 2.6;           // after the last word: the outro over her goodbye shot
export const ARTIFACT = 'EXPEDITION 01';

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
    const cam = new THREE.PerspectiveCamera(spec.fov?.[0] ?? 36, LW / LH, 0.05, 400);
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
  function labSet(scene) {   // v3: an MML2 lab/ruin room behind the Human Body Manual (floor y = -0.6): flagstones, carved relief
    // walls, ruin pillars, a bank of glowing blue monitors, a console desk, cable runs; cool key + teal fill
    L.addSky(scene, { near: 30, far: 90, preset: 'lab' }); scene.background = new THREE.Color(0x0a1430); scene.fog = new THREE.Fog(0x0a1430, 9, 22);
    const F = new THREE.Group(); F.position.y = -0.6; scene.add(F);
    L.box(16, 0.08, 12, mm(MT.flag, 9, 7, 0xa8b8d0), 0, -0.04, 1, F);
    reliefWall(F, { x: 0, z: -2.6, len: 16, h: 4.2, upper: MT.carved });
    reliefWall(F, { x: -4.2, z: 1.0, ry: Math.PI / 2, len: 8, h: 4.2, upper: MT.carved });
    for (const x of [-3.0, 3.4]) ruinPillar(F, x, -2.1, 3.8);
    const scr = L.cvs(32, 16, (c) => { c.fillStyle = '#0a2a5a'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#245a9a'; for (let x = 0; x < 32; x += 4) c.fillRect(x, 0, 1, 16); for (let y = 0; y < 16; y += 4) c.fillRect(0, y, 32, 1); c.fillStyle = '#7cf0ff'; c.fillRect(3, 10, 6, 2); c.fillRect(12, 5, 3, 7); c.fillRect(20, 8, 8, 2); c.fillStyle = '#fdd941'; c.fillRect(26, 3, 3, 2); });
    for (const [x, y, w, h] of [[-1.9, 2.2, 1.5, 0.9], [0.1, 2.5, 2.2, 1.2], [2.1, 2.1, 1.1, 0.8], [-1.0, 1.25, 0.9, 0.55], [1.2, 1.3, 0.9, 0.55]]) { L.box(w + 0.16, h + 0.16, 0.12, mm(MT.stone, 1, 1, 0x8890a0), x, y, -2.5, F); L.plane(w, h, L.basic(L.rep(scr, 1, 1), 1), x, y, -2.43, F); }
    L.box(3.0, 0.8, 0.7, mm(MT.stone, 3, 1, 0x9aa0b0), 0.1, 0.4, -2.05, F); L.box(3.1, 0.06, 0.8, mm(MT.darkWood, 3, 0.3), 0.1, 0.82, -2.05, F);
    for (let i = 0; i < 9; i++) L.box(0.09, 0.03, 0.06, L.basic(null, [0xff6a6a, 0x4cd060, 0xfdd941][i % 3]), -1.0 + i * 0.26, 0.86, -1.85, F);
    for (const [a, b] of [[[-2.4, 0.02, -2.3], [-0.6, 0.02, -1.4]], [[1.6, 0.02, -2.3], [2.6, 0.02, -0.6]]]) root(F, a, b, 0.04);
    rubble(F, -3.4, -1.2, 5, 0.9, 61); rubble(F, 3.6, -0.8, 4, 0.8, 71);
    scene.add(new THREE.AmbientLight(0x8898c8, 0.6)); const key = new THREE.DirectionalLight(0xd8e8ff, 1.3); key.position.set(-2, 4, 3); scene.add(key);
    const fill = new THREE.PointLight(0x5ad8ff, 2.2, 7); fill.position.set(0.2, 1.8, -1.2); scene.add(fill);
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
    const stand = L.box(0.42, 0.5, 0.36, litM(L.rep(OAK, 0.6, 0.6), 0x9a6a3a), -0.95, 0.25, -0.75, scene);
    // v2 MML2 relief: wainscot panels, baseboard, chair rail, crown on the back + side wall, timber floor, warm lamp light
    for (let px = -4.2; px < 4.4; px += 0.75) L.box(0.6, 0.62, 0.05, mm(MT.wainscot, 1, 1), px, 0.45, -1.55, scene);
    L.box(9, 0.9, 0.04, mm(MT.wainscot, 9 / 3, 1, 0x3a6e60), 0, 0.45, -1.58, scene); L.box(9, 0.07, 0.12, mm(MT.darkWood, 9, 0.3), 0, 0.92, -1.53, scene); L.box(9, 0.12, 0.1, mm(MT.darkWood, 9, 0.3), 0, 0.06, -1.54, scene); L.box(9, 0.12, 0.16, mm(MT.darkWood, 9, 0.3), 0, 3.12, -1.52, scene);
    for (let pz = -1.2; pz < 1.4; pz += 0.75) L.box(0.05, 0.62, 0.6, mm(MT.wainscot, 1, 1), -2.95, 0.45, pz, scene);
    L.box(0.04, 0.9, 6, mm(MT.wainscot, 2, 1, 0x3a6e60), -2.98, 0.45, 1.4, scene); L.box(0.12, 0.07, 6, mm(MT.darkWood, 0.3, 6), -2.94, 0.92, 1.4, scene);
    L.box(9, 0.04, 9, mm(MT.wood, 6, 6), 0, 0.01, 2.9, scene);
    const wl = new THREE.PointLight(0xffd8a8, 1.6, 7); wl.position.set(-0.6, 2.2, 0.6); scene.add(wl);   // nightstand beside her head (her right)
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
  // =====================================================================================================================
  // Mechayuki Expeditions 01: The Bedroom (16:9, 480x270 x4). Present = the buried bedroom "dungeon"; past = one set per
  // artifact; MML2 ITEM GET / INVENTORY menus as chapter cards; Human Body Manual pages. Storyboard version (fake timing).
  // =====================================================================================================================
  const CX = LW / 2;
  const DIRT = L.cvs(16, 16, (c) => { c.fillStyle = '#6a4a2c'; c.fillRect(0, 0, 16, 16); for (let i = 0; i < 40; i++) { c.fillStyle = ['#5a3c22', '#7a5834', '#4a301c'][i % 3]; c.fillRect((i * 7) % 16, (i * 11) % 16, 2, 1); } });
  const WALLP = L.cvs(16, 16, (c) => { c.fillStyle = '#7a8aa8'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#8a9ab8'; for (let x = 0; x < 16; x += 4) c.fillRect(x, 0, 2, 16); c.fillStyle = '#5a6a88'; c.fillRect(3, 5, 1, 1); c.fillRect(11, 12, 1, 1); });
  function mound(parent, x, z, r, h = 0.5, y = 0) { const o = L.mesh(new THREE.IcosahedronGeometry(r, 1), L.basic(L.rep(DIRT, 2, 2), 0.9), x, y, z, parent); o.scale.y = h / r; return o; }
  function root(parent, a, b, r = 0.025) { const m = L.mesh(new THREE.CylinderGeometry(r * 0.6, r, 1, 5), L.basic(null, 0x5a3a1c), 0, 0, 0, parent); orient(m, V3(a), V3(b)); return m; }
  function poster(parent, x, y, z, ry, kind) {
    const t = L.cvs(16, 22, (c) => { c.fillStyle = kind === 0 ? '#1a2a5a' : '#c84a3a'; c.fillRect(0, 0, 16, 22); c.fillStyle = '#ffe060'; if (kind === 0) { c.fillRect(6, 4, 4, 4); for (let i = 0; i < 6; i++) c.fillRect((i * 5) % 14 + 1, 10 + (i % 3) * 3, 1, 1); } else { c.fillRect(3, 3, 10, 2); c.fillStyle = '#fff'; c.fillRect(4, 8, 8, 9); c.fillStyle = '#1a1a1a'; c.fillRect(6, 10, 1, 1); c.fillRect(9, 10, 1, 1); } c.fillStyle = '#d8d0c0'; c.fillRect(13, 0, 3, 3); });
    const o = L.plane(0.55, 0.75, L.basic(t, 0.8, { side: THREE.DoubleSide }), x, y, z, parent); o.rotation.set(0, ry, 0.08 * (kind ? -1 : 1)); return o;
  }
  // props (present day)
  function mattressObj() { const g = new THREE.Group(); const sideT = L.cvs(32, 8, (c) => { c.fillStyle = '#e8e4f0'; c.fillRect(0, 0, 32, 8); c.fillStyle = '#b8b4c8'; for (let x = 0; x < 32; x += 4) c.fillRect(x, 3, 2, 2); });
    L.box(1.0, 0.22, 1.9, [L.basic(sideT, 1), L.basic(sideT, 1), L.basic(null, 0xf0eef6), L.basic(null, 0xd8d4e0), L.basic(sideT, 1), L.basic(sideT, 1)], 0, 0.11, 0, g);
    for (let i = 0; i < 6; i++) { const s = L.mesh(new THREE.TorusGeometry(0.05, 0.008, 3, 8), L.basic(null, 0x9aa0aa), 0.3 + (i % 3) * 0.08, 0.24 + Math.floor(i / 3) * 0.03, 0.6, g); s.rotation.y = 1.2; }
    return g; }
  function pillowObj(col = 0xf4f2ea) { const o = L.mesh(new THREE.SphereGeometry(0.3, 8, 4), litM(null, col), 0, 0.08, 0, null); o.scale.set(1, 0.3, 0.6); const g = new THREE.Group(); g.add(o); return g; }
  function blanketObj() { const g = new THREE.Group(); const o = duvet(g, 0, 0, 1.0, 0x4a72b8, 1.0, 0.25); return g; }
  function lampObj() { const g = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 10), litM(null, 0x3a3e48), 0, 0.015, 0, g); L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), litM(null, 0xc8a040), 0, 0.17, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.16, 10, 1, true), L.basic(null, 0xf8e0a8, { side: THREE.DoubleSide }), 0, 0.34, 0, g); return g; }
  function pajamasObj() { const t = L.cvs(16, 16, (c) => { c.fillStyle = '#7a9ae8'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#fff2a0'; for (const [x, y] of [[2, 2], [9, 5], [4, 10], [12, 12]]) { c.fillRect(x, y, 2, 2); c.fillStyle = '#7a9ae8'; c.fillRect(x + 1, y, 1, 1); c.fillStyle = '#fff2a0'; } });
    const g = new THREE.Group(); L.box(0.42, 0.04, 0.5, litM(L.rep(t, 2, 2), 0xffffff), 0, 0.02, 0, g); for (const s of [-1, 1]) { const a = L.box(0.14, 0.04, 0.4, litM(L.rep(t, 1, 2), 0xffffff), s * 0.27, 0.02, 0.05, g); a.rotation.y = s * 0.5; } return g; }
  function nightstandObj() { const g = new THREE.Group(), w = litM(L.rep(OAK, 0.6, 0.6), 0x9a6a3a); L.box(0.45, 0.55, 0.4, w, 0, 0.275, 0, g); L.box(0.4, 0.14, 0.02, litM(null, 0x7a4a24), 0, 0.42, 0.205, g);
    L.box(0.4, 0.28, 0.02, litM(null, 0x7a4a24), 0, 0.17, 0.205, g); L.mesh(new THREE.SphereGeometry(0.015, 5, 4), litM(null, BRASS), 0, 0.42, 0.22, g); L.mesh(new THREE.SphereGeometry(0.015, 5, 4), litM(null, BRASS), 0.14, 0.17, 0.22, g); return g; }
  function earplugsObj() { const g = new THREE.Group(); for (const s of [-1, 1]) { const o = L.mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.08, 8), litM(null, 0xf08a28), s * 0.05, 0.04, 0, g); o.rotation.z = s * 0.3; } return g; }
  function lavaLamp() { const g = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.12, 8), litM(null, 0x5a5e68), 0, 0.06, 0, g);
    const glass = L.mesh(new THREE.LatheGeometry([[0.05, 0], [0.075, 0.12], [0.06, 0.34], [0.035, 0.42]].map(([r, y]) => new THREE.Vector2(r, y)), 10), L.basic(null, 0xc848a0, { transparent: true, opacity: 0.75 }), 0, 0.12, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.07, 8), litM(null, 0x5a5e68), 0, 0.57, 0, g);
    const blobs = [0, 1, 2].map((i) => { const b = L.mesh(new THREE.IcosahedronGeometry(0.03 + i * 0.006, 1), L.basic(null, 0xffd23a), 0, 0.2, 0, g); return b; });
    g.userData.tick = (t) => blobs.forEach((b, i) => { b.position.y = 0.17 + 0.17 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 2.1)); b.position.x = 0.012 * Math.sin(t * 1.3 + i); b.scale.y = 1 + 0.3 * Math.sin(t * 0.9 + i); }); return g; }
  // ===================== MML2 look kit (v2, user: sets looked flat; reference fuentes/megaman-legends2) =====================
  // hand-painted 32 px textures with baked edge shading (dark outline + lit top/left), Lambert flat shading + real lights
  const rnd = (k) => hash(k * 7 + 3);
  function paintTex(w, h, fn) { return L.cvs(w, h, (c) => fn(c, (x, y, ww, hh, col) => { c.fillStyle = col; c.fillRect(x, y, ww, hh); })); }
  const MT = {
    stone: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#9aa494'); for (let i = 0; i < 60; i++) R((i * 13) % 31, (i * 7) % 31, 2, 1, i % 2 ? '#8a9484' : '#aab4a2'); R(0, 0, 32, 2, '#c4ccb8'); R(0, 0, 2, 32, '#b4bca8'); R(0, 30, 32, 2, '#5a6458'); R(30, 0, 2, 32, '#6a7466'); }),
    carved: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#94a090'); for (let i = 0; i < 50; i++) R((i * 11) % 31, (i * 5) % 31, 2, 1, '#86927f'); R(0, 0, 32, 2, '#c4ccb8'); R(0, 0, 2, 32, '#b0b8a4'); R(0, 30, 32, 2, '#525c50'); R(30, 0, 2, 32, '#646e60');
      const g = '#5e6a5a', l = '#bcc6b2'; R(6, 8, 20, 2, g); R(6, 8, 2, 16, g); R(6, 22, 12, 2, g); R(16, 14, 2, 10, g); R(16, 14, 8, 2, g); R(24, 14, 2, 10, g); R(7, 10, 18, 1, l); R(17, 16, 6, 1, l); c.fillStyle = g; c.fillRect(12, 13, 3, 3); }),
    wainscot: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#3e7a6a'); R(3, 3, 26, 26, '#4a8e7a'); R(3, 3, 26, 2, '#6aae96'); R(3, 3, 2, 26, '#5aa088'); R(3, 27, 26, 2, '#2a5a4c'); R(27, 3, 2, 26, '#2e6252'); R(0, 0, 32, 1, '#2a5a4c'); }),
    plaster: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#e8dcbc'); for (let i = 0; i < 40; i++) R((i * 7) % 31, (i * 11) % 31, 3, 2, i % 2 ? '#e0d2b0' : '#efe4c8'); R(0, 28, 32, 4, '#d6c8a4'); }),
    paper: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#d8c8a0'); for (let x = 0; x < 32; x += 8) { R(x + 3, 0, 2, 32, '#c8b48a'); } for (let y = 4; y < 32; y += 8) for (let x = 0; x < 32; x += 8) { R(x + 6, y, 3, 3, '#a8784a'); R(x + 7, y - 1, 1, 5, '#a8784a'); } }),
    wood: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#a86a3a'); for (let y = 0; y < 32; y += 8) { R(0, y, 32, 1, '#5a3418'); R(0, y + 1, 32, 1, '#c8844c'); for (let i = 0; i < 4; i++) R((i * 9 + y) % 30, y + 3 + (i % 3), 6, 1, '#94582c'); R((y * 3) % 30, y, 1, 8, '#5a3418'); } }),
    darkWood: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#6a4224'); for (let i = 0; i < 12; i++) R(0, (i * 3) % 32, 32, 1, i % 2 ? '#5a361c' : '#7a4e2c'); R(0, 0, 32, 2, '#8a5e36'); R(0, 30, 32, 2, '#3a2412'); }),
    flag: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#6a6458'); const st = [[1, 1, 14, 9], [16, 1, 15, 6], [1, 11, 9, 10], [11, 11, 11, 9], [23, 8, 8, 12], [1, 22, 13, 9], [15, 21, 16, 10]];
      st.forEach(([x, y, w, h], i) => { R(x, y, w, h, ['#c8bea4', '#bcb298', '#d0c6ac'][i % 3]); R(x, y, w, 1, '#ddd4bc'); R(x, y + h - 1, w, 1, '#9a907a'); }); }),
    roof: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#b85a3a'); for (let y = 0; y < 32; y += 8) { R(0, y + 6, 32, 2, '#7a3220'); for (let x = (y / 8) % 2 ? 0 : 4; x < 32; x += 8) { R(x, y, 6, 2, '#d8784e'); R(x + 7, y, 1, 7, '#8a3a24'); } } }),
    stucco: paintTex(32, 32, (c, R) => { R(0, 0, 32, 32, '#efe6cc'); for (let i = 0; i < 30; i++) R((i * 7) % 31, (i * 13) % 31, 3, 2, i % 2 ? '#e4d8ba' : '#f6efda'); }),
    awning: paintTex(16, 16, (c, R) => { for (let x = 0; x < 16; x += 4) R(x, 0, 4, 16, (x / 4) % 2 ? '#f0ecd8' : '#3a8a5a'); R(0, 14, 16, 2, '#2a5a3a'); }),
    earth: paintTex(16, 16, (c, R) => { R(0, 0, 16, 16, '#5a3e26'); for (let i = 0; i < 30; i++) R((i * 7) % 15, (i * 11) % 15, 2, 1, ['#4a321e', '#6a4a2e', '#3a2616'][i % 3]); }),
    rug: paintTex(32, 24, (c, R) => { R(0, 0, 32, 24, '#8a2a3a'); R(2, 2, 28, 20, '#b8445a'); R(4, 4, 24, 16, '#8a2a3a'); for (let x = 6; x < 26; x += 5) R(x, 10, 3, 3, '#e8c060'); }),
  };
  const mm = (tex, rx, ry, col = 0xffffff) => litM(L.rep(tex, rx, ry), col);
  // relief panel wall: baseboard + raised wainscot panels + chair rail + plaster/paper upper wall + crown moulding. Built
  // along +x from (x0, z) facing +z (rotate the group for side walls).
  function reliefWall(parent, { x = 0, z = 0, ry = 0, len = 6, h = 2.8, upper = MT.plaster, wainH = 0.95, skip = [] } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
    L.box(len, h, 0.1, mm(upper, len / 1.2, h / 1.2), 0, h / 2, -0.05, g);
    L.box(len, wainH, 0.06, mm(MT.wainscot, len / 3, 1, 0x3a6e60), 0, wainH / 2, 0.02, g);
    for (let px = -len / 2 + 0.4; px < len / 2 - 0.2; px += 0.75) { if (skip.some(([a, b]) => px > a && px < b)) continue; L.box(0.6, wainH - 0.24, 0.05, mm(MT.wainscot, 1, 1), px + 0.3, wainH / 2 + 0.04, 0.06, g); }
    L.box(len, 0.12, 0.1, mm(MT.darkWood, len, 0.3), 0, 0.06, 0.06, g);
    L.box(len, 0.07, 0.12, mm(MT.darkWood, len, 0.3), 0, wainH, 0.07, g);
    L.box(len, 0.1, 0.16, mm(MT.darkWood, len, 0.3), 0, h - 0.05, 0.06, g); L.box(len, 0.04, 0.2, mm(MT.wood, len, 0.2), 0, h - 0.13, 0.06, g);
    return g;
  }
  // ruin stone: courses of individual carved blocks with jittered depth (the MML2 ruin wall), filling a rectangle
  function stoneCourses(parent, { x0, x1, y0, y1, z, ry = 0, bw = 0.6, bh = 0.4, depth = 0.3, seed = 1, carvedEvery = 3 } = {}) {
    const g = new THREE.Group(); g.position.set(0, 0, 0); parent.add(g); let k = seed;
    for (let y = y0, row = 0; y < y1 - 0.01; y += bh, row++) for (let x = x0 - (row % 2) * bw / 2; x < x1 - 0.01; x += bw) {
      const xa = Math.max(x, x0), xb = Math.min(x + bw, x1); if (xb - xa < 0.08) continue; k++;
      const d = depth * (0.7 + 0.6 * rnd(k)), tex = k % carvedEvery === 0 ? MT.carved : MT.stone, tint = [0xffffff, 0xe8ece0, 0xd8dccc][k % 3];
      const b = L.box(xb - xa - 0.02, bh - 0.02, d, mm(tex, 1, 1, tint), (xa + xb) / 2, y + bh / 2, z + d / 2 - depth / 2, g);
      if (ry) { b.position.applyAxisAngle(V3([0, 1, 0]), ry); b.rotation.y = ry; }
    }
    return g;
  }
  function rubble(parent, x, z, n = 6, s = 1, seed = 1) { for (let i = 0; i < n; i++) { const r = (0.08 + rnd(seed + i) * 0.16) * s; const o = L.mesh(new THREE.DodecahedronGeometry(r, 0), mm(MT.stone, 1, 1, 0xd0d4c4), x + (rnd(seed + i * 3) - 0.5) * 0.9 * s, r * 0.6, z + (rnd(seed + i * 5) - 0.5) * 0.7 * s, parent); o.rotation.set(i, i * 1.7, i * 0.6); } }
  function ruinPillar(parent, x, z, h = 2.8) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    L.box(0.62, 0.22, 0.62, mm(MT.stone, 1, 0.4), 0, 0.11, 0, g); L.box(0.46, h - 0.5, 0.46, mm(MT.carved, 1, (h - 0.5) / 0.6), 0, h / 2, 0, g); L.box(0.62, 0.26, 0.62, mm(MT.stone, 1, 0.4), 0, h - 0.13, 0, g);
    for (let i = 0; i < 3; i++) L.box(0.5, 0.05, 0.5, mm(MT.stone, 1, 0.1, 0xb8bca8), 0, 0.6 + i * 0.7, 0, g); return g; }
  function bookshelf(parent, x, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
    const w = mm(MT.wood, 1, 2); L.box(0.8, 1.4, 0.3, w, 0, 0.7, 0, g); for (const y of [0.05, 0.5, 0.95, 1.38]) L.box(0.76, 0.04, 0.28, mm(MT.darkWood, 1, 0.2), 0, y, 0.02, g);
    for (let s = 0; s < 3; s++) for (let i = 0; i < 7; i++) { const bh = 0.25 + rnd(s * 9 + i) * 0.12; const b = L.box(0.07, bh, 0.2, litM(null, [0xc84a3a, 0x3a6ab0, 0xe8c050, 0x4a9a5a, 0x8a5aa8][(s + i) % 5]), -0.3 + i * 0.09, 0.08 + s * 0.45 + bh / 2, 0.04, g); if (i === 6) b.rotation.z = 0.3; } return g; }

  // the buried bedroom v2: a modern bedroom swallowed by an MML2 ruin. Relief panel walls (wainscot, chair rail, crown), the
  // right wall + a breach in the back wall are ruin stone courses with carved blocks; two ruin pillars; beams + earth ceiling with
  // a hole (light shaft); rubble, earth mounds, roots; bed, nightstand, lamp, phone, earplugs, wardrobe, bookshelf, rug,
  // posters, clothes, mouldy cup; the lava lamp under the bed. Lit: dark ambient, warm key, cool shaft light, black fog.
  function dungeon(scene) {
    scene.background = new THREE.Color(0x07080c); scene.fog = new THREE.Fog(0x07080c, 5.5, 13);
    L.box(6.2, 0.08, 3.8, mm(MT.wood, 6, 3.8), 0, -0.04, -0.2, scene);
    L.box(9, 0.06, 6, mm(MT.flag, 4, 3, 0x8a8a7a), 0, -0.07, 3.5, scene);
    reliefWall(scene, { x: -0.9, z: -2.0, len: 4.2, upper: MT.paper });
    stoneCourses(scene, { x0: 1.2, x1: 3.0, y0: 0, y1: 2.8, z: -2.05, depth: 0.45, seed: 3 });
    reliefWall(scene, { x: -3.0, z: -0.2, ry: Math.PI / 2, len: 3.8, upper: MT.paper });
    stoneCourses(scene, { x0: -2.2, x1: 1.6, y0: 0, y1: 2.8, z: -3.05, ry: -Math.PI / 2, depth: 0.4, seed: 9 });
    stoneCourses(scene, { x0: -3.0, x1: -1.6, y0: 2.0, y1: 2.8, z: -2.0, depth: 0.3, seed: 15 });
    ruinPillar(scene, 2.55, -1.6); ruinPillar(scene, 2.6, 1.2, 2.8);
    L.box(7, 0.2, 4.4, mm(MT.earth, 6, 4, 0x8a7a6a), 0, 2.9, -0.2, scene);
    for (const [x, rz] of [[-2.0, 0], [-0.6, 0], [0.8, 0.0]]) L.box(0.18, 0.2, 4.2, mm(MT.darkWood, 0.3, 4), x, 2.72, -0.2, scene).rotation.z = rz;
    const fb = L.box(0.2, 0.22, 3.6, mm(MT.darkWood, 0.3, 4), 1.8, 1.7, -0.3, scene); fb.rotation.set(0.15, 0.2, 0.55);
    L.mesh(new THREE.CircleGeometry(0.6, 10), L.basic(null, 0xcfe8ff), 1.9, 2.79, 0.4, scene).rotation.x = Math.PI / 2;
    const win = L.plane(0.9, 0.9, L.basic(L.rep(MT.earth, 2, 2), 0.8), -2.94, 1.55, -1.0, scene); win.rotation.y = Math.PI / 2;
    for (const s of [-1, 1]) L.box(0.12, 1.0, 0.08, mm(MT.plaster, 0.2, 1), -2.93, 1.55, -1.0 + s * 0.5, scene).rotation.y = Math.PI / 2;
    const bd = bed(scene, { x: 0.3, z: -0.8, full: true });
    const rug = L.box(1.6, 0.02, 1.0, litM(MT.rug, 0xffffff), 0.1, 0.01, 0.7, scene);
    const ns = nightstandObj(); ns.position.set(-0.75, 0, -1.55); scene.add(ns);
    const lamp = lampObj(); lamp.position.set(-0.85, 0.55, -1.6); scene.add(lamp);
    const ph = phone(); ph.position.set(-0.62, 0.56, -1.48); ph.rotation.set(-Math.PI / 2, 0, 0.4); scene.add(ph);
    const ep = earplugsObj(); ep.position.set(-0.68, 0.55, -1.42); scene.add(ep);
    bookshelf(scene, -2.6, 0.4, Math.PI / 2);
    const wd = new THREE.Group(); wd.position.set(2.0, 0, 0.6); wd.rotation.set(0, -0.3, 1.1); scene.add(wd);
    L.box(0.9, 1.9, 0.5, mm(MT.wood, 1, 2), 0, 0.95, 0, wd); for (const y of [0.3, 0.7]) L.box(0.84, 0.3, 0.04, mm(MT.darkWood, 1, 0.4), 0, y, 0.26, wd);
    for (const [x, z, r, h] of [[-2.4, -1.5, 0.9, 0.7], [2.2, -1.2, 0.8, 0.6], [-2.5, 1.5, 0.8, 0.5], [1.4, 2.0, 0.6, 0.35], [-1.7, 0.6, 0.45, 0.25], [2.5, 2.4, 0.9, 0.6]]) mound(scene, x, z, r, h);
    rubble(scene, 1.5, -1.6, 7, 1, 2); rubble(scene, 2.2, 1.8, 6, 1.2, 8); rubble(scene, -2.2, -0.6, 5, 0.8, 14); rubble(scene, 0.9, 1.6, 4, 0.7, 20);
    for (const [a, b] of [[[-1.0, 2.8, -1.0], [-1.3, 1.6, -1.4]], [[0.2, 2.8, 0.2], [0.5, 2.0, -0.2]], [[2.0, 2.8, -1.2], [2.3, 1.4, -1.6]], [[-2.2, 2.8, 0.5], [-2.0, 2.1, 0.9]]]) root(scene, a, b);
    poster(scene, -1.6, 1.75, -1.93, 0, 0); poster(scene, 0.6, 1.8, -1.93, 0, 1);
    for (const [x, z, c, ry] of [[-1.3, 0.9, 0xc84a3a, 0.4], [1.1, 1.3, 0x3a6ab0, -0.6], [-0.4, 1.6, 0xe8d050, 1.2]]) { const o = L.box(0.4, 0.03, 0.3, litM(null, c), x, 0.015, z, scene); o.rotation.y = ry; }
    L.mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 8), litM(null, 0xf4f0e8), -0.55, 0.6, -1.66, scene); L.mesh(new THREE.SphereGeometry(0.035, 6, 4), L.basic(null, 0x6ac040), -0.55, 0.65, -1.66, scene);
    const ll = lavaLamp(); ll.position.set(0.5, 0.0, -0.9); ll.scale.setScalar(0.32); scene.add(ll);   // fits under the bed frame (0.2 m)
    const shaft = sunbeam(scene); orient(shaft, V3([1.9, 2.8, 0.4]), V3([1.0, 0, 0.6])); shaft.scale.x = shaft.scale.z = 1.4; shaft.material.opacity = 0.14;
    scene.add(new THREE.AmbientLight(0x8890a8, 0.55));
    const key = new THREE.PointLight(0xffc890, 3.2, 5.5); key.position.set(-0.6, 1.3, -0.9); scene.add(key);
    const fill = new THREE.PointLight(0x9ab8ff, 2.0, 9); fill.position.set(0.6, 2.0, 2.6); scene.add(fill);
    const sun = new THREE.DirectionalLight(0xd8ecff, 1.4); sun.position.set(2.4, 5, 1.2); sun.target.position.set(0.8, 0, 0.4); scene.add(sun, sun.target);
    return { bd, ns, lamp, ph, ep, wd, ll, win };
  }
  // MML2 interior (past rooms): flagstone floor, relief wainscot walls with timber posts, deep window recess, ceiling beams,
  // warm lamp light (same footprint as the old tudorRoom: back wall z = -0.75, left wall x = -2.4)
  function tudorRoom(scene) {
    L.addSky(scene, { near: 7, far: 40, preset: 'interior' });
    L.box(10, 0.08, 9, mm(MT.flag, 6, 5), 0, -0.04, 3.7, scene);
    reliefWall(scene, { x: 0, z: -0.75, len: 10, h: 3.6, upper: MT.plaster });
    reliefWall(scene, { x: -2.4, z: 3.7, ry: Math.PI / 2, len: 9, h: 3.6, upper: MT.plaster });
    for (let x = -4.5; x <= 4.5; x += 1.8) L.box(0.18, 3.6, 0.14, mm(MT.darkWood, 0.3, 3), x, 1.8, -0.62, scene);
    for (let z = -0.3; z < 6; z += 1.4) L.box(10, 0.2, 0.18, mm(MT.darkWood, 6, 0.3), 0, 3.45, z, scene);
    const wg = new THREE.Group(); wg.position.set(1.7, 2.1, -0.7); scene.add(wg);
    L.box(0.86, 1.06, 0.3, mm(MT.stucco, 1, 1, 0xd8ccb0), 0, 0, -0.12, wg); L.box(0.7, 0.9, 0.02, L.basic(L.cvs(16, 20, (c) => { c.fillStyle = '#2a2a30'; c.fillRect(0, 0, 16, 20); c.fillStyle = '#a8c8d8'; for (let y = 1; y < 20; y += 4) for (let x = (y % 8 === 1 ? 1 : 3); x < 16; x += 4) c.fillRect(x, y, 2, 2); }), 1.2), 0, 0, 0.0, wg);
    L.box(0.96, 0.08, 0.36, mm(MT.wood, 1, 0.2), 0, -0.54, 0.0, wg);
    scene.add(new THREE.AmbientLight(0xfff0dc, 0.45));
    const lp = new THREE.PointLight(0xffd8a0, 2.4, 9); lp.position.set(0.2, 2.6, 1.6); scene.add(lp);
  }
  // MML2 town (the cities of the past): flagstone plaza, cream stucco houses with timber corners, string-course bands, deep
  // windows with green shutters and flower boxes, terracotta gable roofs with chimneys, a striped green awning, hanging signs,
  // iron lamp posts with lanterns, potted trees, a fountain, the sea and green hills beyond
  function signTex(txt, bg = '#3a2a1a', fg = '#ffe8a8') { return L.cvs(48, 16, (c) => { c.fillStyle = bg; c.fillRect(0, 0, 48, 16); c.fillStyle = '#e0b860'; c.fillRect(0, 0, 48, 1); c.fillRect(0, 15, 48, 1); bitText(c, txt, 24, 8, 1, fg, { outline: null }); }); }
  function townHouse(parent, { x = 0, z = 0, ry = 0, w = 4, d = 3.4, h = 4.2, floors = 2, awning = false, sign = null, door = 0, roofCol = 0xffffff, wallTint = 0xffffff } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
    L.box(w, h, d, mm(MT.stucco, w / 1.5, h / 1.5, wallTint), 0, h / 2, 0, g);
    L.box(w + 0.1, 0.45, d + 0.1, mm(MT.stone, w / 0.6, 0.8), 0, 0.22, 0, g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.box(0.16, h, 0.16, mm(MT.darkWood, 0.3, 3), sx * (w / 2 - 0.02), h / 2, sz * (d / 2 - 0.02), g);
    for (let f = 1; f < floors; f++) L.box(w + 0.06, 0.12, d + 0.06, mm(MT.darkWood, w, 0.3), 0, f * h / floors, 0, g);
    const fz = d / 2;
    for (let f = 0; f < floors; f++) for (let wx = -w / 2 + 0.85; wx < w / 2 - 0.5; wx += 1.25) {
      if (f === 0 && Math.abs(wx - door) < 0.7) continue;
      const y = f * h / floors + h / floors * 0.55;
      L.box(0.62, 0.82, 0.06, L.basic(null, f === 0 && awning ? 0xffd88a : 0x2a3448), wx, y, fz + 0.005, g);
      L.box(0.78, 0.1, 0.16, mm(MT.stone, 1, 0.2, 0xe8e0d0), wx, y - 0.46, fz + 0.06, g); L.box(0.74, 0.08, 0.1, mm(MT.stucco, 1, 0.2, 0xd8ccb0), wx, y + 0.45, fz + 0.04, g);
      for (const s of [-1, 1]) { const sh = L.box(0.3, 0.84, 0.04, mm(MT.wainscot, 0.5, 1, 0x4a9a6a), wx + s * 0.48, y, fz + 0.08, g); sh.rotation.y = s * 0.35; }
      if (f > 0 && (wx + f) % 2 > 0.6) { L.box(0.7, 0.14, 0.18, mm(MT.wood, 1, 0.3), wx, y - 0.56, fz + 0.12, g); for (let i = 0; i < 4; i++) L.box(0.08, 0.08, 0.08, L.basic(null, [0xe84a4a, 0xffe060, 0xf080b0][i % 3]), wx - 0.24 + i * 0.16, y - 0.44, fz + 0.14, g); }
    }
    const dd = door3D(g, { x: door, z: fz + 0.02, w: 0.9, h: 1.9, tint: 0x7a5232 });
    const rh = 1.4, rl = Math.hypot(d / 2 + 0.35, rh);
    for (const s of [-1, 1]) { const r = L.box(w + 0.5, 0.14, rl, mm(MT.roof, (w + 0.5) / 0.9, rl / 0.9, roofCol), 0, h + rh / 2, s * (d / 4 + 0.09), g); r.rotation.x = s * Math.atan2(rh, d / 2 + 0.35); }
    L.box(w + 0.56, 0.16, 0.2, mm(MT.roof, 3, 0.3, 0xc8a090), 0, h + rh + 0.02, 0, g);
    const gab = new THREE.Shape(); gab.moveTo(-d / 2, 0); gab.lineTo(d / 2, 0); gab.lineTo(0, rh); gab.lineTo(-d / 2, 0);
    for (const s of [-1, 1]) { const m = L.mesh(new THREE.ShapeGeometry(gab), mm(MT.stucco, 1, 1, wallTint), s * w / 2, h, 0, g); m.rotation.y = s * Math.PI / 2; }
    L.box(0.4, 1.2, 0.4, mm(MT.stone, 0.6, 1.6, 0xe0d8c8), w / 2 - 0.8, h + rh, -d / 4, g); L.box(0.5, 0.1, 0.5, mm(MT.stone, 0.6, 0.2), w / 2 - 0.8, h + rh + 0.62, -d / 4, g);
    if (awning) { const a = L.box(w * 0.7, 0.06, 0.9, litM(L.rep(MT.awning, w * 2, 1), 0xffffff), door, h / floors - 0.15, fz + 0.4, g); a.rotation.x = 0.35; L.box(w * 0.7, 0.18, 0.02, litM(L.rep(MT.awning, w * 2, 0.4), 0xffffff), door, h / floors - 0.4, fz + 0.82, g); }
    if (sign) { const arm = L.box(0.7, 0.05, 0.05, litM(null, 0x2a2a30), door + 0.9, 2.3, fz + 0.35, g); arm.rotation.y = Math.PI / 2; const sp = L.box(0.72, 0.36, 0.05, litM(signTex(sign), 0xffffff), door + 0.9, 2.05, fz + 0.62, g); }
    return g;
  }
  function lampPost(parent, x, z, { night = false } = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); const ir = litM(null, 0x2a3a34);
    L.box(0.24, 0.2, 0.24, ir, 0, 0.1, 0, g); L.mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.6, 6), ir, 0, 1.4, 0, g); L.box(0.3, 0.06, 0.06, ir, 0.1, 2.6, 0, g);
    L.box(0.22, 0.3, 0.22, L.basic(null, night ? 0xffe8a0 : 0xf4e8c0), 0.22, 2.42, 0, g); L.mesh(new THREE.ConeGeometry(0.2, 0.16, 4), ir, 0.22, 2.65, 0, g).rotation.y = Math.PI / 4;
    if (night) { const p = new THREE.PointLight(0xffd890, 2.2, 5); p.position.set(x + 0.22, 2.3, z); parent.add(p); } return g; }
  function pottedTree(parent, x, z, s = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
    L.mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.5, 8), mm(MT.roof, 1, 0.5, 0xffd0b0), 0, 0.25, 0, g); L.mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.06, 8), mm(MT.stone, 1, 0.1), 0, 0.5, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.8, 5), litM(null, 0x6a4a2a), 0, 0.9, 0, g); const f = L.mesh(new THREE.IcosahedronGeometry(0.5, 1), litM(L.rep(LEAF, 2, 2), 0xffffff), 0, 1.45, 0, g); f.scale.y = 0.85; return g; }
  function fountain(parent, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    L.mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.5, 12), mm(MT.stone, 4, 0.6, 0xe8e4d8), 0, 0.25, 0, g); L.mesh(new THREE.CircleGeometry(1.15, 12), L.basic(null, 0x5aa8e8), 0, 0.46, 0, g).rotation.x = -Math.PI / 2;
    L.mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.3, 8), mm(MT.carved, 1, 2), 0, 0.9, 0, g); L.mesh(new THREE.CylinderGeometry(0.55, 0.3, 0.2, 10), mm(MT.stone, 2, 0.3), 0, 1.6, 0, g); return g; }
  function mmlTown(scene, { preset = 'morning', night = false } = {}) {
    L.addSky(scene, { near: 18, far: 120, preset });
    L.box(40, 0.1, 40, mm(MT.flag, 24, 24), 0, -0.05, -6, scene);
    townHouse(scene, { x: -4.6, z: -5.2, w: 4.2, h: 4.4, door: -0.6, sign: 'INN', awning: true });
    townHouse(scene, { x: 0.2, z: -6.4, w: 4.6, h: 5.0, floors: 3, door: 0.9, wallTint: 0xf4e0c4 });
    townHouse(scene, { x: 5.0, z: -5.0, w: 4.0, h: 4.0, door: 0.0, sign: 'BAKERY', roofCol: 0xd8c0b0 });
    townHouse(scene, { x: -9.2, z: -2.2, ry: Math.PI / 2, w: 5, h: 4.6, door: 0.4 });
    townHouse(scene, { x: 9.4, z: -1.4, ry: -Math.PI / 2, w: 5, h: 4.2, door: -0.8, awning: true, wallTint: 0xe8f0e0 });
    fountain(scene, 0.3, -1.4);
    for (const [x, z] of [[-2.6, -2.7], [3.0, -2.6], [-6.4, 0.6], [6.6, 0.8]]) lampPost(scene, x, z, { night });
    for (const [x, z, s] of [[-2.0, -3.4, 0.9], [2.4, -3.6, 0.9], [-7.0, -2.6, 1.1], [7.2, -2.4, 1.0]]) pottedTree(scene, x, z, s);
    L.plane(200, 60, L.basic(null, 0x4a8ad0), 0, -0.3, -60, scene, 0, -Math.PI / 2);
    for (const [x, z, h] of [[-14, -16, 6], [14, -18, 7], [-20, -10, 5], [20, -8, 5.5]]) leafTree(scene, x, z, h);
    const hill = L.mesh(new THREE.SphereGeometry(18, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), litM(L.rep(T.snow, 8, 4), 0xc8e8b0), -22, -6, -46, scene); hill.scale.y = 0.35;
    if (night) scene.add(new THREE.AmbientLight(0x8090c0, 0.25));
  }
  // the hill above the bedroom (the hook / the goodbye): grassy mound, a window frame poking out, a TV aerial, trees
  // v2 (user: make it look like the MML2 meadow, review/ref_mml2_prado.png): one solid ground (no coplanar layers -> no
  // z-fighting), soft rolling green hills fading to pale blue-green, a big bright blue sky with large fluffy PS1 clouds, a
  // rainbow, a tan dirt/rock cliff band with a dirt mound. Textures are mipmapped (min) + nearest (mag): no shimmer.
  function meadowTex(w, h, fn, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8; return t; }
  const GRASS = (c, w, h) => { c.fillStyle = '#5cae3e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = ['#4e9e34', '#68ba48', '#56a63a', '#72c252'][i % 4]; c.fillRect(Math.floor(hash(i + 3) * w), Math.floor(hash(i + 71) * h), 2, 1); } };
  function meadow(scene) {
    const sky = document.createElement('canvas'); sky.width = 4; sky.height = 128; const sc = sky.getContext('2d'); const gr = sc.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, '#1d6ad6'); gr.addColorStop(0.45, '#3f94ea'); gr.addColorStop(0.78, '#8ccaf2'); gr.addColorStop(1, '#c6ecf2'); sc.fillStyle = gr; sc.fillRect(0, 0, 4, 128);
    const st = new THREE.CanvasTexture(sky); st.colorSpace = THREE.SRGBColorSpace; scene.background = st;
    scene.fog = new THREE.Fog(0xbfe4e4, 30, 170);
    scene.add(new THREE.HemisphereLight(0xeef6ff, 0x5a8a3a, 1.7)); const sun = new THREE.DirectionalLight(0xfff4e0, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
    // no PS1 vertex snap on the ground/hills: the snapped 500 m plane swam and shimmered while the camera moved
    const gm = (rep, col = 0xffffff) => new THREE.MeshLambertMaterial({ map: meadowTex(32, 32, GRASS, rep), color: col, flatShading: true });
    L.plane(500, 500, gm([160, 160]), 0, 0, 0, scene, 0, -Math.PI / 2);
    // rolling hills: near ones grass-green, far ones lighter and bluer (the fog finishes the fade)
    for (const [x, z, r, sy, col] of [[-34, -48, 24, 0.17, 0xffffff], [30, -62, 30, 0.15, 0xe8f4d8], [-70, -90, 40, 0.16, 0xd0ead0], [60, -110, 46, 0.14, 0xc4e4d4],
      [0, -150, 70, 0.11, 0xb8dcd8], [-120, -50, 50, 0.15, 0xd8ecd0], [110, -30, 44, 0.13, 0xe0f0d8], [-36, 66, 42, 0.14, 0xffffff], [44, 76, 46, 0.12, 0xffffff]]) {
      const hm = L.mesh(new THREE.SphereGeometry(r, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), gm([r / 3, r / 6], col), x, -0.02, z, scene); hm.scale.y = sy; }
    // the tan dirt / rock cliff band (right of the view, like the MML2 shot), grass on its top, a dirt mound in front
    const DIRTB = meadowTex(32, 32, (c, w, h) => { c.fillStyle = '#c8a878'; c.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { c.fillStyle = ['#b89464', '#d6b88a', '#a88458', '#dcc49a'][i % 4]; c.fillRect(Math.floor(hash(i + 9) * w), Math.floor(hash(i + 33) * h), 3, 2); } c.fillStyle = '#9a7a50'; for (let y = 6; y < h; y += 9) c.fillRect(0, y, w, 1); }, null);
    const band = new THREE.Group(); band.position.set(10, 0, -17); band.rotation.y = -0.42; scene.add(band);
    const dm = (rx, ry) => { const t = DIRTB.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshLambertMaterial({ map: t, flatShading: true }); };
    L.box(24, 2.0, 3, dm(8, 1), 0, 1.0, 0, band); L.box(24.4, 0.3, 3.4, gm([8, 1]), 0, 2.12, 0, band);
    for (let i = 0; i < 7; i++) { const r = L.mesh(new THREE.DodecahedronGeometry(0.6 + hash(i) * 0.5, 0), dm(1, 1), -10.5 + i * 3.5, 0.35, 1.7 + hash(i + 4) * 0.4, band); r.rotation.set(i, i * 2, 0); }
    const mound = L.mesh(new THREE.ConeGeometry(1.0, 0.7, 7), dm(2, 1), 3.6, 0.35, -6.5, scene); mound.rotation.y = 0.4;
    // big fluffy PS1 clouds (billboards, low-res, hard edges) and the rainbow, neither fogged
    const CLOUD = meadowTex(64, 32, (c, w, h) => { const bl = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); };
      for (const [x, y, r] of [[14, 22, 9], [26, 15, 12], [40, 14, 11], [52, 21, 9], [33, 22, 10]]) bl(x, y + 2, r, '#d4e2ee'); for (const [x, y, r] of [[14, 20, 9], [26, 13, 12], [40, 12, 11], [52, 19, 9], [33, 20, 10]]) bl(x, y, r, '#ffffff');
      c.fillStyle = '#c4d6e6'; c.fillRect(6, 27, 54, 3); }, null);
    CLOUD.wrapS = CLOUD.wrapT = THREE.ClampToEdgeWrapping; CLOUD.minFilter = THREE.NearestFilter; CLOUD.generateMipmaps = false;
    for (let i = 0; i < 16; i++) { const a = -Math.PI + i / 16 * Math.PI * 2 + hash(i) * 0.2, R = 120 + hash(i + 5) * 40;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: CLOUD, fog: false, depthWrite: false, transparent: true, alphaTest: 0.5 })); s.position.set(Math.sin(a) * R, 14 + hash(i + 9) * 16, -Math.cos(a) * R); s.scale.set(70 + hash(i + 2) * 40, 30 + hash(i + 7) * 14, 1); s.renderOrder = -2; scene.add(s); }
    const rb = new THREE.Group(); rb.position.set(34, -6, -112); rb.rotation.y = -0.3; scene.add(rb);
    ['#ff4a4a', '#ff9a3a', '#ffe04a', '#5ad84a', '#4aa8ff', '#5a5ae8', '#a85ae8'].forEach((col, k) => { const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5, fog: false, depthWrite: false, side: THREE.DoubleSide });
      const t = new THREE.Mesh(new THREE.TorusGeometry(46 - k * 1.3, 0.65, 3, 48, Math.PI), m); t.renderOrder = -1; rb.add(t); });
  }
  // stable 3D flowers (small boxes) instead of the alpha-tested ground plane that shimmered and z-fought
  function flowers3D(parent, x, z, w, d, n = 40) { const cols = [0xffe060, 0xffffff, 0xf080b0, 0xe84a4a]; for (let i = 0; i < n; i++) { const fx = x + (hash(i + 11) - 0.5) * w, fz = z + (hash(i + 23) - 0.5) * d;
    L.box(0.012, 0.09, 0.012, new THREE.MeshBasicMaterial({ color: 0x3a8a2a }), fx, 0.045, fz, parent); L.box(0.045, 0.03, 0.045, new THREE.MeshBasicMaterial({ color: cols[i % 4] }), fx, 0.1, fz, parent); } }
  function hillSet(scene, { preset = 'morning' } = {}) {
    meadow(scene);   // v2: the MML2 meadow (sky, clouds, rainbow, rolling hills, cliff band)
    const h = L.mesh(new THREE.SphereGeometry(4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ map: meadowTex(32, 32, GRASS, [6, 3]), flatShading: true }), 0, -1.2, -4, scene); h.scale.y = 0.55;
    const fr = litM(null, 0xe8e0d0); const wf = new THREE.Group(); wf.position.set(-0.6, 0.15, -1.15); wf.rotation.set(-0.5, 0.2, 0); scene.add(wf);
    for (const s of [-1, 1]) L.box(0.06, 0.8, 0.08, fr, s * 0.42, 0.4, 0, wf); L.box(0.9, 0.06, 0.08, fr, 0, 0.8, 0, wf); L.box(0.03, 0.8, 0.04, fr, 0, 0.4, 0, wf);
    L.plane(0.8, 0.75, L.basic(null, 0x141820), 0, 0.4, -0.02, wf);
    const aer = new THREE.Group(); aer.position.set(1.4, 0.9, -3.6); scene.add(aer); L.box(0.03, 1.4, 0.03, litM(null, 0x8a8e98), 0, 0.7, 0, aer); for (const y of [1.1, 1.3]) L.box(0.7, 0.025, 0.025, litM(null, 0x8a8e98), 0, y, 0, aer);
    leafTree(scene, -4.5, -3, 4.2, { blossom: true }); leafTree(scene, 4.8, -4.5, 4.8); bush(scene, 2.4, -0.4, 0.5); flowers3D(scene, -1.8, 0.4, 2.5, 1.5);
    // v3 (MML2 volume): the buried house's roof ridge and chimney poking out of the hill, flat-shaded rocks, a leaning plank fence, a dug patch
    for (const s of [-1, 1]) { const r = L.box(3.0, 0.12, 0.9, mm(MT.roof, 3, 1), -1.5, 0.12, -2.6 + s * 0.33, scene); r.rotation.set(s * 0.55, 0.25, 0); }
    L.box(3.1, 0.12, 0.16, mm(MT.roof, 3, 0.2, 0xc8a090), -1.5, 0.34, -2.6, scene).rotation.y = 0.25; L.box(0.36, 0.7, 0.36, mm(MT.stone, 0.6, 1, 0xe0d8c8), -2.5, 0.3, -2.1, scene); L.box(0.44, 0.08, 0.44, mm(MT.stone, 0.6, 0.2), -2.5, 0.66, -2.1, scene);
    for (const [x, z, r, i] of [[1.6, -1.6, 0.35, 0], [2.0, -1.3, 0.22, 1], [-2.8, 0.2, 0.3, 2], [3.2, 0.6, 0.4, 3], [-0.2, -2.4, 0.25, 4]]) { const o = L.mesh(new THREE.DodecahedronGeometry(r, 0), mm(MT.stone, 1, 1, [0xd0d4c4, 0xb8bca8][i % 2]), x, r * 0.5, z, scene); o.rotation.set(i, i * 2, 0); }
    for (let k = 0; k < 6; k++) { const x = 2.4 + k * 0.6, z = -2.8 + k * 0.1; const p = L.box(0.1, 0.9, 0.1, mm(MT.wood, 0.2, 1), x, 0.42, z, scene); p.rotation.z = (k % 2 ? 0.08 : -0.06); }
    for (const y of [0.35, 0.72]) { const r = L.box(3.2, 0.08, 0.05, mm(MT.wood, 3, 0.2), 3.9, y, -2.55, scene); r.rotation.y = -0.17; }
    const dug = L.mesh(new THREE.CircleGeometry(0.9, 9), new THREE.MeshLambertMaterial({ color: 0x8a7a62, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), -0.5, 0.03, -1.0, scene); dug.rotation.x = -Math.PI / 2;
    scene.add(new THREE.AmbientLight(0xd8e0f0, 0.35));
    return { wf };
  }
  // past sets
  function caveSet(scene) {   // Border Cave, 200,000 years ago: rock walls, a fire, a grass bed on a layer of ash
    L.addSky(scene, { near: 6, far: 30, preset: 'night' });
    L.plane(10, 10, L.basic(L.rep(DIRT, 6, 6), 0.75), 0, 0, 0, scene, 0, -Math.PI / 2);
    for (let i = 0; i < 16; i++) { const a = -0.2 + i / 15 * 3.4, r = 3.2 + (i % 3) * 0.3; const o = L.mesh(new THREE.IcosahedronGeometry(1.1 + (i % 4) * 0.25, 0), litM(L.rep(MT.stone, 1, 1), [0xb0a890, 0x9a927c, 0xc0b8a0][i % 3]), Math.cos(a) * r, 0.6 + (i % 2) * 1.2, -Math.sin(a) * r * 0.8 - 0.4, scene); o.rotation.set(i, i * 2, 0); }
    L.plane(10, 6, L.basic(L.rep(T.stone, 4, 2), 0.35), 0, 3.0, 0, scene, 0, Math.PI / 2);
    for (let i = 0; i < 9; i++) { const st = L.mesh(new THREE.ConeGeometry(0.12 + rnd(i) * 0.12, 0.5 + rnd(i + 4) * 0.6, 5), litM(L.rep(MT.stone, 1, 1), 0xa8a088), -2 + i * 0.5, 2.6, -1.6 - rnd(i + 2) * 1.2, scene); st.rotation.x = Math.PI; }
    for (let i = 0; i < 6; i++) L.box(0.9 + rnd(i) * 0.6, 0.25, 0.7, litM(L.rep(MT.stone, 1, 0.3), 0x9a927c), -2.2 + i * 0.85, 0.12, -2.0 - rnd(i + 7) * 0.4, scene);
    const ash = L.mesh(new THREE.CircleGeometry(0.85, 12), L.basic(null, 0x9a9a98), -0.3, 0.012, -0.9, scene); ash.rotation.x = -Math.PI / 2; ash.scale.y = 0.6;
    const grassT = L.cvs(16, 16, (c) => { c.fillStyle = '#9a8a3a'; c.fillRect(0, 0, 16, 16); for (let i = 0; i < 30; i++) { c.fillStyle = i % 2 ? '#c8b450' : '#7a6a2a'; c.fillRect((i * 5) % 16, (i * 3) % 16, 1, 4); } });
    const bedG = L.box(1.3, 0.12, 0.75, L.basic(L.rep(grassT, 3, 2), 1.0), -0.3, 0.07, -0.9, scene);
    for (let i = 0; i < 14; i++) { const s = L.box(0.02, 0.02, 0.4, L.basic(null, i % 2 ? 0xc8b450 : 0x9a8a3a), -0.85 + i * 0.085, 0.14, -0.9 + Math.sin(i) * 0.25, scene); s.rotation.y = i * 0.7; }
    const fire = new THREE.Group(); fire.position.set(1.1, 0, -0.4); scene.add(fire);
    for (let i = 0; i < 5; i++) { const lg = L.box(0.5, 0.06, 0.06, L.basic(null, 0x4a2a14), 0, 0.04, 0, fire); lg.rotation.y = i * 1.2; }
    const fl = L.mesh(new THREE.ConeGeometry(0.18, 0.5, 6), L.basic(null, 0xffa030), 0, 0.3, 0, fire); const fl2 = L.mesh(new THREE.ConeGeometry(0.1, 0.32, 5), L.basic(null, 0xfff0a0), 0, 0.24, 0.02, fire);
    const pl = new THREE.PointLight(0xffa850, 6, 7); pl.position.set(1.1, 0.7, -0.4); scene.add(pl);
    scene.add(new THREE.AmbientLight(0x8890b0, 0.35));
    return { fire, fl, fl2, bedPos: V3([-0.3, 0.13, -0.9]) };
  }
  function strawBedRoom(scene) {   // medieval peasant house: plank walls, a straw sack on the floor, a family
    tudorRoom(scene);
    const sackT = L.cvs(16, 16, (c) => { c.fillStyle = '#c8a860'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#a88848'; for (let y = 0; y < 16; y += 3) c.fillRect(0, y, 16, 1); c.fillStyle = '#e8c870'; for (let i = 0; i < 10; i++) c.fillRect((i * 7) % 15, (i * 5) % 15, 1, 2); });
    const sack = L.mesh(new THREE.SphereGeometry(1, 8, 4), litM(L.rep(sackT, 2, 2), 0xffffff), 0, 0.12, -0.3, scene); sack.scale.set(0.9, 0.14, 1.0);
    for (let i = 0; i < 18; i++) { const s = L.box(0.015, 0.015, 0.22, L.basic(null, 0xe8c870), Math.cos(i * 2.3) * 0.95, 0.04, -0.3 + Math.sin(i * 1.7) * 1.05, scene); s.rotation.y = i; }
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    return { sackTop: V3([0, 0.26, -0.3]) };
  }
  function innRoom(scene) {   // 1776, a crowded inn: a tiny room "little larger than the bed", one small window
    tudorRoom(scene);
    const bd = bed(scene, { x: 0.0, z: 0.4, quilt: 0x8a3a2a, full: true });
    const sh = new THREE.Shape(); sh.moveTo(-0.3, 0); sh.lineTo(0.3, 0); sh.lineTo(0.3, 0.45); sh.lineTo(-0.3, 0.45); sh.lineTo(-0.3, 0);
    const winG = new THREE.Group(); winG.position.set(1.05, 1.5, -0.72); scene.add(winG);
    L.plane(0.6, 0.5, L.basic(null, 0x1a2a5a), 0, 0, 0.0, winG); L.box(0.66, 0.05, 0.06, litM(null, 0x4a3020), 0, 0.27, 0.02, winG); L.box(0.66, 0.05, 0.06, litM(null, 0x4a3020), 0, -0.27, 0.02, winG);
    const sash = new THREE.Group(); sash.position.set(-0.3, 0, 0.03); winG.add(sash); L.plane(0.6, 0.5, L.basic(T.win, 1, { side: THREE.DoubleSide, transparent: true, opacity: 0.8 }), 0.3, 0, 0, sash);
    return { bd, sash };
  }
  // the MML2 menu kit on the 2D overlay (480x270): chamfered mint panels with a teal border + orange ticks, notched dark bars,
  // pixel titles, green rivets (pieces/mechayuki-banner)
  const MP = { bg: '#6b6fd6', pat: '#5d61c7', mint: '#a8e6a8', mintHi: '#dcfad4', mintLo: '#78bf86', teal: '#1f4a52', bar: '#2e4a55', barHi: '#5c8892', barLo: '#142a30', orange: '#f08a28', red: '#d8303a', redHi: '#ff8a78', redLo: '#6a0c16', purple: '#2a1f55', purpleHi: '#5a4aa0', green: '#4cd060', greenLo: '#14602a', ink: '#141838', gold: '#f6c832' };
  function cham(c, x, y, w, h, k, col) { c.fillStyle = col; for (let r = 0; r < h; r++) { const i = Math.max(0, k - r, k - (h - 1 - r)); c.fillRect(x + i, y + r, w - 2 * i, 1); } }
  function mpanel(c, x, y, w, h, { k = 6, fill = MP.mint, ticks = true } = {}) {
    cham(c, x + 3, y + 3, w, h, k, 'rgba(24,20,90,0.45)'); cham(c, x, y, w, h, k, MP.teal); cham(c, x + 3, y + 3, w - 6, h - 6, k - 2, MP.mintHi); cham(c, x + 4, y + 4, w - 8, h - 8, k - 2, fill);
    if (ticks) { c.fillStyle = MP.orange; for (let t = 0; t < 7; t++) c.fillRect(x + w - k - 10 - t * 5, y + h - 8, 2, 3); }
  }
  function mbar(c, x, y, w, h, { col = MP.bar, hi = MP.barHi, lo = MP.barLo } = {}) { const m = (h - 1) / 2; for (let r = 0; r < h; r++) { const i = Math.round(Math.abs(r - m) * 0.55); c.fillStyle = r === 0 ? hi : r === h - 1 ? lo : col; c.fillRect(x + i, y + r, w - 2 * i, 1); } c.fillStyle = lo; c.fillRect(x + Math.round(m * 0.55) + 3, y + 2, 2, h - 4); c.fillRect(x + w - Math.round(m * 0.55) - 5, y + 2, 2, h - 4); }
  function mdisc(c, cx, cy, r, col) { c.fillStyle = col; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.8) c.fillRect(cx + x, cy + y, 1, 1); }
  function mrivet(c, cx, cy) { mdisc(c, cx, cy, 3, MP.greenLo); mdisc(c, cx, cy, 2, MP.green); }
  function mbolt(c, cx, cy) { mdisc(c, cx, cy, 6, MP.ink); mdisc(c, cx, cy, 5, MP.greenLo); mdisc(c, cx, cy, 4, MP.green); c.fillStyle = MP.greenLo; c.fillRect(cx - 3, cy - 1, 7, 2); }
  function mtitle(c, s, x, y, sc = 3) { const w = bitText(c, s, x, y, sc, '#ffffff', { outline: MP.ink })[2]; mbolt(c, Math.round(x - w / 2) - 12, y); mbolt(c, Math.round(x + w / 2) + 12, y); }
  function mbgPattern(c) { c.fillStyle = MP.bg; c.fillRect(0, 0, LW, LH); c.fillStyle = MP.pat; for (let j = -1; j < LH / 22 + 1; j++) for (let i = -1; i < LW / 44 + 1; i++) { const x = i * 44 + (j % 2 ? 22 : 0) + 8, y = j * 22 + 10; mdisc(c, x, y, 5, MP.pat); c.fillStyle = MP.bg; c.fillRect(x - 1, y - 1, 3, 3); c.fillStyle = MP.pat; } }
  const ITEMS = [['MATTRESS', 'SPRINGS + FOAM. FOR SLEEPING.'], ['PILLOW', 'A SOFT BAG FOR THE HEAD.'], ['BLANKET', 'FOUR HUMANS AND A DOG.'], ['LAMP', 'PRESS: NIGHT IS GONE.'], ['PAJAMAS', 'CLOTHES WITH LITTLE MOONS.'], ['NIGHTSTAND', 'A SMALL TABLE. SUSPICIOUS.'], ['EARPLUGS', 'BLOCK OUT OTHER HUMANS.'], ['PHONE', 'ALARM 6:30. SNOOZED x8.']];
  const ITEM_OBJ = [mattressObj, () => pillowObj(), blanketObj, lampObj, pajamasObj, nightstandObj, earplugsObj, () => { const p = phone(); p.scale.setScalar(2); return p; }];
  // ITEM GET: lavender pattern, the 3D item spinning in the left slot, panels with name, number and description, slots row
  // ITEM GET (v2: the full banner kit). 3D item spinning in a hole in the left slot; red name bar, type bar, typed description
  // in the riveted purple box, the 8 artifact slots with real 3D icons, Z coin value, the COMFORT energy capsule, footer bar
  const ICON_R = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true }); ICON_R.setPixelRatio(1); ICON_R.outputColorSpace = THREE.SRGBColorSpace;
  const ICONS = [];
  function iconOf(i, w = 30, h = 30) {
    const key = `${i}_${w}`; if (ICONS[key]) return ICONS[key];
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8888aa, 2.6)); const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(-2, 3, 4); sc.add(dl);
    const o = ITEM_OBJ[i](); const piv = new THREE.Group(); piv.add(o); sc.add(piv); piv.rotation.set(0.45, 0.7, 0); piv.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(piv), ce = bb.getCenter(V3([0, 0, 0])), r = bb.getSize(V3([0, 0, 0])).length() / 2 * 0.9;
    const cam = new THREE.OrthographicCamera(-r, r, r * h / w, -r * h / w, 0.01, 50); cam.position.set(ce.x, ce.y, ce.z + 6); cam.lookAt(ce); cam.updateMatrixWorld();
    ICON_R.setSize(w, h, false); ICON_R.setClearColor(0x000000, 0); ICON_R.render(sc, cam);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(ICON_R.domElement, 0, 0); return (ICONS[key] = cv);
  }
  const ITEM_INFO = [['MATTRESS', 'SLEEP GEAR', ['A RECTANGLE OF SPRINGS', 'AND FOAM. FOR SLEEPING.'], 900], ['PILLOW', 'SLEEP GEAR', ['A SOFT BAG FOR THE HEAD.', 'FLIP IT: COLD SIDE.'], 120],
    ['BLANKET', 'SLEEP GEAR', ['HAIRS FROM 4 HUMANS', 'AND 1 DOG.'], 150], ['LAMP', 'LIGHT', ['PRESS THE BUTTON:', 'THE NIGHT IS GONE.'], 200], ['PAJAMAS', 'CLOTHING', ['SOFT CLOTHES WITH', 'LITTLE MOONS. x27'], 80],
    ['NIGHTSTAND', 'FURNITURE', ['A SMALL TABLE.', 'SUSPICIOUS.'], 300], ['EARPLUGS', 'ACCESSORY', ['BLOCK OUT OTHER HUMANS.', 'USED A LOT.'], 10], ['PHONE', 'DEVICE', ['ALARM 6:30.', 'SNOOZED x8.'], 600]];
  function itemShot(idx) {
    return { at: [[7, 'First'], [12, 'Second'], [16, 'Third'], [24, 'Fourth'], [32, 'Fifth'], [34, 'Sixth'], [37, 'Seventh'], [40, 'Eighth']][idx], mode: 'C', make(t0, t1) {
      const scene = new THREE.Scene(); scene.background = new THREE.Color(MKP.slot); scene.add(new THREE.HemisphereLight(0xffffff, 0x8888aa, 2.4)); const dl = new THREE.DirectionalLight(0xffffff, 1.3); dl.position.set(-2, 3, 4); scene.add(dl);
      const obj = ITEM_OBJ[idx](); const piv = new THREE.Group(); piv.add(obj); scene.add(piv); piv.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(piv), sz = bb.getSize(V3([0, 0, 0])), k = 1.0 / sz.length(), ce = bb.getCenter(V3([0, 0, 0]));
      obj.position.sub(ce); piv.scale.setScalar(k);
      const cam = camera({ p: [[0, 0, 3.2]], l: [[0, 0, 0]], fov: [40] }); cue(t0, 'menu_item_get'); cue(t0 + 0.5, 'menu_cursor');
      const [name, type, lines, val] = ITEM_INFO[idx];
      // centred by the real bounding box every frame: project every vertex of the rotated object, centre that screen rect on the hole (98,102)
      const HX = 98, HY = 102, bx = new THREE.Box3(), cn = V3([0, 0, 0]);
      const centre = () => { piv.updateMatrixWorld(true); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        obj.traverse((m) => { if (!m.isMesh || !m.visible) return; const pa = m.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { cn.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld).project(cam); x0 = Math.min(x0, cn.x); x1 = Math.max(x1, cn.x); y0 = Math.min(y0, cn.y); y1 = Math.max(y1, cn.y); } });
        return [((x0 + x1) / 2 + 1) / 2 * LW, (1 - (y0 + y1) / 2) / 2 * LH]; };
      const halfH = 3.2 * Math.tan(20 * Math.PI / 180), pxW = halfH * 2 / LH;
      piv.position.set((HX / LW * 2 - 1) * halfH * LW / LH, (1 - HY / LH * 2) * halfH, 0); cam.go(t0, t0, t1); cam.updateMatrixWorld(true);
      // size: the largest projected box over a full turn fills 84% of the 148x116 hole
      let ex = 0, ey = 0; for (let a = 0; a < 24; a++) { piv.rotation.set(0.35, a / 24 * Math.PI * 2, 0); piv.updateMatrixWorld(true); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        obj.traverse((m) => { if (!m.isMesh || !m.visible) return; const pa = m.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { cn.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld).project(cam); x0 = Math.min(x0, cn.x); x1 = Math.max(x1, cn.x); y0 = Math.min(y0, cn.y); y1 = Math.max(y1, cn.y); } });
        ex = Math.max(ex, (x1 - x0) / 2 * LW); ey = Math.max(ey, (y1 - y0) / 2 * LH); }
      piv.scale.setScalar(k * Math.min(148 * 0.84 / ex, 116 * 0.84 / ey));
      return { scene, camera: cam, update(lt, t) { piv.rotation.set(0.35, q15(t) * 1.2, 0); cam.go(t, t0, t1); cam.updateMatrixWorld(true);
        for (let it = 0; it < 2; it++) { const [sx, sy] = centre(); piv.position.x += (HX - sx) * pxW; piv.position.y -= (HY - sy) * pxW; } },
        overlay(lt, dt, a, o) { const K = menuKit(o.tctx), c = o.tctx, t = t0 + lt, s = Math.min(1, (t - t0) / 0.25);
          K.background(LW, LH); K.title('ITEM GET', CX, 15, 2);
          K.panel(10, 30, 176, 172, { k: 8, ticks: 'left' }); K.slot(20, 40, 156, 124, { hole: true });
          K.bar(20, 170, 156, 15); K.bold(`NO.${String(idx + 1).padStart(2, '0')}`, 98, 178, 1, '#ffffff', { outline: K.P.barLo });
          K.panel(194, 30, 236, 172, { k: 8, ticks: 'bottom' });
          K.redBar(204, 40, 216, 17); K.bold(name, 312, 49, 1, '#ffffff', { outline: K.P.redLo });
          K.bar(204, 61, 216, 14); K.text('TYPE', 230, 68, 1, '#9cf09c', { outline: K.P.barLo }); K.text(type, 340, 68, 1, '#ffffff', { outline: K.P.barLo });
          K.descBox(204, 80, 216, 40); const n = Math.floor(Math.max(0, t - t0 - 0.3) * 40); let left = n;
          lines.forEach((ln, i) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length; if (part) K.text(part, 312, 93 + i * 13, 1, '#f4f0ff'); });
          for (let i = 0; i < 8; i++) { const x = 206 + (i % 4) * 34, y = 126 + Math.floor(i / 4) * 34; K.slot(x, y, 30, 30, { k: 3, sel: i === idx, fill: i <= idx ? '#3a6a74' : K.P.slot }); if (i <= idx) c.drawImage(iconOf(i, 24, 24), x + 3, y + 3); }
          K.zcoin(358, 140); K.bold(String(val), 396, 141, 1, '#ffe060', { outline: K.P.barLo }); K.zcoin(358, 168); K.bold(`${idx + 1}/8`, 396, 169, 1, '#ffffff', { outline: K.P.barLo });
          K.panel(438, 30, 34, 172, { k: 6, ticks: 'none' }); K.capsule(447, 42, 16, 130, (idx + 1) / 8); K.text('ZZZ', 455, 186, 1, K.P.teal);
          K.descBox(10, 250, 460, 17); K.text('BEDROOM  B1  -  ARTIFACT GET', CX, 259, 1, '#f4f0ff');
          if (s < 1) { c.fillStyle = `rgba(255,255,255,${0.6 * (1 - s)})`; c.fillRect(0, 0, LW, LH); } } };
    } };
  }
  // the Human Body Manual page: blue lab void + a cream page with a pixel diagram drawn per page, she presents at the side
  function manualPage(o, page, title) { const c = o.tctx; cham(c, 150, 18, 312, 236, 6, '#141008'); cham(c, 152, 20, 308, 232, 5, '#efe4c8');
    c.fillStyle = '#c8b890'; for (let y = 44; y < 250; y += 12) c.fillRect(160, y, 292, 1);
    c.fillStyle = '#2a5aa8'; c.fillRect(152, 20, 308, 18); bitText(c, `HUMAN BODY MANUAL  P.${page}`, 306, 29, 1, '#ffffff', { outline: null }); bitText(c, title, 306, 48, 1, '#2a1a0a', { outline: null }); }
  function drawBrain(c, x, y, s = 1) { const R = (xx, yy, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + xx * s), Math.round(y + yy * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
    for (let yy = -30; yy <= 30; yy++) for (let xx = -45; xx <= 45; xx++) { const d = (xx * xx) / (45 * 45) + (yy * yy) / (30 * 30); if (d <= 1 && yy < 22) R(xx, yy, 1, 1, d > 0.86 ? '#7a2a3a' : ((xx * 3 + yy * 5) % 11 === 0 ? '#c86a7a' : '#f0a0aa')); }
    for (let i = 0; i < 6; i++) R(-35 + i * 13, -18 + (i % 2) * 8, 9, 1, '#c86a7a'); R(20, 18, 10, 18, '#e89098'); }
  function heroAside(scene, { p = [-1.25, -0.6, 0.3], ry = 0.5 } = {}) { const ch = hero(scene, { p, ry }); return ch; }

  // ===================================== SHOTS =====================================
  // 1. hook: the hill, she sweeps the metal detector, it beeps faster over the window frame poking out of the grass
  S.push({ at: [1, 'Operator'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const hs = hillSet(scene); const ch = hero(scene, { p: [0.9, 0, 0.6], ry: -2.2 }); const det = detector(scene);
    const tS = ws(1, 'soft'); const beeps = []; for (let b = t0 + 0.2, k = 0; b < tS && k < 40; k++) { beeps.push(b); b += Math.max(0.1, 0.5 * (1 - (b - t0) / (tS - t0 + 0.3))); } beeps.forEach((b) => cue(b, 'detector_beep'));
    const fx = new FX(LW, LH).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0, 0.42, 0], t0: tS, dur: 9, scale: 0.9 }).add('sparkle', { world: [-0.6, 0.4, -1.15], t0: tS, dur: 9, n: 4, radius: 16 });
    const cam = camera({ p: [[-1.6, 0.85, 1.6], [-1.4, 0.82, 1.4]], l: [[0.5, 1.0, 0.0]], fov: [46] }); const fp = new THREE.Vector3();
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); ch.drive(t, [seg('detector_walk', -99, { loop: true, speed: 0.6 })], [[-99, 'happy', 'smileOpen'], [tS, 'surprised', 'gasp']]); scene.updateMatrixWorld(true); ch.fist('R', fp);
      det.userData.place(fp, V3([-0.8, 0, -0.6]).normalize(), Math.sin(q * 5) * 0.12, beeps.some((b) => q >= b && q < b + 0.07)); cam.go(t, t0, t1); } };
  } });
  // 2. "Humans spent one third…": inside, the buried bedroom revealed (wide), title card
  S.push({ at: [2, 'Humans'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.0, 0, 1.0], ry: 0.6 });
    const tB = ws(3, 'bedroom'); cue(tB, 'sting');
    const cam = camera({ p: [[2.6, 1.8, 3.4], [2.2, 1.7, 3.0]], l: [[-0.3, 0.8, -1.0]], fov: [50] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'open', 'smile']]); D.ll.userData.tick(t); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tB) { const c = o.tctx; plateText(o, 'EXPEDITION 01', CX, 40, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tB) }); plateText(o, 'THE BEDROOM', CX, 64, { size: 14, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tB + 0.2) }); } } };
  } });
  // 4. "Posters on the walls…": slow pan across the mess
  S.push({ at: [5, 'Posters'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); dungeon(scene); const cam = camera({ p: [[1.6, 1.3, 0.6], [-0.6, 1.3, 0.8]], l: [[1.2, 1.4, -2.0], [-0.6, 0.6, -1.6]], fov: [46] });
    return { scene, camera: cam, update(lt, t) { cam.go(t, t0, t1); } };
  } });
  // 5. "Eight human artifacts…": scan boxes on every artifact
  S.push({ at: [6, 'Eight'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.4, 0, 1.2], ry: -2.4 }); cue(t0 + 0.2, 'scan');
    const pts = [[0.3, 0.55, -0.4], [0.3, 0.6, -1.5], [0.3, 0.75, -0.2], [-0.85, 0.75, -1.6], [2.2, 0.6, 0.7], [-0.75, 0.3, -1.55], [-0.68, 0.6, -1.42], [-0.62, 0.6, -1.48]];
    const cam = camera({ p: [[2.4, 1.7, 2.6]], l: [[-0.2, 0.6, -0.9]], fov: [50] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('point', t0 - 0.2)], [[-99, 'happy', 'smileOpen']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; pts.forEach((w, i) => { if (t < t0 + 0.3 + i * 0.22) return; const p = L.toScreen(cam, ...w); hudBox(o, p[0] - 12, p[1] - 10, p[0] + 12, p[1] + 10, '#7cf0ff'); bitText(o.tctx, String(i + 1), p[0], p[1] - 16, 1, '#c8f8ff'); });
        if (t >= t0 + 2.2) plateText(o, '8 ARTIFACTS', CX, 34, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0 + 2.2) }); } };
  } });
  // 6-13: ITEM GET menus (chapter cards)
  for (let i = 0; i < 8; i++) S.push(itemShot(i));
  // present scan of the mattress: she pokes the springs
  S.push({ at: [7, 'full'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.15, 0, -0.9], ry: -1.3 });
    const cam = camera({ p: [[-0.9, 1.5, 1.6], [-0.8, 1.45, 1.4]], l: [[0.5, 0.6, -0.8]], fov: [46] }); cue(t0 + 0.4, 'spring_boing');
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('think', t0 - 0.2)], [[-99, 'open', 'neutral'], [t0 + 1.5, 'surprised', 'gasp']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const p = L.toScreen(cam, 0.3, 0.55, -0.5); hudBox(o, p[0] - 40, p[1] - 22, p[0] + 40, p[1] + 22, '#7cf0ff'); plateText(o, 'SPRINGS: 312', p[0], p[1] - 34, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); } };
  } });
  // past: Border Cave, 200,000 years ago: she lays grass on a layer of ash next to the fire
  S.push({ at: [9, 'Two'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const C0 = caveSet(scene); const ch = hero(scene, { p: [0.55, 0, -0.35], ry: -1.9 });
    const tA = ws(9, 'ash'), tB = ws(9, 'spray'); cue(t0 + 0.1, 'fire_crackle'); cue(tB, 'sting');
    const fx = new FX(LW, LH).add('heat', { world: [1.1, 0.7, -0.4], t0, dur: 99, lines: 3, rise: 30 }).add('steam', { world: [1.1, 0.6, -0.4], t0, dur: 99, every: 0.3, life: 1.4, rise: 40, color: '#8a8a8a', edge: '#5a5a5a' });
    const cam = camera({ p: [[0.6, 1.2, 1.9], [0.45, 1.15, 1.7]], l: [[-0.1, 0.45, -0.7]], fov: [50] });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); C0.fl.scale.y = 1 + 0.15 * Math.sin(q * 20); C0.fl2.scale.y = 1 + 0.2 * Math.sin(q * 17 + 1); ch.drive(t, [seg('kneel', t0 - 0.3)], [[-99, 'happy', 'smile'], [tB, 'happy', 'smileOpen']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, '200,000 YEARS AGO', CX, 26, { size: 14, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tA) { const p = L.toScreen(cam, -0.3, 0.05, -0.9); popLabel(o, t, tA, 'ASH', 90, 200, 16, p); }
        if (t >= tB) plateText(o, 'GRASS + ASH = BUG SPRAY', CX, 52, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tB) }); } };
  } });
  // past: a medieval straw sack full of guests (fleas, lice, bedbugs); she scratches
  S.push({ at: [10, 'Then'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = strawBedRoom(scene); const ch = hero(scene, { p: [0.9, 0, 0.4], ry: -0.9 });
    const tG = ws(10, 'guests'); cue(tG, 'buzz');
    const fx = new FX(LW, LH).add('flies', { world: [0, 0.4, -0.3], t0: tG, dur: 99, n: 8 }).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tG + 0.5, dur: 9 });
    const cam = camera({ p: [[0.6, 1.5, 2.6], [0.5, 1.45, 2.4]], l: [[0.2, 0.5, -0.3]], fov: [48] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('idle', -99, { loop: true }), seg('shiver', tG + 0.3, { fade: 0.15 })], [[-99, 'open', 'neutral'], [tG, 'disgust', 'disgust']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, 'MIDDLE AGES', CX, 26, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tG) plateText(o, 'FLEAS · LICE · BEDBUGS', CX, 50, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tG) }); } };
  } });
  // past: Mesopotamia stone pillow / Egyptian headrest
  S.push({ at: [13, 'The'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); egyptRoom(scene); const ch = hero(scene, { p: [0.9, 0, 0.0], ry: -0.4 });
    const stone = L.box(0.4, 0.18, 0.22, litM(L.rep(T.stone, 1, 1), 0xb0aaa0), 0, 0, 0, scene);
    const rest = new THREE.Group(); scene.add(rest); rest.position.set(-0.4, 0, -0.3); L.box(0.36, 0.05, 0.14, litM(L.rep(OAK, 1, 1), 0xa87848), 0, 0.025, 0, rest); L.box(0.07, 0.22, 0.07, litM(L.rep(OAK, 1, 1), 0xa87848), 0, 0.14, 0, rest);
    const cr = L.mesh(new THREE.TorusGeometry(0.14, 0.035, 4, 10, Math.PI), litM(L.rep(OAK, 1, 1), 0xa87848), 0, 0.37, 0, rest); cr.rotation.z = Math.PI;
    const tE = ws(13, 'Egypt'); const fp = new THREE.Vector3();
    const cam = camera({ p: [[0.3, 1.4, 2.6], [0.25, 1.35, 2.4]], l: [[0.2, 0.8, -0.2]], fov: [46] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('hold_up_object', t0 - 0.4)], [[-99, 'open', 'smile'], [tE, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); stone.position.copy(fp).add(V3([0, 0.1, 0.05])); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, '7000 BC: STONE PILLOW', CX, 26, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tE) { const p = L.toScreen(cam, -0.4, 0.4, -0.3); popLabel(o, t, tE, 'HEADREST', 100, 190, 16, p); } } };
  } });
  // gag: the medieval painting vs reality (2D parchment: a steep painted bed, then a flat real one)
  S.push({ at: [15, 'And'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); labSet(scene); const ch = heroAside(scene, { p: [-1.3, -0.6, 0.6], ry: 0.6 }); const tP = ws(15, 'paintings');
    const cam = camera({ p: [[0, 1.0, 3.0]], l: [[0, 0.8, 0]], fov: [44] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('shake_head', t0 - 0.2)], [[-99, 'half', 'frown']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = t0 + lt; cham(c, 190, 40, 250, 170, 5, '#141008'); cham(c, 192, 42, 246, 166, 4, '#e8d0a0');
        c.fillStyle = '#7a2a1a'; c.save(); c.translate(250, 140); c.rotate(-0.55); c.fillRect(-40, -8, 80, 16); c.fillStyle = '#f4e8d0'; c.fillRect(-36, -18, 20, 12); c.fillStyle = '#e8b890'; c.fillRect(-34, -30, 12, 12); c.restore();
        bitText(c, 'PAINTING', 250, 190, 1, '#2a1a0a', { outline: null });
        c.fillStyle = '#7a2a1a'; c.fillRect(330, 140, 90, 16); c.fillStyle = '#f4e8d0'; c.fillRect(334, 130, 20, 10); c.fillStyle = '#e8b890'; c.fillRect(336, 128, 12, 10); bitText(c, 'REAL BED', 375, 190, 1, '#2a1a0a', { outline: null });
        if (t >= tP) { c.strokeStyle = '#d83030'; c.lineWidth = 3; c.beginPath(); c.moveTo(210, 90); c.lineTo(290, 180); c.moveTo(290, 90); c.lineTo(210, 180); c.stroke(); plateText(o, 'MYTH', 250, 60, { size: 14, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tP) }); } } };
  } });
  // past: 1776, Adams and Franklin share a tiny bed at an inn; the window opens and closes
  S.push({ at: [18, 'In'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); mmlTown(scene, { preset: 'morning' }); const ch = hero(scene, { p: [-2.2, 0, 0.9], ry: Math.PI - 0.5 });
    const ws3 = [['bank_teller', 'olive', -3.6, -2.4, 0.9], ['bank_teller', 'navy', -4.2, -2.0, 0.6], ['art_student', 'teal', 3.2, -1.2, -1.2], ['homework_girl', 'red', 1.6, 0.4, 2.4]].map(([id, v, x, z, ry]) => { const n = npc(id, id, v); n.position.set(x, 0, z); n.rotation.y = ry; scene.add(n); if (id === 'bank_teller') tricorn(n); return n; });
    cue(t0 + 0.2, 'town_ambience'); const cam = camera({ p: [[1.8, 2.0, 6.4], [1.2, 1.8, 5.6]], l: [[-1.6, 1.6, -3.0], [-2.2, 1.5, -3.2]], fov: [54] });
    return { scene, camera: cam, update(lt, t) { const q = q15(t); ws3.forEach((n, i) => { if (i > 1) { n.walk((q - t0) * 1.2 + i * 0.4); n.position.x += 0; } }); ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'happy', 'smileOpen']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { plateText(o, '1776', CX, 26, { size: 14, border: '#ffd93b', fg: '#fff2a0' }); } };
  } });
  S.push({ at: [18, 'had'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const I0 = innRoom(scene);
    const ad = npc('bank_teller', 'bank_teller', 'navy'); const fr = npc('bank_teller', 'bank_teller', 'olive'); for (const [n, x] of [[ad, -0.22], [fr, 0.22]]) { n.rotation.set(-Math.PI / 2, 0, 0); n.position.set(x, 0.56, 1.17); scene.add(n); hideNpcShadow(n); }
    nightcap(ad); franklinLook(fr);
    const ch = hero(scene, { p: [1.5, 0, 0.6], ry: -0.6 }); const tC = ws(18, 'closed'), tO = ws(18, 'opened'), tS = ws(18, 'asleep'); cue(tC, 'window_close'); cue(tO, 'window_open'); cue(tS, 'snore');
    const cam = camera({ p: [[1.5, 1.9, 2.9], [1.4, 1.85, 2.7]], l: [[0.0, 0.6, 0.0]], fov: [54] });
    const fx = new FX(LW, LH).add('anger', { target: fr, offset: [0, 0.3, 0.4], t0: tC, dur: tO - tC, scale: 0.8 }).add('thought', { target: ad, offset: [0, 0.3, 0.5], t0: tS, dur: 9 });
    return { scene, camera: cam, fx, update(lt, t) { const q = q15(t); I0.sash.rotation.y = q < tC ? -1.2 : q < tO ? 0 : -1.2; ch.drive(t, [seg('idle', -99, { loop: true }), seg('think', tO, { fade: 0.15 })], [[-99, 'open', 'smile'], [tO, 'relaxed', 'smirk']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, '1776', CX, 24, { size: 14, border: '#ffd93b', fg: '#fff2a0' }); const pa = L.toScreen(cam, -0.22, 0.75, -0.4), pf = L.toScreen(cam, 0.22, 0.75, -0.4);
        plateText(o, 'ADAMS', pa[0] - 30, pa[1] - 30, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); plateText(o, 'FRANKLIN', pf[0] + 40, pf[1] - 30, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); } };
  } });
  // Body Manual 1: the brain takes out the trash (fluid washes through, the gaps open by ~60 %)
  S.push({ at: [20, 'Human'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); labSet(scene); const ch = heroAside(scene); const tS = ws(21, 'sixty'); cue(t0, 'page_turn');
    const cam = camera({ p: [[0, 1.0, 3.2]], l: [[0, 0.75, 0]], fov: [44] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('talk_gesture', -99, { loop: true })], [[-99, 'open', 'smile'], [tS, 'sparkle', 'smileOpen']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = t0 + lt; manualPage(o, 1, 'WHY DO HUMANS SHUT DOWN?'); drawBrain(c, 270, 140, 1.3);
        const k = clamp01((t - t0) / 3), q = Math.floor(t * 15); for (let i = 0; i < 9; i++) { const u = ((q * 0.04 + i / 9) % 1); const x = 200 + u * 140, y = 120 + Math.sin(u * 9 + i) * 22; c.fillStyle = '#3c9ce8'; c.fillRect(Math.round(x), Math.round(y), 4, 3); }
        for (let i = 0; i < 4; i++) { const u = ((q * 0.03 + i / 4) % 1); c.fillStyle = '#5a4a2a'; c.fillRect(Math.round(250 + u * 170), 150 + i * 6, 5, 4); }
        bitText(c, 'WASTE OUT', 420, 160, 1, '#2a1a0a', { outline: null }); c.fillStyle = '#2a1a0a'; c.fillRect(400, 168, 20, 2);
        if (t >= tS) plateText(o, 'GAPS +60% (MICE)', 306, 196, { size: 12, border: '#3c9ce8', fg: '#d0e8ff', scale: popS(t, tS) }); } };
  } });
  // past: candles of animal fat and a rushlight in the stone cell (dark, smoke)
  S.push({ at: [25, 'Before'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const C0 = cellSet(scene); const ca = candleAlarm(scene, C0.table.clone().add(V3([0.15, 0, 0.05]))); ca.userData.set(0.2, 0);
    const ch = hero(scene, { p: [1.2, 0, -0.3], ry: -1.3 }); const tR = ws(25, 'rushlight'); cue(t0 + 0.1, 'candle_fizz');
    const fx = new FX(LW, LH).add('steam', { world: [0.7, 1.3, -0.7], t0, dur: 99, every: 0.25, life: 1.2, rise: 30, color: '#6a6a6a', edge: '#3a3a3a' }).add('stink', { world: [0.75, 1.2, -0.7], t0: t0 + 0.6, dur: 99 });
    const cam = camera({ p: [[0.9, 1.4, 1.6], [0.85, 1.38, 1.45]], l: [[0.7, 1.0, -0.7]], fov: [46] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('pinch_nose', t0 - 0.2)], [[-99, 'disgust', 'disgust']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, 'ANIMAL FAT CANDLE', CX, 26, { size: 12, border: '#ff9a5a', fg: '#ffe0c8' }); if (t >= tR) plateText(o, 'RUSHLIGHT: 20 MIN', CX, 50, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tR) }); } };
  } });
  // past: first sleep / second sleep: midnight, she wakes up in bed, a candle, the moon; clock 00:00
  S.push({ at: [26, 'People'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true }); nightGrade(scene);
    const ch = hero(scene); inBed(ch, bd); const tF = ws(26, 'first'), tS = ws(26, 'second'); cue(tF, 'label'); cue(tS, 'label');
    const cam = camera({ p: [[-1.1, 1.6, 0.8], [-1.05, 1.55, 0.7]], l: [[0.2, 0.9, -1.0]], fov: [56] });
    return { scene, camera: cam, update(lt, t) { const q = q15(t), tw = ws(26, 'woke'); ch.drive(t, q < tw ? [seg('sleep_lie', -99, { loop: true })] : [seg('wake_sit_up', tw)], [[-99, 'blink', 'cat'], [tw, 'half', 'neutral']], false); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; sunInWindow(o, cam, R0.win, 0.8, lt, 'moon'); if (t >= tF) plateText(o, 'FIRST SLEEP', 120, 40, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tF) }); if (t >= tS) plateText(o, 'SECOND SLEEP', 360, 40, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tS) });
        plateText(o, '00:00', CX, 80, { size: 14, border: '#ffd93b', fg: '#fff2a0' }); } };
  } });
  // Body Manual 2: the sleep cycle graph (90 min) + REM eyes
  S.push({ at: [28, 'Human'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); labSet(scene); const ch = heroAside(scene); const tR = ws(29, 'R-E-M'); cue(t0, 'page_turn');
    const cam = camera({ p: [[0, 1.0, 3.2]], l: [[0, 0.75, 0]], fov: [44] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('talk_gesture', -99, { loop: true })], [[-99, 'open', 'smile']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = t0 + lt; manualPage(o, 2, 'WHAT HAPPENS INSIDE?'); const st = [0, 2, 3, 2, 1, 4, 2, 3, 1, 4, 2, 1, 4, 1, 4];   // 4 = REM
        c.fillStyle = '#2a1a0a'; c.fillRect(172, 90, 1, 100); c.fillRect(172, 190, 270, 1); for (let i = 0; i < st.length; i++) { const y = 100 + (st[i] === 4 ? 0 : st[i] * 25) + (st[i] === 4 ? 0 : 10), x = 175 + i * 18; c.fillStyle = st[i] === 4 ? '#d83030' : '#2a5aa8'; c.fillRect(x, y, 18, 3); }
        bitText(c, 'REM', 160, 101, 1, '#d83030', { outline: null }); bitText(c, '90 MIN', 220, 200, 1, '#2a1a0a', { outline: null });
        if (t >= tR) { const e = Math.floor(t * 8) % 2; for (const ex of [270, 330]) { c.fillStyle = '#f4f0e4'; c.fillRect(ex - 14, 214, 28, 14); c.fillStyle = '#1a1a1a'; c.fillRect(ex - 6 + (e ? 6 : -6), 217, 8, 8); } plateText(o, 'RAPID EYE MOVEMENT', 306, 246, { size: 12, border: '#d83030', fg: '#ffd0d0', scale: popS(t, tR) }); } } };
  } });
  // back in the dungeon: the collapsed wardrobe, a drawer full of moon pajamas
  S.push({ at: [31, 'Back'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.7, 0, 1.3], ry: 2.6 }); const pj = pajamasObj(); pj.position.set(2.0, 0.35, 1.05); scene.add(pj); cue(t0 + 0.3, 'dig');
    const fx = new FX(LW, LH).add('dust', { world: [2.1, 0.3, 0.9], t0, dur: 2.0, every: 0.5, n: 6, color: '#a88858', edge: '#5a3a1c' });
    const cam = camera({ p: [[0.4, 1.5, 2.6], [0.5, 1.4, 2.3]], l: [[1.9, 0.5, 0.7]], fov: [48] });
    return { scene, camera: cam, fx, update(lt, t) { ch.drive(t, [seg('dig_hands', -99, { loop: true })], [[-99, 'open', 'neutral'], [t0 + 2.5, 'happy', 'smileOpen']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= t0 + 2.5) plateText(o, 'x27 (ALL WITH MOONS)', CX, 30, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0 + 2.5) }); } };
  } });
  // pajamas: the word card PAY + JAMA
  S.push({ at: [33, 'The'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); labSet(scene); const ch = heroAside(scene, { p: [-1.3, -0.6, 0.6], ry: 0.6 }); const tL = ws(33, 'leg', 2);
    const cam = camera({ p: [[0, 1.0, 3.0]], l: [[0, 0.8, 0]], fov: [44] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('present', t0 - 0.2)], [[-99, 'happy', 'smileOpen']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, 'PAY', 250, 90, { size: 14, border: '#ffd93b', fg: '#fff2a0' }); plateText(o, '+', 300, 90, { size: 14, border: '#ffd93b', fg: '#fff2a0' }); plateText(o, 'JAMA', 360, 90, { size: 14, border: '#ffd93b', fg: '#fff2a0' });
        plateText(o, 'LEG', 250, 120, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); plateText(o, 'CLOTHES', 360, 120, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tL) plateText(o, 'PERSIAN > INDIA > UK 1800S', 306, 170, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tL) }); } };
  } });
  // nightstand: the chamber pot hidden in a cabinet ("commode")
  S.push({ at: [35, 'But'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); tudorRoom(scene); const cab = new THREE.Group(); cab.position.set(0.2, 0, -0.35); scene.add(cab);
    const w = litM(L.rep(OAK, 0.6, 0.6), 0x9a6a3a); L.box(0.6, 0.6, 0.5, w, 0, 0.3, 0, cab); L.box(0.62, 0.04, 0.52, litM(null, 0x6a4020), 0, 0.62, 0, cab);
    const door = new THREE.Group(); door.position.set(-0.28, 0.3, 0.26); cab.add(door); L.box(0.56, 0.5, 0.03, litM(null, 0x7a4a24), 0.28, 0, 0, door);
    const pot = chamberPot({ lid: true }); pot.position.set(0, 0.06, 0); cab.add(pot);
    const ch = hero(scene, { p: [1.1, 0, 0.5], ry: -0.9 }); const tC = ws(35, 'commode'); cue(t0 + 0.4, 'door_creak'); cue(tC, 'label');
    const cam = camera({ p: [[0.15, 1.1, 1.5], [0.15, 1.05, 1.35]], l: [[0.4, 0.45, -0.3]], fov: [48] });
    const fx = new FX(LW, LH).add('stink', { world: [0.2, 0.5, -0.1], t0: t0 + 0.6, dur: 99 }).add('flies', { world: [0.2, 0.55, -0.1], t0: t0 + 0.6, dur: 99, n: 3 });
    return { scene, camera: cam, fx, update(lt, t) { door.rotation.y = -1.6 * smooth((q15(t) - t0 - 0.3) / 0.5); ch.drive(t, [seg('step_back', t0 + 0.45), seg('pinch_nose', t0 + 1.6, { fade: 0.2 })], [[-99, 'open', 'neutral'], [t0 + 0.6, 'disgust', 'disgust']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; if (t >= tC) { const p = L.toScreen(cam, 0.2, 0.6, -0.35); popLabel(o, t, tC, 'COMMODE', CX, 40, 16, p); } } };
  } });
  // earplugs: the Odyssey on a parchment panel (ship, sirens, beeswax)
  S.push({ at: [38, 'The'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); labSet(scene); const ch = heroAside(scene, { p: [-1.3, -0.6, 0.6], ry: 0.6 }); const tW = ws(38, 'beeswax'), tY = ws(38, '1907');
    const cam = camera({ p: [[0, 1.0, 3.0]], l: [[0, 0.8, 0]], fov: [44] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('talk_gesture', -99, { loop: true })], [[-99, 'open', 'smile']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = t0 + lt, q = Math.floor(t * 4) % 2; cham(c, 170, 30, 290, 190, 5, '#141008'); cham(c, 172, 32, 286, 186, 4, '#e8d0a0');
        c.fillStyle = '#4a8ad0'; c.fillRect(176, 150, 278, 60); c.fillStyle = '#6aa8e8'; for (let x = 180; x < 450; x += 14) c.fillRect(x + (q ? 4 : 0), 150, 8, 2);
        c.fillStyle = '#7a4a24'; c.fillRect(240, 136, 90, 16); c.fillRect(250, 128, 70, 8); c.fillStyle = '#5a3a1c'; c.fillRect(283, 70, 4, 60); c.fillStyle = '#f4ecd0'; c.fillRect(287, 76, 30, 40);
        for (const x of [380, 420]) { c.fillStyle = '#7a6a5a'; c.fillRect(x - 12, 140, 24, 12); c.fillStyle = '#e8b890'; c.fillRect(x - 4, 118, 8, 10); c.fillStyle = '#c84a8a'; c.fillRect(x - 6, 128, 12, 14); bitText(c, q ? '~' : '-', x + 10, 110, 1, '#c84a8a', { outline: null }); }
        bitText(c, 'ODYSSEY', 214, 44, 1, '#2a1a0a', { outline: null }); if (t >= tW) plateText(o, 'BEESWAX', 270, 108, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tW) }); if (t >= tY) plateText(o, '1907: WAX EARPLUGS', 316, 20, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tY) }); } };
  } });
  // alarm callback: the knocker-upper with peas (street at night)
  S.push({ at: [42, 'Operators'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: true }); const ks = { tgt: V3([-5.85, 3.41, -3.4]) }; const ku = npc('bank_teller', 'bank_teller', 'grey'); flatCap(ku); ku.position.set(-5.45, 0, -1.55); ku.rotation.y = Math.PI + 0.19; scene.add(ku); const pole = bamboo(); scene.add(pole);
    const ch = hero(scene, { p: [-3.9, 0, -0.9], ry: -2.0 }); nightGrade(scene, [ch, ku]); const tS = ws(42, 'snooze'); cue(t0 + 0.2, 'tap_glass');
    const cam = camera({ p: [[-2.5, 1.5, 2.4], [-2.6, 1.5, 2.2]], l: [[-5.0, 2.2, -2.4]], fov: [50] });
    return { scene, camera: cam, update(lt, t) { const q = q15(t), tap = Math.floor(q * 3.3) % 2; ku.walk(0, 0); npcSet(ku, 'Bone004', -2.2 - (tap ? 0.08 : 0)); const h = npcHand(ku, 'R');
      const tg = ks.tgt.clone().add(V3([0, tap ? 0 : 0.06, tap ? 0 : 0.12])), d = tg.clone().sub(h).normalize(); placeRod(pole, h.clone().addScaledVector(d, -0.35), tg); ch.drive(t, [seg('idle', -99, { loop: true })], [[-99, 'open', 'smile']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const t = t0 + lt; plateText(o, 'SEE: DIGGER 04', CX, 26, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tS) plateText(o, '1956: SNOOZE', CX, 50, { size: 12, border: '#fe2c55', fg: '#ffd0dc', scale: popS(t, tS) }); } };
  } });
  // Body Manual 3: 11 days awake (calendar counter) + the dolphin with one eye open
  S.push({ at: [43, 'Human'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); labSet(scene); const ch = heroAside(scene); const tD = ws(45, 'Dolphins'); cue(t0, 'page_turn');
    const cam = camera({ p: [[0, 1.0, 3.2]], l: [[0, 0.75, 0]], fov: [44] });
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('talk_gesture', -99, { loop: true })], [[-99, 'open', 'neutral']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = t0 + lt; manualPage(o, 3, 'NO SLEEP AT ALL?'); const day = Math.min(11, 1 + Math.floor((t - t0) / Math.max(0.5, (tD - t0) / 11)));
        cham(c, 180, 70, 90, 80, 3, '#2a1a0a'); cham(c, 182, 72, 86, 76, 2, '#f4ecd8'); c.fillStyle = '#d83030'; c.fillRect(182, 72, 86, 14); bitText(c, 'DAY', 225, 79, 1, '#ffffff', { outline: null }); bitText(c, String(day), 225, 116, 3, '#2a1a0a', { outline: null });
        bitText(c, day >= 3 ? 'MOODY' : '', 330, 90, 1, '#7a2a1a', { outline: null }); bitText(c, day >= 5 ? 'SEEING THINGS' : '', 350, 110, 1, '#7a2a1a', { outline: null }); bitText(c, 'RANDY, 17 (1964)', 225, 162, 1, '#2a1a0a', { outline: null });
        if (t >= tD) { c.fillStyle = '#5a7aa8'; c.fillRect(300, 190, 80, 18); c.fillRect(372, 184, 20, 10); c.fillRect(296, 196, 8, 6); c.fillStyle = '#ffffff'; c.fillRect(312, 194, 4, 4); c.fillStyle = '#1a1a1a'; c.fillRect(313, 195, 2, 2); bitText(c, 'HALF BRAIN ASLEEP', 340, 222, 1, '#2a1a0a', { outline: null }); } } };
  } });
  // closing: the inventory, all 8 slots filled
  S.push({ at: [46, 'Let'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#3a8aa0'); scene.add(new THREE.HemisphereLight(0xffffff, 0x8888aa, 2.4));
    const ch = hero(scene, { p: [1.86, -0.55, 0], ry: -0.35 }); cue(t0, 'menu_open'); ITEM_INFO.forEach((it, k) => cue(t0 + 0.3 + k * 0.33, 'menu_cursor'));
    const cam = camera({ p: [[0, 0.3, 3.4]], l: [[0, 0.1, 0]], fov: [44] });
    // portrait: centre her face/torso in the hole (406,116) by the real Head/Chest/Pelvis bones, measured once on the first frame
    const bn = {}; ch.root.traverse((o) => { if (o.isBone && !bn[o.name]) bn[o.name] = o; }); let placed = false;
    const scr = (b) => { const v = b.getWorldPosition(V3([0, 0, 0])).project(cam); return [(v.x + 1) / 2 * LW, (1 - v.y) / 2 * LH]; };
    return { scene, camera: cam, update(lt, t) { ch.drive(t, [seg('hands_on_hips', t0 - 0.3)], [[-99, 'happy', 'smileOpen'], [t0 + 2.6, 'smirk', 'smirk']]); cam.go(t, t0, t1);
      if (!placed) { placed = true; const pxW = 3.4 * Math.tan(22 * Math.PI / 180) * 2 / LH;
        for (let it = 0; it < 3; it++) { cam.updateMatrixWorld(true); ch.root.updateMatrixWorld(true); const h = scr(bn.Head), c2 = scr(bn.Chest), pe = scr(bn.Pelvis);
          ch.root.position.x += (406 - (h[0] + c2[0]) / 2) * pxW; ch.root.position.y -= (116 - (h[1] + pe[1]) / 2) * pxW; } ch.drive(t, [seg('hands_on_hips', t0 - 0.3)], [[-99, 'happy', 'smileOpen']]); } },
      overlay(lt, dt, a, o) { const K = menuKit(o.tctx), c = o.tctx, t = t0 + lt, sel = Math.min(7, Math.floor(Math.max(0, t - t0 - 0.3) / 0.33));
        K.background(LW, LH); K.title('INVENTORY', 186, 15, 2);
        K.panel(8, 30, 86, 172, { k: 7, ticks: 'bottom' });
        ['ITEMS', 'BODY', 'MAP', 'OPTION', 'BACK'].forEach((s2, i) => { const y = 40 + i * 28; if (i === 0) K.redBar(14, y, 74, 18); else K.bar(14, y, 74, 18); K.bold(s2, 52, y + 9, 1, '#ffffff', { outline: i === 0 ? K.P.redLo : K.P.barLo }); });
        c.fillStyle = K.P.ink; for (let i = 0; i < 6; i++) c.fillRect(6 + i - 1, 44 + i - 1, 3, 13 - 2 * i + 2); c.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) c.fillRect(6 + i, 45 + i, 1, 11 - 2 * i);
        K.panel(100, 30, 250, 172, { k: 8, ticks: 'left' });
        ITEM_INFO.forEach(([n], i) => { const x = 112 + (i % 4) * 58, y = 40 + Math.floor(i / 4) * 64; K.slot(x, y, 50, 46, { k: 4, sel: i === sel, fill: '#3a6a74' }); c.drawImage(iconOf(i, 40, 38), x + 5, y + 4); K.text(n.length > 8 ? n.slice(0, 8) : n, x + 25, y + 54, 1, K.P.teal); });
        K.bar(110, 172, 230, 18); K.zcoin(128, 181); K.bold('2360', 168, 182, 1, '#ffe060', { outline: K.P.barLo }); K.text('8/8 ARTIFACTS', 270, 182, 1, '#9cf09c', { outline: K.P.barLo });
        K.panel(358, 30, 114, 172, { k: 8, ticks: 'left' }); K.slot(366, 38, 80, 156, { hole: true, k: 3 }); K.capsule(452, 40, 13, 150, 0.85);
        K.descBox(10, 250, 460, 17); const it = ITEM_INFO[sel]; K.text(`${it[0]}: ${it[2].join(' ')}`.slice(0, 64), CX, 259, 1, '#f4f0ff'); } };
  } });
  // the boss: the lava lamp under the bed (low angle, glowing), BOSS ??? bar
  S.push({ at: [48, 'But'], mode: 'C', make(t0, t1) {
    const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.7, 0, 0.7], ry: -2.3 }); const tW = ws(48, 'wax'); cue(t0 + 0.2, 'boss_sting');
    const glow = new THREE.PointLight(0xff60c0, 3, 2.5); glow.position.set(0.5, 0.35, -0.85); scene.add(glow);
    const cam = camera({ p: [[1.45, 0.13, -0.85], [1.25, 0.12, -0.88]], l: [[0.5, 0.11, -0.9]], fov: [40] });
    const fx = new FX(LW, LH).add('sparkle', { world: [0.5, 0.4, -0.9], t0: tW, dur: 99, n: 4, radius: 20, color: '#ffb0e0' }).add('question', { obj: ch.root, bone: 'Head', offset: [0.15, 0.42, 0], t0: tW + 1, dur: 99 });
    return { scene, camera: cam, fx, update(lt, t) { D.ll.userData.tick(t); ch.drive(t, [seg('kneel', t0 - 0.3)], [[-99, 'surprised', 'gasp'], [tW, 'sparkle', 'blushGasp']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = t0 + lt; mbar(c, 120, 14, 240, 16, { col: MP.red, hi: MP.redHi, lo: MP.redLo }); bitText(c, 'BOSS: ???', CX, 22, 1, '#ffffff', { outline: MP.redLo });
        c.fillStyle = MP.barLo; c.fillRect(140, 34, 200, 6); c.fillStyle = '#ff60c0'; c.fillRect(141, 35, 198, 4); } };
  } });
  // goodbye: back on the hill at sunset, the comment question, outro
  S.push({ at: [49, 'Operators'], mode: 'M', make(t0, t1) {
    const scene = new THREE.Scene(); hillSet(scene, { preset: 'morning' }); const ch = hero(scene, { p: [0.4, 0, 0.6], ry: 0.2 }); const ll = lavaLamp(); ll.position.set(0.9, 0, 0.7); scene.add(ll);
    const tLo = ws(50, 'Logging'), tEnd = TL.dur, tOut = tEnd + 0.05; cue(tLo, 'blip'); cue(tOut, 'end_jingle');
    const cam = camera({ p: [[0.6, 1.0, 2.7], [1.3, 1.45, 5.8]], l: [[0.5, 1.1, 0.5], [0.3, 1.25, 0.0]], fov: [44] });   // v2: ONE continuous pull-back to the end, low, with the sky
    return { scene, camera: cam, update(lt, t) { ll.userData.tick(t); ch.drive(t, [seg('shrug', t0 - 0.2), seg('wave', tLo - 0.3, { fade: 0.12 })], [[-99, 'open', 'smile'], [tLo, 'wink', 'blushSmile']]); cam.go(t, t0, t1); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = t0 + lt; if (t < tLo) plateText(o, 'COMMENT: WHAT WAS IT FOR?', CX, 34, { size: 14, border: '#ffd93b', fg: '#fff2a0' });
        if (t >= tOut) { bitText(c, CHANNEL, CX, 60, Math.max(1, Math.round(3 * popS(t, tOut))), '#fdd941'); if (t >= tOut + 0.3) plateText(o, 'EXPEDITION 01: THE BEDROOM', CX, 90, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' });
          if (t >= tOut + 0.5) { const w = 200, h = 22, X = CX - w / 2, Y = 230; c.fillStyle = '#040412'; c.fillRect(X - 2, Y - 2, w + 4, h + 4); c.fillStyle = '#d83030'; c.fillRect(X, Y, w, h); bitText(c, 'SUBSCRIBE', CX, Y + 11, 2, '#ffffff', { outline: null }); } } } };
  } });

  // ===================================== PRODUCTION v1 (2026-10-31) =====================================
  // props, NPC looks and the extra cuts (~110 shots for ~11 min: a cut every 5-7 s). alt(): another camera angle (or a
  // zoom on the 2D page) of an existing shot, continuing its action in time; SH(): a new shot.
  const SH = (at, mode, f) => S.push({ at, mode, make(t0, t1) { const r = f(t0, t1);
    return { scene: r.scene, camera: r.cam, fx: r.fx, update(lt, t) { if (r.upd) r.upd(t); r.cam.go(t, t0, t1); }, overlay: r.ov ? (lt, dt, a, o) => r.ov(o, t0 + lt, o.tctx) : undefined }; } });
  const CAM = (p, l, fov = 46, more = {}) => camera({ p, l, fov: [fov], ...more });
  const bAt = (p, w, occ = 1) => { const s = S.find((x) => x.at[0] === p && nrm(x.at[1]) === nrm(w) && (x.at[2] || 1) === occ); if (!s) throw new Error(`alt: no shot ${p} ${w}`); return s; };
  function startAt(s) { const idx = wi(s.at[0], s.at[1], s.at[2] || 1), w = W[idx]; if (idx === 0) return 0; if (s.mode === 'C') return Math.max(0, w[1] - 0.02);
    const prevEnd = W[idx - 1][2]; return Math.min(w[1] - 0.06, Math.max(prevEnd + 0.02, (prevEnd + w[1]) / 2)); }
  const PG = document.createElement('canvas'); PG.width = LW; PG.height = LH; const PGC = PG.getContext('2d');
  function alt(E, at, cs, { zoom = null, mode = 'C' } = {}) {
    S.push({ at, mode, make(t0, t1) {
      const n = CUES.length, T0 = startAt(E), b = E.make(T0, t1); CUES.splice(n);   // the original shot already placed its cues
      if (cs) { const c2 = camera(cs), cam = b.camera; cam.go = (t) => { c2.go(t, t0, t1); cam.position.copy(c2.position); cam.quaternion.copy(c2.quaternion); cam.fov = c2.fov; cam.updateProjectionMatrix(); }; }
      const ov = b.overlay; let overlay = ov && ((lt, dt, a, o) => ov(lt + t0 - T0, dt, a, o));
      if (ov && zoom) overlay = (lt, dt, a, o) => { PGC.clearRect(0, 0, LW, LH); ov(lt + t0 - T0, dt, a, { ...o, tctx: PGC }); const c = o.tctx, z = zoom.z, w = LW / z, h = LH / z;
        c.imageSmoothingEnabled = false; c.drawImage(PG, Math.round(zoom.cx - w / 2), Math.round(zoom.cy - h / 2), Math.round(w), Math.round(h), 0, 0, LW, LH); };
      return { ...b, update: (lt, t) => b.update(lt, t), overlay };
    } });
  }
  function hideNpcShadow(n) { n.traverse((o) => { if (o.geometry && o.geometry.type === 'CircleGeometry') o.visible = false; }); return n; }
  function npcAt(scene, id, v, x, z, ry = 0, s = 1) { const n = npc(id, id, v); n.position.set(x, 0, z); n.rotation.y = ry; n.scale.setScalar(s); scene.add(n); return n; }
  // a lib NPC lying on its back (head toward -z), feet at zFeet; tilt > 0 raises the head (propped up on pillows)
  function lieNpc(scene, id, v, x, y, zFeet, { tilt = 0, s = 1, roll = 0 } = {}) { const n = npc(id, id, v); n.rotation.set(-Math.PI / 2 + tilt, 0, roll); n.position.set(x, y, zFeet); n.scale.setScalar(s); scene.add(n); return hideNpcShadow(n); }
  // Franklin's own look: long grey hair to the shoulders from a balding crown + small round spectacles
  function franklinLook(n) { const h = headInfo(n), g = new THREE.Group(), r = Math.max(h.rx, h.rz), grey = L.basic(null, 0xdedcd2), gl = L.basic(null, 0x2a2a30);
    L.box(h.rx * 2.2, r * 1.9, h.rz * 0.55, grey, 0, -r * 1.3, -h.rz * 0.8, g);
    for (const s of [-1, 1]) L.box(h.rx * 0.32, r * 1.5, h.rz * 1.2, grey, s * h.rx * 1.02, -r * 1.2, -h.rz * 0.2, g);
    for (const s of [-1, 1]) { L.box(r * 0.44, r * 0.32, 0.014, gl, s * h.rx * 0.4, -r * 1.0, h.rz * 1.04, g); L.box(r * 0.3, r * 0.2, 0.016, L.basic(null, 0xcfe8f4), s * h.rx * 0.4, -r * 1.0, h.rz * 1.045, g); }
    L.box(r * 0.2, 0.014, 0.014, gl, 0, -r * 0.96, h.rz * 1.05, g);
    return seat(n, g); }
  function bigBed(parent, { x = 0, z = 0, w = 1.7, quilt = 0x8a6a3a, straw = false } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); const wood = litM(L.rep(OAK, 2, 2), 0x7a4a2a);
    L.box(w, 0.16, 2.0, wood, 0, 0.28, 0, g); for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.box(0.08, 0.22, 0.08, wood, px * (w / 2 - 0.04), 0.11, pz * 0.96, g);
    L.box(w - 0.06, 0.12, 1.9, litM(null, straw ? 0xc8a860 : 0xe8e2d4), 0, 0.42, 0, g); L.box(w - 0.2, 0.06, 0.3, litM(null, 0xf0eadc), 0, 0.5, -0.76, g);
    L.box(w + 0.06, 0.8, 0.08, wood, 0, 0.6, -1.02, g); L.box(w + 0.06, 0.45, 0.08, wood, 0, 0.42, 1.02, g);
    duvet(g, 0.42, 0.48, 1.05, quilt, w + 0.02, 0.26); g.userData = { top: 0.48 }; return g; }
  // props
  function porcelainPillow() {   // Chinese porcelain pillow: a hard white block with a saddle-curved top and blue painted sides
    const t = L.cvs(32, 16, (c) => { c.fillStyle = '#f6f4ec'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#2a5ab0'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 15, 32, 1); c.fillRect(0, 13, 32, 1);
      for (let i = 0; i < 5; i++) { c.fillRect(3 + i * 6, 7 + (i % 2), 3, 3); c.fillRect(4 + i * 6, 4, 1, 9); c.fillStyle = '#6a9ae0'; c.fillRect(2 + i * 6, 6, 2, 1); c.fillStyle = '#2a5ab0'; } });
    const sh = new THREE.Shape(); sh.moveTo(-0.2, 0); sh.lineTo(0.2, 0); sh.lineTo(0.22, 0.15); sh.quadraticCurveTo(0, 0.06, -0.22, 0.15); sh.lineTo(-0.2, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.15, bevelEnabled: false }); geo.translate(0, 0, -0.075);
    const g = new THREE.Group(); L.mesh(geo, litM(L.rep(t, 2.4, 6), 0xffffff), 0, 0, 0, g); return g; }
  function rushLightObj() {   // rushlight: an iron rod on a wooden block, a pincer jaw holding a greased rush at 45 deg, burning at the top
    const g = new THREE.Group(), ir = litM(null, 0x2a2a2e);
    L.mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.05, 8), litM(L.rep(OAK, 1, 1), 0x6a4a2a), 0, 0.025, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.42, 5), ir, 0, 0.26, 0, g);
    for (const s of [-1, 1]) { const a = L.box(0.01, 0.1, 0.01, ir, s * 0.014, 0.49, 0, g); a.rotation.z = -0.95 + s * 0.12; }
    L.mesh(new THREE.SphereGeometry(0.022, 6, 4), ir, -0.05, 0.44, 0, g);
    const rush = L.box(0.007, 0.34, 0.007, L.basic(null, 0xd8c890), 0.09, 0.56, 0, g); rush.rotation.z = -0.95;
    const fl = L.mesh(new THREE.ConeGeometry(0.02, 0.075, 5), L.basic(null, 0xffc040), 0.235, 0.69, 0, g); const fl2 = L.mesh(new THREE.ConeGeometry(0.01, 0.04, 4), L.basic(null, 0xfff4b0), 0.235, 0.68, 0.004, g);
    g.userData.tick = (t) => { const q = q15(t); fl.scale.y = 1 + 0.25 * Math.sin(q * 23); fl2.scale.y = 1 + 0.3 * Math.sin(q * 19 + 1); }; return g; }
  function nightshirt() {   // a long white linen nightshirt, sleeves out, with a slit collar (on a peg)
    const s = new THREE.Shape(); [[0.3, 0], [0.24, 0.9], [0.5, 0.76], [0.57, 0.86], [0.22, 1.08], [0.07, 1.1], [0, 1.03], [-0.07, 1.1], [-0.22, 1.08], [-0.57, 0.86], [-0.5, 0.76], [-0.24, 0.9], [-0.3, 0]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    const t = L.cvs(16, 16, (c) => { c.fillStyle = '#f2eee2'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#dcd6c4'; for (let x = 0; x < 16; x += 4) c.fillRect(x, 0, 1, 16); c.fillStyle = '#c8c0aa'; c.fillRect(0, 15, 16, 1); });
    const g = new THREE.Group(); L.mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), litM(L.rep(t, 3, 3), 0xffffff), 0, -1.1, 0, g); L.box(0.02, 0.28, 0.035, L.basic(null, 0xb8b0a0), 0, -0.2, 0.01, g); return g; }
  function glassWater() { const g = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.1, 8, 1, true), L.basic(null, 0xd8f0ff, { transparent: true, opacity: 0.55, side: THREE.DoubleSide }), 0, 0.05, 0, g);
    L.mesh(new THREE.CylinderGeometry(0.032, 0.03, 0.065, 8), L.basic(null, 0x8ac8f0, { transparent: true, opacity: 0.6 }), 0, 0.035, 0, g); return g; }
  function bookObj(col = 0x2a6a4a) { const g = new THREE.Group(); L.box(0.16, 0.035, 0.22, litM(null, col), 0, 0.018, 0, g); L.box(0.15, 0.028, 0.212, L.basic(null, 0xf4ecd8), 0.006, 0.018, 0, g); const bm = L.box(0.015, 0.002, 0.06, L.basic(null, 0xd83030), 0.03, 0.037, 0.13, g); return g; }
  // the bedroom's door, packed with earth from outside (the dig pit on the hill: an earth trench down to the house front)
  function pitSet(scene) {
    L.addSky(scene, { near: 12, far: 70, preset: 'morning' });
    L.box(8, 0.1, 6, mm(MT.earth, 6, 4, 0x9a8a72), 0, -0.05, 1.0, scene);
    for (const [x, z, w, d, ry] of [[-3.2, 0.6, 0.8, 5, 0], [3.2, 0.6, 0.8, 5, 0], [0, 3.6, 7, 0.8, 0]]) { const b = L.box(w, 2.6, d, mm(MT.earth, w + d, 2, 0x8a7a62), x, 1.3, z, scene); b.rotation.y = ry; }
    for (let i = 0; i < 10; i++) mound(scene, -3.2 + i * 0.72, 3.0 + (i % 2) * 0.3, 0.5, 0.4, 2.55);
    // v2 (user: she passed through the window): the front is built AROUND a real opening (x 0.7..1.9, y 1.0..2.6), a dark room behind it
    const WZ = -1.31, wpl = mm(MT.plaster, 2, 1.5), wb = (x0, x1, y0, y1) => L.box(x1 - x0, y1 - y0, 0.12, wpl, (x0 + x1) / 2, (y0 + y1) / 2, WZ, scene);
    wb(-3.2, 0.7, 0.95, 2.8); wb(1.9, 3.2, 0.95, 2.8); wb(0.7, 1.9, 2.6, 2.8); wb(0.7, 1.9, 0.95, 1.0);
    L.box(6.4, 0.95, 0.12, mm(MT.wainscot, 2, 1, 0x3a6e60), 0, 0.475, WZ, scene); L.box(6.4, 0.07, 0.16, mm(MT.darkWood, 6, 0.3), 0, 0.95, WZ + 0.02, scene); L.box(6.4, 0.1, 0.18, mm(MT.darkWood, 6, 0.3), 0, 2.75, WZ + 0.02, scene);
    for (let px = -2.9; px < 2.9; px += 0.75) if (px < 0.2 || px > 2.1) L.box(0.6, 0.7, 0.04, mm(MT.wainscot, 1, 1), px + 0.3, 0.48, WZ + 0.075, scene);
    L.box(1.45, 0.08, 0.34, mm(MT.stone, 1, 0.2), 1.3, 0.96, WZ + 0.06, scene);   // the sill: top at y 1.0, sticks out 0.1 m
    for (const x of [0.65, 1.95]) L.box(0.1, 1.6, 0.2, mm(MT.darkWood, 0.2, 1.6), x, 1.8, WZ + 0.04, scene); L.box(1.45, 0.12, 0.22, mm(MT.darkWood, 1.4, 0.2), 1.3, 2.64, WZ + 0.04, scene);
    const rmM = new THREE.MeshLambertMaterial({ color: 0x3a2a1c, side: THREE.DoubleSide }), room = new THREE.Group(); scene.add(room);   // the room behind: back, sides, ceiling (no front face)
    L.plane(3.4, 2.8, rmM, 1.3, 1.4, -3.87, room); L.plane(2.5, 2.8, rmM, -0.4, 1.4, -2.62, room, Math.PI / 2); L.plane(2.5, 2.8, rmM, 3.0, 1.4, -2.62, room, Math.PI / 2); L.plane(3.4, 2.5, rmM, 1.3, 2.8, -2.62, room, 0, Math.PI / 2);
    L.box(3.3, 0.1, 2.4, new THREE.MeshLambertMaterial({ color: 0x4a3828 }), 1.3, 0.05, -2.62, scene);
    const rl = new THREE.PointLight(0xffc890, 1.4, 4); rl.position.set(1.3, 1.9, -2.7); scene.add(rl);
    L.box(6.6, 0.3, 0.5, mm(MT.roof, 6, 0.4), 0, 2.95, -1.1, scene);
    const dg = new THREE.Group(); dg.position.set(-0.9, 0, -1.22); scene.add(dg);
    for (const s of [-1, 1]) L.box(0.12, 2.0, 0.16, mm(MT.darkWood, 0.2, 2), s * 0.5, 1.0, 0, dg); L.box(1.12, 0.14, 0.16, mm(MT.darkWood, 1, 0.2), 0, 2.05, 0, dg);
    const door = L.box(0.88, 1.92, 0.05, mm(MT.wood, 1, 2, 0xb08a60), 0, 0.96, 0.0, dg); L.mesh(new THREE.SphereGeometry(0.03, 6, 4), litM(null, 0xc8a040), 0.33, 0.95, 0.05, dg);
    mound(dg, 0.25, 0.45, 0.55, 0.55); mound(dg, -0.35, 0.4, 0.45, 0.4); mound(dg, 0.05, 0.3, 0.4, 0.95); rubble(dg, 0.0, 0.7, 6, 0.8, 31);
    const wg = null;
    rubble(scene, 2.4, 0.4, 6, 1.0, 40); rubble(scene, -2.4, 1.6, 5, 0.8, 50);
    scene.add(new THREE.AmbientLight(0xc8d0e0, 0.6)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.6); sun.position.set(2, 6, 4); scene.add(sun);
    return { door, dg, wg, room };
  }
  function chinaRoom(scene) {   // a Chinese bedroom: red lacquer columns, a paper lantern, a low wooden platform bed with the porcelain pillow
    tudorRoom(scene);
    for (const x of [-1.6, 1.6]) L.mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8), litM(null, 0xb02a20), x, 1.7, -0.45, scene);
    L.box(3.6, 0.22, 0.16, litM(null, 0x8a1a14), 0, 3.0, -0.45, scene);
    const lan = L.mesh(new THREE.SphereGeometry(0.22, 8, 6), L.basic(null, 0xe8483a), 0.9, 2.3, 0.4, scene); lan.scale.y = 1.25; L.box(0.2, 0.05, 0.2, litM(null, 0x2a1a10), 0.9, 2.6, 0.4, scene);
    const pl = new THREE.PointLight(0xff9a70, 2.4, 5); pl.position.set(0.9, 2.2, 0.6); scene.add(pl);
    const kang = new THREE.Group(); kang.position.set(-0.3, 0, 0.1); scene.add(kang);
    L.box(1.9, 0.42, 1.1, litM(L.rep(OAK, 2, 1), 0x7a3a1a), 0, 0.21, 0, kang); L.box(1.8, 0.06, 1.0, litM(null, 0xd8c890), 0, 0.45, 0, kang);
    const pp = porcelainPillow(); pp.position.set(-0.6, 0.48, 0); pp.rotation.y = Math.PI / 2; kang.add(pp); pp.scale.setScalar(1.3);
    return { pp, kang };
  }

  // ---- P1 ----
  SH([1, 'Something', 2], 'C', (t0) => { const scene = new THREE.Scene(); hillSet(scene); const ch = hero(scene, { p: [0.2, 0, 0.1], ry: -2.6 }); const det = detector(scene); const fp = V3([0, 0, 0]);
    for (const x of [t0 + 0.2]) cue(x, 'label');
    return { scene, cam: CAM([[-1.3, 1.0, 0.9], [-1.2, 0.95, 0.8]], [[-0.5, 0.3, -0.9]], 46), upd(t) { const q = q15(t); ch.drive(t, [seg('detector_walk', -99, { loop: true, speed: 0.3 })], [[-99, 'surprised', 'gasp']]); scene.updateMatrixWorld(true); ch.fist('R', fp); det.userData.place(fp, V3([-0.8, 0, -0.6]).normalize(), Math.sin(q * 3) * 0.05, Math.floor(q * 8) % 2 === 0); },
      ov(o, t) { plateText(o, 'SIGNAL: BIG + SOFT', CX, 30, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0 + 0.2) }); } }; });
  // ---- P2/P3 ----
  SH([2, 'lying'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene);
    return { scene, cam: CAM([[-0.7, 1.35, 0.7], [-0.6, 1.25, 0.5]], [[0.3, 0.5, -0.9]], 46), upd(t) { D.ll.userData.tick(t); } }; });
  SH([3, "It's"], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.95, 0, 0.9], ry: 0.5 }); const tB = ws(3, 'bedroom');
    for (const x of [tB, tB + 0.2]) cue(x, 'label');
    return { scene, cam: CAM([[1.75, 1.3, 2.6], [1.6, 1.3, 2.3]], [[0.75, 1.0, 0.6]], 44), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('present', t0 - 0.1)], [[-99, 'happy', 'smileOpen']]); },
      ov(o, t) { if (t >= tB) { plateText(o, 'EXPEDITION 01', CX, LH / 2 - 12, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tB) }); plateText(o, 'THE BEDROOM', CX, LH / 2 + 12, { size: 14, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tB + 0.2) }); } } }; });
  // ---- P4: the door packed with earth (outside, in the dig pit), she pushes, it doesn't move ----
  SH([4, 'The'], 'M', (t0) => { const scene = new THREE.Scene(); const P0 = pitSet(scene); const ch = hero(scene, { p: [-0.85, 0, -0.55], ry: Math.PI }); cue(t0 + 0.5, 'door_thud'); cue(t0 + 1.2, 'dirt_fall');
    const fx = new FX(LW, LH).add('dust', { world: [-0.9, 1.9, -1.1], t0: t0 + 1.1, dur: 1.2, n: 6, color: '#a88858', edge: '#5a3a1c' }).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: t0 + 1.4, dur: 9 });
    for (const x of [t0 + 0.8]) cue(x, 'label');
    return { scene, fx, cam: CAM([[1.3, 1.5, 2.2], [1.15, 1.45, 1.95]], [[-0.7, 1.0, -0.9]], 48), upd(t) { ch.drive(t, [seg('push_door', t0 - 0.1)], [[-99, 'angry', 'frown'], [t0 + 1.4, 'half', 'frown']]); },
      ov(o, t) { if (t >= t0 + 0.8) plateText(o, 'DOOR: STUCK', CX, 30, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, t0 + 0.8) }); } }; });
  // the window: from inside the buried room, she climbs in over the sill (climb_in), dust falls
  SH([4, 'so'], 'C', (t0) => { const scene = new THREE.Scene(); pitSet(scene); L.box(0.8, 0.1, 0.6, mm(MT.stone, 1, 0.2), 1.3, 0.05, -0.8, scene);
    const ch = hero(scene, { p: [1.3, 0.1, -0.77], ry: Math.PI }); const tC = t0 + 0.25; cue(tC + 0.45, 'dirt_fall'); cue(tC + 0.8, 'step_back'); cue(tC + 1.45, 'land');
    const fx = new FX(LW, LH).add('dust', { world: [1.3, 1.1, -1.1], t0: tC + 0.4, dur: 1.4, n: 8, color: '#a88858', edge: '#5a3a1c' });
    const ct = new URLSearchParams(location.search).get('ct');   // test angles: ct=1 side, ct=2 inside the room, ct=3 high
    const C = ct === '1' ? CAM([[2.6, 1.5, -0.4]], [[1.0, 1.2, -1.6]], 56) : ct === '2' ? CAM([[1.4, 1.5, -3.6]], [[1.3, 1.3, -1.2]], 56) : ct === '3' ? CAM([[1.0, 3.4, 0.6]], [[1.3, 1.0, -1.3]], 52)
      : CAM([[2.3, 1.6, 1.4], [2.25, 1.55, 1.3]], [[1.2, 1.3, -1.0]], 50);
    return { scene, fx, cam: C, upd(t) { const f = (q15(t) - tC) * 30;
        const up = smooth((f - 10) / 14), dn = smooth((f - 34) / 8), z = -0.77 - 0.37 * smooth((f - 10) / 14) - 0.95 * smooth((f - 24) / 16);
        ch.root.position.set(1.3, 0.1 + 0.92 * up - 0.92 * dn, z); ch.drive(t, [seg('climb_in', tC)], [[-99, 'angry', 'frown'], [tC + 1.0, 'happy', 'smile']]); } }; });
  SH([4, 'The', 3], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.9, 0, 0.6], ry: -0.4 });
    for (const x of [ws(4, 'dirt')]) cue(x, 'label');
    return { scene, cam: CAM([[0.6, 0.35, 1.9], [0.6, 0.35, 1.7]], [[0.5, 2.6, -0.6], [0.6, 2.5, -0.9]], 58), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'surprised', 'talkO']]); },
      ov(o, t) { const tD = ws(4, 'dirt'); if (t >= tD) plateText(o, 'DIRT: 2 M', CX, 30, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tD) }); } }; });
  SH([4, 'Scanning'], 'C', (t0, t1) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.3, 0, 1.3], ry: -2.4 }); cue(t0 + 0.1, 'scan');
    return { scene, cam: CAM([[2.2, 1.6, 2.6], [2.0, 1.6, 2.4]], [[0.0, 0.8, -0.8]], 52), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('point', t0 - 0.2)], [[-99, 'open', 'neutral']]); },
      ov(o, t, c) { const y = Math.round(((t - t0) / Math.max(0.5, t1 - t0)) * LH); c.fillStyle = '#7cf0ff'; c.fillRect(0, y, LW, 2); c.fillStyle = 'rgba(124,240,255,0.18)'; c.fillRect(0, Math.max(0, y - 18), LW, 18);
        bitText(c, 'SCANNING' + '.'.repeat(1 + Math.floor((t - t0) * 3) % 3), CX, 22, 2, '#c8f8ff', { outline: '#081020' }); } }; });
  // ---- P5 ----
  SH([5, 'cup'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const tL = ws(5, 'green');
    const fx = new FX(LW, LH).add('sparkle', { world: [-0.55, 0.68, -1.66], t0: tL, dur: 99, n: 3, radius: 14, color: '#b0ff90' });
    for (const x of [tL]) cue(x, 'label');
    return { scene, fx, cam: CAM([[-0.35, 0.82, -1.15], [-0.4, 0.8, -1.25]], [[-0.6, 0.62, -1.66]], 40), upd(t) { D.ll.userData.tick(t); },
      ov(o, t) { if (t >= tL) { const p = L.toScreen(this.cam, -0.55, 0.66, -1.66); popLabel(o, t, tL, 'LIFE FORM?', 120, 60, 14, p); } } }; });
  SH([5, 'This'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [-0.2, 0, 0.5], ry: -0.4 });
    return { scene, cam: CAM([[0.4, 1.3, 2.0], [0.35, 1.3, 1.8]], [[-0.3, 1.1, 0.3]], 40), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('shake_head', t0 - 0.1)], [[-99, 'half', 'frown']]); } }; });
  // ---- P6 ----
  SH([6, "Let's"], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.8, 0, 1.2], ry: 0.3 }); cue(t0 + 0.3, 'cheer');
    return { scene, cam: CAM([[1.1, 0.45, 2.6], [1.05, 0.5, 2.4]], [[0.8, 1.2, 1.1]], 50), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('cheer', t0 - 0.05)], [[-99, 'happy', 'smileOpen']]); } }; });
  // ---- P7: she presses the mattress (press_down, two bounces a second), then the scan value ----
  SH([7, 'Humans'], 'C', (t0, t1) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.12, 0, -0.75], ry: -Math.PI / 2 });
    for (let b = t0 + 8 / 30; b < t1; b += 14 / 30) cue(b, 'spring_boing');
    return { scene, cam: CAM([[-0.4, 1.9, 0.6], [-0.35, 1.85, 0.5]], [[0.9, 0.6, -0.8]], 46), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('press_down', t0, { loop: true })], [[-99, 'surprised', 'talkO'], [t0 + 0.6, 'happy', 'smileOpen']]); } }; });
  SH([7, 'My'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const tE = ws(7, 'expensive'), tS = ws(7, 'sleeping'); cue(t0 + 0.1, 'scan');
    for (const x of [tE, tS]) cue(x, 'label');
    return { scene, cam: CAM([[-0.6, 1.6, 0.6], [-0.5, 1.55, 0.5]], [[0.3, 0.45, -0.8]], 46), upd(t) { D.ll.userData.tick(t); },
      ov(o, t) { const a = L.toScreen(this.cam, -0.2, 0.55, -1.8), b = L.toScreen(this.cam, 0.8, 0.45, 0.2); hudBox(o, Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), '#7cf0ff');
        if (t >= tE) plateText(o, 'VALUE: VERY HIGH', CX, 30, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tE) }); if (t >= tS) plateText(o, 'USE: SLEEPING', CX, 56, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tS) }); } }; });
  // ---- P8: the question, then the time tunnel ----
  SH([8, 'So'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.9, 0, 0.7], ry: -0.5 });
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.15, 0.42, 0], t0: t0 + 0.6, dur: 99 });
    return { scene, fx, cam: CAM([[0.2, 1.35, 1.9], [0.25, 1.35, 1.75]], [[0.85, 1.1, 0.6]], 42), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('think', t0 - 0.1)], [[-99, 'open', 'neutral']]); } }; });
  SH([8, "Let's"], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.9, 0, 0.7], ry: 0.2 }); cue(t0 + 0.05, 'rewind');
    return { scene, cam: CAM([[1.0, 1.3, 2.4], [1.0, 1.25, 1.6]], [[0.9, 1.0, 0.6]], 46), upd(t) { ch.drive(t, [seg('cheer', t0)], [[-99, 'happy', 'smileOpen']]); },
      ov(o, t, c) { const k = (t - t0) * 3, q = Math.floor(t * 15); for (let i = 0; i < 9; i++) { const r = ((i / 9 + k * 0.25) % 1), w = Math.round(LW * r), h = Math.round(LH * r); c.fillStyle = ['#7cf0ff', '#6b6fd6', '#fdd941'][(i + q) % 3]; c.fillRect(CX - w / 2, LH / 2 - h / 2, w, 2); c.fillRect(CX - w / 2, LH / 2 + h / 2, w, 2); c.fillRect(CX - w / 2, LH / 2 - h / 2, 2, h); c.fillRect(CX + w / 2, LH / 2 - h / 2, 2, h); }
        bitText(c, 'REWIND', CX, 40, 3, '#fdd941', { outline: '#141838' }); bitText(c, 'BACK 200,000 YEARS', CX, 205, 2, '#ffffff', { outline: '#141838' }); } }; });
  // ---- P9: cave inserts ----
  SH([9, 'Under'], 'C', (t0) => { const scene = new THREE.Scene(); const C0 = caveSet(scene); const tA = ws(9, 'ash');
    for (const x of [tA]) cue(x, 'label');
    return { scene, cam: CAM([[0.2, 0.55, -0.05], [0.1, 0.5, -0.15]], [[-0.4, 0.05, -0.95]], 46), upd(t) { const q = q15(t); C0.fl.scale.y = 1 + 0.15 * Math.sin(q * 20); C0.fl2.scale.y = 1 + 0.2 * Math.sin(q * 17 + 1); },
      ov(o, t) { plateText(o, 'GRASS', 150, 40, { size: 12, border: '#9cf09c', fg: '#e0ffe0' }); if (t >= tA) { const p = L.toScreen(this.cam, -0.3, 0.03, -0.75); popLabel(o, t, tA, 'ASH', 330, 200, 14, p); } } }; });
  SH([9, 'Scientists'], 'C', (t0) => { const scene = new THREE.Scene(); const C0 = caveSet(scene); const ch = hero(scene, { p: [0.55, 0, -0.35], ry: -1.9 }); const tB = ws(9, 'spray'); cue(tB, 'sting');
    const fx = new FX(LW, LH).add('flies', { world: [-0.3, 0.45, -0.3], t0, dur: 99, n: 6 }).add('arrow', { world: [-0.3, 0.3, -0.6], t0: t0 + 0.5, dur: 99, angle: -1.57, len: 18, n: 3, gap: 14 });
    for (const x of [tB]) cue(x, 'label');
    return { scene, fx, cam: CAM([[-0.9, 1.0, 1.0], [-0.8, 0.95, 0.9]], [[-0.2, 0.3, -0.8]], 50), upd(t) { const q = q15(t); C0.fl.scale.y = 1 + 0.15 * Math.sin(q * 20); ch.drive(t, [seg('kneel', -99, { from: 1.5, speed: 0 }), seg('nod', tB, { fade: 0.15 })], [[-99, 'open', 'smile'], [tB, 'happy', 'smileOpen']]); },
      ov(o, t) { plateText(o, 'BUGS: KEEP OUT', CX, 30, { size: 12, border: '#ff6a6a', fg: '#ffd0d0' }); if (t >= tB) plateText(o, 'GRASS + ASH = BUG SPRAY', CX, 56, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tB) }); } }; });
  // ---- P10: the medieval family on the straw sack, the guests, the yearly change ----
  function familyOnSack(scene, R0) { const fam = [['bank_teller', 'olive', -0.42, 1, 0], ['homework_girl', 'green', 0.42, 1, 0], ['art_student', 'teal', 0.02, 0.78, 0]].map(([id, v, x, s]) => lieNpc(scene, id, v, x, 0.28, 0.55, { s }));
    duvet(scene, 0.3, 0.22, 1.0, 0x6a5a40, 1.5, 0.32); return fam; }
  SH([10, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = strawBedRoom(scene); const fam = familyOnSack(scene, R0); const ch = hero(scene, { p: [1.35, 0, 0.9], ry: -1.2 }); const tS = ws(10, 'straw');
    for (const x of [tS]) cue(x, 'label');
    return { scene, cam: CAM([[0.3, 2.2, 2.4], [0.25, 2.1, 2.2]], [[0.1, 0.3, -0.2]], 50), upd(t) { ch.drive(t, [seg('present', t0 - 0.1)], [[-99, 'open', 'smile']]); },
      ov(o, t) { plateText(o, 'MEDIEVAL EUROPE', CX, 26, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tS) { const p = L.toScreen(this.cam, 0.9, 0.2, -0.3); popLabel(o, t, tS, 'STRAW SACK', 390, 60, 14, p); } } }; });
  SH([10, 'Fleas'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = strawBedRoom(scene); familyOnSack(scene, R0); cue(t0, 'buzz');
    const fx = new FX(LW, LH).add('flies', { world: [0, 0.35, -0.2], t0, dur: 99, n: 9 }).add('flies', { world: [-0.5, 0.3, 0.3], t0: t0 + 0.3, dur: 99, n: 5 });
    return { scene, fx, cam: CAM([[0.6, 0.75, 1.2], [0.5, 0.7, 1.05]], [[0.0, 0.25, -0.2]], 46),
      ov(o, t) { plateText(o, 'FLEAS · LICE · BEDBUGS', CX, 30, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, t0) }); } }; });
  SH([10, 'Rich'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = strawBedRoom(scene); const ch = hero(scene, { p: [0.6, 0, 0.6], ry: -0.3 }); const tO = ws(10, 'once');
    const fx = new FX(LW, LH).add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tO, dur: 9 });
    for (const x of [tO]) cue(x, 'label');
    return { scene, fx, cam: CAM([[0.9, 1.3, 2.4], [0.85, 1.3, 2.2]], [[0.4, 0.9, 0.2]], 44), upd(t) { ch.drive(t, [seg('shrug', t0 - 0.1), seg('shiver', tO, { fade: 0.15 })], [[-99, 'open', 'smile'], [tO, 'disgust', 'disgust']]); },
      ov(o, t) { plateText(o, 'RICH: NEW STRAW OFTEN', CX, 30, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tO) plateText(o, 'MOST: 1x A YEAR', CX, 56, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tO) }); } }; });
  // ---- P11 ----
  SH([11, 'Humans'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [-0.75, 0, 0.3], ry: 2.6 }); const tB = ws(11, 'bugs');
    const fx = new FX(LW, LH).add('flies', { world: [0.3, 0.6, -0.9], t0: tB, dur: 99, n: 5 });
    for (const x of [tB]) cue(x, 'label');
    return { scene, fx, cam: CAM([[0.3, 1.4, 1.5], [0.25, 1.35, 1.4]], [[-0.2, 0.7, -0.5]], 48), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('shiver', tB, { fade: 0.15 })], [[-99, 'open', 'smile'], [tB, 'disgust', 'disgust']]); },
      ov(o, t) { if (t >= tB) plateText(o, 'BEDBUGS: STILL HERE', CX, 30, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tB) }); } }; });
  // ---- P12: she flips the pillow ----
  SH([12, 'Humans'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.0, 0, 0.8], ry: -0.3 }); const pw = pillowObj(); scene.add(pw); const fp = V3([0, 0, 0]); const tF = ws(12, 'flipped');
    for (const x of [tF + 0.3]) cue(x, 'label');
    return { scene, cam: CAM([[0.4, 1.3, 2.4], [0.35, 1.28, 2.2]], [[0.0, 1.1, 0.7]], 42), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('hold_up_object', t0 - 0.3)], [[-99, 'happy', 'smile'], [tF, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); pw.position.copy(fp).add(V3([0, 0.12, 0.04])); pw.rotation.set(0, 0.4, q15(t) >= tF ? Math.PI * smooth((q15(t) - tF) / 0.3) : 0); },
      ov(o, t) { if (t >= tF) plateText(o, 'COLD SIDE: FOUND', CX, 30, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tF + 0.3) }); } }; });
  // ---- P13: the Egyptian headrest close-up, then China's porcelain pillow ----
  SH([13, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); egyptRoom(scene); const rest = new THREE.Group(); scene.add(rest); rest.position.set(-0.4, 0, -0.3); rest.scale.setScalar(1.6);
    L.box(0.36, 0.05, 0.14, litM(L.rep(OAK, 1, 1), 0xa87848), 0, 0.025, 0, rest); L.box(0.07, 0.22, 0.07, litM(L.rep(OAK, 1, 1), 0xa87848), 0, 0.14, 0, rest);
    const cr = L.mesh(new THREE.TorusGeometry(0.14, 0.035, 4, 10, Math.PI), litM(L.rep(OAK, 1, 1), 0xa87848), 0, 0.37, 0, rest); cr.rotation.z = Math.PI; const tT = ws(13, 'tombs');
    for (const x of [tT]) cue(x, 'label');
    return { scene, cam: CAM([[0.2, 0.75, 0.9], [0.1, 0.7, 0.75]], [[-0.4, 0.35, -0.3]], 44), upd(t) { rest.rotation.y = 0.3 + q15(t) * 0.15; },
      ov(o, t) { plateText(o, 'EGYPT: WOODEN HEADREST', CX, 28, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tT) plateText(o, '+ INTO THE TOMB', CX, 54, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tT) }); } }; });
  SH([13, 'In', 2], 'C', (t0) => { const scene = new THREE.Scene(); const R = chinaRoom(scene); const ch = hero(scene, { p: [0.9, 0, 0.7], ry: -0.9 }); const tH = ws(13, 'hard'), tP = ws(13, 'paintings');
    for (const x of [tH, tP]) cue(x, 'label');
    return { scene, cam: CAM([[0.6, 1.2, 2.0], [0.4, 1.0, 1.6]], [[-0.7, 0.6, 0.1]], 44), upd(t) { ch.drive(t, [seg('point', t0 - 0.1)], [[-99, 'happy', 'smileOpen']]); },
      ov(o, t) { plateText(o, 'CHINA: PORCELAIN PILLOW', CX, 28, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tH) plateText(o, 'HARD + COOL', CX, 54, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tH) });
        if (t >= tP) { const p = L.toScreen(this.cam, -0.9, 0.62, 0.1); popLabel(o, t, tP, 'PAINTED SIDES', 110, 200, 14, p); } } }; });
  // ---- P14: she tries the stone pillow on the floor (lie_on_side) ----
  SH([14, 'Humans'], 'C', (t0) => { const scene = new THREE.Scene(); egyptRoom(scene); const ch = hero(scene, { p: [0.2, 0.02, 0.5], ry: Math.PI / 2 });
    const stone = L.box(0.34, 0.16, 0.2, litM(L.rep(T.stone, 1, 1), 0xb0aaa0), -0.62, 0.08, 0.5, scene); stone.rotation.y = Math.PI / 2; const tL = ws(14, 'liked');
    for (const x of [tL]) cue(x, 'label');
    return { scene, cam: CAM([[0.1, 1.5, 1.9], [0.0, 1.35, 1.7]], [[-0.1, 0.2, 0.5]], 44), upd(t) { ch.drive(t, [seg('lie_on_side', -99, { loop: true })], [[-99, 'relaxed', 'smile'], [tL, 'happy', 'smileOpen']], false); },
      ov(o, t) { if (t >= tL) plateText(o, 'COMFORT: 10/10 (?)', CX, 30, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tL) }); } }; });
  // ---- P15: doctors propped the sick up; everyone else lay flat ----
  SH([15, 'Some'], 'C', (t0) => { const scene = new THREE.Scene(); tudorRoom(scene); const bd = bigBed(scene, { x: 0, z: 0.4, w: 1.1, quilt: 0x6a7a4a });
    for (const [y, z] of [[0.56, -0.5], [0.66, -0.55], [0.76, -0.6]]) L.box(0.7, 0.1, 0.3, litM(null, 0xf6f2ea), 0, y, z, scene);
    const sick = lieNpc(scene, 'bank_teller', 'grey', 0, 0.62, 1.25, { tilt: 0.42 }); nightcap(sick); const tS = ws(15, 'sick');
    const fx = new FX(LW, LH).add('sweat', { target: sick, offset: [0.1, 0.5, -0.6], t0, dur: 99 });
    for (const x of [tS]) cue(x, 'label');
    return { scene, fx, cam: CAM([[1.4, 1.5, 2.4], [1.3, 1.45, 2.2]], [[0, 0.7, 0.0]], 46),
      ov(o, t) { plateText(o, "DOCTOR'S ORDERS: HEAD UP", CX, 28, { size: 12, border: '#ff6a6a', fg: '#ffd0d0' }); if (t >= tS) { const p = L.toScreen(this.cam, 0, 1.0, -0.3); popLabel(o, t, tS, 'SICK', 100, 70, 14, p); } } }; });
  SH([15, 'Everyone'], 'C', (t0) => { const scene = new THREE.Scene(); tudorRoom(scene); const bd = bed(scene, { x: 0, z: 0.4, quilt: 0x8a3a2a, full: true }); const ch = hero(scene); inBed(ch, bd);
    return { scene, cam: CAM([[1.3, 1.6, 2.6], [1.2, 1.55, 2.4]], [[0, 0.5, 0.2]], 46), upd(t) { ch.drive(t, [seg('sleep_lie', -99, { loop: true })], [[-99, 'blink', 'cat']], false); },
      ov(o, t) { plateText(o, 'EVERYONE ELSE: LYING DOWN', CX, 28, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, t0) }); } }; });
  // ---- P16: the blanket scan (4 humans + 1 dog) ----
  SH([16, 'My'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const tD = ws(16, 'dog'); cue(t0 + 0.1, 'scan');
    const pts = [[0.1, 0.62, -0.05], [0.45, 0.6, 0.0], [0.2, 0.66, -0.35], [0.55, 0.62, -0.3]];
    for (const x of [tD]) cue(x, 'label');
    return { scene, cam: CAM([[-0.5, 1.5, 0.6], [-0.45, 1.45, 0.5]], [[0.35, 0.5, -0.4]], 44), upd(t) { D.ll.userData.tick(t); },
      ov(o, t) { pts.forEach((w, i) => { if (t < t0 + 0.4 + i * 0.35) return; const p = L.toScreen(this.cam, ...w); hudBox(o, p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9, '#7cf0ff'); bitText(o.tctx, 'HUMAN ' + (i + 1), p[0], p[1] - 15, 1, '#c8f8ff'); });
        if (t >= tD) { const p = L.toScreen(this.cam, 0.35, 0.58, 0.15); hudBox(o, p[0] - 11, p[1] - 11, p[0] + 11, p[1] + 11, '#ffd93b'); plateText(o, '+ 1 DOG', CX, 30, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tD) }); } } }; });
  // ---- P17: a whole family in one bed; a stranger at the inn; the rules ----
  SH([17, 'For'], 'C', (t0) => { const scene = new THREE.Scene(); tudorRoom(scene); const bb = bigBed(scene, { x: 0, z: 0.4, w: 1.7, quilt: 0x7a5a8a });
    [['bank_teller', 'olive', -0.55, 1], ['homework_girl', 'red', -0.12, 0.8], ['art_student', 'teal', 0.25, 0.78], ['homework_girl', 'green', 0.6, 0.95]].forEach(([id, v, x, s]) => lieNpc(scene, id, v, x, 0.56, 1.17, { s }));
    const dog = SkeletonUtils.clone(M.lib_hound); dog.traverse((o) => { if (o.isMesh) { o.material = L.basic(T.lib_hound_orig, 1, { alphaTest: 0.5, side: THREE.DoubleSide }); o.frustumCulled = false; } }); dog.scale.setScalar(0.9); dog.position.set(0.45, 0.52, 1.3); dog.rotation.y = 1.4; scene.add(dog);
    const tW = ws(17, 'warm');
    for (const x of [tW]) cue(x, 'label');
    return { scene, cam: CAM([[0.9, 2.0, 2.9], [0.8, 1.9, 2.7]], [[0, 0.5, 0.3]], 48),
      ov(o, t) { plateText(o, 'SLEEPING ALONE: RARE', CX, 28, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tW) plateText(o, '1 BED = 1 HEATER', CX, 54, { size: 12, border: '#ff9a5a', fg: '#ffe0c8', scale: popS(t, tW) }); } }; });
  function innStrangers(scene) { const I0 = innRoom(scene); const a = lieNpc(scene, 'bank_teller', 'navy', -0.22, 0.56, 1.17); const b = lieNpc(scene, 'art_student', 'violet', 0.22, 0.56, 1.17); nightcap(a); return { I0, a, b }; }
  SH([17, 'When'], 'C', (t0) => { const scene = new THREE.Scene(); const R = innStrangers(scene); const ch = hero(scene, { p: [1.5, 0, 0.6], ry: -0.6 }); const tS = ws(17, 'stranger');
    const fx = new FX(LW, LH).add('question', { target: R.a, offset: [0, 0.3, -1.1], t0: tS, dur: 99 }).add('exclaim', { target: R.b, offset: [0, 0.3, -1.1], t0: tS + 0.2, dur: 99 });
    for (const x of [tS]) cue(x, 'label');
    return { scene, fx, cam: CAM([[1.6, 1.9, 2.8], [1.5, 1.85, 2.6]], [[0, 0.6, 0.0]], 52), upd(t) { ch.drive(t, [seg('shrug', t0 - 0.1)], [[-99, 'open', 'smile']]); },
      ov(o, t) { plateText(o, 'THE INN', CX, 26, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tS) plateText(o, '+ A TOTAL STRANGER', CX, 52, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tS) }); } }; });
  SH([17, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); const R = innStrangers(scene); const rules = [['lie', '1. LIE STILL'], ['quiet', '2. STAY QUIET'], ['steal', "3. DON'T STEAL THE BLANKETS"]].map(([w, s]) => [ws(17, w), s]);
    return { scene, cam: CAM([[0, 2.3, 2.6], [0, 2.25, 2.45]], [[0, 0.5, 0.1]], 46),
      ov(o, t, c) { cham(c, 92, 40, 296, 112, 5, '#141008'); cham(c, 94, 42, 292, 108, 4, '#efe4c8'); c.fillStyle = '#2a5aa8'; c.fillRect(94, 42, 292, 16); bitText(c, 'RULES OF THE INN', CX, 50, 1, '#ffffff', { outline: null });
        rules.forEach(([tw, s], i) => { if (t >= tw) bitText(c, s, CX, 76 + i * 22, 1, '#2a1a0a', { outline: null }); }); } }; });
  // ---- P18: Franklin lectures (close-up), Adams falls asleep ----
  SH([18, 'lectured'], 'C', (t0) => { const scene = new THREE.Scene(); const I0 = innRoom(scene); const ad = lieNpc(scene, 'bank_teller', 'navy', -0.22, 0.56, 1.17); const fr = lieNpc(scene, 'bank_teller', 'olive', 0.22, 0.56, 1.17, { roll: -0.25 }); nightcap(ad); franklinLook(fr); I0.sash.rotation.y = -1.2;
    const tT = ws(18, 'theory'), tA = ws(18, 'asleep'); cue(tA, 'snore');
    const fx = new FX(LW, LH).add('idea', { target: fr, offset: [0.15, 0.25, -1.2], t0: tT, dur: 99 }).add('thought', { target: ad, offset: [-0.1, 0.3, -1.2], t0: tA, dur: 9 });
    for (const x of [tT, tA]) cue(x, 'label');
    return { scene, fx, cam: CAM([[-0.4, 1.05, -0.05], [-0.35, 1.0, -0.12]], [[0.22, 0.6, -0.45]], 46),
      ov(o, t) { if (t >= tT) plateText(o, "FRANKLIN'S THEORY OF COLDS", CX, 28, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tT) }); if (t >= tA) plateText(o, 'ADAMS: ZZZ', CX, 54, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tA) }); } }; });
  // ---- P19 ----
  SH([19, 'A'], 'C', (t0) => { const scene = new THREE.Scene(); const I0 = innRoom(scene); const ad = lieNpc(scene, 'bank_teller', 'navy', -0.22, 0.56, 1.17); const fr = lieNpc(scene, 'bank_teller', 'olive', 0.22, 0.56, 1.17); nightcap(ad); franklinLook(fr); I0.sash.rotation.y = -1.2;
    const ch = hero(scene, { p: [1.3, 0, 0.9], ry: -0.4 }); const tW = ws(19, 'window');
    for (const x of [tW]) cue(x, 'label');
    return { scene, cam: CAM([[2.0, 1.4, 2.6], [1.9, 1.38, 2.4]], [[1.0, 1.1, 0.5]], 42), upd(t) { ch.drive(t, [seg('shrug', t0 - 0.1)], [[-99, 'open', 'smirk']]); },
      ov(o, t) { plateText(o, 'PRESIDENT  VS  SCIENTIST', CX, 28, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tW) plateText(o, 'PRIZE: 1 WINDOW', CX, 54, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tW) }); } }; });
  SH([19, 'I'], 'C', (t0) => { const scene = new THREE.Scene(); const I0 = innRoom(scene); const ch = hero(scene, { p: [0.7, 0, -0.25], ry: 2.5 }); cue(t0 + 0.5, 'window_close');
    return { scene, cam: CAM([[-0.4, 1.5, 0.9], [-0.35, 1.48, 0.8]], [[0.9, 1.3, -0.6]], 46), upd(t) { I0.sash.rotation.y = -1.2 * (1 - smooth((q15(t) - t0 - 0.3) / 0.35)); ch.drive(t, [seg('push_door', t0 - 0.1), seg('smug', t0 + 1.0, { fade: 0.2 })], [[-99, 'open', 'neutral'], [t0 + 0.9, 'smirk', 'smirk']]); } }; });
  // ---- P22/P23: charge in 40 minutes ----
  SH([23, 'I'], 'C', (t0, t1) => { const scene = new THREE.Scene(); labSet(scene); const ch = hero(scene, { p: [0, -0.6, 0.6], ry: 0.15 }); cue(t0 + 0.3, 'plug'); cue(t0 + 0.8, 'charge');
    return { scene, cam: CAM([[0.4, 0.9, 3.0], [0.35, 0.85, 2.7]], [[0, 0.35, 0.5]], 40), upd(t) { ch.drive(t, [seg('charge_plug', t0 - 0.1)], [[-99, 'open', 'neutral'], [t0 + 0.4, 'half', 'neutral'], [t0 + 0.9, 'relaxed', 'smile']]); },
      ov(o, t, c) { const k = clamp01((t - t0 - 0.6) / Math.max(1, t1 - t0 - 0.8)), x = 372, y = 70; c.fillStyle = '#141838'; c.fillRect(x - 2, y - 2, 104, 34); c.fillRect(x + 102, y + 8, 6, 14); c.fillStyle = '#2e4a55'; c.fillRect(x, y, 100, 30);
        c.fillStyle = '#4cd060'; c.fillRect(x + 3, y + 3, Math.round(94 * k), 24); bitText(c, Math.round(k * 100) + '%', x + 50, y + 15, 2, '#ffffff', { outline: '#141838' }); plateText(o, 'FULL CHARGE: 40 MIN', x + 50, y + 54, { size: 12, border: '#9cf09c', fg: '#e0ffe0' }); } }; });
  // ---- P24: the lamp: press, the night is gone ----
  SH([24, 'You'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [-1.25, 0, -1.0], ry: 2.4 }); const tG = ws(24, 'gone'); cue(tG - 0.1, 'click');
    const bulb = new THREE.PointLight(0xffe0a0, 0, 4); bulb.position.set(-0.85, 0.85, -1.55); scene.add(bulb);
    for (const x of [tG]) cue(x, 'label');
    return { scene, cam: CAM([[-0.3, 1.25, 0.3], [-0.35, 1.2, 0.2]], [[-0.95, 0.75, -1.4]], 46), upd(t) { D.ll.userData.tick(t); bulb.intensity = q15(t) >= tG - 0.1 ? 4 : 0; ch.drive(t, [seg('point', t0 - 0.2)], [[-99, 'open', 'neutral'], [tG, 'surprised', 'gasp']]); },
      ov(o, t, c) { if (t >= tG - 0.1 && t < tG + 0.1) { c.fillStyle = 'rgba(255,240,200,0.5)'; c.fillRect(0, 0, LW, LH); } if (t >= tG) plateText(o, 'NIGHT: GONE', CX, 30, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tG) }); } }; });
  // ---- P25: the rushlight in its iron holder ----
  SH([25, 'Or'], 'C', (t0) => { const scene = new THREE.Scene(); const C0 = cellSet(scene); const rl = rushLightObj(); rl.position.copy(C0.table).add(V3([0.2, 0, 0.05])); rl.scale.setScalar(1.3); scene.add(rl);
    const fl = new THREE.PointLight(0xffb060, 2.6, 2.5); fl.position.copy(C0.table).add(V3([0.5, 0.9, 0.1])); scene.add(fl); const tT = ws(25, 'twenty'); cue(t0 + 0.2, 'candle_fizz');
    const fx = new FX(LW, LH).add('steam', { world: [C0.table.x + 0.5, C0.table.y + 0.95, C0.table.z + 0.05], t0, dur: 99, every: 0.3, life: 1.2, rise: 30, color: '#6a6a6a', edge: '#3a3a3a' });
    for (const x of [tT, t0 + 0.6]) cue(x, 'label');
    return { scene, fx, cam: CAM([[1.05, 1.5, 0.05], [1.0, 1.47, -0.02]], [[0.8, 1.38, -0.7]], 46), upd(t) { rl.userData.tick(t); },
      ov(o, t) { plateText(o, 'RUSHLIGHT', CX, 28, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); const p = L.toScreen(this.cam, C0.table.x + 0.32, C0.table.y + 0.73, C0.table.z + 0.05); popLabel(o, t, t0 + 0.6, 'RUSH + GREASE', 110, 200, 14, p);
        if (t >= tT) plateText(o, 'BURNS: 20 MIN', CX, 54, { size: 12, border: '#ff9a5a', fg: '#ffe0c8', scale: popS(t, tT) }); } }; });
  // ---- P26: the dark night, the diaries, first sleep, the midnight visit, the two sleeps ----
  function nightTown(scene) { mmlTown(scene, { preset: 'night', night: true }); nightGrade(scene); }
  SH([26, 'So'], 'M', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: false }); grade(scene, [0.12, 0.13, 0.3], { lit: true }); const tD = ws(26, 'dark');
    for (const x of [tD]) cue(x, 'label');
    return { scene, cam: CAM([[2.0, 2.4, 7.2], [1.6, 2.3, 6.6]], [[-1.0, 1.8, -3.0]], 54),
      ov(o, t) { if (t >= tD) plateText(o, 'REALLY, REALLY DARK', CX, 30, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tD) }); } }; });
  SH([26, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); const C0 = cellSet(scene); const tH = ws(26, 'hundreds');
    const pile = new THREE.Group(); pile.position.copy(C0.table); scene.add(pile); for (let i = 0; i < 9; i++) { const b = bookObj([0x7a2a1a, 0x2a4a6a, 0x5a4a2a][i % 3]); b.position.set(-0.35 + (i % 3) * 0.2, Math.floor(i / 3) * 0.04, -0.05 + (i % 2) * 0.05); b.rotation.y = i * 0.6; pile.add(b); }
    for (let i = 0; i < 6; i++) L.box(0.12, 0.002, 0.16, L.basic(null, 0xf4ecd0), 0.2 + (i % 2) * 0.1, 0.01 + i * 0.004, (i % 3) * 0.05 - 0.05, pile).rotation.y = i;
    for (const x of [tH]) cue(x, 'label');
    return { scene, cam: CAM([[0.9, 1.25, 0.25], [0.8, 1.2, 0.15]], [[0.5, 0.8, -0.75]], 42),
      ov(o, t) { plateText(o, 'ROGER EKIRCH, HISTORIAN', CX, 28, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tH) plateText(o, 'HUNDREDS OF DIARIES + LETTERS', CX, 54, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tH) }); } }; });
  SH([26, 'They'], 'C', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: true }); const tV = ws(26, 'neighbors');
    const vs = [['bank_teller', 'grey', -1.6, -2.4, 0.4], ['old_woman_sitting', 'brown', -0.6, -2.8, 0.1], ['art_student', 'violet', 0.9, -2.2, -0.5], ['homework_girl', 'blue', -2.5, -1.4, 1.0]].map(([id, v, x, z, ry]) => { const n = id === 'old_woman_sitting' ? L.libModel(id, id, v) : npc(id, id, v); n.position.set(x, 0, z); n.rotation.y = ry; scene.add(n); if (id === 'bank_teller') nightcap(n); return n; });
    const cs = [[-1.25, -2.2], [0.55, -2.0]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0.95, z); scene.add(g); L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), L.basic(null, 0xf4ecd8), 0, 0, 0, g); L.mesh(new THREE.ConeGeometry(0.02, 0.06, 5), L.basic(null, 0xffc040), 0, 0.09, 0, g);
      const p = new THREE.PointLight(0xffc070, 1.8, 3); p.position.set(x, 1.1, z); scene.add(p); return g; });
    nightGrade(scene, vs); cue(t0 + 0.2, 'crowd_murmur');
    for (const x of [tV]) cue(x, 'label');
    return { scene, cam: CAM([[0.2, 1.5, 1.6], [0.0, 1.45, 1.4]], [[-0.8, 1.0, -2.4]], 48), upd(t) { vs.forEach((n, i) => { if (n.walk) n.walk(0); }); },
      ov(o, t) { plateText(o, '00:00 - 01:00', CX, 26, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tV) plateText(o, 'VISITING THE NEIGHBORS', CX, 52, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tV) }); } }; });
  SH([26, 'They', 2], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true }); nightGrade(scene);
    const ch = hero(scene, { p: [0.75, 0, 0.5], ry: -0.7 }); const cdl = new THREE.Group(); scene.add(cdl); L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), L.basic(null, 0xf4ecd8), 0, 0, 0, cdl); const fl = L.mesh(new THREE.ConeGeometry(0.014, 0.045, 5), L.basic(null, 0xffc040), 0, 0.08, 0, cdl);
    const cp = new THREE.PointLight(0xffc070, 0, 3); scene.add(cp); const fp = V3([0, 0, 0]); const tF = ws(26, 'first'), tS = ws(26, 'second'), tLit = t0 + 32 / 30; cue(t0 + 9 / 30, 'match'); cue(tLit, 'candle_fizz');
    return { scene, cam: CAM([[1.6, 1.4, 1.9], [1.5, 1.38, 1.75]], [[0.6, 1.0, 0.3]], 44), upd(t) { ch.drive(t, [seg('light_candle', t0)], [[-99, 'half', 'neutral'], [tLit, 'happy', 'smile']]); scene.updateMatrixWorld(true); ch.fist('L', fp); cdl.position.copy(fp).add(V3([0, 0.08, 0])); fl.visible = q15(t) >= tLit; cp.position.copy(cdl.position); cp.intensity = fl.visible ? 2.4 : 0; },
      ov(o, t, c) { sunInWindow(o, this.cam, R0.win, 0.8, t - t0, 'moon'); const x0 = 90, w = 300, y = 214; c.fillStyle = '#141838'; c.fillRect(x0 - 2, y - 2, w + 4, 22); c.fillStyle = '#2e4a55'; c.fillRect(x0, y, w, 18);
        if (t >= tF) { c.fillStyle = '#6b6fd6'; c.fillRect(x0 + 10, y + 3, 120, 12); bitText(c, 'FIRST SLEEP', x0 + 70, y + 9, 1, '#ffffff', { outline: null }); }
        c.fillStyle = '#fdd941'; c.fillRect(x0 + 136, y + 3, 28, 12); if (t >= tS) { c.fillStyle = '#6b6fd6'; c.fillRect(x0 + 170, y + 3, 120, 12); bitText(c, 'SECOND SLEEP', x0 + 230, y + 9, 1, '#ffffff', { outline: null }); }
        bitText(c, 'DUSK', x0, y - 8, 1, '#c8f8ff'); bitText(c, '00:00', x0 + 150, y - 8, 1, '#fff2a0'); bitText(c, 'DAWN', x0 + w, y - 8, 1, '#c8f8ff'); } }; });
  // ---- P27: cheap light arrives: the lamps of the town come on one by one ----
  SH([27, 'Then'], 'M', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: true }); nightGrade(scene); const tO = ws(27, 'one'); cue(t0 + 0.4, 'click'); cue(t0 + 0.9, 'click');
    for (const x of [tO]) cue(x, 'label');
    return { scene, cam: CAM([[3.0, 2.0, 6.0], [2.6, 1.9, 5.4]], [[-0.4, 1.8, -2.8]], 54),
      ov(o, t) { plateText(o, 'CHEAP LIGHT', CX, 26, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tO) plateText(o, '2 SLEEPS  >  1 SLEEP', CX, 52, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tO) }); } }; });
  // ---- P29/P30: 1953 Chicago, the eyes move ----
  SH([29, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); labSet(scene); const F = new THREE.Group(); F.position.y = -0.6; scene.add(F); const bd = bed(F, { x: 0, z: 0, quilt: 0xd8d8d0, full: true });
    const sl = lieNpc(F, 'homework_girl', 'blue', 0, 0.56, 0.77); const sc = [npcAt(F, 'bank_teller', 'grey', 1.1, -0.3, -1.2), npcAt(F, 'art_student', 'teal', 1.2, 0.5, -1.6)]; const tW = ws(29, 'weird');
    for (const n of sc) n.walk(0);
    const fx = new FX(LW, LH).add('exclaim', { target: sc[0], offset: [0, 2.0, 0], t0: tW, dur: 99 }).add('exclaim', { target: sc[1], offset: [0, 2.0, 0], t0: tW + 0.15, dur: 99 });
    return { scene, fx, cam: CAM([[-1.0, 1.2, 2.4], [-0.9, 1.15, 2.2]], [[0.4, 0.2, -0.2]], 46),
      ov(o, t) { plateText(o, '1953 - CHICAGO', CX, 26, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); } }; });
  SH([30, 'So'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true }); const sl = lieNpc(scene, 'bank_teller', 'olive', -0.2, 0.56, 0.62); nightcap(sl); nightGrade(scene); const tM = ws(30, 'movie');
    const fx = new FX(LW, LH).add('thought', { target: sl, offset: [0.1, 0.3, -1.3], t0: tM, dur: 99, icon: 'sparkle' });
    return { scene, fx, cam: CAM([[0.9, 1.5, 1.1], [0.8, 1.45, 0.95]], [[-0.2, 0.6, -0.7]], 44),
      ov(o, t, c) { const e = Math.floor(t * 8) % 3; for (const ex of [200, 280]) { c.fillStyle = '#141838'; c.fillRect(ex - 18, 196, 36, 22); c.fillStyle = '#f4f0e4'; c.fillRect(ex - 16, 198, 32, 18); c.fillStyle = '#1a1a1a'; c.fillRect(ex - 6 + (e - 1) * 9, 201, 10, 12); }
        plateText(o, 'BODY: STILL  /  EYES: MOVING', CX, 26, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); } }; });
  // ---- P31: the drawer of moon pajamas; she holds one up ----
  SH([31, 'One'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [1.7, 0, 1.3], ry: 2.6 }); const pj = []; for (let i = 0; i < 4; i++) { const p = pajamasObj(); p.position.set(2.0 + i * 0.05, 0.3 + i * 0.03, 1.0); p.rotation.y = i; scene.add(p); pj.push(p); } cue(t0 + 0.3, 'drawer');
    for (const x of [ws(31, 'same')]) cue(x, 'label');
    return { scene, cam: CAM([[1.0, 0.9, 0.5], [1.05, 0.88, 0.55]], [[2.0, 0.35, 1.0]], 44), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('kneel', -99, { from: 1.5, speed: 0 })], [[-99, 'surprised', 'gasp']]); },
      ov(o, t) { const tS = ws(31, 'same'); if (t >= tS) plateText(o, 'MORE OF THE SAME', CX, 30, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tS) }); } }; });
  SH([31, 'This'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.2, 0, 1.0], ry: 0.2 }); const pj = pajamasObj(); pj.scale.setScalar(1.4); scene.add(pj); const fp = V3([0, 0, 0]);
    const fx = new FX(LW, LH).add('heart', { obj: ch.root, bone: 'Head', offset: [0.2, 0.4, 0], t0: t0 + 0.6, dur: 99 });
    for (const x of [t0 + 0.3]) cue(x, 'label');
    return { scene, fx, cam: CAM([[0.3, 1.25, 2.6], [0.3, 1.22, 2.4]], [[0.2, 1.05, 0.9]], 40), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('hold_up_object', t0 - 0.3)], [[-99, 'happy', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); pj.position.copy(fp).add(V3([0, 0.1, 0.05])); },
      ov(o, t) { plateText(o, 'FAVORITE: CONFIRMED', CX, 30, { size: 12, border: '#ff80c0', fg: '#ffe0f0', scale: popS(t, t0 + 0.3) }); } }; });
  // ---- P33: before pajamas, the long nightshirt ----
  SH([33, 'Before'], 'C', (t0) => { const scene = new THREE.Scene(); tudorRoom(scene); const ns = nightshirt(); ns.position.set(-0.4, 2.2, -0.68); scene.add(ns); L.box(0.04, 0.04, 0.12, litM(null, 0x4a2a14), -0.4, 2.22, -0.66, scene);
    const ch = hero(scene, { p: [0.55, 0, 0.3], ry: -0.7 }); const tN = ws(33, 'nightshirt');
    for (const x of [tN]) cue(x, 'label');
    return { scene, cam: CAM([[0.6, 1.5, 2.6], [0.5, 1.45, 2.4]], [[-0.1, 1.3, -0.4]], 46), upd(t) { ch.drive(t, [seg('point', t0 - 0.1)], [[-99, 'happy', 'smileOpen']]); },
      ov(o, t) { plateText(o, 'BEFORE: EUROPE', CX, 26, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tN) { const p = L.toScreen(this.cam, -0.4, 1.6, -0.66); popLabel(o, t, tN, 'NIGHTSHIRT', 110, 70, 14, p); } } }; });
  // ---- P34: the nightstand today ----
  SH([34, 'Today'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const gw = glassWater(); gw.position.set(-0.86, 0.55, -1.42); scene.add(gw); const bk = bookObj(); bk.position.set(-0.75, 0.55, -1.5); bk.rotation.y = 0.3; scene.add(bk);
    const its = [['phone', -0.62, 0.57, -1.48], ['water', -0.86, 0.62, -1.42], ['book', -0.75, 0.58, -1.5]].map(([w, ...p]) => [ws(34, w), p, w.toUpperCase()]); const tN = ws(34, 'finishes');
    for (const x of [tN]) cue(x, 'label');
    return { scene, cam: CAM([[-0.2, 1.0, -0.75], [-0.25, 0.98, -0.85]], [[-0.75, 0.55, -1.5]], 40), upd(t) { D.ll.userData.tick(t); },
      ov(o, t) { its.forEach(([tw, p, s], i) => { if (t < tw) return; const sp = L.toScreen(this.cam, ...p); popLabel(o, t, tw, s, 70 + i * 160, 40, 12, sp); }); if (t >= tN) plateText(o, 'PAGE 12 / 400', CX, 230, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tN) }); } }; });
  // ---- P35: a fancy French house: the cabinet called "commode"; today's toilet ----
  SH([35, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); tudorRoom(scene); const cab = new THREE.Group(); cab.position.set(0.2, 0, -0.4); scene.add(cab);
    const gold = litM(null, 0xd8b040); L.box(0.9, 0.7, 0.5, litM(L.rep(OAK, 0.6, 0.6), 0x7a3a1a), 0, 0.35, 0, cab); L.box(0.96, 0.05, 0.56, litM(null, 0xe8e0d0), 0, 0.72, 0, cab);
    for (const s of [-1, 1]) { L.box(0.04, 0.6, 0.04, gold, s * 0.44, 0.33, 0.26, cab); L.mesh(new THREE.SphereGeometry(0.025, 6, 4), gold, s * 0.12, 0.4, 0.27, cab); }
    const vase = L.mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.25, 8), litM(null, 0x3a6ab0), 0.25, 0.87, 0, cab); const tC = ws(35, 'commode');
    for (const x of [tC]) cue(x, 'label');
    return { scene, cam: CAM([[0.9, 1.3, 1.6], [0.8, 1.25, 1.4]], [[0.2, 0.5, -0.4]], 42),
      ov(o, t) { plateText(o, 'FRANCE: FANCY HOUSES', CX, 26, { size: 12, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tC) { const p = L.toScreen(this.cam, 0.2, 0.75, -0.4); popLabel(o, t, tC, '"COMMODE"', CX, 60, 16, p); } } }; });
  SH([35, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); tudorRoom(scene); const tl = modernToilet(); tl.position.set(0.1, 0, -0.35); scene.add(tl); const tC = ws(35, 'commode', 2);
    for (const x of [tC]) cue(x, 'label');
    return { scene, cam: CAM([[0.7, 1.2, 1.4], [0.6, 1.15, 1.25]], [[0.1, 0.45, -0.35]], 44),
      ov(o, t) { if (t >= tC) plateText(o, 'TOILET = COMMODE', CX, 30, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tC) }); } }; });
  // ---- P36: not touching it ----
  SH([36, 'Your'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [-1.25, 0, -1.0], ry: 2.4 }); const tT = ws(36, 'touching'); cue(tT, 'step_back');
    for (const x of [tT]) cue(x, 'label');
    return { scene, cam: CAM([[-0.1, 1.25, -0.85], [-0.15, 1.22, -0.88]], [[-1.25, 0.95, -1.0]], 48), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('step_back', tT - 0.2, { fade: 0.1 })], [[-99, 'open', 'neutral'], [tT, 'disgust', 'disgust']]); },
      ov(o, t) { if (t >= tT) plateText(o, 'NOT TOUCHING IT', CX, 30, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tT) }); } }; });
  // ---- P38: Max Negwer, 1907 ----
  SH([38, 'Then'], 'C', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'morning' }); const mx = npcAt(scene, 'bank_teller', 'grey', -0.9, -2.4, 0.3); mx.walk(0); const tS = ws(38, 'selling'), tC = ws(38, 'company');
    const tin = new THREE.Group(); tin.position.set(-0.55, 1.05, -2.2); scene.add(tin); L.mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), litM(null, 0xd8c040), 0, 0, 0, tin);
    for (const x of [tS, tC]) cue(x, 'label');
    return { scene, cam: CAM([[0.6, 1.5, 0.6], [0.5, 1.45, 0.4]], [[-0.8, 1.1, -2.4]], 46), upd(t) { tin.rotation.y = q15(t); },
      ov(o, t) { plateText(o, '1907 - MAX NEGWER, PHARMACIST', CX, 26, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tS) plateText(o, 'WAX EARPLUGS: ON SALE', CX, 52, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tS) });
        if (t >= tC) plateText(o, 'STILL SELLING TODAY', CX, 230, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tC) }); } }; });
  // ---- P39: used a lot; somebody snored ----
  SH([39, 'My'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const tS = ws(39, 'snored'); cue(t0 + 0.1, 'scan');
    const fx = new FX(LW, LH).add('shake', { world: [0.3, 0.7, -1.5], t0: tS, dur: 99 });
    for (const x of [tS]) cue(x, 'label');
    return { scene, fx, cam: CAM([[-0.5, 0.75, -1.15], [-0.52, 0.73, -1.22]], [[-0.68, 0.56, -1.42]], 38), upd(t) { D.ll.userData.tick(t); },
      ov(o, t) { const p = L.toScreen(this.cam, -0.68, 0.57, -1.42); hudBox(o, p[0] - 30, p[1] - 20, p[0] + 30, p[1] + 20, '#7cf0ff'); plateText(o, 'WEAR: 97%', CX, 30, { size: 12, border: '#ffd93b', fg: '#fff2a0' });
        if (t >= tS) plateText(o, 'CAUSE: SNORING (Z Z Z)', CX, 230, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tS) }); } }; });
  // ---- P40/P41: the phone: alarm 6:30 snoozed x8; everything in one object; glow in bed ----
  SH([40, 'Its'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const tS = ws(40, 'snoozed'); cue(tS, 'snooze_beep');
    return { scene, cam: CAM([[-0.55, 0.78, -1.32], [-0.57, 0.75, -1.38]], [[-0.62, 0.56, -1.48]], 34), upd(t) { D.ll.userData.tick(t); },
      ov(o, t, c) { cham(c, 170, 60, 140, 150, 6, '#141418'); c.fillStyle = '#1a2a5a'; c.fillRect(178, 70, 124, 130); bitText(c, '6:30', CX, 110, 4, '#ffffff', { outline: null }); bitText(c, 'ALARM', CX, 86, 1, '#9cc8ff', { outline: null });
        const n = t >= tS ? Math.min(8, 1 + Math.floor((t - tS) / 0.12)) : 0; if (n) { c.fillStyle = '#d83030'; c.fillRect(200, 150, 80, 20); bitText(c, 'SNOOZE x' + n, CX, 160, 1, '#ffffff', { outline: null }); } } }; });
  SH([41, 'The'], 'C', (t0) => { const scene = new THREE.Scene(); labSet(scene); const ch = heroAside(scene, { p: [-1.3, -0.6, 0.6], ry: 0.6 }); const ws5 = ['alarm', 'clock', 'lamp', 'radio', 'story'].map((w) => ws(41, w));
    return { scene, cam: CAM([[0, 1.0, 3.0]], [[0, 0.8, 0]], 44), upd(t) { ch.drive(t, [seg('talk_gesture', -99, { loop: true })], [[-99, 'open', 'smile']]); },
      ov(o, t, c) { cham(c, 236, 46, 110, 180, 8, '#141418'); c.fillStyle = '#1a2a5a'; c.fillRect(246, 58, 90, 156); ['ALARM', 'CLOCK', 'LAMP', 'RADIO', 'STORY'].forEach((s, i) => { if (t < ws5[i]) return; const y = 72 + i * 28; c.fillStyle = ['#d83030', '#fdd941', '#ffe0a0', '#4cd060', '#7cf0ff'][i]; c.fillRect(254, y - 8, 16, 16); bitText(c, s, 306, y, 1, '#ffffff', { outline: null }); });
        plateText(o, '1 OBJECT = 5 OBJECTS', 290, 26, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); } }; });
  SH([41, 'Humans'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true }); const sl = lieNpc(scene, 'art_student', 'teal', -0.2, 0.56, 0.62, { roll: 0.3 }); nightGrade(scene);
    const ph = phone(); ph.position.set(-0.05, 0.72, -0.75); ph.rotation.set(-1.2, 0, 0); scene.add(ph); const glow = new THREE.PointLight(0x9ac8ff, 2.2, 1.6); glow.position.set(-0.1, 0.75, -0.6); scene.add(glow); const tW = ws(41, 'wondered');
    const fx = new FX(LW, LH).add('question', { target: sl, offset: [0.1, 0.4, -1.2], t0: tW, dur: 99 });
    for (const x of [tW]) cue(x, 'label');
    return { scene, fx, cam: CAM([[0.8, 1.3, 0.6], [0.7, 1.25, 0.5]], [[-0.2, 0.6, -0.7]], 44),
      ov(o, t) { if (t >= tW) plateText(o, "WHY CAN'T I SLEEP?", CX, 30, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tW) }); } }; });
  // ---- P42: dried peas: she tries the pea shooter at the inn window ----
  SH([42, 'or'], 'C', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: true }); const ch = hero(scene, { p: [-4.6, 0, -1.4], ry: Math.PI - 0.25 }); nightGrade(scene, [ch]); const tP = ws(42, 'peas'); cue(tP, 'pea_shot'); cue(tP + 0.35, 'tap_glass');
    const lit = L.plane(0.62, 0.82, L.basic(null, 0xffc870), -5.85, 3.41, -3.44, scene); lit.visible = false; const pea = L.mesh(new THREE.SphereGeometry(0.03, 5, 4), L.basic(null, 0x7ac040), 0, 0, 0, scene); const a = V3([-4.55, 1.45, -1.75]), b = V3([-5.85, 3.41, -3.44]);
    return { scene, cam: CAM([[-2.6, 1.3, 1.2], [-2.7, 1.3, 1.0]], [[-5.2, 2.2, -2.8]], 50), upd(t) { const q = q15(t), k = (q - tP) / 0.35; pea.visible = k >= 0 && k < 1; pea.position.copy(a).lerp(b, clamp01(k)); lit.visible = q >= tP + 0.9; ch.drive(t, [seg('blow_tube', t0 - 0.1)], [[-99, 'open', 'neutral'], [tP + 0.9, 'happy', 'smileOpen']]); },
      ov(o, t) { plateText(o, 'OR: DRIED PEAS', CX, 26, { size: 12, border: '#9cf09c', fg: '#e0ffe0' }); } }; });
  // ---- P44: 14 hours of sleep; the record no longer tracked ----
  SH([44, 'He', 3], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'morning', wx: 0.9 }); const bd = bed(scene, { x: -0.2, z: -0.15, full: true }); const sl = lieNpc(scene, 'art_student', 'teal', -0.2, 0.56, 0.62); const tR = ws(44, 'recovered');
    const fx = new FX(LW, LH).add('thought', { target: sl, offset: [0.1, 0.3, -1.3], t0, dur: 99 });
    for (const x of [tR]) cue(x, 'label');
    return { scene, fx, cam: CAM([[1.2, 1.5, 1.5], [1.1, 1.45, 1.35]], [[-0.2, 0.6, -0.5]], 46),
      ov(o, t) { plateText(o, 'SLEEP: 14 H', CX, 26, { size: 14, border: '#7cf0ff', fg: '#c8f8ff' }); if (t >= tR) plateText(o, 'RECOVERED', CX, 52, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tR) }); } }; });
  // ---- P47: the conclusion: a glowing rectangle next to the pillow ----
  SH([47, 'So'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.2, 0, 1.0], ry: 0.3 });
    return { scene, cam: CAM([[0.6, 1.3, 2.6], [0.55, 1.28, 2.4]], [[0.2, 1.0, 0.9]], 46), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('talk_gesture', -99, { loop: true })], [[-99, 'open', 'smile']]); },
      ov(o, t, c) { const st = ['grass', 'straw', 'springs', 'foam'].map((w) => ws(47, w)); ['GRASS', 'STRAW', 'SPRINGS', 'FOAM'].forEach((s, i) => { if (t >= st[i]) plateText(o, s, 70 + i * 113, 30, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, st[i]) }); }); } }; });
  SH([47, 'And'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const glow = new THREE.PointLight(0x9ac8ff, 2.4, 1.4); glow.position.set(-0.55, 0.75, -1.4); scene.add(glow); const tA = ws(47, 'awake');
    for (const x of [tA]) cue(x, 'label');
    return { scene, cam: CAM([[0.1, 0.85, -0.9], [0.05, 0.82, -1.0]], [[-0.55, 0.58, -1.5]], 40), upd(t) { D.ll.userData.tick(t); glow.intensity = 2.0 + 0.4 * Math.sin(q15(t) * 3); },
      ov(o, t) { if (t >= tA) plateText(o, 'KEEPS YOU AWAKE', CX, 30, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tA) }); } }; });
  // ---- P48: the lava lamp close-up; she tilts her head ----
  SH([48, 'A'], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const tU = ws(48, 'up'), tD = ws(48, 'down');
    for (const x of [tU, tD]) cue(x, 'label');
    return { scene, cam: CAM([[0.95, 0.14, -0.88], [0.85, 0.14, -0.88]], [[0.5, 0.11, -0.9]], 36), upd(t) { D.ll.userData.tick(t); },
      ov(o, t) { if (t >= tU) plateText(o, 'UP...', 140, 40, { size: 12, border: '#ff80c0', fg: '#ffe0f0', scale: popS(t, tU) }); if (t >= tD) plateText(o, '...DOWN', 340, 230, { size: 12, border: '#ff80c0', fg: '#ffe0f0', scale: popS(t, tD) }); } }; });
  SH([48, 'It', 2], 'C', (t0) => { const scene = new THREE.Scene(); const D = dungeon(scene); const ch = hero(scene, { p: [0.2, 0, 1.1], ry: -0.3 }); const glow = new THREE.PointLight(0xff60c0, 2.5, 3); glow.position.set(0.6, 0.4, -0.7); scene.add(glow);
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.15, 0.42, 0], t0: t0 + 0.3, dur: 99 });
    const no = [['light', 'LIGHT: NO'], ['time', 'TIME: NO'], ['sound', 'SOUND: NO']].map(([w, s]) => [ws(48, w), s]);
    return { scene, fx, cam: CAM([[0.7, 1.3, 2.6], [0.65, 1.28, 2.45]], [[0.2, 1.0, 1.0]], 42), upd(t) { D.ll.userData.tick(t); ch.drive(t, [seg('think', t0 - 0.1)], [[-99, 'open', 'neutral']]); },
      ov(o, t) { no.forEach(([tw, s], i) => { if (t >= tw) plateText(o, s, 100 + i * 140, 230, { size: 12, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tw) }); }); } }; });

  // ---- alternate angles / page zooms of the long shots (continuations in time) ----
  alt(bAt(9, 'Two'), [9, 'humans'], { p: [[-1.2, 0.9, 0.9], [-1.1, 0.85, 0.8]], l: [[0.3, 0.6, -0.6]], fov: [44] });
  alt(bAt(13, 'The'), [13, 'They'], { p: [[1.7, 1.3, 1.6], [1.6, 1.28, 1.5]], l: [[0.7, 1.0, 0.0]], fov: [42] });
  alt(bAt(15, 'And'), [15, 'The', 2], { p: [[0, 1.0, 3.0]], l: [[0, 0.8, 0]], fov: [44] }, { zoom: { cx: 315, cy: 125, z: 1.5 } });
  alt(bAt(18, 'had'), [18, 'Adams', 2], { p: [[-1.0, 1.5, 1.9], [-0.95, 1.48, 1.8]], l: [[0.6, 1.3, -0.5]], fov: [46] });
  alt(bAt(20, 'Human'), [21, 'When'], null, { zoom: { cx: 290, cy: 140, z: 1.6 } });
  alt(bAt(20, 'Human'), [21, 'In'], null);
  alt(bAt(20, 'Human'), [22, 'So'], null, { zoom: { cx: 300, cy: 150, z: 1.4 } });
  alt(bAt(25, 'Before'), [25, 'Poor'], { p: [[0.3, 1.1, 0.6], [0.35, 1.08, 0.5]], l: [[0.75, 1.05, -0.7]], fov: [42] });
  alt(bAt(28, 'Human'), [29, 'Sleep'], null, { zoom: { cx: 300, cy: 140, z: 1.5 } });
  alt(bAt(28, 'Human'), [29, 'They'], null, { zoom: { cx: 300, cy: 200, z: 1.6 } });
  alt(bAt(31, 'Back'), [31, 'The'], { p: [[2.8, 1.2, 2.3], [2.7, 1.15, 2.15]], l: [[1.8, 0.5, 0.9]], fov: [46] });
  alt(bAt(33, 'The'), [33, 'Leg', 2], null, { zoom: { cx: 305, cy: 110, z: 1.5 } });
  alt(bAt(35, 'But'), [35, 'A'], { p: [[1.6, 1.4, 1.5], [1.5, 1.38, 1.4]], l: [[0.6, 0.8, -0.2]], fov: [46] });
  alt(bAt(38, 'The'), [38, 'In', 2], null, { zoom: { cx: 315, cy: 140, z: 1.45 } });
  alt(bAt(42, 'Operators'), [42, 'Before'], { p: [[-6.9, 1.3, 0.4], [-6.8, 1.3, 0.3]], l: [[-5.5, 2.2, -2.6]], fov: [50] });
  alt(bAt(42, 'Operators'), [42, 'And'], { p: [[-2.0, 1.6, 2.8]], l: [[-5.2, 2.0, -3.0]], fov: [54] });
  alt(bAt(43, 'Human'), [44, 'In'], null, { zoom: { cx: 260, cy: 120, z: 1.6 } });
  alt(bAt(43, 'Human'), [44, 'By', 2], null, { zoom: { cx: 330, cy: 110, z: 1.5 } });
  alt(bAt(43, 'Human'), [45, 'Dolphins'], null, { zoom: { cx: 330, cy: 190, z: 1.6 } });
  alt(bAt(46, 'Let'), [46, 'Grass'], null, { zoom: { cx: 225, cy: 110, z: 1.35 } });
  alt(bAt(46, 'Let'), [46, 'a'], null);

  S.sort((a, b) => wi(a.at[0], a.at[1], a.at[2] || 1) - wi(b.at[0], b.at[1], b.at[2] || 1));

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
    SHOTS.push({ t0, hard: s.mode === 'C', ...b, update: (lt, t) => b.update(lt, t ?? t0 + lt), name: `#${i + 1}`, at: s.at });
    if (s.mode === 'M' && i > 0) cue(t0, 'mosaic');
  });
  window.FILM = { dur: END, fps: 30, frames: Math.ceil(END * 30), shots: SHOTS.map((s) => [s.name, +s.t0.toFixed(3), s.hard, s.at]) };
  window.WORDS_OVERRIDE = W.map(([c, s, e]) => [s, e, c]);
}


