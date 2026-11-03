// =====================================================================
//  CHARACTER — "you": a stylized young adult (Pixar-lite proportions, ~6.6 heads, smooth sculpted shapes).
//  Everything is sculpted in code as signed-distance fields (smooth-blended ellipsoids, round cones, boxes) and
//  meshed once with surface nets: one continuous hoodie (torso + hood + sleeves), jeans, neck and two hands are
//  SkinnedMeshes on one skeleton (no seams at joints); head, hair, eyes and shoes are rigid on their bones.
//  chBuild() makes the rig once; chPose() poses it every frame (pose blend, walk, idle, hands, face, ground lock).
//  Units: metres, feet at y = 0, facing +Z, +X = the character's left.
// =====================================================================
const CH_COL = { skin: '#eab08a', blush: '#e48a74', hair: '#2f1e14', hairHi: '#8a5a38', hood: '#3f9d6f', hoodD: '#2f8059', tee: '#e4ddd0', jeans: '#3a5272', jeansL: '#5f7a9c', shoe: '#f4f2ed', sole: '#e4dccb', accent: '#2f8a5f', lace: '#ebe7df', iris: '#6b4426', lash: '#1e130d', lips: '#b9665a', nail: '#eeb7a0' };

// ---------- SDF kit: primitives in their own frames, smooth union / subtraction, evaluated in bind (world) space
const CH_T = { ell: 0, cone: 1, box: 2, cyl: 3, tor: 4, fn: 5 };
function chSmin(a, b, k) { if (k <= 0) return a < b ? a : b; const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
const chSmax = (a, b, k) => -chSmin(-a, -b, k);
function chRCone(px, py, pz, a, b, r1, r2) {   // iq's round cone (exact)
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2], l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pax = px - a[0], pay = py - a[1], paz = pz - a[2], y = pax * bax + pay * bay + paz * baz, z = y - l2;
  const qx = pax * l2 - bax * y, qy = pay * l2 - bay * y, qz = paz * l2 - baz * y, x2 = qx * qx + qy * qy + qz * qz, y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
// d: { t, bn (bone), c, rot, r | a,b,r1,r2,sc,cut | h,rr | rx,rz,hh,rr | R,r ; k (blend), op 'u'|'s', tag, w (bone weights), disp }
function chPrim(d, Mb) {
  const M = new THREE.Matrix4().copy(Mb);
  if (d.c || d.rot) M.multiply(new THREE.Matrix4().compose(V3(...(d.c ?? [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(d.rot ?? [0, 0, 0]))), V3(1, 1, 1)));
  const p = Object.assign({}, d, { T: CH_T[d.t], e: Float64Array.from(new THREE.Matrix4().copy(M).invert().elements), k: d.k ?? 0, op: d.op ?? 'u', tag: d.tag ?? '' });
  let lc = [0, 0, 0], lr = 0;
  if (d.t === 'ell') lr = Math.max(...d.r);
  if (d.t === 'cone') { lc = [(d.a[0] + d.b[0]) / 2, (d.a[1] + d.b[1]) / 2, (d.a[2] + d.b[2]) / 2]; lr = Math.hypot(d.b[0] - d.a[0], d.b[1] - d.a[1], d.b[2] - d.a[2]) / 2 + Math.max(d.r1, d.r2); if (d.sc) { lr *= Math.max(1, ...d.sc); p.scm = Math.min(...d.sc); } }
  if (d.t === 'box') lr = Math.hypot(...d.h) + d.rr;
  if (d.t === 'cyl') lr = Math.hypot(Math.max(d.rx, d.rz), d.hh) + (d.rr ?? 0);
  if (d.t === 'tor') lr = d.R * Math.max(1, ...(d.sc ?? [1, 1])) + d.r;
  if (d.t === 'fn') { lc = d.bc ?? [0, 0, 0]; lr = d.br; }
  const cw = V3(...lc).applyMatrix4(M); p.cx = cw.x; p.cy = cw.y; p.cz = cw.z; p.cr = lr + p.k + (d.disp ? 0.012 : 0);
  return p;
}
function chPrimD(p, x, y, z) {
  const e = p.e;
  let lx = e[0] * x + e[4] * y + e[8] * z + e[12], ly = e[1] * x + e[5] * y + e[9] * z + e[13], lz = e[2] * x + e[6] * y + e[10] * z + e[14], v;
  const ox = lx, oy = ly, oz = lz;
  switch (p.T) {
    case 0: { const r = p.r, ax = lx / r[0], ay = ly / r[1], az = lz / r[2], k0 = Math.sqrt(ax * ax + ay * ay + az * az), bx = ax / r[0], by = ay / r[1], bz = az / r[2], k1 = Math.sqrt(bx * bx + by * by + bz * bz); v = k1 < 1e-9 ? -Math.min(r[0], r[1], r[2]) : k0 * (k0 - 1) / k1; break; }
    case 1: { if (p.sc) { lx /= p.sc[0]; lz /= p.sc[1]; } v = chRCone(lx, ly, lz, p.a, p.b, p.r1, p.r2) * (p.sc ? p.scm : 1); if (p.cut != null) v = chSmax(v, p.cut - ly, 0.006); break; }
    case 2: { const qx = Math.abs(lx) - p.h[0], qy = Math.abs(ly) - p.h[1], qz = Math.abs(lz) - p.h[2]; v = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - p.rr; break; }
    case 3: { const d2 = (Math.hypot(lx / p.rx, lz / p.rz) - 1) * Math.min(p.rx, p.rz), dy = Math.abs(ly) - p.hh; v = Math.hypot(Math.max(d2, 0), Math.max(dy, 0)) + Math.min(Math.max(d2, dy), 0) - (p.rr ?? 0); break; }
    case 4: { const sc = p.sc ?? [1, 1], q = Math.hypot(lx / sc[0], lz / sc[1]) * Math.min(sc[0], sc[1]) - p.R; v = Math.hypot(q, ly) - p.r; break; }
    case 5: v = p.fn(lx, ly, lz); break;
  }
  if (p.disp) v += p.disp(ox, oy, oz);
  return v;
}
function chSdfFn(P) {
  return (x, y, z) => {
    let d = 1e9;
    for (let i = 0; i < P.length; i++) {
      const p = P[i], dx = x - p.cx, dy = y - p.cy, dz = z - p.cz, lb = Math.sqrt(dx * dx + dy * dy + dz * dz) - p.cr;
      if (p.op === 'u') { if (lb > d + p.k) continue; d = chSmin(d, chPrimD(p, x, y, z), p.k); } else { if (lb > p.k - d) continue; d = chSmax(d, -chPrimD(p, x, y, z), p.k); }
    }
    return d;
  };
}
// ---------- surface nets (narrow band): SDF -> smooth vertices projected onto the surface, normals from the gradient
function chNets(f, bb, h) {
  const x0 = bb[0], y0 = bb[1], z0 = bb[2], nx = Math.ceil((bb[3] - x0) / h) + 2, ny = Math.ceil((bb[4] - y0) / h) + 2, nz = Math.ceil((bb[5] - z0) / h) + 2;
  const N = nx * ny * nz, F = new Float32Array(N), done = new Uint8Array(N), C = 4, band = C * h * 2.2;
  const id = (i, j, k) => i + nx * (j + ny * k);
  const ev = (i, j, k) => { const q = i + nx * (j + ny * k); if (!done[q]) { F[q] = f(x0 + i * h, y0 + j * h, z0 + k * h); done[q] = 1; } return F[q]; };
  for (let k = 0; k < nz; k += C) for (let j = 0; j < ny; j += C) for (let i = 0; i < nx; i += C) {
    if (Math.abs(ev(i, j, k)) >= band) continue;
    for (let kk = Math.max(0, k - C); kk <= Math.min(nz - 1, k + C); kk++) for (let jj = Math.max(0, j - C); jj <= Math.min(ny - 1, j + C); jj++) for (let ii = Math.max(0, i - C); ii <= Math.min(nx - 1, i + C); ii++) ev(ii, jj, kk);
  }
  const cn = (i, n) => Math.min(Math.round(i / C) * C, Math.floor((n - 1) / C) * C);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const q = id(i, j, k); if (!done[q]) F[q] = F[id(cn(i, nx), cn(j, ny), cn(k, nz))]; }
  const cid = (i, j, k) => i + (nx - 1) * (j + (ny - 1) * k), cell = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]], cv = new Float64Array(8);
  const P = [], NN = [], e = h * 0.3;
  const grad = (x, y, z) => [f(x + e, y, z) - f(x - e, y, z), f(x, y + e, z) - f(x, y - e, z), f(x, y, z + e) - f(x, y, z - e)];
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let m = 0;
    for (let c = 0; c < 8; c++) { const v = F[id(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))]; cv[c] = v; if (v < 0) m |= 1 << c; }
    if (m === 0 || m === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (let q = 0; q < 12; q++) {
      const a = EDGES[q][0], b = EDGES[q][1], va = cv[a], vb = cv[b]; if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb);
      sx += (a & 1) + t * ((b & 1) - (a & 1)); sy += ((a >> 1) & 1) + t * (((b >> 1) & 1) - ((a >> 1) & 1)); sz += ((a >> 2) & 1) + t * (((b >> 2) & 1) - ((a >> 2) & 1)); n++;
    }
    let px = x0 + (i + sx / n) * h, py = y0 + (j + sy / n) * h, pz = z0 + (k + sz / n) * h;
    const qx = px, qy = py, qz = pz;
    for (let it = 0; it < 2; it++) {
      const v = f(px, py, pz), g = grad(px, py, pz), g2 = (g[0] * g[0] + g[1] * g[1] + g[2] * g[2]) / (4 * e * e);
      if (g2 < 1e-10) break;
      px -= v * g[0] / (2 * e) / g2; py -= v * g[1] / (2 * e) / g2; pz -= v * g[2] / (2 * e) / g2;
    }
    const dd = Math.hypot(px - qx, py - qy, pz - qz); if (dd > h) { const s = h / dd; px = qx + (px - qx) * s; py = qy + (py - qy) * s; pz = qz + (pz - qz) * s; }
    const g = grad(px, py, pz), gl = Math.hypot(g[0], g[1], g[2]) || 1;
    cell[cid(i, j, k)] = P.length / 3; P.push(px, py, pz); NN.push(g[0] / gl, g[1] / gl, g[2] / gl);
  }
  const I = [];
  const tri = (a, b, c) => {
    const ax = P[a * 3], ay = P[a * 3 + 1], az = P[a * 3 + 2], ux = P[b * 3] - ax, uy = P[b * 3 + 1] - ay, uz = P[b * 3 + 2] - az, vx = P[c * 3] - ax, vy = P[c * 3 + 1] - ay, vz = P[c * 3 + 2] - az;
    const tx = uy * vz - uz * vy, ty = uz * vx - ux * vz, tz = ux * vy - uy * vx, nx_ = NN[a * 3] + NN[b * 3] + NN[c * 3], ny_ = NN[a * 3 + 1] + NN[b * 3 + 1] + NN[c * 3 + 1], nz_ = NN[a * 3 + 2] + NN[b * 3 + 2] + NN[c * 3 + 2];
    if (tx * nx_ + ty * ny_ + tz * nz_ >= 0) I.push(a, b, c); else I.push(a, c, b);
  };
  const quad = (a, b, c, d) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; tri(a, b, c); tri(a, c, d); };
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const s0 = F[id(i, j, k)] < 0;
    if (i < nx - 1 && j > 0 && k > 0 && j < ny - 1 && k < nz - 1 && s0 !== (F[id(i + 1, j, k)] < 0)) quad(cell[cid(i, j - 1, k - 1)], cell[cid(i, j, k - 1)], cell[cid(i, j, k)], cell[cid(i, j - 1, k)]);
    if (j < ny - 1 && i > 0 && k > 0 && i < nx - 1 && k < nz - 1 && s0 !== (F[id(i, j + 1, k)] < 0)) quad(cell[cid(i - 1, j, k - 1)], cell[cid(i, j, k - 1)], cell[cid(i, j, k)], cell[cid(i - 1, j, k)]);
    if (k < nz - 1 && i > 0 && j > 0 && i < nx - 1 && j < ny - 1 && s0 !== (F[id(i, j, k + 1)] < 0)) quad(cell[cid(i - 1, j - 1, k)], cell[cid(i, j - 1, k)], cell[cid(i, j, k)], cell[cid(i - 1, j, k)]);
  }
  return { P: new Float32Array(P), N: new Float32Array(NN), I };
}
// mesh a prim list: geometry with normals, albedo vertex colours (with SDF ambient occlusion), box-projected uvs, skin weights
// o: { h, col(x,y,z,nx,ny,nz,tag) -> [r,g,b] linear, ao: [step, amount], uv: metres per tile, bones: name -> index (skinned), kw }
function chSculpt(P, o) {
  const f = chSdfFn(P), U = P.filter((p) => p.op === 'u');
  const bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
  U.forEach((p) => { const r = p.cr - p.k; bb[0] = Math.min(bb[0], p.cx - r); bb[1] = Math.min(bb[1], p.cy - r); bb[2] = Math.min(bb[2], p.cz - r); bb[3] = Math.max(bb[3], p.cx + r); bb[4] = Math.max(bb[4], p.cy + r); bb[5] = Math.max(bb[5], p.cz + r); });
  const m = 2 * o.h; bb[0] -= m; bb[1] -= m; bb[2] -= m; bb[3] += m; bb[4] += m; bb[5] += m;
  const { P: pos, N: nor, I } = chNets(f, bb, o.h), n = pos.length / 3;
  const col = new Float32Array(n * 3), uv = new Float32Array(n * 2), si = o.bones ? new Uint16Array(n * 4) : null, sw = o.bones ? new Float32Array(n * 4) : null;
  const [aoS, aoA] = o.ao ?? [0.01, 0.6], kw = o.kw ?? 0.02, tile = o.uv ?? 0.06, tagI = o.keep ? new Uint8Array(n) : null, aoK = o.keep ? new Float32Array(n) : null;
  for (let v = 0; v < n; v++) {
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], nx = nor[v * 3], ny = nor[v * 3 + 1], nz = nor[v * 3 + 2];
    // nearest prim (tag) + bone weights
    let dmin = 1e9, tag = '';
    const dl = U.map((p) => { const d = chPrimD(p, x, y, z); if (d < dmin) { dmin = d; tag = p.tag; } return d; });
    if (o.bones) {
      const sc = {};
      U.forEach((p, i) => { const s = Math.exp(-Math.max(0, dl[i] - dmin) / kw); const w = p.w ?? { [p.bn]: 1 }; Object.entries(w).forEach(([b, wb]) => { sc[b] = Math.max(sc[b] ?? 0, s * wb); }); });
      const top = Object.entries(sc).sort((a, b) => b[1] - a[1]).slice(0, 4).filter(([, s]) => s > 0.03), tot = top.reduce((a, [, s]) => a + s, 0);
      top.forEach(([b, s], q) => { si[v * 4 + q] = o.bones[b]; sw[v * 4 + q] = s / tot; });
    }
    let occ = 0; for (let q = 1; q <= 4; q++) { const hq = q * aoS; occ += (hq - f(x + nx * hq, y + ny * hq, z + nz * hq)) / (1 << q); }
    const ao = clamp(1 - aoA * occ / aoS, 0.25, 1);
    if (o.keep) { tagI[v] = Math.max(0, o.keep.indexOf(tag)); aoK[v] = ao; }
    const c = o.col(x, y, z, nx, ny, nz, tag);
    col[v * 3] = c[0] * ao; col[v * 3 + 1] = c[1] * ao; col[v * 3 + 2] = c[2] * ao;
    const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    if (ax >= ay && ax >= az) { uv[v * 2] = z / tile; uv[v * 2 + 1] = y / tile; } else if (ay >= az) { uv[v * 2] = x / tile; uv[v * 2 + 1] = z / tile; } else { uv[v * 2] = x / tile; uv[v * 2 + 1] = y / tile; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  if (o.bones) { g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4)); }
  g.setIndex(n > 65000 ? new THREE.BufferAttribute(new Uint32Array(I), 1) : new THREE.BufferAttribute(new Uint16Array(I), 1));
  g.userData.f = f; if (o.keep) { g.userData.tagI = tagI; g.userData.ao = aoK; }
  return g;
}
const chL = (hex) => { const c = lin(hex); return [c.r, c.g, c.b]; };
const chMix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const chMul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const chGauss = (x, y, z, cx, cy, cz, s) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2) / (2 * s * s));
function chAddColor(g, hex) { const c = chL(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set(c, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
// a tube along a centre line with per-ring half-widths (wb across, wn along the surface normal; flattened underside)
function chTube(C, Nrm, wb, wn, seg = 8, under = 0.4) {
  const n = C.length, pos = [], uv = [], idx = [];
  for (let k = 0; k < n; k++) {
    const T = (k < n - 1 ? C[k + 1].clone().sub(C[k]) : C[k].clone().sub(C[k - 1])).normalize(), Nk = Nrm[k].clone().sub(T.clone().multiplyScalar(Nrm[k].dot(T))).normalize(), B = T.clone().cross(Nk).normalize();
    for (let j = 0; j <= seg; j++) {
      const a = j / seg * TAU, ca = Math.cos(a), sa = Math.sin(a), sb = sa > 0 ? sa : sa * under;
      const p = C[k].clone().addScaledVector(B, Math.sign(ca) * Math.pow(Math.abs(ca), 0.8) * wb[k]).addScaledVector(Nk, sb * wn[k]);
      pos.push(p.x, p.y, p.z); uv.push(j / seg, k / (n - 1));
    }
  }
  for (let k = 0; k < n - 1; k++) for (let j = 0; j < seg; j++) { const a = k * (seg + 1) + j, b = a + seg + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function chMerge(list) {   // merge non-indexed-compatible geometries with the same attributes (position, normal, uv, color)
  let nv = 0, ni = 0; list.forEach((g) => { nv += g.attributes.position.count; ni += g.index.count; });
  const out = new THREE.BufferGeometry(), names = ['position', 'normal', 'uv', 'color'].filter((a) => list[0].attributes[a]), arr = {}, idx = new Uint32Array(ni);
  names.forEach((a) => { arr[a] = new Float32Array(nv * list[0].attributes[a].itemSize); });
  let ov = 0, oi = 0;
  list.forEach((g) => { names.forEach((a) => arr[a].set(g.attributes[a].array, ov * g.attributes[a].itemSize)); for (let i = 0; i < g.index.count; i++) idx[oi + i] = g.index.array[i] + ov; ov += g.attributes.position.count; oi += g.index.count; });
  names.forEach((a) => out.setAttribute(a, new THREE.BufferAttribute(arr[a], list[0].attributes[a].itemSize))); out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

// ---------- code textures
function chTexKnit() { return g3Tex((x, w) => { const R = RNG('knit'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 4) for (let j = 0; j < w; j += 3) { x.fillStyle = `rgba(255,255,255,${R.r(0.15, 0.35)})`; x.beginPath(); x.ellipse(i + 2, j + 1.5, 1.5, 1.3, 0.5 * ((i / 4) % 2 ? 1 : -1), 0, TAU); x.fill(); } for (let k = 0; k < 2500; k++) { x.fillStyle = `rgba(0,0,0,${R.r(0, 0.15)})`; x.fillRect(R.r(0, w), R.r(0, w), 2, 2); } }, 256, 256, false); }
function chTexTwill() { return g3Tex((x, w) => { const R = RNG('twill'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w); x.lineWidth = 1.6; for (let i = -w; i < w * 2; i += 3) { x.strokeStyle = `rgba(255,255,255,${R.r(0.2, 0.45)})`; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + w * 0.6, w); x.stroke(); } for (let k = 0; k < 3000; k++) { x.fillStyle = `rgba(0,0,0,${R.r(0, 0.2)})`; x.fillRect(R.r(0, w), R.r(0, w), 1.5, 1.5); } }, 256, 256, false); }
function chTexHair() {
  return g3Tex((x, w, h) => {
    const R = RNG('strands'); x.fillStyle = '#c8c8c8'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) { const px = R.r(0, w), v = R.f() < 0.5 ? R.r(150, 200) : R.r(225, 255); x.strokeStyle = `rgba(${v},${v},${v},${R.r(0.35, 0.8)})`; x.lineWidth = R.r(0.6, 1.8); x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + R.n(3), h * 0.3, px + R.n(3), h * 0.7, px + R.n(2), h); x.stroke(); }
  }, 128, 256);
}
function chTexEye(iris = CH_COL.iris, hi = '#b98a4c', mid = '#8a5a30') {
  return g3Tex((x, w) => {
    const c = w / 2, R = RNG('iris'), ri = w * 0.315, rp = ri * 0.4;
    let g = x.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, '#fbf8f3'); g.addColorStop(0.7, '#f3ece6'); g.addColorStop(1, '#dcc3bc'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    g = x.createRadialGradient(c, c, ri * 0.85, c, c, ri * 1.18); g.addColorStop(0, 'rgba(60,40,30,0.25)'); g.addColorStop(1, 'rgba(60,40,30,0)'); x.fillStyle = g; x.beginPath(); x.arc(c, c, ri * 1.2, 0, TAU); x.fill();
    g = x.createRadialGradient(c, c, rp, c, c, ri); g.addColorStop(0, hi); g.addColorStop(0.35, mid); g.addColorStop(0.8, iris); g.addColorStop(1, '#2a170c'); x.fillStyle = g; x.beginPath(); x.arc(c, c, ri, 0, TAU); x.fill();
    for (let k = 0; k < 140; k++) { const a = R.r(0, TAU), r0 = rp * R.r(1, 1.3), r1 = ri * R.r(0.6, 0.95), v = R.f() < 0.5 ? '255,220,170' : '40,22,10'; x.strokeStyle = `rgba(${v},${R.r(0.1, 0.35)})`; x.lineWidth = R.r(0.8, 2); x.beginPath(); x.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); x.lineTo(c + Math.cos(a + R.n(0.08)) * r1, c + Math.sin(a + R.n(0.08)) * r1); x.stroke(); }
    x.strokeStyle = 'rgba(20,10,5,0.85)'; x.lineWidth = w * 0.022; x.beginPath(); x.arc(c, c, ri - w * 0.011, 0, TAU); x.stroke();
    x.fillStyle = '#070404'; x.beginPath(); x.arc(c, c, rp, 0, TAU); x.fill();
    g = x.createLinearGradient(0, c - ri, 0, c); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(c, c, ri, 0, TAU); x.fill();   // lid shadow on the iris
  }, 256, 256);
}
// mouth decals (512 x 256 = 8.4 x 4.2 cm of face, 61 px / cm); painted soft so they sit in the skin
const CH_MOUTHS = ['neutral', 'smile', 'grin', 'open', 'oh', 'worried', 'sad', 'smirk'];
const CH_LIP0 = { line: 'rgba(70,22,18,1)', lower: 'rgba(176,88,76,0.7)', upper: 'rgba(160,78,66,0.5)', rim: 'rgba(120,48,40,0.95)', oh: 'rgba(178,92,80,0.9)' };   // lip palette (extras pass lipstick variants)
function chMouthTex(kind, L = CH_LIP0) {
  return g3Tex((x, w, h) => {
    x.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2, lipD = L.line, inside = '#3a110e';
    const lens = (l, r, top, bot, fill, blur = 1.2) => { x.save(); x.filter = `blur(${blur}px)`; x.fillStyle = fill; x.beginPath(); x.moveTo(l[0], l[1]); x.quadraticCurveTo(top[0], top[1], r[0], r[1]); x.quadraticCurveTo(bot[0], bot[1], l[0], l[1]); x.fill(); x.restore(); };
    const blob = (px, py, rx, ry, fill, blur = 3) => { x.save(); x.filter = `blur(${blur}px)`; x.fillStyle = fill; x.beginPath(); x.ellipse(px, py, rx, ry, 0, 0, TAU); x.fill(); x.restore(); };
    const lowerLip = (l, r, depth, yOff = 0) => { lens([l[0] + 14, l[1] + 4 + yOff], [r[0] - 14, r[1] + 4 + yOff], [cx, (l[1] + r[1]) / 2 + 2 + yOff], [cx, (l[1] + r[1]) / 2 + depth + yOff], L.lower, 4); blob(cx, (l[1] + r[1]) / 2 + depth * 0.45 + yOff, 30, 5, 'rgba(255,235,225,0.22)', 3); blob(cx, (l[1] + r[1]) / 2 + depth + 10 + yOff, 46, 7, 'rgba(90,40,30,0.13)', 6); };
    const upperLip = (l, r, mid) => { lens([l[0] + 10, l[1]], [r[0] - 10, r[1]], [cx, mid - 26], [cx, mid], L.upper, 4); };
    const line = (l, r, ctrl, thick) => { x.save(); x.filter = 'blur(0.8px)'; x.fillStyle = lipD; x.beginPath(); x.moveTo(l[0], l[1]); x.quadraticCurveTo(ctrl[0], ctrl[1] - thick, r[0], r[1]); x.quadraticCurveTo(ctrl[0], ctrl[1] + thick, l[0], l[1]); x.fill(); x.restore(); };
    const dimple = (px, py, a) => { x.save(); x.filter = 'blur(1.2px)'; x.strokeStyle = 'rgba(120,60,45,0.45)'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.arc(px, py, 12, a - 0.7, a + 0.7); x.stroke(); x.restore(); };
    const open = (wd, top, bot, teethH, tongue, bowTop = 0) => {
      const l = [cx - wd, cy + top + 6], r = [cx + wd, cy + top + 6];
      x.save(); x.beginPath(); x.moveTo(l[0], l[1]); x.quadraticCurveTo(cx, cy + top - bowTop, r[0], r[1]); x.bezierCurveTo(r[0] - 4, cy + bot * 0.8, cx + wd * 0.5, cy + bot, cx, cy + bot); x.bezierCurveTo(cx - wd * 0.5, cy + bot, l[0] + 4, cy + bot * 0.8, l[0], l[1]); x.closePath();
      const path = new Path2D(); path.moveTo(l[0], l[1]); path.quadraticCurveTo(cx, cy + top - bowTop, r[0], r[1]); path.bezierCurveTo(r[0] - 4, cy + bot * 0.8, cx + wd * 0.5, cy + bot, cx, cy + bot); path.bezierCurveTo(cx - wd * 0.5, cy + bot, l[0] + 4, cy + bot * 0.8, l[0], l[1]); path.closePath();
      x.filter = 'blur(0.7px)'; x.fillStyle = inside; x.fill(path); x.clip(path); x.filter = 'none';
      const g = x.createRadialGradient(cx, cy + bot * 0.6, 4, cx, cy + bot * 0.6, wd); g.addColorStop(0, '#5a1a16'); g.addColorStop(1, '#260806'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      if (tongue) { x.fillStyle = '#c45656'; x.beginPath(); x.ellipse(cx, cy + bot + 4, wd * 0.62, (bot - top) * 0.32, 0, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,190,180,0.3)'; x.beginPath(); x.ellipse(cx - 6, cy + bot - (bot - top) * 0.12, wd * 0.25, 5, 0, 0, TAU); x.fill(); }
      if (teethH) { const tg = x.createLinearGradient(0, cy + top - 4, 0, cy + top + teethH + 8); tg.addColorStop(0, '#fffdf8'); tg.addColorStop(1, '#ddd5c8'); x.fillStyle = tg; x.beginPath(); x.moveTo(l[0], l[1] - 8); x.quadraticCurveTo(cx, cy + top - bowTop - 8, r[0], r[1] - 8); x.lineTo(r[0], r[1] + teethH * 0.4); x.quadraticCurveTo(cx, cy + top + teethH + 4, l[0], l[1] + teethH * 0.4); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(150,130,115,0.35)'; x.lineWidth = 1.5; for (let q = -3; q <= 3; q++) { const tx = cx + q * wd * 0.22; x.beginPath(); x.moveTo(tx, cy + top - 4); x.lineTo(tx, cy + top + teethH * (1 - Math.abs(q) * 0.12)); x.stroke(); } }
      x.restore();
      x.save(); x.filter = 'blur(1.4px)'; x.strokeStyle = L.rim; x.lineWidth = 10; x.stroke(path); x.restore();
      lowerLip([l[0], cy + bot - 10], [r[0], cy + bot - 10], 18);
      upperLip(l, r, cy + top - bowTop * 0.5);
    };
    if (kind === 'neutral') { const l = [cx - 96, cy - 2], r = [cx + 96, cy - 2]; upperLip(l, r, cy); line(l, r, [cx, cy + 8], 22); lowerLip(l, r, 38); dimple(cx - 100, cy - 4, Math.PI); dimple(cx + 100, cy - 4, 0); }
    if (kind === 'smile') { open(128, -30, 40, 14, false, -30); dimple(cx - 122, cy - 26, Math.PI * 0.85); dimple(cx + 122, cy - 26, Math.PI * 0.15); }
    if (kind === 'grin') { open(134, -24, 74, 32, true, -20); dimple(cx - 132, cy - 20, Math.PI * 0.85); dimple(cx + 132, cy - 20, Math.PI * 0.15); }
    if (kind === 'open') open(86, -20, 90, 18, true, 0);
    if (kind === 'oh') { x.save(); x.filter = 'blur(1px)'; x.fillStyle = inside; x.beginPath(); x.ellipse(cx, cy + 22, 44, 58, 0, 0, TAU); x.fill(); x.strokeStyle = L.oh; x.lineWidth = 14; x.stroke(); x.restore(); blob(cx, cy + 74, 26, 6, 'rgba(255,230,220,0.2)', 3); blob(cx, cy + 82, 34, 8, 'rgba(90,40,30,0.15)', 6); }
    if (kind === 'worried') { const l = [cx - 88, cy + 10], r = [cx + 88, cy + 4]; x.save(); x.filter = 'blur(0.8px)'; x.strokeStyle = lipD; x.lineWidth = 22; x.lineCap = 'round'; x.beginPath(); x.moveTo(l[0], l[1]); x.bezierCurveTo(cx - 30, cy - 16, cx + 24, cy + 20, r[0], r[1]); x.stroke(); x.restore(); lowerLip([l[0], cy + 2], [r[0], cy + 2], 28); upperLip(l, r, cy - 2); }
    if (kind === 'sad') { const l = [cx - 96, cy + 26], r = [cx + 96, cy + 26]; upperLip(l, r, cy - 4); line(l, r, [cx, cy - 22], 20); lowerLip([l[0], cy + 4], [r[0], cy + 4], 34, 2); dimple(cx - 98, cy + 26, Math.PI * 1.2); dimple(cx + 98, cy + 26, -Math.PI * 0.2); }
    if (kind === 'smirk') { const l = [cx - 84, cy + 4], r = [cx + 112, cy - 24]; upperLip(l, r, cy); x.save(); x.filter = 'blur(0.8px)'; x.fillStyle = lipD; x.beginPath(); x.moveTo(l[0], l[1]); x.bezierCurveTo(cx - 20, cy - 4, cx + 40, cy - 2, r[0], r[1]); x.bezierCurveTo(cx + 40, cy + 30, cx - 20, cy + 28, l[0], l[1]); x.fill(); x.restore(); lowerLip(l, [r[0], r[1] + 14], 28, 2); dimple(cx + 120, cy - 28, Math.PI * 0.1); }
  }, 512, 256);
}

// ---- pose library (degrees). Joint axes: x = pitch (forward −, for limbs hanging down), y = twist, z = roll (+ raises the LEFT arm out).
//      h: hand shapes [L, R] from CH_HANDS.
const CH_POSES = {
  stand: { spine: [2, 0, 0], chest: [1, 0, 0], neck: [-2, 0, 0], head: [0, 0, 0], shL: [4, -6, 8], shR: [4, 6, -8], elL: [-14, 0, 0], elR: [-14, 0, 0], wrL: [0, 0, -4], wrR: [0, 0, 4], hipL: [0, 0, 3], hipR: [0, 0, -3], knL: [3, 0, 0], knR: [3, 0, 0], anL: [-3, 0, -3], anR: [-3, 0, 3], h: ['relax', 'relax'] },
  cheer: { hips: [-3, 0, 0], spine: [-8, 0, 0], chest: [-6, 0, 0], neck: [-8, 0, 0], head: [-10, 0, 0], clL: [0, 0, 14], clR: [0, 0, -14], shL: [-10, 0, 148], shR: [-10, 0, -148], elL: [-25, 0, 0], elR: [-25, 0, 0], hipL: [0, 0, 5], hipR: [0, 0, -5], knL: [4, 0, 0], knR: [4, 0, 0], anL: [-4, 0, -5], anR: [-4, 0, 5], h: ['fist', 'fist'] },
  flip: { spine: [-2, -6, 0], chest: [-3, -6, 0], neck: [-10, -4, 0], head: [-14, 0, 0], shL: [4, -6, 9], shR: [-22, 16, -16], elL: [-14, 0, 0], elR: [-92, -55, 0], wrR: [-10, 0, 14], hipL: [0, 0, 3], hipR: [0, 0, -3], knL: [3, 0, 0], knR: [3, 0, 0], anL: [-3, 0, -3], anR: [-3, 0, 3], h: ['relax', 'flip'] },
  shock: { hips: [-4, 0, 0], spine: [-10, 0, 0], chest: [-6, 0, 0], neck: [-2, 0, 0], head: [-6, 0, 0], clL: [0, 0, 10], clR: [0, 0, -10], shL: [-40, -10, 40], shR: [-40, 10, -40], elL: [-110, 70, 0], elR: [-110, -70, 0], wrL: [-15, 0, 0], wrR: [-15, 0, 0], hipL: [-6, 0, 5], hipR: [-6, 0, -5], knL: [12, 0, 0], knR: [12, 0, 0], anL: [-6, 0, -5], anR: [-6, 0, 5], h: ['open', 'open'] },
  shrug: { spine: [0, 0, 0], chest: [-2, 0, 0], neck: [2, 0, 4], head: [2, 0, 8], clL: [0, 0, 16], clR: [0, 0, -16], shL: [-8, 0, 24], shR: [-8, 0, -24], elL: [-85, 80, 0], elR: [-85, -80, 0], wrL: [0, 0, -20], wrR: [0, 0, 20], hipL: [0, 0, 3], hipR: [0, 0, -3], knL: [3, 0, 0], knR: [3, 0, 0], anL: [-3, 0, -3], anR: [-3, 0, 3], h: ['open', 'open'] },
  sad: { hips: [8, 0, 0], spine: [5, 0, 0], chest: [8, 0, 0], neck: [-4, 0, 0], head: [16, 0, 0], clL: [0, 0, -6], clR: [0, 0, 6], shL: [10, 0, 5], shR: [10, 0, -5], elL: [-8, 0, 0], elR: [-8, 0, 0], hipL: [-8, 0, 2], hipR: [-8, 0, -2], knL: [5, 0, 0], knR: [5, 0, 0], anL: [-5, 0, -2], anR: [-5, 0, 2], h: ['relax', 'relax'] },
  point: { spine: [0, -10, 0], chest: [-2, -8, 0], neck: [-2, -8, 0], head: [-2, -6, 0], shL: [4, -6, 8], shR: [-82, 18, -6], elL: [-14, 0, 0], elR: [-6, 0, 0], hipL: [0, 0, 3], hipR: [0, 0, -3], knL: [3, 0, 0], knR: [3, 0, 0], anL: [-3, 0, -3], anR: [-3, 0, 3], h: ['relax', 'point'] },
  hold: { spine: [4, 0, 0], chest: [2, 0, 0], neck: [8, 0, 0], head: [10, 0, 0], shL: [-20, 0, 6], shR: [-20, 0, -6], elL: [-72, 50, 0], elR: [-72, -50, 0], wrL: [12, 0, 0], wrR: [12, 0, 0], hipL: [0, 0, 3], hipR: [0, 0, -3], knL: [3, 0, 0], knR: [3, 0, 0], anL: [-3, 0, -3], anR: [-3, 0, 3], h: ['hold', 'hold'] },
  sit: { hips: [0, 0, 0], spine: [6, 0, 0], chest: [2, 0, 0], neck: [-4, 0, 0], shL: [-16, 0, 8], shR: [-16, 0, -8], elL: [-50, 40, 0], elR: [-50, -40, 0], hipL: [-86, 0, 5], hipR: [-86, 0, -5], knL: [86, 0, 0], knR: [86, 0, 0], h: ['relax', 'relax'] },
};
// hand shapes: per-finger curl (index..pinky, 0 straight .. 1 fist), thumb curl, spread
const CH_HANDS = {
  relax: { f: [0.22, 0.3, 0.36, 0.42], th: 0.25, sp: 0.25 },
  fist: { f: [1, 1, 1, 1], th: 1, sp: 0 },
  point: { f: [-0.02, 1, 1, 1], th: 0.85, sp: 0 },
  open: { f: [-0.05, -0.03, 0, 0.04], th: -0.1, sp: 1 },
  hold: { f: [0.5, 0.56, 0.62, 0.68], th: 0.55, sp: 0.15 },
  flip: { f: [0.8, 0.95, 1, 1], th: 0.2, sp: 0 },
  thumb: { f: [1, 1, 1, 1], th: -0.3, sp: 0 },
};
// expressions: brows (inner up, outer up, squeeze; m), lids (upper 0 = rest, 1 = shut, − = wide; lower 0..1 raise),
// mouth decal, morphs (smile L/R, jaw open, frown)
const CH_EXPR = {
  neutral: { bIn: 0, bOut: 0, bSq: 0, lidU: 0, lidL: 0, mouth: 'neutral', smL: 0.12, smR: 0.12, jaw: 0, frown: 0 },
  happy: { bIn: 0.005, bOut: 0.003, bSq: 0, lidU: 0.1, lidL: 0.55, mouth: 'smile', smL: 0.85, smR: 0.85, jaw: 0, frown: 0 },
  joy: { bIn: 0.009, bOut: 0.006, bSq: 0, lidU: 0.18, lidL: 0.75, mouth: 'grin', smL: 1, smR: 1, jaw: 0.55, frown: 0 },
  surprised: { bIn: 0.013, bOut: 0.011, bSq: 0, lidU: -0.45, lidL: -0.2, mouth: 'oh', smL: 0, smR: 0, jaw: 0.75, frown: 0 },
  amazed: { bIn: 0.011, bOut: 0.008, bSq: 0, lidU: -0.35, lidL: 0.1, mouth: 'open', smL: 0.35, smR: 0.35, jaw: 0.9, frown: 0 },
  worried: { bIn: 0.01, bOut: -0.004, bSq: 0.9, lidU: -0.05, lidL: 0.2, mouth: 'worried', smL: 0, smR: 0, jaw: 0.1, frown: 0.5 },
  sad: { bIn: 0.009, bOut: -0.006, bSq: 0.7, lidU: 0.38, lidL: 0.15, mouth: 'sad', smL: 0, smR: 0, jaw: 0, frown: 1 },
  smug: { bIn: -0.003, bOut: 0.002, bSq: 0.3, lidU: 0.45, lidL: 0.35, mouth: 'smirk', smL: 1, smR: 0, jaw: 0, frown: 0, asym: 0.006 },
};

// ---- head constants (head-bone space)
const CH_EYE = { x: 0.0375, y: 0.098, z: 0.0775, r: 0.0195 };
const CH_MOUTH = { y: 0.038, w: 0.05, h: 0.025 };

let CH = null;
function chBuild() {
  if (CH) return CH;
  const root = new THREE.Group(), B = {}, bones = [];
  const bone = (name, parent, x, y, z) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); (parent ? B[parent] : root).add(b); B[name] = b; bones.push(b); return b; };
  bone('hips', null, 0, 0.86, 0); bone('spine', 'hips', 0, 0.08, 0); bone('chest', 'spine', 0, 0.17, 0); bone('neck', 'chest', 0, 0.225, -0.008); bone('head', 'neck', 0, 0.083, 0.014);
  const FING = [{ yb: 0.084, z: 0.026, l: [0.043, 0.027, 0.023], r: 0.0097, sp: -5 }, { yb: 0.087, z: 0.0087, l: [0.047, 0.03, 0.024], r: 0.0095, sp: -1 }, { yb: 0.084, z: -0.0087, l: [0.044, 0.028, 0.023], r: 0.009, sp: 4 }, { yb: 0.077, z: -0.025, l: [0.035, 0.022, 0.02], r: 0.008, sp: 10 }];
  const TH = {};
  [['L', 1], ['R', -1]].forEach(([k, s]) => {
    bone('cl' + k, 'chest', s * 0.03, 0.19, -0.01); bone('sh' + k, 'cl' + k, s * 0.176, -0.01, 0); bone('el' + k, 'sh' + k, 0, -0.26, 0); bone('wr' + k, 'el' + k, 0, -0.235, 0);
    FING.forEach((F, i) => { bone(`f${k}${i}a`, 'wr' + k, 0, -F.yb, F.z); bone(`f${k}${i}b`, `f${k}${i}a`, 0, -F.l[0], 0); bone(`f${k}${i}c`, `f${k}${i}b`, 0, -F.l[1], 0); B[`f${k}${i}a`].rotation.x = F.sp * DEG; });
    // thumb: a rest frame whose local −y runs along the thumb and local +x is the flexion axis (curls into the palm)
    const dir = V3(-s * 0.3, -0.72, 0.62).normalize(), np = V3(-s, 0, 0), K = dir.clone().cross(np).normalize(), yL = dir.clone().negate(), zL = K.clone().cross(yL).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(K, yL, zL));
    bone('t' + k + '1', 'wr' + k, -s * 0.006, -0.022, 0.02).quaternion.copy(q); bone('t' + k + '2', 't' + k + '1', 0, -0.042, 0); bone('t' + k + '3', 't' + k + '2', 0, -0.032, 0);
    const dors = np.clone().sub(dir.clone().multiplyScalar(np.dot(dir))).negate().normalize().applyQuaternion(q.clone().invert());   // thumbnail side, in thumb space
    TH[k] = { q, dors };
    bone('hip' + k, 'hips', s * 0.092, -0.07, 0); bone('kn' + k, 'hip' + k, 0, -0.35, 0); bone('an' + k, 'kn' + k, 0, -0.35, 0);
    B['sh' + k].rotation.z = s * 30 * DEG; B['hip' + k].rotation.z = s * 3 * DEG;   // bind: A-pose, so arms and legs mesh apart
  });
  root.updateMatrixWorld(true);
  const BI = {}; bones.forEach((b, i) => { BI[b.name] = i; });
  const W = (bn) => B[bn].matrixWorld, I4 = new THREE.Matrix4();
  const comp = (defs, local) => defs.map((d) => chPrim(d, local ? I4 : W(d.bn)));

  // ---------- materials
  const sss = (mat, wrap = '0.26, 0.17, 0.14') => { mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <lights_physical_pars_fragment>', THREE.ShaderChunk.lights_physical_pars_fragment.replace('reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );', `{ float ndl = dot( geometry.normal, directLight.direction ); vec3 W = vec3( ${wrap} ); vec3 wr = clamp( ( vec3( ndl ) + W ) / ( 1.0 + W ), 0.0, 1.0 ); reflectedLight.directDiffuse += wr * directLight.color * BRDF_Lambert( material.diffuseColor ); }`)); }; mat.customProgramCacheKey = () => 'ch-sss'; return mat; };
  const skinMat = sss(new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5, sheen: 0.35, sheenColor: lin('#ffb59a'), sheenRoughness: 0.55, specularIntensity: 0.6 }));
  const knit = chTexKnit(); knit.wrapS = knit.wrapT = THREE.RepeatWrapping;
  const twill = chTexTwill(); twill.wrapS = twill.wrapT = THREE.RepeatWrapping;
  const hoodMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.88, sheen: 0.6, sheenColor: lin('#bfe8d0'), sheenRoughness: 0.7, bumpMap: knit, bumpScale: 0.0007, specularIntensity: 0.3 });
  const jeansMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.82, sheen: 0.4, sheenColor: lin('#9fb6d6'), sheenRoughness: 0.7, bumpMap: twill, bumpScale: 0.0008, specularIntensity: 0.35 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.55 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.45, map: chTexHair() });
  const lashMat = new THREE.MeshStandardMaterial({ color: lin(CH_COL.lash), roughness: 0.6 });
  const nailMat = new THREE.MeshStandardMaterial({ color: lin(CH_COL.nail), roughness: 0.45 });
  const skinned = (geo, mat) => { const m = new THREE.SkinnedMesh(geo, mat); root.add(m); m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; return m; };
  const rigid = (geo, mat, bn, cast = true) => { const m = new THREE.Mesh(geo, mat); B[bn].add(m); m.castShadow = cast; m.receiveShadow = true; return m; };
  const skel = new THREE.Skeleton(bones), meshes = [];

  // ---------- hoodie: one continuous sculpt (torso, hood collar, shoulders, sleeves with folds, cuffs, hem, pocket)
  const hood = [], cHood = chL(CH_COL.hood), cHoodD = chL(CH_COL.hoodD), cTee = chL(CH_COL.tee);
  // torso: two rounded slabs with straight flanks and a flat chest; the hoodie falls straight from the shoulders to a hem on the hips
  hood.push({ t: 'cyl', bn: 'chest', c: [0, 0.05, -0.008], rx: 0.114, rz: 0.066, hh: 0.134, rr: 0.04, tag: 'body' });
  hood.push({ t: 'ell', bn: 'chest', c: [0, 0.15, -0.045], r: [0.13, 0.07, 0.07], k: 0.04, tag: 'body' });
  hood.push({ t: 'cyl', bn: 'spine', c: [0, -0.03, 0.0], rx: 0.138, rz: 0.088, hh: 0.105, rr: 0.018, k: 0.045, tag: 'body', disp: (x, y, z) => 0.002 * Math.sin(x * 48 + 0.6) * ss(0.0, -0.06, y) * ss(-0.125, -0.09, y) * (z > 0 ? 1 : 0.6) });
  hood.push({ t: 'cyl', bn: 'spine', c: [0, -0.138, 0.002], rx: 0.155, rz: 0.112, hh: 0.011, rr: 0.006, k: 0.03, tag: 'body' });
  [1, -1].forEach((s) => hood.push({ t: 'ell', bn: 'spine', c: [s * 0.075, -0.125, 0.025], r: [0.07, 0.03, 0.08], k: 0.02, tag: 'body', w: { spine: 1, [s > 0 ? 'hipL' : 'hipR']: 0.7 } }));   // the front hem rides on the thighs (no jeans poking through when a leg lifts)   // a clean hem edge that sits over the jeans
  hood.push({ t: 'box', bn: 'spine', c: [0, -0.058, 0.103], h: [0.08, 0.034, 0.002], rr: 0.007, k: 0.01, tag: 'pocket' });
  [1, -1].forEach((s) => {
    const k = s > 0 ? 'L' : 'R';
    hood.push({ t: 'cone', bn: 'cl' + k, a: [s * 0.0, 0.016, -0.01], b: [s * 0.145, -0.028, -0.004], r1: 0.044, r2: 0.05, k: 0.06, tag: 'body', w: { chest: 0.6, ['cl' + k]: 1 } });
    hood.push({ t: 'ell', bn: 'sh' + k, c: [-s * 0.008, -0.035, 0], r: [0.052, 0.056, 0.056], k: 0.05, tag: 'body', w: { ['sh' + k]: 1, ['cl' + k]: 0.55 } });
    hood.push({ t: 'cone', bn: 'sh' + k, a: [0, -0.045, 0], b: [0, -0.26, 0], r1: 0.059, r2: 0.058, sc: [0.95, 1], k: 0.045, tag: 'sleeve', disp: (x, y, z) => 0.0024 * Math.sin(y * 62 + Math.atan2(z, x) * 1.3) * ss(-0.15, -0.25, y) });
    hood.push({ t: 'cone', bn: 'el' + k, a: [0, 0.03, 0], b: [0, -0.2, 0], r1: 0.058, r2: 0.05, k: 0.04, tag: 'sleeve', disp: (x, y, z) => 0.0022 * Math.sin(-y * 85 + Math.atan2(z, x) * 1.2) * ss(-0.07, -0.01, y) * ss(0.04, -0.01, y) * (0.4 + 0.6 * ss(-0.5, 0.5, z / Math.max(1e-4, Math.hypot(x, z)))) });
    hood.push({ t: 'cyl', bn: 'el' + k, c: [0, -0.222, 0], rx: 0.04, rz: 0.042, hh: 0.016, rr: 0.005, k: 0.012, tag: 'cuff' });
    // hood: collar V in front, rolled hood behind the neck
    const ring = [[s * 0.07, 0.226, 0.016], [s * 0.084, 0.238, -0.04], [s * 0.05, 0.252, -0.085], [0, 0.256, -0.096]];
    hood.push({ t: 'cone', bn: 'chest', a: [s * 0.07, 0.226, 0.016], b: [s * 0.004, 0.11, 0.118], r1: 0.021, r2: 0.012, k: 0.01, tag: 'collar' });
    for (let i = 0; i < 3; i++) hood.push({ t: 'cone', bn: 'chest', a: ring[i], b: ring[i + 1], r1: 0.024 + i * 0.002, r2: 0.026 + i * 0.002, k: 0.012, tag: 'collar' });
  });
  hood.push({ t: 'ell', bn: 'chest', c: [0, 0.18, -0.118], rot: [0.45, 0, 0], r: [0.118, 0.085, 0.04], k: 0.03, tag: 'hood', disp: (x, y, z) => 0.003 * Math.sin(x * 60) });
  const hoodP = comp(hood);
  const chestInv = new THREE.Matrix4().copy(W('chest')).invert(), spineInv = new THREE.Matrix4().copy(W('spine')).invert(), tv = V3(0, 0, 0);
  const hoodGeo = chSculpt(hoodP, { h: 0.0105, bones: BI, kw: 0.022, ao: [0.012, 0.7], uv: 0.05, col: (x, y, z, nx, ny, nz, tag) => {
    let c = cHood;
    if (tag === 'cuff') c = cHoodD;
    if (tag === 'body' || tag === 'pocket') { tv.set(x, y, z).applyMatrix4(spineInv); c = chMix(c, cHoodD, ss(-0.115, -0.122, tv.y)); }
    if (tag === 'collar' || tag === 'hood') c = chMix(cHood, cHoodD, 0.35);
    if (tag === 'body') { tv.set(x, y, z).applyMatrix4(chestInv); const vy = tv.y, vx = Math.abs(tv.x); if (tv.z > 0.05) c = chMix(c, cTee, ss(-0.012, 0.01, (vy - 0.115) / 0.115 * 0.066 - vx) * ss(0.11, 0.125, vy)); }
    if (tag === 'pocket') c = chMix(cHood, cHoodD, 0.15);
    return c;
  } });
  meshes.push(skinned(hoodGeo, hoodMat));
  // drawstrings: tubes hanging from the collar V, following the chest (rigid on the chest)
  const hf = hoodGeo.userData.f, strings = [];
  [1, -1].forEach((s) => {
    const C = [], Nn = [], wb = [], wn = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10, p = V3(s * (0.028 + 0.006 * u), 0.135 - 0.15 * u, 0.2).applyMatrix4(W('chest'));
      let z = p.z; for (let it = 0; it < 30; it++) { if (hf(p.x, p.y, z) < 0) break; z -= 0.004; }
      p.z = z + 0.006; C.push(p); Nn.push(V3(0, 0, 1)); wb.push(0.0032); wn.push(0.0032);
    }
    const g = chAddColor(chTube(C, Nn, wb, wn, 6, 1), CH_COL.lace); g.applyMatrix4(chestInv); strings.push(g);
    const ag = chAddColor(new THREE.CylinderGeometry(0.0042, 0.0042, 0.022, 10), '#d8d2c6'); ag.translate(C[10].x, C[10].y - 0.006, C[10].z); ag.applyMatrix4(chestInv); strings.push(ag);
  });
  strings.forEach((g) => { if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]); });
  rigid(chMerge(strings.map((g) => { if (!g.attributes.normal) g.computeVertexNormals(); return g; })), shoeMat, 'chest');

  // ---------- jeans
  const jeans = [], cJ = chL(CH_COL.jeans), cJL = chL(CH_COL.jeansL);
  jeans.push({ t: 'ell', bn: 'hips', c: [0, -0.04, -0.004], r: [0.134, 0.1, 0.09], tag: 'pelvis' });
  [1, -1].forEach((s) => {
    const k = s > 0 ? 'L' : 'R';
    jeans.push({ t: 'ell', bn: 'hips', c: [s * 0.062, -0.095, -0.034], r: [0.072, 0.074, 0.06], k: 0.04, tag: 'seat', w: { hips: 0.7, ['hip' + k]: 1 } });
    jeans.push({ t: 'cone', bn: 'hip' + k, a: [0, -0.012, 0], b: [0, -0.35, 0], r1: 0.08, r2: 0.065, k: 0.05, tag: 'thigh', disp: (x, y, z) => 0.0022 * Math.sin(y * 90 + Math.atan2(z, x) * 2) * ss(-0.21, -0.33, y) });
    jeans.push({ t: 'ell', bn: 'kn' + k, c: [0, 0.0, 0.004], r: [0.064, 0.064, 0.064], k: 0.03, tag: 'knee' });
    jeans.push({ t: 'cone', bn: 'kn' + k, a: [0, 0, 0], b: [0, -0.35, 0], r1: 0.064, r2: 0.069, cut: -0.333, k: 0.02, tag: 'shin', disp: (x, y, z) => 0.0024 * Math.sin(y * 130 + Math.atan2(z, x) * 1.2) * ss(-0.22, -0.31, y) });
  });
  const jeansGeo = chSculpt(comp(jeans), { h: 0.012, bones: BI, kw: 0.025, ao: [0.012, 0.8], uv: 0.05, col: (x, y, z, nx, ny, nz, tag) => {
    let c = cJ; const front = clamp(nz * 1.3 - 0.1);
    if (tag === 'thigh') c = chMix(cJ, cJL, 0.5 * front * ss(0.76, 0.56, y) * ss(0.4, 0.56, y));
    if (tag === 'knee') c = chMix(cJ, cJL, 0.3 * front);
    if (tag === 'shin') c = chMix(cJ, cJL, 0.12 * front);
    return c;
  } });
  meshes.push(skinned(jeansGeo, jeansMat)); meshes[meshes.length - 1].receiveShadow = false;   // baked AO shades the jeans; the key's hard arm shadow on the thigh read as a stain

  // ---------- neck (skinned between chest, neck and head)
  const cSkin = chL(CH_COL.skin), cBlush = chL(CH_COL.blush);
  const neckGeo = chSculpt(comp([
    { t: 'cone', bn: 'neck', a: [0, -0.05, -0.006], b: [0, 0.12, 0.004], r1: 0.056, r2: 0.05, sc: [1, 0.92], tag: 'neck' },
    { t: 'ell', bn: 'chest', c: [0, 0.2, -0.005], r: [0.066, 0.035, 0.056], k: 0.03, tag: 'base' },
    { t: 'ell', bn: 'head', c: [0, 0.035, -0.004], r: [0.046, 0.04, 0.046], k: 0.02, tag: 'top' },
  ]), { h: 0.0075, bones: BI, kw: 0.025, ao: [0.008, 0.4], col: (x, y, z) => chMul(chMix(cSkin, cBlush, 0.15), 0.88 + 0.12 * ss(1.37, 1.33, y)) });
  meshes.push(skinned(neckGeo, skinMat));

  // ---------- hands: palm, knuckles, thenar pad, 4 three-segment fingers, a 3-segment thumb, nails (rigid on the tips)
  const arms = {}, legs = {};
  [['L', 1], ['R', -1]].forEach(([k, s]) => {
    const H = [], w = 'wr' + k;
    H.push({ t: 'cone', bn: w, a: [0, 0.04, 0], b: [0, -0.014, 0], r1: 0.021, r2: 0.023, sc: [0.8, 1.12], tag: 'wrist' });
    H.push({ t: 'ell', bn: w, c: [0, -0.054, 0], r: [0.0155, 0.043, 0.037], k: 0.014, tag: 'palm' });
    H.push({ t: 'ell', bn: w, c: [-s * 0.004, -0.074, 0], r: [0.012, 0.016, 0.036], k: 0.012, tag: 'palm' });
    H.push({ t: 'ell', bn: w, c: [-s * 0.009, -0.036, 0.022], r: [0.012, 0.026, 0.016], k: 0.012, tag: 'palm', w: { [w]: 1, ['t' + k + '1']: 0.8 } });
    H.push({ t: 'ell', bn: w, c: [-s * 0.007, -0.052, -0.026], r: [0.0095, 0.03, 0.011], k: 0.01, tag: 'palm' });
    FING.forEach((F, i) => {
      const a = `f${k}${i}a`, b = `f${k}${i}b`, c = `f${k}${i}c`;
      H.push({ t: 'ell', bn: a, c: [s * 0.0045, 0.002, 0], r: [0.0074, 0.009, F.r * 0.95], k: 0.011, tag: 'knuckle' });
      H.push({ t: 'cone', bn: a, a: [0, 0, 0], b: [0, -F.l[0], 0], r1: F.r * 1.02, r2: F.r * 0.97, k: 0.009, tag: 'finger' });
      H.push({ t: 'ell', bn: b, c: [s * 0.0008, 0.001, 0], r: [F.r * 0.98, F.r * 0.92, F.r * 0.98], k: 0.006, tag: 'finger' });
      H.push({ t: 'cone', bn: b, a: [0, 0, 0], b: [0, -F.l[1], 0], r1: F.r * 0.95, r2: F.r * 0.92, k: 0.006, tag: 'finger' });
      H.push({ t: 'cone', bn: c, a: [0, 0, 0], b: [-s * 0.0006, -F.l[2] + F.r * 0.88, 0], r1: F.r * 0.91, r2: F.r * 0.88, k: 0.006, tag: 'tip' });
    });
    H.push({ t: 'cone', bn: 't' + k + '1', a: [0, 0.004, 0], b: [0, -0.042, 0], r1: 0.0135, r2: 0.0118, k: 0.012, tag: 'palm' });
    H.push({ t: 'cone', bn: 't' + k + '2', a: [0, 0, 0], b: [0, -0.032, 0], r1: 0.0114, r2: 0.0106, k: 0.005, tag: 'finger' });
    H.push({ t: 'cone', bn: 't' + k + '3', a: [0, 0, 0], b: [0, -0.026 + 0.009, 0], r1: 0.0105, r2: 0.0092, k: 0.005, tag: 'tip' });
    const hg = chSculpt(comp(H), { h: 0.0029, bones: BI, kw: 0.009, ao: [0.004, 0.55], col: (x, y, z, nx, ny, nz, tag) => tag === 'tip' ? chMix(cSkin, cBlush, 0.4) : tag === 'knuckle' ? chMix(cSkin, cBlush, 0.28) : tag === 'palm' || tag === 'finger' ? chMix(cSkin, cBlush, 0.14) : cSkin });
    meshes.push(skinned(hg, skinMat));
    // nails: small glossy shells on the back of each tip
    FING.forEach((F, i) => { const g = new THREE.SphereGeometry(1, 14, 10); g.scale(0.0018, F.l[2] * 0.4, F.r * 0.74); g.translate(s * F.r * 0.8, -F.l[2] * 0.5, 0); rigid(g, nailMat, `f${k}${i}c`, false); });
    { const g = new THREE.SphereGeometry(1, 14, 10); g.scale(0.0075, 0.0085, 0.0028); const d = TH[k].dors; g.lookAt(d); g.translate(d.x * 0.0078, -0.009 + d.y * 0.0078, d.z * 0.0078); rigid(g, nailMat, 't' + k + '3', false); }
    const grip = new THREE.Group(); grip.position.set(-s * 0.03, -0.075, 0.01); B[w].add(grip);
    arms[k] = { cl: B['cl' + k], sh: B['sh' + k], el: B['el' + k], wr: B[w], hand: B[w], grip, fingers: FING.map((F, i) => [B[`f${k}${i}a`], B[`f${k}${i}b`], B[`f${k}${i}c`]]), th: [B['t' + k + '1'], B['t' + k + '2'], B['t' + k + '3']], thQ: TH[k].q, s };
    // ---------- sneaker (rigid on the ankle): sole + white upper with a green side stripe and heel tab, laces
    const sole = chSculpt(comp([{ t: 'cyl', c: [0, -0.0755, -0.002], rx: 0.04, rz: 0.058, hh: 0.0105, rr: 0.004 }, { t: 'cyl', c: [0, -0.0755, 0.128], rot: [0.05, 0, 0], rx: 0.045, rz: 0.08, hh: 0.0105, rr: 0.004, k: 0.05 }], true), { h: 0.007, ao: [0.006, 0.3], col: (x, y, z) => chL(Math.abs(y + 0.066) < 0.0028 ? '#c9c0ae' : CH_COL.sole) });
    const upP = comp([
      { t: 'ell', c: [0, -0.032, 0.0], r: [0.041, 0.054, 0.056], tag: 'heel' },
      { t: 'ell', c: [0, -0.04, 0.075], r: [0.044, 0.04, 0.078], k: 0.03 },
      { t: 'ell', c: [0, -0.054, 0.15], r: [0.041, 0.027, 0.058], k: 0.03, tag: 'toe' },
      { t: 'ell', c: [0, -0.01, 0.048], rot: [-0.55, 0, 0], r: [0.027, 0.02, 0.038], k: 0.015, tag: 'tongue' },
      { t: 'tor', c: [0, 0.008, -0.004], rot: [0.18, 0, 0], R: 0.036, r: 0.01, sc: [1, 1.3], k: 0.012, tag: 'collar' },
    ], true);
    const upper = chSculpt(upP, { h: 0.0062, ao: [0.006, 0.5], col: (x, y, z, nx, ny, nz, tag) => {
      const sx = Math.abs(x), dl = Math.abs((y + 0.052) - (z - 0.11) * -0.32);
      if (tag === 'collar' || (z < -0.04 && y > -0.035)) return chL(CH_COL.accent);
      if (sx > 0.02 && dl < 0.0085 && z > -0.03 && z < 0.12) return chL(CH_COL.accent);
      if (tag === 'toe' && z > 0.17) return chL('#e6e3dc');
      return chL(CH_COL.shoe);
    } });
    const uf = upper.userData.f, laces = [];
    for (let i = 0; i < 4; i++) { const z = 0.03 + i * 0.02; let y = 0.04; while (y > -0.06 && uf(0, y, z) > 0) y -= 0.002; const g = new THREE.CapsuleGeometry(0.0032, 0.03, 3, 6); g.rotateZ(Math.PI / 2); g.rotateY(i % 2 ? 0.25 : -0.25); g.translate(0, y + 0.002, z); laces.push(g); }
    const lg = chAddColor(chMerge(laces), CH_COL.lace);
    [sole, upper, lg].forEach((g) => { g.scale(1.1, 1, 1.1); rigid(g, shoeMat, 'an' + k); });
    legs[k] = { hp: B['hip' + k], kn: B['kn' + k], an: B['an' + k] };
  });

  // ---------- head: sculpted skull, face mass, cheeks, jaw, chin, brow ridge, nose, ears, eye sockets
  const E = CH_EYE, HD = [
    { t: 'ell', c: [0, 0.125, -0.012], r: [0.093, 0.11, 0.105], tag: 'skull' },
    { t: 'ell', c: [0, 0.078, 0.025], r: [0.069, 0.072, 0.078], k: 0.04, tag: 'face' },
    { t: 'ell', c: [0, 0.03, 0.034], r: [0.047, 0.047, 0.058], k: 0.035, tag: 'jaw' },
    { t: 'ell', c: [0, 0.002, 0.061], r: [0.025, 0.019, 0.02], k: 0.024, tag: 'chin' },
    { t: 'cone', a: [-0.052, 0.124, 0.07], b: [0.052, 0.124, 0.07], r1: 0.015, r2: 0.015, k: 0.025, tag: 'face' },
    { t: 'ell', c: [0, 0.037, 0.07], r: [0.031, 0.02, 0.026], k: 0.02, tag: 'muzzle' },
    { t: 'cone', a: [0, 0.108, 0.087], b: [0, 0.074, 0.104], r1: 0.0085, r2: 0.0095, k: 0.012, tag: 'nose' },
    { t: 'ell', c: [0, 0.067, 0.106], r: [0.0135, 0.012, 0.012], k: 0.01, tag: 'nose' },
  ];
  [1, -1].forEach((s) => {
    HD.push({ t: 'cone', a: [s * 0.058, 0.065, -0.02], b: [s * 0.03, 0.018, 0.035], r1: 0.022, r2: 0.018, k: 0.05, tag: 'jaw' });
    HD.push({ t: 'ell', c: [s * 0.037, 0.071, 0.062], r: [0.026, 0.022, 0.024], k: 0.04, tag: 'cheek' });
    HD.push({ t: 'ell', c: [s * 0.0135, 0.062, 0.097], r: [0.0085, 0.0075, 0.008], k: 0.008, tag: 'nose' });
    HD.push({ t: 'ell', c: [s * 0.094, 0.095, -0.012], rot: [0, -s * 0.35, -s * 0.08], r: [0.011, 0.029, 0.019], k: 0.012, tag: 'ear' });
  });
  [1, -1].forEach((s) => {
    HD.push({ t: 'ell', op: 's', c: [s * 0.1, 0.092, -0.008], rot: [0, -s * 0.35, 0], r: [0.006, 0.018, 0.012], k: 0.004 });
    HD.push({ t: 'ell', op: 's', c: [s * E.x, E.y, E.z], r: [E.r * 1.06, E.r * 1.06, E.r * 1.06], k: 0.005 });
  });
  const headP = comp(HD, true);
  const headGeo = chSculpt(headP, { h: 0.0036, ao: [0.004, 0.18], col: (x, y, z, nx, ny, nz, tag) => {
    let c = cSkin, bl = 0;
    [1, -1].forEach((s) => { bl += 0.17 * chGauss(x, y, z, s * 0.044, 0.066, 0.078, 0.014); });
    bl += 0.3 * chGauss(x, y, z, 0, 0.068, 0.115, 0.01);
    const ex = (Math.abs(x) - 0.094) / 0.017, ey = (y - 0.095) / 0.033, ez = (z + 0.012) / 0.025, ear = 1 - ss(1.0, 1.4, Math.sqrt(ex * ex + ey * ey + ez * ez));
    bl += 0.32 * ear;
    const fx = x / 0.088, fy = (y - 0.066) / 0.104, fz = (z - 0.078) / 0.074, face = Math.sqrt(fx * fx + fy * fy + fz * fz);
    const fade = (1 - ear) * 0.9 * ss(-0.03, 0.004, y) * ss(0.97, 1.12, face) * ss(0.03, 0.0, z) * (1 - ss(-0.035, -0.005, z) * ss(0.085, 0.065, y));
    c = chMul(c, 1 - 0.3 * ss(-0.2, -0.7, ny) * ss(0.064, 0.056, y) * ss(0.03, 0.012, Math.abs(x)) * ss(0.08, 0.095, z));
    c = chMix(c, cBlush, clamp(bl));
    return chMix(c, chL('#3d2b20'), fade);
  } });
  // morph targets: smile L/R (corners + cheeks up), jaw open, frown
  const hp = headGeo.attributes.position, nV = hp.count, mk = () => new Float32Array(nV * 3), mSL = mk(), mSR = mk(), mJ = mk(), mF = mk();
  for (let i = 0; i < nV; i++) {
    const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    [[1, mSL], [-1, mSR]].forEach(([s, A]) => {
      const g1 = chGauss(x, y, z, s * 0.022, 0.038, 0.088, 0.011), g2 = chGauss(x, y, z, s * 0.044, 0.06, 0.075, 0.017), g3 = chGauss(x, y, z, s * 0.036, 0.078, 0.08, 0.009);
      A[i * 3] = g1 * s * 0.004 + g2 * s * 0.001; A[i * 3 + 1] = g1 * 0.0045 + g2 * 0.004 + g3 * 0.002; A[i * 3 + 2] = -g1 * 0.002 + g2 * 0.0025 + g3 * 0.001;
    });
    const jm = ss(CH_MOUTH.y, CH_MOUTH.y - 0.018, y) * ss(-0.04, 0.03, z) * (0.6 + 0.4 * ss(0, 0.08, z));
    mJ[i * 3 + 1] = -0.009 * jm; mJ[i * 3 + 2] = -0.002 * jm;
    [1, -1].forEach((s) => { const g = chGauss(x, y, z, s * 0.022, 0.036, 0.088, 0.011); mF[i * 3 + 1] += -0.003 * g; });
    const gc = chGauss(x, y, z, 0, 0.004, 0.075, 0.012); mF[i * 3 + 1] += 0.0018 * gc; mF[i * 3 + 2] += 0.0015 * gc;
  }
  headGeo.morphAttributes.position = [mSL, mSR, mJ, mF].map((a) => new THREE.BufferAttribute(a, 3)); headGeo.morphTargetsRelative = true;
  const headMesh = rigid(headGeo, skinMat, 'head');
  // mouth decals: the face's own vertices around the mouth (so they follow the morphs), planar uvs, two layers to crossfade
  const decal = (() => {
    const idx = headGeo.index.array, keep = new Map(), I = [], hn = headGeo.attributes.normal;
    const ok = (v) => Math.abs(hp.getX(v)) < CH_MOUTH.w / 2 && Math.abs(hp.getY(v) - CH_MOUTH.y) < CH_MOUTH.h / 2 && hp.getZ(v) > 0.03 && hn.getZ(v) > 0.2;
    for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2]; if (!ok(a) || !ok(b) || !ok(c)) continue; [a, b, c].forEach((v) => { if (!keep.has(v)) keep.set(v, keep.size); I.push(keep.get(v)); }); }
    const n = keep.size, pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3).fill(1), morph = [0, 1, 2, 3].map(() => new Float32Array(n * 3));
    keep.forEach((j, v) => {
      const nx = hn.getX(v), ny = hn.getY(v), nz = hn.getZ(v);
      pos[j * 3] = hp.getX(v) + nx * 0.0003; pos[j * 3 + 1] = hp.getY(v) + ny * 0.0003; pos[j * 3 + 2] = hp.getZ(v) + nz * 0.0003; nor[j * 3] = nx; nor[j * 3 + 1] = ny; nor[j * 3 + 2] = nz;
      uv[j * 2] = 0.5 + hp.getX(v) / CH_MOUTH.w; uv[j * 2 + 1] = 0.5 + (hp.getY(v) - CH_MOUTH.y) / CH_MOUTH.h;
      headGeo.morphAttributes.position.forEach((A, q) => { morph[q][j * 3] = A.getX(v); morph[q][j * 3 + 1] = A.getY(v); morph[q][j * 3 + 2] = A.getZ(v); });
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(I);
    g.morphAttributes.position = morph.map((a) => new THREE.BufferAttribute(a, 3)); g.morphTargetsRelative = true;
    return g;
  })();
  // two sets: the painted mouth for close shots and a bold one (dilated, more opaque) that still reads when the face is small on screen
  const mTex = {}, mBold = {};
  CH_MOUTHS.forEach((k) => {
    mTex[k] = chMouthTex(k);
    mBold[k] = g3Tex((x, w, h) => { const src = mTex[k].image, R0 = 9; x.clearRect(0, 0, w, h); for (let a = 0; a < 12; a++) x.drawImage(src, Math.cos(a / 12 * TAU) * R0 * 1.4, Math.sin(a / 12 * TAU) * R0); x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(66,20,16,1)'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over'; x.drawImage(src, 0, 0); }, 512, 256);
  });
  // the bold set fades in as the face gets small on screen (11 -> 6 px per cm), mixed in the shader so there is no pop
  const mouthL = [0, 1].map((q) => {
    const mat = sss(new THREE.MeshPhysicalMaterial({ map: mTex.neutral, transparent: true, depthWrite: false, roughness: 0.42, vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2 - q, polygonOffsetUnits: -2 - q }));
    const U = { boldMap: { value: mBold.neutral }, boldMix: { value: 0 } }, prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (sh) => { prev(sh); Object.assign(sh.uniforms, U); sh.fragmentShader = 'uniform sampler2D boldMap;\nuniform float boldMix;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\n\tdiffuseColor *= mix( texture2D( map, vUv ), texture2D( boldMap, vUv ), boldMix );\n#endif'); };
    mat.customProgramCacheKey = () => 'ch-sss-mouth';
    const m = new THREE.Mesh(decal, mat); m.renderOrder = 2 + q; B.head.add(m); m.receiveShadow = true;
    m.onBeforeRender = (r, sc, cam) => { const k = m.userData.k; if (!k) return; const d = cam.position.distanceTo(m.getWorldPosition(V3(0, 0, 0))), ppc = r.domElement.height / (2 * d * Math.tan(cam.fov * DEG / 2)) / 100; mat.map = mTex[k]; U.boldMap.value = mBold[k]; U.boldMix.value = ss(11, 6, ppc); };
    return m; });

  // ---------- eyes: eyeball (iris texture), two catchlights, upper/lower lids with a lash line, brows (rebuilt per frame on the skin)
  const eyeTex = chTexEye(), eyes = [], lids = [], brows = [];
  const eyeG = new THREE.SphereGeometry(E.r, 40, 28); { const p = eyeG.attributes.position, uv = eyeG.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) / (2 * E.r), 0.5 + p.getY(i) / (2 * E.r)); }
  const eyeMat = new THREE.MeshPhysicalMaterial({ map: eyeTex, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 });
  const glint = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const lidMat = sss(new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5, sheen: 0.3, sheenColor: lin('#ffb59a') }));
  [1, -1].forEach((s) => {
    const eg = new THREE.Group(); eg.position.set(s * E.x, E.y, E.z); B.head.add(eg);
    const look = new THREE.Group(); eg.add(look); look.add(new THREE.Mesh(eyeG, eyeMat));
    [[0.34, 0.42, 0.17], [-0.3, -0.28, 0.08]].forEach(([gx, gy, sz]) => { const d = V3(gx, gy, 1).normalize(), m = new THREE.Mesh(new THREE.CircleGeometry(E.r * sz, 16), glint); m.position.copy(d.clone().multiplyScalar(E.r * 1.012)); m.lookAt(d.clone().multiplyScalar(2)); eg.add(m); });
    const rl = E.r * 1.075;
    const up = new THREE.Group(); eg.add(up); up.add(new THREE.Mesh(chAddColor(new THREE.SphereGeometry(rl, 36, 14, 0, TAU, 0, Math.PI / 2), '#e2a684'), lidMat));
    const lo = new THREE.Group(); eg.add(lo); lo.add(new THREE.Mesh(chAddColor(new THREE.SphereGeometry(rl * 0.99, 36, 14, 0, TAU, Math.PI / 2, Math.PI / 2), '#e6ab8a'), lidMat));
    // lash line: a tapered tube along the upper lid edge, heavier toward the outer corner, with a small flick
    const C = [], Nn = [], wb = [], wn = [];
    for (let i = 0; i <= 22; i++) {
      const u = i / 22, ph = (-78 + 156 * u) * DEG * s, out = s > 0 ? u : 1 - u, rr = rl * 1.01 + 0.0003, flick = ss(0.85, 1, out);
      C.push(V3(Math.sin(ph) * rr * (1 + 0.06 * flick), -0.0004 + 0.0022 * flick, Math.cos(ph) * rr)); Nn.push(V3(0, 1, 0));
      const th = 0.0005 + 0.0013 * Math.sin(Math.PI * clamp(out * 1.05)) ** 0.6 * (0.6 + 0.4 * out);
      wb.push(th); wn.push(th * 0.9);
    }
    up.add(new THREE.Mesh(chTube(C, Nn, wb, wn, 6, 1), lashMat));
    const C2 = [], N2 = [], wb2 = [], wn2 = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16, ph = (-70 + 140 * u) * DEG; C2.push(V3(Math.sin(ph) * rl * 1.0, 0.0002, Math.cos(ph) * rl * 1.0)); N2.push(V3(0, -1, 0)); const th = 0.0009 * Math.sin(Math.PI * u) ** 0.5; wb2.push(th); wn2.push(th); }
    lo.add(new THREE.Mesh(chAddColor(chTube(C2, N2, wb2, wn2, 6, 1), '#d99c80'), lidMat));
    eyes.push({ g: eg, look, s }); lids.push({ up, lo, s });
    const bm = new THREE.Mesh(new THREE.BufferGeometry(), hairMat); B.head.add(bm); bm.castShadow = false; brows.push({ m: bm, s });
  });

  // ---------- hair: a sculpted mass (volume on top, side-swept fringe) with strand grooves fanning from the crown,
  //            plus pointed locks at the edges (fringe, top flicks, sideburns, nape); root-dark, anisotropic-like highlight band
  const HC = [0, 0.13, -0.016], crown = V3(0.2, 0.78, -0.6).normalize(), ce1 = V3(1, 0, 0).sub(crown.clone().multiplyScalar(crown.x)).normalize(), ce2 = crown.clone().cross(ce1);
  const groove = (x, y, z) => {   // narrow grooves along meridians from the crown (strand clumps), slightly wavy
    const q = V3(x - HC[0], y - HC[1], z - HC[2]).normalize(), th = Math.acos(clamp(q.dot(crown), -1, 1)), ps = Math.atan2(q.dot(ce2), q.dot(ce1)) + 0.06 * Math.sin(th * 5);
    const a = Math.abs(Math.sin(ps * 6)), b = 0;
    return 0.0018 * (1 - ss(0, 0.6, a)) * ss(0.25, 0.6, th) + 0 * b;
  };
  const headF0 = chSdfFn(headP);
  const massP = comp([
    { t: 'fn', bc: [0, 0.125, -0.012], br: 0.13, tag: 'mass', disp: groove, fn: (x, y, z) => {   // the skull, inflated by a thickness that tapers to nothing at the nape and above the ears
      const th = -0.0025 + 0.0058 * ss(-0.01, 0.04, y) + 0.009 * ss(0.07, 0.15, y) + 0.004 * ss(0.15, 0.22, y) - 0.0045 * ss(0.055, 0.085, Math.abs(x)) * (1 - ss(0.11, 0.16, y)) - 0.012 * ss(-0.035, -0.005, z) * ss(0.085, 0.06, y);   // well under the skin on the jaw/cheek (no coplanar flicker)
      return headF0(x, y, z) - th; } },
    { t: 'ell', c: [0.0, 0.178, 0.012], r: [0.084, 0.062, 0.092], k: 0.04, tag: 'mass' },
    { t: 'ell', c: [-0.02, 0.182, 0.06], rot: [0, 0, 0.25], r: [0.07, 0.04, 0.05], k: 0.035, tag: 'mass' },
    { t: 'ell', op: 's', c: [0, 0.066, 0.078], r: [0.088, 0.104, 0.074], k: 0.012, disp: (x, y, z) => 0.0045 * Math.sin(x * 150 + 0.8) * ss(0.08, 0.04, Math.abs(x)) },
    { t: 'ell', op: 's', c: [0.098, 0.083, -0.004], r: [0.03, 0.04, 0.036], k: 0.01 }, { t: 'ell', op: 's', c: [-0.098, 0.083, -0.004], r: [0.03, 0.04, 0.036], k: 0.01 },
    { t: 'box', op: 's', c: [0, -0.112, 0], h: [0.3, 0.1, 0.3], rr: 0, k: 0.01 },
  ], true);
  const cHair = chL(CH_COL.hair), cHi = chL(CH_COL.hairHi);
  const hairShade = (ny, nz, s) => { const band = Math.exp(-(((ny * 0.85 + nz * 0.3) - 0.66) ** 2) / 0.018); return chMix(chMul(cHair, 0.6 + 0.4 * s), cHi, band * 0.5 * (0.4 + 0.6 * s)); };
  const massGeo = chSculpt(massP, { h: 0.0052, ao: [0.004, 0.45], col: (x, y, z, nx, ny, nz) => hairShade(ny, nz, 1) });
  { const uv = massGeo.attributes.uv, p = massGeo.attributes.position; for (let i = 0; i < p.count; i++) { const q = V3(p.getX(i) - HC[0], p.getY(i) - HC[1], p.getZ(i) - HC[2]).normalize(); uv.setXY(i, Math.atan2(q.dot(ce2), q.dot(ce1)) / TAU * 6, Math.acos(clamp(q.dot(crown), -1, 1)) * 0.6); } }
  const mf0 = massGeo.userData.f, hf0 = chSdfFn(headP), mf = (x, y, z) => Math.min(mf0(x, y, z), hf0(x, y, z) - 0.0015), R = RNG('ch-hair-locks'), locks = [];
  const dirOf = (az, el) => V3(Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG));
  const surf = (d, lift) => { let lo = 0, hi = 0.2; for (let it = 0; it < 22; it++) { const m = (lo + hi) / 2; if (mf(HC[0] + d.x * m, HC[1] + d.y * m, HC[2] + d.z * m) < 0) lo = m; else hi = m; } return V3(HC[0], HC[1], HC[2]).addScaledVector(d, lo + lift); };
  // a lock: from (az0,el0) to (az1,el1) over the mass, lifting by `lift` at the tip, width W
  const lock = (az0, el0, az1, el1, W, lift = 0, bulge = 0.004, curl = 0) => {
    const n = 11, C = [], Nn = [], wb = [], wn = [];
    for (let k = 0; k < n; k++) {
      const s = k / (n - 1), e = s * s * (3 - 2 * s) * 0.4 + s * 0.6, d = dirOf(lerp(az0, az1, e) + curl * Math.sin(Math.PI * s), lerp(el0, el1, e)).normalize();
      C.push(surf(d, -0.003 + bulge * Math.sin(Math.PI * Math.min(1, s * 1.2)) + lift * s * s)); Nn.push(d);
      wb.push(W * Math.pow(1 - s, 0.7) * (0.75 + 0.25 * Math.sin(Math.PI * Math.min(1, s * 1.8))) + 0.0003); wn.push(W * 0.34 * Math.pow(1 - s, 0.5) + 0.0003);
    }
    const g = chTube(C, Nn, wb, wn, 7, 0.3), cn = g.attributes.normal, uv = g.attributes.uv, col = new Float32Array(cn.count * 3), tint = R.r(0.88, 1.1);
    for (let v = 0; v < cn.count; v++) col.set(chMul(hairShade(cn.getY(v), cn.getZ(v), 0.55 + 0.45 * uv.getY(v)), tint), v * 3);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); locks.push(g);
  };
  for (let i = 0; i < 8; i++) lock(50 - 13 * i + R.n(3), 44 + R.n(3), 4 - 13 * i + R.n(4), (i % 3 === 1 ? 6 : 13) - 0.5 * i + R.n(2), 0.024 + R.r(0, 0.006), 0.005 + 0.0015 * i, 0.007, -8);   // fringe, swept to his right
  for (let i = 2; i < 7; i++) lock(170 - 22 * i + R.n(6), 62 + R.n(5), 40 - 14 * i + R.n(5), 44 + R.n(4), 0.026 + R.r(0, 0.006), i < 2 ? 0.002 : 0.009, 0.006, 4);   // top, flowing forward
  const hairGeo = chMerge(locks);
  rigid(hairGeo, hairMat, 'head').receiveShadow = false; rigid(massGeo, hairMat, 'head').receiveShadow = false;   // hair casts onto the face but takes no VSM shadow (it sparkled at grazing angles)
  meshes.forEach((m) => m.bind(skel, m.matrixWorld));
  B.head.scale.setScalar(1.1); B.wrL.scale.setScalar(1.1); B.wrR.scale.setScalar(1.1);   // a slightly bigger head for appeal (after binding, so the neck stays in place)
  CH = { mBold, root, B, bones, skel, hips: B.hips, spine: B.spine, chest: B.chest, neck: B.neck, head: B.head, arms, legs, eyes, lids, brows, mouth: mouthL, mTex, headMesh, headF: headP && chSdfFn(headP), meshes };
  return CH;
}

