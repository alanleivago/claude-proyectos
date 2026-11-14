# Keys the Flow images (green/blue screen) into PNGs with alpha at 540x960, and builds a shared palette.
import numpy as np
from PIL import Image
from pathlib import Path

G = Path(__file__).parent / 'gen'
A = Path(__file__).parent / 'assets'
A.mkdir(exist_ok=True)
SRC = {
    'head': ('2026-11-08T05-17-31-flat-cel-shaded-digital-illustration-of--1.jpg', 'g'),
    'front': ('2026-11-08T05-18-20-same-man-and-same-flat-cel-shaded-illust-1.jpg', 'g'),
    'profile': ('2026-11-08T05-18-38-same-man-and-same-flat-cel-shaded-illust-1.jpg', None),
    'muzzle': ('2026-11-08T05-22-08-edit-ppprofile-keep-exactly-the-same-ima-1.jpg', None),
    'mouth': ('2026-11-08T05-20-48-same-man-and-same-flat-cel-shaded-illust-1.jpg', None),
    'hand': ('2026-11-08T05-21-04-flat-cel-shaded-digital-illustration-sam-1.jpg', 'b'),
    'held': ('2026-11-08T05-21-22-same-man-and-same-flat-cel-shaded-illust-1.jpg', None),
    'body': ('body/2026-11-08T05-22-30-same-man-and-same-flat-cel-shaded-illust-1.jpg', 'g'),
}
for name, (f, key) in SRC.items():
    im = Image.open(G / f).convert('RGB').resize((540, 960), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if key == 'g':
        m = g - np.maximum(r, b)
    elif key == 'b':
        m = b - np.maximum(r, g)
    else:
        m = None
    if m is not None:
        alpha = np.clip(1 - (m - 40) / 60, 0, 1)
        # despill
        if key == 'g':
            a[..., 1] = np.minimum(g, np.maximum(r, b))
        else:
            a[..., 2] = np.minimum(b, np.maximum(r, g))
        out = np.dstack([a, alpha * 255]).astype(np.uint8)
        Image.fromarray(out, 'RGBA').save(A / f'{name}.png')
    else:
        im.save(A / f'{name}.png')
    print(name, 'keyed' if m is not None else 'opaque')
