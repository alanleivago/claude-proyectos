"""review/legs_check_v2.png: knee / thigh close-ups, v1 bare (old legs) | v2 bare | v2 tights, 3q + front
python tools/anim/legs_check.py   (needs out/_v1_bare.glb = the v1 GLB, copied from ref/backup_v0 for the comparison)"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
SHOTS = [("his_idle", 0, -4.5), ("idle_sway", 40, -4.5), ("walk", 6, -4.5), ("walk", 22, -4.5), ("hands_on_hips", 30, -4.5),
         ("embarrassed", 20, -4.5), ("sit_chair", 0, -5.6), ("crouch_pickup", 20, -6.6), ("kneel", 0, -7.4)]
COLS = [("girl2_curvy_bare.glb", "v2 bare"), ("girl2_curvy_tights.glb", "v2 tights")]
VIEWS = ["3q", "front"]; cw, ch = 230, 260
fnt = ImageFont.truetype("arial.ttf", 15)
G = Image.new("RGB", (len(COLS) * len(VIEWS) * cw, 26 + len(SHOTS) * ch), (40, 40, 40)); d = ImageDraw.Draw(G)
for ci, (glb, lab) in enumerate(COLS):
    if not os.path.exists("out/" + glb): continue
    for v in VIEWS: d.text(((ci * len(VIEWS) + VIEWS.index(v)) * cw + 6, 5), f"{lab}  {v}", fill=(255, 220, 90) if "v2" in lab else (200, 200, 200), font=fnt)
    for r, (c, f, h) in enumerate(SHOTS):
        env = dict(os.environ, GLB=glb, CAMR="12", CAMH=str(h), NOCAM="1")
        subprocess.run(["node", "tools/anim/render2.mjs", "shots", f"{c}:{f}", "0", ",".join(VIEWS), "300", "340"], env=env, check=True, capture_output=True)
        for vi, v in enumerate(VIEWS):
            im = Image.open(f"review/engine2/shot_{c}_{f}_{v}.png").convert("RGB").crop((35, 40, 265, 300))
            G.paste(im, ((ci * len(VIEWS) + vi) * cw, 26 + r * ch))
            if ci == 0 and vi == 0: d.text((4, 26 + r * ch + 3), f"{c} f{f}", fill=(0, 0, 0), font=fnt)
for ci in range(1, len(COLS)): d.line([(ci * len(VIEWS) * cw, 0), (ci * len(VIEWS) * cw, G.height)], fill=(255, 255, 255), width=2)
# v1 reference strip (v1 GLBs were overwritten; close-ups rendered from them at the start of the v2 work)
V1 = os.environ.get("V1LEGS")
if V1 and os.path.exists(V1):
    a = Image.open(V1).convert("RGB"); b = Image.open(V1.replace("bare", "tights")).convert("RGB") if os.path.exists(V1.replace("bare", "tights")) else None
    k = G.width / (a.width * (2 if b else 1)); a = a.resize((int(a.width * k), int(a.height * k)))
    strip = Image.new("RGB", (G.width, a.height + 30), (40, 40, 40)); strip.paste(a, (0, 30))
    if b: b = b.resize(a.size); strip.paste(b, (a.width, 30))
    ImageDraw.Draw(strip).text((6, 6), "BEFORE (v1): bare | tights   rows: his_idle, idle_sway, walk, hands_on_hips   cols: 3q, front, side", fill=(200, 200, 200), font=fnt)
    H = Image.new("RGB", (G.width, G.height + strip.height), (40, 40, 40)); H.paste(G, (0, 0)); H.paste(strip, (0, G.height)); G = H
G.save("review/legs_check_v2.png"); print("review/legs_check_v2.png", G.size)
