"""Grey/wire comparison views: fit a camera of our rest model to his rest-pose viewport frames (11:29-11:31, the
textured+wire frames) and to his grey frame (7:57 'g064'); render ours grey flat-shaded with edges like his viewport.
python wire_views.py fit | render"""
import sys, json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.optimize import minimize
import rast
F = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/"
VIEWS = {   # name: frame, x-range, initial camera
    "front": ("rest2/r011.png", (560, 1100), dict(theta=11, phi=14, dist=48.4, u=2.45, v=2.98, roll=1, f=50)),
    "side": ("wire/w020.png", (600, 1200), dict(theta=90, phi=0, dist=60, u=0, v=0, roll=0, f=50, ortho=14)),
    "q3": ("wire/w021.png", (450, 1000), dict(theta=-60, phi=10, dist=60, u=0, v=0, roll=0, f=50, ortho=14)),
    "head": ("wire/w017.png", (550, 1150), dict(theta=0, phi=0, dist=60, u=0, v=4, roll=0, f=50, ortho=6)),
    "grey": ("grey/g064.png", (700, 1060), dict(theta=10, phi=8, dist=60, u=0, v=0, roll=0, f=50)),
}


def his_mask(view):
    fn, (x0, x1), _ = VIEWS[view]
    a = np.asarray(Image.open(F + fn).convert("RGB")).astype(int)
    if view == "grey":
        m = (a.min(2) > 110) | ((a[..., 0] > 180) & (a[..., 2] < 140))
    else:
        m = (a.max(2) - a.min(2) > 26) & (a.sum(2) > 150)
    m[:, :x0] = False; m[:, x1:] = False; m[:55] = False; m[1060:] = False
    m = nd.binary_closing(m, iterations=4); m = nd.binary_fill_holes(m); m = nd.binary_opening(m, iterations=2)
    lab, n = nd.label(m); sz = nd.sum(m, lab, range(1, n + 1)); m = lab == np.argmax(sz) + 1
    return m


def load(tag="rest"):
    d = np.load(f"girl_{tag}.npz"); return d["co"][d["tris"]], d


def ours_mask(T, p, s=0.25):
    return rast.raster_cls(T, np.tile([250, 209, 160], (len(T), 1)), p, s) != 0


def fit(view):
    T, _ = load(); hm = his_mask(view)
    hq = np.asarray(Image.fromarray(hm.astype(np.uint8) * 255).resize((480, 270), Image.BILINEAR)) > 127
    p0 = dict(VIEWS[view][2]); keys = (["u", "v", "ortho"] if view == "side" else ["theta", "phi", "u", "v", "roll"] + (["ortho"] if "ortho" in p0 else ["dist"]))
    ys, xs = np.nonzero(hq)
    if "ortho" in p0:
        best = None
        for o in np.arange(5, 30, 1.0):
            for v in np.arange(-6, 6, 0.5):
                for u in np.arange(-3, 3.1, 0.5):
                    p = dict(p0, ortho=o, v=v, u=u); om = ours_mask(T, p); om[265:] = False
                    s = (om & hq).sum() / max(1, (om | hq).sum())
                    if not best or s > best[0]: best = (s, o, v, u)
        p0.update(ortho=best[1], v=best[2], u=best[3]); print(view, "grid", best)
    for _ in range(0 if "ortho" in p0 else 4):                       # place: match bbox
        om = ours_mask(T, p0); oy, ox = np.nonzero(om)
        if not len(oy): p0["v"] -= 2; continue
        sc = (oy.max() - oy.min()) / (ys.max() - ys.min())
        if "ortho" in p0: p0["ortho"] *= sc
        else: p0["dist"] *= sc
        om = ours_mask(T, p0); oy, ox = np.nonzero(om)
        k = (p0["ortho"] / 480) if "ortho" in p0 else p0["dist"] / (p0["f"] / 36 * 1920) * 4
        p0["u"] -= (xs.mean() - ox.mean()) * k; p0["v"] += (ys.mean() - oy.mean()) * k
    def f(x):
        p = dict(p0); p.update(zip(keys, x)); om = ours_mask(T, p); om[265:] = False; return -(om & hq).sum() / max(1, (om | hq).sum())
    st = [.2, .2, .5] if view == "side" else [6, 4, .2, .2, 2, (p0.get("ortho", 1) * .05 if "ortho" in p0 else 2)]
    x0 = [p0[k] for k in keys]; sim = [x0] + [[x0[j] + (st[i] if j == i else 0) for j in range(len(x0))] for i in range(len(x0))]
    r = minimize(f, x0, method="Nelder-Mead", options=dict(maxiter=300, initial_simplex=sim))
    p0.update(zip(keys, map(float, r.x))); return p0, -r.fun


