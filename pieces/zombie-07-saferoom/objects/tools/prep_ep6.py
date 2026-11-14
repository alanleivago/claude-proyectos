# ep6 (piso 30): fotos aisladas sobre blanco (Google Flow, photos/<name>/f_k.jpg) -> texturas PS1 (64-128 px, 32 colores,
# sin dither) en tex/ + siluetas por filas (rows/*.json) para los lofts.   python -I tools/prep_ep6.py
import numpy as np, os, json
from PIL import Image, ImageFilter
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; P = H + "/photos"; T = H + "/tex"; RW = H + "/rows"; CUT = H + "/photos/_cut"
for d in (T, RW, CUT): os.makedirs(d, exist_ok=True)
def load(n): return Image.open(f"{P}/{n}.jpg").convert("RGB")
def ps1(im, w, h, n=32, name=None, dark=1.0):
    im = im.resize((w, h), Image.LANCZOS)
    if dark != 1.0: im = Image.fromarray((np.asarray(im, float) * dark).clip(0, 255).astype(np.uint8))
    im = im.quantize(n, method=Image.MEDIANCUT, dither=Image.NONE).convert("RGB")
    if name: im.save(f"{T}/{name}.png")
    return im
def fg(im):   # mascara del objeto: todo lo que no es el blanco del fondo
    a = np.asarray(im, float); m = (a.min(-1) < 236) | (a.max(-1) - a.min(-1) > 16)
    return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))) > 127
def cutout(im, name, m=None):   # recorte PNG con alfa (para la hoja de comparacion): fondo = blanco conectado al borde
    if m is None:
        a = np.asarray(im, float); e = ((a.min(-1) < 249) | (a.max(-1) - a.min(-1) > 6)).astype(np.uint8) * 255
        L = Image.fromarray(e).filter(ImageFilter.MaxFilter(3)); L = Image.fromarray(np.pad(np.asarray(L), 2))
        from PIL import ImageDraw as _D; _D.floodfill(L, (0, 0), 128); m = np.asarray(L)[2:-2, 2:-2] != 128
    a = np.dstack([np.asarray(im), (m * 255).astype(np.uint8)]); Image.fromarray(a, "RGBA").save(f"{CUT}/{name}.png")
def rows(m, name, n=24, vs=None):
    """silueta por fila (de abajo v=0 a arriba v=1): [v, x0, x1] en fracciones del ancho del recorte (filas vacias del borde -> la mas cercana)"""
    ys_ = np.where(m.any(1))[0]; m = m[ys_[0]:ys_[-1] + 1]; Hh, W = m.shape; out = []
    for v in (vs or [k / n for k in range(n + 1)]):
        y = min(Hh - 1, int((1 - v) * (Hh - 1))); xs = np.where(m[y])[0]
        out.append([v, xs[0] / W, xs[-1] / W])
    out.sort(); json.dump(out, open(f"{RW}/{name}.json", "w")); return out
def bleed(im, m):   # fondo -> color del borde del objeto en esa fila (que el UV del canto no muestree blanco)
    a = np.array(im); m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9))) > 127
    for y in range(a.shape[0]):
        xs = np.where(m[y])[0]
        if len(xs): a[y, :xs[0]] = a[y, xs[0]]; a[y, xs[-1] + 1:] = a[y, xs[-1]]
    return Image.fromarray(a)
def solid(rgb, name, s=8): Image.new("RGB", (s, s), rgb).save(f"{T}/{name}.png")

