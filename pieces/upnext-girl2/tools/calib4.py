"""Alternate: camera params by hull consistency (given per-frame angles) <-> per-frame angles by reprojection IoU."""
import os, sys; sys.path.insert(0, "tools")
import numpy as np, json
import calib
from calib import carve, reproj, normalize, minimize, MS
from cam import alpha_of
from scipy import ndimage as nd

def setres(sc):
    k = int(round(1 / sc)); calib.SC = sc; calib.M = MS[:, ::k, ::k]; calib.h, calib.w = calib.M.shape[1:]

def grid2(step):
    xs, ys, zs = np.arange(-0.25, 0.42, step), np.arange(-0.26, 0.28, step), np.arange(-0.06, 1.68, step)
    return np.stack(np.meshgrid(xs, ys, zs, indexing="ij"), -1).reshape(-1, 3)
calib.grid = lambda step, **kw: grid2(step)

p = json.load(open("ref/cam0.json")); A = np.load("ref/alphas.npy")
FR = list(range(0, 250, 5))

def cons(q, fr, step):
    Q = carve(q, fr, step, alphas=A[fr])
    if len(Q) < 100: return 0.0
    M = calib.M
    return float(np.mean([(lambda r: (r & M[k]).sum() / max(1, (r | M[k]).sum()))(reproj(Q, q, k, a=A[k])) for k in fr]))

def norm2(q, fr, step):
    for _ in range(2):
        Q = carve(q, fr, step, alphas=A[fr])
        z0, z1 = np.percentile(Q[:, 2], 0.2), Q[:, 2].max(); s = 1.6 / (z1 - z0)
        q["d"] *= s; q["u"] *= s; q["tz"] *= s
        Q = carve(q, fr, step, alphas=A[fr]); q["tz"] -= np.percentile(Q[:, 2], 0.2)
    return q

KEYS = ["phi", "u", "roll", "f"]
for rnd in range(3):
    setres(0.125)
    def fun(x):
        q = dict(p); q.update(dict(zip(KEYS, x))); q = norm2(q, FR, 0.016); return -cons(q, FR, 0.012)
    x0 = [p[k] for k in KEYS]; st = [1.5, 0.01, 0.5, 6]
    sim = [x0] + [[x0[j] + (st[i] if j == i else 0) for j in range(len(x0))] for i in range(len(x0))]
    r = minimize(fun, x0, method="Nelder-Mead", options=dict(maxiter=120, initial_simplex=sim, xatol=1e-3, fatol=1e-5))
    p.update(dict(zip(KEYS, map(float, r.x)))); p = norm2(p, FR, 0.012)
    print("round", rnd, "cam", round(-r.fun, 4), {k: round(float(v), 4) for k, v in p.items() if k in ("phi", "u", "roll", "f", "d", "tz")}, flush=True)
    setres(0.25)
    fr = list(range(0, 250, 3)); Q = carve(p, fr, 0.006, alphas=A[fr]); sc = []
    for k in range(250):
        best = None
        for da in np.arange(-3.0, 3.01, 0.25):
            rr = reproj(Q, p, k, a=A[k] + da); s = (rr & calib.M[k]).sum() / (rr | calib.M[k]).sum()
            if best is None or s > best[0]: best = (s, da)
        A[k] += best[1]; sc.append(best[0])
    A = nd.uniform_filter1d(A, 3, mode="nearest") if rnd < 2 else A
    print("round", rnd, "angles IoU", round(float(np.mean(sc)), 4), round(float(np.min(sc)), 4), flush=True)
    np.save("ref/alphas.npy", A); np.save("ref/alpha_iou.npy", np.array(sc)); json.dump({k: float(v) for k, v in p.items()}, open("ref/cam1.json", "w"), indent=1)
