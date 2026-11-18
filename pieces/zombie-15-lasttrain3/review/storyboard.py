# storyboard_v2.png (ep15 The Last Train, Part 3): un panel por plano (frames reales del motor con la voz real, review/sb/f_<t>.png)
# + fila de objetos nuevos (review/props/p_<clave>.png, motor con ?prop=<clave>&clean=1: sin HUD ni subtitulos). Tiempos: engine/cues.json.
# python storyboard.py --times  -> tiempos para: node engine/stills.mjs review/sb <tiempos>
# python storyboard.py --props  -> lineas "clave tiempo" para los primeros planos de objetos
# python storyboard.py          -> arma ../storyboard_v1.png
import os, sys, json; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, "..")
CUE = json.load(open(f"{P}/engine/cues.json")); T, W = CUE["T"], CUE["W"]
at = lambda k, off: round((W[k] if k in W else T[k]) + off, 2)
B = [  # (tiempo, beat/plano, texto)
 (at("01_hook", 1.3), "1 01 hook", "'You stayed on the last train...' Inside the stopped car (end of Part 2): doors open on black, the 00:05 screen with LEAVE/STAY. Labels 1 LEAVE (red) -> open door, 2 STAY (white) -> Ava. Ava to camera"),
 (at("driving", 0.3), "1 01b", "'...but who's driving it?' The cab door at the front, ajar, CREW ONLY, the NIGHT SHIFT sheet taped on it. HUD in at this cut (SUBWAY plate). CAB"),
 (at("red", 0.3), "2 02", "'Some of you pressed red.' The screen: LEAVE lights up on 'red'. 1 LEAVE pinned top right for the whole branch"),
 (at("tunnel2", 0.2), "2 02b", "'So you step off into the tunnel.' From the tunnel: the open car behind, Ava walks along the track with the flashlight (light pool on the ties). Red caged lamps"),
 (at("six", 0.35), "2 02c", "'Don't touch the third rail, it carries about six hundred volts.' Low camera: the covered third rail beside her boots, DANGER 600 V plates. THIRD RAIL / 600 VOLTS"),
 (at("footsteps3", 0.5), "2 03", "'Then footsteps behind you...' Front shot: Ava walks to camera, eyes to the side, looks at camera. HUD DANGER"),
 (at("around", 0.6), "2 03b", "'...and you turn around.' She turns; the lamps behind her are out: the giant's green chest light first, then it walks slow and heavy out of the black into her flashlight"),
 (at("03c_back", 0.9), "2 03c", "Big shot from the giant's back (~70 % of frame), Ava small in the background with the flashlight (STALKER grammar). One heavy barefoot step"),
 (at("04_fudge", 0.9), "2 04", "'Oh, fudge.' (ep1 take) She turns back to run, face to camera; the giant leans over her, the huge lipless teeth (= 'the smile') lit"),
 (at("04c_died", 1.0), "2 04c", "YOU DIED (RE style: red from frame 1, translucent black, drips, CONTINUE?) ~2 s"),
 (at("rewind", 0.5), "3 05", "'Let's rewind.' Glitch over YOU DIED, then the LEAVE branch plays backwards fast with a VHS layer (REW, tracking, counter)"),
 (at("white", 0.3), "4 06", "'Most of you pressed white.' The screen: STAY lights up on 'white'. 2 STAY pinned for the rest of the video"),
 (at("smile6", 0.35), "4 06b", "'The doors close, and the smile stays outside.' Doors slide shut on 'close'; the giant steps out of the dark beside the door, chest-up in the glass, and slams it on 'smile' (only the door leaves shake)"),
 (at("06d_empty", -0.12), "4 06c", "'Then the train speeds up,' High over the second track switch: the points move, the signal goes green, the driverless train rushes in and lurches onto the other track. SWITCH"),
 (at("nobody", 0.5), "4 06d", "'...with nobody driving.' Inside the cab behind the EMPTY driver seat: lever alone, tunnel lamps rushing past the windshield. NOBODY"),
 (at("switch7", 0.3), "5 07", "'Trains have a dead man's switch.' Close on the controller handle with the red knob. DEAD MAN'S SWITCH"),
 (at("brakes", 0.3), "5 07b", "'If the driver lets go, it brakes on its own...' Diagram: a ghost lever springs back to brake on 'lets go'. LET GO / BRAKES"),
 (at("doesnt", 0.3), "5 07c", "'...this one doesn't.' Wider: the real lever is taped down forward with grey duct tape. TAPED DOWN"),
 (at("cab8", 0.25), "6 08", "'Rule three says never enter the cab.' FILE: the NIGHT SHIFT INSTRUCTIONS sheet from Parts 1-2 (taped tear), rules 1 and 2, rule 3 NEVER ENTER THE CAB. written word by word and boxed in red"),
 (at("08b_enter", 1.0), "6 08b", "'You go in anyway,' From inside the cab: Ava pushes the ajar door open (push_door, once) and walks in"),
 (at("lever", 0.0), "6 08c", "'...rip the tape off the lever,' Her left hand on the handle, her right hand rips the tape away (the strip follows her hand). Two-bone IK, real hands on the lever"),
 (at("brake8", 0.15), "6 08d", "'...and pull the brake.' Both hands on the handle, she pulls it back to B. BRAKE"),
 (at("08e_sparks", 0.8), "6 08e", "(...) 1.8 s: outside by the wheels, sparks from the brakes, the train slowing"),
 (at("dark", 0.4), "7 09", "'It stops in the dark.' The red tunnel lamps die; the train stands in the dark, headlights flickering"),
 (at("car9", 0.4), "7 09b", "'Then footsteps in the next car...' From the cab doorway down the car (lights flickering slowly): the giant slides into the back door window, ducking. HUD DANGER"),
 (at("board", 0.3), "7 09c", "'...the smile got on board.' The back door window: the giant's face, teeth lit, chest up only (it ducks, never through the roof)"),
 (at("ten", 0.5), "8 10", "'Ten seconds.' The screen: YOU BROKE RULE 3 / 10, counting down; the doors open by themselves"),
 (at("exit10", 0.4), "8 10b", "'Run for the exit...' Live RE menu (5 live angles, same menu + countdown). Over her shoulder: the open door and the lit emergency EXIT with the green herb. 1 EXIT"),
 (at("lock", 0.6), "8 10c", "'...or lock yourself in the cab?' Reverse angle: Ava and the cab door behind her. Cursor on 2. 2 CAB"),
 (at("comment", 0.6), "8 10d", "'Comment one or two.' Wide: Ava between the open door (1 EXIT) and the cab (2 CAB). COMMENT 1 OR 2"),
 (at("10_choice4", 1.2), "8 10e", "Close on Ava breathing, looking at us. FOLLOW FOR MORE!"),
 (round(CUE["END"] - 0.3, 2), "8 10f", f"From the cab down the car: Ava in the foreground, the giant still in the back window. Countdown at 1, no subtitles, unresolved. End {CUE['END']:.1f} s"),
]
PROPS = [("cab", at("06d_empty", 0.6), "Driver's cab: windshield, console with dials, empty seat, cab door"), ("lever", at("07c_tape", 0.6), "Controller with dead man's knob, taped down"),
         ("spray", at("06d_empty", 0.6), "First Aid Spray on the cab shelf"), ("door", at("01b_cab", 0.6), "Cab door ajar + CREW ONLY + NIGHT SHIFT sheet"),
         ("rail", at("02c_rail", 0.6), "Third rail with cover board, DANGER 600 V plates"), ("exit", at("10_choice", 2.0), "Emergency EXIT door, green herb by the step"),
         ("giant", at("04_fudge", 1.2), "The giant ('the Stalker', largo 3): lipless teeth = 'the smile'"), ("giantfull", at("03b_turn", 0.4), "The giant, 2.6 m, green chest light")]
