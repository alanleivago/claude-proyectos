from PIL import Image, ImageDraw, ImageFont
D = "/Users/alanleiva/claude-proyectos/pieces/lps-onoda/tex/people/test/"
ims = [Image.open(D + f"turn_{v}.png").convert("RGB") for v in ("front", "q34", "back")]
W, Hh = ims[0].size
sh = Image.new("RGB", (W, Hh * 3 + 40), (40, 40, 40)); dr = ImageDraw.Draw(sh)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
for i, n in enumerate(["akatsu", "shimada", "kozuka", "suzuki", "woman", "sailor", "oldman", "worker"]):
    dr.text((W / 2 + (i - 3.5) * 0.75 / 6.2 * W - 50, 6), n, fill=(255, 255, 255), font=f)
for k, im in enumerate(ims): sh.paste(im, (0, 40 + k * Hh))
sh.save(D + "contact_sheet.png")
