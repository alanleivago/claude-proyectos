"""venv: prop + easter-egg textures for lps-onoda (pixel art, nearest). Writes tex/props/*.png and tex/eggs/*.png."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = Path(__file__).resolve().parent; P = H / "props"; E = H / "eggs"
rng = np.random.default_rng(5)
IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"; MONO = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
f = lambda p, s: ImageFont.truetype(p, s)


def paper(w, h, base=(236, 226, 196)):
    a = np.zeros((h, w, 3)) + base + rng.normal(0, 5, (h, w, 3))
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


# commander's uniform: the old man's body texture tinted olive (skin / hands kept)
b = np.asarray(Image.open(H.parents[1] / "lps-hombre/out/body_256.png").convert("RGB")).astype(float)
lum = b.mean(2, keepdims=True) / 255; skin = (b[..., 0] > 190) & (b[..., 1] > 140) & (b[..., 2] > 110)
ol = np.array((38, 42, 20)) + lum * np.array((92, 96, 50))
Image.fromarray(np.where(skin[..., None], b, ol).clip(0, 255).astype(np.uint8)).save(P / "cmdr_body_256.png")

im = paper(96, 128); d = ImageDraw.Draw(im)                             # leaflet
d.text((48, 18), "THE WAR", font=f(IMPACT, 17), fill=(30, 20, 14), anchor="mm")
d.text((48, 38), "IS OVER", font=f(IMPACT, 17), fill=(170, 20, 20), anchor="mm")
for y in range(56, 120, 7):
    d.line((10, y, 10 + rng.integers(50, 76), y), fill=(70, 60, 50), width=2)
im.save(P / "leaflet.png")

im = paper(128, 112, (238, 238, 228)); d = ImageDraw.Draw(im)           # Suzuki's checklist
for y in range(20, 112, 18):
    d.line((0, y, 128, y), fill=(150, 180, 220))
d.line((16, 0, 16, 112), fill=(220, 120, 120))
d.text((22, 4), "LOOKING FOR:", font=f(MONO, 13), fill=(20, 30, 90))
for i, t in enumerate(("PANDA", "YETI", "ONODA")):
    y = 26 + 18 * i; d.rectangle((22, y, 32, y + 10), outline=(20, 30, 90), width=2); d.text((38, y - 2), t, font=f(MONO, 14), fill=(20, 30, 90))
im.save(P / "checklist.png")
d.line((22, 66, 27, 72), fill=(200, 20, 20), width=3); d.line((27, 72, 36, 56), fill=(200, 20, 20), width=3)
im.save(P / "checklist_done.png")

im = paper(80, 128, (232, 218, 180)); d = ImageDraw.Draw(im)            # the order: vertical brush columns + red seal
for x in range(64, 8, -12):
    y = 10
    while y < 110:
        h = int(rng.integers(5, 10)); d.rectangle((x, y, x + 5, y + h), fill=(25, 20, 18)); y += h + 3
d.rectangle((8, 104, 22, 118), fill=(196, 30, 30)); im.save(P / "order.png")

# map (128 px, rows top = north): island mask -> height; sea with depth + wave streaks, beaches, forest, mountains
from PIL import ImageFilter
mask = Image.new("L", (128, 128), 0); d = ImageDraw.Draw(mask)
d.polygon([(70, 0), (96, 6), (100, 30), (90, 48), (104, 64), (96, 74), (74, 60), (66, 40), (58, 20)], fill=255)   # Luzon
d.polygon([(70, 84), (90, 80), (98, 100), (84, 116), (68, 106)], fill=255)                                       # Mindoro
d.polygon([(44, 80), (54, 77), (56, 84), (46, 87)], fill=255)                                                    # Lubang
d.polygon([(110, 100), (124, 96), (127, 120), (114, 124)], fill=255)
m = np.asarray(mask, float) / 255
dist = np.asarray(mask.filter(ImageFilter.GaussianBlur(6)), float) / 255
hgt = np.clip(np.asarray(mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(5)), float) / 255, 0, 1)
hgt = hgt * (0.7 + 0.6 * rng.random((128, 128)) ** 2)
yy, xx = np.mgrid[:128, :128]
sea = np.array((22, 70, 150))[None, None] * (1 - dist[..., None]) + np.array((60, 170, 210))[None, None] * dist[..., None]
sea = sea * (0.95 + 0.1 * rng.random((128, 128, 1)))
sea[((xx + 3 * (yy % 7)) % 11 == 0) & (yy % 5 == 0)] = (150, 210, 240)                                          # wave streaks
land = np.where(hgt[..., None] > 0.62, np.array((120, 100, 64)), np.where(hgt[..., None] > 0.35, np.array((40, 120, 50)), np.array((80, 160, 60))))
land = land * (0.85 + 0.25 * rng.random((128, 128, 1)))
beach = (m > 0.5) & (np.asarray(mask.filter(ImageFilter.MinFilter(3)), float) < 128)
a = np.where(m[..., None] > 0.5, land, sea); a[beach] = (230, 214, 150)
im = Image.fromarray(a.clip(0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
d.text((50, 96), "LUBANG", font=f(IMPACT, 11), fill=(255, 240, 120), anchor="mm", stroke_width=1, stroke_fill=(30, 30, 30))
d.text((84, 26), "LUZON", font=f(IMPACT, 9), fill=(255, 255, 255), anchor="mm", stroke_width=1, stroke_fill=(30, 30, 30))
im.save(P / "map.png"); Image.fromarray((hgt * m * 255).astype(np.uint8)).save(P / "map_height.png")

a = np.zeros((64, 64, 3)) + (60, 40, 24)                                 # book spines
x = 0
while x < 64:
    w = int(rng.integers(3, 7)); c = np.array([(150, 40, 30), (40, 70, 130), (40, 110, 60), (200, 170, 60), (90, 50, 110), (220, 210, 190)][rng.integers(6)])
    for row in (0, 32):
        h = int(rng.integers(22, 31)); a[row + 31 - h:row + 31, x:x + w] = c * (0.85 + 0.3 * rng.random())
        a[row + 31 - h + 4, x:x + w] = (230, 210, 120)
    x += w
a[31] = a[63] = (90, 60, 34); Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(P / "books.png")


def poster(name, title, sub, draw, col=(30, 20, 14), base=(236, 226, 196)):
    im = paper(160, 224, base); d = ImageDraw.Draw(im)
    sz = 30
    while d.textlength(title, font=f(IMPACT, sz)) > 148:
        sz -= 1
    d.text((80, 24), title, font=f(IMPACT, sz), fill=col, anchor="mm")
    draw(d); d.text((80, 204), sub, font=f(IMPACT, 15), fill=col, anchor="mm")
    im.save(E / f"{name}.png")


def panda(d):
    d.ellipse((40, 60, 120, 140), fill=(250, 250, 250), outline=(20, 20, 20), width=3)
    for x in (42, 102):
        d.ellipse((x, 52, x + 22, 74), fill=(20, 20, 20))
    for x in (56, 88):
        d.ellipse((x, 84, x + 18, 106), fill=(20, 20, 20)); d.ellipse((x + 6, 90, x + 11, 95), fill=(255, 255, 255))
    d.ellipse((74, 108, 86, 116), fill=(20, 20, 20)); d.line((70, 124, 90, 124), fill=(20, 20, 20), width=2)
    d.rectangle((40, 150, 120, 180), fill=(20, 20, 20))


def yeti(d):
    """Shaggy Bigfoot mid-stride (the classic Patterson pose): fur strands all over a dark body, long arms, big feet."""
    r = np.random.default_rng(11)
    d.rectangle((14, 44, 146, 184), fill=(150, 160, 140))
    d.rectangle((14, 150, 146, 184), fill=(118, 128, 96))                              # grass strip
    body = [(78, 62), (92, 64), (104, 76), (108, 100), (104, 124), (110, 150), (116, 172), (100, 174), (94, 150),
            (86, 132), (80, 150), (70, 174), (54, 172), (64, 148), (68, 124), (62, 100), (64, 78)]
    arms = [[(64, 80), (54, 100), (50, 124), (56, 128), (62, 104), (70, 90)], [(104, 80), (114, 98), (118, 122), (112, 126), (106, 104), (100, 90)]]
    fur, dark = (70, 52, 38), (40, 30, 22)
    for poly in [body] + arms:
        d.polygon(poly, fill=fur)
    d.ellipse((72, 50, 96, 74), fill=fur)                                               # head with a pointed crown
    d.polygon([(76, 54), (84, 42), (92, 54)], fill=fur)
    for foot in ((48, 170, 74, 180), (96, 170, 124, 180)):                              # BIG feet
        d.ellipse(foot, fill=dark)
    edge = body + arms[0] + arms[1] + [(72 + 24 * k / 8, 50 + 6 * (k % 2)) for k in range(9)]
    for _ in range(420):                                                                 # shaggy strands
        x0, y0 = edge[r.integers(len(edge))]
        x0 += r.integers(-6, 7); y0 += r.integers(-6, 7)
        a = r.uniform(0.6, 2.5); ln = r.integers(3, 8)
        d.line((x0, y0, x0 + ln * np.cos(a) * r.choice((-1, 1)), y0 + ln * np.sin(a)), fill=[fur, dark, (104, 80, 58)][r.integers(3)], width=1)
    for _ in range(260):                                                                 # fur texture inside
        x0, y0 = r.integers(56, 114), r.integers(56, 168)
        d.line((x0, y0, x0 + r.integers(-2, 3), y0 + r.integers(2, 5)), fill=[dark, (104, 80, 58)][r.integers(2)], width=1)
    d.ellipse((79, 60, 83, 63), fill=(230, 220, 160)); d.ellipse((86, 60, 90, 63), fill=(230, 220, 160))    # eye glints


def harold(d):
    d.rectangle((14, 44, 146, 184), fill=(200, 220, 240))
    d.text((80, 112), "SURRENDER?\nIN THIS\nECONOMY?", font=f(IMPACT, 22), fill=(30, 30, 30), anchor="mm", align="center")


poster("missing_panda", "MISSING", "REWARD: 1 BAMBOO", panda)
poster("wanted_yeti", "HAVE YOU SEEN", "PLEASE CALL SUZUKI", yeti, col=(140, 20, 20))
poster("surrender_economy", "STAFF PICK", "Taniguchi Books, Tokyo", harold)
im = paper(160, 224, (250, 236, 120)); d = ImageDraw.Draw(im)           # bookshop easter egg: For Dummies parody
d.rectangle((0, 0, 160, 40), fill=(20, 20, 20)); d.text((80, 20), "for DUMMIES", font=f(IMPACT, 24), fill=(250, 236, 120), anchor="mm")
d.text((80, 100), "SURRENDERING\nAFTER 29\nYEARS", font=f(IMPACT, 24), fill=(20, 20, 20), anchor="mm", align="center")
d.text((80, 190), "A Reference for the Rest of Us!", font=f(IMPACT, 11), fill=(20, 20, 20), anchor="mm"); im.save(E / "dummies.png")
# s08 tear-off calendar pages and the s16 tear
for yr in ("1945", "1946", "1955", "1965"):
    im = paper(96, 112, (246, 242, 232)); d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 96, 22), fill=(190, 30, 30)); d.text((48, 11), "CALENDAR", font=f(IMPACT, 14), fill=(250, 240, 220), anchor="mm")
    for x in range(10, 96, 14):
        d.ellipse((x, 3, x + 5, 8), fill=(60, 50, 40))
    d.text((48, 64), yr, font=f(IMPACT, 40), fill=(20, 20, 20), anchor="mm")
    for k in range(5):
        d.line((14 + 15 * k, 96, 22 + 15 * k, 96), fill=(120, 110, 100), width=3)
    im.save(P / f"cal_{yr}.png")
tear = Image.new("RGBA", (16, 24), (0, 0, 0, 0)); d = ImageDraw.Draw(tear)
d.polygon([(8, 0), (14, 14), (8, 23), (2, 14)], fill=(150, 210, 255, 255)); d.ellipse((2, 9, 14, 23), fill=(150, 210, 255, 255))
d.ellipse((5, 12, 8, 16), fill=(240, 250, 255, 255)); tear.save(P / "tear.png")
print("props", sorted(p.name for p in P.iterdir()), "eggs", sorted(p.name for p in E.iterdir()))
