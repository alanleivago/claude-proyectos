"""v9 re-cut (cut moved out of "uniform"): new edit = old edit[0:12] + raw frames 17-22 (6 new) + old edit[14:] shifted +4.
Rebuild cutout: alpha from the user's Premiere roto (old cutout_pr.webm) remapped, BiRefNet only for the 6 new frames."""
import subprocess, numpy as np, cv2
from PIL import Image
from rembg import new_session, remove
W, H, N = 1080, 1920, 256
def frames(src, pix, ch, dec=[]):
    b = subprocess.run(["ffmpeg", "-v", "error", *dec, "-i", src, "-frames:v", str(N), "-f", "rawvideo", "-pix_fmt", pix, "-"], capture_output=True).stdout
    return np.frombuffer(b, np.uint8).reshape(-1, H, W, ch)
new = frames("assets/edit2.mp4", "rgb24", 3)
old = frames("assets/cutout_pr_v1.webm", "rgba", 4, ["-c:v", "libvpx-vp9"])
sess = new_session("birefnet-portrait")
out = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "24000/1001", "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M", "-auto-alt-ref", "0", "assets/cutout_pr.webm"], stdin=subprocess.PIPE)
n = min(len(new), len(old) + 4)
for k in range(n):
    if k < 12: a = old[k, ..., 3]
    elif k < 18:
        m = np.asarray(remove(Image.fromarray(new[k]), session=sess, only_mask=True), np.float32)
        a = np.clip((m - 40) * 255 / 175, 0, 255).astype(np.uint8); print("birefnet", k, flush=True)
    else: a = old[k - 4, ..., 3]
    a = a.copy()
    c, lab, st, _ = cv2.connectedComponentsWithStats((a > 20).astype(np.uint8), 8)
    if c > 2:
        big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); a[(lab != big) & (lab > 0)] = 0
    out.stdin.write(np.dstack([new[k], a]).tobytes())
out.stdin.close(); out.wait(); print("frames", n)
