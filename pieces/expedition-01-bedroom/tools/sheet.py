# sheet.py DIR OUTPREFIX [per=6]: review stills s01a_f0005.png ... -> contact sheets (columns = shots, rows = start/mid/end)
import sys, os, glob, re
from PIL import Image, ImageDraw, ImageFont
D, OUT = sys.argv[1], sys.argv[2]; per = int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(os.path.join(D, "s*_f*.png")))
by = {}
for f in fs:
    m = re.match(r"s(\d+)([abc])_f(\d+)", os.path.basename(f)); by.setdefault(int(m.group(1)), {})[m.group(2)] = (f, int(m.group(3)))
font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
W, H = 240, 427; shots = sorted(by)
for k in range(0, len(shots), per):
    grp = shots[k:k + per]
    im = Image.new("RGB", (W * len(grp), H * 3 + 24), (16, 16, 20)); d = ImageDraw.Draw(im)
    for c, s in enumerate(grp):
        d.text((c * W + 6, 3), f"#{s:02d}", fill=(255, 220, 80), font=font)
        for r, key in enumerate("abc"):
            if key not in by[s]: continue
            f, fr = by[s][key]; t = Image.open(f).convert("RGB").resize((W, H), Image.NEAREST)
            im.paste(t, (c * W, 24 + r * H)); d.text((c * W + 4, 24 + r * H + 2), f"{fr / 30:.2f}s", fill=(255, 255, 255), font=font)
    im.save(f"{OUT}_{k // per + 1}.png")
print("sheets", (len(shots) + per - 1) // per)
