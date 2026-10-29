// =====================================================================
//  head3d.js — a procedurally sculpted female head (three.js r149, global THREE). Metres, real size,
//  head centre at the origin, face looking along +z, neck down to y = -0.2. Code only, deterministic.
//
//  Skin = ONE implicit surface, meshed by surface nets on a narrow band:
//    radial height map r(θ,φ) around HD_O  = skull/jaw/cheek primitives (ray-cast once on a 1° grid)
//                                          + front-face sculpt displacements (brow, sockets, nose, lips, chin…)
//    ∪ neck (+ sternocleidomastoids) ∪ eyelid shells ∪ ears,  minus lid apertures and nostrils.
//  buildHead3D() -> { group, face, hair, eyes, geo }
//    face: Mesh (skin: head + neck + ears), geo: its indexed BufferGeometry (position, normal, uv, color)
//    uv: u = 0.5 + atan2(x, z + 0.02) / 2.6 (left→right), v = (y + 0.12) / 0.21 (chin→hairline); the front of
//        the face lies in [0,1]², elsewhere uv runs outside [0,1].
//    hair: Mesh (pulled back into a low bun), eyes: Group (two eyeballs + corneas).
//  HD_skin(x,y,z) is the skin's signed distance (negative inside), handy for ray-marching dots onto the face.
// =====================================================================

const HD_O = { x: 0, y: 0, z: -0.005 };                        // centre of the radial height map
const HD_E = { x: 0.0315, y: 0.0055, z: 0.0665, R: 0.0118 };   // right eye centre (mirror for left), eyeball radius
const HD_SS = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function HD_smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
function HD_smax(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * k * 0.25; }
function HD_ell(x, y, z, rx, ry, rz) {
  const k0 = Math.sqrt((x / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2);
  const k1 = Math.sqrt((x / (rx * rx)) ** 2 + (y / (ry * ry)) ** 2 + (z / (rz * rz)) ** 2);
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1;
}
// capsule with radius ra at a → rb at b
function HD_cap(px, py, pz, ax, ay, az, bx, by, bz, ra, rb) {
  const bax = bx - ax, bay = by - ay, baz = bz - az, pax = px - ax, pay = py - ay, paz = pz - az;
  const t = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)));
  const dx = pax - bax * t, dy = pay - bay * t, dz = paz - baz * t;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t);
}
// compact smooth bump (1 at centre, 0 beyond the ellipse sx, sy)
function HD_B(x, y, cx, cy, sx, sy) {
  const u = (x - cx) / sx, v = (y - cy) / sy, t = u * u + v * v;
  if (t >= 1) return 0; const w = 1 - t; return w * w * w;
}
// smooth piecewise curve through knots (Catmull-Rom on uniform-in-index knots, x ascending)
function HD_curve(xs, ys, x) {
  const n = xs.length; if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
  let i = 0; while (x > xs[i + 1]) i++;
  const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
  const y0 = ys[Math.max(0, i - 1)], y1 = ys[i], y2 = ys[i + 1], y3 = ys[Math.min(n - 1, i + 2)];
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3);
}

// ---------------------------------------------------------------------
//  base volume: skull, forehead, midface, mandible, cheekbones (mirrored, X = |x|)
// ---------------------------------------------------------------------
function HD_base(x, y, z) {
  const X = Math.abs(x);
  let d = HD_ell(x, y - 0.026, z + 0.012, 0.0715, 0.0905, 0.094);                 // cranium
  d = HD_smin(d, HD_ell(x, y - 0.04, z + 0.005, 0.0645, 0.078, 0.095), 0.03);     // forehead
  let f = HD_ell(x, y + 0.03, z - 0.018, 0.055, 0.068, 0.075);                    // midface / maxilla
  f = HD_smin(f, HD_ell(x, y + 0.06, z - 0.045, 0.036, 0.03, 0.047), 0.02);         // dental arch
  f = HD_smin(f, HD_ell(x, y + 0.054, z - 0.02, 0.048, 0.045, 0.06), 0.025);        // lower cheeks
  f = HD_smin(f, HD_ell(x, y + 0.035, z + 0.005, 0.056, 0.045, 0.065), 0.02);   // sides of the face (masseter)
  const jaw = Math.min(
    HD_cap(X, y, z, 0, -0.095, 0.064, 0.041, -0.068, -0.016, 0.0125, 0.0095),      // mandible body
    HD_cap(X, y, z, 0.041, -0.068, -0.016, 0.05, -0.02, -0.016, 0.0095, 0.011));  // ramus
  f = HD_smin(f, jaw, 0.024);
  f = HD_smin(f, HD_ell(x, y + 0.09, z - 0.069, 0.017, 0.014, 0.0145), 0.02);       // chin pad
  d = HD_smin(d, f, 0.022);
  return d;
}

