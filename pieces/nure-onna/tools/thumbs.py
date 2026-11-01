# thumbs.py: Nure-onna thumbnails, 1280x720, in the user's Madfable thumbnail style (rules:
# fuentes/urbn-theory/thumbs/madfable-thumb-rules.md). Background in red+black duotone, the creature cut out in black and
# white, ONE vertical white column of kanji in the 'bold20' Nosutaru render, the keyed 'borde encima' frame on top.
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import binary_dilation, gaussian_filter
P = '/Users/alanleiva/claude-proyectos/pieces/nure-onna/'; OUT = P + 'thumbs/'; FD = '/Users/alanleiva/claude-proyectos/fonts/'
IMPACT = '/System/Library/Fonts/Supplemental/Impact.ttf'; SERIF = FD + 'thatthatnewpixelfamilytest-square.otf'; KANJI = FD + 'Nosutaru-dotMPlusH-10-Regular.ttf'
ACCENT = (232, 28, 44)
BORDER = Image.open('/Users/alanleiva/claude-proyectos/pieces/lost-second/thumbs/border_1280.png')
LEFT_IN, TOP_IN, BOT_IN, RIGHT_IN = 32, 28, 692, 1248
DUO = {0: (0, 0, 0), 142: (70, 0, 6), 253: (166, 1, 14)}; BW = {0: (0, 0, 0), 142: (91, 91, 91), 253: (253, 253, 253)}
def lut(a, cmap):
    o = np.zeros(a.shape + (3,), np.uint8)
    for v, c in cmap.items(): o[a == v] = c
    return o
def layer(name, cmap):
    im = np.asarray(Image.open(P + 'assets/' + name).convert('RGBA')); return lut(im[..., 0], cmap), im[..., 3] > 0
def place(canvas, rgb, alpha, k, x, y):   # nearest-neighbour k x, pasted at (x, y) where alpha
    big = np.kron(rgb, np.ones((k, k, 1), np.uint8)); A = np.kron(alpha, np.ones((k, k), bool))
    h, w = A.shape; y0, x0 = max(0, y), max(0, x); y1, x1 = min(720, y + h), min(1280, x + w)
    sl = A[y0 - y:y1 - y, x0 - x:x1 - x]; canvas[y0:y1, x0:x1][sl] = big[y0 - y:y1 - y, x0 - x:x1 - x][sl]
def grain(a, amt=9, seed=3): return np.clip(a.astype(float) + np.random.default_rng(seed).normal(0, amt, (720, 1280, 1)), 0, 255).astype(np.uint8)
def pixmask(txt, font, size, k, thr=110, bold=False):
    ft = ImageFont.truetype(font, size); w = int(ft.getlength(txt)) + 8; h = int(size * 1.35) + 4
    mk = Image.new('L', (w, h), 0); ImageDraw.Draw(mk).text((4, 2), txt, font=ft, fill=255)
    arr = np.array(mk) > thr; ys, xs = np.where(arr); arr = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    if bold: arr = np.pad(arr, ((0, 0), (0, 1))); arr = arr | np.roll(arr, 1, axis=1)
    return np.kron(arr, np.ones((k, k), bool))
def put(base, mask, x, y, col=(253, 253, 253), anchor='lt', glow=0, shadow=0, outline=0):
    h, w = mask.shape
    if anchor[0] == 'c': x -= w // 2
    if anchor[0] == 'r': x -= w
    if anchor[1] == 'b': y -= h
    base = base.astype(float)
    def lay(alpha, colour, x, y):
        A = np.zeros((720, 1280)); y0, x0 = max(0, y), max(0, x); y1, x1 = min(720, y + alpha.shape[0]), min(1280, x + alpha.shape[1])
        A[y0:y1, x0:x1] = alpha[y0 - y:y1 - y, x0 - x:x1 - x]; base[:] = base * (1 - A[..., None]) + np.array(colour, float) * A[..., None]
    pad = 40
    if shadow: lay(np.clip(gaussian_filter(np.pad(mask.astype(float), pad), shadow) * 1.3, 0, 0.85), (0, 0, 0), x - pad, y - pad)
    if glow:
        big = np.pad(mask.astype(float), pad); sm = np.array(Image.fromarray((big * 255).astype(np.uint8)).resize((big.shape[1] // 6, big.shape[0] // 6), Image.BILINEAR)) / 255
        g = np.kron(gaussian_filter(sm, glow), np.ones((6, 6)))[:big.shape[0], :big.shape[1]]; lay(np.clip(g * 1.1, 0, 0.75), (235, 235, 235), x - pad, y - pad)
    if outline:
        o = binary_dilation(np.pad(mask, outline), np.ones((2 * outline + 1,) * 2, bool)).astype(float); lay(o, (0, 0, 0), x - outline, y - outline)
    lay(mask.astype(float), col, x, y); return np.clip(base, 0, 255).astype(np.uint8)
def kanji_column(base, text, cx, top=None, k=6, gap=10):   # ONE vertical white column, bold20
    gl = [pixmask(ch, KANJI, 20, k, bold=True) for ch in text]; cell = 20 * k; total = len(gl) * cell + (len(gl) - 1) * gap
    top = (TOP_IN + BOT_IN - total) // 2 if top is None else top
    for j, g in enumerate(gl): base = put(base, g, cx - g.shape[1] // 2, top + j * (cell + gap) + (cell - g.shape[0]) // 2, outline=5)
    return base
made = []
def finish(a, name):
    im = Image.fromarray(grain(a)).convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made.append(name)
bgrev, _ = layer('reveal.png', DUO); bgsea, _ = layer('seaplate.png', DUO)
nure, na = layer('nureS_wide.png', BW)
def bg(src, k, x, y):
    c = np.zeros((720, 1280, 3), np.uint8); place(c, src, np.ones(src.shape[:2], bool), k, x, y); return c
# t1: the creature big on the right over the red sea, kanji column left, DON'T in Impact with the pixel glow
c = bg(bgrev, 6, -330, -420); place(c, nure, na, 6, 520, -120)
c = kanji_column(c, '濡女', 200)
c = put(c, pixmask("DON'T", IMPACT, 30, 7), 420, 650, anchor='cb', glow=2.2, shadow=10)
finish(c, 't1_right_dont')
# t2: centred head, the pixel serif title at the top, kanji column at the left edge, the red line under the title
c = bg(bgrev, 6, -170, -350); place(c, nure, na, 6, 238, -40)
c = kanji_column(c, '濡女', 140)
c = put(c, pixmask('nure-onna', SERIF, 32, 4), 640, 40, anchor='ct', outline=4)
c = put(c, pixmask("DON'T HOLD HER BABY", IMPACT, 16, 4), 640, 680, ACCENT, 'cb', outline=4)
finish(c, 't2_center_serif')
# t3: tight on the face (eyes and the slit), kanji column right, HER BABY low
c = bg(bgrev, 7, -300, -500); place(c, nure, na, 10, -110, -560)
c = kanji_column(c, '濡女', 1110, k=5)
c = put(c, pixmask('HER BABY', IMPACT, 30, 6), 560, 685, anchor='cb', glow=1.6, shadow=14, outline=5)
finish(c, 't3_face_baby')
sheet = Image.new('RGB', (1000 + 10, 3 * 380 + 10), (40, 40, 40))
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); sheet.paste(im.resize((640, 360), Image.LANCZOS), (10, 10 + i * 380)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (660, 10 + i * 380))
sheet.save(OUT + 'sheet.png'); print(made)
