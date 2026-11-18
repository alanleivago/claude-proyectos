"""Silhouette overlays: ours (review/ov/<act>_<view>_<yaw>.png) at 50 % over his frame, registered on hair top,
sole and head centre. The yaw is chosen by the IoU of the HAIR masks (same palette in both).
python tools/overlay.py <tag>   -> review/overlay_<tag>.png (ours | his | 50 % overlay) per view"""
import sys, glob, os, numpy as np
from PIL import Image
F = "/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/"
REFS = [("front", "tut_idle", "ref/t759.png", 957, (650, 1300)), ("3q", "tut_hip", "ref/t743.png", 995, (650, 1300)),
        ("side", "tut_hip", "ref/t736.png", 969, (650, 1300)), ("back", "tut_hip", "ref/t737.png", 981, (800, 1150)),
        ("run", "tut_run", "ref/t785.png", 925, (840, 1130))]
H = 640          # output height of the figure (hair top -> sole)
PAD = 40


def hair_mask(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return ((np.abs(r - 247) < 18) & (np.abs(g - 184) < 24) & (np.abs(b - 101) < 32)) | \
           ((np.abs(r - 227) < 18) & (np.abs(g - 137) < 22) & (np.abs(b - 94) < 24))


def register(a, sole, x_lim=(650, 1300)):
    hm = hair_mask(a); hm[:, :x_lim[0]] = False; hm[:, x_lim[1]:] = False
    ys, xs = np.nonzero(hm); top = ys.min()
    band = hm[top:top + int((sole - top) * 0.12)]
    cx = np.nonzero(band)[1].mean() if band.any() else xs.mean()
    s = H / (sole - top)
    W = int(a.shape[1] * s); Hh = int(a.shape[0] * s)
    im = Image.fromarray(a.astype(np.uint8)).resize((W, Hh), Image.NEAREST)
    x0 = int(cx * s) - 260; y0 = int(top * s) - PAD
    box = (x0, y0, x0 + 520, y0 + H + 2 * PAD)
    return im.crop(box), Image.fromarray((hm * 255).astype(np.uint8)).resize((W, Hh), Image.NEAREST).crop(box)


def our_sole(a):
    m = a.sum(2) > 60; ys = np.nonzero(m.any(1))[0]; return ys.max()


def main(tag):
    tiles, report = [], []
    for view, act, ref, sole, xl in REFS:
        ha = np.asarray(Image.open(F + ref).convert("RGB")).astype(int)
        him, hhm = register(ha, sole, xl)
        hh = np.asarray(hhm) > 127
        best = None
        for p in sorted(glob.glob(f"review/ov/{act}_{view}_*.png")):
            oa = np.asarray(Image.open(p).convert("RGB")).astype(int)
            oim, ohm = register(oa, our_sole(oa), (0, oa.shape[1]))
            oh = np.asarray(ohm) > 127
            sc = (oh & hh).sum() / max(1, (oh | hh).sum())
            if not best or sc > best[0]: best = (sc, p, oim)
        sc, p, oim = best
        om = (np.asarray(oim).sum(2) > 60)
        mk = Image.fromarray((om * 128).astype(np.uint8))
        ov = Image.composite(oim, him, mk)
        t = Image.new("RGB", (520 * 3, H + 2 * PAD)); t.paste(oim, (0, 0)); t.paste(him, (520, 0)); t.paste(ov, (1040, 0))
        tiles.append(t); report.append(f"{view}: {os.path.basename(p)} hair IoU {sc:.3f}")
    out = Image.new("RGB", (1560, sum(t.height for t in tiles))); y = 0
    for t in tiles: out.paste(t, (0, y)); y += t.height
    out.save(f"review/overlay_{tag}.png"); print("\n".join(report))


if __name__ == "__main__":
    main(sys.argv[1])
