# hoja por objeto: recorte PNG de la foto | render frontal | render 3/4 -> compare/<name>_cmp.png + compare/ALL.png
import os
from PIL import Image, ImageDraw
H = os.path.dirname(os.path.abspath(__file__)) + "/.."
rows = []
for n in ["chest", "kit", "spray", "bandage", "water", "flashlight", "battery", "charger"]:
    cut = Image.open(f"{H}/photos/_cut/{n}.png"); bg = Image.new("RGB", cut.size, (20, 20, 23)); bg.paste(cut, (0, 0), cut)
    ims = [bg] + [Image.open(f"{H}/compare/{n}_{t}.png").convert("RGB") for t in ("front", "34")]
    S = 240; ims = [i.resize((max(1, round(i.width * S / i.height)), S)) for i in ims]
    W = sum(i.width for i in ims) + 20; sh = Image.new("RGB", (W, S + 18), (30, 30, 30)); d = ImageDraw.Draw(sh); x = 0
    for lab, i in zip(("PHOTO (cutout)", "FRONT", "3/4"), ims): sh.paste(i, (x, 18)); d.text((x + 4, 3), f"{n}: {lab}", fill=(255, 255, 0)); x += i.width + 10
    sh.save(f"{H}/compare/{n}_cmp.png"); rows.append(sh)
W = max(r.width for r in rows); cols = 2; rr = (len(rows) + 1) // 2
A = Image.new("RGB", (W * cols, rr * 258), (30, 30, 30))
for i, r in enumerate(rows): A.paste(r, ((i % cols) * W, (i // cols) * 258))
A.save(f"{H}/compare/ALL.png"); print(A.size)
