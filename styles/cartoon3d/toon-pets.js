// =====================================================================
//  styles/cartoon3d/toon-pets.js — CODE-DRAWN guinea pigs in the same 2D-3D card style as toon.js (2026-11-08,
//  pieces/guinea-rent). Opt-in: add "styles/cartoon3d/toon-pets.js" to the build list AFTER styles/cartoon3d/toon.js.
//  A pet is a toon.js card (same lit material, cast shadow, contact shadow, resolution levels) whose drawing is swapped
//  via p.drawFn: a round chunky body (superellipse), fur patches clipped inside it, the same volume shading, ink ring
//  and face kit (t3Face eyes/brows/mouths, blinks, expressions) + a small pink nose, petal ears, tiny feet.
//  API: c3ToonPet(o) -> pet; c3ToonPetPose(pet, cam, t, o) (after the camera is set).
//  o (pet): { key, fur, patches: [[dx, dy, rx, ry, colour], ...] (units of A, x toward the face), muzzle, ear, tuft,
//             old (white brow tufts), size (1 adult, 0.6 baby) }
//  o (pose): toon.js pose keys (expr, gaze, facing, blink, talk = chew, fx) + hop (0..1 up), squash, halo (0..1), spin
//             (card roll, rad), mode 'walk' + phase (scurry)
// =====================================================================
const T3P = { A: 108, scale: 0.29 };
function t3PetDraw(g, p, st) {
  const o = p.o, po = p.petO || {}, f = st.f, m = Math.min(2, f.m), dir = f.dir, A = T3P.A, u = 2 * A / 100, light = st.light;
  const thick = Math.atan2(-Math.sin(light) + 0.9, -Math.cos(light)), ow = 3.6 * u;
  const prof = Math.max(0, m - 1), q34 = Math.min(1, m);
  const a = A * (1.95 + 0.32 * q34 + 0.22 * prof), b = A * 1.5;
  const hop = po.hop || 0, sq = st.squash || 0, walk = st.mode === 'walk', ph = st.phase || 0;
  const bob = walk ? Math.abs(Math.sin(TAU * ph)) * 5 * u : 0;
  const lift = hop * 150 + bob, sy = 1 - 0.1 * sq + 0.12 * hop, sx = 1 + 0.08 * sq - 0.05 * hop;
  const sole = 975, cx = 300, cy = sole - 6 * u - b;
  g.save(); g.translate(cx, sole - lift); g.scale(sx, sy); g.translate(-cx, -sole);
  // feet first (under the body): two front feet under the face, one back foot at the rump in 3/4 / profile
  const fxo = dir * A * (1.15 * q34 + 0.35 * prof), fcx = cx + fxo, fcy = cy - 0.06 * A;
  const footCol = t3Mix('#f2b8b0', st.env || '#ffffff', 0.12), feet = [];
  const step = (k) => walk ? Math.max(0, Math.sin(TAU * ph + k * Math.PI)) * 7 * u : hop > 0.2 ? 6 * u : 0;
  [[fcx - 15 * u * (1 - 0.4 * q34), 0], [fcx + 15 * u * (1 - 0.4 * q34), 1]].concat(q34 > 0.3 ? [[cx - dir * a * 0.62, 1]] : []).forEach(([x, k]) => {
    const y = sole - 3 * u - step(k); g.beginPath(); g.ellipse(x + dir * 2 * u * q34, y, 7.5 * u, 4.2 * u, 0, 0, TAU); g.fillStyle = footCol; g.fill(); g.lineWidth = 2.2 * u; g.strokeStyle = T3.ink; g.stroke(); feet.push(x); });
  p.feet = [Math.min(...feet) - 20, Math.max(...feet) + 20];
  // body: wider at the rump in 3/4, a flat-ish bottom, a little lumpy (seeded)
  const s0 = t3Seed(o.key);
  const P = t3Blob(cx, cy, a, b, 2.05, 2.7, -0.04, 110, (t, X) => 1 + 0.035 * Math.sin(3 * t + s0) + 0.02 * Math.sin(5 * t + s0 * 2) - 0.06 * q34 * dir * X * 0.5);
  const fur = o.fur || '#d8843a';
  t3Path(g, P); g.fillStyle = fur; g.fill();
  g.save(); t3Path(g, P); g.clip();
  for (const [dx, dy, rx, ry, c] of (o.patches || [])) { g.beginPath(); g.ellipse(cx + dir * dx * A * (0.6 + 0.4 * q34), cy + dy * A, rx * A, ry * A, 0, 0, TAU); g.fillStyle = c; g.fill(); }
  // the muzzle: a paler patch around the nose and mouth (it reads as the face)
  g.beginPath(); g.ellipse(fcx, fcy + 15 * u, 21 * u, 13 * u, 0, 0, TAU); g.fillStyle = o.muzzle || t3Mix(fur, '#fff6ea', 0.6); g.fill();
  // fur texture: a few short darker flicks
  g.globalAlpha = 0.22; for (let i = 0; i < 26; i++) { const x = cx + (t3Rnd(s0, i) - 0.5) * 1.8 * a, y = cy + (t3Rnd(s0, i + 40) - 0.6) * 1.6 * b, an = -1.2 + t3Rnd(s0, i + 80) * 0.6;
    t3Stroke(g, [[x, y], [x + Math.cos(an) * 5 * u * dir, y + Math.sin(an) * 5 * u]], 1.2 * u, t3Mul(fur, 0.55)); } g.globalAlpha = 1;
  g.restore();
  const env = st.env || '#ffffff', far = t3Mix(t3Mix('#bfa9b4', fur, 0.35), env, 0.5), mid = t3Mix('#efe0de', env, 0.15);
  t3Volume(g, P, cx, cy, a, b, light, { flat: 0.4, shift: 0.5, reach: 1.36, far: t3Mul(t3Mix(far, '#9c8aa4', 0.15), 0.8), mid: t3Mix(mid, '#e6d2d4', 0.4), rim: t3Mix('#f0e6e8', env, 0.15), ring0: 0.86, glow: 0.22 });
  t3InkRing(g, P, ow, thick, 0.3);
  // ears: droopy petals on the crown, either side of the face (one hidden in profile)
  const earC = o.ear || t3Mul(fur, 0.82), ex0 = 33 * u * (1 - 0.25 * q34), ety = cy - b * 0.86;
  for (const s of [-1, 1]) { if (prof > 0.4 && s === -dir) continue; const x = fcx + s * ex0 - dir * 6 * u * q34;
    g.save(); g.translate(x, ety + 3 * u); g.rotate(s * 0.55 + dir * 0.15 * q34); g.beginPath(); g.ellipse(0, 0, 10 * u, 7 * u, 0, Math.PI, TAU); g.quadraticCurveTo(0, 5 * u, -10 * u, 0); g.closePath();
    g.fillStyle = earC; g.fill(); g.lineWidth = 2.4 * u; g.strokeStyle = T3.ink; g.stroke(); g.beginPath(); g.ellipse(0, -1.5 * u, 5.5 * u, 3.5 * u, 0, Math.PI, TAU); g.fillStyle = '#e8a0a0'; g.fill(); g.restore(); }
  // the tuft (Gerald's rosette): a few spiky locks on the crown
  if (o.tuft) { const tx = fcx - dir * 4 * u, ty = cy - b * 0.93; g.beginPath(); g.moveTo(tx - 12 * u, ty + 6 * u);
    [[-8, -12], [-4, 0], [0, -17], [4, 0], [9, -11], [12, 6]].forEach(([x, y]) => g.lineTo(tx + x * u, ty + y * u)); g.closePath();
    g.fillStyle = o.tuft === true ? fur : o.tuft; g.fill(); g.lineWidth = 2.4 * u; g.lineJoin = 'round'; g.strokeStyle = T3.ink; g.stroke(); }
  // face: the toon.js kit, centred on the face spot (no slide); a pink nose between the eyes and the mouth
  const ff = Object.assign({}, f, { m: Math.min(m, 1.15) });   // the whole face, always (Ricks)
  if (!f.back) {
    const fA = A * 1.08 * (o.size && o.size < 0.8 ? 1.1 : 1), fu = 2 * fA / 100;
    t3Face(g, fcx, fcy, fA, st, o, ff);
    { const nx = fcx, ny = fcy + 10.5 * fu; g.beginPath(); g.moveTo(nx - 3.6 * fu, ny - 1.6 * fu); g.quadraticCurveTo(nx, ny - 2.6 * fu, nx + 3.6 * fu, ny - 1.6 * fu); g.quadraticCurveTo(nx + 1 * fu, ny + 2.6 * fu, nx, ny + 2.6 * fu); g.quadraticCurveTo(nx - 1 * fu, ny + 2.6 * fu, nx - 3.6 * fu, ny - 1.6 * fu);
      g.fillStyle = '#e8828c'; g.fill(); g.lineWidth = 1.5 * fu; g.strokeStyle = T3.feat; g.stroke(); }
    if (o.old) { g.fillStyle = '#f4f0ea'; for (const s of [-1, 1]) { const x = fcx + s * 13 * fu, y = fcy - 12 * fu;   // white brow tufts of an old pig
      g.beginPath(); for (let i = 0; i < 5; i++) { const an = Math.PI + i * Math.PI / 4; g.ellipse(x + Math.cos(an) * 4 * fu + s * 2 * fu, y + Math.sin(an) * 2.2 * fu, 3.4 * fu, 2.4 * fu, an, 0, TAU); } g.fill(); } }
    if (st.fx) t3Fx(g, fcx, fcy, fA, fA, st.fx, dir);
  }
  g.restore();
  // halo (the friend "passes away"): a gold ring over the head, drawn after the hop so it floats on its own
  if (po.halo) { const hy = cy - b - 60 * u - lift - (po.haloUp || 0) * 220; g.save(); g.globalAlpha = Math.min(1, po.halo);
    g.beginPath(); g.ellipse(fcx, hy, 34 * u, 9 * u, 0, 0, TAU); g.lineWidth = 9 * u; g.strokeStyle = T3.ink; g.stroke(); g.lineWidth = 5 * u; g.strokeStyle = '#ffd84a'; g.stroke(); g.restore(); }
}
function c3ToonPet(o = {}) {
  const p = c3ToonChar(Object.assign({ hair: 'none', outfit: 'polo' }, o, { scale: (o.size ?? 1) * T3P.scale }));
  p.drawFn = t3PetDraw; p.pet = true; p.o.fur ||= '#d8843a'; p.sh.material.opacity = 0.6; return p;
}
function c3ToonPetPose(p, cam, t, o = {}) {
  p.petO = o; c3ToonPose(p, cam, t, Object.assign({ idle: 1 }, o));
  p.card.rotation.z = o.spin || 0; p.sh.visible = !(o.hop > 0.3); return p;
}

