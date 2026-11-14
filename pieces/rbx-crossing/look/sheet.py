# python look/sheet.py -> look/look_sheet.jpg (labelled panels, 4x2)
import os
from PIL import Image, ImageDraw, ImageFont
d = os.path.dirname(os.path.abspath(__file__))
try: font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 24)
except Exception: font = ImageFont.load_default()
P = [('a_cast', 'a  cast: twins, teacher, Rudy, Wes, Miss Dot'), ('b_road', 'b  the endless road, driverless cars'), ('c_dot', 'c  Miss Dot stops the cars'), ('d_count', 'd  Rudy counts everything'),
     ('e_snow', 'e  first snow: Wes closes the line'), ('f_hall', 'f  the hallway photos'), ('g_end', 'g  the vest, the whistle, the snow')]
w, h = 540, 960
sheet = Image.new('RGB', (w * 4, h * 2), 'black'); g = ImageDraw.Draw(sheet)
for i, (n, label) in enumerate(P):
    im = Image.open(os.path.join(d, n + '.png')).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = (i % 4) * w, (i // 4) * h; sheet.paste(im, (x, y)); g.rectangle([x, y, x + w, y + 38], fill=(0, 0, 0)); g.text((x + 10, y + 7), label, font=font, fill=(255, 255, 255))
sheet.save(os.path.join(d, 'look_sheet.jpg'), quality=88); sheet.resize((w * 2, h)).save(os.path.join(d, '_sheet_small.jpg'), quality=80); print('ok')
