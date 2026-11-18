"""AIRY YouTube banner v2 (2560x1440, everything that matters inside the 1546x423 safe area) + 1500x500 crops.
Airy leans in and points at a chunky pixel SUBSCRIBE button (engine render of the tights GLB, still pose
zz_point_sub from tools/anim/v2_test.py, built with V2TEST=1 into out/_brand_tights.glb); comic burst + halftone
background, white rim + dark outline + hard drop shadow, surprise marks, AIRY logo + tagline.
  python branding/v2/make_banner.py [--name AIRY] [--tag "tiny polygons, big feelings"]"""
import os, math, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
ap = argparse.ArgumentParser(); ap.add_argument("--name", default="AIRY"); ap.add_argument("--tag", default="tiny polygons, big feelings")
args = ap.parse_args()
W, Hh = 2560, 1440
SAFE = (507, 508, 2053, 931); CROP15 = (530, 470, 2030, 970)
F_LOGO = "../../../pup-branding/fonts/LuckiestGuy-Regular.ttf"
F_PIX = "../../../pup-branding/fonts/PressStart2P-Regular.ttf"
INK = (34, 12, 40)


def metrics(src):
    """from the render's alpha: left x, head top y, head columns, fingertip (max x) point"""
    a = np.asarray(Image.open(src))[..., 3] > 8; ys, xs = np.nonzero(a); top = ys.min()
    hc = np.nonzero(a[top:top + 200].any(0))[0]; tipx = xs.max(); tipy = np.nonzero(a[:, tipx - 3])[0].mean()
    return dict(x0=xs.min(), top=top, hx0=hc.min(), hx1=hc.max(), tip=(tipx, tipy))


