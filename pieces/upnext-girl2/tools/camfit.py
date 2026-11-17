"""Refine the turntable camera + per-frame angles against the current mesh (hard raster, class agreement).
python tools/camfit.py <in.npz> <out.npz> [--scale S] [--rounds N]"""
import sys, json, argparse, numpy as np
sys.path.insert(0, "tools")
from raster import raster
from scipy.optimize import minimize
from scipy import ndimage as nd
ap = argparse.ArgumentParser(); ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--scale", type=float, default=0.25); ap.add_argument("--rounds", type=int, default=2)
ap.add_argument("--nocam", action="store_true")
a = ap.parse_args()
D = dict(np.load(a.inp, allow_pickle=True)); V, F, C = D["V"], D["F"], D["C"]
cam = json.loads(str(D["cam"])) if "cam" in D else json.load(open("ref/cam1.json"))
A = (D["alphas"] if "alphas" in D else np.load("ref/alphas.npy")).astype(float).copy()
CL = np.load("ref/cls.npz")["c"]; S = a.scale; k = int(round(1 / S)); w, h = int(1080 * S), int(1920 * S)
HC = [CL[i][k // 2::k, k // 2::k][:h, :w] for i in range(250)]


def score(c, al, i):
    fid, _, _ = raster(V, F, c, al, S, wh=(w, h))
    ours = np.where(fid >= 0, C[np.clip(fid, 0, None)], 0); his = HC[i]
    a_, b_ = ours > 0, his > 0
    return (((ours == his) & a_).sum()) / max(1, (a_ | b_).sum())


def mean_score(c, frames): return float(np.mean([score(c, A[i], i) for i in frames]))


KEYS = ["phi", "roll", "u", "f", "tz"]
for rnd in range(a.rounds):
    if not a.nocam:
        fr = list(range(0, 250, 10))
        def fun(x):
            c = dict(cam); c.update(dict(zip(KEYS, x))); return -mean_score(c, fr)
        x0 = [cam[q] for q in KEYS]; st = [0.5, 0.3, 0.004, 1.5, 0.004]
        sim = [x0] + [[x0[j] + (st[i] if j == i else 0) for j in range(len(x0))] for i in range(len(x0))]
        r = minimize(fun, x0, method="Nelder-Mead", options=dict(maxiter=80, initial_simplex=sim, xatol=1e-4, fatol=1e-6))
        s0 = -fun(x0); cam.update(dict(zip(KEYS, map(float, r.x))))
        print(f"round {rnd} cam score {s0:.4f} -> {-r.fun:.4f}", {q: round(cam[q], 4) for q in KEYS}, flush=True)
    sc = []
    for i in range(250):
        best = None
        for da in np.arange(-1.5, 1.51, 0.25):
            s = score(cam, A[i] + da, i)
            if best is None or s > best[0]: best = (s, da)
        # parabolic refinement
        s_m, s_p = score(cam, A[i] + best[1] - 0.25, i), score(cam, A[i] + best[1] + 0.25, i)
        den = s_m - 2 * best[0] + s_p; off = 0.125 * (s_m - s_p) / den if den < 0 else 0.0
        A[i] += best[1] + np.clip(off, -0.25, 0.25); sc.append(best[0])
    A = nd.gaussian_filter1d(A, 1.0, mode="nearest")
    print(f"round {rnd} angles: mean class agreement {np.mean(sc):.4f} min {np.min(sc):.4f}", flush=True)
D["cam"] = json.dumps(cam); D["alphas"] = A
np.savez(a.out, **D); print("saved", a.out)
