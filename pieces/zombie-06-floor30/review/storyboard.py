# storyboard_v1.png (ep6 Floor 30): un panel por beat (frames reales del motor, review/sb/f_<t>.png, tiempos SCRATCH sin voz) +
# fila de objetos foto -> lowpoly (objects/compare/*_cmp.png). python storyboard.py
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, ".."); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(2.0, "1  0:00", "'Imagine you live on the thirtieth floor...' Fast crane up the night facade"),
     (5.2, "1b 0:04", "...ends at the window of 3012, Ava inside looks at camera ('Until tonight')"),
     (6.3, "2  0:06", "POV in the hallway at door 3012. HUD in (FINE)"),
     (7.8, "2b 0:07", "Phone up, upright and level: EMERGENCY ALERT / STAY INSIDE. LOCK YOUR DOORS. HUD CAUTION"),
     (11.5, "3  0:10", "'First problem: water.' Bathroom: spout fills the tub, wall tap fills the bucket. PUMPS = POWER"),
     (17.9, "3b 0:18", "'about forty gallons': oblique top view, = 40 GAL / +5 GAL"),
     (20.9, "4  0:19", "RE ITEM: BEANS x12, CRACKERS, BUCKET, TUB. RATION 2 -> 1 CAN/DAY, FOOD LASTS 6 -> 12 DAYS"),
     (23.6, "5  0:22", "From the window: the city goes dark block by block"),
     (25.9, "5b 0:25", "Apartment dark, FRIDGE: OFF, clock 7:05 PM -> 11:57 PM"),
     (28.4, "6  0:27", "Faucet: one drop, nothing. NO PRESSURE"),
     (31.0, "6b 0:29", "Diagram: the pump can't push water up 30 floors without power"),
     (35.6, "7  0:32", "Notebook: tub 40 gal / 1 gal/day = 40 DAYS (FEMA)"),
     (37.1, "7b 0:36", "Pan to the phone: 18 % blinking"),
     (39.3, "8  0:38", "She pushes the dresser against the door (boards nailed above). Camera orbits"),
     (42.2, "9  0:41", "Footsteps. She freezes (still, no tremble). HUD DANGER"),
     (44.6, "9b 0:44", "...they stop: whip to the barricaded door"),
     (47.2, "10 0:45", "Peephole (fisheye): the guy from 3011 comes out of the dark, stares at the peephole"),
     (50.3, "10b 0:49", "Knocks (only the door) + RE box: 'PLEASE... I JUST NEED WATER.'"),
     (51.8, "11 0:51", "'Oh, fudge' (ep1 take): scared eyes, normal mouth"),
     (56.8, "12 0:53", "RE menu 1 OPEN / 2 STAY QUIET, COMMENT 1 OR 2, MOST COMMENTS DECIDE PART 2."),
     (60.6, "end 0:58", "Bucket turning: NEXT: PART 2. / FOLLOW FOR MORE!")]
W, Hh, cols = 270, 480, 7; rows = (len(B) + cols - 1) // cols
OBJ = ["bathtub", "bucket", "fridge", "dresser", "notebook", "cans_stack", "phone", "plank"]; OH = 200
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 86) * rows + 50 + 40 + 3 * (OH + 30)), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA ep6: Floor 30  |  storyboard v1 (real engine, 1080x1920 -> 25%)  |  SCRATCH timing (no voice yet)  |  62.0 s", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 16; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((W, Hh)); x = 10 + (i % cols) * (W + 10); y = 50 + (i // cols) * (Hh + 86)
    sh.paste(im, (x, y)); d.text((x, y + Hh + 4), tag, font=F, fill=(255, 255, 255)); text(x, y + Hh + 24, txt, W)
y0 = 50 + rows * (Hh + 86); d.text((12, y0 + 8), "OBJECTS (photo cutout -> lowpoly): PHOTO | FRONT RENDER | 3/4 RENDER", font=F, fill=(255, 220, 80))
x, y = 10, y0 + 36
for n in OBJ:
    im = Image.open(os.path.join(P, "objects", "compare", f"{n}_cmp.png")).convert("RGB"); im = im.resize((round(im.width * OH / im.height), OH))
    if x + im.width > sh.width - 10: x, y = 10, y + OH + 30
    sh.paste(im, (x, y)); x += im.width + 12
sh.save(os.path.join(P, "storyboard_v1.png")); print(sh.size)
