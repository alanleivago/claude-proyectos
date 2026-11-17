"""Differentiable class-map renderer (SoftRas-style aggregation), torch CPU, for the turntable camera of cam.py.
render(V, F, fcls, p, alpha, scale) -> (pix_index, probs[npix, NC]) over the pixels touched by any triangle bbox."""
import math, numpy as np, torch
import torch.nn.functional as Fn
from fastpairs import pairs_reach
W0, H0 = 1080, 1920
NC = 7


def basis(p):
    ph, rl = math.radians(p["phi"]), math.radians(p.get("roll", 0.0))
    d = np.array([0.0, -math.cos(ph), math.sin(ph)]); F = -d
    R = np.cross(F, [0, 0, 1.0]); R /= np.linalg.norm(R); U = np.cross(R, F)
    if rl: R, U = R * math.cos(rl) + U * math.sin(rl), U * math.cos(rl) - R * math.sin(rl)
    T = np.array([0, 0, p["tz"]]) + p["u"] * R
    return T + p["d"] * d, R, U, F


def project_t(V, p, alpha, scale):
    C, R, U, F = [torch.tensor(a, dtype=V.dtype) for a in basis(p)]
    a = math.radians(alpha); Rz = torch.tensor([[math.cos(a), -math.sin(a), 0], [math.sin(a), math.cos(a), 0], [0, 0, 1.0]], dtype=V.dtype)
    q = V @ Rz.T - C; z = q @ F; k = p["f"] / 36.0 * H0 * scale
    return W0 * scale / 2 + k * (q @ R) / z, H0 * scale / 2 - k * (q @ U) / z, z


def pairs(x, y, F, w, h, margin):
    """all (triangle, pixel) pairs inside each triangle's bbox + margin (numpy)"""
    tx, ty = x[F], y[F]
    x0 = np.clip(np.floor(tx.min(1) - margin), 0, w - 1).astype(np.int64); x1 = np.clip(np.ceil(tx.max(1) + margin), 0, w - 1).astype(np.int64)
    y0 = np.clip(np.floor(ty.min(1) - margin), 0, h - 1).astype(np.int64); y1 = np.clip(np.ceil(ty.max(1) + margin), 0, h - 1).astype(np.int64)
    bw, bh = x1 - x0 + 1, y1 - y0 + 1; n = bw * bh
    n[(tx.max(1) < -margin) | (tx.min(1) > w + margin) | (ty.max(1) < -margin) | (ty.min(1) > h + margin)] = 0
    tri = np.repeat(np.arange(len(F)), n); start = np.repeat(np.cumsum(n) - n, n); loc = np.arange(n.sum()) - start
    px = x0[tri] + loc % bw[tri]; py = y0[tri] + loc // bw[tri]
    return tri, py * w + px


def render(V, F, fcls, p, alpha, scale, sigma=0.7, gamma=0.01, margin=None):
    """V torch (n,3) model coords; F np (m,3); fcls np (m,) in 1..NC-1. Returns pix (np), probs (torch npix x NC)."""
    w, h = int(W0 * scale), int(H0 * scale)
    x, y, z = project_t(V, p, alpha, scale)
    margin = margin if margin is not None else 3 * sigma + 1
    xn, yn = x.detach().numpy(), y.detach().numpy()
    tri, pix = pairs_reach(xn, yn, F, w, h, 2.5 * sigma)
    pres = np.zeros(h * w, bool); pres[pix] = True; upix = np.nonzero(pres)[0]
    mp = np.zeros(h * w, np.int64); mp[upix] = np.arange(len(upix)); inv = mp[pix]
    T = torch.from_numpy(tri); Ft = torch.from_numpy(F)
    ax, ay, az = x[Ft[T, 0]], y[Ft[T, 0]], z[Ft[T, 0]]
    bx, by, bz = x[Ft[T, 1]], y[Ft[T, 1]], z[Ft[T, 1]]
    cx, cy, cz = x[Ft[T, 2]], y[Ft[T, 2]], z[Ft[T, 2]]
    PX = torch.from_numpy((upix % w).astype(np.float32)).to(V.dtype)[inv] + 0.5
    PY = torch.from_numpy((upix // w).astype(np.float32)).to(V.dtype)[inv] + 0.5
    area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
    sg = torch.sign(area); sg = torch.where(sg == 0, torch.ones_like(sg), sg)
    def ed(x0, y0, x1, y1):
        ex, ey = x1 - x0, y1 - y0; L = torch.sqrt(ex * ex + ey * ey + 1e-12)
        return sg * (ex * (PY - y0) - ey * (PX - x0)) / L
    e0, e1, e2 = ed(ax, ay, bx, by), ed(bx, by, cx, cy), ed(cx, cy, ax, ay)
    d = torch.minimum(torch.minimum(e0, e1), e2)
    logD = Fn.logsigmoid(d / sigma)
    # barycentrics (clamped) for depth
    ar = area + torch.where(area >= 0, 1e-9, -1e-9)
    wa = ((bx - PX) * (cy - PY) - (by - PY) * (cx - PX)) / ar
    wb = ((cx - PX) * (ay - PY) - (cy - PY) * (ax - PX)) / ar
    wa, wb = wa.clamp(0, 1), wb.clamp(0, 1); wc = (1 - wa - wb).clamp(0, 1); s = wa + wb + wc
    zz = (wa * az + wb * bz + wc * cz) / s
    zn, zf = float(z.detach().min()) - 0.05, float(z.detach().max()) + 0.05
    zi = (zf - zz) / (zf - zn)
    logit = logD + zi / gamma
    I = torch.from_numpy(inv); npx = len(upix)
    m = torch.full((npx,), -1e9, dtype=V.dtype).scatter_reduce(0, I, logit.detach(), "amax")
    e = torch.exp(logit - m[I])
    S = torch.zeros(npx, dtype=V.dtype).index_add(0, I, e)
    C = torch.from_numpy(fcls[tri].astype(np.int64))
    cd = torch.zeros(npx * NC, dtype=V.dtype).index_add(0, I * NC + C, e).view(npx, NC) / S[:, None]
    log1mA = torch.zeros(npx, dtype=V.dtype).index_add(0, I, Fn.logsigmoid(-d / sigma))
    A = 1 - torch.exp(log1mA)
    probs = cd * A[:, None]
    probs = torch.cat([(1 - A)[:, None], probs[:, 1:]], 1)
    return upix, probs, (w, h)


def hard_image(upix, probs, wh):
    w, h = wh; img = np.zeros(h * w, np.uint8); img[upix] = probs.detach().numpy().argmax(1); return img.reshape(h, w)
