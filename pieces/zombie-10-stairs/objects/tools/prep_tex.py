# Fotos -> texturas PS1 (rectificadas por 4 esquinas, 128 px, ~32 colores, nearest) en tex/. python -I tools/prep_tex.py
import numpy as np, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; P = H + "/photos"; T = H + "/tex"; os.makedirs(T, exist_ok=True)
def rect(src, quad, w, h):   # quad TL TR BR BL (px de la foto original) -> w x h
    im = Image.open(f"{P}/{src}.jpg").convert("RGB"); dst = [(0, 0), (w, 0), (w, h), (0, h)]; A, b = [], []
    for (x, y), (u, v) in zip(dst, quad):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; b += [u, v]
    c = np.linalg.solve(np.array(A, float), np.array(b, float))
    return im.transform((w, h), Image.PERSPECTIVE, tuple(c), Image.BICUBIC)
def ps1(im, w, h, n=32, name=None):
    im = im.resize((w, h), Image.LANCZOS).quantize(n, method=Image.MEDIANCUT, dither=Image.NONE).convert("RGB")
    if name: im.save(f"{T}/{name}.png")
    return im
big = lambda im, s=4: im.resize((im.width * s, im.height * s), Image.NEAREST)
# ---- vagón: frente (cabina) y lateral (panel con ventana), puerta = mitad del panel
front = rect("car/c_1", [(595, 370), (1106, 355), (1106, 890), (595, 890)], 400, 420); ps1(front, 128, 128, name="car_front")
pier = rect("car/c_1", [(418, 447), (562, 388), (562, 840), (418, 790)], 160, 420); ps1(pier, 64, 128, name="car_side")
# ---- torniquete: extremo (lector) y lateral (cara con el trípode)
ps1(rect("turnstile/c_9", [(910, 650), (1110, 650), (1145, 1543), (903, 1557)], 200, 800), 32, 128, name="turn_front")
ps1(rect("turnstile/c_9", [(668, 604), (910, 650), (903, 1557), (668, 1195)], 300, 800), 64, 128, name="turn_side")
# ---- máquina de billetes: frente; lateral = franja de acero del borde
tm = rect("ticketm/c_8", [(427, 455), (825, 455), (825, 1192), (434, 1192)], 400, 740); ps1(tm, 72, 128, name="ticket_front")
ps1(tm.crop((0, 0, 30, 740)), 32, 128, name="ticket_side")
# ---- reloj LED: caja; la zona de dígitos se pinta oscura (los dígitos rojos los dibuja el motor)
ck = rect("clock/c_8", [(242, 156), (1195, 341), (1195, 718), (199, 697)], 600, 260)
a = np.array(ck); a[38:218, 55:565] = (np.random.default_rng(1).integers(10, 24, (180, 510, 1)) * [1, 0.9, 1]).astype(np.uint8); ck = Image.fromarray(a); ps1(ck, 128, 56, name="clock_front")
ps1(ck.crop((0, 0, 40, 260)), 16, 56, name="clock_side")
# ---- teléfono: frente sobre blanco (silueta para el loft) + pantalla negra
ph = Image.open(f"{P}/phone/c_5.jpg").convert("RGB").crop((149, 100, 1149, 2197)); ps1(ph, 64, 128, name="phone_front")
# ---- cartel de estación: esmalte azul + borde blanco de la chapa (Lyons' Tea) con el nombre inventado
blue = Image.open(f"{P}/sign2/c_1.jpg").convert("RGB").crop((190, 352, 1105, 428)).resize((512, 96), Image.BICUBIC)
sg = Image.new("RGB", (512, 96)); sg.paste(blue, (0, 0)); d = ImageDraw.Draw(sg)
d.rectangle([5, 5, 506, 90], outline=(235, 236, 240), width=4)
f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 58); d.text((256, 50), "MERCY STREET", font=f, fill=(240, 240, 244), anchor="mm")
ps1(sg, 128, 24, name="sign_front")
# ---- paredes y andén
ps1(Image.open(f"{P}/ticketm/c_8.jpg").convert("RGB").crop((270, 213, 412, 455)), 64, 96, name="wall_tile")
ps1(Image.open(f"{P}/car/c_1.jpg").convert("RGB").crop((10, 1050, 280, 1270)), 64, 64, name="floor_granite")
ps1(Image.open(f"{P}/car/c_1.jpg").convert("RGB").crop((470, 930, 640, 990)), 64, 32, name="floor_yellow")

# ---- banco (foto de anden de NYC en 3/4): respaldo y asiento rectificados por separado
ps1(rect("bench/c_11", [(604, 523), (956, 469), (964, 515), (609, 569)], 400, 60), 128, 24, name="bench_back")
ps1(rect("bench/c_11", [(609, 569), (964, 515), (1031, 529), (597, 609)], 400, 60), 128, 24, name="bench_seat")
# ---- torniquete: lateral SIN los brazos pintados (acero liso del gabinete de la izquierda de la misma foto)
ps1(Image.open(f"{P}/turnstile/c_9.jpg").convert("RGB").crop((250, 1050, 470, 1560)), 64, 128, name="turn_side")
print(sorted(os.listdir(T)))