def burst_bg(col, centre, wedge_deg=7, light=1.10, dots=(0, 0, 0)):
    yy, xx = np.mgrid[0:Hh, 0:W].astype(float); cx, cy = centre
    ang = (np.degrees(np.arctan2(yy - cy, xx - cx)) + 360) % 360
    base = np.array(col, float); img = np.empty((Hh, W, 3)); img[:] = base
    img[(ang // wedge_deg) % 2 == 0] = np.clip(base * light, 0, 255)
    # halftone: dot grid, radius grows towards the edges
    sp = 30; gy, gx = (yy % sp) - sp / 2, (xx % sp) - sp / 2
    dn = np.clip(np.hypot((xx - W / 2) / (W / 2), (yy - Hh / 2) / (Hh / 2)) - 0.25, 0, 1)
    r = 1.0 + 10.0 * dn; img[np.hypot(gx, gy) < r] = np.clip(base * 0.84, 0, 255)
    # soft vignette
    v = 1 - 0.28 * np.clip(np.hypot((xx - W / 2) / (W * 0.62), (yy - Hh / 2) / (Hh * 0.75)) ** 2, 0, 1)
    return Image.fromarray(np.clip(img * v[..., None], 0, 255).astype(np.uint8)).convert("RGBA")


def hero(src, scale):
    im = Image.open(src).convert("RGBA")
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    a = im.split()[3]
    rim = a.filter(ImageFilter.MaxFilter(15)); out = rim.filter(ImageFilter.MaxFilter(11))
    lay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    lay.paste(Image.new("RGBA", im.size, INK + (255,)), (0, 0), out)
    lay.paste(Image.new("RGBA", im.size, (255, 255, 255, 255)), (0, 0), rim)
    lay.alpha_composite(im)
    shadow = Image.new("RGBA", im.size, (0, 0, 0, 0)); shadow.paste(Image.new("RGBA", im.size, (20, 6, 30, 110)), (0, 0), out)
    return lay, shadow


def pixel_button(text, wb=226, hb=44, K=3, pad=6, shift=-14):
    """chunky game-UI button drawn at base resolution then x K nearest (bevel, outline, play icon)"""
    im = Image.new("RGBA", (wb, hb), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = "1"
    def rr(x0, y0, x1, y1, col, cut=3):
        d.rectangle([x0 + cut, y0, x1 - cut, y1], fill=col); d.rectangle([x0, y0 + cut, x1, y1 - cut], fill=col)
        for k in range(cut): d.rectangle([x0 + cut - k, y0 + k, x1 - cut + k, y1 - k], fill=col)
    rr(0, 0, wb - 1, hb - 1, (38, 6, 20, 255), 4)                                  # outline
    rr(2, 2, wb - 3, hb - 3, (176, 16, 58, 255), 3)                                # dark base (bottom bevel)
    rr(2, 2, wb - 3, hb - 7, (240, 40, 92, 255), 3)                                # body
    d.rectangle([5, 4, wb - 6, 6], fill=(255, 150, 182, 255))                     # top highlight
    d.rectangle([5, 7, wb - 6, 14], fill=(255, 88, 132, 255))                     # upper light band
    d.rectangle([wb - 12, 6, wb - 9, 9], fill=(255, 230, 240, 255))               # shine pixel
    f = ImageFont.truetype(F_PIX, 16); tw = d.textlength(text, font=f); iw = 14
    x = max(8, (wb - (tw + iw + pad)) // 2 + shift); y = (hb - 4) // 2
    d.polygon([(x, y - 7), (x, y + 7), (x + 12, y)], fill=(255, 255, 255, 255))     # play triangle
    d.text((x + iw + pad + 1, y + 1), text, font=f, fill=(90, 0, 30, 255), anchor="lm")
    d.text((x + iw + pad, y), text, font=f, fill=(255, 255, 255, 255), anchor="lm")
    return im.resize((round(wb * K), round(hb * K)), Image.NEAREST)


CURSOR = ["X..........", "XX.........", "XWX........", "XWWX.......", "XWWWX......", "XWWWWX.....", "XWWWWWX....", "XWWWWWWX...",
          "XWWWWWWWX..", "XWWWWWWWWX.", "XWWWWWXXXXX", "XWWXWWX....", "XWX.XWWX...", "XX..XWWX...", "X....XWWX..", ".....XWWX..", "......XX..."]


def cursor(K=6):
    im = Image.new("RGBA", (11, 17), (0, 0, 0, 0)); px = im.load()
    for y, row in enumerate(CURSOR):
        for x, ch in enumerate(row):
            if ch == "X": px[x, y] = INK + (255,)
            elif ch == "W": px[x, y] = (255, 255, 255, 255)
    return im.resize((11 * K, 17 * K), Image.NEAREST)


def logo(text, size, fill=((255, 255, 255), (255, 222, 90)), extr=(150, 20, 70), rot=-5):
    f = ImageFont.truetype(F_LOGO, size); tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    bb = tmp.textbbox((0, 0), text, font=f, stroke_width=14); w, h = bb[2] - bb[0] + 60, bb[3] - bb[1] + 60
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); ox, oy = 20 - bb[0], 20 - bb[1]
    for i in range(14, 0, -1):                                                     # 3D extrusion
        d.text((ox + i, oy + i), text, font=f, fill=extr + (255,), stroke_width=14, stroke_fill=INK + (255,))
    d.text((ox, oy), text, font=f, fill=(255, 255, 255, 255), stroke_width=14, stroke_fill=INK + (255,))
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).text((ox, oy), text, font=f, fill=255)
    g = np.linspace(0, 1, h)[:, None, None]; c0, c1 = np.array(fill[0], float), np.array(fill[1], float)
    grad = Image.fromarray((c0 * (1 - g) + c1 * g).repeat(w, 1).astype(np.uint8)).convert("RGBA")
    im.paste(grad, (0, 0), m)
    d.rectangle([0, 0, 0, 0], fill=(0, 0, 0, 0))
    hl = Image.new("L", (w, h), 0); ImageDraw.Draw(hl).text((ox, oy - 6), text, font=f, fill=255)          # glossy top lip
    hl = ImageChops.subtract(m, hl); im.paste(Image.new("RGBA", (w, h), (255, 255, 255, 255)), (0, 0), hl.point(lambda v: v // 2))
    return im.rotate(rot, resample=Image.BICUBIC, expand=True)


def tagline(text, size=24):
    f = ImageFont.truetype(F_PIX, size); tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    w = int(tmp.textlength(text, font=f)) + 24; im = Image.new("RGBA", (w, size + 24), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = "1"
    d.text((12, 12), text, font=f, fill=(255, 255, 255, 255), stroke_width=4, stroke_fill=INK + (255,))
    return im


def star(d, x, y, r, col=(255, 255, 255, 255)):
    d.polygon([(x, y - r), (x + r * 0.28, y - r * 0.28), (x + r, y), (x + r * 0.28, y + r * 0.28), (x, y + r), (x - r * 0.28, y + r * 0.28), (x - r, y), (x - r * 0.28, y - r * 0.28)],
              fill=col, outline=INK + (255,))


def stroke_line(d, p0, p1, w=14):
    d.line([p0, p1], fill=INK + (255,), width=w + 10); d.line([p0, p1], fill=(255, 255, 255, 255), width=w)


def compose(v):
    s = v["scale"]; dirn = -1 if v.get("flip") else 1; src = v["hero"]
    if v.get("flip"):
        Image.open(src).transpose(Image.FLIP_LEFT_RIGHT).save("_flip_" + src); src = "_flip_" + src
    a = np.asarray(Image.open(src))[..., 3] > 8; ys, xs = np.nonzero(a); top = ys.min(); x0 = xs.min()
    tx_ = xs.max() if dirn > 0 else xs.min(); ty_ = np.nonzero(a[:, tx_ - 3 * dirn])[0].mean()
    hc = np.nonzero(a[top:top + 200].any(0))[0]
    hx0, hy0 = v["airy_xy"]                                                      # banner position of the render's (left x, head top)
    tip = (hx0 + (tx_ - x0) * s, hy0 + (ty_ - top) * s)
    wb = v.get("btn_w", 226); BK = v.get("btn_k", 3); btn = pixel_button("SUBSCRIBE", wb=wb, K=BK, shift=v.get("btn_shift", -14)); bx, by = v["btn_xy"]
    bc = (bx + btn.width / 2, by + btn.height / 2)
    img = burst_bg(v["bg"], bc)
    d = ImageDraw.Draw(img)
    edge = bx - 26 if dirn > 0 else bx + btn.width + 26
    for dy in (-50, 0, 50):                                                      # comic action lines fingertip -> button
        p0 = (tip[0] + dirn * (40 + abs(dy) * 0.5), tip[1] + dy * 0.7); p1 = (edge - dirn * abs(dy) * 0.3, bc[1] + dy * 0.45)
        stroke_line(d, p0, p1, 10)
    lay, sh = hero(src, s); ox, oy = int(hx0 - x0 * s), int(hy0 - top * s)
    img.alpha_composite(sh, (ox + 18 * dirn, oy + 18)); img.alpha_composite(lay, (ox, oy))
    d = ImageDraw.Draw(img)
    hcx = hx0 + ((hc.min() + hc.max()) / 2 - x0) * s
    for ang in (-55, -90, -125):                                                 # surprise marks above her head
        ar = math.radians(ang); r0, r1 = 250 * s, 330 * s; cx, cy = hcx, hy0 + 200 * s
        stroke_line(d, (cx + r0 * math.cos(ar), cy + r0 * math.sin(ar)), (cx + r1 * math.cos(ar), cy + r1 * math.sin(ar)), 13)
    img.alpha_composite(btn, (bx, by)); d = ImageDraw.Draw(img)
    if v.get("cursor_below"): cxp, cyp = bx + (wb - 30) * BK, by + 41 * BK      # cursor clicking the bottom edge
    else: cxp, cyp = bx + (wb - 15) * BK, by + 26 * BK                           # cursor clicking the free right end
    for ang in (range(-20, 200, 36) if v.get("cursor_below") else range(-160, 60, 36)):
        ar = math.radians(ang); stroke_line(d, (cxp + 36 * math.cos(ar), cyp + 36 * math.sin(ar)), (cxp + 64 * math.cos(ar), cyp + 64 * math.sin(ar)), 7)
    img.alpha_composite(cursor(), (int(cxp) - 6, int(cyp) - 4))
    lg = logo(args.name, v["logo_size"]); lx, ly = v["logo_xy"]; img.alpha_composite(lg, (int(lx - lg.width / 2), int(ly - lg.height / 2)))
    tg = tagline(args.tag, v.get("tag_size", 24)); tx, ty = v["tag_xy"]; img.alpha_composite(tg, (int(tx - tg.width / 2), int(ty)))
    d = ImageDraw.Draw(img)
    for (sx, sy, r) in v.get("stars", []): star(d, sx, sy, r)
    print("  tip", [round(t) for t in tip], "button", (bx, by, bx + btn.width, by + btn.height), "logo w", lg.width)
    return img.convert("RGB")


VARIANTS = {
    "A": dict(bg=(255, 108, 52), hero="brand_close_0.png", scale=0.95, airy_xy=(522, 515), btn_w=184, btn_k=2.7, btn_shift=0, cursor_below=True,
              btn_xy=(1545, 770), logo_size=165, logo_xy=(1795, 598), tag_xy=(1795, 680), tag_size=16, stars=[(2030, 540, 20), (1580, 545, 13)]),
    "B": dict(bg=(124, 78, 255), hero="brand_close_0.png", flip=True, scale=0.95, airy_xy=(1062, 515), btn_w=184, btn_k=2.7, btn_shift=0, cursor_below=True,
              btn_xy=(520, 770), logo_size=165, logo_xy=(768, 598), tag_xy=(768, 680), tag_size=16, stars=[(535, 545, 18), (1000, 540, 13)]),
    "C": dict(bg=(30, 190, 210), hero="brand_close_1.png", scale=0.95, airy_xy=(522, 515), btn_w=184, btn_k=2.7, btn_shift=0, cursor_below=True,
              btn_xy=(1545, 770), logo_size=165, logo_xy=(1795, 598), tag_xy=(1795, 680), tag_size=16, stars=[(2030, 540, 20), (1580, 545, 13)]),
}


def guides(im):
    o = im.copy(); d = ImageDraw.Draw(o)
    d.rectangle([0, 508, 2559, 931], outline=(255, 255, 0), width=6); d.rectangle([507, 508, 2052, 931], outline=(255, 0, 0), width=8)
    d.rectangle([CROP15[0], CROP15[1], CROP15[2] - 1, CROP15[3] - 1], outline=(0, 255, 0), width=4); return o


for k, v in VARIANTS.items():
    im = compose(v); im.save(f"banner_{k}_2560x1440.png"); im.crop(CROP15).save(f"banner_{k}_1500x500.png"); guides(im).save(f"_banner_{k}_safezones.png")
    print("banner", k)
