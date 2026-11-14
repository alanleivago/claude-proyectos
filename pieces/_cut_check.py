"""cutout_pr.webm check: alignment diff vs edit.mp4 in alpha + yellow-bg sheet + blob count. python _cut_check.py NN out.jpg"""
import subprocess, sys, numpy as np, cv2
from PIL import Image
N = sys.argv[1]; P = f"stimulus-{N}-hf/assets/"
def fr(src, t, fmt, ch, dec=[]):
    b = subprocess.run(["ffmpeg", "-v", "error", *dec, "-ss", str(t), "-i", src, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", fmt, "-"], capture_output=True).stdout
    return np.frombuffer(b, np.uint8).reshape(1920, 1080, ch).astype(np.float32)
tiles, info = [], []
for t in (0.3, 1.5, 3.0, 4.5, 6.0, 8.0, 10.0):
    c = fr(P + "cutout_pr.webm", t, "rgba", 4, ["-c:v", "libvpx-vp9"]); e = fr(P + "edit.mp4", t, "rgb24", 3)
    a = c[..., 3] / 255; m = a > .8
    d = np.abs(c[..., :3] - e)[m].mean() if m.sum() else -1
    k = cv2.connectedComponents((a > .08).astype(np.uint8))[0] - 1
    info.append(f"{t}s d={d:.1f} blobs={k} area={int(m.sum())}")
    y = np.zeros_like(e); y[...] = (255, 220, 0)
    o = (c[..., :3] * a[..., None] + y * (1 - a[..., None])).astype(np.uint8)
    tiles.append(Image.fromarray(o[0:1300]).resize((270, 325)))
S = Image.new("RGB", (270 * len(tiles), 325))
for i, im in enumerate(tiles): S.paste(im, (i * 270, 0))
S.save(sys.argv[2], quality=85); print(N, " | ".join(info))
