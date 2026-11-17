"""Turntable camera model. World: Z up, model rotates about the Z axis through the origin, soles at z=0.
Frame k: model rotated by alpha(k) (deg, about +Z); camera fixed: looks at T=(0,0,tz)+u*R from distance d,
elevation phi (deg, + = above), roll (deg), focal f (mm, 36 mm sensor on the 1920-px height)."""
import math, numpy as np
W0, H0 = 1080, 1920
ZC = 0.8


def basis(p):
    ph, rl = math.radians(p["phi"]), math.radians(p.get("roll", 0.0))
    d = np.array([0.0, -math.cos(ph), math.sin(ph)])            # target -> camera (camera on -Y side)
    F = -d; R = np.cross(F, [0, 0, 1.0]); R /= np.linalg.norm(R); U = np.cross(R, F)
    if rl: R, U = R * math.cos(rl) + U * math.sin(rl), U * math.cos(rl) - R * math.sin(rl)
    T = np.array([0, 0, p["tz"]]) + p["u"] * R
    return T + p["d"] * d, R, U, F


def fpx(p): return p["f"] / 36.0 * H0


def rotz(a):
    a = math.radians(a); c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])


def project(P, p, alpha, scale=1.0):
    """P (n,3) model coords -> (x, y, depth) pixels at `scale` of full res"""
    C, R, U, F = basis(p); q = P @ rotz(alpha).T - C
    z = q @ F; k = fpx(p)
    return (W0 / 2 + k * (q @ R) / z) * scale, (H0 / 2 - k * (q @ U) / z) * scale, z


def smooth(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)


def alpha_of(k, p):
    """k = 0-based frame index"""
    return p.get("a0", 0.0) + p.get("sign", 1.0) * p.get("T", 360.0) * smooth((k - p.get("ka", 0.0)) / (p.get("kb", 249.0) - p.get("ka", 0.0)))
