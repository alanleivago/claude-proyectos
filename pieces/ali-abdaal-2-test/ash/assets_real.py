"""REAL Ashton Hall photos (user's library: EMOJIS PNG/ashton*) -> clean cutouts in assets/ash/. No AI on his face:
- ashton_full: the user's own cutout (ashton hall.png), cropped to its alpha.
- dunk: face-in-ice-bowl photo (ashton hal.webp) -> rembg birefnet.
- bananaface: banana-peel photo; the burned-in '8:45 am' caption is removed with OpenCV inpaint (Telea, 4 px), then rembg.
- phone_real: Flow phone with a real frame of his viral routine video (B/W like the ref kiosk) in the screen + a drawn play button / progress bar.
- igcard: his Instagram profile screenshot (14.7M followers)."""
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageFilter, ImageDraw, ImageOps, ImageEnhance
from rembg import new_session, remove
R = Path(__file__).resolve().parent.parent; S = R / "flow/ashton_src"; O = R / "assets/ash"
ses = new_session("birefnet-general")
def clean(im, rgba):
    a = rgba.split()[-1].filter(ImageFilter.MinFilter(3)); a = Image.fromarray(np.where(np.asarray(a) < 12, 0, np.asarray(a)).astype(np.uint8))
    out = im.convert("RGB").copy(); out.putalpha(a); return out.crop(a.getbbox())
full = Image.open(S / "ashton hall.png").convert("RGBA"); full.crop(full.split()[-1].getbbox()).save(O / "ashton_full.png")
d = Image.open(S / "ashton hal.webp").convert("RGB"); clean(d, remove(d, session=ses)).save(O / "dunk.png")
b = cv2.imread(str(S / "ashton hall banana-peal.jpg")); m = np.zeros(b.shape[:2], np.uint8)
roi = b[620:700, 480:720]; txt = (roi.min(2) > 190).astype(np.uint8) * 255; m[620:700, 480:720] = txt
m = cv2.dilate(m, np.ones((5, 5), np.uint8), 2); b = cv2.inpaint(b, m, 4, cv2.INPAINT_TELEA)
bi = Image.fromarray(cv2.cvtColor(b, cv2.COLOR_BGR2RGB)); bi.save(O / "_banana_inpainted.jpg", quality=95)
clean(bi, remove(bi, session=ses)).save(O / "bananaface.png")
ph = Image.open(O / "phone.png").convert("RGBA"); fr = Image.open(S / "ashton-hall-morning-routine-mc-250325-08-2b72be.webp").convert("L")
fr = ImageEnhance.Contrast(fr).enhance(1.2); sx0, sy0, sx1, sy1 = 40, 64, 370, 812
fr = ImageOps.fit(fr, (sx1 - sx0, sy1 - sy0), Image.LANCZOS, centering=(0.5, 0.35)).convert("RGBA")
mask = Image.new("L", fr.size, 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, fr.width - 1, fr.height - 1], radius=26, fill=255)
ph.paste(fr, (sx0, sy0), mask); dd = ImageDraw.Draw(ph); cx, cy = (sx0 + sx1) / 2, (sy0 + sy1) / 2
dd.ellipse([cx - 44, cy - 44, cx + 44, cy + 44], fill=(20, 20, 20, 150)); dd.polygon([(cx - 14, cy - 24), (cx - 14, cy + 24), (cx + 26, cy)], fill=(255, 255, 255, 240))
dd.rectangle([sx0 + 18, sy1 - 40, sx1 - 18, sy1 - 34], fill=(120, 120, 120, 255)); dd.rectangle([sx0 + 18, sy1 - 40, sx0 + 18 + (sx1 - sx0 - 36) * 0.72, sy1 - 34], fill=(230, 30, 30, 255))
ph.save(O / "phone_real.png")
Image.open(S / "ashton ig (1).png").convert("RGBA").save(O / "igcard.png")
print("ok")
