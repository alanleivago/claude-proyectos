"""contact sheet of inspect_human.py renders: .venv/bin/python styles/zawdog/humans/sheet.py <dir> <name> -> <dir>/sheet.jpg"""
import os, sys
from PIL import Image
d, n = sys.argv[1], sys.argv[2]
t = ["front", "34", "side", "back", "head", "head34", "neckS", "hands", "feet", "hipsF", "hipsB"]
t = [k for k in t if os.path.exists(f"{d}/{n}_{k}.png")]
S = Image.new("RGB", (4 * 360, ((len(t) + 3) // 4) * 360))
for i, k in enumerate(t):
    S.paste(Image.open(f"{d}/{n}_{k}.png").convert("RGB").resize((360, 360)), ((i % 4) * 360, (i // 4) * 360))
S.save(f"{d}/sheet.jpg"); print(f"{d}/sheet.jpg")
