// sets/closeups.js — primeros planos frontales de Ava mirando a camara: 06_friction, 14_nope, 16_congrats, 18_fudge.
// Plantilla: ep1 rooms.js 10_friction (estanteria con sprays/hierbas, lookAt a camara, boca por TL.mouth). Prefijo propio: K*.
export async function shots(ctx) {
  const { L, TL } = ctx;
  const { THREE } = L;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mouthAt = (tg, base) => { const m = TL.mouth[Math.floor(tg * 15)]; return m === 'A' ? 'talkA' : m === 'O' ? 'talkO' : base; };
  const W = (w, after = 0) => (TL.words.find((x) => x[0] === w && x[1] >= after) || [0, 99, 99])[1];   // inicio global de la palabra
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);

  // ---------- texturas PS1 ----------
  const tWall = L.cvs(64, 64, (c, w, h) => {   // papel pintado crema con ornamentos marrones (ep1)
    c.fillStyle = '#c9b48e'; c.fillRect(0, 0, w, h);
    const r = L.rng(9); for (let i = 0; i < 260; i++) { c.fillStyle = r() < 0.5 ? '#bfa983' : '#d2bf9a'; c.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1); }
    c.strokeStyle = '#7d5c3a'; c.lineWidth = 1.4;
    for (const [x, y] of [[16, 18], [48, 50]]) {
      c.beginPath(); c.ellipse(x, y, 6, 7, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fillStyle = '#7d5c3a'; c.fill();
      c.beginPath(); c.moveTo(x - 9, y + 9); c.quadraticCurveTo(x - 12, y + 2, x - 7, y - 2); c.stroke();
      c.beginPath(); c.moveTo(x + 9, y - 9); c.quadraticCurveTo(x + 12, y - 2, x + 7, y + 2); c.stroke();
    }
    c.fillStyle = '#6f8a5a'; for (const [x, y] of [[40, 14], [8, 46], [30, 34]]) c.fillRect(x, y, 2, 2);
  });
  const tWood = (base, seed) => L.cvs(32, 32, (c, w, h) => { const r = L.rng(seed); for (let y = 0; y < h; y++) { const k0 = 0.85 + r() * 0.25; for (let x = 0; x < w; x++) { const k = k0 * (0.93 + 0.12 * Math.sin(x * 0.7 + y * 0.15 + r())); c.fillStyle = hex(base.map((v) => v * k)); c.fillRect(x, y, 1, 1); } } });
  const tDark = tWood([86, 52, 30], 4), tSill = tWood([120, 96, 70], 8), tStud = tWood([176, 128, 74], 14);
  const tPly = L.cvs(64, 64, (c, w, h) => {   // contrachapado: veta ondulada naranja, nudos, tornillos cada ~12"
    const r = L.rng(17);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = Math.sin((y + 6 * Math.sin(x * 0.11) + 3 * Math.sin(x * 0.37)) * 0.55), k = 0.9 + 0.1 * v + r() * 0.06;
      c.fillStyle = hex([196 * k, 138 * k, 78 * k]); c.fillRect(x, y, 1, 1);
    }
    for (const [x, y] of [[18, 22], [46, 44]]) { c.fillStyle = '#7a4a22'; c.beginPath(); c.ellipse(x, y, 4, 2, 0, 0, 7); c.fill(); c.fillStyle = '#a06830'; c.fillRect(x - 1, y, 2, 1); }
    c.fillStyle = '#9a6a3a'; c.fillRect(0, 0, w, 1); c.fillRect(0, 0, 1, h);
  });
  const tRug = L.cvs(64, 96, (c, w, h) => {   // alfombra de pared sovietica: rojo, azul marino, crema, octogonos y dientes de sierra
    c.fillStyle = '#a8232a'; c.fillRect(0, 0, w, h);
    const bord = (x, y, ww, hh, col) => { c.fillStyle = col; c.fillRect(x, y, ww, hh); };
    bord(0, 0, w, 6, '#1d2552'); bord(0, h - 6, w, 6, '#1d2552'); bord(0, 0, 6, h, '#1d2552'); bord(w - 6, 0, 6, h, '#1d2552');
    c.fillStyle = '#e6d6b0'; for (let x = 0; x < w; x += 4) { c.fillRect(x, 6, 2, 2); c.fillRect(x + 2, h - 8, 2, 2); } for (let y = 0; y < h; y += 4) { c.fillRect(6, y, 2, 2); c.fillRect(w - 8, y + 2, 2, 2); }
    c.fillStyle = '#e2b13a'; for (let x = 2; x < w; x += 6) { c.fillRect(x, 2, 2, 2); c.fillRect(x, h - 4, 2, 2); } for (let y = 2; y < h; y += 6) { c.fillRect(2, y, 2, 2); c.fillRect(w - 4, y, 2, 2); }
    const oct = (cx, cy, r, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + 0.5) * Math.PI / 4; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.fill(); };
    for (const [cx, cy] of [[22, 26], [42, 48], [22, 70]]) {
      oct(cx, cy, 13, '#1d2552'); oct(cx, cy, 10.5, '#e6d6b0'); oct(cx, cy, 8.5, '#2e7aa0'); oct(cx, cy, 6, '#a8232a');
      c.fillStyle = '#e2b13a'; c.fillRect(cx - 1, cy - 4, 2, 8); c.fillRect(cx - 4, cy - 1, 8, 2); c.fillStyle = '#1d2552'; c.fillRect(cx - 1, cy - 1, 2, 2);
    }
    c.fillStyle = '#1d2552'; for (const [x, y] of [[42, 18], [42, 78], [12, 48], [52, 48]]) { c.fillRect(x - 3, y - 1, 6, 2); c.fillRect(x - 1, y - 3, 2, 6); }
    const r = L.rng(23); for (let i = 0; i < 180; i++) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(r() * w | 0, r() * h | 0, 1, 1); }
  });
  tRug.wrapS = tRug.wrapT = THREE.ClampToEdgeWrapping;

  // ---------- props copiados del ep1 (rooms.js): First Aid Spray y macetas de hierbas ----------
  const tSpray = L.cvs(64, 64, (c) => {
    c.fillStyle = '#bdbab2'; c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 4) { c.fillStyle = y % 8 ? '#c4c1b8' : '#b6b3aa'; c.fillRect(0, y, 64, 2); }
    c.fillStyle = '#dfe2c8'; c.fillRect(0, 14, 64, 36);
    c.fillStyle = '#2e9a50'; c.fillRect(0, 13, 64, 2); c.fillRect(0, 49, 64, 2);
    c.fillStyle = '#2e9a50'; c.fillRect(8, 19, 4, 12); c.fillRect(4, 23, 12, 4);
    c.font = 'bold 6px monospace'; c.textBaseline = 'top'; c.fillText('FIRST-AID', 0, 38); c.fillText('FIRST-AID', 32, 38);
    c.fillStyle = '#2e9a50'; c.fillRect(40, 19, 4, 12); c.fillRect(36, 23, 12, 4);
    c.fillStyle = '#d0504c'; c.fillRect(39, 32, 6, 6); c.fillRect(38, 33, 8, 4); c.fillStyle = '#f0e8e0'; c.fillRect(41, 33, 2, 4); c.fillRect(40, 34, 4, 2);
  });
  tSpray.wrapS = THREE.RepeatWrapping;
  const mRim = lam(null, 0x7a6e6a), mCap = lam(null, 0xd8d6d0), mNoz = lam(null, 0x2a2a2c);
  function Kspray(parent, x, y, z, ry = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    const r = 0.032, h = 0.13;
    cyl(r * 1.12, r * 1.12, 0.012, 8, mRim, 0, 0.006, 0, g);
    cyl(r, r, h, 8, lam(tSpray), 0, 0.012 + h / 2, 0, g);
    cyl(r * 1.12, r * 1.12, 0.01, 8, mRim, 0, 0.012 + h, 0, g);
    cyl(r * 0.45, r, 0.03, 8, mCap, 0, 0.017 + h + 0.015, 0, g);
    B(0.014, 0.016, 0.014, mNoz, 0, 0.017 + h + 0.038, 0, g);
    return g;
  }
  const leafTex = (col, dark) => L.cvs(32, 32, (c) => {
    const rr = L.rng(col.length * 7 + dark.charCodeAt(1));
    for (let k = 0; k < 7; k++) {
      const x = 4 + rr() * 24, y = 4 + rr() * 16, w = 5 + rr() * 4, hh = 8 + rr() * 6;
      c.fillStyle = dark; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2 + 1, hh / 2 + 1, (rr() - 0.5) * 0.9, 0, 7); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2, hh / 2, (rr() - 0.5) * 0.9, 0, 7); c.fill();
    }
    c.fillStyle = '#3a5a20'; for (let k = 0; k < 5; k++) c.fillRect(8 + k * 4, 22, 2, 10);
  });
  const HERBS = { green: leafTex('#3aa035', '#1c5a1a'), red: leafTex('#c42a22', '#6a1210'), yellow: leafTex('#e0c22a', '#8a6a10') };
  const mPot = lam(null, 0x9a5a34), mSoil = lam(null, 0x3a2414);
  function Kherb(parent, x, y, z, kind) {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    cyl(0.05, 0.036, 0.07, 8, mPot, 0, 0.035, 0, g); cyl(0.054, 0.054, 0.012, 8, mPot, 0, 0.068, 0, g);
    cyl(0.046, 0.046, 0.004, 8, mSoil, 0, 0.072, 0, g);
    const m = lam(HERBS[kind], 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide });
    for (let k = 0; k < 3; k++) L.plane(0.13, 0.13, m, 0, 0.07 + 0.06, 0, g, k * Math.PI / 3);
    return g;
  }

  // ---------- sala base: pared de papel pintado, luz calida clara, Ava en el origen, camara de primer plano ----------
  const WZ = -0.95;
  function Kroom(bg = 0x241a12) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(bg);
    scene.add(new THREE.HemisphereLight(0xffe6c8, 0x4a3426, 1.35));
    const key = new THREE.DirectionalLight(0xffe2c0, 1.5); key.position.set(-1.2, 2.2, 3); scene.add(key);
    L.plane(5, 3.2, lam(L.rep(tWall, 6, 4)), 0, 1.6, WZ, scene);
    B(5, 0.1, 0.03, lam(tDark), 0, 2.45, WZ + 0.015, scene);   // moldura alta
    const ch = L.hero(); scene.add(ch.root);
    const camera = new THREE.PerspectiveCamera(40, L.LW / L.LH, 0.05, 30);
    camera.position.set(0, 1.36, 1.05); camera.lookAt(0, 1.4, 0);
    return { scene, camera, ch };
  }
  // estanteria con sprays y hierbas (detras, a la izquierda de Ava)
  function Kshelf(scene, x, seed) {
    const sh = new THREE.Group(); sh.position.set(x, 0, WZ + 0.2); scene.add(sh);
    const wd = lam(tDark, 0xd0c0b0);
    B(0.06, 2.1, 0.36, wd, -0.6, 1.05, 0, sh); B(0.06, 2.1, 0.36, wd, 0.6, 1.05, 0, sh); B(1.26, 2.1, 0.03, wd, 0, 1.05, -0.17, sh); B(1.26, 0.06, 0.38, wd, 0, 2.1, 0, sh);
    const ITEMS = ['spray', 'green', 'red', 'spray', 'yellow', 'green', 'spray', 'red', 'yellow']; let nIt = 0;
    const r = L.rng(seed), bookCols = [0x8a2a20, 0x2a4a72, 0x3e6030, 0x9a7428, 0x5e3652, 0xa08a62];
    for (let k = 0; k < 5; k++) {
      const y = 0.06 + k * 0.42; B(1.14, 0.03, 0.34, wd, 0, y, 0, sh);
      let xx = -0.54;
      while (xx < 0.5) {
        if (r() < 0.4) {
          const it = ITEMS[nIt++ % ITEMS.length];
          if (it === 'spray') { Kspray(sh, xx + 0.04, y + 0.015, 0.03, -0.4 + r() * 0.8); xx += 0.1; }
          else { Kherb(sh, xx + 0.055, y + 0.015, 0.03, it); xx += 0.13; }
        } else { const bw = 0.03 + r() * 0.03, bh = 0.2 + r() * 0.1; const b = B(bw, bh, 0.24, lam(null, bookCols[Math.floor(r() * bookCols.length)]), xx + bw / 2, y + 0.015 + bh / 2, 0.02, sh); b.rotation.z = r() < 0.15 ? 0.15 : 0; xx += bw + 0.005; }
      }
    }
    return sh;
  }
  // ventana tapada con contrachapado (por dentro, atornillado) + marco
  function Kplywood(scene, x) {
    const g = new THREE.Group(); g.position.set(x, 0, WZ); scene.add(g);
    const fr = lam(tSill, 0xe0d0c0);
    B(1.2, 0.08, 0.12, fr, 0, 2.12, 0.03, g); B(0.08, 1.2, 0.12, fr, -0.58, 1.55, 0.03, g); B(0.08, 1.2, 0.12, fr, 0.58, 1.55, 0.03, g);
    B(1.4, 0.05, 0.22, lam(tSill), 0, 0.93, 0.08, g);
    B(1.45, 1.35, 0.03, lam(L.rep(tPly, 2, 2)), 0, 1.55, 0.11, g);
    const scr = L.basic(null, 0x3a3a3a);
    for (let i = 0; i < 5; i++) for (const yy of [0.93, 2.17]) B(0.025, 0.025, 0.01, scr, -0.62 + i * 0.31, yy, 0.13, g);
    for (let j = 1; j < 4; j++) for (const xx of [-0.66, 0.66]) B(0.025, 0.025, 0.01, scr, xx, 0.93 + j * 0.31, 0.13, g);
    // puntal 2x4 en diagonal al suelo (como en 15_brace)
    const st = B(0.09, 1.6, 0.04, lam(L.rep(tStud, 1, 4)), 0.25, 0.85, 0.32, g); st.rotation.x = -0.32; st.rotation.z = 0.08;
    return g;
  }
  // alfombra de pared sovietica (parcialmente visible) + clavos de colgar
  function Krug(scene, x, y) {
    const g = new THREE.Group(); g.position.set(x, y, WZ + 0.015); scene.add(g);
    L.plane(1.5, 2.1, lam(tRug), 0, 0, 0, g);
    const fr = lam(null, 0xe6d6b0); for (let i = 0; i < 12; i++) B(0.02, 0.05, 0.01, fr, -0.7 + i * 0.127, -1.07, 0.005, g);   // flecos
    return g;
  }

  // ---------- zombi (06: aparece detras del hombro de Ava al final) ----------
  async function Kzombie(name, clipName, { h = 1.8, tex = null } = {}) {
    const g = await L.loadModel(`models/${name}.glb`);
    const root = L.ps1Clone(g.scene);
    if (tex) { const t = await L.loadTex(tex, 256); t.flipY = false; t.needsUpdate = true; root.traverse((o) => { if (o.isMesh) { o.material.map = t; o.material.color.set(0xffffff); o.material.needsUpdate = true; } }); }
    root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), clip = THREE.AnimationClip.findByName(g.animations, clipName), act = mixer.clipAction(clip); act.play();
    let hip = null; root.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; });
    const hip0 = hip.position.clone();
    return { root: wrap, set(t) { act.time = ((t % clip.duration) + clip.duration) % clip.duration; mixer.update(0); hip.position.x = hip0.x; hip.position.z = hip0.z; } };
  }

  // ===================== 06_friction (11.5-14.55) =====================
  const A = Kroom(); Kshelf(A.scene, -0.55, 21);
  const zom = await Kzombie('city-zombie', 'Zombie_Idle', { h: 1.72 });
  A.scene.add(zom.root);
  const T06 = 11.5;
  const s06 = {
    scene: A.scene, camera: A.camera,
    update(lt) {
      const tg = T06 + lt, tStill = W('still') - T06, tCare = W('care') - T06 - 0.15, tFeel = W('feelings') - T06;
      // ojos cerrados y suspiro en "still", mira a camara, guino + sonrisa en "feelings"
      const eyes = lt > tFeel + 0.1 ? 'wink' : lt > tStill - 0.05 && lt < tStill + 0.5 ? 'blink' : lt > 0.55 && lt < 0.65 ? 'blink' : 'open';
      const mouth = lt > tFeel + 0.4 ? 'smile' : mouthAt(tg, 'smile');
      A.ch.pose(lt, [L.seg('idle', 0, { loop: true, speed: 0.6 }), L.seg('shrug', tCare, { speed: 0.8, fade: 0.2 })], [[-99, eyes, mouth]]);
      // suspiro: el pecho baja un poco en "still" (solo Ava entera 1 cm, suave, sin vibracion)
      A.ch.root.position.y = -0.012 * Math.sin(Math.PI * clamp01((lt - tStill) / 0.6));
      A.ch.lookAt(A.camera, 1, 40);
      // zombi: entra por la derecha detras de ella a partir de 2.6 s y se queda junto a su hombro (congelado en 3.0 para YOU DIED)
      const k = L.smooth(clamp01((lt - 2.55) / 0.4));
      zom.root.visible = lt > 2.5;
      zom.root.position.set(L.lerp(0.95, 0.3, k), 0, -0.7); zom.root.rotation.y = L.lerp(-1.4, -0.35, k);
      zom.set(L.q15(lt) * 0.9);
    },
    overlay(lt, dt, a, o) {   // al aparecer el zombi la imagen se apaga un poco y se tine de rojo
      const k = L.smooth(clamp01((lt - 2.7) / 0.3));
      if (k > 0) { o.tctx.fillStyle = `rgba(60,0,0,${0.22 * k})`; o.tctx.fillRect(0, 0, L.LW, L.LH); }
    },
  };

  // ===================== 14_nope (39.2-40.9): ventana tapada con contrachapado =====================
  const Bn = Kroom(); Kplywood(Bn.scene, 0.35);
  const T14 = 39.2;
  const s14 = {
    scene: Bn.scene, camera: Bn.camera,
    update(lt) {
      const tg = T14 + lt, tOh = W('oh', 39) - T14, tNope = W('nope') - T14;
      const eyes = lt < tOh ? 'open' : lt < tNope - 0.05 ? 'shocked' : 'half';
      const base = lt < tOh ? 'neutral' : lt < tNope ? 'surprised' : 'frown';
      const sh0 = tNope - 0.1;
      Bn.ch.pose(lt, [L.seg('idle', 0, { loop: true, speed: 0.6 }), L.seg('surprised', tOh - 0.05, { fade: 0.15, speed: 0.9 }), L.seg('shake_head', sh0, { fade: 0.15, speed: 1.1 })], [[-99, eyes, mouthAt(tg, base)]]);
      // durante el "no" la mirada a camara se suelta para que se vea el gesto de negar
      const shk = clamp01((lt - sh0) / 0.15) * (1 - clamp01((lt - sh0 - 0.95) / 0.2));
      Bn.ch.lookAt(Bn.camera, 1 - 0.8 * shk, 40);
    },
  };

  // ===================== 16_congrats (44.6-48.55): pared con alfombra =====================
  const Cg = Kroom(); Krug(Cg.scene, 0.55, 1.55); Kshelf(Cg.scene, -1.25, 37);
  Cg.camera.position.set(0, 1.33, 1.3); Cg.camera.lookAt(0, 1.37, 0);   // un poco mas lejos: el puno en alto entra en cuadro
  const T16 = 44.6;
  const s16 = {
    scene: Cg.scene, camera: Cg.camera,
    update(lt) {
      const tg = T16 + lt, tWin = W('window', 44) - T16;
      const eyes = lt > 0.25 && lt < 0.33 ? 'blink' : 'happy';
      Cg.ch.pose(lt, [L.seg('idle', 0, { loop: true, speed: 0.6 }), L.seg('cheer', tWin - 0.85, { fade: 0.2, speed: 1.1 })], [[-99, eyes, mouthAt(tg, lt > tWin + 0.2 ? 'smileOpen' : 'smile')]]);
      Cg.ch.lookAt(Cg.camera, 1, 40);
    },
  };

  // ===================== 18_fudge (49.3-50.7) =====================
  const Fd = Kroom(); Krug(Fd.scene, 0.6, 1.55);
  const T18 = 49.3;
  const s18 = {
    scene: Fd.scene, camera: Fd.camera,
    update(lt) {
      const tg = T18 + lt, tOh = W('oh', 49) - T18, tFud = W('fudge') - T18;
      const eyes = lt < tOh ? 'open' : lt < tFud ? 'half' : 'angry';
      const base = lt < tFud ? 'frown' : 'frown';
      Fd.ch.pose(lt, [L.seg('idle', 0, { loop: true, speed: 0.6 }), L.seg('pinch_nose', tFud - 0.2, { fade: 0.2 })], [[-99, eyes, mouthAt(tg, base)]]);
      // pequeno bajon de hombros en "fudge": Ava baja 1,5 cm y se inclina un pelo (suave, sin temblor)
      const s = L.smooth(clamp01((lt - tFud) / 0.3));
      Fd.ch.root.position.y = -0.015 * s; Fd.ch.root.rotation.x = 0.04 * s;
      Fd.ch.lookAt(Fd.camera, 1, 40);   // con la mirada a camara pinch_nose queda en puno apretado delante del pecho
    },
    // v2: el usuario quito la marca de enfado (💢)
  };

  return { '06_friction': s06, '14_nope': s14, '16_congrats': s16, '18_fudge': s18 };
}
