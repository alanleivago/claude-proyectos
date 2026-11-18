"""@askforvera channel branding: profile pictures (1080, 8 flat colours) and YouTube banners (2560x1440, safe area 1546x423,
+ 1500x500), made from flat unlit renders of the waitress (transparent background) composited with PIL.
python -I tools/branding.py render|compose   -> branding/*.png + branding/contact_sheet.png"""
import os, sys, json, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(HERE, "wanim"))
import anim_review as AR

OUT = os.path.join(ROOT, "branding"); os.makedirs(OUT, exist_ok=True)
FONTS = r"D:\Alan\Fiverr Upwork trabajo fotos y videos\Fuentes"
F_SERIF = os.path.join(FONTS, "Newsreader", "static")
F_MONT = os.path.join(FONTS, "Montserrat-ExtraBold", "montserrat")
TAG = "Table for two? Just ask."

# poses: (clip, frame, camera yaw, elevation, eyes, mouth, framing centre offset (m), extent (m))
SHOTS = {
    "pf_bored": ("flirt_head_tilt", 30, 14, 6, "boredSexy", "parted", (0, 0, -0.10), 0.80),
    "pf_bored_c": ("flirt_head_tilt", 30, 4, 4, "boredSexy", "parted", (0, 0, -0.14), 0.95),
    "pf_wink": ("flirt_wink", 15, -12, 6, "winkBrow", "smirk", (0, 0, -0.10), 0.80),
    "pf_smug": ("flirt_head_tilt", 30, 14, 6, "smug", "partedTeeth", (0, 0, -0.10), 0.80),
    "bn_wink": ("flirt_lean_in", 32, 22, -10, "winkBrow", "smirk", (0, 0, -0.16), 0.95),
    "bn_bored": ("flirt_lean_in", 32, -18, -10, "boredSexy", "partedTeeth", (0, 0, -0.16), 0.95),
    "bn_smug": ("flirt_hip_tilt", 20, 16, 8, "smug", "cat", (0, 0, -0.22), 1.15),
}


def head_ctr(clip, frame):
    import retarget as T
    A = np.load(os.path.join(ROOT, "ref", "anim_w.npz"), allow_pickle=True); q, l = A["q_" + clip], A["l_" + clip]; i = frame - 1
    Q = np.zeros((T.NB, 3, 3))
    for b in range(T.NB):
        L = T.RbW[b] @ T.qmat(q[i, b]) @ T.RbW[b].T; p = T.PAR[b]; Q[b] = L if p < 0 else Q[p] @ L
    H = T.fk(Q, T.HrW[0] + T.RbW[0] @ l[i]); ih = T.BI["Head"]
    return H[ih] + Q[ih] @ np.array([0, -0.02, 0.12])


def render():
    AR.META = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))
    shots = []
    for k, (clip, fr, yaw, el, e, m, off, ext) in SHOTS.items():
        c = head_ctr(clip, fr) + np.array(off)
        shots.append(dict(out=os.path.join(AR.TMP, f"br_{k}.png"), clip=clip, frame=fr, view=yaw, elev=el, ctr=AR.u(c), ext=ext * AR.S, eyes=e, mouth=m))
    spec = os.path.join(AR.TMP, "br_spec.json")
    json.dump({"size": 1600, "meta": AR.META, "shots": shots, "transparent": True}, open(spec, "w"))
    import subprocess
    r = subprocess.run([AR.BL, "-b", AR.GLB["B"], "--factory-startup", "--python", os.path.join(HERE, "wanim", "bl_anim_render.py"), "--", spec],
                       capture_output=True, text=True, timeout=1800)
    assert "ARENDER done" in r.stdout, r.stdout[-2000:]
    print("rendered", len(shots))


# ------------------------------------------------------------------ compositing helpers
def font(path, size):
    try: return ImageFont.truetype(path, size)
    except Exception: return ImageFont.truetype("arialbd.ttf", size)


