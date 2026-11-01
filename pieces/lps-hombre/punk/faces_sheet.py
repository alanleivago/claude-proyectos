"""venv: contact sheet of out/punk_faces/<expr>_{front,34}.png -> out/punk_faces/faces_sheet.png"""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
O = Path(__file__).resolve().parent.parent / "out" / "punk_faces"
names = ["neutral", "blink", "talkA", "talkO", "scream", "shocked", "bloodshot", "tired", "grimace", "happy", "sad", "angry", "blank", "disgust", "crosseyed"]
T = 300
def bg(im):
    b = Image.new("RGBA", im.size, (128, 130, 136, 255)); b.alpha_composite(im.convert("RGBA")); return b.convert("RGB")
cols = 7
s = Image.new("RGB", (cols * T, ((len(names) + cols - 1) // cols) * 2 * T), (40, 40, 44)); d = ImageDraw.Draw(s)
for i, n in enumerate(names):
    for j, v in enumerate(("front", "34")):
        im = bg(Image.open(O / f"{n}_{v}.png")).crop((120, 80, 520, 480)).resize((T, T), Image.LANCZOS)
        x, y = (i % cols) * T, ((i // cols) * 2 + j) * T
        s.paste(im, (x, y)); d.text((x + 6, y + 6), f"{n} {v}", fill=(255, 235, 48))
s.save(O / "faces_sheet.png"); print(s.size)
