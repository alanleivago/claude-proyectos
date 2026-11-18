"""Bust behind his_idle's right fist: his frames never saw it, so the fitted shape is dented and the texture there is a
smear (a rib stripe missing, bracelet ticks baked onto the sweater). Fix by symmetry from her left side:
- geometry: right-bust vertices take the depth of the mirrored left surface (ray cast along y), feathered
- texture: torso texels near the original right fist / forearm take the colour of the mirrored left texel
mirror_bust(V, F, lab, comp_dom) -> V ; mirror_texture(img_array, V, F, FUV, FMAT, lab, comp_dom, arm_pts) -> img_array"""
import sys, os, numpy as np
from scipy.spatial import cKDTree
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def _torso(lab, comp_dom):
    return [c for c, d in comp_dom.items() if d == "Chest"][0]


def centre_x(V, lab, tc):
    T = V[lab == tc]; band = (T[:, 2] > 1.06) & (T[:, 2] < 1.26); return float(np.median(T[band][:, 0]))


def ray_front(o, d, T):
    """nearest hit distance along d"""
    A0 = T[:, 0]; e1 = T[:, 1] - A0; e2 = T[:, 2] - A0
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = o - A0; u = (tv * pv).sum(1) * inv; qv = np.cross(tv, e1); v = (qv * d).sum(1) * inv; t = (e2 * qv).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return t[hit].min() if hit.any() else np.nan


def mirror_bust(V, F, lab, comp_dom, verbose=True):
    tc = _torso(lab, comp_dom); cx = centre_x(V, lab, tc)
    tf = np.nonzero(lab[F[:, 0]] == tc)[0]; T = V[F[tf]]; cen = T.mean(1)
    TL = T[cen[:, 0] > cx + 0.004]                                   # her left half
    vi = np.nonzero(lab == tc)[0]; V2 = V.copy(); moved = []
    fn = np.cross(V[F[tf, 1]] - V[F[tf, 0]], V[F[tf, 2]] - V[F[tf, 0]])
    vn = np.zeros_like(V); [np.add.at(vn, F[tf, k], fn) for k in range(3)]; vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
    for i in vi:
        x, y, z = V[i]
        if x > cx - 0.004 or y > -0.02 or vn[i][1] > -0.15: continue
        w = np.exp(-0.5 * (((z - 1.15) / 0.075) ** 2 + ((x - (cx - 0.054)) / 0.07) ** 2))
        if w < 0.05: continue
        t = ray_front(np.array([2 * cx - x, -0.6, z]), np.array([0, 1.0, 0]), TL)
        if not np.isfinite(t): continue
        yl = -0.6 + t; w = min(1.0, w * 1.3)
        V2[i][1] = y + w * (yl - y); moved.append(abs(yl - y) * w)
    if verbose: print("BUST mirror: verts", len(moved), "move mm max %.1f mean %.1f" % (max(moved) * 1000, np.mean(moved) * 1000), "cx %.3f" % cx)
    # cleavage: the low-poly front had its most forward verts on the centre line (one rounded block, no valley);
    # pull the centre verts back so the bust reads as two shapes and a fist at the chest has room
    for i in vi:
        x, y, z = V2[i]
        w = np.exp(-0.5 * (((x - cx) / 0.022) ** 2 + ((z - 1.165) / 0.035) ** 2)) * float(y < -0.11)
        if w > 0.05: V2[i][1] = y + CLEAVAGE * w
    return V2, cx


CLEAVAGE = 0.024


def mirror_texture(img, V, F, FUV, FMAT, lab, comp_dom, arm_pts, cx, verbose=True):
    """img: HxWx3 uint8 array (modified copy returned)"""
    from bake import texels
    TS = img.shape[0]; tc = _torso(lab, comp_dom)
    tf = np.nonzero((lab[F[:, 0]] == tc) & (FMAT == 0))[0]
    pix, fid, B = texels(F, FUV, TS, tf)
    P = (V[F[fid]] * B[..., None]).sum(1)
    flat = img.reshape(-1, 3).copy(); col = flat[pix].astype(float)
    d_arm, _ = cKDTree(arm_pts).query(P)
    w = np.clip((0.10 - d_arm) / 0.025, 0, 1) * np.clip((cx - 0.004 - P[:, 0]) / 0.012, 0, 1) * (P[:, 1] < 0.0) * (P[:, 2] > 0.93) * (P[:, 2] < 1.27)
    src = (P[:, 0] > cx + 0.035) | (w < 0.01)
    left = (P[:, 0] > cx + 0.006) & (w < 0.01)
    kd = cKDTree(P[left]); M = P.copy(); M[:, 0] = 2 * cx - M[:, 0]
    dist, j = kd.query(M[w > 0], k=4)
    wk = 1 / (dist + 1e-4); wk /= wk.sum(1, keepdims=True)
    mc = (col[left][j] * wk[..., None]).sum(1)
    col[w > 0] = col[w > 0] * (1 - w[w > 0, None]) + mc * w[w > 0, None]
    flat[pix] = np.clip(col, 0, 255).astype(np.uint8)
    if verbose: print("BUST texture: texels repainted", int((w > 0).sum()), "fully", int((w > 0.99).sum()))
    return flat.reshape(img.shape)


