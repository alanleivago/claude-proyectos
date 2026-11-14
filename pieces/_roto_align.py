"""mean |RGB| diff roto vs edit inside alpha (≈1 = aligned); if >5 prints ECC affine (roto->edit) for prores_to_cutout.py
python _roto_align.py piece_dir"""
import subprocess, sys, numpy as np, cv2
P = sys.argv[1]
def fr(src, t, fmt, ch):
    b = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", src, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", fmt, "-"], capture_output=True).stdout
    return np.frombuffer(b, np.uint8).reshape(1920, 1080, ch).astype(np.float32)
res = []
for t in (1.0, 3.0, 5.0, 8.0):
    r = fr(P + "/assets/roto_pr.mov", t, "rgba", 4); e = fr(P + "/assets/edit.mp4", t, "rgb24", 3)
    m = r[..., 3] > 200
    d = np.abs(r[..., :3] - e)[m].mean() if m.sum() else -1
    res.append((t, round(float(d), 2), int(m.sum())))
print("diff", res)
if max(d for _, d, _ in res) > 5:
    r = fr(P + "/assets/roto_pr.mov", 3.0, "rgba", 4); e = fr(P + "/assets/edit.mp4", 3.0, "rgb24", 3)
    a = cv2.cvtColor(r[..., :3].astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); b = cv2.cvtColor(e.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    M = np.eye(2, 3, dtype=np.float32)
    _, M = cv2.findTransformECC(b, a, M, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), (r[..., 3] > 200).astype(np.uint8), 5)
    print("AFF", ",".join(f"{v:.6f}" for v in M.ravel()))
