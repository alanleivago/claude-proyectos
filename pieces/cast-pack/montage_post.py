"""venv: montage.py frames -> PS1 stable dither (270x480 base look, 15-bit Bayer, temporally stable inside a shot)
+ the role as a yellow Courier caption -> one silent mp4.   .venv/bin/python pieces/cast-pack/montage_post.py <out.mp4>"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(os.path.join(H, "..", ".."))
sys.path.insert(0, os.path.join(R, "pieces", "lps-lowpoly-test"))
from photoprop import BAYER4  # noqa: E402
SRC = os.path.join(H, "renders", "frames"); DST = os.path.join(H, "renders", "post"); os.makedirs(DST, exist_ok=True)
CAST = {c["slug"]: c for c in json.load(open(os.path.join(R, "styles/zawdog/humans/cast.json")))["cast"]}
FONT = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"; STEP = 255 / 31
k = 0
for shot in sorted(d for d in os.listdir(SRC) if not d.startswith((".", "_"))):
    slug = shot.split("_", 1)[1]; ref = q = None
    for f in sorted(os.listdir(os.path.join(SRC, shot))):
        im = Image.open(os.path.join(SRC, shot, f)).convert("RGB"); W, Hh = im.size
        a = np.asarray(im.resize((W // 3, Hh // 3), Image.BOX), float); h, w, _ = a.shape
        d = np.tile(BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
        qn = np.clip(np.round(a / STEP + d) * STEP, 0, 255)
        if q is None:
            q, ref = qn, a.copy()
        else:
            mv = (np.abs(a - ref) > 0.5 * STEP).any(-1); q[mv] = qn[mv]; ref[mv] = a[mv]
        out = Image.fromarray(q.astype(np.uint8)).resize((W, Hh), Image.NEAREST)
        dr = ImageDraw.Draw(out)
        dr.text((W / 2, Hh * 0.12), CAST[slug]["role"].split(" (")[0].upper(), font=ImageFont.truetype(FONT, 50), fill=(255, 238, 64),
                anchor="ms", stroke_width=5, stroke_fill=(0, 0, 0))
        out.save(os.path.join(DST, f"{k:05d}.png")); k += 1
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "30", "-i", os.path.join(DST, "%05d.png"), "-c:v", "libx264", "-crf", "18",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", sys.argv[1]], check=True)
print(sys.argv[1], k, "frames")
