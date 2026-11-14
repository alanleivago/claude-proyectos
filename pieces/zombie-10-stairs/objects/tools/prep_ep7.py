# ep7 (safe room): fotos de Flow aisladas (photos/<name>/f_k.jpg) -> recorte PNG sin fondo (photos/_cut/<name>.png),
# texturas PS1 (<=128 px, 32 colores, sin dither) en tex/ y siluetas por filas (rows/*.json) para los lofts.
# python -I tools/prep_ep7.py
import numpy as np, os, json
from PIL import Image, ImageFilter, ImageDraw
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; P = H + "/photos"; T = H + "/tex"; RW = H + "/rows"; CUT = P + "/_cut"
for d in (T, RW, CUT): os.makedirs(d, exist_ok=True)


def mask(im, tol=22):
    """fondo = pixeles parecidos al color del borde, conectados al borde (flood fill)"""
    a = np.asarray(im, float); bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), 0)
    e = (np.abs(a - bg).max(-1) > tol).astype(np.uint8) * 255
    from scipy import ndimage
    E = np.pad(np.asarray(Image.fromarray(e).filter(ImageFilter.MaxFilter(3))) > 0, 2); lab, _ = ndimage.label(~E)
    m = (lab != lab[0, 0])[2:-2, 2:-2]
    return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))) > 127


def crop(name, k=1, tol=22):
    im = Image.open(f"{P}/{name}/f_{k}.jpg").convert("RGB"); m = mask(im, tol)
    if name == "bandage":   # fondo gris: la sombra del pie sale en la mascara -> fuera las filas mas anchas que el rollo
        wd = m.sum(1); med = np.median(wd[wd > 0]); ys = np.where(wd > med * 0.9)[0]; y0, y1 = ys[0], ys[-1]
        mid = np.where(m[(y0 + y1) // 2])[0]; m[:] = False; m[y0:y1 + 1, mid[0]:mid[-1] + 1] = True   # rollo = rectangulo del cuerpo (la tapa blanca se pierde en el gris)
    ys, xs = np.where(m); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    im, m = im.crop(box), m[box[1]:box[3], box[0]:box[2]]
    Image.fromarray(np.dstack([np.asarray(im), (m * 255).astype(np.uint8)]), "RGBA").save(f"{CUT}/{name}.png")
    return im, m


def ps1(im, w, h, name, n=32, dark=1.0):
    im = im.resize((w, h), Image.LANCZOS)
    if dark != 1.0: im = Image.fromarray((np.asarray(im, float) * dark).clip(0, 255).astype(np.uint8))
    im = im.quantize(n, method=Image.MEDIANCUT, dither=Image.NONE).convert("RGB"); im.save(f"{T}/{name}.png"); return im


def bleed(im, m):   # fondo -> color del borde del objeto en esa fila (el UV del canto no muestrea blanco)
    a = np.array(im); m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(7))) > 127
    for y in range(a.shape[0]):
        xs = np.where(m[y])[0]
        if len(xs): a[y, :xs[0]] = a[y, xs[0]]; a[y, xs[-1] + 1:] = a[y, xs[-1]]
    return Image.fromarray(a)


def rows(m, name, n=24):
    Hh, W = m.shape; out = []
    for v in [k / n for k in range(n + 1)]:
        y = min(Hh - 1, int((1 - v) * (Hh - 1))); xs = np.where(m[y])[0]
        if not len(xs): xs = np.array([W // 2 - 1, W // 2])
        out.append([v, xs[0] / W, xs[-1] / W])
    json.dump(out, open(f"{RW}/{name}.json", "w")); return out


def aspect(im): return im.height / im.width


info = {}
# baul (item box): cuerpo = parte bajo la tapa (la junta de la tapa cae a ~24 % del alto en la foto)
im, m = crop("chest", 1); ps1(im, 128, round(128 * aspect(im)), "chest_front"); hh = im.height; s = int(hh * 0.24)
ps1(im.crop((0, s, im.width, hh)), 128, 64, "chest_body"); ps1(im.crop((0, 0, im.width, s)), 128, 24, "chest_lid")
ps1(im.crop((int(im.width * 0.08), int(hh * 0.35), int(im.width * 0.3), int(hh * 0.9))), 32, 32, "chest_side")
info["chest"] = aspect(im)
# botiquin rojo: cuerpo bajo los cierres + tapa con la cruz; manija aparte (color liso)
im, m = crop("kit", 1); ps1(bleed(im, m), 96, round(96 * aspect(im)), "kit_front"); info["kit"] = aspect(im)
ps1(im.crop((int(im.width * 0.1), int(im.height * 0.45), int(im.width * 0.3), int(im.height * 0.6))), 16, 16, "kit_side")
# spray antiseptico (diseno original), venda, pila AA, linterna, bidon de agua: lofts por silueta
for name, w, n in (("spray", 48, 24), ("bandage", 48, 16), ("battery", 32, 16), ("flashlight", 32, 24), ("water", 64, 24)):
    im, m = crop(name, 1, tol=14 if name == "bandage" else 22); rows(m, name, n)
    ps1(bleed(im, m), w, round(w * aspect(im) / 8) * 8 or 8, name); info[name] = aspect(im)
# cargador (power bank negro): solo el cuerpo (sin el cable)
im = Image.open(f"{P}/charger/f_1.jpg").convert("RGB"); m = mask(im); lab = m.copy(); W = im.width
cols = np.where(m.any(0))[0]; gaps = [c for c in range(cols[0], cols[-1]) if not m[:, c].any()]
x1 = gaps[0] if gaps else cols[-1]; sub = m[:, cols[0]:x1]; ys = np.where(sub.any(1))[0]
box = (cols[0], ys[0], x1, ys[-1] + 1); im2, m2 = im.crop(box), m[box[1]:box[3], box[0]:box[2]]
Image.fromarray(np.dstack([np.asarray(im2), (m2 * 255).astype(np.uint8)]), "RGBA").save(f"{CUT}/charger.png")
ps1(bleed(im2, m2), 48, round(48 * aspect(im2)), "charger"); info["charger"] = aspect(im2)
json.dump(info, open(f"{RW}/_aspect.json", "w"), indent=1); print(info)
