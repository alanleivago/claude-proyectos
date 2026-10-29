# lost-second thumbnails in the user's own Madfable thumbnail style (refs: Ref .../ref miniaturas, rules in
# fuentes/urbn-theory/thumbs/madfable-thumb-rules.md). Base = r7's look: the subway in red and black, the man cut out in
# the film's black and white. The keyed frame overlay (borde encima.jpeg) goes on top of every one.
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from collections import deque
from scipy.ndimage import binary_fill_holes, binary_dilation, gaussian_filter
P = '/Users/alanleiva/claude-proyectos/pieces/lost-second/'; OUT = P + 'thumbs/'; FD = '/Users/alanleiva/claude-proyectos/fonts/'
IMPACT = '/System/Library/Fonts/Supplemental/Impact.ttf'; DIN = '/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf'
SERIF = FD + 'thatthatnewpixelfamilytest-square.otf'; KANJI = FD + 'Nosutaru-dotMPlusH-10-Regular.ttf'
ACCENT = (232, 28, 44)                                            # the refs' bright red for the small second line
a = np.array(Image.open(P + 'assets/man_close.png').convert('L')); H, W = a.shape
wall = a > 200; wall[100:, 142:] = True
m = np.zeros_like(wall); q = deque([(100, 105), (30, 150)])
for s in q: m[s] = True
while q:
    y, x = q.popleft()
    for yy, xx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)):
        if 0 <= yy < H and 0 <= xx < W and not m[yy, xx] and not wall[yy, xx]: m[yy, xx] = True; q.append((yy, xx))
m = binary_fill_holes(m); ring = binary_dilation(m) & ~m & (a > 200)
def lut(img, cmap):
    out = np.zeros(img.shape + (3,), np.uint8)
    for v, c in cmap.items(): out[img == v] = c
    return out
BW = {0: [0, 0, 0], 71: [26, 26, 26], 142: [91, 91, 91], 253: [253, 253, 253]}
DUO = {0: [0, 0, 0], 71: [22, 0, 2], 142: [70, 0, 6], 253: [166, 1, 14]}
DARK = {0: [0, 0, 0], 71: [16, 0, 2], 142: [45, 0, 4], 253: [110, 0, 9]}
full = np.hstack([a, a[:, 192:240]]); FW = full.shape[1]; FIG = np.zeros(full.shape, bool); FIG[:, :W] = m | ring
def scene(bg=DUO):   # the background in bg colours, the man in black and white
    rgb = lut(full, bg); rgb[FIG] = lut(full, BW)[FIG]; return rgb
def crop(rgb, k, x0, y0): return Image.fromarray(rgb).resize((FW * k, H * k), Image.NEAREST).crop((x0, y0, x0 + 1280, y0 + 720))
def grain(im, amt=10, seed=3):   # the refs' fine film grain (mono, deterministic)
    n = np.random.default_rng(seed).normal(0, amt, (720, 1280, 1)); return Image.fromarray(np.clip(np.array(im).astype(float) + n, 0, 255).astype(np.uint8))
# ---- pixel text: a real font drawn small, thresholded (no anti-aliasing), scaled up nearest
def pixmask(txt, font, size, k, thr=110, bold=False):
    ft = ImageFont.truetype(font, size); w = int(ft.getlength(txt)) + 8; h = int(size * 1.35) + 4
    mk = Image.new('L', (w, h), 0); ImageDraw.Draw(mk).text((4, 2), txt, font=ft, fill=255)
    arr = np.array(mk) > thr; ys, xs = np.where(arr); arr = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]   # trim to the ink
    if bold: arr = np.pad(arr, ((0, 0), (0, 1))); arr = arr | np.roll(arr, 1, axis=1)   # one more cell on every vertical stroke
    return np.kron(arr, np.ones((k, k), bool))
