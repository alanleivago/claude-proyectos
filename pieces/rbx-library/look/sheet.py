# python look/sheet.py -> look/c_turn.png (Late Fee turnaround), look/d_expr.png (hero / Nico / Late Fee x 5 faces),
# look/e_stamp.png (stamp -> book, 3 beats) and look/look_sheet.jpg (7x2 labelled panels)
import os
from PIL import Image, ImageDraw, ImageFont
d = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920
try:
    F = lambda s: ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', s)
    font, big = F(24), F(30)
except Exception:
    font = big = ImageFont.load_default()
op = lambda n: Image.open(os.path.join(d, n + '.png')).convert('RGB')
def bar(g, x, y, w, txt, f=font, h=34):
    g.rectangle([x, y, x + w, y + h], fill=(0, 0, 0)); g.text((x + 8, y + 5), txt, font=f, fill=(255, 255, 255))
# c: turnaround 2x2
ct = Image.new('RGB', (W, H), 'black'); g = ImageDraw.Draw(ct)
for i, (n, lab) in enumerate([('c1', 'creepy - front'), ('c2', 'creepy - side, stamps up'), ('c3', 'creepy - 3/4, reaching'), ('c4', 'friendly (Fridays) - front')]):
    im = op(n).resize((540, 960), Image.LANCZOS); x, y = (i % 2) * 540, (i // 2) * 960; ct.paste(im, (x, y)); bar(g, x, y + 960 - 34, 540, lab)
ct.save(os.path.join(d, 'c_turn.png'))
# d: expressions
EX = {'hero': ['calm', 'ohno', 'scream', 'smug', 'laugh'], 'nico': ['grin', 'laugh-talk', 'scream', 'sad', 'shock'], 'latefee': ['blank', 'tilt', 'frozen', 'hum', 'voices']}
ex = Image.new('RGB', (W, H), 'black'); g = ImageDraw.Draw(ex); tw, th = 360, 384
for ci, (n, moods) in enumerate(EX.items()):
    for ri, m in enumerate(moods):
        im = op('x_%s_%s' % (n, m)).crop((60, 470, 1020, 1494)).resize((tw, th), Image.LANCZOS)
        x, y = ci * tw, ri * th; ex.paste(im, (x, y)); bar(g, x, y + th - 32, tw, '%s  %s' % ('late fee' if n == 'latefee' else n, m), h=32)
ex.save(os.path.join(d, 'd_expr.png'))
# e: stamp -> book
es = Image.new('RGB', (W, H), 'black'); g = ImageDraw.Draw(es)
for i, (n, lab) in enumerate([('e1', '1  thunk: the stamp comes down'), ('e2', '2  POOF: pages + LATE ink'), ('e3', '3  a book with his face on it')]):
    im = op(n).crop((0, 330, 1080, 1610)).resize((1080, 640), Image.LANCZOS); es.paste(im, (0, i * 640)); bar(g, 0, i * 640 + 640 - 40, W, lab, big, 40)
es.save(os.path.join(d, 'e_stamp.png'))
P = [('a_cast', 'a  cast: dino hero, Nico (+PJs), mom, Mr. Dale'), ('b_lfcreep', 'b  THE LATE FEE (night library)'), ('c_turn', 'c  Late Fee turnaround + friendly'),
     ('d_expr', 'd  faces change all the time'), ('e_stamp', 'e  stamped LATE -> you become a book'), ('f_street', 'f  11:59: pyjama parents at the drop box'),
     ('g_stairs', 'g  thunk, thunk: a LATE on every step'), ('h_window', 'h  morning: Nico in the window'), ('i_hand', 'i  a grey hand stamps her palm'),
     ('j_chute', 'j  down the drop-box chute'), ('k_shelves', 'k  shelves forever, full of faces'), ('l_desk', 'l  front desk: 212 renewals'),
     ('m_story', 'm  Fridays: she does all the voices'), ('n_dale', 'n  Mr. Dale comes out smelling of soup')]
w, h = 540, 960
sheet = Image.new('RGB', (w * 7, h * 2), 'black'); g = ImageDraw.Draw(sheet)
for i, (n, label) in enumerate(P):
    im = op(n).resize((w, h), Image.LANCZOS)
    x, y = (i % 7) * w, (i // 7) * h; sheet.paste(im, (x, y)); bar(g, x, y, w, label, font, 38)
sheet.save(os.path.join(d, 'look_sheet.jpg'), quality=90); print('ok')
