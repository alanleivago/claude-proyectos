# gentle.py: the character shots on a FINER grid than native.py (480x268 = 4 screen px a cell instead of 8), so faces and
# expressions read (user: the coarse pass made faces unreadable). From the Flow original: luma box-sampled per cell,
# ink lines protected with a per-cell minimum (thin dark lines never average away), a slight gamma (1.2), lit skin kept
# the approved FLAT tones (flat4: black, dark grey, mid grey, white; no dither anywhere, user).
# Then the per-image fixes that prep.py made on the coarse layers are re-applied at this scale.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
GW, GH = 480, 268
NAMES = ['d1_mass', 'd2_imprint', 'f09_pilot', 'f09_pilot_b', 'd3_out', 'd4_draft', 'd5_smile', 'f24_q']
def gentle(src, ink=0.16, levels=(0.13, 0.33, 0.72), salt=True, clean=True, comp=True):
    """flat4 tones (black / 56 / 142 / 253, flat areas, NO dither) on the finer grid; a cell whose darkest pixel is ink
    (a line) and whose mean is mid-light goes black, so thin lines on faces and hands survive"""
    im = Image.open(src).convert('L'); W0, H0 = im.size
    a = np.asarray(im).astype(float) / 255
    ys = (np.arange(GH + 1) * H0 / GH).astype(int); xs = (np.arange(GW + 1) * W0 / GW).astype(int)
    # the cell value: the median of its centre (as native.py samples), so JPEG ringing and hatching don't grey it out
    L = np.zeros((GH, GW))
    for j in range(GH):
        y0, y1 = ys[j], ys[j + 1]; yc0, yc1 = y0 + (y1 - y0) // 4, y1 - (y1 - y0) // 4
        row = a[yc0:max(yc0 + 1, yc1)]
        for i in range(GW):
            x0, x1 = xs[i], xs[i + 1]; L[j, i] = np.median(row[:, x0 + (x1 - x0) // 4:max(x0 + (x1 - x0) // 4 + 1, x1 - (x1 - x0) // 4)])
    mn = np.minimum.reduceat(np.minimum.reduceat(a, ys[:-1], axis=0), xs[:-1], axis=1)
    Lraw = L.copy()
    if comp:   # one smooth highlight shoulder: identity below 0.45, 1.0 -> 0.70 (continuous slope at the knee)
        k_ = 3.0; hi = L > 0.45
        L = np.where(hi, 0.45 + 0.25 * (1 - np.exp(-k_ * (L - 0.45) / 0.55)) / (1 - np.exp(-k_)), L)
    out = np.where(L < levels[0], 0, np.where(L < levels[1], 56, np.where(L < levels[2], 142, 253)))
    line = (mn < ink) & (L >= levels[1]) & (L < 0.9)
    lab, k = ndimage.label(line)   # only thin strokes: blobs of line cells wider than 3 cells in both directions are tone, not line
    if k:
        sl = ndimage.find_objects(lab); keep = np.zeros(k + 1, bool)
        for q, s_ in enumerate(sl): keep[q + 1] = min(s_[0].stop - s_[0].start, s_[1].stop - s_[1].start) <= 3 or (line[s_].mean() < 0.35)
        line = keep[lab] & line
    out[line] = 0
    # Flow's halftone dots (shadows on faces, wall textures) land on the grid as a black/white checker = dither, which the
    # user rejects: where such speckle is dense, the cells take the flat tone of their 5x5 mean (no dither anywhere)
    # finer halftone than the cells (Flow's shaded water, silt and walls) lands as scattered grey/black salt: where most
    # cells in a 7x7 differ from most of their 8 neighbours, the cell takes its 5x5 median (dark areas only)
    P = np.pad(out, 1, mode='edge')
    dif = sum((P[1 + dy:1 + dy + out.shape[0], 1 + dx:1 + dx + out.shape[1]] != out).astype(int) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    salt_m = ndimage.uniform_filter((dif >= 5).astype(float), 7) >= 0.4
    md = ndimage.median_filter(out, 5)
    if salt and clean: out = np.where(salt_m & (md <= 56), md, out)   # only in the dark (water, walls): light detail like teeth or veins stays
    # lone specks (round 3: "remove the leftover speckle"): a cell with at most one 8-neighbour of its own tone takes the
    # tone most of its neighbours have; twice, so pairs of specks go too. Lines (2+ same neighbours) are kept.
    for _ in range(2 if clean else 0):
        P = np.pad(out, 1, mode='edge'); nbr = [P[1 + dy:1 + dy + out.shape[0], 1 + dx:1 + dx + out.shape[1]] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx]
        same = sum((q == out).astype(int) for q in nbr)
        cnt = np.stack([sum((q == t).astype(int) for q in nbr) for t in (0, 56, 142, 253)]); mode = np.array([0, 56, 142, 253])[cnt.argmax(0)]
        out = np.where((same <= 1) & (mode <= out), mode, out)   # only ever darker (user: no pass may raise brightness)
        # checker cells (unlike all 4 sides, like 3+ diagonals; diagonal lines have only 2): the tone of their sides
        P = np.pad(out, 1, mode='edge'); orth = [P[1 + dy:1 + dy + out.shape[0], 1 + dx:1 + dx + out.shape[1]] for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1))]
        diag = [P[1 + dy:1 + dy + out.shape[0], 1 + dx:1 + dx + out.shape[1]] for dy, dx in ((-1, -1), (1, 1), (-1, 1), (1, -1))]
        s4 = sum((q == out).astype(int) for q in orth); sd = sum((q == out).astype(int) for q in diag)
        c4 = np.stack([sum((q == t).astype(int) for q in orth) for t in (0, 56, 142, 253)]); m4 = np.array([0, 56, 142, 253])[c4.argmax(0)]
        out = np.where((s4 == 0) & (sd >= 3) & (m4 <= out), m4, out)
    # tone step (user, round 6: "white is ONLY for what is truly white"): these Flow sources draw lit skin, flesh and pale
    # surfaces as flat paper white (1.0), where the bells sources sat at 0.6-0.7 (bells' approved faces land on mid grey).
    # A LARGE white area (a face, a membrane, a wall) steps down to mid grey and the mid grey shading around and inside it
    # steps down to dark grey, keeping the light/shade split; small whites stay white (eye whites, glints, lamps, teeth).
    # round 9 (user: 'vitiligo' faces): NO area-based tone step. The cell values were compressed BEFORE quantizing (one
    # smooth global highlight curve, paper white 1.0 -> 0.70, the bells source range), so a whole face lands uniformly on
    # light/mid grey with its own shading. White comes back only for true speculars and outlines, judged on the RAW value:
    # tiny white spots (<= 6 cells: eye glints, lamps, screens' sparkle) and thin white lines lying against black (Flow's
    # outline round a figure on a dark ground). Thin whites on skin (streaks) stay grey.
    if comp:
        rw = Lraw >= levels[2]; lab, k = ndimage.label(rw)
        small = np.isin(lab, 1 + np.where(ndimage.sum(rw, lab, range(1, k + 1)) <= 6)[0]) if k else rw
        core = ndimage.binary_dilation(ndimage.binary_erosion(rw, np.ones((3, 3), bool)), np.ones((3, 3), bool))
        P = np.pad(out == 0, 1); nb0 = sum(P[1 + dy:1 + dy + GH, 1 + dx:1 + dx + GW].astype(int) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
        out = np.where(rw & (small | (~core & (nb0 >= 3))), 253, out)
    return out.astype(np.uint8)
for n in (sys.argv[1:] or NAMES):
    v = gentle(D + f'gen/{n}.jpg', salt=n != 'd4_draft', clean=n != 'd3_out', comp=n not in ('b05_lights',))   # b05: its lamp is truly white   # d4: the cheek teeth sit in shadow, the salt pass ate them
    if n == 'f24_base':   # (round 1 reveal, superseded)
        pass
    if n == 'f24_base': v = gentle(D + f'gen/{n}.jpg', levels=(0.13, 0.33, 0.52))   # the copied face: skin (0.61) waxy white, cabin (0.21) dark grey
    if n in ('b12_stillsc', 'b26_shut'):   # round 7: hard blotches (thresholded wood/cork/ceiling texture) -> the local majority tone
        for _ in range(3):
            P = np.pad(v, 1, mode='edge'); nbr = [P[1 + dy:1 + dy + GH, 1 + dx:1 + dx + GW] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx]
            same = sum((q == v).astype(int) for q in nbr)
            cnt = np.stack([sum((q == t).astype(int) for q in nbr) for t in (0, 56, 142, 253)]); mode = np.array([0, 56, 142, 253])[cnt.argmax(0)]
            v = np.where((same <= 2) & (v != 0), mode, v).astype(np.uint8)
    if n == 'b05_lights':   # round 7: Flow's beams (a blocky gradient polygon) blanked to black; the beam is drawn in code
        from PIL import ImageDraw
        pm = Image.new('L', (GW, GH)); ImageDraw.Draw(pm).polygon([(x * GW / 1376, y * GH / 768) for x, y in
            [(612, 300), (1376, 290), (1376, 720), (505, 575), (515, 520), (612, 488)]], fill=255)
        v[np.asarray(pm) > 0] = 0
    if n == 'd5_smile':   # Flow lit the water with sun rays (impossible at 10 km, and halftone): outside the figure, black
        from PIL import ImageDraw
        pm = Image.new('L', (GW, GH)); ImageDraw.Draw(pm).polygon([(x * GW / 1376, y * GH / 768) for x, y in
            [(560, 40), (820, 40), (860, 300), (830, 450), (1000, 560), (1130, 640), (1180, 768), (220, 768), (280, 640), (420, 560), (560, 450), (520, 300)]], fill=255)
        v[np.asarray(pm) == 0] = 0
        yy_, xx_ = np.mgrid[:GH, :GW]; ray = (v == 142) & (yy_ < 450 * GH / 768) & ((xx_ < 590 * GW / 1376) | (xx_ > 810 * GW / 1376) | (yy_ < 110 * GH / 768))
        v[ray] = 0   # the rays around the head
    if n == 'd1_mass':   # the lit silt came out as white as the membrane (both ~0.82): the silt oval goes mid grey so the
        # pale flesh is the brightest thing in the frame (cells left of / under the membrane's edge, traced in Flow px)
        from PIL import ImageDraw
        pm = Image.new('L', (GW, GH)); ImageDraw.Draw(pm).polygon([(x * GW / 1376, y * GH / 768) for x, y in
            [(0, 280), (650, 280), (640, 450), (700, 520), (880, 560), (1120, 690), (1376, 560), (1376, 768), (0, 768)]], fill=255)
        v[(np.asarray(pm) > 0) & (v == 253)] = 142
    Image.fromarray(np.dstack([v, v, v, np.full_like(v, 255)]), 'RGBA').save(D + f'assets/{n}.png'); print(n, v.shape)
