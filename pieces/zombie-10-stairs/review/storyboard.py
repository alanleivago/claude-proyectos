# storyboard_v1.png (ep10 The Stairs): un panel por beat (frames reales del motor con la voz real, review/sb/f_<t>.png) +
# fila de objetos nuevos foto Flow -> lowpoly (recorte PNG | en el motor). python storyboard.py
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, ".."); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(1.6, "1  0:00", "'In a zombie outbreak, your safe room won't hold forever...' Crane over the cutaway house (ep1/ep7), zombies pounding the front door '13'. Ava in the living by 1 s. Hook horror music 0-10 s"),
     (3.9, "1b 0:04", "'...so you go up.' Crane rises to the new 2F: staircase + landing, label 2F"),
     (7.6, "2  0:05", "'Most people stay downstairs, with two doors and five windows...' 2F hidden, 2 doors + 5 windows flash red one by one (DOORS x2, WINDOWS x5). HUD CAUTION"),
     (9.9, "3  0:09", "'Then the front door gives, and they pour in...' The padded door swings open, zombies walk in. HUD DANGER"),
     (12.0, "3b 0:11", "'...and you're too late for the stairs.' Ava runs, zombies already at the stair door, facing her"),
     (13.5, "3c 0:13", "YOU DIED (red from frame 1, translucent black, drips, CONTINUE?)"),
     (16.5, "4  0:15", "'In this world, zombies are terrible at stairs.' (show's rule, box THIS WORLD'S RULE) A zombie trips on the 2nd step (dead1, once)"),
     (19.6, "4b 0:17", "'So you go up. The staircase becomes your wall, only one can climb at a time.' RE MAP 2F: stairs red = YOUR WALL, 1 AT A TIME"),
     (23.0, "5  0:21", "'Tip the sofa, stack the dresser on it' The blue ep1 sofa tips against the bottom steps (push_heavy), the dresser drops on top"),
     (24.9, "5b 0:24", "'...and screw them together' Ava on the steps above it with the ep2 drill, held correctly"),
     (26.0, "5c 0:25", "3-INCH SCREWS (ep1 screw) through a steel bracket"),
     (27.2, "5d 0:26", "'You already know how.' Wink at camera, safe side of the barricade. HUD FINE"),
     (30.1, "6  0:28", "'Then the top. You screw a door across the stairs on its edge' DOOR ON ITS EDGE + battens, Ava drills"),
     (31.8, "6b 0:31", "'...and push a heavy shelf against it.' Bookshelf (Flow photo -> lowpoly), push_heavy"),
     (34.0, "7  0:32", "'But don't trap yourself. Your exit is the upstairs window' YOUR EXIT, she opens it and throws the ladder (throw_out_window, once)"),
     (35.6, "7b 0:35", "'...with an escape ladder' Outside at night: the rope ladder unrolls down the wall"),
     (38.3, "7c 0:36", "RE ITEM / EXAMINE: ESCAPE LADDER. 'Fire safety says every room needs two ways out.' -> 2 WAYS OUT (USFA)"),
     (41.4, "8  0:39", "'You carry up the water, the backpack, the radio, and the First Aid Spray' Each item pops on its word (ep1 spray)"),
     (43.4, "8b 0:42", "'Day four, you save your game.' Typewriter: DAY 4 / SECOND FLOOR / SECURED. PROGRESS SAVED"),
     (45.4, "9  0:44", "'Then someone knocks downstairs.' Polite knuckle knocks on the front door, light + feet shadow under it. HUD CAUTION"),
     (46.8, "9b 0:46", "'Zombies don't knock.' Ava at the top of the stairs, scared face"),
     (49.0, "9c 0:48", "Older male voice (new VoiceStudio design): 'Hello?... Please,... I'm not bitten!' The handle turns. HUD DANGER"),
     (50.5, "9d 0:49", "Over Ava's shoulder: the blocked staircase below"),
     (59.5, "10 0:52", "Living RE menu: SHOULD I OPEN THE DOOR? 1. LET THEM IN / 2. STAY QUIET, COMMENT 1 OR 2, FOLLOW FOR MORE!. Ava breathing, no subtitles. End 62.0 s")]
W, Hh, cols = 270, 480, 8; rows = (len(B) + cols - 1) // cols
OBJ = [("shelf", "obj/f_31.00.png"), ("backpack", "obj/f_40.60.png")]; OH = 260
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 120) * rows + 50 + 40 + OH + 40), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA ep10: The Stairs  |  storyboard v1 (real engine frames, REAL voice timing)  |  62.0 s", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 16; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((W, Hh)); x = 10 + (i % cols) * (W + 10); y = 50 + (i // cols) * (Hh + 120)
    sh.paste(im, (x, y)); d.text((x, y + Hh + 4), tag, font=F, fill=(255, 255, 255)); text(x, y + Hh + 24, txt, W)
y0 = 50 + rows * (Hh + 120); d.text((12, y0 + 8), "NEW OBJECTS (Flow photo, isolated PNG cutout -> PS1 texture 128 px / 32 colours -> lowpoly box in the engine): CUTOUT | IN ENGINE.  Rope ladder: code.  Dresser, sofa, drill, screw, spray, radio, water: earlier episodes", font=F, fill=(255, 220, 80))
x = 10
for n, fr in OBJ:
    c = Image.open(f"{P}/objects/photos/_cut/{n}.png").convert("RGBA"); c.thumbnail((OH, OH)); bg = Image.new("RGB", c.size, (60, 60, 66)); bg.paste(c, (0, 0), c); sh.paste(bg, (x, y0 + 36)); x += bg.size[0] + 10
    f = Image.open(f"{H}/{fr}").convert("RGB"); f = f.resize((int(OH * f.size[0] / f.size[1]), OH)); sh.paste(f, (x, y0 + 36)); x += f.size[0] + 30
sh.save(f"{P}/storyboard_v1.png"); print(sh.size)
