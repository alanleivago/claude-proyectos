"""venv: revision-2 textures.
- tex/flow/face_sci.jpg (+ eyes.json): the lab scientist's Flow passport photo
- tex/pic_meme1..4.png: four funny dog pictures for the walls (one Flow 2x2 sheet, each picture whole)
- tex/lab_sign.png: BARNARD DOG LAB with the text fitted inside the board
- tex/street_night.png: the kitchen-window street with a real night sky (gradient, stars, moon, soft clouds)
python prep_v2.py"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, "tex"); G = os.path.join(H, "ref", "flow", "gen")


def ps1(im, size, colors=32):
    im = im.convert("RGB").resize(size, Image.BOX)
    return im.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


src = lambda key: os.path.join(G, next(f for f in sorted(os.listdir(G)) if key in f))

# scientist face: 512 px, eyes measured on the 1024 source
im = Image.open(src("studio-passport")).convert("RGB")
im.resize((512, 512), Image.LANCZOS).save(os.path.join(T, "flow", "face_sci.jpg"), quality=95)
ej = os.path.join(T, "flow", "eyes.json"); E = json.load(open(ej))
E["face_sci"] = {"l": [216, 183], "r": [298, 182], "size": [512, 512]}
json.dump(E, open(ej, "w"), indent=1)

# meme pictures: the four quarters, whole (only the white gutter trimmed)
q = Image.open(src("2x2-grid")).convert("RGB"); w, h = q.size
for k in range(4):
    cx, cy = k % 2, k // 2
    box = (int(cx * w / 2) + (6 if cx else 0), int(cy * h / 2) + (6 if cy else 0), int((cx + 1) * w / 2) - (0 if cx else 6), int((cy + 1) * h / 2) - (0 if cy else 6))
    ps1(q.crop(box), (112, 112), 48).save(os.path.join(T, f"pic_meme{k + 1}.png"))

# lab sign: text fitted with margins inside the border
sg = Image.new("RGB", (512, 128), (234, 238, 244)); d = ImageDraw.Draw(sg)
d.rectangle((0, 0, 511, 127), outline=(32, 58, 110), width=10)
f = None
for size in range(80, 20, -2):
    f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", size)
    if d.textlength("BARNARD DOG LAB", font=f) < 512 - 2 * 44:
        break
d.text((256, 66), "BARNARD DOG LAB", font=f, fill=(32, 58, 110), anchor="mm")
sg.resize((256, 64), Image.BOX).save(os.path.join(T, "lab_sign.png"))

# night street: sky replaced by a night sky; the street darkened and blued
st = np.asarray(Image.open(os.path.join(H, "ref", "flow", "street_view.jpg")).convert("RGB").resize((512, 288), Image.BOX)).astype(float)
lum = st.mean(-1); sat = st.max(-1) - st.min(-1)
sk = (lum > 150) & (sat < 70); sk = nd.binary_closing(sk, iterations=3) | sk
lab, n = nd.label(sk); m = np.isin(lab, list(set(np.unique(lab[0])) - {0})); m[:3] = True; m = nd.binary_opening(m, iterations=1)
yy, xx = np.mgrid[:288, :512]
rng = np.random.default_rng(7)
sky = np.zeros((288, 512, 3))
top, hor = np.array([10, 14, 38]), np.array([38, 50, 92])
k = (yy / 150.0).clip(0, 1)[..., None]
sky[:] = top + (hor - top) * k
cl = nd.gaussian_filter(rng.random((288, 512)), 14); cl = (cl - cl.mean()) / cl.std()
cl2 = nd.gaussian_filter(rng.random((288, 512)), 5); cl2 = (cl2 - cl2.mean()) / cl2.std()
cover = np.clip((cl + 0.35 * cl2 - 0.55) * 0.9, 0, 1)[..., None] * (yy < 150)[..., None]
sky = sky * (1 - 0.75 * cover) + np.array([92, 98, 128]) * 0.75 * cover        # moonlit clouds
for _ in range(70):                                                            # stars where no cloud
    x, y = rng.integers(0, 512), rng.integers(0, 140)
    if cover[y, x, 0] < 0.15:
        b = rng.uniform(170, 255); sky[y, x] = b
        if rng.random() < 0.25:
            sky[max(0, y - 1):y + 2, max(0, x - 1):x + 2] = np.maximum(sky[max(0, y - 1):y + 2, max(0, x - 1):x + 2], b * 0.55)
mx, my = 330, 46                                                               # moon + halo
r = np.hypot(xx - mx, yy - my)
sky += (np.exp(-(r / 40) ** 2) * 40)[..., None] * np.array([0.8, 0.85, 1.0])
sky[r < 11] = (236, 232, 210)
out = st * np.array([0.32, 0.36, 0.58])                                        # street at night
out[m] = sky[m]
ps1(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), (256, 144), 64).save(os.path.join(T, "street_night.png"))
print("prep_v2 done")
