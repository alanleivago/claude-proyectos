"""His Ashley_Face cells from the 400 % Aseprite frames (9:26-10:15): find fully framed cells (black 1-px dividers),
sample 51x55 texels (median of the texel block), match each to the 11 cells of his final atlas thumbnail (687 s)."""
import glob, numpy as np
from PIL import Image
F = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/"
CW, CH = 50, 54          # interior texels between dividers (51/55 pitch incl. 1 divider)


def runs(mask, axis, minlen):
    """indices (along the other axis) of lines that are dark for >= minlen consecutive pixels"""
    m = mask if axis == 0 else mask.T            # axis 0: vertical lines -> scan columns
    out = []
    for i in range(m.shape[1]):
        col = m[:, i]; best = cur = 0
        for v in col:
            cur = cur + 1 if v else 0; best = max(best, cur)
        if best >= minlen: out.append(i)
    return out


def groups(idx):
    g = []
    for i in idx:
        if g and i - g[-1][-1] <= 2: g[-1].append(i)
        else: g.append([i])
    return [(a[0], a[-1]) for a in g]


def cells_in(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    dark = a.sum(2) < 75
    v = groups(runs(dark, 0, 110)); h = groups(runs(dark, 1, 110))
    out = []
    for (x0a, x0b), (x1a, x1b) in zip(v, v[1:]):
        w = x1a - x0b - 1; p = w / CW
        if not (2.6 < p < 7.5): continue
        for (y0a, y0b), (y1a, y1b) in zip(h, h[1:]):
            hh = y1a - y0b - 1; q = hh / CH
            if abs(q - p) > 0.4: continue
            tex = np.zeros((CH, CW, 3), np.uint8)
            for j in range(CH):
                for i in range(CW):
                    xa = x0b + 1 + i * w / CW; ya = y0b + 1 + j * hh / CH
                    blk = a[int(ya + p * 0.3):int(ya + p * 0.7) + 1, int(xa + p * 0.3):int(xa + p * 0.7) + 1].reshape(-1, 3)
                    tex[j, i] = np.median(blk, 0)
            out.append(tex)
    return out


def thumb_cells():
    im = np.asarray(Image.open(F + "wire2/w109.png").convert("RGB")).astype(float)
    # thumbnail: atlas 256x256 at x 30+ (50..240), y 740+ (760..952) in the 1920 frame; cells 5 x 3 at top
    x0, y0, x1, y1 = 49.6, 760.0, 241.2, 952.0          # atlas square on screen (to be refined)
    s = (x1 - x0) / 256
    cells = []
    for r in range(3):
        for c in range(5):
            cx0 = x0 + (c * 51 + 1) * s; cy0 = y0 + (r * 55 + 1) * s
            crop = Image.fromarray(im.astype(np.uint8)).crop((int(cx0), int(cy0), int(cx0 + CW * s), int(cy0 + CH * s)))
            cells.append(np.asarray(crop.resize((10, 11), Image.BILINEAR)).astype(float))
    return cells


if __name__ == "__main__":
    T = thumb_cells()[:11]
    best = {}
    for path in sorted(glob.glob(F + "ase/a*.png")):
        for tex in cells_in(path):
            sm = np.asarray(Image.fromarray(tex).resize((10, 11), Image.BILINEAR)).astype(float)
            d = [np.abs(sm - t).mean() for t in T]; k = int(np.argmin(d))
            if k not in best or d[k] <= best[k][0] + 0.5:      # later frames win on ties (final state)
                best[k] = (min(d[k], best.get(k, (1e9,))[0]), path, tex)
    for k, (d, p, tex) in sorted(best.items()):
        Image.fromarray(tex).save(f"cells/his_{k:02d}.png"); print(k, round(d, 2), p[-8:])
