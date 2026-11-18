"""profile pictures: his_idle through the calibrated reference camera (f001), tights model, rendered 3x with alpha
(tools/anim/render2.mjs brand) -> tight head-and-shoulders square, centred for a circular crop, 2 flat backgrounds.
python branding/make_pfp.py"""
import os
from PIL import Image, ImageDraw
os.chdir(os.path.dirname(os.path.abspath(__file__)))
BOX = (810, 640, 2430, 2260)                     # 1620 x 1620 at 3x of his 1080x1920 frame
BGS = {"teal": (38, 196, 214), "pink": (255, 122, 178)}
for tag, src in (("", "../review/engine2/brand_pfp_his0.png"), ("_smile", "../review/engine2/brand_pfp_his0_smile.png")):
    fg = Image.open(src).convert("RGBA").crop(BOX)
    for name, col in BGS.items():
        im = Image.new("RGBA", fg.size, col + (255,)); im.alpha_composite(fg); im = im.convert("RGB")
        im.save(f"pfp_{name}{tag}_1620.png"); im.resize((1080, 1080), Image.LANCZOS).save(f"pfp_{name}{tag}_1080.png")
# circle preview of the two main variants
prev = Image.new("RGB", (1080 * 2 + 60, 1080 + 40), (24, 24, 24))
for i, name in enumerate(BGS):
    im = Image.open(f"pfp_{name}_1080.png"); m = Image.new("L", im.size, 0); ImageDraw.Draw(m).ellipse([0, 0, 1079, 1079], fill=255)
    prev.paste(im, (20 + i * 1100, 20), m)
prev.save("_pfp_circle_preview.png"); print("ok")
