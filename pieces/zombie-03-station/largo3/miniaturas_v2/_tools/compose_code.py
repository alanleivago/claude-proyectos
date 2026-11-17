# compose_code.py — miniaturas v2 hechas en código (key art estilo RE Requiem en horizontal).
# Capas con alfa de engine/thumb.js (thumb_shoot.mjs) -> _layers/; aquí: fondo de ruinas, doble exposición del gigante,
# siluetas en la niebla, Ava, destello de linterna, lluvia, grade frío y texto (Anton).
# python compose_code.py [A1|A2|A3 ...]
import sys, os, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(HERE); LAY = os.path.join(OUT, '_layers')
FONTS = os.path.abspath(os.path.join(OUT, '../../../../styles/ava-restfield/fonts'))
W, H = 2560, 1440

def load(n):
    return np.asarray(Image.open(os.path.join(LAY, n + '.png')).convert('RGBA')).astype(np.float32) / 255

def blur(a, s):
    return cv2.GaussianBlur(a, (0, 0), s) if s > 0 else a

def over(dst, rgb, a):
    a = a[..., None] if a.ndim == 2 else a
    return dst * (1 - a) + rgb * a

def screen(dst, rgb, a=1.0):
    a = a[..., None] if np.ndim(a) == 2 else a
    return dst + (1 - dst) * rgb * a

