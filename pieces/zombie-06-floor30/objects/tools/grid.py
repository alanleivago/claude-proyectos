# python grid.py in.jpg out.jpg [W]  -> imagen reescalada a ancho W con rejilla cada 50 px (coords en px de la ORIGINAL)
import sys; from PIL import Image, ImageDraw
im = Image.open(sys.argv[1]).convert("RGB"); W = int(sys.argv[3]) if len(sys.argv) > 3 else 900; k = W / im.width
im = im.resize((W, round(im.height * k))); d = ImageDraw.Draw(im); step = 50
for x in range(0, round(W / k), step): X = x * k; d.line([(X, 0), (X, im.height)], fill=(255, 0, 255) if x % 100 == 0 else (0, 255, 255), width=1); d.text((X + 2, 2), str(x), fill=(255, 255, 0))
for y in range(0, round(im.height / k), step): Y = y * k; d.line([(0, Y), (W, Y)], fill=(255, 0, 255) if y % 100 == 0 else (0, 255, 255), width=1); d.text((2, Y + 2), str(y), fill=(255, 255, 0))
im.save(sys.argv[2])