def put(im, mask, x, y, col=(253, 253, 253), anchor='lt', glow=0, shadow=0, outline=0):
    """glow: a soft pixel-blurred white halo (the refs' OBSESSION look); shadow: a soft dark halo under it;
    outline: a thin crisp black edge in px"""
    h, w = mask.shape
    if anchor[0] == 'c': x -= w // 2
    if anchor[0] == 'r': x -= w
    if anchor[1] == 'b': y -= h
    base = np.array(im).astype(float)
    def layer(alpha, colour):
        A = np.zeros((720, 1280)); y0, x0 = max(0, y), max(0, x); y1, x1 = min(720, y + alpha.shape[0]), min(1280, x + alpha.shape[1])
        A[y0:y1, x0:x1] = alpha[y0 - y:y1 - y, x0 - x:x1 - x]
        base[:] = base * (1 - A[..., None]) + np.array(colour, float) * A[..., None]
    if shadow or glow:
        pad = 40; big = np.pad(mask.astype(float), pad)
        if shadow: s = gaussian_filter(big, shadow); x -= pad; y -= pad; layer(np.clip(s * 1.3, 0, 0.85), (0, 0, 0)); x += pad; y += pad
        if glow:   # pixelated blur: blurred at 1/6 size, scaled back up nearest
            small = np.array(Image.fromarray((big * 255).astype(np.uint8)).resize((big.shape[1] // 6, big.shape[0] // 6), Image.BILINEAR)) / 255
            g = gaussian_filter(small, glow); g = np.kron(g, np.ones((6, 6)))[: big.shape[0], : big.shape[1]]
            x -= pad; y -= pad; layer(np.clip(g * 1.1, 0, 0.75), (235, 235, 235)); x += pad; y += pad
    if outline:
        o = binary_dilation(np.pad(mask, outline), np.ones((2 * outline + 1, 2 * outline + 1), bool)).astype(float)
        x -= outline; y -= outline; layer(o, (0, 0, 0)); x += outline; y += outline
    layer(mask.astype(float), col)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
SPIRAL = np.array(Image.open('/Users/alanleiva/claude-proyectos/Ref 1 bit pixelated junji ito madfable/madfable icono perfil.png').getchannel('A').resize((24, 24), Image.BILINEAR)) > 90   # the logo is drawn in the alpha
BORDER = Image.open(OUT + 'border_1280.png')
def finish(im, name):
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made.append(name)
made = []
# m1: r7's face crop, OBSESSION-style word with the pixel glow low across the face, a red kanji line above it
im = grain(crop(scene(), 14, 1700, 160))
im = put(im, pixmask('残り一歩', KANJI, 20, 5, bold=True), 1180, 140, (253, 253, 253), 'rt', outline=5)   # white on the red side (red on red vanished)
im = put(im, pixmask('ONE LEFT', IMPACT, 30, 7), 640, 650, anchor='cb', glow=2.2, shadow=10)
finish(im, 'm1_face_oneleft')
# m2: the man right (r4 framing), the channel's pixel serif huge at the top left, like "5 hours"
im = grain(crop(scene(), 6, 0, 30))
im = put(im, pixmask('the lost', SERIF, 32, 5), 60, 50, outline=4)
im = put(im, pixmask('second', SERIF, 32, 5), 60, 230, outline=4)
finish(im, 'm2_right_serif')
# m3: centred (r6 framing), the quoted words in white boxes around him, the big glowing word across his body
im = grain(crop(scene(), 7, 480, 0))
for txt, x, y in (('"TICK', 70, 250), ('TICK', 330, 290), ('TICK', 850, 290), ('TICK"', 1090, 250)):
    mk = pixmask(txt, IMPACT, 22, 3); h, w = mk.shape
    box = np.ones((h + 24, w + 24), bool); im = put(im, box, x - 12, y - 12, (0, 0, 0)); im = put(im, mk, x, y)
im = put(im, pixmask('ONE STEP', IMPACT, 30, 7), 640, 640, anchor='cb', glow=2.2, shadow=10)
finish(im, 'm3_center_tick')
# m4: plain black and white like the OBSESSION ref (no red background): the face, the word, the red kanji + spiral
im = grain(crop(scene(BW), 14, 1700, 160), 8)
k = pixmask('失われた一秒', KANJI, 20, 5, bold=True); im = put(im, k, 1060, 120, ACCENT, 'rt', outline=5)
im = put(im, np.kron(SPIRAL, np.ones((5, 5), bool)), 1080, 120 + (k.shape[0] - 120) // 2, ACCENT, outline=5)
im = put(im, pixmask('ONE LEFT', IMPACT, 30, 7), 640, 650, anchor='cb', glow=1.6, shadow=16, outline=4)
finish(im, 'm4_bw_face_kanji')
# m5: wide, like JUNJI ITO STYLE + FEARS TO FATHOM: the pixel serif across the bottom, a red condensed line under it
im = grain(crop(scene(DARK), 6, 0, 30))
im = put(im, pixmask('THE LOST SECOND', SERIF, 32, 4), 640, 440, anchor='ct', outline=4)
im = put(im, pixmask('THERE IS ONE LEFT', DIN, 16, 5), 640, 660, ACCENT, 'cb', outline=4)
finish(im, 'm5_wide_serif_red')
# m6: the darker red face crop, kanji big in red as the title, one small white word
im = grain(crop(scene(DARK), 14, 1700, 160))
im = put(im, pixmask('失われた一秒', KANJI, 20, 6, bold=True), 1220, 150, ACCENT, 'rt', outline=5)
im = put(im, pixmask('THE LOST SECOND', IMPACT, 22, 4), 1220, 330, anchor='rt', shadow=6, outline=4)
finish(im, 'm6_dark_kanji_title')
sheet = Image.new('RGB', (2 * 1000 + 10, 3 * 380 + 10), (40, 40, 40))
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); cx, cy = 10 + (i % 2) * 1000, 10 + (i // 2) * 380
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
sheet.save(OUT + 'sheet_m.png'); print(made)
