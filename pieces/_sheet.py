import sys, glob
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + "/frame-*.png")); w = int(sys.argv[3]) if len(sys.argv) > 3 else 300
ims = [Image.open(f).convert("RGB").resize((w, int(w * 1920 / 1080))) for f in fs]
cols = 6; rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (cols * w, rows * ims[0].size[1]))
for i, im in enumerate(ims): S.paste(im, (i % cols * w, i // cols * im.size[1]))
S.save(sys.argv[2], quality=88)
