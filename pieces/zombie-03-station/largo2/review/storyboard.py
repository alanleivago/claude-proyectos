# storyboard_v1_<n>.png del LARGO 2: un panel por plano (frames reales del motor, voz real) con id, tiempo, frase y nota.
# Necesita cuts.json (node cuts.mjs) y sb/f_<t>.png (stills en sb_times.txt). python storyboard.py
import json, glob, os, textwrap
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); E = os.path.join(H, "..", "engine")
F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
f = json.load(open(f"{H}/cuts.json")); c = f["cuts"]; notes = {x[0]: (x[1], x[3]) for x in json.load(open(f"{E}/shots.json", encoding="utf8"))}
TL = json.load(open(f"{E}/timeline.json", encoding="utf8"))
times = [float(x) for x in open(f"{H}/sb_times.txt").read().split(",")]
ids = [x[0] for x in c if not x[0].startswith("card_") or x[0] == "card_c0600"]
W, Hh, cols, rows = 384, 216, 4, 5
def said(t0, t1): return " ".join(w[4] for w in TL["words"] if t0 <= w[1] < t1 and not w[0].startswith("*"))[:160]
starts = dict(c); order = [x[0] for x in c]
pages = [list(zip(ids, times))[i:i + cols * rows] for i in range(0, len(ids), cols * rows)]
for pi, pg in enumerate(pages):
    sh = Image.new("RGB", (cols * (W + 10) + 10, rows * (Hh + 92) + 46), (18, 18, 22)); d = ImageDraw.Draw(sh)
    d.text((12, 12), f"AVA: DAY 2 - The Police Station Part 2  |  storyboard v4  page {pi + 1}/{len(pages)}  |  real engine frames, REAL voice  |  {f['dur'] / 60:.1f} min", font=F, fill=(255, 220, 80))
    for k, (i, t) in enumerate(pg):
        x = 10 + (k % cols) * (W + 10); y = 40 + (k // cols) * (Hh + 92)
        p = f"{H}/sb/f_{t:.2f}.png"
        if os.path.exists(p): sh.paste(Image.open(p).convert("RGB").resize((W, Hh)), (x, y))
        t0 = starts[i]; j = order.index(i); t1 = c[j + 1][1] if j + 1 < len(c) else f["dur"]
        st, nt = notes.get(i, ("card", ""))
        d.text((x, y + Hh + 3), f"{i}  {int(t0 // 60)}:{t0 % 60:04.1f}  [{st}]", font=F, fill=(255, 255, 255))
        txt = ("\"" + said(t0, t1) + "\"  " if said(t0, t1) else "") + nt
        for n, ln in enumerate(textwrap.wrap(txt, 58)[:4]): d.text((x, y + Hh + 22 + n * 16), ln, font=f2, fill=(200, 200, 200))
    sh.save(f"{H}/../storyboard_v4_{pi + 1}.png")
print(len(pages), "paginas")
