"""His silhouettes: v5/ref_<view>_mask.png (character vs background) from the reference frames."""
import numpy as np
from PIL import Image
from scipy import ndimage as nd
F = "/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/cam/"
OUT = "/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/"
VIEWS = {"front": ("front_rest.png", "vp", (560, 1100)), "q3": ("q3.png", "game", (650, 1300)),
         "side": ("side.png", "game", (650, 1300)), "back": ("back.png", "game", (700, 1250)),
         "front_idle": ("front_idle.png", "game", (650, 1300))}


def mask(view):
    fn, kind, (x0, x1) = VIEWS[view]
    a = np.asarray(Image.open(F + fn).convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if kind == "game":
        m = (r - b > 12) | (g - b > 15) | (r + g + b > 330) | (r - g > 10)
    else:
        m = (a.max(2) - a.min(2) > 22) | (r + g + b > 400)
    m[:, :x0] = False; m[:, x1:] = False
    m[:60] = False
    m = nd.binary_opening(m, iterations=1)
    lab, n = nd.label(m); sz = nd.sum(m, lab, range(1, n + 1))
    keep = np.argmax(sz) + 1
    m = lab == keep
    m = nd.binary_closing(m, iterations=3); m = nd.binary_fill_holes(m)
    return m


if __name__ == "__main__":
    for v in VIEWS:
        m = mask(v); ys, xs = np.nonzero(m)
        Image.fromarray((m * 255).astype(np.uint8)).save(OUT + f"ref_{v}_mask.png")
        print(v, "bbox x", xs.min(), xs.max(), "y", ys.min(), ys.max(), "px", m.sum())
