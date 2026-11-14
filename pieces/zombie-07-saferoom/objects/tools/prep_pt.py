# ep5 (P.T.): fotos -> texturas PS1 (128 px, 32 colores) en tex/ + siluetas por filas (rows/*.json) para el loft.
# python -I tools/prep_pt.py   (las fotos vienen de commons.py; las de P.T. de fuentes/zombie-nicho/pt_refs)
import numpy as np, os, json
from PIL import Image, ImageDraw, ImageFilter
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; P = H + "/photos"; T = H + "/tex"; RW = H + "/rows"
REF = H + "/../../../fuentes/zombie-nicho/pt_refs"
os.makedirs(T, exist_ok=True); os.makedirs(RW, exist_ok=True)
def load(n): return Image.open(f"{P}/{n}.jpg").convert("RGB")
def rect(im, quad, w, h):   # quad TL TR BR BL en fracciones de la foto -> w x h
    W, Hh = im.size; quad = [(x * W, y * Hh) for x, y in quad]; dst = [(0, 0), (w, 0), (w, h), (0, h)]; A, b = [], []
    for (x, y), (u, v) in zip(dst, quad):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; b += [u, v]
    c = np.linalg.solve(np.array(A, float), np.array(b, float))
    return im.transform((w, h), Image.PERSPECTIVE, tuple(c), Image.BICUBIC)
def crop(im, x0, y0, x1, y1): W, Hh = im.size; return im.crop((int(x0 * W), int(y0 * Hh), int(x1 * W), int(y1 * Hh)))
def ps1(im, w, h, n=32, name=None, dark=1.0):
    im = im.resize((w, h), Image.LANCZOS)
    if dark != 1.0: im = Image.fromarray((np.asarray(im, float) * dark).clip(0, 255).astype(np.uint8))
    im = im.quantize(n, method=Image.MEDIANCUT, dither=Image.NONE).convert("RGB")
    if name: im.save(f"{T}/{name}.png")
    return im
def rows(im, isbg, name, n=24):
    """silueta: por fila, ancho del objeto (pixeles que no son fondo), centrada. -> rows/<name>.json [[v, x0, x1], ...] en 0..1"""
    a = np.asarray(im, float); m = ~isbg(a); m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))) > 127
    Hh, W = m.shape; out = []
    for k in range(n + 1):
        y = min(Hh - 1, int(k / n * (Hh - 1))); xs = np.where(m[y])[0]
        out.append([1 - y / (Hh - 1), (xs[0] / W) if len(xs) else 0.5, (xs[-1] / W) if len(xs) else 0.5])
    json.dump(out, open(f"{RW}/{name}.json", "w")); return out

# radio (caja de madera y metal, 1960s): frente y la tapa lateral de madera
r = load("radio/c_9")
ps1(rect(r, [(0.115, 0.30), (0.93, 0.27), (0.93, 0.88), (0.115, 0.90)], 512, 256), 128, 64, name="radio_front")
ps1(crop(r, 0.03, 0.30, 0.10, 0.88), 16, 64, name="radio_side")
# portarretrato dorado con la foto familiar de P.T. (la de la comoda de hall_norm) en el ovalo
f = crop(load("frame/c_4"), 0.12, 0.15, 0.92, 0.87).resize((256, 256), Image.LANCZOS)
ph = Image.open(f"{REF}/hall_norm.png").convert("RGB").crop((455, 590, 525, 690)).resize((96, 130), Image.LANCZOS)
mk = Image.new("L", (96, 130), 0); ImageDraw.Draw(mk).ellipse((0, 0, 95, 129), fill=255)
f.paste(ph, (80, 38), mk); ps1(f, 64, 64, name="frame_photo")
# cuadros de la pared del pasillo (la pintura manchada de hall_norm) y uno oscuro del de la izquierda
ps1(Image.open(f"{REF}/hall_norm.png").convert("RGB").crop((1262, 434, 1456, 596)), 64, 52, name="painting_a")
ps1(Image.open(f"{REF}/the_never_ending_hallway.jpg").convert("RGB").crop((1130, 360, 1250, 470)), 48, 44, name="painting_b", dark=1.3)
# puertas: la del bano (una hoja de cuarterones) y la del fondo (doble)
ps1(rect(load("door/c_8"), [(0.245, 0.16), (0.70, 0.145), (0.70, 0.855), (0.245, 0.86)], 300, 700), 56, 128, name="door_leaf")
ps1(crop(load("door/c_8"), 0.20, 0.12, 0.24, 0.86), 8, 128, name="door_jamb")
ps1(crop(load("door/c_11"), 0.18, 0.24, 0.88, 0.95), 96, 128, name="door_double")
# farol colgante (fondo rojo) y lampara de mesa de vidrio (fondo gris): silueta por filas para el loft
lan = crop(load("lamp/c_4"), 0.40, 0.04, 0.74, 0.80); a_ = np.asarray(ps1(lan, 48, 128)).astype(int)
a_[(a_[..., 0] > a_[..., 1] * 1.25) & (a_[..., 0] > 60)] = [52, 50, 46]; Image.fromarray(a_.astype(np.uint8)).save(f"{T}/lantern.png")   # fondo rojo de la foto -> metal oscuro
rows(lan, lambda a: (a[..., 0] > a[..., 1] * 1.25) & (a[..., 0] > 60), "lantern")
lp = crop(load("lamp/c_0"), 0.20, 0.03, 0.82, 0.98); ps1(lp, 48, 128, name="table_lamp")
rows(lp, lambda a: (np.abs(a[..., 0] - a[..., 1]) < 12) & (np.abs(a[..., 1] - a[..., 2]) < 14) & (a.mean(-1) > 95) & (a.mean(-1) < 200), "table_lamp")
# reloj de pared con pendulo (fondo blanco)
ck = crop(load("clock/c_6"), 0.0, 0.01, 1.0, 0.985); ps1(ck, 64, 128, name="wall_clock")
rows(ck, lambda a: a.mean(-1) > 225, "wall_clock", 32)
# TV CRT: frente (la pantalla la dibuja el motor encima) y laterales negros
ps1(rect(load("crt/c_1"), [(0.05, 0.20), (0.80, 0.20), (0.80, 0.81), (0.05, 0.81)], 400, 330), 96, 80, name="crt_front")
ps1(crop(load("crt/c_1"), 0.06, 0.74, 0.30, 0.80), 16, 32, name="crt_side")   # plastico negro del borde inferior
# comoda: frente de cajones y la tapa
dr = load("dresser/c_1")
ps1(rect(dr, [(0.14, 0.16), (0.86, 0.16), (0.86, 0.79), (0.14, 0.79)], 512, 300), 128, 72, name="dresser_front")
ps1(crop(dr, 0.16, 0.17, 0.84, 0.22), 64, 16, name="dresser_top")   # veta del frente (la tapa tiene un jarron encima)
# parquet en espiga (P.T.)
ps1(crop(load("parquet/c_5"), 0.0, 0.0, 0.5, 0.5), 64, 64, name="parquet", dark=0.85)
print(sorted(os.listdir(T)))
