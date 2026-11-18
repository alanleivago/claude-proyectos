"""review/hands_v8.png: ref (UpNext man) | v7 | v8 hands: open hand, fist, and 3 poses (fist at the chest, hands on hips, hair tuck)"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
T = 240
ROWS = [("open hand (left)", ["his_idle:0:Hand.L:2.4:20:0.3", "his_idle:0:Hand.L:2.4:110:0.3", "talk_both:20:Hand.L:2.6:40:0.8"]),
        ("fist (right)", ["his_idle:0:Hand.R:2.4:-50:0.3", "his_idle:0:Hand.R:2.4:40:0.3", "point:30:Hand.R:2.6:-40:0.3"]),
        ("poses: fist at the chest / hands on hips / hair tuck", ["his_idle:0:Chest:7:20:0", "hands_on_hips:30:Chest:8:0:-0.3", "hair_tuck:22:Hand.L:4.5:50:0"])]
REFS = [["crop_relaxed.png", "crop_hanging.png", "crop_on_knees_2.png"], ["crop_on_knees.png", "crop_resting_on_thighs.png", "crop_holding_notepad_close-up.png"], ["crop_on_knees.png", "crop_holding_3.png", "crop_relaxed.png"]]
fnt = ImageFont.truetype("arial.ttf", 18); fb = ImageFont.truetype("arialbd.ttf", 20)
W = 3 * 3 * T + 60; H = 40 + len(ROWS) * (T + 34)
S = Image.new("RGB", (W, H), (34, 34, 34)); d = ImageDraw.Draw(S)
d.text((10, 8), "REFERENCE: the man in the UpNext reels", fill=(200, 200, 200), font=fb); d.text((3 * T + 40, 8), "v7", fill=(200, 200, 200), font=fb); d.text((6 * T + 70, 8), "v8 (now)", fill=(255, 220, 90), font=fb)
y = 40
for label, specs in ROWS:
    d.text((8, y + 6), label, fill=(255, 255, 255), font=fnt); y += 30
    ri = [r[0] for r in ROWS].index(label); refs = REFS[ri]
    for i, rf in enumerate(refs):
        im = Image.open("review/hands_ref/" + rf).convert("RGB"); im.thumbnail((T, T)); tile = Image.new("RGB", (T, T), (30, 30, 30)); tile.paste(im, ((T - im.width) // 2, (T - im.height) // 2)); S.paste(tile, (i * T, y))
    for k, glb in enumerate(("_v7_tights.glb", "girl2_curvy_tights.glb"), start=1):
        subprocess.run(["node", "tools/anim/render2.mjs", "focus", ";".join(specs), "0", "front", str(T), str(T)], env=dict(os.environ, GLB=glb), check=True, capture_output=True)
        for i in range(len(specs)): S.paste(Image.open(f"review/engine2/focus_{i}.png").convert("RGB"), (k * (3 * T + 30) + i * T, y))
    y += T + 4
d.line([(3 * T + 15, 30), (3 * T + 15, H)], fill=(255, 255, 255), width=3); d.line([(6 * T + 45, 30), (6 * T + 45, H)], fill=(255, 255, 255), width=3)
S.save("review/hands_v8.png"); print("review/hands_v8.png", S.size)
