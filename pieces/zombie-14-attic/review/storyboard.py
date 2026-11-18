# storyboard_v2.png (ep14 The Attic, Stairs Part 2): un panel por plano (frames reales del motor con la voz real, review/sb/f_<t>.png)
# + fila de objetos nuevos (review/props/*.png). Tiempos desde engine/cues.json.
# python storyboard.py --times  -> imprime los tiempos para node engine/stills.mjs review/sb <tiempos>
# python storyboard.py          -> arma ../storyboard_v2.png
import os, sys, json; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, "..")
CUE = json.load(open(f"{P}/engine/cues.json")); T, W = CUE["T"], CUE["W"]
at = lambda k, off: round((W[k] if k in W else T[k]) + off, 2)
B = [  # (tiempo, beat/plano, texto)
 (at("01_hook", 0.5), "1 01 hook", "'In a zombie outbreak, there's one room in your house...' Night street, the ep10 house; Ava in the upstairs window with the flashlight (escape ladder still hanging). Crane up. Horror music hook"),
 (at("checks", 0.2), "1 01a", "'...nobody ever checks' House in section (south wall off): rooms, landing with Ava, and the dark attic on top. HUD in at the cut (HOUSE plate). NOBODY CHECKS"),
 (at("attic", 0.05), "1 01b", "'...the attic.' Front shot: Ava looks at camera, then up at the ceiling hatch on 'attic'. THE ATTIC"),
 (at("knocked", 0.3), "1 02 recap", "'Last time, someone knocked downstairs and begged to come in...' ep10 front door: polite knocks, light + feet shadow under the padded '13' door. LAST TIME"),
 (at("quiet1", 0.3), "1 02b", "'...and most of you said stay quiet.' Ava behind the top barricade (screwed door + shelf), ep10 menu with 2. STAY QUIET picked"),
 (at("02c_quiet", 0.8), "1 02c", "'So you stay quiet...' Over her shoulder: sofa + dresser barricade on the bottom steps, front door beyond"),
 (at("stops", 0.4), "1 02d", "'...and the knocking stops.' Last knock, the light under the door dies, the feet walk away. (...) 0.9 s of room tone"),
 (at("sixty", 0.3), "2 03", "'From now on it's silence. Normal talking is about sixty decibels...' Ava to camera; dB meter: TALK 60 (red)"),
 (at("thirty", 0.4), "2 03b", "'...and a whisper is around thirty...' WHISPER 30 (green)"),
 (at("03c_breath", 1.2), "2 03c", "'...so you whisper, or you don't talk at all.' She sits against the landing wall, to camera. Then [BREATH]: real CC0 breath alone in silence"),
 (at("flame", 0.15), "3 04", "'Light's even worse. In total darkness, one small flame...' The whole street dark; one tiny flame appears in the upstairs window. ONE SMALL FLAME"),
 (at("mile", 0.3), "3 04a", "'...can be seen from more than a mile away.' From far down the road behind a zombie: 1+ MILE"),
 (at("blanket", 0.5), "3 04b", "'So the blanket goes over the window,' Ava pulls a red blanket down over the upstairs window (pull_chain, once). BLANKET"),
 (at("floor4", 0.3), "3 04c", "'...and the flashlight points at the floor.' Flashlight in her hand aimed down: visible light pool on the parquet (Day 3 rule). AT THE FLOOR"),
 (at("save", 0.4), "3 05", "'Day five. You save your game.' Typewriter on the landing types DAY 5 / UPSTAIRS / LIGHTS OUT. (one key per letter). PROGRESS SAVED"),
 (at("06_climb", 1.6), "4 06", "'Then you go up to the attic with the water and the mattress.' Pull-down hatch open (lid hangs open), Ava climbs the folding ladder: two-bone IK, hands and feet on the rungs. WATER / MATTRESS tags"),
 (at("floor6", 0.4), "4 06b", "'The floor pulls heat out of you faster than the air does...' Attic: pink insulation, plywood walkway, rafters. Heat arrows into the boards; she unrolls the mattress. BARE BOARDS"),
 (at("boards", 0.6), "4 06c", "'...so you never sleep on bare boards.' Ava sits on the mattress; flashlight lying on it aims at the floor (pool). Water, First Aid Spray, green herb. MATTRESS = WARM. (...) pause"),
 (at("heavy", 0.2), "5 07", "[THINKS, whisper] 'Footsteps outside. Heavy ones...' Low by the house wall: the giant's long rubber coat passes, a bare foot under the hem. HUD CAUTION"),
 (at("07a_bare", 0.5), "5 07a", "'...and bare.' Close: huge bare feet in the wet grass"),
 (at("land", -0.35), "5 07b", "The window at the foot of the stairs bursts inward (glass + frame pieces), the giant jumps through and lands heavy behind the barricade. ~1 s music silence. HUD DANGER"),
 (at("07c_rise", 0.8), "5 07c", "Roar. Through the living-room doorway: it rises slowly, green light on the chest box"),
 (at("zombie", 0.0), "6 08", "*shaking voice* 'That's not a zombie.' Ava on the mattress, scared face to camera (the voice shakes, she does not)"),
 (at("farther", 0.2), "6 09", "'Low sounds carry farther than high ones,' Over the neighborhood: orange low-sound rings spread for blocks. LOW SOUND TRAVELS FARTHER"),
 (at("blocks", 0.3), "6 09b", "'...so everything for blocks just heard that.' Zombies down the street turn toward the house. EVERYTHING FOR BLOCKS"),
 (at("tilts", 0.5), "6 10", "'It tilts its head...' Close on the giant's head tilting (staples, milky eye, lipless teeth)"),
 (at("attic10", 0.1), "6 10b", "'...and looks up at the attic.' From the top of the stairs: it looks up past the barricade"),
 (at("climb", 0.2), "6 11", "'Only one of them can climb your stairs at a time...' From behind it (~70 % of frame), through the broken window: heavy step onto the sofa, only the barricade shakes. 1 AT A TIME"),
 (at("need", 0.3), "6 11b", "'...this one doesn't need to.' From the stairs: it raises its arms over the barricade, gauntlet hands open and close"),
 (at("12_choice", 1.5), "7 12a", "'So what do you do?' Hard cut, white flash, NEGATIVE freeze with no text (house in section: Ava kneeling at the open hatch, the giant at the foot of the stairs, from behind)"),
 (at("12_choice", 4.8), "7 12b", "'One, stay still. Two, jump to the neighbor's roof.' Flash, negative WITH the two options"),
 (round(CUE["END"] - 0.3, 2), "7 12c", f"Flash, colour returns (same framing), giant in slow motion. Live RE menu: WHAT DO YOU DO? 1. STAY STILL / 2. JUMP TO THE NEIGHBOR'S ROOF, cursor on the option the voice names, countdown, COMMENT 1 OR 2, FOLLOW FOR MORE!. No subtitles, no 'Oh, fudge'. End {CUE['END']:.1f} s"),
]
if "--times" in sys.argv: print(",".join(f"{t:.2f}" for t, _, _ in B)); sys.exit()
PROPS = [("p_attic.png", "Attic set: insulation, walkway, rafters, gable vent"), ("p_hatch.png", "Pull-down hatch + folding ladder (stays open)"), ("p_props.png", "Mattress, water, First Aid Spray, green herb"),
         ("p_blanket.png", "Blanket over the upstairs window"), ("p_giant.png", "The giant (stalker_ps1.glb, largo 3)"), ("p_street.png", "Night street: neighbors, road, fence, cars")]
