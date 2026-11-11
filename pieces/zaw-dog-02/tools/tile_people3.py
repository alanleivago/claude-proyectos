"""venv: review/people3 -> one sheet per person (body views row + head/hands row).  python tools/tile_people3.py name [...]"""
import os, sys
from PIL import Image, ImageDraw
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); D = os.path.join(H, "review", "people3")
for n in sys.argv[1:]:
    top = [f"{n}_{v}.png" for v in ("front", "f34", "side", "back", "b34")]
    bot = [f"{n}_{v}.png" for v in ("headfront", "head34", "headside", "hands_f34", "hands_side", "hands_top", "palm")]
    sh = Image.new("RGB", (5 * 288, 512 + 206), (30, 30, 30))
    for i, f in enumerate(top):
        sh.paste(Image.open(os.path.join(D, f)).convert("RGB").resize((288, 512)), (i * 288, 0))
    for i, f in enumerate(bot):
        sh.paste(Image.open(os.path.join(D, f)).convert("RGB").resize((200, 200)), (i * 205, 515))
    ImageDraw.Draw(sh).text((6, 4), n, fill="yellow")
    sh.save(os.path.join(H, "review", f"people3_{n}.jpg"), quality=88); print(os.path.join(H, "review", f"people3_{n}.jpg"))
