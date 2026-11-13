"""venv: low-res camera-move preview (review/anim/<beat>/#####.png, 270x480 every frame) -> PS1 dither + Zaw captions ->
review/preview_moves.mp4 with sound/out/final_mix.wav.   python tools/preview.py"""
import json, os, subprocess, sys
from PIL import Image
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); sys.path.insert(0, H); sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
import board as BD  # noqa: E402
from photoprop import ps1_post  # noqa: E402
B = json.load(open(os.path.join(H, "review", "beats.json"))); OUT = os.path.join(H, "review", "preview"); os.makedirs(OUT, exist_ok=True)
k = 0
for n, (a, b, _) in B.items():
    for f in range(a, b):
        p = os.path.join(H, "review", "anim", n, f"{f:05d}.png")
        im = ps1_post(Image.open(p).convert("RGB").resize((540, 960), Image.NEAREST), scale=2)
        BD.caption(im, BD.caption_at(f / 30)); im.resize((540, 960)).save(os.path.join(OUT, f"{f:05d}.png")); k += 1
dst = os.path.join(H, "review", "preview_moves.mp4")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "30", "-i", os.path.join(OUT, "%05d.png"), "-i", os.path.join(H, "sound", "out", "final_mix.wav"),
                "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-shortest", dst], check=True)
print(dst, k, "frames")
