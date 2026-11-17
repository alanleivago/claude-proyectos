# DESCRIPCION.md del LARGO 3: capitulos desde las tarjetas a maquina (review/cuts.json) + texto + creditos. python desc.py
import json, os
H = os.path.dirname(os.path.abspath(__file__))
cut = json.load(open(f"{H}/cuts.json")); T = dict(cut["cuts"])
NAMES = [("hook", "Last night's choice"), ("c1810", "6:10 PM: Who turned the lights on"), ("c1900", "7:00 PM: Marla"), ("c2030", "8:30 PM: The way out"),
         ("c2115", "9:15 PM: The tunnel"), ("c2200", "10:00 PM: The water"), ("c2240", "10:40 PM: Behind you"), ("c2245", "10:45 PM: Marla's choice"),
         ("c2330", "11:30 PM: Lost"), ("c0030", "12:30 AM: The save room"), ("c0140", "1:40 AM: The forest"), ("c0230", "2:30 AM: Something in the trees"),
         ("c0300", "3:00 AM: The mansion"), ("c0315", "3:15 AM: The great hall"), ("c0400", "4:00 AM: The house is not empty"), ("c0440", "4:40 AM: The radio room"),
         ("c0530", "5:30 AM: Dawn"), ("c0540", "5:40 AM: It followed you"), ("c0542", "5:42 AM: Run or fight?")]
def mmss(t): t = int(round(t)); return f"{t // 60}:{t % 60:02d}"
rows = []
for ch, name in NAMES:
    t = 0 if ch == "hook" else T["card_" + ch]
    rows.append((t, name))
TITLE = "Zombie Outbreak: Day 3 Something Followed Me Out of the Sewers"
creds = json.load(open(f"{H}/../audio/CREDITS.json", encoding="utf-8"))
sfx = "\n".join(f"- {c['name']} by {c['user']}, {c['url']}" for c in creds)
txt = f"""---
type: doc
status: active
tags: [zombie-channel, ava-restfield, long-form, youtube-description, credits, chapters, part-3]
relatedTo: [zombie-channel, ava-rules, zombie-03-station]
---

# YouTube: tercer largo 16:9 (Parte 3)

**Título (propuesta):** {TITLE}
- Alternativas: "Zombie Outbreak: Day 3 I Escaped Through the Sewers (Something Followed)" · "Zombie Outbreak: Day 3 A Giant Followed Me Into the Mansion"
- Por qué: mantiene la serie ("Zombie Outbreak: Day N") y cambia el lugar por un gancho de curiosidad (¿qué la siguió?) que la miniatura resuelve a medias con el gigante de espaldas. El borrador "Day 3 Lost in the Sewers" describía solo el primer tercio.

**Capítulos:** {len(rows)}. Empiezan en 0:00; salen de las tarjetas a máquina del render final.

## Descripción (copiar/pegar)

Day 3. You left Dutch in cell four, and now you have to get out. The helicopter waits at the river bridge at dawn, the streets are full, so you go under them: an old 1920 tunnel, a collapse, the city sewers… and Marla makes a choice you'll never forget. Then a storm drain spits you into the woods, there are giant bare footprints in the mud, and the only shelter is a mansion that shouldn't exist. At 5:40 AM, something comes through the window in one jump.

Run or fight? Comment 1 or 2. Most comments decide Day 4.

Real survival facts in this video: never run a generator indoors, carbon monoxide has no color and no smell (CDC); a fever of 100.4°F or more is a sign of infection (CDC); pace count, about 65 paces per 100 meters (US Army land navigation); sewer gas (H2S) smells like rotten eggs and can knock out your sense of smell, if the smell suddenly vanishes, get out (OSHA); 6 inches of moving water can knock an adult down (NWS "Turn Around, Don't Drown"); the wall-follower rule for mazes; water pulls heat from your body about 25 times faster than air; the two pointer stars of the Big Dipper point to the North Star; get dry first, then get warm; 146.52 MHz is the US national simplex calling frequency for ham radio (ARRL).

""" + "\n".join(f"{mmss(t)} {n}" for t, n in rows) + f"""

Animated in a PS1 survival-horror style. Not affiliated with Capcom or Resident Evil.

CREDITS
3D models
- "Man" and "Woman" by Quaternius (poly.pizza): CC0
- "German Shepard" by Quaternius (poly.pizza): CC-BY 3.0, https://poly.pizza/m/Hssa6NPc6W, https://creativecommons.org/licenses/by/3.0/
- "Thin Zombie" by dogchicken (OpenGameArt): CC-BY 3.0, https://opengameart.org/content/thin-zombie-awake-zombie-asset
- "Male City Zombie" by rikindle3d (OpenGameArt): CC0
- Car Kit (police car) by Kenney (kenney.nl): CC0
- The giant ("the Stalker"), the mansion, sewers and forest: original, made for this video
Music (Freesound, CC0)
- metrostock99 https://freesound.org/s/345069/ and https://freesound.org/s/350953/; Dredile https://freesound.org/s/164272/; mr45 https://freesound.org/s/492956/; szegvari https://freesound.org/s/559388/, https://freesound.org/s/640612/, https://freesound.org/s/631933/; kkenny101 https://freesound.org/s/865550/; xkeril https://freesound.org/s/686659/
Sound effects (Freesound, CC0)
{sfx}
- Plus the Part 1 and Part 2 sound libraries (full lists in those descriptions); Dino Crisis-style UI sounds; sound-layer CC0 kit
Voices: AI voices (VoiceStudio). Ava Restfield is an original character. The family portrait was generated with Google Flow.

## Hashtags
#zombie #survival #ps1 #survivalhorror #animation #avarestfield
"""
open(f"{H}/../DESCRIPCION.md", "w", encoding="utf-8").write(txt); print(len(rows), "capitulos")
