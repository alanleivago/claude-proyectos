# storyboard_v1.png (ep7 The Safe Room): un panel por beat (frames reales del motor, review/sb/f_<t>.png, tiempos SCRATCH sin voz) +
# fila de objetos foto -> lowpoly (objects/compare/*_cmp.png). python storyboard.py
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, ".."); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(0.6, "1  0:00", "'You can't defend the whole house...' Fast crane over the cutaway house (RE map): room labels LIVING / KITCHEN / BATH / CLOSET. Hook music"),
     (2.6, "1b 0:02", "'...so you pick one room.' Ava in the hall, looks up at camera (on screen by 2 s)"),
     (7.6, "2  0:04", "'So you pick the living room. It's the biggest.' HUD -> CAUTION. 3 windows + 2 doors flash red one by one (WINDOWS x3, DOORS x2)"),
     (9.9, "3  0:08", "'Every window is a door for them.' The ep2 boarded window: only the window shakes on each zombie hit. HUD DANGER"),
     (11.3, "3b 0:10", "YOU DIED (red freeze, translucent black, drips, CONTINUE?)"),
     (14.0, "4  0:12", "'So you go small. One door, no windows...' MAP: living crossed out, 1 DOOR, 0 WINDOWS, arrows to the middle"),
     (16.3, "4b 0:15", "'...like a bathroom or a walk-in closet.' BATH lights green = SAFE ROOM, closet dashed"),
     (19.3, "4c 0:17", "'Even Ready.gov says it...' Inside the bathroom: READY.GOV / INTERIOR ROOM / FEW OR NO WINDOWS. The linen closet is behind her"),
     (22.5, "5  0:21", "'Then you fix its door like last time...' Ava with the drill at the bathroom door (from inside)"),
     (25.4, "5b 0:23", "3-inch screw into the strike plate, THE STUD lights up behind the jamb"),
     (26.6, "5c 0:25", "'...and wedge a bar under the handle.' Ava kneels, bar from handle to floor"),
     (27.6, "5d 0:27", "'You already know how.' Wink at camera. HUD FINE"),
     (31.0, "6  0:28", "RE ITEM screen: each item pops into its slot and drops into the open chest on its word"),
     (34.6, "6b 0:33", "Lid closes on 'chest' (ITEM BOX). 'Pretty much FEMA's own list': READY.GOV KIT: OK"),
     (38.0, "7  0:36", "Packing the chest she cuts her hand on a nail in a barricade board: red flash, blood drops, HUD DANGER"),
     (42.6, "7b 0:40", "'So you spray it, put the bandage on...' antiseptic spray (original design) + bandage wrap, kit open"),
     (45.95, "7c 0:43", "EXAMINE: FIRST AID SPRAY turning, 15:00, 'press hard, a full 15 minutes, no peeking'. Heal sound -> HUD FINE"),
     (47.9, "8  0:46", "'Day three, you save your game.' Green save typewriter on the chest: DAY 3 / SAFE ROOM / SECURED. PROGRESS SAVED"),
     (50.6, "8b 0:48", "'Congratulations... you have a safe room.' Ava to camera, wink + cheer, closet door behind"),
     (53.2, "9  0:52", "Knocks from INSIDE the linen closet in the safe room: only the closet door + handle shake. HUD CAUTION -> DANGER"),
     (54.6, "9b 0:54", "'Oh, fudge.' (ep1 take) scared eyes, normal open mouth, never happy"),
     (58.5, "10 0:55", "'Stairs are next week.' NEXT: / THE STAIRS. typed, stairs turning, FOLLOW FOR MORE! (62.0 s)")]
W, Hh, cols = 270, 480, 8; rows = (len(B) + cols - 1) // cols
OBJ = ["chest", "kit", "spray", "bandage", "water", "flashlight", "battery", "charger"]; OH = 200
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 86) * rows + 50 + 40 + 3 * (OH + 30)), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA ep7: The Safe Room  |  storyboard v1 (real engine frames, REAL voice timing)  |  62.0 s", font=F, fill=(255, 220, 80))
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
