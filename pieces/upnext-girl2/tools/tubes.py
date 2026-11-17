"""Generalised-cylinder parts fitted to the visual hull by ray casting from an axis polyline."""
import numpy as np
from scipy import ndimage as nd


class Hull:
    def __init__(self, path="ref/hull.npz"):
        h = np.load(path); self.shape = tuple(h["shape"])
        self.vol = np.unpackbits(h["vol"])[:np.prod(self.shape)].reshape(self.shape).astype(bool)
        self.lo, self.st = h["lo"], float(h["step"])

    def inside(self, P):
        i = np.round((P - self.lo) / self.st).astype(int)
        ok = np.all((i >= 0) & (i < np.array(self.shape)), axis=-1)
        out = np.zeros(P.shape[:-1], bool); ii = i[ok]; out[ok] = self.vol[ii[:, 0], ii[:, 1], ii[:, 2]]
        return out

    def ray(self, O, D, rmax, rmin=0.0):
        """first exit distance from O along unit D (vectorised over rows), searching up to rmax"""
        ts = np.arange(0, rmax + 1e-9, self.st * 0.5)
        P = O[:, None, :] + D[:, None, :] * ts[None, :, None]
        ins = self.inside(P.reshape(-1, 3)).reshape(len(O), len(ts))
        ins[:, 0] = True
        out = ~ins; first = np.where(out.any(1), out.argmax(1), len(ts) - 1)
        return np.maximum(ts[first], rmin)


def med(R):
    P = np.concatenate([R[:, -1:], R, R[:, :1]], 1); P = np.concatenate([P[:1], P, P[-1:]], 0)
    return nd.median_filter(P, size=(3, 3))[1:-1, 1:-1]


def frames_along(axis, up=(0, 0, 1.0)):
    """parallel-transport frames along a polyline: returns T, N, B per point"""
    axis = np.asarray(axis, float); n = len(axis)
    T = np.gradient(axis, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True)
    up = np.asarray(up, float)
    N0 = np.cross(T[0], up) if abs(T[0] @ up) < 0.95 else np.cross(T[0], [1.0, 0, 0])
    N0 /= np.linalg.norm(N0); Ns = [N0]
    for i in range(1, n):
        v = Ns[-1] - (Ns[-1] @ T[i]) * T[i]; Ns.append(v / np.linalg.norm(v))
    N = np.array(Ns); B = np.cross(T, N)
    return T, N, B


def resample(poly, n):
    poly = np.asarray(poly, float); seg = np.linalg.norm(np.diff(poly, axis=0), axis=1); s = np.r_[0, np.cumsum(seg)]
    t = np.linspace(0, s[-1], n)
    return np.stack([np.interp(t, s, poly[:, k]) for k in range(3)], 1)


def tube(hull, axis, nring, nseg, rmax, rmin=0.005, caps=(True, True), smooth=1.0, up=(0, 0, 1.0), scale=1.0):
    """rings around a resampled axis, radii by ray casting, median+gaussian smoothed. returns V, F"""
    ax = resample(axis, nseg); T, N, B = frames_along(ax, up)
    ang = np.linspace(0, 2 * np.pi, nring, endpoint=False)
    D = np.cos(ang)[None, :, None] * N[:, None, :] + np.sin(ang)[None, :, None] * B[:, None, :]
    R = hull.ray(np.repeat(ax, nring, 0), D.reshape(-1, 3), rmax, rmin).reshape(nseg, nring)
    R = med(R)
    if smooth: R = nd.gaussian_filter(R, smooth, mode=("nearest", "wrap"))
    R *= scale
    V = (ax[:, None, :] + D * R[..., None]).reshape(-1, 3)
    F = []
    for i in range(nseg - 1):
        for j in range(nring):
            a, b, c, d = i * nring + j, i * nring + (j + 1) % nring, (i + 1) * nring + (j + 1) % nring, (i + 1) * nring + j
            F += [[a, b, c], [a, c, d]]
    V = list(V)
    if caps[0]:
        ci = len(V); V.append(ax[0] - T[0] * 0.3 * R[0].mean())
        F += [[ci, (j + 1) % nring, j] for j in range(nring)]
    if caps[1]:
        ci = len(V); V.append(ax[-1] + T[-1] * 0.3 * R[-1].mean()); o = (nseg - 1) * nring
        F += [[ci, o + j, o + (j + 1) % nring] for j in range(nring)]
    return np.array(V), np.array(F), ax, R


def blob(hull, center, nlat, nlon, rmax, zmin=None, smooth=1.0):
    """star-shaped lat-long sphere from center, radii by ray casting; optional flat cut at zmin"""
    th = np.linspace(0, np.pi, nlat)[1:-1]; ph = np.linspace(0, 2 * np.pi, nlon, endpoint=False)
    D = np.stack([np.sin(th)[:, None] * np.cos(ph)[None], np.sin(th)[:, None] * np.sin(ph)[None], np.cos(th)[:, None] * np.ones_like(ph)[None]], -1)
    C = np.asarray(center, float)
    R = hull.ray(np.repeat(C[None], D.size // 3, 0), D.reshape(-1, 3), rmax).reshape(D.shape[:2])
    R = med(R)
    if smooth: R = nd.gaussian_filter(R, smooth, mode=("nearest", "wrap"))
    V = (C + D * R[..., None]).reshape(-1, 3)
    if zmin is not None: V[:, 2] = np.maximum(V[:, 2], zmin)
    rt = C + np.array([0, 0, hull.ray(C[None], np.array([[0, 0, 1.0]]), rmax)[0]])
    rb = C - np.array([0, 0, hull.ray(C[None], np.array([[0, 0, -1.0]]), rmax)[0]])
    if zmin is not None: rb[2] = max(rb[2], zmin)
    V = np.vstack([V, rt, rb]); it, ib = len(V) - 2, len(V) - 1
    nl = len(th); F = []
    for i in range(nl - 1):
        for j in range(nlon):
            a, b, c, d = i * nlon + j, i * nlon + (j + 1) % nlon, (i + 1) * nlon + (j + 1) % nlon, (i + 1) * nlon + j
            F += [[a, c, b], [a, d, c]]
    F += [[it, j, (j + 1) % nlon] for j in range(nlon)]
    o = (nl - 1) * nlon; F += [[ib, o + (j + 1) % nlon, o + j] for j in range(nlon)]
    return V, np.array(F)
