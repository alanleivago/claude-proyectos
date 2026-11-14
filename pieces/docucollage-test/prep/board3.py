"""v3 storyboard (template-copy method): each scene = a reference shot copied 1:1 (layout, layer stack, text treatment, motion), assets swapped.
Mocks are composited from the real assets (assets/img3, img2, host frames) at 1080x1920.
python prep/board3.py -> storyboard/v3/frames/*.png + storyboard/v3/board_*.jpg"""
import json, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance, ImageChops
R = Path(__file__).resolve().parent.parent
I3, I2, FD = R / "assets/img3", R / "assets/img2", R / "assets/fonts"
SB = R / "storyboard/v3"; FR = SB / "frames"; FR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1920
GOLD, SHADOW, CREAM, YEL = (255, 208, 141), (66, 47, 26), (244, 237, 224), (242, 222, 46)
F3 = json.loads((I3 / "faces.json").read_text())
F2 = json.loads((I2 / "faces.json").read_text())
rnd = random.Random(5)

# ---------------- image helpers ----------------
def L(name):
    p = I3 / name if (I3 / name).exists() else I2 / name
    return Image.open(p).convert("RGBA")
def cover(im, w=W, h=H, fx=0.5, fy=0.5, s=1.0):
    k = max(w / im.width, h / im.height) * s
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x = (im.width - w) * fx; y = (im.height - h) * fy
    return im.crop((round(x), round(y), round(x) + w, round(y) + h))
def grad(c1, c2, w=W, h=H):
    g = Image.new("RGB", (1, 256))
    for y in range(256): g.putpixel((0, y), tuple(round(c1[i] + (c2[i] - c1[i]) * y / 255) for i in range(3)))
    return g.resize((w, h), Image.BILINEAR).convert("RGBA")
