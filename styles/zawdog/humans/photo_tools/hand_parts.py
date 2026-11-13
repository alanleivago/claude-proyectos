"""Hand photo parts (venv): a Flow photo of one RIGHT hand, BACK view on the left half and PALM view on the right half,
hanging down (wrist cut at the top, fingertips at the bottom), magenta background.
    .venv/bin/python styles/zawdog/humans/photo_tools/hand_parts.py <name> <hand.jpg>
-> humans/<name>/photo/hand.npz: per view the rows (wrist .. fingertips), per-row centre / half-width of the whole
hand outline, which side the thumb is on, and the photo bled into the background (no magenta at the outline)."""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parts import bg_mask, bleed  # noqa: E402

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
name, path = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(path).convert("RGB").resize((1376, 768), Image.LANCZOS), np.float32)
m = nd.binary_opening(~bg_mask(a), iterations=2)
sp = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1], 0, None); a = a.copy(); a[..., 0] -= sp; a[..., 2] -= sp
out = {}
for v, (x0, x1) in enumerate(((0, 688), (688, 1376))):
    mv = np.zeros_like(m); mv[:, x0:x1] = m[:, x0:x1]
    lab, n = nd.label(mv); sz = nd.sum(mv, lab, range(1, n + 1)); mv = lab == (1 + int(np.argmax(sz)))
    rows = np.where(mv.any(1))[0]; top, bot = int(rows.min()), int(rows.max())
    cen = np.zeros(768); hw = np.zeros(768)
    for y in range(top, bot + 1):
        xs = np.where(mv[y])[0]; cen[y] = (xs.min() + xs.max()) / 2; hw[y] = max((xs.max() - xs.min()) / 2, 1)
    wc = np.median(cen[top:top + 20])
    b0, b1 = int(top + 0.45 * (bot - top)), int(top + 0.7 * (bot - top))
    lft = np.mean([wc - np.where(mv[y])[0].min() for y in range(b0, b1)]); rgt = np.mean([np.where(mv[y])[0].max() - wc for y in range(b0, b1)])
    out[f"v{v}_top"] = top; out[f"v{v}_bot"] = bot; out[f"v{v}_cen"] = nd.uniform_filter1d(cen, 5); out[f"v{v}_hw"] = nd.uniform_filter1d(hw, 5)
    out[f"v{v}_thumb"] = 1.0 if rgt > lft else -1.0                     # +1: the thumb is on the image right
    print(name, "hand view", v, "rows", top, bot, "thumb", "right" if rgt > lft else "left")
out["img"] = nd.gaussian_filter(bleed(a, nd.binary_erosion(m, iterations=3)), (0.8, 0.8, 0)).astype(np.uint8)
np.savez_compressed(os.path.join(H, name, "photo", "hand.npz"), **out)
