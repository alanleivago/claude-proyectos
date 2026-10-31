# bells thumbnails. Two sets:
#  M (Madfable m2c rule, lost-second's chosen look): red-black duotone background, the subject (the cloud face with the
#    skin-eyes) kept in the film's black and white, ONE white vertical kanji column centred between the frame and the
#    subject (Nosutaru dot at 20 px with a bold pass = "bold20"), border overlay on top.
#  W (World of Horror search results): pure 1-bit high contrast, an extreme off-centre close-up cropped by the frame,
#    our own stamp-like title block (big kanji in a white box with a black border, slightly tilted, a small spaced
#    uppercase English line under it), at most one red accent.
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import binary_dilation, gaussian_filter
P = '/Users/alanleiva/claude-proyectos/pieces/bells/'; OUT = P + 'thumbs/'; FD = '/Users/alanleiva/claude-proyectos/fonts/'
KANJI = FD + 'Nosutaru-dotMPlusH-10-Regular.ttf'; IMPACT = '/System/Library/Fonts/Supplemental/Impact.ttf'
ACCENT = (232, 28, 44)
BORDER = Image.open('/Users/alanleiva/claude-proyectos/pieces/lost-second/thumbs/border_1280.png')
BW = {0: [0, 0, 0], 56: [30, 30, 30], 142: [128, 128, 128], 253: [253, 253, 253]}
DUO = {0: [0, 0, 0], 56: [24, 0, 2], 142: [80, 0, 7], 253: [166, 1, 14]}
ONE = {0: [0, 0, 0], 56: [0, 0, 0], 142: [120, 120, 120], 253: [255, 255, 255]}   # the WoH look: harder
def lut(img, cmap):
    out = np.zeros(img.shape + (3,), np.uint8)
    for v, c in cmap.items(): out[img == v] = c
    return out
def nat(name): return np.array(Image.open(P + 'assets/' + name).convert('L'))
def crop(rgb, k, x0, y0):
    h, w = rgb.shape[:2]; return Image.fromarray(rgb).resize((w * k, h * k), Image.NEAREST).crop((x0, y0, x0 + 1280, y0 + 720))
def grain(im, amt=9, seed=3):
    n = np.random.default_rng(seed).normal(0, amt, (720, 1280, 1)); return Image.fromarray(np.clip(np.array(im).astype(float) + n, 0, 255).astype(np.uint8))
def halftone(im, cell=6):   # dot-screen the greys (the WoH thumbnails' halftone shading); black and white stay flat
    a = np.array(im.convert('L')).astype(float); out = np.array(im).copy()
    yy, xx = np.mgrid[0:720, 0:1280]; d = np.hypot((xx % cell) - cell / 2, (yy % cell) - cell / 2) / (cell / 2)
    mid = (a > 40) & (a < 215); dot = d < (1 - a / 255) * 1.3
    out[mid & dot] = 0; out[mid & ~dot] = 255
    return Image.fromarray(out)
def pixmask(txt, font, size, k, thr=110, bold=False):
    ft = ImageFont.truetype(font, size); w = int(ft.getlength(txt)) + 8; h = int(size * 1.35) + 4
    mk = Image.new('L', (w, h), 0); ImageDraw.Draw(mk).text((4, 2), txt, font=ft, fill=255)
    arr = np.array(mk) > thr; ys, xs = np.where(arr); arr = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    if bold: arr = np.pad(arr, ((0, 0), (0, 1))); arr = arr | np.roll(arr, 1, axis=1)
    return np.kron(arr, np.ones((k, k), bool))
def put(im, mask, x, y, col=(253, 253, 253), anchor='lt', outline=0):
    h, w = mask.shape
    if anchor[0] == 'c': x -= w // 2
    if anchor[0] == 'r': x -= w
    base = np.array(im.convert('RGB')).astype(float)
    def layer(alpha, colour, x, y):
        A = np.zeros((720, 1280)); y0, x0 = max(0, y), max(0, x); y1, x1 = min(720, y + alpha.shape[0]), min(1280, x + alpha.shape[1])
        if y1 > y0 and x1 > x0: A[y0:y1, x0:x1] = alpha[y0 - y:y1 - y, x0 - x:x1 - x]
        base[:] = base * (1 - A[..., None]) + np.array(colour, float) * A[..., None]
    if outline:
        o = binary_dilation(np.pad(mask, outline), np.ones((2 * outline + 1, 2 * outline + 1), bool)).astype(float); layer(o, (0, 0, 0), x - outline, y - outline)
    layer(mask.astype(float), col, x, y)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
