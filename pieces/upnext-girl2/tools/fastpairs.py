"""numba: (triangle, pixel) pairs within `reach` px outside each projected triangle."""
import numpy as np
from numba import njit


@njit(cache=True)
def _count(x, y, F, w, h, reach):
    n = 0
    for t in range(F.shape[0]):
        a, b, c = F[t, 0], F[t, 1], F[t, 2]
        x0 = min(x[a], x[b], x[c]) - reach; x1 = max(x[a], x[b], x[c]) + reach
        y0 = min(y[a], y[b], y[c]) - reach; y1 = max(y[a], y[b], y[c]) + reach
        i0 = max(0, int(np.floor(x0))); i1 = min(w - 1, int(np.ceil(x1)))
        j0 = max(0, int(np.floor(y0))); j1 = min(h - 1, int(np.ceil(y1)))
        if i1 >= i0 and j1 >= j0: n += (i1 - i0 + 1) * (j1 - j0 + 1)
    return n


@njit(cache=True)
def _fill(x, y, F, w, h, reach, tri, pix):
    n = 0
    for t in range(F.shape[0]):
        a, b, c = F[t, 0], F[t, 1], F[t, 2]
        ax, ay, bx, by, cx, cy = x[a], y[a], x[b], y[b], x[c], y[c]
        ar = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
        sg = 1.0 if ar >= 0 else -1.0
        l0 = np.sqrt((bx - ax) ** 2 + (by - ay) ** 2) + 1e-9; l1 = np.sqrt((cx - bx) ** 2 + (cy - by) ** 2) + 1e-9; l2 = np.sqrt((ax - cx) ** 2 + (ay - cy) ** 2) + 1e-9
        x0 = min(ax, bx, cx) - reach; x1 = max(ax, bx, cx) + reach; y0 = min(ay, by, cy) - reach; y1 = max(ay, by, cy) + reach
        i0 = max(0, int(np.floor(x0))); i1 = min(w - 1, int(np.ceil(x1)))
        j0 = max(0, int(np.floor(y0))); j1 = min(h - 1, int(np.ceil(y1)))
        for j in range(j0, j1 + 1):
            py = j + 0.5
            for i in range(i0, i1 + 1):
                px = i + 0.5
                e0 = sg * ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / l0
                e1 = sg * ((cx - bx) * (py - by) - (cy - by) * (px - bx)) / l1
                e2 = sg * ((ax - cx) * (py - cy) - (ay - cy) * (px - cx)) / l2
                if min(e0, e1, e2) > -reach:
                    tri[n] = t; pix[n] = j * w + i; n += 1
    return n


def pairs_reach(x, y, F, w, h, reach):
    x = np.ascontiguousarray(x, np.float64); y = np.ascontiguousarray(y, np.float64); F = np.ascontiguousarray(F, np.int64)
    n = _count(x, y, F, w, h, reach)
    tri = np.empty(n, np.int64); pix = np.empty(n, np.int64)
    m = _fill(x, y, F, w, h, reach, tri, pix)
    return tri[:m], pix[:m]
