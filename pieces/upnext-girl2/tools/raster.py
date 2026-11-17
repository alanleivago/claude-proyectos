"""Hard z-buffer rasterizer (numpy): face id + depth + barycentrics per pixel, turntable camera of cam.py."""
import numpy as np, sys
sys.path.insert(0, __file__.rsplit("\\", 1)[0].rsplit("/", 1)[0])
from cam import project, W0, H0
from softras import pairs
from fastpairs import pairs_reach


def raster(V, F, cam, alpha, scale=1.0, wh=None):
    w, h = wh or (int(round(W0 * scale)), int(round(H0 * scale)))
    x, y, z = project(V, cam, alpha, scale)
    tri, pix = pairs_reach(x, y, F, w, h, 0.01)
    PX = (pix % w) + 0.5; PY = (pix // w) + 0.5
    a, b, c = F[tri, 0], F[tri, 1], F[tri, 2]
    ax, ay, bx, by, cx, cy = x[a], y[a], x[b], y[b], x[c], y[c]
    area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
    ok = np.abs(area) > 1e-12
    ar = np.where(ok, area, 1)
    wa = ((bx - PX) * (cy - PY) - (by - PY) * (cx - PX)) / ar
    wb = ((cx - PX) * (ay - PY) - (cy - PY) * (ax - PX)) / ar
    wc = 1 - wa - wb
    ins = ok & (wa >= -1e-7) & (wb >= -1e-7) & (wc >= -1e-7)
    tri, pix, wa, wb, wc = tri[ins], pix[ins], wa[ins], wb[ins], wc[ins]
    # perspective-correct depth: interpolate 1/z
    iz = wa / z[a[ins]] + wb / z[b[ins]] + wc / z[c[ins]]
    zz = 1 / iz
    o = np.lexsort((zz, pix)); pix, tri, zz, wa, wb, wc = pix[o], tri[o], zz[o], wa[o], wb[o], wc[o]
    first = np.ones(len(pix), bool); first[1:] = pix[1:] != pix[:-1]
    fid = np.full(h * w, -1, np.int64); dep = np.full(h * w, np.inf)
    fid[pix[first]] = tri[first]; dep[pix[first]] = zz[first]
    B = np.zeros((h * w, 3), np.float32); B[pix[first]] = np.stack([wa[first], wb[first], wc[first]], 1)
    return fid.reshape(h, w), dep.reshape(h, w), B.reshape(h, w, 3)


def render_tex(V, F, FUV, FMAT, texs, cam, alpha, scale=1.0, bg=(235, 221, 199), wh=None):
    """unlit textured render: FMAT per-face material index into texs (list of HxWx3 float arrays, nearest lookup with
    bilinear filtering), FUV per-face-corner UV (m,3,2). Perspective-correct UVs."""
    fid, dep, B = raster(V, F, cam, alpha, scale, wh)
    h, w = fid.shape; out = np.zeros((h, w, 3), np.float32); out[:] = bg
    m = fid >= 0; f = fid[m]; b = B[m].astype(np.float64)
    _, _, z = project(V, cam, alpha, scale)
    zc = z[F[f]]; b = b / zc; b /= b.sum(1, keepdims=True)
    uv = (FUV[f] * b[..., None]).sum(1)
    col = np.zeros((len(f), 3), np.float32)
    for mi, T in enumerate(texs):
        s = FMAT[f] == mi
        if not s.any(): continue
        TH, TW = T.shape[:2]
        x = uv[s, 0] * TW - 0.5; y = (1 - uv[s, 1]) * TH - 0.5
        x0 = np.clip(np.floor(x).astype(int), 0, TW - 2); y0 = np.clip(np.floor(y).astype(int), 0, TH - 2)
        ax, ay = np.clip(x - x0, 0, 1)[:, None], np.clip(y - y0, 0, 1)[:, None]
        col[s] = T[y0, x0] * (1 - ax) * (1 - ay) + T[y0, x0 + 1] * ax * (1 - ay) + T[y0 + 1, x0] * (1 - ax) * ay + T[y0 + 1, x0 + 1] * ax * ay
    out[m] = col
    return out, fid
