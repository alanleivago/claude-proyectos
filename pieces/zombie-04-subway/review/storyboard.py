# storyboard_v1.png: un panel por beat (frames reales del motor, review/sbv/f_<t>.png) con su texto
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(1.2, "1  0:00", "You miss the last train... platform MERCY STREET, sign + leaving train"),
     (7.0, "2  0:05", "Phone: NO SERVICE, 3%, 11:42 -> board NEXT TRAIN 5:30 AM"),
     (23.0, "3  0:12", "Sheet in the booth -> RE FILE: rule 1, rule 2 torn 'don't-'"),
     (28.6, "4  0:26", "Ava smiles: staff prank (shrug -> wink)"),
     (33.0, "5a 0:31", "Clock 11:59 -> 12:00 on 'midnight'"),
     (36.5, "5b 0:35", "Lights go out row by row. HUD -> CAUTION"),
     (44.5, "6  0:39", "Silent train, two headlights; doors open on an empty car"),
     (50.0, "7a 0:47", "Footsteps -> silhouette with white eyes. HUD -> DANGER"),
     (52.5, "7b 0:51", "Breath on her neck"),
     (57.8, "8  0:54", "'Oh, fudge.' Doors start closing"),
     (62.8, "9  0:59", "RE menu 1 GET ON / 2 STAY + COMMENT 1 OR 2"),
     (66.5, "9b 1:04", "End card: NEXT: PART 2. / FOLLOW AVA RESTFIELD!")]
W, Hh, cols = 270, 480, 6; rows = (len(B) + cols - 1) // cols
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 70) * rows + 50), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA: The Last Train - Part 1  |  storyboard v1 (motor real, 1080x1920 -> 25%)  |  ~68 s", font=F, fill=(255, 220, 80))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sbv/f_{t:.2f}.png").convert("RGB").resize((W, Hh)); x = 10 + (i % cols) * (W + 10); y = 50 + (i // cols) * (Hh + 70)
    sh.paste(im, (x, y)); d.text((x, y + Hh + 4), tag, font=F, fill=(255, 255, 255))
    words, line, ly = txt.split(), "", y + Hh + 24
    for w in words:
        if d.textlength(line + " " + w, font=f2) > W: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 16; line = ""
        line += " " + w
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
sh.save(os.path.join(H, "..", "storyboard_v1.png")); print(sh.size)
