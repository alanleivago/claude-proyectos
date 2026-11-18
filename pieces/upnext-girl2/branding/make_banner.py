"""YouTube banners for the girl2 channel (2560x1440, logo/text inside the 1546x423 safe area) + 1500x500 crops.
Built like the Mechayuki banner: a 640x360 base canvas (PS1 15-bit colour with 4x4 Bayer dither) scaled x4 nearest;
Ashley = engine render of the tights GLB (tools/anim/render2.mjs brand, alpha) scaled x2 nearest; pixel type drawn at
base resolution (no antialias) on its own layer so the channel name can be swapped:
  python branding/make_banner.py [--name "YOUR NAME"] [--tag "your tagline here"]
Outputs per variant (A = title screen at dusk, B = character select):
  banner_<v>_2560x1440.png, banner_<v>_1500x500.png, banner_<v>_art.png (no text), banner_<v>_text.png (text layer),
  _banner_<v>_safezones.png (TV / desktop / mobile+safe guides)"""
import os, sys, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
ap = argparse.ArgumentParser(); ap.add_argument("--name", default="YOUR NAME"); ap.add_argument("--tag", default="your tagline here")
args = ap.parse_args()
W, Hh, K = 640, 360, 4
SAFE = (127, 127, 513, 233)                      # base coords of the 1546x423 safe area
CROP15 = (530, 470, 2030, 970)                   # 1500x500 crop (banner px)
FONT_PIX = "../../pup-branding/fonts/PressStart2P-Regular.ttf"
FONT_BIG = "../../expedition-01-bedroom/engine/fonts/PixelifySans.ttf"
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.47


def ps1(arr):
    """15-bit colour with ordered dither (base canvas, float RGB 0-255)"""
    h, w = arr.shape[:2]; b = np.tile(BAYER, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
    return np.clip(np.floor((arr + b * 8.0) / 8.0) * 8.0 + 4, 0, 255).astype(np.uint8)


def vgrad(stops, h=Hh, w=W):
    ys = np.arange(h)[:, None]; out = np.zeros((h, w, 3))
    pos = [p for p, _ in stops]; cols = np.array([c for _, c in stops], float)
    for k in range(3): out[..., k] = np.interp(ys, pos, cols[:, k])
    return out


def up(im, k=K): return im.resize((im.width * k, im.height * k), Image.NEAREST)


def hero(name, height_px, scale=2):
    """engine render (alpha) cropped to the body, scaled x`scale` nearest so the body is about height_px banner px"""
    im = Image.open(f"brand_{name}.png").convert("RGBA"); a = np.asarray(im)[..., 3]; ys, xs = np.nonzero(a > 8)
    im = im.crop((xs.min() - 2, ys.min() - 2, xs.max() + 3, ys.max() + 3))
    k = height_px / (im.height * scale); im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.NEAREST)
    return up(im, scale)


