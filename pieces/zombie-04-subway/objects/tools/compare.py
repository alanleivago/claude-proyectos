# hoja por objeto: foto original (recorte) | render frontal (mismo angulo) | render 3/4 -> compare/<name>_cmp.png + compare/ALL.png
import os
from PIL import Image, ImageDraw
H = os.path.dirname(os.path.abspath(__file__)) + "/.."
SRC = {"subway_car": ("car/c_1", (560, 330, 1140, 920)), "turnstile": ("turnstile/c_9", (640, 560, 1180, 1580)),
       "ticket_machine": ("ticketm/c_8", (400, 430, 850, 1220)), "platform_clock": ("clock/c_8", (180, 140, 1220, 740)),
       "station_sign": ("sign2/c_1", (60, 60, 1240, 1800)), "phone": ("phone/c_5", (100, 60, 1200, 2240)), "bench": ("bench/c_11", (560, 440, 1060, 700))}
rows = []
for n, (src, box) in SRC.items():
    ims = [Image.open(f"{H}/photos/{src}.jpg").convert("RGB").crop(box)] + [Image.open(f"{H}/compare/{n}_{t}.png").convert("RGB") for t in ("front", "34")]
    S = 300; ims = [i.resize((round(i.width * S / i.height), S)) for i in ims]
    W = sum(i.width for i in ims) + 20; sh = Image.new("RGB", (W, S + 18), (30, 30, 30)); d = ImageDraw.Draw(sh); x = 0
    for lab, i in zip(("FOTO", "RENDER FRENTE", "RENDER 3/4"), ims): sh.paste(i, (x, 18)); d.text((x + 4, 3), f"{n}: {lab}", fill=(255, 255, 0)); x += i.width + 10
    sh.save(f"{H}/compare/{n}_cmp.png"); rows.append(sh)
W = max(r.width for r in rows); A = Image.new("RGB", (W, sum(r.height for r in rows)), (30, 30, 30)); y = 0
for r in rows: A.paste(r, (0, y)); y += r.height
A.save(f"{H}/compare/ALL.png"); print(A.size)
