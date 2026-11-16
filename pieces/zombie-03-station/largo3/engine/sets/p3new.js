// sets/p3new.js — LARGO 3 ("Day 3: The Way Out"): decorados NUEVOS en codigo (look PS1, texturas 16-64 px nearest).
// Mundos: ALCANTARILLA (boveda de ladrillo, bordes laterales, canal con agua que corre, escalera al pozo con luz de la rejilla,
//   COMPUERTA de hierro con palanca y PLATAFORMA de mantenimiento encima, horda variada), CAMARA de cruce (tres bocas iguales),
//   CUARTO DE OBREROS (catre, radio muerta, maquina de escribir, taquillas, hierbas), BOSQUE de noche (desague pluvial, arboles
//   pelados, niebla, hojas mojadas, cuervos quietos, Osa Mayor + Polar, huellas gigantes), MANSION (exterior propio: rejas
//   abiertas, hiedra, 3 pisos de ventanas negras; VESTIBULO con marmol, escalera principal, cuadro de familia, chimenea, araña;
//   PASILLO de arriba con lamparas de aceite; CUARTO del muerto de esmoquin; DESVAN con la radio y la ventana al amanecer),
//   el STALKER (largo3/stalker, animado por huesos) y el MENU final 1 RUN / 2 FIGHT con cuenta atras.
// Tiempos: SIEMPRE anclados a palabras (ctx.at). Contrato: ../SETS.md.
import { kit, bitText, textWidth } from './r2kit.js';
import { loadDog } from './dog.js';
import { makePerson } from './p2people.js';
import { paintScared } from './avaface.js';

export function sfx() { return []; }

