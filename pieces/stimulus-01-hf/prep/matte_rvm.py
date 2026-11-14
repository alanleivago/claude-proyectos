"""Person cutout with Robust Video Matting (temporal, sharper than u2net) -> assets/cutout.webm (VP9 + alpha).

python prep/matte_rvm.py
"""
import subprocess, sys
from pathlib import Path
import numpy as np, torch

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/edit.mp4"
OUT = ROOT / "assets/cutout.webm"
W, H = 1080, 1920

model = torch.hub.load("PeterL1n/RobustVideoMatting", "resnet50", trust_repo=True).eval()
torch.set_num_threads(max(1, torch.get_num_threads()))
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(SRC), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "24000/1001", "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "18", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4",
                        "-auto-alt-ref", "0", str(OUT)], stdin=subprocess.PIPE)
rec = [None] * 4
n = 0
with torch.no_grad():
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        src = torch.from_numpy(rgb).permute(2, 0, 1).float().div(255).unsqueeze(0)
        fgr, pha, *rec = model(src, *rec, downsample_ratio=0.25)
        a = pha[0, 0].numpy()
        a = np.clip((a - 0.08) / 0.84, 0, 1)            # firmer edge: no see-through rim
        rgba = np.dstack([rgb, (a * 255).astype(np.uint8)])
        enc.stdin.write(rgba.tobytes())
        n += 1
        if n % 100 == 0:
            print(n, flush=True)
enc.stdin.close(); enc.wait(); dec.wait()
print("frames", n, "->", OUT)
