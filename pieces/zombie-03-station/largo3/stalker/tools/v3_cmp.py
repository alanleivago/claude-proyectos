# python tools/v3_cmp.py <stalker_dir> <name>  -> v3/<name>_cmp.png: por vista, la hoja con el contorno rojo de la malla + la malla sola
import sys, json, numpy as np
from PIL import Image, ImageFilter
D, n = sys.argv[1], sys.argv[2]
P = json.load(open(f"{D}/v3/profiles.json")); sheet = Image.open(f"{D}/v3/sheet.jpg").convert("RGB")
tiles = []
for v, key in (("front", "F"), ("side", "SIDE"), ("back", "B")):
    a, b = P[key]; w = b - a + 41; mid = (a + b) / 2; x0 = int(round(mid - w / 2))
    r = sheet.crop((x0, 0, x0 + int(w), 768)); m = Image.open(f"{D}/v3/{n}_{v}.png").convert("RGBA")
    al = np.asarray(m)[:, :, 3] > 10
    edge = np.asarray(Image.fromarray((al * 255).astype("uint8")).filter(ImageFilter.FIND_EDGES)) > 0
    o = np.asarray(r).copy(); o[edge] = (255, 0, 0)
    bg = Image.new("RGB", m.size, (30, 30, 34)); bg.paste(m, (0, 0), m)
    tiles += [Image.fromarray(o), bg]
W = sum(t.width for t in tiles); out = Image.new("RGB", (W, 768)); x = 0
for t in tiles: out.paste(t, (x, 0)); x += t.width
out.save(f"{D}/v3/{n}_cmp.png"); print("ok")
