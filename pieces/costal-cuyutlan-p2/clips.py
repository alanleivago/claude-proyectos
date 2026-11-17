"""Genera los clips de costal-cuyutlan-p2 PARTE 2 (La Sal de Cuyutlán · Parte 2, MEXI STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca desde el gancho de la P1 (Evelio, el hermano de Atanasio, bajó de la camioneta blanca y cayeron las primeras gotas): ya llovizna y Leónidas presume que el bordo se lo vendió Evelio.
Remigia, la salinera más vieja, trae el papel de la asamblea (el padre dejó el bordo al pueblo: Evelio vendió lo que no era suyo); Leónidas y Evelio se culpan entre sí; la camioneta blanca se atasca
y nadie la empuja: Leónidas se va a pie por la playa (castigo del villano); Evelio carga los costales a la caseta bajo la lluvia (castigo del traidor) y deja un gancho para la Parte 3.
Copia del clips.py de jipi-becal-p2 (encuadres de Atrium: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one; y todas sus defensas: gatito en imagen, reload_flow, new_project,
descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4). Si un OTS sale con un doble: python -I clips.py <ID> --one"""
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
# Gancho 0-2 s (c01, Leónidas hablando, sin plano previo de objetos): Leónidas frente a su camioneta blanca, con la llovizna en el sombrero:
# "Ya cayó la primera gota, viejo, y aquí sigo. Su hermano me vendió este bordo con todo y lluvia." (recordatorio breve del plazo invertido y de Evelio, de la P1).
# Capas: "le vendió lo que no era suyo" (c02) -> Evelio reclama su mitad (c03) -> llega Remigia (r1, presentación) con el papel de la asamblea (i01): el bordo es del pueblo (c04-c05)
# -> los salineros asienten (r2) -> Leónidas y Evelio se culpan (c08-c09) -> Evelio confiesa por qué (c11) -> plazo cumplido (c13) -> la camioneta se atasca (c14, i02) y nadie la empuja (c15)
# -> Leónidas se va a pie por la playa (c17, r4) -> Evelio pide perdón; castigo: cargar los costales a la caseta uno por uno (c19-c21, r5) -> cálida (c22-c24)
# -> gancho: Evelio solo en la caseta, "quién me presentó a ese señor" (c25) -> CTA de Atanasio (c26).
# Geografía fija del bordo (toda la escena, llovizna constante): a la IZQUIERDA la camioneta azul cargada de costales, con Xóchitl de pie en la caja (la más a la izquierda), Atanasio junto a la puerta trasera
# y Remigia a la derecha de Atanasio; a la DERECHA la camioneta blanca atravesada, con Leónidas delante (más cerca del centro) y Evelio junto a la puerta abierta (el más a la derecha).
# Personaje nuevo: Remigia (presentación en r1, plano medio con la ropa completa). CTA (c26): Atanasio solo en el bordo, a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio. Leónidas sigue siendo el único con sombrero.
SAL0 = ("on a narrow dirt dike road between shallow rectangular salt evaporation pools in Cuyutlán, Colima @{LOC_SALINASCUYUT} in the late afternoon: white crusted salt pools, small white mounds of salt, "
        "little wooden sheds with palm roofs, low sand dunes and the Pacific Ocean beyond, heavy dark grey storm clouds, a light drizzle falling, the mud of the dike wet and shiny; no readable text, no signs, no logos")
SAL = SAL0 + "; nobody else in the background, no extras, nobody besides the person described"
SHED = ("inside a little wooden shed with a palm roof at the edge of the salt pools in Cuyutlán, Colima @{LOC_SALINASCUYUT}: stacks of white woven salt sacks, dim grey light, "
        "a light drizzle falling outside the open doorway; no readable text, no signs, no logos; nobody else in the shed, no extras, nobody besides the person described")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
