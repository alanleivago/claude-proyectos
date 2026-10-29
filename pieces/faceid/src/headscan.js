// =====================================================================
//  HEAD SCAN — "Infinite, 3D Head Scan" by Lee Perry-Smith (CC BY 3.0, via the three.js examples), the same head the
//  reference uses. Its geometry is packed losslessly into assets/head-geo.png (RGB bytes: a 'HEAD' header, u16 indices,
//  f32 positions, normals, uvs) and decoded here; assets/head-col.jpg and head-nrm.jpg are its colour and normal maps.
//  The 17.7k-triangle scan is densified ×9 with Phong tessellation so the projected dots and the grid land on a smooth
//  surface. Same API as the sculpted head: buildHead3D() -> { group, face, hair, eyes, geo }.
// =====================================================================
const HS_SCALE = 0.046, HS_CY = 1.64, HS_CZ = 0.1, HS_TESS = 3, HS_ALPHA = 0.75;
function HS_decode() {
  const img = asset('head-geo.png'), c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0); const px = x.getImageData(0, 0, c.width, c.height).data;
  const bytes = new Uint8Array((px.length / 4) * 3); for (let i = 0, k = 0; i < px.length; i += 4) { bytes[k++] = px[i]; bytes[k++] = px[i + 1]; bytes[k++] = px[i + 2]; }
  const dv = new DataView(bytes.buffer), nIdx = dv.getUint32(4, true), nV = dv.getUint32(8, true); let o = 16;
  const idx = new Uint16Array(bytes.buffer.slice(o, o + nIdx * 2)); o += nIdx * 2;
  const P = new Float32Array(bytes.buffer.slice(o, o + nV * 12)); o += nV * 12;
  const N = new Float32Array(bytes.buffer.slice(o, o + nV * 12)); o += nV * 12;
  const T = new Float32Array(bytes.buffer.slice(o, o + nV * 8));
  return { idx, P, N, T, nV };
}
function buildHead3D() {
  const { idx, P, N, T } = HS_decode(), s = HS_SCALE, n = HS_TESS, nt = idx.length / 3, per = n * n;
  const pos = new Float32Array(nt * per * 9), nrm = new Float32Array(nt * per * 9), uv = new Float32Array(nt * per * 6);
  const pa = new THREE.Vector3(), pb = new THREE.Vector3(), pc = new THREE.Vector3(), na = new THREE.Vector3(), nb = new THREE.Vector3(), nc = new THREE.Vector3(), q = new THREE.Vector3(), r = new THREE.Vector3(), nn = new THREE.Vector3();
  const proj = (p, v, nv) => p.clone().sub(nv.clone().multiplyScalar(p.clone().sub(v).dot(nv)));
  let w = 0, t2 = 0;
  for (let t = 0; t < nt; t++) {
    const A = idx[t * 3], B = idx[t * 3 + 1], C = idx[t * 3 + 2];
    pa.set(P[A * 3], P[A * 3 + 1], P[A * 3 + 2]).multiplyScalar(s); pb.set(P[B * 3], P[B * 3 + 1], P[B * 3 + 2]).multiplyScalar(s); pc.set(P[C * 3], P[C * 3 + 1], P[C * 3 + 2]).multiplyScalar(s);
    na.set(N[A * 3], N[A * 3 + 1], N[A * 3 + 2]); nb.set(N[B * 3], N[B * 3 + 1], N[B * 3 + 2]); nc.set(N[C * 3], N[C * 3 + 1], N[C * 3 + 2]);
    const vert = (i, j) => { const b = j / n, c = (n - i - j) / n, a = i / n; // weights for A, B, C (i along A, j along B)
      q.set(0, 0, 0).addScaledVector(pa, a).addScaledVector(pb, b).addScaledVector(pc, c);
      r.set(0, 0, 0).addScaledVector(proj(q, pa, na), a).addScaledVector(proj(q, pb, nb), b).addScaledVector(proj(q, pc, nc), c);
      const p = q.clone().lerp(r, HS_ALPHA); nn.set(0, 0, 0).addScaledVector(na, a).addScaledVector(nb, b).addScaledVector(nc, c).normalize();
      return [p.x, p.y, p.z, nn.x, nn.y, nn.z, T[A * 2] * a + T[B * 2] * b + T[C * 2] * c, T[A * 2 + 1] * a + T[B * 2 + 1] * b + T[C * 2 + 1] * c]; };
    const emit = (v) => { pos[w] = v[0]; pos[w + 1] = v[1]; pos[w + 2] = v[2]; nrm[w] = v[3]; nrm[w + 1] = v[4]; nrm[w + 2] = v[5]; w += 3; uv[t2++] = v[6]; uv[t2++] = v[7]; };
    for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) {
      emit(vert(i, j)); emit(vert(i + 1, j)); emit(vert(i, j + 1));
      if (i + j < n - 1) { emit(vert(i + 1, j)); emit(vert(i + 1, j + 1)); emit(vert(i, j + 1)); }
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, w), 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nrm.subarray(0, w), 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv.subarray(0, t2), 2));
  geo.translate(0, -HS_CY * s, -HS_CZ * s);   // the head (not the bust) centred at the origin, nose tip at z ≈ 0.115
  // a front-of-face parameter for the grid lines (u left→right, v chin→brow), like the sculpted head's uv
  geo.computeBoundingBox(); const bb = geo.boundingBox, gp = geo.attributes.position, guv = new Float32Array(gp.count * 2);
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), y = gp.getY(i), z = gp.getZ(i); guv[i * 2] = 0.5 + Math.atan2(x, z + 0.03) / 2.4; guv[i * 2 + 1] = (y + 0.11) / 0.2; }
  geo.setAttribute('guv', new THREE.BufferAttribute(guv, 2));
  const col = new THREE.Texture(asset('head-col.jpg')); col.encoding = THREE.sRGBEncoding; col.flipY = false; col.anisotropy = 8; col.needsUpdate = true;
  const nm = new THREE.Texture(asset('head-nrm.jpg')); nm.flipY = false; nm.anisotropy = 8; nm.needsUpdate = true;
  const face = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: col, normalMap: nm, normalScale: new THREE.Vector2(1, 1), color: lin('#b4b0ac'), roughness: 0.62 }));
  face.castShadow = face.receiveShadow = true;
  const group = new THREE.Group(); group.name = 'headscan'; group.add(face);
  const hair = new THREE.Group(), eyes = new THREE.Group(); group.add(hair, eyes);
  return { group, face, hair, eyes, geo };
}
