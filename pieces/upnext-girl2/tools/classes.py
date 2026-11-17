"""Class maps of his frames: 0 bg, 1 skin, 2 hair, 3 sweater, 4 skirt, 5 leggings, 6 boots.
python tools/classes.py -> ref/cls.npz (uint8, full res, 250 frames) + review/_cls.png"""
import numpy as np, glob, sys
from PIL import Image
from scipy import ndimage as nd
PAL = [(0, (235, 221, 199)),
       (1, (248, 196, 181)), (1, (244, 202, 186)), (1, (236, 236, 230)), (1, (120, 150, 140)), (1, (205, 140, 130)), (1, (225, 160, 150)),
       (2, (205, 163, 124)), (2, (186, 145, 108)), (2, (161, 125, 92)), (2, (196, 154, 115)), (2, (221, 185, 155)), (1, (180, 137, 127)), (1, (195, 150, 140)),
       (3, (181, 128, 73)), (3, (131, 85, 42)), (3, (146, 93, 42)), (3, (154, 101, 50)), (3, (110, 70, 35)),
       (4, (56, 62, 45)), (4, (35, 41, 27)), (4, (82, 88, 68)), (4, (44, 50, 35)), (4, (66, 72, 55)),
       (5, (60, 48, 56)), (5, (40, 29, 36)), (5, (53, 41, 49)), (5, (47, 36, 44)),
       (6, (45, 34, 30)), (6, (28, 20, 17)), (6, (48, 34, 28)), (6, (36, 25, 21)), (6, (55, 42, 36))]
PC = np.array([c for _, c in PAL], float); PK = np.array([k for k, _ in PAL], np.uint8)


def classify(im):
    im = im.astype(np.float32); out = np.zeros(im.shape[:2], np.uint8)
    fg = np.abs(im - PC[0]).sum(-1) > 20
    px = im[fg]; lab = np.zeros(len(px), np.uint8)
    for i in range(0, len(px), 200000):
        b = px[i:i + 200000]; lab[i:i + 200000] = PK[((b[:, None, :] - PC[None].astype(np.float32)) ** 2).sum(-1).argmin(1)]
    out[fg] = lab
    return out


def clean(c, minsz=400):
    """small islands of any class (lashes, bracelet lines, pupils, AA specks) -> class of the nearest big region"""
    bad = np.zeros(c.shape, bool)
    for k in range(1, 7):
        lab, n = nd.label(c == k)
        if n == 0: continue
        sz = np.bincount(lab.ravel())
        small = sz < minsz; small[0] = False
        bad |= small[lab]
    if not bad.any(): return c
    _, (iy, ix) = nd.distance_transform_edt(bad, return_indices=True)
    return c[iy, ix]


def work(f): return clean(classify(np.asarray(Image.open(f).convert("RGB"))))


if __name__ == "__main__":
    fs = sorted(glob.glob("ref/frames/f*.png"))
    from multiprocessing import Pool
    with Pool(12) as pool: C = pool.map(work, fs)
    C = np.array(C); np.savez_compressed("ref/cls.npz", c=C)
    LUT = np.array([(0, 0, 0), (255, 190, 170), (220, 170, 60), (180, 90, 20), (40, 160, 40), (140, 60, 200), (90, 50, 20)], np.uint8)
    strip = np.concatenate([LUT[C[k, 250:1840, 150:900]] for k in (0, 40, 82, 125, 168, 210)], 1)
    Image.fromarray(strip).resize((strip.shape[1] // 3, strip.shape[0] // 3), Image.NEAREST).save("review/_cls.png")
