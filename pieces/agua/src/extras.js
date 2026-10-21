
// =====================================================================
//  EXTRAS — the sun's lens flare (2D, from the sun's screen position), autumn leaves tumbling over the paving in the wind,
//  sparrows hopping and pecking around the bench, a flock of small birds crossing the sky.
// =====================================================================
function lensFlare(st, on = 1) {
  const s = st.cam.position.clone().addScaledVector(SUND, 5000).project(st.cam); if (s.z > 1) return;
  const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, k = on * clamp(1.5 - Math.hypot(s.x, s.y * 0.7) * 0.85); if (k <= 0.01) return;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  pvGlow(x, y, 560, 'rgba(255,226,180,0.55)', k); pvGlow(x, y, 140, 'rgba(255,255,250,0.95)', k);
  ctx.globalAlpha = 0.3 * k; ctx.strokeStyle = '#fff6e8'; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI + 0.15, L = 240 + 140 * Math.sin(i * 2.3); ctx.lineWidth = i % 3 ? 1.4 : 3; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * L, y - Math.sin(a) * L); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke(); }
  const vx = CX - x, vy = H / 2 - y; [[0.32, 50, '255,200,140', 0.2], [0.58, 96, '170,210,255', 0.12], [0.82, 32, '255,170,120', 0.25], [1.22, 140, '200,170,255', 0.08], [1.55, 64, '255,220,160', 0.14], [1.88, 20, '255,255,255', 0.3]].forEach(([f, r, col, a]) => {
    const gx = x + vx * f, gy = y + vy * f, gr = ctx.createRadialGradient(gx, gy, r * 0.45, gx, gy, r); gr.addColorStop(0, `rgba(${col},${a * 0.4 * k})`); gr.addColorStop(0.85, `rgba(${col},${a * k})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, r, 0, TAU); ctx.fill(); });
  ctx.restore(); }
function buildExtras(st) {
  const R = RNG('extras'), E = {};
  // leaves: curled cards in autumn colours; each drifts downwind, tumbles, skips
  const leafT = g3Tex((x, w) => { x.clearRect(0, 0, w, w); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(w * 0.5, w * 0.04); x.bezierCurveTo(w * 0.95, w * 0.3, w * 0.85, w * 0.8, w * 0.5, w * 0.96); x.bezierCurveTo(w * 0.15, w * 0.8, w * 0.05, w * 0.3, w * 0.5, w * 0.04); x.fill();
    x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(w * 0.5, w * 0.08); x.lineTo(w * 0.5, w * 0.95); for (let k = 1; k < 5; k++) { x.moveTo(w * 0.5, w * k * 0.18); x.lineTo(w * 0.25, w * (k * 0.18 - 0.1)); x.moveTo(w * 0.5, w * k * 0.18); x.lineTo(w * 0.75, w * (k * 0.18 - 0.1)); } x.stroke(); }, 64, 64);
  const lg = new THREE.PlaneGeometry(0.1, 0.13, 2, 2); { const p = lg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.012 * (p.getX(i) / 0.035) ** 2); lg.computeVertexNormals(); }
  E.leaves = IM(lg, STDm({ map: leafT, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), 420, false); E.lL = [];
  for (let i = 0; i < 420; i++) { E.lL.push({ x: R.r(-16, 16), z: R.r(-9.4, 9), sp: R.r(0.3, 1.3), ph: R.r(0, 6), fly: R.f() < 0.25 }); E.leaves.setColorAt(i, lin(R.pick(['#c8641e', '#d8901e', '#a8441a', '#e0b030', '#8a5a2a', '#b87830']))); }
  st.scene.add(E.leaves);
  // sparrows around the bench
  const brown = STDm({ color: '#8a6440', roughness: 0.8 }), cream = STDm({ color: '#e0d0b0' }), beakM = STDm({ color: '#2a2420' });
  E.sp = []; [[-0.9, -0.9], [0.8, -1.3], [1.4, -0.6], [-1.6, -1.6], [0.2, -2.2], [-0.4, -1.4]].forEach(([x, z0], k) => { const z = z0 + BENCHZ + 0.4; const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10).scale(1.4, 1, 1), brown); b.position.y = 0.05; g.add(b);
    const be = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8).scale(1.2, 0.9, 1), cream); be.position.set(0.01, 0.04, 0); g.add(be); const h = new THREE.Group(); h.position.set(0.055, 0.085, 0); g.add(h); h.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), brown)); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.025, 6).rotateZ(-Math.PI / 2), beakM); bk.position.x = 0.035; h.add(bk);
    [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), beakM); e.position.set(0.02, 0.01, s * 0.022); h.add(e); }); const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.006, 0.03), brown); tl.position.set(-0.07, 0.07, 0); tl.rotation.z = 0.4; g.add(tl);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; }); st.scene.add(g); E.sp.push({ g, h, x, z, ph: R.r(0, 6), yaw: R.r(0, 6) }); });
  // a flock crossing the sky
  const fb = STDm({ color: '#2a2a2a' }); E.flock = []; for (let k = 0; k < 16; k++) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.16, 4, 8).rotateZ(Math.PI / 2), fb)); const w = [-1, 1].map((s) => { const p = new THREE.Group(); g.add(p); const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.01, 0.32).translate(0, 0, s * 0.16), fb); p.add(m); return p; }); st.scene.add(g); E.flock.push({ g, w, o: new THREE.Vector3(R.n(6), R.n(2.5), R.n(6)), ph: R.r(0, 6) }); }
  return E; }
function poseExtras(E, ts) {
  E.lL.forEach((l, i) => { const run = ts * l.sp * 0.9 + l.ph * 3, x = ((l.x + run + 16) % 32 + 32) % 32 - 16, hop = l.fly ? Math.max(0, Math.sin(ts * 2.2 + l.ph)) * 0.35 : Math.abs(Math.sin(ts * 3.1 * l.sp + l.ph)) * 0.025;
    E.leaves.setMatrixAt(i, M4c(x, 0.012 + hop, l.z + 0.3 * Math.sin(ts * 0.7 + l.ph), ts * 2.0 * l.sp + l.ph, 1, 1, 1, -Math.PI / 2 + (l.fly ? ts * 5 * l.sp : 0.25 * Math.sin(ts * 4 + l.ph)), 0.3 * Math.sin(ts * 3 + i))); }); E.leaves.instanceMatrix.needsUpdate = true;
  E.sp.forEach((b, i) => { const c = mod(ts * 0.9 + b.ph, 2.4), hopK = c < 0.35 ? Math.sin(c / 0.35 * Math.PI) : 0, step = Math.floor((ts * 0.9 + b.ph) / 2.4), peck = c > 0.8 && c < 1.6 ? Math.abs(Math.sin((c - 0.8) * 12)) : 0;
    const a = b.yaw + step * 1.3; b.g.position.set(b.x + 0.12 * Math.sin(step * 2.1 + i), 0.08 * hopK, b.z + 0.12 * Math.cos(step * 1.7 + i)); b.g.rotation.y = a; b.h.rotation.z = -0.9 * peck; });
  E.flock.forEach((f, i) => { const u = ts * 0.06 + 0.1; f.g.position.set(lerp(-90, 120, mod(u, 1)) + f.o.x, 26 + f.o.y + 3 * Math.sin(ts * 0.5), -70 + f.o.z); f.g.rotation.y = 0; const fl = 0.7 * Math.sin(ts * 12 + f.ph); f.w[0].rotation.x = fl; f.w[1].rotation.x = -fl; });
}
// the water drop symbol (title, HUD)
function dropIcon(x, y, s, a = 1) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; const g = ctx.createLinearGradient(-40, -60, 40, 60); g.addColorStop(0, '#9fdcff'); g.addColorStop(0.5, '#3fa4f0'); g.addColorStop(1, '#1d63c8'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, -62); ctx.bezierCurveTo(10, -36, 44, -6, 44, 22); ctx.bezierCurveTo(44, 48, 24, 64, 0, 64); ctx.bezierCurveTo(-24, 64, -44, 48, -44, 22); ctx.bezierCurveTo(-44, -6, -10, -36, 0, -62); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(-18, 18, 8, 18, -0.4, 0, TAU); ctx.fill(); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }
