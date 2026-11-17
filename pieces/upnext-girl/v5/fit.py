"""Camera match + silhouette IoU of our pieces against his frames (pure numpy/PIL, no Blender render).
Camera = Blender camera: lens f mm, sensor 36 mm (horizontal fit), 1920x1080, looking at T with Z up.
cams.json stores per view: theta (deg, 0 = from the front -Y), phi (deg up), dist, u, v (target offset in
the camera right/up axes around (0,0,ZC)), roll (deg), f (mm)."""
import json, sys, math, numpy as np
from PIL import Image, ImageDraw
V5 = "F:/Claude Proyectos/pieces/upnext-girl/v5/"
W0, H0 = 1920, 1080
ZC = -2.4
S = 0.5                     # raster scale for speed
BANDS = (("head", 0.0, 0.215), ("body", 0.215, 0.585), ("legs", 0.585, 1.0))
CUT = {"front": 1062}       # his viewport bottom edge (soles cut there)


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
    fpx = p["f"] / 36.0 * W0
    return np.stack([W0 / 2 + fpx * x / z, H0 / 2 - fpx * y / z], -1)


def raster(tris, p, scale=S, pid=None, only=None):
    w, h = int(W0 * scale), int(H0 * scale)
    im = Image.new("L", (w, h), 0); dr = ImageDraw.Draw(im)
    uv = project(tris.reshape(-1, 3), p).reshape(-1, 3, 2) * scale
    for i, t in enumerate(uv):
        if only is not None and pid[i] not in only: continue
        dr.polygon([tuple(a) for a in t], fill=255)
    return np.asarray(im) > 0


def his(view, scale=S):
    m = Image.open(V5 + f"ref_{view}_mask.png")
    m = m.resize((int(W0 * scale), int(H0 * scale)), Image.BILINEAR)
    return np.asarray(m) > 127


def bands(hm):
    ys = np.nonzero(hm.any(1))[0]; y0, y1 = ys.min(), ys.max() + 1
    return {n: (int(y0 + a * (y1 - y0)), int(y0 + b * (y1 - y0))) for n, a, b in BANDS}


def iou(a, b): return (a & b).sum() / max(1, (a | b).sum())


def scores(om, hm, view, scale=S):
    if view in CUT: om = om.copy(); om[int(CUT[view] * scale):] = False
    out = {"all": iou(om, hm)}
    for n, (a, b) in bands(hm).items():
        out[n] = iou(om[a:b], hm[a:b])
    return out


def fit(tris, view, p0, keys=("theta", "phi", "dist", "u", "v", "roll"), iters=400):
    from scipy.optimize import minimize
    hm = his(view, 0.25)
    def f(x):
        p = dict(p0); p.update(dict(zip(keys, x)))
        return -iou(raster(tris, p, 0.25), hm)
    x0 = [p0[k] for k in keys]
    st = [8, 4, 4, 0.4, 0.4, 3, 5][:len(keys)]
    sim = [x0] + [[x0[j] + (st[i] if j == i else 0) for j in range(len(x0))] for i in range(len(x0))]
    r = minimize(f, x0, method="Nelder-Mead", options=dict(maxiter=iters, initial_simplex=sim, xatol=1e-3, fatol=1e-4))
    p = dict(p0); p.update(dict(zip(keys, r.x))); return p, -r.fun


def overlay(tris, view, p, path, frame):
    a = np.asarray(Image.open(frame).convert("RGB")).astype(float)
    om = raster(tris, p, 1.0)
    hm = np.asarray(Image.open(V5 + f"ref_{view}_mask.png")) > 127
    o = a * 0.6
    o[om & ~hm] = [255, 60, 60]; o[hm & ~om] = [60, 160, 255]; o[om & hm] = a[om & hm] * 0.5 + np.array([255, 255, 255]) * 0.25
    ys, xs = np.nonzero(hm | om)
    Image.fromarray(o.astype(np.uint8)).crop((xs.min() - 30, ys.min() - 30, xs.max() + 30, ys.max() + 30)).save(path)


# ---------------------------------------------------------------- colour classes (same palette in his frames and ours)
PAL = [(1, (247, 184, 101)), (1, (240, 170, 90)), (2, (229, 136, 94)), (3, (250, 209, 160)), (3, (242, 178, 130)),
       (3, (248, 176, 127)), (3, (252, 220, 180)), (4, (211, 105, 39)), (4, (170, 63, 11)), (4, (190, 80, 25)),
       (5, (83, 57, 34)), (5, (99, 73, 54)), (5, (74, 50, 34)), (5, (169, 161, 122)),
       (6, (60, 84, 24)), (6, (41, 54, 22)), (6, (50, 68, 18)), (6, (46, 53, 22)),
       (7, (81, 50, 62)), (7, (141, 76, 88)), (7, (60, 40, 54)), (7, (65, 39, 54)), (7, (94, 58, 76))]
PC = np.array([c for _, c in PAL], float); PK = np.array([k for k, _ in PAL])
CLS_NAMES = {1: "hair", 2: "hairband", 3: "skin", 4: "orange", 5: "brown", 6: "green", 7: "plum"}


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


FRAMES = {"runA": "run_764.0.png", "runB": "run_764.4.png", "front": "front_rest.png", "q3": "q3.png", "side": "side.png", "back": "back.png", "front_idle": "front_idle.png"}
FR = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/cam/"


def his_cls(view, scale=S):
    a = Image.open(FR + FRAMES[view]).convert("RGB").resize((int(W0 * scale), int(H0 * scale)), Image.NEAREST)
    k = classify(np.asarray(a)); hm = his(view, scale)
    k[~hm] = 0; k[hm & (k == 0)] = -1
    return k


def cls_score(oc, hc):
    """multi-class IoU: pixels where both agree on the class / union of both silhouettes (unknowns count as agreeing)"""
    of, hf = oc != 0, hc != 0
    agree = of & hf & ((oc == hc) | (oc == -1) | (hc == -1) | ((oc <= 2) & (hc <= 2) & (oc > 0) & (hc > 0)))
    return agree.sum() / max(1, (of | hf).sum())
