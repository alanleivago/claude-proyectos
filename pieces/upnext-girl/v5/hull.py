"""Visual hull of his turntable (12:14-12:24, period 10 s = 50 frames at 5 fps, -7.2 deg/frame).
Model rotates on the turntable = camera orbits at theta(k) = theta0 - 7.2 k with the shared camera of fit.py."""
import numpy as np, json, sys, math
sys.path.insert(0, "."); from fit import cam_basis, W0, H0
from scipy import ndimage as nd
MS = np.unpackbits(np.load("turn5_masks.npy"), axis=-1)[..., :W0].astype(bool)


def masks(scale):
    k = int(round(1 / scale))
    return MS[:, ::k, ::k]


def proj_pts(P, p, scale):
    C, R, U, F = cam_basis(p); q = P - C
    fpx = p["f"] / 36.0 * W0
    z = q @ F
    return (W0 / 2 + fpx * (q @ R) / z) * scale, (H0 / 2 - fpx * (q @ U) / z) * scale


def grid(step, lo=(-6.0, -6.0, -12.0), hi=(6.0, 6.0, 7.0)):
    xs, ys, zs = [np.arange(a, b, step) for a, b in zip(lo, hi)]
    G = np.stack(np.meshgrid(xs, ys, zs, indexing="ij"), -1)
    return G.reshape(-1, 3), (len(xs), len(ys), len(zs)), np.array(lo)


def carve(cam, frames, step=0.15, scale=0.125, theta0=0.0, slack=0):
    P, shape, lo = grid(step)
    M = masks(scale); occ = np.ones(len(P), bool)
    h, w = M.shape[1:]
    for k in frames:
        m = M[k]
        if slack: m = nd.binary_dilation(m, iterations=slack)
        p = dict(cam); p["theta"] = theta0 - 7.2 * k
        x, y = proj_pts(P[occ], p, scale); xi, yi = x.astype(int), y.astype(int)
        ok = (xi >= 0) & (xi < w) & (yi >= 0) & (yi < h)
        inside = np.zeros(len(xi), bool); inside[ok] = m[yi[ok], xi[ok]]
        idx = np.nonzero(occ)[0]; occ[idx[~inside]] = False
    return P, occ, shape, lo


def consistency(cam, frames, step=0.15, scale=0.125, theta0=0.0):
    P, occ, shape, lo = carve(cam, frames, step, scale, theta0)
    M = masks(scale); h, w = M.shape[1:]; sc = []
    for k in frames:
        p = dict(cam); p["theta"] = theta0 - 7.2 * k
        x, y = proj_pts(P[occ], p, scale); xi, yi = np.clip(x.astype(int), 0, w - 1), np.clip(y.astype(int), 0, h - 1)
        r = np.zeros((h, w), bool); r[yi, xi] = True; r = nd.binary_closing(nd.binary_dilation(r, iterations=1), iterations=1)
        sc.append((r & M[k]).sum() / max(1, (r | M[k]).sum()))
    return float(np.mean(sc)), occ.sum()
