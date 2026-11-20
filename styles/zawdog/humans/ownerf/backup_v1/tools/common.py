"""Shared helpers for the ownerf build (Blender side). Kept free of bpy at import time where possible."""
import math
import numpy as np

ROOT = "/Users/alanleiva/claude-proyectos"
D = ROOT + "/styles/zawdog/humans/ownerf"
NAME = "ownerf"


def unit(v):
    v = np.asarray(v, float)
    n = np.linalg.norm(v)
    return v / n if n > 1e-12 else v


def frame(axis, front):
    """plane basis for a cross-section: n = axis, f = front projected into the plane, s = n x f
    (angle 0 = front, +90 = s; for a horizontal plane with front -Y, s = +X = the character's left)."""
    n = unit(axis)
    f = np.asarray(front, float)
    f = unit(f - n * (f @ n))
    s = np.cross(n, f)
    return n, f, s


class Slicer:
    """ray-cast cross-sections of a triangle mesh (the MakeHuman body) in arbitrary planes."""

    def __init__(self, V, T):
        self.V = np.asarray(V, float)
        self.T = np.asarray(T, int)

    def segments(self, c, n):
        V, T = self.V, self.T
        d = (V - c) @ n
        dt = d[T]
        cross = ~((dt > 0).all(1) | (dt < 0).all(1))
        segs = []
        for tri, dd in zip(T[cross], dt[cross]):
            pts = []
            for a, b in ((0, 1), (1, 2), (2, 0)):
                if (dd[a] > 0) != (dd[b] > 0):
                    t = dd[a] / (dd[a] - dd[b])
                    pts.append(V[tri[a]] + (V[tri[b]] - V[tri[a]]) * t)
            if len(pts) == 2:
                segs.append(pts)
        return np.array(segs) if segs else np.zeros((0, 2, 3))

    def radii(self, c, axis, front, angles_deg, rmin=0.004, rmax=0.5):
        """first hit distance from c along each in-plane direction (nan when nothing is hit)."""
        c = np.asarray(c, float)
        n, f, s = frame(axis, front)
        S = self.segments(c, n)
        out = np.full(len(angles_deg), np.nan)
        if not len(S):
            return out, (n, f, s)
        P0 = np.stack([(S[:, 0] - c) @ s, (S[:, 0] - c) @ f], 1)
        P1 = np.stack([(S[:, 1] - c) @ s, (S[:, 1] - c) @ f], 1)
        E = P1 - P0
        for k, a in enumerate(np.radians(angles_deg)):
            u = np.array([math.sin(a), math.cos(a)])
            # c + t u = P0 + w E  ->  [u, -E] [t, w]^T = P0
            det = u[0] * (-E[:, 1]) - u[1] * (-E[:, 0])
            ok = np.abs(det) > 1e-12
            t = np.full(len(E), np.inf); w = np.full(len(E), -1.0)
            t[ok] = (P0[ok, 0] * (-E[ok, 1]) - P0[ok, 1] * (-E[ok, 0])) / det[ok]
            w[ok] = (u[0] * P0[ok, 1] - u[1] * P0[ok, 0]) / det[ok]
            m = ok & (w >= 0) & (w <= 1) & (t > rmin) & (t < rmax)
            if m.any():
                out[k] = t[m].min()
        return out, (n, f, s)


def fill_nan_circular(r):
    r = np.array(r, float)
    if np.isnan(r).all():
        return r
    n = len(r)
    idx = np.arange(n)
    good = ~np.isnan(r)
    xp = np.concatenate([idx[good] - n, idx[good], idx[good] + n])
    fp = np.concatenate([r[good]] * 3)
    return np.interp(idx, xp, fp)


def ring_points(c, basis, angles_deg, radii):
    n, f, s = basis
    a = np.radians(angles_deg)
    return np.asarray(c)[None, :] + radii[:, None] * (np.sin(a)[:, None] * s[None, :] + np.cos(a)[:, None] * f[None, :])
