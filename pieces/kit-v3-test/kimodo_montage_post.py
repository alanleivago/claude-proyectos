"""venv: kimodo_montage.py frames -> PS1 stable dither + clip name caption -> one mp4 (all clips, ~2 s each, no audio).
    .venv/bin/python pieces/kit-v3-test/kimodo_montage_post.py <montage_dir> <out.mp4>"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import BAYER4  # noqa: E402

SRC, OUT = sys.argv[1], sys.argv[2]
DST = os.path.join(SRC, "_post"); os.makedirs(DST, exist_ok=True)
FONT = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
STEP = 255 / 31
k = 0
for clip in sorted(d for d in os.listdir(SRC) if not d.startswith("_")):
    fs = sorted(os.listdir(os.path.join(SRC, clip))); ref = q = None
    for f in fs:
        im = Image.open(os.path.join(SRC, clip, f)).convert("RGB"); W, Hh = im.size
        a = np.asarray(im.resize((W // 3, Hh // 3), Image.BOX), float); h, w, _ = a.shape
        d = np.tile(BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
        qn = np.clip(np.round(a / STEP + d) * STEP, 0, 255)
        if q is None:
            q, ref = qn, a.copy()
        else:
            mv = (np.abs(a - ref) > 0.5 * STEP).any(-1); q[mv] = qn[mv]; ref[mv] = a[mv]
        out = Image.fromarray(q.astype(np.uint8)).resize((W, Hh), Image.NEAREST)
        dr = ImageDraw.Draw(out); txt = clip.replace("_", " ").upper()
        dr.text((W / 2, Hh * 0.9), txt, font=ImageFont.truetype(FONT, 46), fill=(255, 238, 64), anchor="ms", stroke_width=5, stroke_fill=(0, 0, 0))
        out.save(os.path.join(DST, f"{k:05d}.png")); k += 1
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "30", "-i", os.path.join(DST, "%05d.png"), "-c:v", "libx264", "-crf", "18",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], check=True)
print(OUT, k, "frames")
