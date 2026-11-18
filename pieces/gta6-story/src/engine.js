// ---- engine: beat timeline (SCRIPT from comic_script.md) x shot specs (SHOTS) -> frame.
// A shot = a layered scene (plate + redrawn characters, depth parallax camera) drawn full-frame ([PARALLAX])
// or inside comic panels on a paper page ([PANELS]). Lettering is laid out per beat around the speakers' mouths.
const DUR = SCRIPT.length ? SCRIPT[SCRIPT.length - 1].t0 + SCRIPT[SCRIPT.length - 1].dur : 10;
window.TIMELINE = { width: W, height: H, fps: FPS, duration: DUR, frames: Math.round(DUR * FPS) };
const INK = '#120A12', PAPER = '#F4EEE4', TR = 0.5;
const img = (n) => ASSETS[n + '.webp'] || ASSETS[n + '.jpg'];
const who = (id) => (id.startsWith('cr_') ? id.slice(3) : id.split('_')[0]);

let PRINT = null;
function makePrint() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const id = g.createImageData(W, H), d = id.data; let s = 1234567;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const P = 7, ang = 0.5, ca = Math.cos(ang), sa = Math.sin(ang);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x * ca + y * sa) / P, v = (-x * sa + y * ca) / P, fu = u - Math.floor(u) - .5, fv = v - Math.floor(v) - .5;
    const dot = Math.sqrt(fu * fu + fv * fv) < .28 ? 1 : 0, i = (y * W + x) * 4, val = 128 + (dot ? -20 : 6) + (rnd() - .5) * 28;
    d[i] = d[i + 1] = d[i + 2] = val; d[i + 3] = 255;
  }
  g.putImageData(id, 0, 0); return c;
}
// ---------- characters: C(layer, centre x, height on screen, {yb bottom, flip, d depth, tint}) ----------
function C(id, cx, h, o = {}) { return Object.assign({ id, cx, h, yb: H + 30, d: 0.3 }, o); }
// layer px -> scene px for a character placement
function chXf(c) {
  const m = META[c.id], bw = m.box[2] - m.box[0], bh = m.box[3] - m.box[1], s = c.h / bh;
  const bx = (m.box[0] + m.box[2]) / 2;
  return { s, map: (x, y) => [c.cx + (c.flip ? -1 : 1) * (x - bx) * s, c.yb - (m.box[3] - y) * s], bx, m };
}
// ---------- camera inside a view rect: push-in + creep + optional focus (close-up) ----------
function camOf(S, T, t0, t1, view) {
  const [vx, vy, vw, vh] = view, k0 = Math.max(vw / W, vh / H);
  const z = (S.z || 1) * (1 + 0.055 * outCubic(lin(T, t0, t0 + 1.0)) + 0.02 * lin(T, t0 + 1.0, t1));
  let F = [W / 2, H / 2];
  if (S.f) F = S.f.length === 2 ? S.f : (() => {   // [x, y] scene px, or [chIndex, rx, ry] relative to the char's box
    const c = S.ch[S.f[0]], X = chXf(c), m = X.m;
    return X.map(m.box[0] + (m.box[2] - m.box[0]) * S.f[1], m.box[1] + (m.box[3] - m.box[1]) * S.f[2]);
  })();
  const pan = (S.pan || 0) * lin(T, t0, t1);
  const lift = 10 * outCubic(lin(T, t0, t0 + 1));
  const at = (d) => {
    let k = k0 * Math.pow(z, 0.35 + 1.3 * d) * (d < 0.2 ? 1.02 : 1);
    if (S.free && d < 0.2) k = Math.max(k, vw / 2 / Math.min(F[0], W - F[0]), vh / 2 / Math.min(F[1], H - F[1]));   // plate grows to cover
    return { k, ox: vx + vw / 2 - F[0] * k + pan * (0.3 + d), oy: vy + vh / 2 - F[1] * k + lift * (0.3 + d) };
  };
  // the plate must cover the view: clamp it, and shift every layer by the same amount so they stay glued
  const b0 = at(0.12), cx = S.free ? 0 : Math.min(vx, Math.max(vx + vw - W * b0.k, b0.ox)) - b0.ox, cy = S.free ? 0 : Math.min(vy, Math.max(vy + vh - H * b0.k, b0.oy)) - b0.oy;
  return (d) => { const c = at(d); c.ox += cx; c.oy += cy; return c; };
}
// ---------- effects ----------
function fxPre(g, S, T, view) {}
function fxPost(g, S, T, view, cam) {
  const [vx, vy, vw, vh] = view, fx = S.fx || [], step = Math.floor(T * 12);
  const r = ltRand(step * 13 + 7);
  if (fx.includes('night')) { g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(70,60,130,0.55)'; g.fillRect(vx, vy, vw, vh); g.globalCompositeOperation = 'source-over'; }
  if (fx.includes('flicker')) { const on = (step % 17 === 3 || step % 23 === 9) ? 0.45 : 0; if (on) { g.fillStyle = `rgba(10,8,30,${on})`; g.fillRect(vx, vy, vw, vh); } }
  if (fx.includes('bars')) {                         // prison bars in the foreground, nearest depth
    const c = cam(1.0); g.fillStyle = '#1A1422';
    for (const bx of [90, 330, 1560, 1800]) { const x = c.ox + bx * c.k; g.fillRect(x, vy, 26 * c.k, vh); g.fillStyle = 'rgba(190,170,230,0.35)'; g.fillRect(x + 4 * c.k, vy, 5 * c.k, vh); g.fillStyle = '#1A1422'; }
    g.fillRect(vx, c.oy + 150 * c.k, vw, 22 * c.k);
  }
  if (fx.includes('police') || fx.includes('police_soft')) {
    const a = fx.includes('police') ? 0.3 : 0.16, ph = step % 4 < 2;
    const gr = g.createLinearGradient(vx, 0, vx + vw, 0);
    gr.addColorStop(0, ph ? `rgba(255,30,60,${a})` : 'rgba(0,0,0,0)'); gr.addColorStop(1, ph ? 'rgba(0,0,0,0)' : `rgba(40,90,255,${a})`);
    g.globalCompositeOperation = 'screen'; g.fillStyle = gr; g.fillRect(vx, vy, vw, vh); g.globalCompositeOperation = 'source-over';
  }
  if (fx.includes('rain')) {
    g.strokeStyle = 'rgba(220,230,255,0.35)'; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i < 140; i++) { const x = vx + r() * vw, y = vy + r() * vh; g.moveTo(x, y); g.lineTo(x - 10, y + 46); } g.stroke();
  }
  if (fx.includes('speed')) {
    g.strokeStyle = 'rgba(255,245,230,0.5)'; g.lineWidth = 3; g.beginPath();
    for (let i = 0; i < 26; i++) { const y = vy + r() * vh, x = vx + r() * vw; g.moveTo(x, y); g.lineTo(x + 180 + r() * 260, y); } g.stroke();
  }
  if (fx.includes('mist')) { const gr = g.createLinearGradient(0, vy + vh * 0.45, 0, vy + vh); gr.addColorStop(0, 'rgba(230,220,240,0)'); gr.addColorStop(1, 'rgba(230,220,240,0.45)'); g.fillStyle = gr; g.fillRect(vx, vy, vw, vh); }
  if (fx.includes('heli') || fx.includes('headlights')) {   // a light cone sweeping across, stepped
    const p = (T * (fx.includes('heli') ? 0.35 : 0.6)) % 1, x = vx + vw * (-0.2 + 1.4 * p);
    const gr = g.createRadialGradient(x, vy + vh * 0.55, 10, x, vy + vh * 0.55, vh * 0.6);
    gr.addColorStop(0, 'rgba(255,255,235,0.45)'); gr.addColorStop(1, 'rgba(255,255,235,0)');
    g.globalCompositeOperation = 'screen'; g.fillStyle = gr; g.fillRect(vx, vy, vw, vh); g.globalCompositeOperation = 'source-over';
  }
  if (fx.includes('red') || fx.includes('flashback')) {
    g.globalCompositeOperation = fx.includes('red') ? 'multiply' : 'color';
    g.fillStyle = fx.includes('red') ? 'rgba(230,40,60,0.75)' : 'rgba(170,120,80,0.85)'; g.fillRect(vx, vy, vw, vh); g.globalCompositeOperation = 'source-over';
  }
  if (fx.includes('dark')) { const gr = g.createLinearGradient(vx, 0, vx + vw, 0); gr.addColorStop(0.35, 'rgba(10,4,20,0)'); gr.addColorStop(0.75, 'rgba(10,4,20,0.85)'); g.fillStyle = gr; g.fillRect(vx, vy, vw, vh); }
}
// ---------- one scene inside a view; returns speaker anchors (screen px) ----------
function drawScene(g, S, T, t0, t1, view) {
  const cam = camOf(S, T, t0, t1, view), [vx, vy, vw, vh] = view;
  g.save(); g.beginPath(); g.rect(vx, vy, vw, vh); g.clip();
  const bc = cam(0.12); g.drawImage(img(S.bg), bc.ox, bc.oy, W * bc.k, H * bc.k);
  if (S.bgTint) { g.fillStyle = S.bgTint; g.fillRect(vx, vy, vw, vh); }
  const anchors = {};
  (S.ch || []).forEach((c, i) => {
    const cc = cam(c.d), X = chXf(c), m = X.m, I = img(c.id);
    const enter = c.enter ? outBack(lin(T, t0 + (c.delay || 0.2), t0 + (c.delay || 0.2) + 0.5)) : 1;
    const ex = c.enter === 'left' ? -W * 0.8 * (1 - enter) : c.enter === 'right' ? W * 0.8 * (1 - enter) : 0;
    const bob = Math.sin(T * 2.1 + i * 1.7) * 4;
    g.save(); g.translate(cc.ox + ex * cc.k, cc.oy + bob * cc.k); g.scale(cc.k, cc.k);
    g.translate(c.cx, c.yb); g.scale(c.flip ? -X.s : X.s, X.s); g.translate(-X.bx, -m.box[3]);
    if (c.alpha != null) g.globalAlpha = c.alpha;
    g.drawImage(I, 0, 0, m.w, m.h); g.restore();
    const [mx, my] = X.map(...m.mouth), fy = m.face ? X.map(m.face[0], m.face[1])[1] : my - 120 * X.s;
    anchors[who(c.id)] = anchors[who(c.id)] || { x: cc.ox + (mx + ex) * cc.k, y: cc.oy + (my + bob) * cc.k, top: cc.oy + fy * cc.k, s: X.s * cc.k };
  });
  if (S.ghost) S.ghost.forEach((n, i) => { g.globalAlpha = 0.28; g.globalCompositeOperation = 'screen'; g.drawImage(img(n), vx + (i ? vw * 0.5 : 0), vy, vw * 0.5, vh); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; });
  fxPost(g, S, T, view, cam);
  if (S.title) drawTitle(g, vx + vw * (S.title.x || 0.06), vy + vh * (S.title.y || 0.62), S.title.size || 170, lin(T, t0 + (S.title.at || 0.6), t0 + (S.title.at || 0.6) + 0.3));
  if (S.name) drawNamePlate(g, S.name, vx + 36, vy + vh - 60, lin(T, t0 + 0.5, t0 + 0.8));
  g.restore();
  return anchors;
}
// own title lettering (STYLE: heavy condensed caps, cream fill, near-black outline, plum shadow, -4 deg)
function drawTitle(g, x, y, size, p) {
  if (p <= 0) return; const s = outBack(clamp(p));
  g.save(); g.translate(x, y); g.rotate(-0.07); g.scale(s, s); g.font = `${size}px ${LT.F_SFX}`; g.lineJoin = 'round'; g.textBaseline = 'alphabetic';
  [['ONLY WAY', 0], ['OUT', 1]].forEach(([t, i]) => {
    const yy = i * size * 0.95, xx = i * size * 0.9;
    g.fillStyle = '#2a1036'; g.fillText(t, xx + 12, yy + 14);
    g.lineWidth = size * 0.17; g.strokeStyle = '#140818'; g.strokeText(t, xx, yy);
    const gr = g.createLinearGradient(0, yy - size, 0, yy); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, i ? '#FF8FC0' : '#FFE2B0');
    g.fillStyle = gr; g.fillText(t, xx, yy);
  });
  g.translate(size * 2.9, size * 0.6); g.rotate(0.12); g.font = `${size * 0.26}px ${LT.F_DIA}`;
  const tw = g.measureText('A FAN STORY').width; g.fillStyle = INK; g.fillRect(-12 + 7, -size * 0.25 + 7, tw + 24, size * 0.34);
  g.fillStyle = '#FFE14D'; g.fillRect(-12, -size * 0.25, tw + 24, size * 0.34); g.fillStyle = INK; g.fillText('A FAN STORY', 0, size * 0.02);
  g.restore();
}
function drawNamePlate(g, name, x, y, p) {
  if (p <= 0) return; const s = outBack(clamp(p));
  g.save(); g.translate(x, y); g.rotate(-0.04); g.scale(s, s); g.font = `110px ${LT.F_SFX}`; g.lineJoin = 'round';
  const parts = name.split(' ');
  parts.forEach((t, i) => {
    const yy = (i - parts.length + 1) * 100;
    g.fillStyle = '#2a1036'; g.fillText(t, 10, yy + 12); g.lineWidth = 18; g.strokeStyle = '#140818'; g.strokeText(t, 0, yy);
    g.fillStyle = i === parts.length - 1 ? '#FF8FC0' : '#FFF3D6'; g.fillText(t, 0, yy);
  });
  g.restore();
}
// ---------- comic page of panels ----------
const LAYOUT = {
  1: [[34, 34, 1852, 1012]],
  2: [[34, 34, 1120, 1012], [1176, 34, 710, 1012]],
  3: [[34, 34, 1100, 1012], [1156, 34, 730, 495], [1156, 551, 730, 495]],
};
function panelEntry(p, i) {
  const e = outBack(p), moves = ['slam', 'right', 'up', 'left'], mv = moves[i % 4];
  if (mv === 'slam') return { dx: 0, dy: 0, s: 1 + 0.45 * (1 - outCubic(p)), rot: -0.06 * (1 - outCubic(p)) };
  if (mv === 'left') return { dx: -W * 0.7 * (1 - e), dy: 0, s: 1, rot: -0.03 * (1 - e) };
  if (mv === 'right') return { dx: W * 0.7 * (1 - e), dy: 0, s: 1, rot: 0.03 * (1 - e) };
  return { dx: 0, dy: H * 0.9 * (1 - e), s: 1, rot: 0.025 * (1 - e) };
}
function drawPage(g, P, T, t0, t1, keep) {
  if (!keep) { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); }
  const L = P.L || LAYOUT[P.panels.length], anchors = {};
  const zoomOut = P.pull ? 1 - 0.28 * outCubic(lin(T, t0, t0 + 2.5)) : 1;
  g.save(); g.translate(W / 2, H / 2); g.scale(zoomOut, zoomOut); g.translate(-W / 2, -H / 2);
  P.panels.forEach((S, i) => {
    const [x, y, w, h] = L[i], ta = t0 + 0.12 + i * 0.32, p = lin(T, ta, ta + 0.4);
    if (T < ta) return;
    const en = panelEntry(p, P.moves ? P.moves[i] : i);
    g.save(); g.translate(x + w / 2 + en.dx, y + h / 2 + en.dy); g.rotate(en.rot); g.scale(en.s, en.s); g.translate(-(x + w / 2), -(y + h / 2));
    g.fillStyle = INK; g.fillRect(x - 9, y - 9, w + 18, h + 18);
    const a = drawScene(g, S, T, ta, t1, [x, y, w, h]);
    if (p < 1 && T > ta + 0.24) { g.fillStyle = `rgba(255,250,235,${0.85 * (1 - lin(T, ta + 0.24, ta + 0.4))})`; g.fillRect(x, y, w, h); }
    g.restore();
    for (const k in a) if (!anchors[k]) anchors[k] = a[k];
  });
  if (P.sirens) { const ph = Math.floor(T * 12) % 4 < 2; g.fillStyle = ph ? 'rgba(255,40,70,0.18)' : 'rgba(40,90,255,0.18)'; g.fillRect(-W, -H, W * 3, H * 3); }
  g.restore();
  return anchors;
}
// ---------- lettering layout for a beat ----------
function ltSize(g, it) {
  const L = ltLayout(g, it);
  if (it.kind === 'caption') return { w: L.tw + 44, h: L.th + 35 };
  const t = it.type, padX = t === 'thought' ? 54 : t === 'shout' ? 62 : 44, padY = t === 'thought' ? 44 : t === 'shout' ? 52 : 34;
  const rx = (L.tw / 2 + padX) * 1.02 * (t === 'shout' ? 1.15 : 1), ry = (L.th / 2 + padY) * (t === 'shout' ? 1.15 : 1);
  return { w: rx * 2, h: ry * 2 };
}
function layoutItems(g, b, S, anchors) {
  const out = [], rects = [], O = S.lt || {};
  const hit = (r) => rects.some((q) => r.x < q.x + q.w + 24 && r.x + r.w + 24 > q.x && r.y < q.y + q.h + 20 && r.y + r.h + 20 > q.y);
  let capN = 0, sfxN = 0;
  for (const k in anchors) { const A = anchors[k], fh = Math.max(60, A.y - A.top); rects.push({ x: A.x - fh * 0.8, y: A.top + fh * 0.3, w: fh * 1.6, h: fh * 1.0 }); }
  b.items.forEach((it, i) => {
    const o = O[i] || {}, sz = it.kind === 'sfx' ? null : ltSize(g, it), base = { seed: ltHash(b.id + it.text) };
    if (it.kind === 'caption') {
      let x = capN ? W - sz.w - 50 : 46, y = capN ? H - sz.h - 46 : 40;
      if (o.x != null) x = o.x; if (o.y != null) y = o.y;
      let r = { x, y, w: sz.w, h: sz.h }; while (hit(r) && r.y < H - sz.h) r.y += 40;
      rects.push(r); out.push(Object.assign(base, it, { x: r.x, y: r.y, color: o.color || (capN ? 'pink' : 'yellow'), from: capN ? 'right' : 'left' })); capN++;
      return;
    }
    if (it.kind === 'sfx') {
      const sp = (S.sfx || [])[sfxN] || {}, dflt = [[W * 0.74, H * 0.2], [W * 0.3, H * 0.62], [W * 0.62, H * 0.75]][sfxN % 3];
      const sx = sp.x != null ? sp.x : dflt[0], sy = sp.y != null ? sp.y : dflt[1], ss = sp.size || (it.text === it.text.toUpperCase() ? 150 : 74), sw = Math.min(W - 60, it.text.length * ss * 0.62);
      rects.push({ x: clamp(sx, sw / 2 + 30, W - sw / 2 - 30) - sw / 2, y: sy - ss * 0.6, w: sw, h: ss * 1.2 });
      out.push(Object.assign(base, it, { x: sp.x != null ? sp.x : dflt[0], y: sp.y != null ? sp.y : dflt[1], size: sp.size, rot: sp.rot != null ? sp.rot : (sfxN % 2 ? 0.1 : -0.12), colors: sp.colors })); sfxN++;
      return;
    }
    // bubble: above the speaker's head, pushed toward the frame centre; off-screen speakers -> o / S.off / inset
    const name = it.who, A = anchors[name];
    let tx = null, ty = null;
    const fit = (cx, cy) => ({ x: clamp(cx, sz.w / 2 + 40, W - sz.w / 2 - 40) - sz.w / 2, y: clamp(cy, sz.h / 2 + 36, H - sz.h / 2 - 36) - sz.h / 2, w: sz.w, h: sz.h });
    let r;
    if (o.x != null) r = fit(o.x, o.y);
    else if (A && !(it.type === 'phone' && S.inset === name)) {
      tx = A.x; ty = A.y; const side = A.x < W / 2 ? 1 : -1, fh = Math.max(60, A.y - A.top);
      const cands = [[A.x + side * sz.w * 0.3, A.top + fh * 0.3 - sz.h / 2 - 50], [A.x + side * (sz.w / 2 + fh * 0.85 + 50), A.top + fh * 0.1],
        [A.x - side * (sz.w / 2 + fh * 0.85 + 50), A.top + fh * 0.1], [A.x + side * (sz.w / 2 + fh * 0.85 + 50), A.top + fh * 0.1 + sz.h + 30], [A.x + side * sz.w * 0.6, A.top + fh * 0.3 - sz.h / 2 - 50]];
      for (const [cx, cy] of cands) { const q = fit(cx, cy); if (!hit(q)) { r = q; break; } }
      if (!r) r = fit(cands[0][0], cands[0][1]);
    } else if (S.inset === name) { const I = S.insetAt || [70, 90], right = I[0] > W / 2; tx = I[0] + 150 + (right ? -150 : 150); ty = I[1] + 150; r = fit(right ? I[0] - 60 - sz.w / 2 : I[0] + 360 + sz.w / 2, I[1] + 110 + sz.h / 2); }
    else if (S.off && S.off[name]) { [tx, ty] = S.off[name]; r = fit(tx < W / 2 ? 80 + sz.w / 2 + 120 : tx > W ? W - sz.w / 2 - 200 : tx, H * 0.28); }
    else if (it.type === 'radio' && S.radio) { [tx, ty] = S.radio; r = fit(tx + (tx < W / 2 ? 1 : -1) * (sz.w / 2 + 40), ty - sz.h / 2 - 140); }
    else r = fit(W * (i % 2 ? 0.7 : 0.3), H * 0.25);
    if (o.tx != null) tx = o.tx; if (o.ty != null) ty = o.ty;
    let guard = 0; while (hit(r) && guard++ < 30) { r.y += 36; if (r.y + r.h > H - 30) { r.y = 40; r.x += (r.x < W / 2 ? 1 : -1) * 60; } }
    if (tx != null) {   // tail ends just short of the mouth
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dd = Math.hypot(cx - tx, cy - ty) || 1, st = Math.min(dd * 0.55, (anchors[name] ? Math.max(40, (anchors[name].y - anchors[name].top) * 0.8) : 42));
      tx += (cx - tx) / dd * st; ty += (cy - ty) / dd * st;
    }
    rects.push(r);
    out.push(Object.assign(base, it, { x: r.x + r.w / 2, y: r.y + r.h / 2, tx, ty }));
  });
  return out;
}
function drawInset(g, S, T, t0) {          // phone caller portrait in a round-cornered inset panel
  const p = outBack(lin(T, t0 + 0.3, t0 + 0.65)); if (p <= 0) return;
  const [x, y] = S.insetAt || [70, 90], w = 300, h = 300;
  g.save(); g.translate(x + w / 2, y + h / 2); g.scale(p, p); g.rotate(-0.04); g.translate(-w / 2, -h / 2);
  g.fillStyle = INK; g.fillRect(-9, -9, w + 18, h + 18);
  const sc = { bg: S.insetBg || 'bg_garage', ch: [C('mendez_phone', 960, 1150)], f: [0, 0.48, 0.32], z: 2.1, fx: ['night'] };
  drawScene(g, sc, T, t0, t0 + 10, [0, 0, w, h]);
  g.restore();
}
// ---------- frame ----------
function beatAt(T) { let i = 0; while (i < SCRIPT.length - 1 && T >= SCRIPT[i + 1].t0) i++; return i; }
function drawBeat(g, i, T, keep) {
  const b = SCRIPT[i], S = SHOTS[b.id] || { bg: 'bg_cell' }, t0 = b.t0, t1 = b.t0 + b.dur;
  const anchors = S.panels ? drawPage(g, S, T, t0, t1, keep) : drawScene(g, S, T, t0, t1, [0, 0, W, H]);
  if (S.inset) drawInset(g, S, T, t0);
  return anchors;
}
function frame(g, T) {
  if (!PRINT) PRINT = makePrint();
  const i = beatAt(T), b = SCRIPT[i], S = SHOTS[b.id] || {};
  g.fillStyle = '#C9A6D8'; g.fillRect(0, 0, W, H);
  const prevS = i ? SHOTS[SCRIPT[i - 1].id] || {} : {};
  const tr = S.tr || (S.panels ? (prevS.panels ? 'cut' : 'page') : i && SCRIPT[i - 1].scene !== b.scene ? 'push' : (SHOTS[SCRIPT[i - 1] && SCRIPT[i - 1].id] || {}).bg !== S.bg ? 'swap' : 'cut');
  let anchors;
  if (i > 0 && T < b.t0 + TR && tr !== 'cut') {
    const p = lin(T, b.t0, b.t0 + TR);
    g.save();
    if (tr === 'swap') g.translate(0, -H * 1.05 * inCubic(lin(T, b.t0, b.t0 + 0.42)));
    else g.translate(W * 1.08 * inCubic(lin(T, b.t0, b.t0 + 0.42)), 0);
    drawBeat(g, i - 1, b.t0 - 1 / 12); g.restore();
    g.save();
    if (tr === 'swap') g.translate(0, H * 1.05 * (1 - outCubic(lin(T, b.t0 + 0.08, b.t0 + TR))));
    else g.translate(-W * 1.05 * (1 - outCubic(p)), 0);
    anchors = drawBeat(g, i, T); g.restore();
  } else if (S.panels && prevS.panels && T < b.t0 + 0.6 + 0.32 * S.panels.length) {   // page to page: new panels slam over the old page
    drawBeat(g, i - 1, b.t0 - 1 / 12); anchors = drawBeat(g, i, T, true);
  } else anchors = drawBeat(g, i, T);
  // grade: halftone print + violet vignette
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.2; g.drawImage(PRINT, 0, 0); g.globalAlpha = 1;
  g.globalCompositeOperation = 'multiply'; const v = g.createRadialGradient(W / 2, H * .5, H * .45, W / 2, H * .5, W * .62);
  v.addColorStop(0, 'rgba(255,255,255,1)'); v.addColorStop(1, 'rgba(130,90,160,1)'); g.globalAlpha = 0.24; g.fillStyle = v; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  // lettering: items enter in reading order, each held for its reading time, all pop out at the beat end
  const items = layoutItems(g, b, S, anchors), lead = (S.panels ? 0.35 + 0.32 * S.panels.length : 0.55) + (tr === 'cut' ? 0 : 0.2);
  const reads = items.map(ltRead), sum = reads.reduce((a, c) => a + c, 0) || 1, k = Math.max(1, (b.dur - lead - 0.8) / sum);
  let at = b.t0 + lead, sfxAt = b.t0 + lead * 0.6; const end = b.t0 + b.dur, out = lin(T, end - 0.17, end);
  items.forEach((it, j) => {
    if (it.kind === 'sfx') { drawSFX(g, it, T - sfxAt, out); sfxAt += 0.25; return; }   // SFX belong to the art: they hit at the start
    const age = T - at;
    if (it.kind === 'caption') drawCaption(g, it, age, out); else if (it.kind === 'sfx') drawSFX(g, it, age, out); else drawBubble(g, it, age, out);
    at += Math.min(reads[j] * k, reads[j] + 1.6);
  });
}
