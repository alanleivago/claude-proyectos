// sets/r2kit.js — small shared helpers for the round-2 sets (breakroom.js, cells.js, records.js). Not a set itself
// (film.js only imports the sets named in shots.json). Same helpers as kennel.js/basement.js, plus a walker that keeps
// Ava's feet planted (walk clip: 1.0 s loop, ~0.85 m/s at speed 1, foot contacts at clip phase 0.08 and 0.58) and
// exports the matching footstep times.
import { reText as bitText, reWidth as textWidth } from '../refont.js';
export { bitText, textWidth };

export const WALK_V = 0.85;                 // m/s of the walk clip at speed 1 (measured on FootL/FootR)
export const WALK_CONTACT = [0.08, 0.58];   // clip phase of each heel strike

/** path walker: pts [[x,z],...], starts at global t0, clip speed k. at(t) -> {x, z, yaw, moving}; steps() -> global times */
export function walker(pts, t0, k = 1, from = 0) {
  const v = WALK_V * k, segs = []; let tot = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], l = Math.hypot(bx - ax, bz - az); segs.push([ax, az, bx, bz, l, tot]); tot += l; }
  const t1 = t0 + tot / v;
  return {
    t0, t1, k, from, len: tot,
    at(t) {
      const d = Math.min(tot, Math.max(0, (t - t0) * v));
      let s = segs[segs.length - 1]; for (const g of segs) if (d <= g[5] + g[4]) { s = g; break; }
      const u = s[4] > 0 ? (d - s[5]) / s[4] : 0;
      return { x: s[0] + (s[2] - s[0]) * u, z: s[1] + (s[3] - s[1]) * u, yaw: Math.atan2(s[2] - s[0], s[3] - s[1]), moving: t >= t0 && t < t1 };
    },
    seg(T0, o = {}) { return { clip: 'walk', at: t0 - T0, loop: true, speed: k, from, ...o }; },
    steps(name = 'step_walk', tA = -1e9, tB = 1e9) {
      const out = [];
      for (let n = -2; n < 400; n++) for (const c of WALK_CONTACT) {
        const t = t0 + (c + n - from) / k; if (t >= t0 && t <= t1 + 0.05 && t >= tA && t < tB) out.push([+t.toFixed(3), name]);
      }
      return out.sort((a, b) => a[0] - b[0]);
    },
  };
}