// ---------------------------------------------------------------------
//  front-face sculpt: radial displacement as a function of the front position (x, y) on the base
// ---------------------------------------------------------------------
// nose tables, y ascending: height above the face and half-width of the cross-section
const HD_NOSE_Y = [-0.044, -0.039, -0.033, -0.027, -0.021, -0.013, -0.003, 0.006, 0.014, 0.022];
const HD_NOSE_H = [0, 0.003, 0.0085, 0.0138, 0.0148, 0.0122, 0.0085, 0.0048, 0.0016, 0];
const HD_NOSE_WY = [-0.047, -0.04, -0.034, -0.026, -0.014, 0.0, 0.012, 0.022];
const HD_NOSE_W = [0.0115, 0.0102, 0.0088, 0.0078, 0.0066, 0.0058, 0.006, 0.0078];
function HD_lipGeom(X) {     // mouth line, upper / lower vermilion borders at |x| = X
  const mx = X / 0.0245;
  const yM = -0.0608 + 0.0004 * mx * mx;
  const yU = yM + (0.0074 - 0.0062 * mx * mx) + 0.0016 * Math.exp(-(((X - 0.0058) / 0.0034) ** 2)) - 0.0012 * Math.exp(-((X / 0.0022) ** 2));
  const yL = yM - 0.0098 * Math.max(0, 1 - mx * mx * 0.95) ** 0.75;
  return { yM, yU, yL };
}
function HD_D(x, y) {
  const X = Math.sqrt(x * x + 2e-7);
  let d = 0;
  // forehead, brow, glabella
  d += 0.0020 * HD_B(X, y, 0, 0.062, 0.055, 0.045);
  d += 0.0028 * HD_B(X, y, 0.027, 0.0255, 0.026, 0.013);
  d -= 0.0045 * HD_B(X, y, 0, 0.011, 0.018, 0.016);                   // nasal root
  // eye sockets (the lid shells fill them), upper-lid sulcus, tear trough
  d -= 0.0150 * HD_B(X, y, 0.0315, 0.0065, 0.0255, 0.0195);
  d -= 0.0016 * HD_B(X, y, 0.034, 0.0155, 0.017, 0.008);
  d -= 0.0018 * HD_B(X, y, 0.025, -0.0105, 0.018, 0.006);
  // cheekbones, cheeks
  d += 0.0055 * HD_B(X, y, 0.047, -0.009, 0.03, 0.032);
  d += 0.0035 * HD_B(X, y, 0.034, -0.028, 0.022, 0.022);
  d += 0.0050 * HD_B(X, y, 0.048, -0.036, 0.04, 0.042);            // full lower cheeks
  // nose: bridge + dorsum + tip, cross-section from the curve tables
  if (y < 0.026 && y > -0.05 && X < 0.03) {
    const nh = HD_curve(HD_NOSE_Y, HD_NOSE_H, y);
    const nw = HD_curve(HD_NOSE_WY, HD_NOSE_W, y);
    const t2 = (X / nw) ** 2;
    if (t2 < 4) { const w = 1 - t2 / 4; d += nh * w * w * w; }
    d -= 0.0014 * HD_B(X, y, 0.018, -0.034, 0.004, 0.008);     // alar-facial groove
  }
  // philtrum
  d += 0.0009 * HD_B(X, y, 0.0045, -0.0495, 0.0032, 0.0085);
  d -= 0.0006 * HD_B(X, y, 0, -0.0495, 0.003, 0.008);
  // lips
  if (y < -0.04 && y > -0.095 && X < 0.045) {
    const L = HD_lipGeom(X), win = HD_SS(0.03, 0.011, X), hu = L.yU - L.yM, hl = L.yM - L.yL;
    const cu = L.yM + Math.max(0.0012, hu) * 0.58, su = Math.max(0.0016, hu * 0.55);
    d += 0.0029 * Math.exp(-(((y - cu) / su) ** 2)) * win;                                  // upper lip
    d += 0.0005 * Math.exp(-(((y - L.yU) / 0.0008) ** 2)) * win;                            // white roll
    const cl = L.yM - Math.max(0.0015, hl) * 0.46, sl = Math.max(0.002, hl * 0.6);
    d += 0.0035 * Math.exp(-(((y - cl) / sl) ** 2)) * win;                                  // lower lip
    d -= 0.0012 * Math.exp(-(((y - L.yM) / 0.0014) ** 2)) * HD_SS(1.1, 0.75, X / 0.0245);    // mouth line
    d -= 0.0022 * HD_B(X, y, 0.0275, L.yM, 0.011, 0.012);         // corners recede
  }
  // mentolabial sulcus, chin
  d -= 0.0012 * HD_B(X, y, 0, -0.0815, 0.024, 0.0065);
  d += 0.0030 * HD_B(X, y, 0, -0.094, 0.026, 0.018);
  return d;
}