def apex(V, lab, comp_dom, cx, s):
    tc = _torso(lab, comp_dom); P = V[lab == tc]; sg = 1 if s == "L" else -1
    m = (np.abs(P[:, 0] - (cx + sg * 0.054)) < 0.03) & (np.abs(P[:, 2] - 1.155) < 0.035)
    p = P[m][P[m][:, 1].argmin()]
    return np.array([cx + sg * 0.054, p[1], p[2]])


def finger_lines(img, V, F, FUV, FMAT, hand_faces, wrist, d0, p0, n_lines=0, frac=(0.42, 1.0), dark=0.80, half=0.0042, u_clean=0.045, verbose=True):
    """faint finger separations painted on a hand's texels: lines along the hand axis d0 at 1/4, 2/4, 3/4 of the
    width (lateral = d0 x p0), only on the distal part (fraction of the hand length)"""
    from bake import texels
    TS = img.shape[0]; pix, fid, B = texels(F, FUV, TS, hand_faces)
    P = (V[F[fid]] * B[..., None]).sum(1); l0 = np.cross(d0, p0); l0 /= np.linalg.norm(l0)
    Vh = V[np.unique(F[hand_faces])]; uu = (Vh - wrist) @ d0; vv = (Vh - wrist) @ l0
    u = (P - wrist) @ d0; v = (P - wrist) @ l0
    u0, u1 = uu.min() + frac[0] * (uu.max() - uu.min()), uu.min() + frac[1] * (uu.max() - uu.min())
    vmin, vmax = np.percentile(vv, 4), np.percentile(vv, 96)
    flat = img.reshape(-1, 3).copy(); col = flat[pix].astype(float)
    lum = col @ [0.3, 0.59, 0.11]; skin = np.median(col[lum > np.percentile(lum, 40)], 0)
    bad = (lum < 0.72 * (skin @ [0.3, 0.59, 0.11])) & (u < u_clean)   # old bracelet ticks baked next to the wrist only
    col[bad] = skin * 0.95
    mult = np.ones(len(P))
    for k in range(1, n_lines + 1):
        vk = vmin + (vmax - vmin) * k / (n_lines + 1)
        a = np.clip(1 - np.abs(v - vk) / half, 0, 1) * np.clip((u - u0) / 0.008, 0, 1) * (u < u1)
        mult = np.minimum(mult, 1 - (1 - dark) * a)
    col *= mult[:, None]; hit = mult < 0.999
    flat[pix] = np.clip(col, 0, 255).astype(np.uint8)
    if verbose: print("FINGERS: texels lined", int(hit.sum()), "old dark texels cleaned", int(bad.sum()))
    return flat.reshape(img.shape)


def pixel_finger_lines(img, V, F, FUV, FMAT, hand_faces, wrist, d0, p0, s, n_lines=3, frac=(0.74, 0.93), cell=0.0032,
                       col_k=(0.87, 0.80, 0.78), u_clean=0.045, verbose=True):
    """v9: a few short PIXELATED finger lines (PS1 style) on her original hand texture: lines run along the fingers
    near the tips, built on a coarse 3D grid (cell m) so they read as crisp blocky pixels on the back and the front;
    the old bracelet ticks next to the wrist are cleaned to skin first"""
    from bake import texels
    TS = img.shape[0]; pix, fid, B = texels(F, FUV, TS, hand_faces)
    P = (V[F[fid]] * B[..., None]).sum(1)
    t = np.cross(d0, p0) if s == "R" else np.cross(p0, d0); t /= np.linalg.norm(t)
    u = (P - wrist) @ d0; v = (P - wrist) @ t
    flat = img.reshape(-1, 3).copy(); col = flat[pix].astype(float)
    lum = col @ [0.3, 0.59, 0.11]; skin = np.median(col[lum > np.percentile(lum, 40)], 0)
    bad = (lum < 0.72 * (skin @ [0.3, 0.59, 0.11])) & (u < u_clean); col[bad] = skin * 0.95
    Vh = V[np.unique(F[hand_faces])]; uu = (Vh - wrist) @ d0; vv = (Vh - wrist) @ t
    dist = uu > 0.55 * uu.max(); vmin, vmax = np.percentile(vv[dist], 10), np.percentile(vv[dist], 90)
    u0, u1 = frac[0] * uu.max(), frac[1] * uu.max()
    qv = np.floor(v / cell); hit = np.zeros(len(P), bool)
    for k in range(1, n_lines + 1):
        vk = vmin + (vmax - vmin) * k / (n_lines + 1)
        lo = u0 + (0.0 if k == 2 else 0.6 * cell)                 # middle line a pixel longer
        hit |= (qv == np.floor(vk / cell)) & (u > lo) & (u < u1)
    col[hit] = skin * np.array(col_k)
    flat[pix] = np.clip(col, 0, 255).astype(np.uint8)
    if verbose: print("FINGERS (pixel) side", s, "texels", int(hit.sum()), "cleaned", int(bad.sum()))
    return flat.reshape(img.shape)
