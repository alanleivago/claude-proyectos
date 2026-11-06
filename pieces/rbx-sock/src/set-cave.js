// rbx-sock: the Sock Man's cave at the bottom of the laundry chute. A rocky cavern, a MOUNTAIN of socks (~72 high, ~96 wide)
// = a knit-textured heightfield hill covered by thousands of instanced socks, the duck-sock trophy at the summit,
// the chute outlet high on the left with a sock slide below (landing), half-buried glowing dryers, and the Sock Man's nook.
'use strict';
SETS.cave = async function () {
  const { cnv, tex, pbr, rng, fbm } = RBX;
  const V = KIT.V, texPair = KIT.texPair, noiseOver = KIT.noiseOver;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#030204');
  scene.fog = new THREE.FogExp2('#1a0c06', 0.0042);

  // ---------------- layout ----------------
  const H = 72, R = 48;                                      // main mountain
  const CH = { x: -42, z: 30, R: 17, H: 15 };                // sock slide under the chute
  const NA = Math.PI / 3, NOOK = { x: Math.sin(NA) * 35, z: Math.cos(NA) * 35, r: 8 };   // Sock Man's nook (front-right flank)
  const nz = fbm(11, 6, 4), nz2 = fbm(23, 12, 3);
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function heightAt(x, z) {
    const r = Math.hypot(x, z), t = r / R, u = x / 260 + 0.5, v = z / 260 + 0.5;
    let h = t < 1 ? H * Math.pow(Math.cos(t * Math.PI / 2), 1.5) : -1;
    h += (nz(u, v) - 0.5) * 14 * sstep(0.1, 0.35, t) * (t < 1.05 ? 1 : 0) + (nz2(u, v) - 0.5) * 3 * sstep(0.08, 0.2, t);
    if (t > 0.92) h -= (t - 0.92) * 40;
    const cr = Math.hypot(x - CH.x, z - CH.z) / CH.R;
    if (cr < 1) h = Math.max(h, CH.H * Math.pow(Math.cos(cr * Math.PI / 2), 1.3) + (nz2(u, v) - 0.5) * 2);
    const nd = Math.hypot(x - NOOK.x, z - NOOK.z);           // the nook: a flat-floored bowl cut into the flank
    const cut = nd < NOOK.r ? 0.2 : 0.2 + Math.pow(nd - NOOK.r, 1.25) * 1.5;
    h = Math.min(h, cut);
    return h;
  }
  const normalAt = (x, z) => { const e = 0.6; return V(heightAt(x - e, z) - heightAt(x + e, z), 2 * e, heightAt(x, z - e) - heightAt(x, z + e)).normalize(); };

  // ---------------- textures ----------------
  const rockT = texPair(1024, (g, hg, S) => {
    const n = fbm(7, 8, 5), n2 = fbm(9, 32, 3), im = g.createImageData(S, S), hm = hg.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const a = n(x / S, y / S), b = n2(x / S, y / S), i = (y * S + x) * 4, k = 0.55 + a * 0.7 + (b - 0.5) * 0.3;
      const strata = Math.sin((y / S) * 40 + a * 9) * 0.5 + 0.5;
      hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = 60 + a * 150 + b * 40 - strata * 20; hm.data[i + 3] = 255;
      im.data[i] = 112 * k + strata * 10; im.data[i + 1] = 94 * k + strata * 7; im.data[i + 2] = 80 * k; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); hg.putImageData(hm, 0, 0);
    const r = rng(4); g.lineCap = 'round';
    for (let i = 0; i < 26; i++) { let x = r() * S, y = r() * S; g.strokeStyle = 'rgba(18,12,8,0.6)'; hg.strokeStyle = '#3a3a3a'; g.lineWidth = hg.lineWidth = 1.5 + r() * 2; g.beginPath(); hg.beginPath(); g.moveTo(x, y); hg.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 70; y += (r() - 0.3) * 60; g.lineTo(x, y); hg.lineTo(x, y); } g.stroke(); hg.stroke(); }
    for (let i = 0; i < 160; i++) { const x = r() * S, y = r() * S, s = 3 + r() * 10; g.fillStyle = `rgba(${150 + r() * 40},${130 + r() * 30},${100 + r() * 30},0.35)`; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 7); g.fill(); }
  });
  const dirtT = texPair(1024, (g, hg, S) => {
    g.fillStyle = '#24180f'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 31, 0.9, 8, 5);
    const r = rng(8);
    for (let i = 0; i < 900; i++) { const x = r() * S, y = r() * S, s = 2 + r() * 9, c = 34 + r() * 46; g.fillStyle = `rgb(${c},${c * 0.82},${c * 0.66})`; g.beginPath(); g.ellipse(x, y, s, s * (0.6 + r() * 0.4), r() * 3, 0, 7); g.fill();
      hg.fillStyle = `rgb(${150 + r() * 100},0,0)`; hg.fillStyle = '#d0d0d0'; hg.beginPath(); hg.ellipse(x, y, s, s * 0.8, 0, 0, 7); hg.fill(); }
    for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(14,9,6,0.7)'; g.lineWidth = 2; g.beginPath(); let x = r() * S, y = r() * S; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
  });
  // packed-sock pile tile: overlapping sock silhouettes with dark gaps (reads as socks between the instances)
  const PILE = ['#f2f0ea', '#a8d8f0', '#6b4a8a', '#e94b3c', '#22356e', '#8c8a86', '#5e5d5c', '#b9ad94', '#7d8ea0', '#b0486a', '#3f7f8f', '#2f8f4a', '#c8262c', '#d8402e', '#4fb35c', '#2a2a40'];
  const pileT = texPair(1024, (g, hg, S) => {
    g.fillStyle = '#120c09'; g.fillRect(0, 0, S, S); hg.fillStyle = '#000'; hg.fillRect(0, 0, S, S);
    const r = rng(19);
    for (let i = 0; i < 520; i++) {
      const x = r() * S, y = r() * S, a = r() * Math.PI * 2, L = 55 + r() * 45, W = 18 + r() * 8, col = PILE[Math.floor(r() * PILE.length)], fl = r() < 0.5 ? 1 : -1;
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        if (x + ox < -120 || x + ox > S + 120 || y + oy < -120 || y + oy > S + 120) continue;
        [g, hg].forEach((c, ci) => { c.save(); c.translate(x + ox, y + oy); c.rotate(a);
          c.fillStyle = ci ? '#000' : 'rgba(0,0,0,0.55)'; c.beginPath(); c.roundRect(-W / 2 - 3, -3, W + 6, L + 6, W / 2); c.fill();   // contact shadow
          c.fillStyle = ci ? `rgb(${170 + r() * 60},0,0)` : col; c.beginPath(); c.roundRect(-W / 2, 0, W, L, W / 2 - 2); c.fill();
          c.beginPath(); c.roundRect(-W / 2, L - W, W * 1.9 * fl > 0 ? W * 1.9 : W * 1.9, W, W / 2); c.fill();
          if (!ci) { c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-W / 2, 0, W, 7); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.5;
            for (let k = 10; k < L; k += 5) { c.beginPath(); c.moveTo(-W / 2 + 2, k); c.lineTo(W / 2 - 2, k); c.stroke(); }
            if (r() < 0.35) { c.fillStyle = 'rgba(255,255,255,0.75)'; for (let k = 14; k < L - 6; k += 12) c.fillRect(-W / 2, k, W, 4); } }
          else { c.fillStyle = '#ffffff'; c.fillRect(-W / 2 + 3, 2, W - 6, 5); }
          c.restore(); });
      }
    }
    const im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = Math.min(255, im.data[i * 4] * 0.9 + 20); hg.putImageData(im, 0, 0);
    noiseOver(g, S, S, 3, 0.35, 16, 3);
  });
  const metalT = texPair(512, (g, hg, S) => { g.fillStyle = '#8d9196'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 5, 0.35, 16, 4);
    const r = rng(2); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${110 + r() * 40},${60 + r() * 20},30,${0.15 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * S, r() * S, 10 + r() * 40, 5 + r() * 20, r() * 3, 0, 7); g.fill(); }
    for (let y = 0; y < S; y += 128) { g.fillStyle = 'rgba(30,30,32,0.8)'; g.fillRect(0, y, S, 4); hg.fillStyle = '#000'; hg.fillRect(0, y, S, 5);
      for (let x = 16; x < S; x += 40) { g.fillStyle = '#c8ccd0'; g.beginPath(); g.arc(x, y + 14, 4, 0, 7); g.fill(); hg.fillStyle = '#fff'; hg.beginPath(); hg.arc(x, y + 14, 4, 0, 7); hg.fill(); } } });
  const woodT = KIT.woodPlanks(512, 77, { rows: 3, tones: ['#6a3a1c', '#5c321a', '#73411f'], knots: 6 });
  const M = {
    rock: pbr(rockT.c, rockT.h, { rough: 0.92, bump: 5, repeat: [14, 7] }),
    dirt: pbr(dirtT.c, dirtT.h, { rough: 0.95, bump: 4, repeat: [12, 12] }),
    pile: pbr(pileT.c, pileT.h, { rough: 0.97, bump: 4, nscale: 1, repeat: [1, 1] }),
    metal: pbr(metalT.c, metalT.h, { rough: 0.45, bump: 2 }),
    wood: pbr(woodT.c, woodT.h, { rough: 0.7, bump: 3 }),
    root: new THREE.MeshStandardMaterial({ color: '#3b2a1c', roughness: 0.95 }),
    enamel: new THREE.MeshStandardMaterial({ color: '#9c968a', roughness: 0.55 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#c0c4c8', roughness: 0.25, metalness: 0.9 }),
    glow: new THREE.MeshStandardMaterial({ color: '#000000', emissive: new THREE.Color('#ff7a1a'), emissiveIntensity: 2.2, roughness: 0.2 }),
    felt: new THREE.MeshStandardMaterial({ color: '#4a1220', roughness: 1 }),
    gold: new THREE.MeshStandardMaterial({ color: '#d9a640', roughness: 0.3, metalness: 1 }),
    rope: new THREE.MeshStandardMaterial({ color: '#cdb48a', roughness: 0.95 }),
  };
  M.pile.map.wrapS = M.pile.map.wrapT = M.pile.normalMap.wrapS = M.pile.normalMap.wrapT = THREE.RepeatWrapping;
  M.pile.emissive = new THREE.Color(1, 1, 1); M.pile.emissiveMap = M.pile.map; M.pile.emissiveIntensity = 0.03;

  // ---------------- cave shell: squashed displaced sphere (rock) + floor ----------------
  const CAV = { rx: 118, ry: 100 }, cnz = fbm(41, 4, 4), cnz2 = fbm(43, 24, 3);
  const caveR = (d) => { const u = Math.atan2(d.z, d.x) / (Math.PI * 2) + 0.5, v = Math.acos(THREE.MathUtils.clamp(d.y, -1, 1)) / Math.PI; return 1 + (cnz(u, v) - 0.5) * 0.22 + (cnz2(u, v) - 0.5) * 0.07; };
  const wallPt = (d) => { const k = caveR(d); return V(d.x * CAV.rx * k, d.y * CAV.ry * k, d.z * CAV.rx * k); };
  {
    const g = new THREE.SphereGeometry(1, 160, 90), p = g.attributes.position, d = V();
    for (let i = 0; i < p.count; i++) { d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize(); const w = wallPt(d); p.setXYZ(i, w.x, Math.max(w.y, -4), w.z); }
    g.computeVertexNormals();
    const shell = new THREE.Mesh(g, M.rock.clone()); shell.material.side = THREE.BackSide; shell.receiveShadow = true; scene.add(shell);
    const fl = new THREE.PlaneGeometry(300, 300); fl.rotateX(-Math.PI / 2); const floor = new THREE.Mesh(fl, M.dirt); floor.receiveShadow = true; scene.add(floor);
  }
  // stalactites + roots from the ceiling, stalagmites + boulders near the walls
  {
    const r = rng(33), cone = new THREE.ConeGeometry(1, 1, 9, 4), cp = cone.attributes.position;
    for (let i = 0; i < cp.count; i++) { const y = cp.getY(i); cp.setX(i, cp.getX(i) * (1 + Math.sin(y * 9 + i) * 0.08)); } cone.computeVertexNormals();
    const tips = [], mags = [], q = new THREE.Quaternion(), down = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI);
    for (let i = 0; i < 150; i++) { const a = r() * Math.PI * 2, el = 0.25 + r() * 0.75, d = V(Math.cos(a) * Math.sqrt(1 - el * el), el, Math.sin(a) * Math.sqrt(1 - el * el)), w = wallPt(d);
      const L = 5 + r() * r() * 26, rad = L * (0.12 + r() * 0.08); tips.push(new THREE.Matrix4().compose(V(w.x, w.y - L / 2 + 2, w.z), down.clone().multiply(q.setFromAxisAngle(V(0, 1, 0), r() * 6)), V(rad, L, rad))); }
    for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = V(Math.cos(a), 0.05, Math.sin(a)).normalize(), w = wallPt(d), k = 0.8 + r() * 0.17;
      if (w.z * k > 40 && Math.abs(w.x * k) < 70) continue; const L = 4 + r() * 12, rad = L * 0.25; mags.push(new THREE.Matrix4().compose(V(w.x * k * 0.97, L / 2 - 0.5, w.z * k * 0.97), q.setFromAxisAngle(V(0, 1, 0), r() * 6), V(rad, L, rad))); }
    [tips, mags].forEach((ms) => { const im = new THREE.InstancedMesh(cone, M.rock, ms.length); ms.forEach((m, i) => im.setMatrixAt(i, m)); im.receiveShadow = true; im.frustumCulled = false; scene.add(im); });
    const rock = new THREE.DodecahedronGeometry(1, 1), rp = rock.attributes.position; for (let i = 0; i < rp.count; i++) rp.setXYZ(i, rp.getX(i) * (1 + Math.sin(i * 1.7) * 0.15), rp.getY(i) * 0.7, rp.getZ(i)); rock.computeVertexNormals();
    const bl = []; for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, rr = 55 + r() * 60, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (heightAt(x, z) > 0) continue; const s = 0.4 + r() * r() * 6;
      bl.push(new THREE.Matrix4().compose(V(x, s * 0.3, z), q.setFromEuler(new THREE.Euler(r(), r() * 6, r())), V(s, s, s))); }
    const bim = new THREE.InstancedMesh(rock, M.rock, bl.length); bl.forEach((m, i) => bim.setMatrixAt(i, m)); bim.castShadow = bim.receiveShadow = true; bim.frustumCulled = false; scene.add(bim);
    // hanging roots: thin wobbly tubes in clusters
    const roots = new THREE.Group(); scene.add(roots);
    for (let c = 0; c < 26; c++) { const a = r() * Math.PI * 2, el = 0.35 + r() * 0.6, d = V(Math.cos(a) * Math.sqrt(1 - el * el), el, Math.sin(a) * Math.sqrt(1 - el * el)), w = wallPt(d);
      for (let k = 0; k < 5; k++) { const pts = [], L = 8 + r() * 26, ox = (r() - 0.5) * 4, oz = (r() - 0.5) * 4;
        for (let s = 0; s <= 6; s++) pts.push(V(w.x + ox + Math.sin(s * 1.3 + k) * 1.2 * (s / 6), w.y + 3 - (s / 6) * L, w.z + oz + Math.cos(s * 1.1 + k) * 1.2 * (s / 6)));
        roots.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.12 + r() * 0.25, 5), M.root)); } }
  }

  // ---------------- the sock mountain: heightfield hill (packed-sock texture) ----------------
  const pileMesh = (() => {
    const N = 260, S = 124, g = new THREE.PlaneGeometry(2 * S, 2 * S, N, N); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = heightAt(x, z); p.setY(i, h > 0.05 ? h : Math.min(h, -0.4)); uv.setXY(i, x / 11, z / 11); }
    g.computeVertexNormals();
    // side faces get UVs stretched; add a y component so slopes don't smear
    for (let i = 0; i < p.count; i++) uv.setXY(i, uv.getX(i) + p.getY(i) * 0.04, uv.getY(i) + p.getY(i) / 11);
    const m = new THREE.Mesh(g, M.pile); m.receiveShadow = true; m.castShadow = true; return m;
  })();
  scene.add(pileMesh);

  // ---------------- thousands of socks on the surface ----------------
  const BRIGHT = ['dino', 'pizza', 'knit', 'knit2', 'stripe', 'dots', 'argyle', 'red', 'green', 'star', 'mail', 'baby', 'gym'];
  const OLD = ['grey', 'grey2', 'oat', 'fadeblue', 'fadestripe'];
  const pick = (r) => { const x = r(); if (x < 0.2) return 'gym'; if (x < 0.29) return 'baby'; if (x < 0.36) return 'argyle'; if (x < 0.44) return 'stripe';
    if (x < 0.62) return OLD[Math.floor(r() * OLD.length)]; return BRIGHT[Math.floor(r() * BRIGHT.length)]; };
  const sockM = (P, n, ang, stick, s, r) => {   // lying on the surface (flat axis along the normal) or sticking out of it
    let t = V(Math.cos(ang), 0, Math.sin(ang)); t.addScaledVector(n, -t.dot(n)).normalize();
    let X = n.clone(), Y = t.clone();
    if (stick > 0) { Y = t.clone().multiplyScalar(Math.cos(stick)).addScaledVector(n, -Math.sin(stick)).normalize(); X = new THREE.Vector3().crossVectors(Y, t).normalize(); if (X.dot(n) < 0) X.negate(); }
    const tilt = new THREE.Quaternion().setFromAxisAngle(Y, (r() - 0.5) * 0.5); X.applyQuaternion(tilt);
    const Z = new THREE.Vector3().crossVectors(X, Y).normalize(); X = new THREE.Vector3().crossVectors(Y, Z);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    const pos = P.clone().addScaledVector(n, (stick > 0 ? 0.0 : 0.12) * s); if (stick > 0) pos.addScaledVector(Y, -0.6 * s);   // stuck-in socks are half buried
    return new THREE.Matrix4().compose(pos, q, V(s, s, s));
  };
  const items = [];
  {
    const r = rng(101); let tries = 0;
    while (items.length < 7200 && tries < 200000) { tries++;
      const x = (r() - 0.5) * 2 * 62, z = (r() - 0.5) * 2 * 62, h = heightAt(x, z); if (h < 0.15 || Math.hypot(x - NOOK.x, z - NOOK.z) < NOOK.r + 1.5 || Math.hypot(x - 9, z - 41) < 3.2) continue;
      const n = normalAt(x, z), slope = 1 / Math.max(0.25, n.y), rr = Math.hypot(x, z), t = rr / R, front = rr > 0.1 ? z / rr : 1;
      const w = slope * (front > -0.35 ? 1 : 0.28) * (t < 0.12 ? 2.2 : 1) * (Math.hypot(x - CH.x, z - CH.z) < CH.R ? 1.4 : 1);
      if (r() * 2.6 > w) continue;
      const s = (t < 0.15 || Math.hypot(x - CH.x, z - CH.z) < CH.R * 0.9 || Math.hypot(x - NOOK.x, z - NOOK.z) < 18) ? 0.95 + r() * 0.35 : 1.25 + r() * 0.5 + t * 0.4;
      const stick = r() < 0.16 ? 0.5 + r() * 0.6 : 0;
      items.push({ kind: pick(r), m: sockM(V(x, h, z), n, r() * Math.PI * 2, stick, s, r) });
    }
    // litter on the floor around the base
    for (let i = 0; i < 1600; i++) { const a = r() * Math.PI * 2, rr = 30 + Math.pow(r(), 1.6) * 60, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (heightAt(x, z) > 0.1 || Math.hypot(x - NOOK.x, z - NOOK.z) < 11) continue;
      items.push({ kind: pick(r), m: sockM(V(x, 0, z), V(0, 1, 0), r() * 6.28, 0, 0.95 + r() * 0.3, r) }); }
  }
  const socks = SOCKS.instanced(items, { lit: 0.06, cast: true }); scene.add(socks);

  // grandpa's sock: a huge saggy brown one on the front slope near the base
  const GP = { x: 9, z: 41 }, grandpaSock = SOCKS.one('grandpa', 3.4, 0.45);
  { const n = normalAt(GP.x, GP.z), m = sockM(V(GP.x, heightAt(GP.x, GP.z), GP.z), n, -0.5, 0, 1, () => 0.5), pq = new THREE.Vector3(), q = new THREE.Quaternion(), sc = V();
    m.decompose(pq, q, sc); grandpaSock.position.copy(pq).addScaledVector(n, 0.35); grandpaSock.quaternion.copy(q); scene.add(grandpaSock); }
  grandpaSock.updateMatrixWorld(true); const GPC = new THREE.Box3().setFromObject(grandpaSock).getCenter(V());
  const gpL = new THREE.PointLight('#ffb070', 700, 30, 2); gpL.position.copy(GPC).add(V(2, 9, 12)); scene.add(gpL);

  // ---------------- half-buried dryers glowing from inside (the "dryer drum" warmth) ----------------
  const dryers = [];
  function dryer(x, z, ry, sink, tilt) {
    const g = new THREE.Group(), h = heightAt(x, z); g.position.set(x, h - sink, z); g.rotation.set(tilt, ry, tilt * 0.4); scene.add(g);
    g.add(KIT.rb(6, 6.6, 6, 0.4, M.enamel, 0, 3.3, 0));
    g.add(KIT.rb(5.6, 1.0, 0.3, 0.1, M.chrome, 0, 6.0, 3.0));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.32, 12, 40), M.chrome); ring.position.set(0, 3.0, 3.08); g.add(ring);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(1.8, 40), M.glow); glass.position.set(0, 3.0, 3.06); g.add(glass); glass.userData.glass = 1;
    [-1.6, 0, 1.6].forEach((dx) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 14), M.chrome); k.rotation.x = Math.PI / 2; k.position.set(dx, 6.0, 3.2); g.add(k); });
    const L = new THREE.PointLight('#ff8a2a', 420, 22, 2); L.position.set(0, 3.0, 6.0); g.add(L);
    KIT.shadow(g); glass.castShadow = false; dryers.push({ g, L }); return g;
  }
  dryer(-14, 40, 0.15, 2.4, 0.18);
  dryer(-22, -30, 2.6, 3.2, -0.12);
  dryer(-30, 12, -0.9, 4.0, 0.1);
  dryer(4, 20, 0.05, 3.8, 0.25);

  // ---------------- the chute: square metal tube out of the ceiling, flared lip ----------------
  const CHU = { x: CH.x + 1, y: 64, z: CH.z - 3 };
  const chute = new THREE.Group(); chute.position.set(CHU.x, CHU.y, CHU.z); chute.rotation.z = 0.08; scene.add(chute);
  {
    const top = wallPt(V(CHU.x / CAV.rx, 0.9, CHU.z / CAV.rx).normalize()).y + 6, L = top - CHU.y, T = 0.35, S = 6;
    const mt = KIT.wm(M.metal, [1 / 6, L / 32]);
    [[S / 2, 0], [-S / 2, 0], [0, S / 2], [0, -S / 2]].forEach(([dx, dz]) => { const w = dx ? T : S + T, d = dx ? S + T : T; const b = new THREE.Mesh(KIT.uvBox(new THREE.BoxGeometry(w, L, d), w, L, d), mt); b.position.set(dx, L / 2, dz); chute.add(b); });
    for (let k = 0; k < 4; k++) { const b = KIT.rb(S + 1.0, 0.5, S + 1.0, 0.1, M.chrome, 0, 2 + k * 8, 0); chute.add(b); }
    const lip = KIT.rb(S + 1.6, 0.6, S + 1.6, 0.15, M.metal, 0, 0.1, 0); chute.add(lip);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(S - 0.1, S - 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.1, 1.6) })); inner.rotation.x = Math.PI / 2; inner.position.y = 3; chute.add(inner);
    // a few socks caught on the lip
    ['gym', 'stripe', 'baby'].forEach((k, i) => { const s = SOCKS.one(k, 1.1); s.position.set(-2.4 + i * 2.4, 0.1, S / 2 + 0.2); s.rotation.set(0, 0, (i - 1) * 0.3); chute.add(s); });
    // collar of rock where it enters the ceiling
    const col = new THREE.Mesh(new THREE.DodecahedronGeometry(8, 1), M.rock); col.scale.set(1.3, 0.8, 1.3); col.position.y = L - 4; chute.add(col);
    KIT.shadow(chute); inner.castShadow = false;
  }
  // light from upstairs pouring out of the chute: spot (shadows) + beam + dust
  const chuteSpot = new THREE.SpotLight('#ffe2b8', 9000, 160, 0.5, 0.7, 2); chuteSpot.position.set(CHU.x, CHU.y + 2, CHU.z); chuteSpot.target.position.set(CH.x + 4, 0, CH.z + 6);
  chuteSpot.castShadow = true; chuteSpot.shadow.mapSize.set(2048, 2048); chuteSpot.shadow.bias = -0.0004; chuteSpot.shadow.camera.near = 2; chuteSpot.shadow.camera.far = 120; scene.add(chuteSpot, chuteSpot.target);
  const beamDir = V(CH.x + 4 - CHU.x, -CHU.y, CH.z + 6 - CHU.z).normalize();
  const bmat = RBX.beamMat('#ffd8a0', 0.035), beam = RBX.beam(V(CHU.x, CHU.y - 0.2, CHU.z), beamDir, 7, 7, 70, bmat); scene.add(beam);
  const bmat2 = RBX.beamMat('#ffc890', 0.012), beam2 = RBX.beam(V(CHU.x, CHU.y - 0.2, CHU.z), beamDir, 13, 13, 70, bmat2); scene.add(beam2);

  // ---------------- the trophy at the summit ----------------
  const TB = { x: 0, z: -1.8 }, ys = heightAt(TB.x, TB.z);
  const trophy = new THREE.Group(); trophy.position.set(TB.x, ys, TB.z); scene.add(trophy);
  const ducks = [];
  {
    [-3.3, 3.3].forEach((x) => { const p = KIT.rb(0.5, 9.5, 0.5, 0.06, M.wood, x, 2.75, 0); p.rotation.z = x * 0.006; trophy.add(p); });   // posts, 2 units buried
    trophy.add(KIT.rb(8.4, 5.4, 0.35, 0.08, M.wood, 0, 4.9, -0.35));
    trophy.add(KIT.rb(7.4, 4.5, 0.12, 0.05, M.felt, 0, 4.9, -0.12));
    [[0, 7.55, 8.8, 0.35], [0, 2.25, 8.8, 0.35]].forEach(([x, y, w, h]) => trophy.add(KIT.rb(w, h, 0.5, 0.08, M.gold, x, y, -0.2)));
    [-4.25, 4.25].forEach((x) => trophy.add(KIT.rb(0.35, 5.6, 0.5, 0.08, M.gold, x, 4.9, -0.2)));
    const star = KIT.textTex(256, 256, (g) => { g.fillStyle = '#f6c544'; KIT.star(g, 128, 128, 120); g.fill(); g.fillStyle = '#c8262c'; g.font = 'bold 54px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('No.1', 128, 146); });
    const st = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshStandardMaterial({ map: star, transparent: true, roughness: 0.4, emissive: new THREE.Color('#ffffff'), emissiveMap: star, emissiveIntensity: 0.25 })); st.position.set(0, 8.4, 0.05); trophy.add(st);
    const plaque = KIT.textTex(512, 128, (g) => { g.fillStyle = '#d9a640'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#7a5418'; g.lineWidth = 8; g.strokeRect(8, 8, 496, 112); g.fillStyle = '#3a2408'; g.font = 'bold 72px Georgia, serif'; g.textAlign = 'center'; g.fillText('THE PAIR', 256, 92); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.85), new THREE.MeshStandardMaterial({ map: plaque, metalness: 0.6, roughness: 0.35 })); pl.position.set(0, 3.0, 0.02); trophy.add(pl);
    // clothesline across the board + two wooden pegs + the ducks hanging, feet out like wings
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 8.2, 6), M.rope); line.rotation.z = Math.PI / 2; line.position.set(0, 6.8, 0.25); trophy.add(line);
    [-1.6, 1.6].forEach((x, i) => {
      const d = SOCKS.one('duck', 1.6); d.position.set(x, 6.75, 0.35); d.rotation.set(0.05, i ? Math.PI / 2 : -Math.PI / 2, i ? -0.06 : 0.06); trophy.add(d); ducks.push(d);
      const peg = new THREE.Group(); peg.position.set(x, 6.8, 0.75); trophy.add(peg);
      [-0.13, 0.13].forEach((o) => peg.add(KIT.rb(0.2, 1.3, 0.16, 0.05, M.wood, o, 0, 0)));
      const spring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 12), M.chrome); spring.rotation.y = Math.PI / 2; peg.add(spring);
    });
    // marquee bulbs around the frame
    const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.8, 0.8) }), bg = new THREE.SphereGeometry(0.16, 10, 8);
    for (let k = 0; k < 11; k++) { const x = -4.0 + k * 0.8; [7.55, 2.25].forEach((y) => { const b = new THREE.Mesh(bg, bulbM); b.position.set(x, y, 0.1); trophy.add(b); }); }
    for (let k = 1; k < 6; k++) [-4.25, 4.25].forEach((x) => { const b = new THREE.Mesh(bg, bulbM); b.position.set(x, 2.25 + k * 0.88, 0.1); trophy.add(b); });
    KIT.shadow(trophy);
  }
  const trophySpot = new THREE.SpotLight('#ffcf7a', 750, 70, 0.32, 0.55, 2); trophySpot.position.set(TB.x + 6, ys + 26, TB.z + 16); trophySpot.target.position.set(TB.x, ys + 5, TB.z);
  trophySpot.castShadow = true; trophySpot.shadow.mapSize.set(2048, 2048); trophySpot.shadow.bias = -0.0004; trophySpot.shadow.camera.near = 4; trophySpot.shadow.camera.far = 80; scene.add(trophySpot, trophySpot.target);
  const trophyGlowL = new THREE.PointLight('#ffb050', 45, 18, 2); trophyGlowL.position.set(TB.x, ys + 5.5, TB.z + 3); scene.add(trophyGlowL);
  const glowTex = (() => { const c = cnv(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,200,110,1)'); gr.addColorStop(0.35, 'rgba(255,150,60,0.35)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return tex(c); })();
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(1.2, 0.9, 0.55), transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.set(13, 13, 1); halo.position.set(TB.x, ys + 5.5, TB.z - 1.0); scene.add(halo);

  // ---------------- clotheslines of socks strung across the cave (depth + density) ----------------
  {
    const r = rng(55), lineItems = [];
    const lines = [[V(-100, 70, -40), V(-8, 60, -10)], [V(20, 66, -8), V(105, 58, 20)], [V(-90, 46, 60), V(-50, 52, 22)], [V(60, 40, 70), V(36, 44, 26)]];
    lines.forEach(([a, b]) => { const mid = a.clone().lerp(b, 0.5); mid.y -= a.distanceTo(b) * 0.08; const c = new THREE.QuadraticBezierCurve3(a, mid, b);
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.09, 5), M.rope));
      const n = Math.floor(c.getLength() / 3.2); for (let i = 1; i < n; i++) { const p = c.getPointAt(i / n); lineItems.push({ kind: pick(r), m: new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.3, r() * 6, (r() - 0.5) * 0.2)), V(1.2, 1.2, 1.2)) }); } });
    scene.add(SOCKS.instanced(lineItems, { lit: 0.06, cast: false }));
  }

  // ---------------- the Sock Man in his nook ----------------
  const sockMan = SOCKS.man(); sockMan.position.set(NOOK.x, 0.2, NOOK.z); sockMan.rotation.y = NA + Math.PI * 0.08; scene.add(sockMan);
  sockMan.updateMatrixWorld(true);
  const headW = sockMan.userData.head.getWorldPosition(V()).add(V(0, 2.1, 0));
  const out = V(Math.sin(NA), 0, Math.cos(NA));
  const rim = new THREE.SpotLight('#ff8a3a', 1400, 30, 0.6, 0.5, 2); rim.position.copy(V(NOOK.x, 13, NOOK.z).addScaledVector(out, -9).add(V(out.z * 5, 0, -out.x * 5))); rim.target.position.copy(headW).add(V(0, -2, 0)); scene.add(rim, rim.target);
  const rim2 = new THREE.PointLight('#ff6a20', 120, 12, 2); rim2.position.copy(V(NOOK.x, 3, NOOK.z).addScaledVector(out, -6).add(V(-out.z * 4, 0, out.x * 4))); scene.add(rim2);

  // ---------------- global light ----------------
  const hemi = new THREE.HemisphereLight('#2c2a48', '#4a2410', 0.6); scene.add(hemi);
  const cobalt = new THREE.DirectionalLight('#3f62ff', 1.6); cobalt.position.set(-30, 45, -120); cobalt.target.position.set(0, 20, 0); scene.add(cobalt, cobalt.target);
  const wallBlue = [[-0.9, -0.45], [0.95, -0.3], [0.1, -1], [-0.95, 0.3], [0.9, 0.45], [-0.5, -0.85], [0.55, -0.85]].map(([x, z], i) => { const L = new THREE.PointLight(i % 2 ? '#2a48d8' : '#3a5af0', 26000, 55, 2); L.position.set(x * 96, 22 + (i % 3) * 18, z * 96); scene.add(L); return L; });
  const cobalt2 = wallBlue[0], cobalt3 = wallBlue[1];
  const glows = [];   // warm glow from below / inside the pile (dryer heat)
  [[-6, 10, 24], [-36, 5, -6], [34, 5, -14], [-24, 18, 14], [6, 26, 10], [-44, 2, 42]].forEach(([x, y, z]) => {
    const L = new THREE.PointLight('#ff7a22', 380, 40, 2); L.position.set(x, Math.max(y, heightAt(x, z) + 6), z); scene.add(L); glows.push(L); });
  const floorGlow = new THREE.PointLight('#ff9a40', 4200, 150, 2); floorGlow.position.set(-4, 30, 86); scene.add(floorGlow); glows.push(floorGlow);

  // dust motes everywhere + denser in the chute beam
  const dust = (() => {
    const r = rng(9), N = 3200, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { let p; if (i < 1400) p = V(CHU.x, CHU.y, CHU.z).addScaledVector(beamDir, r() * 64).add(V((r() - 0.5) * 9, (r() - 0.5) * 9, (r() - 0.5) * 9));
      else p = V((r() - 0.5) * 180, 2 + r() * 80, (r() - 0.5) * 180); pos.set([p.x, p.y, p.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ size: 0.14, map: glowTex, color: new THREE.Color(2.2, 1.6, 1.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 });
    const pts = new THREE.Points(g, m); scene.add(pts); return pts;
  })();

  // ---------------- moods ----------------
  const base = { hemi: hemi.intensity, cobalt: cobalt.intensity, cobalt2: cobalt2.intensity, chute: chuteSpot.intensity, trophy: trophySpot.intensity, tg: trophyGlowL.intensity, rim: rim.intensity, rim2: rim2.intensity, glows: glows.map((l) => l.intensity), dry: dryers.map((d) => d.L.intensity) };
  function mood(name) {
    const dark = name === 'dark';
    hemi.intensity = dark ? 0.04 : base.hemi; cobalt.intensity = dark ? 0.15 : base.cobalt; wallBlue.forEach((l) => { l.intensity = dark ? 0 : base.cobalt2; });
    chuteSpot.intensity = dark ? 0 : base.chute; trophySpot.intensity = dark ? 0 : base.trophy; trophyGlowL.intensity = dark ? 0 : base.tg;
    glows.forEach((l, i) => { l.intensity = dark ? 0 : base.glows[i]; }); gpL.visible = !dark; dryers.forEach((d, i) => { d.L.intensity = dark ? 0 : base.dry[i]; });
    M.glow.emissiveIntensity = dark ? 0.3 : 2.2;
    rim.intensity = dark ? base.rim * 1.3 : base.rim; rim2.intensity = dark ? 0 : base.rim2;
    [beam, beam2, halo, dust].forEach((o) => { o.visible = !dark; });
    scene.fog.color.set(dark ? '#050302' : '#1a0c06');
    sockMan.traverse((m) => { if (m.isMesh && !Array.isArray(m.material) && m.material.emissiveIntensity < 0.5) { const mt = m.material; if (mt.userData.e0 === undefined) mt.userData.e0 = mt.emissiveIntensity; mt.emissiveIntensity = 0.004; } });
    socks.children.concat([pileMesh]).forEach((m) => { const mt = m.material; if (mt.userData.e0 === undefined) mt.userData.e0 = mt.emissiveIntensity; mt.emissiveIntensity = dark ? 0.004 : mt.userData.e0; });
  }
  mood('default');

  const P = (x, z, ry = 0, extra = {}) => Object.assign({ p: [+x.toFixed(2), +Math.max(0, heightAt(x, z)).toFixed(2), +z.toFixed(2)], ry }, extra);
  const LND = { x: CH.x + 9, z: CH.z + 11 };
  const r2 = (v) => v.toArray().map((k) => +k.toFixed(2));
  const marks = {
    p_landing: P(LND.x, LND.z, 0.4),                       // hero lands at the foot of the sock slide under the chute
    p_summit: P(TB.x + 5.4, TB.z + 2.6, -0.5),             // hero at the top, next to the trophy
    p_base: P(-2, 58, Math.PI),                            // hero at the foot of the mountain, looking up (wide)
    p_sockman: { p: [+NOOK.x.toFixed(2), 0.2, +NOOK.z.toFixed(2)], ry: sockMan.rotation.y },
    m_trophy: { p: [TB.x, +(ys + 6.0).toFixed(2), +(TB.z + 0.4).toFixed(2)] },
    m_grandpa: { p: r2(GPC) },
    m_sockman: { p: r2(headW) },
    m_chute: { p: [CHU.x, CHU.y, CHU.z] },
    m_summit: { p: [0, +heightAt(0, 0).toFixed(2), 0] },
  };
  const T = marks.m_trophy.p, S0 = marks.p_summit.p, L0 = marks.p_landing.p, hw = marks.m_sockman.p;
  return {
    scene, grade: 'night', mood,
    marks,
    props: { ducks, trophy, grandpaSock, sockMan, setSockMan: (v) => { sockMan.visible = v; }, chute, chuteSpot, trophySpot, beam, dryers: dryers.map((d) => d.g), socks, pile: pileMesh, heightAt },
    views: Object.fromEntries(Object.entries({
      wide: { p: [12, 4, 98], l: [-4, 36, 0], fov: 62 },
      summit: { p: [T[0] + 5, T[1] - 1, T[2] + 24], l: [T[0] + 2, T[1] - 2.5, T[2]], fov: 48 },
      landing: { p: [L0[0] + 10, L0[1] + 5, L0[2] + 16], l: [L0[0] - 2, L0[1] + 6, L0[2] - 6], fov: 55 },
      nook: { p: [hw[0] + out.x * 22, 6, hw[2] + out.z * 22], l: [hw[0], hw[1] - 2, hw[2]], fov: 45 },
      dark: { p: [hw[0] + out.x * 16, 7, hw[2] + out.z * 16], l: [hw[0], hw[1] - 1, hw[2]], fov: 45, mood: 'dark' },
      topdown: { p: [CHU.x + 3, CHU.y + 5, CHU.z + 9], l: [CHU.x + 8, 0, CHU.z + 12], fov: 62 },
      grandpa: { p: [GPC.x + 4, GPC.y + 7, GPC.z + 17], l: GPC.toArray(), fov: 45 },
    }).map(([k, v]) => [k, Object.assign({ mood: 'default' }, v)])),
  };
};
