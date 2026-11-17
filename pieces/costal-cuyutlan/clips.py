"""Genera los clips de costal-cuyutlan PARTE 1 (La Sal de Cuyutlán, versión nueva y muy transformada de "Le pidió 200 mil en el retén… (El Retén)" (1.1M) de @atriumstories_:
aquí, en las salinas de Cuyutlán, Colima, un fuereño atraviesa su camioneta en el bordo y le pide la mitad de la sal a un salinero viejo antes de la lluvia; MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de sarape-saltillo (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4).
Encuadres tipo Atrium (OTS/two-shot/grupo con respaldo single en los intentos 4-6). Si un OTS sale con un doble: python -I clips.py <ID> --one"""
import json, re, subprocess, sys, os, tempfile, time
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
D = Path(__file__).parent
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = D / "clips"
L = json.loads((D / "lines.json").read_text(encoding="utf-8"))
STYLE = ("Cinematic vertical shot from a Mexican telenovela, photorealistic, natural skin texture, 85mm lens, shallow depth of field, "
         "static camera with a very slow push-in. Keep every character exactly as in their reference sheet (same face, hair, clothes, accessories). "
         "No music. Clean frame, no captions, no subtitles, no text on screen, no name tags, no lettering on clothes.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, unhurried, every word clearly pronounced, clear lip sync, says each sentence only once with no repetitions"
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
END = "After the last word the person stays silent until the end of the shot."
# Gancho 0-2 s (c01, el villano hablando, sin plano previo de objetos): Leónidas junto a su camioneta blanca atravesada en el bordo, un costal de sal reventado en el lodo a sus pies y nubes de tormenta:
# "Antes de que llueva, se le deshace la sal. Y por mi camino no sale ni un costal." (injusticia + plazo).
# Plazo: la lluvia que viene del mar; vuelve invertido cuando llegan los salineros: "Usted me dio hasta que lloviera, ¿no? Ahora ese plazo es suyo." (c17-c18).
# Capas: el costal tirado -> "este bordo es mío" y la camioneta atravesada (c03) -> exige la mitad de los costales (c05) -> "que se la coma la lluvia" (c07) -> Atanasio chifla (r3)
# -> los salineros salen de las charcas (i01) -> plazo invertido (c17-c18) -> "el que me la vendió anoche" (c21) -> Evelio, el hermano, baja de la camioneta blanca (r7, c22-c25).
# Geografía fija (bordo entre charcas): Leónidas a la DERECHA frente a su camioneta blanca atravesada; Atanasio a la IZQUIERDA junto a su camioneta azul con los costales;
# Xóchitl a la IZQUIERDA, de pie en la caja de la camioneta azul; Evelio baja de la camioneta blanca a la DERECHA.
# Plano de presentación: Leónidas c01, Atanasio r1, Xóchitl r2, Evelio r7. CTA (c27): Atanasio solo en el bordo, a cámara, con las primeras gotas. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
SAL0 = ("on a narrow dirt dike road between shallow rectangular salt evaporation pools in Cuyutlán, Colima @{LOC_SALINASCUYUT} in the afternoon: white crusted salt pools, small white mounds of salt, "
        "little wooden sheds with palm roofs, low sand dunes and the Pacific Ocean beyond, heavy dark grey storm clouds rolling in from the sea, no rain yet; no readable text, no signs, no logos")
SAL = SAL0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
SACKS = "white woven salt sacks"
BLUE = f"an old faded blue pickup truck loaded with {SACKS}"
WHITE = "a big white double-cab pickup truck with dark tinted windows, no logos and no license plate"
SPILL = "one white woven salt sack split open on the mud with its salt spilled"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Atanasio pelo blanco rizado, camisa azul cielo y trapo blanco al cuello (figura de poder);
# solo Leónidas alto y pesado, bigote delgado, sombrero de paja crema y polo negra (villano); solo Evelio bajito y calvo con lentes redondos y camisa guinda (traidor);
# solo Xóchitl mujer de pelo corto a la quijada, playera amarilla mostaza y overol de mezclilla.
ATA = ("@{ATANASIO_VARELA} (69-year-old Mexican man, deeply tanned wrinkled skin, thin and wiry, short white curly hair, white stubble, a faded sky-blue long-sleeve work shirt with the sleeves rolled to the elbows, "
       "white cotton trousers rolled to the shins, black rubber boots, a white cloth knotted around his neck)")
XOC = ("@{XOCHITL_VARELA} (31-year-old Mexican woman, brown skin, sturdy, short black hair cut at the jaw, small silver stud earrings, a mustard-yellow t-shirt, "
       "faded denim overalls, black rubber boots)")
LEO = ("@{LEONIDAS_PAZOS} (52-year-old Mexican man, light skin, tall and heavy, slicked-back grey hair, a thin black pencil mustache, a cream straw fedora with a black band, "
       "a black polo shirt tucked into beige trousers, a brown leather belt with a big oval silver buckle, shiny brown loafers)")
EVE = ("@{EVELIO_VARELA} (62-year-old Mexican man, tanned skin, short and chubby, bald on top with grey hair on the sides, round wire glasses, a burgundy short-sleeve button shirt, "
       "grey trousers, black shoes)")
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
PRES = ("presentation shot: a single-person medium shot from the knees up that shows the whole outfit clearly, NOT an over-the-shoulder shot, "
        "no foreground figure and nobody else at the edges of the frame")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

# Encuadres tipo Atrium (fuentes/atrium-vista/encuadres.md): OTS ~50 %, single ~25 %, two-shot ~15 %, grupo ~10 %.
# La persona de espaldas va con su @{ASSET} + pelo y ropa vistos desde atrás (así Omni no mete un doble ni un desconocido).
# Cada clip OTS/two/grupo es una tupla (prompt_nuevo, prompt_one): desde el intento ONE_FROM+1 (4-6) o con --one vuelve al single.
# Bordes: Leónidas habla -> espalda de Atanasio en el borde LEFT; Atanasio le habla -> espalda de Leónidas en el borde RIGHT;
# Evelio habla -> espalda de Atanasio/Xóchitl en el borde LEFT; Xóchitl (en la caja) le habla a su papá -> espalda de Atanasio en el borde RIGHT
# (dentro del par Atanasio-Xóchitl ella siempre a la izquierda en la caja y él a su derecha junto a la puerta trasera).
ATA_B = "@{ATANASIO_VARELA} seen from behind (short white curly hair, faded sky-blue work shirt, white cloth knotted at his neck)"
LEO_B = "@{LEONIDAS_PAZOS} seen from behind (cream straw fedora with a black band, black polo shirt, heavy build)"
XOC_B = "@{XOCHITL_VARELA} seen from behind (short black hair cut at the jaw, mustard-yellow t-shirt, denim overall straps)"
EVE_B = "@{EVELIO_VARELA} seen from behind (bald crown with grey hair on the sides, burgundy short-sleeve shirt)"
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
MUTE = "Nobody speaks, all mouths closed. No dialogue."
ONE_FROM = 3  # k (0-based): intentos 4-6 usan el prompt single

def ots(speaker, listener, side):
    """Plano sobre el hombro como el de Atrium: quien escucha, de espaldas y desenfocado en el borde `side`."""
    return (f"Over-the-shoulder shot from behind {listener}: the listener's blurred shoulder and the back of the head fill the {side} "
            f"edge of the frame in the foreground, out of focus, face never visible. {speaker}, facing the camera three-quarters "
            f"and looking at the person in the foreground; {PAIR}.")

def two(desc):
    """Two-shot de perfil, de las rodillas o la cintura para arriba."""
    return f"Medium two-shot, both characters fully in frame, {desc}; {PAIR}."

LR = f"standing on the RIGHT in front of {WHITE} parked across the dike road"          # Leónidas
AL = f"standing on the LEFT beside {BLUE}"                                              # Atanasio
XL = f"standing on the LEFT in the back of {BLUE}, among the sacks"                     # Xóchitl
ER = f"standing on the RIGHT beside the open passenger door of {WHITE}"                 # Evelio

CLIPS = [
 # 1. Gancho (0-2 s): Leónidas YA hablando, el costal reventado a sus pies, la camioneta atravesada y la tormenta encima; plazo de la lluvia.  OTS (Atanasio de espaldas, LEFT)
 ("c01", 6, (talk("c01", "Leónidas", ots(f"Medium shot of {LEO} {SAL0}, {LR}, talking from the very first frame, {SPILL} at his feet, he nudges the spilled salt with the tip of his loafer, "
     f"cold and arrogant, he glances up at the storm clouds", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"), "cold, arrogant, mocking"),
   talk("c01", "Leónidas", f"Medium shot of {LEO} {SAL}, {LR}, talking from the very first frame, {SPILL} at his feet, he nudges the spilled salt with the tip of his loafer, "
     f"cold and arrogant, he glances up at the storm clouds; {gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream straw fedora')}.", "cold, arrogant, mocking"))),
 # r1: presentación de Atanasio como two-shot mudo (cuerpo entero visible)
 ("r1", 6, (two(f"{ATA} on the LEFT in profile facing right and {LEO} on the RIGHT in profile facing left, two meters apart on the dike road {SAL0}, {SPILL} on the mud between them, "
            f"framed from the knees up so both outfits show clearly; Atanasio looks down at the spilled sack, then lifts his eyes slowly to the man, calm and dignified, slightly closer to the camera and in sharper focus") + " Slow push-in. " + MUTE,
   f"Medium shot of {ATA} {SAL}, {AL}, he looks down at the spilled sack in the mud, then lifts his eyes slowly, calm and dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a sky-blue shirt')}. Slow push-in. No dialogue.")),
 ("c02", 6, (talk("c02", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, calm, he wipes his hands on the white cloth at his neck", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, dignified, slow"),
   talk("c02", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, calm, he wipes his hands on the white cloth at his neck", "RIGHT"), "calm, dignified, slow"))),
 ("c03", 6, (talk("c03", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, he pats the hood of his white truck, smug", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "smug, cold"),
   talk("c03", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he pats the hood of his white truck, smug", "LEFT"), "smug, cold"))),
 # r2: presentación de Xóchitl como grupo mudo (los tres, geografía completa)
 ("r2", 6, (f"Medium wide shot from the knees up on the dike road {SAL0}: {XOC} standing on the LEFT in the back of {BLUE}, among the sacks, she looks up at the dark clouds and back at the road, worried, "
            f"her whole outfit clearly visible; {ATA} below her beside the tailgate, seen in three-quarter back view; {LEO} on the RIGHT by {WHITE} parked across the road; "
            f"only these three people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {XOC} {SAL}, {XL}, she looks up at the dark clouds and back at the road, worried, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a mustard-yellow t-shirt')}. Slow push-in. No dialogue.")),
 ("c04", 6, (talk("c04", "Xóchitl", two(f"{XOC} on the LEFT standing in the back of {BLUE} among the sacks, and {ATA} on the RIGHT beside the tailgate below her, in profile facing her, "
            f"on the dike road {SAL0}, framed from the waist up; Xóchitl, worried, glances at the sky, slightly closer to the camera and in sharper focus") + " " + MOUTH("Xóchitl", "Atanasio"),
     "worried, urgent"),
   talk("c04", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, worried, she glances at the sky", "RIGHT"), "worried, urgent"))),
 # c05 (exige la mitad) y c07 ("que se la coma la lluvia"): frases clave, single
 ("c05", 6, talk("c05", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he tips his fedora back with one finger, greedy", "LEFT"),
     "greedy, arrogant")),
 ("c06", 6, (talk("c06", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, he shakes his head slowly, firm", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "firm, calm"),
   talk("c06", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, he shakes his head slowly, firm", "RIGHT"), "firm, calm"))),
 ("c07", 6, talk("c07", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he shrugs, indifferent, a thin smile under his mustache", "LEFT"),
     "indifferent, cruel")),
 ("c08", 6, (talk("c08", "Xóchitl", ots(f"Close-up of {XOC} {SAL0}, {XL}, nervous, thunder makes her flinch", ATA_B, "RIGHT") + " " + MOUTH("Xóchitl", "Atanasio"),
     "nervous, pleading"),
   talk("c08", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, nervous, thunder makes her flinch", "RIGHT"), "nervous, pleading"))),
 ("c09", 6, (talk("c09", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, he laughs once through his nose", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "mocking, arrogant"),
   talk("c09", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he laughs once through his nose", "LEFT"), "mocking, arrogant"))),
 ("c10", 6, (talk("c10", "Atanasio", two(f"{ATA} on the LEFT in profile facing right and {LEO} on the RIGHT in profile facing left, two meters apart on the dike road {SAL0}, framed from the knees up; "
            f"Atanasio looks the man up and down, unimpressed, slightly closer to the camera and in sharper focus") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, dry, a little ironic"),
   talk("c10", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, he looks the man up and down, unimpressed", "RIGHT"), "calm, dry, a little ironic"))),
 ("c11", 6, (talk("c11", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, proud, he hooks his thumbs in his belt by the big buckle", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "proud, smug"),
   talk("c11", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, proud, he hooks his thumbs in his belt by the big buckle", "LEFT"), "proud, smug"))),
 ("c12", 6, (talk("c12", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, a calm half smile", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, knowing"),
   talk("c12", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, a calm half smile", "RIGHT"), "calm, knowing"))),
 ("c13", 6, (talk("c13", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, he looks around at the empty salt pools and laughs", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "mocking, confident"),
   talk("c13", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he looks around at the empty salt pools and laughs", "LEFT"), "mocking, confident"))),
 # 2. El chiflido: salen los salineros de las charcas (r3/r4 single: momento fuerte y reacción)
 ("r3", 6, one(f"Close-up of {ATA} {SAL}, {AL}, in silence, he puts two fingers in his mouth and whistles long and loud toward the salt pools, then lowers his hand, calm", "RIGHT") + " No dialogue."),
 ("r4", 6, one(f"Close-up of {LEO} {SAL}, {LR}, in silence, his smile fades slowly as he hears something coming, he turns his head toward the salt pools", "LEFT") + " Slow push-in. No dialogue."),
 # i01 grupo PG: Leónidas de espaldas en primer plano a la RIGHT viendo llegar a los salineros
 ("i01", 6, (f"Wide shot of shallow white salt evaporation pools in Cuyutlán, Colima, under heavy dark storm clouds: in the RIGHT foreground {LEO_B}, standing on the dike road, out of focus, face never visible, "
            f"watching dozens of salt workers in white cloths over their heads and rubber boots walk out of the pools toward the dike road, empty-handed, steady and silent, some carrying baskets of salt on their shoulders. "
            f"No faces in close-up, no letters, no signs. " + MUTE,
   f"Wide shot of shallow white salt evaporation pools in Cuyutlán, Colima, under heavy dark storm clouds: dozens of salt workers in white cloths over their heads and rubber boots walk out of the pools "
            f"toward a narrow dirt dike road, empty-handed, steady and silent, some carrying baskets of salt on their shoulders. No faces in close-up, no letters, no signs. No dialogue.")),
 ("c14", 6, (talk("c14", "Xóchitl", ots(f"Close-up of {XOC} {SAL0}, {XL}, she looks out at the salt pools, astonished, a hopeful breath", ATA_B, "RIGHT") + " " + MOUTH("Xóchitl", "Atanasio"),
     "astonished, quiet"),
   talk("c14", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, she looks out at the salt pools, astonished, a hopeful breath", "RIGHT"), "astonished, quiet"))),
 ("c15", 6, (talk("c15", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, he looks around, his confidence cracking", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "nervous, defensive"),
   talk("c15", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he looks around, his confidence cracking", "LEFT"), "nervous, defensive"))),
 ("c16", 6, (talk("c16", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, proud and serene", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "proud, serene"),
   talk("c16", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, proud and serene", "RIGHT"), "proud, serene"))),
 ("c17", 6, (talk("c17", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, he glances up at the clouds and back, a slow smile", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, ironic, firm"),
   talk("c17", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, he glances up at the clouds and back, a slow smile", "RIGHT"), "calm, ironic, firm"))),
 ("c18", 6, (talk("c18", "Atanasio", two(f"{ATA} on the LEFT in profile facing right and {LEO} on the RIGHT in profile facing left on the dike road {SAL0}, framed from the knees up; "
            f"Atanasio takes one slow step toward the man, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Atanasio", "Leónidas"),
     "firm, slow, final"),
   talk("c18", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, serious, slow and final", "RIGHT"), "firm, slow, final"))),
 ("r5", 6, one(f"Close-up of {LEO} {SAL}, {LR}, in silence, he swallows, looks up at the dark clouds and then around him", "LEFT") + " Slow push-in. No dialogue."),
 ("c19", 6, (talk("c19", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, he straightens his fedora, trying to sound sure", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "defensive, trying to sound sure"),
   talk("c19", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he straightens his fedora, trying to sound sure", "LEFT"), "defensive, trying to sound sure"))),
 ("c20", 6, (talk("c20", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, calm, he opens one hand", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, firm"),
   talk("c20", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, calm, he opens one hand", "RIGHT"), "calm, firm"))),
 ("c21", 6, (talk("c21", "Leónidas", two(f"{LEO} on the RIGHT in front of {WHITE} and {ATA} on the LEFT, in profile facing each other on the dike road {SAL0}, framed from the knees up; "
            f"a sly smile comes back to Leónidas, he tilts his head toward his white truck, slightly closer to the camera and in sharper focus") + " " + MOUTH("Leónidas", "Atanasio"),
     "sly, cold"),
   talk("c21", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, a sly smile comes back, he tilts his head toward his white truck", "LEFT"), "sly, cold"))),
 # 3. Giro familiar: el hermano baja de la camioneta blanca
 ("r6", 6, one(f"Close-up of {ATA} {SAL}, {AL}, in silence, he turns his head slowly toward the white truck, his calm face breaks", "RIGHT") + " Slow push-in. No dialogue."),
 # r7 grupo PMA mudo: presentación de Evelio con Atanasio de espaldas y Leónidas al lado
 ("r7", 6, (f"Medium wide shot from the knees up on the dike road {SAL0}: in the LEFT foreground {ATA_B}, in three-quarter back view; on the RIGHT {EVE} has just stepped out of the passenger door of {WHITE}, "
            f"he pushes up his round glasses and cannot hold his brother's eyes, his whole outfit clearly visible; {LEO} stands beside him by the truck; only these three people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {EVE} {SAL}, {ER}, he has just stepped out of the white truck, he pushes up his round glasses and cannot hold his brother's eyes, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('bald man in a burgundy shirt')}. Slow push-in. No dialogue.")),
 ("c22", 6, talk("c22", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, hurt, he can barely say it", "RIGHT"),
     "hurt, low, slow")),
 ("c23", 6, (talk("c23", "Evelio", ots(f"Close-up of {EVE} {SAL0}, {ER}, he shrugs, bitter, looking at the ground", ATA_B, "LEFT") + " " + MOUTH("Evelio", "Atanasio"),
     "bitter, defensive"),
   talk("c23", "Evelio", one(f"Close-up of {EVE} {SAL}, {ER}, he shrugs, bitter, looking at the ground", "LEFT"), "bitter, defensive"))),
 # c24 llanto: single
 ("c24", 6, talk("c24", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, hurt, her eyes shine, wearing her faded denim overalls with both straps over the mustard-yellow t-shirt exactly as in her reference sheet", "RIGHT"),
     "hurt, sad")),
 ("c25", 6, (talk("c25", "Evelio", ots(f"Close-up of {EVE} {SAL0}, {ER}, he adjusts his glasses, avoiding her eyes", XOC_B, "LEFT") + " " + MOUTH("Evelio", "Xóchitl"),
     "quiet, guilty, cold"),
   talk("c25", "Evelio", one(f"Close-up of {EVE} {SAL}, {ER}, he adjusts his glasses, avoiding her eyes", "LEFT"), "quiet, guilty, cold"))),
 ("c26", 6, (talk("c26", "Atanasio", two(f"{ATA} on the LEFT in profile facing right and {EVE} on the RIGHT in profile facing left beside the open passenger door of {WHITE}, on the dike road {SAL0}, framed from the waist up; "
            f"Atanasio takes one step forward toward his brother, firm and quiet, slightly closer to the camera and in sharper focus") + " " + MOUTH("Atanasio", "Evelio"),
     "firm, quiet, hurt"),
   talk("c26", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, he takes one step forward, firm and quiet", "RIGHT"), "firm, quiet, hurt"))),
 # 4. Gancho a la Parte 2: cae la primera lluvia
 ("i02", 6, f"Close-up insert {SAL0}: the first big raindrops fall on {SACKS} piled in the back of an old faded blue pickup truck, dark spots spreading on the woven sacks. "
            f"Only the sacks and the rain, no people, no letters. No dialogue."),
 # CTA con carisma (después del BLACK): Atanasio solo en el bordo, a cámara
 ("c27", 10, talk("c27", "Atanasio", f"Close-up from the chest up of {ATA} {SAL0}, alone, light rain starting to fall, standing in front of {BLUE}, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a calm knowing smile, makes a short pause, raises one eyebrow, "
     f"wipes a raindrop from his cheek with the white cloth at his neck, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Y por mi camino no sale ni un costal.", "Y por aquí no sale nada."), ("Entonces que se la coma la lluvia.", "Entonces que llueva."),
        ("Y a su hija temblando.", "Y a su hija."), ("Díganles que no se me acerquen.", "¿Qué quieren?"),
        ("Y antes de que escampe, se me va del bordo.", "Y antes de que escampe, se va."), ("Y ya me cansé de oler a sal.", "Y ya me cansé."),
        ("¿Cómo pudo hacernos esto?", "¿Por qué, tío?"),
        ("split open on the mud with its salt spilled", "lying on the mud"), ("he nudges the spilled salt with the tip of his loafer", "he looks down at the sack"),
        ("with the tip of his loafer", ""), ("greedy", "confident"), ("indifferent", "calm"), ("thunder makes her flinch", "she glances at the sky"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, stormy afternoon light over the white salt pools of Cuyutlán, Colima, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, salt flats on the Pacific coast of Mexico under storm clouds, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft grey light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ATANASIO_VARELA}", "a thin old Mexican man with short white curly hair, white stubble, a faded sky-blue work shirt and a white cloth around his neck"),
         ("@{XOCHITL_VARELA}", "a sturdy Mexican woman around thirty with short black hair cut at the jaw, a mustard-yellow t-shirt and denim overalls"),
         ("@{LEONIDAS_PAZOS}", "a tall heavy Mexican man in his fifties with slicked-back grey hair, a thin pencil mustache, a cream straw fedora and a black polo shirt"),
         ("@{EVELIO_VARELA}", "a short chubby Mexican man in his sixties, bald on top, with round wire glasses and a burgundy short-sleeve shirt"),
         (" @{LOC_SALINASCUYUT}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    if "LIMITE DE CREDITOS" in r.stdout: print(r.stdout.strip(), flush=True); sys.exit("FIN por limite de creditos")
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control: gatito como IMAGEN (no gasta créditos)."""
    try:
        r = subprocess.run(["node", "src/cli.js", "--count", "1", "--aspect", "9:16", "--out", str(D / "canary"),
                            "A fluffy orange kitten playing with a ball of yarn on a sofa, soft daylight. No text."],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300)
        files = [l for l in r.stdout.splitlines() if l.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))]
    except subprocess.TimeoutExpired:
        files = []
    for x in files: os.remove(x)
    print("CONTROL gatito:", "Flow OK -> el problema es el prompt" if files else "Flow FALLA -> esperar", flush=True)
    return bool(files)

def reload_flow():
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_reload.js")], capture_output=True, text=True, timeout=120)
    print("RECARGA Flow", flush=True)

def new_project():
    subprocess.run(["node", "src/cli.js", "project", "new"], cwd=MCP, capture_output=True, text=True, timeout=180)
    pid = subprocess.run(["node", "src/cli.js", "project"], cwd=MCP, capture_output=True, text=True, timeout=60).stdout.strip()
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_tabs.js"), "--close-extra", pid], capture_output=True, text=True, timeout=60)
    subprocess.run([sys.executable, "-I", "make_sheets.py", "--reupload"], cwd=D, capture_output=True, text=True, timeout=1800)
    print("PROYECTO NUEVO", pid, "(hojas resubidas)", flush=True)

def main():
    force_one = "--one" in sys.argv  # regenerar con el single (p. ej. si el OTS salió con un doble)
    want = set(a for a in sys.argv[1:] if a != "--one")
    OUT.mkdir(exist_ok=True)
    for cid, dur, body in CLIPS:
        dst = OUT / f"{cid}.mp4"
        if want and cid not in want: continue
        if dst.exists():
            if not want: continue
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            alt = isinstance(body, tuple)  # (OTS/two/grupo, respaldo single)
            use_one = alt and (force_one or k >= ONE_FROM)
            files, log = gen(variant((body[1] if use_one else body[0]) if alt else body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()  # solo contra los clips ya guardados (c*/i*/r*.mp4), nunca contra la descarga misma
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"  # Flow devolvió un clip ya bajado
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1}{', single' if use_one else ''})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()