def place(layer, scale, cx, top, flip=False):
    """layer RGBA float -> full-canvas (rgb, a) with layer's top-center at (cx, top)"""
    h, w = layer.shape[:2]; nw, nh = int(w * scale), int(h * scale)
    L = cv2.resize(layer, (nw, nh), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
    if flip: L = L[:, ::-1]
    can = np.zeros((H, W, 4), np.float32); x0, y0 = int(cx - nw / 2), int(top)
    sx0, sy0 = max(0, -x0), max(0, -y0); dx0, dy0 = max(0, x0), max(0, y0)
    cw, chh = min(nw - sx0, W - dx0), min(nh - sy0, H - dy0)
    if cw > 0 and chh > 0: can[dy0:dy0 + chh, dx0:dx0 + cw] = L[sy0:sy0 + chh, sx0:sx0 + cw]
    rgb = can[..., :3]; a = can[..., 3]
    return rgb, a, (x0, y0, nw, nh)

def lum(rgb):
    return rgb[..., 0] * 0.3 + rgb[..., 1] * 0.59 + rgb[..., 2] * 0.11

def grad_y(y0, y1):
    y = np.linspace(0, 1, H)[:, None] * np.ones((1, W)); return np.clip((y * H - y0) / (y1 - y0), 0, 1)

def rnd(seed): return np.random.default_rng(seed)

# ---------------------------------------------------------------- background: misty sky + ruined city layers
def city_layer(r, base_y, hmin, hmax, wmin, wmax, color, win=0.0, broken=0.35):
    img = Image.new('L', (W, H), 0); d = ImageDraw.Draw(img); x = -50
    wins = Image.new('L', (W, H), 0); dw = ImageDraw.Draw(wins)
    while x < W + 50:
        bw = r.integers(wmin, wmax); bh = r.integers(hmin, hmax); top = base_y - bh
        poly = [(x, H), (x, top)]
        if r.random() < broken:   # broken roof: jagged top
            n = r.integers(3, 7)
            for k in range(1, n):
                poly.append((x + bw * k / n, top + r.integers(-min(40, bh // 10), min(60, bh // 6))))
        else:
            poly.append((x + bw * 0.1, top)); poly.append((x + bw * 0.1, top - r.integers(0, 40)))
            poly.append((x + bw * 0.15, top - r.integers(0, 40))); poly.append((x + bw * 0.15, top))
        poly += [(x + bw, top + r.integers(-20, 30)), (x + bw, H)]
        d.polygon(poly, fill=255)
        if win > 0:
            cols = max(2, bw // 26); rows = max(3, bh // 34)
            for i in range(cols):
                for j in range(rows):
                    if r.random() < win:
                        wx = x + 8 + i * (bw - 16) / cols; wy = top + 24 + j * 34
                        dw.rectangle([wx, wy, wx + 9, wy + 14], fill=int(120 + 135 * r.random()))
        x += bw + r.integers(-10, 25)
    return np.asarray(img).astype(np.float32) / 255, np.asarray(wins).astype(np.float32) / 255 * (np.asarray(img) > 0)

def background(seed, sky_bright=(0.62, 0.70, 0.74), glow_x=0.62):
    r = rnd(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); u, v = xx / W, yy / H
    top = np.array([0.30, 0.37, 0.42]); mid = np.array(sky_bright); low = np.array([0.20, 0.26, 0.30])
    k = np.clip(v / 0.55, 0, 1)[..., None]
    sky = top * (1 - k) + mid * k
    glow = np.exp(-(((u - glow_x) / 0.28) ** 2 + ((v - 0.30) / 0.30) ** 2))[..., None]   # bright haze behind
    sky = sky + glow * np.array([0.22, 0.24, 0.24])
    sky = sky * (1 - np.clip((v - 0.55) / 0.45, 0, 1)[..., None] * 0.35)
    # clouds: big soft noise
    n = blur(r.random((H // 16, W // 16)).astype(np.float32), 2.5); n = cv2.resize(n, (W, H), interpolation=cv2.INTER_CUBIC)
    n = (n - n.mean()) / (n.std() + 1e-6)
    sky = sky + n[..., None] * 0.035
    img = sky
    # city layers far -> near (lighter -> darker), fogged
    for i, (by, hmn, hmx, wmn, wmx, col, fogk, win) in enumerate([
        (H * 0.70, 160, 460, 50, 140, (0.47, 0.54, 0.58), 0.0, 0.0),
        (H * 0.80, 220, 600, 80, 200, (0.36, 0.43, 0.47), 0.0, 0.02),
        (H * 0.92, 260, 760, 110, 280, (0.22, 0.27, 0.31), 0.0, 0.04),
    ]):
        m, wn = city_layer(r, int(by), hmn, hmx, wmn, wmx, col, win=win)
        m = blur(m, 3.5 - i * 1.0)
        tex = 1 + (cv2.resize(blur(r.random((H // 6, W // 6)).astype(np.float32), 0.6), (W, H)) - 0.5)[..., None] * 0.25
        img = over(img, np.array(col) * tex, m * (0.75 + 0.1 * i))
        if win: img = screen(img, np.array([1.0, 0.78, 0.5]), blur(wn, 1.2) * 0.35)
    return img.astype(np.float32)

# ---------------------------------------------------------------- double exposure of the giant
def giant(img, name, scale, cx, top, flip=False, fade=(0.45, 0.95), strength=0.92, contrast=1.5, city_seed=7, haze=(0.55, 0.62, 0.66)):
    L = load(name); rgb, a, (x0, y0, nw, nh) = place(L, scale, cx, top, flip)
    g = lum(rgb); sel = g[a > 0.5]; lo, hi = np.percentile(sel, 3), np.percentile(sel, 99.5)
    g = np.clip((g - lo) / (hi - lo + 1e-6), 0, 1)
    g = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8)).apply((g * 255).astype(np.uint8)).astype(np.float32) / 255
    g = np.clip((g - 0.5) * contrast + 0.5, 0, 1) ** 1.1 * 0.92 + 0.04   # desaturated, punchy
    col = np.stack([g * 0.93, g * 0.99, g * 1.03], -1) * 0.9 + rgb * 0.1
    col = col * 0.8 + np.array(haze) * 0.2                                           # atmospheric
    col = blur(col, 2.2 * scale)                                                     # soft like a photo double exposure (hides the 128 px texels)
    fy = grad_y(y0 + nh * fade[0], y0 + nh * fade[1])
    aa = blur(a, 2) * (1 - fy) * strength
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    rr = np.sqrt(((xx - (x0 + nw * 0.5)) / (nw * 0.36)) ** 2 + ((yy - (y0 + nh * 0.55)) / (nh * 0.36)) ** 2)
    aa = aa * np.clip(2.2 - 1.6 * rr, 0, 1)                                          # dissolve the edges (neck chunk, shoulders)
    img = over(img, col, aa * 0.88)
    img = screen(img, col, aa * 0.22)
    # city ruins INSIDE the lower part of the head (double exposure)
    r = rnd(city_seed); m, wn = city_layer(r, int(y0 + nh * 0.98), int(nh * 0.12), int(nh * 0.40), 50, 150, None, win=0.05)
    hm = blur(a, 10) * grad_y(y0 + nh * fade[0] - nh * 0.05, y0 + nh * fade[1])
    img = over(img, np.array([0.24, 0.30, 0.34]), blur(m, 2.0) * hm * 0.8)
    img = screen(img, np.array([1.0, 0.8, 0.55]), blur(wn, 1) * hm * 0.4)
    return img

# ---------------------------------------------------------------- fog + silhouettes
def fog(img, seed, cx=0.25, cy=0.92, rx=0.45, ry=0.22, k=0.75, col=(0.78, 0.84, 0.86)):
    r = rnd(seed); yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); u, v = xx / W, yy / H
    n = blur(r.random((H // 24, W // 24)).astype(np.float32), 1.6); n = cv2.resize(n, (W, H), interpolation=cv2.INTER_CUBIC)
    n = np.clip((n - n.min()) / (n.max() - n.min()), 0, 1)
    f = np.exp(-(((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2)) * (0.55 + 0.6 * n)
    f = np.clip(f * k, 0, 1)
    return over(img, np.array(col), f), f

def zombies(img, name, scale, cx, top, fogmask, dark=0.06, hazek=0.5, flip=False):
    L = load(name); rgb, a, _ = place(L, scale, cx, top, flip)
    a = blur(a, 1.0)
    img = over(img, np.array([dark, dark + 0.02, dark + 0.04]), a * (1 - fogmask * hazek))
    return img

def zombie_row(img, fogmask, specs):
    for (name, sc, cx, top, hz, fl) in specs:
        img = zombies(img, name, sc, cx, top, fogmask, hazek=hz, flip=fl)
    return img

# ---------------------------------------------------------------- Ava
def ava(img, name, scale, cx, top, rim=0.55, cool=0.18):
    L = load(name); rgb, a, (x0, y0, nw, nh) = place(L, scale, cx, top)
    # grade her: cool shadows, keep warm highlights
    l = lum(rgb)[..., None]
    shadow = np.array([0.55, 0.70, 0.85]); rgb2 = rgb * (1 - cool * (1 - l)) + rgb * shadow * cool * (1 - l)
    rgb2 = np.clip((rgb2 - 0.02) * 1.12, 0, 1)
    # rim light from the bright sky behind (left + top edges)
    ab = blur(a, 5); edge = np.clip(a - np.roll(np.roll(ab, 9, 1), 7, 0), 0, 1)
    edge2 = np.clip(a - np.roll(ab, -9, 1), 0, 1) * 0.6
    rgb2 = screen(rgb2, np.array([0.70, 0.84, 0.95]), (edge + edge2) * rim)
    # contact shadow halo behind her (separation)
    img = img * (1 - blur(a, 30)[..., None] * 0.25)
    img = over(img, rgb2, a)
    with open(os.path.join(LAY, name + '.json')) as f:
        import json; lens = json.load(f)['lens']
    lx, ly = x0 + lens[0] * scale, y0 + lens[1] * scale
    return img, (lx, ly), a

# ---------------------------------------------------------------- flashlight flare
def flare(img, lx, ly, k=1.0, ring=True):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); dx, dy = xx - lx, yy - ly; d = np.sqrt(dx * dx + dy * dy)
    core = np.exp(-(d / 22) ** 2); glow = np.exp(-(d / 120) ** 2) * 0.55 + np.exp(-(d / 380) ** 2) * 0.22
    warm = np.array([1.0, 0.86, 0.62]); img = screen(img, warm, np.clip(glow * k, 0, 1)); img = screen(img, np.array([1, 1, 0.97]), np.clip(core * 1.4 * k, 0, 1))
    streak = np.exp(-(dy / 6) ** 2) * np.exp(-(np.abs(dx) / 700)) * 0.75 + np.exp(-(dy / 26) ** 2) * np.exp(-(np.abs(dx) / 260)) * 0.25
    img = screen(img, np.array([0.70, 0.86, 1.0]), np.clip(streak * k, 0, 1))
    star = (np.exp(-(np.abs(dx) / 3)) * np.exp(-(np.abs(dy) / 160)) + np.exp(-(np.abs(dx - dy) / 4)) * np.exp(-d / 110) + np.exp(-(np.abs(dx + dy) / 4)) * np.exp(-d / 110)) * 0.35
    img = screen(img, np.array([1, 0.95, 0.85]), np.clip(star * k, 0, 1))
    if ring:   # faint rainbow halo ring (as in the ref)
        R = 210
        for ch, off in zip(range(3), (-10, 0, 10)):
            rr = np.exp(-((d - R - off) / 9) ** 2) * 0.18 * k
            img[..., ch] = img[..., ch] + (1 - img[..., ch]) * rr * (0.5 + 0.5 * (dx < 60))
        # ghosts towards frame centre
        for t, rad, a in ((0.45, 40, 0.10), (0.7, 70, 0.06), (1.25, 26, 0.08)):
            gx, gy = lx + (W / 2 - lx) * t * 2, ly + (H / 2 - ly) * t * 2
            gd = np.sqrt((xx - gx) ** 2 + (yy - gy) ** 2)
            img = screen(img, np.array([0.55, 0.85, 0.8]), np.clip(np.exp(-(gd / rad) ** 4) * a * k, 0, 1))
    return img

# ---------------------------------------------------------------- rain
def rain(img, seed, n=(2600, 900, 120), ang=0.16, k=1.0, light=None):
    r = rnd(seed); out = img.copy()
    L = lum(img)
    for layer, (cnt, ln, wd, op, bl) in enumerate([(n[0], (22, 60), 1, 0.30, 0.6), (n[1], (60, 160), 2, 0.38, 1.0), (n[2], (180, 420), 4, 0.30, 2.6)]):
        m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
        for _ in range(cnt):
            x, y = r.random() * (W + 200) - 100, r.random() * H; l = r.uniform(*ln)
            d.line([(x, y), (x + math.sin(ang) * l, y + math.cos(ang) * l)], fill=int(255 * r.uniform(0.4, 1)), width=wd)
        a = blur(np.asarray(m).astype(np.float32) / 255, bl)
        lit = 0.35 + 0.9 * np.clip(blur(L, 40), 0, 1)                                   # rain shows where it is backlit
        if light is not None: lit = lit + light
        out = screen(out, np.array([0.86, 0.92, 0.96]), np.clip(a * op * lit * k, 0, 1))
    return out

def splash_mist(img, seed, y0=0.86):
    r = rnd(seed); m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for _ in range(900):
        x, y = r.random() * W, H * (y0 + r.random() * (1 - y0)); s = r.uniform(2, 7)
        d.ellipse([x - s * 2, y - s * 0.6, x + s * 2, y + s * 0.6], fill=int(255 * r.uniform(0.2, 0.7)))
    a = blur(np.asarray(m).astype(np.float32) / 255, 1.5)
    return screen(img, np.array([0.8, 0.88, 0.92]), blur(a, 2.5) * 0.18)

# ---------------------------------------------------------------- grade
def grade(img, seed, vign=0.55, teal=1.0):
    img = np.clip(img, 0, 1)
    l = lum(img)[..., None]
    sh = np.array([0.04, 0.10, 0.13]); hi = np.array([0.93, 0.97, 1.0])
    img = img * (1 - 0.25 * teal) + (sh * (1 - l) + hi * l) * img * 0.25 * teal * 1.6
    img = np.clip(img, 0, 1)
    # S-curve
    img = img * img * (3 - 2 * img) * 0.55 + img * 0.45
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); u, v = xx / W - 0.5, yy / H - 0.5
    vg = 1 - vign * np.clip((u * u * 1.1 + v * v * 1.6) * 1.6, 0, 1) ** 1.4
    img = img * vg[..., None]
    g = rnd(seed).normal(0, 0.018, (H, W)).astype(np.float32); img = img + g[..., None]
    return np.clip(img, 0, 1)

# ---------------------------------------------------------------- text (Anton, no boxes)
def text(img, lines, x, y, anchor='ls', shadow=0.75):
    """lines: [(txt, size_px, rgb, dy, tracking)] drawn from (x,y). soft dark glow behind for legibility."""
    pil = Image.fromarray((img * 255).astype(np.uint8)); tl = Image.new('L', (W, H), 0); dt = ImageDraw.Draw(tl)
    col = Image.new('RGB', (W, H)); dc = ImageDraw.Draw(col); m = Image.new('L', (W, H), 0); dm = ImageDraw.Draw(m)
    for (txt, size, rgb, dy, trk) in lines:
        f = ImageFont.truetype(os.path.join(FONTS, 'Anton-Regular.ttf'), size)
        cx = x
        for chh in txt:
            dm.text((cx, y + dy), chh, font=f, fill=255, anchor=anchor); dc.text((cx, y + dy), chh, font=f, fill=tuple(int(c * 255) for c in rgb), anchor=anchor)
            cx += f.getlength(chh) + trk
    ma = np.asarray(m).astype(np.float32) / 255
    sh = blur(cv2.dilate(ma, np.ones((9, 9))), 22) * shadow
    hard = np.roll(np.roll(ma, 8, 0), 6, 1) * 0.85
    out = img * (1 - np.clip(sh + hard * 0.0, 0, 1)[..., None])
    out = out * (1 - hard[..., None] * 0.7)
    out = over(out, np.asarray(col).astype(np.float32) / 255, ma)
    return out

def save(img, name):
    p = os.path.join(OUT, name + '.png')
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((1280, 720), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    im.save(p); print('saved', p)

# ================================================================ versions
def A1(text_on=True):
    img = background(11, glow_x=0.58)
    img = giant(img, 'stA', 1.3, 760, -690, fade=(0.74, 0.95), contrast=1.7)
    img, fm = fog(img, 3, cx=0.45, cy=0.9, rx=0.35, ry=0.16, k=0.85)
    img = zombie_row(img, fm, [('zC', 0.62, 1090, 790, 0.45, False)])
    img, fm2 = fog(img, 5, cx=0.25, cy=1.04, rx=0.6, ry=0.12, k=0.6)
    img = img * (1 - 0.35 * grad_y(H * 0.75, H)[..., None])
    img = rain(img, 21, k=0.9)
    img, (lx, ly), a = ava(img, 'avaA', 0.82, 1930, 90)
    img = flare(img, lx, ly, 1.0)
    img = rain(img, 22, n=(0, 260, 50), k=0.8)
    img = splash_mist(img, 4)
    img = grade(img, 9)
    if text_on:
        img = text(img, [('IT FOLLOWED ME', 200, (0.97, 0.97, 0.95), 0, 3)], 80, 1370)
        img = text(img, [('DAY 3', 110, (0.90, 0.14, 0.12), 0, 5)], 84, 1150)
    return img

def A2(text_on=False):
    img = background(12, glow_x=0.5)
    img = giant(img, 'stB', 1.4, 820, -760, fade=(0.74, 0.95), contrast=1.7)
    img, fm = fog(img, 6, cx=0.25, cy=0.95, rx=0.45, ry=0.2, k=0.9)
    img = zombie_row(img, fm, [('zB', 0.55, 1050, 700, 0.65, True), ('zC', 1.1, 780, 520, 0.3, False)])
    img, fm2 = fog(img, 8, cx=0.25, cy=1.04, rx=0.6, ry=0.12, k=0.55)
    img = img * (1 - 0.3 * grad_y(H * 0.8, H)[..., None])
    img = rain(img, 31, k=1.0)
    img, (lx, ly), a = ava(img, 'avaC', 0.86, 1920, 60)
    img = flare(img, lx, ly, 1.1)
    img = rain(img, 32, n=(0, 300, 60), k=0.9)
    img = splash_mist(img, 7)
    img = grade(img, 10)
    return img

def A3(text_on=True):
    img = background(13, glow_x=0.55)
    img = giant(img, 'stA', 1.35, 780, -720, flip=True, fade=(0.74, 0.95), contrast=1.7)
    img, fm = fog(img, 9, cx=0.45, cy=0.9, rx=0.35, ry=0.16, k=0.85)
    img = zombie_row(img, fm, [('zC', 0.62, 1100, 800, 0.45, True)])
    img, _ = fog(img, 10, cx=0.25, cy=1.04, rx=0.6, ry=0.12, k=0.55)
    img = img * (1 - 0.35 * grad_y(H * 0.75, H)[..., None])
    img = rain(img, 41, k=1.0)
    img, (lx, ly), a = ava(img, 'avaB', 0.74, 1960, 40)
    img = flare(img, lx, ly, 1.1)
    img = rain(img, 42, n=(0, 280, 60), k=0.9)
    img = splash_mist(img, 11)
    img = grade(img, 12)
    if text_on:
        img = text(img, [('RUN', 300, (0.97, 0.97, 0.95), 0, 4)], 80, 1180)
        img = text(img, [('OR FIGHT?', 170, (0.90, 0.14, 0.12), 0, 3)], 84, 1380)
    return img

if __name__ == '__main__':
    for v in (sys.argv[1:] or ['A1', 'A2', 'A3']):
        f = globals()[v]; name = {'A1': 'code_A1_text', 'A2': 'code_A2_notext', 'A3': 'code_A3_text'}[v]
        save(f(), name)
