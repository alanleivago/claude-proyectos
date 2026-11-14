# hojas: compare/<name>_cmp.png (recorte de la foto junto al render desde el mismo angulo + 3/4) y compare/PROPS_ROW.png
# (por prop: recorte arriba, render low poly abajo, nombre debajo; fondo oscuro, 1920 px). python -I tools/compare_ep8.py
import os
from PIL import Image, ImageDraw
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; C = H + "/compare"; CUT = H + "/photos/_cut"
BG = (20, 20, 23)
# prop -> [(recorte o None, vista del render)]
PAIRS = {"generator": [("generator", "front"), ("generator_side", "side"), (None, "34")], "jerrycan": [("jerrycan", "front"), (None, "34")],
         "bucket": [("bucket", "front"), (None, "34")], "handpump": [("handpump", "front"), (None, "34")], "padlock": [("padlock", "front"), (None, "34")],
         "chain": [(None, "front"), (None, "34")], "pickup": [("pickup", "side"), ("pickup_front", "front"), ("pickup_back", "back"), (None, "34")],
         "haybale": [("haybale", "front"), ("haybale_side", "side"), (None, "34")], "haybale_round": [("haybale_round", "side"), (None, "34")],
         "feedsack": [("feedsack", "front"), (None, "34")], "phone": [("phone", "front"), (None, "34")]}


def cut(n):
    c = Image.open(f"{CUT}/{n}.png").convert("RGBA")
    if c.getextrema()[3][0] == 255:   # recorte heredado sin alfa (balde de ep6): blanco conectado al borde = fondo
        import numpy as np; from scipy import ndimage
        a = np.asarray(c).copy(); w = (a[..., :3].min(-1) > 235); lab, _ = ndimage.label(w); edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
        sz = np.bincount(lab.ravel()); edge |= {i for i in range(1, len(sz)) if sz[i] > w.size * 0.01}; a[np.isin(lab, list(edge)), 3] = 0; c = Image.fromarray(a)
    bg = Image.new("RGB", c.size, BG); bg.paste(c, (0, 0), c); return bg


def tight(im, pad=6):   # recorta el fondo del render y lo pasa al color de la hoja
    import numpy as np
    a = np.asarray(im.convert("RGB")).astype(int); bg = a[0, 0]; m = np.abs(a - bg).max(-1) > 10
    ys, xs = np.where(m); a[~m] = BG; g = Image.fromarray(a.astype("uint8"))
    if not len(xs): return g
    return g.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(g.width, xs.max() + pad), min(g.height, ys.max() + pad)))


for n, pv in PAIRS.items():
    ims = []
    for cn, view in pv:
        if cn: ims.append((f"PHOTO {cn}", cut(cn)))
        ims.append((f"RENDER {view}", tight(Image.open(f"{C}/{n}_{view}.png"))))
    S = 260; ims = [(l, i.resize((max(1, round(i.width * S / i.height)), S), Image.NEAREST if l.startswith("R") else Image.LANCZOS)) for l, i in ims]
    W = sum(i.width for _, i in ims) + 10 * len(ims); sh = Image.new("RGB", (W, S + 20), (30, 30, 30)); d = ImageDraw.Draw(sh); x = 0
    for lab, i in ims: sh.paste(i, (x, 20)); d.text((x + 4, 4), f"{n}: {lab}", fill=(255, 255, 0)); x += i.width + 10
    sh.save(f"{C}/{n}_cmp.png")
# fila para el storyboard
ORDER = ["generator", "jerrycan", "bucket", "handpump", "padlock", "chain", "pickup", "haybale", "haybale_round", "feedsack", "phone"]
CW, TH, RH, LH, M = 1920 // len(ORDER), 300, 300, 34, 16
row = Image.new("RGB", (1920, M + TH + 10 + RH + LH + M), BG); d = ImageDraw.Draw(row)
try:
    from PIL import ImageFont; F = ImageFont.truetype("arialbd.ttf", 17); Fs = ImageFont.truetype("arial.ttf", 12)
except Exception: F = Fs = None
for k, n in enumerate(ORDER):
    x0 = k * CW + (1920 - CW * len(ORDER)) // 2; cn, view = PAIRS[n][0]
    for y0, im in ((M, cut(cn) if cn else None), (M + TH + 10, tight(Image.open(f"{C}/{n}_{view}.png")))):
        if im is None:
            d.text((x0 + CW // 2, y0 + TH // 2), "modeled\nin code", fill=(150, 150, 150), anchor="mm", font=Fs, align="center"); continue
        bw, bh = CW - 12, TH - 12; s = min(bw / im.width, bh / im.height); im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        row.paste(im, (x0 + (CW - im.width) // 2, y0 + (TH - im.height) // 2))
    d.text((x0 + CW // 2, M + TH + 10 + RH + 6), n, fill=(235, 225, 200), anchor="ma", font=F)
d.text((8, 4), "photo (Flow cutout)", fill=(110, 110, 110), font=Fs); d.text((8, M + TH + 12), "PS1 low poly", fill=(110, 110, 110), font=Fs)
row.save(f"{C}/PROPS_ROW.png"); print(row.size)