made = []
def finish(im, name):
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made.append(name)

# ---- M set: the cloud face with its skin-eyes (assets/face_open.png = eyes_O4), the face in B&W, everything else duotone
F = nat('face_open.png'); H, W = F.shape
yy, xx = np.mgrid[0:H, 0:W]; FACE = ((xx - 121) / 31.0) ** 2 + ((yy - 45) / 44.0) ** 2 < 1   # the face oval (native cells)
def scene(img, mask, bg=DUO):
    rgb = lut(img, bg); rgb[mask] = lut(img, BW)[mask]; return rgb
K, X0, Y0 = 8, 120, 0                               # the face right of centre
LEFT_IN, TOP_IN, BOT_IN = 32, 28, 692
def column(im, text, figleft, margin=40, gap=10, size=20):
    n = len(text); avail = BOT_IN - TOP_IN - 2 * margin; k = min(7, max(1, (avail // n - gap) // size)); cell = size * k
    total = n * cell + (n - 1) * gap; top = (TOP_IN + BOT_IN - total) // 2; cx = (LEFT_IN + figleft - 12) // 2
    for j, ch in enumerate(text):
        g = pixmask(ch, KANJI, size, k, bold=True); h, w = g.shape; im = put(im, g, cx - w // 2, top + j * (cell + gap) + (cell - h) // 2, outline=5)
    return im
figleft = (121 - 31) * K - X0
for i, text in enumerate(('眠る鐘', '鐘を鳴らせ', '目覚め')):
    finish(column(grain(crop(scene(F, FACE), K, X0, Y0)), text, figleft), f'm{i + 1}_duo_kanji')
# m4: centred face, title in the channel's pixel serif across the bottom (rule: 1-3 words, huge)
SERIF = FD + 'thatthatnewpixelfamilytest-square.otf'
im = grain(crop(scene(F, FACE), 8, 320, 0))
im = put(im, pixmask('ring the bell', SERIF, 32, 4), 640, 560, anchor='ct', outline=4)
finish(im, 'm4_duo_center_serif')
# m5: tight crop on the skin-eyes, kanji column left
im = grain(crop(scene(F, FACE), 14, 810, 130))
finish(column(im, '目覚め', (121 - 31) * 14 - 810), 'm5_duo_eyes_kanji')

# ---- W set (World of Horror search look)
def stamp(im, kanji, eng, x, y, k=7, angle=-4, red=False):
    """a stamp-like title block: big bold kanji in a white box with a thick black border, a small spaced English line
    under it, the whole block tilted a few degrees"""
    g = pixmask(kanji, KANJI, 20, k, bold=True); e = pixmask(' '.join(eng), IMPACT, 22, 2) if eng else None
    w = max(g.shape[1], e.shape[1] if e is not None else 0) + 48; h = g.shape[0] + (e.shape[0] + 14 if e is not None else 0) + 44
    blk = Image.new('RGBA', (w + 24, h + 24), (0, 0, 0, 0)); d = ImageDraw.Draw(blk)
    d.rectangle([0, 0, w + 23, h + 23], fill=(0, 0, 0, 255)); d.rectangle([8, 8, w + 15, h + 15], fill=(253, 253, 253, 255))
    a = np.array(blk); gy, gx = 30, 12 + (w - g.shape[1]) // 2
    a[gy:gy + g.shape[0], gx:gx + g.shape[1]][g] = (0, 0, 0, 255)
    if e is not None:
        ey = gy + g.shape[0] + 16; ex = 12 + (w - e.shape[1]) // 2; col = ACCENT if red else (0, 0, 0)
        a[ey:ey + e.shape[0], ex:ex + e.shape[1]][e] = col + (255,)
    blk = Image.fromarray(a).rotate(angle, resample=Image.NEAREST, expand=True)
    im = im.convert('RGBA'); im.alpha_composite(blk, (x, y)); return im.convert('RGB')
FO = nat('face_open.png')
# w1: extreme close-up on the skin-eyes, off-centre (cropped by the right edge), stamp in the empty left
im = halftone(crop(lut(FO, ONE), 16, 1236, 240)); im = stamp(im, '眠る鐘', 'THE SLEEPING BELL', 40, 60)
finish(grain(im, 6), 'w1_eyes_stamp')
# w2: the face cropped by the left edge, stamp right, one red word
im = halftone(crop(lut(FO, ONE), 11, 1000, 0)); im = stamp(im, '鐘', 'BELLS', 900, 70, k=10, angle=3)
im = put(im, pixmask('AWAKE', IMPACT, 30, 5), 1180, 560, ACCENT, 'rt', outline=5)
finish(grain(im, 6), 'w2_face_red_awake')
# w3: the reveal (the village under the eyes), stamp top-right
R = nat('reveal.png'); im = halftone(crop(lut(R, ONE), 7, 200, 40)); im = stamp(im, '眠る鐘', 'IT SEES YOU', 760, 40, k=6, angle=-3)
finish(grain(im, 6), 'w3_reveal_stamp')
# w4: one eye, almost closed, huge (beat 26)
E = nat('b26_sliver.png'); im = halftone(crop(lut(E, ONE), 9, 300, 120)); im = stamp(im, '目覚め', 'NOT ALL THE WAY', 60, 420, k=6, angle=-5, red=True)
finish(grain(im, 6), 'w4_eye_stamp_red')
# w5: the bleeding hands on the rope, stamp left, red line
Hh = nat('b22_hands.png'); im = halftone(crop(lut(Hh, ONE), 6, 120, 40)); im = stamp(im, '鐘を鳴らせ', 'RING IT', 40, 60, k=5, angle=-4, red=True)
finish(grain(im, 6), 'w5_hands_stamp')

# ---- the sheet: each at 640x360 and at 320x180 (the small-size check), sets labelled
sheet = Image.new('RGB', (2 * 1000 + 10, 5 * 390 + 60), (40, 40, 40)); d = ImageDraw.Draw(sheet)
f = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 24)
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); col, row = i % 2, i // 2; cx, cy = 10 + col * 1000, 50 + row * 390
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
    d.text((cx + 650, cy + 190), nm + ('  [Madfable m2c set]' if nm[0] == 'm' else '  [WoH-inspired set]'), fill=(240, 200, 140), font=f)
d.text((10, 10), 'bells thumbnails: m* = Madfable m2c rule (duotone + kanji column), w* = World of Horror search-inspired', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet.png'); print(made)

# ---- W set 2 (w6-w11): a person looking up at the sky in dread (after Urbn.Theory's JW7hg7LNKP0), same WoH treatment
made2 = []
def finish2(im, name):
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made2.append(name)
WO, BO, MO, SH = nat('t_woman_a.png'), nat('t_boy_b.png'), nat('t_monk_b.png'), nat('t_shep_c.png')
# w6: the old woman, extreme close-up cut by the right edge, stamp in the empty sky on the left
im = halftone(crop(lut(WO, ONE), 11, 1080, 60)); im = stamp(im, '眠る鐘', 'THE SLEEPING BELL', 40, 60, k=6, angle=-4)
finish2(grain(im, 6), 'w6_woman_up_stamp')
# w7: the boy, his face left of centre, stamp right, red English line
im = halftone(crop(lut(BO, ONE), 9, 600, 180)); im = stamp(im, '鐘', 'DON\'T LOOK UP', 820, 60, k=10, angle=4, red=True)
finish2(grain(im, 6), 'w7_boy_up_stamp_red')
# w8: the monk below, the cloud face with its skin-eyes above: stamp bottom-left
im = halftone(crop(lut(MO, ONE), 6, 80, 80)); im = stamp(im, '目覚め', 'IT IS AWAKE', 40, 470, k=5, angle=-3)
finish2(grain(im, 6), 'w8_monk_face_above')
# w9: over the shepherd's shoulder, the face leaning down; stamp top-right, one red word
im = halftone(crop(lut(SH, ONE), 6, 160, 0)); im = stamp(im, '眠る鐘', 'BELLS', 900, 40, k=5, angle=3)
im = put(im, pixmask('RING IT', IMPACT, 30, 4), 1230, 560, ACCENT, 'rt', outline=5); finish2(grain(im, 6), 'w9_shepherd_face_red')
# w10: the old woman wider, the swirling sky, the red word big across the empty side
im = halftone(crop(lut(WO, ONE), 7, 340, 60)); im = put(im, pixmask('IT WOKE UP', IMPACT, 30, 5), 60, 520, ACCENT, 'lt', outline=5)
im = stamp(im, '鐘', 'THE BELL STOPPED', 60, 60, k=8, angle=-4); finish2(grain(im, 6), 'w10_woman_red_woke')
# w11: the boy's eyes only, huge, cut top and bottom; stamp bottom-right
im = crop(lut(BO, BW), 6, 160, 0); im = stamp(im, '目覚め', 'NOT ALL THE WAY', 760, 440, k=5, angle=3)
finish2(grain(im, 6), 'w11_boy_eyes_stamp')
sheet = Image.new('RGB', (2 * 1000 + 10, 3 * 390 + 60), (40, 40, 40)); d = ImageDraw.Draw(sheet)
for i, nm in enumerate(made2):
    im = Image.open(OUT + nm + '.png'); col, row = i % 2, i // 2; cx, cy = 10 + col * 1000, 50 + row * 390
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
    d.text((cx + 650, cy + 190), nm, fill=(240, 200, 140), font=f)
d.text((10, 10), 'bells thumbnails 2: w6-w11, World of Horror look, a person looking up at the sky (+ 320x180 check)', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet2.png'); print(made2)

# ---- W set 3 (w12+): Japanese World of Horror / Junji Ito characters looking up (user: no rotated box, Japanese only)
made3 = []
def finish3(im, name):
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made3.append(name)
def stamp_jp(im, kanji, x, y, k=7, col=(0, 0, 0)):   # straight (axis-aligned) box, kanji only
    g = pixmask(kanji, KANJI, 20, k, bold=True); w = g.shape[1] + 56; h = g.shape[0] + 52
    a = np.zeros((h + 24, w + 24, 4), np.uint8); a[...] = (0, 0, 0, 255); a[8:h + 16, 8:w + 16] = (253, 253, 253, 255)
    gy, gx = 12 + (h - g.shape[0]) // 2, 12 + (w - g.shape[1]) // 2; a[gy:gy + g.shape[0], gx:gx + g.shape[1]][g] = col + (255,)
    im = im.convert('RGBA'); im.alpha_composite(Image.fromarray(a), (x, y)); return im.convert('RGB')
GI, SA, OW, BY = nat('j_girl.png'), nat('j_salary.png'), nat('j_oldwoman.png'), nat('j_boy.png')
# w12: the schoolgirl, face cut by the right edge, box left
im = halftone(crop(lut(GI, ONE), 8, 520, 40)); finish3(grain(stamp_jp(im, '見るな', 40, 480), 6), 'w12_girl_mirumna')
# w13: the schoolgirl tighter on the eyes, box bottom-left, the single red accent: 起きた in red kanji
im = halftone(crop(lut(GI, ONE), 11, 820, 40)); im = stamp_jp(im, '眠る鐘', 40, 470, k=6)
im = put(im, pixmask('起きた', KANJI, 20, 8, bold=True), 1230, 60, ACCENT, 'rt', outline=6); finish3(grain(im, 6), 'w13_girl_okita_red')
# w14: the salaryman under the cloud face, box top-left
im = halftone(crop(lut(SA, ONE), 6, 160, 0)); finish3(grain(stamp_jp(im, '目覚め', 40, 40, k=6), 6), 'w14_salaryman_face')
# w15: the old woman, extreme close-up cut by the left edge, box right
im = halftone(crop(lut(OW, ONE), 8, 80, 0)); finish3(grain(stamp_jp(im, '鐘', 960, 70, k=10), 6), 'w15_oldwoman_kane')
# w16: the boy over the shoulder, the face leaning down, box bottom-right
im = halftone(crop(lut(BY, ONE), 6, 0, 0)); finish3(grain(stamp_jp(im, '鐘を鳴らせ', 700, 520, k=5), 6), 'w16_boy_narase')
# w17: the old woman wider + red 起きた as the accent, box top-right
im = halftone(crop(lut(OW, ONE), 6, 0, 0)); im = stamp_jp(im, '眠る鐘', 820, 50, k=6)
im = put(im, pixmask('起きた', KANJI, 20, 7, bold=True), 1220, 500, ACCENT, 'rt', outline=6); finish3(grain(im, 6), 'w17_oldwoman_okita_red')
sheet = Image.new('RGB', (2 * 1000 + 10, 3 * 390 + 60), (40, 40, 40)); d = ImageDraw.Draw(sheet)
for i, nm in enumerate(made3):
    im = Image.open(OUT + nm + '.png'); col, row = i % 2, i // 2; cx, cy = 10 + col * 1000, 50 + row * 390
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
    d.text((cx + 650, cy + 190), nm, fill=(240, 200, 140), font=f)
d.text((10, 10), 'bells thumbnails 3: w12-w17, Japanese WoH / Junji characters looking up, straight kanji-only box (+ 320x180 check)', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet3.png'); print(made3)

# ---- W set 4 (w18-w23 = w12-w17 rebuilt): fine small-pixel dither instead of the dot screen, clean skin, small boxes in
# the emptiest corner (user)
from scipy.ndimage import generic_filter
made4 = []
def finish4(im, name):
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made4.append(name)
def clean(img):   # isolated native cells (a value none of its 4 neighbours share) take the neighbours' majority: no skin speckle
    out = img.copy(); P = np.pad(img, 1, mode='edge')
    nb = np.stack([P[:-2, 1:-1], P[2:, 1:-1], P[1:-1, :-2], P[1:-1, 2:]])
    lone = (nb != img[None]).all(0)
    from scipy.stats import mode
    out[lone] = mode(nb[:, lone], axis=0, keepdims=False).mode
    return out
def dither(img, k, x0, y0, cell=3):
    """the native image scaled up nearest; greys become a fine checker of `cell` screen px (the WoH game look):
    142 -> 50 % checker, 56 -> 25 % (one dot in four) on black, 0 and 253 flat"""
    big = np.kron(img, np.ones((k, k), np.uint8))[y0:y0 + 720, x0:x0 + 1280]
    yy, xx = np.mgrid[0:big.shape[0], 0:big.shape[1]]; cx, cy = xx // cell, yy // cell
    out = np.where(big >= 200, 255, 0).astype(np.uint8)
    out[(big == 142) & ((cx + cy) % 2 == 0)] = 255
    out[(big == 56) & (cx % 2 == 0) & (cy % 2 == 0)] = 255
    o = np.zeros((720, 1280), np.uint8); o[:out.shape[0], :out.shape[1]] = out
    return Image.fromarray(np.dstack([o] * 3))
def emptiest(im, bw, bh, avoid=()):
    """the corner (with a 40 px margin) whose box area has the least detail (edge density); `avoid` = (x0, y0, x1, y1) boxes"""
    a = np.array(im.convert('L')).astype(float); e = np.abs(np.diff(a, axis=0))[:, :-1] + np.abs(np.diff(a, axis=1))[:-1]
    best = None
    for x in (40, (1280 - bw) // 2, 1280 - 40 - bw):
        for y in (40, 720 - 40 - bh):
            ov = sum(max(0, min(x + bw, ax1) - max(x, ax0)) * max(0, min(y + bh, ay1) - max(y, ay0)) for ax0, ay0, ax1, ay1 in avoid)
            s = e[y:y + bh, x:x + bw].mean() + ov / (bw * bh) * 100
            if best is None or s < best[0]: best = (s, x, y)
    return best[1], best[2]
def small_box(im, kanji, k=4, avoid=(), pos=None):
    g = pixmask(kanji, KANJI, 20, k, bold=True); w, h = g.shape[1] + 2 * 22 + 16, g.shape[0] + 2 * 20 + 16
    x, y = pos or emptiest(im, w, h, avoid); return stamp_jp(im, kanji, x, y, k=k), (x, y, x + w, y + h)
def red_word(im, avoid, k=4, pos=None):
    g = pixmask('起きた', KANJI, 20, k, bold=True); w, h = g.shape[1] + 12, g.shape[0] + 12
    x, y = pos or emptiest(im, w, h, avoid); return put(im, g, x + 6, y + 6, ACCENT, 'lt', outline=4)
G, S_, O_, B_ = clean(GI), clean(SA), clean(OW), clean(BY)
_o = np.asarray(Image.open(P + 'gen/thumbs/j_oldwoman.jpg').convert('L').resize((240, 134), Image.BOX)).astype(float) / 255
O_ = np.where(_o < 0.33, 0, np.where(_o < 0.68, 142, 253)).astype(np.uint8); O_ = clean(clean(O_))   # her fine hatching is not on a pixel grid: box-averaged to tones, 3 levels   # the old woman: Flow's fine hatching turned to noise on the grid; fewer levels, cleaned twice
FACEBOX = {}   # rough boxes (screen px) of eyes/mouth/cloud-eyes to keep clear, per thumb
im = dither(G, 8, 520, 40); im, _ = small_box(im, '見るな', avoid=[(300, 80, 1000, 560)]); finish4(grain(im, 4), 'w18_girl_mirumna')
im = dither(G, 11, 820, 40); im, b = small_box(im, '眠る鐘', avoid=[(150, 60, 1150, 600)]); im = red_word(im, [], pos=(990, 50)); finish4(grain(im, 4), 'w19_girl_okita_red')
im = dither(S_, 6, 160, 0); im, _ = small_box(im, '目覚め', avoid=[(250, 0, 1050, 720)]); finish4(grain(im, 4), 'w20_salaryman_face')
im = dither(O_, 8, 80, 0); im, _ = small_box(im, '鐘', k=6, avoid=[(150, 0, 1050, 720)]); finish4(grain(im, 4), 'w21_oldwoman_kane')
im = dither(B_, 6, 0, 0); im, _ = small_box(im, '鐘を鳴らせ', avoid=[(100, 0, 1200, 600)]); finish4(grain(im, 4), 'w22_boy_narase')
im = dither(O_, 6, 0, 0); im, b = small_box(im, '眠る鐘', avoid=[(150, 0, 900, 720)]); im = red_word(im, [b, (150, 0, 900, 720)]); finish4(grain(im, 4), 'w23_oldwoman_okita_red')
sheet = Image.new('RGB', (2 * 1000 + 10, 3 * 390 + 60), (40, 40, 40)); d = ImageDraw.Draw(sheet)
for i, nm in enumerate(made4):
    im = Image.open(OUT + nm + '.png'); col, row = i % 2, i // 2; cx, cy = 10 + col * 1000, 50 + row * 390
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
    d.text((cx + 650, cy + 190), nm, fill=(240, 200, 140), font=f)
d.text((10, 10), 'bells thumbnails 4: w18-w23, fine pixel dither, small kanji box in the emptiest corner (+ 320x180 check)', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet4.png'); print(made4)

# ---- w18 rework (w18a-c): straight from the Flow original (no native-grid pass, which blew mid-tones to white and lost
# the fine lines). Luma at the w18 framing, a gamma toward darker, then an ordered 4x4 Bayer dither on 3-px cells over
# the mid-tones; the dark ink lines are kept solid (thresholded first, so they never dither away).
made5 = []
SRC = Image.open(P + 'gen/thumbs/j_girl.jpg').convert('L'); sc = 8 / 5.905
Lg = np.asarray(SRC.resize((round(SRC.width * sc), round(SRC.height * sc)), Image.LANCZOS)).astype(float)[40:760, 520:1800] / 255
BAY = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16 + 1 / 32
def bayer(L, gamma, white, ink, hi=0.985, cell=3):
    t = np.clip(L / white, 0, 1) ** gamma
    yy, xx = np.mgrid[0:L.shape[0], 0:L.shape[1]]; th = BAY[(yy // cell) % 4, (xx // cell) % 4]
    out = np.where(t > th, 255, 0).astype(np.uint8)
    out[L < ink] = 0                      # the ink lines stay solid black
    out[L > hi] = 255                     # true highlights stay clean
    return out
VAR = {'a': (1.5, 1.03, 0.22, 0.97), 'b': (2.0, 1.08, 0.26, 0.985), 'c': (2.6, 1.14, 0.30, 0.995)}   # gamma, white point (>1 pulls the skin into the dither), ink threshold, highlight
for v, (gm, wp, ink, hi) in VAR.items():
    o = bayer(Lg, gm, wp, ink, hi); im = Image.fromarray(np.dstack([o] * 3))
    im, _ = small_box(im, '見るな', pos=(1280 - 40 - (pixmask('見るな', KANJI, 20, 4, bold=True).shape[1] + 60), 720 - 40 - (pixmask('見るな', KANJI, 20, 4, bold=True).shape[0] + 56)))
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + f'w18{v}_girl_mirumna.png'); made5.append(f'w18{v}_girl_mirumna')
orig = Image.fromarray((Lg * 255).astype(np.uint8)).convert('RGB')
sheet = Image.new('RGB', (2 * 1000 + 10, 2 * 390 + 60), (40, 40, 40)); d = ImageDraw.Draw(sheet)
tiles = [('Flow original (same crop)', orig)] + [(nm, Image.open(OUT + nm + '.png')) for nm in made5]
for i, (nm, im) in enumerate(tiles):
    col, row = i % 2, i // 2; cx, cy = 10 + col * 1000, 50 + row * 390
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
    d.text((cx + 650, cy + 190), nm, fill=(240, 200, 140), font=f)
d.text((10, 10), 'w18 rework: a -> c = more shadow (gamma 1.5 / 2.0 / 2.6, white point 1.03 / 1.08 / 1.14), fine 3-px Bayer dither, ink lines kept', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet5.png'); print(made5)

# ---- w18d-f: between the old w18 (clean white skin) and w18a: lit skin clean white (highlight cut lower), dither only in
# the genuine shadows; ink protection as before
made6 = []
VAR2 = {'d': (1.1, 1.0, 0.22, 0.86), 'e': (1.2, 1.0, 0.22, 0.89), 'f': (1.3, 1.0, 0.22, 0.92)}   # gamma, white point, ink, highlight
for v, (gm, wp, ink, hi) in VAR2.items():
    o = bayer(Lg, gm, wp, ink, hi); im = Image.fromarray(np.dstack([o] * 3))
    bm = pixmask('見るな', KANJI, 20, 4, bold=True); im, _ = small_box(im, '見るな', pos=(1280 - 40 - (bm.shape[1] + 60), 720 - 40 - (bm.shape[0] + 56)))
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + f'w18{v}_girl_mirumna.png'); made6.append(f'w18{v}_girl_mirumna')
row = ['w18_girl_mirumna'] + made6 + ['w18a_girl_mirumna']
sheet = Image.new('RGB', (5 * 650 + 10, 360 + 180 + 120), (40, 40, 40)); d = ImageDraw.Draw(sheet)
for i, nm in enumerate(row):
    im = Image.open(OUT + nm + '.png'); cx = 10 + i * 650
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, 50)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx, 420))
    d.text((cx, 610), nm + (' (old, sheet4)' if nm == 'w18_girl_mirumna' else ' (sheet5)' if nm == 'w18a_girl_mirumna' else ''), fill=(240, 200, 140), font=f)
d.text((10, 10), 'w18 in-between: old w18 | d (gamma 1.1) | e (1.2) | f (1.3) | w18a  - lit skin clean, dither in the shadows only', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet6.png'); print(made6)

# ---- w18g/h: a true middle between the old w18 (coarse 8-px grid) and w18e: the source on a visible pixel grid of
# 4 (g) / 5 (h) screen px, ink lines protected per cell, lit skin clean, moderate shadows in a 2x2 dither on the cells
made7 = []
def gridded(L, cell, gamma, hi):
    H0, W0 = L.shape; gh, gw = H0 // cell, W0 // cell
    Lc = L[:gh * cell, :gw * cell].reshape(gh, cell, gw, cell)
    m, mn = Lc.mean((1, 3)), Lc.min((1, 3))
    yy, xx = np.mgrid[0:gh, 0:gw]; th = B2[yy % 2, xx % 2]
    t = m ** gamma; out = np.where(t > th, 255, 0)
    out[(mn < 0.22) & (m < 0.62)] = 0; out[m > hi] = 255; out[m < 0.08] = 0
    big = np.kron(out, np.ones((cell, cell))).astype(np.uint8); o = np.full((720, 1280), 0, np.uint8); o[:big.shape[0], :big.shape[1]] = big
    return Image.fromarray(np.dstack([o] * 3))
B2 = np.array([[0.125, 0.625], [0.875, 0.375]])
for v, (cell, gm, hi) in {'g': (4, 0.95, 0.86), 'h': (5, 0.95, 0.84)}.items():
    im = gridded(Lg, cell, gm, hi); bm = pixmask('見るな', KANJI, 20, 4, bold=True)
    im, _ = small_box(im, '見るな', pos=(1280 - 40 - (bm.shape[1] + 60), 720 - 40 - (bm.shape[0] + 56)))
    im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + f'w18{v}_girl_mirumna.png'); made7.append(f'w18{v}_girl_mirumna')
row = ['w18_girl_mirumna'] + made7 + ['w18e_girl_mirumna']
sheet = Image.new('RGB', (4 * 650 + 10, 360 + 180 + 120), (40, 40, 40)); d = ImageDraw.Draw(sheet)
for i, nm in enumerate(row):
    im = Image.open(OUT + nm + '.png'); cx = 10 + i * 650
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, 50)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx, 420))
    d.text((cx, 610), nm + (' (old)' if nm == 'w18_girl_mirumna' else ''), fill=(240, 200, 140), font=f)
d.text((10, 10), 'w18 middle: old w18 (8-px grid) | g (4-px grid) | h (5-px grid) | w18e (fine)', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet7.png'); print(made7)

# ---- w18i: w18g redone the flat way (user): 4-px grid, flat tones (black / dark grey / mid grey / white), ink lines
# protected per cell, no dither
def flat_grid(L, cell, levels=(0.13, 0.33, 0.72), ink=0.25):
    # the source is drawn with its own halftone dots: tones from a blurred copy (dots averaged away), and only long
    # connected dark strokes (lines, lashes, lips: components of 40+ px) count as ink, never the small halftone dots
    from scipy import ndimage as nd
    Lb = nd.gaussian_filter(L, 2.2); dark = L < ink; lab, k = nd.label(dark)
    sz = nd.sum(dark, lab, range(1, k + 1)); lines = np.isin(lab, 1 + np.where(sz >= 40)[0])
    H0, W0 = L.shape; gh, gw = H0 // cell, W0 // cell
    m = Lb[:gh * cell, :gw * cell].reshape(gh, cell, gw, cell).mean((1, 3))
    ln = lines[:gh * cell, :gw * cell].reshape(gh, cell, gw, cell).mean((1, 3)) > 0.25
    out = np.where(m < levels[0], 0, np.where(m < levels[1], 56, np.where(m < levels[2], 142, 253)))
    out[ln] = 0
    big = np.kron(out, np.ones((cell, cell))).astype(np.uint8); o = np.zeros((720, 1280), np.uint8); o[:big.shape[0], :big.shape[1]] = big
    return Image.fromarray(lut(o, BW))
im = flat_grid(Lg, 4); bm = pixmask('見るな', KANJI, 20, 4, bold=True)
im, _ = small_box(im, '見るな', pos=(1280 - 40 - (bm.shape[1] + 60), 720 - 40 - (bm.shape[0] + 56)))
im = im.convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + 'w18i_girl_mirumna.png')
sheet = Image.new('RGB', (3 * 650 + 10, 360 + 180 + 120), (40, 40, 40)); d = ImageDraw.Draw(sheet)
for i, nm in enumerate(['w18_girl_mirumna', 'w18i_girl_mirumna', 'w18g_girl_mirumna']):
    im = Image.open(OUT + nm + '.png'); cx = 10 + i * 650
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, 50)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx, 420)); d.text((cx, 610), nm, fill=(240, 200, 140), font=f)
d.text((10, 10), 'w18i: flat greys + line protection on a 4-px grid (between old w18 and w18g)', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet8.png'); print('w18i')
