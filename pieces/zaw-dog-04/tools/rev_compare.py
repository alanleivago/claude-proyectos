"""venv: before (renders/post) | after (review/rev_frames, run through the same labels / night / stable dither / captions)
-> review/board/rev_bubble.jpg (05) and review/board/rev_3dtext.jpg (06, 07, 12, 13b).  python tools/rev_compare.py"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); sys.path.insert(0, H)
import final_post as FP  # noqa: E402
FP.SRC = os.path.join(H, "review", "rev_frames")


def after(f):
    im = FP.raw(f); W, Hh = im.size
    a = np.asarray(im.resize((W // 4, Hh // 4), Image.BOX), float); h, w, _ = a.shape
    d = np.tile(FP.BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
    q = np.clip(np.round(a / FP.STEP + d) * FP.STEP, 0, 255)
    out = Image.fromarray(q.astype(np.uint8)).resize((W, Hh), Image.NEAREST); FP.caption(out, FP.BD.caption_at(f / FP.FPS)); return out


F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 34)
for name, frames in (("rev_bubble", [330]), ("rev_3dtext", [395, 430, 790, 880])):
    cols = []
    for f in frames:
        b = Image.open(os.path.join(H, "renders", "post", f"{f:05d}.png")).convert("RGB"); a = after(f)
        pair = Image.new("RGB", (1080 * 2 + 20, 1920 + 60), (20, 20, 20)); pair.paste(b, (0, 60)); pair.paste(a, (1100, 60))
        d = ImageDraw.Draw(pair); d.text((10, 12), f"BEFORE  {FP.beat_of(f)}  f{f}", font=F, fill=(255, 120, 120)); d.text((1110, 12), "AFTER", font=F, fill=(120, 230, 120))
        cols.append(pair.resize((pair.width // 2, pair.height // 2)))
    sh = Image.new("RGB", (cols[0].width * min(2, len(cols)), cols[0].height * ((len(cols) + 1) // 2)), (20, 20, 20))
    for k, c in enumerate(cols):
        sh.paste(c, ((k % 2) * c.width, (k // 2) * c.height))
    p = os.path.join(H, "review", "board", f"{name}.jpg"); sh.save(p, quality=88); print(p)
