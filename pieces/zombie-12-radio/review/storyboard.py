# storyboard_v1.png (ep10 The Stairs): un panel por beat (frames reales del motor con la voz real, review/sb/f_<t>.png) +
# fila de objetos nuevos foto Flow -> lowpoly (recorte PNG | en el motor). python storyboard.py
import os; from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, ".."); F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15); f2 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
B = [(2.3, "1  0:00", "'The lights are out, and your phone has no bars...' Blackout living room (moonlight + lantern), Ava with her phone: NO POWER / NO BARS tags. Hook horror music 0-10 s"),
     (3.5, "1b 0:02", "'...When the phones die, this is your best friend.' HUD in at once. Ava cranks the radio on a supply crate: her right hand drives the crank knob (pump clip + arm sway, crank follows the hand). Static -> signal waves, LED on, happy face"),
     (10.6, "2  0:05", "ITEMS / EXAMINE: HAND-CRANK RADIO (drawn in code) turning. NO GRID / NO TOWER pop on their words; 'Crank it for a minute' -> crank spins, charge bar fills, CHARGED: IT TALKS"),
     (14.3, "3  0:11", "'One earbud, speaker off, noise brings them...' Ava sits at the coffee table, earbud cable from the radio to her ear, green herb pot beside her. 1 EARBUD / SPEAKER OFF / NOISE BRINGS THEM"),
     (16.5, "3b 0:15", "'Your other ear stays on the house.' Close-up, scared eyes looking sideways, OTHER EAR: / THE HOUSE"),
     (24.3, "4  0:17", "AM RADIO: DAY vs NIGHT diagram. Night wave bounces off the IONOSPHERE (HUNDREDS OF MILES); 'in the daytime...' the day wave fades out (red X); 'scan the dial after dark' -> dial needle sweeps, SCAN AT NIGHT"),
     (28.0, "5  0:25", "'Save your batteries... top of the hour, when the news comes on.' Battery icon, wall clock jumps to 9:00 (TOP OF THE HOUR), radio waves + NEWS"),
     (30.3, "5b 0:28", "'Then write down every time and frequency.' RADIO LOG notebook from above; easter egg: 'itchy... tasty...' crossed out at the top; the 9 PM entry writes itself on the words"),
     (36.3, "6  0:31", "'Listen for what keeps repeating...' Kitchen fridge: SHELTER / ROUTE 9 / CURFEW notes with tally marks pop on each word, Ava points. Push-in ends on the 'you are the master of unlocking!' note. REPEATS = OFFICIAL stamp"),
     (41.2, "7  0:37", "'A stranger inviting you somewhere isn't a rescue... Anyone can say they're the army.' Ava frowns at the radio. AN INVITATION IS NOT A RESCUE / ANYONE CAN SAY 'THE ARMY'"),
     (42.0, "7b 0:41", "'Listening is free.' Loading-door transition (a door swings open into darkness, camera dollies in), drawn in code"),
     (44.0, "7c 0:42", "'Talking back tells them where you are.' House cutaway from outside: red pings from the radio, zombies turn and walk toward the house. LISTEN = FREE / TALK = THEY FIND YOU"),
     (47.6, "8  0:44", "RADIO (stranger voice b0469a54, band-passed + saturated): 'Anyone out there?... We're at the police station. We have food... Come to the front gate.' Radio close-up, Ava behind it listening, surprised"),
     (51.9, "8b 0:50", "Heavy footsteps. Wide: a tall man in a fedora and trench coat passes far outside the window as a black silhouette, moonlight patches darken. HUD DANGER"),
     (53.0, "8c 0:52", "Camera pushes in on Ava: 'Oh, fudge.' (ep1 take) shocked eyes, normal open mouth"),
     (55.5, "9  0:54", "'So, what do you do?' Typewriter types SAVE? key by key, INK RIBBON spool beside it, box WILL YOU SAVE YOUR GAME? / INK RIBBON x1 / > YES  NO"),
     (61.5, "10 0:55", "Living RE menu over Ava breathing at the radio (face under the box): WHAT DO I DO? 1. ANSWER THEM / 2. STAY SILENT / COMMENT 1 OR 2 / FOLLOW FOR MORE!, no subtitles. Voice ends 59.2 s, end 62.0 s")]
W, Hh, cols = 270, 480, 6; rows = (len(B) + cols - 1) // cols
sh = Image.new("RGB", (W * cols + 10 * (cols + 1), (Hh + 140) * rows + 60), (18, 18, 22)); d = ImageDraw.Draw(sh)
d.text((12, 14), "AVA ep12: The Radio  |  storyboard v1 (real engine frames, REAL voice timing)  |  62.0 s  |  new in code: crank radio, earbud cable, herb pot, notebook, fridge notes, typewriter + ink ribbon, ionosphere diagram, loading door, fedora silhouette", font=F, fill=(255, 220, 80))
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
