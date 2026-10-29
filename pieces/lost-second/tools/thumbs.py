# lost-second thumbnails: the reveal creature (assets/man_close.png, the frame at ~2:20) on its native pixel grid, scaled by
# whole numbers (nearest neighbour), toned like the film's black-and-white pass; text in aansa, pixel-rendered, black stroke
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
P = '/Users/alanleiva/claude-proyectos/pieces/lost-second/'; OUT = P + 'thumbs/'
FONT = '/Users/alanleiva/claude-proyectos/fonts/aansa.ttf'; RED = (168, 0, 10)
a = np.array(Image.open(P + 'assets/man_close.png').convert('L')).astype(float)
tone = lambda v: np.clip(255 * 1.03 * (v / 255) ** 1.8, 0, 255)          # the film's B&W pass (gamma 1.8, amp 1.03)
base = tone(a).astype(np.uint8)                                            # 240x134 native
base = np.hstack([base, base[:, 192:240]])                                 # the white tiled wall continued to the right (room to centre him)
def frame(k, x0, y0, red_eye=False):
    rgb = np.stack([base] * 3, -1)
    if red_eye:   # the one white eye inside the dark face: native region of the head
        reg = rgb[26:35, 147:157]; m = reg[..., 0] > 200; reg[m] = RED
    im = Image.fromarray(rgb).resize((rgb.shape[1] * k, 134 * k), Image.NEAREST)
    return im.crop((x0, y0, x0 + 1280, y0 + 720))
def text(im, lines, x, y, px=6, size=22, align='left', red_line=None, gap=4, ink=(253, 253, 253), edge=(0, 0, 0)):
    """pixel text: rendered 1-bit at small size, bold pass, scaled px times (nearest); a black stroke 2 cells wide"""
    ft = ImageFont.truetype(FONT, size)
    for i, ln in enumerate(lines):
        w = int(ft.getlength(ln)) + len(ln) * 2 + 8; h = size + 8
        m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); cx = 3
        for ch in ln:   # bold pass per letter, then 2 cells of tracking so letters never touch
            d.text((cx, 2), ch, font=ft, fill=255); d.text((cx + 1, 2), ch, font=ft, fill=255); cx += ft.getlength(ch) + 2
        m = m.point(lambda v: 255 if v > 127 else 0)
        stroke = m.filter(ImageFilter.MaxFilter(5))                       # 2-cell black stroke
        M, St = m.resize((w * px, h * px), Image.NEAREST), stroke.resize((w * px, h * px), Image.NEAREST)
        yy = y + i * (size - gap) * px
        xx = x if align == 'left' else (x - w * px // 2 if align == 'center' else x - w * px)
        im.paste(edge, (xx, yy), St)
        im.paste(RED if red_line == i else ink, (xx, yy), M)
    return im
# (a) creature right, title left
A = frame(6, 0, 30); text(A, ['THE LOST', 'SECOND'], 40, 380, px=7); A.save(OUT + 'a_right_title.png')
# (b) creature centred, title under it
B = frame(7, 480, 0)   # b_center_title.png is now made by thumbs_red.py with the atlas letters (this font render broke the T's)
# (c) tight crop on the face and eye, 3-word hook
C = frame(14, 1700, 160); text(C, ['HE IS', 'TURNING'], 1240, 240, px=7, align='right', ink=(0, 0, 0), edge=(253, 253, 253)); C.save(OUT + 'c_face_hook.png')
# (d) no text, one red accent: the eye
D = frame(7, 480, 0, red_eye=True); D.save(OUT + 'd_red_eye.png')
# (e) the face crop with the red eye and a red last word
E = frame(14, 1700, 160, red_eye=True); text(E, ['ONE STEP', 'LEFT'], 1240, 330, px=6, align='right', red_line=1, ink=(0, 0, 0), edge=(253, 253, 253)); E.save(OUT + 'e_face_red.png')
names = ['a_right_title', 'b_center_title', 'c_face_hook', 'd_red_eye', 'e_face_red']
ims = [Image.open(OUT + n + '.png') for n in names]
sheet = Image.new('RGB', (5 * 650 + 10, 380 + 200 + 30), (40, 40, 40))
for i, im in enumerate(ims):
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (10 + i * 650, 10))
    sheet.paste(im.resize((320, 180), Image.LANCZOS), (10 + i * 650, 390))
sheet.save(OUT + 'sheet.png'); print('ok')