// =====================================================================
//  ADDITIVE (2026-11-09, pieces/lost-luggage): more held props + a rattlesnake. Opt-in: nothing changes unless a pose
//  asks for these prop kinds or a piece calls c3ToonSnake. Held props are drawn ON the card and hang from the gripping
//  hand (the dot hand sits on the handle / collar / cuff), so they move with the hand in every view.
//  prop kinds: 'suitcase' { color, w, h, tag, sticker } | 'jacket' { color } | 'shirt' { color } | 'boot' { color } |
//              'card' | 'chicken' | 'teddy' | 'socks' { color }; every kind takes k (size factor)
// =====================================================================
const T3_PROP_BASE = t3Prop;
t3Prop = function (g, kind, x, y, u, s, o = {}) {
  const K = { suitcase: 1, jacket: 1, shirt: 1, boot: 1, card: 1, chicken: 1, teddy: 1, socks: 1 };
  if (!K[kind]) return T3_PROP_BASE(g, kind, x, y, u, s, o);
  // origin = the hand centre (t3Draw passes the hand offset by -s*7.5u, +2.5u)
  const hx = x - s * 7.5 * u, hy = y - 2.5 * u; u *= o.k ?? 1;
  const ink = T3.ink, ol = (w = 1.8 * u) => { g.lineWidth = w; g.strokeStyle = ink; g.lineJoin = 'round'; g.stroke(); };
  const shade = (x0, y0, w, h) => { const gr = g.createLinearGradient(x0 - w, 0, x0 + w, 0); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(40,20,50,0.32)'); g.fillStyle = gr; g.fillRect(x0 - w, y0 - h, 2 * w, 2 * h); };
  g.save(); g.translate(hx, hy);
  if (kind === 'suitcase') { const w = (o.w ?? 60) * u, h = (o.h ?? 42) * u, c = o.color || '#2f6fb8', top = 6 * u;
    // handle: a bar under the fist + two posts down to the case
    g.beginPath(); g.roundRect(-10 * u, -2.2 * u, 20 * u, 4.4 * u, 2 * u); g.fillStyle = '#2a2224'; g.fill(); ol(1.4 * u);
    for (const sx of [-1, 1]) { g.beginPath(); g.roundRect(sx * 8 * u - 1.6 * u, 0, 3.2 * u, top + 1 * u, 1 * u); g.fillStyle = '#3a3034'; g.fill(); ol(1.2 * u); }
    g.beginPath(); g.roundRect(-w / 2, top, w, h, 5 * u); g.fillStyle = c; g.fill();
    g.save(); g.clip(); shade(0, top + h / 2, w / 2, h / 2);
    g.fillStyle = t3Mul(c, 0.78); for (const fx of [-0.22, 0.22]) g.fillRect(fx * w - 1.6 * u, top, 3.2 * u, h);   // ribs
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-w / 2, top + h * 0.48, w, 1.6 * u);   // the seam
    if (o.sticker !== false) { g.save(); g.translate(w * 0.3, top + h * 0.66); g.rotate(-0.2); g.beginPath(); g.ellipse(0, 0, 7 * u, 5 * u, 0, 0, TAU); g.fillStyle = o.sticker || '#f2c23a'; g.fill(); ol(1 * u); g.restore(); }
    g.restore(); g.beginPath(); g.roundRect(-w / 2, top, w, h, 5 * u); ol();
    for (const [cx0, cy0] of [[-w / 2, top], [w / 2, top], [-w / 2, top + h], [w / 2, top + h]]) { g.beginPath(); g.arc(cx0 - Math.sign(cx0) * 2.4 * u, cy0 + (cy0 > top ? -2.4 : 2.4) * u, 2.6 * u, 0, TAU); g.fillStyle = '#c8c4bc'; g.fill(); ol(1 * u); }
    if (o.tag) { g.beginPath(); g.moveTo(9 * u, 1 * u); g.lineTo(15 * u, 10 * u); g.lineWidth = 1 * u; g.strokeStyle = ink; g.stroke(); g.save(); g.translate(15 * u, 10 * u); g.rotate(0.35); g.beginPath(); g.roundRect(-4 * u, 0, 8 * u, 12 * u, 1.5 * u); g.fillStyle = o.tag === true ? '#f6efe0' : o.tag; g.fill(); ol(1 * u); g.restore(); }
  } else if (kind === 'jacket' || kind === 'shirt') { const J = kind === 'jacket', c = o.color || (J ? '#8a5a2c' : '#e8eef6'), w = (J ? 50 : 42) * u, L = (J ? 62 : 50) * u, sh = J ? 9 * u : 3 * u;
    if (J) { g.beginPath(); g.moveTo(0, -4 * u); g.lineTo(0, 3 * u); g.lineWidth = 1.6 * u; g.strokeStyle = '#6a6a72'; g.stroke(); g.beginPath(); g.moveTo(-w * 0.46, sh + 1 * u); g.lineTo(0, 3 * u); g.lineTo(w * 0.46, sh + 1 * u); g.lineWidth = 2.2 * u; g.strokeStyle = '#7a5a3a'; g.stroke(); }
    const P = [[-w * 0.18, sh - 2 * u], [-w * 0.5, sh + 4 * u], [-w * 0.62, sh + L * 0.62], [-w * 0.5, sh + L * 0.64], [-w * 0.44, sh + 14 * u], [-w * 0.42, sh + L], [w * 0.42, sh + L], [w * 0.44, sh + 14 * u], [w * 0.5, sh + L * 0.64], [w * 0.62, sh + L * 0.62], [w * 0.5, sh + 4 * u], [w * 0.18, sh - 2 * u]];
    t3Path(g, P); g.fillStyle = c; g.fill(); g.save(); g.clip(); shade(0, sh + L / 2, w * 0.6, L / 2); g.restore(); t3Path(g, P); ol();
    g.beginPath(); g.moveTo(-w * 0.18, sh - 2 * u); g.lineTo(0, sh + (J ? 22 : 8) * u); g.lineTo(w * 0.18, sh - 2 * u); g.fillStyle = J ? t3Mul(c, 0.8) : '#ffffff'; g.fill(); ol(1.4 * u);
    t3Stroke(g, [[0, sh + (J ? 22 : 8) * u], [0, sh + L]], 1.3 * u, t3Mul(c, 0.55));
    if (J) for (const sx of [-1, 1]) { g.beginPath(); g.roundRect(sx * w * 0.24 - 6 * u, sh + L * 0.6, 12 * u, 2.4 * u, 1 * u); g.fillStyle = t3Mul(c, 0.7); g.fill(); ol(1 * u); }
    if (!J) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, sh + (14 + i * 11) * u, 1.3 * u, 0, TAU); g.fillStyle = ink; g.fill(); }
  } else if (kind === 'boot') { const c = o.color || '#e8402e', d = o.dir ?? 1;   // a ski boot in profile: leaning shaft, long toe box, thick sole, buckles
    g.scale(d, 1);
    const P = [[-10 * u, 0], [8 * u, 0], [11 * u, 18 * u], [26 * u, 24 * u], [30 * u, 30 * u], [30 * u, 36 * u], [-13 * u, 36 * u], [-13 * u, 24 * u]];
    t3Path(g, P); g.fillStyle = c; g.fill(); g.save(); g.clip(); shade(6 * u, 18 * u, 22 * u, 20 * u);
    g.fillStyle = '#2a2a30'; g.fillRect(-14 * u, 32 * u, 46 * u, 5 * u); g.fillStyle = t3Mul(c, 0.7); g.fillRect(-14 * u, 0, 26 * u, 4 * u); g.restore(); t3Path(g, P); ol();
    t3Stroke(g, [[-12 * u, 32 * u], [30 * u, 32 * u]], 1.4 * u, ink);
    for (const [bx, by] of [[0, 7], [1.5, 14], [12, 25]]) { g.beginPath(); g.roundRect((bx - 2) * u, by * u, 11 * u, 3 * u, 1 * u); g.fillStyle = '#d8dce2'; g.fill(); ol(1 * u); }
  } else if (kind === 'card') { g.rotate(-0.1 * s); const w = 26 * u, h = 17 * u; g.beginPath(); g.roundRect(-w / 2, 2 * u, w, h, 2 * u); g.fillStyle = '#eef4fa'; g.fill(); ol(1.4 * u);
    g.fillStyle = '#3a78c8'; g.fillRect(-w / 2 + 1 * u, 3 * u, w - 2 * u, 3.4 * u);
    g.beginPath(); g.roundRect(-w / 2 + 2.5 * u, 8 * u, 8 * u, 9.5 * u, 1 * u); g.fillStyle = '#cfe0ee'; g.fill(); g.beginPath(); g.arc(-w / 2 + 6.5 * u, 12 * u, 2.6 * u, 0, TAU); g.fillStyle = '#f8dcc4'; g.fill(); ol(0.8 * u);
    g.fillStyle = 'rgba(40,40,60,0.55)'; for (let i = 0; i < 3; i++) g.fillRect(-w / 2 + 12.5 * u, (9 + i * 3) * u, (9 - i * 2) * u, 1 * u);
  } else if (kind === 'chicken') {   // rubber chicken held by the neck
    g.beginPath(); g.moveTo(-2 * u, -6 * u); g.quadraticCurveTo(-4 * u, 6 * u, -10 * u, 14 * u); g.quadraticCurveTo(-14 * u, 30 * u, 0, 36 * u); g.quadraticCurveTo(14 * u, 30 * u, 8 * u, 14 * u); g.quadraticCurveTo(3 * u, 6 * u, 3 * u, -6 * u); g.closePath();
    g.fillStyle = '#f6e04a'; g.fill(); ol(); g.beginPath(); g.moveTo(-1 * u, -8 * u); g.lineTo(-4 * u, -14 * u); g.lineTo(1 * u, -11 * u); g.lineTo(3 * u, -15 * u); g.lineTo(4 * u, -8 * u); g.fillStyle = '#e8402e'; g.fill(); ol(1 * u);
  } else if (kind === 'teddy') { for (const [ex, ey, r] of [[-7, -3, 4], [7, -3, 4], [0, 5, 9], [0, 22, 11]]) { g.beginPath(); g.arc(ex * u, ey * u, r * u, 0, TAU); g.fillStyle = '#b8783e'; g.fill(); ol(1.4 * u); }
    g.fillStyle = ink; for (const ex of [-3, 3]) { g.beginPath(); g.arc(ex * u, 4 * u, 1.1 * u, 0, TAU); g.fill(); } g.beginPath(); g.ellipse(0, 8 * u, 3 * u, 2 * u, 0, 0, TAU); g.fillStyle = '#f0d0a8'; g.fill(); ol(0.8 * u);
  } else if (kind === 'socks') { const c = o.color || '#e8402e'; g.beginPath(); g.moveTo(-4 * u, -1 * u); g.lineTo(4 * u, -1 * u); g.lineTo(4 * u, 18 * u); g.quadraticCurveTo(12 * u, 20 * u, 12 * u, 25 * u); g.lineTo(-2 * u, 25 * u); g.quadraticCurveTo(-4 * u, 22 * u, -4 * u, 18 * u); g.closePath(); g.fillStyle = c; g.fill(); ol(1.4 * u);
    g.fillStyle = '#ffffff'; g.fillRect(-4 * u, 4 * u, 8 * u, 2.5 * u); g.fillRect(-4 * u, 9 * u, 8 * u, 2.5 * u); }
  g.restore();
};

