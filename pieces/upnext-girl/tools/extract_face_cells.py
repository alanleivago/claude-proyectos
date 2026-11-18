"""Rebuild the author's Ashley_Face cells pixel by pixel from the magnified atlas shown in the video.
Finds the black 1-texel dividers, derives the texel scale, samples each cell (51x55 texels) at texel centres
(median of a 3x3 patch). Writes fuentes/mml2-girl-tutorial/frames/cells/t<frame>_r<row>_c<col>.png + preview."""
import sys, numpy as np
from PIL import Image
F = "/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/"
CW, CH = 51, 55
TOP = {640: 387.5}
FULLW = {664, 666, 667, 668}
PARTIAL = bool(int(__import__('os').environ.get('PARTIAL', '0')))   # frames whose cell row has no divider line above in view


def lines(mask_1d, thr=0.5):
    idx = [i for i, v in enumerate(mask_1d) if v > thr]
    runs = []
    for i in idx:
        if runs and i - runs[-1][-1] <= 1: runs[-1].append(i)
        else: runs.append([i])
    return [(r[0], r[-1]) for r in runs if len(r) >= 2]


def extract(t, region=None, need_rows=None):
    a = np.asarray(Image.open(F + f"f1/t{t}.png").convert("RGB")).astype(int)
    H, W = a.shape[:2]
    dark = a.sum(2) < 100
    # mascot-free area: ignore the bottom-right corner for line detection
    m = dark.copy(); m[int(H * 0.6):, int(W * 0.62):] = False
    if t in FULLW: m = dark.copy(); m[int(H * 0.62):, int(W * 0.66):] = False; m[:, :int(W * 0.5)] = False
    cf = m.mean(0); rf = m.mean(1)
    vc = lines(cf, 0.6 * cf.max()); hr = lines(rf, 0.6 * rf.max())
    vx = [(a0 + a1) / 2 for a0, a1 in vc]
    if len(vx) < 2: print(t, "no vertical dividers", vc); return []
    pitch = np.median(np.diff(vx)); s = pitch / (CW + 1)
    print(f"t{t}: v-lines {[int(x) for x in vx]} h-lines {hr} pitch {pitch:.1f} scale {s:.3f}")
    x_first = vc[0][1] + 1
    xs = [x_first + k * pitch for k in range(-6, 8)]
    y_first = hr[0][1] + 1 if hr and t not in TOP else TOP.get(t)
    ys = [y_first + k * (CH + 1) * s for k in range(-4, 5)]
    out = []
    for r, y0 in enumerate(ys):
        for c, x0 in enumerate(xs):
            if x0 < -2 or x0 + CW * s > W + 2 or y0 < -2 or (y0 + CH * s > H + 2 and not PARTIAL) or y0 > H - 8 * s: continue
            cell = np.zeros((CH, CW, 3), np.uint8)
            for j in range(CH):
                for i in range(CW):
                    cx = int(round(x0 + (i + 0.5) * s)); cy = int(round(y0 + (j + 0.5) * s))
                    if cy >= H: cell[j, i] = (255, 0, 255); continue
                    p = a[max(0, cy - 1):cy + 2, max(0, cx - 1):cx + 2].reshape(-1, 3)
                    cell[j, i] = np.median(p, 0)
            name = F + f"cells3/t{t}_r{r}_c{c}.png"; Image.fromarray(cell).save(name); out.append(name)
    return out


if __name__ == "__main__":
    allc = []
    for t in map(int, sys.argv[1:]): allc += extract(t)
    n = len(allc); cols = 8
    pv = Image.new("RGB", (cols * CW * 4 + cols * 4, ((n + cols - 1) // cols) * (CH * 4 + 14)), (40, 40, 40))
    from PIL import ImageDraw
    d = ImageDraw.Draw(pv)
    for k, p in enumerate(allc):
        x, y = (k % cols) * (CW * 4 + 4), (k // cols) * (CH * 4 + 14)
        pv.paste(Image.open(p).resize((CW * 4, CH * 4), Image.NEAREST), (x, y + 12)); d.text((x, y), p.split("/")[-1][:-4], fill=(255, 255, 0))
    pv.save(F + "sheets/cells_preview.png"); print(n, "cells")
