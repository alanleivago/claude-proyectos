
// =====================================================================
//  BASE — the shot registry the scene files fill (SHOT_FN[key] = (lt, dur, t) => {...}), cached stages, camera helpers
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
function camPt(st, p, q, f, t, amt = 0.5, seed = 1) { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); fov(st, f); handheld(st.cam, t, amt, seed); }
const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
// the fire library's shared clock (fire.js shaders read it)
const FIRE_T = { value: 0 };
const hsh = (i, k = 1) => mod(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453, 1);
