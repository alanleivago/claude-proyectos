"""venv: Kaneda eye-direction atlases for the saccade gags: Kaneda_<base>_<dir>.png in tex/faces.
Inside each eye's white the iris pixels slide `s` px (the white refills behind). The atlas right eye is the left
eye mirrored (x' = 63 - x), so the screen direction needs the opposite shift there (checked in test/eyes.png)."""
from pathlib import Path
import numpy as np
from PIL import Image

F = Path(__file__).resolve().parent / "faces"
WHITE = np.array([255, 255, 255, 255], np.uint8)


def shift_eye(a, x0, x1, s):
    for y in range(89, 97):
        row = a[y, x0:x1].copy(); rgb = row[:, :3].astype(int)
        light = (rgb.min(1) > 180)
        idx = np.flatnonzero(light)
        if len(idx) < 2:
            continue
        lo, hi = idx[0], idx[-1]
        dark = [(i, row[i].copy()) for i in range(lo, hi + 1) if rgb[i].sum() < 260]
        if not dark:
            continue
        for i in range(lo, hi + 1):
            if rgb[i].sum() < 260:
                row[i] = WHITE
        for i, px in dark:
            j = min(max(i + s, lo), hi)
            row[j] = px
        a[y, x0:x1] = row


# blankp: the deadpan "blank" stare with small dot pupils (user: blank must keep pupils so the eye jumps read)
b = np.asarray(Image.open(F / "Kaneda_blank.png").convert("RGBA")).copy()
for x0 in (17, 63 - 19):
    b[91:94, x0:x0 + 3, :3] = (12, 10, 10)
Image.fromarray(b).save(F / "Kaneda_blankp.png")

for base in ("neutral", "blank", "stern", "blankp"):
    src = np.asarray(Image.open(F / f"Kaneda_{base}.png").convert("RGBA")).copy()
    for name, s in (("L", -3), ("R", 3)):
        a = src.copy()
        shift_eye(a, 8, 26, s); shift_eye(a, 38, 56, -s)
        Image.fromarray(a).save(F / f"Kaneda_{base}_{name}.png")
print(sorted(p.name for p in F.glob("*_[LR].png")))
