"""face at yaw angles (near eye check): python tools/anim/face_angles.py <glb> <tag>  -> review/face_angles/<tag>_*.png + sheet
python tools/anim/face_angles.py --sheet before_tag after_tag out.png   (before | after per expression)"""
import sys, os, json, subprocess
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
EXPR = [("open", "neutral"), ("happy+blush", "smile+blush"), ("shy+blush", "softSmile+blush"), ("tease", "smirk")]
ANG = [0, 20, 35, 45, 55, 70, 90, -35, -55, -90]
RAW = "review/face_angles"; os.makedirs(RAW, exist_ok=True)
fnt = ImageFont.truetype("arial.ttf", 15)
if sys.argv[1] == "--sheet":
    ta, tb, out = sys.argv[2:5]; w, h = 200, 200
    G = Image.new("RGB", (len(ANG) * w + 120, len(EXPR) * 2 * h + 30), (30, 30, 30)); d = ImageDraw.Draw(G)
    for j, a in enumerate(ANG): d.text((120 + j * w + 70, 6), f"yaw {a}", fill=(255, 255, 255), font=fnt)
    for i, (e, m) in enumerate(EXPR):
        for k, t in enumerate((ta, tb)):
            y = 30 + (2 * i + k) * h
            d.text((6, y + 80), f"{e}\n{m}\n{'BEFORE' if k == 0 else 'AFTER'}", fill=(255, 220, 90) if k else (200, 200, 200), font=fnt)
            for j, a in enumerate(ANG):
                im = Image.open(f"{RAW}/{t}_{i}_{a}.png").convert("RGB").resize((w, h)); G.paste(im, (120 + j * w, y))
    G.save(out); print(out, G.size); sys.exit()
glb, tag = sys.argv[1], sys.argv[2]
jobs = [dict(name=f"{tag}_{i}_{a}", eyes=e, mouth=m, view=a, d=3.0, dy=-0.15, w=320, h=320, glb=glb) for i, (e, m) in enumerate(EXPR) for a in ANG]
json.dump(jobs, open(f"{RAW}/_jobs.json", "w"))
subprocess.run(["node", "tools/face_review.mjs", f"{RAW}/_jobs.json", RAW], check=True, capture_output=True)
print("rendered", len(jobs))