def render(view, p, tag="rest"):
    """our grey viewport look: flat shade by face normal (his studio light from upper left), dark edges"""
    T, d = load(tag); co, tris, pidx, edges = d["co"], d["tris"], d["pidx"], d["edges"]
    n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
    C, R, U, Fw = rast.cam_basis(p)
    nv = np.stack([n @ R, n @ U, -(n @ Fw)], 1); L = np.array([-0.35, 0.55, 0.75]); L /= np.linalg.norm(L)
    sh = 0.55 + 0.45 * np.clip(np.abs(nv) @ np.abs(L) * np.sign(nv @ L + 1e-9) * 0 + nv @ L, -1, 1)
    grey = np.clip(np.stack([sh] * 3, 1) * 175 + 20, 0, 255)
    W, H = 1920, 1080
    P = co; z = (P - C) @ Fw; uv = rast.project(P, p)
    zb = np.full((H, W), np.inf); img = np.zeros((H, W, 3)); img[:] = (61, 61, 61); cov = np.zeros((H, W), bool)
    for i, t in enumerate(tris):
        (x0, y0), (x1, y1), (x2, y2) = uv[t]
        xa, xb = int(max(0, min(x0, x1, x2))), int(min(W - 1, max(x0, x1, x2) + 1)); ya, yb = int(max(0, min(y0, y1, y2))), int(min(H - 1, max(y0, y1, y2) + 1))
        if xa > xb or ya > yb: continue
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-9: continue
        X, Y = np.meshgrid(np.arange(xa, xb + 1) + .5, np.arange(ya, yb + 1) + .5)
        a = ((y1 - y2) * (X - x2) + (x2 - x1) * (Y - y2)) / den; b = ((y2 - y0) * (X - x2) + (x0 - x2) * (Y - y2)) / den; c = 1 - a - b
        ins = (a >= 0) & (b >= 0) & (c >= 0); zz = a * z[t[0]] + b * z[t[1]] + c * z[t[2]]
        sub = zb[ya:yb + 1, xa:xb + 1]; m = ins & (zz < sub); sub[m] = zz[m]
        img[ya:yb + 1, xa:xb + 1][m] = grey[i]; cov[ya:yb + 1, xa:xb + 1][m] = True
    im = Image.fromarray(img.astype(np.uint8)); dr = ImageDraw.Draw(im)
    for e0, e1 in edges:                     # visible edges only (depth test at the midpoint)
        q0, q1 = uv[e0], uv[e1]; ok = True
        for t_ in (0.25, 0.5, 0.75):
            q = q0 + (q1 - q0) * t_; zq = z[e0] + (z[e1] - z[e0]) * t_
            xi, yi = int(q[0]), int(q[1])
            if 0 <= xi < W and 0 <= yi < H and zq > zb[yi, xi] + 0.08: ok = False
        if ok: dr.line([tuple(q0), tuple(q1)], fill=(30, 30, 30), width=1)
    return im, cov


if __name__ == "__main__":
    if sys.argv[1] == "fit":
        cams = {}
        for v in (sys.argv[2:] or VIEWS):
            p, s = fit(v); cams[v] = p; print(v, round(s, 3), {k: round(x, 2) for k, x in p.items()})
        old = json.load(open("wire_cams.json")) if __import__("os").path.exists("wire_cams.json") else {}
        old.update(cams); json.dump(old, open("wire_cams.json", "w"), indent=1)
