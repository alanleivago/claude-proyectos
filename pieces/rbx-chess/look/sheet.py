# python look/sheet.py -> look/look_sheet.jpg (3x2 grid of the six 1080x1920 panels, labelled)
import os
from PIL import Image, ImageDraw, ImageFont
d = os.path.dirname(os.path.abspath(__file__))
P = [('a_kingdom', 'a  the kingdom on the board'), ('b_family', 'b  pawn hero + knight dad'), ('c_citizens', 'c  queen, king, bishops, rook taxi, baker'),
     ('d_gamenight', 'd  game night: the Hand'), ('e_fog', 'e  row eight: the fog'), ('f_box', 'f  inside the Box')]
W, H = 540, 960
sheet = Image.new('RGB', (W * 3, H * 2), 'black'); g = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 24)
except Exception: font = ImageFont.load_default()
for i, (n, label) in enumerate(P):
    im = Image.open(os.path.join(d, n + '.jpg')).convert('RGB').resize((W, H), Image.LANCZOS)
    x, y = (i % 3) * W, (i // 3) * H; sheet.paste(im, (x, y))
    g.rectangle([x, y, x + W, y + 40], fill=(0, 0, 0)); g.text((x + 12, y + 8), label, font=font, fill=(255, 255, 255))
sheet.save(os.path.join(d, 'look_sheet.jpg'), quality=90); print('ok')
