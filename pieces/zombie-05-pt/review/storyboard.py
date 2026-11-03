# storyboard_v1.png (ep5 P.T.): un panel por beat (frames reales del motor, review/sb/f_<t>.png) + Lisa antes/despues +
# nuestro pasillo junto a una captura real de P.T. python storyboard.py
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, ".."); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
REF = os.path.join(P, "..", "..", "fuentes", "zombie-nicho", "pt_refs", "hall_norm.png")
B = [(2.8, "1  0:00", "'Did you know that in P.T.…' Continuous push down the L hallway, Ava ahead"),
     (6.6, "2  0:05", "RE FILE: typewriter 2014 > 2019, '5 years. Nobody saw her.'"),
     (13.4, "3  0:07", "Loop: through the end door -> back at the entrance (cuts in the door's black / her back). Radio on, then red + bathroom ajar"),
     (17.8, "4  0:14", "'turn around': whip-pan with her 180°: the hallway is empty. HUD CAUTION"),
     (21.2, "5  0:20", "CRT 'FREE CAM' -> the camera lets go of Ava and floats on its own (green FREE CAM HUD)"),
     (28.8, "6  0:25", "Orbit from her face to 3/4 rear: Lisa glued to her back, step by step, out of the dark. DANGER"),
     (31.0, "7  0:31", "Slow-mo side view through the bathroom door: she turns -> Lisa fades out; faces front -> back from the dark. x2"),
     (45.3, "8  0:38", "The trick: selfie camera. Phone UI; Lisa's face next to hers"),
     (47.8, "9  0:46", "Lisa leans onto her neck, cold breath (vapour)"),
     (50.0, "9b 0:49", "'Oh, fudge' >.< (ep1 take), Lisa at her shoulder"),
     (54.2, "10 0:51", "'It was real': crane up, ceilings gone: 4 L hallways chained into one endless loop"),
     (56.5, "11 0:54", "'…never looks back': Ava walks on, Lisa behind her"),
     (60.5, "end 0:58", "Radio turning + DON'T LOOK BACK. / FOLLOW FOR MORE!")]
W, Hh, cols = 270, 480, 7; rows = (len(B) + cols - 1) // cols
EX = 540   # fila extra: Lisa antes/despues + set vs P.T.
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 86) * rows + 50 + EX), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA ep5: the ghost behind you (P.T.)  |  storyboard v1 (real engine, 1080x1920 -> 25%)  |  62.0 s", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 16; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((W, Hh)); x = 10 + (i % cols) * (W + 10); y = 50 + (i // cols) * (Hh + 86)
    sh.paste(im, (x, y)); d.text((x, y + Hh + 4), tag, font=F, fill=(255, 255, 255)); text(x, y + Hh + 24, txt, W)
y0 = 50 + rows * (Hh + 86)
# Lisa antes (Sketchfab, 18 736 tris, 2048 px) / despues (10 873 tris, texturas 128 px 32 colores nearest, brazos abajo, esqueleto)
for k, (lab, path) in enumerate([("LISA BEFORE: Sketchfab, T-pose, 18.7k tris", "lisa/before/sheet.png"), ("AFTER: arms down+rig, 10.9k tris, 128px/32 col", "lisa/after/sheet.png")]):
    im = Image.open(os.path.join(P, path)).convert("RGB").crop((0, 0, 1200, 700)).resize((600, 350)); x = 10 + k * 620
    sh.paste(im, (x, y0 + 24)); d.text((x, y0 + 4), lab, font=F, fill=(255, 220, 80))
# set vs P.T.: captura real (recorte vertical del centro) junto a nuestro frame 0:00
ref = Image.open(REF).convert("RGB"); rw = int(ref.height * 9 / 16); ref = ref.crop(((ref.width - rw) // 2, 0, (ref.width + rw) // 2, ref.height)).resize((W, Hh))
ours = Image.open(f"{H}/sb/f_2.80.png").convert("RGB").resize((W, Hh))
x = 10 + 2 * 620; sh.paste(ref, (x, y0 + 24)); sh.paste(ours, (x + W + 10, y0 + 24))
d.text((x, y0 + 4), "P.T. (real screenshot)  vs  our hallway", font=F, fill=(255, 220, 80))
sh.save(os.path.join(P, "storyboard_v1.png")); print(sh.size)
