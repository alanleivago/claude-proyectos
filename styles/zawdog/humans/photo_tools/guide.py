"""Garment guide for Flow (venv): the built body's rest A-pose drawn as a grey ghost mannequin (no head, neck, hands or
shoes), FRONT on the left and BACK on the right, orthographic, on magenta, 1376x768 (Flow 16:9).
    .venv/bin/python styles/zawdog/humans/photo_tools/guide.py <name>
-> humans/<name>/photo/guide.png + guide.json (pixel <-> metre mapping, used by register.py and the bake)."""
import json
import os
import sys

import numpy as np
from PIL import Image

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W_, H_ = 1376, 768
MAG = np.array([255, 0, 255], np.float32)


def load(name):
    d = np.load(os.path.join(H, name, "photo", "mesh.npz"))
    bones = dict(zip(d["bone_names"], d["bone_ht"]))
    return d["co"], d["tris"], d["mats"], d["reg"], bones


def garment_tris(name, co, tris, mats, reg, bones):
    """triangles of the garment-able surface: body torso / arms up to the wrist / legs (+ a lab-coat skirt)."""
    keep = np.zeros(len(tris), bool)
    body = np.char.endswith(mats.astype(str), "_skin")
    rv = reg[tris]                                                     # (T,3)
    ok = ~np.isin(rv, ["head", "neck", "eye", "footL", "footR"]).any(1)
    # hands: past the wrist along the arm
    hand = np.zeros(len(co), bool)
    for s in "LR":
        a0 = bones[f"upperarm01.{s}"][:3]; a1 = bones[f"wrist.{s}"][:3]; d = a1 - a0
        t = (co - a0) @ d / (d @ d)
        hand |= (np.char.startswith(reg.astype(str), "arm" + s)) & (t > 1.0)
    ok &= ~hand[tris].any(1)
    keep = body & ok
    for m in sorted(set(mats.astype(str))):                            # the coat skirt: the big solid that hangs waist -> knee
        if "_solid" in m:
            v = co[np.unique(tris[mats == m])]
            if len(v) >= 48 and np.ptp(v[:, 0]) > 0.3:
                keep |= mats == m
    return keep, hand


def frame(co, name):
    top = float(co[:, 2].max())
    s = 690.0 / top
    return dict(s=s, floor=730.0, cx=[344.0, 1032.0], top=top)


def to_px(P, F, view):
    """view 0 = front (camera at -Y: +x to the right), 1 = back (camera at +Y: +x to the left). Returns px, py, depth."""
    sx = 1.0 if view == 0 else -1.0
    px = F["cx"][view] + sx * P[..., 0] * F["s"]
    py = F["floor"] - P[..., 2] * F["s"]
    depth = P[..., 1] if view == 0 else -P[..., 1]
    return px, py, depth


def raster_view(co, tris, F, view, W=W_, Hh=H_):
    """z-buffer: per pixel the nearest triangle index (-1 = none) and its depth."""
    zb = np.full((Hh, W), np.inf, np.float32); tid = np.full((Hh, W), -1, np.int64); bary = np.zeros((Hh, W, 3), np.float32)
    px, py, dp = to_px(co, F, view)
    for t, (a, b, c) in enumerate(tris):
        x0, y0, x1, y1, x2, y2 = px[a], py[a], px[b], py[b], px[c], py[c]
        xa, xb = int(max(min(x0, x1, x2), 0)), int(min(max(x0, x1, x2) + 1, W - 1))
        ya, yb = int(max(min(y0, y1, y2), 0)), int(min(max(y0, y1, y2) + 1, Hh - 1))
        if xb < xa or yb < ya:
            continue
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-9:
            continue
        gx, gy = np.meshgrid(np.arange(xa, xb + 1) + 0.5, np.arange(ya, yb + 1) + 0.5)
        l0 = ((y1 - y2) * (gx - x2) + (x2 - x1) * (gy - y2)) / den
        l1 = ((y2 - y0) * (gx - x2) + (x0 - x2) * (gy - y2)) / den
        l2 = 1 - l0 - l1
        m = (l0 >= 0) & (l1 >= 0) & (l2 >= 0)
        if not m.any():
            continue
        z = l0 * dp[a] + l1 * dp[b] + l2 * dp[c]
        iy, ix = (gy - 0.5).astype(int), (gx - 0.5).astype(int)
        cur = zb[iy, ix]
        w = m & (z < cur)
        zb[iy[w], ix[w]] = z[w]; tid[iy[w], ix[w]] = t
        bary[iy[w], ix[w]] = np.stack([l0[w], l1[w], l2[w]], -1)
    return tid, zb, bary


def main(name, mode="v5"):
    """mode v5: the code-painted v5 garments as the colour guide (skin texels -> magenta), so Flow only re-textures them
    in place (an edit keeps the layout far better than 'dress this mannequin'); mode grey: plain silhouette."""
    d = np.load(os.path.join(H, name, "photo", "mesh.npz"))
    co, tris, mats, reg, bones = load(name)
    tuv = d["tuv"]
    keep, _ = garment_tris(name, co, tris, mats, reg, bones)
    F = frame(co, name)
    img = np.broadcast_to(MAG, (H_, W_, 3)).copy()
    T = tris[keep]; TUV = tuv[keep]; TM = mats[keep].astype(str)
    body = np.asarray(Image.open(os.path.join(H, name, "photo", "v5_body.png")).convert("RGB"), np.float32)
    skin = np.asarray(Image.open(os.path.join(H, name, "skin.png")).convert("RGB").resize(body.shape[1::-1], Image.BOX), np.float32)
    coat = json.load(open(os.path.join(H, "cast.json")))
    coat = next((c["build"].get("coat") for c in coat["cast"] if c["slug"] == name), None)
    for view in (0, 1):
        tid, _, bc = raster_view(co, T, F, view)
        m = tid >= 0
        if mode == "grey":
            img[m] = 206
            continue
        uv = np.einsum("nk,nkc->nc", bc[m], TUV[tid[m]])
        S = body.shape[0]
        ix = np.clip((uv[:, 0] * S).astype(int), 0, S - 1); iy = np.clip(((1 - uv[:, 1]) * S).astype(int), 0, S - 1)
        c = body[iy, ix]; sk = skin[iy, ix]
        isskin = np.abs(c - sk).sum(1) < 30
        solid = ~np.char.endswith(TM[tid[m]], "_skin")
        if coat:
            c[solid] = [float(x) for x in coat.split(",")]
        c[isskin & ~solid] = MAG
        img[m] = c
    Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(os.path.join(H, name, "photo", "guide.png" if mode == "v5" else "guide_grey.png"))
    json.dump(F, open(os.path.join(H, name, "photo", "guide.json"), "w"), indent=1)
    print(name, "guide", F)


if __name__ == "__main__":
    main(sys.argv[1], *(sys.argv[2:3]))
