"""review/hands_v9.png: original (v5) | v9 hands: open hand, fist, and 3 poses (fist at the chest, hands on hips, hair tuck)"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
T = 300
ROWS = [("open hand (left)", ["his_idle:0:Hand.L:2.4:20:0.3", "his_idle:0:Hand.L:2.4:110:0.3", "talk_both:20:Hand.L:2.6:40:0.8"]),
        ("fist (right)", ["his_idle:0:Hand.R:2.4:-50:0.3", "his_idle:0:Hand.R:2.4:40:0.3", "point:30:Hand.R:2.6:-40:0.3"]),
        ("poses: fist at the chest / hands on hips / hair tuck", ["his_idle:0:Chest:7:20:0", "hands_on_hips:30:Chest:8:0:-0.3", "hair_tuck:22:Hand.L:4.5:50:0"])]
fnt = ImageFont.truetype("arial.ttf", 18); fb = ImageFont.truetype("arialbd.ttf", 20)
W = 2 * 3 * T + 30; H = 40 + len(ROWS) * (T + 34)
S = Image.new("RGB", (W, H), (34, 34, 34)); d = ImageDraw.Draw(S)
d.text((10, 8), "ORIGINAL hands (v5)", fill=(200, 200, 200), font=fb); d.text((3 * T + 40, 8), "v9: original hands, 13 % smaller, pixel finger lines", fill=(255, 220, 90), font=fb)
y = 40
for label, specs in ROWS:
    d.text((8, y + 6), label, fill=(255, 255, 255), font=fnt); y += 30
    for k, glb in enumerate(("_v5_tights.glb", "girl2_curvy_tights.glb")):
        subprocess.run(["node", "tools/anim/render2.mjs", "focus", ";".join(specs), "0", "front", str(T), str(T)], env=dict(os.environ, GLB=glb), check=True, capture_output=True)
        for i in range(len(specs)): S.paste(Image.open(f"review/engine2/focus_{i}.png").convert("RGB"), (k * (3 * T + 30) + i * T, y))
    y += T + 4
d.line([(3 * T + 15, 30), (3 * T + 15, H)], fill=(255, 255, 255), width=3)
S.save("review/hands_v9.png"); print("review/hands_v9.png", S.size)
