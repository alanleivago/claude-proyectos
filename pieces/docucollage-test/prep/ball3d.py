"""v3 S14: soccer ball that spins in 3D like the reel's globe (P12-P15: rotates ~0.9 deg/frame at 25 fps = 22.5 deg/s).
Procedural truncated icosahedron (spherical Voronoi of 12 pentagon + 20 hexagon centres), lit + halftone-ready.
python prep/ball3d.py [n_frames] -> assets/img3/ball3d/f_000.png ... (one per 12 fps step, 1.875 deg each)"""
import sys, math
from pathlib import Path
import numpy as np
from PIL import Image
R = Path(__file__).resolve().parent.parent; O = R / "assets/img3/ball3d"; O.mkdir(parents=True, exist_ok=True)
N = int(sys.argv[1]) if len(sys.argv) > 1 else 1
D = 860; STEP_DEG = 40 / 12          # v3c final: 40 deg/s so the spin reads clearly (ref globe 22.5 deg/s looked static in our render)
p = (1 + 5 ** .5) / 2
ico = np.array([(-1, p, 0), (1, p, 0), (-1, -p, 0), (1, -p, 0), (0, -1, p), (0, 1, p), (0, -1, -p), (0, 1, -p), (p, 0, -1), (p, 0, 1), (-p, 0, -1), (-p, 0, 1)], float)
ico /= np.linalg.norm(ico, axis=1)[:, None]
dod = []
for i in range(12):
    for j in range(i + 1, 12):
        for k in range(j + 1, 12):
            a, b, c = ico[i], ico[j], ico[k]
            if np.dot(a, b) > .4 and np.dot(b, c) > .4 and np.dot(a, c) > .4:
                v = a + b + c; dod.append(v / np.linalg.norm(v))
C = np.vstack([ico, np.array(dod)])          # 32 face centres
ispent = np.array([True] * 12 + [False] * 20)
y, x = np.mgrid[0:D, 0:D]; u = (x + .5) / D * 2 - 1; v = 1 - (y + .5) / D * 2; r2 = u * u + v * v; inside = r2 < 1
z = np.sqrt(np.clip(1 - r2, 0, 1)); Nrm = np.stack([u, v, z], -1)
L = np.array([-.45, .6, .66]); L /= np.linalg.norm(L)
def rot(axis, ang):
    axis = axis / np.linalg.norm(axis); a = math.cos(ang / 2); b, c, d = -axis * math.sin(ang / 2)
    return np.array([[a*a+b*b-c*c-d*d, 2*(b*c+a*d), 2*(b*d-a*c)], [2*(b*c-a*d), a*a+c*c-b*b-d*d, 2*(c*d+a*b)], [2*(b*d+a*c), 2*(c*d-a*b), a*a+d*d-b*b-c*c]])
tilt = rot(np.array([1., 0, 0]), math.radians(18))
for f in range(N):
    M = rot(np.array([0.15, 1., 0.1]), math.radians(f * STEP_DEG)) @ tilt
    P = Nrm @ M.T
    dots = P @ C.T; srt = np.sort(dots, -1); best = np.argmax(dots, -1)
    seam = (srt[..., -1] - srt[..., -2]) < 0.008
    base = np.where(ispent[best][..., None], np.array([22, 22, 26.]), np.array([236, 236, 232.]))
    base = np.where(seam[..., None], np.array([120, 120, 120.]), base)
    lam = np.clip(Nrm @ L, 0, 1); spec = np.clip(Nrm @ (L + np.array([0, 0, 1])) / np.linalg.norm(L + np.array([0, 0, 1])), 0, 1) ** 40
    col = base * (0.28 + 0.78 * lam[..., None]) + 255 * 0.35 * spec[..., None]
    col *= (0.55 + 0.45 * z[..., None] ** 0.35)              # rim darkening
    a = np.clip((1 - np.sqrt(r2)) * D / 2, 0, 1) * 255
    img = np.dstack([np.clip(col, 0, 255), a]).astype(np.uint8)
    Image.fromarray(img, "RGBA").save(O / f"f_{f:03d}.png")
print("frames", N)