// ---- a cartoon rattlesnake (card): a coil of thick body with diamond blotches, a raised S-neck, the whole toon face
//  (two eyes, two brows, mouth) + a forked tongue, the rattle up at the back.
//  c3ToonSnake(o) -> pet; c3ToonSnakePose(p, cam, t, { expr, gaze, facing, rattle 0..1, rise 0..1, tongue 0..1 })
function t3SnakeDraw(g, p, st) {
  const o = p.o, po = p.petO || {}, A = T3P.A, u = 2 * A / 100, sole = 975, cx = 300, dir = st.f.dir, light = st.light;
  const body = o.fur || '#c8a060', dark = o.patch || '#6a4a2a', belly = o.belly || '#f0dca8', rise = po.rise ?? 1;
  const ow = 3.4 * u, thick = Math.atan2(-Math.sin(light) + 0.9, -Math.cos(light)), tube = 15 * u;
  const ring = (y, rx, ry) => { const P = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; P.push([cx + Math.cos(a) * rx, y + Math.sin(a) * ry]); } return P; };
  { const rx = cx - dir * 44 * u, ry = sole - 46 * u, sh = Math.sin((st.t || 0) * 70) * 2.6 * u * (po.rattle || 0);   // the rattle
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(rx + sh - dir * i * 1 * u, ry - i * 6 * u, 5.5 * u - i * 0.6 * u, 3.6 * u, -dir * 0.3, 0, TAU); g.fillStyle = '#e8d6a8'; g.fill(); g.lineWidth = 1.6 * u; g.strokeStyle = T3.ink; g.stroke(); } }
  for (const [y, rx, ry] of [[sole - 20 * u, 46 * u, 16 * u], [sole - 34 * u, 38 * u, 13 * u], [sole - 46 * u, 28 * u, 10 * u]]) {
    const outer = ring(y, rx + tube / 2, ry + tube / 2);
    g.save(); t3Path(g, outer); g.fillStyle = body; g.fill(); g.clip();
    g.fillStyle = dark; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3, x = cx + Math.cos(a) * rx, yy = y + Math.sin(a) * ry; g.save(); g.translate(x, yy); g.rotate(Math.PI / 4); g.fillRect(-3.4 * u, -3.4 * u, 6.8 * u, 6.8 * u); g.restore(); }
    g.fillStyle = 'rgba(60,30,20,0.25)'; g.beginPath(); g.ellipse(cx, y + ry * 0.4, rx, ry * 0.7, 0, 0, TAU); g.fill();
    g.restore(); t3InkRing(g, outer, ow, thick, 0.3);
  }
  const hx = cx + dir * 10 * u, hy = sole - (70 + 46 * rise) * u;   // the neck: an S from the top coil up to the head
  const N = t3Spline([[cx - dir * 8 * u, sole - 50 * u], [cx + dir * 14 * u, sole - 62 * u], [cx - dir * 4 * u, sole - (66 + 24 * rise) * u], [hx, hy + 14 * u]], 10);
  t3Stroke(g, N, tube + 2 * ow, T3.ink); t3Stroke(g, N, tube, body); t3Stroke(g, N.map(([x, y]) => [x + dir * 3 * u, y]), tube * 0.35, belly);
  const HA = A * 0.74, P = t3Blob(hx, hy, HA * 1.15, HA * 0.86, 2.2, 2.4, -0.05, 90);
  t3Path(g, P); g.fillStyle = body; g.fill(); g.save(); t3Path(g, P); g.clip(); g.fillStyle = dark; g.beginPath(); g.ellipse(hx, hy - HA * 0.62, HA * 0.6, HA * 0.24, 0, 0, TAU); g.fill(); g.restore();
  t3Volume(g, P, hx, hy, HA * 1.15, HA * 0.86, light, { flat: 0.45, shift: 0.45, reach: 1.4, far: '#a08870', mid: '#efe0d0', rim: '#e8d8c8', ring0: 0.86, glow: 0.2 });
  t3InkRing(g, P, ow, thick, 0.3);
  if (po.tongue !== 0) { const ty = hy + HA * 0.62, tl = 16 * u * (po.tongue ?? 1);
    g.beginPath(); g.moveTo(hx, ty); g.lineTo(hx, ty + tl); g.lineTo(hx - 3 * u, ty + tl + 5 * u); g.moveTo(hx, ty + tl); g.lineTo(hx + 3 * u, ty + tl + 5 * u); g.lineWidth = 2.4 * u; g.strokeStyle = '#d8283a'; g.lineCap = 'round'; g.stroke(); }
  t3Face(g, hx, hy + 1 * u, HA * 1.4, st, o, Object.assign({}, st.f, { m: Math.min(st.f.m, 1.1) }));
  p.feet = [cx - 60 * u, cx + 60 * u];
}
function c3ToonSnake(o = {}) {
  const p = c3ToonChar(Object.assign({ hair: 'none', outfit: 'polo', key: 'snake' }, o, { scale: (o.size ?? 1) * T3P.scale }));
  p.drawFn = t3SnakeDraw; p.pet = true; p.sh.material.opacity = 0.5; return p;
}
function c3ToonSnakePose(p, cam, t, o = {}) { p.petO = o; c3ToonPose(p, cam, t, Object.assign({ idle: 1 }, o)); p.card.rotation.z = o.spin || 0; return p; }
