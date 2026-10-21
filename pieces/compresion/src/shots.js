// =====================================================================
//  SHOTS — every shot of reference 4, authored in reference time R (RNOW = refT(TT)), then the captions.
//  Frame A = the keyframe (car on the block centred at x = 2); frame B = one frame later (car at x = 4: 2 blocks right).
// =====================================================================
const CAR_A = 2, CAR_B = 4;
const TAG = 'Fotograma clave';
// into the sweater and back out: the knit close-up dissolves into the voxel field seen from above (and back)
const XFADE = [{ r0: 51.95, r1: 52.6, a: 'suéter', b: 'voxeles' }, { r0: 58.55, r1: 59.15, a: 'voxeles', b: 'diferencias' }];
const K = (R, a, d = 0.35) => EZ.o2(seg(R, a, a + d));                 // ease in from a
const KO = (R, a, b, d = 0.35) => Math.min(K(R, a, d), 1 - EZ.i2(seg(R, b - d, b)));   // in at a, out by b
// a 2D label at the projected world point v, offset (dx, dy) in px
function labelAt(v, dx, dy, title, sub, o = {}) { const [x, y] = P2(v); s3Label(x + dx, y + dy, title, sub, o); return [x, y]; }
// the keyframe tag at frame f's top-right corner
function tagOn(f, a) { if (a <= 0) return; const [x, y] = P2(fpt(f, RW / 2 + 0.6, RH + 0.6, 0.1)); s3Tag(x, y, TAG, a); }

function sceneMain() {
  const R = (RNOW = refT(TT));
  resetWorld();
  const draw2D = [];                          // overlay painters, run after the 3D frame is drawn
  const xf = XFADE.find((x) => R >= x.r0 && R < x.r1);
  if (xf) {   // a dissolve between two shots: both rendered, the second over the first
    const u = EZ.io(seg(R, xf.r0, xf.r1)), dA = [], dB = [];
    SHOT_FN[xf.a](R, dA); renderWorld(); resetWorld(); SHOT_FN[xf.b](R, dB); renderWorld(u);
    (u < 0.5 ? dA : dB).forEach((f) => f());
  } else {
    const shot = SHOTS_R.find(([, a, b]) => R >= a && R < b) || SHOTS_R[SHOTS_R.length - 1];
    SHOT_FN[shot[0]](R, draw2D);
    renderWorld();
    draw2D.forEach((f) => f());
  }
  const cap = () => s3Caption(TT);
  if (DEFER) DEFER.push(cap); else cap();
}

