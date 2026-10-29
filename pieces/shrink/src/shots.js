// =====================================================================
//  SHOTS — shared camera helpers. Each scene file (home, micro, milk, nano) adds its own SHOT_FN.<key> for its shots
//  and builds its own stage(s) with once(). A shot with no function yet draws a placeholder.
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
function camPt(st, p, q, f, t, amt = 0.4, seed = 1) { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); fov(st, f); handheld(st.cam, t, amt, seed); }
const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
function placeholder(key) { fillAll('#2a2f3a'); pvText(key, CX, 900, 60, { align: 'center' }); }
SHOT_FN.card = () => {};