// ---------------------------------------------------------------------
//  radial height map, cached on a θ×φ grid
// ---------------------------------------------------------------------
const HD_NT = 1200, HD_NP = 601;
let HD_R = null, HD_G = null;
function HD_buildRadial() {
  if (HD_R) return;
  const O = HD_O, PI = Math.PI;
  // 1) base: bisection along rays on a 1° grid
  const BT = 360, BP = 181, rb = new Float32Array(BT * BP);
  for (let j = 0; j < BP; j++) {
    const ph = -PI / 2 + (j / (BP - 1)) * PI, cp = Math.cos(ph), sp = Math.sin(ph);
    for (let i = 0; i < BT; i++) {
      const th = -PI + (i / BT) * 2 * PI, dx = Math.sin(th) * cp, dz = Math.cos(th) * cp, dy = sp;
      let a = 0.01, b = 0.2;
      for (let s = 0; s < 26; s++) { const m = (a + b) / 2; if (HD_base(O.x + dx * m, O.y + dy * m, O.z + dz * m) < 0) a = m; else b = m; }
      rb[j * BT + i] = (a + b) / 2;
    }
  }
  const rbAt = (fi, fj) => {      // bicubic (Catmull-Rom) sample of the base grid
    const i0 = Math.floor(fi), j0 = Math.floor(fj), tx = fi - i0, ty = fj - j0;
    const cr = (p0, p1, p2, p3, t) => p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0)));
    const row = (j) => { j = Math.min(BP - 1, Math.max(0, j)); const o = j * BT, g = (i) => rb[o + ((i % BT) + BT) % BT];
      return cr(g(i0 - 1), g(i0), g(i0 + 1), g(i0 + 2), tx); };
    return cr(row(j0 - 1), row(j0), row(j0 + 1), row(j0 + 2), ty);
  };
  // 2) fine grid = base + front sculpt
  const R = new Float32Array(HD_NT * HD_NP);
  for (let j = 0; j < HD_NP; j++) {
    const ph = -PI / 2 + (j / (HD_NP - 1)) * PI, cp = Math.cos(ph), sp = Math.sin(ph);
    for (let i = 0; i < HD_NT; i++) {
      const th = -PI + (i / HD_NT) * 2 * PI;
      const r0 = rbAt((th + PI) / (2 * PI) * BT, (ph + PI / 2) / PI * (BP - 1));
      let r = r0;
      if (Math.abs(th) < 1.7 && ph > -1.45 && ph < 1.3) {
        const px = O.x + Math.sin(th) * cp * r0, py = O.y + sp * r0, pz = O.z + Math.cos(th) * cp * r0;
        const wf = HD_SS(-0.012, 0.03, pz) * HD_SS(-1.45, -1.15, ph) * HD_SS(1.3, 1.05, ph);
        if (wf > 0) r += HD_D(px, py) * wf;
      }
      R[j * HD_NT + i] = r;
    }
  }
  // 3) gradient normaliser so (ρ - r)/G is close to a distance
  const G = new Float32Array(HD_NT * HD_NP), dT = 2 * PI / HD_NT, dP = PI / (HD_NP - 1);
  for (let j = 0; j < HD_NP; j++) {
    const cp = Math.max(0.05, Math.cos(-PI / 2 + j * dP)), ja = Math.max(0, j - 1), jb = Math.min(HD_NP - 1, j + 1);
    for (let i = 0; i < HD_NT; i++) {
      const r = R[j * HD_NT + i];
      const rt = (R[j * HD_NT + (i + 1) % HD_NT] - R[j * HD_NT + (i + HD_NT - 1) % HD_NT]) / (2 * dT);
      const rp = (R[jb * HD_NT + i] - R[ja * HD_NT + i]) / ((jb - ja) * dP);
      G[j * HD_NT + i] = Math.sqrt(1 + (rt / (r * cp)) ** 2 + (rp / r) ** 2);
    }
  }
  HD_R = R; HD_G = G;
}
function HD_radial(x, y, z) {
  const dx = x - HD_O.x, dy = y - HD_O.y, dz = z - HD_O.z, rho = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (rho < 1e-5) return -0.08;
  const th = Math.atan2(dx, dz), ph = Math.asin(Math.max(-1, Math.min(1, dy / rho)));
  const fi = (th + Math.PI) / (2 * Math.PI) * HD_NT, fj = (ph + Math.PI / 2) / Math.PI * (HD_NP - 1);
  let i0 = Math.floor(fi), j0 = Math.floor(fj); const tx = fi - i0, ty = fj - j0;
  if (j0 >= HD_NP - 1) j0 = HD_NP - 2; i0 = ((i0 % HD_NT) + HD_NT) % HD_NT; const i1 = (i0 + 1) % HD_NT;
  const a = j0 * HD_NT, b = a + HD_NT, R = HD_R, G = HD_G;
  const r = (R[a + i0] * (1 - tx) + R[a + i1] * tx) * (1 - ty) + (R[b + i0] * (1 - tx) + R[b + i1] * tx) * ty;
  const g = (G[a + i0] * (1 - tx) + G[a + i1] * tx) * (1 - ty) + (G[b + i0] * (1 - tx) + G[b + i1] * tx) * ty;
  return (rho - r) / g;
}

