"""review/sheet_<tag>.png: turnaround, the author's poses, 8 key expressions, each next to the video frames."""
import sys
from PIL import Image, ImageDraw
R = "/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/ref/"
t = sys.argv[1]; out = sys.argv[2]
BG = (24, 26, 32)
W = 1800
sheet = Image.new("RGB", (W, 2600), BG); d = ImageDraw.Draw(sheet)
def lab(x, y, s): d.text((x, y), s, fill=(230, 230, 230))
def fit(im, w, h, nearest=True):
    im = im.convert("RGB"); im.thumbnail((w, h), Image.NEAREST if nearest else Image.LANCZOS); return im
y = 10; lab(10, y, "TURNAROUND  (top: ours, unlit flat / bottom: MercurialForge video 12:14-12:44)"); y += 20
views = [("front", "t759.png", (760, 60, 1200, 1060)), ("3q_l", "t743.png", (680, 40, 1220, 1040)),
         ("side_l", "t736.png", (720, 40, 1220, 1040)), ("back", "t737.png", (720, 40, 1220, 1040))]
cw = W // 4
for i, (v, ref, box) in enumerate(views):
    a = fit(Image.open(f"review/{t}_{v}.png"), cw - 10, 420); sheet.paste(a, (i * cw + (cw - a.width) // 2, y))
    b = fit(Image.open(R + ref).crop(box), cw - 10, 420, False); sheet.paste(b, (i * cw + (cw - b.width) // 2, y + 430))
    lab(i * cw + 8, y + 4, v)
y += 870; lab(10, y, "HIS FINAL POSES (idle / hand on hip / running punch): ours front + 3/4, his frame"); y += 20
poses = [("tut_idle", "t759.png", (760, 60, 1200, 1060)), ("tut_hip", "t743.png", (680, 40, 1220, 1040)),
         ("tut_run", "t785.png", (760, 100, 1180, 1000))]
pw = W // 3
for i, (n, ref, box) in enumerate(poses):
    for k, v in enumerate(("front", "3q_l")):
        a = fit(Image.open(f"review/{t}_{n}_{v}.png"), pw // 3 - 6, 400); sheet.paste(a, (i * pw + k * (pw // 3), y))
    b = fit(Image.open(R + ref).crop(box), pw // 3 - 6, 400, False); sheet.paste(b, (i * pw + 2 * (pw // 3), y))
    lab(i * pw + 8, y + 4, n)
y += 420; lab(10, y, "8 KEY EXPRESSIONS (16-cell eye/mouth atlases, zero_fem names)  +  his Ashley_Face cells 00-04"); y += 20
names = ["neutral", "happy", "talk", "surprised", "angry", "sad", "blink", "wink"]
ew = W // 8
for i, n in enumerate(names):
    a = fit(Image.open(f"review/{t}_expr_{n}.png"), ew - 6, ew - 6); sheet.paste(a, (i * ew + 3, y)); lab(i * ew + 6, y + 4, n)
y += ew + 6
f5 = Image.open(R + "t640.png").crop((249, 384, 1659, 690)); f5 = fit(f5, W - 20, 300, False); sheet.paste(f5, (10, y))
y += f5.height + 10
atl = Image.open("review/face_atlas.png"); atl = fit(atl, W - 20, 260); sheet.paste(atl, (10, y)); y += atl.height + 10
import os
ovp = f"review/overlay_{t}.png"
if os.path.exists(ovp):
    lab(10, y, "OVERLAY at his camera (front / 3/4 / side): ours | his | ours 50% over his"); y += 20
    ov = Image.open(ovp); ov.thumbnail((W - 20, 2600)); sheet2 = Image.new("RGB", (W, y + ov.height + 10), BG)
    sheet2.paste(sheet.crop((0, 0, W, y)), (0, 0)); sheet2.paste(ov, (10, y)); sheet = sheet2; y += ov.height + 10
sheet = sheet.crop((0, 0, W, y)); sheet.save(out); print(out, sheet.size)
