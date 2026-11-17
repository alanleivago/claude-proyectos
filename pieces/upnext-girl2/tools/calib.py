import numpy as np, json, sys, time
sys.path.insert(0, "tools"); from cam import *
from scipy import ndimage as nd
from scipy.optimize import minimize
d = np.load("ref/masks.npz"); MS = np.unpackbits(d["m"], axis=-1)[..., :W0].astype(bool)
SC = float(__import__("os").environ.get("SC", "0.125")); _k = int(round(1 / SC)); M = MS[:, ::_k, ::_k]; h, w = M.shape[1:]


def grid(step, lo=(-0.55, -0.55, -0.35), hi=(0.55, 0.55, 1.95)):
    xs, ys, zs = [np.arange(a, b, step) for a, b in zip(lo, hi)]
    return np.stack(np.meshgrid(xs, ys, zs, indexing="ij"), -1).reshape(-1, 3)


def carve(p, frames, step, alphas=None):
    P = grid(step); occ = np.ones(len(P), bool)
    for i, k in enumerate(frames):
        a = alphas[i] if alphas is not None else alpha_of(k, p)
        idx = np.nonzero(occ)[0]
        x, y, _ = project(P[idx], p, a, SC); xi, yi = x.astype(int), y.astype(int)
        ok = (xi >= 0) & (xi < w) & (yi >= 0) & (yi < h)
        ins = np.zeros(len(idx), bool); ins[ok] = M[k][yi[ok], xi[ok]]
        occ[idx[~ins]] = False
    return P[occ]


def reproj(Q, p, k, a=None, dil=1):
    x, y, _ = project(Q, p, alpha_of(k, p) if a is None else a, SC)
    xi, yi = np.clip(x.astype(int), 0, w - 1), np.clip(y.astype(int), 0, h - 1)
    r = np.zeros((h, w), bool); r[yi, xi] = True
    return nd.binary_closing(nd.binary_dilation(r, iterations=dil), iterations=1)


def consistency(p, frames, step):
    Q = carve(p, frames, step)
    if len(Q) < 100: return 0.0, Q
    s = [(reproj(Q, p, k) & M[k]).sum() / max(1, (reproj(Q, p, k) | M[k]).sum()) for k in frames]
    return float(np.mean(s)), Q


def normalize(p, frames, step):
    """scale d so the carved model is 1.6 tall from z=0 (soles)"""
    for _ in range(3):
        Q = carve(p, frames, step)
        if len(Q) < 100: return p
        z0, z1 = np.percentile(Q[:, 2], 0.2), Q[:, 2].max()
        s = 1.6 / (z1 - z0); p["d"] *= s; p["u"] *= s; p["tz"] *= s
        Q = carve(p, frames, step); z0 = np.percentile(Q[:, 2], 0.2)
        p["tz"] -= z0
    return p


if __name__ == "__main__":
    fr = list(range(0, 250, 5))
    base = dict(phi=5.0, d=2.8, u=0.0, v=0.0, roll=0.0, f=50.0, a0=0.0, T=360.0, ka=0.0, kb=249.0, sign=1.0)
    for sign in (1.0, -1.0):
        p = dict(base, sign=sign); p = normalize(p, fr, 0.02)
        s, Q = consistency(p, fr, 0.02); print("sign", sign, round(s, 4), len(Q), {k: round(v, 3) for k, v in p.items()})
