"""review/fixes_v3.png: before (v2) | after (v3) close-ups for each numbered fix of the v3 round.
needs out/_v2_bare.glb (copy of the v2 GLB) and review/face_angles/final_* (v2) + v3_* (face_angles.py ... v3)"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
T = 250
ITEMS = [
    ("1 ARMS: one continuous arm, no elbow / wrist gaps, attached at the shoulder when raised, no dark patch under the elbow",
     ["talk_cute:0:Forearm.R:4:-60:0.5", "think:30:Forearm.L:4:120:0", "cheer:20:UpperArm.L:4.5:60:0", "raise_object:30:UpperArm.R:4.5:-120:0"]),
    ("2 WRISTS: the stray lines are now two low-poly bracelets per wrist", ["his_idle:0:Hand.L:3.4:20:0.3", "think:30:Hand.R:3.4:-30:0.5"]),
    ("3 HANDS: faint finger lines, old bracelet smears cleaned off the fist", ["his_idle:0:Hand.R:3.0:0:0.3", "his_idle:0:Hand.L:3.0:90:0.3"]),
    ("4 BUST: right side rebuilt by symmetry (shape + rib stripes), subtle spring bones", ["idle_sway:0:Chest:5:0:0", "idle_sway:0:Chest:5:40:0", "talk_both:20:Chest:5:-40:0"]),
    ("5 FEET: real boot feet (toe box, taper, sole band, heel block, cuff stripes)", ["his_idle:0:Foot.L:4.5:30:0.8", "walk:10:Foot.R:4.5:90:0.5", "idle_sway:40:Foot.L:4.5:-120:0.8"]),
    ("6 SITS: the skirt lies on the thighs (no riding up); sit_floor redone, legs and boots readable",
     ["sit_chair:0:Pelvis:9:90:0.5", "sit_slumped:0:Pelvis:9:60:0.8", "sit_down:30:Pelvis:9:70:0.5", "sit_floor:0:Pelvis:19:35:4"]),
    ("7 LIE_SIDE: top leg ahead of the bottom one (no boot through the leg), arms re-placed (no clipping)",
     ["lie_side:30:Pelvis:12:0:5", "lie_side:30:Pelvis:12:40:4"]),
]
fnt = ImageFont.truetype("arial.ttf", 17); fb = ImageFont.truetype("arialbd.ttf", 19)
rows = []
for label, specs in ITEMS:
    tiles = {}
    for tag, glb in (("v2", "_v2_bare.glb"), ("v3", "girl2_curvy_bare.glb")):
        subprocess.run(["node", "tools/anim/render2.mjs", "focus", ";".join(specs), "0", "front", str(T), str(T)], env=dict(os.environ, GLB=glb), check=True, capture_output=True)
        tiles[tag] = [Image.open(f"review/engine2/focus_{i}.png").convert("RGB") for i in range(len(specs))]
    rows.append((label, tiles["v2"], tiles["v3"]))
# 8: face (expression 2 = shy+blush at 45; expression 0 at -55 / -90: hair hole)
fa = lambda t, i, a: Image.open(f"review/face_angles/{t}_{i}_{a}.png").convert("RGB").resize((T, T))
rows.append(("8 FACE: hair hole at -55 / -90 closed; near-side blush at 35-45 no longer a band",
             [fa("final", 2, 35), fa("final", 2, 45), fa("final", 0, -55), fa("final", 0, -90)],
             [fa("v3", 2, 35), fa("v3", 2, 45), fa("v3", 0, -55), fa("v3", 0, -90)]))
NMAX = max(len(r[1]) for r in rows); W = 2 * NMAX * T + 30; H = sum(T + 34 for _ in rows) + 40
S = Image.new("RGB", (W, H), (34, 34, 34)); d = ImageDraw.Draw(S)
d.text((10, 8), "BEFORE (v2)", fill=(200, 200, 200), font=fb); d.text((NMAX * T + 30 + 10, 8), "AFTER (v3)", fill=(255, 220, 90), font=fb)
y = 40
for label, a, b in rows:
    d.text((8, y + 6), label, fill=(255, 255, 255), font=fnt); y += 30
    for i, im in enumerate(a): S.paste(im, (i * T, y))
    for i, im in enumerate(b): S.paste(im, (NMAX * T + 30 + i * T, y))
    y += T + 4
d.line([(NMAX * T + 15, 30), (NMAX * T + 15, H)], fill=(255, 255, 255), width=3)
S.save("review/fixes_v3.png"); print("review/fixes_v3.png", S.size)
