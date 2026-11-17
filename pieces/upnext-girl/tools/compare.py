"""Side-by-side: our renders (row 1) vs reference frames (row 2). python tools/compare.py <prefix> <out>"""
import sys
from PIL import Image
R = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/ref/"
pre, out = sys.argv[1], sys.argv[2]
pairs = [("front", "t759.png", (780, 60, 1180, 1060)), ("3q_l", "t743.png", (700, 40, 1200, 1040)),
         ("side_l", "t736.png", (720, 40, 1220, 1040)), ("back", "t737.png", (720, 40, 1220, 1040))]
W, Hh = 300, 480
sheet = Image.new("RGB", (W * len(pairs), Hh * 2), (20, 20, 24))
for i, (v, ref, box) in enumerate(pairs):
    a = Image.open(f"{pre}_{v}.png").convert("RGB"); a.thumbnail((W, Hh), Image.NEAREST)
    sheet.paste(a, (i * W + (W - a.width) // 2, 0))
    b = Image.open(R + ref).convert("RGB").crop(box); b.thumbnail((W, Hh), Image.LANCZOS)
    sheet.paste(b, (i * W + (W - b.width) // 2, Hh))
sheet.save(out)