// the opening stack: the keyframe + 3 ghosts climbing up and back
function stackPose(i) { return [-1.15 * i, i ? 9.6 + 5.3 * (i - 1) : 0, -3.2 * i]; }
const SHOT_FN = {
  pila(R, D) {
    lightOn(0, 5, -3);
    const A = useRoom([0, 0, 0], POSE0, { car: CAR_A, ol: ['#ffffff', 0.85] });
    const gs = [1, 2, 3].map((i) => useGhost(stackPose(i), POSE0, { cell: CAR_A + i, prev: CAR_A + i - 1, a: K(R, 0.15 + i * 0.12, 0.3) }));
    setCam(camKeys(R, [[0, [3.5, 11, 63], [-2.2, 8.6, -3], 38], [5.4, [5.5, 9, 60], [-2.2, 9.2, -3], 38]]));
    D.push(() => {
      tagOn(A, K(R, 0.05, 0.3));
      const a = K(R, 0.9, 0.4), g3c = gs[2], [x1, y1] = P2(fpt(g3c, CAR_A + 3, 2.1, 0.05)), lx = 590, ly = 250;
      s3Leader(lx - 20, ly + 40, x1, y1, S3.yellow, a, EZ.o2(seg(R, 1.0, 1.5)));
      s3Label(lx, ly, 'solo lo que se movió', 'los siguientes 3 fotogramas', { alpha: a, size: 44 });
    });
  },
  torre(R, D) {
    lightOn(0, 5, -3);
    const N = 20;
    const A = useRoom([0, 0, 0], POSE0, { car: CAR_A, ol: ['#ffffff', 0.85] });
    for (let j = 1; j < N; j++) {
      const t0 = 5.45 + 0.06 * j, pos = [0, 10.3 * j, -0.9 * j];
      if (R < t0) continue;
      const toGhost = 7.9 + (N - j) * 0.09;   // from the top down, the frames turn into ghosts
      if (R < toGhost) useRoom(pos, POSE0, { car: CAR_A + (j % 6) * 0.5, ol: ['#f2b632', 0.9], s: K(R, t0, 0.2) });
      else if (R < 10.2 || j < 4) useGhost(pos, POSE0, { cell: CAR_A + 1 + (j % 5), prev: CAR_A + (j % 5), a: 1 - seg(R, 10.0, 10.5) * (j >= 4 ? 1 : 0) });
    }
    setCam(camKeys(R, [[5.4, [5.5, 9, 60], [-2.2, 9.2, -3], 38], [6.6, [0, 4, 92], [0, 70, -14], 50], [8.4, [0, 8, 90], [0, 92, -18], 50], [10.6, [0, 6, 80], [0, 46, -8], 48]]));
    D.push(() => tagOn(A, 1 - seg(R, 5.4, 5.7)));
  },
  cuarto(R, D) {
    lightOn(WOMAN_X, 3, -3);
    const cx = lerp(-5.6, 1.9, EZ.io(seg(R, 11.3, 14.6)));
    useRoom([0, 0, 0], POSE0, { car: cx });
    setCam(camKeys(R, [[10.6, [-1.6, 3.2, 6.8], [-1.4, 2.5, -4.4], 50], [14.9, [-0.8, 3.1, 6.3], [-0.6, 2.5, -4.4], 50]]), 0.6);
  },
  diorama(R, D) {
    lightOn(0, 4, -3);
    const A = useRoom([0, 0, 0], POSE0, { car: 1.9, wg: 0.85 * KO(R, 16.4, 17.6, 0.15) });
    setCam(camKeys(R, [[14.9, [-0.8, 3.1, 6.3], [-0.6, 2.5, -4.4], 50], [16.2, [3.5, 4.8, 27], [0, 4.4, -3], 40], [18.0, [4.2, 5.0, 30], [0, 4.5, -3], 40]]));
  },
  detalles(R, D) {
    lightOn(0, 4, -3);
    useRoom([0, 0, 0], POSE0, { car: CAR_A });
    if (R < 18.92) setCam(camKeys(R, [[18.0, [WOMAN_X + 0.5, 3.1, 0.6], [WOMAN_X, 3.0, WOMAN_Z], 44], [18.92, [WOMAN_X + 0.3, 3.1, 0.2], [WOMAN_X, 3.0, WOMAN_Z], 44]]), 0.4);
    else if (R < 19.64) setCam(camKeys(R, [[18.92, [3.6, 4.6, -0.8], [5.2, 3.6, -7], 46], [19.64, [3.9, 4.5, -1.1], [5.4, 3.5, -7], 46]]), 0.4);
    else if (R < 20.4) setCam(camKeys(R, [[19.64, [CAR_A - 1.2, 1.6, 1.4], [CAR_A, 0.8, CAR_Z], 40], [20.4, [CAR_A - 1.5, 1.7, 1.8], [CAR_A, 0.8, CAR_Z], 40]]), 0.3);
    else setCam(camKeys(R, [[20.4, [0.5, 4.6, 34], [0, 4.5, -3], 40], [21.0, [0.4, 4.8, 48], [0, 4.6, -3], 40]]));
  },
  dos(R, D) {
    lightOn(0, 9, -3);
    const A = useRoom([0, 0, 0], POSE0, { car: CAR_A });
    const rise = EZ.o3(seg(R, 21.5, 22.3)), bPos = [0, lerp(4, 10.8, rise), lerp(-6, 0, rise)];
    const yl = 0.95 * KO(R, 25.6, 28.6, 0.2);
    const toGhost = seg(R, 28.3, 28.75);
    if (R >= 21.5 && toGhost < 1) useRoom(bPos, POSE0, { car: CAR_B, ol: ['#f2b632', yl] });
    let B = null; if (R >= 28.3) B = useGhost([0, 10.8, 0.25], POSE0, { cell: CAR_B, prev: CAR_A, a: EZ.o2(toGhost) });
    setCam(camKeys(R, [[21.0, [0.4, 4.8, 48], [0, 4.6, -3], 40], [22.3, [2, 10, 64], [0, 7.9, -2], 36], [30.2, [5, 10, 60], [0, 7.9, -2], 36]]));
    D.push(() => {
      tagOn(A, K(R, 21.1, 0.25));
      if (R >= 21.9 && R < 28.5) { const [x, y] = P2(new THREE.Vector3(-RW / 2 - 0.4, bPos[1] + RH + 1.0, bPos[2])); s3Text('1 fotograma después', x, y, { size: 42, color: S3.white, alpha: K(R, 22.0, 0.3) * (1 - seg(R, 28.2, 28.5)), spacing: 1 }); }
      if (B) { const a = K(R, 28.9, 0.3), [x1, y1] = P2(fpt(B, CAR_B, 2.1, 0)); s3Leader(x1 + 40, y1 - 225, x1 + 6, y1 - 6, S3.yellow, a, EZ.o2(seg(R, 29.0, 29.4))); s3Label(1040, y1 - 245, 'solo esto se movió', null, { alpha: a, size: 46, align: 'right' }); }
    });
  },
  bloques(R, D) {
    lightOn(0, 9, -3);
    const A = useRoom([0, 0, 0], POSE0, { car: CAR_A, lat: K(R, 30.9, 0.1), flat: R >= 30.9 });
    const B = useRoom([0, 10.8, 0], POSE0, { car: CAR_B, lat: K(R, 30.7, 0.1), flat: R >= 30.7 });
    setCam(camKeys(R, [[30.2, [5, 10, 60], [0, 7.9, -2], 36], [31.6, [10, 11, 52], [0, 10, -3], 38], [34.5, [12, 10, 48], [0, 9.6, -3], 38]]));
    D.push(() => { const a = K(R, 31.8, 0.3); if (a > 0) { const [x, y] = P2(new THREE.Vector3(0, 9.9, 0.4)); s3Text('esquemático: los códecs reales mezclan tamaños de bloque', x, y + 10, { size: 26, color: S3.note, align: 'center', alpha: a * 0.9 }); } });
  },
  vector(R, D) {
    const th = -lerp(0, 0.95, EZ.io(seg(R, 34.5, 35.5))) - lerp(0, 0.45, EZ.io(seg(R, 44.2, 45.2)));
    const P = { pos: [0, 0, 0], rx: th };
    lightOn(0, 4, -6);
    const A = useRoom([0, 0, 0], P, { car: CAR_A, lat: 1, flat: true });
    const B = useRoom([0, 10.8, 0], P, { car: CAR_B, lat: 1, flat: true });
    ringOn(0, B, CAR_B, 1, 0.5);   g3().rings[0].userData.mat.opacity = K(R, 35.6, 0.25);
    ringOn(1, A, CAR_A, 1, 0.5);   g3().rings[1].userData.mat.opacity = K(R, 36.9, 0.25);
    // the lifted block: up out of A, then along the arc into B
    const g = g3(), lift = EZ.o2(seg(R, 38.4, 39.6)), hop = EZ.io(seg(R, 40.3, 41.3));
    const p0 = fpt(A, CAR_A, 0, 1.0), p1 = fpt(B, CAR_B, 0, 1.0), nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(A.quaternion);
    const top = p0.clone().addScaledVector(nrm, 3.2), ctrl = p0.clone().lerp(p1, 0.5).addScaledVector(nrm, 9);
    const bez = (u) => { const a = p0.clone().addScaledVector(nrm, 3.2 * lift).lerp(ctrl, u), b = ctrl.clone().lerp(p1, u); return a.lerp(b, u); };
    if (R >= 38.4 && R < 42.0) {
      g.block.visible = true; g.block.quaternion.copy(A.quaternion);
      g.block.position.copy(hop > 0 ? bez(hop) : p0.clone().addScaledVector(nrm, 3.2 * lift).addScaledVector(nrm, -1.0)); g.block.scale.setScalar(1 - 0.15 * seg(R, 41.3, 42.0));
      if (R > 41.6) g.block.visible = false;
    }
    if (R >= 40.3) {   // the arc, drawn as the block flies, then kept
      const u = Math.max(0.02, hop), pts = []; for (let i = 0; i <= 40; i++) pts.push(bez(u * i / 40));
      g.arc.geometry.dispose(); g.arc.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.16, 10, false); g.arc.visible = true;
      g.arcHead.visible = true; g.arcHead.position.copy(pts[pts.length - 1]);
    }
    if (R >= 41.2) { g.patch.visible = true; g.patch.material.opacity = 0.9 * K(R, 41.2, 0.3); g.patch.position.copy(fpt(B, CAR_B, 1, 0.6)); g.patch.quaternion.copy(B.quaternion); }
    setCam(camKeys(R, [[34.5, [12, 10, 48], [0, 9.6, -3], 38], [35.6, [8, 27, 25], [0.5, 4, -6], 44], [38.4, [6.5, 20, 19], [0.8, 3, -5], 46], [41.2, [8, 22, 20], [1.5, 4, -6.5], 46], [44.9, [10, 19, 19], [2, 4, -6], 46]]));
    D.push(() => {
      const a = K(R, 42.1, 0.3); if (a <= 0) return;
      const mid = bez(0.5), [mx, my] = P2(mid);
      s3Leader(260, 360, mx, my, S3.cyan, a * 0.8, EZ.o2(seg(R, 42.2, 42.7)), 2);
      s3Label(150, 300, 'Vector de movimiento', '2 bloques a la derecha', { color: S3.cyan, alpha: a, size: 52 });
      const [px, py] = P2(fpt(B, CAR_B - 1, 2.2, 0.6)); s3Text('+ pequeña corrección', px - 20, py - 18, { size: 32, color: S3.yellow, align: 'right', alpha: K(R, 42.6, 0.3), spacing: 1 });
    });
  },
  pixeles(R, D) {
    const th = -0.95 - lerp(0, 0.45, EZ.io(seg(R, 44.2, 45.2))) + lerp(0, 0.45, EZ.io(seg(R, 47.9, 48.8)));
    const P = { pos: [0, 0, 0], rx: th };
    lightOn(0, 4, -6);
    const A = useRoom([0, 0, 0], P, { car: CAR_A, lat: 1, flat: true }), B = useRoom([0, 10.8, 0], P, { car: CAR_B, lat: 1, flat: true });
    ringOn(0, B, CAR_B, 1, 0.5); g3().rings[0].userData.mat.opacity = 1;
    ringOn(1, A, CAR_A, 1, 0.5); g3().rings[1].userData.mat.opacity = 1;
    const g = g3();
    // the column: 6 x 6 x 100 cubes rising out of B's block, then folding back down
    const grow = EZ.o2(seg(R, 45.2, 47.0)), shrink = EZ.i2(seg(R, 47.7, 48.4)), n = Math.floor(3600 * grow * (1 - shrink));
    if (n > 0) {
      g.px.visible = true; B.updateMatrixWorld(); let k = 0;
      for (let z = 0; z < 100; z++) for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++, k++) {
        if (k >= n) _m4.makeScale(0, 0, 0);
        else { _v.set(CAR_B - 0.835 + i * 0.334, 0.17 + j * 0.334, 0.35 + z * 0.334).applyMatrix4(B.matrixWorld); _m4.compose(_v, B.quaternion, _s.set(1, 1, 1)); }
        g.px.setMatrixAt(k, _m4);
      }
      g.px.instanceMatrix.needsUpdate = true;
    }
    // the small instruction instead: the arc + patch stay, a cyan tag
    const p0 = fpt(A, CAR_A, 0, 1.0), p1 = fpt(B, CAR_B, 0, 1.0), nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(A.quaternion), ctrl = p0.clone().lerp(p1, 0.5).addScaledVector(nrm, 9);
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, a = p0.clone().addScaledVector(nrm, 3.2).lerp(ctrl, u), b = ctrl.clone().lerp(p1, u); pts.push(a.lerp(b, u)); }
    g.arc.geometry.dispose(); g.arc.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.16, 10, false); g.arc.visible = true; g.arcHead.visible = true; g.arcHead.position.copy(pts[40]);
    g.patch.visible = true; g.patch.material.opacity = 0.9; g.patch.position.copy(fpt(B, CAR_B, 1, 0.6)); g.patch.quaternion.copy(B.quaternion);
    setCam(camKeys(R, [[44.9, [10, 19, 19], [2, 4, -6], 46], [45.8, [17, 3, 15], [3, 14, -9], 56], [47.2, [16, 4, 16], [3, 22, -9], 56], [48.3, [11, 18, 19], [2, 5, -6], 46], [50.4, [10, 19, 17], [2.5, 5.5, -6.5], 44]]));
    D.push(() => {
      const a = KO(R, 45.7, 47.9, 0.3);
      s3Label(560, 330, '57.600 píxeles', 'este pedazo, en 1080p', { alpha: a, size: 56 });
      s3Text('1 cubo = 16 píxeles', 560, 440, { size: 28, color: S3.note, alpha: a * 0.85, spacing: 1 });
      const b = K(R, 48.4, 0.3); if (b > 0) { const [x, y] = P2(fpt(B, CAR_B, 2.4, 0.6)); s3Tag(x + 150, y - 30, '2 bloques →', b, { size: 38, bg: S3.cyan }); s3Text('pocos bytes', x + 150 - 4, y + 12, { size: 28, color: S3.cyan, align: 'right', alpha: b, spacing: 1 }); }
    });
  },
  'suéter'(R, D) {
    lightOn(WOMAN_X, 3, -3);
    useRoom([0, 0, 0], POSE0, { car: 1.9 });
    setCam(camKeys(R, [[50.4, [-1.2, 3.1, 6.8], [-1.2, 2.6, -4.4], 50], [51.0, [-1.2, 3.1, 6.6], [-1.2, 2.6, -4.4], 50], [52.6, [WOMAN_X, 2.9, WOMAN_Z + 0.85], [WOMAN_X, 2.9, WOMAN_Z - 1], 40]]), 0.3);
  },
  voxeles(R, D) {
    const g = g3(), X0 = 600, VX = g.VX, VZ = g.VZ;
    g.floor.visible = false; lightOn(X0, 0, -40);
    const simp = EZ.io(seg(R, 54.6, 55.6)), flat = EZ.io(seg(R, 56.6, 57.6));
    g.vox.visible = true; const c = new THREE.Color();
    for (let k = 0; k < VZ; k++) for (let i = 0; i < VX; i++) {
      const id = k * VX + i, right = i >= VX / 2;
      let h = g.voxH[id]; c.copy(g.voxC[id]);
      if (right) {   // simplified: heights rounded, colour shared by each 2 x 2 group
        const i0 = i & ~1, k0 = k & ~1, avg = (g.voxH[k0 * VX + i0] + g.voxH[k0 * VX + i0 + 1] + g.voxH[(k0 + 1) * VX + i0] + g.voxH[(k0 + 1) * VX + i0 + 1]) / 4;
        h = lerp(h, Math.round(avg * 2) / 2, simp);
        if (flat > 0) c.lerp(g.voxC[k0 * VX + i0], flat);
      }
      h = lerp(h, 0.35 + h * 0.12, flat);
      _m4.compose(_v.set(X0 + i - VX / 2 + 0.5, h / 2, -k), _q.identity(), _s.set(0.96, h, 0.96)); g.vox.setMatrixAt(id, _m4); g.vox.setColorAt(id, c);
    }
    g.vox.instanceMatrix.needsUpdate = true; g.vox.instanceColor.needsUpdate = true;
    g.divider.visible = true; g.divider.position.set(X0, 0, -40); g.divider.scale.set(1, 1, 1);
    g.divider.geometry = g.divider.geometry; g.divider.material.opacity = 0.85 * KO(R, 53.0, 58.2, 0.3); g.divider.visible = g.divider.material.opacity > 0.01;
    setCam(camKeys(R, [[51.95, [X0, 46, -40], [X0, 0, -40.8], 50], [52.6, [X0, 40, -38], [X0, 0, -38.9], 50], [54.0, [X0, 9, 10], [X0, 1, -40], 60], [56.4, [X0, 7.5, 2], [X0, 0.5, -42], 60], [57.4, [X0 - 6, 22, 4], [X0 - 2, 0, -22], 56], [58.0, [X0 - 4, 30, -24], [X0 - 3, 0, -34], 52], [58.55, [X0 - 3, 40, -38], [X0 - 3, 0, -38.9], 50], [59.15, [X0 - 3, 46, -40], [X0 - 3, 0, -40.8], 50]]));
    D.push(() => {
      const a = KO(R, 53.8, 56.6, 0.3);
      if (a > 0) { const [lx, ly] = P2(new THREE.Vector3(X0 - 6, 3.2, -30)), [rx, ry] = P2(new THREE.Vector3(X0 + 6, 3.2, -30));
        s3Text('original', lx, ly, { size: 42, align: 'center', alpha: a, spacing: 1 }); s3Text('simplificado', rx, ry, { size: 42, align: 'center', alpha: a * lerp(0.45, 1, simp), spacing: 1 }); }
      const b = KO(R, 57.0, 58.3, 0.3); if (b > 0) { s3Text('color: 1 por cada 4 píxeles', 70, 330, { size: 46, alpha: b }); s3Text('brillo: cada píxel', 70, 382, { size: 30, color: S3.note, alpha: b, spacing: 1 }); }
    });
  },
  diferencias(R, D) {
    lightOn(WOMAN_X, 3, -3);
    const A = useRoom([0, 0, 0], POSE0, { car: 1.9 });
    const g = g3();
    if (R >= 59.2) {
      g.diffs.visible = true; const Rn = RNG('diffs');
      for (let i = 0; i < 40; i++) {
        const x = Rn.r(-0.5, 5.6), y = Rn.r(3.0, 8.3), t0 = 59.25 + Rn.r(0, 0.6), t1 = 60.95 + Rn.r(0, 0.45), s = popS(esT(t0)) * (1 - EZ.i2(seg(R, t1, t1 + 0.25)));
        _m4.compose(_v.set(x, y, -RD + 0.2), _q.identity(), _s.set(s, s, 1)); g.diffs.setMatrixAt(i, _m4);
      }
      g.diffs.instanceMatrix.needsUpdate = true;
    }
    setCam(camKeys(R, [[58.55, [WOMAN_X, 2.9, WOMAN_Z + 0.85], [WOMAN_X, 2.9, WOMAN_Z - 1], 40], [59.15, [WOMAN_X, 2.9, WOMAN_Z + 1.0], [WOMAN_X, 2.9, WOMAN_Z - 1], 40], [60.1, [-1.0, 4.3, 9.0], [-0.4, 3.8, -5], 50], [62.3, [-1.2, 4.2, 8.4], [-0.4, 3.8, -5], 50]]), 0.4);
    D.push(() => { const a = KO(R, 59.6, 61.1, 0.25); if (a > 0) { const [x1, y1] = P2(new THREE.Vector3(3.6, 6.9, -RD + 0.2)); s3Leader(Math.min(x1 + 60, 980), y1 - 232, x1, y1, S3.yellow, a, EZ.o2(seg(R, 59.7, 60.1)), 2); s3Text('diferencias diminutas', 1040, y1 - 250, { size: 34, color: S3.yellow, align: 'right', alpha: a, spacing: 1 }); } });
  },
  reinicio(R, D) {
    lightOn(-4, 30, -12);
    // a climbing stack: old keyframe, ghosts, a new keyframe at slot 5, then ghosts again
    const slot = (s) => [-0.9 * s, 7.2 * s, -2.6 * s];
    let K5 = null;
    for (let s = 0; s <= 9; s++) {
      if (s === 0) { useRoom(slot(0), POSE0, { car: CAR_A }); continue; }
      if (s === 5) { if (R >= 63.85) K5 = useRoom(slot(5), POSE0, { car: CAR_A, s: EZ.back(seg(R, 63.85, 64.3)) }); continue; }
      const t0 = s < 5 ? 62.0 : 67.3 + (s - 6) * 0.35; if (R < t0) continue;
      useGhost(slot(s), POSE0, { cell: CAR_A + s % 4 + 1, prev: CAR_A + s % 4, a: K(R, t0, 0.25) });
    }
    setCam(camKeys(R, [[62.3, [8, 12, 58], [-1.5, 15, -6], 40], [63.8, [8, 28, 62], [-3.5, 32, -12], 40], [66.7, [7, 33, 64], [-4, 37, -13], 40], [69.6, [8, 48, 68], [-5.5, 50, -18], 42]]));
    D.push(() => { if (K5) tagOn(K5, K(R, 64.4, 0.3)); });
  },
  'montón'(R, D) {
    lightOn(0, 20, -6);
    for (let j = 0; j < 18; j++) {
      const pos = [0, 10.3 * j, -0.9 * j], full = j % 4 === 0, toFull = 72.9 + j * 0.06;
      if (full || R >= toFull) useRoom(pos, POSE0, { car: CAR_A + (j % 6) * 0.5, ol: ['#f2b632', full && R < toFull ? 0 : 0.9 * K(R, toFull, 0.2)] });
      else useGhost(pos, POSE0, { cell: CAR_A + 1 + (j % 4), prev: CAR_A + (j % 4), a: 1 });
    }
    setCam(camKeys(R, [[69.6, [0, 4, 60], [0, 60, -12], 52], [72.0, [0, 5, 64], [0, 70, -14], 52], [75.0, [0, 6, 64], [0, 76, -14], 52]]));
    D.push(() => { const a = K(R, 72.5, 0.3); s3Text('lo que NO es: cada fotograma entero', CX, 300, { size: 30, color: S3.note, align: 'center', alpha: a, spacing: 1 }); });
  },
  recibes(R, D) {
    lightOn(0, 6, -3);
    const A = useRoom([0, 0, 0], POSE0, { car: CAR_A, ol: ['#ffffff', 0.85] });
    const g1 = useGhost([-0.6, 9.6, -2.6], POSE0, { cell: CAR_A + 1, prev: CAR_A }), g2 = useGhost([-1.2, 14.8, -5.2], POSE0, { cell: CAR_A + 2, prev: CAR_A + 1 });
    setCam(camKeys(R, [[75.0, [-10, 12, 66], [-6, 10.5, -2], 34], [80.4, [-11, 12.5, 64], [-6.2, 10.5, -2], 34]]));
    D.push(() => {
      const hi = (r) => lerp(0.45, 1, K(R, r, 0.2));
      const L = (f, x, y, z, txt, c, r, dy = 0, sub) => { const [px, py] = P2(fpt(f, x, y, z)), lx = 50; ctx.font = s3Font(38); const tw = ctx.measureText(txt).width; s3Leader(lx + tw + 14, py + dy - 12, px - 8, py, c, hi(r) * 0.85, 1, 2); s3Text(txt, lx, py + dy, { size: 38, color: c, alpha: hi(r) }); if (sub) s3Text(sub, lx, py + dy + 44, { size: 32, color: S3.note, alpha: hi(79.22) }); };
      L(g2, -RW / 2, 6.8, 0, 'instrucciones de movimiento', S3.cyan, 77.72, 0);
      L(g1, -RW / 2, 4.0, 0, 'cambios', S3.yellow, 76.84, -10, 'datos comprimidos');
      L(A, -RW / 2 - 0.6, 3.0, 0, 'fotogramas completos', S3.white, 75.62, 30);
    });
  },
  continuo(R, D) {
    lightOn(0, 4, -3);
    const g = g3(), up = EZ.i2(seg(R, 80.5, 82.2));
    const car = R < 82.0 ? CAR_A : lerp(CAR_A, 6.5, EZ.io(seg(R, 82.0, 85.3)));
    const A = useRoom([0, 0, 0], POSE0, { car });
    if (up < 1) { useGhost([-0.6, 9.6 + up * 30, -2.6 - up * 20], POSE0, { cell: CAR_A + 1, prev: CAR_A, a: 1 - up }); useGhost([-1.2, 14.8 + up * 36, -5.2 - up * 24], POSE0, { cell: CAR_A + 2, prev: CAR_A + 1, a: 1 - up }); }
    const ph = EZ.o2(seg(R, 81.4, 82.4));
    if (ph > 0) { g.phone.visible = true; g.phone.position.set(0, 0, 0.2 + (1 - ph) * 4); g.phone.scale.setScalar(1); g.phone.quaternion.identity(); }
    setCam(camKeys(R, [[80.4, [-11, 12.5, 64], [-6.2, 10.5, -2], 34], [82.4, [-2, 8, 44], [0, 6, -2], 34], [85.3, [-0.5, 5.2, 26], [0, 4.6, -3], 38]]));
  },
  final(R, D) {
    lightOn(0, 4, -3);
    const g = g3(), car = lerp(6.5, 7.5, seg(R, 85.3, 91.8));
    useRoom([0, 0, 0], POSE0, { car }); g.phone.visible = true; g.phone.position.set(0, 0, 0.2); g.phone.quaternion.identity(); g.phone.scale.setScalar(1);
    g.raw.visible = true; g.raw.position.set(-14, 80 - 0.62, -20);
    g.stream.visible = true; g.stream.position.set(16, -0.37, 2); g.stream.scale.set(EZ.o2(seg(R, 87.76, 88.3)) + 0.001, 1, 1);
    setCam(camKeys(R, [[85.3, [-0.5, 5.2, 26], [0, 4.6, -3], 38], [86.4, [6, 9, 92], [6, 8, -4], 40], [89.4, [6.5, 9, 94], [6, 8.2, -4], 40], [91.8, [6, 8.4, 84], [6, 7.6, -4], 40]]));
    D.push(() => {
      const a = K(R, 86.5, 0.3), b = K(R, 87.76, 0.3), x = 650;
      s3Text('unos', x, 360, { size: 34, color: S3.yellow, alpha: a, spacing: 1 }); s3Text('11 GB', x - 6, 520, { size: 130, color: S3.yellow, alpha: a }); s3Text('sin comprimir', x, 590, { size: 34, color: S3.white, alpha: a, spacing: 1 });
      s3Text('unos', x, 700, { size: 34, color: S3.cyan, alpha: lerp(0.35, 1, b) * a }); s3Text('40 MB', x - 6, 860, { size: 130, color: S3.cyan, alpha: lerp(0.35, 1, b) * a }); s3Text('en streaming', x, 930, { size: 34, color: S3.white, alpha: b, spacing: 1 });
      const c = K(R, 88.6, 0.3); ['1 min de 1080p a 30 fps:', 'RGB de 8 bits sin comprimir', 'vs. un stream de ~5 Mb/s'].forEach((l, i) => s3Text(l, x, 990 + i * 34, { size: 24, color: S3.note, alpha: c * 0.9 }));
      const e = K(R, 90.4, 0.4); if (e > 0) { const [px, py] = P2(new THREE.Vector3(0, -1.6, 0.5)); s3Text('DOPAMENTES', px, py + 40, { size: 30, color: S3.white, align: 'center', alpha: e * 0.9, spacing: 4 }); }
    });
  },
};
