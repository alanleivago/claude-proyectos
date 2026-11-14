# sheet.py DIR OUT PATTERN: contact sheet of stills (8 per row, 270x480 each)
import sys, glob, os
from PIL import Image
d, out, pat = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "s*"
fs = sorted(glob.glob(os.path.join(d, pat + ".png")))
cw, ch, cols = 270, 480, 8
rows = (len(fs) + cols - 1) // cols
S = Image.new("RGB", (cols * cw, rows * ch), (0, 0, 0))
for i, f in enumerate(fs): S.paste(Image.open(f).convert("RGB").resize((cw, ch)), ((i % cols) * cw, (i // cols) * ch))
S.save(out); print(len(fs))
