"""Genera los clips de pulsera-mexcaltitan-p2 PARTE 2 (La Pulsera del Estero · Parte 2, MAJESTIC STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca donde terminó la P1 (Arsenio es el padre de Maura y Tamara lo sabía; la lancha de las seis espera): desenlace del giro, Tamara corrió a Herlinda del muelle hace 24 años
y le dijo que Arsenio no quería saber nada; castigo: Tamara se va en la lancha de las seis y Arsenio pierde el mando del muelle (manda Maura) y remienda redes.
Copia del clips.py de costal-cuyutlan (encuadres de Atrium: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one; y todas sus defensas: gatito en imagen, reload_flow, new_project,
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
# Gancho 0-2 s (c01, Eustolia hablando, sin plano previo de objetos): en el muelle al caer el sol, la patrona le dice a su hijo "Ya dieron las seis, Arsenio. Y tu lancha te está esperando."
# (recordatorio breve del plazo invertido de la P1: "en esa te vas tú").
# Capas: Arsenio no sabía que tenía una hija (c02) -> "nunca preguntaste" (c03) -> Herlinda vino a este muelle hace 24 años (c04) -> una señora rubia no la dejó llegar (c06): desenlace del giro
# -> Tamara la mandó en la lancha de las seis (c10-c11) -> castigo 1: Tamara se va en esa lancha (c15-c17, i01, r2) -> castigo 2: Arsenio se queda pero ya no manda en el muelle, manda Maura,
# y remienda redes como Herlinda (c20-c21) -> "dime abuela" (c23) -> Arsenio pide ganarse que le diga papá (c25-c26) -> la cena de los tres (c27) -> CTA de Maura (c28).
# Herlinda Graciano (la madre de Maura) no sale: solo se nombra.
# Geografía fija (muelle, toda la escena): Arsenio y Tamara a la DERECHA, del lado de tierra junto a la fonda de palma (dentro del par: Arsenio a la izquierda, Tamara a su derecha);
# Maura y Eustolia a la IZQUIERDA, del lado del agua (dentro del par: Maura en la orilla, Eustolia a su derecha). La lancha de las seis espera al final del muelle, del lado del agua.
# Sin personajes nuevos (las 4 hojas y la locación de la P1). CTA (c28): Maura sola en el muelle, a cámara. Sin Navidad. Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
DOCK0 = ("on the old wooden dock of the small round island town of Mexcaltitán, Nayarit @{LOC_MUELLEMEXCAL} at sunset: weathered wooden planks, colorful low houses with red tile roofs behind, "
         "wooden canoes and white fiberglass boats tied along the dock, a palm-roof fonda at the land end of the dock, calm green-brown lagoon water and mangroves on the far shore under an orange sky; "
         "no readable text, no signs, no logos")
DOCK = DOCK0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
BRACELET = "a bracelet of tiny blue and yellow glass beads with a small white deer pattern"
BOAT = "a long white wooden lancha with a blue stripe and an outboard motor"
SIX = f"{BOAT} waiting empty at the far end of the dock with its motor running"
FAN = "a woven palm fan"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py). Solo Eustolia pelo plateado en chongo con flor de tulipán rojo y vestido azul marino bordado (figura de poder);
# solo Arsenio hombre robusto de barba negra corta y camisa de lino blanca; solo Tamara mujer rubia platinada de vestido rosa mexicano con abanico (villana de esta parte);
# solo Maura joven de pelo negro ondulado suelto, blusa turquesa y la pulsera de chaquira en la muñeca IZQUIERDA.
EUS = ("@{EUSTOLIA_LOMELI} (72-year-old Mexican woman, dark-brown wrinkled skin, tall and upright, silver hair in a low bun with a red hibiscus flower behind her right ear, gold hoop earrings, "
       "a navy-blue cotton dress with white embroidery at the neckline, brown leather sandals)")
ARS = ("@{ARSENIO_LOMELI} (47-year-old Mexican man, brown skin, heavyset, short black hair, a short black beard, a white linen shirt half unbuttoned, "
       "khaki trousers, brown leather sandals, a big gold ring on his right hand)")
TAM = ("@{TAMARA_LOMELI} (44-year-old Mexican woman, light skin, platinum-blonde wavy hair to the shoulders, big sunglasses pushed up on her head, "
       f"a hot-pink sleeveless dress, gold bangles, {FAN} in her right hand)")
MAU = ("@{MAURA_GRACIANO} (24-year-old Mexican woman, brown skin, slim, long wavy black hair worn loose, a faded turquoise cotton blouse, a long white skirt, brown sandals, "
       f"{BRACELET} on her LEFT wrist)")
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
# Bordes (geografía fija): Eustolia o Maura le hablan a Arsenio o a Tamara -> espalda de ellos en el borde RIGHT; Arsenio o Tamara le hablan a Eustolia o a Maura -> espalda de ellas en el borde LEFT;
# Arsenio le habla a Tamara -> espalda de Tamara en el borde RIGHT; Tamara le habla a Arsenio -> espalda de Arsenio en el borde LEFT;
# Eustolia le habla a Maura -> espalda de Maura en el borde LEFT; Maura le habla a Eustolia -> espalda de Eustolia en el borde RIGHT.
EUS_B = "@{EUSTOLIA_LOMELI} seen from behind (tall, silver hair in a low bun with a red hibiscus flower, navy-blue cotton dress)"
ARS_B = "@{ARSENIO_LOMELI} seen from behind (heavyset, short black hair, white linen shirt, khaki trousers)"
TAM_B = "@{TAMARA_LOMELI} seen from behind (platinum-blonde wavy hair to the shoulders with sunglasses on top, hot-pink sleeveless dress)"
MAU_B = "@{MAURA_GRACIANO} seen from behind (long wavy black hair worn loose, faded turquoise blouse, long white skirt)"
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

AR = "standing on the dock on the RIGHT, near the palm-roof fonda"                                # Arsenio
TR = "standing on the dock on the RIGHT beside the palm-roof fonda"                               # Tamara
ML = f"standing at the water edge of the dock on the LEFT, {BRACELET} on her LEFT wrist"          # Maura
EL = f"standing on the dock on the LEFT, {BOAT} tied behind her"                                  # Eustolia
SPK = lambda spk: f"Only {spk} speaks: {spk}'s lips move clearly with every word; everyone else stays silent the whole shot with closed mouths, only listening."

CLIPS = [
 # 1. Gancho (0-2 s): Eustolia YA hablando a su hijo; recordatorio breve del plazo invertido (la lancha de las seis).  OTS (Arsenio de espaldas, RIGHT)
 ("c01", 6, (talk("c01", "Eustolia", ots(f"Medium close-up of {EUS} {DOCK0}, {EL}, talking from the very first frame, firm and serene, she lifts her chin toward the end of the dock where {SIX}",
     ARS_B, "RIGHT") + " " + MOUTH("Eustolia", "Arsenio"), "firm, serene, final"),
   talk("c01", "Eustolia", one(f"Medium close-up of {EUS} {DOCK}, {EL}, talking from the very first frame, firm and serene, she lifts her chin toward the end of the dock", "RIGHT"), "firm, serene, final"))),
 ("c02", 6, (talk("c02", "Arsenio", ots(f"Close-up of {ARS} {DOCK0}, {AR}, desperate, he opens both hands toward his mother", EUS_B, "LEFT") + " " + MOUTH("Arsenio", "Eustolia"),
     "desperate, pleading"),
   talk("c02", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, desperate, he opens both hands", "LEFT"), "desperate, pleading"))),
 ("c03", D8("c03"), (talk("c03", "Eustolia", ots(f"Close-up of {EUS} {DOCK0}, {EL}, she shakes her head slowly, disappointed", ARS_B, "RIGHT") + " " + MOUTH("Eustolia", "Arsenio"),
     "disappointed, firm, slow"),
   talk("c03", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, she shakes her head slowly, disappointed", "RIGHT"), "disappointed, firm, slow"))),
 ("c04", 6, (talk("c04", "Maura", ots(f"Close-up of {MAU} {DOCK0}, {ML}, she holds her LEFT wrist with the bracelet, steady, her eyes shine", ARS_B, "RIGHT") + " " + MOUTH("Maura", "Arsenio"),
     "steady, hurt, dignified"),
   talk("c04", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, she holds her LEFT wrist with the bracelet, steady, her eyes shine", "RIGHT"), "steady, hurt, dignified"))),
 # c05 confesión de Arsenio: single
 ("c05", 6, talk("c05", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, he lowers his eyes, ashamed, rubbing the big gold ring on his right hand", "LEFT"),
     "ashamed, low")),
 ("c06", D8("c06"), (talk("c06", "Maura", two(f"{MAU} on the LEFT at the water edge in profile facing right and {ARS} on the RIGHT near the fonda in profile facing left, two meters apart on the dock {DOCK0}, "
            f"framed from the waist up; Maura, firm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Maura", "Arsenio"),
     "firm, accusing, hurt"),
   talk("c06", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, firm", "RIGHT"), "firm, accusing, hurt"))),
 # r1: Tamara deja de abanicarse (single mudo)
 ("r1", 6, one(f"Close-up of {TAM} {DOCK}, {TR}, in silence, her palm fan stops in mid-air, her face goes pale and she takes a small step back", "LEFT") + " Slow push-in. No dialogue."),
 # 2. Desenlace del giro: Tamara corrió a Herlinda del muelle
 ("c07", 6, (talk("c07", "Eustolia", ots(f"Close-up of {EUS} {DOCK0}, {EL}, she turns her head slowly toward the blonde woman, one eyebrow raised", TAM_B, "RIGHT") + " " + MOUTH("Eustolia", "Tamara"),
     "slow, ironic, severe"),
   talk("c07", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, she turns her head slowly, one eyebrow raised", "RIGHT"), "slow, ironic, severe"))),
 ("c08", 6, (talk("c08", "Tamara", ots(f"Close-up of {TAM} {DOCK0}, {TR}, she forces a nervous laugh and fans herself fast", EUS_B, "LEFT") + " " + MOUTH("Tamara", "Eustolia"),
     "nervous, dismissive"),
   talk("c08", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, she forces a nervous laugh and fans herself fast", "LEFT"), "nervous, dismissive"))),
 ("c09", D8("c09"), (talk("c09", "Maura", two(f"{MAU} on the LEFT at the water edge in profile facing right and {TAM} on the RIGHT beside the fonda in profile facing left, two meters apart on the dock {DOCK0}, "
            f"framed from the waist up; Maura, her eyes shining, slightly closer to the camera and in sharper focus") + " " + MOUTH("Maura", "Tamara"),
     "hurt, firm"),
   talk("c09", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, her eyes shining, firm", "RIGHT"), "hurt, firm"))),
 ("c10", 6, (talk("c10", "Arsenio", two(f"{ARS} on the LEFT and {TAM} on the RIGHT beside the fonda, in profile facing each other a meter apart on the dock {DOCK0}, framed from the waist up; "
            f"Arsenio turns to his wife, stunned, slightly closer to the camera and in sharper focus") + " " + MOUTH("Arsenio", "Tamara"),
     "stunned, hurt"),
   talk("c10", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, stunned", "RIGHT"), "stunned, hurt"))),
 ("c11", 6, (talk("c11", "Tamara", ots(f"Close-up of {TAM} {DOCK0}, {TR}, she drops the act, cold and resentful", ARS_B, "LEFT") + " " + MOUTH("Tamara", "Arsenio"),
     "cold, resentful"),
   talk("c11", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, she drops the act, cold and resentful", "LEFT"), "cold, resentful"))),
 ("c12", 6, (talk("c12", "Arsenio", ots(f"Close-up of {ARS} {DOCK0}, {AR}, his voice breaks, his eyes shine", TAM_B, "RIGHT") + " " + MOUTH("Arsenio", "Tamara"),
     "hurt, breaking"),
   talk("c12", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, his voice breaks, his eyes shine", "RIGHT"), "hurt, breaking"))),
 ("c13", 6, (talk("c13", "Tamara", ots(f"Close-up of {TAM} {DOCK0}, {TR}, she points her fan at him, defensive", ARS_B, "LEFT") + " " + MOUTH("Tamara", "Arsenio"),
     "defensive, sharp"),
   talk("c13", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, she points her fan, defensive", "LEFT"), "defensive, sharp"))),
 # c14 llanto: single
 ("c14", 6, talk("c14", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, her eyes fill with tears, she holds the bracelet on her LEFT wrist against her chest", "RIGHT"),
     "sad, crying softly")),
 # 3. Castigo: Tamara se va en la lancha de las seis.  c15 grupo (los cuatro)
 ("c15", 6, (talk("c15", "Eustolia", f"Medium wide shot from the knees up on the dock {DOCK0}: on the LEFT {EUS} speaks, upright and final, looking at the blonde woman, {MAU} beside her at the water edge; "
            f"on the RIGHT {ARS} and {TAM} by the palm-roof fonda; {SIX} in the background; only these four people, no extras. " + SPK("Eustolia"),
     "firm, final, slow"),
   talk("c15", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, upright and final", "RIGHT"), "firm, final, slow"))),
 ("c16", 6, (talk("c16", "Tamara", ots(f"Close-up of {TAM} {DOCK0}, {TR}, offended, she clutches her fan to her chest", EUS_B, "LEFT") + " " + MOUTH("Tamara", "Eustolia"),
     "offended, indignant"),
   talk("c16", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, offended, she clutches her fan to her chest", "LEFT"), "offended, indignant"))),
 ("c17", 6, (talk("c17", "Eustolia", ots(f"Close-up of {EUS} {DOCK0}, {EL}, calm and severe, she does not blink", TAM_B, "RIGHT") + " " + MOUTH("Eustolia", "Tamara"),
     "calm, severe, final"),
   talk("c17", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, calm and severe, she does not blink", "RIGHT"), "calm, severe, final"))),
 ("c18", 6, (talk("c18", "Tamara", ots(f"Close-up of {TAM} {DOCK0}, {TR}, she leans toward the young woman with a poisonous smile", MAU_B, "LEFT") + " " + MOUTH("Tamara", "Maura"),
     "venomous, low"),
   talk("c18", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, a poisonous smile", "LEFT"), "venomous, low"))),
 ("i01", 6, f"Close-up insert on the weathered planks of the dock {DOCK0}: a hand with gold bangles lets {FAN} fall onto the planks at sunset; only the hand, the bangles and the fan, no face, no letters. No dialogue."),
 ("r2", 6, f"Wide shot along the old wooden dock {DOCK}: {TAM} walks away alone toward {SIX}, seen from behind, then stops, turns her head and looks back over her shoulder, cold and resentful; "
           f"nobody else on the dock. Slow push-in. No dialogue."),
 # 4. Castigo de Arsenio: se queda, pero ya no manda en el muelle
 ("c19", 6, (talk("c19", "Arsenio", ots(f"Close-up of {ARS} {DOCK0}, {AR}, worried, he glances at the waiting boat", EUS_B, "LEFT") + " " + MOUTH("Arsenio", "Eustolia"),
     "worried, quiet"),
   talk("c19", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, worried, he glances at the waiting boat", "LEFT"), "worried, quiet"))),
 # c20 grupo: Eustolia habla, Maura a su lado, Arsenio enfrente
 ("c20", D8("c20"), (talk("c20", "Eustolia", f"Medium wide shot from the knees up on the dock {DOCK0}: on the LEFT {EUS} speaks, firm, she puts a hand on the shoulder of {MAU} beside her at the water edge; "
            f"on the RIGHT {ARS} near the fonda, listening, head down; only these three people, no extras. " + SPK("Eustolia"),
     "firm, proud"),
   talk("c20", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, firm and proud", "RIGHT"), "firm, proud"))),
 ("c21", 6, (talk("c21", "Eustolia", ots(f"Close-up of {EUS} {DOCK0}, {EL}, a dry half smile", ARS_B, "RIGHT") + " " + MOUTH("Eustolia", "Arsenio"),
     "dry, firm, a little ironic"),
   talk("c21", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, a dry half smile", "RIGHT"), "dry, firm, a little ironic"))),
 # 5. Reconocimiento (cálida)
 ("c22", 6, (talk("c22", "Maura", two(f"{MAU} on the LEFT at the water edge and {EUS} on the RIGHT beside her, in profile facing each other very close on the dock {DOCK0}, framed from the waist up; "
            f"Maura, surprised and shy, slightly closer to the camera and in sharper focus") + " " + MOUTH("Maura", "Eustolia"),
     "surprised, shy"),
   talk("c22", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, surprised and shy", "RIGHT"), "surprised, shy"))),
 ("c23", D8("c23"), (talk("c23", "Eustolia", ots(f"Close-up of {EUS} {DOCK0}, {EL}, tender, she takes the young woman's hand", MAU_B, "LEFT") + " " + MOUTH("Eustolia", "Maura"),
     "tender, warm, firm"),
   talk("c23", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, tender and warm", "LEFT"), "tender, warm, firm"))),
 # c24 emoción: single
 ("c24", 6, talk("c24", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, she smiles through shining eyes", "RIGHT"),
     "moved, soft, emotional")),
 ("c25", 6, (talk("c25", "Arsenio", ots(f"Close-up of {ARS} {DOCK0}, {AR}, humble, he takes one small step toward her", MAU_B, "LEFT") + " " + MOUTH("Arsenio", "Maura"),
     "humble, sincere"),
   talk("c25", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, humble, he takes one small step forward", "LEFT"), "humble, sincere"))),
 ("c26", 6, (talk("c26", "Maura", ots(f"Close-up of {MAU} {DOCK0}, {ML}, a small firm smile", ARS_B, "RIGHT") + " " + MOUTH("Maura", "Arsenio"),
     "firm, warm, a little playful"),
   talk("c26", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, a small firm smile", "RIGHT"), "firm, warm, a little playful"))),
 ("r3", 6, one(f"Close-up of {ARS} {DOCK}, {AR}, in silence, he nods slowly with wet eyes and a small grateful smile", "LEFT") + " Slow push-in. No dialogue."),
 # c27 grupo: los tres, Eustolia habla
 ("c27", 6, (talk("c27", "Eustolia", f"Medium shot from the knees up on the dock {DOCK0}: on the LEFT {MAU} at the water edge and {EUS} beside her, smiling; on the RIGHT {ARS} near the fonda, "
            f"Eustolia speaks with warm humor; only these three people, no extras. " + SPK("Eustolia"),
     "warm, playful, firm"),
   talk("c27", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, warm humor, smiling", "RIGHT"), "warm, playful, firm"))),
 # CTA con carisma (después del BLACK): Maura sola en el muelle, a cámara
 ("c28", 10, talk("c28", "Maura", f"Close-up from the chest up of {MAU} {DOCK0}, alone at the water edge, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a small knowing smile, makes a short pause, raises one eyebrow, "
     f"touches the bracelet on her LEFT wrist, tucks her hair behind her ear, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Se fue porque la corrieron.", "Se fue porque la alejaron."), ("Esa remendadora te iba a quitar de mi lado.", "Esa mujer te iba a alejar de mí."),
        ("Me quitaste a mi hija, Tamara.", "Me alejaste de mi hija, Tamara."), ("Y hoy casi la corro yo también.", "Y hoy casi la pierdo otra vez."),
        ("¿Me va a correr como a una arrimada?", "¿Me va a sacar así, suegra?"), ("Y no vuelvas a pisar mi isla.", "Y que te vaya bien."),
        ("Disfrútalo mientras dure, muchacha.", "Ya veremos, muchacha."), ("Esta isla no te quiere.", "Ya veremos."),
        ("Y a mi familia nadie la tira al agua.", "Y a mi familia nadie la trata así."),
        ("she points her fan at him", "she holds her fan"), ("she points her fan", "she holds her fan"), ("she drops the act, ", ""), ("poisonous", "thin"), ("venomous", "quiet"),
        ("desperate", "worried"), ("resentful", "serious"), ("accusing", "serious"), ("sharp", "clear"), ("severe", "serious"), ("stunned", "surprised"), ("breaking", "low"),
        ("disappointed", "serious"), ("dismissive", "calm"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm sunset light on an old wooden dock of the island of Mexcaltitán, Nayarit, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, fishing dock on a lagoon island in Mexico at sunset, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft orange light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EUSTOLIA_LOMELI}", "a tall old Mexican woman with silver hair in a low bun, a red hibiscus flower behind her ear and a navy-blue embroidered dress"),
         ("@{ARSENIO_LOMELI}", "a heavyset Mexican man in his forties with short black hair, a short black beard and a white linen shirt"),
         ("@{TAMARA_LOMELI}", "a Mexican woman in her forties with platinum-blonde wavy hair, sunglasses on her head and a hot-pink sleeveless dress"),
         ("@{MAURA_GRACIANO}", "a slim Mexican woman in her twenties with long wavy black hair worn loose, a faded turquoise blouse and a long white skirt"),
         (" @{LOC_MUELLEMEXCAL}", "")]
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
