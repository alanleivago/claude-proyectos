"""Bake a texture for a fitted mesh from his frames by projection (flat unlit model => colour is view independent).
bake(V, F, FUV, cam, alphas, frames, TS, faces_mask=None, power=40) -> (tex HxWx3 float, weight HxW)"""
import sys, numpy as np
from PIL import Image
sys.path.insert(0, "tools")
from cam import project, basis, rotz, W0, H0
from raster import raster
from softras import pairs
from scipy import ndimage as nd
_FR = {}


def frame(k):
    if k not in _FR: _FR[k] = np.asarray(Image.open(f"ref/frames/f{k + 1:03d}.png").convert("RGB")).astype(np.float32)
    return _FR[k]


def texels(F, FUV, TS, faces=None):
    """texel centres covered by each face's UV triangle -> (texel index, face, barycentrics)"""
    fi = np.arange(len(F)) if faces is None else np.asarray(faces)
    u = FUV[fi, :, 0] * TS; v = (1 - FUV[fi, :, 1]) * TS
    tri, pix = pairs(u.reshape(-1), v.reshape(-1), np.arange(len(fi) * 3).reshape(-1, 3), TS, TS, 0.5)
    PX = pix % TS + 0.5; PY = pix // TS + 0.5
    ax, ay, bx, by, cx, cy = u[tri, 0], v[tri, 0], u[tri, 1], v[tri, 1], u[tri, 2], v[tri, 2]
    ar = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); ok = np.abs(ar) > 1e-12; ar = np.where(ok, ar, 1)
    wa = ((bx - PX) * (cy - PY) - (by - PY) * (cx - PX)) / ar; wb = ((cx - PX) * (ay - PY) - (cy - PY) * (ax - PX)) / ar; wc = 1 - wa - wb
    e = -0.6 / max(1.0, np.sqrt(np.abs(ar).mean()))       # include texels just outside (seam padding)
    ins = ok & (wa >= e) & (wb >= e) & (wc >= e)
    tri, pix, B = tri[ins], pix[ins], np.stack([wa[ins], wb[ins], wc[ins]], 1)
    o = np.argsort(pix, kind="stable"); first = np.ones(len(o), bool); first[1:] = pix[o][1:] != pix[o][:-1]
    sel = o[first]
    return pix[sel], fi[tri[sel]], np.clip(B[sel], 0, 1) / np.clip(B[sel], 0, 1).sum(1, keepdims=True)


def bake(V, F, FUV, cam, alphas, frames, TS, faces=None, power=40.0, edge_px=2, res=1.0, FC=None):
    """FC: per-face class; samples whose pixel in his class map has another class are (almost) ignored"""
    pix, fid, B = texels(F, FUV, TS, faces)
    CLS = np.load('ref/cls.npz')['c'] if FC is not None else None
    TC = FC[fid] if FC is not None else None
    P = (V[F[fid]] * B[..., None]).sum(1)
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    # smooth vertex normals (area weighted, 8 neighbour passes) -> coherent view selection on noisy surfaces
    vn = np.zeros_like(V); np.add.at(vn, F[:, 0], n); np.add.at(vn, F[:, 1], n); np.add.at(vn, F[:, 2], n)
    E = np.unique(np.sort(np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]), 1), axis=0)
    I_ = np.concatenate([E[:, 0], E[:, 1]]); J_ = np.concatenate([E[:, 1], E[:, 0]])
    for _ in range(8):
        acc_ = vn.copy(); np.add.at(acc_, I_, vn[J_]); vn = acc_ / (np.linalg.norm(acc_, axis=1, keepdims=True) + 1e-12)
    Nt = (vn[F[fid]] * B[..., None]).sum(1); Nt /= np.linalg.norm(Nt, axis=1, keepdims=True) + 1e-12
    acc = np.zeros((len(pix), 3)); wsum = np.zeros(len(pix))
    C0, R, U, Fw = basis(cam)
    for k in frames:
        fidimg, dep, _ = raster(V, F, cam, alphas[k], res)
        h, w = fidimg.shape
        # occlusion/silhouette edges: pixels whose 3x3 neighbourhood holds another face that is not adjacent in depth
        bg = fidimg < 0
        edge = nd.binary_dilation(bg, iterations=edge_px) & ~bg
        dz = np.where(np.isinf(dep), 1e3, dep)
        jump = (np.abs(nd.maximum_filter(dz, 3) - nd.minimum_filter(dz, 3)) > 0.03)
        edge |= nd.binary_dilation(jump, iterations=edge_px)
        x, y, z = project(P, cam, alphas[k], res)
        xi, yi = np.floor(x).astype(int), np.floor(y).astype(int)
        ok = (xi >= 0) & (xi < w) & (yi >= 0) & (yi < h)
        vis = np.zeros(len(P), bool); vis[ok] = z[ok] <= dep[yi[ok], xi[ok]] + 0.004
        Rz = rotz(alphas[k]); vd = C0 - P @ Rz.T; vd /= np.linalg.norm(vd, axis=1, keepdims=True)
        cs = ((Nt @ Rz.T) * vd).sum(1)
        good = vis & (cs > 0.05)
        wgt = np.where(good, np.clip(cs, 0, 1) ** power, 0) * np.where(ok & good, np.where(edge[np.clip(yi, 0, h - 1), np.clip(xi, 0, w - 1)], 0.02, 1.0), 0)
        sel = np.nonzero(wgt > 0)[0]
        if not len(sel): continue
        img = frame(k)
        if CLS is not None:
            cx_ = np.clip((x[sel] / res).astype(int), 0, W0 - 1); cy_ = np.clip((y[sel] / res).astype(int), 0, H0 - 1)
            ck = CLS[k]; agree = ck[cy_, cx_] == TC[sel]
            for ox, oy in ((2, 0), (-2, 0), (0, 2), (0, -2)):      # not on a class edge (AA / misregistration)
                agree &= ck[np.clip(cy_ + oy, 0, H0 - 1), np.clip(cx_ + ox, 0, W0 - 1)] == TC[sel]
            wgt[sel] = wgt[sel] * np.where(agree, 1.0, 0.0)
        fx, fy = x[sel] / res - 0.5, y[sel] / res - 0.5            # bilinear in the full-res frame
        x0 = np.clip(np.floor(fx).astype(int), 0, W0 - 2); y0 = np.clip(np.floor(fy).astype(int), 0, H0 - 2)
        ax_, ay_ = np.clip(fx - x0, 0, 1)[:, None], np.clip(fy - y0, 0, 1)[:, None]
        col = (img[y0, x0] * (1 - ax_) * (1 - ay_) + img[y0, x0 + 1] * ax_ * (1 - ay_) + img[y0 + 1, x0] * (1 - ax_) * ay_ + img[y0 + 1, x0 + 1] * ax_ * ay_)
        acc[sel] += col * wgt[sel, None]; wsum[sel] += wgt[sel]
    tex = np.zeros((TS * TS, 3)); W = np.zeros(TS * TS)
    m = wsum > 0; tex[pix[m]] = acc[m] / wsum[m, None]; W[pix[m]] = wsum[m]
    return tex.reshape(TS, TS, 3), W.reshape(TS, TS), pix, fid


def fill(tex, W, iters=None):
    """push colours into unbaked texels (nearest baked texel)"""
    bad = W <= 0
    if not bad.any(): return tex
    _, (iy, ix) = nd.distance_transform_edt(bad, return_indices=True)
    return tex[iy, ix]
