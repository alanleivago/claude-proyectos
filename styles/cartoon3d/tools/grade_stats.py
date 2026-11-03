"""Median saturation / luma of a video or stills, the way the mromidev reports measure them (HSV S and Rec.709 luma
on non-ink pixels: luma > 0.08). usage: python grade_stats.py video.mp4 [n_frames]  |  python grade_stats.py a.jpg b.jpg"""
import subprocess, sys, numpy as np
from PIL import Image
def stats(rgb):
    x = rgb.reshape(-1, 3).astype(np.float32) / 255
    y = x @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    mx, mn = x.max(1), x.min(1); s = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0)
    k = y > 0.08
    return np.median(s[k]), np.median(y[k]), np.percentile(y[k], 5)
args = sys.argv[1:]
frames = []
if args[0].lower().endswith((".mp4", ".mov", ".webm")):
    n = int(args[1]) if len(args) > 1 else 24
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", args[0]], capture_output=True, text=True).stdout)
    for i in range(n):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{(i + .5) * dur / n:.2f}", "-i", args[0], "-frames:v", "1", "-vf", "scale=270:480", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        frames.append(np.frombuffer(raw, np.uint8).reshape(480, 270, 3))
else:
    frames = [np.asarray(Image.open(p).convert("RGB").resize((270, 480))) for p in args]
S = np.array([stats(f) for f in frames])
print(f"sat median {np.median(S[:,0]):.2f}  luma median {np.median(S[:,1]):.2f}  luma p5 {np.median(S[:,2]):.2f}  (n={len(frames)})")