// ---------------------------------------------------------------------
//  neck, ears, lid apertures, nostrils
// ---------------------------------------------------------------------
function HD_neck(x, y, z) {
  const cz = -0.031 + 0.115 * (y + 0.2);
  const ax = 0.0525 + 0.012 * HD_SS(-0.14, -0.205, y), az = 0.0455;
  let d = (Math.sqrt((x / ax) ** 2 + ((z - cz) / az) ** 2) - 1) * Math.min(ax, az);
  const X = Math.abs(x);
  d = HD_smin(d, HD_cap(X, y, z, 0.043, -0.072, -0.03, 0.014, -0.205, 0.026, 0.0095, 0.0085), 0.024); // sternocleidomastoid
  d = HD_smax(d, -0.2 - y, 0.004);
  return Math.max(d, y + 0.01);
}
function HD_ear(X, y, z) {
  // ear-local frame: u back (in the ear plane), v up, w out of the ear plane
  const px = X - 0.0700, py = y + 0.0045, pz = z + 0.0125;
  const ca = Math.cos(0.42), sa = Math.sin(0.42), cb = Math.cos(0.26), sb = Math.sin(0.26);
  const u0 = px * sa - pz * ca, w = px * ca + pz * sa;           // yaw: back edge flares out
  const u = u0 * cb - py * sb, v = u0 * sb + py * cb;            // tilt: top leans back
  if (Math.abs(u) > 0.035 || Math.abs(v) > 0.045 || w > 0.03 || w < -0.03) return 0.02;
  // outline: egg, wider on top, the lobe narrower
  const cu = 0.0025, cv = 0.0015, ru = v > cv ? 0.0168 : 0.0168 - 0.0045 * Math.min(1, (cv - v) / 0.03) ** 2;
  const rv = v > cv ? 0.0295 : 0.0325;
  const qu = (u - cu) / ru, qv = (v - cv) / rv, q = Math.sqrt(qu * qu + qv * qv);
  const e2 = (q - 1) * 0.0145;
  const w0 = 0.0035 + 0.0055 * q * q + 0.003 * HD_SS(-0.005, 0.02, u);   // cupped, back edge further out
  const back = 0.022 * (1 - HD_SS(0.42, 0.78, q));                         // root fuses into the head
  let d = Math.max(e2, w - w0 - 0.0013, w0 - 0.0013 - back - w);
  // helix rim (upper and back), rolled
  const rimW = HD_SS(-0.022, -0.008, v) * (1 - HD_SS(0.0, 0.006, -u) * HD_SS(0.006, -0.004, v));
  const rt = 0.0027;
  const rim = Math.sqrt((e2 + rt) ** 2 + (w - w0 - 0.0004) ** 2) - rt + (1 - rimW) * 0.01;
  d = HD_smin(d, rim, 0.0012);
  // lobe: soft and a little thicker
  const lobe = HD_ell(u - 0.003, v + 0.0225, w - w0 + 0.0003, 0.0085, 0.0085, 0.0028);
  d = HD_smin(d, lobe, 0.002);
  // scapha groove inside the rim, concha bowl, tragus, canal
  const sc = Math.sqrt((e2 + 0.0062) ** 2 + (w - w0 - 0.0019) ** 2) - 0.0016 + (1 - rimW * HD_SS(-0.012, 0.0, v)) * 0.01;
  d = HD_smax(d, -sc, 0.0012);
  const fossa = HD_ell(u - 0.0015, v - 0.0165, w - w0 - 0.0028, 0.0055, 0.0045, 0.0026);
  d = HD_smax(d, -fossa, 0.0015);
  const concha = HD_ell(u + 0.0015, v + 0.0035, w - w0 - 0.0045, 0.0088, 0.0105, 0.0068);
  d = HD_smax(d, -concha, 0.0018);
  const tragus = HD_ell(u + 0.0118, v + 0.006, w - w0 - 0.0006, 0.0028, 0.0042, 0.0032);
  d = HD_smin(d, tragus, 0.0018);
  const canal = HD_ell(u + 0.0068, v + 0.0045, w - w0 + 0.0035, 0.0026, 0.0032, 0.006);
  d = HD_smax(d, -canal, 0.0012);
  return d;
}
const HD_AM = -0.95, HD_AL = 1.28;
function HD_aperture(lx, ly, lz, re) {            // lx: lateral (+ toward the outer corner), relative to the eye centre
  const az = Math.atan2(lx, lz), el = Math.atan2(ly, Math.sqrt(lx * lx + lz * lz));
  const t = (2 * az - (HD_AL + HD_AM)) / (HD_AL - HD_AM), w = Math.max(0, 1 - t * t), tilt = 0.075 * t;
  const up = 0.31 * Math.pow(w, 0.55) * (1 - 0.12 * t) + tilt;
  const lo = -0.33 * Math.pow(w, 0.75) * (1 + 0.10 * t) + tilt;
  let da = Math.max(el - up, lo - el);
  if (Math.abs(t) > 1) da = Math.max(da, (Math.abs(t) - 1) * 0.6);
  return Math.max(da * re, re - (HD_E.R + 0.0042));
}
function HD_skin(x, y, z) {
  let d = HD_radial(x, y, z);
  if (y < 0.03) d = HD_smin(d, HD_neck(x, y, z), 0.018);
  const X = Math.abs(x), ex = X - HD_E.x, ey = y - HD_E.y, ez = z - HD_E.z, re = Math.sqrt(ex * ex + ey * ey + ez * ez);
  if (re < 0.03) d = HD_smin(d, re - (HD_E.R + 0.0019), 0.0036);
  if (X > 0.048 && y > -0.05 && y < 0.045 && z > -0.05 && z < 0.025) d = HD_smin(d, HD_ear(X, y, z), 0.0026);
  if (re < 0.022) d = HD_smax(d, -HD_aperture(ex, ey, ez, re), 0.0007);
  if (X < 0.03 && y < -0.015 && y > -0.055 && z > 0.07) {       // nose tip lobule, alae, columella, nostrils
    let n = HD_ell(x, y + 0.0305, z - 0.1042, 0.0076, 0.0068, 0.0084);
    n = HD_smin(n, HD_ell(X - 0.0102, y + 0.0352, z - 0.0905, 0.0041, 0.0048, 0.0072), 0.009);
    n = HD_smin(n, HD_cap(x, y, z, 0, -0.0355, 0.1015, 0, -0.0432, 0.0935, 0.0030, 0.0033), 0.003);
    d = HD_smin(d, n, 0.0034);
    const nx = X - 0.0056, ny = y + 0.0398, nz = z - 0.0985, c = 0.94, s = 0.34;   // shallow nostril dents in the underside
    d = HD_smax(d, -HD_ell(nx, ny * c - nz * s, ny * s + nz * c, 0.0026, 0.0012, 0.0044), 0.003);
  }
  return d;
}

