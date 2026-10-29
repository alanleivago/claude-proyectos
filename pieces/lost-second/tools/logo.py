# logo.py: the Madfable outro assets.
#   assets/logo_spiral.png  the channel spiral, white, on transparent (500x500, its own pixel steps kept 1:1)
#   assets/logo_order.png   the draw order of every spiral pixel: grey = how far along the stroke from its outer tail
#                           (geodesic BFS distance inside the shape), so the code can draw the spiral in like a pen
#   assets/logo_name.png    "Madfable" in That That New Pixel (square), white, 1-bit
import numpy as np
from collections import deque
from PIL import Image, ImageFont, ImageDraw

ROOT = '/Users/alanleiva/claude-proyectos/'
a = np.asarray(Image.open(ROOT + 'Ref 1 bit pixelated junji ito madfable/madfable icono perfil.png').convert('RGBA'))[..., 3] > 128
h, w = a.shape

def bfs(start):
    d = np.full(a.shape, -1); d[start] = 0; q = deque([start])
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and a[yy, xx] and d[yy, xx] < 0:
                d[yy, xx] = d[y, x] + 1; q.append((yy, xx))
    return d

ys, xs = np.nonzero(a)
d0 = bfs((ys[0], xs[0]))
e1 = np.unravel_index(d0.argmax(), a.shape); d1 = bfs(e1)
e2 = np.unravel_index(d1.argmax(), a.shape)
c = np.array([ys.mean(), xs.mean()])
tail = e1 if np.hypot(*(np.array(e1) - c)) > np.hypot(*(np.array(e2) - c)) else e2   # start on the outer tail
d = bfs(tail).astype(np.float64)
order = np.where(a, 1 + 254 * d / d.max(), 0).astype(np.uint8)
Image.fromarray(order, 'L').save(ROOT + 'pieces/amigara/assets/logo_order.png')
white = np.dstack([np.full_like(order, 253)] * 3 + [(a * 255).astype(np.uint8)])
Image.fromarray(white, 'RGBA').save(ROOT + 'pieces/amigara/assets/logo_spiral.png')

f = ImageFont.truetype(ROOT + 'fonts/thatthatnewpixelfamilytest-square.otf', 150)
im = Image.new('L', (1200, 300)); ImageDraw.Draw(im).text((20, 20), 'Madfable', font=f, fill=255)
im = im.crop(im.getbbox()).point(lambda v: 255 if v > 127 else 0)
n = np.asarray(im)
Image.fromarray(np.dstack([np.where(n > 0, 253, 0).astype(np.uint8)] * 3 + [n]), 'RGBA').save(ROOT + 'pieces/amigara/assets/logo_name.png')
print('tail', tail, 'len', int(d.max()), 'name', im.size)
