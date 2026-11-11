"""venv: before/after of the 3D-text edge pixelation (final_post.pixelate_text) on the shots with big yellow texts.
before = the exported frame (renders/post, old fixed 10 px blocks); after = the raw frame through the new pixelate_text +
the same PS1 dither + caption. Shown at phone size (360x640) plus a 2x crop of the text.
python tools/rev_text.py  -> review/board/rev_text04.jpg"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); sys.path.insert(0, H)
import final_post as FP  # noqa: E402
from photoprop import BAYER4  # noqa: E402
B = json.load(open(os.path.join(H, "review", "beats.json")))
SHOTS = ["03", "06", "07", "08", "09", "10", "11a"]
CROP = {"03": (180, 160, 900, 760), "06": (100, 80, 820, 560), "07": (60, 80, 780, 560), "08": (60, 60, 780, 540),
        "09": (100, 60, 820, 540), "10": (380, 60, 1080, 540), "11a": (220, 120, 940, 760)}


def post_one(f):
    im = FP.raw(f); W, Hh = im.size
    a = np.asarray(im.resize((W // 4, Hh // 4), Image.BOX), float); h, w, _ = a.shape
    d = np.tile(BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
    out = Image.fromarray(np.clip(np.round(a / FP.STEP + d) * FP.STEP, 0, 255).astype(np.uint8)).resize((W, Hh), Image.NEAREST)
    out = FP.text_over(out, f)
    FP.caption(out, FP.BD.caption_at(f / FP.FPS)); return out


cw, ch = 360, 640; zw = 360
sheet = Image.new("RGB", (len(SHOTS) * (cw + zw) + 10, 2 * ch + 70), (20, 20, 20)); d = ImageDraw.Draw(sheet)
d.text((8, 4), "zaw-dog-04 3D text edges: top = BEFORE (exported, 10 px blocks), bottom = AFTER (cap/11, 4-8 px, counters kept, text laid back over the dither)", fill="yellow")
for k, s in enumerate(SHOTS):
    f = B[s][1] - 6
    old = Image.open(os.path.join(H, "renders", "post", f"{f:05d}.png")).convert("RGB"); new = post_one(f)
    x = 5 + k * (cw + zw)
    for r, im in enumerate((old, new)):
        y = 30 + r * (ch + 20)
        sheet.paste(im.resize((cw, ch), Image.BOX), (x, y))
        c = im.crop(CROP[s]); sheet.paste(c.resize((zw, int(zw * c.height / c.width)), Image.NEAREST), (x + cw, y))
        d.text((x + 4, y + 2), f"{s} f{f} {'before' if r == 0 else 'after'}", fill="yellow")
p = os.path.join(H, "review", "board", "rev_text04.jpg"); sheet.save(p, quality=90); print(p)