// ---------------------------------------------------------------------
//  hair: a shell over the skull behind a hairline, pulled back into a low bun, with combed grooves
// ---------------------------------------------------------------------
const HD_HL_T = [0, 0.3, 0.55, 0.78, 1.0, 1.18, 1.32, 1.45, 1.62, 1.85, 2.05, 2.3, 2.7, 3.15];
const HD_HL_Y = [0.084, 0.080, 0.071, 0.058, 0.044, 0.030, 0.026, 0.034, 0.037, 0.035, 0.022, -0.012, -0.045, -0.058];
const HD_BUN = { y: -0.006, z: -0.112 };
// strand coordinate: azimuth around the axis from the bun toward the brow (strands are its meridians)
function HD_strand(x, y, z) {
  const py = y - HD_BUN.y, pz = z - HD_BUN.z;
  return Math.atan2(py * 0.983 - pz * 0.182, x);
}
function HD_hairF(x, y, z) {
  const dx = x - HD_O.x, dz = z - HD_O.z, th = Math.abs(Math.atan2(dx, dz));
  const hl = HD_curve(HD_HL_T, HD_HL_Y, th);
  if (y < hl - 0.02) return 0.01;
  let s = HD_radial(x, y, z);
  if (y < 0.03) s = HD_smin(s, HD_neck(x, y, z), 0.018);
  const above = y - hl, thick = 0.0009 + 0.0092 * HD_SS(0.0, 0.05, above);
  // combed grooves: constant along strands that run from the hairline to the bun
  const ga = HD_strand(x, y, z);
  const groove = (0.00010 * Math.sin(ga * 140 + 0.9 * Math.sin(ga * 9)) + 0.00012 * Math.sin(ga * 37 + 1.3)) * HD_SS(0.003, 0.02, above);
  let d = Math.max(s - thick - groove, -(s + 0.003));
  d = HD_smax(d, -above * 0.7, 0.0015);
  // bun: a coiled knot at the nape
  const bx = x, by = y - HD_BUN.y, bz = z - HD_BUN.z;
  let bun = HD_ell(bx, by, bz, 0.029, 0.023, 0.019);
  const ba = Math.atan2(by, bx), br = Math.sqrt(bx * bx + by * by);
  bun -= 0.0007 * Math.sin(ba * 3 + br * 420) * HD_SS(0.004, 0.012, br);
  d = HD_smin(d, bun, 0.012);
  return d;
}

