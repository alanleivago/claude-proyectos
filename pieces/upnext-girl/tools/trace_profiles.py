"""Trace his silhouettes: per image row, extents of hair / skin / whole figure in his turnaround frames.
Prints rows in model units (z, with sole = -9 and top = figure top) so build.py can copy the hair/head profile."""
import sys, json, numpy as np
from PIL import Image
F = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/f1/"

def masks(t):
    a = np.asarray(Image.open(F + f"t{t}.png").convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    bg = (np.abs(r - g) < 22) & (b >= r - 6) & (r < 80)              # dark blue-grey backdrop
    fig = ~bg
    hair = ((np.abs(r - 247) < 16) & (np.abs(g - 184) < 22) & (np.abs(b - 101) < 30)) | \
           ((np.abs(r - 227) < 18) & (np.abs(g - 137) < 20) & (np.abs(b - 94) < 22))
    skin = (r > 235) & (g > 160) & (b > 120) & (g < 225) & ~hair
    return a, fig, hair, skin

def profile(t, x0, x1, y0=0, y1=1080):
    a, fig, hair, skin = masks(t)
    fig[:, :x0] = fig[:, x1:] = False; hair[:, :x0] = hair[:, x1:] = False; skin[:, :x0] = skin[:, x1:] = False
    fig[:y0] = fig[y1:] = False; hair[:y0] = hair[y1:] = False
    # clean: keep rows with a decent run
    rows = np.nonzero(fig.sum(1) > 6)[0]
    top, sole = rows.min(), rows.max()
    hrows = np.nonzero(hair.sum(1) > 3)[0]
    return dict(top=int(top), sole=int(sole), fig=fig, hair=hair, skin=skin, hrows=hrows)

if __name__ == "__main__":
    t, x0, x1 = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
    P = profile(t, x0, x1)
    s = 13.24 / (P["sole"] - P["top"])
    print(f"t{t}: top {P['top']} sole {P['sole']}  scale {s:.4f} u/px")
    hair, skin, fig = P["hair"], P["skin"], P["fig"]
    for y in range(P["top"], P["top"] + int(3.6 / s), 4):
        z = 4.24 - (y - P["top"]) * s
        hx = np.nonzero(hair[y])[0]; sx = np.nonzero(skin[y])[0]; fx = np.nonzero(fig[y])[0]
        f = lambda v: f"{v.min():4d}-{v.max():4d}" if len(v) else "    -    "
        print(f"z {z:5.2f}  hair {f(hx)}  skin {f(sx)}  fig {f(fx)}")
