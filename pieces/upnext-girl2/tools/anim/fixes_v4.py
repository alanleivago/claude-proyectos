"""review/fixes_v4.png: before (v3) | after (v4) close-ups for each numbered fix of the v3 round.
needs out/_v2_bare.glb (copy of the v2 GLB) and review/face_angles/final_* (v2) + v3_* (face_angles.py ... v3)"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
T = 250
ITEMS = [
    ("1 LEGS: curvy taper - full thighs narrowing to the knee and into a slimmer boot cuff",
     ["his_idle:0:Calf.L:15:0:1.2", "his_idle:0:Calf.L:15:40:1.2", "idle_sway:40:Calf.L:15:-30:1.2", "walk:18:Calf.L:15:0:1.2"]),
    ("2 HANDS: finger lines removed, back to the original hand texture (bracelets kept)",
     ["his_idle:0:Hand.R:3.0:0:0.3", "his_idle:0:Hand.L:3.0:20:0.3", "his_idle:0:Hand.L:3.0:90:0.3", "talk_both:20:Hand.R:3.0:-40:0.8"]),
    ("3 BUST MOTION: softer spring with overshoot (side view, excited_bounce frames 0 / 5 / 10 / 15; see the video)",
     ["excited_bounce:0:Neck:5.5:75:-0.9", "excited_bounce:5:Neck:5.5:75:-0.9", "excited_bounce:10:Neck:5.5:75:-0.9", "excited_bounce:15:Neck:5.5:75:-0.9"]),
    ("4 STRIPES: no press-in under the fist (fist rests 3.5 cm out), rib stripes continuous",
     ["his_idle:0:Bust.R:3.4:0:0.2", "his_idle:0:Bust.R:3.4:-35:0.2", "idle_shy:60:Bust.R:3.4:20:0.2", "walk_shy:10:Bust.R:3.4:-20:0.2"]),
    ("5 NECK: one continuous skinned neck into the head, complete turtleneck all around",
     ["his_idle:0:Neck:4:0:-0.5", "his_idle:0:Neck:6:-90:-0.3", "his_idle:0:Neck:6:135:-0.3", "his_idle:0:Neck:6:20:-2.5"]),
]
fnt = ImageFont.truetype("arial.ttf", 17); fb = ImageFont.truetype("arialbd.ttf", 19)
rows = []
for label, specs in ITEMS:
    tiles = {}
    for tag, glb in (("v2", "_v3_bare.glb"), ("v3", "girl2_curvy_bare.glb")):
        subprocess.run(["node", "tools/anim/render2.mjs", "focus", ";".join(specs), "0", "front", str(T), str(T)], env=dict(os.environ, GLB=glb), check=True, capture_output=True)
        tiles[tag] = [Image.open(f"review/engine2/focus_{i}.png").convert("RGB") for i in range(len(specs))]
    rows.append((label, tiles["v2"], tiles["v3"]))
NMAX = max(len(r[1]) for r in rows); W = 2 * NMAX * T + 30; H = sum(T + 34 for _ in rows) + 40
S = Image.new("RGB", (W, H), (34, 34, 34)); d = ImageDraw.Draw(S)
d.text((10, 8), "BEFORE (v3)", fill=(200, 200, 200), font=fb); d.text((NMAX * T + 30 + 10, 8), "AFTER (v4)", fill=(255, 220, 90), font=fb)
y = 40
for label, a, b in rows:
    d.text((8, y + 6), label, fill=(255, 255, 255), font=fnt); y += 30
    for i, im in enumerate(a): S.paste(im, (i * T, y))
    for i, im in enumerate(b): S.paste(im, (NMAX * T + 30 + i * T, y))
    y += T + 4
d.line([(NMAX * T + 15, 30), (NMAX * T + 15, H)], fill=(255, 255, 255), width=3)
S.save("review/fixes_v4.png"); print("review/fixes_v4.png", S.size)
