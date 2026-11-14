"""ProRes 4444 alpha (Premiere object mask) -> VP9 alpha webm, keeping only the largest alpha blob per frame (drops neon leaks).
python tools/prores_to_cutout.py in.mov out.webm"""
import subprocess, sys, numpy as np, cv2
src, dst = sys.argv[1], sys.argv[2]
AFF = np.array([float(v) for v in sys.argv[3].split(",")], np.float32).reshape(2, 3) if len(sys.argv) > 3 else None   # ECC warp roto->edit (Premiere clip scaled)
W, H = 1080, 1920
r = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], stdout=subprocess.PIPE)
w = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "24000/1001", "-i", "-",
                      "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M", "-auto-alt-ref", "0", dst], stdin=subprocess.PIPE)
n = 0
while True:
    b = r.stdout.read(W * H * 4)
    if len(b) < W * H * 4: break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 4).copy()
    if AFF is not None: f = cv2.warpAffine(f, AFF, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)
    k, lab, st, _ = cv2.connectedComponentsWithStats((f[..., 3] > 20).astype(np.uint8), 8)
    if k > 2:
        big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        f[..., 3][(lab != big) & (lab > 0)] = 0
    w.stdin.write(f.tobytes()); n += 1
w.stdin.close(); w.wait(); print(dst, n, "frames")
