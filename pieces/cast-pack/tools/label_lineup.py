"""label cast_render.py lineup output: role + height under each person.   .venv/bin/python label_lineup.py <in.png> <out.jpg> slug,slug,..."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
C = {c["slug"]: c for f in ("cast.json", "cast_pc.json") for c in json.load(open(os.path.join(R, "styles/zawdog/humans", f), encoding="utf-8"))["cast"]}
SHORT = dict(owner="OWNER", vet="VET", neighbour="NEIGHBOUR", kid="KID", grandma="GRANDMA", mailman="MAIL", scientist="SCIENTIST", dogwalker="DOG WALKER",
             youngwoman="YOUNG WOMAN", police="POLICE", delivery="DELIVERY", teen="TEEN", chef="CHEF", jogger="JOGGER", oldman="OLD MAN",
             businesswoman="BUSINESS")
im = Image.open(sys.argv[1]).convert("RGB"); slugs = sys.argv[3].split(","); W, H = im.size
xs = [i * 0.62 for i in range(len(slugs))]; span = len(slugs) * 0.62 + 0.2; cx = xs[-1] / 2; ppm = W / span
S = Image.new("RGB", (W, H + 110), (28, 29, 32)); S.paste(im, (0, 0)); d = ImageDraw.Draw(S)
FP = "C:/Windows/Fonts/courbd.ttf" if os.name == "nt" else "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
f = ImageFont.truetype(FP, 23)
f2 = ImageFont.truetype(FP, 19)
for s, x in zip(slugs, xs):
    px = W / 2 + (x - cx) * ppm
    d.text((px, H + 40), SHORT.get(s, s), font=f, fill=(255, 225, 60), anchor="ms")
    c_ = C.get(s, dict(age=30, height=1.78))
    d.text((px, H + 80), f"{c_['age']} y  {c_['height']:.2f} m", font=f2, fill=(230, 230, 230), anchor="ms")
S.save(sys.argv[2], quality=90); print(sys.argv[2], S.size)
