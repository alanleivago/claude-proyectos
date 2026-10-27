// fx.js — sinaboto-style 2D overlay effects, drawn in code on the low-res grid (270x480) so they pixelate like the picture.
// Deterministic: every pixel is a function of (time, seed). Animation steps at 15 fps like the characters.
//
//   const fx = new FX();
//   fx.add('stink', { obj: ch.root, bone: 'Head', offset: [0, 0.25, 0], t0: 6.5, dur: 0.9 });
//   fx.add('question', { screen: [135, 120], t0: 2, dur: 1.5, scale: 3 });
//   fx.draw(ctx, t, camera);        // ctx: a 2D context of a LW x LH canvas (cleared by the caller)
//
// Anchors: screen:[x,y] (low-res px) | world:[x,y,z] | target:Object3D | obj+bone (bone name, '.' removed like GLTFLoader).
// offset:[x,y,z] metres added in world space; dx/dy low-res px added on screen. scale = pixel multiplier (1 = native art).
// Every effect also takes seed and color; see TYPES below for the per-type options and the refs they come from.
import * as THREE from 'three';

export const TYPES = {   // type: [what, where sinaboto uses it (video id tail @ seconds)]
  stink:    ['green wavy squiggles rising (smell)', '0750 @6.5 (mud), @49.2 (algae)'],
  heat:     ['orange/yellow zigzag heat lines rising', '5565 @0.2, @3.8 (roof), @33.2 (helmet); 9582 @34.8 (stove)'],
  sweat:    ['blue sweat drop sliding down', '5565 @0.2, @34.2; 0638 @7.8; 2750 @33.2'],
  sparkle:  ['yellow 4-point twinkles', '0750 @33.8, @56.8, @65.8; 0638 @40.8, @104.8; 2750 @51.2, @70.2; 9582 @41.8'],
  question: ['big yellow pixel "?" with black outline, pops in', '0750 @43.2'],
  exclaim:  ['yellow pixel "!" (same style as "?")', 'requested; same art as "?"'],
  idea:     ['light bulb with flashing rays', '2750 @59.2'],
  anger:    ['red anger mark (cross vein), pulsing', 'requested'],
  heart:    ['pink hearts floating up', 'requested'],
  steam:    ['puffs rising and growing (color: grey for smoke)', '0638 @44.8 (chimney); 9582 @5.8-15.8 (smoke)'],
  dust:     ['beige puffs bursting sideways on the ground', '5565 @9.2-11.8 (roller); 2750 @69.8'],
  splash:   ['blue droplets thrown in arcs + white crown', '0638 @6.8; 2750 @1.8, @69.8'],
  drip:     ['drops forming and falling', '2750 @43-46'],
  bubbles:  ['bubble rings rising with wobble', '0750 @70; 0638 @80.8 (underwater)'],
  arrow:    ['pixel arrows with outline, sliding (force/flow)', '5565 @19-26; 0638 @26-62; 9582 @25; 2750 @36-40'],
  wind:     ['white wind streaks sweeping', '0638 @24.8, @77.8'],
  thought:  ['thought bubble with trailing dots, optional icon', '0750 @79.2; 0638 @40.2'],
  zap:      ['flickering jagged sparks', '9582 @8.2 (saw), @75.2 (static)'],
  snow:     ['snowflakes / frost twinkles drifting', '5565 @70.2; 9582 @60.2'],
  crack:    ['black crack lines growing', '2750 @34.8'],
  impact:   ['radial impact lines burst', 'requested'],
  shake:    ['cartoon shiver lines either side of a body, jittering', 'digger-01 v2 (shiver)'],
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (x, y, s) => { let h = Math.imul(x * 374761393 + y * 668265263 + s * 2246822519, 1274126177); h ^= h >>> 13; h = Math.imul(h, 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const POP = [0.4, 1.25, 0.95];   // icon pop-in, one value per 30 fps frame (captions use the measured 0.86/1.05/0.98)

// pixel masks ('.' empty, letters = palette index 1..)
const M = {
  question: ['.aaaaa.', 'aaaaaaa', 'aab.baa', '....baa', '...aaab', '..aaab.', '..aab..', '..aab..', '.......', '..aa...', '..aab..'],
  exclaim: ['aaa', 'aaa', 'aab', 'aab', 'aab', '.ab', '.a.', '...', 'aa.', 'aab'],
  heart: ['.aa.aa.', 'abaaaaa', 'aaaaaaa', '.aaaaa.', '..aaa..', '...a...'],
  drop: ['..a..', '..a..', '.aaa.', 'acaab', 'acaab', 'aaaab', '.abb.'],
  bulb: ['..aaa..', '.acaaa.', 'acaaaaa', 'acaaaaa', 'aaaaaaa', '.aaaab.', '..aab..', '..ddd..', '..eee..', '..ddd..', '...e...'],
  anger: ['..a...a..', '..a...a..', 'aaa...aaa', '.........', '.........', 'aaa...aaa', '..a...a..', '..a...a..'],
  flake: ['a.a.a', '.aba.', 'abbba', '.aba.', 'a.a.a'],
};

export class FX {
  constructor(LW = 270, LH = 480) {
    this.LW = LW; this.LH = LH; this.items = [];
    this.buf = new Int16Array(LW * LH).fill(-1);       // per-effect palette indices (-1 empty)
    this.img = new ImageData(LW, LH);
  }
  add(type, o = {}) {
    if (!DRAW[type]) throw new Error('fx: unknown type ' + type);
    this.items.push({ type, t0: 0, dur: 1, scale: 1, seed: 1 + this.items.length * 7919, ...o });
    return this;
  }
  anchor(it, cam) {
    const v = new THREE.Vector3();
    if (it.screen) return { x: it.screen[0] + (it.dx || 0), y: it.screen[1] + (it.dy || 0) };
    if (it.bone) {
      if (!it._bone) it.obj.traverse((o) => { if (!it._bone && o.isBone && o.name === it.bone) it._bone = o; });
      it._bone.updateWorldMatrix(true, false); it._bone.getWorldPosition(v);
    } else if (it.target) { it.target.updateWorldMatrix(true, false); it.target.getWorldPosition(v); }
    else v.fromArray(it.world || [0, 0, 0]);
    if (it.offset) v.add(new THREE.Vector3().fromArray(it.offset));
    v.project(cam); if (v.z > 1 || v.z < -1) return null;
    return { x: (v.x * 0.5 + 0.5) * this.LW + (it.dx || 0), y: (0.5 - v.y * 0.5) * this.LH + (it.dy || 0) };
  }
  draw(ctx, t, cam) {
    const d = this.img.data; d.fill(0);
    for (const it of this.items) {
      const lt = t - it.t0; if (lt < 0 || lt >= it.dur) continue;
      const a = this.anchor(it, cam); if (!a) continue;
      const g = new G(this, it);
      DRAW[it.type](g, a.x, a.y, lt, it, it.scale);
      g.flush(d);
    }
    ctx.putImageData(this.img, 0, 0);
  }
}

// one effect's drawing surface: palette-indexed pixels, auto outline, dithered fade
class G {
  constructor(fx, it) { this.fx = fx; this.it = it; this.pal = []; this.out = -1; this.fade = 0; this.touched = []; this.f = 0; }
  palette(cols, outline) { this.pal = cols.map((c) => (c ? hex(c) : null)); this.out = outline ? this.pal.push(hex(outline)) - 1 : -1; return this; }
  px(x, y, ci, w = 1, h = 1) {
    const { LW, LH, buf } = this.fx; x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x + i, Y = y + j; if (X < 0 || Y < 0 || X >= LW || Y >= LH) continue;
      if (this.fade > 0 && hash(X, Y, this.it.seed) < this.fade) continue;   // PS1-style dissolve instead of alpha
      const k = Y * LW + X; if (buf[k] < 0) this.touched.push(k); buf[k] = ci;
    }
  }
  line(x0, y0, x1, y1, ci, w = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (;;) { this.px(x0 - (w >> 1), y0 - (w >> 1), ci, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  disc(cx, cy, r, ci) { const R = Math.max(0.5, r); for (let y = -Math.ceil(R); y <= Math.ceil(R); y++) for (let x = -Math.ceil(R); x <= Math.ceil(R); x++) if (x * x + y * y <= R * R + 0.3) this.px(cx + x, cy + y, ci); }
  ring(cx, cy, r, ci) { for (let a = 0; a < 64; a++) this.px(cx + Math.cos(a / 64 * 6.283) * r, cy + Math.sin(a / 64 * 6.283) * r, ci); }
  mask(rows, cx, cy, s) {   // draw a mask scaled by s (nearest), centred on cx,cy; letter a=1, b=2 ...
    const h = rows.length, w = rows[0].length, W = Math.max(1, Math.round(w * s)), H = Math.max(1, Math.round(h * s));
    const x0 = Math.round(cx - W / 2), y0 = Math.round(cy - H / 2);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const ch = rows[Math.min(h - 1, Math.floor(j / s))][Math.min(w - 1, Math.floor(i / s))];
      if (ch !== '.') this.px(x0 + i, y0 + j, ch.charCodeAt(0) - 96);
    }
  }
  flush(d) {
    const { LW, buf } = this.fx, pal = this.pal, T = this.touched;
    if (this.out >= 0) {   // 1-px outline around everything this effect drew (4-neighbour)
      const add = [];
      for (const k of T) for (const n of [k - 1, k + 1, k - LW, k + LW]) if (n >= 0 && n < buf.length && buf[n] < 0 && Math.abs((n % LW) - (k % LW)) <= 1) add.push(n);
      for (const n of add) if (buf[n] < 0) { buf[n] = this.out; T.push(n); }
    }
    for (const k of T) { const c = pal[buf[k]]; if (c) { d[k * 4] = c[0]; d[k * 4 + 1] = c[1]; d[k * 4 + 2] = c[2]; d[k * 4 + 3] = 255; } buf[k] = -1; }
    this.touched = [];
  }
}

const q15 = (t) => Math.floor(t * 15 + 1e-6) / 15;
const frame30 = (t) => Math.floor(t * 30 + 1e-6);
const popS = (lt) => { const f = frame30(lt); return f < POP.length ? POP[f] : 1; };

// rising wavy lines (stink, heat). ref stink: 1 px #82c948 squiggles ~30 px tall, amplitude ~3 px, period ~15 px,
// born at the head and rising ~40 px while they shorten, thin from 2 px to 1 px and break up at the top; the first one
// is already up when the effect starts (0750 frames 195-217, zoom in ref: 2 px steps low, 1 px high)
function rising(g, x, y, lt, o, u, zig) {
  const n = o.lines ?? 3, P = o.period ?? 0.9, D = (o.rise ?? 40) * u, L0 = (o.len ?? 30) * u, A = (o.amp ?? 3.5) * u, lam = (o.wave ?? 13) * u;
  const q = q15(lt) + (o.warm ?? 0.35) * P, sp = (o.spread ?? 7) * u, T = o.thick ?? 2;
  for (let i = 0; i < n; i++) {
    const age = q - i * P / n; if (age < 0) continue;
    const cyc = (age % P) / P, gen = Math.floor(age / P);
    const xc = x + (i - (n - 1) / 2) * sp + (hash(i, gen, g.it.seed) - 0.5) * 3 * u, yb = y - cyc * D;
    const L = Math.max(4, L0 * (1 - 0.5 * cyc)), ph = i * 2.1 + gen * 1.3 + cyc * 2.5;
    g.fade = Math.max(0, (cyc - 0.6) / 0.4) * 0.85;
    let px = null; const th = Math.max(1, Math.round((cyc < 0.6 ? T : 1) * u));
    for (let j = 0; j < L; j++) {
      const s = (j / lam + ph / 6.283) % 1;
      const w = zig ? (Math.abs(((s + 1) % 1) * 4 - 2) - 1) : Math.sin(s * 6.283);
      const xx = Math.round(xc + A * w), yy = Math.round(yb - j);
      if (px !== null && Math.abs(xx - px) > 1) for (let k = Math.min(xx, px) + 1; k < Math.max(xx, px); k++) g.px(k, yy + 1, zig ? 1 + (i % 2) : 1, 1, th);   // flat steps like the ref
      g.px(xx, yy, zig ? 1 + (i % 2) : 1, th, 1); px = xx;
    }
  }
  g.fade = 0;
}

const DRAW = {
  stink(g, x, y, lt, o, u) { g.palette([null, o.color || '#82c948']); rising(g, x, y, lt, o, u, false); },
  heat(g, x, y, lt, o, u) { g.palette([null, o.color || '#ff9a2e', '#ffe066']); rising(g, x, y, lt, { period: 0.7, amp: 3, wave: 8, spread: 9, ...o }, u, true); },
  sweat(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#8fd3ff', '#3d8fe0', '#ffffff'], '#173a7a');
    const k = Math.min(1, lt / (o.slide ?? 1.2)), s = 1.4 * u * popS(lt);
    g.mask(M.drop, x, y + Math.round(k * k * 7 * u), s);
  },
  sparkle(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#ffe14a', '#ffffff', '#f0a020']);
    const r = rng(g.it.seed), n = o.n ?? 4, R = (o.radius ?? 14) * u, life = o.life ?? 0.6, q = q15(lt);
    for (let i = 0; i < n; i++) {
      const ox = (r() * 2 - 1) * R, oy = (r() * 2 - 1) * R, off = r() * life;
      const k = ((q + off) % life) / life, gen = Math.floor((q + off) / life);
      const sx = x + ox + (hash(i, gen, 3) - 0.5) * R, sy = y + oy + (hash(i, gen, 5) - 0.5) * R;
      const a = Math.round(Math.sin(Math.PI * k) * 3.5 * u);
      if (a < 1) continue;
      g.px(sx - a, sy, 1, 2 * a + 1, 1); g.px(sx, sy - a, 1, 1, 2 * a + 1);           // 4-point star
      if (a >= 3) { g.px(sx - 1, sy - 1, 3, 1, 1); g.px(sx + 1, sy + 1, 3, 1, 1); g.px(sx + 1, sy - 1, 3, 1, 1); g.px(sx - 1, sy + 1, 3, 1, 1); }
      g.px(sx, sy, 2);
    }
  },
  question(g, x, y, lt, o, u) { g.palette([null, o.color || '#ffd93b', '#e89a18'], '#141414'); g.mask(M.question, x, y + Math.round(Math.sin(q15(lt) * 6) * u), 3 * u * popS(lt)); },
  exclaim(g, x, y, lt, o, u) { g.palette([null, o.color || '#ffd93b', '#e89a18'], '#141414'); g.mask(M.exclaim, x, y + Math.round(Math.sin(q15(lt) * 7) * u), 3 * u * popS(lt)); },
  idea(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#fff27a', '#f0b020', '#ffffff', '#9aa0a8', '#6a7078'], '#141414');
    const s = 2 * u * popS(lt); g.mask(M.bulb, x, y, s);
    if (frame30(lt) >= 3 && Math.floor(q15(lt) * 4) % 2 === 0) for (let k = 0; k < 5; k++) {   // rays
      const a = -Math.PI / 2 + (k - 2) * 0.6, r0 = 9 * s, r1 = 12 * s;
      g.line(x + Math.cos(a) * r0, y - 3 * s + Math.sin(a) * r0, x + Math.cos(a) * r1, y - 3 * s + Math.sin(a) * r1, 1, Math.max(1, Math.round(u)));
    }
  },
  anger(g, x, y, lt, o, u) { g.palette([null, o.color || '#ee2230'], '#4a0008'); const p = Math.floor(q15(lt) * 4) % 2 ? 1.15 : 1; g.mask(M.anger, x, y, 2 * u * popS(lt) * p); },
  heart(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#ff4f7b', '#ffc8d8'], '#5a0820');
    const n = o.n ?? 3, life = o.life ?? 1.2, q = q15(lt);
    for (let i = 0; i < n; i++) {
      const age = q - i * life / n; if (age < 0) continue;
      const k = (age % life) / life, gen = Math.floor(age / life);
      g.fade = Math.max(0, (k - 0.7) / 0.3);
      g.mask(M.heart, x + (hash(i, gen, 9) - 0.5) * 20 * u + Math.sin(k * 9 + i) * 3 * u, y - k * 30 * u, 1.5 * u * (k < 0.1 ? 0.6 + k * 4 : 1));
    }
    g.fade = 0;
  },
  steam(g, x, y, lt, o, u) {   // also smoke: color '#8a8a8a', edge '#5a5a5a'
    g.palette([null, o.color || '#f4f4f4', o.edge || '#c4ccd4']);
    const every = o.every ?? 0.18, life = o.life ?? 1.1, q = q15(lt);
    for (let s = Math.floor((q - life) / every) + 1; s * every <= q; s++) {
      if (s < 0) continue; const k = (q - s * every) / life; if (k < 0 || k >= 1) continue;
      const cx = x + Math.sin(s * 1.7 + k * 3) * 4 * u + (o.drift ?? 6) * u * k, cy = y - k * (o.rise ?? 34) * u, r = (2 + 5 * k) * u;
      g.fade = Math.max(0, (k - 0.55) / 0.45);
      g.disc(cx, cy, r + 1, 2); g.disc(cx - 0.5, cy - 0.5, r, 1);
    }
    g.fade = 0;
  },
  dust(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#efe4c8', o.edge || '#b49a74']);
    const every = o.every ?? 99, q = q15(lt), age = q % every, burst = Math.floor(q / every), life = o.life ?? 0.6, n = o.n ?? 5;
    if (age >= life) return;
    const k = age / life;
    for (let i = 0; i < n; i++) {
      const dir = (i / (n - 1)) * 2 - 1, sp = 18 + hash(i, burst, 2) * 10;
      const cx = x + dir * sp * u * Math.sqrt(k), cy = y - (4 + hash(i, burst, 4) * 6) * u * Math.sqrt(k), r = (1.5 + 3.5 * k) * u;
      g.fade = Math.max(0, (k - 0.5) / 0.5);
      g.disc(cx, cy, r + 1, 2); g.disc(cx, cy - 0.5, r, 1);
    }
    g.fade = 0;
  },
  splash(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#6cc4ff', '#ffffff'], o.edge || '#1a4a8a');
    const every = o.every ?? 99, q = Math.floor(lt * 30) / 30, age = q % every, burst = Math.floor(q / every), n = o.n ?? 12;
    if (age < 0.2) for (let i = -3; i <= 3; i++) { const h = (4 - Math.abs(i)) * 2 * u * Math.sin(Math.PI * age / 0.2); g.px(x + i * 2 * u, y - h, 2, Math.max(1, Math.round(u)), Math.max(1, Math.round(h))); }   // white crown
    for (let i = 0; i < n; i++) {
      const vx = (hash(i, burst, 1) * 2 - 1) * 50 * u, vy = -(80 + hash(i, burst, 2) * 70) * u, t = age;
      const dx = vx * t, dy = vy * t + 300 * u * t * t; if (dy > 4 * u) continue;
      const w = Math.max(1, Math.round((1 + hash(i, burst, 3) * 1.5) * u)); g.px(x + dx, y + dy, 1, w, w); g.px(x + dx, y + dy, 2);
    }
  },
  drip(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#8fd3ff', '#3d8fe0', '#ffffff'], '#1a4a8a');
    const every = o.every ?? 0.6, q = Math.floor(lt * 30) / 30, k = q % every, grow = every * 0.45;
    if (k < grow) g.mask(M.drop, x, y, Math.max(0.3, k / grow) * u);
    else { const t = k - grow; g.mask(M.drop, x, y + 0.5 * 420 * u * t * t, u); }
  },
  bubbles(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#e8f8ff', '#ffffff']);
    const every = o.every ?? 0.16, life = o.life ?? 1.2, q = q15(lt);
    for (let s = Math.floor((q - life) / every) + 1; s * every <= q; s++) {
      if (s < 0) continue; const k = (q - s * every) / life; if (k < 0 || k >= 1) continue;
      const r = 1 + Math.floor(hash(s, 0, g.it.seed) * 2.5) * u, cx = x + (hash(s, 1, g.it.seed) - 0.5) * 16 * u + Math.sin(k * 12 + s) * 2 * u, cy = y - k * 40 * u;
      if (r <= 1) g.px(cx, cy, 1); else { g.ring(cx, cy, r, 1); g.px(cx - r / 2, cy - r / 2, 2); }
    }
  },
  arrow(g, x, y, lt, o, u) {   // angle (rad, 0 = right, + = clockwise on screen), len, n parallel arrows `gap` px apart
    g.palette([null, o.color || '#3c7ce8', o.light || '#9cc8ff'], o.edge || '#0c1c50');
    const a = o.angle ?? 0, ca = Math.cos(a), sa = Math.sin(a), L = (o.len ?? 22) * u, n = o.n ?? 1, gap = (o.gap ?? 10) * u;
    const slide = ((q15(lt) * (o.speed ?? 16) * u) % (o.loop ?? 8 * u)), s = popS(lt);
    const hw = 2 * u * s, hl = 5 * u * s, hh = 4.5 * u * s;   // shaft half width, head length, head half width
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * gap, bx = x - sa * off + ca * slide, by = y + ca * off + sa * slide;
      const R = L * s + 6 * u;
      for (let j = -R; j <= R; j++) for (let k = -R; k <= R; k++) {   // rasterise in arrow space
        const ax = k * ca + j * sa, ay = -k * sa + j * ca, l = ax + L * s / 2;   // l: 0 at tail .. L at tip
        let inside = false, light = false;
        if (l >= 0 && l <= L * s - hl && Math.abs(ay) <= hw) { inside = true; light = ay < -hw * 0.3; }
        else if (l > L * s - hl && l <= L * s && Math.abs(ay) <= hh * (L * s - l) / hl) inside = true;
        if (inside) g.px(bx + k, by + j, light ? 2 : 1);
      }
    }
  },
  wind(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#ffffff', '#bfe0ff']);
    const a = o.angle ?? Math.PI, ca = Math.cos(a), sa = Math.sin(a), n = o.n ?? 4, W = (o.width ?? 60) * u, q = Math.floor(lt * 30) / 30;
    for (let i = 0; i < n; i++) {
      const per = 0.5 + hash(i, 0, g.it.seed) * 0.3, k = ((q / per) + i / n) % 1, off = (hash(i, 1, g.it.seed) - 0.5) * W * 0.6;
      const d = (k - 0.5) * W, len = (10 + 10 * Math.sin(Math.PI * k)) * u;
      const hx = x + ca * d - sa * off, hy = y + sa * d + ca * off;
      g.line(hx, hy, hx - ca * len, hy - sa * len, 1, Math.max(1, Math.round(u)));
      g.line(hx - ca * len, hy - sa * len, hx - ca * len * 1.4, hy - sa * len * 1.4, 2, 1);
    }
  },
  thought(g, x, y, lt, o, u) {   // anchor = head; bubble up-left (dx,dy override), o.icon draws another type inside
    g.palette([null, '#ffffff', '#dfe8f0'], '#2a2a2a');
    const f = frame30(lt), bx = x + (o.bx ?? -18) * u, by = y + (o.by ?? -40) * u, R = (o.r ?? 15) * u;
    [[0.25, 2, 0], [0.5, 3, 3], [0.75, 4, 6]].forEach(([k, r, at]) => { if (f >= at) g.disc(x + (bx - x) * k * 0.7, y + (by - y) * k * 0.7, r * u, 1); });
    if (f >= 9) { const s = f - 9 < POP.length ? POP[f - 9] : 1; g.disc(bx, by, R * s, 1); g.disc(bx + R * s * 0.25, by + R * s * 0.25, R * s * 0.65, 2); g.disc(bx - R * s * 0.1, by - R * s * 0.1, R * s * 0.75, 1); }
    if (o.icon && f >= 12) { g.flush(g.fx.img.data); const g2 = new G(g.fx, g.it); DRAW[o.icon](g2, bx, by, lt - 0.4, {}, u * 0.8); g2.flush(g.fx.img.data); }
  },
  zap(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#fff27a', '#ffffff']);
    const f = Math.floor(lt * 15), n = o.n ?? 4;
    if (hash(f, 0, g.it.seed) < 0.25) return;   // flicker
    for (let i = 0; i < n; i++) {
      let a = hash(i, f, g.it.seed) * 6.283, px = x, py = y; const segs = 3;
      for (let s = 0; s < segs; s++) {
        const len = (3 + hash(i, f * 7 + s, 1) * 4) * u; a += (hash(i, f + s, 2) - 0.5) * 1.6;
        const nx = px + Math.cos(a) * len, ny = py + Math.sin(a) * len; g.line(px, py, nx, ny, s === 0 ? 2 : 1, Math.max(1, Math.round(u))); px = nx; py = ny;
      }
    }
  },
  snow(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#ffffff', '#cfe8ff'], o.edge || '#5a8ac0');
    const n = o.n ?? 8, W = (o.width ?? 70) * u, H = (o.height ?? 60) * u, q = q15(lt);
    for (let i = 0; i < n; i++) {
      const per = 2 + hash(i, 0, g.it.seed) * 1.5, k = ((q / per) + hash(i, 1, g.it.seed)) % 1;
      const fx = x + (hash(i, 2, g.it.seed) - 0.5) * W + Math.sin(q * 2 + i) * 3 * u, fy = y - H / 2 + k * H;
      if (Math.floor(q * 15 + i) % 6 === 0) g.px(fx, fy, 2); else g.mask(M.flake, fx, fy, Math.max(1, Math.round(u)));
    }
  },
  crack(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#141414', '#e8e2d8']);
    const grow = Math.min(1, lt / (o.grow ?? 0.35)), r = rng(g.it.seed), w = Math.max(1, Math.round(u));
    const walk = (px, py, a, len, depth) => {
      const steps = Math.ceil(len * grow);
      for (let s = 0; s < steps; s += 3 * u) {
        a += (r() - 0.5) * 1.1; const nx = px + Math.cos(a) * 3 * u, ny = py + Math.sin(a) * 3 * u;
        g.line(px + 1, py + 1, nx + 1, ny + 1, 2, w); g.line(px, py, nx, ny, 1, w); px = nx; py = ny;
        if (depth < 2 && r() < 0.18) walk(px, py, a + (r() < 0.5 ? 0.9 : -0.9), len * 0.45, depth + 1);
      }
    };
    for (let i = 0; i < (o.n ?? 3); i++) walk(x, y, r() * 6.283, (o.len ?? 26) * u, 0);
  },
  shake(g, x, y, lt, o, u) {   // 3 short curved strokes each side (like '(( body ))'), flipping every 2 frames
    g.palette([null, o.color || '#ffffff', '#9cd8ff'], o.edge || '#1a3a6a');
    const f = Math.floor(lt * 15), W = (o.width ?? 26) * u, H = (o.height ?? 30) * u, j = (f % 2 ? 1 : -1) * u;
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const cx = x + s * (W + k * 5 * u) + j, cy = y + (k - 1) * H * 0.35, L = (9 - k * 2) * u;
      for (let t = -L; t <= L; t++) g.px(cx + s * Math.round(2 * u * (1 - (t / L) ** 2)), cy + t, k === 0 ? 1 : 2, Math.max(1, Math.round(u)), 1);
    }
  },
  impact(g, x, y, lt, o, u) {
    g.palette([null, o.color || '#ffffff', '#ffe14a'], '#141414');
    const k = Math.min(1, lt / (o.life ?? 0.35)); if (k >= 1) return;
    const n = o.n ?? 8, r0 = (5 + 16 * k) * u, r1 = r0 + (9 - 6 * k) * u, w = Math.max(1, Math.round(2 * u));
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + 0.2; g.line(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, 1, w); }
    if (frame30(lt) < 3) g.disc(x, y, 4 * u, 2);
  },
};
