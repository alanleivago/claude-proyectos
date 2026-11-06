"""venv: renders/thumb_raw.png -> PS1 dither -> big pixelated title text -> renders/thumbnail.png"""
from PIL import Image, ImageDraw, ImageFont
from photoprop import ps1_post
im = ps1_post(Image.open("renders/thumb_raw.png").convert("RGB"), scale=4)
W, H = im.size
txt = Image.new("RGBA", (W // 3, H // 3), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
f = ImageFont.truetype("fonts/LuckiestGuy-Regular.ttf", 58)
for i, (line, col) in enumerate((("60 NOBLES", (255, 226, 26)), ("FELL IN", (255, 70, 40)))):
    d.text((W // 6, 40 + i * 68), line, font=f, fill=col, anchor="mt", stroke_width=6, stroke_fill=(0, 0, 0))
im.paste(txt.resize((W, H), Image.NEAREST), (0, 0), txt.resize((W, H), Image.NEAREST))
im.save("renders/thumbnail.png"); im.resize((360, 640)).save("test/thumb_final_small.png")
