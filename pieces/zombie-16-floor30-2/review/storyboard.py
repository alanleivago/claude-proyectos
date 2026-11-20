# storyboard_v1.png (ep16 Stuck On Floor 30, Part 2): un panel por plano (frames reales del motor con la voz real, review/sb/f_<t>.png)
# + fila de objetos nuevos (review/props/p_<clave>.png, motor con ?prop=<clave>&clean=1: sin HUD ni subtitulos). Tiempos: engine/cues.json.
# python storyboard.py --times  -> tiempos para: node engine/stills.mjs review/sb <tiempos>
# python storyboard.py --props  -> lineas "clave tiempo" para los primeros planos de objetos
# python storyboard.py          -> arma ../storyboard_v1.png
import os, sys, json; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, "..")
CUE = json.load(open(f"{P}/engine/cues.json")); T, W = CUE["T"], CUE["W"]
at = lambda k, off: round((W[k] if k in W else T[k]) + off, 2)
B = [  # (tiempo, beat/plano, texto)
 (at("01_crane", 0.4), "1 01 crane", "'Thirty floors up,' (user note 1: no street walk) The ep6 crane starts low on the MERCY TOWER facade and rises past the balconies"),
 (at("01_crane", 1.9), "1 01 crane", "'...the stairs are the only way out...' Arrives at the 3012 window: Ava inside"),
 (at("tonight", 0.3), "1 01b", "'...and tonight,' Inside 3012 over Ava's shoulder at the window, the dark city and fog 30 floors down. HUD in at this cut (FLOOR 30)"),
 (at("01c_inlobby", 1.0), "1 01c", "'...something big just walked into the building.' Inside the lobby: the hunter's slow, menacing walk (head low, shoulders rolling, fists flexing) to the STAIRS door; he pushes it open. STAIRS"),
 (at("n3012", 0.3), "2 02", "'Last time, someone knocked on 3012.' 1 OPEN (red) pinned top. The barricaded door from inside: three knocks, only the leaf and chain move. 3012"),
 (at("open2a", 0.2), "2 02a", "'Some of you said open it.' Front: Ava by the barricaded door hesitates, looks at camera"),
 (at("dresser", 0.2), "2 02b", "'So you move the dresser' Ava pushes the dresser sideways from its left end, hands on the edge, clearing the door"),
 (at("02c_open", 1.2), "2 02c", "'...and open the door...' She turns the lock and pulls; the 3011 neighbor in the hall (canvas cap with brim, eyes in shadow, charcoal hoodie, jeans). RE dialog box 3011: THANK YOU... I JUST NEED WATER. (no voice)"),
 (at("bitten", 0.2), "2 02d", "'...and his arm is bitten.' His arm comes into the light: soaked bandage, bite (real blood texture). His skin turns pale. BITE. HUD DANGER"),
 (at("02e_lunge", 0.4), "2 02e", "He lunges at Ava (Zombie_Attack), eyes white"),
 (at("03_fudge", 0.7), "2 03", "'Oh, fudge.' (ep1 take) Ava to camera, scared; the neighbor right behind her shoulder"),
 (at("03c_died", 1.0), "2 03c", "YOU DIED (RE style, red from frame 1, translucent black, drips, CONTINUE?) ~2 s"),
 (at("04_rewind", 0.8), "3 04", "'Let's rewind.' Glitch over YOU DIED, then the OPEN branch plays backwards fast with VHS (REW, tracking, counter) ~1.2 s"),
 (at("quiet", 0.3), "4 05", "'Most of you said stay quiet. So you wait...' 2 STAY QUIET (white) pinned. Ava on the floor against the sofa, looks at camera; dresser against the door behind her. HUD FINE"),
 (at("slides", 0.3), "4 05b", "'...and a note slides under the door.' Floor-level: hall light in the gap, a shadow of feet, the folded note slides in beside the dresser"),
 (at("up5", 0.2), "4 05c", "'The stairs. It's coming up.' RE FILE (UNDER THE DOOR): the handwritten note, word by word with the voice, COMING UP in red, underlined"),
 (at("percent", 0.2), "5 06", "'Your phone's at eighteen percent.' POV, phone held level: 18 % in red, low battery"),
 (at("hours", 0.3), "5 06a", "'Airplane mode alone can stretch that by hours.' Closer on the level phone: Airplane Mode toggles ON on 'airplane' (plane icon), + HOURS in green"),
 (at("06b_save", 1.3), "5 06b", "(...) 1.8 s: the green typewriter on the counter types DAY 3 / FLOOR 30 - 3012 -> PROGRESS SAVED, INK RIBBON x1"),
 (at("stairwell7", 0.2) if "stairwell7" in W else at("07_shaft", 0.9), "6 07", "'Then footsteps in the stairwell,' Looking down the stairwell shaft from the floor 30 landing: far below the hunter climbs (green light); pale sound rings rise with each step. FLOOR 27. HUD DANGER"),
 (at("07b_feet", 0.45), "6 07b", "'...heavy and bare.' Floor-level on a landing: his huge bare feet cross, leaving wet footprints (continuity: soaked from the forest)"),
 (at("floor7", 0.0), "6 07c", "'In a stairwell, sound carries up floor after floor.' Inside the shaft looking up: the rings rise past the painted floor numbers, F28 -> F30. SOUND"),
 (at("peephole", 0.2), "7 08", "'Through the peephole...' Ava leans over the dresser to the peephole (back 3/4); the chain on the door"),
 (at("floor8", 0.2), "7 08b", "'...the hunter reaches your floor.' Fisheye: out of the dark end of the hall (green light first) he walks to 3012, turns, ducks to the peephole, teeth lit by the hall lamp"),
 (at("08c_pound", 0.6), "7 08c", "First hit on 3012 from inside: only the leaf and the chain jump, the dresser slides; green light under the door gap. Ava still"),
 (at("09_choice", 1.1), "8 09", "Decision (RE3 grammar, ep15): hard cut -> white flash -> frozen NEGATIVE, no text 1.2 s (hunter pounding, slow motion)"),
 (at("09_choice", 3.0), "8 09", "'Hide in the tub... or climb down to the balcony below?' NEGATIVE with the two options in dark Courier (1.6 s)"),
 (at("09_choice", 5.0), "8 09", "Color back, same framing: WHAT DO YOU DO? menu, blue box on the option the voice names; labels 1 TUB / 2 BALCONY. 'Comment one or two.'"),
 (at("09_choice", 6.6), "8 09", "Live angle 2: the full tub (option 1)"),
 (at("09_choice", 8.2), "8 09", "Live angle 3: outside the window, the balcony below 3012 (option 2). FOLLOW FOR MORE!"),
 (at("09_choice", 9.8), "8 09", "Live angle 4: Ava full face, scared, the pounding door behind her"),
 (round(CUE["END"] - 0.3, 2), "8 09", f"Back to the wide: door and chain still jumping, dresser sliding. Hunter BGM uninterrupted from the decision. End {CUE['END']:.1f} s"),
]
PROPS = [("lobby", at("01b_window", 0.2), "Street + MERCY TOWER lobby podium: broken glass doors, fog, cars"), ("hunterfull", at("01c_inlobby", 0.6), "The hunter (largo 3 model), 2.6 m, green chest light"),
         ("hunter", at("01c_inlobby", 0.6), "The hunter's face: lipless teeth lit"), ("door", at("05_quiet", 0.6), "Door 3012: hinge leaf, peephole, deadbolt, brass chain"),
         ("spray", at("05_quiet", 0.6), "First Aid Spray on the dresser"), ("herb", at("05_quiet", 0.6), "Green herb on the window sill"),
         ("typewriter", at("05_quiet", 0.6), "Save typewriter on the kitchen counter"), ("balcony", at("01b_window", 0.6), "The balcony below 3012 (option 2)")]
