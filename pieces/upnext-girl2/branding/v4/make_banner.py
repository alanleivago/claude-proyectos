"""AIRY YouTube banner v4 (2560x1440 + 1500x500): game key-art strip like the "Jambone" reference.
The word SUBSCRIBE (vera-01 pixel font, tight tracking, cream + ink outline + hard shadow) in the centre, Airy at both sides (two poses, bust-up, cropped by the strip),
one solid colour with a very soft radial glow behind the button. Nothing else (no name, tagline, cursor or props).
Heroes: engine renders of the tights GLB (3x supersampled), still poses zz_v4_d4 (left, hands under the chin) / zz_v4_d5 (right, mirrored: cheer + hand on chest) from
tools/anim/v2_test.py (V2TEST=1 build -> out/_brand_tights.glb). python branding/v4/make_banner.py"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
W, Hh = 2560, 1440
SAFE = (507, 508, 2053, 931); CROP15 = (530, 470, 2030, 970)
F_LOGO = "../../../pup-branding/fonts/LuckiestGuy-Regular.ttf"
F_PIXEL = "../../../../fonts/thatthatnewpixelfamilytest-square.otf"     # the vera-01 title font
INK = (40, 14, 30)
VARIANTS = {"tangerine": (255, 98, 42), "violet": (128, 86, 240), "teal": (32, 186, 202), "pink": (255, 112, 176), "mint": (86, 214, 160),
            "sky": (82, 166, 255), "lemon": (255, 222, 60), "lilac": (190, 150, 255), "coral": (255, 96, 104), "black": (22, 18, 26)}


def background(col):
    yy, xx = np.mgrid[0:Hh, 0:W].astype(float)
    r = np.hypot((xx - W / 2) / 760, (yy - 720) / 330)
    glow = np.clip(1 - r, 0, 1) ** 2 * 0.22                                       # very soft glow behind the button
    base = np.array(col, float)[None, None]
    img = base + (255 - base) * glow[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert("RGBA")


def head_metrics(src):
    """head centre x / top y / height in the render (from a pose with both hands below the head)"""
    a = np.asarray(Image.open(src))[..., 3] > 8; top = np.nonzero(a.any(1))[0][0]
    hc = np.nonzero(a[top + 30:top + 80].any(0))[0]; hcx = (hc.min() + hc.max()) / 2
    wid = np.array([np.ptp(np.nonzero(a[y])[0]) if a[y].any() else 0 for y in range(top, top + 420)])
    chin = top + 180 + int(np.argmin(wid[180:360]))
    return hcx, top, chin - top, a.shape[1]


HM = None


def hero(src, height_head, flip=False):
    """render scaled so the head is height_head px (head metrics from the left render: same camera for both poses)"""
    global HM
    if HM is None: HM = head_metrics("hero_v4b_left.png")
    hcx, htop, hh, wr = HM
    im = Image.open(src).convert("RGBA")
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT); hcx = wr - hcx
    s = height_head / hh
    if abs(s - 1) > 0.03: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    else: s = 1.0                                                          # rendered at the final scale (3x supersampled): no resample
    from PIL import ImageEnhance                                           # a touch more colour / contrast so the hair stays crisp on bright colours
    rgb, al_ = im.convert("RGB"), im.split()[3]
    rgb = ImageEnhance.Contrast(ImageEnhance.Color(rgb).enhance(1.10)).enhance(1.06); im = rgb.convert("RGBA"); im.putalpha(al_)
    al = im.split()[3]; out = al.filter(ImageFilter.MaxFilter(13))
    lay = Image.new("RGBA", im.size, (0, 0, 0, 0)); lay.paste(Image.new("RGBA", im.size, INK + (255,)), (0, 0), out); lay.alpha_composite(im)
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.paste(Image.new("RGBA", im.size, (20, 6, 20, 70)), (0, 0), out.filter(ImageFilter.GaussianBlur(10)))
    return lay, sh, (hcx * s, htop * s)


def button(text="SUBSCRIBE", size=96):
    """chunky dimensional button: thick ink outline, 3D extrusion, glossy pink-red body, white bold type with ink outline"""
    f = ImageFont.truetype(F_LOGO, size); tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    bb = tmp.textbbox((0, 0), text, font=f); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    icon = int(th * 0.95); gap = int(size * 0.28); padx, pady = int(size * 0.55), int(size * 0.42)
    bw, bh = tw + icon + gap + 2 * padx, th + 2 * pady; ext, ol, rad = 20, 10, int(bh * 0.32)
    Wd, Hd = bw + 2 * ol + 40, bh + ext + 2 * ol + 40
    im = Image.new("RGBA", (Wd, Hd), (0, 0, 0, 0)); d = ImageDraw.Draw(im); x0, y0 = 20 + ol, 20 + ol
    rr = lambda box, col, r=rad: d.rounded_rectangle(box, r, fill=col)
    rr([x0 - ol, y0 - ol, x0 + bw + ol, y0 + bh + ext + ol], INK + (255,), rad + ol)      # outline incl. extrusion
    rr([x0, y0 + ext, x0 + bw, y0 + bh + ext], (150, 14, 52, 255))                       # extrusion (side)
    rr([x0, y0, x0 + bw, y0 + bh], (236, 38, 88, 255))                                   # face
    g = Image.new("L", (bw, bh), 0); gd = ImageDraw.Draw(g)                              # top gloss band
    gd.rounded_rectangle([int(bw * 0.035), int(bh * 0.07), int(bw * 0.965), int(bh * 0.46)], int(rad * 0.8), fill=95)
    im.paste(Image.new("RGBA", (bw, bh), (255, 255, 255, 255)), (x0, y0), g)
    d.rounded_rectangle([x0, y0 + bh - 14, x0 + bw, y0 + bh], rad, fill=(206, 24, 70, 255))   # lower lip shade
    # play icon (white rounded triangle with ink outline)
    ix, iy = x0 + padx, y0 + bh // 2; tri = [(ix, iy - icon // 2), (ix, iy + icon // 2), (ix + int(icon * 0.86), iy)]
    d.polygon(tri, fill=(255, 255, 255, 255), outline=INK + (255,)); d.line(tri + [tri[0]], fill=INK + (255,), width=8, joint="curve")
    tx = ix + icon + gap - bb[0]; ty = y0 + (bh - th) // 2 - bb[1]
    d.text((tx + 6, ty + 8), text, font=f, fill=(120, 8, 40, 255), stroke_width=10, stroke_fill=(120, 8, 40, 255))   # type shadow
    d.text((tx, ty), text, font=f, fill=(255, 255, 255, 255), stroke_width=10, stroke_fill=INK + (255,))
    # little shine pips (top right)
    for dx, dy, r in ((bw - rad * 0.9, 24, 9), (bw - rad * 0.9 - 30, 22, 5)):
        d.ellipse([x0 + dx - r, y0 + dy - r, x0 + dx + r, y0 + dy + r], fill=(255, 255, 255, 230))
    return im


def pixel_word(text="Subscribe!", K=12, fill=(255, 246, 226), ol=17, shadow=None):
    """the word only, in the vera-01 pixel font at its native 16 px grid, tight tracking (-1 px), x K nearest;
    cream fill, thick ink outline, hard ink drop shadow"""
    # drawn at 16*K px (a 16 px raster drops the thin right stem of the U), thresholded: the glyphs are square-pixel outlines
    f = ImageFont.truetype(F_PIXEL, 16 * K)
    adv = [f.getlength(c) - K for c in text]                                     # tight tracking: -1 font pixel
    m = Image.new("L", (int(sum(adv)) + 40 * K, 30 * K), 0); d = ImageDraw.Draw(m); x = 4 * K
    for c, a_ in zip(text, adv): d.text((x, 6 * K), c, font=f, fill=255); x += a_
    m = m.point(lambda v: 255 if v > 127 else 0); m = m.crop(m.getbbox())
    pad = ol + (max(shadow) if shadow else 0) + 4; Wt, Ht = m.width + 2 * pad, m.height + 2 * pad
    mp = Image.new("L", (Wt, Ht), 0); mp.paste(m, (pad, pad)); o = mp.filter(ImageFilter.MaxFilter(ol | 1))
    im = Image.new("RGBA", (Wt, Ht), (0, 0, 0, 0)); ink = Image.new("RGBA", (Wt, Ht), INK + (255,))
    if shadow: sh = Image.new("L", (Wt, Ht), 0); sh.paste(o, shadow); im.paste(ink, (0, 0), sh)
    im.paste(ink, (0, 0), o); im.paste(Image.new("RGBA", (Wt, Ht), fill + (255,)), (0, 0), mp)
    return im


def sparkle(d, x, y, r, col=(255, 255, 255, 255)):
    pts = []
    for k in range(8):
        rr = r if k % 2 == 0 else r * 0.26; a = np.pi / 4 * k - np.pi / 2
        pts.append((x + rr * np.cos(a), y + rr * np.sin(a)))
    d.polygon(pts, fill=col, outline=INK + (255,)); d.line(pts + [pts[0]], fill=INK + (255,), width=6, joint="curve"); d.polygon(pts, fill=col)


def compose(col):
    img = background(col)
    # heroes: left (presenting + hand on chest), right (mirrored: presenting + arm up)
    L, Ls, (lhx, lht) = hero("hero_v4b_left.png", 305)
    R, Rs, (rhx, rht) = hero("hero_v4b_right.png", 305, flip=True)
    lx, ly = int(695 - lhx), int(540 - lht); rx, ry = int(1865 - rhx), int(540 - rht)
    for im, sh, (x, y) in ((L, Ls, (lx, ly)), (R, Rs, (rx, ry))):
        img.alpha_composite(sh, (x + 14, y + 16)); img.alpha_composite(im, (x, y))
    btn = pixel_word(); bx, by = W // 2 - btn.width // 2, 712 - btn.height // 2
    img.alpha_composite(btn, (bx, by))
    d = ImageDraw.Draw(img)
    for x, y, r in ((bx - 10, by + 22, 30), (bx + btn.width + 26, by + btn.height - 40, 24), (bx + btn.width - 170, by - 2, 15)):
        sparkle(d, x, y, r)
    return img.convert("RGB"), (bx, by, bx + btn.width, by + btn.height), (lx, ly, L.size), (rx, ry, R.size)


def guides(im):
    o = im.copy(); d = ImageDraw.Draw(o)
    d.rectangle([0, 508, 2559, 931], outline=(255, 255, 0), width=6); d.rectangle([507, 508, 2052, 931], outline=(255, 0, 0), width=8)
    d.rectangle([CROP15[0], CROP15[1], CROP15[2] - 1, CROP15[3] - 1], outline=(0, 255, 0), width=4); return o


for name, col in VARIANTS.items():
    im, b, l, r = compose(col)
    im.save(f"airy_banner_v4_{name}_2560x1440.png"); im.crop(CROP15).save(f"airy_banner_v4_{name}_1500x500.png"); guides(im).save(f"_airy_banner_v4_{name}_safezones.png")
    print(name, "button", b, "left", l[:2], "right", r[:2])
# contact sheet: every colour, full banner with guides + 1500x500 at the same row
fb = ImageFont.truetype("arialbd.ttf", 24)
rows = list(VARIANTS); RH = 470
S = Image.new("RGB", (30 + 800 + 30 + 1236 + 30, 20 + len(rows) * RH), (28, 28, 30)); d = ImageDraw.Draw(S); y = 20
for name in rows:
    d.text((30, y), f"{name}  (left: 2560x1440 with guides - yellow desktop, red phone/safe, green 1500x500; right: 1500x500)", fill=(255, 255, 255), font=fb)
    S.paste(Image.open(f"_airy_banner_v4_{name}_safezones.png").resize((736, 414), Image.LANCZOS), (30, y + 36))
    S.paste(Image.open(f"airy_banner_v4_{name}_1500x500.png").resize((1242, 414), Image.LANCZOS), (796, y + 36))
    y += RH
S.save("airy_banner_v4_contact_sheet.png"); print("contact sheet", S.size)