// ---- posing
const chLerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const CH_JOINTS = ['hips', 'spine', 'chest', 'neck', 'head', 'clL', 'clR', 'shL', 'shR', 'elL', 'elR', 'wrL', 'wrR', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR'];
function chJointObj(c, j) { return c.B[j]; }
// brows: a tapered tube laid on the forehead skin, inner/outer heights and squeeze per frame
function chBrow(c, b, bIn, bOut, bSq) {
  const s = b.s, f = c.headF, C = [], Nn = [], wb = [], wn = [], n = 14;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), x = s * (0.012 + 0.048 * u - 0.004 * bSq * (1 - u)), y = 0.124 + 0.0075 * Math.sin(Math.PI * Math.pow(u, 0.8)) - 0.003 * u + lerp(bIn, bOut, u) + (bOut - bIn) * 0.2 * Math.sin(Math.PI * u) - 0.002 * bSq * (1 - u) * (1 - u);
    let z = 0.14; for (let it = 0; it < 40 && f(x, y, z) > 0; it++) z -= 0.0015;
    let lo = z, hi = z + 0.0015; for (let it = 0; it < 8; it++) { const m = (lo + hi) / 2; if (f(x, y, m) > 0) hi = m; else lo = m; }
    const e = 0.001, nx = f(x + e, y, lo) - f(x - e, y, lo), ny = f(x, y + e, lo) - f(x, y - e, lo), nz = f(x, y, lo + e) - f(x, y, lo - e), N = V3(nx, ny, nz).normalize();
    C.push(V3(x, y, lo).addScaledVector(N, 0.0012)); Nn.push(N);
    const bw = c.browW ?? 1, th = (0.0048 * Math.pow(1 - u, 0.55) * Math.min(1, 0.55 + u * 4) + 0.0012) * bw; wb.push(th * 0.95); wn.push((0.0019 * (1 - 0.5 * u) + 0.0006) * Math.sqrt(bw));
  }
  const g = chTube(C, Nn, wb, wn, c.browSeg ?? 8, 0.3);
  chAddColor(g, c.browCol ?? CH_COL.hair);
  b.m.geometry.dispose(); b.m.geometry = g;
}
// walk cycle (adds to acc): left leg forward peak (heel strike) at p = π/2, push-off near 3π/2, swing through p = 0; right leg half a cycle later.
// The foot's pitch to the ground (hip + knee + ankle) is set directly, so the support foot stays flat and the pelvis does not hop.
function chWalk(acc, p, A) {
  const sp = Math.sin(p);
  const bump = (q, c, w) => { let d = ((q - c) % TAU + TAU * 1.5) % TAU - Math.PI; return Math.exp(-d * d / (2 * w * w)); };
  [['L', 0], ['R', Math.PI]].forEach(([k, off]) => {
    const q = p + off;
    const hx = -18 * Math.sin(q) * A, kx = (3 + 52 * bump(q, -0.3, 0.62) + 4 * bump(q, Math.PI / 2 + 0.5, 0.4)) * A;
    acc['hip' + k][0] += hx; acc['kn' + k][0] += kx;
    acc['an' + k][0] += (-11 * bump(q, Math.PI / 2, 0.45) + 17 * bump(q, Math.PI * 1.5 - 0.15, 0.45) - 6 * bump(q, -0.2, 0.6)) * A - hx - kx;   // foot pitch to the ground = hip + knee + ankle
  });
  acc.shL[0] += 26 * sp * A; acc.shR[0] += -26 * sp * A; acc.elL[0] += -(12 + 16 * Math.max(0, -sp)) * A; acc.elR[0] += -(12 + 16 * Math.max(0, sp)) * A;
  acc.shL[2] -= 3; acc.shR[2] += 3;
  acc.hips[1] += 6 * sp * A; acc.chest[1] += -8 * sp * A; acc.spine[0] += 3 * A; acc.neck[1] += 2 * sp * A;
  acc.hips[2] += 2.5 * Math.sin(p) * A; acc.spine[2] += -1.8 * Math.sin(p) * A;
}
// the walk's foot height as a smooth curve: sample the soft-min contact over one cycle once (per pose + stride), keep the DC and
// the 2nd/4th harmonics (the pelvis bobs twice per cycle) and cap the bob at 1.5 cm peak to peak
const CH_WALKY = {};
function chWalkHeight(c, base, A, p) {
  const key = (c.wid ?? '') + A.toFixed(3) + ['hips', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR'].map((j) => base[j].map((v) => v.toFixed(1)).join(',')).join('|');
  let F = CH_WALKY[key];
  if (!F) {
    const J = ['hips', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR'], keep = J.map((j) => c.B[j].rotation.clone()), rp = c.root.position.clone(), rr = c.root.rotation.clone();
    c.root.position.set(0, 0, 0); c.root.rotation.set(0, 0, 0);
    const N = 32, L = [], v = V3(0, 0, 0);
    for (let i = 0; i < N; i++) {
      const acc = {}; CH_JOINTS.forEach((j) => { acc[j] = [...base[j]]; }); chWalk(acc, i / N * TAU, A);
      J.forEach((j) => c.B[j].rotation.set(acc[j][0] * DEG, acc[j][1] * DEG, acc[j][2] * DEG, 'XYZ')); c.root.updateMatrixWorld(true);
      let mn = 1e9, se = 0; const ys = [];
      ['L', 'R'].forEach((k) => [[0, -0.09, -0.06], [0, -0.09, 0.21], [0, -0.09, 0.13], [0, -0.09, 0.04]].forEach((pt) => { v.set(...pt).applyMatrix4(c.legs[k].an.matrixWorld); ys.push(v.y); mn = Math.min(mn, v.y); }));
      L.push(mn + 0 * se);
    }
    const co = [2, 4].map((n) => [L.reduce((a, y, i) => a + y * Math.cos(n * i / N * TAU), 0) * 2 / N, L.reduce((a, y, i) => a + y * Math.sin(n * i / N * TAU), 0) * 2 / N]);
    const a0 = L.reduce((a, y) => a + y, 0) / N, h = (q) => co.reduce((a, [cn, sn], i) => a + cn * Math.cos([2, 4][i] * q) + sn * Math.sin([2, 4][i] * q), 0);
    let lo = 1e9, hi = -1e9; for (let i = 0; i < 64; i++) { const y = h(i / 64 * TAU); lo = Math.min(lo, y); hi = Math.max(hi, y); }
    const k = Math.min(1, 0.015 / Math.max(1e-6, hi - lo));
    F = CH_WALKY[key] = (q) => a0 + k * h(q);
    J.forEach((j, i) => c.B[j].rotation.copy(keep[i])); c.root.position.copy(rp); c.root.rotation.copy(rr); c.root.updateMatrixWorld(true);
  }
  return F(p);
}
// o: { pose: 'stand' | [[name, w], ...], walk: phase (cycles) | null, stride, expr: name | [[name, w]...], look: [yaw, pitch] (deg),
//      blink: true, t, curl: 0..1 (both hands), hand: { L, R } shape names, pos: [x, y, z], rot: yaw (deg), add: {joint: [dx,dy,dz]}, sitY, ground: true }
function chPose(o = {}) { return chPoseRig(chBuild(), o); }
// the posing core, shared by the hero and the extras (c = a rig built like chBuild's)
function chPoseRig(c, o = {}) {
  const t = o.t ?? TT;
  const list = typeof o.pose === 'string' ? [[o.pose, 1]] : (o.pose ?? [['stand', 1]]);
  const acc = {}; CH_JOINTS.forEach((j) => { acc[j] = [0, 0, 0]; });
  let wsum = 0, sitW = 0; list.forEach(([n, w]) => { wsum += w; if (n === 'sit') sitW += w; });
  const hands = { L: { f: [0, 0, 0, 0], th: 0, sp: 0 }, R: { f: [0, 0, 0, 0], th: 0, sp: 0 } };
  list.forEach(([name, w]) => {
    const P = CH_POSES[name] || {}, k = w / wsum;
    CH_JOINTS.forEach((j) => { const v = P[j] || [0, 0, 0]; acc[j] = [acc[j][0] + v[0] * k, acc[j][1] + v[1] * k, acc[j][2] + v[2] * k]; });
    ['L', 'R'].forEach((s, i) => { const Hd = CH_HANDS[(P.h || [])[i] || 'relax']; Hd.f.forEach((v, q) => { hands[s].f[q] += v * k; }); hands[s].th += Hd.th * k; hands[s].sp += Hd.sp * k; });
  });
  const base = {}; CH_JOINTS.forEach((j) => { base[j] = [...acc[j]]; });
  if (o.walk != null) chWalk(acc, o.walk * TAU, o.stride ?? 1);
  // idle: breathing (chest + shoulders) and a slow weight shift
  const br = Math.sin(t * 1.6);
  acc.chest[0] += -0.9 * br; acc.clL[2] += 0.9 * br; acc.clR[2] -= 0.9 * br; acc.neck[0] += 0.6 * Math.sin(t * 1.6 + 0.6); acc.hips[2] += 0.7 * Math.sin(t * 0.5); acc.head[1] += 1.2 * Math.sin(t * 0.37);
  if (o.add) Object.entries(o.add).forEach(([j, v]) => { if (acc[j]) acc[j] = [acc[j][0] + v[0], acc[j][1] + v[1], acc[j][2] + v[2]]; });
  CH_JOINTS.forEach((j) => { c.B[j].rotation.set(acc[j][0] * DEG, acc[j][1] * DEG, acc[j][2] * DEG, 'XYZ'); });
  // hands
  if (o.curl != null) ['L', 'R'].forEach((s) => { hands[s].f = hands[s].f.map(() => o.curl); hands[s].th = o.curl * 0.85; });
  if (o.hand) Object.entries(o.hand).forEach(([s, n]) => { const Hd = CH_HANDS[n]; if (Hd) hands[s] = { f: [...Hd.f], th: Hd.th, sp: Hd.sp }; });
  const SPR = [-5, -1, 4, 10], qa = new THREE.Quaternion(), X = V3(1, 0, 0), Z = V3(0, 0, 1);
  ['L', 'R'].forEach((k) => {
    const A = c.arms[k], s = A.s, Hd = hands[k];
    A.fingers.forEach(([f1, f2, f3], i) => {
      const cu = Hd.f[i];
      f1.rotation.set(SPR[i] * (0.5 + Hd.sp * 1.2) * (1 - 0.7 * clamp(cu)) * DEG, 0, -s * (cu * 82 + 5) * DEG);
      f2.rotation.set(0, 0, -s * (Math.max(0, cu) * 98 + 6 + (cu < 0 ? cu * 20 : 0)) * DEG);
      f3.rotation.set(0, 0, -s * (Math.max(0, cu) * 62 + 4 + (cu < 0 ? cu * 20 : 0)) * DEG);
    });
    const tc = Hd.th;
    A.th[0].quaternion.copy(A.thQ).multiply(qa.setFromAxisAngle(X, tc * 18 * DEG)).multiply(new THREE.Quaternion().setFromAxisAngle(Z, s * tc * 22 * DEG));
    A.th[1].quaternion.setFromAxisAngle(X, (tc * 38 + 4) * DEG);
    A.th[2].quaternion.setFromAxisAngle(X, (tc * 50 + 6) * DEG);
  });
  // place + ground lock (lowest heel / toe on the floor) unless sitting
  const pos = o.pos ?? [0, 0, 0];
  c.root.position.set(pos[0], pos[1], pos[2]); c.root.rotation.set(0, (o.rot ?? 0) * DEG, 0);
  if (o.ground !== false && sitW / wsum < 0.5 && o.sitY == null) {
    c.root.updateMatrixWorld(true);
    let mn = 1e9, se = 0; const v = V3(0, 0, 0), ys = [], tau = o.walk != null ? 0.006 : 0.0005;   // soft minimum while walking: the support hand-off stays smooth (no hop)
    ['L', 'R'].forEach((k) => [[0, -0.09, -0.06], [0, -0.09, 0.21], [0, -0.09, 0.13], [0, -0.09, 0.04]].forEach((pt) => { v.set(...pt).applyMatrix4(c.legs[k].an.matrixWorld); ys.push(v.y); mn = Math.min(mn, v.y); }));
    ys.forEach((y) => { se += Math.exp(-(y - mn) / tau); }); mn -= tau * Math.log(se);
    if (o.walk != null) mn = c.root.position.y + chWalkHeight(c, base, o.stride ?? 1, o.walk * TAU);   // smooth pelvis path (bob <= 1.5 cm) instead of the raw contact
    c.root.position.y += pos[1] - mn;
  } else c.root.position.y += o.sitY ?? 0;
  // face
  const ex = typeof o.expr === 'string' || !o.expr ? [[o.expr ?? 'neutral', 1]] : o.expr;
  const F = { bIn: 0, bOut: 0, bSq: 0, lidU: 0, lidL: 0, smL: 0, smR: 0, jaw: 0, frown: 0, asym: 0 };
  let ew = 0; const mw = {};
  ex.forEach(([n, w]) => { const Ex = CH_EXPR[n] || CH_EXPR.neutral; Object.keys(F).forEach((key) => { F[key] += (Ex[key] ?? 0) * w; }); ew += w; mw[Ex.mouth] = (mw[Ex.mouth] ?? 0) + w; });
  Object.keys(F).forEach((key) => { F[key] /= ew; });
  if (o.blink !== false) { const ph = (t * 0.29 + 0.37 + (c.blinkOff ?? 0)) % 1, bl = ph < 0.04 ? Math.sin(ph / 0.04 * Math.PI) : 0; F.lidU = lerp(F.lidU, 1, bl); }
  const lk = o.look ?? [0, 0], lowA = lerp(37, 12, clamp(F.lidL)) + (F.lidL < 0 ? -F.lidL * 12 : 0), upOpen = -35 + lk[1] * -0.45, upA = F.lidU >= 0 ? lerp(upOpen, lowA - 2, F.lidU) : upOpen + F.lidU * 22;
  c.eyes.forEach((Ey) => { Ey.look.rotation.set(-lk[1] * DEG, lk[0] * DEG, 0); });
  c.lids.forEach((L) => { L.up.rotation.x = upA * DEG; L.lo.rotation.x = (lowA - lk[1] * 0.25) * DEG; });
  c.brows.forEach((b) => {
    const bi = F.bIn + (b.s > 0 ? F.asym : 0), bo = F.bOut + (b.s > 0 ? F.asym * 1.2 : 0);
    if (!c.browCache) { chBrow(c, b, bi, bo, F.bSq); return; }
    const key = b.s + ':' + [bi, bo, F.bSq].map((v) => Math.round(v * 2000)).join(',');   // extras: brows cached per (quantized) expression
    let g = c.browCache[key]; if (!g) { b.m.geometry = new THREE.BufferGeometry(); chBrow(c, b, bi, bo, F.bSq); g = c.browCache[key] = b.m.geometry; }
    b.m.geometry = g;
  });
  const inf = c.headMesh.morphTargetInfluences, mf = [F.smL, F.smR, F.jaw, F.frown];
  mf.forEach((v, i) => { inf[i] = v; c.mouth.forEach((m) => { m.morphTargetInfluences[i] = v; }); });
  const ms = Object.entries(mw).sort((a, b) => b[1] - a[1]);
  c.mouth.forEach((m) => { m.userData.bold = c.mBold; m.userData.thin = c.mTex; }); c.mouth[0].userData.k = ms[0][0]; c.mouth[0].material.map = c.mTex[ms[0][0]]; c.mouth[0].material.opacity = 1;
  if (ms[1] && ms[1][1] / ew > 0.04) { c.mouth[1].visible = true; c.mouth[1].userData.k = ms[1][0]; c.mouth[1].material.map = c.mTex[ms[1][0]]; c.mouth[1].material.opacity = ms[1][1] / (ms[0][1] + ms[1][1]); } else c.mouth[1].visible = false;
  return c;
}

// =====================================================================
//  EXTRAS — chExtra(seed, o): background people built with the hero's tech (SDF sculpt + surface nets, one skinned
//  skeleton, a sculpted head with smile/jaw/frown morphs, painted mouths, lids, brows, real hands), varied by seed + options.
//  Sculpted parts are cached by style (body by sex/outfit/lod, head by sex/face/lod, hair by style/face, hands and shoes
//  once), so an extra only builds bones, recolours shared geometry and makes a few small materials.
//  o: { sex 'm'|'f', age 'young'|'adult'|'old', skin 0..1, build 'slim'|'avg'|'heavy', hair style id, hairColor (name or hex),
//       outfit 'casual'|'tee'|'jersey'|'suit'|'uniform'|'apron'|'dress', bottom 'pants'|'skirt', colors { top, top2, bottom,
//       shirt, tie, apron, shoe, lips }, beard 'none'|'stubble'|'full'|'goatee'|'mustache', glasses, makeup, face 0..3, height, lod 0|1 }
//  Returns { root, pose(o), rig, o }: pose() takes chPose's options (pose names, walk, expr, look, hand, curl, pos, rot, add, t ...).
// =====================================================================
const CH_XSKIN = ['#f8ddc8', '#f1c4a3', '#e4aa84', '#cc9068', '#ab6f49', '#865332', '#603a23', '#432818'];
const CH_XHAIR = { black: '#15100d', dark: '#2c1d14', brown: '#553823', chestnut: '#6e3d22', auburn: '#82361d', blonde: '#c49e62', ash: '#9a8b72', grey: '#8f8a84', white: '#dcd8d0' };
const CH_XIRIS = [['#5a3a22', '#b98a4c', '#8a5a30'], ['#2d1c12', '#7a5634', '#4a2f1c'], ['#3d5f7a', '#a6c6dc', '#5f88a6'], ['#4f6a3a', '#b8b474', '#7a8a4a'], ['#6a5030', '#c4a464', '#8a6a3a']];
const CH_XLIPS = {
  natural: CH_LIP0,
  nude: { line: 'rgba(96,40,34,1)', lower: 'rgba(196,120,104,0.85)', upper: 'rgba(184,108,92,0.7)', rim: 'rgba(150,70,60,0.95)', oh: 'rgba(190,110,96,0.95)' },
  rose: { line: 'rgba(110,30,40,1)', lower: 'rgba(204,96,112,0.92)', upper: 'rgba(190,84,100,0.85)', rim: 'rgba(170,60,76,1)', oh: 'rgba(204,96,112,1)' },
  red: { line: 'rgba(110,12,18,1)', lower: 'rgba(196,34,44,0.95)', upper: 'rgba(180,28,38,0.9)', rim: 'rgba(170,24,34,1)', oh: 'rgba(196,34,44,1)' },
  berry: { line: 'rgba(80,14,34,1)', lower: 'rgba(140,40,72,0.95)', upper: 'rgba(124,34,64,0.9)', rim: 'rgba(120,30,58,1)', oh: 'rgba(140,40,72,1)' },
};
const CH_XPROP = { m: { hipY: 0.86, shW: 0.176, upA: 0.26, foA: 0.235, hipW: 0.092, leg: 0.35 }, f: { hipY: 0.84, shW: 0.158, upA: 0.25, foA: 0.225, hipW: 0.094, leg: 0.34 } };
const CH_FING = [{ yb: 0.084, z: 0.026, l: [0.043, 0.027, 0.023], r: 0.0097, sp: -5 }, { yb: 0.087, z: 0.0087, l: [0.047, 0.03, 0.024], r: 0.0095, sp: -1 }, { yb: 0.084, z: -0.0087, l: [0.044, 0.028, 0.023], r: 0.009, sp: 4 }, { yb: 0.077, z: -0.025, l: [0.035, 0.022, 0.02], r: 0.008, sp: 10 }];
const CH_XC = { body: {}, head: {}, hair: {}, beard: {}, hand: {}, shoe: {}, eye: {}, mouth: {}, lash: {}, M: null };
const chXHex = (c) => (typeof c === 'string' && c[0] !== '#' ? CH_XHAIR[c] ?? '#2c1d14' : c);
function chXSSS(mat, wrap = '0.26, 0.17, 0.14') { mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <lights_physical_pars_fragment>', THREE.ShaderChunk.lights_physical_pars_fragment.replace('reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );', `{ float ndl = dot( geometry.normal, directLight.direction ); vec3 W = vec3( ${wrap} ); vec3 wr = clamp( ( vec3( ndl ) + W ) / ( 1.0 + W ), 0.0, 1.0 ); reflectedLight.directDiffuse += wr * directLight.color * BRDF_Lambert( material.diffuseColor ); }`)); }; mat.customProgramCacheKey = () => 'ch-sss'; return mat; }
function chXMats() {
  if (CH_XC.M) return CH_XC.M;
  const knit = chTexKnit(), twill = chTexTwill(); [knit, twill].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
  CH_XC.M = {
    skin: chXSSS(new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5, sheen: 0.35, sheenColor: lin('#ffb59a'), sheenRoughness: 0.55, specularIntensity: 0.6 })),
    cloth: chXMask(new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.86, sheen: 0.5, sheenColor: lin('#d8d8d8'), sheenRoughness: 0.7, bumpMap: knit, bumpScale: 0.0006, specularIntensity: 0.3 })),
    pants: chXMask(new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.82, sheen: 0.35, sheenColor: lin('#b0b8c8'), sheenRoughness: 0.7, bumpMap: twill, bumpScale: 0.0007, specularIntensity: 0.35 })),
    shoe: new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5 }),
    hair: new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.45, map: chTexHair() }),
    lash: new THREE.MeshStandardMaterial({ color: lin(CH_COL.lash), roughness: 0.6 }),
    glint: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    frame: new THREE.MeshStandardMaterial({ color: lin('#1c1a1a'), roughness: 0.35, metalness: 0.2 }),
  };
  return CH_XC.M;
}
// a geometry that shares a cached one's attributes (and morphs, groups) but owns its colours
function chXInst(src, colFn, two = false) {
  const g = new THREE.BufferGeometry(), n = src.attributes.position.count, col = new Float32Array(n * 3), out = [0, 0, 0], colB = two ? new Float32Array(n * 3) : null, colC = two ? new Float32Array(n * 3) : null, mk = two ? new Float32Array(n * 2) : null, outB = [0, 0, 0, -1, 0, 0, 0, -1];
  Object.keys(src.attributes).forEach((k) => { if (k !== 'color') g.setAttribute(k, src.attributes[k]); });
  g.setIndex(src.index); g.morphAttributes = src.morphAttributes; g.morphTargetsRelative = src.morphTargetsRelative; src.groups.forEach((q) => g.addGroup(q.start, q.count, q.materialIndex));
  if (!src.boundingSphere) src.computeBoundingSphere(); g.boundingSphere = src.boundingSphere;
  for (let i = 0; i < n; i++) { colFn(i, out, outB); col[i * 3] = out[0]; col[i * 3 + 1] = out[1]; col[i * 3 + 2] = out[2]; if (two) { colB[i * 3] = outB[0]; colB[i * 3 + 1] = outB[1]; colB[i * 3 + 2] = outB[2]; mk[i * 2] = outB[3]; colC[i * 3] = outB[4]; colC[i * 3 + 1] = outB[5]; colC[i * 3 + 2] = outB[6]; mk[i * 2 + 1] = outB[7]; } }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (two) { g.setAttribute('colorB', new THREE.BufferAttribute(colB, 3)); g.setAttribute('colorC', new THREE.BufferAttribute(colC, 3)); g.setAttribute('mk', new THREE.BufferAttribute(mk, 2)); }
  return g;
}
// cloth materials that blend colour A -> B on the sign of a per-vertex mask (anti-aliased with fwidth)
function chXMask(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute vec3 colorB;\nattribute vec3 colorC;\nattribute vec2 mk;\nvarying vec3 vColB;\nvarying vec3 vColC;\nvarying vec2 vMk;\n' + sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>\n\tvColB = colorB; vColC = colorC; vMk = mk;');
    sh.fragmentShader = 'varying vec3 vColB;\nvarying vec3 vColC;\nvarying vec2 vMk;\n' + sh.fragmentShader.replace('#include <color_fragment>', 'vec2 mkA = clamp( vMk / max( fwidth( vMk ), vec2( 1e-5 ) ) * 0.7 + 0.5, 0.0, 1.0 );\n\tdiffuseColor.rgb *= mix( mix( vColor, vColB, mkA.x ), vColC, mkA.y );');
  };
  mat.customProgramCacheKey = () => 'ch-xmask';
  return mat;
}
function chXThumb(s) { const dir = V3(-s * 0.3, -0.72, 0.62).normalize(), np = V3(-s, 0, 0), K = dir.clone().cross(np).normalize(), yL = dir.clone().negate(), zL = K.clone().cross(yL).normalize(); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(K, yL, zL)); }
function chXFingers(bone, k, s) {
  CH_FING.forEach((F, i) => { bone(`f${k}${i}a`, 'wr' + k, 0, -F.yb, F.z).rotation.x = F.sp * DEG; bone(`f${k}${i}b`, `f${k}${i}a`, 0, -F.l[0], 0); bone(`f${k}${i}c`, `f${k}${i}b`, 0, -F.l[1], 0); });
  bone('t' + k + '1', 'wr' + k, -s * 0.006, -0.022, 0.02).quaternion.copy(chXThumb(s)); bone('t' + k + '2', 't' + k + '1', 0, -0.042, 0); bone('t' + k + '3', 't' + k + '2', 0, -0.032, 0);
}
// the skeleton (same bone order as the hero's), in the A-pose bind
function chXSkeleton(P) {
  const root = new THREE.Group(), B = {}, bones = [];
  const bone = (name, parent, x, y, z) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); (parent ? B[parent] : root).add(b); B[name] = b; bones.push(b); return b; };
  bone('hips', null, 0, P.hipY, 0); bone('spine', 'hips', 0, 0.08, 0); bone('chest', 'spine', 0, 0.17, 0); bone('neck', 'chest', 0, 0.225, -0.008); bone('head', 'neck', 0, 0.083, 0.014);
  [['L', 1], ['R', -1]].forEach(([k, s]) => {
    bone('cl' + k, 'chest', s * 0.03, 0.19, -0.01); bone('sh' + k, 'cl' + k, s * P.shW, -0.01, 0); bone('el' + k, 'sh' + k, 0, -P.upA, 0); bone('wr' + k, 'el' + k, 0, -P.foA, 0);
    chXFingers(bone, k, s);
    bone('hip' + k, 'hips', s * P.hipW, -0.07, 0); bone('kn' + k, 'hip' + k, 0, -P.leg, 0); bone('an' + k, 'kn' + k, 0, -P.leg, 0);
    B['sh' + k].rotation.z = s * 30 * DEG; B['hip' + k].rotation.z = s * 3 * DEG;
  });
  root.updateMatrixWorld(true);
  const BI = {}; bones.forEach((b, i) => { BI[b.name] = i; });
  return { root, B, bones, BI };
}
// surface z of an SDF in front of (x, y) (bind space), for laying flat things (ties, aprons) on the cloth
function chXFront(f, x, y, z0 = 0.3) { let z = z0; while (z > -0.2 && f(x, y, z) > 0) z -= 0.003; let lo = z, hi = z + 0.003; for (let i = 0; i < 8; i++) { const m = (lo + hi) / 2; if (f(x, y, m) > 0) hi = m; else lo = m; } return lo; }

