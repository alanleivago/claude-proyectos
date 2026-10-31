"""venv: per-texel 3D position of the lps-hombre head atlas (rasterised from tex/head_mesh.npz) -> tex/head_map.npz
{p: (S,S,3) head-local position, cov: (S,S) covered}. The head painter (paint_heads.py) works in 3D with it."""
import numpy as np, os
H = os.path.dirname(os.path.abspath(__file__)); S = 1024
d = np.load(os.path.join(H, "head_mesh.npz")); P, U = d["P"], d["U"]
pos = np.zeros((S, S, 3), np.float32); cov = np.zeros((S, S), bool)
for tri, uv in zip(P, U):
    px = np.stack([uv[:, 0] * S, (1 - uv[:, 1]) * S], 1)
    x0, y0 = np.floor(px.min(0)).astype(int); x1, y1 = np.ceil(px.max(0)).astype(int)
    xs, ys = np.meshgrid(np.arange(max(x0, 0), min(x1 + 1, S)), np.arange(max(y0, 0), min(y1 + 1, S)))
    q = np.stack([xs + 0.5, ys + 0.5], -1)
    a, b, c = px; v0, v1 = b - a, c - a; den = v0[0] * v1[1] - v1[0] * v0[1]
    if abs(den) < 1e-9:
        continue
    w = q - a; l1 = (w[..., 0] * v1[1] - v1[0] * w[..., 1]) / den; l2 = (v0[0] * w[..., 1] - w[..., 0] * v0[1]) / den; l0 = 1 - l1 - l2
    m = (l0 >= -0.002) & (l1 >= -0.002) & (l2 >= -0.002)
    pos[ys[m], xs[m]] = l0[m, None] * tri[0] + l1[m, None] * tri[1] + l2[m, None] * tri[2]; cov[ys[m], xs[m]] = True
np.savez(os.path.join(H, "head_map.npz"), p=pos, cov=cov)
print("covered", cov.mean())
