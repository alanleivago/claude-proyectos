// SKY — the cloud deck you climb through (soft fbm cumulus sprites) over the land far below
function cloudTex(seed) { const T_ = g3Tex((x, w) => { const R = RNG('cloud' + seed), im = x.createImageData(w, w), o1 = R.r(0, 50), o2 = R.r(0, 50);
  const hs = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7 + o1 * 17.3) * 43758.5453; return v - Math.floor(v); }, vn = (px, py) => { const i = Math.floor(px), j = Math.floor(py), fx = px - i, fy = py - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hs(i, j), hs(i + 1, j), u), lerp(hs(i, j + 1), hs(i + 1, j + 1), u), v); };
  const fbm = (px, py) => { let a = 0, m = 0.5, f = 1; for (let k = 0; k < 6; k++) { a += m * vn(px * f + o2, py * f); m *= 0.5; f *= 2.03; } return a; };
  const bumps = []; for (let k = 0; k < 7; k++) bumps.push([R.r(0.18, 0.82), R.r(0.1, 0.24)]);
  for (let py = 0; py < w; py++) for (let px = 0; px < w; px++) { const u = px / w, v = py / w; let top = 0.62; bumps.forEach(([c, r]) => (top = Math.min(top, 0.62 - Math.sqrt(Math.max(0, r * r - (u - c) ** 2)) * 1.25)));
    const n = fbm(u * 7, v * 7), edge = Math.min(v - top, 0.64 - v, u - 0.06, 0.94 - u) * 9 + (n - 0.5) * 1.6, a = clamp(edge * 2.2), lit = clamp(1 - (v - top) * 2.4 + (n - 0.5) * 0.6), c = 168 + 87 * lit;
    const k = (py * w + px) * 4; im.data[k] = c - 8 * (1 - lit); im.data[k + 1] = c - 4 * (1 - lit); im.data[k + 2] = Math.min(255, c + 12 * (1 - lit)); im.data[k + 3] = 255 * a; } x.putImageData(im, 0, 0); }, 512, 512); T_.premultiplyAlpha = true; return T_; }
const SUN_HIGH = dirV(-20 * DEG, 28 * DEG);
function buildSky(st) { const R = RNG('skydeck'), S = { st };
  const land = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000).rotateX(-Math.PI / 2), STDm({ map: wrap(g3Tex((x, w) => { const Rl = RNG('land'); x.fillStyle = '#5a7040'; x.fillRect(0, 0, w, w); for (let k = 0; k < 400; k++) blot(x, Rl.r(0, w), Rl.r(0, w), Rl.r(10, 60), Rl.pick(['rgba(120,130,80,0.5)', 'rgba(60,80,40,0.5)', 'rgba(150,140,110,0.45)', 'rgba(40,60,90,0.5)'])); for (let k = 0; k < 200; k++) { x.fillStyle = 'rgba(200,200,200,0.5)'; x.fillRect(Rl.r(0, w), Rl.r(0, w), Rl.r(2, 8), Rl.r(2, 8)); } }, 512, 512), 20, 20), roughness: 1 }));
  st.scene.add(land);
  const texs = [0, 1, 2, 3, 4, 5].map((k) => cloudTex(k)); S.clouds = [];
  for (let i = 0; i < 520; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.pick(texs), transparent: true, depthWrite: false, fog: false, color: 0xffffff, premultipliedAlpha: true })); const r = Math.sqrt(R.f()) * 5000, a = R.r(0, TAU), s = R.r(350, 900);
    sp.position.set(Math.cos(a) * r, R.r(1750, 2250), Math.sin(a) * r); sp.scale.set(s * 1.6, s, 1); st.scene.add(sp); S.clouds.push(sp); }
  for (let i = 0; i < 70; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.pick(texs), transparent: true, depthWrite: false, opacity: 0.85, fog: false, premultipliedAlpha: true })); const a = R.r(0, TAU), r = R.r(0, 260), s = R.r(120, 260); sp.position.set(Math.cos(a) * r, R.r(1850, 2150), Math.sin(a) * r); sp.scale.set(s * 1.6, s, 1); st.scene.add(sp); S.clouds.push(sp); }
  return S; }

// a ring of cumulus around a point, high in the sky (street, city)
function addSkyClouds(st, n, cx, cz, r0, r1, y0, y1, seed) { const R = RNG('skycl' + seed), texs = [0, 1, 2, 3, 4, 5].map((k) => cloudTex(k)), out = [];
  for (let i = 0; i < n; i++) { const a = R.r(0, TAU), r = R.r(r0, r1), s = R.r(0.25, 0.5) * r; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.pick(texs), transparent: true, depthWrite: false, fog: false, premultipliedAlpha: true }));
    sp.position.set(cx + Math.cos(a) * r, R.r(y0, y1), cz + Math.sin(a) * r); sp.scale.set(s * 1.6, s, 1); st.scene.add(sp); out.push(sp); } return out; }
