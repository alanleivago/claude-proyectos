// rbx-checkpoint mechanic props: checkpoint flag (pole + waving cloth), Roblox-obby checkpoint pad (glowing ring + respawn
// arrow), the POOF (puff cluster + sparkle stars + shock ring) and the pop-in (spawn beam + squash), ladders, ropes, ground helper.
'use strict';
const CP = {};
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { rbox, cnv, tex, rng } = RBX;
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  const SM = (c, r = 0.5, m = 0, o = {}) => once('sm' + c + r + m + JSON.stringify(o), () => new T.MeshPhysicalMaterial(Object.assign({ color: c, roughness: r, metalness: m, clearcoat: 0.2 }, o)));
  const B = (w, h, d, m, x, y, z, r = 0.05) => { const me = new T.Mesh(rbox(w, h, d, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001), 4), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; return me; };
  const sh = (g) => { g.traverse((m) => { if (m.isMesh && !m.material.transparent) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
  CP.COL = { hero: '#f05a28', town: '#1f4fd8', school: '#8a3ad0', pool: '#18b8d8', rich: '#d8a020', active: '#38f08a' };
  // cloth texture: field colour + white emblem (star | arrow | stripe) + hem stripe
  const clothTex = (c, emblem) => once('cloth' + c + emblem, () => { const W = 256, Hh = 160, cv = cnv(W, Hh), q = cv.getContext('2d'); q.fillStyle = c; q.fillRect(0, 0, W, Hh);
    q.fillStyle = 'rgba(0,0,0,0.18)'; q.fillRect(0, Hh - 16, W, 16); q.fillStyle = 'rgba(255,255,255,0.12)'; q.fillRect(0, 0, W, 10);
    q.fillStyle = '#ffffff'; q.strokeStyle = '#ffffff';
    if (emblem === 'star') { KIT.star(q, W * 0.5, Hh * 0.5, 50, 5, 0.45); q.fill(); }
    else if (emblem === 'arrow') { q.lineWidth = 18; q.lineCap = 'round'; q.beginPath(); q.arc(W * 0.5, Hh * 0.52, 42, -PI * 0.15, PI * 1.35); q.stroke(); q.beginPath(); q.moveTo(W * 0.5 + 58, Hh * 0.38 - 20); q.lineTo(W * 0.5 + 40, Hh * 0.38 + 18); q.lineTo(W * 0.5 + 18, Hh * 0.28 - 8); q.closePath(); q.fill(); }
    else if (emblem === 'flame') { q.beginPath(); q.moveTo(W * 0.5, 22); q.quadraticCurveTo(W * 0.5 + 60, 80, W * 0.5 + 30, 130); q.quadraticCurveTo(W * 0.5, 150, W * 0.5 - 30, 130); q.quadraticCurveTo(W * 0.5 - 50, 90, W * 0.5 - 10, 60); q.quadraticCurveTo(W * 0.5 - 4, 90, W * 0.5 + 10, 96); q.quadraticCurveTo(W * 0.5 + 18, 60, W * 0.5, 22); q.fill(); }
    else if (emblem === 'check') { const n = 8, s = W / n; for (let y = 0; y < Hh / s; y++) for (let x = 0; x < n; x++) if ((x + y) % 2) q.fillRect(x * s, y * s, s, s); }
    KIT.noiseOver(q, W, Hh, 5, 0.12, 8, 3); const t = tex(cv); t.anisotropy = 8; return t; });
  // flag: pole from y=0 to h, cloth at the top waving (phase ph), gold finial. o: { c, h, w, pole, emblem, ph, amp, pad }
  CP.flag = (o = {}) => { const g = new T.Group(), h = o.h || 4, w = o.w || 1.6, ht = w * 0.62, pr = o.pole || 0.07;
    const pole = new T.Mesh(new T.CylinderGeometry(pr, pr * 1.15, h, 10), SM(o.poleC || '#e8e8ec', 0.25, 0.8)); pole.position.y = h / 2; g.add(pole);
    { const fin = new T.Mesh(new T.SphereGeometry(pr * 2.2, 12, 10), SM('#e8b830', 0.2, 1)); fin.position.y = h + pr; g.add(fin); }
    const geo = new T.PlaneGeometry(w, ht, 18, 6); geo.translate(w / 2, 0, 0); const p = geo.attributes.position, ph = o.ph || 0, amp = o.amp ?? 0.12;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), u = x / w; p.setZ(i, Math.sin(u * 7 + ph + y * 0.6) * amp * w * u); p.setY(i, y - u * u * ht * 0.12); }
    geo.computeVertexNormals();
    const cl = new T.Mesh(geo, new T.MeshStandardMaterial({ map: clothTex(o.c || CP.COL.hero, o.emblem || 'star'), side: T.DoubleSide, roughness: 0.8 })); cl.position.y = h - ht / 2 - pr * 2; g.add(cl); g.cloth = cl;
    if (o.pad !== false) g.add(CP.pad({ s: o.padS || 1, active: o.active }));
    return sh(g); };
  // obby checkpoint pad (Roblox SpawnLocation look): bevelled slab, glowing ring + respawn arrow decal on top
  const padTex = (active) => once('pad' + active, () => { const S = 512, cv = cnv(S, S), q = cv.getContext('2d'), c = active ? '#38f08a' : '#a8b0b8';
    q.fillStyle = '#5a6068'; q.fillRect(0, 0, S, S); q.fillStyle = '#6a7078'; q.fillRect(16, 16, S - 32, S - 32);
    q.strokeStyle = c; q.lineWidth = 34; q.beginPath(); q.arc(S / 2, S / 2, S * 0.36, 0, 7); q.stroke();
    q.lineWidth = 30; q.lineCap = 'round'; q.beginPath(); q.arc(S / 2, S / 2, S * 0.2, -PI * 0.1, PI * 1.4); q.stroke(); q.fillStyle = c; q.beginPath(); q.moveTo(S / 2 + S * 0.27, S / 2 - S * 0.12); q.lineTo(S / 2 + S * 0.2, S / 2 + S * 0.06); q.lineTo(S / 2 + S * 0.08, S / 2 - S * 0.1); q.closePath(); q.fill();
    return tex(cv); });
  CP.pad = (o = {}) => { const g = new T.Group(), s = o.s || 1, act = o.active !== false;
    g.add(B(3.2 * s, 0.32, 3.2 * s, SM('#4a5058', 0.6), 0, 0.16, 0, 0.1));
    const top = new T.Mesh(new T.PlaneGeometry(3.0 * s, 3.0 * s), new T.MeshStandardMaterial({ map: padTex(act), emissiveMap: padTex(act), emissive: act ? '#38f08a' : '#000', emissiveIntensity: act ? 1.6 : 0, roughness: 0.5 })); top.rotation.x = -PI / 2; top.position.y = 0.325; g.add(top);
    g.position.x = o.x || 0; if (act && o.light !== false) { const L = new T.PointLight('#38f08a', 6 * s, 6 * s, 2); L.position.y = 1.0; g.add(L); }
    return g; };
  // the whole checkpoint: pad + flag on its back-left corner
  CP.checkpoint = (o = {}) => { const g = new T.Group(); g.add(CP.pad({ s: o.s || 1, active: o.active })); const f = CP.flag(Object.assign({ pad: false }, o)); f.position.set(-1.25 * (o.s || 1), 0.32, -1.25 * (o.s || 1)); g.add(f); g.flag = f; return g; };
  // ---------- POOF ----------
  const starTex = () => once('star', () => { const S = 128, cv = cnv(S, S), q = cv.getContext('2d'); const gr = q.createRadialGradient(64, 64, 2, 64, 64, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = gr; q.fillRect(0, 0, S, S);
    q.fillStyle = '#fff'; q.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2, r = i % 2 ? 9 : 62; q.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } q.closePath(); q.fill(); return tex(cv); });
  // o: { r (radius), n, seed, phase 0..1 (0 = burst start, 1 = dissolving), tint, stars }
  CP.poof = (o = {}) => { const g = new T.Group(), r = o.r || 1.6, R = rng(o.seed || 7), ph = o.phase ?? 0.35, n = o.n || 16;
    const pm = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#dfe8ff', emissiveIntensity: o.glow ?? 0.35, transparent: true, opacity: 1 - Math.max(0, ph - 0.55) * 2, flatShading: true });
    for (let i = 0; i < n; i++) { const a = R() * PI * 2, e = (R() - 0.3) * 1.2, d = r * (0.35 + R() * 0.65) * (0.6 + ph * 0.8), s = r * (0.28 + R() * 0.3) * (1.1 - ph * 0.4);
      const m = new T.Mesh(new T.IcosahedronGeometry(1, 1), pm); m.position.set(Math.cos(a) * d * Math.cos(e), r * 0.6 + Math.sin(e) * d, Math.sin(a) * d * Math.cos(e)); m.scale.setScalar(s); m.rotation.set(R() * 3, R() * 3, 0); g.add(m); }
    const core = new T.Mesh(new T.IcosahedronGeometry(r * 0.62 * (1.1 - ph * 0.5), 2), pm); core.position.y = r * 0.6; g.add(core);
    // shock ring on the ground + sparkle stars
    const ring = new T.Mesh(new T.RingGeometry(r * (0.9 + ph * 1.2), r * (1.05 + ph * 1.3), 48), new T.MeshBasicMaterial({ color: o.tint || '#ffffff', transparent: true, opacity: 0.85 - ph * 0.6, side: T.DoubleSide, depthWrite: false, toneMapped: false })); ring.rotation.x = -PI / 2; ring.position.y = 0.06; g.add(ring);
    const sc = new T.Color(o.tint || '#fff6c0').multiplyScalar(2.5);
    for (let i = 0; i < (o.stars ?? 9); i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: starTex(), color: sc, transparent: true, depthWrite: false, toneMapped: false, blending: T.AdditiveBlending })); const a = R() * PI * 2, d = r * (1.0 + ph * 1.4) * (0.7 + R() * 0.5);
      s.position.set(Math.cos(a) * d, r * (0.3 + R() * 1.4), Math.sin(a) * d); s.scale.setScalar(r * (0.35 + R() * 0.45)); g.add(s); }
    g.userData = { pm, ring, r }; return g; };
  // animate a cached poof: ph 0 (burst) -> 1 (gone)
  CP.poofSet = (g, ph) => { const k = 0.55 + ph * 0.9; g.scale.setScalar(k); const U = g.userData; U.pm.opacity = ph < 0.55 ? 1 : Math.max(0, 1 - (ph - 0.55) / 0.45); U.ring.material.opacity = Math.max(0, 0.9 - ph); g.children.forEach((c) => { if (c.isSprite) c.material.opacity = Math.max(0, 1 - ph * 1.1); }); g.visible = ph < 1; return g; };
  // pop-in at a checkpoint: vertical spawn beam + ground ring + a few puffs low (character placed by the caller, squashed)
  const beamTex = () => once('beam', () => { const cv = cnv(8, 256), q = cv.getContext('2d'), gr = q.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0.95)'); q.fillStyle = gr; q.fillRect(0, 0, 8, 256); return tex(cv); });
  CP.popIn = (o = {}) => { const g = new T.Group(), r = o.r || 1.5, c = new T.Color(o.c || '#38f08a').multiplyScalar(1.6);
    const bm = new T.MeshBasicMaterial({ map: beamTex(), color: c, transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false });
    const beam = new T.Mesh(new T.CylinderGeometry(r, r * 1.05, o.h || 9, 32, 1, true), bm); beam.position.y = (o.h || 9) / 2; g.add(beam);
    const p = CP.poof({ r: r * 0.8, n: 10, seed: o.seed || 3, phase: 0.6, stars: 6, tint: o.c || '#a8ffd0' }); p.scale.y = 0.45; g.add(p);
    g.userData = { bm, p }; return g; };
  CP.popSet = (g, ph) => { g.userData.bm.opacity = Math.max(0, 1 - ph); g.userData.p.visible = ph < 0.7; g.scale.set(1, 0.4 + 0.6 * Math.min(1, ph * 3), 1); g.visible = ph < 1; return g; };
  // squash / stretch an actor root for the pop (k > 1 = tall)
  CP.squash = (a, k) => { const s = a.root.scale.x; a.root.scale.set(s / Math.sqrt(k), s * k, s / Math.sqrt(k)); };
  // drop an actor so its lowest point touches y (after a pose / rotation)
  CP.ground = (a, y = 0) => { a.root.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(a.root); a.root.position.y += y - bb.min.y; return a; };
  // ---------- ladders, ropes ----------
  CP.ladder = (len = 12, o = {}) => { const g = new T.Group(), m = o.wood ? ENV.mt(ENV.T.wood('#9a6a3a'), 1) : SM(o.c || '#c8ccd2', 0.3, 0.9), w = o.w || 1.4;
    [-1, 1].forEach((s) => g.add(B(0.16, len, 0.22, m, s * w / 2, len / 2, 0, 0.04))); for (let y = 0.6; y < len - 0.2; y += 0.8) { const r = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, w, 8), m); r.rotation.z = PI / 2; r.position.y = y; g.add(r); }
    if (o.red) g.children.slice(0, 2).forEach((c) => { c.material = SM('#c81e1e', 0.35, 0.3); }); return sh(g); };
  CP.rope = (pts, r = 0.09, c = '#c8a468') => { const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, r, 8), SM(c, 0.9)); m.castShadow = true; return m; };
  // stringed fair bunting between two points
  CP.bunting = (a, b, sag = 1.2, n = 16) => { const g = new T.Group(), cols = ['#e8202a', '#f2c94c', '#1f8ad8', '#38c060', '#f07ad0', '#ffffff']; const mid = a.clone().lerp(b, 0.5); mid.y -= sag; const cv = new T.QuadraticBezierCurve3(a, mid, b);
    g.add(new T.Mesh(new T.TubeGeometry(cv, 30, 0.03, 4), SM('#222', 0.6))); for (let i = 0; i < n; i++) { const p = cv.getPointAt((i + 0.5) / n), tg = cv.getTangentAt((i + 0.5) / n); const tri = new T.Mesh(new T.ConeGeometry(0.35, 0.8, 3), SM(cols[i % cols.length], 0.7, 0, { side: T.DoubleSide })); tri.scale.z = 0.08; tri.rotation.z = PI; tri.position.copy(p).add(V(0, -0.4, 0)); tri.rotation.y = Math.atan2(tg.x, tg.z) + PI / 2; g.add(tri); }
    return g; };
})();
