// sets/p2new.js — LARGO 2 ("Day 2"): los decorados NUEVOS, todos en codigo (look PS1) salvo los modelos CC0 citados.
// Mundos: LOBBY (rincon del vestibulo para los primeros planos), MOTOR POOL (patrullas Kenney CC0, generador, porton
// entreabierto con luz de dia, maletero con kit), BANO (cubo con bolsas), CELDAS (pasillo de 4 celdas, DUTCH en la 4),
// EVIDENCIA (jaula con 8 latas etiquetadas), ARCHIVO (archivador corrido y puertita de hierro con un TREBOL), SOTANO 1920
// (celdas de piedra, barrotes oxidados, mesa con farol y cuaderno, maquina de escribir vieja, escaleras de piedra),
// TUNEL (piedra mojada, borde seco, charcos, MARLA al fondo), AZOTEA (pretil, equipos, skyline, rio, puente, helicoptero
// original low poly, tubo). Primeros planos de pensamiento ([PIENSA]/[RESPIRA]/*temblando*) en cada mundo: la camara se
// queda en su cara/manos, ella NO mira a camara (piensa), boca quieta salvo en las lineas que dice en voz alta.
// Tiempos: SIEMPRE anclados a palabras (ctx.at). Contrato: ../SETS.md.
import { kit, bitText, textWidth } from './r2kit.js';
import { loadDog } from './dog.js';
import { makePerson } from './p2people.js';
import { paintScared } from './avaface.js';

export function sfx() { return []; }