if "--times" in sys.argv: print(",".join(f"{t:.2f}" for t, _, _ in B)); sys.exit()
if "--props" in sys.argv: print("\n".join(f"{k} {t:.2f}" for k, t, _ in PROPS)); sys.exit()
W_, Hh, cols = 230, 409, 8; rows = (len(B) + cols - 1) // cols; PH = 360
F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 14); f2 = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
sh = Image.new("RGB", (W_ * cols + 10 * (cols + 1), (Hh + 165) * rows + 60 + PH + 80), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), f"AVA ep16: Stuck On Floor 30... Part 2  |  storyboard v1 (real engine frames, REAL voice timing)  |  {CUE['END']:.1f} s  |  1 OPEN -> bitten neighbor -> YOU DIED -> rewind -> 2 STAY QUIET: note, phone, stairwell, peephole -> RE3 decision", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 15; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((W_, Hh)); x = 10 + (i % cols) * (W_ + 10); y = 46 + (i // cols) * (Hh + 165)
    sh.paste(im, (x, y)); m, s = divmod(t, 60); d.text((x, y + Hh + 4), f"{tag}  {int(m)}:{s:04.1f}", font=F, fill=(255, 255, 255)); text(x, y + Hh + 22, txt, W_)
y0 = 46 + rows * (Hh + 165) + 10; d.text((12, y0), "NEW OBJECTS (no HUD, no subtitles; all in code, PS1 textures 8-64 px nearest; the apartment reuses ep6, the hunter reuses largo 3):", font=F, fill=(255, 220, 80))
x = 10
for k, t, cap in PROPS:
    p = f"{H}/props/p_{k}.png"
    if not os.path.exists(p): continue
    im = Image.open(p).convert("RGB"); im = im.resize((int(im.width * PH / im.height), PH)); sh.paste(im, (x, y0 + 22)); text(x, y0 + 26 + PH, cap, im.width); x += im.width + 14
sh.save(f"{P}/storyboard_v1.png"); print(sh.size)
