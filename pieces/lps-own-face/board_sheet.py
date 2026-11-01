"""venv: review/board/shot_XXb.png -> review/board_sheet_<tag>.png (storyboard sheet with the line under each shot)."""
import glob, json, os, textwrap
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__))
L = [l["text"] for l in json.load(open(os.path.join(H, "voice/script.json")))["lines"]]
tag = os.environ.get("TAG", "b")
fs = sorted(glob.glob(os.path.join(H, "review/board", f"shot_*{tag}.png")))
W, Hh, cols = 270, 480, 6
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
rows = (len(fs) + cols - 1) // cols
s = Image.new("RGB", (cols * W, rows * (Hh + 60)), (24, 24, 28)); d = ImageDraw.Draw(s)
for i, f in enumerate(fs):
    n = int(os.path.basename(f)[5:7]); x, y = (i % cols) * W, (i // cols) * (Hh + 60)
    s.paste(Image.open(f).convert("RGB").resize((W, Hh)), (x, y))
    d.text((x + 6, y + 6), str(n), fill=(255, 235, 48), font=font)
    d.multiline_text((x + 6, y + Hh + 4), "\n".join(textwrap.wrap(L[n - 1], 34)[:3]), fill=(230, 230, 230), font=font)
s.save(os.path.join(H, "review", f"board_sheet_{tag}.png")); print(s.size)