export async function shots(ctx) {
  const { L, TL } = ctx;
  const K = kit(ctx), { THREE, LW, LH, V, px, B, cyl, lam, basic, DS, cam, look, vignette, label, tConcrete, tBlock, tMetal, tTile, tWood, tGlow, fluor } = K;
  const T = ctx.T, at = (tk, k = 0) => ctx.at(tk, k), endOf = (tk, k = -1) => ctx.endOf(tk, k);
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cr = (keys, t) => { if (t <= keys[0][0]) return V(keys[0][1], keys[0][2], keys[0][3]); let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const k = (j) => keys[Math.max(0, Math.min(keys.length - 1, j))], [a, b, c, d] = [k(i - 1), k(i), k(i + 1), k(i + 2)], u = Math.min(1, (t - b[0]) / (c[0] - b[0])), u2 = u * u, u3 = u2 * u;
    const f = (j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3); return V(f(1), f(2), f(3)); };
  const WHO = {}; TL.takes.forEach((id) => { WHO[id] = null; });
  // boca de otros personajes: abierta mientras suena una palabra de sus tomas (pulso por silaba)
  const talkOf = (takes) => (t) => { for (const tk of takes) for (const w of ctx.words(tk) || []) if (t >= w[1] && t <= w[2]) return 0.5 + 0.5 * Math.abs(Math.sin((t - w[1]) * 18)); return 0; };
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const out = {};
  const box2 = (o, x, y, lines, col, k = 1, sc = 1) => { if (k <= 0) return; label(o, lines.join('\n'), x, y, col, null, k, sc); };

  // ---------- personajes compartidos (un Ava por mundo: el modelo no se puede compartir entre escenas) ----------
  const mkAva = (scene) => { const ch = L.hero(); paintScared(ch); scene.add(ch.root); const fl = K.flashlight(ch, scene); fl.hide(); return { ch, fl }; };
  const AVA = (ch, x, z, yaw, y = 0) => { ch.root.position.set(x, y, z); ch.root.rotation.y = yaw; };
  const lights = (scene, { amb = 0.7, hemi = 0.5, col = 0xffffff, sky = 0x9ab0d8 } = {}) => { scene.add(new THREE.AmbientLight(col, amb)); scene.add(new THREE.HemisphereLight(sky, 0x403830, hemi)); };
  const floorPlane = (scene, w, d, tex, rx, ry, x = 0, z = 0, y = 0.001, col = 0xffffff) => { const g = new THREE.PlaneGeometry(w, d, Math.ceil(w / 0.5), Math.ceil(d / 0.5)); const o = L.mesh(g, lam(L.rep(tex, rx, ry), col), x, y, z, scene); o.rotation.x = -Math.PI / 2; return o; };
  const wallBox = (scene, w, h, d, tex, rx, ry, x, y, z, col = 0xffffff) => B(w, h, d, lam(L.rep(tex, rx, ry), col), x, y, z, scene);
  // v4: cierre de sala con profundidad (paredes que faltaban, techo, zocalo, moldura, tuberias con abrazaderas, marco de puerta con
  // pasillo que se aleja hacia la oscuridad y luces tenues que caen) + niebla negra: el fondo nunca es un plano oscuro liso.
  const shell = (s, { x0, x1, z0, z1, h, tex, walls, door, lamps, fog = [0x040506, 5, 16], col = 0xffffff }) => {
    const mT = lam(null, 0x2a2a2a), mPipe = lam(null, 0x5a5e5a), mRust = lam(null, 0x6a3a1a), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
    const side = { n: [W, 0.2, cx, z0, 0], s: [W, 0.2, cx, z1, 0], w: [D, 0.2, x0, cz, 1], e: [D, 0.2, x1, cz, 1] };
    for (const k of walls) { const [len, , x, z, rot] = side[k], hasDoor = door && door.side === k;
      const seg = (a, b) => { if (b - a < 0.05) return; const m = (a + b) / 2; if (rot) wallBox(s, 0.2, h, b - a, tex, Math.max(1, (b - a) / 2), h / 2.5, x, h / 2, m, col); else wallBox(s, b - a, h, 0.2, tex, Math.max(1, (b - a) / 2), h / 2.5, m, h / 2, z, col); };
      const lo = rot ? z0 : x0, hi = rot ? z1 : x1;
      if (hasDoor) { const a = door.at - door.w / 2, b = door.at + door.w / 2; seg(lo, a); seg(b, hi);
        const lintel = h - door.h; if (rot) wallBox(s, 0.2, lintel, door.w, tex, 1, 1, x, door.h + lintel / 2, door.at, col); else wallBox(s, door.w, lintel, 0.2, tex, 1, 1, door.at, door.h + lintel / 2, z, col);
        const mF = lam(null, 0x3a3026), out = (k === 'n' || k === 'w') ? -1 : 1;
        for (const sgn of [-1, 1]) { if (rot) B(0.28, door.h, 0.08, mF, x, door.h / 2, door.at + sgn * (door.w / 2 + 0.04), s); else B(0.08, door.h, 0.28, mF, door.at + sgn * (door.w / 2 + 0.04), door.h / 2, z, s); }
        if (rot) B(0.28, 0.1, door.w + 0.16, mF, x, door.h + 0.05, door.at, s); else B(door.w + 0.16, 0.1, 0.28, mF, door.at, door.h + 0.05, z, s);
        const L2 = 7, cxx = rot ? x + out * L2 / 2 : door.at, czz = rot ? door.at : z + out * L2 / 2;   // pasillo que se aleja
        const cw = rot ? [L2, door.w + 0.6] : [door.w + 0.6, L2];
        floorPlane(s, cw[0], cw[1], tex, 2, 2, cxx, czz, 0.002, 0x7a7a7a);
        for (const sgn of [-1, 1]) { if (rot) wallBox(s, L2, door.h + 0.4, 0.15, tex, 3, 1, cxx, (door.h + 0.4) / 2, door.at + sgn * (door.w / 2 + 0.3), 0x9a9a9a); else wallBox(s, 0.15, door.h + 0.4, L2, tex, 3, 1, door.at + sgn * (door.w / 2 + 0.3), (door.h + 0.4) / 2, czz, 0x9a9a9a); }
        if (rot) B(L2, 0.1, door.w + 0.6, lam(null, 0x1a1a1a), cxx, door.h + 0.4, door.at, s); else B(door.w + 0.6, 0.1, L2, lam(null, 0x1a1a1a), door.at, door.h + 0.4, czz, s);
        for (let i = 1; i <= 2; i++) { const pl = new THREE.PointLight(0xffd8a0, 1.6 / i, 3.2, 1.6); pl.position.set(rot ? x + out * i * 2.6 : door.at, door.h + 0.2, rot ? door.at : z + out * i * 2.6); s.add(pl);
          B(0.3, 0.04, 0.12, basic(null, 0xffe8b0), pl.position.x, door.h + 0.33, pl.position.z, s); }
      } else seg(lo, hi);
      const inn = (k === 'n' || k === 'w') ? 0.11 : -0.11;   // zocalo, moldura alta y tuberia con abrazaderas en la cara interior
      if (rot) { B(0.03, 0.14, D, mT, x + inn, 0.07, cz, s); B(0.04, 0.08, D, mT, x + inn, h - 0.12, cz, s); const pp = L.mesh(new THREE.CylinderGeometry(0.05, 0.05, D, 8), mPipe, x + inn * 1.6, h - 0.45, cz, s); pp.rotation.x = Math.PI / 2;
        for (let zz = z0 + 0.5; zz < z1; zz += 1.4) B(0.1, 0.13, 0.04, mRust, x + inn * 1.6, h - 0.45, zz, s); }
      else { B(W, 0.14, 0.03, mT, cx, 0.07, z + inn, s); B(W, 0.08, 0.04, mT, cx, h - 0.12, z + inn, s); const pp = L.mesh(new THREE.CylinderGeometry(0.05, 0.05, W, 8), mPipe, cx, h - 0.45, z + inn * 1.6, s); pp.rotation.z = Math.PI / 2;
        for (let xx = x0 + 0.5; xx < x1; xx += 1.4) B(0.04, 0.13, 0.1, mRust, xx, h - 0.45, z + inn * 1.6, s); }
    }
    for (const [k, a, y] of (lamps || [])) {   // apliques de pared enrejados: charco de luz que cae sobre la pared
      const [, , x, z, rot] = side[k], inn = (k === 'n' || k === 'w') ? 1 : -1, px_ = rot ? x + inn * 0.16 : a, pz = rot ? a : z + inn * 0.16;
      L.mesh(new THREE.SphereGeometry(0.06, 6, 4), basic(null, 0xffe0a0), px_, y, pz, s); B(rot ? 0.06 : 0.16, 0.05, rot ? 0.16 : 0.06, mT, rot ? x + inn * 0.12 : a, y + 0.09, rot ? a : z + inn * 0.12, s);
      const pl = new THREE.PointLight(0xffc888, 3.2, 4.5, 1.4); pl.position.set(rot ? x + inn * 0.45 : a, y - 0.1, rot ? a : z + inn * 0.45); s.add(pl); }
    B(W, 0.1, D, lam(null, 0x1c1e20), cx, h + 0.05, cz, s);   // techo
    for (let xx = x0 + 1; xx < x1; xx += 2) B(0.12, 0.18, D, lam(null, 0x2a2c2e), xx, h - 0.09, cz, s);   // vigas
    s.fog = new THREE.Fog(fog[0], fog[1], fog[2]); s.background = new THREE.Color(fog[0]);
  };
  /** primer plano de pensamiento: ava en (x, z, yaw), pose, caras, camara cerca de la cara mirando a un punto al lado */
  const ANG = { q: [0.32, 0.0, 0.9], profile: [0.95, 0.02, 0.22], low: [0.25, -0.32, 0.95], ots: [-0.28, 0.12, -0.75], front: [0.04, 0.02, 1.0], high: [0.2, 0.42, 0.8], qL: [-0.34, 0.0, 0.9] };
  const neckBand = (ch) => { if (ch.root.userData.nb) return; const NB = ch.bone.getObjectByName('Neck'); const m = L.lam(null, 0xc8a08a); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.07, 10, 1, true), m); band.material.side = THREE.DoubleSide;
    ch.root.updateMatrixWorld(true); const np = NB.getWorldPosition(V()); band.position.copy(np).add(V(0, 0.035, 0.008)); ch.root.add(band); band.updateMatrixWorld(true); NB.attach(band); ch.root.userData.nb = band; };   // tapa la costura oscura del cuello del modelo (color piel)
  const thinkShot = (W, { id, take, x, z, yaw, y = 0, clip = 'idle', from = 0.3, still = true, faces, ang = 'q', camOff, camOff2, lookAt, flash = false, mouth = false, sit = false, extra, ov }) => {
    const c = cam(34); neckBand(W.ava.ch);
    out[id] = { scene: W.scene, camera: c,
      update(lt, t) { W.reset && W.reset(t); const { ch, fl } = W.ava; fl.unaim(); AVA(ch, x, z, yaw, y);
        const fc = (faces || [[-99, 'half', 'neutral']]).map(([tt, e, m]) => [tt, e, mouth ? K.mouthAt(t, m) : m]);
        ch.pose(lt, still ? L.still(clip, from) : [L.seg(clip, 0, { loop: true, speed: 0.6 })], fc);
        if (lookAt) ch.lookAt({ position: lookAt }, 0.8, 40); ch.root.updateMatrixWorld(true);
        const eye = ch.bone.getObjectByName('Head').getWorldPosition(V()).add(V(0, 0.11, 0));
        const fw = V(Math.sin(yaw), 0, Math.cos(yaw)), rt = V(Math.cos(yaw), 0, -Math.sin(yaw));
        const o1 = camOff || ANG[ang], u = L.smooth(L.clamp01(lt / 6)), k = 1 - 0.18 * u;   // push-in lento
        const p = eye.clone().addScaledVector(rt, o1[0] * k).addScaledVector(fw, o1[2] * k); p.y += o1[1] * k;
        look(c, p, eye.clone().add(V(0, -0.1, 0)));   // ojos en el tercio de arriba: cabeza y hombros con aire
        if (flash) { fl.show(); fl.aim(eye.clone().addScaledVector(fw, 3).add(V(0, -1.0, 0)), 1); fl.on(true, c, eye.clone().addScaledVector(fw, 3), 1, false, 10); } else fl.hide();
        if (extra) extra(lt, t); },
      overlay(lt, dt, a, o) { vignette(o, 0.45, 0.3); if (ov) ov(lt, o, c); } };
  };
  /** primer plano de detalle (manos / objeto) en lugar de otra cara */
  const unFace = (obj) => { if (obj.userData.home) { obj.position.copy(obj.userData.home); obj.quaternion.copy(obj.userData.homeQ); } };
  const faceCam = (obj, c, dx = 0, dy = 0, tilt = -0.3) => { c.updateMatrixWorld(true); obj.parent.updateMatrixWorld(true);
    if (obj.userData.home === undefined) { obj.userData.home = obj.position.clone(); obj.userData.homeQ = obj.quaternion.clone(); }
    obj.position.copy(obj.userData.home); obj.updateMatrixWorld(true);
    const wp = obj.getWorldPosition(V()).add(V(1, 0, 0).applyQuaternion(c.quaternion).multiplyScalar(dx)).add(V(0, 1, 0).applyQuaternion(c.quaternion).multiplyScalar(dy));
    obj.position.copy(obj.parent.worldToLocal(wp));
    const pq = obj.parent.getWorldQuaternion(new THREE.Quaternion()).invert(); obj.quaternion.copy(pq.multiply(c.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0.06))))); };   // prop en la mano mirando a camara, derecho
  const detailShot = (W, { id, x, z, yaw, clip = 'hold_up_object', from = 0.8, faces, target, off, prop, shake = 0, extra, ov, post }) => { const c = cam(30, 0.01);
    out[id] = { scene: W.scene, camera: c, update(lt, t) { W.reset && W.reset(t); const { ch, fl } = W.ava; fl.unaim(); fl.hide(); AVA(ch, x, z, yaw); ch.pose(lt, L.still(clip, from), faces || [[-99, 'scared', 'neutral']]);
        if (shake) { const hb = ch.hand('L'); hb.rotation.z += 0.04 * shake * Math.sin(L.q15(lt) * 38); hb.rotation.x += 0.03 * shake * Math.sin(L.q15(lt) * 29); }   // manos temblando (solo la mano, no Ava ni la camara)
        if (extra) extra(lt, t); ch.root.updateMatrixWorld(true); const tg = target(ch); const fw = V(Math.sin(yaw), 0, Math.cos(yaw)), rt = V(Math.cos(yaw), 0, -Math.sin(yaw));
        const u = L.smooth(L.clamp01(lt / 5)), k = 1 - 0.15 * u; const p = tg.clone().addScaledVector(rt, off[0] * k).addScaledVector(fw, off[2] * k); p.y += off[1] * k; look(c, p, tg); if (post) post(c, ch); },
      overlay(lt, dt, a, o) { vignette(o, 0.5, 0.3); if (ov) ov(lt, o, c, this.t0 + lt); } }; };

  // =====================================================================================================================
  // LOBBY (rincon para los primeros planos): mostrador de madera, columna, puertas de cristal con luz azul/amanecer
  // =====================================================================================================================
  const LOB = { scene: new THREE.Scene() }; { const s = LOB.scene; s.background = new THREE.Color(0x0c1018); lights(s, { amb: 0.55, hemi: 0.4 });
    floorPlane(s, 10, 10, tTile(301, '#8a8478', '#5a564e'), 10, 10); wallBox(s, 10, 4, 0.2, tBlock(302, '#5a6470', '#8a8e86', 40), 4, 2, 0, 2, -3);
    B(3, 1.05, 0.7, lam(L.rep(tWood(303), 3, 1)), 0, 0.525, 0.6, s); B(3.1, 0.06, 0.8, lam(null, 0x3a2a1a), 0, 1.08, 0.6, s);
    const glassL = new THREE.PointLight(0x9ab8ff, 6, 9, 1.2); glassL.position.set(-2, 2.2, 4); s.add(glassL); LOB.glassL = glassL;
    const warm = new THREE.PointLight(0xffd8a0, 3, 6, 1.4); warm.position.set(1.5, 2.5, -1); s.add(warm);
    LOB.ava = mkAva(s); }

  // =====================================================================================================================
  // MOTOR POOL: hormigon con manchas de aceite, dos patrullas Kenney (CC0), generador, porton enrollable entreabierto
  // =====================================================================================================================
  const MP = { scene: new THREE.Scene() }; { const s = MP.scene; s.background = new THREE.Color(0x10141a); lights(s, { amb: 0.34, hemi: 0.3 });
    const tC = tConcrete(311, [110, 108, 102]); floorPlane(s, 16, 12, tC, 8, 6);
    const tOil = L.cvs(32, 32, (c) => { const r = L.rng(312); c.clearRect(0, 0, 32, 32); for (let k = 0; k < 5; k++) { c.fillStyle = `rgba(12,10,8,${0.3 + r() * 0.3})`; c.beginPath(); c.ellipse(16 + (r() - 0.5) * 10, 16 + (r() - 0.5) * 10, 4 + r() * 9, 3 + r() * 6, r() * 3, 0, 7); c.fill(); } });
    { const r = L.rng(313); for (let k = 0; k < 7; k++) { const o = L.plane(1 + r(), 1 + r(), basic(tOil, 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), (r() - 0.5) * 10, 0.008, (r() - 0.5) * 7, s, r() * 3, -Math.PI / 2); o.renderOrder = 3; } }
    for (let k = -1; k <= 1; k++) L.plane(0.1, 5, basic(null, 0xd8c040, { polygonOffset: true, polygonOffsetFactor: -2 }), k * 3.2 - 1.6, 0.01, 0, s, 0, -Math.PI / 2);
    const tW = tBlock(314, '#4a5058', '#7a7e78', 36); wallBox(s, 16, 5, 0.2, tW, 8, 2, 0, 2.5, -6); wallBox(s, 0.2, 5, 12, tW, 6, 2, -8, 2.5, 0);
    // porton enrollable en la pared del fondo, entreabierto 40 cm: luz de dia por debajo
    const tRoll = L.cvs(32, 64, (c) => { for (let y = 0; y < 64; y++) { const k = y % 4 === 0 ? 0.6 : 1; px(c, 0, y, K.rgb(150 * k, 152 * k, 150 * k), 32, 1); } });
    B(4.2, 4.0, 0.12, lam(L.rep(tRoll, 2, 6)), 3, 2.4, -5.85, s); L.plane(4.2, 0.4, basic(null, 0xfff2d8), 3, 0.2, -5.95, s);
    const day = new THREE.SpotLight(0xffe8c0, 30, 14, 0.9, 0.6, 1.2); day.position.set(3, 0.3, -6.4); day.target.position.set(3, 0, -2); s.add(day, day.target);
    L.plane(4.4, 3.0, basic(null, 0xfff0d0, { transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending }), 3, 0.012, -4.5, s, 0, -Math.PI / 2);
    fluor(s, -3, 4.6, 0, 0.3, 1.4); fluor(s, 2, 4.6, 0, 0.3, 1.4);
    shell(s, { x0: -8, x1: 8, z0: -6, z1: 6, h: 5, tex: tW, walls: ['s', 'e'], door: { side: 'e', at: 2.2, w: 1.4, h: 2.4 }, lamps: [['e', 0.2, 2.9], ['e', 4.6, 2.9], ['s', 5.6, 2.9], ['s', -1.0, 2.9], ['n', -5.5, 3.3], ['n', -1.2, 3.3], ['w', -3.5, 3.3], ['w', 2.5, 3.3]], fog: [0x040506, 7, 20] });
    MP.fl1 = new THREE.PointLight(0xf4f8ff, 6, 10, 1.2); MP.fl1.position.set(0, 4.2, 0); s.add(MP.fl1);
    // patrullas (Kenney Car Kit police, CC0)
    const car = await L.loadModel('models/police-kenney.glb'); const mkCar = (x, z, ry) => { const m = L.ps1Clone(car.scene); const bb = new THREE.Box3().setFromObject(m), k = 4.3 / (bb.max.z - bb.min.z); m.scale.multiplyScalar(k); m.position.set(x, -bb.min.y * k, z); m.rotation.y = ry; s.add(m); return m; };
    mkCar(-4.8, -0.5, 0); mkCar(-1.6, 0.2, 0.05);
    // generador portatil (bastidor tubular, tanque rojo, motor, panel con interruptor y enchufes)
    const gen = new THREE.Group(); gen.position.set(1.6, 0, -3.6); s.add(gen); MP.gen = gen;
    { const mF = lam(null, 0x1a1a1c), mR = lam(L.rep(tMetal(315, '#b02a1e'), 1, 1)), mE = lam(L.rep(tMetal(316, '#4a4c50'), 1, 1)), mY = lam(null, 0xd8b020);
      for (const [x, z] of [[-0.42, -0.3], [0.42, -0.3], [-0.42, 0.3], [0.42, 0.3]]) B(0.04, 0.62, 0.04, mF, x, 0.31, z, gen);
      for (const y of [0.04, 0.6]) { B(0.88, 0.04, 0.04, mF, 0, y, -0.3, gen); B(0.88, 0.04, 0.04, mF, 0, y, 0.3, gen); B(0.04, 0.04, 0.64, mF, -0.42, y, 0, gen); B(0.04, 0.04, 0.64, mF, 0.42, y, 0, gen); }
      B(0.7, 0.2, 0.48, mR, 0, 0.66, 0, gen); cyl(0.05, 0.05, 0.05, 8, mF, 0.2, 0.78, 0, gen); B(0.42, 0.34, 0.36, mE, -0.1, 0.32, 0, gen); cyl(0.12, 0.12, 0.08, 10, mE, 0.28, 0.32, 0, gen).rotation.z = Math.PI / 2;
      const tPan = L.cvs(32, 16, (c) => { px(c, 0, 0, '#2a2a2e', 32, 16); px(c, 2, 2, '#d8b020', 10, 5); c.fillStyle = '#111'; c.font = 'bold 4px monospace'; c.fillText('POWER', 2, 6); for (let i = 0; i < 2; i++) { px(c, 16 + i * 7, 4, '#e8e4dc', 5, 8); px(c, 18 + i * 7, 6, '#111', 1, 3); } px(c, 3, 10, '#c02020', 5, 4); });
      L.plane(0.3, 0.15, lam(tPan), 0.25, 0.42, 0.24, gen); MP.sw = B(0.03, 0.06, 0.03, mY, 0.2, 0.42, 0.26, gen);
      const pipe = cyl(0.025, 0.025, 0.4, 6, mF, -0.45, 0.4, -0.1, gen); pipe.rotation.z = Math.PI / 2; void mY; }
    // estanteria con kits / bidones
    for (let k = 0; k < 3; k++) { B(1.8, 0.04, 0.5, lam(null, 0x6a6e70), 6.6, 0.5 + k * 0.7, -3, s); for (let j = 0; j < 4; j++) B(0.3, 0.32, 0.3, lam(null, [0xb02a1e, 0x2a4a8a, 0xd8c040, 0x3a5a3a][(j + k) % 4]), 5.9 + j * 0.45, 0.7 + k * 0.7, -3, s); }
    // kit de emergencia del maletero (bolsa roja con cruz blanca) detras de la 2a patrulla
    const tKit = L.cvs(32, 16, (c) => { px(c, 0, 0, '#b8201c', 32, 16); px(c, 13, 3, '#f0f0f0', 6, 10); px(c, 10, 6, '#f0f0f0', 12, 4); px(c, 0, 0, '#7a1010', 32, 2); });
    MP.kit = B(0.5, 0.25, 0.3, [lam(null, 0xb8201c), lam(null, 0xb8201c), lam(null, 0xa01818), lam(null, 0x801010), lam(tKit), lam(tKit)], -1.6, 0.13, 2.7, s);
    MP.ava = mkAva(s); }

  // =====================================================================================================================
  // BANO: azulejos, cabina, cubo con dos bolsas, lata de cafe molido, precintos
  // =====================================================================================================================
  const WC = { scene: new THREE.Scene() }; { const s = WC.scene; s.background = new THREE.Color(0x101418); lights(s, { amb: 0.65, hemi: 0.5 });
    const tTileW = L.cvs(32, 32, (c) => { const r = L.rng(321); px(c, 0, 0, '#d8d8cc', 32, 32); for (let i = 0; i < 32; i += 8) { px(c, i, 0, '#9a9a8e', 1, 32); px(c, 0, i, '#9a9a8e', 32, 1); } for (let k = 0; k < 20; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(120,110,80,0.3)', 1, 1); });
    floorPlane(s, 5, 5, tTile(322, '#3a4048', '#d8d8d0'), 6, 6); for (const [w, x, z, ry] of [[5, 0, -2.5, 0], [5, -2.5, 0, 1], [5, 2.5, 0, 1]]) { const m = wallBox(s, w, 3, 0.15, tTileW, w * 1.6, 5, x, 1.5, z); m.rotation.y = ry * Math.PI / 2; }
    B(0.05, 2, 1.4, lam(null, 0x5a6a7a), 0.6, 1.05, -1.8, s); B(1.2, 0.05, 1.4, lam(null, 0x5a6a7a), 0, 2.0, -1.8, s);
    B(0.42, 0.42, 0.55, lam(null, 0xecece4), -0.2, 0.21, -2.15, s); B(0.44, 0.46, 0.18, lam(null, 0xecece4), -0.2, 0.62, -2.4, s);   // inodoro (tanque cerrado: agua de beber)
    const bk = new THREE.Group(); bk.position.set(0.9, 0, -0.5); s.add(bk); WC.bucket = bk; bk.position.set(0.9, 0, -0.35);
    { const tBk = L.cvs(32, 16, (c) => { px(c, 0, 0, '#d8a020', 32, 16); for (let x = 0; x < 32; x += 4) px(c, x, 0, '#b88010', 1, 16); px(c, 0, 0, '#f0c040', 32, 2); });
      L.mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.36, 12, 1, true), lam(tBk, 0xffffff, { side: DS }), 0, 0.18, 0, bk); L.mesh(new THREE.CircleGeometry(0.13, 12), lam(null, 0xb88010), 0, 0.005, 0, bk).rotation.x = -Math.PI / 2;
      const bag = L.mesh(new THREE.CylinderGeometry(0.19, 0.155, 0.12, 12, 1, true), lam(null, 0x16161a, { side: DS }), 0, 0.37, 0, bk); void bag;
      L.mesh(new THREE.CircleGeometry(0.15, 12), lam(null, 0x3a2414), 0, 0.3, 0, bk).rotation.x = -Math.PI / 2;   // capa seca (cafe molido)
      const tCan = L.cvs(32, 16, (c) => { px(c, 0, 0, '#2a3a6a', 32, 16); c.fillStyle = '#f0e0b0'; c.font = 'bold 5px monospace'; c.fillText('COFFEE', 6, 9); });
      L.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 10), lam(tCan), 0.32, 0.07, 0.12, bk);
      const tRoll = L.cvs(16, 16, (c) => { px(c, 0, 0, '#121214', 16, 16); for (let y = 0; y < 16; y += 3) px(c, 0, y, '#2a2a30', 16, 1); }); L.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 10), lam(tRoll), -0.3, 0.06, 0.18, bk).rotation.z = Math.PI / 2;
      for (let k = 0; k < 4; k++) B(0.16, 0.004, 0.006, basic(null, 0xe8e8e0), -0.2 + k * 0.02, 0.003, 0.32, bk); }
    fluor(s, 0, 2.95, 0, 0.3, 1.2); const wl = new THREE.PointLight(0xf4f8ff, 5, 7, 1.3); wl.position.set(0, 2.6, 0); s.add(wl);
    WC.ava = mkAva(s); }

  // =====================================================================================================================
  // CELDAS: pasillo (x -1.2..1.2), 4 celdas a la derecha (x 1.2..3.8), placas 1-4; DUTCH en la 4 (z -6)
  // =====================================================================================================================
  const CB = { scene: new THREE.Scene() }; { const s = CB.scene; s.background = new THREE.Color(0x0a0c10); lights(s, { amb: 0.42, hemi: 0.35 });
    floorPlane(s, 6, 14, tConcrete(331, [96, 98, 96]), 3, 7, 1.3, -3.5); const tW = tBlock(332, '#5a6258', '#8a8e84', 34);
    wallBox(s, 0.2, 3, 14, tW, 7, 1.5, 1.5, -1.2, -3.5); wallBox(s, 0.2, 3, 14, tW, 7, 1.5, 1.5, 3.9, -3.5); wallBox(s, 5.4, 3, 0.2, tW, 3, 1.5, 1.35, 1.5, -10.5);
    const mBar = lam(L.rep(tMetal(333, '#3a3e44'), 1, 4)), mPlate = (n) => basic(L.cvs(16, 16, (c) => { px(c, 0, 0, '#c8b060', 16, 16); px(c, 1, 1, '#7a6a30', 14, 14); c.fillStyle = '#1a1408'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.fillText(String(n), 8, 12); }));
    CB.cellZ = [-0.5, -2.5, -4.5, -6.5];
    CB.cellZ.forEach((zc, i) => { for (let k = -8; k <= 8; k++) cyl(0.014, 0.014, 2.6, 5, mBar, 1.2, 1.3, zc + k * 0.11, s); B(0.06, 0.06, 1.9, mBar, 1.2, 2.55, zc, s); B(0.06, 0.06, 1.9, mBar, 1.2, 0.05, zc, s); B(0.06, 0.06, 1.9, mBar, 1.2, 1.15, zc, s);
      if (i < 3) wallBox(s, 2.6, 2.6, 0.12, tW, 1.3, 1.3, 2.5, 1.3, zc - 1.0); L.plane(0.16, 0.16, mPlate(i + 1), 1.17, 2.25, zc + 0.9, s, -Math.PI / 2);
      B(0.7, 0.08, 1.8, lam(null, 0x4a4e52), 3.4, 0.45, zc, s); B(0.68, 0.06, 1.7, lam(null, 0x6a7a8a), 3.4, 0.52, zc, s); });   // camastros
    wallBox(s, 2.6, 2.6, 0.12, tW, 1.3, 1.3, 2.5, 1.3, -7.5);
    fluor(s, 0, 2.95, -1, 0.3, 1.2); CB.lamp = new THREE.PointLight(0xf0f4ff, 4, 8, 1.3); CB.lamp.position.set(0, 2.6, -3); s.add(CB.lamp);
    const cell4 = new THREE.PointLight(0xc8d0e0, 2, 4, 1.4); cell4.position.set(2.6, 2.2, -6.5); s.add(cell4);
    CB.dutch = await makePerson(L, 'dutch'); s.add(CB.dutch.root); B(0.5, 0.45, 0.4, lam(null, 0x4a4e52), 2.75, 0.225, -6.6, s); CB.dutch.root.position.set(2.7, 0, -6.6); CB.dutch.root.rotation.y = -Math.PI / 2;   // banco donde se sienta
    CB.cup = new THREE.Group(); s.add(CB.cup); L.mesh(new THREE.CylinderGeometry(0.04, 0.032, 0.09, 8, 1, true), lam(null, 0xe8e4d8, { side: DS }), 0, 0.045, 0, CB.cup); CB.cup.position.set(2.0, 0, -6.3);
    const eyesG = new THREE.Group(); s.add(eyesG); for (const dz of [-0.035, 0.035]) L.mesh(new THREE.SphereGeometry(0.012, 5, 4), basic(null, 0xf0f0e0), 0, 0, dz, eyesG); CB.eyes = eyesG;
    // jarra de agua y llavero
    CB.jug = await prop('water'); s.add(CB.jug); CB.jug.visible = false;
    CB.keys = new THREE.Group(); {   // v4: llavero detallado: aro de acero, 4 llaves (cabeza con agujero, cuello, paleta con dientes, punta), latón/acero alternos, etiqueta roja CELL 4 y chapa de carton con cordel
      const mBr = lam(null, 0xc8a650), mSt = lam(null, 0xa8acb0), mHole = basic(null, 0x141210);
      L.mesh(new THREE.TorusGeometry(0.035, 0.0045, 5, 14), mSt, 0, 0, 0, CB.keys);
      for (let i = 0; i < 4; i++) { const k = new THREE.Group(), m = i % 2 ? mSt : mBr; k.rotation.z = -0.65 + i * 0.42; k.position.y = -0.035; CB.keys.add(k);
        const bow = L.mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.004, i % 2 ? 6 : 10), m, 0, -0.016, 0, k); bow.rotation.x = Math.PI / 2;
        const hole = L.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.0045, 6), mHole, 0, -0.008, 0, k); hole.rotation.x = Math.PI / 2;
        B(0.012, 0.006, 0.004, m, 0, -0.031, 0, k); B(0.006, 0.05, 0.003, m, 0, -0.058, 0, k);
        for (let t = 0; t < 4; t++) B(0.004, 0.005, 0.003, m, 0.004 + ((t + i) % 2) * 0.0015, -0.045 - t * 0.009, 0, k);
        const tip = L.mesh(new THREE.ConeGeometry(0.0035, 0.007, 4), m, 0, -0.086, 0, k); tip.rotation.z = Math.PI; }
      const tagT = L.cvs(24, 12, (c) => { c.fillStyle = '#b81c1c'; c.fillRect(0, 0, 24, 12); c.fillStyle = '#f0e8d8'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.fillText('CELL 4', 12, 8); });
      const tag = new THREE.Group(); tag.rotation.z = 0.95; tag.position.y = -0.035; CB.keys.add(tag); B(0.024, 0.012, 0.003, lam(tagT), 0, -0.035, 0, tag); B(0.0015, 0.024, 0.0015, lam(null, 0xd8d0c0), 0, -0.016, 0, tag);
      const card = new THREE.Group(); card.rotation.z = -1.05; card.position.y = -0.035; CB.keys.add(card); B(0.02, 0.03, 0.002, lam(null, 0xd8c8a0), 0, -0.042, 0, card); B(0.001, 0.026, 0.001, lam(null, 0x8a7a5a), 0, -0.014, 0, card); }
    CB.ava = mkAva(s); CB.keys.scale.setScalar(1.6); L.holdIn(CB.ava.ch, CB.keys, 'L', [0, 0.85, 0.1], [Math.PI / 2, 0, 0]); CB.keys.visible = false;
    CB.dog = await loadDog(L); s.add(CB.dog.root); CB.dog.root.visible = false;
    CB.avaKey = new THREE.PointLight(0xffe0b8, 0, 4, 1.3); CB.avaKey.position.set(0.9, 1.9, -6.2); s.add(CB.avaKey);
    CB.reset = () => { unFace(CB.keys); CB.dutch.root.position.set(2.7, 0, -6.6); CB.dutch.root.rotation.y = -Math.PI / 2; CB.avaKey.intensity = 0; CB.keys.visible = false; CB.jug.visible = false; CB.dog.root.visible = false; CB.eyes.visible = false; CB.lamp.intensity = 4; }; }

  // =====================================================================================================================
  // EVIDENCIA: jaula de malla con estantes, 8 latas de porotos con etiqueta de evidencia, caja de barras de granola
  // =====================================================================================================================
  const EV = { scene: new THREE.Scene() }; { const s = EV.scene; s.background = new THREE.Color(0x0c0e12); lights(s, { amb: 0.6, hemi: 0.45 });
    floorPlane(s, 6, 6, tConcrete(341), 3, 3); wallBox(s, 6, 3, 0.2, tBlock(342, '#4a5260', '#7a8086', 30), 3, 1.5, 0, 1.5, -2);
    const tMesh = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.strokeStyle = '#9aa0a4'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(16, 16); c.moveTo(16, 0); c.lineTo(0, 16); c.stroke(); });
    const mMesh = lam(L.rep(tMesh, 16, 12), 0xffffff, { transparent: true, alphaTest: 0.3, side: DS });
    L.plane(3, 2.4, mMesh, 0, 1.2, 0.2, s); B(0.05, 2.4, 0.05, lam(null, 0x6a6e70), -1.5, 1.2, 0.2, s); B(0.05, 2.4, 0.05, lam(null, 0x6a6e70), 1.5, 1.2, 0.2, s);
    const tBean = L.cvs(32, 16, (c) => { px(c, 0, 0, '#c8a040', 32, 16); px(c, 0, 4, '#7a2a1a', 32, 7); c.fillStyle = '#f0e0b0'; c.font = 'bold 5px monospace'; c.fillText('BEANS', 8, 9); px(c, 0, 0, '#d8d8d0', 32, 1); px(c, 0, 15, '#d8d8d0', 32, 1); });
    const tTag = L.cvs(16, 8, (c) => { px(c, 0, 0, '#f0e8a0', 16, 8); c.fillStyle = '#c02020'; c.font = 'bold 4px monospace'; c.fillText('EVID', 1, 5); px(c, 12, 2, '#5a4a10', 2, 2); });
    for (let k = 0; k < 3; k++) B(2.6, 0.04, 0.5, lam(null, 0x6a6e70), 0, 0.5 + k * 0.6, -1.5, s);
    EV.cans = []; for (let i = 0; i < 8; i++) { const g = new THREE.Group(); g.position.set(-0.8 + (i % 4) * 0.2, 0.56 + Math.floor(i / 4) * 0.6, -1.45); s.add(g);
      L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), lam(tBean), 0, 0.06, 0, g); const tg = L.plane(0.05, 0.025, lam(tTag), 0.04, 0.03, 0.055, g); tg.rotation.z = -0.4; EV.cans.push(g); }
    const tGran = L.cvs(32, 16, (c) => { px(c, 0, 0, '#3a7a3a', 32, 16); c.fillStyle = '#f0f0d0'; c.font = 'bold 5px monospace'; c.fillText('GRANOLA', 4, 9); px(c, 0, 13, '#d8b040', 32, 3); });
    B(0.36, 0.16, 0.22, [lam(null, 0x3a7a3a), lam(null, 0x3a7a3a), lam(null, 0x2a5a2a), lam(null, 0x2a5a2a), lam(tGran), lam(tGran)], 0.6, 1.8, -1.45, s);
    fluor(s, 0, 2.95, 0.5, 0.3, 1.2); const l = new THREE.PointLight(0xf4f8ff, 5, 7, 1.3); l.position.set(0, 2.5, 1); s.add(l);
    EV.ava = mkAva(s); }

  // =====================================================================================================================
  // ARCHIVO: archivadores grises; uno corrido deja ver una puertita de HIERRO con un trebol tallado (cerradura con la llave)
  // =====================================================================================================================
  const RC = { scene: new THREE.Scene() }; { const s = RC.scene; s.background = new THREE.Color(0x0c0e12); lights(s, { amb: 0.38, hemi: 0.3 });
    floorPlane(s, 7, 6, tTile(351, '#7a7468', '#5a554c'), 7, 6); const tW = tBlock(352, '#6a6050', '#9a9282', 30); wallBox(s, 7, 3, 0.2, tW, 4, 1.5, 0, 1.5, -2.2);
    const tCab = L.cvs(16, 32, (c) => { px(c, 0, 0, '#7a7e80', 16, 32); for (let y = 0; y < 32; y += 8) { px(c, 0, y, '#4a4e50', 16, 1); px(c, 5, y + 3, '#c8ccd0', 6, 2); px(c, 6, y + 5, '#e8e4c8', 4, 2); } });
    for (let i = 0; i < 4; i++) B(0.6, 1.4, 0.55, lam(tCab), -2.2 + i * 0.62, 0.7, -1.85, s);
    RC.cab = B(0.6, 1.4, 0.55, lam(tCab), 1.0, 0.7, -1.85, s);
    const tIron = L.cvs(32, 32, (c) => { const r = L.rng(353); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 20; px(c, x, y, K.rgb(58 + n, 50 + n * 0.8, 44 + n * 0.6)); } for (let k = 0; k < 14; k++) px(c, r() * 32 | 0, r() * 32 | 0, '#7a3a1a', 2, 1);
      c.strokeStyle = '#1a1612'; c.lineWidth = 1.4; for (const [dx, dy] of [[0, -4], [4, 0], [0, 4], [-4, 0]]) { c.beginPath(); c.arc(16 + dx, 14 + dy, 3.6, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(16, 18); c.lineTo(17, 24); c.stroke();
      for (const [x, y] of [[3, 3], [28, 3], [3, 28], [28, 28]]) { px(c, x - 1, y - 1, '#2a2420', 3, 3); px(c, x, y, '#9a8a7a', 1, 1); } });
    RC.door = B(0.7, 0.9, 0.06, lam(tIron), 1.6, 0.47, -2.06, s);
    { const mR = lam(null, 0x6a5a48); for (const [dx, dy] of [[0, 0.075], [0.075, 0], [0, -0.075], [-0.075, 0]]) { const lf = L.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 12), mR, 1.6 + dx, 0.56 + dy, -2.02, s); lf.rotation.x = Math.PI / 2; const in2 = L.mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.028, 12), lam(null, 0x2a2018), 1.6 + dx, 0.56 + dy, -2.019, s); in2.rotation.x = Math.PI / 2; }
      B(0.025, 0.14, 0.025, mR, 1.61, 0.44, -2.02, s); const kp = L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), lam(null, 0xc8a040), 1.6, 0.56, -2.0, s); kp.rotation.x = Math.PI / 2; }   // trebol tallado en relieve B(0.82, 0.06, 0.08, lam(null, 0x2a2420), 1.6, 0.95, -2.06, s);
    RC.keyhole = L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), basic(null, 0x0a0806), 1.6, 0.56, -1.982, s); RC.keyhole.rotation.x = Math.PI / 2;
    shell(s, { x0: -3.5, x1: 3.5, z0: -2.3, z1: 3, h: 3, tex: tW, walls: ['e', 'w', 's'], door: { side: 'e', at: 0.6, w: 1.0, h: 2.2 }, lamps: [['e', -1.0, 2.3], ['s', -1.5, 2.3]], fog: [0x030405, 4, 13] });
    fluor(s, 0, 2.95, 0, 0.3, 1.2); const l = new THREE.PointLight(0xf4f8ff, 4, 7, 1.3); l.position.set(0, 2.5, 0.5); s.add(l);
    RC.cold = new THREE.PointLight(0x8ab0ff, 0, 3, 1.5); RC.cold.position.set(1.6, 0.5, -1.7); s.add(RC.cold);
    RC.ava = mkAva(s); }

  // =====================================================================================================================
  // SOTANO 1920: piedra, celdas con barrotes oxidados, mesa con farol + cuaderno, maquina de escribir vieja, escalera
  // =====================================================================================================================
  const tStone = (seed, base = [92, 86, 76]) => L.cvs(64, 64, (c) => { const r = L.rng(seed); px(c, 0, 0, '#2a2620', 64, 64);
    for (let row = 0; row < 8; row++) for (let k = 0; k < 4; k++) { const x0 = k * 16 + (row & 1) * 8 - 8, y0 = row * 8, n = r() * 30 - 15; px(c, x0 + 1, y0 + 1, K.rgb(base[0] + n, base[1] + n, base[2] + n), 14, 6); px(c, x0 + 2, y0 + 1, K.rgb(base[0] + n + 18, base[1] + n + 16, base[2] + n + 12), 12, 1); }
    for (let k = 0; k < 40; k++) px(c, r() * 64 | 0, r() * 64 | 0, 'rgba(40,60,30,0.35)', 1 + (r() * 2 | 0), 1); });
  const OB = { scene: new THREE.Scene() }; { const s = OB.scene; s.background = new THREE.Color(0x060606); s.fog = new THREE.Fog(0x060606, 6, 16); lights(s, { amb: 0.35, hemi: 0.25, sky: 0x8a7a60 });
    const tS = tStone(361), tF = tStone(362, [70, 66, 58]); floorPlane(s, 10, 10, tF, 5, 5);
    wallBox(s, 10, 3.2, 0.3, tS, 5, 1.6, 0, 1.6, -4); wallBox(s, 0.3, 3.2, 10, tS, 5, 1.6, -4, 1.6, 1); wallBox(s, 0.3, 3.2, 10, tS, 5, 1.6, 4, 1.6, 1);
    for (let k = -4; k <= 4; k += 2) { const ar = L.mesh(new THREE.TorusGeometry(1.0, 0.18, 4, 8, Math.PI), lam(tS), k, 2.2, -1, s); ar.rotation.y = Math.PI / 2; void ar; }   // arcos de ladrillo del techo
    const mRust = lam(L.rep(L.cvs(8, 32, (c) => { const r = L.rng(363); for (let y = 0; y < 32; y++) px(c, 0, y, K.rgb(90 + r() * 40, 46 + r() * 20, 26), 8, 1); }), 1, 3));
    for (const zc of [-2.4, 0.4]) { for (let k = -6; k <= 6; k++) cyl(0.018, 0.018, 2.4, 5, mRust, -2.0, 1.2, zc + k * 0.14, s); B(0.06, 0.06, 1.9, mRust, -2.0, 2.4, zc, s); B(0.06, 0.06, 1.9, mRust, -2.0, 0.08, zc, s); }
    wallBox(s, 2.0, 2.6, 0.2, tS, 1, 1.3, -3, 1.3, -1.0);
    // mesa con farol y cuaderno
    const desk = new THREE.Group(); desk.position.set(1.8, 0, -3.1); s.add(desk); OB.desk = desk;
    { const mW = lam(L.rep(tWood(364, '#5a3a20'), 1, 1)); B(1.4, 0.06, 0.7, mW, 0, 0.78, 0, desk); for (const [x, z] of [[-0.62, -0.28], [0.62, -0.28], [-0.62, 0.28], [0.62, 0.28]]) B(0.06, 0.78, 0.06, mW, x, 0.39, z, desk);
      const tNb = L.cvs(32, 32, (c) => { px(c, 0, 0, '#e8dcb8', 32, 32); c.fillStyle = 'rgba(40,40,80,0.8)'; for (let y = 5; y < 30; y += 4) { c.fillRect(3, y, 10 + (y * 7) % 14, 1); c.fillRect(17, y, 8 + (y * 5) % 10, 1); } px(c, 15, 0, '#8a7a5a', 2, 32); });
      L.plane(0.32, 0.22, lam(tNb), 0.1, 0.815, 0.05, desk, 0, -Math.PI / 2).rotation.z = 0.2; }
    OB.lantern = await prop('lantern'); { const bb = new THREE.Box3().setFromObject(OB.lantern), k = 0.3 / (bb.max.y - bb.min.y); OB.lantern.scale.multiplyScalar(k); OB.lantern.position.set(1.4, 0.81 - bb.min.y * k, -3.2); s.add(OB.lantern); }
    OB.lamp = new THREE.PointLight(0xffb060, 9, 7, 1.3); OB.lamp.position.set(1.4, 1.2, -3.0); s.add(OB.lamp);
    // estante de piedra con la maquina de escribir vieja (negra, dorada) y un cajon con 1 cinta
    const tw = new THREE.Group(); tw.position.set(3.55, 0.92, -1.2); tw.rotation.y = -Math.PI / 2; s.add(tw); OB.tw = tw;
    { B(1.0, 0.08, 0.5, lam(tS), 0, -0.04, 0, tw); const mK = lam(null, 0x111112), mG = lam(null, 0xb89a40), mKey = lam(null, 0xe0d8c0);
      B(0.4, 0.09, 0.3, mK, 0, 0.045, 0, tw); B(0.42, 0.14, 0.12, mK, 0, 0.12, -0.1, tw); cyl(0.035, 0.035, 0.46, 10, mK, 0, 0.21, -0.12, tw).rotation.z = Math.PI / 2;
      for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) { cyl(0.011, 0.011, 0.006, 8, mKey, -0.13 + k * 0.032 + (r % 2) * 0.012, 0.1 + r * 0.014, 0.12 - r * 0.03, tw); }
      B(0.41, 0.01, 0.01, mG, 0, 0.09, 0.15, tw); L.plane(0.22, 0.28, lam(L.cvs(16, 16, (c) => { px(c, 0, 0, '#ece4cc', 16, 16); })), 0, 0.36, -0.13, tw, 0, -0.2); }
    // escalera de piedra (esquina derecha, baja de z 3 a 1)
    for (let i = 0; i < 9; i++) B(1.2, 0.22, 0.32, lam(tF), 3.2, 2.9 - i * 0.32 - 0.11 + 0.11, 3.6 - i * 0.3, s);
    OB.ava = mkAva(s); OB.dog = await loadDog(L); s.add(OB.dog.root); OB.dog.root.visible = false; }

  // =====================================================================================================================
  // TUNEL: boveda de piedra mojada (eje -z), canaleta de agua al centro, borde seco a la izquierda; MARLA al fondo
  // =====================================================================================================================
  const TU = { scene: new THREE.Scene() }; { const s = TU.scene; s.background = new THREE.Color(0x020203); s.fog = new THREE.Fog(0x020203, 3, 13); lights(s, { amb: 0.22, hemi: 0.18, sky: 0x506070 });
    const tS = tStone(371, [70, 72, 66]), len = 40;
    const vault = L.mesh(new THREE.CylinderGeometry(1.4, 1.4, len, 8, 20, true, Math.PI / 2, Math.PI), lam(L.rep(tS, 6, 30), 0xffffff, { side: THREE.BackSide }), 0, 0.6, -len / 2 + 2, s); vault.rotation.x = Math.PI / 2; vault.rotation.y = Math.PI / 2;
    wallBox(s, 0.2, 0.7, len, tS, 30, 1, -1.38, 0.35, -len / 2 + 2); wallBox(s, 0.2, 0.7, len, tS, 30, 1, 1.38, 0.35, -len / 2 + 2);
    floorPlane(s, 1.0, len, tStone(372, [60, 58, 52]), 1, 30, -0.85, -len / 2 + 2, 0.06);
    const tWet = L.cvs(16, 32, (c) => { const r = L.rng(373); for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) { const n = r() * 14; px(c, x, y, K.rgb(30 + n, 40 + n, 44 + n)); } for (let k = 0; k < 12; k++) px(c, r() * 16 | 0, r() * 32 | 0, '#8aa0b0', 2, 1); });
    floorPlane(s, 1.8, len, tWet, 2, 40, 0.45, -len / 2 + 2, 0.02);
    TU.drips = []; for (let k = 0; k < 6; k++) { const d = L.mesh(new THREE.SphereGeometry(0.012, 4, 3), basic(null, 0x9ab8c8), 0.2, 1.8, -2 - k * 5, s); TU.drips.push(d); }
    TU.marla = await makePerson(L, 'marla'); s.add(TU.marla.root); TU.marla.root.position.set(-1.12, 0.06, -13.6); TU.marla.root.rotation.y = 0.8;
    { const cr8 = new THREE.Group(), mW = lam(L.rep(tWood(374, '#6a4a2a'), 1, 1)), mD = lam(null, 0x3a2614); B(0.4, 0.38, 0.4, mW, 0, 0.19, 0, cr8); for (const y of [0.03, 0.35]) for (const [x, z, w, d] of [[0, 0.205, 0.42, 0.02], [0, -0.205, 0.42, 0.02], [0.205, 0, 0.02, 0.42], [-0.205, 0, 0.02, 0.42]]) B(w, 0.04, d, mD, x, y, z, cr8);
      B(0.02, 0.36, 0.02, mD, 0.12, 0.19, 0.21, cr8); cr8.position.set(-1.1, 0.06, -13.64); cr8.rotation.y = 0.8; s.add(cr8); }   // caja de madera donde esta sentada, espalda contra la pared
    TU.amb = new THREE.PointLight(0xffc890, 0.8, 6, 1.5); TU.amb.position.set(0, 1.4, -13); s.add(TU.amb);
    TU.ava = mkAva(s); TU.dog = await loadDog(L); s.add(TU.dog.root);
    TU.jug = await prop('water'); s.add(TU.jug); TU.jug.visible = false; }

  // =====================================================================================================================
  // AZOTEA (dia): pretil, equipos de aire, respiraderos, escotilla; skyline, rio y puente; helicoptero original; tubo
  // =====================================================================================================================
  // v4 AZOTEA: ciudad con profundidad real. Suelo de calles a y=-12 con aceras y lineas, rio 3D hundido entre muros de piedra
  // (z -29..-47), puente colgante que lo CRUZA (x=10: tablero, dos torres, cables y tirantes), coches abandonados en las calles,
  // azoteas vecinas a varias distancias (pretiles con albardilla, escaleras de incendio, chimeneas, carteles, tanques), columnas de
  // humo de incendios lejanos, pajaros, y azotea propia con grava, respiraderos, charcos y claraboya. Bruma mas densa con la distancia.
  const BX0 = 10;
  async function roofWorld(s) {
    const GY = -12, mIron = lam(null, 0x2a2622), mCap = lam(null, 0x8a8478);
    const tAsph = L.cvs(32, 32, (c) => { const r = L.rng(601); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 14; px(c, x, y, K.rgb(70 + n, 70 + n, 72 + n)); } for (let k = 0; k < 8; k++) px(c, r() * 32 | 0, r() * 32 | 0, 'rgba(20,20,20,0.5)', 3, 1); });
    floorPlane(s, 420, 200, tAsph, 60, 30, 0, 71, GY, 0x9a9890);
    floorPlane(s, 420, 160, tAsph, 60, 24, 0, -127, GY, 0x9a9890);
    const mSide = lam(null, 0xa8a49a), mLine = basic(null, 0xd8d0a0, { polygonOffset: true, polygonOffsetFactor: -2 });
    for (const [x, z, w, d] of [[0, -26.5, 300, 1.2], [0, -14.0, 300, 1.2], [0, -49.5, 300, 1.2]]) B(w, 0.15, d, mSide, x, GY + 0.07, z, s);
    for (const xx of [-13.5, 13.5]) B(1.2, 0.15, 80, mSide, xx, GY + 0.07, 10, s);
    for (let x = -140; x < 140; x += 4) { L.plane(2, 0.18, mLine, x, GY + 0.01, -20.2, s, 0, -Math.PI / 2); L.plane(2, 0.18, mLine, x, GY + 0.01, -53, s, 0, -Math.PI / 2); }
    for (let z = -12; z < 50; z += 4) L.plane(0.18, 2, mLine, 0, GY + 0.01, z, s, 0, -Math.PI / 2);
    // rio hundido: agua con reflejos, muros de piedra con albardilla y barandilla
    const tWat = L.cvs(64, 32, (c) => { const r = L.rng(602); for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) { const n = r() * 10; px(c, x, y, K.rgb(44 + n, 78 + n, 92 + n)); } for (let k = 0; k < 60; k++) px(c, r() * 64 | 0, r() * 32 | 0, r() < 0.5 ? '#9ab8c0' : '#e8d8b0', 3 + (r() * 5 | 0), 1); });
    RF.water = floorPlane(s, 420, 18, tWat, 30, 2, 0, -38, GY - 2.2);
    const tQuay = tStone(603, [118, 110, 96]);
    for (const zz of [-29, -47]) { const o = zz < -40 ? -0.3 : 0.3; wallBox(s, 420, 2.6, 0.6, tQuay, 120, 1, 0, GY - 1.3, zz); B(420, 0.25, 0.9, mCap, 0, GY + 0.12, zz, s);
      for (let x = -120; x < 120; x += 3) B(0.12, 0.9, 0.12, mIron, x, GY + 0.6, zz + o, s);
      B(420, 0.08, 0.08, mIron, 0, GY + 1.05, zz + o, s); }
    // puente colgante que cruza el rio (x=10): tablero, rampas, torres, cables principales y tirantes
    { const BX = BX0, DY = GY + 3.2, mBr = lam(null, 0x9a958c), mTw = lam(L.rep(tStone(604, [140, 132, 118]), 1, 4)), mCab = lam(null, 0x3a3a3a);
      B(9, 0.8, 34, mBr, BX, DY, -38, s); B(9.2, 0.3, 34, mIron, BX, DY + 0.55, -38, s);
      for (const sx of [-4.4, 4.4]) for (let z = -54; z <= -22; z += 1.2) B(0.08, 0.9, 0.08, mIron, BX + sx, DY + 1.1, z, s);
      for (const zz of [-22, -54]) { const ramp = B(9, 0.8, 12.6, mBr, BX, GY + 1.6, zz + (zz > -38 ? 6 : -6), s); ramp.rotation.x = zz > -38 ? -0.26 : 0.26; }
      for (const tz of [-31, -45]) { for (const sx of [-4.2, 4.2]) B(1.0, 16, 1.2, mTw, BX + sx, GY + 8, tz, s); B(9.4, 1.0, 1.2, mTw, BX, GY + 15.2, tz, s); B(9.4, 0.7, 1.0, mTw, BX, GY + 10.5, tz, s);
        for (const sx of [-4.2, 4.2]) L.mesh(new THREE.ConeGeometry(0.7, 1.4, 4), mTw, BX + sx, GY + 16.7, tz, s); }
      const cab = (sx, z0, y0, z1, y1, sag) => { const n = 14; let pv = null; for (let i = 0; i <= n; i++) { const u = i / n, z = z0 + (z1 - z0) * u, y = y0 + (y1 - y0) * u - sag * 4 * u * (1 - u), v = V(BX + sx, y, z);
          if (pv) { const m = cyl(0.09, 0.09, pv.distanceTo(v), 4, mCab, 0, 0, 0, s); m.position.copy(pv).lerp(v, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), v.clone().sub(pv).normalize()); }
          if (i > 0 && i < n && y - DY > 1.4) { const h = y - DY - 0.4; cyl(0.03, 0.03, h, 3, mCab, BX + sx, DY + 0.4 + h / 2, z, s); } pv = v; } };
      for (const sx of [-4.2, 4.2]) { cab(sx, -31, GY + 15.6, -45, GY + 15.6, 9.0); cab(sx, -20, GY + 1.0, -31, GY + 15.6, -1.2); cab(sx, -45, GY + 15.6, -56, GY + 1.0, -1.2); } }
    // coches abandonados: patrullas Kenney + sedanes/furgonetas low poly de colores, algunos cruzados o volcados
    const car = await L.loadModel('models/police-kenney.glb');
    const sedan = (col, van) => { const g = new THREE.Group(), mb = lam(null, col), mg = lam(null, 0x2a3640), mw = lam(null, 0x141414);
      B(1.8, 0.7, van ? 4.6 : 4.2, mb, 0, 0.6, 0, g); B(1.6, van ? 1.0 : 0.6, van ? 3.4 : 2.0, mb, 0, van ? 1.45 : 1.25, van ? -0.4 : -0.2, g); B(1.62, van ? 0.5 : 0.45, van ? 0.1 : 1.6, mg, 0, van ? 1.55 : 1.25, van ? 1.3 : -0.2, g);
      for (const [x, z] of [[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]]) { const w = cyl(0.36, 0.36, 0.26, 8, mw, x, 0.36, z, g); w.rotation.z = Math.PI / 2; } return g; };
    const COLS = [0x8a2a22, 0xd8d4c8, 0x2a4a6a, 0x6a6a64, 0x3a5a3a, 0xc8a040, 0x1a1a1e, 0x9a9ea2];
    { const r = L.rng(605), spots = [];
      for (let k = 0; k < 22; k++) spots.push([-60 + k * 5.6 + (r() - 0.5) * 2, -20 + (r() - 0.5) * 3]);
      for (let k = 0; k < 10; k++) spots.push([(k % 2 ? 3 : -3) + (r() - 0.5), -10 + k * 5 + r() * 2]);
      for (let k = 0; k < 14; k++) spots.push([-50 + k * 7 + (r() - 0.5) * 2, -53 + (r() - 0.5) * 3]);
      for (let k = 0; k < 4; k++) spots.push([BX0 + (r() - 0.5) * 4, -31 - k * 4.5]);
      spots.forEach(([x, z], i) => { let m; if (i % 6 === 0) { const mm = L.ps1Clone(car.scene); const bb = new THREE.Box3().setFromObject(mm), k = 4.3 / (bb.max.z - bb.min.z); mm.scale.multiplyScalar(k); mm.position.y = -bb.min.y * k; m = new THREE.Group(); m.add(mm); }
        else m = sedan(COLS[(i * 5) % COLS.length], i % 7 === 3);
        const onBr = Math.abs(x - BX0) < 4.5 && z < -28 && z > -48; m.position.set(x, onBr ? GY + 3.6 : GY, z);
        m.rotation.y = onBr ? (r() - 0.5) * 0.8 : (i % 3 === 0 ? (r() - 0.5) * 2.4 : Math.PI / 2 + (r() - 0.5) * 0.5); if (i % 11 === 5 && !onBr) { m.rotation.z = Math.PI; m.position.y += 1.5; } s.add(m); }); }
    // azoteas vecinas a varias distancias
    const tGrav = L.cvs(32, 32, (c) => { const r = L.rng(606); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 26; px(c, x, y, K.rgb(100 + n, 96 + n, 88 + n)); } for (let k = 0; k < 90; k++) px(c, r() * 32 | 0, r() * 32 | 0, r() < 0.5 ? '#5a5650' : '#c8c0b0', 1, 1); });
    const fireEsc = (x, z, face, top, w = 2.6) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = face; s.add(g);
      for (let y = GY + 3.2, i = 0; y < top - 1; y += 3.2, i++) { B(w, 0.08, 1.0, mIron, 0, y, 0.5, g); B(w, 0.06, 0.04, mIron, 0, y + 0.9, 1.0, g); for (const sx of [-w / 2, w / 2]) B(0.04, 0.9, 1.0, mIron, sx, y + 0.45, 0.5, g);
        const st = B(3.6, 0.06, 0.7, mIron, 0, y + 1.6, 0.5, g); st.rotation.z = (i % 2 ? 1 : -1) * 0.72; } };
    const sign = (txt, col, bg, x, y, z, ry, w = 6, h = 2.2) => { const t = L.cvs(64, 24, (c) => { c.fillStyle = bg; c.fillRect(0, 0, 64, 24); c.fillStyle = col; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 32, 13); c.strokeStyle = 'rgba(0,0,0,0.4)'; c.strokeRect(1, 1, 62, 22); });
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; s.add(g); L.plane(w, h, lam(t, 0xffffff, { side: DS }), 0, h / 2 + 1.2, 0, g); for (const sx of [-w * 0.35, w * 0.35]) B(0.15, 1.3 + h, 0.15, mIron, sx, (1.3 + h) / 2, -0.05, g); B(w, 0.08, 0.6, mIron, 0, 1.2, 0.2, g); return g; };
    const NB = [[-17, -15, 10, 10, -2.5, '#9a5a44'], [17, -13, 9, 11, -4.5, '#b8ac98'], [-19, 7, 10, 12, 1.2, '#8a8e92'], [19, 9, 10, 10, -6, '#6a4a3a'], [-28, -28, 12, 10, -5.5, '#c8b890'], [27, -26, 10, 10, -1.5, '#a8b0b8'], [0, 19, 14, 9, -3, '#9a6a4a'], [-36, -6, 10, 14, -0.5, '#7a6a5a'], [36, -4, 12, 12, -7, '#b0a090']];
    NB.forEach(([x, z, w, d, top, colr], i) => { const fT = L.cvs(16, 32, (c) => { const r = L.rng(610 + i); c.fillStyle = colr; c.fillRect(0, 0, 16, 32); for (let y = 2; y < 30; y += 4) for (let xx = 2; xx < 15; xx += 4) { const q = r(); c.fillStyle = q < 0.15 ? '#ffd890' : q < 0.55 ? '#5a6a80' : '#20242c'; c.fillRect(xx, y, 2, 3); } c.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = 5; y < 32; y += 8) c.fillRect(0, y, 16, 1); });
      const h = top - GY, fm = lam(L.rep(fT, Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 3.2))));
      B(w, h, d, [fm, fm, lam(L.rep(tGrav, 3, 3)), fm, fm, fm], x, GY + h / 2, z, s);
      for (const [pw, pd, ox, oz] of [[w, 0.3, 0, d / 2], [w, 0.3, 0, -d / 2], [0.3, d, w / 2, 0], [0.3, d, -w / 2, 0]]) { B(pw, 0.8, pd, fm, x + ox, top + 0.4, z + oz, s); B(pw + 0.1, 0.12, pd + 0.1, mCap, x + ox, top + 0.86, z + oz, s); }
      B(w + 0.4, 0.3, d + 0.4, lam(null, 0x3a3634), x, GY + 3.0, z, s);
      if (i % 3 !== 2) { const cx = x + (i % 2 ? 1 : -1) * w * 0.3, cz = z - d * 0.25; B(0.8, 2.2, 0.8, lam(L.rep(tBlock(620 + i, '#7a3a2a', '#9a5a44', 8), 1, 2)), cx, top + 1.1, cz, s); B(1.0, 0.15, 1.0, mCap, cx, top + 2.25, cz, s); }
      if (i % 2 === 0) { const tk = new THREE.Group(); tk.position.set(x - w * 0.2, top, z + d * 0.2); s.add(tk); for (const [dx, dz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) B(0.12, 1.8, 0.12, mIron, dx, 0.9, dz, tk); cyl(1.0, 1.0, 2.0, 10, lam(null, 0x7a5a3a), 0, 2.8, 0, tk); L.mesh(new THREE.ConeGeometry(1.1, 0.6, 10), lam(null, 0x4a3a2a), 0, 4.1, 0, tk); }
      if (i % 3 === 1) { B(1.6, 1.0, 1.2, lam(null, 0x9a9ea2), x + w * 0.2, top + 0.5, z - d * 0.1, s); for (let k = 0; k < 4; k++) B(1.62, 0.05, 0.02, lam(null, 0x4a4e52), x + w * 0.2, top + 0.2 + k * 0.2, z - d * 0.1 + 0.61, s); }
      const sideX = Math.abs(x) > Math.abs(z), fx = sideX ? (x > 0 ? -w / 2 : w / 2) : 0, fz = sideX ? 0 : (z > 0 ? -d / 2 : d / 2), face = sideX ? (x > 0 ? -Math.PI / 2 : Math.PI / 2) : (z > 0 ? Math.PI : 0);
      fireEsc(x + fx, z + fz, face, top);
    });
    sign('HOTEL', '#ffe8a0', '#7a1a1a', 17, -3.6, -13, 0.3); sign('PHARMACY', '#e8fff0', '#1a6a3a', -28, -4.6, -28, 0.5, 7, 2);
    sign('FRESH MILK', '#2a2a2a', '#f0e8d0', 27, -0.6, -26, -0.4, 8, 2.6); sign('LAST CHANCE', '#ffd040', '#2a2a5a', -17, -1.6, -15, 0.2, 6, 2);
    // columnas de humo de incendios lejanos (sprites apilados que suben y derivan) + resplandor en la base
    const tSm = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 2, 16, 16, 16); g.addColorStop(0, 'rgba(60,56,54,0.85)'); g.addColorStop(0.6, 'rgba(70,66,64,0.4)'); g.addColorStop(1, 'rgba(70,66,64,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
    RF.smoke = [];
    for (const [x, z, n] of [[-70, -95, 16], [52, -130, 18], [-125, -30, 14], [95, -70, 14], [-30, -160, 12]]) {
      for (let k = 0; k < n; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tSm, transparent: true, depthWrite: false, fog: false, color: k < 2 ? 0x3a3430 : 0x8a8480, opacity: 0.75 - k * 0.03 })); sp.userData = { x, z, k, n }; s.add(sp); RF.smoke.push(sp); }
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: tGlow, color: 0xff8030, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); gl.position.set(x, GY + 2, z); gl.scale.setScalar(9); s.add(gl); }
    // pajaros: siluetas en V que planean en circulo
    RF.birds = []; { const mBi = basic(null, 0x1a1a1e, { side: DS }); for (let k = 0; k < 9; k++) { const b = new THREE.Group(); for (const sx of [-1, 1]) { const wg = L.plane(0.5, 0.12, mBi, sx * 0.24, 0, 0, b); wg.rotation.z = sx * 0.35; } b.userData = { k }; s.add(b); RF.birds.push(b); } }
    // azotea propia: grava, juntas de alquitran, charcos, respiraderos, claraboya, antena parabolica, albardilla en el pretil
    floorPlane(s, 16, 12, tGrav, 10, 8, 0, 0, 0.004);
    { const tSt = L.cvs(128, 96, (c) => { const r = L.rng(631); c.clearRect(0, 0, 128, 96);   // manchas de agua, parches de alquitran y membrana remendada (escala grande: el suelo no se lee gris liso)
        for (let k = 0; k < 26; k++) { c.fillStyle = `rgba(${30 + r() * 30 | 0},${28 + r() * 26 | 0},${24 + r() * 20 | 0},${0.18 + r() * 0.3})`; c.beginPath(); c.ellipse(r() * 128, r() * 96, 3 + r() * 14, 2 + r() * 9, r() * 3, 0, 7); c.fill(); }
        for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(20,18,16,${0.45 + r() * 0.3})`; c.fillRect(r() * 120 | 0, r() * 90 | 0, 6 + r() * 16 | 0, 4 + r() * 10 | 0); }
        for (let k = 0; k < 14; k++) { c.fillStyle = `rgba(${150 + r() * 40 | 0},${140 + r() * 30 | 0},${120 + r() * 20 | 0},0.35)`; c.fillRect(r() * 124 | 0, r() * 92 | 0, 2 + r() * 5 | 0, 1 + r() * 3 | 0); }
        c.strokeStyle = 'rgba(15,14,12,0.55)'; c.lineWidth = 1; for (let y = 8; y < 96; y += 16) { c.beginPath(); c.moveTo(0, y + r() * 2); c.lineTo(128, y + r() * 2); c.stroke(); } });
      const o = L.plane(16, 12, basic(tSt, 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 0.006, 0, s, 0, -Math.PI / 2); o.renderOrder = 2;
      const mDb = lam(null, 0x7a3a2a), mLf = lam(null, 0x6a5a2a), r = L.rng(632);   // escombros: trozos de ladrillo, hojas secas, latas, rejilla de desague
      for (let k = 0; k < 40; k++) { const x = (r() - 0.5) * 15, z = (r() - 0.5) * 11; if (r() < 0.45) { const b = B(0.12 + r() * 0.1, 0.05, 0.07, mDb, x, 0.03, z, s); b.rotation.y = r() * 3; } else { const lf = L.plane(0.09, 0.06, lam(null, [0x6a5a2a, 0x8a6a30, 0x4a4a28][k % 3], { side: DS }), x, 0.012, z, s, r() * 3, -Math.PI / 2); void lf; } }
      for (const [x, z] of [[1.2, -5.5], [-4.8, -5.4], [6.6, 5.4]]) { B(0.4, 0.03, 0.4, lam(null, 0x1a1a1a), x, 0.016, z, s); for (let k = -1; k <= 1; k++) B(0.36, 0.035, 0.03, lam(null, 0x5a5a58), x, 0.02, z + k * 0.1, s); }
      for (const [x, z] of [[3.1, -3.9], [-1.0, -2.6]]) { const cn = cyl(0.033, 0.033, 0.12, 8, lam(null, 0xa83030), x, 0.035, z, s); cn.rotation.z = Math.PI / 2; } void mLf; }
    for (let x = -6; x <= 6; x += 3) L.plane(0.08, 12, basic(null, 0x2a2826, { polygonOffset: true, polygonOffsetFactor: -2 }), x, 0.008, 0, s, 0, -Math.PI / 2);
    for (const [x, z, w, d] of [[-2.5, 1.8, 1.6, 0.9], [3.8, -1.0, 1.1, 0.7], [0.6, 4.2, 1.4, 0.6]]) { const pd = L.mesh(new THREE.CircleGeometry(0.5, 10), basic(null, 0x8aa0b4, { transparent: true, opacity: 0.75, polygonOffset: true, polygonOffsetFactor: -3 }), x, 0.012, z, s); pd.rotation.x = -Math.PI / 2; pd.scale.set(w, d, 1); }
    for (const [x, z] of [[-3, 4.5], [1.5, 1.0], [-6.5, 1.5]]) { cyl(0.18, 0.18, 0.5, 8, lam(null, 0x9a9ea2), x, 0.25, z, s); L.mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), lam(null, 0x8a8e90), x, 0.5, z, s); }
    { B(1.8, 0.35, 1.2, lam(null, 0x5a5e60), -3.2, 0.18, -0.5, s); B(1.6, 0.04, 1.0, basic(null, 0x9ab8c8, { transparent: true, opacity: 0.7 }), -3.2, 0.37, -0.5, s); for (let k = -1; k <= 1; k++) B(0.04, 0.06, 1.0, lam(null, 0x3a3e40), -3.2 + k * 0.5, 0.39, -0.5, s); }
    { const d = L.mesh(new THREE.SphereGeometry(0.5, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), lam(null, 0xd8d8d0, { side: DS }), 6.8, 1.2, 2.6, s); d.rotation.x = -1.0; cyl(0.04, 0.04, 1.0, 4, mIron, 6.8, 0.5, 2.6, s); }
    for (const [w, x, z, rot] of [[16.3, 0, -6, 0], [16.3, 0, 6, 0], [12.3, -8, 0, 1], [12.3, 8, 0, 1]]) B(rot ? 0.45 : w, 0.1, rot ? w : 0.45, mCap, x, 0.95, z, s);
  }
  const RF = { scene: new THREE.Scene() }; { const s = RF.scene; const tSky = L.cvs(16, 64, (c) => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#6a8ac0'); g.addColorStop(0.6, '#d8c8b0'); g.addColorStop(1, '#f0c890'); c.fillStyle = g; c.fillRect(0, 0, 16, 64); });
    s.background = new THREE.Color(0xb8c8d8); s.fog = new THREE.Fog(0xb8c8d8, 30, 160); s.add(new THREE.AmbientLight(0xffffff, 0.9)); const sun = new THREE.DirectionalLight(0xffd8a0, 1.7); sun.position.set(-12, 9, 10); s.add(sun);   // sol de tarde, calido y bajo
    L.mesh(new THREE.SphereGeometry(180, 16, 8), basic(L.rep(tSky, 1, 1), 0xffffff, { side: THREE.BackSide, fog: false }), 0, 0, 0, s);
    const tRoof = L.cvs(32, 32, (c) => { const r = L.rng(381); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 16; px(c, x, y, K.rgb(96 + n, 94 + n, 90 + n)); } for (let k = 0; k < 6; k++) px(c, r() * 32 | 0, 0, 'rgba(40,40,40,0.4)', 1, 32); });
    floorPlane(s, 16, 12, tRoof, 8, 6, 0, 0, 0); const tPar = tBlock(382, '#8a7a68', '#a89a88', 20);
    for (const [w, x, z, ry] of [[16, 0, -6, 0], [16, 0, 6, 0], [12, -8, 0, 1], [12, 8, 0, 1]]) { const m = wallBox(s, w, 0.9, 0.3, tPar, w / 2, 0.5, x, 0.45, z); m.rotation.y = ry * Math.PI / 2; }
    for (const [x, z] of [[-4, -3], [-1.5, -3.5]]) { B(1.4, 1.1, 1.0, lam(L.rep(tMetal(383, '#a8acb0'), 1, 1)), x, 0.55, z, s); cyl(0.4, 0.4, 0.06, 10, lam(null, 0x2a2a2e), x, 1.13, z, s); }
    for (const [x, z] of [[3, 2], [5, -2], [-5, 3]]) { cyl(0.12, 0.12, 0.6, 8, lam(null, 0x8a8e90), x, 0.3, z, s); L.mesh(new THREE.ConeGeometry(0.2, 0.15, 8), lam(null, 0x6a6e70), x, 0.66, z, s); }
    B(1.0, 0.4, 1.0, lam(null, 0x5a5e60), 5.5, 0.2, 3.5, s);   // escotilla
    { const tk = new THREE.Group(); tk.position.set(-6, 0, -4.2); s.add(tk); for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) B(0.1, 1.8, 0.1, lam(null, 0x3a2a1a), dx, 0.9, dz, tk); cyl(0.9, 0.9, 1.8, 10, lam(null, 0x7a5a3a), 0, 2.7, 0, tk); L.mesh(new THREE.ConeGeometry(1.0, 0.6, 10), lam(null, 0x4a3a2a), 0, 3.9, 0, tk); }
    { cyl(0.06, 0.1, 6, 6, lam(null, 0x8a8e90), 6.5, 3, -4.8, s); for (let k = 0; k < 3; k++) B(1.2 - k * 0.3, 0.05, 0.05, lam(null, 0x8a8e90), 6.5, 4 + k * 0.8, -4.8, s); L.mesh(new THREE.SphereGeometry(0.1, 6, 4), basic(null, 0xff3020), 6.5, 6.05, -4.8, s); }   // antena de radio de la comisaria
    // v2: skyline con profundidad: tres capas de edificios (cerca/medio/lejos) de alturas y colores variados (ladrillo, piedra,
    // hormigon, vidrio), ventanas con luz calida de tarde, techos con equipos, tanques de agua de madera y antenas; bruma calida.
    const facade = (seed, base, win) => L.cvs(16, 32, (c) => { const r = L.rng(seed); c.fillStyle = base; c.fillRect(0, 0, 16, 32); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, 0, 1, 32);
      for (let y = 2; y < 30; y += 4) for (let x = 2; x < 15; x += 4) { const lit = r(); c.fillStyle = lit < 0.12 ? '#ffd890' : lit < 0.5 ? win : '#2a3040'; c.fillRect(x, y, 2, 2); } });
    const PAL = [['#9a5a44', '#7a8aa0'], ['#b8ac98', '#6a7a90'], ['#8a8e92', '#5a6a80'], ['#c8b890', '#7a8898'], ['#6a4a3a', '#8a9ab0'], ['#a8b0b8', '#4a6a90']];
    const city = new THREE.Group(); s.add(city);
    { const r = L.rng(385); for (const [n, dmin, dspan, hmin, hspan] of [[22, 38, 20, 8, 22], [26, 62, 30, 12, 40], [30, 100, 50, 18, 60]]) for (let k = 0; k < n; k++) {
        const a = -1.05 + (k / n) * 2.1 + (r() - 0.5) * 0.05; if (dmin < 70 && Math.abs(a - 0.1) < 0.35) continue;   // hueco: rio y puente a la vista
        const _a = 0, d = dmin + r() * dspan, w = 6 + r() * 9, h = hmin + r() * hspan, pc = PAL[(r() * PAL.length) | 0];
        const m = lam(L.rep(facade(386 + k + n, pc[0], pc[1]), Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 4)))), x = Math.sin(a) * d, z = -Math.cos(a) * d;
        const bd = B(w, h, w * (0.7 + r() * 0.5), [m, m, lam(null, 0x5a5650), m, m, m], x, h / 2 - 12, z, city); bd.rotation.y = r() * 0.4 - 0.2;
        const top = h - 12;
        if (r() < 0.45) { const tank = new THREE.Group(); tank.position.set(x + (r() - 0.5) * w * 0.5, top, z); city.add(tank); for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) B(0.15, 2.2, 0.15, lam(null, 0x3a2a1a), dx, 1.1, dz, tank);
          cyl(1.2, 1.2, 2.4, 10, lam(null, 0x7a5a3a), 0, 3.4, 0, tank); L.mesh(new THREE.ConeGeometry(1.3, 0.8, 10), lam(null, 0x4a3a2a), 0, 5.0, 0, tank); }   // tanque de agua de madera
        if (r() < 0.4) { B(1.8, 1.2, 1.4, lam(null, 0x9a9ea2), x + (r() - 0.5) * w * 0.6, top + 0.6, z + (r() - 0.5) * w * 0.4, city); }   // equipo de aire
        if (r() < 0.3) { cyl(0.08, 0.12, 5 + r() * 6, 5, lam(null, 0x3a3a3e), x, top + 4, z, city); }   // antena
      } }
    s.fog = new THREE.Fog(0xe0ccb4, 30, 210); s.background = new THREE.Color(0xe0ccb4);
    await roofWorld(s);
    // helicoptero original low poly: cabina con vidrio, fuselaje, cola, rotor de 2 palas, patines
    const heli = new THREE.Group(); s.add(heli); RF.heli = heli; { const mBd = lam(null, 0x2a3a2a), mGl = basic(null, 0x8ab0c8, { transparent: true, opacity: 0.7 }), mK = lam(null, 0x111111);
      const bd = L.mesh(new THREE.SphereGeometry(1, 8, 6), mBd, 0, 0, 0, heli); bd.scale.set(1.1, 0.95, 2.0); const gl = L.mesh(new THREE.SphereGeometry(0.85, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mGl, 0, 0.1, 1.2, heli); gl.rotation.x = Math.PI / 2.2; gl.scale.set(1, 1, 0.7);
      const tail = cyl(0.25, 0.12, 4.2, 6, mBd, 0, 0.3, -3.6, heli); tail.rotation.x = Math.PI / 2; B(0.08, 1.1, 0.6, mBd, 0, 0.8, -5.6, heli);
      RF.rot = new THREE.Group(); RF.rot.position.set(0, 1.1, 0); heli.add(RF.rot); cyl(0.12, 0.12, 0.3, 6, mK, 0, -0.1, 0, RF.rot); B(8, 0.04, 0.3, mK, 0, 0.05, 0, RF.rot); B(0.3, 0.04, 8, mK, 0, 0.05, 0, RF.rot);
      RF.trot = new THREE.Group(); RF.trot.position.set(0.12, 0.8, -5.7); heli.add(RF.trot); B(0.03, 1.4, 0.12, mK, 0, 0, 0, RF.trot);
      for (const sx of [-0.7, 0.7]) { B(0.08, 0.08, 2.6, mK, sx, -1.1, 0.1, heli); B(0.05, 0.5, 0.05, mK, sx, -0.85, 0.6, heli); B(0.05, 0.5, 0.05, mK, sx, -0.85, -0.5, heli); }
      const tNum = L.cvs(32, 8, (c) => { px(c, 0, 0, '#2a3a2a', 32, 8); c.fillStyle = '#e8e8d8'; c.font = 'bold 6px monospace'; c.fillText('N-417', 4, 7); }); L.plane(1.2, 0.3, lam(tNum), 1.12, 0, -0.4, heli, Math.PI / 2); }
    RF.tube = new THREE.Group(); s.add(RF.tube); { const mT = lam(L.rep(tMetal(386, '#b8bcc0'), 1, 2)); cyl(0.05, 0.05, 0.42, 10, mT, 0, 0, 0, RF.tube).rotation.z = Math.PI / 2; for (const x of [-0.22, 0.22]) cyl(0.055, 0.055, 0.03, 10, lam(null, 0xd02020), x, 0, 0, RF.tube).rotation.z = Math.PI / 2; L.plane(0.12, 0.6, basic(null, 0xff6020, { side: DS }), 0.3, 0.2, 0, RF.tube); }
    RF.mirror = new THREE.Group(); { B(0.09, 0.12, 0.008, basic(null, 0xe8f0ff), 0, 0, 0, RF.mirror); B(0.1, 0.13, 0.006, lam(null, 0x222222), 0, 0, -0.006, RF.mirror); }
    RF.ava = mkAva(s); L.holdIn(RF.ava.ch, RF.mirror, 'R', [0, 0.85, 0.12], [0, 0, 0]); RF.mirror.visible = false;
    RF.note = L.plane(0.16, 0.11, L.basic(L.cvs(48, 32, (c) => { c.fillStyle = '#ece4cc'; c.fillRect(0, 0, 48, 32); c.fillStyle = '#1a1a1a'; c.font = 'bold 6px monospace'; ['BRIDGE.', 'DAY 3.', 'DAWN.', 'ONE SEAT.'].forEach((s2, i) => c.fillText(s2, 4, 8 + i * 7)); }), 0xffffff, { side: DS }), 0, 0, 0); L.holdIn(RF.ava.ch, RF.note, 'L', [0, 0.9, 0.12], [-1.2, 0, Math.PI]); RF.note.visible = false;
    RF.flare = L.plane(1.4, 1.4, basic(tGlow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0, 0, s); RF.flare.visible = false;
    RF.dog = await loadDog(L); s.add(RF.dog.root); }

  // =====================================================================================================================
  // PLANOS
  // =====================================================================================================================
  const tk0 = (id) => at(id, 0);
  // ---- gancho / lobby
  // 03_think_dontlook: ahora es un plano reutilizado (Ava junto al vidrio, Vickers golpeando) en sets/reuse.js
  thinkShot(LOB, { id: '10_think_80', x: 0.3, z: 1.5, yaw: Math.PI, faces: [[-99, 'scared', 'neutral']], ang: 'qL', lookAt: V(-1, 1.4, 4) });
  thinkShot(LOB, { id: '90_think_save', x: 0.3, z: 1.5, yaw: Math.PI * 1.05, faces: [[-99, 'sad', 'neutral']], ang: 'profile', lookAt: V(1, 1.2, 4), extra: () => { LOB.glassL.color.set(0xff9a60); } });
  thinkShot(LOB, { id: '93_fudge', x: 0.3, z: 1.5, yaw: Math.PI, clip: 'surprised', from: 0.4, faces: [[-99, 'shocked', 'surprised']], mouth: true, ang: 'front', camOff: [0.12, -0.12, 1.75], lookAt: V(0, 1.9, 4) });
  // ---- motor pool
  { const c = cam(46);
    out['12_motorpool'] = { scene: MP.scene, camera: c, update(lt, t) { const { ch, fl } = MP.ava; fl.unaim(); const u = L.clamp01(lt / 6);
        AVA(ch, -0.2 + 1.6 * u, 3.2 - 4.4 * u, Math.PI + 0.35); ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.75 })], [[-99, 'half', 'neutral']]); fl.show(); fl.aim(V(1.6, 0.5, -3.6), 1); fl.on(true, c, V(1.6, 0.5, -3.6), 0.8, true, 8);
        MP.gen.position.x = 1.6 + K.rattle(lt, [0, 0.05], 0.002, 9, 40); look(c, cr([[0, 6.5, 4.4, 5.5], [6, 6.2, 4.2, 5.0]], lt), V(0.6, 0.4, -2.2)); },
      overlay(lt, dt, a, o) { vignette(o, 0.35); const t = this.t0 + lt; label(o, 'DOOR CRACKED OPEN', 470, 70, '#ffd23f', L.toScreen(this.camera, 3, 0.4, -5.9), ease(at('g1', 'cracked') - 0.1, at('g1', 'cracked') + 0.1, t)); } };
  }
  thinkShot(MP, { id: '13_think_whoever', x: 0.8, z: -2.2, yaw: Math.PI + 0.5, faces: [[-99, 'half', 'frown']], ang: 'q', lookAt: V(3, 0.4, -5.9) });
  { const c = cam(34);
    out['15_switch'] = { scene: MP.scene, camera: c, update(lt, t) { const { ch, fl } = MP.ava; fl.unaim(); fl.hide(); AVA(ch, Number(L.QS.get('ax') ?? 1.55), Number(L.QS.get('az') ?? -2.88), Math.PI + Number(L.QS.get('ay') ?? 0.9)); ch.pose(lt, L.still('kneel', 0.8), [[-99, 'half', 'neutral']]);
        const tp = at('g6', 'pull'), u = ease(tp - 0.05, tp + 0.25, t); MP.sw.rotation.x = -0.9 * u; MP.fl1.intensity = t > tp + 0.1 ? 0.6 : 6;
        MP.gen.updateMatrixWorld(true); const sw = MP.sw.getWorldPosition(V()); fl.aim(sw.clone().add(V(0, -0.12, 0)), 1); ch.root.updateMatrixWorld(true); const hp_ = ch.hand('R').getWorldPosition(V()); if (window.LOGCAM) console.warn('hand', hp_.toArray().map((v) => v.toFixed(2)).join(','), 'sw', sw.toArray().map((v) => v.toFixed(2)).join(','));   // la mano en el interruptor; lo baja en "pull"
        look(c, cr([[0, 2.95, 1.0, -2.55], [4, 2.85, 0.95, -2.65]], lt), V(1.8, 0.5, -3.15)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); } };
  }
  thinkShot(MP, { id: '18_breath_gen', x: 1.85, z: -2.85, yaw: Math.PI + 0.2, faces: [[-99, 'blink', 'neutral']], ang: 'low', extra: () => { MP.fl1.intensity = 0.6; MP.sw.rotation.x = -0.9; } });
  // ---- radio room / bucket
  thinkShot(LOB, { id: '22_think_noise', x: 0.3, z: 1.5, yaw: Math.PI * 0.95, faces: [[-99, 'half', 'frown']], ang: 'qL', lookAt: V(-2, 1.2, 3) });
  { const c = cam(44);
    out['23_bucket'] = { scene: WC.scene, camera: c, update(lt, t) { const { ch, fl } = WC.ava; fl.unaim(); fl.hide(); AVA(ch, 0.9, 0.3, Math.PI); ch.pose(lt, L.still('kneel', 0.8), [[-99, 'half', 'neutral']]);
        look(c, cr([[0, 0.6, 1.3, -1.7], [5, 0.7, 1.25, -1.5]], lt), V(0.9, 0.55, 0.0)); },
      overlay(lt, dt, a, o) { vignette(o, 0.35); const t = this.t0 + lt; label(o, 'DRINKING WATER', 150, 70, '#4fd6ff', L.toScreen(this.camera, -0.2, 0.75, -2.4), ease(at('w2', 'drinking') - 0.1, at('w2', 'drinking') + 0.1, t)); } };
  }
  thinkShot(WC, { id: '26_think_bucket', x: 0.9, z: 0.2, yaw: Math.PI, clip: 'kneel', from: 0.8, faces: [[-99, 'half', 'neutral']], camOff: [0.2, 0.1, 1.6], lookAt: V(0.9, 0.3, -0.5) });
  // ---- celdas y Dutch
  const dutchTalk = talkOf(['b11', 'd3', 'd7']);
  const cellBase = (t, { keys = false, dog = false, flash = true, aimAt = V(2.4, 0.6, -6.6), ava = [0.2, -2.6, Math.PI * 0.85], dclip = 'Sitting_Idle_Loop', cup = true } = {}) => {
    CB.reset(); const { ch, fl } = CB.ava; fl.unaim(); CB.keys.visible = keys; AVA(ch, ...ava); return { ch, fl, dclip, cup };
  };
  const dutchPose = (t, clip, dz = -6.6, dx = 2.7, ry = -Math.PI / 2) => { CB.dutch.root.position.set(dx, 0, dz); CB.dutch.root.rotation.y = ry; CB.dutch.pose(t, /Sit/.test(clip) ? 'sit' : 'idle', { talk: dutchTalk(t) }); };
  thinkShot(CB, { id: '29_shake_girl', x: 0.0, z: 0.4, yaw: Math.PI, faces: [[-99, 'scared', 'neutral']], mouth: true, flash: true, ang: 'low',
    extra: (lt, t) => { CB.dog.root.visible = true; CB.dog.root.position.set(-0.35, 0, -0.1); CB.dog.root.rotation.y = Math.PI; CB.dog.update(lt, 'stare', { look: V(0, 0.5, -6) }); } });
  { const c = cam(46);
    out['30_cells_hall'] = { scene: CB.scene, camera: c, update(lt, t) { const { ch, fl } = cellBase(t); const u = L.clamp01(lt / 7); AVA(ch, 0, 1.2 - 3.0 * u, Math.PI);
        ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.55 })], [[-99, 'scared', 'neutral']]); CB.lamp.intensity = 0.6; fl.show();
        const tg = V(1.6, 0.9, -1 - 5 * u + Math.sin(lt * 1.3) * 0.8); fl.aim(tg, 1); fl.on(true, c, tg, 1, true, 12); dutchPose(t, 'Sitting_Idle_Loop');
        CB.dog.root.visible = true; CB.dog.root.position.set(-0.45, 0, ch.root.position.z - 0.6); CB.dog.root.rotation.y = Math.PI; CB.dog.update(lt, 'walk', {});
        look(c, cr([[0, -0.9, 2.6, -9.6], [7, -0.9, 2.5, -9.4]], lt), V(0.3, 0.8, -1)); },
      overlay(lt, dt, a, o) { vignette(o, 0.5); const t = this.t0 + lt; for (const [w, tk, x] of [['RECORDS', 'b5', 120], ['SUPPLY', 'b6', 320], ['CELL BLOCK', 'b7', 520]]) { const tt = at(tk, 0), k = ease(tt - 0.05, tt + 0.1, t); if (k > 0) label(o, w + (tk === 'b7' ? '' : ': EMPTY'), x, 100, tk === 'b7' ? '#ff7b2e' : '#9aa0b0', null, k); } } };
  }
  { const c = cam(36);
    out['31_eyes'] = { scene: CB.scene, camera: c, update(lt, t) { const { ch, fl } = cellBase(t); AVA(ch, 0.1, -4.6, Math.PI * 0.8); ch.pose(lt, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]);
        CB.lamp.intensity = 0.3; fl.show(); const tg = V(2.6, 1.0, -6.6); fl.aim(tg, 1); fl.on(true, c, tg, 1, true, 14); dutchPose(t, 'Sitting_Idle_Loop');
        look(c, cr([[0, -0.6, 1.25, -6.5], [4, -0.3, 1.2, -6.5]], lt), V(2.6, 0.75, -6.6)); },
      overlay(lt, dt, a, o) { vignette(o, 0.55); const t = this.t0 + lt; label(o, 'CELL 4', 470, 100, '#ff7b2e', L.toScreen(this.camera, 1.17, 2.25, -5.6), ease(at('b8', 'four') - 0.1, at('b8', 'four') + 0.1, t)); } };
  }
  thinkShot(CB, { id: '32_breath_eyes', x: 0.1, z: -4.6, yaw: Math.PI * 0.8, faces: [[-99, 'shocked', 'gasp']], ang: 'front', flash: true, lookAt: V(2.6, 0.8, -6.6), extra: (lt, t) => { CB.lamp.intensity = 0.3; dutchPose(t, 'Sitting_Idle_Loop'); } });
  { const c = cam(40);
    out['33_dutch'] = { scene: CB.scene, camera: c, update(lt, t) { const { ch, fl } = cellBase(t); AVA(ch, 0.2, -5.0, Math.PI * 0.75); ch.pose(lt, L.still('idle', 0.3), [[-99, 'scared', 'neutral']]); fl.show(); const tg = V(2.6, 0.7, -6.6); fl.aim(tg, 1); fl.on(true, c, tg, 0.8, false, 10);
        dutchPose(t, 'Sitting_Idle_Loop'); CB.cup.position.set(2.15, 0, -6.6); look(c, cr([[0, 0.55, 1.15, -5.15], [5, 0.65, 1.1, -5.3]], lt), V(2.5, 0.75, -6.55)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); const t = this.t0 + lt; label(o, 'EMPTY CUP', 170, 250, '#4fd6ff', L.toScreen(this.camera, 2.15, 0.09, -6.6), ease(at('b10', 'cup') - 0.1, at('b10', 'cup') + 0.1, t)); } };
  }
  const dutchClose = (id, { clip = 'Sitting_Idle_Loop', sit = true, push = false, ov } = {}) => { const c = cam(30);
    out[id] = { scene: CB.scene, camera: c, update(lt, t) { const { ch } = cellBase(t); AVA(ch, 0.1, -5.0, Math.PI * 0.75); ch.pose(lt, L.still('idle', 0.3), [[-99, 'half', 'neutral']]); CB.lamp.intensity = 3;
        const dx = sit ? 2.6 : 1.45, ry = sit ? -Math.PI / 2 : -Math.PI / 2; dutchPose(t, clip, -6.55, dx, ry); CB.dutch.root.updateMatrixWorld(true);
        const hp = CB.dutch.head.getWorldPosition(V()).add(V(0, 0.1, 0)), u = push ? L.clamp01(lt / 5) : 0;
        look(c, hp.clone().add(V(-0.95 + 0.3 * u, 0.0, 0.3)), hp.clone()); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); if (ov) ov(lt, o, c, this.t0 + lt); } }; };
  dutchClose('34_dutch_long', { clip: 'Sitting_Idle_Loop' });
  dutchClose('36_dutch_talk', { clip: 'Idle_Loop', sit: false });
  dutchClose('40_clover_hint', { clip: 'Idle_Loop', sit: false, push: true });
  dutchClose('97_dutch_calls', { clip: 'Idle_Loop', sit: false, push: true });
  { const c = cam(38);
    out['35_keys'] = { scene: CB.scene, camera: c, update(lt, t) { const { ch } = cellBase(t, { keys: true }); AVA(ch, 0.25, -6.4, Math.PI / 2); ch.pose(lt, L.still('hold_up_object', 0.8), [[-99, 'half', 'neutral']]);
        CB.keys.visible = true; dutchPose(t, 'Idle_Loop', -6.55, 1.55, -Math.PI / 2); CB.dutch.root.updateMatrixWorld(true);
        const hp = CB.dutch.head.getWorldPosition(V()); look(c, hp.clone().add(V(0.45, 0.12, 0.35)), V(0.3, 1.2, -6.4)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); } };
  }
  thinkShot(CB, { id: '37_think_lying', x: 0.25, z: -6.4, yaw: Math.PI / 2, faces: [[-99, 'half', 'frown']], ang: 'profile', lookAt: V(1.5, 1.5, -6.55), extra: (lt, t) => { CB.keys.visible = true; dutchPose(t, 'Idle_Loop', -6.55, 1.55); } });
  { const c = cam(40);
    out['38_pour'] = { scene: CB.scene, camera: c, update(lt, t) { const { ch } = cellBase(t); AVA(ch, 0.75, -6.5, Math.PI / 2); ch.pose(lt, [L.seg('pour', 0, { speed: 0.6 })], [[-99, 'half', 'neutral']]);
        dutchPose(t, 'Idle_Loop', -6.55, 1.5); look(c, cr([[0, 0.6, 1.5, -4.9], [5, 0.7, 1.45, -5.1]], lt), V(1.15, 1.0, -6.5)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); } };
  }
  { const c = cam(36);
    out['94_keys_cells'] = { scene: CB.scene, camera: c, update(lt, t) { const { ch } = cellBase(t, { keys: true }); AVA(ch, 0.2, -5.6, Math.PI * 0.62); ch.pose(lt, L.still('hold_up_object', 0.8), [[-99, 'scared', 'neutral']]); CB.keys.visible = true;
        CB.lamp.intensity = 7; dutchPose(t, 'Idle_Loop', -6.55, 1.5); look(c, cr([[0, -0.8, 1.6, -3.6], [5, -0.7, 1.55, -3.9]], lt), V(0.9, 1.2, -6.2)); },
      overlay(lt, dt, a, o) { vignette(o, 0.4); const t = this.t0 + lt; label(o, 'THE ONLY KEYS', 150, 80, '#ffd23f', null, ease(at('n5', 'keys') - 0.1, at('n5', 'keys') + 0.1, t)); } };
  }
  detailShot(CB, { id: '98_think_trust', x: 0.2, z: -5.6, yaw: Math.PI * 0.62, clip: 'hold_up_object', from: 0.8, shake: 1, target: (ch) => CB.keys.getWorldPosition(V()).add(V(0, -0.12, 0)), off: [-0.04, 0.02, 0.55], post: (c) => faceCam(CB.keys, c, 0.0, -0.02, 0.0),
    extra: (lt, t) => { CB.keys.visible = true; CB.lamp.intensity = 7; dutchPose(t, 'Idle_Loop', -6.55, 1.5); } });   // detalle: las llaves en la mano que tiembla
  // ---- evidencia / maletero
  { const c = cam(44);
    out['42_evidence'] = { scene: EV.scene, camera: c, update(lt, t) { const { ch, fl } = EV.ava; fl.unaim(); fl.hide(); AVA(ch, 0.9, 0.9, Math.PI + 0.3); ch.pose(lt, L.still('idle', 0.3), [[-99, 'happy', 'smile']]);
        look(c, cr([[0, -1.4, 1.6, 2.6], [5, -1.2, 1.55, 2.3]], lt), V(-0.2, 0.9, -1.4)); },
      overlay(lt, dt, a, o) { vignette(o, 0.35); const t = this.t0 + lt; label(o, 'BEANS x8 (EVIDENCE)', 470, 60, '#ffd23f', L.toScreen(this.camera, -0.5, 0.7, -1.45), ease(at('f3', 'eight') - 0.1, at('f3', 'eight') + 0.1, t)); label(o, 'GRANOLA', 470, 100, '#8cff5a', L.toScreen(this.camera, 0.6, 1.85, -1.45), ease(at('f3', 'granola') - 0.1, at('f3', 'granola') + 0.1, t)); } };
  }
  { const c = cam(40);
    out['43_trunk'] = { scene: MP.scene, camera: c, update(lt, t) { const { ch, fl } = MP.ava; fl.unaim(); fl.hide(); AVA(ch, -1.0, 3.4, Math.PI + 0.6); ch.pose(lt, L.still('kneel', 0.8), [[-99, 'happy', 'smile']]); MP.fl1.intensity = 4;
        look(c, cr([[0, 0.6, 1.3, 4.6], [5, 0.45, 1.25, 4.3]], lt), V(-1.5, 0.3, 2.6)); },
      overlay(lt, dt, a, o) { vignette(o, 0.35); const t = this.t0 + lt; label(o, 'EMERGENCY KIT', 470, 70, '#ff4030', L.toScreen(this.camera, -1.6, 0.25, 2.7), ease(at('f4', 'emergency') - 0.1, at('f4', 'emergency') + 0.1, t)); } };
  }
  thinkShot(EV, { id: '46_think_day3', x: 0.9, z: 0.9, yaw: Math.PI + 0.3, faces: [[-99, 'happy', 'smile']], ang: 'low', lookAt: V(-0.5, 0.8, -1.45) });
  // ---- archivo + puerta trebol
  { const c = cam(42);
    out['48_cabinet'] = { scene: RC.scene, camera: c, update(lt, t) { const { ch, fl } = RC.ava; fl.unaim(); fl.hide(); const tp = at('k3', 'filing'), u = ease(tp - 0.4, tp + 0.8, t);
        RC.cab.position.x = 1.0 + 1.1 * u; AVA(ch, 1.5 + 1.1 * u + 0.45, -1.2, -Math.PI / 2); ch.pose(lt, [L.seg('push_heavy', 0, { speed: 0.7 })], [[-99, 'half', 'neutral']]);
        look(c, cr([[0, -1.5, 1.8, 2.0], [5, -1.2, 1.7, 1.6]], lt), V(1.4, 0.7, -1.9)); },
      overlay(lt, dt, a, o) { vignette(o, 0.35); const t = this.t0 + lt; label(o, 'IRON DOOR', 160, 70, '#ffd23f', L.toScreen(this.camera, 1.6, 0.6, -2.03), ease(at('k3', 'iron') - 0.1, at('k3', 'iron') + 0.1, t)); } };
  }
  { const c = cam(26);
    out['49_clover'] = { scene: RC.scene, camera: c, update(lt, t) { const { ch } = RC.ava; RC.cab.position.x = 2.1; AVA(ch, 2.3, -1.0, -Math.PI * 0.75); ch.pose(lt, L.still('kneel', 0.8), [[-99, 'half', 'neutral']]);
        RC.cold.intensity = t > at('k5', 'turns') ? 2.5 : 0; look(c, cr([[0, 1.75, 0.68, -1.15], [4, 1.68, 0.62, -1.4]], lt), V(1.6, 0.54, -2.04)); },
      overlay(lt, dt, a, o) { vignette(o, 0.5); } };
  }
  thinkShot(OB, { id: '51_think_down', x: 3.2, z: 3.6, y: 2.75, yaw: Math.PI, faces: [[-99, 'half', 'frown']], camOff: [0.1, 0.35, -1.3], lookAt: V(3.2, 1.0, 0.5) });   // detras de ella: las escaleras bajan a oscuras
  // ---- sotano 1920
  const obReset = () => { OB.ava.ch.root.position.y = 0; OB.dog.root.visible = false; };
  { const c = cam(46);
    out['53_old_station'] = { scene: OB.scene, camera: c, update(lt, t) { obReset(); const { ch, fl } = OB.ava; fl.unaim(); const u = L.clamp01(lt / 6); AVA(ch, 3.0 - 1.8 * u, 1.8 - 1.6 * u, Math.PI + 0.7);
        ch.pose(lt, [L.seg('walk', 0, { loop: true, speed: 0.5 })], [[-99, 'half', 'neutral']]); fl.show(); const tg = V(-2, 1.0, -1 + Math.sin(lt * 0.7)); fl.aim(tg, 1); fl.on(true, c, tg, 0.8, true, 8);
        look(c, cr([[0, 3.4, 2.8, 4.2], [6, 3.2, 2.7, 3.9]], lt), V(-0.6, 0.8, -1.6)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); const t = this.t0 + lt; label(o, '1920', 120, 60, '#ffd23f', null, ease(tk0('o1'), tk0('o1') + 0.3, t)); } };
  }
  { const c = cam(34);
    out['55_desk'] = { scene: OB.scene, camera: c, update(lt, t) { obReset(); const { ch, fl } = OB.ava; fl.hide(); AVA(ch, 1.6, -2.3, Math.PI); ch.pose(lt, L.still('idle', 0.3), [[-99, 'half', 'neutral']]);
        OB.lamp.intensity = 9 + Math.sin(L.q15(lt) * 9) * 0.6; look(c, cr([[0, 2.6, 1.5, -2.1], [5, 2.3, 1.35, -2.4]], lt), V(1.6, 0.85, -3.1)); },
      overlay(lt, dt, a, o) { vignette(o, 0.5); } };
  }
  thinkShot(OB, { id: '57_think_marla', x: 1.6, z: -2.3, yaw: Math.PI, faces: [[-99, 'sad', 'neutral']], ang: 'low', lookAt: V(1.7, 0.8, -3.05), extra: (lt) => { obReset(); OB.lamp.intensity = 9 + Math.sin(L.q15(lt) * 9) * 0.6; } });
  { const c = cam(38);
    out['58_she_started'] = { scene: OB.scene, camera: c, update(lt, t) { obReset(); const { ch, fl } = OB.ava; fl.hide(); AVA(ch, 0.8, -1.6, 0.2); ch.pose(lt, L.still('idle', 0.3), [[-99, 'sad', 'frown']]);
        ch.lookAt({ position: V(0.6, 4, 2) }, 0.7, 40); look(c, cr([[0, 0.9, 1.4, 1.0], [5, 0.9, 1.4, 0.6]], lt), V(0.8, 1.3, -1.6)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); } };
  }
  { const c = cam(30);
    out['59_typewriter2'] = { scene: OB.scene, camera: c, update(lt, t) { obReset(); const { ch } = OB.ava; AVA(ch, 2.6, -0.4, Math.PI / 2 + 0.3); ch.pose(lt, L.still('idle', 0.3), [[-99, 'half', 'smile']]);
        look(c, cr([[0, 2.3, 1.45, -0.4], [5, 2.55, 1.35, -0.6]], lt), V(3.55, 1.0, -1.2)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); const t = this.t0 + lt; label(o, 'INK RIBBON x1', 470, 80, '#8cff5a', null, ease(at('s1', 'ink') - 0.1, at('s1', 'ink') + 0.1, t)); } };
  }
  { const c = cam(28); out['62_think_case'] = { scene: OB.scene, camera: c, update(lt, t) { obReset(); const { ch, fl } = OB.ava; fl.hide(); AVA(ch, 3.0, -1.2, Math.PI / 2); ch.pose(lt, L.still('idle', 0.3), [[-99, 'half', 'neutral']]); look(c, cr([[0, 3.1, 1.25, -0.55], [4, 3.2, 1.18, -0.75]], lt), V(3.55, 0.98, -1.2)); }, overlay(lt, dt, a, o) { vignette(o, 0.5, 0.3); const c2 = o.tctx; c2.font = 'bold 13px "Courier New", monospace'; c2.fillStyle = '#ece6da'; c2.textAlign = 'center'; c2.fillText('JUST IN CASE.'.slice(0, Math.floor(lt * 10)), 500, 60); } }; }   // detalle: la maquina vieja guardando
  // ---- tunel
  const tuBase = (lt, t, { az = -2, flash = true, aimAt, dogZ, dogState = 'walk', clip = 'walk', walk = true, marla = 'Sitting_Idle_Loop' } = {}) => {
    const { ch, fl } = TU.ava; fl.unaim(); TU.jug.visible = false; AVA(ch, -0.82, az, Math.PI); ch.root.position.y = 0.06;
    ch.pose(lt, walk ? [L.seg(clip, 0, { loop: true, speed: 0.45 })] : L.still(clip, 0.3), null);
    TU.drips.forEach((d, i) => { const u = ((lt * 0.9 + i * 0.37) % 1); d.position.y = 1.9 - 1.85 * u * u; });
    const mt = talkOf(['m2', 'm6'])(t); TU.marla.pose(t, 'sit', { talk: mt });
    TU.dog.root.position.set(-0.6, 0.06, dogZ ?? az - 1.2); TU.dog.root.rotation.y = Math.PI; TU.dog.update(lt, dogState, {});
    if (flash) { fl.show(); const tg = aimAt || V(-0.6, 0.06, az - 2.5); fl.aim(tg, 1); return { ch, fl, tg }; } fl.hide(); return { ch, fl };
  };
  { const c = cam(44);
    out['63_tunnel'] = { scene: TU.scene, camera: c, update(lt, t) { TU.marla.root.visible = false; const az = -1.2 - 0.5 * lt, r = tuBase(lt, t, { az }); r.fl.on(true, c, r.tg, 1, true, 12); look(c, V(0.6, 0.5, az + 2.6), V(-0.4, 0.7, az - 3)); },
      overlay(lt, dt, a, o) { vignette(o, 0.5); } };
  }
  { const c = cam(40);
    out['65_dry_edge'] = { scene: TU.scene, camera: c, update(lt, t) { TU.marla.root.visible = false; const az = -4 - 0.45 * lt, r = tuBase(lt, t, { az }); r.fl.on(true, c, r.tg, 1, true, 12); look(c, V(0.4, 1.0, az - 3.2), V(-0.82, 0.7, az + 0.2)); },   // de frente: Ava y su haz, Ribbon delante a un lado
      overlay(lt, dt, a, o) { vignette(o, 0.5); const t = this.t0 + lt; label(o, 'DRY EDGE', 470, 280, '#8cff5a', null, ease(at('u4', 'dry') - 0.1, at('u4', 'dry') + 0.1, t)); } };
  }
  { const c = cam(30);
    out['66_listen'] = { scene: TU.scene, camera: c, update(lt, t) { const r = tuBase(lt, t, { az: -7, walk: false, clip: 'idle', dogState: 'stare' }); r.fl.on(true, c, r.tg, 0.7, false, 9);
        TU.marla.root.visible = false; r.ch.lookAt({ position: V(-0.5, 1.3, -20) }, 0.6, 30); r.ch.root.updateMatrixWorld(true); const hd = r.ch.bone.getObjectByName('Head').getWorldPosition(V()).add(V(0, 0.11, 0));
        look(c, hd.clone().add(V(0.35, 0.0, -0.6)), hd.clone().add(V(0, -0.03, 0))); },
      overlay(lt, dt, a, o) { vignette(o, 0.55); } };
  }
  { const c = cam(36);
    out['67_far'] = { scene: TU.scene, camera: c, update(lt, t) { tuBase(lt, t, { az: -7, walk: false, clip: 'idle', dogState: 'stare' }); TU.ava.fl.on(true, c, V(-0.5, 0.06, -10), 0.6, true, 9); TU.marla.root.visible = false;
        look(c, V(-0.3, 1.2, -6.4 - 0.25 * lt), V(-0.2, 0.8, -20)); },
      overlay(lt, dt, a, o) { vignette(o, 0.65); } };
  }
  thinkShot(TU, { id: '68_shake_ribbon', x: -0.82, z: -7, yaw: Math.PI, faces: [[-99, 'scared', 'neutral']], mouth: true, flash: true, ang: 'front', lookAt: V(-0.6, 0.3, -8.2),
    extra: (lt, t) => { TU.ava.ch.root.position.y = 0.06; TU.marla.root.visible = false; TU.dog.root.position.set(-0.6, 0.06, -8.2); TU.dog.root.rotation.y = Math.PI; TU.dog.update(lt, 'stare', {}); } });
  { const c = cam(38);
    out['69_wag'] = { scene: TU.scene, camera: c, update(lt, t) { const r = tuBase(lt, t, { az: -7, walk: false, clip: 'idle', dogState: 'sleepy_wag', dogZ: -8.3 }); r.ch.pose(lt, L.still('idle', 0.3), [[-99, 'surprised', 'smile']]); r.fl.on(true, c, V(-0.6, 0.3, -8), 0.8, false, 9); TU.marla.root.visible = false;
        TU.dog.update(lt, 'stand', { wag: 1 }); look(c, V(0.35, 0.9, -9.6), V(-0.7, 0.7, -7.6)); },   // Ribbon mueve la cola en primer termino, Ava detras
      overlay(lt, dt, a, o) { vignette(o, 0.5); } };
  }
  { const c = cam(40);
    out['70_marla'] = { scene: TU.scene, camera: c, update(lt, t) { TU.marla.root.visible = true; const r = tuBase(lt, t, { az: -11.4, walk: false, clip: 'idle', dogZ: -12.0, dogState: 'stand' }); r.fl.on(true, c, V(-0.75, 0.6, -13.5), 0.9, true, 10);
        look(c, cr([[0, 0.45, 0.95, -10.9], [5, 0.35, 0.9, -11.2]], lt), V(-0.95, 0.6, -13.5)); },
      overlay(lt, dt, a, o) { vignette(o, 0.5); const t = this.t0 + lt; label(o, 'SCARF', 470, 250, '#ff4030', null, ease(at('m1', 'scarf') - 0.1, at('m1', 'scarf') + 0.1, t)); } };
  }
  const marlaClose = (id, side = 0.35, dist = 2.1, up = -0.42) => { const c = cam(30);
    out[id] = { scene: TU.scene, camera: c, update(lt, t) { TU.marla.root.visible = true; tuBase(lt, t, { az: -11.4, walk: false, clip: 'idle', dogZ: -12.0, dogState: 'stand', flash: false }); TU.amb.intensity = 1.8;
        TU.marla.root.updateMatrixWorld(true); const hp = TU.marla.head.getWorldPosition(V()).add(V(0, 0.1, 0)), ry = TU.marla.root.rotation.y, fw = V(Math.sin(ry), 0, Math.cos(ry)), rt = V(Math.cos(ry), 0, -Math.sin(ry)); look(c, hp.clone().addScaledVector(fw, dist).addScaledVector(rt, side).add(V(0, -0.2, 0)), hp.clone().add(V(0, up, 0))); },   // de frente: cara + brazo de la bufanda   // cara + brazo con la bufanda
      overlay(lt, dt, a, o) { vignette(o, 0.55); } }; };
  marlaClose('71_marla_talk'); marlaClose('75_marla_warn', -0.75, 1.5, -0.32);
  thinkShot(TU, { id: '72_think_no', x: -0.82, z: -11.4, yaw: Math.PI, faces: [[-99, 'sad', 'frown']], ang: 'front', lookAt: V(-0.75, 0.5, -13.5), extra: (lt, t) => { TU.ava.ch.root.position.y = 0.06; TU.marla.root.visible = true; TU.marla.pose(t, 'sit'); TU.amb.intensity = 1.8; } });
  { const c = cam(36);
    out['74_wash'] = { scene: TU.scene, camera: c, update(lt, t) { TU.marla.root.visible = true; const r = tuBase(lt, t, { az: -12.9, walk: false, clip: 'kneel', dogZ: -11.8, dogState: 'sleep', flash: false }); TU.amb.intensity = 2.2;
        r.ch.pose(lt, L.still('kneel', 0.8), [[-99, 'sad', 'neutral']]); TU.jug.visible = true; TU.jug.position.set(-0.5, 0.06, -12.55);
        look(c, cr([[0, 1.35, 1.2, -12.95], [6, 1.25, 1.18, -13.0]], lt), V(-0.95, 0.72, -13.3)); },
      overlay(lt, dt, a, o) { vignette(o, 0.55); } };
  }
  // ---- azotea
  const rfBase = (lt, t, { ax = -1, az = 2, yaw = Math.PI, clip = 'idle', walk = false, mirror = false, heli = false, tube = 0 } = {}) => {
    const { ch, fl } = RF.ava; fl.unaim(); fl.hide(); RF.mirror.visible = mirror; AVA(ch, ax, az, yaw);
    ch.pose(lt, walk ? [L.seg('walk', 0, { loop: true, speed: 0.7 })] : L.still(clip, clip === 'idle' ? 0.3 : 0.8), null);
    RF.dog.root.position.set(ax + 0.7, 0, az + 0.3); RF.dog.root.rotation.y = yaw; RF.dog.update(lt, 'stand', {});
    RF.smoke.forEach((sp) => { const { x, z, k, n } = sp.userData, u = (k + (L.q15(t) * 0.25) % 1) / n; sp.position.set(x + u * u * 30, -10 + u * 55, z - u * 6); sp.scale.setScalar(4 + u * 22); });
    RF.birds.forEach((b) => { const k = b.userData.k, a = L.q15(t) * 0.35 + k * 0.5; b.position.set(-4 + Math.sin(a) * (14 + k), 11 + Math.sin(a * 2 + k) * 1.2 + k * 0.3, -26 + Math.cos(a) * (9 + k * 0.6)); b.rotation.y = -a; b.children.forEach((wg, i) => { wg.rotation.z = (i ? 1 : -1) * (0.35 + Math.sin(L.q15(t) * 9 + k) * 0.35); }); });
    unFace(RF.note); RF.note.visible = false; RF.heli.visible = heli; RF.rot.rotation.y = L.q15(t) * 40; RF.trot.rotation.x = L.q15(t) * 60; RF.tube.visible = tube > 0; RF.flare.visible = false; return { ch };
  };
  { const c = cam(46);
    out['76_roof'] = { scene: RF.scene, camera: c, update(lt, t) { const u = L.clamp01(lt / 6); rfBase(lt, t, { ax: 5.3, az: 3.2 - 3.6 * u, yaw: Math.PI + 0.25, walk: true }); look(c, cr([[0, 6.5, 6.5, 6.5], [6, 6.0, 6.3, 6.0]], lt), V(4.0, -4.0, -36)); },
      overlay(lt, dt, a, o) { vignette(o, 0.25); const t = this.t0 + lt; label(o, 'PLAN B', 100, 60, '#ffd23f', null, ease(at('r1', 'plan') - 0.1, at('r1', 'plan') + 0.1, t)); label(o, 'RIVER BRIDGE', 470, 200, '#4fd6ff', L.toScreen(this.camera, 10, -7.5, -38), ease(at('r2', 0) - 0.1, at('r2', 0) + 0.3, t)); } };
  }
  thinkShot(RF, { id: '77_think_someone', x: 2, z: -4.5, yaw: Math.PI, faces: [[-99, 'half', 'neutral']], ang: 'profile', lookAt: V(4, 1.5, -30), extra: (lt, t) => { RF.heli.visible = false; RF.tube.visible = false; RF.mirror.visible = false; RF.dog.root.position.set(2.8, 0, -4.2); RF.dog.update(lt, 'stand', {}); } });
  { const c = cam(38);
    out['79_mirror'] = { scene: RF.scene, camera: c, update(lt, t) { const { ch } = rfBase(lt, t, { ax: 2, az: -4.6, yaw: Math.PI * 0.82, clip: 'hold_up_object', mirror: true }); ch.pose(lt, L.still('hold_up_object', 0.8), [[-99, 'half', 'neutral']]); ch.lookAt({ position: V(-4, 9, -30) }, 0.8, 40);
        const fl = [at('r6', 'flash'), at('r7', 0), at('r8', 0), at('r10', 'again')]; const on = fl.some((f) => t >= f && t < f + 0.25);
        ch.root.updateMatrixWorld(true); const mp = RF.mirror.getWorldPosition(V()); RF.flare.visible = on; RF.flare.position.copy(mp); RF.flare.lookAt(c.position);
        look(c, cr([[0, 1.0, 1.35, -7.4], [5, 1.15, 1.32, -7.1]], lt), V(2.0, 1.45, -4.6)); },   // de frente: el cielo detras de la camara
      overlay(lt, dt, a, o) { vignette(o, 0.25); const t = this.t0 + lt, n = [at('r6', 'flash'), at('r7', 0), at('r8', 0)].filter((f) => t >= f).length; if (n) bitText(o.tctx, 'FLASH x' + n, 540, 60, 2, '#ffd23f', { outline: '#000' }); } };
  }
  { const c = cam(44);
    out['80_wait'] = { scene: RF.scene, camera: c, update(lt, t) { rfBase(lt, t, { ax: 2, az: -4.6, yaw: Math.PI, clip: 'idle' }); look(c, cr([[0, -4, 6.5, 6], [6, -3.6, 6.3, 5.6]], lt), V(4, -4, -36)); },
      overlay(lt, dt, a, o) { vignette(o, 0.25); } };
  }
  { const c = cam(36);
    out['82_hear'] = { scene: RF.scene, camera: c, update(lt, t) { const { ch } = rfBase(lt, t, { ax: 2, az: -4.6, yaw: Math.PI * 0.9, clip: 'idle' }); ch.pose(lt, L.still('idle', 0.3), [[-99, 'surprised', 'neutral']]); ch.lookAt({ position: V(10, 20, -30) }, 0.9, 45);
        ch.root.updateMatrixWorld(true); const hd = ch.bone.getObjectByName('Head').getWorldPosition(V()); look(c, hd.clone().add(V(0.45, -0.22, -1.25)), hd.clone().add(V(0, -0.13, 0))); },
      overlay(lt, dt, a, o) { vignette(o, 0.3); } };
  }
  { const c = cam(46);
    out['83_heli'] = { scene: RF.scene, camera: c, update(lt, t) { rfBase(lt, t, { ax: 2, az: -4.6, yaw: Math.PI * 0.8, clip: 'idle', heli: true }); const a = lt * 0.45;
        RF.heli.position.set(Math.sin(a) * 14, 9 + Math.sin(a * 2) * 0.6, -Math.cos(a) * 14); RF.heli.rotation.set(0.12, -a - Math.PI / 2, 0.15); look(c, V(-3, 1.2, 6), RF.heli.position.clone().multiplyScalar(0.7)); },
      overlay(lt, dt, a, o) { vignette(o, 0.2); } };
  }
  { const c = cam(40);
    out['84_tube'] = { scene: RF.scene, camera: c, update(lt, t) { rfBase(lt, t, { ax: 2, az: -4.6, yaw: Math.PI * 0.8, clip: 'idle', heli: true, tube: 1 }); RF.heli.position.set(4, 11, -9); RF.heli.rotation.set(0.1, 0.6, 0.1);
        const td = at('c3', 'drops'), u = L.clamp01((t - td) / 0.9); RF.tube.position.set(1.0, Math.max(0.06, 6 - 6 * u * u), -4.2); RF.tube.rotation.z = u * Math.PI * 2;
        look(c, V(-1.5, 1.3, -0.6), V(1.0, 1.05, -3.4)); },
      overlay(lt, dt, a, o) { vignette(o, 0.25); } };
  }
  { const c = cam(28);
    out['85_hands'] = { scene: RF.scene, camera: c, update(lt, t) { const { ch } = rfBase(lt, t, { ax: 1.6, az: -3.2, yaw: Math.PI, clip: 'kneel', tube: 1 }); ch.pose(lt, L.still('kneel', 0.8), [[-99, 'scared', 'neutral']]);
        RF.tube.position.set(1.6, 0.42, -3.6); RF.tube.rotation.set(0, 0.3, 0); RF.tube.position.x = 1.6 + K.rattle(lt, [0.2, 0.9, 1.6, 2.3], 0.01, 0.5, 22);
        look(c, V(2.2, 1.0, -3.0), V(1.6, 0.42, -3.6)); },
      overlay(lt, dt, a, o) { vignette(o, 0.35); const t = this.t0 + lt; const n = [0.2, 0.9, 1.6].filter((x) => lt > x).length; if (n && lt < 3) bitText(o.tctx, 'TRY ' + n, 560, 60, 1, '#e8e8e8', { outline: '#000' }); } };
  }
  detailShot(RF, { id: '87_think_seat', x: 1.6, z: -3.2, yaw: Math.PI, clip: 'kneel', from: 0.8, faces: [[-99, 'sad', 'neutral']], shake: 1, target: (ch) => RF.note.getWorldPosition(V()).add(V(0, -0.07, 0)), off: [0.0, 0.05, 0.34], post: (c) => faceCam(RF.note, c, 0.05, -0.07),
    extra: (lt) => { RF.heli.visible = false; RF.tube.visible = false; RF.dog.root.position.set(2.4, 0, -2.9); RF.dog.update(lt, 'stand', {}); RF.note.visible = true; },
    ov: (lt, o) => { bitText(o.tctx, 'ONE SEAT.', 520, 60, 2, '#ff4030', { outline: '#000' }); } });   // detalle: la nota en su mano temblando
  // ---- final: Ava de cuerpo entero frente a la celda 4 (Dutch en los barrotes), menu encima
  { const c = cam(52), RED = '#ff5a4a', WHITE = '#f0f0f0';
    out['99_choice'] = { scene: CB.scene, camera: c, hudOff: () => true, update(lt, t) { const { ch } = cellBase(t, { keys: true }); CB.keys.visible = true; CB.lamp.intensity = 7; CB.avaKey.intensity = 7; CB.avaKey.position.set(0.5, 1.9, -5.6);
        AVA(ch, -0.15, -4.2, Math.atan2(1.6, -2.1)); ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.7 })], [[-99, 'scared', 'neutral']]); ch.lookAt({ position: V(1.5, 1.6, -6.0) }, 0.9, 50);
        dutchPose(t, 'Idle_Loop', -5.75, 1.4, -Math.PI / 2 + 0.3); CB.dog.root.visible = true; CB.dog.root.position.set(-0.75, 0, -4.9); CB.dog.root.rotation.y = 2.3; CB.dog.update(lt, 'growl', { look: V(1.5, 1, -6.0) });
        look(c, cr([[0, 0.25, 1.4, -7.6], [8, 0.22, 1.38, -7.4]], lt), V(0.15, 0.95, -4.3)); },   // por encima del hombro de Dutch (borde derecho) hacia Ava de cuerpo entero
      overlay(lt, dt, a, o) { const cx = o.tctx, t = this.t0 + lt; vignette(o, 0.45);
        const kp = L.clamp01(lt / 0.25), X = LW - 250, Y = 16, Wd = 236, Hd = 156;
        cx.globalAlpha = kp; cx.fillStyle = 'rgba(4,8,18,0.86)'; cx.fillRect(X, Y, Wd, Hd); cx.strokeStyle = '#8a90a8'; cx.strokeRect(X + 0.5, Y + 0.5, Wd - 1, Hd - 1); cx.strokeStyle = '#3a3e52'; cx.strokeRect(X + 3.5, Y + 3.5, Wd - 7, Hd - 7);
        bitText(cx, 'DO YOU LET DUTCH OUT?', X + Wd / 2, Y + 22, 2, '#ececec', { outline: '#000' });
        const yes = at('x5', 'yes'), no = at('x5', 'no'), sel = t >= no ? 1 : t >= yes ? 0 : -1;
        [['1. YES', RED], ['2. NO', WHITE]].forEach(([s, col], i) => { const yy = Y + 56 + i * 26; bitText(cx, s, X + 120 + textWidth(s, 2) / 2, yy, 2, i === sel ? col : '#8a8a8a', { outline: '#000' }); if (i === sel) for (let k = 0; k < 7; k++) px(cx, X + 96 + k, yy - 7 + k, Math.floor(t * 4) % 2 ? '#c89a20' : '#ffe048', 1, 15 - 2 * k); });
        if (t >= at('x6', 0)) bitText(cx, 'MOST COMMENTS DECIDE DAY 3', X + Wd / 2, Y + 118, 1, '#ffd23f', { outline: '#000' });
        if (t >= endOf('x6') + 0.3) bitText(cx, 'SUBSCRIBE!', X + Wd / 2, Y + 140, 2, '#ff4030', { outline: '#000' }); cx.globalAlpha = 1; } };
  }
  void WHO; void box2; void tk0;
  // =====================================================================================================================
  // v3: 14_fuel y 88_whatyougot en 3D (antes pantallas planas). Estudio oscuro con suelo de cemento, focos y niebla.
  // =====================================================================================================================
  const studio = (bgc = 0x05070c) => { const s = new THREE.Scene(); s.background = new THREE.Color(bgc); s.fog = new THREE.Fog(bgc, 4, 11);
    s.add(new THREE.AmbientLight(0xffffff, 0.25)); s.add(new THREE.HemisphereLight(0x9ab0d8, 0x201810, 0.3));
    floorPlane(s, 14, 14, tConcrete(701, [70, 70, 74]), 7, 7, 0, 0, 0.001);
    const spot = (x, y, z, tx, tz, col, k) => { const l = new THREE.SpotLight(col, k, 12, 0.5, 0.6, 1.2); l.position.set(x, y, z); l.target.position.set(tx, 0.4, tz); s.add(l, l.target); return l; };
    return { s, spot }; };
  // ---- 14_fuel: el generador real del garaje + bidon rojo + manometro de combustible 3D cuya aguja baja en "dead"
  { const { s, spot } = studio(); const g = MP.gen.clone(true); g.position.set(-0.55, 0, 0); g.rotation.y = 0.5; s.add(g);
    const can = new THREE.Group(); can.position.set(0.55, 0, 0.25); can.rotation.y = -0.4; s.add(can);
    { const mR = lam(L.rep(tMetal(702, '#b8261c'), 1, 1)), mK = lam(null, 0x1a1a1a); B(0.32, 0.42, 0.18, mR, 0, 0.21, 0, can); for (const z of [-0.06, 0.06]) B(0.3, 0.02, 0.01, lam(null, 0x8a1a12), 0, 0.3, z * 1.55, can);
      B(0.22, 0.04, 0.05, mK, -0.02, 0.45, 0, can); B(0.04, 0.08, 0.04, mK, 0.12, 0.46, 0, can); const sp = cyl(0.02, 0.025, 0.14, 6, mK, 0.17, 0.5, 0, can); sp.rotation.z = -0.7;
      const tl = L.cvs(32, 16, (c) => { c.fillStyle = '#e8d860'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#111'; c.font = 'bold 7px monospace'; c.fillText('GAS', 9, 11); }); L.plane(0.14, 0.07, lam(tl), 0, 0.22, 0.091, can); }
    // manometro: esfera blanca con escala E..F, aguja roja, bisel cromado, en un poste
    const gauge = new THREE.Group(); gauge.position.set(0.05, 1.1, -0.35); s.add(gauge);
    { const tD = L.cvs(64, 64, (c) => { c.fillStyle = '#f0ece0'; c.beginPath(); c.arc(32, 32, 31, 0, 7); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 2;
        for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.15 - i * 0.1625 * 1.0), r1 = i % 4 ? 24 : 20; c.beginPath(); c.moveTo(32 + Math.cos(a) * 28, 32 - Math.sin(a) * 28); c.lineTo(32 + Math.cos(a) * r1, 32 - Math.sin(a) * r1); c.stroke(); }
        c.fillStyle = '#c02020'; c.font = 'bold 10px monospace'; c.fillText('E', 6, 46); c.fillStyle = '#111'; c.fillText('F', 51, 46); c.font = 'bold 6px monospace'; c.fillText('FUEL', 24, 50); c.fillText('1/2', 26, 14); });
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), L.basic(tD)); gauge.add(face);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.025, 6, 24), lam(null, 0xb8bcc0)); gauge.add(rim);
      const back = cyl(0.23, 0.23, 0.06, 20, lam(null, 0x2a2a2e), 0, 0, -0.035, gauge); back.rotation.x = Math.PI / 2;
      cyl(0.02, 0.02, 1.1, 6, lam(null, 0x3a3a3e), 0, -0.6, -0.05, gauge);
      MP.needle = new THREE.Group(); MP.needle.position.z = 0.01; gauge.add(MP.needle); B(0.012, 0.18, 0.006, L.basic(null, 0xd02020), 0, 0.08, 0, MP.needle); cyl(0.02, 0.02, 0.012, 8, lam(null, 0x111111), 0, 0, 0.004, MP.needle).rotation.x = Math.PI / 2; }
    spot(-1.6, 3.2, 2.2, -0.4, 0, 0xfff0d8, 26); spot(1.8, 2.6, 1.6, 0.5, 0.2, 0xffd0a0, 14); const rimL = spot(0, 2.5, -2.6, 0, 0, 0x6a8ac0, 16); void rimL;
    const c = cam(36);
    out['14_fuel'] = { scene: s, camera: c, update(lt, t) {
        const kd = ease(at('g4', 'dead') - 0.2, at('g4', 'dead') + 1.2, t), kw = ease(at('g4', 'one') - 0.2, at('g4', 'week') + 0.4, t);
        MP.needle.rotation.z = 0.0 + kd * 1.3 - kw * 1.6 + (kd > 0.99 && kw < 0.01 ? 0.02 * Math.sin(L.q15(t) * 20) : 0);   // 1/2 -> E (siempre encendido) -> casi F (1 h al dia)
        const a = -0.55 + lt * 0.06; look(c, V(Math.sin(a) * 2.6, 1.25 - lt * 0.015, Math.cos(a) * 2.6), V(0, 0.7, -0.1)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); const t = this.t0 + lt, cc = o.tctx;
        const box = (txt, x, y, col, k) => { if (k <= 0) return; cc.globalAlpha = k; cc.fillStyle = 'rgba(4,6,12,0.82)'; const w = textWidth(txt, 1) + 18; cc.fillRect(x - w / 2, y - 10, w, 20); cc.strokeStyle = col; cc.strokeRect(x - w / 2 + 0.5, y - 9.5, w - 1, 19); bitText(cc, txt, x, y, 1, col, { outline: null }); cc.globalAlpha = 1; };
        box('TANK 1/2', 470, 46, '#ffd23f', ease(at('g4', 'half') - 0.3, at('g4', 'half'), t));
        box('BURNS 0.5 GAL / HOUR', 470, 72, '#ff7b2e', ease(at('g4', 'burns') - 0.1, at('g4', 'burns') + 0.2, t));
        box('ALWAYS ON: DEAD BY TONIGHT', 470, 98, '#ff4030', ease(at('g4', 'dead') - 0.1, at('g4', 'dead') + 0.2, t) * (1 - 0.6 * ease(at('g4', 'one') - 0.1, at('g4', 'one') + 0.3, t)));
        box('1 HOUR A DAY: FRIDGE + RADIO', 470, 124, '#62f05a', ease(at('g4', 'one') - 0.1, at('g4', 'one') + 0.2, t));
        box('= MORE THAN A WEEK', 470, 150, '#62f05a', ease(at('g4', 'week') - 0.1, at('g4', 'week') + 0.2, t)); } };
  }
  // ---- 88_whatyougot: los modelos reales en tres pedestales iluminados que se encienden en su nombre
  { const { s, spot } = studio(0x040508); const ped = (x) => { cyl(0.5, 0.55, 0.16, 16, lam(null, 0x2a2c32), x, 0.08, 0, s); cyl(0.52, 0.52, 0.02, 16, L.basic(null, 0x6a7080), x, 0.165, 0, s); };
    [-1.5, 0, 1.5].forEach(ped);
    const dg = await loadDog(L); s.add(dg.root); dg.root.position.set(-1.5, 0.17, 0); dg.root.rotation.y = 0.5;
    const mr = await makePerson(L, 'marla'); s.add(mr.root); mr.root.position.set(0, 0.17, 0); mr.root.scale.setScalar(0.9);
    const du = await makePerson(L, 'dutch'); s.add(du.root); du.root.position.set(1.5, 0.17, 0); du.root.rotation.y = -0.35; du.root.scale.setScalar(0.85);
    const SP = [spot(-1.5, 3.4, 1.6, -1.5, 0, 0xfff0d8, 0), spot(0, 3.4, 1.6, 0, 0, 0xffe0d0, 0), spot(1.5, 3.4, 1.6, 1.5, 0, 0xffd8b0, 0)];
    const c = cam(40); const WD = ['ribbon', 'marla', 'dutch'];
    out['88_whatyougot'] = { scene: s, camera: c, update(lt, t) {
        WD.forEach((w, i) => { SP[i].intensity = 30 * ease(at('e1', w) - 0.15, at('e1', w) + 0.25, t); });
        dg.update(lt, 'stand', {}); mr.pose(t, 'idle', { talk: 0 }); du.pose(t, 'idle', { talk: 0 }); mr.root.rotation.y = 0.15 * Math.sin(lt * 0.4);
        const foc = [at('e1', 'ribbon'), at('e1', 'marla'), at('e1', 'dutch')].filter((f) => t >= f).length - 1, fx = foc < 0 ? 0 : [-1.5, 0, 1.5][foc] * 0.35;
        look(c, V(fx * 0.8, 1.35, 4.6 - lt * 0.04), V(fx, 0.9, 0)); },
      overlay(lt, dt, a, o) { vignette(o, 0.45); const t = this.t0 + lt;
        [['RIBBON', 'SAVED YOUR LIFE', '#62f05a', 'ribbon', -1.5], ['MARLA', 'BITTEN', '#ff4030', 'marla', 0], ['DUTCH', 'CELL 4', '#ff7b2e', 'dutch', 1.5]].forEach(([n, sub, col, w, x]) => {
          const k = ease(at('e1', w) - 0.1, at('e1', w) + 0.25, t); if (k <= 0) return; const [sx, sy] = L.toScreen(this.camera, x, x === -1.5 ? 1.15 : 2.0, 0);
          o.tctx.globalAlpha = k; bitText(o.tctx, n, sx, sy - 22, 2, '#e8e8ec', { outline: '#000' }); bitText(o.tctx, sub, sx, sy - 6, 1, col, { outline: '#000' }); o.tctx.globalAlpha = 1; });
        const ks = ease(at('e2', 'tunnel') - 0.1, at('e2', 'tunnel') + 0.2, t); if (ks > 0) { o.tctx.globalAlpha = ks; bitText(o.tctx, 'ONE SEAT', LW / 2, 40, 3, '#ff4030', { outline: '#000' }); o.tctx.globalAlpha = 1; } } };
  }
  // ---- 66_listen v3: tres angulos en lugar de un primer plano fijo de 8 s (cortes en "listen", en cada "Nothing")
  { const base = out['66_listen'], u6 = at('u6', 0), u7 = at('u7', 0), cam2 = cam(40), cam3 = cam(30);
    out['66_listen'] = { ...base, update(lt, t) {
        base.update(lt, t);
        if (t >= u6 && t < u7) { const r = 0.05 * (t - u6); look(cam2, V(1.1 - r, 0.55, -5.4 - r), V(-0.8, 1.0, -7.6)); this.camera = cam2; }   // contrapicado lateral: Ava pequeña en el tunel
        else if (t >= u7) { const r = 0.04 * (t - u7); look(cam3, V(-0.82 + 0.6, 1.6, -7.0 + 1.7 - r), V(-1.0, 1.1, -10)); this.camera = cam3; }   // por detras, sobre el hombro, hacia lo negro
        else this.camera = base.camera; } };
  }
  for (const s of Object.values(out)) if (s.overlay) s.overlay = s.overlay.bind(s);   // los overlays usan this.t0 / this.camera
  for (const o of Object.values(out)) if (o.scene === RF.scene) { o.camera.far = 420; o.camera.updateProjectionMatrix(); }   // azotea: la ciudad lejana, el rio y el humo estan a 40-200 m
  return out;
}