SACKS = "white woven salt sacks"
BLUE = f"an old faded blue pickup truck loaded with {SACKS}"
WHITE = "a big white double-cab pickup truck with dark tinted windows, no logos and no license plate"
PAPER = "a folded old yellowed paper with faded illegible handwriting"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py) + Remigia. Solo Atanasio pelo blanco rizado, camisa azul cielo y trapo blanco al cuello;
# solo Leónidas alto y pesado, bigote delgado, sombrero de paja crema y polo negra (villano); solo Evelio bajito y calvo con lentes redondos y camisa guinda (traidor);
# solo Xóchitl mujer de pelo corto a la quijada, playera amarilla mostaza y overol; solo Remigia anciana de trenza gris larga, blusa morada y rebozo negro.
ATA = ("@{ATANASIO_VARELA} (69-year-old Mexican man, deeply tanned wrinkled skin, thin and wiry, short white curly hair, white stubble, a faded sky-blue long-sleeve work shirt with the sleeves rolled to the elbows, "
       "white cotton trousers rolled to the shins, black rubber boots, a white cloth knotted around his neck)")
XOC = ("@{XOCHITL_VARELA} (31-year-old Mexican woman, brown skin, sturdy, short black hair cut at the jaw, small silver stud earrings, a mustard-yellow t-shirt, "
       "faded denim overalls, black rubber boots)")
LEO = ("@{LEONIDAS_PAZOS} (52-year-old Mexican man, light skin, tall and heavy, slicked-back grey hair, a thin black pencil mustache, a cream straw fedora with a black band, "
       "a black polo shirt tucked into beige trousers, a brown leather belt with a big oval silver buckle, shiny brown loafers)")
EVE = ("@{EVELIO_VARELA} (62-year-old Mexican man, tanned skin, short and chubby, bald on top with grey hair on the sides, round wire glasses, a burgundy short-sleeve button shirt, "
       "grey trousers, black shoes)")
REM = ("@{REMIGIA_SOTELO} (78-year-old Mexican woman, very dark tanned wrinkled skin, small and slightly stooped, long grey hair in a single braid down her back, no hat, "
       "a faded purple short-sleeve blouse, a long dark-brown skirt, a black rebozo knotted across her chest, black rubber sandals)")
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
# Bordes (geografía fija): los de la izquierda (Atanasio, Xóchitl, Remigia) le hablan a Leónidas o a Evelio -> espalda de ellos en el borde RIGHT;
# Leónidas o Evelio le hablan a los de la izquierda -> espalda del otro en el borde LEFT; Leónidas le habla a Evelio -> espalda de Evelio en el borde RIGHT,
# Evelio a Leónidas -> espalda de Leónidas en el borde LEFT; Xóchitl (en la caja) le habla a su papá -> espalda de Atanasio en el borde RIGHT.
ATA_B = "@{ATANASIO_VARELA} seen from behind (short white curly hair, faded sky-blue work shirt, white cloth knotted at his neck)"
LEO_B = "@{LEONIDAS_PAZOS} seen from behind (cream straw fedora with a black band, black polo shirt, heavy build)"
XOC_B = "@{XOCHITL_VARELA} seen from behind (short black hair cut at the jaw, mustard-yellow t-shirt, denim overall straps)"
EVE_B = "@{EVELIO_VARELA} seen from behind (bald crown with grey hair on the sides, burgundy short-sleeve shirt)"
REM_B = "@{REMIGIA_SOTELO} seen from behind (small and stooped, long grey braid down her back, black rebozo over a faded purple blouse)"
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


D8 = lambda cid: 8 if len(" ".join(L[cid]).split()) > 13 else 6  # clips de más de 13 palabras: 8 s

AL = f"standing on the LEFT beside the tailgate of {BLUE}"                                               # Atanasio
XL = f"standing on the LEFT in the bed of {BLUE}, among the sacks"                                       # Xóchitl
RL = "standing on the LEFT on the muddy dike road beside the old blue pickup truck"                      # Remigia
LR = f"standing on the RIGHT in front of {WHITE} parked across the dike road, its rear wheel sunk in the mud"   # Leónidas
ER = f"standing on the far RIGHT beside the open door of {WHITE}"                                         # Evelio
SPK = lambda spk: f"Only {spk} speaks: {spk}'s lips move clearly with every word; everyone else stays silent the whole shot with closed mouths, only listening."

