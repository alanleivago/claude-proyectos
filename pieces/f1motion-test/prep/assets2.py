"""Derived assets from the Flow PNGs: front van cut, van window + sill layer, pixel sprites (NEAREST mosaic of the Flow art),
recoloured jerseys, mirrored chevron. Prints the measured window box for gen.py."""
import colorsys, json, numpy as np
from pathlib import Path
from PIL import Image
from rembg import new_session, remove
R = Path(__file__).resolve().parent.parent; F = R / "assets/flow"; G = R / "flow/gen"
meta = {}
src = sorted(G.glob("*.jpg"))[-1]
if not (F / "van_front.png").exists():
    o = remove(Image.open(src).convert("RGB"), session=new_session("birefnet-general")); o.crop(o.getbbox()).save(F / "van_front.png")
# van side window: darkest big blob in the upper-left 50 % (cab faces left)
v = Image.open(F / "van_side.png").convert("RGBA"); a = np.asarray(v).astype(int)
lum = a[:, :, :3].mean(2); W, H = v.size
m = (lum < 95) & (a[:, :, 3] > 200); m[int(H * 0.55):] = False; m[:, int(W * 0.5):] = False
ys, xs = np.nonzero(m)
box = [int(np.percentile(xs, 2)), int(np.percentile(ys, 2)), int(np.percentile(xs, 98)), int(np.percentile(ys, 98))]
box = [255, 75, 450, 215]; meta["van_window"] = box; meta["van_size"] = [W, H]
sill = box[3]
low = a.copy(); low[:sill, :, 3] = 0                     # front layer: everything below the window sill
Image.fromarray(low.astype(np.uint8)).save(F / "van_side_low.png")
Image.open(F / "chevron.png").transpose(Image.FLIP_LEFT_RIGHT).save(F / "chevron_r.png")
def pixelate(im, blocks, colors=28):
    im = im.convert("RGBA"); w, h = im.size; bw = blocks; bh = max(1, round(h * blocks / w))
    sm = im.resize((bw, bh), Image.BILINEAR)
    al = np.asarray(sm)[:, :, 3]; rgb = sm.convert("RGB").quantize(colors, method=Image.Quantize.MEDIANCUT).convert("RGB")
    out = np.dstack([np.asarray(rgb), np.where(al > 110, 255, 0)]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")
def recolor(im, rgb):
    a = np.asarray(im.convert("RGBA")).astype(float) / 255; out = a.copy()
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g > r * 1.25) & (g > b * 1.1) & (a[..., 3] > 0)
    l = (0.3 * r + 0.59 * g + 0.11 * b)
    t = np.array(rgb) / 255; tl = 0.3 * t[0] + 0.59 * t[1] + 0.11 * t[2]
    for k in range(3):
        out[..., k] = np.where(green, np.clip(t[k] * (l / max(tl, 0.05)) * 0.95, 0, 1), a[..., k])
    return Image.fromarray((out * 255).astype(np.uint8), "RGBA")
P = R / "assets/px"; P.mkdir(exist_ok=True)
jf = Image.open(F / "jersey_front.png")
COLS = {"teal": (31, 158, 138), "red": (215, 38, 61), "orange": (255, 150, 25), "navy": (29, 43, 122), "sky": (74, 127, 224), "pink": (255, 105, 190),
        "gray": (140, 140, 140), "crimson": (194, 30, 43), "blue": (33, 64, 216), "green": None, "black": (45, 45, 45)}
for n, c in COLS.items():
    j = jf if c is None else recolor(jf, c)
    pixelate(j, 26).save(P / f"jersey_{n}.png")
pixelate(Image.open(F / "van_side.png"), 44).save(P / "van.png")
pixelate(Image.open(F / "house.png"), 22).save(P / "house.png")
pixelate(Image.open(F / "box.png"), 16).save(P / "box.png")
pixelate(Image.open(F / "coin.png"), 16).save(P / "coin.png")
pixelate(Image.open(F / "jersey_back.png"), 26).save(P / "jersey_back.png")
pv = Image.open(P / "van.png"); pa = np.asarray(pv).astype(int)
meta["px_van"] = list(pv.size)
(R / "prep/assets_meta.json").write_text(json.dumps(meta), encoding="utf-8"); print(meta)
