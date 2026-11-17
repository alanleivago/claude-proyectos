"""numpy-only camera/raster helpers (shared by Blender-side scripts and fit.py)"""
import math, numpy as np
W0, H0 = 1920, 1080
ZC = -2.4
S = 0.25


def cam_basis(p):
    th, ph, rl = map(math.radians, (p["theta"], p["phi"], p.get("roll", 0)))
    d = np.array([math.cos(ph) * math.sin(th), -math.cos(ph) * math.cos(th), math.sin(ph)])   # target -> camera
    fwd = -d
    R = np.cross(fwd, [0, 0, 1.0]); R /= np.linalg.norm(R)
    U = np.cross(R, fwd)
    if rl:
        R, U = R * math.cos(rl) + U * math.sin(rl), U * math.cos(rl) - R * math.sin(rl)
    T = np.array([0, 0, ZC]) + p["u"] * R + p["v"] * U
    C = T + p["dist"] * d
    return C, R, U, fwd


def project(P, p):
    C, R, U, F = cam_basis(p)
    q = P - C
    x, y, z = q @ R, q @ U, q @ F
    if p.get("ortho"):
        k = W0 / p["ortho"]; return np.stack([W0 / 2 + k * x, H0 / 2 - k * y], -1)
    fpx = p["f"] / 36.0 * W0
    return np.stack([W0 / 2 + fpx * x / z, H0 / 2 - fpx * y / z], -1)


PAL = [(1, (247, 184, 101)), (1, (240, 170, 90)), (2, (229, 136, 94)), (3, (250, 209, 160)), (3, (242, 178, 130)),
       (3, (248, 176, 127)), (3, (252, 220, 180)), (4, (211, 105, 39)), (4, (170, 63, 11)), (4, (190, 80, 25)),
       (5, (83, 57, 34)), (5, (99, 73, 54)), (5, (74, 50, 34)), (5, (169, 161, 122)),
       (6, (60, 84, 24)), (6, (41, 54, 22)), (6, (50, 68, 18)), (6, (46, 53, 22)),
       (7, (81, 50, 62)), (7, (141, 76, 88)), (7, (60, 40, 54)), (7, (65, 39, 54)), (7, (94, 58, 76))]
PC = np.array([c for _, c in PAL], float); PK = np.array([k for k, _ in PAL])


def classify(rgb, thr=55):
    d = np.linalg.norm(rgb[..., None, :].astype(float) - PC, axis=-1)
    k = PK[d.argmin(-1)]; k[d.min(-1) > thr] = 0
    return k


def raster_cls(tris, col, p, scale=S):
    """z-buffered class image (0 = background, -1 = unknown colour)"""
    w, h = int(W0 * scale), int(H0 * scale)
    P = tris.reshape(-1, 3)
    C, R, U, F = cam_basis(p); q = P - C; z = (q @ F).reshape(-1, 3)
    uv = project(P, p).reshape(-1, 3, 2) * scale
    cls = classify(col); cls[cls == 0] = -1
    zb = np.full((h, w), np.inf); out = np.zeros((h, w), int)
    for i in range(len(uv)):
        (x0, y0), (x1, y1), (x2, y2) = uv[i]
        xa, xb = int(max(0, np.floor(min(x0, x1, x2)))), int(min(w - 1, np.ceil(max(x0, x1, x2))))
        ya, yb = int(max(0, np.floor(min(y0, y1, y2)))), int(min(h - 1, np.ceil(max(y0, y1, y2))))
        if xa > xb or ya > yb: continue
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-9: continue
        X, Y = np.meshgrid(np.arange(xa, xb + 1) + 0.5, np.arange(ya, yb + 1) + 0.5)
        a = ((y1 - y2) * (X - x2) + (x2 - x1) * (Y - y2)) / den
        b = ((y2 - y0) * (X - x2) + (x0 - x2) * (Y - y2)) / den
        c = 1 - a - b
        ins = (a >= -1e-6) & (b >= -1e-6) & (c >= -1e-6)
        if not ins.any(): continue
        zz = a * z[i, 0] + b * z[i, 1] + c * z[i, 2]
        sub = zb[ya:yb + 1, xa:xb + 1]; m = ins & (zz < sub)
        sub[m] = zz[m]; out[ya:yb + 1, xa:xb + 1][m] = cls[i]
    return out


def cls_score(oc, hc):
    """multi-class IoU: pixels where both agree on the class / union of both silhouettes (unknowns count as agreeing)"""
    of, hf = oc != 0, hc != 0
    agree = of & hf & ((oc == hc) | (oc == -1) | (hc == -1) | ((oc <= 2) & (hc <= 2) & (oc > 0) & (hc > 0)))
    return agree.sum() / max(1, (of | hf).sum())


