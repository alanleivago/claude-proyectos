// =====================================================================
//  NET — a real 2 -> 10 -> 10 -> 1 network (tanh, tanh, sigmoid): 2*10+10 + 10*10+10 + 10+1 = 151 weights.
//  Trained here, once, deterministically, by plain full-batch gradient descent on two interleaved moons.
//  Everything the piece shows about it (the error, the boundary, the 151, the descent) is read from this.
// =====================================================================
const NN = (() => {
  let s = 20261013;   // its own seeded generator, so the training never depends on draw order
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
  // data: two moons, 100 points each, in [-1.6, 1.6]
  const X = [], Y = [];
  for (let i = 0; i < 200; i++) {
    const c = i % 2, a = Math.PI * rnd();
    let x = c ? 1 - Math.cos(a) : Math.cos(a), y = c ? 0.5 - Math.sin(a) : Math.sin(a);
    x = (x - 0.5) * 1.25 + gauss() * 0.11; y = (y - 0.25) * 1.6 + gauss() * 0.11;
    X.push([x, y]); Y.push(c);
  }
  // unseen test points for the end (drawn from the same moons)
  const XT = [];
  for (let i = 0; i < 26; i++) { const c = i % 2, a = Math.PI * rnd(); let x = c ? 1 - Math.cos(a) : Math.cos(a), y = c ? 0.5 - Math.sin(a) : Math.sin(a); XT.push([(x - 0.5) * 1.25 + gauss() * 0.08, (y - 0.25) * 1.6 + gauss() * 0.08, c]); }
  const L = [2, 10, 10, 1];
  const init = () => { const W = []; for (let l = 0; l < 3; l++) { const m = [], b = []; for (let j = 0; j < L[l + 1]; j++) { const r = []; for (let i = 0; i < L[l]; i++) r.push(gauss() * 1.3); m.push(r); b.push(gauss() * 0.4); } W.push({ m, b }); } return W; };
  const clone = (W) => W.map((l) => ({ m: l.m.map((r) => r.slice()), b: l.b.slice() }));
  const flat = (W) => { const v = []; W.forEach((l) => { l.m.forEach((r) => v.push(...r)); v.push(...l.b); }); return v; };
  function forward(W, x) {
    const A = [x];
    for (let l = 0; l < 3; l++) { const a = A[l], o = []; for (let j = 0; j < L[l + 1]; j++) { let z = W[l].b[j]; for (let i = 0; i < L[l]; i++) z += W[l].m[j][i] * a[i]; o.push(l < 2 ? Math.tanh(z) : 1 / (1 + Math.exp(-z))); } A.push(o); }
    return A;
  }
  const predict = (W, x, y) => forward(W, [x, y])[3][0];
  function loss(W) { let e = 0; for (let k = 0; k < X.length; k++) { const p = Math.min(1 - 1e-7, Math.max(1e-7, predict(W, X[k][0], X[k][1]))); e -= Y[k] ? Math.log(p) : Math.log(1 - p); } return e / X.length; }
  // one full-batch gradient step; returns the gradient (for the blame picture) and applies it
  function grad(W) {
    const G = W.map((l) => ({ m: l.m.map((r) => r.map(() => 0)), b: l.b.map(() => 0) }));
    for (let k = 0; k < X.length; k++) {
      const A = forward(W, X[k]); let d = [A[3][0] - Y[k]];   // dLoss/dz at the sigmoid output
      for (let l = 2; l >= 0; l--) {
        for (let j = 0; j < L[l + 1]; j++) { G[l].b[j] += d[j] / X.length; for (let i = 0; i < L[l]; i++) G[l].m[j][i] += d[j] * A[l][i] / X.length; }
        if (l > 0) { const nd = []; for (let i = 0; i < L[l]; i++) { let s2 = 0; for (let j = 0; j < L[l + 1]; j++) s2 += W[l].m[j][i] * d[j]; nd.push(s2 * (1 - A[l][i] * A[l][i])); } d = nd; }
      }
    }
    return G;
  }
  const step = (W, G, lr) => { W.forEach((l, li) => { l.m.forEach((r, j) => r.forEach((_, i) => (r[i] -= lr * G[li].m[j][i]))); l.b.forEach((_, j) => (l.b[j] -= lr * G[li].b[j])); }); };
  // train: keep a snapshot every 4 epochs and the error every epoch
  const W0 = init(), W = clone(W0), EPOCHS = 2400, SNAP = 4, snaps = [clone(W)], err = [loss(W)];
  let G0 = null;
  for (let e = 1; e <= EPOCHS; e++) {
    const G = grad(W); if (e === 1) G0 = G;
    step(W, G, e < 1200 ? 0.6 : 0.4);
    err.push(loss(W)); if (e % SNAP === 0) snaps.push(clone(W));
  }
  const acc = (Wx) => X.reduce((a, x, k) => a + ((predict(Wx, x[0], x[1]) > 0.5) === !!Y[k]), 0) / X.length;
  const accTest = (Wx) => XT.reduce((a, x) => a + ((predict(Wx, x[0], x[1]) > 0.5) === !!x[2]), 0) / XT.length;
  // the landscape: a slice through two output weights (the error is convex in them: a clean bowl), others at the end values
  const WF = clone(W), oi = [3, 7];
  const ow = oi.map((i) => WF[2].m[0][i]);
  function sliceLoss(a, b) { const Wt = clone(WF); Wt[2].m[0][oi[0]] = a; Wt[2].m[0][oi[1]] = b; return loss(Wt); }
  const RANGE = 4.2, NG = 34, surf = [];
  for (let gy = 0; gy <= NG; gy++) { const r = []; for (let gx = 0; gx <= NG; gx++) r.push(sliceLoss(ow[0] - RANGE + 2 * RANGE * gx / NG, ow[1] - RANGE + 2 * RANGE * gy / NG)); surf.push(r); }
  // a real descent on that slice from a far corner: gradient by finite differences, fixed learning rate
  const path = []; let a = ow[0] + RANGE * 0.88, b = ow[1] + RANGE * 0.8;
  for (let k = 0; k < 120; k++) {
    const h = 1e-3, f = sliceLoss(a, b); path.push([a, b, f]);
    const ga = (sliceLoss(a + h, b) - f) / h, gb = (sliceLoss(a, b + h) - f) / h;
    a -= 1.6 * ga; b -= 1.6 * gb;
  }
  return { X, Y, XT, L, W0, WF, snaps, SNAP, err, EPOCHS, G0, forward, predict, loss, flat, acc, accTest, ow, RANGE, NG, surf, path, count: flat(W0).length };
})();
if (typeof module !== 'undefined') module.exports = NN;
