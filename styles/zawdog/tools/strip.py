"""join motion_check frames into one strip: .venv/bin/python styles/zawdog/tools/strip.py <dir> <action>"""
import glob, os, sys
from PIL import Image
d, n = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(os.path.join(d, f"_{n}_*.png")))
ims = [Image.open(f).convert("RGB") for f in fs]
S = Image.new("RGB", (sum(i.width for i in ims), ims[0].height))
x = 0
for i in ims:
    S.paste(i, (x, 0)); x += i.width
S.save(os.path.join(d, f"{n}_strip.jpg"), quality=88)
for f in fs:
    os.remove(f)
print(os.path.join(d, f"{n}_strip.jpg"))
