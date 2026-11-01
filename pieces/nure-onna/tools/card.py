# card.py: the creature card's kanji 濡女 in Nosutaru-dotMPlusH-10 (10-px dot font), 1-bit white, one font pixel per cell
import numpy as np
from PIL import Image, ImageFont, ImageDraw
ROOT = '/Users/alanleiva/claude-proyectos/'
f = ImageFont.truetype(ROOT + 'fonts/Nosutaru-dotMPlusH-10-Regular.ttf', 20)   # the user's 'bold20': 20 px + a bold pass
g = Image.new('L', (60, 28)); d = ImageDraw.Draw(g)
for dx in (0, 1): d.text((2 + dx, 2), '濡女', font=f, fill=255)
a = (np.asarray(g.crop(g.getbbox())) > 127).astype(np.uint8) * 255
Image.fromarray(np.dstack([a, a, a, a]), 'RGBA').save(ROOT + 'pieces/nure-onna/assets/card_kanji.png')
print('kanji', a.shape[::-1])
