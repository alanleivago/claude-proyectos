// rbx-thursday PROPS: procedural Roblox-catalog-style props and R6 accessories. Every factory returns a THREE.Group.
// Attach spaces: head-local = R6 head centre at origin (radius 0.6, height 1.2, top y=0.6, face toward +z): av.head.add(p)
//                body-local = torso centre at origin (torso 2x2x1): av.body.add(p)
//                hand: PROPS.hold(av, p, 'L'|'R') puts p.userData.grip at the hand (arm block end).
'use strict';
const PROPS = {};
(function () {
  const { cnv, tex, pbr, rng, fbm, tnoise, rbox } = RBX;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  const SS = THREE.MathUtils.smoothstep, clamp = THREE.MathUtils.clamp;
  function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
  const rb = (w, h, d, r, mat, x, y, z, n = 8) => mesh(rbox(w, h, d, r, n), mat, x, y, z);
  const FONT_BLOCK = '"Arial Black", "Helvetica Neue", Impact, sans-serif', FONT_HAND = '"Marker Felt", "Chalkboard SE", "Comic Sans MS", sans-serif';

  // ---------- environment for metals (dim neutral studio, a couple of soft boxes) ----------
  const METALS = [];
  function envTex() {
    return once('env', () => {
      const c = cnv(512, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, '#c4ccd8'); gr.addColorStop(0.48, '#848c98'); gr.addColorStop(0.52, '#6a625a'); gr.addColorStop(1, '#46403a'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
      [[90, 70, 70, 30], [300, 60, 110, 26], [420, 95, 40, 40]].forEach(([x, y, w, h]) => { const rg = g.createRadialGradient(x, y, 2, x, y, w); rg.addColorStop(0, '#ffffff'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(x - w, y - h, 2 * w, 2 * h); });
      const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; return t;
    });
  }
  PROPS.setEnv = (k) => METALS.forEach((m) => { m.envMapIntensity = k * (m.userData.env || 1); });

  // ---------- generic textured surface (mottled colour + fine grain normal) ----------
  // o: {seed, rough, metal, env, mottle, period, grain, gh, bump, nscale, repeat, clearcoat, sheen, paint(g,hg,S), key}
  function surf(color, o = {}) {
    const key = 'surf|' + color + '|' + (o.key || '') + JSON.stringify(o);
    return once(key, () => {
      const S = o.size || 256, seed = o.seed || 7;
      const p = KIT.texPair(S, (g, hg) => {
        g.fillStyle = color; g.fillRect(0, 0, S, S); KIT.noiseOver(g, S, S, seed, o.mottle ?? 0.22, o.period || 6, 4);
        const n = tnoise(seed + 9, Math.max(4, Math.round(S / (o.grain || 3)))), m = fbm(seed + 4, 6, 3), im = hg.getImageData(0, 0, S, S);
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4, u = x / S, v = y / S; im.data[i] = im.data[i + 1] = im.data[i + 2] = clamp(128 + (n(u, v) - 0.5) * (o.gh ?? 70) + (m(u, v) - 0.5) * 70, 0, 255); }
        hg.putImageData(im, 0, 0);
        if (o.paint) o.paint(g, hg, S);
      }, { h: o.h });
      const physical = !!(o.clearcoat || o.sheen || o.transmission);
      const m = pbr(p.c, p.h, { rough: o.rough ?? 0.7, bump: o.bump ?? 2, nscale: o.nscale ?? 0.5, repeat: o.repeat, physical, sheen: o.sheen, sheenColor: o.sheenColor });
      if (o.clearcoat) { m.clearcoat = o.clearcoat; m.clearcoatRoughness = o.ccRough ?? 0.25; }
      if (o.metal) { m.metalness = o.metal; m.envMap = envTex(); m.userData.env = o.env ?? 1; m.envMapIntensity = m.userData.env; METALS.push(m); }
      if (o.side) m.side = o.side;
      return m;
    });
  }
  // a printed surface: draw(g, w, h) on a colour canvas; light paper/card grain in the normal
  function printed(w, h, draw, o = {}) {
    const p = KIT.texPair(w, (g, hg) => {
      draw(g, w, h, hg);
      if (o.grain !== false) KIT.noiseOver(g, w, h, o.seed || 3, o.mottle ?? 0.08, 8, 3);
      const n = tnoise((o.seed || 3) + 1, 64), im = hg.getImageData(0, 0, w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = clamp(im.data[i] + (n(x / w, y / h) - 0.5) * 40, 0, 255); }
      hg.putImageData(im, 0, 0);
    }, { h });
    const m = pbr(p.c, p.h, { rough: o.rough ?? 0.6, bump: o.bump ?? 1.5, nscale: 0.4, physical: !!o.clearcoat });
    if (o.clearcoat) { m.clearcoat = o.clearcoat; m.clearcoatRoughness = 0.3; }
    if (o.transparent) { m.transparent = true; m.alphaTest = 0.5; }
    return m;
  }
  const font = (px, f = FONT_BLOCK, w = '900') => `${w} ${px}px ${f}`;
  function label(g, s, x, y, px, fill, o = {}) {
    g.save(); g.font = font(px, o.font, o.weight); g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
    let sx = 1; if (o.maxW) { const w = g.measureText(s).width; if (w > o.maxW) sx = o.maxW / w; }
    g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(sx, 1);
    if (o.stroke) { g.lineJoin = 'round'; g.strokeStyle = o.stroke; g.lineWidth = o.sw || px * 0.18; g.strokeText(s, 0, 0); }
    if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, px * 0.05, px * 0.07); }
    g.fillStyle = fill; g.fillText(s, 0, 0); g.restore();
  }
  function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  // tapered tube along a curve: rad(t) for t in 0..1
  function taperTube(curve, segs, radial, r0, rad, mat) {
    const geo = new THREE.TubeGeometry(curve, segs, r0, radial, false), p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) { const t = i / segs, c = curve.getPointAt(t), k = rad(t) / r0; for (let j = 0; j <= radial; j++) { const vi = i * (radial + 1) + j; v.fromBufferAttribute(p, vi).sub(c).multiplyScalar(k).add(c); p.setXYZ(vi, v.x, v.y, v.z); } }
    geo.computeVertexNormals(); return mesh(geo, mat);
  }
  const curve = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => V3(...p)));
  const lathe = (pts, mat, seg = 48) => mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat);

  // ---------- R6 head profile (head-local) ----------
  const HR = 0.6, HB = 0.24, HH = 0.6;
  const headR = (y) => { const a = Math.abs(y); if (a <= HH - HB) return HR; if (a >= HH) return 0; const d = a - (HH - HB); return HR - HB + Math.sqrt(HB * HB - d * d); };
  PROPS.headR = headR;
  // hold a prop in an avatar hand (arm hanging: the hand block end is at y=-2 in arm-pivot space)
  PROPS.hold = function (av, p, side = 'R') {
    const arm = side === 'L' ? av.armL : av.armR, gp = p.userData.grip || V3(0, 0, 0);
    arm.add(p); p.position.set(0, -2.0, 0).sub(gp.clone().applyEuler(p.rotation)); return p;
  };

  // =====================================================================================
  // CAT — blocky grey tabby, ~2.3 long. o.pose 'sit'|'stand'. userData.setFace('stare'|'blink'|'neutral')
  // =====================================================================================
  function tabbyMat(base, seed, stripe, rep = 1) {
    return once('tabby' + base + seed + rep, () => {
      const p = RBX.plush(512, 512, base, seed), g = p.c.getContext('2d'), hg = p.h.getContext('2d'), r = rng(seed + 3);
      if (stripe) for (let k = 0; k < 7; k++) {
        const x0 = (k + 0.3) * 512 / 7, w = 16 + r() * 14;
        g.fillStyle = 'rgba(38,40,46,0.62)'; hg.fillStyle = 'rgba(0,0,0,0.25)';
        [g, hg].forEach((c) => { c.beginPath(); for (let y = 0; y <= 512; y += 16) c.lineTo(x0 + Math.sin(y * 0.02 + k) * 14 - w / 2, y); for (let y = 512; y >= 0; y -= 16) c.lineTo(x0 + Math.sin(y * 0.02 + k) * 14 + w / 2 + Math.sin(y * 0.05) * 5, y); c.closePath(); c.fill(); });
      }
      return pbr(p.c, p.h, { physical: true, rough: 0.95, bump: 2.5, nscale: 0.55, sheen: 1, sheenColor: '#e8eaf0', repeat: [rep, rep] });
    });
  }
  const CAT_FACES = {
    stare(g) {
      [[150, 180], [362, 180]].forEach(([x, y]) => {
        g.fillStyle = '#c9e24a'; g.strokeStyle = '#1b1b1b'; g.lineWidth = 10; g.beginPath(); g.arc(x, y, 82, 0, 7); g.fill(); g.stroke();
        const rg = g.createRadialGradient(x, y, 10, x, y, 80); rg.addColorStop(0, 'rgba(255,170,30,0.65)'); rg.addColorStop(1, 'rgba(255,170,30,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 78, 0, 7); g.fill();
        g.fillStyle = '#0d0d0d'; g.beginPath(); g.arc(x, y, 54, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 22, y - 24, 17, 0, 7); g.fill(); g.beginPath(); g.arc(x + 20, y + 20, 7, 0, 7); g.fill();
      });
    },
    neutral(g) {
      [[150, 186], [362, 186]].forEach(([x, y]) => {
        g.save(); g.beginPath(); g.ellipse(x, y, 74, 56, 0, 0, 7); g.clip();
        g.fillStyle = '#c9e24a'; g.fillRect(x - 80, y - 60, 160, 120);
        g.fillStyle = '#0d0d0d'; g.beginPath(); g.ellipse(x, y, 13, 48, 0, 0, 7); g.fill();
        g.fillStyle = '#7d7f86'; g.fillRect(x - 80, y - 62, 160, 34); g.restore();   // heavy lid
        g.strokeStyle = '#1b1b1b'; g.lineWidth = 10; g.beginPath(); g.ellipse(x, y, 74, 56, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x - 72, y - 28); g.lineTo(x + 72, y - 28); g.stroke();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 26, y - 6, 9, 0, 7); g.fill();
      });
    },
    blink(g) {
      g.strokeStyle = '#1b1b1b'; g.lineWidth = 14; g.lineCap = 'round';
      [[150, 186], [362, 186]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x - 66, y - 6); g.quadraticCurveTo(x, y + 44, x + 66, y - 6); g.stroke(); });
    },
  };
  function catFaceTex(name) {
    return once('catface' + name, () => {
      const c = cnv(512, 384), g = c.getContext('2d'); (CAT_FACES[name] || CAT_FACES.neutral)(g);
      g.fillStyle = '#f08aa0'; g.strokeStyle = '#1b1b1b'; g.lineWidth = 6; g.beginPath(); g.moveTo(228, 268); g.lineTo(284, 268); g.lineTo(256, 296); g.closePath(); g.fill(); g.stroke();
      g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(256, 296); g.lineTo(256, 312); g.quadraticCurveTo(236, 336, 216, 316); g.moveTo(256, 312); g.quadraticCurveTo(276, 336, 296, 316); g.stroke();
      g.fillStyle = 'rgba(240,120,140,0.35)'; [[96, 300], [416, 300]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 34, 18, 0, 0, 7); g.fill(); });
      return tex(c);
    });
  }
  PROPS.cat = function (o = {}) {
    const pose = o.pose || 'sit', g = new THREE.Group(); g.name = 'cat';
    const fur = tabbyMat('#8b8e95', 41, true), furPlain = tabbyMat('#8b8e95', 42, false), white = tabbyMat('#ecebe6', 43, false);
    const pink = new THREE.MeshStandardMaterial({ color: '#e99aa8', roughness: 0.8 });
    const head = new THREE.Group(); g.add(head);
    head.add(rb(0.98, 0.8, 0.74, 0.16, fur, 0, 0, 0, 10));
    const earG = new THREE.ConeGeometry(0.21, 0.36, 4); earG.rotateY(Math.PI / 4);
    [-1, 1].forEach((s) => { const e = mesh(earG, furPlain, 0.3 * s, 0.5, -0.02); e.rotation.z = -0.28 * s; e.scale.z = 0.55; head.add(e);
      const ei = mesh(earG, pink, 0.3 * s, 0.48, 0.05); ei.rotation.z = -0.28 * s; ei.scale.set(0.62, 0.72, 0.25); head.add(ei); });
    const faceMat = new THREE.MeshStandardMaterial({ map: catFaceTex(o.face || 'stare'), transparent: true, roughness: 0.35, polygonOffset: true, polygonOffsetFactor: -2 });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), faceMat); face.position.set(0, -0.02, 0.3705); head.add(face);
    const whisk = new THREE.MeshStandardMaterial({ color: '#f4f4f0', roughness: 0.5 }), wg = new THREE.CylinderGeometry(0.008, 0.006, 0.42, 5); wg.rotateZ(Math.PI / 2);
    [-1, 1].forEach((s) => [-0.05, 0.02, 0.09].forEach((dy, i) => { const w = mesh(wg, whisk, s * 0.42, -0.2 + dy * 0.6, 0.42); w.rotation.z = s * (dy * 2.2); w.rotation.y = -s * 0.25; head.add(w); }));
    const leg = (x, y, z, h) => { const L = new THREE.Group(); L.position.set(x, y, z); L.add(rb(0.26, h, 0.26, 0.1, furPlain, 0, -h / 2 + 0.06, 0)); L.add(rb(0.29, 0.14, 0.33, 0.06, white, 0, -h + 0.07, 0.02)); g.add(L); return L; };
    let body, tailPts;
    if (pose === 'stand') {
      body = rb(0.9, 0.78, 1.36, 0.22, fur, 0, 0.88, 0, 10); g.add(body); body.add(rb(0.6, 0.1, 1.0, 0.05, white, 0, -0.36, 0.05));
      head.position.set(0, 1.42, 0.82); [[-0.26, 0.42], [0.26, 0.42], [-0.26, -0.44], [0.26, -0.44]].forEach(([x, z]) => leg(x, 0.62, z, 0.62));
      tailPts = [[0, 1.0, -0.64], [0, 1.25, -0.92], [0, 1.75, -1.0], [0.05, 2.08, -0.84], [0.1, 2.12, -0.66]];
    } else {
      body = rb(0.86, 0.76, 1.12, 0.24, fur, 0, 0.72, -0.08, 10); body.rotation.x = -0.62; g.add(body);
      [-1, 1].forEach((s) => { g.add(rb(0.3, 0.5, 0.66, 0.15, fur, 0.38 * s, 0.26, -0.3)); g.add(rb(0.3, 0.13, 0.36, 0.06, white, 0.36 * s, 0.065, 0.06)); });
      head.position.set(0, 1.52, 0.42); [[-0.2, 0.32], [0.2, 0.32]].forEach(([x, z]) => leg(x, 0.92, z, 0.92));
      tailPts = [[0, 0.24, -0.62], [0.42, 0.09, -0.62], [0.66, 0.09, -0.12], [0.6, 0.09, 0.38], [0.36, 0.1, 0.6]];
    }
    const tail = taperTube(curve(tailPts), 40, 12, 0.11, (t) => 0.11 - 0.025 * t, fur); g.add(tail);
    const tip = mesh(new THREE.SphereGeometry(0.087, 16, 12), tabbyMat('#3f4148', 44, false)); tip.position.copy(curve(tailPts).getPointAt(1)); g.add(tip);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = m !== face; m.receiveShadow = true; } });
    g.userData = { head, body, tail, faceMat, setFace(n) { faceMat.map = catFaceTex(n); faceMat.needsUpdate = true; } };
    return g;
  };

  // =====================================================================================
  // CAPS (head-local)
  // =====================================================================================
  function crownMat(color, seed, seams) {
    return once('crown' + color + seed + seams, () => { const f = RBX.fleece(512, 256, color, seed), g = f.g, hg = f.hg;
      if (seams) for (let k = 0; k < seams; k++) { const x = (k / seams) * 512; g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x - 2, 0, 4, 256); hg.fillStyle = '#000'; hg.fillRect(x - 3, 0, 6, 256);
        g.setLineDash([6, 6]); g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 2; [-9, 9].forEach((d) => { g.beginPath(); g.moveTo(x + d, 0); g.lineTo(x + d, 256); g.stroke(); }); g.setLineDash([]); }
      return pbr(f.c, f.h, { rough: 0.85, bump: 2, nscale: 0.5 }); });
  }
  // visor: half-ring from the crown, sticking out `len` in +z, hinge at y, tilt down
  function visor(y, r0, len, spread, mat, tilt, droop = 0.12) {
    const s = new THREE.Shape(), N = 24;
    for (let i = 0; i <= N; i++) { const a = -spread + (2 * spread * i) / N; s.lineTo(r0 * Math.sin(a), r0 * Math.cos(a) + len * Math.pow(Math.cos((a / spread) * Math.PI / 2), 0.7)); }
    for (let i = N; i >= 0; i--) { const a = -spread + (2 * spread * i) / N; s.lineTo((r0 - 0.06) * Math.sin(a), (r0 - 0.06) * Math.cos(a)); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 4 });
    geo.rotateX(Math.PI / 2); const v = new THREE.Group(); v.position.y = y; v.rotation.x = tilt; const m = mesh(geo, mat); m.position.y = 0.02; v.add(m);
    // gentle downward curve across the brim
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) - droop * Math.pow(Math.abs(p.getX(i)) / 0.65, 2) * SS(p.getZ(i), 0.4, 0.9)); geo.computeVertexNormals();
    return v;
  }
  function badgeTex(draw, S = 256) { return once('badge' + draw.name + S, () => { const c = cnv(S, S), g = c.getContext('2d'); draw(g, S); return tex(c); }); }
  PROPS.mailCap = function () {
    const g = new THREE.Group(); g.name = 'mailCap'; g.userData.attach = 'head';
    const navy = crownMat('#22325e', 51, 0), black = surf('#121318', { rough: 0.25, clearcoat: 1, mottle: 0.1 });
    g.add(lathe([[0.638, 0.2], [0.643, 0.34], [0.655, 0.5], [0.68, 0.74], [0.69, 0.8], [0.66, 0.84], [0.5, 0.86], [0, 0.86]], navy));
    g.add(lathe([[0.652, 0.2], [0.658, 0.24], [0.66, 0.36], [0.656, 0.4]], surf('#1a1a1e', { rough: 0.5, paint(gg, hg, S) { for (let x = 0; x < S; x += 10) { gg.fillStyle = 'rgba(255,255,255,0.08)'; gg.fillRect(x, 0, 4, S); hg.fillStyle = '#fff'; hg.fillRect(x, 0, 4, S); } } })));
    const braid = mesh(new THREE.TorusGeometry(0.664, 0.018, 8, 64), surf('#d9a93a', { metal: 0.85, rough: 0.35 })); braid.rotation.x = Math.PI / 2; braid.position.y = 0.4; g.add(braid);
    g.add(visor(0.24, 0.66, 0.3, 1.1, black, 0.16, 0.05));
    const bm = new THREE.MeshStandardMaterial({ map: badgeTex(function mailBadge(c, S) {
      c.fillStyle = '#e1b43c'; KIT.star(c, S / 2, S / 2, S * 0.47, 8, 0.82); c.fill(); c.strokeStyle = '#7a5a12'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#f7f1e2'; c.fillRect(S * 0.24, S * 0.34, S * 0.52, S * 0.34); c.strokeStyle = '#22325e'; c.lineWidth = 9; c.strokeRect(S * 0.24, S * 0.34, S * 0.52, S * 0.34);
      c.beginPath(); c.moveTo(S * 0.24, S * 0.34); c.lineTo(S * 0.5, S * 0.54); c.lineTo(S * 0.76, S * 0.34); c.stroke();
      label(c, 'MAIL', S / 2, S * 0.82, 38, '#22325e'); }), transparent: true, alphaTest: 0.5, metalness: 0.6, roughness: 0.35, envMap: envTex() });
    const b = mesh(new THREE.PlaneGeometry(0.26, 0.26), bm, 0, 0.6, 0.668); b.rotation.x = -0.05; g.add(b);
    return g;
  };
  function ballCap(color, logo, seed = 61) {
    const g = new THREE.Group(); g.userData.attach = 'head';
    const prof = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI / 2, y = 0.16 + Math.sin(a) * 0.64; prof.push([Math.cos(a) * 0.705, y]); }
    prof.unshift([0.672, 0.14]);
    const cm = crownMat(color, seed, 6); g.add(lathe(prof, cm, 64));
    const btn = mesh(new THREE.SphereGeometry(0.07, 16, 10), cm, 0, 0.795, 0); btn.scale.y = 0.55; g.add(btn);
    const brimMat = surf(color, { rough: 0.75, mottle: 0.15, paint(c, hg, S) { c.setLineDash([5, 5]); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(0, 40 + k * 14); c.lineTo(S, 40 + k * 14); c.stroke(); } c.setLineDash([]); }, key: 'brim' });
    g.add(visor(0.2, 0.695, 0.6, 1.1, brimMat, -0.04));
    if (logo) { const m = new THREE.MeshStandardMaterial({ map: badgeTex(logo), transparent: true, alphaTest: 0.5, roughness: 0.7 });
      const geo = new THREE.CylinderGeometry(0.712, 0.712, 0.32, 24, 1, true, -0.38, 0.76); geo.rotateY(0); const p = mesh(geo, m, 0, 0.42, 0); g.add(p);
      const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i)); }
    return g;
  }
  PROPS.pizzaCap = function () {
    const g = ballCap('#c8262c', function pizzaLogo(c, S) {
      c.fillStyle = '#fff6e6'; c.beginPath(); c.arc(S / 2, S / 2, S * 0.46, 0, 7); c.fill(); c.strokeStyle = '#1c1c1c'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#f1b43a'; c.beginPath(); c.moveTo(S * 0.28, S * 0.3); c.lineTo(S * 0.72, S * 0.3); c.lineTo(S * 0.5, S * 0.78); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#c8572a'; c.fillRect(S * 0.27, S * 0.26, S * 0.46, S * 0.08);
      c.fillStyle = '#c8262c'; [[0.42, 0.42], [0.56, 0.44], [0.5, 0.58]].forEach(([x, y]) => { c.beginPath(); c.arc(S * x, S * y, S * 0.045, 0, 7); c.fill(); });
    });
    g.name = 'pizzaCap'; return g;
  };

  // =====================================================================================
  // CEREAL BOX worn over the head (head-local): 1.42 x 1.92 x 1.38, bottom at y=-0.66 (rests on the shoulders)
  // =====================================================================================
  PROPS.cerealBox = function () {
    const g = new THREE.Group(); g.name = 'cerealBox'; g.userData.attach = 'head';
    const W = 1.42, H = 1.92, D = 1.38, y0 = -0.66, EY = 0.03;
    const front = printed(512, 692, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#ffcc1f'); bg.addColorStop(1, '#ff8a12'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
      c.save(); c.translate(w / 2, 440); for (let k = 0; k < 24; k++) { c.rotate(Math.PI / 12); c.fillStyle = k % 2 ? 'rgba(255,255,255,0.22)' : 'rgba(255,240,120,0.0)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, -700); c.lineTo(60, -700); c.closePath(); c.fill(); } c.restore();
      // brand
      c.fillStyle = '#1d4fc4'; rrect(c, 22, 22, w - 44, 150, 30); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.stroke();
      label(c, 'CRUNCHO', w / 2, 100, 104, '#ff3b2f', { stroke: '#fff3a0', sw: 16, shadow: '#0d2a70', maxW: w - 80, rot: -0.04 });
      label(c, 'FROSTED CRUNCH O\'S', w / 2, 200, 30, '#7a1d00', { maxW: w - 120 });
      // mascot: a round grinning tiger-ish critter, his eyes are the eye holes
      const mx = w / 2, my = 440;
      c.fillStyle = '#f07a1a'; c.strokeStyle = '#2a1204'; c.lineWidth = 9;
      [[-1], [1]].forEach(([s]) => { c.beginPath(); c.arc(mx + s * 110, my - 112, 44, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#ffd3a3'; c.beginPath(); c.arc(mx + s * 110, my - 112, 22, 0, 7); c.fill(); c.fillStyle = '#f07a1a'; });
      c.beginPath(); c.ellipse(mx, my, 160, 145, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#2a1204'; [[-150, -20], [-150, 30], [150, -20], [150, 30], [-20, -140], [20, -140], [0, -128]].forEach(([dx, dy]) => { c.beginPath(); c.ellipse(mx + dx * 0.92, my + dy, dx ? 22 : 8, 9, dx > 0 ? 0.3 : -0.3, 0, 7); c.fill(); });
      c.fillStyle = '#fff1dc'; c.beginPath(); c.ellipse(mx, my + 70, 110, 66, 0, 0, 7); c.fill();
      c.fillStyle = '#e25a5a'; c.beginPath(); c.ellipse(mx, my + 30, 24, 16, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#5e0c10'; c.beginPath(); c.moveTo(mx - 86, my + 58); c.quadraticCurveTo(mx, my + 160, mx + 86, my + 58); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(mx - 60, my + 60, 120, 18);
      // eyebrows over the holes
      c.lineWidth = 12; c.lineCap = 'round'; [[-1], [1]].forEach(([s]) => { c.beginPath(); c.moveTo(mx + s * 92, my - 66); c.lineTo(mx + s * 30, my - 50); c.stroke(); });
      // bowl
      c.fillStyle = '#2f7de0'; c.beginPath(); c.moveTo(70, 600); c.quadraticCurveTo(w / 2, 720, w - 70, 600); c.closePath(); c.fill(); c.strokeStyle = '#0d2a70'; c.lineWidth = 7; c.stroke();
      for (let k = 0; k < 9; k++) { const x = 100 + k * 40, y = 596 - (k % 3) * 12; c.strokeStyle = ['#ffd23a', '#ff6b3a', '#ffe9a8'][k % 3]; c.lineWidth = 12; c.beginPath(); c.arc(x, y, 15, 0, 7); c.stroke(); }
      // starburst
      c.fillStyle = '#ff2d55'; KIT.star(c, w - 78, 250, 62, 12, 0.78); c.fill(); label(c, 'NEW!', w - 78, 242, 30, '#fff', { rot: 0.2 }); label(c, 'EXTRA', w - 78, 270, 15, '#fff', { rot: 0.2 });
      // eye holes: dark ragged ellipses
      const hy = ((y0 + H - EY) / H) * h, hx = (0.15 / W) * w;
      [-1, 1].forEach((s) => { const x = mx + s * hx, r = rng(9 + s); c.fillStyle = '#0b0705'; c.beginPath(); for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2, k = 1 + (r() - 0.5) * 0.25; c.lineTo(x + Math.cos(a) * 30 * k, hy + Math.sin(a) * 22 * k); } c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,240,210,0.8)'; c.lineWidth = 3; c.stroke(); });
    }, { rough: 0.45, clearcoat: 0.4, seed: 71 });
    const side = printed(512, 692, (c, w, h) => {
      c.fillStyle = '#ffb21a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d4fc4'; c.fillRect(0, 0, w, 120); label(c, 'CRUNCHO', w / 2, 62, 74, '#ffe36a', { maxW: w - 60 });
      c.fillStyle = '#fff'; rrect(c, 50, 170, w - 100, 420, 16); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 5; c.stroke(); label(c, 'Nutrition Facts', w / 2, 210, 34, '#111', { maxW: w - 140 });
      for (let k = 0; k < 9; k++) { c.fillStyle = '#111'; c.fillRect(70, 250 + k * 36, w - 140, 3); label(c, ['Crunch', 'Sugar', 'Fun', 'Calcium', 'Vitamin O', 'Iron', 'Joy', 'Fiber', 'Stars'][k], 80, 270 + k * 36, 20, '#111', { align: 'left', font: 'Arial', weight: '700' }); label(c, `${(k * 37) % 100}%`, w - 80, 270 + k * 36, 20, '#111', { align: 'right', font: 'Arial', weight: '700' }); }
    }, { rough: 0.5, clearcoat: 0.3, seed: 72 });
    const top = printed(256, 256, (c, w, h) => { c.fillStyle = '#ffb21a'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(120,60,0,0.6)'; c.fillRect(0, h / 2 - 2, w, 4); label(c, 'OPEN HERE', w / 2, h * 0.3, 26, '#1d4fc4'); }, { seed: 73 });
    const kraft = surf('#c09a6a', { rough: 0.9, mottle: 0.25, key: 'kraft' });
    const box = mesh(rbox(W, H, D, 0.025, 8), [side, side, top, kraft, front, side]); box.position.y = y0 + H / 2; g.add(box);
    // little dents/creases on the corners
    return g;
  };

  // =====================================================================================
  // MAIL BAG (body-local when worn: strap over the left shoulder, bag on the front-right hip)
  // =====================================================================================
  function leather(color, seed) { return surf(color, { seed, rough: 0.55, mottle: 0.35, period: 5, gh: 50, bump: 3, nscale: 0.7, clearcoat: 0.25, ccRough: 0.5 }); }
  function envelopeMat(seed, tint) {
    return printed(256, 180, (c, w, h) => { const r = rng(seed); c.fillStyle = tint; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(w / 2, h * 0.55); c.lineTo(w, 0); c.stroke();
      c.fillStyle = ['#d23b3b', '#2f6fd1', '#3aa04a'][seed % 3]; c.fillRect(w - 62, 14, 44, 52); c.strokeStyle = '#fff'; c.setLineDash([4, 3]); c.strokeRect(w - 62, 14, 44, 52); c.setLineDash([]);
      c.strokeStyle = '#3a3a5a'; c.lineWidth = 4; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(70, 100 + k * 22); for (let x = 70; x < 70 + 90 + r() * 60; x += 8) c.lineTo(x, 100 + k * 22 + Math.sin(x * 0.5 + k) * 3); c.stroke(); } }, { seed, rough: 0.8 });
  }
  PROPS.mailBag = function (o = {}) {
    const worn = o.worn !== false, g = new THREE.Group(); g.name = 'mailBag'; g.userData.attach = worn ? 'body' : 'free';
    const brown = leather('#6e4123', 81), dark = leather('#4a2a15', 82), brass = surf('#d2a54a', { metal: 0.9, rough: 0.3 });
    const bag = new THREE.Group(); g.add(bag);
    const flapF = printed(256, 192, (c, w, h) => { c.fillStyle = '#4a2a15'; c.fillRect(0, 0, w, h); KIT.noiseOver(c, w, h, 83, 0.35, 5, 4);
      c.setLineDash([7, 6]); c.strokeStyle = '#e8c48a'; c.lineWidth = 3; rrect(c, 10, 10, w - 20, h - 20, 18); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#e8c48a'; c.fillRect(w / 2 - 34, 46, 68, 44); c.strokeStyle = '#4a2a15'; c.lineWidth = 6; c.beginPath(); c.moveTo(w / 2 - 34, 46); c.lineTo(w / 2, 72); c.lineTo(w / 2 + 34, 46); c.stroke();
      label(c, 'MAIL', w / 2, 128, 40, '#e8c48a'); }, { rough: 0.5, clearcoat: 0.3, bump: 2 });
    bag.add(rb(1.0, 0.78, 0.3, 0.07, brown, 0, 0, 0));
    const flap = mesh(rbox(1.04, 0.52, 0.06, 0.03, 8), [dark, dark, dark, dark, flapF, dark], 0, 0.15, 0.17); bag.add(flap);
    bag.add(rb(1.04, 0.06, 0.34, 0.03, dark, 0, 0.41, 0));
    bag.add(rb(0.1, 0.24, 0.03, 0.015, dark, 0, -0.16, 0.2)); bag.add(rb(0.13, 0.1, 0.03, 0.02, brass, 0, -0.18, 0.215));
    const letters = [[-0.28, 0.12, '#f4ecd8'], [0.0, 0.22, '#e8f0ff'], [0.26, 0.08, '#fff3e0'], [0.12, 0.16, '#f6e3e3']];
    letters.forEach(([x, dy, tint], i) => { const e = mesh(new THREE.BoxGeometry(0.42, 0.3, 0.012), [tint, tint, tint, tint, envelopeMat(91 + i, tint), envelopeMat(91 + i, tint)].map((m) => (typeof m === 'string' ? new THREE.MeshStandardMaterial({ color: m, roughness: 0.85 }) : m)), x, 0.42 + dy, -0.05 + i * 0.02);
      e.rotation.z = (i - 1.5) * 0.18; e.rotation.x = -0.1; bag.add(e); });
    if (worn) {
      bag.position.set(-0.52, -0.62, 0.68); bag.rotation.z = 0.08;
      const pts = [[-0.98, -0.3, 0.63], [-0.6, 0.15, 0.56], [0.2, 0.75, 0.56], [0.62, 1.0, 0.4], [0.72, 1.06, 0], [0.62, 1.0, -0.4], [0.1, 0.5, -0.56], [-0.6, -0.1, -0.56], [-1.02, -0.4, -0.2], [-1.0, -0.42, 0.45]];
      g.add(taperTube(curve(pts), 120, 6, 0.055, () => 0.055, dark));
      const buck = rb(0.16, 0.12, 0.05, 0.02, brass, 0, 0, 0); buck.position.copy(curve(pts).getPointAt(0.18)); buck.position.z += 0.03; buck.rotation.z = 0.75; g.add(buck);
    } else {
      bag.position.y = 0.39;
      g.add(taperTube(curve([[-0.5, 0.6, 0], [-0.4, 1.3, 0], [0, 1.6, 0], [0.4, 1.3, 0], [0.5, 0.6, 0]]), 60, 6, 0.05, () => 0.05, dark));
    }
    return g;
  };

  // =====================================================================================
  // PIZZA BOX (1.5 x 0.22 x 1.5, origin box centre). userData.steam = wisps group
  // =====================================================================================
  PROPS.pizzaBox = function (o = {}) {
    const g = new THREE.Group(); g.name = 'pizzaBox';
    const lid = printed(512, 512, (c, w, h) => {
      c.fillStyle = '#e9e1d0'; c.fillRect(0, 0, w, h); KIT.noiseOver(c, w, h, 101, 0.12, 6, 4);
      c.fillStyle = '#c8262c'; c.beginPath(); c.arc(w / 2, h / 2, 170, 0, 7); c.fill(); c.strokeStyle = '#7a1013'; c.lineWidth = 10; c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h / 2, 150, 0, 7); c.stroke();
      // chef moustache + slice
      c.fillStyle = '#f2b53a'; c.beginPath(); c.moveTo(w / 2 - 60, 170); c.lineTo(w / 2 + 60, 170); c.lineTo(w / 2, 300); c.closePath(); c.fill(); c.strokeStyle = '#5a2a00'; c.lineWidth = 6; c.stroke();
      c.fillStyle = '#c8572a'; rrect(c, w / 2 - 66, 156, 132, 24, 10); c.fill(); c.fillStyle = '#c8262c'; [[-18, 200], [20, 214], [0, 246]].forEach(([dx, y]) => { c.beginPath(); c.arc(w / 2 + dx, y, 11, 0, 7); c.fill(); });
      label(c, 'PIZZA', w / 2, 340, 72, '#fff', { shadow: '#5a0c0e' }); label(c, 'PRONTO', w / 2, 392, 34, '#ffe08a');
      c.setLineDash([10, 8]); c.strokeStyle = 'rgba(80,60,40,0.5)'; c.lineWidth = 3; c.strokeRect(24, 24, w - 48, h - 48); c.setLineDash([]);
      label(c, 'HOT & FRESH', w / 2, 470, 26, '#c8262c'); label(c, 'HOT & FRESH', w / 2, 44, 26, '#c8262c');
    }, { rough: 0.85, seed: 102 });
    const sideM = printed(512, 64, (c, w, h) => { c.fillStyle = '#d9cfba'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 9) { c.fillStyle = 'rgba(90,60,30,0.18)'; c.fillRect(x, 0, 4, h); } c.fillStyle = '#c8262c'; c.fillRect(0, h - 10, w, 6); }, { rough: 0.9, seed: 103 });
    const box = mesh(rbox(1.5, 0.22, 1.5, 0.02, 8), [sideM, sideM, lid, sideM, sideM, sideM]); g.add(box);
    const lidLine = mesh(new THREE.BoxGeometry(1.505, 0.012, 1.505), new THREE.MeshStandardMaterial({ color: '#8c7a5c', roughness: 1 }), 0, 0.03, 0); g.add(lidLine);
    if (o.steam !== false) {
      const sm = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.32, depthWrite: false });
      const st = new THREE.Group(); st.position.y = 0.11; g.add(st);
      [[-0.35, 0.1, 0], [0.05, -0.2, 1.5], [0.38, 0.25, 3]].forEach(([x, z, ph]) => { const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([x + Math.sin(t * 5 + ph) * 0.12, t * 1.1, z + Math.cos(t * 4 + ph) * 0.06]); }
        const w = taperTube(curve(pts), 40, 8, 0.06, (t) => 0.025 + 0.05 * Math.sin(Math.PI * t) * (1 - 0.5 * t), sm); w.castShadow = false; st.add(w); });
      g.userData.steam = st;
    }
    g.userData.grip = V3(0, 0, 0.75);
    return g;
  };

  // =====================================================================================
  // HOUSEHOLD PROPS
  // =====================================================================================
  // watering can: enamel teal metal, ~1.3 long, origin bottom centre, spout toward +z
  PROPS.wateringCan = function (color = '#2f8f86') {
    const g = new THREE.Group(); g.name = 'wateringCan';
    const enamel = surf(color, { rough: 0.35, clearcoat: 0.8, mottle: 0.18, metal: 0.25, env: 0.4, key: 'can', paint(c, hg, S) { const r = rng(5); for (let i = 0; i < 26; i++) { const x = r() * S, y = r() * S, s = 1.5 + r() * 3.5; c.fillStyle = 'rgba(160,110,70,0.45)'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); hg.fillStyle = '#000'; hg.beginPath(); hg.arc(x, y, s, 0, 7); hg.fill(); } } });
    const zinc = surf('#b9bfc6', { metal: 0.9, rough: 0.35, mottle: 0.4 });
    g.add(lathe([[0, 0], [0.36, 0], [0.4, 0.04], [0.42, 0.3], [0.4, 0.56], [0.33, 0.66], [0.2, 0.7], [0.18, 0.72], [0, 0.72]], enamel, 40));
    [0.08, 0.5].forEach((y) => { const b = mesh(new THREE.TorusGeometry(0.418 - (y > 0.3 ? 0.006 : 0), 0.018, 8, 48), zinc); b.rotation.x = Math.PI / 2; b.position.y = y; g.add(b); });
    const sp = curve([[0, 0.18, 0.36], [0, 0.42, 0.66], [0, 0.78, 0.96]]); g.add(taperTube(sp, 30, 14, 0.09, (t) => 0.09 - 0.045 * t, enamel));
    const rose = lathe([[0.04, 0], [0.11, 0.12], [0.12, 0.14], [0, 0.145]], zinc, 24); rose.position.copy(sp.getPointAt(1)); rose.quaternion.setFromUnitVectors(V3(0, 1, 0), sp.getTangentAt(1)); g.add(rose);
    const roseF = mesh(new THREE.CircleGeometry(0.115, 24), printed(64, 64, (c) => { c.fillStyle = '#9aa1a8'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#1a1a1a'; for (let y = 8; y < 64; y += 9) for (let x = 8; x < 64; x += 9) if ((x - 32) ** 2 + (y - 32) ** 2 < 26 * 26) { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } }, { grain: false }));
    roseF.position.copy(sp.getPointAt(1)).addScaledVector(sp.getTangentAt(1), 0.146); roseF.quaternion.setFromUnitVectors(V3(0, 0, 1), sp.getTangentAt(1)); g.add(roseF);
    g.add(taperTube(curve([[0, 0.66, 0.28], [0, 0.98, 0.12], [0, 0.98, -0.18], [0, 0.62, -0.36]]), 30, 10, 0.045, () => 0.045, enamel));
    g.add(taperTube(curve([[0, 0.52, -0.4], [0, 0.4, -0.56], [0, 0.18, -0.42]]), 20, 10, 0.04, () => 0.04, enamel));
    g.userData.grip = V3(0, 1.0, -0.03);
    return g;
  };

  // terracotta pot with a cactus or a fern; origin bottom centre
  const terracotta = () => surf('#b85b34', { seed: 111, rough: 0.92, mottle: 0.25, gh: 40, bump: 1.5, nscale: 0.5, key: 'terra' });
  function frondTex() {
    return once('frond', () => { const c = cnv(128, 512), g = c.getContext('2d');
      g.strokeStyle = '#3c6b22'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 512); g.lineTo(64, 0); g.stroke();
      for (let y = 470; y > 10; y -= 18) { const k = Math.sin((y / 512) * Math.PI) * 0.85 + 0.15, L = 58 * k; [-1, 1].forEach((s) => {
        const gr = g.createLinearGradient(64, y, 64 + s * L, y - 24); gr.addColorStop(0, '#4f8d2c'); gr.addColorStop(1, '#8fca4a'); g.fillStyle = gr;
        g.beginPath(); g.moveTo(64, y); g.quadraticCurveTo(64 + s * L * 0.5, y - 2, 64 + s * L, y - 24 * k); g.quadraticCurveTo(64 + s * L * 0.5, y - 16, 64, y - 12); g.closePath(); g.fill(); g.strokeStyle = 'rgba(30,60,15,0.6)'; g.lineWidth = 1.5; g.stroke(); }); }
      const t = tex(c); return t; });
  }
  PROPS.plantPot = function (kind = 'cactus', o = {}) {
    const g = new THREE.Group(); g.name = 'plantPot_' + kind; const s = o.size || 1;
    const pot = lathe([[0, 0], [0.3, 0], [0.33, 0.04], [0.4, 0.5], [0.46, 0.52], [0.47, 0.66], [0.43, 0.68], [0.4, 0.6], [0, 0.6]], terracotta(), 40); g.add(pot);
    const soil = mesh(new THREE.CircleGeometry(0.41, 32), surf('#3a2416', { rough: 1, mottle: 0.6, gh: 140, bump: 4, period: 12, key: 'soil' })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.62; g.add(soil);
    if (kind === 'cactus') {
      const cm = surf('#4a8f3e', { rough: 0.75, key: 'cactus', mottle: 0.3, gh: 40, paint(c, hg, S) { for (let k = 0; k < 10; k++) { const gr = c.createLinearGradient(k * S / 10, 0, (k + 1) * S / 10, 0); gr.addColorStop(0, 'rgba(20,50,15,0.35)'); gr.addColorStop(0.5, 'rgba(180,230,120,0.15)'); gr.addColorStop(1, 'rgba(20,50,15,0.35)'); c.fillStyle = gr; c.fillRect(k * S / 10, 0, S / 10, S); }
        const r = rng(3); for (let i = 0; i < 120; i++) { const x = (Math.floor(r() * 10) + 0.5) * S / 10, y = r() * S; c.strokeStyle = '#fbf6dc'; c.lineWidth = 2; c.beginPath(); for (let a = 0; a < 3; a++) { c.moveTo(x, y); c.lineTo(x + Math.cos(a * 2.1) * 7, y + Math.sin(a * 2.1) * 7); } c.stroke(); c.fillStyle = '#e8dcb0'; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); hg.fillStyle = '#fff'; hg.beginPath(); hg.arc(x, y, 4, 0, 7); hg.fill(); } } });
      const col = (r, h) => { const geo = new THREE.CapsuleGeometry(r, h, 8, 30), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(x, z), k = 1 + 0.09 * Math.cos(a * 10); p.setX(i, x * k); p.setZ(i, z * k); } geo.computeVertexNormals(); return mesh(geo, cm); };
      const main = col(0.2, 0.75); main.position.y = 1.05; g.add(main);
      [[-1, 0.95, 0.3], [1, 1.2, 0.25]].forEach(([sd, y, h]) => { const a = col(0.11, 0.22); a.rotation.z = sd * Math.PI / 2; a.position.set(sd * 0.3, y, 0); g.add(a); const b = col(0.11, h); b.position.set(sd * 0.42, y + h / 2 + 0.06, 0); g.add(b); });
      const pet = new THREE.MeshStandardMaterial({ color: '#ff5a9a', roughness: 0.5 }); for (let i = 0; i < 6; i++) { const p = mesh(new THREE.SphereGeometry(0.07, 10, 8), pet); const a = (i / 6) * Math.PI * 2; p.position.set(Math.cos(a) * 0.07, 1.65, Math.sin(a) * 0.07); p.scale.set(1, 0.5, 1.4); p.rotation.y = -a; g.add(p); }
      g.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffd23a' }), 0, 1.68, 0));
    } else {
      const fm = new THREE.MeshStandardMaterial({ map: frondTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 });
      const r = rng(17);
      for (let i = 0; i < 13; i++) {
        const L = 1.0 + r() * 0.5, geo = new THREE.PlaneGeometry(0.42, L, 1, 14), p = geo.attributes.position, up = 0.9 + r() * 0.5;
        for (let k = 0; k < p.count; k++) { const t = (p.getY(k) + L / 2) / L, x = p.getX(k); p.setXYZ(k, x * (0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, t * 1.3))), L * (up * t - 1.05 * t * t) + 0.04 * Math.abs(x), L * t * 0.75); }
        geo.computeVertexNormals(); const f = mesh(geo, fm, 0, 0.62, 0); f.rotation.y = (i / 13) * Math.PI * 2 + r() * 0.3; f.castShadow = true; g.add(f);
      }
    }
    g.scale.setScalar(s); return g;
  };

  // plate of chocolate-chip cookies, plate r 0.75, origin bottom centre
  PROPS.cookiePlate = function () {
    const g = new THREE.Group(); g.name = 'cookiePlate';
    const china = printed(512, 64, (c, w, h) => { c.fillStyle = '#f7f5ef'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f5fb3'; c.fillRect(0, 18, w, 6); c.fillRect(0, 30, w, 2); for (let x = 0; x < w; x += 32) { c.beginPath(); c.arc(x + 16, 40, 4, 0, 7); c.fill(); } }, { rough: 0.15, clearcoat: 1, grain: false });
    g.add(lathe([[0, 0.02], [0.4, 0.0], [0.44, 0.02], [0.5, 0.06], [0.74, 0.12], [0.78, 0.14], [0.75, 0.15], [0.5, 0.09], [0.42, 0.06], [0, 0.06]], china, 48));
    const cookie = surf('#c98a46', { key: 'cookie', rough: 0.85, mottle: 0.45, gh: 120, bump: 4, period: 5, paint(c, hg, S) { const r = rng(8); for (let i = 0; i < 30; i++) { const x = r() * S, y = r() * S, s = 6 + r() * 9; c.fillStyle = '#3b1f0f'; c.beginPath(); c.ellipse(x, y, s, s * 0.8, r() * 3, 0, 7); c.fill(); hg.fillStyle = '#fff'; hg.beginPath(); hg.ellipse(x, y, s, s * 0.8, 0, 0, 7); hg.fill(); } } });
    const cg = new THREE.LatheGeometry([[0, -0.04], [0.19, -0.04], [0.215, -0.02], [0.22, 0.01], [0.2, 0.035], [0, 0.045]].map(([r, y]) => new THREE.Vector2(r, y)), 28);
    const p = cg.attributes.position, n = fbm(4, 3, 3); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(x, z), k = 1 + 0.08 * (n(a / 6.283 + 0.5, 0.5) - 0.5) * 2; p.setX(i, x * k); p.setZ(i, z * k); } cg.computeVertexNormals();
    [[0, 0.11, 0, 0, 0], [0.3, 0.11, 0.12, 0.05, 1], [-0.28, 0.11, 0.15, -0.05, 2], [0.05, 0.11, -0.32, 0.04, 3], [-0.06, 0.18, 0.08, 0.18, 4], [0.14, 0.24, -0.06, -0.22, 5]].forEach(([x, y, z, tilt, i]) => { const c = mesh(cg, cookie, x, y + 0.05, z); c.rotation.set(tilt, i * 1.3, tilt * 0.6); g.add(c); });
    return g;
  };

  // coffee mug r 0.22 x 0.46 tall, origin bottom centre, print toward +z, handle on +x
  PROPS.mug = function (color = '#e9e3d6', text = 'COFFEE') {
    const g = new THREE.Group(); g.name = 'mug';
    const glaze = surf(color, { rough: 0.2, clearcoat: 1, mottle: 0.06, key: 'mugg' });
    g.add(lathe([[0, 0], [0.2, 0], [0.22, 0.03], [0.22, 0.46], [0.205, 0.47], [0.195, 0.44], [0.195, 0.05], [0, 0.05]], glaze, 40));
    const print = new THREE.MeshPhysicalMaterial({ map: KIT.textTex(512, 128, (c, w, h) => label(c, text, w / 2, h / 2 + 4, 64, '#c8262c', { maxW: 150 })), transparent: true, roughness: 0.2, clearcoat: 1, polygonOffset: true, polygonOffsetFactor: -2 });
    const pm = mesh(new THREE.CylinderGeometry(0.2215, 0.2215, 0.3, 40, 1, true), print, 0, 0.25, 0); pm.rotation.y = Math.PI; pm.castShadow = false; g.add(pm);
    const coffee = mesh(new THREE.CircleGeometry(0.196, 32), new THREE.MeshPhysicalMaterial({ color: '#2a160c', roughness: 0.1, clearcoat: 1 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.38; g.add(coffee);
    const h = mesh(new THREE.TorusGeometry(0.12, 0.035, 10, 24, Math.PI * 1.25), surf(color, { rough: 0.2, clearcoat: 1, key: 'mugh' }), 0.22, 0.24, 0); h.rotation.z = -Math.PI * 0.625; g.add(h);
    g.userData.grip = V3(0.32, 0.24, 0);
    return g;
  };

  function woodTex(L, seed, base = '#9a6438', o = {}) {
    return once('wood' + L + seed + base + (o.key || ''), () => {
      const W = 1024, H = 128, r = rng(seed), grain = fbm(seed, 4, 4), streak = tnoise(seed + 5, 32);
      const p = KIT.texPair(W, (g, hg) => {
        const col = new THREE.Color(base), im = g.createImageData(W, H), hm = hg.createImageData(W, H);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const u = x / W, v = y / H, gl = Math.sin((v * 7 + grain(u * 0.5, v) * 4 + u * 0.3) * Math.PI * 2) * 0.5 + 0.5, k = 0.78 + 0.16 * gl + 0.18 * (streak(u * 0.5, v * 4) - 0.5);
          const i = (y * W + x) * 4; im.data[i] = col.r * 255 * k * 1.12; im.data[i + 1] = col.g * 255 * k * 1.12; im.data[i + 2] = col.b * 255 * k * 1.12; im.data[i + 3] = 255; hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = 110 + gl * 70; hm.data[i + 3] = 255; }
        g.putImageData(im, 0, 0); hg.putImageData(hm, 0, 0);
        for (let i = 0; i < (o.knots ?? 3); i++) { const x = r() * W, y = H * (0.2 + r() * 0.6); g.fillStyle = 'rgba(55,25,8,0.7)'; g.beginPath(); g.ellipse(x, y, 16, 8, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(55,25,8,0.4)'; g.lineWidth = 2; for (let k = 1; k < 4; k++) { g.beginPath(); g.ellipse(x, y, 16 + k * 8, 8 + k * 3, 0, 0, 7); g.stroke(); } hg.fillStyle = '#000'; hg.beginPath(); hg.ellipse(x, y, 12, 6, 0, 0, 7); hg.fill(); }
        for (let i = 0; i < 6; i++) { const x = r() * W, y = r() * H, l = 40 + r() * 120; g.strokeStyle = 'rgba(40,18,5,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 6); g.stroke(); hg.strokeStyle = '#000'; hg.lineWidth = 3; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + l, y); hg.stroke(); }
        const eg = g.createLinearGradient(0, 0, W, 0); eg.addColorStop(0, 'rgba(40,18,5,0.5)'); eg.addColorStop(0.04, 'rgba(40,18,5,0)'); eg.addColorStop(0.96, 'rgba(40,18,5,0)'); eg.addColorStop(1, 'rgba(40,18,5,0.5)'); g.fillStyle = eg; g.fillRect(0, 0, W, H);
      }, { h: H });
      return pbr(p.c, p.h, { rough: o.rough ?? 0.8, bump: 3, nscale: 0.8 });
    });
  }
  const steel = () => surf('#9ea4ab', { metal: 0.95, rough: 0.32, mottle: 0.3, key: 'steel' });
  // claw hammer ~1.1 tall, origin handle bottom, head on top facing +x
  PROPS.hammer = function () {
    const g = new THREE.Group(); g.name = 'hammer';
    const wood = woodTex(1, 121, '#c08a52', { knots: 0, rough: 0.5 }), rubber = surf('#1d1d20', { rough: 0.9, key: 'rub', paint(c, hg, S) { for (let y = 0; y < S; y += 14) { hg.fillStyle = '#000'; hg.fillRect(0, y, S, 5); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(0, y + 6, S, 2); } } });
    const h = mesh(rbox(0.13, 1.0, 0.1, 0.04, 8), wood, 0, 0.5, 0); h.rotation.z = 0; h.geometry.rotateZ(0); g.add(h);
    g.add(rb(0.16, 0.36, 0.13, 0.05, rubber, 0, 0.18, 0));
    const st = steel(); g.add(rb(0.34, 0.16, 0.16, 0.04, st, 0.06, 1.02, 0));
    const face = mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.12, 20), st, 0.28, 1.02, 0); face.rotation.z = Math.PI / 2; g.add(face);
    [-0.04, 0.04].forEach((z) => g.add(taperTube(curve([[-0.08, 1.04, z], [-0.26, 1.06, z], [-0.38, 0.94, z * 1.4]]), 16, 8, 0.045, (t) => 0.045 - 0.03 * t, st)));
    g.userData.grip = V3(0, 0.2, 0);
    return g;
  };
  // rough board len x 0.55 x 0.1 with two nails, origin centre, face +z
  PROPS.plank = function (len = 4, o = {}) {   // o: {seed, color, tilt}
    const g = new THREE.Group(); g.name = 'plank'; const seed = o.seed || 131 + Math.round(len * 10);
    const wood = woodTex(Math.round(len), seed, o.color || '#b07a48', { knots: 2 + (seed % 3) });
    const b = mesh(rbox(len, 0.55, 0.1, 0.025, 8), wood); b.rotation.z = (o.tilt || 0); g.add(b);
    const nh = surf('#6d6f73', { metal: 0.85, rough: 0.45, mottle: 0.6, key: 'nail' });
    [-1, 1].forEach((s) => { const n = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 14), nh, s * (len / 2 - 0.22), 0.04 * s, 0.06); n.rotation.x = Math.PI / 2; b.add(n); });
    return g;
  };
  // hard-shell suitcase 1.4 x 1.0 x 0.5 standing on its long edge, origin bottom centre, front +z
  PROPS.suitcase = function (color = '#c0392b') {
    const g = new THREE.Group(); g.name = 'suitcase';
    const shell = surf(color, { rough: 0.35, clearcoat: 0.7, mottle: 0.12, key: 'suit', paint(c, hg, S) { for (let x = 0; x < S; x += S / 6) { const gr = hg.createLinearGradient(x, 0, x + S / 6, 0); gr.addColorStop(0, '#606060'); gr.addColorStop(0.5, '#d0d0d0'); gr.addColorStop(1, '#606060'); hg.fillStyle = gr; hg.fillRect(x, 0, S / 6, S); } } });
    const front = printed(512, 366, (c, w, h) => { c.fillStyle = color; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += w / 6) { const gr = c.createLinearGradient(x, 0, x + w / 6, 0); gr.addColorStop(0, 'rgba(0,0,0,0.18)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.18)'); c.fillStyle = gr; c.fillRect(x, 0, w / 6, h); }
      [['PARIS', '#2f6fd1', 120, 120, 54], ['RIO', '#f2b53a', 360, 230, 48], ['TOKYO', '#fff', 300, 90, 40]].forEach(([s, col, x, y, r], i) => { c.save(); c.translate(x, y); c.rotate((i - 1) * 0.3); c.fillStyle = col; c.beginPath(); i === 2 ? rrect(c, -r * 1.3, -r * 0.6, r * 2.6, r * 1.2, 10) : c.arc(0, 0, r, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 4; c.stroke(); label(c, s, 0, 0, r * 0.5, i === 2 ? '#c8262c' : '#fff', { maxW: r * 2.2 }); c.restore(); }); }, { rough: 0.35, clearcoat: 0.7 });
    g.add(mesh(rbox(1.4, 1.0, 0.5, 0.1, 10), [shell, shell, shell, shell, front, shell], 0, 0.52, 0));
    g.add(rb(1.42, 0.05, 0.52, 0.02, surf('#222', { rough: 0.6, key: 'seam' }), 0, 0.52, 0));
    const dark = surf('#1d1d20', { rough: 0.7, key: 'bump' }), chrome = surf('#cfd4da', { metal: 1, rough: 0.2, key: 'chrome' });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => g.add(rb(0.2, 0.2, 0.54, 0.06, dark, sx * 0.62, 0.52 + sy * 0.42, 0)));
    g.add(taperTube(curve([[-0.24, 1.02, 0], [-0.2, 1.16, 0], [0.2, 1.16, 0], [0.24, 1.02, 0]]), 20, 10, 0.05, () => 0.05, dark));
    [-0.4, 0.4].forEach((x) => g.add(rb(0.14, 0.1, 0.06, 0.02, chrome, x, 0.92, 0.25)));
    g.userData.grip = V3(0, 1.16, 0);
    return g;
  };

  // =====================================================================================
  // NUMBER BALLOON — gold foil digits on a string, ~3 tall, origin = string end (y=0)
  // =====================================================================================
  function foilMat(color) {
    return once('foil' + color, () => { const p = KIT.texPair(512, (g, hg) => { g.fillStyle = color; g.fillRect(0, 0, 512, 512); KIT.noiseOver(g, 512, 512, 141, 0.25, 4, 3);
      const r = rng(142); for (let i = 0; i < 260; i++) { const x = r() * 512, y = r() * 512, a = r() * 3.14, l = 20 + r() * 70; hg.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'; hg.lineWidth = 2 + r() * 5; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); hg.stroke(); } });
      const m = pbr(p.c, p.h, { physical: true, rough: 0.2, bump: 2.5, nscale: 0.5, repeat: [1.5, 1.5] }); m.metalness = 1; m.clearcoat = 0.6; m.clearcoatRoughness = 0.15; m.envMap = envTex(); m.userData.env = 1.6; m.envMapIntensity = 1.6; METALS.push(m); return m; });
  }
  function digitShape(ch) {
    const s = new THREE.Shape();
    if (ch === '1') { [[-0.12, -0.78], [0.22, -0.78], [0.22, 0.78], [0.0, 0.78], [-0.36, 0.48], [-0.24, 0.3], [-0.12, 0.4]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; }
    s.absellipse(0, 0, 0.5, 0.78, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absellipse(0, 0, 0.2, 0.46, 0, Math.PI * 2, true); s.holes.push(h); return s;
  }
  PROPS.numberBalloon = function (txt = '10', color = '#e7b23e') {
    const g = new THREE.Group(); g.name = 'numberBalloon_' + txt; const fm = foilMat(color), chars = String(txt).split('');
    const bal = new THREE.Group(); bal.position.y = 2.15; g.add(bal);
    chars.forEach((ch, i) => { const geo = new THREE.ExtrudeGeometry(digitShape(ch), { depth: 0.04, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.13, bevelSegments: 8, curveSegments: 36 });
      geo.translate(0, 0, -0.02); const m = mesh(geo, fm, (i - (chars.length - 1) / 2) * 1.12, 0, 0); m.rotation.z = (i - (chars.length - 1) / 2) * -0.08; bal.add(m); });
    // seam (crimp) around the edge is implied by the bevel; knot + string + weight
    const sm = new THREE.MeshStandardMaterial({ color: '#f0ece2', roughness: 0.6 });
    g.add(taperTube(curve([[0, 0.15, 0], [0.06, 0.6, 0.02], [-0.05, 1.0, 0], [0.03, 1.32, 0]]), 30, 5, 0.012, () => 0.012, sm));
    const wt = surf('#d23b5c', { metal: 0.8, rough: 0.3, key: 'wt' }); const heart = new THREE.Shape(); heart.moveTo(0, -0.1); heart.bezierCurveTo(-0.16, 0.0, -0.12, 0.14, 0, 0.07); heart.bezierCurveTo(0.12, 0.14, 0.16, 0.0, 0, -0.1);
    const hw = mesh(new THREE.ExtrudeGeometry(heart, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }), wt, 0, 0.12, -0.02); hw.scale.setScalar(1.3); g.add(hw);
    g.userData.balloon = bal;
    return g;
  };

  // =====================================================================================
  // TROPHY — golden cup with a big eye on top, plaque "STARING CHAMP". i varies size / metal. origin bottom centre
  // =====================================================================================
  function eyeTex() {
    return once('eyeball', () => { const c = cnv(512, 256), g = c.getContext('2d'); g.fillStyle = '#fbf8f2'; g.fillRect(0, 0, 512, 256);
      const r = rng(3); g.strokeStyle = 'rgba(210,40,40,0.55)'; g.lineWidth = 2; for (let i = 0; i < 26; i++) { let x = r() * 512, y = r() < 0.5 ? 20 + r() * 40 : 196 + r() * 40; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 30 + (128 - x) * 0.06; y += (128 - y) * 0.12 + (r() - 0.5) * 10; g.lineTo(x, y); } g.stroke(); }
      const cx = 128, cy = 128, ir = g.createRadialGradient(cx, cy, 8, cx, cy, 46); ir.addColorStop(0, '#2b6b3a'); ir.addColorStop(0.6, '#3f9a52'); ir.addColorStop(1, '#174a24'); g.fillStyle = ir; g.beginPath(); g.ellipse(cx, cy, 46, 50, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(200,255,200,0.4)'; g.lineWidth = 2; for (let a = 0; a < 6.28; a += 0.25) { g.beginPath(); g.moveTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 24); g.lineTo(cx + Math.cos(a) * 42, cy + Math.sin(a) * 46); g.stroke(); }
      g.strokeStyle = '#0d2a14'; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, 46, 50, 0, 0, 7); g.stroke();
      g.fillStyle = '#080808'; g.beginPath(); g.ellipse(cx, cy, 20, 22, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(cx - 10, cy - 12, 7, 8, 0, 0, 7); g.fill();
      return tex(c); });
  }
  PROPS.trophy = function (i = 0) {
    const g = new THREE.Group(); g.name = 'trophy' + i;
    const metals = ['#e9b844', '#d5d9df', '#c97c42', '#e9b844'], mc = metals[i % 4], s = [1, 0.82, 0.72, 1.18][i % 4];
    const gold = surf(mc, { metal: 1, rough: 0.22, mottle: 0.12, key: 'trophy' + mc, env: 1.4 });
    const base = surf(['#2a1a12', '#1f2630', '#3a1f14', '#151515'][i % 4], { rough: 0.25, clearcoat: 1, mottle: 0.3, key: 'tbase' + i });
    g.add(rb(0.9, 0.34, 0.9, 0.05, base, 0, 0.17, 0)); g.add(rb(0.68, 0.22, 0.68, 0.04, base, 0, 0.45, 0));
    const plq = printed(256, 96, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6dc8a'); gr.addColorStop(0.5, '#c9962e'); gr.addColorStop(1, '#f2d27a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = '#6b4a10'; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10);
      label(c, 'STARING', w / 2, 34, 30, '#3a2606', { maxW: w - 30 }); label(c, 'CHAMP', w / 2, 68, 30, '#3a2606', { maxW: w - 30 }); }, { rough: 0.3, grain: false });
    plq.metalness = 0.7; plq.envMap = envTex(); const pl = mesh(new THREE.PlaneGeometry(0.62, 0.23), plq, 0, 0.17, 0.452); g.add(pl);
    g.add(lathe([[0, 0.56], [0.22, 0.56], [0.2, 0.62], [0.08, 0.68], [0.06, 0.8], [0.11, 0.86], [0.06, 0.92], [0.06, 1.0], [0.1, 1.06], [0.3, 1.16], [0.42, 1.36], [0.46, 1.62], [0.5, 1.66], [0.48, 1.69], [0.42, 1.66], [0, 1.56]], gold, 48));
    [-1, 1].forEach((sd) => { const h = mesh(new THREE.TorusGeometry(0.2, 0.04, 10, 24, Math.PI * 1.1), gold, sd * 0.44, 1.4, 0); h.rotation.z = sd > 0 ? -Math.PI * 0.55 : Math.PI * 0.55 + Math.PI * 0.0; if (sd < 0) h.rotation.y = Math.PI; g.add(h); });
    const eye = mesh(new THREE.SphereGeometry(0.36, 40, 28), new THREE.MeshPhysicalMaterial({ map: eyeTex(), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }), 0, 1.9, 0); g.add(eye);
    const lid = lathe([[0.05, -0.02], [0.4, 0.0], [0.42, 0.04], [0.37, 0.06]], gold, 40); lid.position.y = 1.62; g.add(lid);
    g.scale.setScalar(s); g.userData.eye = eye;
    return g;
  };

  // =====================================================================================
  // ALARM CLOCK — twin bells, readable face, setTime(h,m). ~1.3 tall, origin bottom centre, face +z
  // =====================================================================================
  function clockFaceTex() {
    return once('clockface', () => { const S = 512, c = cnv(S, S), g = c.getContext('2d'); const gr = g.createRadialGradient(S / 2, S / 2, 40, S / 2, S / 2, S / 2); gr.addColorStop(0, '#fffdf4'); gr.addColorStop(1, '#ece2c8'); g.fillStyle = gr; g.fillRect(0, 0, S, S);
      for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2, big = k % 5 === 0, r0 = big ? 205 : 220; g.strokeStyle = '#1b1b1b'; g.lineWidth = big ? 10 : 4; g.beginPath(); g.moveTo(S / 2 + Math.sin(a) * r0, S / 2 - Math.cos(a) * r0); g.lineTo(S / 2 + Math.sin(a) * 238, S / 2 - Math.cos(a) * 238); g.stroke(); }
      for (let k = 1; k <= 12; k++) { const a = (k / 12) * Math.PI * 2; label(g, String(k), S / 2 + Math.sin(a) * 165, S / 2 - Math.cos(a) * 165 + 4, k % 3 ? 44 : 66, '#1b1b1b'); }
      label(g, 'WAKE UP', S / 2, S / 2 + 90, 22, '#c8262c'); return tex(c); });
  }
  PROPS.alarmClock = function (h = 12, m = 0) {
    const g = new THREE.Group(); g.name = 'alarmClock';
    const red = surf('#d0302c', { rough: 0.3, clearcoat: 1, mottle: 0.15, metal: 0.3, env: 0.5, key: 'clockred' }), chrome = surf('#d7dbe0', { metal: 1, rough: 0.18, key: 'chrome2' });
    const C = new THREE.Group(); C.position.y = 0.62; g.add(C);
    const bodyG = new THREE.CylinderGeometry(0.5, 0.5, 0.32, 48); bodyG.rotateX(Math.PI / 2); C.add(mesh(bodyG, red));
    const bez = mesh(new THREE.TorusGeometry(0.49, 0.045, 12, 64), chrome, 0, 0, 0.17); C.add(bez);
    const face = mesh(new THREE.CircleGeometry(0.47, 48), new THREE.MeshStandardMaterial({ map: clockFaceTex(), roughness: 0.5 }), 0, 0, 0.162); C.add(face);
    const glass = mesh(new THREE.SphereGeometry(0.5, 32, 12, 0, Math.PI * 2, 0, 0.5), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 0, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false }), 0, 0, -0.27); glass.rotation.x = Math.PI / 2; glass.castShadow = false; C.add(glass);
    const handM = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.4 });
    const hand = (L, w) => { const p = new THREE.Group(); p.position.z = 0.175; const s = new THREE.Shape(); s.moveTo(-w / 2, -0.06); s.lineTo(w / 2, -0.06); s.lineTo(w * 0.35, L * 0.85); s.lineTo(0, L); s.lineTo(-w * 0.35, L * 0.85); s.closePath(); const k = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false }), handM); p.add(k); C.add(p); return p; };
    const hh = hand(0.25, 0.07), mh = hand(0.38, 0.05); mh.position.z = 0.19;
    C.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16).rotateX(Math.PI / 2), chrome, 0, 0, 0.2));
    [-1, 1].forEach((sd) => { const b = new THREE.Group(); b.position.set(sd * 0.3, 0.42, -0.02); b.rotation.z = -sd * 0.55; C.add(b);
      b.add(mesh(new THREE.SphereGeometry(0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), chrome, 0, 0, 0)); b.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 10), chrome, 0, -0.04, 0)); });
    C.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), chrome, 0, 0.6, -0.02)); C.add(mesh(new THREE.SphereGeometry(0.045, 12, 8), chrome, 0, 0.7, -0.02));
    const hdl = mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 24, Math.PI), chrome, 0, 0.5, -0.12); C.add(hdl);
    [-1, 1].forEach((sd) => { const l = mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.22, 12), chrome, sd * 0.3, -0.5, 0); l.rotation.z = sd * 0.5; C.add(l); C.add(mesh(new THREE.SphereGeometry(0.06, 12, 8), chrome, sd * 0.36, -0.6, 0)); });
    const setTime = (H, M) => { mh.rotation.z = -(M / 60) * Math.PI * 2; hh.rotation.z = -(((H % 12) + M / 60) / 12) * Math.PI * 2; };
    setTime(h, m); g.userData = { setTime, hourHand: hh, minHand: mh };
    return g;
  };

  // =====================================================================================
  // BLANKET — quilt with hanging folds, pinned at the top. origin = top centre, hangs to -h, faces +z
  // pattern: 'quilt' | 'stripes' | 'plaid' | 'stars'
  // =====================================================================================
  function blanketTex(color, pattern, seed) {
    return once('blanket' + color + pattern, () => {
      const S = 1024, f = RBX.fleece(S, S, color, seed), g = f.g, hg = f.hg, base = new THREE.Color(color), r = rng(seed);
      const shade = (k, h = 0) => { const c = base.clone(); const hsl = {}; c.getHSL(hsl); c.setHSL((hsl.h + h + 1) % 1, hsl.s, clamp(hsl.l * k, 0, 0.9)); return '#' + c.getHexString(); };
      g.globalCompositeOperation = 'multiply';
      if (pattern === 'quilt') { const n = 6, w = S / n, pal = [shade(1.15), shade(0.75), '#f1e6cf', shade(1, 0.08), shade(0.95, -0.1), '#e8d9b0'];
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x * w, y * w, w, w); if (r() > 0.5) { g.fillStyle = pal[Math.floor(r() * pal.length)]; g.beginPath(); g.moveTo(x * w, y * w); g.lineTo(x * w + w, y * w); g.lineTo(x * w, y * w + w); g.fill(); } }
        g.globalCompositeOperation = 'source-over'; g.setLineDash([10, 8]); g.strokeStyle = 'rgba(255,250,235,0.65)'; g.lineWidth = 3; for (let k = 0; k <= n; k++) { g.beginPath(); g.moveTo(k * w + 6, 0); g.lineTo(k * w + 6, S); g.stroke(); g.beginPath(); g.moveTo(0, k * w + 6); g.lineTo(S, k * w + 6); g.stroke(); } g.setLineDash([]);
        hg.fillStyle = 'rgba(0,0,0,0.7)'; for (let k = 0; k <= n; k++) { hg.fillRect(k * w - 3, 0, 6, S); hg.fillRect(0, k * w - 3, S, 6); }
        hg.fillStyle = 'rgba(255,255,255,0.18)'; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const rg = hg.createRadialGradient((x + 0.5) * w, (y + 0.5) * w, 4, (x + 0.5) * w, (y + 0.5) * w, w * 0.6); rg.addColorStop(0, 'rgba(255,255,255,0.4)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); hg.fillStyle = rg; hg.fillRect(x * w, y * w, w, w); }
      } else if (pattern === 'stripes') { for (let y = 0; y < S; y += 128) { g.fillStyle = '#f2ead6'; g.fillRect(0, y, S, 50); g.fillStyle = shade(0.6); g.fillRect(0, y + 58, S, 14); }
      } else if (pattern === 'plaid') { g.globalAlpha = 0.5; for (let k = 0; k < S; k += 160) { g.fillStyle = shade(0.55); g.fillRect(k, 0, 70, S); g.fillRect(0, k, S, 70); g.fillStyle = '#f2e6c4'; g.fillRect(k + 100, 0, 10, S); g.fillRect(0, k + 100, S, 10); } g.globalAlpha = 1;
      } else { g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? '#ffe27a' : '#fff6dc'; KIT.star(g, r() * S, r() * S, 18 + r() * 22); g.fill(); } }
      g.globalCompositeOperation = 'source-over';
      // binding around the edge
      g.strokeStyle = shade(0.55); g.lineWidth = 28; g.strokeRect(0, 0, S, S); hg.strokeStyle = '#fff'; hg.lineWidth = 24; hg.strokeRect(0, 0, S, S);
      return pbr(f.c, f.h, { rough: 0.95, bump: 3, nscale: 0.7, physical: true, sheen: 0.6, sheenColor: '#ffffff' });
    });
  }
  PROPS.blanket = function (color = '#c94f4f', pattern = 'quilt', o = {}) {
    const W = o.w || 3, H = o.h || 3.2, g = new THREE.Group(); g.name = 'blanket';
    const geo = new THREE.PlaneGeometry(W, H, 60, 60); geo.translate(0, -H / 2, 0);
    const pins = o.pins || [-W / 2 + 0.15, 0, W / 2 - 0.15], p = geo.attributes.position, n = fbm(o.seed || 7, 3, 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), t = -y / H, u = x / W + 0.5;
      let sag = 0; for (let k = 0; k < pins.length - 1; k++) { const a = pins[k], b = pins[k + 1]; if (x >= a && x <= b) sag = Math.sin(Math.PI * (x - a) / (b - a)) * 0.22; }
      const dropY = sag * Math.exp(-t * 3);
      let fold = 0; pins.forEach((px) => { fold += 0.1 * Math.exp(-Math.pow((x - px) / (0.25 + t * 0.8), 2)) * Math.sin(t * 9) * Math.min(1, t * 3); });
      const z = 0.09 * (Math.sin(x * 5.3 + t * 1.5) + 1) * (0.25 + t) + 0.05 * (Math.sin(x * 11 + 2) + 1) * t + 0.06 * (n(u, t) - 0.5) + fold * 1.4 + 0.1 * Math.pow(t, 4);
      p.setXYZ(i, x + Math.sin(t * 6 + x) * 0.02, y - dropY, Math.max(0, z) + 0.02);
    }
    geo.computeVertexNormals();
    const m = blanketTex(color, pattern, o.seed || 7).clone(); m.side = THREE.DoubleSide;
    g.add(mesh(geo, m));
    const pinM = new THREE.MeshStandardMaterial({ color: o.pinColor || '#e8c33a', roughness: 0.3, metalness: 0.2 });
    pins.forEach((x) => { const pn = new THREE.Group(); pn.position.set(x, -0.12, 0.09); pn.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16).rotateX(Math.PI / 2), pinM, 0, 0, 0.04)); pn.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 12).rotateX(Math.PI / 2), pinM, 0, 0, 0.1)); pn.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 16).rotateX(Math.PI / 2), pinM, 0, 0, 0.16)); g.add(pn); });
    return g;
  };

  // =====================================================================================
  // SMALL PROPS
  // =====================================================================================
  // chalk stick 0.42 long along x, origin centre
  PROPS.chalk = function (color = '#f4f2ea') {
    const g = new THREE.Group(); g.name = 'chalk';
    const m = surf(color, { rough: 1, mottle: 0.12, gh: 120, bump: 3, key: 'chalk', grain: 2 });
    const geo = new THREE.LatheGeometry([[0, -0.21], [0.045, -0.2], [0.05, -0.17], [0.05, 0.16], [0.042, 0.2], [0.02, 0.215], [0, 0.215]].map(([r, y]) => new THREE.Vector2(r, y)), 18); geo.rotateZ(Math.PI / 2);
    g.add(mesh(geo, m)); g.userData.grip = V3(0.1, 0, 0); return g;
  };
  // flashlight 0.85 long pointing +z, origin centre; setOn(bool); o.light adds a SpotLight
  PROPS.flashlight = function (o = {}) {
    const g = new THREE.Group(); g.name = 'flashlight';
    const body = surf('#2a2d33', { rough: 0.4, metal: 0.6, env: 0.6, key: 'knurl', paint(c, hg, S) { for (let y = 0; y < S; y += 6) for (let x = 0; x < S; x += 6) { hg.fillStyle = (x + y) % 12 ? '#fff' : '#000'; hg.fillRect(x, y, 4, 4); } } });
    const yellow = surf('#f2c230', { rough: 0.35, clearcoat: 0.8, key: 'flashY' });
    const geo = new THREE.LatheGeometry([[0, -0.42], [0.08, -0.42], [0.09, -0.4], [0.09, 0.15], [0.14, 0.27], [0.15, 0.4], [0.13, 0.42], [0, 0.42]].map(([r, y]) => new THREE.Vector2(r, y)), 32); geo.rotateX(Math.PI / 2);
    g.add(mesh(geo, yellow));
    const grip = mesh(new THREE.CylinderGeometry(0.094, 0.094, 0.36, 32, 1, true).rotateX(Math.PI / 2), body, 0, 0, -0.16); g.add(grip);
    const lensM = new THREE.MeshStandardMaterial({ color: '#fff3d0', emissive: '#fff1c8', emissiveIntensity: 0, roughness: 0.1 });
    const lens = mesh(new THREE.CircleGeometry(0.125, 32), lensM, 0, 0, 0.424); g.add(lens);
    g.add(rb(0.07, 0.04, 0.12, 0.02, surf('#c8262c', { rough: 0.4, key: 'btn' }), 0, 0.105, 0.05));
    let light = null; if (o.light) { light = new THREE.SpotLight('#fff1c8', 0, 30, 0.35, 0.5, 2); light.position.set(0, 0, 0.45); light.target.position.set(0, 0, 5); g.add(light, light.target); }
    const setOn = (b) => { lensM.emissiveIntensity = b ? 6 : 0; if (light) light.intensity = b ? 60 : 0; };
    setOn(o.on ?? false); g.userData = { setOn, lens, light, grip: V3(0, 0, -0.16) };
    return g;
  };
  // eyewear on an R6 head (head-local): lenses follow the head's curve at eye height
  function eyewear(o) {
    const g = new THREE.Group(); g.userData.attach = 'head';
    const R = 0.645, y = o.y ?? 0.04, frame = o.frame, sep = o.sep || 0.16;
    [-1, 1].forEach((sd) => { const a = Math.asin(sep / R) * sd, lg = new THREE.Group(); lg.position.set(Math.sin(a) * R, y, Math.cos(a) * R); lg.rotation.y = a; g.add(lg);
      const sh = o.shape(); const ring = new THREE.Shape(sh.getPoints(40)); const hole = new THREE.Path(o.shape(o.rim).getPoints(40).reverse()); ring.holes.push(hole);
      lg.add(mesh(new THREE.ExtrudeGeometry(ring, { depth: o.depth || 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }), frame, 0, 0, -0.02));
      const lens = mesh(new THREE.ShapeGeometry(o.shape(o.rim)), o.lens, 0, 0, 0.0); lens.castShadow = false; lg.add(lens);
      // temple arm: from the outer edge back along the side of the head
      const ox = Math.sin(a) * R + sd * Math.cos(a) * o.halfW, oz = Math.cos(a) * R - Math.abs(Math.sin(a)) * o.halfW;
      g.add(taperTube(curve([[ox, y + 0.02, oz - 0.02], [sd * 0.62, y + 0.03, 0.3], [sd * 0.625, y + 0.03, -0.05], [sd * 0.6, y - 0.08, -0.2]]), 20, 6, o.arm || 0.022, () => o.arm || 0.022, frame)); });
    g.add(taperTube(curve([[-0.07, y + 0.05, R + 0.01], [0, y + 0.08, R + 0.03], [0.07, y + 0.05, R + 0.01]]), 10, 6, o.arm || 0.022, () => o.arm || 0.022, frame));
    return g;
  }
  PROPS.glasses = function (color = '#3a2a1e') {
    const frame = surf(color, { rough: 0.3, clearcoat: 1, mottle: 0.4, key: 'tort' }), lens = new THREE.MeshPhysicalMaterial({ color: '#dfefff', roughness: 0.05, transparent: true, opacity: 0.18, clearcoat: 1, depthWrite: false });
    const circ = (k = 0) => { const s = new THREE.Shape(); s.absarc(0, 0, 0.13 - k, 0, Math.PI * 2, false); return s; };
    const g = eyewear({ frame, lens, shape: (rim) => circ(rim || 0), rim: 0.028, halfW: 0.13, sep: 0.165, depth: 0.03 }); g.name = 'glasses'; return g;
  };
  PROPS.sunglasses = function () {
    const frame = surf('#111216', { rough: 0.25, clearcoat: 1, key: 'sunf' });
    const lens = new THREE.MeshPhysicalMaterial({ color: '#0d0f14', roughness: 0.05, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.02, envMap: envTex(), envMapIntensity: 2 });
    const shape = (k = 0) => { const s = new THREE.Shape(), w = 0.17 - k, h = 0.12 - k, r = 0.05; s.moveTo(-w + r, h); s.lineTo(w - r, h); s.quadraticCurveTo(w, h, w, h - r); s.lineTo(w * 0.9, -h + r); s.quadraticCurveTo(w * 0.85, -h, w * 0.5, -h); s.lineTo(-w * 0.5, -h); s.quadraticCurveTo(-w * 0.85, -h, -w * 0.9, -h + r); s.lineTo(-w, h - r); s.quadraticCurveTo(-w, h, -w + r, h); return s; };
    const g = eyewear({ frame, lens, shape: (rim) => shape(rim || 0), rim: 0.032, halfW: 0.17, sep: 0.185, depth: 0.05, arm: 0.03 }); g.name = 'sunglasses'; return g;
  };
  // hardcover book 1.0 x 1.35 x 0.24 standing, cover +z, spine -x, origin centre
  PROPS.book = function (title = 'HOW TO SCARE A MOON', o = {}) {
    const g = new THREE.Group(); g.name = 'book'; const col = o.color || '#1f3a7a';
    const cover = printed(512, 692, (c, w, h) => {
      c.fillStyle = col; c.fillRect(0, 0, w, h); KIT.noiseOver(c, w, h, 151, 0.25, 6, 3);
      c.strokeStyle = '#e8c35a'; c.lineWidth = 6; c.strokeRect(24, 24, w - 48, h - 48);
      const words = title.split(' '), lines = []; let cur = ''; words.forEach((wd) => { if ((cur + ' ' + wd).trim().length > 9 && cur) { lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); }); lines.push(cur);
      lines.forEach((ln, i) => label(c, ln, w / 2, 110 + i * 92, 84, '#ffd84a', { font: FONT_HAND, weight: '700', stroke: '#0c1838', sw: 12, maxW: w - 80, rot: (i % 2 ? 0.03 : -0.03) }));
      // a scared moon doodle
      const mx = w / 2, my = 110 + lines.length * 92 + 130; c.fillStyle = '#d9d9cf'; c.beginPath(); c.arc(mx, my, 120, 0, 7); c.fill(); c.strokeStyle = '#0c1838'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#b5b5aa'; [[-50, -50, 22], [52, 40, 16], [30, -70, 12]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(mx + dx, my + dy, r, 0, 7); c.fill(); });
      c.fillStyle = '#fff'; [[-40, -10], [40, -10]].forEach(([dx, dy]) => { c.beginPath(); c.arc(mx + dx, my + dy, 26, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#111'; c.beginPath(); c.arc(mx + dx, my + dy + 6, 9, 0, 7); c.fill(); c.fillStyle = '#fff'; });
      c.fillStyle = '#5a0c10'; c.beginPath(); c.ellipse(mx, my + 56, 22, 28, 0, 0, 7); c.fill(); c.stroke();
      c.lineWidth = 5; [[-150, -30], [150, -30], [-140, 50], [140, 50]].forEach(([dx, dy]) => { c.beginPath(); c.moveTo(mx + dx * 0.9, my + dy); c.lineTo(mx + dx * 1.1, my + dy - 10); c.stroke(); });
    }, { rough: 0.6, seed: 152 });
    const cloth = surf(col, { rough: 0.8, mottle: 0.25, key: 'bookcloth' + col, paint(c, hg) { for (let y = 0; y < 256; y += 3) { hg.fillStyle = 'rgba(0,0,0,0.25)'; hg.fillRect(0, y, 256, 1); } } });
    const pages = surf('#f2ead4', { rough: 0.9, key: 'pages', paint(c, hg, S) { for (let y = 0; y < S; y += 3) { c.fillStyle = 'rgba(120,100,70,0.25)'; c.fillRect(0, y, S, 1); hg.fillStyle = '#000'; hg.fillRect(0, y, S, 1); } } });
    const spineM = printed(96, 692, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2); c.rotate(Math.PI / 2); label(c, title, 0, 0, 40, '#ffd84a', { maxW: h - 60, font: FONT_HAND, weight: '700' }); c.restore(); }, { seed: 153 });
    const Wd = 1.0, Hd = 1.35, D = 0.24;
    g.add(mesh(new THREE.BoxGeometry(Wd - 0.06, Hd - 0.06, D - 0.05), pages, 0.02, 0, 0));
    g.add(mesh(rbox(Wd, Hd, 0.03, 0.012, 8), [cloth, cloth, cloth, cloth, cover, cloth], 0, 0, D / 2 - 0.015));
    g.add(mesh(rbox(Wd, Hd, 0.03, 0.012, 8), cloth, 0, 0, -D / 2 + 0.015));
    g.add(mesh(rbox(0.04, Hd, D, 0.015, 8), [cloth, spineM, cloth, cloth, cloth, cloth], -Wd / 2 + 0.02, 0, 0));
    g.userData.grip = V3(0, -0.4, 0);
    return g;
  };
  // Pip's stuffed bunny, ~1.25 tall incl. ears, origin bottom centre, face +z
  PROPS.plush = function (o = {}) {
    const g = new THREE.Group(); g.name = 'plushBunny';
    const fur = RBX.plushMat(o.color || '#f1dcd2', '#ffffff', 161, 2), inner = RBX.plushMat('#f3a6b8', '#ffe0ea', 162, 1);
    const sph = (r, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = mesh(new THREE.SphereGeometry(r, 32, 20), mat, x, y, z); m.scale.set(sx, sy, sz); g.add(m); return m; };
    sph(0.32, fur, 0, 0.36, 0, 1, 1.1, 0.9);
    sph(0.3, fur, 0, 0.86, 0.02, 1.08, 0.95, 0.95);
    sph(0.12, RBX.plushMat('#fff8f2', '#ffffff', 164, 1), 0, 0.8, 0.24, 1.25, 0.8, 0.8);
    [-1, 1].forEach((s) => {
      const e = mesh(new THREE.CapsuleGeometry(0.085, 0.38, 6, 16), fur, s * 0.13, 1.28, -0.02); e.rotation.z = -s * 0.22; e.rotation.x = s > 0 ? 0.35 : -0.1; e.scale.z = 0.55; g.add(e);
      const ei = mesh(new THREE.CapsuleGeometry(0.05, 0.3, 6, 12), inner, 0, 0, 0.05); ei.scale.z = 0.4; e.add(ei);
      sph(0.1, fur, s * 0.28, 0.42, 0.14, 0.8, 1.3, 0.8).rotation.z = s * 0.4;
      sph(0.12, fur, s * 0.16, 0.08, 0.2, 0.9, 0.7, 1.3);
    });
    const btn = new THREE.MeshPhysicalMaterial({ color: '#141414', roughness: 0.15, clearcoat: 1 });
    [-1, 1].forEach((s) => { const b = mesh(new THREE.SphereGeometry(0.038, 16, 12), btn, s * 0.1, 0.94, 0.28); b.scale.z = 0.6; b.rotation.y = s * 0.3; g.add(b); });
    sph(0.035, new THREE.MeshStandardMaterial({ color: '#e7738f', roughness: 0.6 }), 0, 0.85, 0.335, 1.3, 0.8, 0.8);
    const thread = new THREE.MeshStandardMaterial({ color: '#4a2a2a', roughness: 0.9 });
    g.add(taperTube(curve([[0, 0.83, 0.34], [0, 0.79, 0.345]]), 4, 5, 0.007, () => 0.007, thread));
    g.add(taperTube(curve([[-0.05, 0.79, 0.33], [-0.025, 0.77, 0.342], [0, 0.79, 0.345], [0.025, 0.77, 0.342], [0.05, 0.79, 0.33]]), 16, 5, 0.007, () => 0.007, thread));
    const patch = printed(128, 128, (c, w, h) => { c.fillStyle = '#9fc7e8'; c.beginPath(); c.moveTo(64, 112); c.bezierCurveTo(-10, 60, 20, 4, 64, 36); c.bezierCurveTo(108, 4, 138, 60, 64, 112); c.fill(); c.setLineDash([6, 5]); c.strokeStyle = '#3a4a6a'; c.lineWidth = 4; c.stroke(); }, { transparent: true, grain: false });
    const ph = mesh(new THREE.PlaneGeometry(0.2, 0.2), patch, 0.06, 0.36, 0.29); ph.rotation.y = 0.1; g.add(ph);
    sph(0.09, RBX.plushMat('#ffffff', '#ffffff', 163, 1), 0, 0.3, -0.3);
    return g;
  };
  // wooden ladder, h tall, 1.9 wide, rails along y, rungs along x, origin bottom centre
  PROPS.ladder = function (h = 8) {
    const g = new THREE.Group(); g.name = 'ladder';
    const rail = woodTex(Math.round(h), 171, '#b88250', { knots: 4 }), rung = woodTex(2, 172, '#c28c58', { knots: 0 });
    [-0.95, 0.95].forEach((x) => { const r = mesh(rbox(h, 0.16, 0.24, 0.04, 8), rail, x, h / 2, 0); r.rotation.z = Math.PI / 2; g.add(r); });
    for (let y = 0.6; y < h - 0.2; y += 0.95) { const r = mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.9, 14), rung, 0, y, 0); r.rotation.z = Math.PI / 2; g.add(r); }
    return g;
  };

  // =====================================================================================
  // HAIR — R6 head-local shells that hug the head + sculpted locks. PROPS.hair(style, color)
  // =====================================================================================
  const NLOCK = 20;
  function hairMats(color) {
    return once('hair' + color, () => {
      const S = 512, base = new THREE.Color(color), r = rng(181);
      const p = KIT.texPair(S, (g, hg) => {
        g.fillStyle = color; g.fillRect(0, 0, S, S);
        const lw = S / NLOCK;
        for (let k = 0; k < NLOCK; k++) { const x = k * lw, gr = g.createLinearGradient(x, 0, x + lw, 0); gr.addColorStop(0, 'rgba(0,0,0,0.38)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.1)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0.3)'); g.fillStyle = gr; g.fillRect(x, 0, lw, S);
          const hgG = hg.createLinearGradient(x, 0, x + lw, 0); hgG.addColorStop(0, '#202020'); hgG.addColorStop(0.5, '#e0e0e0'); hgG.addColorStop(1, '#202020'); hg.fillStyle = hgG; hg.fillRect(x, 0, lw, S); }
        g.filter = hg.filter = 'blur(1.2px)';
        for (let i = 0; i < 700; i++) { const x = r() * S, y = r() * S * 1.2 - S * 0.2, L = 80 + r() * 200, lit = r() > 0.5; g.strokeStyle = lit ? 'rgba(255,250,240,0.09)' : 'rgba(0,0,0,0.1)'; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 8, y + L / 2, x + (r() - 0.5) * 6, y + L); g.stroke();
          hg.strokeStyle = lit ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'; hg.lineWidth = 3; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x, y + L); hg.stroke(); }
        g.filter = hg.filter = 'none';
        // painted sheen band (Roblox-catalog hair)
        const band = g.createLinearGradient(0, S * 0.18, 0, S * 0.42); band.addColorStop(0, 'rgba(255,255,255,0)'); band.addColorStop(0.5, 'rgba(255,245,225,0.2)'); band.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = band; g.fillRect(0, S * 0.18, S, S * 0.24);
      });
      const mk = (c, h, vc) => { const m = pbr(c, h, { rough: 0.5, bump: 2, nscale: 0.55, physical: true, sheen: 0.5, sheenColor: '#ffffff' }); m.sheenRoughness = 0.35; if (vc) { m.vertexColors = true; m.alphaTest = 0.5; m.side = THREE.DoubleSide; } return m; };
      // locks: strands along the tube (texture x) -> rotate the canvases 90 degrees
      const rot = (src) => { const c = cnv(S, S), g = c.getContext('2d'); g.translate(S / 2, S / 2); g.rotate(Math.PI / 2); g.drawImage(src, -S / 2, -S / 2); return c; };
      const shell = mk(p.c, p.h, true), lock = mk(rot(p.c), rot(p.h), false), plain = mk(p.c, p.h, false);
      lock.map.wrapS = lock.map.wrapT = THREE.RepeatWrapping; lock.normalMap.wrapS = lock.normalMap.wrapT = THREE.RepeatWrapping;
      shell.map.wrapS = shell.normalMap.wrapS = THREE.RepeatWrapping;
      return { shell, lock, plain };
    });
  }
  // base surface: head top disc -> bevel -> straight side down to yMin (never curls under the jaw)
  function baseProfile(yMin) {
    const pts = [], top = HH - HB, n1 = 10, n2 = 14;
    for (let i = 0; i <= n1; i++) pts.push({ r: (i / n1) * (HR - HB), y: HH, nr: 0, ny: 1 });
    for (let i = 1; i <= n2; i++) { const a = Math.PI / 2 - (i / n2) * Math.PI / 2; pts.push({ r: HR - HB + Math.cos(a) * HB, y: top + Math.sin(a) * HB, nr: Math.cos(a), ny: Math.sin(a) }); }
    const n3 = Math.ceil((top - yMin) / 0.03); for (let i = 1; i <= n3; i++) pts.push({ r: HR, y: top - (i / n3) * (top - yMin), nr: 1, ny: 0 });
    // resample by arc length
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].r - pts[i - 1].r, pts[i].y - pts[i - 1].y));
    return { pts, L, total: L[L.length - 1], at(s) { let i = 1; while (i < L.length - 1 && L[i] < s) i++; const a = pts[i - 1], b = pts[i], t = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1); const nr = a.nr + (b.nr - a.nr) * t, ny = a.ny + (b.ny - a.ny) * t, k = Math.hypot(nr, ny) || 1; return { r: a.r + (b.r - a.r) * t, y: a.y + (b.y - a.y) * t, nr: nr / k, ny: ny / k }; } };
  }
  // surface point on the base at (theta, y-ish) + normal: used to seat locks
  function seat(th, s01, yMin, out = 0) { const P = baseProfile(yMin), q = P.at(s01 * P.total); return { p: V3(Math.sin(th) * (q.r + q.nr * out), q.y + q.ny * out, Math.cos(th) * (q.r + q.nr * out)), n: V3(Math.sin(th) * q.nr, q.ny, Math.cos(th) * q.nr) }; }
  // o: { yMin, mask(th,y)->signed distance (>0 hair), thick(th,y), lockAmp }
  function hairShell(o, mat) {
    const P = baseProfile(o.yMin), NS = 70, NT = 128, pos = [], uv = [], col = [], keep = [];
    const ridge = (th) => Math.pow(Math.abs(Math.sin((NLOCK * th) / 2)), 0.6), n = fbm(191, 4, 3);
    for (let i = 0; i <= NS; i++) { const q = P.at((i / NS) * P.total);
      for (let j = 0; j <= NT; j++) { const th = -Math.PI + (j / NT) * Math.PI * 2, m = o.mask(th, q.y), w = SS(m, 0, 0.09);
        let off = 0.012 + w * (o.thick(th, q.y) + (o.lockAmp ?? 0.03) * ridge(th) * SS(q.r, 0.1, 0.4) + 0.02 * (n(j / NT, i / NS) - 0.5));
        pos.push(Math.sin(th) * (q.r + q.nr * off), q.y + q.ny * off, Math.cos(th) * (q.r + q.nr * off)); uv.push(j / NT + 0.5, 1 - i / NS);
        const a = clamp(0.5 + m / 0.025, 0, 1); col.push(1, 1, 1, a); keep.push(m > -0.06); } }
    const idx = [], I = (i, j) => i * (NT + 1) + j;
    for (let i = 0; i < NS; i++) for (let j = 0; j < NT; j++) { const a = I(i, j), b = I(i + 1, j), c = I(i, j + 1), d = I(i + 1, j + 1); if (keep[a] || keep[b] || keep[c]) idx.push(a, b, c); if (keep[b] || keep[d] || keep[c]) idx.push(b, d, c); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 4)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = mesh(geo, mat); m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5 }); return m;
  }
  const wrapA = (th) => Math.abs(Math.atan2(Math.sin(th), Math.cos(th)));
  // a face opening of half-width W (radians) under a hairline(th) ; bottom(a) = hair lower edge by |theta|
  function maskOf(W, hairline, bottom) {
    return (th, y) => { const a = wrapA(th), face = Math.max((a - W) * 0.6, y - hairline(a, th)); return Math.min(y - bottom(a), face); };
  }
  const lockOn = (mat, pts, r0, r1, rad) => taperTube(curve(pts), 24, 12, r0, rad || ((t) => r0 + (r1 - r0) * t), mat);
  PROPS.hair = function (style = 'short', color = '#3b2618', capColor) {   // 'cap': color = hair, capColor = cap
    const g = new THREE.Group(); g.name = 'hair_' + style; g.userData.attach = 'head';
    const M = hairMats(color), yMinOf = { bob: -0.5, ponytail: -0.3, pigtails: -0.3, curly: -0.3 };
    const yMin = yMinOf[style] ?? -0.25;
    const thick = (base, top) => (th, y) => base + (top - base) * SS(y, 0.15, 0.6);
    const scal = (a, amp, f) => amp * Math.abs(Math.sin(a * f));   // scalloped fringe tips
    let mask, th = thick(0.06, 0.09);
    if (style === 'short' || style === 'cap' || style === 'undercap') {
      mask = maskOf(1.25, (a, t) => 0.4 - 0.05 * SS(t, -0.6, 0.4) + scal(a, 0.025, 9), (a) => -0.18 + 0.28 * SS(a, Math.PI, 1.3) * 0 + 0.24 * Math.pow(Math.cos(a / 2), 2));
    } else if (style === 'bob') {
      mask = maskOf(0.95, (a) => 0.26 + 0.04 * (a / 0.95) + scal(a, 0.03, 12), (a) => -0.46 + 0.04 * Math.cos(a)); th = (t, y) => 0.08 + 0.05 * SS(y, 0.2, 0.6) + 0.07 * SS(-y, 0.0, 0.42);
    } else if (style === 'pigtails') {
      mask = maskOf(1.05, (a) => 0.27 + scal(a, 0.035, 11), (a) => -0.2 + 0.25 * Math.pow(Math.cos(a / 2), 2));
    } else if (style === 'bun') {
      mask = maskOf(1.2, (a) => 0.42 + 0.03 * Math.sin(a * 8), (a) => -0.1 + 0.2 * Math.pow(Math.cos(a / 2), 2)); th = thick(0.06, 0.1);
    } else if (style === 'spiky') {
      mask = maskOf(1.25, (a) => 0.42 + scal(a, 0.025, 8), (a) => -0.15 + 0.25 * Math.pow(Math.cos(a / 2), 2)); th = thick(0.05, 0.08);
    } else if (style === 'ponytail') {
      mask = maskOf(1.15, (a, t) => 0.34 + 0.08 * SS(t, -0.4, 0.5) + scal(a, 0.02, 10), (a) => -0.28 + 0.3 * Math.pow(Math.cos(a / 2), 2)); th = thick(0.06, 0.1);
    } else if (style === 'curly') {
      mask = maskOf(1.1, (a) => 0.3 + 0.04 * Math.abs(Math.sin(a * 7)), (a) => -0.28 + 0.25 * Math.pow(Math.cos(a / 2), 2)); th = thick(0.08, 0.1);
    }
    if (style === 'cap' || style === 'undercap') { const m0 = mask; mask = (t, y) => Math.min(m0(t, y), 0.17 - y); th = () => 0.035; }
    let shellMat = M.shell;
    if (style === 'curly') { shellMat = RBX.plushMat(color, '#' + new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.25).getHexString(), 192, 3).clone(); Object.assign(shellMat, { vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }); }
    g.add(hairShell({ yMin, mask, thick: th, lockAmp: style === 'curly' ? 0.0 : 0.03 }, shellMat));
    const S = (t, s01, out = 0.06) => seat(t, s01, yMin, out);
    if (style === 'short') {   // a little side-swept quiff
      [[-0.25, 0.14], [0.0, 0.16], [0.25, 0.13]].forEach(([t, r]) => { const a = S(t, 0.22, 0.04).p; g.add(lockOn(M.lock, [[a.x, a.y, a.z - 0.1], [a.x + 0.06, a.y + 0.1, a.z + 0.04], [a.x + 0.18, a.y + 0.05, a.z + 0.14]], r, 0.03)); });
    }
    if (style === 'pigtails') {
      const tie = new THREE.MeshPhysicalMaterial({ color: '#ff4f7a', roughness: 0.3, clearcoat: 1 });
      [-1, 1].forEach((sd) => { const b = mesh(new THREE.SphereGeometry(0.1, 16, 12), tie, sd * 0.69, 0.22, -0.12); g.add(b); const b2 = mesh(new THREE.SphereGeometry(0.1, 16, 12), tie, sd * 0.69, 0.3, -0.04); g.add(b2);
        g.add(mesh(new THREE.SphereGeometry(0.16, 20, 14), M.plain, sd * 0.64, 0.26, -0.1));
        g.add(lockOn(M.lock, [[sd * 0.72, 0.26, -0.1], [sd * 0.98, 0.18, -0.12], [sd * 1.12, -0.08, -0.1], [sd * 1.08, -0.38, -0.02]], 0.17, 0.03, (t) => 0.17 * Math.sin(Math.PI * (0.25 + 0.75 * t)) + 0.02)); });
      // centre parting
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.01, 0.5), new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.4) }), 0, 0.7, 0.05));
    }
    if (style === 'bun') {
      const bun = mesh(new THREE.SphereGeometry(0.3, 32, 24), M.lock, 0, 0.7, -0.3); bun.scale.set(1, 0.85, 1); bun.rotation.x = 0.6; g.add(bun);
      const pinM = surf('#2b2b2b', { rough: 0.3, key: 'hpin' }); [[-1], [1]].forEach(([sd]) => { const p = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.75, 8), pinM, sd * 0.05, 0.8, -0.3); p.rotation.z = sd * 1.1; p.rotation.x = 0.4; g.add(p); });
      // swept-back strands meeting the bun
      [-0.5, -0.17, 0.17, 0.5].forEach((t) => { const a = S(t, 0.15, 0.08).p; g.add(lockOn(M.lock, [[a.x, a.y, a.z], [a.x * 0.7, a.y + 0.06, a.z - 0.2], [0, 0.72, -0.2]], 0.1, 0.06)); });
    }
    if (style === 'spiky') {
      const r = rng(9);
      const spots = [[0, 0.02], [0.9, 0.12], [-0.9, 0.12], [2.2, 0.12], [-2.2, 0.12], [0.3, 0.2], [-0.3, 0.2], [1.3, 0.24], [-1.3, 0.24], [2.6, 0.26], [-2.6, 0.26], [Math.PI, 0.18], [0.05, 0.3], [0.7, 0.3], [-0.7, 0.3]];
      spots.forEach(([t, s01]) => { const q = S(t, s01, 0.0), front = wrapA(t) < 0.8; const dir = q.n.clone().multiplyScalar(0.8).add(V3(0, 0.45, front ? 0.15 : -0.75)).normalize(); const L = 0.36 + r() * 0.16, rr = 0.2 + r() * 0.05;
        const geo = new THREE.ConeGeometry(rr, L, 12, 4); geo.translate(0, L / 2, 0); const pp = geo.attributes.position; for (let k = 0; k < pp.count; k++) { const y = pp.getY(k) / L; pp.setZ(k, pp.getZ(k) * 0.6 - 0.12 * y * y); } geo.computeVertexNormals();
        const c = mesh(geo, M.plain); c.position.copy(q.p).addScaledVector(q.n, -0.04); c.quaternion.setFromUnitVectors(V3(0, 1, 0), dir); c.rotateY(front ? 0 : Math.PI); g.add(c); });
    }
    if (style === 'ponytail') {
      const tie = new THREE.MeshPhysicalMaterial({ color: '#2f6fd1', roughness: 0.3, clearcoat: 1 });
      const tr = mesh(new THREE.TorusGeometry(0.09, 0.04, 10, 20), tie, 0, 0.3, -0.72); g.add(tr);
      g.add(mesh(new THREE.SphereGeometry(0.13, 18, 12), M.plain, 0, 0.32, -0.64));
      g.add(lockOn(M.lock, [[0, 0.3, -0.72], [0, 0.2, -0.92], [0, -0.25, -0.86], [0, -0.75, -0.66], [0, -1.05, -0.6]], 0.14, 0.04, (t) => 0.13 * Math.sin(Math.PI * (0.3 + 0.7 * t)) + 0.035));
    }
    if (style === 'curly') {
      const r = rng(31), cm = RBX.plushMat(color, '#' + new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.25).getHexString(), 193, 1), P = baseProfile(yMin), sg = new THREE.SphereGeometry(1, 16, 12);
      for (let i = 0; i < 260; i++) { const t = (r() - 0.5) * Math.PI * 2, s01 = r() * 0.9, yy = P.at(s01 * P.total).y; if (mask(t, yy) < 0.04) continue;
        const rr = 0.09 + r() * 0.05, q = S(t, s01, 0.06 + rr * 0.3); const s = mesh(sg, cm); s.scale.setScalar(rr); s.position.copy(q.p); s.rotation.set(r() * 3, r() * 3, r() * 3); g.add(s); }
    }
    if (style === 'cap') g.add(ballCap(capColor || '#2f6fd1', null, 62));
    return g;
  };
})();