# 1 banera (f_1): faldon frontal; borde/interior con el blanco-gris del interior de la foto; cromo del grifo
b = load("bathtub/f_1"); cutout(b.crop((85, 120, 1292, 642)), "bathtub")
ps1(b.crop((95, 336, 1290, 640)), 128, 32, name="tub_front")
ps1(b.crop((420, 215, 1000, 300)), 64, 16, name="tub_inner", dark=0.84)
ps1(b.crop((420, 215, 1000, 300)), 64, 16, name="tub_floor", dark=0.74)
ps1(b.crop((300, 176, 1100, 192)), 32, 8, name="tub_rim")
ps1(b.crop((175, 192, 285, 240)), 32, 16, name="chrome")
# 2 balde naranja (f_1): solo el plastico (sin el asa) para la silueta
k = load("bucket/f_1").crop((150, 385, 752, 1120)); a = np.asarray(k, float)
mb = (a[..., 0] > 150) & (a[..., 0] - a[..., 2] > 80)
mb = np.asarray(Image.fromarray((mb * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(7))) > 127
rows(mb, "bucket", 16); ps1(bleed(k, mb), 64, 80, name="bucket"); cutout(load("bucket/f_1").crop((130, 90, 765, 1122)), "bucket")
ps1(k.crop((260, 400, 360, 700)), 16, 16, name="bucket_in", dark=0.7)
ps1(load("bucket/f_1").crop((380, 98, 530, 125)), 16, 4, name="grip")
# 3 heladera crema (f_1): frente completo (puertas, manijas, rejilla)
f = load("fridge/f_1").crop((188, 44, 722, 1160)); ps1(f, 64, 128, name="fridge_front"); cutout(f, "fridge")
ps1(f.crop((300, 500, 500, 1000)), 16, 32, name="fridge_side", dark=0.9)
# 4 comoda (f_1): frente; tapa y costados con la madera del cajon
d = load("dresser/f_1").crop((260, 74, 940, 850)); ps1(d, 128, 112, name="dresser_front"); cutout(d, "dresser")
ps1(d.crop((60, 40, 600, 140)), 64, 32, name="dresser_wood")
# 5 cuaderno abierto (f_1, cenital): cada pagina por separado (UV 0..1), espiral metalica
n = load("notebook/f_1"); cutout(n.crop((190, 55, 1190, 720)), "notebook")
ps1(n.crop((205, 70, 640, 705)), 96, 128, name="page_L"); ps1(n.crop((725, 70, 1170, 705)), 96, 128, name="page_R")
solid((120, 122, 128), "spiral")
# 6 lata "BEANS" (f_2, marca inventada): silueta + etiqueta
c = load("cans/f_2").crop((190, 218, 706, 1001)); rows(fg(c), "can", 16); ps1(bleed(c, fg(c)), 64, 96, name="can"); cutout(c, "can")
solid((168, 168, 172), "can_top")
# 7 telefono negro (f_1): contorno redondeado por filas
p = load("phone/f_1").crop((201, 84, 697, 1115)); mp = np.asarray(p.convert("L"), float) < 160
rows(mp, "phone", vs=[0, 0.004, 0.012, 0.025, 0.04, 0.5, 0.96, 0.975, 0.988, 0.996, 1]); ps1(p, 32, 64, name="phone_front"); cutout(p, "phone", mp)
# 8 tablon (f_1): franja central 10:1
t = load("plank/f_1"); cutout(t.crop((53, 273, 1324, 503)), "plank")
ps1(t.crop((53, 324, 1324, 451)), 128, 16, name="plank"); ps1(t.crop((53, 273, 1324, 290)), 128, 4, name="plank_edge", dark=0.8)
print(sorted(os.listdir(T)))

# hoja de comparacion (despues de build_ep6.py):  python -I tools/prep_ep6.py cmp  -> compare/<name>_cmp.png + compare/ALL.png
import sys
if sys.argv[-1] == "cmp":
    from PIL import ImageDraw
    C = H + "/compare"; rws = []
    for n, cut in [("bathtub", "bathtub"), ("bucket", "bucket"), ("fridge", "fridge"), ("dresser", "dresser"), ("notebook", "notebook"),
                   ("can", "can"), ("cans_stack", "can"), ("phone", "phone"), ("plank", "plank")]:
        ph = Image.open(f"{CUT}/{cut}.png"); bg = Image.new("RGB", ph.size, (20, 20, 23)); bg.paste(ph, (0, 0), ph)
        ims = [bg] + [Image.open(f"{C}/{n}_{t}.png").convert("RGB") for t in ("front", "34")]
        S = 300; ims = [i.resize((round(i.width * S / i.height), S)) for i in ims]
        sh = Image.new("RGB", (sum(i.width for i in ims) + 20, S + 18), (30, 30, 30)); dr = ImageDraw.Draw(sh); x = 0
        for lab, i in zip(("FOTO (recorte)", "RENDER FRENTE", "RENDER 3/4"), ims): sh.paste(i, (x, 18)); dr.text((x + 4, 3), f"{n}: {lab}", fill=(255, 255, 0)); x += i.width + 10
        sh.save(f"{C}/{n}_cmp.png"); rws.append(sh)
    A = Image.new("RGB", (max(r.width for r in rws), sum(r.height for r in rws)), (30, 30, 30)); y = 0
    for r in rws: A.paste(r, (0, y)); y += r.height
    A.save(f"{C}/ALL.png"); print(A.size)
