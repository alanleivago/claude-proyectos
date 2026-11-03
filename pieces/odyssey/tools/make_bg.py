# The Odyssey ground (amphora-bf): terracotta paper with mottling, stains, specks and fine grain, a meander frieze on
# top, waves + meander at the bottom. Drawn at 4x and reduced, so it is sharp at 1920x1080 (replaces the upscaled Flow bg).
# usage: make_bg.py OUT.jpg [--ref old_bg.jpg]
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H, S = 1920, 1080, 4
rng = np.random.default_rng(7)
def blur_noise(sigma, amp):
    n = Image.fromarray((rng.random((H // 4, W // 4)) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(sigma))
    a = np.asarray(n.resize((W, H), Image.BICUBIC), float) / 255; a = (a - a.mean()) / (a.std() + 1e-6); return a * amp
base = np.array([214, 122, 66], float)                     # terracotta (sampled from the old bg)
lum = blur_noise(18, 0.045) + blur_noise(5, 0.03) + blur_noise(1.2, 0.012)
img = base[None, None, :] * (1 + lum[..., None])
# streaks (vertical brush drag) and darker stains
st = np.asarray(Image.fromarray((rng.random((8, W // 8)) * 255).astype('uint8')).resize((W, H), Image.BICUBIC), float) / 255
img *= (1 + (st - 0.5) * 0.05)[..., None]
stain = Image.new('L', (W, H), 0); d = ImageDraw.Draw(stain)
for _ in range(70):
    x, y, r = rng.uniform(0, W), rng.uniform(100, 920), rng.uniform(6, 40)
    for k in range(rng.integers(1, 5)):
        dx, dy, rr = rng.normal(0, r), rng.normal(0, r), r * rng.uniform(0.4, 1)
        d.ellipse([x + dx - rr, y + dy - rr, x + dx + rr, y + dy + rr], fill=int(rng.uniform(40, 110)))
sa = np.asarray(stain.filter(ImageFilter.GaussianBlur(3)), float) / 255
img = img * (1 - 0.16 * sa[..., None]) + np.array([150, 60, 30]) * 0.16 * sa[..., None]
spk = Image.new('L', (W * 2, H * 2), 0); d = ImageDraw.Draw(spk)
for _ in range(900):
    x, y, r = rng.uniform(0, W * 2), rng.uniform(200, 1840), rng.uniform(1.2, 4.5) ** 1.2
    d.ellipse([x - r, y - r, x + r, y + r], fill=int(rng.uniform(90, 220)))
sp = np.asarray(spk.resize((W, H), Image.LANCZOS), float) / 255
img = img * (1 - 0.5 * sp[..., None]) + np.array([110, 40, 20]) * 0.5 * sp[..., None]
img += rng.normal(0, 3.0, (H, W, 1))                         # film-fine grain, 1 px
ground = Image.fromarray(np.clip(img, 0, 255).astype('uint8'))
# friezes, drawn at 4x
F = Image.new('L', (W * S, H * S), 0); d = ImageDraw.Draw(F); k = S
def line(x0, y0, x1, y1, w): d.line([x0 * k, y0 * k, x1 * k, y1 * k], fill=255, width=int(w * k))
def meander(y0, h, period):
    line(0, y0 - 6, W, y0 - 6, 4); line(0, y0 + h + 6, W, y0 + h + 6, 4)
    u = h / 7.0; lw = u * 0.62
    for i in range(int(W / period) + 2):
        x = i * period - 2
        pts = [(x, y0 + h), (x, y0), (x + 6 * u, y0), (x + 6 * u, y0 + 5 * u), (x + 2 * u, y0 + 5 * u), (x + 2 * u, y0 + 2 * u),
               (x + 4 * u, y0 + 2 * u), (x + 4 * u, y0 + 3 * u)]
        d.line([(a * k, b * k) for a, b in pts], fill=255, width=int(lw * k), joint='curve')
        line(x, y0 + h, x + period, y0 + h, lw)
def waves(y0, h, period):                                    # the running dog: a crest that curls into a spiral
    base = y0 + h; d.rectangle([0, int((base - h * 0.16) * k), W * k, int((base + 2) * k)], fill=255)
    R = h * 0.42; lw = R * 0.42
    for i in range(-1, int(W / period) + 2):
        cx, cy = i * period + period * 0.5, y0 + h * 0.46
        pts = [(cx - period * 0.62, base - h * 0.1)]
        for j in range(60):                                  # rise into the crest, then spiral inwards
            t = j / 59; th = np.pi * 0.95 - t * 2.15 * np.pi; r = R * (1 - 0.72 * t)
            pts.append((cx + r * np.cos(th), cy - r * np.sin(th)))
        d.line([(x * k, y * k) for x, y in pts], fill=255, width=int(lw * k), joint='curve')
        d.polygon([((cx - period * 0.62) * k, base * k), ((cx - period * 0.62) * k, (base - h * 0.12) * k),
                   ((cx - R) * k, (cy + R * 0.2) * k), ((cx - R * 0.4) * k, base * k)], fill=255)
meander(18, 62, 107)
waves(925, 56, 75)
meander(992, 72, 107)
fr = F.resize((W, H), Image.LANCZOS)
ink = Image.new('RGB', (W, H), (18, 10, 8))
out = Image.composite(ink, ground, fr)
out.save(sys.argv[1], quality=95, subsampling=0)
print('wrote', sys.argv[1])
