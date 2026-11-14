# storyboard_v1.png (ep9 The Last Train, Part 2): un panel por beat (frames reales del motor con la voz REAL, review/sb/f_<t>.png).
# python storyboard.py  (los tiempos salen de engine/cues.json; stills.mjs los renderiza antes)
import os, json, sys; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, "..")
C = json.load(open(os.path.join(P, "engine", "cues.json"), encoding="utf8")); T, W = C["T"], C["W"]
F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(W["stay"] + 0.4, "1  hook", "'Last time, you had to choose... get on, or stay.' Dark platform, train open: 1 GET ON (blue) -> door, 2 STAY (red) -> Ava. Ava on screen from frame 0. Hook music"),
     (W["leaves"] + 0.9, "2  STAY", "'Say you stay. The doors close, and the train leaves without you.' Red 2 STAY pinned at the top"),
     (T["02b_floor"] + 1.0, "2b", "'On the floor you find the rest of rule two...' Ava kneels for the torn half (kneel plays once)"),
     (W["around2"] + 0.4, "2c FILE", "The bottom half slides up and fits the torn edge. Rule 2 word by word: IF YOU HEAR FOOTSTEPS BEHIND YOU, DON'T TURN AROUND."),
     (W["turn3"] + 0.1, "3  turn", "'...you hear footsteps. So you turn around.' Front, scared eyes sideways, she turns her back to us. HUD DANGER"),
     (T["03b_eyes"] + 1.3, "3b eyes", "'Two eyes in the dark...' Over her shoulder: two separate eyes first, then the body comes out of the dark"),
     (W["wide"] + 0.35, "3c smile", "'...and a smile way too wide for a face.' Close-up: the smile stretches wider than the head"),
     (W["locked"] + 0.2, "4  run", "'You run for the exit, but the gate is still locked.' From behind (like the ref), padlock + chain, only the gate rattles"),
     (T["04b_fudge"] + 0.5, "4b fudge", "'Oh, fudge.' (ep1 take) Through the bars: scared eyes, normal open mouth. The eyes + smile behind her in the dark"),
     (T["04c_died"] + 0.6, "4c DIED", "YOU DIED: red from the first frame (no grey ramp), translucent black, drips, CONTINUE?"),
     (T["05_rewind"] + 0.2, "5  glitch", "Glitch: YOU DIED breaks into slices, colour bars"),
     (T["05_rewind"] + 1.2, "5b REW", "'Okay, let's rewind.' VHS rewind: the STAY branch plays backwards fast, REW + tracking band + counter"),
     (T["06_geton"] + 1.0, "6  GET ON", "'This time, you get on.' Blue 1 GET ON pinned. She walks to the door, the creature behind (cut at the threshold)"),
     (W["bangs"] + 0.15, "6b shut", "'The doors shut right in its face, and it bangs on the glass...' Inside the car (code-built interior): only the door leaves shake"),
     (W["breathe"] + 0.3, "6c breathe", "'...but you're inside. You finally breathe.' Relief face, looking at us; the smile still at the glass"),
     (W["switches"] + 0.3, "7  speed", "'Then the train speeds up. It switches tracks...' Low trackside camera, signal turns green, train veers to the other track"),
     (W["stops"] + 1.3, "7b tunnel", "'...and stops in a tunnel you've never seen.' Old brick tunnel, caged red lamps, a station sign with letters missing"),
     (W["out8"] + 0.4, "7c dark", "'...and the lights go out.' Inside, strip by strip; only the red of the tunnel through the windows"),
     (W["minute"] + 0.3, "8  screen", "'A screen turns on. Welcome to the last stop, you have one minute.' WELCOME TO THE LAST STOP / You have one minute / 01:00"),
     (W["white"] + 0.3, "8b buttons", "'Red, you leave the train. White, you stay on board.' LEAVE (red, Exit the train) / STAY (white, Remain on board), lit on each word"),
     (W["darkness"] + 0.3, "9  open", "'Then the doors open... on total darkness.' The red lamps die; the door opens on black. Timer running"),
     (W["left10"] + 0.2, "9b 00:05", "'Five seconds left...' 00:05 in red"),
     (W["breathing"] + 0.4, "9c breath", "'...and something out there is breathing.' Only breath vapour in the black doorway (ambiguous, no eyes)"),
     (C["END"] - 0.4, "10 menu", "'So, what do you do? Leave... or stay? Comment one or two.' RE menu over Ava breathing: 1. LEAVE / 2. STAY, labels to the door and the seat, COMMENT 1 OR 2, FOLLOW FOR MORE!. No subtitles")]
if "--times" in sys.argv: print(",".join(f"{t:.2f}" for t, _, _ in B)); raise SystemExit
Wd, Hh, cols = 270, 480, 8; rows = (len(B) + cols - 1) // cols
sh = Image.new("RGB", (Wd * cols + 10 * (cols + 1), (Hh + 100) * rows + 50), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), f"AVA ep9: The Last Train, Part 2  |  storyboard v1 (real engine frames, REAL voice timing)  |  {C['END']:.1f} s", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 16; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((Wd, Hh)); x = 10 + (i % cols) * (Wd + 10); y = 50 + (i // cols) * (Hh + 100)
    sh.paste(im, (x, y)); d.text((x, y + Hh + 4), f"{tag}  {int(t // 60)}:{t % 60:04.1f}", font=F, fill=(255, 255, 255)); text(x, y + Hh + 24, txt, Wd)
sh.save(os.path.join(P, "storyboard_v1.png")); print(sh.size)
