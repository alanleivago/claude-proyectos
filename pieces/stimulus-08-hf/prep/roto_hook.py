"""Re-matte the hook (text behind the head) with BiRefNet-portrait: clean cap/ear edges, no dark smudges.
python prep/roto_hook.py [N]  -> assets/cutout_hook.webm (first N s, default 4.7)"""
import subprocess, sys, numpy as np
from pathlib import Path
from PIL import Image
from rembg import new_session, remove
R = Path(__file__).resolve().parent.parent; F = R / "prep/roto"; F.mkdir(exist_ok=True)
N = float(sys.argv[1]) if len(sys.argv) > 1 else 4.7
subprocess.run(["ffmpeg", "-v", "error", "-y", "-t", str(N), "-i", str(R / "assets/edit.mp4"), str(F / "f%04d.png")], check=True)
sess = new_session("birefnet-portrait")
fr = sorted(F.glob("f*.png")); A = []
for i, f in enumerate(fr):
    im = Image.open(f).convert("RGB")
    A.append(np.asarray(remove(im, session=sess, only_mask=True), np.float32)); print(i, len(fr), flush=True)
A = np.stack(A)
A = (A + np.roll(A, 1, 0) * .5 + np.roll(A, -1, 0) * .5) / 2; A[0], A[-1] = A[1], A[-2]   # light temporal smoothing (no edge shimmer)
for i, f in enumerate(fr):
    a = np.clip((A[i] - 40) * 255 / 175, 0, 255).astype(np.uint8)   # firm core, soft 1-2 px edge
    im = Image.open(f).convert("RGB"); im.putalpha(Image.fromarray(a)); im.save(F / f"o{i:04d}.png")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "24000/1001", "-i", str(F / "o%04d.png"), "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M", str(R / "assets/cutout_hook.webm")], check=True)
