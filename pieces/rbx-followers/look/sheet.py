# python look/sheet.py -> look/look_sheet.jpg (labelled panels, 4x2)
import os
from PIL import Image, ImageDraw, ImageFont
d = os.path.dirname(os.path.abspath(__file__))
try: font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 24)
except Exception: font = ImageFont.load_default()
P = [('a_cast', 'a  cast: date, pop star, hero, Dad, teacher'), ('b_street', 'b  front door: the whole street is full'), ('c_one', 'c  one follower: "1" over his head'), ('d_fridge', 'd  Dad\'s notes on the fridge'),
     ('e_subway', 'e  subway: 3 million got on behind me'), ('f_bridge', 'f  the bridge at dusk, 3,000,001'), ('g_dad', 'g  dawn: 0, Dad three steps back'), ('x_dad', 'x  Dad: hi-vis vest, ONE old shoe')]
w, h = 540, 960
sheet = Image.new('RGB', (w * 4, h * 2), 'black'); g = ImageDraw.Draw(sheet)
for i, (n, label) in enumerate(P):
    im = Image.open(os.path.join(d, n + '.png')).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = (i % 4) * w, (i // 4) * h; sheet.paste(im, (x, y)); g.rectangle([x, y, x + w, y + 38], fill=(0, 0, 0)); g.text((x + 10, y + 7), label, font=font, fill=(255, 255, 255))
sheet.save(os.path.join(d, 'look_sheet.jpg'), quality=88); print('ok')
