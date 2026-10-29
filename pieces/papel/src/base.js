
// =====================================================================
//  BASE — the shot registry the scene files fill (SHOT_FN[key] = (lt, dur, t) => {...}), cached stages, camera helpers,
//  and THE FOLD CLOCK every file reads: foldAt(t) → { n, k } (n folds done, k 0..1 progress of the fold in flight).
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
function camPt(st, p, q, f, t, amt = 0.5, seed = 1) { camLook(st.cam, p[0], p[1], p[2], q[0], q[1], q[2]); fov(st, f); handheld(st.cam, t, amt, seed); }
const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const hsh = (i, k = 1) => mod(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453, 1);
// fold n completes at time FOLD_T[n] (each fold takes FOLD_D[n] seconds to swing over)
const FOLD_KEYS = [[0.4, 1], [1.4, 2], [2.4, 3], [3.4, 4], [4.6, 5], [5.4, 6], [6.2, 7], [6.9, 8], [7.5, 9], [8.1, 10], [8.6, 11], [9.1, 12], [9.6, 13], [10.4, 14], [14.6, 15], [15.2, 16], [15.8, 17], [16.4, 18], [17.0, 19], [17.6, 20], [18.2, 21], [19.6, 22], [21.0, 23], [22.6, 24], [23.4, 25], [24.2, 26], [25.4, 27], [27.6, 28], [28.4, 29], [29.4, 30], [31.6, 31], [32.4, 32], [33.4, 33], [34.0, 34], [34.6, 35], [35.2, 36], [35.8, 37], [36.4, 38], [37.0, 39], [37.6, 40], [38.6, 41], [39.4, 42], [42.0, 43], [42.6, 44], [43.2, 45], [43.8, 46], [44.4, 47], [45.0, 48], [45.4, 49], [45.8, 50], [46.2, 51], [47.0, 52]];
const FOLD_T = [0]; FOLD_KEYS.forEach(([t, n]) => (FOLD_T[n] = t));
// after 52: milestone keys (each lands on its shot), linear in between; 103 lands on the hit at 62.0
{ const K = [[47.0, 52], [48.4, 57], [50.0, 69], [52.0, 75], [54.0, 83], [56.2, 86], [57.8, 88], [59.5, 95], [61.0, 100], [61.4, 102]];
  for (let i = 0; i < K.length - 1; i++) { const [ta, na] = K[i], [tb, nb] = K[i + 1]; for (let n = na; n <= nb; n++) FOLD_T[n] = ta + (tb - ta) * (n - na) / (nb - na); } }
FOLD_T[103] = 62.0;
const foldDur = (n) => Math.max(0.08, Math.min(0.45, (FOLD_T[n] - (FOLD_T[n - 1] || 0)) * 0.8));
function foldAt(t) { let n = 0; while (n < 103 && FOLD_T[n + 1] <= t) n++; if (n >= 103) return { n: 103, k: 0 };
  const d = foldDur(n + 1), k = clamp((t - (FOLD_T[n + 1] - d)) / d); return { n, k }; }
const PAPER = 1e-4;                                      // 0.1 mm
const thickM = (n) => PAPER * Math.pow(2, n);            // metres after n folds
const LIGHTYEAR = 9.4607e15;
const fmtNum = (v) => (v >= 100 ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : v.toFixed(v >= 10 ? 1 : 2).replace('.', ','));
function fmtLen(m) { if (m < 0.01) return fmtNum(m * 1000) + ' mm'; if (m < 1) return fmtNum(m * 100) + ' cm'; if (m < 1000) return fmtNum(m) + ' m';
  const km = m / 1000, ly = m / LIGHTYEAR; if (km < 1e6) return fmtNum(km) + ' km'; if (km < 1e9) return fmtNum(km / 1e6) + ' millones de km'; if (ly < 0.1) return fmtNum(km / 1e9) + ' mil millones de km';
  if (ly < 1000) return fmtNum(ly) + ' años luz'; if (ly < 1e6) return fmtNum(ly / 1e3) + ' mil años luz'; if (ly < 1e9) return fmtNum(ly / 1e6) + ' millones de años luz'; return fmtNum(ly / 1e9) + ' mil millones de años luz'; }
