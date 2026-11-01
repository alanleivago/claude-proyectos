"""Exact Ricks Clips hairstyles cut straight out of a Ricks frame crop (2026-10-30, swedish-number: Flow hit its usage
limit, so instead of a Flow copy the real hair is keyed out of the frame): the hair = the colour region around a seed,
plus the dark ink lines within a few px of it (outline, hairline, strands). The head disc is measured from the face
seed (light skin region) so the HAIR entry's width is relative to the head like slice_ricks2.py.
-> sprites/png/hair_rk_<name>.png + prints HAIR entries [sprite, width in head diameters, hairline fraction, hairX].
Uso: python cut_ricks_hair.py <crops dir>"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1] / "sprites"
# name: (crop file, hair seed (x, y), face seed (x, y), colour tolerance)
CUTS = {
    'combed': ('c_combed.png', (300, 170), (270, 342), 70),
    'swoop': ('c_swoop.png', (248, 165), (269, 413), 46),
    'part': ('c_part.png', (430, 172), (430, 516), 44),
    'spiky': ('c_spiky.png', (250, 170), (200, 620), 60),
    'sweep': ('c_greysides.png', (240, 101), (266, 228), 40),
    # extras (2026-10-30): GM9UKnZ6JFw 33.75 s (grey-striped bun), eQR3pgMiUF0 23.75 s (brown big part, black bob)
    'greybun': ('c_greybun.png', (548, 184), (328, 492), 40),
    'brownbig': ('c_brownbig.png', (176, 168), (220, 368), 46),
    'blackbob': ('c_blackbob.png', (232, 120), (287, 253), 40),
}


def region(a, seed, tol, whole=False):
    x, y = seed; ref = np.median(a[max(0, y - 6):y + 7, max(0, x - 6):x + 7].reshape(-1, 3), axis=0)
    m = np.linalg.norm(a - ref, axis=2) < tol
    m = ndimage.binary_closing(m, iterations=2); lab, n = ndimage.label(m)
    if not whole: return ndimage.binary_fill_holes(lab == lab[y, x])
    return m, lab, n


# hand-traced outlines (crop px, display coords x scale) for styles whose hair touches the head outline all round
POLY = {
    'part': (2.048, [(22, 250), (30, 170), (60, 110), (110, 60), (185, 35), (260, 38), (330, 75), (375, 130), (400, 200), (398, 215), (370, 215), (345, 170), (300, 148), (230, 135), (160, 140), (100, 160), (65, 200), (55, 250)]),
    'spiky': (1.714, [(55, 170), (70, 120), (120, 80), (190, 60), (260, 62), (320, 85), (355, 120), (350, 190), (330, 200), (300, 190), (240, 160), (180, 165), (120, 185), (70, 192)]),
    'greybun': (2.222, [(15, 140), (30, 100), (70, 70), (130, 55), (160, 40), (175, 20), (210, 8), (250, 15), (265, 40), (260, 60), (290, 90), (310, 130), (320, 175), (318, 215), (300, 215), (290, 180), (270, 160), (230, 140), (170, 120), (120, 115), (70, 125), (30, 150), (15, 165)]),
    'brownbig': (1.333, [(18, 250), (20, 170), (50, 100), (110, 55), (190, 40), (270, 50), (320, 85), (345, 130), (340, 150), (300, 115), (220, 108), (140, 125), (85, 160), (55, 210), (45, 250)]),
    'blackbob': (1.333, [(80, 140), (85, 100), (110, 70), (150, 55), (200, 55), (240, 70), (265, 100), (275, 140), (275, 190), (260, 200), (250, 160), (235, 140), (190, 130), (140, 135), (110, 150), (100, 200), (85, 200)]),
    'sweep': (0.905, [(55, 150), (65, 110), (100, 70), (160, 45), (240, 42), (310, 62), (350, 100), (368, 150), (368, 215), (350, 215), (300, 170), (260, 152), (170, 148), (100, 150), (70, 160)]),
}


def poly_mask(shape, k, pts):
    from PIL import ImageDraw
    im = Image.new('L', (shape[1], shape[0]), 0); ImageDraw.Draw(im).polygon([(x * k, y * k) for x, y in pts], fill=255); return np.asarray(im) > 0


def main(d):
    d = Path(d); out = {}
    for n, (f, hs, fs, tol) in CUTS.items():
        a = np.asarray(Image.open(d / f).convert('RGB')).astype(np.float32)
        face = region(a, fs, 38); fy, fx = np.where(face)
        # the hair: every hair-coloured component above the eyes (strands split by ink lines are separate components)
        m, lab, k = region(a, hs, tol, whole=True); m &= a.mean(2) > 0.62 * a[hs[1], hs[0]].mean(); lab, k = ndimage.label(m); sizes = ndimage.sum(m, lab, range(1, k + 1)); cy = ndimage.center_of_mass(m, lab, range(1, k + 1))
        hair = np.isin(lab, [i + 1 for i in range(k) if sizes[i] > 300 and cy[i][0] < fs[1] - 20]) & ~face
        hair = ndimage.binary_dilation(hair, iterations=1) & ~face
        lab2, k2 = ndimage.label(ndimage.binary_dilation(hair, iterations=6)); hair &= lab2 == lab2[hs[1], hs[0]]   # the cluster around the seed only
        hy = np.where(hair)[0]; ymax = hy.max() if len(hy) else a.shape[0] - 5
        if not len(hy): hair = np.zeros_like(hair); hair[hs[1], hs[0]] = True
        lum = a.mean(2); dark = lum < 95
        ink = ndimage.binary_dilation(hair, iterations=7) & dark; ink[ymax + 4:] = False
        keep = ndimage.binary_closing(hair | ink, iterations=2); keep[ymax + 4:] = False; keep &= ~face | hair
        keep = ndimage.binary_fill_holes(keep) & ~(face & ~hair & ~ink)
        lab3, _ = ndimage.label(keep); keep = lab3 == lab3[hs[1], hs[0]]
        if n in POLY:   # traced outline minus the skin inside it
            skin = np.linalg.norm(a - np.median(a[fs[1] - 6:fs[1] + 7, fs[0] - 6:fs[0] + 7].reshape(-1, 3), axis=0), axis=2) < 70
            bg = np.zeros(skin.shape, bool)
            for bx, by in ([(6, 6), (a.shape[1] - 7, 6)] if n in ('sweep', 'greybun') else []): bg |= np.linalg.norm(a - a[by, bx], axis=2) < 55   # the wall behind the hair
            keep = poly_mask(a.shape, *POLY[n]) & ~ndimage.binary_opening(skin, iterations=2) & ~bg
            if n == 'blackbob': keep &= a.mean(2) < 165   # the cream shelves behind her
            if n == 'greybun': keep &= ~((a.mean(2) > 110) & (a[..., 2] > a[..., 0] + 15))   # the lilac glare behind her
            if n == 'spiky': keep &= ~((a[..., 2] > a[..., 0] + 25) & (a.mean(2) > 60))   # the blue night sky between the spikes (the ink is dark, kept)
            keep = ndimage.binary_opening(keep, iterations=1); lab3, _ = ndimage.label(keep); sz = ndimage.sum(keep, lab3, range(1, lab3.max() + 1)); keep = lab3 == (np.argmax(sz) + 1)
        fw = ndimage.binary_fill_holes(region(a, fs, 62)); ws = fw.sum(1); r = int(np.argmax(ws)); xs_ = np.where(fw[r])[0]   # the head disc's widest row
        headW = xs_.max() - xs_.min() + 14; headCx = (xs_.max() + xs_.min()) / 2
        alpha = ndimage.gaussian_filter(keep.astype(np.float32), 0.8)
        rgba = np.dstack([a, alpha * 255]).astype(np.uint8)
        ys, xs = np.where(keep); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        cut = rgba[y0:y1, x0:x1]; Image.fromarray(cut, 'RGBA').save(ROOT / 'png' / f'hair_rk_{n}.png')
        al = keep[y0:y1, x0:x1]; h, w = al.shape; mid = al[:, int(w * 0.45):int(w * 0.55)]
        hl = []
        for col in mid.T:
            top = np.argmax(col); gap = np.argmax(~col[top:]); hl.append((top + gap) / h if gap else 1.0)
        out[f'rk_{n}'] = [f'hair_rk_{n}', round(float((x1 - x0) / headW), 3), round(float(np.median(hl)), 3), round(float(((x0 + x1) / 2 - headCx) / headW), 3)]
        print(n, w, h, out[f'rk_{n}'])
    json.dump(out, open(ROOT / '_rk_hair_cut.json', 'w'), indent=0)


if __name__ == '__main__':
    main(sys.argv[1])
