"""review/anim_refs.png: reference frame | our matching pose (engine render), for the key clips.
needs: node tools/anim/render2.mjs shots <clip:frame,...> 0 <view> 420 640  (done by this script via subprocess)"""
import subprocess, os, sys
from PIL import Image, ImageDraw, ImageFont
J = "/Users/alanleiva/claude-proyectos/fuentes/jongmin-design/remake/cuts/"
R = "/private/tmp/upnext-scratch/refs/"
PAIRS = [  # (ref image, label, clip, frame, view)
    (J + "DenXjPdN-UE/c025.jpg", "UpNext #1 listen, head down", "listen_head_down", 60, "3q"),
    (J + "DeDhBizhWi3/c018.jpg", "UpNext #3 glance + reply", "glance_reply", 40, "3q"),
    (J + "DeIZRr9MvU_/c023.jpg", "UpNext #4 walk away", "walk", 8, "back"),
    (J + "DenXjPdN-UE/c012.jpg", "UpNext #5 slumped on the edge", "sit_slumped", 30, "3q"),
    (J + "DeIZRr9MvU_/c001.jpg", "UpNext #6 hold object low", "hold_object", 30, "3q"),
    (J + "DeIZRr9MvU_/c017.jpg", "UpNext #7 lean / reach down", "lean_reach", 30, "side"),
    (J + "Dd5E78EgnK-/c008.jpg", "UpNext #8 deflate", "sad_slump", 40, "front"),
    (J + "DeqIHpYPZie/c002.jpg", "UpNext #9 phone", "phone_look", 20, "3q"),
    (J + "DeDhBizhWi3/c009.jpg", "UpNext #10 lie back", "lie_back", 30, "3q"),
    (J + "Dd5E78EgnK-/c001.jpg", "UpNext #11 power pose", "hands_on_hips", 40, "front"),
    (J + "DenXjPdN-UE/c001.jpg", "UpNext #12 hands on knees", "hands_on_knees", 10, "3q"),
    (J + "DenXjPdN-UE/c026.jpg", "UpNext #13 sheepish", "sheepish", 30, "front"),
    (J + "DeDhBizhWi3/c033.jpg", "UpNext #14 raise object", "raise_object", 30, "3q"),
    (J + "Dd-HI3yMHw7/c029.jpg", "UpNext #15 hug knees", "hug_knees", 30, "3q"),
    (R + "mml/hd_754.jpg", "MML tutorial: hand on hip", "hand_on_hip", 40, "front"),
    (R + "mml/hd_758.jpg", "MML tutorial: cute fists idle", "idle_cute", 0, "front"),
    (R + "sina/f_7699665848604052750_40.jpg", "sinaboto: cheer", "cheer", 25, "front"),
    (R + "sina/f_7697312481340820750_2.jpg", "sinaboto: kneel", "kneel", 30, "3q"),
    (R + "sina/f_7696200784064695565_69.jpg", "sinaboto: hip + drink", "drink", 32, "3q"),
]
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
for view in sorted({p[4] for p in PAIRS}):
    shots = ",".join(f"{c}:{f}" for _, _, c, f, v in PAIRS if v == view)
    subprocess.run(["node", "tools/anim/render2.mjs", "shots", shots, "0", view, "420", "640"], check=True, capture_output=True)
H = 420; cols = 3; cw = 2 * 300 + 10
try: fnt = ImageFont.truetype("arial.ttf", 18)
except Exception: fnt = ImageFont.load_default()
cells = []
for ref, lab, c, f, v in PAIRS:
    a = Image.open(ref).convert("RGB"); a.thumbnail((300, H)); b = Image.open(f"review/engine2/shot_{c}_{f}_{v}.png").convert("RGB")
    b = b.crop((40, 0, 380, 640)); b.thumbnail((300, H))
    cell = Image.new("RGB", (cw, H + 30), (24, 24, 24)); cell.paste(a, ((300 - a.width) // 2, 30)); cell.paste(b, (310 + (300 - b.width) // 2, 30))
    ImageDraw.Draw(cell).text((6, 5), f"{lab}  ->  {c}", fill=(255, 255, 255), font=fnt); cells.append(cell)
rows = (len(cells) + cols - 1) // cols
S = Image.new("RGB", (cols * cw + (cols - 1) * 8, rows * (H + 38)), (60, 60, 60))
for i, cell in enumerate(cells): S.paste(cell, ((i % cols) * (cw + 8), (i // cols) * (H + 38)))
OUT = sys.argv[1] if len(sys.argv) > 1 else "review/anim_refs_v2.png"
S.save(OUT); print(OUT, S.size)