if "--times" in sys.argv: print(",".join(f"{t:.2f}" for t, _, _ in B)); sys.exit()
if "--props" in sys.argv: print("\n".join(f"{k} {t:.2f}" for k, t, _ in PROPS)); sys.exit()
W_, Hh, cols = 230, 409, 8; rows = (len(B) + cols - 1) // cols; PH = 360
F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 14); f2 = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
sh = Image.new("RGB", (W_ * cols + 10 * (cols + 1), (Hh + 165) * rows + 60 + PH + 80), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), f"AVA ep15: CHOOSE: You Stayed On The Last Train... - Part 3  |  storyboard v2 (the giant replaces the creature; real engine frames, REAL voice timing)  |  {CUE['END']:.1f} s  |  LEAVE branch -> YOU DIED -> rewind -> STAY branch, cab, RULE 3, countdown", font=F, fill=(255, 220, 80))
def text(x, y, txt, w):
    line, ly = "", y
    for wd in txt.split():
        if d.textlength(line + " " + wd, font=f2) > w: d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200)); ly += 15; line = ""
        line += " " + wd
    d.text((x, ly), line.strip(), font=f2, fill=(200, 200, 200))
for i, (t, tag, txt) in enumerate(B):
    im = Image.open(f"{H}/sb/f_{t:.2f}.png").convert("RGB").resize((W_, Hh)); x = 10 + (i % cols) * (W_ + 10); y = 46 + (i // cols) * (Hh + 165)
    sh.paste(im, (x, y)); m, s = divmod(t, 60); d.text((x, y + Hh + 4), f"{tag}  {int(m)}:{s:04.1f}", font=F, fill=(255, 255, 255)); text(x, y + Hh + 22, txt, W_)
y0 = 46 + rows * (Hh + 165) + 10; d.text((12, y0), "NEW OBJECTS (no HUD, no subtitles; all in code, PS1 textures 8-64 px nearest; the car and tunnel reuse ep9, the giant reuses largo 3):", font=F, fill=(255, 220, 80))
x = 10
for k, t, cap in PROPS:
    p = f"{H}/props/p_{k}.png"
    if not os.path.exists(p): continue
    im = Image.open(p).convert("RGB"); im = im.resize((int(im.width * PH / im.height), PH)); sh.paste(im, (x, y0 + 22)); text(x, y0 + 26 + PH, cap, im.width); x += im.width + 14
sh.save(f"{P}/storyboard_v2.png"); print(sh.size)
