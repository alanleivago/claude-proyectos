// sets/outside.js — ep2 exteriors: 13_horde (fog yard, concrete/wood posts, rusty ladder tower, horde shambling at camera)
// and 17_pipe / 19_spray (Soviet wall rug on wallpaper, a water pipe bursts through it at 48.7, blue jet, code VFX).
// World horde: camera at z=+4 looking -z, zombies walk +z. World rug: wall face z=0, rug centred x=0, room at +z.

export async function shots({ L }) {
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 60);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const vignette = (o, k) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.28, LW / 2, LH * 0.45, LH * 0.65);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  const out = {};

  // =====================================================================================
  // 13_horde
  // =====================================================================================
  {
    const FOG = 0xa9aeb2;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(FOG); scene.fog = new THREE.Fog(FOG, 2.5, 15);
    scene.add(new THREE.HemisphereLight(0xe8eef4, 0x5a5850, 1.35));
    const sun = new THREE.DirectionalLight(0xf0f2f4, 0.6); sun.position.set(-2, 5, 3); scene.add(sun);

    const groundT = L.cvs(64, 64, (c, w, h) => {   // wet cracked asphalt / mud with puddles
      const r = L.rng(71);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 22 - 11; px(c, x, y, rgb(92 + n, 90 + n, 84 + n)); }
      for (let k = 0; k < 7; k++) { const cx = r() * w, cy = r() * h, rx = 4 + r() * 8, ry = 2 + r() * 4;
        for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) < 1) px(c, (cx + x + w) % w | 0, (cy + y + h) % h | 0, (x + y) % 3 === 0 ? '#9aa4ac' : '#6c7278'); }
      c.strokeStyle = '#4e4c46'; c.lineWidth = 1;
      for (let k = 0; k < 6; k++) { c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let s = 0; s < 4; s++) { x += r() * 10 - 5; y += r() * 10 - 5; c.lineTo(x, y); } c.stroke(); }
    });
    const concreteT = L.cvs(32, 64, (c, w, h) => {
      const r = L.rng(72);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 18 - 9 - (y > h - 10 ? 18 : 0); px(c, x, y, rgb(178 + n, 172 + n, 160 + n)); }
      for (let k = 0; k < 10; k++) px(c, r() * w | 0, r() * h | 0, '#7c766a', 1 + (r() * 2 | 0), 1 + (r() * 3 | 0));
      for (let k = 0; k < 5; k++) { const x = r() * w | 0; for (let y = r() * 20 | 0; y < h; y += 1) if (r() < 0.7) px(c, x + (r() < 0.2 ? 1 : 0), y, 'rgba(90,80,64,0.35)'); }   // rain streaks
    });
    const woodT = L.cvs(16, 64, (c, w, h) => {
      const r = L.rng(73);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7 + (x % 5 === 0 ? -16 : 0); px(c, x, y, rgb(150 + n, 120 + n, 84 + n)); }
      for (let k = 0; k < 3; k++) { const y = r() * h | 0; px(c, 4 + (r() * 8 | 0), y, '#5a4028', 3, 2); }
    });
    const rustT = L.cvs(16, 16, (c, w, h) => { const r = L.rng(74); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r(); px(c, x, y, n < 0.35 ? '#7a3a1c' : n < 0.7 ? '#5c4a40' : n < 0.9 ? '#9a5a2a' : '#3a302c'); } });

    L.plane(30, 30, L.lam(L.rep(groundT, 14, 14)), 0, 0, -6, scene, 0, -Math.PI / 2);
    // foreground: concrete pillar (right, cut by frame), wooden post (left), low concrete block bottom-left like the ref
    const conc = L.lam(L.rep(concreteT, 1, 2)), wood = L.lam(L.rep(woodT, 1, 2)), rust = L.lam(L.rep(rustT, 2, 2));
    L.box(0.3, 3.4, 0.3, conc, 0.62, 1.7, 2.6, scene);
    L.box(0.16, 3.4, 0.16, wood, -0.66, 1.7, 1.6, scene);
    L.box(0.9, 0.42, 0.45, conc, -0.75, 0.21, 2.9, scene);
    L.box(0.5, 0.3, 0.4, conc, 0.55, 0.15, 3.05, scene);
    // mid: more posts receding into the fog (old pergola / carport)
    for (const [x, z, w] of [[-1.7, -1.2, 0.2], [1.9, -2.5, 0.28], [-2.0, -5.5, 0.22], [2.2, -7.5, 0.3], [-1.4, -10, 0.24]]) L.box(w, 3.4, w, z > -3 ? wood : conc, x, 1.7, z, scene);
    L.box(5, 0.16, 0.16, wood, 0, 3.0, -1.2, scene);
    // rusty ladder tower (left, behind the wooden post): 4 legs, rungs, hoops, conical cap
    const tw = new THREE.Group(); tw.position.set(-1.25, 0, -3.2); tw.rotation.y = 0.35; scene.add(tw);
    for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) L.box(0.035, 4.4, 0.035, rust, x, 2.2, z, tw);
    for (let y = 0.3; y < 4.3; y += 0.32) { L.box(0.6, 0.025, 0.025, rust, 0, y, 0.3, tw); }
    for (let y = 1.2; y < 4.4; y += 0.55) { const ring = L.mesh(new THREE.TorusGeometry(0.46, 0.015, 3, 10), rust, 0, y, 0, tw); ring.rotation.x = Math.PI / 2; }
    const cap = L.mesh(new THREE.ConeGeometry(0.55, 0.9, 6), L.lam(L.rep(rustT, 3, 2)), 0, 4.85, 0, tw);
    // chain-link fence segments far back
    const fenceT = L.cvs(16, 16, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#4a4440'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(16, 16); c.moveTo(16, 0); c.lineTo(0, 16); c.stroke(); });
    const fenceM = L.lam(L.rep(fenceT, 18, 4), 0xffffff, { transparent: false, alphaTest: 0.5, side: THREE.DoubleSide });
    L.plane(9, 2, fenceM, 0.5, 1, -12, scene);
    for (let x = -4; x <= 5; x += 1.5) L.box(0.05, 2.1, 0.05, rust, x, 1.05, -12, scene);

    // ---- zombies: three models, cloned with L.ps1Clone, walk cycles without root motion ----
    const src = {
      city: [await L.loadModel('models/city-zombie.glb'), 'Walking', null, 1.8],
      thin: [await L.loadModel('models/thin-zombie.glb'), 'walk', 'tex/thin_zombie.png', 1.85],
      hazmat: [await L.loadModel('models/hazmat-zombie.glb'), 'zombie_forward', null, 1.75],
    };
    const thinTex = await L.loadTex('tex/thin_zombie.png', 256); thinTex.flipY = false; thinTex.needsUpdate = true;
    // city-zombie recolour from ep1 hall.js (red plaid shirt, blue jeans, pale skin) — its GLB has no usable texture
    const zTex = L.cvs(32, 64, (c) => {
      const r = L.rng(31);
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        const sx = x % 8 < 2, sy = y % 8 < 2, th = x % 8 === 5 || y % 8 === 5;
        let col = sx && sy ? [60, 10, 10] : sx || sy ? [110, 18, 16] : th ? [210, 110, 90] : [176, 38, 30];
        const n = r() * 16 - 8; px(c, x, y, rgb(col[0] + n, col[1] + n / 2, col[2] + n / 2));
      }
      for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 18 - 9 + (x % 16 === 0 ? -18 : 0); px(c, x, y, rgb(58 + n, 84 + n, 138 + n)); }
      for (let k = 0; k < 7; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), '#5a0a08', 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 3));
    });
    zTex.wrapS = THREE.RepeatWrapping; zTex.wrapT = THREE.ClampToEdgeWrapping;
    const skinT = L.rep(L.cvs(32, 32, (c) => {
      const r = L.rng(33);
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 20 - 10; px(c, x, y, rgb(138 + n, 150 + n, 152 + n)); }
      for (let k = 0; k < 14; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), r() < 0.5 ? '#6a7064' : '#7a1210', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3));
    }), 1, 1);
    src.city[0].scene.traverse((o) => {
      if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
        else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; }
      }
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    });
    function Hzombie(kind, h, tint) {
      const [g, clipName, tex] = src[kind];
      const root = L.ps1Clone(g.scene);
      if (kind === 'city') root.traverse((o) => { if (!o.isMesh) return; const n = o.material.name || ''; o.material = n.includes('Outfit') ? L.lam(zTex) : n.includes('Body') ? L.lam(skinT) : L.lam(null, 0x8a2a20); o.material.side = THREE.DoubleSide; });
      root.traverse((o) => { if (!o.isMesh) return; for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { if (tex) m.map = thinTex; m.color.multiply(new THREE.Color(tint)); m.needsUpdate = true; } });
      const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
      root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
      const mixer = new THREE.AnimationMixer(root), clip = THREE.AnimationClip.findByName(g.animations, clipName), act = mixer.clipAction(clip); act.play();
      let hip = null; root.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; });
      const hip0 = hip.position.clone();
      scene.add(wrap);
      return { wrap, dur: clip.duration, set(t) { act.time = ((t % clip.duration) + clip.duration) % clip.duration; mixer.update(0); hip.position.x = hip0.x; hip.position.z = hip0.z; } };
    }
    // [kind, x, z at lt=0, speed m/s, height, tint, phase, yaw]
    const H = [
      ['city', 0.05, 0.2, 1.0, 1.82, 0xffffff, 0.0, 0.05],
      ['thin', -0.5, -0.9, 0.9, 1.86, 0xf0f0f0, 0.4, 0.15],
      ['hazmat', 0.6, -1.7, 0.85, 1.74, 0xe8f0e0, 0.9, -0.2],
      ['city', -0.2, -3.4, 0.95, 1.76, 0xc8d8f0, 0.25, 0.1],
      ['thin', 0.45, -4.4, 0.9, 1.9, 0xd0d8e0, 0.7, -0.1],
      ['city', -0.8, -5.4, 0.9, 1.8, 0xe0d0b0, 0.55, 0.25],
      ['hazmat', 0.05, -6.6, 0.85, 1.7, 0xd8d8d8, 0.15, 0.0],
      ['thin', 0.9, -7.8, 0.9, 1.84, 0xe0d0d0, 0.8, -0.25],
      ['city', -0.45, -9.0, 0.9, 1.78, 0xffffff, 0.35, 0.1],
    ].map(([kind, x, z, sp, h, tint, ph, ry]) => ({ z: Hzombie(kind, h, tint), x, z0: z, sp, ph, ry }));

    const c = cam(52);
    out['13_horde'] = { scene, camera: c, overlay: (lt, dt, a, o) => vignette(o, 0.35), update(lt) {
      for (const h of H) {
        const d = lt * h.sp;
        h.z.wrap.position.set(h.x - Math.sin(h.ry) * d * 0.3, 0, h.z0 + d); h.z.wrap.rotation.y = h.ry * 0.5;
        h.z.set(h.ph * h.z.dur + lt * h.sp * 1.6);
      }
      look(c, V(0.05, 0.9, 4.3), V(0.0, 1.2, -4));
    } };
  }

  // =====================================================================================
  // 17_pipe / 19_spray
  // =====================================================================================
  {
    const TB = 48.7;            // burst (global time)
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2420);
    scene.add(new THREE.HemisphereLight(0xfff0e0, 0x504038, 1.25));
    const key = new THREE.DirectionalLight(0xffe8d0, 0.8); key.position.set(1.5, 2.5, 3); scene.add(key);

    const wallT = L.cvs(32, 32, (c, w, h) => {   // cream wallpaper with brown vertical stripes + small flowers
      const r = L.rng(81);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5; const s = x % 16 < 2 ? -30 : x % 16 === 8 ? -14 : 0; px(c, x, y, rgb(196 + n + s, 176 + n + s, 140 + n + s)); }
      for (const [x, y] of [[4, 6], [12, 22], [20, 10], [28, 26]]) { px(c, x, y, '#8a5a3a', 2, 2); px(c, x - 1, y + 1, '#a87a4a'); px(c, x + 2, y + 1, '#a87a4a'); }
    });
    L.plane(6, 4, L.lam(L.rep(wallT, 10, 7)), 0, 1.5, -0.01, scene);

    // the rug: 96x128 canvas, red field, blue octagon medallions with cream outline + amber diamond core, patterned border
    const RW = 96, RH = 128;
    const rugCv = document.createElement('canvas'); rugCv.width = RW; rugCv.height = RH;
    { const c = rugCv.getContext('2d'), r = L.rng(82);
      const RED = [176, 40, 28], DRED = [120, 22, 18], BLUE = [30, 44, 110], CREAM = [226, 206, 160], AMBER = [214, 130, 40], BLACK = [30, 20, 22];
      for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
        let col = RED;
        const B = 12;
        if (x < 3 || x >= RW - 3 || y < 3 || y >= RH - 3) col = BLACK;
        else if (x < B || x >= RW - B || y < B || y >= RH - B) {   // border: cream band with little blue/amber diamonds on dark red
          const bx = x < B ? x : x >= RW - B ? RW - 1 - x : y < B ? y : RH - 1 - y, along = x < B || x >= RW - B ? y : x;
          if (bx === 4 || bx === B - 2) col = CREAM;
          else { const m = along % 8, d = Math.abs(m - 4) + Math.abs(bx - 7.5); col = d < 2 ? AMBER : d < 3.5 ? BLUE : DRED; }
        } else {
          // field: 3 x 4 grid of octagons
          const fx = (x - B) / (RW - 2 * B) * 3, fy = (y - B) / (RH - 2 * B) * 4;
          const u = (fx % 1) - 0.5, v = (fy % 1) - 0.5, au = Math.abs(u), av = Math.abs(v);
          const oct = Math.max(au, av, (au + av) * 0.72);
          const dia = au + av;
          if (oct < 0.42) {
            col = BLUE;
            if (oct > 0.36) col = CREAM;
            if (dia < 0.22) col = dia < 0.08 ? CREAM : dia < 0.15 ? AMBER : RED;
            if (oct < 0.3 && oct > 0.27) col = AMBER;
          } else {
            // between medallions: small cream crosses and black zig lines
            const cu = Math.abs(((fx + 0.5) % 1) - 0.5), cv = Math.abs(((fy + 0.5) % 1) - 0.5);
            if (cu + cv < 0.07) col = CREAM; else if ((cu < 0.02 || cv < 0.02) && cu + cv < 0.14) col = AMBER;
            if (Math.abs(u) > 0.47 || Math.abs(v) > 0.47) col = DRED;
          }
        }
        const n = r() * 16 - 8; px(c, x, y, rgb(col[0] + n, col[1] + n, col[2] + n));
      }
    }
    const rugTex = new THREE.CanvasTexture(rugCv); rugTex.colorSpace = THREE.SRGBColorSpace; rugTex.minFilter = rugTex.magFilter = THREE.NearestFilter; rugTex.generateMipmaps = false;
    const RUGW = 1.5, RUGH = 2.0, HX = 0.1, HY = 1.25, RX = 0.35;      // hole centre (pipe position) on the rug
    const rugGeo = new THREE.PlaneGeometry(RUGW, RUGH, 30, 40), rugP0 = rugGeo.attributes.position.array.slice();
    const rug = L.mesh(rugGeo, L.lam(rugTex, 0xffffff, { side: THREE.DoubleSide }), RX, 1.35, 0.03, scene);
    // rug rod on top
    L.mesh(new THREE.CylinderGeometry(0.015, 0.015, RUGW + 0.2, 6), L.lam(null, 0x6a5030), RX, 1.35 + RUGH / 2 + 0.02, 0.04, scene).rotation.z = Math.PI / 2;
    function bulge(k, tear) {   // k: bulge 0..1 pushes rug toward +z around the hole; tear opens the hole
      const p = rugGeo.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        const x = rugP0[i] + RX, y = rugP0[i + 1] + 1.35, d = Math.hypot(x - HX, y - HY);
        p[i] = rugP0[i]; p[i + 1] = rugP0[i + 1];
        p[i + 2] = k * 0.16 * Math.exp(-d * d / 0.03);
        if (tear > 0 && d < 0.13 * tear) { const s = (0.13 * tear) / Math.max(d, 1e-3); p[i] = HX - RX + (x - HX) * s; p[i + 1] = HY - 1.35 + (y - HY) * s; p[i + 2] = -0.02; }
      }
      rugGeo.attributes.position.needsUpdate = true; rugGeo.computeVertexNormals();
    }
    // the dark ragged hole behind the tear + torn flaps
    const holeShape = new THREE.Shape(); { const r = L.rng(83); for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, rr = (i % 2 ? 0.07 : 0.16) * (0.8 + r() * 0.4); i ? holeShape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : holeShape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } }
    const hole = L.mesh(new THREE.ShapeGeometry(holeShape), L.basic(null, 0x120c0c, { side: THREE.DoubleSide }), HX, HY, 0.062, scene);
    const flapM = L.lam(rugTex, 0xd8d0c8, { side: THREE.DoubleSide }), flaps = [];
    { const r = L.rng(84);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + r() * 0.5, g = new THREE.BufferGeometry();
        const w = 0.05 + r() * 0.04, l = 0.1 + r() * 0.06;
        g.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, (r() - 0.5) * 0.04, l, 0], 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute([0.5 + 0.05 * i, 0.55, 0.53 + 0.05 * i, 0.55, 0.51 + 0.05 * i, 0.62], 2)); g.computeVertexNormals();
        const piv = new THREE.Group(); piv.position.set(HX, HY, 0.06); piv.rotation.z = a - Math.PI / 2; scene.add(piv);
        const f = L.mesh(g, flapM, 0, 0, 0, piv); flaps.push({ piv, f, a, out: 0.9 + r() * 0.6 });
      }
    }
    // the burst pipe: rusty steel pipe out of the hole toward the camera, slight downward tilt, ragged split end + collar
    const pipeT = L.cvs(16, 32, (c, w, h) => { const r = L.rng(85); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 24 - 12, ru = r() < 0.15; px(c, x, y, ru ? rgb(130 + n, 70 + n, 34) : rgb(128 + n + (x < 4 ? 30 : 0), 132 + n + (x < 4 ? 30 : 0), 136 + n + (x < 4 ? 30 : 0))); } });
    const pipe = new THREE.Group(); scene.add(pipe);
    const pm = L.lam(pipeT);
    L.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8, 1, true), pm, 0, 0.25, 0, pipe);
    L.mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.06, 8), L.lam(pipeT, 0x9a9488), 0, 0.12, 0, pipe);
    const lip = L.mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.06, 8, 1, true), L.lam(pipeT, 0xc0a080, { side: THREE.DoubleSide }), 0, 0.52, 0, pipe);
    lip.scale.set(1.15, 1, 0.85);
    L.mesh(new THREE.CircleGeometry(0.04, 8), L.basic(null, 0x0a0806), 0, 0.5, 0, pipe).rotation.x = -Math.PI / 2;
    const pipeDir = V(0.12, -0.12, 1).normalize(), pipeQ = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), pipeDir);
    pipe.quaternion.copy(pipeQ);
    const tip = (out) => V(HX, HY, 0).addScaledVector(pipeDir, 0.52 + out - 0.5);

    function setRug(t) {
      const u = t - TB;
      const k = u < -0.15 ? 0 : u < 0 ? L.smooth((u + 0.15) / 0.15) : 1;
      const tear = L.smooth(u / 0.1);
      bulge(u < 0 ? k : 1 - 0.4 * tear, tear);
      hole.visible = tear > 0; hole.scale.setScalar(Math.max(0.01, tear));
      for (const f of flaps) { f.piv.visible = tear > 0; f.f.rotation.x = -f.out * tear; f.piv.scale.setScalar(Math.max(0.01, tear)); }
      const pOut = L.smooth(u / 0.14);   // pipe pokes out by 0.3 m
      pipe.visible = u > 0; pipe.position.copy(V(HX, HY, 0).addScaledVector(pipeDir, -0.3 + 0.32 * pOut));
      return pOut;
    }
    // ---- water jet (2D fx canvas, projected from 3D particle paths; deterministic per particle index) ----
    const hash = (k) => L.rng(9000 + k * 7919);
    const P = new THREE.Vector3();
    const proj = (camera, p) => { P.copy(p).project(camera); return [(P.x * 0.5 + 0.5) * LW, (0.5 - P.y * 0.5) * LH, P.z]; };
    const COLS = ['#2a6ad0', '#3c86e8', '#5aa6ff', '#9ad0ff', '#d8f0ff'];
    const RATE = 150, LIFE = 0.9;
    function water(fctx, t, camera, pOut) {
      fctx.clearRect(0, 0, LW, LH);
      const u = t - TB - 0.05; if (u <= 0) return;
      const t0 = tip(0.32 * pOut - 0.02 + 0.04);
      const ramp = L.smooth(u / 0.2);
      const k1 = Math.floor(u * RATE), k0 = Math.max(0, Math.floor((u - LIFE) * RATE));
      for (let k = k0; k <= k1; k++) {
        const age = u - k / RATE; if (age < 0 || age > LIFE) continue;
        const r = hash(k);
        const sp = (1.3 + r() * 0.9) * (0.4 + 0.6 * ramp);
        const pulse = 1 + 0.15 * Math.sin(k * 0.37);
        const d = V(pipeDir.x + (r() - 0.5) * 0.35, pipeDir.y + 0.15 + (r() - 0.5) * 0.3, pipeDir.z + (r() - 0.5) * 0.3).normalize().multiplyScalar(sp * pulse);
        const pos = (a) => V(t0.x + d.x * a, t0.y + d.y * a - 4.9 * a * a, t0.z + d.z * a);
        const a1 = age, a0 = Math.max(0, age - 0.07);
        const p1 = pos(a1); if (p1.y < 0.02) continue;
        const [x1, y1, z1] = proj(camera, p1), [x0, y0] = proj(camera, pos(a0));
        if (z1 > 1) continue;
        fctx.strokeStyle = COLS[(r() * COLS.length) | 0]; fctx.lineWidth = r() < 0.3 ? 3 : 2;
        fctx.beginPath(); fctx.moveTo(Math.round(x0), Math.round(y0)); fctx.lineTo(Math.round(x1), Math.round(y1)); fctx.stroke();
        if (r() < 0.25) { fctx.fillStyle = '#e8f8ff'; fctx.fillRect(Math.round(x1), Math.round(y1), 2, 2); }
      }
      // solid core near the mouth
      const [cx, cy] = proj(camera, t0), [ex, ey] = proj(camera, V(t0.x + pipeDir.x * 0.25, t0.y + pipeDir.y * 0.25 + 0.02, t0.z + pipeDir.z * 0.25));
      fctx.strokeStyle = '#6ab4ff'; fctx.lineWidth = 6 * ramp; fctx.beginPath(); fctx.moveTo(cx, cy); fctx.lineTo(ex, ey); fctx.stroke();
      fctx.strokeStyle = '#d0ecff'; fctx.lineWidth = 2 * ramp; fctx.beginPath(); fctx.moveTo(cx, cy - 1); fctx.lineTo(ex, ey - 1); fctx.stroke();
      // wet dark stain spreading on the rug below the hole
    }
    // dark wet stain spreading down the rug (3D decal, grows with time)
    const stain = L.plane(0.5, 1, L.basic(null, 0x200808, { transparent: true, opacity: 0.35, depthWrite: false }), HX, HY - 0.5, 0.045, scene);

    let lastOut = 0;
    const mk = (id, fov, pos, tgt) => {
      const c = cam(fov);
      out[id] = { scene, camera: c, overlay: (lt, dt, a, o) => vignette(o, 0.45),
        update(lt, t) {
          lastOut = setRug(t);
          const s = L.clamp01((t - TB - 0.2) / 3); stain.visible = s > 0; stain.scale.set(0.6 + 0.4 * s, Math.max(0.01, s), 1); stain.position.y = HY - 0.08 - 0.5 * s;
          const p = typeof pos === 'function' ? pos(lt) : pos; look(c, p, tgt);
        },
        fx: { draw(fctx, t, camera) { water(fctx, t, camera, lastOut); } } };
    };
    mk('17_pipe', 50, V(0.05, 1.3, 2.0), V(0.05, 1.22, 0));
    mk('19_spray', 48, (lt) => V(-0.15, 1.12, 1.55 - lt * 0.03), V(0.18, 0.95, 0));
  }
  return out;
}