// ---------------------------------------------------------------------
//  surface nets on a narrow band (coarse grid → exact values only near the surface)
// ---------------------------------------------------------------------
function HD_mesh(f, x0, y0, z0, x1, y1, z1, h) {
  const nx = Math.ceil((x1 - x0) / h) + 1, ny = Math.ceil((y1 - y0) / h) + 1, nz = Math.ceil((z1 - z0) / h) + 1;
  const C = 4, cnx = Math.ceil((nx - 1) / C) + 1, cny = Math.ceil((ny - 1) / C) + 1, cnz = Math.ceil((nz - 1) / C) + 1;
  const cv = new Float32Array(cnx * cny * cnz), Hc = h * C;
  for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++)
    cv[(k * cny + j) * cnx + i] = f(x0 + i * Hc, y0 + j * Hc, z0 + k * Hc);
  const band = 3.2 * h;
  let evals = cnx * cny * cnz;
  const fill = (L, k) => {
    const z = z0 + k * h, ck = Math.min(cnz - 2, Math.floor(k / C)), tz = k / C - ck;
    for (let j = 0; j < ny; j++) {
      const cj = Math.min(cny - 2, Math.floor(j / C)), ty = j / C - cj, y = y0 + j * h;
      for (let i = 0; i < nx; i++) {
        const ci = Math.min(cnx - 2, Math.floor(i / C)), tx = i / C - ci;
        const o = (ck * cny + cj) * cnx + ci, oy = cnx, oz = cnx * cny;
        const c00 = cv[o] + (cv[o + 1] - cv[o]) * tx, c10 = cv[o + oy] + (cv[o + oy + 1] - cv[o + oy]) * tx;
        const c01 = cv[o + oz] + (cv[o + oz + 1] - cv[o + oz]) * tx, c11 = cv[o + oz + oy] + (cv[o + oz + oy + 1] - cv[o + oz + oy]) * tx;
        const v = (c00 + (c10 - c00) * ty) * (1 - tz) + (c01 + (c11 - c01) * ty) * tz;
        if (Math.abs(v) < band) { L[j * nx + i] = f(x0 + i * h, y, z); evals++; } else L[j * nx + i] = v;
      }
    }
  };
  let F0 = new Float32Array(nx * ny), F1 = new Float32Array(nx * ny);
  const cw = nx - 1, ch = ny - 1, VB = new Int32Array(2 * cw * ch);
  let pos = new Float32Array(1 << 18), np = 0, idx = new Uint32Array(1 << 19), ni = 0;
  const pushV = (x, y, z) => { if (np * 3 + 3 > pos.length) { const a = new Float32Array(pos.length * 2); a.set(pos); pos = a; } pos[np * 3] = x; pos[np * 3 + 1] = y; pos[np * 3 + 2] = z; return np++; };
  const quad = (a, b, c, d) => {
    if (ni + 6 > idx.length) { const t = new Uint32Array(idx.length * 2); t.set(idx); idx = t; }
    const dac = (pos[a * 3] - pos[c * 3]) ** 2 + (pos[a * 3 + 1] - pos[c * 3 + 1]) ** 2 + (pos[a * 3 + 2] - pos[c * 3 + 2]) ** 2;
    const dbd = (pos[b * 3] - pos[d * 3]) ** 2 + (pos[b * 3 + 1] - pos[d * 3 + 1]) ** 2 + (pos[b * 3 + 2] - pos[d * 3 + 2]) ** 2;
    if (dac <= dbd) { idx[ni++] = a; idx[ni++] = b; idx[ni++] = c; idx[ni++] = a; idx[ni++] = c; idx[ni++] = d; }
    else { idx[ni++] = a; idx[ni++] = b; idx[ni++] = d; idx[ni++] = b; idx[ni++] = c; idx[ni++] = d; }
  };
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cval = new Float64Array(8);
  fill(F1, 0);
  for (let k = 0; k < nz - 1; k++) {
    const T = F0; F0 = F1; F1 = T; fill(F1, k + 1);
    const cur = (k & 1) * cw * ch, prv = ((k + 1) & 1) * cw * ch;
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const o = j * nx + i;
      cval[0] = F0[o]; cval[1] = F0[o + 1]; cval[2] = F0[o + nx]; cval[3] = F0[o + nx + 1];
      cval[4] = F1[o]; cval[5] = F1[o + 1]; cval[6] = F1[o + nx]; cval[7] = F1[o + nx + 1];
      let mask = 0; for (let c = 0; c < 8; c++) if (cval[c] < 0) mask |= 1 << c;
      const ci = cur + j * cw + i;
      if (mask === 0 || mask === 255) { VB[ci] = -1; continue; }
      let sx = 0, sy = 0, sz = 0, n = 0;
      for (let e = 0; e < 12; e++) {
        const a = EDGES[e][0], b = EDGES[e][1], va = cval[a], vb = cval[b];
        if ((va < 0) === (vb < 0)) continue;
        const t = va / (va - vb);
        sx += (a & 1) + ((b & 1) - (a & 1)) * t; sy += ((a >> 1) & 1) + (((b >> 1) & 1) - ((a >> 1) & 1)) * t; sz += ((a >> 2) & 1) + (((b >> 2) & 1) - ((a >> 2) & 1)) * t; n++;
      }
      VB[ci] = pushV(x0 + (i + sx / n) * h, y0 + (j + sy / n) * h, z0 + (k + sz / n) * h);
      const in0 = cval[0] < 0;
      if (j > 0 && k > 0 && in0 !== (cval[1] < 0)) {        // x-edge
        const a = VB[prv + (j - 1) * cw + i], b = VB[prv + j * cw + i], c = VB[ci], d = VB[cur + (j - 1) * cw + i];
        if (in0) quad(a, b, c, d); else quad(d, c, b, a);
      }
      if (i > 0 && k > 0 && in0 !== (cval[2] < 0)) {        // y-edge
        const a = VB[prv + j * cw + i - 1], b = VB[cur + j * cw + i - 1], c = VB[ci], d = VB[prv + j * cw + i];
        if (in0) quad(a, b, c, d); else quad(d, c, b, a);
      }
      if (i > 0 && j > 0 && in0 !== (cval[4] < 0)) {        // z-edge
        const a = VB[cur + (j - 1) * cw + i - 1], b = VB[cur + (j - 1) * cw + i], c = VB[ci], d = VB[cur + j * cw + i - 1];
        if (in0) quad(a, b, c, d); else quad(d, c, b, a);
      }
    }
  }
  // project onto the surface, then normals from the field gradient
  const P = pos.subarray(0, np * 3), N = new Float32Array(np * 3), e = h * 0.45;
  const grad = (x, y, z, out) => {
    const a = f(x + e, y - e, z - e), b = f(x - e, y - e, z + e), c = f(x - e, y + e, z - e), d = f(x + e, y + e, z + e);
    out[0] = a - b - c + d; out[1] = -a - b + c + d; out[2] = -a + b - c + d; out[3] = (a + b + c + d) / 4;
  };
  const g = new Float64Array(4);
  for (let v = 0; v < np; v++) {
    let x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    grad(x, y, z, g); let gl2 = g[0] * g[0] + g[1] * g[1] + g[2] * g[2];
    if (gl2 > 1e-20) {
      const s = g[3] * 4 * e / gl2, mv = Math.min(h * 0.6, Math.abs(s * Math.sqrt(gl2)));
      const sc = mv / Math.max(1e-12, Math.abs(s * Math.sqrt(gl2)));
      x -= g[0] * s * sc; y -= g[1] * s * sc; z -= g[2] * s * sc;
      P[v * 3] = x; P[v * 3 + 1] = y; P[v * 3 + 2] = z;
      grad(x, y, z, g); gl2 = g[0] * g[0] + g[1] * g[1] + g[2] * g[2];
    }
    const il = 1 / Math.sqrt(Math.max(gl2, 1e-30));
    N[v * 3] = g[0] * il; N[v * 3 + 1] = g[1] * il; N[v * 3 + 2] = g[2] * il;
  }
  evals += np * 8;
  return { pos: new Float32Array(P), nrm: N, idx: idx.slice(0, ni), np, nt: ni / 3, evals };
}

