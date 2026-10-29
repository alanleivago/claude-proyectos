
// ---- the dispatcher: each shot renders its own stage; captions and HUD on top
const shotAt = (t) => SHOTS.find(([, a, b]) => t >= a && t < b) || SHOTS[SHOTS.length - 1];
function sceneMain() {
  const t = TT, [key, t0, t1] = shotAt(t), fn = SHOT_FN[key];
  // motion blur on camera moves: pose the camera half a frame earlier (no render), then smear the frame along the turn
  let prev = null; const tp = t - 1 / 48; if (fn && key !== 'card' && tp >= t0) { CAMONLY = true; CAMREC = null; fn(tp - t0, t1 - t0, tp); CAMONLY = false; prev = CAMREC; }
  if (fn) fn(t - t0, t1 - t0, t); else placeholder(key);
  if (prev && CAMREC) camBlur(prev, CAMREC);
  if (key !== 'card') { vignette(0.35); grain(t, 0.03); }
  if (typeof overlays === 'function') overlays(t);
}
let MBC = null;
function camBlur(a, b) { // a, b: camera records; screen motion of the view centre from the rotation (and a little from the travel)
  const f = (H / 2) / Math.tan(b.fov * DEG / 2), qd = b.q.clone().invert().multiply(a.q), fw = new THREE.Vector3(0, 0, -1).applyQuaternion(qd);
  let dx = -(fw.x / -fw.z) * f, dy = (fw.y / -fw.z) * f; const L = Math.hypot(dx, dy); if (!(L > 2.5) || L > 400) return;
  const k = Math.min(1, 70 / L); dx *= k; dy *= k; if (!MBC) { MBC = document.createElement('canvas'); MBC.width = W; MBC.height = H; }
  const x = MBC.getContext('2d'); x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0); ctx.save(); screen();
  for (let i = 1; i <= 6; i++) { ctx.globalAlpha = 0.16 * (1 - i / 8); ctx.drawImage(MBC, dx * i / 6, dy * i / 6, W, H); } ctx.restore(); }
