"""PS1 post as in our finals (pieces/zaw-dog-01/final_post.py): 270x480 base, 4x4 Bayer, 15-bit colour, temporally STABLE
dither (a low-res pixel keeps its dithered colour until its input moves more than half a step), nearest x4 to 1080x1920,
then small labels; encoded H.264 (CRF 18).
    .venv/bin/python ps1post.py <frames_glob_dir> <out.mp4> [--labels segments.txt] [--fps 30] [--prefix t_]"""
import argparse
import glob
import os
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont

BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16 - 0.5
STEP = 255 / 31
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("--labels"); ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--glob", default="*.png"); ap.add_argument("--sort", default="name")
a = ap.parse_args()
files = glob.glob(os.path.join(a.src, a.glob))
if a.sort == "yaw":                                       # look.py turntable names: <prefix>_<yaw>.png
    files.sort(key=lambda p: float(os.path.basename(p).rsplit("_", 1)[1][:-4]))
else:
    files.sort()
LAB = {}
if a.labels:
    for ln in open(a.labels):
        i, s, f = ln.split(); LAB[int(i)] = s
FNT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 44)
tmp = tempfile.mkdtemp(prefix="ps1post_")
q = ref = None; prev_lab = None
for k, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((1080, 1920), Image.LANCZOS)
    lo = np.asarray(im.resize((270, 480), Image.BOX), float)
    h, w, _ = lo.shape
    d = np.tile(BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
    qn = np.clip(np.round(lo / STEP + d) * STEP, 0, 255)
    lab = LAB.get(k + 1)
    if q is None or lab != prev_lab:                      # new segment = new shot: reset the stable dither
        q, ref = qn, lo.copy()
    else:
        move = (np.abs(lo - ref) > 0.5 * STEP).any(-1)
        q[move] = qn[move]; ref[move] = lo[move]
    prev_lab = lab
    out = Image.fromarray(q.astype(np.uint8)).resize((1080, 1920), Image.NEAREST)
    if lab:
        dr = ImageDraw.Draw(out)
        dr.text((40, 40), lab.upper(), font=FNT, fill=(255, 226, 26), stroke_width=4, stroke_fill=(0, 0, 0))
    out.save(os.path.join(tmp, f"{k:05d}.png"))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(a.fps), "-i", os.path.join(tmp, "%05d.png"), "-c:v", "libx264",
                "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.out], check=True,
               timeout=900, env={"PATH": os.environ.get("PATH", "/opt/homebrew/bin:/usr/bin:/bin")})
print(a.out, len(files), "frames")
