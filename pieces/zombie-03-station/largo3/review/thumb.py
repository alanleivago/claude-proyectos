# Miniatura 1280x720 del LARGO 3 (pantalla dividida como la Parte 2, fotogramas REALES del motor con camara de depuracion ?cam=):
# izquierda Ava grande de 3/4 apuntando con la pistola negra arriba de la escalera; derecha el gigante en contrapicado, amenazante.
# python thumb.py <ava.png> <gigante.png>
import sys
from PIL import Image, ImageDraw, ImageFont
A, G = Image.open(sys.argv[1]).convert("RGB"), Image.open(sys.argv[2]).convert("RGB")
def half(im, cx):
    w, h = im.size; x0 = int(max(0, min(w - 960, cx * w - 480))); return im.crop((x0, 0, x0 + 960, 1080)).resize((640, 720), Image.NEAREST)
out = Image.new("RGB", (1280, 720)); out.paste(half(A, float(sys.argv[3]) if len(sys.argv) > 3 else 0.5), (0, 0)); out.paste(half(G, float(sys.argv[4]) if len(sys.argv) > 4 else 0.5), (640, 0))
d = ImageDraw.Draw(out); d.rectangle((636, 0, 643, 720), fill=(0, 0, 0))
FONT = r"F:/Claude Proyectos/pieces/zombie-03-station/largo3/engine/fonts/PixelifySans.ttf"
def txt(s, x, y, col, size):
    f = ImageFont.truetype(FONT, size)
    for dx in range(-6, 7, 2):
        for dy in range(-6, 9, 2): d.text((x + dx, y + dy), s, font=f, fill=(0, 0, 0))
    d.text((x, y), s, font=f, fill=col)
txt("RUN", 60, 560, (255, 255, 255), 110); txt("OR FIGHT?", 690, 560, (255, 70, 50), 110)
out.save(r"F:/Claude Proyectos/pieces/zombie-03-station/largo3/miniatura_1280x720.png"); print("ok")
