# board.py: storyboard_v1.png (every shot's middle frame + the line it covers) and the style frames
import json, glob, re, os, textwrap
from PIL import Image, ImageDraw, ImageFont
R = os.path.dirname(os.path.abspath(__file__)) + "/../"
meta = json.load(open(R + "engine/review_meta.json", encoding="utf-8")); TL = json.load(open(R + "engine/timeline_megagirl.json", encoding="utf-8"))
shots = meta["film"]["shots"]; dur = meta["film"]["dur"]; W = TL["words"]
fs = sorted(glob.glob(R + "review/sb1/s*b_*.png"), key=lambda f: int(re.match(r"s(\d+)", os.path.basename(f)).group(1)))
f1 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
cw, ch, th = 216, 384, 92; cols = 8; rows = (len(fs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (cw + 6) + 6, rows * (ch + th + 6) + 50), (22, 22, 30)); d = ImageDraw.Draw(sheet)
d.text((10, 12), "Digger 05: Humans used to sleep twice  -  storyboard v1 (provisional timing, %d shots, %.0f s)" % (len(shots), dur), font=ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22), fill=(255, 220, 60))
for i, f in enumerate(fs):
    t0 = shots[i][1]; t1 = shots[i + 1][1] if i + 1 < len(shots) else dur
    line = " ".join(w[4] for w in W if t0 - 0.05 <= w[1] < t1 - 0.05)
    x = 6 + (i % cols) * (cw + 6); y = 50 + (i // cols) * (ch + th + 6)
    sheet.paste(Image.open(f).convert("RGB").resize((cw, ch)), (x, y))
    d.text((x + 2, y + ch + 3), "%d  %.1f-%.1f s" % (i + 1, t0, t1), font=f1, fill=(255, 220, 60))
    for k, ln in enumerate(textwrap.wrap(line, 30)[:4]): d.text((x + 2, y + ch + 22 + k * 16), ln, font=f2, fill=(230, 230, 236))
sheet.save(R + "storyboard_v1.png")
# style frames: 5 key shots full size, side by side
pick = [1, 7, 12, 14, 22]
sf = Image.new("RGB", (5 * 540 + 60, 960 + 20), (22, 22, 30))
for k, n in enumerate(pick):
    f = [x for x in fs if int(re.match(r"s(\d+)", os.path.basename(x)).group(1)) == n][0]
    sf.paste(Image.open(f).convert("RGB").resize((540, 960)), (10 + k * 550, 10))
sf.save(R + "review/styleframes_v1.png"); print("ok", len(fs))