W_, Hh, cols = 230, 409, 8; rows = (len(B) + cols - 1) // cols; PH = 300
EXTRA_H = 40
F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 14); f2 = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
sh = Image.new("RGB", (W_ * cols + 10 * (cols + 1), (Hh + 150) * rows + 60 + PH + 60 + EXTRA_H), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), f"AVA ep14: How To HIDE In Your Attic (The Stairs, Part 2)  |  storyboard v2 (short pauses, real engine frames, REAL voice timing)  |  {CUE['END']:.1f} s  |  ep10 house + new attic, roof, night street, window burst, the giant", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 15; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((W_, Hh)); x = 10 + (i % cols) * (W_ + 10); y = 46 + (i // cols) * (Hh + 150)
    sh.paste(im, (x, y)); m, s = divmod(t, 60); d.text((x, y + Hh + 4), f"{tag}  {int(m)}:{s:04.1f}", font=F, fill=(255, 255, 255)); text(x, y + Hh + 22, txt, W_)
y0 = 46 + rows * (Hh + 150) + 10; d.text((12, y0), "NEW OBJECTS (all in code, PS1 textures 16-32 px nearest; the giant reuses the largo-3 model):", font=F, fill=(255, 220, 80))
for i, (fn, cap) in enumerate(PROPS):
    p = f"{H}/props/{fn}"
    if not os.path.exists(p): continue
    im = Image.open(p).convert("RGB"); im = im.resize((int(im.width * PH / im.height), PH)); x = 10 + i * (im.width + 14)
    sh.paste(im, (x, y0 + 22)); text(x, y0 + 26 + PH, cap, im.width)
sh.save(f"{P}/storyboard_v2.png"); print(sh.size)