export async function shots(ctx) {
  const { L, TL } = ctx;
  const K = kit(ctx), { THREE, LW, LH, V, px, B, cyl, lam, basic, DS, cam, look, vignette, label, tConcrete, tMetal, tWood, tGlow } = K;
  const at = (tk, k = 0) => ctx.at(tk, k);
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cr = (keys, t) => { if (t <= keys[0][0]) return V(keys[0][1], keys[0][2], keys[0][3]); let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const k = (j) => keys[Math.max(0, Math.min(keys.length - 1, j))], [a, b, c, d] = [k(i - 1), k(i), k(i + 1), k(i + 2)], u = Math.min(1, (t - b[0]) / (c[0] - b[0])), u2 = u * u, u3 = u2 * u;
    const f = (j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3); return V(f(1), f(2), f(3)); };
  const talkOf = (takes) => (t) => { for (const tk of takes) for (const w of ctx.words(tk) || []) if (t >= w[1] && t <= w[2]) return 0.5 + 0.5 * Math.abs(Math.sin((t - w[1]) * 18)); return 0; };
  const marlaTalk = talkOf(['g3', 'g5', 'g6', 'g11']);
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const out = {}; let LT = 0;
  const mkAva = (scene) => { const ch = L.hero(); paintScared(ch); scene.add(ch.root); const fl = K.flashlight(ch, scene); fl.hide(); return { ch, fl }; };
  const AVA = (ch, x, z, yaw, y = 0) => { ch.root.visible = true; ch.root.position.set(x, y, z); ch.root.rotation.y = yaw; };
  const lights = (scene, { amb = 0.7, hemi = 0.5, col = 0xffffff, sky = 0x9ab0d8, gnd = 0x403830 } = {}) => { const a = new THREE.AmbientLight(col, amb), h = new THREE.HemisphereLight(sky, gnd, hemi); scene.add(a, h); return { a, h }; };
  const floorPlane = (scene, w, d, tex, rx, ry, x = 0, z = 0, y = 0.001, col = 0xffffff) => { const g = new THREE.PlaneGeometry(w, d, Math.ceil(w / 0.5), Math.ceil(d / 0.5)); const o = L.mesh(g, lam(L.rep(tex, rx, ry), col), x, y, z, scene); o.rotation.x = -Math.PI / 2; return o; };
  const wallBox = (scene, w, h, d, tex, rx, ry, x, y, z, col = 0xffffff) => B(w, h, d, lam(L.rep(tex, rx, ry), col), x, y, z, scene);
  const far = (c, f = 420) => { c.far = f; c.updateProjectionMatrix(); return c; };
  // ---------- texturas ----------
  const tBrick = (seed, base = [118, 62, 44], mortar = '#3a3028') => L.cvs(64, 64, (c) => { const r = L.rng(seed); px(c, 0, 0, mortar, 64, 64);
    for (let row = 0; row < 8; row++) for (let k = 0; k < 5; k++) { const x0 = k * 16 + (row & 1) * 8 - 8, y0 = row * 8, n = r() * 28 - 14; px(c, x0 + 1, y0 + 1, K.rgb(base[0] + n, base[1] + n * 0.7, base[2] + n * 0.6), 14, 6); px(c, x0 + 1, y0 + 1, K.rgb(base[0] + n + 18, base[1] + n + 10, base[2] + n + 6), 14, 1); }
    for (let k = 0; k < 50; k++) px(c, r() * 64 | 0, r() * 64 | 0, 'rgba(40,60,24,0.45)', 1 + (r() * 3 | 0), 1 + (r() * 2 | 0));
    for (let k = 0; k < 7; k++) { const x = r() * 64 | 0; for (let y = 0; y < 64; y++) if (r() < 0.55) px(c, x, y, 'rgba(16,20,12,0.28)', 1, 1); } });
  const tStone = (seed, base = [92, 86, 76]) => L.cvs(64, 64, (c) => { const r = L.rng(seed); px(c, 0, 0, '#2a2620', 64, 64);
    for (let row = 0; row < 8; row++) for (let k = 0; k < 4; k++) { const x0 = k * 16 + (row & 1) * 8 - 8, y0 = row * 8, n = r() * 30 - 15; px(c, x0 + 1, y0 + 1, K.rgb(base[0] + n, base[1] + n, base[2] + n), 14, 6); px(c, x0 + 2, y0 + 1, K.rgb(base[0] + n + 18, base[1] + n + 16, base[2] + n + 12), 12, 1); }
    for (let k = 0; k < 40; k++) px(c, r() * 64 | 0, r() * 64 | 0, 'rgba(40,60,30,0.35)', 1 + (r() * 2 | 0), 1); });
  const tNoise = (seed, A, Bc, w = 32, h = 32, spots) => L.cvs(w, h, (c) => { const r = L.rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = r(); px(c, x, y, K.rgb(A[0] + (Bc[0] - A[0]) * k, A[1] + (Bc[1] - A[1]) * k, A[2] + (Bc[2] - A[2]) * k)); } if (spots) spots(c, r); });
  const tWater = L.cvs(32, 64, (c) => { const r = L.rng(951); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 14; px(c, x, y, K.rgb(30 + n, 40 + n, 30 + n * 0.6)); } for (let k = 0; k < 40; k++) px(c, r() * 32 | 0, r() * 64 | 0, r() < 0.5 ? '#7a8a6a' : '#a8b898', 1, 3 + (r() * 6 | 0)); });
  const tFoam = L.cvs(16, 64, (c) => { const r = L.rng(952); c.clearRect(0, 0, 16, 64); for (let k = 0; k < 70; k++) px(c, r() * 16 | 0, r() * 64 | 0, `rgba(220,228,210,${0.3 + r() * 0.5})`, 1 + (r() * 2 | 0), 2 + (r() * 4 | 0)); });
  const flowM = []; const flowTex = (t0, rx, ry, col = 0xffffff, extra = {}) => { const tx = L.rep(t0, rx, ry); const m = basic(tx, col, extra); flowM.push(m); return m; };
  const flow = (t, k = 1) => { for (const m of flowM) m.map.offset.y = (m.userData.dir ?? 1) * L.q15(t) * 0.9 * k; };

  // ---------- zombis variados (modelos propios de cada clip, manos del modelo; ropa, piel, altura y cabeza distintas) ----------
  const GLB = {}; const getG = async (n) => GLB[n] || (GLB[n] = await L.loadModel(`models/${n}.glb`));
  const city = await getG('city-zombie');
  city.scene.traverse((o) => { if (!o.isMesh || o.userData.uvFix) return; o.userData.uvFix = 1; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); });
  const thinTex = await L.loadTex('tex/thin_zombie.png', 256); thinTex.flipY = false; thinTex.needsUpdate = true;
  const skinT = (seed, base) => tNoise(seed, base, base.map((v) => v - 30), 32, 32, (c, r) => { for (let k = 0; k < 12; k++) px(c, r() * 30 | 0, r() * 30 | 0, r() < 0.5 ? '#4a0a08' : '#2a3020', 1 + (r() * 3 | 0), 1 + (r() * 3 | 0)); });
  const SKINS = [skinT(961, [150, 156, 130]), skinT(962, [168, 150, 140]), skinT(963, [120, 130, 120]), skinT(964, [140, 112, 96])];
  const outfit = (seed, top, pat, bot, extra) => L.cvs(32, 64, (c) => { const r = L.rng(seed), [tr, tg, tb] = top, [br, bg, bb] = bot;
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { let k = 1; if (pat === 'plaid') k = x % 8 < 2 || y % 8 < 2 ? 0.6 : 1; else if (pat === 'stripe') k = y % 6 < 2 ? 1.35 : 1; else if (pat === 'knit') k = (x + y) % 4 < 1 ? 0.82 : 1; const n = r() * 14 - 7; px(c, x, y, K.rgb(tr * k + n, tg * k + n, tb * k + n)); }
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 14 - 7 + (x % 16 === 0 ? -14 : 0); px(c, x, y, K.rgb(br + n, bg + n, bb + n)); }
    if (extra) extra(c, r); for (let k = 0; k < 6 + (seed % 4); k++) px(c, Math.floor(r() * 30), Math.floor(r() * 60), r() < 0.6 ? '#4a0806' : '#2a2018', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3)); });
  const OUT = [outfit(971, [120, 40, 36], 'plaid', [52, 60, 84]), outfit(972, [210, 214, 206], 'solid', [70, 70, 76]), outfit(973, [40, 70, 120], 'solid', [30, 34, 40], (c) => { c.fillStyle = '#d8c040'; c.fillRect(0, 12, 32, 3); }),
    outfit(974, [96, 98, 104], 'solid', [80, 82, 88], (c) => { c.fillStyle = '#e8e4dc'; c.fillRect(13, 0, 6, 32); c.fillStyle = '#6a1418'; c.fillRect(15, 2, 2, 22); }), outfit(975, [240, 200, 40], 'stripe', [30, 30, 36]),
    outfit(976, [120, 84, 56], 'knit', [168, 150, 110]), outfit(977, [230, 120, 30], 'solid', [52, 70, 100], (c) => { c.fillStyle = '#e8e8a0'; c.fillRect(0, 18, 32, 3); }), outfit(978, [60, 110, 70], 'solid', [40, 40, 44]), outfit(979, [70, 60, 90], 'knit', [60, 50, 40])];
  async function makeZ(scene, kind, h, matFn, tint = 0xffffff) {
    const g = await getG(kind), root = L.ps1Clone(g.scene);
    root.traverse((o) => { if (!o.isMesh) return; if (matFn) o.material = matFn(o.material.name || '', o.material); for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { m.side = DS; m.color.multiply(new THREE.Color(tint)); } });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y); root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), acts = {}; const clip = (n) => THREE.AnimationClip.findByName(g.animations, n);
    const act = (n) => acts[n] || (acts[n] = (() => { const a = mixer.clipAction(clip(n)); a.play(); a.setEffectiveWeight(0); return a; })());
    let hip = null; root.traverse((o) => { if (o.isSkinnedMesh && !hip) hip = o.skeleton.bones[0]; }); const hip0 = hip.position.clone();
    const bone = (re) => { let b = null; root.traverse((o) => { if (!b && re.test(o.name)) b = o; }); return b; };
    const head = bone(/(^head|Head)$/); scene.add(wrap);
    return { wrap, root, head, kind, pose(n, t) { if (!head.userData.q0) head.userData.q0 = head.quaternion.clone(); head.quaternion.copy(head.userData.q0); for (const a of Object.values(acts)) a.setEffectiveWeight(0); const a = act(n), d = a.getClip().duration; a.time = ((t % d) + d) % d; a.setEffectiveWeight(1); mixer.update(0); hip.position.x = hip0.x; hip.position.z = hip0.z; if (this.tilt) { head.rotateZ(this.tilt[0]); head.rotateX(this.tilt[1]); } } };
  }
  async function horde(scene, n, seed = 1) {
    const Z = [];
    for (let i = 0; i < n; i++) { const j = i + seed, h = 1.64 + ((j * 7) % 9) * 0.03; let z;
      if (j % 4 === 2) { z = await makeZ(scene, 'thin-zombie', h * 1.02, () => L.lam(thinTex), [0xffffff, 0xc8d0b8, 0xd8c0b0][j % 3]); z.walk = 'walk'; z.idle = 'idle'; }
      else { z = await makeZ(scene, 'city-zombie', h, (nm) => nm.includes('Outfit') ? L.lam(OUT[(j * 5) % OUT.length]) : nm.includes('Body') ? L.lam(SKINS[j % SKINS.length]) : L.lam(null, [0x2a2018, 0x6a6460, 0x5a3a20, 0x18120e][j % 4]), [0xffffff, 0xd8d0c8, 0xc8d0d8, 0xe0d8b8][j % 4]); z.walk = j % 3 ? 'Zombie_Walk' : 'Walking'; z.idle = j % 2 ? 'Zombie_Idle2' : 'Zombie_Idle'; }
      z.wrap.scale.set(0.92 + ((j * 13) % 5) * 0.04, 1, 0.95 + ((j * 7) % 3) * 0.04); z.tilt = [((j * 13) % 7 - 3) * 0.08, ((j * 5) % 5 - 2) * 0.07]; z.ph = (j * 0.37) % 1; Z.push(z); }
    return Z;
  }

  // ---------- STALKER (largo3/stalker/stalker_ps1.glb, 19 huesos, sin animaciones: todo por huesos como Lisa en P.T.) ----------
  const SG = await L.loadModel('models/stalker_ps1.glb'); const CR = Number(L.QS.get('cr') ?? -1);   // signo de la flexion (probado en stills)
  function makeStalker(scene) {
    const root = L.ps1Clone(SG.scene); const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = 2.6 / (bb.max.y - bb.min.y); root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k; scene.add(wrap);
    const bn = {}; root.traverse((o) => { if (o.isBone) bn[o.name] = o; }); const q0 = {}; for (const [n, b] of Object.entries(bn)) q0[n] = b.quaternion.clone(); const hp0 = bn.hips ? bn.hips.position.clone() : null;
    const eye = L.mesh(new THREE.SphereGeometry(0.03, 6, 4), basic(null, 0x6aff7a), 0, 0, 0); eye.visible = false;   // luz verde de la caja del pecho (parpadeo tenue)
    const boxL = new THREE.PointLight(0x5aff6a, 0.6, 1.6, 1.5); if (bn.chest) { bn.chest.add(boxL); boxL.position.set(0, 0.2 / root.scale.x, 0.3 / root.scale.x); }
    /** walk: fase de paso (0..1 = un paso por pierna), w = 0 quieto .. 1 caminando; tilt cabeza; grip 0 abierta .. 1 cerrada; duck 0..1; look pitch */
    function pose({ ph = 0, w = 0, tilt = 0, grip = 0, duck = 0, pitch = 0, yawHead = 0, t = 0, crouch = 0, reach = 0 } = {}) {
      for (const [n, b] of Object.entries(bn)) b.quaternion.copy(q0[n]); if (hp0) bn.hips.position.copy(hp0);
      const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
      const R = (n, ax, a) => { const b = bn[n]; if (b) b.rotateOnAxis(ax, a); }, X = V(1, 0, 0), Y = V(0, 1, 0), Z = V(0, 0, 1);
      R('thighL', X, -0.42 * s * w); R('thighR', X, 0.42 * s * w); R('shinL', X, 0.5 * Math.max(0, -c) * w); R('shinR', X, 0.5 * Math.max(0, c) * w);
      if (hp0) bn.hips.position.y = hp0.y - (0.035 * Math.abs(s) * w + 0.62 * crouch) / root.scale.x;
      R('thighL', X, CR * 1.25 * crouch); R('thighR', X, CR * 1.25 * crouch); R('shinL', X, -CR * 1.9 * crouch); R('shinR', X, -CR * 1.9 * crouch); R('spine', X, 0.45 * crouch); R('upperarmL', X, -CR * 1.1 * reach); R('upperarmR', X, -CR * 1.1 * reach);
      R('spine', Z, 0.05 * s * w); R('chest', X, 0.18 * duck + 0.04); R('spine', X, 0.35 * duck); R('chest', Y, -0.06 * s * w);
      R('upperarmL', X, 0.16 * s * w); R('upperarmR', X, -0.16 * s * w); R('forearmL', X, -0.25); R('forearmR', X, -0.25);
      R('neck', X, -0.2 * duck - pitch * 0.4); R('head', Z, tilt); R('head', X, -pitch * 0.6); R('head', Y, yawHead);
      for (const sd of ['L', 'R']) { const sg = sd === 'L' ? -1 : 1; R('fingers' + sd, Z, sg * 1.5 * grip); R('fingers' + sd, X, 0.6 * grip); R('thumb' + sd, Z, -sg * 0.9 * grip); R('hand' + sd, Z, sg * 0.35 * grip); }
      boxL.intensity = 0.4 + 0.3 * (Math.floor(t * 2.5) % 2);
    }
    return { wrap, root, bn, pose };
  }

  // ---------- pistola negra (cajas con textura de pavonado) en la mano derecha de Ava ----------
  const tGun = L.cvs(32, 16, (c) => { const r = L.rng(981); for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) px(c, x, y, K.rgb(30 + r() * 10, 31 + r() * 10, 35 + r() * 10)); px(c, 0, 0, '#7a8088', 32, 1); for (let x = 22; x < 31; x += 2) px(c, x, 2, '#0a0a0c', 1, 6); px(c, 10, 3, '#5a5e66', 6, 3); });
  const mkGun = () => { const g = new THREE.Group(), mS = lam(tGun), mF = lam(null, 0x18181b), mG = lam(L.cvs(8, 8, (c) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) px(c, x, y, (x + y) % 2 ? '#141416' : '#34363a'); }));
    B(0.19, 0.034, 0.03, mS, 0, 0.02, 0, g); B(0.17, 0.02, 0.028, mF, -0.01, -0.005, 0, g); const gr = B(0.035, 0.11, 0.03, mG, -0.065, -0.06, 0, g); gr.rotation.z = 0.25;
    const tg = L.mesh(new THREE.TorusGeometry(0.018, 0.004, 4, 8, Math.PI), mF, -0.02, -0.018, 0, g); tg.rotation.z = Math.PI; B(0.008, 0.01, 0.008, mF, 0.09, 0.042, 0, g); return g; };
  const giveGun = (ava) => { const g = mkGun(); L.holdIn(ava.ch, g, 'R', [0, 0.62, 0.32], [0, Math.PI / 2, Math.PI / 2]); g.visible = false; ava.gun = g; return g; };

  // ---------- primeros planos (mismos que el largo 2) ----------
  const ANG = { q: [0.32, 0.0, 0.9], profile: [0.95, 0.02, 0.22], low: [0.25, -0.32, 0.95], ots: [-0.28, 0.12, -0.75], front: [0.04, 0.02, 1.0], high: [0.2, 0.42, 0.8], qL: [-0.34, 0.0, 0.9] };
  const neckBand = (ch) => { if (ch.root.userData.nb) return; const NB = ch.bone.getObjectByName('Neck'); const m = L.lam(null, 0xc8a08a); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.07, 10, 1, true), m); band.material.side = THREE.DoubleSide;
    ch.root.updateMatrixWorld(true); const np = NB.getWorldPosition(V()); band.position.copy(np).add(V(0, 0.035, 0.008)); ch.root.add(band); band.updateMatrixWorld(true); NB.attach(band); ch.root.userData.nb = band; };
  const thinkShot = (W, { id, x, z, yaw, y = 0, clip = 'idle', from = 0.3, still = true, faces, ang = 'q', camOff, lookAt, flash = false, mouth = false, extra, ov, fov = 34 }) => {
    const c = cam(fov); neckBand(W.ava.ch);
    out[id] = { scene: W.scene, camera: c,
      update(lt, t) { W.reset && W.reset(t, lt); const { ch, fl } = W.ava; fl.unaim(); AVA(ch, x, z, yaw, y);
        const fc = (faces || [[-99, 'half', 'neutral']]).map(([tt, e, m]) => [tt, e, mouth ? K.mouthAt(t, m) : m]);
        let eyeRef = null; if (!still) { ch.pose(lt, L.still(clip, from), fc); ch.root.updateMatrixWorld(true); eyeRef = ch.bone.getObjectByName('Head').getWorldPosition(V()).add(V(0, 0.11, 0)); }   // v3: al caminar la camara no sigue el cabeceo
        ch.pose(lt, still ? L.still(clip, from) : [L.seg(clip, 0, { loop: true, speed: 0.6 })], fc);
        if (lookAt) ch.lookAt({ position: lookAt }, 0.8, 40); ch.root.updateMatrixWorld(true);
        const eye = eyeRef || ch.bone.getObjectByName('Head').getWorldPosition(V()).add(V(0, 0.11, 0));
        const fw = V(Math.sin(yaw), 0, Math.cos(yaw)), rt = V(Math.cos(yaw), 0, -Math.sin(yaw));
        const o1 = camOff || ANG[ang], u = L.smooth(L.clamp01(lt / 6)), k = 1 - 0.18 * u;
        const p = eye.clone().addScaledVector(rt, o1[0] * k).addScaledVector(fw, o1[2] * k); p.y += o1[1] * k;
        look(c, p, eye.clone().add(V(0, -0.1, 0)));
        if (flash) { fl.show(); fl.aim(eye.clone().addScaledVector(fw, 3).add(V(0, -1.0, 0)), 1); fl.on(true, c, eye.clone().addScaledVector(fw, 3), 1, false, 10); } else fl.hide();
        if (extra) extra(lt, t, c); },
      overlay(lt, dt, a, o) { vignette(o, 0.45, 0.3); if (ov) ov(lt, o, c, this.t0 + lt); } };
  };
  /** plano generico: setup(lt, t, c) coloca personajes; cam = keys [[t,x,y,z]...] (o funcion) mirando a tgt (V o funcion) */
  const shot = (id, W, fov, setup, keys, tgt, ov, vig = 0.45) => { const c = cam(fov); if (W.far) far(c, W.far);
    out[id] = { scene: W.scene, camera: c, update(lt, t) { LT = lt; W.reset && W.reset(t, lt); if (setup) setup(lt, t, c); const p = typeof keys === 'function' ? keys(lt, t) : cr(keys, lt); look(c, p, typeof tgt === 'function' ? tgt(lt, t) : tgt); if (W.post) W.post(lt, t, c); },
      overlay(lt, dt, a, o) { vignette(o, vig, 0.3); if (ov) ov(lt, o, this, this.t0 + lt); } }; };
  const lab = (o, s, x, y, col, tk, w, tgt) => label(o, s, x, y, col, tgt || null, ease(at(tk, w) - 0.1, at(tk, w) + 0.1, o.__t));
  const LB = (fn) => (lt, o, sh, t) => { o.__t = t; fn(lt, o, sh, t); };

  // =====================================================================================================================
  // ALCANTARILLA: boveda de ladrillo (eje -z, x = 0), bordes x |1.0..2.3| a y = 0, canal y = -0.6 con agua a y = -0.28.
  // Pozo con escalera en z = 0 (pared izq.), compuerta en z = -30 con palanca, plataforma encima (lado cercano z > -30).
  // =====================================================================================================================
  const tB = tBrick(1001), tB2 = tBrick(1002, [96, 70, 52]), tCurb = tStone(1003, [104, 100, 90]);
  function tunnel(s, { z0, z1, R = 2.3, yS = 1.3, tex = tB }) {
    const len = z0 - z1, zc = (z0 + z1) / 2, N = 10;
    for (let i = 0; i < N; i++) { const am = Math.PI * (i + 0.5) / N, w = 2 * R * Math.sin(Math.PI / N / 2) * 1.06; const m = B(w, 0.15, len, lam(L.rep(tex, 1, len / 2)), Math.cos(am) * (R + 0.07), yS + Math.sin(am) * (R + 0.07), zc, s); m.rotation.z = am - Math.PI / 2; }
    for (const sx of [-1, 1]) { wallBox(s, 0.2, yS + 0.6, len, tex, len / 2, 1, sx * (R + 0.1), (yS - 0.6) / 2, zc);
      B(R - 1.0, 0.6, len, lam(L.rep(tCurb, 1, len / 2), 0xb0a898), sx * (1.0 + (R - 1.0) / 2), -0.3, zc, s);   // borde
      B(0.16, 0.08, len, lam(null, 0x7a766a), sx * 1.06, 0.04, zc, s);   // bordillo
      const pp = cyl(0.07, 0.07, len, 8, lam(L.rep(tMetal(1004, '#4a4a42'), 1, len), 0xffffff), sx * (R - 0.12), 0.95, zc, s); pp.rotation.x = Math.PI / 2;
      const pp2 = cyl(0.045, 0.045, len, 6, lam(null, 0x6a4a2a), sx * (R - 0.1), 0.6, zc, s); pp2.rotation.x = Math.PI / 2;
      for (let z = z0 - 1; z > z1; z -= 2.2) { B(0.2, 0.08, 0.05, lam(null, 0x5a3a1a), sx * (R - 0.08), 0.95, z, s); } }
    B(2.0, 0.1, len, lam(L.rep(tB2, 2, len / 2), 0x8a8478), 0, -0.6, zc, s);   // fondo del canal
    const wat = L.plane(2.0, len, flowTex(tWater, 2, len / 3, 0xb8c0a8), 0, -0.28, zc, s, 0, -Math.PI / 2); wat.material.userData.dir = 1;
    for (const sx of [-1, 1]) { const f = L.plane(0.3, len, flowTex(tFoam, 1, len / 4, 0xffffff, { transparent: true, depthWrite: false }), sx * 0.82, -0.27, zc, s, 0, -Math.PI / 2); f.renderOrder = 2; }
    // desagues laterales que escupen agua al canal + manchas de oxido y musgo
    const R2 = L.rng(Math.round(z0 * 7 + 1009));
    for (let z = z0 - 4; z > z1 + 2; z -= 7 + R2() * 4) { const sx = R2() < 0.5 ? -1 : 1; L.mesh(new THREE.CircleGeometry(0.22, 8), basic(null, 0x050505), sx * (R + 0.0), 0.35, z, s).rotation.y = -sx * Math.PI / 2;
      const ring = L.mesh(new THREE.TorusGeometry(0.24, 0.05, 4, 10), lam(null, 0x6a6058), sx * (R - 0.01), 0.35, z, s); ring.rotation.y = Math.PI / 2;
      const st = L.plane(0.16, 0.9, flowTex(tFoam, 1, 2, 0xc8d0c0, { transparent: true, depthWrite: false, side: DS }), sx * (R - 0.25), -0.05, z, s, Math.PI / 2); st.renderOrder = 2; }
    const tStain = L.cvs(16, 32, (c) => { c.clearRect(0, 0, 16, 32); const r = L.rng(1010); for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) if (r() < (1 - y / 32) * 0.7 * (1 - Math.abs(x - 8) / 9)) px(c, x, y, r() < 0.5 ? 'rgba(80,40,14,0.6)' : 'rgba(30,50,20,0.55)'); });
    for (let z = z0 - 2; z > z1; z -= 3 + R2() * 3) { const sx = R2() < 0.5 ? -1 : 1, m = L.plane(0.7, 1.4, basic(tStain, 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), sx * (R - 0.001), 1.6 - R2() * 0.4, z, s, -sx * Math.PI / 2); m.renderOrder = 2; }
    // lamparas enjauladas de obra (luz tenue amarilla) cada 10 m
    for (let z = z0 - 5; z > z1; z -= 10) { const sx = (Math.round(z) % 20 === 0) ? 1 : -1; L.mesh(new THREE.SphereGeometry(0.07, 6, 4), basic(null, 0xffe8a0), sx * (R - 0.15), 1.85, z, s); for (const dy of [-0.08, 0.08]) L.mesh(new THREE.TorusGeometry(0.08, 0.008, 3, 8), lam(null, 0x2a2a2a), sx * (R - 0.15), 1.85 + dy, z, s).rotation.x = Math.PI / 2;
      const pl = new THREE.PointLight(0xffd890, 1.6, 9, 1.0); pl.position.set(sx * (R - 0.4), 1.8, z); s.add(pl); }
  }
  const SW = { scene: new THREE.Scene() }; { const s = SW.scene; s.background = new THREE.Color(0x050806); s.fog = new THREE.Fog(0x050806, 4, 24); SW.lit = lights(s, { amb: 1.05, hemi: 0.7, sky: 0x9ab098, gnd: 0x403020 });   // relleno alto: sin bandas duras en la cara
    tunnel(s, { z0: 6, z1: -58 });
    // pozo + escalera (pared izquierda, z = 0) con la luz azul de la rejilla de la calle
    for (const dz of [-0.22, 0.22]) B(0.05, 3.8, 0.05, lam(null, 0x5a3a1e), -2.12, 1.5, dz, s); for (let k = 0; k < 12; k++) B(0.05, 0.04, 0.48, lam(null, 0x6a4422), -2.12, -0.1 + k * 0.3, 0, s);   // v3: la escalera sube hasta el pozo
    const shaft = cyl(0.55, 0.55, 2.4, 10, lam(L.rep(tB, 2, 2), 0x8a8a8a, { side: THREE.BackSide }), -1.75, 4.6, 0, s); void shaft;
    L.mesh(new THREE.CircleGeometry(0.5, 10), basic(null, 0x8aa8d8), -1.75, 5.7, 0, s).rotation.x = Math.PI / 2;
    SW.shaftL = new THREE.SpotLight(0x9ab8ff, 14, 10, 0.35, 0.6, 1.0); SW.shaftL.position.set(-1.7, 5.2, 0); SW.shaftL.target.position.set(-1.6, 0, 0.2); s.add(SW.shaftL, SW.shaftL.target);
    { const a = Math.acos(-1.75 / 2.3), hole = new THREE.Group(); hole.position.set(Math.cos(a) * 2.2, 1.3 + Math.sin(a) * 2.2, 0); hole.lookAt(0, 1.3, 0); s.add(hole); L.mesh(new THREE.CircleGeometry(0.5, 12), basic(null, 0xa8c4f0), 0, 0, 0.01, hole); L.mesh(new THREE.TorusGeometry(0.52, 0.07, 4, 12), lam(null, 0x2a2a28), 0, 0, 0.02, hole); }   // v3: boca ABIERTA (sin barrotes): bajaron por ahi
    // compuerta (z = -30) con cabecero de ladrillo, palanca y plataforma de mantenimiento
    const ZGT = -30; SW.ZGT = ZGT;
    { const hdr = new THREE.Group(); s.add(hdr); for (let i = 0; i < 10; i++) { const am = Math.PI * (i + 0.5) / 10; const m = B(0.5, 1.0, 0.4, lam(L.rep(tB, 1, 1)), Math.cos(am) * 2.0, 1.3 + Math.sin(am) * 2.0 + 0.75, ZGT, hdr); if (Math.sin(am) * 2.0 + 0.75 < 1.0) m.visible = false; m.rotation.z = am - Math.PI / 2; }
      B(4.4, 0.2, 0.45, lam(L.rep(tMetal(1011, '#3a3630'), 4, 1)), 0, 1.98, ZGT, s);   // dintel de hierro
      const G = new THREE.Group(); s.add(G); SW.gate = G; const mI = lam(L.rep(tMetal(1012, '#3a3430'), 1, 4)), mR = lam(L.rep(L.cvs(8, 32, (c) => { const r = L.rng(1013); for (let y = 0; y < 32; y++) px(c, 0, y, K.rgb(96 + r() * 40, 52 + r() * 20, 28), 8, 1); }), 1, 3));
      for (let x = -2.25; x <= 2.26; x += 0.16) B(0.045, 2.5, 0.045, (Math.round(x * 10) % 3) ? mI : mR, x, 0.65, ZGT, G);
      for (const y of [-0.55, 0.4, 1.2, 1.85]) B(4.6, 0.09, 0.07, mR, 0, y, ZGT, G);
      for (let x = -2.25; x <= 2.26; x += 0.16) L.mesh(new THREE.ConeGeometry(0.035, 0.12, 4), mI, x, -0.66, ZGT, G).rotation.x = Math.PI;
      // palanca en la pared izquierda (lado cercano)
      const lv = new THREE.Group(); lv.position.set(-2.18, 1.15, ZGT + 0.8); s.add(lv); B(0.12, 0.5, 0.3, lam(L.rep(tMetal(1014, '#5a3a20'), 1, 1)), 0, 0, 0, lv); B(0.03, 0.02, 0.2, basic(null, 0xd8b020), 0.07, 0.18, 0, lv);
      const arm = new THREE.Group(); arm.position.set(0.1, 0, 0); lv.add(arm); B(0.05, 0.05, 0.5, lam(null, 0x4a4a48), 0.05, 0, 0.25, arm); cyl(0.05, 0.05, 0.14, 8, lam(null, 0xb02a1e), 0.05, 0, 0.5, arm).rotation.x = Math.PI / 2; SW.lever = arm;
      // plataforma (y = 2.5, z -29.75..-28.25, x -2.3..0.5) con barandilla y escalera en la pared izquierda (z -27.7)
      const mP = lam(L.rep(L.cvs(16, 16, (c) => { px(c, 0, 0, '#2a2a2a', 16, 16); for (let i = 0; i < 16; i += 3) { px(c, i, 0, '#5a5a56', 1, 16); px(c, 0, i, '#5a5a56', 16, 1); } }), 6, 3)), mY = lam(null, 0xb89a2a);
      B(2.8, 0.08, 1.5, mP, -0.9, 2.0, ZGT + 1.0, s); for (const x of [-2.25, -1.2, 0.0, 0.48]) { B(0.05, 1.0, 0.05, mY, x, 2.5, ZGT + 0.28, s); }
      for (const z of [ZGT + 0.28, ZGT + 1.72]) { for (const y of [2.5, 2.95]) B(2.8, 0.05, 0.05, mY, -0.9, y, z, s); } for (const x of [-1.8, -0.6]) B(0.05, 1.0, 0.05, mY, x, 2.5, ZGT + 1.72, s);
      SW.workL = new THREE.PointLight(0xffd890, 6, 7, 1.3); SW.workL.position.set(0.1, 3.0, ZGT + 1.0); s.add(SW.workL); L.mesh(new THREE.SphereGeometry(0.08, 6, 4), basic(null, 0xffe8a0), 0.1, 3.2, ZGT + 1.0, s); cyl(0.01, 0.01, 0.35, 4, lam(null, 0x2a2a2a), 0.1, 3.4, ZGT + 1.0, s);
      for (const y of [2.5, 2.95]) B(0.05, 0.05, 1.5, mY, 0.48, y, ZGT + 1.0, s); for (const z of [ZGT + 0.28, ZGT + 1.0, ZGT + 1.72]) B(0.05, 1.0, 0.05, mY, 0.48, 2.5, z, s);
      for (let y = 2.5; y > 0.4; y -= 1.0) B(0.08, 0.08, 0.08, lam(null, 0x3a3a38), -1.2, y - 0.5, ZGT + 1.7, s);
      B(0.08, 2.0, 0.08, lam(null, 0x3a3a38), 0.45, 1.0, ZGT + 1.7, s); B(0.08, 2.0, 0.08, lam(null, 0x3a3a38), 0.45, 1.0, ZGT + 0.3, s);
      for (const dz of [-0.2, 0.2]) B(0.05, 2.1, 0.05, mY, -2.14, 1.05, ZGT + 2.2 + dz, s); for (let k = 0; k < 7; k++) B(0.05, 0.04, 0.4, mY, -2.14, 0.15 + k * 0.3, ZGT + 2.2, s);
      // tubo suelto en la plataforma (el que agarra Marla)
      SW.pipe = cyl(0.03, 0.03, 0.8, 6, lam(null, 0x8a8c88), -0.9, 2.06, ZGT + 1.1, s); SW.pipe.rotation.z = Math.PI / 2; SW.pipe0 = SW.pipe.position.clone(); }
    SW.ava = mkAva(s); SW.dog = await loadDog(L); s.add(SW.dog.root); SW.marla = await makePerson(L, 'marla'); s.add(SW.marla.root);
    SW.marla.root.traverse((o) => { if (!o.isMesh) return; for (const m of Array.isArray(o.material) ? o.material : [o.material]) { if (m.name === 'Skin' || m.color.getHex() === 0xd8b49a) m.color.set(0xa8a69c); else if (m.map && m.color.getHex() === 0xffffff && !/Hair/.test(m.name)) m.color.set(0xc8c8c0); } });
    SW.Z = await horde(s, 16, 3); SW.mHand = (() => { let b = null; SW.marla.root.traverse((o) => { if (!b && o.isBone && /MiddleHandR|HandR$/.test(o.name)) b = o; }); return b; })();
    // salpicaduras (cajitas blancas que saltan del agua)
    SW.spl = []; for (let i = 0; i < 24; i++) { const m = L.mesh(new THREE.TetrahedronGeometry(0.05, 0), basic(null, 0xd8e0d0), 0, -5, 0, s); SW.spl.push(m); }
    SW.gauge = new THREE.Group(); SW.gauge.position.set(0.55, 0, -16); s.add(SW.gauge); { const tG = L.cvs(8, 64, (c) => { px(c, 0, 0, '#e8e4d8', 8, 64); for (let y = 0; y < 64; y += 4) px(c, 0, y, '#1a1a1a', y % 16 ? 4 : 8, 1); px(c, 0, 40, '#c02020', 8, 3); }); B(0.1, 1.5, 0.04, lam(tG), 0, 0.15, 0, SW.gauge); B(0.16, 0.06, 0.08, lam(null, 0x3a3a38), 0, 0.92, 0, SW.gauge); } SW.gauge.visible = false;
    SW.debris = []; { const mW = lam(L.rep(tWood(1009, '#6a4a2a'), 1, 1)); const cr = B(0.35, 0.22, 0.3, mW, 0, -0.22, 0, s); const br = cyl(0.04, 0.06, 1.2, 5, lam(null, 0x3a2a1a), 0, -0.25, 0, s); br.rotation.z = Math.PI / 2; const cn = cyl(0.05, 0.05, 0.12, 8, lam(null, 0xb8b0a0), 0, -0.26, 0, s); cn.rotation.x = Math.PI / 2; SW.debris.push(cr, br, cn); }
    SW.reset = (t, lt) => { ikUndo(); flow(t); SW.gauge.visible = false; SW.debris.forEach((d) => { d.visible = false; }); SW.ava.fl.unaim(); SW.ava.fl.hide(); SW.ava.ch.root.visible = false; SW.dog.root.visible = false; SW.marla.root.visible = false; SW.Z.forEach((z) => { z.wrap.visible = false; }); SW.spl.forEach((m) => { m.position.y = -5; });
      SW.gate.position.y = 2.4; SW.lever.rotation.x = 0; SW.pipe.position.copy(SW.pipe0); SW.pipe.rotation.set(0, 0, Math.PI / 2); };
  }
  const swAva = (x, z, yaw, segs, faces, flash, tgt, c) => { const { ch, fl } = SW.ava; AVA(ch, x, z, yaw); ch.pose(LT, segs, faces || [[-99, 'half', 'neutral']]); if (flash) { fl.show(); const tg = tgt || V(x, -0.2, z - 3); fl.aim(tg, 1); fl.on(true, c, tg, 1, true, 12); } return ch; };
  const swDog = (x, z, yaw, state, lt, opts = {}) => { SW.dog.root.visible = true; SW.dog.root.position.set(x, 0, z); SW.dog.root.rotation.y = yaw; SW.dog.update(lt, state, opts); };
  const swMarla = (t, x, z, yaw, clip = 'idle', y = 0) => { SW.marla.root.visible = true; const lp = clip === 'walk' ? Math.sin(t * 3.4) : 0; SW.marla.root.position.set(x, y - 0.03 * Math.max(0, lp), z); SW.marla.root.rotation.set(0, yaw, 0.06 * Math.max(0, lp)); SW.marla.pose(t, clip, { talk: marlaTalk(t) }); };
  // v3: BAJAR LA ESCALERA de verdad (IK de 2 huesos: manos en los peldaños, pies en los peldaños, de cara a la escalera).
  // Peldaños y = -0.1 + 0.3 k en x = -2.12. s = peldaños bajados; mano y pie contrarios se mueven juntos (2 peldaños por ciclo).
  const IKQ = new THREE.Quaternion(), IKUNDO = [];
  const ikUndo = () => { while (IKUNDO.length) { const [b, q] = IKUNDO.pop(); b.quaternion.copy(q); } };
  const mkLimb = (root, up, lo, en) => { root.updateMatrixWorld(true); const U = root.getObjectByName(up), Lo = root.getObjectByName(lo), E = root.getObjectByName(en);
    const pu = U.getWorldPosition(V()), pl = Lo.getWorldPosition(V()), pe = E.getWorldPosition(V());
    return { U, Lo, loL: U.worldToLocal(pl.clone()), enL: Lo.worldToLocal(pe.clone()), l1: pu.distanceTo(pl), l2: pl.distanceTo(pe) }; };
  const turnTo = (b, endL, want) => { const bp = b.getWorldPosition(V()), cur = b.localToWorld(endL.clone()).sub(bp).normalize(), w = want.clone().sub(bp).normalize();
    const R = new THREE.Quaternion().setFromUnitVectors(cur, w), qw = b.getWorldQuaternion(new THREE.Quaternion()), pw = b.parent.getWorldQuaternion(IKQ).invert(); b.quaternion.copy(pw.multiply(R.multiply(qw))); b.updateMatrixWorld(true); };
  const solve = (lb, tgt, pole) => { IKUNDO.push([lb.U, lb.U.quaternion.clone()], [lb.Lo, lb.Lo.quaternion.clone()]);
    const a = lb.U.getWorldPosition(V()), d = tgt.clone().sub(a), dist = Math.max(Math.abs(lb.l1 - lb.l2) + 0.01, Math.min(lb.l1 + lb.l2 - 0.003, d.length())), dir = d.normalize();
    const ca = (lb.l1 * lb.l1 + dist * dist - lb.l2 * lb.l2) / (2 * lb.l1 * dist), sa = Math.sqrt(Math.max(0, 1 - ca * ca)), pl = pole.clone().sub(a); pl.addScaledVector(dir, -pl.dot(dir)).normalize();
    turnTo(lb.U, lb.loL, a.clone().addScaledVector(dir, lb.l1 * ca).addScaledVector(pl, lb.l1 * sa)); turnTo(lb.Lo, lb.enL, a.clone().addScaledVector(dir, dist)); };
  const RUNG = (k) => -0.1 + 0.3 * k;
  const stepf = (u) => { const n = Math.floor(u), f = u - n; return [n + L.smooth(L.clamp01((f - 0.5) / 0.5)), (f > 0.5) ? Math.sin(Math.PI * (f - 0.5) / 0.5) : 0]; };
  /** pone a W (wrap con yaw -PI/2 frente a la escalera) bajando: k0 = peldaño del pie derecho al empezar */
  const climbDown = (wrap, limbs, k0, s, { hand = 0.3, foot = 0.2, side = 0.17, hk = 5, ankle = 0.08 } = {}) => {
    wrap.position.set(-2.12 + 0.36, RUNG(k0) + 0.02 - 0.3 * s, 0); wrap.rotation.set(0, -Math.PI / 2, 0); wrap.updateMatrixWorld(true);
    const P = (x, y, z) => wrap.localToWorld(V(x, 0, z)).setY(y);
    // [limb, lado (+x local = izq.), es mano, base, fase]
    for (const [lb, sx, isH, base, o] of [[limbs.fl, 1, false, k0 - 1 + 1, 0], [limbs.fr, -1, false, k0 + 1, 1], [limbs.hr, -1, true, k0 + hk + 1, 0], [limbs.hl, 1, true, k0 + hk + 2, 1]]) {
      const [st, lift] = stepf((s + o) / 2), y = RUNG(base - 2 * st) + (isH ? 0.02 : ankle);
      const tgt = P(sx * side, y, (isH ? hand : foot) - 0.1 * lift);
      const pole = isH ? P(sx * 0.7, y - 0.5, -0.4) : P(sx * 0.1, y + 0.4, 1.2);
      solve(lb, tgt, pole); } };
  /** horda en la alcantarilla: cada zombi avanza por el canal o los bordes hacia -z; front = z del frente, spread = profundidad */
  const swHorde = (t, front, { n = 16, speed = 0.9, spread = 9, face = Math.PI, walk = true, drop = null } = {}) => { SW.Z.forEach((z, i) => { if (i >= n) return; z.wrap.visible = true;
      const lane = [-1.6, -0.6, 0.0, 0.6, 1.6, -0.3, 0.35][i % 7], zz = front + (i / n) * spread + ((i * 37) % 10) * 0.08, inCh = Math.abs(lane) < 1.0;
      z.wrap.position.set(lane + Math.sin(i * 1.7) * 0.15, inCh ? -0.55 : 0, zz); z.wrap.rotation.y = face + Math.sin(i * 2.3) * 0.25; z.pose(walk ? z.walk : z.idle, L.q15(t) * speed * 1.4 + z.ph * 3);
      if (drop && i < drop.n) { const td = drop.t0 + i * 0.45, u = L.clamp01((t - td) / 0.5); z.wrap.position.set(-1.7 + (i % 3) * 0.3, 3.4 - 3.9 * u * u, 0.0 + (i % 2) * 0.3); z.wrap.visible = t > td - 0.6; z.wrap.rotation.y = Math.PI * 0.6; } }); };
  const splash = (t, x, z, k = 1) => { SW.spl.forEach((m, i) => { const u = ((L.q15(t) * 1.6 + i * 0.137) % 1); m.position.set(x + Math.sin(i * 2.1) * 1.2 * k, -0.28 + Math.sin(u * Math.PI) * 0.5 * k, z + Math.cos(i * 1.3) * 1.5 * k); m.rotation.set(i, u * 6, 0); }); };

  // ---------------- PLANOS alcantarilla ----------------
  const LIMBS = {};
  const limbsOf = (who) => LIMBS[who] || (LIMBS[who] = who === 'ava'
    ? { fl: mkLimb(SW.ava.ch.bone, 'ThighL', 'CalfL', 'FootL'), fr: mkLimb(SW.ava.ch.bone, 'ThighR', 'CalfR', 'FootR'), hl: mkLimb(SW.ava.ch.bone, 'UpperArmL', 'ForearmL', 'HandL'), hr: mkLimb(SW.ava.ch.bone, 'UpperArmR', 'ForearmR', 'HandR') }
    : { fl: mkLimb(SW.marla.root, 'UpperLegL', 'LowerLegL', 'FootL'), fr: mkLimb(SW.marla.root, 'UpperLegR', 'LowerLegR', 'FootR'), hl: mkLimb(SW.marla.root, 'UpperArmL', 'LowerArmL', 'MiddleHandL'), hr: mkLimb(SW.marla.root, 'UpperArmR', 'LowerArmR', 'MiddleHandR') });
  // v3: Ava termina de bajar la escalera (peldaño a peldaño), pisa el borde y se gira; Marla baja detras de ella
  shot('39_sewer', SW, 46, (lt, t, c) => { const RATE = 0.5, sA = lt / RATE, sEnd = (RUNG(2) + 0.02) / 0.3;
      if (sA < sEnd) { const { ch, fl } = SW.ava; ch.root.visible = true; fl.hide(); ch.pose(lt, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); climbDown(ch.root, limbsOf('ava'), 2, sA); }
      else { const u = L.smooth(L.clamp01((lt - sEnd * RATE) / 0.5)); swAva(-1.76 + 0.2 * u, 0.0, -Math.PI / 2 + (Math.PI * 1.3) * u, L.still('idle', 0.3), [[-99, 'scared', 'neutral']], u > 0.9, V(0, -0.3, -4), c); }
      SW.marla.root.visible = true; SW.marla.pose(t, 'idle'); climbDown(SW.marla.root, limbsOf('marla'), 8, 0.4 + lt / 0.55); },
    [[0, 1.6, 2.2, -4.5], [5, 1.4, 2.0, -4.0]], V(-1.5, 1.0, 0.4));
  shot('40_smell', SW, 30, (lt, t) => { const { ch } = SW.ava; AVA(ch, -1.55, 0.2, Math.PI * 0.85); ch.pose(lt, [L.seg('pinch_nose', 0, { speed: 0.8 })], [[-99, 'disgust', 'disgust']]); },
    (lt) => { const h = SW.ava.ch.bone.getObjectByName('Head').getWorldPosition(V()); return h.clone().add(V(0.35, 0.05, -0.85 + lt * 0.04)); }, () => SW.ava.ch.bone.getObjectByName('Head').getWorldPosition(V()).add(V(0, 0.0, 0)),
    LB((lt, o) => { lab(o, 'ROTTEN EGGS', 470, 70, '#ff4030', 's1', 'rotten'); }));
  thinkShot(SW, { id: '41_breath', x: -1.55, z: 0.2, yaw: Math.PI * 0.85, faces: [[-99, 'blink', 'neutral']], ang: 'low', extra: () => { swMarla(0, -1.7, 0.9, Math.PI, 'idle'); } });
  thinkShot(SW, { id: '42b_think_nose', x: -1.6, z: -1.6, yaw: Math.PI * 0.9, faces: [[-99, 'half', 'frown']], ang: 'qL', lookAt: V(-1.7, 4.5, 0), extra: () => {} });
  shot('43_climb', SW, 40, () => { swAva(-1.6, 0.9, 0.3, L.still('idle', 0.3), [[-99, 'half', 'neutral']]); SW.ava.ch.lookAt({ position: V(-1.75, 6, 0) }, 0.9, 45); },
    [[0, -0.9, 0.4, -0.9], [4, -1.0, 0.35, -0.7]], V(-1.75, 5.0, 0.0), LB((lt, o) => { lab(o, 'WAY OUT', 470, 80, '#62f05a', 's4', 'climb'); }));
  const walkLedge = (lt, z0, sp = 0.45) => z0 - sp * lt;
  const handWall = (ch) => { const ua = ch.bone.getObjectByName('UpperArmR'), fa = ch.bone.getObjectByName('ForearmR'); if (ua) ua.rotateZ(1.0); if (fa) fa.rotateZ(0.3); };
  shot('44_water', SW, 44, (lt, t, c) => { const z = walkLedge(lt, -3); swAva(-1.75, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'neutral']], true, V(-1.0, -0.3, z - 3), c); swMarla(t, -1.45, z + 0.9, Math.PI, 'walk'); swDog(-1.7, z - 1.3, Math.PI, 'walk', lt); },
    (lt) => V(0.9, 1.6, walkLedge(lt, -3) - 5.0), (lt) => V(-1.2, 0.2, walkLedge(lt, -3)), LB((lt, o, sh) => { lab(o, 'ANKLE DEEP', 470, 250, '#4fd6ff', 's5', 'ankle', L.toScreen(sh.camera, 0, -0.28, walkLedge(lt, -3) - 2)); lab(o, 'MOVING', 470, 220, '#4fd6ff', 's5', 'moving'); }));
  shot('45_six', SW, 36, (lt, t) => { SW.gauge.visible = true; SW.debris.forEach((d, i) => { d.visible = true; const z = -24 + ((lt * 2.4 + i * 2.6) % 11); d.position.set(-0.4 + i * 0.35, d.position.y, z); d.rotation.y = lt * (1 + i); }); splash(t, 0.2, -15.5, 0.6); swAva(-1.75, -15.4, Math.PI * 0.92, L.still('idle', 0.3), [[-99, 'half', 'neutral']]); },
    [[0, 0.9, 0.12, -19.6], [5, 0.85, 0.1, -19.2]], V(-0.1, 0.05, -15.4), LB((lt, o, sh, t) => { lab(o, '6 IN MOVING WATER', 470, 70, '#4fd6ff', 's5', 'six', L.toScreen(sh.camera, 0.55, -0.12, -16)); lab(o, 'KNOCKS AN ADULT DOWN', 470, 100, '#ff4030', 's5', 'knock'); bitText(o.tctx, 'NWS', LW - 30, 340, 1, '#6a7080', { outline: null }); }));
  shot('46_ledge', SW, 40, (lt, t, c) => { const z = walkLedge(lt, -7, 0.4); const ch = swAva(-1.85, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.45 })], [[-99, 'half', 'neutral']], true, V(-1.3, -0.2, z - 3), c); swMarla(t, -1.5, z + 0.9, Math.PI, 'walk'); swDog(-1.7, z - 1.2, Math.PI, 'walk', lt);
      handWall(ch); },
    (lt) => V(0.2, -0.05, walkLedge(lt, -7, 0.4) - 2.8), (lt) => V(-1.8, 0.7, walkLedge(lt, -7, 0.4)), LB((lt, o) => { lab(o, 'STAY ON THE LEDGE', 220, 100, '#62f05a', 's6', 'ledge'); lab(o, 'NEVER THE MIDDLE', 160, 100, '#ff4030', 's6', 'middle'); }));
  shot('47_ribbon_stop', SW, 30, (lt, t) => { swAva(-1.8, -11.2, Math.PI, L.still('idle', 0.3), [[-99, 'half', 'neutral']]); swMarla(t, -1.45, -10.4, Math.PI, 'idle'); swDog(-1.65, -12.4, 0.1, 'stare', lt, { look: V(-1.5, 0.6, 0) }); },
    [[0, -0.5, 0.9, -14.6], [5, -0.55, 0.85, -14.4]], V(-1.65, 0.5, -12.3));
  shot('48_splash', SW, 38, (lt, t) => { swHorde(t, -3.5, { n: 7, spread: 5 }); splash(t, 0, -2.5); }, [[0, -1.2, 1.4, -11.5], [5, -1.1, 1.35, -11.0]], V(0, 0.8, -2));
  thinkShot(SW, { id: '49_think_heard', x: -1.8, z: -11.2, yaw: 0.4, faces: [[-99, 'scared', 'frown']], ang: 'q', lookAt: V(-1, 1.2, 0), extra: (lt, t) => { swMarla(t, -1.45, -10.2, 0.3, 'idle'); } });
  shot('50_horde_ladder', SW, 42, (lt, t) => { swHorde(t, 1.2, { n: 14, spread: 5, drop: { n: 5, t0: t - lt + 0.2 } }); splash(t, -1.4, 0.5, 0.8); },
    [[0, 1.6, 0.9, -5.0], [5, 1.4, 0.85, -4.5]], V(-1.2, 1.4, 0.4), LB((lt, o, sh, t) => { const k = L.smooth((t - (sh.t0 || 0) - 0.2) / 0.8), n = Math.round(40 + 40 * k); const c = o.tctx; c.fillStyle = 'rgba(4,8,16,0.86)'; c.fillRect(500, 22, 120, 46); c.strokeStyle = '#ff4030'; c.strokeRect(500.5, 22.5, 119, 45); bitText(c, String(n), 560, 42, 3, '#ff4030', { outline: '#000' }); bitText(c, 'BEHIND YOU', 560, 60, 1, '#e8e8e8', { outline: null }); }));
  shot('51_horde_wade', SW, 44, (lt, t) => { swHorde(t, -4 - lt * 0.5, { n: 16, spread: 10 }); splash(t, 0, -3 - lt * 0.5, 1); }, [[0, 0.3, 0.6, -12], [5, 0.3, 0.55, -11.5]], (lt) => V(0, 0.9, -3 - lt * 0.5));
  // ---- compuerta: Marla
  const GZ = -30;
  shot('52_gate', SW, 46, (lt, t, c) => { swAva(-1.8, GZ + 2.6, Math.PI, L.still('idle', 0.3), [[-99, 'half', 'neutral']], true, V(0, 0.8, GZ), c); swMarla(t, -1.45, GZ + 3.3, Math.PI, 'idle'); swDog(-1.65, GZ + 1.6, Math.PI, 'stand', lt); },
    [[0, 1.6, 1.6, GZ + 6.8], [6, 1.3, 1.5, GZ + 5.8]], V(-0.6, 1.5, GZ), LB((lt, o, sh) => { const cm = sh.camera; lab(o, 'IRON GATE', 470, 250, '#ffd23f', 'g1', 'iron', L.toScreen(cm, 0.8, 0.8, GZ)); lab(o, 'LEVER', 150, 250, '#ff7b2e', 'g1', 'lever', L.toScreen(cm, -2.1, 1.15, GZ + 0.8)); lab(o, 'PLATFORM', 300, 50, '#62f05a', 'g1', 'platform', L.toScreen(cm, -0.9, 2.1, GZ + 1.0)); }));
  shot('53_marla_lets', SW, 36, (lt, t) => { swAva(-1.85, GZ + 1.4, Math.PI * 0.85, L.still('idle', 0.3), [[-99, 'surprised', 'neutral']]); swMarla(t, -1.4, GZ + 1.9 + 0.2 * L.clamp01(lt / 2), Math.PI * 1.1, 'idle'); swDog(-1.6, GZ + 0.6, Math.PI, 'stand', lt); },
    [[0, -0.2, 1.5, GZ - 0.2], [5, -0.3, 1.45, GZ + 0.1]], V(-1.6, 1.2, GZ + 1.7));
  const marlaClose = (id, { side = 0.35, dist = 1.4, up = -0.12, push = 0.2, armUp = false, ov } = {}) => { const c = cam(30);
    out[id] = { scene: SW.scene, camera: c, update(lt, t) { SW.reset(t, lt); swAva(-1.85, GZ + 2.6, Math.PI * 0.1, L.still('idle', 0.3), [[-99, 'sad', 'neutral']]); swMarla(t, -1.45, GZ + 3.5, Math.PI * 1.05, 'idle');
        if (armUp) { const ua = SW.marla.root.getObjectByName('UpperArmR'); if (ua) ua.rotateX(-1.0); }
        SW.marla.root.updateMatrixWorld(true); const hp = SW.marla.head.getWorldPosition(V()).add(V(0, 0.1, 0)), ry = SW.marla.root.rotation.y, fw = V(Math.sin(ry), 0, Math.cos(ry)), rt = V(Math.cos(ry), 0, -Math.sin(ry)), u = L.clamp01(lt / 5);
        look(c, hp.clone().addScaledVector(fw, dist - push * u).addScaledVector(rt, side).add(V(0, -0.1, 0)), hp.clone().add(V(0, up, 0))); },
      overlay(lt, dt, a, o) { vignette(o, 0.5); if (ov) { o.__t = this.t0 + lt; ov(lt, o, this); } } }; };
  marlaClose('54_marla_dog', { side: -0.55, dist: 1.6 });
  thinkShot(SW, { id: '55_shake_together', x: -1.85, z: GZ + 2.6, yaw: Math.PI * 0.1, faces: [[-99, 'scared', 'frown']], mouth: true, ang: 'front', lookAt: V(-1.45, 1.6, GZ + 3.5), extra: (lt, t) => { swMarla(t, -1.45, GZ + 3.5, Math.PI * 1.05, 'idle'); } });
  marlaClose('56_marla_arm', { side: -0.45, dist: 1.7, up: -0.3, armUp: true, ov: (lt, o) => lab(o, 'BITTEN', 470, 80, '#ff4030', 'g5', 'arm') });
  marlaClose('57_but_you', { side: 0.15, dist: 1.0, push: 0.25 });
  shot('58_lever', SW, 40, (lt, t) => { const tp = at('g7', 'pulls'), u = ease(tp, tp + 0.4, t), ud = ease(tp + 0.35, tp + 0.75, t); SW.lever.rotation.x = -1.1 * u; SW.gate.position.y = 2.4 * (1 - ud * ud);
      swMarla(t, -1.85, GZ + 1.0, -Math.PI / 2 + 0.2, 'idle'); swAva(-1.5, GZ - 1.2, 0, L.still('idle', 0.3), [[-99, 'shocked', 'gasp']]); swDog(-1.0, GZ - 1.6, 0.4, 'stare', lt, { look: V(-1.8, 1, GZ + 1) }); },
    [[0, 0.6, 1.4, GZ - 3.8], [5, 0.4, 1.35, GZ - 3.4]], V(-1.4, 1.1, GZ + 0.3), LB((lt, o) => { lab(o, 'CLANG', 470, 80, '#ff4030', 'g7', 'drops'); }));
  const platY = 2.04;
  shot('59_climb', SW, 42, (lt, t) => { SW.gate.position.y = 0; SW.lever.rotation.x = -1.1; const u = L.clamp01(lt / 2.6); swMarla(t, -2.0, GZ + 2.2 - 0.0 * u, -Math.PI / 2, u < 1 ? 'idle' : 'idle', platY * u);
      if (u >= 1) { SW.marla.root.position.set(-0.6, platY, GZ + 1.3); SW.marla.root.rotation.y = 0; } swAva(-1.4, GZ - 1.1, 0.2, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); },
    [[0, 1.4, 1.6, GZ + 5.4], [5, 1.2, 1.8, GZ + 5.0]], V(-1.5, 2.0, GZ + 1.6));
  const banging = (t) => { SW.marla.root.position.set(-0.3, platY, GZ + 1.3); SW.marla.root.rotation.set(0, 0, 0); SW.marla.pose(t, 'punch', { talk: marlaTalk(t) }); if (SW.mHand) { SW.marla.root.updateMatrixWorld(true); SW.pipe.position.copy(SW.mHand.getWorldPosition(V())); SW.pipe.rotation.set(0.4, 0, 1.0); } };
  shot('60_bang', SW, 46, (lt, t) => { SW.gate.position.y = 0; SW.lever.rotation.x = -1.1; SW.marla.root.visible = true; banging(t); swHorde(t, GZ + 2.5 + Math.max(0, 4 - lt * 1.0), { n: 16, spread: 9 }); splash(t, 0, GZ + 4, 1); },
    [[0, 1.6, 1.4, GZ + 7.5], [6, 1.4, 1.5, GZ + 7.0]], V(-0.8, 2.4, GZ + 1.2), LB((lt, o) => { lab(o, 'LOUD', 470, 60, '#ff4030', 'g9', 'loud'); lab(o, 'LOUDER', 470, 90, '#ff4030', 'g9', 'louder'); }));
  shot('61_away', SW, 36, (lt, t) => { SW.gate.position.y = 0; SW.marla.root.visible = true; banging(t); swHorde(t, GZ + 1.0, { n: 16, spread: 7, walk: false, face: 0.6 }); SW.Z.forEach((z) => { z.wrap.rotation.y = -0.4 + Math.PI * 0.95; }); swAva(-1.2, GZ - 0.8, 0, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); },
    [[0, -0.6, 1.5, GZ - 2.2], [5, -0.7, 1.55, GZ - 2.0]], V(-0.6, 1.6, GZ + 2));
  shot('62_marla_go', SW, 34, (lt, t) => { SW.gate.position.y = 0; SW.marla.root.visible = true; banging(t); SW.marla.pose(t, 'idle', { talk: marlaTalk(t) }); swHorde(t, GZ + 2.0, { n: 10, spread: 2.5, walk: false, face: 0.0 }); },
    [[0, 0.9, 2.7, GZ + 5.6], [4, 0.8, 2.75, GZ + 5.3]], V(-0.3, 2.9, GZ + 1.3));
  thinkShot(SW, { id: '63_think_dont', x: -1.6, z: GZ - 2.5, yaw: Math.PI, faces: [[-99, 'blink', 'frown']], ang: 'front', extra: (lt, t) => { SW.gate.position.y = 0; banging(t); SW.marla.root.visible = true; } });
  shot('64_look_back', SW, 44, (lt, t) => { SW.gate.position.y = 0; SW.marla.root.visible = true; banging(t); swHorde(t, GZ + 1.0, { n: 16, spread: 6, walk: false, face: 0.5 }); const ch = swAva(-1.5, GZ - 2.6, Math.PI * 0.95, L.still('idle', 0.3), [[-99, 'sad', 'neutral']]); ch.lookAt({ position: V(-1, 3, GZ + 1) }, 1, 70); swDog(-1.1, GZ - 3.4, Math.PI, 'stand', lt); },
    [[0, -0.6, 1.8, GZ - 3.7], [5, -0.65, 1.75, GZ - 3.6]], V(-0.3, 2.8, GZ + 1.3));
  thinkShot(SW, { id: '65_breath', x: -1.5, z: GZ - 2.6, yaw: 0.2, faces: [[-99, 'sad', 'gasp']], ang: 'q', lookAt: V(-1, 3, GZ + 1), extra: (lt, t) => { SW.gate.position.y = 0; banging(t); SW.marla.root.visible = true; } });
  shot('66_run', SW, 46, (lt, t) => { SW.gate.position.y = 0; const z = GZ - 2.5 - lt * 2.2; swAva(-1.75, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 1.6 })], [[-99, 'scared', 'neutral']]); swDog(-1.4, z - 1.0, Math.PI, 'walk', lt); },
    [[0, -0.6, 1.4, GZ - 0.9], [5, -0.7, 1.5, GZ - 1.4]], (lt) => V(-1.6, 0.9, GZ - 4 - lt * 2.2));
  // ---- perdida: camara de cruce con tres bocas iguales
  const SJ = { scene: new THREE.Scene() }; { const s = SJ.scene; s.background = new THREE.Color(0x050806); s.fog = new THREE.Fog(0x050806, 3, 18); lights(s, { amb: 0.5, hemi: 0.4, sky: 0x8aa088, gnd: 0x302818 });
    const W = 8, H = 4.2; floorPlane(s, W, W, tB2, 4, 4, 0, 0, -0.6, 0x8a8478);
    const wat = L.plane(W - 2.2, W - 2.2, flowTex(tWater, 3, 3, 0xb8c0a8), 0, -0.3, 0, s, 0, -Math.PI / 2); void wat;
    for (const [x, z, w, d] of [[-W / 2 + 0.55, 0, 1.1, W], [W / 2 - 0.55, 0, 1.1, W], [0, -W / 2 + 0.55, W, 1.1], [0, W / 2 - 0.55, W, 1.1]]) B(w, 0.6, d, lam(L.rep(tCurb, w / 2, d / 2), 0xb0a898), x, -0.3, z, s);
    const ring = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 1.0, z); g.rotation.y = ry; s.add(g); L.mesh(new THREE.TorusGeometry(1.15, 0.14, 6, 14), lam(L.rep(tB, 2, 1)), 0, 0, 0, g); L.mesh(new THREE.CircleGeometry(1.1, 14), basic(null, 0x020302), 0, 0, -1.6, g);
      const tube = L.mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.6, 14, 1, true), lam(L.rep(tB, 4, 1), 0x8a8a8a, { side: THREE.BackSide }), 0, 0, -0.8, g); tube.rotation.x = Math.PI / 2;
      const st = L.plane(0.5, 1.6, flowTex(tWater, 1, 1, 0xa8b098), 0, -0.98, -0.8, g, 0, -Math.PI / 2); void st; };
    for (const [x, z, ry] of [[0, -W / 2, 0], [-W / 2, 0, Math.PI / 2], [W / 2, 0, -Math.PI / 2]]) { const wall = new THREE.Group(); s.add(wall);
      const isX = Math.abs(x) > 0.1; for (const off of [-2.6, 2.6]) wallBox(s, isX ? 0.2 : 2.8, H + 0.6, isX ? 2.8 : 0.2, tB, 1.4, 2, isX ? x : off, H / 2 - 0.3, isX ? off : z); wallBox(s, isX ? 0.2 : 2.6, H - 2.2, isX ? 2.6 : 0.2, tB, 1, 1, isX ? x : 0, 2.2 + (H - 2.2) / 2 + 0.1, isX ? 0 : z); wallBox(s, isX ? 0.2 : 2.6, 0.5, isX ? 2.6 : 0.2, tB, 1, 0.3, isX ? x : 0, -0.35, isX ? 0 : z);
      ring(x * 0.97, z * 0.97, ry); }
    wallBox(s, W, H + 0.6, 0.2, tB, 4, 2, 0, H / 2 - 0.3, W / 2); L.plane(W, W, lam(L.rep(tB2, 4, 4), 0x6a6a6a), 0, H, 0, s, 0, Math.PI / 2);
    for (const [x, z] of [[-3.2, -3.2], [3.2, -3.2], [-3.2, 3.2], [3.2, 3.2]]) B(0.5, H, 0.5, lam(L.rep(tStone(1020, [80, 78, 70]), 1, 3)), x, H / 2 - 0.6, z, s);
    const pl = new THREE.PointLight(0xffd890, 3, 9, 1.4); pl.position.set(3.4, 2.6, -3.4); s.add(pl); L.mesh(new THREE.SphereGeometry(0.08, 6, 4), basic(null, 0xffe8a0), 3.6, 2.7, -3.6, s);
    for (const [x, z, ry] of [[0, -W / 2 + 0.1, 0], [-W / 2 + 0.1, 0, Math.PI / 2], [W / 2 - 0.1, 0, -Math.PI / 2]]) { const lb = L.plane(0.5, 0.2, basic(L.cvs(32, 12, (c) => { c.fillStyle = '#c8c0a0'; c.fillRect(0, 0, 32, 12); c.fillStyle = '#1a1a1a'; c.font = 'bold 8px monospace'; c.fillText('S-14', 6, 9); })), x, 2.5, z, s, ry); void lb; }   // la misma placa en las tres: todas iguales
    SJ.ava = mkAva(s); SJ.dog = await loadDog(L); s.add(SJ.dog.root);
    SJ.reset = (t) => { flow(t); SJ.ava.fl.unaim(); SJ.ava.fl.hide(); }; }
  shot('67_fade', SJ, 40, (lt, t) => { SJ.ava.ch.root.visible = false; SJ.dog.root.visible = false; }, [[0, 2.6, 1.6, 3.2], [5, 2.3, 1.5, 2.8]], V(0, 0.9, -3.5), null, 0.6);
  shot('68_lost', SJ, 50, (lt, t, c) => { const { ch, fl } = SJ.ava; AVA(ch, 0.2, 1.4, Math.PI + Math.sin(lt * 0.5) * 0.9); ch.root.position.y = 0; ch.pose(lt, L.still('look_around', 0.5 + lt * 0.12), [[-99, 'scared', 'neutral']]); fl.show(); const tg = V(Math.sin(lt * 0.5 + 0.3) * -3, 0.6, -2); fl.aim(tg, 1); fl.on(true, c, tg, 1, true, 12);
      SJ.dog.root.visible = true; SJ.dog.root.position.set(0.8, 0, 1.0); SJ.dog.root.rotation.y = Math.PI * 0.8; SJ.dog.update(lt, 'stand', {}); ch.root.position.y = -0.0; },
    [[0, 3.4, 3.6, 3.4], [6, 3.2, 3.5, 3.2]], V(0, 0.2, -0.5), LB((lt, o) => { lab(o, 'PACE COUNT: LOST', 220, 100, '#ff4030', 'o2', 'pace'); }));
  // (en la camara de cruce Ava esta de pie sobre el agua: suelo del canal a -0.6, agua -0.3) -> se sube el plano de agua
  { SJ.scene.traverse((o) => { if (o.isMesh && o.position.y === -0.3 && o.geometry.type === 'PlaneGeometry') o.position.y = 0.0; }); SJ.scene.traverse((o) => { if (o.isMesh && o.position.y === -0.6) o.position.y = -0.05; }); }
  { const c = cam(30); const mapProp = new THREE.Group(); SJ.scene.add(mapProp);
    const tM = L.cvs(64, 48, (cc) => { cc.fillStyle = '#d8c8a0'; cc.fillRect(0, 0, 64, 48); cc.strokeStyle = '#5a3a1a'; cc.lineWidth = 0.5; for (let k = 0; k < 8; k++) { cc.beginPath(); cc.moveTo(k * 8, 0); cc.lineTo(k * 8 + 2, 48); cc.stroke(); } cc.strokeStyle = '#b02010'; cc.lineWidth = 1.5; cc.setLineDash([3, 2]); cc.beginPath(); cc.moveTo(6, 30); cc.bezierCurveTo(24, 22, 40, 26, 56, 14); cc.stroke(); cc.setLineDash([]); cc.fillStyle = '#6a3a1a'; cc.fillRect(52, 8, 9, 7); cc.fillStyle = '#1a1a1a'; cc.font = 'bold 5px monospace'; cc.fillText('COURTHOUSE', 30, 6); cc.fillStyle = '#b02010'; cc.fillText('END', 52, 22); });
    const pm = L.plane(0.32, 0.24, L.lam(tM), 0, 0, 0, mapProp); pm.material.side = DS; L.holdIn(SJ.ava.ch, mapProp, 'L', [0, 1.0, 0.4], [Math.PI / 2, 0, 0]); mapProp.visible = false;
    out['68b_map'] = { scene: SJ.scene, camera: c, update(lt, t) { SJ.reset(t); const { ch } = SJ.ava; AVA(ch, 0.2, 1.4, Math.PI); ch.pose(lt, L.still('hold_up_object', 0.8), [[-99, 'scared', 'neutral']]); mapProp.visible = true; SJ.dog.root.visible = false;
        ch.root.updateMatrixWorld(true); const mp = mapProp.getWorldPosition(V()); look(c, mp.clone().add(V(0.12, 0.45, 0.42 - lt * 0.02)), mp); },
      overlay(lt, dt, a, o) { vignette(o, 0.5); o.__t = this.t0 + lt; lab(o, 'MAP ENDS', 470, 80, '#ff4030', 'o2', 'map'); } };
    out['67_fade'].update = ((f) => function (lt, t) { mapProp.visible = false; f.call(this, lt, t); })(out['67_fade'].update);
    out['68_lost'].update = ((f) => function (lt, t) { mapProp.visible = false; f.call(this, lt, t); })(out['68_lost'].update); }
  // ---- mano derecha en la pared (mas alla de la compuerta: Ava por el borde izquierdo, la pared a su derecha)
  shot('69b_follow', SW, 44, (lt, t, c) => { SW.gate.position.y = 0; const z = -38 - 0.42 * lt; const ch = swAva(-1.85, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.48 })], [[-99, 'half', 'neutral']], true, V(-1.2, -0.2, z - 3), c); handWall(ch); swDog(-1.55, z - 0.9, Math.PI, 'walk', lt); },
    (lt) => V(0.9, 1.9, -38 - 0.42 * lt - 4.0), (lt) => V(-1.6, 0.6, -38 - 0.42 * lt), LB((lt, o) => { lab(o, 'RIGHT HAND ON THE WALL', 470, 70, '#62f05a', 'o4', 'follow'); }));
  shot('70_hand_wall', SW, 30, (lt, t) => { SW.gate.position.y = 0; const z = -44 - 0.42 * lt; const ch = swAva(-1.98, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.48 })], [[-99, 'half', 'neutral']]); handWall(ch); },
    (lt) => V(-1.1, 1.62, -44 - 0.42 * lt - 0.9), (lt) => V(-2.2, 1.32, -44 - 0.42 * lt), LB((lt, o) => { lab(o, 'NEVER LET GO', 470, 70, '#62f05a', 'o5', 'wall'); }));   // v3: camara que acompaña al cuerpo (antes seguia la mano: temblaba)
  shot('71_turns', SJ, 52, (lt, t, c) => { const { ch, fl } = SJ.ava; const ph = lt * 0.42, P = [[2.8, 3.2], [2.9, -2.6], [-2.6, -2.9], [-3.0, 2.0]], seg = Math.min(2, Math.floor(ph / 2.4)), u = Math.min(1, (ph - seg * 2.4) / 2.4);
      const a = P[seg], b = P[seg + 1], x = a[0] + (b[0] - a[0]) * u, z = a[1] + (b[1] - a[1]) * u; AVA(ch, x, z, Math.atan2(b[0] - a[0], b[1] - a[1])); ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'neutral']]); handWall(ch); fl.hide(); SJ.dog.root.visible = false; },
    [[0, 3.4, 3.4, 3.4], [8, 3.3, 3.35, 3.3]], V(-0.5, 0.0, -0.5), LB((lt, o) => { lab(o, 'TURN', 470, 70, '#ffd23f', 'o5', 'turn'); }));
  thinkShot(SW, { id: '72_think_walk', x: -1.85, z: -50, yaw: Math.PI, still: false, clip: 'walk', faces: [[-99, 'half', 'frown']], ang: 'front', extra: (lt, t) => { SW.gate.position.y = 0; } });
  // ---- CUARTO DE OBREROS (punto de guardado)
  const SR = { scene: new THREE.Scene() }; { const s = SR.scene; s.background = new THREE.Color(0x0a0806); s.fog = new THREE.Fog(0x0a0806, 5, 14); lights(s, { amb: 0.5, hemi: 0.4, sky: 0xd8c8a8 });
    const tTileW = L.cvs(32, 32, (c) => { const r = L.rng(1030); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const g = (x % 8 === 0 || y % 8 === 0) ? 0.7 : 1, n = r() * 10; px(c, x, y, K.rgb((176 + n) * g, (184 + n) * g, (160 + n) * g)); } for (let k = 0; k < 14; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(60,50,30,0.5)', 1, 2 + (r() * 4 | 0)); });
    floorPlane(s, 5, 5, tConcrete(1031, [96, 92, 84]), 3, 3);
    for (const [w, d, x, z] of [[5, 0.2, 0, -2.5], [0.2, 5, -2.5, 0], [0.2, 5, 2.5, 0], [5, 0.2, 0, 2.5]]) { wallBox(s, w, 1.3, d, tTileW, Math.max(w, d) / 0.8, 1.6, x, 0.65, z); wallBox(s, w, 1.6, d, tConcrete(1032, [120, 128, 118]), Math.max(w, d) / 2, 1, x, 2.1, z); }
    B(5, 0.1, 5, lam(null, 0x2a2826), 0, 2.9, 0, s); const p1 = cyl(0.06, 0.06, 5, 8, lam(null, 0x6a6a62), 0, 2.6, -2.3, s); p1.rotation.z = Math.PI / 2;
    // puerta de acero (pared sur) entreabierta
    B(1.0, 2.1, 0.08, lam(L.rep(tMetal(1033, '#5a6058'), 1, 2)), 1.6, 1.05, 2.42, s); for (const y of [0.4, 1.7]) B(0.9, 0.06, 0.1, lam(null, 0x3a3e38), 1.6, y, 2.4, s);
    // catre (izquierda), manta verde
    const cot = new THREE.Group(); cot.position.set(-1.8, 0, -0.4); s.add(cot); const mF = lam(null, 0x4a5048); for (const [x, z] of [[-0.35, -0.95], [0.35, -0.95], [-0.35, 0.95], [0.35, 0.95]]) B(0.04, 0.42, 0.04, mF, x, 0.21, z, cot);
    B(0.8, 0.1, 2.0, lam(L.rep(tNoise(1034, [70, 86, 60], [50, 64, 44]), 2, 4)), 0, 0.45, 0, cot); B(0.6, 0.12, 0.35, lam(null, 0xd8d0c0), 0, 0.55, -0.75, cot);
    // mesa con maquina de escribir + cintas, silla
    const desk = new THREE.Group(); desk.position.set(1.6, 0, -1.6); s.add(desk); SR.desk = desk; const mW = lam(L.rep(tWood(1035, '#6a4a2a'), 1, 1));
    B(1.3, 0.06, 0.7, mW, 0, 0.76, 0, desk); for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) B(0.05, 0.76, 0.05, mW, x, 0.38, z, desk);
    const tw = new THREE.Group(); tw.position.set(0, 0.79, 0.02); desk.add(tw); SR.tw = tw; { const mK = lam(null, 0x2a3a2e), mG = lam(null, 0xb89a40), mKey = lam(null, 0xe0d8c0);
      B(0.42, 0.09, 0.3, mK, 0, 0.045, 0, tw); B(0.44, 0.13, 0.12, mK, 0, 0.12, -0.1, tw); cyl(0.035, 0.035, 0.48, 10, lam(null, 0x111112), 0, 0.2, -0.12, tw).rotation.z = Math.PI / 2;
      for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) cyl(0.011, 0.011, 0.006, 8, mKey, -0.13 + k * 0.032 + (r % 2) * 0.012, 0.096 + r * 0.012, 0.12 - r * 0.03, tw);
      B(0.43, 0.01, 0.01, mG, 0, 0.09, 0.15, tw); L.plane(0.22, 0.26, lam(L.cvs(16, 16, (c) => { px(c, 0, 0, '#ece4cc', 16, 16); for (let y = 3; y < 12; y += 2) px(c, 2, y, '#8a8070', 6 + (y % 5), 1); })), 0, 0.34, -0.13, tw, 0, -0.2); }
    for (let i = 0; i < 3; i++) { const rb = cyl(0.04, 0.04, 0.03, 10, lam(null, 0x1a1a1a), -0.45 + i * 0.09, 0.805, 0.18, desk); void rb; cyl(0.015, 0.015, 0.032, 6, lam(null, 0xd8d8d0), -0.45 + i * 0.09, 0.806, 0.18, desk); }
    // radio muerta en estante, taquillas, lampara enjaulada calida, calendario, hierbas (verde y roja)
    B(1.2, 0.04, 0.3, mW, -0.4, 1.6, -2.3, s); B(0.4, 0.24, 0.2, lam(null, 0x5a4a32), -0.6, 1.74, -2.3, s); L.plane(0.16, 0.1, basic(null, 0x2a2a20), -0.6, 1.76, -2.19, s); cyl(0.004, 0.004, 0.4, 4, lam(null, 0x8a8a8a), -0.45, 2.0, -2.3, s);
    for (let i = 0; i < 3; i++) { B(0.45, 1.8, 0.45, lam(L.rep(tMetal(1036 + i, '#4a5a6a'), 1, 3)), 2.15, 0.9, 0.4 + i * 0.47, s); for (let k = 0; k < 3; k++) B(0.02, 0.02, 0.2, lam(null, 0x1a1a1a), 1.92, 1.5 + k * 0.05, 0.4 + i * 0.47, s); }
    SR.bulb = L.mesh(new THREE.SphereGeometry(0.06, 6, 4), basic(null, 0xffe8a0), 0, 2.6, 0, s); SR.lamp = new THREE.PointLight(0xffd8a0, 6, 8, 1.3); SR.lamp.position.set(0, 2.5, 0); s.add(SR.lamp);
    L.plane(0.4, 0.5, basic(L.cvs(16, 20, (c) => { px(c, 0, 0, '#e8e0d0', 16, 20); px(c, 0, 0, '#a01818', 16, 4); c.fillStyle = '#1a1a1a'; for (let y = 6; y < 20; y += 3) for (let x = 1; x < 16; x += 2) c.fillRect(x, y, 1, 1); })), 0.8, 1.9, -2.38, s);
    const herb = (x, z, col) => { cyl(0.09, 0.07, 0.16, 8, lam(null, 0x8a5a3a), x, 0.08, z, s); for (let k = 0; k < 5; k++) { const lf = L.mesh(new THREE.ConeGeometry(0.05, 0.22, 4), lam(null, col), x + Math.sin(k * 1.3) * 0.05, 0.27, z + Math.cos(k * 1.3) * 0.05, s); lf.rotation.set(Math.sin(k) * 0.4, k, Math.cos(k) * 0.4); } };
    herb(-2.1, -2.1, 0x3a9a3a); herb(-1.8, -2.15, 0xc02a2a);
    SR.ava = mkAva(s); SR.dog = await loadDog(L); s.add(SR.dog.root); SR.reset = () => { SR.ava.fl.unaim(); SR.ava.fl.hide(); }; }
  shot('73_saveroom', SR, 50, (lt, t) => { const u = L.clamp01(lt / 4); const { ch } = SR.ava; AVA(ch, 1.4 - 0.9 * u, 2.0 - 1.5 * u, Math.PI + 0.5); ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'neutral']]); SR.dog.root.visible = true; SR.dog.root.position.set(1.9 - 0.6 * u, 0, 2.2 - 1.2 * u); SR.dog.root.rotation.y = Math.PI + 0.4; SR.dog.update(lt, 'walk', {}); },
    [[0, -2.0, 2.4, 2.0], [6, -1.8, 2.3, 1.7]], V(0.6, 0.8, -0.8), LB((lt, o) => { lab(o, 'COT', 120, 250, '#e8e8ec', 'v1', 'cot'); lab(o, 'DEAD RADIO', 300, 60, '#9aa0b0', 'v1', 'radio'); }));
  shot('74_typewriter', SR, 30, (lt, t) => { SR.ava.ch.root.visible = false; SR.dog.root.visible = false; }, [[0, 1.2, 1.25, -1.0], [5, 1.35, 1.2, -1.15]], V(1.6, 0.85, -1.6), LB((lt, o) => { lab(o, 'TYPEWRITER', 470, 70, '#62f05a', 'v2', 'typewriter'); lab(o, 'INK RIBBON x3', 470, 100, '#e8e8ec', 'v2', 'typewriter'); }));
  shot('75_sit', SR, 40, (lt, t) => { const { ch } = SR.ava; AVA(ch, -1.2, -0.3, Math.PI / 2); ch.pose(lt, L.still('sit_floor', 0.9), [[-99, 'half', 'neutral'], [2.5, 'sad', 'neutral']]); SR.dog.root.visible = true; SR.dog.root.position.set(-0.45, 0, -0.05); SR.dog.root.rotation.y = -Math.PI / 2 - 0.3; SR.dog.update(lt, 'sleepy_wag', {}); },
    [[0, 0.6, 1.0, 1.4], [6, 0.4, 0.95, 1.1]], V(-0.9, 0.5, -0.2));
  thinkShot(SR, { id: '76_think_she', x: -1.2, z: -0.3, yaw: Math.PI / 2, clip: 'sit_floor', from: 0.9, faces: [[-99, 'sad', 'neutral']], ang: 'q', camOff: [0.45, 0.0, 0.8], extra: (lt) => { SR.dog.root.visible = true; SR.dog.root.position.set(-0.45, 0, -0.05); SR.dog.root.rotation.y = -Math.PI / 2 - 0.3; SR.dog.update(lt, 'sleep', {}); } });

  // =====================================================================================================================
  // BOSQUE de noche: suelo de barro y hojas, arboles pelados (tronco + ramas), helechos, piedras, tronco caido, niebla azul,
  // cielo con estrellas (Osa Mayor + Polar al norte = -z), desague pluvial en z = +8, cuervos, huellas gigantes en z = -14.
  // =====================================================================================================================
  const tBark = tNoise(1040, [60, 52, 44], [30, 26, 22], 16, 32, (c, r) => { for (let k = 0; k < 10; k++) px(c, r() * 16 | 0, 0, 'rgba(10,8,6,0.5)', 1, 32); });
  const tMud = tNoise(1041, [58, 48, 36], [36, 30, 22], 64, 64, (c, r) => { for (let k = 0; k < 300; k++) px(c, r() * 64 | 0, r() * 64 | 0, ['#6a3a1a', '#8a5a20', '#4a3a1a', '#5a4a2a', '#7a2a12'][k % 5], 2, 1); });
  const tLeaf = L.cvs(8, 8, (c) => { c.clearRect(0, 0, 8, 8); c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(4, 4, 3.5, 2, 0.6, 0, 7); c.fill(); });
  const mNeedle = [[40, 70, 44], [30, 60, 36], [46, 78, 40]].map((c, i) => lam(L.rep(tNoise(1140 + i, c, c.map((v) => v - 22), 16, 16), 1, 1)));
  const tBirch = L.cvs(16, 32, (c) => { px(c, 0, 0, '#d0ccc0', 16, 32); const r = L.rng(1141); for (let k = 0; k < 16; k++) px(c, r() * 14 | 0, r() * 32 | 0, '#1a1a18', 2 + (r() * 4 | 0), 1); });
  const mBirch = lam(L.rep(tBirch, 1, 3)), mBarkT = lam(L.rep(tBark, 1, 3)), mMoss = lam(null, 0x3a5a26);
  const mBush = [0x1e3416, 0x2a4220, 0x18301a, 0x34482a].map((c) => lam(L.rep(tNoise(1144, [60, 90, 50], [20, 40, 20], 8, 8), 1, 1), c));
  const conifer = (s, x, z, h, R) => { const g = new THREE.Group(); g.position.set(x, 0, z); s.add(g); cyl(0.06 * h / 8, 0.12 * h / 8, h * 0.4, 5, mBarkT, 0, h * 0.2, 0, g);
    for (let i = 0; i < 4; i++) { const r = h * (0.27 - 0.05 * i), hh = h * 0.33; const cn = L.mesh(new THREE.ConeGeometry(r, hh, 7), mNeedle[(((i + Math.round(x)) % 3) + 3) % 3], 0, h * 0.25 + i * h * 0.17 + hh / 2, 0, g); cn.rotation.y = R() * 3; } return g; };
  const birch = (s, x, z, h, R) => { const g = new THREE.Group(); g.position.set(x, 0, z); s.add(g); const tr = cyl(0.06, 0.1, h, 6, mBirch, 0, h / 2, 0, g); tr.rotation.z = (R() - 0.5) * 0.12;
    for (let i = 0; i < 4; i++) { const y = h * (0.55 + R() * 0.4), a = R() * 6.28, l = 0.8 + R() * 1.4; const b = cyl(0.015, 0.03, l, 3, mBirch, 0, 0, 0, g); const d = V(Math.cos(a) * 0.6, 0.8, Math.sin(a) * 0.6).normalize(); b.position.set(0, y, 0).addScaledVector(d, l / 2); b.quaternion.setFromUnitVectors(V(0, 1, 0), d); } return g; };
  const bush = (s, x, z, sz, R) => { for (let k = 0; k < 3; k++) { const m = L.mesh(new THREE.DodecahedronGeometry(sz * (0.6 + R() * 0.5), 0), mBush[(((k + Math.round(z)) % 4) + 4) % 4], x + (R() - 0.5) * sz, sz * 0.4, z + (R() - 0.5) * sz, s); m.scale.y = 0.65; m.rotation.set(R(), R(), R()); } };
  const log = (s, x, z, len, ry) => { const g = new THREE.Group(); g.position.set(x, 0.24, z); g.rotation.y = ry; s.add(g); const l = cyl(0.22, 0.26, len, 7, mBarkT, 0, 0, 0, g); l.rotation.z = Math.PI / 2; B(len * 0.8, 0.05, 0.3, mMoss, 0, 0.22, 0, g); for (const sx of [-1, 1]) { const e = L.mesh(new THREE.CircleGeometry(0.24, 7), lam(null, 0x8a6a40), sx * len / 2, 0, 0, g); e.rotation.y = sx * Math.PI / 2; } };
  const stump = (s, x, z) => { cyl(0.3, 0.38, 0.5, 7, mBarkT, x, 0.25, z, s); const t = L.mesh(new THREE.CircleGeometry(0.3, 7), lam(L.cvs(16, 16, (c) => { px(c, 0, 0, '#8a6a40', 16, 16); c.strokeStyle = '#5a4020'; for (let r = 2; r < 8; r += 2) { c.beginPath(); c.arc(8, 8, r, 0, 7); c.stroke(); } })), x, 0.501, z, s); t.rotation.x = -Math.PI / 2; };
  const tLine = L.cvs(128, 32, (c) => { c.clearRect(0, 0, 128, 32); c.fillStyle = '#121c26'; const r = L.rng(1145); for (let x = 0; x < 128; x += 3) { const h = 10 + r() * 20; c.beginPath(); c.moveTo(x - 3, 32); c.lineTo(x + 1, 32 - h); c.lineTo(x + 5, 32); c.fill(); } c.fillRect(0, 26, 128, 6); });
  const treeline = (s, rad, n, h = 12) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, m = L.plane(rad * 0.4, h, basic(tLine, 0xffffff, { transparent: true, alphaTest: 0.5, side: DS }), Math.cos(a) * rad, h / 2 - 0.5, Math.sin(a) * rad, s); m.lookAt(0, h / 2, 0); } };
  function forest(s, { seed = 1, n = 140, area = 50, clear = (x, z) => false, crowTrees = [] } = {}) {
    const R = L.rng(seed), mBark = lam(L.rep(tBark, 1, 4)), trees = [];
    const tree = (x, z, h, r0) => { const g = new THREE.Group(); g.position.set(x, 0, z); s.add(g); const tr = cyl(r0 * 0.55, r0, h, 6, mBark, 0, h / 2, 0, g); tr.rotation.z = (R() - 0.5) * 0.08; const tips = [];
      const nb = 3 + Math.floor(R() * 4); for (let i = 0; i < nb; i++) { const y = h * (0.45 + R() * 0.5), a = R() * Math.PI * 2, l = 1.2 + R() * 2.4, el = 0.5 + R() * 0.6;
        const br = cyl(r0 * 0.12, r0 * 0.28, l, 4, mBark, 0, 0, 0, g); const d = V(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)); br.position.set(0, y, 0).addScaledVector(d, l / 2); br.quaternion.setFromUnitVectors(V(0, 1, 0), d);
        const tip = V(0, y, 0).addScaledVector(d, l * 0.85); tips.push(tip.clone().add(V(x, 0, z)));
        for (let j = 0; j < 2; j++) { const a2 = a + (R() - 0.5) * 1.4, el2 = el + 0.3 + R() * 0.4, l2 = l * 0.5; const d2 = V(Math.cos(a2) * Math.cos(el2), Math.sin(el2), Math.sin(a2) * Math.cos(el2)); const b2 = cyl(r0 * 0.05, r0 * 0.12, l2, 3, mBark, 0, 0, 0, g); b2.position.copy(V(0, y, 0).addScaledVector(d, l * 0.6)).addScaledVector(d2, l2 / 2); b2.quaternion.setFromUnitVectors(V(0, 1, 0), d2); } }
      trees.push({ x, z, h, tips }); return g; };
    for (const [x, z, h, r0] of crowTrees) tree(x, z, h, r0);
    for (let i = 0; i < n; i++) { const x = (R() - 0.5) * area * 2, z = (R() - 0.5) * area * 2; if (clear(x, z)) continue; tree(x, z, 7 + R() * 8, 0.16 + R() * 0.22); }
    // hojas mojadas, helechos, piedras, tronco caido
    const leafM = [0x6a3a1a, 0x8a5a20, 0x5a4a2a, 0x7a2a12, 0x4a4a22].map((c) => basic(tLeaf, c, { transparent: true, alphaTest: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    for (let i = 0; i < 900; i++) { const x = (R() - 0.5) * 40, z = (R() - 0.5) * 50 - 4; const m = L.plane(0.22, 0.22, leafM[i % 5], x, 0.012 + (i % 7) * 0.0006, z, s, 0, -Math.PI / 2); m.rotation.z = R() * 6; m.renderOrder = 1; }
    const fern = (x, z) => { for (let k = 0; k < 5; k++) { const p = L.plane(0.25, 0.7, basic(L.cvs(8, 16, (c) => { c.clearRect(0, 0, 8, 16); c.fillStyle = '#3a5a2a'; for (let y = 0; y < 16; y++) c.fillRect(4 - Math.round(y / 5), y, 1 + 2 * Math.round(y / 5), 1); c.fillStyle = '#4a7a32'; c.fillRect(4, 0, 1, 16); }), 0xffffff, { transparent: true, alphaTest: 0.5, side: DS }), x, 0.34, z, s, k * 1.2); p.rotation.x = -0.25; } };
    for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 34, z = (R() - 0.5) * 44; if (!clear(x, z)) fern(x, z); }
    for (let i = 0; i < 30; i++) { const m = L.mesh(new THREE.DodecahedronGeometry(0.2 + R() * 0.4, 0), lam(L.rep(tStone(1042, [80, 80, 76]), 1, 1)), (R() - 0.5) * 36, 0.05, (R() - 0.5) * 44, s); m.scale.y = 0.6; m.rotation.set(R(), R(), R()); }
    return trees;
  }
  const crowM = lam(null, 0x16161a), beakM = lam(null, 0x5a5a50), eyeM = basic(null, 0xd8c860);
  const mkCrow = (s) => { const g = new THREE.Group(); s.add(g); B(0.09, 0.09, 0.2, crowM, 0, 0.07, 0, g); const hd = new THREE.Group(); hd.position.set(0, 0.14, 0.09); g.add(hd); L.mesh(new THREE.SphereGeometry(0.05, 6, 4), crowM, 0, 0, 0, hd);
    const bk = L.mesh(new THREE.ConeGeometry(0.018, 0.07, 4), beakM, 0, -0.005, 0.07, hd); bk.rotation.x = Math.PI / 2; for (const sx of [-1, 1]) L.mesh(new THREE.SphereGeometry(0.008, 4, 3), eyeM, sx * 0.035, 0.012, 0.03, hd);
    const tl = B(0.07, 0.02, 0.14, crowM, 0, 0.06, -0.15, g); tl.rotation.x = 0.4; for (const sx of [-1, 1]) { const w = B(0.02, 0.07, 0.17, crowM, sx * 0.055, 0.08, -0.01, g); w.rotation.x = 0.1; } for (const sx of [-0.02, 0.02]) B(0.008, 0.06, 0.008, beakM, sx, 0.0, 0.0, g); g.userData.hd = hd; return g; };
  const sky = (s, { dipper = true } = {}) => { const R = L.rng(1050), pts = []; const dir = (az, alt, d = 300) => V(Math.sin(az * Math.PI / 180) * Math.cos(alt * Math.PI / 180) * d, Math.sin(alt * Math.PI / 180) * d, -Math.cos(az * Math.PI / 180) * Math.cos(alt * Math.PI / 180) * d);
    for (let i = 0; i < 700; i++) { const az = R() * 360, alt = 8 + R() * 80; pts.push(...dir(az, alt).toArray()); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); s.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xc8d0e8, size: 1.2, sizeAttenuation: false, fog: false })));
    const DIP = { alkaid: [-30, 32], mizar: [-22, 36], alioth: [-15, 37.5], megrez: [-8, 38], phecda: [-7, 31], merak: [3, 30], dubhe: [2, 38], polaris: [6, 62] }, S = {};
    if (dipper) for (const [n, [az, alt]] of Object.entries(DIP)) { const p = dir(az, alt); S[n] = p; const m = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(p.toArray(), 3)), new THREE.PointsMaterial({ color: n === 'polaris' ? 0xfff8d0 : 0xf0f4ff, size: n === 'polaris' ? 4 : 3, sizeAttenuation: false, fog: false })); s.add(m); }
    const moon = L.mesh(new THREE.CircleGeometry(9, 16), new THREE.MeshBasicMaterial({ color: 0xc8d0d8, fog: false }), 0, 0, 0, s); moon.position.copy(dir(70, 30, 320)); moon.lookAt(0, 0, 0); return S; };
  const FO = { scene: new THREE.Scene(), far: 420 }; { const s = FO.scene; s.background = new THREE.Color(0x0e1626); s.fog = new THREE.Fog(0x16202e, 5, 30); lights(s, { amb: 0.55, hemi: 0.55, sky: 0x7a90c0, gnd: 0x2a2418 });
    const moonL = new THREE.DirectionalLight(0x9ab0e0, 0.9); moonL.position.set(20, 30, -10); s.add(moonL);
    floorPlane(s, 120, 120, tMud, 40, 40, 0, 0, 0, 0xa8a090);
    FO.stars = sky(s);
    // desague pluvial: muro de hormigon con tubo redondo, agua que sale a un arroyo
    const ZD = 8; { const tC = tConcrete(1051, [110, 108, 100]); B(8, 3.2, 0.8, lam(L.rep(tC, 4, 2)), 0, 1.0, ZD + 0.4, s); B(8.4, 0.3, 1.0, lam(L.rep(tC, 4, 1), 0x9a988e), 0, 2.6, ZD + 0.4, s);
      for (const sx of [-1, 1]) { const w = B(0.8, 2.8, 3.0, lam(L.rep(tC, 2, 2)), sx * 4.2, 0.8, ZD - 1.0, s); w.rotation.y = sx * 0.35; }
      const pipe = cyl(1.0, 1.0, 1.4, 14, lam(L.rep(tC, 3, 1), 0xd0ccc0, { side: DS }), 0, 1.0, ZD - 0.1, s); pipe.rotation.x = Math.PI / 2; L.mesh(new THREE.CircleGeometry(0.98, 14), basic(null, 0x030404), 0, 1.0, ZD + 0.55, s).rotation.y = Math.PI;
      const grt = new THREE.Group(); grt.position.set(0, 1.0, ZD - 0.82); s.add(grt); for (let k = -4; k <= 4; k++) B(0.04, 1.9, 0.04, lam(null, 0x4a3a2a), k * 0.22, 0, 0, grt); grt.rotation.z = 0.0; grt.position.x = 1.6; grt.rotation.y = 1.2;   // reja arrancada, a un lado
      const tStr = L.cvs(16, 64, (c) => { const r = L.rng(1052); for (let y = 0; y < 64; y++) for (let x = 0; x < 16; x++) { const n = r() * 16; px(c, x, y, K.rgb(36 + n, 48 + n, 60 + n)); } for (let k = 0; k < 30; k++) px(c, r() * 16 | 0, r() * 64 | 0, '#9ab0c8', 1, 3); });
      const str = L.plane(1.4, 30, flowTex(tStr, 1, 8, 0xc8d0d8), 0, 0.02, ZD - 15.5, s, 0, -Math.PI / 2); str.material.userData.dir = -1; const sp = L.plane(1.6, 1.0, flowTex(tFoam, 1, 1, 0xffffff, { transparent: true, depthWrite: false }), 0, 0.03, ZD - 1.2, s, 0, -Math.PI / 2); sp.renderOrder = 2;
      const fall = L.plane(1.0, 0.5, flowTex(tFoam, 1, 1, 0xd8e0e8, { transparent: true, depthWrite: false, side: DS }), 0, 0.2, ZD - 0.84, s); fall.renderOrder = 2; }
    FO.crowTrees = [[-2.6, -6, 9, 0.3], [2.8, -9, 10, 0.32], [-3.4, -12, 8, 0.28], [3.0, -3, 9, 0.26]];
    FO.trees = forest(s, { seed: 1053, n: 170, area: 46, clear: (x, z) => (Math.abs(x) < 2.4 && z < 12 && z > -40) || (Math.abs(x) < 5 && z > 4 && z < 12), crowTrees: FO.crowTrees });
    { const R = L.rng(1146), clr = (x, z) => (Math.abs(x) < 2.6 && z < 12 && z > -40) || (Math.abs(x) < 5.5 && z > 3 && z < 12) || Math.hypot(x - 6.8, z + 8.8) < 3.2 || Math.hypot(x - 1.4, z + 9.2) < 1.8;
      for (let i = 0; i < 300; i++) { const x = (R() - 0.5) * 84, z = (R() - 0.5) * 84 - 6; if (clr(x, z)) continue; const k = R(); if (k < 0.45) conifer(s, x, z, 6 + R() * 13, R); else if (k < 0.7) birch(s, x, z, 6 + R() * 7, R); else bush(s, x, z, 0.6 + R() * 0.9, R); }
      for (let i = 0; i < 110; i++) { const sx = R() < 0.5 ? -1 : 1, x = sx * (2.9 + R() * 5), z = -38 + R() * 46; if (clr(x, z)) continue; R() < 0.7 ? bush(s, x, z, 0.5 + R() * 0.7, R) : conifer(s, x, z, 3 + R() * 4, R); }
      for (let i = 0; i < 16; i++) { const sx = R() < 0.5 ? -1 : 1; log(s, sx * (3 + R() * 9), -36 + R() * 40, 2 + R() * 3, R() * 3); }
      for (let i = 0; i < 14; i++) { const sx = R() < 0.5 ? -1 : 1; stump(s, sx * (2.8 + R() * 8), -36 + R() * 40); }
      }
    FO.crows = []; FO.trees.slice(0, 4).forEach((tr, i) => tr.tips.forEach((tp, j) => { if (FO.crows.length > 30) return; const c = mkCrow(s); c.position.copy(tp).add(V(0, 0.02, 0)); c.rotation.y = Math.atan2(-tp.x, 2 - tp.z) + (j % 3 - 1) * 0.3; c.scale.setScalar(1.4); c.userData.ry = c.rotation.y; FO.crows.push(c); }));
    for (let k = 0; k < 10; k++) { const c = mkCrow(s); c.position.set(-1.2 + (k % 5) * 0.5, 4.2 + (k % 2) * 0.3, -6 - Math.floor(k / 5) * 2.5); c.scale.setScalar(1.4); c.rotation.y = 0.4; c.userData.ry = 0.4; FO.crows.push(c); const br = cyl(0.03, 0.05, 4, 4, lam(L.rep(tBark, 1, 2)), 0, 4.14 + (k % 2) * 0.3, -6 - Math.floor(k / 5) * 2.5, s); br.rotation.z = Math.PI / 2; br.position.x = 0; }
    // huellas gigantes (pies descalzos, 2x una bota) y la bota de Ava, en barro mas oscuro
    const tFoot = L.cvs(32, 64, (c) => { c.clearRect(0, 0, 32, 64); c.fillStyle = 'rgba(30,20,12,0.95)'; c.beginPath(); c.ellipse(16, 40, 10, 20, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(16, 18, 11, 9, 0, 0, 7); c.fill(); for (const [x, y, r] of [[6, 6, 3.5], [12, 3, 3], [17, 2, 3], [22, 3, 2.6], [26, 6, 2.2]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillStyle = 'rgba(80,96,110,0.6)'; c.fillRect(13, 36, 5, 8); });
    const tBoot = L.cvs(16, 32, (c) => { c.clearRect(0, 0, 16, 32); c.fillStyle = 'rgba(16,10,6,0.8)'; c.fillRect(3, 2, 10, 17); c.fillRect(4, 22, 8, 9); c.fillStyle = 'rgba(60,48,36,0.9)'; for (let y = 4; y < 18; y += 3) c.fillRect(4, y, 8, 1); });
    const pud = L.plane(3.5, 6, basic(L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 1, 8, 8, 8); g.addColorStop(0, 'rgba(120,96,70,0.95)'); g.addColorStop(0.7, 'rgba(110,88,64,0.8)'); g.addColorStop(1, 'rgba(110,88,64,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); }), 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), 0.2, 0.014, -14, s, 0, -Math.PI / 2); pud.renderOrder = 2;
    FO.prints = []; for (let i = 0; i < 4; i++) { const m = L.plane(0.5, 0.88, basic(tFoot, 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }), (i % 2 ? 0.5 : -0.1) + i * 0.1, 0.02, -12.2 - i * 1.2, s, 0, -Math.PI / 2); m.rotation.z = Math.PI + 0.15; m.renderOrder = 3; FO.prints.push(m); }
    FO.boot = L.plane(0.14, 0.3, basic(tBoot, 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }), 0.0, 0.021, -13.15, s, 0, -Math.PI / 2); FO.boot.renderOrder = 3;
    FO.ava = mkAva(s); FO.dog = await loadDog(L); s.add(FO.dog.root);
    FO.zom = await makeZ(s, 'city-zombie', 1.78, (nm) => nm.includes('Outfit') ? L.lam(OUT[5]) : nm.includes('Body') ? L.lam(SKINS[3]) : L.lam(null, 0x2a2018), 0xc8c8c0); FO.zom.tilt = [0.25, 0.15];
    FO.fog = []; const tFogP = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 2, 16, 16, 16); g.addColorStop(0, 'rgba(120,136,160,0.16)'); g.addColorStop(1, 'rgba(170,184,204,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
    for (let i = 0; i < 18; i++) { const m = L.plane(6, 2.2, basic(tFogP, 0xffffff, { transparent: true, depthWrite: false }), ((i * 37) % 20) - 10, 0.8, -((i * 53) % 40) + 6, s); m.renderOrder = 5; FO.fog.push(m); }
    FO.heat = []; for (let i = 0; i < 44; i++) { const m = L.plane(0.05, 0.05, basic(null, i < 34 ? 0xff8a30 : 0xffc070, { transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), 0, -5, 0, s); m.renderOrder = 6; FO.heat.push(m); }
    FO.breath = []; for (let i = 0; i < 4; i++) { const m = L.plane(0.18, 0.12, basic(tGlow, 0xd8e0f0, { transparent: true, opacity: 0.4, depthWrite: false }), 0, -5, 0, s); m.renderOrder = 6; FO.breath.push(m); }
    FO.reset = (t, lt) => { FO.heat.forEach((m) => { m.position.y = -5; }); FO.breath.forEach((m) => { m.position.y = -5; }); flow(t); FO.ava.fl.unaim(); FO.ava.fl.hide(); FO.ava.ch.root.visible = false; FO.dog.root.visible = false; FO.zom.wrap.visible = false; FO.fog.forEach((m, i) => { m.position.x = ((i * 37) % 20) - 10 + Math.sin(L.q15(t) * 0.1 + i) * 1.5; }); FO.crows.forEach((c) => { c.rotation.y = c.userData.ry; c.userData.hd.rotation.y = 0; }); };
    FO.post = (lt, t, c) => { FO.fog.forEach((m) => m.lookAt(c.position.x, m.position.y, c.position.z)); }; }
  const foAva = (x, z, yaw, segs, faces) => { const { ch } = FO.ava; AVA(ch, x, z, yaw); ch.pose(LT, segs, faces || [[-99, 'half', 'neutral']]); return ch; };
  const foDog = (x, z, yaw, state, lt, opts = {}) => { FO.dog.root.visible = true; FO.dog.root.position.set(x, 0, z); FO.dog.root.rotation.y = yaw; FO.dog.update(lt, state, opts); };
  const walkF = (lt, z0, sp = 0.5) => z0 - sp * lt;
  shot('78_outfall', FO, 44, (lt, t) => { const z = 7.4 - lt * 0.5; foAva(-0.2, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.55 })], [[-99, 'half', 'neutral']]); foDog(1.1, z - 0.3, Math.PI, 'walk', lt); },
    [[0, 2.2, 1.1, 2.0], [6, 1.9, 1.0, 2.6]], (lt) => V(0, 1.0, 7.0 - lt * 0.3));
  shot('78b_trees', FO, 46, (lt, t) => { foAva(-0.2, 4.0, Math.PI, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); foDog(0.5, 3.3, Math.PI, 'stand', lt); }, [[0, -0.6, 1.7, 5.6], [5, -0.5, 1.65, 5.2]], V(0.2, 1.4, -10));
  shot('79_woods', FO, 50, (lt, t) => { const z = walkF(lt, 2.5, 0.45); foAva(0, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'neutral']]); foDog(0.6, z - 0.8, Math.PI, 'walk', lt); },
    [[0, 7, 6.5, -9], [6, 6.5, 6.2, -8.6]], (lt) => V(0, 0.6, walkF(lt, 2.5, 0.45)), LB((lt, o) => { lab(o, 'THE WOODS', 470, 70, '#62f05a', 'f2', 'woods'); }));
  shot('80_cold', FO, 34, (lt, t) => { const { ch } = FO.ava; AVA(ch, 0, 0.6, Math.PI); ch.pose(lt, [L.seg('warm_hands', 0, { speed: 0.7 })], [[-99, 'half', 'frown']]); foDog(0.6, 0.0, Math.PI * 0.8, 'stand', lt); },
    [[0, 0.5, 1.2, -1.6], [5, 0.4, 1.1, -1.3]], V(0, 1.0, 0.6), LB((lt, o) => { lab(o, 'SOAKED', 470, 70, '#4fd6ff', 'f3', 'soaked'); }));
  shot('81b_soaked', FO, 40, (lt, t) => { const z = walkF(lt, -1, 0.45); foAva(0.1, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'frown']]); foDog(0.7, z - 0.9, Math.PI, 'walk', lt); },
    (lt) => V(-1.4, 1.2, walkF(lt, -1, 0.45) - 3.0), (lt) => V(0.1, 0.95, walkF(lt, -1, 0.45)), LB((lt, o) => { lab(o, 'HYPOTHERMIA', 470, 70, '#ff4030', 'f4', 'wet'); }));
  shot('81_heat', FO, 34, (lt, t, c) => { const { ch } = FO.ava; AVA(ch, 0, -2, Math.PI); ch.pose(lt, [L.seg('warm_hands', 0, { speed: 0.6 })], [[-99, 'half', 'frown']]); ch.root.updateMatrixWorld(true);
      FO.heat.forEach((m, i) => { const legs = i < 34, sp = legs ? 0.9 : 0.25, u = ((lt * sp + i * 0.137) % 1); m.position.set(Math.sin(i * 2.3) * (legs ? 0.16 : 0.12), (legs ? 0.15 + Math.abs(Math.sin(i)) * 0.6 : 1.05 + Math.abs(Math.sin(i)) * 0.3) + u * (legs ? 0.7 : 0.35), -2 + Math.cos(i * 1.7) * 0.1 - 0.12); m.material.opacity = 0.85 * (1 - u); m.lookAt(c.position); });
      const hd = ch.bone.getObjectByName('Head').getWorldPosition(V()); FO.breath.forEach((m, i) => { const u = ((lt * 0.6 + i * 0.25) % 1); m.position.copy(hd).add(V(0, -0.06 + u * 0.1, -0.15 - u * 0.4)); m.scale.setScalar(1 + u * 2); m.material.opacity = 0.4 * (1 - u); m.lookAt(c.position); }); },
    [[0, 0.35, 1.1, -4.3], [5, 0.4, 1.05, -4.0]], V(0, 0.85, -2), LB((lt, o, sh) => { lab(o, 'WET JEANS: ~25x FASTER', 470, 230, '#ff7b2e', 'f4', 'twenty-five', L.toScreen(sh.camera, 0.1, 0.55, -2.1)); lab(o, 'DRY JACKET: 1x', 470, 100, '#e8e8ec', 'f4', 'faster', L.toScreen(sh.camera, -0.05, 1.25, -2.1)); lab(o, 'BEFORE MORNING', 220, 280, '#ff4030', 'f4', 'morning'); }));
  thinkShot(FO, { id: '82_think_move', x: 0.1, z: -3.5, yaw: Math.PI, still: false, clip: 'walk', faces: [[-99, 'half', 'frown']], ang: 'front', camOff: [0.25, 0.0, 1.0] });
  { const c = far(cam(52));
    out['83_sky'] = { scene: FO.scene, camera: c, update(lt, t) { FO.reset(t, lt); const { ch } = FO.ava; AVA(ch, 0, -4, Math.PI); ch.pose(lt, L.still('idle', 0.3), [[-99, 'surprised', 'neutral']]); const u = L.smooth(L.clamp01(lt / 2.5));
        look(c, V(0.3, 1.6, -3.2), V(1.5, 1.6 + 120 * (0.25 + 0.6 * u), -3.2 - 160)); FO.post(lt, t, c); },
      overlay(lt, dt, a, o) { vignette(o, 0.35); const t = this.t0 + lt, cx = o.tctx, S = FO.stars, P = (n) => L.toScreen(this.camera, S[n].x, S[n].y, S[n].z);
        const kd = ease(at('f6', 'dipper') - 0.1, at('f6', 'dipper') + 0.3, t), kp = ease(at('f6', 'two') - 0.1, at('f6', 'two') + 0.3, t), kn = ease(at('f6', 'north') - 0.1, at('f6', 'north') + 0.3, t);
        cx.globalAlpha = kd; ['alkaid', 'mizar', 'alioth', 'megrez', 'dubhe', 'merak', 'phecda', 'megrez'].reduce((a, b) => { const [x0, y0] = P(a), [x1, y1] = P(b); K.line(cx, x0, y0, x1, y1, '#8ab0ff'); return b; });
        if (kd > 0) { const [x, y] = P('alioth'); bitText(cx, 'BIG DIPPER', x, y + 18, 1, '#8ab0ff', { outline: '#000' }); }
        cx.globalAlpha = kp; if (kp > 0) { const [x0, y0] = P('merak'), [x1, y1] = P('polaris'); for (let k = 0; k < 40; k++) { const u = k / 40; if (k % 2 === 0 && u < kp) px(cx, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, '#ffd23f', 2, 2); } }
        cx.globalAlpha = kn; if (kn > 0) { const [x, y] = P('polaris'); cx.strokeStyle = '#ffd23f'; cx.strokeRect(x - 7.5, y - 7.5, 15, 15); bitText(cx, 'NORTH STAR', x, y - 16, 1, '#ffd23f', { outline: '#000' }); bitText(cx, 'N', x, y + 18, 2, '#ffd23f', { outline: '#000' }); } cx.globalAlpha = 1; } };
  }
  shot('85_quiet', FO, 40, (lt, t) => { const z = walkF(lt, -5, 0.45); foAva(0, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'neutral']]); foDog(-0.8, z + 0.6, Math.PI, 'walk', lt); },
    (lt) => V(0.6, 0.2, walkF(lt, -5, 0.45) - 1.6), (lt) => V(0.0, 0.15, walkF(lt, -5, 0.45)));
  shot('86_crows', FO, 46, (lt, t) => { foAva(0, -8, Math.PI, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); }, [[0, 0.8, 2.0, -3.0], [6, 0.6, 2.2, -3.4]], V(0, 4.6, -8.5), LB((lt, o) => { lab(o, 'DOZENS', 470, 70, '#ff4030', 'w2', 'dozens'); }));
  shot('87_crows_close', FO, 28, (lt, t) => { foAva(0, -8, Math.PI, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); const tgt = FO.ava.ch.root.position; FO.crows.forEach((c, i) => { const want = Math.atan2(tgt.x - c.position.x, tgt.z - c.position.z) - c.rotation.y; c.userData.hd.rotation.y = Math.max(-1.2, Math.min(1.2, want * ease(0.3 + (i % 5) * 0.2, 0.8 + (i % 5) * 0.2, lt))); }); },
    [[0, 0.6, 3.2, -3.6], [5, 0.5, 3.15, -3.9]], V(0.0, 4.4, -7.0));
  shot('88_growl', FO, 36, (lt, t) => { foAva(0, -9.5, Math.PI, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); foDog(0.5, -10.2, Math.PI * 0.75, 'growl', lt, { look: V(-4, 1, -14) }); FO.zom.wrap.visible = true; FO.zom.wrap.position.set(-5 + lt * 0.25, 0, -15); FO.zom.wrap.rotation.y = Math.PI / 2; FO.zom.pose('Zombie_Walk', L.q15(t) * 0.7); },
    [[0, 1.6, 0.7, -8.6], [5, 1.5, 0.65, -8.8]], V(-1.5, 0.6, -12));
  const limp = (t) => { FO.zom.pose('Zombie_Walk', L.q15(t) * 0.6); const leg = FO.zom.root.getObjectByName('CityDeadOutfit:LeftLeg'); if (leg) leg.rotateX(-0.5); };
  shot('89_shuffle', FO, 32, (lt, t) => { FO.zom.wrap.visible = true; FO.zom.wrap.position.set(-4.2 + lt * 0.25, 0, -14.5); FO.zom.wrap.rotation.y = Math.PI / 2 - 0.2; limp(t); },
    [[0, -1.5, 1.2, -11.2], [5, -1.2, 1.15, -11.4]], (lt) => V(-4.2 + lt * 0.25, 1.0, -14.5), LB((lt, o) => { lab(o, 'DRAGGING ONE LEG', 470, 280, '#ff4030', 'w4', 'dragging'); }));
  thinkShot(FO, { id: '90_shake_stay', x: 0.6, z: -11.2, yaw: -Math.PI * 0.75, clip: 'squat', from: 0.8, faces: [[-99, 'scared', 'neutral']], mouth: true, ang: 'front', camOff: [0.1, -0.05, 0.9], lookAt: V(-3, 1.0, -14),
    extra: (lt) => { foDog(0.95, -11.8, -Math.PI * 0.8, 'growl', lt, { look: V(-3, 1, -14) }); } });
  shot('91_pass', FO, 40, (lt, t) => { const { ch } = FO.ava; AVA(ch, 1.2, -11.6, -Math.PI * 0.6); ch.pose(lt, L.still('squat', 0.8), [[-99, 'scared', 'neutral']]); foDog(1.6, -12.2, -Math.PI * 0.6, 'stare', lt, { look: V(-1, 1, -12) });
      FO.zom.wrap.visible = true; FO.zom.wrap.position.set(-2.5 + lt * 0.42, 0, -12.6 + lt * 0.05); FO.zom.wrap.rotation.y = Math.PI / 2; limp(t); },
    [[0, -1.6, 0.9, -9.6], [6, -1.2, 0.85, -9.8]], (lt) => V(0.2, 0.9, -12.2));
  thinkShot(FO, { id: '92_breath', x: 1.2, z: -11.6, yaw: -Math.PI * 0.6, clip: 'squat', from: 0.8, faces: [[-99, 'blink', 'gasp']], ang: 'q', camOff: [0.3, -0.05, 0.85] });
  shot('93_prints', FO, 40, (lt, t) => { const { ch } = FO.ava; AVA(ch, 0.3, -11.0, Math.PI); ch.pose(lt, L.still('kneel', 0.8), [[-99, 'scared', 'neutral']]); ch.lookAt({ position: V(0.2, 0, -12.6) }, 0.9, 50); },
    [[0, 1.2, 2.2, -15.6], [6, 1.0, 2.0, -15.2]], V(0.25, 0.0, -13.4), LB((lt, o, sh) => { lab(o, 'BARE FEET', 470, 70, '#ff4030', 'w9', 'bare'); lab(o, 'FRESH', 470, 100, '#ff4030', 'w10', 'fresh'); }));
  shot('93b_boot', FO, 34, (lt, t) => { const { ch } = FO.ava; AVA(ch, 0.05, -12.9, Math.PI * 0.95); ch.pose(lt, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); }, [[0, 1.0, 0.45, -14.2], [5, 0.95, 0.4, -14.0]], V(0.35, 0.05, -13.2), LB((lt, o, sh) => { lab(o, '2x YOUR BOOT', 470, 80, '#ffd23f', 'w9', 'twice', L.toScreen(sh.camera, 0.3, 0.02, -13.4)); }));
  thinkShot(FO, { id: '94_think_print', x: 0.3, z: -11.0, yaw: Math.PI, clip: 'kneel', from: 0.8, faces: [[-99, 'scared', 'frown']], ang: 'high', lookAt: V(0.2, 0, -12.6) });

  // =====================================================================================================================
  // MANSION exterior (diseño propio): cuerpo central con fronton + dos alas, 3 pisos de ventanas negras con marcos de
  // piedra, hiedra, escalinata y puerta doble, tejado de pizarra con chimeneas y buhardillas, verja con portones abiertos.
  // =====================================================================================================================
  const tWallM = tNoise(1060, [120, 116, 104], [96, 92, 82], 32, 32, (c, r) => { for (let y = 0; y < 32; y += 8) px(c, 0, y, 'rgba(40,36,30,0.45)', 32, 1); for (let k = 0; k < 20; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(40,50,30,0.4)', 2, 1 + (r() * 4 | 0)); });
  const tSlate = tNoise(1061, [52, 54, 62], [32, 34, 40], 32, 32, (c) => { for (let y = 0; y < 32; y += 4) px(c, 0, y, '#1a1a20', 32, 1); for (let y = 0; y < 32; y += 4) for (let x = (y % 8) ? 0 : 4; x < 32; x += 8) px(c, x, y, '#1a1a20', 1, 4); });
  const tIvy = L.cvs(32, 32, (c) => { c.clearRect(0, 0, 32, 32); const r = L.rng(1062); for (let k = 0; k < 260; k++) { const x = r() * 32 | 0, y = r() * 32 | 0; if (r() < (y / 32) * 0.6 + 0.4) px(c, x, y, ['#2a4a1e', '#3a6a28', '#1e3a16', '#4a7a30'][k % 4], 2, 2); } });
  const tWin = (seed, lit = false) => L.cvs(16, 24, (c) => { px(c, 0, 0, '#5a564c', 16, 24); px(c, 2, 2, lit ? '#f0b050' : '#060708', 12, 20); px(c, 7, 2, '#3a382e', 2, 20); px(c, 2, 11, '#3a382e', 12, 2); if (!lit) { px(c, 3, 3, 'rgba(90,110,140,0.35)', 3, 4); } });
  const MX = { scene: new THREE.Scene(), far: 420 }; { const s = MX.scene; s.background = new THREE.Color(0x0e1626); s.fog = new THREE.Fog(0x16202e, 8, 70); MX.lit = lights(s, { amb: 0.6, hemi: 0.55, sky: 0x7a90c0, gnd: 0x2a2418 });
    MX.moon = new THREE.DirectionalLight(0x9ab0e0, 1.0); MX.moon.position.set(-20, 30, 20); s.add(MX.moon);
    floorPlane(s, 200, 200, tNoise(1063, [40, 52, 30], [26, 34, 20], 32, 32), 80, 80, 0, 0, 0, 0xb0b0a0); MX.stars = sky(s, { dipper: false });
    floorPlane(s, 3.4, 26, tNoise(1064, [110, 104, 92], [80, 76, 66], 16, 16), 3, 20, 0, -17, 0.01);   // camino de grava
    const HZ = -30, HW = [10, 12, 10];   // fachada en z = -30 (centro adelantado 1.6 m)
    const block = (x0, x1, z, d, h) => { const w = x1 - x0, cx = (x0 + x1) / 2; wallBox(s, w, h, d, tWallM, w / 2, h / 2, cx, h / 2, z - d / 2);
      for (let f = 0; f < 3; f++) { B(w + 0.2, 0.22, 0.25, lam(null, 0x8a8478), cx, f * 4 + 0.05 + (f ? 0 : 0.6), z + 0.08, s); for (let x = x0 + 1.4; x < x1 - 0.8; x += 2.2) { const wy = f * 4 + 2.1; L.plane(1.1, 1.7, lam(tWin(1)), x, wy, z + 0.02, s); B(1.4, 0.18, 0.18, lam(null, 0x9a9488), x, wy + 1.0, z + 0.08, s); B(1.3, 0.1, 0.22, lam(null, 0x9a9488), x, wy - 0.92, z + 0.1, s); } }
      B(w + 0.5, 0.4, d + 0.5, lam(null, 0x7a766c), cx, h + 0.2, z - d / 2, s);
      const roof = cyl(d * 0.72, d * 0.72, w + 0.4, 3, lam(L.rep(tSlate, w / 2, 3)), cx, h + 0.4 + d * 0.36, z - d / 2, s); roof.rotation.z = Math.PI / 2; roof.rotation.x = Math.PI / 2 + Math.PI / 6 * 0;   // prisma triangular
      roof.rotation.set(0, 0, Math.PI / 2); roof.rotateY(Math.PI / 6 * 3);
      for (let x = x0 + 2; x < x1 - 1; x += 3.4) { const dm = new THREE.Group(); dm.position.set(x, h + 1.4, z - 1.2); s.add(dm); B(1.0, 1.1, 0.8, lam(L.rep(tWallM, 1, 1)), 0, 0, 0, dm); L.plane(0.6, 0.8, lam(tWin(2)), 0, 0, 0.41, dm); const cp = cyl(0.62, 0.62, 0.84, 3, lam(L.rep(tSlate, 1, 1)), 0, 0.75, 0, dm); cp.rotation.set(Math.PI / 2, 0, 0); cp.rotateY(Math.PI / 2); }
      for (const xx of [x0 + 1, x1 - 1]) B(0.8, 2.4, 0.8, lam(L.rep(tB, 1, 2)), xx, h + 2.6, z - d / 2, s); };
    block(-17, -6, HZ, 9, 12); block(6, 17, HZ, 9, 12); block(-6, 6, HZ + 1.6, 10.6, 13);
    // fronton + puerta doble + escalinata + columnas
    { const pz = HZ + 1.62; const ped = cyl(3.5, 3.5, 0.5, 3, lam(L.rep(tWallM, 2, 1)), 0, 13.6, pz, s); ped.rotation.set(Math.PI / 2, 0, Math.PI / 2 + Math.PI); ped.scale.set(1.9, 1, 0.5);
      L.mesh(new THREE.CircleGeometry(0.7, 10), lam(tWin(3)), 0, 13.5, pz + 0.27, s);
      B(2.6, 3.4, 0.3, lam(null, 0x5a564c), 0, 1.7 + 0.9, pz + 0.05, s); MX.doorL = new THREE.Group(); MX.doorR = new THREE.Group(); const mDoor = lam(L.rep(tWood(1065, '#3a2414'), 1, 2));
      for (const [g, sx] of [[MX.doorL, -1], [MX.doorR, 1]]) { g.position.set(sx * 1.1, 0.9, pz + 0.22); s.add(g); B(1.1, 3.0, 0.1, mDoor, -sx * 0.55, 1.5, 0, g); B(0.9, 1.1, 0.12, lam(null, 0x2a1a0e), -sx * 0.55, 2.2, 0, g); B(0.9, 1.1, 0.12, lam(null, 0x2a1a0e), -sx * 0.55, 0.8, 0, g); L.mesh(new THREE.SphereGeometry(0.05, 6, 4), lam(null, 0xb89a40), -sx * 0.95, 1.4, 0.08, g); }
      for (let i = 0; i < 6; i++) B(5 - i * 0.2, 0.15, 0.4, lam(L.rep(tStone(1066, [130, 124, 112]), 2, 1)), 0, 0.075 + i * 0.15, pz + 2.4 - i * 0.4, s);
      for (const sx of [-2.2, -1.5, 1.5, 2.2]) { cyl(0.22, 0.25, 7.2, 8, lam(L.rep(tWallM, 1, 3)), sx, 0.9 + 3.6, pz + 1.0, s); B(0.6, 0.3, 0.6, lam(null, 0x8a8478), sx, 0.95 + 7.2, pz + 1.0, s); }
      B(5.4, 0.5, 2.2, lam(L.rep(tWallM, 2, 1)), 0, 8.4, pz + 1.0, s); }
    // hiedra en manchas que suben por la fachada (planos un pelo delante del muro)
    const ivyM = basic(tIvy, 0xffffff, { transparent: true, alphaTest: 0.4, side: DS }); const R = L.rng(1067);
    for (let i = 0; i < 26; i++) { const x = -16 + R() * 32, w = 1.5 + R() * 3, h = 3 + R() * 7; const zf = Math.abs(x) < 6 ? HZ + 1.63 : HZ + 0.03; if (Math.abs(x) < 3) continue; L.plane(w, h, ivyM, x, h / 2, zf, s); }
    // verja (z = -8) con pilares, portones abiertos colgando
    const mIr = lam(null, 0x1a1a1c), FZ = -8; MX.FZ = FZ;
    for (let x = -24; x <= 24; x += 0.25) { if (Math.abs(x) < 2.2) continue; cyl(0.02, 0.02, 2.2, 4, mIr, x, 1.1, FZ, s); L.mesh(new THREE.ConeGeometry(0.04, 0.12, 4), mIr, x, 2.25, FZ, s); }
    for (const y of [0.3, 1.9]) for (const sx of [-1, 1]) B(21.8, 0.04, 0.04, mIr, sx * 13.1, y, FZ, s);
    for (const sx of [-1, 1]) { B(0.7, 2.9, 0.7, lam(L.rep(tStone(1068, [110, 104, 92]), 1, 3)), sx * 2.4, 1.45, FZ, s); B(0.9, 0.2, 0.9, lam(null, 0x8a8478), sx * 2.4, 3.0, FZ, s); cyl(0.2, 0.3, 0.5, 8, lam(null, 0x8a8478), sx * 2.4, 3.35, FZ, s); }
    MX.gates = []; for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 2.1, 0, FZ); s.add(g); for (let k = 0; k < 9; k++) { const x = -sx * (0.1 + k * 0.22); cyl(0.022, 0.022, 2.6 - Math.abs(k - 4) * 0.08, 4, mIr, x, 1.2, 0, g); L.mesh(new THREE.ConeGeometry(0.045, 0.14, 4), mIr, x, 2.55 - Math.abs(k - 4) * 0.04, 0, g); }
      for (const y of [0.3, 1.3, 2.2]) B(2.0, 0.05, 0.05, mIr, -sx * 1.0, y, 0, g); const sc = L.mesh(new THREE.TorusGeometry(0.35, 0.025, 4, 12), mIr, -sx * 1.0, 1.75, 0, g); void sc; g.rotation.y = sx * (Math.PI * 0.42); g.rotation.z = sx * 0.04; MX.gates.push(g);
      L.plane(1.2, 2.0, ivyM, -sx * 0.7, 1.0, 0.03, g); }
    // arboles muertos alrededor, arbustos y la niebla baja
    forest(s, { seed: 1069, n: 90, area: 60, clear: (x, z) => (Math.abs(x) < 22 && z < -6 && z > -45) || (Math.abs(x) < 3 && z > -8 && z < 30) });
    { const R = L.rng(1150); for (let i = 0; i < 80; i++) { const sx = R() < 0.5 ? -1 : 1, x = sx * (18.5 + R() * 16), z = -10 - R() * 44; R() < 0.65 ? conifer(s, x, z, 11 + R() * 14, R) : birch(s, x, z, 8 + R() * 6, R); }
      for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 48, z = -47 - R() * 14; conifer(s, x, z, 13 + R() * 6, R); }
      for (let i = 0; i < 30; i++) { const sx = R() < 0.5 ? -1 : 1; bush(s, sx * (17.5 + R() * 3), -12 - R() * 30, 0.8 + R() * 0.8, R); }
      for (let i = 0; i < 60; i++) { const x = -110 + i * 4 + R() * 2; conifer(s, x, -82 - R() * 3, 8 + R() * 7, R); conifer(s, x + 1.5, -119 - R() * 4, 9 + R() * 8, R); }
      treeline(s, 170, 24, 30); }
    const tDawn = L.cvs(8, 64, (c) => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#16244e'); g.addColorStop(0.32, '#4a68b0'); g.addColorStop(0.45, '#d8909a'); g.addColorStop(0.5, '#f8c890'); g.addColorStop(0.56, '#3a3040'); g.addColorStop(1, '#1a1a22'); c.fillStyle = g; c.fillRect(0, 0, 8, 64); });
    MX.dome = L.mesh(new THREE.SphereGeometry(390, 16, 12), new THREE.MeshBasicMaterial({ map: tDawn, side: THREE.BackSide, fog: false }), 0, 0, 0, s); MX.dome.visible = false;
    MX.sun = L.mesh(new THREE.CircleGeometry(14, 16), new THREE.MeshBasicMaterial({ color: 0xffe0a0, fog: false, transparent: true, opacity: 0.9 }), 300, 10, -240, s); MX.sun.lookAt(0, 0, 0); MX.sun.visible = false;
    for (let i = 0; i < 30; i++) { const x = (R() - 0.5) * 40, z = -9 - R() * 2; if (Math.abs(x) < 3) continue; const m = L.mesh(new THREE.DodecahedronGeometry(0.6 + R() * 0.5, 0), lam(null, [0x1e3016, 0x2a3a1e, 0x162612][i % 3]), x, 0.4, z - 0.6, s); m.scale.y = 0.7; }
    MX.fog = []; const tFogP = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 2, 16, 16, 16); g.addColorStop(0, 'rgba(120,136,160,0.18)'); g.addColorStop(1, 'rgba(170,184,204,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
    for (let i = 0; i < 14; i++) { const m = L.plane(10, 3, basic(tFogP, 0xffffff, { transparent: true, depthWrite: false }), ((i * 37) % 40) - 20, 1.0, -((i * 53) % 30) - 2, s); m.renderOrder = 5; MX.fog.push(m); }
    // rio y puente detras (para el amanecer) + helicoptero
    floorPlane(s, 400, 30, tNoise(1070, [70, 110, 150], [110, 150, 185], 32, 16, (c, r) => { for (let k = 0; k < 40; k++) px(c, r() * 32 | 0, r() * 16 | 0, '#e8f0f8', 3 + (r() * 4 | 0), 1); }), 40, 3, 0, -100, 0.05);
    { const mB = lam(L.rep(tStone(1071, [120, 116, 104]), 2, 1)), mI = lam(null, 0x2a2a2a); for (const zz of [-85, -115]) B(400, 1.2, 1.4, lam(L.rep(tStone(1072, [90, 86, 78]), 100, 1)), 0, 0.5, zz, s);
      B(8, 0.8, 34, mB, 40, 3, -100, s); for (const sx of [-3.9, 3.9]) for (let z = -116; z <= -84; z += 1.5) B(0.12, 1.0, 0.12, mI, 40 + sx, 3.9, z, s); for (const sx of [-3.9, 3.9]) B(0.1, 0.1, 34, mI, 40 + sx, 4.4, -100, s);
      for (const tz of [-92, -108]) { B(1.2, 18, 1.2, mB, 36, 9, tz, s); B(1.2, 18, 1.2, mB, 44, 9, tz, s); B(9.4, 1.2, 1.2, mB, 40, 17, tz, s); B(9.4, 0.8, 1.2, mB, 40, 12, tz, s); }
      for (const sx of [-4, 4]) for (const [z0, z1] of [[-120, -108], [-108, -92], [-92, -80]]) { const a = V(40 + sx, z0 === -108 ? 17.5 : 4, z0), b2 = V(40 + sx, z1 === -92 ? 17.5 : 4, z1); if (z0 === -108) { a.y = 17.5; b2.y = 17.5; } const m = cyl(0.08, 0.08, a.distanceTo(b2), 4, mI, 0, 0, 0, s); m.position.copy(a).lerp(b2, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), b2.clone().sub(a).normalize()); } }
    MX.heli = new THREE.Group(); s.add(MX.heli); { const mH = lam(null, 0x2a3a2a), mG = basic(null, 0x8ab0c8); B(1.4, 1.3, 3.2, mH, 0, 0, 0, MX.heli); B(1.2, 0.9, 1.0, mG, 0, 0.1, 1.6, MX.heli); B(0.3, 0.4, 3.6, mH, 0, 0.2, -3.2, MX.heli); B(0.1, 1.0, 0.6, mH, 0, 0.7, -4.9, MX.heli); for (const sx of [-0.6, 0.6]) B(0.08, 0.08, 2.8, lam(null, 0x1a1a1a), sx, -0.9, 0.2, MX.heli);
      MX.rot = new THREE.Group(); MX.rot.position.y = 0.95; MX.heli.add(MX.rot); for (const a of [0, Math.PI / 2]) { const bl = B(9, 0.04, 0.3, lam(null, 0x1a1a1a), 0, 0, 0, MX.rot); bl.rotation.y = a; }
      MX.heliL = new THREE.SpotLight(0xf0f4ff, 0, 60, 0.25, 0.5, 1); MX.heliL.position.set(0, -0.6, 1.4); MX.heli.add(MX.heliL); MX.heliL.target.position.set(0, -30, 12); MX.heli.add(MX.heliL.target);
      L.mesh(new THREE.SphereGeometry(0.15, 6, 4), basic(null, 0xff3020), 0, 0.8, -4.9, MX.heli); } MX.heli.position.set(36, 12, -96); MX.heli.visible = false;
    MX.ava = mkAva(s); MX.dog = await loadDog(L); s.add(MX.dog.root);
    MX.sky0 = s.background.clone(); MX.fog0 = s.fog.color.clone();
    MX.dawn = (k) => { const dc = new THREE.Color(0x6a8ac8), fc = new THREE.Color(0x8aa0c8); s.background.copy(MX.sky0).lerp(dc, k); s.fog.color.copy(MX.fog0).lerp(fc, k); MX.moon.color.set(k > 0.5 ? 0xffd8b0 : 0x9ab0e0); MX.moon.intensity = 1.0 + 0.6 * k; MX.heli.visible = k > 0.5; s.fog.near = 8 + 20 * k; s.fog.far = 70 + 160 * k; MX.dome.visible = k > 0.5; MX.sun.visible = k > 0.5; s.traverse((o) => { if (o.isPoints) o.visible = k < 0.5; }); };
    MX.reset = (t, lt) => { MX.dawn(0); MX.ava.fl.unaim(); MX.ava.fl.hide(); MX.ava.ch.root.visible = false; MX.dog.root.visible = false; MX.doorL.rotation.y = 0; MX.doorR.rotation.y = 0; MX.fog.forEach((m, i) => { m.position.x = ((i * 37) % 40) - 20 + Math.sin(L.q15(t) * 0.08 + i) * 2; }); MX.rot.rotation.y = L.q15(t) * 30; MX.heli.scale.setScalar(1); };
    MX.post = (lt, t, c) => { MX.fog.forEach((m) => m.lookAt(c.position.x, m.position.y, c.position.z)); }; }
  const mxAva = (x, z, yaw, segs, faces) => { const { ch } = MX.ava; AVA(ch, x, z, yaw); ch.pose(LT, segs, faces || [[-99, 'half', 'neutral']]); return ch; };
  const mxDog = (x, z, yaw, state, lt) => { MX.dog.root.visible = true; MX.dog.root.position.set(x, 0, z); MX.dog.root.rotation.y = yaw; MX.dog.update(lt, state, {}); };
  shot('95_house_fog', MX, 44, (lt, t) => { mxAva(0.4, 6.5, Math.PI, L.still('idle', 0.3), [[-99, 'surprised', 'neutral']]); mxDog(1.1, 6.0, Math.PI, 'stand', lt); s95(); }, [[0, -0.9, 1.5, 9.8], [6, -0.7, 1.5, 9.2]], V(0.6, 4.5, -30));
  function s95() { MX.scene.fog.near = 6; }
  shot('96_mansion', MX, 46, (lt, t) => { mxAva(0.2, -4.5 - lt * 0.25, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.4 })], [[-99, 'half', 'neutral']]); mxDog(0.9, -5.2 - lt * 0.25, Math.PI, 'walk', lt); },
    [[0, 2.5, 1.2, 0.5], [6, 2.2, 1.3, 0.0]], V(0, 6.5, -30), LB((lt, o) => { lab(o, '3 FLOORS', 220, 100, '#e8e8ec', 'x3', 'three'); lab(o, 'IVY', 470, 250, '#62f05a', 'x3', 'ivy'); }));
  shot('97_gates', MX, 36, (lt, t) => { MX.gates.forEach((g, i) => { g.rotation.y = (i ? 1 : -1) * (Math.PI * 0.42 + 0.03 * Math.sin(L.q15(t) * 0.8 + i)); }); }, [[0, 4.4, 0.8, -3.8], [6, 3.0, 2.6, -5.6]], V(1.6, 1.5, -8.6), LB((lt, o) => { lab(o, 'GATES HANGING OPEN', 220, 100, '#ffd23f', 'x3', 'iron'); }));
  thinkShot(MX, { id: '98_think_nobody', x: 0.3, z: -7.4, yaw: Math.PI, faces: [[-99, 'half', 'frown']], ang: 'qL', lookAt: V(0, 8, -30) });
  shot('98b_windows', MX, 40, () => {}, [[0, -4.0, 1.0, -22], [5, -3.6, 1.1, -22.4]], V(-8, 9, -30.5), null, 0.5);
  shot('99_steps', MX, 42, (lt, t) => { const z = -24.0 - lt * 0.42, y = Math.max(0, Math.min(0.9, (-25.6 - z) * 0.375 + 0.9)); mxAva(0, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.45 })], [[-99, 'half', 'neutral']]); MX.ava.ch.root.position.y = Math.max(0, Math.min(0.9, (-(z) - 25.6) * 0.37)); mxDog(0.7, z + 0.6, Math.PI, 'walk', lt); void y; },
    [[0, 3.2, 2.2, -21.5], [5, 2.8, 2.0, -22.0]], V(0, 2.0, -28.4));
  shot('100_go_in', MX, 40, (lt, t) => { const tp = at('x7', 'go'), u = ease(tp - 0.2, tp + 1.0, t); MX.doorL.rotation.y = -1.1 * u; MX.doorR.rotation.y = 1.1 * u; mxAva(0, -27.3, Math.PI, L.still('push_door', 0.4 + 0.8 * u), [[-99, 'half', 'neutral']]); MX.ava.ch.root.position.y = 0.9; mxDog(0.6, -26.8, Math.PI, 'stand', lt); },
    [[0, 1.8, 2.6, -22.8], [5, 1.6, 2.5, -23.4]], V(0, 1.9, -28.4));

  // =====================================================================================================================
  // VESTIBULO (x -7..7, z -7..6, techo 8): marmol, escalera central (z -0.5 -> -4.5, sube a y = 4), galeria, cuadro de
  // familia, chimenea (pared izq.), ventanales con cortinas (der.), araña, puerta principal (z = 6) de 2.3 m de alto.
  // =====================================================================================================================
  const tMarble = L.cvs(64, 64, (c) => { const r = L.rng(1080); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const dark = ((x >> 5) + (y >> 5)) & 1, n = r() * 10 + 8 * Math.sin((x + y * 0.6) * 0.3 + Math.sin(y * 0.2) * 2); px(c, x, y, dark ? K.rgb(46 + n, 56 + n, 52 + n) : K.rgb(206 + n, 204 + n, 196 + n)); } px(c, 0, 31, '#2a2a28', 64, 1); px(c, 31, 0, '#2a2a28', 1, 64); });
  const tPaper = L.cvs(32, 32, (c) => { px(c, 0, 0, '#4a1418', 32, 32); for (let y = 0; y < 32; y += 8) for (let x = (y % 16) ? 4 : 0; x < 32; x += 8) { px(c, x + 2, y + 1, '#6a2a24', 4, 6); px(c, x + 3, y, '#6a2a24', 2, 8); } });
  const tPanel = L.cvs(32, 32, (c) => { const r = L.rng(1081); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, K.rgb(70 + r() * 10, 42 + r() * 8, 24 + r() * 6)); px(c, 3, 3, '#3a200e', 26, 1); px(c, 3, 28, '#8a5a32', 26, 1); px(c, 3, 3, '#3a200e', 1, 26); px(c, 28, 3, '#8a5a32', 1, 26); });
  const tRunner = L.cvs(16, 32, (c) => { px(c, 0, 0, '#7a1418', 16, 32); px(c, 1, 0, '#c89a40', 1, 32); px(c, 14, 0, '#c89a40', 1, 32); for (let y = 0; y < 32; y += 8) { px(c, 6, y + 2, '#c89a40', 4, 4); } });
  const tFamily = L.cvs(64, 48, (c) => { const g = c.createLinearGradient(0, 0, 0, 48); g.addColorStop(0, '#2a2418'); g.addColorStop(1, '#14100a'); c.fillStyle = g; c.fillRect(0, 0, 64, 48);
    const fig = (x, h, col, hair, w = 9) => { px(c, x - w / 2, 48 - h + 8, col, w, h); px(c, x - 3, 48 - h, '#d8c0a8', 6, 8); px(c, x - 3, 48 - h, hair, 6, 2); px(c, x - 2, 48 - h + 3, '#1a1010', 1, 1); px(c, x + 1, 48 - h + 3, '#1a1010', 1, 1); px(c, x - 1, 48 - h + 8, '#e8e0d0', 2, 3); };
    fig(14, 34, '#1a1a22', '#3a2a1a', 11); fig(27, 30, '#4a1a28', '#6a4a2a', 12); fig(40, 22, '#2a3a4a', '#c8a050', 8); fig(51, 18, '#e8e0d0', '#2a1a10', 7); px(c, 0, 0, '#8a6a20', 64, 2); px(c, 0, 46, '#8a6a20', 64, 2); });
  const GH = { scene: new THREE.Scene() }; { const s = GH.scene; s.background = new THREE.Color(0x07080c); s.fog = new THREE.Fog(0x07080c, 10, 28); GH.lit = lights(s, { amb: 0.55, hemi: 0.45, sky: 0x8a9ac0, gnd: 0x3a2a1a });
    floorPlane(s, 14, 13, tMarble, 7, 6.5, 0, -0.5);
    const walls = [[14, 0.2, 0, -7], [0.2, 13, -7, -0.5], [0.2, 13, 7, -0.5]];
    for (const [w, d, x, z] of walls) { wallBox(s, w, 1.3, d, tPanel, Math.max(w, d) / 1.2, 1.2, x, 0.65, z); wallBox(s, w, 6.7, d, tPaper, Math.max(w, d) / 1.6, 4, x, 4.65, z); B(w > 1 ? w : 0.3, 0.15, d > 1 ? d : 0.3, lam(null, 0x3a2414), x, 1.35, z, s); B(w > 1 ? w : 0.35, 0.3, d > 1 ? d : 0.35, lam(null, 0x6a5a40), x, 7.85, z, s); }
    // pared delantera (z = 6) con hueco de puerta 2.2 x 2.3 + fanlight
    { const tCur = tNoise(1091, [130, 20, 24], [90, 10, 14], 8, 16, (c) => { for (let x = 0; x < 8; x += 2) px(c, x, 0, 'rgba(0,0,0,0.3)', 1, 16); }), mF = lam(null, 0x3a2414);
      for (const sx of [-1, 1]) { for (const [a, b] of [[1.1, 2.55], [3.85, 7]]) { const w = b - a, cx = sx * (a + b) / 2; wallBox(s, w, 1.3, 0.2, tPanel, w / 1.2, 1.2, cx, 0.65, 6); wallBox(s, w, 6.7, 0.2, tPaper, w / 1.6, 4, cx, 4.65, 6); }
        const cx = sx * 3.2; wallBox(s, 1.3, 0.4, 0.2, tPanel, 1, 0.4, cx, 0.2, 6); wallBox(s, 1.3, 4.3, 0.2, tPaper, 1, 2.6, cx, 3.6 + 2.15, 6);
        const W = { glass: [], mull: [] }; for (const dx of [-0.66, 0.66]) B(0.14, 3.4, 0.32, mF, cx + dx, 2.0, 6, s); B(1.46, 0.16, 0.32, mF, cx, 3.68, 6, s); B(1.5, 0.12, 0.42, mF, cx, 0.36, 5.95, s);
        W.mull.push(B(0.06, 3.2, 0.08, mF, cx, 2.0, 6, s)); for (const y of [1.2, 2.0, 2.8]) W.mull.push(B(1.2, 0.05, 0.08, mF, cx, y, 6, s));
        for (const gx of [-0.3, 0.3]) for (const gy of [0.8, 1.6, 2.4, 3.2]) W.glass.push(L.plane(0.56, 0.76, basic(null, 0x6a8ab8, { transparent: true, opacity: 0.32, side: DS }), cx + gx, gy, 6.0, s));
        for (const dx of [-0.88, 0.88]) B(0.32, 4.0, 0.12, lam(L.rep(tCur, 1, 2)), cx + dx, 2.1, 5.84, s); B(1.9, 0.12, 0.14, lam(null, 0xb89a40), cx, 4.15, 5.84, s);
        const ml = new THREE.SpotLight(0x8aa0d8, 9, 11, 0.5, 0.6, 1.3); ml.position.set(cx, 3.2, 8.6); ml.target.position.set(cx * 0.7, 0, 2.5); s.add(ml, ml.target);
        if (sx > 0) GH.win = W; } }
    wallBox(s, 2.2, 5.7, 0.2, tPaper, 1.4, 3.5, 0, 2.3 + 2.85, 6); for (const sx of [-1, 1]) B(0.25, 2.5, 0.35, lam(null, 0x3a2414), sx * 1.22, 1.25, 6, s); B(2.7, 0.3, 0.38, lam(null, 0x3a2414), 0, 2.45, 6, s);
    const fan = L.mesh(new THREE.CircleGeometry(1.0, 10, 0, Math.PI), basic(null, 0x2a3a5a), 0, 2.65, 5.89, s); fan.rotation.y = Math.PI; for (let k = 0; k < 5; k++) { const sp = B(0.04, 1.0, 0.04, lam(null, 0x3a2414), Math.cos(Math.PI * k / 4) * 0.5, 2.65 + Math.sin(Math.PI * k / 4) * 0.5, 5.88, s); sp.rotation.z = Math.PI * k / 4 - Math.PI / 2; }
    B(14, 0.2, 13, lam(L.rep(tPanel, 6, 6), 0x6a5a4a), 0, 8.0, -0.5, s);
    // exterior que se ve por la puerta: escalinata azul de noche
    floorPlane(s, 6, 6, tNoise(1082, [70, 76, 88], [50, 56, 66], 16, 16), 2, 2, 0, 9.0, -0.02); L.plane(14, 9, basic(null, 0x16202e), 0, 4, 12, s, Math.PI); floorPlane(s, 10, 5, tNoise(1092, [40, 52, 30], [26, 34, 20], 16, 16), 3, 2, 0, 9.5, -0.03); GH.outL = new THREE.SpotLight(0x8aa0d0, 18, 14, 0.6, 0.6, 1.2); GH.outL.position.set(0, 3.2, 8.5); GH.outL.target.position.set(0, 0, 2); s.add(GH.outL, GH.outL.target);
    GH.doors = []; const mD = lam(L.rep(tWood(1083, '#3a2414'), 1, 2)); for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 1.08, 0, 5.98); s.add(g); B(1.06, 2.28, 0.1, mD, -sx * 0.53, 1.14, 0, g); B(0.8, 0.8, 0.12, lam(null, 0x2a1a0e), -sx * 0.53, 1.6, 0, g); B(0.8, 0.6, 0.12, lam(null, 0x2a1a0e), -sx * 0.53, 0.6, 0, g); L.mesh(new THREE.SphereGeometry(0.05, 6, 4), lam(null, 0xb89a40), -sx * 0.95, 1.1, -0.08, g); GH.doors.push(g); }
    // escalera central
    const mStep = lam(L.rep(tMarble, 0.5, 0.2)), mRun = lam(L.rep(tRunner, 1, 1)); GH.stepY = (z) => Math.max(0, Math.min(4, (-0.5 - z) * 1.0));
    for (let i = 0; i < 20; i++) { const z = -0.5 - i * 0.2 - 0.1, top = (i + 1) * 0.2; B(3.2, top, 0.2, mStep, 0, top / 2, z, s); L.plane(1.6, 0.2, mRun, 0, top + 0.004, z, s, 0, -Math.PI / 2); B(1.6, 0.2, 0.01, mRun, 0, top - 0.1, z + 0.101, s); }
    for (const sx of [-1, 1]) { const rail = B(0.1, 0.1, 4.5, lam(null, 0x3a2414), sx * 1.65, 3.0, -2.5, s); rail.rotation.x = Math.atan2(4, 4); for (let i = 0; i < 20; i += 2) B(0.05, 0.9, 0.05, lam(null, 0x6a4a2a), sx * 1.65, (i + 1) * 0.2 + 0.45, -0.6 - i * 0.2, s); B(0.22, 1.3, 0.22, lam(null, 0x3a2414), sx * 1.65, 0.65, -0.4, s); L.mesh(new THREE.SphereGeometry(0.13, 6, 4), lam(null, 0x3a2414), sx * 1.65, 1.38, -0.4, s); }
    // galeria (y = 4): fondo z -7..-4.5 y lados x |5..7| hasta z = 2, balaustrada
    const mGal = lam(L.rep(tPanel, 4, 1)); B(14, 0.3, 2.5, mGal, 0, 3.85, -5.75, s); for (const sx of [-1, 1]) B(2, 0.3, 6.5, mGal, sx * 6, 3.85, -1.25, s);
    const balL = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.3); for (let i = 0; i <= n; i++) B(0.06, 0.8, 0.06, lam(null, 0x6a4a2a), x0 + (x1 - x0) * i / n, 4.4, z0 + (z1 - z0) * i / n, s); const r = B(Math.abs(x1 - x0) + 0.1, 0.1, Math.abs(z1 - z0) + 0.1, lam(null, 0x3a2414), (x0 + x1) / 2, 4.85, (z0 + z1) / 2, s); void r; };
    balL(-5, -4.5, -1.65, -4.5); balL(1.65, -4.5, 5, -4.5); balL(-5, -4.5, -5, 2); balL(5, -4.5, 5, 2);
    for (const [x, z] of [[-5, 2], [5, 2], [-5, -4.5], [5, -4.5]]) B(0.35, 4, 0.35, lam(L.rep(tWallM, 1, 3), 0xd0c8b8), x, 2, z, s);
    // cuadro de familia sobre la galeria
    L.plane(3.2, 2.4, lam(await L.loadTex('tex/family_portrait_ps1.png', 192)), 0, 6.0, -6.88, s); B(3.5, 0.18, 0.12, lam(null, 0x8a6a20), 0, 7.28, -6.86, s); B(3.5, 0.18, 0.12, lam(null, 0x8a6a20), 0, 4.72, -6.86, s); for (const sx of [-1, 1]) B(0.18, 2.7, 0.12, lam(null, 0x8a6a20), sx * 1.7, 6.0, -6.86, s);
    GH.paintL = new THREE.SpotLight(0xffe0b0, 0, 6, 0.6, 0.5, 1.2); GH.paintL.position.set(0, 4.6, -5.2); GH.paintL.target.position.set(0, 6, -6.9); s.add(GH.paintL, GH.paintL.target);
    // puertas de la galeria (a los pasillos)
    for (const sx of [-1, 1]) { B(1.2, 2.3, 0.1, lam(L.rep(tWood(1084, '#3a2414'), 1, 2)), sx * 3.5, 4.0 + 1.15, -6.88, s); B(1.5, 0.2, 0.14, lam(null, 0x3a2414), sx * 3.5, 6.4, -6.88, s); }
    // chimenea (pared izquierda, z = 1.5)
    { const fz = 1.5, tSt = tStone(1085, [128, 120, 104]); for (const dz of [-1.075, 1.075]) B(0.7, 2.0, 0.65, lam(L.rep(tSt, 1, 2)), -6.6, 1.0, fz + dz, s); B(0.7, 0.9, 1.5, lam(L.rep(tSt, 1, 1)), -6.6, 1.55, fz, s); B(0.9, 0.08, 2.6, lam(L.rep(tSt, 2, 1), 0x8a8478), -6.4, 0.04, fz, s); B(0.9, 0.2, 3.2, lam(null, 0x6a5a48), -6.5, 2.05, fz, s); B(0.5, 4.0, 2.0, lam(L.rep(tSt, 1, 3)), -6.75, 4.1, fz, s);
      L.plane(1.5, 1.2, basic(null, 0x0a0604), -6.88, 0.6, fz, s, Math.PI / 2); for (let k = 0; k < 3; k++) { const lg = cyl(0.08, 0.08, 1.0, 6, lam(L.rep(tBark, 1, 1)), -6.6, 0.12 + (k === 2 ? 0.12 : 0), fz + (k - 1) * 0.15, s); lg.rotation.x = Math.PI / 2; lg.rotation.z = (k - 1) * 0.3; }
      GH.fire = new THREE.Group(); GH.fire.position.set(-6.55, 0.15, fz); s.add(GH.fire); for (let k = 0; k < 7; k++) { const f = L.mesh(new THREE.ConeGeometry(0.12, 0.6, 5), basic(null, [0xffb030, 0xff7020, 0xffd060][k % 3], { transparent: true, opacity: 0.9 }), 0, 0.3, (k - 3) * 0.12, GH.fire); f.userData.k = k; }
      GH.fireL = new THREE.PointLight(0xff9a40, 0, 9, 1.3); GH.fireL.position.set(-5.6, 1.0, fz); s.add(GH.fireL);
      for (let k = 0; k < 14; k++) { const lg = cyl(0.07, 0.07, 0.5, 6, lam(L.rep(tBark, 1, 1)), -6.4, 0.08 + Math.floor(k / 4) * 0.13, fz + 2.0 + (k % 4) * 0.15, s); lg.rotation.z = Math.PI / 2; }   // leña apilada
      for (const dz of [-1.0, 1.0]) { cyl(0.04, 0.05, 0.3, 6, lam(null, 0xb89a40), -6.45, 2.3, fz + dz, s); cyl(0.02, 0.02, 0.15, 5, basic(null, 0xe8e0c8), -6.45, 2.52, fz + dz, s); } }
    // ventanales con cortinas (derecha); a la del medio le falta la cortina (Ava la usa)
    GH.curtain = []; for (const [i, z] of [[0, -3.5], [1, -0.5], [2, 2.5]]) { L.plane(1.4, 3.2, basic(null, 0x2a3a5a), 6.89, 2.6, z, s, -Math.PI / 2); B(0.1, 3.4, 0.08, lam(null, 0x2a1a0e), 6.86, 2.6, z, s); B(0.1, 0.08, 1.5, lam(null, 0x2a1a0e), 6.86, 2.6, z, s);
      for (const sz of [-1, 1]) { const ct = B(0.08, 3.8, 0.6, lam(L.rep(tNoise(1086, [130, 20, 24], [90, 10, 14], 8, 16, (c) => { for (let x = 0; x < 8; x += 2) px(c, x, 0, 'rgba(0,0,0,0.3)', 1, 16); }), 1, 2)), 6.8, 2.5, z + sz * 0.9, s); if (i === 1 && sz > 0) GH.curtain.push(ct); }
      const ml = new THREE.SpotLight(0x8aa0d8, 10, 12, 0.5, 0.6, 1.3); ml.position.set(8.5, 4.5, z); ml.target.position.set(3, 0, z - 1); s.add(ml, ml.target); }
    // araña de cristal (cuelga del techo, se balancea)
    GH.chand = new THREE.Group(); GH.chand.position.set(0, 8, 1.5); s.add(GH.chand); { cyl(0.015, 0.015, 1.8, 4, lam(null, 0x3a3a30), 0, -0.9, 0, GH.chand); const ring = L.mesh(new THREE.TorusGeometry(0.7, 0.04, 4, 14), lam(null, 0xb89a40), 0, -1.9, 0, GH.chand); ring.rotation.x = Math.PI / 2;
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; cyl(0.02, 0.02, 0.12, 5, basic(null, 0xe8e0c8), Math.cos(a) * 0.7, -1.82, Math.sin(a) * 0.7, GH.chand); L.mesh(new THREE.OctahedronGeometry(0.05, 0), basic(null, 0xc8d8e8), Math.cos(a) * 0.7, -2.05, Math.sin(a) * 0.7, GH.chand); } L.mesh(new THREE.OctahedronGeometry(0.14, 0), basic(null, 0xc8d8e8), 0, -2.2, 0, GH.chand); }
    // reloj de pie, maquina de escribir en mesita, maceta con hierba verde, alfombra
    { const ck = new THREE.Group(); ck.position.set(-3.2, 0, -4.4); s.add(ck); B(0.6, 2.2, 0.4, lam(L.rep(tWood(1087, '#4a2a14'), 1, 3)), 0, 1.1, 0, ck); L.mesh(new THREE.CircleGeometry(0.2, 12), basic(null, 0xe8e0c8), 0, 1.75, 0.21, ck); B(0.04, 0.6, 0.02, lam(null, 0xb89a40), 0, 0.9, 0.21, ck); }
    { const tb = new THREE.Group(); tb.position.set(4.2, 0, 4.4); s.add(tb); B(0.9, 0.05, 0.5, lam(L.rep(tWood(1088), 1, 1)), 0, 0.78, 0, tb); for (const [x, z] of [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]]) B(0.04, 0.78, 0.04, lam(null, 0x3a2414), x, 0.39, z, tb); B(0.36, 0.1, 0.26, lam(null, 0x161616), 0, 0.85, 0, tb); B(0.38, 0.12, 0.1, lam(null, 0x161616), 0, 0.93, -0.08, tb);
      cyl(0.11, 0.09, 0.2, 8, lam(null, 0x8a5a3a), -0.3, 0.9, 0.1, tb); for (let k = 0; k < 5; k++) { const lf = L.mesh(new THREE.ConeGeometry(0.06, 0.25, 4), lam(null, 0x3a9a3a), -0.3 + Math.sin(k * 1.3) * 0.05, 1.12, 0.1 + Math.cos(k * 1.3) * 0.05, tb); lf.rotation.set(Math.sin(k) * 0.4, k, Math.cos(k) * 0.4); } }
    floorPlane(s, 3.2, 4.4, tNoise(1089, [110, 20, 26], [70, 12, 16], 16, 16, (c) => { px(c, 0, 0, '#c89a40', 16, 1); px(c, 0, 15, '#c89a40', 16, 1); px(c, 0, 0, '#c89a40', 1, 16); px(c, 15, 0, '#c89a40', 1, 16); }), 1, 1, 0, 3.4, 0.006);
    // LARGO 3 v2: detalle del interior (zocalos, apliques, cuadros, muebles, macetas, alfombra, telarañas)
    { const mDk = lam(null, 0x2a1a0e), mG = lam(null, 0xb89a40), mVel = lam(L.rep(tNoise(1093, [120, 24, 30], [80, 14, 18], 8, 8), 1, 1)), mW2 = lam(L.rep(tWood(1094, '#4a2a14'), 1, 1));
      const tWebG = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.strokeStyle = 'rgba(220,220,220,0.55)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(16 * Math.cos(k * 0.3), 16 * Math.sin(k * 0.3)); c.stroke(); } for (let r = 4; r < 16; r += 4) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI / 2); c.stroke(); } });
      GH.webT = tWebG; const cob = (x, y, z, ry, rz = 0, sc = 1) => { const m = L.plane(1.0 * sc, 1.0 * sc, basic(tWebG, 0xffffff, { transparent: true, depthWrite: false, side: DS }), x, y, z, s, ry); m.rotation.z = rz; };
      const sconce = (x, y, z, ry, light) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; s.add(g); B(0.12, 0.24, 0.04, mG, 0, 0, 0, g); B(0.34, 0.03, 0.03, mG, 0, -0.06, 0.08, g); for (const dx of [-0.15, 0.15]) { cyl(0.025, 0.025, 0.12, 6, basic(null, 0xe8e0c8), dx, 0.0, 0.1, g); L.mesh(new THREE.ConeGeometry(0.016, 0.05, 5), basic(null, 0xffd060), dx, 0.09, 0.1, g); } if (light) { const pl = new THREE.PointLight(0xffc070, 2.0, 5, 1.5); pl.position.set(0, 0.1, 0.35); g.add(pl); } };
      const frame = (x, y, z, ry, w, h, seed) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; s.add(g); B(w + 0.14, h + 0.14, 0.05, mG, 0, 0, 0, g);
        L.plane(w, h, lam(L.cvs(16, 20, (c) => { const r = L.rng(seed); const g2 = c.createLinearGradient(0, 0, 0, 20); g2.addColorStop(0, '#2a2418'); g2.addColorStop(1, '#0e0a06'); c.fillStyle = g2; c.fillRect(0, 0, 16, 20);
          if (seed % 2) { px(c, 5, 3, '#b8a080', 6, 7); px(c, 5, 3, '#3a2a1a', 6, 2); px(c, 3, 10, ['#3a2a3a', '#2a3a2a', '#4a1a1a'][seed % 3], 10, 10); px(c, 6, 6, '#1a1010', 1, 1); px(c, 9, 6, '#1a1010', 1, 1); } else { px(c, 0, 12, '#2a3020', 16, 8); for (let k = 0; k < 6; k++) px(c, r() * 14 | 0, 6 + (r() * 6 | 0), '#14140e', 2, 8); px(c, 0, 3, '#4a4a5a', 16, 3); } })), 0, 0, 0.03, g); };
      for (const sx of [-1, 1]) B(0.05, 0.16, 13, mDk, sx * 6.88, 0.08, -0.5, s); B(14, 0.16, 0.05, mDk, 0, 0.08, -6.88, s);
      sconce(-6.86, 2.7, -3.6, Math.PI / 2, true); sconce(-6.86, 2.7, 4.6, Math.PI / 2, false); sconce(6.86, 2.7, -2.0, -Math.PI / 2, false); sconce(6.86, 2.7, 1.0, -Math.PI / 2, true); sconce(6.86, 2.7, 4.3, -Math.PI / 2, false);
      frame(-6.86, 3.4, -1.6, Math.PI / 2, 0.9, 1.2, 1161); frame(-6.86, 3.3, 4.4, Math.PI / 2, 1.1, 0.8, 1162); frame(6.86, 3.6, -3.5, -Math.PI / 2, 0.7, 0.9, 1163); frame(6.86, 3.6, 2.5, -Math.PI / 2, 0.7, 0.9, 1165); frame(-4.2, 2.2, -6.86, 0, 1.0, 0.7, 1164); frame(4.2, 2.2, -6.86, 0, 0.8, 1.1, 1167);
      const armchair = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; s.add(g); B(0.8, 0.42, 0.75, mVel, 0, 0.3, 0, g); B(0.8, 0.75, 0.16, mVel, 0, 0.75, -0.32, g); for (const ax of [-0.36, 0.36]) B(0.12, 0.55, 0.72, mVel, ax, 0.42, 0, g); for (const [lx, lz] of [[-0.34, -0.3], [0.34, -0.3], [-0.34, 0.3], [0.34, 0.3]]) B(0.06, 0.12, 0.06, mDk, lx, 0.06, lz, g); };
      armchair(-4.4, -0.4, -Math.PI / 2 - 0.5); armchair(-4.2, 3.5, -Math.PI / 2 + 0.5);
      const table = (x, z, h = 0.7) => { cyl(0.32, 0.32, 0.04, 10, mW2, x, h, z, s); cyl(0.04, 0.06, h, 6, mDk, x, h / 2, z, s); cyl(0.2, 0.22, 0.04, 8, mDk, x, 0.02, z, s); };
      table(-3.9, 1.5, 0.6); cyl(0.06, 0.1, 0.3, 8, lam(null, 0x2a4a6a), -3.9, 0.77, 1.5, s);
      B(2.4, 0.06, 0.5, mW2, 5.9, 0.82, -0.5, s); for (const dx of [-1.1, 1.1]) B(0.06, 0.82, 0.45, mDk, 5.9 + 0 * dx, 0.41, -0.5 + dx, s); cyl(0.08, 0.1, 0.05, 8, mG, 5.9, 0.87, -0.9, s); cyl(0.015, 0.015, 0.35, 5, mG, 5.9, 1.05, -0.9, s); for (const dz of [-0.12, 0.12]) cyl(0.02, 0.02, 0.12, 5, basic(null, 0xe8e0c8), 5.9, 1.25, -0.9 + dz, s);
      const palm = (x, z) => { cyl(0.2, 0.15, 0.4, 8, lam(null, 0x6a4a2a), x, 0.2, z, s); for (let k = 0; k < 7; k++) { const lf = L.mesh(new THREE.ConeGeometry(0.08, 0.9, 4), lam(null, 0x2a5a2a), x + Math.cos(k) * 0.18, 0.75, z + Math.sin(k) * 0.18, s); lf.rotation.set(Math.sin(k) * 0.6, k, Math.cos(k) * 0.6); } };
      palm(-1.7, 5.4); palm(1.7, 5.4); palm(-5.4, -6.2); palm(5.4, -6.2);
      floorPlane(s, 2.6, 3.6, tNoise(1095, [70, 30, 30], [40, 16, 16], 16, 16, (c) => { px(c, 0, 0, '#a08040', 16, 1); px(c, 0, 15, '#a08040', 16, 1); px(c, 0, 0, '#a08040', 1, 16); px(c, 15, 0, '#a08040', 1, 16); px(c, 6, 6, '#a08040', 4, 4); }), 1, 1, -4.9, 1.5, 0.006);
      for (const [x, y, z, ry, rz] of [[-6.85, 7.4, -6.85, Math.PI / 4, 0], [6.85, 7.4, -6.85, -Math.PI / 4, Math.PI / 2], [-4.9, 3.55, -4.6, 0, Math.PI], [4.9, 3.55, -4.6, 0, -Math.PI / 2], [-6.85, 7.4, 5.85, Math.PI * 0.75, 0], [1.6, 1.3, -0.45, 0, Math.PI]]) cob(x, y, z, ry, rz); }
    // polvo en el aire
    GH.dust = []; for (let i = 0; i < 40; i++) { const m = L.mesh(new THREE.PlaneGeometry(0.03, 0.03), basic(null, 0xd8d0c0, { transparent: true, opacity: 0.6 }), 0, 0, 0, s); GH.dust.push(m); }
    // astillas/cristales de la puerta que revienta
    GH.deb = []; for (let i = 0; i < 40; i++) { const m = i % 3 ? B(0.06 + (i % 5) * 0.04, 0.03, 0.18 + (i % 4) * 0.08, lam(null, 0x3a2414), 0, -5, 0, s) : L.mesh(new THREE.TetrahedronGeometry(0.06, 0), basic(null, 0xa8c0d8), 0, -5, 0, s); GH.deb.push(m); }
    // Ava (+ cortina roja), Ribbon, el Stalker
    GH.ava = mkAva(s); giveGun(GH.ava); GH.dog = await loadDog(L); s.add(GH.dog.root); GH.st = makeStalker(s);
    GH.cape = L.mesh(new THREE.CylinderGeometry(0.27, 0.42, 0.7, 12, 1, true, Math.PI * 0.4, Math.PI * 1.2), lam(L.rep(tNoise(1090, [140, 20, 24], [90, 10, 14], 8, 16, (c) => { for (let x = 0; x < 8; x += 2) px(c, x, 0, 'rgba(0,0,0,0.3)', 1, 16); }), 2, 1), 0xffffff, { side: DS }), 0, 0, 0, s); GH.cape.visible = false;
    // torch en la mano izquierda (linterna propia: cuerpo + foco que cuelga del hueso)
    { const ch = GH.ava.ch, tg = new THREE.Group(); cyl(0.016, 0.016, 0.13, 8, lam(null, 0x1a1a1c), 0, 0, 0, tg).rotation.z = Math.PI / 2; cyl(0.022, 0.022, 0.004, 8, basic(null, 0xfff6c0), 0.066, 0, 0, tg).rotation.z = Math.PI / 2;
      const sp = new THREE.SpotLight(0xfff0c8, 0, 12, 0.35, 0.5, 1.1); sp.position.set(0.07, 0, 0); tg.add(sp); const tt = new THREE.Object3D(); tt.position.set(3, 0, 0); tg.add(tt); sp.target = tt; L.holdIn(ch, tg, 'L', [0, 0.75, 0.22], [0, 0, Math.PI / 2]); GH.torch = tg; GH.torchL = sp; tg.visible = false; }
    GH.keyL = new THREE.PointLight(0xd8e0ff, 0, 5, 1.4); s.add(GH.keyL);
    GH.crack = L.plane(2.2, 2.2, basic(L.cvs(32, 32, (c) => { c.clearRect(0, 0, 32, 32); c.strokeStyle = 'rgba(20,20,20,0.85)'; const r = L.rng(1180); for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(16, 16); let x = 16, y = 16; const a = k / 9 * 6.28 + r() * 0.4; for (let j = 0; j < 4; j++) { x += Math.cos(a + (r() - 0.5)) * 4; y += Math.sin(a + (r() - 0.5)) * 4; c.lineTo(x, y); } c.stroke(); } }), 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }), 2.3, 0.012, 3.4, s, 0, -Math.PI / 2); GH.crack.visible = false; GH.crack.renderOrder = 3;
    GH.puff = []; for (let i = 0; i < 10; i++) { const m = L.plane(0.9, 0.6, basic(tGlow, 0xb8b0a0, { transparent: true, opacity: 0.5, depthWrite: false }), 0, -5, 0, s); m.renderOrder = 5; GH.puff.push(m); }
    // v3: alfombras/caminos sobre el marmol y los peldaños parpadeaban (z-fighting a 5 mm + wobble PS1): se separan 2 cm y se
    // dibujan con polygonOffset por delante de lo que tienen debajo
    GH.scene.traverse((o) => { if (!o.isMesh || !o.geometry || o.geometry.type !== 'PlaneGeometry' || o.material.transparent) return; if (Math.abs(o.rotation.x + Math.PI / 2) > 0.01) return;
      const p = o.geometry.parameters; if (p.width >= 14) return; o.position.y += 0.015; o.material.polygonOffset = true; o.material.polygonOffsetFactor = -2; o.material.polygonOffsetUnits = -4; o.renderOrder = 1; });
    GH.reset = (t, lt) => { GH.keyL.intensity = 0; GH.crack.visible = false; GH.puff.forEach((m) => { m.position.y = -5; }); GH.win.glass.forEach((g) => { g.visible = true; }); GH.win.mull.forEach((m) => { if (m.userData.p0) { m.position.copy(m.userData.p0); m.rotation.set(0, 0, 0); } }); GH.ava.ch.root.visible = false; GH.ava.gun.visible = false; GH.torch.visible = false; if (ghPool) ghPool(V(), V(0, 1, 0), 0); GH.torchL.intensity = 0; GH.dog.root.visible = false; GH.st.wrap.visible = false; GH.cape.visible = false; GH.fire.visible = false; GH.fireL.intensity = 0; GH.paintL.intensity = 0; GH.curtain.forEach((c) => { c.visible = true; });
      GH.doors.forEach((d, i) => { d.position.set((i ? 1 : -1) * 1.08, 0, 5.98); d.rotation.set(0, 0, 0); d.visible = true; }); GH.deb.forEach((m) => { m.position.y = -5; }); GH.chand.rotation.set(0, 0, 0); GH.dust.forEach((m, i) => { const u = ((L.q15(t) * 0.05 + i * 0.137) % 1); m.position.set(Math.sin(i * 2.7) * 4, 0.5 + u * 6, Math.cos(i * 1.9) * 4 + 1); }); GH.outL.intensity = 4; GH.outL.position.set(0, 3.2, 8.5); };
    GH.post = (lt, t, c) => { GH.dust.forEach((m) => m.quaternion.copy(c.quaternion)); }; }
  const fireOn = (t) => { GH.fire.visible = true; GH.fireL.intensity = 7 + Math.sin(L.q15(t) * 11) * 1.2; GH.fire.children.forEach((f) => { const k = f.userData.k; f.scale.set(1, 0.7 + 0.5 * Math.abs(Math.sin(L.q15(t) * 7 + k * 1.7)), 1); }); GH.curtain.forEach((c) => { c.visible = false; }); };
  const ghAva = (x, z, yaw, segs, faces, y) => { const { ch } = GH.ava; AVA(ch, x, z, yaw, y ?? GH.stepY(z) * (Math.abs(x) < 1.7 ? 1 : 0)); ch.pose(LT, segs, faces || [[-99, 'half', 'neutral']]); return ch; };
  const ghDog = (x, z, yaw, state, lt, opts = {}, y = 0) => { GH.dog.root.visible = true; GH.dog.root.position.set(x, y, z); GH.dog.root.rotation.y = yaw; GH.dog.update(lt, state, opts); };
  const stalk = (x, z, yaw, o = {}, y = 0) => { GH.st.wrap.visible = true; GH.st.wrap.position.set(x, y, z); GH.st.wrap.rotation.y = yaw; GH.st.pose(o); };
  const capeOn = (ch) => { ch.root.updateMatrixWorld(true); const hp = ch.bone.getObjectByName('Neck').getWorldPosition(V()); GH.cape.visible = true; GH.cape.position.set(hp.x, hp.y - 0.4, hp.z); GH.cape.scale.set(1, 1.0, 1); GH.cape.rotation.y = ch.root.rotation.y; };
  shot('101_hall', GH, 50, (lt, t) => { const tp = at('y1', 'closes'), u = ease(tp - 0.3, tp + 0.4, t); GH.doors[0].rotation.y = -1.2 * (1 - u); GH.doors[1].rotation.y = 1.2 * (1 - u); GH.outL.intensity = 18 * (1 - u) + 2; ghAva(0, 4.2, Math.PI, L.still('idle', 0.3), [[-99, 'surprised', 'neutral']], 0); ghDog(0.7, 3.6, Math.PI, 'stand', lt); },
    [[0, 4.6, 6.2, -5.6], [6, 4.2, 6.0, -5.2]], V(0, 0.6, 2.8), LB((lt, o) => { lab(o, 'MARBLE', 160, 280, '#e8e8ec', 'y1', 'marble'); }));
  shot('102_painting', GH, 34, (lt, t) => { GH.paintL.intensity = 8; }, [[0, 0.3, 5.0, -1.8], [5, 0.2, 5.4, -2.6]], V(0, 6.0, -6.9), LB((lt, o) => { lab(o, 'A FAMILY NOBODY REMEMBERS', LW / 2, 330 - 40, '#e8e8ec', 'y1', 'family'); }));
  shot('103_fireplace', GH, 38, (lt, t) => { ghAva(-4.6, 2.0, -Math.PI / 2, L.still('idle', 0.3), [[-99, 'surprised', 'smile']], 0); }, [[0, -3.4, 1.5, -0.6], [5, -3.7, 1.4, -0.3]], V(-6.4, 0.8, 1.9), LB((lt, o, sh) => { lab(o, 'DRY WOOD', 470, 70, '#ff7b2e', 'y3', 'dry', L.toScreen(sh.camera, -6.4, 0.3, 3.7)); }));
  shot('104_fire', GH, 40, (lt, t) => { fireOn(t); const ch = ghAva(-5.0, 1.5, -Math.PI / 2, L.still('sit_floor', 0.9), [[-99, 'half', 'smile']], 0); capeOn(ch); ghDog(-5.4, 2.6, -Math.PI / 2 - 0.4, 'sleep', lt); },
    [[0, -2.9, 1.5, 0.2], [6, -3.1, 1.45, 0.4]], V(-5.3, 0.6, 1.6), LB((lt, o) => { lab(o, 'CURTAIN', 470, 70, '#ff4030', 'y4', 'curtain'); lab(o, 'FIRE', 470, 100, '#ff7b2e', 'y4', 'fire'); }));
  shot('105_ribbon_fire', GH, 30, (lt, t) => { fireOn(t); const ch = ghAva(-5.0, 1.5, -Math.PI / 2, L.still('sit_floor', 0.9), [[-99, 'half', 'smile']], 0); capeOn(ch); ghDog(-5.5, 2.5, -Math.PI / 2 - 0.4, 'sleep', lt); GH.dog.root.updateMatrixWorld(true); },
    (lt) => { const h = GH.dog.head.getWorldPosition(V()); return h.clone().add(V(1.6, 0.45, 0.9 - lt * 0.03)); }, () => GH.dog.head.getWorldPosition(V()).add(V(-0.1, -0.1, 0)));
  thinkShot(GH, { id: '106_think_warm', x: -5.0, z: 1.5, yaw: -Math.PI / 2, clip: 'sit_floor', from: 0.9, faces: [[-99, 'happy', 'smile']], ang: 'q', camOff: [0.55, 0.05, 1.0], extra: (lt, t) => { fireOn(t); capeOn(GH.ava.ch); ghDog(-5.5, 2.5, -Math.PI / 2 - 0.4, 'sleep', lt); } });
  shot('108_drop', GH, 40, (lt, t) => { fireOn(t); const ch = ghAva(-5.0, 1.5, -Math.PI / 4, L.still('sit_floor', 0.9), [[-99, 'scared', 'neutral']], 0); capeOn(ch); ch.lookAt({ position: V(0, 5, -6) }, 0.9, 60); GH.dust.forEach((m, i) => { m.position.y = 7.5 - ((L.q15(t) * 0.8 + i * 0.1) % 3.5); m.position.x = Math.sin(i) * 1.5; m.position.z = -5.5 + Math.cos(i) * 0.6; }); },
    [[0, -4.4, 1.2, 2.6], [5, -4.2, 1.15, 2.3]], V(0, 4.6, -5.5), LB((lt, o) => { lab(o, 'UPSTAIRS', 470, 70, '#ff4030', 'z1', 'upstairs'); }));
  shot('109_step', GH, 40, (lt, t) => { GH.chand.rotation.z = 0.06 * Math.sin(lt * 2.2) * Math.exp(-lt * 0.3) + 0.05 * Math.sin(Math.max(0, lt - 0.6) * 2.4); GH.keyL.intensity = 5; GH.keyL.position.set(1.2, 6.4, 3.2); }, [[0, 2.6, 1.3, 4.9], [5, 2.4, 1.4, 4.6]], V(0, 6.1, 1.5), LB((lt, o) => { lab(o, 'ANOTHER STEP', 470, 70, '#ff4030', 'z2', 'another'); }));
  // v3: charco de luz de la linterna de la mano izquierda (110): mismo recurso que r2kit.flashlight
  const tPoolX = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,246,214,1)'); g.addColorStop(0.55, 'rgba(255,238,196,0.55)'); g.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const mkPoolX = (scene, skip) => { const pool = L.mesh(new THREE.CircleGeometry(1, 20), basic(tPoolX, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), 0, 0, 0, scene); pool.renderOrder = 5; pool.visible = false;
    const rc = new THREE.Raycaster(), N3 = new THREE.Matrix3(), shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    return (lp, d, k) => { const own = new Set(); skip.forEach((r) => r.traverse((o) => own.add(o))); const cand = []; scene.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh && o !== pool && !own.has(o) && !(o.material && (o.material.transparent || o.material.blending === THREE.AdditiveBlending)) && shown(o)) cand.push(o); });
      rc.set(lp, d); rc.near = 0.08; rc.far = 14; const hit = rc.intersectObjects(cand, false)[0]; if (!hit || !hit.face || k <= 0) { pool.visible = false; return; }
      const n = hit.face.normal.clone().applyMatrix3(N3.getNormalMatrix(hit.object.matrixWorld)).normalize(); if (n.dot(d) > 0) n.negate(); const r = Math.max(0.18, hit.distance * 0.32);
      pool.visible = true; pool.position.copy(hit.point).addScaledVector(n, 0.012); pool.lookAt(hit.point.clone().add(n)); pool.scale.set(r, r, 1); pool.material.opacity = Math.min(0.5, k * 0.6 / (1 + 0.03 * hit.distance * hit.distance)); }; };
  let ghPool = null;
  shot('110_gun_stairs', GH, 46, (lt, t) => { const z = -0.2 - lt * 0.55, ch = ghAva(0.2, z, Math.PI, [L.seg('walk', 0, { loop: true, speed: 0.45 })], [[-99, 'scared', 'neutral']]); GH.ava.gun.visible = true; GH.torch.visible = true; GH.torchL.intensity = 18; ghDog(0.8, z + 0.8, Math.PI, 'walk', lt, {}, GH.stepY(z + 0.8));
      ghPool = ghPool || mkPoolX(GH.scene, [GH.ava.ch.root, GH.dog.root]); ch.root.updateMatrixWorld(true); const lp = GH.torch.localToWorld(V(0.11, 0, 0)); ghPool(lp, GH.torch.localToWorld(V(1.11, 0, 0)).sub(lp).normalize(), 1); },
    [[0, 3.6, 2.4, 3.4], [6, 3.2, 3.0, 2.2]], (lt) => V(0, 1.4 + lt * 0.4, -0.6 - lt * 0.5), LB((lt, o) => { lab(o, '15 BULLETS', 470, 70, '#ffd23f', 'z3', 'fifteen'); }));
  // ---- PASILLO de arriba (lamparas de aceite) + cuarto del muerto
  const UH = { scene: new THREE.Scene() }; { const s = UH.scene; s.background = new THREE.Color(0x060608); s.fog = new THREE.Fog(0x060608, 5, 18); lights(s, { amb: 0.45, hemi: 0.35, sky: 0xd8c8a8 });
    const tPaperG = L.cvs(32, 32, (c) => { px(c, 0, 0, '#22301e', 32, 32); for (let y = 0; y < 32; y += 8) for (let x = (y % 16) ? 4 : 0; x < 32; x += 8) { px(c, x + 2, y + 1, '#3a4a2a', 4, 6); } });
    floorPlane(s, 2.6, 16, tWood(1100, '#5a3a22'), 2, 16, 0, -7); floorPlane(s, 1.2, 15.4, tRunner, 1, 12, 0, -7, 0.005);
    for (const sx of [-1, 1]) { wallBox(s, 0.2, 1.1, 16, tPanel, 12, 1, sx * 1.3, 0.55, -7); wallBox(s, 0.2, 2.0, 16, tPaperG, 10, 1.4, sx * 1.3, 2.1, -7); B(0.25, 0.1, 16, lam(null, 0x3a2414), sx * 1.28, 1.12, -7, s); }
    B(2.6, 0.1, 16, lam(L.rep(tPanel, 2, 8), 0x5a4a3a), 0, 3.1, -7, s); wallBox(s, 2.6, 3.1, 0.2, tPaperG, 2, 2, 0, 1.55, 1);
    UH.lamps = []; for (let i = 0; i < 6; i++) { const z = -1.2 - i * 2.3, sx = i % 2 ? 1 : -1;
      const door = new THREE.Group(); door.position.set(sx * 1.19, 0, z - 1.1); s.add(door); B(0.06, 2.2, 1.0, lam(L.rep(tWood(1101 + i, '#3a2414'), 1, 2)), 0, 1.1, 0, door); B(0.1, 0.12, 1.2, lam(null, 0x2a1a0e), 0, 2.26, 0, door); L.mesh(new THREE.SphereGeometry(0.035, 5, 4), lam(null, 0xb89a40), -sx * 0.05, 1.05, 0.35, door);
      const tb = new THREE.Group(); tb.position.set(-sx * 1.0, 0, z); s.add(tb); B(0.4, 0.04, 0.3, lam(null, 0x3a2414), 0, 0.82, 0, tb); B(0.04, 0.8, 0.04, lam(null, 0x3a2414), 0, 0.41, 0, tb);
      cyl(0.07, 0.09, 0.12, 8, lam(null, 0xb89a40), 0, 0.9, 0, tb); const gl = cyl(0.045, 0.05, 0.22, 8, basic(null, 0xf0c070, { transparent: true, opacity: 0.55 }), 0, 1.07, 0, tb); void gl; L.mesh(new THREE.ConeGeometry(0.03, 0.1, 5), basic(null, 0xffd060), 0, 1.06, 0, tb); const gw = L.plane(0.4, 0.4, basic(tGlow, 0xffb050, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 1.07, 0, tb); gw.renderOrder = 6; UH.glows = UH.glows || []; UH.glows.push(gw);
      const pl = new THREE.PointLight(0xffb060, 3.4, 4.5, 1.4); pl.position.set(-sx * 0.9, 1.2, z); s.add(pl); UH.lamps.push([tb, pl]);
      L.plane(0.5, 0.6, lam(L.cvs(16, 20, (c) => { px(c, 0, 0, '#8a6a20', 16, 20); px(c, 2, 2, '#2a2418', 12, 16); px(c, 6, 6, '#c8b090', 4, 5); px(c, 5, 11, '#3a2a3a', 6, 6); })), -sx * 1.19, 1.9, z, s, sx * Math.PI / 2); }
    // cuarto del fondo (z -14 .. -19), puerta abierta
    const RZ = -14; UH.RZ = RZ; for (const [x0, x1] of [[-1.3, -0.55], [0.55, 1.3]]) wallBox(s, x1 - x0, 3.1, 0.2, tPaperG, 1, 2, (x0 + x1) / 2, 1.55, RZ); wallBox(s, 1.1, 0.9, 0.2, tPaperG, 1, 1, 0, 2.65, RZ);
    UH.door = new THREE.Group(); UH.door.position.set(0.55, 0, RZ); s.add(UH.door); B(1.08, 2.18, 0.06, lam(L.rep(tWood(1110, '#3a2414'), 1, 2)), -0.54, 1.09, 0, UH.door); L.mesh(new THREE.SphereGeometry(0.035, 5, 4), lam(null, 0xb89a40), -0.98, 1.05, 0.05, UH.door);
    UH.key = new THREE.Group(); UH.door.add(UH.key); UH.key.position.set(-0.95, 0.98, 0.06); cyl(0.004, 0.004, 0.06, 5, lam(null, 0xd8dce4), 0, 0, 0.03, UH.key).rotation.x = Math.PI / 2; L.mesh(new THREE.TorusGeometry(0.014, 0.004, 4, 8), lam(null, 0xd8dce4), 0, 0, 0.065, UH.key);
    floorPlane(s, 6, 6, tWood(1111, '#4a3020'), 3, 3, 0, RZ - 3); for (const [w, d, x, z] of [[6, 0.2, 0, RZ - 6], [0.2, 6, -3, RZ - 3], [0.2, 6, 3, RZ - 3]]) wallBox(s, w, 3.1, d, tPaper, Math.max(w, d) / 1.6, 2, x, 1.55, z); B(6, 0.1, 6, lam(null, 0x2a2018), 0, 3.1, RZ - 3, s);
    // sillon orejero de espaldas (mirando a la chimenea del cuarto, z -19.5), lampara de pie
    const chair = new THREE.Group(); chair.position.set(0.2, 0, RZ - 3.2); s.add(chair); UH.chair = chair; const mC = lam(L.rep(tNoise(1112, [60, 30, 40], [40, 18, 26], 8, 8), 2, 2));
    B(0.95, 0.45, 0.85, mC, 0, 0.32, 0, chair); B(0.95, 0.85, 0.2, mC, 0, 0.75, 0.38, chair); for (const sx of [-1, 1]) { B(0.18, 0.7, 0.85, mC, sx * 0.48, 0.5, 0, chair); B(0.16, 0.3, 0.22, mC, sx * 0.45, 1.05, 0.3, chair); } for (const [x, z] of [[-0.4, -0.35], [0.4, -0.35], [-0.4, 0.35], [0.4, 0.35]]) B(0.06, 0.12, 0.06, lam(null, 0x2a1a0e), x, 0.06, z, chair);
    B(1.8, 1.4, 0.5, lam(L.rep(tStone(1113, [110, 104, 92]), 1, 1)), 0.2, 0.7, RZ - 5.75, s); B(1.0, 0.7, 0.2, basic(null, 0x0a0806), 0.2, 0.4, RZ - 5.5, s);
    const lmp = new THREE.Group(); lmp.position.set(-1.6, 0, RZ - 3.6); s.add(lmp); cyl(0.02, 0.02, 1.5, 5, lam(null, 0x3a3a30), 0, 0.75, 0, lmp); cyl(0.12, 0.25, 0.3, 8, basic(null, 0xd8b070, { side: DS }), 0, 1.55, 0, lmp, 0); UH.roomL = new THREE.PointLight(0xffc070, 4, 6, 1.3); UH.roomL.position.set(-1.6, 1.5, RZ - 3.6); s.add(UH.roomL);
    // el hombre de esmoquin (base Quaternius de Dutch recoloreada: chaqueta negra, camisa blanca, pajarita, piel gris)
    UH.man = await makePerson(L, 'dutch'); s.add(UH.man.root); UH.man.root.traverse((o) => { if (!o.isMesh) return; for (const m of Array.isArray(o.material) ? o.material : [o.material]) { const n = m.name || '';
      if (n === 'Shirt') m.color.set(0x141418); else if (n === 'Pants') m.color.set(0x16161a); else if (n === 'Skin') m.color.set(0x8a9488); else if (n === 'Hair') m.color.set(0x3a3a3a); else if (n === 'Socks') m.color.set(0x0a0a0a); else if (m.color && m.color.getHex() === 0xb84c10) m.color.set(0xe8e4dc); }
      if (o.geometry && o.geometry.type === 'PlaneGeometry') o.visible = false; });
    UH.man.root.position.set(0.2, 0.12, RZ - 3.1); UH.man.root.rotation.y = Math.PI; UH.man.pose(0, 'sit'); UH.man.root.updateMatrixWorld(true);
    { const ch2 = UH.man.head.getWorldPosition(V()); const sh = L.plane(0.14, 0.22, basic(null, 0xe8e4dc, { side: DS }), ch2.x, ch2.y - 0.32, ch2.z - 0.12, s); sh.rotation.y = Math.PI; UH.man.head.parent.attach(sh); const bt = B(0.09, 0.035, 0.03, lam(null, 0x0a0a0a), ch2.x, ch2.y - 0.2, ch2.z - 0.12, s); UH.man.head.parent.attach(bt);
      for (const sx of [-1, 1]) { const e = L.mesh(new THREE.SphereGeometry(0.013, 5, 4), basic(null, 0xe8e4d8), ch2.x + sx * 0.035, ch2.y + 0.035, ch2.z - 0.085, s); UH.man.head.attach(e); } }
    { const mDk = lam(null, 0x2a1a0e), mG = lam(null, 0xb89a40), tW = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.strokeStyle = 'rgba(220,220,220,0.55)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(16 * Math.cos(k * 0.3), 16 * Math.sin(k * 0.3)); c.stroke(); } for (let r = 4; r < 16; r += 4) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI / 2); c.stroke(); } });
      const cob = (x, y, z, ry, rz, sc = 0.8) => { const m = L.plane(sc, sc, basic(tW, 0xffffff, { transparent: true, depthWrite: false, side: DS }), x, y, z, s, ry); m.rotation.z = rz; };
      for (const sx of [-1, 1]) { B(0.12, 0.12, 16, mDk, sx * 1.22, 3.0, -7, s); B(0.04, 0.12, 16, mDk, sx * 1.19, 0.06, -7, s); B(0.03, 0.04, 16, mG, sx * 1.18, 2.9, -7, s); }
      for (let i = 0; i < 6; i++) { const z = -1.2 - i * 2.3, sx = i % 2 ? 1 : -1, dz = z - 1.1; for (const e of [-0.56, 0.56]) B(0.08, 2.3, 0.1, mDk, sx * 1.17, 1.15, dz + e, s);
        const sc = new THREE.Group(); sc.position.set(sx * 1.17, 1.95, z + 0.4); sc.rotation.y = -sx * Math.PI / 2; s.add(sc); B(0.08, 0.18, 0.03, mG, 0, 0, 0, sc); const gl = cyl(0.04, 0.05, 0.14, 6, basic(null, 0xf0c070, { transparent: true, opacity: 0.6 }), 0, 0.05, 0.08, sc); void gl;
        cyl(0.05, 0.08, 0.22, 7, lam(null, [0x2a4a6a, 0x6a2a2a, 0x2a5a3a][i % 3]), -sx * 0.95, 0.95, z + 0.1, s); cob(sx * 1.15, 2.9, z - 0.3, -sx * Math.PI / 2, 0); }
      cob(-1.15, 2.9, 0.85, Math.PI / 2, 0); cob(1.15, 2.9, 0.85, -Math.PI / 2, Math.PI / 2);
      // cuarto: librero, alfombra, cortinas y ventana, mesita con vela, retrato sobre la chimenea, telarañas
      const bs = new THREE.Group(); bs.position.set(-2.85, 0, RZ - 2.4); bs.rotation.y = Math.PI / 2; s.add(bs); B(1.6, 2.4, 0.4, lam(L.rep(tWood(1170, '#3a2414'), 1, 2)), 0, 1.2, 0, bs); const R = L.rng(1171);
      for (let r = 0; r < 5; r++) { B(1.5, 0.03, 0.36, mDk, 0, 0.2 + r * 0.45, 0.02, bs); let x = -0.7; while (x < 0.68) { const w = 0.04 + R() * 0.05, h = 0.25 + R() * 0.13; B(w, h, 0.26, lam(null, [0x5a1a1a, 0x1a3a2a, 0x2a2a4a, 0x6a5a2a, 0x3a2a1a][Math.floor(R() * 5)]), x + w / 2, 0.22 + r * 0.45 + h / 2, 0.06, bs); x += w + 0.008; } }
      floorPlane(s, 2.6, 2.0, tNoise(1172, [70, 30, 30], [40, 16, 16], 16, 16, (c) => { px(c, 0, 0, '#a08040', 16, 1); px(c, 0, 15, '#a08040', 16, 1); px(c, 0, 0, '#a08040', 1, 16); px(c, 15, 0, '#a08040', 1, 16); }), 1, 1, 0.2, RZ - 3.6, 0.006);
      L.plane(1.0, 1.4, basic(null, 0x1a2a4a), 2.89, 1.6, RZ - 3.0, s, -Math.PI / 2); for (const dz of [-0.75, 0.75]) B(0.1, 2.2, 0.35, lam(null, 0x5a1418), 2.85, 1.5, RZ - 3.0 + dz, s);
      cyl(0.25, 0.25, 0.04, 8, mDk, 1.3, 0.62, RZ - 3.2, s); cyl(0.03, 0.04, 0.6, 5, mDk, 1.3, 0.31, RZ - 3.2, s); cyl(0.02, 0.02, 0.1, 5, basic(null, 0xe8e0c8), 1.3, 0.69, RZ - 3.2, s);
      L.plane(0.8, 0.6, lam(L.cvs(16, 12, (c) => { px(c, 0, 0, '#1a1410', 16, 12); px(c, 6, 2, '#a89070', 4, 5); px(c, 4, 7, '#141418', 8, 5); px(c, 7, 4, '#1a0a0a', 1, 1); px(c, 9, 4, '#1a0a0a', 1, 1); })), 0.2, 2.05, RZ - 5.49, s); B(0.92, 0.72, 0.04, mG, 0.2, 2.05, RZ - 5.52, s);
      cob(-2.85, 2.8, RZ - 5.85, Math.PI / 4, 0, 1.0); cob(2.85, 2.8, RZ - 5.85, -Math.PI / 4, Math.PI / 2, 1.0); cob(-2.85, 2.8, RZ - 0.25, Math.PI * 0.75, 0, 0.9); }
    UH.ava = mkAva(s); giveGun(UH.ava);
    UH.post = (lt, t, c) => { (UH.glows || []).forEach((g) => g.lookAt(c.position)); };
    UH.reset = (t) => { UH.ava.fl.unaim(); UH.ava.fl.hide(); UH.ava.gun.visible = false; UH.ava.ch.root.visible = false; UH.door.rotation.y = -1.4; UH.key.rotation.z = 0; UH.man.pose(t, 'sit'); }; }
  const manTurn = (k) => { UH.man.pose(0, 'sit'); UH.man.head.rotateY(Math.PI * k); };
  shot('111_hallway', UH, 46, (lt, t, c) => { const z = 0.2 - lt * 0.5; const { ch, fl } = UH.ava; AVA(ch, 0, z, Math.PI); ch.pose(lt, L.still('pistol_ready', 0.4), [[-99, 'scared', 'neutral']]); UH.ava.gun.visible = true; fl.show(); const tg = V(0, 1.0, z - 4); fl.aim(tg, 1); fl.on(true, c, tg, 1, false, 10); },
    (lt) => V(0.6, 2.4, 0.6 - lt * 0.42), (lt) => V(0, 1.0, -9 - lt * 0.4), LB((lt, o) => { lab(o, 'DOORS ON BOTH SIDES', 470, 70, '#e8e8ec', 'z4', 'doors'); }));
  shot('112_armchair', UH, 40, (lt, t) => { manTurn(0); }, [[0, -0.2, 1.6, UH.RZ + 0.6], [6, -0.1, 1.55, UH.RZ - 0.4]], V(0.2, 0.9, UH.RZ - 3.3), LB((lt, o) => { lab(o, 'DINNER JACKET', 470, 70, '#ff4030', 'z4', 'dinner'); lab(o, 'PERFECTLY STILL', 470, 100, '#e8e8ec', 'z5', 'perfectly'); }));
  thinkShot(UH, { id: '113_hello', x: 0, z: UH.RZ + 0.5, yaw: Math.PI, faces: [[-99, 'scared', 'neutral']], mouth: true, flash: true, ang: 'front', extra: () => { manTurn(0); UH.ava.gun.visible = false; } });
  shot('114_head_turn', UH, 32, (lt, t) => { const tp = at('z7', 'turns'), k = ease(tp - 0.2, at('z7', 'around') + 0.5, t); manTurn(k); },
    [[0, 0.2, 1.3, UH.RZ - 1.6], [5, 0.2, 1.28, UH.RZ - 1.9]], () => UH.man.head.getWorldPosition(V()).add(V(0, 0.05, 0)), LB((lt, o) => { lab(o, 'ALL THE WAY AROUND', 470, 70, '#ff4030', 'z7', 'around'); }));
  thinkShot(UH, { id: '115_breath', x: 0, z: UH.RZ + 0.5, yaw: Math.PI, faces: [[-99, 'shocked', 'gasp']], ang: 'front', flash: true, extra: () => { manTurn(1); } });
  shot('116_lock', UH, 30, (lt, t) => { const tc = at('z9', 'close'), u = ease(tc, tc + 1.6, t); UH.door.rotation.y = -1.4 * (1 - u); const tl = at('z9', 'lock'), ul = ease(tl, tl + 0.5, t); UH.key.rotation.z = -1.5 * ul; manTurn(1);
      const { ch } = UH.ava; AVA(ch, 0.15, UH.RZ + 0.45, Math.PI); ch.pose(lt, L.still('turn_key', 0.5 + 0.4 * ul), [[-99, 'scared', 'neutral']]); },
    [[0, -1.0, 1.25, UH.RZ + 0.9], [5, -0.95, 1.2, UH.RZ + 0.8]], V(-0.4, 1.0, UH.RZ + 0.06), LB((lt, o) => { lab(o, 'LOCKED', 470, 80, '#62f05a', 'z9', 'lock'); }));
  // ---- DESVAN: vigas del tejado, radio de radioaficionado, bateria, ventana del hastial (noche -> amanecer)
  const AT = { scene: new THREE.Scene() }; { const s = AT.scene; s.background = new THREE.Color(0x06060a); s.fog = new THREE.Fog(0x06060a, 4, 13); lights(s, { amb: 0.2, hemi: 0.15, sky: 0xc8b8a0 });   // v3: desvan mas oscuro
    floorPlane(s, 6.4, 9, tWood(1120, '#5a4630'), 3, 6, 0, -1.5);
    for (const sx of [-1, 1]) { const rf = B(0.1, 3.8, 9, lam(L.rep(tWood(1121, '#4a3a28'), 6, 2)), sx * 1.6, 2.15, -1.5, s); rf.rotation.z = -sx * Math.atan2(3.2, 2.0); rf.rotation.z = sx * (Math.PI / 2 - Math.atan2(2.2, 3.0)); B(0.2, 0.7, 9, lam(L.rep(tWood(1122), 4, 1)), sx * 3.0, 0.35, -1.5, s); }
    for (let z = 2.5; z > -6; z -= 1.2) for (const sx of [-1, 1]) { const rb = B(0.12, 3.9, 0.12, lam(null, 0x3a2a1a), sx * 1.55, 2.1, z, s); rb.rotation.z = sx * (Math.PI / 2 - Math.atan2(2.2, 3.0)); }
    B(0.16, 0.16, 9, lam(null, 0x3a2a1a), 0, 3.25, -1.5, s); for (let z = 2; z > -6; z -= 2.4) B(6, 0.12, 0.12, lam(null, 0x3a2a1a), 0, 1.9, z, s);
    const tGable = tWood(1123, '#4a3a28'); wallBox(s, 6.4, 3.4, 0.2, tGable, 3, 2, 0, 1.7, 3.0);
    // hastial con ventana (z = -6): marco + vista exterior (lienzo que pasa de noche a amanecer con el rio y el helicoptero)
    for (const [x0, x1] of [[-3.2, -0.6], [0.6, 3.2]]) wallBox(s, x1 - x0, 3.4, 0.2, tGable, 2, 2, (x0 + x1) / 2, 1.7, -6); wallBox(s, 1.2, 1.0, 0.2, tGable, 1, 1, 0, 0.5, -6); wallBox(s, 1.2, 1.2, 0.2, tGable, 1, 1, 0, 2.8, -6);
    B(0.08, 1.2, 0.1, lam(null, 0x2a1a0e), 0, 1.6, -5.95, s); B(1.2, 0.08, 0.1, lam(null, 0x2a1a0e), 0, 1.6, -5.95, s); B(1.3, 0.1, 0.25, lam(null, 0x2a1a0e), 0, 0.98, -5.9, s);
    AT.viewCv = document.createElement('canvas'); AT.viewCv.width = 64; AT.viewCv.height = 64; AT.viewT = L.canvasTex(AT.viewCv); L.plane(1.6, 1.6, basic(AT.viewT), 0, 1.6, -6.25, s);
    AT.drawView = (k, heli) => { const c = AT.viewCv.getContext('2d'), sk = (a, b) => `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`; const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, sk([8, 12, 24], [70, 110, 180])); g.addColorStop(0.7, sk([14, 20, 34], [230, 170, 120])); g.addColorStop(1, sk([10, 12, 18], [90, 80, 90])); c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      c.fillStyle = sk([4, 8, 6], [24, 38, 28]); for (let x = -2; x < 66; x += 3) { const h = 5 + ((x * 37 + 11) % 10); c.beginPath(); c.moveTo(x - 2, 47); c.lineTo(x + 1, 47 - h); c.lineTo(x + 4, 47); c.fill(); } c.fillRect(0, 46, 64, 4); c.fillStyle = sk([10, 14, 22], [150, 175, 205]); c.fillRect(0, 50, 64, 4); c.fillStyle = sk([6, 6, 8], [40, 40, 44]); c.fillRect(38, 48, 18, 2); c.fillRect(40, 43, 1, 5); c.fillRect(53, 43, 1, 5); c.fillStyle = sk([3, 6, 4], [16, 26, 18]); c.fillRect(0, 54, 64, 10); for (let x = 0; x < 64; x += 5) { c.beginPath(); c.moveTo(x - 3, 64); c.lineTo(x + 1, 52 - ((x * 7) % 6)); c.lineTo(x + 5, 64); c.fill(); }
      if (k < 0.3) { c.fillStyle = '#c8d0e8'; for (let i = 0; i < 20; i++) c.fillRect((i * 29) % 64, (i * 13) % 34, 1, 1); } if (heli) { c.fillStyle = '#1a1a1a'; c.fillRect(heli[0], heli[1], 4, 2); c.fillRect(heli[0] - 3, heli[1] - 1, 10, 1); c.fillStyle = '#ff3020'; c.fillRect(heli[0] + 4, heli[1], 1, 1); } AT.viewT.needsUpdate = true; };
    AT.winL = new THREE.SpotLight(0x8aa0d8, 4, 8, 0.6, 0.6, 1.3); AT.winL.position.set(0, 1.8, -6.6); AT.winL.target.position.set(0.5, 0, -3); s.add(AT.winL, AT.winL.target);
    // mesa de la radio (derecha, z -4)
    const dk = new THREE.Group(); dk.position.set(1.7, 0, -4.2); s.add(dk); AT.desk = dk; const mW = lam(L.rep(tWood(1124, '#5a3a22'), 1, 1)); B(1.5, 0.06, 0.7, mW, 0, 0.76, 0, dk); for (const [x, z] of [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]]) B(0.05, 0.76, 0.05, mW, x, 0.38, z, dk);
    const tRad = L.cvs(64, 32, (c) => { px(c, 0, 0, '#3a3a34', 64, 32); px(c, 1, 1, '#5a5a50', 62, 1); px(c, 4, 4, '#0a140a', 26, 9); for (let i = 0; i < 4; i++) { c.fillStyle = '#1a1a18'; c.beginPath(); c.arc(8 + i * 14, 22, 4.5, 0, 7); c.fill(); px(c, 7 + i * 14, 18, '#c8c8c0', 2, 3); } px(c, 36, 4, '#d8c890', 10, 8); px(c, 50, 4, '#d8c890', 10, 8); px(c, 40, 6, '#1a1a1a', 1, 5); px(c, 54, 7, '#1a1a1a', 1, 4); c.fillStyle = '#c8c0a0'; c.font = 'bold 4px monospace'; c.fillText('HF/VHF', 38, 30); });
    AT.radio = B(0.8, 0.36, 0.4, [lam(null, 0x3a3a34), lam(null, 0x3a3a34), lam(null, 0x4a4a42), lam(null, 0x2a2a26), lam(tRad), lam(null, 0x3a3a34)], -0.2, 0.97, -0.1, dk);
    AT.disp = L.plane(0.3, 0.1, basic(L.cvs(32, 8, (c) => { px(c, 0, 0, '#0a1a0a', 32, 8); })), -0.38, 1.04, 0.102, dk); AT.dispCv = document.createElement('canvas'); AT.dispCv.width = 32; AT.dispCv.height = 8; AT.dispT = L.canvasTex(AT.dispCv); AT.disp.material.map = AT.dispT;
    AT.glow = new THREE.PointLight(0x7aff8a, 0, 2.2, 1.5); AT.glow.position.set(1.4, 1.1, -3.7); s.add(AT.glow);
    AT.dial = new THREE.Group(); AT.dial.position.set(-0.08, 0.92, 0.11); dk.add(AT.dial); cyl(0.05, 0.05, 0.03, 10, lam(null, 0x1a1a18), 0, 0, 0, AT.dial).rotation.x = Math.PI / 2; B(0.008, 0.04, 0.035, lam(null, 0xc8c8c0), 0, 0.025, 0.0, AT.dial);
    // mic de pie, bateria con pinzas, papeles, taza
    const mic = new THREE.Group(); mic.position.set(0.45, 0.79, 0.1); dk.add(mic); AT.mic = mic; cyl(0.07, 0.08, 0.02, 10, lam(null, 0x2a2a2a), 0, 0, 0, mic); cyl(0.008, 0.008, 0.22, 5, lam(null, 0x8a8a8a), 0, 0.11, 0, mic); const mh = cyl(0.03, 0.025, 0.1, 8, lam(null, 0x3a3a3a), 0, 0.26, 0.02, mic); mh.rotation.x = 0.4; B(0.02, 0.012, 0.02, lam(null, 0xb02a1e), 0.03, 0.24, 0.04, mic);
    B(0.3, 0.22, 0.18, lam(null, 0x1a1a1a), 0.2, 0.11, -0.2, dk); for (const [x, col] of [[0.12, 0xc02020], [0.28, 0x1a1a1a]]) { cyl(0.015, 0.015, 0.03, 6, lam(null, col), x, 0.235, -0.2, dk); } const cab = cyl(0.008, 0.008, 0.8, 4, lam(null, 0xc02020), 0.0, 0.5, -0.25, dk); cab.rotation.z = 0.5;
    for (let k = 0; k < 3; k++) { const p = L.plane(0.21, 0.28, lam(L.cvs(8, 10, (c) => { px(c, 0, 0, '#e8e0c8', 8, 10); for (let y = 2; y < 9; y += 2) px(c, 1, y, '#5a5040', 5, 1); })), 0.5 - k * 0.05, 0.795 + k * 0.001, -0.15 + k * 0.03, dk, 0, -Math.PI / 2); p.rotation.z = k * 0.3; }
    // muebles con sabanas, baules, telarañas, caja de carton
    const tSheet = tNoise(1125, [170, 164, 150], [124, 118, 106], 16, 16, (c) => { for (let x = 0; x < 16; x += 3) px(c, x, 0, 'rgba(60,54,44,0.35)', 1, 16); for (let k = 0; k < 8; k++) px(c, (k * 5) % 16, (k * 7) % 16, 'rgba(90,80,60,0.3)', 3, 2); }); const sheet = lam(L.rep(tSheet, 2, 2), 0xffffff, { side: DS });
    const drape = (x, z, ry, kind) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; s.add(g);
      if (kind === 'chair') { B(0.7, 0.45, 0.7, sheet, 0, 0.3, 0, g); B(0.7, 0.55, 0.16, sheet, 0, 0.8, -0.28, g); L.mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.5, 8, 1, true), sheet, 0, 0.25, 0, g); }
      else if (kind === 'lamp') { L.mesh(new THREE.ConeGeometry(0.42, 1.3, 8, 1, true), sheet, 0, 0.65, 0, g); L.mesh(new THREE.SphereGeometry(0.2, 8, 6), sheet, 0, 1.35, 0, g); }
      else { B(1.3, 0.7, 0.6, sheet, 0, 0.35, 0, g); const t1 = L.mesh(new THREE.CylinderGeometry(0.72, 0.86, 0.7, 4, 1, true), sheet, 0, 0.35, 0, g); t1.rotation.y = Math.PI / 4; t1.scale.set(1.1, 1, 0.55); B(0.5, 0.32, 0.4, sheet, 0.25, 0.86, 0, g); } };
    drape(-1.9, -3.5, 0.2, 'sofa'); drape(-1.7, -1.0, 0.5, 'chair'); drape(-1.5, 1.2, -0.3, 'lamp'); drape(1.9, 0.6, 0.4, 'chair');
    for (let k = 0; k < 4; k++) B(0.4 + k * 0.05, 0.3, 0.35, lam(null, [0x8a6a40, 0x6a5030][k % 2]), 2.3 - k * 0.1, 0.15 + Math.floor(k / 2) * 0.3, -1.9 + (k % 2) * 0.4, s);
    for (const [x, z] of [[1.9, -1.4], [-0.9, -5.0]]) { B(0.9, 0.5, 0.55, lam(L.rep(tWood(1126, '#6a3a1a'), 1, 1)), x, 0.25, z, s); B(0.92, 0.06, 0.57, lam(null, 0x8a6a2a), x, 0.42, z, s); }
    const web = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.strokeStyle = 'rgba(220,220,220,0.5)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(16 * Math.cos(k * 0.3), 16 * Math.sin(k * 0.3)); c.stroke(); } for (let r = 4; r < 16; r += 4) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI / 2); c.stroke(); } });
    for (const [x, y, z, ry] of [[-2.6, 0.9, -5.8, 0], [2.6, 0.9, -5.8, Math.PI / 2], [0.3, 3.0, 2.8, Math.PI]]) L.plane(0.8, 0.8, basic(web, 0xffffff, { transparent: true, depthWrite: false, side: DS }), x, y, z, s, ry);
    // trampilla / escalera de subida (z = 1.8)
    L.plane(1.0, 1.4, basic(null, 0x050505), -0.6, 0.004, 1.8, s, 0, -Math.PI / 2); for (const sx of [-1, 1]) B(0.06, 0.06, 1.4, lam(null, 0x3a2a1a), -0.6 + sx * 0.5, 0.03, 1.8, s); for (let k = 0; k < 3; k++) B(0.9, 0.05, 0.25, lam(null, 0x4a3a28), -0.6, -0.2 - k * 0.3, 1.5 + k * 0.25, s);
    AT.ava = mkAva(s); AT.dog = await loadDog(L); s.add(AT.dog.root);
    AT.hmic = new THREE.Group(); cyl(0.016, 0.02, 0.11, 8, lam(null, 0x2a2a2a), 0, 0, 0, AT.hmic); L.mesh(new THREE.SphereGeometry(0.027, 8, 6), lam(null, 0x6a6a6a), 0, 0.07, 0, AT.hmic); B(0.012, 0.02, 0.012, lam(null, 0xb02a1e), 0.018, 0.0, 0, AT.hmic); L.holdIn(AT.ava.ch, AT.hmic, 'L', [0, 0.72, 0.18], [0, 0, 0]); AT.hmic.visible = false;
    AT.reset = (t) => { AT.hmic.visible = false; AT.mic.visible = true; AT.ava.fl.unaim(); AT.ava.fl.hide(); AT.ava.ch.root.visible = false; AT.dog.root.visible = false; AT.drawView(0, null); AT.glow.intensity = 0; AT.winL.color.set(0x8aa0d8); AT.winL.intensity = 3; const c = AT.dispCv.getContext('2d'); px(c, 0, 0, '#06100a', 32, 8); AT.dispT.needsUpdate = true; AT.dial.rotation.z = 0; }; }
  const radioOn = (t, txt = '146.520', k = 1) => { AT.glow.intensity = 1.6 * k; const c = AT.dispCv.getContext('2d'); px(c, 0, 0, '#0a1a0a', 32, 8); c.fillStyle = '#7aff8a'; c.font = 'bold 7px monospace'; c.fillText(txt, 1, 7); AT.dispT.needsUpdate = true; };
  const dawnK = (t) => ease(at('d1', 'sky') - 0.2, at('d1', 'blue') + 1.5, t);
  const atDawn = (t) => { const k = dawnK(t); AT.drawView(k, k > 0.4 ? [22 + Math.floor((t * 2) % 10), 30] : null); AT.winL.color.set(k > 0.5 ? 0xffc890 : 0x8aa0d8); AT.winL.intensity = 3 + 6 * k; return k; };
  shot('118_attic', AT, 46, (lt, t, c) => { const z = 1.4 - Math.min(2.4, lt * 0.5); const { ch, fl } = AT.ava; AVA(ch, -0.5, z, Math.PI * 0.9); ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.45 })], [[-99, 'surprised', 'neutral']]); fl.show(); const tg = V(1.5, 0.9, -4.2); fl.aim(tg, 1); fl.on(true, c, tg, 1, true, 12); },
    [[0, -0.7, 2.1, 2.2], [6, -0.6, 2.05, 1.8]], V(1.0, 0.9, -3.6), LB((lt, o) => { lab(o, 'RADIO STATION', 470, 70, '#62f05a', 'r1', 'radio'); }));
  shot('119_radio', AT, 32, (lt, t) => { radioOn(t, '------', 0.6); }, [[0, 0.9, 1.35, -2.9], [5, 1.1, 1.25, -3.1]], V(1.5, 0.98, -4.3), LB((lt, o) => { lab(o, 'BATTERY: OK', 470, 280, '#62f05a', 'r2', 'battery'); lab(o, 'DUSTY', 220, 100, '#9aa0b0', 'r2', 'dusty'); }));
  shot('119b_dial', AT, 28, (lt, t) => { radioOn(t, (140 + Math.min(6.52, lt * 1.4)).toFixed(3)); AT.dial.rotation.z = -lt * 1.2; const { ch } = AT.ava; AVA(ch, 1.45, -3.35, Math.PI); ch.pose(lt, L.still('turn_key', 0.7), [[-99, 'half', 'neutral']]); },
    [[0, 2.3, 1.25, -3.3], [5, 2.2, 1.2, -3.4]], V(1.55, 0.95, -4.1));
  shot('121_mic', AT, 34, (lt, t) => { radioOn(t); const { ch } = AT.ava; AVA(ch, 1.9, -3.4, Math.PI); ch.pose(lt, L.still('hold_up_object', 0.7), [[-99, 'half', 'neutral']]); AT.hmic.visible = true; AT.mic.visible = false; },
    [[0, 2.7, 1.4, -3.0], [5, 2.6, 1.35, -3.15]], V(2.0, 1.1, -3.9), LB((lt, o) => { lab(o, 'KEY THE MIC', 470, 70, '#ffd23f', 'r5', 'key'); }));
  thinkShot(AT, { id: '122_shake_call', x: 1.9, z: -3.4, yaw: Math.PI, clip: 'hold_up_object', from: 0.7, faces: [[-99, 'scared', 'neutral']], mouth: true, ang: 'qL', camOff: [-0.4, -0.02, 1.0], extra: (lt, t) => { radioOn(t); AT.hmic.visible = true; AT.mic.visible = false; } });
  shot('123_static', AT, 30, (lt, t) => { radioOn(t, Math.floor(t * 6) % 2 ? '146.520' : '146.52 '); AT.glow.intensity = 1.2 + 0.4 * (Math.floor(t * 9) % 2); }, [[0, 0.6, 1.2, -3.6], [6, 0.7, 1.15, -3.8]], V(1.5, 1.0, -4.3), LB((lt, o, sh, t) => { if (t >= at('r8', 0) - 0.05) { const c = o.tctx; c.globalAlpha = 0.35; for (let k = 0; k < 300; k++) px(c, (k * 97 + Math.floor(t * 15) * 31) % LW, (k * 53 + Math.floor(t * 15) * 17) % LH, '#d8d8d8', 2, 1); c.globalAlpha = 1; } lab(o, 'STATIC', 470, 70, '#4fd6ff', 'r8', 0); }));
  shot('124_dawn', AT, 40, (lt, t) => { atDawn(t); radioOn(t); const { ch } = AT.ava; AVA(ch, 0.2, -4.6, Math.PI); ch.pose(lt, L.still('idle', 0.3), [[-99, 'surprised', 'neutral']]); }, [[0, 0.9, 1.6, -2.3], [6, 0.7, 1.55, -2.7]], V(0, 1.6, -6.2), LB((lt, o) => { lab(o, 'HELICOPTER', 470, 70, '#4fd6ff', 'd2', 'helicopter'); }));
  shot('125_heli', MX, 34, (lt, t) => { MX.dawn(1); MX.heli.scale.setScalar(1.8); MX.heli.position.set(34 - lt * 1.6, 13, -95); MX.heli.rotation.y = -Math.PI / 2 + 0.3; MX.heliL.intensity = 12; }, [[0, 6, 23, -42], [6, 6.5, 23.2, -44]], (lt) => V(30 - lt * 1.6, 11, -96), LB((lt, o, sh) => { lab(o, 'THE HELICOPTER', 470, 70, '#4fd6ff', 'd2', 'helicopter', L.toScreen(sh.camera, 34 - (sh.t0 !== undefined ? 0 : 0), 13, -95)); }));
  shot('126_crackle', AT, 30, (lt, t) => { atDawn(t); radioOn(t, 'RX  146.5'); AT.glow.intensity = 1.2 + 1.0 * talkOf(['d4', 'd6'])(t); }, [[0, 1.2, 1.15, -3.3], [5, 1.25, 1.12, -3.45]], V(1.4, 1.0, -4.3), LB((lt, o) => { lab(o, 'EAGLE ONE', 470, 70, '#62f05a', 'd4', 'eagle'); }));
  thinkShot(AT, { id: '127_think_here', x: 1.6, z: -3.3, yaw: Math.PI * 0.85, faces: [[-99, 'happy', 'smile']], ang: 'q', extra: (lt, t) => { atDawn(t); radioOn(t); } });
  shot('128_hour', AT, 40, (lt, t) => { atDawn(t); radioOn(t); AT.glow.intensity = 1.2 + 1.0 * talkOf(['d6'])(t); const { ch } = AT.ava; AVA(ch, 1.6, -3.3, Math.PI * 0.85); ch.pose(lt, L.still('idle', 0.3), [[-99, 'surprised', 'neutral']]); }, [[0, -1.2, 1.6, -1.4], [6, -1.0, 1.55, -1.8]], V(0.8, 1.2, -5.2),
    LB((lt, o, sh, t) => { const k = ease(at('d6', 'hour') - 0.1, at('d6', 'hour') + 0.2, t); if (k > 0) { const c = o.tctx; c.globalAlpha = k; c.fillStyle = 'rgba(4,8,16,0.86)'; c.fillRect(480, 22, 140, 50); c.strokeStyle = '#ff4030'; c.strokeRect(480.5, 22.5, 139, 49); bitText(c, '1:00:00', 550, 42, 2, '#ff4030', { outline: '#000' }); bitText(c, 'AT THE RIVER', 550, 62, 1, '#e8e8e8', { outline: null }); c.globalAlpha = 1; } }));
  thinkShot(AT, { id: '129_think_make', x: 1.6, z: -3.3, yaw: Math.PI * 1.1, faces: [[-99, 'angry', 'neutral']], ang: 'qL', lookAt: V(0, 1.6, -6), extra: (lt, t) => { atDawn(t); radioOn(t); } });
  shot('130_clothes', AT, 44, (lt, t) => { atDawn(t); const { ch } = AT.ava; AVA(ch, 0.6 - lt * 0.15, -2.0 + lt * 0.3, 0.2); ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'neutral']]); AT.dog.root.visible = true; AT.dog.root.position.set(-0.3, 0, 1.0); AT.dog.root.rotation.y = Math.PI * 0.9; AT.dog.update(lt, 'stare', { look: V(0.5, 1.2, -1.5) }); },
    [[0, 1.4, 1.9, -4.8], [6, 1.2, 1.85, -4.4]], V(0, 0.8, 0.2));
  // ---- 5:40 AM: la puerta revienta, el Stalker entra
  const blast = (t, t0) => { const u = Math.max(0, t - t0), on = t >= t0, W = GH.win; W.glass.forEach((g) => { g.visible = !on; });
    W.mull.forEach((m, i) => { m.userData.p0 = m.userData.p0 || m.position.clone(); if (!on) { m.position.copy(m.userData.p0); m.rotation.set(0, 0, 0); return; } const uu = Math.min(u, 1.2); m.position.set(m.userData.p0.x - 0.5 * uu * (i % 2 ? 1 : -0.6), Math.max(0.03, m.userData.p0.y + 1.4 * uu - 4.9 * uu * uu), m.userData.p0.z - 2.4 * uu - i * 0.35 * uu); m.rotation.set(uu * 3 + i, uu * 2, uu * (i + 1)); });
    GH.deb.forEach((m, i) => { if (!on) { m.position.y = -5; return; } const a = (i * 2.39) % (Math.PI * 2), sp = 1.4 + (i % 7) * 0.5, uu = Math.min(u, 1.4); m.position.set(3.2 + Math.cos(a) * 0.55 - sp * uu * 0.2, Math.max(0.02, 2.0 + Math.sin(a) * 0.7 + 1.8 * uu - 4.9 * uu * uu), 5.9 - sp * uu * 1.3); m.rotation.set(i + u * 5, i * 0.7, u * 3); }); };
  const blastOld = (t, t0) => { const u = Math.max(0, t - t0); GH.doors.forEach((d, i) => { const sx = i ? 1 : -1; d.position.set(sx * (1.08 + u * 0.9), Math.max(0, 1.4 * u - 4.9 * u * u * 0.5) * 0, 5.98 - u * 3.2 * Math.max(0, 1 - u * 0.25)); d.rotation.set(-Math.min(1.45, u * 1.6), sx * u * 0.8, sx * u * 0.5); if (u > 0.9) d.position.y = 0.05; });
    GH.deb.forEach((m, i) => { const a = (i * 2.39) % (Math.PI * 2), sp = 2 + (i % 7) * 0.6, uu = Math.min(u, 1.4); m.position.set(Math.cos(a) * sp * uu * 0.6, Math.max(0.02, 1.4 + (i % 5) * 0.2 + 2.5 * uu - 4.9 * uu * uu), 5.9 - sp * uu * 1.3); m.rotation.set(i + u * 5, i * 0.7, u * 3); }); };
  shot('131_shake', GH, 50, (lt, t) => { GH.chand.rotation.z = 0.12 * Math.sin(lt * 3.1) * Math.exp(-lt * 0.25); GH.chand.rotation.x = 0.06 * Math.sin(lt * 2.3); GH.dust.forEach((m, i) => { m.position.y = 7.8 - ((L.q15(t) * 1.6 + i * 0.13) % 7); }); ghAva(0, -4.9, 0, L.still('idle', 0.3), [[-99, 'scared', 'neutral']], 4); ghDog(0.7, -4.9, 0.2, 'stare', lt, { look: V(0, 1, 6) }, 4); },
    [[0, 5.5, 2.0, 5.0], [6, 5.2, 2.1, 4.6]], V(0, 3.6, -2.0));
  shot('132_explode', GH, 44, (lt, t) => { blast(t, at('k3', 'explodes')); GH.keyL.intensity = 6; GH.keyL.position.set(2.6, 2.2, 4.4); }, [[0, -1.1, 1.3, 0.9], [4, -0.9, 1.25, 1.1]], V(3.2, 1.9, 6), LB((lt, o) => { lab(o, 'THE TALL WINDOW', 220, 100, '#ffd23f', 'k2', 'tall'); lab(o, 'GLASS AND WOOD', 470, 70, '#ff4030', 'k3', 'glass'); }));
  shot('132b_jump', GH, 48, (lt, t) => { blast(t, at('k3', 'explodes')); stalkJump(t); GH.keyL.intensity = 8; GH.keyL.position.set(2.6, 2.6, 5.0); GH.outL.intensity = 14; GH.outL.position.set(3.2, 3.5, 9.0); }, [[0, -0.6, 1.0, 0.3], [3, -0.5, 1.0, 0.5]], V(2.6, 1.6, 4.9), LB((lt, o) => { lab(o, 'IN ONE JUMP', 470, 70, '#ff4030', 'k3', 'jump'); }));
  const doorOpen = (t) => blast(t, at('k3', 'explodes'));
  const JUMP = () => at('k4', 'hits') - 1.25;
  const FLY = 1.15; const stalkJump = (t) => { const t0 = JUMP(), u = L.clamp01((t - t0) / FLY), P0 = V(3.3, 0, 9.4), P1 = V(2.3, 0, 3.4), p = P0.clone().lerp(P1, u); p.y = 2.2 * Math.sin(Math.PI * u) * (1 - 0.35 * u);
    const landed = t >= t0 + FLY, ut = Math.max(0, t - t0 - FLY), crouch = landed ? 1 - ease(1.0, 4.4, ut) : (t < t0 ? 0.25 : 0.55); GH.crack.visible = landed; if (landed && ut < 2.5) GH.puff.forEach((m, i) => { const a = i / 10 * 6.28, r = 0.4 + ut * 1.6; m.position.set(2.3 + Math.cos(a) * r, 0.25 + ut * 0.25, 3.4 + Math.sin(a) * r); m.material.opacity = 0.55 * (1 - ut / 2.5); m.scale.setScalar(1 + ut); m.lookAt(m.position.x, m.position.y, m.position.z + 1); }); stalk(p.x, p.z, Math.PI + 0.25, { crouch, reach: landed ? 0.35 * crouch : 0.9, duck: landed ? 0.3 * crouch : 0.5, grip: landed ? 0.2 : 0.8, pitch: landed ? -0.1 * crouch : 0, t }, p.y); };
  shot('133_land', GH, 44, (lt, t) => { doorOpen(t); stalkJump(t); GH.keyL.intensity = 5; GH.keyL.position.set(1.0, 2.6, 2.2); }, [[0, -2.4, 1.7, -0.4], [7, -2.1, 1.65, -0.1]], V(2.3, 0.9, 3.4), LB((lt, o) => { lab(o, 'TALLER THAN THE DOOR', 470, 70, '#ff4030', 'k4', 'taller'); }));
  shot('134_feet', GH, 34, (lt, t) => { doorOpen(t); GH.outL.intensity = 4; const z = 4.6 - lt * 0.4; stalk(0, z, Math.PI, { ph: lt * 0.42, w: 1, t }); GH.keyL.intensity = 4; GH.keyL.position.set(0.8, 0.8, z - 1.2); }, (lt) => V(0.9, 0.25, 3.0 - lt * 0.4), (lt) => V(0, 0.15, 4.4 - lt * 0.4), LB((lt, o) => { lab(o, 'SIZE OF SHOVELS', 470, 70, '#ff4030', 'k4', 'shovels'); }));
  shot('135_hands', GH, 30, (lt, t) => { doorOpen(t); GH.outL.intensity = 16; stalk(0, 3.6, Math.PI, { w: 0, grip: L.smooth(0.5 + 0.5 * Math.sin(lt * 2.6)), t, tilt: 0.1 }); GH.keyL.intensity = 5; GH.keyL.position.set(0.9, 1.6, 2.4); }, () => { GH.st.root.updateMatrixWorld(true); const h = GH.st.bn.handR.getWorldPosition(V()); return h.clone().add(V(0.5, 0.15, -0.9)); }, () => GH.st.bn.handR.getWorldPosition(V()),
    LB((lt, o) => { lab(o, 'EMPTY HANDS', 470, 70, '#ff4030', 'k5', 'empty'); }));
  thinkShot(GH, { id: '136_breath', x: 0.2, z: -4.8, y: 4, yaw: 0, faces: [[-99, 'shocked', 'gasp']], ang: 'front', lookAt: V(0, 1.5, 3.4), extra: (lt, t) => { doorOpen(t); stalk(0, 3.4, Math.PI, { w: 0, t }); } });
  thinkShot(GH, { id: '137_think_followed', x: 0.2, z: -4.8, y: 4, yaw: 0, faces: [[-99, 'scared', 'frown']], ang: 'qL', lookAt: V(0, 1.5, 3.4), extra: (lt, t) => { doorOpen(t); stalk(0, 3.4, Math.PI, { w: 0, t }); } });
  shot('138_tilt', GH, 40, (lt, t) => { doorOpen(t); stalk(0, 3.2, Math.PI, { w: 0, grip: 0.3, t }); }, [[0, -2.4, 1.2, -0.2], [6, -2.2, 1.25, 0.2]], V(0, 1.9, 3.2));
  shot('138b_tilt', GH, 26, (lt, t) => { doorOpen(t); const k = ease(at('k8b', 'tilts') - 0.2, at('k8b', 'head') + 0.5, t); stalk(0, 3.2, Math.PI, { w: 0, tilt: 0.45 * k, grip: 0.3, t }); }, () => { GH.st.root.updateMatrixWorld(true); return GH.st.bn.head.getWorldPosition(V()).add(V(0.25, -0.05, -1.25)); }, () => GH.st.bn.head.getWorldPosition(V()).add(V(0, 0.08, 0)));
  shot('139_looks_up', GH, 38, (lt, t) => { doorOpen(t); const k = ease(at('k9', 'looks') - 0.2, at('k9', 'stairs') + 0.3, t); stalk(0, 2.6, Math.PI, { w: 0, tilt: 0.45 * (1 - k), pitch: 0.7 * k, t }); ghAva(0.2, -4.9, 0, L.still('idle', 0.3), [[-99, 'scared', 'neutral']], 4); },
    [[0, 0.35, 5.6, -4.4], [5, 0.3, 5.5, -4.2]], V(0, 2.0, 2.6), LB((lt, o) => { lab(o, 'AT YOU', 470, 70, '#ff4030', 'k9', 'you'); }));
  shot('140_hunting', GH, 52, (lt, t) => { doorOpen(t); stalk(0, 2.4 - lt * 0.12, Math.PI, { ph: lt * 0.3, w: 0.6, pitch: 0.6, t }); ghAva(0.2, -4.9, 0, L.still('idle', 0.3), [[-99, 'scared', 'neutral']], 4); ghDog(0.9, -4.8, 0.1, 'growl', lt, { look: V(0, 1, 2.4) }, 4); },
    [[0, 0.55, 1.5, 4.7], [6, 0.5, 1.55, 4.5]], V(0.1, 3.7, -4.9), LB((lt, o) => { lab(o, 'HUNTING', 470, 70, '#ff4030', 'k11', 'hunting'); }));
  shot('141_bark', GH, 30, (lt, t) => { doorOpen(t); stalk(0, 2.0, Math.PI, { w: 0, pitch: 0.6, t }); ghAva(0.2, -4.9, 0, L.still('idle', 0.3), [[-99, 'scared', 'neutral']], 4); ghDog(0.9, -4.6, 0.1, 'growl', lt, { look: V(0, 1, 2.0) }, 4); GH.dog.root.updateMatrixWorld(true); },
    () => GH.dog.head.getWorldPosition(V()).add(V(0.8, 0.0, 0.9)), () => GH.dog.head.getWorldPosition(V()).add(V(0, -0.05, 0)));
  shot('142_two_sec', GH, 44, (lt, t) => { doorOpen(t); stalk(0, 1.8, Math.PI, { w: 0, pitch: 0.6, grip: 0.6, t }); const ch = ghAva(0.2, -4.9, 0, L.still('pistol_ready', 0.4), [[-99, 'scared', 'neutral']], 4); GH.ava.gun.visible = true; void ch; ghDog(0.9, -4.6, 0.1, 'growl', lt, { look: V(0, 1, 2.0) }, 4); },
    [[0, -0.5, 5.7, -6.0], [4, -0.55, 5.65, -5.8]], V(0, 1.4, 1.8));
  shot('143_window', MX, 46, (lt, t) => { MX.dawn(1); }, [[0, -11, 1.4, -15], [6, -11.3, 1.6, -15.6]], V(-7, 13, -30), LB((lt, o) => { lab(o, 'IVY', 470, 250, '#62f05a', 'q2', 'ivy'); }));
  shot('143b_river', MX, 40, (lt, t) => { MX.dawn(1); MX.heli.position.set(38, 10, -98); MX.heli.rotation.y = -Math.PI / 2 + Math.sin(lt * 0.3) * 0.2; }, [[0, 24, 17, -60], [6, 25, 17.2, -62]], V(38, 3, -100), LB((lt, o) => { lab(o, 'THE RIVER', 470, 70, '#4fd6ff', 'q3', 'river'); }));
  shot('144_lamps', UH, 32, (lt, t) => { const { ch } = UH.ava; AVA(ch, 0, -0.4, Math.PI); ch.pose(lt, L.still('pistol_ready', 0.4), [[-99, 'scared', 'neutral']]); UH.ava.gun.visible = true; UH.door.rotation.y = 0; },
    [[0, 0.5, 1.5, 0.6], [5, 0.45, 1.45, 0.3]], V(-0.2, 1.1, -3.5), LB((lt, o) => { lab(o, '15 BULLETS', 220, 100, '#ffd23f', 'q4', 'fifteen'); lab(o, 'OIL LAMPS', 470, 70, '#ff7b2e', 'q4', 'oil'); }));
  shot('144b_hall_lamps', UH, 44, (lt, t) => { UH.door.rotation.y = 0; }, [[0, 0.0, 1.5, 0.6], [6, 0.0, 1.45, -0.4]], V(0, 1.2, -12), LB((lt, o) => { lab(o, 'A HALLWAY FULL OF FIRE', 470, 70, '#ff7b2e', 'q4', 'hallway'); }));
  thinkShot(GH, { id: '145_ribbon_come', x: 0.2, z: -4.9, y: 4, yaw: 0.5, faces: [[-99, 'scared', 'neutral']], mouth: true, ang: 'front', lookAt: V(0.9, 4.2, -4.6), extra: (lt, t) => { doorOpen(t); stalk(0, 1.4, Math.PI, { w: 0, pitch: 0.6, t }); ghDog(0.9, -4.6, -0.6, 'growl', lt, { look: V(0, 1, 1.4) }, 4); } });
  shot('146_first_step', GH, 34, (lt, t) => { doorOpen(t); const ts = at('q7', 'first'), u = ease(ts - 0.3, ts + 1.0, t); stalk(0, -0.2 - 0.25 * u, Math.PI, { ph: 0.25 * u, w: u > 0 && u < 1 ? 1 : 0, pitch: 0.5, t }, 0.2 * u); GH.keyL.intensity = 4; GH.keyL.position.set(1.2, 0.8, 0.4); },
    [[0, 2.3, 0.45, 0.9], [5, 2.2, 0.5, 0.8]], V(0, 0.35, -0.45), LB((lt, o) => { lab(o, 'THE STAIRCASE GROANS', 470, 70, '#ff4030', 'q7', 'groans'); }));
  thinkShot(GH, { id: '147_think_decide', x: 0.2, z: -4.9, y: 4, yaw: 0.1, faces: [[-99, 'angry', 'frown']], ang: 'front', camOff: [0.0, 0.0, 0.75], lookAt: V(0, 1.5, -1), extra: (lt, t) => { doorOpen(t); stalk(0, -0.6, Math.PI, { w: 0, pitch: 0.5, t }, 0.2); } });
  shot('149_giant', GH, 40, (lt, t) => { doorOpen(t); const z = -0.6 - lt * 0.18; stalk(0, z, Math.PI, { ph: lt * 0.28, w: 1, pitch: 0.4, grip: 0.5 + 0.5 * Math.sin(lt * 1.3), t }, GH.stepY(z) * 0.95); },
    [[0, -2.8, 1.2, 0.8], [6, -2.6, 1.6, 0.4]], (lt) => V(0, 2.2 + lt * 0.15, -0.8 - lt * 0.18), LB((lt, o) => { lab(o, 'SLOWLY', 470, 70, '#ff4030', 'e3', 'slowly'); }));
  // ---- ITEM final en 3D: Ribbon, la pistola, la llave de plata y el helicoptero sobre pedestales (se encienden en su palabra)
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x040508); s.fog = new THREE.Fog(0x040508, 4, 12); s.add(new THREE.AmbientLight(0xffffff, 0.3)); s.add(new THREE.HemisphereLight(0x9ab0d8, 0x201810, 0.3)); floorPlane(s, 14, 14, tConcrete(1130, [70, 70, 74]), 7, 7);
    const X = [-2.1, -0.7, 0.7, 2.1], SP = X.map((x) => { cyl(0.42, 0.46, 0.16, 16, lam(null, 0x2a2c32), x, 0.08, 0, s); cyl(0.44, 0.44, 0.02, 16, L.basic(null, 0x6a7080), x, 0.165, 0, s); const l = new THREE.SpotLight(0xfff0d8, 0, 12, 0.45, 0.6, 1.2); l.position.set(x, 3.4, 1.6); l.target.position.set(x, 0.4, 0); s.add(l, l.target); return l; });
    const dg = await loadDog(L); s.add(dg.root); dg.root.position.set(X[0], 0.17, 0); dg.root.rotation.y = 0.5;
    const gun = mkGun(); gun.scale.setScalar(2.6); gun.position.set(X[1], 0.55, 0); s.add(gun);
    const key = new THREE.Group(); key.position.set(X[2], 0.55, 0); s.add(key); { const mS = lam(null, 0xd8dce4); L.mesh(new THREE.TorusGeometry(0.07, 0.016, 5, 12), mS, -0.12, 0, 0, key); B(0.22, 0.025, 0.02, mS, 0.04, 0, 0, key); B(0.025, 0.05, 0.02, mS, 0.12, -0.03, 0, key); B(0.02, 0.035, 0.02, mS, 0.08, -0.025, 0, key); }
    const hm = MX.heli.clone(true); hm.visible = true; hm.scale.setScalar(0.1); hm.position.set(X[3], 0.5, 0); hm.rotation.y = 0.8; hm.traverse((o) => { if (o.isSpotLight) o.intensity = 0; }); s.add(hm);
    const c = cam(40), WD = [['e1', 'dog'], ['e1', 'fifteen'], ['e1', 'silver'], ['e1', 'helicopter']];
    out['148_item_final'] = { scene: s, camera: c, update(lt, t) { WD.forEach(([tk, w], i) => { SP[i].intensity = 30 * ease(at(tk, w) - 0.15, at(tk, w) + 0.25, t); }); dg.update(lt, 'stand', {}); gun.rotation.y = lt * 0.6; key.rotation.y = -lt * 0.7; hm.rotation.y = 0.8 + lt * 0.3; hm.children.forEach((ch) => { if (ch.children.length === 2 && ch.position.y > 0.9) ch.rotation.y = lt * 8; });
        look(c, V(0.2 * Math.sin(lt * 0.2), 1.45, 5.2 - lt * 0.05), V(0, 0.6, 0)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); const t = this.t0 + lt; [['RIBBON', 'x1', '#62f05a'], ['HANDGUN', '15 BULLETS', '#ffd23f'], ['SILVER KEY', 'ATTIC', '#e8e8ec'], ['HELICOPTER', '1 HOUR', '#ff4030']].forEach(([n, sub, col], i) => {
          const k = ease(at(WD[i][0], WD[i][1]) - 0.1, at(WD[i][0], WD[i][1]) + 0.25, t); if (k <= 0) return; const [sx, sy] = L.toScreen(this.camera, X[i], 1.25, 0); o.tctx.globalAlpha = k; bitText(o.tctx, n, sx, sy - 22, 1, '#e8e8ec', { outline: '#000' }); bitText(o.tctx, sub, sx, sy - 8, 1, col, { outline: '#000' }); o.tctx.globalAlpha = 1; });
        const kg = ease(at('e2', 'giant') - 0.1, at('e2', 'giant') + 0.2, t); if (kg > 0) { o.tctx.globalAlpha = kg; bitText(o.tctx, '+ A GIANT ON THE STAIRS', LW / 2, 50, 2, '#ff4030', { outline: '#000' }); o.tctx.globalAlpha = 1; } } };
  }
  // ---- FINAL: Ava de cuerpo entero en lo alto de la escalera mirando al Stalker que sube; menu RE 1 RUN / 2 FIGHT con cuenta atras
  // DECISION con la gramatica medida en el clip de referencia (fuentes/re3-encuentro): destello blanco 0.5 s -> NEGATIVO congelado
  // sin texto 2.5 s -> parpadeo negro + destello -> NEGATIVO con las dos opciones 2.4 s -> parpadeo negro + destello -> imagen
  // NORMAL (mismo encuadre) con el menu, la caja de seleccion y la cuenta atras. Negativo total ~6.2 s, como en la referencia.
  const DZ = { flash1: [0, 0.5], neg1: [0.5, 3.0], blink1: [3.0, 3.5], neg2: [3.5, 5.9], blink2: [5.9, 6.4] };
  const decInv = (lt) => (lt >= 0.12 && lt < 6.15) ? 1 : 0;
  { const c = cam(40), RED = '#ff5040', DK = '#141414', WH = '#f0f0f0';
    out['150_choice'] = { scene: GH.scene, camera: c, hudOff: () => true, invert: decInv, update(lt, t) { GH.reset(t, lt); doorOpen(t); const frozen = lt < 6.2, sl = frozen ? lt * 0.03 : 0.19 + (lt - 6.2) * 0.12, z = -0.35 - sl * 0.12; stalk(-0.05, z, Math.PI, { ph: 0.15 + sl * 0.2, w: 0.7, pitch: 0.55, grip: 0.5 + 0.5 * Math.sin(sl * 1.6), t }, GH.stepY(z) * 0.95);   // casi congelado en el negativo, camara lenta despues
        const ch = ghAva(0.75, -5.0, -0.2, [L.seg('pistol_ready', -99, { from: 0.4, speed: 0 })], [[-99, 'scared', 'neutral']], 4); ch.lookAt({ position: V(0, 3.0, z) }, 0.9, 50); GH.ava.gun.visible = true; ghDog(1.35, -4.75, -0.25, 'growl', sl, { look: V(0, 1.5, z) }, 4);
        GH.keyL.intensity = 5; GH.keyL.position.set(0.9, 3.2, 0.6);
        look(c, cr([[0, 1.0, 2.6, 0.9], [20, 1.05, 2.65, 0.75]], lt), V(0.5, 3.6, -3.6)); GH.post(lt, t, c); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = this.t0 + lt, inn = (k) => lt >= DZ[k][0] && lt < DZ[k][1];
        cx.fillStyle = '#c4c4c0'; cx.fillRect(0, 0, LW, 34); cx.fillRect(0, LH - 34, LW, 34);   // barras gris claro
        const L1 = '1.  RUN    - out the window, to the river', L2 = '2.  FIGHT  - 15 bullets + the oil lamps';
        const o1 = at('e4', 'option'), o2 = at('e4', 'two'), sel = t >= o2 ? 1 : t >= o1 ? 0 : -1, normal = lt >= 6.4, showTxt = lt >= 3.5;
        if (showTxt) { cx.font = 'bold 15px "Courier New", monospace'; cx.textAlign = 'left'; cx.textBaseline = 'middle';
          [L1, L2].forEach((ln, i) => { const y = 160 + i * 24;
            if (normal) { if (i === sel) { cx.strokeStyle = '#5a7ae0'; cx.lineWidth = 2; cx.strokeRect(96, y - 11, 452, 22); cx.fillStyle = 'rgba(40,60,160,0.35)'; cx.fillRect(97, y - 10, 450, 20); }
              cx.fillStyle = '#000'; cx.fillText(ln, 105, y + 1); cx.fillStyle = i === sel ? WH : '#b8b8b8'; cx.fillText(ln, 104, y); }
            else { cx.fillStyle = DK; cx.fillText(ln, 104, y); } });
          if (normal) { const span = Math.max(4, ctx.endOf('e6') + 9 - this.t0 - 6.4), left = Math.max(0, 10 * (1 - (lt - 6.4) / span)); cx.fillStyle = '#2a0a08'; cx.fillRect(104, 194, 432, 4); cx.fillStyle = left < 3 ? RED : '#ffd23f'; cx.fillRect(104, 194, 432 * left / 10, 4); bitText(cx, '0:' + String(Math.ceil(left)).padStart(2, '0'), 560, 196, 1, left < 3 ? RED : '#ffd23f', { outline: '#000' }); } }
        // parpadeos negros y destellos blancos en rampa entre fases
        const ramp = (a0, a1) => Math.sin(Math.PI * L.clamp01((lt - a0) / (a1 - a0)));
        let w = 0, b = 0; if (inn('flash1')) w = ramp(0, 0.5); if (inn('blink1')) { b = lt < 3.25 ? ramp(3.0, 3.5) * 1.6 : 0; w = lt >= 3.25 ? ramp(3.25, 3.5 + 0.25) : 0; } if (inn('blink2')) { b = lt < 6.15 ? ramp(5.9, 6.4) * 1.6 : 0; w = lt >= 6.15 ? ramp(6.15, 6.65) * 0.8 : 0; }
        if (b > 0) { cx.fillStyle = `rgba(0,0,0,${Math.min(1, b)})`; cx.fillRect(0, 0, LW, LH); } if (w > 0) { cx.fillStyle = `rgba(255,255,255,${0.9 * w})`; cx.fillRect(0, 0, LW, LH); }
        cx.font = 'bold 13px "Courier New", monospace'; cx.textAlign = 'center'; cx.fillStyle = DK;
        if (t >= at('e5', 0)) cx.fillText('COMMENT 1 OR 2' + (t >= at('e6', 'most') ? '   -   MOST COMMENTS DECIDE DAY 4' : ''), LW / 2, LH - 17);
        if (t >= ctx.endOf('e6') - 0.6) bitText(cx, 'SUBSCRIBE!', LW - 80, 18, 2, '#a00808', { outline: null }); } };
  }

  for (const s of Object.values(out)) if (s.overlay) s.overlay = s.overlay.bind(s);
  for (const o of Object.values(out)) if (o.scene === FO.scene || o.scene === MX.scene) far(o.camera, 420);
  return out;
}
