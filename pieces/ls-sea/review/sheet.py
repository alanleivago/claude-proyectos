import sys, glob
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + '/t_*.png'), key=lambda f: float(f.split('t_')[1][:-4]))
ims = [Image.open(f) for f in fs]; w, h = ims[0].size; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
rows = (len(ims) + cols - 1) // cols; S = Image.new('RGB', (cols * w, rows * h), (20, 20, 20))
for i, im in enumerate(ims): S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(sys.argv[2]); print(len(ims), S.size)
