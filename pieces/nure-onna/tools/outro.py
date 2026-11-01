# outro.py: the Madfable outro assets (replaces logo.py's black spiral outro).
#   assets/outro_bg.png    the red forest (fondo rojo outro.jpeg) on its own native grid (5.73 px -> 480x268), pure red + black;
#                          drawn at 4 px per native pixel = 1920x1072
#   assets/outro_card.png  the spinning cartridge (animacion outro.mp4, 10.5-14.5 s, every 2nd frame = 48 frames at 12 fps),
#                          black background keyed out by flood fill from the border, 2-px cells, onebit greys; 8x6 sheet
#   assets/outro_name.png  "madfable" in That That New Pixel (square), lower case, letters packed row by row by closest ink 1 font pixel apart,
#                          1-bit white on transparent at 5 px font pixels (size 250)
import sys, subprocess, tempfile, os
import numpy as np
from PIL import Image, ImageFont, ImageDraw
from collections import deque

ROOT = '/Users/alanleiva/claude-proyectos/'
REF = ROOT + 'Ref 1 bit pixelated junji ito madfable/'
OUT = ROOT + 'pieces/nure-onna/assets/'   # 9:16: sceneLogo draws the bg at 8 px a cell centre-cropped to 1080x1920, the card x3 bottom-right

# ---- background: sample the native grid at cell centres, threshold the red channel
im = np.asarray(Image.open(REF + 'fondo rojo outro.jpeg').convert('RGB')).astype(np.float32)
R = im[..., 0]
def phase(edge, p):
    best = (-1, 0)
    for ph in np.arange(0, p, 0.1):
        idx = np.round(ph + np.arange(0, len(edge) / p - 1) * p).astype(int); idx = idx[idx < len(edge)]
        s = edge[idx].mean()
        if s > best[0]: best = (s, ph)
    return best[1]
P = 5.733
phx = phase(np.append(np.abs(np.diff(R, axis=1)).mean(0), 0), P); phy = phase(np.append(np.abs(np.diff(R, axis=0)).mean(1), 0), P)
cx = (phx + 0.5 - P / 2 + P * np.arange(480)).round().astype(int).clip(1, im.shape[1] - 2)
cy = (phy + 0.5 - P / 2 + P * np.arange(268)).round().astype(int).clip(1, im.shape[0] - 2)
s = np.zeros((268, 480))
for dy in (-1, 0, 1):
    for dx in (-1, 0, 1): s += R[cy[:, None] + dy, cx[None, :] + dx]
red = s / 9 > 90
reds = im[R > 120]; col = np.median(reds, 0).astype(np.uint8)
bg = np.zeros((268, 480, 3), np.uint8); bg[red] = col
Image.fromarray(bg).save(OUT + 'outro_bg.png')
print('bg phase', phx, phy, 'red', col, 'red share', red.mean().round(3))

# ---- card
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '10.5', '-t', '4.0', '-i', REF + 'animacion outro.mp4', '-vf', 'fps=12', tmp + '/%03d.png'], check=True)
X0, Y0, CW, CH = 122, 276, 476, 688          # union bbox of the card over the clip (127..593, 281..959) + margin
NW, NH = 83, 120                              # native cells (2 px on screen -> 166x240)
LUM = np.array([0, 43, 142, 253])
frames = []
for fn in sorted(os.listdir(tmp))[:48]:
    a = np.asarray(Image.open(os.path.join(tmp, fn)).convert('L')).astype(np.float32)[Y0:Y0 + CH, X0:X0 + CW]
    dark = a < 40; bgm = np.zeros_like(dark); q = deque()
    for y in range(CH):
        for x in (0, CW - 1):
            if dark[y, x] and not bgm[y, x]: bgm[y, x] = True; q.append((y, x))
    for x in range(CW):
        for y in (0, CH - 1):
            if dark[y, x] and not bgm[y, x]: bgm[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < CH and 0 <= xx < CW and dark[yy, xx] and not bgm[yy, xx]: bgm[yy, xx] = True; q.append((yy, xx))
    al = (~bgm).astype(np.float32)
    A = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).resize((NW, NH), Image.BOX)) / 255
    Lw = np.asarray(Image.fromarray(np.clip(a * al, 0, 255).astype(np.uint8)).resize((NW, NH), Image.BOX)).astype(np.float32)
    L = Lw / np.maximum(A, 1e-3)
    q4 = LUM[np.abs(L[..., None] - LUM).argmin(-1)].astype(np.uint8)
    rgba = np.dstack([q4, q4, q4, np.where(A > 0.5, 255, 0).astype(np.uint8)])
    frames.append(rgba)
sheet = np.zeros((NH * 6, NW * 8, 4), np.uint8)
for i, f in enumerate(frames): sheet[(i // 8) * NH:(i // 8 + 1) * NH, (i % 8) * NW:(i % 8 + 1) * NW] = f
Image.fromarray(sheet, 'RGBA').save(OUT + 'outro_card.png')
print('card frames', len(frames))

# ---- the wordmark: glyph by glyph, each one slid left until, row by row, its leftmost ink sits GAP font pixels from
#      the ink already placed (closest point, not bounding box: an f's overhang no longer pushes the a away)
SIZE, U, GAP = 250, 5, 1
f = ImageFont.truetype(ROOT + 'fonts/thatthatnewpixelfamilytest-square.otf', SIZE)
c = np.zeros((400, 1600), bool); x = 20
for i, ch in enumerate('madfable'):
    g = Image.new('L', (400, 400)); ImageDraw.Draw(g).text((20, 40), ch, font=f, fill=255)
    l, _, r, _ = g.getbbox(); gl = np.asarray(g.crop((l, 0, r, 400))) > 127
    if i == 0: pos = x
    else:
        right = np.where(c.any(1), c.shape[1] - 1 - np.argmax(c[:, ::-1], 1), -10**6)   # rightmost placed ink per row
        right = np.max([np.roll(right, k) for k in range(-U, U + 1)], 0)                # ...and its neighbour rows: no diagonal touch
        left = np.where(gl.any(1), np.argmax(gl, 1), 10**6)                                 # the glyph's leftmost ink per row
        rows = (right > -10**6) & (left < 10**6)
        pos = int((right[rows] + GAP * U + 1 - left[rows]).max()) if rows.any() else x + GAP * U
    c[:, pos:pos + gl.shape[1]] |= gl; x = pos + gl.shape[1]
ys, xs = np.nonzero(c); n = (c[ys.min():ys.max() + 1, xs.min():xs.max() + 1] * 255).astype(np.uint8)
Image.fromarray(np.dstack([np.where(n > 0, 253, 0).astype(np.uint8)] * 3 + [n]), 'RGBA').save(OUT + 'outro_name.png')
print('name', n.shape[::-1])