def hexc(s): s = s.lstrip("#"); return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))
_dots = None
def halftone(im, a=0.20):
    global _dots
    if _dots is None:
        t = Image.new("L", (7, 7), 0); ImageDraw.Draw(t).ellipse([2, 2, 5, 5], fill=255)
        big = Image.new("L", (W * 2, H * 2)); [big.paste(t, (x, y)) for x in range(0, W * 2, 7) for y in range(0, H * 2, 7)]
        _dots = big.rotate(45).crop((W // 2, H // 2, W // 2 + W, H // 2 + H))
    dark = Image.new("RGBA", im.size, (0, 0, 0, 255))
    m = _dots.crop((0, 0) + im.size).point(lambda v: round(v * a))
    out = im.copy(); out.paste(dark, (0, 0), m); return out
def vignette(im, a=0.42):
    m = Image.new("L", (W // 4, H // 4), 0); d = ImageDraw.Draw(m)
    for k in range(60): d.ellipse([-W // 8 + k * 2, -H // 8 + k * 3, W // 4 + W // 8 - k * 2, H // 4 + H // 8 - k * 3], fill=round(255 * a * (1 - k / 60) ** 2))
    m = ImageOps.invert(m.filter(ImageFilter.GaussianBlur(20)).point(lambda v: 255 - v)).resize(im.size)
    out = im.copy(); out.paste(Image.new("RGBA", im.size, (0, 0, 0, 255)), (0, 0), m); return out
def bw(im, c=1.2):
    a = im.split()[-1]; g = ImageEnhance.Contrast(im.convert("L")).enhance(c).convert("RGBA"); g.putalpha(a); return g
def duo(im, dark, light, c=1.15):
    a = im.split()[-1]; g = ImageEnhance.Contrast(im.convert("L")).enhance(c)
    o = ImageOps.colorize(g, dark, light).convert("RGBA"); o.putalpha(a); return o
def scale(im, w=None, h=None):
    k = (w / im.width) if w else (h / im.height)
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS), k
def paste(base, im, x, y): base.alpha_composite(im, (round(x), round(y))) if x >= 0 and y >= 0 and x + im.width <= base.width and y + im.height <= base.height else _paste_clip(base, im, x, y)
def _paste_clip(base, im, x, y):
    lay = Image.new("RGBA", base.size, (0, 0, 0, 0)); lay.paste(im, (round(x), round(y)), im); base.alpha_composite(lay)
def shadow(im, dx=0, dy=18, blur=16, a=0.45):
    s = Image.new("RGBA", (im.width + 80, im.height + 80), (0, 0, 0, 0))
    m = im.split()[-1].point(lambda v: round(v * a)); sh = Image.new("RGBA", im.size, (0, 0, 0, 255)); sh.putalpha(m)
    s.paste(sh, (40 + dx, 40 + dy)); s = s.filter(ImageFilter.GaussianBlur(blur)); s.alpha_composite(im, (40, 40)); return s, 40

# ---------------- censor bars on the eyes (MediaPipe boxes) ----------------
def bar(base, faces, k, ox, oy, idx=(0,), style="smudge"):
    for i in idx:
        f = faces[i]; w = f["bar_w"] * k * 1.05; h = max(16, f["bar_h"] * k * 0.95)
        lay = Image.new("RGBA", base.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
        cx, cy = f["cx"] * k + ox, f["cy"] * k + oy
        if style == "white":        # ARR Jane: white rough brush stroke
            for j in range(7):
                yy = cy - h * 0.25 + j * h * 0.09
                d.line([(cx - w / 2 + rnd.uniform(-8, 4), yy + rnd.uniform(-3, 3)), (cx + w / 2 + rnd.uniform(-4, 8), yy + rnd.uniform(-3, 3))], fill=(245, 245, 245, 235), width=max(3, round(h * 0.16)))
            lay = lay.filter(ImageFilter.GaussianBlur(1.2))
        else:
            d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=h * 0.45, fill=(11, 11, 11, 255))
            soft = lay.filter(ImageFilter.GaussianBlur(7)); lay = Image.alpha_composite(soft, lay.filter(ImageFilter.GaussianBlur(1.5)))
        lay = lay.rotate(-f["angle"], center=(cx, cy))
        base.alpha_composite(lay)

# ---------------- type ----------------
def font(kind, size, wght=900):
    f = ImageFont.truetype(str({"cond": FD / "BebasNeue-Regular.ttf", "serif": FD / "EBGaramond.ttf", "ital": FD / "EBGaramond-Italic.ttf",
                                "hand": FD / "CoveredByYourGrace.ttf", "cap": FD / "Poppins-Bold.ttf"}[kind]), size)
    if kind in ("serif", "ital"): f.set_variation_by_axes([min(800, wght)])
    return f
def tline(base, text, kind, size, y, col=GOLD, track=None, x=None, maxw=900, sh=True, shcol=SHADOW, wght=900, wig=True, stroke=0, occl=None):
    """letters drawn one by one (each its own layer in the real build: per-letter wiggle at 12 fps); returns bottom y"""
    track = (0.2 if kind == "cond" else 0.02) if track is None else track
    while True:
        f = font(kind, size, wght); adv = [f.getlength(c) + track * size for c in text]
        if sum(adv) <= maxw or size < 30: break
        size -= 4
    tw = sum(adv) - track * size
    x0 = (W - tw) / 2 if x is None else x
    lay = Image.new("RGBA", base.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    s = max(3, round(size * 0.04)); xx = x0      # ref SYNDROME: short hard drop ~4 % of the size
    for c, a in zip(text, adv):
        jx, jy = (rnd.gauss(0, 0.6 * 0.029 * 0.7 * size), rnd.gauss(0, 0.6 * 0.055 * 0.7 * size)) if wig and kind != "hand" else (0, 0)
        if sh: d.text((xx + jx + s, y + jy + round(s * 0.9)), c, font=f, fill=shcol, stroke_width=stroke, stroke_fill=shcol)
        d.text((xx + jx, y + jy), c, font=f, fill=col, stroke_width=stroke, stroke_fill=col)
        xx += a
    base.alpha_composite(lay)
    return y + size
def pill(base, text, done, cy):
    f = font("cap", 44); words = text.split()
    tw = f.getlength(text); w = tw + 64; x = (W - w) / 2
    d = ImageDraw.Draw(base)
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x, cy - 43 + 4, x + w, cy + 43 + 4], 30, fill=(0, 0, 0, 70))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    d.rounded_rectangle([x, cy - 43, x + w, cy + 43], 30, fill=(251, 245, 229))
    xx = x + 32
    for i, wd in enumerate(words):
        d.text((xx, cy - 31), wd, font=f, fill=(27, 27, 27) if i < done else (207, 200, 182)); xx += f.getlength(wd + " ")
def host_co(t, y=0, s=1.0):
    im = Image.open(SB / f"host/co_{t}.png").convert("RGBA")
    if s != 1.0: im = im.resize((round(W * s), round(H * s)), Image.LANCZOS)
    return im, (W - im.width) / 2, y
def tht(t): return Image.open(SB / f"host/tht_{t}.png").convert("RGBA")
def cot(t): return Image.open(SB / f"host/cot_{t}.png").convert("RGBA")
def th(t): return Image.open(SB / f"host/th_{t}.png").convert("RGBA")
def torn_edge(im, y, seed=3, amp=12, rim=7, below=True):
    """cut im along a jagged line at y with a white fibre rim (reel torn paper)"""
    r = random.Random(seed); pts = []; x = -10
    while x < W + 20: pts.append((x, y + r.uniform(-amp, amp) + 10 * math.sin(x / 80 + seed))); x += r.choice([8, 11, 14, 17])
    poly = pts + ([(W + 20, H + 10), (-10, H + 10)] if below else [(W + 20, -10), (-10, -10)])
    m = Image.new("L", im.size, 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    rimm = Image.new("L", im.size, 0); ImageDraw.Draw(rimm).polygon([(px, py + (rim if below else -rim)) for px, py in pts] + poly[len(pts):], fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0)); fib = Image.new("RGBA", im.size, (242, 238, 228, 255))
    out.paste(fib, (0, 0), m); inner = im.copy(); inner.putalpha(ImageChops.multiply(im.split()[-1], rimm)); out.alpha_composite(inner)
    return out

S = {}       # scene id -> (img, meta)
def save(sid, img, meta): img.convert("RGB").save(FR / f"{sid}.png"); S[sid] = meta

HOST_Y = 740
# ===================================================================== S01 fav_80
b = cover(L("director.jpg"), fx=0.25); b = halftone(b, 0.10)
tline(b, "CLUB", "cond", 132, 92, stroke=2); tline(b, "DIRECTORS", "serif", 176, 196, maxw=990)
im, x, y = host_co("0.6"); paste(b, im, x, HOST_Y); pill(b, "Club directors,", 1, 900)
save("s01", b, dict(t="0.00-1.28", line="Club directors,", ref="gold_1.20.jpg", refid="fav_80 · GOLD P01 0.2-1.84",
     motion="Host cutout fixed at the bottom; card push x1.067 (+3.7 %/s) drifting up 60 px; GOLD-MEDAL lockup typed 1 letter/frame, then ONE shine sweep L→R ~970 px/s; whip-out at the end."))
# ===================================================================== S02 fav_81
bb_ = cover(L("bench.jpg"), fy=0.55); b = Image.new("RGBA", (W, H)); b.paste(bb_, (0, -430)); b.paste(bb_.crop((0, H - 20, W, H)).resize((W, 450)), (0, H - 450))
tline(b, "A UNIFORM", "cond", 104, 150, stroke=2); tline(b, "COMPANY", "serif", 150, 262)
paste(b, *host_co("1.8")[0:1], 0, HOST_Y) if False else None
im, x, y = host_co("1.8"); paste(b, im, x, HOST_Y); pill(b, "a uniform company", 2, 900)
save("s02", b, dict(t="1.28-2.80", line="a uniform company offers your club", ref="gold_3.20.jpg", refid="fav_81 · GOLD P02-P03 1.84-4.0",
     motion="Slide: card+title push out left, bench scene enters from the right while the host stays fixed (P03); +1.5 %/s push; exit = whip-out blur 4/6/16/18 px, bg -100 px."))
# ===================================================================== S03 fav_82
gi = L("girl.png"); src = Image.open(R / "flow/v3/girl.jpg").convert("RGBA")
k = H / src.height; gox = -(src.width * k - W) / 2
b = cover(L("room_plate.jpg"))
gcut = gi.resize((round(gi.width * k), round(gi.height * k)), Image.LANCZOS)
ga = gcut.split()[-1]; gsh = Image.new("RGBA", gcut.size, (40, 30, 20, 0)); gsh.putalpha(ga.point(lambda v: round(v * .28)).filter(ImageFilter.GaussianBlur(26)))
paste(b, gsh, gox + 70, -30); paste(b, gcut, gox, 0)
bar(b, F3["girl"], k, gox, 0)
tline(b, "$5,000", "hand", 170, 70, col=(242, 168, 40), track=0.12, sh=False)
pill(b, "your club $5,000", 3, 900)
save("s03", b, dict(t="2.80-3.96", line="…your club $5,000", ref="gold_4.60.jpg", refid="fav_82 · GOLD P04 4.0-5.88",
     motion="Hard cut + deblur 18→0 px (6 f); girl slides in from the right -135 px ease-out (15 f), no rotation; hand-drawn '$5,000' written 2.4 f/letter (marker, no wiggle); hold, then push ease-in with PARALLAX: room plate x1.08, girl x1.2, title x1.3 (separate layers)."))
# ===================================================================== S04 fav_83
b = cover(L("room_plate.jpg"), s=1.06, fy=0.35); k2 = k * 1.12; ox = -(src.width * k2 - W) / 2; oy = -(src.height * k2 - H) * 0.35
fan = L("cashfan.png").crop(L("cashfan.png").getbbox()); fan, _ = scale(fan, 980)
b2 = b.copy(); paste(b2, fan, 50, -40)
gc = L("girl.png"); gc = gc.resize((round(gc.width * k2), round(gc.height * k2)), Image.LANCZOS); paste(b2, gc, ox, oy)   # girl in front of the fan
bar(b2, F3["girl"], k2, ox, oy)
md = L("medal.png"); md = md.crop(md.getbbox()); md = md.crop((0, round(md.height * 0.42), md.width, md.height)); md, _ = scale(md, w=round(92 * k2))
f0 = F3["girl"][0]; nx, ny = f0["cx"] * k2 + ox, (f0["cy"] + 70) * k2 + oy
rib = Image.new("RGBA", b2.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(rib)
for sx_ in (-1, 1): dr.line([(nx + sx_ * 30 * k2, ny), (nx + sx_ * 4, ny + 75 * k2)], fill=(28, 118, 66, 255), width=round(9 * k2))
b2.alpha_composite(rib); paste(b2, md, nx - md.width / 2, ny + 68 * k2)
pill(b2, "through fundraising.", 2, 900)
save("s04", b2, dict(t="3.96-4.98", line="through fundraising.", ref="gold_6.40.jpg", refid="fav_83 · GOLD P04b-P05 5.72-7.28",
     motion="Cash fan pops behind her head in 1 frame at x1.28, holds 4 f, eases to 1.0 (rings); gold medal pops hanging from her neck (ribbon around the neck), drops 1 frame and settles on her chest; '$5,000' scrolls off the top; push ~x1.23 + pan -190 px; whip-out."))
# ===================================================================== S05 TH
b = th("5.4"); pill(b, "Sounds amazing, right?", 2, 1384)
save("s05", b, dict(t="4.98-6.06", line="Sounds amazing, right?", ref="gold_19.00.jpg", refid="GOLD P18 18.72-19.88 (TH)",
     motion="Real TH, big Ali framing, blurred copy fading out over 0.26 s; no zoom (host sway only)."))
# ===================================================================== S06 ARR doc + lens
b = halftone(grad(hexc("#7A3B3B"), hexc("#4E2628")), 0.22)
doc = Image.open(I3 / "doc.png").convert("RGBA"); dochi = Image.open(I3 / "doc_hi.png").convert("RGBA"); meta = json.loads((I3 / "doc_meta.json").read_text())
DX, DY = 45, -60; DS = 1.1
doc = doc.resize((round(900 * DS), round(1200 * DS)), Image.LANCZOS); docb = doc.filter(ImageFilter.GaussianBlur(1.6))
ds, so = shadow(docb, dy=14, blur=14, a=0.45); paste(b, ds, DX - so, DY - so)
cl = meta["clause"]; ccx, ccy = (cl[0] + cl[2]) / 2, (cl[1] + cl[3]) / 2
LR = 200; lx, ly = DX + ccx * DS, DY + ccy * DS
dochi = dochi.resize((round(1800 * DS), round(2400 * DS)), Image.LANCZOS)
crop = dochi.crop((round(ccx * 2 * DS - LR), round(ccy * 2 * DS - LR), round(ccx * 2 * DS + LR), round(ccy * 2 * DS + LR)))
m = Image.new("L", crop.size, 0); ImageDraw.Draw(m).ellipse([0, 0, crop.width - 1, crop.height - 1], fill=255)
# barrel distortion hint: subtle inner shadow at the rim
lens = Image.new("RGBA", crop.size, (0, 0, 0, 0)); lens.paste(crop, (0, 0), m)
ish = Image.new("L", crop.size, 0); ImageDraw.Draw(ish).ellipse([0, 0, crop.width - 1, crop.height - 1], outline=110, width=26); ish = ImageChops.multiply(ish.filter(ImageFilter.GaussianBlur(14)), m)
lens.paste(Image.new("RGBA", crop.size, (40, 25, 10, 255)), (0, 0), ish)
# red hand circle around the clause INSIDE the magnified copy (ARR: red circle on the card)
mk = Image.new("RGBA", crop.size, (0, 0, 0, 0)); dm = ImageDraw.Draw(mk)
pts = [(LR + 182 * math.cos(a) * (1 + .03 * math.sin(3 * a)), LR + 52 * math.sin(a) + a * 2) for a in [i / 60 * 2 * math.pi * 1.08 - 0.6 for i in range(61)]]
dm.line(pts, fill=(216, 35, 42, 255), width=9, joint="curve")
lens.alpha_composite(mk)
paste(b, lens, lx - LR, ly - LR)
ring = Image.open(I3 / "magnifier_ring.png").convert("RGBA"); rj = json.loads((I3 / "magnifier_ring.json").read_text())
rk = (LR + 4) / rj["r"]; ring = ring.resize((round(ring.width * rk), round(ring.height * rk)), Image.LANCZOS)
rs, ro = shadow(ring, dx=10, dy=22, blur=14, a=0.4); paste(b, rs, lx - rj["cx"] * rk - ro, ly - rj["cy"] * rk - ro)
rm = Image.open(I3 / "readerman.png").convert("RGBA"); rm = duo(rm, (42, 28, 18), (241, 228, 204), 1.1)
rm = rm.crop((0, 0, rm.width, round(rm.height * 0.95))); rm, kk = scale(rm, 1000); rx, ry = (W - rm.width) / 2, H - rm.height + 20; paste(b, rm, rx, ry)
bar(b, F3["readerman"], kk, rx, ry)
pill(b, "is store credit.", 2, 1384)
save("s06", b, dict(t="6.06-9.65", line="But wait, read the fine print. That $5,000 is store credit.", ref="arr_18.4.jpg", refid="ARR P129 16.64-20.16 (report card)",
     motion="Coded agreement peels in from the top-right corner over maroon halftone; sepia reader cutout fixed at the bottom; brass lens glides over the fine print (2x sharp copy inside the circle, page blurred 1.6 px) and stops on clause 7; red ring hand-drawn 0.3 s (the A+ circle)."))
# ===================================================================== S07 fav_91 JAM table
b = cover(L("sky_lot.jpg") if (I3 / "sky_lot.jpg").exists() else Image.open(R / "flow/v3/sky_lot.jpg").convert("RGBA"), fy=0.7)
so0 = Image.open(I3 / "shopowner.png").convert("RGBA"); sbb = so0.getbbox(); so_ = so0.crop(sbb); so_, kk = scale(so_, 680); sx, sy = (W - so_.width) / 2, 200; so_ = so_.crop((0, 0, so_.width, 1120 - sy))
paste(b, so_, sx, sy); bar(b, [dict(F3["shopowner"][0], cx=F3["shopowner"][0]["cx"] - sbb[0], cy=F3["shopowner"][0]["cy"] - sbb[1])], kk, sx, sy)
ct = L("counter.png"); ct = ct.crop(ct.getbbox()); ct = ct.resize((1000, 520), Image.LANCZOS); cty = 1060; cs, co = shadow(ct, dy=20, blur=18); paste(b, cs, 40 - co, cty - co)
items = ["j_blue.png", "j_orange.png", "jacket.png", "j_red.png", "jersey.png", "j_purple.png"]
for i, n in enumerate(items):
    p = Image.open(R / "assets/img" / n).convert("RGBA"); p = p.crop(p.getbbox()); p, _ = scale(p, h=165 if n != "jacket.png" else 190)
    paste(b, p, 100 + i * 150 + (75 - p.width / 2) + 15, cty + 18 - p.height)
tl_ = Image.new("RGBA", b.size, (0, 0, 0, 0))
tline(tl_, "STORE CREDIT", "serif", 84, cty + 190, col=(236, 196, 110), sh=False, wig=False, maxw=760); tline(tl_, "ONLY", "serif", 84, cty + 285, col=(236, 196, 110), sh=False, wig=False)
tl_.putalpha(tl_.split()[-1].point(lambda v: round(v * .82))); b.alpha_composite(tl_)
pill(b, "warm-ups and jerseys.", 2, 1500)
save("s07", b, dict(t="9.65-12.97", line="You can only spend it with them on warm-ups and jerseys.", ref="jam_13.84.jpg", refid="fav_91 · JAM P53-P55 9.68-14.4",
     motion="Owner cutout rises from behind the wooden counter (eye bar); warm-ups/jerseys hop onto the counter one per step on 'warm-ups' and 'jerseys'; slow push-in; gold 'STORE CREDIT ONLY' fades onto the planks like '13 VARIETIES OF JAM'."))
# ===================================================================== S08 fav_92 jar grid + thumbs up
b = halftone(grad(hexc("#5D7FB5"), hexc("#2C4F82")), 0.18)
tline(b, "NEVER LEAVES", "serif", 96, 140, col=YEL, sh=False, wig=True)
jars = []
for n in ("jars_a.png", "jars_b.png"):
    j = L(n); a = j.split()[-1]
    cols = [x for x in range(j.width) if max(a.crop((x, 0, x + 1, j.height)).getdata()) > 20]
    segs, st = [], cols[0]
    for p, q in zip(cols, cols[1:] + [10 ** 9]):
        if q - p > 6: segs.append((st, p)); st = q
    for s0, s1 in segs[:3]:
        jj = j.crop((s0, 0, s1 + 1, j.height)); jars.append(jj.crop(jj.getbbox()))
for i, jj in enumerate(jars[:6]):
    jj, _ = scale(jj, h=430); cx = 200 + (i % 3) * 340; cy = 330 + (i // 3) * 500
    js, jo = shadow(jj, dy=16, blur=12, a=0.35); paste(b, js, cx - jj.width / 2 - jo, cy - jo)
tb = L("thumb.png"); tb = tb.crop(tb.getbbox()); tb, _ = scale(tb, 700); paste(b, tb, W - tb.width + 40, 620)
pill(b, "never leaves their store.", 2, 1500)
save("s08", b, dict(t="12.97-15.14", line="That money never leaves their store.", ref="jam_22.0.jpg", refid="fav_92 · JAM P61 21.6-22.6",
     motion="Six money jars drop into a 3x2 grid one per step (2-step drop + 16 px bounce); yellow serif title typed; thumbs-up arm slides in from the right edge (expo.out) and holds; slow push."))
# ===================================================================== S09 TH + drop title (WHAT'S NEXT?)
b = tht("16.2"); g = Image.new("RGBA", (W, 560), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
for yy in range(560): gd.line([(0, yy), (W, yy)], fill=(8, 8, 10, round(200 * (1 - yy / 560))))
b.alpha_composite(g)
tline(b, "FUNDRAISING WITH", "cond", 96, 175, stroke=2, shcol=(20, 26, 40)); tline(b, "STIMULUS", "serif", 190, 280, shcol=(20, 26, 40))
paste(b, cot("16.2"), 0, 0); pill(b, "fundraising with stimulus works.", 2, 1384)
save("s09", b, dict(t="15.14-17.33", line="Now here's how fundraising with stimulus works.", ref="gold_39.3.jpg", refid="GOLD P29 37.2-39.4 (WHAT'S NEXT?)",
     motion="TH; title behind the host's head, letters drop 100 px with ease-out in 5 f (start cropped at the top), ±3-6 px wiggle; navy-black shadow; fade 90→50→0 % in 3 f."))
# ===================================================================== S10 fav_95 red half sun
b = halftone(grad(hexc("#C9CACC"), hexc("#A9AAAD")), 0.16)
d = ImageDraw.Draw(b); d.ellipse([460 - 640, 560, 460 + 640, 560 + 1280], fill=(212, 42, 48, 255))
hb = Image.open(I3 / "headband.png").convert("RGBA"); hb = bw(hb, 1.25); hbb = hb.getbbox(); hb, kk = scale(hb, 1180); hx = (W - hb.width) / 2 + 20; hy = H + 40 - hbb[3] * kk
paste(b, hb, hx, hy); bar(b, F3["headband"], kk, hx, hy)
tf = Image.new("RGBA", (W, 620), (0, 0, 0, 0)); tfd = ImageDraw.Draw(tf)
for yy in range(620): tfd.line([(0, yy), (W, yy)], fill=(6, 6, 8, round(235 * (1 - yy / 620) ** 1.4)))
b.alpha_composite(tf)
tline(b, "COST LESS", "cond", 112, 150, col=(250, 250, 250), sh=False, track=0.26)
pill(b, "cost less than big", 1, 1384)
save("s10", b, dict(t="17.33-19.73", line="Our custom jerseys cost less than big name brands,", ref="fav_95.png", refid="fav_95 · DK P90 26.24 (OVERESTIMATE)",
     motion="Torn-paper wipe in; red half-sun pops in 1 step behind his head (top edge at head height) and rises ~7 %/s; B&W cutout rises 5 steps power3.out; tracked caps typed 2.5 chars/step; slow push."))
# ===================================================================== S11 fav_88 podium
b = cover(L("stadium_blur.jpg"), s=1.12)
tl2 = Image.new("RGBA", b.size, (0, 0, 0, 0))
tline(tl2, "ADD AN", "serif", 196, 70, maxw=640); tline(tl2, "AMOUNT", "serif", 196, 262, maxw=980)
b.alpha_composite(tl2)
pd = Image.open(I3 / "podium.png").convert("RGBA"); pd = pd.crop(pd.getbbox()); pd, kk = scale(pd, h=1780); px, py = (W - pd.width) / 2, 150
paste(b, pd, px, py); bb = L("podium.png").getbbox(); bar(b, [dict(F3["podium"][0], cx=F3["podium"][0]["cx"] - bb[0], cy=F3["podium"][0]["cy"] - bb[1])], kk, px, py)
pill(b, "add a fundraising amount", 2, 900)
save("s11", b, dict(t="19.73-22.65", line="and your club can add a fundraising amount to each jersey.", ref="gold_22.90.jpg", refid="fav_88 · GOLD P20 20.4-23.5 (podium)",
     motion="Push x1.215 (+5.8 %/s) pan -156 px; title letters behind her raised arms, enter at scale 0.7→1; 'each jersey' = burst x1.00→1.28 in steps +3/+7/+6/+3/+5 % (feet leave the frame), PARALLAX during every zoom: bg x1.12, girl x1.28, title x1.4 (three layers); single slow shine."))
# ===================================================================== S12/S12b fav_84 + fav_85 family
def fam(sc, dy, t1, t1s, t2, t2s, words, done, sid, meta):
    b = cover(bw(L("track_bw.jpg")), s=1.0 + (sc - 1) * 0.3); b = halftone(b, 0.12)
    fp = L("family_people.png"); fk = 1.18 * sc; fp = fp.resize((round(fp.width * fk), round(fp.height * fk)), Image.LANCZOS)
    fx, fy = (W - fp.width) / 2, 260 + dy; paste(b, fp, fx, fy)
    bar(b, F2["family.jpg"], fk, fx, fy, idx=(0, 1, 2))
    tline(b, t1, "cond", t1s, 120, stroke=2); tline(b, t2, "serif", t2s, 120 + t1s - round(t2s * 0.12), maxw=1000)
    pill(b, words, done, 900); save(sid, b, meta)
fam(1.0, 0, "FAMILIES", 100, "SEE", 250, "Families see", 2, "s12", dict(t="22.65-23.28", line="Families see", ref="gold_9.9.jpg", refid="fav_84 · GOLD P06 7.32-10.28",
     motion="Hard cut from defocus 36→0 px (5 f) + slide -85 px settle x1.08→1.0; colour family cutout over B&W track, brushed eye bars glued to faces; bg moves 15-25 % of the family's parallax; title typed 1.5/2.2 f per letter."))
fam(1.08, 90, "THE REGULAR", 92, "PRICE", 250, "the regular price,", 3, "s12b", dict(t="23.28-24.06", line="the regular price,", ref="gold_11.35.jpg", refid="fav_85 · GOLD P07-P09 10.32-11.6",
     motion="Punch-in jump +8 % / +90 px in 1 frame (no blur); new title typed fast (1.1 f/letter, huge serif 2 f/letter at scale 0.7→1); exit: zoom 1.0→1.5 with pan -315 px and blur 3→18 px, hard cut."))
# ===================================================================== S13 fav_98 Jane
b = cover(L("clubhouse.jpg"), fy=0.4); b = duo(b, (14, 22, 40), (150, 170, 196), 1.05)
tg = Image.new("RGBA", (W, 900), (0, 0, 0, 0)); tgd = ImageDraw.Draw(tg)
for yy in range(900): tgd.line([(0, yy), (W, yy)], fill=(4, 6, 12, round(255 * (1 - yy / 900) ** 1.2)))
b.alpha_composite(tg); b = halftone(b, 0.14)
tline(b, "THE MARKUP STAYS", "cond", 84, 120, col=(239, 222, 170), stroke=1, sh=False)
tline(b, "PRIVATE", "serif", 210, 215, maxw=1000)
wm = Image.open(I3 / "woman.png").convert("RGBA"); wm = ImageEnhance.Brightness(ImageEnhance.Color(wm).enhance(0.25)).enhance(0.62)
wm, kk = scale(wm, 1240); wx, wy = (W - wm.width) / 2, H - wm.height + 30
fs_ = Image.new("L", wm.size, 0); fsd = ImageDraw.Draw(fs_); fy0 = F3["woman"][0]["cy"] * kk
for yy in range(wm.height): fsd.line([(0, yy), (wm.width, yy)], fill=round(165 * max(0, min(1, 1 - (yy - fy0 + 140) / 480))))
sh_ = Image.new("RGBA", wm.size, (0, 0, 0, 255)); sh_.putalpha(ImageChops.multiply(fs_, wm.split()[-1])); wm.alpha_composite(sh_)
paste(b, wm, wx, wy)
bar(b, F3["woman"], kk, wx, wy, style="white")
pill(b, "markup stays private.", 3, 1384)
save("s13", b, dict(t="24.06-26.70", line="while the fundraising markup stays private.", ref="arr_34.96.jpg", refid="fav_98/99 · ARR P144 33.92-36.0 (Jane)",
     motion="Darkened woman with a black shade over the face fading down (white rough-brush bar on the eyes); bg = black→navy gradient at the top; rises from the bottom over a navy-graded clubhouse; cond line typed, gold serif word fades in BEHIND her head; slow push."))
# ===================================================================== S14 fav_87 torn split + ball
b = halftone(grad(hexc("#24435E"), hexc("#16304A")), 0.14)
st_ = cover(Image.open(I3 / "strip_start.jpg").convert("RGBA"), W, 760, fy=0.6); st_ = halftone(st_, 0.16)
strip = Image.new("RGBA", (W, H), (0, 0, 0, 0)); strip.paste(st_, (0, 0)); strip = torn_edge(strip, 720, below=False); b.alpha_composite(strip)
tline(b, "STRAIGHT INTO", "cond", 96, 110, stroke=2, shcol=(16, 26, 44)); tline(b, "YOUR CLUB", "serif", 150, 215, shcol=(16, 26, 44))
bl = Image.open(I3 / "ball3d/f_000.png").convert("RGBA"); bl, _ = scale(bl, 855); bs, bo = shadow(bl, dy=20, blur=20, a=0.5); paste(b, bs, 112 - bo, 540 - bo)
pill(b, "directly into your club", 2, 900)
save("s14", b, dict(t="26.70-28.85", line="That extra money goes directly into your club", ref="gold_17.95.jpg", refid="fav_87 · GOLD P12-P15 14.6-18.12 (globe)",
     motion="Ball (the globe) drops 504 px in 2 frames, dead stop, settles +36 px, SPINS IN 3D like the globe (procedural ball, 22.5°/s, new pose each 12 fps step); torn strip slides down 870 px in 15 f (+255/+225/+210 px per step); hard cuts between two kids-race photos inside the strip; title typed on the strip."))
# ===================================================================== S15 fav_97 NEVER THE CASE
b = halftone(grad(hexc("#9A4440"), hexc("#5E2724")), 0.22)
tline(b, "NOT STORE CREDIT", "cond", 96, 120, col=CREAM, stroke=1, sh=False)
tline(b, "CASH", "serif", 250, 205, col=CREAM, shcol=(60, 20, 18))
cm = Image.open(I3 / "cashman.png").convert("RGBA"); cm = duo(cm, (42, 28, 18), (241, 228, 204), 1.1); cm, kk = scale(cm, 1080)
cx_, cy_ = (W - cm.width) / 2, H - cm.height + 90; paste(b, cm, cx_, cy_); bar(b, F3["cashman"], kk, cx_, cy_)
pill(b, "in cash, not store credit.", 2, 1384)
save("s15", b, dict(t="28.85-30.92", line="in cash, not store credit.", ref="arr_21.15.jpg", refid="fav_97 · ARR P130 20.16-21.28 (NEVER THE CASE)",
     motion="Sepia cutout static with slow push over red halftone; title letter-wipes in L→R (cond line, then heavy serif); exit = navy torn strip sweeps up over the frame in 4 f, hard cut."))
# ===================================================================== S16 fav_86 bleachers + runner
b = cover(L("pitch_sky.jpg"), fy=0.75, s=1.05); b = halftone(b, 0.24)
rk_ = L("runner_kid.png"); rk_ = rk_.crop(rk_.getbbox()); rk_, kk = scale(rk_, h=380); paste(b, rk_, 470, 560)
tline(b, "FIELD", "cond", 104, 120, col=(250, 250, 250), stroke=2, shcol=(42, 74, 122)); tline(b, "RENTALS", "serif", 196, 228, col=(250, 250, 250), shcol=(42, 74, 122))
blc = Image.open(I3 / "bleachers.jpg").convert("RGBA"); blc = blc.crop((0, 560, 768, 1376)); blc, _ = scale(blc, W)
blc = halftone(blc.filter(ImageFilter.GaussianBlur(5)), 0.2); fg = Image.new("RGBA", (W, H), (0, 0, 0, 0)); fg.paste(blc, (0, H - blc.height)); fg = torn_edge(fg, H - blc.height + 30, seed=8, amp=6, rim=0); b.alpha_composite(fg)
pill(b, "field rentals,", 2, 900)
save("s16", b, dict(t="30.92-32.42", line="Use it for field rentals,", ref="gold_14.1.jpg", refid="fav_86 · GOLD P10 11.6-14.4 (stadium seats)",
     motion="Enters zoomed x1.3 with motion blur + defocus, settles 1.3→1.0 with pan -186 px (blur clears in 4 steps), then pull-out -2.4 %/s; halftone dots over everything; seat foreground stays out of focus; seats+parents foreground move 1.5x the bg; runner drifts +7 px; white title with navy shadow typed ~2 f/letter; slide down 1290 px in 1 step to exit."))
# ===================================================================== S17 fav_93 teal portrait
c = Image.open(I2 / "coach.jpg").convert("RGBA"); f0 = F2["coach.jpg"][0]
kk = 2.35; c = c.resize((round(c.width * kk), round(c.height * kk)), Image.LANCZOS); cx_, cy_ = 540 - f0["cx"] * kk, 980 - f0["cy"] * kk
cd = duo(c, (19, 39, 42), (207, 226, 220)); top_ = cd.crop((0, 0, cd.width, 30)).resize((1, 1), Image.BOX).getpixel((0, 0))
b = Image.new("RGBA", (W, H), top_); paste(b, cd, cx_, cy_)
vg = Image.new("RGBA", (W, 760), (0, 0, 0, 0)); vgd = ImageDraw.Draw(vg)
for yy in range(760): vgd.line([(0, yy), (W, yy)], fill=(14, 30, 34, round(200 * (1 - yy / 760))))
b.alpha_composite(vg); b = halftone(b, 0.18)
bar(b, F2["coach.jpg"], kk, cx_, cy_)
tline(b, "Coaches", "serif", 150, 110, col=CREAM, wght=600, sh=False, track=0.0)
tline(b, "for every team", "ital", 92, 270, col=CREAM, wght=400, sh=False, track=0.0)
pill(b, "coaches,", 1, 1384)
save("s17", b, dict(t="32.42-33.47", line="coaches,", ref="fav_93.png", refid="fav_93 · DK P88 8.36 (Justin Kruger in 1999)",
     motion="Hard cut + rack-focus (20 px → sharp in 3 f); teal duotone portrait, push +4 %; serif name typed, italic line types after it; no wiggle on the serif (DK style)."))
# ===================================================================== S18 fav_100 silhouette + wobbly hand text
mn = L("manor.jpg"); mn = mn.crop((0, 0, mn.width, round(mn.height * 0.56)))
mn, _ = scale(mn, W); b = Image.new("RGBA", (W, H), (8, 4, 5, 255)); b.paste(mn, (0, -40))
fb = Image.new("RGBA", (W, 300), (0, 0, 0, 0)); fbd = ImageDraw.Draw(fb)
for yy in range(300): fbd.line([(0, yy), (W, yy)], fill=(8, 4, 5, round(255 * yy / 300)))
b.alpha_composite(fb, (0, mn.height - 340)); b = halftone(b, 0.10)
mo = L("mother.png"); mo = mo.crop(mo.getbbox()); mo, _ = scale(mo, h=1700)
a = mo.split()[-1]; glow = Image.new("RGBA", mo.size, (255, 50, 34, 0)); glow.putalpha(a.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(14)))
sil = Image.new("RGBA", mo.size, (12, 6, 8, 255)); sil.putalpha(a)
mx, my = (W - mo.width) / 2, H - mo.height + 40; paste(b, glow, mx, my); paste(b, sil, mx, my)
tline(b, "help for", "hand", 130, 900, col=(250, 250, 250), sh=False, track=0.12)
tline(b, "FAMILIES", "hand", 230, 1020, col=(250, 250, 250), sh=False, track=0.02, maxw=1000)
pill(b, "assistance for families,", 2, 1384)
save("s18", b, dict(t="33.47-35.14", line="financial assistance for families,", ref="fav_100.png", refid="fav_100 · ARR P146 37.92 (EMPTY / LOST)",
     motion="Red sky with a black manor silhouette (chimneys) across the top, fading to black below; mother+child black silhouette centred with a red rim glow; white hand-drawn words write on stroke by stroke and keep boiling (wobbly line re-drawn every step); slow push."))
# ===================================================================== S19 fav_94 FITNESS
b = halftone(grad(hexc("#34496A"), hexc("#18233A")), 0.18)
tline(b, "whatever your club", "serif", 74, 110, col=CREAM, wght=500, sh=False, track=0.0)
tline(b, "NEEDS", "serif", 240, 185, col=CREAM, shcol=(12, 18, 30))
gc_ = Image.open(I3 / "gearcoach.png").convert("RGBA"); gc_ = bw(gc_, 1.2); gc_, kk = scale(gc_, 1000); gx, gy = (W - gc_.width) / 2, H - gc_.height + 160
paste(b, gc_, gx, gy); bar(b, F3["gearcoach"], kk, gx, gy)
pill(b, "whatever your club needs.", 3, 1384)
save("s19", b, dict(t="35.14-35.80", line="or whatever your club needs.", ref="fav_94.png", refid="fav_94 · DK P102 28.8 (FITNESS)",
     motion="B&W cutout over navy halftone, rises 5 steps power3.out; small serif line + heavy serif word typed; push +4 %."))
s19 = b.copy()
# ===================================================================== S20 host rise + dissolve (P27)
b = ImageEnhance.Brightness(s19.convert("RGB")).enhance(0.86).convert("RGBA")
im, x, y = host_co("36.0"); paste(b, im, x, 300)
pill(b, "whatever your club needs.", 4, 1384)
save("s20", b, dict(t="35.80-36.24", line="(…needs.)", ref="gold_35.90.jpg", refid="GOLD P27 35.76-36.2 (host rises over the crowd)",
     motion="Collage freezes and dims 10-15 %; host cutout rises (hair-top 1230→114 px in 6 f, decay x0.7/f, no overshoot) with whoosh+pop; dissolves into the real TH in 6 f with blue light leaks."))
# ===================================================================== S21 TH title (GOLD MEDAL SYNDROME on TH)
b = tht("37.5"); b.alpha_composite(g)
tline(b, "STORE CREDIT", "cond", 100, 175, stroke=2); tline(b, "MORE GEAR", "serif", 170, 290)
paste(b, cot("37.5"), 0, 0); pill(b, "buys more gear.", 2, 1384)
save("s21", b, dict(t="36.24-38.62", line="Store credit buys more gear.", ref="gold_46.2.jpg", refid="GOLD P30 44.68-46.44 (title on TH)",
     motion="TH; title behind the head typed 1.1-1.5 f/letter on the 12 fps grid, wiggle ±3-6 px; ding on the last letter; 6-frame linear fade (blend) out."))
# ===================================================================== S22 fav_90 JAM JAR title card
b = halftone(grad(hexc("#6457BC"), hexc("#1C1550")), 0.16)
tline(b, "CASH", "serif", 300, 100, col=YEL, sh=False)
tline(b, "FREEDOM", "serif", 230, 1020, col=YEL, sh=False, maxw=1000)
tr = L("trophy.png"); tr = tr.crop(tr.getbbox()); tr, _ = scale(tr, h=860); ts, to = shadow(tr, dy=24, blur=18, a=0.45); paste(b, ts, (W - tr.width) / 2 - to, 300 - to)
tline(b, "TO INVEST", "cond", 92, 1280, col=YEL, sh=False, track=0.45)
pill(b, "the freedom to invest", 2, 1500)
save("s22", b, dict(t="38.62-41.90", line="Cash gives your club the freedom to invest in what matters most.", ref="fav_90.png", refid="fav_90 · JAM P50-P51 7.34-9.4 (JAM JAR)",
     motion="Torn-paper wipe into purple; 'CASH' typed big, hero trophy drops in (2 steps + 16 px bounce) overlapping the words, 'FREEDOM' snaps up behind it, tracked 'TO INVEST' types under; slow push."))
# ===================================================================== S23 TH + drop title
b = tht("43.5"); b.alpha_composite(g)
tline(b, "YOU'RE IN", "cond", 100, 175, stroke=2, shcol=(20, 26, 40)); tline(b, "CONTROL", "serif", 190, 290, shcol=(20, 26, 40))
paste(b, cot("43.5"), 0, 0); pill(b, "you control your", 2, 1384)
save("s23", b, dict(t="41.90-46.72", line="With stimulus, you control your fundraising amount. Change it or turn it off at any time.", ref="gold_39.3.jpg", refid="GOLD P29 37.2-39.4 (WHAT'S NEXT? on TH)",
     motion="TH with jump cuts at 42.84 / 44.76 (+80 px, <2 % scale); at 42.84 title letters drop 100 px behind the head (5 f ease-out), fade 3 f."))
# ===================================================================== S24 fav_89 climber
b = halftone(grad(hexc("#4E1A1A"), hexc("#B24C44")), 0.16)
for i, (t, sz) in enumerate([("WHAT COULD", 128), ("YOUR CLUB", 128), ("RAISE?", 190)]):
    tline(b, t, "serif", sz, 150 + i * 136 + (0 if i < 2 else 0), x=60, maxw=980)
tex = cover(ImageEnhance.Brightness(bw(Image.open(R / "flow/v3/rock.jpg").convert("RGBA"), 0.9)).enhance(1.35), s=1.3)
rr = random.Random(4); edge = []; t_ = 0.0
while t_ <= 1.0:
    edge.append((40 + 1080 * t_ + rr.uniform(-14, 14), 1920 - 1360 * t_ + rr.uniform(-26, 26))); t_ += rr.uniform(0.015, 0.04)
rm_ = Image.new("L", (W, H), 0); ImageDraw.Draw(rm_).polygon(edge + [(W + 50, 520), (W + 50, H + 50), (0, H + 50)], fill=255)
rock_ = Image.new("RGBA", (W, H), (0, 0, 0, 0)); rock_.paste(tex, (0, 0), rm_.filter(ImageFilter.GaussianBlur(1.2))); rock_ = halftone(rock_, 0.15)
rs_, ro_ = shadow(rock_, dx=-14, dy=10, blur=16, a=0.45); paste(b, rs_, -ro_, -ro_)
cl_ = bw(L("climber.png"), 1.2); cl_ = cl_.crop(cl_.getbbox()); cl_, _ = scale(cl_, h=760); paste(b, cl_, 430, 540)
pill(b, "what your club could raise?", 4, 1384)
save("s24", b, dict(t="46.72-50.30", line="Want to see what your club could raise? Link in bio.", ref="gold_49.3.jpg", refid="fav_89 · GOLD P32-P34 47.56-51.04 (climber)",
     motion="Red torn-paper strip wipe; climber pops in at +330 px right, offsets 330→135→60→15→0 (no rotation); title stacked left typed 0.8 f/letter, rock occludes the end of 'RAISE?'; layer pull-out to x0.93; 49.13 climber sinks, title flies up, 'LINK IN BIO' types (P34)."))

# ---------------- board sheets: one row per scene, ours | reference | notes ----------------
order = ["s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08", "s09", "s10", "s11", "s12", "s12b", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23", "s24"]
TW, THh = 360, 640; NOTE = 720; ROW = THh + 24
fN = ImageFont.truetype(str(FD / "Poppins-Bold.ttf"), 30); fR = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 25); fS = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 22)
def wraptxt(d, text, f, w):
    out, cur = [], ""
    for wd in text.split():
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) > w and cur: out.append(cur); cur = wd
        else: cur = t
    return out + [cur]
per = 5
for sh_i in range(0, len(order), per):
    rows = order[sh_i:sh_i + per]
    sheet = Image.new("RGB", (TW * 2 + NOTE + 40, ROW * len(rows) + 60), (24, 24, 26)); d = ImageDraw.Draw(sheet)
    d.text((14, 14), "docucollage v3 storyboard — left: OUR planned frame · middle: REFERENCE it copies · right: timing, line, motion (copied from the ref)", font=fS, fill=(200, 200, 200))
    for r, sid in enumerate(rows):
        m = S[sid]; y = 50 + r * ROW
        ours = Image.open(FR / f"{sid}.png").resize((TW, THh), Image.LANCZOS); sheet.paste(ours, (10, y))
        rp = SB / "ref" / m["ref"]; ref = Image.open(rp).convert("RGB"); ref = ImageOps.fit(ref, (TW, THh)); sheet.paste(ref, (TW + 20, y))
        x = TW * 2 + 36
        d.text((x, y), f"{sid.upper()}  {m['t']} s", font=fN, fill=(255, 208, 141))
        yy = y + 46
        for ln in wraptxt(d, f"“{m['line']}”", fR, NOTE - 20): d.text((x, yy), ln, font=fR, fill=(240, 240, 240)); yy += 32
        yy += 10; d.text((x, yy), "REF: " + m["refid"], font=fR, fill=(140, 200, 255)); yy += 44
        for ln in wraptxt(d, "MOTION: " + m["motion"], fS, NOTE - 20): d.text((x, yy), ln, font=fS, fill=(205, 205, 205)); yy += 29
    sheet.save(SB / f"board_{sh_i // per + 1}.jpg", quality=88)
print("frames", len(S), "sheets", math.ceil(len(order) / per))
