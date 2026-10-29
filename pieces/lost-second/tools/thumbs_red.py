# lost-second thumbnails, red set: the reveal pose (assets/man_close.png) cut out on flat red, and a red-black duotone of
# the full frame. Native grid scaled by whole numbers (nearest). Text = the film's aansa atlas (assets/font.png), so the
# letters are the captions' own pixels.
import numpy as np
from PIL import Image
from collections import deque
from scipy.ndimage import binary_fill_holes, binary_dilation
P = '/Users/alanleiva/claude-proyectos/pieces/lost-second/'; OUT = P + 'thumbs/'
RED = np.array([166, 1, 14], np.uint8); DRED = np.array([70, 0, 6], np.uint8); WHITE = np.array([253, 253, 253], np.uint8); BLACK = np.zeros(3, np.uint8)
a = np.array(Image.open(P + 'assets/man_close.png').convert('L')); H, W = a.shape
# ---- the figure mask: flood the suit and head inside his white outline, fill the holes (eye, ear, collar), keep the outline
wall = a > 200; wall[100:, 142:] = True          # the floor wedge by his right hip touches the suit
m = np.zeros_like(wall); q = deque([(100, 105), (30, 150)])
for s in q: m[s] = True
while q:
    y, x = q.popleft()
    for yy, xx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)):
        if 0 <= yy < H and 0 <= xx < W and not m[yy, xx] and not wall[yy, xx]: m[yy, xx] = True; q.append((yy, xx))
m = binary_fill_holes(m); ring = binary_dilation(m) & ~m & (a > 200)
EYE = np.zeros_like(m); EYE[26:35, 147:157] = a[26:35, 147:157] > 200
def lut(img, cmap):   # palette values 0 / 71 / 142 / 253 -> colours
    out = np.zeros(img.shape + (3,), np.uint8)
    for v, c in cmap.items(): out[img == v] = c
    return out
BW = {0: BLACK, 71: [26, 26, 26], 142: [91, 91, 91], 253: WHITE}               # the film's black-and-white pass
DUO = {0: BLACK, 71: [22, 0, 2], 142: DRED, 253: RED}                          # white -> red, grey -> dark red
def cutout(style):   # native RGBA of the figure only
    rgba = np.zeros((H, W, 4), np.uint8)
    if style == 'white':                       # his own black / grey / white
        col = lut(a, BW)
    else:                                      # black on red: a black figure, his white details stay white (eye, ear, collar)
        col = np.where((a > 200)[..., None], WHITE, BLACK).astype(np.uint8)
    rgba[..., :3] = col; rgba[m, 3] = 255
    rgba[ring, :3] = WHITE; rgba[ring, 3] = 255
    return rgba
def place(canvas, rgba, k, x, y):   # paste a native RGBA scaled k at canvas px (x, y)
    im = Image.fromarray(rgba, 'RGBA').resize((W * k, H * k), Image.NEAREST); canvas.paste(im, (x, y), im); return canvas
