"""venv: renders/frames (Blender 1080x1920) -> renders/post (PS1 stable dither + Zaw captions) -> the mp4 with sound/out/final_mix.wav.
Same post as zaw-dog-05/final_post.py: 270x480 base, 15-bit Bayer, temporally stable inside a shot, then yellow Courier
captions (2-word blocks, baseline 67 %).   python final_post.py [post|encode|all]"""
import os
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import BAYER4  # noqa: E402

SRC, DST = os.path.join(H, "renders", "frames"), os.path.join(H, "renders", "post")
os.makedirs(DST, exist_ok=True)
FPS = 30
SHOTS = {"A": (0, 75), "B": (75, 165), "C": (165, 250)}
CAPS = [(0.25, 2.2, "HE'S HOME"), (2.8, 3.5, "WOOF!"), (6.15, 8.2, "FAIR ENOUGH")]
CAP_FONT = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
CAP_COL = (255, 238, 64)
TITLE = "Kit v3 test - the owner startles"
STEP = 255 / 31


def caption(im, txt):
    if not txt:
        return
    d = ImageDraw.Draw(im); W, Hh = im.size
    size = int(W * 0.085)
    while size > 40 and d.textlength(txt, font=ImageFont.truetype(CAP_FONT, size)) > W * 0.86:
        size -= 2
    d.text((W / 2, Hh * 0.67), txt, font=ImageFont.truetype(CAP_FONT, size), fill=CAP_COL, anchor="ms",
           stroke_width=max(3, W // 140), stroke_fill=(0, 0, 0))


def cap_at(t):
    return next((c for a, b, c in CAPS if a <= t < b), "")


def shot(name):
    a_, b_ = SHOTS[name]; ref = q = None
    for f in range(a_, b_):
        im = Image.open(os.path.join(SRC, f"{f:05d}.png")).convert("RGB"); W, Hh = im.size
        a = np.asarray(im.resize((W // 4, Hh // 4), Image.BOX), float)
        h, w, _ = a.shape
        d = np.tile(BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
        qn = np.clip(np.round(a / STEP + d) * STEP, 0, 255)
        if q is None:
            q, ref = qn, a.copy()
        else:
            move = (np.abs(a - ref) > 0.5 * STEP).any(-1)
            q[move] = qn[move]; ref[move] = a[move]
        out = Image.fromarray(q.astype(np.uint8)).resize((W, Hh), Image.NEAREST)
        caption(out, cap_at(f / FPS))
        out.save(os.path.join(DST, f"{f:05d}.png"))
    return name


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode in ("post", "all"):
        with Pool(3) as p:
            for g in p.imap_unordered(shot, list(SHOTS)):
                print("post", g, flush=True)
    if mode in ("encode", "all"):
        out = os.path.join(H, "renders", f"{TITLE}.mp4")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", os.path.join(DST, "%05d.png"),
                        "-i", os.path.join(H, "sound", "out", "final_mix.wav"), "-c:v", "libx264", "-preset", "slow", "-crf", "17",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
        print(out)
