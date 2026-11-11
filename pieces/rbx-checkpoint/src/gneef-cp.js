// rbx-checkpoint additions to the GN kit (gneef.js stays as copied from rbx-rope):
// hats (fire helmet, shako, band cap, sleep mask), layered extras (band jacket + braid + epaulettes, crossbelt, whistle,
// bunker coat bands, knee plasters, wristband, belly, swim ring, arm floaties, goggles, gold chain, monocle, backpack,
// pocket flag) and held props (tuba). Spec head-units for hats (head = 1, top y=+0.5, face +z); body-local for extras.
'use strict';
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { rbox, cnv, tex } = RBX;
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  const HM = (c, o = {}) => once('cphm' + c + JSON.stringify(o), () => new T.MeshPhysicalMaterial({ color: c, roughness: o.rough ?? 0.5, metalness: o.metal ?? 0, clearcoat: o.gloss ?? 0.3, clearcoatRoughness: 0.4, flatShading: !!o.flat, side: o.side || T.FrontSide, emissive: o.em || '#000000', emissiveIntensity: o.ei ?? 0 }));
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const B = (w, h, d, mat, x, y, z, r = 0.03) => M(rbox(w, h, d, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001), 4), mat, x, y, z);
  const GOLD = () => HM('#e0b030', { rough: 0.38, metal: 0.75, gloss: 0.3 }), SILVER = () => HM('#d8dce4', { rough: 0.2, metal: 1, gloss: 0.7 });
  const H = GN.HAIR;
  // fire helmet: dome + long back brim + front leather shield with a gold badge + top comb
  H.fire = (c = '#c81e1e', o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.3, gloss: 0.8 });
    const d = M(new T.SphereGeometry(0.66, 32, 16, 0, PI * 2, 0, PI / 2), m, 0, 0.36, -0.04); d.scale.set(1.04, 0.9, 1.1); g.add(d);
    const br = M(new T.CylinderGeometry(0.86, 0.88, 0.05, 32), m, 0, 0.36, -0.2); br.scale.set(1, 1, 1.25); br.rotation.x = -0.14; g.add(br);
    g.add(B(0.1, 0.12, 1.25, m, 0, 0.95, -0.06, 0.04));
    const sh = B(0.4, 0.42, 0.06, HM('#1a1a1a', { rough: 0.5 }), 0, 0.66, 0.6, 0.05); sh.rotation.x = -0.5; g.add(sh);
    const bd = B(0.24, 0.24, 0.04, GOLD(), 0, 0.67, 0.635, 0.04); bd.rotation.x = -0.5; g.add(bd); return g; };
  // hero 'lava' hair: H1 shard mop (red-orange, yellow under-layer) + an H2 flame fan rising off the crown (1.5x tall)
  H.lava = (c = '#FF3A10', o = {}) => { const g = new T.Group(); g.add(H.H1(c, { under: o.tip || '#FFB020', k: 1.15 }));
    const f = H.H2(c, { tip: o.tip || '#FFB020' }); f.children.slice(0, 3).forEach((m) => { m.visible = false; }); f.scale.setScalar(1.05); f.position.set(0, 0.12, -0.08); g.add(f); return g; };
  // shako (marching hat): tall cylinder, black peak, gold band + plate, chin strap, red plume
  H.shako = (c = '#1a1a2a', o = {}) => { const g = new T.Group(), m = HM(c, { rough: 0.4, gloss: 0.5 });
    g.add(M(new T.CylinderGeometry(0.6, 0.55, 0.85, 32), m, 0, 0.72, -0.02));
    g.add(M(new T.CylinderGeometry(0.565, 0.565, 0.12, 32), GOLD(), 0, 0.36, -0.02)); g.add(M(new T.CylinderGeometry(0.61, 0.61, 0.06, 32), GOLD(), 0, 1.13, -0.02));
    const pk = M(new T.CylinderGeometry(0.6, 0.6, 0.04, 24, 1, false, -PI / 2, PI), HM('#111', { rough: 0.15, gloss: 1 }), 0, 0.32, 0.12); pk.scale.z = 0.75; pk.rotation.x = 0.18; g.add(pk);
    const pl = M(new T.CircleGeometry(0.2, 6), GOLD(), 0, 0.72, 0.6); pl.rotation.x = -0.06; g.add(pl);
    const plume = M(new T.SphereGeometry(0.16, 16, 12), HM('#e8202a', { rough: 0.9, gloss: 0 }), 0, 1.45, 0.08); plume.scale.set(0.8, 2.2, 0.8); g.add(plume);
    const st = M(new T.TorusGeometry(0.56, 0.025, 6, 30, PI), GOLD(), 0, 0.3, 0.02); st.rotation.z = PI; st.scale.set(1, 0.9, 1); g.add(st); return g; };
  // band cap (tuba player): flat-top peaked cap
  H.bandcap = (c = '#1c2f7a') => { const g = new T.Group(), m = HM(c, { rough: 0.5 });
    g.add(M(new T.CylinderGeometry(0.7, 0.6, 0.32, 32), m, 0, 0.74, -0.08)); g.add(M(new T.CylinderGeometry(0.61, 0.61, 0.06, 32), GOLD(), 0, 0.6, -0.08));
    const pk = M(new T.CylinderGeometry(0.55, 0.55, 0.04, 24, 1, false, -PI / 2, PI), HM('#111', { rough: 0.15, gloss: 1 }), 0, 0.6, 0.18); pk.scale.z = 0.7; pk.rotation.x = 0.25; g.add(pk);
    g.add(M(new T.CircleGeometry(0.11, 5), GOLD(), 0, 0.8, 0.56)); return g; };
  // sleep mask pushed up on the forehead (rich guy) with sleepy eyes printed on it
  H.mask = (c = '#2a1030') => { const g = new T.Group(); const t = (() => { const cv = cnv(256, 96), q = cv.getContext('2d'); q.fillStyle = c; q.fillRect(0, 0, 256, 96); q.strokeStyle = '#f4c0d8'; q.lineWidth = 7; q.lineCap = 'round';
      [70, 186].forEach((x) => { q.beginPath(); q.arc(x, 40, 26, 0.15, PI - 0.15); q.stroke(); for (let k = -2; k <= 2; k++) { q.beginPath(); q.moveTo(x + k * 11, 64); q.lineTo(x + k * 14, 78); q.stroke(); } }); return tex(cv); })();
    const band = M(new T.CylinderGeometry(0.625, 0.625, 0.24, 40, 1, true), [new T.MeshStandardMaterial({ map: t, roughness: 0.4, side: T.DoubleSide })][0], 0, 0.36, 0); band.rotation.x = -0.18; t.wrapS = T.RepeatWrapping; t.repeat.set(1, 1); t.offset.x = 0.25; g.add(band); return g; };
  // ---------- body extras ----------
  // marching jacket trim: gold frogging bars + buttons, collar band, epaulettes with fringe (on the torso's shoulder edge)
  GN.bandJacket = (gold = '#e8b830', bel = null) => (av) => { const gm = GOLD();
    const zf = (x, y) => { if (!bel) return 0.53; const u = x / bel[0], v = (y - bel[3]) / bel[1], q = 1 - u * u - v * v; return q > 0 ? Math.max(0.53, 0.42 + bel[2] * Math.sqrt(q) + 0.02) : 0.53; };
    for (let k = 0; k < 5; k++) { const y = 0.62 - k * 0.3; [-1, 1].forEach((s) => { for (let j = 0; j < 3; j++) { const x = s * (0.12 + j * 0.16); av.body.add(B(0.17, 0.07, 0.05, gm, x, y, zf(x, y))); } av.body.add(M(new T.SphereGeometry(0.06, 10, 8), gm, s * 0.6, y, zf(s * 0.6, y) + 0.02)); }); }
    av.body.add(B(2.04, 0.18, 1.04, gm, 0, 0.92, 0, 0.04));
    [-1, 1].forEach((s) => { av.body.add(B(0.7, 0.12, 1.0, gm, s * 0.68, 1.04, 0, 0.04)); for (let i = 0; i < 6; i++) av.body.add(M(new T.CylinderGeometry(0.025, 0.025, 0.22, 5), gm, s * (1.0), 0.92, -0.42 + i * 0.17)); }); };
  // flag-bearer belt: white belt + leather flag cup at the front (where the pole sits)
  GN.flagBelt = (z = 0.6) => (av) => { av.body.add(B(2.1, 0.22, 1.1, HM('#f6f4ee', { rough: 0.5 }), 0, -0.88, 0, 0.04)); av.body.add(B(2.1, 0.22, 0.2, HM('#f6f4ee', { rough: 0.5 }), 0, -0.88, z - 0.05, 0.04));
    const cup = M(new T.CylinderGeometry(0.16, 0.12, 0.36, 14), HM('#6a3a1a', { rough: 0.4, gloss: 0.6 }), 0, -0.98, z + 0.12); av.body.add(cup); av.body.add(B(0.3, 0.2, 0.06, GOLD(), 0, -0.88, z + 0.06, 0.03)); av.flagCup = cup; };
  GN.crossbelt = (c = '#f6f4ee') => (av) => { const m = HM(c, { rough: 0.6 }); [1, -1].forEach((z) => { const b = B(0.3, 2.75, 0.05, m, 0, 0.0, z * 0.53); b.rotation.z = -0.78 * z; av.body.add(b); }); };
  // whistle on a cord around the neck (hangs on the chest; `inMouth` puts it between the lips instead)
  GN.whistle = (cord = '#e8202a', inMouth = false) => (av) => { const s = SILVER(), cm = HM(cord, { rough: 0.7 });
    const w = new T.Group(); w.add(M(new T.CylinderGeometry(0.11, 0.11, 0.16, 16), s)); w.children[0].rotation.z = PI / 2; const tube = B(0.26, 0.09, 0.09, s, 0.15, 0.03, 0); w.add(tube); w.add(M(new T.TorusGeometry(0.035, 0.012, 6, 12), s, -0.12, 0.08, 0));
    av.whistle = w; av.blow = (on) => { if (on) { w.position.set(0, -0.24, 0.84); w.rotation.set(0, PI / 2, 0); av.head.add(w); } else { w.position.set(0.12, 0.45, 0.62); w.rotation.set(0, 0, 0); av.body.add(w); } };
    av.blow(inMouth); { const cv = new T.CatmullRomCurve3([V(-0.42, 1.0, 0.36), V(-0.2, 0.62, 0.6), V(0.06, 0.5, 0.66), V(0.3, 0.62, 0.6), V(0.42, 1.0, 0.36)]); av.body.add(M(new T.TubeGeometry(cv, 24, 0.022, 6), cm)); } };
  // bunker coat: reflective bands on torso, sleeves (on the arm pivot so they move) and legs
  GN.bunker = (band = '#f2e030', refl = '#d8dce0') => (av) => { const y = HM(band, { rough: 0.5 }), r = HM(refl, { rough: 0.2, metal: 0.5, em: '#606060', ei: 0.25 });
    [-0.35, -0.75].forEach((yy) => { av.body.add(B(2.08, 0.16, 1.08, y, 0, yy, 0)); av.body.add(B(2.1, 0.06, 1.1, r, 0, yy, 0)); });
    [av.armL, av.armR].forEach((a) => { a.inner.add(B(1.22, 0.16, 1.22, y, 0, -1.15, 0)); a.inner.add(B(1.24, 0.06, 1.24, r, 0, -1.15, 0)); });
    [av.legL, av.legR].forEach((l) => { l.add(B(1.06, 0.16, 1.06, y, 0, -1.2, 0)); l.add(B(1.08, 0.06, 1.08, r, 0, -1.2, 0)); });
    av.body.add(B(0.12, 1.9, 0.05, HM('#222', { rough: 0.4 }), 0, 0, 0.53)); for (let k = 0; k < 4; k++) av.body.add(B(0.3, 0.08, 0.06, HM('#222'), 0.05, 0.6 - k * 0.4, 0.55)); };
  // crossed sticking plasters on both knees (he trips a lot) + scuff
  GN.plasters = (c = '#f4c8a0') => (av) => { const m = HM(c, { rough: 0.8, gloss: 0 }), pad = HM('#e8e0d8', { rough: 0.9, gloss: 0 });
    [av.legL, av.legR].forEach((l, i) => { const g = new T.Group(); g.position.set(i ? 0.06 : -0.05, -0.9, 0.52); [0.6, -0.6].forEach((a) => { const p = B(0.6, 0.17, 0.03, m, 0, 0, 0, 0.03); p.rotation.z = a + (i ? 0.2 : -0.1); g.add(p); }); g.add(B(0.16, 0.15, 0.045, pad, 0, 0, 0.01, 0.02)); l.add(g); }); };
  GN.wristband = (c = '#e8202a', side = 'L') => (av) => { const a = side === 'L' ? av.armL : av.armR; a.inner.add(B(1.22, 0.2, 1.22, HM(c, { rough: 0.7 }), 0, -1.32, 0)); };
  GN.BELLY = [0.9, 0.62, 0.3, -0.22]; GN.belly = (c, p = 'tee', o = {}) => (av) => { const m = GN.mat(p, Object.assign({ c, tile: 1 }, o)); const E = GN.BELLY, b = M(new T.SphereGeometry(1, 28, 18), m, 0, E[3], 0.42); b.scale.set(E[0], E[1], E[2]); av.body.add(b); };
  GN.legStripe = (c = '#e8b830') => (av) => [av.legL, av.legR].forEach((l, i) => l.add(B(0.04, 1.66, 0.22, HM(c, { rough: 0.4 }), i ? -0.51 : 0.51, -0.85, 0, 0.015)));
  // inflatable duck ring round the waist + arm floaties + goggles on the forehead (water park kids)
  GN.swimRing = (c = '#f6d020') => (av) => { const r = M(new T.TorusGeometry(1.2, 0.38, 16, 40), HM(c, { rough: 0.25, gloss: 1 }), 0, -0.75, 0); r.rotation.x = PI / 2; r.scale.set(1, 0.8, 1); av.body.add(r);
    const hd = M(new T.SphereGeometry(0.42, 20, 14), HM(c, { rough: 0.25, gloss: 1 }), 0, -0.2, 1.25); av.body.add(hd); const bk = B(0.4, 0.14, 0.34, HM('#f08020', { rough: 0.3, gloss: 1 }), 0, -0.26, 1.66, 0.06); av.body.add(bk);
    [-1, 1].forEach((s) => av.body.add(M(new T.SphereGeometry(0.07, 10, 8), HM('#111'), s * 0.2, -0.05, 1.6))); };
  GN.floaties = (c = '#f05a28') => (av) => [av.armL, av.armR].forEach((a) => { const t = M(new T.TorusGeometry(0.62, 0.24, 12, 28), HM(c, { rough: 0.25, gloss: 1 }), 0, -0.55, 0); t.rotation.x = PI / 2; a.inner.add(t); });
  GN.goggles = (c = '#20c0e0') => (av) => { const m = HM(c, { rough: 0.1, gloss: 1 }), lens = new T.MeshPhysicalMaterial({ color: '#80e0ff', roughness: 0.05, transmission: 0.2, clearcoat: 1, metalness: 0.2 });
    const strap = M(new T.CylinderGeometry(0.625, 0.625, 0.09, 40, 1, true), HM('#1a1a1a', { side: T.DoubleSide }), 0, 0.42, 0); av.head.add(strap);
    [-1, 1].forEach((s) => { const e = M(new T.CylinderGeometry(0.15, 0.15, 0.08, 20), m, s * 0.19, 0.44, 0.6); e.rotation.x = PI / 2 - 0.35; av.head.add(e); const l = M(new T.CircleGeometry(0.11, 20), lens, s * 0.19, 0.455, 0.645); l.rotation.x = -0.35; av.head.add(l); }); };
  GN.chain = () => (av) => { const g = GOLD(); const cv = new T.CatmullRomCurve3([V(-0.45, 1.0, 0.38), V(-0.25, 0.55, 0.56), V(0, 0.4, 0.58), V(0.25, 0.55, 0.56), V(0.45, 1.0, 0.38)]); av.body.add(M(new T.TubeGeometry(cv, 30, 0.04, 6), g)); { const md = M(new T.CylinderGeometry(0.16, 0.16, 0.05, 20), g, 0, 0.32, 0.6); md.rotation.x = PI / 2; av.body.add(md); } };
  GN.monocle = () => (av) => { const g = GOLD(); av.head.add(M(new T.TorusGeometry(0.15, 0.022, 8, 24), g, -0.2, 0.08, 0.64)); av.head.add(M(new T.TubeGeometry(new T.CatmullRomCurve3([V(-0.33, 0.04, 0.62), V(-0.42, -0.3, 0.55), V(-0.5, -0.6, 0.45)]), 12, 0.01, 4), g)); };
  GN.backpack = (c = '#e84040') => (av) => { const m = GN.mat('tee', { c, tile: 1 }); av.body.add(B(1.5, 1.6, 0.6, m, 0, -0.05, -0.8, 0.12)); av.body.add(B(1.1, 0.6, 0.2, m, 0, -0.4, -1.15, 0.08)); [-1, 1].forEach((s) => av.body.add(B(0.16, 1.9, 0.05, HM('#222'), s * 0.55, 0, 0.53, 0.02))); };
  // the tiny checkpoint flag in the shirt pocket (the ending: everyone carries one)
  GN.pocketFlag = (c = '#f05a28') => (av) => { av.body.add(B(0.5, 0.45, 0.05, HM('#3a3a40', { rough: 0.9 }), 0.5, 0.35, 0.52, 0.02)); const f = CP.flag({ c, h: 0.9, w: 0.45, pole: 0.025, pad: false }); f.position.set(0.5, 0.25, 0.55); av.body.add(f); };
  GN.collar = (c = '#e8202a') => (av) => { const t = M(new T.TorusGeometry(0.42, 0.09, 10, 28), HM(c, { rough: 0.5 }), 0, 1.02, 0); t.rotation.x = PI / 2; t.scale.set(1.15, 0.8, 1); av.body.add(t); };
  // held tuba: coils + big bell over the shoulder, on the body (so it stays put while the arms hug it)
  GN.tuba = () => (av) => { const g = new T.Group(), b = HM('#e2b64a', { rough: 0.18, metal: 1, gloss: 0.9 });
    const c1 = M(new T.TorusGeometry(0.75, 0.2, 14, 36), b, 0, 0, 0); g.add(c1); const c2 = M(new T.TorusGeometry(0.5, 0.13, 12, 30), b, 0, 0, 0.12); g.add(c2);
    const bell = M(new T.CylinderGeometry(0.9, 0.22, 1.4, 32, 1, true), HM('#e2b64a', { rough: 0.18, metal: 1, gloss: 0.9, side: T.DoubleSide }), 1.3, 2.2, -0.9); bell.rotation.set(-0.5, 0, -0.45); g.add(bell);
    { const pp = M(new T.CylinderGeometry(0.2, 0.22, 1.9, 16), b, 0.8, 1.15, -0.45); pp.rotation.set(-0.5, 0, -0.45); g.add(pp); }
    [0, 0.18, 0.36].forEach((x) => g.add(M(new T.CylinderGeometry(0.06, 0.06, 0.4, 10), SILVER(), -0.2 + x, 0.65, 0.3)));
    g.add(M(new T.TubeGeometry(new T.CatmullRomCurve3([V(-0.5, 0.4, 0.1), V(-0.6, 1.2, 0.4), V(-0.3, 1.8, 0.9), V(0, 1.95, 1.15)]), 20, 0.05, 8), b));
    g.scale.setScalar(0.78); g.position.set(-0.2, -0.45, 0.95); g.rotation.set(0, 0.15, 0.05); av.body.add(g); };
})();
