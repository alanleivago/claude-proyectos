# compose_v6.py — base G1a (miniaturas_v3) + cabeza de NUESTRO Stalker + "HUNTER" (Anton) DETRÁS de la cabeza.
# head='flow': edición de Flow (cabeza PS1 con ref de nuestro render); la máscara de la cabeza sale de la diferencia con el plate limpio.
# head='code': render real de stalker_ps1.glb (thumb_shoot.mjs) pegado sobre el cuerpo de G1a, con el cielo limpio detrás.
import os, sys, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(HERE); ROOT = os.path.dirname(OUT)
FONT = os.path.abspath(os.path.join(ROOT, '../../../styles/ava-restfield/fonts/Anton-Regular.ttf'))
W, H = 2560, 1440
G1A = os.path.join(ROOT, 'miniaturas_v3/_flow/2026-11-16T22-58-49-edit-b3_base-keep-exactly-the-same-image-1.jpg')
CLEAN = os.path.join(ROOT, 'miniaturas_v4/_flow/2026-11-16T23-05-08-edit-g1a_base-completely-remove-the-gian-1.jpg')
FLOW = lambda i: os.path.join(OUT, '_flow', f'2026-11-16T23-25-14-edit-g1a_base-keep-everything-exactly-th-{i}.jpg')
NECK = 470          # canvas y: below this the painted body/collar of G1a stays

def load(p):
    im = Image.open(p).convert('RGB'); w, h = im.size; tw = round(h * 16 / 9)
    return np.asarray(im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h)).resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
def blur(a, s): return cv2.GaussianBlur(a, (0, 0), s)
def ramp_y(y0, y1): return np.clip((np.arange(H, dtype=np.float32)[:, None] - y0) / (y1 - y0), 0, 1) * np.ones((1, W), np.float32)

def word(color, gapc=864, base=420, size=395, track=16, gap=300):
    """HUNTER as (rgb, alpha) + its soft shadow/glow alpha; a wider gap between HUN and TER where the head sits"""
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m); f = ImageFont.truetype(FONT, size)
    txt = 'HUNTER'; adv = [f.getlength(c) for c in txt]
    x = gapc - gap / 2 - track / 2 - (sum(adv[:3]) + track * 3) + track
    for i, c in enumerate(txt):
        d.text((x, base), c, font=f, fill=255, anchor='ls'); x += adv[i] + track + (gap if i == 2 else 0)
    a = np.asarray(m).astype(np.float32) / 255
    rgb = np.ones((H, W, 3), np.float32) * np.array(color, np.float32)
    # subtle vertical tonal falloff on the letters (lighter top)
    rgb = rgb * (1.0 - 0.18 * ramp_y(base - size * 0.75, base))[..., None]
    sh = blur(cv2.dilate(a, np.ones((7, 7))), 18)
    return rgb, a, sh

def put_text(img, color, fg, glow, **kw):
    rgb, a, sh = word(color, **kw)
    keep = 1 - fg                                  # text only where the giant is NOT
    out = img * (1 - (sh * 0.65 * keep)[..., None])
    if glow is not None:
        out = out + (1 - out) * (blur(a, 26) * 0.55 * keep)[..., None] * np.array(glow)
    out = out * (1 - (a * keep)[..., None]) + rgb * (a * keep)[..., None]
    return out

def rain(img, seed, k=0.45, ang=0.22, mask=None):
    r = np.random.default_rng(seed); m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for _ in range(900):
        x, y = r.random() * (W + 300) - 150, r.random() * H; l = r.uniform(40, 150)
        d.line([(x, y), (x + math.sin(ang) * l, y + math.cos(ang) * l)], fill=int(255 * r.uniform(0.4, 1)), width=2)
    a = blur(np.asarray(m).astype(np.float32) / 255, 0.8) * k
    if mask is not None: a = a * mask
    return img + (1 - img) * a[..., None] * np.array([0.82, 0.9, 0.94])

def flow_version(i, color, glow):
    img = load(FLOW(i)); clean = load(CLEAN)
    d = np.abs(img - clean).sum(-1)
    m = (blur(d, 3) > 0.22).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8)); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for k in range(1, n):
        x, y, w, h, area = st[k]
        if area > 20000 and x < 1700 and y < 600: keep[lab == k] = 1
    # fill holes
    ff = keep.copy(); cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (5, 5), 1); keep = keep | (1 - ff)
    fg = blur(keep.astype(np.float32), 1.5)
    fg = np.maximum(fg, ramp_y(NECK + 10, NECK + 60))              # everything below the collar counts as giant/scene front
    return put_text(img, color, fg, glow, gapc=905, gap=330)

def code_version(head, color, glow, scale=0.56, cx=930, top=-190):
    base = load(G1A); clean = load(CLEAN)
    # remove the painted head: clean sky above the collar line, only on the giant's side (Ava untouched)
    xs = np.clip((1650 - np.arange(W, dtype=np.float32)) / 80, 0, 1)[None, :]
    rep = (1 - ramp_y(NECK - 70, NECK - 10)) * xs
    img = base * (1 - rep[..., None]) + clean * rep[..., None]
    # our head render
    L = np.asarray(Image.open(os.path.join(OUT, '_layers', head + '.png')).convert('RGBA')).astype(np.float32) / 255
    h, w = L.shape[:2]; nw, nh = int(w * scale), int(h * scale)
    L = cv2.resize(L, (nw, nh), interpolation=cv2.INTER_AREA)
    can = np.zeros((H, W, 4), np.float32); x0, y0 = int(cx - nw / 2), int(top)
    sx, sy, dx, dy = max(0, -x0), max(0, -y0), max(0, x0), max(0, y0); cw, ch = min(nw - sx, W - dx), min(nh - sy, H - dy)
    can[dy:dy + ch, dx:dx + cw] = L[sy:sy + ch, sx:sx + cw]
    hr, ha = can[..., :3], can[..., 3] * (1 - ramp_y(NECK + 20, NECK + 70))      # neck dissolves into the painted collar
    # grade toward the scene (teal ambient, the painted body is cooler/darker)
    l = (hr * np.array([0.3, 0.59, 0.11])).sum(-1, keepdims=True)
    hr = np.clip((hr * 0.8 + l * np.array([0.78, 0.95, 1.0]) * 0.2) * 1.08, 0, 1)
    fg = np.maximum(blur(ha, 1.0), ramp_y(NECK + 10, NECK + 60))
    img = put_text(img, color, np.maximum(fg, 0) * (ha > 0.02) + ramp_y(NECK + 10, NECK + 60) * (ha <= 0.02), glow, gapc=cx + 30, gap=390)
    img = img * (1 - ha[..., None]) + hr * ha[..., None]
    img = rain(img, 3, mask=ha)                                             # rain over the head too
    return np.clip(img, 0, 1)

def save(img, name):
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((1280, 720), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0, 40, 2))
    p = os.path.join(OUT, name + '.png'); im.save(p); print('saved', p)

WHITE, RED = (0.95, 0.94, 0.90), (0.72, 0.06, 0.06)
V = {
    'v6_A_flowhead_red': lambda: flow_version(1, RED, (0.9, 0.1, 0.05)),
    'v6_B_flowhead_white': lambda: flow_version(4, WHITE, None),
    'v6_C_codehead_red': lambda: code_version('hB', RED, (0.9, 0.1, 0.05)),
    'v6_D_codehead_white': lambda: code_version('hB', WHITE, None),
}
if __name__ == '__main__':
    for k in (sys.argv[1:] or V): save(V[k](), k)