def serif(size): return font(os.path.join(F_SERIF, "Newsreader_60pt-ExtraBoldItalic.ttf") if os.path.exists(os.path.join(F_SERIF, "Newsreader_60pt-ExtraBoldItalic.ttf")) else os.path.join(F_SERIF, "Newsreader-ExtraBoldItalic.ttf"), size)
def mont(size): return font(os.path.join(F_MONT, "Montserrat-Black.ttf"), size)
def monti(size): return font(os.path.join(F_MONT, "Montserrat-BlackItalic.ttf"), size)


def char(key, scale=1.0, outline=14, outline_col=(255, 255, 255), rim=None, shadow=(0, 0, 0, 110), shadow_off=(18, 22)):
    """character cut-out with a bold outline, optional coloured rim and a soft drop shadow (RGBA layer)"""
    im = Image.open(os.path.join(AR.TMP, f"br_{key}.png")).convert("RGBA")
    if scale != 1.0: im = im.resize((int(im.width * scale), int(im.height * scale)), Image.NEAREST)
    a = im.split()[3]; pad = outline * 3 + 40
    big = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad), im)
    A = big.split()[3]
    out = Image.new("RGBA", big.size, (0, 0, 0, 0))
    if shadow:
        sh = A.filter(ImageFilter.MaxFilter(outline * 2 + 1)).filter(ImageFilter.GaussianBlur(10))
        sl = Image.new("RGBA", big.size, shadow[:3] + (0,)); sl.putalpha(sh.point(lambda v: v * shadow[3] // 255))
        out.alpha_composite(sl, shadow_off)
    if rim:
        rr = A.filter(ImageFilter.MaxFilter(outline * 2 + 9)); rl = Image.new("RGBA", big.size, rim + (255,)); rl.putalpha(rr); out.alpha_composite(rl)
    ol = A.filter(ImageFilter.MaxFilter(outline * 2 + 1)); oll = Image.new("RGBA", big.size, outline_col + (255,)); oll.putalpha(ol); out.alpha_composite(oll)
    out.alpha_composite(big)
    return out, pad


def text_fx(draw_img, xy, txt, fnt, fill, stroke=0, stroke_fill=(255, 255, 255), shadow=None, anchor="mm"):
    d = ImageDraw.Draw(draw_img)
    if shadow: d.text((xy[0] + shadow[0], xy[1] + shadow[1]), txt, font=fnt, fill=shadow[2], anchor=anchor, stroke_width=stroke, stroke_fill=shadow[2])
    d.text(xy, txt, font=fnt, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=stroke_fill)


def logo(w=900, main=(255, 255, 255), accent=(255, 120, 160), dark=(30, 10, 25)):
    """'ASK FOR' (Montserrat Black, tracked) over 'Vera' (Newsreader ExtraBold Italic) with outline + offset shadow + a heart"""
    L = Image.new("RGBA", (w, int(w * 0.52)), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    f1 = mont(int(w * 0.075)); f2 = serif(int(w * 0.36))
    ask = "A S K   F O R"; d.text((w // 2, int(w * 0.07)), ask, font=f1, fill=accent, anchor="mm", stroke_width=max(2, w // 220), stroke_fill=dark)
    cx, cy = w // 2, int(w * 0.29)
    for dx, dy in ((int(w * 0.016), int(w * 0.018)),):
        d.text((cx + dx, cy + dy), "Vera", font=f2, fill=dark, anchor="mm", stroke_width=max(4, w // 70), stroke_fill=dark)
    d.text((cx, cy), "Vera", font=f2, fill=main, anchor="mm", stroke_width=max(4, w // 90), stroke_fill=dark)
    hx, hy, r = cx + int(w * 0.36), cy - int(w * 0.16), int(w * 0.045)
    heart(d, hx, hy, r, accent, dark)
    return L


def heart(d, x, y, r, fill, outline=None, width=0):
    pts = []
    for k in range(60):
        t = 2 * math.pi * k / 60
        pts.append((x + r * 16 * math.sin(t) ** 3 / 16, y - r * (13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)) / 16))
    d.polygon(pts, fill=fill, outline=outline, width=width or max(2, r // 5))


def stripes(size, c1, c2, w=90, angle=-30):
    im = Image.new("RGB", (size[0] * 2, size[1] * 2), c1); d = ImageDraw.Draw(im)
    for x in range(-size[1] * 2, size[0] * 2 + size[1] * 2, 2 * w): d.polygon([(x, 0), (x + w, 0), (x + w + size[1] * 2, size[1] * 2), (x + size[1] * 2, size[1] * 2)], fill=c2)
    im = im.rotate(0, expand=False)
    return im.crop((size[0] // 2, size[1] // 2, size[0] // 2 + size[0], size[1] // 2 + size[1]))


def halftone(size, col, spacing=28, rmax=9, fade="right"):
    L = Image.new("RGBA", size, (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    for j, y in enumerate(range(0, size[1] + spacing, spacing)):
        for x in range(((j % 2) * spacing) // 2, size[0] + spacing, spacing):
            t = x / size[0] if fade == "right" else 1 - x / size[0]
            r = rmax * max(0.0, t - 0.35) / 0.65
            if r > 0.6: d.ellipse([x - r, y - r, x + r, y + r], fill=col)
    return L


def cup(d, x, y, s, body, dark, steam=(255, 255, 255)):
    d.polygon([(x - s, y - s * 0.6), (x + s, y - s * 0.6), (x + s * 0.75, y + s * 0.9), (x - s * 0.75, y + s * 0.9)], fill=body, outline=dark, width=max(3, int(s * 0.09)))
    d.arc([x + s * 0.65, y - s * 0.35, x + s * 1.45, y + s * 0.45], -90, 90, fill=dark, width=max(4, int(s * 0.14)))
    d.ellipse([x - s * 1.35, y + s * 0.8, x + s * 1.35, y + s * 1.15], fill=body, outline=dark, width=max(3, int(s * 0.08)))
    for k in (-0.45, 0.0, 0.45):
        d.arc([x + s * k - s * 0.18, y - s * 1.5, x + s * k + s * 0.18, y - s * 0.85], 120, 300, fill=steam, width=max(3, int(s * 0.08)))


def cake(d, x, y, s, sponge, cream, berry, glass, dark):
    d.polygon([(x - s, y + s * 0.5), (x + s * 0.9, y + s * 0.5), (x - s * 0.1, y - s * 0.55)], fill=sponge, outline=dark, width=max(3, int(s * 0.07)))
    d.line([(x - s * 0.8, y + s * 0.15), (x + s * 0.55, y + s * 0.15)], fill=cream, width=max(4, int(s * 0.12)))
    d.ellipse([x - s * 0.28, y - s * 0.78, x + s * 0.02, y - s * 0.48], fill=berry, outline=dark, width=max(2, int(s * 0.05)))
    d.ellipse([x - s * 1.35, y + s * 0.48, x + s * 1.25, y + s * 0.78], fill=glass, outline=dark, width=max(3, int(s * 0.06)))
    d.arc([x - s * 1.25, y - s * 1.35, x + s * 1.15, y + s * 1.7], 180, 360, fill=dark, width=max(3, int(s * 0.07)))
    d.line([(x - s * 1.25, y + s * 0.18), (x - s * 1.25, y + s * 0.6)], fill=dark, width=max(3, int(s * 0.07)))
    d.line([(x + s * 1.15, y + s * 0.18), (x + s * 1.15, y + s * 0.6)], fill=dark, width=max(3, int(s * 0.07)))
    d.arc([x - s * 0.9, y - s * 1.05, x - s * 0.2, y - s * 0.2], 200, 260, fill=(255, 255, 255), width=max(3, int(s * 0.07)))


# ------------------------------------------------------------------ profile pictures
PF_COLOURS = [("wine", (110, 26, 58)), ("rose", (232, 137, 156)), ("coral", (255, 122, 107)), ("mint", (159, 224, 200)),
              ("lavender", (185, 166, 232)), ("amber", (242, 179, 61)), ("black", (20, 16, 24)), ("cream", (246, 234, 216))]


def profiles():
    made = []
    for key in ("pf_bored", "pf_wink"):
        ch, pad = char(key, 0.80, outline=12, shadow=(0, 0, 0, 90), shadow_off=(12, 16))
        for name, col in PF_COLOURS:
            im = Image.new("RGBA", (1080, 1080), col + (255,))
            light = sum(col) > 420
            ring = Image.new("RGBA", im.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(ring)
            acc = tuple(min(255, int(c * 1.18 + 18)) for c in col) if not light else tuple(int(c * 0.9) for c in col)
            dr.ellipse([90, 90, 990, 990], fill=acc + (255,))
            im.alpha_composite(ring)
            place(im, ch, 540, 150)
            p = os.path.join(OUT, f"pfp_{key[3:]}_{name}.png"); im.convert("RGB").save(p); made.append(p)
    return made


# ------------------------------------------------------------------ banners
SAFE = (507, 508, 2053, 931)


def place(bg, ch, cx, top):
    """paste the cut-out so its alpha bbox is centred on cx with the hair top at `top`"""
    bb = ch.getbbox(); x = int(cx - (bb[0] + bb[2]) / 2); y = int(top - bb[1]); bg.alpha_composite(ch, (x, y))


def banner_a():
    """wine + diagonal stripes + halftone, big wink close-up, logo + tagline"""
    W, H = 2560, 1440
    bg = stripes((W, H), (112, 22, 52), (128, 30, 62), 110).convert("RGBA")
    bg.alpha_composite(halftone((W, H), (255, 120, 160, 70), 30, 10, "left"))
    d = ImageDraw.Draw(bg)
    for (x, y, r, c) in ((1890, 560, 34, (255, 120, 160)), (1980, 690, 22, (255, 190, 210)), (620, 560, 26, (255, 160, 190)), (700, 860, 18, (255, 120, 160))):
        heart(d, x, y, r, c, (40, 8, 24))
    ch, pad = char("bn_wink", 0.80, outline=16, rim=(255, 120, 160), shadow=(20, 0, 10, 140), shadow_off=(26, 30))
    place(bg, ch, 1700, 420)
    L = logo(820, (255, 245, 248), (255, 140, 175), (40, 8, 24)); bg.alpha_composite(L, (540, 515))
    text_fx(bg, (950, 905), TAG, monti(50), (255, 225, 235), 4, (40, 8, 24), (6, 6, (40, 8, 24)))
    return bg


def banner_b():
    """mint café: coffee cup + cake under a dome, coral accents, heavy-lidded lean-in"""
    W, H = 2560, 1440
    bg = Image.new("RGBA", (W, H), (159, 224, 200, 255)); d = ImageDraw.Draw(bg)
    for k in range(0, W + H, 140): d.line([(k, 0), (k - H, H)], fill=(170, 232, 210), width=40)
    bg.alpha_composite(halftone((W, H), (255, 255, 255, 90), 30, 9, "right"))
    d = ImageDraw.Draw(bg); dark = (40, 30, 40)
    cup(d, 330, 700, 80, (255, 122, 107), dark)
    cake(d, 2250, 690, 95, (246, 214, 160), (255, 250, 240), (220, 40, 70), (230, 245, 250), dark)
    for (x, y, r) in ((560, 880, 20), (2020, 560, 24), (1290, 560, 16), (2010, 900, 18)): heart(d, x, y, r, (255, 122, 107), dark)
    ch, pad = char("bn_bored", 0.80, outline=16, outline_col=(255, 255, 255), rim=(255, 122, 107), shadow=(20, 40, 40, 120), shadow_off=(24, 28))
    place(bg, ch, 860, 420)
    L = logo(800, (255, 255, 255), (255, 122, 107), dark); bg.alpha_composite(L, (1230, 515))
    text_fx(bg, (1630, 905), "Served with a wink.", monti(50), (255, 255, 255), 4, dark, (5, 5, dark))
    return bg


def banner_c():
    """black + neon pink rim, hearts and a spotlight, sly smug lean, centred logo"""
    W, H = 2560, 1440
    bg = Image.new("RGBA", (W, H), (18, 12, 22, 255))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse([1200, 240, 2200, 1240], fill=(255, 60, 140, 120)); glow = glow.filter(ImageFilter.GaussianBlur(160)); bg.alpha_composite(glow)
    bg.alpha_composite(halftone((W, H), (255, 80, 160, 60), 26, 8, "left"))
    d = ImageDraw.Draw(bg)
    rnd = random.Random(7)
    for _ in range(26):
        x, y = rnd.randint(520, 2040), rnd.randint(520, 920)
        if 1300 < x < 2100 or x < 1400 and 520 < y < 900: continue
        heart(d, x, y, rnd.randint(10, 26), (255, 80, 160) if rnd.random() < 0.6 else (255, 190, 220), None)
    ch, pad = char("bn_smug", 0.74, outline=12, outline_col=(255, 255, 255), rim=(255, 60, 140), shadow=(0, 0, 0, 160), shadow_off=(0, 26))
    place(bg, ch, 1720, 430)
    L = logo(820, (255, 255, 255), (255, 80, 160), (18, 12, 22)); bg.alpha_composite(L, (540, 515))
    text_fx(bg, (950, 905), TAG, monti(50), (255, 190, 220), 4, (18, 12, 22), None)
    return bg


def banners():
    made = []
    for name, fn in (("A_wine_stripes", banner_a), ("B_mint_cafe", banner_b), ("C_black_neon", banner_c)):
        im = fn().convert("RGB"); p = os.path.join(OUT, f"banner_{name}_2560x1440.png"); im.save(p); made.append(p)
        x0, y0, x1, y1 = SAFE; cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        crop = im.crop((cx - 819, cy - 273, cx + 819, cy + 273)).resize((1500, 500), Image.LANCZOS)
        p2 = os.path.join(OUT, f"banner_{name}_1500x500.png"); crop.save(p2); made.append(p2)
    return made


def contact(pfps, bns):
    F = AR.font(24); F2 = AR.font(16)
    W = 2400; im = Image.new("RGB", (W, 3600), (34, 36, 42)); d = ImageDraw.Draw(im); y = 16
    d.text((16, y), "@askforvera - Vera: profile pictures (circle preview) and banners (safe area outlined)", fill=(240, 240, 240), font=F); y += 44
    for row in (pfps[:8], pfps[8:]):
        for k, p in enumerate(row):
            t = Image.open(p).resize((270, 270), Image.LANCZOS); m = Image.new("L", (270, 270), 0); ImageDraw.Draw(m).ellipse([0, 0, 269, 269], fill=255)
            im.paste(t, (16 + k * 296, y), m); d.text((16 + k * 296, y + 274), os.path.basename(p)[4:-4], fill=(210, 210, 210), font=F2)
        y += 310
    for p in [b for b in bns if "2560" in b]:
        t = Image.open(p).resize((1600, 900), Image.LANCZOS); dd = ImageDraw.Draw(t)
        s = 1600 / 2560; x0, y0, x1, y1 = SAFE; dd.rectangle([x0 * s, y0 * s, x1 * s, y1 * s], outline=(255, 255, 0), width=2)
        im.paste(t, (16, y)); d.text((16, y + 904), os.path.basename(p), fill=(210, 210, 210), font=F2)
        q = p.replace("2560x1440", "1500x500"); t2 = Image.open(q).resize((750, 250), Image.LANCZOS); im.paste(t2, (1636, y)); d.text((1636, y + 254), os.path.basename(q), fill=(210, 210, 210), font=F2)
        y += 940
    im = im.crop((0, 0, W, y + 10)); p = os.path.join(OUT, "contact_sheet.png"); im.save(p); print("SHEET", p, im.size)


def head_bbox(im):
    """bounding box of her hair (the green hair texels: g > r, dark) = the head, in an RGBA cut-out"""
    a = np.array(im.convert("RGBA")).astype(int); rgb = a[..., :3]
    m = (a[..., 3] > 128) & (rgb[..., 0] < 100) & (rgb[..., 1] - rgb[..., 0] >= 8)
    from scipy import ndimage as nd
    lab, n = nd.label(nd.binary_closing(m, iterations=3))          # the hair blob = biggest dark-green component nearest the top
    best = None
    for k in range(1, n + 1):
        ys, xs = np.nonzero(lab == k)
        if len(ys) < 200: continue
        key = (ys.min(), -len(ys))
        if best is None or key < best[0]: best = (key, xs, ys)
    xs, ys = best[1], best[2]; return xs.min(), ys.min(), xs.max(), ys.max()


def body_bbox(im):
    """torso = her black corset + the neckline skin directly above it (rows below the head); arms excluded"""
    a = np.array(im.convert("RGBA")).astype(int); hb = head_bbox(im); rgb = a[..., :3]
    m = (a[..., 3] > 128) & (np.abs(rgb - 57).sum(-1) < 12)
    m[: hb[3] + int(0.55 * (hb[3] - hb[1]))] = False               # well below the hair (its dark underside is the same black)
    from scipy import ndimage as nd
    lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1)); k = int(np.argmax(sizes)) + 1
    ys, xs = np.nonzero(lab == k); return xs.min(), ys.min(), xs.max(), ys.max()


def pfp_centered():
    """bored pfp, head dead centre horizontally, face slightly above the middle, body centred below (all 8 colours)"""
    src = Image.open(os.path.join(AR.TMP, "br_pf_bored_c.png")).convert("RGBA")
    hb = head_bbox(src); head_h = hb[3] - hb[1]
    scale = 400.0 / head_h                                          # head (hair) about 37 % of the avatar
    ch, pad = char("pf_bored_c", scale, outline=12, shadow=(0, 0, 0, 90), shadow_off=(0, 16))
    h2 = head_bbox(ch); cx_h = (h2[0] + h2[2]) / 2; cy_h = (h2[1] + h2[3]) / 2
    made, rep = [], []
    for name, col in PF_COLOURS:
        im = Image.new("RGBA", (1080, 1080), col + (255,)); light = sum(col) > 420
        acc = tuple(min(255, int(c * 1.18 + 18)) for c in col) if not light else tuple(int(c * 0.9) for c in col)
        ring = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(ring).ellipse([90, 90, 990, 990], fill=acc + (255,)); im.alpha_composite(ring)
        x = int(round(540 - cx_h)); y = int(round(470 - cy_h)); im.alpha_composite(ch, (x, y))
        out = im.convert("RGB"); p = os.path.join(OUT, f"pfp_bored_{name}_centered_1080.png"); out.save(p); made.append(p)
        # verify on the final image: hair bbox centre vs image centre
        lay = Image.new("RGBA", (1080, 1080), (0, 0, 0, 0)); lay.alpha_composite(ch, (x, y))
        hb3 = head_bbox(lay); bb3 = body_bbox(lay)
        hx = (hb3[0] + hb3[2]) / 2; hy = (hb3[1] + hb3[3]) / 2; bx = (bb3[0] + bb3[2]) / 2
        rep.append((name, hx, hy, bx))
    # grid with circle masks
    T = 300; g = Image.new("RGB", (4 * (T + 20) + 20, 2 * (T + 60) + 70), (34, 36, 42)); d = ImageDraw.Draw(g)
    d.text((20, 14), "pfp bored, centred: circle-masked previews (cross = image centre)", fill=(240, 240, 240), font=AR.font(20))
    for k, p in enumerate(made):
        r, q = divmod(k, 4); t = Image.open(p).resize((T, T), Image.LANCZOS); m = Image.new("L", (T, T), 0); ImageDraw.Draw(m).ellipse([0, 0, T - 1, T - 1], fill=255)
        x0, y0 = 20 + q * (T + 20), 50 + r * (T + 60); g.paste(t, (x0, y0), m)
        d.line([(x0 + T // 2 - 8, y0 + T // 2), (x0 + T // 2 + 8, y0 + T // 2)], fill=(255, 255, 0), width=1); d.line([(x0 + T // 2, y0 + T // 2 - 8), (x0 + T // 2, y0 + T // 2 + 8)], fill=(255, 255, 0), width=1)
        nm, hx, hy, bx = rep[k]
        d.text((x0, y0 + T + 6), f"{nm}: head x {hx / 10.8:.1f}% y {hy / 10.8:.1f}%  torso x {bx / 10.8:.1f}%", fill=(210, 210, 210), font=AR.font(13))
    gp = os.path.join(OUT, "pfp_bored_centered_grid.png"); g.save(gp)
    for nm, hx, hy, bx in rep:
        print(f"{nm:9s} head centre x {hx:6.1f} px ({(hx - 540) / 10.8:+.2f}% of width)  y {hy:6.1f} px ({hy / 10.8:.1f}% from top)  torso (corset) centre x {bx:6.1f} ({(bx - 540) / 10.8:+.2f}%)")
    print("GRID", gp)


def pfp_flat():
    """first bored render (same camera / framing as pfp_bored_<colour>.png), head centred horizontally, ONE flat colour
    background (no ring, no shadow), white outline kept"""
    ch, pad = char("pf_bored", 0.80, outline=12, shadow=None)
    bb = ch.getbbox(); top_y = 150 - bb[1]                          # same vertical placement as the originals
    h = head_bbox(ch); x = int(round(540 - (h[0] + h[2]) / 2))
    made, rep = [], []
    for name, col in PF_COLOURS:
        im = Image.new("RGBA", (1080, 1080), col + (255,)); im.alpha_composite(ch, (x, top_y))
        p = os.path.join(OUT, f"pfp_bored_{name}_flat_1080.png"); im.convert("RGB").save(p); made.append(p)
        lay = Image.new("RGBA", (1080, 1080), (0, 0, 0, 0)); lay.alpha_composite(ch, (x, top_y)); hb = head_bbox(lay)
        a = np.array(Image.open(p)); bgpx = a[np.array(lay)[..., 3] == 0]; flat = bool((bgpx == np.array(col)).all())
        rep.append((name, (hb[0] + hb[2]) / 2, (hb[1] + hb[3]) / 2, flat))
    T = 300; g = Image.new("RGB", (4 * (T + 20) + 20, 2 * (T + 60) + 70), (34, 36, 42)); d = ImageDraw.Draw(g)
    d.text((20, 14), "pfp bored, flat background: circle-masked previews (cross = image centre)", fill=(240, 240, 240), font=AR.font(20))
    for k, p in enumerate(made):
        r, q = divmod(k, 4); t = Image.open(p).resize((T, T), Image.LANCZOS); m = Image.new("L", (T, T), 0); ImageDraw.Draw(m).ellipse([0, 0, T - 1, T - 1], fill=255)
        x0, y0 = 20 + q * (T + 20), 50 + r * (T + 60); g.paste(t, (x0, y0), m)
        d.line([(x0 + T // 2 - 8, y0 + T // 2), (x0 + T // 2 + 8, y0 + T // 2)], fill=(255, 255, 0)); d.line([(x0 + T // 2, y0 + T // 2 - 8), (x0 + T // 2, y0 + T // 2 + 8)], fill=(255, 255, 0))
        nm, hx, hy, flat = rep[k]
        d.text((x0, y0 + T + 6), f"{nm}: head x {hx / 10.8:.1f}%  y {hy / 10.8:.1f}%  bg flat: {flat}", fill=(210, 210, 210), font=AR.font(13))
    gp = os.path.join(OUT, "pfp_bored_flat_grid.png"); g.save(gp)
    for nm, hx, hy, flat in rep:
        print(f"{nm:9s} head centre x {hx:6.1f} px ({(hx - 540) / 10.8:+.2f}%)  y {hy:6.1f} px ({hy / 10.8:.1f}% from top)  background one flat colour: {flat}")
    print("GRID", gp)


if __name__ == "__main__":
    if sys.argv[1] == "render": render()
    elif sys.argv[1] == "pfp_centered": pfp_centered()
    elif sys.argv[1] == "pfp_flat": pfp_flat()
    else:
        pf = profiles(); bn = banners(); contact(pf, bn)
