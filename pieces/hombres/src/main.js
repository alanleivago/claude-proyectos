
// ---- the dispatcher: each shot renders its own stage; captions and HUD on top
const shotAt = (t) => SHOTS.find(([, a, b]) => t >= a && t < b) || SHOTS[SHOTS.length - 1];
function sceneMain() {
  const t = TT, [key, t0, t1] = shotAt(t), fn = SHOT_FN[key];
  if (fn) fn(t - t0, t1 - t0, t); else fillAll('#101010');
  if (key !== 'card') { vignette(0.35); grain(t, 0.03); }
  if (typeof overlays === 'function') overlays(t);
}
