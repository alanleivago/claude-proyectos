"""Repair cutout.webm: add the soccer ball the matte drops (Hough circle on edit.mp4, temporally smoothed) and keep only the
largest connected component (removes chair remnants). Writes assets/cutout_fix.webm and cutout_fix_sep.webm."""
import subprocess, sys
from pathlib import Path
import numpy as np, cv2
R = Path(__file__).resolve().parent.parent; A = R / "assets"
W, H = 1080, 1920; N = int(sys.argv[1]) if len(sys.argv) > 1 else 10**9
ed = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(A / "edit.mp4"), "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
co = subprocess.Popen(["ffmpeg", "-v", "error", "-c:v", "libvpx-vp9", "-i", str(A / "cutout.webm"), "-f", "rawvideo", "-pix_fmt", "rgba", "-"], stdout=subprocess.PIPE)
fps = "24000/1001"
def enc(name, vf):
    return subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", fps, "-i", "-", "-vf", vf,
                             "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "3M", "-auto-alt-ref", "0", "-row-mt", "1", "-deadline", "realtime", "-cpu-used", "5", str(A / name)], stdin=subprocess.PIPE)
o1 = enc("cutout_fix.webm", "format=yuva420p")
o2 = enc("cutout_fix_sep.webm", "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0,eq=contrast=1.12:brightness=-0.02,format=yuva420p")
prev = None; k = 0; log = []
while k < N:
    g = ed.stdout.read(W * H); c = co.stdout.read(W * H * 4)
    if len(g) < W * H or len(c) < W * H * 4: break
    g = np.frombuffer(g, np.uint8).reshape(H, W); c = np.frombuffer(c, np.uint8).reshape(H, W, 4).copy()
    a = c[..., 3]
    small = cv2.GaussianBlur(cv2.resize(g, (W // 2, H // 2)), (7, 7), 2)
    roi = small[500:900, 100:900]
    cir = cv2.HoughCircles(roi, cv2.HOUGH_GRADIENT, dp=1.2, minDist=200, param1=90, param2=28, minRadius=40, maxRadius=75)
    cur = None
    if cir is not None:
        x, y, r = cir[0][0]; cur = np.array([(x + 100) * 2, (y + 500) * 2, r * 2])
    if cur is None: cur = prev
    elif prev is not None and np.hypot(*(cur[:2] - prev[:2])) < 60: cur = 0.5 * cur + 0.5 * prev
    prev = cur
    if cur is not None:
        disc = np.zeros_like(a); cv2.circle(disc, (int(cur[0]), int(cur[1])), int(cur[2] * 1.03), 255, -1, cv2.LINE_AA)
        hole = (disc > 0) & (a < 128)
        a2 = np.maximum(a, disc)
        # colour for the restored ball pixels: from the edit frame (gray) is not enough -> take RGB from edit later; mark
        c[..., 3] = a2
        c[hole, :3] = 0  # placeholder, filled below
        log.append((k, int(cur[0]), int(cur[1]), int(cur[2]), int(hole.sum())))
    # largest connected component
    m = (c[..., 3] > 40).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 2:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); c[..., 3][(lab != big) & (lab != 0)] = 0
    if cur is not None and log and log[-1][0] == k:
        pass
    np.save if False else None
    # restore true colours for the ball from the edit video (rgb)
    if cur is not None:
        if 'edrgb' not in globals():
            globals()['edrgb'] = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(A / "edit.mp4"), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
            globals()['edk'] = 0
        while edk <= k:
            fr = edrgb.stdout.read(W * H * 3); globals()['edk'] += 1
        rgb = np.frombuffer(fr, np.uint8).reshape(H, W, 3)
        c[hole, :3] = rgb[hole]
    else:
        if 'edrgb' in globals():
            while edk <= k:
                edrgb.stdout.read(W * H * 3); globals()['edk'] += 1
    # chair remnants below the left elbow + soft bottom crop
    c[1460:, :300, 3] = 0
    ramp = np.clip((1570 - np.arange(1490, H)) / 80.0, 0, 1)[:, None]
    c[1490:, :, 3] = (c[1490:, :, 3] * ramp).astype(np.uint8)
    o1.stdin.write(c.tobytes()); o2.stdin.write(c.tobytes()); k += 1
o1.stdin.close(); o2.stdin.close(); o1.wait(); o2.wait()
miss = sum(1 for _ in range(k)) - len(log)
print("frames", k, "with ball", len(log), "holes filled px median", int(np.median([l[4] for l in log])) if log else 0)
