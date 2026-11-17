import json, numpy as np, sys
sys.path.insert(0, "."); from fit import *
from scipy.optimize import minimize
SC = 0.25
T = {k: np.load(f"tris_v4_{k}.npz") for k in ("turn", "hip")}
HC = {v: his_cls(v, SC) for v in ("front", "q3", "side", "back")}


def sc(tk, view, p): return cls_score(raster_cls(T[tk]["tris"], T[tk]["col"], p, SC), HC[view])


def place(tk, view, p):
    hm = HC[view] != 0; ys, xs = np.nonzero(hm)
    for _ in range(3):
        om = raster_cls(T[tk]["tris"], T[tk]["col"], p, SC) != 0; oy, ox = np.nonzero(om)
        p["dist"] *= (oy.max() - oy.min()) / (ys.max() - ys.min())
        om = raster_cls(T[tk]["tris"], T[tk]["col"], p, SC) != 0; oy, ox = np.nonzero(om)
        k = p["dist"] / (p["f"] / 36 * W0) / SC
        p["u"] -= (xs.mean() - ox.mean()) * k; p["v"] += (ys.mean() - oy.mean()) * k
    return p


def nm(fun, x0, st, it=300):
    sim = [x0] + [[x0[j] + (st[i] if j == i else 0) for j in range(len(x0))] for i in range(len(x0))]
    r = minimize(fun, x0, method="Nelder-Mead", options=dict(maxiter=it, initial_simplex=sim, xatol=1e-3, fatol=1e-5))
    return r.x, -r.fun


cams = {}
# front rest (viewport): independent camera
best = None
for th in (-20, -10, 0, 10, 20):
    p = place("turn", "front", dict(theta=th, phi=5, dist=45, u=0, v=0, roll=0, f=50))
    keys = ["theta", "phi", "dist", "u", "v", "roll"]
    x, s = nm(lambda x: -sc("turn", "front", {**p, **dict(zip(keys, x))}), [p[k] for k in keys], [6, 4, 3, .3, .3, 2])
    print("front", th, round(s, 3), np.round(x, 2))
    if not best or s > best[1]: best = ({**p, **dict(zip(keys, x))}, s)
cams["front"] = best[0]
# turntable: per-view theta scan with shared camera, then joint refine
init = {"q3": range(-80, 1, 10), "side": range(-130, -49, 10), "back": range(130, 251, 10)}
th0 = {}
for v, rng in init.items():
    res = []
    for th in rng:
        p = place("hip", v, dict(theta=th, phi=5, dist=42, u=0, v=0, roll=0, f=50)); res.append((sc("hip", v, p), th, p))
    res.sort(key=lambda r: -r[0]); print(v, [(round(a, 3), b) for a, b, _ in res[:4]]); th0[v] = res[0][2]
for v in init:
    p = th0[v]; keys = ["theta", "phi", "dist", "u", "v", "roll"]
    x, s = nm(lambda x: -sc("hip", v, {**p, **dict(zip(keys, x))}), [p[k] for k in keys], [6, 4, 3, .3, .3, 2])
    cams[v] = {**p, **dict(zip(keys, x))}; print(v, round(s, 3), {k: round(float(cams[v][k]), 2) for k in keys})
json.dump({k: {a: float(b) for a, b in v.items()} for k, v in cams.items()}, open("cams.json", "w"), indent=1)
