"""Flow generations -> cutouts (rembg birefnet-general) + editorial treatment (duotone + halftone dot screen), sized for 1080x1920.
python prep/assets.py"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
R = Path(__file__).resolve().parent.parent; G = R / "flow/gen"; O = R / "assets/img"; O.mkdir(parents=True, exist_ok=True)
_s = [None]
def sess():
    if _s[0] is None:
        from rembg import new_session; _s[0] = new_session("birefnet-general")
    return _s[0]
def hexc(h): return np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], np.float32)
def treat(im, width, lo="#1A1A1A", hi="#F2F2F2", pitch=6, amt=0.42, contrast=1.15):
    """grayscale -> contrast -> halftone dots (45deg, pitch px at final size) mixed with tone -> duotone lo..hi"""
    a = im.getchannel("A") if im.mode == "RGBA" else None
    h = round(im.height * width / im.width)
    g = np.asarray(im.convert("L").resize((width, h), Image.LANCZOS), np.float32) / 255
    g = np.clip((g - 0.5) * contrast + 0.5, 0, 1)
    yy, xx = np.mgrid[0:h, 0:width].astype(np.float32)
    u = (xx + yy) / np.sqrt(2) / pitch; v = (xx - yy) / np.sqrt(2) / pitch
    d = np.sqrt((u - np.round(u)) ** 2 + (v - np.round(v)) ** 2) / 0.7071    # 0 centre .. 1 corner
    dot = (d > np.sqrt(1 - g)).astype(np.float32)                              # dark dot grows as tone darkens
    dot = np.asarray(Image.fromarray((dot * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
    t = g * (1 - amt) + dot * amt
    rgb = hexc(lo)[None, None] * (1 - t[..., None]) + hexc(hi)[None, None] * t[..., None]
    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    if a is not None:
        out = out.convert("RGBA"); out.putalpha(a.resize((width, h), Image.LANCZOS))
    return out
def cut(src):
    from rembg import remove
    o = remove(Image.open(G / src).convert("RGB"), session=sess())
    return o.crop(o.getbbox())
def color(im, width):
    h = round(im.height * width / im.width); return im.resize((width, h), Image.LANCZOS)
SEP = ("#2A1C12", "#F1E4CC"); BW = ("#141414", "#F0F0EE"); TEAL = ("#13272A", "#CFE2DC")
if not (O / "salesman.png").exists():
    f = {k: next(G.glob(f"*{k}*.jpg")).name for k in ["19-44-21", "19-45-41", "19-46-06", "19-46-21", "19-46-39", "19-46-57", "19-48-55", "19-47-32", "19-47-52", "19-48-13"]}
    salesman = cut(f["19-44-21"]); treat(salesman, 980, *BW).save(O / "salesman.png")
    doc = cut(f["19-45-41"]); color(doc, 900).save(O / "doc.png")
    jersey = cut(f["19-46-06"]); color(jersey, 700).save(O / "jersey.png")
    jacket = cut(f["19-46-21"]); color(jacket, 560).save(O / "jacket.png")
    cash = cut(f["19-48-55"]); color(cash, 760).save(O / "cash.png")
    voucher = cut(f["19-47-32"]); color(voucher, 620).save(O / "voucher.png")
    coach = cut(f["19-48-13"]); treat(coach, 1000, *SEP).save(O / "coach.png")
    treat(Image.open(G / f["19-46-39"]), 1080, *TEAL, contrast=1.25).save(O / "store.png")
    fam = Image.open(G / f["19-46-57"]).convert("RGB"); color(fam, 1080).save(O / "family.png")
    treat(Image.open(G / f["19-47-52"]), 1080, *BW, contrast=1.3).save(O / "field.png")
    treat(salesman, 980, *SEP).save(O / "salesman_sep.png")
for p in sorted(O.glob("*.png")): print(p.name, Image.open(p).size)
# --- colourways of the jersey (hue rotation of the green body) + B&W family variant ---
import colorsys
def hue(im, deg, sat=1.0, val=1.0):
    a = np.asarray(im.convert("RGBA"), np.float32) / 255
    rgb = a[..., :3]; mx = rgb.max(-1); mn = rgb.min(-1); s = (mx - mn) / (mx + 1e-6)
    hsv = np.asarray(Image.fromarray((rgb * 255).astype(np.uint8)).convert("HSV"), np.float32)
    m = s > 0.25
    hsv[..., 0] = np.where(m, (hsv[..., 0] + deg / 360 * 255) % 255, hsv[..., 0])
    hsv[..., 1] = np.where(m, np.clip(hsv[..., 1] * sat, 0, 255), hsv[..., 1])
    hsv[..., 2] = np.where(m, np.clip(hsv[..., 2] * val, 0, 255), hsv[..., 2])
    out = Image.fromarray(hsv.astype(np.uint8), "HSV").convert("RGBA"); out.putalpha(im.getchannel("A")); return out
J = Image.open(O / "jersey.png")
for n, (d, s, v) in {"j_red": (-120, 1.1, 1.0), "j_blue": (95, 1.0, 1.0), "j_purple": (150, 1.0, 1.0), "j_orange": (-95, 1.2, 1.25), "j_navy": (105, 0.9, 0.6)}.items():
    hue(J, d, s, v).save(O / f"{n}.png")
treat(Image.open(O / "family.png"), 1080, *BW, contrast=1.2).save(O / "family_bw.png")
# --- v2: salesman with FUNDRAISING sign; jersey colourways by tinting the green squares (luminance kept) ---
if not (O / "salesman2.png").exists():
    s2 = cut(next(G.glob("*20-07-18*.jpg")).name); treat(s2, 900, *BW).save(O / "salesman2.png")
def tint(im, rgb):
    a = np.asarray(im.convert("RGBA"), np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.clip((g - np.maximum(r, b) - 12) / 40, 0, 1)[..., None]           # green-ness
    lum = (0.3 * r + 0.59 * g + 0.11 * b)[..., None] / 110.0                  # green squares ~110 luma
    col = np.clip(np.array(rgb, np.float32)[None, None] * lum, 0, 255)
    a[..., :3] = a[..., :3] * (1 - m) + col * m
    return Image.fromarray(a.astype(np.uint8), "RGBA")
for n, c in {"j_red": (200, 30, 40), "j_blue": (30, 90, 200), "j_purple": (235, 195, 30), "j_orange": (240, 120, 20), "j_navy": (25, 35, 80)}.items():
    tint(J, c).save(O / f"{n}.png")