def red_canvas(): return Image.new('RGB', (1280, 720), tuple(int(v) for v in RED))
# ---- text from the atlas
ATL = np.array(Image.open(P + 'assets/font.png').convert('RGBA'))[..., 3] > 0
ADV = [4, 3, 4, 10, 5, 11, 8, 2, 4, 4, 6, 8, 1, 4, 3, 6, 7, 5, 7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 8, 7, 8, 7, 12, 8, 8, 8, 8, 8, 8, 9, 9, 3, 7, 8, 7, 10, 8, 9, 8, 9, 8, 8, 7, 8, 9, 12, 9, 9, 8, 4, 6, 4, 8, 7, 3, 7, 7, 7, 7, 7, 5, 7, 7, 3, 4, 7, 3, 9, 7, 7, 7, 7, 5, 7, 5, 7, 7, 10, 7, 7, 6, 5, 2, 5, 9]
def glyph_line(s, track=2):
    w = sum(ADV[ord(c) - 32] + track for c in s) + 6; g = np.zeros((14, w), bool); cx = 2
    for c in s:
        i = ord(c) - 32; cell = ATL[(i // 16) * 22:(i // 16) * 22 + 22, (i % 16) * 20:(i % 16) * 20 + 20]
        src = cell[2:16, 2:2 + ADV[i] + 1]          # glyph rows 3..11 sit inside 2..16
        ww = min(src.shape[1], w - cx); g[:, cx:cx + ww] |= src[:, :ww]; g[:, cx + 1:cx + 1 + ww] |= src[:, :ww][:, : max(0, min(ww, w - cx - 1))]   # bold: +1 cell
        cx += ADV[i] + track
    return g
def text(im, lines, x, y, px=7, align='left', ink=WHITE, edge=BLACK, lead=11, colors=None):
    for li, s in enumerate(lines):
        g = glyph_line(s); st = binary_dilation(g, np.ones((5, 5), bool))
        h, w = g.shape; xx = x if align == 'left' else (x - w * px // 2 if align == 'center' else x - w * px); yy = y + li * lead * px
        for mask, col in ((st, edge), (g, colors[li] if colors else ink)):
            mi = Image.fromarray((mask * 255).astype(np.uint8)).resize((w * px, h * px), Image.NEAREST)
            im.paste(tuple(int(v) for v in col), (xx, yy), mi)
    return im
T1 = ['THE MAN IN', 'THE MISSING', 'SECOND']   # three lines: clear of his back
T2 = ['HE IS ONE', 'STEP AWAY']
made = []
def save(im, name): im.save(OUT + name + '.png'); made.append(name)
# ---- 1. solid red, cut out
# both styles were tried (his own black/grey/white, and a black silhouette): the silhouette lost the suit and the face
# into one black shape, so the set keeps his own tones on the red
cut = cutout('white')
save(place(red_canvas(), cut, 5, 640 - 152 * 5, 50), 'r1_red_center')                                   # whole figure, head centred
save(text(place(red_canvas(), cut, 5, 1280 - 185 * 5, 50), T1, 36, 230, px=6), 'r2_red_right_title')
save(place(red_canvas(), cut, 14, 640 - 152 * 14, -84), 'r3_red_face')                                  # the face and eye
# ---- 2. red-black duotone of the whole frame (the wall continued to the right)
full = np.hstack([a, a[:, 192:240]]); FW = full.shape[1]
def duo(dark=False):
    # the background in red and black; the man (the r1-r3 mask, plus his white outline) stays in the film's black and white
    cmap = {0: BLACK, 71: [16, 0, 2], 142: [45, 0, 4], 253: [110, 0, 9]} if dark else DUO
    rgb = lut(full, cmap); fig = np.zeros(full.shape, bool); fig[:, :W] = m | ring
    rgb[fig] = lut(full, BW)[fig]; return rgb
def crop(rgb, k, x0, y0): return Image.fromarray(rgb).resize((FW * k, H * k), Image.NEAREST).crop((x0, y0, x0 + 1280, y0 + 720))
save(text(crop(duo(), 6, 0, 30), T1, 36, 40, px=6), 'r4_duo_right_title')
save(text(crop(duo(), 7, 480, 0), T2, 640, 520, px=6, align='center', lead=10), 'r5_duo_center_title')
save(crop(duo(), 7, 480, 0), 'r6_duo_center')
save(text(crop(duo(), 14, 1700, 160), T2, 1250, 470, px=6, align='right'), 'r7_duo_face_title')
save(text(crop(duo(dark=True), 6, 0, 30), T1, 36, 40, px=6), 'r8_duo_dark_right_title')
# ---- version b again (black and white), with the atlas letters: the old font render broke the T's
bw = Image.fromarray(lut(full, BW)).resize((FW * 7, H * 7), Image.NEAREST).crop((480, 0, 1760, 720))
text(bw, ['ONE STEP LEFT'], 640, 548, px=6, align='center').save(OUT + 'b_center_title.png')
# ---- the sheet: each at 640x360 and 320x180
n = len(made); cols = 4; rows = (n + cols - 1) // cols
sheet = Image.new('RGB', (cols * 1000 + 10, rows * 380 + 10), (40, 40, 40))
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); cx, cy = 10 + (i % cols) * 1000, 10 + (i // cols) * 380
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
sheet.save(OUT + 'sheet_red.png'); print(made)