CLIPS = [
 # 1. Gancho (0-2 s): Leónidas YA hablando bajo la llovizna, Atanasio de espaldas a la izquierda
 ("c01", D8("c01"), (talk("c01", "Leónidas", ots(f"Medium close-up of {LEO} {SAL0}, {LR}, raindrops on his cream fedora, talking from the very first frame, defiant, a cold smile", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "defiant, mocking, cold"),
   talk("c01", "Leónidas", one(f"Medium close-up of {LEO} {SAL}, {LR}, raindrops on his cream fedora, talking from the very first frame, defiant, a cold smile", "LEFT"), "defiant, mocking, cold"))),
 ("c02", D8("c02"), (talk("c02", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, calm and firm, rain on his white hair", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, firm, dry"),
   talk("c02", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, calm and firm, rain on his white hair", "RIGHT"), "calm, firm, dry"))),
 ("c03", 6, (talk("c03", "Evelio", ots(f"Close-up of {EVE} {SAL0}, {ER}, defensive, raindrops on his round glasses", ATA_B, "LEFT") + " " + MOUTH("Evelio", "Atanasio"),
     "defensive, bitter"),
   talk("c03", "Evelio", one(f"Close-up of {EVE} {SAL}, {ER}, defensive, raindrops on his round glasses", "LEFT"), "defensive, bitter"))),
 # r1: presentación de Remigia (personaje nueva), plano medio con la ropa completa
 ("r1", 6, f"Medium shot of {REM} {SAL}, {RL}, just arrived on foot in the drizzle, she holds {PAPER} against her chest, serene and firm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old woman with a grey braid')}. Slow push-in. No dialogue."),
 ("c04", D8("c04"), (talk("c04", "Remigia", ots(f"Close-up of {REM} {SAL0}, {RL}, holding {PAPER}, serene and severe", EVE_B, "RIGHT") + " " + MOUTH("Remigia", "Evelio"),
     "serene, severe, slow"),
   talk("c04", "Remigia", one(f"Close-up of {REM} {SAL}, {RL}, holding {PAPER}, serene and severe", "RIGHT"), "serene, severe, slow"))),
 ("i01", 6, f"Close-up insert {SAL0}: two old wrinkled dark hands unfold {PAPER} under the light drizzle, raindrops falling on it; only the hands and the paper, no face, no readable words. No dialogue."),
 ("c05", D8("c05"), (talk("c05", "Remigia", ots(f"Close-up of {REM} {SAL0}, {RL}, she holds up the open old paper, firm", LEO_B, "RIGHT") + " " + MOUTH("Remigia", "Leónidas"),
     "firm, slow, dignified"),
   talk("c05", "Remigia", one(f"Close-up of {REM} {SAL}, {RL}, she holds up the open old paper, firm", "RIGHT"), "firm, slow, dignified"))),
 # c06 grupo: Leónidas se burla del papel; Remigia y Atanasio a la izquierda
 ("c06", 6, (talk("c06", "Leónidas", f"Medium wide shot from the knees up {SAL0}: on the RIGHT {LEO} speaks, in front of the white pickup truck, scornful, he lifts his chin at the old paper; "
            f"on the LEFT {REM} holding {PAPER} and {ATA_B} beside her in three-quarter back view; only these three people, no extras. " + SPK("Leónidas"),
     "scornful, mocking"),
   talk("c06", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, scornful, he lifts his chin", "LEFT"), "scornful, mocking"))),
 ("c07", 6, (talk("c07", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, a calm half smile, he glances at the salt pools behind him", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, proud, dry"),
   talk("c07", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, a calm half smile, he glances at the salt pools behind him", "RIGHT"), "calm, proud, dry"))),
 # r2 grupo mudo: los salineros a lo lejos asienten, Leónidas mira alrededor
 ("r2", 6, (f"Medium wide shot from the knees up {SAL0}: on the LEFT {ATA} beside the old blue pickup truck and {REM} on his right holding {PAPER}; on the RIGHT {LEO_B} in three-quarter back view "
            f"in front of the white pickup truck, turning his head; far behind them, small and out of focus, a crowd of salt workers with empty hands stands still among the salt pools in the drizzle, nodding slowly; "
            f"no other people in the foreground. Slow push-in. " + MUTE,
   f"Medium shot of {LEO} {SAL}, {LR}, in silence, he looks around at the salt pools, worried, rain dripping from his fedora, "
           f"{gaze('LEFT')}; {ONE}; {ALONE}; {NODOUBLE('man in a straw fedora')}. Slow push-in. No dialogue.")),
 # 2. El villano y el traidor se culpan
 ("c08", 6, (talk("c08", "Leónidas", two(f"{LEO} on the LEFT in profile facing right and {EVE} on the RIGHT beside the open door of the white pickup truck in profile facing left, a meter apart {SAL0}, framed from the waist up; "
            f"Leónidas, furious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Leónidas", "Evelio"),
     "furious, cold"),
   talk("c08", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, furious, cold", "RIGHT"), "furious, cold"))),
 ("c09", D8("c09"), (talk("c09", "Evelio", ots(f"Close-up of {EVE} {SAL0}, {ER}, nervous and defensive, he pushes up his wet glasses", LEO_B, "LEFT") + " " + MOUTH("Evelio", "Leónidas"),
     "nervous, defensive"),
   talk("c09", "Evelio", one(f"Close-up of {EVE} {SAL}, {ER}, nervous and defensive, he pushes up his wet glasses", "LEFT"), "nervous, defensive"))),
 ("c10", 6, (talk("c10", "Xóchitl", ots(f"Close-up of {XOC} {SAL0}, {XL}, hurt, her eyes shine, rain in her short hair", EVE_B, "RIGHT") + " " + MOUTH("Xóchitl", "Evelio"),
     "hurt, disappointed"),
   talk("c10", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, hurt, her eyes shine, rain in her short hair", "RIGHT"), "hurt, disappointed"))),
 # c11 confesión con los ojos húmedos: single
 ("c11", D8("c11"), talk("c11", "Evelio", one(f"Close-up of {EVE} {SAL}, {ER}, his eyes shine behind his wet round glasses, ashamed, his voice low", "LEFT"),
     "ashamed, tired, sincere")),
 ("c12", D8("c12"), (talk("c12", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, sad and severe, he looks at his brother", EVE_B, "RIGHT") + " " + MOUTH("Atanasio", "Evelio"),
     "sad, severe, low"),
   talk("c12", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, sad and severe", "RIGHT"), "sad, severe, low"))),
 ("r3", 6, one(f"Close-up of {EVE} {SAL}, {ER}, in silence, raindrops on his round glasses, he lowers his head slowly, ashamed", "LEFT") + " Slow push-in. No dialogue."),
 # 3. Castigo del villano: plazo cumplido, la camioneta atascada, a pie por la playa
 ("c13", 6, (talk("c13", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, calm and final, he points his chin toward the dunes", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "calm, final, firm"),
   talk("c13", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, calm and final", "RIGHT"), "calm, final, firm"))),
 # c14: el villano pide ayuda (single)
 ("c14", 6, talk("c14", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, his arrogance cracks, mud on his shiny loafers, he glances back at his stuck truck", "LEFT"),
     "irritated, uneasy")),
 ("i02", 6, f"Close-up insert {SAL0}: the rear wheel of {WHITE} spins in the wet mud of the dike road, throwing mud, the truck does not move; no people, no letters, no license plate. No dialogue."),
 ("c15", 6, (talk("c15", "Xóchitl", ots(f"Close-up of {XOC} {SAL0}, {XL}, firm, she crosses her arms", LEO_B, "RIGHT") + " " + MOUTH("Xóchitl", "Leónidas"),
     "firm, dry"),
   talk("c15", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, firm, she crosses her arms", "RIGHT"), "firm, dry"))),
 ("c16", 6, (talk("c16", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, indignant, he looks down at his muddy loafers", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"),
     "indignant, offended"),
   talk("c16", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, indignant, he looks down at his muddy loafers", "LEFT"), "indignant, offended"))),
 ("c17", D8("c17"), (talk("c17", "Atanasio", ots(f"Close-up of {ATA} {SAL0}, {AL}, a dry ironic smile, he wipes the rain from his face with the white cloth from his neck", LEO_B, "RIGHT") + " " + MOUTH("Atanasio", "Leónidas"),
     "dry, ironic, calm"),
   talk("c17", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, a dry ironic smile, he wipes the rain from his face with the white cloth from his neck", "RIGHT"), "dry, ironic, calm"))),
 ("r4", 6, f"Medium shot {SAL}: {LEO_B} walks away along the muddy dike road toward the dunes in the drizzle, already in frame from the first frame, his shiny brown loafers sinking in the mud, "
           f"one hand holding his cream straw fedora on his head; the only person in the shot, {SOLO}. No dialogue."),
 # 4. Castigo del traidor: los costales, uno por uno
 ("c18", 6, (talk("c18", "Evelio", ots(f"Close-up of {EVE} {SAL0}, {ER}, pleading, his eyes shine, he takes off his wet glasses", ATA_B, "LEFT") + " " + MOUTH("Evelio", "Atanasio"),
     "pleading, ashamed"),
   talk("c18", "Evelio", one(f"Close-up of {EVE} {SAL}, {ER}, pleading, his eyes shine, he takes off his wet glasses", "LEFT"), "pleading, ashamed"))),
 ("c19", D8("c19"), (talk("c19", "Atanasio", two(f"{ATA} on the LEFT beside the old blue pickup truck in profile facing right and {EVE} on the RIGHT in profile facing left, a meter apart {SAL0}, framed from the waist up; "
            f"Atanasio, firm and sad, points at the white salt sacks in the truck, slightly closer to the camera and in sharper focus") + " " + MOUTH("Atanasio", "Evelio"),
     "firm, sad, final"),
   talk("c19", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, firm and sad", "RIGHT"), "firm, sad, final"))),
 # c20 protesta del traidor: single
 ("c20", 6, talk("c20", "Evelio", one(f"Close-up of {EVE} {SAL}, {ER}, surprised and tired, he looks up at the grey sky and the drizzle", "LEFT"),
     "surprised, tired, complaining")),
 ("c21", 6, (talk("c21", "Xóchitl", ots(f"Close-up of {XOC} {SAL0}, {XL}, firm, she lifts one salt sack from the pile and holds it out toward him", EVE_B, "RIGHT") + " " + MOUTH("Xóchitl", "Evelio"),
     "firm, a little ironic"),
   talk("c21", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, firm, she lifts one salt sack from the pile", "RIGHT"), "firm, a little ironic"))),
 # r5 two-shot mudo: Evelio carga un costal, Xóchitl lo mira desde la caja
 ("r5", 6, (two(f"{XOC} on the LEFT standing in the bed of {BLUE}, watching, arms crossed, and {EVE} on the RIGHT on the muddy dike road with one white woven salt sack on his shoulder, bent under the weight, "
            f"his glasses fogged {SAL0}, framed from the knees up") + " Slow push-in. " + MUTE,
   f"Medium shot of {EVE} {SAL}, on the RIGHT on the muddy dike road, one white woven salt sack on his shoulder, bent under the weight, his glasses fogged, humiliated, {SOLO}; {ALONE}. No dialogue.")),
 # 5. Cálida: Remigia, Atanasio y Xóchitl
 ("c22", 6, (talk("c22", "Remigia", f"Medium shot from the knees up {SAL0}: {XOC} on the left standing in the bed of the old blue pickup truck, {ATA} in the middle beside the tailgate, and {REM} on the right holding {PAPER}; "
            f"Remigia speaks to him, warm and wise, she pats his arm; only these three people, no extras. " + SPK("Remigia"),
     "warm, wise, slow"),
   talk("c22", "Remigia", one(f"Close-up of {REM} {SAL}, {RL}, warm and wise", "LEFT"), "warm, wise, slow"))),
 ("c23", D8("c23"), (talk("c23", "Atanasio", two(f"{XOC} on the LEFT standing in the bed of the old blue pickup truck and {ATA} on the RIGHT beside the tailgate, in profile facing each other {SAL0}, framed from the waist up; "
            f"Atanasio, tired and tender, looks up at his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Atanasio", "Xóchitl"),
     "tired, tender, wise"),
   talk("c23", "Atanasio", one(f"Close-up of {ATA} {SAL}, {AL}, tired and tender", "LEFT"), "tired, tender, wise"))),
 ("c24", 6, (talk("c24", "Xóchitl", ots(f"Close-up of {XOC} {SAL0}, {XL}, a small proud smile, rain in her short hair", ATA_B, "RIGHT") + " " + MOUTH("Xóchitl", "Atanasio"),
     "warm, proud, determined"),
   talk("c24", "Xóchitl", one(f"Close-up of {XOC} {SAL}, {XL}, a small proud smile, rain in her short hair", "RIGHT"), "warm, proud, determined"))),
 # 6. Gancho: Evelio solo en la caseta (single)
 ("c25", 6, talk("c25", "Evelio", one(f"Close-up of {EVE} {SHED}, alone, wet, he drops a white woven salt sack on the pile, catches his breath, then glances at the open doorway with a guilty secretive look", "RIGHT"),
     "low, whispering, secretive")),
 # CTA con carisma (después del BLACK): Atanasio solo en el bordo, a cámara
 ("c26", 10, talk("c26", "Atanasio", f"Close-up from the chest up of {ATA} {SAL0}, alone on the dike road in the light drizzle beside the old blue pickup truck, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a knowing little smile, makes a short pause, raises one eyebrow, "
     f"wipes the rain from his forehead with the white cloth from his neck, tilts his head, glances toward the salt pools, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"furious" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Su hermano me vendió este bordo con todo y lluvia.", "Su hermano me vendió este bordo."), ("Y hoy casi se la regalas a un fuereño.", "Y hoy casi la pierdes."),
        ("Mueva esa camioneta y váyase de Cuyutlán.", "Mueva esa camioneta, señor."), ("Aquí nadie empuja lo que vino a quitarnos.", "Aquí cada quien empuja lo suyo."),
        ("Mis abogados van a oír de usted.", "Ya veremos, viejo."), ("Usted me vendió puro aire, Evelio.", "Usted me engañó, Evelio."),
        ("Lo que mi hermano no sabe…", "Mi hermano no sabe…"), ("es quién me presentó a ese señor.", "quién me trajo a ese señor."),
        ("his arrogance cracks", "he hesitates"), ("he points his chin toward the dunes", "he looks toward the dunes"), ("he lifts his chin at the old paper", "he looks at the old paper"),
        ("bent under the weight", "walking slowly"), ("humiliated", "quiet"), ("secretive", "thoughtful"), ("whispering", "talking softly"), ("complaining", "tired"),
        ("disappointed", "sad"), ("scornful", "surprised"), ("ashamed", "quiet"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"), ("severe", "serious"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"), ("defiant", "confident"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, grey stormy light and a light drizzle over the salt pools of Cuyutlán, Colima, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, salt flats by the Pacific coast of Mexico under a light rain, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft grey daylight, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ATANASIO_VARELA}", "a thin wiry old Mexican man with short white curly hair, a faded sky-blue work shirt and a white cloth knotted around his neck"),
         ("@{XOCHITL_VARELA}", "a sturdy Mexican woman around thirty with short black hair cut at the jaw, a mustard-yellow t-shirt and denim overalls"),
         ("@{LEONIDAS_PAZOS}", "a tall heavy Mexican man in his fifties with a thin pencil mustache, a cream straw fedora and a black polo shirt"),
         ("@{EVELIO_VARELA}", "a short chubby Mexican man in his sixties, bald on top, with round wire glasses and a burgundy short-sleeve shirt"),
         ("@{REMIGIA_SOTELO}", "a small stooped very old Mexican woman with a long grey braid, a faded purple blouse and a black rebozo"),
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
    print("FIN P2", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()
