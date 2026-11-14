# storyboard_v1.png (ep10 The Stairs): un panel por beat (frames reales del motor con la voz real, review/sb/f_<t>.png) +
# fila de objetos nuevos foto Flow -> lowpoly (recorte PNG | en el motor). python storyboard.py
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, ".."); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(1.8, "1  0:00", "'It's 2 AM, and you're alone at a gas station, filling up...' Elevated fixed camera: canopy lights, pump, Ava's car; her left hand holds the nozzle in the filler (two-bone IK, no clip on top); hose to the pump. 2:00 AM. Hook horror music"),
     (5.0, "1b 0:03", "'...the lights flicker, and the pump stops at twelve forty.' HUD in. Pump display counting, freezes at $12.40 as the canopy lights flicker and die"),
     (8.0, "2  0:06", "'Your tank's only a quarter full, and the hose is dead...' Ava's face on the dead nozzle, TANK 1/4 gauge, HOSE: DEAD"),
     (11.0, "2b 0:09", "'Gas pumps run on electricity, so no power means no gas.' Diagram: power line > pump motor > tank; cable cut X; NO POWER = NO GAS"),
     (13.0, "3  0:12", "'So you head into the shop...' Ava walks in with the flashlight on; the glass door swings open as she passes (no clipping)"),
     (19.6, "3b 0:14", "'Water before snacks, then a flashlight and some bandages... weeks without food, about three days without water.' RE ITEMS: rotating water / flashlight / bandages pop on their words, SNACKS crossed out, NO WATER: ~3 DAYS"),
     (27.6, "4  0:21", "'Don't hide by the windows... The walk-in cooler has one door, thick walls, no windows. That's your safe room.' Top-down cutaway (roof off): glass front tinted red GLASS: BREAKS / THEY SEE YOU; cooler tinted green 1 DOOR / THICK WALLS / NO WINDOWS; SAFE ROOM stamp"),
     (31.5, "5  0:28", "'Outside, shapes cross in front of a car's headlights... seen from the road.' From behind the counter: zombie silhouettes cross the haze of the abandoned car's headlights (car door left open)"),
     (34.8, "5b 0:34", "'Flashlight off. Stay low, and don't move.' Ava sits with her back to the counter, face visible; the flashlight goes off on 'off'. LIGHT OFF / STAY LOW / DON'T MOVE"),
     (38.6, "6  0:36", "'Someone knocks from inside the locked bathroom.' Ava turns to the RESTROOM door behind her; only the door shakes on each knock. LOCKED. HUD DANGER"),
     (43.5, "7  0:39", "STRANGER (b0469a54, muffled through the door): 'Please... let me in. I'm not bitten... I cut my hand on the glass.' Close on the door and knob, the leaf trembles"),
     (46.8, "8  0:44", "'A hand slides out under the door, wrapped in a bandage.' Floor-level shot: a hand built in code (palm, fingers, bandage with a stain) slides out of the gap. BANDAGE"),
     (48.8, "9  0:47", "'A drop of blood rolls out after it...' A dark blood pool grows next to the hand"),
     (52.9, "9b 0:49", "'Oh, fudge.' (ep1 take) '...Bites bleed, but so do cuts.' Ava with the key in her left hand, scared/shocked face. KEY tag, BITE? OR A CUT?"),
     (60.5, "10 0:53", "Live RE menu (no subtitles): WOULD YOU UNLOCK IT? 1. UNLOCK IT / 2. LEAVE IT LOCKED / COMMENT 1 OR 2 / PART 1 - FOLLOW FOR PART 2! Ava full body, breathing, looking at the bathroom door (hand and blood at its base); typewriter easter egg in the foreground. Voice ends 59.0 s, end 62.0 s")]
W, Hh, cols = 270, 480, 6; rows = (len(B) + cols - 1) // cols
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 140) * rows + 60), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA ep13: Gas Station, Part 1  |  storyboard v1 (real engine frames, REAL voice timing)  |  62.0 s  |  in code: canopy + pumps + price display, 2 cars, shop, walk-in cooler, restroom door, bandaged hand, RE items, cutaway, spray + typewriter easter eggs", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 16; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((W, Hh)); x = 10 + (i % cols) * (W + 10); y = 50 + (i // cols) * (Hh + 140)
    sh.paste(im, (x, y)); d.text((x, y + Hh + 4), tag, font=F, fill=(255, 255, 255)); text(x, y + Hh + 24, txt, W)
sh.save(f"{P}/storyboard_v1.png"); print(sh.size)
