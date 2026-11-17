"""Face materials: face_eyes / face_mouth polygons get UVs = their projection in his front frame f001, so cell 0 of each
16-cell atlas is his f001 pixels 1:1. Other cells: re-projected from his own frames (half f027, blink f030) or redrawn
from cell 0 in his eye/mouth style (palette sampled from his face).
assign(D) -> FMAT, FUV updates; atlases() -> tex/face_eyes.png, tex/face_mouth.png, review/face_cells.png"""
import sys, json, numpy as np
from PIL import Image
sys.path.insert(0, "tools")
from cam import project, basis, rotz
from raster import raster
CW, CH = 256, 128
EYE_RECT = (412, 380)      # top-left (x, y) in f001 of the 256x128 eye cell
MOUTH_RECT = (412, 442)
SPLIT_Y = 456.0            # f001 rows above -> face_eyes, below -> face_mouth
EYE_ORDER = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink", "hearts", "shocked", "dizzy",
             "relaxed", "disgust", "smirk", "soft", "sparkle"]
MOUTH_ORDER = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout", "blep", "cat", "gasp",
               "bigShock", "disgust", "smirk", "blushSmile", "blushGasp"]


def assign(V, F, C, P, names, FUV, FMAT, cam, A, k0=0, cos_min=0.15):
    """mark frontal visible skin faces of the head inside the face rects; returns FUV, FMAT (1 eyes, 2 mouth)"""
    head = names.index("face") if "face" in names else names.index("head")
    fid, dep, _ = raster(V, F, cam, A[k0], 1.0)
    vis = np.zeros(len(F), bool); vis[np.unique(fid[fid >= 0])] = True
    x, y, z = project(V, cam, A[k0]); cx, cy = x[F].mean(1), y[F].mean(1)
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]); n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    C0, R, U, Fw = basis(cam); Rz = rotz(A[k0]); cen = V[F].mean(1)
    vd = C0 - cen @ Rz.T; vd /= np.linalg.norm(vd, axis=1, keepdims=True); cs = ((n @ Rz.T) * vd).sum(1)
    sel = (P == head) & (C == 1) & (vis | (cs > cos_min))
    ex, ey = EYE_RECT; mx, my = MOUTH_RECT
    inE = sel & (cy < SPLIT_Y) & (cx > ex + 2) & (cx < ex + CW - 2) & (cy > ey + 2)
    inM = sel & (cy >= SPLIT_Y) & (cx > mx + 2) & (cx < mx + CW - 2) & (cy < my + CH - 2)
    FUV = FUV.copy(); FMAT = FMAT.copy()
    for m, (rx, ry), mat in ((inE, EYE_RECT, 1), (inM, MOUTH_RECT, 2)):
        fi = np.nonzero(m)[0]
        u = (x[F[fi]] - rx) / CW / 16.0; v = 1 - (y[F[fi]] - ry) / CH
        FUV[fi] = np.stack([np.clip(u, 0, 1 / 16.0), np.clip(v, 0, 1)], -1); FMAT[fi] = mat
    print("face polys: eyes", inE.sum(), "mouth", inM.sum())
    return FUV, FMAT


def frame(k): return np.asarray(Image.open(f"ref/frames/f{k + 1:03d}.png").convert("RGB")).astype(np.float32)


def crop(img, rect): x, y = rect; return img[y:y + CH, x:x + CW].copy()


def unproject(px, py, dep, cam, alpha):
    """pixel centres (full res) + depth along F -> model-space points"""
    from cam import fpx, W0, H0
    C0, R, U, Fw = basis(cam); k = fpx(cam)
    xr = (px - W0 / 2) / k; yr = -(py - H0 / 2) / k
    Pw = C0 + dep[:, None] * (Fw + xr[:, None] * R + yr[:, None] * U)
    return Pw @ rotz(alpha)              # inverse of P @ Rz.T


def reproject_cell(V, F, cam, A, k_src, rect, k0=0):
    """his frame k_src resampled into the f001-projection cell space (pixels where our face surface is visible in both)"""
    fid0, dep0, _ = raster(V, F, cam, A[k0], 1.0)
    rx, ry = rect; ys, xs = np.mgrid[ry:ry + CH, rx:rx + CW]
    d = dep0[ys, xs]; ok = np.isfinite(d)
    P = unproject(xs[ok] + 0.5, ys[ok] + 0.5, d[ok], cam, A[k0])
    fidk, depk, _ = raster(V, F, cam, A[k_src], 1.0)
    x, y, z = project(P, cam, A[k_src])
    xi, yi = np.clip(np.floor(x).astype(int), 0, 1079), np.clip(np.floor(y).astype(int), 0, 1919)
    vis = z <= depk[yi, xi] + 0.003
    img = frame(k_src); out = crop(frame(k0), rect); m = np.zeros((CH, CW), bool)
    fx, fy = x - 0.5, y - 0.5; x0 = np.clip(np.floor(fx).astype(int), 0, 1078); y0 = np.clip(np.floor(fy).astype(int), 0, 1918)
    ax, ay = np.clip(fx - x0, 0, 1)[:, None], np.clip(fy - y0, 0, 1)[:, None]
    col = img[y0, x0] * (1 - ax) * (1 - ay) + img[y0, x0 + 1] * ax * (1 - ay) + img[y0 + 1, x0] * (1 - ax) * ay + img[y0 + 1, x0 + 1] * ax * ay
    oy, ox = ys[ok] - ry, xs[ok] - rx
    out[oy[vis], ox[vis]] = col[vis]; m[oy[vis], ox[vis]] = True
    return out, m
