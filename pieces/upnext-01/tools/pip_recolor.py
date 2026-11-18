"""Pip v2 palette: recolour his body texture (cone / shirt / trousers) so he isn't the ref gnome's red-green-blue.
Hue classes on the 256 px atlas (skin, beard, boots, eyes untouched); each class keeps its own shading (value ratio to the
class mean). out: engine/models/upnext/pip_tex_<A|B|C>.png.  usage: python tools/pip_recolor.py"""
from pathlib import Path

import numpy as np
from PIL import Image

PIECE = Path(__file__).resolve().parents[1]
SRC = PIECE / 'work' / 'gnome_tex0.png'
OPTIONS = {   # cone, shirt, trousers (sRGB)
    'A': ((0xC9, 0x9A, 0x2E), (0x2C, 0x86, 0x84), (0x6A, 0x4A, 0x2E)),   # mustard cone, teal shirt, brown trousers
    'B': ((0xC0, 0x7A, 0x2A), (0x86, 0x2C, 0x3C), (0x7A, 0x60, 0x3E)),   # ochre cone, burgundy shirt, khaki-brown trousers
    'C': ((0x3C, 0x4E, 0x9C), (0xC4, 0x9C, 0x30), (0x5C, 0x40, 0x2A)),   # indigo cone, mustard shirt, dark-brown trousers
}


def hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, d / (mx + 1e-6), mx


def main():
    a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32) / 255
    h, s, v = hsv(a)
    cls = {'cone': ((h < 18) | (h > 340)) & (s > 0.55) & (v > 0.25),
           'shirt': (h > 75) & (h < 165) & (s > 0.3) & (v > 0.15),
           'trousers': (h > 195) & (h < 255) & (s > 0.3) & (v > 0.15)}
    for k, (c1, c2, c3) in OPTIONS.items():
        out = a.copy()
        for (name, m), col in zip(cls.items(), (c1, c2, c3)):
            if not m.any(): continue
            ratio = v[m] / max(1e-3, np.median(v[m]))
            out[m] = np.clip(np.array(col, np.float32)[None] / 255 * ratio[:, None], 0, 1)
        # v3 (user): the cone's leaf ORANGE so it stands out on the mustard cone (the yellow leaf texels live in rows 185-210)
        rows = np.zeros_like(h, bool); rows[185:211] = True
        leaf = (h > 35) & (h < 70) & (s > 0.45) & (v > 0.5) & rows
        if k == 'A' and leaf.any():
            out[leaf] = np.clip(np.array([0xE8, 0x5C, 0x1C], np.float32)[None] / 255 * (v[leaf] / np.median(v[leaf]))[:, None], 0, 1)
        Image.fromarray((out * 255).astype(np.uint8)).save(PIECE / 'engine' / 'models' / 'upnext' / f'pip_tex_{k}.png')
        print(k, {n: int(m.sum()) for n, m in cls.items()})


if __name__ == '__main__':
    main()
