"""venv: Pup Poly Shorts branding post.
python post.py tag      -> tex/tag.png        marker scribble "Pup Poly Shorts" (Zaw's wall signature, for scene.py)
python post.py banner   -> banner.png, banner_safezones.png, review/banner_mobile.png
python post.py avatar   -> avatar.png, review/avatar_small.png
Order: PS1 dither (photoprop.ps1_post, 4 px cells, 15-bit Bayer) on the render, THEN crisp type on top (as in the shorts)."""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402

SUP = "/System/Library/Fonts/Supplemental/"
TITLE_FONT = os.path.expanduser("~/Library/Fonts/THE BOLD FONT - FREE VERSION - 2023.otf")
CAP_FONT = SUP + "Courier New Bold.ttf"                    # the shorts' caption font
CAP_COL = (255, 238, 64)                                   # the shorts' caption yellow
PINK = (209, 75, 109)                                      # Zaw's banner pink
NAVY = (24, 77, 111)                                       # Zaw's banner navy
MARK = "/System/Library/Fonts/MarkerFelt.ttc"


def tag():
    os.makedirs(os.path.join(H, "tex"), exist_ok=True)
    W, Hh = 520, 300
    im = Image.new("RGBA", (W, Hh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(MARK, 104, index=1)
    ink = (52, 60, 64, 235)
    d.text((18, 20), "Pup Poly", font=f, fill=ink)
    d.text((150, 150), "Shorts", font=f, fill=ink)
    im = im.rotate(4, resample=Image.BICUBIC, expand=False)
    im = im.resize((W // 2, Hh // 2), Image.LANCZOS)          # low-res like a PS1 decal
    im.save(os.path.join(H, "tex", "tag.png"))


def title_block(draw, xy, text, size, fill, stroke, anchor="ls", font=TITLE_FONT, shadow=8):
    f = ImageFont.truetype(font, size)
    x, y = xy
    draw.text((x + shadow, y + shadow), text, font=f, fill=(0, 0, 0), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))
    draw.text((x, y), text, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))
    return draw.textbbox((x, y), text, font=f, anchor=anchor, stroke_width=stroke)


# safe areas for a 2560x1440 banner (YouTube): TV = all, desktop = 2560x423, tablet = 1855x423, mobile/all = 1546x423
SAFE = {"TV (whole image)": (0, 0, 2560, 1440), "desktop max 2560x423": (0, 508, 2560, 931),
        "tablet 1855x423": (352, 508, 2207, 931), "SAFE ALL DEVICES 1546x423": (507, 508, 2053, 931)}


FONTS = os.path.join(H, "fonts")                           # Google Fonts (OFL), downloaded from github.com/google/fonts
VARIANTS = [  # (file key, label, font path, fill of "SUBSCRIBE", fill of "!")
    ("lilitaone", "Lilita One - chunky rounded (Zaw's banner look)", os.path.join(FONTS, "LilitaOne-Regular.ttf"), CAP_COL, PINK),
    ("luckiestguy", "Luckiest Guy - cartoon chunky", os.path.join(FONTS, "LuckiestGuy-Regular.ttf"), CAP_COL, PINK),
    ("permanentmarker", "Permanent Marker - graffiti / marker", os.path.join(FONTS, "PermanentMarker-Regular.ttf"), CAP_COL, PINK),
    ("pressstart2p", "Press Start 2P - pixel / PS1", os.path.join(FONTS, "PressStart2P-Regular.ttf"), CAP_COL, PINK),
    ("bangers", "Bangers - comic", os.path.join(FONTS, "Bangers-Regular.ttf"), CAP_COL, PINK),
    ("theboldfont", "The Bold Font - heavy retro game", TITLE_FONT, CAP_COL, PINK),
]
TEXT_BOX = (575, 600, 1530, 860)                             # inside the 1546x423 safe area, left of the dog (dog x >= 1592)
TAGLINE = "what your dog really thinks"


def subscribe(im, font):
    """'SUBSCRIBE!' auto-fitted into TEXT_BOX (thick black stroke + drop shadow), tagline above it. -> bboxes."""
    d = ImageDraw.Draw(im); x0, y0, x1, y1 = TEXT_BOX
    size = 400
    while True:
        st = max(8, size // 12); sh = max(5, size // 26)
        f = ImageFont.truetype(font[2], size)
        b = d.textbbox((0, 0), "SUBSCRIBE!", font=f, anchor="lt", stroke_width=st)
        if b[2] - b[0] + sh <= x1 - x0 and b[3] - b[1] + sh <= y1 - y0:
            break
        size -= 4
    th = b[3] - b[1] + sh; start = 508 + (423 - (55 + 24 + th)) // 2      # tagline + gap + title, centred in the strip
    tx = x0 - b[0]; ty = start + 55 + 24 - b[1]; tag_y = start + 39
    wb = d.textbbox((0, 0), "SUBSCRIBE", font=f, anchor="lt", stroke_width=st)
    for dx, col_s, col_b in ((sh, (0, 0, 0), (0, 0, 0)), (0, font[3], font[4])):
        d.text((tx + dx, ty + dx), "SUBSCRIBE", font=f, fill=col_s, anchor="lt", stroke_width=st, stroke_fill=(0, 0, 0))
        d.text((tx + dx + d.textlength("SUBSCRIBE", font=f), ty + dx), "!", font=f, fill=col_b, anchor="lt", stroke_width=st, stroke_fill=(0, 0, 0))
    full = (tx + b[0], ty + b[1], tx + b[2] + sh, ty + b[3] + sh)
    ft = ImageFont.truetype(CAP_FONT, 54)
    tb = d.textbbox((x0 + 8, tag_y), TAGLINE, font=ft, anchor="ls", stroke_width=6)
    d.text((x0 + 8, tag_y), TAGLINE, font=ft, fill=(255, 255, 255), anchor="ls", stroke_width=6, stroke_fill=(0, 0, 0))
    return size, full, tb


def banner():
    base = ps1_post(Image.open(os.path.join(H, "renders", "banner_raw.png")).convert("RGB"))
    outs = []
    for v in VARIANTS:
        im = base.copy(); size, tbox, tb = subscribe(im, v)
        inside = all(SAFE["SAFE ALL DEVICES 1546x423"][0] <= bx[0] and bx[2] <= SAFE["SAFE ALL DEVICES 1546x423"][2]
                     and SAFE["SAFE ALL DEVICES 1546x423"][1] <= bx[1] and bx[3] <= SAFE["SAFE ALL DEVICES 1546x423"][3] for bx in (tbox, tb))
        print(f"{v[0]}: size {size}, SUBSCRIBE! box {tbox}, tagline {tb}, inside safe area: {inside}")
        im.save(os.path.join(H, f"banner_subscribe_{v[0]}.png")); outs.append((v, im))
    # contact sheet: each variant's safe-area strip, labelled, plus the same strip at real phone width (390 px)
    sx = SAFE["SAFE ALL DEVICES 1546x423"]; cw, chh = 1030, 282
    sheet = Image.new("RGB", (cw + 390 + 60, len(outs) * (chh + 70) + 20), (28, 28, 30)); sd = ImageDraw.Draw(sheet)
    fl = ImageFont.truetype(SUP + "Arial Bold.ttf", 28)
    for i, (v, im) in enumerate(outs):
        y = 20 + i * (chh + 70); strip = im.crop(sx)
        sd.text((20, y), f"banner_subscribe_{v[0]}.png  -  {v[1]}", font=fl, fill=(255, 255, 255))
        sheet.paste(strip.resize((cw, chh), Image.LANCZOS), (20, y + 40))
        sheet.paste(strip.resize((390, 107), Image.LANCZOS), (cw + 40, y + 40))
        sd.text((cw + 40, y + 155), "phone size", font=ImageFont.truetype(SUP + "Arial.ttf", 20), fill=(170, 170, 170))
    sheet.save(os.path.join(H, "review", "banner_variants.jpg"), quality=90)
    im = outs[0][1]; im.save(os.path.join(H, "banner.png"))                      # default banner = Lilita One
    # safe-zone preview
    ov = im.copy().convert("RGBA"); lay = Image.new("RGBA", ov.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    sx0, sy0, sx1, sy1 = SAFE["SAFE ALL DEVICES 1546x423"]
    ld.rectangle((0, 0, 2560, sy0), fill=(0, 0, 0, 110)); ld.rectangle((0, sy1, 2560, 1440), fill=(0, 0, 0, 110))
    ld.rectangle((0, sy0, sx0, sy1), fill=(0, 0, 0, 50)); ld.rectangle((sx1, sy0, 2560, sy1), fill=(0, 0, 0, 50))
    cols = {"TV (whole image)": (255, 255, 255), "desktop max 2560x423": (80, 200, 255), "tablet 1855x423": (255, 160, 40), "SAFE ALL DEVICES 1546x423": (60, 255, 90)}
    fl = ImageFont.truetype(SUP + "Arial Bold.ttf", 30)
    for k, (a, b_, c, e) in SAFE.items():
        ld.rectangle((a + 3, b_ + 3, c - 4, e - 4), outline=cols[k] + (255,), width=6)
        ty = 24 if k.startswith("TV") else (b_ - 40 if not k.startswith("SAFE") else e + 12)
        tx = a + 20 if not k.startswith("tablet") else a + 20
        if k.startswith("desktop"):
            tx, ty = 20, b_ - 40
        if k.startswith("tablet"):
            tx, ty = a + 20, e + 12
        if k.startswith("SAFE"):
            tx, ty = a + 20, e + 56
        ld.text((tx, ty), k, font=fl, fill=cols[k] + (255,), stroke_width=4, stroke_fill=(0, 0, 0, 255))
    Image.alpha_composite(ov, lay).convert("RGB").save(os.path.join(H, "banner_safezones.png"))
    # what each device shows, at real phone/desktop display size
    mob = im.crop(SAFE["SAFE ALL DEVICES 1546x423"]).resize((390, 107), Image.LANCZOS)
    desk = im.crop(SAFE["desktop max 2560x423"]).resize((1060, 175), Image.LANCZOS)
    sheet = Image.new("RGB", (1100, 360), (30, 30, 30)); sheet.paste(desk, (20, 20)); sheet.paste(mob, (20, 220))
    sheet.save(os.path.join(H, "review", "banner_devices.png"))


def avatar():
    raw = Image.open(os.path.join(H, "renders", "avatar_raw.png")).convert("RGB").resize((800, 800), Image.LANCZOS)
    im = ps1_post(raw, scale=4)
    im.save(os.path.join(H, "avatar.png"))
    # preview: circle crop at 800, 176, 98 and 48 px on a white and a dark page
    m = Image.new("L", (800, 800), 0); ImageDraw.Draw(m).ellipse((0, 0, 799, 799), fill=255)
    sheet = Image.new("RGB", (1240, 420), (255, 255, 255)); ImageDraw.Draw(sheet).rectangle((620, 0, 1240, 420), fill=(15, 15, 15))
    for base in (0, 620):
        x = base + 20
        for s in (300, 176, 98, 48):
            c = im.resize((s, s), Image.LANCZOS); mm = m.resize((s, s), Image.LANCZOS)
            sheet.paste(c, (x, 60), mm); x += s + 20
    sheet.save(os.path.join(H, "review", "avatar_small.png"))


if __name__ == "__main__":
    os.makedirs(os.path.join(H, "review"), exist_ok=True)
    {"tag": tag, "banner": banner, "avatar": avatar}[sys.argv[1]]()