export function kit(ctx, { mute = [] } = {}) {
  const { L, TL } = ctx;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (a, b, c) => `rgb(${Math.max(0, Math.min(255, a | 0))},${Math.max(0, Math.min(255, b | 0))},${Math.max(0, Math.min(255, c | 0))})`;
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const basic = (t, col = 0xffffff, extra) => L.basic(t, col, extra);
  const DS = THREE.DoubleSide;
  // Ava's mouth follows the voice track, but not while another voice (Marla) is speaking
  const muteSpans = mute.map((id) => [ctx.at(id, 0) - 0.06, ctx.endOf(id, -1) + 0.06]);
  const mouthAt = (t, base) => {
    if (muteSpans.some(([a, b]) => t >= a && t <= b)) return base;
    const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base;
  };
  const cam = (fov, near = 0.02) => new THREE.PerspectiveCamera(fov, LW / LH, near, 60);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const vignette = (o, k = 0.4, r0 = 0.32) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * r0, LW / 2, LH * 0.45, LH * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  function line(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 2000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  /** RE-style label box centred at (cx, cy), optional leader to tgt [x, y]; k = 0..1 fade-in from black */
  function label(o, text, cx, cy, col, tgt, k = 1, sc = 1) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n'), lh = sc === 2 ? 17 : 13;
    const tw = Math.max(...lines.map((s) => textWidth(s, sc)));
    const w = Math.round(tw + 12), h = lines.length * lh + 9, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', '#f4f4f4', k);
    if (tgt) { const ty = tgt[1] > y + h ? y + h - 1 : y; line(c, cx, ty, tgt[0], tgt[1], bc); c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + 5 + Math.round(lh / 2) + i * lh, sc, fc, { outline: null }));
  }
  const pop = (lt, t, d = 0.1) => L.clamp01((lt - t) / d);

  // ---------- textures ----------
  const tConcrete = (seed = 901, base = [128, 126, 118]) => L.cvs(64, 64, (c, w, h) => {
    const rr = L.rng(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 14 - 7 + 5 * Math.sin(x * 0.21 + y * 0.07); px(c, x, y, rgb(base[0] + n, base[1] + n, base[2] + n)); }
    for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(70,64,52,0.22)'; c.beginPath(); c.ellipse(rr() * 64, rr() * 64, 4 + rr() * 8, 3 + rr() * 5, rr() * 3, 0, 7); c.fill(); }
    px(c, 0, 0, '#66645c', w, 1); px(c, 0, 0, '#66645c', 1, h);
  });
  const tBlock = (seed, lo, hi, split) => L.cvs(64, 64, (c, w, h) => {   // painted cinder block, two-tone
    const rr = L.rng(seed), A = hexRGB(lo), Bc = hexRGB(hi);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const col = y >= split ? A : Bc, row = y >> 3, mort = (y % 8 === 0) || ((x + (row & 1) * 16) % 32 === 0), n = rr() * 12 - 6, k = mort ? 0.74 : 1;
      px(c, x, y, rgb((col[0] + n) * k, (col[1] + n) * k, (col[2] + n) * k));
    }
    px(c, 0, split - 1, '#2a2a26', w, 1);
  });
  const tMetal = (seed, base) => L.cvs(32, 32, (c, w, h) => {
    const rr = L.rng(seed), A = hexRGB(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 14 - 7; px(c, x, y, rgb(A[0] + n, A[1] + n, A[2] + n)); }
    for (let k = 0; k < 6; k++) px(c, rr() * 30 | 0, rr() * 30 | 0, '#c8ccd0', 1 + (rr() * 4 | 0), 1);
    for (let k = 0; k < 5; k++) px(c, rr() * 30 | 0, rr() * 30 | 0, '#7a4a2a', 1, 1);
  });
  const tTile = (seed, a, b) => L.cvs(64, 64, (c) => {   // 9" vinyl floor tiles, two tones, scuffs
    const rr = L.rng(seed), A = hexRGB(a), Bc = hexRGB(b);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const t = ((x >> 4) + (y >> 4)) & 1 ? A : Bc, n = rr() * 10 - 5, g = (x % 16 === 0 || y % 16 === 0) ? 0.8 : 1; px(c, x, y, rgb((t[0] + n) * g, (t[1] + n) * g, (t[2] + n) * g)); }
    for (let k = 0; k < 10; k++) px(c, rr() * 62 | 0, rr() * 62 | 0, 'rgba(40,36,30,0.35)', 2 + (rr() * 5 | 0), 1);
  });
  const tWood = (seed, base = '#8a5a32') => L.cvs(32, 64, (c, w, h) => {
    const rr = L.rng(seed), A = hexRGB(base);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const g = Math.sin(x * 0.9 + Math.sin(y * 0.13 + x * 0.2) * 2.2) * 9, n = rr() * 8 - 4; px(c, x, y, rgb(A[0] + g + n, A[1] + g * 0.7 + n, A[2] + g * 0.4 + n)); }
  });
  const tGlow = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const tBeam = L.cvs(16, 32, (c) => { for (let y = 0; y < 32; y++) { const a = 0.3 * (y / 32); const g = c.createLinearGradient(0, 0, 16, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, `rgba(255,244,210,${a})`); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, y, 16, 1); } });
  const tFluor = L.cvs(16, 32, (c) => { c.fillStyle = '#d8dcd8'; c.fillRect(0, 0, 16, 32); c.fillStyle = '#ffffff'; c.fillRect(3, 1, 3, 30); c.fillRect(10, 1, 3, 30); c.fillStyle = '#9aa0a0'; for (let y = 0; y < 32; y += 4) c.fillRect(0, y, 16, 1); });

  /** ceiling fluorescent fixture (bright, unlit material) */
  function fluor(scene, x, y, z, w = 0.3, l = 1.2, ry = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
    B(w + 0.04, 0.05, l + 0.04, lam(null, 0x8a8c88), 0, 0.01, 0, g);
    L.plane(w, l, basic(tFluor, 0xffffff), 0, -0.016, 0, g, 0, Math.PI / 2);
    return g;
  }

  /** flashlight held in Ava's right hand + spot + additive cone (kennel.js) */
  function flashlight(ch, scene) {
    const torch = new THREE.SpotLight(0xfff0c8, 0, 10, 0.36, 0.5, 1.1); scene.add(torch, torch.target);
    const fl = new THREE.Group();
    { const mB = lam(null, 0x1a1a1c); cyl(0.016, 0.016, 0.13, 8, mB, 0, 0, 0, fl).rotation.z = Math.PI / 2;
      cyl(0.026, 0.018, 0.05, 8, mB, 0.08, 0, 0, fl).rotation.z = Math.PI / 2;
      cyl(0.022, 0.022, 0.004, 8, basic(null, 0xfff6c0), 0.106, 0, 0, fl).rotation.z = Math.PI / 2; }
    L.holdIn(ch, fl, 'R', [0, 0.75, 0.22], [0, 0, Math.PI / 2]);   // torch axis (+X) along the hand bone (+Y): lens past the fingers
    const lensGlow = L.plane(0.07, 0.07, basic(tGlow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0, 0, scene);
    const beam = L.mesh(new THREE.ConeGeometry(0.55, 3.4, 12, 1, true), basic(tBeam, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: DS }), 0, 0, 0, scene);
    // ---- aim: right arm raised forward, driven toward the lit target (shoulder rotation solved so the torch axis hits it)
    const UA = ch.bone.getObjectByName('UpperArmR'), FA = ch.bone.getObjectByName('ForearmR'), HD = ch.bone.getObjectByName('HandR');
    const restUA = UA.quaternion.clone(), FA_AIM = FA.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), -0.32)), HD_AIM = HD.quaternion.clone();
    let saved = null;
    const lensAndDir = () => { fl.updateMatrixWorld(true); const lp = fl.localToWorld(V(0.11, 0, 0)); return [lp, fl.localToWorld(V(1.11, 0, 0)).sub(lp).normalize()]; };
    /** undo last aim (call BEFORE ch.pose: the mixer skips bones whose clip value did not change) */
    function unaim() { if (saved) { UA.quaternion.copy(saved[0]); FA.quaternion.copy(saved[1]); HD.quaternion.copy(saved[2]); saved = null; } }
    /** call AFTER ch.pose / ch.lookAt: w = 0 clip arm, 1 arm aimed at target (yaw/pitch clamped to a reachable cone) */
    function aim(target, w = 1) {
      if (w <= 0) return;
      saved = [UA.quaternion.clone(), FA.quaternion.clone(), HD.quaternion.clone()];
      FA.quaternion.copy(FA_AIM); HD.quaternion.copy(HD_AIM); UA.quaternion.copy(restUA);
      ch.root.updateMatrixWorld(true);
      // wanted direction in Ava's frame (she faces +Z): clamp so the right arm never points behind her
      const inv = new THREE.Quaternion(); ch.root.getWorldQuaternion(inv); const rootQ = inv.clone(); inv.invert();
      const sh = UA.getWorldPosition(V());
      for (let it = 0; it < 5; it++) {
        const [lp, d] = lensAndDir();
        const wl = target.clone().sub(it ? lp : sh).applyQuaternion(inv).normalize();
        const yaw = Math.max(-1.25, Math.min(1.25, Math.atan2(wl.x, wl.z))), pit = Math.max(-1.0, Math.min(0.6, Math.asin(Math.max(-1, Math.min(1, wl.y)))));
        const want = V(Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)).applyQuaternion(rootQ);
        const R = new THREE.Quaternion().setFromUnitVectors(d, want);
        const qw = UA.getWorldQuaternion(new THREE.Quaternion()), pw = UA.parent.getWorldQuaternion(new THREE.Quaternion());
        UA.quaternion.copy(pw.invert().multiply(R.multiply(qw)));
        UA.updateMatrixWorld(true);
      }
      if (w < 1) { UA.quaternion.slerpQuaternions(saved[0], UA.quaternion.clone(), w); FA.quaternion.slerpQuaternions(saved[1], FA_AIM, w); HD.quaternion.slerpQuaternions(saved[2], HD_AIM, w); }
      ch.root.updateMatrixWorld(true);
    }
    /** light ON from the prop itself: spot + cone follow the torch's world position and forward axis (target = only the throw) */
    function on(isOn, c, target, k = 1, cone = true, power = 14) {
      ch.root.updateMatrixWorld(true);
      const [lp, d] = lensAndDir(), far = Math.max(1, target ? target.distanceTo(lp) : 3);
      torch.intensity = isOn ? power * k : 0; torch.position.copy(lp); torch.target.position.copy(lp).addScaledVector(d, far); torch.target.updateMatrixWorld();
      lensGlow.visible = isOn; lensGlow.position.copy(lp); lensGlow.lookAt(c.position);
      beam.visible = isOn && cone && k > 0.05;
      if (beam.visible) { beam.position.copy(lp).addScaledVector(d, 1.7); beam.quaternion.setFromUnitVectors(V(0, -1, 0), d); beam.material.opacity = k; }
    }
    return { fl, torch, beam, lensGlow, on, aim, unaim, hide() { fl.visible = false; torch.intensity = 0; lensGlow.visible = false; beam.visible = false; }, show() { fl.visible = true; } };
  }

  /** decaying rattle offset for an object hit at the given local times (only hit objects shake) */
  const rattle = (lt, hits, amp = 0.012, dur = 0.45, hz = 31) => {
    let s = 0; for (const h of hits) { const u = lt - h; if (u >= 0 && u < dur) s += Math.sin(u * hz * 6.283) * amp * (1 - u / dur) ** 2; } return s;
  };

  return { THREE, LW, LH, V, px, rgb, hexRGB, mixHex, B, cyl, lam, basic, DS, mouthAt, cam, look, vignette, line, label, pop,
    tConcrete, tBlock, tMetal, tTile, tWood, tGlow, tBeam, fluor, flashlight, rattle };
}