def text_layer(lines):
    """lines: (text, font, size, (x, y) base px, fill, outline, anchor) -> RGBA banner-size layer (pixel type x4)"""
    lay = Image.new("RGBA", (W, Hh), (0, 0, 0, 0)); d = ImageDraw.Draw(lay); d.fontmode = "1"
    for txt, font, size, (x, y), fill, outline, anchor, maxw in lines:
        f = ImageFont.truetype(font, size)
        while maxw and d.textlength(txt, font=f) > maxw and size > 8: size -= 2; f = ImageFont.truetype(font, size)
        sh = max(1, size // 12)
        d.text((x + sh + 1, y + sh + 1), txt, font=f, fill=(20, 10, 40, 160), anchor=anchor)             # drop shadow
        if outline:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if dx or dy: d.text((x + dx, y + dy), txt, font=f, fill=outline, anchor=anchor)
        d.text((x, y), txt, font=f, fill=fill, anchor=anchor)
    return up(lay)


def sparkle(d, x, y, r, col):
    d.line([(x - r, y), (x + r, y)], fill=col); d.line([(x, y - r), (x, y + r)], fill=col); d.point((x, y), fill=(255, 255, 255))


# ================================================================ A: title screen at dusk (wave)
def variant_a():
    sky = vgrad([(0, (28, 18, 72)), (120, (78, 36, 128)), (205, (214, 86, 150)), (236, (255, 150, 160))])
    base = Image.fromarray(ps1(sky)); d = ImageDraw.Draw(base)
    hz = 236
    # low-poly hills on the horizon (flat-shaded triangles, 2 tones)
    for pts, col in (([(0, hz), (70, 206), (150, hz)], (92, 40, 120)), ([(110, hz), (215, 196), (330, hz)], (110, 48, 132)),
                     ([(300, hz), (420, 210), (540, hz)], (92, 40, 120)), ([(480, hz), (585, 200), (640, 222), (640, hz)], (110, 48, 132)),
                     ([(215, 196), (250, 214), (330, hz), (215, hz)], (84, 34, 110)), ([(585, 200), (612, 218), (640, hz), (585, hz)], (84, 34, 110))):
        d.polygon(pts, fill=col)
    # floor: dark violet, perspective grid
    floor = vgrad([(hz, (58, 24, 86)), (Hh, (26, 12, 46))])[hz:]
    base.paste(Image.fromarray(ps1(floor)), (0, hz)); d = ImageDraw.Draw(base)
    vx = 320
    for i in range(-14, 15):
        d.line([(vx + i * 6, hz), (vx + i * 70, Hh)], fill=(150, 64, 150))
    y = hz + 2; step = 2
    while y < Hh: d.line([(0, y), (W, y)], fill=(150, 64, 150)); step *= 1.45; y += max(2, int(step))
    # pixel stars
    rng = np.random.default_rng(7)
    for _ in range(46):
        x, yy = int(rng.integers(0, W)), int(rng.integers(4, 150))
        if SAFE[0] - 4 < x < 360 and SAFE[1] - 6 < yy < SAFE[3]: continue
        d.point((x, yy), fill=(255, 236, 250) if rng.random() < 0.6 else (255, 190, 230))
    for x, yy, r in ((560, 70, 3), (90, 54, 2), (250, 30, 2), (604, 150, 2)): sparkle(d, x, yy, r, (255, 220, 245))
    art = up(base).convert("RGBA")
    h = hero("hero_wave", 1180); art.alpha_composite(h, (1730 - h.width // 2, 528))
    txt = text_layer([(args.name, FONT_PIX, 24, (138, 160), (255, 236, 120, 255), (60, 18, 70, 255), "lm", 200),
                      (args.tag, FONT_PIX, 8, (140, 190), (255, 225, 245, 255), (60, 18, 70, 255), "lm", 200),
                      ("▶ SUBSCRIBE", FONT_PIX, 8, (140, 212), (255, 255, 255, 255), (200, 40, 90, 255), "lm", 0)])
    return art, txt


# ================================================================ B: character select (hand on hip)
def variant_b():
    bg = vgrad([(0, (40, 200, 214)), (Hh, (22, 150, 180))])
    yy, xx = np.mgrid[0:Hh, 0:W]; stripe = ((xx + yy) // 10) % 2 == 0
    bg[stripe] += np.array([8, 8, 6])
    base = Image.fromarray(ps1(bg)); d = ImageDraw.Draw(base)
    # big emblem behind her: low-poly octagon in pink with a white rim
    cx, cy, r = 205, 172, 66
    oct_ = lambda rr: [(cx + rr * np.cos(np.pi / 8 + k * np.pi / 4), cy + rr * np.sin(np.pi / 8 + k * np.pi / 4)) for k in range(8)]
    d.polygon(oct_(r + 5), fill=(255, 255, 255)); d.polygon(oct_(r), fill=(255, 112, 172))
    for k in range(8):                                             # two-tone facets (PS1 flat shading)
        if k % 2 == 0: d.polygon([(cx, cy), oct_(r)[k], oct_(r)[(k + 1) % 8]], fill=(240, 92, 156))
    # name plate on the right
    d.rectangle([272, 140, 506, 222], fill=(18, 40, 70)); d.rectangle([272, 140, 506, 143], fill=(255, 112, 172))
    d.rectangle([270, 138, 274, 224], fill=(255, 255, 255))
    for i in range(3):                                             # three pixel hearts (a tiny life bar)
        hx, hy = 286 + i * 16, 206
        for px, py in ((1, 0), (2, 0), (4, 0), (5, 0), (0, 1), (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (0, 2), (1, 2), (2, 2), (3, 2), (4, 2), (5, 2), (6, 2),
                       (1, 3), (2, 3), (3, 3), (4, 3), (5, 3), (2, 4), (3, 4), (4, 4), (3, 5)):
            d.point((hx + px, hy + py), fill=(255, 92, 140))
    for x, y_, r_ in ((90, 60, 3), (560, 300, 3), (600, 60, 2), (40, 290, 2)): sparkle(d, x, y_, r_, (255, 255, 255))
    art = up(base).convert("RGBA")
    h = hero("hero_hip", 1180); art.alpha_composite(h, (820 - h.width // 2, 528))
    txt = text_layer([(args.name, FONT_PIX, 24, (286, 166), (255, 236, 120, 255), (10, 24, 44, 255), "lm", 210),
                      (args.tag, FONT_PIX, 8, (287, 190), (210, 245, 255, 255), None, "lm", 210)])
    return art, txt


def safezones(im):
    o = im.convert("RGBA"); d = ImageDraw.Draw(o)
    d.rectangle([0, 508, 2559, 931], outline=(255, 255, 0, 255), width=6)               # desktop band
    d.rectangle([507, 508, 2052, 931], outline=(255, 0, 0, 255), width=8)               # mobile / safe area
    d.rectangle(list(CROP15[:2]) + [CROP15[2] - 1, CROP15[3] - 1], outline=(0, 255, 0, 255), width=4)   # 1500x500 crop
    return o.convert("RGB")


for v, fn in (("A", variant_a), ("B", variant_b)):
    art, txt = fn()
    comp = art.copy(); comp.alpha_composite(txt); comp = comp.convert("RGB")
    art.convert("RGB").save(f"banner_{v}_art.png"); txt.save(f"banner_{v}_text.png"); comp.save(f"banner_{v}_2560x1440.png")
    comp.crop(CROP15).save(f"banner_{v}_1500x500.png"); safezones(comp).save(f"_banner_{v}_safezones.png")
    print("banner", v, comp.size)
