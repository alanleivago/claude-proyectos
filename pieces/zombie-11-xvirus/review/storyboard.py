# storyboard_v1.png (ep10 The Stairs): un panel por beat (frames reales del motor con la voz real, review/sb/f_<t>.png) +
# fila de objetos nuevos foto Flow -> lowpoly (recorte PNG | en el motor). python storyboard.py
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, ".."); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(1.2, "1  0:00", "'In a zombie outbreak, the bite isn't what turns you...' Ava in the ep1/ep10 living room, looks at camera. Hook horror music 0-10 s"),
     (3.6, "1b 0:02", "'...the X-virus is.' HUD in at once; she lifts her forearm and the camera pushes into it -> white flash"),
     (10.9, "2  0:04", "MICROSCOPE (RE UI, X-VIRUS label): cute-creepy virus with a face. 'In this world, it spreads like rabies... blood and spit' -> arrows BITE / SCRATCH / SPLASH (EYES/MOUTH) on their words"),
     (12.9, "3  0:11", "'Most people fight with bare arms...' Pipe vs zombie, BARE ARMS tag. One swing (hammer clip once)"),
     (15.4, "3b 0:13", "'...one drop of blood hits their eye. A splash counts as a bite.' Drops fly into her eye, real blood texture, HUD DANGER, A SPLASH = A BITE"),
     (17.3, "3c 0:16", "YOU DIED (red from frame 1, translucent black, drips, CONTINUE?)"),
     (23.3, "4  0:18", "'So cover up. Long sleeves, gloves, goggles, and a mask or a bandana... Blood on a sleeve is just laundry.' RE ITEM screen, each piece pops in AND appears on Ava (code props on her bones). JUST LAUNDRY"),
     (25.2, "5  0:23", "'If you get bitten or scratched anyway, wash the wound with soap and running water...' Bathroom sink (ep7 bathroom): SOAP / RUNNING WATER tags"),
     (28.2, "5b 0:26", "'...for a full fifteen minutes' 15:00 timer runs, AT LEAST 15 MIN (WHO)"),
     (31.8, "5c 0:29", "'...then disinfect it... and get real medical help, fast.' ep1 First Aid Spray: USE -> mist, DISINFECTED, THEN: A DOCTOR, FAST"),
     (34.8, "6  0:32", "'After a fight or a cleanup, don't touch your face.' Hand to face (pinch_nose once) -> red NO circle, EYES / NOSE / MOUTH"),
     (36.2, "6b 0:35", "'Wash your hands first.' Hands under the tap with soap foam, WASH HANDS FIRST"),
     (42.6, "7  0:36", "FILE: SYMPTOM DIARY typed letter by letter on the words: DAY 1 fever, headache / DAY 2 red eyes, staring / DAY 3 ? ? ?  Stamp THIS WORLD"),
     (43.9, "8  0:43", "'So anyone who shows up...' Laundry door: QUARANTINE 72 H sign, light + feet under the door, Ava sits watching (sit_floor once)"),
     (44.7, "8b 0:44", "'...even the guy at the door,' ep10 front door, polite knocks, HIM TOO"),
     (47.3, "8c 0:45", "'...stays alone and watched for seventy-two hours' Sign close-up, 72:00:00 clock, THIS WORLD'S RULE"),
     (50.2, "9  0:48", "'Then you spot a scratch on your arm... when did that happen?' Scratch decal on her forearm, SCRATCH? HUD CAUTION"),
     (52.9, "9b 0:52", "'Oh, fudge.' (ep1 take) Scared eyes, normal open mouth"),
     (61.0, "10 0:54", "Living RE menu (same continuous shot, Ava breathing, looking down at the arm): WHAT DO I DO? 1. WASH IT FOR 15 MIN / 2. QUARANTINE MYSELF / COMMENT 1 OR 2 / FOLLOW FOR MORE! - all inside the auto-fit box, no subtitles. End 63.0 s")]
W, Hh, cols = 270, 480, 7; rows = (len(B) + cols - 1) // cols
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 140) * rows + 60), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA ep11: How Not to Turn  |  storyboard v1 (real engine frames, REAL voice timing)  |  63.0 s  |  new props in code: sleeves, gloves, goggles, bandana, sink, scratch, microscope UI", font=F, fill=(255, 220, 80))
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
