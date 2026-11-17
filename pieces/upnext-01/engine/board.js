// Storyboard board: every shot of storyboard.md as a quick engine render (index.html?board=1, 3 s per shot,
// render frame = shot index * 90 + 45). Reuses the style-frame builders from shots.js with other cameras/poses,
// plus a few quick sets (dig site with the buried fridge, icebox, lab void). Rough on purpose: layout + staging only.
export function buildBoard({ SHOTS, shotHook, shotIcehouse, shotMail, shotSection, lib: L }) {
  const { THREE, FX, LW, LH, T } = L;
  const words = [];
  const W = (i, w) => words.push([i * 3 + 0.3, i * 3 + 2.9, w]);

  // generic quick shot: set(scene) -> ctx; character; camera; fx; overlay
  function mk(t0, s) {
    const scene = new THREE.Scene(); const ctx = s.set(scene) || {};
    let ch = null;
    if (s.ch) {
      ch = L.zero(); ch.root.position.set(s.ch.p[0], s.ch.p[1] ?? 0, s.ch.p[2]); ch.root.rotation.y = s.ch.ry ?? 0; scene.add(ch.root);
      if (s.ch.prop) s.ch.prop(ch, scene, ctx);
    }
    const sf = s.snow === false ? null : L.snowfall(scene, { cx: s.cam[0], cz: s.cam[2] - 6, R: 10 });
    const fx = new FX(LW, LH); (s.fx || []).forEach(([k, o]) => fx.add(k, { t0, dur: 30, ...o }));
    const cam = new THREE.PerspectiveCamera(s.fov || 36, 9 / 16, 0.05, 400);
    return {
      t0, scene, camera: cam, fx,
      update(lt) {
        if (ch) ch.pose(lt, L.still(s.ch.clip, s.ch.at ?? 1.0), [[-1, s.ch.face[0], s.ch.face[1]]]);
        if (ctx.tick) ctx.tick(lt + t0); if (sf) sf(lt + t0);
        cam.position.set(...s.cam); cam.lookAt(...s.look);
      },
      overlay(lt, dt, a, o) { if (s.over) s.over(o, cam, ctx, lt); },
    };
  }
  const wrap = (shot, i, over) => { const prev = shot.overlay; shot.overlay = (lt, dt, a, o) => { if (prev) prev(lt, dt, a, o); if (over) over(o, shot.camera, lt); o.pixelText('#' + String(i + 1).padStart(2, '0'), 24, 16, 12, '#ffffff', 2, 1); }; return shot; };

  // ---- quick sets ----
  function digSite(scene) {   // the excavation: a wide pit with the fridge half out of the snow
    L.village(scene, { cz: -5, cx: -3.5, holes: [[0.6, -0.6, 1.0]] });
    L.hole(scene, 0.6, -0.6, 1.0, 0.9);
    const fr = L.fridgeWhole(); fr.position.set(0.6, -0.75, -0.75); fr.rotation.set(-0.25, 0.25, 0.12); scene.add(fr);
    L.drift(scene, 2.1, -0.3, 0.8, 0.45, 0.6); L.drift(scene, -0.9, -1.2, 0.6, 0.35, 0.5);
    const sh = L.model('shovel', 1.15); sh.position.set(1.9, -0.3, -0.4); sh.rotation.set(0.1, 0.4, -0.25); scene.add(sh);
    L.footprints(scene, -0.6, 0.6, -2.4, 4.0, 10);
    return { fr };
  }
  function labSet(scene) {   // her scanner "void": dark blue gradient + grid floor (diagram cutaways)
    L.addSky(scene, { near: 30, far: 90, preset: 'lab' });
    const g = L.cvs(16, 16, (c) => { c.fillStyle = '#10204a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#3a78d8'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16); });
    L.plane(60, 60, L.basic(L.rep(g, 60, 60), 1), 0, 0, 0, scene, 0, -Math.PI / 2);
  }
  function icebox(scene, x, z, section) {   // wooden icebox: ice compartment on top, food below
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const oak = L.basic(L.rep(T.planks, 0.6, 0.6), 2.4), D = section ? 0.3 : 0.6;
    if (!section) L.box(0.8, 1.3, 0.6, oak, 0, 0.65, -0.3, g);
    else {
      for (const [w, h, xx, yy] of [[0.8, 0.06, 0, 1.27], [0.8, 0.06, 0, 0.03], [0.06, 1.3, -0.37, 0.65], [0.06, 1.3, 0.37, 0.65], [0.8, 0.04, 0, 0.82]]) L.box(w, h, D, oak, xx, yy, -D / 2, g);
      L.plane(0.68, 1.18, L.basic(null, 0x7a5a3a), 0, 0.65, -D + 0.01, g);
      const m = L.meat(); m.position.set(-0.05, 0.25, -0.15); g.add(m);
      L.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 7), L.basic(null, 0xf4f4f0), 0.2, 0.15, -0.15, g);
    }
    const ice = L.iceBlock(0.5, 0.3, 0.3); ice.position.set(0, section ? 1.0 : 1.45, -0.15); g.add(ice);
    return g;
  }

  // ---- the shot list (mirrors storyboard.md) ----
  const meatL = (ch) => L.holdIn(ch, L.meat(), 'L', [0, 0.8, 0], [0, 0, 1.6]);
  const S = [];
  // 1 establishing: dig site, ruins in the fog, she digs
  S.push(['artifact.', (t) => mk(t, { set: digSite, ch: { p: [-0.6, 0, 0.4], ry: 0.9, clip: 'dig', at: 0.5, face: ['angry', 'shout'] }, cam: [-3.0, 3.6, 9.5], look: [0.2, 0.8, -1.5], fov: 38, fx: [['impact', { world: [0.6, 0.6, -0.6], life: 9 }]] })]);
  // 2 reveal close-up: her face + fridge, scan HUD
  S.push(['fridge.', (t) => mk(t, { set: digSite, ch: { p: [-0.35, 0, 0.5], ry: 0.7, clip: 'surprised', at: 1.0, face: ['hearts', 'smileOpen'] }, cam: [-0.3, 1.25, 3.4], look: [0.2, 0.75, -0.4], fov: 30,
    fx: [['sparkle', { world: [0.6, 0.9, -0.7], n: 5 }]], over: (o) => { o.tctx.strokeStyle = '#7cf0ff'; o.tctx.lineWidth = 1; o.tctx.strokeRect(150, 120, 90, 120); o.pixelText('ARTIFACT 001', 195, 108, 12, '#7cf0ff', 2, 1); } })]);
  // 3 dig a hole in the snow
  S.push(['snow', (t) => mk(t, { set: (sc) => { L.village(sc, { cz: -5, cx: -3.5, holes: [[0.5, 0.3, 0.34]] }); L.hole(sc, 0.5, 0.3, 0.34, 0.4); },
    ch: { p: [-0.1, 0, 0.0], ry: 0.8, clip: 'dig', at: 0.3, face: ['angry', 'shout'], prop: (ch, sc) => { const s = L.model('shovel', 1.15); s.position.set(0.45, -0.1, 0.3); s.rotation.set(0.5, 0.6, 0.3); sc.add(s); } },
    cam: [1.6, 2.6, 3.6], look: [0.2, 0.4, 0.0], fov: 40, fx: [['dust', { world: [0.5, 0.05, 0.3], every: 0.6, color: '#ffffff', edge: '#c8d0dc' }]] })]);
  // 4 HOOK (style frame A)
  S.push(['refrigerator.', (t) => shotHook(t)]);
  // 5 but snow melts in summer: same hole, warm light, sad
  S.push(['summer', (t) => shotHook(t, { cam: [1.9, 1.5, 3.8], look: [0.3, 0.6, 0.1], fov: 34, faces: [[-1, 'sad', 'frown']], noLabel: true, fxh: 1 })]);
  // 6 cut ice from frozen lakes (saw)
  S.push(['lakes', (t) => shotIcehouse(t, { cx: -3.6, cz: 0.6, cry: 0.6, noBlock: true, segs: L.still('saw', 0.3), faces: [[-1, 'angry', 'shout']], cam: [-2.0, 1.6, 4.4], look: [-4.0, 0.6, 0.2], fov: 38, noLabel: true })]);
  // 7 hide them in a shed full of sawdust: inside the door
  S.push(['sawdust.', (t) => shotIcehouse(t, { cx: 1.1, cz: 0.9, cry: 3.4, noBlock: true, segs: L.still('pour', 1.0), faces: [[-1, 'happy', 'smile']], cam: [3.8, 1.7, 4.8], look: [2.0, 0.9, -1.4], fov: 36, noLabel: true })]);
  // 8 ICEHOUSE (style frame B)
  S.push(['icehouse.', (t) => shotIcehouse(t)]);
  // 9 lasted for months, even in summer: wide, calendar tag
  S.push(['months', (t) => wrap(shotIcehouse(t, { cx: 0.6, cz: 0.4, cry: 0.2, noBlock: true, segs: L.still('smug', 1.1), faces: [[-1, 'relaxed', 'cat']], cam: [5.5, 2.6, 9.0], look: [1.2, 1.5, -1.5], fov: 34, noLabel: true }), 8,
    (o) => o.pixelText('JUN  JUL  AUG', 135, 70, 16, '#ffffff', 2, 1))]);
  // 10 meat swimming in water. Gross.
  S.push(['Gross.', (t) => mk(t, { set: (sc) => { L.village(sc, { cz: -5, cx: -3.5, holes: [[0.4, 0.3, 0.4]] }); L.hole(sc, 0.4, 0.3, 0.4, 0.3); L.plane(0.8, 0.8, L.basic(null, 0x6a9ac0), 0.4, -0.08, 0.3, sc, 0, -Math.PI / 2); const m = L.meat(); m.position.set(0.4, -0.05, 0.3); sc.add(m); },
    ch: { p: [-0.35, 0, -0.2], ry: 0.7, clip: 'sick', at: 1.0, face: ['dizzy', 'frown'] }, cam: [1.8, 1.5, 3.4], look: [0.1, 0.55, 0.0], fov: 34,
    fx: [['stink', { world: [0.4, 0.1, 0.3] }], ['bubbles', { world: [0.4, -0.05, 0.3] }]] })]);
  // 11 ice on top of a wooden box, food underneath: she puts the ice in
  S.push(['box', (t) => mk(t, { set: (sc) => { L.kitchenSet(sc); icebox(sc, 0.4, 0, false); }, snow: false,
    ch: { p: [-0.45, 0, 0.3], ry: 0.6, clip: 'hold_up_object', at: 1.2, face: ['open', 'smileOpen'] }, cam: [0.0, 1.1, 5.8], look: [0.0, 0.9, 0], fov: 32 })]);
  // 12 Cold air sinks. ICEBOX section with sinking arrows
  S.push(['icebox.', (t) => mk(t, { set: (sc) => { L.kitchenSet(sc); icebox(sc, 0.15, 0, true); }, snow: false, cam: [0.15, 0.75, 3.0], look: [0.15, 0.7, 0], fov: 32,
    fx: [['arrow', { world: [-0.1, 0.62, -0.1], angle: Math.PI / 2, len: 16, color: '#3c9ce8' }], ['arrow', { world: [0.4, 0.62, -0.1], angle: Math.PI / 2, len: 16, color: '#3c9ce8' }]],
    over: (o, cam) => { const p = L.toScreen(cam, 0.15, 1.35, 0); L.label(o, 'ICEBOX', 135, p[1] - 20, 22); } })]);
  // 13 COMMENT (style frame C)
  S.push(['cold?', (t) => shotMail(t)]);
  // 14 you can only steal heat: close-up smug wink
  S.push(['steal', (t) => shotMail(t, { segs: L.still('smug', 1.15), faces: [[-1, 'wink', 'cat']], cam: [0.15, 1.45, 2.1], look: [0.0, 1.38, 0.6], fov: 24, noLabel: true })]);
  // 15 evaporation diagram in the lab void
  S.push(['evaporates', (t) => mk(t, { set: (sc) => { labSet(sc); const d = L.mesh(new THREE.SphereGeometry(0.35, 10, 6), L.basic(null, 0x6cc4ff), 0.3, 0.2, 0, sc); d.scale.y = 0.55; }, snow: false,
    ch: { p: [-0.45, 0, 0.2], ry: 0.5, clip: 'think', at: 1.2, face: ['half', 'frown'] }, cam: [0.0, 1.3, 5.4], look: [0.0, 0.7, 0], fov: 34,
    fx: [['steam', { world: [0.3, 0.4, 0] }], ['heat', { world: [0.3, 0.35, 0], color: '#ff9a2e', dx: 14 }], ['arrow', { world: [0.75, 0.6, 0], angle: -0.6, color: '#ff8a2a', light: '#ffd080', edge: '#5a1800' }]] })]);
  // 16 shiver out of the shower (NEW action: shiver)
  S.push(['shower.', (t) => mk(t, { set: (sc) => { L.kitchenSet(sc); L.box(1.4, 0.55, 0.7, L.basic(null, 0xe8e8e4), 0.6, 0.28, -0.9, sc); L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 5), L.basic(null, 0x8a8c94), 1.2, 1.3, -1.2, sc); }, snow: false,
    ch: { p: [0.0, 0, 0.0], ry: 0.1, clip: 'surprised', at: 1.0, face: ['shocked', 'bigShock'] }, cam: [0.3, 1.25, 3.4], look: [0.1, 1.0, 0], fov: 34,
    fx: [['sweat', { obj: null, world: [0.25, 1.65, 0.1] }], ['drip', { world: [-0.2, 1.3, 0.2] }], ['snow', { world: [0.0, 1.2, 0.2], n: 6 }]] })]);
  // 17 filled a pipe with a special liquid
  S.push(['liquid', (t) => mk(t, { set: (sc) => { L.kitchenSet(sc); const c = new THREE.CatmullRomCurve3([[-0.2, 1.0, 0.2], [0.2, 1.1, 0.25], [0.2, 0.95, 0.3], [-0.2, 0.9, 0.3], [-0.2, 0.8, 0.25], [0.25, 0.75, 0.2]].map((p) => new THREE.Vector3(...p)));
      L.mesh(new THREE.TubeGeometry(c, 40, 0.03, 5), L.basic(null, 0x5ab4ff), 0, 0, 0, sc); }, snow: false,
    ch: { p: [-0.5, 0, 0.0], ry: 0.6, clip: 'present', at: 1.0, face: ['open', 'smileOpen'] }, cam: [0.0, 1.15, 4.2], look: [-0.05, 0.95, 0.1], fov: 30, fx: [['sparkle', { world: [0.0, 0.95, 0.25], n: 4, color: '#9cd8ff' }]] })]);
  // 18 boils at -26: a glass of it boiling in the snow. REFRIGERANT
  S.push(['refrigerant.', (t) => mk(t, { set: (sc) => { L.village(sc, { cz: -5, cx: -3.5 }); const c = L.model('cup', 0.24, 0x9cd8ff); c.position.set(0.0, 0, 0.0); sc.add(c); L.drift(sc, 0, 0, 0.4, 0.06, 0.4); },
    cam: [0.0, 0.42, 1.0], look: [0.0, 0.16, 0], fov: 30, fx: [['bubbles', { world: [0, 0.2, 0], every: 0.08 }], ['steam', { world: [0, 0.26, 0], every: 0.1 }]],
    over: (o) => { L.label(o, 'REFRIGERANT', 135, 300, 20); o.pixelText('-26°C', 210, 120, 20, '#9cd8ff', 3, 1); } })]);
  // 19 inside the box it boils and steals the heat from your food: section close-up inside
  S.push(['food.', (t) => shotSection(t, { cam: [0.5, 1.0, 2.6], look: [0.5, 1.0, 0], fov: 30, noLabel: true, cry: 0.25 })]);
  // 20 a pump squeezes it outside until it gets hot: close on the compressor
  S.push(['hot', (t) => shotSection(t, { cam: [1.3, 0.55, 2.2], look: [1.0, 0.55, 0], fov: 30, noLabel: true })]);
  // 21 COMPRESSOR (style frame D)
  S.push(['compressor.', (t) => shotSection(t)]);
  // 22 the back of your fridge is always warm: she warms her hands at the dug-up fridge (NEW action: warm_hands)
  S.push(['warm.', (t) => mk(t, { set: (sc) => { const r = digSite(sc); return r; }, ch: { p: [0.3, -0.35, 0.35], ry: Math.PI - 0.2, clip: 'present', at: 1.0, face: ['relaxed', 'cat'] },
    cam: [-2.4, 1.5, 3.6], look: [0.4, 0.5, -0.5], fov: 34, fx: [['heat', { world: [0.75, 0.85, -1.2] }], ['heart', { world: [0.3, 1.4, 0.3] }]] })]);
  // 23 heat thief, running in a loop forever: section wide, HEAT THIEF label
  S.push(['thief,', (t) => shotSection(t, { label: 'HEAT THIEF', segs: L.still('smug', 1.1), faces: [[-1, 'wink', 'cat']] })]);
  // 24 rob their own leftovers: she holds the leftovers box, shrug
  S.push(['leftovers.', (t) => mk(t, { set: digSite, ch: { p: [-0.3, 0, 0.6], ry: 0.3, clip: 'shrug', at: 1.0, face: ['half', 'frown'], prop: (ch) => { const b = L.box(0.16, 0.1, 0.14, L.basic(null, 0xe8e0d0), 0, 0, 0, null); L.holdIn(ch, b, 'R', [0, 1.0, 0]); } },
    cam: [0.4, 1.35, 3.9], look: [0.0, 0.95, 0.2], fov: 30 })]);
  // 25 Artifact understood. Logging off.
  S.push(['off.', (t) => mk(t, { set: digSite, ch: { p: [-0.4, 0, 0.8], ry: 0.25, clip: 'wave', at: 1.0, face: ['happy', 'smileOpen'] }, cam: [-0.6, 2.4, 7.5], look: [0.1, 0.9, -0.8], fov: 36,
    over: (o) => { o.pixelText('LOGGING OFF...', 135, 60, 16, '#7cf0ff', 2, 1); } })]);

  S.forEach(([w, f], i) => { const shot = f(i * 3); SHOTS.push(i === 8 ? shot : wrap(shot, i)); W(i, w); });
  window.WORDS_OVERRIDE = words;
}