// ---------------------------------------------------------------------
//  skin tint (multiplies the material colour): brows, lips, lash line, a little blush
// ---------------------------------------------------------------------
function HD_tint(x, y, z, out) {
  const X = Math.abs(x);
  let r = 1, g = 1, b = 1;
  if (z > 0.03) {
    // brows: arched, thick at the head, tapering out
    if (X > 0.008 && X < 0.058 && y > 0.012 && y < 0.04) {
      const t = (X - 0.013) / 0.04;
      const yc = 0.0225 + 0.0105 * Math.sin(Math.min(1, Math.max(0, t)) * 2.4) - 0.003 * Math.max(0, t - 0.75);
      const hw = 0.0042 - 0.0022 * Math.max(0, Math.min(1, t));
      const dn = Math.exp(-((Math.abs(y - yc) / hw) ** 2) * 1.6) * HD_SS(-0.12, 0.08, t) * (1 - HD_SS(0.92, 1.08, t));
      const k = 1 - 0.5 * dn; r *= k; g *= k * 0.95; b *= k * 0.93;
    }
    // lips
    if (y < -0.045 && y > -0.08 && X < 0.03) {
      const L = HD_lipGeom(X), inU = HD_SS(0.0006, -0.0004, y - L.yU) * (y > L.yM ? 1 : 0), inL = HD_SS(-0.0006, 0.0004, y - L.yL) * (y <= L.yM ? 1 : 0);
      const lip = Math.max(inU, inL) * HD_SS(0.03, 0.022, X);
      r *= 1 - 0.10 * lip; g *= 1 - 0.30 * lip; b *= 1 - 0.24 * lip;
    }
    // lash line along the upper lid margin
    const ex = X - HD_E.x, ey = y - HD_E.y, ez = z - HD_E.z, re = Math.sqrt(ex * ex + ey * ey + ez * ez);
    if (re < HD_E.R + 0.0065 && ey > -0.002) {
      const ap = HD_aperture(ex, ey, ez, re);
      const lash = (1 - HD_SS(0.0006, 0.0024 + 0.0012 * HD_SS(0, 0.012, ex), Math.abs(ap))) * HD_SS(-0.002, 0.0015, ey);
      const k = 1 - 0.85 * lash; r *= k; g *= k; b *= k;
    }
    // nostrils: darker underside of the nose
    if (X < 0.011 && y < -0.033 && y > -0.045) { const k = 1 - 0.55 * HD_B(X, y, 0.0056, -0.0395, 0.0035, 0.0028); r *= k; g *= k; b *= k; }
    // blush on the cheeks, warmer nose tip
    const bl = HD_B(X, y, 0.038, -0.018, 0.03, 0.026) * 0.035 + HD_B(X, y, 0, -0.03, 0.012, 0.01) * 0.04;
    g *= 1 - bl; b *= 1 - bl * 0.8;
  }
  out[0] = r; out[1] = g; out[2] = b;
}

