"""Engine renders of every face cell + flirty combos + a side-by-side with her real f001 face.
python tools/face_review_sheets.py [glb]  -> review/face_v1.png, review/face_v1_combo.png, review/face_v1_vs_f001.png
(renders through tools/face_review.html = engine materials + engine setFace; raw frames in review/face_v1/)"""
import sys, os, json, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont
GLB = sys.argv[1] if len(sys.argv) > 1 else "girl2_curvy_bare.glb"
M = json.load(open("out/face_tracks.json"))["_meta"]
EY, MO = M["face_eyes"][:32], M["face_mouth"][:32]
RAW = "review/face_v1"; os.makedirs(RAW, exist_ok=True)
VW, VH, D, DY = 300, 280, 4.2, -0.2
jobs = []
def J(name, eyes, mouth, view, d=D, w=VW, h=VH): jobs.append(dict(name=name, eyes=eyes, mouth=mouth, view=view, d=d, dy=DY, w=w, h=h, glb=GLB))
tiles = []                                           # (label, [names])
for i, e in enumerate(EY):
    J(f"e{i:02d}_f", e, "neutral", 0); J(f"e{i:02d}_q", e, "neutral", 35); tiles.append((f"eyes {i:02d}  {e}", [f"e{i:02d}_f", f"e{i:02d}_q"]))
for i, m in enumerate(MO):
    J(f"m{i:02d}_f", "open", m, 0); J(f"m{i:02d}_q", "open", m, 35); tiles.append((f"mouth {i:02d}  {m}", [f"m{i:02d}_f", f"m{i:02d}_q"]))
for i, (e, m) in enumerate(zip(EY, MO)):
    J(f"b{i:02d}_f", e + "+blush", m + "+blush", 0); J(f"b{i:02d}_q", e + "+blush", m + "+blush", 35)
    tiles.append((f"{32 + i}  {e}+blush / {m}+blush", [f"b{i:02d}_f", f"b{i:02d}_q"]))
COMBOS = [("bedroom eyes + parted lips", "bedroom", "parted"), ("bedroom side-glance + smirk", "bedroomSide", "smirk"),
          ("wink + kiss", "winkR", "kiss"), ("wink + blown kiss", "winkL", "kissBlow"),
          ("shy look-away + blush", "shy+blush", "softSmile+blush"), ("lip bite + blush", "bedroom+blush", "lipBite+blush"),
          ("up through the lashes + pout", "lookUp", "pout"), ("raised-brow tease + smirk", "tease", "smirk"),
          ("flirty glance + soft smile", "glance", "softSmile"), ("dreamy + blush", "dreamy+blush", "parted+blush"),
          ("closed-eye kiss", "relaxed", "kiss"), ("giggle + blush", "happy+blush", "laugh+blush"),
          ("smiling eyes + grin", "smiling", "grin"), ("annoyed eye-roll + pout", "eyeRoll", "pout"),
          ("sulky pout", "sulk", "sadPout"), ("surprised oh", "surprised", "oh")]
CV = [(0, "front"), (35, "3/4"), (-35, "3/4 other side"), (55, "near-side")]
for i, (lab, e, m) in enumerate(COMBOS):
    for v, vn in CV: J(f"c{i:02d}_{v}", e, m, v, d=3.9, w=360, h=340)
SBS = [("open", "neutral"), ("bedroom", "parted"), ("winkR", "softSmile"), ("shy+blush", "softSmile+blush"), ("lookUp", "pout"), ("happy", "laugh")]
for i, (e, m) in enumerate(SBS): jobs.append(dict(name=f"h{i}", kind="his", eyes=e, mouth=m, w=1080, h=1920, glb=GLB))
jp = os.path.join(RAW, "jobs.json"); json.dump(jobs, open(jp, "w"))
r = subprocess.run(["node", "tools/face_review.mjs", jp, RAW], capture_output=True, text=True)
print(r.stdout[-400:], r.stderr[-800:])
if "[page" in r.stdout: print("PAGE ERRORS ABOVE")

try: F14 = ImageFont.truetype("arialbd.ttf", 15); F22 = ImageFont.truetype("arialbd.ttf", 22)
except OSError: F14 = F22 = ImageFont.load_default()
BG = (30, 30, 34)


def sheet(tiles, per_row, path, title, lab_h=24):
    ims = [[Image.open(os.path.join(RAW, n + ".png")).convert("RGB") for n in ns] for _, ns in tiles]
    tw = sum(i.width for i in ims[0]); th = max(i.height for i in ims[0]) + lab_h
    rows = (len(tiles) + per_row - 1) // per_row
    S = Image.new("RGB", (per_row * (tw + 6) + 6, rows * (th + 6) + 50), BG); d = ImageDraw.Draw(S)
    d.text((10, 12), title, fill=(255, 255, 255), font=F22)
    for k, ((lab, _), row) in enumerate(zip(tiles, ims)):
        x0 = 6 + (k % per_row) * (tw + 6); y0 = 50 + (k // per_row) * (th + 6); x = x0
        d.text((x0 + 4, y0 + 4), lab, fill=(255, 255, 255), font=F14)
        for im in row: S.paste(im, (x, y0 + lab_h)); x += im.width
    S.save(path); print("wrote", path, S.size)


sheet(tiles, 6, "review/face_v1.png", f"upnext-girl2 face cells in the engine ({GLB}): each tile = front | 3/4 (35 deg). 32 eyes (mouth neutral), 32 mouths (eyes open), 32 blush pairs")
sheet([(f"{lab}   [{e} / {m}]", [f"c{i:02d}_{v}" for v, _ in CV]) for i, (lab, e, m) in enumerate(COMBOS)], 2, "review/face_v1_combo.png",
      "flirty combos in the engine: front | 3/4 | 3/4 other side | near-side (55 deg)")
# side by side with her real f001 (his calibrated camera, same crop)
crop = (380, 330, 700, 600); real = Image.open("ref/frames/f001.png").convert("RGB").crop(crop)
cells = [real] + [Image.open(os.path.join(RAW, f"h{i}.png")).convert("RGB").crop(crop) for i in range(len(SBS))]
labs = ["HER real f001"] + [f"engine: {e} / {m}" for e, m in SBS]
W_, H_ = cells[0].width * 2, cells[0].height * 2
S = Image.new("RGB", (4 * (W_ + 6) + 6, 2 * (H_ + 30) + 10), BG); d = ImageDraw.Draw(S)
for k, (im, lab) in enumerate(zip(cells, labs)):
    x = 6 + (k % 4) * (W_ + 6); y = 6 + (k // 4) * (H_ + 30)
    d.text((x + 4, y + 4), lab, fill=(255, 255, 255), font=F14); S.paste(im.resize((W_, H_), Image.NEAREST), (x, y + 26))
S.save("review/face_v1_vs_f001.png"); print("wrote review/face_v1_vs_f001.png", S.size)
