"""review/sheet_v8.png = (a) grey+wire ours vs his grey/wire frames at fitted cameras, (b) textured sheet (turnaround,
poses, close-ups, overlays at his cameras), (c) his face cells (atlas at 11:27) vs ours."""
import json, os, subprocess, numpy as np
from PIL import Image, ImageDraw
import wire_views as W
R = "F:/Claude Proyectos/pieces/upnext-girl/review/"; BG = (24, 26, 32); WID = 1800
subprocess.run(["python", "sheet_v8_tex.py"], check=True)
cams = json.load(open("wire_cams.json")); rows = []
LAB = {"front": "front rest, his viewport 11:29 (textured+wire)", "q3": "3/4 rest, user ortho 11:31", "side": "right ortho 11:30",
       "head": "head close-up 11:29", "grey": "grey model 7:57 (early state, before shawl)"}
for v in ("grey", "head", "front", "q3", "side"):
    if v not in cams: continue
    im, cov = W.render(v, cams[v]); hm = W.his_mask(v)
    om = cov.copy(); om[1060:] = False; iou = (om & hm).sum() / max(1, (om | hm).sum())
    ys, xs = np.nonzero(hm | om); box = (max(0, xs.min() - 30), max(0, ys.min() - 20), min(1920, xs.max() + 30), min(1080, ys.max() + 20))
    a = im.crop(box); b = Image.open(W.F + W.VIEWS[v][0]).convert("RGB").crop(box)
    s = 520 / a.height; a = a.resize((int(a.width * s), 520)); b = b.resize(a.size)
    row = Image.new("RGB", (WID, 548), BG); d = ImageDraw.Draw(row); row.paste(a, (10, 26)); row.paste(b, (20 + a.width, 26))
    d.text((10, 6), f"(a) GREY + WIRE  {LAB[v]}: ours (left) | his (right)   silhouette IoU {iou:.3f}", fill=(235, 235, 235)); rows.append(row)
# (c) face cells
his = Image.open(W.F + "wire2/w109.png").convert("RGB").crop((49, 760, 242, 953)).resize((540, 540), Image.BICUBIC)
ours = Image.open("F:/Claude Proyectos/pieces/upnext-girl/tex/ashley_face_256.png").convert("RGB").resize((540, 540), Image.NEAREST)
row = Image.new("RGB", (WID, 580), BG); d = ImageDraw.Draw(row); row.paste(his, (10, 30)); row.paste(ours, (570, 30))
d.text((10, 8), "(c) FACE CELLS: his Ashley_Face.png (UV editor 11:27) | ours (cells 0,1,3,4,5,6,9 sampled from his 400% Aseprite frames; 2,7,8,10 repainted)", fill=(235, 235, 235))
rows.append(row)
tex = Image.open(R + "sheet_v8_tex.png")
H = sum(r.height for r in rows) + tex.height; out = Image.new("RGB", (WID, H), BG); y = 0
for r in rows[:-1]: out.paste(r, (0, y)); y += r.height
out.paste(rows[-1], (0, y)); y += rows[-1].height
out.paste(tex, (0, y)); out.save(R + "sheet_v8.png"); os.remove(R + "sheet_v8_tex.png"); print(out.size)