// ---------------------------------------------------------------------
//  eyes: eyeballs coloured by angle (sclera, limbus, iris, pupil) + a glossy cornea
// ---------------------------------------------------------------------
function HD_eyes() {
  const grp = new THREE.Group(), R = HD_E.R - 0.0002;
  const geo = new THREE.SphereGeometry(R, 72, 56); geo.rotateX(Math.PI / 2);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.acos(Math.max(-1, Math.min(1, z / R))), ang = Math.atan2(y, x);
    let c;
    if (a < 0.19) c = [0.05, 0.045, 0.04];
    else if (a < 0.47) {
      const t = (a - 0.19) / 0.28, fib = 0.85 + 0.15 * Math.sin(ang * 23) * Math.sin(ang * 7 + 1);
      c = [(0.46 - 0.16 * t) * fib, (0.30 - 0.11 * t) * fib, (0.16 - 0.07 * t) * fib];
      if (t > 0.82) { const k = 1 - (t - 0.82) * 3; c = c.map((v) => v * Math.max(0.35, k)); }
    } else { const t = HD_SS(0.47, 0.62, a); c = [0.06 + 0.74 * t, 0.05 + 0.68 * t, 0.045 + 0.62 * t]; if (a > 1.2) { c[1] *= 0.93; c[2] *= 0.9; } }
    col[i * 3] = c[0] ** 2.2; col[i * 3 + 1] = c[1] ** 2.2; col[i * 3 + 2] = c[2] ** 2.2;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0 });
  const cg = new THREE.SphereGeometry(0.0078, 40, 20, 0, Math.PI * 2, 0, 0.82); cg.rotateX(Math.PI / 2); cg.translate(0, 0, 0.00493);
  const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.18, depthWrite: false });
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * HD_E.x, HD_E.y, HD_E.z);
    const ball = new THREE.Mesh(geo, mat); ball.name = 'eyeball'; e.add(ball);
    const cor = new THREE.Mesh(cg, cm); cor.name = 'cornea'; cor.renderOrder = 2; e.add(cor);
    grp.add(e);
  }
  grp.name = 'eyes';
  return grp;
}

// ---------------------------------------------------------------------
function buildHead3D(opts = {}) {
  const t0 = performance.now();
  HD_buildRadial();
  const t1 = performance.now();
  const h = opts.h || 0.0014;
  const xs = Math.ceil(0.097 / h) * h;                    // grid symmetric about x = 0
  const M = HD_mesh(HD_skin, -xs, -0.204, -0.118, xs, 0.134, 0.138, h);
  const t2 = performance.now();
  const uv = new Float32Array(M.np * 2), col = new Float32Array(M.np * 3), tc = [1, 1, 1];
  for (let v = 0; v < M.np; v++) {
    const x = M.pos[v * 3], y = M.pos[v * 3 + 1], z = M.pos[v * 3 + 2];
    uv[v * 2] = 0.5 + Math.atan2(x, z + 0.02) / 2.6; uv[v * 2 + 1] = (y + 0.12) / 0.21;
    HD_tint(x, y, z, tc); col[v * 3] = tc[0]; col[v * 3 + 1] = tc[1]; col[v * 3 + 2] = tc[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(M.pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(M.nrm, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(new THREE.BufferAttribute(M.idx, 1));
  geo.computeBoundingSphere(); geo.computeBoundingBox();
  const skin = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xc99a7e).convertSRGBToLinear(), roughness: 0.6, metalness: 0, vertexColors: true });
  const face = new THREE.Mesh(geo, skin); face.name = 'face';
  // hair
  const hh = opts.hh || 0.0016, hx = Math.ceil(0.09 / hh) * hh;
  const HM = HD_mesh(HD_hairF, -hx, -0.07, -0.15, hx, 0.145, 0.105, hh);
  const hg = new THREE.BufferGeometry();
  hg.setAttribute('position', new THREE.BufferAttribute(HM.pos, 3));
  hg.setAttribute('normal', new THREE.BufferAttribute(HM.nrm, 3));
  const hc = new Float32Array(HM.np * 3);
  for (let v = 0; v < HM.np; v++) {
    const a = HD_strand(HM.pos[v * 3], HM.pos[v * 3 + 1], HM.pos[v * 3 + 2]);
    const k = 0.8 + 0.12 * Math.sin(a * 23 + 2 * Math.sin(a * 5)) + 0.08 * Math.sin(a * 61 + 0.7);
    hc[v * 3] = k; hc[v * 3 + 1] = k * 0.97; hc[v * 3 + 2] = k * 0.95;
  }
  hg.setAttribute('color', new THREE.BufferAttribute(hc, 3));
  hg.setIndex(new THREE.BufferAttribute(HM.idx, 1));
  hg.computeBoundingSphere();
  const hair = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ color: new THREE.Color(0x3a2418).convertSRGBToLinear(), roughness: 0.5, metalness: 0, vertexColors: true })); hair.name = 'hair';
  const t3 = performance.now();
  const eyes = HD_eyes();
  const group = new THREE.Group(); group.name = 'head3d';
  group.add(face, hair, eyes);
  group.userData = { buildMs: Math.round(performance.now() - t0), radialMs: Math.round(t1 - t0), skinMs: Math.round(t2 - t1), hairMs: Math.round(t3 - t2),
    tris: M.nt, verts: M.np, hairTris: HM.nt, evals: M.evals + HM.evals };
  return { group, face, hair, eyes, geo };
}
