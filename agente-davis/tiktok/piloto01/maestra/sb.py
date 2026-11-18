"""Storyboard del video de la maestra: 3 fotogramas 1080x1920 con el layout medido de Agente Reels_67."""
from PIL import Image, ImageDraw, ImageFont, ImageOps
F = 'D:/Alan/Fiverr Upwork trabajo fotos y videos/Fuentes/Montserrat/'
def font(sz, italic=False, w='ExtraBold'):
    f = ImageFont.truetype(F + ('Montserrat-Italic-VariableFont_wght.ttf' if italic else 'Montserrat-VariableFont_wght.ttf'), sz)
    f.set_variation_by_name(('ExtraBold Italic' if italic else w).encode() if False else (w + (' Italic' if italic else '')))
    return f
def cover(im, w, h, ox=0.5, oy=0.5):
    return ImageOps.fit(im.convert('RGB'), (w, h), centering=(ox, oy))
def title(d, y, lines):  # caja negra redondeada, texto blanco Montserrat
    f = font(50, w='Bold'); lh = 60
    tw = max(d.textlength(l, font=f) for l in lines)
    x0, x1 = 540 - tw / 2 - 30, 540 + tw / 2 + 30
    d.rounded_rectangle([x0, y, x1, y + lh * len(lines) + 24], 22, fill='black')
    for i, l in enumerate(lines):
        d.text((540, y + 12 + lh * i + lh / 2), l, font=f, fill='white', anchor='mm')
def sub(d, y, text):  # amarillo, cursiva, contorno negro
    f = font(78, italic=True, w='Black')
    for i, l in enumerate(text.split('\n')):
        d.text((540, y + i * 86), l, font=f, fill='#f5f523', anchor='mm', stroke_width=7, stroke_fill='black')
TIT = ['¿ICE llegó a la escuela?', '¡MIRA lo que hizo la maestra!']
out = []
# 1. reacción: clip arriba 1310, Patrick abajo 608
im = Image.new('RGB', (1080, 1920)); im.paste(cover(Image.open('sb/reel_1.5.png'), 1080, 1312), (0, 0))
im.paste(cover(Image.open('sb/reac.png'), 1080, 608), (0, 1312)); d = ImageDraw.Draw(im)
title(d, 1150, TIT); sub(d, 1010, '¡Fuera de mi escuela!'); out.append(im)
# 2. opinión: clip arriba 1080 (b-roll gris), Patrick abajo 840
im = Image.new('RGB', (1080, 1920)); im.paste(ImageOps.grayscale(cover(Image.open('sb/reel_8.png'), 1080, 1080)).convert('RGB'), (0, 0))
im.paste(cover(Image.open('sb/op.png'), 1080, 840), (0, 1080)); d = ImageDraw.Draw(im)
title(d, 915, TIT); sub(d, 800, 'guarda silencio'); out.append(im)
# 3. CTA: hojas de la lista sobre Patrick + flecha roja hacia abajo
im = Image.new('RGB', (1080, 1920)); im.paste(ImageOps.grayscale(cover(Image.open('sb/reel_4.5.png'), 1080, 1080)).convert('RGB'), (0, 0))
im.paste(cover(Image.open('sb/cta.png'), 1080, 840), (0, 1080))
p = Image.open('f:/Claude Proyectos/agente-davis/productos/kit-familiar/portada-checklist.png').convert('RGB').resize((620, 349))
im.paste(p, (330, 1400)); d = ImageDraw.Draw(im)
d.polygon([(150, 1430), (230, 1430), (230, 1640), (290, 1640), (190, 1760), (90, 1640), (150, 1640)], fill='#e0261f')
title(d, 915, TIT); sub(d, 800, 'Escríbeme LISTA'); out.append(im)
sheet = Image.new('RGB', (1080 * 3 + 80, 1920), 'white')
for i, f in enumerate(out):
    f.save(f'sb/frame{i+1}.png'); sheet.paste(f, (i * 1120, 0))
sheet.resize((sheet.width // 3, 640)).save('sb/storyboard.jpg', quality=90)
