"""review/fixes_v5.png: before (v4) | after (v5) close-ups for each numbered fix of the v3 round.
needs out/_v2_bare.glb (copy of the v2 GLB) and review/face_angles/final_* (v2) + v3_* (face_angles.py ... v3)"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
T = 250
ITEMS = [
    ("1 SHOULDERS: arm top no longer rises above the joint; slimmer, lower turtleneck (see the overlay vs his frames below)",
     ["his_idle:0:Neck:7:0:-0.8", "his_idle:0:Neck:7:40:-0.8", "his_idle:0:Neck:7:90:-0.8", "his_idle:0:Neck:7:180:-0.8"]),
    ("2 SKIRT: wider to the sides (+13 %), the thighs stay inside",
     ["idle_sway:40:Pelvis:8:0:-0.3", "hand_on_hip:40:Pelvis:8:0:-0.3", "walk:10:Pelvis:8:0:-0.3", "excited_bounce:5:Pelvis:8:-20:-0.3"]),
    ("3 ARMS: thinner (upper -12 %, forearm -8 %), one continuous tube, clean elbow, soft shoulder join",
     ["his_idle:0:Forearm.L:4.5:30:0", "idle_sway:40:Forearm.R:4.5:-90:0", "talk_both:20:Forearm.L:4.5:60:0", "cheer:20:UpperArm.L:5:100:0"]),
    ("4 WALK: hip-led, upright counter-rotating torso, narrow steps (frames 0 / 9 / 18 / 27; see walk_v5_vs_ref.mp4)",
     ["walk:0:Pelvis:16:0:1", "walk:9:Pelvis:16:0:1", "walk:18:Pelvis:16:0:1", "walk:27:Pelvis:16:0:1"]),
    ("5 SITS: boot cuff dips at the knee + hinge bone; soft knee weights; sit_floor knees apart (no boot through the leg)",
     ["sit_chair:0:Calf.L:5:90:0.5", "sit_slumped:0:Calf.R:5:-90:0.5", "kneel:0:Calf.R:5:-150:1", "sit_floor:0:Pelvis:19:35:4"]),
]
fnt = ImageFont.truetype("arial.ttf", 17); fb = ImageFont.truetype("arialbd.ttf", 19)
rows = []
for label, specs in ITEMS:
    tiles = {}
    for tag, glb in (("v2", "_v4_bare.glb"), ("v3", "girl2_curvy_bare.glb")):
        subprocess.run(["node", "tools/anim/render2.mjs", "focus", ";".join(specs), "0", "front", str(T), str(T)], env=dict(os.environ, GLB=glb), check=True, capture_output=True)
        tiles[tag] = [Image.open(f"review/engine2/focus_{i}.png").convert("RGB") for i in range(len(specs))]
    rows.append((label, tiles["v2"], tiles["v3"]))
NMAX = max(len(r[1]) for r in rows); W = 2 * NMAX * T + 30; H = sum(T + 34 for _ in rows) + 40
S = Image.new("RGB", (W, H), (34, 34, 34)); d = ImageDraw.Draw(S)
d.text((10, 8), "BEFORE (v4)", fill=(200, 200, 200), font=fb); d.text((NMAX * T + 30 + 10, 8), "AFTER (v5)", fill=(255, 220, 90), font=fb)
y = 40
for label, a, b in rows:
    d.text((8, y + 6), label, fill=(255, 255, 255), font=fnt); y += 30
    for i, im in enumerate(a): S.paste(im, (i * T, y))
    for i, im in enumerate(b): S.paste(im, (NMAX * T + 30 + i * T, y))
    y += T + 4
d.line([(NMAX * T + 15, 30), (NMAX * T + 15, H)], fill=(255, 255, 255), width=3)
ov = Image.open("review/his_overlay_v5.png").convert("RGB"); k = S.width / ov.width; ov = ov.resize((S.width, int(ov.height * k)))
H2 = Image.new("RGB", (S.width, S.height + ov.height + 40), (34, 34, 34)); H2.paste(S, (0, 0)); H2.paste(ov, (0, S.height + 40))
ImageDraw.Draw(H2).text((8, S.height + 10), "SHOULDER OVERLAY (his_idle through his calibrated camera): his frame | v4 | v5 | edges (red = his, blue = v5)", fill=(255, 255, 255), font=fnt)
H2.save("review/fixes_v5.png"); print("review/fixes_v5.png", H2.size)
