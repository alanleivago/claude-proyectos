# compose_v4.py — B3 sin gigante (plate de Flow, pistola corregida) + render REAL de stalker_ps1.glb (thumb_shoot.mjs, sin Flow).
# El gigante queda nítido y facetado (texturas 128 px nearest); solo grade teal, bruma, lluvia y fundido inferior.
import os, sys, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(HERE); LAY = os.path.join(OUT, '_layers'); FL = os.path.join(OUT, '_flow')
W, H = 2560, 1440

def blur(a, s): return cv2.GaussianBlur(a, (0, 0), s)
def lum(x): return x[..., 0] * 0.3 + x[..., 1] * 0.59 + x[..., 2] * 0.11
def gy(y0, y1): return np.clip((np.arange(H, dtype=np.float32)[:, None] - y0) / (y1 - y0), 0, 1) * np.ones((1, W), np.float32)

def plate(name):
    im = Image.open(os.path.join(FL, name)).convert('RGB'); w, h = im.size; tw = round(h * 16 / 9)
    im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h)).resize((W, H), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255

def giant(name, scale, cx, top):
    L = np.asarray(Image.open(os.path.join(LAY, name + '.png')).convert('RGBA')).astype(np.float32) / 255
    h, w = L.shape[:2]; nw, nh = int(w * scale), int(h * scale)
    u = np.linspace(0, 1, w)[None, :]; v = np.linspace(0, 1, h)[:, None]
    ss = lambda x: np.clip(x, 0, 1) ** 2 * (3 - 2 * np.clip(x, 0, 1))
    L[..., 3] *= ss(u / 0.16) * ss((1 - u) / 0.16) * ss((1 - v) / 0.08)      # dissolve the frame-cut shoulders and the bottom
    L = cv2.resize(L, (nw, nh), interpolation=cv2.INTER_AREA)          # area downscale: keeps facets + texels crisp
    can = np.zeros((H, W, 4), np.float32); x0, y0 = int(cx - nw / 2), int(top)
    sx, sy, dx, dy = max(0, -x0), max(0, -y0), max(0, x0), max(0, y0); cw, ch = min(nw - sx, W - dx), min(nh - sy, H - dy)
    can[dy:dy + ch, dx:dx + cw] = L[sy:sy + ch, sx:sx + cw]
    return can[..., :3], can[..., 3]

def rain(img, seed, k=0.5, ang=0.22):
    r = np.random.default_rng(seed); out = img
    for cnt, ln, wd, op, bl in ((1800, (30, 80), 1, 0.35, 0.5), (500, (90, 200), 2, 0.30, 1.0)):
        m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
        for _ in range(cnt):
            x, y = r.random() * (W + 300) - 150, r.random() * H; l = r.uniform(*ln)
            d.line([(x, y), (x + math.sin(ang) * l, y + math.cos(ang) * l)], fill=int(255 * r.uniform(0.4, 1)), width=wd)
        a = blur(np.asarray(m).astype(np.float32) / 255, bl)[..., None] * op * k
        out = out + (1 - out) * a * np.array([0.82, 0.9, 0.94])
    return out

def compose(plate_name, gname, scale, cx, top, fade=(980, 1230), haze=0.12, teal=0.33, seed=1, warm=0.0):
    bg = plate(plate_name)
    rgb, a = giant(gname, scale, cx, top)
    # grade the giant into the scene: teal toward the sky colour, slight desat, a little darker; keep the tubes' red alive
    sky = np.median(bg[60:500, 100:1500].reshape(-1, 3), 0)
    l = lum(rgb)[..., None]
    g = rgb * (1 - teal) + (l * np.array([0.80, 1.0, 1.05])) * teal
    g = g * 0.92 + sky * haze                                          # atmospheric perspective (it is far away)
    g = np.clip((g - 0.45) * 1.18 + 0.45, 0, 1)
    # cold rim already in the render; add a soft warm wash on the side facing the flashlight (right)
    if warm:
        xx = np.linspace(0, 1, W)[None, :, None]; g = g + warm * np.clip((xx - 0.3) / 0.4, 0, 1) * np.array([0.10, 0.05, 0.0]) * a[..., None]
    # bottom dissolve into fog/ruins (double exposure fade), only at the lower edge
    f = 1 - gy(*fade); aa = a * f
    out = bg * (1 - aa[..., None]) + g * aa[..., None]
    # fog band over its lower part
    fog = (gy(fade[0] - 200, fade[1]) * (1 - gy(fade[1] + 150, fade[1] + 400)))
    n = cv2.resize(blur(np.random.default_rng(seed).random((H // 30, W // 30)).astype(np.float32), 1.2), (W, H))
    fogm = np.clip(fog * (0.4 + 0.8 * n) * a * 0.55, 0, 1)[..., None]
    out = out * (1 - fogm) + np.array([0.55, 0.64, 0.66]) * fogm
    # keep the plate's foreground in front: zombie silhouettes + dark ruins (dark pixels clearly below the sky level)
    pl = lum(bg); sl = lum(sky[None, None, :])[0, 0]
    fg = np.clip((sl - 0.05 - pl) / 0.06, 0, 1)
    zone = np.zeros((H, W), np.float32); zone[950:, :1300] = 1; zone[:, 1250:1700] = 1
    zone = blur(zone, 20); fgm = blur(fg * zone, 1.2)[..., None]
    out = out * (1 - fgm) + bg * fgm
    out = rain(out, seed + 7, k=0.55)
    return np.clip(out, 0, 1)

def save(img, name):
    im = Image.fromarray((img * 255).astype(np.uint8)).resize((1280, 720), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0, 40, 2))
    p = os.path.join(OUT, name + '.png'); im.save(p); print('saved', p)

P1 = '2026-11-16T23-05-08-edit-g1a_base-completely-remove-the-gian-1.jpg'
P3 = '2026-11-16T23-05-08-edit-g1a_base-completely-remove-the-gian-3.jpg'
V = {
    'v4_A_34_notext': (P1, 'bA_34', 0.5, 760, -40, dict(seed=1, warm=1.0)),
    'v4_B_low_notext': (P1, 'bB_low', 0.5, 760, -30, dict(seed=2, warm=1.0)),
    'v4_C_front_notext': (P3, 'bC_front', 0.5, 760, -40, dict(seed=3, warm=0.8)),
    'v4_D_34L_notext': (P3, 'bD_34L', 0.5, 780, -20, dict(seed=4, warm=1.0)),
}
if __name__ == '__main__':
    for k in (sys.argv[1:] or V):
        pn, g, s, cx, top, kw = V[k]; save(compose(pn, g, s, cx, top, **kw), k)
