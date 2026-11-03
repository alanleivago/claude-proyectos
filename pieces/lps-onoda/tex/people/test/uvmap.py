import json, colorsys
from PIL import Image, ImageDraw
D = json.load(open("uvdump.json")); S = 1024
parts = sorted({d["part"].split(".")[0] for d in D})
grp = lambda p: p.replace("_L", "").replace("_R", "")
gs = sorted({grp(p) for p in parts}); print(gs)
col = {g: tuple(int(255 * c) for c in colorsys.hsv_to_rgb(i / len(gs), 0.9, 1)) for i, g in enumerate(gs)}
for mode in ("facing", "part"):
    im = Image.new("RGB", (S, S), (0, 0, 0)); dr = ImageDraw.Draw(im, "RGBA")
    for d in D:
        n = d["n"]; pts = [(u * S, (1 - v) * S) for u, v in d["uv"]]
        if mode == "facing":
            c = (255, 60, 60) if n[1] < -0.5 else (60, 120, 255) if n[1] > 0.5 else (60, 220, 60) if abs(n[0]) > 0.5 else (200, 200, 200)
        else:
            c = col[grp(d["part"].split(".")[0])]
        dr.polygon(pts, fill=c + (90,), outline=c + (255,))
    for i in range(0, S, 128): dr.line([(i, 0), (i, S)], fill=(255, 255, 255, 60)); dr.line([(0, i), (S, i)], fill=(255, 255, 255, 60))
    if mode == "part":
        for i, g in enumerate(gs): dr.rectangle([4, 4 + 18 * i, 16, 16 + 18 * i], fill=col[g]); dr.text((20, 4 + 18 * i), g, fill=(255, 255, 255))
    im.save(f"uv_{mode}.png")
