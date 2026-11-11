"""compose a cast sheet: front | 3/4 | side (relaxed idle) on top, the 6 faces on the model below, name + role.
    .venv/bin/python pieces/cast-pack/tools/compose_sheet.py <slug> <render_dir> <out.jpg>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
slug, d, out = sys.argv[1:4]
cast = {c["slug"]: c for c in json.load(open(os.path.join(R, "styles/zawdog/humans/cast.json")))["cast"]} if os.path.exists(
    os.path.join(R, "styles/zawdog/humans/cast.json")) else {}
c = cast.get(slug, {"role": slug})
E = ("neutral", "smile", "surprised", "crying", "laughing", "scared")
W = 6 * 300; S = Image.new("RGB", (W, 60 + 1000 + 340), (30, 31, 34)); dr = ImageDraw.Draw(S)
try:
    f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 34); f2 = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 20)
except OSError:
    f = f2 = ImageFont.load_default()
dr.text((20, 12), f"{slug} - {c.get('role', '')}  ({c.get('age', '?')} y, {c.get('height', '?')} m, {c.get('footwear', '')})", fill=(250, 220, 60), font=f)
for i, t in enumerate(("front", "34", "side")):
    S.paste(Image.open(os.path.join(d, f"{slug}_{t}.png")).convert("RGB"), (i * 600, 60))
for i, e in enumerate(E):
    S.paste(Image.open(os.path.join(d, f"{slug}_head_{e}.png")).convert("RGB").resize((300, 300)), (i * 300, 1060))
    dr.text((i * 300 + 10, 1365), e, fill=(240, 240, 240), font=f2)
S.save(out, quality=90); print(out)