// ---------- body: clothes + exposed skin in one skinned sculpt; groups [cloth, skin, pants]; a 'heavy' morph for build
const CH_XBTAG = ['top', 'trim', 'lapel', 'cuffS', 'tie', 'apron', 'skin', 'pants', 'skirt'];
function chXBody(sex, top, bottom, apron, lod) {
  const key = [sex, top, bottom, apron ? 1 : 0, lod].join('|');
  if (CH_XC.body[key]) return CH_XC.body[key];
  const fm = sex === 'f', P = CH_XPROP[sex], S = chXSkeleton(P), W = (bn) => S.B[bn].matrixWorld, T = [];
  const comp = (defs) => defs.map((d) => chPrim(d, W(d.bn)));
  const longSl = top === 'sweater' || top === 'jacket', jacket = top === 'jacket';
  // torso
  T.push({ t: 'cyl', bn: 'chest', c: [0, 0.05, -0.008], rx: fm ? 0.096 : 0.112, rz: fm ? 0.058 : 0.066, hh: 0.134, rr: 0.04, tag: 'top' });
  T.push({ t: 'ell', bn: 'chest', c: [0, 0.15, -0.045], r: [fm ? 0.112 : 0.128, 0.07, 0.07], k: 0.04, tag: 'top' });
  if (fm) [1, -1].forEach((s) => T.push({ t: 'ell', bn: 'chest', c: [s * 0.046, 0.072, 0.05], r: [0.05, 0.048, 0.042], k: 0.035, tag: 'top' }));
  T.push({ t: 'cyl', bn: 'spine', c: [0, -0.03, 0], rx: fm ? 0.118 : 0.136, rz: fm ? 0.078 : 0.087, hh: 0.1, rr: 0.018, k: 0.05, tag: 'top' });
  if (top === 'dress') { /* fitted: the skirt starts at the waist */ }
  else if (jacket) {
    T.push({ t: 'cyl', bn: 'spine', c: [0, -0.15, 0.002], rx: fm ? 0.14 : 0.152, rz: fm ? 0.1 : 0.108, hh: 0.06, rr: 0.01, k: 0.04, tag: 'top' });
    [1, -1].forEach((s) => T.push({ t: 'ell', bn: 'spine', c: [s * 0.075, -0.17, 0.025], r: [0.07, 0.05, 0.08], k: 0.02, tag: 'top', w: { spine: 1, [s > 0 ? 'hipL' : 'hipR']: 0.7 } }));
  } else {
    T.push({ t: 'cyl', bn: 'spine', c: [0, -0.136, 0.002], rx: fm ? 0.138 : 0.153, rz: fm ? 0.1 : 0.11, hh: 0.012, rr: 0.006, k: 0.03, tag: 'trim' });
    [1, -1].forEach((s) => T.push({ t: 'ell', bn: 'spine', c: [s * 0.075, -0.125, 0.025], r: [0.065, 0.03, 0.075], k: 0.02, tag: 'top', w: { spine: 1, [s > 0 ? 'hipL' : 'hipR']: 0.7 } }));
  }
  // neck (skin) + collar
  T.push({ t: 'cone', bn: 'neck', a: [0, -0.05, -0.006], b: [0, 0.12, 0.004], r1: fm ? 0.047 : 0.054, r2: fm ? 0.042 : 0.048, sc: [1, 0.92], k: 0.012, tag: 'skin' });
  T.push({ t: 'ell', bn: 'head', c: [0, 0.035, -0.004], r: [0.044, 0.04, 0.044], k: 0.02, tag: 'skin' });
  // shoulders + sleeves (+ bare arms for short sleeves)
  [1, -1].forEach((s) => {
    const k = s > 0 ? 'L' : 'R', fa = P.foA;
    T.push({ t: 'cone', bn: 'cl' + k, a: [0, 0.016, -0.01], b: [s * (P.shW - 0.03), -0.028, -0.004], r1: 0.044, r2: fm ? 0.044 : 0.05, k: 0.06, tag: 'top', w: { chest: 0.6, ['cl' + k]: 1 } });
    T.push({ t: 'ell', bn: 'sh' + k, c: [-s * 0.008, -0.035, 0], r: fm ? [0.046, 0.05, 0.05] : [0.052, 0.056, 0.056], k: 0.05, tag: 'top', w: { ['sh' + k]: 1, ['cl' + k]: 0.55 } });
    if (longSl) {
      T.push({ t: 'cone', bn: 'sh' + k, a: [0, -0.045, 0], b: [0, -P.upA, 0], r1: fm ? 0.05 : 0.058, r2: fm ? 0.048 : 0.056, k: 0.045, tag: 'top' });
      T.push({ t: 'cone', bn: 'el' + k, a: [0, 0.03, 0], b: [0, -fa + 0.035, 0], r1: fm ? 0.048 : 0.056, r2: fm ? 0.042 : 0.048, k: 0.04, tag: 'top' });
      if (jacket) { T.push({ t: 'cyl', bn: 'el' + k, c: [0, -fa + 0.03, 0], rx: 0.045, rz: 0.047, hh: 0.008, rr: 0.004, k: 0.01, tag: 'top' }); T.push({ t: 'cyl', bn: 'el' + k, c: [0, -fa + 0.016, 0], rx: 0.034, rz: 0.035, hh: 0.009, rr: 0.003, k: 0.004, tag: 'cuffS' }); }
      else T.push({ t: 'cyl', bn: 'el' + k, c: [0, -fa + 0.016, 0], rx: 0.039, rz: 0.041, hh: 0.015, rr: 0.005, k: 0.012, tag: 'trim' });
    } else {
      T.push({ t: 'cone', bn: 'sh' + k, a: [0, -0.04, 0], b: [0, -0.12, 0], r1: fm ? 0.05 : 0.058, r2: fm ? 0.047 : 0.054, k: 0.045, tag: 'top' });
      T.push({ t: 'cone', bn: 'sh' + k, a: [0, -0.08, 0], b: [0, -P.upA, 0], r1: fm ? 0.036 : 0.042, r2: fm ? 0.031 : 0.037, k: 0.012, tag: 'skin' });
      T.push({ t: 'cone', bn: 'el' + k, a: [0, 0.0, 0], b: [0, -fa + 0.012, 0], r1: fm ? 0.031 : 0.037, r2: fm ? 0.022 : 0.026, sc: [1, 0.85], k: 0.02, tag: 'skin' });
    }
  });
  // legs: pants or a skirt over bare legs
  if (bottom === 'skirt') {
    T.push({ t: 'cyl', bn: 'hips', c: [0, 0.03, 0], rx: 0.12, rz: 0.082, hh: 0.03, rr: 0.02, k: 0.03, tag: 'skirt' });
    [1, -1].forEach((s) => {
      const k = s > 0 ? 'L' : 'R';
      T.push({ t: 'cone', bn: 'hips', a: [s * 0.042, 0.0, 0], b: [s * 0.07, -0.31, 0.01], r1: 0.098, r2: 0.122, sc: [1, 0.86], cut: -0.33, k: 0.05, tag: 'skirt', w: { hips: 1, ['hip' + k]: 0.45 }, disp: (x, y, z) => 0.003 * Math.sin(Math.atan2(z, x) * 7) * ss(-0.12, -0.3, y) });
      T.push({ t: 'cone', bn: 'hip' + k, a: [0, -0.12, 0], b: [0, -P.leg, 0], r1: 0.066, r2: 0.05, k: 0.03, tag: 'skin' });
      T.push({ t: 'cone', bn: 'kn' + k, a: [0, 0, 0], b: [0, -P.leg + 0.03, 0], r1: 0.049, r2: 0.032, sc: [1, 1.05], k: 0.03, tag: 'skin', disp: (x, y, z) => -0.012 * chGauss(x * 1.3, y, z, 0, -0.11, -0.025, 0.05) });
    });
  } else {
    T.push({ t: 'ell', bn: 'hips', c: [0, -0.04, -0.004], r: [fm ? 0.142 : 0.134, 0.1, fm ? 0.094 : 0.09], tag: 'pants' });
    [1, -1].forEach((s) => {
      const k = s > 0 ? 'L' : 'R';
      T.push({ t: 'ell', bn: 'hips', c: [s * 0.062, -0.095, -0.036], r: fm ? [0.078, 0.078, 0.068] : [0.072, 0.074, 0.06], k: 0.04, tag: 'pants', w: { hips: 0.7, ['hip' + k]: 1 } });
      T.push({ t: 'cone', bn: 'hip' + k, a: [0, -0.012, 0], b: [0, -P.leg, 0], r1: fm ? 0.082 : 0.08, r2: 0.062, k: 0.05, tag: 'pants' });
      T.push({ t: 'ell', bn: 'kn' + k, c: [0, 0.0, 0.004], r: [0.061, 0.062, 0.061], k: 0.03, tag: 'pants' });
      T.push({ t: 'cone', bn: 'kn' + k, a: [0, 0, 0], b: [0, -P.leg, 0], r1: 0.061, r2: 0.064, cut: -P.leg + 0.017, k: 0.02, tag: 'pants' });
    });
  }
  // flat things on the cloth: tie, apron
  const f0 = chSdfFn(comp(T)), ch = new THREE.Vector3();
  const atFront = (bn, lx, ly, dz = 0.0035) => { ch.set(lx, ly, 0).applyMatrix4(W(bn)); const z = chXFront(f0, ch.x, ch.y); ch.z = z + dz; return ch.clone().applyMatrix4(new THREE.Matrix4().copy(W(bn)).invert()); };
  const tie = jacket ? [atFront('chest', 0, 0.19, 0.003), atFront('chest', 0, 0.0, 0.004)] : null;
  if (apron && false) {   // aprons are painted with a mask now (straight edges at any mesh resolution)
    const a = atFront('chest', 0, 0.14, 0.002), b = atFront('chest', 0, 0.0, 0.003);
    T.push({ t: 'box', bn: 'chest', c: [0, (a.y + b.y) / 2, (a.z + b.z) / 2], rot: [Math.atan2(a.z - b.z, a.y - b.y) * -1, 0, 0], h: [fm ? 0.07 : 0.078, (a.y - b.y) / 2 + 0.01, 0.002], rr: 0.003, k: 0.006, tag: 'apron' });
    const c = atFront('hips', 0, 0.0, 0.004);
    T.push({ t: 'box', bn: 'hips', c: [0, -0.2, c.z + 0.012], rot: [-0.06, 0, 0], h: [0.135, 0.2, 0.002], rr: 0.004, k: 0.012, tag: 'apron', w: { hips: 1, hipL: 0.35, hipR: 0.35 } });
  }
  // two skinned meshes (like the hero's hoodie + jeans): the top (with neck, arms) and the bottom (pants, or skirt + legs)
  const h = lod ? 0.065 : 0.028, botTags = new Set(['pants', 'skirt']), isBot = (d) => botTags.has(d.tag) || (d.tag === 'skin' && /^(hip|kn)/.test(d.bn));
  const iC = new THREE.Matrix4().copy(W('chest')).invert(), iS = new THREE.Matrix4().copy(W('spine')).invert(), iH = new THREE.Matrix4().copy(W('hips')).invert(), iSh = { 1: new THREE.Matrix4().copy(W('shL')).invert(), [-1]: new THREE.Matrix4().copy(W('shR')).invert() }, v = V3(0, 0, 0);
  const part = (defs, bot) => {
    const geo = chSculpt(comp(defs), { h, bones: S.BI, kw: 0.024, ao: [0.014, 0.4], uv: 0.05, keep: CH_XBTAG, col: () => [1, 1, 1] });
    const pos = geo.attributes.position, nor = geo.attributes.normal, n = pos.count, LC = new Float32Array(n * 3), LH = new Float32Array(n * 3), LS = new Float32Array(n * 2), heavy = new Float32Array(n * 3), tg = geo.userData.tagI;
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(iC); LC[i * 3] = v.x; LC[i * 3 + 1] = v.y; LC[i * 3 + 2] = v.z;
      v.fromBufferAttribute(pos, i).applyMatrix4(iH); LH[i * 3] = v.x; LH[i * 3 + 1] = v.y; LH[i * 3 + 2] = v.z;
      v.fromBufferAttribute(pos, i).applyMatrix4(iSh[pos.getX(i) >= 0 ? 1 : -1]); LS[i * 2] = v.y; LS[i * 2 + 1] = Math.hypot(v.x, v.z);
      const sp = V3(0, 0, 0).fromBufferAttribute(pos, i).applyMatrix4(iS), tag = CH_XBTAG[tg[i]], y = pos.getY(i);
      let a = 0.03 * chGauss(sp.x * 0.8, sp.y, sp.z, 0, -0.03, 0.09, 0.08) + 0.014 * ss(0.3, -0.1, sp.y) * ss(-0.2, -0.05, sp.y) + 0.008 * ss(0.15, 0.3, sp.y) * ss(0.5, 0.35, sp.y);
      if (y < P.hipY - 0.05 && y > P.hipY - 0.45) a += 0.012;
      if (tag === 'skin' && y > 1.3) a = 0.008;
      if (Math.abs(pos.getX(i)) > P.shW * 0.9 + 0.03 && y > 0.9) a = 0.009 * ss(0.95, 1.2, y);
      if (bot) a *= 0.8;
      heavy[i * 3] = nor.getX(i) * a; heavy[i * 3 + 1] = nor.getY(i) * a * 0.6; heavy[i * 3 + 2] = nor.getZ(i) * a;
    }
    geo.morphAttributes.position = [new THREE.BufferAttribute(heavy, 3)]; geo.morphTargetsRelative = true; geo.computeBoundingSphere();
    return { geo, LC, LH, LS };
  };
  const topP = part(T.filter((d) => !isBot(d)), false), botP = part(T.filter(isBot), true);
  return (CH_XC.body[key] = { top: topP, bot: botP, P, tie });
}
// ---------- hands: built once per side and lod in a canonical wrist frame; each extra binds them to its own bones
function chXHand(k, lod) {
  const key = k + lod; if (CH_XC.hand[key]) return CH_XC.hand[key];
  const s = k === 'L' ? 1 : -1, root = new THREE.Group(), B = {}, bones = [];
  const bone = (name, parent, x, y, z) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); (parent ? B[parent] : root).add(b); B[name] = b; bones.push(b); return b; };
  bone('wr' + k, null, 0, 0, 0); chXFingers(bone, k, s); root.updateMatrixWorld(true);
  const BI = {}; bones.forEach((b, i) => { BI[b.name] = i; });
  const w = 'wr' + k, H = [];
  H.push({ t: 'cone', bn: w, a: [0, 0.04, 0], b: [0, -0.014, 0], r1: 0.021, r2: 0.023, sc: [0.8, 1.12], tag: 'wrist' });
  H.push({ t: 'ell', bn: w, c: [0, -0.054, 0], r: [0.0155, 0.043, 0.037], k: 0.014, tag: 'palm' });
  H.push({ t: 'ell', bn: w, c: [-s * 0.009, -0.036, 0.022], r: [0.012, 0.026, 0.016], k: 0.012, tag: 'palm', w: { [w]: 1, ['t' + k + '1']: 0.8 } });
  if (lod) {
    H.push({ t: 'box', bn: w, c: [0, -0.115, 0], h: [0.005, 0.035, 0.028], rr: 0.009, k: 0.012, tag: 'finger' });
    H.push({ t: 'cone', bn: 't' + k + '1', a: [0, 0.004, 0], b: [0, -0.07, 0], r1: 0.0135, r2: 0.01, k: 0.012, tag: 'palm' });
  } else {
    H.push({ t: 'ell', bn: w, c: [-s * 0.004, -0.074, 0], r: [0.012, 0.016, 0.036], k: 0.012, tag: 'palm' });
    H.push({ t: 'ell', bn: w, c: [-s * 0.007, -0.052, -0.026], r: [0.0095, 0.03, 0.011], k: 0.01, tag: 'palm' });
    CH_FING.forEach((F, i) => {
      const a = `f${k}${i}a`, b = `f${k}${i}b`, c = `f${k}${i}c`;
      H.push({ t: 'ell', bn: a, c: [s * 0.0045, 0.002, 0], r: [0.0074, 0.009, F.r * 0.95], k: 0.011, tag: 'knuckle' });
      H.push({ t: 'cone', bn: a, a: [0, 0, 0], b: [0, -F.l[0], 0], r1: F.r * 1.02, r2: F.r * 0.97, k: 0.009, tag: 'finger' });
      H.push({ t: 'cone', bn: b, a: [0, 0, 0], b: [0, -F.l[1], 0], r1: F.r * 0.95, r2: F.r * 0.92, k: 0.006, tag: 'finger' });
      H.push({ t: 'cone', bn: c, a: [0, 0, 0], b: [-s * 0.0006, -F.l[2] + F.r * 0.88, 0], r1: F.r * 0.91, r2: F.r * 0.88, k: 0.006, tag: 'tip' });
    });
    H.push({ t: 'cone', bn: 't' + k + '1', a: [0, 0.004, 0], b: [0, -0.042, 0], r1: 0.0135, r2: 0.0118, k: 0.012, tag: 'palm' });
    H.push({ t: 'cone', bn: 't' + k + '2', a: [0, 0, 0], b: [0, -0.032, 0], r1: 0.0114, r2: 0.0106, k: 0.005, tag: 'finger' });
    H.push({ t: 'cone', bn: 't' + k + '3', a: [0, 0, 0], b: [0, -0.017, 0], r1: 0.0105, r2: 0.0092, k: 0.005, tag: 'tip' });
  }
  const geo = chSculpt(H.map((d) => chPrim(d, B[d.bn].matrixWorld)), { h: lod ? 0.018 : 0.0095, bones: BI, kw: 0.009, ao: [0.004, 0.5], keep: ['wrist', 'palm', 'knuckle', 'finger', 'tip'], col: () => [1, 1, 1] });
  geo.computeBoundingSphere();
  return (CH_XC.hand[key] = { geo, names: bones.map((b) => b.name), inv: bones.map((b) => b.matrixWorld.clone().invert()), s });
}
// ---------- shoes (rigid on the ankle): sneaker, dress shoe, flat
function chXShoe(style, lod) {
  const key = style + lod; if (CH_XC.shoe[key]) return CH_XC.shoe[key];
  const I = new THREE.Matrix4(), D = [];
  if (style === 'sneaker') {
    D.push({ t: 'cyl', c: [0, -0.0755, -0.002], rx: 0.044, rz: 0.064, hh: 0.0105, rr: 0.004, tag: 'sole' }, { t: 'cyl', c: [0, -0.0755, 0.14], rot: [0.05, 0, 0], rx: 0.049, rz: 0.088, hh: 0.0105, rr: 0.004, k: 0.05, tag: 'sole' });
    D.push({ t: 'ell', c: [0, -0.032, 0.0], r: [0.045, 0.054, 0.06], tag: 'upper' }, { t: 'ell', c: [0, -0.04, 0.082], r: [0.048, 0.04, 0.085], k: 0.03, tag: 'upper' }, { t: 'ell', c: [0, -0.054, 0.165], r: [0.045, 0.027, 0.062], k: 0.03, tag: 'upper' }, { t: 'tor', c: [0, 0.008, -0.004], rot: [0.18, 0, 0], R: 0.039, r: 0.01, sc: [1, 1.3], k: 0.012, tag: 'accent' });
  } else if (style === 'dress') {
    D.push({ t: 'cyl', c: [0, -0.081, 0.06], rx: 0.042, rz: 0.13, hh: 0.006, rr: 0.003, tag: 'sole' });
    D.push({ t: 'ell', c: [0, -0.04, -0.005], r: [0.041, 0.045, 0.055], tag: 'upper' }, { t: 'ell', c: [0, -0.052, 0.085], r: [0.043, 0.032, 0.088], k: 0.03, tag: 'upper' }, { t: 'ell', c: [0, -0.062, 0.168], r: [0.037, 0.02, 0.055], k: 0.03, tag: 'upper' });
    D.push({ t: 'ell', op: 's', c: [0, 0.0, 0.0], r: [0.034, 0.03, 0.045], k: 0.006 });
  } else {   // flat (women)
    D.push({ t: 'cyl', c: [0, -0.083, 0.065], rx: 0.036, rz: 0.12, hh: 0.005, rr: 0.003, tag: 'sole' });
    D.push({ t: 'ell', c: [0, -0.06, 0.0], r: [0.035, 0.03, 0.05], tag: 'upper' }, { t: 'ell', c: [0, -0.066, 0.1], r: [0.037, 0.024, 0.075], k: 0.025, tag: 'upper' });
    D.push({ t: 'ell', op: 's', c: [0, -0.02, 0.03], r: [0.03, 0.04, 0.07], k: 0.004 });
  }
  const geo = chSculpt(D.map((d) => chPrim(d, I)), { h: lod ? 0.032 : 0.017, ao: [0.006, 0.4], keep: ['upper', 'sole', 'accent'], col: () => [1, 1, 1] });
  geo.computeBoundingSphere();
  return (CH_XC.shoe[key] = { geo });
}
// ---------- heads: four face shapes per sex (jaw, chin, cheeks, nose), the hero's skull, ears and eye sockets; morphs + mouth decal
const CH_XFACE = {
  m: [{ fw: 1, jw: 1, chin: 1, cheek: 1, nose: 'hero' }, { fw: 1.05, jw: 1.14, chin: 1.15, cheek: 0.95, nose: 'broad' }, { fw: 0.95, jw: 0.94, chin: 1.05, cheek: 0.9, nose: 'long' }, { fw: 1.06, jw: 1.02, chin: 0.9, cheek: 1.12, nose: 'button' }],
  f: [{ fw: 0.95, jw: 0.86, chin: 0.78, cheek: 1.08, nose: 'small' }, { fw: 1.0, jw: 0.92, chin: 0.85, cheek: 1.15, nose: 'button' }, { fw: 0.94, jw: 0.88, chin: 0.85, cheek: 1.0, nose: 'straight' }, { fw: 1.02, jw: 0.95, chin: 0.88, cheek: 1.12, nose: 'broad' }],
};
function chXMorphs(geo) {   // the hero's smile L/R, jaw open and frown, as relative morphs from vertex positions
  const hp = geo.attributes.position, nV = hp.count, mk = () => new Float32Array(nV * 3), mSL = mk(), mSR = mk(), mJ = mk(), mF = mk();
  for (let i = 0; i < nV; i++) {
    const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    [[1, mSL], [-1, mSR]].forEach(([s, A]) => {
      const g1 = chGauss(x, y, z, s * 0.022, 0.038, 0.088, 0.011), g2 = chGauss(x, y, z, s * 0.044, 0.06, 0.075, 0.017), g3 = chGauss(x, y, z, s * 0.036, 0.078, 0.08, 0.009);
      A[i * 3] = g1 * s * 0.004 + g2 * s * 0.001; A[i * 3 + 1] = g1 * 0.0045 + g2 * 0.004 + g3 * 0.002; A[i * 3 + 2] = -g1 * 0.002 + g2 * 0.0025 + g3 * 0.001;
    });
    const jm = ss(CH_MOUTH.y, CH_MOUTH.y - 0.018, y) * ss(-0.04, 0.03, z) * (0.6 + 0.4 * ss(0, 0.08, z));
    mJ[i * 3 + 1] = -0.009 * jm; mJ[i * 3 + 2] = -0.002 * jm;
    [1, -1].forEach((s) => { const g = chGauss(x, y, z, s * 0.022, 0.036, 0.088, 0.011); mF[i * 3 + 1] += -0.003 * g; });
    const gc = chGauss(x, y, z, 0, 0.004, 0.075, 0.012); mF[i * 3 + 1] += 0.0018 * gc; mF[i * 3 + 2] += 0.0015 * gc;
  }
  geo.morphAttributes.position = [mSL, mSR, mJ, mF].map((a) => new THREE.BufferAttribute(a, 3)); geo.morphTargetsRelative = true;
}
function chXDecal(headGeo, k = 1.22) {
  const MW = CH_MOUTH.w * k, MH = CH_MOUTH.h * k, hp = headGeo.attributes.position, idx = headGeo.index.array, keep = new Map(), I = [], hn = headGeo.attributes.normal;
  const ok = (v) => Math.abs(hp.getX(v)) < MW / 2 && Math.abs(hp.getY(v) - CH_MOUTH.y) < MH / 2 && hp.getZ(v) > 0.03 && hn.getZ(v) > 0.2;
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2]; if (!ok(a) || !ok(b) || !ok(c)) continue; [a, b, c].forEach((v) => { if (!keep.has(v)) keep.set(v, keep.size); I.push(keep.get(v)); }); }
  const n = keep.size, pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3).fill(1), morph = [0, 1, 2, 3].map(() => new Float32Array(n * 3));
  keep.forEach((j, v) => {
    const nx = hn.getX(v), ny = hn.getY(v), nz = hn.getZ(v);
    pos[j * 3] = hp.getX(v) + nx * 0.0004; pos[j * 3 + 1] = hp.getY(v) + ny * 0.0004; pos[j * 3 + 2] = hp.getZ(v) + nz * 0.0004; nor[j * 3] = nx; nor[j * 3 + 1] = ny; nor[j * 3 + 2] = nz;
    uv[j * 2] = 0.5 + hp.getX(v) / MW; uv[j * 2 + 1] = 0.5 + (hp.getY(v) - CH_MOUTH.y) / MH;
    headGeo.morphAttributes.position.forEach((A, q) => { morph[q][j * 3] = A.getX(v); morph[q][j * 3 + 1] = A.getY(v); morph[q][j * 3 + 2] = A.getZ(v); });
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(I);
  g.morphAttributes.position = morph.map((a) => new THREE.BufferAttribute(a, 3)); g.morphTargetsRelative = true;
  return g;
}
const CH_XHTAG = ['skull', 'face', 'jaw', 'chin', 'muzzle', 'nose', 'cheek', 'ear'];
function chXHead(sex, v, lod) {
  const key = sex + v + '|' + lod; if (CH_XC.head[key]) return CH_XC.head[key];
  const F = CH_XFACE[sex][v], E = CH_EYE, fm = sex === 'f', HD = [
    { t: 'ell', c: [0, 0.125, -0.012], r: [0.093, 0.11, 0.105], tag: 'skull' },
    { t: 'ell', c: [0, 0.078, 0.025], r: [0.069 * F.fw, 0.072, 0.078], k: 0.04, tag: 'face' },
    { t: 'ell', c: [0, 0.03 + (1 - F.jw) * 0.02, 0.034], r: [0.047 * F.jw, 0.047 - (1 - F.jw) * 0.01, 0.058], k: 0.035, tag: 'jaw' },
    { t: 'ell', c: [0, 0.002 + (1 - F.chin) * 0.012, 0.061], r: [0.025 * F.chin, 0.019 * F.chin, 0.02 * Math.sqrt(F.chin)], k: 0.024, tag: 'chin' },
    { t: 'cone', a: [-0.052, 0.124, 0.07], b: [0.052, 0.124, 0.07], r1: fm ? 0.013 : 0.015, r2: fm ? 0.013 : 0.015, k: 0.025, tag: 'face' },
    { t: 'ell', c: [0, 0.037, 0.07], r: [0.031, 0.02, 0.026], k: 0.02, tag: 'muzzle' },
  ];
  const N = { hero: [0.108, 0.087, 0.074, 0.104, 0.0085, 0.0095, 0.067, 0.106, 0.0135, 0.0135, 0.0085], broad: [0.108, 0.087, 0.074, 0.103, 0.0095, 0.0105, 0.066, 0.104, 0.0165, 0.017, 0.0098], long: [0.11, 0.087, 0.068, 0.108, 0.0082, 0.009, 0.061, 0.108, 0.0125, 0.0128, 0.0082],
    button: [0.106, 0.087, 0.077, 0.1, 0.0072, 0.008, 0.07, 0.103, 0.012, 0.0122, 0.0075], small: [0.106, 0.087, 0.076, 0.1, 0.0068, 0.0075, 0.069, 0.103, 0.0105, 0.0112, 0.007], straight: [0.108, 0.087, 0.072, 0.104, 0.0072, 0.008, 0.066, 0.105, 0.011, 0.0118, 0.0072] }[F.nose];
  HD.push({ t: 'cone', a: [0, N[0], N[1]], b: [0, N[2], N[3]], r1: N[4], r2: N[5], k: 0.012, tag: 'nose' });
  HD.push({ t: 'ell', c: [0, N[6], N[7]], r: [N[8], N[8] * 0.9, N[8] * 0.9], k: 0.01, tag: 'nose' });
  [1, -1].forEach((s) => {
    HD.push({ t: 'cone', a: [s * 0.058, 0.065, -0.02], b: [s * 0.03 * F.jw, 0.018 + (1 - F.jw) * 0.02, 0.035], r1: 0.022 * Math.min(1, F.jw), r2: 0.018 * F.jw, k: 0.05, tag: 'jaw' });
    HD.push({ t: 'ell', c: [s * 0.037 * F.fw, 0.071 + (F.cheek - 1) * 0.02, 0.062], r: [0.026 * F.cheek, 0.022 * F.cheek, 0.024], k: 0.04, tag: 'cheek' });
    HD.push({ t: 'ell', c: [s * N[9], N[6] - 0.005, N[7] - 0.009], r: [N[10], N[10] * 0.88, N[10] * 0.94], k: 0.008, tag: 'nose' });
    HD.push({ t: 'ell', c: [s * 0.094, 0.095, -0.012], rot: [0, -s * 0.35, -s * 0.08], r: fm ? [0.01, 0.026, 0.017] : [0.011, 0.029, 0.019], k: 0.012, tag: 'ear' });
  });
  [1, -1].forEach((s) => {
    HD.push({ t: 'ell', op: 's', c: [s * 0.1, 0.092, -0.008], rot: [0, -s * 0.35, 0], r: [0.006, 0.018, 0.012], k: 0.004 });
    HD.push({ t: 'ell', op: 's', c: [s * E.x, E.y, E.z], r: [E.r * 1.06, E.r * 1.06, E.r * 1.06], k: 0.005 });
  });
  const I4 = new THREE.Matrix4(), P = HD.map((d) => chPrim(d, I4));
  const geo = chSculpt(P, { h: lod ? 0.024 : 0.0088, ao: [0.004, 0.18], keep: CH_XHTAG, col: () => [1, 1, 1] });
  chXMorphs(geo); geo.computeBoundingSphere();
  return (CH_XC.head[key] = { geo, f: chSdfFn(P), decal: chXDecal(geo), key });
}
// ---------- hair styles (rigid on the head), sculpted over the face's own SDF; the groove fans from the crown
const CH_XHAIRSTY = { m: ['crop', 'side', 'buzz', 'wavy', 'curly', 'crop', 'side'], f: ['long', 'bob', 'bun', 'pony', 'curly', 'long', 'pixie'] };
function chXHair(style, H, lod) {
  const key = style + '|' + H.key; if (key in CH_XC.hair) return CH_XC.hair[key];
  if (style === 'buzz' || style === 'bald') return (CH_XC.hair[key] = null);
  const hf = H.f, crown = V3(0.2, 0.78, -0.6).normalize(), ce1 = V3(1, 0, 0).sub(crown.clone().multiplyScalar(crown.x)).normalize(), ce2 = crown.clone().cross(ce1), HC = [0, 0.13, -0.016];
  const groove = (amp, n = 6) => (x, y, z) => { const q = V3(x - HC[0], y - HC[1], z - HC[2]).normalize(), th = Math.acos(clamp(q.dot(crown), -1, 1)), ps = Math.atan2(q.dot(ce2), q.dot(ce1)) + 0.06 * Math.sin(th * 5); return amp * (1 - ss(0, 0.6, Math.abs(Math.sin(ps * n)))) * ss(0.25, 0.6, th); };
  const under = (x, y, z) => 0.012 * ss(-0.035, -0.005, z) * ss(0.085, 0.06, y);   // keep the mass well under the skin on the jaw/cheek
  const sides = (x, y) => 0.0045 * ss(0.055, 0.085, Math.abs(x)) * (1 - ss(0.11, 0.16, y));
  const mass = (th, disp) => ({ t: 'fn', bc: [0, 0.125, -0.012], br: 0.15, tag: 'mass', disp, fn: (x, y, z) => hf(x, y, z) - th(x, y, z) });
  const faceCut = (dy = 0, dz = 0) => ({ t: 'ell', op: 's', c: [0, 0.066 + dy, 0.078 + dz], r: [0.088, 0.104, 0.074], k: 0.012, disp: (x, y, z) => 0.0045 * Math.sin(x * 150 + 0.8) * ss(0.08, 0.04, Math.abs(x)) });
  const ears = [1, -1].map((s) => ({ t: 'ell', op: 's', c: [s * 0.098, 0.083, -0.004], r: [0.03, 0.04, 0.036], k: 0.01 }));
  const below = (y) => ({ t: 'box', op: 's', c: [0, y - 0.1, 0], h: [0.3, 0.1, 0.3], rr: 0, k: 0.01 });
  let D = [], locks = 0;
  if (style === 'crop' || style === 'side' || style === 'pixie') {
    D.push(mass((x, y, z) => -0.0025 + 0.0058 * ss(-0.01, 0.04, y) + (style === 'crop' ? 0.006 : 0.009) * ss(0.07, 0.15, y) + 0.003 * ss(0.15, 0.22, y) - sides(x, y) - under(x, y, z), groove(0.0018)));
    D.push({ t: 'ell', c: [0.0, 0.178, 0.012], r: [0.08, 0.055, 0.088], k: 0.04, tag: 'mass' });
    if (style !== 'crop') { D.push({ t: 'ell', c: [-0.02, 0.182, 0.06], rot: [0, 0, 0.25], r: [0.07, 0.04, 0.05], k: 0.035, tag: 'mass' }); locks = 1; }
    D.push(faceCut(), ...ears, below(style === 'pixie' ? -0.02 : -0.012));
  } else if (style === 'wavy') {
    D.push(mass((x, y, z) => 0.002 + 0.006 * ss(-0.0, 0.05, y) + 0.008 * ss(0.08, 0.16, y) - under(x, y, z) * 1.2, (x, y, z) => 0.0028 * Math.sin(y * 110 + x * 50 + z * 30) + groove(0.0015)(x, y, z)));
    D.push(faceCut(0.004), ...ears, below(0.02));
  } else if (style === 'curly') {
    const big = H.key[0] === 'f';
    D.push(mass((x, y, z) => (big ? 0.014 : 0.009) + 0.012 * ss(0.06, 0.17, y) - under(x, y, z) * 1.5 - 0.004 * ss(0.05, 0.09, Math.abs(x)) * (1 - ss(0.1, 0.15, y)),
      (x, y, z) => 0.0042 * Math.sin(x * 140 + 1.3) * Math.sin(y * 150 + 0.4) * Math.sin(z * 140 + 2.1) + 0.002 * Math.sin(x * 260 + y * 230)));
    D.push(faceCut(0.006, -0.004), ...ears, below(big ? -0.03 : 0.02));
  } else if (style === 'long' || style === 'bob') {
    const L = style === 'long';
    D.push(mass((x, y, z) => -0.002 + 0.005 * ss(-0.01, 0.05, y) + 0.007 * ss(0.08, 0.17, y) - under(x, y, z) * 0.5, (x, y, z) => -0.003 * Math.exp(-(x * x) / 0.00003) * ss(0.15, 0.21, y) + 0.0012 * Math.sin(Math.atan2(x, -z) * 22) * ss(0.12, 0.0, y)));
    D.push({ t: 'ell', c: [0, L ? 0.0 : 0.075, -0.055], r: [0.1, L ? 0.17 : 0.1, 0.075], k: 0.03, tag: 'mass', disp: (x, y, z) => 0.0015 * Math.sin(Math.atan2(x, -z) * 20) });
    [1, -1].forEach((s) => D.push({ t: 'cone', a: [s * 0.078, 0.14, 0.02], b: [s * 0.086, L ? -0.07 : 0.03, -0.008], r1: 0.026, r2: L ? 0.032 : 0.028, k: 0.035, tag: 'mass' }));
    if (!L) D.push({ t: 'ell', c: [0.005, 0.178, 0.068], rot: [0, 0, -0.12], r: [0.075, 0.03, 0.032], k: 0.03, tag: 'mass' });
    D.push({ t: 'ell', op: 's', c: [0, 0.04, 0.095], r: [0.066, 0.115, 0.072], k: 0.01 }, faceCut(L ? 0 : 0.012));
    D.push({ t: 'cyl', op: 's', c: [0, (L ? -0.07 : 0.03) - 0.1, 0], rx: 0.3, rz: 0.3, hh: 0.1, k: 0.02 });
  } else if (style === 'bun' || style === 'pony') {
    D.push(mass((x, y, z) => -0.0025 + 0.0045 * ss(-0.01, 0.05, y) + 0.004 * ss(0.09, 0.17, y) - under(x, y, z), groove(0.0014, 9)));
    if (style === 'bun') D.push({ t: 'ell', c: [0, 0.205, -0.088], r: [0.046, 0.042, 0.044], k: 0.014, tag: 'mass', disp: (x, y, z) => 0.0025 * Math.sin(Math.atan2(x, z + 0.088) * 5 + y * 120) });
    else { const pts = [[0, 0.168, -0.104], [0, 0.11, -0.142], [0, 0.02, -0.148], [0, -0.07, -0.128]], rr = [0.024, 0.029, 0.024, 0.01]; for (let i = 0; i < 3; i++) D.push({ t: 'cone', a: pts[i], b: pts[i + 1], r1: rr[i], r2: rr[i + 1], k: 0.016, tag: 'mass', disp: (x, y, z) => 0.0012 * Math.sin(x * 400 + z * 90) }); }
    D.push(faceCut(), ...ears, below(-0.0));
  }
  const I4 = new THREE.Matrix4(), geo = chSculpt(D.map((d) => chPrim(d, I4)), { h: lod ? 0.03 : 0.015, ao: [0.004, 0.45], col: () => [1, 1, 1] });
  // fringe locks for the swept styles (lod 0)
  if (locks && !lod) {
    const mf0 = geo.userData.f, mf = (x, y, z) => Math.min(mf0(x, y, z), hf(x, y, z) - 0.0015), R = RNG('xlocks', style, H.key), L = [];
    const dirOf = (az, el) => V3(Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG));
    const surf = (d, lift) => { let lo = 0, hi = 0.2; for (let it = 0; it < 18; it++) { const m = (lo + hi) / 2; if (mf(HC[0] + d.x * m, HC[1] + d.y * m, HC[2] + d.z * m) < 0) lo = m; else hi = m; } return V3(HC[0], HC[1], HC[2]).addScaledVector(d, lo + lift); };
    const lock = (az0, el0, az1, el1, W, lift, bulge, curl) => { const n = 9, C = [], Nn = [], wb = [], wn = []; for (let k = 0; k < n; k++) { const s = k / (n - 1), e = s * s * (3 - 2 * s) * 0.4 + s * 0.6, d = dirOf(lerp(az0, az1, e) + curl * Math.sin(Math.PI * s), lerp(el0, el1, e)).normalize(); C.push(surf(d, -0.003 + bulge * Math.sin(Math.PI * Math.min(1, s * 1.2)) + lift * s * s)); Nn.push(d); wb.push(W * Math.pow(1 - s, 0.7) * (0.75 + 0.25 * Math.sin(Math.PI * Math.min(1, s * 1.8))) + 0.0003); wn.push(W * 0.34 * Math.pow(1 - s, 0.5) + 0.0003); } L.push(chTube(C, Nn, wb, wn, 6, 0.3)); };
    const dir = style === 'pixie' ? 1 : -1;
    for (let i = 0; i < 6; i++) lock(dir * (-46 + 15 * i) + R.n(3), 44 + R.n(3), dir * (-4 + 15 * i) * -1 + R.n(4), 12 - 0.5 * i + R.n(2), 0.024 + R.r(0, 0.005), 0.005 + 0.0015 * i, 0.007, -8 * dir);
    for (let i = 2; i < 6; i++) lock(170 - 24 * i + R.n(6), 62 + R.n(5), 40 - 14 * i + R.n(5), 44 + R.n(4), 0.025 + R.r(0, 0.005), 0.008, 0.006, 4);
    const lg = chMerge(L.map((g) => chAddColor(g, '#ffffff'))), merged = chMerge([chAddColor(geo, '#ffffff'), lg]);
    merged.computeBoundingSphere();
    return (CH_XC.hair[key] = { geo: merged });
  }
  geo.computeBoundingSphere();
  return (CH_XC.hair[key] = { geo });
}
// ---------- beards (rigid on the head, with the face morphs so they follow the jaw)
function chXBeard(style, H, lod) {
  const key = style + '|' + H.key; if (CH_XC.beard[key] !== undefined) return CH_XC.beard[key];
  if (style === 'none' || style === 'stubble') return (CH_XC.beard[key] = null);
  const hf = H.f;
  const zone = { full: (x, y, z) => ss(0.082, 0.062, y) * ss(-0.03, 0.0, z) * (1 - ss(0.047, 0.04, y) * ss(0.035, 0.02, Math.abs(x)) * ss(0.03, 0.04, y)),
    goatee: (x, y, z) => ss(0.034, 0.024, Math.abs(x)) * ss(0.062, 0.05, y) * ss(0.04, 0.06, z),
    mustache: (x, y, z) => ss(0.03, 0.022, Math.abs(x)) * ss(0.06, 0.054, y) * ss(0.038, 0.044, y) * ss(0.05, 0.07, z) }[style];
  const D = [{ t: 'fn', bc: [0, 0.04, 0.03], br: 0.1, fn: (x, y, z) => hf(x, y, z) - (-0.004 + 0.0095 * zone(x, y, z)), disp: (x, y, z) => 0.0011 * Math.sin(x * 300 + y * 210) },
    { t: 'ell', op: 's', c: [0, CH_MOUTH.y - 0.001, 0.09], r: [0.027, 0.012, 0.03], k: 0.004 }, { t: 'box', op: 's', c: [0, 0.2, 0], h: [0.3, 0.1, 0.3], rr: 0, k: 0.01 }];
  const I4 = new THREE.Matrix4(), geo = chSculpt(D.map((d) => chPrim(d, I4)), { h: lod ? 0.026 : style === 'full' ? 0.012 : 0.0075, ao: [0.003, 0.4], col: () => [1, 1, 1] });
  if (!geo.attributes.position.count) return (CH_XC.beard[key] = null);
  chXMorphs(geo); geo.computeBoundingSphere();
  return (CH_XC.beard[key] = { geo });
}
// ---------- eyes, lids, lashes (shared geometry per lod / sex)
function chXEyeParts(sex, lod) {
  const key = sex + lod; if (CH_XC.eye[key]) return CH_XC.eye[key];
  const E = CH_EYE, rl = E.r * 1.075, sg = lod ? 0.4 : 0.85, fm = sex === 'f';
  const eyeG = new THREE.SphereGeometry(E.r, Math.round(24 * sg), Math.round(16 * sg)); { const p = eyeG.attributes.position, uv = eyeG.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) / (2 * E.r), 0.5 + p.getY(i) / (2 * E.r)); }
  const up = new THREE.SphereGeometry(rl, Math.round(24 * sg), Math.round(8 * sg), 0, TAU, 0, Math.PI / 2), lo = new THREE.SphereGeometry(rl * 0.99, Math.round(24 * sg), Math.round(8 * sg), 0, TAU, Math.PI / 2, Math.PI / 2);
  const lash = [1, -1].map((s) => { const C = [], Nn = [], wb = [], wn = []; for (let i = 0; i <= 18; i++) { const u = i / 18, ph = (-78 + 156 * u) * DEG * s, out = s > 0 ? u : 1 - u, rr = rl * 1.01 + 0.0003, flick = ss(fm ? 0.75 : 0.85, 1, out); C.push(V3(Math.sin(ph) * rr * (1 + (fm ? 0.1 : 0.06) * flick), -0.0004 + (fm ? 0.0035 : 0.0022) * flick, Math.cos(ph) * rr)); Nn.push(V3(0, 1, 0)); const th = (fm ? 1.55 : 1) * (0.0005 + 0.0013 * Math.sin(Math.PI * clamp(out * 1.05)) ** 0.6 * (0.6 + 0.4 * out)); wb.push(th); wn.push(th * 0.9); } return chTube(C, Nn, wb, wn, 5, 1); });
  const glint = [[0.34, 0.42, 0.17], [-0.3, -0.28, 0.08]].map(([gx, gy, sz]) => ({ d: V3(gx, gy, 1).normalize(), g: new THREE.CircleGeometry(E.r * sz, 12) }));
  return (CH_XC.eye[key] = { eyeG, up, lo, lash, glint });
}
function chXIrisMat(i) { const k = 'iris' + i; if (!CH_XC.eye[k]) CH_XC.eye[k] = new THREE.MeshPhysicalMaterial({ map: chTexEye(...CH_XIRIS[i]), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }); return CH_XC.eye[k]; }
function chXMouthTex(lip) {
  if (CH_XC.mouth[lip]) return CH_XC.mouth[lip];
  const mTex = {}, mBold = {}, L = CH_XLIPS[lip] ?? CH_LIP0;
  CH_MOUTHS.forEach((k) => { mTex[k] = chMouthTex(k, L); mBold[k] = g3Tex((x, w, h) => { const src = mTex[k].image, R0 = 9; x.clearRect(0, 0, w, h); for (let a = 0; a < 12; a++) x.drawImage(src, Math.cos(a / 12 * TAU) * R0 * 1.4, Math.sin(a / 12 * TAU) * R0); x.globalCompositeOperation = 'source-in'; x.fillStyle = L.line; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over'; x.drawImage(src, 0, 0); }, 512, 256); });
  return (CH_XC.mouth[lip] = { mTex, mBold });
}

// ---------- the extra
function chExtra(seed, o = {}) {
  const R = RNG('ch-extra', seed), M = chXMats();
  // every random draw happens first (so an override never shifts the others)
  const d = { sex: R.f() < 0.5 ? 'm' : 'f', ageR: R.f(), skin: R.f(), buildR: R.f(), face: R.i(0, 3), hairR: R.f(), hairCR: R.f(), outfitR: R.f(), topR: R.f(), bottomR: R.f(), beardR: R.f(), beardS: R.f(), makeupR: R.f(), lipR: R.f(), glassesR: R.f(), irisR: R.f(), eyeS: R.r(0.93, 1.03), tilt: R.r(-4, 5), browW: R.f(), height: R.f(), headS: R.r(1.03, 1.08), phase: R.r(0, 10), pal: [R.f(), R.f(), R.f(), R.f(), R.f(), R.f()] };
  const sex = o.sex ?? d.sex, fm = sex === 'f', age = o.age ?? (d.ageR < 0.3 ? 'young' : d.ageR < 0.8 ? 'adult' : 'old'), old = age === 'old', lod = o.lod ?? 0;
  const skinV = clamp(o.skin ?? d.skin);
  const build = o.build ?? (d.buildR < 0.3 ? 'slim' : d.buildR < 0.75 ? 'avg' : 'heavy');
  let outfit = o.outfit ?? ['casual', 'casual', 'tee', 'suit', 'jersey', 'casual'][Math.floor(d.outfitR * 6)];
  if (outfit === 'dress' && !fm) outfit = 'casual';
  const top = { casual: d.topR < 0.55 ? 'sweater' : 'tee', tee: 'tee', jersey: 'tee', suit: 'jacket', uniform: 'jacket', apron: 'tee', dress: 'dress' }[outfit] ?? 'sweater';
  const bottom = outfit === 'dress' ? 'skirt' : (o.bottom ?? (fm && (outfit === 'suit' || outfit === 'uniform') && d.bottomR < 0.55 ? 'skirt' : 'pants'));
  const sty = CH_XHAIRSTY[sex], hairStyle = o.hair ?? (old && !fm ? ['bald', 'crop', 'buzz', 'side'][Math.floor(d.hairR * 4)] : old ? ['bun', 'bob', 'curly', 'bob'][Math.floor(d.hairR * 4)] : sty[Math.floor(d.hairR * sty.length)]);
  const darkSkin = skinV > 0.6, hairCol = chXHex(o.hairColor ?? (old ? (d.hairCR < 0.5 ? 'grey' : 'white') : darkSkin ? (d.hairCR < 0.7 ? 'black' : 'dark') : ['dark', 'brown', 'chestnut', 'blonde', 'black', 'auburn', 'ash', 'brown'][Math.floor(d.hairCR * 8)]));
  const beard = fm ? 'none' : (o.beard ?? (d.beardR < (old ? 0.5 : 0.38) ? ['stubble', 'full', 'goatee', 'mustache', 'stubble'][Math.floor(d.beardS * 5)] : 'none'));
  const makeup = fm && (o.makeup ?? d.makeupR < 0.7), lip = makeup ? (o.colors?.lips ?? ['rose', 'nude', 'red', 'berry', 'rose'][Math.floor(d.lipR * 5)]) : 'natural';
  const glasses = o.glasses ?? (d.glassesR < (old ? 0.45 : 0.15));
  const iris = darkSkin ? (d.irisR < 0.7 ? 1 : 0) : Math.floor(d.irisR * CH_XIRIS.length);
  // colours
  const pk = (arr, u) => arr[Math.floor(u * arr.length) % arr.length];
  const C = Object.assign({}, (() => {
    const P = d.pal;
    if (outfit === 'suit') return { top: pk(['#2b2f38', '#3a3f4a', '#4a3b30', '#1f2329', '#55606e', '#2e3b52'], P[0]), shirt: pk(['#f2efe8', '#d6e4f0', '#f4ece0'], P[1]), tie: pk(['#8a2a2a', '#2a4a7a', '#3a3a3a', '#7a6a2a', '#4a2a5a'], P[2]), bottom: null, shoe: pk(['#1d1714', '#3b2518'], P[3]) };
    if (outfit === 'uniform') return { top: '#25324a', shirt: '#f2efe8', tie: '#8a2030', bottom: null, shoe: '#151312' };
    if (outfit === 'jersey') { const t = pk([['#c8102e', '#ffffff'], ['#1d428a', '#ffffff'], ['#f6c900', '#1b5e20'], ['#6cace4', '#ffffff'], ['#1b1b1b', '#e8e8e8'], ['#e85a1c', '#1b1b1b']], P[0]); return { top: t[0], top2: t[1], bottom: pk(['#3a5272', '#2a2f38', '#4a5a6a'], P[1]), shoe: pk(['#f4f2ed', '#2a2a2a', '#c8102e'], P[2]) }; }
    if (outfit === 'apron') return { top: pk(['#f2efe8', '#1f1f22', '#7a8a96'], P[0]), apron: pk(['#3d2b22', '#2f4a3a', '#7a1f2b', '#2b3a52'], P[1]), bottom: pk(['#2a2f38', '#3a5272', '#1f1f22'], P[2]), shoe: '#1f1b18' };
    if (outfit === 'dress') return { top: pk(['#b03a48', '#2f5d8a', '#e0a03a', '#3a7a5a', '#6a3a7a', '#d8c8b8', '#c86a5a'], P[0]), shoe: pk(['#1f1b18', '#8a3a2a', '#d8c8b8'], P[1]) };
    return { top: pk(['#c9583e', '#3b6e8f', '#e0c46c', '#7a8f5c', '#8a5a8c', '#d9d2c4', '#2f3a4a', '#b8743a', '#5d8a86', '#a33b4a', '#e8e4dc', '#44546a'], P[0]), top2: null, bottom: pk(['#3a5272', '#2f4560', '#c2a77c', '#5b5f4a', '#2f3540', '#6a6a6a', '#3a5272'], P[1]), shoe: pk(['#f4f2ed', '#f4f2ed', '#2a2a2a', '#8a6a4a', '#3a5272'], P[2]) };
  })(), o.colors ?? {});
  C.top2 = C.top2 ?? null; C.bottom = C.bottom ?? (bottom === 'skirt' ? C.top : C.top); if ((outfit === 'suit' || outfit === 'uniform') && !o.colors?.bottom) C.bottom = C.top;
  const jeans = bottom === 'pants' && /^#(3a5272|2f4560|4a5a6a)$/i.test(C.bottom);
  // skin tones
  const tone = (() => { const u = skinV * (CH_XSKIN.length - 1), i = Math.min(CH_XSKIN.length - 2, Math.floor(u)); return chMix(chL(CH_XSKIN[i]), chL(CH_XSKIN[i + 1]), u - i); })();
  const blush = [tone[0] * 1.06, tone[1] * 0.74, tone[2] * 0.7], cHair = chL(hairCol), cHi = chMix(cHair, [0.9, 0.75, 0.6], 0.35);
  // ---- rig
  const P = CH_XPROP[sex], S = chXSkeleton(P), B = S.B, root = S.root;
  const body = chXBody(sex, top, bottom, false, lod);
  const cTop = chL(C.top), cTop2 = chL(C.top2 ?? C.top), cTrim = chMul(cTop, 0.86), cBot = chL(C.bottom), cBotL = chMix(cBot, [0.55, 0.62, 0.72], 0.35), cShirt = chL(C.shirt ?? '#f2efe8'), cTie = chL(C.tie ?? '#8a2a2a'), cApron = chL(C.apron ?? '#3d2b22'), cSk = chMix(tone, blush, 0.12);
  // colours: A, B where mask > 0 (shirt V, jersey sleeves, apron), C = skin where mask2 > 0 (neck, bare arms, legs under a skirt);
  // the shader thresholds the interpolated masks, so the edges stay straight at any mesh resolution
  const colour = (Pp, bot) => chXInst(Pp.geo, (i, out, outB) => {
    const tag = CH_XBTAG[Pp.geo.userData.tagI[i]], x = Pp.LC[i * 3], y = Pp.LC[i * 3 + 1], z = Pp.LC[i * 3 + 2], hx = Pp.LH[i * 3], hy = Pp.LH[i * 3 + 1], hz = Pp.LH[i * 3 + 2], sy = Pp.LS[i * 2], sr = Pp.LS[i * 2 + 1];
    let c = bot ? cBot : cTop, cb = null, m = -1, m2 = -1;
    if (bot) { if (jeans && tag === 'pants') c = chMix(cBot, cBotL, 0.45 * ss(-0.05, -0.25, hy) * ss(-0.55, -0.3, hy)); if (bottom === 'skirt') m2 = -0.336 - hy; }
    else {
      if (top === 'jacket') { cb = cShirt; m = Math.min(0.072 * (y - 0.02) / 0.2 - Math.abs(x), z - 0.03); }
      if (outfit === 'jersey') { cb = cTop2; m = Math.abs(x) - 0.172; }
      if (outfit === 'apron') { cb = cApron; m = Math.min(0.085 - Math.abs(x), 0.15 - y, z - 0.02); }
      m2 = Math.min(y - 0.19, 0.064 - Math.hypot(x, z + 0.006));
      if (top !== 'jacket' && top !== 'sweater') m2 = Math.max(m2, Math.min(-0.128 - sy, 0.07 - sr));
    }
    const a = Pp.geo.userData.ao[i]; cb = cb ?? c; out[0] = c[0] * a; out[1] = c[1] * a; out[2] = c[2] * a; outB[0] = cb[0] * a; outB[1] = cb[1] * a; outB[2] = cb[2] * a; outB[3] = m; outB[4] = cSk[0] * a; outB[5] = cSk[1] * a; outB[6] = cSk[2] * a; outB[7] = m2;
  }, true);
  const skel = new THREE.Skeleton(S.bones), meshes = [];
  const skinned = (geo, mats) => { const m = new THREE.SkinnedMesh(geo, mats); root.add(m); m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; return m; };
  const bodyMesh = skinned(colour(body.top, false), M.cloth); bodyMesh.bind(skel, new THREE.Matrix4());
  const botMesh = skinned(colour(body.bot, true), M.pants); botMesh.bind(skel, new THREE.Matrix4()); botMesh.receiveShadow = false;
  botMesh.morphTargetInfluences[0] = { slim: -0.7, avg: 0, heavy: 1 }[build] ?? 0;
  bodyMesh.morphTargetInfluences[0] = { slim: -0.7, avg: 0, heavy: 1 }[build] ?? 0;
  // hands (canonical, bound to this extra's hand bones)
  ['L', 'R'].forEach((k) => {
    const Hc = chXHand(k, lod), tgH = Hc.geo.userData.tagI, aoH = Hc.geo.userData.ao, nr = Hc.geo.attributes.normal, nail = makeup ? chL(pk(['#c23a4a', '#e8b0a0', '#8a2a4a'], d.pal[4])) : chMix(tone, [0.95, 0.75, 0.7], 0.45);
    const g = chXInst(Hc.geo, (i, out) => { const t = tgH[i]; let c = t === 4 ? chMix(tone, blush, 0.35) : t === 2 ? chMix(tone, blush, 0.25) : t >= 1 ? chMix(tone, blush, 0.12) : tone; if (t === 4 && nr.getX(i) * Hc.s > 0.55 && !lod) c = nail; const a = aoH[i]; out[0] = c[0] * a; out[1] = c[1] * a; out[2] = c[2] * a; });
    const m = skinned(g, M.skin); m.bind(new THREE.Skeleton(Hc.names.map((n) => B[n]), Hc.inv), new THREE.Matrix4());
  });
  // shoes
  const shoeStyle = outfit === 'suit' || outfit === 'uniform' ? (fm && bottom === 'skirt' ? 'flat' : 'dress') : outfit === 'dress' ? 'flat' : 'sneaker';
  const SH = chXShoe(shoeStyle, lod), cShoe = chL(C.shoe ?? '#f4f2ed'), cSole = shoeStyle === 'sneaker' ? chL('#ece6da') : chMul(cShoe, 0.6), cAcc = chL(C.top2 ?? (shoeStyle === 'sneaker' ? pk(['#2f8a5f', '#c8102e', '#1d428a', '#e0c46c'], d.pal[5]) : C.shoe ?? '#1d1714'));
  ['L', 'R'].forEach((k) => { const tgS = SH.geo.userData.tagI, aoS = SH.geo.userData.ao, g = chXInst(SH.geo, (i, out) => { const c = tgS[i] === 1 ? cSole : tgS[i] === 2 ? cAcc : cShoe, a = aoS[i]; out[0] = c[0] * a; out[1] = c[1] * a; out[2] = c[2] * a; }); const m = new THREE.Mesh(g, M.shoe); m.castShadow = m.receiveShadow = true; B['an' + k].add(m); });
  // apron skirt: a curved panel hanging from the waist (rigid on the hips, in front of the thighs)
  if (outfit === 'apron') {
    const g = new THREE.PlaneGeometry(0.3, 0.46, 12, 8), pp = g.attributes.position;
    for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i); pp.setXYZ(i, x * (1 + 0.12 * (0.23 - y)), y - 0.2, 0.118 - 9 * x * x * 0.12 + 0.03 * (0.23 - y) * (0.23 - y)); }
    g.computeVertexNormals(); chAddColor(g, C.apron ?? '#3d2b22');
    const am = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide })); am.castShadow = am.receiveShadow = true; B.hips.add(am);
  }
  // tie and shirt collar points (small rigid meshes on the chest, laid on the cloth)
  if (body.tie) {
    const [ta, tb] = body.tie, len = ta.distanceTo(tb), sh = new THREE.Shape();
    sh.moveTo(-0.008, 0); sh.lineTo(0.008, 0); sh.lineTo(0.019, -len + 0.02); sh.lineTo(0, -len); sh.lineTo(-0.019, -len + 0.02); sh.closePath();
    const parts = [];
    if (!fm || outfit === 'uniform') { const g = new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0012, bevelSegments: 1, curveSegments: 2 }); chAddColor(g, C.tie ?? '#8a2a2a'); parts.push(g); const kn = new THREE.SphereGeometry(1, 8, 6); kn.scale(0.011, 0.01, 0.006); kn.translate(0, 0.002, 0.003); chAddColor(kn, C.tie ?? '#8a2a2a'); parts.push(kn); }
    [1, -1].forEach((s2) => { const cs = new THREE.Shape(); cs.moveTo(0, 0.01); cs.lineTo(s2 * 0.034, 0.02); cs.lineTo(s2 * 0.012, -0.03); cs.closePath(); const g = new THREE.ExtrudeGeometry(cs, { depth: 0.002, bevelEnabled: false }); g.translate(0, -0.005, -0.004); chAddColor(g, C.shirt ?? '#f2efe8'); parts.push(g); });
    const tg2 = chMerge(parts.map((g) => g.toNonIndexed ? (g.index ? g : (() => { g.setIndex([...Array(g.attributes.position.count).keys()]); return g; })()) : g));
    const tm = new THREE.Mesh(tg2, M.shoe); tm.position.copy(ta); tm.rotation.x = Math.atan2(ta.z - tb.z, ta.y - tb.y) * -1 + 0; tm.castShadow = true; B.chest.add(tm);
  }
  // head
  const H = chXHead(sex, o.face ?? d.face, lod), hp = H.geo.attributes.position, hn = H.geo.attributes.normal, htg = H.geo.userData.tagI, hao = H.geo.userData.ao;
  const fadeA = { crop: 0.9, side: 0.9, pixie: 0.75, buzz: 0.95, wavy: 0.5, curly: 0.6, bun: 0.5, pony: 0.5, long: 0, bob: 0, bald: 0 }[hairStyle] ?? 0.6;
  const stub = beard !== 'none' ? (beard === 'stubble' ? 0.38 : 0.2) : (!fm && !old && d.beardS < 0.3 ? 0.12 : 0), cShadow = chL(pk(['#8a5a6a', '#6a5a7a', '#9a6a4a', '#5a6a7a'], d.pal[3]));
  const headGeo = chXInst(H.geo, (i, out) => {
    const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i), ny = hn.getY(i), tag = CH_XHTAG[htg[i]];
    let c = tone, bl = 0;
    [1, -1].forEach((s) => { bl += (makeup ? 0.3 : 0.17) * chGauss(x, y, z, s * 0.044, 0.066, 0.078, 0.014); });
    bl += 0.28 * chGauss(x, y, z, 0, 0.068, 0.115, 0.01);
    const ex = (Math.abs(x) - 0.094) / 0.017, ey = (y - 0.095) / 0.033, ez = (z + 0.012) / 0.025, ear = 1 - ss(1.0, 1.4, Math.sqrt(ex * ex + ey * ey + ez * ez));
    bl += 0.3 * ear;
    const fx = x / 0.088, fy = (y - 0.066) / 0.104, fz = (z - 0.078) / 0.074, face = Math.sqrt(fx * fx + fy * fy + fz * fz);
    let fade = (1 - ear) * ss(-0.03, 0.004, y) * ss(0.97, 1.12, face) * ss(0.03, 0.0, z) * (1 - ss(-0.035, -0.005, z) * ss(0.085, 0.065, y));
    if (hairStyle === 'bald') fade *= (old ? 0.55 : 0.3) * ss(0.16, 0.11, y);
    else fade *= fadeA;
    c = chMul(c, 1 - 0.3 * ss(-0.2, -0.7, ny) * ss(0.064, 0.056, y) * ss(0.03, 0.012, Math.abs(x)) * ss(0.08, 0.095, z));
    c = chMix(c, blush, clamp(bl));
    if (makeup) [1, -1].forEach((s) => { c = chMix(c, cShadow, 0.45 * chGauss(x * 1.2, y, z, s * 0.045, 0.108, 0.09, 0.009)); });
    if (old) {   // wrinkles: forehead lines, nasolabial folds, under-eye
      const fl = Math.max(0, Math.sin((y - 0.14) * 760)) ** 3 * ss(0.135, 0.148, y) * ss(0.19, 0.175, y) * ss(0.04, 0.07, z), nl = [1, -1].reduce((a, s) => a + Math.exp(-((Math.abs(x) - (0.02 + (0.06 - y) * 0.45)) ** 2) / 0.000006) * ss(0.072, 0.064, y) * ss(0.026, 0.036, y) * (x * s > 0 ? 1 : 0), 0) * ss(0.06, 0.08, z);
      const eb = [1, -1].reduce((a, s) => a + chGauss(x, y, z, s * 0.038, 0.079, 0.085, 0.007), 0);
      c = chMul(c, 1 - 0.1 * fl - 0.18 * clamp(nl) - 0.1 * eb);
    }
    if (stub) { const bz = ss(0.082, 0.062, y) * ss(-0.03, 0.0, z) * (1 - ss(0.047, 0.04, y) * ss(0.035, 0.02, Math.abs(x)) * ss(0.03, 0.04, y)); c = chMix(c, cHair, stub * bz); }
    c = chMix(c, chMul(cHair, 0.9), fade);
    const a = hao[i]; out[0] = c[0] * a; out[1] = c[1] * a; out[2] = c[2] * a;
  });
  const headMesh = new THREE.Mesh(headGeo, M.skin); headMesh.castShadow = headMesh.receiveShadow = true; B.head.add(headMesh);
  const hairShade = (ny, nz, s) => { const band = Math.exp(-(((ny * 0.85 + nz * 0.3) - 0.66) ** 2) / 0.018); return chMix(chMul(cHair, 0.62 + 0.38 * s), cHi, band * 0.45 * (0.4 + 0.6 * s)); };
  const HR = chXHair(hairStyle, H, lod);
  if (HR) { const n2 = HR.geo.attributes.normal, ao2 = HR.geo.userData.ao; const g = chXInst(HR.geo, (i, out) => { const c = hairShade(n2.getY(i), n2.getZ(i), 1); out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; }); const m = new THREE.Mesh(g, M.hair); m.castShadow = true; m.receiveShadow = false; B.head.add(m); }
  const BR = chXBeard(beard, H, lod); let beardMesh = null;
  if (BR) { const n2 = BR.geo.attributes.normal; const g = chXInst(BR.geo, (i, out) => { const c = chMul(hairShade(n2.getY(i), n2.getZ(i), 0.8), 0.9); out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; }); beardMesh = new THREE.Mesh(g, M.hair); beardMesh.castShadow = true; B.head.add(beardMesh); }
  // mouth
  const MT = chXMouthTex(lip), mouth = [0, 1].map((q) => {
    const mat = chXSSS(new THREE.MeshPhysicalMaterial({ map: MT.mTex.neutral, transparent: true, depthWrite: false, roughness: makeup ? 0.3 : 0.42, vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2 - q, polygonOffsetUnits: -2 - q }));
    const U = { boldMap: { value: MT.mBold.neutral }, boldMix: { value: 0 } }, prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (sh) => { prev(sh); Object.assign(sh.uniforms, U); sh.fragmentShader = 'uniform sampler2D boldMap;\nuniform float boldMix;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\n\tdiffuseColor *= mix( texture2D( map, vUv ), texture2D( boldMap, vUv ), boldMix );\n#endif'); };
    mat.customProgramCacheKey = () => 'ch-sss-mouth';
    const m = new THREE.Mesh(H.decal, mat); m.renderOrder = 2 + q; B.head.add(m); m.receiveShadow = true;
    m.onBeforeRender = (r, sc, cam) => { const k = m.userData.k; if (!k) return; const dd = cam.position.distanceTo(m.getWorldPosition(V3(0, 0, 0))), ppc = r.domElement.height / (2 * dd * Math.tan(cam.fov * DEG / 2)) / 100; mat.map = MT.mTex[k]; U.boldMap.value = MT.mBold[k]; U.boldMix.value = ss(20, 10, ppc); /* extras' mouths go bold earlier */ };
    return m;
  });
  // eyes
  const EP = chXEyeParts(sex, lod), irisMat = chXIrisMat(iris), lidC = chMul(chMix(tone, blush, makeup ? 0.15 : 0.3), 0.96), lidMat = chXSSS(new THREE.MeshPhysicalMaterial({ color: new THREE.Color(...(makeup ? chMix(lidC, cShadow, 0.35) : lidC)), roughness: 0.5, sheen: 0.3, sheenColor: lin('#ffb59a') })), loMat = chXSSS(new THREE.MeshPhysicalMaterial({ color: new THREE.Color(...lidC), roughness: 0.5 }));
  const eyes = [], lids = [], brows = [], E = CH_EYE;
  [1, -1].forEach((s, si) => {
    const eg = new THREE.Group(); eg.position.set(s * E.x, E.y, E.z); eg.rotation.z = s * d.tilt * DEG; eg.scale.setScalar(d.eyeS); B.head.add(eg);
    const look = new THREE.Group(); eg.add(look); look.add(new THREE.Mesh(EP.eyeG, irisMat));
    EP.glint.forEach(({ d: dv, g }) => { const m = new THREE.Mesh(g, M.glint); m.position.copy(dv.clone().multiplyScalar(E.r * 1.012)); m.lookAt(dv.clone().multiplyScalar(2)); eg.add(m); });
    const up = new THREE.Group(); eg.add(up); up.add(new THREE.Mesh(EP.up, lidMat)); up.add(new THREE.Mesh(EP.lash[si], M.lash));
    const lo = new THREE.Group(); eg.add(lo); lo.add(new THREE.Mesh(EP.lo, loMat));
    eyes.push({ g: eg, look, s }); lids.push({ up, lo, s });
    const bm = new THREE.Mesh(new THREE.BufferGeometry(), M.hair); B.head.add(bm); brows.push({ m: bm, s });
  });
  if (glasses) {
    const key = 'glasses'; if (!CH_XC.eye[key]) { const parts = []; [1, -1].forEach((s) => { const r = new THREE.TorusGeometry(0.021, 0.0017, 6, 28); r.scale(1, 0.82, 1); r.translate(s * 0.0385, 0.097, 0.103); parts.push(r); const tm = new THREE.CylinderGeometry(0.0013, 0.0013, 0.1, 5); tm.rotateX(Math.PI / 2); tm.translate(s * 0.06, 0.1, 0.055); parts.push(tm); }); const br = new THREE.CylinderGeometry(0.0013, 0.0013, 0.016, 5); br.rotateZ(Math.PI / 2); br.translate(0, 0.1, 0.106); parts.push(br); CH_XC.eye[key] = chMerge(parts.map((g) => chAddColor(g.index ? g : g, '#ffffff'))); }
    const gm = new THREE.Mesh(CH_XC.eye[key], M.frame); gm.castShadow = true; B.head.add(gm);
  }
  // after binding: head and hand scale, height
  B.head.scale.setScalar(d.headS); const hs = fm ? 0.94 : 1.03; B.wrL.scale.setScalar(hs); B.wrR.scale.setScalar(hs);
  const height = o.height ?? ((fm ? lerp(0.93, 1.0, d.height) : lerp(0.97, 1.06, d.height)) - (old ? 0.02 : 0)); root.scale.setScalar(height);
  const arms = {}, legs = {};
  [['L', 1], ['R', -1]].forEach(([k, s]) => {
    const grip = new THREE.Group(); grip.position.set(-s * 0.03, -0.075, 0.01); B['wr' + k].add(grip);
    arms[k] = { cl: B['cl' + k], sh: B['sh' + k], el: B['el' + k], wr: B['wr' + k], hand: B['wr' + k], grip, fingers: CH_FING.map((F, i) => [B[`f${k}${i}a`], B[`f${k}${i}b`], B[`f${k}${i}c`]]), th: [B['t' + k + '1'], B['t' + k + '2'], B['t' + k + '3']], thQ: chXThumb(s), s };
    legs[k] = { hp: B['hip' + k], kn: B['kn' + k], an: B['an' + k] };
  });
  const rig = { root, B, bones: S.bones, skel, hips: B.hips, spine: B.spine, chest: B.chest, neck: B.neck, head: B.head, arms, legs, eyes, lids, brows, mouth, mTex: MT.mTex, mBold: MT.mBold, headMesh, headF: H.f,
    browW: (fm ? 0.72 : 1.0) + d.browW * (fm ? 0.15 : 0.35), browCol: '#' + new THREE.Color(...chMul(cHair, old ? 1 : 0.85)).getHexString(), browSeg: lod ? 5 : 8, browCache: {}, wid: 'x' + sex + root.scale.x.toFixed(3), blinkOff: d.phase * 0.137 };
  const X = { root, rig, o: { sex, age, skin: skinV, build, outfit, top, bottom, hair: hairStyle, hairColor: hairCol, beard, makeup, lip, glasses, face: o.face ?? d.face, lod },
    pose(po = {}) {
      const add = Object.assign({}, po.add ?? {});
      if (old) { const h = (j, v) => { add[j] = [(add[j]?.[0] ?? 0) + v[0], (add[j]?.[1] ?? 0) + v[1], (add[j]?.[2] ?? 0) + v[2]]; }; h('spine', [5, 0, 0]); h('chest', [4, 0, 0]); h('neck', [6, 0, 0]); h('head', [-8, 0, 0]); }
      chPoseRig(rig, Object.assign({}, po, { add, t: (po.t ?? TT) + d.phase }));
      if (beardMesh) for (let i = 0; i < 4; i++) beardMesh.morphTargetInfluences[i] = headMesh.morphTargetInfluences[i];
      return X;
    } };
  X.pose({ pose: 'stand' });
  return X;
}
